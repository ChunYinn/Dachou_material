/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function(){(window.wpCoreControlsBundle=window.wpCoreControlsBundle||[]).push([[9],{532:function(wa,sa,r){function pa(fa){fa.Qa();fa.advance();var aa=fa.current.textContent;fa.wb();return aa}function na(fa){var aa=[];for(fa.Qa();fa.advance();){var ma=fa.Ya();"field"===ma?aa.push(String(fa.ha("name"))):Object(b.j)("unrecognised field list element: "+ma)}fa.wb();return aa}function oa(fa,aa){return aa?"false"!==fa:"true"===fa}function ia(fa,aa){var ma=fa.Ya();switch(ma){case "javascript":return{name:"JavaScript",
javascript:fa.current.textContent};case "uri":return{name:"URI",uri:fa.ha("uri")};case "goto":ma=null;fa.Qa();if(fa.advance()){var la=fa.ha("fit");ma={page:fa.ha("page"),fit:la};if("0"===ma.page)Object(b.j)("null page encountered in dest");else switch(aa=aa(Number(ma.page)),la){case "Fit":case "FitB":break;case "FitH":case "FitBH":ma.top=aa.wa({x:0,y:fa.ha("top")||0}).y;break;case "FitV":case "FitBV":ma.left=aa.wa({x:fa.ha("left")||0,y:0}).x;break;case "FitR":la=aa.wa({x:fa.ha("left")||0,y:fa.ha("top")||
0});aa=aa.wa({x:fa.ha("right")||0,y:fa.ha("bottom")||0});aa=new w.d(la.x,la.y,aa.x,aa.y);ma.top=aa.y1;ma.left=aa.x1;ma.bottom=aa.y2;ma.right=aa.x2;break;case "XYZ":la=aa.wa({x:fa.ha("left")||0,y:fa.ha("top")||0});ma.top=la.y;ma.left=la.x;ma.zoom=fa.ha("zoom")||0;break;default:Object(b.j)("unknown dest fit: "+la)}ma={name:"GoTo",dest:ma}}else Object(b.j)("missing dest in GoTo action");fa.wb();return ma;case "submit-form":ma={name:"SubmitForm",url:fa.ha("url"),format:fa.ha("format"),method:fa.ha("method")||
"POST",exclude:oa(fa.ha("exclude"),!1)};aa=fa.ha("flags");ma.flags=aa?aa.split(" "):[];for(fa.Qa();fa.advance();)switch(aa=fa.Ya(),aa){case "fields":ma.fields=na(fa);break;default:Object(b.j)("unrecognised submit-form child: "+aa)}fa.wb();return ma;case "reset-form":ma={name:"ResetForm",exclude:oa(fa.ha("exclude"),!1)};for(fa.Qa();fa.advance();)switch(aa=fa.Ya(),aa){case "fields":ma.fields=na(fa);break;default:Object(b.j)("unrecognised reset-form child: "+aa)}fa.wb();return ma;case "hide":ma={name:"Hide",
hide:oa(fa.ha("hide"),!0)};for(fa.Qa();fa.advance();)switch(aa=fa.Ya(),aa){case "fields":ma.fields=na(fa);break;default:Object(b.j)("unrecognised hide child: "+aa)}fa.wb();return ma;case "named":return{name:"Named",action:fa.ha("name")};default:Object(b.j)("Encountered unexpected action type: "+ma)}return null}function ka(fa,aa,ma){var la={};for(fa.Qa();fa.advance();){var ja=fa.Ya();switch(ja){case "action":ja=fa.ha("trigger");if(aa?-1!==aa.indexOf(ja):1){la[ja]=[];for(fa.Qa();fa.advance();){var ra=
ia(fa,ma);Object(h.isNull)(ra)||la[ja].push(ra)}fa.wb()}else Object(b.j)("encountered unexpected trigger on field: "+ja);break;default:Object(b.j)("encountered unknown action child: "+ja)}}fa.wb();return la}function ha(fa){return new z.a(fa.ha("r")||0,fa.ha("g")||0,fa.ha("b")||0,fa.ha("a")||1)}function y(fa,aa){var ma=fa.ha("name"),la=fa.ha("type")||"Type1",ja=fa.ha("size"),ra=aa.wa({x:0,y:0});ja=aa.wa({x:Number(ja),y:0});aa=ra.x-ja.x;ra=ra.y-ja.y;ma={name:ma,type:la,size:Math.sqrt(aa*aa+ra*ra)||
0,strokeColor:[0,0,0],fillColor:[0,0,0]};for(fa.Qa();fa.advance();)switch(la=fa.Ya(),la){case "stroke-color":ma.strokeColor=ha(fa);break;case "fill-color":ma.fillColor=ha(fa);break;default:Object(b.j)("unrecognised font child: "+la)}fa.wb();return ma}function x(fa){var aa=[];for(fa.Qa();fa.advance();){var ma=fa.Ya();switch(ma){case "option":ma=aa;var la=ma.push;var ja=fa;ja={value:ja.ha("value"),displayValue:ja.ha("display-value")||void 0};la.call(ma,ja);break;default:Object(b.j)("unrecognised options child: "+
ma)}}fa.wb();return aa}function f(fa,aa){var ma=fa.ha("name"),la={type:fa.ha("type"),quadding:fa.ha("quadding")||"Left-justified",maxLen:fa.ha("max-len")||-1},ja=fa.ha("flags");Object(h.isString)(ja)&&(la.flags=ja.split(" "));for(fa.Qa();fa.advance();)switch(ja=fa.Ya(),ja){case "actions":la.actions=ka(fa,["C","F","K","V"],function(){return aa});break;case "default-value":la.defaultValue=pa(fa);break;case "font":la.font=y(fa,aa);break;case "options":la.options=x(fa);break;default:Object(b.j)("unknown field child: "+
ja)}fa.wb();return new window.da.Annotations.ja.va(ma,la)}function e(fa,aa){switch(fa.type){case "Tx":try{if(Object(ea.c)(fa.actions))return new n.a.DatePickerWidgetAnnotation(fa,aa)}catch(ma){Object(b.j)(ma)}return new n.a.TextWidgetAnnotation(fa,aa);case "Ch":return fa.flags.get(ba.WidgetFlags.COMBO)?new n.a.ChoiceWidgetAnnotation(fa,aa):new n.a.ListWidgetAnnotation(fa,aa);case "Btn":return fa.flags.get(ba.WidgetFlags.PUSH_BUTTON)?new n.a.PushButtonWidgetAnnotation(fa,aa):fa.flags.get(ba.WidgetFlags.RADIO)?
new n.a.RadioButtonWidgetAnnotation(fa,aa):new n.a.CheckButtonWidgetAnnotation(fa,aa);case "Sig":return new n.a.SignatureWidgetAnnotation(fa,aa);default:Object(b.j)("Unrecognised field type: "+fa.type)}return null}function a(fa,aa,ma,la){var ja=[],ra={};fa.Qa();var qa=[],ta={},va=[];Object(ca.a)(function(){if(fa.advance()){var ya=fa.Ya();switch(ya){case "calculation-order":qa="calculation-order"===fa.Ya()?na(fa):[];break;case "document-actions":ta=ka(fa,["Init","Open"],aa);break;case "pages":ya=[];
for(fa.Qa();fa.advance();){var Ja=fa.Ya();switch(Ja){case "page":Ja=ya;var Ga=Ja.push,Da=fa,La=aa,Ca={number:Da.ha("number")};for(Da.Qa();Da.advance();){var Ka=Da.Ya();switch(Ka){case "actions":Ca.actions=ka(Da,["O","C"],La);break;default:Object(b.j)("unrecognised page child: "+Ka)}}Da.wb();Ga.call(Ja,Ca);break;default:Object(b.j)("unrecognised page child: "+Ja)}}fa.wb();va=ya;break;case "field":Ja=f(fa,aa(1));ra[Ja.name]=Ja;break;case "widget":ya={border:{style:"Solid",width:1},backgroundColor:[],
fieldName:fa.ha("field"),page:fa.ha("page"),index:fa.ha("index")||0,rotation:fa.ha("rotation")||0,flags:[],isImporting:!0};(Ja=fa.ha("appearance"))&&(ya.appearance=Ja);(Ja=fa.ha("flags"))&&(ya.flags=Ja.split(" "));for(fa.Qa();fa.advance();)switch(Ja=fa.Ya(),Ja){case "rect":Ga=fa;Da=aa(Number(ya.page));Ja=Da.wa({x:Ga.ha("x1")||0,y:Ga.ha("y1")||0});Ga=Da.wa({x:Ga.ha("x2")||0,y:Ga.ha("y2")||0});Ja=new w.d(Ja.x,Ja.y,Ga.x,Ga.y);Ja.normalize();ya.rect={x1:Ja.x1,y1:Ja.y1,x2:Ja.x2,y2:Ja.y2};break;case "border":Ja=
fa;Ga={style:Ja.ha("style")||"Solid",width:Ja.ha("width")||1,color:[0,0,0]};for(Ja.Qa();Ja.advance();)switch(Da=Ja.Ya(),Da){case "color":Ga.color=ha(Ja);break;default:Object(b.j)("unrecognised border child: "+Da)}Ja.wb();ya.border=Ga;break;case "background-color":ya.backgroundColor=ha(fa);break;case "actions":ya.actions=ka(fa,"E X D U Fo Bl PO PC PV PI".split(" "),aa);break;case "appearances":Ja=fa;Ga=Object(ea.b)(ya,"appearances");for(Ja.Qa();Ja.advance();)if(Da=Ja.Ya(),"appearance"===Da){Da=Ja.ha("name");
La=Object(ea.b)(Ga,Da);Da=Ja;for(Da.Qa();Da.advance();)switch(Ca=Da.Ya(),Ca){case "Normal":Object(ea.b)(La,"Normal").data=Da.current.textContent;break;default:Object(b.j)("unexpected appearance state: ",Ca)}Da.wb()}else Object(b.j)("unexpected appearances child: "+Da);Ja.wb();break;case "extra":Ja=fa;Ga=aa;Da={};for(Ja.Qa();Ja.advance();)switch(La=Ja.Ya(),La){case "font":Da.font=y(Ja,Ga(1));break;default:Object(b.j)("unrecognised extra child: "+La)}Ja.wb();Ja=Da;Ja.font&&(ya.font=Ja.font);break;case "captions":Ga=
fa;Ja={};(Da=Ga.ha("Normal"))&&(Ja.Normal=Da);(Da=Ga.ha("Rollover"))&&(Ja.Rollover=Da);(Ga=Ga.ha("Down"))&&(Ja.Down=Ga);ya.captions=Ja;break;default:Object(b.j)("unrecognised widget child: "+Ja)}fa.wb();(Ja=ra[ya.fieldName])?(ya=e(Ja,ya),ja.push(ya)):Object(b.j)("ignoring widget with no corresponding field data: "+ya.fieldName);break;default:Object(b.j)("Unknown element encountered in PDFInfo: "+ya)}return!0}return!1},function(){fa.wb();ma({calculationOrder:qa,widgets:ja,fields:ra,documentActions:ta,
pages:va,custom:[]})},la)}r.r(sa);r.d(sa,"parse",function(){return a});var b=r(3),h=r(1);r.n(h);var n=r(140),w=r(4),z=r(9),ca=r(22),ea=r(122),ba=r(17)}}]);}).call(this || window)
