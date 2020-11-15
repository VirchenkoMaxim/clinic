import { Router } from 'express';
import passport from 'passport';
import { ServicesCtrl } from '../controllers/Services.js';

export const services = Router();

services.get('/', ServicesCtrl.index);
services.get('/:id', ServicesCtrl.selectOne);
services.post('/', passport.authenticate('jwt'), ServicesCtrl.create);
services.post(
  '/:id/relation',
  passport.authenticate('jwt'),
  ServicesCtrl.createRelation,
);
services.delete('/:id', passport.authenticate('jwt'), ServicesCtrl.delete);
