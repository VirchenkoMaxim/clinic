import { Router } from 'express';
// import { auth } from './auth.js';
import { clinics } from './clinics.js';
import { doctors } from './doctors.js';
import { services } from './services.js';

export const router = Router();

router.use('/clinics/', clinics);
router.use('/doctors/', doctors);
router.use('/services/', services);
// router.use('/auth/', auth);
