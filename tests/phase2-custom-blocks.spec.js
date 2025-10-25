import { test, expect } from './helpers/fixtures.js';

/**
 * Phase 2 Tests: Custom Block Creation
 * Tests the ability to create, manage, and use custom blocks
 */

test.describe('Custom Block Creation', () => {
    test('should open create block modal when clicking + button', async ({ cleanDashboard }) => {
        await cleanDashboard.openCreateBlockModal();
        await expect(cleanDashboard.page.locator('.modal-content:has-text("Create Custom Block")')).toBeVisible();
    });

    test('should create a custom transformer block', async ({ cleanDashboard }) => {
        const blockData = {
            name: 'Test Transformer',
            type: 'transformer',
            icon: '⚡',
            color: '#FF6B6B'
        };

        await cleanDashboard.createCustomBlock(blockData);

        // Verify block appears in palette
        const paletteItem = cleanDashboard.page.locator('.palette-item', { hasText: blockData.name });
        await expect(paletteItem).toBeVisible();
    });

    test('should create a custom learner block', async ({ cleanDashboard }) => {
        const blockData = {
            name: 'Test Learner',
            type: 'learner',
            icon: '🧠',
            color: '#4ECDC4'
        };

        await cleanDashboard.createCustomBlock(blockData);

        // Verify block appears in correct category
        const learningSection = cleanDashboard.page.locator('.palette-category:has-text("Learning")');
        const blockInSection = learningSection.locator('.palette-item', { hasText: blockData.name });
        await expect(blockInSection).toBeVisible();
    });

    test('should create a custom temporal block', async ({ cleanDashboard }) => {
        const blockData = {
            name: 'Test Temporal',
            type: 'temporal',
            icon: '⬢',
            color: '#95E1D3'
        };

        await cleanDashboard.createCustomBlock(blockData);

        const temporalSection = cleanDashboard.page.locator('.palette-category:has-text("Temporal")');
        const blockInSection = temporalSection.locator('.palette-item', { hasText: blockData.name });
        await expect(blockInSection).toBeVisible();
    });

    test('should validate required fields in create block form', async ({ cleanDashboard }) => {
        await cleanDashboard.openCreateBlockModal();

        // Try to submit without filling name
        await cleanDashboard.page.click('.btn-primary:has-text("Create Block")');

        // Should show error
        await expect(cleanDashboard.page.locator('.error-message')).toBeVisible();

        // Form should still be open
        await expect(cleanDashboard.page.locator('.modal-content:has-text("Create Custom Block")')).toBeVisible();
    });

    test('should show live preview of custom block', async ({ cleanDashboard }) => {
        await cleanDashboard.openCreateBlockModal();

        const blockName = 'Preview Test';
        await cleanDashboard.page.fill('#block-name', blockName);

        // Check preview updates
        const preview = cleanDashboard.page.locator('.block-preview');
        await expect(preview.locator('.block-preview-label', { hasText: blockName })).toBeVisible();
    });

    test('should persist custom blocks after page reload', async ({ cleanDashboard }) => {
        const blockData = {
            name: 'Persistent Block',
            type: 'transformer',
            icon: '💧',
            color: '#F38181'
        };

        await cleanDashboard.createCustomBlock(blockData);

        // Reload page
        await cleanDashboard.page.reload();
        await cleanDashboard.page.waitForLoadState('networkidle');

        // Verify block still exists
        const paletteItem = cleanDashboard.page.locator('.palette-item', { hasText: blockData.name });
        await expect(paletteItem).toBeVisible();
    });

    test('should allow creating multiple custom blocks', async ({ cleanDashboard }) => {
        const blocks = [
            { name: 'Custom Block 1', type: 'transformer', icon: '★', color: '#FF6B6B' },
            { name: 'Custom Block 2', type: 'learner', icon: '●', color: '#4ECDC4' },
            { name: 'Custom Block 3', type: 'temporal', icon: '■', color: '#95E1D3' }
        ];

        for (const block of blocks) {
            await cleanDashboard.createCustomBlock(block);
        }

        // Verify all blocks exist
        for (const block of blocks) {
            const paletteItem = cleanDashboard.page.locator('.palette-item', { hasText: block.name });
            await expect(paletteItem).toBeVisible();
        }
    });

    test('should close modal when clicking cancel', async ({ cleanDashboard }) => {
        await cleanDashboard.openCreateBlockModal();
        await cleanDashboard.page.click('.btn-secondary:has-text("Cancel")');
        await expect(cleanDashboard.page.locator('.modal-overlay')).not.toBeVisible();
    });

    test('should close modal when clicking X button', async ({ cleanDashboard }) => {
        await cleanDashboard.openCreateBlockModal();
        await cleanDashboard.closeModal();
        await expect(cleanDashboard.page.locator('.modal-overlay')).not.toBeVisible();
    });

    test('should enforce name length limit', async ({ cleanDashboard }) => {
        await cleanDashboard.openCreateBlockModal();

        const longName = 'A'.repeat(100);
        await cleanDashboard.page.fill('#block-name', longName);
        await cleanDashboard.page.click('.btn-primary:has-text("Create Block")');

        // Should show error about length
        await expect(cleanDashboard.page.locator('.error-message:has-text("30 characters")')).toBeVisible();
    });
});

test.describe('Custom Block Usage', () => {
    test('should be able to drag custom block to canvas', async ({ cleanDashboard }) => {
        const blockData = {
            name: 'Draggable Block',
            type: 'transformer',
            icon: '🎯',
            color: '#AA96DA'
        };

        await cleanDashboard.createCustomBlock(blockData);

        // Drag to canvas
        await cleanDashboard.dragBlockToCanvas(blockData.name, 400, 300);

        // Verify node appears
        const nodeCount = await cleanDashboard.getNodeCount();
        expect(nodeCount).toBeGreaterThan(0);
    });

    test('should have default parameters for custom blocks', async ({ cleanDashboard, dashboardWithDemo }) => {
        const blockData = {
            name: 'Param Block',
            type: 'transformer',
            icon: '⚙️',
            color: '#FCBAD3'
        };

        await cleanDashboard.createCustomBlock(blockData);
        await cleanDashboard.dragBlockToCanvas(blockData.name, 400, 300);

        // Wait for node to be created
        await cleanDashboard.waitForNetworkStable();

        // Select the node
        const node = cleanDashboard.page.locator('.react-flow__node').last();
        await node.click();

        // Check parameter panel shows parameters
        await expect(cleanDashboard.page.locator('.parameter-panel h3:has-text("Parameters")')).toBeVisible();
    });
});
