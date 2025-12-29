// app/screens/PrivacyScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function PrivacyScreen({ navigation }) {
    return (
        <LinearGradient colors={['#1B4CFF', '#8B2EFF']} style={styles.background}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Privacy Policy</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.text}>
                        Last updated: December 2025
                        {'\n\n'}
                        1. Introduction
                        {'\n'}
                        Welcome to WrapMyCars. We respect your privacy and are committed to protecting your personal data.
                        {'\n\n'}
                        2. Data We Collect
                        {'\n'}
                        We may collect personal identification information (Name, email address, phone number, etc.) and images you upload for processing.
                        {'\n\n'}
                        3. How We Use Your Data
                        {'\n'}
                        We use your data to provide and improve our AI transformation services. Generated images are stored to allow you to view your history.
                        {'\n\n'}
                        4. Data Security
                        {'\n'}
                        We implement appropriate security measures to protect against unauthorized access or alteration of your personal information.
                        {'\n\n'}
                        5. Contact Us
                        {'\n'}
                        If you have any questions about this Privacy Policy, please contact us.
                    </Text>
                </ScrollView>
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
    text: { color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 24 },
});
