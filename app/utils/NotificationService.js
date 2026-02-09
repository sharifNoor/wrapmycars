import firebaseMessaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

class NotificationService {
    constructor() {
        this.messaging = firebaseMessaging();
    }

    async requestUserPermission() {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Notification permission granted');
                await this.getToken();
                await this.subscribeToMarketing();
            } else {
                console.log('Notification permission denied');
            }
        } else {
            const authStatus = await this.messaging.requestPermission();
            const enabled =
                authStatus === firebaseMessaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === firebaseMessaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log('Authorization status:', authStatus);
                await this.messaging.registerDeviceForRemoteMessages();
                await this.getToken();
                await this.subscribeToMarketing();
            }
        }
    }

    async getToken() {
        try {
            const fcmToken = await this.messaging.getToken();
            if (fcmToken) {
                console.log('FCM Token:', fcmToken);
            }
        } catch (error) {
            console.log('Error getting FCM token:', error);
        }
    }

    async subscribeToMarketing() {
        try {
            await this.messaging.subscribeToTopic('marketing');
            console.log('Subscribed to marketing topic');
        } catch (error) {
            console.log('Error subscribing to marketing topic:', error);
        }
    }

    async createNotificationListeners() {
        // Foreground message handler
        this.foregroundListener = this.messaging.onMessage(async remoteMessage => {
            console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

            const { notification } = remoteMessage;
            if (notification) {
                Alert.alert(
                    notification.title || 'New Notification',
                    notification.body || '',
                    [{ text: 'OK' }]
                );
            }
        });

        // Check if app was opened from a quit state via a notification
        this.messaging
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log(
                        'Notification caused app to open from quit state:',
                        remoteMessage.notification,
                    );
                }
            });

        // Notification opened app from background state
        this.onNotificationOpenedAppListener = this.messaging.onNotificationOpenedApp(remoteMessage => {
            console.log(
                'Notification caused app to open from background state:',
                remoteMessage.notification,
            );
        });
    }

    removeListeners() {
        if (this.foregroundListener) this.foregroundListener();
        if (this.onNotificationOpenedAppListener) this.onNotificationOpenedAppListener();
    }
}

export const notificationService = new NotificationService();
