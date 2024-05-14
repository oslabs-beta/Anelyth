import esquery from 'esquery';
import chalk from 'chalk';

class Analyzer {
  constructor(ast) {
    this.ast = ast;
    this.currQuery = null;
    this.nodeMatches = [];
    this.apiDetails = [];
  }

  getApiDetails() {
    return this.apiDetails;
  }

  setQuery(strings, api) {
    let result = ``;
    for (let i = 0; i < strings.length; i++) {
      if (i === strings.length - 1) {
        result += `${strings[i]}`;
      } else {
        result += `${strings[i]}${api}`;
      }
    }
    this.currQuery = result;
  }

  getNodes(type, api) {
    const nodes = esquery.query(
      this.ast,
      this.currQuery
    );

    if (!nodes.length) {
      return null;
    }

    return ({
      apiName: api,
      type,
      numNodes: nodes.length,
      nodes
    });
  }

  getCallArgs(nodes) {
    const args = [];
    nodes.forEach((node, index) => {
      console.log(`node ${index + 1} arguments: ${node.arguments}`);
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
    return args;
  }
}

//i want api, number interfactions, endpoints
class ImportedApiAnalyzer extends Analyzer {
  constructor(ast) {
    super(ast);
    this.refs = {};
  }

  setApiNodeMatches(apiLibraries) {
    if (!apiLibraries) {
      return console.log('Please pass in apiLibraries');
    }
    const libraries = [...apiLibraries];
    //This list should eventually be a list of all imported api's we can handle. we can then have the user pass in the api libraries they are using in their codebase, which would
    //correspond to the apiLibraries arg
    //add libraries you want to check for HERE
    const importedApis = ['axios'];
    let i = 0;
    while (i < importedApis.length && libraries.length > 0) {
      const currApi = importedApis[i].toLowerCase();
      for (let j = 0; j < libraries.length; j++) {
        const currLibrary = libraries[j].toLowerCase();
        if (currLibrary === currApi) {
          this.setQuery`VariableDeclarator[init.callee.name="require"][init.arguments.0.value="${currApi}"]`;
          const requireVariableDeclarators = this.getNodes('requireVariableDeclarators', currApi);
          this.setQuery`CallExpression[callee.name="require"][arguments.0.value="${currApi}"]`; 
          const requireCallExpressions = this.getNodes('requireCallExpressions', currApi);
          this.setQuery`ImportDeclaration[source.value="${currApi}"]`;
          const importDeclarations = this.getNodes('importDeclarations', currApi);
          if (requireVariableDeclarators || requireCallExpressions || importDeclarations) {
            this.nodeMatches.push(requireVariableDeclarators, requireCallExpressions, importDeclarations);
          }
          libraries.splice(j, 1);
        }
      }
      i++;
    }
  }

  setImportRefs() {
    if (this.nodeMatches.length === 0) {
      console.log('There are 0 api nodeMatches. This could be for 2 reasons: 1) there are no nodeMatches 2) you need to populate nodeMatches.' +
      'Make sure you populate api nodeMatches first by invoking setApiNodeMatches. Then invoke setImportRefs.');
    }
    this.nodeMatches.forEach(({ apiName, type, nodes }) => {
      if (type === 'requireVariableDeclarators') {
        nodes.forEach(({ id }) => {
          if (!this.refs[apiName]) {
            this.refs[apiName] = [id.name];
          } else {
            this.refs[apiName].push(id.name);
          }
        });
      } else if (type === 'importDeclarations') {
        nodes.forEach(({ specifiers }) => {
          specifiers.forEach(({ local }) => {
            if (!this.refs[apiName]) {
              this.refs[apiName] = [local.name];
            } else {
              this.refs[apiName].push(local.name);
            }
          });
        });
      }
    });
  }

  analyzeApiCalls() {
    if (Object.keys(this.refs).length === 0) {
      console.log('There are 0 importRefs. This could be for 2 reasons: 1) there are no importRefs in the current file 2) you need to populate imporRefs.' +
      'Make sure you populate importRefs first by invoking setImportRefs. Then invoke analyzeApiCalls.');
    }
    for (let api in this.refs) {
      const apiArgs = [];
      this.refs[api].forEach((ref) => {
        this.setQuery`CallExpression[callee.type="MemberExpression"][callee.property.name="${ref}"], CallExpression[callee.type="Identifier"][callee.name="${ref}"]`;
        const importRefCallNodes = this.getNodes('importRefCallExpressions');
        if (importRefCallNodes) {
          //get arguments (data endpoints for each api call)
          let nodes = importRefCallNodes.nodes;
          const args = this.getCallArgs(nodes);
          apiArgs.push(...args);
        }
      });
      this.apiDetails.push(
        {
          api,
          numInteractions: apiArgs.length,
          endpoints: apiArgs
        }
      );
    }
  }
}

class NativeApiAnalyzer extends Analyzer {
  constructor(ast) {
    super(ast);
  }
  
  setApiNodeMatches(apiLibraries) {
    if (!apiLibraries) {
      return console.log('Please pass in apiLibraries');
    }
    const libraries = [...apiLibraries];
    // Special checks for APIs that don't require import/require in a browser environment
    // const browserAPIs = ['fetch', 'XMLHttpRequest', '$', 'jQuery'];
    //This list should eventually be a list of all native api's we can handle. we can then have the user pass in the api libraries they are using in their codebase, which would
    //correspond to the apiLibraries arg
    //add libraries you want to check for HERE
    const nativeApis = ['fetch'];
    let i = 0;
    while (i < nativeApis.length && libraries.length > 0) {
      const currApi = nativeApis[i].toLowerCase();
      for (let j = 0; j < libraries.length; j++) {
        const currLibrary = libraries[j].toLowerCase();
        if (currLibrary === currApi) {
          this.setQuery`CallExpression[callee.type="MemberExpression"][callee.property.name="${currApi}"], CallExpression[callee.type="Identifier"][callee.name="${currApi}"]`;
          const nativeCallExpressions = this.getNodes('nativeCallExpressions', currApi);
          if (nativeCallExpressions) {
            this.nodeMatches.push(nativeCallExpressions);
          }
          libraries.splice(j, 1);
        }
      }
      i++;
    }
  }
  //get arguments (data endpoints for each api call)
  analyzeApiCalls() {
    if (this.nodeMatches.length > 0) {
      this.nodeMatches.forEach((api) => {
        let nodes = api.nodes;
        const args = this.getCallArgs(nodes);
        this.apiDetails.push(
          {
            api,
            numInteractions: args.length,
            endpoints: args
          }
        );
      });
    }
  }
}

export {
  ImportedApiAnalyzer, 
  NativeApiAnalyzer
};