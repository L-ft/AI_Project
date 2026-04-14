import{P as We}from"./PageTopbar-8dee475e.js";import{X as Le,x as D,bl as qe,d as W,z as f,l as ge,T as B,n as m,M as E,p as k,q as fe,r as z,C as Be,B as pe,Z as me,s as re,y as he,aX as Ge,av as Ee,Y as Je,O as Ke,v as De,S as Qe,a0 as de,bm as Ze,a9 as Xe,aZ as Ye,ao as et,aN as tt,b0 as lt,aO as at,bn as we,bo as Ce,bp as rt,V as ot,W as nt,A as st,L as X,bq as it,br as dt,bs as ct,bt as ut,aU as pt,bu as mt,aV as be,bv as ft,m as L,c as ce,b as a,w as o,e as l,o as F,N as bt,af as vt,a5 as q,h as Y,g as _,H as _e,j as G,a as $e,k as ee,a4 as ve,t as J,i as te,b7 as ue}from"./index-a617abee.js";import{r as gt,s as ht,N as yt}from"./RadioGroup-295bfd79.js";import{N as le}from"./Alert-36bb98c9.js";import{N as Se,b as Q}from"./Tabs-2dbe879f.js";import{N as Ne,a as Z}from"./FormItem-1139e69e.js";import{N as xt,a as ne}from"./Grid-a00c1921.js";import{N as se}from"./Input-f4d11830.js";import{N as ze}from"./InputNumber-1db5ec39.js";import{N as Pe}from"./Select-e1aa2df2.js";import{N as Re}from"./DataTable-872ae7c9.js";import{N as wt}from"./Switch-9d3758ff.js";import{N as Ct}from"./Scrollbar-2b030363.js";import{_ as _t}from"./_plugin-vue_export-helper-c27b6911.js";import"./Add-5fecefa9.js";import"./use-locale-41a74395.js";import"./Empty-53f0d05f.js";import"./VirtualList-6171be83.js";import"./Checkbox-d061ff6c.js";import"./download-953ccaa2.js";function je(e,t="default",c=[]){const{children:n}=e;if(n!==null&&typeof n=="object"&&!Array.isArray(n)){const u=n[t];if(typeof u=="function")return u()}return c}function $t(e,t){const c=Le(qe,null);return D(()=>e.hljs||(c==null?void 0:c.mergedHljsRef.value))}const St=W({name:"ChevronLeft",render(){return f("svg",{viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg"},f("path",{d:"M10.3536 3.14645C10.5488 3.34171 10.5488 3.65829 10.3536 3.85355L6.20711 8L10.3536 12.1464C10.5488 12.3417 10.5488 12.6583 10.3536 12.8536C10.1583 13.0488 9.84171 13.0488 9.64645 12.8536L5.14645 8.35355C4.95118 8.15829 4.95118 7.84171 5.14645 7.64645L9.64645 3.14645C9.84171 2.95118 10.1583 2.95118 10.3536 3.14645Z",fill:"currentColor"}))}});function Nt(e){const{textColor2:t,fontSize:c,fontWeightStrong:n,textColor3:u}=e;return{textColor:t,fontSize:c,fontWeightStrong:n,"mono-3":"#a0a1a7","hue-1":"#0184bb","hue-2":"#4078f2","hue-3":"#a626a4","hue-4":"#50a14f","hue-5":"#e45649","hue-5-2":"#c91243","hue-6":"#986801","hue-6-2":"#c18401",lineNumberTextColor:u}}const zt={name:"Code",common:ge,self:Nt},Pt=zt,Rt=B([m("code",`
 font-size: var(--n-font-size);
 font-family: var(--n-font-family);
 `,[E("show-line-numbers",`
 display: flex;
 `),k("line-numbers",`
 user-select: none;
 padding-right: 12px;
 text-align: right;
 transition: color .3s var(--n-bezier);
 color: var(--n-line-number-text-color);
 `),E("word-wrap",[B("pre",`
 white-space: pre-wrap;
 word-break: break-all;
 `)]),B("pre",`
 margin: 0;
 line-height: inherit;
 font-size: inherit;
 font-family: inherit;
 `),B("[class^=hljs]",`
 color: var(--n-text-color);
 transition: 
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `)]),({props:e})=>{const t=`${e.bPrefix}code`;return[`${t} .hljs-comment,
 ${t} .hljs-quote {
 color: var(--n-mono-3);
 font-style: italic;
 }`,`${t} .hljs-doctag,
 ${t} .hljs-keyword,
 ${t} .hljs-formula {
 color: var(--n-hue-3);
 }`,`${t} .hljs-section,
 ${t} .hljs-name,
 ${t} .hljs-selector-tag,
 ${t} .hljs-deletion,
 ${t} .hljs-subst {
 color: var(--n-hue-5);
 }`,`${t} .hljs-literal {
 color: var(--n-hue-1);
 }`,`${t} .hljs-string,
 ${t} .hljs-regexp,
 ${t} .hljs-addition,
 ${t} .hljs-attribute,
 ${t} .hljs-meta-string {
 color: var(--n-hue-4);
 }`,`${t} .hljs-built_in,
 ${t} .hljs-class .hljs-title {
 color: var(--n-hue-6-2);
 }`,`${t} .hljs-attr,
 ${t} .hljs-variable,
 ${t} .hljs-template-variable,
 ${t} .hljs-type,
 ${t} .hljs-selector-class,
 ${t} .hljs-selector-attr,
 ${t} .hljs-selector-pseudo,
 ${t} .hljs-number {
 color: var(--n-hue-6);
 }`,`${t} .hljs-symbol,
 ${t} .hljs-bullet,
 ${t} .hljs-link,
 ${t} .hljs-meta,
 ${t} .hljs-selector-id,
 ${t} .hljs-title {
 color: var(--n-hue-2);
 }`,`${t} .hljs-emphasis {
 font-style: italic;
 }`,`${t} .hljs-strong {
 font-weight: var(--n-font-weight-strong);
 }`,`${t} .hljs-link {
 text-decoration: underline;
 }`]}]),jt=Object.assign(Object.assign({},re.props),{language:String,code:{type:String,default:""},trim:{type:Boolean,default:!0},hljs:Object,uri:Boolean,inline:Boolean,wordWrap:Boolean,showLineNumbers:Boolean,internalFontSize:Number,internalNoHighlight:Boolean}),ke=W({name:"Code",props:jt,setup(e,{slots:t}){const{internalNoHighlight:c}=e,{mergedClsPrefixRef:n,inlineThemeDisabled:u}=fe(),i=z(null),b=c?{value:void 0}:$t(e),S=(v,$,h)=>{const{value:g}=b;return!g||!(v&&g.getLanguage(v))?null:g.highlight(h?$.trim():$,{language:v}).value},R=D(()=>e.inline||e.wordWrap?!1:e.showLineNumbers),w=()=>{if(t.default)return;const{value:v}=i;if(!v)return;const{language:$}=e,h=e.uri?window.decodeURIComponent(e.code):e.code;if($){const x=S($,h,e.trim);if(x!==null){if(e.inline)v.innerHTML=x;else{const s=v.querySelector(".__code__");s&&v.removeChild(s);const N=document.createElement("pre");N.className="__code__",N.innerHTML=x,v.appendChild(N)}return}}if(e.inline){v.textContent=h;return}const g=v.querySelector(".__code__");if(g)g.textContent=h;else{const x=document.createElement("pre");x.className="__code__",x.textContent=h,v.innerHTML="",v.appendChild(x)}};Be(w),pe(me(e,"language"),w),pe(me(e,"code"),w),c||pe(b,w);const P=re("Code","-code",Rt,Pt,e,n),d=D(()=>{const{common:{cubicBezierEaseInOut:v,fontFamilyMono:$},self:{textColor:h,fontSize:g,fontWeightStrong:x,lineNumberTextColor:s,"mono-3":N,"hue-1":T,"hue-2":j,"hue-3":I,"hue-4":M,"hue-5":O,"hue-5-2":A,"hue-6":U,"hue-6-2":H}}=P.value,{internalFontSize:V}=e;return{"--n-font-size":V?`${V}px`:g,"--n-font-family":$,"--n-font-weight-strong":x,"--n-bezier":v,"--n-text-color":h,"--n-mono-3":N,"--n-hue-1":T,"--n-hue-2":j,"--n-hue-3":I,"--n-hue-4":M,"--n-hue-5":O,"--n-hue-5-2":A,"--n-hue-6":U,"--n-hue-6-2":H,"--n-line-number-text-color":s}}),p=u?he("code",D(()=>`${e.internalFontSize||"a"}`),d,e):void 0;return{mergedClsPrefix:n,codeRef:i,mergedShowLineNumbers:R,lineNumbers:D(()=>{let v=1;const $=[];let h=!1;for(const g of e.code)g===`
`?(h=!0,$.push(v++)):h=!1;return h||$.push(v++),$.join(`
`)}),cssVars:u?void 0:d,themeClass:p==null?void 0:p.themeClass,onRender:p==null?void 0:p.onRender}},render(){var e,t;const{mergedClsPrefix:c,wordWrap:n,mergedShowLineNumbers:u,onRender:i}=this;return i==null||i(),f("code",{class:[`${c}-code`,this.themeClass,n&&`${c}-code--word-wrap`,u&&`${c}-code--show-line-numbers`],style:this.cssVars,ref:"codeRef"},u?f("pre",{class:`${c}-code__line-numbers`},this.lineNumbers):null,(t=(e=this.$slots).default)===null||t===void 0?void 0:t.call(e))}});function kt(e){const{fontWeight:t,textColor1:c,textColor2:n,textColorDisabled:u,dividerColor:i,fontSize:b}=e;return{titleFontSize:b,titleFontWeight:t,dividerColor:i,titleTextColor:c,titleTextColorDisabled:u,fontSize:b,textColor:n,arrowColor:n,arrowColorDisabled:u,itemMargin:"16px 0 0 0",titlePadding:"16px 0 0 0"}}const Tt={name:"Collapse",common:ge,self:kt},It=Tt,Lt=m("collapse","width: 100%;",[m("collapse-item",`
 font-size: var(--n-font-size);
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 margin: var(--n-item-margin);
 `,[E("disabled",[k("header","cursor: not-allowed;",[k("header-main",`
 color: var(--n-title-text-color-disabled);
 `),m("collapse-item-arrow",`
 color: var(--n-arrow-color-disabled);
 `)])]),m("collapse-item","margin-left: 32px;"),B("&:first-child","margin-top: 0;"),B("&:first-child >",[k("header","padding-top: 0;")]),E("left-arrow-placement",[k("header",[m("collapse-item-arrow","margin-right: 4px;")])]),E("right-arrow-placement",[k("header",[m("collapse-item-arrow","margin-left: 4px;")])]),k("content-wrapper",[k("content-inner","padding-top: 16px;"),Ge({duration:"0.15s"})]),E("active",[k("header",[E("active",[m("collapse-item-arrow","transform: rotate(90deg);")])])]),B("&:not(:first-child)","border-top: 1px solid var(--n-divider-color);"),Ee("disabled",[E("trigger-area-main",[k("header",[k("header-main","cursor: pointer;"),m("collapse-item-arrow","cursor: default;")])]),E("trigger-area-arrow",[k("header",[m("collapse-item-arrow","cursor: pointer;")])]),E("trigger-area-extra",[k("header",[k("header-extra","cursor: pointer;")])])]),k("header",`
 font-size: var(--n-title-font-size);
 display: flex;
 flex-wrap: nowrap;
 align-items: center;
 transition: color .3s var(--n-bezier);
 position: relative;
 padding: var(--n-title-padding);
 color: var(--n-title-text-color);
 `,[k("header-main",`
 display: flex;
 flex-wrap: nowrap;
 align-items: center;
 font-weight: var(--n-title-font-weight);
 transition: color .3s var(--n-bezier);
 flex: 1;
 color: var(--n-title-text-color);
 `),k("header-extra",`
 display: flex;
 align-items: center;
 transition: color .3s var(--n-bezier);
 color: var(--n-text-color);
 `),m("collapse-item-arrow",`
 display: flex;
 transition:
 transform .15s var(--n-bezier),
 color .3s var(--n-bezier);
 font-size: 18px;
 color: var(--n-arrow-color);
 `)])])]),Bt=Object.assign(Object.assign({},re.props),{defaultExpandedNames:{type:[Array,String],default:null},expandedNames:[Array,String],arrowPlacement:{type:String,default:"left"},accordion:{type:Boolean,default:!1},displayDirective:{type:String,default:"if"},triggerAreas:{type:Array,default:()=>["main","extra","arrow"]},onItemHeaderClick:[Function,Array],"onUpdate:expandedNames":[Function,Array],onUpdateExpandedNames:[Function,Array],onExpandedNamesChange:{type:[Function,Array],validator:()=>!0,default:void 0}}),Ae=Qe("n-collapse"),Et=W({name:"Collapse",props:Bt,slots:Object,setup(e,{slots:t}){const{mergedClsPrefixRef:c,inlineThemeDisabled:n,mergedRtlRef:u}=fe(e),i=z(e.defaultExpandedNames),b=D(()=>e.expandedNames),S=Je(b,i),R=re("Collapse","-collapse",Lt,It,e,c);function w(h){const{"onUpdate:expandedNames":g,onUpdateExpandedNames:x,onExpandedNamesChange:s}=e;x&&de(x,h),g&&de(g,h),s&&de(s,h),i.value=h}function P(h){const{onItemHeaderClick:g}=e;g&&de(g,h)}function d(h,g,x){const{accordion:s}=e,{value:N}=S;if(s)h?(w([g]),P({name:g,expanded:!0,event:x})):(w([]),P({name:g,expanded:!1,event:x}));else if(!Array.isArray(N))w([g]),P({name:g,expanded:!0,event:x});else{const T=N.slice(),j=T.findIndex(I=>g===I);~j?(T.splice(j,1),w(T),P({name:g,expanded:!1,event:x})):(T.push(g),w(T),P({name:g,expanded:!0,event:x}))}}Ke(Ae,{props:e,mergedClsPrefixRef:c,expandedNamesRef:S,slots:t,toggleItem:d});const p=De("Collapse",u,c),v=D(()=>{const{common:{cubicBezierEaseInOut:h},self:{titleFontWeight:g,dividerColor:x,titlePadding:s,titleTextColor:N,titleTextColorDisabled:T,textColor:j,arrowColor:I,fontSize:M,titleFontSize:O,arrowColorDisabled:A,itemMargin:U}}=R.value;return{"--n-font-size":M,"--n-bezier":h,"--n-text-color":j,"--n-divider-color":x,"--n-title-padding":s,"--n-title-font-size":O,"--n-title-text-color":N,"--n-title-text-color-disabled":T,"--n-title-font-weight":g,"--n-arrow-color":I,"--n-arrow-color-disabled":A,"--n-item-margin":U}}),$=n?he("collapse",void 0,v,e):void 0;return{rtlEnabled:p,mergedTheme:R,mergedClsPrefix:c,cssVars:n?void 0:v,themeClass:$==null?void 0:$.themeClass,onRender:$==null?void 0:$.onRender}},render(){var e;return(e=this.onRender)===null||e===void 0||e.call(this),f("div",{class:[`${this.mergedClsPrefix}-collapse`,this.rtlEnabled&&`${this.mergedClsPrefix}-collapse--rtl`,this.themeClass],style:this.cssVars},this.$slots)}}),Dt=W({name:"CollapseItemContent",props:{displayDirective:{type:String,required:!0},show:Boolean,clsPrefix:{type:String,required:!0}},setup(e){return{onceTrue:Ze(me(e,"show"))}},render(){return f(Ye,null,{default:()=>{const{show:e,displayDirective:t,onceTrue:c,clsPrefix:n}=this,u=t==="show"&&c,i=f("div",{class:`${n}-collapse-item__content-wrapper`},f("div",{class:`${n}-collapse-item__content-inner`},this.$slots));return u?Xe(i,[[et,e]]):e?i:null}})}}),At={title:String,name:[String,Number],disabled:Boolean,displayDirective:String},Mt=W({name:"CollapseItem",props:At,setup(e){const{mergedRtlRef:t}=fe(e),c=tt(),n=lt(()=>{var d;return(d=e.name)!==null&&d!==void 0?d:c}),u=Le(Ae);u||at("collapse-item","`n-collapse-item` must be placed inside `n-collapse`.");const{expandedNamesRef:i,props:b,mergedClsPrefixRef:S,slots:R}=u,w=D(()=>{const{value:d}=i;if(Array.isArray(d)){const{value:p}=n;return!~d.findIndex(v=>v===p)}else if(d){const{value:p}=n;return p!==d}return!0});return{rtlEnabled:De("Collapse",t,S),collapseSlots:R,randomName:c,mergedClsPrefix:S,collapsed:w,triggerAreas:me(b,"triggerAreas"),mergedDisplayDirective:D(()=>{const{displayDirective:d}=e;return d||b.displayDirective}),arrowPlacement:D(()=>b.arrowPlacement),handleClick(d){let p="main";we(d,"arrow")&&(p="arrow"),we(d,"extra")&&(p="extra"),b.triggerAreas.includes(p)&&u&&!e.disabled&&u.toggleItem(w.value,n.value,d)}}},render(){const{collapseSlots:e,$slots:t,arrowPlacement:c,collapsed:n,mergedDisplayDirective:u,mergedClsPrefix:i,disabled:b,triggerAreas:S}=this,R=Ce(t.header,{collapsed:n},()=>[this.title]),w=t["header-extra"]||e["header-extra"],P=t.arrow||e.arrow;return f("div",{class:[`${i}-collapse-item`,`${i}-collapse-item--${c}-arrow-placement`,b&&`${i}-collapse-item--disabled`,!n&&`${i}-collapse-item--active`,S.map(d=>`${i}-collapse-item--trigger-area-${d}`)]},f("div",{class:[`${i}-collapse-item__header`,!n&&`${i}-collapse-item__header--active`]},f("div",{class:`${i}-collapse-item__header-main`,onClick:this.handleClick},c==="right"&&R,f("div",{class:`${i}-collapse-item-arrow`,key:this.rtlEnabled?0:1,"data-arrow":!0},Ce(P,{collapsed:n},()=>[f(ot,{clsPrefix:i},{default:()=>this.rtlEnabled?f(St,null):f(nt,null)})])),c==="left"&&R),rt(w,{collapsed:n},d=>f("div",{class:`${i}-collapse-item__header-extra`,onClick:this.handleClick,"data-extra":!0},d))),f(Dt,{clsPrefix:i,displayDirective:u,show:!n},t))}}),Te=W({name:"RadioButton",props:gt,setup:ht,render(){const{mergedClsPrefix:e}=this;return f("label",{class:[`${e}-radio-button`,this.mergedDisabled&&`${e}-radio-button--disabled`,this.renderSafeChecked&&`${e}-radio-button--checked`,this.focus&&[`${e}-radio-button--focus`]]},f("input",{ref:"inputRef",type:"radio",class:`${e}-radio-input`,value:this.value,name:this.mergedName,checked:this.renderSafeChecked,disabled:this.mergedDisabled,onChange:this.handleRadioInputChange,onFocus:this.handleRadioInputFocus,onBlur:this.handleRadioInputBlur}),f("div",{class:`${e}-radio-button__state-border`}),st(this.$slots.default,t=>!t&&!this.label?null:f("div",{ref:"labelRef",class:`${e}-radio__label`},t||this.label)))}}),Ot={thPaddingBorderedSmall:"8px 12px",thPaddingBorderedMedium:"12px 16px",thPaddingBorderedLarge:"16px 24px",thPaddingSmall:"0",thPaddingMedium:"0",thPaddingLarge:"0",tdPaddingBorderedSmall:"8px 12px",tdPaddingBorderedMedium:"12px 16px",tdPaddingBorderedLarge:"16px 24px",tdPaddingSmall:"0 0 8px 0",tdPaddingMedium:"0 0 12px 0",tdPaddingLarge:"0 0 16px 0"};function Ut(e){const{tableHeaderColor:t,textColor2:c,textColor1:n,cardColor:u,modalColor:i,popoverColor:b,dividerColor:S,borderRadius:R,fontWeightStrong:w,lineHeight:P,fontSizeSmall:d,fontSizeMedium:p,fontSizeLarge:v}=e;return Object.assign(Object.assign({},Ot),{lineHeight:P,fontSizeSmall:d,fontSizeMedium:p,fontSizeLarge:v,titleTextColor:n,thColor:X(u,t),thColorModal:X(i,t),thColorPopover:X(b,t),thTextColor:n,thFontWeight:w,tdTextColor:c,tdColor:u,tdColorModal:i,tdColorPopover:b,borderColor:X(u,S),borderColorModal:X(i,S),borderColorPopover:X(b,S),borderRadius:R})}const Ft={name:"Descriptions",common:ge,self:Ut},Ht=Ft,Vt=B([m("descriptions",{fontSize:"var(--n-font-size)"},[m("descriptions-separator",`
 display: inline-block;
 margin: 0 8px 0 2px;
 `),m("descriptions-table-wrapper",[m("descriptions-table",[m("descriptions-table-row",[m("descriptions-table-header",{padding:"var(--n-th-padding)"}),m("descriptions-table-content",{padding:"var(--n-td-padding)"})])])]),Ee("bordered",[m("descriptions-table-wrapper",[m("descriptions-table",[m("descriptions-table-row",[B("&:last-child",[m("descriptions-table-content",{paddingBottom:0})])])])])]),E("left-label-placement",[m("descriptions-table-content",[B("> *",{verticalAlign:"top"})])]),E("left-label-align",[B("th",{textAlign:"left"})]),E("center-label-align",[B("th",{textAlign:"center"})]),E("right-label-align",[B("th",{textAlign:"right"})]),E("bordered",[m("descriptions-table-wrapper",`
 border-radius: var(--n-border-radius);
 overflow: hidden;
 background: var(--n-merged-td-color);
 border: 1px solid var(--n-merged-border-color);
 `,[m("descriptions-table",[m("descriptions-table-row",[B("&:not(:last-child)",[m("descriptions-table-content",{borderBottom:"1px solid var(--n-merged-border-color)"}),m("descriptions-table-header",{borderBottom:"1px solid var(--n-merged-border-color)"})]),m("descriptions-table-header",`
 font-weight: 400;
 background-clip: padding-box;
 background-color: var(--n-merged-th-color);
 `,[B("&:not(:last-child)",{borderRight:"1px solid var(--n-merged-border-color)"})]),m("descriptions-table-content",[B("&:not(:last-child)",{borderRight:"1px solid var(--n-merged-border-color)"})])])])])]),m("descriptions-header",`
 font-weight: var(--n-th-font-weight);
 font-size: 18px;
 transition: color .3s var(--n-bezier);
 line-height: var(--n-line-height);
 margin-bottom: 16px;
 color: var(--n-title-text-color);
 `),m("descriptions-table-wrapper",`
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[m("descriptions-table",`
 width: 100%;
 border-collapse: separate;
 border-spacing: 0;
 box-sizing: border-box;
 `,[m("descriptions-table-row",`
 box-sizing: border-box;
 transition: border-color .3s var(--n-bezier);
 `,[m("descriptions-table-header",`
 font-weight: var(--n-th-font-weight);
 line-height: var(--n-line-height);
 display: table-cell;
 box-sizing: border-box;
 color: var(--n-th-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `),m("descriptions-table-content",`
 vertical-align: top;
 line-height: var(--n-line-height);
 display: table-cell;
 box-sizing: border-box;
 color: var(--n-td-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[k("content",`
 transition: color .3s var(--n-bezier);
 display: inline-block;
 color: var(--n-td-text-color);
 `)]),k("label",`
 font-weight: var(--n-th-font-weight);
 transition: color .3s var(--n-bezier);
 display: inline-block;
 margin-right: 14px;
 color: var(--n-th-text-color);
 `)])])])]),m("descriptions-table-wrapper",`
 --n-merged-th-color: var(--n-th-color);
 --n-merged-td-color: var(--n-td-color);
 --n-merged-border-color: var(--n-border-color);
 `),it(m("descriptions-table-wrapper",`
 --n-merged-th-color: var(--n-th-color-modal);
 --n-merged-td-color: var(--n-td-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `)),dt(m("descriptions-table-wrapper",`
 --n-merged-th-color: var(--n-th-color-popover);
 --n-merged-td-color: var(--n-td-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `))]),Me="DESCRIPTION_ITEM_FLAG";function Wt(e){return typeof e=="object"&&e&&!Array.isArray(e)?e.type&&e.type[Me]:!1}const qt=Object.assign(Object.assign({},re.props),{title:String,column:{type:Number,default:3},columns:Number,labelPlacement:{type:String,default:"top"},labelAlign:{type:String,default:"left"},separator:{type:String,default:":"},size:{type:String,default:"medium"},bordered:Boolean,labelClass:String,labelStyle:[Object,String],contentClass:String,contentStyle:[Object,String]}),Ie=W({name:"Descriptions",props:qt,slots:Object,setup(e){const{mergedClsPrefixRef:t,inlineThemeDisabled:c}=fe(e),n=re("Descriptions","-descriptions",Vt,Ht,e,t),u=D(()=>{const{size:b,bordered:S}=e,{common:{cubicBezierEaseInOut:R},self:{titleTextColor:w,thColor:P,thColorModal:d,thColorPopover:p,thTextColor:v,thFontWeight:$,tdTextColor:h,tdColor:g,tdColorModal:x,tdColorPopover:s,borderColor:N,borderColorModal:T,borderColorPopover:j,borderRadius:I,lineHeight:M,[be("fontSize",b)]:O,[be(S?"thPaddingBordered":"thPadding",b)]:A,[be(S?"tdPaddingBordered":"tdPadding",b)]:U}}=n.value;return{"--n-title-text-color":w,"--n-th-padding":A,"--n-td-padding":U,"--n-font-size":O,"--n-bezier":R,"--n-th-font-weight":$,"--n-line-height":M,"--n-th-text-color":v,"--n-td-text-color":h,"--n-th-color":P,"--n-th-color-modal":d,"--n-th-color-popover":p,"--n-td-color":g,"--n-td-color-modal":x,"--n-td-color-popover":s,"--n-border-radius":I,"--n-border-color":N,"--n-border-color-modal":T,"--n-border-color-popover":j}}),i=c?he("descriptions",D(()=>{let b="";const{size:S,bordered:R}=e;return R&&(b+="a"),b+=S[0],b}),u,e):void 0;return{mergedClsPrefix:t,cssVars:c?void 0:u,themeClass:i==null?void 0:i.themeClass,onRender:i==null?void 0:i.onRender,compitableColumn:ct(e,["columns","column"]),inlineThemeDisabled:c}},render(){const e=this.$slots.default,t=e?ut(e()):[];t.length;const{contentClass:c,labelClass:n,compitableColumn:u,labelPlacement:i,labelAlign:b,size:S,bordered:R,title:w,cssVars:P,mergedClsPrefix:d,separator:p,onRender:v}=this;v==null||v();const $=t.filter(s=>Wt(s)),h={span:0,row:[],secondRow:[],rows:[]},x=$.reduce((s,N,T)=>{const j=N.props||{},I=$.length-1===T,M=["label"in j?j.label:je(N,"label")],O=[je(N)],A=j.span||1,U=s.span;s.span+=A;const H=j.labelStyle||j["label-style"]||this.labelStyle,V=j.contentStyle||j["content-style"]||this.contentStyle;if(i==="left")R?s.row.push(f("th",{class:[`${d}-descriptions-table-header`,n],colspan:1,style:H},M),f("td",{class:[`${d}-descriptions-table-content`,c],colspan:I?(u-U)*2+1:A*2-1,style:V},O)):s.row.push(f("td",{class:`${d}-descriptions-table-content`,colspan:I?(u-U)*2:A*2},f("span",{class:[`${d}-descriptions-table-content__label`,n],style:H},[...M,p&&f("span",{class:`${d}-descriptions-separator`},p)]),f("span",{class:[`${d}-descriptions-table-content__content`,c],style:V},O)));else{const ie=I?(u-U)*2:A*2;s.row.push(f("th",{class:[`${d}-descriptions-table-header`,n],colspan:ie,style:H},M)),s.secondRow.push(f("td",{class:[`${d}-descriptions-table-content`,c],colspan:ie,style:V},O))}return(s.span>=u||I)&&(s.span=0,s.row.length&&(s.rows.push(s.row),s.row=[]),i!=="left"&&s.secondRow.length&&(s.rows.push(s.secondRow),s.secondRow=[])),s},h).rows.map(s=>f("tr",{class:`${d}-descriptions-table-row`},s));return f("div",{style:P,class:[`${d}-descriptions`,this.themeClass,`${d}-descriptions--${i}-label-placement`,`${d}-descriptions--${b}-label-align`,`${d}-descriptions--${S}-size`,R&&`${d}-descriptions--bordered`]},w||this.$slots.header?f("div",{class:`${d}-descriptions-header`},w||mt(this,"header")):null,f("div",{class:`${d}-descriptions-table-wrapper`},f("table",{class:`${d}-descriptions-table`},f("tbody",null,i==="top"&&f("tr",{class:`${d}-descriptions-table-row`,style:{visibility:"collapse"}},pt(u*2,f("td",null))),x))))}}),Gt={label:String,span:{type:Number,default:1},labelClass:String,labelStyle:[Object,String],contentClass:String,contentStyle:[Object,String]},ae=W({name:"DescriptionsItem",[Me]:!0,props:Gt,slots:Object,render(){return null}});function Jt(){const e={}.VITE_DATA_BUILDER_URL;return(e&&e.trim()?e.trim():"/data-builder").replace(/\/$/,"")}function Kt(e){const t=e.startsWith("/")?e:`/${e}`;return`${Jt()}${t}`}function Qt(){const e={}.VITE_DATA_BUILDER_URL;return e!=null&&String(e).trim()!==""?String(e).trim().replace(/\/$/,""):"/data-builder"}function Zt(e){if(e==null)return"";if(typeof e=="string")return e;if(typeof e=="object"&&"detail"in e){const t=e.detail;if(typeof t=="string")return t;if(Array.isArray(t))return JSON.stringify(t)}try{return JSON.stringify(e)}catch{return String(e)}}const K=ft({baseURL:Qt(),timeout:12e4,unwrapResponse:e=>e.data,onError:(e,t)=>{var i,b;if(e.code==="ECONNABORTED"||(i=e.message)!=null&&i.includes("timeout")){L.error("数据构建服务请求超时，请稍后重试");return}if(e.code==="ERR_NETWORK"||!e.response){L.error("无法连接数据构建服务，请确认 data-builder 已启动且网关 /data-builder 可用");return}const c=t.status;if(c===401||c===403){L.error(t.message||"无权限访问数据构建服务");return}if(c===502){L.error("数据构建服务不可用 (502)，请检查上游与 Nginx 配置");return}const n=(b=e.response)==null?void 0:b.data,u=Zt(n);L.error(u?`${t.message||"请求失败"}：${u}`:t.message||"请求失败")}});async function Xt(e){return K.post("/api/v1/connections/test",e)}async function Yt(e){return K.post("/api/v1/connections/tables",e)}async function el(e){return K.post("/api/v1/schema/sync",e)}async function tl(){return K.get("/api/v1/settings")}async function ll(e){return K.patch("/api/v1/settings",e)}async function al(e){return K.post("/api/v1/generate/preview",e)}async function rl(e){return K.post("/api/v1/execute",e)}async function ol(){return K.get("/api/v1/prompts/library")}const nl={class:"data-builder"},sl={class:"data-builder-inner"},il=W({__name:"DataBuilder",setup(e){const t=z("conn"),c=z(!1),n=z({host:"127.0.0.1",port:3308,user:"root",password:"",database:"ai_automation_db"}),u=z(!1),i=z(!1),b=z(""),S=z(""),R=z(!1),w=z([]),P=z(null),d=z(!1),p=z(null),v=z([]),$=z(null),h=z(""),g=z("template"),x=z(!1),s=z(null),N=z({encrypt_fulltext_enabled:!1,max_insert_select_rows:1e6}),T=z(!1),j=z(!1),I=z(""),M=[{title:"列名",key:"name",width:140,ellipsis:{tooltip:!0}},{title:"类型",key:"data_type",width:120},{title:"完整类型",key:"column_type",minWidth:160,ellipsis:{tooltip:!0}},{title:"可空",key:"nullable",width:72,render:y=>y.nullable?"是":"否"},{title:"注释",key:"comment",ellipsis:{tooltip:!0}}],O=[{title:"占位符",key:"placeholder",width:120},{title:"列",key:"column",width:120},{title:"策略",key:"strategy",width:140},{title:"参数",key:"params",render:y=>f(ue,{depth:3,style:"font-size:12px"},()=>JSON.stringify(y.params??{}))}],A=D(()=>p.value?JSON.stringify({database:p.value.database,table:p.value.table,columns:p.value.columns},null,2):""),U=D(()=>v.value.map(y=>({label:y.title,value:y.id})));function H(){return{host:n.value.host.trim(),port:n.value.port,user:n.value.user.trim(),password:n.value.password,database:n.value.database.trim()}}async function V(){try{const y=await fetch(Kt("/health"));c.value=y.ok,y.ok?L.success("数据构建服务可达"):L.warning(`服务响应异常 HTTP ${y.status}`)}catch{c.value=!1,L.error("无法访问数据构建服务")}}async function ie(){u.value=!0,b.value="",S.value="";try{const y=await Xt(H());i.value=y.ok,b.value=y.message,S.value=y.server_version??"",y.ok?L.success("连接成功"):L.error(y.message)}finally{u.value=!1}}async function Oe(){R.value=!0;try{const y=await Yt(H());w.value=y.tables.map(r=>({label:r,value:r})),y.tables.length?L.success(`已加载 ${y.tables.length} 张表`):L.info("该库下没有基表")}finally{R.value=!1}}async function Ue(){if(P.value){d.value=!0;try{p.value=await el({...H(),table:P.value}),s.value=null,L.success("结构已同步"),t.value="preview"}finally{d.value=!1}}}function Fe(y){if(!y)return;const r=v.value.find(C=>C.id===y);r&&(h.value=r.instruction)}async function He(){if(!(!p.value||!h.value.trim())){x.value=!0;try{const y={database:p.value.database,table:p.value.table,columns:p.value.columns};s.value=await al({instruction:h.value.trim(),target_table:p.value.table,table_schema:y,generation_mode:g.value}),L.success("已生成预览")}finally{x.value=!1}}}async function ye(){try{const y=await tl();N.value.encrypt_fulltext_enabled=y.encrypt_fulltext_enabled,N.value.max_insert_select_rows=y.max_insert_select_rows}catch{}}async function Ve(){T.value=!0;try{await ll({encrypt_fulltext_enabled:N.value.encrypt_fulltext_enabled,max_insert_select_rows:N.value.max_insert_select_rows}),L.success("设置已保存（服务端进程内生效）"),await ye()}finally{T.value=!1}}async function xe(y){if(!(!s.value||!p.value)){j.value=!0,I.value="";try{const r={schema_version:"1.0",rationale:s.value.rationale,sql_template:s.value.sql_template,bindings:s.value.bindings,generation_mode:s.value.generation_mode,estimated_total_rows:s.value.estimated_total_rows,target_table:p.value.table,database:p.value.database},C=await rl({plan:r,confirm:y});I.value=C.message,L.info(C.message)}finally{j.value=!1}}}return pe(P,()=>{p.value=null,s.value=null}),Be(async()=>{V();try{const y=await ol();v.value=y.items??[]}catch{v.value=[]}await ye()}),(y,r)=>(F(),ce("div",nl,[a(We,{title:"智能造数",badge:"LLM Data",breadcrumbs:["接口管理","智能造数"]},{icon:o(()=>[a(l(bt),{size:22,color:"#fff",component:l(vt)},null,8,["component"])]),right:o(()=>[a(l(q),{align:"center",size:12},{default:o(()=>[c.value?(F(),Y(l(_e),{key:0,type:"success",size:"small",round:""},{default:o(()=>[...r[14]||(r[14]=[_("服务在线",-1)])]),_:1})):(F(),Y(l(_e),{key:1,type:"warning",size:"small",round:""},{default:o(()=>[...r[15]||(r[15]=[_("检测服务…",-1)])]),_:1})),a(l(G),{size:"small",secondary:"",onClick:V},{default:o(()=>[...r[16]||(r[16]=[_("检测连接",-1)])]),_:1})]),_:1})]),_:1}),a(l(Ct),{class:"data-builder-scroll"},{default:o(()=>[$e("div",sl,[a(l(le),{type:"info",class:"intro-alert",title:"使用说明"},{default:o(()=>[...r[17]||(r[17]=[_(" 配置",-1),$e("strong",null,"目标 MySQL",-1),_("（与平台自身库可不同）→ 选择表并同步结构 → 用自然语言描述造数需求 → 生成预览（当前为占位逻辑，接入 LLM 后将输出真实计划）→ 在设置中调整上限与归档选项。执行写入将在后续版本开放。 ",-1)])]),_:1}),a(l(Se),{value:t.value,"onUpdate:value":r[13]||(r[13]=C=>t.value=C),type:"line",animated:"",class:"main-tabs"},{default:o(()=>[a(l(Q),{name:"conn",tab:"连接配置"},{default:o(()=>[a(l(ee),{title:"MySQL 目标库",size:"small",class:"panel-card"},{default:o(()=>[a(l(Ne),{"label-placement":"left","label-width":"96",model:n.value},{default:o(()=>[a(l(xt),{cols:2,"x-gap":16,"y-gap":12},{default:o(()=>[a(l(ne),null,{default:o(()=>[a(l(Z),{label:"主机"},{default:o(()=>[a(l(se),{value:n.value.host,"onUpdate:value":r[0]||(r[0]=C=>n.value.host=C),placeholder:"如127.0.0.1",clearable:""},null,8,["value"])]),_:1})]),_:1}),a(l(ne),null,{default:o(()=>[a(l(Z),{label:"端口"},{default:o(()=>[a(l(ze),{value:n.value.port,"onUpdate:value":r[1]||(r[1]=C=>n.value.port=C),min:1,max:65535,class:"w-full"},null,8,["value"])]),_:1})]),_:1}),a(l(ne),null,{default:o(()=>[a(l(Z),{label:"用户名"},{default:o(()=>[a(l(se),{value:n.value.user,"onUpdate:value":r[2]||(r[2]=C=>n.value.user=C),placeholder:"数据库用户",clearable:""},null,8,["value"])]),_:1})]),_:1}),a(l(ne),null,{default:o(()=>[a(l(Z),{label:"密码"},{default:o(()=>[a(l(se),{value:n.value.password,"onUpdate:value":r[3]||(r[3]=C=>n.value.password=C),type:"password","show-password-on":"click",placeholder:"可为空"},null,8,["value"])]),_:1})]),_:1}),a(l(ne),{span:2},{default:o(()=>[a(l(Z),{label:"数据库"},{default:o(()=>[a(l(se),{value:n.value.database,"onUpdate:value":r[4]||(r[4]=C=>n.value.database=C),placeholder:"库名（字母数字下划线）",clearable:""},null,8,["value"])]),_:1})]),_:1})]),_:1}),a(l(q),{style:{"margin-top":"8px"}},{default:o(()=>[a(l(G),{type:"primary",loading:u.value,onClick:ie},{default:o(()=>[...r[18]||(r[18]=[_("测试连接",-1)])]),_:1},8,["loading"]),a(l(G),{secondary:"",loading:R.value,disabled:!i.value,onClick:Oe},{default:o(()=>[...r[19]||(r[19]=[_("加载表列表",-1)])]),_:1},8,["loading","disabled"])]),_:1}),b.value?(F(),Y(l(le),{key:0,style:{"margin-top":"12px"},type:i.value?"success":"error",title:b.value},{default:o(()=>[S.value?(F(),ce(ve,{key:0},[_("Server: "+J(S.value),1)],64)):te("",!0)]),_:1},8,["type","title"])):te("",!0)]),_:1},8,["model"])]),_:1})]),_:1}),a(l(Q),{name:"schema",tab:"表与结构"},{default:o(()=>[a(l(ee),{title:"选择表并同步 DDL",size:"small",class:"panel-card"},{default:o(()=>[a(l(q),{vertical:"",size:12,style:{width:"100%"}},{default:o(()=>[a(l(q),null,{default:o(()=>[a(l(Pe),{value:P.value,"onUpdate:value":r[5]||(r[5]=C=>P.value=C),options:w.value,placeholder:"先完成连接并加载表列表",filterable:"",clearable:"",style:{"min-width":"280px"},disabled:w.value.length===0},null,8,["value","options","disabled"]),a(l(G),{type:"primary",secondary:"",loading:d.value,disabled:!P.value,onClick:Ue},{default:o(()=>[...r[20]||(r[20]=[_(" 同步结构 ",-1)])]),_:1},8,["loading","disabled"])]),_:1}),w.value.length?p.value?(F(),ce(ve,{key:1},[a(l(Ie),{"label-placement":"left",bordered:"",size:"small",column:2,class:"schema-desc"},{default:o(()=>[a(l(ae),{label:"库名"},{default:o(()=>[_(J(p.value.database),1)]),_:1}),a(l(ae),{label:"表名"},{default:o(()=>[_(J(p.value.table),1)]),_:1}),a(l(ae),{label:"列数"},{default:o(()=>[_(J(p.value.columns.length),1)]),_:1})]),_:1}),a(l(Re),{size:"small",columns:M,data:p.value.columns,pagination:{pageSize:12},"scroll-x":720,class:"col-table"},null,8,["data"]),a(l(Et),null,{default:o(()=>[a(l(Mt),{title:"JSON（供 LLM 上下文）",name:"json"},{default:o(()=>[a(l(ke),{language:"json",code:A.value,"word-wrap":""},null,8,["code"])]),_:1})]),_:1})],64)):te("",!0):(F(),Y(l(le),{key:0,type:"warning",title:"暂无表数据"},{default:o(()=>[...r[21]||(r[21]=[_("请在「连接配置」中测试连接并加载表列表。",-1)])]),_:1}))]),_:1})]),_:1})]),_:1}),a(l(Q),{name:"preview",tab:"需求与预览"},{default:o(()=>[a(l(ee),{title:"自然语言需求",size:"small",class:"panel-card"},{default:o(()=>[a(l(q),{vertical:"",size:12,style:{width:"100%"}},{default:o(()=>{var C;return[a(l(q),{align:"center"},{default:o(()=>[a(l(ue),{depth:"3"},{default:o(()=>[...r[22]||(r[22]=[_("提示词模版",-1)])]),_:1}),a(l(Pe),{value:$.value,"onUpdate:value":[r[6]||(r[6]=oe=>$.value=oe),Fe],options:U.value,placeholder:"选用预设场景（可选）",clearable:"",filterable:"",style:{"min-width":"260px"}},null,8,["value","options"]),a(l(yt),{value:g.value,"onUpdate:value":r[7]||(r[7]=oe=>g.value=oe),name:"genmode"},{default:o(()=>[a(l(Te),{value:"template"},{default:o(()=>[...r[23]||(r[23]=[_("模版化（高性能）",-1)])]),_:1}),a(l(Te),{value:"semantic"},{default:o(()=>[...r[24]||(r[24]=[_("语义化（LLM 文本）",-1)])]),_:1})]),_:1},8,["value"])]),_:1}),a(l(se),{value:h.value,"onUpdate:value":r[8]||(r[8]=oe=>h.value=oe),type:"textarea",placeholder:"例：生成 1000 条数据，用户名为合成中文姓名风格，年龄在 20–40 岁…",autosize:{minRows:5,maxRows:14}},null,8,["value"]),a(l(G),{type:"primary",loading:x.value,disabled:!p.value||!h.value.trim(),onClick:He},{default:o(()=>[...r[25]||(r[25]=[_(" 生成预览 ",-1)])]),_:1},8,["loading","disabled"]),(C=s.value)!=null&&C.stub?(F(),Y(l(le),{key:0,type:"warning",title:"当前为占位预览"},{default:o(()=>[...r[26]||(r[26]=[_(" 后端尚未接入大模型时，仅根据表字段生成 INSERT 模板骨架，便于联调界面与接口。 ",-1)])]),_:1})):te("",!0),s.value?(F(),ce(ve,{key:1},[a(l(Se),{type:"segment",class:"preview-tabs"},{default:o(()=>[a(l(Q),{name:"rationale",tab:"生成计划"},{default:o(()=>[a(l(ee),{embedded:"",size:"small"},{default:o(()=>[a(l(ue),{style:{"white-space":"pre-wrap"}},{default:o(()=>[_(J(s.value.rationale),1)]),_:1})]),_:1})]),_:1}),a(l(Q),{name:"sql",tab:"SQL 模版"},{default:o(()=>[a(l(ke),{language:"sql",code:s.value.sql_template,"word-wrap":""},null,8,["code"])]),_:1}),a(l(Q),{name:"bind",tab:"字段绑定"},{default:o(()=>[a(l(Re),{size:"small",columns:O,data:s.value.bindings,pagination:{pageSize:8}},null,8,["data"])]),_:1})]),_:1}),a(l(Ie),{bordered:"",size:"small",column:3,class:"preview-meta"},{default:o(()=>[a(l(ae),{label:"模式"},{default:o(()=>[_(J(s.value.generation_mode),1)]),_:1}),a(l(ae),{label:"预估行数"},{default:o(()=>[_(J(s.value.estimated_total_rows),1)]),_:1}),a(l(ae),{label:"绑定数"},{default:o(()=>[_(J(s.value.bindings.length),1)]),_:1})]),_:1})],64)):te("",!0)]}),_:1})]),_:1})]),_:1}),a(l(Q),{name:"settings",tab:"设置与执行"},{default:o(()=>[a(l(ee),{title:"高级选项",size:"small",class:"panel-card"},{default:o(()=>[a(l(Ne),{"label-placement":"left","label-width":"180","show-feedback":!1},{default:o(()=>[a(l(Z),{label:"归档加密全文（高级）"},{default:o(()=>[a(l(q),{vertical:"",size:4},{default:o(()=>[a(l(wt),{value:N.value.encrypt_fulltext_enabled,"onUpdate:value":r[9]||(r[9]=C=>N.value.encrypt_fulltext_enabled=C)},null,8,["value"]),a(l(ue),{depth:"3",style:{"font-size":"12px"}},{default:o(()=>[...r[27]||(r[27]=[_("开启后本地保存任务时将加密存储完整 Prompt（需后续解锁流程配合）。",-1)])]),_:1})]),_:1})]),_:1}),a(l(Z),{label:"INSERT…SELECT 最大行数上限"},{default:o(()=>[a(l(ze),{value:N.value.max_insert_select_rows,"onUpdate:value":r[10]||(r[10]=C=>N.value.max_insert_select_rows=C),min:1,max:5e8,step:1e4,class:"w-full",style:{"max-width":"280px"}},null,8,["value"])]),_:1}),a(l(G),{type:"primary",secondary:"",loading:T.value,onClick:Ve},{default:o(()=>[...r[28]||(r[28]=[_("保存设置",-1)])]),_:1},8,["loading"])]),_:1})]),_:1}),a(l(ee),{title:"执行",size:"small",class:"panel-card execute-card"},{default:o(()=>[a(l(le),{type:"default",title:"批量写入",style:{"margin-bottom":"12px"}},{default:o(()=>[...r[29]||(r[29]=[_(" 当前版本仅完成预览与 Schema 联调；点击下方按钮可验证执行接口（将返回未开放提示）。 ",-1)])]),_:1}),a(l(q),null,{default:o(()=>[a(l(G),{type:"error",secondary:"",disabled:!s.value,loading:j.value,onClick:r[11]||(r[11]=C=>xe(!1))},{default:o(()=>[...r[30]||(r[30]=[_(" 试运行（不确认） ",-1)])]),_:1},8,["disabled","loading"]),a(l(G),{type:"primary",disabled:!s.value,loading:j.value,onClick:r[12]||(r[12]=C=>xe(!0))},{default:o(()=>[...r[31]||(r[31]=[_(" 确认并执行 ",-1)])]),_:1},8,["disabled","loading"])]),_:1}),I.value?(F(),Y(l(le),{key:0,type:"info",style:{"margin-top":"12px"},title:I.value},null,8,["title"])):te("",!0)]),_:1})]),_:1})]),_:1},8,["value"])])]),_:1})]))}});const Rl=_t(il,[["__scopeId","data-v-a7b46deb"]]);export{Rl as default};
