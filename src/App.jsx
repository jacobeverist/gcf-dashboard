import { ReactFlowProvider } from '@xyflow/react';
import Header from './components/layout/Header';
import BlockPalette from './components/layout/BlockPalette';
import NetworkPanel from './components/layout/NetworkPanel';
import DataPanel from './components/layout/DataPanel';
import useWasmNetwork from './hooks/useWasmNetwork';
import useExecutionLoop from './hooks/useExecutionLoop';
import usePaletteDragDrop from './hooks/usePaletteDragDrop';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

function AppContent() {
    // Initialize WASM network
    useWasmNetwork();

    // Run execution loop
    useExecutionLoop();

    // Drag and drop handlers
    const { onDragStart, onDrop, onDragOver } = usePaletteDragDrop();

    // Keyboard shortcuts
    useKeyboardShortcuts();

    return (
        <div id="container">
            <Header />
            <div id="main-content">
                <BlockPalette onDragStart={onDragStart} />
                <NetworkPanel onDrop={onDrop} onDragOver={onDragOver} />
                <DataPanel />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <ReactFlowProvider>
            <AppContent />
        </ReactFlowProvider>
    );
}
