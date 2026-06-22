const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'universities');
const idx=JSON.parse(fs.readFileSync(path.join(dir,'_index.json'),'utf8'));
idx.universities.forEach(u=>{ try{ const a=JSON.parse(fs.readFileSync(path.join(dir,u.abbr,'admissions.json'),'utf8')); if(a.applicationFee!=null)u.fee=a.applicationFee; }catch(e){ console.warn('skip',u.abbr); } });
fs.writeFileSync(path.join(dir,'_index.json'),JSON.stringify(idx,null,2)+'\n');
console.log('fee added to',idx.universities.filter(u=>u.fee!=null).length,'entries');
