// Class declarations
class Animal {
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }

  makeSound() {
    console.log(this.sound);
  }
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
