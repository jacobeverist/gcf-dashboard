import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import clsx from 'clsx';
import NodeTimeSeriesPlot from '../visualizations/NodeTimeSeriesPlot';
import NodeBitfieldPreview from '../visualizations/NodeBitfieldPreview';
import '../../styles/nodes.css';

function BaseNode({ data, selected, type, iconShape, iconColor }) {
    const [plotVisible, setPlotVisible] = useState(data.plotVisible ?? true);
    const [bitfieldVisible, setBitfieldVisible] = useState(data.bitfieldVisible ?? true);

    // Check if we have plot data or bitfield data
    const hasPlotData = data.plotData && data.plotData.length > 0;
    const hasBitfield = data.bitfield && data.bitfield.length > 0;

    return (
        <div className={clsx('custom-node', type, { selected })}>
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                id="input"
                style={{ background: iconColor }}
            />

            {/* Node Header */}
            <div className="node-header">
                <div className={clsx('node-icon', iconShape)} style={getIconStyle(iconShape, iconColor)}></div>
                <div className="node-content">
                    <div className="node-name">{data.label || type}</div>
                    <div className="node-id">{data.id || 'N/A'}</div>
                </div>
                {/* Toggle buttons for plots/bitfield */}
                {(hasPlotData || hasBitfield) && (
                    <div className="node-toggle-buttons" style={{ pointerEvents: 'auto' }}>
                        {hasPlotData && (
                            <button
                                className="node-toggle-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPlotVisible(!plotVisible);
                                }}
                                title={plotVisible ? 'Hide plot' : 'Show plot'}
                            >
                                📊
                            </button>
                        )}
                        {hasBitfield && (
                            <button
                                className="node-toggle-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setBitfieldVisible(!bitfieldVisible);
                                }}
                                title={bitfieldVisible ? 'Hide state' : 'Show state'}
                            >
                                🔢
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* State Preview (if available) */}
            {data.statePreview && (
                <div className="node-state-preview">
                    {data.statePreview}
                </div>
            )}

            {/* Embedded Time Series Plot */}
            {hasPlotData && plotVisible && (
                <div className="node-plot-section">
                    <NodeTimeSeriesPlot
                        data={data.plotData}
                        color={iconColor}
                        height={80}
                        width={240}
                    />
                </div>
            )}

            {/* Embedded Bitfield Preview */}
            {hasBitfield && bitfieldVisible && (
                <div className="node-bitfield-section">
                    <NodeBitfieldPreview
                        bitfield={data.bitfield}
                        maxBits={1024}
                    />
                </div>
            )}

            {/* Ports Info */}
            <div className="node-ports">
                <div className="port-group">
                    <div className="port-label">In</div>
                    <div className={clsx('port-indicator', { active: data.hasInput })}></div>
                </div>
                <div className="port-group">
                    <div className="port-label">Out</div>
                    <div className={clsx('port-indicator', { active: data.hasOutput })}></div>
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="output"
                style={{ background: iconColor }}
            />

            {/* Context Handle (if applicable) */}
            {data.hasContext && (
                <Handle
                    type="target"
                    position={Position.Left}
                    id="context"
                    style={{ background: 'var(--accent-orange)' }}
                />
            )}
        </div>
    );
}

function getIconStyle(shape, color) {
    if (shape === 'triangle') {
        return { borderBottomColor: color };
    }
    return { background: color };
}

export default memo(BaseNode);
