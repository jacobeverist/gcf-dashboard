import '../../styles/bitfield.css';

export default function BitfieldGrid({ bitfield = [], blockId, blockLabel }) {
    // Convert to array if Uint8Array
    const bits = Array.isArray(bitfield) ? bitfield : Array.from(bitfield);

    // Calculate grid dimensions (try to make it roughly square)
    const totalBits = bits.length;
    const cols = Math.ceil(Math.sqrt(totalBits));
    const rows = Math.ceil(totalBits / cols);

    return (
        <div className="bitfield-block">
            <div className="bitfield-header">
                <span className="bitfield-label">{blockLabel || blockId}</span>
                <span className="bitfield-size">{totalBits} bits</span>
            </div>
            <div className="bitfield-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {bits.map((bit, index) => (
                    <div
                        key={index}
                        className={`bitfield-cell ${bit ? 'active' : 'inactive'}`}
                        title={`Bit ${index}: ${bit}`}
                    />
                ))}
            </div>
        </div>
    );
}
