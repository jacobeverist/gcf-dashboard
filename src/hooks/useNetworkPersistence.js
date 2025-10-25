import { useCallback, useRef } from 'react';
import useNetworkStore from '../stores/networkStore';
import useExecutionStore from '../stores/executionStore';
import useDataSourceStore from '../stores/dataSourceStore';
import { addBlock, connectBlocks } from '../utils/wasmBridge';
import {
    downloadNetwork,
    loadNetworkFromFile,
    saveToLocalStorage,
    loadFromLocalStorage,
} from '../utils/persistence';

/**
 * Hook for network save/load operations
 */
export default function useNetworkPersistence() {
    const fileInputRef = useRef(null);

    const nodes = useNetworkStore((state) => state.nodes);
    const edges = useNetworkStore((state) => state.edges);
    const setNodes = useNetworkStore((state) => state.setNodes);
    const setEdges = useNetworkStore((state) => state.setEdges);
    const reset = useNetworkStore((state) => state.reset);

    const wasmNetwork = useExecutionStore((state) => state.wasmNetwork);
    const currentDemo = useExecutionStore((state) => state.currentDemo);
    const setNetworkStatus = useExecutionStore((state) => state.setNetworkStatus);

    const dataSources = useDataSourceStore((state) => state.sources);
    const addSource = useDataSourceStore((state) => state.addSource);
    const clearDataSources = useDataSourceStore((state) => state.clear);

    /**
     * Save network to file
     */
    const saveNetwork = useCallback(() => {
        if (nodes.length === 0) {
            console.log('[Save] No network to save');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `network-${timestamp}.json`;

        downloadNetwork(nodes, edges, dataSources, filename, currentDemo);
        console.log('[Save] Network saved to file:', filename);
    }, [nodes, edges, dataSources, currentDemo]);

    /**
     * Load network from file
     */
    const loadNetwork = useCallback(() => {
        // Create file input if it doesn't exist
        if (!fileInputRef.current) {
            fileInputRef.current = document.createElement('input');
            fileInputRef.current.type = 'file';
            fileInputRef.current.accept = '.json';
            fileInputRef.current.style.display = 'none';
            document.body.appendChild(fileInputRef.current);
        }

        fileInputRef.current.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const data = await loadNetworkFromFile(file);

                // Clear existing network and data sources
                reset();
                clearDataSources();

                // Recreate data sources first
                const sourceIdMap = {}; // Maps old source IDs to new source IDs
                if (data.dataSources && Array.isArray(data.dataSources)) {
                    for (const sourceConfig of data.dataSources) {
                        const oldId = sourceConfig.id;
                        const newId = addSource(sourceConfig.type, sourceConfig);
                        sourceIdMap[oldId] = newId;
                        console.log(`[Load] Recreated data source: ${sourceConfig.name} (${oldId} → ${newId})`);
                    }
                }

                // Recreate nodes with WASM blocks
                const newNodes = [];
                const wasmHandles = [];

                for (const nodeData of data.nodes) {
                    const isDataSource = nodeData.type === 'DiscreteDataSource' || nodeData.type === 'ScalarDataSource';

                    if (isDataSource) {
                        // Data source node
                        const oldSourceId = nodeData.data.sourceId;
                        const newSourceId = sourceIdMap[oldSourceId] || oldSourceId;

                        const node = {
                            id: nodeData.id,
                            type: nodeData.type,
                            position: nodeData.position,
                            data: {
                                ...nodeData.data,
                                sourceId: newSourceId,
                                hasInput: false,
                                hasOutput: true,
                            },
                        };
                        newNodes.push(node);
                    } else {
                        // WASM block
                        let wasmHandle = null;
                        if (wasmNetwork) {
                            wasmHandle = addBlock(wasmNetwork, nodeData.type, {});
                            wasmHandles.push({ nodeId: nodeData.id, handle: wasmHandle });
                        }

                        // Create ReactFlow node
                        const node = {
                            id: nodeData.id,
                            type: nodeData.type,
                            position: nodeData.position,
                            data: {
                                ...nodeData.data,
                                wasmHandle,
                                hasInput: true,
                                hasOutput: true,
                                hasContext:
                                    nodeData.type === 'SequenceLearner' || nodeData.type === 'ContextLearner',
                            },
                        };
                        newNodes.push(node);
                    }
                }

                // Recreate edges and WASM connections
                const newEdges = [];
                for (const edgeData of data.edges) {
                    // Find WASM handles for source and target
                    const sourceHandle = wasmHandles.find((h) => h.nodeId === edgeData.source)?.handle;
                    const targetHandle = wasmHandles.find((h) => h.nodeId === edgeData.target)?.handle;

                    // Create WASM connection
                    if (wasmNetwork && sourceHandle && targetHandle) {
                        connectBlocks(wasmNetwork, sourceHandle, targetHandle, edgeData.type || 'input');
                    }

                    // Create ReactFlow edge
                    const edge = {
                        id: edgeData.id,
                        source: edgeData.source,
                        target: edgeData.target,
                        sourceHandle: edgeData.sourceHandle,
                        targetHandle: edgeData.targetHandle,
                        type: edgeData.type || 'input',
                    };
                    newEdges.push(edge);
                }

                // Update stores
                setNodes(newNodes);
                setEdges(newEdges);
                setNetworkStatus(`Network: ${newNodes.length} blocks`);

                console.log('[Load] Network loaded:', {
                    nodes: newNodes.length,
                    edges: newEdges.length,
                    demo: data.demo,
                });
            } catch (error) {
                console.error('[Load] Failed to load network:', error);
                alert('Failed to load network: ' + error.message);
            }

            // Reset file input
            fileInputRef.current.value = '';
        };

        // Trigger file picker
        fileInputRef.current.click();
    }, [wasmNetwork, reset, setNodes, setEdges, setNetworkStatus]);

    /**
     * Auto-save network to localStorage
     */
    const autoSave = useCallback(() => {
        if (nodes.length === 0) return;
        saveToLocalStorage(nodes, edges, dataSources, 'gnomics-network-autosave', currentDemo);
    }, [nodes, edges, dataSources, currentDemo]);

    /**
     * Load network from localStorage
     */
    const loadAutoSave = useCallback(() => {
        const data = loadFromLocalStorage('gnomics-network-autosave');
        if (!data) {
            console.log('[AutoLoad] No autosave found');
            return false;
        }

        try {
            // Clear existing network and data sources
            reset();
            clearDataSources();

            // Recreate data sources first
            const sourceIdMap = {};
            if (data.dataSources && Array.isArray(data.dataSources)) {
                for (const sourceConfig of data.dataSources) {
                    const oldId = sourceConfig.id;
                    const newId = addSource(sourceConfig.type, sourceConfig);
                    sourceIdMap[oldId] = newId;
                    console.log(`[AutoLoad] Recreated data source: ${sourceConfig.name} (${oldId} → ${newId})`);
                }
            }

            // Recreate nodes with WASM blocks
            const newNodes = [];
            const wasmHandles = [];

            for (const nodeData of data.nodes) {
                const isDataSource = nodeData.type === 'DiscreteDataSource' || nodeData.type === 'ScalarDataSource';

                if (isDataSource) {
                    // Data source node
                    const oldSourceId = nodeData.data.sourceId;
                    const newSourceId = sourceIdMap[oldSourceId] || oldSourceId;

                    const node = {
                        id: nodeData.id,
                        type: nodeData.type,
                        position: nodeData.position,
                        data: {
                            ...nodeData.data,
                            sourceId: newSourceId,
                            hasInput: false,
                            hasOutput: true,
                        },
                    };
                    newNodes.push(node);
                } else {
                    // WASM block
                    let wasmHandle = null;
                    if (wasmNetwork) {
                        wasmHandle = addBlock(wasmNetwork, nodeData.type, {});
                        wasmHandles.push({ nodeId: nodeData.id, handle: wasmHandle });
                    }

                    const node = {
                        id: nodeData.id,
                        type: nodeData.type,
                        position: nodeData.position,
                        data: {
                            ...nodeData.data,
                            wasmHandle,
                            hasInput: true,
                            hasOutput: true,
                            hasContext:
                                nodeData.type === 'SequenceLearner' || nodeData.type === 'ContextLearner',
                        },
                    };
                    newNodes.push(node);
                }
            }

            // Recreate edges and WASM connections
            const newEdges = [];
            for (const edgeData of data.edges) {
                const sourceHandle = wasmHandles.find((h) => h.nodeId === edgeData.source)?.handle;
                const targetHandle = wasmHandles.find((h) => h.nodeId === edgeData.target)?.handle;

                if (wasmNetwork && sourceHandle && targetHandle) {
                    connectBlocks(wasmNetwork, sourceHandle, targetHandle, edgeData.type || 'input');
                }

                const edge = {
                    id: edgeData.id,
                    source: edgeData.source,
                    target: edgeData.target,
                    sourceHandle: edgeData.sourceHandle,
                    targetHandle: edgeData.targetHandle,
                    type: edgeData.type || 'input',
                };
                newEdges.push(edge);
            }

            // Update stores
            setNodes(newNodes);
            setEdges(newEdges);
            setNetworkStatus(`Network: ${newNodes.length} blocks`);

            console.log('[AutoLoad] Network loaded from autosave:', {
                nodes: newNodes.length,
                edges: newEdges.length,
                dataSources: Object.keys(sourceIdMap).length,
            });

            return true;
        } catch (error) {
            console.error('[AutoLoad] Failed to load autosave:', error);
            return false;
        }
    }, [wasmNetwork, reset, clearDataSources, addSource, setNodes, setEdges, setNetworkStatus]);

    return {
        saveNetwork,
        loadNetwork,
        autoSave,
        loadAutoSave,
    };
}
