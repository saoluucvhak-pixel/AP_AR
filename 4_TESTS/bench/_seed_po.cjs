// Dữ liệu thử có PO thật (dùng chung cho po.bench.cjs và slice-read.test.cjs): Order, Accrual gắn dòng, AccrualSplit, hóa đơn nhiều dòng, điều chỉnh, thanh toán, phân bổ.
function seed(ctx,N){
  const T=['Partner','DebtDoc','DebtLine','Allocation','Payment','Catalog','Config','Period','Order','Accrual','AccrualSplit'];T.forEach(t=>ctx.repoSheet_(t));
  const B=o=>Object.assign({version:1,isDeleted:0,commitState:'C'},o);
  const partners=[];for(let i=0;i<60;i++)partners.push(B({id:'p'+i,shortName:'KH'+i,legalName:'KH'+i,isCustomer:1,isSupplier:i%3===0?1:0,status:'ACTIVE'}));ctx.repoAppend_('Partner',partners);
  const nOrd=Math.max(10,Math.floor(N/5)),orders=[],accs=[],splits=[],docs=[],lines=[],allocs=[],pays=[];
  for(let i=0;i<nOrd;i++)orders.push(B({id:'o'+i,orderNo:'DH-'+i,poNo:'PO'+i,customerPartnerId:'p'+(i%60),businessGroupCode:'G1',currency:'VND',orderDate:'2026-09-01',status:'OPEN',servicesJson:JSON.stringify([{code:'FWD',hsdvNo:'HS'+i}]),serviceCode:'FWD',hsdvNo:'HS'+i}));
  let ln=0;
  for(let i=0;i<N;i++){
    const ds='2026-0'+(1+i%9)+'-1'+(i%9),dir=i%2?'AP':'AR',adj=i%33===0&&i>0;
    docs.push(B({id:'d'+i,docNo:'CT-'+i,direction:dir,docType:adj?'ADJ_INC':'INVOICE',partnerId:'p'+(i%60),currency:'VND',businessGroupCode:'G1',docDate:ds,postingDate:ds,status:'POSTED',totalGrossMinor:3000+i,dueDate:'2026-12-01',isOpening:0,adjustsDocId:adj?'d'+(i-1):'',reversesDocId:'',invoiceNo:'HD'+i,periodId:ds.slice(0,7)}));
    for(let k=0;k<3;k++){
      const id='l'+i+'_'+k,aid='a'+i+'_'+k,oid='o'+((i*3+k)%nOrd),useSplit=(i+k)%20===0;
      const line=B({id,docId:'d'+i,lineNo:k+1,feeTypeCode:'F',description:'Phí '+k,netMinor:1000,grossMinor:1000,vatMinor:0,vatMode:'NONE',serviceCode:'FWD'});
      if(adj)line.adjustsLineId='l'+(i-1)+'_'+k;else{line.accrualId=aid;accs.push(B({id:aid,orderId:useSplit?'':oid,kind:dir==='AR'?'REVENUE':'COST',partnerId:'p'+(i%60),poRef:dir==='AP'?'NCC-'+i:'',accrualDate:ds,feeTypeCode:'F',description:'x',netMinor:1000,vatMode:'NONE',vatMinor:0,grossMinor:1000,currency:'VND',status:'INVOICED',docId:'d'+i,debtLineId:id}));
        if(useSplit){splits.push(B({id:'s'+ln++,accrualId:aid,orderId:oid,shareNetMinor:500,shareVatMinor:0,shareGrossMinor:500,basis:'EQUAL'}),B({id:'s'+ln++,accrualId:aid,orderId:'o'+((i*3+k+7)%nOrd),shareNetMinor:500,shareVatMinor:0,shareGrossMinor:500,basis:'EQUAL'}))}}
      lines.push(line);
      if(!adj&&(i+k)%3===0)allocs.push(B({id:'al'+i+'_'+k,paymentId:'y'+(i%800),debtLineId:id,docId:'d'+i,amountMinor:300,effectiveDate:'2026-10-01'}));
    }
  }
  for(let i=0;i<800;i++)pays.push(B({id:'y'+i,payNo:'PT-'+i,direction:'IN',partnerId:'p'+(i%60),currency:'VND',amountMinor:1000000,effectiveDate:'2026-10-0'+(1+i%9),method:'BANK',status:'POSTED'}));
  ctx.repoAppend_('Order',orders);ctx.repoAppend_('Accrual',accs);ctx.repoAppend_('AccrualSplit',splits);ctx.repoAppend_('DebtDoc',docs);ctx.repoAppend_('DebtLine',lines);ctx.repoAppend_('Allocation',allocs);ctx.repoAppend_('Payment',pays);
  ctx.repoAppend_('Config',[B({id:'ledgerStartDate',value:'2026-01-01'})]);
  return {orders:orders.length,accruals:accs.length,splits:splits.length,docs:docs.length,lines:lines.length,allocs:allocs.length};
}
module.exports=seed;
