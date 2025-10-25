/**
 * WASM Bridge - Interface to the gnomics WASM module
 *
 * This module provides a wrapper around the real WASM network operations.
 * It adapts the real WASM API to match the interface expected by the application.
 */

import init, { WasmNetwork } from '../../pkg/gnomics.js';

let wasmInitialized = false;
let wasmModule = null;

// Map block types to their creation methods and default parameters
const BLOCK_CONFIGS = {
    ScalarTransformer: {
        method: 'add_scalar_transformer',
        defaults: { min_val: 0.0, max_val: 100.0, num_s: 2048, num_as: 256, num_t: 2, seed: 42 }
    },
    DiscreteTransformer: {
        method: 'add_discrete_transformer',
        defaults: { num_v: 10, num_s: 512, num_t: 2, seed: 42 }
    },
    PersistenceTransformer: {
        method: 'add_persistence_transformer',
        defaults: { min_val: 0.0, max_val: 100.0, num_s: 2048, num_as: 256, max_step: 10, num_t: 2, seed: 42 }
    },
    PatternPooler: {
        method: 'add_pattern_pooler',
        defaults: { num_s: 1024, num_as: 40, perm_thr: 20, perm_inc: 2, perm_dec: 1, pct_pool: 0.8, pct_conn: 0.5, pct_learn: 0.3, always_update: false, num_t: 2, seed: 0 },
        needsInit: true
    },
    PatternClassifier: {
        method: 'add_pattern_classifier',
        defaults: { num_l: 3, num_s: 1024, num_as: 30, perm_thr: 20, perm_inc: 2, perm_dec: 1, pct_pool: 0.8, pct_conn: 0.5, pct_learn: 0.3, num_t: 2, seed: 0 },
        needsInit: true
    },
    SequenceLearner: {
        method: 'add_sequence_learner',
        defaults: { num_c: 512, num_spc: 4, num_dps: 8, num_rpd: 32, d_thresh: 20, perm_thr: 20, perm_inc: 2, perm_dec: 1, num_t: 2, always_update: false, seed: 42 },
        needsInit: true
    },
    ContextLearner: {
        method: 'add_context_learner',
        defaults: { num_c: 512, num_spc: 4, num_dps: 8, num_rpd: 32, d_thresh: 20, perm_thr: 20, perm_inc: 2, perm_dec: 1, num_t: 2, always_update: false, seed: 42 },
        needsInit: true
    }
};

/**
 * Initialize the WASM module
 * @returns {Promise<boolean>} Success status
 */
export async function initializeWasm() {
    if (wasmInitialized) {
        return true;
    }

    try {
        // Initialize the WASM module
        wasmModule = await init();
        wasmInitialized = true;
        console.log('[WASM Bridge] Real WASM module initialized successfully');
        return true;
    } catch (error) {
        console.error('[WASM Bridge] Failed to initialize:', error);
        wasmInitialized = false;
        return false;
    }
}

/**
 * Create a new WASM network instance
 * @returns {WasmNetwork|null} Network instance
 */
export function createNetwork() {
    if (!wasmInitialized) {
        console.error('[WASM Bridge] Cannot create network: WASM not initialized');
        return null;
    }

    try {
        const network = new WasmNetwork();

        // Add metadata tracking (not in real WASM, so we track it here)
        network._blockMetadata = new Map(); // handle -> { type, name, needsRebuild }
        network._needsBuild = false;
        network._needsInit = new Set(); // handles that need init_block() called

        console.log('[WASM Bridge] Created new WasmNetwork');
        return network;
    } catch (error) {
        console.error('[WASM Bridge] Failed to create network:', error);
        return null;
    }
}

/**
 * Add a block to the network
 * @param {WasmNetwork} network - Network instance
 * @param {string} blockType - Type of block to add
 * @param {object} config - Block configuration
 * @returns {number|null} Block handle
 */
