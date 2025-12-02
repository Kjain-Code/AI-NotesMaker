import { readFile } from 'fs/promises';
import { transcribeAudio } from '../services/groqService.js';
import { extractTextFromPDF, extractTextFromFile } from '../services/extractionService.js';
import { saveFile, deleteFile, validateFileType, getExtensionFromMimetype } from '../utils/fileUtils.js';

export default async function uploadRoutes(fastify, options) {

    // Upload and process file
    fastify.post('/', async (request, reply) => {
        try {
            const data = await request.file();

            if (!data) {
                return reply.code(400).send({ error: 'No file uploaded' });
            }

            const { mimetype, filename } = data;

            // Validate file type
            const allowedTypes = ['audio', 'pdf', 'text'];
            if (!validateFileType(mimetype, allowedTypes)) {
                return reply.code(400).send({
                    error: 'Invalid file type. Allowed: audio (mp3, wav, m4a), PDF, text'
                });
            }

            // Save file temporarily
            const timestamp = Date.now();
            const ext = getExtensionFromMimetype(mimetype);
            const savedFilename = `${timestamp}_${filename}`;
            const filepath = await saveFile(data, savedFilename);

            // Read file buffer
            const buffer = await readFile(filepath);

            let extractedText = '';
            let source = '';
            let metadata = {};

            // Process based on file type
            if (mimetype.includes('audio')) {
                // Transcribe audio
                const transcription = await transcribeAudio(buffer, savedFilename);

                if (!transcription.success) {
                    // TODO: Implement local whisper fallback here
                    await deleteFile(filepath);
                    return reply.code(500).send({
                        error: 'Audio transcription failed',
                        details: transcription.error
                    });
                }

                extractedText = transcription.text;
                source = transcription.source;

            } else if (mimetype.includes('pdf')) {
                // Extract from PDF
                const extraction = await extractTextFromPDF(buffer);

                if (!extraction.success) {
                    await deleteFile(filepath);
                    return reply.code(500).send({
                        error: 'PDF extraction failed',
                        details: extraction.error
                    });
                }

                extractedText = extraction.text;
                source = 'pdfjs-dist';
                metadata.pages = extraction.pages;

            } else {
                // Extract from text file
                const extraction = extractTextFromFile(buffer);

                if (!extraction.success) {
                    await deleteFile(filepath);
                    return reply.code(500).send({
                        error: 'Text extraction failed',
                        details: extraction.error
                    });
                }

                extractedText = extraction.text;
                source = 'text-file';
            }

            // Clean up file
            await deleteFile(filepath);

            return {
                success: true,
                text: extractedText,
                source: source,
                metadata: metadata,
                filename: filename
            };

        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Upload processing failed',
                details: error.message
            });
        }
    });

    // Upload text directly (no file)
    fastify.post('/text', async (request, reply) => {
        try {
            const { text } = request.body;

            if (!text || text.trim().length === 0) {
                return reply.code(400).send({ error: 'No text provided' });
            }

            return {
                success: true,
                text: text,
                source: 'direct-input'
            };

        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'Text processing failed',
                details: error.message
            });
        }
    });
}
