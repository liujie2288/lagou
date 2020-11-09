function flow(...fn) {
  return (isRight = true) => {
    return (...args) => {
      fn = isRight ? fn.reverse() : fn;
      let first = fn.splice(0, 1)[0];
      return fn.reduce((prev, item) => {
        return item(prev);
      }, first(...args));
    };
  };
}

// 尖头函数简写
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
