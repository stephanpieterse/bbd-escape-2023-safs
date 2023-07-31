const crypto = require('crypto');

const max = function (a, b) {
    return a > b ? a : b;
}

const isEven = function (num) {
    return num % 2 == 0;
};

const numPowers = function (num, pows) {
    let retObj = [];
    for (let p in pows) {
        retObj[p] = num;
        for (let i = 1; i < pows[p]; i++) {
            retObj[p] = retObj[p] * num;
        }
    }
    return retObj;
};

function nameHashing(name) {
    return crypto.createHash('sha256').update(name).digest('hex');
}

function aGreaterNum(num) {
    return ((Math.random() * num) + max(num, 1));
}

function aLesserNum(num) {
    return ((Math.random() * num) - 1);
}

module.exports = {
    isEven: isEven,
    numPowers, numPowers,
    nameHashing: nameHashing,
    aGreaterNum: aGreaterNum,
    aLesserNum: aLesserNum
}