# GCF Dashboard Enhancement Plan

## Overview
This document outlines a comprehensive plan to enhance the ReactFlow-based Gnomics network dashboard with advanced UX, collaboration, and analysis features.

**Current Status:** Core functionality complete (95%)
**Enhancement Phases:** 9 phases, ~31 major tasks
**Estimated Timeline:** 8-12 weeks (1-2 sprints per phase)

---

## Phase 1: UX Enhancements (Priority: HIGH)
**Timeline:** 1 week
**Dependencies:** None
**Complexity:** Low-Medium

### 1.1 Toast Notification System
- **Library:** `react-hot-toast` (already installed ✓)
- **Implementation:**
  ```jsx
  // Create src/utils/notifications.js
  - Success toasts (save, load, operations)
  - Error toasts (validation, WASM errors)
  - Info toasts (shortcuts, tips)
  - Custom toast for undo/redo actions
  ```
- **Integration Points:**
  - All store actions (networkStore, executionStore)
  - File operations (save/load)
  - WASM operations
  - Keyboard shortcuts
- **Files to Modify:**
  - `src/stores/networkStore.js` - Add toast on add/delete/undo/redo
  - `src/stores/executionStore.js` - Add toast on start/stop/errors
  - `src/hooks/useNetworkPersistence.js` - Add toast on save/load
  - `src/hooks/usePaletteDragDrop.js` - Add toast on block drop

### 1.2 Loading Spinners
- **Component:** Create `src/components/ui/LoadingOverlay.jsx`
- **States to Track:**
  - WASM initialization (show on first load)
  - Demo network initialization
  - File save/load operations
  - Network execution (optional, may impact performance)
- **Implementation:**
  - Add `loading` state to executionStore
  - Create reusable LoadingSpinner component
  - Add LoadingOverlay for full-page loading
  - Use React Suspense for code splitting (optional)
- **Files to Create:**
  - `src/components/ui/LoadingSpinner.jsx`
  - `src/components/ui/LoadingOverlay.jsx`
  - `src/styles/loading.css`

### 1.3 Confirmation Dialogs
- **Library:** Build custom modal or use `react-modal` (lightweight)
- **Dialogs Needed:**
  - Delete blocks/edges (with count)
  - Reset network
  - Load network (overwrites current)
  - Clear all (destructive)
- **Component:** `src/components/ui/ConfirmDialog.jsx`
- **Features:**
  - Customizable title, message, actions
  - "Don't ask again" checkbox (stored in localStorage)
  - Keyboard support (Enter/Escape)
- **Files to Create:**
  - `src/components/ui/ConfirmDialog.jsx`
  - `src/hooks/useConfirmDialog.js`
  - `src/styles/dialogs.css`

### 1.4 Enhanced Error Boundary
- **Component:** `src/components/ErrorBoundary.jsx`
- **Features:**
  - Catch React render errors
  - Show friendly error message
  - Recovery options:
    - Reload page
    - Reset to last saved state
    - Clear localStorage and restart
    - Report issue (copy error to clipboard)
  - Log errors to console with stack trace
- **Integration:**
  - Wrap `<App>` in ErrorBoundary
  - Add error tracking hook for WASM errors
- **Files to Create:**
  - `src/components/ErrorBoundary.jsx`
  - `src/utils/errorReporting.js`

---

## Phase 2: Block Management (Priority: HIGH)
**Timeline:** 1-2 weeks
**Dependencies:** Phase 1 (toasts, dialogs)
**Complexity:** Medium

### 2.1 Custom Block Creation UI
- **Feature:** Allow users to create custom block types
- **UI Component:** Modal with form
- **Form Fields:**
  - Block name
  - Block type (transformer/learner/pooler)
  - Icon selection (icon picker)
  - Color selection (color picker)
  - Input/output configuration
  - Default parameters
- **Implementation:**
  ```jsx
  // src/components/modals/CreateBlockModal.jsx
  - Form validation
  - Live preview of block appearance
  - Save to localStorage as custom block type
  - Add to BlockPalette dynamically
  ```
