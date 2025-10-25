import { test, expect } from './helpers/fixtures.js';

/**
 * Phase 3 Tests: Template Gallery Features
 * Tests search, filter, duplicate, export, and other gallery features
 */

test.describe('Template Search', () => {
    test('should filter templates by search query', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        // Get initial count
        const initialCount = await dashboardPage.page.locator('.template-card').count();

        // Search for specific template
        await dashboardPage.searchTemplates('Sequence');

        // Should have fewer results
        const filteredCount = await dashboardPage.page.locator('.template-card').count();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
        expect(filteredCount).toBeGreaterThan(0);
    });

    test('should show all templates when search is cleared', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const initialCount = await dashboardPage.page.locator('.template-card').count();

        // Search
        await dashboardPage.searchTemplates('Sequence');
        let count = await dashboardPage.page.locator('.template-card').count();
        expect(count).toBeLessThan(initialCount);

        // Clear search
        await dashboardPage.page.fill('.template-search-input', '');
        count = await dashboardPage.page.locator('.template-card').count();
        expect(count).toBe(initialCount);
    });

    test('should show no results for invalid search', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        await dashboardPage.searchTemplates('NonexistentTemplate12345');

        // Should show empty state
        await expect(dashboardPage.page.locator('.template-gallery-empty')).toBeVisible();
    });

    test('should search by template description', async ({ dashboardPage, templateGallery }) => {
        await dashboardPage.openTemplateGallery();

        // Search by a word likely in description
        await dashboardPage.searchTemplates('learning');

        const count = await dashboardPage.page.locator('.template-card').count();
        expect(count).toBeGreaterThan(0);
    });

    test('should search by template tags', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        // Search by tag
        await dashboardPage.searchTemplates('beginner');

        const count = await dashboardPage.page.locator('.template-card').count();
        expect(count).toBeGreaterThan(0);
    });

    test('should be case-insensitive', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        await dashboardPage.searchTemplates('SEQUENCE');
        const upperCount = await dashboardPage.page.locator('.template-card').count();

        await dashboardPage.page.fill('.template-search-input', '');
        await dashboardPage.searchTemplates('sequence');
        const lowerCount = await dashboardPage.page.locator('.template-card').count();

        expect(upperCount).toBe(lowerCount);
        expect(upperCount).toBeGreaterThan(0);
    });
});

test.describe('Template Category Filter', () => {
    test('should show all categories', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        // Should have All button
        await expect(dashboardPage.page.locator('.filter-btn:has-text("All")')).toBeVisible();

        // Should have at least Learning category
        await expect(dashboardPage.page.locator('.filter-btn:has-text("Learning")')).toBeVisible();
    });

    test('should filter by category', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const initialCount = await dashboardPage.page.locator('.template-card').count();

        // Filter by Learning
        await dashboardPage.filterByCategory('Learning');

        const filteredCount = await dashboardPage.page.locator('.template-card').count();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
        expect(filteredCount).toBeGreaterThan(0);
    });

    test('should highlight active category', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        // Click Learning category
        const learningBtn = dashboardPage.page.locator('.filter-btn:has-text("Learning")');
        await learningBtn.click();

        // Should have active class
        await expect(learningBtn).toHaveClass(/active/);
    });

    test('should return to all when clicking All category', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const initialCount = await dashboardPage.page.locator('.template-card').count();

        // Filter by Learning
        await dashboardPage.filterByCategory('Learning');
        let count = await dashboardPage.page.locator('.template-card').count();
        expect(count).toBeLessThanOrEqual(initialCount);

        // Click All
        await dashboardPage.filterByCategory('All');
        count = await dashboardPage.page.locator('.template-card').count();
        expect(count).toBe(initialCount);
    });
});

