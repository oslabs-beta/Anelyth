const fs = require('fs');
const path = require('path');

const SemanticController = {};

SemanticController.analyzeSemantics = (req, res, next) => {
  const result = [];
  let remaining = JSON.parse(JSON.stringify(res.locals.clusters)); 
  //sort microservices array, so microservices with the most elements come first
  remaining = remaining.sort((subArrayA, subArrayB) => {
    return subArrayB.length - subArrayA.length
  });
  while (remaining.length > 0) {
    //microservice is an array of objects
    let microservice = remaining.shift();

    let j = 0;
    //microserviceToPotentiallyAdd is an array of objects
    let microserviceToPotentiallyAdd = remaining[j];
    while (microserviceToPotentiallyAdd) {
      //TODO: allow user to pass in thresholds from UI rather than hardcode it
      if (shouldCombine(microservice, microserviceToPotentiallyAdd, 2, 4)) {
        const deleted = remaining.splice(j, 1);
        microservice = microservice.concat(...deleted);
      } else {
        //if not combined, increment pointer to next element
        j++;
      }
      //compare next element
      microserviceToPotentiallyAdd = remaining[j];
    }
    //once you get to the end of remaining array, you have any potentialMicroservice that remaining[i] would be part of, so push it to result
    result.push(microservice);
  }
  //overwriting clusters created in CohesionController. may want to create separate properties on res.locals later
  res.locals.clusters = result;
  const logFilePath = path.join(__dirname, '..', '..', 'SemanticController.log');
  const logStream = fs.createWriteStream(logFilePath);
  logStream.write(JSON.stringify(result, null, 2));
  logStream.end();
  logStream.on('finish', () => {
    console.log('\x1b[36m%s\x1b[0m', 'SemanticController.log has finished writing!...');
    return next(); // Only call next() once writing has completed
  });
}

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

  //remove null values
  if (elOneNames.has(null)) {
    elOneNames.delete(null);
  }
  if (elTwoNames.has(null)) {
    elTwoNames.delete(null);
  }

  let commonNamesCount = 0;

  elTwoNames.forEach(elTwoName => {
    elOneNames.forEach(elOneName => {
      if (hasCommonSubstring(subStringThreshold, elOneName, elTwoName)) {
        commonNamesCount += 1;
      }
    });
  });

  if (commonNamesCount >= commonNameThreshold) return true;
  else return false;
}

// const string1 = 'abcTestingWord2.js';
// const string2 = 'bdcTestjkWord.js';

// const string1 = 'zdzpterWord';
// const string2 = 'ddaptSenteWordnce';

function hasCommonSubstring(subStringThreshold, firstString, secondString) {
  firstString = firstString.toLowerCase();
  secondString = secondString.toLowerCase();

  let i = 0;
  let j = 0;
  while (i < firstString.length) {
    while (j < secondString.length) {
      const firstEl = firstString[i];
      const secondEl = secondString[j];

      // console.log('\n');
      // console.log('firstEl:', firstEl)
      // console.log('secondEl:', secondEl)

      if (firstEl === secondEl) {
        if (checkForMatch(i, j, firstString, secondString, subStringThreshold)) {
          return true;
        } 
      } 
      j++;
    }
    i++;
    j = 0;
  }
  return false;
}

function checkForMatch(i, j, firstString, secondString, threshold) {
  let count = 0;
  while (i < firstString.length && j < secondString.length) {
    const elOne = firstString[i];
    const elTwo = secondString[j];

    if (elOne === elTwo) {
      i++;
      j++;
      count += 1;
      if (count >= threshold) {
        return true;
      }
    } else {
      return false;
    }
  }
  return false;
}
// console.log(hasCommonSubstring(4, string1, string2));

module.exports = SemanticController;