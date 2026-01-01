import React, { createContext, useState, useContext } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { theme } from '../constants/theme';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const showAlert = ({
        title,
        message,
        type = 'info', // 'success', 'error', 'info', 'confirm'
        buttons = [],
        onDismiss,
    }) => {
        const id = Date.now().toString();
        const newAlert = {
            id,
            title,
            message,
            type,
            buttons: buttons.length > 0 ? buttons : [{ text: 'OK', onPress: () => dismissAlert(id) }],
            onDismiss,
        };
        setAlerts((prev) => [...prev, newAlert]);
    };

    const dismissAlert = (id) => {
        setAlerts((prev) => {
            const alert = prev.find((a) => a.id === id);
            if (alert?.onDismiss) alert.onDismiss();
            return prev.filter((a) => a.id !== id);
        });
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {alerts.map((alert) => (
                <CustomAlert
                    key={alert.id}
                    {...alert}
                    onClose={() => dismissAlert(alert.id)}
                />
            ))}
        </AlertContext.Provider>
    );
};

const CustomAlert = ({ id, title, message, type, buttons, onClose }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return { name: 'checkmark-circle', color: theme.colors.success };
            case 'error':
                return { name: 'close-circle', color: theme.colors.error };
            case 'confirm':
                return { name: 'help-circle', color: '#FBB03B' };
            default:
                return { name: 'information-circle', color: theme.colors.secondary };
        }
    };

    const icon = getIcon();

    return (
        <Modal transparent visible animationType="none">
            <View style={styles.backdrop}>
                <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.7)', opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={handleClose}
                    />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.alertContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['#1a1a2e03', '#0f0c29']}
                        style={styles.alertCard}
                    >
                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <Ionicons name={icon.name} size={56} color={icon.color} />
                        </View>

                        {/* Title */}
                        {title && <Text style={styles.title}>{title}</Text>}

                        {/* Message */}
                        {message && <Text style={styles.message}>{message}</Text>}

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            {buttons.map((button, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        handleClose();
                                        if (button.onPress) button.onPress();
                                    }}
                                    style={[
                                        styles.button,
                                        buttons.length === 1 && styles.buttonSingle,
                                        button.style === 'cancel' && styles.buttonCancel,
                                    ]}
                                >
                                    <LinearGradient
                                        colors={
                                            button.style === 'cancel'
                                                ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                                                : theme.gradients.sunset
                                        }
                                        style={styles.buttonGradient}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                button.style === 'cancel' && styles.buttonTextCancel,
                                            ]}
                                        >
                                            {button.text}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: Dimensions.get('window').width - 60,
        maxWidth: 400,
    },
    alertCard: {
        borderRadius: 24,
        padding: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    button: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonSingle: {
        flex: 1,
    },
    buttonCancel: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonTextCancel: {
        color: theme.colors.textDim,
    },
});
