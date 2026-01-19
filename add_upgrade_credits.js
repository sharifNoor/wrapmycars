const mysql = require('D:/1Products/CarModification/backend/node_modules/mysql2/promise');
require('D:/1Products/CarModification/backend/node_modules/dotenv').config({ path: 'D:/1Products/CarModification/backend/.env' });

async function addUpgradeCredits() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        const userId = 6; // Your user ID
        const creditsToAdd = 400; // Credits for the 400/month plan

        // Get current credits
        const [users] = await pool.query('SELECT credits FROM users WHERE id = ?', [userId]);
        const currentCredits = users[0].credits;
        const newTotal = currentCredits + creditsToAdd;

        // Update credits
        await pool.query('UPDATE users SET credits = ? WHERE id = ?', [newTotal, userId]);

        // Record transaction
        await pool.query(
            `INSERT INTO credit_transactions (user_id, type, amount, balance_after, metadata)
             VALUES (?, 'purchase', ?, ?, ?)`,
            [userId, creditsToAdd, newTotal, JSON.stringify({ reason: 'manual_upgrade_grant', plan: '400_credits_monthly' })]
        );

        console.log(`✅ Successfully added ${creditsToAdd} credits to user ${userId}`);
        console.log(`   Previous: ${currentCredits} → New: ${newTotal}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        process.exit();
    }
}

addUpgradeCredits();
