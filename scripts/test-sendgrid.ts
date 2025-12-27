
import sendgrid from '@sendgrid/mail';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env') });

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'n.umurerwa@alustudent.com';

console.log('Testing SendGrid...');
console.log(`API Key present: ${!!apiKey}`);
console.log(`Sending FROM: ${fromEmail}`);

if (!apiKey) {
    console.error('ERROR: SENDGRID_API_KEY is missing.');
    process.exit(1);
}

sendgrid.setApiKey(apiKey);

const msg = {
    to: 'test@example.com', // Dummy address
    from: fromEmail,
    subject: 'Test Email from AEON Debugger',
    text: 'If you receive this, SendGrid is working!',
};

sendgrid.send(msg)
    .then(() => {
        console.log('✅ Email sent successfully!');
    })
    .catch((error) => {
        console.error('❌ Email sending failed.');
        console.error(`Status Code: ${error.code}`);
        if (error.response) {
            console.error('full error body:');
            console.log(JSON.stringify(error.response.body, null, 2));
        } else {
            console.error(error.message);
        }
    });
