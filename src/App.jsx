import Header from './components/layout/Header';
import BlockPalette from './components/layout/BlockPalette';
import NetworkPanel from './components/layout/NetworkPanel';
import DataPanel from './components/layout/DataPanel';
import useWasmNetwork from './hooks/useWasmNetwork';
import useExecutionLoop from './hooks/useExecutionLoop';

export default function App() {
    // Initialize WASM network
    useWasmNetwork();

    // Run execution loop
    useExecutionLoop();

    return (
        <div id="container">
            <Header />
            <div id="main-content">
                <BlockPalette />
                <NetworkPanel />
                <DataPanel />
            </div>
        </div>
    );
}
