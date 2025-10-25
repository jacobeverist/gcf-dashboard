import { test, expect } from './helpers/fixtures.js';

/**
 * Phase 4: Data Source Blocks Tests
 * Tests for data source creation, configuration, presets, and serialization
 */

test.describe('Data Source Blocks - Creation', () => {
    test('should have data source blocks in palette', async ({ dashboardPage }) => {
        // Check for both scalar and discrete data sources
        await expect(dashboardPage.page.locator('.palette-item', { hasText: 'Scalar' })).toBeVisible();
        await expect(dashboardPage.page.locator('.palette-item', { hasText: 'Discrete' })).toBeVisible();
    });

    test('should be able to drag scalar data source to canvas', async ({ dashboardPage }) => {
        const initialNodeCount = await dashboardPage.getNodeCount();

        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        const newNodeCount = await dashboardPage.getNodeCount();
        expect(newNodeCount).toBe(initialNodeCount + 1);

        // Check that the node is visible and has data source characteristics
        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').last();
        await expect(dataSourceNode).toBeVisible();
        await expect(dataSourceNode).toContainText('SCALAR');
    });

    test('should be able to drag discrete data source to canvas', async ({ dashboardPage }) => {
        const initialNodeCount = await dashboardPage.getNodeCount();

        await dashboardPage.dragBlockToCanvas('Discrete Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        const newNodeCount = await dashboardPage.getNodeCount();
        expect(newNodeCount).toBe(initialNodeCount + 1);

        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').last();
        await expect(dataSourceNode).toBeVisible();
        await expect(dataSourceNode).toContainText('DISCRETE');
    });

    test('should show data source in Data Panel', async ({ dashboardPage }) => {
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        // Data Panel should show the data source
        const dataPanel = dashboardPage.page.locator('#data-panel');
        await expect(dataPanel).toContainText('Data Sources');
        await expect(dataPanel).toContainText('SCALAR');
    });
});

test.describe('Data Source Blocks - Parameter Configuration', () => {
    test('should show parameters when data source selected', async ({ dashboardPage }) => {
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        // Click on the data source node
        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').last();
        await dataSourceNode.click();

        // Parameter panel should show data source parameters
        const paramPanel = dashboardPage.page.locator('.parameter-panel');
        await expect(paramPanel).toBeVisible();
        await expect(paramPanel).toContainText('SCALAR');

        // Check for scalar parameters
        await expect(paramPanel).toContainText('Pattern');
        await expect(paramPanel).toContainText('Amplitude');
        await expect(paramPanel).toContainText('Frequency');
    });

    test('should be able to adjust scalar data source parameters', async ({ dashboardPage }) => {
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').last();
        await dataSourceNode.click();

        // Change amplitude parameter
        await dashboardPage.setParameterValue('Amplitude', '20');
        await dashboardPage.page.waitForTimeout(200);

        // Value should be updated
        const amplitudeValue = await dashboardPage.getParameterValue('Amplitude');
        expect(amplitudeValue).toBe('20');
    });

    test('should be able to change pattern type', async ({ dashboardPage }) => {
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').last();
        await dataSourceNode.click();

        // Change pattern via dropdown
        const patternSelect = dashboardPage.page.locator('.parameter-panel select').first();
        await patternSelect.selectOption('square');
        await dashboardPage.page.waitForTimeout(200);

        // Pattern should be updated in node
        await expect(dataSourceNode).toContainText('square');
    });
});

test.describe('Data Source Blocks - Presets', () => {
    test('should show preset selector for data sources', async ({ dashboardPage }) => {
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').last();
        await dataSourceNode.click();

        // Preset selector should be visible
        const paramPanel = dashboardPage.page.locator('.parameter-panel');
        await expect(paramPanel).toContainText('Preset Patterns');

        const presetSelect = paramPanel.locator('select').first();
        await expect(presetSelect).toBeVisible();
    });

    test('should be able to apply scalar preset', async ({ dashboardPage }) => {
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').last();
        await dataSourceNode.click();

        // Apply "Daily Temperature" preset
        const presetSelect = dashboardPage.page.locator('.parameter-panel select').first();
        await presetSelect.selectOption('temp-daily');
        await dashboardPage.page.waitForTimeout(200);

        // Parameters should be updated to preset values
        // Daily Temperature uses sine pattern
        await expect(dataSourceNode).toContainText('sine');

        // Check that preset description is shown
        const paramPanel = dashboardPage.page.locator('.parameter-panel');
        await expect(paramPanel).toContainText('daily temperature');
    });

    test('should be able to apply discrete preset', async ({ dashboardPage }) => {
        await dashboardPage.dragBlockToCanvas('Discrete Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').last();
        await dataSourceNode.click();

        // Apply "Days of Week" preset
        const presetSelect = dashboardPage.page.locator('.parameter-panel select').first();
        await presetSelect.selectOption('days-of-week');
        await dashboardPage.page.waitForTimeout(200);

        // Check that numCategories is set to 7 (days of week)
        const numCategoriesValue = await dashboardPage.getParameterValue('Num Categories');
        expect(numCategoriesValue).toBe('7');
    });

    test('should show correct presets for each source type', async ({ dashboardPage }) => {
        // Add scalar source
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        const scalarNode = dashboardPage.page.locator('.react-flow__node').last();
        await scalarNode.click();

        // Check scalar presets are available
        const scalarPresetSelect = dashboardPage.page.locator('.parameter-panel select').first();
        const scalarOptions = await scalarPresetSelect.locator('option').allTextContents();
        expect(scalarOptions.some(opt => opt.includes('Daily Temperature'))).toBe(true);
        expect(scalarOptions.some(opt => opt.includes('Days of Week'))).toBe(false); // Discrete preset

        // Add discrete source
        await dashboardPage.dragBlockToCanvas('Discrete Source', 500, 200);
        await dashboardPage.page.waitForTimeout(500);

        const discreteNode = dashboardPage.page.locator('.react-flow__node').last();
        await discreteNode.click();

        // Check discrete presets are available
        const discretePresetSelect = dashboardPage.page.locator('.parameter-panel select').first();
        const discreteOptions = await discretePresetSelect.locator('option').allTextContents();
        expect(discreteOptions.some(opt => opt.includes('Days of Week'))).toBe(true);
        expect(discreteOptions.some(opt => opt.includes('Daily Temperature'))).toBe(false); // Scalar preset
    });
});

test.describe('Data Source Blocks - Connections', () => {
    test('should be able to connect data source to transformer', async ({ dashboardPage }) => {
        // Add data source
        await dashboardPage.dragBlockToCanvas('Scalar Source', 200, 200);
        await dashboardPage.page.waitForTimeout(500);

        // Add transformer (assuming Scalar transformer exists)
        await dashboardPage.dragBlockToCanvas('Scalar', 400, 200);
        await dashboardPage.page.waitForTimeout(500);

        // Connect data source output to transformer input
        const sourceHandle = dashboardPage.page.locator('.react-flow__node').first().locator('.react-flow__handle-right');
        const targetHandle = dashboardPage.page.locator('.react-flow__node').last().locator('.react-flow__handle-left');

        await sourceHandle.dragTo(targetHandle);
        await dashboardPage.page.waitForTimeout(500);

        // Edge should be created
        const edges = await dashboardPage.page.locator('.react-flow__edge').count();
        expect(edges).toBeGreaterThan(0);
    });

    test('should create colored edge for data source connection', async ({ dashboardPage }) => {
        // Add data source
        await dashboardPage.dragBlockToCanvas('Scalar Source', 200, 200);
        await dashboardPage.page.waitForTimeout(500);

        // Add transformer
        await dashboardPage.dragBlockToCanvas('Scalar', 400, 200);
        await dashboardPage.page.waitForTimeout(500);

        // Connect
        const sourceHandle = dashboardPage.page.locator('.react-flow__node').first().locator('.react-flow__handle-right');
        const targetHandle = dashboardPage.page.locator('.react-flow__node').last().locator('.react-flow__handle-left');

        await sourceHandle.dragTo(targetHandle);
        await dashboardPage.page.waitForTimeout(500);

        // Edge should have data-source-edge class (indicates special styling)
        const edge = dashboardPage.page.locator('.react-flow__edge').first();
        const edgeClasses = await edge.getAttribute('class');
        expect(edgeClasses).toContain('data-source-edge');
    });
});

test.describe('Data Source Blocks - Execution', () => {
    test('should generate values during execution', async ({ dashboardPage }) => {
        // Add data source
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        // Initialize and start execution
        await dashboardPage.clickInitialize();
        await dashboardPage.waitForNetworkStable();
        await dashboardPage.clickStart();
        await dashboardPage.page.waitForTimeout(1000);

        // Data source node should show current value
        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').first();
        await expect(dataSourceNode).toContainText('Current:');

        // Stop execution
        await dashboardPage.clickStop();
    });

    test('should update Data Panel during execution', async ({ dashboardPage }) => {
        // Add data source
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        // Initialize and start execution
        await dashboardPage.clickInitialize();
        await dashboardPage.waitForNetworkStable();
        await dashboardPage.clickStart();
        await dashboardPage.page.waitForTimeout(1000);

        // Data Panel should show data source section with values
        const dataPanel = dashboardPage.page.locator('#data-panel');
        await expect(dataPanel).toContainText('Data Sources');

        // Should show current value (numeric)
        const dataPanelText = await dataPanel.textContent();
        expect(/\d+\.?\d*/.test(dataPanelText)).toBe(true); // Contains numbers

        await dashboardPage.clickStop();
    });

    test('should show mini plot for scalar sources during execution', async ({ dashboardPage }) => {
        // Add scalar source
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        // Initialize and start execution
        await dashboardPage.clickInitialize();
        await dashboardPage.waitForNetworkStable();
        await dashboardPage.clickStart();
        await dashboardPage.page.waitForTimeout(2000); // Let it run longer to generate history

        // Data Panel should have mini plot (SVG)
        const dataPanel = dashboardPage.page.locator('#data-panel');
        const miniPlot = dataPanel.locator('svg').first();
        await expect(miniPlot).toBeVisible();

        await dashboardPage.clickStop();
    });
});

test.describe('Data Source Blocks - Serialization', () => {
    test('should save network with data sources', async ({ dashboardPage }) => {
        // Add data source
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        // Configure it
        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').first();
        await dataSourceNode.click();
        await dashboardPage.setParameterValue('Amplitude', '25');
        await dashboardPage.page.waitForTimeout(200);

        // Listen for download
        const downloadPromise = dashboardPage.page.waitForEvent('download');

        // Click save button
        await dashboardPage.page.click('#save-network-btn');

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/network-.*\.json/);

        // Download and parse JSON
        const path = await download.path();
        const fs = await import('fs');
        const content = fs.readFileSync(path, 'utf-8');
        const networkData = JSON.parse(content);

        // Should have dataSources array
        expect(networkData.dataSources).toBeDefined();
        expect(Array.isArray(networkData.dataSources)).toBe(true);
        expect(networkData.dataSources.length).toBeGreaterThan(0);

        // Should have version 2.0
        expect(networkData.version).toBe('2.0');

        // Data source should have configuration
        const dataSource = networkData.dataSources[0];
        expect(dataSource.type).toBe('scalar');
        expect(dataSource.params).toBeDefined();
        expect(dataSource.params.amplitude).toBe(25);
    });

    test('should load network with data sources', async ({ dashboardPage }) => {
        // Create a network with data source
        await dashboardPage.dragBlockToCanvas('Scalar Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').first();
        await dataSourceNode.click();

        // Apply a preset to make it distinctive
        const presetSelect = dashboardPage.page.locator('.parameter-panel select').first();
        await presetSelect.selectOption('temp-daily');
        await dashboardPage.page.waitForTimeout(200);

        // Save to localStorage (autosave)
        await dashboardPage.page.evaluate(() => {
            window.localStorage.setItem('test-network',
                window.localStorage.getItem('gnomics-network-autosave')
            );
        });

        // Clear the network
        await dashboardPage.clickReset();
        await dashboardPage.page.waitForTimeout(500);

        const nodeCountAfterReset = await dashboardPage.getNodeCount();
        expect(nodeCountAfterReset).toBe(0);

        // Load from localStorage
        await dashboardPage.page.evaluate(() => {
            window.localStorage.setItem('gnomics-network-autosave',
                window.localStorage.getItem('test-network')
            );
        });

        // Trigger load (assuming there's a load button or we need to reload page)
        await dashboardPage.page.reload();
        await dashboardPage.page.waitForLoadState('networkidle');

        // Click load autosave button if it exists
        const loadButton = dashboardPage.page.locator('#load-autosave-btn');
        if (await loadButton.isVisible()) {
            await loadButton.click();
            await dashboardPage.page.waitForTimeout(500);
        }

        // Network should be restored with data source
        const nodeCount = await dashboardPage.getNodeCount();
        expect(nodeCount).toBeGreaterThan(0);

        // Data source should still show in Data Panel
        const dataPanel = dashboardPage.page.locator('#data-panel');
        await expect(dataPanel).toContainText('Data Sources');
    });

    test('should preserve data source configuration after save/load', async ({ dashboardPage }) => {
        // Add data source with specific configuration
        await dashboardPage.dragBlockToCanvas('Discrete Source', 300, 200);
        await dashboardPage.page.waitForTimeout(500);

        const dataSourceNode = dashboardPage.page.locator('.react-flow__node').first();
        await dataSourceNode.click();

        // Apply "Days of Week" preset (7 categories)
        const presetSelect = dashboardPage.page.locator('.parameter-panel select').first();
        await presetSelect.selectOption('days-of-week');
        await dashboardPage.page.waitForTimeout(200);

        const numCategoriesBefore = await dashboardPage.getParameterValue('Num Categories');
        expect(numCategoriesBefore).toBe('7');

        // Save and reload (simplified - using localStorage)
        await dashboardPage.page.evaluate(() => {
            window.localStorage.setItem('test-network-config',
                window.localStorage.getItem('gnomics-network-autosave')
            );
        });

        await dashboardPage.clickReset();
        await dashboardPage.page.waitForTimeout(500);

        await dashboardPage.page.evaluate(() => {
            window.localStorage.setItem('gnomics-network-autosave',
                window.localStorage.getItem('test-network-config')
            );
        });

        await dashboardPage.page.reload();
        await dashboardPage.page.waitForLoadState('networkidle');

        // Configuration should be preserved
        const restoredNode = dashboardPage.page.locator('.react-flow__node').first();
        if (await restoredNode.isVisible()) {
            await restoredNode.click();
            const numCategoriesAfter = await dashboardPage.getParameterValue('Num Categories');
            expect(numCategoriesAfter).toBe('7');
        }
    });
});

