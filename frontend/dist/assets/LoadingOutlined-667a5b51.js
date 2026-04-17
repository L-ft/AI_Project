import{l as _,n as d,T as s,M as w,p as u,d as p,q as T,s as x,O as P,Z as y,x as g,y as O,z as v,S as j,r as H,C as S,D as E,a_ as $,X as I,aR as N,o as V,c as A,a as M}from"./index-75949940.js";const D={fontWeightActive:"400"};function K(e){const{fontSize:r,textColor3:t,textColor2:o,borderRadius:a,buttonColor2Hover:n,buttonColor2Pressed:c}=e;return Object.assign(Object.assign({},D),{fontSize:r,itemLineHeight:"1.25",itemTextColor:t,itemTextColorHover:o,itemTextColorPressed:o,itemTextColorActive:o,itemBorderRadius:a,itemColorHover:n,itemColorPressed:c,separatorColor:t})}const q={name:"Breadcrumb",common:_,self:K},F=q,U=d("breadcrumb",`
 white-space: nowrap;
 cursor: default;
 line-height: var(--n-item-line-height);
`,[s("ul",`
 list-style: none;
 padding: 0;
 margin: 0;
 `),s("a",`
 color: inherit;
 text-decoration: inherit;
 `),d("breadcrumb-item",`
 font-size: var(--n-font-size);
 transition: color .3s var(--n-bezier);
 display: inline-flex;
 align-items: center;
 `,[d("icon",`
 font-size: 18px;
 vertical-align: -.2em;
 transition: color .3s var(--n-bezier);
 color: var(--n-item-text-color);
 `),s("&:not(:last-child)",[w("clickable",[u("link",`
 cursor: pointer;
 `,[s("&:hover",`
 background-color: var(--n-item-color-hover);
 `),s("&:active",`
 background-color: var(--n-item-color-pressed); 
 `)])])]),u("link",`
 padding: 4px;
 border-radius: var(--n-item-border-radius);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 color: var(--n-item-text-color);
 position: relative;
 `,[s("&:hover",`
 color: var(--n-item-text-color-hover);
 `,[d("icon",`
 color: var(--n-item-text-color-hover);
 `)]),s("&:active",`
 color: var(--n-item-text-color-pressed);
 `,[d("icon",`
 color: var(--n-item-text-color-pressed);
 `)])]),u("separator",`
 margin: 0 8px;
 color: var(--n-separator-color);
 transition: color .3s var(--n-bezier);
 user-select: none;
 -webkit-user-select: none;
 `),s("&:last-child",[u("link",`
 font-weight: var(--n-font-weight-active);
 cursor: unset;
 color: var(--n-item-text-color-active);
 `,[d("icon",`
 color: var(--n-item-text-color-active);
 `)]),u("separator",`
 display: none;
 `)])])]),C=j("n-breadcrumb"),X=Object.assign(Object.assign({},x.props),{separator:{type:String,default:"/"}}),ee=p({name:"Breadcrumb",props:X,setup(e){const{mergedClsPrefixRef:r,inlineThemeDisabled:t}=T(e),o=x("Breadcrumb","-breadcrumb",U,F,e,r);P(C,{separatorRef:y(e,"separator"),mergedClsPrefixRef:r});const a=g(()=>{const{common:{cubicBezierEaseInOut:c},self:{separatorColor:m,itemTextColor:i,itemTextColorHover:l,itemTextColorPressed:h,itemTextColorActive:b,fontSize:f,fontWeightActive:k,itemBorderRadius:B,itemColorHover:R,itemColorPressed:L,itemLineHeight:z}}=o.value;return{"--n-font-size":f,"--n-bezier":c,"--n-item-text-color":i,"--n-item-text-color-hover":l,"--n-item-text-color-pressed":h,"--n-item-text-color-active":b,"--n-separator-color":m,"--n-item-color-hover":R,"--n-item-color-pressed":L,"--n-item-border-radius":B,"--n-font-weight-active":k,"--n-item-line-height":z}}),n=t?O("breadcrumb",void 0,a,e):void 0;return{mergedClsPrefix:r,cssVars:t?void 0:a,themeClass:n==null?void 0:n.themeClass,onRender:n==null?void 0:n.onRender}},render(){var e;return(e=this.onRender)===null||e===void 0||e.call(this),v("nav",{class:[`${this.mergedClsPrefix}-breadcrumb`,this.themeClass],style:this.cssVars,"aria-label":"Breadcrumb"},v("ul",null,this.$slots))}});function Z(e=$?window:null){const r=()=>{const{hash:a,host:n,hostname:c,href:m,origin:i,pathname:l,port:h,protocol:b,search:f}=(e==null?void 0:e.location)||{};return{hash:a,host:n,hostname:c,href:m,origin:i,pathname:l,port:h,protocol:b,search:f}},t=H(r()),o=()=>{t.value=r()};return S(()=>{e&&(e.addEventListener("popstate",o),e.addEventListener("hashchange",o))}),E(()=>{e&&(e.removeEventListener("popstate",o),e.removeEventListener("hashchange",o))}),t}const G={separator:String,href:String,clickable:{type:Boolean,default:!0},onClick:Function},re=p({name:"BreadcrumbItem",props:G,slots:Object,setup(e,{slots:r}){const t=I(C,null);if(!t)return()=>null;const{separatorRef:o,mergedClsPrefixRef:a}=t,n=Z(),c=g(()=>e.href?"a":"span"),m=g(()=>n.value.href===e.href?"location":null);return()=>{const{value:i}=a;return v("li",{class:[`${i}-breadcrumb-item`,e.clickable&&`${i}-breadcrumb-item--clickable`]},v(c.value,{class:`${i}-breadcrumb-item__link`,"aria-current":m.value,href:e.href,onClick:e.onClick},r),v("span",{class:`${i}-breadcrumb-item__separator`,"aria-hidden":"true"},N(r.separator,()=>{var l;return[(l=e.separator)!==null&&l!==void 0?l:o.value]})))}}}),J={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 1024 1024"},Q=M("path",{d:"M988 548c-19.9 0-36-16.1-36-36c0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9a437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7c26.7 63.1 40.2 130.2 40.2 199.3c.1 19.9-16 36-35.9 36z",fill:"currentColor"},null,-1),Y=[Q],te=p({name:"LoadingOutlined",render:function(r,t){return V(),A("svg",J,Y)}});export{te as L,re as N,ee as a};
