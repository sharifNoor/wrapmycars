import analytics from '@react-native-firebase/analytics';

class AnalyticsService {
    constructor() {
        this.analytics = analytics();
    }

    /**
     * Helper to ensure value is a number for Firebase
     */
    _parseValue(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // Strip currency symbols and commas
            const cleaned = value.replace(/[^0-9.]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }

    /**
     * Log a custom event
     */
    async logEvent(eventName, params = {}) {
        try {
            const processedParams = { ...params };
            if (processedParams.value) processedParams.value = this._parseValue(processedParams.value);

            await this.analytics.logEvent(eventName, processedParams);
            console.log(`Analytics Event Logged: ${eventName}`, processedParams);
        } catch (error) {
            console.error(`Error logging event ${eventName}:`, error);
        }
    }

    /**
     * Log User Sign Up
     */
    async logSignUp(method) {
        try {
            await this.analytics.logSignUp({ method });
            console.log(`Analytics Sign Up Logged: ${method}`);
        } catch (error) {
            console.error('Error logging sign up:', error);
        }
    }

    /**
     * Log User Login
     */
    async logLogin(method) {
        try {
            await this.analytics.logLogin({ method });
            console.log(`Analytics Login Logged: ${method}`);
        } catch (error) {
            console.error('Error logging login:', error);
        }
    }

    /**
     * Log Purchase/Credits Purchase
     */
    async logPurchase(value, transactionId, currency = 'USD') {
        try {
            const numValue = this._parseValue(value);
            await this.analytics.logPurchase({
                value: numValue,
                currency,
                transaction_id: transactionId,
                items: [{
                    item_id: 'credits_pack',
                    item_name: 'Credits Package',
                    price: numValue,
                    quantity: 1
                }]
            });
            console.log(`Analytics Purchase Logged: $${numValue} ${currency} (ID: ${transactionId})`);
        } catch (error) {
            console.error('Error logging purchase:', error);
        }
    }

    /**
     * Log Start of Checkout
     */
    async logBeginCheckout(value, pkgName) {
        try {
            const numValue = this._parseValue(value);
            await this.analytics.logBeginCheckout({
                value: numValue,
                currency: 'USD',
                items: [{
                    item_id: pkgName,
                    item_name: pkgName,
                    price: numValue,
                    quantity: 1
                }]
            });
            console.log(`Analytics Begin Checkout Logged: ${pkgName} ($${numValue})`);
        } catch (error) {
            console.error('Error logging begin checkout:', error);
        }
    }

    /**
     * Log View Item (Package)
     */
    async logViewItem(itemName) {
        try {
            await this.analytics.logViewItem({
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
     */
    async setUserId(id) {
        try {
            await this.analytics.setUserId(id);
        } catch (error) {
            console.error('Error setting user ID:', error);
        }
    }

    /**
     * Set User Property
     */
    async setUserProperty(name, value) {
        try {
            await this.analytics.setUserProperty(name, value);
        } catch (error) {
            console.error('Error setting user property:', error);
        }
    }
}

export const analyticsService = new AnalyticsService();
