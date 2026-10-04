// Native HTML/CSS composition of unmodified app screenshots and existing SVGs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {pathToFileURL} = require('node:url');
const {chromium} = require('C:/Users/mahen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/mahen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'docs/assets/decision-rooms-screenshots-v2');
const spec = JSON.parse(fs.readFileSync(path.join(dir, 'design-spec.json'), 'utf8'));
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const css = `
*{box-sizing:border-box}html,body{margin:0;width:1920px;height:1280px;overflow:hidden;font-family:"Segoe UI",Arial,sans-serif;color:#242523;background:#FAFBF7}
.art{width:1920px;height:1280px;position:relative;overflow:hidden;background:#FAFBF7}.art.dark{background:#242523;color:#FAFBF7}
.ring{position:absolute;width:1200px;height:1200px;right:-375px;top:125px;border:2px solid #D8DED4;border-radius:50%;opacity:.8}.ring:after{content:"";position:absolute;inset:70px;border:2px dashed #D8DED4;border-radius:50%}.dark .ring{border-color:#454941}.dark .ring:after{border-color:#454941}
.brand{position:absolute;top:56px;left:72px;display:flex;align-items:center;gap:20px;z-index:3}.brand img{width:82px;height:82px}.brand small{font-size:18px;letter-spacing:6px;display:block;font-weight:600;margin-bottom:5px}.brand strong{font-size:36px;letter-spacing:-1.3px}.step{position:absolute;right:70px;top:62px;background:#E4E9E1;border:1px solid #D8DED4;border-radius:60px;padding:17px 31px;font-size:29px;letter-spacing:1px;font-weight:650;color:#242523}.dark .step{background:#343632;color:#FAFBF7;border-color:#454941}
.copy{position:absolute;top:206px;left:76px;width:985px}.kicker{font-size:20px;font-weight:650;letter-spacing:4.2px;color:#697066;margin-bottom:26px}.dark .kicker{color:#B9C0B5}h1{font-size:96px;font-weight:720;line-height:1.04;letter-spacing:-4px;margin:0;white-space:pre-line}.pills{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px;max-width:870px}.pill{font-size:26px;font-weight:600;padding:14px 23px;background:#E4E9E1;border:1px solid #D8DED4;border-radius:50px;white-space:nowrap}.dark .pill{background:#343632;border-color:#454941;color:#FAFBF7}
.kabir{position:absolute;left:82px;top:717px;width:440px;height:413px;z-index:4}.halo{position:absolute;left:68px;top:724px;width:444px;height:444px;border-radius:50%;background:#EDF0EA;z-index:1}.dark .halo{background:#343632}.bubble{position:absolute;left:535px;top:791px;width:475px;border:3px solid #242523;border-radius:37px;background:#FAFBF7;color:#242523;padding:35px 34px;font-size:34px;font-weight:650;line-height:1.28;z-index:3;letter-spacing:-.7px}.bubble:before{content:"";position:absolute;left:-17px;bottom:40px;width:30px;height:30px;background:#FAFBF7;border-bottom:3px solid #242523;border-left:3px solid #242523;transform:rotate(45deg)}.dark .bubble{border-color:#B9C0B5}.dark .bubble:before{border-color:#B9C0B5}
.device{position:absolute;left:1280px;top:167px;width:434px;height:1024px;border:9px solid #242523;border-radius:38px;background:#EDF0EA;overflow:hidden;box-shadow:0 27px 54px #2425231a;z-index:2}.device img{width:100%;height:auto;display:block}.dark .device{border-color:#D8DED4;box-shadow:0 27px 54px #0004}.screenlabel{position:absolute;left:1220px;top:123px;width:560px;text-align:center;font-size:18px;font-weight:650;letter-spacing:3px;color:#697066}.dark .screenlabel{color:#B9C0B5}
.caption{position:absolute;left:76px;bottom:58px;font-size:20px;font-weight:500;color:#697066;letter-spacing:.3px}.dark .caption{color:#B9C0B5}.bottommark{position:absolute;right:65px;bottom:27px;font-size:15px;letter-spacing:2px;font-weight:600;color:#92998F}
.pair .copy{width:855px}.pair h1{font-size:84px;letter-spacing:-3.5px}.pair .pills{max-width:790px}.pair .kabir{left:65px;width:380px;height:357px;top:767px}.pair .halo{left:61px;width:365px;height:365px;top:776px}.pair .bubble{left:442px;top:811px;width:390px;font-size:29px;padding:30px}.pair .device{left:1012px;top:290px;width:357px;height:844px;border-width:7px;border-radius:32px}.pair .device.second{left:1440px;top:224px}.pair .screenlabel{left:991px;top:243px;width:400px}.pair .screenlabel.second{left:1420px;top:179px;width:400px}
.agora .pills{display:grid;grid-template-columns:1fr;gap:10px;max-width:755px}.agora .pill{font-size:25px;padding:12px 20px;width:fit-content}.agora .kabir{width:330px;height:310px;top:855px}.agora .halo{top:855px;width:330px;height:330px}.agora .bubble{left:405px;top:926px;width:420px;font-size:30px}.agora h1{font-size:80px}
.checks .copy{width:620px}.checks h1{font-size:79px;letter-spacing:-3px}.checks .pills{max-width:600px}.checks .pill{font-size:24px;padding:12px 20px}.checks .kabir{width:370px;height:347px;top:809px;left:56px}.checks .halo{top:812px;width:350px;height:350px;left:65px}.checks .bubble{left:75px;top:606px;width:500px;font-size:29px;padding:28px}.checks .bubble:before{left:90px;bottom:-17px;border-bottom:3px solid #242523;border-left:0;border-right:3px solid #242523}
.results{position:absolute;left:715px;top:232px;width:1125px;display:flex;flex-direction:column;gap:24px;z-index:2}.result{background:#EDF0EA;border:1px solid #D8DED4;border-radius:28px;overflow:hidden;box-shadow:0 12px 24px #2425230c;display:flex}.result-name{width:276px;padding:37px 30px;flex:none;font-size:33px;font-weight:650;line-height:1.17;letter-spacing:-1px}.result-name span{display:block;font-size:20px;font-weight:500;color:#697066;line-height:1.4;letter-spacing:0;margin-top:14px}.detail{width:846px;height:269px;overflow:hidden;position:relative;background:#FAFBF7}.detail img{position:absolute;width:860px;height:2080px;max-width:none;left:-8px;top:-1390px}.result.policy .detail{height:362px}.result.policy .detail img{top:-1390px}.result.weather .detail img{top:-1390px}.result.travel .detail img{top:-1390px}
.checks .caption{font-size:19px;max-width:630px;line-height:1.4;bottom:49px}
`;
function page(card, i) {
  let screens = '';
  if(card.layout === 'checks') {
    const labels=[['Rain forecast','Open-Meteo','weather'],['Driving estimate','OSRM','travel'],['Venue policy + hours','OpenStreetMap','policy']];
    screens='<div class="results">'+card.screens.map((s,n)=>'<div class="result '+labels[n][2]+'"><div class="result-name">'+labels[n][0]+'<span>'+labels[n][1]+'</span></div><div class="detail"><img src="source-screens/'+s+'.png" alt="'+esc(card.alt)+'"></div></div>').join('')+'</div>';
  } else {
    screens=card.screens.map((s,n)=>'<div class="screenlabel '+(n?'second':'')+'">'+(card.layout==='pair'?(card.agora?(n?'HINDI SMART STAGE':'YOUR PEOPLE + KABIR'):(n?'JOIN BY CODE':'START A ROOM')):'ACTUAL APP SCREEN')+'</div><div class="device '+(n?'second':'')+'"><img src="source-screens/'+s+'.png" alt="'+esc(card.alt)+'"></div>').join('');
  }
  const caption=card.layout==='checks'?'Actual result details · Estimates and listed policy, not a booking.':'Actual app screenshots · '+(i===0?'Current product UI.':'Shared Stage captured with microphone off.');
  return '<!doctype html><html lang="en"><meta charset="utf-8"><title>'+esc(card.title.replaceAll('\n',' '))+'</title><style>'+css+'</style><body><main class="art '+(card.dark?'dark ':'')+card.layout+(card.agora?' agora':'')+'"><div class="ring"></div><div class="brand"><img src="source-brand/decision-rooms-icon.png" alt=""><div><small>AGORA</small><strong>Decision Rooms</strong></div></div><div class="step">'+String(i+1).padStart(2,'0')+' / 10</div><section class="copy"><div class="kicker">'+esc(card.kicker)+'</div><h1>'+esc(card.title)+'</h1><div class="pills">'+card.pills.map(p=>'<span class="pill">'+esc(p)+'</span>').join('')+'</div></section><div class="halo"></div><img class="kabir" src="source-brand/kabir-'+card.pose+'.svg" alt="Kabir, room facilitator"><div class="bubble">'+esc(card.bubble)+'</div>'+screens+'<div class="caption">'+caption+'</div><div class="bottommark">TALK TOGETHER. DECIDE TOGETHER.</div></main></body></html>';
}
async function main(){
  for(const sub of ['source-brand','portal-jpg','github-webp'])fs.mkdirSync(path.join(dir,sub),{recursive:true});
  for(const pose of ['welcome','explain','agree','think','listen'])fs.copyFileSync(path.join(root,'mobile/assets/assistant-motion/kabir-'+pose+'.svg'),path.join(dir,'source-brand/kabir-'+pose+'.svg'));
  fs.copyFileSync(path.join(root,'mobile/assets/branding/decision-rooms-icon.png'),path.join(dir,'source-brand/decision-rooms-icon.png'));
  const browser=await chromium.launch({headless:true});
  const browserPage=await browser.newPage({viewport:{width:1920,height:1280},deviceScaleFactor:1,reducedMotion:'reduce'});
  const report=[],layers=[];
  try{
    for(const [i,card] of spec.cards.entries()){
      const html=path.join(dir,card.id+'.html');
      fs.writeFileSync(html,page(card,i));
      await browserPage.goto(pathToFileURL(html).href,{waitUntil:'load'});
      await browserPage.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()));});
      const issues=await browserPage.evaluate(()=>[...document.querySelectorAll('.copy,.bubble,.device,.caption,.kabir,.results')].filter(el=>{const r=el.getBoundingClientRect();return r.left<0||r.top<0||r.right>1920||r.bottom>1280;}).map(el=>el.className));
      if(issues.length)throw new Error(card.id+': outside canvas '+issues.join(','));
      const png=path.join(dir,card.id+'.png');
      await browserPage.screenshot({path:png});
      await sharp(png).jpeg({quality:94,mozjpeg:true}).toFile(path.join(dir,'portal-jpg',card.id+'.jpg'));
      await sharp(png).webp({quality:94,effort:5}).toFile(path.join(dir,'github-webp',card.id+'.webp'));
      const thumb=await sharp(png).resize(768,512).jpeg({quality:92}).toBuffer();
      layers.push({input:thumb,left:24+(i%2)*792,top:24+Math.floor(i/2)*536});
      report.push({id:card.id,png:fs.statSync(png).size,jpg:fs.statSync(path.join(dir,'portal-jpg',card.id+'.jpg')).size,webp:fs.statSync(path.join(dir,'github-webp',card.id+'.webp')).size,screenshots:card.screens.map(s=>({file:'source-screens/'+s+'.png',sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,'source-screens',s+'.png'))).digest('hex')}))});
      console.log('Rendered: '+card.id);
    }
    await sharp({create:{width:1608,height:2704,channels:3,background:'#EDF0EA'}}).composite(layers).jpeg({quality:94,mozjpeg:true}).toFile(path.join(dir,'contact-sheet.jpg'));
    fs.writeFileSync(path.join(dir,'export-report.json'),JSON.stringify({created:'2026-10-04',count:report.length,dimensions:'1920x1280',method:spec.method,font:'Segoe UI',sourceImages:'Unmodified screenshots; card 06 uses enlarged details from those images.',cards:report},null,2)+'\n');
  }finally{await browser.close();}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
