import analytics from '@react-native-firebase/analytics';

class AnalyticsService {
    /**
     * Log a custom event
     * @param {string} eventName 
     * @param {Object} params 
     */
    async logEvent(eventName, params = {}) {
        try {
            await analytics().logEvent(eventName, params);
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
        await analytics().logSignUp({ method });
    }

    /**
     * Log User Login
     * @param {string} method - 'email', 'google', etc.
     */
    async logLogin(method) {
        await analytics().logLogin({ method });
    }

    /**
     * Log Purchase/Credits Purchase
     * @param {number} value - Total value of purchase
     * @param {string} currency - e.g. 'USD'
     */
    async logPurchase(value, currency = 'USD') {
        await analytics().logPurchase({
            value,
            currency,
        });
    }

    /**
     * Set User ID
     * @param {string} id 
     */
    async setUserId(id) {
        await analytics().setUserId(id);
    }

    /**
     * Set User Property
     * @param {string} name 
     * @param {string} value 
     */
    async setUserProperty(name, value) {
        await analytics().setUserProperty(name, value);
    }
}

export const analyticsService = new AnalyticsService();
