/**
 * Data Source Preset Library
 *
 * Common data source configurations for quick setup
 */

export const DATA_SOURCE_PRESETS = {
    scalar: [
        {
            id: 'temp-daily',
            name: 'Daily Temperature',
            description: 'Simulates daily temperature variation',
            icon: '🌡️',
            params: {
                pattern: 'sine',
                amplitude: 15,
                frequency: 0.042, // ~24 hour cycle (1/24)
                offset: 20,
                noise: 2.0,
            },
        },
        {
            id: 'smooth-sine',
            name: 'Smooth Sine Wave',
            description: 'Clean sinusoidal oscillation',
            icon: '〰️',
            params: {
                pattern: 'sine',
                amplitude: 10,
                frequency: 0.1,
                offset: 0,
                noise: 0,
            },
        },
        {
            id: 'noisy-sensor',
            name: 'Noisy Sensor',
            description: 'Sensor readings with noise',
            icon: '📊',
            params: {
                pattern: 'sine',
                amplitude: 5,
                frequency: 0.05,
                offset: 50,
                noise: 3.0,
            },
        },
        {
            id: 'random-walk',
            name: 'Random Walk',
            description: 'Brownian motion / stock price simulation',
            icon: '📈',
            params: {
                pattern: 'randomWalk',
                amplitude: 1.0,
                frequency: 0.1,
                offset: 100,
                noise: 0.5,
            },
        },
        {
            id: 'square-wave',
            name: 'Square Wave',
            description: 'Alternating high/low signal',
            icon: '⬜',
            params: {
                pattern: 'square',
                amplitude: 10,
                frequency: 0.1,
                offset: 0,
                noise: 0,
            },
        },
        {
            id: 'step-function',
            name: 'Step Function',
            description: 'Discrete level changes',
            icon: '📶',
            params: {
                pattern: 'step',
                amplitude: 20,
                frequency: 0.05,
                offset: 0,
                noise: 0,
            },
        },
        {
            id: 'linear-ramp',
            name: 'Linear Ramp',
            description: 'Steadily increasing value',
            icon: '📐',
            params: {
                pattern: 'linear',
                amplitude: 0.5,
                frequency: 0.1,
                offset: 0,
                noise: 0,
            },
        },
        {
            id: 'gaussian-noise',
            name: 'Gaussian Noise',
            description: 'Pure random noise',
            icon: '🌊',
            params: {
                pattern: 'gaussian',
                amplitude: 5,
                frequency: 0.1,
                offset: 0,
                noise: 0,
            },
        },
    ],
    discrete: [
        {
            id: 'days-of-week',
            name: 'Days of Week',
            description: 'Sequential days (0=Mon, 6=Sun)',
            icon: '📅',
            params: {
                pattern: 'sequential',
                numCategories: 7,
                changeEvery: 10,
                noise: 0,
            },
        },
        {
            id: 'traffic-light',
            name: 'Traffic Light',
            description: 'Cyclic pattern (Green→Yellow→Red→Yellow)',
            icon: '🚦',
            params: {
                pattern: 'cyclic',
                numCategories: 3,
                changeEvery: 5,
                noise: 0,
            },
        },
        {
            id: 'dice-roll',
            name: 'Dice Roll',
            description: 'Random 6-sided dice',
            icon: '🎲',
            params: {
                pattern: 'random',
                numCategories: 6,
                changeEvery: 1,
                noise: 0,
            },
        },
        {
            id: 'state-machine',
            name: 'State Machine',
            description: 'Sequential state transitions',
            icon: '⚙️',
            params: {
                pattern: 'sequential',
                numCategories: 4,
                changeEvery: 3,
                noise: 0.05,
            },
        },
        {
            id: 'binary-toggle',
            name: 'Binary Toggle',
            description: 'Alternating 0/1',
            icon: '🔄',
            params: {
                pattern: 'sequential',
                numCategories: 2,
                changeEvery: 5,
                noise: 0,
            },
        },
        {
            id: 'noisy-counter',
            name: 'Noisy Counter',
            description: 'Sequential with occasional errors',
            icon: '🔢',
            params: {
                pattern: 'sequential',
                numCategories: 10,
                changeEvery: 2,
                noise: 0.15,
            },
        },
    ],
};

/**
 * Get presets for a specific source type
 * @param {string} sourceType - 'scalar' or 'discrete'
 * @returns {Array} Array of preset configurations
 */
export function getPresets(sourceType) {
    return DATA_SOURCE_PRESETS[sourceType] || [];
}

/**
 * Get a preset by ID
 * @param {string} sourceType - 'scalar' or 'discrete'
 * @param {string} presetId - Preset ID
 * @returns {Object|null} Preset configuration or null
 */
export function getPresetById(sourceType, presetId) {
    const presets = getPresets(sourceType);
    return presets.find(p => p.id === presetId) || null;
}

/**
 * Apply a preset to a data source
 * @param {Object} source - Data source instance
 * @param {string} presetId - Preset ID
 * @returns {boolean} True if preset was applied
 */
export function applyPreset(source, presetId) {
    if (!source) return false;

    const preset = getPresetById(source.type, presetId);
    if (!preset) {
        console.warn(`Preset not found: ${presetId} for type ${source.type}`);
        return false;
    }

    // Update source parameters
    source.updateParams(preset.params);
    console.log(`[Presets] Applied preset "${preset.name}" to source ${source.id}`);

    return true;
}

/**
 * Get preset names for quick access
 * @param {string} sourceType - 'scalar' or 'discrete'
 * @returns {Array<string>} Array of preset names
 */
export function getPresetNames(sourceType) {
    return getPresets(sourceType).map(p => p.name);
}

/**
 * Get preset options for select dropdown
 * @param {string} sourceType - 'scalar' or 'discrete'
 * @returns {Array<Object>} Array of {value, label} objects
 */
export function getPresetOptions(sourceType) {
    return getPresets(sourceType).map(p => ({
        value: p.id,
        label: `${p.icon} ${p.name}`,
        description: p.description,
    }));
}
