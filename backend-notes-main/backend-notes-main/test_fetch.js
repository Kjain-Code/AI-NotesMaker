
import fs from 'fs';

async function testFetch() {
    // Test general fetch
    try {
        const google = await fetch('https://www.google.com');
        console.log('Google Status:', google.status);
    } catch (e) {
        console.error('Google fetch failed:', e);
    }

    const videoId = 'dQw4w9WgXcQ';
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log('Fetching:', url);

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    try {
        const response = await fetch(url, { headers });
        const text = await response.text();

        const match = text.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
        if (match && match[1]) {
            const json = JSON.parse(match[1]);
            const captions = json.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (captions && captions.length > 0) {
                const captionUrl = captions[0].baseUrl;
                console.log('Caption URL:', captionUrl);
                fs.writeFileSync('caption_url.txt', captionUrl);

                const transcriptRes = await fetch(captionUrl, { headers });
                console.log('Transcript Status:', transcriptRes.status);
                const transcriptText = await transcriptRes.text();
                console.log('Transcript length:', transcriptText.length);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testFetch();
