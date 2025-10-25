import { useState, useEffect } from 'react';
import IconPicker from '../ui/IconPicker';
import ColorPicker from '../ui/ColorPicker';
import useCustomBlockStore from '../../stores/customBlockStore';
import '../../styles/ui.css';

export default function CreateBlockModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'transformer',
        icon: '◆',
        color: '#888888',
    });

    const [errors, setErrors] = useState({});
    const addCustomBlock = useCustomBlockStore(state => state.addCustomBlock);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                type: 'transformer',
                icon: '◆',
                color: '#888888',
            });
            setErrors({});
        }
    }, [isOpen]);

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Block name is required';
        } else if (formData.name.length > 30) {
            newErrors.name = 'Block name must be 30 characters or less';
        }

        if (!formData.icon) {
            newErrors.icon = 'Please select an icon';
        }

        if (!formData.color || !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
            newErrors.color = 'Please select a valid color';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        // Create default parameters based on block type
        const defaultParams = getDefaultParamsForType(formData.type);

        // Add custom block to store
        addCustomBlock({
            ...formData,
            params: defaultParams,
        });

        onClose();
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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Custom Block</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Live Preview */}
                    <div className="block-preview">
                        <div
                            className="block-preview-node"
                            style={{
                                borderColor: formData.color,
                                color: formData.color,
                            }}
                        >
                            <div className="block-preview-icon">{formData.icon}</div>
                            <div className="block-preview-label">
                                {formData.name || 'Custom Block'}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Block Name */}
                        <div className="form-group">
                            <label htmlFor="block-name">Block Name *</label>
                            <input
                                type="text"
                                id="block-name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="e.g., Feature Extractor"
                                className={errors.name ? 'error' : ''}
                                autoFocus
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                            <span className="help-text">Give your block a descriptive name</span>
                        </div>

                        {/* Block Type */}
                        <div className="form-group">
                            <label htmlFor="block-type">Block Type *</label>
                            <select
                                id="block-type"
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                            >
                                <option value="transformer">Transformer</option>
                                <option value="learner">Learner</option>
                                <option value="temporal">Temporal</option>
                            </select>
                            <span className="help-text">
                                {getTypeDescription(formData.type)}
                            </span>
                        </div>

                        {/* Icon Selection */}
                        <div className="form-group">
                            <label>Icon *</label>
                            <IconPicker
                                value={formData.icon}
                                onChange={(icon) => handleChange('icon', icon)}
                            />
                            {errors.icon && <span className="error-message">{errors.icon}</span>}
                        </div>

                        {/* Color Selection */}
                        <div className="form-group">
                            <label>Color *</label>
                            <ColorPicker
                                value={formData.color}
                                onChange={(color) => handleChange('color', color)}
                            />
                            {errors.color && <span className="error-message">{errors.color}</span>}
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Create Block
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper functions
function getTypeDescription(type) {
    const descriptions = {
        transformer: 'Transforms input data (stateless operations)',
        learner: 'Learns patterns from data (stateful with memory)',
        temporal: 'Processes sequential/time-series data',
    };
    return descriptions[type] || '';
}

function getDefaultParamsForType(type) {
    const defaults = {
        transformer: {
            size: {
                type: 'number',
                min: 16,
                max: 1024,
                step: 16,
                default: 128,
                label: 'Size',
            },
            threshold: {
                type: 'number',
                min: 0,
                max: 1,
                step: 0.01,
                default: 0.5,
                label: 'Threshold',
            },
        },
        learner: {
            capacity: {
                type: 'number',
                min: 64,
                max: 2048,
                step: 64,
                default: 256,
                label: 'Capacity',
            },
            learningRate: {
                type: 'number',
                min: 0,
                max: 1,
                step: 0.001,
                default: 0.01,
                label: 'Learning Rate',
            },
        },
        temporal: {
            historySize: {
                type: 'number',
                min: 10,
                max: 1000,
                step: 10,
                default: 100,
                label: 'History Size',
            },
            decayRate: {
                type: 'number',
                min: 0,
                max: 1,
                step: 0.01,
                default: 0.95,
                label: 'Decay Rate',
            },
        },
    };

    return defaults[type] || {};
}
