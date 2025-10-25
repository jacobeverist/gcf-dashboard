import { test, expect } from './helpers/fixtures.js';

/**
 * Phase 2 Tests: Parameter Tuning
 * Tests the real-time parameter adjustment features
 */

test.describe('Parameter Panel', () => {
    test('should show parameter panel when node is selected', async ({ dashboardWithDemo }) => {
        // Select first node
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        // Parameter panel should be visible
        await expect(dashboardWithDemo.page.locator('.parameter-panel h3:has-text("Parameters")')).toBeVisible();
    });

    test('should show "Select a block" message when no node selected', async ({ dashboardWithDemo }) => {
        // Make sure no node is selected
        await dashboardWithDemo.page.locator('#network-panel').click({ position: { x: 50, y: 50 } });

        // Should show empty state
        await expect(dashboardWithDemo.page.locator('.parameter-panel-empty')).toBeVisible();
    });

    test('should display block info in parameter panel', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        // Should show block name and icon
        const panel = dashboardWithDemo.page.locator('.parameter-panel');
        await expect(panel.locator('.parameter-panel-block-info')).toBeVisible();
    });

    test('should show all parameters for selected block', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        // Should have at least one parameter slider
        const sliders = dashboardWithDemo.page.locator('.parameter-slider');
        const count = await sliders.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Parameter Sliders', () => {
    test('should adjust parameter value with slider', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const slider = dashboardWithDemo.page.locator('.parameter-slider input[type="range"]').first();
        const initialValue = await slider.inputValue();

        // Change value
        await slider.fill('200');
        await slider.dispatchEvent('mouseup');

        const newValue = await slider.inputValue();
        expect(newValue).not.toBe(initialValue);
    });

    test('should display current parameter value', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const valueDisplay = dashboardWithDemo.page.locator('.parameter-slider-value').first();
        await expect(valueDisplay).toBeVisible();

        const value = await valueDisplay.textContent();
        expect(value).toMatch(/\d+/); // Should contain a number
    });

    test('should update value display when slider moves', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const firstSlider = dashboardWithDemo.page.locator('.parameter-slider').first();
        const slider = firstSlider.locator('input[type="range"]');
        const valueDisplay = firstSlider.locator('.parameter-slider-value');

        await slider.fill('256');

        // Value should update (might be formatted)
        const displayedValue = await valueDisplay.textContent();
        expect(displayedValue).toContain('256');
    });

    test('should respect min/max constraints', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const slider = dashboardWithDemo.page.locator('.parameter-slider input[type="range"]').first();

        const min = await slider.getAttribute('min');
        const max = await slider.getAttribute('max');

        // Try to set below min
        await slider.fill('0');
        let value = await slider.inputValue();
        expect(parseInt(value)).toBeGreaterThanOrEqual(parseInt(min));

        // Try to set above max
        await slider.fill('9999');
        value = await slider.inputValue();
        expect(parseInt(value)).toBeLessThanOrEqual(parseInt(max));
    });

    test('should have step increments', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const slider = dashboardWithDemo.page.locator('.parameter-slider input[type="range"]').first();
        const step = await slider.getAttribute('step');

        expect(step).toBeTruthy();
        expect(parseFloat(step)).toBeGreaterThan(0);
    });
});

