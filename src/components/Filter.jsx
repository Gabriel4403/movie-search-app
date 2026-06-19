import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../store/moviesSlice";

// Shared Tailwind classes for all filter selects — appearance-none hides the native arrow
// so we can use our own custom ▾ character instead
const SELECT_CLASS =
  "bg-[#1A2E1D] border border-[#243B27] text-[#F0FDF4] p-2 pr-8 rounded appearance-none cursor-pointer w-full";

// Filter bar for genre, rating, year, sort, and optionally personal rating
// Dispatches filter changes directly to Redux so all list pages react immediately
function Filters({ showUserRating = false }) {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.movies.filters);

  // Update a single filter field by name while preserving all other filter values
  function handleChange(e) {
    dispatch(setFilters({ ...filters, [e.target.name]: e.target.value }));
  }

  // Wraps a select with a custom dropdown arrow since appearance-none removes the native one
  function SelectWrapper({ children }) {
    return (
      <div className="relative">
        {children}
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[#F0FDF4]">
          ▾
        </span>
      </div>
    );
  }

  return (
    // 2-column grid on mobile, flex wrap on sm: and above
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 my-4 text-white sm:justify-center">
      <SelectWrapper>
        <select name="genre" value={filters.genre} onChange={handleChange} className={SELECT_CLASS}>
          <option value="">All Genres</option>
          <option value="28">Action</option>
          <option value="35">Comedy</option>
          <option value="18">Drama</option>
          <option value="53">Thriller</option>
          <option value="27">Horror</option>
          <option value="878">Sci-Fi</option>
          <option value="10749">Romance</option>
        </select>
      </SelectWrapper>

      <SelectWrapper>
        <select name="rating" value={filters.rating} onChange={handleChange} className={SELECT_CLASS}>
          <option value="">All TMDb Ratings</option>
          <option value="8">8+</option>
          <option value="7">7+</option>
          <option value="6">6+</option>
        </select>
      </SelectWrapper>

      <SelectWrapper>
        <select name="year" value={filters.year} onChange={handleChange} className={SELECT_CLASS}>
          <option value="">All Years</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
      </SelectWrapper>

      <SelectWrapper>
        <select name="sort" value={filters.sort} onChange={handleChange} className={SELECT_CLASS}>
          <option value="">Sort: Default</option>
          <option value="rating_desc">Rating: High to Low</option>
          <option value="rating_asc">Rating: Low to High</option>
          <option value="year_desc">Year: Newest First</option>
          <option value="year_asc">Year: Oldest First</option>
          <option value="title_asc">Title: A–Z</option>
          <option value="title_desc">Title: Z–A</option>
        </select>
      </SelectWrapper>

      {/* Personal rating filter — only shown on Watched List */}
      {showUserRating && (
        <SelectWrapper>
          <select name="userRating" value={filters.userRating} onChange={handleChange} className={SELECT_CLASS}>
            <option value="">All My Ratings</option>
            <option value="9">My Rating 9+</option>
            <option value="8">My Rating 8+</option>
            <option value="7">My Rating 7+</option>
            <option value="6">My Rating 6+</option>
          </select>
        </SelectWrapper>
      )}
    </div>
  );
}

export default Filters;