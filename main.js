const scrape = require('./scrape.js');
const cheerio = require('cheerio');
const io = require('./utils_io');

const baseUrl = 'https://www.balibestactivities.com/';
const timestamp = new Date();

// Sistem Simpan Filenya
// - Non Html Formated Text Tapi Terstruktur misalnya navigasi
// - Html Formated File
// - Log ( Kapan Terakhir Fetch ) 

// 1.Fetch Homepage Url
// - Ambil List Artikel 
// - Ambil List Navigasinya


const main = async () => {
  try{
    const Scrapper = new scrape.Scrapper(); 
    const fetchHome = await Scrapper.fetch({url:'http://localhost:5000'});

    console.log(fetchHome.response.data);
    const $home = cheerio.load(fetchHome.response.data);

    console.log( $home('title').text(),  );


    /*
*
  var result = await axios.get(baseUrl);

  const base$ = cheerio.load(result.data);
  fs.writeFile('./index.txt',result.data,err=>{
	if(err) console.error(err);
  });

  console.log(base$('body'));*/


  } catch(e) {
  	console.error(e);
  }
}

main();



