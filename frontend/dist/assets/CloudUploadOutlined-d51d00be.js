import{l as T,d as P,x as v,z as r,V as D,b8 as O,b9 as j,ba as q,bb as _,bc as G,$ as k,T as B,n as a,M as w,q as A,s as L,y as H,aV as I,o as V,c as X,a as M}from"./index-55b7b946.js";function Y(e){const{infoColor:d,successColor:g,warningColor:p,errorColor:c,textColor2:i,progressRailColor:t,fontSize:n,fontWeight:u}=e;return{fontSize:n,fontSizeCircle:"28px",fontWeightCircle:u,railColor:t,railHeight:"8px",iconSizeCircle:"36px",iconSizeLine:"18px",iconColor:d,iconColorInfo:d,iconColorSuccess:g,iconColorWarning:p,iconColorError:c,textColorCircle:i,textColorLineInner:"rgb(255, 255, 255)",textColorLineOuter:i,fillColor:d,fillColorInfo:d,fillColorSuccess:g,fillColorWarning:p,fillColorError:c,lineBgProcessing:"linear-gradient(90deg, rgba(255, 255, 255, .3) 0%, rgba(255, 255, 255, .5) 100%)"}}const E={name:"Progress",common:T,self:Y},F=E,U={success:r(O,null),error:r(j,null),warning:r(q,null),info:r(_,null)},J=P({name:"ProgressCircle",props:{clsPrefix:{type:String,required:!0},status:{type:String,required:!0},strokeWidth:{type:Number,required:!0},fillColor:[String,Object],railColor:String,railStyle:[String,Object],percentage:{type:Number,default:0},offsetDegree:{type:Number,default:0},showIndicator:{type:Boolean,required:!0},indicatorTextColor:String,unit:String,viewBoxWidth:{type:Number,required:!0},gapDegree:{type:Number,required:!0},gapOffsetDegree:{type:Number,default:0}},setup(e,{slots:d}){const g=v(()=>{const i="gradient",{fillColor:t}=e;return typeof t=="object"?`${i}-${G(JSON.stringify(t))}`:i});function p(i,t,n,u){const{gapDegree:f,viewBoxWidth:h,strokeWidth:y}=e,l=50,m=0,s=l,o=0,x=2*l,C=50+y/2,b=`M ${C},${C} m ${m},${s}
      a ${l},${l} 0 1 1 ${o},${-x}
      a ${l},${l} 0 1 1 ${-o},${x}`,$=Math.PI*2*l,S={stroke:u==="rail"?n:typeof e.fillColor=="object"?`url(#${g.value})`:n,strokeDasharray:`${Math.min(i,100)/100*($-f)}px ${h*8}px`,strokeDashoffset:`-${f/2}px`,transformOrigin:t?"center":void 0,transform:t?`rotate(${t}deg)`:void 0};return{pathString:b,pathStyle:S}}const c=()=>{const i=typeof e.fillColor=="object",t=i?e.fillColor.stops[0]:"",n=i?e.fillColor.stops[1]:"";return i&&r("defs",null,r("linearGradient",{id:g.value,x1:"0%",y1:"100%",x2:"100%",y2:"0%"},r("stop",{offset:"0%","stop-color":t}),r("stop",{offset:"100%","stop-color":n})))};return()=>{const{fillColor:i,railColor:t,strokeWidth:n,offsetDegree:u,status:f,percentage:h,showIndicator:y,indicatorTextColor:l,unit:m,gapOffsetDegree:s,clsPrefix:o}=e,{pathString:x,pathStyle:C}=p(100,0,t,"rail"),{pathString:b,pathStyle:$}=p(h,u,i,"fill"),S=100+n;return r("div",{class:`${o}-progress-content`,role:"none"},r("div",{class:`${o}-progress-graph`,"aria-hidden":!0},r("div",{class:`${o}-progress-graph-circle`,style:{transform:s?`rotate(${s}deg)`:void 0}},r("svg",{viewBox:`0 0 ${S} ${S}`},c(),r("g",null,r("path",{class:`${o}-progress-graph-circle-rail`,d:x,"stroke-width":n,"stroke-linecap":"round",fill:"none",style:C})),r("g",null,r("path",{class:[`${o}-progress-graph-circle-fill`,h===0&&`${o}-progress-graph-circle-fill--empty`],d:b,"stroke-width":n,"stroke-linecap":"round",fill:"none",style:$}))))),y?r("div",null,d.default?r("div",{class:`${o}-progress-custom-content`,role:"none"},d.default()):f!=="default"?r("div",{class:`${o}-progress-icon`,"aria-hidden":!0},r(D,{clsPrefix:o},{default:()=>U[f]})):r("div",{class:`${o}-progress-text`,style:{color:l},role:"none"},r("span",{class:`${o}-progress-text__percentage`},h),r("span",{class:`${o}-progress-text__unit`},m))):null)}}}),K={success:r(O,null),error:r(j,null),warning:r(q,null),info:r(_,null)},Z=P({name:"ProgressLine",props:{clsPrefix:{type:String,required:!0},percentage:{type:Number,default:0},railColor:String,railStyle:[String,Object],fillColor:[String,Object],status:{type:String,required:!0},indicatorPlacement:{type:String,required:!0},indicatorTextColor:String,unit:{type:String,default:"%"},processing:{type:Boolean,required:!0},showIndicator:{type:Boolean,required:!0},height:[String,Number],railBorderRadius:[String,Number],fillBorderRadius:[String,Number]},setup(e,{slots:d}){const g=v(()=>k(e.height)),p=v(()=>{var t,n;return typeof e.fillColor=="object"?`linear-gradient(to right, ${(t=e.fillColor)===null||t===void 0?void 0:t.stops[0]} , ${(n=e.fillColor)===null||n===void 0?void 0:n.stops[1]})`:e.fillColor}),c=v(()=>e.railBorderRadius!==void 0?k(e.railBorderRadius):e.height!==void 0?k(e.height,{c:.5}):""),i=v(()=>e.fillBorderRadius!==void 0?k(e.fillBorderRadius):e.railBorderRadius!==void 0?k(e.railBorderRadius):e.height!==void 0?k(e.height,{c:.5}):"");return()=>{const{indicatorPlacement:t,railColor:n,railStyle:u,percentage:f,unit:h,indicatorTextColor:y,status:l,showIndicator:m,processing:s,clsPrefix:o}=e;return r("div",{class:`${o}-progress-content`,role:"none"},r("div",{class:`${o}-progress-graph`,"aria-hidden":!0},r("div",{class:[`${o}-progress-graph-line`,{[`${o}-progress-graph-line--indicator-${t}`]:!0}]},r("div",{class:`${o}-progress-graph-line-rail`,style:[{backgroundColor:n,height:g.value,borderRadius:c.value},u]},r("div",{class:[`${o}-progress-graph-line-fill`,s&&`${o}-progress-graph-line-fill--processing`],style:{maxWidth:`${e.percentage}%`,background:p.value,height:g.value,lineHeight:g.value,borderRadius:i.value}},t==="inside"?r("div",{class:`${o}-progress-graph-line-indicator`,style:{color:y}},d.default?d.default():`${f}${h}`):null)))),m&&t==="outside"?r("div",null,d.default?r("div",{class:`${o}-progress-custom-content`,style:{color:y},role:"none"},d.default()):l==="default"?r("div",{role:"none",class:`${o}-progress-icon ${o}-progress-icon--as-text`,style:{color:y}},f,h):r("div",{class:`${o}-progress-icon`,"aria-hidden":!0},r(D,{clsPrefix:o},{default:()=>K[l]}))):null)}}});function W(e,d,g=100){return`m ${g/2} ${g/2-e} a ${e} ${e} 0 1 1 0 ${2*e} a ${e} ${e} 0 1 1 0 -${2*e}`}const Q=P({name:"ProgressMultipleCircle",props:{clsPrefix:{type:String,required:!0},viewBoxWidth:{type:Number,required:!0},percentage:{type:Array,default:[0]},strokeWidth:{type:Number,required:!0},circleGap:{type:Number,required:!0},showIndicator:{type:Boolean,required:!0},fillColor:{type:Array,default:()=>[]},railColor:{type:Array,default:()=>[]},railStyle:{type:Array,default:()=>[]}},setup(e,{slots:d}){const g=v(()=>e.percentage.map((i,t)=>`${Math.PI*i/100*(e.viewBoxWidth/2-e.strokeWidth/2*(1+2*t)-e.circleGap*t)*2}, ${e.viewBoxWidth*8}`)),p=(c,i)=>{const t=e.fillColor[i],n=typeof t=="object"?t.stops[0]:"",u=typeof t=="object"?t.stops[1]:"";return typeof e.fillColor[i]=="object"&&r("linearGradient",{id:`gradient-${i}`,x1:"100%",y1:"0%",x2:"0%",y2:"100%"},r("stop",{offset:"0%","stop-color":n}),r("stop",{offset:"100%","stop-color":u}))};return()=>{const{viewBoxWidth:c,strokeWidth:i,circleGap:t,showIndicator:n,fillColor:u,railColor:f,railStyle:h,percentage:y,clsPrefix:l}=e;return r("div",{class:`${l}-progress-content`,role:"none"},r("div",{class:`${l}-progress-graph`,"aria-hidden":!0},r("div",{class:`${l}-progress-graph-circle`},r("svg",{viewBox:`0 0 ${c} ${c}`},r("defs",null,y.map((m,s)=>p(m,s))),y.map((m,s)=>r("g",{key:s},r("path",{class:`${l}-progress-graph-circle-rail`,d:W(c/2-i/2*(1+2*s)-t*s,i,c),"stroke-width":i,"stroke-linecap":"round",fill:"none",style:[{strokeDashoffset:0,stroke:f[s]},h[s]]}),r("path",{class:[`${l}-progress-graph-circle-fill`,m===0&&`${l}-progress-graph-circle-fill--empty`],d:W(c/2-i/2*(1+2*s)-t*s,i,c),"stroke-width":i,"stroke-linecap":"round",fill:"none",style:{strokeDasharray:g.value[s],strokeDashoffset:0,stroke:typeof u[s]=="object"?`url(#gradient-${s})`:u[s]}})))))),n&&d.default?r("div",null,r("div",{class:`${l}-progress-text`},d.default())):null)}}}),ee=B([a("progress",{display:"inline-block"},[a("progress-icon",`
 color: var(--n-icon-color);
 transition: color .3s var(--n-bezier);
 `),w("line",`
 width: 100%;
 display: block;
 `,[a("progress-content",`
 display: flex;
 align-items: center;
 `,[a("progress-graph",{flex:1})]),a("progress-custom-content",{marginLeft:"14px"}),a("progress-icon",`
 width: 30px;
 padding-left: 14px;
 height: var(--n-icon-size-line);
 line-height: var(--n-icon-size-line);
 font-size: var(--n-icon-size-line);
 `,[w("as-text",`
 color: var(--n-text-color-line-outer);
 text-align: center;
 width: 40px;
 font-size: var(--n-font-size);
 padding-left: 4px;
 transition: color .3s var(--n-bezier);
 `)])]),w("circle, dashboard",{width:"120px"},[a("progress-custom-content",`
 position: absolute;
 left: 50%;
 top: 50%;
 transform: translateX(-50%) translateY(-50%);
 display: flex;
 align-items: center;
 justify-content: center;
 `),a("progress-text",`
 position: absolute;
 left: 50%;
 top: 50%;
 transform: translateX(-50%) translateY(-50%);
 display: flex;
 align-items: center;
 color: inherit;
 font-size: var(--n-font-size-circle);
 color: var(--n-text-color-circle);
 font-weight: var(--n-font-weight-circle);
 transition: color .3s var(--n-bezier);
 white-space: nowrap;
 `),a("progress-icon",`
 position: absolute;
 left: 50%;
 top: 50%;
 transform: translateX(-50%) translateY(-50%);
 display: flex;
 align-items: center;
 color: var(--n-icon-color);
 font-size: var(--n-icon-size-circle);
 `)]),w("multiple-circle",`
 width: 200px;
 color: inherit;
 `,[a("progress-text",`
 font-weight: var(--n-font-weight-circle);
 color: var(--n-text-color-circle);
 position: absolute;
 left: 50%;
 top: 50%;
 transform: translateX(-50%) translateY(-50%);
 display: flex;
 align-items: center;
 justify-content: center;
 transition: color .3s var(--n-bezier);
 `)]),a("progress-content",{position:"relative"}),a("progress-graph",{position:"relative"},[a("progress-graph-circle",[B("svg",{verticalAlign:"bottom"}),a("progress-graph-circle-fill",`
 stroke: var(--n-fill-color);
 transition:
 opacity .3s var(--n-bezier),
 stroke .3s var(--n-bezier),
 stroke-dasharray .3s var(--n-bezier);
 `,[w("empty",{opacity:0})]),a("progress-graph-circle-rail",`
 transition: stroke .3s var(--n-bezier);
 overflow: hidden;
 stroke: var(--n-rail-color);
 `)]),a("progress-graph-line",[w("indicator-inside",[a("progress-graph-line-rail",`
 height: 16px;
 line-height: 16px;
 border-radius: 10px;
 `,[a("progress-graph-line-fill",`
 height: inherit;
 border-radius: 10px;
 `),a("progress-graph-line-indicator",`
 background: #0000;
 white-space: nowrap;
 text-align: right;
 margin-left: 14px;
 margin-right: 14px;
 height: inherit;
 font-size: 12px;
 color: var(--n-text-color-line-inner);
 transition: color .3s var(--n-bezier);
 `)])]),w("indicator-inside-label",`
 height: 16px;
 display: flex;
 align-items: center;
 `,[a("progress-graph-line-rail",`
 flex: 1;
 transition: background-color .3s var(--n-bezier);
 `),a("progress-graph-line-indicator",`
 background: var(--n-fill-color);
 font-size: 12px;
 transform: translateZ(0);
 display: flex;
 vertical-align: middle;
 height: 16px;
 line-height: 16px;
 padding: 0 10px;
 border-radius: 10px;
 position: absolute;
 white-space: nowrap;
 color: var(--n-text-color-line-inner);
 transition:
 right .2s var(--n-bezier),
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `)]),a("progress-graph-line-rail",`
 position: relative;
 overflow: hidden;
 height: var(--n-rail-height);
 border-radius: 5px;
 background-color: var(--n-rail-color);
 transition: background-color .3s var(--n-bezier);
 `,[a("progress-graph-line-fill",`
 background: var(--n-fill-color);
 position: relative;
 border-radius: 5px;
 height: inherit;
 width: 100%;
 max-width: 0%;
 transition:
 background-color .3s var(--n-bezier),
 max-width .2s var(--n-bezier);
 `,[w("processing",[B("&::after",`
 content: "";
 background-image: var(--n-line-bg-processing);
 animation: progress-processing-animation 2s var(--n-bezier) infinite;
 `)])])])])])]),B("@keyframes progress-processing-animation",`
 0% {
 position: absolute;
 left: 0;
 top: 0;
 bottom: 0;
 right: 100%;
 opacity: 1;
 }
 66% {
 position: absolute;
 left: 0;
 top: 0;
 bottom: 0;
 right: 0;
 opacity: 0;
 }
 100% {
 position: absolute;
 left: 0;
 top: 0;
 bottom: 0;
 right: 0;
 opacity: 0;
 }
 `)]),re=Object.assign(Object.assign({},L.props),{processing:Boolean,type:{type:String,default:"line"},gapDegree:Number,gapOffsetDegree:Number,status:{type:String,default:"default"},railColor:[String,Array],railStyle:[String,Array],color:[String,Array,Object],viewBoxWidth:{type:Number,default:100},strokeWidth:{type:Number,default:7},percentage:[Number,Array],unit:{type:String,default:"%"},showIndicator:{type:Boolean,default:!0},indicatorPosition:{type:String,default:"outside"},indicatorPlacement:{type:String,default:"outside"},indicatorTextColor:String,circleGap:{type:Number,default:1},height:Number,borderRadius:[String,Number],fillBorderRadius:[String,Number],offsetDegree:Number}),se=P({name:"Progress",props:re,setup(e){const d=v(()=>e.indicatorPlacement||e.indicatorPosition),g=v(()=>{if(e.gapDegree||e.gapDegree===0)return e.gapDegree;if(e.type==="dashboard")return 75}),{mergedClsPrefixRef:p,inlineThemeDisabled:c}=A(e),i=L("Progress","-progress",ee,F,e,p),t=v(()=>{const{status:u}=e,{common:{cubicBezierEaseInOut:f},self:{fontSize:h,fontSizeCircle:y,railColor:l,railHeight:m,iconSizeCircle:s,iconSizeLine:o,textColorCircle:x,textColorLineInner:C,textColorLineOuter:b,lineBgProcessing:$,fontWeightCircle:S,[I("iconColor",u)]:R,[I("fillColor",u)]:z}}=i.value;return{"--n-bezier":f,"--n-fill-color":z,"--n-font-size":h,"--n-font-size-circle":y,"--n-font-weight-circle":S,"--n-icon-color":R,"--n-icon-size-circle":s,"--n-icon-size-line":o,"--n-line-bg-processing":$,"--n-rail-color":l,"--n-rail-height":m,"--n-text-color-circle":x,"--n-text-color-line-inner":C,"--n-text-color-line-outer":b}}),n=c?H("progress",v(()=>e.status[0]),t,e):void 0;return{mergedClsPrefix:p,mergedIndicatorPlacement:d,gapDeg:g,cssVars:c?void 0:t,themeClass:n==null?void 0:n.themeClass,onRender:n==null?void 0:n.onRender}},render(){const{type:e,cssVars:d,indicatorTextColor:g,showIndicator:p,status:c,railColor:i,railStyle:t,color:n,percentage:u,viewBoxWidth:f,strokeWidth:h,mergedIndicatorPlacement:y,unit:l,borderRadius:m,fillBorderRadius:s,height:o,processing:x,circleGap:C,mergedClsPrefix:b,gapDeg:$,gapOffsetDegree:S,themeClass:R,$slots:z,onRender:N}=this;return N==null||N(),r("div",{class:[R,`${b}-progress`,`${b}-progress--${e}`,`${b}-progress--${c}`],style:d,"aria-valuemax":100,"aria-valuemin":0,"aria-valuenow":u,role:e==="circle"||e==="line"||e==="dashboard"?"progressbar":"none"},e==="circle"||e==="dashboard"?r(J,{clsPrefix:b,status:c,showIndicator:p,indicatorTextColor:g,railColor:i,fillColor:n,railStyle:t,offsetDegree:this.offsetDegree,percentage:u,viewBoxWidth:f,strokeWidth:h,gapDegree:$===void 0?e==="dashboard"?75:0:$,gapOffsetDegree:S,unit:l},z):e==="line"?r(Z,{clsPrefix:b,status:c,showIndicator:p,indicatorTextColor:g,railColor:i,fillColor:n,railStyle:t,percentage:u,processing:x,indicatorPlacement:y,unit:l,fillBorderRadius:s,railBorderRadius:m,height:o},z):e==="multiple-circle"?r(Q,{clsPrefix:b,strokeWidth:h,railColor:i,fillColor:n,railStyle:t,viewBoxWidth:f,percentage:u,showIndicator:p,circleGap:C},z):null)}}),te={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 1024 1024"},ie=M("path",{d:"M518.3 459a8 8 0 0 0-12.6 0l-112 141.7a7.98 7.98 0 0 0 6.3 12.9h73.9V856c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V613.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 459z",fill:"currentColor"},null,-1),oe=M("path",{d:"M811.4 366.7C765.6 245.9 648.9 160 512.2 160S258.8 245.8 213 366.6C127.3 389.1 64 467.2 64 560c0 110.5 89.5 200 199.9 200H304c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8h-40.1c-33.7 0-65.4-13.4-89-37.7c-23.5-24.2-36-56.8-34.9-90.6c.9-26.4 9.9-51.2 26.2-72.1c16.7-21.3 40.1-36.8 66.1-43.7l37.9-9.9l13.9-36.6c8.6-22.8 20.6-44.1 35.7-63.4a245.6 245.6 0 0 1 52.4-49.9c41.1-28.9 89.5-44.2 140-44.2s98.9 15.3 140 44.2c19.9 14 37.5 30.8 52.4 49.9c15.1 19.3 27.1 40.7 35.7 63.4l13.8 36.5l37.8 10C846.1 454.5 884 503.8 884 560c0 33.1-12.9 64.3-36.3 87.7a123.07 123.07 0 0 1-87.6 36.3H720c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h40.1C870.5 760 960 670.5 960 560c0-92.7-63.1-170.7-148.6-193.3z",fill:"currentColor"},null,-1),ne=[ie,oe],ae=P({name:"CloudUploadOutlined",render:function(d,g){return V(),X("svg",te,ne)}});export{ae as C,se as N,F as p};
