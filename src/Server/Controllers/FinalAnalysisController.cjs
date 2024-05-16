const fs = require('fs');
const path = require('path');


const FinalAnalysisController = {};

FinalAnalysisController.analyze = (req, res, next) => {
  const result = [];
  let newMicroService = [];

  res.locals.clusters.forEach(microservice => {
    if (microservice.length > 1) {
      result.push(microservice);
    } else if (microservice.length === 1) {
      newMicroService.push(...microservice);
    }
  });
  result.push(newMicroService);
  res.locals.clusters = result;
  return next();
}

module.exports = FinalAnalysisController;

