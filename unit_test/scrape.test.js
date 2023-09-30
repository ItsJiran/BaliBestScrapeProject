
const axios = require('axios')
const cheerio = require('cheerio');

const io = require('../utils.io');
const scrape = require('../scrape.js');
const MockAdapter = require('axios-mock-adapter');

const mock = new MockAdapter(axios);

test('fetching html file', async () => {
  mock.onGet('/html').reply(200, await io.readFile('./unit_test/mock_index.html'));
    
  const scrapper = new scrape.Scrapper(mock);
  const fetch = await scrapper.fetch({url:'/html'});

  const html = cheerio.load(fetch.response.data);
  expect( html('title').text() ).toBe('Mock File');
});

test('fetching image file', async ()=>{
  mock.onGet('/image').reply(200, await io.readFile('./unit_test/mock_image.jpg'));

  const scrapper = new scrape.Scrapper(mock);
  const fetch = await scrapper.fetchFile({url:'/image'});

  const writeFile = await io.writeFile('./unit_test/mock_image_2.jpg',fetch.response.data);
  const newFile = await io.readFile('./unit_test/mock_image_2.jpg');
  const oldFile = await io.readFile('./unit_test/mock_image.jpg');

  expect(newFile.data).toBe(oldFile.data);
  await io.deleteFile('./unit_test/mock_image_2.jpg');
})
