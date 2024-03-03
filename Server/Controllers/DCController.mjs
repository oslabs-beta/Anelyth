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

// ------ HELPER FUNC TO GET FILE HEIRARCHY ----- //

function buildHierarchy(filePath, level = 0) {
  const stat = fs.statSync(filePath);
  console.log('stat in buildHierarchy:', stat)

  let count = 1;

  if (stat.isDirectory()) {
    const files = fs.readdirSync(filePath);
    console.log('readdirSync output in buildHierarchy:', files)

    return {
      name: path.basename(filePath),
      children: files.map(file => buildHierarchy(path.join(filePath, file), level + 1))
    };
  } else {
    // return {
    //   name: path.basename(filePath),
    //   value: 1 
    // };
    const fileObject =  {
      name: path.basename(filePath),
      value: count
    };
    count++;
    return fileObject;
  }
}

//unnecessary level of abstraction
// function printDirectoryTree(dir) {
//   const hierarchy = buildHierarchy(dir);
//   return hierarchy;
// }


// ------ MIDDLEWARE FOR GETTING FILE HEIARCHY ------- //
DCController.getTree = (req,res, next) => {
  try {
    const uploadsPath = './Server/temp-file-upload';
    const hierarchy = buildHierarchy(uploadsPath);
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
    const outputObject = JSON.parse(depResult.output);
    // console.log('before filter: ', JSON.stringify(JSON.parse(depResult.output), null, 2));
    console.log('before filter: ', outputObject.modules);


    const options = {
      coreModule: false,
      dynamic: true
    };
    console.log('after filter: ', filterModulesRecursively(outputObject.modules, options));


    // LOG TREE
    const hierarchy = buildHierarchy(uploadsPath);
    console.log('File Hierarchy:\n', hierarchy.children);
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



function filterModulesRecursively(modules, options) {
  return modules.filter(module => {
    let keep = true; 

    for (let key in module) {
      if (Array.isArray(module[key])) {
        module[key] = filterModulesRecursively(module[key], options);
      } else {
        if (module.hasOwnProperty(key) && options.hasOwnProperty(key)) {
          if (options[key] !== module[key]) {
            keep = false; 
            break; 
          }
        }
      }
    }
    return keep;
  });
}








export default DCController;