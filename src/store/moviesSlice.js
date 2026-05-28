import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const searchMovies = createAsyncThunk("movies/search", async (query) => {
  const response = await axios.get(`${BASE_URL}/search/movie`, {
    params: { api_key: API_KEY, query },
  });
  return response.data.results;
});

export const getPopularMovies = createAsyncThunk("movies/fetchPopular", async () => {
  const response = await axios.get(`${BASE_URL}/movie/popular`, {
    params: { api_key: API_KEY },
  });
  return response.data.results;
});

export const getMovieDetails = createAsyncThunk("movies/getDetails", async (movieId) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
    params: { api_key: API_KEY },
  });
  return response.data;
});

export const addToWatchlist = createAsyncThunk("movies/addToWatchlist", async (movie) => {
  const movieToSend = {
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    release_date: movie.release_date,
    rating: movie.vote_average,
    genre_ids: movie.genre_ids ?? (movie.genres?.map((g) => g.id) || []),
    poster_path: movie.poster_path,
  };
  await axios.post(`${API_URL}/watchlist`, movieToSend);
  return movieToSend;
});

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

export const updateUserRating = createAsyncThunk("movies/updateUserRating", async ({ movieId, userRating }) => {
  await axios.patch(`${API_URL}/watched/${movieId}/rating`, { userRating });
  return { movieId, userRating };
});

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
  await axios.post(`${API_URL}/watchlist`, movieToSend);
  await axios.delete(`${API_URL}/watched/${movie.id}`);
  return movie.id;
});

export const removeFromWatchlist = createAsyncThunk("movies/removeFromWatchlist", async (movieId) => {
  await axios.delete(`${API_URL}/watchlist/${movieId}`);
  return movieId;
});

export const removeFromWatched = createAsyncThunk("movies/removeFromWatched", async (movieId) => {
  await axios.delete(`${API_URL}/watched/${movieId}`);
  return movieId;
});

export const fetchWatchList = createAsyncThunk("movies/fetchWatchlist", async () => {
  const res = await axios.get(`${API_URL}/watchlist`);
  return res.data;
});

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
    setFilters(state, action) { state.filters = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPopularMovies.pending, (state) => { state.loading = true; })
      .addCase(getPopularMovies.fulfilled, (state, action) => { state.loading = false; state.popularMovies = action.payload; })
      .addCase(getPopularMovies.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(searchMovies.pending, (state) => { state.loading = true; })
      .addCase(searchMovies.fulfilled, (state, action) => { state.loading = false; state.searchResults = action.payload; })
      .addCase(searchMovies.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(getMovieDetails.pending, (state) => { state.loading = true; })
      .addCase(getMovieDetails.fulfilled, (state, action) => { state.loading = false; state.movieDetails = action.payload; })
      .addCase(getMovieDetails.rejected, (state) => { state.loading = false; state.error = "Failed to load movie details"; })
      .addCase(addToWatchlist.fulfilled, (state, action) => { state.watchlist.push(action.payload); })
      .addCase(addToWatched.fulfilled, (state, action) => {
        state.watched.push(action.payload);
        state.watchlist = state.watchlist.filter((m) => m.id !== action.payload.id);
      })
      .addCase(updateUserRating.fulfilled, (state, action) => {
        const movie = state.watched.find((m) => m.id === action.payload.movieId);
        if (movie) movie.userRating = action.payload.userRating;
      })
      .addCase(moveToWatchlist.fulfilled, (state, action) => {
        state.watched = state.watched.filter((m) => m.id !== action.payload);
        const movie = state.watched.find((m) => m.id === action.payload);
        if (movie) state.watchlist.push(movie);
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.watchlist = state.watchlist.filter((m) => m.id !== action.payload);
      })
      .addCase(removeFromWatched.fulfilled, (state, action) => {
        state.watched = state.watched.filter((m) => m.id !== action.payload);
      })
      .addCase(fetchWatchList.fulfilled, (state, action) => { state.watchlist = action.payload; })
      .addCase(fetchWatchedList.fulfilled, (state, action) => { state.watched = action.payload; });
  },
});

export const { openModal, closeModal, setFilters } = moviesSlice.actions;
export default moviesSlice.reducer;