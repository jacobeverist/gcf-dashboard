# Phase 4 Developer Guide

## Quick Start

Phase 4 provides advanced WASM integration utilities for the GCF Dashboard. This guide shows you how to use the new features.

## Table of Contents

1. [Batch Operations](#batch-operations)
2. [Validation](#validation)
3. [Network Metrics](#network-metrics)
4. [Serialization & Persistence](#serialization--persistence)
5. [Performance Monitoring](#performance-monitoring)
6. [Complete Examples](#complete-examples)

---

## Batch Operations

### Creating Multiple Blocks at Once

```javascript
import { createNetwork } from '../utils/wasmBridge.js';
import { batchAddBlocks, batchConnectBlocks } from '../utils/wasmAdvanced.js';

const network = createNetwork();

// Define multiple blocks
const blocks = [
    { id: 'input', type: 'ScalarTransformer', config: { inputSize: 128, threshold: 0.5 } },
    { id: 'pooler', type: 'PatternPooler', config: { inputSize: 256, poolSize: 64 } },
    { id: 'output', type: 'PatternClassifier', config: { inputSize: 256, numClasses: 10 } }
];

// Create all blocks at once
const handleMap = batchAddBlocks(network, blocks);
console.log(`Created ${handleMap.size} blocks`);

// Define connections
const connections = [
    { source: 'input', target: 'pooler', type: 'input' },
    { source: 'pooler', target: 'output', type: 'input' }
];

// Create all connections at once
const successful = batchConnectBlocks(network, connections, handleMap);
console.log(`Created ${successful.length} connections`);
```

---

## Validation

### Validate Block Configuration

```javascript
import { validateBlockConfig, getDefaultBlockConfig } from '../utils/wasmAdvanced.js';

// Get default configuration
const config = getDefaultBlockConfig('ScalarTransformer');
console.log(config); // { inputSize: 128, threshold: 0.5, learningRate: 0.01 }

// Validate custom configuration
const validation = validateBlockConfig('ScalarTransformer', {
    inputSize: 256,
    threshold: 0.8
});

if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
}
```

### Validate Network Topology

```javascript
import { validateNetworkTopology } from '../utils/wasmAdvanced.js';

const result = validateNetworkTopology(nodes, edges);

if (!result.valid) {
    result.warnings.forEach(warning => console.warn(warning));
}

// Example warnings:
// - "2 isolated node(s) detected"
// - "Cycle detected in input connections"
// - "No input nodes found"
```

---

## Network Metrics

### Collect and Analyze Metrics

```javascript
import {
    collectNetworkMetrics,
    calculateNetworkStats,
    createNetworkSnapshot,
    compareSnapshots
} from '../utils/wasmAdvanced.js';

// Collect current metrics
const metrics = collectNetworkMetrics(network, handleMap);

// Calculate statistics
const stats = calculateNetworkStats(metrics);
console.log(`Average sparsity: ${stats.avgSparsity.toFixed(3)}`);
console.log(`Total active bits: ${stats.totalActiveBits}`);

// Create snapshot
const snapshot1 = createNetworkSnapshot(network, handleMap);

// ... execute network ...

const snapshot2 = createNetworkSnapshot(network, handleMap);

// Compare snapshots
const diff = compareSnapshots(snapshot1, snapshot2);
console.log(`Total changes: ${diff.totalChanges} bits`);
console.log(`Blocks changed: ${diff.blocksChanged.length}`);
```

### Memory Usage Estimation

```javascript
import { estimateMemoryUsage } from '../utils/wasmAdvanced.js';

const usage = estimateMemoryUsage(network, handleMap);
console.log(`Total memory: ${usage.totalKB} KB`);
console.log(`Bitfields: ${(usage.breakdown.bitfields / 1024).toFixed(2)} KB`);
```

---

## Serialization & Persistence

### Save/Load to File

```javascript
import {
    serializeNetwork,
    deserializeNetwork,
    exportToFile,
    importFromFile,
    rebuildWasmNetwork
} from '../utils/networkSerializer.js';

// Save to file
const saveNetwork = () => {
    const serialized = serializeNetwork(nodes, edges, {
        name: 'My Network',
        description: 'Classification network with 3 layers'
    });

    exportToFile(serialized, 'my-network.json');
};

// Load from file
const loadNetwork = async (file) => {
    try {
        const data = await importFromFile(file);

        // Validate before loading
        const validation = validateSerializedNetwork(data);
        if (!validation.valid) {
            console.error('Invalid network:', validation.errors);
            return;
        }

        // Rebuild WASM network
        const { handleMap, errors } = rebuildWasmNetwork(network, data.nodes, data.edges);

        if (errors.length > 0) {
            console.warn('Rebuild warnings:', errors);
        }

        // Update UI
        setNodes(data.nodes);
        setEdges(data.edges);

    } catch (error) {
        console.error('Failed to load network:', error);
    }
};
```

### LocalStorage Persistence

```javascript
import {
    saveToLocalStorage,
    loadFromLocalStorage,
    listSavedNetworks,
    deleteSavedNetwork
} from '../utils/networkSerializer.js';

// Save to localStorage
const save = () => {
    const serialized = serializeNetwork(nodes, edges);
    const success = saveToLocalStorage(serialized, 'gcf-network-autosave');
    if (success) {
        console.log('Saved to localStorage');
    }
};

// Load from localStorage
const load = () => {
    const data = loadFromLocalStorage('gcf-network-autosave');
    if (data) {
        setNodes(data.nodes);
        setEdges(data.edges);
    }
};

// List all saved networks
const listNetworks = () => {
    const saved = listSavedNetworks();
    saved.forEach(({ name, timestamp, metadata }) => {
        console.log(`${name} - ${new Date(timestamp).toLocaleString()}`);
        console.log(`  Nodes: ${metadata.nodeCount}, Edges: ${metadata.edgeCount}`);
    });
};

// Delete saved network
const deleteNetwork = (key) => {
    const success = deleteSavedNetwork(key);
    if (success) {
        console.log('Network deleted');
    }
};
```

### Network Comparison

```javascript
import { diffNetworks } from '../utils/networkSerializer.js';

const network1 = serializeNetwork(nodes1, edges1);
const network2 = serializeNetwork(nodes2, edges2);

const diff = diffNetworks(network1, network2);

console.log('Nodes added:', diff.nodesAdded);
console.log('Nodes removed:', diff.nodesRemoved);
console.log('Nodes modified:', diff.nodesModified);
console.log('Edges added:', diff.edgesAdded);
console.log('Edges removed:', diff.edgesRemoved);
```

---

## Performance Monitoring

### Using the Performance Profiler

```javascript
import {
    getGlobalProfiler,
    resetGlobalProfiler,
    PerformanceProfiler
} from '../utils/performanceMonitor.js';

// Get global profiler (singleton)
const profiler = getGlobalProfiler();

// Time an operation
const endTimer = profiler.startOperation('createBlock');
// ... create block ...
const duration = endTimer(); // Returns duration in ms

// Record execution step
profiler.recordExecution(executionTime);

// Get execution statistics
const execStats = profiler.getExecutionStats();
console.log(`Average execution time: ${execStats.avgTime.toFixed(2)}ms`);
console.log(`Steps per second: ${execStats.stepsPerSecond.toFixed(1)}`);

// Get operation statistics
const opStats = profiler.getOperationStats('createBlock');
console.log(`Created ${opStats.count} blocks`);
console.log(`Average time: ${opStats.avgTime.toFixed(2)}ms`);

// Get complete summary
const summary = profiler.getSummary();
console.log('Performance Summary:', summary);

// Export metrics
const exportData = profiler.export();
console.log('Export metrics to file:', JSON.stringify(exportData, null, 2));

// Reset profiler
resetGlobalProfiler();
```

### Frame Rate Monitoring

```javascript
import { FrameRateMonitor } from '../utils/performanceMonitor.js';

const fpsMonitor = new FrameRateMonitor();

// In your render loop
function renderLoop() {
    fpsMonitor.recordFrame();

    // ... rendering code ...

    requestAnimationFrame(renderLoop);
}

// Get current FPS
console.log(`FPS: ${fpsMonitor.getFPS()}`);

// Get detailed stats
const stats = fpsMonitor.getStats();
console.log(`FPS: ${stats.fps}`);
console.log(`Avg frame time: ${stats.avgFrameTime}ms`);
console.log(`Min frame time: ${stats.minFrameTime}ms`);
console.log(`Max frame time: ${stats.maxFrameTime}ms`);
```

### Debounce and Throttle

```javascript
import { debounce, throttle } from '../utils/performanceMonitor.js';

// Debounce: Wait for user to stop typing
const debouncedSave = debounce((data) => {
    saveToLocalStorage(data);
}, 500); // Wait 500ms after last change

// Throttle: Update at most once per interval
const throttledUpdate = throttle(() => {
    updateVisualization();
}, 100); // Update at most every 100ms

// Usage
onChange((data) => {
    debouncedSave(data);
    throttledUpdate();
});
```

---

## Complete Examples

### Example 1: Save Network with Metrics

```javascript
import { serializeNetwork, exportToFile } from '../utils/networkSerializer.js';
import { calculateNetworkStats, collectNetworkMetrics } from '../utils/wasmAdvanced.js';
import { getGlobalProfiler } from '../utils/performanceMonitor.js';

function saveNetworkWithMetrics() {
    // Collect metrics
    const metrics = collectNetworkMetrics(network, handleMap);
    const stats = calculateNetworkStats(metrics);

    // Get performance data
    const profiler = getGlobalProfiler();
    const perfSummary = profiler.getSummary();

    // Serialize with metadata
    const serialized = serializeNetwork(nodes, edges, {
        name: 'My Network',
        description: 'Classification network',
        stats: {
            avgSparsity: stats.avgSparsity,
            totalActiveBits: stats.totalActiveBits,
        },
        performance: {
            avgExecutionTime: perfSummary.execution.avgTime,
            stepsPerSecond: perfSummary.execution.stepsPerSecond,
        }
    });

    exportToFile(serialized, 'network-with-metrics.json');
    console.log('Network saved with metrics');
}
```

### Example 2: Validated Network Creation

```javascript
import { createNetwork } from '../utils/wasmBridge.js';
import {
    validateBlockConfig,
    getDefaultBlockConfig,
    batchAddBlocks,
    batchConnectBlocks,
    validateNetworkTopology
} from '../utils/wasmAdvanced.js';

function createValidatedNetwork() {
    const network = createNetwork();

    // Define blocks with defaults
    const blocks = [
        {
            id: 'input',
            type: 'ScalarTransformer',
            config: getDefaultBlockConfig('ScalarTransformer')
        },
        {
            id: 'hidden',
            type: 'PatternPooler',
            config: getDefaultBlockConfig('PatternPooler')
        },
        {
            id: 'output',
            type: 'PatternClassifier',
            config: getDefaultBlockConfig('PatternClassifier')
        }
    ];

    // Validate all configs
    const allValid = blocks.every(({ type, config }) => {
        const validation = validateBlockConfig(type, config);
        if (!validation.valid) {
            console.error(`Invalid config for ${type}:`, validation.errors);
            return false;
        }
        return true;
    });

    if (!allValid) {
        console.error('Network creation aborted due to validation errors');
        return null;
    }

    // Create blocks
    const handleMap = batchAddBlocks(network, blocks);

    // Define connections
    const connections = [
        { source: 'input', target: 'hidden', type: 'input' },
        { source: 'hidden', target: 'output', type: 'input' }
    ];

    // Create connections
    batchConnectBlocks(network, connections, handleMap);

    // Validate topology
    const topologyCheck = validateNetworkTopology(
        blocks.map(b => ({ id: b.id })),
        connections
    );

    if (!topologyCheck.valid) {
        console.warn('Topology warnings:', topologyCheck.warnings);
    }

    console.log('Network created and validated successfully');
    return { network, handleMap };
}
```

### Example 3: Monitored Execution Loop

```javascript
import { executeNetwork } from '../utils/wasmBridge.js';
import { collectNetworkMetrics, calculateNetworkStats } from '../utils/wasmAdvanced.js';
import { getGlobalProfiler } from '../utils/performanceMonitor.js';

function monitoredExecutionLoop() {
    const profiler = getGlobalProfiler();
    let stepCount = 0;

    const execute = () => {
        // Time execution
        const startTime = performance.now();

        executeNetwork(network, learningEnabled);

        const duration = performance.now() - startTime;
        profiler.recordExecution(duration);

        stepCount++;

        // Log metrics every 100 steps
        if (stepCount % 100 === 0) {
            const execStats = profiler.getExecutionStats();
            const metrics = collectNetworkMetrics(network, handleMap);
            const stats = calculateNetworkStats(metrics);

            console.log(`Step ${stepCount}:`);
            console.log(`  Execution: ${execStats.recentAvgTime.toFixed(2)}ms avg`);
            console.log(`  FPS: ${execStats.stepsPerSecond.toFixed(1)}`);
            console.log(`  Sparsity: ${stats.avgSparsity.toFixed(3)}`);
            console.log(`  Active bits: ${stats.totalActiveBits}`);
        }
    };

    // Start loop
    const intervalId = setInterval(execute, speed);

    return () => clearInterval(intervalId);
}
```

---

## Tips & Best Practices

### Performance
- Use batch operations when creating multiple blocks/connections
- Debounce UI updates during rapid state changes
- Use the profiler to identify bottlenecks
- Monitor memory usage for large networks

### Validation
- Always validate configurations before creating blocks
- Check topology before running complex networks
- Validate serialized data before loading

### Persistence
- Use descriptive metadata when saving
- Implement auto-save with debouncing
- Keep multiple network versions for comparison
- Export important networks to files (more permanent than localStorage)

### Monitoring
- Reset profiler between major operations
- Export metrics for analysis
- Monitor both execution and operation timings
- Track memory trends over time

---

## API Reference

See `PHASE4_IMPLEMENTATION_SUMMARY.md` for complete API documentation.

---

## Need Help?

- Check inline JSDoc comments in the source files
- Review the integration examples in PHASE4_IMPLEMENTATION_SUMMARY.md
- Look at existing usage in the application components
