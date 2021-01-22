// 原始数据类型

const a: string = "str";
const b: boolean = false;
const c: number = 100; //NaN //Infinity

// 当关闭 tsconfig.json 中严格模式（`strict:true`）的配置，
// undefined和null也可以赋值给其它所有类型
// const d: number = null;

const e: void = undefined;
const f: null = null;
const g: undefined = undefined;
//
const h: symbol = Symbol();
