const fs = require('fs');
const path = require('path');

const CohesionController = {};

CohesionController.analyzeCohesion = (req, res, next) => {
  const result = [];
  const remaining = JSON.parse(JSON.stringify(res.locals.detailsArray)); 
  while (remaining.length > 0) {
    //initialize subarray with 1st element left
    const potentialMicroservice = [remaining.shift()];
    // console.log('outer potentialMicroservice:', potentialMicroservice)
    let j = 0;
    //element to compare
    let element = remaining[j];
    while (element) {
      //compare elements, if passes, combine. if combined, that becomes an element. if not, continue.
      //TODO: allow user to pass in threshold from UI rather than hardcode it
      if (shouldCombine(potentialMicroservice, element, 0.1)) {
        const deleted = remaining.splice(j, 1);
        potentialMicroservice.push(...deleted);
      } else {
        //if not combined, increment pointer to next element
        j++;
      }
      //compare next element
      element = remaining[j];
    }
    //once you get to the end of remaining array, you have any potentialMicroservice that remaining[i] would be part of, so push it to result
    result.push(potentialMicroservice);
  }
  res.locals.clusters = result;
  const logFilePath = path.join(__dirname, '..', '..', 'cohesionController.log');
  const logStream = fs.createWriteStream(logFilePath);
  logStream.write(JSON.stringify(result, null, 2));
  logStream.end();
  logStream.on('finish', () => {
    console.log('\x1b[36m%s\x1b[0m', 'cohesionController.log has finished writing!...');
    return next(); // Only call next() once writing has completed
  });

  function shouldCombine (elementOne, elementTwo, threshold) {
    // console.log('\x1b[36m%s\x1b[0m', 'entering shouldCombine');

    const elOneApiEndpoints = { total: 0 };
    const elTwoApiEndpoints = { total: 0 };

    const elOneDbModels = { total: 0 };
    const elTwoDbModels = { total: 0 };

    const elOneModuleDetails = { total: 0 };
    const elTwoModuleDetails = { total: 0 };

    //iterate over elementOne, which is an array of objects and push to array to create endpoints
    for (let i = 0; i < elementOne.length; i++) {
      //push to set to create sets of unique endopints for each
      //apiEndpoints
      elementOne[i].apiDetails.forEach(({ endpoints }) => {
        endpoints.forEach((endpoint) => {
          if (elOneApiEndpoints[endpoint]) {
            elOneApiEndpoints[endpoint] += 1;
          } else {
            elOneApiEndpoints[endpoint] = 1;
          }
          elOneApiEndpoints.total += 1;
        });
      });
      //dbDetails
      elementOne[i].dbDetails.forEach(({ details }) => {
        details.forEach((model) => {
          if (elOneDbModels[model]) {
            elOneDbModels[model] += 1;
          } else {
            elOneDbModels[model] = 1;
          }
          elOneDbModels.total += 1;
        })
      });
      //moduleDetails
      elementOne[i].moduleDetails.forEach(({ module }) => {
        if (elOneModuleDetails[module]) {
          elOneModuleDetails[module] += 1;
        } else {
          elOneModuleDetails[module] = 1;
        }
        elOneModuleDetails.total += 1;
      });
    }

    //iterate over elementTwo, which is an object and push to array to create endpoints
    //apiEndpoints
    elementTwo.apiDetails.forEach(({ endpoints }) => {
      endpoints.forEach((endpoint) => {
        if (elTwoApiEndpoints[endpoint]) {
          elTwoApiEndpoints[endpoint] += 1;
        } else {
          elTwoApiEndpoints[endpoint] = 1;
        }  
        elTwoApiEndpoints.total += 1;   
      });
    });

    //dbDetails
    elementTwo.dbDetails.forEach(({ details }) => {
      details.forEach((model) => {
        if (elTwoDbModels[model]) {
          elTwoDbModels[model] += 1;
        } else {
          elTwoDbModels[model] = 1;
        }   
        elTwoDbModels.total += 1;     
      });
    });
    //moduleDetails
    elementTwo.moduleDetails.forEach(({ module }) => {
      if (elTwoModuleDetails[module]) {
        elTwoModuleDetails[module] += 1;
      } else {
        elTwoModuleDetails[module] = 1;
      }   
      elTwoModuleDetails.total += 1;
    });

    const totalOne = elOneApiEndpoints.total + elOneDbModels.total + elOneModuleDetails.total;
    const totalTwo = elTwoApiEndpoints.total + elTwoDbModels.total + elTwoModuleDetails.total;

    const totalEndpoints = totalOne + totalTwo;

    const elOneApiEndpointsSet = new Set(Object.keys(elOneApiEndpoints));
    elOneApiEndpointsSet.delete('total');
    const elOneDbModelsSet = new Set(Object.keys(elOneDbModels));
    elOneDbModelsSet.delete('total');
    const elOneModuleDetailsSet = new Set(Object.keys(elOneModuleDetails));
    elOneModuleDetailsSet.delete('total');
    
    let inCommon = 0;

    elOneApiEndpointsSet.forEach(endpoint => {
      if (elTwoApiEndpoints[endpoint]) {
        inCommon += elOneApiEndpoints[endpoint];
        inCommon += elTwoApiEndpoints[endpoint];
      }
    });
    elOneDbModelsSet.forEach(model => {
      if (elTwoDbModels[model]) {
        inCommon += elOneDbModels[model];
        inCommon += elTwoDbModels[model];
      }
    });
    elOneModuleDetailsSet.forEach(module => {
      if (elTwoModuleDetails[module]) {
        inCommon += elOneModuleDetails[module];
        inCommon += elTwoModuleDetails[module];
      }
    });
   
    const percentInCommon = totalEndpoints === 0 ? 0 : inCommon / totalEndpoints;
    // console.log('inCommon:', inCommon)
    // console.log('percentInCommon:', percentInCommon)

    if (percentInCommon >= threshold) return true;
    else return false;
  };
};

module.exports = CohesionController;