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

  if (stat.isDirectory()) {
    const files = fs.readdirSync(filePath);

    return {
      name: path.basename(filePath),
      children: files.map(file => buildHierarchy(path.join(filePath, file), level + 1))
    };
  } else {
    return {
      name: path.basename(filePath),
      value: 1 
    };
  }
}

//unnecessary level of abstraction
// function printDirectoryTree(dir) {
//   const hierarchy = buildHierarchy(dir);
//   return hierarchy;
// }


// ------ MIDDLEWARE FOR GETTING FILE HEIARCHY ------- //
// DCController.getTree = (req,res, next) => {
//   try {
//     const uploadsPath = './Server/temp-file-upload';
//     const hierarchy = buildHierarchy(uploadsPath);
//     console.log('File Hierarchy:\n', hierarchy);
//   } catch (err) {
//     return next({
//       log: 'error in DCController.getTree',
//       message: err
//     })
//   }
// }

// ------- MIDDLEWARE TO INVOKE DEPENDENCY CRUISER --------- //
DCController.analyze = async (req, res, next) => {
  try {
    console.log('in dccontroller.analyze');

    // CRUISE PASSING IN OPTIONS
    const uploadsPath = './Server/temp-file-upload';
    let depResult = await cruise([uploadsPath], cruiseOptions);
    const output = JSON.parse(depResult.output);

    //DECLARE OPTIONS FOR FILTERING
    // const options = {
    //   coreModule: false
    // };

    // const propsToKeep = [
    //   "source",
    //   "dependencies",
    //   "dependents",
    //   "orphan",
    //   "module",
    //   "dependencyTypes",
    //   "resolved",
    //   "circular"
    // ];

    // LOG OUTPUT BEFORE AND AFTER FILTER
    // console.log('before filter: ', JSON.stringify(output, null, 2));
    // depResult = filterRecursively(output, options, propsToKeep);
    // console.log('after filter: ', JSON.stringify(depResult, null, 2));

    // LOG TREE
    const hierarchy = buildHierarchy(uploadsPath);
    // console.log('File Hierarchy:\n', hierarchy.children);
    // console.log('depResult:', depResult)

    res.locals.depResult = depResult;
    res.locals.hierarchy = hierarchy;
    console.log ('This is the depResult', output);
    console.log ("This is the hierarchy result", hierarchy);
    console.log ("Example dependency object", output.modules[20]);
    
    return next();
  } catch (err) {
    return next({
      log: 'error in DCController.analyze',
      message: err
    });
  }
};


//options lets you filter based on key value pairs
//props lets you choose which properties to keep
//input: DC object, object of options, array of properties to keep
//output: filtered object
// function filterRecursively(depCruiserObj, options, props) {
//   const modules = depCruiserObj.modules;
//   const summary = depCruiserObj.summary;

//   const filteredModules = filterOptions(modules, options);
//   const modulesPropsRemoved = removeProperties(filteredModules, props);

//   return (
//     {
//       "modules": modulesPropsRemoved,
//       "summary": summary
//     }
//   );

//   //modules is an array, props is an array
//   function removeProperties(modules, props) {
//     return modules.map(module => {
//       if (typeof module === 'string') return module;

//       const obj = {};
//       for (let i = 0; i < props.length; i++){
//         const prop = props[i];
//         if (module.hasOwnProperty(prop)) {
//           if (Array.isArray(module[prop])) {
//             obj[prop] = removeProperties(module[prop], props);
//           } else {
//             obj[prop] = module[prop];
//           }
//         }
//       }
//       return obj;
//     });
//   }

//   //modules is an array, options is an object
//   function filterOptions(modules, options) {
//     return modules.filter(module => {
//       let keep = true; 

//       for (let key in module) {
//         if (Array.isArray(module[key])) {
//           module[key] = filterOptions(module[key], options);
//         } else {
//           if (module.hasOwnProperty(key) && options.hasOwnProperty(key)) {
//             if (options[key] !== module[key]) {
//               keep = false; 
//               break; 
//             }
//           }
//         }
//       }
//       return keep;
//     });
//   }
// }

export default DCController;

