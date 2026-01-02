// app/screens/auth/RegisterScreen.js
import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
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

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, googleLogin } = useContext(AuthContext);
    const { showAlert } = useAlert();

    const handleRegister = async () => {
        setLoading(true);
        try {
            await api.post('/auth/register', { name, email, password });
            await analyticsService.logSignUp('email');
            // Navigate to VerifyEmail, passing necessary details
            navigation.navigate('VerifyEmail', { email, password });
        } catch (err) {
            console.warn(err?.response?.data || err.message);
            showAlert({
                type: 'error',
                title: 'Registration Failed',
                message: err?.response?.data?.message ?? 'Register failed',
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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Glass Card */}
                    <View style={styles.card}>
                        <Text style={styles.heading}>Create Account</Text>
                        <Text style={styles.sub}>Start your journey with us</Text>

                        {/* Input: Full Name */}
                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.input}
                                placeholder="Full name"
                                placeholderTextColor={theme.colors.textDim}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* Input: Email */}
                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={theme.colors.textDim}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Input: Password */}
                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={theme.colors.textDim}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <Ionicons
                                onPress={() => setShowPassword(!showPassword)}
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={24}
                                color="#fff"
                                style={styles.iconAbsolute} />
                        </View>

                        {/* CTA */}
                        <Button
                            title={loading ? 'Creating...' : 'Register'}
                            onPress={handleRegister}
                            disabled={loading}
                            gradientColors={theme.gradients.sunset}
                            style={{ marginTop: 10 }}
                        />

                        <TouchableOpacity
                            onPress={googleLogin}
                            style={styles.googleBtn}
                        >
                            <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.googleBtnText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* Back to Login */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ marginTop: 18 }}
                        >
                            <Text style={styles.link}>Already have an account? Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: theme.colors.cardBackground,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    heading: {
        fontSize: 30,
        fontWeight: '700',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 4,
    },
    sub: {
        fontSize: 15,
        color: theme.colors.textDim,
        marginBottom: 26,
        textAlign: 'center',
    },
    inputWrap: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        marginBottom: 12,
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
    },
    link: {
        color: theme.colors.text,
        fontSize: 15,
        fontWeight: '500',
        marginTop: 18,
        textAlign: 'center'
    },
    googleBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    googleBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
