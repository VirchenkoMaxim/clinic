import { config } from 'dotenv';
config();
import express from 'express';
const app = express();
import cors from 'cors';
import { router } from './routes/index.js';
import passport from 'passport';
import { initializePassport } from './passport-config.js';

const PORT = process.env.PORT || 3000;

// use the modules
app.use(cors());
app.use(express.json());
initializePassport(passport);
app.use(passport.initialize());
app.use('/api', router);
app.use((err, req, res, next) => {
  if (err) {
    res.json({
      status: 'failed',
      error: err.message,
    });
  }
});

app.listen(PORT);
