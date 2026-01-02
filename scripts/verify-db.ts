
import db from '../lib/db';
import dotenv from 'dotenv';
dotenv.config();

async function verifyConnection() {
    const url = process.env.TURSO_DATABASE_URL;

    console.log('--- URL DEBUG ---');
    if (!url) {
        console.log('URL is undefined/empty');
    } else {
        // Check first few chars to identify protocol
        const protocol = url.split('://')[0];
        console.log(`Protocol detected: "${protocol}"`);
        console.log(`Starts with quote? ${url.startsWith('"') || url.startsWith("'") ? 'YES' : 'NO'}`);
    }

    // Allow https as cloud too
    const isCloud = url && (
        url.startsWith('libsql://') ||
        url.startsWith('wss://') ||
        url.startsWith('https://')
    );

    console.log(`Classified as: ${isCloud ? 'CLOUD' : 'LOCAL'}`);

    try {
        await db.execute('SELECT 1');
        console.log('Connection: SUCCESS');
    } catch (error: any) {
        console.log(`Connection: FAILED (${error.message})`);
    }
}

verifyConnection();
