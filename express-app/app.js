module.exports = function configure_app(app, di_container) {
  var express = require('express');
  var cookieParser = require('cookie-parser');
  var logger = require('morgan');
  var helmet = require('helmet');
  var compression = require('compression')
  var path = require('path');

  var indexRouter = require('./routes/index');
  // var usersRouter = require('./routes/users'); // No users in website

  app.set('port', di_container.port);
  app.set('env', di_container.env);

  // view engine setup
  app.set('views', 'views');
  app.set('view engine', 'pug');

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static('public'));
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/mithril/2.3.0/mithril.min.js"],
      },
    },
  }));
  app.disable('x-powered-by');

  if (di_container.env === 'production') {
    app.use(compression)
    app.use(logger('common'));
    app.use(cookieParser()); //! TODO: change to proper, secure library with keys
  } else {
    app.use(logger('dev'));
  }

  // Use the middleware to enforce HTTPS
  app.use(redirect_http);

  // Set routes
  app.use('/', indexRouter);
  // app.use('/users', usersRouter);
  app.use('/answers', di_container.answers_router);
  app.use('/questions', di_container.questions_router);

  // Prevent open redirects
  app.use(no_open_redirect)

  // catch 404 and forward to error handler
  // custom 404
  app.use(handle_404);

  // error handler
  app.use(request_err_handler);

  return app
}

function no_open_redirect(req, res) {
  try {
    if (new Url(req.query.url).host !== 'example.com') { //! TODO: set host appropriately
      return res.status(400).end(`Unsupported redirect to host: ${req.query.url}`)
    }
  } catch (e) {
    return res.status(400).end(`Invalid url: ${req.query.url}`)
  }
  res.redirect(req.query.url)
}

function handle_404(req, res, next) {
  res.status(404).send("Sorry can't find that!")
}

function request_err_handler(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
}

// Define a middleware to redirect HTTP to HTTPS
function redirect_http(req, res, next) {
  if (req.secure) {
    // Request is already secure (HTTPS)
    return next();
  }
  // Redirect to HTTPS version of the URL
  res.redirect('https://' + req.hostname + req.originalUrl);
}