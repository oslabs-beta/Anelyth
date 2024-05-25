import fs from 'fs';
import { ImportedApiAnalyzer, NativeApiAnalyzer } from '../utils/ApiAnalyzer.mjs';
import chalk from 'chalk';

const AstApiQueryController2 = {};

// --------------- CHECK API FUNCTION --------------- //

AstApiQueryController2.queryFunc = (nodeAST, nodePath) => {
  console.log('\n');
  console.log('Inside AstApiQueryController2.queryFunc')
  console.log(chalk.blue(`analyzing file path ${nodePath}`));

  try {
    // const stream = fs.createWriteStream('./api-query-testing-nodes.log', {flags: 'a'});
    const nativeApiAnalyzer = new NativeApiAnalyzer(nodeAST, nodePath);
    nativeApiAnalyzer.setApiNodeMatches(['fetch']);
    const nativeApiDetails = nativeApiAnalyzer.getApiDetails();
    const importedApiAnalyzer = new ImportedApiAnalyzer(nodeAST, nodePath);
    importedApiAnalyzer.setApiNodeMatches(['axios']);
    const importedApiDetails = importedApiAnalyzer.getApiDetails();
    const details = [...nativeApiDetails, ...importedApiDetails];
    // stream.write(JSON.stringify(result, null, 2));
    // stream.end();
    if (details.length === 0) {
      return ({
        filePath: nodePath,
        totalInteractions: 0,
        details: []
      });
    } else {
      console.log(`\x1b[35mInside Fetch API Extended Analysis`);
    
      let totalInteractions = 0;
      details.forEach(({ numInteractions }) => {
        totalInteractions += numInteractions;
      });

      const stream = fs.createWriteStream('./api-query-testing.log', {flags: 'a'});
    
      const fileDetails = {
        filePath: nodePath,
        totalInteractions,
        details
      };
    
      stream.write(JSON.stringify(fileDetails, null, 2));
      stream.end();
    
      return fileDetails;
    }
  } catch (err) {
    console.error(chalk.red(`Error in AstApiQueryController2.queryFunc: ${err}`));
    // throw new Error(`'Error in AstApiQueryController2.queryFunc: ${err}`);
    // return ({
    //   log: 'error in AstApiQueryController2.queryFunc',
    //   message: err,
    // });
  }
};

export default AstApiQueryController2;