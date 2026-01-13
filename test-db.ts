
import client from './lib/db';

async function checkConnection() {
    console.log('Testing DB connection...');
    try {
        const start = Date.now();
        await client.execute('SELECT 1');
        console.log(`Connection successful in ${Date.now() - start}ms`);
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

checkConnection();
