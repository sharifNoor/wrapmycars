import React, { useState, useContext, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import api from '../../api/api';
import { AuthContext } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import Button from '../../components/Button';
import { theme } from '../../constants/theme';
import { analyticsService } from '../../utils/AnalyticsService';

export default function VerifyEmailScreen({ route, navigation }) {
    const { email, password } = route.params || {};
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const { showAlert } = useAlert();
    const [timer, setTimer] = useState(0);
    const [resending, setResending] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Focus functionality for OTP inputs
    const handleOtpChange = (text, index) => {
        // Handle Paste
        if (text.length > 1) {
            const cleanText = text.trim().replace(/[^0-9]/g, '').slice(0, 6);
            if (cleanText.length > 0) {
                const newOtp = [...otp];
                const pasteData = cleanText.split('');

                // If pasted into index 0, fill from start. If pasted elsewhere, fill from there.
                // Usually users paste into the first box.
                for (let i = 0; i < pasteData.length; i++) {
                    if (index + i < 6) {
                        newOtp[index + i] = pasteData[i];
                    }
                }
                setOtp(newOtp);

                // Focus the appropriate field
                const nextFocusIndex = Math.min(index + pasteData.length, 5);
                inputRefs.current[nextFocusIndex].focus();
                return;
            }
        }

        const newOtp = [...otp];
        newOtp[index] = text.slice(-1); // Always take the last character typed
        setOtp(newOtp);

        if (text && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleBackspace = (text, index) => {
        if (!text && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    }


    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            showAlert({
                type: 'error',
                title: 'Invalid Code',
                message: 'Please enter a valid 6-digit code',
            });
            return;
        }

        setLoading(true);
        try {
            // 1. Verify Email
            const res = await api.post('/auth/verify-email', { email, otp: otpCode });

            // 2. If successful, we expect the backend to return token/user OR we might need to login manually
            // Assuming it returns token/user like register/login did, or we use the password we have to login

            if (res.data?.token) {
                const { token, user } = res.data;
                await analyticsService.logSignUp('email');
                await login({ token, user });
            } else {
                // Fallback if backend doesn't return token on verify, try explicit login
                const loginRes = await api.post('/auth/login', { email, password });
                const { token, user } = loginRes.data;
                await analyticsService.logSignUp('email');
                await login({ token, user });
            }

        } catch (err) {
            console.warn(err);
            showAlert({
                type: 'error',
                title: 'Verification Failed',
                message: err?.response?.data?.message || 'Verification failed',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setResending(true);
        try {
            await api.post('/auth/resend-verification', { email });
            setTimer(60);
            showAlert({
                type: 'success',
                title: 'Code Resent',
                message: 'A new verification code has been sent to your email.',
            });
        } catch (err) {
            console.warn(err);
            showAlert({
                type: 'error',
                title: 'Error',
                message: err?.response?.data?.message || 'Failed to resend verification code',
            });
        } finally {
            setResending(false);
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
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </TouchableOpacity>

                        <Text style={styles.heading}>Verify Email</Text>
                        <Text style={styles.sub}>
                            We sent a code to <Text style={{ fontWeight: 'bold' }}>{email}</Text>
                        </Text>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                    style={styles.otpInput}
                                    keyboardType="number-pad"
                                    maxLength={6} // Allow pasting
                                    value={digit}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === 'Backspace') {
                                            handleBackspace(digit, index)
                                        }
                                    }}
                                    placeholderTextColor={theme.colors.textDim}
                                />
                            ))}
                        </View>

                        <Button
                            title={loading ? 'Verifying...' : 'Verify'}
                            onPress={handleVerify}
                            disabled={loading}
                            gradientColors={theme.gradients.sunset}
                            style={{ marginTop: 24 }}
                        />

                        <TouchableOpacity
                            onPress={handleResend}
                            disabled={resending || timer > 0}
                            style={styles.resendBtn}
                        >
                            <Text style={[
                                styles.resendText,
                                (resending || timer > 0) && { color: theme.colors.textDim }
                            ]}>
                                {resending ? 'Resending...' : timer > 0 ? `Resend Code (${timer}s)` : 'Resend Code'}
                            </Text>
                        </TouchableOpacity>
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
        marginBottom: 30,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: theme.colors.text,
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    backBtn: {
        alignSelf: 'flex-start',
        marginBottom: 10
    },
    link: {
        color: theme.colors.text,
        textAlign: 'center',
        fontSize: 14
    },
    resendBtn: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendText: {
        color: theme.colors.primary,
        fontSize: 15,
        fontWeight: '600',
    }
});
