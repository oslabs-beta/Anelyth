import fs from 'fs';
import ApiAnalyzer from '../utils/ApiAnalyzer.mjs';
import chalk from 'chalk';

const AstApiQueryController2 = {};

// --------------- CHECK API FUNCTION --------------- //

AstApiQueryController2.queryFunc = async (nodeAST, nodePath) => {
  console.log('\n');
  console.log('Inside AstApiQueryController2.queryFunc')
  console.log(`analyzing file path ${nodePath}`);
  try {
    const apiAnalyzer = new ApiAnalyzer();
    apiAnalyzer.setApiType('native');
    apiAnalyzer.getApiCalls(nodeAST, ['fetch']);
    apiAnalyzer.setApiType('imported');
    apiAnalyzer.getApiCalls(nodeAST, ['axios']);
    const result = apiAnalyzer.getMatches();
    console.log('result from getApiCalls: ', result);
    if (result.length === 0) {
      return ({
        filePath: nodePath,
        totalInteractions: 0,
        details: []
      });
    } else {
      const stream = fs.createWriteStream('./api-query-testing-nodes.log', {flags: 'a'});
      stream.write(JSON.stringify(result, null, 2));
      stream.end();
      return analyze(result, nodePath);
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
  console.log(`\x1b[35mInside Fetch API Extended Analysis`);
  console.log('apiInteractions:', apiInteractions)

  let totalInteractions = 0;
  const details = apiInteractions.map((api) => {
    //add up total api calls in each file
    const numApiInteractions = api.numNodes;
    if (numApiInteractions > 0) {
      totalInteractions += numApiInteractions;
    }
    //get arguments (data endpoints for each api call)
    let nodes = api.nodes;
    const args = [];
    nodes.forEach((node, index) => {
      console.log(`node ${index + 1} arguments: ${node.arguments}`);

      //TODO: need to account for imported apis
      for (let i = 0; i < node.arguments?.length; i++) {
        const arg = node.arguments[i];
        console.log('Argument type: ', arg.type);
        let argValue = '';
        switch (arg.type) {
          case 'Literal':
            console.log('Literal arg value: ', arg.value);
            argValue = arg.value;
            break;
          case 'Identifier': 
            console.log('Identifier arg name: ', arg.name);
            argValue = arg.name;
            break;
          case 'TemplateLiteral':
            console.log('Template Literal Parts:');
            const quasisEls = arg.quasis.map(({ start, value }) => {
              return ({
                start,
                value: value.cooked
              });
            });
            //name is the variable name for the reference
            const expressionEls = arg.expressions.map(({ start, name }) => {
              return ({
                start,
                value: name
              });
            });
            const els = quasisEls.concat(expressionEls).sort((a, b) => a.start - b.start);
            els.forEach(({ value }) => {
              argValue += value;
            });
            break;
          default:
            console.log('Argument is not a Literal, Identifier, or TemplateLiteral and was not handled in ApiQueryController');
            break;
        }
        args.push(argValue);
      }
    });
    return ({
      api: api.apiName,
      numInteractions: api.numNodes,
      endpoints: args
    });
  });
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

export default AstApiQueryController2;