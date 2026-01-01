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

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();

    const handleSendCode = async () => {
        if (!email) {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'Please enter your email address',
            });
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            // Navigate to VerifyResetOtp with email
            navigation.navigate('VerifyResetOtp', { email });
        } catch (err) {
            console.warn(err?.response?.data || err.message);
            showAlert({
                type: 'error',
                title: 'Error',
                message: err?.response?.data?.message ?? 'Failed to send code',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={theme.gradients.midnight}
            style={styles.background}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </TouchableOpacity>

                        <Text style={styles.heading}>Forgot Password</Text>
                        <Text style={styles.sub}>Enter your email to receive a reset code</Text>

                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={theme.colors.textDim}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <Button
                            title={loading ? 'Sending...' : 'Send Code'}
                            onPress={handleSendCode}
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
    backBtn: {
        alignSelf: 'flex-start',
        marginBottom: 10
    }
});
