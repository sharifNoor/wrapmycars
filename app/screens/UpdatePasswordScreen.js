// app/screens/UpdatePasswordScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import api from '../api/api';
import Button from '../components/Button';
import { AuthContext } from '../contexts/AuthContext';

const RenderInput = ({ label, value, onChange, placeholder, showPass, setShowPass }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                secureTextEntry={!showPass}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
        </View>
    </View>
);

export default function UpdatePasswordScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Using request/reset endpoint as per user instruction
            // currentPassword is not used/required by this specific backend logic
            console.log({
                token: token,
                newPassword: newPassword
            });
            await api.post('/auth/update-password', {
                token: token,
                newPassword: newPassword
            });
            Alert.alert('Success', 'Password updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.warn(err);
            Alert.alert('Error', err?.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };



    return (
        <LinearGradient colors={['#1B4CFF', '#8B2EFF']} style={styles.background}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Change Password</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>

                    <RenderInput
                        label="New Password"
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="Enter new password"
                        showPass={showNew}
                        setShowPass={setShowNew}
                    />

                    <RenderInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="Confirm new password"
                        showPass={showConfirm}
                        setShowPass={setShowConfirm}
                    />

                    <View style={{ marginTop: 24 }}>
                        <Button title={loading ? "Updating..." : "Update Password"} onPress={handleSubmit} disabled={loading} />
                    </View>

                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    backBtn: { padding: 8 },
    content: { padding: 20 },

    formGroup: { marginBottom: 20 },
    label: { color: 'rgba(255,255,255,0.8)', marginBottom: 8, fontWeight: '600' },

    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    input: {
        flex: 1, padding: 16, color: '#fff', fontSize: 16,
    },
    eyeIcon: { padding: 16 },
});
