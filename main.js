const scrape = require('./scrape.js');
const cheerio = require('cheerio');
const io = require('./utils.io');
const elm = require('./utils.elm.js');
const { checkFolderExist } = require('./utils.io');

const falseUrl = 'http://localhost/lifebook';
const baseUrl = 'https://www.balibestactivities.com/';
const timestamp = new Date();

// Sistem Simpan Filenya
// - Non Html Formated Text Tapi Terstruktur misalnya navigasi
// - Html Formated File
// - Log ( Kapan Terakhir Fetch ) 

// 0.Buat List Url Yang Ingin Di Fetch ( BASED ON HOMEPAGE ) 
// - Ambil List Artikel 
// - Ambil List Navigasinya
// - Ambil List N

// 0.1 Buat Raw File Nya ( misal navigasi [title:l] )

// 1.Fetch Homepage Url
// - Ambil List Artikel 
// - Ambil List Navigasinya

let scrapper, fetchHome, $;


async function initialize(){
  scrapper = new scrape.Scrapper({baseUrl:falseUrl}); 
  fetchHome = await scrapper.fetch({url:''});
  $ = await cheerio.load( await io.readFile('./index.html'));

  if(await io.checkFolderExist( io.path('scrape/articles') ) == true)        await io.deleteFolder( io.path('scrape/articles') );
    
  // CREATE FOLDER
  if(await io.checkFolderExist( io.path('scrape') ) == false)                await io.createFolder( io.path('scrape') );
  if(await io.checkFolderExist( io.path('scrape/articles') ) == false)       await io.createFolder( io.path('scrape/articles') );
  if(await io.checkFolderExist( io.path('scrape/articles/index') ) == false) await io.createFolder( io.path('scrape/articles/index') );
}

function getSlugEnd(url){
  if(!isSlug(url)) throw new Error('esa');
  var tmp = url.replaceAll(baseUrl,'').split('/');
  return tmp[tmp.length-1];
}
function getSlug(url){
  if(!isSlug(url)) throw new Error('esa');
  var tmp = url.replaceAll(baseUrl,'').split('/');
  var str = '';

  for(let i = 0; i < tmp.length - 1; i++){
    str += tmp[i] + '/';
  }

  return str;  
}
function isSlug(url){
  var tmp = url.replaceAll(baseUrl,'').split('/');
  return tmp.length > 1;
}
function cleanUrl(url){
  return url.replaceAll(baseUrl,'');
}

function cleanAtt(e){
  if(e.attribs !== undefined){
    if(e.attribs.id !== undefined) delete e['attribs']['id']; 
    if(e.attribs.class !== undefined) delete e['attribs']['class']; 
  }
  
  return e; 
}
async function createScrapeFolder(link){
  if(isSlug(link)) {
    if(await io.checkFolderExist( io.path('scrape/articles/'+cleanUrl(link)) ) == false) await io.createFolder( io.path('scrape/articles/'+cleanUrl(link)) );
  } else {
    if(await io.checkFolderExist( io.path('scrape/articles/index/'+cleanUrl(link)) ) == false) await io.createFolder( io.path('scrape/articles/index/'+cleanUrl(link)) );
  }
}

