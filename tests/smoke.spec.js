import { test, expect } from './helpers/fixtures.js';

/**
 * Smoke Tests
 * Quick sanity checks to verify the application loads and basic features work
 */

test.describe('Application Smoke Tests', () => {
    test('should load the dashboard successfully', async ({ dashboardPage }) => {
        // Page should load
        await expect(dashboardPage.page).toHaveURL(/localhost/);

        // Header should be visible
        await expect(dashboardPage.page.locator('#header h1')).toBeVisible();
    });

    test('should have all main UI elements', async ({ dashboardPage }) => {
        // Block Palette
        await expect(dashboardPage.page.locator('#block-palette')).toBeVisible();

        // Network Panel
        await expect(dashboardPage.page.locator('#network-panel')).toBeVisible();

        // Parameter Panel (sidebar)
        await expect(dashboardPage.page.locator('.parameter-panel')).toBeVisible();

        // Data Panel
        await expect(dashboardPage.page.locator('#data-panel')).toBeVisible();
    });

    test('should have all header controls', async ({ dashboardPage }) => {
        await expect(dashboardPage.page.locator('#demo-select')).toBeVisible();
        await expect(dashboardPage.page.locator('#init-btn')).toBeVisible();
        await expect(dashboardPage.page.locator('#start-btn')).toBeVisible();
        await expect(dashboardPage.page.locator('#stop-btn')).toBeVisible();
        await expect(dashboardPage.page.locator('#reset-btn')).toBeVisible();
        await expect(dashboardPage.page.locator('#template-gallery-btn')).toBeVisible();
    });

    test('should initialize WASM successfully', async ({ dashboardPage }) => {
        // Wait for WASM to initialize
        await dashboardPage.page.waitForTimeout(1000);

        // WASM status should be ready
        const isReady = await dashboardPage.isWasmReady();
        expect(isReady).toBe(true);
    });

    test('should have all built-in block types in palette', async ({ dashboardPage }) => {
        const blockTypes = [
            'Scalar',
            'Discrete',
            'Persistence',
            'Pooler',
            'Classifier',
            'Sequence',
            'Context'
        ];

        for (const blockType of blockTypes) {
            await expect(dashboardPage.page.locator('.palette-item', { hasText: blockType })).toBeVisible();
        }
    });

    test('should have create block button', async ({ dashboardPage }) => {
        await expect(dashboardPage.page.locator('.palette-add-btn')).toBeVisible();
    });

    test('should be able to select and initialize a demo', async ({ dashboardPage }) => {
        await dashboardPage.selectDemo('Sequence Learning');
        await dashboardPage.clickInitialize();
        await dashboardPage.waitForNetworkStable();

        const nodeCount = await dashboardPage.getNodeCount();
        expect(nodeCount).toBeGreaterThan(0);
    });

    test('should start and stop execution', async ({ dashboardWithDemo }) => {
        await dashboardWithDemo.clickStart();
        await dashboardWithDemo.page.waitForTimeout(500);

        let isRunning = await dashboardWithDemo.isRunning();
        expect(isRunning).toBe(true);

        await dashboardWithDemo.clickStop();
        await dashboardWithDemo.page.waitForTimeout(200);

        isRunning = await dashboardWithDemo.isRunning();
        expect(isRunning).toBe(false);
    });

    test('should have no console errors on load', async ({ dashboardPage }) => {
        const errors = [];
        dashboardPage.page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await dashboardPage.page.reload();
        await dashboardPage.page.waitForLoadState('networkidle');
        await dashboardPage.page.waitForTimeout(1000);

        // Filter out expected errors (like missing optional dependencies)
        const unexpectedErrors = errors.filter(error =>
            !error.includes('html-to-image') &&
            !error.includes('Failed to load resource')
        );

        expect(unexpectedErrors.length).toBe(0);
    });
});

test.describe('Phase 2 Smoke Tests', () => {
    test('should be able to open create block modal', async ({ dashboardPage }) => {
        await dashboardPage.openCreateBlockModal();
        await expect(dashboardPage.page.locator('.modal-overlay')).toBeVisible();
    });

    test('should show parameter panel when node selected', async ({ dashboardWithDemo }) => {
        const firstNode = dashboardWithDemo.page.locator('.react-flow__node').first();
        await firstNode.click();
        await expect(dashboardWithDemo.page.locator('.parameter-panel h3')).toBeVisible();
    });
});

test.describe('Phase 3 Smoke Tests', () => {
    test('should be able to open template gallery', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();
        await expect(dashboardPage.page.locator('.modal-content:has-text("Template Gallery")')).toBeVisible();
    });

    test('should have built-in templates', async ({ dashboardPage, templateGallery }) => {
        await dashboardPage.openTemplateGallery();

        const count = await templateGallery.getTemplateCount();
        expect(count).toBeGreaterThanOrEqual(4);
    });

    test('should be able to save current network as template', async ({ dashboardWithDemo }) => {
        await dashboardWithDemo.openTemplateGallery();
        await dashboardWithDemo.page.click('button:has-text("Save Current Network")');
        await expect(dashboardWithDemo.page.locator('.modal-content').filter({ hasText: 'Save as Template' }).last()).toBeVisible();
    });
});
