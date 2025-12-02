import { getYouTubeTranscript, isValidYouTubeUrl } from '../services/youtubeService.js';

export default async function youtubeRoutes(fastify, options) {

    // Extract transcript from YouTube URL
    fastify.post('/transcript', async (request, reply) => {
        try {
            console.log('=== YouTube Transcript Request ===');
            console.log('Headers:', request.headers);
            console.log('Body:', request.body);
            console.log('Body type:', typeof request.body);

            const { url } = request.body || {};

            if (!url || url.trim().length === 0) {
                console.log('ERROR: No URL provided');
                return reply.code(400).send({ error: 'No YouTube URL provided' });
            }

            // Validate YouTube URL
            if (!isValidYouTubeUrl(url)) {
                return reply.code(400).send({
                    error: 'Invalid YouTube URL',
                    details: 'Please provide a valid YouTube video URL or video ID'
                });
            }

            // Fetch transcript
            const result = await getYouTubeTranscript(url);

            if (!result.success) {
                return reply.code(400).send({
                    error: result.error,
                    details: result.details
                });
            }

            return {
                success: true,
                text: result.text,
                source: result.source,
                metadata: {
                    videoId: result.videoId,
                    ...result.metadata
                }
            };

        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                error: 'YouTube transcript extraction failed',
                details: error.message
            });
        }
    });
}
