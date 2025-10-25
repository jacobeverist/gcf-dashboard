/**
 * Performance Monitor
 *
 * Tracks execution timing, performance metrics, and resource usage
 * for the WASM network operations.
 */

/**
 * Performance profiler class
 */
export class PerformanceProfiler {
    constructor() {
        this.metrics = {
            execution: {
                count: 0,
                totalTime: 0,
                minTime: Infinity,
                maxTime: 0,
                lastTime: 0,
                history: [], // Ring buffer of last N execution times
            },
            operations: new Map(), // Custom operation timings
            memory: {
                snapshots: [],
                peak: 0,
            },
        };

        this.maxHistorySize = 100;
        this.startTime = performance.now();
    }

    /**
     * Start timing an operation
     * @param {string} operationName - Name of the operation
     * @returns {function} End timing function
     */
    startOperation(operationName) {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            this.recordOperation(operationName, duration);
            return duration;
        };
    }

    /**
     * Record operation timing
     * @param {string} operationName - Name of the operation
     * @param {number} duration - Duration in ms
     */
    recordOperation(operationName, duration) {
        if (!this.metrics.operations.has(operationName)) {
            this.metrics.operations.set(operationName, {
                count: 0,
                totalTime: 0,
                minTime: Infinity,
                maxTime: 0,
                avgTime: 0,
            });
        }

        const opMetrics = this.metrics.operations.get(operationName);
        opMetrics.count++;
        opMetrics.totalTime += duration;
        opMetrics.minTime = Math.min(opMetrics.minTime, duration);
        opMetrics.maxTime = Math.max(opMetrics.maxTime, duration);
        opMetrics.avgTime = opMetrics.totalTime / opMetrics.count;
    }

    /**
     * Record execution step timing
     * @param {number} duration - Duration in ms
     */
    recordExecution(duration) {
        const exec = this.metrics.execution;

        exec.count++;
        exec.totalTime += duration;
        exec.minTime = Math.min(exec.minTime, duration);
        exec.maxTime = Math.max(exec.maxTime, duration);
        exec.lastTime = duration;

        // Add to history (ring buffer)
        exec.history.push(duration);
        if (exec.history.length > this.maxHistorySize) {
            exec.history.shift();
        }
    }

    /**
     * Record memory snapshot
     * @param {object} memoryUsage - Memory usage data
     */
    recordMemory(memoryUsage) {
        const snapshot = {
            timestamp: performance.now(),
            ...memoryUsage,
        };

        this.metrics.memory.snapshots.push(snapshot);
        this.metrics.memory.peak = Math.max(
            this.metrics.memory.peak,
            memoryUsage.totalBytes || 0
        );

        // Keep only last 100 snapshots
        if (this.metrics.memory.snapshots.length > this.maxHistorySize) {
            this.metrics.memory.snapshots.shift();
        }
    }

    /**
     * Get execution statistics
     * @returns {object} Execution stats
     */
    getExecutionStats() {
        const exec = this.metrics.execution;

        if (exec.count === 0) {
            return {
                count: 0,
                avgTime: 0,
                minTime: 0,
                maxTime: 0,
                totalTime: 0,
                stepsPerSecond: 0,
            };
        }

        const avgTime = exec.totalTime / exec.count;
        const elapsedTime = performance.now() - this.startTime;
        const stepsPerSecond = (exec.count / elapsedTime) * 1000;

        // Calculate recent average (last 10 executions)
        const recentHistory = exec.history.slice(-10);
        const recentAvg = recentHistory.length > 0
            ? recentHistory.reduce((sum, t) => sum + t, 0) / recentHistory.length
            : 0;

        return {
            count: exec.count,
            avgTime,
            recentAvgTime: recentAvg,
            minTime: exec.minTime === Infinity ? 0 : exec.minTime,
            maxTime: exec.maxTime,
            totalTime: exec.totalTime,
            stepsPerSecond,
            history: exec.history,
        };
    }

    /**
     * Get operation statistics
     * @param {string} operationName - Optional operation name filter
     * @returns {object|Map} Operation stats
     */
    getOperationStats(operationName = null) {
        if (operationName) {
            return this.metrics.operations.get(operationName) || null;
        }

        return this.metrics.operations;
    }

    /**
     * Get memory statistics
     * @returns {object} Memory stats
     */
    getMemoryStats() {
        const snapshots = this.metrics.memory.snapshots;

        if (snapshots.length === 0) {
            return {
                current: 0,
                peak: 0,
                average: 0,
                trend: 'stable',
            };
        }

        const current = snapshots[snapshots.length - 1].totalBytes || 0;
        const average = snapshots.reduce((sum, s) => sum + (s.totalBytes || 0), 0) / snapshots.length;

        // Calculate trend (comparing first half vs second half)
        const midpoint = Math.floor(snapshots.length / 2);
        const firstHalfAvg = snapshots
            .slice(0, midpoint)
            .reduce((sum, s) => sum + (s.totalBytes || 0), 0) / midpoint;
        const secondHalfAvg = snapshots
            .slice(midpoint)
            .reduce((sum, s) => sum + (s.totalBytes || 0), 0) / (snapshots.length - midpoint);

        let trend = 'stable';
        const trendThreshold = 0.1; // 10% change
        if (secondHalfAvg > firstHalfAvg * (1 + trendThreshold)) {
            trend = 'increasing';
        } else if (secondHalfAvg < firstHalfAvg * (1 - trendThreshold)) {
            trend = 'decreasing';
        }

        return {
            current,
            currentKB: (current / 1024).toFixed(2),
            peak: this.metrics.memory.peak,
            peakKB: (this.metrics.memory.peak / 1024).toFixed(2),
            average,
            averageKB: (average / 1024).toFixed(2),
            trend,
            snapshots: snapshots.length,
        };
    }

    /**
     * Get overall performance summary
     * @returns {object} Complete performance summary
     */
    getSummary() {
        const elapsedTime = (performance.now() - this.startTime) / 1000; // Convert to seconds

        return {
            uptime: elapsedTime.toFixed(2),
            execution: this.getExecutionStats(),
            operations: Object.fromEntries(this.metrics.operations),
            memory: this.getMemoryStats(),
        };
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.metrics.execution = {
            count: 0,
            totalTime: 0,
            minTime: Infinity,
            maxTime: 0,
            lastTime: 0,
            history: [],
        };
        this.metrics.operations.clear();
        this.metrics.memory = {
            snapshots: [],
            peak: 0,
        };
        this.startTime = performance.now();
    }

    /**
     * Export metrics to JSON
     * @returns {object} Serializable metrics
     */
    export() {
        return {
            timestamp: new Date().toISOString(),
            summary: this.getSummary(),
            raw: {
                execution: this.metrics.execution,
                operations: Object.fromEntries(this.metrics.operations),
                memory: this.metrics.memory,
            },
        };
    }
}

