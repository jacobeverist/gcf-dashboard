import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import clsx from 'clsx';
import '../../styles/nodes.css';

function BaseNode({ data, selected, type, iconShape, iconColor }) {
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
            </div>

            {/* State Preview (if available) */}
            {data.statePreview && (
                <div className="node-state-preview">
                    {data.statePreview}
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
