import { useState, useMemo } from 'react';
import useTemplateStore from '../../stores/templateStore';
import useNetworkStore from '../../stores/networkStore';
import useExecutionStore from '../../stores/executionStore';
import TemplateCard from '../ui/TemplateCard';
import TemplateMetadataEditor from './TemplateMetadataEditor';
import { loadTemplateIntoNetwork, downloadTemplateAsJSON, captureNetworkState } from '../../utils/templateManager';
import { generateThumbnailFromState } from '../../utils/thumbnailGenerator';
import * as wasmBridge from '../../utils/wasmBridge';
import '../../styles/templates.css';

export default function TemplateGallery({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTags, setSelectedTags] = useState([]);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    // Template store
    const {
        getAllTemplates,
        getTemplatesByCategory,
        getAllTags,
        searchTemplates,
        deleteTemplate,
        duplicateTemplate,
        exportTemplate,
        saveAsTemplate,
    } = useTemplateStore();

    // Network store
    const nodes = useNetworkStore(state => state.nodes);
    const edges = useNetworkStore(state => state.edges);
    const networkStore = useNetworkStore();

    // Execution store
    const executionStore = useExecutionStore();

    // Get categories and tags
    const categories = useMemo(() => {
        const cats = getTemplatesByCategory();
        return ['All', ...Object.keys(cats)];
    }, [getTemplatesByCategory]);

    const availableTags = useMemo(() => getAllTags(), [getAllTags]);

    // Filter templates
    const filteredTemplates = useMemo(() => {
        let templates = searchQuery
            ? searchTemplates(searchQuery)
            : getAllTemplates();

        // Filter by category
        if (selectedCategory !== 'All') {
            templates = templates.filter(t => t.category === selectedCategory);
        }

        // Filter by tags
        if (selectedTags.length > 0) {
            templates = templates.filter(t =>
                selectedTags.some(tag => t.tags.includes(tag))
            );
        }

        return templates;
    }, [searchQuery, selectedCategory, selectedTags, searchTemplates, getAllTemplates]);

    const handleLoadTemplate = async (template) => {
        const success = await loadTemplateIntoNetwork(
            template,
            networkStore,
            executionStore,
            wasmBridge
        );

        if (success) {
            console.log(`Loaded template: ${template.name}`);
            onClose();
        } else {
            console.error('Failed to load template');
            // TODO: Show error toast
        }
    };

    const handleDeleteTemplate = (template) => {
        if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
            deleteTemplate(template.id);
        }
    };

    const handleDuplicateTemplate = (template) => {
        const duplicate = duplicateTemplate(template.id);
        if (duplicate) {
            console.log(`Duplicated template: ${duplicate.name}`);
        }
    };

    const handleExportTemplate = (template) => {
        const exportData = exportTemplate(template.id);
        if (exportData) {
            downloadTemplateAsJSON(exportData);
        }
    };

    const handleSaveCurrentNetwork = (metadata) => {
        const networkState = captureNetworkState(nodes, edges);
        const thumbnail = generateThumbnailFromState(nodes, edges);

        const template = saveAsTemplate({
            ...metadata,
            network: networkState,
            thumbnail,
        });

        console.log(`Saved template: ${template.name}`);
        setShowSaveDialog(false);
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Template Gallery</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Toolbar */}
                    <div className="template-gallery-toolbar">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowSaveDialog(true)}
                        >
                            💾 Save Current Network
                        </button>

                        <div className="template-search">
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="template-search-input"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="template-gallery-filters">
                        {/* Category Filter */}
                        <div className="filter-group">
                            <label>Category:</label>
                            <div className="filter-buttons">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tag Filter */}
                        <div className="filter-group">
                            <label>Tags:</label>
                            <div className="filter-buttons">
                                {availableTags.map(tag => (
                                    <button
                                        key={tag}
                                        className={`filter-btn tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Template Grid */}
                    <div className="template-gallery-grid">
                        {filteredTemplates.length === 0 ? (
                            <div className="template-gallery-empty">
                                <p>No templates found</p>
                                <p className="text-secondary">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            filteredTemplates.map(template => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onLoad={handleLoadTemplate}
                                    onEdit={template.isBuiltin ? null : setEditingTemplate}
                                    onDelete={handleDeleteTemplate}
                                    onDuplicate={handleDuplicateTemplate}
                                    onExport={handleExportTemplate}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Save Dialog */}
                {showSaveDialog && (
                    <TemplateMetadataEditor
                        isOpen={showSaveDialog}
                        onClose={() => setShowSaveDialog(false)}
                        onSave={handleSaveCurrentNetwork}
                        template={null}
                    />
                )}

                {/* Edit Dialog */}
                {editingTemplate && (
                    <TemplateMetadataEditor
                        isOpen={true}
                        onClose={() => setEditingTemplate(null)}
                        onSave={(metadata) => {
                            useTemplateStore.getState().updateTemplate(editingTemplate.id, metadata);
                            setEditingTemplate(null);
                        }}
                        template={editingTemplate}
                    />
                )}
            </div>
        </div>
    );
}
