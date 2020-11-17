const fs = require("fs");
const { task } = require("folktale/concurrency/task");
const { split, find } = require("lodash/fp");

function readFile(fileName) {
  return task((resolver) => {
    fs.readFile(fileName, "utf-8", function (error, data) {
      if (error) resolver.reject(error);
      resolver.resolve(data);
    });
  });
}

// 返回一个Task函子
// readFile("../package.json")
//   // 对返回数据函子作按行分割处理
//   .map(split("\n"))
//   // 对上面的函子
//   .map(find((item) => item.includes("version")))
//   .run()
//   .listen({
//     onRejected: (error) => {
//       console.log(error);
//     },
//     onResolved: (value) => {
//       console.log(value);
//     },
//   });
console.log(
  readFile("../package.json")
    // 对返回数据函子作按行分割处理
    .map(split("\n"))
    .map.toString()
);
