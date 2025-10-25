# Phase 2: UI Integration - Implementation Report

**Status**: ✅ Complete
**Date**: 2025-10-25
**Duration**: ~2 hours

## Overview

Successfully implemented the complete UI integration for Data Source Blocks. Data sources can now be dragged from the palette, dropped onto the canvas, configured via parameter panel, and connected to transformer blocks. The full drag-drop-configure-connect workflow is functional.

## Files Created

### 1. `/src/components/nodes/DataSourceNode.jsx` (107 lines)

**Purpose**: Custom React component for rendering data source nodes on the canvas

**Implementation**:
- Base component with two variants: `DiscreteDataSourceNode` and `ScalarDataSourceNode`
- No input handle (output-only blocks)
- Displays:
  - Node header with circular icon
  - Source type (Discrete/Scalar)
  - Selected pattern
  - Current value with formatting
  - Enabled indicator
  - Output handle
- Memo-wrapped for performance

**Key Features**:
```javascript
- Circle icon shape for visual distinction from transformers
- Live value display with decimal formatting
- Pattern name display
- Enabled/disabled status indicator
- Color-coded by type (orange for scalar, pink for discrete)
```

## Files Modified

### 1. `/src/components/nodes/nodeTypes.js`

**Changes**: Registered two new node types in ReactFlow

```javascript
import {
    DiscreteDataSourceNode,
    ScalarDataSourceNode,
} from './DataSourceNode';

export const nodeTypes = {
    // ... existing types
    DiscreteDataSource: DiscreteDataSourceNode,
    ScalarDataSource: ScalarDataSourceNode,
};
```

### 2. `/src/stores/customBlockStore.js`

**Changes**: Added data source block type and built-in block definitions

**Added Block Type**:
```javascript
data_source: {
    category: 'Data Sources',
    shape: 'circle',
    defaultParams: {
        pattern: 'sine',
        frequency: 0.1,
        amplitude: 1.0,
    },
}
```

**Added Built-in Blocks**:
1. **DiscreteDataSource**:
   - Icon: ● (circle)
   - Color: #FF80AB (pink)
   - Parameters:
     - pattern: select (sequential, cyclic, random, weighted, custom)
     - numCategories: number (2-100)
     - changeEvery: number (1-100)
     - noise: number (0-1)

2. **ScalarDataSource**:
   - Icon: ● (circle)
   - Color: #FFB366 (orange)
   - Parameters:
     - pattern: select (sine, square, sawtooth, triangle, randomWalk, gaussian, step, linear, constant)
     - amplitude: number (0-100)
     - frequency: number (0-1)
     - offset: number (-100 to 100)
     - noise: number (0-10)

### 3. `/src/components/layout/BlockPalette.jsx`

**Changes**: Added icons for data source blocks in palette

```javascript
function getBuiltinIcon(blockId) {
    const iconMap = {
        // Data Sources
        DiscreteDataSource: <div className="palette-icon circle" style={{ background: 'var(--block-data-discrete)' }}></div>,
        ScalarDataSource: <div className="palette-icon circle" style={{ background: 'var(--block-data-scalar)' }}></div>,
        // ... existing icons
    };
}
```

### 4. `/src/components/panels/ParameterPanel.jsx`

**Changes**: Extended to support both WASM blocks and data sources

**Added**:
- Import `useDataSourceStore`
- Detection of data source nodes via `isDataSource` flag
- Routing of parameter changes:
  - Data sources → `updateSource(sourceId, params)`
  - WASM blocks → `updateBlockParams(network, wasmHandle, params)`
- Support for string-based select options (used by data sources)

**Key Logic**:
```javascript
const isDataSource = useMemo(() => {
    if (!selectedNode) return false;
    const blockType = selectedNode.data.blockType;
    return blockType === 'DiscreteDataSource' || blockType === 'ScalarDataSource';
}, [selectedNode]);

const handleParameterChangeComplete = (paramName, value) => {
    if (isDataSource) {
        updateSource(sourceId, { [paramName]: value });
    } else {
        updateBlockParams(network, wasmHandle, newParams);
    }
};
```

### 5. `/src/hooks/usePaletteDragDrop.js`

**Changes**: Complete integration of data source creation on drop

**Added Imports**:
- `useDataSourceStore`
- `useCustomBlockStore`

**Modified onDrop Handler**:
- Detects data source blocks
- For data sources:
  1. Gets block definition and default parameters
  2. Creates data source instance in dataSourceStore
  3. Creates ReactFlow node with data source metadata
- For WASM blocks:
  1. Creates WASM block via wasmBridge
  2. Creates ReactFlow node with WASM handle

**Data Source Node Data**:
```javascript
{
    label: 'Discrete Source',
    blockType: 'DiscreteDataSource',
    sourceId: 'ds-12345',     // ID in dataSourceStore
    sourceType: 'discrete',    // 'discrete' or 'scalar'
    hasOutput: true,
    hasInput: false,           // No input for data sources
    enabled: true,
    params: { pattern: 'sequential', numCategories: 10, ... },
    pattern: 'sequential',
    currentValue: null,
}
```

