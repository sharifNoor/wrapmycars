const Stripe = require('D:/1Products/CarModification/backend/node_modules/stripe');
require('D:/1Products/CarModification/backend/node_modules/dotenv').config({ path: 'D:/1Products/CarModification/backend/.env' });

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function checkPrice() {
    try {
        const priceId = 'price_1Sr4MYCVl0h0gHG1ppmbW2o2';
        const price = await stripe.prices.retrieve(priceId);
        console.log('--- PRICE DETAILS ---');
        console.log(JSON.stringify(price, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

checkPrice();
