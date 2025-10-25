# Data Source Blocks - API Documentation

**Version:** 2.0
**Last Updated:** 2025-10-25
**Status:** Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Core Classes](#core-classes)
3. [Data Source Store](#data-source-store)
4. [Pattern Generators](#pattern-generators)
5. [Preset System](#preset-system)
6. [Serialization](#serialization)
7. [React Components](#react-components)
8. [Usage Examples](#usage-examples)

---

## Overview

The Data Source Blocks system provides JavaScript-based data generation for the GCF Dashboard. Data sources generate input values for Transformer blocks, enabling self-contained demonstrations without external data.

### Key Design Principles

- **JavaScript-only**: No WASM modifications required
- **Flexible**: Easy to add new patterns and generators
- **Real-time**: Can adjust parameters during execution
- **Serializable**: Full save/load support with network persistence

### Architecture

```
┌─────────────────────┐
│  Data Source Node   │ ← React Component (UI)
│  (ScalarDataSource) │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Data Source Store   │ ← Zustand Store (State)
│ (dataSourceStore)   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Sequence Generator  │ ← Pattern Logic
│ (ScalarSequence)    │
└─────────────────────┘
```

---

## Core Classes

### ScalarSequenceSource

**Location:** `src/utils/dataSources/ScalarSequenceSource.js`

Generates continuous numerical sequences using various mathematical patterns.

#### Constructor

```javascript
new ScalarSequenceSource(config)
```

**Parameters:**
- `config` (Object): Configuration object
  - `config.id` (string): Unique identifier
  - `config.name` (string): Human-readable name
  - `config.pattern` (string): Pattern type
  - `config.params` (Object): Pattern-specific parameters
  - `config.seed` (number, optional): Random seed for reproducibility

**Example:**
```javascript
const source = new ScalarSequenceSource({
    id: 'temp-sensor',
    name: 'Temperature Sensor',
    pattern: 'sine',
    params: {
        amplitude: 15,
        frequency: 0.042,
        offset: 20,
        noise: 2.0
    },
    seed: 42
});
```

#### Methods

##### `getValue()`

Returns the next value in the sequence.

```javascript
const value = source.getValue();
// Returns: 23.5
```

**Returns:** `number`

##### `reset()`

Resets the internal step counter to 0.

```javascript
source.reset();
```

##### `updateParams(newParams)`

Updates pattern parameters.

```javascript
source.updateParams({
    amplitude: 20,
    noise: 1.5
});
```

**Parameters:**
- `newParams` (Object): Parameters to update (partial update supported)

##### `getConfig()`

Returns the complete configuration object for serialization.

```javascript
const config = source.getConfig();
// Returns: { id, type, name, pattern, params, history }
```

**Returns:** `Object`

##### `getHistory()`

Returns the value history array.

```javascript
const history = source.getHistory();
// Returns: [20.1, 21.3, 22.7, ...]
```

**Returns:** `number[]`

#### Supported Patterns

| Pattern | Description | Required Parameters |
|---------|-------------|---------------------|
| `sine` | Sinusoidal wave | amplitude, frequency, offset, noise |
| `square` | Square wave | amplitude, frequency, offset, noise |
| `triangle` | Triangle wave | amplitude, frequency, offset, noise |
| `sawtooth` | Sawtooth wave | amplitude, frequency, offset, noise |
| `randomWalk` | Random walk | amplitude, frequency, offset, noise |
| `gaussian` | Gaussian noise | amplitude, frequency, offset, noise |
| `step` | Step function | amplitude, frequency, offset, noise |
| `linear` | Linear ramp | amplitude, frequency, offset, noise |
| `constant` | Constant value | offset |

#### Parameter Reference

```javascript
{
    amplitude: 10,    // Wave amplitude (0-100)
    frequency: 0.1,   // Oscillation frequency (0-1)
    offset: 0,        // DC offset (-100 to 100)
    noise: 0          // Gaussian noise level (0-10)
}
```

---

### DiscreteSequenceSource

**Location:** `src/utils/dataSources/DiscreteSequenceSource.js`

Generates categorical/discrete values over time.

#### Constructor

```javascript
new DiscreteSequenceSource(config)
```

**Parameters:**
- `config` (Object): Configuration object
  - `config.id` (string): Unique identifier
  - `config.name` (string): Human-readable name
  - `config.pattern` (string): Pattern type
  - `config.params` (Object): Pattern-specific parameters
  - `config.seed` (number, optional): Random seed

**Example:**
```javascript
const source = new DiscreteSequenceSource({
    id: 'day-of-week',
    name: 'Day of Week',
    pattern: 'sequential',
    params: {
        numCategories: 7,
        changeEvery: 10,
        noise: 0
    }
});
```

#### Methods

Same methods as `ScalarSequenceSource`:
- `getValue()` - Returns next discrete value (integer)
- `reset()`
- `updateParams(newParams)`
- `getConfig()`
- `getHistory()`

#### Supported Patterns

| Pattern | Description | Required Parameters |
|---------|-------------|---------------------|
| `sequential` | Sequential counting | numCategories, changeEvery, noise |
| `cyclic` | Cyclic pattern (0→max→0) | numCategories, changeEvery, noise |
| `random` | Uniform random | numCategories, changeEvery, noise |
| `weighted` | Weighted random | numCategories, changeEvery, noise, weights |
| `custom` | User-defined sequence | customSequence |

#### Parameter Reference

```javascript
{
    numCategories: 7,          // Number of discrete values (2-100)
    changeEvery: 5,            // Steps before changing (1-50)
    noise: 0.1,                // Probability of random deviation (0-1)
    weights: [1, 2, 1, 1],     // Weights for weighted random (optional)
    customSequence: [0,1,2,1]  // Custom sequence (for 'custom' pattern)
}
```

---

## Data Source Store

**Location:** `src/stores/dataSourceStore.js`

Zustand store managing all data source instances.

### State

```javascript
{
    sources: {
        'source-id-1': ScalarSequenceSource,
        'source-id-2': DiscreteSequenceSource,
        ...
    },
    nextId: 3
}
```

### Actions

#### `addSource(type, config)`

Creates a new data source and returns its ID.

```javascript
const sourceId = addSource('scalar', {
    name: 'Temperature',
    pattern: 'sine',
    params: { amplitude: 15, frequency: 0.1, offset: 20, noise: 2 }
});
```

**Parameters:**
- `type` (string): 'scalar' or 'discrete'
- `config` (Object): Configuration object (without id)

**Returns:** `string` - Generated source ID

#### `removeSource(id)`

Removes a data source by ID.

```javascript
removeSource('source-1');
```

#### `updateSource(id, params)`

Updates a data source's parameters.

```javascript
updateSource('source-1', {
    amplitude: 20,
    noise: 1.5
});
```

#### `getSource(id)`

Returns a data source instance by ID.

```javascript
const source = getSource('source-1');
const value = source.getValue();
```

**Returns:** `ScalarSequenceSource | DiscreteSequenceSource | undefined`

#### `getSourceValue(id)`

Gets the current value from a data source.

```javascript
const value = getSourceValue('source-1');
// Returns: 23.5
```

**Returns:** `number`

#### `getSourceHistory(id, n)`

Gets the last N values from a data source.

```javascript
const history = getSourceHistory('source-1', 50);
// Returns: [20.1, 21.3, ..., 23.5] (last 50 values)
```

**Parameters:**
- `id` (string): Source ID
- `n` (number, optional): Number of values to return (default: all)

**Returns:** `number[]`

#### `executeAllSources()`

Executes all data sources and returns their current values.

```javascript
const values = executeAllSources();
// Returns: { 'source-1': 23.5, 'source-2': 4 }
```

**Returns:** `Object` - Map of sourceId → value

#### `resetSource(id)`

Resets a data source to step 0.

```javascript
resetSource('source-1');
```

#### `clear()`

Removes all data sources.

```javascript
clear();
```

---

## Pattern Generators

### Scalar Pattern Functions

**Location:** `src/utils/dataSources/ScalarSequenceSource.js`

#### Sine Wave

```javascript
const value = amplitude * Math.sin(2 * Math.PI * frequency * step) + offset + noise;
```

#### Square Wave

```javascript
const value = amplitude * (Math.sin(2 * Math.PI * frequency * step) >= 0 ? 1 : -1) + offset + noise;
```

#### Triangle Wave

```javascript
const phase = (frequency * step) % 1;
const value = amplitude * (4 * Math.abs(phase - 0.5) - 1) + offset + noise;
```

#### Random Walk

```javascript
let current = offset;
current += (Math.random() - 0.5) * amplitude * 2;
```

### Discrete Pattern Functions

**Location:** `src/utils/dataSources/DiscreteSequenceSource.js`

#### Sequential

```javascript
const value = Math.floor(step / changeEvery) % numCategories;
```

#### Cyclic (Triangle)

```javascript
const cycle = Math.floor(step / changeEvery) % (2 * numCategories - 2);
const value = cycle < numCategories
    ? cycle
    : 2 * numCategories - 2 - cycle;
```

#### Weighted Random

```javascript
const totalWeight = weights.reduce((sum, w) => sum + w, 0);
let random = Math.random() * totalWeight;
let value = 0;
for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
        value = i;
        break;
    }
}
```

---

## Preset System

**Location:** `src/utils/dataSources/presets.js`

### Functions

#### `getPresets(sourceType)`

Returns all presets for a source type.

```javascript
const scalarPresets = getPresets('scalar');
// Returns: Array of 8 scalar presets

const discretePresets = getPresets('discrete');
// Returns: Array of 6 discrete presets
```

**Parameters:**
- `sourceType` (string): 'scalar' or 'discrete'

**Returns:** `Array<Preset>`

#### `getPresetById(sourceType, presetId)`

Gets a specific preset by ID.

```javascript
const preset = getPresetById('scalar', 'temp-daily');
// Returns: { id, name, description, icon, params }
```

**Returns:** `Preset | null`

#### `applyPreset(source, presetId)`

Applies a preset to a data source instance.

```javascript
const source = getSource('source-1');
const success = applyPreset(source, 'temp-daily');
```

**Returns:** `boolean`

#### `getPresetOptions(sourceType)`

Gets preset options formatted for dropdown menus.

```javascript
const options = getPresetOptions('scalar');
// Returns: [
//   { value: 'temp-daily', label: '🌡️ Daily Temperature', description: '...' },
//   ...
// ]
```

**Returns:** `Array<{value, label, description}>`

### Preset Structure

```javascript
{
    id: 'temp-daily',
    name: 'Daily Temperature',
    description: 'Simulates daily temperature variation',
    icon: '🌡️',
    params: {
        pattern: 'sine',
        amplitude: 15,
        frequency: 0.042,
        offset: 20,
        noise: 2.0
    }
}
```

### Available Presets

#### Scalar Presets

| ID | Name | Icon | Pattern | Use Case |
|----|------|------|---------|----------|
| `temp-daily` | Daily Temperature | 🌡️ | sine | Temperature sensors |
| `smooth-sine` | Smooth Sine Wave | 〰️ | sine | Clean oscillations |
| `noisy-sensor` | Noisy Sensor | 📊 | sine | Realistic sensor data |
| `random-walk` | Random Walk | 📈 | randomWalk | Stock prices |
| `square-wave` | Square Wave | ⬜ | square | Digital signals |
| `step-function` | Step Function | 📶 | step | Level changes |
| `linear-ramp` | Linear Ramp | 📐 | linear | Time-based growth |
| `gaussian-noise` | Gaussian Noise | 🌊 | gaussian | Monte Carlo |

#### Discrete Presets

| ID | Name | Icon | Pattern | Use Case |
|----|------|------|---------|----------|
| `days-of-week` | Days of Week | 📅 | sequential | Calendar events |
| `traffic-light` | Traffic Light | 🚦 | cyclic | State machines |
| `dice-roll` | Dice Roll | 🎲 | random | Game mechanics |
| `state-machine` | State Machine | ⚙️ | sequential | State transitions |
| `binary-toggle` | Binary Toggle | 🔄 | sequential | On/off patterns |
| `noisy-counter` | Noisy Counter | 🔢 | sequential | Counting with errors |

---

## Serialization

**Location:** `src/utils/persistence.js`

### Functions

#### `serializeNetwork(nodes, edges, dataSources, demoKey)`

Serializes a complete network including data sources.

```javascript
const serialized = serializeNetwork(nodes, edges, dataSources, 'basic-flow');
```

**Returns:**
```javascript
{
    version: '2.0',
    demo: 'basic-flow',
    timestamp: '2025-10-25T14:30:00.000Z',
    nodes: [...],
    edges: [...],
    dataSources: [
        {
            id: 'source-1',
            type: 'scalar',
            name: 'Temperature',
            pattern: 'sine',
            params: { ... }
        }
    ]
}
```

#### `downloadNetwork(nodes, edges, dataSources, filename, demoKey)`

Downloads a network as a JSON file.

```javascript
downloadNetwork(nodes, edges, dataSources, 'my-network.json', 'demo-1');
```

#### `saveToLocalStorage(nodes, edges, dataSources, key, demoKey)`

Saves a network to localStorage.

```javascript
saveToLocalStorage(nodes, edges, dataSources, 'autosave', 'demo-1');
```

#### `loadNetworkFromFile(file)`

Loads and validates a network from a file.

```javascript
const data = await loadNetworkFromFile(fileObject);
```

**Returns:** `Promise<SerializedNetwork>`

#### `loadFromLocalStorage(key)`

Loads a network from localStorage.

```javascript
const data = loadFromLocalStorage('autosave');
```

**Returns:** `SerializedNetwork | null`

### Network Format Version 2.0

```json
{
    "version": "2.0",
    "demo": "sequence-learning",
    "timestamp": "2025-10-25T14:30:00.000Z",
    "nodes": [
        {
            "id": "node-1",
            "type": "ScalarDataSource",
            "position": { "x": 100, "y": 200 },
            "data": {
                "label": "Temperature",
                "blockType": "ScalarDataSource",
                "sourceId": "source-1",
                "sourceType": "scalar",
                "params": {
                    "pattern": "sine",
                    "amplitude": 15,
                    "frequency": 0.042,
                    "offset": 20,
                    "noise": 2.0
                }
            }
        }
    ],
    "edges": [
        {
            "id": "edge-1",
            "source": "node-1",
            "target": "node-2",
            "type": "dataSource",
            "data": {
                "sourceType": "scalar"
            }
        }
    ],
    "dataSources": [
        {
            "id": "source-1",
            "type": "scalar",
            "name": "Temperature",
            "pattern": "sine",
            "params": {
                "pattern": "sine",
                "amplitude": 15,
                "frequency": 0.042,
                "offset": 20,
                "noise": 2.0
            },
            "history": [20.1, 21.3, 22.7]
        }
    ]
}
```

---

## React Components

### DataSourceNode

**Location:** `src/components/nodes/DataSourceNode.jsx`

React component for rendering data source nodes on the canvas.

#### Props

```javascript
{
    id: string,              // Node ID
    data: {
        label: string,       // Node label
        sourceId: string,    // Data source ID
        sourceType: string,  // 'scalar' or 'discrete'
        currentValue: number, // Current value (updated during execution)
        params: Object       // Current parameters
    },
    selected: boolean
}
```

#### Features

- Displays source type badge (SCALAR/DISCRETE)
- Shows current pattern
- Shows current value during execution
- Output handle for connections
- Enable/disable toggle
- Color-coded by source type

### ParameterPanel (Data Source Mode)

**Location:** `src/components/panels/ParameterPanel.jsx`

Shows parameter controls when a data source is selected.

#### Features

- Preset selector dropdown (source-type specific)
- Pattern selector
- Parameter sliders (amplitude, frequency, etc.)
- Real-time parameter updates
- Preset description display

#### Preset Selector UI

```jsx
<select value={selectedPreset} onChange={handlePresetSelect}>
    <option value="">Custom (no preset)</option>
    <option value="temp-daily">🌡️ Daily Temperature</option>
    <option value="smooth-sine">〰️ Smooth Sine Wave</option>
    ...
</select>
```

### DataSourceMiniPlot

**Location:** `src/components/visualizations/DataSourceMiniPlot.jsx`

SVG sparkline component for history visualization.

#### Props

```javascript
{
    data: number[],          // Array of values to plot
    color: string            // CSS color for line/fill
}
```

#### Example

```jsx
<DataSourceMiniPlot
    data={[20.1, 21.3, 22.7, 23.5]}
    color="var(--block-data-scalar)"
/>
```

### DataSourceEdge

**Location:** `src/components/edges/DataSourceEdge.jsx`

Custom edge component for data source connections.

#### Props

```javascript
{
    id: string,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    data: {
        sourceType: string,  // 'scalar' or 'discrete'
        animated: boolean    // Enable animation during execution
    }
}
```

#### Features

- Color-coded by source type (orange for scalar, pink for discrete)
- Animated dashed line during execution
- Thicker stroke than regular edges

---

## Usage Examples

### Creating a Data Source

```javascript
import useDataSourceStore from '../stores/dataSourceStore';

const addSource = useDataSourceStore(state => state.addSource);

// Create a scalar source
const sourceId = addSource('scalar', {
    name: 'Temperature Sensor',
    pattern: 'sine',
    params: {
        amplitude: 15,
        frequency: 0.042,
        offset: 20,
        noise: 2.0
    }
});
```

### Getting Values During Execution

```javascript
import useDataSourceStore from '../stores/dataSourceStore';

const executeAllSources = useDataSourceStore(state => state.executeAllSources);

// In execution loop
const sourceValues = executeAllSources();
// Returns: { 'source-1': 23.5, 'source-2': 4 }
```

### Applying a Preset

```javascript
import { getPresetById } from '../utils/dataSources/presets';
import useDataSourceStore from '../stores/dataSourceStore';

const updateSource = useDataSourceStore(state => state.updateSource);

const preset = getPresetById('scalar', 'temp-daily');
if (preset) {
    updateSource(sourceId, preset.params);
}
```

### Saving a Network with Data Sources

```javascript
import { downloadNetwork } from '../utils/persistence';
import useNetworkStore from '../stores/networkStore';
import useDataSourceStore from '../stores/dataSourceStore';

const nodes = useNetworkStore(state => state.nodes);
const edges = useNetworkStore(state => state.edges);
const dataSources = useDataSourceStore(state => state.sources);

downloadNetwork(nodes, edges, dataSources, 'my-network.json', 'demo-1');
```

### Loading a Network with Data Sources

```javascript
import { loadNetworkFromFile } from '../utils/persistence';
import useDataSourceStore from '../stores/dataSourceStore';

const addSource = useDataSourceStore(state => state.addSource);
const clearDataSources = useDataSourceStore(state => state.clear);

// Load from file
const data = await loadNetworkFromFile(file);

// Clear existing
clearDataSources();

// Recreate data sources with ID mapping
const sourceIdMap = {};
for (const sourceConfig of data.dataSources) {
    const oldId = sourceConfig.id;
    const newId = addSource(sourceConfig.type, sourceConfig);
    sourceIdMap[oldId] = newId;
}

// Recreate nodes with updated sourceIds
for (const nodeData of data.nodes) {
    if (isDataSource(nodeData)) {
        const oldSourceId = nodeData.data.sourceId;
        const newSourceId = sourceIdMap[oldSourceId];
        // Create node with newSourceId...
    }
}
```

### Creating a Custom Pattern

To add a new pattern, modify `ScalarSequenceSource.js`:

```javascript
// In getValue() method
case 'myCustomPattern':
    const customValue = /* your pattern logic */;
    break;
```

### Extending Presets

To add a new preset, edit `src/utils/dataSources/presets.js`:

```javascript
export const DATA_SOURCE_PRESETS = {
    scalar: [
        // ... existing presets
        {
            id: 'my-custom-preset',
            name: 'My Custom Pattern',
            description: 'Description of the pattern',
            icon: '🎨',
            params: {
                pattern: 'sine',
                amplitude: 10,
                frequency: 0.1,
                offset: 0,
                noise: 0.5
            }
        }
    ]
};
```

---

## API Reference Summary

### Classes

- `ScalarSequenceSource` - Continuous value generator
- `DiscreteSequenceSource` - Categorical value generator

### Stores

- `dataSourceStore` - Central state management for all sources

### Utilities

- `presets.js` - Preset library functions
- `persistence.js` - Network serialization functions

### Components

- `DataSourceNode` - Canvas node component
- `ParameterPanel` - Parameter editor (with preset selector)
- `DataSourceMiniPlot` - History sparkline
- `DataSourceEdge` - Custom edge for connections

---

## Version History

### Version 2.0 (2025-10-25)
- Added preset system (14 presets)
- Added network serialization support
- Added source ID mapping for load operations
- Version bump in network format

### Version 1.0 (2025-10-25)
- Initial implementation
- Scalar and discrete sources
- 9 scalar patterns, 5 discrete patterns
- Visualization components
- Parameter configuration

---

## Support

For issues, questions, or contributions, please refer to the main project repository.

**Document Version:** 2.0
**Author:** Claude Code
**Date:** 2025-10-25
