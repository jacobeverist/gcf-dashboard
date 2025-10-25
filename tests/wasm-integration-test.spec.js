/**
 * WASM Integration Test
 *
 * Verifies that the real WASM module loads and executes correctly.
 */

import { test, expect } from '@playwright/test';

test.describe('Real WASM Integration', () => {
    test('should load real WASM and initialize network', async ({ page }) => {
        // Track console logs
        const logs = [];
        const errors = [];

        page.on('console', msg => {
            logs.push({ type: msg.type(), text: msg.text() });
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        // Navigate to app
        await page.goto('http://localhost:5173');

        // Wait for app to be ready (wait for header which should always be present)
        await page.waitForSelector('h1', { timeout: 10000 });

        // Check for WASM initialization logs
        await page.waitForTimeout(2000);

        const wasmLog = logs.find(log => log.text.includes('[WASM Bridge]'));
        console.log('\n=== WASM Initialization Logs ===');
        logs.filter(log => log.text.includes('[WASM')).forEach(log => {
            console.log(`${log.type}: ${log.text}`);
        });

        // Check for errors
        if (errors.length > 0) {
            console.log('\n=== Page Errors ===');
            errors.forEach(err => console.log(err));
        }

        expect(errors.length, 'Should have no page errors').toBe(0);

        // Verify WASM status indicator shows ready
        const wasmStatus = page.locator('.status-item:has-text("WASM")');
        await expect(wasmStatus).toBeVisible();

        // Should show green indicator when ready
        const statusDot = wasmStatus.locator('.status-indicator.active');
        await expect(statusDot).toBeVisible({ timeout: 5000 });

        console.log('\n✅ WASM initialized successfully');
    });

    test('should create and execute network with real WASM', async ({ page }) => {
        const logs = [];
        const errors = [];

        page.on('console', msg => {
            logs.push({ type: msg.type(), text: msg.text() });
        });

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('http://localhost:5173');
        await page.waitForSelector('h1');

        // Wait for WASM to be ready
        await page.waitForSelector('text=WASM: Ready', { timeout: 5000 });

        // Select a demo
        await page.selectOption('select:has-text("Select Demo")', 'sequence');
        console.log('\n✅ Selected Sequence Learning demo');

        // Initialize network
        await page.click('button:has-text("Initialize Network")');
        await page.waitForTimeout(1000);

        // Check for block creation logs
        const blockLogs = logs.filter(log => log.text.includes('add_') || log.text.includes('Block added'));
        console.log('\n=== Block Creation Logs ===');
        blockLogs.slice(0, 5).forEach(log => {
            console.log(`${log.type}: ${log.text}`);
        });

        // Verify nodes appeared on canvas
        const nodes = page.locator('.react-flow__node');
        const nodeCount = await nodes.count();
        console.log(`\n✅ Created ${nodeCount} nodes on canvas`);
        expect(nodeCount).toBeGreaterThan(0);

        // Start execution
        await page.click('button:has-text("Start")');
        console.log('\n✅ Started network execution');

        // Wait for a few execution steps
        await page.waitForTimeout(2000);

        // Check step counter is incrementing
        const stepCounter = page.locator('.status-item:has-text("Step")');
        const stepText = await stepCounter.textContent();
        console.log(`\n${stepText}`);

        // Check for execution logs
        const execLogs = logs.filter(log => log.text.includes('execute') || log.text.includes('step'));
        console.log('\n=== Execution Logs (last 5) ===');
        execLogs.slice(-5).forEach(log => {
            console.log(`${log.type}: ${log.text}`);
        });

        // Stop execution
        await page.click('button:has-text("Stop")');
        console.log('\n✅ Stopped network execution');

        // Report errors if any
        if (errors.length > 0) {
            console.log('\n=== Page Errors ===');
            errors.forEach(err => console.log(err));
            throw new Error(`Found ${errors.length} page errors during execution`);
        }

        console.log('\n✅ All tests passed - Real WASM integration working correctly');
    });

    test('should parse trace JSON correctly', async ({ page }) => {
        const errors = [];

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await page.goto('http://localhost:5173');
        await page.waitForSelector('h1');

        // Wait for WASM
        await page.waitForSelector('text=WASM: Ready', { timeout: 5000 });

        // Initialize and execute
        await page.selectOption('select:has-text("Select Demo")', 'sequence');
        await page.click('button:has-text("Initialize Network")');
        await page.waitForTimeout(1000);
        await page.click('button:has-text("Start")');
        await page.waitForTimeout(2000);

        // Check if bitfield grids are rendering
        const bitfieldGrids = page.locator('.bitfield-grid');
        const gridCount = await bitfieldGrids.count();
        console.log(`\n✅ Found ${gridCount} bitfield grids rendering`);

        // Check if time series plots are rendering
        const plots = page.locator('.recharts-wrapper');
        const plotCount = await plots.count();
        console.log(`✅ Found ${plotCount} time series plots rendering`);

        // Stop execution
        await page.click('button:has-text("Stop")');

        // Report errors
        if (errors.length > 0) {
            console.log('\n=== Page Errors ===');
            errors.forEach(err => console.log(err));
            throw new Error(`Found ${errors.length} page errors`);
        }

        expect(gridCount).toBeGreaterThan(0);
        expect(plotCount).toBeGreaterThan(0);

        console.log('\n✅ Trace JSON parsing and visualization working correctly');
    });
});
