import React from 'react';

const Footer = () => {
  return (
    <footer className="text-black py-7" style={{ backgroundColor: '#fafafa', boxShadow: '0px -4px 10px rgba(133, 131, 131, 0.1)' }}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h1 className="text-2xl font-bold">
              Job<span className="text-[black]">Voyage</span>
            </h1>
            <p className="text-xs md:text-sm opacity-75">© 2024-25 PRAV Company. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
            <a href="#" className="text-sm md:text-base text-black opacity-80 hover:opacity-100 transition duration-300">About Us</a>
            <a href="#" className="text-sm md:text-base text-black opacity-80 hover:opacity-100 transition duration-300">Privacy Policy</a>
            <a href="#" className="text-sm md:text-base text-black opacity-80 hover:opacity-100 transition duration-300">Terms of Service</a>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
