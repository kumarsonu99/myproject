import http from 'http'; // if we would have used commonjs then we would have written const http = require('http'); to change to commonjs just remove "type": "module" from package.json and write "type": "commonjs"
import express from 'express';
const app = express();
const port = 3000;
// app.use(express.json()); // middleware to parse json body
// app.get('/', (req, res) => {
//   res.json({ message: 'Hello World!',
//     name:"John Doe" });
// });



// app.post('/', (req, res) => {
//   let body = req.body;
//   // res.json(body); if we use this it will send resonse in response section foe console we will use console.log only one responce can be sent whether in response section or console
//   console.log(body); // dont forget to use middleware to parse json body also select post in thunderclient to test this route
// })
// app.use((req, res, next) => {
//   res.status(404).send("Sorry, we couldn't find that!");
// }); // 404 handler this should be the last route if none of the above routes match then this will be executed
const users=[
  {
    "id": 1,
    "name": "Rahul Sharma",
    "age": 28,
    "position": "Software Engineer",
    "department": "IT"
  },
  {
    "id": 2,
    "name": "Priya Singh",
    "age": 32,
    "position": "HR Manager",
    "department": "Human Resources"
  },
  {
    "id": 3,
    "name": "Amit Verma",
    "age": 25,
    "position": "UI/UX Designer",
    "department": "Design"
  },
  {
    "id": 4,
    "name": "Sneha Patil",
    "age": 30,
    "position": "Data Analyst",
    "department": "Analytics"
  },
  {
    "id": 5,
    "name": "Karan Mehta",
    "age": 27,
    "position": "Marketing Executive",
    "department": "Marketing"
  }
];
app.get('/', (req, res) => {
  res.send('Welcome to the User Management System');
});

app.get('/users', (req, res) => {
  res.json(users);
});
 app.get('/users/:id', (req, res) => {
  const id = req.params.id; // dynamic route parameter dynamic routing means ki jo bhi id hum url me denge wo yaha milegi : means ki ye dynamic hai
  const user = users.find((user) => user.id == id); // == is used to compare string and number and find method returns the first matching element
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);

  });
app.listen(port, () => {
  console.log(`The server is running at the port ${port}`);
});