import useExecutionStore from '../../stores/executionStore';
import useNetworkStore from '../../stores/networkStore';
import useVisualizationStore from '../../stores/visualizationStore';
import TimeSeriesPlot from '../visualizations/TimeSeriesPlot';
import BitfieldGrid from '../visualizations/BitfieldGrid';

export default function DataPanel() {
    const executionStep = useExecutionStore((state) => state.executionStep);
    const nodes = useNetworkStore((state) => state.nodes);
    const timeSeriesData = useVisualizationStore((state) => state.timeSeriesData);
    const bitfieldData = useVisualizationStore((state) => state.bitfieldData);

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
            </div>

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
                        nodes.map((node) => {
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
