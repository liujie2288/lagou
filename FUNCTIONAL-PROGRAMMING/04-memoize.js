const _ = require("lodash");

function getSum(num1, num2) {
  console.log("调用了");
  return num1 + num2;
}
const memorizeGetSum = _.memoize(getSum);

console.log(memorizeGetSum(4, 5));
console.log(memorizeGetSum(4, 5));
console.log(memorizeGetSum(4, 5));

function myMemoize(fn) {
  let cache = {};
  return (...args) => {
    let key = JSON.stringify(args);
    // console.log(key);
    if (cache[key]) {
      return cache[key];
    } else {
      let result = fn.apply(this, args);
      cache[key] = result;
      return result;
    }
  };
}

const myMemoizeGetSum = myMemoize(getSum);

console.log(myMemoizeGetSum(1, 3));
console.log(myMemoizeGetSum(3, 1));


