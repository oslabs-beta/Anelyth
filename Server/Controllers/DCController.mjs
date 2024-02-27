import { cruise, } from "dependency-cruiser";
import fs from 'fs';
import path from 'path';

const DCController = {};

const cruiseOptions = {
  outputType: "json",
  exclude: "node_modules",
  doNotFollow: "node_modules",
};

function printDirectoryTree(dir, level = 0) {
  // EMPTY STRING FOR TREE BUILD
  let tree = "";
  // GET FILES IN CURRENT DIRECTORY
  const files = fs.readdirSync(dir);
  // LOOP DA DOOP
  files.forEach(file => {
    // GET FILE PATH BY COMBINING CURRENT DIRECTORY AND FILE
    const filePath = path.join(dir, file);
    // GET FILE STAT - IS IT A DIRECTORY OR A FILE?
    const stat = fs.statSync(filePath);
    // EACH LEVEL OF DEPTH GETS TWO SPACES
    tree += ' '.repeat(level * 2) + file + '\n';
    // RECURSIVE CALL TO PRINT DIRECTORY TREE IF IT IS A DIRECTORY
    if (stat.isDirectory()) {
      tree += printDirectoryTree(filePath, level + 1);
    }
  });
  return tree;
}

DCController.analyze = async (req, res, next) => {
  try {
    console.log('in dccontroller.analyze');
    // CRUISE PASSING IN OPTIONS
    const depResult = await cruise(['./Server'], cruiseOptions);
    let depData = JSON.parse(depResult.output);
    

    console.log(depData.modules);
    // LOG OUTPUT
    // console.log(JSON.stringify(JSON.parse(depResult.output), null, 2));
    // LOG TREE
    const hierarchy = printDirectoryTree('./Server');
    console.log('File Hierarchy:\n', hierarchy);

    return next();
  } catch (err) {
    return next(err);
  }
};

export default DCController;