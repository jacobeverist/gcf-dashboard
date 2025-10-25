import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import useNetworkStore from '../stores/networkStore';
import useExecutionStore from '../stores/executionStore';
import useDataSourceStore from '../stores/dataSourceStore';
import useCustomBlockStore from '../stores/customBlockStore';
import { addBlock } from '../utils/wasmBridge';

/**
 * Hook to handle drag-and-drop from palette to canvas
 */
export default function usePaletteDragDrop() {
    const { screenToFlowPosition } = useReactFlow();
    const addNode = useNetworkStore((state) => state.addNode);
    const wasmNetwork = useExecutionStore((state) => state.wasmNetwork);
    const addSource = useDataSourceStore((state) => state.addSource);
    const getBlockById = useCustomBlockStore((state) => state.getBlockById);

    /**
     * Handle drag start from palette
     */
    const onDragStart = useCallback((event, blockType) => {
        event.dataTransfer.setData('application/reactflow', blockType);
        event.dataTransfer.effectAllowed = 'move';
    }, []);

    /**
     * Handle drop on ReactFlow canvas
     */
    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const blockType = event.dataTransfer.getData('application/reactflow');
            if (!blockType) return;

            // Get position in flow coordinates
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Check if this is a data source
            const isDataSource = blockType === 'DiscreteDataSource' || blockType === 'ScalarDataSource';

            if (isDataSource) {
                // Create data source instance
                const blockDef = getBlockById(blockType);
                const sourceType = blockType === 'DiscreteDataSource' ? 'discrete' : 'scalar';

                // Get default parameters from block definition
                const defaultParams = {};
                if (blockDef && blockDef.params) {
                    Object.entries(blockDef.params).forEach(([key, paramDef]) => {
                        defaultParams[key] = paramDef.default;
                    });
                }

                // Create data source in store
                const sourceConfig = {
                    name: getBlockLabel(blockType),
                    ...defaultParams,
                };
                const sourceId = addSource(sourceType, sourceConfig);

                // Create ReactFlow node for data source
                const newNode = {
                    type: blockType,
                    position,
                    data: {
                        label: getBlockLabel(blockType),
                        blockType,
                        sourceId,
                        sourceType,
                        hasOutput: true,
                        hasInput: false, // Data sources have no input
                        enabled: true,
                        params: defaultParams,
                        pattern: defaultParams.pattern || 'sine',
                        currentValue: null,
                    },
                };

                addNode(newNode);
                console.log(`[Palette] Created data source: ${blockType} (${sourceId})`);
            } else {
                // Create WASM block
                let wasmHandle = null;
                if (wasmNetwork) {
                    wasmHandle = addBlock(wasmNetwork, blockType, {});
                }

                // Create ReactFlow node for WASM block
                const newNode = {
                    type: blockType,
                    position,
                    data: {
                        label: getBlockLabel(blockType),
                        blockType,
                        wasmHandle,
                        hasInput: true,
                        hasOutput: true,
                        hasContext: blockType === 'SequenceLearner' || blockType === 'ContextLearner',
                    },
                };

                addNode(newNode);
                console.log(`[Palette] Created WASM block: ${blockType} (${wasmHandle})`);
            }
        },
        [screenToFlowPosition, addNode, wasmNetwork, addSource, getBlockById]
    );

    /**
     * Handle drag over (required for drop to work)
     */
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return {
        onDragStart,
        onDrop,
        onDragOver,
    };
}

/**
 * Get human-readable label for block type
 */
function getBlockLabel(blockType) {
    const labels = {
        // Data Sources
        DiscreteDataSource: 'Discrete Source',
        ScalarDataSource: 'Scalar Source',
        // Transformers
        ScalarTransformer: 'Scalar Transformer',
        DiscreteTransformer: 'Discrete Transformer',
        PersistenceTransformer: 'Persistence Transformer',
        // Learning
        PatternPooler: 'Pattern Pooler',
        PatternClassifier: 'Pattern Classifier',
        // Temporal
        SequenceLearner: 'Sequence Learner',
        ContextLearner: 'Context Learner',
    };
    return labels[blockType] || blockType;
}
