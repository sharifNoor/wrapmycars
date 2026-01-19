const mysql = require('D:/1Products/CarModification/backend/node_modules/mysql2/promise');
require('D:/1Products/CarModification/backend/node_modules/dotenv').config({ path: 'D:/1Products/CarModification/backend/.env' });

async function grantCredits() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        const userId = 6; // sharifnoor742743284@gmail.com
        const creditsToGrant = 50;

        const [rows] = await pool.query('SELECT credits FROM users WHERE id = ?', [userId]);
        const currentCredits = rows[0].credits;
        const newCredits = currentCredits + creditsToGrant;

        await pool.query('UPDATE users SET credits = ? WHERE id = ?', [newCredits, userId]);
        await pool.query(
            `INSERT INTO credit_transactions (user_id, type, amount, balance_after, metadata)
       VALUES (?, 'adjustment', ?, ?, ?)`,
            [userId, creditsToGrant, newCredits, JSON.stringify({ reason: 'manual_fix_subscription_credits' })]
        );

        console.log(`✅ Successfully granted ${creditsToGrant} credits to user ${userId}. New balance: ${newCredits}`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

grantCredits();
