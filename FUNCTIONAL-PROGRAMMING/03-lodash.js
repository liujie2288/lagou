const _ = require('lodash');

const arr = ['one', 'two', 'three', 'four'];

console.log(_.first(arr))
console.log(_.last(arr))
console.log(_.toUpper(_.first(arr)))
// console.log(arr.reverse());
console.log(_.each(arr, (item, index, arr) => { 
  console.log(item, index, arr)
}))