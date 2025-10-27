# Embedded Plots in ReactFlow Nodes - Implementation Plan

## Overview

**Goal**: Move time series plots and data visualizations from the DataPanel sidebar into the ReactFlow nodes themselves for better contextual data display.

**Status**: ✅ Implementation Complete
**Date**: 2025-10-26
**Implementation Report**: [embedded-plots-implementation.md](./embedded-plots-implementation.md)

---

## Current Architecture Analysis

### DataPanel Structure (`src/components/layout/DataPanel.jsx`)
Currently displays three main sections:
1. **Metrics Display**: Step counter, block count, data source count
2. **Data Sources Section**: Shows data source nodes with:
   - Current value display
   - DataSourceMiniPlot (sparkline) for scalar sources
   - Pattern and category information
3. **Time Series Plots**: TimeSeriesPlot components for each node with data
4. **Block States**: BitfieldGrid components showing internal states

### NetworkPanel Structure (`src/components/layout/NetworkPanel.jsx`)
- ReactFlow canvas with custom node types
- Nodes rendered via `nodeTypes` registry
- Each node has access to `data` prop containing node information

### Custom Node Components
- **BaseNode**: Generic node with header, state preview, port indicators
- **DataSourceNode**: Specialized for data sources, shows current value
- Both use memo() for performance optimization

### Data Flow
- **Visualization Store** (`useVisualizationStore`): Stores `timeSeriesData` and `bitfieldData` keyed by node ID
- **Data Source Store** (`useDataSourceStore`): Manages data source values and history
- **Network Store** (`useNetworkStore`): Manages nodes and edges state

---

## Is This Possible?

**Yes!** ReactFlow fully supports embedding arbitrary React components (including charts) inside custom nodes. This is a common pattern for creating rich, data-driven node visualizations.

### Benefits
- **Better Context**: Data visualization directly adjacent to the node
- **Cleaner UI**: Less sidebar clutter
- **Scalability**: Each node shows its own data, easier to manage large networks
- **Focus**: Users can see data for selected/relevant nodes without searching sidebar

### Challenges
1. **Node Size**: Nodes will be larger to accommodate plots
2. **Performance**: Many nodes with live-updating plots might impact performance
3. **Drag Interaction**: Plots shouldn't interfere with node dragging
4. **Zoom Level**: Need to ensure plots remain readable at different zoom levels

---

## Implementation Plan

### Phase 1: Create Mini Plot Components

**Goal**: Build lightweight, node-optimized visualization components

**Tasks**:
1. Create `NodeTimeSeriesPlot.jsx` - Compact version of TimeSeriesPlot
   - Smaller dimensions (width: 200px, height: 80px)
   - Minimal axes and labels
   - Optional: Expandable on hover/click
   - Performance optimized (no animations by default)

2. Create `NodeBitfieldPreview.jsx` - Compact bitfield display
   - Inline bit display (smaller grid)
   - Show only key bits or summary

3. Create `NodeDataSourcePreview.jsx` - Enhanced current value display
   - Keep existing sparkline (DataSourceMiniPlot)
   - Add trend indicator

**Files to Create**:
- `src/components/visualizations/NodeTimeSeriesPlot.jsx`
- `src/components/visualizations/NodeBitfieldPreview.jsx`

**Considerations**:
- Use SVG for better scaling at different zoom levels
- Minimize re-renders with proper memoization
- Use `pointer-events: none` on non-interactive parts

---

### Phase 2: Enhance Node Components

**Goal**: Modify existing node components to display embedded visualizations

**Tasks**:
1. **Update BaseNode.jsx**:
   - Add optional `plotData` section below node header
   - Conditionally render NodeTimeSeriesPlot when `data.plotData` exists
   - Add optional `bitfieldPreview` section
   - Conditionally render NodeBitfieldPreview when `data.bitfield` exists
   - Add expand/collapse toggle for plots

2. **Update DataSourceNode.jsx**:
   - Already shows current value and pattern
   - Enhance to show more history data inline
   - Keep the sparkline but make it more prominent

