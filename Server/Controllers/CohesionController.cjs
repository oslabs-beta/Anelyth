
const CohesionController = {};


const arr = [
  {fileName: 'file1', details: [{url: 'endpoint1'}, {url: 'endpoint2'}]}, 
  {fileName: 'file2', details: [{url: 'endpoint1'}, {url: 'endpoint2'}, {url: 'endpoint3'}]}, 
  {fileName: 'file5', details: [{url: 'endpoint6'}]},
  {fileName: 'file3', details: [{url: 'endpoint1'}, {url: 'endpoint4'}]},
  {fileName: 'file4', details: [{url: 'endpoint3'}]}
];

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
CohesionController.calculateApiCohesion = (arr) => {
  //declare output array
  const result = [];
  //declare remaining array of elements
  const remaining = JSON.parse(JSON.stringify(arr)); 
  //loop
  while (remaining.length > 0) {
    //declare subarray, initialize with 1st element left
    const potentialMicroservice = [remaining.shift()];
    console.log('outer potentialMicroservice:', potentialMicroservice)
    let j = 0;
    //element to compare
    let element = remaining[j];
    while (element) {
      console.log('element:', element)
      console.log('inner potentialMicroservice:', potentialMicroservice)
      //compare elements, if passes, combine. if combined, that becomes an element. if not, continue.
      //pass in threshold here
      if (shouldCombine(potentialMicroservice, element, 0.5)) {
        const deleted = remaining.splice(j, 1);
        potentialMicroservice.push(...deleted);
      } else {
        //if not combined, increment pointer to next element
        j++;
      }
      //compare next element
      element = remaining[j];
      console.log('remaining:', remaining)
    }
    //once you get to the end of remaining array, you have any potentialMicroservice that remaining[i] would be part of, so push it to result
    result.push(potentialMicroservice);
  }

  return result;

  function shouldCombine (elementOne, elementTwo, threshold) {
    console.log('entering shouldCombine');
    //create two sets with unique endpoints
    const elementOneEndpoints = new Set();
    const elementTwoEndpoints = new Set();
    //iterate over elementOne and elementTwo and push to set to create sets of unique endopints for each
    for (let i = 0; i < elementOne.length; i++) {
      const currFileDetails = elementOne[i].details;
      currFileDetails.forEach(({ url }) => {
        elementOneEndpoints.add(url);
      });
    }
    elementTwo.details.forEach(({ url }) => {
      elementTwoEndpoints.add(url);
    });

    console.log('elementOneEndpoints:', elementOneEndpoints)
    console.log('elementTwoEndpoints:', elementTwoEndpoints)

    const lengthOne = elementOneEndpoints.size;
    const lengthTwo = elementTwoEndpoints.size;

    const smallerElement = lengthTwo < lengthOne ? elementTwoEndpoints : elementOneEndpoints;
    const largerElement = lengthTwo < lengthOne ? elementOneEndpoints : elementTwoEndpoints;

    const inCommon = [];

    smallerElement.forEach((val) => {
      console.log('val:', val)
      if (largerElement.has(val)) inCommon.push(val);
    });

    console.log('inCommon:', inCommon)

    const percentInCommon = inCommon.length / smallerElement.size;

    if (percentInCommon >= threshold) return true;
    else return false;
  };
};

const result = CohesionController.calculateApiCohesion(arr);
console.log('result:', result)

// module.exports = CohesionController;

