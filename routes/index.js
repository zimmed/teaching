var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'zimmed.io' });
});


/* STUDENT HOMEPAGES */

function load_index (path, res) {
    if (path && path.charAt(path.length - 1) !== '/') path += '/';
    if (fs.existsSync(path + 'index.html')) {
        res.sendFile(path + 'index.html');
    } else if (fs.existsSync(path + 'index.htm')) {
        res.sendFile(path + 'index.htm');
    } else if (fs.existsSync(path + 'default.html')) {
        res.sendFile(path + 'default.html');
    } else if (fs.existsSync(path + 'default.htm')) {
        res.sendFile(path + 'default.htm');
    } else {
        var error = new Error('Not Found');
        error.status = 404;
        res.render('error', {
            error: error,
            message: "Could not locate index page."
        });
    }
}

router.get(/^(\/\~|\~)([a-zA-Z0-9]+)(\/$|$|\/(.+)$)/, function (req, res) {
    var user = req.params[1].toLowerCase(),
        path = req.params[3],
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


module.exports = router;
