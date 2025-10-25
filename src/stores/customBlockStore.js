import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Block type definitions
 */
const DEFAULT_BLOCK_TYPES = {
    data_source: {
        category: 'Data Sources',
        shape: 'circle',
        defaultParams: {
            pattern: 'sine',
            frequency: 0.1,
            amplitude: 1.0,
        },
    },
    transformer: {
        category: 'Transformers',
        shape: 'triangle',
        defaultParams: {
            size: 128,
            threshold: 0.5,
        },
    },
    learner: {
        category: 'Learning',
        shape: 'horizontal-rect',
        defaultParams: {
            capacity: 256,
            learningRate: 0.01,
        },
    },
    temporal: {
        category: 'Temporal',
        shape: 'square',
        defaultParams: {
            historySize: 100,
            decayRate: 0.95,
        },
    },
};

/**
 * Built-in block definitions
 */
const BUILTIN_BLOCKS = [
    // Data Sources
    {
        id: 'DiscreteDataSource',
        name: 'Discrete Source',
        type: 'data_source',
        icon: '●',
        color: '#FF80AB',
        isBuiltin: true,
        params: {
            pattern: {
                type: 'select',
                options: ['sequential', 'cyclic', 'random', 'weighted', 'custom'],
                default: 'sequential',
                label: 'Pattern'
            },
            numCategories: { type: 'number', min: 2, max: 100, step: 1, default: 10, label: 'Categories' },
            changeEvery: { type: 'number', min: 1, max: 100, step: 1, default: 1, label: 'Change Every' },
            noise: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.0, label: 'Noise' },
        },
    },
    {
        id: 'ScalarDataSource',
        name: 'Scalar Source',
        type: 'data_source',
        icon: '●',
        color: '#FFB366',
        isBuiltin: true,
        params: {
            pattern: {
                type: 'select',
                options: ['sine', 'square', 'sawtooth', 'triangle', 'randomWalk', 'gaussian', 'step', 'linear', 'constant'],
                default: 'sine',
                label: 'Pattern'
            },
            amplitude: { type: 'number', min: 0, max: 100, step: 0.1, default: 1.0, label: 'Amplitude' },
            frequency: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.1, label: 'Frequency' },
            offset: { type: 'number', min: -100, max: 100, step: 0.1, default: 0.0, label: 'Offset' },
            noise: { type: 'number', min: 0, max: 10, step: 0.1, default: 0.0, label: 'Noise' },
        },
    },
    // Transformers
    {
        id: 'ScalarTransformer',
        name: 'Scalar',
        type: 'transformer',
        icon: '△',
        color: '#4A9EFF',
        isBuiltin: true,
        params: {
            size: { type: 'number', min: 16, max: 1024, step: 16, default: 128, label: 'Size' },
            threshold: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.5, label: 'Threshold' },
        },
    },
    {
        id: 'DiscreteTransformer',
        name: 'Discrete',
        type: 'transformer',
        icon: '△',
        color: '#FF9E4A',
        isBuiltin: true,
        params: {
            size: { type: 'number', min: 16, max: 1024, step: 16, default: 128, label: 'Size' },
            bins: { type: 'number', min: 2, max: 256, step: 1, default: 16, label: 'Bins' },
        },
    },
    {
        id: 'PersistenceTransformer',
        name: 'Persistence',
        type: 'transformer',
        icon: '△',
        color: '#A64AFF',
        isBuiltin: true,
        params: {
            size: { type: 'number', min: 16, max: 1024, step: 16, default: 128, label: 'Size' },
            persistence: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.8, label: 'Persistence' },
        },
    },
    {
        id: 'PatternPooler',
        name: 'Pooler',
        type: 'learner',
        icon: '▬',
        color: '#4AFFDB',
        isBuiltin: true,
        params: {
            capacity: { type: 'number', min: 64, max: 2048, step: 64, default: 256, label: 'Capacity' },
            learningRate: { type: 'number', min: 0, max: 1, step: 0.001, default: 0.01, label: 'Learning Rate' },
        },
    },
    {
        id: 'PatternClassifier',
        name: 'Classifier',
        type: 'learner',
        icon: '▬',
        color: '#FF4A9E',
        isBuiltin: true,
        params: {
            capacity: { type: 'number', min: 64, max: 2048, step: 64, default: 256, label: 'Capacity' },
            numClasses: { type: 'number', min: 2, max: 100, step: 1, default: 10, label: 'Num Classes' },
        },
    },
    {
        id: 'SequenceLearner',
        name: 'Sequence',
        type: 'temporal',
        icon: '■',
        color: '#FFE44A',
        isBuiltin: true,
        params: {
            historySize: { type: 'number', min: 10, max: 1000, step: 10, default: 100, label: 'History Size' },
            decayRate: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.95, label: 'Decay Rate' },
        },
    },
    {
        id: 'ContextLearner',
        name: 'Context',
        type: 'temporal',
        icon: '■',
        color: '#4AFF9E',
        isBuiltin: true,
        params: {
            historySize: { type: 'number', min: 10, max: 1000, step: 10, default: 100, label: 'History Size' },
            contextWindow: { type: 'number', min: 1, max: 50, step: 1, default: 10, label: 'Context Window' },
        },
    },
];

const useCustomBlockStore = create(
    persist(
        (set, get) => ({
            // State
            customBlocks: [],

            // Get all blocks (built-in + custom)
            getAllBlocks: () => {
                return [...BUILTIN_BLOCKS, ...get().customBlocks];
            },

            // Get blocks by category
            getBlocksByCategory: () => {
                const allBlocks = get().getAllBlocks();
                const categories = {};

                allBlocks.forEach(block => {
                    const categoryName = DEFAULT_BLOCK_TYPES[block.type]?.category || 'Other';
                    if (!categories[categoryName]) {
                        categories[categoryName] = [];
                    }
                    categories[categoryName].push(block);
                });

                return categories;
            },

            // Get block definition by ID
            getBlockById: (id) => {
                return get().getAllBlocks().find(block => block.id === id);
            },

            // Add custom block
            addCustomBlock: (blockData) => {
                const customBlock = {
                    id: `custom_${Date.now()}`,
                    name: blockData.name || 'Custom Block',
                    type: blockData.type || 'transformer',
                    icon: blockData.icon || '◆',
                    color: blockData.color || '#888888',
                    isBuiltin: false,
                    params: blockData.params || {},
                    createdAt: Date.now(),
                };

                set({
                    customBlocks: [...get().customBlocks, customBlock],
                });

                console.log('[Custom Block Store] Added custom block:', customBlock);
                return customBlock;
            },

            // Update custom block
            updateCustomBlock: (id, updates) => {
                set({
                    customBlocks: get().customBlocks.map(block =>
                        block.id === id ? { ...block, ...updates } : block
                    ),
                });
            },

            // Remove custom block
            removeCustomBlock: (id) => {
                set({
                    customBlocks: get().customBlocks.filter(block => block.id !== id),
                });
                console.log('[Custom Block Store] Removed custom block:', id);
            },

            // Reset to defaults (remove all custom blocks)
            resetCustomBlocks: () => {
                set({ customBlocks: [] });
            },
        }),
        {
            name: 'custom-blocks-storage',
            partialize: (state) => ({ customBlocks: state.customBlocks }),
        }
    )
);

export default useCustomBlockStore;
export { DEFAULT_BLOCK_TYPES, BUILTIN_BLOCKS };
