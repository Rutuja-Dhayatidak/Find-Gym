import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [registerDropdownOpen, setRegisterDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem("cart_items") || "[]");
      setCartItems(items);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);
    window.addEventListener("toggle-sidebar", handleToggle);
    window.addEventListener("close-sidebar", handleClose);
    loadCart();
    window.addEventListener("cart-updated", loadCart);
    return () => {
      window.removeEventListener("toggle-sidebar", handleToggle);
      window.removeEventListener("close-sidebar", handleClose);
      window.removeEventListener("cart-updated", loadCart);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".register-dropdown-container")) {
        setRegisterDropdownOpen(false);
      }
      if (!event.target.closest(".cart-dropdown-container")) {
        setCartDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const removeFromCart = (id) => {
    const updated = cartItems.filter(item => item._id !== id);
    localStorage.setItem("cart_items", JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const clearCart = () => {
    localStorage.removeItem("cart_items");
    setCartItems([]);
    window.dispatchEvent(new Event("cart-updated"));
  };

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
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                livesale<span className="text-[#FF7A00]">.Fitness</span>
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


              <div className="relative register-dropdown-container">
                <button
                  onClick={() => setRegisterDropdownOpen(!registerDropdownOpen)}
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
                    cursor-pointer
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <span>Register</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${registerDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {registerDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-black/95 border border-zinc-800/80 backdrop-blur-xl shadow-2xl p-2.5 z-50 flex flex-col gap-1.5 animate-fadeIn">
                    <Link
                      to="/gym-owner/login"
                      onClick={() => setRegisterDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-[#FF7A00] hover:bg-white/[0.05] rounded-xl transition-all font-semibold text-xs text-left"
                    >
                      <span className="text-base">🏋️</span>
                      <span>Owner Login / Register</span>
                    </Link>
                    <Link
                      to="/trainer/register"
                      onClick={() => setRegisterDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-[#a3ff12] hover:bg-white/[0.05] rounded-xl transition-all font-semibold text-xs text-left"
                    >
                      <span className="text-base">👥</span>
                      <span>Register as Trainer</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setRegisterDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-[#FF7A00] hover:bg-white/[0.05] rounded-xl transition-all font-semibold text-xs text-left border-t border-zinc-800/60"
                    >
                      <span className="text-base">👤</span>
                      <span>Normal Register</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Cart Icon & Dropdown */}
              <div className="relative cart-dropdown-container">
                <button
                  onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                  className="
                    p-2.5
                    rounded-full
                    bg-white/10
                    border
                    border-white/20
                    hover:bg-white/20
                    text-white
                    shadow-lg
                    hover:scale-105
                    transition-all
                    cursor-pointer
                    flex
                    items-center
                    justify-center
                    relative
                  "
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#FF7A00] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                      {cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)}
                    </span>
                  )}
                </button>

                {cartDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-black/95 border border-zinc-800/80 backdrop-blur-xl shadow-2xl p-4 z-50 flex flex-col gap-3 animate-fadeIn text-left">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛒</span>
                        <h4 className="font-extrabold text-sm text-white">Your Cart</h4>
                        <span className="bg-[#FF7A00]/10 text-[#FF7A00] text-[10px] font-black px-2 py-0.5 rounded-full">
                          {cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)} items
                        </span>
                      </div>
                      {cartItems.length > 0 && (
                        <button
                          onClick={clearCart}
                          className="text-xs text-zinc-500 hover:text-red-400 font-bold transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="py-8 text-center flex flex-col items-center justify-center">
                        <span className="text-3xl mb-2">🛍️</span>
                        <p className="text-zinc-400 text-xs font-semibold">Your cart is empty</p>
                        <p className="text-zinc-600 text-[10px] mt-1">Add items from the store to get started</p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
                          {cartItems.map((item) => (
                            <div key={item._id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all justify-between">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                                  {item.image ? (
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-lg">💊</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate w-36" title={item.name}>
                                    {item.name.split(" - ")[0]}
                                  </p>
                                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider truncate">
                                    {item.brand || "Supplement"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white">
                                  ₹{item.price} <span className="text-zinc-650 font-normal text-[10px]">x{item.qty || 1}</span>
                                </span>
                                <button
                                  onClick={() => removeFromCart(item._id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all flex items-center justify-center"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-zinc-800 pt-3 flex flex-col gap-3">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-zinc-400">Total Amount:</span>
                            <span className="text-sm font-black text-white">
                              ₹{cartItems.reduce((acc, i) => acc + (i.qty || 1) * i.price, 0)}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              alert("Order placed successfully!");
                              clearCart();
                              setCartDropdownOpen(false);
                            }}
                            className="w-full py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-extrabold text-xs text-center transition-all uppercase tracking-widest shadow-lg"
                          >
                            Proceed to Checkout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
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