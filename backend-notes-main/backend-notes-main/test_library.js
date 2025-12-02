
import { YoutubeTranscript } from 'youtube-transcript';

async function testLibrary() {
    const videoId = 'dQw4w9WgXcQ'; // Rick Roll
    console.log('Testing youtube-transcript with ID:', videoId);

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log('Type:', typeof transcript);
        console.log('Is Array:', Array.isArray(transcript));
        console.log('Length:', transcript ? transcript.length : 'N/A');
        if (transcript && transcript.length > 0) {
            console.log('First segment:', transcript[0]);
        } else {
            console.log('Full result:', JSON.stringify(transcript, null, 2));
        }
    } catch (error) {
        console.error('Library Error:', error);
    }
}

testLibrary();
