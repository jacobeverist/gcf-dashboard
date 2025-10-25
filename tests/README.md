# GCF Dashboard Test Suite

Comprehensive end-to-end tests for the GCF Dashboard using Playwright.

## Overview

This test suite covers:
- **Phase 2 Features:** Custom block creation and parameter tuning
- **Phase 3 Features:** Template save/load and gallery management
- **Smoke Tests:** Quick sanity checks for core functionality

## Test Structure

```
tests/
├── helpers/
│   ├── fixtures.js         # Custom test fixtures and setup
│   └── page-objects.js     # Page object models for dashboard
├── smoke.spec.js           # Quick sanity checks
├── phase2-custom-blocks.spec.js       # Custom block creation tests
├── phase2-parameter-tuning.spec.js    # Parameter adjustment tests
├── phase3-template-save-load.spec.js  # Template CRUD tests
└── phase3-template-gallery.spec.js    # Gallery features tests
```

## Running Tests

### All Tests
```bash
npm test
```

### With Browser UI
```bash
npm run test:headed
```

### Interactive UI Mode
```bash
npm run test:ui
```

### Debug Mode
```bash
npm run test:debug
```

### Specific Phases
```bash
# Phase 2 tests only
npm run test:phase2

# Phase 3 tests only
npm run test:phase3
```

### View Test Report
```bash
npm run test:report
```

## Test Coverage

### Smoke Tests (smoke.spec.js)
- ✅ Application loads successfully
- ✅ All UI elements present
- ✅ WASM initializes
- ✅ Built-in blocks available
- ✅ Demo initialization works
- ✅ Start/stop execution
- ✅ No console errors

### Phase 2: Custom Blocks (phase2-custom-blocks.spec.js)
**Custom Block Creation:**
- ✅ Open create block modal
- ✅ Create transformer, learner, and temporal blocks
- ✅ Form validation (required fields, length limits)
- ✅ Live preview updates
- ✅ Persistence after reload
- ✅ Multiple custom blocks
- ✅ Close modal (cancel/X button)

**Custom Block Usage:**
- ✅ Drag custom blocks to canvas
- ✅ Default parameters assigned

### Phase 2: Parameter Tuning (phase2-parameter-tuning.spec.js)
**Parameter Panel:**
- ✅ Show panel when node selected
- ✅ Empty state when no selection
- ✅ Display block info
- ✅ Show all parameters

**Parameter Sliders:**
- ✅ Adjust values with slider
- ✅ Display current value
- ✅ Update value display on change
- ✅ Respect min/max constraints
- ✅ Step increments

**Preset Buttons:**
- ✅ All preset buttons present (25%, 50%, 75%, 100%, Reset)
- ✅ Set values correctly
- ✅ Reset to minimum

**Persistence:**
- ✅ Persist changes when switching nodes
- ✅ Update WASM parameters

**Edge Cases:**
- ✅ Switch between different block types
- ✅ Clear selection on canvas click

### Phase 3: Templates (phase3-template-save-load.spec.js)
**Gallery Access:**
- ✅ Open template gallery
- ✅ Close gallery
- ✅ Show built-in templates

**Save Template:**
- ✅ Open save dialog
- ✅ Save with metadata
- ✅ Validate required fields
- ✅ Enforce length limits
- ✅ Add/remove multiple tags
- ✅ Persist in localStorage

**Load Template:**
- ✅ Load built-in templates
- ✅ Clear current network before load
- ✅ Preserve network structure
- ✅ Load custom templates

**Metadata:**
- ✅ Display name, description, tags
- ✅ Display statistics (blocks/connections)
- ✅ Display author and date
- ✅ Show built-in badge

**Actions:**
- ✅ No delete/edit for built-in
- ✅ Edit user templates
- ✅ Delete user templates

### Phase 3: Gallery Features (phase3-template-gallery.spec.js)
**Search:**
- ✅ Filter by name
- ✅ Filter by description
- ✅ Filter by tags
- ✅ Case-insensitive
- ✅ Clear search
- ✅ No results state

**Category Filter:**
- ✅ Show all categories
- ✅ Filter by category
- ✅ Highlight active category
- ✅ Return to All

