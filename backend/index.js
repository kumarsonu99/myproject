import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors()); // to avoid CORS error this is middleware to allow cross-origin requests

app.use(express.json());
const PORT = 5000;
app.get('/', (req, res) => {
    // res.send('Hello from backend');
    res.json({ message: 'Hello from backend' });
});
app.listen(PORT,()=>{
    console.log(`server is running on the port ${PORT}`);
})
 
 