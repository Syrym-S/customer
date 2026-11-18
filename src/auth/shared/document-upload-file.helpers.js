export function getSelectedFile(value) {
  if (!value) {
    return null;
  }

  return value?.[0] || null;
}