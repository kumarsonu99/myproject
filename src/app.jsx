import React, { useEffect, useState } from 'react';

const API = 'http://localhost:4000';

export default function App(){
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [contentRecs, setContentRecs] = useState([]);
  const [userId, setUserId] = useState(1);
  const [userRecs, setUserRecs] = useState([]);

  useEffect(()=> {
    fetch(API + '/movies')
      .then(r=>r.json())
      .then(setMovies)
      .catch(err => console.error(err));
  },[]);

  const getContent = (movieId) => {
    fetch(`${API}/recommend/content/${movieId}`)
      .then(r=>r.json())
      .then(setContentRecs);
  };

  const getUser = (uid) => {
    fetch(`${API}/recommend/user/${uid}`)
      .then(r=>r.json())
      .then(setUserRecs);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Movie Recommender — Demo (bhai style)</h1>
      <div style={{ display: 'flex', gap: 30 }}>
        <div style={{ flex: 1 }}>
          <h2>Movies</h2>
          <ul>
            {movies.map(m => (
              <li key={m.id} style={{ marginBottom: 8 }}>
                <b>{m.title}</b> <small>({m.genres.join(', ')})</small>
                <div>
                  <button onClick={()=>{ setSelectedMovie(m); getContent(m.id); }} style={{ marginRight:8 }}>Content-based Recs</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ width: 400 }}>
          <h2>Content-based Recs {selectedMovie ? `for "${selectedMovie.title}"` : ''}</h2>
          <ol>
            {contentRecs.map(r => (
              <li key={r.id}>{r.title} — score: {r.score.toFixed(3)}</li>
            ))}
          </ol>

          <hr/>

          <h2>User-based Collaborative</h2>
          <div>
            <label>User ID: </label>
            <input type="number" value={userId} min={1} onChange={(e)=>setUserId(Number(e.target.value))} />
            <button onClick={()=>getUser(userId)} style={{ marginLeft:8 }}>Get Recs</button>
          </div>
          <ol>
            {userRecs.map(r => (
              <li key={r.id}>{r.title} — predicted rating: {r.score.toFixed(2)}</li>
            ))}
          </ol>
        </div>
      </div>
      <footer style={{ marginTop: 20, color:'#666' }}>
        Backend required at <code>http://localhost:4000</code>. Start backend first.  
      </footer>
    </div>
  );
}

import express from 'express'
const app=express()
app.get('./',(req,res)=>{
  res.send('hello world')
})
app.listen(3000,()=>{
console.log(`the seveer is running at the port ${3000}`)
})
const userSchema= new mongoose.schema({
  name:{
    type:String,
    required:true,
    unique:true,
    default:'anonymous'
  },
  age:{

    type:Number,
    min:0,
    max:120
  }
},{timestamps:true})
import axios from 'axios';
const response=async()=>{
await axios.get('http://localhost:3000/',{
  headers:{
    'Content-Type':'application/json'
  }
})
.then(res=>console.log(res.data))
.catch(err=>console.error(err))}