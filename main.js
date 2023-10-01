const scrape = require('./scrape.js');
const cheerio = require('cheerio');
const io = require('./utils.io');
const elm = require('./utils.elm.js');
const format = require('html-format');
const { checkFolderExist } = require('./utils.io');
const { recursiveApply } = require('./utils.elm.js');

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

let scrapper, fetchHome, $, targetArticles,targetImg;
targetArticles = {
  index:[],
};
targetImg = {
  index:[],
};

function tranposeToObj(url, obj){
  var tmp = transposeUrl(url);
  if(tmp.slug !== undefined) {
    var split = tmp.slug.split('/');
    recursiveTransporse(split,tmp,obj);
  } else {
    obj.index.push(tmp);
  }
}
function recursiveTransporse(split,content,obj,prev){
  var end = split[0];
  if(end == undefined || end == '') {
    if(obj.content == undefined) obj.content = [];
    var exist = obj.content.filter(e=>e.end == content.end);
    if(exist.length == 0) obj.content.push(content);
  }
  else if(end !== undefined) {
    if(obj[end] == undefined) obj[end] = {};
    split = split.slice(1);
    if(split.length == 0) {
      obj[end].content = [];
      var exist = obj.content.filter(e=>e.end == content.end);
      if(exist.length == 0) obj.content.push(content);
    } else                  recursiveTransporse(split,content,obj[end],obj);
  } 
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
function transposeUrl(url){
  var tmp = cleanUrl(url);
  if(isSlug(tmp)){
    return {
      slug : getSlug(tmp),
      end :  getSlugEnd(tmp),
      ori : url,
    }
  } else {
    return {end:tmp,ori:url}
  }
}
function cleanAtt(e){
  if(e.attribs !== undefined){
    if(e.attribs.id !== undefined) delete e['attribs']['id']; 
    if(e.attribs.class !== undefined) delete e['attribs']['class']; 
  }
  
  return e; 
}
async function createScrapeFolder(link){
  if(link == 'ur' || link == 'r') return;

  if(isSlug(link)) {
    if(await io.checkFolderExist( io.path('scrape/articles/'+cleanUrl(link)) ) == false) await io.createFolder( io.path('scrape/articles/'+cleanUrl(link)) );
  } else {
    if(await io.checkFolderExist( io.path('scrape/articles/index/'+cleanUrl(link)) ) == false) await io.createFolder( io.path('scrape/articles/index/'+cleanUrl(link)) );
  }
}


async function initialize(){
  scrapper = new scrape.Scrapper({baseUrl:falseUrl}); 
  fetchHome = await scrapper.fetch({url:''});
  $ = await cheerio.load( (await io.readFile('./index.html')).trim() );

  //if(await io.checkFolderExist( io.path('scrape/articles') ) == true)        await io.deleteFolder( io.path('scrape/articles') );
    
  // CREATE FOLDER
  if(await io.checkFolderExist( io.path('scrape') ) == false)                await io.createFolder( io.path('scrape') );
  if(await io.checkFolderExist( io.path('scrape/articles') ) == false)       await io.createFolder( io.path('scrape/articles') );
  if(await io.checkFolderExist( io.path('scrape/articles/index') ) == false) await io.createFolder( io.path('scrape/articles/index') );
}

async function scrapeHome(){
 
  
}
async function scrapeNavigation(){
  let navigation = elm.list( $('#menu-menu-1') );
  let navigation_string = '';
  let navigation_clean_string = '';

  // raw
  for(let em of navigation){
    const childs = em.children;
    for(let child of childs){
      var a = elm.recursiveFind(child, e => { return e.name == 'a'; });
      if(a !== undefined){
        if(a.attribs !== undefined){
          if(a.attribs.href.replaceAll(baseUrl,'') !== '' && a.attribs.href + '/' !== baseUrl){
            await createScrapeFolder(a.attribs.href);
            tranposeToObj(a.attribs.href,targetArticles);
          }
        }
      }
    }

    navigation_string += '\n\n' + $.html(em);    
  }

  // clean
  for(let menu of navigation){
    var li = elm.recursiveApply( menu, cleanAtt );
    navigation_clean_string += '\n\n' + $.html(li);
  }

  await io.writeFile( io.path('scrape/navigation_clean.html'), navigation_clean_string); 
  await io.writeFile( io.path('scrape/navigation.html'), navigation_string); 
  await io.writeFile( io.path('scrape/navigation.json'), JSON.stringify( elm.recursiveParseJson( navigation[0]), null, 4) );  
}
async function scrapeSidebar(){
  let sidebar = elm.list( $('.widget_nav_menu') );
  let sidebar_string = '';
  let sidebar_clean_string = '';

  // raw
  for(var em of sidebar){
    sidebar_string += '\n\n' + $.html(em);
  }

  // clean
  for(var menu of sidebar){
    let title = elm.apply( $('#' + menu.attribs.id).find('.wtitle')[0], cleanAtt );
    let ul = elm.recursiveApply( $('#' + menu.attribs.id).find('ul')[0], cleanAtt );


    var childs = $('#' + menu.attribs.id).find('ul')[0].children;
    for(let child of childs){
      var a = elm.recursiveFind(child, e =>{ return e.name == 'a'; });
      if(a !== undefined){
        if(a.attribs !== undefined){
          await createScrapeFolder(a.attribs.href);
          tranposeToObj(a.attribs.href,targetArticles);
        }
      }
    }

    sidebar_clean_string += '\n\n' + $.html(title);
    sidebar_clean_string += '\n' + $.html(ul);
  }

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
 
  for(var e of feeds_thumbnail_only){
    const childs = e.children;

    raw_thumbnail_only_str += $.html(e);
    
    // raw 
    childs.forEach( await async function (child) {

      var img = elm.recursiveFind(child, e =>{ return e.name == 'img'; });
      var a = elm.recursiveFind(child, e =>{ return e.name == 'a'; });
      var title = a.children[0].children[0].data;
      var link = a.attribs.href;
      
      if(link !== undefined ) tranposeToObj(link,targetArticles);
      if(img !== undefined) tranposeToObj(img.attribs.src,targetImg);

      await createScrapeFolder(link);

    })  

    json_thumbnail_only_str.push( elm.recursiveParseJson(e) );
    clean_thumbnail_only_str += $.html(elm.recursiveApply( e, cleanAtt )).replaceAll('\n\n\n','\n');
  }

  // article
  var raw_article = '\n\n<!-- ================= ARTICLES FEEDS ================= -->\n\n';
  var clean_article = '\n\n<!-- ================= ARTICLES FEEDS ================= -->\n\n';
  var json_article = [];

  for(em of feeds_article){
    const childs = em.children.filter((v)=>{return v !== undefined});

    raw_article += $.html(em);

    for(let index in childs){
      var child = childs[index];
      
      var img = elm.recursiveFind(child, e =>{ return e.name == 'img'; });
      var a = elm.recursiveFind(child, e =>{ return e.name == 'a' && e.children[0].name !== 'img' });
      var title = elm.recursiveFind(child, e =>{ return e.name == 'h3' || e.name == 'a' && childs.length == 2 || e.name == 'h4'; });
      if(childs.length == 2) title = title.children[0].data;
      else                   title = title.children[0].children[0].data;
      var link = a.attribs.href;
      await createScrapeFolder(link);

      if(link !== undefined ) tranposeToObj(link,targetArticles);
      if(img !== undefined) tranposeToObj(img.attribs.src,targetImg);


      if(index == childs.length - 1) break;
    }
    
  }

  // article like
  var raw_article_like = '\n\n<!-- ================= ARTICLES LIKE FEEDS ================= -->\n\n';
  var clean_article_like = '\n\n<!-- ================= ARTICLES LIKE FEEDS ================= -->\n\n';
  var json_article_like = [];

  for(var em of feeds_article_like){
    raw_article_like += $.html(em);

    var img = elm.recursiveFind(em, e =>{ return e.name == 'img'; });
    var a = elm.recursiveFind(em, e =>{ return e.name == 'a' && e.children[0].data !== 'Bali tour'});
    var title = elm.recursiveFind(em, e =>{ return e.name == 'h3' || e.name == 'h4'; });
    var title_2 = elm.recursiveFind( title.children[0], e => e.type == 'text' ).data;
    var link = a.attribs.href;

    if(link !== undefined ) tranposeToObj(link,targetArticles);
    if(img !== undefined) tranposeToObj(img.attribs.src,targetImg);
    
    await createScrapeFolder(link);
  }
  
  await io.writeFile( io.path('scrape/feeds.html'), format(raw_thumbnail_only_str + raw_article + raw_article_like)); 
  await io.writeFile( io.path('scrape/feeds_clean.html'), format(clean_thumbnail_only_str + clean_article + clean_article_like)); 
  await io.writeFile( io.path('scrape/feeds.json'), JSON.stringify( [json_thumbnail_only_str, json_article, json_article_like], null, 4) );
}
async function scrapeArticle(fetch){


  console.log(a.attribs.href);
}
async function scrapeFooter(){
  var list = $('#menu-bali-full-day-tours-1')[0];

  var raw_footer = format($.html(elm.recursiveApply(list, cleanAtt)));
  var clean_footer = format($.html(elm.recursiveApply(list, cleanAtt)));

  for(var li of list.children){
    var a = elm.recursiveFind( li, e => { return e.name == 'a' } );
    if(a !== undefined) await createScrapeFolder(a.attribs.href);
    if(a !== undefined ) tranposeToObj(a.attribs.href,targetArticles);
  }

  await io.writeFile( io.path('scrape/footer.html'), raw_footer ); 
  await io.writeFile( io.path('scrape/footer_clean.html'), clean_footer ); 
  await io.writeFile( io.path('scrape/footer.json'), JSON.stringify( elm.recursiveParseJson(list), null, 4 ) );
}
async function scrapeRecent(){
  var list = $('#recent-posts-9 ul')[0];

  var raw_footer = format($.html(elm.recursiveApply(list, cleanAtt)));
  var clean_footer = format($.html(elm.recursiveApply(list, cleanAtt)));

  for(var li of list.children.filter(e=> e.type == 'text' && e.parent.name !== 'a')){
    var a = elm.recursiveFind( li, e => { return e.name == 'a' } );
    if(a !== undefined) await createScrapeFolder(a.attribs.href);
    if(a !== undefined ) tranposeToObj(a.attribs.href,targetArticles);
  }

  await io.writeFile( io.path('scrape/recent.html'), raw_footer ); 
  await io.writeFile( io.path('scrape/recent_clean.html'), clean_footer ); 
  await io.writeFile( io.path('scrape/recent.json'), JSON.stringify( elm.recursiveParseJson(list), null, 4 ) );
}

function recursiveApplyContent(obj,callback){

}

const main = async () => {
  try{

    // MAIN FETCH
    await initialize();
    await scrapeHome();
    await scrapeNavigation();
    await scrapeSidebar();
    await scrapeArticles();
    await scrapeFooter();
    await scrapeRecent();
    
    // SECOND FETCH
    // 1. Fetching All The HTML File
    // 2. Assign All The

    // LAST TIME FETCH
    await io.writeFile( io.path('scrape/targets_articles.json'), JSON.stringify( targetArticles, null, 4 ) );
    await io.writeFile( io.path('scrape/targets_img.json'), JSON.stringify( targetImg, null, 4 ) );
    await io.writeFile( io.path('scrape/log.txt'), 'Last Fetch : ' + timestamp.toString() );

  } catch(e) {
  	console.error(e);
  }
}

main();



