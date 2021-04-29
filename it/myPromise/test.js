const C = require('./myPromiseClass');
const F = require('./myPromiseFunction');

const func = async () => {
  return 'async function';
};
//example1
const c = new C((resolve, reject) => {
  setTimeout(async () => {
    resolve(await func());
  }, 1000);
});
c.then((value) => {
  console.log(value);
  return 456;
}).then(console.log);

//example2
const f = new F((resolve, reject) => {
  setTimeout(async () => {
    resolve(await func());
  }, 1000);
});
f.then((value) => {
  console.log(value);
  return 456;
}).then(console.log);

// both of them output:
// async function
// 456
