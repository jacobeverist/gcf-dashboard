# ReactFlow Dashboard Implementation Plan

## Project Overview

Transform the D3.js-based Gnomics Live Visualizer (viewer_live.html) into a modern ReactFlow dashboard with improved React architecture while maintaining all functionality.

### Source Analysis

The prototype (viewer_live.html) is a comprehensive WASM-based neural network visualizer featuring:
- D3.js-based network graph visualization
- 6 block types across 3 categories (Transformers, Learning, Temporal)
- Real-time execution with configurable speed
- 4 demo configurations (Sequence Learning, Classification, Context Learning, Feature Pooling)
- Time series plotting and bitfield visualization
- Undo/redo history system
- Save/load functionality
- Hierarchical and force-directed layouts

---

## Technology Stack

### Core
- **React 19** - UI framework
- **ReactFlow** - Node-based graph visualization
- **Vite** - Build tool and dev server

### New Dependencies
- **zustand** - State management (lightweight, no boilerplate)
- **@tanstack/react-query** - Async state & WASM module management
- **recharts** - Time series plotting (simpler than D3)
- **react-hot-toast** - Notifications and status messages

### Optional
- **react-use** - Useful hooks (useInterval, useLocalStorage)
- **clsx** - Conditional className utility

---

## Architecture

### State Management Strategy

**Zustand Stores** (3 separate stores for separation of concerns):

1. **networkStore** - Node graph state
   - Nodes and edges
   - Selection state
   - History for undo/redo

2. **executionStore** - Runtime state
   - WASM network instance
   - Execution loop state
   - Speed, learning toggle
   - Step counter

3. **visualizationStore** - Display data
   - Time series data buffers
   - Bitfield snapshots
   - Plot configurations

### Component Hierarchy

```
App
├── Header
│   ├── ControlBar
│   │   ├── DemoSelector
│   │   ├── ExecutionControls
│   │   └── SpeedControl
│   └── StatusBar
├── MainContent (flex container)
│   ├── BlockPalette (sidebar)
│   │   └── PaletteItem[] (draggable)
│   ├── NetworkCanvas
│   │   ├── EditorToolbar
│   │   └── ReactFlow
│   │       ├── CustomNodes[]
│   │       └── CustomEdges[]
│   └── DataPanel (sidebar)
│       ├── PlotsSection
│       │   └── TimeSeriesPlot[]
│       └── BitfieldSection
│           └── BitfieldGrid[]
```

---

## Phase 1: Project Foundation & UI Structure

### 1.1 Setup & Dependencies

**Install packages:**
```bash
npm install zustand @tanstack/react-query recharts react-hot-toast clsx
```

**Update package.json scripts (if needed):**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### 1.2 Layout Components

Create base layout matching prototype:

**Files to create:**
- `src/components/layout/Header.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/layout/DataPanel.jsx`
- `src/styles/layout.css` - Dark theme styles

**Dark Theme Color Palette:**
```css
--bg-primary: #1a1a1a
--bg-secondary: #1e1e1e
--bg-tertiary: #2a2a2a
--border: #3a3a3a
--text-primary: #e0e0e0
--text-secondary: #888
--accent-blue: #4a9eff
--accent-green: #4aff4a
--accent-orange: #ff9a4a
--accent-red: #ff4a4a
```

---

## Phase 2: Core Network Visualization

### 2.1 Custom ReactFlow Nodes

**Node Type Specifications:**

| Category | Type | Shape | Color | Icon |
|----------|------|-------|-------|------|
| Transformers | ScalarTransformer | Triangle | #8DB4E2 | ▲ |
| Transformers | DiscreteTransformer | Triangle | #E2A98D | ▲ |
| Transformers | PersistenceTransformer | Triangle | #C48DE2 | ▲ |
| Learning | PatternPooler | Horizontal Rect | #A8D8A8 | ▭ |
| Learning | PatternClassifier | Horizontal Rect | #E2A8E2 | ▭ |
| Temporal | SequenceLearner | Square | #E2E28D | ◼ |
| Temporal | ContextLearner | Square | #8DE2E2 | ◼ |

**Files to create:**
- `src/components/nodes/BaseNode.jsx` - Shared node wrapper
- `src/components/nodes/TransformerNode.jsx`
- `src/components/nodes/LearningNode.jsx`
- `src/components/nodes/TemporalNode.jsx`
- `src/components/nodes/nodeTypes.js` - Export all types
- `src/styles/nodes.css`

