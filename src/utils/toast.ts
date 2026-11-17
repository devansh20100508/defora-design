export function showToast(message: string, timeout = 2500) {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, timeout } }))
}
