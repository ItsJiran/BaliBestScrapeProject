
const axios = require('axios');

class Scrapper{

  constructor(object={}){
    // for testing or mocking
    if(object.axios !== undefined) this.axios = object.axios;
    else                           this.axios = axios;

    this.defaultConfig = {
      method:'get',
      headers:{},
    }
    this.query = {
      success:[],
      failed:[],
      error:[],
    } 
  }

  // if throw error false then error will be returned
  async fetch(obj={},throwError=false){
    if(obj.url == undefined && throwError) throw Error('Url should be defined');
    else if(obj.url == undefined)          return 'Url should be defined';

    var config = {};

    if(obj.config == undefined) config = {...this.defaultConfig};
    else                        config = {...this.defaultConfig, ...obj.config};

    config.url = obj.url;

    let fetch = {
      status:0,
      response:{},
    }

    await this.axios(config)
    .then((e)=>{
      fetch.status = e.status,
      fetch.response = e;
    })
    .catch((e)=>{
      fetch.status = e.response.status;
      fetch.response = e.response;
    })

    return fetch;
  }
  async fetchFile(obj={}){
    if(obj.url == undefined && throwError) throw Error('Url should be defined');
    else if(obj.url == undefined)          return 'Url should be defined';

    var config = {};

    if(obj.config == undefined) config = {responseType:'blob'};
    else                        config = {responseType:'blob',...obj.config};

    return await this.fetch(obj, config); 
  }
}

module.exports = {
  Scrapper:Scrapper
}
