/** Format a date string nicely for Nepali users */
export const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-NP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

/** Format price in NPR */
export const formatPrice = (amount) =>
    `NPR ${Number(amount).toLocaleString('en-NP')}`

/** Calculate number of days between two dates */
export const daysBetween = (start, end) => {
    const diff = new Date(end) - new Date(start)
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/** Capitalize first letter of a string */
export const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
