export function formatDateOnly(raw: unknown): string {
  if (!raw) return ''

  if (typeof raw === 'string') {
    const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
    if (match) {
      return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`
    }
  }

  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return `${raw.getFullYear()}年${raw.getMonth() + 1}月${raw.getDate()}日`
  }

  const text = String(raw)
  const match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (match) {
    return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`
  }

  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return text
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function toDateAttr(raw: unknown): string {
  if (typeof raw === 'string') return raw.slice(0, 10)
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    const y = raw.getFullYear()
    const m = String(raw.getMonth() + 1).padStart(2, '0')
    const d = String(raw.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return ''
}
