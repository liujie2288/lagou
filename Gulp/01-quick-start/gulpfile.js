// 该文件运行在nodejs中，可以使用commonjs规范以及Node内置模块

// 通过导出一个函数，定义一个任务
exports.hello = function(done){
  console.log("这是一个gulp的任务方法，可以使用gulp hello调用");
 // gulp任务都是异步任务，当任务执行完后，需要调用gulp传入的done方法，通知gulp该任务完成
  done();
}

// 导出一个默认方法，调用时可以不执行任务名称
exports.default = function(done){
   console.log("这是一个gulp的默认任务");
   done();
}

// 旧版本注册任务的方法（不推荐）
const gulp = require("gulp");

gulp.task("bar",function(done){
  console.log("这是以前版本注册任务的方式，现在不推荐使用，只是为了了解");
  done();
})