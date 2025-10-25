/**
 * Demo Network Configurations
 *
 * Each demo defines:
 * - name: Display name
 * - description: Short description
 * - blocks: Array of blocks to create { type, position, label }
 * - connections: Array of connections { source, target, type }
 */

export const DEMOS = {
    sequence: {
        name: 'Sequence Learning',
        description: 'Learn and predict temporal sequences',
        blocks: [
            {
                type: 'ScalarTransformer',
                position: { x: 100, y: 100 },
                label: 'Input Scalar',
            },
            {
                type: 'SequenceLearner',
                position: { x: 100, y: 250 },
                label: 'Sequence Memory',
            },
            {
                type: 'PatternClassifier',
                position: { x: 100, y: 400 },
                label: 'Prediction',
            },
        ],
        connections: [
            { sourceIndex: 0, targetIndex: 1, type: 'input' },
            { sourceIndex: 1, targetIndex: 2, type: 'input' },
        ],
    },

    classification: {
        name: 'Classification',
        description: 'Pattern classification task',
        blocks: [
            {
                type: 'DiscreteTransformer',
                position: { x: 50, y: 100 },
                label: 'Feature 1',
            },
            {
                type: 'DiscreteTransformer',
                position: { x: 250, y: 100 },
                label: 'Feature 2',
            },
            {
                type: 'PatternPooler',
                position: { x: 150, y: 250 },
                label: 'Feature Pool',
            },
            {
                type: 'PatternClassifier',
                position: { x: 150, y: 400 },
                label: 'Classifier',
            },
        ],
        connections: [
            { sourceIndex: 0, targetIndex: 2, type: 'input' },
            { sourceIndex: 1, targetIndex: 2, type: 'input' },
            { sourceIndex: 2, targetIndex: 3, type: 'input' },
        ],
    },

    context: {
        name: 'Context Learning',
        description: 'Learn contextual relationships',
        blocks: [
            {
                type: 'ScalarTransformer',
                position: { x: 100, y: 50 },
                label: 'Input Signal',
            },
            {
                type: 'ContextLearner',
                position: { x: 100, y: 200 },
                label: 'Context Memory',
            },
            {
                type: 'PersistenceTransformer',
                position: { x: 300, y: 50 },
                label: 'Context Source',
            },
            {
                type: 'PatternClassifier',
                position: { x: 100, y: 350 },
                label: 'Output',
            },
        ],
        connections: [
            { sourceIndex: 0, targetIndex: 1, type: 'input' },
            { sourceIndex: 2, targetIndex: 1, type: 'context' },
            { sourceIndex: 1, targetIndex: 3, type: 'input' },
        ],
    },

    pooling: {
        name: 'Feature Pooling',
        description: 'Pool features from multiple inputs',
        blocks: [
            {
                type: 'ScalarTransformer',
                position: { x: 50, y: 50 },
                label: 'Input A',
            },
            {
                type: 'ScalarTransformer',
                position: { x: 200, y: 50 },
                label: 'Input B',
            },
            {
                type: 'ScalarTransformer',
                position: { x: 350, y: 50 },
                label: 'Input C',
            },
            {
                type: 'PatternPooler',
                position: { x: 200, y: 200 },
                label: 'Feature Pooler',
            },
            {
                type: 'SequenceLearner',
                position: { x: 200, y: 350 },
                label: 'Temporal Integration',
            },
        ],
        connections: [
            { sourceIndex: 0, targetIndex: 3, type: 'input' },
            { sourceIndex: 1, targetIndex: 3, type: 'input' },
            { sourceIndex: 2, targetIndex: 3, type: 'input' },
            { sourceIndex: 3, targetIndex: 4, type: 'input' },
        ],
    },
};

/**
 * Get demo configuration by key
 * @param {string} demoKey - Demo key (sequence, classification, context, pooling)
 * @returns {object|null} Demo configuration
 */
export function getDemoConfig(demoKey) {
    return DEMOS[demoKey] || null;
}

/**
 * Get all demo keys
 * @returns {string[]} Array of demo keys
 */
export function getDemoKeys() {
    return Object.keys(DEMOS);
}

/**
 * Get demo descriptions for UI
 * @returns {object} Map of demo key to description
 */
export function getDemoDescriptions() {
    const descriptions = {};
    Object.keys(DEMOS).forEach((key) => {
        descriptions[key] = DEMOS[key].description;
    });
    return descriptions;
}
