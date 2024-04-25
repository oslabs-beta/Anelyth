import esquery from 'esquery';
import fs from 'fs';

const AstApiQueryController2 = {};

// --------------- CHECK API FUNCTION --------------- //

function checkApiCalls(fileAst, apiLibraries) { 

  // Check for libraries that need explicit import/require
  const importedApiMatches = {};
  const importedApis = ['axios'];
  const libraries = [...apiLibraries];
  let i = 0;
  while (i < importedApis.length && libraries.length > 0) {
    const currApi = importedApis[i].toLowerCase();
    for (let j = 0; j < libraries.length; j++) {
      const currLibrary = libraries[j].toLowerCase();
      if (currLibrary === currApi) {
        const query = getQuery`VariableDeclarator[init.callee.name="require"][init.arguments.0.value="${currApi}"],
          CallExpression[callee.name="require"][arguments.0.value="${currApi}"],
          ImportDeclaration[source.value="${currApi}"]`;
        const result = getNodes(fileAst, query);
        if (result) {
          importedApiMatches[currApi] = result;
        }
        libraries.splice(j, 1);
      }
    }
    i++;
  }

  // Special checks for APIs that don't require import/require in a browser environment
  // const browserAPIs = ['fetch', 'XMLHttpRequest', '$', 'jQuery'];
  const nativeApiMatches = {};
  const nativeApis = ['fetch'];
  let k = 0;
  while (k < nativeApis.length && libraries.length > 0) {
    const currApi = nativeApis[k].toLowerCase();
    for (let j = 0; j < libraries.length; j++) {
      const currLibrary = libraries[j].toLowerCase();
      if (currLibrary === currApi) {
        const query = getQuery`CallExpression[callee.type="MemberExpression"][callee.property.name="${currApi}"], CallExpression[callee.type="Identifier"][callee.name="${currApi}"]`;
        const result = getNodes(fileAst, query);
        if (result) {
          nativeApiMatches[currApi] = result;
        }
        libraries.splice(j, 1);
      }
    }
    k++;
  }

  //return matches or undefined
  const result = {...importedApiMatches, ...nativeApiMatches};
  if (Object.keys(result).length > 0) {
    return result;
  } else {
    return;
  }

  function getQuery(strings, library) {
    let result = ``;
    for (let i = 0; i < strings.length; i++) {
      if (i === strings.length - 1) {
        result += `${strings[i]}`;
      } else {
        result += `${strings[i]}${library}`;
      }
    }
    return result;
  }

  function getNodes(fileAst, query) {
    const nodes = esquery.query(
      fileAst,
      query
    );

    if (!nodes.length) {
      return null;
    }

    return ({
      numNodes: nodes.length,
      nodes
    });
  }

}

AstApiQueryController2.queryFunc = async (nodeAST, nodePath) => {
  console.log('\n');
  console.log('Inside AstApiQueryController2.queryFunc')
  console.log(`analyzing file path ${nodePath}`);
  try {
    const result = checkApiCalls(nodeAST, ['fetch', 'axios']);
    console.log('result from checkApiCalls: ', result);
    if (!result) {
      return;
    } else {
      // console.log('result in AstApiQueryController2.queryFunc before analysis: ', result);
      // console.log('nodes in result: ', result.fetch.nodes);
      // console.log('arguments in node: ', result.fetch.nodes[0].arguments[0].quasis);
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

//input: apiInteractionsNodes (object where each key is an api and the value is an object with numNodes and nodes) and filePath
//output: object with filePath, totalInteractions number, details: array of Objects (each object refers to an api)
//TODO: need to handle template literals. argument value does not include the variable passed in to it. if we just want the url domain, 
//can grab that from the argument value, unless it's passed in; then you'd have to jump through more hoops to determine what the url is
function analyze(apiInteractionsNodes, filePath) {
  console.log(`\x1b[35mInside Fetch API Extended Analysis`);
  console.log('apiInteractionsNodes:', apiInteractionsNodes)

  let totalInteractions = 0;
  let apiArguments = {};
  for (const key in apiInteractionsNodes) {
    //add up total api calls in each file
    const numApiInteractions = apiInteractionsNodes[key].numNodes;
    if (numApiInteractions > 0) {
      totalInteractions += numApiInteractions;
    }
    console.log('Key:', key)
    console.log('Element in object: ', apiInteractionsNodes[key]);
    //get arguments (data endpoints for each api call)
    let nodes = apiInteractionsNodes[key].nodes;
    const args = [];
    nodes.forEach((node, index) => {
      console.log(`node ${index + 1} arguments: ${node.arguments}`);

      for (let i = 0; i < node.arguments.length; i++) {
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

    apiArguments[key] = args;

  }
  const stream = fs.createWriteStream('./api-query-testing.log', { flags: 'a' });

  // const memberExpressionFetchCalls = esquery.query(ast, 'CallExpression[callee.type="MemberExpression"][callee.property.name="fetch"]');
  // const regularFunctionFetchCalls = esquery.query(ast,'CallExpression[callee.type="Identifier"][callee.name="fetch"]');

  // const regularFunctionRequireCalls = esquery.query(ast,'CallExpression[callee.type="Identifier"][callee.name="require"]');
  // const memberExpressionRequireCalls = esquery.query(ast, 'CallExpression[callee.type="MemberExpression"][callee.property.name="require"]');

  const fileDetails = {
    filePath,
    totalInteractions,
    apiArguments
  };

  stream.write(JSON.stringify(fileDetails, null, 2));
  stream.end();

  return fileDetails;

}

export default AstApiQueryController2;