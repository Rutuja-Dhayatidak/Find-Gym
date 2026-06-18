import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);
    window.addEventListener("toggle-sidebar", handleToggle);
    window.addEventListener("close-sidebar", handleClose);
    return () => {
      window.removeEventListener("toggle-sidebar", handleToggle);
      window.removeEventListener("close-sidebar", handleClose);
    };
  }, []);

  const handleHamburgerClick = () => {
    window.dispatchEvent(new Event("toggle-sidebar"));
  };

  return (
    <nav
      className="
        fixed
        top-0
        left-0
        w-full
        lg:w-[calc(100%-100px)]
        z-50
        bg-black/20
        backdrop-blur-xl
        border-b
        border-white/10
        shadow-lg
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Find <span className="text-[#FF7A00]">Gym</span>
              </h1>
            </Link>
          </div>



          {/* Right Area (Desktop + Mobile handles) */}
          <div className="flex items-center gap-2 md:gap-4 justify-end">
            
            {/* Mobile Location button */}
            <button
              className="
                flex
                md:hidden
                items-center
                gap-1.5
                px-3
                py-1.5
                rounded-full
                border
                border-white/20
                bg-white/10
                backdrop-blur-md
                text-white
                text-xs
                font-bold
              "
            >
              <span>PUNE</span>
              📍
            </button>

            {/* Desktop Right (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-4">
              <button
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-full
                  border
                  border-white/20
                  bg-white/10
                  backdrop-blur-md
                  text-white
                  hover:bg-white/20
                  transition-all
                "
              >
                <span className="font-semibold text-sm">PUNE</span>
                📍
              </button>


              <Link
                to="/gym-owner/login"
                className="
                  text-zinc-300
                  hover:text-[#FF7A00]
                  font-semibold
                  text-sm
                  transition-all
                  mr-2
                "
              >
                Owner Portal
              </Link>

              <Link
                to="/trainer/register"
                className="
                  text-zinc-300
                  hover:text-[#a3ff12]
                  font-semibold
                  text-sm
                  transition-all
                  mr-2
                "
              >
                Register as Trainer
              </Link>

              <Link
                to="/register"
                className="
                  px-6
                  py-2.5
                  rounded-full
                  bg-[#FF7A00]
                  hover:bg-[#E66E00]
                  text-white
                  font-medium
                  shadow-lg
                  hover:scale-105
                  transition-all
                "
              >
                Register
              </Link>
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              className="md:hidden text-white p-1"
              onClick={handleHamburgerClick}
            >
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;