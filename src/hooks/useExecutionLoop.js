import { useEffect, useRef } from 'react';
import useExecutionStore from '../stores/executionStore';
import useNetworkStore from '../stores/networkStore';
import useVisualizationStore from '../stores/visualizationStore';
import useDataSourceStore from '../stores/dataSourceStore';
import { executeNetwork, getBlockState, getBlockOutput, setScalarValue, setDiscreteValue } from '../utils/wasmBridge';

/**
 * Hook to manage the execution loop
 * Runs at the specified speed when isRunning is true
 */
export default function useExecutionLoop() {
    const intervalRef = useRef(null);

    const isRunning = useExecutionStore((state) => state.isRunning);
    const speed = useExecutionStore((state) => state.speed);
    const learningEnabled = useExecutionStore((state) => state.learningEnabled);
    const wasmNetwork = useExecutionStore((state) => state.wasmNetwork);
    const executionStep = useExecutionStore((state) => state.executionStep);

    const nodes = useNetworkStore((state) => state.nodes);
    const edges = useNetworkStore((state) => state.edges);
    const updateNodeData = useNetworkStore((state) => state.updateNodeData);

    const updateTimeSeries = useVisualizationStore((state) => state.updateTimeSeries);
    const updateBitfield = useVisualizationStore((state) => state.updateBitfield);

    const executeAllSources = useDataSourceStore((state) => state.executeAllSources);
    const getSource = useDataSourceStore((state) => state.getSource);

    useEffect(() => {
        if (isRunning && wasmNetwork) {
            // Start execution loop
            intervalRef.current = setInterval(() => {
                executeStep();
            }, speed);

            console.log(`[Execution Loop] Started (speed: ${speed}ms)`);
        } else {
            // Stop execution loop
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                console.log('[Execution Loop] Stopped');
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, speed, wasmNetwork]); // eslint-disable-line react-hooks/exhaustive-deps

    function executeStep() {
        if (!wasmNetwork) return;

        try {
            // Step 1: Execute all data sources first
            const sourceValues = executeAllSources();

            // Step 2: Update data source nodes with current values
            if (Object.keys(sourceValues).length > 0) {
                Object.keys(sourceValues).forEach((sourceId) => {
                    const value = sourceValues[sourceId];
                    const source = getSource(sourceId);

                    if (!source) return;

                    // Update the data source node's current value
                    const sourceNode = nodes.find((node) => node.data.sourceId === sourceId);
                    if (sourceNode) {
                        updateNodeData(sourceNode.id, {
                            currentValue: value,
                        });
                    }

                    // Find all edges from this data source
                    const outgoingEdges = edges.filter((edge) => edge.source === sourceNode?.id);

                    outgoingEdges.forEach((edge) => {
                        // Enable animation on data source edges during execution
                        if (edge.type === 'dataSource') {
                            edge.data = { ...edge.data, animated: true };
                        }

                        // Find the target node
                        const targetNode = nodes.find((node) => node.id === edge.target);

                        if (!targetNode || !targetNode.data.wasmHandle) return;

                        const handle = targetNode.data.wasmHandle;
                        const targetType = targetNode.data.blockType;

                        // Set the value on the appropriate transformer type
                        try {
                            if (source.type === 'scalar' && targetType === 'ScalarTransformer') {
                                setScalarValue(wasmNetwork, handle, value);
                            } else if (source.type === 'discrete' && targetType === 'DiscreteTransformer') {
                                setDiscreteValue(wasmNetwork, handle, value);
                            }
                        } catch (error) {
                            console.error(`[Execution Loop] Error setting value on ${targetType}:`, error);
                        }
                    });
                });
            }

            // Step 3: Execute one step in the WASM network
            executeNetwork(wasmNetwork, learningEnabled);

            // Get current timestamp
            const timestamp = Date.now();

            // Step 4: Update state for all nodes
            nodes.forEach((node) => {
                const handle = node.data.wasmHandle;
                if (handle === undefined) return;

                // Get block state (bitfield)
                const state = getBlockState(wasmNetwork, handle);
                if (state) {
                    updateBitfield(node.id, state);

                    // Update node state preview
                    const previewBits = Array.from(state.slice(0, 8))
                        .map(b => b ? '1' : '0')
                        .join('');
                    updateNodeData(node.id, {
                        statePreview: previewBits,
                        hasOutput: true,
                    });
                }

                // Get block output value
                const output = getBlockOutput(wasmNetwork, handle);
                updateTimeSeries(node.id, output, timestamp);
            });

            // Step 5: Increment step counter
            useExecutionStore.setState((state) => ({
                executionStep: state.executionStep + 1,
            }));
        } catch (error) {
            console.error('[Execution Loop] Error during step:', error);
            useExecutionStore.setState({ isRunning: false });
        }
    }

    return {
        isRunning,
        executionStep,
    };
}
