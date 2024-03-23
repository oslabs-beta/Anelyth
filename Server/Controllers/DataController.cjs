const escomplex = require('escomplex');
const path = require('path');
const fs = require('fs');
const babel = require('@babel/core');


const DataController = {};


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





module.exports =  DataController;