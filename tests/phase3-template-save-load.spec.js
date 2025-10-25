import { test, expect } from './helpers/fixtures.js';

/**
 * Phase 3 Tests: Template Save and Load
 * Tests template creation, saving, and loading functionality
 */

test.describe('Template Gallery Access', () => {
    test('should open template gallery when clicking Templates button', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();
        await expect(dashboardPage.page.locator('.modal-content:has-text("Template Gallery")')).toBeVisible();
    });

    test('should close template gallery when clicking X', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();
        await dashboardPage.closeModal();
        await expect(dashboardPage.page.locator('.modal-overlay')).not.toBeVisible();
    });

    test('should show built-in templates by default', async ({ dashboardPage, templateGallery }) => {
        await dashboardPage.openTemplateGallery();

        // Should have at least the 4 built-in templates
        const count = await templateGallery.getTemplateCount();
        expect(count).toBeGreaterThanOrEqual(4);
    });
});

test.describe('Save Network as Template', () => {
    test('should open save dialog when clicking Save Current Network', async ({ dashboardWithDemo }) => {
        await dashboardWithDemo.openTemplateGallery();
        await dashboardWithDemo.page.click('button:has-text("Save Current Network")');

        await expect(dashboardWithDemo.page.locator('.modal-content:has-text("Save as Template")')).toBeVisible();
    });

    test('should save template with metadata', async ({ dashboardWithDemo, templateGallery }) => {
        const templateData = {
            name: 'Test Template',
            description: 'A test template for automated testing',
            tags: ['test', 'automated'],
            category: 'Custom'
        };

        await dashboardWithDemo.saveCurrentNetworkAsTemplate(templateData);

        // Verify template appears in gallery
        await expect(dashboardWithDemo.page.locator('.template-card', { hasText: templateData.name })).toBeVisible();
    });

    test('should validate required fields', async ({ dashboardWithDemo }) => {
        await dashboardWithDemo.openTemplateGallery();
        await dashboardWithDemo.page.click('button:has-text("Save Current Network")');

        // Try to save without name
        await dashboardWithDemo.page.click('button:has-text("Save Template")');

        // Should show error
        await expect(dashboardWithDemo.page.locator('.error-message')).toBeVisible();
    });

    test('should enforce name length limit', async ({ dashboardWithDemo }) => {
        await dashboardWithDemo.openTemplateGallery();
        await dashboardWithDemo.page.click('button:has-text("Save Current Network")');

        const longName = 'A'.repeat(100);
        await dashboardWithDemo.page.fill('#template-name', longName);
        await dashboardWithDemo.page.click('button:has-text("Save Template")');

        await expect(dashboardWithDemo.page.locator('.error-message:has-text("50 characters")')).toBeVisible();
    });

    test('should enforce description length limit', async ({ dashboardWithDemo }) => {
        await dashboardWithDemo.openTemplateGallery();
        await dashboardWithDemo.page.click('button:has-text("Save Current Network")');

        const longDesc = 'A'.repeat(300);
        await dashboardWithDemo.page.fill('#template-description', longDesc);

        // Should show character count
        await expect(dashboardWithDemo.page.locator('.help-text:has-text("/200")')).toBeVisible();
    });

    test('should allow adding multiple tags', async ({ dashboardWithDemo }) => {
        await dashboardWithDemo.openTemplateGallery();
        await dashboardWithDemo.page.click('button:has-text("Save Current Network")');

        const tags = ['tag1', 'tag2', 'tag3'];

        for (const tag of tags) {
            await dashboardWithDemo.page.fill('#template-tags', tag);
            await dashboardWithDemo.page.press('#template-tags', 'Enter');
        }

        // Verify all tags appear
        for (const tag of tags) {
            await expect(dashboardWithDemo.page.locator('.template-tag', { hasText: tag })).toBeVisible();
        }
    });

    test('should allow removing tags', async ({ dashboardWithDemo }) => {
        await dashboardWithDemo.openTemplateGallery();
        await dashboardWithDemo.page.click('button:has-text("Save Current Network")');

        // Add a tag
        await dashboardWithDemo.page.fill('#template-tags', 'removeme');
        await dashboardWithDemo.page.press('#template-tags', 'Enter');

        // Remove it
        await dashboardWithDemo.page.locator('.tag-remove').click();

        // Tag should be gone
        await expect(dashboardWithDemo.page.locator('.template-tag', { hasText: 'removeme' })).not.toBeVisible();
    });

    test('should persist templates in localStorage', async ({ dashboardWithDemo }) => {
        const templateData = {
            name: 'Persistent Template',
            description: 'Should persist after reload',
            tags: ['persistent'],
            category: 'Custom'
        };

        await dashboardWithDemo.saveCurrentNetworkAsTemplate(templateData);
        await dashboardWithDemo.closeModal();

        // Reload page
        await dashboardWithDemo.page.reload();
        await dashboardWithDemo.page.waitForLoadState('networkidle');

        // Open gallery again
        await dashboardWithDemo.openTemplateGallery();

        // Template should still be there
        await expect(dashboardWithDemo.page.locator('.template-card', { hasText: templateData.name })).toBeVisible();
    });
});

