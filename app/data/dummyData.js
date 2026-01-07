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
        id: 'custom',
        label: 'Try your own creativity',
        description: 'Describe any modification',
        icon: 'create-outline',
        promptTemplate: '{customPrompt}',
        steps: ['custom_prompt'],
    },
    {
        id: 'wrap',
        label: 'Wrap',
        description: 'Apply a custom vinyl wrap',
        icon: 'color-palette-outline',
        promptTemplate: 'wrap the car in {colorName} {finish} {patternName} vinyl wrap',
        steps: ['color', 'finish', 'pattern'],
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
        promptTemplate: 'apply tint on all windows including front, side, and rear with {styleName} uniform window tint',
        steps: ['style'],
    },
    {
        id: 'decals',
        label: 'Decals & Graphics',
        description: 'Add racing stripes or graphics',
        icon: 'brush-outline',
        promptTemplate: 'add {colorName} {styleName} wrap decals to the car',
        steps: ['style', 'color'],
    },
    {
        id: 'stance',
        label: 'Stance',
        description: 'Adjust suspension height',
        icon: 'trending-down-outline',
        promptTemplate: '{styleName} stance suspension',
        steps: ['style'],
    },
    {
        id: 'lights_style',
        label: 'Light Styling',
        description: 'Customize headlights & taillights',
        icon: 'star-outline',
        promptTemplate: 'add {styleName} headlights and taillights',
        steps: ['style'],
    },
    {
        id: 'environment',
        label: 'Environment',
        description: 'Change the background scene',
        icon: 'earth-outline',
        promptTemplate: 'parked in {styleName} background',
        steps: ['style'],
    },
    {
        id: 'accents',
        label: 'Hood & Roof',
        description: 'Add carbon fiber or roof racks',
        icon: 'layers-outline',
        promptTemplate: 'add {styleName}',
        steps: ['style'],
    },
    {
        id: 'calipers',
        label: 'Brake Calipers',
        description: 'Paint the brake calipers',
        icon: 'disc-outline',
        promptTemplate: 'paint brake calipers in {colorName}',
        steps: ['color'],
    },
];

export const COLORS = [
    {
        id: 'whites', label: 'Whites', color: '#fff', shades: [
            { id: 'pure_white', name: 'Pure White', hex: '#ffffff' },
            { id: 'pearl_white', name: 'Pearl White', hex: '#f0f0f0' },
            { id: 'ivory', name: 'Ivory', hex: '#fffffd' },
        ]
    },
    {
        id: 'blacks', label: 'Blacks', color: '#000', shades: [
            { id: 'obsidian_black', name: 'Obsidian Black', hex: '#000000' },
            { id: 'matte_black', name: 'Matte Black', hex: '#1a1a1a' },
            { id: 'gunmetal', name: 'Gunmetal Gray', hex: '#2c2c2c' },
        ]
    },
    {
        id: 'reds', label: 'Reds', color: '#f00', shades: [
            { id: 'racing_red', name: 'Racing Red', hex: '#ff0000' },
            { id: 'crimson', name: 'Crimson', hex: '#8b0000' },
            { id: 'candy_red', name: 'Candy Red', hex: '#d40000' },
        ]
    },
    {
        id: 'blues', label: 'Blues', color: '#00f', shades: [
            { id: 'deep_blue', name: 'Deep Blue', hex: '#00008b' },
            { id: 'sky_blue', name: 'Sky Blue', hex: '#87ceeb' },
            { id: 'royal_blue', name: 'Royal Blue', hex: '#4169e1' },
            { id: 'navy', name: 'Navy Blue', hex: '#000022' },
        ]
    },
    {
        id: 'greens', label: 'Greens', color: '#0f0', shades: [
            { id: 'british_racing_green', name: 'Racing Green', hex: '#004225' },
            { id: 'neon_green', name: 'Neon Green', hex: '#39ff14' },
            { id: 'olive', name: 'Olive Drab', hex: '#556b2f' },
            { id: 'mint', name: 'Mint Green', hex: '#98ff98' },
        ]
    },
    {
        id: 'yellows', label: 'Yellows', color: '#ff0', shades: [
            { id: 'speed_yellow', name: 'Speed Yellow', hex: '#ffff00' },
            { id: 'gold', name: 'Gold', hex: '#ffd700' },
            { id: 'mustard', name: 'Mustard', hex: '#ffdb58' },
        ]
    },
    {
        id: 'oranges', label: 'Oranges', color: '#ffa500', shades: [
            { id: 'sunset_orange', name: 'Sunset Orange', hex: '#ff4500' },
            { id: 'burnt_orange', name: 'Burnt Orange', hex: '#cc5500' },
            { id: 'neon_orange', name: 'Neon Orange', hex: '#ff8c00' },
        ]
    },
    {
        id: 'purples', label: 'Purples', color: '#800080', shades: [
            { id: 'royal_purple', name: 'Royal Purple', hex: '#7851a9' },
            { id: 'lavender', name: 'Lavender', hex: '#e6e6fa' },
            { id: 'deep_purple', name: 'Deep Purple', hex: '#301934' },
        ]
    },
    {
        id: 'pinks', label: 'Pinks', color: '#ffc0cb', shades: [
            { id: 'hot_pink', name: 'Hot Pink', hex: '#ff69b4' },
            { id: 'rose_gold', name: 'Rose Gold', hex: '#b76e79' },
            { id: 'soft_pink', name: 'Soft Pink', hex: '#ffb6c1' },
        ]
    },
    {
        id: 'teals', label: 'Teals', color: '#008080', shades: [
            { id: 'cyan', name: 'Cyan', hex: '#00ffff' },
            { id: 'teal', name: 'Teal', hex: '#008080' },
            { id: 'turquoise', name: 'Turquoise', hex: '#40e0d0' },
        ]
    },
];

