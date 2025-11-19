import http from 'http'; // if we would have used commonjs then we would have written const http = require('http'); to change to commonjs just remove "type": "module" from package.json and write "type": "commonjs"
import express from 'express';
const app = express();
const port = 3000;
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.post('/', (req, res) => {
  let body = req.body;
  console.log(body);
})
app.use((req, res, next) => {
  res.status(404).send("Sorry, we couldn't find that!");
}); // 404 handler this should be the last route if none of the above routes match then this will be executed


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});