**Updated getBlockLabel**:
```javascript
const labels = {
    DiscreteDataSource: 'Discrete Source',
    ScalarDataSource: 'Scalar Source',
    // ... existing labels
};
```

### 6. `/src/styles/theme.css`

**Changes**: Added color variables for data source blocks

```css
/* Data Source Colors */
--block-data-scalar: #FFB366;      /* Warm orange for scalar data sources */
--block-data-discrete: #FF80AB;    /* Pink for discrete data sources */
```

### 7. `/src/styles/nodes.css`

**Changes**: Added comprehensive styling for data source nodes

**Added Styles**:
```css
/* Circle icon shape */
.node-icon.circle {
    width: 18px;
    height: 18px;
    border-radius: 50%;
}

/* Data source node border colors */
.custom-node.data-source-scalar {
    border-left: 3px solid var(--block-data-scalar);
}

.custom-node.data-source-discrete {
    border-left: 3px solid var(--block-data-discrete);
}

/* Data source info section */
.node-data-source-info {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-xs);
    padding: 4px 6px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
}

/* Current value display */
.node-current-value {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacing-sm);
    padding: 6px 8px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-secondary);
}

.value-display {
    font-size: 12px;
    font-weight: 700;
    color: var(--accent-green);
    font-family: 'Courier New', monospace;
}
```

### 8. `/src/styles/palette.css`

**Changes**: Added circle icon styling for palette

```css
.palette-icon.circle {
    width: 35px;
    height: 35px;
    border-radius: 50%;
}
```

## Architecture

### Data Flow

```
User Action → Palette Drag → Canvas Drop → Store Creation
                                             ↓
                                   DataSourceStore.addSource()
                                             ↓
                                   ReactFlow Node Created
                                             ↓
                                   Node Rendered on Canvas
```

### Component Hierarchy

```
App
├── BlockPalette
│   └── PaletteItem (DataSource icons)
│       └── onDragStart
├── NetworkPanel (ReactFlow)
│   ├── DataSourceNode (custom component)
│   │   ├── Node Header
│   │   ├── Source Info (type + pattern)
│   │   ├── Current Value Display
│   │   └── Output Handle
│   └── onDrop (creates data source)
└── ParameterPanel
    └── Parameters (routed to dataSourceStore)
```

### Store Integration

```
UI Layer:
- DataSourceNode (rendering)
- ParameterPanel (configuration)
- usePaletteDragDrop (creation)
         ↓
Store Layer:
- dataSourceStore (data source instances)
- networkStore (ReactFlow nodes/edges)
         ↓
Data Layer:
- DiscreteSequenceSource
- ScalarSequenceSource
```

## User Workflow

### 1. Create Data Source

1. User sees "Data Sources" section in BlockPalette
2. Drags "Discrete Source" or "Scalar Source" onto canvas
3. onDrop handler:
   - Creates data source in dataSourceStore
   - Creates ReactFlow node
   - Links them via sourceId
4. Node appears on canvas with default pattern

### 2. Configure Parameters

1. User clicks data source node (selects it)
2. ParameterPanel displays:
   - Block icon and name
   - Pattern selector (dropdown)
   - Numeric sliders (amplitude, frequency, etc.)
3. User changes pattern to "sine"
4. ParameterPanel calls `updateSource(sourceId, { pattern: 'sine' })`
5. DataSourceStore updates the source instance
6. Source regenerates data with new pattern

### 3. Connect to Transformer

1. User drags from data source output handle
2. Connects to transformer input handle
3. Edge created in networkStore
4. During execution (Phase 1 integration):
   - Data source generates value
   - Value propagates through edge
   - Transformer receives value

## Visual Design

### Color Scheme

| Block Type | Color | Variable | Usage |
|-----------|-------|----------|-------|
| Scalar Source | #FFB366 (Orange) | `--block-data-scalar` | Border, icon |
| Discrete Source | #FF80AB (Pink) | `--block-data-discrete` | Border, icon |

### Icon Shape

- **Data Sources**: Circle (●)
- **Transformers**: Triangle (▲)
- **Learning**: Horizontal Rectangle (▬)
- **Temporal**: Square (■)

Visual distinction makes it easy to identify block types at a glance.

### Node Layout

```
┌─────────────────────────┐
│ ● Discrete Source       │  ← Header with icon
│   #id-12345             │
├─────────────────────────┤
│ DISCRETE  sequential    │  ← Type and pattern
├─────────────────────────┤
│ Current:           5    │  ← Live value
├─────────────────────────┤
│ Out  ●    Enabled  ●    │  ← Status indicators
└──────────┬──────────────┘
           │  ← Output handle
```

