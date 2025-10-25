import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import useNetworkStore from '../stores/networkStore';

/**
 * Hook for keyboard shortcuts
 */
export default function useKeyboardShortcuts() {
    const reactFlowInstance = useReactFlow();
    const undo = useNetworkStore((state) => state.undo);
    const redo = useNetworkStore((state) => state.redo);
    const removeNode = useNetworkStore((state) => state.removeNode);
    const removeEdge = useNetworkStore((state) => state.removeEdge);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignore if typing in an input
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

            // Undo: Ctrl/Cmd + Z
            if (cmdOrCtrl && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                undo();
                console.log('[Shortcuts] Undo');
                return;
            }

            // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
            if ((cmdOrCtrl && event.shiftKey && event.key === 'z') || (cmdOrCtrl && event.key === 'y')) {
                event.preventDefault();
                redo();
                console.log('[Shortcuts] Redo');
                return;
            }

            // Delete: Delete or Backspace
            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                deleteSelected();
                return;
            }

            // Select All: Ctrl/Cmd + A
            if (cmdOrCtrl && event.key === 'a') {
                event.preventDefault();
                selectAll();
                return;
            }

            // Deselect All: Escape
            if (event.key === 'Escape') {
                deselectAll();
                return;
            }
        };

        const deleteSelected = () => {
            const selectedNodes = reactFlowInstance.getNodes().filter((node) => node.selected);
            const selectedEdges = reactFlowInstance.getEdges().filter((edge) => edge.selected);

            if (selectedNodes.length === 0 && selectedEdges.length === 0) {
                return;
            }

            selectedNodes.forEach((node) => removeNode(node.id));
            selectedEdges.forEach((edge) => removeEdge(edge.id));

            console.log('[Shortcuts] Deleted:', {
                nodes: selectedNodes.length,
                edges: selectedEdges.length,
            });
        };

        const selectAll = () => {
            const nodes = reactFlowInstance.getNodes();
            const edges = reactFlowInstance.getEdges();

            reactFlowInstance.setNodes(
                nodes.map((node) => ({
                    ...node,
                    selected: true,
                }))
            );

            reactFlowInstance.setEdges(
                edges.map((edge) => ({
                    ...edge,
                    selected: true,
                }))
            );

            console.log('[Shortcuts] Select All');
        };

        const deselectAll = () => {
            const nodes = reactFlowInstance.getNodes();
            const edges = reactFlowInstance.getEdges();

            reactFlowInstance.setNodes(
                nodes.map((node) => ({
                    ...node,
                    selected: false,
                }))
            );

            reactFlowInstance.setEdges(
                edges.map((edge) => ({
                    ...edge,
                    selected: false,
                }))
            );

            console.log('[Shortcuts] Deselect All');
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [reactFlowInstance, undo, redo, removeNode, removeEdge]);
}
