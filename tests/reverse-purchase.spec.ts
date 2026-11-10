import { test, expect, type Page } from '@playwright/test'

async function signup(page: Page, role: 'buyer' | 'seller', suffix: string) {
  await page.goto('/auth?mode=signup&redirect=/reverse-purchase')
  await page.getByLabel('نام نمایشی', { exact: true }).fill(`آزمون ${role}`)
  await page.getByLabel('نام کاربری').fill(`reverse_${role}_${suffix}`)
  await page.getByLabel('رمز عبور').fill('Reverse-Test-2026!')
  await page.getByLabel('می‌خواهم…').selectOption(role)
  await page.getByRole('button', { name: 'ساخت حساب', exact: true }).click()
  await expect(page).toHaveURL(/\/reverse-purchase$/)
}

test('buyer requests, seller offers, buyer selects on mobile', async ({ page, browser }) => {
  const suffix = Date.now().toString()
  const title = `درخواست چای ${suffix}`
  await signup(page, 'buyer', suffix)
  await page.getByRole('button', { name: 'درخواست جدید', exact: true }).click()
  await page.getByLabel('عنوان درخواست', { exact: true }).fill(title)
  await page.getByLabel('تعداد موردنیاز', { exact: true }).fill('5')
  await page.getByLabel('سقف قیمت هر واحد (تومان)', { exact: true }).fill('100000')
  const deadline = new Date(Date.now() + 86400000)
  await page
    .getByLabel('مهلت دریافت پیشنهاد')
    .fill(
      `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}T23:59`,
    )
  await page.getByLabel('توضیحات درخواست', { exact: true }).fill('چای ایرانی بسته‌بندی شده')
  await page.getByRole('button', { name: 'ثبت درخواست خرید', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'درخواست خرید ثبت شد' })).toBeVisible()

  const seller = await browser.newPage()
  try {
    await signup(seller, 'seller', suffix)
    const sellerCard = seller.getByRole('article').filter({ hasText: title })
    await sellerCard.getByLabel('قیمت پیشنهادی هر واحد (تومان)').fill('90000')
    await sellerCard.getByLabel('توضیحات پیشنهاد').fill('تأمین تمام تعداد با ارسال رایگان')
    await sellerCard.getByRole('button', { name: 'ثبت پیشنهاد', exact: true }).click()
    await expect(sellerCard).toContainText('۴۵۰٬۰۰۰')
    await expect(sellerCard.getByRole('button', { name: 'ثبت پیشنهاد', exact: true })).toHaveCount(
      0,
    )

    await page.setViewportSize({ width: 375, height: 900 })
    await page.reload()
    const buyerCard = page.getByRole('article').filter({ hasText: title })
    await buyerCard.getByRole('button', { name: 'انتخاب این پیشنهاد', exact: true }).click()
    await expect(buyerCard).toContainText('پیشنهاد انتخاب‌شده')
    await expect(buyerCard.getByRole('button')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(376)
  } finally {
    await seller.close()
  }
})
