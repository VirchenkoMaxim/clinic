import { validationResult } from 'express-validator';
import pkg from 'mongoose';
const { isValidObjectId } = pkg;
import { ClinicModel } from '../Models/Clinic.js';
import { DoctorModel } from '../Models/Doctor.js';
import { ServiceModel } from '../Models/Service.js';
import {
  BadRequestError,
  ErrorHandler,
  NotModifiedError,
  ValidationError,
} from '../utils/error.js';

export class DoctorsCtrl {
  static async index(req, res, next) {
    try {
      const data = await DoctorModel.find({}, 'name');
      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async selectOne(req, res, next) {
    try {
      const doctorId = req.params.id;
      if (!isValidObjectId(doctorId)) {
        next(new BadRequestError('Incorrect parameters'));
        return;
      }
      const data = await DoctorModel.findById(doctorId)
        .populate({
          path: 'clinics',
          select: 'name',
        })
        .populate('services', 'name');

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getDetailedList(req, res, next) {
    try {
      const data = await DoctorModel.find({})
        .populate('clinics', 'name')
        .populate('services', 'name')
        .sort({ name: 1 });

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const body = { name: req.body.name };
      const data = await DoctorModel.create(body);

      res.json({
        status: 'success',
        data,
      });
    } catch (err) {
      if (err.name == 'ValidationError') {
        next(new ValidationError(err));
        return;
      }
      next(err);
    }
  }

  static async createRelation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(new ValidationError({ errors: errors.array() }));
        return;
      }
      const doctorId = req.params.id;
      const servicesId = req.body.servicesId;
      const clinicsId = req.body.clinicsId;

      const uniqueClinics =
        clinicsId &&
        (
          await Promise.all(
            clinicsId.map(async (id) => {
              try {
                const conditions = {
                  _id: id,
                  doctors: { $ne: doctorId },
                };
                const data = await ClinicModel.findOneAndUpdate(conditions, {
                  $push: { doctors: doctorId },
                });
                return data && id;
              } catch (error) {
                next(err);
              }
            }),
          )
        ).filter((item) => item);

      const uniqueServices =
        servicesId &&
        (
          await Promise.all(
            servicesId.map(async (id) => {
              try {
                const conditions = {
                  _id: id,
                  doctors: { $ne: doctorId },
                };
                const data = await ServiceModel.findOneAndUpdate(conditions, {
                  $push: { doctors: doctorId },
                });
                return data && id;
              } catch (error) {
                next(error);
              }
            }),
          )
        ).filter((item) => item);

      const isUniqueClinics = uniqueClinics && uniqueClinics.length != 0;
      const isUniqueServices = uniqueServices && uniqueServices.length != 0;

      const data =
        (isUniqueClinics || isUniqueServices) &&
        (await DoctorModel.findByIdAndUpdate(
          doctorId,
          {
            $push: {
              ...(isUniqueClinics && { clinics: uniqueClinics }),
              ...(isUniqueServices && { services: uniqueServices }),
            },
          },
          { new: true },
        ));

      if (!data) throw new NotModifiedError();

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  static async addOneToRelation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(new ValidationError({ errors: errors.array() }));
        return;
      }

      const paramsId = req.params.id;
      const updateModel = async (model, paramsId, idForUpdate, { update }) => {
        try {
          const conditions = {
            _id: idForUpdate,
            doctors: { $ne: paramsId },
          };
          const preUpdate = await model.findOneAndUpdate(conditions, {
            $push: { doctors: paramsId },
          });
          if (!preUpdate) throw new NotModifiedError();

          const data =
            preUpdate &&
            (await DoctorModel.findOneAndUpdate(
              { _id: paramsId, [update]: { $ne: idForUpdate } },
              {
                $push: { [update]: idForUpdate },
              },
              { new: true },
            ));
          if (!data) throw new NotModifiedError();

          res.json({
            status: 'success',
            data,
          });
        } catch (error) {
          next(error);
        }
      };

      if (req.body.serviceId) {
        updateModel(ServiceModel, paramsId, req.body.serviceId, {
          update: 'services',
        });
      }
      if (req.body.clinicId) {
        updateModel(ClinicModel, paramsId, req.body.clinicId, {
          update: 'clinics',
        });
      }
    } catch (err) {
      next(err);
    }
  }
  static async delete(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id))
        next(new BadRequestError('Incorrect parameters'));

      const doctorToDel = await DoctorModel.findById(req.params.id);
      if (!doctorToDel) throw new BadRequestError('Incorrect parameters');
      console.log(doctorToDel);
      await Promise.all([
        doctorToDel.services.forEach(async (id) => {
          try {
            await ServiceModel.findOneAndUpdate(
              { _id: id },
              { $pull: { doctors: req.params.id } },
            );
          } catch (error) {
            next(error);
          }
        }),
        doctorToDel.clinics.forEach(async (id) => {
          try {
            await ClinicModel.findOneAndUpdate(
              { _id: id },
              { $pull: { doctors: req.params.id } },
            );
          } catch (error) {
            next(error);
          }
        }),
      ]);

      const data = await DoctorModel.findByIdAndDelete(req.params.id);
      res.json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  }
  static async deleteRelation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(new ValidationError({ errors: errors.array() }));
        return;
      }
      if (!req.query.clinicId && !req.query.serviceId)
        throw new BadRequestError('Incorrect parameters');
      const deleteRelation = async (model, paramsId, queryId, { update }) => {
        try {
          const preUpdate = await model.findOneAndUpdate(
            { _id: queryId, doctors: paramsId },
            {
              $pull: { doctors: paramsId },
            },
          );
          // if (!preUpdate) throw new NotModifiedError();

          const data = await DoctorModel.findByIdAndUpdate(
            paramsId,
            {
              $pull: { [update]: queryId },
            },
            { new: true },
          );
          if (!data) throw new NotModifiedError();

          res.json({
            status: 'success',
            data,
          });
        } catch (error) {
          next(error);
        }
      };

      req.query.clinicId &&
        deleteRelation(ClinicModel, req.params.id, req.query.clinicId, {
          update: 'clinics',
        });

      req.query.serviceId &&
        deleteRelation(ServiceModel, req.params.id, req.query.serviceId, {
          update: 'services',
        });
    } catch (error) {
      next(error);
    }
  }
}
