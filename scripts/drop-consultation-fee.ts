import client from '../lib/db/index';

async function removeConsultationFee() {
    console.log('Checking for consultation_fee column...');

    try {
        const info = await client.execute({
            sql: "PRAGMA table_info(teachers)",
            args: []
        });
        console.table(info.rows);

        // attempt drop; SQLite 3.35+ supports it
        try {
            await client.execute('ALTER TABLE teachers DROP COLUMN consultation_fee');
            console.log('Dropped consultation_fee column from teachers');
        } catch (err: any) {
            console.warn('Could not drop column (maybe SQLite version < 3.35 or column missing):', err.message);
        }
    } catch (err) {
        console.error('Error checking table info:', err);
    }
}

removeConsultationFee();
