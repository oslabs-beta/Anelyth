import esquery from 'esquery';

class ApiAnalyzer {
  constructor() {
    //'native' or 'imported'
    this.type = null;
    this.currQuery = null;
    this.args = null;
  }

  setApiType(type) {
    return this.type = type;
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

  getNodes(ast, api) {
    const nodes = esquery.query(
      ast,
      this.currQuery
    );

    if (!nodes.length) {
      return null;
    }

    return ({
      apiName: api,
      numNodes: nodes.length,
      nodes
    });
  }

  findApiCalls(ast, apiLibraries) {
    if (!ast || !apiLibraries) {
      return console.log('Please pass in ast and apiLibraries');
    }
    const matches = [];
    const libraries = [...apiLibraries];

    if (type === 'imported') {
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
            this.setQuery`VariableDeclarator[init.callee.name="require"][init.arguments.0.value="${currApi}"],
            CallExpression[callee.name="require"][arguments.0.value="${currApi}"],
            ImportDeclaration[source.value="${currApi}"]`;
            const result = this.getNodes(ast, currApi);
            if (result) {
              //TODO: get variable being assigned, then look up call expressions based on that name
              matches.push(result);
            }
            libraries.splice(j, 1);
          }
        }
        i++;
      }
    } else if (type === 'native') {
      // Special checks for APIs that don't require import/require in a browser environment
      // const browserAPIs = ['fetch', 'XMLHttpRequest', '$', 'jQuery'];
      //This list should eventually be a list of all native api's we can handle. we can then have the user pass in the api libraries they are using in their codebase, which would
      //correspond to the apiLibraries arg
      //add libraries you want to check for HERE
      const nativeApis = ['fetch'];
      let k = 0;
      while (k < nativeApis.length && libraries.length > 0) {
        const currApi = nativeApis[k].toLowerCase();
        for (let j = 0; j < libraries.length; j++) {
          const currLibrary = libraries[j].toLowerCase();
          if (currLibrary === currApi) {
            this.setQuery`CallExpression[callee.type="MemberExpression"][callee.property.name="${currApi}"], CallExpression[callee.type="Identifier"][callee.name="${currApi}"]`;
            const result = this.getNodes(ast, currApi);
            if (result) {
              matches.push(result);
            }
            libraries.splice(j, 1);
          }
        }
        k++;
      }
    }
    return matches;
  }
}

export default ApiAnalyzer;