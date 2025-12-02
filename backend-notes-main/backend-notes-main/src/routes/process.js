import {
    generateSummary,
    generateNotes,
    generateKeyPoints,
    generateQuiz,
    GROQ_MODELS
} from '../services/groqService.js';

export default async function processRoutes(fastify, options) {

    // Get available models
    fastify.get('/models', async (request, reply) => {
        return {
            models: GROQ_MODELS
        };
    });

    // Process text to generate selected study materials
    fastify.post('/', async (request, reply) => {
        try {
            const { text, model = 'meta-llama/llama-4-scout-17b-16e-instruct', materialTypes = ['summary', 'notes', 'keyPoints', 'quiz'] } = request.body;
            const customApiKey = request.headers['x-groq-api-key'];

            if (!text || text.trim().length === 0) {
                return reply.code(400).send({ error: 'No text provided' });
            }

            // Validate model
            const validModel = GROQ_MODELS.find(m => m.id === model);
            if (!validModel) {
                return reply.code(400).send({
                    error: 'Invalid model',
                    validModels: GROQ_MODELS.map(m => m.id)
                });
            }

            // Generate only selected materials in parallel
            const generationTasks = {};
            if (materialTypes.includes('summary')) {
                generationTasks.summary = generateSummary(text, model, customApiKey);
            }
            if (materialTypes.includes('notes')) {
                generationTasks.notes = generateNotes(text, model, customApiKey);
            }
            if (materialTypes.includes('keyPoints')) {
                generationTasks.keyPoints = generateKeyPoints(text, model, customApiKey);
            }
            if (materialTypes.includes('quiz')) {
                generationTasks.quiz = generateQuiz(text, model, customApiKey);
            }

            const results = await Promise.all(
                Object.entries(generationTasks).map(async ([key, promise]) => ({
                    key,
                    result: await promise
                }))
            );

            // Check for failures
            const failures = results.filter(r => !r.result.success).map(r => r.key);
            if (failures.length > 0) {
                // Log detailed error information
                results.forEach(r => {
                    if (!r.result.success) {
                        fastify.log.error(`Failed to generate ${r.key}: ${r.result.error}`);
                    }
                });
                return reply.code(500).send({
                    error: 'Failed to generate some materials',
                    failures: failures,
                    details: results.filter(r => !r.result.success).map(r => ({
                        type: r.key,
                        error: r.result.error
                    }))
                });
            }

            // Parse JSON responses
            const data = {};
            try {
                for (const { key, result } of results) {
                    data[key] = JSON.parse(result.content);
                }
            } catch (parseError) {
                return reply.code(500).send({
                    error: 'Failed to parse AI responses',
                    details: parseError.message
                });
            }

            return {
                success: true,
                model: model,
                data: data,
                transcription: request.body.transcription || null  // Include transcription if provided
            };

        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Processing failed',
                details: error.message
            });
        }
    });
}
