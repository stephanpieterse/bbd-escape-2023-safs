const assert = require('assert');
const index = require('../index.js');
const chai = require('chai');
chai.use(require('chai-http'));
let should = chai.should();

function userPassToHeader(user, pass) {
    return "Basic " + Buffer.from(user + ":" + pass, 'utf-8').toString('base64');
}

describe("http server tests", function () {

    it("empty user/pass should fail", function (done) {
        chai.request(index.app)
            .post('/stats')
            .send({
                name: 'john',
                number: '9'
            })
            .set('Authorization', userPassToHeader('', ''))
            .end(function (err, res) {
                res.should.have.status(401);
                done();
            });
    });

    it("anon user/pass should work", function (done) {
        chai.request(index.app)
            .post('/stats')
            .send({
                name: 'john',
                number: '9'
            })
            .set('Authorization', userPassToHeader('anon', 'anon'))
            .end(function (err, res) {
                done(err);
            });
    });

    it("empty user should fail", function (done) {
        chai.request(index.app)
            .post('/stats')
            .send({
                name: 'john',
                number: '9'
            })
            .set('Authorization', userPassToHeader('', 'koos'))
            .end(function (err, res) {
                done(err);
            });
    });

    it("empty pass should fail", function (done) {
        chai.request(index.app)
            .post('/stats')
            .send({
                name: 'john',
                number: '9'
            })
            .set('Authorization', userPassToHeader('koos', ''))
            .end(function (err, res) {
                done(err);
            });
    });

    it("401 with incorrect credentials", function (done) {
        chai.request(index.app)
            .post('/stats')
            .send({
                name: 'john',
                number: '9'
            })
            .set('Authorization', userPassToHeader('janneman', 'jansepass'))
            .end(function (err, res) {
                if (err) { done(err); return }
                res.should.have.status(200);
                chai.request(index.app)
                    .post('/stats')
                    .send({
                        name: 'john',
                        number: '10'
                    })
                    .set('Authorization', userPassToHeader('janneman', 'niejansepass'))
                    .end(function (err2, res2) {
                        res2.should.have.status(401);
                        done(err2);
                    });
            });
    });

    it("401 without credentials", function (done) {
        chai.request(index.app)
            .post('/stats')
            .send()
            .end(function (err, res) {
                res.should.have.status(401);
                done(err);
            });
    });

    it("should complete with missing data", function (done) {
        chai.request(index.app)
            .post('/stats')
            .send({
            })
            .set('Authorization', userPassToHeader('anon', 'anon'))
            .end(function (err, res) {
                done(err);
            });
    });

    it("should complete with incorrect data fields", function (done) {
        chai.request(index.app)
            .post('/stats')
            .send({
                'namen': 'roodle',
                'nommers': 'vyf'
            })
            .set('Authorization', userPassToHeader('anon', 'anon'))
            .end(function (err, res) {
                done(err);
            });
    });

    it("queries should return previous data", function (done) {
        chai.request(index.app)
            .post('/stats')
            .send({
                'name': 'roodle',
                'number': '54'
            })
            .set('Authorization', userPassToHeader('koosie', 'kossSEPASwword'))
            .end(function (err, res) {
                chai.request(index.app)
                    .get('/lastqueries')
                    .set('Authorization', userPassToHeader('koosie', 'kossSEPASwword'))
                    .end(function (err, res) {
                        res = res.body;
                        console.log(res);
                        for (let r in res) {
                            try {
                                assert('query' in res[r]);
                            } catch (e) {
                                done(e);
                            }
                        }
                        assert.equal(JSON.parse(res[0].query).na, 'roodle');
                        done(err);
                    });
            });
    });
});
