/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function(){(window.wpCoreControlsBundle=window.wpCoreControlsBundle||[]).push([[14],{528:function(wa,sa,r){r.r(sa);var pa=r(0),na=r(294);wa=r(518);var oa=r(113);r=r(439);var ia={},ka=function(ha){function y(x,f){var e=ha.call(this,x,f)||this;e.url=x;e.range=f;e.status=na.a.NOT_STARTED;return e}Object(pa.c)(y,ha);y.prototype.start=function(x){var f=this;"undefined"===typeof ia[this.range.start]&&(ia[this.range.start]={zT:function(e){var a=atob(e),b,h=a.length;e=new Uint8Array(h);for(b=0;b<h;++b)e[b]=a.charCodeAt(b);
a=e.length;b="";for(var n=0;n<a;)h=e.subarray(n,n+1024),n+=1024,b+=String.fromCharCode.apply(null,h);f.zT(b,x)},LEa:function(){f.status=na.a.ERROR;x({code:f.status})}},window.external.notify(this.url),this.status=na.a.STARTED);f.OG()};return y}(wa.ByteRangeRequest);wa=function(ha){function y(x,f,e,a){x=ha.call(this,x,e,a)||this;x.KB=ka;return x}Object(pa.c)(y,ha);y.prototype.gz=function(x,f){return x+"?"+f.start+"&"+(f.stop?f.stop:"")};return y}(oa.a);Object(r.a)(wa);Object(r.b)(wa);sa["default"]=
wa}}]);}).call(this || window)
