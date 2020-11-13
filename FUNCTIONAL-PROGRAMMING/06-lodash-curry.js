const _ = require("lodash");

function getSum(a, b, c) { 
  return a + b + c;
}

const getSumCurry = _.curry(getSum);

console.log(getSumCurry(1, 2, 3, 4))
console.log(getSumCurry(1, 2)(3))