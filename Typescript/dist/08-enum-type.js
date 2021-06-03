"use strict";
// 枚举类型
Object.defineProperty(exports, "__esModule", { value: true });
// 普通枚举
var Gender;
(function (Gender) {
    Gender[Gender["Male"] = 1] = "Male";
    Gender[Gender["Female"] = 2] = "Female";
})(Gender || (Gender = {}));
console.log(Gender.Female);
console.log(0 /* Success */);
var a = "123";
exports.a = a;
//# sourceMappingURL=08-enum-type.js.map