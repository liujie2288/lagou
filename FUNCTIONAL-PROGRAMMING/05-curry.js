const checkAge = function(min){
  return (age)=>{
    return age > min;
  }
}
// 箭头函数简写形式
const checkAge1 = min => age => age > min;

const checkAge18 = checkAge(18);
const checkAge22 = checkAge(22);
const checkAge24 = checkAge1(17);
console.log(checkAge18(22))
console.log(checkAge22(22))
console.log(checkAge24(22))