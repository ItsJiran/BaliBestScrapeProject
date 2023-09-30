
const fs = require('fs');

function path(path){
  return __dirname + '/' + path;
}
async function deleteFile(path){
	if(await checkFileExist(path)) {
    await fs.promises.rm(path,{recursive:true,force:true}, (err)=>{console.log(err);return err})
  }
}
async function deleteFolder(path){
	if(await checkFolderExist(path)) { 
    await fs.promises.rm(path,{recursive:true,force:true}, (err)=>{console.log(err);return err})
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
    console.log(response);
    return true;
  } catch(err){
    if(err.code == 'ENOENT') return false;
    else                     return console.error(err);
  }
}
async function checkFileExist(path){
  try{
    const response = await fs.promises.access(path);
    console.log(response);
    return true;
  } catch(err){
    if(err.code == 'ENOENT') return false;
    else                     return console.error(err);
  }
}
async function writeFile(path,content=''){
  await fs.promises.writeFile(path,content,(err)=>{return err});
}

module.exports = {
  path:path,
  createFolder:createFolder,
  createFile:createFile,
  writeFile:writeFile,
  deleteFile:deleteFile,
  deleteFolder:deleteFolder,
  checkFileExist:checkFileExist,
  checkFolderExist:checkFolderExist,
}
