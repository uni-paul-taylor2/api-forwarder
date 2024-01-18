let fetch=require('node-fetch'), http=require('node:http')
async function qfetch(url,headers={},method="GET",returnType='json'){
  let options={method,headers};
  return await(await fetch("https://"+url,options))[returnType]();
}
http.createServer(async(req,res)=>{try{
  let url=req.url[0]==='/'?req.url.substr(1):req.url
  if(url.length<1) return res.end("pinged successfully");
  if(req.headers.origin) res.writeHead(200,{'Access-Control-Allow-Origin':req.headers.origin});
  delete req.headers.host //for fetch to set it properly
  return res.end(await qfetch(url,req.headers,"GET",'text'))
}catch(err){console.log(err)}}).listen(process.env.PORT||8080)