async function scrapeHome(){
 
  
}
async function scrapeNavigation(){
  let navigation = elm.list( $('#menu-menu-1') );
  let navigation_string = '';
  let navigation_clean_string = '';

  // raw
  navigation.forEach(await async function(em){ 
    
    const childs = em.children;
    for(let child of childs){
      var a = elm.recursiveFind(child, e => { return e.name == 'a'; });
      if(a !== undefined){
        if(a.attribs !== undefined){
          if(a.attribs.href.replaceAll(baseUrl,'') !== '' && a.attribs.href + '/' !== baseUrl){
            createScrapeFolder(a.attribs.href);
          }
        }
      }

    }


    navigation_string += '\n\n' + $.html(em);
  })

  // clean
  navigation.forEach((menu)=>{
    var li = elm.recursiveApply( menu, cleanAtt );

    navigation_clean_string += '\n\n' + $.html(li);
  })

  await io.writeFile( io.path('scrape/navigation_clean.html'), navigation_clean_string); 
  await io.writeFile( io.path('scrape/navigation.html'), navigation_string); 
  await io.writeFile( io.path('scrape/navigation.json'), JSON.stringify( elm.recursiveParseJson( navigation[0]), null, 4) );  
}
async function scrapeSidebar(){
  let sidebar = elm.list( $('.widget_nav_menu') );
  let sidebar_string = '';
  let sidebar_clean_string = '';

  // raw
  sidebar.forEach((em)=>{ 
    sidebar_string += '\n\n' + $.html(em);
  })

  // clean
  sidebar.forEach((menu)=>{
    let title = elm.apply( $('#' + menu.attribs.id).find('.wtitle')[0], cleanAtt );
    let ul = elm.recursiveApply( $('#' + menu.attribs.id).find('ul')[0], cleanAtt );


    var childs = $('#' + menu.attribs.id).find('ul')[0].children;
    for(let child of childs){
      var a = elm.recursiveFind(child, e =>{ return e.name == 'a'; });
      if(a !== undefined){
        if(a.attribs !== undefined){
          createScrapeFolder(a.attribs.href);
        }
      }
    }

    sidebar_clean_string += '\n\n' + $.html(title);
    sidebar_clean_string += '\n' + $.html(ul);
  })

  await io.writeFile( io.path('scrape/sidebar_clean.html'), sidebar_clean_string); 
  await io.writeFile( io.path('scrape/sidebar.html'), sidebar_string); 
  await io.writeFile( io.path('scrape/sidebar.json'), JSON.stringify( elm.recursiveParseJson( sidebar[0]), null, 4) ); 
}
async function scrapeArticles(){  
  let feeds_container = $('#content .mg-card-box > .wp-block-columns'); 

  let feeds_main = undefined;
  let feeds_thumbnail_only = [];
  let feeds_article = [];
  let feeds_article_like = [];

  let filter_thumb_only = [
    'wp-block-columns is-layout-flex wp-container-7 wp-block-columns-is-layout-flex',
    'wp-block-columns is-layout-flex wp-container-14 wp-block-columns-is-layout-flex',
    'wp-block-columns is-layout-flex wp-container-21 wp-block-columns-is-layout-flex',
    'wp-block-columns is-layout-flex wp-container-28 wp-block-columns-is-layout-flex',
    'wp-block-columns is-layout-flex wp-container-35 wp-block-columns-is-layout-flex',
    'wp-block-columns is-layout-flex wp-container-42 wp-block-columns-is-layout-flex',
  ];
  let filter_article = [
    'wp-block-columns is-layout-flex wp-container-46 wp-block-columns-is-layout-flex',
    'wp-block-columns is-layout-flex wp-container-49 wp-block-columns-is-layout-flex',
  ]

  for(e of feeds_container){
    let c = e.children.filter( (v) => { return v.attribs !== undefined })
    let cls = e.attribs.class;

    var tmp = [];
    c.forEach((chd)=>{
      tmp.push(chd);
    })

    var x = e;
    x.children = tmp;

    if(filter_thumb_only.indexOf(cls) !== -1)   feeds_thumbnail_only.push(x);
    else if(filter_article.indexOf(cls) !== -1) feeds_article.push(x);
    else                                        feeds_article_like.push(x);
  }

  // main
  var raw_main = '';
  let clean_main = '';

  // thumbnail
  var raw_thumbnail_only_str = '<!-- ================= THUMBNAIL ONLY FEEDS ================= -->\n\n';
  var clean_thumbnail_only_str = '<!-- ================= THUMBNAIL ONLY FEEDS ================= -->\n\n';
  var json_thumbnail_only_str = [];
 
  feeds_thumbnail_only.forEach(await async function (e){
    const childs = e.children;

    raw_thumbnail_only_str += $.html(e);
    
    // raw 
    childs.forEach( await async function (child) {

      var img = elm.recursiveFind(child, e =>{ return e.name == 'img'; });
      var a = elm.recursiveFind(child, e =>{ return e.name == 'a'; });
      var title = a.children[0].children[0].data;
      var link = a.attribs.href;
      
      await createScrapeFolder(link);

    })  

    json_thumbnail_only_str.push( elm.recursiveParseJson(e) );
    clean_thumbnail_only_str += $.html(elm.recursiveApply( e, cleanAtt )).replaceAll('\n\n\n','\n');

  })

  // article
  var raw_article = '\n\n<!-- ================= ARTICLES FEEDS ================= -->\n\n';
  var clean_article = '\n\n<!-- ================= ARTICLES FEEDS ================= -->\n\n';
  var json_article = [];

  feeds_article.forEach(await async function (em){
    const childs = em.children.filter((v)=>{return v !== undefined});

    raw_article += $.html(em);
  
    for(let index in childs){
      var child = childs[index];

      var img = elm.recursiveFind(child, e =>{ return e.name == 'img'; });
      var a = elm.recursiveFind(child, e =>{ return e.name == 'a' && elm.recursiveFind(e, (v)=>{return v.name == 'img'}) == undefined; });
      var title = elm.recursiveFind(child, e =>{ return e.name == 'h3' || e.name == 'a' && childs.length == 2 || e.name == 'h4'; });
      if(childs.length == 2) title = title.children[0].data;
      else                   title = title.children[0].children[0].data;
      var link = a.attribs.href;

      await createScrapeFolder(link);

      if(index == childs.length - 1) break;
    }

    json_article.push( elm.recursiveParseJson(em) );
    clean_article += $.html(elm.recursiveApply( em, cleanAtt )).replaceAll('\n\n\n','\n');
  })

  
  await io.writeFile( io.path('scrape/feeds.html'), raw_thumbnail_only_str + raw_article); 
  await io.writeFile( io.path('scrape/feeds_clean.html'), clean_thumbnail_only_str + clean_article); 
  await io.writeFile( io.path('scrape/feeds.json'), JSON.stringify( [json_thumbnail_only_str, json_article], null, 4) );
}
async function scrapeArticle(fetch){

}

const main = async () => {
  try{

    // MAIN FETCH
    await initialize();
    await scrapeHome();
    await scrapeNavigation();
    await scrapeSidebar();
    await scrapeArticles();

    // LAST TIME FETCH
    await io.writeFile( io.path('scrape/log.txt'), 'Last Fetch : ' + timestamp.toString() );

  } catch(e) {
  	console.error(e);
  }
}

main();



