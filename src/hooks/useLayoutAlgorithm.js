import { useCallback } from 'react';
import useNetworkStore from '../stores/networkStore';
import { applyHierarchicalLayout } from '../utils/layoutAlgorithms';

/**
 * Hook to apply layout algorithms to the network
 */
export default function useLayoutAlgorithm() {
    const nodes = useNetworkStore((state) => state.nodes);
    const edges = useNetworkStore((state) => state.edges);
    const setNodes = useNetworkStore((state) => state.setNodes);

    /**
     * Apply hierarchical layout to current network
     */
    const applyHierarchical = useCallback(() => {
        if (nodes.length === 0) {
            console.log('[Layout] No nodes to layout');
            return;
        }

        const layoutedNodes = applyHierarchicalLayout(nodes, edges);
        setNodes(layoutedNodes);

        console.log(`[Layout] Applied hierarchical layout to ${nodes.length} nodes`);
    }, [nodes, edges, setNodes]);

    return {
        applyHierarchical,
    };
}
