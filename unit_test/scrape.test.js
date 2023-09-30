
const axios = require('axios')
const scrape = require('./scrape.js');

test('fetching html file', async () => {
  const mock = new MockAdapter(axios);
  mock.onGet('/html').reply(200, {

  })
});

test('fetching image file', async ()=>{
  const mock = new MockAdapter(axios);
})
