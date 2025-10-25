import { useState, useEffect } from 'react';
import '../../styles/ui.css';

export default function ParameterSlider({
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    onChangeComplete,
}) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e) => {
        const newValue = parseFloat(e.target.value);
        setLocalValue(newValue);
        onChange?.(newValue);
    };

    const handleMouseUp = () => {
        onChangeComplete?.(localValue);
    };

    const handlePresetClick = (percentage) => {
        const range = max - min;
        const newValue = min + (range * percentage);
        const rounded = Math.round(newValue / step) * step;
        setLocalValue(rounded);
        onChange?.(rounded);
        onChangeComplete?.(rounded);
    };

    const handleReset = () => {
        const defaultValue = min;
        setLocalValue(defaultValue);
        onChange?.(defaultValue);
        onChangeComplete?.(defaultValue);
    };

    const formatValue = (val) => {
        if (step < 1) {
            return val.toFixed(3);
        } else if (step === 1) {
            return Math.round(val).toString();
        } else {
            return val.toFixed(0);
        }
    };

    return (
        <div className="parameter-slider">
            <div className="parameter-slider-header">
                <span className="parameter-slider-label">{label}</span>
                <span className="parameter-slider-value">{formatValue(localValue)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={localValue}
                onChange={handleChange}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleMouseUp}
            />
            <div className="parameter-controls">
                <button
                    className="parameter-preset-btn"
                    onClick={() => handlePresetClick(0.25)}
                    title="25%"
                >
                    25%
                </button>
                <button
                    className="parameter-preset-btn"
                    onClick={() => handlePresetClick(0.5)}
                    title="50%"
                >
                    50%
                </button>
                <button
                    className="parameter-preset-btn"
                    onClick={() => handlePresetClick(0.75)}
                    title="75%"
                >
                    75%
                </button>
                <button
                    className="parameter-preset-btn"
                    onClick={() => handlePresetClick(1.0)}
                    title="100%"
                >
                    100%
                </button>
                <button
                    className="parameter-preset-btn"
                    onClick={handleReset}
                    title="Reset to minimum"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
