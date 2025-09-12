import React from 'react';

const Footer = () => {
  return (
    <footer className="h-[10vh] w-full bg-blue-100 border-t border-blue-200 flex flex-col justify-center items-center text-center px-4">
      <p className="text-blue-700 font-semibold text-lg">© {new Date().getFullYear()} Visitor Management System</p>
   
      <div className="mt-2 flex space-x-4 text-blue-500 text-sm">
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
        <a href="/terms" className="hover:underline">Terms of Service</a>
        <a href="/contact" className="hover:underline">Contact Us</a>
      </div>
    </footer>
  );
};
export default Footer;
