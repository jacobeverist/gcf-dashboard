/**
 * Discrete Sequence Source
 *
 * Generates discrete/categorical sequences with various patterns.
 * Useful for state machines, day of week, categorical sequences, etc.
 */
import { BaseDataSource } from './BaseDataSource.js';
import { SeededRandom } from './SeededRandom.js';

export class DiscreteSequenceSource extends BaseDataSource {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.id - Unique identifier
     * @param {string} config.name - Human-readable name
     * @param {number} [config.numCategories=10] - Number of discrete categories (0 to numCategories-1)
     * @param {string} [config.pattern='sequential'] - Pattern type
     * @param {number} [config.changeEvery=1] - Steps between value changes
     * @param {number} [config.noise=0] - Probability of random deviation (0-1)
     * @param {Array<number>} [config.customSequence=[]] - Custom sequence to repeat
     * @param {Array<number>} [config.weights=null] - Weights for weighted random pattern
     * @param {number} [config.seed=Date.now()] - Random seed for reproducibility
     */
    constructor(config) {
        super({ ...config, type: 'discrete' });

        // Configuration
        this.numCategories = config.numCategories || 10;
        this.pattern = config.pattern || 'sequential';
        this.changeEvery = config.changeEvery || 1;
        this.noise = config.noise || 0.0;
        this.customSequence = config.customSequence || [];
        this.weights = config.weights || null;
        this.seed = config.seed || Date.now();

        // Internal state
        this.rng = null;
        this.sequenceIndex = 0;
        this.stepsSinceChange = 0;

        this.init();
    }

    /**
     * Initialize the source
     */
    init() {
        // Initialize RNG with seed
        this.rng = new SeededRandom(this.seed);
        this.sequenceIndex = 0;
        this.stepsSinceChange = 0;

        // Generate initial value
        this.currentValue = this._generateValue();
    }

    /**
     * Generate next value
     * @returns {number} Next discrete value
     */
    generateNext() {
        this.stepsSinceChange++;

        // Check if it's time to change value
        if (this.stepsSinceChange >= this.changeEvery) {
            this.stepsSinceChange = 0;
            this.sequenceIndex++;
            this.currentValue = this._generateValue();
        }

        // Apply noise (random deviations)
        if (this.noise > 0 && this.rng.random() < this.noise) {
            this.currentValue = this.rng.randomInt(0, this.numCategories);
        }

        return this.currentValue;
    }

    /**
     * Generate value based on pattern
     * @private
     * @returns {number} Generated value
     */
    _generateValue() {
        switch (this.pattern) {
            case 'sequential':
                return this._generateSequential();

            case 'cyclic':
                return this._generateCyclic();

            case 'random':
                return this._generateRandom();

            case 'weighted':
                return this._generateWeighted();

            case 'custom':
                return this._generateCustom();

            default:
                console.warn(`Unknown pattern: ${this.pattern}, using sequential`);
                return this._generateSequential();
        }
    }

    /**
     * Sequential: 0, 1, 2, 3, ..., n-1, 0, 1, 2, ...
     * @private
     * @returns {number}
     */
    _generateSequential() {
        return this.sequenceIndex % this.numCategories;
    }

    /**
     * Cyclic: 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, ...
     * Goes up then back down
     * @private
     * @returns {number}
     */
    _generateCyclic() {
        const period = 2 * this.numCategories - 2;
        if (period <= 0) return 0;

        const pos = this.sequenceIndex % period;
        return pos < this.numCategories
            ? pos
            : (2 * this.numCategories - 2 - pos);
    }

    /**
     * Random: uniformly random values
     * @private
     * @returns {number}
     */
    _generateRandom() {
        return this.rng.randomInt(0, this.numCategories);
    }

    /**
     * Weighted random: values with different probabilities
     * @private
     * @returns {number}
     */
    _generateWeighted() {
        // If no weights specified or wrong length, fall back to uniform random
        if (!this.weights || this.weights.length !== this.numCategories) {
            return this.rng.randomInt(0, this.numCategories);
        }

        // Weighted selection
        const totalWeight = this.weights.reduce((sum, w) => sum + w, 0);
        if (totalWeight <= 0) {
            return this.rng.randomInt(0, this.numCategories);
        }

        let random = this.rng.random() * totalWeight;

        for (let i = 0; i < this.numCategories; i++) {
            random -= this.weights[i];
            if (random <= 0) {
                return i;
            }
        }

        return this.numCategories - 1;
    }

    /**
     * Custom: user-defined sequence that repeats
     * @private
     * @returns {number}
     */
    _generateCustom() {
        if (!this.customSequence || this.customSequence.length === 0) {
            return 0;
        }

        const index = this.sequenceIndex % this.customSequence.length;
        const value = this.customSequence[index];

        // Ensure value is within valid range
        return Math.max(0, Math.min(this.numCategories - 1, value));
    }

    /**
     * Get configuration for serialization
     * @returns {Object} Configuration object
     */
    getConfig() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            enabled: this.enabled,
            numCategories: this.numCategories,
            pattern: this.pattern,
            changeEvery: this.changeEvery,
            noise: this.noise,
            customSequence: [...this.customSequence],
            weights: this.weights ? [...this.weights] : null,
            seed: this.seed,
            maxHistory: this.maxHistory,
        };
    }

    /**
     * Update parameters
     * @param {Object} params - Parameters to update
     */
    updateParams(params) {
        super.updateParams(params);

        let needsReinit = false;

        if (params.numCategories !== undefined) {
            this.numCategories = params.numCategories;
            needsReinit = true;
        }
        if (params.pattern !== undefined) {
            this.pattern = params.pattern;
        }
        if (params.changeEvery !== undefined) {
            this.changeEvery = params.changeEvery;
        }
        if (params.noise !== undefined) {
            this.noise = params.noise;
        }
        if (params.customSequence !== undefined) {
            this.customSequence = params.customSequence;
        }
        if (params.weights !== undefined) {
            this.weights = params.weights;
        }
        if (params.seed !== undefined) {
            this.seed = params.seed;
            needsReinit = true;
        }

        // Reinitialize if seed or categories changed
        if (needsReinit) {
            this.init();
        }
    }

    /**
     * Get human-readable label for current value
     * @param {Array<string>} [labels] - Optional category labels
     * @returns {string} Label for current value
     */
    getValueLabel(labels) {
        if (this.currentValue === null) {
            return 'N/A';
        }

        if (labels && labels.length > this.currentValue) {
            return labels[this.currentValue];
        }

        return `${this.currentValue}`;
    }

    /**
     * Get pattern description
     * @returns {string} Human-readable pattern description
     */
    getPatternDescription() {
        const descriptions = {
            sequential: 'Sequential (0, 1, 2, ...)',
            cyclic: 'Cyclic (up then down)',
            random: 'Uniform random',
            weighted: 'Weighted random',
            custom: 'Custom sequence',
        };
        return descriptions[this.pattern] || 'Unknown';
    }
}
