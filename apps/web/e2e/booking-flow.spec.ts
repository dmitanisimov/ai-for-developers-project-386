import { expect, test } from "@playwright/test";

test("visitor books a slot and admin cancels it", async ({ page }) => {
  await page.goto("/book");
  await expect(page.getByRole("button", { name: /Короткая консультация/ })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /Короткая консультация/ }).click();

  const availableDay = page.locator(".calendar-day:has(small)").first();
  await expect(availableDay).toBeVisible({ timeout: 10_000 });
  await availableDay.click();

  const availableSlot = page.locator(".slot-status-row:not(.booked)").first();
  await expect(availableSlot).toBeVisible({ timeout: 10_000 });
  const selectedSlotTime = await availableSlot.locator("span").innerText();
  await availableSlot.click();

  await page.getByLabel("Имя").fill("E2E Visitor");
  await page.getByLabel("Email").fill("e2e@example.com");
  await page.getByLabel("Комментарий").fill("Проверка полного flow");
  await page.getByRole("button", { name: "Продолжить" }).click();

  await expect(page.getByRole("heading", { name: "Встреча забронирована" })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("e2e@example.com")).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible();
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Пароль").fill("local-dev-password");
  await page.getByRole("button", { name: "Войти" }).click();

  await expect(page.getByRole("heading", { name: "Встречи" })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("combobox").selectOption("all");
  const bookingRow = page.locator(".table-row").filter({ hasText: "e2e@example.com" });
  await expect(bookingRow).toContainText("E2E Visitor");
  await expect(bookingRow).toContainText("Короткая консультация");
  await expect(bookingRow).toContainText("confirmed");
  await bookingRow.getByRole("button", { name: "Отменить" }).click();
  await expect(bookingRow).toContainText("cancelled");

  await page.goto("/book");
  await page.getByRole("button", { name: /Короткая консультация/ }).click();
  await expect(page.locator(".slot-status-row", { hasText: selectedSlotTime })).toBeVisible({ timeout: 10_000 });
});

test("anonymous admin route redirects to login", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible({ timeout: 10_000 });
});
