/**
 * WASM Bridge - Interface to the gnomics WASM module
 *
 * This module provides a wrapper around the WASM network operations.
 * Currently using a mock implementation until the actual WASM module is available.
 */

let wasmModule = null;
let wasmInitialized = false;

/**
 * Mock WASM Network class for development
 * Replace this with actual import when WASM is available:
 * import init, { WasmNetwork } from '../pkg/gnomics.js';
 */
class MockWasmNetwork {
    constructor() {
        this.blocks = new Map(); // blockId -> { type, handle, state }
        this.connections = [];
        this.nextHandle = 1;
        this.numBlocksValue = 0;
    }

    add_block(blockType, config = {}) {
        const handle = this.nextHandle++;
        this.blocks.set(handle, {
            type: blockType,
            handle,
            config,
            state: new Uint8Array(32), // Mock bitfield
            output: 0,
        });
        this.numBlocksValue++;
        return handle;
    }

    remove_block(handle) {
        if (this.blocks.has(handle)) {
            this.blocks.delete(handle);
            this.numBlocksValue--;
            // Remove connections involving this block
            this.connections = this.connections.filter(
                c => c.sourceHandle !== handle && c.targetHandle !== handle
            );
        }
    }

    connect_to_input(sourceHandle, targetHandle) {
        this.connections.push({
            sourceHandle,
            targetHandle,
            type: 'input',
        });
    }

    connect_to_context(sourceHandle, targetHandle) {
        this.connections.push({
            sourceHandle,
            targetHandle,
            type: 'context',
        });
    }

    remove_connection(sourceHandle, targetHandle, connType) {
        this.connections = this.connections.filter(
            c => !(c.sourceHandle === sourceHandle &&
                   c.targetHandle === targetHandle &&
                   c.type === connType)
        );
    }

    rebuild() {
        // Mock rebuild - in real WASM this would reconstruct the network graph
        console.log('Network rebuilt:', {
            blocks: this.numBlocksValue,
            connections: this.connections.length,
        });
    }

    execute(learn = true) {
        // Mock execution - update block states
        this.blocks.forEach((block) => {
            // Randomly update some bits in the bitfield
            for (let i = 0; i < block.state.length; i++) {
                if (Math.random() > 0.9) {
                    block.state[i] = Math.random() > 0.5 ? 1 : 0;
                }
            }
            // Update output value
            block.output = Math.sin(Date.now() / 1000 + block.handle) * 0.5 + 0.5;
        });
    }

    num_blocks() {
        return this.numBlocksValue;
    }

    get_block_state(handle) {
        const block = this.blocks.get(handle);
        return block ? block.state : null;
    }

    get_block_output(handle) {
        const block = this.blocks.get(handle);
        return block ? block.output : 0;
    }

    get_block_info(handle) {
        const block = this.blocks.get(handle);
        if (!block) return null;
        return {
            type: block.type,
            handle: block.handle,
            stateSize: block.state.length,
        };
    }
}

/**
 * Initialize the WASM module
 * @returns {Promise<boolean>} Success status
 */
export async function initializeWasm() {
    if (wasmInitialized) {
        return true;
    }

    try {
        // TODO: Replace with actual WASM initialization when available
        // await init();
        // wasmModule = await import('../pkg/gnomics.js');

        // Using mock for now
        console.log('[WASM Bridge] Using mock WASM implementation');
        wasmInitialized = true;
        return true;
    } catch (error) {
        console.error('[WASM Bridge] Failed to initialize:', error);
        wasmInitialized = false;
        return false;
    }
}

/**
 * Create a new WASM network instance
 * @returns {MockWasmNetwork|null} Network instance
 */
export function createNetwork() {
    if (!wasmInitialized) {
        console.error('[WASM Bridge] Cannot create network: WASM not initialized');
        return null;
    }

    try {
        // TODO: Replace with actual WASM network creation
        // return new wasmModule.WasmNetwork();

        return new MockWasmNetwork();
    } catch (error) {
        console.error('[WASM Bridge] Failed to create network:', error);
        return null;
    }
}

/**
 * Add a block to the network
 * @param {MockWasmNetwork} network - Network instance
 * @param {string} blockType - Type of block to add
 * @param {object} config - Block configuration
 * @returns {number|null} Block handle
 */
export function addBlock(network, blockType, config = {}) {
    if (!network) return null;

    try {
        const handle = network.add_block(blockType, config);
        console.log(`[WASM Bridge] Added block: ${blockType} (handle: ${handle})`);
        return handle;
    } catch (error) {
        console.error('[WASM Bridge] Failed to add block:', error);
        return null;
    }
}

/**
 * Remove a block from the network
 * @param {MockWasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 */
export function removeBlock(network, handle) {
    if (!network) return;

    try {
        network.remove_block(handle);
        console.log(`[WASM Bridge] Removed block (handle: ${handle})`);
    } catch (error) {
        console.error('[WASM Bridge] Failed to remove block:', error);
    }
}

/**
 * Connect two blocks
 * @param {MockWasmNetwork} network - Network instance
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
        network.rebuild();
        console.log(`[WASM Bridge] Connected blocks: ${sourceHandle} -> ${targetHandle} (${connType})`);
    } catch (error) {
        console.error('[WASM Bridge] Failed to connect blocks:', error);
    }
}

/**
 * Remove a connection between blocks
 * @param {MockWasmNetwork} network - Network instance
 * @param {number} sourceHandle - Source block handle
 * @param {number} targetHandle - Target block handle
 * @param {string} connType - Connection type ('input' or 'context')
 */
export function removeConnection(network, sourceHandle, targetHandle, connType = 'input') {
    if (!network) return;

    try {
        network.remove_connection(sourceHandle, targetHandle, connType);
        network.rebuild();
        console.log(`[WASM Bridge] Removed connection: ${sourceHandle} -> ${targetHandle}`);
    } catch (error) {
        console.error('[WASM Bridge] Failed to remove connection:', error);
    }
}

/**
 * Execute one step of the network
 * @param {MockWasmNetwork} network - Network instance
 * @param {boolean} learn - Enable learning
 */
export function executeNetwork(network, learn = true) {
    if (!network) return;

    try {
        network.execute(learn);
    } catch (error) {
        console.error('[WASM Bridge] Failed to execute network:', error);
    }
}

/**
 * Get block state (bitfield)
 * @param {MockWasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 * @returns {Uint8Array|null} Bitfield state
 */
export function getBlockState(network, handle) {
    if (!network) return null;

    try {
        return network.get_block_state(handle);
    } catch (error) {
        console.error('[WASM Bridge] Failed to get block state:', error);
        return null;
    }
}

/**
 * Get block output value
 * @param {MockWasmNetwork} network - Network instance
 * @param {number} handle - Block handle
 * @returns {number} Output value
 */
export function getBlockOutput(network, handle) {
    if (!network) return 0;

    try {
        return network.get_block_output(handle);
    } catch (error) {
        console.error('[WASM Bridge] Failed to get block output:', error);
        return 0;
    }
}

/**
 * Get number of blocks in network
 * @param {MockWasmNetwork} network - Network instance
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
