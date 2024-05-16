import escomplex from 'escomplex';
import path from 'path';
import fs from 'fs';
import babel from '@babel/core';
import esquery from 'esquery';
import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
import ora from 'ora';
import ASTDbQueryController from './ASTDbQueryController.mjs';
import ASTApiQueryController from './AstApiQueryController2.mjs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));


jsx(Parser);

const DataController = {};

;
// ------- MIDDLEWARE FOR CREATING SUPER STRUCTURE ------- //

//NOTE: this middleware is only writing superstructure to log right now. it's not passing it along in the middleware chain.
DataController.superStructure = async (req, res, next) => {
  try{
    
    const spinner = ora({
      text: 'Building super structure...',
      color: 'yellow',
      spinner: 'dots'
    }).start();

    let superStructure = {};
    const dcdata = res.locals.depResult;
    // const astData = res.locals.astData;
    // console.log('dcdata: ',dcdata)

    const {modelRegistry , importRegistry} = res.locals;

  
    
    const filePath = path.resolve(__dirname, '../temp-file-upload');

    // SAVE RESULT OF BUILDHIERARCHY TO VARIABLE
    const hierarchy = buildHierarchy(filePath);
    // CREATE NEW VARIABLE STARTING AT UPLOADED REPO ROOT DIRECTORY
    const codeHierarchy = hierarchy.children[0];
    // CREATE THE SUPER STRUCTURE WITH TRAVERSEHIERARCHY FUNCTION
    superStructure = await traverseHierarchy(codeHierarchy, dcdata, modelRegistry, importRegistry);
    // console.log('super structure: ',superStructure);

    // temp log of super structure
    const logFilePath = './super-structure.log';
    const logStream = fs.createWriteStream(logFilePath);
    logStream.on('finish', () => {
      console.log('\x1b[36m%s\x1b[0m', 'Super structure log has finished writing!...');
      next(); // Only call next() once writing has completed
    });

    logStream.on('error', (err) => {
      console.error('Error writing super structure log:', err);
      next(err); // Pass the error to the next middleware
    });

    logStream.write(JSON.stringify(superStructure, null, 2));

    spinner.succeed('Super structure built successfully.');

    logStream.end(); // Make sure to call end to trigger 'finish'
  } catch (err) {
    console.error('DataController.superStructure: ERROR:', err);
    next({
      log: 'DataController.superStructure: ERROR: ' + err,
      message: { err: 'DataController.superStructure: ERROR: Check server logs for details' },
    });
  }
};



// FUNCTION TO BUILD HIERARCHY OF FILES
function buildHierarchy(nodePath) {

  const stat = fs.statSync(nodePath);

  if (stat.isDirectory()) {
    // IF NODE PATH IS A DIRECTORY
    const dirContents = fs.readdirSync(nodePath);

    const children = dirContents.map(node => buildHierarchy(path.join(nodePath, node)))

    return {
      name: path.basename(nodePath),
      path: path.resolve(nodePath),
      type: 'directory',
      children: children
    };
  } else {
    // IF FILE IS NOT A DIRECTORY
    return {
      name: path.basename(nodePath),
      path: path.resolve(nodePath),
      type: 'file'

    };
  }
  
}


// MAIN FUNCTION TO BUILD OUT SUPER STRUCTURE //
async function traverseHierarchy(node, dcdata, modelRegistry, importRegistry) {
  try{
    if (!node) {
      return;
    }
  
    if (node.name.endsWith('.json') || node.name.endsWith('.md') || node.name.endsWith('.html') || node.name.endsWith('.jpg') || node.name.endsWith('.jpeg') || node.name.endsWith('.png')) {
      return {
        name: node.name,
        type: 'file',
        path: node.path,
      };
    }
  
    const newNode = {
      name: node.name,
      type: node.children ? 'directory' : 'file',
      path: node.path,
      children: []
    };
  
    if (node.children) {
      newNode.children = await Promise.all(node.children.map(async child => await traverseHierarchy(child,dcdata,modelRegistry,importRegistry)));
    } else {
  
      // CALL HELPER FUNCS TO GET DATA 
      const complexityAndLines = await getComplexityAndLinesOfCode(node.path);
      const size = await getFileSize(node.path);
      const dependentsAndDependencies = await getDependenciesAndDependents(node.path, dcdata)
      const nodeAst = await parseFileToAST(node.path);
 
      const dbData = ASTDbQueryController.query2(nodeAst, node.path, modelRegistry, importRegistry);
      const apiData = ASTApiQueryController.queryFunc(nodeAst, node.path);
      const exportsData = getModuleDotExports(nodeAst);
      const exportsData2 = getES6DefaultExports(nodeAst);
      const exportsData3 = getES6Exports(nodeAst);
      const allExports = [...exportsData, ...exportsData2, ...exportsData3];
      
      newNode.info = {
        fileSize: size, 
        linesOfCode: complexityAndLines.linesOfCode,
        complexity: complexityAndLines.complexity,
        dependents: dependentsAndDependencies.dependents,
        dependencies: dependentsAndDependencies.dependencies,
        isModule: allExports.length > 0 ? true : false,
        exportedModules: allExports
      };

      newNode.deepInfo = {
        orphan: dependentsAndDependencies.orphan,
        funcDecName: getASTFuncDecs(nodeAst),
        funcExpressions: getASTFuncExps(nodeAst),
        funcArrowExpressions: getASTArrowFuncExps(nodeAst),
        classDeclarations: getASTClassDecs(nodeAst),
        funcCallExpressions: getASTCallExps(nodeAst),
        memberExpressions: getASTMemberExps(nodeAst),
        methodDefNames: getASTMethodDefNames(nodeAst),
        variableDecNames: getASTVariableDecNames(nodeAst)
      }

      newNode.dbInfo = dbData;

      // if (apiData) {
      //   newNode.apiInfo = {
      //     totalInteractions: apiData.totalInteractions,
      //     details: getApiData(apiData)
      //   }
      // } else {
      //   newNode.apiInfo = {
      //     totalInteractions: 0,
      //     details: []
      //   }
      // }
      newNode.apiInfo = apiData;


    }
  
    return newNode;
  } catch (err) {
    return ({
      log: 'DataController.traverseHierarchy: ERROR: ' + err,
      message: { err: 'DataController.traverseHierarchy: ERROR: Check server logs for details' },
    })
  }

  
}



