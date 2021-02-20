const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy
const pool = require('../../middlewares/database.js');
let initialize, authenticate, authorize;

passport.serializeUser((email, done) => {
  done(null, email);
});

passport.deserializeUser(async (email, done) => {
  try {
    const user = await pool.query(`SELECT email, role FROM users WHERE email = ?;`, email.email);
    const permission = await pool.query('select permission from privilege where role = ?', user[0].role);
    user[0].permission = permission[0].permission;
    done(null, user);
  }
  catch (err) {
    done(err);
  }
});

passport.use('local-strategy',
  new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, username, password, done) => {
    try {
      const auth = await pool.query(`SELECT email FROM users WHERE email = ? AND password = ?;`, [username, password]);

      if (!auth[0]) {
        console.log(username, passport, auth)
        done(null, false, req.flash("message", "メールアドレスまたはパスワードが間違っています！"));
      } else {
        done(null, auth[0]);
      }
    }
    catch (err) {
      done("dbデータ取得エラー", err);
    };
  }
  ));

initialize = function () {
  return [
    passport.initialize(),
    passport.session(),
    function(req, res, next) {
      if(req.user) {
        res.locals.user = req.user;
      };
      next();
    }
  ];
};

authenticate = function () {
  return passport.authenticate(
    'local-strategy', {
    successRedirect: '/history',
    failureRedirect: '/auth/login'
  }
  );
};

authorize = function (permission) {
  return (req, res, next) => {
    if (req.isAuthenticated() &&
    (req.user[0].permission === permission) ) {
      next();
    } else {
      res.redirect('/auth/login');
    };
  };
};

module.exports = {
  initialize,
  authenticate,
  authorize
};