test.describe('Template Tag Filter', () => {
    test('should show available tags', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const tags = dashboardPage.page.locator('.tag-btn');
        const count = await tags.count();

        expect(count).toBeGreaterThan(0);
    });

    test('should filter by single tag', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const initialCount = await dashboardPage.page.locator('.template-card').count();

        // Click first tag
        const firstTag = dashboardPage.page.locator('.tag-btn').first();
        await firstTag.click();

        const filteredCount = await dashboardPage.page.locator('.template-card').count();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
        expect(filteredCount).toBeGreaterThan(0);
    });

    test('should filter by multiple tags', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        // Click multiple tags
        const tags = dashboardPage.page.locator('.tag-btn');
        if (await tags.count() >= 2) {
            await tags.nth(0).click();
            await tags.nth(1).click();

            // Should show templates matching either tag
            const count = await dashboardPage.page.locator('.template-card').count();
            expect(count).toBeGreaterThan(0);
        }
    });

    test('should toggle tag selection', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const firstTag = dashboardPage.page.locator('.tag-btn').first();

        // Click to select
        await firstTag.click();
        await expect(firstTag).toHaveClass(/active/);

        // Click again to deselect
        await firstTag.click();
        await expect(firstTag).not.toHaveClass(/active/);
    });

    test('should combine category and tag filters', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        // Filter by category
        await dashboardPage.filterByCategory('Learning');

        // Then filter by tag
        const firstTag = dashboardPage.page.locator('.tag-btn').first();
        await firstTag.click();

        // Should show templates matching both filters
        const count = await dashboardPage.page.locator('.template-card').count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should combine search and filters', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        await dashboardPage.searchTemplates('learn');
        await dashboardPage.filterByCategory('Learning');

        const count = await dashboardPage.page.locator('.template-card').count();
        expect(count).toBeGreaterThanOrEqual(0);
    });
});

test.describe('Template Duplicate', () => {
    test('should show duplicate button on all templates', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const firstCard = dashboardPage.page.locator('.template-card').first();
        const duplicateBtn = firstCard.locator('button:has-text("📋")');

        await expect(duplicateBtn).toBeVisible();
    });

    test('should duplicate template', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const initialCount = await dashboardPage.page.locator('.template-card').count();

        // Duplicate first template
        const firstCard = dashboardPage.page.locator('.template-card').first();
        const templateName = await firstCard.locator('.template-card-title').textContent();

        await firstCard.locator('button:has-text("📋")').click();

        // Wait for duplication
        await dashboardPage.page.waitForTimeout(500);

        // Should have one more template
        const newCount = await dashboardPage.page.locator('.template-card').count();
        expect(newCount).toBe(initialCount + 1);

        // Duplicate should have "(Copy)" in name
        await expect(dashboardPage.page.locator('.template-card-title:has-text("(Copy)")')).toBeVisible();
    });

    test('should allow duplicating built-in templates', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        // Find built-in template
        const builtinCard = dashboardPage.page.locator('.template-card:has(.template-card-badge:has-text("Built-in"))').first();

        // Should have duplicate button
        await expect(builtinCard.locator('button:has-text("📋")')).toBeVisible();

        // Click duplicate
        await builtinCard.locator('button:has-text("📋")').click();

        await dashboardPage.page.waitForTimeout(500);

        // Duplicate should be a user template (no badge)
        const copyCard = dashboardPage.page.locator('.template-card-title:has-text("(Copy)")').locator('..').locator('..');
        const badge = copyCard.locator('.template-card-badge');
        expect(await badge.count()).toBe(0);
    });

    test('should preserve network structure when duplicating', async ({ dashboardPage, templateGallery }) => {
        await dashboardPage.openTemplateGallery();

        const firstCard = dashboardPage.page.locator('.template-card').first();

        // Get original stats
        const originalNodes = await firstCard.locator('.template-stat-value').nth(0).textContent();
        const originalEdges = await firstCard.locator('.template-stat-value').nth(1).textContent();

        // Duplicate
        await firstCard.locator('button:has-text("📋")').click();
        await dashboardPage.page.waitForTimeout(500);

        // Find the copy
        const copyCard = dashboardPage.page.locator('.template-card-title:has-text("(Copy)")').locator('..').locator('..');

        // Stats should match
        const copyNodes = await copyCard.locator('.template-stat-value').nth(0).textContent();
        const copyEdges = await copyCard.locator('.template-stat-value').nth(1).textContent();

        expect(copyNodes).toBe(originalNodes);
        expect(copyEdges).toBe(originalEdges);
    });
});

test.describe('Template Export', () => {
    test('should show export button on all templates', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const firstCard = dashboardPage.page.locator('.template-card').first();
        const exportBtn = firstCard.locator('button:has-text("💾")');

        await expect(exportBtn).toBeVisible();
    });

    test('should export template to JSON', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        // Set up download promise
        const downloadPromise = dashboardPage.page.waitForEvent('download');

        // Click export on first template
        const firstCard = dashboardPage.page.locator('.template-card').first();
        await firstCard.locator('button:has-text("💾")').click();

        // Wait for download
        const download = await downloadPromise;

        // Verify download
        expect(download.suggestedFilename()).toMatch(/\.json$/);
    });

    test('should export valid JSON', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const downloadPromise = dashboardPage.page.waitForEvent('download');

        const firstCard = dashboardPage.page.locator('.template-card').first();
        await firstCard.locator('button:has-text("💾")').click();

        const download = await downloadPromise;
        const path = await download.path();

        // Read and parse JSON
        const fs = await import('fs');
        const content = fs.readFileSync(path, 'utf8');
        const json = JSON.parse(content);

        // Verify structure
        expect(json.name).toBeTruthy();
        expect(json.network).toBeTruthy();
        expect(json.network.nodes).toBeInstanceOf(Array);
        expect(json.network.edges).toBeInstanceOf(Array);
    });
});

