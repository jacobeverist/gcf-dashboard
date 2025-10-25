import { test as base } from '@playwright/test';
import { DashboardPage, TemplateGalleryPage } from './page-objects.js';

/**
 * Custom fixtures for GCF Dashboard tests
 * Provides pre-configured page objects and common setup
 */

export const test = base.extend({
    // Dashboard page object
    dashboardPage: async ({ page }, use) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();
        await use(dashboardPage);
    },

    // Dashboard with cleared storage
    cleanDashboard: async ({ page }, use) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();
        await dashboardPage.clearLocalStorage();
        await dashboardPage.page.reload();
        await use(dashboardPage);
    },

    // Dashboard with initialized demo
    dashboardWithDemo: async ({ page }, use) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();
        await dashboardPage.selectDemo('Sequence Learning');
        await dashboardPage.clickInitialize();
        await dashboardPage.waitForNetworkStable();
        await use(dashboardPage);
    },

    // Template gallery page object
    templateGallery: async ({ page }, use) => {
        const templateGallery = new TemplateGalleryPage(page);
        await use(templateGallery);
    },
});

export { expect } from '@playwright/test';
