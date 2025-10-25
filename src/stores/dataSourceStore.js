/**
 * Data Source Store
 *
 * Manages data source instances using Zustand.
 * Handles execution, configuration, and integration with the network.
 */
import { create } from 'zustand';
import { DiscreteSequenceSource } from '../utils/dataSources/DiscreteSequenceSource.js';
import { ScalarSequenceSource } from '../utils/dataSources/ScalarSequenceSource.js';

const useDataSourceStore = create((set, get) => ({
    // State
    sources: {}, // Map of sourceId -> DataSource instance
    executionOrder: [], // Array of source IDs in execution order
    statistics: {}, // Map of sourceId -> statistics object

    // Actions

    /**
     * Add a new data source
     * @param {string} type - 'discrete' or 'scalar'
     * @param {Object} config - Configuration for the data source
     * @returns {string} The ID of the created source
     */
    addSource: (type, config) => {
        let source;

        try {
            if (type === 'discrete') {
                source = new DiscreteSequenceSource(config);
            } else if (type === 'scalar') {
                source = new ScalarSequenceSource(config);
            } else {
                console.error(`Unknown data source type: ${type}`);
                return null;
            }

            const sourceId = source.id;

            set((state) => ({
                sources: {
                    ...state.sources,
                    [sourceId]: source,
                },
                executionOrder: [...state.executionOrder, sourceId],
            }));

            console.log(`[DataSourceStore] Added ${type} source:`, sourceId);
            return sourceId;
        } catch (error) {
            console.error('[DataSourceStore] Failed to create source:', error);
            return null;
        }
    },

    /**
     * Remove a data source
     * @param {string} sourceId - ID of the source to remove
     */
    removeSource: (sourceId) => {
        const { sources, executionOrder, statistics } = get();

        if (!sources[sourceId]) {
            console.warn(`[DataSourceStore] Source not found: ${sourceId}`);
            return;
        }

        const newSources = { ...sources };
        delete newSources[sourceId];

        const newStatistics = { ...statistics };
        delete newStatistics[sourceId];

        set({
            sources: newSources,
            executionOrder: executionOrder.filter((id) => id !== sourceId),
            statistics: newStatistics,
        });

        console.log(`[DataSourceStore] Removed source:`, sourceId);
    },

    /**
     * Get a data source by ID
     * @param {string} sourceId - ID of the source
     * @returns {BaseDataSource|null} The data source instance or null
     */
    getSource: (sourceId) => {
        return get().sources[sourceId] || null;
    },

    /**
     * Get all data sources
     * @returns {Object} Map of sourceId -> DataSource
     */
    getAllSources: () => {
        return get().sources;
    },

    /**
     * Get all enabled data sources
     * @returns {Array} Array of enabled DataSource instances
     */
    getEnabledSources: () => {
        const { sources, executionOrder } = get();
        return executionOrder
            .map((id) => sources[id])
            .filter((source) => source && source.isEnabled());
    },

    /**
     * Update source parameters
     * @param {string} sourceId - ID of the source
     * @param {Object} params - Parameters to update
     */
    updateSource: (sourceId, params) => {
        const source = get().sources[sourceId];
        if (!source) {
            console.warn(`[DataSourceStore] Source not found: ${sourceId}`);
            return;
        }

        try {
            source.updateParams(params);

            // Trigger re-render by creating new reference
            set((state) => ({
                sources: { ...state.sources },
            }));

            console.log(`[DataSourceStore] Updated source:`, sourceId);
        } catch (error) {
            console.error('[DataSourceStore] Failed to update source:', error);
        }
    },

    /**
     * Enable or disable a data source
     * @param {string} sourceId - ID of the source
     * @param {boolean} enabled - New enabled state
     */
    setSourceEnabled: (sourceId, enabled) => {
        const source = get().sources[sourceId];
        if (!source) {
            console.warn(`[DataSourceStore] Source not found: ${sourceId}`);
            return;
        }

        source.setEnabled(enabled);

        // Trigger re-render
        set((state) => ({
            sources: { ...state.sources },
        }));

        console.log(`[DataSourceStore] Set source ${sourceId} enabled:`, enabled);
    },

    /**
     * Reset a data source to initial state
     * @param {string} sourceId - ID of the source
     */
    resetSource: (sourceId) => {
        const source = get().sources[sourceId];
        if (!source) {
            console.warn(`[DataSourceStore] Source not found: ${sourceId}`);
            return;
        }

        try {
            source.reset();

            // Trigger re-render
            set((state) => ({
                sources: { ...state.sources },
                statistics: {
                    ...state.statistics,
                    [sourceId]: source.getStatistics(),
                },
            }));

            console.log(`[DataSourceStore] Reset source:`, sourceId);
        } catch (error) {
            console.error('[DataSourceStore] Failed to reset source:', error);
        }
    },

    /**
     * Execute all enabled data sources (one step)
     * @returns {Object} Map of sourceId -> current value
     */
    executeAllSources: () => {
        const { sources, executionOrder } = get();
        const values = {};

        executionOrder.forEach((sourceId) => {
            const source = sources[sourceId];
            if (source && source.isEnabled()) {
                try {
                    const value = source.execute();
                    values[sourceId] = value;
                } catch (error) {
                    console.error(`[DataSourceStore] Error executing source ${sourceId}:`, error);
                }
            }
        });

        // Update statistics for all sources
        const newStatistics = {};
        Object.keys(sources).forEach((sourceId) => {
            newStatistics[sourceId] = sources[sourceId].getStatistics();
        });

        set({ statistics: newStatistics });

        return values;
    },

    /**
     * Get current value from a data source
     * @param {string} sourceId - ID of the source
     * @returns {number|null} Current value
     */
    getSourceValue: (sourceId) => {
        const source = get().sources[sourceId];
        return source ? source.getValue() : null;
    },

    /**
     * Get history from a data source
     * @param {string} sourceId - ID of the source
     * @param {number} [length] - Number of recent values (default: all)
     * @returns {Array<number>} History array
     */
    getSourceHistory: (sourceId, length) => {
        const source = get().sources[sourceId];
        return source ? source.getHistory(length) : [];
    },

    /**
     * Get statistics for a data source
     * @param {string} sourceId - ID of the source
     * @returns {Object} Statistics object
     */
    getSourceStatistics: (sourceId) => {
        return get().statistics[sourceId] || null;
    },

    /**
     * Get info about a data source
     * @param {string} sourceId - ID of the source
     * @returns {Object|null} Info object
     */
    getSourceInfo: (sourceId) => {
        const source = get().sources[sourceId];
        return source ? source.getInfo() : null;
    },

    /**
     * Get configuration for a data source (for serialization)
     * @param {string} sourceId - ID of the source
     * @returns {Object|null} Configuration object
     */
    getSourceConfig: (sourceId) => {
        const source = get().sources[sourceId];
        return source ? source.getConfig() : null;
    },

    /**
     * Get all configurations (for serialization)
     * @returns {Array<Object>} Array of configuration objects
     */
    getAllConfigs: () => {
        const sources = get().sources;
        return Object.keys(sources).map((sourceId) => sources[sourceId].getConfig());
    },

    /**
     * Load data sources from configuration array
     * @param {Array<Object>} configs - Array of configuration objects
     */
    loadFromConfigs: (configs) => {
        const { addSource } = get();

        // Clear existing sources
        set({
            sources: {},
            executionOrder: [],
            statistics: {},
        });

        // Load each configuration
        configs.forEach((config) => {
            try {
                addSource(config.type, config);
            } catch (error) {
                console.error('[DataSourceStore] Failed to load source from config:', error);
            }
        });

        console.log(`[DataSourceStore] Loaded ${configs.length} sources from configurations`);
    },

    /**
     * Set execution order
     * @param {Array<string>} order - Array of source IDs in desired order
     */
    setExecutionOrder: (order) => {
        set({ executionOrder: order });
    },

    /**
     * Reset all data sources
     */
    resetAll: () => {
        const sources = get().sources;
        Object.keys(sources).forEach((sourceId) => {
            try {
                sources[sourceId].reset();
            } catch (error) {
                console.error(`[DataSourceStore] Failed to reset source ${sourceId}:`, error);
            }
        });

        // Update statistics
        const newStatistics = {};
        Object.keys(sources).forEach((sourceId) => {
            newStatistics[sourceId] = sources[sourceId].getStatistics();
        });

        set({
            sources: { ...sources },
            statistics: newStatistics,
        });

        console.log('[DataSourceStore] Reset all sources');
    },

    /**
     * Clear all data sources
     */
    clear: () => {
        set({
            sources: {},
            executionOrder: [],
            statistics: {},
        });

        console.log('[DataSourceStore] Cleared all sources');
    },

    /**
     * Get count of data sources
     * @returns {number} Number of sources
     */
    getSourceCount: () => {
        return Object.keys(get().sources).length;
    },

    /**
     * Get count of enabled data sources
     * @returns {number} Number of enabled sources
     */
    getEnabledSourceCount: () => {
        const sources = get().sources;
        return Object.values(sources).filter((source) => source.isEnabled()).length;
    },
}));

export default useDataSourceStore;