- **Data Structure:**
  ```javascript
  {
    id: 'custom_block_1',
    name: 'My Custom Block',
    type: 'transformer',
    icon: '⚡',
    color: '#FF6B6B',
    inputs: { input: true, context: false },
    defaultParams: { size: 128, threshold: 0.5 }
  }
  ```
- **Files to Create:**
  - `src/components/modals/CreateBlockModal.jsx`
  - `src/components/ui/IconPicker.jsx`
  - `src/components/ui/ColorPicker.jsx`
  - `src/stores/customBlockStore.js`
  - `src/utils/blockTemplates.js`

### 2.2 Block Parameter Tuning Panel
- **Feature:** Edit block parameters in real-time
- **UI:** Right sidebar panel (or modal)
- **When to Show:** On block selection
- **Components:**
  - Number sliders (with min/max/step)
  - Text inputs
  - Checkboxes for boolean params
  - Dropdowns for enums
- **Live Updates:**
  - Update WASM block parameters immediately
  - Show visual feedback on node
  - Option to pause execution during tuning
- **Files to Create:**
  - `src/components/panels/ParameterPanel.jsx`
  - `src/components/ui/ParameterSlider.jsx`
  - `src/hooks/useParameterSync.js`
- **Files to Modify:**
  - `src/App.jsx` - Add ParameterPanel to layout
  - `src/utils/wasmBridge.js` - Add updateBlockParams() method

### 2.3 Parameter Validation & Constraints
- **Feature:** Validate params before applying
- **Validation Types:**
  - Range validation (min/max)
  - Type validation (number/string/boolean)
  - Custom validators (e.g., power of 2)
  - Cross-parameter dependencies
- **UI Feedback:**
  - Red border on invalid input
  - Tooltip showing constraint
  - Disable "Apply" button if invalid
- **Implementation:**
  ```javascript
  // src/utils/parameterValidation.js
  const validators = {
    size: (val) => val > 0 && val <= 1024 && isPowerOf2(val),
    threshold: (val) => val >= 0 && val <= 1
  }
  ```

---

## Phase 3: Templates & Presets (Priority: MEDIUM)
**Timeline:** 1 week
**Dependencies:** Phase 2 (custom blocks)
**Complexity:** Medium

### 3.1 Network Template System
- **Feature:** Save/load network configurations as templates
- **Storage:** localStorage + JSON export
- **Template Structure:**
  ```javascript
  {
    id: 'template_123',
    name: 'Sequence Learning Template',
    description: 'Basic sequence learning with LSTM',
    tags: ['learning', 'sequence', 'beginner'],
    thumbnail: 'data:image/png;base64,...',
    network: { nodes: [...], edges: [...] },
    metadata: {
      author: 'user',
      created: '2025-01-15',
      version: '1.0'
    }
  }
  ```
- **Files to Create:**
  - `src/stores/templateStore.js`
  - `src/utils/templateManager.js`
  - `src/hooks/useTemplates.js`

### 3.2 Template Gallery UI
- **Component:** `src/components/modals/TemplateGallery.jsx`
- **Features:**
  - Grid layout with thumbnails
  - Search/filter by tags
  - Preview on hover
  - Load template button
  - Edit/delete custom templates
- **Sections:**
  - Built-in templates (read-only)
  - User templates (editable)
  - Community templates (future)
- **Files to Create:**
  - `src/components/modals/TemplateGallery.jsx`
  - `src/components/ui/TemplateCard.jsx`
  - `src/styles/gallery.css`

### 3.3 Template Metadata & Thumbnails
- **Thumbnail Generation:**
  - Use `html-to-image` library
  - Capture ReactFlow canvas as PNG
  - Scale down to 300x200px
  - Store as base64 data URL
- **Metadata Editor:**
  - Modal form for editing name/description/tags
  - Tag autocomplete from existing tags
  - Version tracking (increment on save)
- **Files to Create:**
  - `src/utils/thumbnailGenerator.js`
  - `src/components/modals/TemplateMetadataEditor.jsx`

---

## Phase 4: Subnetworks & Groups (Priority: MEDIUM)
**Timeline:** 2 weeks
**Dependencies:** Phase 1, 2
**Complexity:** High

