import esquery from 'esquery';




// --------------- !!!! ---- NEEDS TO BE OPTIMIZED AND TESTED - CURRENTLY STABLE ---- !!!! --------------- //





const ASTApiQueryController = {};



// --------------- CHECK API FUNCTION --------------- //

function checkApiCalls(fileAst, apiLibraries) { 

  // Check for libraries that need explicit import/require
  const importRequired = apiLibraries.some(library => {
    if (['node-fetch', 'axios', 'superagent', 'got'].includes(library)) {
      const queryResult = esquery.query(
        fileAst,
        `VariableDeclarator[init.callee.name="require"][init.arguments.0.value="${library}"],
         CallExpression[callee.name="require"][arguments.0.value="${library}"],
         ImportDeclaration[source.value="${library}"]`
      );
      return queryResult.length > 0;
    }
    return false;
  });

  if (importRequired) return true;

  // console.log(fileAst)
  // Special checks for APIs that don't require import/require in a browser environment
  const browserAPIs = ['fetch', 'XMLHttpRequest', '$', 'jQuery'];
  const browserApiCheck = apiLibraries.some(library => {
    if (browserAPIs.includes(library)) {
      // v1 - 
      const queryResult = esquery.query(
        fileAst,
        `CallExpression[callee.name="${library}"],
         NewExpression[callee.name="${library}"]`
      );
      // console.log('whats this look like?',queryResult)

        // console.log('what do i have:',queryResult)

      return queryResult.length > 0;
    }
    return false;
  });

  return browserApiCheck;
}

// ----------- API HANDLER OBJECT ----------- //

//NOTE: THIS IS THE MIDDLEWARE BEING INVOKED IN SERVER.JS. CURRENTLY IT'S NOT PASSING ANY DATA ONTO THE NEXT PIECE OF 
//MIDDLEWARE. ASTApiQueryController.queryFunc below is what is being invoked in DataController to add to superstructure.
//Looks like these are the same function, except this one is analyzing backendFileASTs from res.locals and ASTApiQueryController.queryFunc
//is being invoked from DataController with passed in argument
ASTApiQueryController.query = (req, res, next) => {
try {

// GET ASTs
const { backendFileASTs } = res.locals;

// API HANDLERS
const apiHandlers = {
  'Fetch': {
    check: ast => {
      console.log('Fetch API interactions...');
      const hasFetch = checkApiCalls(ast, ['fetch']);
      const hasNodeFetch = checkApiCalls(ast, ['node-fetch']);
      return hasFetch && !hasNodeFetch;
    },
    analyze: (ast, filePath) => analyzeFetchCalls(ast, filePath),
  },
  'Axios': {
    check: ast => {
      console.log('Axios API interactions...');
      return checkApiCalls(ast, ['axios']);
    },
    analyze: (ast, filePath) => analyzeAxiosCalls(ast, filePath),
  },
  'XMLHttpRequest': {
    check: ast => {
      console.log('XMLHttpRequest API interactions...');
      return checkApiCalls(ast, ['XMLHttpRequest']);
    },
    analyze: (ast, filePath) => analyzeXMLHttpRequestCalls(ast, filePath),
  },
  'Node Fetch': {
    check: ast => {
      console.log('Node Fetch API interactions...');
      return checkApiCalls(ast, ['node-fetch']);
    },
    analyze: (ast, filePath) => analyzeNodeFetchInteractions(ast, filePath),
  },
  'Superagent': {
    check: ast => {
      console.log('Superagent API interactions...');
      return checkApiCalls(ast, ['superagent']);
    },
    analyze: (ast, filePath) => analyzeSuperagentInteractions(ast, filePath),
  },
  'jQuery': {
    check: ast => {
      console.log('jQuery API interactions...');
      return checkApiCalls(ast, ['$', 'jQuery']);
    },
    analyze: (ast, filePath) => analyzeJQueryInteractions(ast, filePath),
  },
  'Got': {
    check: ast => {
      console.log('Got API interactions...');
      return checkApiCalls(ast, ['got']);
    },
    analyze: (ast, filePath) => analyzeGotCalls(ast, filePath),
  },
};


// RUN EACH FILE THROUGH THE API HANDLERS
backendFileASTs.forEach(fileObject => {
  const ast = fileObject.ast;
  const filePath = fileObject.filePath;
  console.log(`\x1b[34mChecking ${filePath} file for the following API interactions...\x1b[0m`);


// CHECK AND ANALYZE API CALLS
Object.keys(apiHandlers).forEach(apiKey => {
  const handler = apiHandlers[apiKey];
  if (handler.check(ast)) {
    //TODO: DO SOMETHING WITH ANALYSIS RESULTS?
    const analysisResults = handler.analyze(ast, filePath);
    // console.log(`${apiKey} API Analysis Results:`, analysisResults);
  }
});
});

next ();
} catch (err) {
  console.error('Error in ASTApiQueryController.query:', err);
  return next({
    log: 'error in ASTApiQueryController.query',
    message: err,
  });
}
};



