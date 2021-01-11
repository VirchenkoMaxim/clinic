import { Router } from 'express';
// import passport from 'passport';
import { ServicesCtrl } from '../controllers/Services.js';
import { relationValidator } from '../validations/relationValidator.js';

export const services = Router();

services.get('/', ServicesCtrl.index);
services.get('/detailed', ServicesCtrl.getDetailedList);
services.get('/:id', ServicesCtrl.selectOne);

services.post(
  '/',
  // passport.authenticate('jwt'),
  ServicesCtrl.create,
);
services.post(
  '/:id/relation',
  relationValidator,
  // passport.authenticate('jwt'),
  ServicesCtrl.createRelation,
);
services.post(
  '/:id/one-to-relation',
  relationValidator,
  ServicesCtrl.addOneToRelation,
);

services.delete(
  '/:id',
  // passport.authenticate('jwt'),
  ServicesCtrl.delete,
);
services.delete(
  '/:id/relation',
  relationValidator,
  // passport.authenticate('jwt'),
  ServicesCtrl.deleteRelation,
);