### 4.1 Group/Subnetwork Data Model
- **Concept:** Group multiple blocks into reusable modules
- **Data Structure:**
  ```javascript
  {
    id: 'group_1',
    type: 'group',
    label: 'Feature Extractor',
    nodes: ['node_1', 'node_2', 'node_3'],
    inputs: { 'node_1': 'input' },  // External input mappings
    outputs: { 'node_3': 'output' }, // External output mappings
    collapsed: false,
    position: { x: 100, y: 100 }
  }
  ```
- **Store Changes:**
  - Add `groups` array to networkStore
  - Update node/edge operations to respect groups
  - Add group validation (no circular dependencies)
- **Files to Create:**
  - `src/utils/groupManager.js`
  - `src/types/groupTypes.js`

### 4.2 Visual Grouping UI
- **Implementation Options:**
  1. **Custom Group Node** (Recommended)
     - Collapsible node containing child nodes
     - ReactFlow's `parentNode` property
     - Expand/collapse animation
  2. **Background Rectangle**
     - Visual grouping only
     - Simpler but less functional
- **Features:**
  - Drag to select multiple nodes → "Group" button
  - Double-click group to expand/collapse
  - Move group moves all children
  - Delete group option (keep/delete children)
- **Files to Create:**
  - `src/components/nodes/GroupNode.jsx`
  - `src/hooks/useGrouping.js`
  - `src/styles/groups.css`

### 4.3 Group Export/Import
- **Feature:** Save groups as reusable modules
- **Storage:** Separate from templates (group library)
- **Use Case:**
  - Create "Feature Extractor" group
  - Save to library
  - Drag from library into new network
  - Internal wiring preserved
- **Files to Create:**
  - `src/components/panels/GroupLibrary.jsx`
  - `src/utils/groupSerializer.js`

---

## Phase 5: Visual Programming (Priority: MEDIUM)
**Timeline:** 1-2 weeks
**Dependencies:** Phase 2 (parameter panel)
**Complexity:** Medium-High

### 5.1 Block Code/Logic Editor
- **Feature:** Edit block behavior with simple scripting
- **Use Cases:**
  - Custom transformation functions
  - Conditional logic
  - Data preprocessing
- **UI:** Code editor modal
- **Library:** `react-codemirror` or `monaco-react`
- **Language:** JavaScript (evaluated safely)
- **Safety:**
  - Sandbox execution
  - Whitelist allowed functions
  - Timeout for infinite loops
- **Files to Create:**
  - `src/components/modals/CodeEditorModal.jsx`
  - `src/utils/scriptEvaluator.js`

### 5.2 Real-Time Parameter Sliders
- **Enhancement:** Already partially in Phase 2.2
- **Additional Features:**
  - Preset buttons (25%, 50%, 75%, 100%)
  - Randomize button
  - Reset to default
  - Link sliders (ratio lock)
  - Keyboard shortcuts (arrow keys)
- **Files to Modify:**
  - `src/components/ui/ParameterSlider.jsx`

### 5.3 Visual Feedback for Parameters
- **Feature:** Show param changes on canvas
- **Visual Indicators:**
  - Node size changes with capacity
  - Color intensity with activation level
  - Border thickness with importance
  - Glow effect for modified params
- **Implementation:**
  - Add `modified` flag to node data
  - Animate changes with CSS transitions
  - Show param values on hover
- **Files to Modify:**
  - `src/components/nodes/BaseNode.jsx`
  - `src/styles/nodes.css`

---

## Phase 6: A/B Testing & Comparison (Priority: LOW-MEDIUM)
**Timeline:** 1-2 weeks
**Dependencies:** Phase 3 (templates)
**Complexity:** Medium-High

### 6.1 Multi-Configuration Comparison
- **Feature:** Run multiple network configs simultaneously
- **Data Structure:**
  ```javascript
  {
    experimentId: 'exp_123',
    configurations: [
      { id: 'config_a', network: {...}, params: {...} },
      { id: 'config_b', network: {...}, params: {...} }
    ],
    metrics: { accuracy: [], loss: [], speed: [] }
  }
  ```
- **Files to Create:**
  - `src/stores/experimentStore.js`
  - `src/hooks/useExperiment.js`

