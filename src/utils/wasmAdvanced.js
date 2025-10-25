/**
 * Advanced WASM Operations
 *
 * Provides batch operations, validation, metrics, and advanced features
 * for the WASM network bridge.
 */

import {
    addBlock,
    removeBlock,
    connectBlocks,
    removeConnection,
    getBlockState,
    getBlockOutput,
} from './wasmBridge.js';

/**
 * Batch add multiple blocks to the network
 * @param {object} network - Network instance
 * @param {Array} blockDefinitions - Array of {type, config} objects
 * @returns {Map} Map of block ID to WASM handle
 */
export function batchAddBlocks(network, blockDefinitions) {
    const handleMap = new Map();

    blockDefinitions.forEach(({ id, type, config }) => {
        const handle = addBlock(network, type, config);
        if (handle !== null) {
            handleMap.set(id, handle);
        }
    });

    return handleMap;
}

/**
 * Batch create connections between blocks
 * @param {object} network - Network instance
 * @param {Array} connectionDefinitions - Array of {source, target, type} objects
 * @param {Map} handleMap - Map of block IDs to WASM handles
 * @returns {Array} Array of successfully created connections
 */
export function batchConnectBlocks(network, connectionDefinitions, handleMap) {
    const successfulConnections = [];

    connectionDefinitions.forEach(({ source, target, type }) => {
        const sourceHandle = handleMap.get(source);
        const targetHandle = handleMap.get(target);

        if (sourceHandle !== undefined && targetHandle !== undefined) {
            connectBlocks(network, sourceHandle, targetHandle, type);
            successfulConnections.push({ source, target, type });
        } else {
            console.warn(`[WASM Advanced] Skipping connection: ${source} -> ${target} (handles not found)`);
        }
    });

    return successfulConnections;
}

/**
 * Validate block configuration
 * @param {string} blockType - Type of block
 * @param {object} config - Block configuration
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateBlockConfig(blockType, config) {
    const errors = [];

    // Define required parameters for each block type
    const blockRequirements = {
        ScalarTransformer: ['inputSize', 'threshold'],
        DiscreteTransformer: ['inputSize', 'numBins'],
        PersistenceTransformer: ['inputSize', 'decayRate'],
        PatternPooler: ['inputSize', 'poolSize'],
        PatternClassifier: ['inputSize', 'numClasses'],
        SequenceLearner: ['inputSize', 'sequenceLength'],
        ContextLearner: ['inputSize', 'contextSize'],
    };

    const required = blockRequirements[blockType];
    if (!required) {
        errors.push(`Unknown block type: ${blockType}`);
        return { valid: false, errors };
    }

    // Check for required parameters
    required.forEach(param => {
        if (!(param in config)) {
            errors.push(`Missing required parameter: ${param}`);
        }
    });

    // Validate parameter values
    if (config.inputSize !== undefined && config.inputSize <= 0) {
        errors.push('inputSize must be positive');
    }

    if (config.threshold !== undefined && (config.threshold < 0 || config.threshold > 1)) {
        errors.push('threshold must be between 0 and 1');
    }

    if (config.numBins !== undefined && config.numBins <= 0) {
        errors.push('numBins must be positive');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Get default configuration for a block type
 * @param {string} blockType - Type of block
 * @returns {object} Default configuration
 */
export function getDefaultBlockConfig(blockType) {
    const defaults = {
        ScalarTransformer: {
            inputSize: 128,
            threshold: 0.5,
            learningRate: 0.01,
        },
        DiscreteTransformer: {
            inputSize: 128,
            numBins: 16,
            learningRate: 0.01,
        },
        PersistenceTransformer: {
            inputSize: 128,
            decayRate: 0.95,
            threshold: 0.3,
        },
        PatternPooler: {
            inputSize: 256,
            poolSize: 64,
            learningRate: 0.01,
        },
        PatternClassifier: {
            inputSize: 256,
            numClasses: 10,
            learningRate: 0.01,
        },
        SequenceLearner: {
            inputSize: 128,
            sequenceLength: 10,
            learningRate: 0.01,
        },
        ContextLearner: {
            inputSize: 256,
            contextSize: 128,
            learningRate: 0.01,
        },
    };

    return defaults[blockType] || {};
}

/**
 * Collect metrics from all blocks in the network
 * @param {object} network - Network instance
 * @param {Map} handleMap - Map of block IDs to WASM handles
 * @returns {object} Metrics object
 */
export function collectNetworkMetrics(network, handleMap) {
    const metrics = {
        blocks: {},
        timestamp: Date.now(),
    };

    handleMap.forEach((handle, blockId) => {
        const state = getBlockState(network, handle);
        const output = getBlockOutput(network, handle);

        if (state) {
            const activeCount = state.reduce((sum, bit) => sum + bit, 0);
            metrics.blocks[blockId] = {
                handle,
                activeCount,
                totalBits: state.length,
                sparsity: activeCount / state.length,
                output,
            };
        }
    });

    return metrics;
}

/**
 * Calculate network statistics
 * @param {object} metrics - Metrics object from collectNetworkMetrics
 * @returns {object} Statistics summary
 */
