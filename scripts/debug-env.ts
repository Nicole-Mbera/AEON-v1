
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

console.log('--- Debugging Environment Variables ---');
console.log(`Current Working Directory: ${process.cwd()}`);

const envPath = path.resolve(process.cwd(), '.env');
console.log(`Looking for .env at: ${envPath}`);

if (fs.existsSync(envPath)) {
    console.log('✅ .env file found.');

    // Read raw file to check for formatting issues
    const rawContent = fs.readFileSync(envPath, 'utf8');
    console.log('--- Raw File Analysis ---');
    const lines = rawContent.split('\n');

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        // Check for TURSO variables specifically
        if (trimmed.includes('TURSO')) {
            console.log(`Line ${index + 1}: Found line containing "TURSO"`);

            // Check for common issues
            if (trimmed.includes(' =')) console.warn('   ⚠️ Warning: Space before "=" detected.');
            if (trimmed.includes('= ')) console.warn('   ⚠️ Warning: Space after "=" detected.');

            const parts = trimmed.split('=');
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();

            console.log(`   Parsed Key:   "${key}" (Length: ${key.length})`);
            console.log(`   Value Status: ${value ? 'Present' : 'Empty'} (Starts with: "${value.substring(0, 3)}...")`);

            if (key !== 'TURSO_DATABASE_URL' && key !== 'TURSO_AUTH_TOKEN') {
                console.warn(`   ⚠️ Warning: Key name might have hidden characters or typo vs expected "TURSO_DATABASE_URL" or "TURSO_AUTH_TOKEN"`);
            }
        }
    });

    // Test dotenv loading
    const config = dotenv.config();
    if (config.error) {
        console.error('❌ dotenv.config() reported an error:', config.error);
    } else {
        console.log('--- dotenv.config() Result ---');
        console.log(`TURSO_DATABASE_URL loaded? ${process.env.TURSO_DATABASE_URL ? 'YES' : 'NO'}`);
        console.log(`TURSO_AUTH_TOKEN loaded?   ${process.env.TURSO_AUTH_TOKEN ? 'YES' : 'NO'}`);
    }

} else {
    console.error('❌ .env file NOT found in this directory.');
}