//NOTE: THIS IS BEING INVOKED IN DataController to add stuff to the superstructure. If superstructure apiDetails for each
//file are not being populated correctly, the issue could be here, or it could be in DataController. Look like this function
//only checks for the first api interaction in the file, returns details for it, and does not continue looking for other
//api interactions of other types
ASTApiQueryController.queryFunc = async (nodeAST,nodePath) => {
  try {
    // console.log('Inside ASTApiQueryController.queryFunc')
    // API HANDLERS
    const apiHandlers = {
      'Fetch': {
        check: ast => {
          // console.log('Fetch API interactions...');
          const hasFetch = checkApiCalls(ast, ['fetch']);
          const hasNodeFetch = checkApiCalls(ast, ['node-fetch']);
          return hasFetch && !hasNodeFetch;
        },
        analyze: async (ast, filePath) => analyzeFetchCalls(ast, filePath),
      },
      'Axios': {
        check: ast => {
          // console.log('Axios API interactions...');
          return checkApiCalls(ast, ['axios']);
        },
        analyze: (ast, filePath) => analyzeAxiosCalls(ast, filePath),
      },
      'XMLHttpRequest': {
        check: ast => {
          // console.log('XMLHttpRequest API interactions...');
          return checkApiCalls(ast, ['XMLHttpRequest']);
        },
        analyze: (ast, filePath) => analyzeXMLHttpRequestCalls(ast, filePath),
      },
      'Node Fetch': {
        check: ast => {
          // console.log('Node Fetch API interactions...');
          return checkApiCalls(ast, ['node-fetch']);
        },
        analyze: (ast, filePath) => analyzeNodeFetchInteractions(ast, filePath),
      },
      'Superagent': {
        check: ast => {
          // console.log('Superagent API interactions...');
          return checkApiCalls(ast, ['superagent']);
        },
        analyze: (ast, filePath) => analyzeSuperagentInteractions(ast, filePath),
      },
      'jQuery': {
        check: ast => {
          // console.log('jQuery API interactions...');
          return checkApiCalls(ast, ['$', 'jQuery']);
        },
        analyze: (ast, filePath) => analyzeJQueryInteractions(ast, filePath),
      },
      'Got': {
        check: ast => {
          // console.log('Got API interactions...');
          return checkApiCalls(ast, ['got']);
        },
        analyze: (ast, filePath) => analyzeGotCalls(ast, filePath),
      },
    };
    
    
    // RUN EACH FILE THROUGH THE API HANDLERS
    
    const ast = nodeAST;
    const filePath = nodePath;

    // CHECK AND ANALYZE API CALLS
    let analysisResults;

    for (const apiKey of Object.keys(apiHandlers)) {
      const handler = apiHandlers[apiKey];
      if (handler.check(ast)) {
        // Use await inside an async function
        analysisResults = await handler.analyze(ast, filePath);
        // Once you have the analysis result, you can break out of the loop if needed
        break;
      }
    }
    

    // console.log('analysisResults:',analysisResults)
    return analysisResults;
  } catch (err) {
    console.error('Error in ASTApiQueryController.queryFunc:', err);
    return ({
      log: 'error in ASTApiQueryController.queryFunc',
      message: err,
    });
  }
};




// --------------- API ANALYSIS HELPER FUNCTIONS --------------- //