export function calculateNetworkStats(metrics) {
    const blockMetrics = Object.values(metrics.blocks);

    if (blockMetrics.length === 0) {
        return {
            numBlocks: 0,
            avgSparsity: 0,
            avgOutput: 0,
            totalActiveBits: 0,
        };
    }

    const totalSparsity = blockMetrics.reduce((sum, b) => sum + b.sparsity, 0);
    const totalOutput = blockMetrics.reduce((sum, b) => sum + b.output, 0);
    const totalActiveBits = blockMetrics.reduce((sum, b) => sum + b.activeCount, 0);

    return {
        numBlocks: blockMetrics.length,
        avgSparsity: totalSparsity / blockMetrics.length,
        avgOutput: totalOutput / blockMetrics.length,
        totalActiveBits,
        minSparsity: Math.min(...blockMetrics.map(b => b.sparsity)),
        maxSparsity: Math.max(...blockMetrics.map(b => b.sparsity)),
    };
}

/**
 * Validate network topology (check for cycles, disconnected components, etc.)
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @returns {{valid: boolean, warnings: Array<string>}}
 */
export function validateNetworkTopology(nodes, edges) {
    const warnings = [];

    // Check for isolated nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
    });

    const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (isolatedNodes.length > 0) {
        warnings.push(`${isolatedNodes.length} isolated node(s) detected`);
    }

    // Check for cycles using DFS
    const adjList = new Map();
    nodes.forEach(node => adjList.set(node.id, []));
    edges.filter(e => e.type !== 'context').forEach(edge => {
        if (!adjList.has(edge.source)) adjList.set(edge.source, []);
        adjList.get(edge.source).push(edge.target);
    });

    const visited = new Set();
    const recStack = new Set();
    let hasCycle = false;

    function dfs(nodeId) {
        if (recStack.has(nodeId)) {
            hasCycle = true;
            return;
        }
        if (visited.has(nodeId)) return;

        visited.add(nodeId);
        recStack.add(nodeId);

        const neighbors = adjList.get(nodeId) || [];
        neighbors.forEach(neighbor => dfs(neighbor));

        recStack.delete(nodeId);
    }

    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            dfs(node.id);
        }
    });

    if (hasCycle) {
        warnings.push('Cycle detected in input connections');
    }

    // Check for nodes with no inputs (potential input nodes)
    const nodesWithInputs = new Set(edges.map(e => e.target));
    const inputNodes = nodes.filter(node => !nodesWithInputs.has(node.id));
    if (inputNodes.length === 0 && nodes.length > 0) {
        warnings.push('No input nodes found (all nodes have incoming connections)');
    }

    return {
        valid: warnings.length === 0,
        warnings,
    };
}

/**
 * Create a snapshot of the entire network state
 * @param {object} network - Network instance
 * @param {Map} handleMap - Map of block IDs to WASM handles
 * @returns {object} Network snapshot
 */
export function createNetworkSnapshot(network, handleMap) {
    const snapshot = {
        timestamp: Date.now(),
        blocks: {},
    };

    handleMap.forEach((handle, blockId) => {
        const state = getBlockState(network, handle);
        const output = getBlockOutput(network, handle);

        snapshot.blocks[blockId] = {
            state: state ? Array.from(state) : [],
            output,
        };
    });

    return snapshot;
}

/**
 * Compare two network snapshots
 * @param {object} snapshot1 - First snapshot
 * @param {object} snapshot2 - Second snapshot
 * @returns {object} Comparison result with differences
 */
export function compareSnapshots(snapshot1, snapshot2) {
    const differences = {
        blocksChanged: [],
        totalChanges: 0,
    };

    Object.keys(snapshot1.blocks).forEach(blockId => {
        if (!snapshot2.blocks[blockId]) return;

        const state1 = snapshot1.blocks[blockId].state;
        const state2 = snapshot2.blocks[blockId].state;

        let bitChanges = 0;
        for (let i = 0; i < Math.min(state1.length, state2.length); i++) {
            if (state1[i] !== state2[i]) {
                bitChanges++;
            }
        }

        if (bitChanges > 0) {
            differences.blocksChanged.push({
                blockId,
                bitChanges,
                outputDelta: snapshot2.blocks[blockId].output - snapshot1.blocks[blockId].output,
            });
            differences.totalChanges += bitChanges;
        }
    });

    return differences;
}

/**
 * Estimate memory usage of the network
 * @param {object} network - Network instance
 * @param {Map} handleMap - Map of block IDs to WASM handles
 * @returns {object} Memory usage estimate in bytes
 */
export function estimateMemoryUsage(network, handleMap) {
    let totalBytes = 0;
    let breakdown = {
        bitfields: 0,
        metadata: 0,
    };

    handleMap.forEach((handle) => {
        const state = getBlockState(network, handle);
        if (state) {
            const stateBytes = state.length; // 1 byte per bit in Uint8Array
            breakdown.bitfields += stateBytes;
            totalBytes += stateBytes;
        }

        // Estimate metadata overhead (approximate)
        const metadataBytes = 64; // Rough estimate
        breakdown.metadata += metadataBytes;
        totalBytes += metadataBytes;
    });

    return {
        totalBytes,
        totalKB: (totalBytes / 1024).toFixed(2),
        totalMB: (totalBytes / (1024 * 1024)).toFixed(2),
        breakdown,
    };
}
