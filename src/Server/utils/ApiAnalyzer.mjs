import esquery from 'esquery';
import chalk from 'chalk';
import fs from 'fs';

class Analyzer {
  constructor(ast, filePath) {
    this.ast = ast;
    this.filePath = filePath;
    this.currQuery = null;
    this.nodeMatches = [];
    this.apiDetails = [];
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
      //this means that no nodes returned using current ast query
      return null;
    }

    return ({
      apiName: api,
      type,
      numNodes: nodes.length,
      nodes
    });
  }

  //TODO: we may want to grab just the url domain. this works fine for strings, but we need to handle cases for template literals where the url value is stored in a variable
  getCallArgs(nodes) {
    const args = [];
    nodes.forEach((node, index) => {
      for (let i = 0; i < node.arguments?.length; i++) {
        const arg = node.arguments[i];
        let argValue = '';
        switch (arg.type) {
          case 'Literal':
            argValue = arg.value;
            break;
          case 'Identifier': 
            argValue = arg.name;
            break;
          case 'TemplateLiteral':
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
            console.log(chalk.red('Argument is not a Literal, Identifier, or TemplateLiteral and was not handled correctly in Analyzer.getCallArgs.' + 
            'Sending node to getCallArgs-error.log.' + 
            'Use error log entry to determine best way to get args from this node.'
            ));
            const errorStream = fs.createWriteStream('./getCallArgs-error.log', { flags: 'a' });
            errorStream.write(JSON.stringify({
              filePath: this.filePath,
              node
            }, null, 2));
            errorStream.write('\n\n');
            errorStream.end();
            argValue = undefined;
            break;
        }
        args.push(argValue);
      }
    });
    //filter out undefined (unhandled) args for now
    //TODO: handle the undefined args
    return args.filter(arg => arg);
  }
}

//i want api, number interfactions, endpoints
class ImportedApiAnalyzer extends Analyzer {
  constructor(ast, filePath) {
    super(ast, filePath);
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

          if (requireVariableDeclarators) {
            this.nodeMatches.push(requireVariableDeclarators);
          }
          if (requireCallExpressions) {
            this.nodeMatches.push(requireCallExpressions);
          }
          if (importDeclarations) {
            this.nodeMatches.push(importDeclarations);
          }
          libraries.splice(j, 1);
        }
      }
      i++;
    }
  }

  setImportRefs() {
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

  getApiDetails() {
    this.setImportRefs();
    this.analyzeApiCalls();
    return this.apiDetails;
  }
}

class NativeApiAnalyzer extends Analyzer {
  constructor(ast, filePath) {
    super(ast, filePath);
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
      this.nodeMatches.forEach((apiNode) => {
        const apiName = apiNode.apiName;
        let nodes = apiNode.nodes;
        const args = this.getCallArgs(nodes);
        this.apiDetails.push(
          {
            api: apiName,
            numInteractions: args.length,
            endpoints: args
          }
        );
      });
    }
  }

  getApiDetails() {
    this.analyzeApiCalls();
    return this.apiDetails;
  }
}

export {
  ImportedApiAnalyzer, 
  NativeApiAnalyzer
};