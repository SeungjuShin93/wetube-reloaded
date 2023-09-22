import express from 'express';

const PORT = 4000;

const app = express();

const handleHome = (req, res) => {
  return res.end('<h1>I still love you.</h1>');
};

const handleLogin = (req, res) => {
  return res.send({ some: 'json' });
};
app.get('/', handleHome);
app.get('/login', handleLogin);

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🎈`);

app.listen(PORT, handleListening);
