import { Router } from 'express';
// import passport from 'passport';
import { ClinicsCtrl } from '../controllers/Clinics.js';
import { relationValidator } from '../validations/relationValidator.js';
export const clinics = Router();

clinics.get('/', ClinicsCtrl.index);
clinics.get('/detailed', ClinicsCtrl.getDetailedList);
clinics.get('/:id', ClinicsCtrl.selectOne);

clinics.post('/', ClinicsCtrl.create);
clinics.post(
  '/:id/relation',
  // passport.authenticate('jwt'),
  relationValidator,
  ClinicsCtrl.createRelation,
);
clinics.post(
  '/:id/one-to-relation',
  relationValidator,
  // passport.authenticate('jwt'),
  ClinicsCtrl.addOneToRelation,
);

clinics.delete(
  '/:id',
  // passport.authenticate('jwt'),
  ClinicsCtrl.delete,
);
clinics.delete(
  '/:id/relation',
  relationValidator,
  //  passport.authenticate('jwt'),
  ClinicsCtrl.deleteRelation,
);
