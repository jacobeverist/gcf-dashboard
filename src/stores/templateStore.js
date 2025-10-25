import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Built-in network templates
 * These are the demo networks converted to templates
 */
const BUILTIN_TEMPLATES = [
    {
        id: 'template_sequence_learning',
        name: 'Sequence Learning',
        description: 'Basic sequence learning network with LSTM-style memory',
        tags: ['learning', 'sequence', 'beginner'],
        category: 'Learning',
        isBuiltin: true,
        author: 'System',
        created: '2025-01-01',
        version: '1.0',
        thumbnail: null, // Will be generated on first use
        network: {
            nodes: [],
            edges: [],
        },
        // Reference to demo config for initialization
        demoRef: 'sequence',
    },
    {
        id: 'template_classification',
        name: 'Classification Network',
        description: 'Pattern classification with feature extraction',
        tags: ['classification', 'learning', 'intermediate'],
        category: 'Learning',
        isBuiltin: true,
        author: 'System',
        created: '2025-01-01',
        version: '1.0',
        thumbnail: null,
        network: {
            nodes: [],
            edges: [],
        },
        demoRef: 'classification',
    },
    {
        id: 'template_context_learning',
        name: 'Context Learning',
        description: 'Context-aware learning with temporal dependencies',
        tags: ['context', 'temporal', 'advanced'],
        category: 'Learning',
        isBuiltin: true,
        author: 'System',
        created: '2025-01-01',
        version: '1.0',
        thumbnail: null,
        network: {
            nodes: [],
            edges: [],
        },
        demoRef: 'context',
    },
    {
        id: 'template_feature_pooling',
        name: 'Feature Pooling',
        description: 'Feature extraction and pooling pipeline',
        tags: ['pooling', 'features', 'beginner'],
        category: 'Feature Extraction',
        isBuiltin: true,
        author: 'System',
        created: '2025-01-01',
        version: '1.0',
        thumbnail: null,
        network: {
            nodes: [],
            edges: [],
        },
        demoRef: 'pooling',
    },
];

const useTemplateStore = create(
    persist(
        (set, get) => ({
            // State
            userTemplates: [],

            // Get all templates (built-in + user)
            getAllTemplates: () => {
                return [...BUILTIN_TEMPLATES, ...get().userTemplates];
            },

            // Get template by ID
            getTemplateById: (id) => {
                return get().getAllTemplates().find(t => t.id === id);
            },

            // Get templates by category
            getTemplatesByCategory: () => {
                const allTemplates = get().getAllTemplates();
                const categories = {};

                allTemplates.forEach(template => {
                    const category = template.category || 'Other';
                    if (!categories[category]) {
                        categories[category] = [];
                    }
                    categories[category].push(template);
                });

                return categories;
            },

            // Get templates by tags
            getTemplatesByTags: (tags) => {
                if (!tags || tags.length === 0) {
                    return get().getAllTemplates();
                }

                return get().getAllTemplates().filter(template => {
                    return tags.some(tag =>
                        template.tags.some(t =>
                            t.toLowerCase().includes(tag.toLowerCase())
                        )
                    );
                });
            },

            // Search templates
            searchTemplates: (query) => {
                if (!query || query.trim() === '') {
                    return get().getAllTemplates();
                }

                const lowerQuery = query.toLowerCase();
                return get().getAllTemplates().filter(template => {
                    return (
                        template.name.toLowerCase().includes(lowerQuery) ||
                        template.description.toLowerCase().includes(lowerQuery) ||
                        template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
                    );
                });
            },

            // Get all unique tags
            getAllTags: () => {
                const allTemplates = get().getAllTemplates();
                const tagsSet = new Set();

                allTemplates.forEach(template => {
                    template.tags.forEach(tag => tagsSet.add(tag));
                });

                return Array.from(tagsSet).sort();
            },

            // Save current network as template
            saveAsTemplate: (templateData) => {
                const template = {
                    id: `template_${Date.now()}`,
                    name: templateData.name || 'Untitled Template',
                    description: templateData.description || '',
                    tags: templateData.tags || [],
                    category: templateData.category || 'Custom',
                    isBuiltin: false,
                    author: templateData.author || 'User',
                    created: new Date().toISOString().split('T')[0],
                    version: '1.0',
                    thumbnail: templateData.thumbnail || null,
                    network: templateData.network,
                };

                set({
                    userTemplates: [...get().userTemplates, template],
                });

                console.log('[Template Store] Saved template:', template.name);
                return template;
            },

            // Update template
            updateTemplate: (id, updates) => {
                set({
                    userTemplates: get().userTemplates.map(template =>
                        template.id === id
                            ? { ...template, ...updates, version: incrementVersion(template.version) }
                            : template
                    ),
                });
                console.log('[Template Store] Updated template:', id);
            },

            // Delete template (user templates only)
            deleteTemplate: (id) => {
                const template = get().getTemplateById(id);
                if (template && !template.isBuiltin) {
                    set({
                        userTemplates: get().userTemplates.filter(t => t.id !== id),
                    });
                    console.log('[Template Store] Deleted template:', id);
                    return true;
                }
                return false;
            },

            // Duplicate template
            duplicateTemplate: (id) => {
                const template = get().getTemplateById(id);
                if (!template) return null;

                const duplicate = {
                    ...template,
                    id: `template_${Date.now()}`,
                    name: `${template.name} (Copy)`,
                    isBuiltin: false,
                    author: 'User',
                    created: new Date().toISOString().split('T')[0],
                    version: '1.0',
                };

                set({
                    userTemplates: [...get().userTemplates, duplicate],
                });

                console.log('[Template Store] Duplicated template:', template.name);
                return duplicate;
            },

            // Export template to JSON
            exportTemplate: (id) => {
                const template = get().getTemplateById(id);
                if (!template) return null;

                const exportData = {
                    ...template,
                    exportedAt: new Date().toISOString(),
                };

                return exportData;
            },

            // Import template from JSON
            importTemplate: (templateData) => {
                try {
                    const template = {
                        ...templateData,
                        id: `template_${Date.now()}`,
                        isBuiltin: false,
                        imported: true,
                    };

                    set({
                        userTemplates: [...get().userTemplates, template],
                    });

                    console.log('[Template Store] Imported template:', template.name);
                    return template;
                } catch (error) {
                    console.error('[Template Store] Failed to import template:', error);
                    return null;
                }
            },

            // Clear all user templates
            clearUserTemplates: () => {
                set({ userTemplates: [] });
            },
        }),
        {
            name: 'network-templates-storage',
            partialize: (state) => ({ userTemplates: state.userTemplates }),
        }
    )
);

// Helper function to increment version number
function incrementVersion(version) {
    const parts = version.split('.');
    const minor = parseInt(parts[1] || '0') + 1;
    return `${parts[0]}.${minor}`;
}

export default useTemplateStore;
export { BUILTIN_TEMPLATES };
