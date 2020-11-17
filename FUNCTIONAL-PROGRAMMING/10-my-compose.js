function flow(...fns) {
  return (isRight = true) => {
    return (...args) => {
      fns = isRight ? fns.reverse() : fns;
      return fns.slice(1).reduce((prev, item) => {
        return item(prev);
      }, fns[0](...args));
    };
  };
}

// 箭头函数简写
const flow1 = (...fn) => (isRight = true) => (...args) => {
  fn = isRight ? fn.reverse() : fn;
  let first = fn.splice(0, 1)[0];
  return fn.reduce((prev, item) => {
    return item(prev);
  }, first(...args));
};

const first = (arr) => arr[0];
const reverse = (arr) => arr.reverse();
const toUpper = (str) => str.toUpperCase();

// const fn = flow(toUpper, first, reverse);
const fn = flow(reverse, first, toUpper)(false);
const fnRight = flow(toUpper, first, reverse)();
const fn1 = flow1(reverse, first, toUpper)(false);
console.log(fn(["one", "two", "three"]));
console.log(fnRight(["one", "two", "three"]));
console.log(fn1(["one", "two", "three"]));
