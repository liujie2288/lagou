// 柯里化案例
const _ = require("lodash");

function match(reg) {
  return (str) => {
    return str.match(reg);
  };
}

const curryMatch = _.curry((reg, str) => {
  return str.match(reg);
});

const hasSpace = match(/\s+/g);
const hasSpace1 = curryMatch(/\s+/g);
const hasNumber = match(/\d+/g);

console.log(hasSpace("sdf adf"));
console.log(hasSpace1("sdf adf"));
console.log(hasSpace("sdfadf"));

function filter(arr) {
  return arr.filter(hasSpace);
}

const filter = _.curry((reg, str) => {
  return str.match(reg);
});

console.log(filter(["a", "a b", "a c"]));
