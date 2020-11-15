import { conn } from '../core/db.js';

export class DoctorsCtrl {
  static async index(req, res, next) {
    try {
      const sql = 'SELECT * FROM doctors';
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
      const doctorId = req.params.id;
      const clinicsSql = `
      select c.*
      from clinics c
      inner join clinics_has_doctors cd on c.id = cd.clinics_id
      inner join doctors d on cd.doctors_id = d.id
      WHERE d.id = ? ;`;
      const servicesSql = `
       select s.*  
       from services s
       inner join services_has_doctors sd on s.id = sd.services_id
       inner join doctors d on sd.doctors_id = d.id
       WHERE d.id = ? `;
      const clinicSql = `SELECT * from doctors WHERE id = ?`;
      const [doctor] = await conn.query(clinicSql, [doctorId]);
      const [clinics] = await conn.query(clinicsSql, [doctorId]);
      const [services] = await conn.query(servicesSql, [doctorId]);
      doctor[0]
        ? res.json({
            status: 'success',
            data: { ...doctor[0], clinics, services },
          })
        : next(new Error('Undefined value'));
    } catch (error) {
      next(error);
    }
  }
  static async getDetailedList(req, res, next) {
    try {
      const doctorsSql = `SELECT * from doctors`;
      const [doctors] = await conn.query(doctorsSql);
      const data = await Promise.all(
        doctors.map(async (item, index) => {
          const clinicsSql = `
          select c.*
          from clinics c
          inner join clinics_has_doctors cd on c.id = cd.clinics_id
          inner join doctors d on cd.doctors_id = d.id
          WHERE d.id = ? `;
          const doctorsSql = `
          select s.*  
          from services s
          inner join services_has_doctors sd on s.id = sd.services_id
          inner join doctors d on sd.doctors_id = d.id
          WHERE d.id = ? `;

          const [clinics] = await conn.query(clinicsSql, [item.id]);
          const [services] = await conn.query(doctorsSql, [item.id]);

          return { ...item, clinics, services };
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
      const sql = 'INSERT INTO doctors(name) VALUES(?)';
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
      const doctorId = +req.params.id;
      const services =
        !req.body.services_id || req.body.services_id.length != 0
          ? req.body.services_id
          : false;
      const clinics =
        !req.body.clinics_id || req.body.clinics_id.length != 0
          ? req.body.clinics_id
          : false;

      if (clinics) {
        const values = valuesFromReqArr(doctorId, clinics);
        const sql =
          'INSERT INTO clinics_has_doctors(doctors_id, clinics_id) VALUES ?';
        const data = await conn.query(sql, [values]);
      }
      if (services) {
        const values = valuesFromReqArr(doctorId, services);
        const sql =
          'INSERT INTO services_has_doctors(doctors_id, services_id) VALUES ?';
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
      const sql = 'DELETE FROM doctors WHERE id = ?';
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
