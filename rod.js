const {chromium}=require('/home/malneto/projects/polinesia-reservas/node_modules/playwright-core');
(async()=>{
 const b=await chromium.launch({executablePath:'/home/malneto/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:390,height:844}});
 await p.goto('https://polinesiaresort.com.br/',{waitUntil:'domcontentloaded'});
 await p.waitForTimeout(2500);
 const vistas=[];
 for(let i=0;i<3;i++){ vistas.push(await p.evaluate(()=>document.getElementById('heroImg').src.split('/').pop())); await p.waitForTimeout(10500); }
 console.log('  fotos que apareceram:', vistas.join(' → '));
 await b.close();
})();
