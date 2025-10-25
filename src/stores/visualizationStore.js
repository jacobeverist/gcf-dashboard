import { create } from 'zustand';

const useVisualizationStore = create((set, get) => ({
    // State
    timeSeriesData: {}, // { blockId: { data: [], maxPoints: 100 } }
    bitfieldData: {}, // { blockId: Uint8Array or Array }
    plots: [], // Array of plot configurations

    // Time Series Management
    updateTimeSeries: (blockId, value, timestamp) => {
        const { timeSeriesData } = get();
        const blockData = timeSeriesData[blockId] || { data: [], maxPoints: 100 };

        const newDataPoint = {
            timestamp: timestamp || Date.now(),
            value,
        };

        // Add new data point
        const newData = [...blockData.data, newDataPoint];

        // Keep only last maxPoints
        if (newData.length > blockData.maxPoints) {
            newData.shift();
        }

        set({
            timeSeriesData: {
                ...timeSeriesData,
                [blockId]: {
                    ...blockData,
                    data: newData,
                },
            },
        });
    },

    setTimeSeriesMaxPoints: (blockId, maxPoints) => {
        const { timeSeriesData } = get();
        const blockData = timeSeriesData[blockId] || { data: [], maxPoints: 100 };

        set({
            timeSeriesData: {
                ...timeSeriesData,
                [blockId]: {
                    ...blockData,
                    maxPoints,
                },
            },
        });
    },

    clearTimeSeriesForBlock: (blockId) => {
        const { timeSeriesData } = get();
        const newData = { ...timeSeriesData };
        delete newData[blockId];
        set({ timeSeriesData: newData });
    },

    // Bitfield Management
    updateBitfield: (blockId, bitfield) => {
        set({
            bitfieldData: {
                ...get().bitfieldData,
                [blockId]: bitfield,
            },
        });
    },

    clearBitfieldForBlock: (blockId) => {
        const { bitfieldData } = get();
        const newData = { ...bitfieldData };
        delete newData[blockId];
        set({ bitfieldData: newData });
    },

    // Plot Configuration
    initializePlots: (demoType) => {
        const plotConfigs = getPlotConfigsForDemo(demoType);
        set({ plots: plotConfigs });
    },

    addPlot: (plotConfig) => {
        set({
            plots: [...get().plots, plotConfig],
        });
    },

    removePlot: (plotId) => {
        set({
            plots: get().plots.filter((p) => p.id !== plotId),
        });
    },

    clearPlots: () => {
        set({ plots: [] });
    },

    // Clear all data
    clearData: () => {
        set({
            timeSeriesData: {},
            bitfieldData: {},
            plots: [],
        });
    },
}));

// Helper function to get plot configurations based on demo type
function getPlotConfigsForDemo(demoType) {
    const configs = {
        sequence: [
            {
                id: 'input-signal',
                title: 'Input Signal',
                color: '#4a9eff',
                yLabel: 'Value',
            },
            {
                id: 'prediction',
                title: 'Prediction',
                color: '#4aff4a',
                yLabel: 'Value',
            },
            {
                id: 'error',
                title: 'Prediction Error',
                color: '#ff4a4a',
                yLabel: 'Error',
            },
        ],
        classification: [
            {
                id: 'class-probs',
                title: 'Class Probabilities',
                color: '#4a9eff',
                yLabel: 'Probability',
            },
            {
                id: 'accuracy',
                title: 'Accuracy',
                color: '#4aff4a',
                yLabel: 'Accuracy',
            },
        ],
        context: [
            {
                id: 'context-activation',
                title: 'Context Activations',
                color: '#8DE2E2',
                yLabel: 'Activation',
            },
            {
                id: 'prediction',
                title: 'Predictions',
                color: '#4aff4a',
                yLabel: 'Value',
            },
        ],
        pooling: [
            {
                id: 'pooled-features',
                title: 'Pooled Features',
                color: '#A8D8A8',
                yLabel: 'Value',
            },
            {
                id: 'input-signals',
                title: 'Input Signals',
                color: '#4a9eff',
                yLabel: 'Value',
            },
        ],
    };

    return configs[demoType] || [];
}

export default useVisualizationStore;
