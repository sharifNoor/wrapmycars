// app/screens/ContactScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { theme } from '../constants/theme';

export default function ContactScreen({ navigation }) {

    const handleEmail = () => {
        Linking.openURL('mailto:support@wrapmycars.com');
    };

    return (
        <LinearGradient colors={theme.gradients.midnight} style={styles.background}>
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
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.textDim} />
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
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 16
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
    backBtn: { padding: 8 },
    content: { padding: 20 },
    intro: { color: theme.colors.textDim, fontSize: 16, marginBottom: 32 },

    card: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.cardBackground,
        padding: 20, borderRadius: 16, marginBottom: 16,
        borderWidth: 1, borderColor: theme.colors.border
    },
    cardText: { flex: 1, marginLeft: 16 },
    cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '600' },
    cardSub: { color: theme.colors.textDim, marginTop: 4 },

    socialSection: { marginTop: 32, alignItems: 'center' },
    socialTitle: { color: theme.colors.textDim, fontSize: 14, textTransform: 'uppercase', marginBottom: 16 },
    socialRow: { flexDirection: 'row' },
    socialIcon: { marginHorizontal: 16 },
});
