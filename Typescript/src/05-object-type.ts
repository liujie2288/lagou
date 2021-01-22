// object 类型 - 非原始类型

export {}; // 确保跟其它示例没有冲突

// 可以存放对象、数组、函数
const a: object = function () {}; // {} // [];
const b: object = 3; // 报错

// 普通对象
const c: { name: string; age: 20 } = { name: "jay", age: 20 };
