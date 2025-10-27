/**
 * NodeTimeSeriesPlot Component
 *
 * Compact time series plot optimized for display inside ReactFlow nodes.
 * Uses SVG for better scaling and performance.
 */
import { memo } from 'react';

function NodeTimeSeriesPlot({ data = [], color = '#4a9eff', height = 80, width = 240 }) {
    if (data.length === 0) {
        return (
            <div className="node-plot-empty" style={{
                height: `${height}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                background: 'var(--bg-tertiary)',
                borderRadius: '4px',
            }}>
                No data available
            </div>
        );
    }

    // Extract values
    const values = data.map(point => typeof point === 'object' ? point.value : point);

    // Calculate dimensions
    const padding = 8;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;

    // Find min and max for scaling
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1; // Avoid division by zero

    // Create SVG path for the line
    const points = values.map((value, index) => {
        const x = padding + (index / (values.length - 1)) * plotWidth;
        const y = height - padding - ((value - min) / range) * plotHeight;
        return { x, y, value };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

    // Create fill path
    const fillPath = `${pathData} L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;

    return (
        <div className="node-plot" style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '4px',
            padding: '4px',
            pointerEvents: 'none', // Don't interfere with node dragging
        }}>
            <svg
                width={width}
                height={height}
                style={{ display: 'block' }}
            >
                {/* Grid lines */}
                <line
                    x1={padding}
                    y1={height / 2}
                    x2={width - padding}
                    y2={height / 2}
                    stroke="var(--border-primary)"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                    opacity="0.3"
                />

                {/* Fill area */}
                <path
                    d={fillPath}
                    fill={color}
                    opacity="0.15"
                />

                {/* Line path */}
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Current value indicator (last point) */}
                {points.length > 0 && (
                    <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r="3"
                        fill={color}
                        stroke="var(--bg-tertiary)"
                        strokeWidth="2"
                    />
                )}

                {/* Min/Max reference lines */}
                <line
                    x1={padding}
                    y1={padding}
                    x2={width - padding}
                    y2={padding}
                    stroke="var(--border-primary)"
                    strokeWidth="0.5"
                    opacity="0.2"
                />
                <line
                    x1={padding}
                    y1={height - padding}
                    x2={width - padding}
                    y2={height - padding}
                    stroke="var(--border-primary)"
                    strokeWidth="0.5"
                    opacity="0.2"
                />
            </svg>

            {/* Value range labels */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '2px',
                fontSize: '9px',
                color: 'var(--text-secondary)',
                opacity: 0.7,
            }}>
                <span>{min.toFixed(2)}</span>
                <span style={{ fontWeight: 500 }}>
                    {values[values.length - 1]?.toFixed(2) || '---'}
                </span>
                <span>{max.toFixed(2)}</span>
            </div>
        </div>
    );
}

export default memo(NodeTimeSeriesPlot);
