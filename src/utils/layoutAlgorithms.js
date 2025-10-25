/**
 * Layout Algorithms for Network Graphs
 */

/**
 * Compute hierarchical levels for nodes using BFS
 * @param {Array} nodes - Array of ReactFlow nodes
 * @param {Array} edges - Array of ReactFlow edges
 * @returns {Object} Map of nodeId to level
 */
function computeHierarchicalLevels(nodes, edges) {
    const levels = {};
    const incomingCount = {};

    // Initialize incoming edge count
    nodes.forEach((node) => {
        incomingCount[node.id] = 0;
    });

    // Count incoming edges
    edges.forEach((edge) => {
        if (incomingCount[edge.target] !== undefined) {
            incomingCount[edge.target]++;
        }
    });

    // Find root nodes (nodes with no incoming edges)
    const roots = nodes.filter((n) => incomingCount[n.id] === 0);

    // BFS to assign levels
    const queue = roots.map((n) => ({ node: n, level: 0 }));
    const visited = new Set();

    while (queue.length > 0) {
        const { node, level } = queue.shift();

        if (visited.has(node.id)) continue;
        visited.add(node.id);

        levels[node.id] = level;

        // Find outgoing edges from this node
        const outgoingEdges = edges.filter((e) => e.source === node.id);
        outgoingEdges.forEach((edge) => {
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (targetNode && !visited.has(targetNode.id)) {
                queue.push({ node: targetNode, level: level + 1 });
            }
        });
    }

    // Assign level 0 to any unvisited nodes
    nodes.forEach((node) => {
        if (levels[node.id] === undefined) {
            levels[node.id] = 0;
        }
    });

    return levels;
}

/**
 * Apply hierarchical layout to nodes
 * @param {Array} nodes - Array of ReactFlow nodes
 * @param {Array} edges - Array of ReactFlow edges
 * @param {number} levelSpacing - Vertical spacing between levels (default: 150)
 * @param {number} nodeSpacing - Horizontal spacing between nodes (default: 200)
 * @returns {Array} Nodes with updated positions
 */
export function applyHierarchicalLayout(nodes, edges, levelSpacing = 150, nodeSpacing = 200) {
    if (nodes.length === 0) return nodes;

    // Compute levels
    const levels = computeHierarchicalLevels(nodes, edges);

    // Group nodes by level
    const nodesByLevel = {};
    nodes.forEach((node) => {
        const level = levels[node.id] || 0;
        if (!nodesByLevel[level]) {
            nodesByLevel[level] = [];
        }
        nodesByLevel[level].push(node);
    });

    // Position nodes
    const updatedNodes = nodes.map((node) => {
        const level = levels[node.id] || 0;
        const nodesInLevel = nodesByLevel[level];
        const indexInLevel = nodesInLevel.indexOf(node);

        // Calculate position
        const y = level * levelSpacing + 100;

        // Center nodes horizontally
        const totalWidth = (nodesInLevel.length - 1) * nodeSpacing;
        const startX = -totalWidth / 2;
        const x = startX + indexInLevel * nodeSpacing;

        return {
            ...node,
            position: { x, y },
        };
    });

    return updatedNodes;
}

/**
 * Apply force-directed layout (placeholder for future implementation)
 * @param {Array} nodes - Array of ReactFlow nodes
 * @param {Array} edges - Array of ReactFlow edges
 * @returns {Array} Nodes with updated positions
 */
export function applyForceDirectedLayout(nodes, edges) {
    // TODO: Implement force-directed layout using D3
    console.warn('Force-directed layout not yet implemented');
    return nodes;
}

/**
 * Center the graph in the viewport
 * @param {Array} nodes - Array of ReactFlow nodes
 * @param {number} width - Viewport width
 * @param {number} height - Viewport height
 * @returns {Array} Nodes with centered positions
 */
export function centerGraph(nodes, width = 800, height = 600) {
    if (nodes.length === 0) return nodes;

    // Find bounding box
    let minX = Infinity,
        maxX = -Infinity;
    let minY = Infinity,
        maxY = -Infinity;

    nodes.forEach((node) => {
        minX = Math.min(minX, node.position.x);
        maxX = Math.max(maxX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxY = Math.max(maxY, node.position.y);
    });

    // Calculate offset to center
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    const offsetX = (width - graphWidth) / 2 - minX;
    const offsetY = (height - graphHeight) / 2 - minY;

    // Apply offset
    return nodes.map((node) => ({
        ...node,
        position: {
            x: node.position.x + offsetX,
            y: node.position.y + offsetY,
        },
    }));
}
