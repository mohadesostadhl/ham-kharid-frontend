import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const password = 'Demo-Only-2026!'

async function login(page: Page, username: string) {
  await page.goto('/auth')
  await page.getByLabel('نام کاربری').fill(username)
  await page.getByLabel('رمز عبور').fill(password)
  await page.getByRole('button', { name: 'ورود به حساب', exact: true }).click()
  await expect(page).not.toHaveURL(/\/auth/)
}

async function signup(page: Page, username: string, role: 'seller' | 'buyer') {
  await page.goto('/auth?mode=signup')
  await page.getByLabel('نام نمایشی', { exact: true }).fill(`کاربر آزمون ${role}`)
  await page.getByLabel('نام کاربری').fill(username)
  await page.getByLabel('رمز عبور').fill(password)
  await page.getByLabel('می‌خواهم…').selectOption(role)
  await page.getByRole('button', { name: 'ساخت حساب', exact: true }).click()
  await expect(page).not.toHaveURL(/\/auth/)
}

async function noOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    dir: document.documentElement.dir,
  }))
  expect(dimensions.dir).toBe('rtl')
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1)
}

async function topUp(page: Page, amount: number) {
  await page.goto('/profile#wallet')
  await page.getByLabel('مبلغ شارژ (تومان)').fill(String(amount))
  await page.getByRole('button', { name: 'شارژ نمایشی کیف پول', exact: true }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'کیف پول با موفقیت شارژ شد' }),
  ).toBeVisible()
}

async function signout(page: Page) {
  await page.getByRole('button', { name: 'حساب کاربری', exact: true }).click()
  await page.getByRole('button', { name: 'خروج از حساب', exact: true }).click()
  await expect(page.getByRole('button', { name: 'حساب کاربری', exact: true })).not.toBeVisible()
}

test('profile page and app bar popup on desktop and mobile', async ({ page }, info) => {
  await login(page, 'buyer_demo')
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: 'اطلاعات کاربری' })).toBeVisible()
  await expect(page.locator('.profile-fields')).toContainText('buyer_demo')
  await expect(page.locator('.wallet-panel')).toBeVisible()
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 })
    const trigger = page.getByRole('button', { name: 'حساب کاربری', exact: true })
    const popup = page.getByRole('region', { name: 'منوی حساب کاربری' })
    await trigger.click()
    await expect(popup).toContainText('buyer_demo')
    await expect(popup.locator('.profile-wallet-link')).toContainText('تومان')
    await noOverflow(page)
    await page.screenshot({ path: info.outputPath(`profile-menu-${width}.png`), fullPage: true })
    const a11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(a11y.violations).toEqual([])
    await page.keyboard.press('Escape')
    await expect(popup).not.toBeVisible()
    await expect(trigger).toBeFocused()
    await trigger.click()
    await page.locator('.announcement').click()
    await expect(popup).not.toBeVisible()
    await trigger.click()
    await popup.getByRole('link', { name: 'پروفایل من', exact: true }).click()
    await expect(popup).not.toBeVisible()
  }
  await signout(page)
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: 'برای دیدن پروفایل وارد شوید' })).toBeVisible()
  await expect(page.locator('.profile-fields')).toHaveCount(0)
  await login(page, 'seller_demo')
  await page.goto('/profile')
  await expect(page.locator('.profile-fields')).toContainText('فروشنده')
  await expect(page.locator('.wallet-panel')).toHaveCount(0)
  await page.getByRole('button', { name: 'حساب کاربری', exact: true }).click()
  await expect(
    page.locator('.profile-popup').getByRole('link', { name: 'پنل فروشنده' }),
  ).toBeVisible()
})

function settleTestCampaign(id: number) {
  expect(Number.isInteger(id)).toBe(true)
  const backend = resolve('../backend')
  execFileSync(
    resolve(backend, '.venv/Scripts/python.exe'),
    [
      'manage.py',
      'shell',
      '-c',
      `from market.models import Campaign; from django.utils import timezone; from market.services import settle_campaign; Campaign.objects.filter(pk=${id}).update(deadline=timezone.now()); settle_campaign(${id})`,
    ],
    { cwd: backend },
  )
}

