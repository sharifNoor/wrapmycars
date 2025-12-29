// app/data/dummyData.js

export const MODIFICATION_TYPES = [
    {
        id: 'improve',
        label: 'Improve Quality',
        description: 'Add car details for better results',
        icon: 'sparkles-outline',
        promptTemplate: 'high quality, realistic photo of {car}, 8k, detailed',
    },
    {
        id: 'wrap',
        label: 'Wrap',
        description: 'Apply a custom vinyl wrap',
        icon: 'color-palette-outline',
        promptTemplate: 'wrap the car in {colorName} {finish} vinyl wrap',
        steps: ['color', 'finish'],
    },
    {
        id: 'paint',
        label: 'Paint',
        description: 'Change the car\'s paint color',
        icon: 'brush-outline',
        promptTemplate: 'paint the car {colorName} with {finish} finish',
        steps: ['color', 'finish'],
    },
    {
        id: 'wheels',
        label: 'Wheels & Rims',
        description: 'Replace the wheels and rims',
        icon: 'disc-outline',
        promptTemplate: 'change wheels to {styleName} style in {colorName} color',
        steps: ['style', 'color'],
    },
    {
        id: 'spoiler',
        label: 'Spoiler',
        description: 'Add a rear spoiler',
        icon: 'airplane-outline', // placeholder
        promptTemplate: 'add a {colorName} {styleName} rear spoiler',
        steps: ['style', 'color'],
    },
    {
        id: 'bodykit',
        label: 'Body Kit',
        description: 'Add custom body kit',
        icon: 'car-sport-outline',
        promptTemplate: 'install {styleName} body kit in {colorName}',
        steps: ['style', 'color'],
    },
    {
        id: 'lights',
        label: 'LED Lights',
        description: 'Add LED accent lighting',
        icon: 'flash-outline',
        promptTemplate: 'add glowing {colorName} underglow LED lights',
        steps: ['color'],
    },
    {
        id: 'tint',
        label: 'Window Tint',
        description: 'Darken the windows',
        icon: 'moon-outline',
        promptTemplate: 'apply {styleName} window tint',
        steps: ['style'], // 'style' here refers to darkness level
    },
];

export const COLORS = [
    {
        id: 'whites', label: 'Whites', color: '#fff', shades: [
            { id: 'pure_white', name: 'Pure White', hex: '#fff' },
            { id: 'pearl_white', name: 'Pearl White', hex: '#f0f0f0' },
        ]
    },
    {
        id: 'blacks', label: 'Blacks', color: '#000', shades: [
            { id: 'obsidian_black', name: 'Obsidian Black', hex: '#000' },
            { id: 'matte_black', name: 'Matte Black', hex: '#1a1a1a' },
            { id: 'carbon', name: 'Carbon Fiber', hex: '#222' },
        ]
    },
    {
        id: 'reds', label: 'Reds', color: '#f00', shades: [
            { id: 'racing_red', name: 'Racing Red', hex: '#ff0000' },
            { id: 'maroon', name: 'Maroon', hex: '#800000' },
        ]
    },
    {
        id: 'blues', label: 'Blues', color: '#00f', shades: [
            { id: 'deep_blue', name: 'Deep Blue', hex: '#00008b' },
            { id: 'sky_blue', name: 'Sky Blue', hex: '#87ceeb' },
        ]
    },
    // ... more colors can be added
];

export const FINISHES = [
    { id: 'gloss', name: 'Gloss', image: 'https://example.com/gloss.png' }, // placeholder
    { id: 'matte', name: 'Matte', image: 'https://example.com/matte.png' },
    { id: 'satin', name: 'Satin', image: 'https://example.com/satin.png' },
    { id: 'chrome', name: 'Chrome', image: 'https://example.com/chrome.png' },
];

export const WHEEL_STYLES = [
    { id: 'luxury', name: 'Luxury', image: 'https://example.com/luxury_wheel.png' },
    { id: 'racing', name: 'Racing', image: 'https://example.com/racing_wheel.png' },
    { id: 'classic', name: 'Classic', image: 'https://example.com/classic_wheel.png' },
    { id: 'modern', name: 'Modern', image: 'https://example.com/modern_wheel.png' },
];

export const BODYKIT_STYLES = [
    { id: 'widebody', name: 'Widebody', image: 'https://example.com/widebody.png' },
    { id: 'perform', name: 'Performance', image: 'https://example.com/perform.png' },
];

export const TINT_LEVELS = [
    { id: 'light', name: 'Light (50%)' },
    { id: 'medium', name: 'Medium (35%)' },
    { id: 'dark', name: 'Dark (20%)' },
    { id: 'limo', name: 'Limo (5%)' },
];

// Helper to get options for a step
export const getOptionsForStep = (stepType) => {
    switch (stepType) {
        case 'color': return COLORS;
        case 'finish': return FINISHES;
        case 'style': return null; // Context dependent (wheels vs bodykit)
        default: return [];
    }
};
