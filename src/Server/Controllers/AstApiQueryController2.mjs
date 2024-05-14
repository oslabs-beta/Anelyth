import fs from 'fs';
import { ImportedApiAnalyzer, NativeApiAnalyzer } from '../utils/ApiAnalyzer.mjs';
import chalk from 'chalk';

const AstApiQueryController2 = {};

// --------------- CHECK API FUNCTION --------------- //

AstApiQueryController2.queryFunc = async (nodeAST, nodePath) => {
  console.log('\n');
  console.log('Inside AstApiQueryController2.queryFunc')
  console.log(`analyzing file path ${nodePath}`);
  try {
    const stream = fs.createWriteStream('./api-query-testing-nodes.log', {flags: 'a'});
    const nativeApiAnalyzer = new NativeApiAnalyzer(nodeAST);
    nativeApiAnalyzer.getApiCalls(['fetch']);
    nativeApiAnalyzer.setArgs();
    const importedApiAnalyzer = new ImportedApiAnalyzer(nodeAST);
    importedApiAnalyzer.getApiCalls(['axios']);
    importedApiAnalyzer.setImportRefs();
    importedApiAnalyzer.setArgs();
    const importedApiAnalyzerResult = importedApiAnalyzer.getMatches();
    const nativeApiAnalyzerResult = nativeApiAnalyzer.getMatches();
    stream.write(JSON.stringify(nativeApiAnalyzer.args, null, 2));
    stream.write(JSON.stringify(importedApiAnalyzer.refs, null, 2));
    stream.write(JSON.stringify(importedApiAnalyzer.args, null, 2));
    stream.end();
    const result = [...importedApiAnalyzerResult, ...nativeApiAnalyzerResult];
    if (result.length === 0) {
      return ({
        filePath: nodePath,
        totalInteractions: 0,
        details: []
      });
    } else {
      console.log(`\x1b[35mInside Fetch API Extended Analysis`);
      console.log('apiInteractions:', apiInteractions)
    
      let totalInteractions = 0;
      const numApiInteractions = api.numNodes;
      if (numApiInteractions > 0) {
        totalInteractions += numApiInteractions;
      }
      // const details = [{
      //   api: api.apiName,
      //   numInteractions: api.numNodes,
      //   endpoints: args
      // }]
      const stream = fs.createWriteStream('./api-query-testing.log', {flags: 'a'});
    
      const fileDetails = {
        filePath,
        totalInteractions,
        details
      };
    
      stream.write(JSON.stringify(fileDetails, null, 2));
      stream.end();
    
      return fileDetails;
    }
  } catch (err) {
    console.error(chalk.red(`Error in AstApiQueryController2.queryFunc: ${err}`));
    // throw new Error(`'Error in AstApiQueryController2.queryFunc: ${err}`);
    // return ({
    //   log: 'error in AstApiQueryController2.queryFunc',
    //   message: err,
    // });
  }
};

//input: apiInteractions (object where each key is an api and the value is an object with numNodes and nodes) and filePath
//output: object with filePath, totalInteractions number, details: array of Objects (each object refers to an api)
//TODO: we may want to grab just the url domain. this works fine for strings, but we need to handle cases for template literals where the url value is stored in a variable
function analyze(apiInteractions, filePath) {


}

export default AstApiQueryController2;