test('desktop discovery, search, categories, API proxy, and accessibility', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const health = await page.request.get('/api/health/')
  expect(await health.json()).toEqual({ status: 'ok', database: 'sqlite' })
  await page.goto('/')
  await expect(page.locator('.campaign-card').first()).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await noOverflow(page)
  await page.screenshot({ path: info.outputPath('home-desktop.png'), fullPage: true })
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(accessibility.violations).toEqual([])
  await page.getByRole('button', { name: 'خانه و زندگی', exact: true }).click()
  await expect(page.locator('.campaign-card')).toHaveCount(1)
  await page.getByRole('button', { name: 'همهٔ خریدها', exact: true }).click()
  await page.getByRole('searchbox', { name: 'جست‌وجوی کمپین' }).fill('nothing-matches-12345')
  await expect(page.getByText('خریدی با این مشخصات پیدا نشد')).toBeVisible()
  await page.getByRole('searchbox', { name: 'جست‌وجوی کمپین' }).fill('قهوهٔ ترکیبی')
  // Both campaigns offer this product; discovery searches product names too.
  await expect(page.locator('.campaign-card')).toHaveCount(2)
  expect(errors).toEqual([])
})

test('buyer session, reservation limit, persistence, cancellation, and dialog keyboard', async ({
  page,
}) => {
  await login(page, 'buyer_demo')
  await page.goto('/campaigns/1')
  await expect(page.getByRole('heading', { name: 'قهوهٔ ترکیبی روزانه' })).toBeVisible()
  await page.getByRole('button', { name: /^رزرو با/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'رزرو شما ثبت شد' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: /^رزرو با/ })).toBeVisible()
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'افزایش تعداد' }).click()
  await expect(page.getByRole('button', { name: 'افزایش تعداد' })).toBeDisabled()
  await expect(page.getByText(/۱ واحد قبلاً رزرو کرده‌اید/)).toBeVisible()
  await page.goto('/account')
  const row = page.locator('.account-item').filter({ hasText: 'قهوهٔ ترکیبی روزانه' })
  await row.getByRole('button', { name: 'لغو رزرو' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await row.getByRole('button', { name: 'لغو رزرو' }).click()
  await page.getByRole('button', { name: 'بله، لغو رزرو' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'رزرو لغو شد' })).toBeVisible()
  await expect(row.getByText('لغوشده', { exact: true })).toBeVisible()
  await signout(page)
  await page.goto('/account')
  await expect(page.getByText('خریدها در حساب خریدار شما هستند')).toBeVisible()
})

