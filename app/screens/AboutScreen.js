// app/screens/AboutScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function AboutScreen({ navigation }) {
    return (
        <LinearGradient colors={['#1B4CFF', '#8B2EFF']} style={styles.background}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>About Us</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="car-sport" size={80} color="#fff" />
                        <Text style={styles.appName}>WrapMyCars AI</Text>
                        <Text style={styles.version}>v1.0.0</Text>
                    </View>

                    <Text style={styles.text}>
                        WrapMyCars AI is the ultimate tool for car enthusiasts. visualizing modifications has never been easier.
                        {'\n\n'}
                        Using state-of-the-art Artificial Intelligence, we allow you to see how your car would look with different wraps, paint jobs, rims, and body kits in seconds.
                        {'\n\n'}
                        Our mission is to help you build your dream car, one pixel at a time.
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
    content: { padding: 20, alignItems: 'center' },
    logoContainer: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
    appName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 16 },
    version: { color: 'rgba(255,255,255,0.5)', marginTop: 8 },
    text: { color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 24, textAlign: 'center' },
});
