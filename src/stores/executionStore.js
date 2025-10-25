import { create } from 'zustand';

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

    executeStep: () => {
        const { wasmNetwork, learningEnabled, executionStep } = get();
        if (!wasmNetwork) return;

        try {
            // Execute the WASM network
            wasmNetwork.execute(learningEnabled);

            // Increment step counter
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
