export function formatBytes(size = 0) {
  if (size < 1024)
    return `${size} B`
  if (size < 1024 ** 2)
    return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 ** 2).toFixed(1)} MB`
}
