// app/screens/ContactScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function ContactScreen({ navigation }) {

    const handleEmail = () => {
        Linking.openURL('mailto:support@wrapmycars.com');
    };

    return (
        <LinearGradient colors={['#1B4CFF', '#8B2EFF']} style={styles.background}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contact Us</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.intro}>
                        Have questions or feedback? We'd love to hear from you.
                    </Text>

                    <TouchableOpacity style={styles.card} onPress={handleEmail}>
                        <Ionicons name="mail-outline" size={32} color="#fff" />
                        <View style={styles.cardText}>
                            <Text style={styles.cardTitle}>Email Support</Text>
                            <Text style={styles.cardSub}>support@wrapmycars.com</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>

                    <View style={styles.socialSection}>
                        <Text style={styles.socialTitle}>Follow us</Text>
                        <View style={styles.socialRow}>
                            <Ionicons name="logo-instagram" size={32} color="#fff" style={styles.socialIcon} />
                            <Ionicons name="logo-twitter" size={32} color="#fff" style={styles.socialIcon} />
                            <Ionicons name="logo-facebook" size={32} color="#fff" style={styles.socialIcon} />
                        </View>
                    </View>
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
    intro: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 32 },

    card: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 20, borderRadius: 16, marginBottom: 16
    },
    cardText: { flex: 1, marginLeft: 16 },
    cardTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
    cardSub: { color: 'rgba(255,255,255,0.6)', marginTop: 4 },

    socialSection: { marginTop: 32, alignItems: 'center' },
    socialTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textTransform: 'uppercase', marginBottom: 16 },
    socialRow: { flexDirection: 'row' },
    socialIcon: { marginHorizontal: 16 },
});
