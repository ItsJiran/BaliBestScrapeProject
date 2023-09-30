const io = require('../utils_io');
const cheerio = require('cheerio');

test('create folder',async ()=>{
  await io.createFolder( './test_folder' );
  expect( await io.checkFolderExist( './test_folder') ).toBe(true);
})

test('create file',async ()=>{
  await io.createFile( './test_folder/file.txt', 'test' );
  expect( await io.checkFileExist( './test_folder/file.txt') ).toBe(true);
})

test('read file',async ()=>{
  const file = await io.readFile('./')
})

test('delete file',async ()=>{
  await io.deleteFile( './test_folder/file.txt');
  expect( await io.checkFileExist( './test_folder/file.txt') ).toBe(false);
})

test('delete folder',async ()=>{
  await io.deleteFolder( './test_folder');
  expect( await io.checkFolderExist( './test_folder') ).toBe(false);
})
