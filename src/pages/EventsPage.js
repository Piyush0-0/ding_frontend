import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import AppBar from '../components/AppBar';
import { useAuth } from '../contexts/AuthContext';
import BottomNavBar from '../components/BottomNavBar';
import { X } from 'react-feather';

const BookingPopup = ({ event, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    numberOfGuests: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Blurred background */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Popup container */}
      <div className="absolute bottom-0 left-0 right-0 h-[75vh] bg-white rounded-t-3xl transform transition-transform duration-300 ease-out">
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
        
        <div className="px-6 pb-6 h-full overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Close popup"
          >
            <X size={20} />
          </button>

          {/* Event Details Header */}
          <div className="mb-6 pr-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {event.date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {event.time}
                </span>
              </div>
              <div className="flex items-center text-[#c90024] font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>₹{event.price} per person</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#c90024] focus:border-[#c90024]"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#c90024] focus:border-[#c90024]"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#c90024] focus:border-[#c90024]"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                <input
                  type="number"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#c90024] focus:border-[#c90024]"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#c90024] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#a8001d] transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Dummy events data
  const dummyEvents = [
    {
      id: 1,
      title: "Wine Tasting Evening",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      time: "19:00",
      location: "Main Dining Hall",
      description: "Join us for an exclusive wine tasting event featuring premium selections from around the world. Expert sommeliers will guide you through each tasting.",
      price: 2500,
      image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop",
      is_featured: true,
      booking_url: "#"
    },
    {
      id: 2,
      title: "Chef's Table Experience",
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      time: "20:00",
      location: "Private Dining Room",
      description: "An intimate dining experience with our head chef. Limited to 8 guests, enjoy a specially curated menu with wine pairings.",
      price: 5000,
      image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
      is_featured: false,
      booking_url: "#"
    },
    {
      id: 3,
      title: "Sunday Brunch Special",
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      time: "11:00",
      location: "Garden Terrace",
      description: "Enjoy our lavish Sunday brunch with live music, unlimited mimosas, and a special dessert station.",
      price: 1800,
      image_url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=600&fit=crop",
      is_featured: true,
      booking_url: "#"
    },
    {
      id: 4,
      title: "Cooking Masterclass",
      date: new Date(new Date().setDate(new Date().getDate() + 10)),
      time: "15:00",
      location: "Demonstration Kitchen",
      description: "Learn to prepare signature dishes from our award-winning chefs. Includes recipe cards and a tasting session.",
      price: 3000,
      image_url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop",
      is_featured: false,
      booking_url: "#"
    }
  ];

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch restaurant details
        const restaurantResponse = await apiClient.get(`/restaurants/${restaurantId}`);
        console.log('Restaurant response:', restaurantResponse.data);
        setRestaurant(restaurantResponse.data.restaurant);
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Failed to load restaurant details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurant();
    } else {
      setError('Restaurant ID is missing');
      setIsLoading(false);
    }
  }, [restaurantId]);

  const handleBack = () => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const handleBookingSubmit = async (formData) => {
    // Here you would typically make an API call to submit the booking
    console.log('Booking submitted:', {
      event: selectedEvent,
      customerDetails: formData
    });
    // For now, just show a success message
    alert('Booking submitted successfully!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-14 pb-16">
        <AppBar title="Upcoming Events" showBack onBack={handleBack} />
        <div className="flex justify-center items-center h-[calc(100vh-3.5rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c90024]"></div>
        </div>
        <BottomNavBar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-14 pb-16">
        <AppBar title="Upcoming Events" showBack onBack={handleBack} />
        <div className="flex justify-center items-center h-[calc(100vh-3.5rem)]">
          <p className="text-red-500">{error}</p>
        </div>
        <BottomNavBar />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{restaurant ? `${restaurant.name} - Upcoming Events | DING!` : 'Upcoming Events | DING!'}</title>
        <meta name="description" content={`Discover and book upcoming events at ${restaurant?.name || 'our restaurant'}.`} />
      </Helmet>
      <div className="min-h-screen bg-gray-50 pt-14 pb-16">
        <AppBar title="Upcoming Events" showBack onBack={handleBack} />
        
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {dummyEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/* Event Image */}
                <div className="relative h-48">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  {event.is_featured && (
                    <div className="absolute top-4 left-4 bg-[#c90024] text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900 font-raleway">{event.title}</h2>
                    <span className="text-[#c90024] font-semibold">₹{event.price}</span>
                  </div>

                  <div className="space-y-3">
                    {/* Date and Time */}
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {event.date.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} at {event.time}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.location}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm">{event.description}</p>

                    {/* Book Button */}
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="w-full bg-[#c90024] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#a8001d] transition-colors duration-200 mt-4"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomNavBar />

        {/* Booking Popup */}
        {selectedEvent && (
          <BookingPopup
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSubmit={handleBookingSubmit}
          />
        )}
      </div>
    </>
  );
};

export default EventsPage; 