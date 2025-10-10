const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


app.get('/api/ping', (req, res) => {
  console.log('Received /api/ping request'); // for debugging
  res.status(200).json({ message: 'Hello World' });
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});
  

// for debuggin'
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// run server
const PORT = process.env.PORT || 5001; //note: port 5000 is already taken for MacOS
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));