// ----------- FILE PARSING FUNCTIONS ----------- //

// GET FILE SIZE FUNCTION
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

// GET COMPLEXITY AND LINES OF CODE FUNCTION
async function getComplexityAndLinesOfCode (filePath) {
  // SET THE FILE WE WANT TO ANALYZE ((--- HARD CODED FOR NOW ---))
  const path1 = filePath;
  // READ THE FILE AND SAVE TO VARIABLE
  const code1 = fs.readFileSync(path1, 'utf8');

  // TRANSFORM THE FILE USING BABEL SO ESCOMPLEX CAN ANALYZE IT
  const transformed = await babel.transformSync(code1, {filename: path1, presets: ['@babel/preset-react', '@babel/preset-env', '@babel/preset-typescript']})
  // ANALYZE THE TRANSFORMED CODE WITH ESCOMPLEX
  const result = await escomplex.analyse(transformed.code);

  // GET THE LINES OF CODE AND CYCLOMATIC COMPLEXITY
  const linesOfCode = result.aggregate.sloc.logical;
  const complexity = result.aggregate.cyclomatic;

  // CONSOLE LOG THE RESULTS
  // console.log('results of esxcomplex analysis: ', result)

  return {
    linesOfCode: linesOfCode,
    complexity: complexity
  };
}

// ----------- DC PARSING FUNCTIONS ----------- //

// GET DEPENDENCIES AND DEPENDENTS FUNCTION
function getDependenciesAndDependents(filePath, dcdata) {
  // console.log('curr lower file ',filePath.toLowerCase())
  try{
    let nodeData = dcdata.modules.filter(el => filePath.toLowerCase().includes(el.source.toLowerCase()));
    // console.log('nodeData: ',nodeData[0].dependencies)
    return nodeData[0];

  } catch (err){
    console.log(err)
  }
}


// ---------- AST PARSING FUNCTIONS ---------- //

// PARSE FILE TO AST FUNCTION
const parseFileToAST = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, script) => {
      if (err) {
        reject(err);
      } else {
        try {
          const acornParser = Parser.extend(jsx());
          const ast = acornParser.parse(script, {
            sourceType: 'module',
            ecmaVersion: 'latest',
            locations: true
          });
          resolve(ast);
        } catch (parseErr) {
          reject(parseErr);
        }
      }
    });
  });
};

// GET AST FUNC DECLARATIONS FUNCTION
function getASTFuncDecs(ast){
  const functionDeclarations = esquery(ast, "FunctionDeclaration");
  let resultArr = [];
  functionDeclarations.forEach(node => {
    let funcObj = {
      funcName: node.id.name
    };
    //TODO: do more wth funcObj. only pushing name for now
    resultArr.push(funcObj.funcName);
  })
  return resultArr;
}

// GET AST FUNC EXPRESSIONS FUNCTION
// gets name of variable that was assigned to a anonymous function
function getASTFuncExps(ast){
  const anonFuncs = esquery(ast, 'VariableDeclarator[init.type="FunctionExpression"][init.params]')
  let resultArr = [];
  anonFuncs.forEach(node => {
    resultArr.push({anonFuncName: node.id.name})
  })
  return resultArr;
}

// GET AST FUNC ARROW FUNCTIONS
function getASTArrowFuncExps(ast){
  const arrowFuncs = esquery(ast, 'VariableDeclarator[init.type="ArrowFunctionExpression"][init.params]')
  let resultArr = [];
  arrowFuncs.forEach(node => {
    resultArr.push({arrowFuncName: node.id.name})
  })
  return resultArr;
}

