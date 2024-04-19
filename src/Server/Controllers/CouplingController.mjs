import fs from "fs";

import path from "path";

const couplingController = {};


couplingController.extractDetails = (req, res, next) => {
  console.log("In extract details middleware!!!");

  const __dirname = path.dirname(new URL(import.meta.url).pathname);

const filePath = path.resolve(__dirname, "../../../super-structure.log");

let SuperStructure = {};

try {
  console.log("READING SUPER STRUCTURE!!");

  const fileContent = fs.readFileSync(filePath, "utf8");

  SuperStructure = JSON.parse(fileContent);
} catch (error) {
  console.error("Failed to read or parse the super-structure.log:", error);

  // Handle the error appropriately in your application context
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

      if (node.apiInfo && node.apiInfo.details.length > 0) {
        node.apiInfo.details.forEach((detail) => {
          fileDetails.apiDetails.push({ url: detail.url });
        });
      }

      // Extract DB interaction details

      if (node.dbInfo && node.dbInfo.length > 0) {
        node.dbInfo.forEach((dbEntry) => {
          if (dbEntry.dbInteraction && dbEntry.details) {
            const keywords = new Set(); // Use a Set to avoid duplicate keywords

            dbEntry.details.forEach((detail) => {
              keywords.add(detail.keyword);
            });

            keywords.forEach((keyword) => {
              fileDetails.dbDetails.push({ keyword });
            });
          }
        });
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
