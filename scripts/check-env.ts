
import dotenv from 'dotenv';
dotenv.config();

console.log('Checking environment variables...');
const key = process.env.SENDGRID_API_KEY;

if (key) {
    console.log(`SENDGRID_API_KEY found. Length: ${key.length}`);
    if (key.startsWith('SG.')) {
        console.log('Key format looks correct (starts with SG.)');
    } else {
        console.log('WARNING: Key does not start with "SG.". SendGrid keys usually start with SG.');
    }
} else {
    console.log('SENDGRID_API_KEY is NOT set or is empty.');
}
