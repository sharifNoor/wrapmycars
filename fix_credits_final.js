const mysql = require('D:/1Products/CarModification/backend/node_modules/mysql2/promise');
require('D:/1Products/CarModification/backend/node_modules/dotenv').config({ path: 'D:/1Products/CarModification/backend/.env' });

async function fixCredits() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        const userId = 6;
        const targetCredits = 121; // 1 starting + 120 from plan

        await pool.query('UPDATE users SET credits = ? WHERE id = ?', [targetCredits, userId]);
        await pool.query(
            `INSERT INTO credit_transactions (user_id, type, amount, balance_after, metadata)
       VALUES (?, 'adjustment', 70, ?, ?)`,
            [userId, targetCredits, JSON.stringify({ reason: 'subscription_quota_alignment' })]
        );

        console.log(`✅ Successfully aligned user ${userId} to ${targetCredits} credits.`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

fixCredits();