export const FINISHES = [
    { id: 'gloss', name: 'Gloss', image: require('../assets/wraps/gloss.jpeg') },
    { id: 'matte', name: 'Matte', image: require('../assets/wraps/matte.jpeg') },
    { id: 'satin', name: 'Satin', image: require('../assets/wraps/satin.jpeg') },
    { id: 'chrome', name: 'Chrome', image: require('../assets/wraps/chrome.jpeg') },
];

export const WHEEL_STYLES = [
    { id: 'luxury', name: 'Luxury', image: require('../assets/wheels/luxury.jpeg') },
    { id: 'racing', name: 'Racing', image: require('../assets/wheels/racing.jpeg') },
    { id: 'classic', name: 'Classic', image: require('../assets/wheels/classic.jpeg') },
    { id: 'modern', name: 'Modern', image: require('../assets/wheels/modern.jpeg') },
];

export const BODYKIT_STYLES = [
    { id: 'widebody', name: 'Widebody', image: require('../assets/body_kits/widebody.jpeg') },
    { id: 'perform', name: 'Performance', image: require('../assets/body_kits/perform.jpg') },
];

export const SPOILER_STYLES = [
    { id: 'ducktail', name: 'Ducktail', image: require('../assets/spoilers/ducktail.jpeg') },
    { id: 'wing', name: 'GT Wing', image: require('../assets/spoilers/wing.jpeg') },
    { id: 'lip', name: 'Lip Spoiler', image: require('../assets/spoilers/lip.jpeg') },
    { id: 'active', name: 'Active Aero', image: require('../assets/spoilers/active.jpeg') },
];

export const DECAL_STYLES = [
    { id: 'racing_stripes', name: 'Racing Stripes', image: require('../assets/decal/racing_stripes.jpg') },
    { id: 'side_decals', name: 'Side Decals', image: require('../assets/decal/side_decals.jpg') },
    { id: 'geometric', name: 'Geometric Pattern', image: require('../assets/decal/geometric.jpg') },
];

export const STANCE_STYLES = [
    { id: 'slammed', name: 'Slammed (Lowered)', image: require('../assets/stances/slammed.jpeg') },
    { id: 'lifted', name: 'Lifted (Off-road)', image: require('../assets/stances/lifted.jpeg') },
    { id: 'track', name: 'Track Ready', image: require('../assets/stances/track.jpeg') },
];

export const LIGHT_STYLES = [
    { id: 'smoked', name: 'Smoked Tints', image: require('../assets/lights/smoked.jpg') },
    { id: 'yellow', name: 'Yellow (JDM Style)', image: require('../assets/lights/yellow.jpeg') },
    { id: 'led_strip', name: 'LED Accent Strip', image: require('../assets/lights/led_strip.jpg') },
];

export const ENVIRONMENT_STYLES = [
    { id: 'cyberpunk', name: 'Cyberpunk City', image: require('../assets/environment/cyberpunk.jpg') },
    { id: 'track', name: 'Race Track', image: require('../assets/environment/track.jpg') },
    { id: 'beach', name: 'Sunset Beach', image: require('../assets/environment/beach.jpg') },
    { id: 'showroom', name: 'Luxury Showroom', image: require('../assets/environment/showroom.jpg') },
];

export const ACCENT_STYLES = [
    { id: 'carbon_hood', name: 'Carbon Fiber Hood', image: require('../assets/accent/carbon_hood.jpeg') },
    { id: 'roof_rack', name: 'Roof Rack', image: require('../assets/accent/roof_rack.jpg') },
    { id: 'hood_scoop', name: 'Hood Scoop', image: require('../assets/accent/hood_scoop.jpeg') },
];

export const PATTERN_WRAPS = [
    { id: 'solid', name: 'Solid Color', image: require('../assets/patterns/solid.jpeg') },
    { id: 'floral', name: 'Floral Pattern', image: require('../assets/patterns/floral.jpeg') },
    { id: 'geometric', name: 'Geometric Pattern', image: require('../assets/patterns/geometric.jpeg') },
    { id: 'camo', name: 'Digital Camo', image: require('../assets/patterns/camo.jpeg') },
    { id: 'psychedelic', name: 'Psychedelic Wrap', image: require('../assets/patterns/psychedelic.jpeg') },
    { id: 'carbon_fiber', name: 'Carbon Fiber Weave', image: require('../assets/patterns/carbon_fiber.jpeg') },
];

export const TINT_LEVELS = [
    { id: 'light', name: 'Light (50% Density)', image: require('../assets/tints/light.jpeg'), density: 0.2 },
    { id: 'medium', name: 'Medium (35% Density)', image: require('../assets/tints/medium.jpeg'), density: 0.4 },
    { id: 'dark', name: 'Dark (20% Density)', image: require('../assets/tints/dark.jpeg'), density: 0.6 },
    { id: 'limo', name: 'Limo (5% Density)', image: require('../assets/tints/limo.jpeg'), density: 0.8 },
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
