"use strict";
// 作用域问题
Object.defineProperty(exports, "__esModule", { value: true });
// 这里的变量`a`被告知和`02-primitive-types.ts`中的`a`重复定义
// 因为它们都在全局作用域中
var a = Symbol();
// 解决方案2:
// 自执行函数
// (function () {
//   const a: string = "1";
// })();
//# sourceMappingURL=04-module-scope.js.map