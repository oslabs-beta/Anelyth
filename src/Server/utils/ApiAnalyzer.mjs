import esquery from 'esquery';
import chalk from 'chalk';

class Analyzer {
  constructor() {
    this.currQuery = null;
    this.args = [];
    this.matches = [];
  }

  getMatches() {
    return this.matches;
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

  getNodes(ast, type, api) {
    const nodes = esquery.query(
      ast,
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

  // getApiCalls(ast, apiLibraries) {
  //   if (!ast || !apiLibraries) {
  //     return console.log('Please pass in ast and apiLibraries');
  //   }
  //   const libraries = [...apiLibraries];

  //   if (this.type === 'imported') {
  //     //This list should eventually be a list of all imported api's we can handle. we can then have the user pass in the api libraries they are using in their codebase, which would
  //     //correspond to the apiLibraries arg
  //     //add libraries you want to check for HERE
  //     const importedApis = ['axios'];
  //     let i = 0;
  //     while (i < importedApis.length && libraries.length > 0) {
  //       const currApi = importedApis[i].toLowerCase();
  //       for (let j = 0; j < libraries.length; j++) {
  //         const currLibrary = libraries[j].toLowerCase();
  //         if (currLibrary === currApi) {
  //           // this.setQuery`VariableDeclarator[init.callee.name="require"][init.arguments.0.value="${currApi}"]`;
  //           // const requireVariableDeclarators = this.getNodes(ast, 'requireVariableDeclarators', currApi);
  //           this.setQuery`CallExpression[callee.name="require"][arguments.0.value="${currApi}"]`; 
  //           const requireCallExpressions = this.getNodes(ast, 'requireCallExpressions', currApi);
  //           this.setQuery`ImportDeclaration[source.value="${currApi}"]`;
  //           const importDeclarations = this.getNodes(ast, 'importDeclarations', currApi);
  //           if (requireCallExpressions || importDeclarations) {
  //             this.matches.push(requireCallExpressions, importDeclarations);
  //           }
  //           libraries.splice(j, 1);
  //         }
  //       }
  //       i++;
  //     }
  //   } else if (this.type === 'native') {
  //     // Special checks for APIs that don't require import/require in a browser environment
  //     // const browserAPIs = ['fetch', 'XMLHttpRequest', '$', 'jQuery'];
  //     //This list should eventually be a list of all native api's we can handle. we can then have the user pass in the api libraries they are using in their codebase, which would
  //     //correspond to the apiLibraries arg
  //     //add libraries you want to check for HERE
  //     const nativeApis = ['fetch'];
  //     let i = 0;
  //     while (i < nativeApis.length && libraries.length > 0) {
  //       const currApi = nativeApis[i].toLowerCase();
  //       for (let j = 0; j < libraries.length; j++) {
  //         const currLibrary = libraries[j].toLowerCase();
  //         if (currLibrary === currApi) {
  //           this.setQuery`CallExpression[callee.type="MemberExpression"][callee.property.name="${currApi}"], CallExpression[callee.type="Identifier"][callee.name="${currApi}"]`;
  //           const nativeCallExpressions = this.getNodes(ast, 'nativeCallExpressions', currApi);
  //           if (nativeCallExpressions) {
  //             this.matches.push(nativeCallExpressions);
  //           }
  //           libraries.splice(j, 1);
  //         }
  //       }
  //       i++;
  //     }
  //   }
  // }
}


class ImportedApiAnalyzer extends Analyzer {
  constructor() {
    super();
    this.refs = {};
  }

  getApiCalls(ast, apiLibraries) {
    if (!ast || !apiLibraries) {
      return console.log('Please pass in ast and apiLibraries');
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
          const requireVariableDeclarators = this.getNodes(ast, 'requireVariableDeclarators', currApi);
          this.setQuery`CallExpression[callee.name="require"][arguments.0.value="${currApi}"]`; 
          const requireCallExpressions = this.getNodes(ast, 'requireCallExpressions', currApi);
          this.setQuery`ImportDeclaration[source.value="${currApi}"]`;
          const importDeclarations = this.getNodes(ast, 'importDeclarations', currApi);
          if (requireVariableDeclarators || requireCallExpressions || importDeclarations) {
            this.matches.push(requireVariableDeclarators, requireCallExpressions, importDeclarations);
          }
          libraries.splice(j, 1);
        }
      }
      i++;
    }
  }

  setImportRefs() {
    if (this.matches.length === 0) {
      console.log('There are 0 api matches. This could be for 2 reasons: 1) there are no matches 2) you need to populate matches.' +
      'Make sure you populate api matches first by invoking getApiCalls. Then invoke setRefs.');
    }
    this.matches.forEach(({ type, nodes }) => {
      if (type === 'requireVariableDeclarators') {
        nodes.forEach(({ id }, idx) => {
          if (idx === 0) {
            this.refs[type] = [id.name];
          } else {
            this.refs[type].push(id.name);
          }
        });
      } else if (type === 'importDeclarations') {
        nodes.forEach(({ specifiers }) => {
          specifiers.forEach(({ local }, idx) => {
            if (idx === 0) {
              this.refs[type] = [local.name];
            } else {
              this.refs[type].push(local.name);
            }
          });
        });
      }
    });
  }

  setArgs(ast) {
    if (Object.keys(this.refs).length === 0) {
      console.log('There are 0 importRefs. This could be for 2 reasons: 1) there are no importRefs in the current file 2) you need to populate imporRefs.' +
      'Make sure you populate importRefs first by invoking setImportRefs. Then invoke getArgs.');
    }
    for (let key in this.refs) {
      this.refs[key].forEach((ref) => {
        this.setQuery`CallExpression[callee.type="MemberExpression"][callee.property.name="${ref}"], CallExpression[callee.type="Identifier"][callee.name="${ref}"]`;
        const importRefCallNodes = this.getNodes(ast, 'importRefCallExpressions');
        if (importRefCallNodes) {
          //get arguments (data endpoints for each api call)
          let nodes = importRefCallNodes.nodes;
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
              this.args.push(argValue);
            }
          });
        }
      });
    }
  }
}

class NativeApiAnalyzer extends Analyzer {
  constructor() {
    super();
  }
  
  getApiCalls(ast, apiLibraries) {
    if (!ast || !apiLibraries) {
      return console.log('Please pass in ast and apiLibraries');
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
          const nativeCallExpressions = this.getNodes(ast, 'nativeCallExpressions', currApi);
          if (nativeCallExpressions) {
            this.matches.push(nativeCallExpressions);
          }
          libraries.splice(j, 1);
        }
      }
      i++;
    }
  }

  setArgs() {
    this.matches.map((api) => {
      //get arguments (data endpoints for each api call)
      let nodes = api.nodes;
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
          this.args.push(argValue);
        }
      });
    });
  }
}

export {
  ImportedApiAnalyzer, 
  NativeApiAnalyzer
};