### 6.2 Side-by-Side Network Viewer
- **UI:** Split screen layout
- **Features:**
  - 2-4 networks visible at once
  - Synchronized execution
  - Highlighted differences
  - Swap configurations
- **Implementation:**
  - Multiple ReactFlowProvider instances
  - Shared execution loop
  - Grid layout with resize
- **Files to Create:**
  - `src/components/layout/ComparisonView.jsx`
  - `src/components/layout/NetworkViewer.jsx`

### 6.3 Metrics Comparison Dashboard
- **UI:** Bottom panel with charts
- **Metrics:**
  - Execution time per step
  - Memory usage
  - Accuracy/loss curves
  - Custom metrics
- **Charts:** Use Recharts (already installed)
- **Files to Create:**
  - `src/components/panels/MetricsPanel.jsx`
  - `src/components/visualizations/ComparisonChart.jsx`

---

## Phase 7: Version Control (Priority: MEDIUM)
**Timeline:** 2 weeks
**Dependencies:** Phase 1, 3
**Complexity:** High

### 7.1 Version History Data Structure
- **Concept:** Git-like commits for networks
- **Storage:** localStorage + IndexedDB for large histories
- **Data Structure:**
  ```javascript
  {
    commitId: 'abc123',
    parentId: 'xyz789',
    timestamp: 1674567890,
    message: 'Added feature extractor group',
    snapshot: { nodes: [...], edges: [...] },
    diff: { added: [...], removed: [...], modified: [...] }
  }
  ```
- **Files to Create:**
  - `src/stores/versionStore.js`
  - `src/utils/versionControl.js`
  - `src/utils/diffCalculator.js`

### 7.2 Branching UI
- **Feature:** Create experimental branches
- **UI Component:** Timeline/tree view
- **Operations:**
  - Create branch
  - Switch branch
  - Merge branches
  - Cherry-pick commits
- **Visualization:**
  - D3.js or Recharts for tree view
  - Show divergence points
- **Files to Create:**
  - `src/components/panels/VersionPanel.jsx`
  - `src/components/visualizations/VersionTree.jsx`

### 7.3 Visual Diff Viewer
- **Feature:** Show changes between versions
- **UI:** Split view with highlighted changes
- **Change Types:**
  - Nodes added (green)
  - Nodes removed (red)
  - Nodes modified (yellow)
  - Edges added/removed
  - Parameter changes
- **Files to Create:**
  - `src/components/modals/DiffViewer.jsx`
  - `src/utils/networkDiff.js`

---

## Phase 8: Collaborative Features (Priority: LOW)
**Timeline:** 3-4 weeks
**Dependencies:** Backend infrastructure required
**Complexity:** Very High

### 8.1 Real-Time Infrastructure
- **Technologies:**
  - **Yjs** (CRDT library) - Recommended for complex state
  - **Socket.io** - Simpler, good for basic collaboration
  - **Firebase** - Managed backend option
- **Architecture:**
  ```
  Client (React) <-> Yjs Provider <-> Server (Node.js) <-> Database
  ```
- **Files to Create:**
  - Backend server (separate repo)
  - `src/services/collaboration.js`
  - `src/hooks/useCollaboration.js`

### 8.2 Multi-User Presence
- **Features:**
  - Show cursors of other users
  - User avatars/names
  - Active selection indicators
  - User list panel
- **Implementation:**
  - Broadcast cursor position (throttled)
  - Show colored cursors on canvas
  - Highlight selected nodes per user
- **Files to Create:**
  - `src/components/collaboration/UserCursor.jsx`
  - `src/components/collaboration/UserList.jsx`

### 8.3 Comment/Annotation System
- **Feature:** Add comments to blocks and edges
- **UI:**
  - Comment icon on node
  - Click to open comment thread
  - Reply/resolve functionality
- **Data Structure:**
  ```javascript
  {
    commentId: 'comment_123',
    targetId: 'node_5',
    targetType: 'node',
    author: 'user@example.com',
    text: 'This block needs optimization',
    timestamp: 1674567890,
    resolved: false,
    replies: [...]
  }
  ```
- **Files to Create:**
  - `src/components/collaboration/CommentThread.jsx`
  - `src/stores/commentStore.js`