/**
 * Create a simple timer for measuring operations
 * @returns {{start: function, stop: function, elapsed: function}}
 */
export function createTimer() {
    let startTime = null;
    let endTime = null;

    return {
        start() {
            startTime = performance.now();
            endTime = null;
        },
        stop() {
            endTime = performance.now();
            return this.elapsed();
        },
        elapsed() {
            if (startTime === null) return 0;
            const end = endTime || performance.now();
            return end - startTime;
        },
    };
}

/**
 * Debounce function for performance optimization
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance optimization
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;

    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Measure frame rate
 */
export class FrameRateMonitor {
    constructor() {
        this.frames = [];
        this.lastTime = performance.now();
        this.maxSamples = 60;
    }

    /**
     * Record a frame
     */
    recordFrame() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;

        this.frames.push(delta);
        if (this.frames.length > this.maxSamples) {
            this.frames.shift();
        }
    }

    /**
     * Get current FPS
     * @returns {number} Frames per second
     */
    getFPS() {
        if (this.frames.length === 0) return 0;

        const avgDelta = this.frames.reduce((sum, d) => sum + d, 0) / this.frames.length;
        return Math.round(1000 / avgDelta);
    }

    /**
     * Get detailed frame stats
     * @returns {object} Frame statistics
     */
    getStats() {
        if (this.frames.length === 0) {
            return {
                fps: 0,
                avgFrameTime: 0,
                minFrameTime: 0,
                maxFrameTime: 0,
            };
        }

        const avgDelta = this.frames.reduce((sum, d) => sum + d, 0) / this.frames.length;
        const minDelta = Math.min(...this.frames);
        const maxDelta = Math.max(...this.frames);

        return {
            fps: Math.round(1000 / avgDelta),
            avgFrameTime: avgDelta.toFixed(2),
            minFrameTime: minDelta.toFixed(2),
            maxFrameTime: maxDelta.toFixed(2),
            sampleCount: this.frames.length,
        };
    }

    /**
     * Reset frame tracking
     */
    reset() {
        this.frames = [];
        this.lastTime = performance.now();
    }
}

/**
 * Global profiler instance (singleton)
 */
let globalProfiler = null;

/**
 * Get global profiler instance
 * @returns {PerformanceProfiler} Profiler instance
 */
export function getGlobalProfiler() {
    if (!globalProfiler) {
        globalProfiler = new PerformanceProfiler();
    }
    return globalProfiler;
}

/**
 * Reset global profiler
 */
export function resetGlobalProfiler() {
    if (globalProfiler) {
        globalProfiler.reset();
    }
}
