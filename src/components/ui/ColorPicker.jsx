import { useState } from 'react';
import '../../styles/ui.css';

const PRESET_COLORS = [
    '#4A9EFF', // Blue
    '#FF9E4A', // Orange
    '#A64AFF', // Purple
    '#4AFFDB', // Cyan
    '#FF4A9E', // Pink
    '#FFE44A', // Yellow
    '#4AFF9E', // Green
    '#FF4A4A', // Red
    '#9E4AFF', // Violet
    '#4AFFE4', // Aqua
    '#E44AFF', // Magenta
    '#4AFFA6', // Mint
    '#888888', // Gray
    '#FFFFFF', // White
    '#000000', // Black
];

export default function ColorPicker({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [customColor, setCustomColor] = useState(value || '#888888');

    const handlePresetSelect = (color) => {
        onChange(color);
        setCustomColor(color);
    };

    const handleCustomChange = (e) => {
        const newColor = e.target.value;
        setCustomColor(newColor);
        onChange(newColor);
    };

    return (
        <div className="color-picker">
            <button
                type="button"
                className="color-picker-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span
                    className="color-preview"
                    style={{ backgroundColor: value || '#888888' }}
                ></span>
                <span className="color-label">Pick Color</span>
            </button>

            {isOpen && (
                <div className="color-picker-dropdown">
                    <div className="color-presets">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className={`color-option ${value === color ? 'selected' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => handlePresetSelect(color)}
                                title={color}
                            />
                        ))}
                    </div>
                    <div className="color-custom">
                        <label htmlFor="custom-color">Custom:</label>
                        <input
                            type="color"
                            id="custom-color"
                            value={customColor}
                            onChange={handleCustomChange}
                        />
                        <input
                            type="text"
                            value={customColor}
                            onChange={handleCustomChange}
                            placeholder="#888888"
                            maxLength={7}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
