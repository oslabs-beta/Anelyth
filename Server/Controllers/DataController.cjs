
const escomplex = require('escomplex');
const path = require('path');
const fs = require('fs');
const babel = require('@babel/core');


const DataController = {};

// ------- MIDDLEWARE FOR CREATING SUPER STRUCTURE ------- //
DataController.superStructure = async (req, res, next) => {
  try{
    console.log('in DataController.superStructure')

    let superStructure = {};
    
    const filePath = path.resolve(__dirname, '../temp-file-upload');

    // SAVE RESULT OF BUILDHIERARCHY TO VARIABLE
    const hierarchy = await buildHierarchy(filePath, level = 0);
    // CREATE NEW VARIABLE STARTING AT UPLOADED REPO ROOT DIRECTORY
    const codeHierarchy = hierarchy.children[0];
    // console.log('total hierarchy: ', codeHierarchy);

    superStructure = await traverseHierarchy(codeHierarchy);
    console.log('super structure: ',superStructure);
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


// ------- MIDDLEWARE FOR GETTING COMPLEXITY AND LINES OF CODE ------- //
// -- only works on .js, .jsx, .cjs, and .mjs files -- //
DataController.complexity = async (req, res, next) => {
  try{
    // SET THE FILE WE WANT TO ANALYZE ((--- HARD CODED FOR NOW ---))
    const path1 = path.resolve(__dirname, '../../package.json');
    // READ THE FILE AND SAVE TO VARIABLE
    const code1 = fs.readFileSync(path1, 'utf8');

    // TRANSFORM THE FILE USING BABEL SO ESCOMPLEX CAN ANALYZE IT
    const transformed = babel.transformSync(code1, {filename: path1, presets: ['@babel/preset-react', '@babel/preset-env', '@babel/preset-typescript']})
    // ANALYZE THE TRANSFORMED CODE WITH ESCOMPLEX
    const result = await escomplex.analyse(transformed.code);

    // GET THE LINES OF CODE AND CYCLOMATIC COMPLEXITY
    const linesOfCode = result.aggregate.sloc.logical;
    const complexity = result.aggregate.cyclomatic;

    // CONSOLE LOG THE RESULTS
    console.log('results of esxcomplex analysis: ', result)

    return next();
  } catch (err) {
    return next({
      log: 'DataController.complexity: ERROR: ' + err,
      message: { err: 'DataController.complexity: ERROR: Check server logs for details' },
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

// FUNCTION TO TRAVERSE OVER HIERARCHY
// function traverseHierarchy(node) {
//   if (!node) {
//     return null;
//   }

//   if (node.name.endsWith('.json') || node.name.endsWith('.md') || node.name.endsWith('.html') || node.name.endsWith('.jpg') || node.name.endsWith('.jpeg') || node.name.endsWith('.png')) {
//     return {
//       name: node.name,
//       type: 'file',
//       path: node.path,
//     }
//   }

//   const newNode = {
//     name: node.name,
//     type: node.children ? 'directory' : 'file', // Determine if the node represents a directory or a file
//     path: node.path,
//     children: []
//   };

//   if (node.children) {
//     newNode.children = node.children.map(child => traverseHierarchy(child)).filter(child => child !== null);
//   } else {
//     newNode.info = {
//       fileSize: 'test',
//       linesOfCode: getComplexityAndLinesOfCode(node.path).linesOfCode,
//       complexity: getComplexityAndLinesOfCode(node.path).complexity,
//       dependents: 'test',
//       dependencies: 'test', 
//     }
//     newNode.deepInfo = {
//       circularDependencies: 'test',
//       orphan: 'teset',
//       funcDecName: {
//         arguments: ['test'],
//         returnValues: 'test',
//         calle: 'test',
//         orphan: 'test',
//       },
//       funcExpName: {
//         arguments: ['test'],
//         returnValues: 'test',
//         calle: 'test',
//         orphan: 'test',
//       },
//       classDecName: 'test',
//       classDecValue: 'test',
//       memberExpObjName: 'test',
//       memberExpPropName: 'test',
//     }
//     newNode.dbInfo = {
//       dbType: 'test',
//       dbQuery: 'test',
//       dbQueryType: 'test',
//       dbQueryValue: 'test',
//       dbQueryReturn: 'test',
//     }
//     newNode.apiInfo = {
//       apiType: 'test',
//       apiEndpoint: 'test',
//       apiMethod: 'test',
//       apiRequest: 'test',
//     }
//   }

//   return newNode;
// }


async function traverseHierarchy(node) {
  if (!node) {
    return null;
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
    newNode.children = await Promise.all(node.children.map(async child => await traverseHierarchy(child)));
  } else {
    const complexityAndLines = await getComplexityAndLinesOfCode(node.path);
    newNode.info = {
      fileSize: 'test', 
      linesOfCode: complexityAndLines.linesOfCode,
      complexity: complexityAndLines.complexity,
      dependents: 'test',
      dependencies: 'test', 
    };
    newNode.deepInfo = {
            circularDependencies: 'test',
            orphan: 'teset',
            funcDecName: {
              arguments: ['test'],
              returnValues: 'test',
              calle: 'test',
              orphan: 'test',
            },
            funcExpName: {
              arguments: ['test'],
              returnValues: 'test',
              calle: 'test',
              orphan: 'test',
            },
            classDecName: 'test',
            classDecValue: 'test',
            memberExpObjName: 'test',
            memberExpPropName: 'test',
          }
          newNode.dbInfo = {
            dbType: 'test',
            dbQuery: 'test',
            dbQueryType: 'test',
            dbQueryValue: 'test',
            dbQueryReturn: 'test',
          }
          newNode.apiInfo = {
            apiType: 'test',
            apiEndpoint: 'test',
            apiMethod: 'test',
            apiRequest: 'test',
          }
  }

  return newNode;
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

module.exports =  DataController;