### 8.4 Sharing & Forking
- **Features:**
  - Generate shareable link
  - Public/private visibility
  - Fork to own workspace
  - Version tracking on forks
- **Backend Required:**
  - Network storage
  - User authentication
  - Access control
- **Files to Create:**
  - `src/components/modals/ShareModal.jsx`
  - `src/services/sharingService.js`

### 8.5 Network Gallery
- **Feature:** Discover and share networks
- **UI:**
  - Browse public networks
  - Search/filter by tags
  - Trending/featured networks
  - Like/comment on networks
- **Backend Required:**
  - Database for networks
  - User profiles
  - Search indexing
- **Files to Create:**
  - `src/components/modals/GalleryModal.jsx`
  - `src/services/galleryService.js`

---

## Phase 9: Analysis Tools (Priority: HIGH)
**Timeline:** 2-3 weeks
**Dependencies:** Phase 1
**Complexity:** Medium-High

### 9.1 Performance Profiler
- **Feature:** Measure execution time per block
- **Implementation:**
  - Wrap WASM block execution in timers
  - Track min/max/avg execution time
  - Store rolling window (last 1000 steps)
- **UI:**
  - Show execution time on node hover
  - Flame graph for network
  - Bottleneck highlights (red nodes)
- **Files to Create:**
  - `src/utils/profiler.js`
  - `src/components/visualizations/FlameGraph.jsx`
  - `src/stores/profilerStore.js`

### 9.2 Animated Data Flow
- **Feature:** Visualize data moving through network
- **Implementation:**
  - Particles flowing along edges
  - Color/size based on data magnitude
  - Speed based on execution frequency
- **Library:** CSS animations or Canvas API
- **Files to Create:**
  - `src/components/edges/AnimatedEdge.jsx`
  - `src/utils/dataFlowAnimator.js`
  - `src/styles/animations.css`

### 9.3 Anomaly Inspector
- **Feature:** Drill into anomaly scores
- **UI:**
  - Click anomaly value on node
  - Opens modal with:
    - Time series of anomaly score
    - Input data at anomaly point
    - Expected vs actual output
    - Contribution from each input
- **Files to Create:**
  - `src/components/modals/AnomalyInspector.jsx`
  - `src/utils/anomalyAnalyzer.js`

### 9.4 Learning Curves
- **Feature:** Track learning progress over time
- **Metrics:**
  - Loss/accuracy curves
  - Weight changes
  - Gradient magnitudes
  - Convergence detection
- **UI:**
  - Chart panel showing all metrics
  - Per-block learning curves
  - Export to CSV
- **Files to Create:**
  - `src/components/panels/LearningCurvePanel.jsx`
  - `src/utils/learningMetrics.js`
  - `src/stores/metricsStore.js`

### 9.5 Bottleneck Detection
- **Feature:** Auto-identify slow blocks
- **Analysis:**
  - Execution time analysis
  - Memory usage
  - Update frequency
- **UI:**
  - Warning icon on bottleneck nodes
  - Suggestions panel:
    - "Reduce block size from 512 to 256"
    - "Cache results for 10 steps"
    - "Parallelize with worker threads"
- **Files to Create:**
  - `src/utils/bottleneckDetector.js`
  - `src/components/panels/OptimizationSuggestions.jsx`

---

## Implementation Priorities

### Critical Path (Weeks 1-4)
1. **Phase 1: UX Enhancements** - Foundation for better user experience
2. **Phase 2: Block Management** - Core workflow improvement
3. **Phase 9: Analysis Tools** - High value for users

### High Value (Weeks 5-8)
4. **Phase 3: Templates** - Productivity boost
5. **Phase 4: Subnetworks** - Scalability and reusability
6. **Phase 7: Version Control** - Safety and experimentation

### Future Enhancements (Weeks 9-12+)
7. **Phase 5: Visual Programming** - Advanced users
8. **Phase 6: A/B Testing** - Research workflows
9. **Phase 8: Collaboration** - Requires backend (multi-sprint)

---

## Technical Decisions

