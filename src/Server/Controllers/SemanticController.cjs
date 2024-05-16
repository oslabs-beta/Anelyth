const fs = require('fs');
const path = require('path');

const SemanticController = {};

// const string1 = 'abcTestingWord2.js';
// const string2 = 'bdcTestjkWord.js';

const string1 = 'adapterWord';
const string2 = 'adaptSenteWordnce';


SemanticController.analyzeSemantics = (req, res, next) => {
  const result = [];
  let remaining = JSON.parse(JSON.stringify(res.locals.clusters)); 
  //sort microservices array, so microservices with the most elements come first
  remaining = remaining.sort((subArrayA, subArrayB) => {
    return subArrayB.length - subArrayA.length
  });

  console.log('remaining: ', remaining);
  // while (remaining.length > 0) {
  //   //initialize subarray with 1st element left
    
  //   const potentialMicroservice = [remaining.shift()];
  //   // console.log('outer potentialMicroservice:', potentialMicroservice)
  //   let j = 0;
  //   let element = remaining[j];
  //   while (element) {
  //     if (shouldCombine(potentialMicroservice, element, 2)) {
  //       const deleted = remaining.splice(j, 1);
  //       potentialMicroservice.push(...deleted);
  //     } else {
  //       //if not combined, increment pointer to next element
  //       j++;
  //     }
  //     //compare next element
  //     element = remaining[j];
  //     // console.log('remaining:', remaining)
  //   }
  //   //once you get to the end of remaining array, you have any potentialMicroservice that remaining[i] would be part of, so push it to result
  //   result.push(potentialMicroservice);
  // }
  // res.locals.clusters = result;
  const logFilePath = path.join(__dirname, '..', '..', 'SemanticController.log');
  const logStream = fs.createWriteStream(logFilePath);
  logStream.write(JSON.stringify(remaining, null, 2));
  logStream.end();
  logStream.on('finish', () => {
    console.log('\x1b[36m%s\x1b[0m', 'SemanticController.log has finished writing!...');
    return next(); // Only call next() once writing has completed
  });
}

/*
  4. Should combine function should determine if greater than [threshold] of the unique names are in both element one and element two
    a. For each name in element two set (smaller element), iterate over element one set and compare each to see if it is a common string/substring (greater than [num letters - 4 or 5]).
      If so, add 1 to tally of common elements. 
    b. If common elements tally exceeds [threshold], combine element two into element one microservice
*/

//elementOne and elementTwo will be arrays
function shouldCombine(elementOne, elementTwo, commonNameThreshold, subStringThreshold) {
  const elOneNames = new Set();
  const elTwoNames = new Set();

  elementOne.forEach(({ funcDecNames, varDecNames }) => {
    funcDecNames.forEach(name => {
      elOneNames.add(name);
    });
    varDecNames.forEach(name => {
      elOneNames.add(name);
    });
  });

  elementTwo.forEach(({ funcDecNames, varDecNames }) => {
    funcDecNames.forEach(name => {
      elTwoNames.add(name);
    });
    varDecNames.forEach(name => {
      elTwoNames.add(name);
    });
  });

  let commonNamesCount = 0;

  elTwoNames.forEach(elOneName => {
    elOneNames.forEach(elTwoName => {
      if (hasCommonSubstring(subStringThreshold, elOneName, elTwoName)) {
        commonNamesCount += 1;
      }
      if (commonNames >= commonNameThreshold) return true;
    });
  });

  return false;
}

// sliding window

function hasCommonSubstring(minLength, firstString, secondString) {
  firstString = firstString.toLowerCase();
  secondString = secondString.toLowerCase();

  let subString = '';

  let i = 0;
  let j = 0;
  let k = 0;
  while (i < firstString.length) {
    while (j < secondString.length) {
      const firstEl = firstString[i];
      const secondEl = secondString[j];

      console.log('\n');
      console.log('subString: ', subString);
      console.log('firstEl:', firstEl)
      console.log('secondEl:', secondEl)
      console.log('k: ', k);
      console.log('el at k: ', firstString[k]);

      if (firstEl === secondEl) {
        console.log('inside match block');
        subString += firstEl;
        i++;
      } else {
        console.log('inside did NOT match block');
        subString = '';
      }

      if (subString.length >= minLength) {
        console.log('subString: ', subString);
        console.log('reached minLenght, resetting subString');
        subStrings.push(subString);
        subString = '';
        k = i;
      }
      j++;
    }
    j = 0;
    i = k;
  }
  return;
}

function getSubstring(firstString, secondString) {

}

module.exports = SemanticController;