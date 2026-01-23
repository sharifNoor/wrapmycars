import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

class NotificationService {
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
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log('Authorization status:', authStatus);
                await messaging().registerDeviceForRemoteMessages();
                await this.getToken();
                await this.subscribeToMarketing();
            }
        }
    }

    async getToken() {
        try {
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
                console.log('FCM Token:', fcmToken);
                // Here you would typically send the token to your server
                // to associate it with the current user.
            }
        } catch (error) {
            console.log('Error getting FCM token:', error);
        }
    }

    async subscribeToMarketing() {
        try {
            await messaging().subscribeToTopic('marketing');
            console.log('Subscribed to marketing topic');
        } catch (error) {
            console.log('Error subscribing to marketing topic:', error);
        }
    }

    async createNotificationListeners() {
        // Foreground message handler
        this.foregroundListener = messaging().onMessage(async remoteMessage => {
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
        messaging()
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
        this.onNotificationOpenedAppListener = messaging().onNotificationOpenedApp(remoteMessage => {
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
