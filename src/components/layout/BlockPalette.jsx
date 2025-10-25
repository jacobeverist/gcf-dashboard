import '../../styles/palette.css';

export default function BlockPalette() {
    return (
        <div className="sidebar left" id="block-palette">
            <h3>Block Palette</h3>

            <div className="palette-category">
                <div className="palette-category-header">Transformers</div>
                <div className="palette-item" data-block-type="ScalarTransformer" draggable="true">
                    <div className="palette-icon triangle" style={{ borderBottomColor: 'var(--block-scalar)' }}></div>
                    <div className="palette-label">Scalar</div>
                </div>
                <div className="palette-item" data-block-type="DiscreteTransformer" draggable="true">
                    <div className="palette-icon triangle" style={{ borderBottomColor: 'var(--block-discrete)' }}></div>
                    <div className="palette-label">Discrete</div>
                </div>
                <div className="palette-item" data-block-type="PersistenceTransformer" draggable="true">
                    <div className="palette-icon triangle" style={{ borderBottomColor: 'var(--block-persistence)' }}></div>
                    <div className="palette-label">Persistence</div>
                </div>
            </div>

            <div className="palette-category">
                <div className="palette-category-header">Learning</div>
                <div className="palette-item" data-block-type="PatternPooler" draggable="true">
                    <div className="palette-icon horizontal-rect" style={{ background: 'var(--block-pooler)' }}></div>
                    <div className="palette-label">Pooler</div>
                </div>
                <div className="palette-item" data-block-type="PatternClassifier" draggable="true">
                    <div className="palette-icon horizontal-rect" style={{ background: 'var(--block-classifier)' }}></div>
                    <div className="palette-label">Classifier</div>
                </div>
            </div>

            <div className="palette-category">
                <div className="palette-category-header">Temporal</div>
                <div className="palette-item" data-block-type="SequenceLearner" draggable="true">
                    <div className="palette-icon square" style={{ background: 'var(--block-sequence)' }}></div>
                    <div className="palette-label">Sequence</div>
                </div>
                <div className="palette-item" data-block-type="ContextLearner" draggable="true">
                    <div className="palette-icon square" style={{ background: 'var(--block-context)' }}></div>
                    <div className="palette-label">Context</div>
                </div>
            </div>
        </div>
    );
}
