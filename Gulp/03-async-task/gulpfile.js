// 使用回调标记任务完成
exports.javascript = function (done) {
  // 这里来书写任务构建逻辑
  console.log("js代码编译转换");
  // 如果任务成功，手动调用，标记该任务结束
  done();
  // 如果任务失败，可以传递错误参数
  // done(new Error("编译失败"));
};

// 使用Promise来状态来表示任务状态
exports.scss = function () {
  return new Promise(function (resolve, reject) {
    // 模拟异步耗时任务
    setTimeout(function () {
      resolve("sass构建完成");
    }, 2000);
  });
};

// 使用Promise来状态来表示任务状态
exports.ejs = async function () {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve("ejs构建完成");
    }, 2000);
  });
  console.log("done");
};

// 返回Stream，gulp内部会监听"onend"事件
const fs = require("fs");
const { Transform } = require("stream");
exports.txt = function () {
  const src = fs.createReadStream("./hello.txt");
  const transform = new Transform({
    transform: function (chunk, encoding, callback) {
      const data = chunk.toString().replace("world", "gulp");
      callback(null, data);
    },
  })
  const dest = fs.createWriteStream("./output.txt");

  return src.pipe(transform).pipe(dest);
};

const { src, dest } = require("gulp");
exports.copy = function () {
  return src("./hello.txt").pipe(dest("./hello-copy"));
};
