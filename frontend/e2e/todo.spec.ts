import { test, expect } from '@playwright/test';

test.describe('Todo App User Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should display app header and metrics', async ({ page }) => {
    // Verify header title
    await expect(page.locator('header')).toContainText('Todo App');

    // Verify initial metrics are visible
    await expect(page.locator('.ant-tag').first()).toBeVisible();
  });

  test('should create, complete, and undo a todo', async ({ page }) => {
    const taskName = `Playwright Spec Task - ${Date.now()}`;

    // Fill new task input
    await page.fill('input[placeholder="What needs to be done?"]', taskName);

    // Select category (e.g. Work)
    await page.locator('.ant-select-selector').nth(1).click();
    await page.click('div[title="Work"]');

    // Click "Add Task" button
    await page.click('button:has-text("Add Task")');

    // Verify todo is in the list
    const todoCard = page.locator('.todo-card', { hasText: taskName });
    await expect(todoCard).toBeVisible();
    await expect(todoCard.locator('.ant-tag')).toContainText('Work');

    // Toggle complete
    await todoCard.locator('button:has-text("Complete")').click();

    // Verify visual strikethrough or reopen button
    await expect(todoCard.locator('button:has-text("Reopen")')).toBeVisible();

    // Verify Undo notification pop-up is shown
    const undoToast = page.locator('text=Undo');
    await expect(undoToast).toBeVisible();

    // Click "Undo" to restore task
    await undoToast.click();

    // Verify todo is restored (should show Complete button again)
    await expect(todoCard.locator('button:has-text("Complete")')).toBeVisible();
  });

  test('should support category filtering', async ({ page }) => {
    // Select the category filter (index 0)
    await page.locator('.ant-select-selector').first().click();
    
    // Choose "Personal"
    await page.click('div[title="Personal"]');

    // Verify all active cards contain "Personal" tag
    const cards = page.locator('.todo-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator('.ant-tag')).toContainText('Personal');
    }
  });
});
