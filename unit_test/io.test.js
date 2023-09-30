const io = require('../utils.io');
const cheerio = require('cheerio');

test('create folder',async ()=>{
  await io.createFolder( './unit_test/test_folder' );
  expect( await io.checkFolderExist( './unit_test/test_folder') ).toBe(true);
})

test('create file',async ()=>{
  await io.createFile( './unit_test/test_folder/file.txt', 'test' );
  expect( await io.checkFileExist( './unit_test/test_folder/file.txt') ).toBe(true);
})

test('read file',async ()=>{
  const file = await io.readFile('./unit_test/mock_index.html');
  const html = cheerio.load(file);

  expect( html('title').text() ).toBe('Mock File');
})

test('write file',async ()=>{
  const file = await io.readFile('./unit_test/mock_index.html');
  const html = cheerio.load(file);

  html('title').text('Esa Hidayah');

  const writeFile = await io.writeFile('./unit_test/mock_index_2.html',html.html());
  const newFile = await io.readFile('./unit_test/mock_index_2.html');
  const newHtml = cheerio.load(newFile);

  expect( newHtml('title').text() ).toBe('Esa Hidayah');
  await io.deleteFile( './unit_test/mock_index_2.html');
})

test('delete file',async ()=>{
  await io.deleteFile( './unit_test/test_folder/file.txt');
  expect( await io.checkFileExist( './unit_test/test_folder/file.txt') ).toBe(false);
})

test('delete folder',async ()=>{
  await io.deleteFolder( './unit_test/test_folder');
  expect( await io.checkFolderExist( './unit_test/test_folder') ).toBe(false);
})
