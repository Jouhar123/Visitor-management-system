'use client';
import React, { useState } from "react";
import { Menu, X } from "lucide-react";


const Navbar = ({ onMenuSelect }) => {


  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleSelect = (section) => {
    onMenuSelect(section);
    toggleDrawer();
  };

  return (
    <div className="relative h-[10vh] w-full">
      {/* Navbar Header */}
      <div className="flex items-center justify-between h-full px-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md">
        <button onClick={toggleDrawer} className="text-blue-700 focus:outline-none">
          <Menu size={28} />
        </button>
        <h1 className="text-2xl font-bold text-blue-700">Admin Dashboard</h1>
        <div className="flex items-center space-x-4 ml-auto">
 
        </div>
      </div>

      {/* Side Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-xl font-semibold text-blue-700">Menu</h2>
          <button onClick={toggleDrawer}>
            <X size={24} className="text-blue-700" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-4 text-blue-700">
          <button onClick={() => handleSelect('dashboard')} className="text-left hover:underline">Dashboard</button>
          <button onClick={() => handleSelect('visitors')} className="text-left hover:underline">Visitors</button>
          <button onClick={() => handleSelect('sponsors')} className="text-left hover:underline">Sponsors</button>
          <button onClick={() => handleSelect('reports')} className="text-left hover:underline">Reports</button>
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleDrawer}
          className="fixed inset-0 bg-black opacity-30 z-40"
        />
      )}
    </div>
  );
};

export default Navbar;