// GET AST CLASS DECLARATIONS FUNCTION
function getASTClassDecs(ast){
  const classDeclarations = esquery(ast, "ClassDeclaration");
  let resultArr = [];

  classDeclarations.forEach(node => {
    let classObj = {};

    // console.log(node.body.body);
    // console.log('constutror shitt:  ', node.body.body[0].value.body.body[0].expression.left)
    // node.body.body[0].value.body.body.forEach(el => console.log('look here!!!!! : ',el.expression.left))

      classObj.className = node.id.name;
      classObj.constructorArgs = [];
      classObj.constuctorProps = [];
      classObj.methods = [];
   
      node.body.body.forEach(el => {
        
        // get methods of class
        if (el.kind === 'method') {
          classObj.methods.push(el.key.name);
        }

        // get constructor arguments of class
        if (el.kind === 'constructor') {
          el.value.params.forEach(param => {
            // console.log('looking param:   ', param.name)
            classObj.constructorArgs.push(param.name)
          })
        }

        // get constructor properties of class
        if (el.kind === 'constructor') {
          el.value.body.body.forEach(prop => {
            // console.log('looking prop:   ', prop.expression.left.property.name)
            classObj.constuctorProps.push(prop.expression.left.property.name)
          })
        }

      });


    //TODO: do stuff with the rest of classObj. only pushing class name for now
    resultArr.push(classObj.className);
  })
  return resultArr;
}

// GET AST CALL EXPRESSIONS FUNCTION
// finds when a function is evoked/called and the args passed in
function getASTCallExps(ast){
  const callExpressions = esquery(ast, "CallExpression");
  let resultArr = [];
  callExpressions.forEach(node => {
    
    let callObj = {
      functionName: node.callee.name,
      arguments: [],
    };

    node.arguments.forEach(el => {
      if (el.value) callObj.arguments.push(el.value)
    })

    if (callObj.name){
      resultArr.push(callObj);
    }
  })
  return resultArr;
}

// GET AST MEMBER EXPRESSIONS FUNCTION
// finds all instances where we are accessing a property of an object
function getASTMemberExps(ast){
  const memberExpressions = esquery(ast, "MemberExpression");
  let resultArr = [];
  
  memberExpressions.forEach(node => {
    // console.log('look here: ', node)
    
    const getExpression = (expr) => {
      if (expr === null) return;
      if (expr.type === 'Identifier') {
        return expr.name;
      } else if (expr.name === 'MemberExpression') {
        return getExpression(expr.object) + (expr.computed ? `[${getExpression(expr.property)}]` : `.${getExpression(expr.property)}` )
      }
      return;
    }

    let memberObject = {
      object: getExpression(node.object),
      property: node.property.type === 'Identifier' && [node.computed ? node.property.name : getExpression(node.property)],
      property_access_notation: node.computed ? 'bracket' : 'dot'
    }
    resultArr.push(memberObject)
  })

  return resultArr;
}

// API HELPER FUNC
function getApiData(data){
  let result = [];
  let apiData = data.details;
  // console.log('here')
  apiData.forEach(el => {
    // console.log('el: ',el)
    if (el){
      result.push({
        apiType: el.method,
        apiURL: el.url,
        typeOfCall: el.httpMethod
      })
    }
  })
  return result;
}

// GET MODEULE.EXPORTS HELPER FUNC
function getModuleDotExports(ast){
  try {
    let moduleNames = []
    ast.body.forEach(el => {

      if (el.type === 'ExpressionStatement' && el.expression.left !== undefined && el.expression.left.object !== undefined && el.expression.left.object.name === 'module' && el.expression.left.property.name === 'exports'){
        moduleNames.push(el.expression.right.name)
      }

    })
    return moduleNames;
  } catch (err) {
    console.log('err: ',err)
  }
}

// GET ES6 EXPORT DEFAULT HELPER FUNC
function getES6DefaultExports(ast){
  let moduleNames = []
  // console.log(ast)
  const results = esquery(ast, 'ExportDefaultDeclaration')
  results.forEach(el => {
    moduleNames.push(el.declaration.name)
  })
  return moduleNames;
}

// GET ES6 EXPORTS HELPER FUNC
function getES6Exports(ast){
  let moduleNames = []
  let results = esquery(ast, 'ExportNamedDeclaration')
  results.forEach(el => {
    el.specifiers.forEach(spec => {
      moduleNames.push(spec.exported.name)
    })
  })
  return moduleNames;
}

//needs refactoring, not returning exactly what we expect in all cases
function getASTMethodDefNames(ast) {
  const methodDefNames = esquery(ast,
    `MethodDefinition > Identifier,
    Property[key.type="Identifier"][value.type="FunctionExpression"] > Identifier,
    Property[key.type="Identifier"][value.type="ArrowFunctionExpression"] > Identifier`
  );
  const methodNames = methodDefNames.map(node => node.name);
  return methodNames;
}
//needs refactoring, not returning exactly what we expect in all cases
function getASTVariableDecNames(ast) {
  const variableDecNames = esquery(ast, 
    `VariableDeclaration`
  );
  const varDecNames = variableDecNames.map(node => node.declarations[0].id.name);
  return varDecNames;
}


// module.exports =  DataController;
export default DataController;
