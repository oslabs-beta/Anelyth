import esquery from 'esquery';
import fs from 'fs';

const AstApiQueryController2 = {};

// --------------- CHECK API FUNCTION --------------- //

function checkApiCalls(fileAst, apiLibraries) { 
  const importedApiMatches = {};
  // Check for libraries that need explicit import/require
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

  const nativeApiMatches = {};
  // Special checks for APIs that don't require import/require in a browser environment
  // const browserAPIs = ['fetch', 'XMLHttpRequest', '$', 'jQuery'];
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
    const result = checkApiCalls(nodeAST, ['fetch']);
    console.log('result from checkApiCalls: ', result);
    if (!result) {
      return;
    } else {
      console.log('result in AstApiQueryController2.queryFunc before analysis: ', result);
      console.log('nodes in result: ', result.fetch.nodes);
      console.log('arguments in node: ', result.fetch.nodes[0].arguments[0].quasis);

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

//TODO: need to handle template literals. argument value does not include the variable passed in to it. if we just want the url domain, 
//can grab that from the argument value, unless it's passed in; then you'd have to jump through more hoops to determine what the url is
function analyze(ast, filePath) {
  console.log(`\x1b[35mInside Fetch API Extended Analysis`);

  const memberExpressionFetchCalls = esquery.query(ast, 'CallExpression[callee.type="MemberExpression"][callee.property.name="fetch"]');
  const regularFunctionFetchCalls = esquery.query(ast,'CallExpression[callee.type="Identifier"][callee.name="fetch"]');

  const regularFunctionRequireCalls = esquery.query(ast,'CallExpression[callee.type="Identifier"][callee.name="require"]');
  const memberExpressionRequireCalls = esquery.query(ast, 'CallExpression[callee.type="MemberExpression"][callee.property.name="require"]');

  const allCalls = [...memberExpressionFetchCalls, ...regularFunctionFetchCalls, ...regularFunctionRequireCalls, ...memberExpressionRequireCalls];

  const stream = fs.createWriteStream('./api-query-testing.log')
  
  let interactions = allCalls.map((call, index) => {
    console.log(`call on element ${index + 1}:`, call)
    stream.write(JSON.stringify(call, null, 2));
    
    // if (call.callee.object.arguments){
    if (call.arguments){
      let interactionDetail = {
        // method: 'fetch',
        line: call.loc.start.line,
        url: null, // PLACEHOLDER
        // httpMethod: 'GET' // DEFAULT
      };

      call.arguments.forEach(arg => {
        if (arg.type === 'ObjectExpression') {
          arg.properties.forEach(prop => {
            if (prop.key.name === 'method') {
              interactionDetail.httpMethod = prop.value.value;
            }
          });
        }
      })

      call.arguments.forEach(arg => {
        if (arg.type === 'Literal') {
          interactionDetail.url = arg.value;
        }
      })

      return interactionDetail;
    } else {
      return;
    }

    // console.log('final result', call.callee.object.arguments[1].properties[0].value.value)


    // EXTRACT URL
    // if (call.arguments && call.arguments[0] && call.arguments[0].type === 'Literal') {
    //   interactionDetail.url = call.arguments[0].value;
    // } else {
    //   interactionDetail.url = 'dynamic';
    // }


    // extract url 2
      // console.log('looking here bitchhh: ', call.callee.object.arguments)

      // if (call.callee.object.arguments){
      //   call.callee.object.arguments.forEach(arg => {
      //     if (arg.type === 'Literal') {
      //       interactionDetail.url = arg.value;
      //     }
      //   })
      // }

  });

  stream.end();

    return {
      filePath,
      totalInteractions: interactions.filter(el => el !== undefined).length,
      details: interactions.filter(el => el !== undefined)
    };

}

export default AstApiQueryController2;