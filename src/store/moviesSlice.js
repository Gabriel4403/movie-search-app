import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// TMDB API key and base URL for movie search and details
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
// Our own backend for storing watchlist and watched list
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Search TMDB for movies by title
export const searchMovies = createAsyncThunk("movies/search", async (query) => {
  const response = await axios.get(`${BASE_URL}/search/movie`, {
    params: { api_key: API_KEY, query },
  });
  return response.data.results;
});

// Fetch currently popular movies from TMDB
export const getPopularMovies = createAsyncThunk("movies/fetchPopular", async () => {
  const response = await axios.get(`${BASE_URL}/movie/popular`, {
    params: { api_key: API_KEY },
  });
  return response.data.results;
});

// Fetch full details for a single movie (includes genres, runtime, etc.)
export const getMovieDetails = createAsyncThunk("movies/getDetails", async (movieId) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
    params: { api_key: API_KEY },
  });
  return response.data;
});

// Add a movie to the watchlist — normalizes TMDB fields to our backend format
export const addToWatchlist = createAsyncThunk("movies/addToWatchlist", async (movie) => {
  const movieToSend = {
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    release_date: movie.release_date,
    rating: movie.vote_average,
    // TMDB search results use genre_ids, detail responses use genres array
    genre_ids: movie.genre_ids ?? (movie.genres?.map((g) => g.id) || []),
    poster_path: movie.poster_path,
  };
  await axios.post(`${API_URL}/watchlist`, movieToSend);
  return movieToSend;
});

// Add a movie to the watched list with an optional personal rating
export const addToWatched = createAsyncThunk("movies/addToWatched", async (movie) => {
  const movieToSend = {
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    release_date: movie.release_date,
    rating: movie.vote_average,
    genre_ids: movie.genre_ids ?? (movie.genres?.map((g) => g.id) || []),
    poster_path: movie.poster_path,
    userRating: movie.userRating ?? null,
  };
  await axios.post(`${API_URL}/watched`, movieToSend);
  return movieToSend;
});

// Update the personal rating for a movie already in the watched list
export const updateUserRating = createAsyncThunk("movies/updateUserRating", async ({ movieId, userRating }) => {
  await axios.patch(`${API_URL}/watched/${movieId}/rating`, { userRating });
  return { movieId, userRating };
});

// Move a movie from watched back to watchlist
// Delete from watched first to avoid the backend's "already in watched" rejection
export const moveToWatchlist = createAsyncThunk("movies/moveToWatchlist", async (movie) => {
  const movieToSend = {
    id: movie.id,
    title: movie.title,
    description: movie.description,
    release_date: movie.release_date,
    rating: movie.rating,
    genre_ids: movie.genre_ids || [],
    poster_path: movie.poster_path,
  };
  await axios.delete(`${API_URL}/watched/${movie.id}`);
  await axios.post(`${API_URL}/watchlist`, movieToSend);
  return movie.id;
});

// Remove a movie from the watchlist without marking it as watched
export const removeFromWatchlist = createAsyncThunk("movies/removeFromWatchlist", async (movieId) => {
  await axios.delete(`${API_URL}/watchlist/${movieId}`);
  return movieId;
});

// Remove a movie from the watched list
export const removeFromWatched = createAsyncThunk("movies/removeFromWatched", async (movieId) => {
  await axios.delete(`${API_URL}/watched/${movieId}`);
  return movieId;
});

// Load the full watchlist from the backend (called on page mount)
export const fetchWatchList = createAsyncThunk("movies/fetchWatchlist", async () => {
  const res = await axios.get(`${API_URL}/watchlist`);
  return res.data;
});

// Load the full watched list from the backend (called on page mount)
export const fetchWatchedList = createAsyncThunk("movies/fetchWatchedlist", async () => {
  const res = await axios.get(`${API_URL}/watched`);
  return res.data;
});

const initialState = {
  searchResults: [],
  popularMovies: [],
  watchlist: [],
  watched: [],
  movieDetails: null,
  isModalOpen: false,
  loading: false,
  error: null,
  // All filter values default to empty string meaning "no filter applied"
  filters: {
    genre: "",
    rating: "",
    year: "",
    sort: "",
    userRating: "",
  },
};

const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    openModal: (state) => { state.isModalOpen = true; },
    closeModal: (state) => { state.isModalOpen = false; },
    // Replace all filters at once — the Filters component always sends the full filters object
    setFilters(state, action) { state.filters = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // Popular movies
      .addCase(getPopularMovies.pending, (state) => { state.loading = true; })
      .addCase(getPopularMovies.fulfilled, (state, action) => { state.loading = false; state.popularMovies = action.payload; })
      .addCase(getPopularMovies.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      // Search
      .addCase(searchMovies.pending, (state) => { state.loading = true; })
      .addCase(searchMovies.fulfilled, (state, action) => { state.loading = false; state.searchResults = action.payload; })
      .addCase(searchMovies.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      // Movie details
      .addCase(getMovieDetails.pending, (state) => { state.loading = true; })
      .addCase(getMovieDetails.fulfilled, (state, action) => { state.loading = false; state.movieDetails = action.payload; })
      .addCase(getMovieDetails.rejected, (state) => { state.loading = false; state.error = "Failed to load movie details"; })
      // Add to watchlist
      .addCase(addToWatchlist.fulfilled, (state, action) => { state.watchlist.push(action.payload); })
      // Add to watched — also removes from watchlist if present
      .addCase(addToWatched.fulfilled, (state, action) => {
        state.watched.push(action.payload);
        state.watchlist = state.watchlist.filter((m) => m.id !== action.payload.id);
      })
      // Update personal rating
      .addCase(updateUserRating.fulfilled, (state, action) => {
        const movie = state.watched.find((m) => m.id === action.payload.movieId);
        if (movie) movie.userRating = action.payload.userRating;
      })
      // Move from watched back to watchlist
      .addCase(moveToWatchlist.fulfilled, (state, action) => {
        state.watched = state.watched.filter((m) => m.id !== action.payload);
        const movie = state.watched.find((m) => m.id === action.payload);
        if (movie) state.watchlist.push(movie);
      })
      // Remove from watchlist
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.watchlist = state.watchlist.filter((m) => m.id !== action.payload);
      })
      // Remove from watched
      .addCase(removeFromWatched.fulfilled, (state, action) => {
        state.watched = state.watched.filter((m) => m.id !== action.payload);
      })
      // Fetch lists on mount
      .addCase(fetchWatchList.fulfilled, (state, action) => { state.watchlist = action.payload; })
      .addCase(fetchWatchedList.fulfilled, (state, action) => { state.watched = action.payload; });
  },
});

export const { openModal, closeModal, setFilters } = moviesSlice.actions;
export default moviesSlice.reducer;