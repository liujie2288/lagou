// 模拟实现常用的高阶函数

// forEach实现
function myForEach(arr, cb) {
  for (let i = 0; i < arr.length; i++) {
    cb(arr[i], i, arr);
  }
}
console.log("-----------------");

myForEach([1, 2, 3], (item) => {
  console.log(item);
});

// filter实现
function myFilter(arr, cb) {
  let results = [];
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    if (cb(item, i, arr)) {
      results.push(item);
    }
  }
  return results;
}
console.log("-----------------");

console.log(
  myFilter([1, 2, 3], (item) => {
    return item < 3;
  })
);

// map实现
function myMap(arr, cb) {
  let results = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const result = cb(item, i, arr);
    results.push(result);
  }
  return results;
}
console.log("-----------------");

console.log(
  myMap([1, 2, 3], (item) => {
    return item * 2;
  })
);

// every实现
function myEvery(arr, cb) {
  let isSuccess = true;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (!cb(item, i, arr)) {
      isSuccess = false;
      break;
    }
  }
  return isSuccess;
}
console.log("-----------------");

console.log(
  "result: " +
    myEvery([1, undefined, 3], (item) => {
      console.log("item: " + item);
      return item;
    })
);

// every实现
function mySome(arr, cb) {
  let isSuccess = false;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (cb(item, i, arr)) {
      isSuccess = true;
      break;
    }
  }
  return isSuccess;
}

console.log("-----------------");

console.log(
  "result: " +
    mySome([1, 2, 3], (item) => {
      console.log("item: " + item);
      return item > 2;
    })
);
