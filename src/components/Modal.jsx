import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Movie detail modal — used on all three pages (Search, Watchlist, Watched)
// Different button combinations are shown depending on which page opens it,
// controlled via the show*Button props
export default function Modal({
  isOpen,
  onClose,
  movie,
  onAddWatchList,
  onAddWatched,
  showWatchListButton = true,
  showWatchedButton = true,
  showDeleteButton = true,
  showMoveToWatchlistButton = false,
  onDeleteMovie,
  onMoveToWatchlist,
  onEditRating,
  existingUserRating = null,
}) {
  const dialog = useRef();
  const [ratingMode, setRatingMode] = useState(false); // "add", "edit", or false
  const [selectedStar, setSelectedStar] = useState(0);

  // Reset rating state when modal closes, pre-fill when it opens with an existing rating
  useEffect(() => {
    if (!isOpen) {
      setRatingMode(false);
      setSelectedStar(0);
    } else {
      // Pre-fill existing rating when editing
      setSelectedStar(existingUserRating || 0);
    }
  }, [isOpen, existingUserRating]);

  // Open/close the native <dialog> element and lock body scroll while open
  useEffect(() => {
    const modal = dialog.current;
    if (isOpen && modal) {
      // Preserve scroll position when locking body scroll
      const scrollY = window.scrollY;
      modal.showModal();
      window.scrollTo({ top: scrollY, behavior: "instant" });
      document.body.style.overflow = "hidden";
    } else if (modal?.open) {
      modal.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close when clicking the backdrop (outside the dialog box)
  // Uses coordinate check instead of event.target since clicking padding can also
  // register as the dialog element itself
  function handleBackdropClick(event) {
    const rect = dialog.current.getBoundingClientRect();
    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (clickedOutside) onClose();
  }

  // Confirm rating for both "add to watched" and "edit rating" flows
  function handleConfirmRating() {
    if (ratingMode === "edit") {
      onEditRating(selectedStar || null);
    } else {
      onAddWatched(selectedStar || null);
    }
  }

  // Don't render anything if no movie is selected
  if (!movie) return null;

  return createPortal(
    <dialog
      ref={dialog}
      className="bg-[#243B27] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 sm:p-6 rounded-2xl shadow-lg backdrop:bg-black/50 w-full max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-auto"
      onClick={handleBackdropClick}
    >
      {/* Close button — circle on mobile, pill on sm: and above */}
      <button
        onClick={onClose}
        className="absolute rounded-full bg-[#243B27] border-2 border-[#4ADE80] cursor-pointer top-3 right-3 w-9 h-9 sm:w-auto sm:h-auto sm:rounded-4xl sm:px-4 sm:py-2 flex items-center justify-center text-white text-xl sm:text-2xl font-extrabold hover:bg-red-600 hover:border-red-800 z-10"
      >
        &times;
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Poster with fallback icon if no image is available */}
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="max-w-[180px] sm:max-w-[300px] w-full mx-auto sm:mx-0 rounded object-contain"
            style={{ aspectRatio: "2 / 3" }}
          />
        ) : (
          <div
            className="max-w-[180px] sm:max-w-[300px] w-full mx-auto sm:mx-0 rounded bg-[#1A2E1D] flex items-center justify-center"
            style={{ aspectRatio: "2 / 3" }}
          >
            <svg className="w-16 h-16 text-[#3a5c3e]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3h6v6H9V9z" />
            </svg>
          </div>
        )}

        {/* Right column — title, metadata, and action buttons anchored to bottom */}
        <div className="flex flex-col gap-4 flex-1 pr-12 min-h-full">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-white break-words">
              {movie.title}
            </h2>
            <p className="text-white">{movie.overview}</p>
            <p className="text-sm text-white">
              <strong>Release Date:</strong> {movie.release_date}
            </p>
            <p className="text-sm text-white">
              <strong>TMDb Rating:</strong>{" "}
              {/* Fall back through vote_average → rating → N/A */}
              {movie.vote_average?.toFixed(1) ??
                movie.rating?.toFixed(1) ??
                "N/A"}{" "}
              / 10
            </p>
            {movie.genres && movie.genres.length > 0 && (
              <p className="text-sm text-white">
                <strong>Genres:</strong>{" "}
                {movie.genres.map((g) => g.name).join(", ")}
              </p>
            )}
            {existingUserRating && (
              <p className="text-sm text-[#4ADE80] font-semibold">
                My rating: {existingUserRating}/10
              </p>
            )}
          </div>

          {/* Action buttons — pushed to bottom via mt-auto */}
          <div className="mt-auto">
            {/* Rating picker — shown for "Add to Watched" and "Edit rating" */}
            {ratingMode ? (
              <div className="mt-2">
                <p className="text-[#F0FDF4] font-semibold mb-3">
                  {ratingMode === "edit"
                    ? "Update your rating —"
                    : "Your rating —"}{" "}
                  {selectedStar ? (
                    <span className="text-[#4ADE80]">{selectedStar} / 10</span>
                  ) : (
                    <span className="text-gray-400">pick a score</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSelectedStar(n)}
                      className={`w-10 h-10 rounded-xl cursor-pointer font-bold text-sm transition-all border-2 ${
                        selectedStar === n
                          ? "bg-[#4ADE80] text-[#0E1510] border-[#4ADE80]"
                          : "bg-transparent text-[#F0FDF4] border-[#3a5c3e] hover:border-[#4ADE80] hover:text-[#4ADE80]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleConfirmRating}
                    className="p-3 border-2 border-[#4ADE80] cursor-pointer rounded-2xl text-[#F0FDF4] hover:bg-[#4ADE80] hover:text-[#0E1510] transition-all"
                  >
                    {selectedStar ? `Confirm (${selectedStar}/10)` : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatingMode(false)}
                    className="p-3 border-2 border-red-500 cursor-pointer rounded-2xl text-[#F0FDF4] hover:bg-red-700 hover:border-red-800 transition-all"
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 mt-4 flex-wrap">
                {showWatchListButton && (
                  <button
                    type="button"
                    onClick={onAddWatchList}
                    className="p-3 border-2 border-[#4ADE80] rounded-2xl cursor-pointer text-[#F0FDF4] hover:bg-[#4ADE80] hover:border-[#197a3d] hover:text-[#0E1510] transition-all"
                  >
                    Add to WatchList
                  </button>
                )}
                {showWatchedButton && (
                  <button
                    type="button"
                    onClick={() => setRatingMode("add")}
                    className="p-3 border-2 border-[#4ADE80] cursor-pointer rounded-2xl text-[#F0FDF4] hover:bg-[#4ADE80] hover:border-[#197a3d] hover:text-[#0E1510] transition-all"
                  >
                    Add to Watched
                  </button>
                )}
                {/* Edit rating button — shown in Watched List */}
                {onEditRating && (
                  <button
                    type="button"
                    onClick={() => setRatingMode("edit")}
                    className="p-3 border-2 border-[#4ADE80] rounded-2xl cursor-pointer text-[#F0FDF4] hover:bg-[#4ADE80] hover:text-[#0E1510] transition-all"
                  >
                    {existingUserRating ? "Edit Rating" : "Add Rating"}
                  </button>
                )}
                {/* Move back to watchlist button — shown in Watched List */}
                {showMoveToWatchlistButton && (
                  <button
                    type="button"
                    onClick={onMoveToWatchlist}
                    className="p-3 border-2 border-yellow-500 rounded-2xl cursor-pointer text-[#F0FDF4] hover:bg-yellow-500 hover:text-[#0E1510] transition-all"
                  >
                    Move to Watchlist
                  </button>
                )}
                {showDeleteButton && (
                  <button
                    type="button"
                    onClick={() => onDeleteMovie(movie.id)}
                    className="p-3 border-2 border-red-500 rounded-2xl cursor-pointer text-[#F0FDF4] hover:bg-red-700 hover:border-red-800 hover:text-white transition-all"
                  >
                    Delete Movie
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>,
    document.getElementById("modal"),
  );
}