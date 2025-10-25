import { useState } from 'react';
import '../../styles/ui.css';

const AVAILABLE_ICONS = [
    '△', '▽', '◁', '▷', // Triangles
    '■', '□', '●', '○', // Basic shapes
    '◆', '◇', '▬', '▭', // Other shapes
    '★', '☆', '⬢', '⬡', // Special shapes
    '⚡', '🔥', '💧', '🌊', // Elements
    '🧠', '⚙️', '🔧', '🔨', // Tools/mechanics
    '📊', '📈', '📉', '🎯', // Charts
    '🔍', '🔬', '🧪', '⚗️', // Science
];

export default function IconPicker({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (icon) => {
        onChange(icon);
        setIsOpen(false);
    };

    return (
        <div className="icon-picker">
            <button
                type="button"
                className="icon-picker-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="icon-preview">{value || '◆'}</span>
                <span className="icon-label">Pick Icon</span>
            </button>

            {isOpen && (
                <div className="icon-picker-dropdown">
                    <div className="icon-grid">
                        {AVAILABLE_ICONS.map((icon) => (
                            <button
                                key={icon}
                                type="button"
                                className={`icon-option ${value === icon ? 'selected' : ''}`}
                                onClick={() => handleSelect(icon)}
                                title={icon}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
