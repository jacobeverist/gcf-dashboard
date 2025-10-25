import { generatePlaceholder } from '../../utils/thumbnailGenerator';
import { getTemplateStats } from '../../utils/templateManager';
import '../../styles/templates.css';

export default function TemplateCard({ template, onLoad, onEdit, onDelete, onDuplicate, onExport }) {
    const stats = getTemplateStats(template);
    const thumbnail = template.thumbnail || generatePlaceholder(300, 200);

    return (
        <div className="template-card">
            <div className="template-card-thumbnail">
                <img src={thumbnail} alt={template.name} />
                {template.isBuiltin && (
                    <div className="template-card-badge">Built-in</div>
                )}
            </div>

            <div className="template-card-content">
                <div className="template-card-header">
                    <h4 className="template-card-title">{template.name}</h4>
                    {template.version && (
                        <span className="template-card-version">v{template.version}</span>
                    )}
                </div>

                <p className="template-card-description">
                    {template.description || 'No description provided'}
                </p>

                <div className="template-card-tags">
                    {template.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="template-tag">{tag}</span>
                    ))}
                    {template.tags.length > 3 && (
                        <span className="template-tag-more">+{template.tags.length - 3}</span>
                    )}
                </div>

                <div className="template-card-stats">
                    <div className="template-stat">
                        <span className="template-stat-value">{stats.totalNodes}</span>
                        <span className="template-stat-label">Blocks</span>
                    </div>
                    <div className="template-stat">
                        <span className="template-stat-value">{stats.totalEdges}</span>
                        <span className="template-stat-label">Connections</span>
                    </div>
                </div>

                <div className="template-card-meta">
                    <span className="template-meta-item">By {template.author}</span>
                    <span className="template-meta-item">{template.created}</span>
                </div>
            </div>

            <div className="template-card-actions">
                <button
                    className="btn btn-primary"
                    onClick={() => onLoad(template)}
                    title="Load this template"
                >
                    Load
                </button>

                {!template.isBuiltin && onEdit && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => onEdit(template)}
                        title="Edit template metadata"
                    >
                        Edit
                    </button>
                )}

                {onDuplicate && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => onDuplicate(template)}
                        title="Duplicate this template"
                    >
                        📋
                    </button>
                )}

                {onExport && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => onExport(template)}
                        title="Export to JSON"
                    >
                        💾
                    </button>
                )}

                {!template.isBuiltin && onDelete && (
                    <button
                        className="btn btn-danger"
                        onClick={() => onDelete(template)}
                        title="Delete this template"
                    >
                        🗑️
                    </button>
                )}
            </div>
        </div>
    );
}
