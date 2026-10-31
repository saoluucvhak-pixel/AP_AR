// Dựng sổ giả (N chứng từ, 800 phiếu) cho test/đo hiệu năng: seedWorld(đường_dẫn_Backend.gs, N) → {ctx,C,S,user}. Dữ liệu giả.
const vm=require('vm');
const ENV=require('./_env.cjs');
function seedWorld(srcPath,N){
  const {ctx,C,S}=ENV(srcPath);
  const T=['Partner','DebtDoc','DebtLine','Allocation','Payment','Catalog','Config','Period','Order','Accrual','AccrualSplit'];T.forEach(t=>ctx.repoSheet_(t));
  const partners=[];for(let i=0;i<60;i++)partners.push({id:'p'+i,shortName:'KH'+i,legalName:'KH'+i,isCustomer:1,isSupplier:i%3===0?1:0,status:'ACTIVE',version:1,isDeleted:0,commitState:'C'});ctx.repoAppend_('Partner',partners);
  const docs=[],lines=[],pays=[],allocs=[];
  for(let i=0;i<N;i++){const d={id:'d'+i,docNo:'CT-'+i,direction:i%2?'AP':'AR',docType:'INVOICE',partnerId:'p'+(i%60),currency:i%7?'VND':'USD',businessGroupCode:'G1',docDate:'2026-0'+(1+i%9)+'-1'+(i%9),postingDate:'2026-0'+(1+i%9)+'-1'+(i%9),status:'POSTED',totalGrossMinor:3000+i,dueDate:i%5?'2026-1'+(i%3)+'-20':'',isOpening:0,version:1,isDeleted:0,commitState:'C',createdAt:'2026-01-01T00:00:00Z',warningsJson:''};docs.push(d);
    for(let k=0;k<2;k++){lines.push({id:'l'+i+'_'+k,docId:d.id,lineNo:k+1,feeTypeCode:'F',description:'Phí '+k,netMinor:(1500+i/2)|0,grossMinor:k?3000+i-((1500+i/2)|0):(1500+i/2)|0,vatMinor:0,vatMode:'NONE',version:1,isDeleted:0,commitState:'C'})}
    if(i%3===0)allocs.push({id:'a'+i,paymentId:'y'+(i%800),debtLineId:'l'+i+'_0',docId:d.id,amountMinor:500,effectiveDate:'2026-10-01',version:1,isDeleted:0,commitState:'C'});}
  for(let i=0;i<800;i++)pays.push({id:'y'+i,payNo:'PT-'+i,direction:'IN',partnerId:'p'+(i%60),currency:'VND',amountMinor:100000,effectiveDate:'2026-10-0'+(1+i%9),method:'BANK',status:'POSTED',version:1,isDeleted:0,commitState:'C'});
  ctx.repoAppend_('DebtDoc',docs);ctx.repoAppend_('DebtLine',lines);ctx.repoAppend_('Payment',pays);ctx.repoAppend_('Allocation',allocs);
  ctx.repoAppend_('Config',[{id:'ledgerStartDate',value:'2026-01-01',version:1,isDeleted:0,commitState:'C'}]);
  const user={id:'u1',email:'a@x.vn',displayName:'A',role:'APPROVER',scope:{allPartners:true}};
  return {ctx,C,S,user};
}
module.exports={seedWorld};
