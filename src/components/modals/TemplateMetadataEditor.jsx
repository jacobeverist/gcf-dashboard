import { useState, useEffect } from 'react';
import '../../styles/ui.css';

const PRESET_CATEGORIES = [
    'Learning',
    'Feature Extraction',
    'Classification',
    'Temporal',
    'Transformation',
    'Custom',
];

export default function TemplateMetadataEditor({ isOpen, onClose, onSave, template }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        tags: [],
        category: 'Custom',
        author: 'User',
    });

    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState({});

    // Initialize form with template data if editing
    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name || '',
                description: template.description || '',
                tags: template.tags || [],
                category: template.category || 'Custom',
                author: template.author || 'User',
            });
        } else {
            setFormData({
                name: '',
                description: '',
                tags: [],
                category: 'Custom',
                author: 'User',
            });
        }
        setErrors({});
    }, [template, isOpen]);

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Template name is required';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Template name must be 50 characters or less';
        }

        if (formData.description.length > 200) {
            newErrors.description = 'Description must be 200 characters or less';
        }

        if (formData.tags.length === 0) {
            newErrors.tags = 'At least one tag is recommended';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        onSave(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    const handleAddTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            handleChange('tags', [...formData.tags, tag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
    };

    const handleTagInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{template ? 'Edit Template' : 'Save as Template'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        {/* Template Name */}
                        <div className="form-group">
                            <label htmlFor="template-name">Name *</label>
                            <input
                                type="text"
                                id="template-name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="e.g., Advanced Feature Extraction"
                                className={errors.name ? 'error' : ''}
                                autoFocus
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label htmlFor="template-description">Description</label>
                            <textarea
                                id="template-description"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Describe what this template does..."
                                rows={3}
                                className={errors.description ? 'error' : ''}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                }}
                            />
                            {errors.description && <span className="error-message">{errors.description}</span>}
                            <span className="help-text">
                                {formData.description.length}/200 characters
                            </span>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label htmlFor="template-category">Category</label>
                            <select
                                id="template-category"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                            >
                                {PRESET_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="form-group">
                            <label htmlFor="template-tags">Tags</label>
                            <div className="tag-input-group">
                                <input
                                    type="text"
                                    id="template-tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={handleTagInputKeyPress}
                                    placeholder="Type a tag and press Enter"
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleAddTag}
                                    disabled={!tagInput.trim()}
                                >
                                    Add
                                </button>
                            </div>
                            {errors.tags && <span className="error-message">{errors.tags}</span>}

                            {formData.tags.length > 0 && (
                                <div className="tag-list" style={{ marginTop: '12px' }}>
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="template-tag editable">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="tag-remove"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <span className="help-text">
                                Add tags to make your template easier to find
                            </span>
                        </div>

                        {/* Author */}
                        <div className="form-group">
                            <label htmlFor="template-author">Author</label>
                            <input
                                type="text"
                                id="template-author"
                                value={formData.author}
                                onChange={(e) => handleChange('author', e.target.value)}
                                placeholder="Your name"
                            />
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        {template ? 'Update' : 'Save Template'}
                    </button>
                </div>
            </div>
        </div>
    );
}
