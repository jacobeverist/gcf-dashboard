import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from '../nodes/nodeTypes';
import { edgeTypes } from '../edges/edgeTypes';
import useNetworkStore from '../../stores/networkStore';

export default function NetworkPanel() {
    const nodes = useNetworkStore((state) => state.nodes);
    const edges = useNetworkStore((state) => state.edges);
    const onNodesChange = useNetworkStore((state) => state.onNodesChange);
    const onEdgesChange = useNetworkStore((state) => state.onEdgesChange);
    const onConnect = useNetworkStore((state) => state.onConnect);

    return (
        <div id="network-panel">
            {/* Editor Toolbar */}
            <div id="editor-toolbar">
                <div className="editor-tool active" id="tool-select" title="Select Mode (V)">
                    🖱️
                </div>
                <div className="editor-tool" id="tool-connect" title="Add Connection (C)">
                    🔗
                </div>
                <div className="editor-tool" id="tool-delete" title="Delete Selected">
                    🗑️
                </div>
                <div className="editor-tool" id="tool-save" title="Save Network">
                    💾
                </div>
                <div className="editor-tool" id="tool-load" title="Load Network">
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