**Tag Filter:**
- ✅ Show available tags
- ✅ Filter by single tag
- ✅ Filter by multiple tags
- ✅ Toggle tag selection
- ✅ Combine with category filter
- ✅ Combine with search

**Duplicate:**
- ✅ Show duplicate button
- ✅ Duplicate template
- ✅ Duplicate built-in templates
- ✅ Preserve network structure

**Export:**
- ✅ Show export button
- ✅ Download JSON file
- ✅ Valid JSON structure

**Delete:**
- ✅ Show confirmation dialog
- ✅ Delete when confirmed
- ✅ Cancel deletion

**UI:**
- ✅ Empty state
- ✅ Grid layout
- ✅ Thumbnails
- ✅ Hover effects

## Test Fixtures

### `dashboardPage`
Basic dashboard page object with navigation.

### `cleanDashboard`
Dashboard with cleared localStorage (fresh state).

### `dashboardWithDemo`
Dashboard with initialized demo network.

### `templateGallery`
Template gallery page object with helper methods.

## Page Objects

### DashboardPage
Main dashboard interactions:
- Navigation and controls
- Block palette operations
- Custom block creation
- Parameter tuning
- Template management
- Network operations

### TemplateGalleryPage
Template gallery specific operations:
- Template counting
- Template visibility checks
- Stats extraction
- Tag management

## Best Practices

### Writing Tests
1. Use descriptive test names
2. Follow Arrange-Act-Assert pattern
3. Use page objects for interactions
4. Wait for stable states
5. Clean up after tests (fixtures handle this)

### Debugging Tests
```bash
# Run specific test file
npx playwright test phase2-custom-blocks

# Run specific test by name
npx playwright test -g "should create a custom transformer block"

# Run with inspector
npm run test:debug

# Generate trace
npx playwright test --trace on
```

### Continuous Integration

The test suite is configured for CI with:
- Automatic retries (2 retries on CI)
- Parallel execution disabled on CI
- HTML, list, and JSON reporters
- Screenshots on failure
- Video on failure

## Configuration

See `playwright.config.js` for detailed configuration:
- Base URL: `http://localhost:5174`
- Browsers: Chromium, Firefox, WebKit
- Timeout: 30 seconds per test
- Retries: 2 on CI, 0 locally
- Web server auto-start

## Maintenance

### Adding New Tests

1. Create new spec file in `tests/`
2. Import fixtures: `import { test, expect } from './helpers/fixtures.js'`
3. Use page objects for interactions
4. Follow existing patterns

### Updating Page Objects

When UI changes:
1. Update selectors in `page-objects.js`
2. Add new methods as needed
3. Run tests to verify

### Adding Fixtures

Add new fixtures in `fixtures.js`:
```javascript
export const test = base.extend({
    myFixture: async ({ page }, use) => {
        // Setup
        await use(myFixture);
        // Teardown
    },
});
```

## Test Statistics

- **Total Test Files:** 5
- **Total Tests:** 100+
- **Coverage:**
  - Phase 2 Custom Blocks: 15+ tests
  - Phase 2 Parameter Tuning: 20+ tests
  - Phase 3 Save/Load: 25+ tests
  - Phase 3 Gallery: 40+ tests
  - Smoke Tests: 10+ tests

## Troubleshooting

### Tests Failing

1. **Port in use:** Stop existing dev servers
2. **WASM not ready:** Increase wait timeout
3. **Elements not found:** Check selectors in page objects
4. **Flaky tests:** Add explicit waits

### Common Issues

**"Cannot find module"**
```bash
npm install
```

**"Timeout waiting for web server"**
```bash
# Increase timeout in playwright.config.js
webServer: {
    timeout: 180 * 1000
}
```

**"Browser not installed"**
```bash
npx playwright install
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI Configuration](https://playwright.dev/docs/ci)

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Update page objects
3. Add fixtures if needed
4. Document new test patterns
5. Run full suite before commit

## Support

For issues or questions:
1. Check Playwright documentation
2. Review existing tests for examples
3. Check test output and traces
4. Use debug mode for investigation
