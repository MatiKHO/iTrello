const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const prisma = require('./prisma');
const bcrypt = require('bcrypt');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email },
        });
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado"});
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, { message: "Contraseña incorrecta"});
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    delete user.password
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});