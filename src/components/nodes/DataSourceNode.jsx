/**
 * DataSourceNode Component
 *
 * Visual representation of data source blocks on the canvas.
 * Data sources generate input data and have no input handle (output only).
 */
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import clsx from 'clsx';
import '../../styles/nodes.css';

function DataSourceNode({ data, selected, type, iconShape, iconColor }) {
    // Get source type label
    const sourceTypeLabel = data.sourceType === 'discrete' ? 'Discrete' : 'Scalar';

    // Format current value for display
    const formatValue = () => {
        if (data.currentValue === null || data.currentValue === undefined) {
            return '---';
        }
        if (data.sourceType === 'scalar') {
            return typeof data.currentValue === 'number'
                ? data.currentValue.toFixed(2)
                : data.currentValue;
        }
        return data.currentValue.toString();
    };

    return (
        <div className={clsx('custom-node', 'data-source', type, { selected })}>
            {/* No input handle for data sources */}

            {/* Node Header */}
            <div className="node-header">
                <div className={clsx('node-icon', iconShape)} style={getIconStyle(iconShape, iconColor)}></div>
                <div className="node-content">
                    <div className="node-name">{data.label || 'Data Source'}</div>
                    <div className="node-id">{data.id || 'N/A'}</div>
                </div>
            </div>

            {/* Data Source Info */}
            <div className="node-data-source-info">
                <div className="data-source-type">{sourceTypeLabel}</div>
                {data.pattern && (
                    <div className="data-source-pattern">{data.pattern}</div>
                )}
            </div>

            {/* Current Value Display */}
            <div className="node-current-value">
                <div className="value-label">Current:</div>
                <div className="value-display">{formatValue()}</div>
            </div>

            {/* Ports Info - Output only */}
            <div className="node-ports">
                <div className="port-group">
                    <div className="port-label">Out</div>
                    <div className={clsx('port-indicator', { active: data.hasOutput })}></div>
                </div>
                <div className="port-group">
                    <div className="port-label">Enabled</div>
                    <div className={clsx('port-indicator', { active: data.enabled })}></div>
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="output"
                style={{ background: iconColor }}
            />
        </div>
    );
}

function getIconStyle(shape, color) {
    if (shape === 'triangle') {
        return { borderBottomColor: color };
    }
    return { background: color };
}

export default memo(DataSourceNode);

export function DiscreteDataSourceNode(props) {
    return (
        <DataSourceNode
            {...props}
            type="data-source-discrete"
            iconShape="circle"
            iconColor="var(--block-data-discrete)"
        />
    );
}

export function ScalarDataSourceNode(props) {
    return (
        <DataSourceNode
            {...props}
            type="data-source-scalar"
            iconShape="circle"
            iconColor="var(--block-data-scalar)"
        />
    );
}
