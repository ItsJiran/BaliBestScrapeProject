const pather = require('path');
const fs = require('fs');

function path(path){
  return __dirname + '/' + path;
}
async function deleteFile(path){
	if(await checkFileExist(path)) {
    await fs.promises.rm(path,{recursive:true,force:true})
  }
}
async function deleteFolder(path){
	if(await checkFolderExist(path)) { 
    await fs.promises.rm(path,{recursive:true,force:true})
  };
}
async function createFolder(path){
	if(await checkFolderExist(path) == false) {
    await fs.promises.mkdir(path,{recursive:true}, (err)=>{return err});
  } 
}
async function createFile(path,content=''){
  if(await checkFileExist(path) == false) return await writeFile(path,content);
  else                                    return 'file already exist';     
}
async function checkFolderExist(path){
  try{
    const response = await fs.promises.access(path);
    return true;
  } catch(err){
    if(err.code == 'ENOENT') return false;
    else                     return console.error(err);
  }
}
async function checkFileExist(path){
  try{
    const response = await fs.promises.access(path);
    return true;
  } catch(err){
    if(err.code == 'ENOENT') return false;
    else                     return console.error(err);
  }
}
async function writeFile(path,content=''){
  await fs.promises.writeFile(path,content,(err)=>{return err});
}
async function readFile(path,encoding){
  if(encoding == undefined){
    if(pather.extname(path) == '.jpg' || pather.extname(path) == '.png') encoding = '';
    else                                                                 encoding = 'utf8'
  }
  
  if(await checkFileExist(path)) return await fs.promises.readFile(path,encoding);
  else                           return 'file not exist';
}

module.exports = {
  path:path,
  readFile:readFile,
  createFolder:createFolder,
  createFile:createFile,
  writeFile:writeFile,
  deleteFile:deleteFile,
  deleteFolder:deleteFolder,
  checkFileExist:checkFileExist,
  checkFolderExist:checkFolderExist,
}
