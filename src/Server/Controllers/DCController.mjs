import { cruise } from "dependency-cruiser";
import fs from 'fs';
import path from 'path';

const DCController = {};

const cruiseOptions = {
  outputType: "json",
  exclude: "node_modules",
  doNotFollow: "node_modules",
  enhancedResolveOptions: {
    exportsFields: ['exports', 'module'],
    conditionNames: ['import', 'require', 'node', 'default'] 
  },
};

// ------ HELPER FUNC TO GET FILE HIERARCHY WITH DEPENDENCIES ----- //

function isFrontendFile(filePath) {
  return filePath.toLowerCase().includes("client") || filePath.toLowerCase().includes("frontend") || filePath.toLowerCase().includes("public") || filePath.toLowerCase().includes("src") || filePath.toLowerCase().includes("app") || filePath.toLowerCase().includes("ui") || filePath.toLowerCase().includes("view") || filePath.toLowerCase().includes("views") || filePath.toLowerCase().includes("assets") || filePath.toLowerCase().includes("components") || filePath.toLowerCase().includes("pages") || filePath.toLowerCase().includes("features");
}


function buildHierarchy(filePath, depResult, level = 0) {
  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) {
    const files = fs.readdirSync(filePath);

    const children = files.map(file => buildHierarchy(path.join(filePath, file), depResult, level + 1)).filter(child => child); // Filter out null/undefined children

    if (children.length === 0) {
      return null; // Skip empty directories
    }

    return {
      name: path.basename(filePath),
      children: children
    };
  } else {
    const dependencies = depResult.modules.filter(module => module.source === filePath).flatMap(module => {
      return module.dependencies.map(dependency => ({
        module: dependency.module,
        resolved: dependency.resolved,
        dependencyTypes: dependency.dependencyTypes,
        source: path.basename(dependency.resolved) // Use basename of the resolved dependency path as source
      }));
    });

    if (dependencies.length === 0) {
      return null; // Skip files with no dependencies
    }

    const isFrontend = isFrontendFile(filePath);

    return {
      name: path.basename(filePath),
      value: stat.size,
      color: "#167a23",// color of d3 nodes
      dependencies: dependencies
    };
  }
}


function printDirectoryTree(dir, depResult) {
  const hierarchy = buildHierarchy(dir, depResult);
  // console.log('hierarchy.dependencies:=====>',hierarchy)
  return hierarchy;
}

// ------- MIDDLEWARE FOR GETTING FILE HIERARCHY AND DEPENDENCIES ------- //

// DCController.getTree = (req, res, next) => {
//   try {
//     const uploadsPath = './src/Server/temp-file-upload';
//     const hierarchy = printDirectoryTree(uploadsPath, res.locals.depResult);
//     console.log('File Hierarchy with Dependencies:\n', hierarchy);
//     res.locals.hierarchy = hierarchy;
//     return next();
//   } catch (err) {
//     return next({
//       log: 'error in DCController.getTree',
//       message: err
//     })
//   }
// }

// ------- MIDDLEWARE TO INVOKE DEPENDENCY CRUISER AND ANALYZE DEPENDENCIES ------- //

DCController.analyze = async (req, res, next) => {
  try {
    console.log('in dccontroller.analyze');
    const uploadsPath = './src/Server/temp-file-upload';
    const depResult = await cruise([uploadsPath], cruiseOptions);
    // console.log('checking hereeeee:',JSON.stringify(JSON.parse(depResult.output), null, 2));

    const hierarchy = printDirectoryTree(uploadsPath, JSON.parse(depResult.output));
    // console.log('dc analyze output',hierarchy)
    res.locals.hierarchy = hierarchy;
    res.locals.depResult = JSON.parse(depResult.output);

    return next();
  } catch (err) {
    return next({
      log: 'error in DCController.analyze: ' + err,
      message: err
    });
  }
};

export default DCController;
