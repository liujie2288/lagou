const { compose, curry } = require("folktale/core/lambda");
const { toUpper, first } = require("lodash");

// 第一个是参数数量和lodash不同
// 这个参数应该是folktale用来判断继续返回函数还是返回结果的标识
const getSum = curry(2, function (a, b) {
  return a + b;
});

console.log(getSum(1)(3));

const f = compose(toUpper, first);

console.log(f(["jay", "smith"]));
