import { useState } from 'react';
import useCustomBlockStore from '../../stores/customBlockStore';
import CreateBlockModal from '../modals/CreateBlockModal';
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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const getBlocksByCategory = useCustomBlockStore(state => state.getBlocksByCategory);
    const blocksByCategory = getBlocksByCategory();

    return (
        <div className="sidebar left" id="block-palette">
            <div className="palette-header">
                <h3>Block Palette</h3>
                <button
                    className="palette-add-btn"
                    onClick={() => setIsCreateModalOpen(true)}
                    title="Create custom block"
                >
                    +
                </button>
            </div>

            {/* Render categories dynamically */}
            {Object.entries(blocksByCategory).map(([category, blocks]) => (
                <div key={category} className="palette-category">
                    <div className="palette-category-header">{category}</div>
                    {blocks.map((block) => (
                        <PaletteItem
                            key={block.id}
                            blockType={block.id}
                            icon={
                                block.isBuiltin ? (
                                    // Built-in blocks use original styled icons
                                    getBuiltinIcon(block.id)
                                ) : (
                                    // Custom blocks use emoji/text icons
                                    <div
                                        className="palette-icon-custom"
                                        style={{ color: block.color }}
                                    >
                                        {block.icon}
                                    </div>
                                )
                            }
                            label={block.name}
                            onDragStart={onDragStart}
                        />
                    ))}
                </div>
            ))}

            {/* Create Block Modal */}
            <CreateBlockModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}

// Helper function to render built-in icons with original styling
function getBuiltinIcon(blockId) {
    const iconMap = {
        // Data Sources
        DiscreteDataSource: <div className="palette-icon circle" style={{ background: 'var(--block-data-discrete)' }}></div>,
        ScalarDataSource: <div className="palette-icon circle" style={{ background: 'var(--block-data-scalar)' }}></div>,
        // Transformers
        ScalarTransformer: <div className="palette-icon triangle" style={{ borderBottomColor: 'var(--block-scalar)' }}></div>,
        DiscreteTransformer: <div className="palette-icon triangle" style={{ borderBottomColor: 'var(--block-discrete)' }}></div>,
        PersistenceTransformer: <div className="palette-icon triangle" style={{ borderBottomColor: 'var(--block-persistence)' }}></div>,
        // Learning
        PatternPooler: <div className="palette-icon horizontal-rect" style={{ background: 'var(--block-pooler)' }}></div>,
        PatternClassifier: <div className="palette-icon horizontal-rect" style={{ background: 'var(--block-classifier)' }}></div>,
        // Temporal
        SequenceLearner: <div className="palette-icon square" style={{ background: 'var(--block-sequence)' }}></div>,
        ContextLearner: <div className="palette-icon square" style={{ background: 'var(--block-context)' }}></div>,
    };
    return iconMap[blockId] || <div className="palette-icon-custom">{blockId[0]}</div>;
}
