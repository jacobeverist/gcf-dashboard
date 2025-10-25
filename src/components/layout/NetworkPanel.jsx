import { ReactFlow, Background, Controls, MiniMap, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from '../nodes/nodeTypes';
import { edgeTypes } from '../edges/edgeTypes';
import useNetworkStore from '../../stores/networkStore';
import useNetworkPersistence from '../../hooks/useNetworkPersistence';

export default function NetworkPanel({ onDrop, onDragOver }) {
    const reactFlowInstance = useReactFlow();
    const nodes = useNetworkStore((state) => state.nodes);
    const edges = useNetworkStore((state) => state.edges);
    const onNodesChange = useNetworkStore((state) => state.onNodesChange);
    const onEdgesChange = useNetworkStore((state) => state.onEdgesChange);
    const onConnect = useNetworkStore((state) => state.onConnect);

    const { saveNetwork, loadNetwork } = useNetworkPersistence();

    const handleDelete = () => {
        const selectedNodes = reactFlowInstance.getNodes().filter((node) => node.selected);
        const selectedEdges = reactFlowInstance.getEdges().filter((edge) => edge.selected);

        if (selectedNodes.length === 0 && selectedEdges.length === 0) {
            console.log('[Delete] No nodes or edges selected');
            return;
        }

        // Delete selected nodes and edges
        selectedNodes.forEach((node) => {
            useNetworkStore.getState().removeNode(node.id);
        });

        selectedEdges.forEach((edge) => {
            useNetworkStore.getState().removeEdge(edge.id);
        });

        console.log('[Delete] Removed:', {
            nodes: selectedNodes.length,
            edges: selectedEdges.length,
        });
    };

    return (
        <div id="network-panel" onDrop={onDrop} onDragOver={onDragOver}>
            {/* Editor Toolbar */}
            <div id="editor-toolbar">
                <div className="editor-tool active" id="tool-select" title="Select Mode (V)">
                    🖱️
                </div>
                <div className="editor-tool" id="tool-connect" title="Add Connection (C)">
                    🔗
                </div>
                <div
                    className="editor-tool"
                    id="tool-delete"
                    title="Delete Selected (Delete)"
                    onClick={handleDelete}
                    style={{ cursor: 'pointer' }}
                >
                    🗑️
                </div>
                <div
                    className="editor-tool"
                    id="tool-save"
                    title="Save Network"
                    onClick={saveNetwork}
                    style={{ cursor: 'pointer' }}
                >
                    💾
                </div>
                <div
                    className="editor-tool"
                    id="tool-load"
                    title="Load Network"
                    onClick={loadNetwork}
                    style={{ cursor: 'pointer' }}
                >
                    📂
                </div>
            </div>

            {/* ReactFlow Canvas */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                style={{ background: 'var(--bg-secondary)' }}
            >
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        // Color nodes by type
                        const colorMap = {
                            ScalarTransformer: 'var(--block-scalar)',
                            DiscreteTransformer: 'var(--block-discrete)',
                            PersistenceTransformer: 'var(--block-persistence)',
                            PatternPooler: 'var(--block-pooler)',
                            PatternClassifier: 'var(--block-classifier)',
                            SequenceLearner: 'var(--block-sequence)',
                            ContextLearner: 'var(--block-context)',
                        };
                        return colorMap[node.type] || 'var(--accent-blue)';
                    }}
                    maskColor="rgba(0, 0, 0, 0.6)"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                    }}
                />
                <Background variant="dots" gap={12} size={1} color="var(--border-primary)" />
            </ReactFlow>
        </div>
    );
}
