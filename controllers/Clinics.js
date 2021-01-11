import { ClinicModel } from '../Models/Clinic.js';
import { DoctorModel } from '../Models/Doctor.js';
import { ServiceModel } from '../Models/Service.js';
import pkg from 'mongoose';
import {
  ValidationError,
  ErrorHandler,
  BadRequestError,
  NotModifiedError,
} from '../utils/error.js';
import { validationResult } from 'express-validator';
const { isValidObjectId } = pkg;

export class ClinicsCtrl {
  static async index(req, res, next) {
    try {
      const data = await ClinicModel.find({}, 'name');
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
      const clinicId = req.params.id;
      if (!isValidObjectId(clinicId))
        throw new BadRequestError('Incorrect request parameters');
      const data = await ClinicModel.findById(
        clinicId,
        '-services -__v',
      ).populate({
        path: 'doctors',
        select: 'name',
        populate: {
          path: 'services',
          select: 'name',
        },
      });

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
      const data = await ClinicModel.find({}, '-services -__v')
        .populate({
          path: 'doctors',
          select: 'name',
          populate: {
            path: 'services',
            select: 'name',
          },
        })
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
      const body = {
        name: req.body.name,
      };
      const data = await ClinicModel.create(body);

      res.json({
        status: 'success',
        data,
      });
    } catch (err) {
      if (err.name == 'ValidationError') {
        next(new ValidationError(err));
      }
      next(err);
    }
  }

  static async createRelation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(new ValidationError({ errors: errors.array() }));
      }
      const clinicId = req.params.id;
      const servicesId = req.body.servicesId;
      const doctorsId = req.body.doctorsId;
      const uniqueDoctors =
        doctorsId &&
        (
          await Promise.all(
            doctorsId.map(async (id) => {
              try {
                const conditions = {
                  _id: id,
                  clinics: { $ne: clinicId },
                };
                const data = await DoctorModel.findOneAndUpdate(conditions, {
                  $push: { clinics: clinicId },
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
                  clinics: { $ne: clinicId },
                };
                const data = await ServiceModel.findOneAndUpdate(conditions, {
                  $push: { clinics: clinicId },
                });
                return data && id;
              } catch (error) {
                next(error);
              }
            }),
          )
        ).filter((item) => item);

      const isUniqueDoctors = uniqueDoctors && uniqueDoctors.length != 0;
      const isUniqueServices = uniqueServices && uniqueServices.length != 0;

      const data =
        (isUniqueDoctors || isUniqueServices) &&
        (await ClinicModel.findByIdAndUpdate(
          clinicId,
          {
            $push: {
              ...(isUniqueDoctors && { doctors: uniqueDoctors }),
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
            clinics: { $ne: paramsId },
          };
          const preUpdate = await model.findOneAndUpdate(conditions, {
            $push: { clinics: paramsId },
          });
          if (!preUpdate) throw new NotModifiedError();

          const data =
            preUpdate &&
            (await ClinicModel.findOneAndUpdate(
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
      if (req.body.doctorId) {
        updateModel(ClinicModel, paramsId, req.body.doctorId, {
          update: 'doctors',
        });
      }
    } catch (err) {
      next(err);
    }
  }
  static async delete(req, res, next) {
    try {
      if (!isValidObjectId(req.params.id))
        throw new BadRequestError('Incorrect request parameters');

      const clinicToDel = await ClinicModel.findById(req.params.id);
      if (!clinicToDel) throw new BadRequestError('Incorrect request params');

      await Promise.all([
        clinicToDel.services.forEach(async (id) => {
          try {
            await ServiceModel.findOneAndUpdate(
              { _id: id },
              { $pull: { clinics: req.params.id } },
            );
          } catch (error) {
            next(error);
          }
        }),
        clinicToDel.doctors.forEach(async (id) => {
          try {
            await DoctorModel.findOneAndUpdate(
              { _id: id },
              { $pull: { clinics: req.params.id } },
            );
          } catch (error) {
            next(error);
          }
        }),
      ]);

      const data = await ClinicModel.findByIdAndDelete(req.params.id);

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
      if (!req.query.doctorId && !req.query.serviceId)
        throw new BadRequestError('Incorrect parameters');

      const deleteRelation = async (model, paramsId, queryId, { update }) => {
        try {
          const preUpdate = await model.findOneAndUpdate(
            { _id: queryId, clinics: paramsId },
            {
              $pull: { clinics: paramsId },
            },
          );
          // if (!preUpdate) throw new NotModifiedError();

          const data = await ClinicModel.findByIdAndUpdate(
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

      req.query.doctorId &&
        deleteRelation(DoctorModel, req.params.id, req.query.doctorId, {
          update: 'doctors',
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
