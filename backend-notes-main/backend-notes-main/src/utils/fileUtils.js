import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Save uploaded file to disk
 */
export async function saveFile(data, filename) {
    const uploadsDir = join(__dirname, '../../uploads');
    const filepath = join(uploadsDir, filename);

    await pipeline(data.file, createWriteStream(filepath));

    return filepath;
}

/**
 * Delete file from disk
 */
export async function deleteFile(filepath) {
    try {
        await unlink(filepath);
        return true;
    } catch (error) {
        console.error('Failed to delete file:', error.message);
        return false;
    }
}

/**
 * Validate file type
 */
export function validateFileType(mimetype, allowedTypes) {
    return allowedTypes.some(type => mimetype.includes(type));
}

/**
 * Get file extension from mimetype
 */
export function getExtensionFromMimetype(mimetype) {
    const mimeMap = {
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'audio/x-m4a': 'm4a',
        'application/pdf': 'pdf',
        'text/plain': 'txt'
    };

    return mimeMap[mimetype] || 'unknown';
}
