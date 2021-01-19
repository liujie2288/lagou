// 数据类型
// @flow

// ==== 原始类型 ====
const a: string = "abc";
const b: boolean = false; //true
const c: number = Infinity; // NaN //3;
const d: null = null;
const e: void = undefined; // 注意 undefinedl类型为 void
const f: symbol = Symbol();

// ==== 数组类型 ====
const arr1: Array<number> = [1, 2, 3];
const arr2: number[] = [2, 3, 4];
// 元组，通常用于一个函数中同时返回多个类型数据
const arr3: [string, number] = ["one", 1];

// ==== 对象类型 ====
const obj1: { foo: string, bar: number } = { foo: "abc", bar: 123 };
// foo 可选属性
const obj2: { foo?: string, bar: number } = { bar: 123 };
// 索引器属性
const obj3: { [key: string]: string } = {};
// obj3.key1 = 123; // 报错
obj3.key2 = "123";

// ==== 函数类型 ====
function foo(callback: (number, string) => void) {
  callback(100, "100");
}

foo(function (n, string) {});

// ==== 特殊类型 ====

// 字面量类型
// const a: "foo" = "abc"; // 报错，值只能是'foo'
const literal: "foo" = "foo";

// 联合类型（或类型），只要数据是其中一种类型就OK
const unite: string | number = 123; //'123' // false 将报错;

// 字面量类型结合联合类型
const type: "success" | "error" | "warning" = "success"; // 只能是这里联合类型枚举的字符串

// type关键字用来声明一个自定义类型
type StringOrNumber = string | number;
const strOrNum: StringOrNumber = 123;

// maybe类型，数据可以是指定的数据类型或者null或者undefined
// const gender: number = undefined; // 报错
const gender: ?number = undefined; // 1  2
