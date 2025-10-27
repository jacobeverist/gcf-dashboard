/**
 * NodeBitfieldPreview Component
 *
 * Compact bitfield heatmap visualization optimized for display inside ReactFlow nodes.
 * Shows a simplified view of block internal state using a colored grid.
 */
import { memo } from 'react';

function NodeBitfieldPreview({ bitfield = [], maxBits = 1024 }) {
    if (!bitfield || bitfield.length === 0) {
        return null;
    }

    // Convert to array if Uint8Array
    const bits = Array.isArray(bitfield) ? bitfield : Array.from(bitfield);

    // Limit number of bits to display
    const displayBits = bits.slice(0, maxBits);
    const hasMore = bits.length > maxBits;

    // Calculate grid dimensions (try to make it roughly square)
    const totalBits = displayBits.length;
    // const cols = Math.min(16, Math.ceil(Math.sqrt(totalBits))); // Max 16 columns for compact display
    const cols = Math.ceil(Math.sqrt(totalBits)); // No Max columns
    const rows = Math.ceil(totalBits / cols);

    return (
        <div className="node-bitfield-preview" style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '4px',
            padding: '6px',
            pointerEvents: 'none', // Don't interfere with node dragging
        }}>
            <div style={{
                fontSize: '9px',
                color: 'var(--text-secondary)',
                marginBottom: '4px',
                fontWeight: 500,
            }}>
                Internal State {hasMore && `(showing ${maxBits} of ${bits.length})`}
            </div>

            {/* Heatmap Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: '1px',
                background: 'var(--bg-secondary)',
                padding: '2px',
                borderRadius: '3px',
            }}>
                {displayBits.map((bit, index) => (
                    <div
                        key={index}
                        className={`bitfield-cell-mini ${bit ? 'active' : 'inactive'}`}
                        style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '1px',
                            background: bit === 1
                                ? 'var(--accent-green)'
                                : 'var(--bg-quaternary)',
                            boxShadow: bit === 1
                                ? '0 0 3px rgba(74, 255, 74, 0.4)'
                                : 'none',
                            transition: 'background 0.2s ease',
                        }}
                        title={`Bit ${index}: ${bit}`}
                    />
                ))}
            </div>

            {/* Summary stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontSize: '9px',
                color: 'var(--text-secondary)',
            }}>
                <span>Active: {bits.filter(b => b === 1).length}</span>
                <span>Total: {bits.length}</span>
            </div>
        </div>
    );
}

export default memo(NodeBitfieldPreview);
