"use strict";
// typescript 标准库
// 当`tsconfig.json中targe:es5`时，会报错
// 因为当targe:es5时候，typescript将会导入`lib.es5.d.ts`的内置标准库声明文件
// 里面没有对于`Symbol`、`Promise`对象的类型定义
var sym = Symbol();
new Promise();
Array; // 可通过右键查看变量定义来显示内置标注库声明文件
// 解决方式：
// 1. 修改 `target:es2015`，但是这样编译后的代码不能在不支持es2015的环境中运行
// 2. 需改`lib:['es2015']`，但是这样会覆盖默认声明的文件的导入，所以需要列举完整的列表。lib:["dom", "dom.iterable", "esnext"]`
//# sourceMappingURL=03-typescript-lib.js.map