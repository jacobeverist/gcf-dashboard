/**
 * Mini plot component for data source history visualization
 * Renders a compact sparkline chart
 */
export default function DataSourceMiniPlot({ data = [], color = '#4a9eff' }) {
    if (data.length === 0) {
        return null;
    }

    // Calculate dimensions
    const width = 200;
    const height = 40;
    const padding = 2;

    // Find min and max for scaling
    const values = data.map(v => typeof v === 'number' ? v : 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1; // Avoid division by zero

    // Create SVG path for the line
    const points = values.map((value, index) => {
        const x = padding + (index / (values.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((value - min) / range) * (height - 2 * padding);
        return `${x},${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;

    return (
        <div
            className="data-source-mini-plot"
            style={{
                marginTop: '8px',
                background: 'var(--bg-tertiary)',
                borderRadius: '4px',
                padding: '4px',
            }}
        >
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

                {/* Line path */}
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Fill area */}
                <path
                    d={`${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
                    fill={color}
                    opacity="0.1"
                />

                {/* Current value indicator (last point) */}
                {points.length > 0 && (
                    <circle
                        cx={points[points.length - 1].split(',')[0]}
                        cy={points[points.length - 1].split(',')[1]}
                        r="2"
                        fill={color}
                        stroke="var(--bg-tertiary)"
                        strokeWidth="1"
                    />
                )}
            </svg>

            {/* Min/Max labels */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '2px',
                    fontSize: '9px',
                    color: 'var(--text-secondary)',
                    opacity: 0.7,
                }}
            >
                <span>min: {min.toFixed(2)}</span>
                <span>max: {max.toFixed(2)}</span>
            </div>
        </div>
    );
}