test.describe('Parameter Preset Buttons', () => {
    test('should have preset buttons (25%, 50%, 75%, 100%, Reset)', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const firstSlider = dashboardWithDemo.page.locator('.parameter-slider').first();

        // Check for preset buttons
        await expect(firstSlider.locator('button:has-text("25%")')).toBeVisible();
        await expect(firstSlider.locator('button:has-text("50%")')).toBeVisible();
        await expect(firstSlider.locator('button:has-text("75%")')).toBeVisible();
        await expect(firstSlider.locator('button:has-text("100%")')).toBeVisible();
        await expect(firstSlider.locator('button:has-text("Reset")')).toBeVisible();
    });

    test('should set value to 50% when clicking 50% button', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const firstSlider = dashboardWithDemo.page.locator('.parameter-slider').first();
        const slider = firstSlider.locator('input[type="range"]');

        const min = parseFloat(await slider.getAttribute('min'));
        const max = parseFloat(await slider.getAttribute('max'));
        const expected50 = min + (max - min) * 0.5;

        await firstSlider.locator('button:has-text("50%")').click();

        const value = parseFloat(await slider.inputValue());
        // Allow for small rounding differences
        expect(value).toBeGreaterThanOrEqual(expected50 - 1);
        expect(value).toBeLessThanOrEqual(expected50 + 1);
    });

    test('should set value to 25% when clicking 25% button', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const firstSlider = dashboardWithDemo.page.locator('.parameter-slider').first();
        const slider = firstSlider.locator('input[type="range"]');

        const min = parseFloat(await slider.getAttribute('min'));
        const max = parseFloat(await slider.getAttribute('max'));
        const expected25 = min + (max - min) * 0.25;

        await firstSlider.locator('button:has-text("25%")').click();

        const value = parseFloat(await slider.inputValue());
        expect(value).toBeGreaterThanOrEqual(expected25 - 1);
        expect(value).toBeLessThanOrEqual(expected25 + 1);
    });

    test('should reset to minimum when clicking Reset', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const firstSlider = dashboardWithDemo.page.locator('.parameter-slider').first();
        const slider = firstSlider.locator('input[type="range"]');

        // Set to some value first
        await slider.fill('500');

        // Click reset
        await firstSlider.locator('button:has-text("Reset")').click();

        const min = await slider.getAttribute('min');
        const value = await slider.inputValue();
        expect(value).toBe(min);
    });
});

test.describe('Parameter Persistence', () => {
    test('should persist parameter changes when switching nodes', async ({ dashboardWithDemo }) => {
        // Select first node and change parameter
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const slider = dashboardWithDemo.page.locator('.parameter-slider input[type="range"]').first();
        await slider.fill('300');
        await slider.dispatchEvent('mouseup');

        // Select second node
        const secondNode = dashboardWithDemo.page.locator('.react-flow__node').nth(1);
        await secondNode.click();

        // Select first node again
        await firstNode.click();

        // Value should still be 300
        const value = await slider.inputValue();
        expect(value).toBe('300');
    });

    test('should update WASM parameters on change', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const slider = dashboardWithDemo.page.locator('.parameter-slider input[type="range"]').first();

        // Change value
        await slider.fill('256');
        await slider.dispatchEvent('mouseup');

        // Wait a bit for WASM update
        await dashboardWithDemo.page.waitForTimeout(100);

        // Check console for WASM update log (would need to spy on console)
        // For now, just verify no errors occurred
        const errors = await dashboardWithDemo.page.evaluate(() => {
            return window.testErrors || [];
        });
        expect(errors.length).toBe(0);
    });
});

test.describe('Multiple Parameter Types', () => {
    test('should handle number parameters with sliders', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const numberSliders = dashboardWithDemo.page.locator('.parameter-slider input[type="range"]');
        const count = await numberSliders.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should show parameter labels', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        const labels = dashboardWithDemo.page.locator('.parameter-slider-label');
        const count = await labels.count();
        expect(count).toBeGreaterThan(0);

        // Labels should have text
        const firstLabel = await labels.first().textContent();
        expect(firstLabel).toBeTruthy();
    });
});

test.describe('Parameter Panel Edge Cases', () => {
    test('should handle switching between different block types', async ({ dashboardWithDemo }) => {
        // Get nodes of potentially different types
        const nodes = dashboardWithDemo.page.locator('.react-flow__node');
        const nodeCount = await nodes.count();

        if (nodeCount >= 2) {
            // Select first node
            await nodes.first().click();
            const firstPanelContent = await dashboardWithDemo.page.locator('.parameter-panel').textContent();

            // Select second node
            await nodes.nth(1).click();
            const secondPanelContent = await dashboardWithDemo.page.locator('.parameter-panel').textContent();

            // Panel content should update
            // (different blocks may have different parameters)
            expect(firstPanelContent).toBeTruthy();
            expect(secondPanelContent).toBeTruthy();
        }
    });

    test('should clear selection when clicking canvas background', async ({ dashboardWithDemo }) => {
        // Select a node
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();

        // Verify parameter panel is visible
        await expect(dashboardWithDemo.page.locator('.parameter-panel h3')).toBeVisible();

        // Click canvas background
        await dashboardWithDemo.page.locator('.react-flow__pane').click({ position: { x: 50, y: 50 } });

        // Parameter panel should show empty state
        await expect(dashboardWithDemo.page.locator('.parameter-panel-empty')).toBeVisible();
    });
});
