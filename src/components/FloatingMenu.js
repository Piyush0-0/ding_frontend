import React, { useEffect, useRef } from "react";
import "./FloatingMenu.css"; // Ensure styles are applied
import { FaBars, FaTimes } from "react-icons/fa";
import { Menu, X, Book } from "lucide-react";

const FloatingMenu = ({
  categories,
  selectedCategory,
  onSelectCategory,
  menuOpen,
  setMenuOpen,
  isCartOpen,
  className = ""
}) => {
  const menuRef = useRef();

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  const handleCategoryClick = (category) => {
    onSelectCategory(category);
    setMenuOpen(false); // Collapse menu
  };

  return (
    <div className={`floating-menu-container ${className}`}>
      {/* Floating Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`fixed right-[5vw] bg-[#c90024] text-white rounded-full p-2 shadow-lg hover:bg-[#a8001d] transition-all duration-300 z-[60] flex flex-col items-center w-14 h-14 ${
          isCartOpen ? 'bottom-[120px]' : 'bottom-[80px]'
        }`}
      >
        {menuOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <>
            <Book className="w-6 h-6" />
            <span className="text-[9px] font-medium font-raleway mt-0.5">MENU</span>
          </>
        )}
      </button>

      {/* Expandable Category List */}
      {menuOpen && (
        <div ref={menuRef} className="menu-content z-[60]">
          <h4 className="menu-title font-raleway">Categories</h4>
          <ul className="menu-list">
            {categories.map((category) => (
              <li
                key={category.name}
                className={`menu-item font-raleway ${
                  selectedCategory === category.name ? "selected" : ""
                }`}
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FloatingMenu;