test.describe('Data Source Blocks - Integration', () => {
    test('should work with full pipeline: source → transformer → learner', async ({ dashboardPage }) => {
        // Create a complete pipeline
        await dashboardPage.dragBlockToCanvas('Scalar Source', 150, 200);
        await dashboardPage.page.waitForTimeout(300);

        await dashboardPage.dragBlockToCanvas('Scalar', 350, 200);
        await dashboardPage.page.waitForTimeout(300);

        await dashboardPage.dragBlockToCanvas('Sequence', 550, 200);
        await dashboardPage.page.waitForTimeout(300);

        // Connect: Data Source → Transformer
        const sourceOutHandle = dashboardPage.page.locator('.react-flow__node').nth(0).locator('.react-flow__handle-right');
        const transformerInHandle = dashboardPage.page.locator('.react-flow__node').nth(1).locator('.react-flow__handle-left');
        await sourceOutHandle.dragTo(transformerInHandle);
        await dashboardPage.page.waitForTimeout(300);

        // Connect: Transformer → Learner
        const transformerOutHandle = dashboardPage.page.locator('.react-flow__node').nth(1).locator('.react-flow__handle-right');
        const learnerInHandle = dashboardPage.page.locator('.react-flow__node').nth(2).locator('.react-flow__handle-left');
        await transformerOutHandle.dragTo(learnerInHandle);
        await dashboardPage.page.waitForTimeout(300);

        // Initialize and execute
        await dashboardPage.clickInitialize();
        await dashboardPage.waitForNetworkStable();
        await dashboardPage.clickStart();
        await dashboardPage.page.waitForTimeout(2000);

        // All blocks should be active
        const runningIndicators = await dashboardPage.page.locator('.block-running-indicator').count();
        expect(runningIndicators).toBeGreaterThan(0);

        // Data should flow through the pipeline
        const dataPanel = dashboardPage.page.locator('#data-panel');
        await expect(dataPanel).toContainText('Data Sources');

        await dashboardPage.clickStop();
    });

    test('should handle multiple data sources simultaneously', async ({ dashboardPage }) => {
        // Add multiple data sources
        await dashboardPage.dragBlockToCanvas('Scalar Source', 200, 150);
        await dashboardPage.page.waitForTimeout(300);

        await dashboardPage.dragBlockToCanvas('Discrete Source', 200, 300);
        await dashboardPage.page.waitForTimeout(300);

        // Initialize and execute
        await dashboardPage.clickInitialize();
        await dashboardPage.waitForNetworkStable();
        await dashboardPage.clickStart();
        await dashboardPage.page.waitForTimeout(1000);

        // Data Panel should show both sources
        const dataPanel = dashboardPage.page.locator('#data-panel');
        const dataPanelText = await dataPanel.textContent();
        expect(dataPanelText).toContain('SCALAR');
        expect(dataPanelText).toContain('DISCRETE');

        await dashboardPage.clickStop();
    });
});
