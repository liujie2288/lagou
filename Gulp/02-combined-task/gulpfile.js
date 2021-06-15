const { series, parallel } = require("gulp");

function javascript(done) {
    // 这里来书写任务构建逻辑
    console.log("js代码编译转换");
    // 如果任务成功，手动调用，标记该任务结束
    done();
    // 如果任务失败，可以传递错误参数
    // done(new Error("编译失败"));
};

function scss() {
    return new Promise(function (resolve, reject) {
        // 模拟异步耗时任务
        setTimeout(function () {
            resolve("sass构建完成");
        }, 2000);
    });
};

function minify(done) {
    console.log("这里是压缩任务");
    done();
}

// 并行运行 javascript, scss任务
const complie = parallel(javascript, scss);
// 等待 complie 完成后，才运行 minify 任务
const build = series(complie, minify);

exports.complie = complie;
exports.build = build;
