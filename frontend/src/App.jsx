import React from 'react';
import axios from 'axios';
export default function App() {
axios.get('http://localhost:5000/') // npm install axios also npm install cors in backend
.then((response)=>{
  console.log(response.data);
}).catch((error)=>{
  console.log('error',error);
});

  return (
    <div>
      <h1>hello world</h1>
    </div>
  );
}

