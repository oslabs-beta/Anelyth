import esquery from 'esquery';
import chalk from 'chalk';

class ApiAnalyzer {
  constructor() {
    //'native' or 'imported'
    this.type = null;
    this.currQuery = null;
    this.args = null;
    this.importRefs = {};
    this.matches = [];
  }

  setApiType(type) {
    return this.type = type;
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

  getApiCalls(ast, apiLibraries) {
    if (!ast || !apiLibraries) {
      return console.log('Please pass in ast and apiLibraries');
    }
    const libraries = [...apiLibraries];

    if (this.type === 'imported') {
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
            // this.setQuery`VariableDeclarator[init.callee.name="require"][init.arguments.0.value="${currApi}"]`;
            // const requireVariableDeclarators = this.getNodes(ast, 'requireVariableDeclarators', currApi);
            this.setQuery`CallExpression[callee.name="require"][arguments.0.value="${currApi}"]`; 
            const requireCallExpressions = this.getNodes(ast, 'requireCallExpressions', currApi);
            this.setQuery`ImportDeclaration[source.value="${currApi}"]`;
            const importDeclarations = this.getNodes(ast, 'importDeclarations', currApi);
            if (requireCallExpressions || importDeclarations) {
              this.matches.push(requireCallExpressions, importDeclarations);
            }
            libraries.splice(j, 1);
          }
        }
        i++;
      }
    } else if (this.type === 'native') {
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
  }

  setImportRefs() {
    
  }
}

export default ApiAnalyzer;