test('seller creates product and campaign; buyer reserves; deadline creates order; seller fulfills', async ({
  page,
}, info) => {
  const suffix = Date.now().toString()
  const seller = `seller_e2e_${suffix}`
  const buyer = `buyer_e2e_${suffix}`
  const title = `کمپین آزمون یکپارچه ${suffix}`
  await signup(page, seller, 'seller')
  await page.getByRole('button', { name: 'محصول جدید', exact: true }).click()
  await page.getByLabel('نام محصول', { exact: true }).fill(`محصول آزمون ${suffix}`)
  await page
    .getByRole('combobox', { name: 'دسته‌بندی', exact: true })
    .selectOption({ label: 'خوراکی و نوشیدنی' })
  await page.getByLabel('قیمت تکی (تومان)', { exact: true }).fill('100000')
  await page.getByLabel('دربارهٔ محصول', { exact: true }).fill('دادهٔ ساختگی آزمون یکپارچه')
  await page.getByRole('button', { name: 'ذخیرهٔ محصول', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'محصول جدید ذخیره شد' })).toBeVisible()
  await page.getByRole('button', { name: 'کمپین جدید', exact: true }).click()
  await page.getByLabel('عنوان کمپین', { exact: true }).fill(title)
  await page
    .getByRole('combobox', { name: 'محصول', exact: true })
    .selectOption({ label: `محصول آزمون ${suffix}` })
  await page.getByLabel('قیمت گروهی (تومان)').fill('75000')
  await page.getByLabel('حدنصاب تعداد', { exact: true }).fill('1')
  await page.getByLabel('ظرفیت کل', { exact: true }).fill('2')
  await page.getByLabel('سقف هر خریدار', { exact: true }).fill('1')
  const local = new Date(Date.now() + 3600000)
  const dateInput = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}T${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}`
  await page.getByLabel('پایان مهلت (زمان محلی دستگاه)').fill(dateInput)
  const created = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/campaigns/') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'ذخیرهٔ پیش‌نویس', exact: true }).click()
  const campaign = await (await created).json()
  expect(campaign.status).toBe('draft')
  await page
    .locator('tr')
    .filter({ hasText: title })
    .getByRole('button', { name: 'انتشار کمپین', exact: true })
    .click()
  await expect(page.getByRole('status').filter({ hasText: 'کمپین منتشر شد' })).toBeVisible()
  await page.screenshot({ path: info.outputPath('seller-desktop.png'), fullPage: true })
  await signout(page)
  await signup(page, buyer, 'buyer')
  await topUp(page, 100000)
  await page.goto(`/campaigns/${campaign.id}`)
  await page.getByRole('button', { name: /^رزرو با/ }).click()
  await expect(page.getByText('حدنصاب تکمیل شد', { exact: true })).toBeVisible()
  await page.screenshot({ path: info.outputPath('detail-desktop.png'), fullPage: true })
  settleTestCampaign(campaign.id)
  await page.goto('/profile')
  await expect(page.locator('.wallet-balance')).toContainText('۲۵٬۰۰۰')
  await page.goto('/account')
  await page.getByRole('button', { name: 'سفارش‌های من', exact: true }).click()
  await expect(page.locator('.account-order').filter({ hasText: title })).toContainText('۷۵٬۰۰۰')
  await signout(page)
  await login(page, seller)
  await page.getByRole('button', { name: 'سفارش‌ها', exact: true }).click()
  const order = page.locator('.account-order').filter({ hasText: title })
  await order.getByRole('button', { name: 'ثبت ارسال', exact: true }).click()
  await expect(order.getByText('ارسال‌شده', { exact: true })).toBeVisible()
  await order.getByRole('button', { name: 'ثبت تحویل', exact: true }).click()
  await expect(order.getByText('تحویل‌شده', { exact: true })).toBeVisible()
})

test('wallet top-up, insufficient funds, failed campaign refund and accessible history', async ({
  page,
}, info) => {
  const suffix = Date.now().toString()
  const backend = resolve('../backend')
  const output = execFileSync(
    resolve(backend, '.venv/Scripts/python.exe'),
    [
      'manage.py',
      'shell',
      '-c',
      `from market.models import Campaign, Product; from django.utils import timezone; from datetime import timedelta; c=Campaign.objects.create(product=Product.objects.get(pk=1), title='Wallet QA ${suffix}', group_price=70000, min_quantity=3, capacity=5, buyer_limit=3, deadline=timezone.now()+timedelta(hours=1), status='active'); print(c.pk)`,
    ],
    { cwd: backend, encoding: 'utf8' },
  )
  const campaignId = Number(output.trim().split(/\r?\n/).at(-1))
  await signup(page, `wallet_${suffix}`, 'buyer')
  await page.goto(`/campaigns/${campaignId}`)
  await expect(page.getByRole('button', { name: /^رزرو با/ })).toBeDisabled()
  await expect(page.getByText(/موجودی کافی نیست/)).toBeVisible()
  await topUp(page, 100000)
  await page.goto(`/campaigns/${campaignId}`)
  await page.getByRole('button', { name: /^رزرو با/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'رزرو شما ثبت شد' })).toBeVisible()
  settleTestCampaign(campaignId)
  settleTestCampaign(campaignId)
  await page.goto('/account')
  await expect(page.locator('.account-item')).toContainText('آزادشده')
  await expect(page.locator('.wallet-panel')).toHaveCount(0)
  await page.goto('/profile')
  await expect(page.locator('.wallet-balance')).toContainText('۱۰۰٬۰۰۰')
  await page.getByText('سابقهٔ تراکنش‌های کیف پول', { exact: true }).click()
  await expect(page.locator('.transaction-row')).toHaveCount(3)
  await expect(page.locator('.transaction-row').filter({ hasText: 'بازگشت وجه' })).toHaveCount(1)
  await page.screenshot({ path: info.outputPath('wallet-desktop.png'), fullPage: true })
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 })
    await noOverflow(page)
    const a11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(a11y.violations).toEqual([])
  }
  await page.screenshot({ path: info.outputPath('wallet-mobile.png'), fullPage: true })
})

test('authenticated mobile buyer and seller screens, forms, and tables', async ({ page }, info) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await login(page, 'buyer_demo_2')
  await expect(page.locator('.account-item').first()).toBeVisible()
  await noOverflow(page)
  await page.screenshot({ path: info.outputPath('buyer-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'سفارش‌های من', exact: true }).click()
  await expect(page.locator('.account-order').first()).toBeVisible()
  await noOverflow(page)
  await page.goto('/auth')
  await page.getByLabel('نام کاربری').fill('seller_demo')
  await page.getByLabel('رمز عبور').fill(password)
  await page.getByRole('button', { name: 'ورود به حساب', exact: true }).click()
  await expect(page.locator('.table-wrap')).toBeVisible()
  await noOverflow(page)
  await page.screenshot({ path: info.outputPath('seller-mobile.png'), fullPage: true })
  const dashboardA11y = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(dashboardA11y.violations).toEqual([])
  await page.getByRole('button', { name: 'محصول جدید', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'افزودن محصول' })).toBeVisible()
  await noOverflow(page)
  await page.screenshot({ path: info.outputPath('product-form-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'کمپین جدید', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'ساخت کمپین جدید' })).toBeVisible()
  await noOverflow(page)
  const formA11y = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(formA11y.violations).toEqual([])
  await page.screenshot({ path: info.outputPath('campaign-form-mobile.png'), fullPage: true })
})

test('server error feedback can recover', async ({ page }) => {
  await page.route('**/api/campaigns/?**', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ errors: 'خطای آزمایشی ارتباط' }),
    }),
  )
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'ارتباط برقرار نشد' })).toBeVisible()
  await page.unroute('**/api/campaigns/?**')
  await page.getByRole('button', { name: 'تلاش دوباره', exact: true }).click()
  await expect(page.locator('.campaign-card').first()).toBeVisible()
})

for (const width of [375, 768, 1024]) {
  test(`responsive RTL screens at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of [
      '/',
      '/campaigns/1',
      '/auth',
      '/how-it-works',
      '/account',
      '/profile',
      '/seller',
    ]) {
      await page.goto(path)
      await expect(page.locator('main h1').first()).toBeVisible()
      if (path === '/') await expect(page.locator('.campaign-card').first()).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await noOverflow(page)
      await page.screenshot({
        path: info.outputPath(`${path.replaceAll('/', '-') || 'home'}-${width}.png`),
        fullPage: true,
      })
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect(results.violations, `${path} at ${width}`).toEqual([])
    }
    if (width === 375) {
      await page.getByRole('button', { name: 'باز کردن فهرست' }).click()
      await expect(page.getByRole('navigation', { name: 'فهرست موبایل' })).toBeVisible()
      await page
        .getByRole('navigation', { name: 'فهرست موبایل' })
        .getByRole('link', { name: 'چطور کار می‌کند؟' })
        .click()
      await expect(page).toHaveURL(/how-it-works/)
    }
  })
}
