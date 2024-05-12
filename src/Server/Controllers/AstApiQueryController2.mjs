import fs from 'fs';
import ApiAnalyzer from '../utils/ApiAnalyzer.mjs';

const AstApiQueryController2 = {};

// --------------- CHECK API FUNCTION --------------- //

AstApiQueryController2.queryFunc = async (nodeAST, nodePath) => {
  console.log('\n');
  console.log('Inside AstApiQueryController2.queryFunc')
  console.log(`analyzing file path ${nodePath}`);
  const apiAnalyzer = new ApiAnalyzer();
  try {
    apiAnalyzer.setApiType('native');
    const nativeMatches = apiAnalyzer.getApiCalls(nodeAST, ['fetch']);
    apiAnalyzer.setApiType('imported');
    const importedMatches = apiAnalyzer.getApiCalls(nodeAST, ['axios']);
    const result = [...nativeMatches, ...importedMatches];
    console.log('result from getApiCalls: ', result);
    if (result.length === 0) {
      return ({
        filePath: nodePath,
        totalInteractions: 0,
        details: []
      });
    } else {
      const stream = fs.createWriteStream('./api-query-testing-nodes.log');
      stream.write(JSON.stringify(result, null, 2));
      stream.end();
      return analyze(result, nodePath);
    }

  } catch (err) {
    console.error('Error in AstApiQueryController2.queryFunc:', err);
    throw new Error(`'Error in AstApiQueryController2.queryFunc: ${err}`);
    // return ({
    //   log: 'error in AstApiQueryController2.queryFunc',
    //   message: err,
    // });
  }
};

//input: apiInteractions (object where each key is an api and the value is an object with numNodes and nodes) and filePath
//output: object with filePath, totalInteractions number, details: array of Objects (each object refers to an api)
//TODO: need to handle template literals. argument value does not include the variable passed in to it. if we just want the url domain, 
//can grab that from the argument value, unless it's passed in; then you'd have to jump through more hoops to determine what the url is
function analyze(apiInteractions, filePath) {
  console.log(`\x1b[35mInside Fetch API Extended Analysis`);
  console.log('apiInteractions:', apiInteractions)

  let totalInteractions = 0;
  // // let apiArguments = {};
  // for (const api of apiInteractions) {
  const details = apiInteractions.map((api) => {
    //add up total api calls in each file
    const numApiInteractions = api.numNodes;
    if (numApiInteractions > 0) {
      totalInteractions += numApiInteractions;
    }
    console.log('Api:', api.apiName)
    console.log('Element in object: ', api);
    //get arguments (data endpoints for each api call)
    let nodes = api.nodes;
    const args = [];
    nodes.forEach((node, index) => {
      console.log(`node ${index + 1} arguments: ${node.arguments}`);

      //TODO: need to account for imported apis, where there is not arguments property directly on the node. need to grab the call expression then grab the arguments
      for (let i = 0; i < node.arguments?.length; i++) {
        const arg = node.arguments[i];
        console.log('Argument type: ', arg.type);
        let argValue;
        switch (arg.type) {
          case 'Literal':
            console.log('Literal arg value: ', arg.value);
            argValue = arg.value;
            break;
          case 'Identifier': 
            console.log('Identifier arg name: ', arg.name);
            argValue = arg.name;
            break;
          //TODO: handle all parts of template literal. just returning the first section of the string, ignoring the rest. Console logs can guide you.
          case 'TemplateLiteral':
            console.log('Template Literal Parts:');
            arg.quasis.forEach((part, index) => console.log(`Text part ${index + 1} value:`, part.value.cooked));
            arg.expressions.forEach((expr, index) => {
                console.log(`Expression ${index + 1} type: ${expr.type}`);
                console.log(`Expression ${index + 1} name: ${expr.name}`);
            });
            argValue = arg.quasis[0].value.cooked;
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
  const stream = fs.createWriteStream('./api-query-testing.log');

  // const memberExpressionFetchCalls = esquery.query(ast, 'CallExpression[callee.type="MemberExpression"][callee.property.name="fetch"]');
  // const regularFunctionFetchCalls = esquery.query(ast,'CallExpression[callee.type="Identifier"][callee.name="fetch"]');

  // const regularFunctionRequireCalls = esquery.query(ast,'CallExpression[callee.type="Identifier"][callee.name="require"]');
  // const memberExpressionRequireCalls = esquery.query(ast, 'CallExpression[callee.type="MemberExpression"][callee.property.name="require"]');

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