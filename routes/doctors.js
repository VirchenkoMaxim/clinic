import { Router } from 'express';
import passport from 'passport';
import { DoctorsCtrl } from '../controllers/Doctors.js';

export const doctors = Router();

doctors.get('/', DoctorsCtrl.index);
doctors.get('/detailed', DoctorsCtrl.getDetailedList);
doctors.get('/:id', DoctorsCtrl.selectOne);
doctors.post('/', passport.authenticate('jwt'), DoctorsCtrl.create);
doctors.post(
  '/:id/relation',
  passport.authenticate('jwt'),
  DoctorsCtrl.createRelation,
);
doctors.delete('/:id', passport.authenticate('jwt'), DoctorsCtrl.delete);
