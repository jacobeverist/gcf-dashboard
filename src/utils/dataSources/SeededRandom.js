/**
 * Seeded Random Number Generator
 *
 * Provides reproducible pseudo-random number generation using a seed.
 * Uses a simple Linear Congruential Generator (LCG) algorithm.
 */
export class SeededRandom {
    /**
     * @param {number} seed - Initial seed value
     */
    constructor(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }

    /**
     * Generate next random number in [0, 1)
     * @returns {number} Random value between 0 (inclusive) and 1 (exclusive)
     */
    random() {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }

    /**
     * Generate random integer in [min, max)
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (exclusive)
     * @returns {number} Random integer
     */
    randomInt(min, max) {
        return Math.floor(this.random() * (max - min)) + min;
    }

    /**
     * Generate random value from Gaussian (normal) distribution
     * Uses Box-Muller transform
     * @param {number} mean - Mean of distribution
     * @param {number} stddev - Standard deviation
     * @returns {number} Random value from normal distribution
     */
    gaussian(mean = 0, stddev = 1) {
        // Box-Muller transform
        const u1 = this.random();
        const u2 = this.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * stddev + mean;
    }

    /**
     * Choose random element from array
     * @param {Array} array - Array to choose from
     * @returns {*} Random element
     */
    choice(array) {
        if (!array || array.length === 0) return null;
        return array[this.randomInt(0, array.length)];
    }

    /**
     * Shuffle array in place using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array (same reference)
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.randomInt(0, i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Reset the generator with a new seed
     * @param {number} seed - New seed value
     */
    reset(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }
}