// ANALYZE FETCH CALLS
function analyzeFetchCalls(ast, filePath) {
  console.log(`\x1b[35mInside Fetch API Extended Analysis`);

  //V2
  const fetchCalls = esquery.query(ast,'Program > ExpressionStatement > CallExpression');
  const fetchCalls2 = esquery.query(ast,'Program > VariableDeclaration > VariableDeclarator > CallExpression')

  const allCalls = [...fetchCalls, ...fetchCalls2];
  // console.log('concated', allCalls)

  
  
  let interactions = allCalls.map(call => {
    

    // let interactionDetail = {
    //   method: 'fetch',
    //   line: call.loc.start.line,
    //   url: null, // PLACEHOLDER
    //   httpMethod: 'GET' // DEFAULT
    // };

    // console.log('call', call)

    // find http method
    if (call.callee.object.arguments){

      let interactionDetail = {
        method: 'fetch',
        line: call.loc.start.line,
        url: null, // PLACEHOLDER
        httpMethod: 'GET' // DEFAULT
      };

      call.callee.object.arguments.forEach(arg => {
        if (arg.type === 'ObjectExpression') {
          arg.properties.forEach(prop => {
            if (prop.key.name === 'method') {
              interactionDetail.httpMethod = prop.value.value;
            }
          });
        }
      })

      call.callee.object.arguments.forEach(arg => {
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


    // EXTRACT HTTP METHOD
    // if (call.arguments[1] && call.arguments[1].type === 'ObjectExpression') {
    //   const options = call.arguments[1];
    //   const methodProperty = options.properties.find(property => property.key.name === 'method');
    //   if (methodProperty && methodProperty.value.type === 'Literal') {
    //     interactionDetail.httpMethod = methodProperty.value.value;
    //   }
    // }

    // console.log('interaction detail:   ',interactionDetail)
    // return interactionDetail;
  });

  // console.log('interactions:', interactions)

    return {
      filePath: filePath,
      totalInteractions: interactions.filter(el => el !== undefined).length,
      details: interactions.filter(el => el !== undefined)
    };

}

// ANALYZE AXIOS CALLS
function analyzeAxiosCalls(ast, filePath) {

  console.log(`\x1b[35mInside Axios API Extended Analysis`);

  const axiosKeywords = ['axios', 'get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'request'];

  let interactions = [];

  const generalAxiosCalls = esquery.query(ast, `CallExpression[callee.name="axios"]`);
  generalAxiosCalls.forEach(expr => {
    interactions.push({
      method: 'axios', // DEFAULT
      line: expr.loc.start.line,
      url: 'dynamic', // PLACEHOLDER
      httpMethod: 'dynamic' // PLACEHOLDER
    });
  });

  // SPECFIC AXIOS METHOD CALLS
  axiosKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(ast, `CallExpression[callee.object.name="axios"][callee.property.name="${keyword}"]`);
    keywordExpressions.forEach(expr => {
      let url = 'dynamic';
      if (expr.arguments.length > 0 && expr.arguments[0].type === 'Literal') {
        url = expr.arguments[0].value; // EXTRACT URL
      }

      interactions.push({
        method: keyword,
        line: expr.loc.start.line,
        url: url,
        httpMethod: keyword
      });
    });
  });

  return {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };
}

// ANALYZE XMLHTTPREQUEST CALLS
function analyzeXMLHttpRequestCalls(ast, filePath) {
  console.log('\x1b[35mInside XMLHttpRequest Extended Analysis');

  // FIND XHR INSTANTIATIONS
  const xhrInstantiations = esquery.query(ast, 'NewExpression[callee.name="XMLHttpRequest"]');

  let interactions = [];

  xhrInstantiations.forEach(instantiation => {
    // FIND VARIABLE NAME OF XHR INSTANCE
    const xhrVarName = instantiation.id ? instantiation.id.name : null;

    if (xhrVarName) {
      // FIND METHOD CALLS ON XHR INSTANCE
      const xhrMethodCalls = esquery.query(ast, `
        CallExpression[callee.object.name="${xhrVarName}"]
      `);

      xhrMethodCalls.forEach(call => {
        let interactionDetail = {
          method: call.callee.property.name,
          line: call.loc.start.line,
          url: null // Placeholder for URL
        };

        // EXTRACT INFORMATION FOR OPEN METHOD
        if (interactionDetail.method === 'open' && call.arguments.length >= 2) {
          interactionDetail.httpMethod = call.arguments[0].value; // HTTP method
          interactionDetail.url = call.arguments[1].value; // URL
        }

        interactions.push(interactionDetail);
      });
    }
  });

  return {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };
}

// ANALYZE NODE FETCH INTERACTIONS
function analyzeNodeFetchInteractions(ast, filePath) {
  console.log(`\x1b[35mInside Node Fetch API Extended Analysis`);

  // List of individual queries
  const queries = [
    `CallExpression[callee.name="fetch"]`,
    
    // EDGE CASES
    `CallExpression[callee.object.name="fetch"]`,
    `CallExpression[callee.property.name="fetch"]`,
    `CallExpression[callee.object.object.name="fetch"]`,
    `CallExpression[callee.object.property.name="fetch"]`,
    `CallExpression[callee.property.object.name="fetch"]`,
    `CallExpression[callee.property.property.name="fetch"]`,
    `AwaitExpression[argument.callee.name="fetch"]`,
    `AwaitExpression[argument.callee.object.name="fetch"]`,
    `AwaitExpression[argument.callee.property.name="fetch"]`,
    `AwaitExpression[argument.callee.object.object.name="fetch"]`,
    `AwaitExpression[argument.callee.object.property.name="fetch"]`,
    `AwaitExpression[argument.callee.property.object.name="fetch"]`,
    `AwaitExpression[argument.callee.property.property.name="fetch"]`,
  ];

  let interactions = [];

  queries.forEach(query => {
    // EXECUTE QUERY INDIVIDUALLY
    const results = esquery.query(ast, query);
    results.forEach(expr => {
      // EXTRACT DETAILS
      let interactionDetail = {
        method: 'fetch',
        line: expr.loc.start.line,
        url: (expr.arguments && expr.arguments[0] && expr.arguments[0].type === 'Literal') ? expr.arguments[0].value : 'dynamic'
      };
      interactions.push(interactionDetail);
    });
  });

  // REMOVE DUPLICATES IF ANY
  const uniqueInteractions = Array.from(new Set(interactions.map(JSON.stringify))).map(JSON.parse);

  return {
    filePath,
    totalInteractions: uniqueInteractions.length,
    details: uniqueInteractions
  };
}

// ANALYZE SUPERAGENT INTERACTIONS
function analyzeSuperagentInteractions(ast, filePath) {

  console.log(`\x1b[35mInside Superagent API Extended Analysis`);
  const superagentKeywords = ['superagent', 'get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
  let interactions = [];

  const keywordExpressions = esquery.query(ast, 
    `CallExpression[callee.object.name="request"], 
     CallExpression[callee.object.object.name="request"],
     AwaitExpression[argument.callee.object.name="request"], 
     AwaitExpression[argument.callee.object.object.name="request"]`);

    keywordExpressions.forEach(expr => {
      let interactionDetail = {
        method: keyword, // Set the method to the current keyword
        line: expr.loc.start.line,
        url: null // Placeholder for URL
      };
  
    if (expr.arguments && expr.arguments[0]) {
      // If the URL is a literal value, extract it directly
      if (expr.arguments[0].type === 'Literal') {
        interactionDetail.url = expr.arguments[0].value;
      } else {
        // If the URL is not a literal (e.g., a variable or an expression), mark it as 'dynamic' or similar
        interactionDetail.url = 'dynamic';
      }
    }
  
    interactions.push(interactionDetail);
  });
  
    return {
      filePath,
      totalInteractions: interactions.length,
      details: interactions
    };
  };

// ANALYZE JQUERY INTERACTIONS
function analyzeJQueryInteractions(ast, filePath) {

  console.log(`\x1b[35mInside jQuery API Extended Analysis`);
  const jqueryKeywords = ['$', 'jQuery', 'ajax', 'get', 'post', 'put', 'delete', 'getJSON', 'getScript', 'load'];

  let interactions = [];

  jqueryKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(ast, [
      `CallExpression[callee.object.name="$"][callee.property.name="${keyword}"]`,
      `CallExpression[callee.object.name="jQuery"][callee.property.name="${keyword}"]`,
      `CallExpression[callee.object.callee.name="$"][callee.object.property.name="${keyword}"]`,
      `CallExpression[callee.object.callee.name="jQuery"][callee.object.property.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      let interactionDetail = {
        method: keyword,
        line: expr.loc.start.line,
        url: null // PLACEHOLDER
      };

      // EXTRACT URL FOR AJAX METHODS
      if (['ajax', 'get', 'post', 'getJSON', 'getScript', 'load'].includes(keyword)) {
        if (expr.arguments && expr.arguments[0] && expr.arguments[0].type === 'Literal') {
          interactionDetail.url = expr.arguments[0].value;
        } else if (keyword === 'ajax' && expr.arguments[0] && expr.arguments[0].type === 'ObjectExpression') {
          const ajaxOptions = expr.arguments[0].properties;
          const urlProperty = ajaxOptions.find(property => property.key.name === 'url');
          interactionDetail.url = urlProperty && urlProperty.value.type === 'Literal' ? urlProperty.value.value : 'dynamic';
        } else {
          interactionDetail.url = 'dynamic';
        }
      }

      interactions.push(interactionDetail);
    });
  });

  return {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };
};





export default ASTApiQueryController;