import { test, expect } from '@playwright/test';

test.describe('Todo App User Scenarios', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.delete('http://127.0.0.1:3005/api/todos');
    await request.delete('http://127.0.0.1:3005/api/action-logs');
    await page.goto('/');
  });

  test('should display app header and metrics', async ({ page }) => {
    await expect(page.locator('header')).toContainText('Todo App');
    await expect(page.locator('.ant-tag').first()).toBeVisible();
  });

  test('should create, complete, and undo a todo', async ({ page }) => {
    const taskName = `Playwright Spec Task - ${Date.now()}`;

    await page.fill('input[placeholder="What needs to be done?"]', taskName);
    await page.locator('div[name="categoryId"]').click();
    await page.locator('.ant-select-item-option').filter({ hasText: 'Work' }).click();
    await page.click('button:has-text("Add Task")');

    const todoCard = page.locator('.todo-card', { hasText: taskName });
    await expect(todoCard).toBeVisible();
    await expect(todoCard.locator('.ant-tag')).toContainText('Work');

    await todoCard.locator('button:has-text("Complete")').click();
    await expect(todoCard.locator('button:has-text("Reopen")')).toBeVisible();

    const undoToast = page.locator('text=Undo');
    await expect(undoToast).toBeVisible();
    await undoToast.click();
    await expect(todoCard.locator('button:has-text("Complete")')).toBeVisible();
  });

  test('should support category filtering', async ({ page }) => {
    await page.locator('[data-testid="categoryFilter"]').click();
    await page.locator('.ant-select-item-option').filter({ hasText: 'Personal' }).click();

    const cards = page.locator('.todo-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator('.ant-tag').first()).toContainText('Personal');
    }
  });

  test('should show created and completed actions in history tab', async ({ page }) => {
    const taskName = `History Test ${Date.now()}`;

    await page.fill('input[placeholder="What needs to be done?"]', taskName);
    await page.locator('div[name="categoryId"]').click();
    await page.locator('.ant-select-item-option').filter({ hasText: 'Work' }).click();
    await page.click('button:has-text("Add Task")');
    await expect(page.locator('.todo-card', { hasText: taskName })).toBeVisible();

    await page.locator('.todo-card', { hasText: taskName }).locator('button:has-text("Complete")').click();
    await expect(page.locator('.todo-card', { hasText: taskName }).locator('button:has-text("Reopen")')).toBeVisible();

    await page.click('button:has-text("History")');
    await expect(page.locator('text=Action History')).toBeVisible();
    await page.waitForTimeout(1500);

    await expect(page.getByText(new RegExp(`Created "${taskName}"`))).toBeVisible();
    await expect(page.getByText(new RegExp(`Completed "${taskName}"`))).toBeVisible();
  });

  test('should undo completion from history tab', async ({ page }) => {
    const taskName = `Undo Complete ${Date.now()}`;

    await page.fill('input[placeholder="What needs to be done?"]', taskName);
    await page.locator('div[name="categoryId"]').click();
    await page.locator('.ant-select-item-option').filter({ hasText: 'Work' }).click();
    await page.click('button:has-text("Add Task")');
    await expect(page.locator('.todo-card', { hasText: taskName })).toBeVisible();

    const card = page.locator('.todo-card', { hasText: taskName });
    await card.locator('button:has-text("Complete")').click();
    await expect(card.locator('button:has-text("Reopen")')).toBeVisible();

    await page.click('button:has-text("History")');
    await expect(page.locator('text=Action History')).toBeVisible();
    await page.waitForTimeout(1500);

    const completedItem = page.locator('.ant-timeline-item', { hasText: `Completed "${taskName}"` });
    await expect(completedItem).toBeVisible();
    await completedItem.locator('button:has-text("Undo")').click();
    await page.locator('button:has-text("Main")').click();

    await expect(page.locator('.todo-card', { hasText: taskName }).locator('button:has-text("Complete")')).toBeVisible();
  });

  test('should undo deletion from history tab with confirmation modal', async ({ page }) => {
    const taskName = `Undo Delete ${Date.now()}`;

    await page.fill('input[placeholder="What needs to be done?"]', taskName);
    await page.locator('div[name="categoryId"]').click();
    await page.locator('.ant-select-item-option').filter({ hasText: 'Shopping' }).click();
    await page.click('button:has-text("Add Task")');
    await expect(page.locator('.todo-card', { hasText: taskName })).toBeVisible();

    await page.locator('.todo-card', { hasText: taskName }).locator('button:has-text("Delete")').click();
    await expect(page.locator('.ant-modal-confirm')).toBeVisible();
    await page.locator('.ant-modal-confirm button:has-text("Delete")').click();
    await page.waitForTimeout(500);
    await expect(page.locator('.todo-card', { hasText: taskName })).not.toBeVisible();

    await page.click('button:has-text("History")');
    await expect(page.locator('text=Action History')).toBeVisible();
    await page.waitForTimeout(1500);

    const deletedItem = page.locator('.ant-timeline-item', { hasText: `Deleted "${taskName}"` });
    await expect(deletedItem).toBeVisible();
    await deletedItem.locator('button:has-text("Undo")').click();

    await expect(page.locator('.ant-modal-confirm')).toBeVisible();
    await expect(page.locator('.ant-modal-confirm')).toContainText('Undo deletion?');
    await expect(page.locator('.ant-modal-confirm')).toContainText(`This will recreate the task "${taskName}".`);
    await page.locator('.ant-modal-confirm button:has-text("Recreate")').click();

    await page.waitForTimeout(1000);
    await page.goto('/');
    await expect(page.locator('.todo-card', { hasText: taskName })).toBeVisible();
    await expect(page.locator('.todo-card', { hasText: taskName }).locator('.ant-tag')).toContainText('Shopping');
  });

  test('should create a todo with tags and display them', async ({ page }) => {
    const taskName = `Tagged Task ${Date.now()}`;

    await page.fill('input[placeholder="What needs to be done?"]', taskName);
    await page.locator('div[name="categoryId"]').click();
    await page.locator('.ant-select-item-option').filter({ hasText: 'Work' }).click();

    await page.locator('#tags-input').click();
    await page.keyboard.type('urgent', {delay: 50});
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.type('frontend', {delay: 50});
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.click('button:has-text("Add Task")');
    const todoCard = page.locator('.todo-card', { hasText: taskName });
    await expect(todoCard).toBeVisible();

    await expect(todoCard.locator('.ant-tag:has-text("#urgent")')).toBeVisible();
    await expect(todoCard.locator('.ant-tag:has-text("#frontend")')).toBeVisible();
  });

  test('should not show undo button for restored actions in history', async ({ page }) => {
    const taskName = `No Undo Restored ${Date.now()}`;

    await page.fill('input[placeholder="What needs to be done?"]', taskName);
    await page.locator('div[name="categoryId"]').click();
    await page.locator('.ant-select-item-option').filter({ hasText: 'Work' }).click();
    await page.click('button:has-text("Add Task")');
    await expect(page.locator('.todo-card', { hasText: taskName })).toBeVisible();

    await page.locator('.todo-card', { hasText: taskName }).locator('button:has-text("Delete")').click();
    await page.locator('.ant-modal-wrap').waitFor({ state: 'visible', timeout: 3000 });
    await page.locator('.ant-modal-confirm button:has-text("Delete")').click();
    await page.waitForTimeout(500);

    await page.click('button:has-text("History")');
    await expect(page.locator('text=Action History')).toBeVisible();
    await page.waitForTimeout(1500);

    const deletedItem = page.locator('.ant-timeline-item', { hasText: `Deleted "${taskName}"` });
    await deletedItem.locator('button:has-text("Undo")').click();
    await expect(page.locator('.ant-modal-confirm')).toBeVisible();
    await page.locator('.ant-modal-confirm button:has-text("Recreate")').click();
    await page.waitForTimeout(1000);
    await page.goto('/');

    await page.click('button:has-text("History")');
    await expect(page.locator('text=Action History')).toBeVisible();
    await page.waitForTimeout(1500);

    const restoredItem = page.locator('.ant-timeline-item', { hasText: `Restored "${taskName}"` });
    await expect(restoredItem).toBeVisible();
    await expect(restoredItem.locator('button:has-text("Undo")')).not.toBeVisible();
  });
});
