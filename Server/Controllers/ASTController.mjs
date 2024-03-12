import { parseScript } from 'esprima';
import fs from 'fs';
import path from 'path';
import esquery from 'esquery';

const ASTController = {};


//PARSE INTO AST

ASTController.parse = (req, res, next) => {
  try {
    const uploadsPath = './Server/temp-file-upload';

    // FUNCTION PARSE INTO AST
    const parseFileToAST = (filePath) => {
      const script = fs.readFileSync(filePath, 'utf8');
      return parseScript(script);
    };

    // RECURSIVELY TRAVERSE DIRECTORY AND PARSE JAVASCRIPT FILES
    const traverseAndParse = (dirPath) => {
      const asts = [];

      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // SUBDIRECTORIES
          const subAsts = traverseAndParse(filePath);
          asts.push(...subAsts);
        } else if (path.extname(filePath).toLowerCase() === '.js') {
          // Parse JavaScript files
          const ast = parseFileToAST(filePath);
          asts.push({ filePath, ast });
        } else {
          // Skip files with other extensions
        }
      });

      return asts;
    };

    // CREATE LOG FILE
    const logStream = fs.createWriteStream('./AST-parsing.log', { flags: 'a' });

    // TRAVERSE AND PARSE FILES
    const parsedFiles = traverseAndParse(uploadsPath);

    // DATA TO LOG W/ FORMATTING
    parsedFiles.forEach(({ filePath, ast }) => {
      logStream.write(`Parsed file: ${filePath}\n`);
      logStream.write(`AST:\n${JSON.stringify(ast, null, 2)}\n\n`);
    });

    // CLOSE LOG STREAM
    logStream.end();

    res.locals.parsedFiles = parsedFiles;

    next();
  } catch (err) {
    return next({
      log: 'error in ASTController.analyze',
      message: err,
    });
  }
};


//FUNCTIONS TO ANALYZE AST

// function analyzeCohesion(fileAst) {

//   const functionDeclarations = esquery.query(fileAst, 'FunctionDeclaration');
//   const functionExpressions = esquery.query(fileAst, 'FunctionExpression');

//   const functionCount = functionDeclarations.length + functionExpressions.length;

//   return functionCount;
// }

// function analyzeDatabaseInteractions(fileAst) {

//   const requireExpressions = esquery.query(fileAst, 'CallExpression[callee.name="require"]');

//   const mongooseRequireCount = requireExpressions.filter(expr => 
//     expr.arguments.some(arg => 
//       arg.type === 'Literal' && arg.value.includes('mongoose')
//     )
//   ).length;

//   return mongooseRequireCount;
// }



// QUERIES FOR AST

ASTController.query = (req, res, next) => {
  try {
    console.log(res.locals.parsedFiles)
    const { parsedFiles } = res.locals;

    parsedFiles.forEach((fileObject) => {
      const ast = fileObject.ast;
      const filePath = fileObject.filePath;

    //COMMONJS EXPORTS
    function findModuleExportsNames(ast, filePath) {
    // Query for direct assignments to module.exports
    const moduleExportsStatements = esquery.query(ast, 'AssignmentExpression[left.object.name="module"][left.property.name="exports"]');
              
      const moduleExportsNames = moduleExportsStatements.map(statement => {
        if (statement.right.type === 'Identifier') {
            return statement.right.name;
        } else if (statement.right.type === 'FunctionExpression' || statement.right.type === 'ArrowFunctionExpression') {
            return 'anonymous function';
        } else {
            return 'complex export';
              }
            });
              return moduleExportsNames;
          }

      // QUERIES FOR ASTs

      //DEPENDENCIES / DEPENDENTS

      // IMPORTS
      // ES6 IMPORT STATEMENTS
      const importStatements = esquery.query(ast, 'ImportDeclaration');
      const imports = importStatements.map(node => node.source.value);
      console.log(`Findsing imports...[${filePath}]:`, imports);

      //COMMONJS REQUIRE STATEMENTS
      const requireStatements = esquery.query(ast, 'CallExpression[callee.name="require"]');
      const requires = requireStatements.map(node => node.arguments[0].value);
      console.log(`Finding requires...[${filePath}]:`, requires);

      // EXPORTS
      const exportStatements = esquery.query(ast, 'ExportNamedDeclaration, ExportDefaultDeclaration');
      const exports = exportStatements.map(node => node.declaration ? node.declaration.id?.name : 'anonymous');
      console.log(`Finding exports...[${filePath}]:`, exports);

      const moduleExportsNames = findModuleExportsNames(ast, filePath);
      console.log(`Finding module exports...[${filePath}]:`, moduleExportsNames);



      
      
      // VARIABLES
      // const variableDeclarations = esquery.query(ast, 'VariableDeclaration');
      // console.log(`Finding variable declarations...[${filePath}]`);
      // const variableNames = variableDeclarations.flatMap((node) => node.declarations.map((declaration) => declaration.id.name));
      // console.log(variableNames);

      // FUNCTIONS
      const functionDeclarations = esquery.query(ast, 'FunctionDeclaration');
      // console.log(`Finding function declarations...[${filePath}]`);
      const functionNames = functionDeclarations.map((node) => node.id.name);
      // console.log(functionNames);

      // CLASSES
      // const classDeclarations = esquery.query(ast, 'ClassDeclaration');
      // console.log(`Finding class declarations...[${filePath}]`);
      // const classNames = classDeclarations.map((node) => node.id.name);
      // console.log(classNames);

      // FUNCTION EXPRESSIONS
      // const functionExpressions = esquery.query(ast, 'FunctionExpression');
      // console.log(`Finding function expressions...[${filePath}]`);
      // const functionExpressionNames = functionExpressions.map(node => node.id ? node.id.name : 'anonymous');
      // console.log(functionExpressionNames);

      // ARROW FUNCTIONS
      // const callExpressions = esquery.query(ast, 'CallExpression');
      // console.log(`Finding call expressions...[${filePath}]`);
      // const callExpressionDetails = callExpressions.map(node => {
      //   if (node.callee.type === 'Identifier') {
      //     return node.callee.name;
      //   } else if (node.callee.type === 'MemberExpression' && node.callee.property) {
      //     return node.callee.property.name;
      //   } else {
      //     return 'complex or anonymous function/method call';
      //   }
      // });
      // console.log(callExpressionDetails);

      // MEMBER EXPRESSIONS
      // const memberExpressions = esquery.query(ast, 'MemberExpression');
      // console.log(`Finding member expressions...[${filePath}]`);
      // const memberExpressionDetails = memberExpressions.map(node => {
      //   return node.property.name || 'anonymous property';
      // });
      // console.log(memberExpressionDetails);





      // Additional analysis for microservice boundaries
      // const hasHighCohesion = analyzeCohesion(ast);
      // console.log(`Has high cohesion: ${hasHighCohesion}`);
      // const hasSignificantDBInteractions = analyzeDatabaseInteractions(ast);
      // console.log(`Has significant DB interactions: ${hasSignificantDBInteractions}`);
    });

    console.log('Potential Microservices:', potentialMicroservices);
    res.locals.potentialMicroservices = potentialMicroservices;


    next ();
} catch (err) {
    return next({
      log: 'error in ASTController.query',
      message: err,
    });
  }
}

export default ASTController;


