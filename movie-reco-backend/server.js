const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------------- Sample dataset ----------------
// A small movies list (id, title, genres, tags)
const movies = [
  { id: 1, title: "Edge of Tomorrow", genres: ["Action","Sci-Fi"], tags: ["time-loop","battle","sci-fi"] },
  { id: 2, title: "The Shawshank Redemption", genres: ["Drama"], tags: ["prison","hope"] },
  { id: 3, title: "Inception", genres: ["Action","Sci-Fi","Thriller"], tags: ["dream","mind-bend"] },
  { id: 4, title: "The Dark Knight", genres: ["Action","Crime","Drama"], tags: ["batman","crime"] },
  { id: 5, title: "Forrest Gump", genres: ["Drama","Romance"], tags: ["life","heartwarming"] },
  { id: 6, title: "Interstellar", genres: ["Sci-Fi","Drama"], tags: ["space","emotional"] },
  { id: 7, title: "Mad Max: Fury Road", genres: ["Action","Adventure"], tags: ["post-apocalyptic","chase"] },
  { id: 8, title: "The Matrix", genres: ["Action","Sci-Fi"], tags: ["simulation","fight"] },
  { id: 9, title: "Whiplash", genres: ["Drama","Music"], tags: ["music","intense"] },
  { id: 10, title: "Parasite", genres: ["Drama","Thriller"], tags: ["social","twist"] }
];

// Sample user ratings: { userId, movieId, rating (1-5) }
const ratings = [
  { userId: 1, movieId:1, rating:5 },
  { userId: 1, movieId:3, rating:4 },
  { userId: 1, movieId:8, rating:5 },

  { userId: 2, movieId:2, rating:5 },
  { userId: 2, movieId:5, rating:4 },
  { userId: 2, movieId:9, rating:4 },

  { userId: 3, movieId:1, rating:4 },
  { userId: 3, movieId:3, rating:5 },
  { userId: 3, movieId:7, rating:4 },
  { userId: 3, movieId:8, rating:5 }
];
// -------------------------------------------------

// ------------- Utilities ----------------
function tokenizeMovie(movie) {
  // combine genres + tags into lowercase tokens
  return [...movie.genres, ...movie.tags].map(s => s.toLowerCase());
}

function buildVocabulary(movies) {
  const vocab = new Map();
  let idx = 0;
  for (const m of movies) {
    for (const t of tokenizeMovie(m)) {
      if (!vocab.has(t)) {
        vocab.set(t, idx++);
      }
    }
  }
  return vocab; // token -> index
}

function buildTFVectors(movies, vocab) {
  // returns map movieId -> vector (array of length vocab.size)
  const size = vocab.size;
  const vectors = new Map();
  for (const m of movies) {
    const vec = new Array(size).fill(0);
    for (const t of tokenizeMovie(m)) {
      vec[vocab.get(t)] += 1;
    }
    vectors.set(m.id, vec);
  }
  return vectors;
}

function dot(a,b){
  let s=0;
  for (let i=0;i<a.length;i++) s+=a[i]*b[i];
  return s;
}
function norm(a){
  return Math.sqrt(dot(a,a));
}
function cosineSim(a,b){
  const denom = norm(a)*norm(b);
  if (denom === 0) return 0;
  return dot(a,b)/denom;
}

// ---------------- Content-based recommender ----------------
const vocab = buildVocabulary(movies);
const movieTF = buildTFVectors(movies, vocab);

function contentBasedRecommendations(movieId, topK=5) {
  const target = movieTF.get(movieId);
  if (!target) return [];
  const scores = [];
  for (const m of movies) {
    if (m.id === movieId) continue;
    const vec = movieTF.get(m.id);
    const sim = cosineSim(target, vec);
    scores.push({ movie: m, score: sim });
  }
  scores.sort((a,b)=>b.score-a.score);
  return scores.slice(0, topK);
}

// ---------------- User-based collaborative filtering ----------------
function buildUserRatingsMap(ratings) {
  // userId -> Map(movieId -> rating)
  const umap = new Map();
  for (const r of ratings) {
    if (!umap.has(r.userId)) umap.set(r.userId, new Map());
    umap.get(r.userId).set(r.movieId, r.rating);
  }
  return umap;
}

function meanRating(userRatingsMap) {
  // userRatingsMap: Map(movieId -> rating)
  let sum=0, cnt=0;
  for (const v of userRatingsMap.values()) { sum+=v; cnt++; }
  return cnt===0?0:sum/cnt;
}

function userCosineSim(uRatings, vRatings, allMovieIds) {
  // build common vectors aligned by allMovieIds
  const a = [], b = [];
  for (const mId of allMovieIds) {
    a.push(uRatings.has(mId)?uRatings.get(mId):0);
    b.push(vRatings.has(mId)?vRatings.get(mId):0);
  }
  return cosineSim(a,b);
}

function collaborativeRecommendationsForUser(userId, topK=5, neighborCount=2) {
  const umap = buildUserRatingsMap(ratings);
  const allUserIds = Array.from(umap.keys());
  if (!umap.has(userId)) return [];

  const targetRatings = umap.get(userId);
  const allMovieIds = movies.map(m=>m.id);

  // compute similarities with other users
  const sims = [];
  for (const otherId of allUserIds) {
    if (otherId === userId) continue;
    const otherRatings = umap.get(otherId);
    const sim = userCosineSim(targetRatings, otherRatings, allMovieIds);
    sims.push({ userId: otherId, sim, ratings: otherRatings });
  }
  sims.sort((a,b)=>b.sim - a.sim);

  const neighbors = sims.slice(0, neighborCount).filter(x=>x.sim>0);
  if (neighbors.length===0) return []; // no similar users

  const targetMean = meanRating(targetRatings);

  // For every movie user hasn't rated, predict score
  const candidates = [];
  for (const m of movies) {
    if (targetRatings.has(m.id)) continue; // skip already rated
    // numerator / denominator
    let num=0, den=0;
    for (const nb of neighbors) {
      const r = nb.ratings.has(m.id) ? nb.ratings.get(m.id) : null;
      if (r === null) continue;
      const nbMean = meanRating(nb.ratings);
      num += nb.sim * (r - nbMean);
      den += Math.abs(nb.sim);
    }
    if (den === 0) continue;
    const pred = targetMean + num/den;
    candidates.push({ movie: m, score: pred });
  }
  candidates.sort((a,b)=>b.score - a.score);
  return candidates.slice(0, topK);
}

// ---------------- API endpoints ----------------
app.get('/', (req,res) => res.send('Movie Reco Backend - chal raha hai bhai 😎'));

app.get('/movies', (req,res) => res.json(movies));

app.get('/recommend/content/:movieId', (req,res) => {
  const movieId = Number(req.params.movieId);
  const recs = contentBasedRecommendations(movieId, 5);
  res.json(recs.map(r => ({ id: r.movie.id, title: r.movie.title, score: r.score })));
});

app.get('/recommend/user/:userId', (req,res) => {
  const userId = Number(req.params.userId);
  const recs = collaborativeRecommendationsForUser(userId, 5, 2);
  res.json(recs.map(r => ({ id: r.movie.id, title: r.movie.title, score: r.score })));
});

app.listen(4000, ()=>console.log('Server running on http://localhost:4000'));
