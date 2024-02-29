import { cruise, } from "dependency-cruiser";
import fs from 'fs';
import path from 'path';

const DCController = {};

const cruiseOptions = {
  outputType: "json",
  exclude: "node_modules",
  doNotFollow: "node_modules",
};

// --------------- WORKING CODE FOR LOCAL STORAGE OF UPLOADED FILES --------------- //

// ------ HELPER FUNC TO GET FILE HEIARCHY ----- //
// function printDirectoryTree(dir, level = 0) {
//   // EMPTY STRING FOR TREE BUILD
//   let tree = "";
//   // GET FILES IN CURRENT DIRECTORY
//   const files = fs.readdirSync(dir);
//   console.log('files in printDirectoryTree',files)
//   // LOOP DA DOOP
//   files.forEach(file => {
//     // GET FILE PATH BY COMBINING CURRENT DIRECTORY AND FILE
//     const filePath = path.join(dir, file);
//     // GET FILE STAT - IS IT A DIRECTORY OR A FILE?
//     const stat = fs.statSync(filePath);
//     // EACH LEVEL OF DEPTH GETS TWO SPACES
//     tree += ' '.repeat(level * 2) + file + '\n';
//     // RECURSIVE CALL TO PRINT DIRECTORY TREE IF IT IS A DIRECTORY
//     if (stat.isDirectory()) {
//       tree += printDirectoryTree(filePath, level + 1);
//     }
//   });
//   return tree;
// }

function buildHierarchy(filePath, level = 0) {
  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) {
    const files = fs.readdirSync(filePath);

    return {
      name: path.basename(filePath),
      children: files.map(file => buildHierarchy(path.join(filePath, file), level + 1))
    };
  } else {
    return {
      name: path.basename(filePath),
      value: 1 // assign any meaningful value based on your requirements
    };
  }
}

function printDirectoryTree(dir) {
  const hierarchy = buildHierarchy(dir);
  return hierarchy;
}




// ------ MIDDLEWARE FOR GETTING FILE HEIARCHY ------- //
DCController.getTree = (req,res, next) => {
  try {
    const uploadsPath = './Server/temp-file-upload';
    const hierarchy = printDirectoryTree(uploadsPath);
    console.log('File Hierarchy:\n', hierarchy);
  } catch (err) {
    return next({
      log: 'error in DCController.getTree',
      message: err
    })
  }
}

// ------- MIDDLEWARE TO INVOKE DEPENDENCY CRUISER --------- //
DCController.analyze = async (req, res, next) => {
  try {
    console.log('in dccontroller.analyze');
    // CRUISE PASSING IN OPTIONS
    const uploadsPath = './Server/temp-file-upload';
    const depResult = await cruise([uploadsPath], cruiseOptions);
    // LOG OUTPUT
    console.log(JSON.stringify(JSON.parse(depResult.output), null, 2));
    // LOG TREE
    const hierarchy = printDirectoryTree(uploadsPath);
    console.log('File Hierarchy:\n', hierarchy.children[0]);
    console.log('depResult:', depResult)
    res.locals.depResult = depResult
    res.locals.hierarchy = hierarchy
    return next();
  } catch (err) {
    return next({
      log: 'error in DCController.analyze',
      message: err
    });
  }
};






export default DCController;