test.describe('Load Template', () => {
    test('should load built-in template', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        // Load first built-in template
        const firstTemplate = dashboardPage.page.locator('.template-card').first();
        await firstTemplate.locator('button:has-text("Load")').click();

        // Wait for gallery to close
        await dashboardPage.page.waitForSelector('.modal-overlay', { state: 'hidden' });

        // Network should have nodes
        const nodeCount = await dashboardPage.getNodeCount();
        expect(nodeCount).toBeGreaterThan(0);
    });

    test('should clear current network before loading template', async ({ dashboardWithDemo }) => {
        const initialNodeCount = await dashboardWithDemo.getNodeCount();
        expect(initialNodeCount).toBeGreaterThan(0);

        await dashboardWithDemo.openTemplateGallery();

        // Load a different template
        const templates = dashboardWithDemo.page.locator('.template-card');
        await templates.nth(1).locator('button:has-text("Load")').click();

        await dashboardWithDemo.page.waitForSelector('.modal-overlay', { state: 'hidden' });

        // Network should be updated (may have different node count)
        const newNodeCount = await dashboardWithDemo.getNodeCount();
        expect(newNodeCount).toBeGreaterThan(0);
    });

    test('should preserve template network structure', async ({ dashboardPage, templateGallery }) => {
        await dashboardPage.openTemplateGallery();

        // Get stats from template card
        const firstTemplate = dashboardPage.page.locator('.template-card').first();
        const expectedNodes = await firstTemplate.locator('.template-stat-value').nth(0).textContent();

        // Load template
        await firstTemplate.locator('button:has-text("Load")').click();
        await dashboardPage.page.waitForSelector('.modal-overlay', { state: 'hidden' });

        // Verify node count matches
        const actualNodes = await dashboardPage.getNodeCount();
        expect(actualNodes).toBe(parseInt(expectedNodes));
    });

    test('should load saved custom template', async ({ dashboardWithDemo, templateGallery }) => {
        // Save current network
        const templateData = {
            name: 'Custom Load Test',
            description: 'Test loading custom template',
            tags: ['custom', 'test'],
            category: 'Custom'
        };

        await dashboardWithDemo.saveCurrentNetworkAsTemplate(templateData);

        // Get node count before clearing
        const expectedNodes = await dashboardWithDemo.getNodeCount();

        // Reset network
        await dashboardWithDemo.closeModal();
        await dashboardWithDemo.clickReset();

        // Verify network is empty
        let nodeCount = await dashboardWithDemo.getNodeCount();
        expect(nodeCount).toBe(0);

        // Load the saved template
        await dashboardWithDemo.openTemplateGallery();
        await dashboardWithDemo.loadTemplate(templateData.name);

        await dashboardWithDemo.page.waitForSelector('.modal-overlay', { state: 'hidden' });

        // Verify network is restored
        nodeCount = await dashboardWithDemo.getNodeCount();
        expect(nodeCount).toBe(expectedNodes);
    });
});

test.describe('Template Metadata', () => {
    test('should display template name', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const firstCard = dashboardPage.page.locator('.template-card').first();
        const title = await firstCard.locator('.template-card-title').textContent();

        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
    });

    test('should display template description', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const firstCard = dashboardPage.page.locator('.template-card').first();
        const description = firstCard.locator('.template-card-description');

        await expect(description).toBeVisible();
    });

    test('should display template tags', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const firstCard = dashboardPage.page.locator('.template-card').first();
        const tags = firstCard.locator('.template-tag');

        const count = await tags.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should display template statistics', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const firstCard = dashboardPage.page.locator('.template-card').first();

        // Should show blocks and connections count
        await expect(firstCard.locator('.template-stat-label:has-text("Blocks")')).toBeVisible();
        await expect(firstCard.locator('.template-stat-label:has-text("Connections")')).toBeVisible();
    });

    test('should display template author and date', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const firstCard = dashboardPage.page.locator('.template-card').first();
        const meta = firstCard.locator('.template-card-meta');

        await expect(meta).toBeVisible();
    });

    test('should show built-in badge on system templates', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const builtinTemplates = dashboardPage.page.locator('.template-card:has(.template-card-badge:has-text("Built-in"))');
        const count = await builtinTemplates.count();

        expect(count).toBeGreaterThanOrEqual(4); // At least 4 built-in templates
    });
});

test.describe('Template Actions', () => {
    test('should not allow deleting built-in templates', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const builtinCard = dashboardPage.page.locator('.template-card').first();
        const deleteButton = builtinCard.locator('button:has-text("🗑️")');

        // Delete button should not exist for built-in
        expect(await deleteButton.count()).toBe(0);
    });

    test('should not allow editing built-in templates', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const builtinCard = dashboardPage.page.locator('.template-card').first();
        const editButton = builtinCard.locator('button:has-text("Edit")');

        // Edit button should not exist for built-in
        expect(await editButton.count()).toBe(0);
    });

    test('should allow editing user templates', async ({ dashboardWithDemo }) => {
        // Create custom template
        const templateData = {
            name: 'Editable Template',
            description: 'Can be edited',
            tags: ['editable'],
            category: 'Custom'
        };

        await dashboardWithDemo.saveCurrentNetworkAsTemplate(templateData);

        // Find the template card
        const card = dashboardWithDemo.page.locator('.template-card', { hasText: templateData.name });

        // Edit button should be visible
        await expect(card.locator('button:has-text("Edit")')).toBeVisible();
    });

    test('should allow deleting user templates', async ({ dashboardWithDemo }) => {
        // Create custom template
        const templateData = {
            name: 'Deletable Template',
            description: 'Can be deleted',
            tags: ['deletable'],
            category: 'Custom'
        };

        await dashboardWithDemo.saveCurrentNetworkAsTemplate(templateData);

        // Find the template card
        const card = dashboardWithDemo.page.locator('.template-card', { hasText: templateData.name });

        // Delete button should be visible
        await expect(card.locator('button:has-text("🗑️")')).toBeVisible();
    });
});
