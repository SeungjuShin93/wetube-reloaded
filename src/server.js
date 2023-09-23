import express from 'express';

const PORT = 4000;

const app = express();

const gossipMiddleware = (req, res, next) => {
  console.log(`Someone is going to: ${req.url}`);
  next();
};

const handleHome = (req, res) => {
  return res.send('<h1>I love middlewares.</h1>');
};

const handleLogin = (req, res) => {
  return res.send({ some: 'json' });
};

app.get('/', gossipMiddleware, handleHome);
app.get('/login', handleLogin);

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🎈`);

app.listen(PORT, handleListening);
