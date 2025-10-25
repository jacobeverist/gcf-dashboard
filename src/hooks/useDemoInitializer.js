import { useCallback } from 'react';
import useNetworkStore from '../stores/networkStore';
import useExecutionStore from '../stores/executionStore';
import useVisualizationStore from '../stores/visualizationStore';
import { addBlock, connectBlocks } from '../utils/wasmBridge';
import { getDemoConfig } from '../utils/demoConfigs';
import { applyHierarchicalLayout } from '../utils/layoutAlgorithms';

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

        // Clear existing network
        reset();
        clearData();

        // Create nodes
        const nodes = [];
        const wasmHandles = []; // Store WASM handles to create connections

        demoConfig.blocks.forEach((blockDef, index) => {
            // Create WASM block
            const handle = addBlock(wasmNetwork, blockDef.type, {});
            wasmHandles.push(handle);

            // Create ReactFlow node
            const nodeId = `node-${Date.now()}-${index}`;
            const node = {
                id: nodeId,
                type: blockDef.type,
                position: blockDef.position,
                data: {
                    label: blockDef.label,
                    id: nodeId,
                    wasmHandle: handle,
                    hasInput: true,
                    hasOutput: true,
                    hasContext: blockDef.type === 'SequenceLearner' || blockDef.type === 'ContextLearner',
                },
            };
            nodes.push(node);
        });

        // Create edges
        const edges = [];
        demoConfig.connections.forEach((connDef, index) => {
            const sourceNode = nodes[connDef.sourceIndex];
            const targetNode = nodes[connDef.targetIndex];
            const sourceHandle = wasmHandles[connDef.sourceIndex];
            const targetHandle = wasmHandles[connDef.targetIndex];

            // Create WASM connection
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
        });

        // Apply hierarchical layout
        const layoutedNodes = applyHierarchicalLayout(nodes, edges);

        // Update stores
        setNodes(layoutedNodes);
        setEdges(edges);
        setNetworkStatus(`Network: ${nodes.length} blocks`);

        // Initialize plots for this demo
        initializePlots(demoKey);

        console.log(`[Demo Init] Created ${nodes.length} nodes and ${edges.length} edges`);
        return true;
    }, [wasmNetwork, reset, clearData, setNodes, setEdges, setNetworkStatus, initializePlots]);

    return { initializeDemo };
}
