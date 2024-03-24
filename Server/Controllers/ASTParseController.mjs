import fs from 'fs';
import path from 'path';
import { Parser } from 'acorn';
import jsx from 'acorn-jsx';



const ASTParseController = {};



// -------- CHECK IF FILE IS FRONTEND FILE -------- //

function isFrontendFile(filePath) {
  return filePath.toLowerCase().includes("client") || 
         filePath.toLowerCase().includes("frontend") || 
         filePath.toLowerCase().includes("public") || 
        //  filePath.toLowerCase().includes("src") || 
         filePath.toLowerCase().includes("config") ||  
         filePath.toLowerCase().includes("app") || 
         filePath.toLowerCase().includes("ui") || 
         filePath.toLowerCase().includes("view") || 
         filePath.toLowerCase().includes("views") || 
         filePath.toLowerCase().includes("assets") || 
         filePath.toLowerCase().includes("components") || 
         filePath.toLowerCase().includes("pages") || 
         filePath.toLowerCase().includes("features");
        // ADD ANY OTHER FRONTEND KEYWORDS
}

// -------- PARSE FILE TO AST -------- //

const parseFileToAST = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, script) => {
      if (err) {
        reject(err);
      } else {
        try {
          const acornParser = Parser.extend(jsx());
          const ast = acornParser.parse(script, {
            sourceType: 'module',
            ecmaVersion: 'latest',
            locations: true
          });
          resolve(ast);
        } catch (parseErr) {
          reject(parseErr);
        }
      }
    });
  });
};


// -------- PARSE CONTROLLER -------- //

ASTParseController.parse = async (req, res, next) => {
  try {
    // Check if uploads directory exists
    const uploadsPath = './Server/temp-file-upload';
    if (!fs.existsSync(uploadsPath)) {
      throw new Error(`Directory ${uploadsPath} does not exist.`);
    }

    const backendFilePaths = []; // Array for backend file paths

    // Function to traverse and parse files
    const traverseAndParse = async (dirPath) => {
      const asts = [];
      const files = await fs.promises.readdir(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = await fs.promises.stat(filePath);

        if (stat.isDirectory()) {
          const subAsts = await traverseAndParse(filePath);
          asts.push(...subAsts);
        } else if (path.extname(filePath).toLowerCase() === '.js' && !isFrontendFile(filePath)) {
          backendFilePaths.push(filePath); // Add to backend file paths
          try {
            const ast = await parseFileToAST(filePath);
            asts.push({ filePath, ast });
          } catch (parseErr) {
            console.error(`Error parsing file ${filePath}:`, parseErr);
          }
        }
      }

      return asts;
    };

    // Get all parsed files
    const parsedFiles = await traverseAndParse(uploadsPath);

    // Filter parsedFiles to include only backend files
    const backendFileASTs = parsedFiles.filter(file => backendFilePaths.includes(file.filePath));

    // Attach filtered ASTs to res.locals
    res.locals.backendFileASTs = backendFileASTs;

    console.log("Backend Files in AST-Parse-Controller:", backendFilePaths);




    // ------------ WRITE AST TO LOG FILE ------------ //

    const logFilePath = './AST-parsing.log';
    const logStream = fs.createWriteStream(logFilePath);

    logStream.on('error', (error) => {
      console.error('Error writing to log file:', error);
    });

    parsedFiles.forEach(({ filePath, ast }) => {
      logStream.write(`Parsed file: ${filePath}\n`);
      logStream.write(`AST: ${JSON.stringify(ast, null, 2)}\n\n`);
    });

    logStream.end();

    logStream.on('finish', () => {
      console.log('Finished writing to log file');
    });

    // ------- CALL NEXT MIDDLEWARE ------- //
    next();
  } catch (err) {
    console.error('Error in ASTController.parse:', err);
    return next({
      log: 'error in ASTController.parse',
      message: err,
    });
  }
};



export default ASTParseController;