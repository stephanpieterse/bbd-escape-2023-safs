const mathf = require('../mathfunc.js');
const assert = require('assert');

describe("Math func tests", function () {

  it("should be able to tell if a number is even", function () {
    assert(mathf.isEven(2));
    assert(mathf.isEven(-4));
    assert(!mathf.isEven(3));
    assert(!mathf.isEven(905));
  });

  it("should report powers correctly", function () {
    let testNums = [2, 3, 7, 13];
    let testPows = [1, 2, 3, 4, 9, 10];
    for (let tn in testNums) {
      for (let tp in testPows) {
        assert(mathf.numPowers(testNums[tn], [testPows[tp]])[0], Math.pow(testNums[tn], testPows[tp]));
      }
    }
  });

  it("aGreaterNum should always return a bigger number", function () {

    for (let i = 0; i < 1000000; i++) {
      let tgn = mathf.aGreaterNum(i);
      assert.equal(i < tgn, true, `${i} !< ${tgn}`);
    }

  });

  it("aLesserNum should always return a smaller number", function () {

    for (let i = 0; i < 1000000; i++) {
      let tln = mathf.aLesserNum(i);
      assert.equal(i > tln, true, `${i} !> ${tln}`);
    }

  });

});
