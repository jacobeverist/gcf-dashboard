import '../../styles/palette.css';

const PaletteItem = ({ blockType, icon, label, onDragStart }) => {
    return (
        <div
            className="palette-item"
            draggable="true"
            onDragStart={(e) => onDragStart(e, blockType)}
        >
            {icon}
            <div className="palette-label">{label}</div>
        </div>
    );
};

export default function BlockPalette({ onDragStart }) {
    return (
        <div className="sidebar left" id="block-palette">
            <h3>Block Palette</h3>

            <div className="palette-category">
                <div className="palette-category-header">Transformers</div>
                <PaletteItem
                    blockType="ScalarTransformer"
                    icon={<div className="palette-icon triangle" style={{ borderBottomColor: 'var(--block-scalar)' }}></div>}
                    label="Scalar"
                    onDragStart={onDragStart}
                />
                <PaletteItem
                    blockType="DiscreteTransformer"
                    icon={<div className="palette-icon triangle" style={{ borderBottomColor: 'var(--block-discrete)' }}></div>}
                    label="Discrete"
                    onDragStart={onDragStart}
                />
                <PaletteItem
                    blockType="PersistenceTransformer"
                    icon={<div className="palette-icon triangle" style={{ borderBottomColor: 'var(--block-persistence)' }}></div>}
                    label="Persistence"
                    onDragStart={onDragStart}
                />
            </div>

            <div className="palette-category">
                <div className="palette-category-header">Learning</div>
                <PaletteItem
                    blockType="PatternPooler"
                    icon={<div className="palette-icon horizontal-rect" style={{ background: 'var(--block-pooler)' }}></div>}
                    label="Pooler"
                    onDragStart={onDragStart}
                />
                <PaletteItem
                    blockType="PatternClassifier"
                    icon={<div className="palette-icon horizontal-rect" style={{ background: 'var(--block-classifier)' }}></div>}
                    label="Classifier"
                    onDragStart={onDragStart}
                />
            </div>

            <div className="palette-category">
                <div className="palette-category-header">Temporal</div>
                <PaletteItem
                    blockType="SequenceLearner"
                    icon={<div className="palette-icon square" style={{ background: 'var(--block-sequence)' }}></div>}
                    label="Sequence"
                    onDragStart={onDragStart}
                />
                <PaletteItem
                    blockType="ContextLearner"
                    icon={<div className="palette-icon square" style={{ background: 'var(--block-context)' }}></div>}
                    label="Context"
                    onDragStart={onDragStart}
                />
            </div>
        </div>
    );
}
