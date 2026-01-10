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
        } catch (error) {
            console.error('Error logging login:', error);
        }
    }

    /**
     * Log Purchase/Credits Purchase
     * @param {number} value - Total value of purchase
     * @param {string} currency - e.g. 'USD'
     */
    async logPurchase(value, currency = 'USD') {
        try {
            await logPurchase(this.analytics, {
                value,
                currency,
            });
        } catch (error) {
            console.error('Error logging purchase:', error);
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
