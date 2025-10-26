import { useCallback } from 'react';
import useNetworkStore from '../stores/networkStore';
import useExecutionStore from '../stores/executionStore';
import useVisualizationStore from '../stores/visualizationStore';
import useDataSourceStore from '../stores/dataSourceStore';
import { addBlock, connectBlocks, rebuildNetwork } from '../utils/wasmBridge';
import { getDemoConfig } from '../utils/demoConfigs';
import { applyHierarchicalLayout } from '../utils/layoutAlgorithms';
import { getBlockDefaults } from '../utils/blockHelpers';

/**
 * Hook to initialize demo networks
 */
export default function useDemoInitializer() {
    const setNodes = useNetworkStore((state) => state.setNodes);
    const setEdges = useNetworkStore((state) => state.setEdges);
    const reset = useNetworkStore((state) => state.reset);

    const wasmNetwork = useExecutionStore((state) => state.wasmNetwork);
    const setNetworkStatus = useExecutionStore((state) => state.setNetworkStatus);

    const clearData = useVisualizationStore((state) => state.clearData);
    const initializePlots = useVisualizationStore((state) => state.initializePlots);

    const addSource = useDataSourceStore((state) => state.addSource);
    const clearSources = useDataSourceStore((state) => state.clear);

    const initializeDemo = useCallback((demoKey) => {
        if (!wasmNetwork) {
            console.error('[Demo Init] WASM network not ready');
            return false;
        }

        const demoConfig = getDemoConfig(demoKey);
        if (!demoConfig) {
            console.error('[Demo Init] Invalid demo key:', demoKey);
            return false;
        }

        console.log(`[Demo Init] Initializing demo: ${demoConfig.name}`);

        // Clear existing network and data sources
        reset();
        clearData();
        clearSources();

        // Create nodes
        const nodes = [];
        const wasmHandles = []; // Store WASM handles to create connections
        const dataSourceIds = []; // Store data source IDs

        demoConfig.blocks.forEach((blockDef, index) => {
            const nodeId = `node-${Date.now()}-${index}`;
            const isDataSource = blockDef.type === 'ScalarDataSource' || blockDef.type === 'DiscreteDataSource';

            console.log(`[Demo Init] Processing block ${index}: ${blockDef.type}, isDataSource: ${isDataSource}`);

            if (isDataSource) {
                // Create data source
                const sourceType = blockDef.type === 'ScalarDataSource' ? 'scalar' : 'discrete';
                const sourceConfig = blockDef.params || {};
                const sourceId = addSource(sourceType, sourceConfig);
                dataSourceIds.push(sourceId);
                wasmHandles.push(null); // No WASM handle for data sources

                // Create ReactFlow node for data source
                const node = {
                    id: nodeId,
                    type: blockDef.type,
                    position: blockDef.position,
                    data: {
                        label: blockDef.label,
                        id: nodeId,
                        blockType: blockDef.type,
                        sourceId: sourceId,
                        sourceType: sourceType,
                        hasOutput: true,
                        hasInput: false,
                        enabled: true,
                        params: sourceConfig,
                        currentValue: null,
                    },
                };
                nodes.push(node);
            } else {
                // Create WASM block with default parameters
                const defaultParams = getBlockDefaults(blockDef.type);
                const params = blockDef.params || defaultParams; // Use demo params if provided, otherwise defaults
                console.log(`[Demo Init] Creating WASM block ${blockDef.type} with params:`, params);
                const handle = addBlock(wasmNetwork, blockDef.type, params);
                console.log(`[Demo Init] Created WASM block ${blockDef.type} with handle:`, handle);
                wasmHandles.push(handle);
                dataSourceIds.push(null); // No source ID for WASM blocks

                // Create ReactFlow node
                const node = {
                    id: nodeId,
                    type: blockDef.type,
                    position: blockDef.position,
                    data: {
                        label: blockDef.label,
                        id: nodeId,
                        blockType: blockDef.type,
                        wasmHandle: handle,
                        hasInput: true,
                        hasOutput: true,
                        hasContext: blockDef.type === 'SequenceLearner' || blockDef.type === 'ContextLearner',
                    },
                };
                nodes.push(node);
                console.log(`[Demo Init] Node created:`, node.id, 'wasmHandle:', node.data.wasmHandle);
            }
        });

        // Create edges
        const edges = [];
        demoConfig.connections.forEach((connDef, index) => {
            const sourceNode = nodes[connDef.sourceIndex];
            const targetNode = nodes[connDef.targetIndex];
            const sourceHandle = wasmHandles[connDef.sourceIndex];
            const targetHandle = wasmHandles[connDef.targetIndex];
            const sourceId = dataSourceIds[connDef.sourceIndex];

            // Check if source is a data source
            const isDataSourceConnection = sourceId !== null;

            if (isDataSourceConnection) {
                // Data source connection - no WASM connection needed
                // The execution loop handles data flow from data sources
                const edge = {
                    id: `edge-${Date.now()}-${index}`,
                    source: sourceNode.id,
                    target: targetNode.id,
                    sourceHandle: 'output',
                    targetHandle: 'input',
                    type: 'dataSource',
                    data: { animated: false },
                };
                edges.push(edge);
                console.log(`[Demo Init] Created data source edge: ${sourceNode.data.label} → ${targetNode.data.label}`);
            } else {
                // WASM block connection
                connectBlocks(wasmNetwork, sourceHandle, targetHandle, connDef.type);

                // Create ReactFlow edge
                const edge = {
                    id: `edge-${Date.now()}-${index}`,
                    source: sourceNode.id,
                    target: targetNode.id,
                    sourceHandle: 'output',
                    targetHandle: connDef.type === 'context' ? 'context' : 'input',
                    type: connDef.type,
                };
                edges.push(edge);
            }
        });

        // Rebuild the WASM network (compute execution order)
        console.log(`[Demo Init] Rebuilding WASM network...`);
        rebuildNetwork(wasmNetwork);
        console.log(`[Demo Init] Network rebuilt successfully`);

        // Apply hierarchical layout
        const layoutedNodes = applyHierarchicalLayout(nodes, edges);

        // Debug: Check if wasmHandles survived layout
        layoutedNodes.forEach((node) => {
            if (node.data.wasmHandle !== undefined) {
                console.log(`[Demo Init] After layout - Node ${node.id} has wasmHandle:`, node.data.wasmHandle);
            }
        });

        // Update stores
        setNodes(layoutedNodes);
        setEdges(edges);
        setNetworkStatus(`Network: ${nodes.length} blocks`);

        // Initialize plots for this demo
        initializePlots(demoKey);

        console.log(`[Demo Init] Created ${nodes.length} nodes and ${edges.length} edges`);
        return true;
    }, [wasmNetwork, reset, clearData, clearSources, setNodes, setEdges, setNetworkStatus, initializePlots, addSource]);

    return { initializeDemo };
}
