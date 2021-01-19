// 类型注解
// @flow

// 标记函数参数类型
function square(n: number) {
  return n * n;
}

// 标记变量类型
let num: number = 100;

// 赋值字符串，flow将提示错误
// num = "200";

// 标记函数返回值类型
function foo(): number {
  // return "100"; // 将会报错
  return 100;
}
