import React from "react"

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-12">
      <div className="container mx-auto text-center">
        <p className="text-lg font-semibold">Potato Learn Platform</p>
        <p className="text-gray-400 mt-2">© {new Date().getFullYear()} - All rights reserved</p>
        <div className="mt-4 flex justify-center space-x-6">
          <a href="#" className="text-gray-300 hover:text-white">Privacy</a>
          <a href="#" className="text-gray-300 hover:text-white">Terms</a>
          <a href="#" className="text-gray-300 hover:text-white">Contact</a>
          <a href="#" className="text-gray-300 hover:text-white">FAQ</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer