import fs from "fs";

import path from "path";

const couplingController = {};

couplingController.extractDetails = (req, res, next) => {
  console.log("\x1b[36m%s\x1b[0m", "In the coupling controller......");

  const __dirname = path.dirname(new URL(import.meta.url).pathname);

  const filePath = path.resolve(__dirname, "../../../super-structure.log");

  let SuperStructure = {};

  try {
    console.log(
      "\x1b[36m%s\x1b[0m",
      "Reading the super structure log file......"
    );

    const fileContent = fs.readFileSync(filePath, "utf8");

    SuperStructure = JSON.parse(fileContent);
  } catch (error) {
    console.error("Failed to read or parse the super-structure.log:", error);
  }

  let detailsArray = [];

  function traverseHierarchy(node) {
    if (node.type === "file" && node.info) {
      const fileName = node.path.split("/").pop();

      const fileDetails = {
        fileName: fileName,

        apiDetails: [],

        dbDetails: [],

        moduleDetails: [],

        funcDecNames: [],

        varDecNames: [],

        dependencyCount: 0,
      };

      // Process dependencies

      if (node.info.dependencies) {
        const validDependencies = node.info.dependencies.filter(
          (dep) => !dep.couldNotResolve && dep.resolved.includes("/")
        );

        fileDetails.dependencyCount = validDependencies.length;

        validDependencies.forEach((dep) => {
          fileDetails.moduleDetails.push({ module: dep.resolved });
        });
      }

      // Extract API interaction details

      if (node.apiInfo && Array.isArray(node.apiInfo.details) && node.apiInfo.details.length > 0) {
        node.apiInfo.details.forEach((detail) => {
          fileDetails.apiDetails.push(detail);
        });
      }


      // Extract DB interaction details
      if (node.dbInfo && node.dbInfo.length > 0) {
        node.dbInfo.forEach((dbEntry) => {
          if (dbEntry.dbInteraction) {
            fileDetails.dbDetails.push(
              dbEntry
            );
          }
        });
      }

      if (node.deepInfo.funcDecName.length > 0) {
        fileDetails.funcDecNames = node.deepInfo.funcDecName;
      }

      if (node.deepInfo.variableDecNames.length > 0) {
        fileDetails.varDecNames = node.deepInfo.variableDecNames;
      }

      detailsArray.push(fileDetails);
    } else if (node.type === "directory") {
      node.children.forEach(traverseHierarchy);
    }
  }

  try {
    traverseHierarchy(SuperStructure);

    // Filter out files with .json and .md extensions

    detailsArray = detailsArray.filter(
      (file) =>
        !(file.fileName.endsWith(".json") || file.fileName.endsWith(".md"))
    );

    // Write the output to a file

    fs.writeFileSync(
      "structure_for_ross.log",
      JSON.stringify(detailsArray, null, 2)
    );

    detailsArray.sort((a, b) => a.dependencyCount - b.dependencyCount);
    //pass the result down to the middleware chain
    res.locals.detailsArray = detailsArray;
  } catch (error) {
    console.error("Error processing structure data:", error);

    return next(error); // Pass the error to the next middleware (which could be an error handler)
  }

  return next();
};

/*[

{fileName: ‘file1’, apiDetails: [{url: ‘endpoint1’}, {url: ‘endpoint2’}], dbDetails: [{keyword: ‘mongoose’}, {keyword: ‘model’}], moduleDetails: [{module: ‘./models.js’}]},

{fileName: ‘file2’, apiDetails: [{url: ‘endpoint1’}, {url: ‘endpoint2’}, {url: ‘endpoint3’}], dbDetails: [{keyword: ‘mongoose’}], moduleDetails: [{module: ‘./controllers/controller1.js’}]},

{fileName: ‘file5’, apiDetails: [{url: ‘endpoint6’}], dbDetails: [], moduleDetails: [{module: ‘./routes.js’}, {module: ‘./controllers/controllers2.js’}]},

{fileName: ‘file3’, apiDetails: [{url: ‘endpoint1’}, {url: ‘endpoint4’}], dbDetails: [], moduleDetails: [{module: ‘./module1.js’}, {module: ‘./controllers/controllers2.js’}]},

{fileName: ‘file4’, apiDetails: [{url: ‘endpoint3’}], dbDetails: [], moduleDetails: [{module: ‘./module1.js’}]}

];

*/

export default couplingController;
