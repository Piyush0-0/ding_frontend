import React, { useState, useEffect, useRef } from "react";
import { RefreshCw } from "react-feather";
import apiClient from "../api/apiClient";

// Example restaurant stories (replace with real data as needed)
const defaultStories = [
  "Founded in 1982, our restaurant started as a tiny street-side stall and is now a city landmark.",
  "The chef's signature dish is inspired by a recipe passed down for three generations.",
  "Every morning, we source our vegetables from local farmers to ensure the freshest flavors.",
  "Our interiors are inspired by the vibrant markets of Marrakech, bringing a slice of Morocco to your table.",
  "We once served a meal to a famous Bollywood star who called our biryani 'unforgettable'.",
  "The mural on our main wall was painted by a renowned local artist in just two days."
];

const OrderGroupTrivia = ({ stories: propStories }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fetchedStories, setFetchedStories] = useState(null);
  const intervalRef = useRef();

  // Placeholder for API fetch logic
  useEffect(() => {
    // Example: fetch('/api/restaurant/trivia').then(...)
    // If you want to fetch from an API, do it here and call setFetchedStories(responseData)
    // For now, do nothing (keeps fallback to defaultStories)
  }, []);

  const storyList = propStories || fetchedStories || defaultStories;

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % storyList.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [paused, storyList.length]);

  // Pause on tap/hold
  const handlePause = () => setPaused(true);
  const handleResume = () => setPaused(false);

  return (
    <div className="mb-4 max-w-3xl mx-auto w-full">
      <h2 className="text-xs font-semibold text-[#c90024] font-raleway mb-2">Trivia about the restaurant</h2>
      <div
        className="relative bg-white rounded-2xl shadow p-4 flex flex-col items-center min-h-[80px]"
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        <div className="w-full max-w-2xl mx-auto text-center flex items-center justify-center px-2">
          <span className="italic text-gray-700 text-base font-raleway transition-opacity duration-300 break-words whitespace-pre-line">
            {storyList[current]}
          </span>
        </div>
        {/* Dots indicator */}
        <div className="mt-4 flex gap-1 justify-center">
          {storyList.map((_, idx) => (
            <button
              key={idx}
              className={`inline-block w-2 h-2 rounded-full focus:outline-none transition-colors duration-200 ${idx === current ? 'bg-[#c90024]' : 'bg-gray-300'}`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to story ${idx + 1}`}
              tabIndex={0}
            />
          ))}
        </div>
      </div>
      {/* Review Card */}
      <div className="mb-4 max-w-3xl mx-auto w-full">
        <div className="relative bg-white rounded-2xl shadow p-4 flex flex-col items-center min-h-[80px] mt-2">
          {/* Centered stars and rating */}
          <div className="flex items-center justify-center mb-2">
            {[1,2,3,4,5].map((i) => (
              <svg key={i} className={`w-5 h-5 ${i <= 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
            ))}
            <span className="ml-2 text-lg font-bold text-gray-700">4.0</span>
          </div>
          {/* Review text */}
          <div className="italic text-gray-700 text-base font-raleway text-center">
            "The food was absolutely delicious and the ambiance made our evening special! Will definitely come back."
          </div>
        </div>
      </div>
    </div>
  );
};

const fetchReviews = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/restaurants/${restaurantId}/restaurant-reviews`);
    if (response.data && Array.isArray(response.data.reviews)) {
      return response.data.reviews;
    }
  } catch (e) {
    console.error("Failed to fetch reviews", e);
  }
  return [];
};

const ReviewSlider = ({ restaurantId }) => {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    if (!restaurantId) return;
    console.log('ReviewSlider: restaurantId', restaurantId);
    fetchReviews(restaurantId).then((data) => {
      console.log('ReviewSlider: fetched reviews', data);
      setReviews(data);
    });
  }, [restaurantId]);

  useEffect(() => {
    if (paused || reviews.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [paused, reviews.length]);

  const handlePause = () => setPaused(true);
  const handleResume = () => setPaused(false);

  if (!reviews.length) return null;

  const review = reviews[current];
  const rating = Math.round(review.rating);

  return (
    <div className="mb-4 max-w-3xl mx-auto w-full">
      <div
        className="relative bg-white rounded-2xl shadow p-4 flex flex-col items-center min-h-[80px] mt-2"
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        {/* Centered stars and rating */}
        <div className="flex items-center justify-center mb-2">
          {[1,2,3,4,5].map((i) => (
            <svg key={i} className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
          ))}
          <span className="ml-2 text-lg font-bold text-gray-700">{review.rating}</span>
        </div>
        {/* Review text */}
        <div className="italic text-gray-700 text-base font-raleway text-center">
          {review.comment || review.text || "No comment provided."}
        </div>
        {/* Dots indicator */}
        <div className="mt-4 flex gap-1 justify-center">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              className={`inline-block w-2 h-2 rounded-full focus:outline-none transition-colors duration-200 ${idx === current ? 'bg-[#c90024]' : 'bg-gray-300'}`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to review ${idx + 1}`}
              tabIndex={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderGroupTrivia;
export { ReviewSlider }; 