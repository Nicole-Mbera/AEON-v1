import client from '../lib/db/index';

async function updatePricesTo60() {
    console.log('Starting price update from $30 to $60...');

    try {
        // Update all teachers with 3000 fee to 6000
        const result = await client.execute({
            sql: 'UPDATE teachers SET monthly_fee = 6000 WHERE monthly_fee = 3000',
            args: []
        });

        console.log(`Updated ${result.rowsAffected} teachers from $30 to $60.`);

        // Also ensure any NULL fees are set to 6000
        const resultNull = await client.execute({
            sql: 'UPDATE teachers SET monthly_fee = 6000 WHERE monthly_fee IS NULL',
            args: []
        });

        console.log(`Updated ${resultNull.rowsAffected} teachers with NULL fee to $60.`);

    } catch (error) {
        console.error('Update failed:', error);
    }
}

updatePricesTo60();