**Node Features:**
- Block name and ID display
- Input/output port indicators
- Internal state visualization (bitfield preview)
- Selection highlighting
- Drag handles

### 2.2 Custom Edges

**Edge Types:**
- **Input Connection** - Solid line, standard color
- **Context Connection** - Dashed line, different color

**Files to create:**
- `src/components/edges/InputEdge.jsx`
- `src/components/edges/ContextEdge.jsx`
- `src/components/edges/edgeTypes.js`

---

## Phase 3: State Management

### 3.1 Zustand Stores

**networkStore.js:**
```javascript
{
  // State
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  history: [],
  historyIndex: -1,

  // Actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => { /* ... */ },
  removeNode: (id) => { /* ... */ },
  addEdge: (edge) => { /* ... */ },
  removeEdge: (id) => { /* ... */ },
  undo: () => { /* ... */ },
  redo: () => { /* ... */ },
  pushHistory: (operation) => { /* ... */ },
  clearHistory: () => set({ history: [], historyIndex: -1 }),
}
```

**executionStore.js:**
```javascript
{
  // State
  wasmNetwork: null,
  wasmReady: false,
  isRunning: false,
  executionStep: 0,
  speed: 100,
  learningEnabled: true,
  currentDemo: null,

  // Actions
  setWasmNetwork: (network) => set({ wasmNetwork, wasmReady: true }),
  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),
  reset: () => { /* ... */ },
  executeStep: () => { /* ... */ },
  setSpeed: (speed) => set({ speed }),
  toggleLearning: () => set(state => ({ learningEnabled: !state.learningEnabled })),
}
```

**visualizationStore.js:**
```javascript
{
  // State
  timeSeriesData: {}, // { blockId: { data: [], maxPoints: 100 } }
  bitfieldData: {}, // { blockId: Uint8Array }
  plots: [], // Array of plot configurations

  // Actions
  updateTimeSeries: (blockId, value, timestamp) => { /* ... */ },
  updateBitfield: (blockId, bitfield) => { /* ... */ },
  clearData: () => set({ timeSeriesData: {}, bitfieldData: {} }),
  initializePlots: (demoType) => { /* ... */ },
}
```

**Files to create:**
- `src/stores/networkStore.js`
- `src/stores/executionStore.js`
- `src/stores/visualizationStore.js`

---

## Phase 4: WASM Integration

### 4.1 WASM Module Setup

**Assumptions:**
- WASM module location: `./pkg/gnomics.js`
- Exports: `init()`, `WasmNetwork` class

**Files to create:**
- `src/utils/wasmBridge.js` - WASM initialization and wrapper functions
- `src/hooks/useWasmNetwork.js` - React hook for WASM network management

**useWasmNetwork Hook API:**
```javascript
const {
  network,        // WasmNetwork instance
  isReady,        // boolean
  isLoading,      // boolean
  error,          // Error | null
  initialize,     // () => Promise<void>
} = useWasmNetwork();
```

### 4.2 WASM Operations

**Bridge Functions:**
- `initializeWasm()` - Load WASM module
- `createNetwork()` - Instantiate WasmNetwork
- `addBlock(type, config)` - Add block and return handle
- `removeBlock(handle)` - Remove block
- `connectBlocks(source, target, connType)` - Create connection
- `removeConnection(source, target, connType)` - Remove connection
- `executeNetwork(learn)` - Run one step
- `rebuildNetwork()` - Rebuild after structural changes
- `getBlockState(handle)` - Extract bitfield data
- `getBlockMetrics(handle)` - Get output values for plotting

---

## Phase 5: Interactive Features

### 5.1 Block Palette

**PaletteItem Component:**
- Draggable using HTML5 drag API
- Data attribute: `data-block-type`
- Visual icon matching prototype
- Label below icon

**Drag & Drop Flow:**
1. User drags PaletteItem
2. On drop over ReactFlow canvas:
   - Create new node at drop position
   - Add to networkStore
   - Create WASM block via wasmBridge
   - Store WASM handle in node data

**Files to create:**
- `src/components/palette/BlockPalette.jsx`
- `src/components/palette/PaletteItem.jsx`
- `src/hooks/usePaletteDragDrop.js`

### 5.2 Editor Modes