3. **Update Other Node Types**:
   - Apply similar changes to TransformerNode.jsx, LearningNode.jsx, TemporalNode.jsx
   - Each should be able to display its relevant visualization

**Node Data Structure** (example):
```javascript
{
  id: 'node-1',
  type: 'ScalarTransformer',
  data: {
    label: 'Transform 1',
    blockType: 'ScalarTransformer',
    wasmHandle: 123,
    hasInput: true,
    hasOutput: true,
    // New fields for embedded plots
    plotData: [
      { step: 0, value: 0.5 },
      { step: 1, value: 0.7 },
      // ...
    ],
    bitfield: [0, 1, 1, 0, ...],
    plotVisible: true, // Toggle for expand/collapse
  }
}
```

**Styling Considerations**:
- Increase node min-width to ~250-300px to accommodate plots
- Add `plot-section` CSS class for consistent styling
- Use CSS variables for theming
- Ensure plots have proper padding/margins

---

### Phase 3: Update Data Flow

**Goal**: Sync visualization data from stores into node data

**Tasks**:
1. **Create Hook: `useNodeVisualizationSync.js`**:
   ```javascript
   // Hook to sync visualization data into node data
   export default function useNodeVisualizationSync() {
     const nodes = useNetworkStore(state => state.nodes);
     const updateNode = useNetworkStore(state => state.updateNode);
     const timeSeriesData = useVisualizationStore(state => state.timeSeriesData);
     const bitfieldData = useVisualizationStore(state => state.bitfieldData);

     useEffect(() => {
       // Sync visualization data to nodes
       nodes.forEach(node => {
         const plotData = timeSeriesData[node.id]?.data;
         const bitfield = bitfieldData[node.id];

         if (plotData || bitfield) {
           updateNode(node.id, {
             plotData,
             bitfield,
           });
         }
       });
     }, [timeSeriesData, bitfieldData, nodes]);
   }
   ```

2. **Update NetworkStore**:
   - Add `updateNodeData(nodeId, dataUpdate)` method
   - Ensure efficient updates (only changed nodes)

3. **Call Hook in App.jsx or NetworkPanel**:
   - Add `useNodeVisualizationSync()` to sync data continuously

**Performance Optimization**:
- Use shallow comparison to avoid unnecessary updates
- Throttle/debounce updates if needed
- Consider memo() for plot components
- Limit plot history (e.g., last 50 points) to keep data size manageable

---

### Phase 4: Refactor DataPanel

**Goal**: Remove or hide redundant plot displays from DataPanel

**Options**:
1. **Option A - Minimal DataPanel**:
   - Keep only metrics display at top
   - Remove Time Series and Block States sections
   - Keep Data Sources section (can show all sources at a glance)

2. **Option B - Hide Plots Section**:
   - Add toggle button to show/hide detailed plots
   - Keep for debugging or detailed analysis

3. **Option C - Summary View**:
   - Show only selected node's detailed plots
   - All other data embedded in nodes

**Recommended**: Option A - Minimal DataPanel
- Cleaner UI
- Data visible where it matters (on the nodes)
- Keep metrics for quick overview

**Tasks**:
1. Remove or comment out Time Series section in DataPanel.jsx
2. Remove or comment out Block States section
3. Keep Metrics Display
4. Consider making Data Sources section collapsible

---

### Phase 5: Styling and UX Enhancements

**Goal**: Ensure great user experience with embedded plots

**Tasks**:
1. **Node Sizing**:
   - Update node CSS for larger default size
   - Add `min-height` and `min-width` for plot accommodation
   - Ensure responsive sizing

2. **Drag Interaction**:
   - Add `pointer-events: none` to plot containers
   - Ensure drag handle works smoothly
   - Test dragging with embedded plots

3. **Expand/Collapse**:
   - Add toggle button in node header
   - Store collapse state in node data
   - Smooth transition animation

4. **Zoom Handling**:
   - Test plots at different zoom levels
   - Consider hiding plots when zoomed out too far
   - Use ReactFlow's `useViewport()` hook to detect zoom level