export function addBlock(network, blockType, config = {}) {
    if (!network) return null;

    try {
        const blockConfig = BLOCK_CONFIGS[blockType];
        if (!blockConfig) {
            throw new Error(`Unknown block type: ${blockType}`);
        }

        // Merge defaults with provided config
        const params = { ...blockConfig.defaults, ...config };
        const name = config.name || blockType;

        // Call the appropriate WASM method
        let handle;
        switch (blockType) {
            case 'ScalarTransformer':
                handle = network.add_scalar_transformer(
                    name, params.min_val, params.max_val, params.num_s, params.num_as, params.num_t, params.seed
                );
                break;
            case 'DiscreteTransformer':
                handle = network.add_discrete_transformer(
                    name, params.num_v, params.num_s, params.num_t, params.seed
                );
                break;
            case 'PersistenceTransformer':
                handle = network.add_persistence_transformer(
                    name, params.min_val, params.max_val, params.num_s, params.num_as, params.max_step, params.num_t, params.seed
                );
                break;
            case 'PatternPooler':
                handle = network.add_pattern_pooler(
                    name, params.num_s, params.num_as, params.perm_thr, params.perm_inc, params.perm_dec,
                    params.pct_pool, params.pct_conn, params.pct_learn, params.always_update, params.num_t, params.seed
                );
                break;
            case 'PatternClassifier':
                handle = network.add_pattern_classifier(
                    name, params.num_l, params.num_s, params.num_as, params.perm_thr, params.perm_inc, params.perm_dec,
                    params.pct_pool, params.pct_conn, params.pct_learn, params.num_t, params.seed
                );
                break;
            case 'SequenceLearner':
                handle = network.add_sequence_learner(
                    name, params.num_c, params.num_spc, params.num_dps, params.num_rpd, params.d_thresh,
                    params.perm_thr, params.perm_inc, params.perm_dec, params.num_t, params.always_update, params.seed
                );
                break;
            case 'ContextLearner':
                handle = network.add_context_learner(
                    name, params.num_c, params.num_spc, params.num_dps, params.num_rpd, params.d_thresh,
                    params.perm_thr, params.perm_inc, params.perm_dec, params.num_t, params.always_update, params.seed
                );
                break;
            default:
                throw new Error(`Unhandled block type: ${blockType}`);
        }

        // Track metadata
        network._blockMetadata.set(handle, { type: blockType, name });
        network._needsBuild = true;

        // Mark if this block needs init_block() called
        if (blockConfig.needsInit) {
            network._needsInit.add(handle);
        }

        console.log(`[WASM Bridge] Added block: ${blockType} "${name}" (handle: ${handle})`);
        return handle;
    } catch (error) {
        console.error('[WASM Bridge] Failed to add block:', error);
        return null;
    }
}

/**
 * Remove a block from the network
 * @param {WasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 */
export function removeBlock(network, handle) {
    if (!network) return;

    try {
        network.remove_block(handle);
        network._blockMetadata.delete(handle);
        network._needsInit.delete(handle);
        network._needsBuild = true;
        console.log(`[WASM Bridge] Removed block (handle: ${handle})`);
    } catch (error) {
        console.error('[WASM Bridge] Failed to remove block:', error);
    }
}

/**
 * Connect two blocks
 * @param {WasmNetwork} network - Network instance
 * @param {number} sourceHandle - Source block handle
 * @param {number} targetHandle - Target block handle
 * @param {string} connType - Connection type ('input' or 'context')
 */
export function connectBlocks(network, sourceHandle, targetHandle, connType = 'input') {
    if (!network) return;

    try {
        if (connType === 'context') {
            network.connect_to_context(sourceHandle, targetHandle);
        } else {
            network.connect_to_input(sourceHandle, targetHandle);
        }
        network._needsBuild = true;
        console.log(`[WASM Bridge] Connected blocks: ${sourceHandle} -> ${targetHandle} (${connType})`);
    } catch (error) {
        console.error('[WASM Bridge] Failed to connect blocks:', error);
    }
}

/**
 * Remove a connection between blocks
 * @param {WasmNetwork} network - Network instance
 * @param {number} sourceHandle - Source block handle
 * @param {number} targetHandle - Target block handle
 * @param {string} connType - Connection type ('input' or 'context')
 */
export function removeConnection(network, sourceHandle, targetHandle, connType = 'input') {
    if (!network) return;

    try {
        network.remove_connection(sourceHandle, targetHandle, connType);
        network._needsBuild = true;
        console.log(`[WASM Bridge] Removed connection: ${sourceHandle} -> ${targetHandle}`);
    } catch (error) {
        console.error('[WASM Bridge] Failed to remove connection:', error);
    }
}

/**
 * Rebuild the network (compute execution order)
 * Call this after adding/removing blocks or connections
 * @param {WasmNetwork} network - Network instance
 */
export function rebuildNetwork(network) {
    if (!network) return;

    try {
        // Build the network (compute execution order)
        network.build();

        // Initialize any learning blocks that need it
        network._needsInit.forEach(handle => {
            try {
                network.init_block(handle);
                console.log(`[WASM Bridge] Initialized block (handle: ${handle})`);
            } catch (error) {
                console.warn(`[WASM Bridge] Failed to init block ${handle}:`, error);
            }
        });

        // Start recording for visualization
        network.start_recording();

        network._needsBuild = false;
        console.log('[WASM Bridge] Network rebuilt and ready for execution');
    } catch (error) {
        console.error('[WASM Bridge] Failed to rebuild network:', error);
    }
}

/**
 * Execute one step of the network
 * @param {WasmNetwork} network - Network instance
 * @param {boolean} learn - Enable learning
 */
export function executeNetwork(network, learn = true) {
    if (!network) return;

    try {
        // Build if needed
        if (network._needsBuild) {
            rebuildNetwork(network);
        }

        network.execute(learn);
    } catch (error) {
        console.error('[WASM Bridge] Failed to execute network:', error);
    }
}

/**
 * Get block state (bitfield) from trace
 * Note: Real WASM uses trace-based visualization
 * @param {WasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 * @returns {Uint8Array|null} Bitfield state
 */
