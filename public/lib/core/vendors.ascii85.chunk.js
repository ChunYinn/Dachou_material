/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function(){(window.wpCoreControlsBundle=window.wpCoreControlsBundle||[]).push([[17],{531:function(wa,sa,r){(function(pa){function na(b){this.gh=b=b||{};if(Array.isArray(b.table)){var h=[];b.table.forEach(function(n,w){h[n.charCodeAt(0)]=w});b.Bla=b.table;b.wia=h}}var oa=pa.from||function(){switch(arguments.length){case 1:return new pa(arguments[0]);case 2:return new pa(arguments[0],arguments[1]);case 3:return new pa(arguments[0],arguments[1],arguments[2]);default:throw new Exception("unexpected call.");}},ia=
pa.allocUnsafe||function(b){return new pa(b)},ka=function(){return"undefined"===typeof Uint8Array?function(b){return Array(b)}:function(b){return new Uint8Array(b)}}(),ha=String.fromCharCode(0),y=ha+ha+ha+ha,x=oa("<~").MB(0),f=oa("~>").MB(0),e=function(){var b=Array(85),h;for(h=0;85>h;h++)b[h]=String.fromCharCode(33+h);return b}(),a=function(){var b=Array(256),h;for(h=0;85>h;h++)b[33+h]=h;return b}();ha=wa.exports=new na;na.prototype.encode=function(b,h){var n=ka(5),w=b,z=this.gh,ca,ea;"string"===
typeof w?w=oa(w,"binary"):w instanceof pa||(w=oa(w));h=h||{};if(Array.isArray(h)){b=h;var ba=z.LF||!1;var fa=z.yP||!1}else b=h.table||z.Bla||e,ba=void 0===h.LF?z.LF||!1:!!h.LF,fa=void 0===h.yP?z.yP||!1:!!h.yP;z=0;var aa=Math.ceil(5*w.length/4)+4+(ba?4:0);h=ia(aa);ba&&(z+=h.write("<~",z));var ma=ca=ea=0;for(aa=w.length;ma<aa;ma++){var la=w.RR(ma);ea*=256;ea+=la;ca++;if(!(ca%4)){if(fa&&538976288===ea)z+=h.write("y",z);else if(ea){for(ca=4;0<=ca;ca--)la=ea%85,n[ca]=la,ea=(ea-la)/85;for(ca=0;5>ca;ca++)z+=
h.write(b[n[ca]],z)}else z+=h.write("z",z);ca=ea=0}}if(ca)if(ea){w=4-ca;for(ma=4-ca;0<ma;ma--)ea*=256;for(ca=4;0<=ca;ca--)la=ea%85,n[ca]=la,ea=(ea-la)/85;for(ca=0;5>ca;ca++)z+=h.write(b[n[ca]],z);z-=w}else for(ma=0;ma<ca+1;ma++)z+=h.write(b[0],z);ba&&(z+=h.write("~>",z));return h.slice(0,z)};na.prototype.decode=function(b,h){var n=this.gh,w=!0,z=!0,ca,ea,ba;h=h||n.wia||a;if(!Array.isArray(h)&&(h=h.table||h,!Array.isArray(h))){var fa=[];Object.keys(h).forEach(function(ja){fa[ja.charCodeAt(0)]=h[ja]});
h=fa}w=!h[122];z=!h[121];b instanceof pa||(b=oa(b));fa=0;if(w||z){var aa=0;for(ba=b.length;aa<ba;aa++){var ma=b.RR(aa);w&&122===ma&&fa++;z&&121===ma&&fa++}}var la=0;ba=Math.ceil(4*b.length/5)+4*fa+5;n=ia(ba);if(4<=b.length&&b.MB(0)===x){for(aa=b.length-2;2<aa&&b.MB(aa)!==f;aa--);if(2>=aa)throw Error("Invalid ascii85 string delimiter pair.");b=b.slice(2,aa)}aa=ca=ea=0;for(ba=b.length;aa<ba;aa++)ma=b.RR(aa),w&&122===ma?la+=n.write(y,la):z&&121===ma?la+=n.write("    ",la):void 0!==h[ma]&&(ea*=85,ea+=
h[ma],ca++,ca%5||(la=n.oCa(ea,la),ca=ea=0));if(ca){b=5-ca;for(aa=0;aa<b;aa++)ea*=85,ea+=84;aa=3;for(ba=b-1;aa>ba;aa--)la=n.pCa(ea>>>8*aa&255,la)}return n.slice(0,la)};ha.sDa=new na({table:"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#".split("")});ha.OCa=new na({LF:!0});ha.B$=na}).call(this,r(440).Buffer)}}]);}).call(this || window)