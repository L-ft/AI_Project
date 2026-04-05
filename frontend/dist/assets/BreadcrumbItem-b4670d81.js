import{n as P,p as m,J as s,P as T,q as u,d as g,s as y,v as C,Q as j,_ as H,y as p,z as E,A as v,V as S,r as _,D as $,E as I,aZ as O,Y as A,aC as V}from"./index-77aef96e.js";const w={fontWeightActive:"400"};function N(e){const{fontSize:o,textColor3:n,textColor2:r,borderRadius:a,buttonColor2Hover:t,buttonColor2Pressed:c}=e;return Object.assign(Object.assign({},w),{fontSize:o,itemLineHeight:"1.25",itemTextColor:n,itemTextColorHover:r,itemTextColorPressed:r,itemTextColorActive:r,itemBorderRadius:a,itemColorHover:t,itemColorPressed:c,separatorColor:n})}const D={name:"Breadcrumb",common:P,self:N},K=D,M=m("breadcrumb",`
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
 `),m("breadcrumb-item",`
 font-size: var(--n-font-size);
 transition: color .3s var(--n-bezier);
 display: inline-flex;
 align-items: center;
 `,[m("icon",`
 font-size: 18px;
 vertical-align: -.2em;
 transition: color .3s var(--n-bezier);
 color: var(--n-item-text-color);
 `),s("&:not(:last-child)",[T("clickable",[u("link",`
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
 `,[m("icon",`
 color: var(--n-item-text-color-hover);
 `)]),s("&:active",`
 color: var(--n-item-text-color-pressed);
 `,[m("icon",`
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
 `,[m("icon",`
 color: var(--n-item-text-color-active);
 `)]),u("separator",`
 display: none;
 `)])])]),x=S("n-breadcrumb"),q=Object.assign(Object.assign({},C.props),{separator:{type:String,default:"/"}}),U=g({name:"Breadcrumb",props:q,setup(e){const{mergedClsPrefixRef:o,inlineThemeDisabled:n}=y(e),r=C("Breadcrumb","-breadcrumb",M,K,e,o);j(x,{separatorRef:H(e,"separator"),mergedClsPrefixRef:o});const a=p(()=>{const{common:{cubicBezierEaseInOut:c},self:{separatorColor:d,itemTextColor:i,itemTextColorHover:l,itemTextColorPressed:b,itemTextColorActive:h,fontSize:f,fontWeightActive:R,itemBorderRadius:k,itemColorHover:B,itemColorPressed:z,itemLineHeight:L}}=r.value;return{"--n-font-size":f,"--n-bezier":c,"--n-item-text-color":i,"--n-item-text-color-hover":l,"--n-item-text-color-pressed":b,"--n-item-text-color-active":h,"--n-separator-color":d,"--n-item-color-hover":B,"--n-item-color-pressed":z,"--n-item-border-radius":k,"--n-font-weight-active":R,"--n-item-line-height":L}}),t=n?E("breadcrumb",void 0,a,e):void 0;return{mergedClsPrefix:o,cssVars:n?void 0:a,themeClass:t==null?void 0:t.themeClass,onRender:t==null?void 0:t.onRender}},render(){var e;return(e=this.onRender)===null||e===void 0||e.call(this),v("nav",{class:[`${this.mergedClsPrefix}-breadcrumb`,this.themeClass],style:this.cssVars,"aria-label":"Breadcrumb"},v("ul",null,this.$slots))}});function F(e=O?window:null){const o=()=>{const{hash:a,host:t,hostname:c,href:d,origin:i,pathname:l,port:b,protocol:h,search:f}=(e==null?void 0:e.location)||{};return{hash:a,host:t,hostname:c,href:d,origin:i,pathname:l,port:b,protocol:h,search:f}},n=_(o()),r=()=>{n.value=o()};return $(()=>{e&&(e.addEventListener("popstate",r),e.addEventListener("hashchange",r))}),I(()=>{e&&(e.removeEventListener("popstate",r),e.removeEventListener("hashchange",r))}),n}const J={separator:String,href:String,clickable:{type:Boolean,default:!0},onClick:Function},Y=g({name:"BreadcrumbItem",props:J,slots:Object,setup(e,{slots:o}){const n=A(x,null);if(!n)return()=>null;const{separatorRef:r,mergedClsPrefixRef:a}=n,t=F(),c=p(()=>e.href?"a":"span"),d=p(()=>t.value.href===e.href?"location":null);return()=>{const{value:i}=a;return v("li",{class:[`${i}-breadcrumb-item`,e.clickable&&`${i}-breadcrumb-item--clickable`]},v(c.value,{class:`${i}-breadcrumb-item__link`,"aria-current":d.value,href:e.href,onClick:e.onClick},o),v("span",{class:`${i}-breadcrumb-item__separator`,"aria-hidden":"true"},V(o.separator,()=>{var l;return[(l=e.separator)!==null&&l!==void 0?l:r.value]})))}}});export{Y as N,U as a};
