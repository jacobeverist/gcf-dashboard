/**
 * Network Persistence Utilities
 * Save and load network configurations
 */

/**
 * Serialize network to JSON
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {Object} dataSources - Data source configs from dataSourceStore
 * @param {string} demoKey - Current demo key
 * @returns {Object} Serialized network
 */
export function serializeNetwork(nodes, edges, dataSources = {}, demoKey = null) {
    return {
        version: '2.0', // Bumped for data source support
        demo: demoKey,
        timestamp: new Date().toISOString(),
        nodes: nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: {
                label: node.data.label,
                blockType: node.data.blockType,
                sourceId: node.data.sourceId,
                sourceType: node.data.sourceType,
                params: node.data.params,
                // Note: wasmHandle is not serialized as it's runtime-specific
            },
        })),
        edges: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            type: edge.type,
            data: edge.data,
        })),
        // NEW: Serialize data source configurations
        dataSources: Object.keys(dataSources).map((sourceId) => {
            const source = dataSources[sourceId];
            return source.getConfig();
        }),
    };
}

/**
 * Download network as JSON file
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {Object} dataSources - Data source configs
 * @param {string} filename - Filename for download
 * @param {string} demoKey - Current demo key
 */
export function downloadNetwork(nodes, edges, dataSources = {}, filename = 'network.json', demoKey = null) {
    const data = serializeNetwork(nodes, edges, dataSources, demoKey);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Parse and validate network JSON
 * @param {Object} data - Parsed JSON data
 * @returns {Object|null} Validated network data or null if invalid
 */
export function validateNetworkData(data) {
    if (!data || typeof data !== 'object') {
        console.error('[Persistence] Invalid data format');
        return null;
    }

    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        console.error('[Persistence] Missing nodes or edges array');
        return null;
    }

    // Validate node structure
    for (const node of data.nodes) {
        if (!node.id || !node.type || !node.position) {
            console.error('[Persistence] Invalid node structure:', node);
            return null;
        }
    }

    // Validate edge structure
    for (const edge of data.edges) {
        if (!edge.source || !edge.target) {
            console.error('[Persistence] Invalid edge structure:', edge);
            return null;
        }
    }

    return data;
}

/**
 * Load network from JSON file
 * @param {File} file - File object from input
 * @returns {Promise<Object>} Parsed network data
 */
export async function loadNetworkFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const validated = validateNetworkData(data);

                if (validated) {
                    resolve(validated);
                } else {
                    reject(new Error('Invalid network file format'));
                }
            } catch (error) {
                reject(new Error('Failed to parse JSON: ' + error.message));
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
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {Object} dataSources - Data source configs
 * @param {string} key - localStorage key
 * @param {string} demoKey - Current demo key
 */
export function saveToLocalStorage(nodes, edges, dataSources = {}, key = 'gnomics-network', demoKey = null) {
    try {
        const data = serializeNetwork(nodes, edges, dataSources, demoKey);
        localStorage.setItem(key, JSON.stringify(data));
        console.log('[Persistence] Saved to localStorage');
        return true;
    } catch (error) {
        console.error('[Persistence] Failed to save to localStorage:', error);
        return false;
    }
}

/**
 * Load network from localStorage
 * @param {string} key - localStorage key
 * @returns {Object|null} Network data or null if not found/invalid
 */
export function loadFromLocalStorage(key = 'gnomics-network') {
    try {
        const json = localStorage.getItem(key);
        if (!json) {
            console.log('[Persistence] No saved network found');
            return null;
        }

        const data = JSON.parse(json);
        return validateNetworkData(data);
    } catch (error) {
        console.error('[Persistence] Failed to load from localStorage:', error);
        return null;
    }
}

/**
 * Clear saved network from localStorage
 * @param {string} key - localStorage key
 */
export function clearLocalStorage(key = 'gnomics-network') {
    try {
        localStorage.removeItem(key);
        console.log('[Persistence] Cleared localStorage');
    } catch (error) {
        console.error('[Persistence] Failed to clear localStorage:', error);
    }
}
