import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

const { width } = Dimensions.get('window');

// Fallback images if uri is missing
const PLACEHOLDER_CAR = 'https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=2073&auto=format&fit=crop';
const PLACEHOLDER_WRAPPED = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop';

export default function TransformationCard({ item }) {
    // item = { title, subtitle, original, generated }

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

            {/* Images Container */}
            <View style={styles.imagesContainer}>
                {/* Original */}
                <Image
                    source={{ uri: item.original || PLACEHOLDER_CAR }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Arrow Indicator */}
                <View style={styles.arrowContainer}>
                    <Ionicons name="arrow-down" size={20} color="#fff" />
                </View>

                {/* Generated */}
                <Image
                    source={{ uri: item.generated || PLACEHOLDER_WRAPPED }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(20, 20, 20, 0.6)', // Semi-transparent dark
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#aaa',
        marginTop: 2,
    },
    imagesContainer: {
        alignItems: 'center',
        gap: 12, // Gap between images
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#333',
    },
    arrowContainer: {
        position: 'absolute',
        top: '50%',
        marginTop: -15, // Half of height(30)
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});
