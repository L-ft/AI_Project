import{l as S,T as f,n as p,b1 as C,M as h,d as x,q as T,s as g,x as m,y as k,aP as $,r as w,aS as R,z as r,bJ as N,aj as j,be as B,aV as L}from"./index-14712758.js";function O(e){const{opacityDisabled:a,heightTiny:t,heightSmall:n,heightMedium:l,heightLarge:s,heightHuge:c,primaryColor:o,fontSize:i}=e;return{fontSize:i,textColor:o,sizeTiny:t,sizeSmall:n,sizeMedium:l,sizeLarge:s,sizeHuge:c,color:o,opacitySpinning:a}}const P={name:"Spin",common:S,self:O},V=P,W=f([f("@keyframes spin-rotate",`
 from {
 transform: rotate(0);
 }
 to {
 transform: rotate(360deg);
 }
 `),p("spin-container",`
 position: relative;
 `,[p("spin-body",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 `,[C()])]),p("spin-body",`
 display: inline-flex;
 align-items: center;
 justify-content: center;
 flex-direction: column;
 `),p("spin",`
 display: inline-flex;
 height: var(--n-size);
 width: var(--n-size);
 font-size: var(--n-size);
 color: var(--n-color);
 `,[h("rotate",`
 animation: spin-rotate 2s linear infinite;
 `)]),p("spin-description",`
 display: inline-block;
 font-size: var(--n-font-size);
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 margin-top: 8px;
 `),p("spin-content",`
 opacity: 1;
 transition: opacity .3s var(--n-bezier);
 pointer-events: all;
 `,[h("spinning",`
 user-select: none;
 -webkit-user-select: none;
 pointer-events: none;
 opacity: var(--n-opacity-spinning);
 `)])]),H={small:20,medium:18,large:16},I=Object.assign(Object.assign({},g.props),{contentClass:String,contentStyle:[Object,String],description:String,stroke:String,size:{type:[String,Number],default:"medium"},show:{type:Boolean,default:!0},strokeWidth:Number,rotate:{type:Boolean,default:!0},spinning:{type:Boolean,validator:()=>!0,default:void 0},delay:Number}),D=x({name:"Spin",props:I,slots:Object,setup(e){const{mergedClsPrefixRef:a,inlineThemeDisabled:t}=T(e),n=g("Spin","-spin",W,V,e,a),l=m(()=>{const{size:i}=e,{common:{cubicBezierEaseInOut:d},self:u}=n.value,{opacitySpinning:y,color:v,textColor:b}=u,z=typeof i=="number"?B(i):u[L("size",i)];return{"--n-bezier":d,"--n-opacity-spinning":y,"--n-size":z,"--n-color":v,"--n-text-color":b}}),s=t?k("spin",m(()=>{const{size:i}=e;return typeof i=="number"?String(i):i[0]}),l,e):void 0,c=$(e,["spinning","show"]),o=w(!1);return R(i=>{let d;if(c.value){const{delay:u}=e;if(u){d=window.setTimeout(()=>{o.value=!0},u),i(()=>{clearTimeout(d)});return}}o.value=c.value}),{mergedClsPrefix:a,active:o,mergedStrokeWidth:m(()=>{const{strokeWidth:i}=e;if(i!==void 0)return i;const{size:d}=e;return H[typeof d=="number"?"medium":d]}),cssVars:t?void 0:l,themeClass:s==null?void 0:s.themeClass,onRender:s==null?void 0:s.onRender}},render(){var e,a;const{$slots:t,mergedClsPrefix:n,description:l}=this,s=t.icon&&this.rotate,c=(l||t.description)&&r("div",{class:`${n}-spin-description`},l||((e=t.description)===null||e===void 0?void 0:e.call(t))),o=t.icon?r("div",{class:[`${n}-spin-body`,this.themeClass]},r("div",{class:[`${n}-spin`,s&&`${n}-spin--rotate`],style:t.default?"":this.cssVars},t.icon()),c):r("div",{class:[`${n}-spin-body`,this.themeClass]},r(N,{clsPrefix:n,style:t.default?"":this.cssVars,stroke:this.stroke,"stroke-width":this.mergedStrokeWidth,class:`${n}-spin`}),c);return(a=this.onRender)===null||a===void 0||a.call(this),t.default?r("div",{class:[`${n}-spin-container`,this.themeClass],style:this.cssVars},r("div",{class:[`${n}-spin-content`,this.active&&`${n}-spin-content--spinning`,this.contentClass],style:this.contentStyle},t),r(j,{name:"fade-in-transition"},{default:()=>this.active?o:null})):o}});export{D as N};
