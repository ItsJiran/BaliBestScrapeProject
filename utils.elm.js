function attr(elm,name){
    return elm.attributes.filter((e)=>{return e.name==name})[0];
}
function list(elm){
    var tmp = [];
    elm.each((e,data)=>{tmp.push(data)});
    return tmp;
}
function parseJson(elm={}){
    var tmp = {
      type:elm.type,
      name:elm.name,
    }
  
    var attribs = elm.attribs;
  
    if(attribs !== undefined){
      if(attribs.id !== undefined) tmp.id = attribs.id;
      if(attribs.class !== undefined) tmp.class = attribs.class;
      if(attribs.href !== undefined) tmp.href = attribs.href;
    }
  
    if(elm.data !== undefined) tmp.data = elm.data;
    if(elm.namespace !== undefined) tmp.namespace = elm.namespace;
  
    return tmp;
}
function recursiveParseJson(elm){
    if(elm.children == undefined) return parseJson(elm);

    var tmp_obj = parseJson(elm);
    tmp_obj.children = [];

    elm.children.forEach( (e)=>{ tmp_obj.children.push( recursiveParseJson(e) ) } );
    return tmp_obj;
}
function apply(elm,callback){
    var tmp = elm;
    return callback(tmp);
}
function recursiveApply(elm,callback){
    if(elm.children == undefined) return apply(elm,callback);
    var tmp = apply(elm,callback);
    elm.children.forEach( (e)=>{ return recursiveApply(e,callback) } );
    return tmp;
}  
function recursiveFind(elm,callback){
    var condition = callback(elm);

    if(elm == undefined) console.log(elm);

    if(condition) return elm;
    if(!condition && elm.children !== undefined) {
        for(let i of elm.children) {
            var tmp =recursiveFind(i,callback);
            if(tmp !== undefined) return tmp;
        }
    }
}

module.exports = {
    attr:attr,
    list:list,
    parseJson:parseJson,
    recursiveParseJson:recursiveParseJson,
    apply:apply,
    recursiveApply:recursiveApply,
    recursiveFind:recursiveFind,
}
