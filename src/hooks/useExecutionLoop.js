import { useEffect, useRef } from 'react';
import useExecutionStore from '../stores/executionStore';
import useNetworkStore from '../stores/networkStore';
import useVisualizationStore from '../stores/visualizationStore';
import { executeNetwork, getBlockState, getBlockOutput } from '../utils/wasmBridge';

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
    const updateNodeData = useNetworkStore((state) => state.updateNodeData);

    const updateTimeSeries = useVisualizationStore((state) => state.updateTimeSeries);
    const updateBitfield = useVisualizationStore((state) => state.updateBitfield);

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
            // Execute one step in the WASM network
            executeNetwork(wasmNetwork, learningEnabled);

            // Get current timestamp
            const timestamp = Date.now();

            // Update state for all nodes
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

            // Increment step counter
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
