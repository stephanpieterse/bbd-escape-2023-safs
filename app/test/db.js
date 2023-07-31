const config = require('../config.js');
const db = require('../db.js');
const assert = require('assert');

describe("DB tests", function () {

    it("Users and queries limited after cleanup", function (done) {
        db.cleanup(function (a) {
            db.db.get("SELECT COUNT(id) as c FROM users", [], function (ie, ir) {
                assert.equal(ir.c <= 40, true);
            });
            db.db.get("SELECT COUNT(id) as c FROM queries", [], function (ie, ir) {
                assert.equal(ir.c <= 40*10, true);
            });
            done();
        });
    });
});
