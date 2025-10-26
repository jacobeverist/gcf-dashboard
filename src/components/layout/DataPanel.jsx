import useExecutionStore from '../../stores/executionStore';
import useNetworkStore from '../../stores/networkStore';
import useVisualizationStore from '../../stores/visualizationStore';
import useDataSourceStore from '../../stores/dataSourceStore';
import TimeSeriesPlot from '../visualizations/TimeSeriesPlot';
import BitfieldGrid from '../visualizations/BitfieldGrid';
import DataSourceMiniPlot from '../visualizations/DataSourceMiniPlot';

export default function DataPanel() {
    const executionStep = useExecutionStore((state) => state.executionStep);
    const nodes = useNetworkStore((state) => state.nodes);
    const timeSeriesData = useVisualizationStore((state) => state.timeSeriesData);
    const bitfieldData = useVisualizationStore((state) => state.bitfieldData);
    const sources = useDataSourceStore((state) => state.sources);
    const getSourceValue = useDataSourceStore((state) => state.getSourceValue);
    const getSourceHistory = useDataSourceStore((state) => state.getSourceHistory);
    const getSourceInfo = useDataSourceStore((state) => state.getSourceInfo);

    // Get data source nodes
    const dataSourceNodes = nodes.filter(node =>
        node.data.blockType === 'DiscreteDataSource' ||
        node.data.blockType === 'ScalarDataSource'
    );

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
            </div>

            {dataSourceNodes.length > 0 && (
                <div id="data-sources-section">
                    <h3>Data Sources</h3>
                    <div id="data-sources-container" style={{ padding: '20px' }}>
                        {dataSourceNodes.map((node) => {
                            const sourceId = node.data.sourceId || node.id;
                            const source = sources[sourceId];
                            if (!source) return null;

                            const sourceInfo = getSourceInfo(sourceId);
                            const currentValue = getSourceValue(sourceId);
                            const history = getSourceHistory(sourceId, 50); // Last 50 values
                            const isScalar = node.data.sourceType === 'scalar';

                            return (
                                <div
                                    key={node.id}
                                    className="data-source-display"
                                    style={{
                                        marginBottom: '16px',
                                        padding: '12px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${isScalar ? 'var(--block-data-scalar)' : 'var(--block-data-discrete)'}`,
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                    }}>
                                        <div style={{ fontWeight: 500, fontSize: '13px' }}>
                                            {node.data.label}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            padding: '2px 8px',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: '4px',
                                            color: 'var(--text-secondary)',
                                        }}>
                                            {isScalar ? 'SCALAR' : 'DISCRETE'}
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                    }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            Pattern: {node.data.params?.pattern || 'N/A'}
                                        </span>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            fontFamily: 'monospace',
                                            color: isScalar ? 'var(--accent-green)' : 'var(--accent-blue)',
                                        }}>
                                            {currentValue !== null && currentValue !== undefined
                                                ? (isScalar ? currentValue.toFixed(2) : Math.floor(currentValue))
                                                : '---'}
                                        </span>
                                    </div>

                                    {isScalar && history.length > 0 && (
                                        <DataSourceMiniPlot
                                            data={history}
                                            color={isScalar ? '#FFB366' : '#FF80AB'}
                                        />
                                    )}

                                    {!isScalar && (
                                        <div style={{
                                            fontSize: '10px',
                                            color: 'var(--text-secondary)',
                                            marginTop: '4px',
                                        }}>
                                            Categories: {node.data.params?.numCategories || 'N/A'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div id="plots-section">
                <h3>Time Series</h3>
                <div id="plots-container" style={{ padding: '20px' }}>
                    {nodes.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            Initialize a demo to see plots
                        </p>
                    ) : (
                        nodes.map((node) => {
                            const data = timeSeriesData[node.id];
                            if (!data || data.data.length === 0) return null;

                            return (
                                <TimeSeriesPlot
                                    key={node.id}
                                    data={data.data}
                                    title={`${node.data.label} Output`}
                                    color="var(--accent-blue)"
                                />
                            );
                        })
                    )}
                </div>
            </div>

            <div id="bitfield-section">
                <h3>Block States</h3>
                <div id="bitfield-container" style={{ padding: '20px' }}>
                    {nodes.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            Initialize a demo to see block states
                        </p>
                    ) : (
                        nodes
                            .filter(node => {
                                // Only show bitfield for WASM blocks (nodes with wasmHandle)
                                return node.data.wasmHandle !== undefined;
                            })
                            .map((node) => {
                                const bitfield = bitfieldData[node.id];
                                if (!bitfield) return null;

                                return (
                                    <BitfieldGrid
                                        key={node.id}
                                        bitfield={bitfield}
                                        blockId={node.id}
                                        blockLabel={node.data.label}
                                    />
                                );
                            })
                    )}
                </div>
            </div>
        </div>
    );
}
