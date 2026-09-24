// Builds a wa.me link from any phone number string (spaces, +, dashes all stripped).
export const waLink = (phone, message = '') => {
  const digits = phone.replace(/\D/g, '')
  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${query}`
}
