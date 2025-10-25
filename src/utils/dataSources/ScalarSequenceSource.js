/**
 * Scalar Sequence Source
 *
 * Generates continuous scalar sequences with various waveform patterns.
 * Useful for temperature, sensor data, stock prices, control signals, etc.
 */
import { BaseDataSource } from './BaseDataSource.js';
import { SeededRandom } from './SeededRandom.js';

export class ScalarSequenceSource extends BaseDataSource {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.id - Unique identifier
     * @param {string} config.name - Human-readable name
     * @param {string} [config.pattern='sine'] - Waveform pattern
     * @param {number} [config.amplitude=1.0] - Peak amplitude
     * @param {number} [config.frequency=0.1] - Frequency (cycles per step)
     * @param {number} [config.offset=0.0] - DC offset (mean value)
     * @param {number} [config.noise=0.0] - Gaussian noise standard deviation
     * @param {number} [config.min=-Infinity] - Minimum value (clipping)
     * @param {number} [config.max=Infinity] - Maximum value (clipping)
     * @param {number} [config.phase=0.0] - Initial phase offset (radians)
     * @param {number} [config.drift=0.0] - Drift for random walk
     * @param {number} [config.stepHeight=1.0] - Step height for step function
     * @param {number} [config.stepWidth=10] - Step width (in time steps)
     * @param {number} [config.seed=Date.now()] - Random seed
     */
    constructor(config) {
        super({ ...config, type: 'scalar' });

        // Configuration
        this.pattern = config.pattern || 'sine';
        this.amplitude = config.amplitude !== undefined ? config.amplitude : 1.0;
        this.frequency = config.frequency !== undefined ? config.frequency : 0.1;
        this.offset = config.offset !== undefined ? config.offset : 0.0;
        this.noise = config.noise !== undefined ? config.noise : 0.0;
        this.min = config.min !== undefined ? config.min : -Infinity;
        this.max = config.max !== undefined ? config.max : Infinity;
        this.seed = config.seed || Date.now();

        // Pattern-specific parameters
        this.phase = config.phase !== undefined ? config.phase : 0.0;
        this.drift = config.drift !== undefined ? config.drift : 0.0;
        this.stepHeight = config.stepHeight !== undefined ? config.stepHeight : 1.0;
        this.stepWidth = config.stepWidth !== undefined ? config.stepWidth : 10;

        // Internal state
        this.rng = null;
        this.accumulatedValue = 0.0; // For random walk

        this.init();
    }

    /**
     * Initialize the source
     */
    init() {
        this.rng = new SeededRandom(this.seed);
        this.accumulatedValue = this.offset;
        this.currentValue = this._generateValue();
    }

    /**
     * Generate next value
     * @returns {number} Next scalar value
     */
    generateNext() {
        let value = this._generateValue();

        // Add Gaussian noise
        if (this.noise > 0) {
            value += this.rng.gaussian(0, this.noise);
        }

        // Clip to bounds
        value = Math.max(this.min, Math.min(this.max, value));

        this.currentValue = value;
        return value;
    }

    /**
     * Generate value based on pattern
     * @private
     * @returns {number} Generated value
     */
    _generateValue() {
        switch (this.pattern) {
            case 'sine':
                return this._generateSine();

            case 'square':
                return this._generateSquare();

            case 'sawtooth':
                return this._generateSawtooth();

            case 'triangle':
                return this._generateTriangle();

            case 'randomWalk':
                return this._generateRandomWalk();

            case 'gaussian':
                return this._generateGaussian();

            case 'step':
                return this._generateStep();

            case 'linear':
                return this._generateLinear();

            case 'constant':
                return this._generateConstant();

            default:
                console.warn(`Unknown pattern: ${this.pattern}, using constant`);
                return this._generateConstant();
        }
    }

    /**
     * Sine wave: smooth oscillation
     * @private
     * @returns {number}
     */
    _generateSine() {
        const t = this.step * this.frequency * 2 * Math.PI;
        return this.offset + this.amplitude * Math.sin(t + this.phase);
    }

    /**
     * Square wave: alternating high/low
     * @private
     * @returns {number}
     */
    _generateSquare() {
        const t = this.step * this.frequency * 2 * Math.PI;
        const sign = Math.sin(t + this.phase) >= 0 ? 1 : -1;
        return this.offset + this.amplitude * sign;
    }

