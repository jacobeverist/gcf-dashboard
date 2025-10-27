/**
 * useNodeVisualizationSync Hook
 *
 * Syncs visualization data from stores into ReactFlow node data.
 * This allows plots and state information to be displayed inside nodes.
 */
import { useEffect } from 'react';
import useNetworkStore from '../stores/networkStore';
import useVisualizationStore from '../stores/visualizationStore';
import useDataSourceStore from '../stores/dataSourceStore';

export default function useNodeVisualizationSync() {
    const nodes = useNetworkStore((state) => state.nodes);
    const updateNodeData = useNetworkStore((state) => state.updateNodeData);
    const timeSeriesData = useVisualizationStore((state) => state.timeSeriesData);
    const bitfieldData = useVisualizationStore((state) => state.bitfieldData);
    const getSourceHistory = useDataSourceStore((state) => state.getSourceHistory);
    const getSourceValue = useDataSourceStore((state) => state.getSourceValue);

    useEffect(() => {
        // Sync visualization data to nodes
        nodes.forEach((node) => {
            let updateNeeded = false;
            const updates = {};

            // Sync time series plot data for WASM blocks
            const plotData = timeSeriesData[node.id]?.data;
            if (plotData && plotData.length > 0) {
                // Check if data has changed (compare lengths and last value)
                const currentPlotData = node.data.plotData;
                if (
                    !currentPlotData ||
                    currentPlotData.length !== plotData.length ||
                    currentPlotData[currentPlotData.length - 1]?.value !== plotData[plotData.length - 1]?.value
                ) {
                    updates.plotData = plotData;
                    updateNeeded = true;
                }
            }

            // Sync bitfield data for WASM blocks
            const bitfield = bitfieldData[node.id];
            if (bitfield && bitfield.length > 0) {
                // Convert to array if it's a Uint8Array
                const bitfieldArray = Array.isArray(bitfield) ? bitfield : Array.from(bitfield);

                // Check if data has changed (simple length check)
                const currentBitfield = node.data.bitfield;
                if (
                    !currentBitfield ||
                    currentBitfield.length !== bitfieldArray.length
                ) {
                    updates.bitfield = bitfieldArray;
                    updateNeeded = true;
                }
            }

            // Sync data source history for data source nodes
            const isDataSource =
                node.data.blockType === 'DiscreteDataSource' ||
                node.data.blockType === 'ScalarDataSource';

            if (isDataSource) {
                const sourceId = node.data.sourceId || node.id;
                const history = getSourceHistory(sourceId, 50); // Last 50 values
                const currentValue = getSourceValue(sourceId);

                // Check if history has changed
                const currentHistory = node.data.history;
                if (
                    !currentHistory ||
                    currentHistory.length !== history.length ||
                    (history.length > 0 && currentHistory[currentHistory.length - 1] !== history[history.length - 1])
                ) {
                    updates.history = history;
                    updateNeeded = true;
                }

                // Update current value
                if (node.data.currentValue !== currentValue) {
                    updates.currentValue = currentValue;
                    updateNeeded = true;
                }
            }

            // Apply updates if needed
            if (updateNeeded) {
                updateNodeData(node.id, updates);
            }
        });
    }, [
        nodes,
        timeSeriesData,
        bitfieldData,
        updateNodeData,
        getSourceHistory,
        getSourceValue,
    ]);
}
