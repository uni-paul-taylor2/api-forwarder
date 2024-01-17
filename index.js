let fetch=require('node-fetch')
let http=require('node:http'), https=require('node:https')
let ab_map=[], str_map={__proto__:null}
for(let i=0;i<256;i++){
  ab_map[i]=String.fromCharCode(i);
  str_map[ab_map[i]]=i;
}
function str2ab(str) {
  let buf=new ArrayBuffer(str.length), bufView=new Uint8Array(buf);
  for (let i=0;i<str.length;i++) bufView[i]=str_map[str[i]];
  return buf;
}
function ab2str(buf) {
  let arr=new Uint8Array(buf), chars="";
  for(let i=0;i<arr.length;i++) chars+=ab_map[arr[i]];
  return chars;
}
async function bufferChunk(stream,maxLength=Infinity){
  return new Promise((resolve,reject)=>{
    var temp="" //adding text faster than Buffer.concat
    stream.on('data', function(chunk){
      if(temp.length+chunk.length>maxLength)
        return reject("data length exceeded");
      temp+=ab2str(chunk)
    })
    stream.on('end', function(){resolve(temp)})
    stream.on('error', reject)
  })
}
function requestURL(url,headers={},method="GET",protocol="https"){
  const {hostname}=new URL(url.startsWith('http')?url:protocol+url);
  if(headers.host) headers.host=hostname;
  return new Promise(resolve=>{
    let options={hostname, port:protocol==="https"?443:80, path:'/', method, headers}
    let request=(protocol==="https"?https:http).request(options,response=> bufferChunk(response).then(resolve) )
    request.write(data)
    request.end()
  })
}
async function qfetch(url,headers={},method="GET",returnType='json'){
  let options={method,headers};
  return await(await fetch("https://"+url,options))[returnType]();
};
http.createServer(async(req,res)=>{try{
  let url=req.url[0]==='/'?req.url.substr(1):req.url
  //if(!url.includes("api")) return res.end("wow");
  if(url.length<1) return res.end("pinged successfully");
  res.writeHead(200,{'Access-Control-Allow-Origin':req.headers.origin})
  //console.log(req.headers)
  //return res.end(await requestURL(url,req.headers,req.method))
  delete req.headers.host
  delete req.headers.origin
  delete req.headers.referer
  return res.end(await qfetch(url,req.headers,req.method,'text'))
  //return res.end(await qfetch(url,{},"GET",'text'))
}catch(err){console.log(err)}}).listen(process.env.PORT||8080)
