import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Svg, { Path, Image as SvgImage, Defs, ClipPath, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; // horiz padding 16*2
const CARD_HEIGHT = 280;

// Placeholder constants
const PLACEHOLDER_CAR = require('../assets/placeholder_car.jpeg');
const PLACEHOLDER_WRAPPED = require('../assets/placeholder_wrapped.jpeg');

// Generate a "torn paper" rugged path with variable width
// Returns objects: { separator: string, clip: string }
const createTornPath = (w, h) => {
    const steps = 30;
    const startX = 0.65 * w; // Start Top-Right
    const endX = 0.40 * w;   // End Bottom-Left (Flipped)
    const stepY = h / steps;

    let leftPoints = [];
    let rightPoints = [];

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const y = i * stepY;
        const idealX = startX + (endX - startX) * t;

        // jagged noise for the center line
        const noise = (Math.sin(i * 10) * 5) + (Math.cos(i * 25) * 3);

        // Variable thickness for the "tear" (3px to 12px)
        const thicknessNoise = (Math.sin(i * 5) * 4) + 6;

        const centerX = idealX + noise;

        leftPoints.push({ x: centerX - thicknessNoise, y });
        rightPoints.push({ x: centerX + thicknessNoise, y });
    }

    // Construct Separator Polygon (Filled White Strip)
    // Left side (top to bottom) -> Right side (bottom to top)
    let separator = `M ${leftPoints[0].x} ${leftPoints[0].y}`;
    for (let i = 1; i < leftPoints.length; i++) {
        separator += ` L ${leftPoints[i].x} ${leftPoints[i].y}`;
    }
    // Cross over to bottom-right
    for (let i = rightPoints.length - 1; i >= 0; i--) {
        separator += ` L ${rightPoints[i].x} ${rightPoints[i].y}`;
    }
    separator += ` Z`; // Close loop

    // Construct Clip Path (Right side of the tear + screen bounds)
    // Follow rightPoints top-down
    let clip = `M ${rightPoints[0].x} ${rightPoints[0].y}`;
    for (let i = 1; i < rightPoints.length; i++) {
        clip += ` L ${rightPoints[i].x} ${rightPoints[i].y}`;
    }
    // Close around the rest of the right side
    clip += ` L ${w} ${h} L ${w} 0 Z`;

    return { separator, clip };
};

const { separator: TORN_SEPARATOR, clip: RIGHT_SIDE_CLIP } = createTornPath(CARD_WIDTH, CARD_HEIGHT);

export default function TransformationCard({ item }) {
    const isPressed = useSharedValue(0);

    const pressGesture = Gesture.LongPress()
        .minDuration(50)
        .onBegin(() => {
            isPressed.value = withTiming(1, { duration: 200 });
        })
        .onFinalize(() => {
            isPressed.value = withTiming(0, { duration: 200 });
        });

    // Valid images
    const originalUri = item.original || PLACEHOLDER_CAR;
    const generatedUri = item.generated || PLACEHOLDER_WRAPPED;

    // Animated Props
    // When pressed, we want to reveal the FULL Original image (standard comparison behavior)
    // Or maybe reveal FULL Generated?
    // Let's do: Default = Split. Press = Reveal Full Generated.

    const splitOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(isPressed.value, [0, 1], [1, 0])
    }));

    const fullGeneratedOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(isPressed.value, [0, 1], [0, 1])
    }));

    return (
        <GestureDetector gesture={pressGesture}>
            <View style={styles.cardContainer}>
                <View style={styles.imageWrapper}>

                    {/* SVG Layer for Split View */}
                    <Animated.View style={[StyleSheet.absoluteFill, splitOpacity]}>
                        <Svg width={CARD_WIDTH} height={CARD_HEIGHT}>
                            <Defs>
                                <ClipPath id="rightClip">
                                    <Path d={RIGHT_SIDE_CLIP} />
                                </ClipPath>
                                <LinearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
                                    <Stop offset="0" stopColor="#00FFFF" stopOpacity="1" />
                                    <Stop offset="0.5" stopColor="#FFF" stopOpacity="1" />
                                    <Stop offset="1" stopColor="#00FFFF" stopOpacity="1" />
                                </LinearGradient>
                            </Defs>

                            {/* 1. Base Layer: Original Image (Left Side visible) */}
                            {/* We render it fully, but it will be covered on the right by the generated image */}
                            <SvgImage
                                x="0" y="0"
                                width="100%" height="100%"
                                preserveAspectRatio="xMidYMid slice"
                                href={{ uri: originalUri }}
                            />

                            {/* 2. Top Layer: Generated Image (Right Side, Clipped) */}
                            <SvgImage
                                x="0" y="0"
                                width="100%" height="100%"
                                preserveAspectRatio="xMidYMid slice"
                                href={{ uri: generatedUri }}
                                clipPath="url(#rightClip)"
                            />

                            {/* 3. The Torn Paper Strip */}
                            {/* Shadow under the tear */}
                            <Path
                                d={TORN_SEPARATOR}
                                fill="#000"
                                fillOpacity={0.4}
                            />
                            {/* The Main White Paper Tear */}
                            <Path
                                d={TORN_SEPARATOR}
                                fill="#fff"
                            />
                        </Svg>
                    </Animated.View>

                    {/* Full Generated View (Revealed on Hold) */}
                    <Animated.View style={[StyleSheet.absoluteFill, fullGeneratedOpacity]}>
                        <Animated.Image
                            source={{ uri: generatedUri }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                        <View style={styles.fullViewBadge}>
                            <Text style={styles.fullViewText}>FULL PREVIEW</Text>
                        </View>
                    </Animated.View>


                    {/* Labels / Badges (Static) */}
                    <View style={styles.labelsRow}>
                        {/* Left Label: Original */}
                        <Animated.View style={[styles.labelPill, splitOpacity, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                            <Text style={styles.labelText}>BEFORE</Text>
                        </Animated.View>

                        {/* Right Label: Generated */}
                        <Animated.View style={[styles.labelPill, splitOpacity, { backgroundColor: 'rgba(11, 99, 255, 0.8)' }]}>
                            <Ionicons name="sparkles" size={10} color="#fff" style={{ marginRight: 4 }} />
                            <Text style={styles.labelText}>AFTER</Text>
                        </Animated.View>
                    </View>

                    {/* Hint */}
                    <View style={styles.hintContainer}>
                        <Text style={styles.hintText}>Hold to peek full result</Text>
                    </View>

                </View>
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 24,
        borderRadius: 20,
        backgroundColor: '#000',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    imageWrapper: {
        width: '100%',
        height: CARD_HEIGHT,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1a1a1a',
    },
    labelsRow: {
        position: 'absolute',
        top: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    labelPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    labelText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    hintContainer: {
        position: 'absolute',
        bottom: 12,
        width: '100%',
        alignItems: 'center',
    },
    hintText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    fullViewBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    fullViewText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    }
});
