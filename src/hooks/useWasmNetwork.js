import { useEffect, useState } from 'react';
import { initializeWasm, createNetwork } from '../utils/wasmBridge';
import useExecutionStore from '../stores/executionStore';

/**
 * Hook to manage WASM network lifecycle
 * @returns {object} WASM network state and methods
 */
export default function useWasmNetwork() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const setWasmNetwork = useExecutionStore((state) => state.setWasmNetwork);
    const setWasmError = useExecutionStore((state) => state.setWasmError);
    const wasmNetwork = useExecutionStore((state) => state.wasmNetwork);
    const isReady = useExecutionStore((state) => state.wasmReady);

    useEffect(() => {
        async function init() {
            try {
                setIsLoading(true);
                const success = await initializeWasm();

                if (success) {
                    const network = createNetwork();
                    if (network) {
                        setWasmNetwork(network);
                        setError(null);
                        console.log('[useWasmNetwork] createNetwork() sucessful. Network handle:', network);

                    } else {
                        throw new Error('Failed to create network instance');
                    }
                } else {
                    throw new Error('Failed to initialize WASM module');
                }
            } catch (err) {
                console.error('[useWasmNetwork] Initialization error:', err);
                setError(err.message);
                setWasmError(err.message);
            } finally {
                setIsLoading(false);
                console.log('[useWasmNetwork] initializeWasm() successfully initialized');

            }
        }

        init();
    }, [setWasmNetwork, setWasmError]);

    return {
        network: wasmNetwork,
        isReady,
        isLoading,
        error,
    };
}
