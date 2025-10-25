import { useState } from 'react';
import clsx from 'clsx';
import useExecutionStore from '../../stores/executionStore';
import useNetworkStore from '../../stores/networkStore';
import useDemoInitializer from '../../hooks/useDemoInitializer';
import useLayoutAlgorithm from '../../hooks/useLayoutAlgorithm';
import { getDemoDescriptions } from '../../utils/demoConfigs';

const demoDescriptions = getDemoDescriptions();

export default function Header() {
    const [selectedDemo, setSelectedDemo] = useState('');
    const [speed, setSpeedValue] = useState(50);

    const isRunning = useExecutionStore((state) => state.isRunning);
    const wasmReady = useExecutionStore((state) => state.wasmReady);
    const wasmStatus = useExecutionStore((state) => state.wasmStatus);
    const networkStatus = useExecutionStore((state) => state.networkStatus);
    const learningEnabled = useExecutionStore((state) => state.learningEnabled);
    const demoDescription = useExecutionStore((state) => state.demoDescription);

    const start = useExecutionStore((state) => state.start);
    const stop = useExecutionStore((state) => state.stop);
    const fullReset = useExecutionStore((state) => state.fullReset);
    const setSpeed = useExecutionStore((state) => state.setSpeed);
    const toggleLearning = useExecutionStore((state) => state.toggleLearning);
    const setCurrentDemo = useExecutionStore((state) => state.setCurrentDemo);

    const nodes = useNetworkStore((state) => state.nodes);
    const reset = useNetworkStore((state) => state.reset);

    const { initializeDemo } = useDemoInitializer();
    const { applyHierarchical } = useLayoutAlgorithm();

    const handleDemoChange = (e) => {
        const demo = e.target.value;
        setSelectedDemo(demo);
        if (demo) {
            const description = demoDescriptions[demo] || '';
            setCurrentDemo(demo, description);
        }
    };

    const handleInitialize = () => {
        if (!selectedDemo || !wasmReady) return;
        const success = initializeDemo(selectedDemo);
        if (success) {
            console.log('Demo initialized successfully');
        }
    };

    const handleStart = () => {
        if (!wasmReady || nodes.length === 0) return;
        start();
    };

    const handleStop = () => {
        stop();
    };

    const handleReset = () => {
        stop();
        fullReset();
        reset();
        setSelectedDemo('');
    };

    const handleSpeedChange = (e) => {
        const newSpeed = parseInt(e.target.value);
        setSpeedValue(newSpeed);
        setSpeed(newSpeed);
    };

    const networkHasNodes = nodes.length > 0;

    return (
        <div id="header">
            <h1>Gnomics Live Visualizer (ReactFlow)</h1>
            <div id="controls-bar">
                <div className="control-group">
                    <label>Demo:</label>
                    <select
                        id="demo-select"
                        value={selectedDemo}
                        onChange={handleDemoChange}
                        disabled={isRunning}
                    >
                        <option value="">-- Select Demo --</option>
                        <option value="sequence">Sequence Learning</option>
                        <option value="classification">Classification</option>
                        <option value="context">Context Learning</option>
                        <option value="pooling">Feature Pooling</option>
                    </select>
                </div>
                <div className="control-group">
                    <button
                        id="init-btn"
                        className="primary"
                        onClick={handleInitialize}
                        disabled={!selectedDemo || !wasmReady || isRunning}
                    >
                        Initialize Network
                    </button>
                    <button
                        id="start-btn"
                        className="primary"
                        onClick={handleStart}
                        disabled={!wasmReady || !networkHasNodes || isRunning}
                    >
                        Start
                    </button>
                    <button
                        id="stop-btn"
                        className="danger"
                        onClick={handleStop}
                        disabled={!isRunning}
                    >
                        Stop
                    </button>
                    <button
                        id="reset-btn"
                        onClick={handleReset}
                        disabled={isRunning}
                    >
                        Reset
                    </button>
                    <button
                        id="reset-layout-btn"
                        onClick={applyHierarchical}
                        disabled={!networkHasNodes || isRunning}
                    >
                        Reset Layout
                    </button>
                </div>
                <div className="control-group">
                    <label>Speed:</label>
                    <input
                        type="range"
                        id="speed-slider"
                        min="10"
                        max="1000"
                        value={speed}
                        onChange={handleSpeedChange}
                        style={{ width: '120px' }}
                    />
                    <span id="speed-display">{speed}ms</span>
                </div>
                <div className="control-group">
                    <label>
                        <input
                            type="checkbox"
                            id="learning-toggle"
                            checked={learningEnabled}
                            onChange={toggleLearning}
                        />
                        Learning
                    </label>
                </div>
            </div>
            <div id="status-bar">
                <div className="status-item">
                    <div className={clsx('status-indicator', { active: wasmReady })} id="wasm-status"></div>
                    <span id="wasm-status-text">WASM: {wasmStatus}</span>
                </div>
                <div className="status-item">
                    <div className={clsx('status-indicator', { active: networkHasNodes })} id="network-status"></div>
                    <span id="network-status-text">{networkStatus}</span>
                </div>
                <div className="status-item">
                    <span id="demo-description">{demoDescription}</span>
                </div>
            </div>
        </div>
    );
}
