import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import api from '../../api/api';
import { useAlert } from '../../contexts/AlertContext';
import Button from '../../components/Button';
import { theme } from '../../constants/theme';

export default function ResetPasswordScreen({ route, navigation }) {
    const { token } = route.params || {};
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();

    const handleReset = async () => {
        if (!newPassword || !confirmPassword) {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'Please fill in all fields',
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'Passwords do not match',
            });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword
            });
            showAlert({
                type: 'success',
                title: 'Success',
                message: 'Password has been reset successfully',
                buttons: [
                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                ]
            });
        } catch (err) {
            console.warn(err);
            showAlert({
                type: 'error',
                title: 'Error',
                message: err?.response?.data?.message || 'Reset failed',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={theme.gradients.midnight} style={styles.background}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <Text style={styles.heading}>Reset Password</Text>
                        <Text style={styles.sub}>Enter your new password below</Text>

                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.input}
                                placeholder="New Password"
                                placeholderTextColor={theme.colors.textDim}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNew}
                            />
                            <Ionicons
                                onPress={() => setShowNew(!showNew)}
                                name={showNew ? "eye-off-outline" : "eye-outline"}
                                size={24}
                                color="#fff"
                                style={styles.iconAbsolute}
                            />
                        </View>

                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor={theme.colors.textDim}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirm}
                            />
                            <Ionicons
                                onPress={() => setShowConfirm(!showConfirm)}
                                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                                size={24}
                                color="#fff"
                                style={styles.iconAbsolute}
                            />
                        </View>

                        <Button
                            title={loading ? 'Resetting...' : 'Reset Password'}
                            onPress={handleReset}
                            disabled={loading}
                            gradientColors={theme.gradients.sunset}
                            style={{ marginTop: 10 }}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    card: {
        backgroundColor: theme.colors.cardBackground,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    heading: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    sub: {
        fontSize: 15,
        color: theme.colors.textDim,
        textAlign: 'center',
        marginBottom: 20,
    },
    inputWrap: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: theme.colors.text,
    },
    iconAbsolute: {
        marginRight: 12
    }
});
