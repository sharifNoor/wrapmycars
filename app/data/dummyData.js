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
    { id: 'gloss', name: 'Gloss', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&w=400' },
    { id: 'matte', name: 'Matte', image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&w=400' },
    { id: 'satin', name: 'Satin', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&w=400' },
    { id: 'chrome', name: 'Chrome', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&w=400' },
];

export const WHEEL_STYLES = [
    { id: 'luxury', name: 'Luxury', image: 'https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?auto=format&w=400' },
    { id: 'racing', name: 'Racing', image: 'https://images.unsplash.com/photo-1580273916550-13b3e59f81f2?auto=format&w=400' },
    { id: 'classic', name: 'Classic', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&w=400' },
    { id: 'modern', name: 'Modern', image: 'https://images.unsplash.com/photo-1506197603488-810cd049c661?auto=format&w=400' },
];

export const BODYKIT_STYLES = [
    { id: 'widebody', name: 'Widebody', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&w=400' },
    { id: 'perform', name: 'Performance', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&w=400' },
];

export const SPOILER_STYLES = [
    { id: 'ducktail', name: 'Ducktail', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c34b?auto=format&w=200' },
    { id: 'wing', name: 'GT Wing', image: 'https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?auto=format&w=200' },
    { id: 'lip', name: 'Lip Spoiler', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&w=200' },
    { id: 'active', name: 'Active Aero', image: 'https://images.unsplash.com/photo-1603584173870-7f1cfca5215d?auto=format&w=200' },
];

export const DECAL_STYLES = [
    { id: 'racing_stripes', name: 'Racing Stripes', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&w=200' },
    { id: 'side_decals', name: 'Side Decals', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&w=200' },
    { id: 'geometric', name: 'Geometric Pattern', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&w=200' },
];

export const STANCE_STYLES = [
    { id: 'slammed', name: 'Slammed (Lowered)', image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&w=200' },
    { id: 'lifted', name: 'Lifted (Off-road)', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&w=200' },
    { id: 'track', name: 'Track Ready', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&w=200' },
];

export const LIGHT_STYLES = [
    { id: 'smoked', name: 'Smoked Tints', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&w=200' },
    { id: 'yellow', name: 'Yellow (JDM Style)', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&w=200' },
    { id: 'led_strip', name: 'LED Accent Strip', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&w=200' },
];

export const ENVIRONMENT_STYLES = [
    { id: 'cyberpunk', name: 'Cyberpunk City', image: 'https://images.unsplash.com/photo-1514565131-fce0801e007d?auto=format&w=200' },
    { id: 'track', name: 'Race Track', image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&w=200' },
    { id: 'beach', name: 'Sunset Beach', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&w=200' },
    { id: 'showroom', name: 'Luxury Showroom', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&w=200' },
];

export const ACCENT_STYLES = [
    { id: 'carbon_hood', name: 'Carbon Fiber Hood', image: 'https://images.unsplash.com/photo-1580273916550-13b3e59f81f2?auto=format&w=200' },
    { id: 'roof_rack', name: 'Roof Rack', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&w=200' },
    { id: 'hood_scoop', name: 'Hood Scoop', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&w=200' },
];

export const PATTERN_WRAPS = [
    { id: 'solid', name: 'Solid Color' },
    { id: 'floral', name: 'Floral Pattern', image: 'https://images.unsplash.com/photo-1582234371023-591f73c5e627?auto=format&w=400' },
    { id: 'geometric', name: 'Geometric Pattern', image: 'https://images.unsplash.com/photo-1550684848-86a5eb6557cc?auto=format&w=400' },
    { id: 'camo', name: 'Digital Camo', image: 'https://images.unsplash.com/photo-1579546673265-92a8a56f6605?auto=format&w=400' },
    { id: 'psychedelic', name: 'Psychedelic Wrap', image: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&w=400' },
    { id: 'carbon_fiber', name: 'Carbon Fiber Weave', image: 'https://images.unsplash.com/photo-1506197603488-810cd049c661?auto=format&w=400' },
];

export const TINT_LEVELS = [
    { id: 'light', name: 'Light (50% Density)', density: 0.2 },
    { id: 'medium', name: 'Medium (35% Density)', density: 0.4 },
    { id: 'dark', name: 'Dark (20% Density)', density: 0.6 },
    { id: 'limo', name: 'Limo (5% Density)', density: 0.8 },
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
