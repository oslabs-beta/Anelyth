import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const filePath = path.resolve(__dirname, '../../super-structure.log')

console.log(filePath)

const fileContent = fs.readFileSync(filePath, 'utf8');
const SuperStructure = JSON.parse(fileContent);


function countDependencies(fileContent) {
    const dependencyCounts = {};
  
    try {
      const data = SuperStructure;
  
      function traverseHierarchy(node) {
        if (node.type === 'file') {
          const fileName = node.path.split('/').pop();
          dependencyCounts[fileName] = 0;
  
          if (node.info && node.info.dependencies) {
            const localDependencies = node.info.dependencies.filter(
              (dependency) => !dependency.couldNotResolve && dependency.resolved.includes('/')
            );
            dependencyCounts[fileName] = localDependencies.length;
          }
        } else if (node.type === 'directory') {
          node.children.forEach(traverseHierarchy);
        }
      }
  
      traverseHierarchy(data);
    } catch (error) {
      console.error('Error parsing file content:', error);
    }
  
    Object.keys(dependencyCounts).filter(file => {
        if (file.includes('.json') || file.includes('.md')){
            delete dependencyCounts[file]
        }
    })

    return dependencyCounts;
  }
  

const dependencyCounts = countDependencies(SuperStructure);
console.log(dependencyCounts);



//dependencyCounts should look like this:
// const arr = [
//     {fileName: ‘file1’, details: [{url: ‘endpoint1’}, {url: ‘endpoint2’}]},
//     {fileName: ‘file2’, details: [{url: ‘endpoint1’}, {url: ‘endpoint2’}, {url: ‘endpoint3’}]},
//     {fileName: ‘file5’, details: [{url: ‘endpoint6’}]},
//     {fileName: ‘file3’, details: [{url: ‘endpoint1’}, {url: ‘endpoint4’}]},
//     {fileName: ‘file4’, details: [{url: ‘endpoint3’}]}
//   ];