export function getBlockState(network, handle) {
    if (!network) return null;

    try {
        const traceJson = network.get_trace_json();
        if (!traceJson) return null;

        const trace = JSON.parse(traceJson);
        const blockTrace = trace.blocks?.[handle];

        if (blockTrace && blockTrace.state) {
            // Convert state to Uint8Array
            return new Uint8Array(blockTrace.state);
        }

        // Fallback: return empty array
        return new Uint8Array(32);
    } catch (error) {
        console.error('[WASM Bridge] Failed to get block state:', error);
        return new Uint8Array(32);
    }
}

/**
 * Get block output value
 * @param {WasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 * @returns {number} Output value
 */
export function getBlockOutput(network, handle) {
    if (!network) return 0;

    try {
        const metadata = network._blockMetadata.get(handle);
        if (!metadata) return 0;

        // For classifiers, return probability
        if (metadata.type === 'PatternClassifier') {
            const probs = network.get_probabilities(handle);
            if (probs && probs.length > 0) {
                return Math.max(...probs);
            }
        }

        // For learners, return anomaly score
        if (metadata.type === 'SequenceLearner' || metadata.type === 'ContextLearner') {
            return network.get_anomaly(handle);
        }

        // For others, use trace data
        const traceJson = network.get_trace_json();
        if (traceJson) {
            const trace = JSON.parse(traceJson);
            const blockTrace = trace.blocks?.[handle];
            if (blockTrace && typeof blockTrace.output === 'number') {
                return blockTrace.output;
            }
        }

        return 0;
    } catch (error) {
        console.error('[WASM Bridge] Failed to get block output:', error);
        return 0;
    }
}

/**
 * Get number of blocks in network
 * @param {WasmNetwork} network - Network instance
 * @returns {number} Number of blocks
 */
export function getNumBlocks(network) {
    if (!network) return 0;

    try {
        return network.num_blocks();
    } catch (error) {
        console.error('[WASM Bridge] Failed to get num blocks:', error);
        return 0;
    }
}

/**
 * Update block parameters
 * Note: Real WASM doesn't support runtime parameter updates
 * This is a no-op for compatibility
 * @param {WasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 * @param {object} params - New parameters
 */
export function updateBlockParams(network, handle, params) {
    if (!network) return;

    console.warn('[WASM Bridge] updateBlockParams: Real WASM does not support runtime parameter updates');
    console.log(`[WASM Bridge] Would update params for block ${handle}:`, params);
}

/**
 * Set scalar value for a ScalarTransformer block
 * @param {WasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 * @param {number} value - Scalar value
 */
export function setScalarValue(network, handle, value) {
    if (!network) return;

    try {
        network.set_scalar_value(handle, value);
    } catch (error) {
        console.error('[WASM Bridge] Failed to set scalar value:', error);
    }
}

/**
 * Set discrete value for a DiscreteTransformer block
 * @param {WasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 * @param {number} value - Discrete value (category index)
 */
export function setDiscreteValue(network, handle, value) {
    if (!network) return;

    try {
        network.set_discrete_value(handle, value);
    } catch (error) {
        console.error('[WASM Bridge] Failed to set discrete value:', error);
    }
}

/**
 * Set label for a PatternClassifier block
 * @param {WasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 * @param {number} label - Label index
 */
export function setClassifierLabel(network, handle, label) {
    if (!network) return;

    try {
        network.set_classifier_label(handle, label);
    } catch (error) {
        console.error('[WASM Bridge] Failed to set classifier label:', error);
    }
}

/**
 * Get block info
 * @param {WasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 * @returns {object|null} Block info
 */
export function getBlockInfo(network, handle) {
    if (!network) return null;

    try {
        const metadata = network._blockMetadata.get(handle);
        const name = network.get_block_name(handle);

        return {
            handle,
            type: metadata?.type || 'Unknown',
            name: name || metadata?.name || `Block ${handle}`
        };
    } catch (error) {
        console.error('[WASM Bridge] Failed to get block info:', error);
        return null;
    }
}

/**
 * Get all blocks info
 * @param {WasmNetwork} network - Network instance
 * @returns {Array} Array of block info objects
 */
export function getAllBlocksInfo(network) {
    if (!network) return [];

    try {
        const blocksJson = network.get_blocks_info();
        return JSON.parse(blocksJson);
    } catch (error) {
        console.error('[WASM Bridge] Failed to get all blocks info:', error);
        return [];
    }
}

/**
 * Export network configuration
 * @param {WasmNetwork} network - Network instance
 * @returns {string|null} Configuration JSON
 */
export function exportConfig(network) {
    if (!network) return null;

    try {
        return network.export_config();
    } catch (error) {
        console.error('[WASM Bridge] Failed to export config:', error);
        return null;
    }
}

/**
 * Import network configuration
 * @param {WasmNetwork} network - Network instance
 * @param {string} configJson - Configuration JSON
 */
export function importConfig(network, configJson) {
    if (!network) return;

    try {
        network.import_config(configJson);
        console.log('[WASM Bridge] Imported network configuration');
    } catch (error) {
        console.error('[WASM Bridge] Failed to import config:', error);
    }
}
