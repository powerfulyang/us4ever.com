export function getCursor(id?: string) {
  if (id) {
    return { id }
  }
  return undefined
}
