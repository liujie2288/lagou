// lodash中curry的基本使用

// 对应视频小节 - 16.Lodash中柯里化方法

const _ = require("lodash");

function sum(a, b, c) {
  return a + b + c;
}

// _.curry接收一个函数(func)作为参数并返回一个新的函数
// 该函数接收所有func的参数，参数够了就立即返回结果
// 如果不够则返回一个接收剩余参数的函数
const curried = _.curry(sum);

console.log(curried(1)(3)(4, 5));
console.log(curried(1, 2)(3));
console.log(curried(1)(3)(4));

// 自己实现一个curry
function myCurry(fn) {
  return function inner(...args) {
    if (args.length >= fn.length) {
      return fn.apply(fn, args);
    } else {
      return inner.bind(inner, ...args);
    }
  };
}

var getSum = myCurry(sum);

console.log("~~~", getSum(1)(4)(3));
