import React, { useState, useContext } from 'react';
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

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, googleLogin } = useContext(AuthContext);
    const { showAlert } = useAlert();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;
            await analyticsService.logLogin('email');
            await login({ token, user });
        } catch (err) {
            console.warn(err?.response?.data || err.message);
            showAlert({
                type: 'error',
                title: 'Login Failed',
                message: err?.response?.data?.message ?? 'Login failed',
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
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <Text style={styles.heading}>Welcome Back</Text>
                        <Text style={styles.sub}>Login to continue</Text>

                        {/* EMAIL */}
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

                        {/* PASSWORD */}
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

                        {/* Forgot Password Link */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={{ alignSelf: 'flex-end', marginBottom: 20 }}
                        >
                            <Text style={{ color: theme.colors.textDim, fontSize: 14 }}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* BUTTON */}
                        <Button
                            title={loading ? 'Logging in...' : 'Login'}
                            onPress={handleLogin}
                            disabled={loading}
                            style={{ marginTop: 10 }}
                        />

                        <TouchableOpacity
                            onPress={googleLogin}
                            style={styles.googleBtn}
                        >
                            <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.googleBtnText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {/* LINK */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Register')}
                            style={{ marginTop: 18 }}
                        >
                            <Text style={styles.link}>Create account</Text>
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
        fontSize: 32,
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
        textAlign: 'center',
        marginTop: 18,
    },
    googleBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 30, // Pill shape
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
