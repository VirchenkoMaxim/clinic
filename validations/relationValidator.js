import { body, check } from 'express-validator';
import pkg from 'mongoose';
import { BadRequestError } from '../utils/error.js';
const { isValidObjectId } = pkg;

export const relationValidator = [
  body(['clinicsId', 'servicesId', 'doctorsId'])
    .isArray()
    .withMessage('Required array')
    .notEmpty()
    .withMessage('Required value')
    .optional()
    .custom((value) => {
      Array.isArray(value) &&
        value.forEach((id) => {
          if (!isValidObjectId(id))
            throw new BadRequestError('Incorrect body parameters');
        });
      return true;
    }),
  check(['clinicId', 'serviceId', 'id'])
    .notEmpty()
    .withMessage('Required value')
    .optional()
    .isString()
    .withMessage('Value must be string type')
    .custom((value) => {
      if (!isValidObjectId(value))
        throw new BadRequestError('Incorrect body parameters');
      return true;
    }),
];
