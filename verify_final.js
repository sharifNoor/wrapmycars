const mysql = require('D:/1Products/CarModification/backend/node_modules/mysql2/promise');
require('D:/1Products/CarModification/backend/node_modules/dotenv').config({ path: 'D:/1Products/CarModification/backend/.env' });

async function verify() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        const [userRows] = await pool.query('SELECT id, email, credits FROM users WHERE id = 6');
        console.log('\n--- TARGET USER STATUS ---');
        console.table(userRows);

        const [subRows] = await pool.query('SELECT status, plan FROM subscriptions WHERE user_id = 6');
        console.log('\n--- TARGET SUBSCRIPTION STATUS ---');
        console.table(subRows);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

verify();
