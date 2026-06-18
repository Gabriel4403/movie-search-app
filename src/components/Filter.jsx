import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../store/moviesSlice";

const SELECT_CLASS =
  "bg-[#1A2E1D] border border-[#243B27] text-[#F0FDF4] p-2 pr-8 rounded appearance-none cursor-pointer w-full";

function Filters({ showUserRating = false }) {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.movies.filters);

  function handleChange(e) {
    dispatch(setFilters({ ...filters, [e.target.name]: e.target.value }));
  }

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