import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import { Helmet } from "react-helmet";
import WelcomePopup from "../components/WelcomePopup";

const MenuPage = () => {
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState("");
  const [tableId, setTableId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const categoryRefs = useRef({});

  // Extract tableId from the URL query parameters
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tableIdFromUrl = searchParams.get("tableId");
    if (tableIdFromUrl) {
      setTableId(tableIdFromUrl);
      fetchMenu(tableIdFromUrl);
    } else {
      setError("Table ID is missing in the URL");
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Find the current category based on scroll position
      Object.entries(categoryRefs.current).forEach(([category, ref]) => {
        if (ref && ref.offsetTop <= scrollPosition + 100) {
          setActiveCategory(category);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchMenu = async (tableId) => {
    try {
      const response = await apiClient.get(`/menu/${tableId}`);
      setMenu(response.data.items);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch menu");
    }
  };

  // Group menu items by category
  const menuByCategory = menu.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>Menu Categories | DING! - Order food at your table</title>
        <meta name="description" content="Browse through our menu categories and discover a wide variety of delicious food options. Find your favorite dishes and order online." />
        <meta name="keywords" content="food menu, restaurant categories, food categories, menu items, food delivery menu" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/16X16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/32X32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicons/96X96.png" />
      </Helmet>
      {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
      <div className="font-sans p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              Thrupthiga Thinandi • 20-25 mins
            </h1>
            <p className="text-sm text-gray-500">Menu for Table {tableId}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search for dishes"
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405M15 17l-1.405-1.405m-3.72 3.72L6 21l1.405-1.405m3.72-3.72L9 15m-4 0l5-5m4-4h5l-1.405-1.405M9 3L6 6m0 0L9 9m6-6l5 5"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow text-gray-700 hover:bg-gray-100">
            <span>Ratings 4.0+</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow text-gray-700 hover:bg-gray-100">
            <span>Bestseller</span>
          </button>
        </div>

        {/* Sticky Category Header */}
        {activeCategory && (
          <div className="sticky top-0 z-50 bg-white shadow-md py-2 px-4 mb-4 transition-all duration-300">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-800 ml-6">
                {activeCategory}
              </h2>
            </div>
          </div>
        )}

        {/* Menu Categories */}
        {Object.entries(menuByCategory).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 
              ref={el => categoryRefs.current[category] = el}
              className="text-xl font-bold text-gray-800 mb-4 ml-6"
            >
              {category}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
            <Link
              to={`/restaurant/${item.restaurant_id}`}
              key={item.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="bg-red-100 text-red-600 text-xs font-semibold inline-block px-2 py-1 rounded-full mb-2">
                    Bestseller
                  </p>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                </div>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg ml-4"
                  />
                )}
              </div>
              <p className="text-sm text-green-600 font-semibold mb-3">
                ⭐ {item.rating} ({item.reviews})
              </p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-lg text-gray-900">
                  ₹{item.price.toFixed(2)}
                </p>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  ADD
                </button>
              </div>
              <button className="mt-3 text-sm text-pink-500 hover:text-pink-600">
                Save to Eatlist
              </button>
            </Link>
          ))}
        </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MenuPage;
