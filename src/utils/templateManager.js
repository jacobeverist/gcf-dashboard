/**
 * Template Manager Utilities
 *
 * Functions for saving, loading, and managing network templates
 */

/**
 * Capture current network state as template data
 * @param {Array} nodes - Current ReactFlow nodes
 * @param {Array} edges - Current ReactFlow edges
 * @returns {object} Network state for template
 */
export function captureNetworkState(nodes, edges) {
    return {
        nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: {
                blockType: node.data.blockType,
                label: node.data.label,
                params: node.data.params,
            },
        })),
        edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            type: edge.type,
        })),
    };
}

/**
 * Load template into network
 * @param {object} template - Template to load
 * @param {object} networkStore - Zustand network store
 * @param {object} executionStore - Zustand execution store
 * @param {Function} wasmBridge - WASM bridge functions
 * @returns {Promise<boolean>} Success status
 */
export async function loadTemplateIntoNetwork(template, networkStore, executionStore, wasmBridge) {
    try {
        const { network } = template;

        // Clear current network
        networkStore.reset();

        // Get WASM network instance
        const wasmNetwork = executionStore.network;
        if (!wasmNetwork) {
            console.error('[Template Manager] No WASM network available');
            return false;
        }

        // Create map to store WASM handles for nodes
        const nodeHandleMap = new Map();

        // Create WASM blocks for all nodes
        for (const node of network.nodes) {
            const blockType = node.data.blockType;
            const params = node.data.params || {};

            const handle = wasmBridge.addBlock(wasmNetwork, blockType, params);
            if (handle !== null) {
                nodeHandleMap.set(node.id, handle);
            }
        }

        // Create ReactFlow nodes with WASM handles
        const reactFlowNodes = network.nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                wasmHandle: nodeHandleMap.get(node.id),
            },
        }));

        // Create WASM connections
        for (const edge of network.edges) {
            const sourceHandle = nodeHandleMap.get(edge.source);
            const targetHandle = nodeHandleMap.get(edge.target);

            if (sourceHandle !== undefined && targetHandle !== undefined) {
                const connType = edge.type === 'context' ? 'context' : 'input';
                wasmBridge.connectBlocks(wasmNetwork, sourceHandle, targetHandle, connType);
            }
        }

        // Set nodes and edges in store
        networkStore.setNodes(reactFlowNodes);
        networkStore.setEdges(network.edges);

        console.log(`[Template Manager] Loaded template: ${template.name}`);
        return true;
    } catch (error) {
        console.error('[Template Manager] Failed to load template:', error);
        return false;
    }
}

/**
 * Download template as JSON file
 * @param {object} template - Template to download
 */
export function downloadTemplateAsJSON(template) {
    try {
        const json = JSON.stringify(template, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${sanitizeFilename(template.name)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        console.log(`[Template Manager] Downloaded template: ${template.name}`);
    } catch (error) {
        console.error('[Template Manager] Failed to download template:', error);
    }
}

/**
 * Import template from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<object|null>} Template data or null
 */
export async function importTemplateFromJSON(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate template structure
        if (!data.name || !data.network) {
            throw new Error('Invalid template format');
        }

        return data;
    } catch (error) {
        console.error('[Template Manager] Failed to import template:', error);
        return null;
    }
}

/**
 * Sanitize filename for download
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

/**
 * Validate template data
 * @param {object} template - Template to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTemplate(template) {
    const errors = [];

    if (!template.name || template.name.trim() === '') {
        errors.push('Template name is required');
    }

    if (!template.network) {
        errors.push('Template must contain network data');
    } else {
        if (!Array.isArray(template.network.nodes)) {
            errors.push('Template network must have nodes array');
        }
        if (!Array.isArray(template.network.edges)) {
            errors.push('Template network must have edges array');
        }
    }

    if (!Array.isArray(template.tags)) {
        errors.push('Template tags must be an array');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Get template statistics
 * @param {object} template - Template to analyze
 * @returns {object} Statistics
 */
export function getTemplateStats(template) {
    const network = template.network;

    const nodesByType = {};
    network.nodes.forEach(node => {
        const type = node.data.blockType;
        nodesByType[type] = (nodesByType[type] || 0) + 1;
    });

    const edgesByType = {
        input: network.edges.filter(e => e.type !== 'context').length,
        context: network.edges.filter(e => e.type === 'context').length,
    };

    return {
        totalNodes: network.nodes.length,
        totalEdges: network.edges.length,
        nodesByType,
        edgesByType,
    };
}

/**
 * Compare two templates
 * @param {object} template1 - First template
 * @param {object} template2 - Second template
 * @returns {object} Comparison results
 */
export function compareTemplates(template1, template2) {
    const stats1 = getTemplateStats(template1);
    const stats2 = getTemplateStats(template2);

    return {
        name: {
            template1: template1.name,
            template2: template2.name,
        },
        nodes: {
            template1: stats1.totalNodes,
            template2: stats2.totalNodes,
            difference: stats2.totalNodes - stats1.totalNodes,
        },
        edges: {
            template1: stats1.totalEdges,
            template2: stats2.totalEdges,
            difference: stats2.totalEdges - stats1.totalEdges,
        },
    };
}
