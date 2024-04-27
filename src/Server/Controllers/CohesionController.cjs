const fs = require('fs');
const path = require('path');


const CohesionController = {};


// const arrOne = [
//   {fileName: 'file1', details: [{url: 'endpoint1'}, {url: 'endpoint2'}]}, 
//   {fileName: 'file2', details: [{url: 'endpoint1'}, {url: 'endpoint2'}, {url: 'endpoint3'}]}, 
//   {fileName: 'file5', details: [{url: 'endpoint6'}]},
//   {fileName: 'file3', details: [{url: 'endpoint1'}, {url: 'endpoint4'}]},
//   {fileName: 'file4', details: [{url: 'endpoint3'}]}
// ];

// const arrTwo = [
//   {fileName: 'file1', apiDetails: [{url: 'endpoint1'}, {url: 'endpoint2'}], dbDetails: [{keyword: 'mongoose'}, {keyword: 'model'}], moduleDetails: [{module: './models.js'}]}, 
//   {fileName: 'file2', apiDetails: [{url: 'endpoint1'}, {url: 'endpoint2'}, {url: 'endpoint3'}], dbDetails: [{keyword: 'mongoose'}], moduleDetails: [{module: './controllers/controller1.js'}]}, 
//   {fileName: 'file5', apiDetails: [{url: 'endpoint6'}], dbDetails: [], moduleDetails: [{module: './routes.js'}, {module: './controllers/controllers2.js'}]},
//   {fileName: 'file3', apiDetails: [{url: 'endpoint1'}, {url: 'endpoint4'}], dbDetails: [], moduleDetails: [{module: './module1.js'}, {module: './controllers/controllers2.js'}]},
//   {fileName: 'file4', apiDetails: [{url: 'endpoint3'}], dbDetails: [], moduleDetails: [{module: './module1.js'}]}
// ];

//approach 1: what percentage of unique endpoints do they have in common?
//for each file: total unique endpoints, so if file1 has endpoint1, endpoint1, endpoint2, then there are 2 unique endpoints (endpoint1 & endpoint 2)
//when comparing 2 files: of the total unique endpoints (sum endpoints for both to get total), what percentage do they have in common?
  //example: file1 and file2 have 66% in common, file 2 and file 4 have 33% in common

//approach 2: take the file with the smaller number of unique endpoints. what percentage of that files endpoints does file 2 also have?
  //example: file1 and file2 = 100% because file1 has 2 endpoints vs file2 have 3 endpoints, so of file2's 2 endpoints, file3 has 100% of them

//using approach 2

//input: array of objects from superstructure, threshold
  // [{fileName: 'file1', details: [{url: 'value1'}, {url: 'value2'}]}, {fileName: 'file2', details: [{url: 'value1'}, {url: 'value3'}]}]
//output: array of arrays of objects: grouped by potential microservice based on api cohesion metric


CohesionController.calculateCohesion = (req, res, next) => {
  //declare output array
  const result = [];
  //declare remaining array of elements
  const remaining = JSON.parse(JSON.stringify(res.locals.detailsArray)); 
  //loop
  while (remaining.length > 0) {
    //declare subarray, initialize with 1st element left
    const potentialMicroservice = [remaining.shift()];
    // console.log('outer potentialMicroservice:', potentialMicroservice)
    let j = 0;
    //element to compare
    let element = remaining[j];
    while (element) {
      // console.log('element:', element)
      // console.log('inner potentialMicroservice:', potentialMicroservice)
      //compare elements, if passes, combine. if combined, that becomes an element. if not, continue.
      //pass in threshold here
      if (shouldCombine(potentialMicroservice, element, 0.75)) {
        const deleted = remaining.splice(j, 1);
        potentialMicroservice.push(...deleted);
      } else {
        //if not combined, increment pointer to next element
        j++;
      }
      //compare next element
      element = remaining[j];
      // console.log('remaining:', remaining)
    }
    //once you get to the end of remaining array, you have any potentialMicroservice that remaining[i] would be part of, so push it to result
    result.push(potentialMicroservice);
  }
  console.log('result:', result)
  res.locals.clusters = result
  const logFilePath = path.join('..', '..', 'cohesionController.log');
  const logStream = fs.createWriteStream(logFilePath);
  logStream.write(JSON.stringify(result, null, 2));

  return next();

  function shouldCombine (elementOne, elementTwo, threshold) {
    // console.log('entering shouldCombine');
    const elOneApiEndpoints = new Set();
    const elTwoApiEndpoints = new Set();

    const elOneDbKeywords = new Set();
    const elTwoDbKeywords = new Set();

    const elOneModuleDetails = new Set();
    const elTwoModuleDetails = new Set();
    //iterate over elementOne and elementTwo and push to set to create sets of unique endopints for each
    for (let i = 0; i < elementOne.length; i++) {
      //apiEndpoints
      elementOne[i].apiDetails.forEach(({ url }) => {
        elOneApiEndpoints.add(url);
      });
      //dbDetails
      elementOne[i].dbDetails.forEach(({ keyword }) => {
        elOneDbKeywords.add(keyword);
      });
      //moduleDetails
      elementOne[i].moduleDetails.forEach(({ module }) => {
        elOneModuleDetails.add(module);
      });
    }
    //apiEndpoints
    elementTwo.apiDetails.forEach(({ url }) => {
      elTwoApiEndpoints.add(url);
    });
    //dbDetails
    elementTwo.dbDetails.forEach(({ keyword }) => {
      elTwoDbKeywords.add(keyword);
    });
    //moduleDetails
    elementTwo.moduleDetails.forEach(({ module }) => {
      elTwoModuleDetails.add(module);
    });

    const lengthOne = elOneApiEndpoints.size + elOneDbKeywords.size + elOneModuleDetails.size;
    const lengthTwo = elTwoApiEndpoints.size + elTwoDbKeywords.size + elTwoModuleDetails.size;

    const elOne = {
      api: elOneApiEndpoints,
      db: elOneDbKeywords,
      module: elOneModuleDetails
    };

    const elTwo = {
      api: elTwoApiEndpoints,
      db: elTwoDbKeywords,
      module: elTwoModuleDetails
    };

    const smallerElement = lengthTwo < lengthOne ? elTwo : elOne;
    const largerElement = lengthTwo < lengthOne ? elOne : elTwo;

    const inCommon = [];

    for (let key in smallerElement) {
      smallerElement[key].forEach((val) => {
        if (largerElement[key].has(val)) inCommon.push(val);
      });
    }

    // console.log('inCommon:', inCommon)

    const percentInCommon = inCommon.length / (smallerElement.api.size + smallerElement.db.size + smallerElement.module.size);

    if (percentInCommon >= threshold) return true;
    else return false;
  };
};



module.exports = CohesionController;

