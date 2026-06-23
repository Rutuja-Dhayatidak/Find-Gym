import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#000000] border-t border-gray-800 text-gray-400">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              livesale<span className="text-[#FF7A00]">.Fitness</span>
            </h1>
            <p className="text-gray-400 text-base">
              Making fitness accessible by connecting you with the perfect gym and trainers in your area.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Quick Links</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Home</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Gyms</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Contact Information</h3>
                <ul className="mt-4 space-y-4">
                  <li className="text-base text-gray-400">contact@livesale.fitness</li>
                  <li className="text-base text-gray-400">+1 (555) 123-4567</li>
                  <li className="text-base text-gray-400">123 Fitness Ave, Health City, CA 90210</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-500 xl:text-center">
            &copy; {new Date().getFullYear()} livesale.Fitness. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
