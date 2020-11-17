// 柯里化案例
const _ = require("lodash");

// 通过闭包简单实现函数参数的缓存
function match(reg) {
  return (str) => {
    return str.match(reg);
  };
}

// 通过lodash中curry函数可实现任意数量参数缓存
const curryMatch = _.curry((reg, str) => {
  return str.match(reg);
});

// 调用函数返回了一个具有特定功能的新函数
const hasSpace = match(/\s+/g);
const hasSpace1 = curryMatch(/\s+/g);
const hasNumber = match(/\d+/g);
const hasNumber1 = curryMatch(/\d+/g);

console.log(hasSpace("sdf adf"));
console.log(hasSpace1("sdf adf"));
console.log(hasNumber("12agc"));
console.log(hasNumber1("12agc"));

// 通过func来抽离公用filter逻辑
function filter(func, arr) {
  return arr.filter(func);
}

// 将函数柯里化
const filterCurry = _.curry(filter);

// 通过curry预设filter筛选空白字符函数
// 复用了hasSpace1逻辑
const findSpace = filterCurry(hasSpace1);

console.log(findSpace(["a", "a b", "a c"]));
