import React from 'react';
import PropTypes from 'prop-types';

const ExpectedOrderTime = ({ items }) => {
  // Find the item with the highest prep time
  const maxPrepTime = items?.reduce((max, item) => {
    const itemPrepTime = item.prep_time || 15; // Default to 15 minutes if not specified
    return Math.max(max, itemPrepTime);
  }, 0);

  // Only show minutes, rounded up
  const mins = Math.ceil(maxPrepTime);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-700 font-raleway">Your order will be served in</span>
      <span className="text-xs font-bold text-[#ff5722] font-raleway">{mins} mins</span>
    </div>
  );
};

ExpectedOrderTime.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      prep_time: PropTypes.number
    })
  ).isRequired
};

export default ExpectedOrderTime; 