
import client from '../lib/db/index';

async function fixMonthlyFees() {
    console.log('Starting monthly fee fix...');

    try {
        // Update all teachers with 20000 fee to 3000
        const result = await client.execute({
            sql: 'UPDATE teachers SET monthly_fee = 3000 WHERE monthly_fee = 20000',
            args: []
        });

        console.log(`Updated ${result.rowsAffected} teachers from $200 to $30.`);

        // Also ensure any NULL fees are set to 3000 (just in case)
        const resultNull = await client.execute({
            sql: 'UPDATE teachers SET monthly_fee = 3000 WHERE monthly_fee IS NULL',
            args: []
        });

        console.log(`Updated ${resultNull.rowsAffected} teachers with NULL fee to $30.`);

    } catch (error) {
        console.error('Fix failed:', error);
    }
}

fixMonthlyFees();
