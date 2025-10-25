import { BaseEdge, getSmoothStepPath } from '@xyflow/react';
import '../../styles/edges.css';

/**
 * Custom edge for data source connections
 * Features distinct cyan/orange color to differentiate from regular connections
 */
export default function DataSourceEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
    data,
}) {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Determine color based on source type
    const sourceType = data?.sourceType || 'scalar';
    const strokeColor = sourceType === 'discrete'
        ? 'var(--block-data-discrete)'  // Pink for discrete
        : 'var(--block-data-scalar)';    // Orange for scalar

    return (
        <>
            {/* Animated flow indicator */}
            {data?.animated && (
                <path
                    d={edgePath}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeOpacity="0.3"
                    className="data-source-edge-animated"
                    style={{
                        strokeDasharray: '5 5',
                        animation: 'dash 1s linear infinite',
                    }}
                />
            )}

            {/* Main edge */}
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: strokeColor,
                    strokeWidth: selected ? 3 : 2,
                }}
                className="data-source-edge"
            />
        </>
    );
}
