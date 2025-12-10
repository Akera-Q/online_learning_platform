// Format date
export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Truncate text
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substring(0, length) + "..."
}

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Get user initials
export const getInitials = (name) => {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

//Another version without options for formatDate, use if needed.

// export const formatDate = (dateString) => {
//   return new Date(dateString).toLocaleDateString()
// }

// export const truncateText = (text, length = 100) => {
//   if (text.length <= length) return text
//   return text.substring(0, length) + "..."
// }