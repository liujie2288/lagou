// 枚举类型

export {}; // 确保跟其它示例没有冲突

// 普通枚举
enum Gender {
  Male = 1,
  Female,
}

console.log(Gender.Female);

// 常量枚举
const enum Status {
  Success = 0,
  Fail,
  Loading,
}

console.log(Status.Success);

const a = "123";

export { a };
