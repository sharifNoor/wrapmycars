const mysql = require('D:/1Products/CarModification/backend/node_modules/mysql2/promise');
require('D:/1Products/CarModification/backend/node_modules/dotenv').config({ path: 'D:/1Products/CarModification/backend/.env' });

async function checkStatus() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        const [users] = await pool.query('SELECT id, email, credits FROM users');
        console.log('\n--- USERS ---');
        console.table(users);

        const [subs] = await pool.query('SELECT user_id, status, plan, current_period_end FROM subscriptions');
        console.log('\n--- SUBSCRIPTIONS ---');
        console.table(subs);

        const [txs] = await pool.query('SELECT * FROM credit_transactions ORDER BY created_at DESC LIMIT 5');
        console.log('\n--- RECENT TRANSACTIONS ---');
        console.table(txs);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

checkStatus();
