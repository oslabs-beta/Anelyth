const Deps2 = require('./moreCode');

// import Deps2 from './moreCode';

function a(argA) {
  return argA;
}

function b(argB) {
  return a(argB) + argB;
}

class Deps1 {
  // deps1Member1 = 'var1';
  // deps1Member2 = 'var2';

  constructor(value) {
    this.value = value;
  }

  concat() {
    return this.deps1Member1 + this.deps1Member2;
  }

  getValue() {
    return this.value;
  }
}

console.log('result: ', b(100)) //200

const deps2 = new Deps2(1234);
deps2.getValue();

const deps1 = new Deps1('newVal')
const result = deps1.concat();
console.log('result:', result)