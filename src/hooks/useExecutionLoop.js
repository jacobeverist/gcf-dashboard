import {useEffect, useRef} from 'react';
import useExecutionStore from '../stores/executionStore';
import useNetworkStore from '../stores/networkStore';
import useVisualizationStore from '../stores/visualizationStore';
import useDataSourceStore from '../stores/dataSourceStore';
import {
    executeNetwork, // getBlockState,
    getExecutionState, getBlockOutput, setScalarValue, setDiscreteValue,
} from '../utils/wasmBridge';

/**
 * Extract the data from a single block given the ExecutionState data received over WASM
 * @param {Object} networkState - ExecutionState data of entire network
 * @param {int} handle - wasm handle of block of interest
 * @returns {Uint8Array|null} Bitfield state
 */
function extractBlockState(networkState, handle) {

    if (!networkState) return null;

    try {

        const blockStates = networkState.block_states;
        const blockMetadata = networkState.block_metadata;
        const connections = networkState.connections;

        // connections.forEach(connection => {
        //     const {source_id, target_id, connection_type, time_offset} = connection;
        // });
        // blockMetadata.forEach(blockData => {
        //     const {id, name, block_type, num_statelets, num_active} = blockData;
        //     //const {id, name, block_type, num_statelets, num_active} = thisBlockMetadata || {};
        // });

        const blockState = blockStates[handle];
        let {num_bits, active_bits, num_active} = blockState || {};
        const activeSet = new Set(active_bits);
        if (blockState && blockState.num_bits) {
            let blockArray = new Uint8Array(num_bits);
            // Convert state to Uint8Array
            for (let i = 0; i < num_bits; i++) {
                blockArray[i] = activeSet.has(i) ? 1 : 0;
            }
            console.log(`[Execution Loop] Block State:`, blockArray);
            console.log(`[Execution Loop] Active Set:`, activeSet);
            return {blockArray: blockArray, activeSet: activeSet};
        }

        // console.log(`[Execution Loop] Block States: ${blockStates}`);

        // const blockTrace = stepTrace.block_states?.[handle];

        // extract block state and metadata from this trace, assuming that there is only one step
        // const {id, name, block_type, num_statelets, num_active2} = blockMetadata[handle] || {};
        // console.log(`[Execution Loop] Block State: ${handle} (${name}) - Size - ${num_bits} - Type: ${block_type} - Active: ${activeSet.size} / ${num_active}`);
        // console.log(`[Execution Loop] Active States: ${active_bits}`);

        // Fallback: return empty array
        const emptySet = new Set();
        const emptyArray = new Uint8Array(32);
        return {blockArray: emptyArray, activeSet: emptySet};
    } catch (error) {
        console.error('[Execution Loop] Failed to get block state:', error);
        const emptySet = new Set();
        const emptyArray = new Uint8Array(32);
        return {blockArray: emptyArray, activeSet: emptySet};
    }

}


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
        // if (!wasmNetwork) return;

        try {
            // Step 1: Execute all data sources first
            const sourceValues = executeAllSources();

            // Step 2: Update data source nodes with current values
            if (Object.keys(sourceValues).length > 0) {
                console.log(`[Execution Loop] Data sources generated:`, Object.keys(sourceValues).length, 'values');

                Object.keys(sourceValues).forEach((sourceId) => {
                    const value = sourceValues[sourceId];
                    const source = getSource(sourceId);

                    if (!source) {
                        console.warn(`[Execution Loop] Source ${sourceId} not found in store`);
                        return;
                    }

                    console.log(`[Execution Loop] Processing source ${sourceId} (${source.type}): value = ${value}`);

                    console.log(`[Execution Loop] Dashboard nodes:`, nodes);
                    console.log(`[Execution Loop] Dashboard edges:`, edges);

                    // Update the data source node's current value
                    const sourceNode = nodes.find((node) => node.data.sourceId === sourceId);
                    if (sourceNode) {
                        updateNodeData(sourceNode.id, {
                            currentValue: value,
                        });
                    }

                    console.log(`[Execution Loop] Source node data:`, sourceNode.data);

                    /*
                    const sourceNodeData= {
                        blockType : "ScalarDataSource",
                        currentValue : null,
                        enabled : true,
                        hasInput : false,
                        hasOutput : true,
                        id : "node-1761453535746",
                        label : "Scalar Source",
                        params : {pattern: 'sine', amplitude: 1, frequency: 0.1, offset: 0, noise: 0},
                        pattern : "sine",
                        sourceId : "ds-1761453535745-0ghcytmuk",
                        sourceType : "scalar"
                    }
                    */

                    // Find all edges from this data source
                    const outgoingEdges = edges.filter((edge) => edge.source === sourceNode?.id);

                    console.log(`[Execution Loop] Found ${outgoingEdges.length} outgoing edges from source ${sourceId}`);

                    outgoingEdges.forEach((edge) => {
                        // Enable animation on data source edges during execution
                        if (edge.type === 'dataSource') {
                            edge.data = {...edge.data, animated: true};
                        }

                        // Find the target node
                        const targetNode = nodes.find((node) => node.id === edge.target);

                        if (!targetNode) {
                            console.warn(`[Execution Loop] Target node ${edge.target} not found`);
                            return;
                        }

                        /*
                        const targetNodeData = {
                            blockType : "ScalarTransformer",
                            hasContext : false,
                            hasInput : true,
                            hasOutput : true,
                            id : "node-1761453531551-0",
                            label : "Input Scalar",
                            wasmHandle : 0
                        }
                        */

                        console.log(`[Execution Loop] Target node found:`, edge.target);

                        console.log(`[Execution Loop] Target node data:`, targetNode.data);
                        // console.log(`[Execution Loop] Target node data keys:`, Object.keys(targetNode.data));
                        // console.log(`[Execution Loop] Target node data keys:`, Object.values(targetNode.data));
                        // console.log(`[Execution Loop] Target node wasmHandle value:`, targetNode.data.wasmHandle);
                        // console.log(`[Execution Loop] Target node wasmHandle type:`, typeof targetNode.data.wasmHandle);

                        if (targetNode.data.wasmHandle === undefined) {
                            console.warn(`[Execution Loop] Target node ${edge.target} (${targetNode.data.blockType}) has no wasmHandle. Full data:`, targetNode.data);
                            return;
                        }

                        const handle = targetNode.data.wasmHandle;
                        const targetType = targetNode.data.blockType;

                        // Set the value on the appropriate transformer type
                        try {
                            if (source.type === 'scalar' && targetType === 'ScalarTransformer') {
                                // console.log(`[Execution Loop] Set scalar value ${value.toFixed(2)} on ${targetType} (handle: ${handle})`);
                                console.log(`[Execution Loop] Set scalar value:`, value);
                                console.log(`[Execution Loop] WasmNetwork:`, wasmNetwork);
                                setScalarValue(wasmNetwork, handle, value);
                            } else if (source.type === 'discrete' && targetType === 'DiscreteTransformer') {
                                console.log(`[Execution Loop] Set discrete value ${value} on ${targetType} (handle: ${handle})`);
                                setDiscreteValue(wasmNetwork, handle, value);
                            } else {
                                console.warn(`[Execution Loop] Type mismatch: ${source.type} source → ${targetType} transformer`);
                            }
                        } catch (error) {
                            console.error(`[Execution Loop] Error setting value on ${targetType}:`, error);
                        }
                    });
                });
            }

            // Step 3: Execute one step in the WASM network
            // console.log(`[Execution Loop is recording:`, wasmNetwork.is_recording());
            executeNetwork(wasmNetwork, learningEnabled);
            // console.log(`[Execution Loop] executeNetwork() on`, wasmNetwork);

            // Get current timestamp
            const timestamp = Date.now();

            // const traceJson = wasmNetwork.get_trace_json();
            // console.log(`[Execution Loop] get_trace_json():`, traceJson);

            // const stateJson = wasmNetwork.get_state_json();
            // console.log(`[Execution Loop] get_state_json():`, stateJson);
            const networkState = getExecutionState(wasmNetwork);
            // console.log(`[Execution Loop] getExecutionState():`, networkState);

            // Step 4: Update state for all nodes
            nodes.forEach((node) => {
                const handle = node.data.wasmHandle;
                if (handle === undefined) return;

                // Get block state (bitfield)
                const {blockArray, activeSet} = extractBlockState(networkState, handle);

                console.log(`[Execution Loop] extractBlockState(${handle}) =`, blockArray, activeSet);
                // console.log(`[Execution Loop] extractBlockState(${handle}) =`, state,
                //     `(${state ? state.length : 0} bits)`);

                if (blockArray) {
                    updateBitfield(node.id, blockArray);

                    const activeIndices = Array.from(activeSet).map(b => b.toString()).join(' ');
                    updateNodeData(node.id, {
                        statePreview: activeIndices, hasOutput: true,
                    });

                    // Update node state preview
                    // const previewBits = Array.from(blockArray.slice(0, 8))
                    //     .map(b => b ? '1' : '0')
                    //     .join('');
                    // updateNodeData(node.id, {
                    //     statePreview: previewBits, hasOutput: true,
                    // });
                }

                // Get block output value
                const output = getBlockOutput(wasmNetwork, handle);
                if (!(!output && output !== 0)) {
                    updateTimeSeries(node.id, output, timestamp);
                }
                // const output = getBlockOutput(wasmNetwork, handle);
                // if (output != undefined) {
                //     updateTimeSeries(node.id, output, timestamp);
                // }
            });

            // Step 5: Increment step counter
            useExecutionStore.setState((state) => ({
                executionStep: state.executionStep + 1,
            }));
        } catch (error) {
            console.error('[Execution Loop] Error during step:', error);
            useExecutionStore.setState({isRunning: false});
        }
    }

    return {
        isRunning, executionStep,
    };
}
