import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  openModal,
  closeModal,
  getMovieDetails,
  fetchWatchedList,
  removeFromWatched,
  updateUserRating,
  moveToWatchlist,
} from "../store/moviesSlice";
import Modal from "../components/Modal";
import Filters from "../components/Filter";
import MovieCard from "../components/Moviecard";
import SkeletonCard from "../components/Skeletoncard";
import EmptyState, { WatchedEmptyIcon } from "../components/Emptystate";

function applyFiltersAndSort(list, filters) {
  let result = [...list];
  if (filters.genre) result = result.filter((m) => m.genre_ids?.includes(Number(filters.genre)));
  if (filters.rating) result = result.filter((m) => m.rating >= Number(filters.rating));
  if (filters.year) result = result.filter((m) => new Date(m.release_date).getFullYear() === Number(filters.year));
  if (filters.userRating) result = result.filter((m) => m.userRating >= Number(filters.userRating));

  switch (filters.sort) {
    case "rating_desc": return result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "rating_asc":  return result.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
    case "year_desc":   return result.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    case "year_asc":    return result.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
    case "title_asc":   return result.sort((a, b) => a.title.localeCompare(b.title));
    case "title_desc":  return result.sort((a, b) => b.title.localeCompare(a.title));
    default: return result;
  }
}

function WatchedList() {
  const dispatch = useDispatch();
  const [toast, setToast] = useState(null);
  const moviesState = useSelector((state) => state.movies || {});
  const { watched, isModalOpen, movieDetails, filters, loading } = moviesState;

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => { dispatch(fetchWatchedList()); }, [dispatch]);

  function handleMovieClick(id) {
    dispatch(getMovieDetails(id)).then(() => dispatch(openModal()));
  }

  function handleDeleteMovie(movieId) {
    const title = movieDetails?.title;
    dispatch(removeFromWatched(movieId));
    dispatch(closeModal());
    showToast(`"${title}" removed from Watched List.`);
  }

  function handleEditRating(newRating) {
    if (movieDetails) {
      dispatch(updateUserRating({ movieId: movieDetails.id, userRating: newRating }));
      dispatch(closeModal());
      const msg = newRating ? `Rating updated to ${newRating}/10` : "Rating cleared.";
      showToast(msg);
    }
  }

  function handleMoveToWatchlist() {
    if (movieDetails) {
      const movie = watched.find((m) => m.id === movieDetails.id);
      if (movie) {
        dispatch(moveToWatchlist(movie));
        dispatch(closeModal());
        showToast(`"${movie.title}" moved back to Watchlist.`);
      }
    }
  }

  
  const openMovieInWatched = movieDetails
    ? watched.find((m) => m.id === movieDetails.id)
    : null;

  const filtered = applyFiltersAndSort(watched, filters);

  return (
  <div className="mt-24 pt-16 p-4 min-h-screen">
    {toast && (
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-sm font-semibold
        ${toast.type === "error" ? "bg-red-600 text-white" : "bg-[#4ADE80] text-[#0E1510]"}`}>
        {toast.message}
      </div>
    )}

    <Modal
      isOpen={isModalOpen}
      onClose={() => dispatch(closeModal())}
      movie={movieDetails}
      showWatchListButton={false}
      showWatchedButton={false}
      showDeleteButton={true}
      showMoveToWatchlistButton={true}
      onDeleteMovie={handleDeleteMovie}
      onEditRating={handleEditRating}
      onMoveToWatchlist={handleMoveToWatchlist}
      existingUserRating={openMovieInWatched?.userRating}
    />

    <div className="mx-auto w-full max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2 text-center">Your Watched List</h1>
      <div className="flex justify-center">
        <Filters showUserRating={true} />
      </div>

      {loading && watched.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<WatchedEmptyIcon />}
          title={watched.length === 0 ? "No watched movies yet" : "No movies match your filters"}
          subtitle={watched.length === 0 ? "Mark movies as watched from your Watchlist" : "Try adjusting or clearing the filters"}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => handleMovieClick(movie.id)}
              showUserRating={true}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);
}

export default WatchedList;