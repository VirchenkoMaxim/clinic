import { Router } from 'express';
import passport from 'passport';
import { LoginCtrl } from '../controllers/Auth.js';

export const auth = Router();

auth.post('/login', passport.authenticate('local'), LoginCtrl.login);
auth.get('/me', passport.authenticate('jwt'), LoginCtrl.show);
auth.post('/create', passport.authenticate('jwt'), LoginCtrl.createAdmin);
