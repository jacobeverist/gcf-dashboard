import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import useNetworkStore from '../stores/networkStore';
import useExecutionStore from '../stores/executionStore';
import { addBlock } from '../utils/wasmBridge';

/**
 * Hook to handle drag-and-drop from palette to canvas
 */
export default function usePaletteDragDrop() {
    const { screenToFlowPosition } = useReactFlow();
    const addNode = useNetworkStore((state) => state.addNode);
    const wasmNetwork = useExecutionStore((state) => state.wasmNetwork);

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

            // Create WASM block
            let wasmHandle = null;
            if (wasmNetwork) {
                wasmHandle = addBlock(wasmNetwork, blockType, {});
            }

            // Create ReactFlow node
            const newNode = {
                type: blockType,
                position,
                data: {
                    label: getBlockLabel(blockType),
                    wasmHandle,
                    hasInput: true,
                    hasOutput: true,
                    hasContext: blockType === 'SequenceLearner' || blockType === 'ContextLearner',
                },
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode, wasmNetwork]
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
        ScalarTransformer: 'Scalar Transformer',
        DiscreteTransformer: 'Discrete Transformer',
        PersistenceTransformer: 'Persistence Transformer',
        PatternPooler: 'Pattern Pooler',
        PatternClassifier: 'Pattern Classifier',
        SequenceLearner: 'Sequence Learner',
        ContextLearner: 'Context Learner',
    };
    return labels[blockType] || blockType;
}
