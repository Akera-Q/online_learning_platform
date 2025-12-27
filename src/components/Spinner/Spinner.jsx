import React from "react"

const Spinner = ({ size = 24 }) => (
  <div
    className="animate-spin rounded-full border-t-2 border-b-2 border-blue-600"
    style={{ width: size, height: size }}
  />
)

export default Spinner
