import jwt from 'jsonwebtoken';

export class LoginCtrl {
  static async login(req, res, next) {
    try {
      res.json({
        status: 'success',
        data: {
          ...req.user,
          token: jwt.sign(
            { data: req.user },
            process.env.SECRET_KEY || 'secretKey',
            {
              expiresIn: '30d',
            },
          ),
        },
      });
    } catch (error) {
      next(error);
    }
  }
  // static async createAdmin(req, res, next) {
  //   try {
  //     const sql = 'INSERT INTO admins(name, password) VALUES(?,?)';
  //     const values = [req.body.name, req.body.password];
  //     const data = await conn.query(sql, values);
  //     res.json({
  //       status: 'success',
  //       data,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
  static async show(req, res, next) {
    try {
      const data = { ...req.user };
      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
