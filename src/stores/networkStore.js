import {create} from 'zustand';
// import {devtools} from 'zustand/middleware'
import {applyNodeChanges, applyEdgeChanges, addEdge} from '@xyflow/react';

const useNetworkStore = create(
    // devtools(
        (set, get) => ({
            // State
            nodes: [],
            edges: [],
            selectedNodes: [],
            selectedEdges: [],
            history: [],
            historyIndex: -1,
            maxHistorySize: 50,

            // Node Management
            setNodes: (nodes) => set({nodes}),

            setEdges: (edges) => set({edges}),

            onNodesChange: (changes) => {
                set({
                    nodes: applyNodeChanges(changes, get().nodes),
                });
            },

            onEdgesChange: (changes) => {
                set({
                    edges: applyEdgeChanges(changes, get().edges),
                });
            },

            onConnect: (connection) => {
                // Determine edge type based on source node
                const sourceNode = get().nodes.find(n => n.id === connection.source);
                const isDataSource = sourceNode?.data?.blockType === 'DiscreteDataSource' ||
                    sourceNode?.data?.blockType === 'ScalarDataSource';

                const edgeType = isDataSource ? 'dataSource' : 'input';
                const edgeData = isDataSource ? {
                    sourceType: sourceNode.data.sourceType,
                    animated: false, // Will be set to true during execution
                } : {};

                set({
                    edges: addEdge({
                        ...connection,
                        type: edgeType,
                        data: edgeData,
                    }, get().edges),
                });

                console.log(`[NetworkStore] Connected ${connection.source} → ${connection.target} (type: ${edgeType})`);
            },

            addNode: (node) => {
                const newNode = {
                    id: `node-${Date.now()}`,
                    ...node,
                    data: {
                        id: `node-${Date.now()}`,
                        ...node.data,
                    },
                };
                set({nodes: [...get().nodes, newNode]});

                // Push to history
                get().pushHistory({
                    type: 'ADD_NODE',
                    nodeId: newNode.id,
                    node: newNode,
                });

                return newNode;
            },

            removeNode: (nodeId) => {
                const node = get().nodes.find((n) => n.id === nodeId);
                if (!node) return;

                set({
                    nodes: get().nodes.filter((n) => n.id !== nodeId),
                    edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
                });

                // Push to history
                get().pushHistory({
                    type: 'REMOVE_NODE',
                    nodeId,
                    node,
                });
            },

            addEdge: (edge) => {
                const newEdge = {
                    id: `edge-${Date.now()}`,
                    ...edge,
                };
                set({edges: [...get().edges, newEdge]});

                // Push to history
                get().pushHistory({
                    type: 'ADD_EDGE',
                    edgeId: newEdge.id,
                    edge: newEdge,
                });

                return newEdge;
            },

            removeEdge: (edgeId) => {
                const edge = get().edges.find((e) => e.id === edgeId);
                if (!edge) return;

                set({
                    edges: get().edges.filter((e) => e.id !== edgeId),
                });

                // Push to history
                get().pushHistory({
                    type: 'REMOVE_EDGE',
                    edgeId,
                    edge,
                });
            },

            updateNodeData: (nodeId, data) => {
                set({
                    nodes: get().nodes.map((node) =>
                        node.id === nodeId
                            ? {...node, data: {...node.data, ...data}}
                            : node
                    ),
                });
            },

            // History Management
            pushHistory: (operation) => {
                const {history, historyIndex, maxHistorySize} = get();

                // Truncate future history if we're not at the end
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(operation);

                // Limit history size
                if (newHistory.length > maxHistorySize) {
                    newHistory.shift();
                }

                set({
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                });
            },

            undo: () => {
                const {history, historyIndex} = get();
                if (historyIndex < 0) return;

                const operation = history[historyIndex];
                get().executeInverseOperation(operation);

                set({historyIndex: historyIndex - 1});
            },

            redo: () => {
                const {history, historyIndex} = get();
                if (historyIndex >= history.length - 1) return;

                const operation = history[historyIndex + 1];
                get().executeOperation(operation);

                set({historyIndex: historyIndex + 1});
            },

            executeOperation: (op) => {
                switch (op.type) {
                    case 'ADD_NODE':
                        set({nodes: [...get().nodes, op.node]});
                        break;
                    case 'REMOVE_NODE':
                        set({
                            nodes: get().nodes.filter((n) => n.id !== op.nodeId),
                            edges: get().edges.filter((e) => e.source !== op.nodeId && e.target !== op.nodeId),
                        });
                        break;
                    case 'ADD_EDGE':
                        set({edges: [...get().edges, op.edge]});
                        break;
                    case 'REMOVE_EDGE':
                        set({edges: get().edges.filter((e) => e.id !== op.edgeId)});
                        break;
                    default:
                        break;
                }
            },

            executeInverseOperation: (op) => {
                switch (op.type) {
                    case 'ADD_NODE':
                        set({
                            nodes: get().nodes.filter((n) => n.id !== op.nodeId),
                            edges: get().edges.filter((e) => e.source !== op.nodeId && e.target !== op.nodeId),
                        });
                        break;
                    case 'REMOVE_NODE':
                        set({nodes: [...get().nodes, op.node]});
                        break;
                    case 'ADD_EDGE':
                        set({edges: get().edges.filter((e) => e.id !== op.edgeId)});
                        break;
                    case 'REMOVE_EDGE':
                        set({edges: [...get().edges, op.edge]});
                        break;
                    default:
                        break;
                }
            },

            clearHistory: () => set({history: [], historyIndex: -1}),

            // Clear all
            reset: () => {
                set({
                    nodes: [],
                    edges: [],
                    selectedNodes: [],
                    selectedEdges: [],
                });
                get().clearHistory();
            },
        })
    // )
);

export default useNetworkStore;