## Testing Status

- ✅ Nodes render correctly
- ✅ Parameters display in panel
- ✅ Parameter changes update store
- ✅ Drag-and-drop creates nodes
- ✅ Connections can be made
- ⏸️ End-to-end execution tests (requires Phase 1 integration to be active)
- ⏸️ Value propagation tests (requires Phase 1 integration to be active)

## Key Design Decisions

### 1. Extended ParameterPanel vs Separate Panel

**Decision**: Extended existing ParameterPanel
**Rationale**:
- Consistent user experience
- Reuses existing UI components (sliders, selects)
- Single source of truth for parameter editing
- Less code duplication

### 2. Node Data Structure

**Decision**: Include both `sourceId` and `sourceType` in node data
**Rationale**:
- `sourceId`: Links to dataSourceStore instance
- `sourceType`: Enables quick type checking without store lookup
- `blockType`: Required for ReactFlow node type resolution

### 3. Output-Only Nodes

**Decision**: Data sources have no input handle
**Rationale**:
- Matches conceptual model (sources generate data)
- Prevents invalid connections
- Clear visual distinction from transformers
- Simplifies execution logic

### 4. Parameter Defaults in customBlockStore

**Decision**: Store parameter definitions in customBlockStore alongside WASM blocks
**Rationale**:
- Centralized block metadata
- Consistent with existing architecture
- Easy to extend with new block types
- Palette can query block definitions

## Integration Points

### Phase 1 Integration (Execution)

The execution loop (already implemented in Phase 1) handles data sources:

```javascript
// In useExecutionLoop.js (Phase 1)
const sourceValues = executeAllSources();  // Step all sources

Object.keys(sourceValues).forEach((sourceId) => {
    const value = sourceValues[sourceId];
    const source = getSource(sourceId);

    // Find connections
    const outgoingEdges = edges.filter(e => e.source === sourceId);

    outgoingEdges.forEach(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        const handle = targetNode.data.wasmHandle;

        // Set value on WASM block
        if (source.type === 'scalar') {
            setScalarValue(wasmNetwork, handle, value);
        } else {
            setDiscreteValue(wasmNetwork, handle, value);
        }
    });
});

executeNetwork(wasmNetwork, learningEnabled);  // Execute WASM
```

### Phase 3 Integration (Visualization)

Future visualization panel will:
- Display current values from dataSourceStore
- Show history plots for scalar sources
- Show categorical distribution for discrete sources
- Highlight active sources

## Known Limitations

1. **No visual value updates on node** - Currently, currentValue in node data is not updated during execution (Phase 3 will add this)
2. **No connection validation** - Users can connect data sources to incompatible blocks (Phase 3 will add validation)
3. **No preset library** - Users must configure parameters manually (Phase 4 will add presets)
4. **No custom sequence editor** - Custom patterns require manual configuration (Phase 4 will add UI)

## Performance Considerations

- **Node Memoization**: DataSourceNode is memo-wrapped to prevent unnecessary re-renders
- **Parameter Updates**: Only re-render ParameterPanel when selected node changes
- **Store Updates**: dataSourceStore only notifies subscribers on actual changes
- **Drag Performance**: onDrop handler is optimized with useCallback

## API Summary

### DataSourceNode Props

```javascript
{
    data: {
        label: string,           // Display name
        blockType: string,       // Node type ID
        sourceId: string,        // ID in dataSourceStore
        sourceType: string,      // 'discrete' or 'scalar'
        hasOutput: boolean,
        hasInput: boolean,
        enabled: boolean,
        params: object,          // Current parameters
        pattern: string,         // Current pattern name
        currentValue: number,    // Latest generated value
    },
    selected: boolean,           // ReactFlow selection state
}
```

### ParameterPanel Changes

```javascript
// New behavior:
if (isDataSource) {
    updateSource(sourceId, params);  // → dataSourceStore
} else {
    updateBlockParams(network, wasmHandle, params);  // → WASM
}
```

### usePaletteDragDrop Changes

```javascript
// New behavior in onDrop:
if (blockType === 'DiscreteDataSource' || blockType === 'ScalarDataSource') {
    const sourceId = addSource(sourceType, config);
    const newNode = { ...nodeConfig, data: { sourceId, ... } };
    addNode(newNode);
} else {
    const wasmHandle = addBlock(wasmNetwork, blockType, params);
    const newNode = { ...nodeConfig, data: { wasmHandle, ... } };
    addNode(newNode);
}
```

## Conclusion

Phase 2 is **complete and fully functional**. Users can now:

✅ See data sources in the block palette
✅ Drag data sources onto the canvas
✅ Configure data source parameters
✅ Connect data sources to transformers
✅ Visual distinction from other block types

The implementation maintains consistency with existing patterns while cleanly extending the architecture for the new block class. All UI components are integrated and working together.

**Ready for Phase 3: Visualization**
