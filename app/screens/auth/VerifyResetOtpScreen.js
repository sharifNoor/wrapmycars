import React, { useState, useRef } from 'react';
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

export default function VerifyResetOtpScreen({ route, navigation }) {
    const { email } = route.params || {};
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();
    const inputRefs = useRef([]);

    const handleOtpChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
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
            const res = await api.post('/auth/verify-reset-otp', { email, otp: otpCode });
            // Returns: { "resetToken": "long_secure_hex_string" }
            const { resetToken } = res.data;

            navigation.navigate('ResetPassword', { token: resetToken });
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

                        <Text style={styles.heading}>Verify Reset Code</Text>
                        <Text style={styles.sub}>
                            Enter the code sent to <Text style={{ fontWeight: 'bold' }}>{email}</Text>
                        </Text>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                    style={styles.otpInput}
                                    keyboardType="number-pad"
                                    maxLength={1}
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
    }
});
