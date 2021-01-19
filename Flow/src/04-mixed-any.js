// minxed 与 any
// @flow

// 这里的 value 可以是任意类型
function foo(value: mixed) {
  // 这里不能对参数直接做操作，因为不能明确知道此时value的类型
  value * value; // 报错
  // 通过typeof 运算符来准确判断变量类型，然后做对应类型的运算
  if (typeof value === "number") {
    return value * value;
  }
  if (typeof value === "string") {
    return value.substring(0, 10);
  }
}

// 这里的 value 可以是任意类型
function foo(value: any) {
  // 可以对数据做任何操作，都不会报错
  value * value;
  value.substring(0, 10);
}
