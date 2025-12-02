import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Groq service for Llama Scout model

// Available Groq models
export const GROQ_MODELS = [
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', description: 'Multimodal & Efficient' }
];

/**
 * Truncate text to fit within Groq's rate limits
 * Llama Scout has 30k tokens/minute limit
 * Approximately 3 characters per token, so ~20k characters for safety
 */
function truncateText(text, maxLength = 20000) {
    if (text.length > maxLength) {
        console.warn(`Text truncated from ${text.length} to ${maxLength} characters to fit within Groq rate limits`);
        return text.substring(0, maxLength);
    }
    return text;
}

/**
 * Extract JSON from LLM response that may contain markdown or extra text
 */
function extractJSON(text) {
    // Try to find JSON in code blocks first
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1]);
    }

    // Try to find JSON object directly
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    // If no JSON found, throw error
    throw new Error('No valid JSON found in response');
}

/**
 * Transcribe audio using Groq Whisper
 */
export async function transcribeAudio(audioBuffer, filename = 'audio.mp3') {
    try {
        const file = new File([audioBuffer], filename, {
            type: 'audio/mpeg'
        });

        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: 'whisper-large-v3-turbo',
            response_format: 'json',
            language: 'en',
            temperature: 0.0
        });

        return {
            success: true,
            text: transcription.text,
            source: 'groq-whisper'
        };
    } catch (error) {
        console.error('Groq Whisper failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate completion using Llama Scout
 */
export async function generateCompletion(prompt, model = 'meta-llama/llama-4-scout-17b-16e-instruct', customApiKey) {
    try {
        // Use custom API key if provided, otherwise use default
        const groqClient = customApiKey ? new Groq({ apiKey: customApiKey }) : groq;

        const completion = await groqClient.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: model,
            temperature: 0.3,
            max_tokens: 4096
        });

        const content = completion.choices[0]?.message?.content || '';

        return {
            success: true,
            content: content,
            model: model
        };
    } catch (error) {
        console.error('Groq LLM failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate summary from text
 */
export async function generateSummary(text, model, customApiKey) {
    const prompt = `You are an expert summarizer. Analyze the following text and provide a comprehensive summary.

Write a clear, well-structured summary that covers all the main points, key ideas, and important takeaways from the text. Make it detailed enough to be useful for studying.

IMPORTANT: Write the summary as a single continuous paragraph without line breaks. Use spaces to separate sentences.

Respond with ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "summary": "Your comprehensive summary here as a single paragraph..."
}

TEXT:
${truncateText(text)}`;

    const result = await generateCompletion(prompt, model, customApiKey);
    if (!result.success) return result;

    try {
        const parsed = extractJSON(result.content);
        return {
            success: true,
            content: JSON.stringify(parsed),
            model: result.model
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to parse summary JSON: ${error.message}`
        };
    }
}

/**
 * Generate student-friendly notes from text
 */
export async function generateNotes(text, model, customApiKey) {
    const prompt = `You are an expert educator. Create comprehensive study notes from the following text.

Respond with ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "definitions": [{"term": "example", "meaning": "definition here"}],
  "concepts": ["concept 1", "concept 2"],
  "bulletNotes": ["note 1", "note 2", "note 3"],
  "terminology": [{"word": "word", "definition": "meaning"}],
  "examples": ["example 1", "example 2"],
  "formulas": []
}

TEXT:
${truncateText(text)}`;

    const result = await generateCompletion(prompt, model, customApiKey);
    if (!result.success) return result;

    try {
        const parsed = extractJSON(result.content);
        return {
            success: true,
            content: JSON.stringify(parsed),
            model: result.model
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to parse notes JSON: ${error.message}`
        };
    }
}

/**
 * Generate key points for quick revision
 */
export async function generateKeyPoints(text, model, customApiKey) {
    const prompt = `Extract 10-15 bite-sized key points from the following text. Each point should be one concise sentence.

Respond with ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "keyPoints": ["point 1", "point 2", "point 3"]
}

TEXT:
${truncateText(text)}`;

    const result = await generateCompletion(prompt, model, customApiKey);
    if (!result.success) return result;

    try {
        const parsed = extractJSON(result.content);
        return {
            success: true,
            content: JSON.stringify(parsed),
            model: result.model
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to parse key points JSON: ${error.message}`
        };
    }
}

/**
 * Generate MCQ quiz from text
 */
export async function generateQuiz(text, model, customApiKey) {
    const prompt = `Create 10 multiple-choice questions based on the following text.

Respond with ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "questions": [
    {
      "question": "What is X?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "A",
      "explanation": "Brief explanation"
    }
  ]
}

TEXT:
${truncateText(text)}`;

    const result = await generateCompletion(prompt, model, customApiKey);
    if (!result.success) return result;

    try {
        const parsed = extractJSON(result.content);
        return {
            success: true,
            content: JSON.stringify(parsed),
            model: result.model
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to parse quiz JSON: ${error.message}`
        };
    }
}