**Toolbar Buttons:**
- Select Mode (default) - 🖱️
- Connect Mode - 🔗
- Delete - 🗑️
- Save - 💾
- Load - 📂

**Mode State:**
- Store in local state or networkStore
- Keyboard shortcuts: V (select), C (connect)

**Connect Mode Behavior:**
1. Click first node (highlight)
2. Click second node
3. Show connection type dialog (Input vs Context)
4. Create edge

**Files to create:**
- `src/components/controls/EditorToolbar.jsx`
- `src/hooks/useEditorMode.js`

### 5.3 Canvas Interactions

**ReactFlow Props:**
- `onNodesChange` - Sync with networkStore
- `onEdgesChange` - Sync with networkStore
- `onConnect` - Create WASM connection
- `onNodesDelete` - Remove from WASM
- `onEdgesDelete` - Remove connection from WASM
- `nodeTypes` - Custom node components
- `edgeTypes` - Custom edge components

---

## Phase 6: Control Panel

### 6.1 Demo Configuration

**Demo Definitions** (from prototype):
```javascript
const DEMOS = {
  sequence: {
    name: 'Sequence Learning',
    description: 'Learn and predict temporal sequences',
    blocks: [ /* ... */ ],
    connections: [ /* ... */ ],
    plots: [ /* ... */ ],
  },
  classification: {
    name: 'Classification',
    description: 'Pattern classification task',
    // ...
  },
  context: {
    name: 'Context Learning',
    description: 'Learn contextual relationships',
    // ...
  },
  pooling: {
    name: 'Feature Pooling',
    description: 'Pool features from multiple inputs',
    // ...
  },
};
```

**Demo Initialization:**
1. User selects demo from dropdown
2. Click "Initialize Network"
3. Clear existing network
4. Create blocks according to demo.blocks
5. Create connections according to demo.connections
6. Initialize plots according to demo.plots
7. Apply hierarchical layout

**Files to create:**
- `src/utils/demoConfigs.js` - Demo definitions
- `src/components/controls/DemoSelector.jsx`

### 6.2 Execution Controls

**ControlBar Component:**
- Demo dropdown
- Initialize button (disabled until demo selected)
- Start button (disabled until initialized)
- Stop button (disabled until running)
- Reset button
- Reset Layout button
- Speed slider (10-1000ms)
- Learning checkbox

**Execution Flow:**
1. Start clicked → set isRunning = true
2. useExecutionLoop hook starts setInterval
3. Each interval: call executeStep()
4. executeStep():
   - Call wasmNetwork.execute(learningEnabled)
   - Update bitfield data
   - Update time series data
   - Increment step counter
   - Re-render nodes with new state
5. Stop clicked → clear interval, set isRunning = false

**Files to create:**
- `src/components/controls/ControlBar.jsx`
- `src/components/controls/ExecutionControls.jsx`
- `src/components/controls/SpeedControl.jsx`
- `src/hooks/useExecutionLoop.js`

### 6.3 Status Bar

**Status Indicators:**
- WASM Status: Not loaded | Ready | Failed
- Network Status: Not created | X blocks
- Demo Description: Current demo name

**Visual:**
- Colored dots (red=inactive, green=active, orange=learning)
- Status text

**Files to create:**
- `src/components/controls/StatusBar.jsx`
- `src/components/controls/StatusIndicator.jsx`

---

## Phase 7: Data Visualization Panel

### 7.1 Bitfield Display

**BitfieldGrid Component:**
- Input: Uint8Array or Array of 0/1
- Render as grid of colored cells
- Active = bright color, Inactive = dim
- Tooltip showing bit index
- Auto-size based on array length

**Layout:**
- One BitfieldGrid per block
- Expandable/collapsible sections
- Label with block name

**Files to create:**
- `src/components/visualizations/BitfieldGrid.jsx`
- `src/components/visualizations/BitfieldSection.jsx`

### 7.2 Time Series Plots

**TimeSeriesPlot Component:**
- Uses Recharts LineChart
- Props: data, title, xLabel, yLabel, color
- Auto-scrolling window (last 100 points)
- Grid lines, axes, legend

**Plot Types by Demo:**
- Sequence: Input signal, Prediction, Error
- Classification: Class probabilities, Accuracy
- Context: Context activations, Predictions
- Pooling: Pooled features, Input signals

