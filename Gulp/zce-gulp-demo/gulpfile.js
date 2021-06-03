const { src, dest, parallel, series } = require("gulp");
const sass = require("gulp-sass");
const babel = require("gulp-babel");

const styles = function () {
  // base:默认值为src/assets/styles(Glob base-请查看官方文档说明)，写入文件会自动删除Glob base前缀
  // 为了保留写入文件的目录结构，可以重写base
  return src("src/assets/styles/*.scss", { base: "src" })
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(dest("dist"));
};

const scripts = function () {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(dest("dist"));
};

const build = parallel(styles, scripts);

module.exports = {
  styles,
  scripts,
  build,
};
