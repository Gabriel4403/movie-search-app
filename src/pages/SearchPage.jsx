import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  searchMovies,
  getMovieDetails,
  openModal,
  closeModal,
  addToWatched,
  addToWatchlist,
  getPopularMovies,
  fetchWatchList,
  fetchWatchedList,
} from "../store/moviesSlice";
import Modal from "../components/Modal";
import MovieCard from "../components/Moviecard";
import SkeletonCard from "../components/Skeletoncard";
import EmptyState, { SearchEmptyIcon } from "../components/Emptystate";

// Search page — lets users search TMDB for movies or browse popular ones
// Also shows Watched/Watchlist badges on results if the movie is already saved
function SearchPage() {
  const [showPopular, setShowPopular] = useState(false);
  // Tracks whether the user has actually submitted a search (vs just typing)
  const [hasSearched, setHasSearched] = useState(false);
  // Stores the query that was actually submitted, separate from the live input value
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [toast, setToast] = useState(null);
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const moviesState = useSelector((state) => state.movies || {});
  const { searchResults = [], popularMovies = [], loading = false, error = null, isModalOpen, movieDetails } = moviesState;

  // Load watchlist and watched list on mount so badge logic has data to check against
  useEffect(() => {
    dispatch(fetchWatchList());
    dispatch(fetchWatchedList());
  }, [dispatch]);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Only trigger a search on form submit, not on every keystroke
  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      dispatch(searchMovies(query));
      setShowPopular(false);
      setHasSearched(true);
      setSubmittedQuery(query.trim());
    }
  }

  function handleMovieClick(id) {
    dispatch(getMovieDetails(id)).then(() => dispatch(openModal()));
  }

  // Add to watchlist — blocks if already in watched or watchlist
  function handleAddWatchList() {
    if (movieDetails) {
      const inWatched = moviesState.watched.find((m) => m.id === movieDetails.id);
      const inWatchlist = moviesState.watchlist.find((m) => m.id === movieDetails.id);
      if (inWatched) { showToast("Already in your Watched list.", "error"); return; }
      if (inWatchlist) { showToast("Already in your Watchlist.", "error"); return; }
      dispatch(addToWatchlist(movieDetails));
      dispatch(closeModal());
      showToast(`"${movieDetails.title}" added to Watchlist!`);
    }
  }

  // Add to watched — blocks if already watched, includes optional user rating
  function handleAddWatched(userRating) {
    if (movieDetails) {
      const exists = moviesState.watched.find((m) => m.id === movieDetails.id);
      if (!exists) {
        dispatch(addToWatched({ ...movieDetails, userRating }));
        dispatch(closeModal());
        const ratingStr = userRating ? ` · ${userRating}/10` : "";
        showToast(`"${movieDetails.title}" added to Watched List!${ratingStr}`);
      } else {
        showToast("Already in your Watched List.", "error");
      }
    }
  }

  // Fetch popular movies only on first click — subsequent clicks reuse cached results
  function fetchPopularMovies() {
    setShowPopular(true);
    setHasSearched(false);
    setQuery("");
    if (popularMovies.length === 0) dispatch(getPopularMovies());
  }

  // Show popular or search results, filtered to movies with posters only, max 20
  const moviesToShow = (showPopular ? popularMovies : searchResults)
    .filter((movie) => movie.poster_path)
    .slice(0, 20);

  return (
    <div className="min-h-screen flex flex-col pt-8 sm:mt-16">
      {/* Toast notification — green for success, red for error */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-sm font-semibold
          ${toast.type === "error" ? "bg-red-600 text-white" : "bg-[#4ADE80] text-[#0E1510]"}`}>
          {toast.message}
        </div>
      )}

      <div className="px-4 pt-20">
        <div className="sm:w-120 mx-auto w-full max-w-4xl bg-[#1A2E1D] rounded-2xl shadow p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <form onSubmit={handleSearch} className="flex flex-grow min-w-0 items-center gap-2">
              <input
                type="text"
                placeholder="Search for movies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border text-white border-gray-400 p-2 rounded flex-grow min-w-0 bg-transparent"
              />
              <button type="submit"
                className="bg-[#4ADE80] hover:bg-[#22C55E] cursor-pointer text-[#0E1510] font-semibold px-2 py-2 rounded whitespace-nowrap">
                Search
              </button>
            </form>
            <button onClick={fetchPopularMovies}
              className="bg-[#4ADE80] hover:bg-[#22C55E] cursor-pointer text-[#0E1510] font-semibold px-20 sm:px-2 py-2 rounded whitespace-nowrap sm:w-auto">
              Popular Movies
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => dispatch(closeModal())}
        movie={movieDetails}
        onAddWatchList={handleAddWatchList}
        onAddWatched={handleAddWatched}
        showDeleteButton={false}
      />

      <div className="mx-auto w-full max-w-4xl px-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <EmptyState icon={<SearchEmptyIcon />} title="Something went wrong" subtitle={error} />
        ) : moviesToShow.length === 0 ? (
          // Show contextual empty state message depending on whether user has searched yet
          <EmptyState
            icon={<SearchEmptyIcon />}
            title={
              showPopular
                ? "No popular movies found"
                : hasSearched
                ? `No results for "${submittedQuery}"`
                : "Search for movies"
            }
            subtitle={!hasSearched && !showPopular ? "Type a title above or browse popular movies" : null}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {moviesToShow.map((movie) => {
              // Check if the movie is already in watchlist or watched for badge display
              const isWatched = moviesState.watched?.some((m) => m.id === movie.id);
              const isInWatchlist = moviesState.watchlist?.some((m) => m.id === movie.id);
              const badge = isWatched ? "Watched" : isInWatchlist ? "Watchlist" : null;
              return (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => handleMovieClick(movie.id)}
                  badge={badge}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;