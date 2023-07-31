const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const config = require('./config.js');
const logger = require('./logger.js');
const db = require('./db.js');
const mathf = require('./mathfunc.js');

function getStats(name, number) {

    let returnObject = {};

    if (mathf.isEven(number)) {
        returnObject = {
            "Is Even": true,
            "Is less than": mathf.aGreaterNum(number),
            "Powers 2, 4": mathf.numPowers(number, [2, 4]),
            "SHA256 of name": mathf.nameHashing(name),
            "Name length": name.length,
        };
    } else {
        returnObject = {
            "Is Even": false,
            "Is greater than": mathf.aLesserNum(number),
            "Powers 3, 5": mathf.numPowers(number, [3, 5]),
            "SHA256 of number": mathf.nameHashing(number.toString()),
            "First character": name[0]
        };
    }

    return returnObject;
}

function checkAnon(name, pass) {
    return (name == 'anon' && name == pass) ? { 'id': 'anon' } : false;
}

app.use(async function (req, res, next) {
    let basicAuthHeader = req.get('Authorization');
    if (!basicAuthHeader) {
        res.status(401);
        res.json({ error: 'Authorization required' });
        return;
    }
    if (basicAuthHeader.toLowerCase().indexOf("basic") !== 0) {
        res.status(401);
        res.json({ error: 'Only Basic auth supported currently' });
        return;
    }
    let auth64 = basicAuthHeader.split(" ")[1];
    let userpass;
    try {
        userpass = Buffer.from(auth64, 'base64').toString('utf-8');
    } catch (e) {
        logger.error(e);
        res.status(401);
        res.json({ error: 'Bad auth values' });
        return;
    }
    let name = userpass.split(':')[0];
    let password = userpass.split(':')[1];
    if (name == '' || password == '') {
        res.status(401);
        res.json({ error: 'Auth cannot be empty' });
        return;
    }
    let user;
    try {
        _user = checkAnon(name, password) || await db.checkUser(name, password);
    } catch (e) {
        logger.error(e);
        res.status(401);
        res.json({ error: 'Authentication error' });
        return;
    }

    if (_user.id) {
        req._user = _user;
        next();
    } else {
        res.status(401);
        res.json({ error: 'Invalid username or password' });
        return;
    }
});

app.get("/lastqueries", function (req, res) {
    db.getUserQueries(req._user).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.json({ "error": "An error occured while retrieving queries" });
        console.log(err);
    });
});

app.use(bodyParser.json());
app.post("/stats", function (req, res) {

    let name = req.body["name"] || "";
    let number = (req.body["number"] || 0).toString();

    name = name.replace(/[^a-z]/gi, '');
    number = parseInt(number.replace(/[^0-9]/gi, '')) || 0;

    logger.debug(`Received stats request for uid ${name} :: ${number}`);

    if (req._user.id != 'anon') {
        db.addQuery(req._user, { 'na': name, 'nu': number });
    }

    res.json(getStats(name, number));
});

app.use(function (err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    logger.error(err);
    res.status(500);
    res.json({ error: 'Unexpected error' });
});

if (process.env["NO_SERVER"] != "true") {
    app.listen(config.server.port, function () {
        logger.info(`Server started listening on ${config.server.hostname}:${config.server.port}`);
    });
}

module.exports = {
    app: app
};
