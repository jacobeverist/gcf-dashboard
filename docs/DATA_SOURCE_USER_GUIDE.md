# Data Source Blocks - User Guide

**Version:** 2.0
**Last Updated:** 2025-10-25

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Data Source Types](#data-source-types)
4. [Using Presets](#using-presets)
5. [Configuring Parameters](#configuring-parameters)
6. [Connecting Data Sources](#connecting-data-sources)
7. [Monitoring During Execution](#monitoring-during-execution)
8. [Saving and Loading](#saving-and-loading)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

### What are Data Source Blocks?

Data Source Blocks generate input data for your Gnomic Computing Framework (GCF) networks. Instead of requiring external data files or sensors, data sources create synthetic data on demand, making it easy to:

- **Test and demonstrate** your networks without external dependencies
- **Experiment** with different input patterns
- **Learn** how different data types affect network behavior
- **Prototype** networks before connecting real data sources

### Two Types of Data Sources

**Scalar Sources** generate continuous numerical data:
- Temperature readings
- Sensor values
- Stock prices
- Any continuous measurement

**Discrete Sources** generate categorical data:
- Days of the week
- State machine states
- Event types
- Any categorized values

---

## Getting Started

### Adding a Data Source to Your Network

1. **Find the Block Palette** on the left side of the screen

2. **Locate Data Source Blocks**:
   - Look for "Scalar Source" (marked with ●)
   - Look for "Discrete Source" (marked with ●)

3. **Drag to Canvas**:
   - Click and hold on a data source type
   - Drag it onto the network canvas
   - Release to place the block

4. **The block appears** with:
   - Type badge (SCALAR or DISCRETE)
   - Default pattern name
   - Output connection handle
   - Enable/disable toggle

### Quick Start Example

Let's create a simple temperature simulation:

1. **Drag** "Scalar Source" to canvas
2. **Click** on the block to select it
3. **In the Parameter Panel** (right side):
   - Find "📋 Preset Patterns" dropdown
   - Select "🌡️ Daily Temperature"
4. **Done!** Your source is now configured to simulate daily temperature cycles

---

## Data Source Types

### Scalar Data Sources

Generate continuous numerical values using mathematical functions.

**Visual Identification:**
- Orange border color
- "SCALAR" badge
- Circle icon (●)

**Common Use Cases:**
- Simulating sensor readings
- Creating test signals
- Generating time-series data
- Testing numerical transformers

**Default Configuration:**
- Pattern: sine
- Amplitude: 10
- Frequency: 0.1
- Offset: 0
- Noise: 0

### Discrete Data Sources

Generate categorical/discrete integer values.

**Visual Identification:**
- Pink border color
- "DISCRETE" badge
- Circle icon (●)

**Common Use Cases:**
- Simulating state machines
- Creating categorical sequences
- Testing discrete transformers
- Generating event streams

**Default Configuration:**
- Pattern: sequential
- Number of Categories: 5
- Change Every: 5 steps
- Noise: 0

---

## Using Presets

### What are Presets?

Presets are pre-configured parameter sets for common data generation patterns. They save time and provide instant access to realistic data scenarios.

### How to Apply a Preset

1. **Select a data source block** by clicking on it
2. **Look for "📋 Preset Patterns"** at the top of the Parameter Panel
3. **Click the dropdown menu**
4. **Select a preset** from the list
5. **All parameters update automatically**

### Scalar Presets

| Preset | Icon | Description | When to Use |
|--------|------|-------------|-------------|
| Daily Temperature | 🌡️ | Simulates daily temperature variation with ~24hr cycle | Testing time-based patterns, demonstrating seasonal effects |
| Smooth Sine Wave | 〰️ | Clean sinusoidal oscillation, no noise | Signal processing, clean test data |
| Noisy Sensor | 📊 | Sensor readings with realistic measurement noise | Realistic sensor simulation, noise handling tests |
| Random Walk | 📈 | Brownian motion, like stock prices | Financial data, unpredictable patterns |
| Square Wave | ⬜ | Alternating high/low signal | Digital signals, on/off patterns |
| Step Function | 📶 | Discrete level changes | Level transitions, threshold testing |
| Linear Ramp | 📐 | Steadily increasing value | Time-based growth, linear trends |
| Gaussian Noise | 🌊 | Pure random noise | Monte Carlo simulations, noise baseline |

### Discrete Presets

| Preset | Icon | Description | When to Use |
|--------|------|-------------|-------------|
| Days of Week | 📅 | Sequential days (0=Mon, 6=Sun) | Calendar patterns, weekly cycles |
| Traffic Light | 🚦 | Cyclic pattern (Green→Yellow→Red→Yellow) | State machines, cyclic patterns |
| Dice Roll | 🎲 | Random 6-sided dice | Random categorical data, game simulations |
| State Machine | ⚙️ | Sequential state transitions with noise | State transitions, error handling |
| Binary Toggle | 🔄 | Alternating 0/1 | On/off patterns, binary states |
| Noisy Counter | 🔢 | Sequential counting with occasional errors | Counting with measurement errors |

### Custom Configuration

If you need different parameters:
1. Select "Custom (no preset)" from the dropdown
2. Manually adjust each parameter (see next section)
3. Your custom configuration is preserved

---

## Configuring Parameters

### Accessing the Parameter Panel

1. **Click** on a data source block to select it
2. **Parameter Panel** appears on the right side
3. **You'll see**:
   - Block information (icon, name, type)
   - Preset selector (if applicable)
   - Pattern selector
   - Parameter sliders

### Scalar Parameters

#### Pattern Type

Dropdown menu with available patterns:
- **sine**: Smooth wave (natural oscillations)
- **square**: Sharp transitions (digital signals)
- **triangle**: Linear ramps (mechanical motion)
- **sawtooth**: Asymmetric ramps (sweep signals)
- **randomWalk**: Unpredictable drift (stock market)
- **gaussian**: Random noise (measurement error)
- **step**: Discrete levels (state changes)
- **linear**: Steady increase (time growth)
- **constant**: Fixed value (control baseline)

#### Amplitude

**Range:** 0 to 100
**Effect:** Controls the height of the wave or variation range
**Example:**
- Amplitude = 5: Values vary ±5 around offset
- Amplitude = 20: Values vary ±20 around offset

**Slider:** Drag to adjust, or click to enter exact value

#### Frequency

**Range:** 0 to 1
**Effect:** Controls how fast the pattern oscillates
**Example:**
- Frequency = 0.01: Very slow changes (100 steps per cycle)
- Frequency = 0.1: Medium speed (10 steps per cycle)
- Frequency = 0.5: Fast changes (2 steps per cycle)

**Tip:** For daily temperature, use ~0.042 (1/24)

#### Offset

**Range:** -100 to 100
**Effect:** Shifts the entire wave up or down (DC offset)
**Example:**
- Offset = 0: Wave centered at zero
- Offset = 20: Wave centered at 20
- Offset = -10: Wave centered at -10

**Use Case:** Setting the average temperature, baseline value, etc.

#### Noise

**Range:** 0 to 10
**Effect:** Adds random Gaussian noise to the signal
**Example:**
- Noise = 0: Perfect clean signal
- Noise = 1: Slight variation (realistic sensor)
- Noise = 5: Significant noise (poor sensor)

**Tip:** Use 1-3 for realistic sensor data

### Discrete Parameters

#### Pattern Type

- **sequential**: 0, 1, 2, 3, ... (counting)
- **cyclic**: 0, 1, 2, 1, 0, 1, 2, ... (triangle)
- **random**: Random uniform selection
- **weighted**: Random with preference for certain values
- **custom**: User-defined sequence (advanced)

#### Number of Categories

**Range:** 2 to 100
**Effect:** How many discrete values to use
**Example:**
- 2: Binary (0, 1)
- 7: Days of week (0-6)
- 10: Digit categories (0-9)

#### Change Every

**Range:** 1 to 50
**Effect:** How many execution steps before changing value
**Example:**
- 1: Changes every step
- 10: Holds value for 10 steps
- 20: Slow transitions

**Tip:** Use higher values for stable state machines

#### Noise

**Range:** 0 to 1 (probability)
**Effect:** Chance of random deviation from pattern
**Example:**
- 0: Perfect pattern
- 0.05: 5% chance of error
- 0.2: 20% chance of error

**Use Case:** Simulating measurement errors, state transition failures

---

## Connecting Data Sources

### Basic Connection

Data sources feed input to Transformer blocks:

1. **Place both blocks** on canvas:
   - Data Source (e.g., Scalar Source)
   - Transformer (e.g., Scalar Transformer)

2. **Find the connection handles**:
   - Data Source: Output handle on the right (circle)
   - Transformer: Input handle on the left (circle)

3. **Drag to connect**:
   - Click and hold on the data source output handle
   - Drag to the transformer input handle
   - Release to create connection

4. **Connection created**:
   - Colored edge appears (orange for scalar, pink for discrete)
   - Edge will animate during execution

### Connection Types

**Scalar → Scalar Transformer**:
- Orange edge
- Sends continuous numerical values
- ✓ Correct connection

**Discrete → Discrete Transformer**:
- Pink edge
- Sends categorical integer values
- ✓ Correct connection

**Scalar → Discrete Transformer**:
- ⚠️ Type mismatch - may cause issues

**Discrete → Scalar Transformer**:
- ⚠️ Type mismatch - may cause issues

**Tip:** Match source type to transformer type for best results

### Multiple Connections

You can:
- **Connect one data source to multiple transformers**
  - Same data feeds multiple blocks
  - Useful for parallel processing

- **Use multiple data sources in one network**
  - Different inputs for different blocks
  - Create complex scenarios

---

## Monitoring During Execution

### Before Execution

When network is stopped, data source blocks show:
- Pattern name
- "Current: ---" (no value yet)
- Static connection edges

### During Execution

Once you click "Start", data sources become active:

#### On the Canvas

**Data Source Nodes:**
- "Current:" field updates in real-time
- Shows the latest generated value
- Updates every execution step

**Connection Edges:**
- Animate with dashed lines
- Orange edges for scalar data
- Pink edges for discrete data
- Visualizes data flow

#### In the Data Panel

**Data Sources Section** (bottom left panel):

**For Scalar Sources:**
- Current value (large text)
- Pattern name
- Mini sparkline plot (last 50 values)
- Min/max labels below plot

**For Discrete Sources:**
- Current value (large text)
- Pattern name
- Number of categories

**Example Display:**
```
┌────────────────────────────────────────┐
│ Temperature Sensor          │ SCALAR │ │
├────────────────────────────────────────┤
│ Pattern: sine              23.45      │
├────────────────────────────────────────┤
│ [Sparkline Plot ─╱─╲─╱─╲──────────] │
│ min: 5.32               max: 35.17    │
└────────────────────────────────────────┘
```

### Interpreting the Visualization

**Sparkline Plot** (scalar sources only):
- Shows history of last 50 values
- X-axis: Time (right = most recent)
- Y-axis: Value (auto-scaled)
- Filled area shows value range
- Dot at end shows current value

**Use Cases:**
- Verify pattern is correct
- Check for unexpected behavior
- Monitor value ranges
- Debug parameter settings

---

## Saving and Loading

### Saving Networks with Data Sources

Your entire network configuration, including all data sources, can be saved.

#### Method 1: Save to File

1. **Click "Save Network"** button in header
2. **Browser downloads** a JSON file (e.g., `network-2025-10-25.json`)
3. **File includes**:
   - All nodes and edges
   - All data source configurations
   - All parameter settings
   - Current demo state

#### Method 2: Auto-Save

- Network automatically saves to browser localStorage
- Happens periodically during execution
- Persists between sessions
- No action required

### Loading Networks with Data Sources

#### Method 1: Load from File

1. **Click "Load Network"** button
2. **Select** your saved JSON file
3. **Network recreates**:
   - All nodes appear in original positions
   - All data sources are recreated
   - All connections are restored
   - All parameters are preserved

#### Method 2: Auto-Load

- On page reload, last auto-saved network may restore automatically
- Check for "Load Autosave" button if available

### What Gets Saved

✓ Data source type (scalar/discrete)
✓ Pattern selection
✓ All parameters (amplitude, frequency, etc.)
✓ Node positions
✓ Connection topology
✓ Value history (last 100 values)

✗ Execution state (paused/running)
✗ Current step number
✗ WASM block internal state

### Version Compatibility

- Networks saved with Data Source Blocks use **format version 2.0**
- Older networks (version 1.0) do not include data sources
- Loading version 1.0 files works, but data sources won't be restored

---

## Common Patterns

### Pattern 1: Simple Test Signal

**Goal:** Generate a clean sine wave for testing

**Steps:**
1. Add Scalar Source
2. Select preset: "🌡️ Daily Temperature" OR "〰️ Smooth Sine Wave"
3. Connect to Scalar Transformer
4. Run and observe in Data Panel

**Use Case:** Baseline testing, signal processing demos

### Pattern 2: Noisy Sensor Data

**Goal:** Simulate realistic sensor with measurement noise

**Steps:**
1. Add Scalar Source
2. Select preset: "📊 Noisy Sensor"
3. Adjust noise level (2-4) for realism
4. Connect to transformer chain
5. Test noise filtering/smoothing algorithms

**Use Case:** Sensor fusion, noise handling, filtering

### Pattern 3: State Machine Input

**Goal:** Feed state transitions to a learner

**Steps:**
1. Add Discrete Source
2. Select preset: "⚙️ State Machine"
3. Set numCategories to match your states
4. Adjust changeEvery for transition speed
5. Connect to Discrete Transformer
6. Run learning algorithm

**Use Case:** State prediction, sequence learning

### Pattern 4: Random Walk

**Goal:** Simulate unpredictable drift (e.g., stock prices)

**Steps:**
1. Add Scalar Source
2. Select preset: "📈 Random Walk"
3. Adjust amplitude for volatility
4. Set offset to starting price (e.g., 100)
5. Observe unpredictable drift

**Use Case:** Financial simulations, anomaly detection

### Pattern 5: Multiple Synchronized Sources

**Goal:** Create complex multi-modal input

**Steps:**
1. Add 2+ data sources with different patterns
2. Configure each uniquely
3. Connect to different transformers
4. Run simultaneously
5. Observe interaction in learner blocks

**Use Case:** Multi-sensor fusion, complex pattern recognition

### Pattern 6: Calendar Simulation

**Goal:** Simulate day-of-week pattern

**Steps:**
1. Add Discrete Source
2. Select preset: "📅 Days of Week"
3. Set changeEvery to steps-per-day (e.g., 100)
4. Connect to Discrete Transformer
5. Learn weekly patterns

**Use Case:** Temporal pattern recognition, calendar effects

---

## Troubleshooting

### Problem: Data source node shows "Current: ---"

**Possible Causes:**
- Network hasn't been initialized yet
- Network hasn't started running
- Execution is paused

**Solution:**
1. Click "Initialize" button
2. Click "Start" button
3. Check if execution is actually running

### Problem: Values don't change during execution

**Possible Causes:**
- Change Every parameter too high (discrete sources)
- Frequency too low (scalar sources)
- Execution speed too fast to observe
- Data source is disabled

**Solution:**
- Increase frequency (scalar)
- Decrease changeEvery (discrete)
- Lower execution speed slider
- Check "Enable" toggle on node

### Problem: Values are out of expected range

**Possible Causes:**
- Amplitude too high/low
- Offset not set correctly
- Noise level too high

**Solution:**
- Adjust amplitude slider
- Set appropriate offset (center point)
- Reduce noise if values are erratic

### Problem: Pattern looks wrong

**Possible Causes:**
- Wrong pattern type selected
- Parameters don't match expected pattern
- Preset wasn't applied correctly

**Solution:**
- Re-select the pattern type
- Try applying a preset that matches your goal
- Reset to default and reconfigure

### Problem: Connection doesn't work

**Possible Causes:**
- Type mismatch (scalar vs discrete)
- Target block doesn't accept data source input
- Connection wasn't completed

**Solution:**
- Check source and target types match
- Ensure target has input handle
- Try reconnecting from scratch

### Problem: Mini plot not showing

**Possible Causes:**
- Data source hasn't generated enough values yet
- This is a discrete source (no plot for discrete)
- Data Panel not visible

**Solution:**
- Let it run longer to build history
- Discrete sources don't show plots (by design)
- Open Data Panel (bottom left)

### Problem: Saved network doesn't restore data sources

**Possible Causes:**
- Network was saved with older version (before data sources)
- JSON file is corrupted
- Browser localStorage is full

**Solution:**
- Check network file version (should be "2.0")
- Try re-saving the network
- Clear browser localStorage if full

### Problem: Execution is slow with data sources

**Possible Causes:**
- Too many data sources (10+)
- Complex pattern calculations
- Browser performance

**Solution:**
- Reduce number of data sources
- Use simpler patterns (sine instead of randomWalk)
- Close other browser tabs
- Lower execution speed

---

## Tips and Best Practices

### Performance Tips

1. **Limit History Size**: Data sources store last 100 values by default (sufficient for visualization)
2. **Use Simpler Patterns**: Sine/square are faster than randomWalk/gaussian
3. **Disable Unused Sources**: Toggle off data sources you're not using

### Workflow Tips

1. **Start with Presets**: Use presets as starting points, then fine-tune
2. **Test Incrementally**: Add one source at a time, verify it works
3. **Name Your Sources**: Give descriptive names when creating blocks
4. **Save Frequently**: Use "Save Network" before making major changes

### Design Tips

1. **Match Types**: Always connect scalar→scalar, discrete→discrete
2. **Realistic Noise**: Use 1-3 for realistic sensor noise, not 0 or 10
3. **Appropriate Frequency**: Match frequency to your simulation timescale
4. **Test Ranges**: Verify value ranges match transformer expectations

### Learning Tips

1. **Experiment**: Try different presets to understand patterns
2. **Watch the Plot**: Sparkline shows what's really happening
3. **Compare Patterns**: Run two sources side-by-side with different patterns
4. **Start Simple**: Begin with "Smooth Sine Wave" before complex patterns

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Delete selected node | Delete / Backspace |
| Select all | Ctrl/Cmd + A |
| Copy | Ctrl/Cmd + C |
| Paste | Ctrl/Cmd + V |
| Undo | Ctrl/Cmd + Z |
| Redo | Ctrl/Cmd + Shift + Z |

---

## Quick Reference

### Scalar Patterns

| Pattern | Equation | Best For |
|---------|----------|----------|
| sine | `amp * sin(2πft) + offset` | Smooth cycles |
| square | `amp * sgn(sin(2πft)) + offset` | Digital signals |
| triangle | `amp * tri(ft) + offset` | Linear ramps |
| randomWalk | `value += random() * amp` | Unpredictable drift |

### Discrete Patterns

| Pattern | Behavior | Best For |
|---------|----------|----------|
| sequential | 0, 1, 2, 3, ... | Counting, cycles |
| cyclic | 0, 1, 2, 1, 0, ... | State machines |
| random | Uniform random | Unpredictable events |
| weighted | Biased random | Realistic distributions |

### Parameter Quick Guide

| Parameter | Typical Range | Effect |
|-----------|---------------|--------|
| Amplitude | 5-20 | Height of variation |
| Frequency | 0.01-0.5 | Speed of changes |
| Offset | 0-100 | Center point |
| Noise | 0-3 | Random variation |
| NumCategories | 2-10 | Number of states |
| ChangeEvery | 5-20 | State duration |

---

## Getting Help

### Resources

- **API Documentation**: See `DATA_SOURCE_API.md` for developer details
- **Implementation Plan**: See `DATA_SOURCE_BLOCKS_PLAN.md` for architecture
- **Phase Reports**: See `PHASE1-4_DATASOURCE_REPORT.md` for development history

### Support

For questions, issues, or feedback:
1. Check this user guide first
2. Review the troubleshooting section
3. Consult the API documentation
4. Contact the development team

---

**Document Version:** 2.0
**Author:** Claude Code
**Last Updated:** 2025-10-25

**Happy Experimenting!** 🎉
