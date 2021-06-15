exports.javascript = function (done) {
  // 这里来书写任务构建逻辑
  console.log("js代码编译转换");
  // 如果任务成功，手动调用，标记该任务结束
  done();
  // 如果任务失败，可以传递错误参数
  // done(new Error("编译失败"));
};

exports.scss = function () {
  return new Promise(function (resolve, reject) {
    // 模拟异步耗时任务
    setTimeout(function () {
      resolve("sass构建完成");
    }, 2000);
  });
};

exports.ejs = async function () {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve("ejs构建完成");
    }, 2000);
  });
  console.log("done");
};

const fs = require("fs");
const { Transform } = require("stream");
exports.txt = function () {
  return fs
    .createReadStream("./hello.txt")
    .pipe(
      new Transform({
        transform: function (chunk, encoding, callback) {
          const data = chunk.toString().replace("world", "gulp");
          callback(null, data);
        },
      })
    )
    .pipe(fs.createWriteStream("./output.txt"));
};

const { src, dest } = require("gulp");
exports.copy = function () {
  return src("./hello.txt").pipe(dest("./hello-copy"));
};
