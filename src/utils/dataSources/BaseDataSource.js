/**
 * Base class for all data sources
 *
 * Data sources generate input values for transformer blocks.
 * They maintain their own state and history independently of the WASM network.
 */
export class BaseDataSource {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.id - Unique identifier
     * @param {string} config.name - Human-readable name
     * @param {string} config.type - Type: 'discrete' or 'scalar'
     * @param {boolean} [config.enabled=true] - Whether source is active
     * @param {number} [config.maxHistory=100] - Maximum history length
     */
    constructor(config) {
        this.id = config.id || this.generateId();
        this.name = config.name || 'Data Source';
        this.type = config.type; // 'discrete' or 'scalar'
        this.enabled = config.enabled !== undefined ? config.enabled : true;

        // Execution state
        this.step = 0;
        this.currentValue = null;
        this.history = [];
        this.maxHistory = config.maxHistory || 100;

        // Metadata
        this.createdAt = Date.now();
        this.lastUpdated = Date.now();
    }

    /**
     * Generate unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return `ds-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Initialize the source (called once before first execution)
     * Subclasses should override this to set up RNG, initial state, etc.
     */
    init() {
        throw new Error('init() must be implemented by subclass');
    }

    /**
     * Generate next value in sequence
     * Subclasses must implement this.
     * @returns {number} Next value
     */
    generateNext() {
        throw new Error('generateNext() must be implemented by subclass');
    }

    /**
     * Execute one step (advance and generate new value)
     * @returns {number} Current value after execution
     */
    execute() {
        if (!this.enabled) {
            return this.currentValue;
        }

        this.step++;
        this.currentValue = this.generateNext();

        // Add to history
        this.history.push(this.currentValue);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        this.lastUpdated = Date.now();
        return this.currentValue;
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.step = 0;
        this.currentValue = null;
        this.history = [];
        this.init();
    }

    /**
     * Get current value without stepping
     * @returns {number|null} Current value
     */
    getValue() {
        return this.currentValue;
    }

    /**
     * Get value history
     * @param {number} [length] - Number of recent values to return (default: all)
     * @returns {Array<number>} History array
     */
    getHistory(length) {
        if (length === undefined) {
            return [...this.history];
        }
        return this.history.slice(-length);
    }

    /**
     * Get statistics about generated values
     * @returns {Object} Statistics
     */
    getStatistics() {
        if (this.history.length === 0) {
            return { count: 0, min: null, max: null, mean: null, stddev: null };
        }

        const count = this.history.length;
        const min = Math.min(...this.history);
        const max = Math.max(...this.history);
        const sum = this.history.reduce((a, b) => a + b, 0);
        const mean = sum / count;

        const variance = this.history.reduce((sum, val) => {
            return sum + Math.pow(val - mean, 2);
        }, 0) / count;
        const stddev = Math.sqrt(variance);

        return { count, min, max, mean, stddev };
    }

    /**
     * Enable or disable this source
     * @param {boolean} enabled - New enabled state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Check if source is enabled
     * @returns {boolean} Enabled state
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Get configuration for serialization
     * Subclasses should override and include their specific parameters.
     * @returns {Object} Configuration object
     */
    getConfig() {
        throw new Error('getConfig() must be implemented by subclass');
    }

    /**
     * Get basic info (common to all sources)
     * @returns {Object} Basic information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            enabled: this.enabled,
            step: this.step,
            currentValue: this.currentValue,
            historyLength: this.history.length,
            createdAt: this.createdAt,
            lastUpdated: this.lastUpdated,
        };
    }

    /**
     * Update configuration parameters
     * Subclasses should override to handle their specific parameters.
     * @param {Object} params - Parameters to update
     */
    updateParams(params) {
        if (params.name !== undefined) this.name = params.name;
        if (params.enabled !== undefined) this.enabled = params.enabled;
        if (params.maxHistory !== undefined) this.maxHistory = params.maxHistory;
    }
}