### New Dependencies Needed
```json
{
  "dependencies": {
    "react-modal": "^3.16.1",           // Dialogs
    "html-to-image": "^1.11.11",        // Thumbnails
    "react-codemirror": "^1.1.0",       // Code editor
    "d3": "^7.8.5",                     // Advanced visualizations
    "yjs": "^13.6.10",                  // Collaboration (Phase 8)
    "y-websocket": "^1.5.0"             // Yjs provider (Phase 8)
  }
}
```

### State Management Strategy
- **Zustand stores:** Continue using for all app state
- **New stores needed:**
  - customBlockStore
  - templateStore
  - groupStore
  - experimentStore
  - versionStore
  - commentStore
  - profilerStore
  - metricsStore

### File Structure (Proposed)
```
src/
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── ConfirmDialog.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── IconPicker.jsx
│   │   └── ColorPicker.jsx
│   ├── modals/           # Full-screen modals
│   │   ├── CreateBlockModal.jsx
│   │   ├── TemplateGallery.jsx
│   │   ├── CodeEditorModal.jsx
│   │   └── AnomalyInspector.jsx
│   ├── panels/           # Sidebar panels
│   │   ├── ParameterPanel.jsx
│   │   ├── GroupLibrary.jsx
│   │   ├── VersionPanel.jsx
│   │   └── MetricsPanel.jsx
│   └── collaboration/    # Collaboration UI
│       ├── UserCursor.jsx
│       └── CommentThread.jsx
├── utils/
│   ├── notifications.js
│   ├── errorReporting.js
│   ├── groupManager.js
│   ├── versionControl.js
│   ├── profiler.js
│   └── bottleneckDetector.js
└── stores/
    ├── customBlockStore.js
    ├── templateStore.js
    ├── versionStore.js
    └── profilerStore.js
```

---

## Testing Strategy

### Per-Phase Testing
1. **Manual Testing:** User flows for each feature
2. **Unit Tests:** Utilities and store actions (Vitest)
3. **Integration Tests:** Component interactions (React Testing Library)
4. **Performance Tests:** Profile with React DevTools

### Critical Test Cases
- [ ] All toasts appear on correct actions
- [ ] Loading states don't block UI unnecessarily
- [ ] Confirmation dialogs prevent accidental deletions
- [ ] Parameter validation catches all edge cases
- [ ] Templates save/load without data loss
- [ ] Groups maintain internal wiring on copy
- [ ] Version control doesn't corrupt networks
- [ ] Profiler doesn't slow execution significantly
- [ ] Multi-user sync resolves conflicts correctly

---

## Success Metrics

### Phase 1 (UX)
- Zero silent failures (all errors show toast)
- Loading states on all async operations
- 100% of destructive actions have confirmation

### Phase 2 (Blocks)
- Users can create custom blocks in < 2 minutes
- Parameter changes apply in < 100ms
- Zero invalid parameter submissions

### Phase 3 (Templates)
- 5+ built-in templates available
- Template load time < 500ms
- Users create avg 3+ custom templates

### Phase 9 (Analysis)
- Profiler overhead < 5% of execution time
- Bottleneck detection accuracy > 90%
- Learning curves update at 60fps

---

## Risk Assessment

### High Risk
- **Phase 8 (Collaboration):** Requires backend, complex sync logic
  - **Mitigation:** Start with simpler socket.io, not Yjs
  - **Alternative:** Defer to future version

### Medium Risk
- **Phase 4 (Groups):** Complex state management with nested structures
  - **Mitigation:** Thorough testing, simplify UX initially
- **Phase 7 (Version Control):** Storage limits with large histories
  - **Mitigation:** Use IndexedDB, implement pruning

### Low Risk
- **Phase 1, 2, 3, 9:** Well-defined scope, existing libraries

---

## Next Steps

1. **Review this plan** - Confirm priorities and timeline
2. **Set up Phase 1** - Install dependencies, create base components
3. **Implement toasts** - Quick win, immediate UX improvement
4. **Iterate phase-by-phase** - Ship incrementally, gather feedback

---

## Notes
- This plan assumes single-developer implementation
- Collaboration features (Phase 8) may require dedicated backend team
- Each phase can ship independently for incremental value delivery
- Performance optimization should be continuous throughout all phases
