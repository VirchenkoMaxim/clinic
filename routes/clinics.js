import { Router } from 'express';
import passport from 'passport';
import { ClinicsCtrl } from '../controllers/Clinics.js';
export const clinics = Router();

clinics.get('/', ClinicsCtrl.index);
clinics.get('/detailed', ClinicsCtrl.getDetailedList);
clinics.get('/:id', ClinicsCtrl.selectOne);
clinics.post('/', passport.authenticate('jwt'), ClinicsCtrl.create);
clinics.post(
  '/:id/relation',
  passport.authenticate('jwt'),
  ClinicsCtrl.createRelation,
);
clinics.delete('/:id', passport.authenticate('jwt'), ClinicsCtrl.delete);
