const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../node_modules/idb-keyval/dist/umd.js');
const targetFile = path.join(__dirname, '../public/idb-keyval.js');

fs.copyFileSync(sourceFile, targetFile);
console.log('Copied idb-keyval UMD bundle to public directory'); 