**Files to create:**
- `src/components/visualizations/TimeSeriesPlot.jsx`
- `src/components/visualizations/PlotsSection.jsx`

---

## Phase 8: Layout Algorithms

### 8.1 Hierarchical Layout

**Algorithm** (port from viewer_live.html):
1. Compute node levels via BFS from root nodes (nodes with no incoming edges)
2. Group nodes by level
3. Position vertically by level (y = level * spacing)
4. Position horizontally within level (x = index * spacing)
5. Optimize to minimize edge crossings (optional)

**Implementation:**
```javascript
function applyHierarchicalLayout(nodes, edges) {
  const levels = computeLevels(nodes, edges);
  const nodesByLevel = groupByLevel(nodes, levels);

  return nodes.map(node => {
    const level = levels[node.id];
    const indexInLevel = nodesByLevel[level].indexOf(node);

    return {
      ...node,
      position: {
        x: indexInLevel * 200 + 100,
        y: level * 150 + 100,
      },
    };
  });
}
```

**Files to create:**
- `src/utils/layoutAlgorithms.js`
- `src/hooks/useLayoutAlgorithm.js`

### 8.2 Force-Directed Layout (Optional)

Use D3 force simulation if needed:
- Attraction between connected nodes
- Repulsion between all nodes
- Center force to keep graph centered

---

## Phase 9: Persistence & History

### 9.1 Save/Load Network

**Network Serialization Format:**
```json
{
  "version": "1.0",
  "demo": "sequence",
  "nodes": [
    { "id": "node-1", "type": "ScalarTransformer", "position": {...}, "data": {...} }
  ],
  "edges": [
    { "id": "edge-1", "source": "node-1", "target": "node-2", "type": "input" }
  ],
  "metadata": {
    "created": "2025-01-15T12:00:00Z",
    "modified": "2025-01-15T12:30:00Z"
  }
}
```

**Save Flow:**
1. Serialize networkStore state to JSON
2. Download as .json file OR save to localStorage

**Load Flow:**
1. Parse JSON file
2. Validate structure
3. Clear existing network
4. Recreate WASM blocks from nodes
5. Recreate WASM connections from edges
6. Update networkStore

**Files to create:**
- `src/utils/persistence.js` - Save/load functions
- `src/hooks/useNetworkPersistence.js`

### 9.2 Undo/Redo System

**Operation Types:**
```javascript
{
  type: 'ADD_NODE',
  nodeId: 'node-1',
  node: {...},
  wasmHandle: 123,
}

{
  type: 'REMOVE_NODE',
  nodeId: 'node-1',
  node: {...},
  wasmHandle: 123,
}

{
  type: 'ADD_EDGE',
  edgeId: 'edge-1',
  edge: {...},
}

{
  type: 'REMOVE_EDGE',
  edgeId: 'edge-1',
  edge: {...},
}
```

**History Management:**
- Push operation to history stack when action performed
- Truncate future operations when new action after undo
- Max history size (e.g., 50 operations)

**Undo/Redo Implementation:**
- Undo: Execute inverse operation, decrement historyIndex
- Redo: Execute operation at historyIndex + 1, increment

**Files to create:**
- `src/utils/historyManager.js`
- Integrate into networkStore

---

## Phase 10: Animation & Performance

### 10.1 Execution Loop

**useExecutionLoop Hook:**
```javascript
function useExecutionLoop() {
  const { isRunning, speed, executeStep } = useExecutionStore();

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      executeStep();
    }, speed);

    return () => clearInterval(intervalId);
  }, [isRunning, speed, executeStep]);
}
```

**executeStep Function:**
1. Call wasmNetwork.execute(learningEnabled)
2. For each block:
   - Get state: wasmNetwork.getBlockState(handle)
   - Update bitfieldData in visualizationStore
   - Get output: wasmNetwork.getBlockOutput(handle)
   - Update timeSeriesData in visualizationStore
3. Increment executionStep counter
4. Check demo completion condition (if applicable)

### 10.2 Performance Optimizations

**React Optimizations:**
- Memoize custom node components with React.memo
- Use useCallback for event handlers
- Avoid inline object creation in render

**ReactFlow Optimizations:**
- Set `nodesDraggable={!isRunning}` to disable during execution
- Use `onlyRenderVisibleElements={true}`
- Batch state updates where possible

