import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Extract YouTube video ID from various URL formats
 */
function extractVideoId(url) {
    // Handle various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Validate if a string is a valid YouTube URL or video ID
 */
export function isValidYouTubeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return extractVideoId(url.trim()) !== null;
}

/**
 * Fetch transcript from YouTube video using Python youtube-transcript-api
 */
export async function getYouTubeTranscript(url) {
    try {
        const videoId = extractVideoId(url.trim());

        if (!videoId) {
            return {
                success: false,
                error: 'Invalid YouTube URL or video ID'
            };
        }

        // Call Python CLI using python -m to ensure it's in PATH
        // We use --format json to get structured data
        const command = `python -m youtube_transcript_api ${videoId} --format json`;

        const { stdout, stderr } = await execAsync(command, {
            shell: 'powershell.exe',
            windowsHide: true
        });

        if (!stdout) {
            return {
                success: false,
                error: 'No transcript available',
                details: stderr
            };
        }

        let transcriptData = JSON.parse(stdout);

        // youtube_transcript_api returns a list of transcripts (one per video ID)
        // So for a single video, it returns [[{text, start, duration}, ...]]
        if (Array.isArray(transcriptData) && Array.isArray(transcriptData[0])) {
            transcriptData = transcriptData[0];
        }

        if (!transcriptData || transcriptData.length === 0) {
            return {
                success: false,
                error: 'No transcript available for this video'
            };
        }

        // Combine all transcript segments into single text
        const fullText = transcriptData.map(item => item.text).join(' ');

        return {
            success: true,
            text: fullText,
            videoId: videoId,
            source: 'youtube-transcript-api (python)',
            metadata: {
                segments: transcriptData.length,
                duration: transcriptData[transcriptData.length - 1]?.start + transcriptData[transcriptData.length - 1]?.duration || 0
            }
        };

    } catch (error) {
        console.error('YouTube transcript extraction failed:', error.message);

        // Provide more specific error messages based on stderr or error message
        let errorMessage = 'Failed to fetch transcript';
        const errorStr = error.message || '';

        if (errorStr.includes('TranscriptsDisabled')) {
            errorMessage = 'Transcript/captions are disabled for this video';
        } else if (errorStr.includes('VideoUnavailable')) {
            errorMessage = 'Video not found or is private';
        } else if (errorStr.includes('TooManyRequests')) {
            errorMessage = 'Rate limit exceeded, please try again later';
        } else if (errorStr.includes('NoTranscriptFound')) {
            errorMessage = 'No transcript found for this video (no captions)';
        }

        return {
            success: false,
            error: errorMessage,
            details: error.message
        };
    }
}
