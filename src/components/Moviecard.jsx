// Fallback UI shown when a movie has no poster image
const FALLBACK = (
  <div className="w-full rounded bg-[#1A2E1D] flex items-center justify-center" style={{ aspectRatio: "2/3" }}>
    <svg className="w-12 h-12 text-[#3a5c3e]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zM6 6h12v2H6V6zm0 4h12v8H6v-8z"/>
    </svg>
  </div>
);

// Clickable movie card used in all three pages (Search, Watchlist, Watched)
// Shows poster, title, year, TMDb rating, and optionally the user's personal rating
function MovieCard({ movie, onClick, badge, showUserRating = false }) {
  return (
    <div
      onClick={onClick}
      className="border border-[#243B27] p-2 rounded-xl shadow text-white cursor-pointer
                 transition-all duration-200 hover:scale-[1.03] hover:border-[#4ADE80] hover:shadow-[0_0_12px_rgba(74,222,128,0.2)]
                 relative bg-[#0E1510] min-w-0"
    >
      {movie.poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
          alt={movie.title}
          className="w-full rounded-lg"
        />
      ) : FALLBACK}

      {/* Watched / Watchlist badge — green for watched, yellow for watchlist */}
      {badge && (
        <div
          className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white pointer-events-none ${
            badge === "Watched" ? "bg-green-600" : "bg-yellow-600"
          }`}
        >
          {badge}
        </div>
      )}

      <h3 className="mt-2 font-semibold text-sm leading-tight break-words">{movie.title}</h3>
      <p className="text-xs text-gray-400 mt-1">{movie.release_date?.slice(0, 4)}</p>
      {/* Fall back through vote_average → rating → N/A */}
      <p className="text-xs text-yellow-400">⭐ {(movie.vote_average ?? movie.rating)?.toFixed(1) || "N/A"}</p>
      {/* Personal rating — only shown on the Watched List page */}
      {showUserRating && (
        <p className="text-xs text-[#4ADE80] font-semibold">
          My rating: {movie.userRating ? `${movie.userRating}/10` : "N/A"}
        </p>
      )}
    </div>
  );
}

export default MovieCard;