    /**
     * Sawtooth wave: linear ramp up, sharp drop
     * @private
     * @returns {number}
     */
    _generateSawtooth() {
        const t = this.step * this.frequency * 2 * Math.PI;
        const sawPhase = (t + this.phase) % (2 * Math.PI);
        const normalized = (2 * sawPhase / (2 * Math.PI)) - 1; // -1 to 1
        return this.offset + this.amplitude * normalized;
    }

    /**
     * Triangle wave: linear up, linear down
     * @private
     * @returns {number}
     */
    _generateTriangle() {
        const t = this.step * this.frequency * 2 * Math.PI;
        const triPhase = (t + this.phase) % (2 * Math.PI);

        let normalized;
        if (triPhase < Math.PI) {
            // Rising: -1 to 1
            normalized = (2 * triPhase / Math.PI) - 1;
        } else {
            // Falling: 1 to -1
            normalized = 3 - (2 * triPhase / Math.PI);
        }

        return this.offset + this.amplitude * normalized;
    }

    /**
     * Random walk: cumulative random steps
     * @private
     * @returns {number}
     */
    _generateRandomWalk() {
        const step = this.rng.gaussian(this.drift, this.amplitude);
        this.accumulatedValue += step;
        return this.accumulatedValue;
    }

    /**
     * Gaussian noise: random centered on mean
     * @private
     * @returns {number}
     */
    _generateGaussian() {
        return this.rng.gaussian(this.offset, this.amplitude);
    }

    /**
     * Step function: piecewise constant
     * @private
     * @returns {number}
     */
    _generateStep() {
        if (this.stepWidth <= 0) return this.offset;

        const stepIndex = Math.floor(this.step / this.stepWidth);
        const sign = (stepIndex % 2) === 0 ? 1 : -1;
        return this.offset + sign * this.stepHeight * this.amplitude;
    }

    /**
     * Linear: constant rate of change
     * @private
     * @returns {number}
     */
    _generateLinear() {
        return this.offset + this.amplitude * this.step;
    }

    /**
     * Constant: unchanging value
     * @private
     * @returns {number}
     */
    _generateConstant() {
        return this.offset;
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
            pattern: this.pattern,
            amplitude: this.amplitude,
            frequency: this.frequency,
            offset: this.offset,
            noise: this.noise,
            min: this.min,
            max: this.max,
            phase: this.phase,
            drift: this.drift,
            stepHeight: this.stepHeight,
            stepWidth: this.stepWidth,
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

        if (params.pattern !== undefined) {
            this.pattern = params.pattern;
        }
        if (params.amplitude !== undefined) {
            this.amplitude = params.amplitude;
        }
        if (params.frequency !== undefined) {
            this.frequency = params.frequency;
        }
        if (params.offset !== undefined) {
            this.offset = params.offset;
            needsReinit = true;
        }
        if (params.noise !== undefined) {
            this.noise = params.noise;
        }
        if (params.min !== undefined) {
            this.min = params.min;
        }
        if (params.max !== undefined) {
            this.max = params.max;
        }
        if (params.phase !== undefined) {
            this.phase = params.phase;
        }
        if (params.drift !== undefined) {
            this.drift = params.drift;
        }
        if (params.stepHeight !== undefined) {
            this.stepHeight = params.stepHeight;
        }
        if (params.stepWidth !== undefined) {
            this.stepWidth = params.stepWidth;
        }
        if (params.seed !== undefined) {
            this.seed = params.seed;
            needsReinit = true;
        }

        // Reinitialize if seed or offset changed
        if (needsReinit) {
            this.init();
        }
    }

    /**
     * Get pattern description
     * @returns {string} Human-readable pattern description
     */
    getPatternDescription() {
        const descriptions = {
            sine: 'Sine wave (smooth oscillation)',
            square: 'Square wave (on/off)',
            sawtooth: 'Sawtooth (linear ramp)',
            triangle: 'Triangle wave (up/down)',
            randomWalk: 'Random walk (cumulative)',
            gaussian: 'Gaussian noise',
            step: 'Step function',
            linear: 'Linear trend',
            constant: 'Constant value',
        };
        return descriptions[this.pattern] || 'Unknown';
    }

    /**
     * Get formatted value string
     * @param {number} [decimals=2] - Number of decimal places
     * @returns {string} Formatted value
     */
    getFormattedValue(decimals = 2) {
        if (this.currentValue === null) {
            return 'N/A';
        }
        return this.currentValue.toFixed(decimals);
    }
}
