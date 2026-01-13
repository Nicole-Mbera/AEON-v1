
import client from '../lib/db/index';

async function updateFees() {
    console.log('Updating all teachers to $30 monthly fee...');

    try {
        await client.execute('UPDATE teachers SET monthly_fee = 3000');
        console.log('Update complete.');
    } catch (error) {
        console.error('Update failed:', error);
    }
}

updateFees();
