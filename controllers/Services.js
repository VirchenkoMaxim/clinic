import { conn } from '../core/db.js';
import { valuesFromReqArr } from '../utils/helpers.js';

export class ServicesCtrl {
  static async index(req, res, next) {
    try {
      const sql = 'SELECT * FROM services';
      const [data] = await conn.query(sql);
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
      const doctorsSql = `
      select d.*
      from doctors d
      inner join services_has_doctors sd on d.id = sd.doctors_id
      inner join services s on sd.services_id = s.id
      WHERE s.id = ? `;
      const clinicsSql = `select c.*  
       from clinics c
       inner join clinics_has_services cs on c.id = cs.clinics_id
       inner join services s on cs.services_id = s.id
       WHERE s.id = ? `;
      const serviceSql = `SELECT * from services WHERE id = ?`;
      const [service] = await conn.query(serviceSql, [serviceId]);
      const [doctors] = await conn.query(doctorsSql, [serviceId]);
      const [clinics] = await conn.query(clinicsSql, [serviceId]);
      service[0]
        ? res.json({
            status: 'success',
            data: { ...service[0], doctors, clinics },
          })
        : next(new Error('Undefined value'));
    } catch (error) {
      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const sql = 'INSERT INTO services(name) VALUES(?)';
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
  static async createRelation(req, res, next) {
    try {
      const serviceId = +req.params.id;
      const doctors =
        !req.body.doctors_id || req.body.doctors_id.length != 0
          ? req.body.doctors_id
          : false;
      const clinics =
        !req.body.clinics_id || req.body.clinics_id.length != 0
          ? req.body.clinics_id
          : false;

      if (doctors) {
        const values = valuesFromReqArr(serviceId, doctors);
        const sql =
          'INSERT INTO clinics_has_doctors(clinics_id, doctors_id) VALUES ?';
        const data = await conn.query(sql, [values]);
      }
      if (clinics) {
        const values = services && valuesFromReqArr(serviceId, clinics);
        const sql =
          'INSERT INTO clinics_has_services( services_id, clinics_id) VALUES ?';
        const data = await conn.query(sql, [values]);
      }
      res.json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      const sql = 'DELETE FROM services WHERE id = ?';
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
