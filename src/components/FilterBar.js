const FilterBar = ({ activeFilter, onFilterChange }) => {
  const getButtonClass = (filter) => {
    const baseClass = "px-4 py-1.5 text-xs rounded-md font-raleway font-light whitespace-nowrap";
    return `${baseClass} ${
      activeFilter === filter 
        ? "bg-[#c90024] text-white" 
        : "bg-gray-100 text-gray-700"
    }`;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto bg-white py-1">
      <button
        className={getButtonClass("all")}
        onClick={() => onFilterChange("all")}
      >
        All
      </button>
      <button
        className={getButtonClass("ratings")}
        onClick={() => onFilterChange("ratings")}
      >
        Ratings 4.0+
      </button>
      <button
        className={getButtonClass("bestseller")}
        onClick={() => onFilterChange("bestseller")}
      >
        Bestseller
      </button>
    </div>
  );
};

export default FilterBar;