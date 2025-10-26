/**
 * Block Helper Utilities
 *
 * Utilities for working with block definitions and parameters
 */

import { BUILTIN_BLOCKS } from '../stores/customBlockStore';

/**
 * Get default parameters for a block type
 * @param {string} blockType - Block type ID (e.g., 'ScalarTransformer')
 * @returns {Object} Object with default parameter values
 */
export function getBlockDefaults(blockType) {
    // Find the block definition
    const blockDef = BUILTIN_BLOCKS.find(b => b.id === blockType);

    if (!blockDef || !blockDef.params) {
        console.warn(`[Block Helpers] No block definition found for type: ${blockType}`);
        return {};
    }

    // Extract default values from param definitions
    const defaults = {};
    Object.keys(blockDef.params).forEach((paramName) => {
        const paramDef = blockDef.params[paramName];
        if (paramDef.default !== undefined) {
            defaults[paramName] = paramDef.default;
        }
    });

    return defaults;
}

/**
 * Get block definition by type
 * @param {string} blockType - Block type ID
 * @returns {Object|null} Block definition or null
 */
export function getBlockDefinition(blockType) {
    return BUILTIN_BLOCKS.find(b => b.id === blockType) || null;
}