5. **Selection State**:
   - Highlight selected node's plot
   - Optionally: Show more detailed plot for selected node

6. **Theming**:
   - Ensure plots match existing color scheme
   - Use CSS variables for consistency
   - Dark mode support

**CSS Changes**:
```css
/* Example node styling for embedded plots */
.custom-node {
  min-width: 280px;
  max-width: 320px;
}

.node-plot-section {
  margin-top: 8px;
  padding: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  pointer-events: none; /* Prevent interference with dragging */
}

.node-plot-toggle {
  pointer-events: auto; /* Allow clicking toggle */
  cursor: pointer;
}
```

---

### Phase 6: Testing and Performance

**Goal**: Ensure smooth performance and correct functionality

**Tasks**:
1. **Functional Testing**:
   - Create network with multiple nodes
   - Verify plots display correct data
   - Test real-time updates during execution
   - Test expand/collapse functionality
   - Test node dragging with plots visible

2. **Performance Testing**:
   - Test with 10+ nodes with plots
   - Monitor frame rate during execution loop
   - Profile React rendering with DevTools
   - Optimize if needed (virtualization, throttling)

3. **Edge Cases**:
   - No data available (show empty state)
   - Data source nodes vs transformer nodes
   - Newly added nodes (no history yet)
   - Deleted nodes cleanup

4. **Cross-browser Testing**:
   - Test on Chrome, Firefox, Safari
   - Verify SVG rendering

---

## Technical Considerations

### ReactFlow Integration
- ReactFlow handles positioning and rendering of nodes
- Custom node components receive `data`, `selected`, `id` props
- Use `<NodeResizer>` component if nodes should be user-resizable

### Performance Optimization Strategies
1. **Memoization**: Use `memo()` on all plot components
2. **Data Limiting**: Show only recent N data points
3. **Conditional Rendering**: Only render plots for visible nodes (viewport culling)
4. **RAF Throttling**: Throttle updates to animation frame rate
5. **Virtual Rendering**: Consider react-window if many nodes

### Data Synchronization
- Store visualization data in stores (current approach)
- Sync to node data on each execution step
- Avoid duplicating large datasets
- Use references where possible

---

## Migration Strategy

### Backward Compatibility
- Keep DataPanel code initially (commented out)
- Add feature flag to toggle between modes
- Test both configurations

### Rollout Steps
1. Implement Phase 1 & 2 (components)
2. Test in isolation with mock data
3. Implement Phase 3 (data flow)
4. Test with live data
5. Implement Phase 4 (refactor DataPanel)
6. User testing
7. Polish (Phase 5)
8. Deploy

---

## Success Metrics

- [ ] Plots display correctly inside nodes
- [ ] Real-time updates work smoothly
- [ ] Node dragging is not impacted
- [ ] Performance is acceptable (60fps at zoom 1.0 with 10+ nodes)
- [ ] Code is maintainable and well-documented
- [ ] UI is intuitive and visually appealing

---

## Future Enhancements

1. **Expandable Plots**: Click node to open modal with full-size plot
2. **Plot Types**: Support different visualization types per node type
3. **Minimap Previews**: Show mini plots in ReactFlow minimap
4. **Export**: Export individual node plots as images
5. **Comparison View**: Side-by-side comparison of multiple nodes
6. **Animation**: Subtle animations when data updates

---

## Questions to Consider

1. Should all nodes show plots by default, or only selected nodes?
2. Should plot visibility be user-configurable?
3. What should minimum/maximum node sizes be?
4. Should plots be interactive (clickable, hoverable tooltips)?
5. How to handle very large networks (100+ nodes)?

---

## Conclusion

Embedding plots in ReactFlow nodes is definitely feasible and will provide a better user experience by showing data in context. The implementation requires careful attention to performance and UX, but the architecture supports this pattern well.

**Recommended Next Step**: Start with Phase 1 (creating mini plot components) and test them in isolation before integrating into nodes.
