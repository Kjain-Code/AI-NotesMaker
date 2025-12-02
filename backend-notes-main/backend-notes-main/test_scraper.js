
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { getSubtitles } = require('youtube-caption-scraper');

async function testScraper() {
    const videoId = 'dQw4w9WgXcQ';
    console.log('Testing youtube-caption-scraper with ID:', videoId);

    try {
        const subtitles = await getSubtitles({
            videoID: videoId,
            lang: 'en'
        });

        console.log('Success!');
        console.log('Length:', subtitles.length);
        if (subtitles.length > 0) {
            console.log('First segment:', subtitles[0]);
        }
    } catch (error) {
        console.error('Scraper Error:', error);
    }
}

testScraper();
