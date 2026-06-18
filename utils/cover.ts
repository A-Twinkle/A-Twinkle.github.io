/** 文章默认封面（public 目录下静态资源） */
export const DEFAULT_POST_COVER = '/img/letter.jpg'

export function resolvePostCover(cover: unknown): string {
  const value = String(cover ?? '').trim()
  return value || DEFAULT_POST_COVER
}
