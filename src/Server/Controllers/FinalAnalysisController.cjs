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
  const logFilePath = path.join(__dirname, '..', '..', 'final-test.log.log');
  const stream = fs.createWriteStream(logFilePath);
  stream.write(JSON.stringify(res.locals.clusters, null, 2));
  stream.end();
  stream.on('finish', () => {
    console.log('\x1b[36m%s\x1b[0m', 'SemanticController.log has finished writing!...');
    return next(); // Only call next() once writing has completed
  });
}

module.exports = FinalAnalysisController;

