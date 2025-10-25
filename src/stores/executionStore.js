import { create } from 'zustand';
import { setScalarValue, setDiscreteValue } from '../utils/wasmBridge.js';

const useExecutionStore = create((set, get) => ({
    // WASM State
    wasmNetwork: null,
    wasmReady: false,
    wasmError: null,

    // Execution State
    isRunning: false,
    executionStep: 0,
    speed: 50,
    learningEnabled: true,

    // Demo State
    currentDemo: null,
    demoDescription: '',

    // Status
    networkStatus: 'Not created',
    wasmStatus: 'Not loaded',

    // Actions
    setWasmNetwork: (network) => {
        set({
            wasmNetwork: network,
            wasmReady: true,
            wasmStatus: 'Ready',
            wasmError: null,
        });
    },

    setWasmError: (error) => {
        set({
            wasmError: error,
            wasmStatus: 'Failed to load',
            wasmReady: false,
        });
    },

    start: () => {
        if (!get().wasmReady) {
            console.error('Cannot start: WASM not ready');
            return;
        }
        set({ isRunning: true });
    },

    stop: () => {
        set({ isRunning: false });
    },

    reset: () => {
        set({
            isRunning: false,
            executionStep: 0,
        });
    },

    executeStep: (dataSourceStore = null, networkStore = null) => {
        const { wasmNetwork, learningEnabled, executionStep } = get();
        if (!wasmNetwork) return;

        try {
            // Step 1: Execute all data sources first (if store provided)
            if (dataSourceStore) {
                const sourceValues = dataSourceStore.executeAllSources();

                // Step 2: Set values on connected transformer blocks (if networkStore provided)
                if (networkStore && Object.keys(sourceValues).length > 0) {
                    const { nodes, edges } = networkStore;

                    // For each data source with a value
                    Object.keys(sourceValues).forEach((sourceId) => {
                        const value = sourceValues[sourceId];
                        const source = dataSourceStore.getSource(sourceId);

                        if (!source) return;

                        // Find all edges from this data source
                        const outgoingEdges = edges.filter((edge) => edge.source === sourceId);

                        outgoingEdges.forEach((edge) => {
                            // Find the target node
                            const targetNode = nodes.find((node) => node.id === edge.target);

                            if (!targetNode || !targetNode.data.wasmHandle) return;

                            const handle = targetNode.data.wasmHandle;
                            const targetType = targetNode.data.blockType;

                            // Set the value on the appropriate transformer type
                            if (source.type === 'scalar' && targetType === 'ScalarTransformer') {
                                setScalarValue(wasmNetwork, handle, value);
                            } else if (source.type === 'discrete' && targetType === 'DiscreteTransformer') {
                                setDiscreteValue(wasmNetwork, handle, value);
                            }
                        });
                    });
                }
            }

            // Step 3: Execute the WASM network
            wasmNetwork.execute(learningEnabled);

            // Step 4: Increment step counter
            set({ executionStep: executionStep + 1 });
        } catch (error) {
            console.error('Execution error:', error);
            set({ isRunning: false });
        }
    },

    setSpeed: (speed) => set({ speed }),

    toggleLearning: () => {
        set((state) => ({ learningEnabled: !state.learningEnabled }));
    },

    setLearning: (enabled) => set({ learningEnabled: enabled }),

    setCurrentDemo: (demo, description = '') => {
        set({
            currentDemo: demo,
            demoDescription: description,
        });
    },

    setNetworkStatus: (status) => set({ networkStatus: status }),

    setWasmStatus: (status) => set({ wasmStatus: status }),

    // Complete reset
    fullReset: () => {
        set({
            isRunning: false,
            executionStep: 0,
            currentDemo: null,
            demoDescription: '',
            networkStatus: 'Not created',
        });
    },
}));

export default useExecutionStore;
