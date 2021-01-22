// 函数类型

export {}; // 确保跟其它示例没有冲突

// ======= 函数声明方式定义函数以及函数相关类型 =======

function fun(a: number, b: number): number {
  console.log(a, b);
  return a + b;
}

fun(100, 200);

fun(100, "200"); //报错

// 可选参数，在参数明后添加"?"
function fun1(a: number, b?: number): string {
  console.log(a, b);
  return "fun1";
}

fun1(100);

// 参数默认值类似于可选参数（可传可不传）
function fun2(a: number, b: number = 10): number {
  console.log(a, b);
  return a + b;
}

// 任意参数，使用es6 reset操作符
function fun3(a: number, ...b: number[]): void {
  console.log(a, b);
}

// ======= 函数表达式方式定义函数以及函数相关类型 =======

// typescrit通常能够类型推断 `fun4`的类型为：(a: number, b: number) => string
const fun4 = function (a: number, b: number): string {
  return "fun4";
};

// 但是当我们想要传递一个函数作为回调函数式，我们需要显示指定这个函数类型

function fun5(callback: (param: string) => void) {
  callback("123");
}

fun5(function (param) {
  console.log(param);
});
