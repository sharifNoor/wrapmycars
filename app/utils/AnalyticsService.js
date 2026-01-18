import { getAnalytics, logEvent, logSignUp, logLogin, logPurchase, setUserId, setUserProperty } from '@react-native-firebase/analytics';

class AnalyticsService {
    constructor() {
        this.analytics = getAnalytics();
    }

    /**
     * Log a custom event
     * @param {string} eventName 
     * @param {Object} params 
     */
    async logEvent(eventName, params = {}) {
        try {
            await logEvent(this.analytics, eventName, params);
            console.log(`Analytics Event Logged: ${eventName}`, params);
        } catch (error) {
            console.error(`Error logging event ${eventName}:`, error);
        }
    }

    /**
     * Log User Sign Up
     * @param {string} method - 'email', 'google', etc.
     */
    async logSignUp(method) {
        try {
            await logSignUp(this.analytics, { method });
            console.log(`Analytics Sign Up Logged: ${method}`);
        } catch (error) {
            console.error('Error logging sign up:', error);
        }
    }

    /**
     * Log User Login
     * @param {string} method - 'email', 'google', etc.
     */
    async logLogin(method) {
        try {
            await logLogin(this.analytics, { method });
            console.log(`Analytics Login Logged: ${method}`);
        } catch (error) {
            console.error('Error logging login:', error);
        }
    }

    /**
     * Log Purchase/Credits Purchase
     * @param {number} value - Total value of purchase
     * @param {string} transactionId - Stripe Payment Intent ID or similar
     * @param {string} currency - e.g. 'USD'
     */
    async logPurchase(value, transactionId, currency = 'USD') {
        try {
            await logPurchase(this.analytics, {
                value,
                currency,
                transaction_id: transactionId,
                items: [{
                    item_id: 'credits_pack',
                    item_name: 'Credits Package',
                    price: value,
                    quantity: 1
                }]
            });
            console.log(`Analytics Purchase Logged: $${value} ${currency} (ID: ${transactionId})`);
        } catch (error) {
            console.error('Error logging purchase:', error);
        }
    }

    /**
     * Log Start of Checkout
     * @param {number} value 
     * @param {string} pkgName 
     */
    async logBeginCheckout(value, pkgName) {
        try {
            await logEvent(this.analytics, 'begin_checkout', {
                value,
                currency: 'USD',
                items: [{
                    item_id: pkgName,
                    item_name: pkgName,
                    price: value,
                    quantity: 1
                }]
            });
            console.log(`Analytics Begin Checkout Logged: ${pkgName} ($${value})`);
        } catch (error) {
            console.error('Error logging begin checkout:', error);
        }
    }

    /**
     * Log View Item (Package)
     * @param {string} itemName 
     */
    async logViewItem(itemName) {
        try {
            await logEvent(this.analytics, 'view_item', {
                items: [{
                    item_id: itemName,
                    item_name: itemName,
                }]
            });
            console.log(`Analytics View Item Logged: ${itemName}`);
        } catch (error) {
            console.error('Error logging view item:', error);
        }
    }

    /**
     * Set User ID
     * @param {string} id 
     */
    async setUserId(id) {
        try {
            await setUserId(this.analytics, id);
        } catch (error) {
            console.error('Error setting user ID:', error);
        }
    }

    /**
     * Set User Property
     * @param {string} name 
     * @param {string} value 
     */
    async setUserProperty(name, value) {
        try {
            await setUserProperty(this.analytics, name, value);
        } catch (error) {
            console.error('Error setting user property:', error);
        }
    }
}

export const analyticsService = new AnalyticsService();
