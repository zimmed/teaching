var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* STUDENT HOMEPAGES */

function load_index (path) {
    if (path && path.charAt(path.length - 1) !== '/') path += '/';
    if (fs.existsSync(path + 'index.html')) {
        fs.sendFile(path + 'index.html');
    } else if (fs.existsSync(path + 'index.htm')) {
        fs.sendFile(path + 'index.htm');
    } else if (fs.existsSync(path + 'default.html')) {
        fs.sendFile(path + 'default.html');
    } else if (fs.existsSync(path + 'default.htm')) {
        fs.sendFile(path + 'default.htm');
    } else {
        var error = new Error('Not Found');
        error.status = 404;
        res.render('error', {
            error: error,
            message: "Could not locate index page."
        });
    }
}

app.get(/^(\/\~|\~)([a-zA-Z0-9]+)(\/$|$|\/(.+)$)/, function (req, res) {
    var user = req.params[2].toLowerCase(),
        path = req.params[4],
        base = '/home/students/' + user + '/public_html';
    fs.exists(base, function (exists) {
        if (!exists) {
            var error = new Error('Not Found');
            error.status = 404;
            res.render('error', {
                message: "User not found: " + user,
                error: error
            });
        } else {
            if (path) path = path.replace(/\.\.\//g, '');
            if (path && path.length > 0) {
                fs.stats(base + '/' + path, function (err, stats) {
                    if (stats && stats.isFile()) {
                        res.sendFile(base + '/' + path);
                    } else if (stats && stats.isDirectory()) {
                        load_index(base + '/' + path, res);
                    } else {
                        if (err) {
                            console.log('Fs.stats err >>>');
                            console.log(err);
                        }
                        var error = new Error('Not Found');
                        error.status = 404;
                        res.render('error', {
                            message: "File not found: /" + path,
                            error: error
                        });
                    }
                });
            } else {
                load_index(base);
            }
        }
    });
});

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/** Temporary driver **/

var server = app.listen(8088, function () {
    console.log("Server started at " + server.address().address + " : " + server.address().port);
});

module.exports = app;
