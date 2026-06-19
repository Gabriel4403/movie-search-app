import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';

const app = express();

// Allow requests only from the configured frontend origin (falls back to "*" for local dev)
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// Read and parse a JSON file — returns an empty array if the file doesn't exist or fails
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Write data to a JSON file, pretty-printed for readability
const writeJsonFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// GET all movies in the watchlist
app.get('/watchlist', async (req, res) => {
  const watchlist = await readJsonFile('./data/watchlist.json');
  res.json(watchlist);
});

// Add a movie to the watchlist
// Rejects if the movie is already in the watched list or is missing an id
app.post('/watchlist', async (req, res) => {
  const movie = req.body;
  if (!movie || !movie.id) return res.status(400).json({ message: 'Invalid movie data' });
  const watchlist = await readJsonFile('./data/watchlist.json');
  const watched = await readJsonFile('./data/watched.json');
  // Prevent adding a movie that's already been watched
  if (watched.find((m) => m.id === movie.id))
    return res.status(400).json({ message: 'Movie is already in watched list' });
  // Only add if not already in the watchlist (avoids duplicates)
  if (!watchlist.find((m) => m.id === movie.id)) {
    watchlist.push(movie);
    await writeJsonFile('./data/watchlist.json', watchlist);
  }
  res.status(201).json({ message: 'Movie added to watchlist' });
});

// GET all movies in the watched list
app.get('/watched', async (req, res) => {
  const watched = await readJsonFile('./data/watched.json');
  res.json(watched);
});

// Add a movie to the watched list and remove it from the watchlist if present
app.post('/watched', async (req, res) => {
  const movie = req.body;
  if (!movie || !movie.id) return res.status(400).json({ message: 'Invalid movie data' });
  const watched = await readJsonFile('./data/watched.json');
  // Only add if not already in the watched list
  if (!watched.find((m) => m.id === movie.id)) {
    watched.push(movie);
    await writeJsonFile('./data/watched.json', watched);
  }
  // Remove from watchlist since it's now been watched
  const watchlist = await readJsonFile('./data/watchlist.json');
  await writeJsonFile('./data/watchlist.json', watchlist.filter((m) => m.id !== movie.id));
  res.status(201).json({ message: 'Movie added to watched list' });
});

// Update the user's personal rating for a watched movie
app.patch('/watched/:id/rating', async (req, res) => {
  const id = Number(req.params.id);
  const { userRating } = req.body;
  const list = await readJsonFile('./data/watched.json');
  const movie = list.find((m) => m.id === id);
  if (!movie) return res.status(404).json({ message: 'Movie not found in watched list' });
  // Set to null if no rating is provided (clears the rating)
  movie.userRating = userRating ?? null;
  await writeJsonFile('./data/watched.json', list);
  res.status(200).json({ message: 'Rating updated', userRating: movie.userRating });
});

// Remove a movie from the watchlist by id
app.delete('/watchlist/:id', async (req, res) => {
  const id = Number(req.params.id);
  const list = await readJsonFile('./data/watchlist.json');
  await writeJsonFile('./data/watchlist.json', list.filter((m) => m.id !== id));
  res.status(200).json({ message: 'Removed from watchlist' });
});

// Remove a movie from the watched list by id
app.delete('/watched/:id', async (req, res) => {
  const id = Number(req.params.id);
  const list = await readJsonFile('./data/watched.json');
  await writeJsonFile('./data/watched.json', list.filter((m) => m.id !== id));
  res.status(200).json({ message: 'Removed from watched list' });
});

// Start the server — Railway/Render provide PORT via env var, default to 5000 locally
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));