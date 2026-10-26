export const number = (value: number) => new Intl.NumberFormat('fa-IR').format(value)
export const money = (value: number) => number(value)
export const date = (value: string) =>
  new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeZone: 'Asia/Tehran' }).format(
    new Date(value),
  )
export function remaining(value: string) {
  const hours = Math.ceil((new Date(value).getTime() - Date.now()) / 3600000)
  if (hours <= 0) return 'مهلت پایان یافته'
  return hours >= 24
    ? `${number(Math.ceil(hours / 24))} روز باقی‌مانده`
    : `${number(hours)} ساعت باقی‌مانده`
}
export const statusLabels: Record<string, string> = {
  draft: 'پیش‌نویس',
  active: 'در حال جمع‌آوری',
  funded: 'حدنصاب تکمیل شد',
  successful: 'خرید موفق',
  failed: 'حدنصاب تکمیل نشد',
  cancelled: 'لغوشده',
  converted: 'تبدیل به سفارش',
  released: 'آزادشده',
  confirmed: 'تأییدشده',
  shipped: 'ارسال‌شده',
  completed: 'تحویل‌شده',
}
