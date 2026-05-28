import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';

const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeJsonFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

app.get('/watchlist', async (req, res) => {
  const watchlist = await readJsonFile('./data/watchlist.json');
  res.json(watchlist);
});

app.post('/watchlist', async (req, res) => {
  const movie = req.body;
  if (!movie || !movie.id) return res.status(400).json({ message: 'Invalid movie data' });
  const watchlist = await readJsonFile('./data/watchlist.json');
  const watched = await readJsonFile('./data/watched.json');
  if (watched.find((m) => m.id === movie.id))
    return res.status(400).json({ message: 'Movie is already in watched list' });
  if (!watchlist.find((m) => m.id === movie.id)) {
    watchlist.push(movie);
    await writeJsonFile('./data/watchlist.json', watchlist);
  }
  res.status(201).json({ message: 'Movie added to watchlist' });
});

app.get('/watched', async (req, res) => {
  const watched = await readJsonFile('./data/watched.json');
  res.json(watched);
});

app.post('/watched', async (req, res) => {
  const movie = req.body;
  if (!movie || !movie.id) return res.status(400).json({ message: 'Invalid movie data' });
  const watched = await readJsonFile('./data/watched.json');
  if (!watched.find((m) => m.id === movie.id)) {
    watched.push(movie);
    await writeJsonFile('./data/watched.json', watched);
  }
  const watchlist = await readJsonFile('./data/watchlist.json');
  await writeJsonFile('./data/watchlist.json', watchlist.filter((m) => m.id !== movie.id));
  res.status(201).json({ message: 'Movie added to watched list' });
});

app.patch('/watched/:id/rating', async (req, res) => {
  const id = Number(req.params.id);
  const { userRating } = req.body;
  const list = await readJsonFile('./data/watched.json');
  const movie = list.find((m) => m.id === id);
  if (!movie) return res.status(404).json({ message: 'Movie not found in watched list' });
  movie.userRating = userRating ?? null;
  await writeJsonFile('./data/watched.json', list);
  res.status(200).json({ message: 'Rating updated', userRating: movie.userRating });
});

app.delete('/watchlist/:id', async (req, res) => {
  const id = Number(req.params.id);
  const list = await readJsonFile('./data/watchlist.json');
  await writeJsonFile('./data/watchlist.json', list.filter((m) => m.id !== id));
  res.status(200).json({ message: 'Removed from watchlist' });
});

app.delete('/watched/:id', async (req, res) => {
  const id = Number(req.params.id);
  const list = await readJsonFile('./data/watched.json');
  await writeJsonFile('./data/watched.json', list.filter((m) => m.id !== id));
  res.status(200).json({ message: 'Removed from watched list' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));