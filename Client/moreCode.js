class Deps2 {
  deps2Member1 = 3;
  deps2Member2 = 4;

  constructor(value) {
    this.value = value;
  }

  add() {
    return this.deps2Member1 + this.deps2Member2;
  }

  getValue() {
    return this.value;
  }
}

export default Deps2;