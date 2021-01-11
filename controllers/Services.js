import { validationResult } from 'express-validator';
import pkg from 'mongoose';
const { isValidObjectId } = pkg;
import { ClinicModel } from '../Models/Clinic.js';
import { DoctorModel } from '../Models/Doctor.js';
import { ServiceModel } from '../Models/Service.js';
import {
  BadRequestError,
  NotModifiedError,
  ValidationError,
} from '../utils/error.js';

export class ServicesCtrl {
  static async index(_, res, next) {
    try {
      const data = await ServiceModel.find({}, 'name');

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
      const serviceId = req.params.id;
      if (!isValidObjectId(serviceId)) {
        next(new BadRequestError('Incorrect parameters'));
        return;
      }
      const data = await ServiceModel.findById(serviceId)
        .populate('clinics', 'name')
        .populate('doctors', 'name');

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
      const data = await ServiceModel.find({})
        .populate('clinics', 'name')
        .populate('doctors', 'name')
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
      const data = await ServiceModel.create(body);

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

      const serviceId = req.params.id;
      const doctorsId = req.body.doctorsId;
      const clinicsId = req.body.clinicsId;

      const uniqueClinics =
        clinicsId &&
        (
          await Promise.all(
            clinicsId.map(async (id) => {
              try {
                const conditions = {
                  _id: id,
                  services: { $ne: serviceId },
                };
                const data = await ClinicModel.findOneAndUpdate(conditions, {
                  $push: { services: serviceId },
                });
                return data && id;
              } catch (error) {
                next(error);
              }
            }),
          )
        ).filter((item) => item);

      const uniqueDoctors =
        doctorsId &&
        (
          await Promise.all(
            doctorsId.map(async (id) => {
              try {
                const conditions = {
                  _id: id,
                  services: { $ne: serviceId },
                };
                const data = await DoctorModel.findOneAndUpdate(conditions, {
                  $push: { services: serviceId },
                });
                return data && id;
              } catch (error) {
                next(error);
              }
            }),
          )
        ).filter((item) => item);

      const isUniqueClinics = uniqueClinics && uniqueClinics.length != 0;
      const isUniqueDoctors = uniqueDoctors && uniqueDoctors.length != 0;

      const data =
        (isUniqueClinics || isUniqueDoctors) &&
        (await ServiceModel.findByIdAndUpdate(
          serviceId,
          {
            $push: {
              ...(isUniqueClinics && { clinics: uniqueClinics }),
              ...(isUniqueDoctors && { doctors: uniqueDoctors }),
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
            services: { $ne: paramsId },
          };
          const preUpdate = await model.findOneAndUpdate(conditions, {
            $push: { services: paramsId },
          });
          if (!preUpdate) throw new NotModifiedError();

          const data =
            preUpdate &&
            (await ServiceModel.findOneAndUpdate(
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

      if (req.body.doctorId) {
        updateModel(DoctorModel, paramsId, req.body.doctorId, {
          update: 'doctors',
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

      const serviceToDel = await ServiceModel.findById(req.params.id);

      if (!serviceToDel) throw new BadRequestError('Incorrect parameters');

      await Promise.all([
        serviceToDel.doctors.forEach(async (id) => {
          try {
            await DoctorModel.findOneAndUpdate(
              { _id: id },
              { $pull: { services: req.params.id } },
            );
          } catch (error) {
            next(error);
          }
        }),
        serviceToDel.clinics.forEach(async (id) => {
          try {
            await ClinicModel.findOneAndUpdate(
              { _id: id },
              { $pull: { services: req.params.id } },
            );
          } catch (error) {
            next(error);
          }
        }),
      ]);

      const data = await ServiceModel.findByIdAndDelete(req.params.id);
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
      if (!req.query.doctorId && !req.query.clinicId)
        throw new BadRequestError('Incorrect parameters');
      const deleteRelation = async (model, paramsId, queryId, { update }) => {
        try {
          const preUpdate = await model.findOneAndUpdate(
            { _id: queryId, services: paramsId },
            {
              $pull: { services: paramsId },
            },
          );
          // if (!preUpdate) throw new NotModifiedError();

          const data = await ServiceModel.findByIdAndUpdate(
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

      req.query.doctorId &&
        deleteRelation(DoctorModel, req.params.id, req.query.doctorId, {
          update: 'doctors',
        });
    } catch (error) {
      next(error);
    }
  }
}
