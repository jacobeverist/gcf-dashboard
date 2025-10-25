import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

/**
 * Data Source Preview Component
 * Shows a larger preview of the data source pattern
 */
export default function DataSourcePreview({ data = [], sourceType = 'scalar', color = '#4a9eff', title = 'Preview' }) {
    if (data.length === 0) {
        return (
            <div
                style={{
                    padding: '20px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                }}
            >
                No data to preview
            </div>
        );
    }

    // Transform data for charts
    const chartData = data.map((value, index) => ({
        step: index,
        value: typeof value === 'number' ? value : 0,
    }));

    // Calculate y-axis domain
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 1;

    const isDiscrete = sourceType === 'discrete';

    return (
        <div className="data-source-preview" style={{ marginTop: '12px' }}>
            <div
                style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                }}
            >
                {title}
            </div>

            <div
                style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    border: '1px solid var(--border-primary)',
                }}
            >
                <ResponsiveContainer width="100%" height={150}>
                    {isDiscrete ? (
                        <ScatterChart margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                            <XAxis
                                dataKey="step"
                                stroke="var(--text-secondary)"
                                style={{ fontSize: 10 }}
                                domain={[0, data.length - 1]}
                            />
                            <YAxis
                                stroke="var(--text-secondary)"
                                style={{ fontSize: 10 }}
                                domain={[Math.floor(min - padding), Math.ceil(max + padding)]}
                                allowDecimals={false}
                            />
                            <Scatter
                                data={chartData}
                                fill={color}
                                shape="circle"
                            />
                        </ScatterChart>
                    ) : (
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                            <XAxis
                                dataKey="step"
                                stroke="var(--text-secondary)"
                                style={{ fontSize: 10 }}
                            />
                            <YAxis
                                stroke="var(--text-secondary)"
                                style={{ fontSize: 10 }}
                                domain={[min - padding, max + padding]}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>

                {/* Statistics */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginTop: '8px',
                        padding: '8px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                    }}
                >
                    <div>
                        <span style={{ opacity: 0.7 }}>Min: </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {min.toFixed(2)}
                        </span>
                    </div>
                    <div>
                        <span style={{ opacity: 0.7 }}>Max: </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {max.toFixed(2)}
                        </span>
                    </div>
                    <div>
                        <span style={{ opacity: 0.7 }}>Mean: </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)}
                        </span>
                    </div>
                    <div>
                        <span style={{ opacity: 0.7 }}>Points: </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {data.length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
