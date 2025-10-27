import useExecutionStore from '../../stores/executionStore';
import useNetworkStore from '../../stores/networkStore';

export default function DataPanel() {
    const executionStep = useExecutionStore((state) => state.executionStep);
    const nodes = useNetworkStore((state) => state.nodes);

    // Get data source nodes for count
    const dataSourceNodes = nodes.filter(node =>
        node.data.blockType === 'DiscreteDataSource' ||
        node.data.blockType === 'ScalarDataSource'
    );

    // Get WASM nodes for count
    const wasmNodes = nodes.filter(node => node.data.wasmHandle !== undefined);

    return (
        <div className="sidebar right" id="data-panel">
            <div className="metrics-display">
                <div className="metric-item">
                    <span className="metric-label">Step:</span>
                    <span className="metric-value" id="step-counter">{executionStep}</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Blocks:</span>
                    <span className="metric-value" id="block-counter">{nodes.length}</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Data Sources:</span>
                    <span className="metric-value">{dataSourceNodes.length}</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">WASM Blocks:</span>
                    <span className="metric-value">{wasmNodes.length}</span>
                </div>
            </div>

            <div style={{ padding: '20px', marginTop: '20px' }}>
                <div style={{
                    background: 'var(--bg-secondary)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                }}>
                    <div style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                    }}>
                        <p style={{ margin: '0 0 12px 0', fontWeight: 500 }}>
                            📊 Visualizations are now embedded in nodes!
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li style={{ marginBottom: '8px' }}>
                                Time series plots appear inside each node
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                Block states show within WASM nodes
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                Use the toggle buttons (📊 🔢) to show/hide plots
                            </li>
                            <li>
                                Data sources display their history inline
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Note about removed sections */}
            {/* Time Series and Block States sections have been moved into the nodes themselves */}
            {/* Data Sources section has been simplified since data now appears in nodes */}
        </div>
    );
}
