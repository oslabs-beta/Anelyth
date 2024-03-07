import { parseScript } from 'esprima';
import fs from 'fs';
import path from 'path';

const ASTController = {};


ASTController.analyze = (req, res, next) => {
  try {
    const uploadsPath = './Server/temp-file-upload';

    // FUNCTION PARSE INTO AST
    const parseFileToAST = (filePath) => {
      const script = fs.readFileSync(filePath, 'utf8');
      return parseScript(script);
    };

    // Function to traverse the directory recursively and parse JavaScript files
    const traverseAndParse = (dirPath) => {
      const asts = [];

      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Recursively traverse subdirectories
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

    // Redirect AST data to a log file
    const logStream = fs.createWriteStream('./AST-parsing.log', { flags: 'a' });

    // Traverse the directory and parse JavaScript files
    const parsedFiles = traverseAndParse(uploadsPath);

    // Log the AST data to the log file
    parsedFiles.forEach(({ filePath, ast }) => {
      logStream.write(`Parsed file: ${filePath}\n`);
      logStream.write(`AST:\n${JSON.stringify(ast, null, 2)}\n\n`);
    });

    // Close the log stream after all logging operations are done
    logStream.end();

    // Assign parsedFiles to res.locals.parsedFiles
    res.locals.parsedFiles = parsedFiles;

    // Move to the next middleware
    next();
  } catch (err) {
    return next({
      log: 'error in ASTController.analyze',
      message: err,
    });
  }
};

export default ASTController;
