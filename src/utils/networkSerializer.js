/**
 * Network Serialization
 *
 * Handles serialization and deserialization of network state
 * for save/load functionality.
 */

import { batchAddBlocks, batchConnectBlocks, validateBlockConfig } from './wasmAdvanced.js';

/**
 * Serialize network to JSON-compatible format
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {object} metadata - Additional metadata
 * @returns {object} Serialized network
 */
export function serializeNetwork(nodes, edges, metadata = {}) {
    const serialized = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        metadata: {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            ...metadata,
        },
        nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: {
                blockType: node.data.blockType,
                label: node.data.label,
                config: node.data.config || {},
                wasmHandle: node.data.wasmHandle,
            },
        })),
        edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type || 'input',
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
        })),
    };

    return serialized;
}

/**
 * Deserialize network from JSON format
 * @param {string|object} data - Serialized network data
 * @returns {{nodes: Array, edges: Array, metadata: object}} Deserialized network
 * @throws {Error} If data is invalid
 */
export function deserializeNetwork(data) {
    try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;

        // Validate format
        if (!parsed.version) {
            throw new Error('Missing version field');
        }

        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
            throw new Error('Invalid network format');
        }

        // Check version compatibility
        const [major] = parsed.version.split('.');
        if (major !== '1') {
            throw new Error(`Unsupported version: ${parsed.version}`);
        }

        // Reconstruct nodes
        const nodes = parsed.nodes.map(node => ({
            id: node.id,
            type: node.type || 'customNode',
            position: node.position || { x: 0, y: 0 },
            data: {
                blockType: node.data.blockType,
                label: node.data.label || node.data.blockType,
                config: node.data.config || {},
                // Don't restore wasmHandle - it will be created fresh
            },
        }));

        // Reconstruct edges
        const edges = parsed.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type || 'input',
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
        }));

        return {
            nodes,
            edges,
            metadata: parsed.metadata || {},
        };
    } catch (error) {
        throw new Error(`Failed to deserialize network: ${error.message}`);
    }
}

/**
 * Rebuild WASM network from deserialized data
 * @param {object} network - WASM network instance
 * @param {Array} nodes - Deserialized nodes
 * @param {Array} edges - Deserialized edges
 * @returns {{handleMap: Map, errors: Array}} Handle map and any errors
 */
export function rebuildWasmNetwork(network, nodes, edges) {
    const errors = [];

    // Create blocks
    const blockDefinitions = nodes.map(node => ({
        id: node.id,
        type: node.data.blockType,
        config: node.data.config,
    }));

    const handleMap = batchAddBlocks(network, blockDefinitions);

    // Validate all blocks were created
    if (handleMap.size !== nodes.length) {
        errors.push(`Only ${handleMap.size} of ${nodes.length} blocks were created`);
    }

    // Create connections
    const connectionDefinitions = edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.type === 'context' ? 'context' : 'input',
    }));

    const successfulConnections = batchConnectBlocks(network, connectionDefinitions, handleMap);

    if (successfulConnections.length !== edges.length) {
        errors.push(`Only ${successfulConnections.length} of ${edges.length} connections were created`);
    }

    return {
        handleMap,
        errors,
    };
}

/**
 * Export network to downloadable JSON file
 * @param {object} serializedNetwork - Serialized network data
 * @param {string} filename - Desired filename
 */
