import escomplex from 'escomplex';
import path from 'path';
import fs from 'fs';
import babel from '@babel/core';
import esquery from 'esquery';
import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
import ASTDbQueryController from './ASTDbQueryController.mjs';
import ASTApiQueryController from './ASTApiQueryController.mjs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));


jsx(Parser);

const DataController = {};


// ------- MIDDLEWARE FOR CREATING SUPER STRUCTURE ------- //
DataController.superStructure = async (req, res, next) => {
  try{
    console.log('in DataController.superStructure')

    let superStructure = {};
    const dcdata = res.locals.depResult;
    // const astData = res.locals.astData;
    // console.log('dcdata: ',dcdata)
    
    const filePath = path.resolve(__dirname, '../temp-file-upload');

    // SAVE RESULT OF BUILDHIERARCHY TO VARIABLE
    const hierarchy = await buildHierarchy(filePath);
    // CREATE NEW VARIABLE STARTING AT UPLOADED REPO ROOT DIRECTORY
    const codeHierarchy = hierarchy.children[0];
    // console.log('total hierarchy: ', codeHierarchy);

    // CREATE THE SUPER STRUCTURE WITH TRAVERSEHIERARCHY FUNCTION
    superStructure = await traverseHierarchy(codeHierarchy, dcdata);
    // console.log('super structure: ',superStructure);

    // temp log of super structure
    const logFilePath = './super-structure.log';
    const logStream = fs.createWriteStream(logFilePath);
    logStream.write(JSON.stringify(superStructure, null, 2));

    return next();
  } catch (err) {
    return next({
      log: 'DataController.superStructure: ERROR: ' + err,
      message: { err: 'DataController.superStructure: ERROR: Check server logs for details' },
    })
  }
}



// FUNCTION TO BUILD HIERARCHY OF FILES
function buildHierarchy(filePath, level = 0) {

  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) {
    // IF FILE IS A DIRECTORY
    const files = fs.readdirSync(filePath);

    const children = files.map(file => buildHierarchy(path.join(filePath, file), level + 1)).filter(child => child); // Filter out null/undefined children

    return {
      name: path.basename(filePath),
      path: path.resolve(filePath),
      type: 'directory',
      children: children
    };
  } else {
    // IF FILE IS NOT A DIRECTORY
    return {
      name: path.basename(filePath),
      path: path.resolve(filePath),
      type: 'file'

    };
  }
  
}


// MAIN FUNCTION TO BUILD OUT SUPER STRUCTURE //
async function traverseHierarchy(node, dcdata) {
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
      newNode.children = await Promise.all(node.children.map(async child => await traverseHierarchy(child,dcdata)));
    } else {
  
      // CALL HELPER FUNCS TO GET DATA 
      const complexityAndLines = await getComplexityAndLinesOfCode(node.path);
      const size = await getFileSize(node.path);
      const dependentsAndDependencies = await getDependenciesAndDependents(node.path, dcdata)
      const nodeAst = await parseFileToAST(node.path);
 
      const dbData = await ASTDbQueryController.query2(nodeAst, node.path);
      const apiData = await ASTApiQueryController.queryFunc(nodeAst, node.path);
      // console.log('apiData here: ',apiData)
    
      newNode.info = {
        fileSize: size, 
        linesOfCode: complexityAndLines.linesOfCode,
        complexity: complexityAndLines.complexity,
        dependents: dependentsAndDependencies.dependents,
        dependencies: dependentsAndDependencies.dependencies, 
      };

      newNode.deepInfo = {
        orphan: dependentsAndDependencies.orphan,
        funcDecName: getASTFuncDecs(nodeAst),
        funcExpressions: getASTFuncExps(nodeAst),
        funcArrowExpressions: getASTArrowFuncExps(nodeAst),
        classDeclarations: getASTClassDecs(nodeAst),
        funcCallExpressions: getASTCallExps(nodeAst),
        memberExpressions: getASTMemberExps(nodeAst),
      }

      newNode.dbInfo = dbData;

      newNode.apiInfo = {
        totalInteractions: apiData.totalInteractions,
        details: getApiData(apiData)
      }
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

    resultArr.push(funcObj);
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

    console.log(node.body.body);
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



    resultArr.push(classObj);
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

    resultArr.push(callObj);
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
  apiData.forEach(el => {
    result.push({
      apiType: el.method,
      apiURL: el.url,
      typeOfCall: el.httpMethod
    })
  })
  return result;
}




// module.exports =  DataController;
export default DataController;
