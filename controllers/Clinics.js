import { conn } from '../core/db.js';
import { valuesFromReqArr } from '../utils/helpers.js';

export class ClinicsCtrl {
  static async index(req, res, next) {
    try {
      const sql = 'SELECT * FROM clinics';
      const [data] = await conn.query(sql);
      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createRelation(req, res, next) {
    try {
      const clinicId = +req.params.id;
      const doctors =
        !req.body.doctors_id || req.body.doctors_id.length != 0
          ? req.body.doctors_id
          : false;
      const services =
        !req.body.services_id || req.body.services_id.length != 0
          ? req.body.services_id
          : false;

      if (doctors) {
        const values = valuesFromReqArr(clinicId, doctors);
        const sql =
          'INSERT INTO clinics_has_doctors(clinics_id, doctors_id) VALUES ?';
        const data = await conn.query(sql, [values]);
      }
      if (services) {
        const values = valuesFromReqArr(clinicId, services);
        const sql =
          'INSERT INTO clinics_has_services(clinics_id, services_id) VALUES ?';
        const data = await conn.query(sql, [values]);
      }
      res.json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }

  static async selectOne(req, res, next) {
    try {
      const clinicId = req.params.id;
      const doctorsSql = `
      select d.*
      from doctors d
      inner join clinics_has_doctors cd on d.id = cd.doctors_id
      inner join clinics c on cd.clinics_id = c.id
      WHERE c.id = ? `;
      const servicesSql = `select s.*  
       from services s
       inner join clinics_has_services cs on s.id = cs.services_id
       inner join clinics c on cs.clinics_id = c.id
       WHERE c.id = ? `;
      const clinicSql = `SELECT * from clinics WHERE id = ?`;
      const [clinic] = await conn.query(clinicSql, [clinicId]);
      const [doctors] = await conn.query(doctorsSql, [clinicId]);
      const [services] = await conn.query(servicesSql, [clinicId]);
      clinic[0]
        ? res.json({
            status: 'success',
            data: { ...clinic[0], doctors, services },
          })
        : next(new Error('Undefined value'));
    } catch (error) {
      next(error);
    }
  }
  static async getDetailedList(req, res, next) {
    try {
      const clinicsSql = `SELECT * from clinics`;
      const [clinics] = await conn.query(clinicsSql);
      const data = await Promise.all(
        clinics.map(async (item, index) => {
          const sql = `
        select d.*
        from doctors d
        inner join clinics_has_doctors cd on d.id = cd.doctors_id
        inner join clinics c on cd.clinics_id = c.id
        WHERE c.id = ? `;
          const [doctors] = await conn.query(sql, [item.id]);

          const doctorsWithServices = await Promise.all(
            doctors.map(async (item, index) => {
              const sql = `select s.*  
              from services s
              inner join clinics_has_services cs on s.id = cs.services_id
              inner join clinics c on cs.clinics_id = c.id
              WHERE c.id = ? `;
              const [services] = await conn.query(sql, [item.id]);
              return { ...item, services };
            }),
          );
          return { ...item, doctors: doctorsWithServices };
        }),
      );
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
      const sql = 'INSERT INTO clinics(name) VALUES(?)';
      const value = [req.body.name];
      const [data] = await conn.query(sql, value);

      res.json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const sql = 'DELETE FROM clinics WHERE id = ?';
      const value = [req.params.id];
      const data = await conn.query(sql, value);
      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
