import { useMemo, useState } from 'react';
import useNetworkStore from '../../stores/networkStore';
import useExecutionStore from '../../stores/executionStore';
import useCustomBlockStore from '../../stores/customBlockStore';
import useDataSourceStore from '../../stores/dataSourceStore';
import ParameterSlider from '../ui/ParameterSlider';
import { updateBlockParams } from '../../utils/wasmBridge';
import { getPresetOptions, getPresetById } from '../../utils/dataSources/presets';
import '../../styles/ui.css';

export default function ParameterPanel() {
    const nodes = useNetworkStore(state => state.nodes);
    const updateNodeData = useNetworkStore(state => state.updateNodeData);
    const network = useExecutionStore(state => state.network);
    const getBlockById = useCustomBlockStore(state => state.getBlockById);

    // Data source store
    const updateSource = useDataSourceStore(state => state.updateSource);
    const getSource = useDataSourceStore(state => state.getSource);

    // Preset selection state
    const [selectedPreset, setSelectedPreset] = useState('');

    // Get selected node
    const selectedNode = useMemo(() => {
        return nodes.find(node => node.selected);
    }, [nodes]);

    // Detect if this is a data source node
    const isDataSource = useMemo(() => {
        if (!selectedNode) return false;
        const blockType = selectedNode.data.blockType;
        return blockType === 'DiscreteDataSource' || blockType === 'ScalarDataSource';
    }, [selectedNode]);

    // Get block definition with parameters
    const blockDef = useMemo(() => {
        if (!selectedNode) return null;
        return getBlockById(selectedNode.data.blockType);
    }, [selectedNode, getBlockById]);

    const handleParameterChange = (paramName, value) => {
        if (!selectedNode) return;

        // Update node data in store
        const newParams = {
            ...selectedNode.data.params,
            [paramName]: value,
        };

        updateNodeData(selectedNode.id, { params: newParams });
    };

    const handleParameterChangeComplete = (paramName, value) => {
        if (!selectedNode) return;

        if (isDataSource) {
            // Update data source parameters
            const sourceId = selectedNode.data.sourceId || selectedNode.id;
            const params = { [paramName]: value };
            updateSource(sourceId, params);
            console.log(`[Parameter Panel] Updated data source ${paramName} to ${value} for ${sourceId}`);
        } else if (network) {
            // Update WASM block parameters
            const wasmHandle = selectedNode.data.wasmHandle;
            if (wasmHandle) {
                const newParams = {
                    ...selectedNode.data.params,
                    [paramName]: value,
                };
                updateBlockParams(network, wasmHandle, newParams);
                console.log(`[Parameter Panel] Updated ${paramName} to ${value} for block ${wasmHandle}`);
            }
        }
    };

    const handlePresetSelect = (presetId) => {
        if (!selectedNode || !isDataSource) return;

        setSelectedPreset(presetId);

        // Get preset configuration
        const sourceType = selectedNode.data.sourceType;
        const preset = getPresetById(sourceType, presetId);

        if (!preset) {
            console.warn(`Preset not found: ${presetId}`);
            return;
        }

        // Apply all preset parameters
        const sourceId = selectedNode.data.sourceId || selectedNode.id;
        updateSource(sourceId, preset.params);

        // Update node data to reflect new parameters
        updateNodeData(selectedNode.id, {
            params: preset.params,
        });

        console.log(`[Parameter Panel] Applied preset "${preset.name}" to source ${sourceId}`);
    };

    if (!selectedNode) {
        return (
            <div className="parameter-panel">
                <h3>Parameters</h3>
                <div className="parameter-panel-empty">
                    Select a block to edit its parameters
                </div>
            </div>
        );
    }

    if (!blockDef || !blockDef.params) {
        return (
            <div className="parameter-panel">
                <h3>Parameters</h3>
                <div className="parameter-panel-empty">
                    No parameters available for this block
                </div>
            </div>
        );
    }

    const currentParams = selectedNode.data.params || {};

    // Get preset options if this is a data source
    const presetOptions = isDataSource
        ? getPresetOptions(selectedNode.data.sourceType)
        : [];

    return (
        <div className="parameter-panel">
            <h3>Parameters</h3>
            <div className="parameter-panel-block-info">
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {blockDef.icon}
                </div>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                    {blockDef.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedNode.data.label || selectedNode.id}
                </div>
            </div>

            {/* Preset Selector (Data Sources Only) */}
            {isDataSource && presetOptions.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                    }}>
                        📋 Preset Patterns
                    </label>
                    <select
                        value={selectedPreset}
                        onChange={(e) => handlePresetSelect(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            fontSize: '12px',
                        }}
                    >
                        <option value="">Custom (no preset)</option>
                        {presetOptions.map((option) => (
                            <option key={option.value} value={option.value} title={option.description}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {selectedPreset && (
                        <div style={{
                            marginTop: '6px',
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic',
                        }}>
                            {presetOptions.find(p => p.value === selectedPreset)?.description}
                        </div>
                    )}
                </div>
            )}

            <div className="parameter-panel-divider" style={{
                height: '1px',
                background: 'var(--border)',
                margin: '16px 0',
            }}></div>

            {Object.entries(blockDef.params).map(([paramName, paramDef]) => {
                const currentValue = currentParams[paramName] ?? paramDef.default;

                if (paramDef.type === 'number') {
                    return (
                        <ParameterSlider
                            key={paramName}
                            label={paramDef.label || paramName}
                            value={currentValue}
                            min={paramDef.min}
                            max={paramDef.max}
                            step={paramDef.step}
                            onChange={(value) => handleParameterChange(paramName, value)}
                            onChangeComplete={(value) => handleParameterChangeComplete(paramName, value)}
                        />
                    );
                } else if (paramDef.type === 'boolean') {
                    return (
                        <div key={paramName} className="parameter-checkbox" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={currentValue}
                                    onChange={(e) => {
                                        const newValue = e.target.checked;
                                        handleParameterChange(paramName, newValue);
                                        handleParameterChangeComplete(paramName, newValue);
                                    }}
                                />
                                <span>{paramDef.label || paramName}</span>
                            </label>
                        </div>
                    );
                } else if (paramDef.type === 'select' && paramDef.options) {
                    return (
                        <div key={paramName} className="parameter-select" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
                                {paramDef.label || paramName}
                            </label>
                            <select
                                value={currentValue}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    handleParameterChange(paramName, newValue);
                                    handleParameterChangeComplete(paramName, newValue);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '4px',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {paramDef.options.map(option => {
                                    // Handle both string options and {value, label} objects
                                    const optValue = typeof option === 'string' ? option : option.value;
                                    const optLabel = typeof option === 'string' ? option : option.label;
                                    return (
                                        <option key={optValue} value={optValue}>
                                            {optLabel}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}
