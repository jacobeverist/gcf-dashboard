# Gnomics Live Visualizer

A real-time interactive dashboard for visualizing and experimenting with Gnomics computational networks. Built with React, ReactFlow, and WebAssembly (WASM) for high-performance neural computation.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [WASM Integration](#wasm-integration)
- [State Management](#state-management)
- [Data Sources](#data-sources)
- [Development](#development)
- [Testing](#testing)
- [Configuration](#configuration)

---

## Overview

The Gnomics Live Visualizer is an interactive web application for building, visualizing, and running computational neural networks. It provides:

- **Visual Network Builder**: Drag-and-drop interface for creating network topologies
- **Real-time Execution**: Step-by-step execution with live state visualization
- **Data Sources**: Configurable input generators (scalar, discrete patterns)
- **Multiple Visualizations**: Time series plots, bitfield heatmaps, and network flow
- **Demo Library**: Pre-configured networks demonstrating various capabilities
- **Template System**: Save and load custom network configurations

The application bridges JavaScript/React with a high-performance Rust WebAssembly module for neural computation.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       React Application                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Header     │  │  BlockPalette │  │ ParameterPanel│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           NetworkPanel (ReactFlow Canvas)            │   │
│  │  - Nodes (Blocks)                                    │   │
│  │  - Edges (Connections)                               │   │
│  │  - Drag & Drop                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               DataPanel (Visualizations)              │   │
│  │  - Time Series Plots                                 │   │
│  │  - Bitfield Heatmaps                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
                    ┌──────────────────┐
                    │ Zustand Stores   │
                    │ - networkStore   │
                    │ - executionStore │
                    │ - dataSourceStore│
                    │ - visualStore    │
                    └──────────────────┘
                              ↕
                    ┌──────────────────┐
                    │   WASM Bridge    │
                    └──────────────────┘
                              ↕
                    ┌──────────────────┐
                    │ Rust WASM Module │
                    │   (gnomics.wasm) │
                    └──────────────────┘
```

### Data Flow

1. **User Interaction** → React Components
2. **State Updates** → Zustand Stores
3. **Network Operations** → WASM Bridge
4. **Computation** → Rust WASM Module
5. **Results** → Stores → React Components
6. **Visualization** → Recharts, ReactFlow

---

## Key Features

### 1. Visual Network Builder
- Drag-and-drop block creation from palette
- Interactive node positioning and connection
- Real-time parameter editing
- Connection validation (input/context/output ports)

### 2. WASM Block Types
- **ScalarTransformer**: Converts continuous values to sparse distributed representations
- **DiscreteTransformer**: Converts categorical values to SDRs
- **PersistenceTransformer**: Time-decay transformer for contextual signals
- **PatternPooler**: Spatial pooler combining multiple inputs
- **PatternClassifier**: Multi-layer pattern classification
- **SequenceLearner**: Temporal sequence learning with memory
- **ContextLearner**: Context-aware sequence learning

### 3. Data Sources (JavaScript-based)
- **ScalarDataSource**: Generates continuous patterns (sine, cosine, random walk, noise)
- **DiscreteDataSource**: Generates categorical patterns (sequential, random, cyclic)
- 14 pre-configured presets for common scenarios

### 4. Real-time Execution
- Configurable execution speed (10ms - 1000ms per step)
- Start/Stop/Reset controls
- Learning on/off toggle
- Step counter and status monitoring

### 5. Visualizations
- **Time Series**: Line plots showing block outputs over time
- **Bitfield Heatmaps**: Sparse distributed representation visualization
- **Network Flow**: Animated edge highlighting during execution
- **Data Source Previews**: Mini-plots on data source nodes

### 6. Demo Networks
Pre-configured demonstrations:
- **Sequence Learning**: Temporal pattern prediction
- **Classification**: Multi-input pattern classification
- **Context Learning**: Context-modulated learning
- **Feature Pooling**: Spatial pooling from multiple sources
- **Sensor Fusion**: Multi-sensor integration
- **Time Series**: Time series forecasting
- **Multi-Modal**: Combined scalar and discrete inputs

### 7. Template System
- Save custom network configurations
- Template gallery with thumbnails
- Import/export templates as JSON
- Metadata (name, description, category, tags)

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern browser with WebAssembly support

### Installation

```bash
# Clone the repository
cd gcf-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Quick Start

1. **Select a Demo**: Choose from the demo dropdown (e.g., "Sequence Learning")
2. **Initialize Network**: Click "Initialize Network" to build the demo
3. **Start Execution**: Click "Start" to begin real-time execution
4. **Observe**: Watch the network execute and visualizations update
5. **Experiment**: Adjust speed, toggle learning, modify parameters

---

## Project Structure

```
gcf-dashboard/
├── public/                      # Static assets
├── src/
│   ├── components/              # React components
│   │   ├── edges/               # Custom ReactFlow edges
│   │   │   ├── InputEdge.jsx
│   │   │   ├── ContextEdge.jsx
│   │   │   └── DataSourceEdge.jsx
│   │   ├── layout/              # Main layout components
│   │   │   ├── Header.jsx
│   │   │   ├── BlockPalette.jsx
│   │   │   ├── NetworkPanel.jsx
│   │   │   └── DataPanel.jsx
│   │   ├── modals/              # Modal dialogs
│   │   │   ├── CreateBlockModal.jsx
│   │   │   ├── TemplateGallery.jsx
│   │   │   └── TemplateMetadataEditor.jsx
│   │   ├── nodes/               # Custom ReactFlow nodes
│   │   │   ├── BaseNode.jsx
│   │   │   ├── TransformerNode.jsx
│   │   │   ├── LearningNode.jsx
│   │   │   ├── TemporalNode.jsx
│   │   │   └── DataSourceNode.jsx
│   │   ├── panels/              # Side panels
│   │   │   └── ParameterPanel.jsx
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── ColorPicker.jsx
│   │   │   ├── IconPicker.jsx
│   │   │   ├── ParameterSlider.jsx
│   │   │   └── TemplateCard.jsx
│   │   └── visualizations/      # Data visualizations
│   │       ├── TimeSeriesPlot.jsx
│   │       ├── BitfieldGrid.jsx
│   │       ├── DataSourcePreview.jsx
│   │       └── DataSourceMiniPlot.jsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useWasmNetwork.js
│   │   ├── useExecutionLoop.js
│   │   ├── useDemoInitializer.js
│   │   ├── useLayoutAlgorithm.js
│   │   ├── usePaletteDragDrop.js
│   │   ├── useKeyboardShortcuts.js
│   │   └── useNetworkPersistence.js
│   ├── stores/                  # Zustand state stores
│   │   ├── networkStore.js
│   │   ├── executionStore.js
│   │   ├── dataSourceStore.js
│   │   ├── visualizationStore.js
│   │   ├── customBlockStore.js
│   │   └── templateStore.js
│   ├── utils/                   # Utility functions
│   │   ├── wasmBridge.js        # WASM interface wrapper
│   │   ├── wasmAdvanced.js      # Advanced WASM operations
│   │   ├── demoConfigs.js       # Demo network definitions
│   │   ├── blockHelpers.js      # Block utility functions
│   │   ├── layoutAlgorithms.js  # Network layout algorithms
│   │   ├── networkSerializer.js # Save/load networks
│   │   ├── templateManager.js   # Template operations
│   │   ├── thumbnailGenerator.js# Generate preview images
│   │   ├── parameterValidation.js
│   │   ├── performanceMonitor.js
│   │   ├── persistence.js
│   │   └── dataSources/         # Data source implementations
│   │       ├── BaseDataSource.js
│   │       ├── ScalarSequenceSource.js
│   │       ├── DiscreteSequenceSource.js
│   │       ├── SeededRandom.js
│   │       ├── presets.js
│   │       └── index.js
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles
├── pkg/                         # WASM package (generated)
│   ├── gnomics.js
│   ├── gnomics.wasm
│   └── gnomics.d.ts
├── tests/                       # Playwright E2E tests
├── package.json
├── vite.config.js
└── README.md
```

---

## Core Components

### Layout Components

#### `Header.jsx`
Top control bar with:
- Demo selector dropdown
- Initialize/Start/Stop/Reset buttons
- Speed slider (10-1000ms)
- Learning toggle
- Status indicators (WASM ready, network status)

#### `BlockPalette.jsx`
Left sidebar with draggable block types:
- Built-in WASM blocks
- Data source blocks
- Custom blocks (user-defined)
- Create custom block button

#### `NetworkPanel.jsx`
Main canvas using ReactFlow:
- Drag-and-drop block placement
- Connection drawing
- Node selection and movement
- Zoom/pan controls
- Background grid

#### `DataPanel.jsx`
Bottom panel with tabs:
- Time Series: Line plots of block outputs
- Bitfield States: Heatmap visualization of SDRs
- Sources: Data source current values

#### `ParameterPanel.jsx`
Right sidebar for editing:
- Selected block parameters
- Real-time parameter updates
- Parameter validation
- Type-specific inputs (sliders, number inputs, checkboxes)

### Node Components

All nodes extend `BaseNode.jsx` which provides:
- Visual styling and ports
- Selection highlighting
- State preview display
- Parameter display

Specialized nodes:
- **TransformerNode**: For transformer blocks
- **LearningNode**: For pooler/classifier blocks
- **TemporalNode**: For sequence/context learners
- **DataSourceNode**: For data generators

### Edge Components

- **InputEdge**: Standard input connections (gray)
- **ContextEdge**: Context connections (purple, dashed)
- **DataSourceEdge**: Data source connections (blue, animated when active)

---

## WASM Integration

### WASM Bridge (`src/utils/wasmBridge.js`)

The WASM bridge provides a clean JavaScript interface to the Rust WASM module:

```javascript
// Initialize WASM
await initializeWasm();

// Create network
const network = createNetwork();

// Add blocks
const handle = addBlock(network, 'ScalarTransformer', {
  min_val: 0.0,
  max_val: 100.0,
  num_s: 2048,
  num_as: 256,
  num_t: 2,
  seed: 42
});

// Connect blocks
connectBlocks(network, sourceHandle, targetHandle, 'input');

// Rebuild network (computes execution order)
rebuildNetwork(network);

// Execute one step
executeNetwork(network, learningEnabled);

// Get block state
const bitfield = getBlockState(network, handle);
const outputValue = getBlockOutput(network, handle);

// Set input values (for transformers)
setScalarValue(network, handle, 42.5);
setDiscreteValue(network, handle, 3);
```

### WASM Block Parameters

Each block type has specific parameters that must be provided:

#### ScalarTransformer
```javascript
{
  min_val: 0.0,      // Minimum input value
  max_val: 100.0,    // Maximum input value
  num_s: 2048,       // Number of columns (output size)
  num_as: 256,       // Number of active columns
  num_t: 2,          // Number of temporal contexts
  seed: 42           // Random seed
}
```

#### DiscreteTransformer
```javascript
{
  num_v: 10,         // Number of discrete values
  num_s: 512,        // Number of columns (output size)
  num_t: 2,          // Number of temporal contexts
  seed: 42           // Random seed
}
```

#### PersistenceTransformer
```javascript
{
  min_val: 0.0,
  max_val: 100.0,
  num_s: 2048,
  num_as: 256,
  max_step: 10,      // Maximum persistence steps
  num_t: 2,
  seed: 42
}
```

#### PatternPooler
```javascript
{
  num_s: 1024,       // Number of columns (output size)
  num_as: 40,        // Number of active columns
  perm_thr: 20,      // Permanence threshold
  perm_inc: 2,       // Permanence increment
  perm_dec: 1,       // Permanence decrement
  pct_pool: 0.8,     // Pooling percentage
  pct_conn: 0.5,     // Connection percentage
  pct_learn: 0.3,    // Learning percentage
  always_update: false,
  num_t: 2,
  seed: 0
}
```

#### PatternClassifier
```javascript
{
  num_l: 3,          // Number of layers
  num_s: 1024,       // Number of columns per layer
  num_as: 30,        // Active columns per layer
  perm_thr: 20,
  perm_inc: 2,
  perm_dec: 1,
  pct_pool: 0.8,
  pct_conn: 0.5,
  pct_learn: 0.3,
  num_t: 2,
  seed: 0
}
```

#### SequenceLearner / ContextLearner
```javascript
{
  num_c: 512,        // Number of columns (must match input size)
  num_spc: 4,        // Segments per column
  num_dps: 8,        // Distal dendrites per segment
  num_rpd: 32,       // Receptors per dendrite
  d_thresh: 20,      // Dendrite activation threshold
  perm_thr: 20,
  perm_inc: 2,
  perm_dec: 1,
  num_t: 2,
  always_update: false,
  seed: 42
}
```

### Size Compatibility Rules

**Critical**: Connected blocks must have compatible input/output sizes:

- Transformers output `num_s` columns
- SequenceLearner expects input size == `num_c`
- ContextLearner expects input size == `num_c`, context size == `num_c`
- PatternPooler outputs `num_s` columns
- PatternClassifier accepts any input size

Example compatible chain:
```
ScalarTransformer(num_s: 128)
  → SequenceLearner(num_c: 128)
  → PatternClassifier(num_s: 256)
```

---

## State Management

The application uses Zustand for state management with multiple specialized stores:

### `networkStore.js`
Manages ReactFlow network state:
- `nodes`: Array of ReactFlow nodes
- `edges`: Array of ReactFlow edges
- `selectedNode`: Currently selected node
- Actions: `addNode`, `removeNode`, `updateNodeData`, `setNodes`, `setEdges`, etc.

### `executionStore.js`
Manages execution state and WASM:
- `wasmReady`: WASM initialization status
- `wasmNetwork`: WASM network instance
- `isRunning`: Execution loop status
- `speed`: Execution speed (ms per step)
- `learningEnabled`: Learning on/off
- `executionStep`: Current step counter
- Actions: `start`, `stop`, `reset`, `setSpeed`, `toggleLearning`

### `dataSourceStore.js`
Manages data sources (JavaScript generators):
- `sources`: Map of sourceId → DataSource instance
- Actions: `addSource`, `removeSource`, `updateSource`, `executeAllSources`

### `visualizationStore.js`
Manages visualization data:
- `timeSeriesData`: Map of nodeId → array of {timestamp, value} points
- `bitfieldData`: Map of nodeId → boolean array (SDR)
- Actions: `updateTimeSeries`, `updateBitfield`, `clearData`

### `customBlockStore.js`
Manages block definitions:
- `BUILTIN_BLOCKS`: Array of built-in block type definitions
- `customBlocks`: User-created custom blocks
- Actions: `addCustomBlock`, `removeCustomBlock`, `updateCustomBlock`

### `templateStore.js`
Manages network templates:
- `templates`: Array of saved templates
- Actions: `saveTemplate`, `loadTemplate`, `deleteTemplate`

---

## Data Sources

Data sources are JavaScript-based generators that produce input values for the network.

### Types

#### ScalarDataSource
Generates continuous numerical values:
- **sine**: `amplitude * sin(frequency * step + phase) + offset`
- **cosine**: `amplitude * cos(frequency * step + phase) + offset`
- **triangle**: Triangle wave pattern
- **square**: Square wave pattern
- **sawtooth**: Sawtooth wave pattern
- **randomWalk**: Random walk with drift
- **noise**: Random noise (uniform or Gaussian)
- **constant**: Fixed value

#### DiscreteDataSource
Generates categorical/discrete values:
- **sequential**: Cycles through categories in order
- **random**: Random category each step
- **cyclic**: Repeating pattern
- **conditional**: Conditional logic based on rules

### Configuration

```javascript
// Scalar source example
{
  pattern: 'sine',
  amplitude: 10,
  frequency: 0.1,
  offset: 0,
  noise: 0.5,      // Add noise
  phase: 0
}

// Discrete source example
{
  pattern: 'sequential',
  numCategories: 5,
  changeEvery: 3,   // Change value every N steps
  noise: 0          // Probability of random changes
}
```

### Presets

14 pre-configured presets available in `src/utils/dataSources/presets.js`:
- Temperature sensor (sine with noise)
- Stock price (random walk)
- Heartbeat (sine with variations)
- Traffic light (sequential discrete)
- Weather conditions (cyclic discrete)
- And more...

---

## Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run all tests
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test -- tests/smoke.spec.js

# View test report
npm run test:report
```

### Development Workflow

1. **Start dev server**: `npm run dev`
2. **Make changes**: Edit files in `src/`
3. **Hot reload**: Changes automatically reload in browser
4. **Check console**: Monitor browser console for errors/logs
5. **Run tests**: `npm test` to verify functionality

### Adding a New Block Type

1. **Define in WASM**: Add block type to Rust WASM module
2. **Update wasmBridge.js**: Add to `BLOCK_CONFIGS`
3. **Update customBlockStore.js**: Add to `BUILTIN_BLOCKS`
4. **Create node component**: Extend `BaseNode.jsx` if needed
5. **Update nodeTypes.js**: Register the node component
6. **Test**: Create demo and verify functionality

### Adding a New Data Source Pattern

1. **Implement pattern**: Add to `ScalarSequenceSource.js` or `DiscreteSequenceSource.js`
2. **Add preset**: Create preset in `presets.js`
3. **Update docs**: Document parameters
4. **Test**: Create demo using the new pattern

---

## Testing

### Test Structure

```
tests/
├── smoke.spec.js                    # Basic functionality
├── wasm-integration-test.spec.js   # WASM operations
├── phase2-custom-blocks.spec.js    # Custom blocks
└── phase3-data-sources.spec.js     # Data sources
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/smoke.spec.js

# Run in headed mode (see browser)
npm run test:headed

# Run with debugging
npm run test:debug

# Interactive UI mode
npm run test:ui
```

### Test Coverage

Tests cover:
- WASM initialization
- Block creation and connection
- Network execution
- Data source generation
- UI interactions
- Template save/load
- Parameter validation

---

## Configuration

### Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
```

### ESLint Configuration (`eslint.config.js`)

Uses flat config format with:
- React Hooks recommended rules
- React Refresh for HMR
- Custom rules for unused variables

### Environment Variables

Create `.env` file for custom configuration:
```
VITE_DEFAULT_EXECUTION_SPEED=50
VITE_MAX_TIME_SERIES_POINTS=1000
```

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 15+
- Edge 90+

**Requirements**:
- WebAssembly support
- ES2020 features
- SharedArrayBuffer (for WASM threads if used)

---

## Performance Considerations

### WASM Performance
- Networks execute at native speeds (~60 FPS achievable)
- Large networks (>100 blocks) may need speed adjustment
- Use `performanceMonitor.js` to track bottlenecks

### React Performance
- ReactFlow handles thousands of nodes efficiently
- Time series data is capped at 1000 points per node
- Bitfield visualizations are throttled during fast execution

### Memory Management
- WASM memory is managed by Rust
- JavaScript stores are garbage collected
- Clear visualization data when resetting networks

---

## Troubleshooting

### WASM fails to initialize
- Check browser console for errors
- Verify `pkg/gnomics.wasm` exists
- Check CORS settings if serving from different origin

### Network won't execute
- Ensure network is rebuilt after adding blocks
- Check that blocks have compatible sizes
- Verify all connections are valid

### Performance issues
- Reduce execution speed
- Disable bitfield visualizations for large networks
- Clear time series data periodically

### Data sources not working
- Check that data source edges are connected
- Verify data source configuration is valid
- Ensure transformer types match source types

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Run linter: `npm run lint`
5. Run tests: `npm test`
6. Submit pull request

---

## License

[Your License Here]

---

## Acknowledgments

- Built with [React](https://react.dev/) and [Vite](https://vite.dev/)
- Powered by [ReactFlow](https://reactflow.dev/) for network visualization
- State management with [Zustand](https://zustand-demo.pmnd.rs/)
- Charts by [Recharts](https://recharts.org/)
- WASM by [Rust](https://www.rust-lang.org/) and [wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/)

---

## Support

For issues, questions, or feature requests, please open an issue on the repository.
