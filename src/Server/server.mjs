import express, { application } from 'express';
import cookieParser from 'cookie-parser';

const app = express();
const port = 3000;

// --- Importing Controllers --- //
import FileController from "./Controllers/FileController.cjs";
import DCController from "./Controllers/DCController.mjs";
import S3Controller from "./Controllers/S3Controller.mjs";
import DBController from "./Controllers/DBController.cjs";
import ASTParseController from "./Controllers/ASTParseController.mjs";
import ASTDbQueryController from "./Controllers/ASTDbQueryController.mjs";
import ASTApiQueryController from './Controllers/ASTApiQueryController.mjs';
import SessionController from "./Controllers/SessionController.cjs";
import DataController from "./Controllers/DataController.mjs";
import CohesionController from './Controllers/CohesionController.cjs';
import couplingController from './Controllers/CouplingController.mjs';
import SemanticController from './Controllers/SemanticController.cjs';
import FinalAnalysisController from './Controllers/FinalAnalysisController.cjs';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/checkSession', (req, res) => {
    if (req.cookies['temp-id']) return res.status(200).json({ authenticated: true }); 
    else return res.status(200).json({ authenticated: false });
});

app.post('/api/login', 
    DBController.verifyCredentials,
    SessionController.createCookie,
    (req, res) => {
        if (res.locals.uid) res.sendStatus(200);
        else res.sendStatus(404);
    }
);

app.post('/api/signup', 
    DBController.createUser,
    DBController.saveCreds,
    (req, res) => {
        res.sendStatus(200);
    }
);

app.post('/api/fileupload',
    FileController.upload,
    DCController.analyze,
    ASTParseController.parse,
    // ASTDbQueryController.query,
    // ASTApiQueryController.query,
    DataController.superStructure,
    couplingController.extractDetails,
    CohesionController.analyzeCohesion,
    // SemanticController.analyzeSemantics,
    FinalAnalysisController.analyze,
    FileController.deleteDir,
    
    // S3Controller.upload,
    (req, res) => {
        // console.log(res.locals.parsedFiles);
        // const firstObject = res.locals.parsedFiles[3];
        // const astOfFirsObject = firstObject.ast;
        // console.log(astOfFirsObject);
        res.status(200).send(res.locals)
    }
);

app.get('/api/signout',
    SessionController.deleteCookie,
    (req, res) => {
        res.redirect('/').sendStatus(200);
    }
);



app.get('/', (req, res) => {
    res.status(200).send('hello');
});

app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log('Server error occured: ', errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });