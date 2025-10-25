/**
 * Page Object Model for GCF Dashboard
 * Provides reusable methods for interacting with the dashboard
 */

export class DashboardPage {
    constructor(page) {
        this.page = page;
    }

    // Navigation
    async goto() {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
    }

    // Header Controls
    async selectDemo(demoName) {
        await this.page.selectOption('#demo-select', { label: demoName });
    }

    async clickInitialize() {
        await this.page.click('#init-btn');
    }

    async clickStart() {
        await this.page.click('#start-btn');
    }

    async clickStop() {
        await this.page.click('#stop-btn');
    }

    async clickReset() {
        await this.page.click('#reset-btn');
    }

    async clickResetLayout() {
        await this.page.click('#reset-layout-btn');
    }

    async clickTemplatesButton() {
        await this.page.click('#template-gallery-btn');
    }

    async setSpeed(value) {
        await this.page.fill('#speed-slider', value.toString());
    }

    async toggleLearning() {
        await this.page.click('#learning-toggle');
    }

    // Block Palette
    async openCreateBlockModal() {
        await this.page.click('.palette-add-btn');
        await this.page.waitForSelector('.modal-overlay');
    }

    async dragBlockToCanvas(blockType, x = 400, y = 300) {
        const paletteItem = this.page.locator('.palette-item', { hasText: blockType });
        // Use the React Flow wrapper which is the actual drop target
        const canvas = this.page.locator('.react-flow__renderer');

        await paletteItem.dragTo(canvas, {
            targetPosition: { x, y },
            force: true  // Force the drag even if elements overlap
        });
    }

    // Custom Block Creation
    async createCustomBlock(blockData) {
        await this.openCreateBlockModal();

        // Fill form
        await this.page.fill('#block-name', blockData.name);
        await this.page.selectOption('#block-type', blockData.type);

        // Select icon - click icon picker button to open dropdown
        await this.page.click('.icon-picker-button');
        await this.page.waitForSelector('.icon-picker-dropdown', { state: 'visible' });
        // Click the icon option
        await this.page.click(`.icon-option:has-text("${blockData.icon}")`);

        // Select color - click color picker button to open dropdown
        await this.page.click('.color-picker-button');
        await this.page.waitForSelector('.color-picker-dropdown', { state: 'visible' });

        // Try to find color by title attribute (which contains the hex value)
        const colorOption = this.page.locator(`.color-option[title="${blockData.color}"]`);
        const colorExists = await colorOption.count();

        if (colorExists > 0) {
            await colorOption.click();
        } else {
            // If color not in presets, use custom text input
            await this.page.fill('.color-custom input[type="text"]', blockData.color);
        }

        // Submit
        await this.page.click('.btn-primary:has-text("Create Block")');
        await this.page.waitForSelector('.modal-overlay', { state: 'hidden' });
    }

    // Parameter Panel
    async selectNode(nodeId) {
        await this.page.click(`.react-flow__node[data-id="${nodeId}"]`);
    }

    async getParameterValue(paramName) {
        const slider = this.page.locator(`.parameter-slider:has-text("${paramName}") input[type="range"]`);
        return await slider.inputValue();
    }

    async setParameterValue(paramName, value) {
        const slider = this.page.locator(`.parameter-slider:has-text("${paramName}") input[type="range"]`);
        await slider.fill(value.toString());
        // Trigger mouseup to complete the change
        await slider.dispatchEvent('mouseup');
    }

    async clickParameterPreset(paramName, presetLabel) {
        const paramSlider = this.page.locator(`.parameter-slider:has-text("${paramName}")`);
        await paramSlider.locator(`.parameter-preset-btn:has-text("${presetLabel}")`).click();
    }

    // Template Gallery
    async openTemplateGallery() {
        await this.clickTemplatesButton();
        await this.page.waitForSelector('.modal-overlay');
    }

    async saveCurrentNetworkAsTemplate(templateData) {
        await this.openTemplateGallery();
        await this.page.click('button:has-text("Save Current Network")');
        await this.page.waitForSelector('.modal-content:has-text("Save as Template")');

        // Fill metadata
        await this.page.fill('#template-name', templateData.name);
        await this.page.fill('#template-description', templateData.description);

        // Add tags
        for (const tag of templateData.tags) {
            await this.page.fill('#template-tags', tag);
            await this.page.click('button:has-text("Add")');
        }

        if (templateData.category) {
            await this.page.selectOption('#template-category', templateData.category);
        }

        // Save
        await this.page.click('button:has-text("Save Template")');
        await this.page.waitForSelector('.modal-content:has-text("Save as Template")', { state: 'hidden' });
    }

    async searchTemplates(query) {
        await this.page.fill('.template-search-input', query);
    }

    async filterByCategory(category) {
        await this.page.click(`.filter-btn:has-text("${category}")`);
    }

    async filterByTag(tag) {
        await this.page.click(`.tag-btn:has-text("${tag}")`);
    }

    async loadTemplate(templateName) {
        const card = this.page.locator('.template-card', { hasText: templateName });
        await card.locator('button:has-text("Load")').click();
    }

    async deleteTemplate(templateName) {
        const card = this.page.locator('.template-card', { hasText: templateName });
        await card.locator('button:has-text("🗑️")').click();
    }

    async duplicateTemplate(templateName) {
        const card = this.page.locator('.template-card', { hasText: templateName });
        await card.locator('button:has-text("📋")').click();
    }

    async exportTemplate(templateName) {
        const card = this.page.locator('.template-card', { hasText: templateName });
        await card.locator('button:has-text("💾")').click();
    }

    // Assertions helpers
    async getNodeCount() {
        return await this.page.locator('.react-flow__node').count();
    }

    async getEdgeCount() {
        return await this.page.locator('.react-flow__edge').count();
    }

    async isWasmReady() {
        const indicator = this.page.locator('#wasm-status.active');
        return await indicator.isVisible();
    }

    async isRunning() {
        const stopBtn = this.page.locator('#stop-btn:not([disabled])');
        return await stopBtn.isVisible();
    }

    async waitForNetworkStable() {
        await this.page.waitForTimeout(500);
    }

    async closeModal() {
        await this.page.click('.modal-close');
        await this.page.waitForSelector('.modal-overlay', { state: 'hidden' });
    }

    // LocalStorage helpers
    async clearLocalStorage() {
        await this.page.evaluate(() => {
            localStorage.clear();
        });
    }

    async getLocalStorageItem(key) {
        return await this.page.evaluate((key) => {
            return localStorage.getItem(key);
        }, key);
    }
}

export class TemplateGalleryPage {
    constructor(page) {
        this.page = page;
    }

    async getTemplateCount() {
        return await this.page.locator('.template-card').count();
    }

    async getVisibleTemplateCount() {
        const cards = this.page.locator('.template-card:visible');
        return await cards.count();
    }

    async getTemplateByName(name) {
        return this.page.locator('.template-card', { hasText: name });
    }

    async isTemplateVisible(name) {
        const card = await this.getTemplateByName(name);
        return await card.isVisible();
    }

    async getTemplateStats(name) {
        const card = await this.getTemplateByName(name);
        const nodes = await card.locator('.template-stat-value').nth(0).textContent();
        const edges = await card.locator('.template-stat-value').nth(1).textContent();
        return { nodes: parseInt(nodes), edges: parseInt(edges) };
    }

    async getTemplateTags(name) {
        const card = await this.getTemplateByName(name);
        const tags = await card.locator('.template-tag').allTextContents();
        return tags;
    }
}