export function exportToFile(serializedNetwork, filename = 'network.json') {
    const dataStr = JSON.stringify(serializedNetwork, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Import network from file
 * @param {File} file - File object to import
 * @returns {Promise<object>} Deserialized network data
 */
export async function importFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const network = deserializeNetwork(data);
                resolve(network);
            } catch (error) {
                reject(new Error(`Failed to import file: ${error.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}

/**
 * Save network to localStorage
 * @param {object} serializedNetwork - Serialized network data
 * @param {string} key - localStorage key
 * @returns {boolean} Success status
 */
export function saveToLocalStorage(serializedNetwork, key = 'gcf-network') {
    try {
        const dataStr = JSON.stringify(serializedNetwork);
        localStorage.setItem(key, dataStr);
        return true;
    } catch (error) {
        console.error('[NetworkSerializer] Failed to save to localStorage:', error);
        return false;
    }
}

/**
 * Load network from localStorage
 * @param {string} key - localStorage key
 * @returns {object|null} Deserialized network data or null
 */
export function loadFromLocalStorage(key = 'gcf-network') {
    try {
        const dataStr = localStorage.getItem(key);
        if (!dataStr) return null;

        return deserializeNetwork(dataStr);
    } catch (error) {
        console.error('[NetworkSerializer] Failed to load from localStorage:', error);
        return null;
    }
}

/**
 * List all saved networks in localStorage
 * @returns {Array} Array of {key, metadata} objects
 */
export function listSavedNetworks() {
    const saved = [];
    const prefix = 'gcf-network-';

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            try {
                const dataStr = localStorage.getItem(key);
                const data = JSON.parse(dataStr);
                saved.push({
                    key,
                    name: key.replace(prefix, ''),
                    timestamp: data.timestamp,
                    metadata: data.metadata,
                });
            } catch (error) {
                console.warn(`[NetworkSerializer] Failed to parse ${key}:`, error);
            }
        }
    }

    return saved.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Delete saved network from localStorage
 * @param {string} key - localStorage key
 * @returns {boolean} Success status
 */
export function deleteSavedNetwork(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('[NetworkSerializer] Failed to delete from localStorage:', error);
        return false;
    }
}

/**
 * Validate serialized network format
 * @param {object} data - Serialized network data
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateSerializedNetwork(data) {
    const errors = [];

    // Check required fields
    if (!data.version) errors.push('Missing version');
    if (!data.nodes) errors.push('Missing nodes array');
    if (!data.edges) errors.push('Missing edges array');

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Validate nodes
    data.nodes.forEach((node, i) => {
        if (!node.id) errors.push(`Node ${i}: missing id`);
        if (!node.data || !node.data.blockType) errors.push(`Node ${i}: missing blockType`);

        // Validate block configuration
        if (node.data && node.data.blockType && node.data.config) {
            const validation = validateBlockConfig(node.data.blockType, node.data.config);
            if (!validation.valid) {
                errors.push(`Node ${i} (${node.id}): ${validation.errors.join(', ')}`);
            }
        }
    });

    // Validate edges
    const nodeIds = new Set(data.nodes.map(n => n.id));
    data.edges.forEach((edge, i) => {
        if (!edge.source) errors.push(`Edge ${i}: missing source`);
        if (!edge.target) errors.push(`Edge ${i}: missing target`);

        if (edge.source && !nodeIds.has(edge.source)) {
            errors.push(`Edge ${i}: source node "${edge.source}" not found`);
        }
        if (edge.target && !nodeIds.has(edge.target)) {
            errors.push(`Edge ${i}: target node "${edge.target}" not found`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Create a network diff between two serialized networks
 * @param {object} network1 - First network
 * @param {object} network2 - Second network
 * @returns {object} Diff object
 */
export function diffNetworks(network1, network2) {
    const diff = {
        nodesAdded: [],
        nodesRemoved: [],
        nodesModified: [],
        edgesAdded: [],
        edgesRemoved: [],
    };

    const nodes1Map = new Map(network1.nodes.map(n => [n.id, n]));
    const nodes2Map = new Map(network2.nodes.map(n => [n.id, n]));

    // Find added and modified nodes
    network2.nodes.forEach(node => {
        if (!nodes1Map.has(node.id)) {
            diff.nodesAdded.push(node);
        } else {
            const oldNode = nodes1Map.get(node.id);
            if (JSON.stringify(oldNode) !== JSON.stringify(node)) {
                diff.nodesModified.push({ old: oldNode, new: node });
            }
        }
    });

    // Find removed nodes
    network1.nodes.forEach(node => {
        if (!nodes2Map.has(node.id)) {
            diff.nodesRemoved.push(node);
        }
    });

    // Find added/removed edges
    const edges1Str = new Set(network1.edges.map(e => `${e.source}-${e.target}-${e.type}`));
    const edges2Str = new Set(network2.edges.map(e => `${e.source}-${e.target}-${e.type}`));

    network2.edges.forEach(edge => {
        const edgeStr = `${edge.source}-${edge.target}-${edge.type}`;
        if (!edges1Str.has(edgeStr)) {
            diff.edgesAdded.push(edge);
        }
    });

    network1.edges.forEach(edge => {
        const edgeStr = `${edge.source}-${edge.target}-${edge.type}`;
        if (!edges2Str.has(edgeStr)) {
            diff.edgesRemoved.push(edge);
        }
    });

    return diff;
}