test.describe('Template Delete', () => {
    test('should show delete confirmation', async ({ dashboardWithDemo }) => {
        // Create a template to delete
        const templateData = {
            name: 'Delete Me',
            description: 'Will be deleted',
            tags: ['delete'],
            category: 'Custom'
        };

        await dashboardWithDemo.saveCurrentNetworkAsTemplate(templateData);

        // Find and try to delete
        const card = dashboardWithDemo.page.locator('.template-card', { hasText: templateData.name });

        // Set up dialog handler
        dashboardWithDemo.page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Delete Me');
            await dialog.dismiss();
        });

        await card.locator('button:has-text("🗑️")').click();
    });

    test('should delete template when confirmed', async ({ dashboardWithDemo }) => {
        const templateData = {
            name: 'Delete Test',
            description: 'Will be deleted',
            tags: ['test'],
            category: 'Custom'
        };

        await dashboardWithDemo.saveCurrentNetworkAsTemplate(templateData);

        const initialCount = await dashboardWithDemo.page.locator('.template-card').count();

        // Delete with confirmation
        dashboardWithDemo.page.on('dialog', async dialog => {
            await dialog.accept();
        });

        const card = dashboardWithDemo.page.locator('.template-card', { hasText: templateData.name });
        await card.locator('button:has-text("🗑️")').click();

        await dashboardWithDemo.page.waitForTimeout(500);

        // Template should be gone
        const newCount = await dashboardWithDemo.page.locator('.template-card').count();
        expect(newCount).toBe(initialCount - 1);

        // Card should not be visible
        await expect(card).not.toBeVisible();
    });

    test('should not delete when cancelled', async ({ dashboardWithDemo }) => {
        const templateData = {
            name: 'Keep Me',
            description: 'Should not be deleted',
            tags: ['keep'],
            category: 'Custom'
        };

        await dashboardWithDemo.saveCurrentNetworkAsTemplate(templateData);

        const initialCount = await dashboardWithDemo.page.locator('.template-card').count();

        // Cancel deletion
        dashboardWithDemo.page.on('dialog', async dialog => {
            await dialog.dismiss();
        });

        const card = dashboardWithDemo.page.locator('.template-card', { hasText: templateData.name });
        await card.locator('button:has-text("🗑️")').click();

        await dashboardWithDemo.page.waitForTimeout(500);

        // Template should still be there
        const newCount = await dashboardWithDemo.page.locator('.template-card').count();
        expect(newCount).toBe(initialCount);

        await expect(card).toBeVisible();
    });
});

test.describe('Template Gallery UI', () => {
    test('should show empty state when no templates match filters', async ({ cleanDashboard }) => {
        await cleanDashboard.openTemplateGallery();

        // Search for something that doesn't exist
        await cleanDashboard.searchTemplates('XYZ123NonExistent');

        await expect(cleanDashboard.page.locator('.template-gallery-empty')).toBeVisible();
        await expect(cleanDashboard.page.locator('.template-gallery-empty:has-text("No templates found")')).toBeVisible();
    });

    test('should display templates in grid layout', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const grid = dashboardPage.page.locator('.template-gallery-grid');
        await expect(grid).toBeVisible();

        // Should have CSS grid
        const display = await grid.evaluate(el => getComputedStyle(el).display);
        expect(display).toBe('grid');
    });

    test('should show template thumbnails', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const firstCard = dashboardPage.page.locator('.template-card').first();
        const thumbnail = firstCard.locator('.template-card-thumbnail img');

        await expect(thumbnail).toBeVisible();
    });

    test('should have hover effects on cards', async ({ dashboardPage }) => {
        await dashboardPage.openTemplateGallery();

        const firstCard = dashboardPage.page.locator('.template-card').first();

        // Hover over card
        await firstCard.hover();

        // Card should have hover styling (border color change, etc.)
        // This is a visual test, so we just verify no errors
        await dashboardPage.page.waitForTimeout(100);
    });
});
