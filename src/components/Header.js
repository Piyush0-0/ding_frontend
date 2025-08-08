import React from "react";
import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';

/**
 * @typedef {import('../types').Restaurant} Restaurant
 */

/**
 * @param {Object} props
 * @param {string} props.name
 * @param {string} props.address
 * @param {number} [props.minOrderAmount]
 * @param {number} [props.deliveryCharge]
 * @param {number} [props.packagingCharge]
 * @param {string} [props.minimumPrepTime]
 * @param {number} [props.rating] - Average restaurant rating
 * @param {number} [props.reviewCount] - Total number of reviews
 */
const Header = ({ name, address, minimumPrepTime, rating = 4.5, reviewCount = 120 }) => {
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'bg-green-50';
    if (rating >= 3) return 'bg-yellow-50';
    if (rating >= 2) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div className="w-full">
      <div className="w-full py-4">
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col">
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-light text-gray-900 font-bio-rhyme">{name}</h1>
                  <div className={`inline-flex items-center space-x-2 ${getRatingColor(rating)} px-3 py-1 rounded-lg`}>
                    <FaStar className="text-yellow-400" />
                    <span className="text-sm font-medium text-gray-900 font-raleway">{rating}</span>
                    <span className="text-xs text-gray-500 font-raleway">({reviewCount})</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 font-raleway font-light">{address}</p>
                {minimumPrepTime != null && (
                  <p className="mt-1 text-sm text-gray-600 font-raleway">
                    Your food will be ready in {minimumPrepTime} mins
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Header.propTypes = {
  name: PropTypes.string.isRequired,
  address: PropTypes.string,
  minOrderAmount: PropTypes.number,
  deliveryCharge: PropTypes.number,
  packagingCharge: PropTypes.number,
  minimumPrepTime: PropTypes.number,
  rating: PropTypes.number,
  reviewCount: PropTypes.number
};

export default Header;