**Data Optimizations:**
- Limit time series buffer size (e.g., 100 points)
- Debounce plot re-renders (every N steps)
- Use binary data formats for bitfields

---

## Phase 11: Polish & UX

### 11.1 Tooltips & Help

**Tooltip Locations:**
- Toolbar buttons - show keyboard shortcut
- Palette items - show block type description
- Status indicators - explain status
- Nodes - show block info (ID, type, state summary)

**Implementation:**
- Use native `title` attribute or library like `react-tooltip`

### 11.2 Responsive Design

**Considerations:**
- Minimum width for usability (~1200px)
- Collapsible sidebars for smaller screens
- Adjust node sizes for touch interfaces
- Hide mini-map on small screens

**Splitter for Panels:**
- Allow user to resize DataPanel width
- Use library like `react-resizable-panels`

### 11.3 Error Handling

**Error Scenarios:**
- WASM fails to load → show error message, disable controls
- Invalid connection → show toast notification
- Demo initialization fails → revert to previous state
- File load fails → show error dialog

**Implementation:**
- Error boundaries for component crashes
- Try-catch in WASM operations
- Toast notifications for user errors

### 11.4 Accessibility

**ARIA Labels:**
- Toolbar buttons
- Status indicators
- Form controls

**Keyboard Navigation:**
- Tab through controls
- Arrow keys to navigate nodes (optional)
- Keyboard shortcuts for common actions

**Focus Management:**
- Visible focus indicators
- Focus trap in modals

---

## Implementation Order

### Week 1: Foundation
- [ ] Phase 1.1 - Install dependencies
- [ ] Phase 1.2 - Create layout components with dark theme
- [ ] Phase 2.1 - Create custom ReactFlow nodes
- [ ] Phase 2.2 - Create custom edges
- [ ] Phase 3 - Set up Zustand stores

### Week 2: Core Functionality
- [ ] Phase 4 - WASM integration
- [ ] Phase 5.1 - Block palette drag & drop
- [ ] Phase 6.1 - Demo configuration system
- [ ] Phase 6.2 - Execution controls

### Week 3: Visualization
- [ ] Phase 5.2 - Editor modes and toolbar
- [ ] Phase 6.3 - Status bar
- [ ] Phase 7.1 - Bitfield display
- [ ] Phase 7.2 - Time series plots

### Week 4: Advanced Features
- [ ] Phase 8 - Layout algorithms
- [ ] Phase 9.1 - Save/load functionality
- [ ] Phase 9.2 - Undo/redo system
- [ ] Phase 10 - Execution loop and optimizations

### Week 5: Polish
- [ ] Phase 11 - Polish, error handling, accessibility
- [ ] Testing and bug fixes
- [ ] Documentation updates

---

## Testing Strategy

### Unit Tests
- Zustand store actions
- Layout algorithms
- WASM bridge functions
- Utility functions

### Integration Tests
- Node creation and deletion
- Connection creation and deletion
- Demo initialization
- Execution loop

### E2E Tests (Optional)
- Full workflow: select demo → initialize → run → stop
- Save and load network
- Undo/redo operations

---

## Migration Notes from viewer_live.html

### Direct Ports
- Color scheme and styling
- Block type definitions
- Demo configurations
- Hierarchical layout algorithm
- Status indicator logic

### Adaptations
- D3 network graph → ReactFlow
- D3 plots → Recharts
- Vanilla JS state → Zustand
- setInterval → useExecutionLoop hook
- DOM manipulation → React components

### New Additions
- TypeScript types (optional but recommended)
- Modern React patterns (hooks, context)
- Better state management
- Component composition
- Improved accessibility

---

## Future Enhancements

### Phase 12+ (Post-MVP)
- [ ] Custom block creation UI
- [ ] Block parameter tuning
- [ ] Multiple network tabs
- [ ] Comparison mode (run multiple configs)
- [ ] Export animations/videos
- [ ] Shared network links
- [ ] Cloud persistence
- [ ] Performance profiling view
- [ ] A/B testing different configurations
- [ ] Jupyter notebook integration

---

## Resources

### Documentation Links
- ReactFlow: https://reactflow.dev/
- Zustand: https://github.com/pmndrs/zustand
- Recharts: https://recharts.org/
- React Query: https://tanstack.com/query/latest

### Reference Code
- Original prototype: `viewer_live.html`
- Current ReactFlow setup: `src/App.jsx`
