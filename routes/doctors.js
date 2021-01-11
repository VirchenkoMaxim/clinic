import { Router } from 'express';
// import passport from 'passport';
import { DoctorsCtrl } from '../controllers/Doctors.js';
import { relationValidator } from '../validations/relationValidator.js';

export const doctors = Router();

doctors.get('/', DoctorsCtrl.index);
doctors.get('/detailed', DoctorsCtrl.getDetailedList);
doctors.get('/:id', DoctorsCtrl.selectOne);

doctors.post(
  '/',
  // passport.authenticate('jwt'),
  DoctorsCtrl.create,
);
doctors.post(
  '/:id/relation',
  relationValidator,
  // passport.authenticate('jwt'),
  DoctorsCtrl.createRelation,
);
doctors.post(
  '/:id/one-to-relation',
  relationValidator,
  // passport.authenticate('jwt'),
  DoctorsCtrl.addOneToRelation,
);

doctors.delete(
  '/:id',
  //  passport.authenticate('jwt'),
  DoctorsCtrl.delete,
);
doctors.delete(
  '/:id/relation',
  relationValidator,
  //  passport.authenticate('jwt'),
  DoctorsCtrl.deleteRelation,
);
