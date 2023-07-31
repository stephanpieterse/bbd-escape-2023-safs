const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const config = require('./config.js');
const logger = require('./logger.js');
const db = new sqlite3.Database(config.database.filename);

function cleanup(cb) {
    logger.debug("Running database cleanup...");

    db.exec("DELETE FROM users WHERE id NOT IN (SELECT id FROM users ORDER BY lastlogon DESC LIMIT 40)")
        .exec("DELETE FROM queries WHERE userid NOT IN (SELECT id FROM users)")
        .exec("DELETE FROM queries as q1 WHERE id NOT IN (SELECT id FROM queries as q2 WHERE q1.userid = q2.userid ORDER BY querytime DESC LIMIT 10)", function () {
            if (typeof cb == 'function') {
                cb();
            };
        });
}

function addQuery(user, query) {
    logger.debug("Adding new query for user " + user.id);
    db.run("INSERT INTO queries VALUES(?,?,?,?)", [null, user.id, JSON.stringify(query), new Date()]);
    cleanup();
}

function addUser(user, passhash) {
    logger.info("Adding user " + user);
    return new Promise(function (resolve, reject) {
        db.run("INSERT INTO users VALUES(?,?,?,?)", [null, user, passhash, new Date()])
            .get("SELECT id FROM users WHERE name=?", [user], function (ie, ir) {
                if (ie) {
                    reject(ie);
                }
                logger.info("Returning ", ir);
                resolve(ir);
            });
    });
}

function getUserQueries(user) {
    logger.debug("Getting user queries for :: " + user.id);
    return new Promise(function (resolve, reject) {
        db.all("SELECT id,query FROM queries WHERE userid=? ORDER BY querytime DESC", [user.id], function (err, rows) {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

function checkUser(user, pass) {
    return new Promise(function (resolve, reject) {
        let passhash = crypto.createHash('sha512').update(user + pass).digest('hex');
        db.get("SELECT id,passwordhash FROM users WHERE name=?", [user], function (err, row) {
            if (err) {
                reject(err);
            }
            if (!row) {
                addUser(user, passhash).then(function (newuser) {
                    resolve(newuser);
                });
            } else {
                if (row.passwordhash != passhash) {
                    reject("Password mismatch");
                    return;
                }
                logger.debug("Found user, returning...");
                db.run("UPDATE users SET lastlogon=? WHERE id=?", [new Date(), row.id]);
                resolve(row);
            }
        });
    });
}

module.exports = {
    cleanup: cleanup,
    db: db,
    checkUser: checkUser,
    getUserQueries: getUserQueries,
    addQuery: addQuery
};
