import { Strategy as LocalStrategy } from 'passport-local';

import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

export const initializePassport = (passport) => {
  const authenticateUser = async (name, password, done) => {
    try {
      const data = 'SELECT name, id, password FROM admins WHERE name = ?';
      const [user] = await conn.query(sql, [name]);
      if (user.length == 0 || +password !== +user[0].password) {
        return done(Error('Incorrect username or password'), false);
      }
      return done(null, user[0]);
    } catch (error) {
      done(error);
    }
  };

  passport.use(
    new LocalStrategy(
      { usernameField: 'name', passwordField: 'password' },
      authenticateUser,
    ),
  );
  passport.use(
    new JwtStrategy(
      {
        secretOrKey: process.env.SECRET_KEY || 'secretKey',
        jwtFromRequest: ExtractJwt.fromHeader('token'),
      },
      async (payload, done) => {
        try {
          const sql = 'SELECT  id, name FROM admins WHERE id = ?';
          const [data] = await conn.query(sql, [payload.data.id]);
          return done(null, data[0]);
        } catch (error) {
          return done(error, false, { message: 'Not authorized' });
        }
      },
    ),
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    const sql = 'SELECT id, name FROM admins WHERE id = ?';
    const [user] = await conn.query(sql, [id]);
    done(null, user[0]);
  });
};
