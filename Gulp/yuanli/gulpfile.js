const fs = require("fs");
const { Transform } = require("stream");

exports.default = function (done) {
  // 创建一个读取流
  const read = fs.createReadStream("./index.css");
  // 创建一个写入流
  const write = fs.createWriteStream("./index.min.css");
  // 创建一个转换流
  const transform = new Transform({
    transform(chunk, encoding, callback) {
      const input = chunk.toString();
      // 替换空格和注释
      const output = input.replace(/\s+/g, "").replace(/\/\*.+?\*\//g, "");
      callback(null, output);
    },
  });
  // 把读取出来的文件流先转换再写入
  return read
    .pipe(transform) // 转化
    .pipe(write); // 写入
};
