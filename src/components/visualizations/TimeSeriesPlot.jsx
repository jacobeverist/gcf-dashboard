import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TimeSeriesPlot({ data = [], title, color = '#4a9eff', yLabel = 'Value' }) {
    // Transform data for Recharts
    const chartData = data.map((point, index) => ({
        step: index,
        value: point.value,
    }));

    return (
        <div className="plot-container">
            <div className="plot-title">{title}</div>
            <ResponsiveContainer width="100%" height={150}>
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
                        domain={[0, 1]}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '4px',
                            fontSize: '11px',
                        }}
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
            </ResponsiveContainer>
        </div>
    );
}
