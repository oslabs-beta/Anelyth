// Class declarations
class Animal {
  constructor(name, sound,fuck) {
    this.name = name;
    this.sound = sound;
    this.test = 'yupp'
    this.test2 = 'noting'
  }

  makeSound() {
    console.log(this.sound);
  }

  // makeMove(){
  //   console.log('Move');
  // }
}

// class Dog extends Animal {
//   constructor(name) {
//     super(name, 'Woof');
//   }
// }

// class Cat extends Animal {
//   constructor(name) {
//     super(name, 'Meow');
//   }

//   purr() {
//     console.log('Purrr');
//   }

//   bite() {
//     console.log('Bite');
//   }
// }

// // Instantiate classes
// const dog = new Dog('Buddy');
// const cat = new Cat('Whiskers');

// // Logging results
// console.log('Dog:', dog);
// console.log('Cat:', cat);
