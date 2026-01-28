import React, { useContext } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, StatusBar, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';
import { theme } from '../../constants/theme';
import Button from '../../components/Button';
import { AuthContext } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// Premium car wrap background
const BG_IMAGE = require('../../assets/onboarding.png');

export default function OnboardingScreen({ navigation }) {
    const { googleLogin, appleLogin } = useContext(AuthContext);
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ImageBackground source={BG_IMAGE} style={styles.background} resizeMode="cover">
                {/* Gradient Overlay for text readability */}
                <LinearGradient
                    colors={['transparent', '#0f0c29']}
                    locations={[0.2, 0.9]}
                    style={styles.gradientOverlay}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>
                                Transform Your Car with <Text style={styles.highlight}>AI</Text>
                            </Text>
                            <Text style={styles.subtitle}>
                                Visualize stunning wraps efficiently. Join thousands of car enthusiasts designing their dream rides.
                            </Text>
                        </View>

                        <View style={styles.buttonsContainer}>
                            {/* Primary Action */}
                            <Button
                                title="Get Started"
                                onPress={() => navigation.navigate('Register')}
                                style={styles.mainBtn}
                                gradientColors={theme.gradients.sunset}
                            />

                            <View style={styles.spacer} />

                            <TouchableOpacity
                                onPress={() => googleLogin().then(success => {
                                    if (success) console.log("Google Login Success");
                                })}
                                style={styles.googleBtn}
                            >
                                <Ionicons name="logo-google" size={20} color="#000" style={{ marginRight: 8 }} />
                                <Text style={styles.googleBtnText}>Continue with Google</Text>
                            </TouchableOpacity>

                            {Platform.OS === 'ios' && (
                                <View style={styles.appleBtnContainer}>
                                    <AppleButton
                                        buttonStyle={AppleButton.Style.WHITE}
                                        buttonType={AppleButton.Type.CONTINUE}
                                        cornerRadius={30}
                                        style={StyleSheet.absoluteFillObject}
                                        onPress={appleLogin}
                                    />
                                </View>
                            )}

                            <View style={styles.spacer} />

                            {/* Secondary Action */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Login')}
                                style={styles.secondaryBtn}
                            >
                                <Text style={styles.secondaryBtnText}>I already have an account</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        flex: 1,
        width: width,
        height: height, // Full height
    },
    gradientOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        width: '100%',
        maxHeight: height * 0.8, // Limit height to bottom 80%
    },
    scrollView: {
        width: '100%',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 50,
        justifyContent: 'flex-end',
        flexGrow: 1,
    },
    textContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: '#fff',
        lineHeight: 48,
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    highlight: {
        color: '#D4ACFB', // Light purple accent
    },
    subtitle: {
        fontSize: 16,
        color: '#rgba(255,255,255,0.8)',
        lineHeight: 24,
        fontWeight: '500',
    },
    buttonsContainer: {
        width: '100%',
    },
    spacer: {
        height: 16,
    },
    mainBtn: {
        width: '100%',
        height: 56,
        borderRadius: 30, // Pill shape
    },
    secondaryBtn: {
        width: '100%',
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    googleBtn: {
        width: '100%',
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 30,
    },
    googleBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    appleBtnContainer: {
        width: '100%',
        height: 56,
        marginVertical: 0,
        position: 'relative',
    },
    secondaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
