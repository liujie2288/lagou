// 作用域问题

// 这里的变量`a`被告知和`02-primitive-types.ts`中的`a`重复定义
// 因为它们都在全局作用域中
const a: symbol = Symbol();

// 解决方案1:
// 告诉typescript这是一个模块文件
export {}; // 确保跟其它示例没有冲突

// 解决方案2:
// 自执行函数
// (function () {
//   const a: string = "1";
// })();
