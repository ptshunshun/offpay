const createError = require('http-errors');
const config = require('config');
const { SESSION_SECRET } = config.security;
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const logger = require('./middlewares/logger');
const bodyParser = require('body-parser');
// const favicon = require('serve-favicon')
const pool = require('./middlewares/database.js');
const db_init = require('./models/db_init.js');
const accountcontorol = require('./public/lib/accountcontorol.js')
const flash = require('connect-flash');

const indexRouter = require('./routes/index.js');
const authRouter = require('./routes/auth.js');
const registRouter = require('./routes/regist.js');
const payoffRouter = require('./routes/payoff.js');
const historyRouter = require('./routes/history.js');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(favicon(__dirname + '/public/images/favicon.ico'));

// const {create} = require('./middlewares/database_new.js');
// const db = database.createClient();
// process.on('unhandledRejection', console.dir);
// create();
db_init.create();

const sessionStore = new MySQLStore({}, pool);
app.use(session({
  secret: SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
  name: "sid"
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(flash());

app.use(...accountcontorol.initialize());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/regist', registRouter);
app.use('/payoff', payoffRouter);
app.use('/history', historyRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

logger.system.info("Boot the API server.");
logger.system.info("NODE_ENV= %s", process.env.NODE_ENV);
logger.system.info("config= %s", config.config_env);


module.exports = app;
