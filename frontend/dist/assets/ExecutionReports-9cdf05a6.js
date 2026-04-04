import{J as Oe,l as Ne,a9 as Fe,d as Q,r as S,M as ce,x as C,q as ue,v as Me,a1 as He,B as Z,an as Pe,bO as Ie,T as K,aN as ee,aY as re,z as m,bP as De,aE as he,ah as We,am as me,bQ as te,bR as Le,bS as Ae,bT as Ue,bU as je,H as l,bM as G,n as R,_ as H,p as L,bo as Ye,bq as Xe,s as pe,a0 as se,O as oe,bV as Ve,y as qe,bs as Ke,br as Qe,ad as ae,bW as Ge,R as A,bb as Je,bd as Ze,C as et,c as T,a,G as tt,t as d,b,w as F,b0 as rt,e as h,o as E,N as Y,j as st,aW as ot,a3 as J,aM as ne,aK as ie,F as X,g as V,i as q}from"./index-bb02345e.js";import{e as le}from"./exec-request-dcc75b34.js";import{S as at}from"./SearchOutlined-88f03a0d.js";import{S as nt}from"./SyncOutlined-88aa69a3.js";import{R as it}from"./RightOutlined-553f006e.js";import{N as lt}from"./Input-f092229d.js";import{a as dt}from"./Select-6fc2e485.js";import{N as de}from"./Spin-c37ef91d.js";import{N as ct}from"./Scrollbar-ea15e849.js";import{_ as ut}from"./_plugin-vue_export-helper-c27b6911.js";import"./axios-78d57de0.js";import"./Empty-5d98aa02.js";function ht(r){const{modalColor:s,textColor1:n,textColor2:f,boxShadow3:p,lineHeight:$,fontWeightStrong:c,dividerColor:g,closeColorHover:w,closeColorPressed:O,closeIconColor:M,closeIconColorHover:_,closeIconColorPressed:B,borderRadius:z,primaryColorHover:y}=r;return{bodyPadding:"16px 24px",borderRadius:z,headerPadding:"16px 24px",footerPadding:"16px 24px",color:s,textColor:f,titleTextColor:n,titleFontSize:"18px",titleFontWeight:c,boxShadow:p,lineHeight:$,headerBorderBottom:`1px solid ${g}`,footerBorderTop:`1px solid ${g}`,closeIconColor:M,closeIconColorHover:_,closeIconColorPressed:B,closeSize:"22px",closeIconSize:"18px",closeColorHover:w,closeColorPressed:O,closeBorderRadius:z,resizableTriggerColorHover:y}}const mt=Oe({name:"Drawer",common:Ne,peers:{Scrollbar:Fe},self:ht}),pt=mt,ft=Q({name:"NDrawerContent",inheritAttrs:!1,props:{blockScroll:Boolean,show:{type:Boolean,default:void 0},displayDirective:{type:String,required:!0},placement:{type:String,required:!0},contentClass:String,contentStyle:[Object,String],nativeScrollbar:{type:Boolean,required:!0},scrollbarProps:Object,trapFocus:{type:Boolean,default:!0},autoFocus:{type:Boolean,default:!0},showMask:{type:[Boolean,String],required:!0},maxWidth:Number,maxHeight:Number,minWidth:Number,minHeight:Number,resizable:Boolean,onClickoutside:Function,onAfterLeave:Function,onAfterEnter:Function,onEsc:Function},setup(r){const s=S(!!r.show),n=S(null),f=ce(te);let p=0,$="",c=null;const g=S(!1),w=S(!1),O=C(()=>r.placement==="top"||r.placement==="bottom"),{mergedClsPrefixRef:M,mergedRtlRef:_}=ue(r),B=Me("Drawer",_,M),z=i,y=e=>{w.value=!0,p=O.value?e.clientY:e.clientX,$=document.body.style.cursor,document.body.style.cursor=O.value?"ns-resize":"ew-resize",document.body.addEventListener("mousemove",N),document.body.addEventListener("mouseleave",z),document.body.addEventListener("mouseup",i)},U=()=>{c!==null&&(window.clearTimeout(c),c=null),w.value?g.value=!0:c=window.setTimeout(()=>{g.value=!0},300)},D=()=>{c!==null&&(window.clearTimeout(c),c=null),g.value=!1},{doUpdateHeight:W,doUpdateWidth:k}=f,P=e=>{const{maxWidth:u}=r;if(u&&e>u)return u;const{minWidth:v}=r;return v&&e<v?v:e},j=e=>{const{maxHeight:u}=r;if(u&&e>u)return u;const{minHeight:v}=r;return v&&e<v?v:e};function N(e){var u,v;if(w.value)if(O.value){let x=((u=n.value)===null||u===void 0?void 0:u.offsetHeight)||0;const I=p-e.clientY;x+=r.placement==="bottom"?I:-I,x=j(x),W(x),p=e.clientY}else{let x=((v=n.value)===null||v===void 0?void 0:v.offsetWidth)||0;const I=p-e.clientX;x+=r.placement==="right"?I:-I,x=P(x),k(x),p=e.clientX}}function i(){w.value&&(p=0,w.value=!1,document.body.style.cursor=$,document.body.removeEventListener("mousemove",N),document.body.removeEventListener("mouseup",i),document.body.removeEventListener("mouseleave",z))}He(()=>{r.show&&(s.value=!0)}),Z(()=>r.show,e=>{e||i()}),Pe(()=>{i()});const o=C(()=>{const{show:e}=r,u=[[re,e]];return r.showMask||u.push([Le,r.onClickoutside,void 0,{capture:!0}]),u});function t(){var e;s.value=!1,(e=r.onAfterLeave)===null||e===void 0||e.call(r)}return Ie(C(()=>r.blockScroll&&s.value)),K(Ae,n),K(Ue,null),K(je,null),{bodyRef:n,rtlEnabled:B,mergedClsPrefix:f.mergedClsPrefixRef,isMounted:f.isMountedRef,mergedTheme:f.mergedThemeRef,displayed:s,transitionName:C(()=>({right:"slide-in-from-right-transition",left:"slide-in-from-left-transition",top:"slide-in-from-top-transition",bottom:"slide-in-from-bottom-transition"})[r.placement]),handleAfterLeave:t,bodyDirectives:o,handleMousedownResizeTrigger:y,handleMouseenterResizeTrigger:U,handleMouseleaveResizeTrigger:D,isDragging:w,isHoverOnResizeTrigger:g}},render(){const{$slots:r,mergedClsPrefix:s}=this;return this.displayDirective==="show"||this.displayed||this.show?ee(m("div",{role:"none"},m(De,{disabled:!this.showMask||!this.trapFocus,active:this.show,autoFocus:this.autoFocus,onEsc:this.onEsc},{default:()=>m(he,{name:this.transitionName,appear:this.isMounted,onAfterEnter:this.onAfterEnter,onAfterLeave:this.handleAfterLeave},{default:()=>ee(m("div",We(this.$attrs,{role:"dialog",ref:"bodyRef","aria-modal":"true",class:[`${s}-drawer`,this.rtlEnabled&&`${s}-drawer--rtl`,`${s}-drawer--${this.placement}-placement`,this.isDragging&&`${s}-drawer--unselectable`,this.nativeScrollbar&&`${s}-drawer--native-scrollbar`]}),[this.resizable?m("div",{class:[`${s}-drawer__resize-trigger`,(this.isDragging||this.isHoverOnResizeTrigger)&&`${s}-drawer__resize-trigger--hover`],onMouseenter:this.handleMouseenterResizeTrigger,onMouseleave:this.handleMouseleaveResizeTrigger,onMousedown:this.handleMousedownResizeTrigger}):null,this.nativeScrollbar?m("div",{class:[`${s}-drawer-content-wrapper`,this.contentClass],style:this.contentStyle,role:"none"},r):m(me,Object.assign({},this.scrollbarProps,{contentStyle:this.contentStyle,contentClass:[`${s}-drawer-content-wrapper`,this.contentClass],theme:this.mergedTheme.peers.Scrollbar,themeOverrides:this.mergedTheme.peerOverrides.Scrollbar}),r)]),this.bodyDirectives)})})),[[re,this.displayDirective==="if"||this.displayed||this.show]]):null}}),{cubicBezierEaseIn:vt,cubicBezierEaseOut:bt}=G;function gt({duration:r="0.3s",leaveDuration:s="0.2s",name:n="slide-in-from-bottom"}={}){return[l(`&.${n}-transition-leave-active`,{transition:`transform ${s} ${vt}`}),l(`&.${n}-transition-enter-active`,{transition:`transform ${r} ${bt}`}),l(`&.${n}-transition-enter-to`,{transform:"translateY(0)"}),l(`&.${n}-transition-enter-from`,{transform:"translateY(100%)"}),l(`&.${n}-transition-leave-from`,{transform:"translateY(0)"}),l(`&.${n}-transition-leave-to`,{transform:"translateY(100%)"})]}const{cubicBezierEaseIn:yt,cubicBezierEaseOut:wt}=G;function xt({duration:r="0.3s",leaveDuration:s="0.2s",name:n="slide-in-from-left"}={}){return[l(`&.${n}-transition-leave-active`,{transition:`transform ${s} ${yt}`}),l(`&.${n}-transition-enter-active`,{transition:`transform ${r} ${wt}`}),l(`&.${n}-transition-enter-to`,{transform:"translateX(0)"}),l(`&.${n}-transition-enter-from`,{transform:"translateX(-100%)"}),l(`&.${n}-transition-leave-from`,{transform:"translateX(0)"}),l(`&.${n}-transition-leave-to`,{transform:"translateX(-100%)"})]}const{cubicBezierEaseIn:St,cubicBezierEaseOut:Ct}=G;function zt({duration:r="0.3s",leaveDuration:s="0.2s",name:n="slide-in-from-right"}={}){return[l(`&.${n}-transition-leave-active`,{transition:`transform ${s} ${St}`}),l(`&.${n}-transition-enter-active`,{transition:`transform ${r} ${Ct}`}),l(`&.${n}-transition-enter-to`,{transform:"translateX(0)"}),l(`&.${n}-transition-enter-from`,{transform:"translateX(100%)"}),l(`&.${n}-transition-leave-from`,{transform:"translateX(0)"}),l(`&.${n}-transition-leave-to`,{transform:"translateX(100%)"})]}const{cubicBezierEaseIn:$t,cubicBezierEaseOut:_t}=G;function Bt({duration:r="0.3s",leaveDuration:s="0.2s",name:n="slide-in-from-top"}={}){return[l(`&.${n}-transition-leave-active`,{transition:`transform ${s} ${$t}`}),l(`&.${n}-transition-enter-active`,{transition:`transform ${r} ${_t}`}),l(`&.${n}-transition-enter-to`,{transform:"translateY(0)"}),l(`&.${n}-transition-enter-from`,{transform:"translateY(-100%)"}),l(`&.${n}-transition-leave-from`,{transform:"translateY(0)"}),l(`&.${n}-transition-leave-to`,{transform:"translateY(-100%)"})]}const kt=l([R("drawer",`
 word-break: break-word;
 line-height: var(--n-line-height);
 position: absolute;
 pointer-events: all;
 box-shadow: var(--n-box-shadow);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 background-color: var(--n-color);
 color: var(--n-text-color);
 box-sizing: border-box;
 `,[zt(),xt(),Bt(),gt(),H("unselectable",`
 user-select: none; 
 -webkit-user-select: none;
 `),H("native-scrollbar",[R("drawer-content-wrapper",`
 overflow: auto;
 height: 100%;
 `)]),L("resize-trigger",`
 position: absolute;
 background-color: #0000;
 transition: background-color .3s var(--n-bezier);
 `,[H("hover",`
 background-color: var(--n-resize-trigger-color-hover);
 `)]),R("drawer-content-wrapper",`
 box-sizing: border-box;
 `),R("drawer-content",`
 height: 100%;
 display: flex;
 flex-direction: column;
 `,[H("native-scrollbar",[R("drawer-body-content-wrapper",`
 height: 100%;
 overflow: auto;
 `)]),R("drawer-body",`
 flex: 1 0 0;
 overflow: hidden;
 `),R("drawer-body-content-wrapper",`
 box-sizing: border-box;
 padding: var(--n-body-padding);
 `),R("drawer-header",`
 font-weight: var(--n-title-font-weight);
 line-height: 1;
 font-size: var(--n-title-font-size);
 color: var(--n-title-text-color);
 padding: var(--n-header-padding);
 transition: border .3s var(--n-bezier);
 border-bottom: 1px solid var(--n-divider-color);
 border-bottom: var(--n-header-border-bottom);
 display: flex;
 justify-content: space-between;
 align-items: center;
 `,[L("main",`
 flex: 1;
 `),L("close",`
 margin-left: 6px;
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `)]),R("drawer-footer",`
 display: flex;
 justify-content: flex-end;
 border-top: var(--n-footer-border-top);
 transition: border .3s var(--n-bezier);
 padding: var(--n-footer-padding);
 `)]),H("right-placement",`
 top: 0;
 bottom: 0;
 right: 0;
 border-top-left-radius: var(--n-border-radius);
 border-bottom-left-radius: var(--n-border-radius);
 `,[L("resize-trigger",`
 width: 3px;
 height: 100%;
 top: 0;
 left: 0;
 transform: translateX(-1.5px);
 cursor: ew-resize;
 `)]),H("left-placement",`
 top: 0;
 bottom: 0;
 left: 0;
 border-top-right-radius: var(--n-border-radius);
 border-bottom-right-radius: var(--n-border-radius);
 `,[L("resize-trigger",`
 width: 3px;
 height: 100%;
 top: 0;
 right: 0;
 transform: translateX(1.5px);
 cursor: ew-resize;
 `)]),H("top-placement",`
 top: 0;
 left: 0;
 right: 0;
 border-bottom-left-radius: var(--n-border-radius);
 border-bottom-right-radius: var(--n-border-radius);
 `,[L("resize-trigger",`
 width: 100%;
 height: 3px;
 bottom: 0;
 left: 0;
 transform: translateY(1.5px);
 cursor: ns-resize;
 `)]),H("bottom-placement",`
 left: 0;
 bottom: 0;
 right: 0;
 border-top-left-radius: var(--n-border-radius);
 border-top-right-radius: var(--n-border-radius);
 `,[L("resize-trigger",`
 width: 100%;
 height: 3px;
 top: 0;
 left: 0;
 transform: translateY(-1.5px);
 cursor: ns-resize;
 `)])]),l("body",[l(">",[R("drawer-container",`
 position: fixed;
 `)])]),R("drawer-container",`
 position: relative;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 pointer-events: none;
 `,[l("> *",`
 pointer-events: all;
 `)]),R("drawer-mask",`
 background-color: rgba(0, 0, 0, .3);
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 `,[H("invisible",`
 background-color: rgba(0, 0, 0, 0)
 `),Ye({enterDuration:"0.2s",leaveDuration:"0.2s",enterCubicBezier:"var(--n-bezier-in)",leaveCubicBezier:"var(--n-bezier-out)"})])]),Rt=Object.assign(Object.assign({},pe.props),{show:Boolean,width:[Number,String],height:[Number,String],placement:{type:String,default:"right"},maskClosable:{type:Boolean,default:!0},showMask:{type:[Boolean,String],default:!0},to:[String,Object],displayDirective:{type:String,default:"if"},nativeScrollbar:{type:Boolean,default:!0},zIndex:Number,onMaskClick:Function,scrollbarProps:Object,contentClass:String,contentStyle:[Object,String],trapFocus:{type:Boolean,default:!0},onEsc:Function,autoFocus:{type:Boolean,default:!0},closeOnEsc:{type:Boolean,default:!0},blockScroll:{type:Boolean,default:!0},maxWidth:Number,maxHeight:Number,minWidth:Number,minHeight:Number,resizable:Boolean,defaultWidth:{type:[Number,String],default:251},defaultHeight:{type:[Number,String],default:251},onUpdateWidth:[Function,Array],onUpdateHeight:[Function,Array],"onUpdate:width":[Function,Array],"onUpdate:height":[Function,Array],"onUpdate:show":[Function,Array],onUpdateShow:[Function,Array],onAfterEnter:Function,onAfterLeave:Function,drawerStyle:[String,Object],drawerClass:String,target:null,onShow:Function,onHide:Function}),Tt=Q({name:"Drawer",inheritAttrs:!1,props:Rt,setup(r){const{mergedClsPrefixRef:s,namespaceRef:n,inlineThemeDisabled:f}=ue(r),p=Xe(),$=pe("Drawer","-drawer",kt,pt,r,s),c=S(r.defaultWidth),g=S(r.defaultHeight),w=se(oe(r,"width"),c),O=se(oe(r,"height"),g),M=C(()=>{const{placement:i}=r;return i==="top"||i==="bottom"?"":ae(w.value)}),_=C(()=>{const{placement:i}=r;return i==="left"||i==="right"?"":ae(O.value)}),B=i=>{const{onUpdateWidth:o,"onUpdate:width":t}=r;o&&A(o,i),t&&A(t,i),c.value=i},z=i=>{const{onUpdateHeight:o,"onUpdate:width":t}=r;o&&A(o,i),t&&A(t,i),g.value=i},y=C(()=>[{width:M.value,height:_.value},r.drawerStyle||""]);function U(i){const{onMaskClick:o,maskClosable:t}=r;t&&P(!1),o&&o(i)}function D(i){U(i)}const W=Ve();function k(i){var o;(o=r.onEsc)===null||o===void 0||o.call(r),r.show&&r.closeOnEsc&&Ge(i)&&(W.value||P(!1))}function P(i){const{onHide:o,onUpdateShow:t,"onUpdate:show":e}=r;t&&A(t,i),e&&A(e,i),o&&!i&&A(o,i)}K(te,{isMountedRef:p,mergedThemeRef:$,mergedClsPrefixRef:s,doUpdateShow:P,doUpdateHeight:z,doUpdateWidth:B});const j=C(()=>{const{common:{cubicBezierEaseInOut:i,cubicBezierEaseIn:o,cubicBezierEaseOut:t},self:{color:e,textColor:u,boxShadow:v,lineHeight:x,headerPadding:I,footerPadding:fe,borderRadius:ve,bodyPadding:be,titleFontSize:ge,titleTextColor:ye,titleFontWeight:we,headerBorderBottom:xe,footerBorderTop:Se,closeIconColor:Ce,closeIconColorHover:ze,closeIconColorPressed:$e,closeColorHover:_e,closeColorPressed:Be,closeIconSize:ke,closeSize:Re,closeBorderRadius:Te,resizableTriggerColorHover:Ee}}=$.value;return{"--n-line-height":x,"--n-color":e,"--n-border-radius":ve,"--n-text-color":u,"--n-box-shadow":v,"--n-bezier":i,"--n-bezier-out":t,"--n-bezier-in":o,"--n-header-padding":I,"--n-body-padding":be,"--n-footer-padding":fe,"--n-title-text-color":ye,"--n-title-font-size":ge,"--n-title-font-weight":we,"--n-header-border-bottom":xe,"--n-footer-border-top":Se,"--n-close-icon-color":Ce,"--n-close-icon-color-hover":ze,"--n-close-icon-color-pressed":$e,"--n-close-size":Re,"--n-close-color-hover":_e,"--n-close-color-pressed":Be,"--n-close-icon-size":ke,"--n-close-border-radius":Te,"--n-resize-trigger-color-hover":Ee}}),N=f?qe("drawer",void 0,j,r):void 0;return{mergedClsPrefix:s,namespace:n,mergedBodyStyle:y,handleOutsideClick:D,handleMaskClick:U,handleEsc:k,mergedTheme:$,cssVars:f?void 0:j,themeClass:N==null?void 0:N.themeClass,onRender:N==null?void 0:N.onRender,isMounted:p}},render(){const{mergedClsPrefix:r}=this;return m(Qe,{to:this.to,show:this.show},{default:()=>{var s;return(s=this.onRender)===null||s===void 0||s.call(this),ee(m("div",{class:[`${r}-drawer-container`,this.namespace,this.themeClass],style:this.cssVars,role:"none"},this.showMask?m(he,{name:"fade-in-transition",appear:this.isMounted},{default:()=>this.show?m("div",{"aria-hidden":!0,class:[`${r}-drawer-mask`,this.showMask==="transparent"&&`${r}-drawer-mask--invisible`],onClick:this.handleMaskClick}):null}):null,m(ft,Object.assign({},this.$attrs,{class:[this.drawerClass,this.$attrs.class],style:[this.mergedBodyStyle,this.$attrs.style],blockScroll:this.blockScroll,contentStyle:this.contentStyle,contentClass:this.contentClass,placement:this.placement,scrollbarProps:this.scrollbarProps,show:this.show,displayDirective:this.displayDirective,nativeScrollbar:this.nativeScrollbar,onAfterEnter:this.onAfterEnter,onAfterLeave:this.onAfterLeave,trapFocus:this.trapFocus,autoFocus:this.autoFocus,resizable:this.resizable,maxHeight:this.maxHeight,minHeight:this.minHeight,maxWidth:this.maxWidth,minWidth:this.minWidth,showMask:this.showMask,onEsc:this.handleEsc,onClickoutside:this.handleOutsideClick}),this.$slots)),[[Ke,{zIndex:this.zIndex,enabled:this.show}]])}})}}),Et={title:String,headerClass:String,headerStyle:[Object,String],footerClass:String,footerStyle:[Object,String],bodyClass:String,bodyStyle:[Object,String],bodyContentClass:String,bodyContentStyle:[Object,String],nativeScrollbar:{type:Boolean,default:!0},scrollbarProps:Object,closable:Boolean},Ot=Q({name:"DrawerContent",props:Et,slots:Object,setup(){const r=ce(te,null);r||Je("drawer-content","`n-drawer-content` must be placed inside `n-drawer`.");const{doUpdateShow:s}=r;function n(){s(!1)}return{handleCloseClick:n,mergedTheme:r.mergedThemeRef,mergedClsPrefix:r.mergedClsPrefixRef}},render(){const{title:r,mergedClsPrefix:s,nativeScrollbar:n,mergedTheme:f,bodyClass:p,bodyStyle:$,bodyContentClass:c,bodyContentStyle:g,headerClass:w,headerStyle:O,footerClass:M,footerStyle:_,scrollbarProps:B,closable:z,$slots:y}=this;return m("div",{role:"none",class:[`${s}-drawer-content`,n&&`${s}-drawer-content--native-scrollbar`]},y.header||r||z?m("div",{class:[`${s}-drawer-header`,w],style:O,role:"none"},m("div",{class:`${s}-drawer-header__main`,role:"heading","aria-level":"1"},y.header!==void 0?y.header():r),z&&m(Ze,{onClick:this.handleCloseClick,clsPrefix:s,class:`${s}-drawer-header__close`,absolute:!0})):null,n?m("div",{class:[`${s}-drawer-body`,p],style:$,role:"none"},m("div",{class:[`${s}-drawer-body-content-wrapper`,c],style:g,role:"none"},y)):m(me,Object.assign({themeOverrides:f.peerOverrides.Scrollbar,theme:f.peers.Scrollbar},B,{class:`${s}-drawer-body`,contentClass:[`${s}-drawer-body-content-wrapper`,c],contentStyle:g}),y),y.footer?m("div",{class:[`${s}-drawer-footer`,M],style:_,role:"none"},y.footer()):null)}}),Nt={class:"exec-rpt-page"},Ft={class:"exec-rpt-inner"},Mt={class:"exec-rpt-stats"},Ht={class:"exec-rpt-stat-card"},Pt={class:"exec-rpt-stat-val"},It={class:"exec-rpt-stat-card accent"},Dt={class:"exec-rpt-stat-val"},Wt={class:"exec-rpt-stat-card success"},Lt={class:"exec-rpt-stat-val"},At={class:"exec-rpt-stat-card warn"},Ut={class:"exec-rpt-stat-val"},jt={class:"exec-rpt-toolbar"},Yt={key:0,class:"exec-rpt-empty"},Xt={class:"exec-rpt-empty-ico-wrap"},Vt={key:1,class:"exec-rpt-list"},qt=["onClick"],Kt={class:"exec-rpt-card-main"},Qt={class:"exec-rpt-card-title-row"},Gt={class:"exec-rpt-card-title"},Jt={class:"exec-rpt-card-meta"},Zt={class:"exec-rpt-card-metrics"},er={class:"exec-rpt-metric"},tr={class:"exec-rpt-metric ok"},rr={class:"exec-rpt-metric bad"},sr={class:"exec-rpt-d-sum"},or={class:"exec-rpt-d-entry-hd"},ar={key:0,class:"exec-rpt-d-code"},nr={key:1,class:"exec-rpt-d-ms"},ir={class:"exec-rpt-d-url"},lr={key:0,class:"exec-rpt-d-body"},dr={key:1,class:"exec-rpt-d-err"},cr=Q({__name:"ExecutionReports",setup(r){const s=S(!1),n=S([]),f=S(""),p=S("all"),$=[{label:"全部来源",value:"all"},{label:"手动单步",value:"manual"},{label:"批量运行",value:"batch"},{label:"定时",value:"scheduled"}],c=C(()=>{let o=n.value;return p.value!=="all"&&(o=o.filter(t=>(t.trigger_type||"manual")===p.value)),o}),g=C(()=>c.value.length),w=C(()=>c.value.filter(o=>o.trigger_type==="batch").length),O=C(()=>c.value.reduce((o,t)=>{var e;return o+Number(((e=t.summary)==null?void 0:e.pass)??0)},0)),M=C(()=>c.value.reduce((o,t)=>{var e;return o+Number(((e=t.summary)==null?void 0:e.fail)??0)},0));let _=null;Z(f,()=>{_&&clearTimeout(_),_=setTimeout(()=>{_=null,B()},400)}),Z(p,()=>{});const B=async()=>{s.value=!0;try{const o=f.value.trim(),t=await le.get("/test-scenarios/reports",{params:{q:o||void 0,limit:200}});n.value=Array.isArray(t)?t:[]}catch{n.value=[]}finally{s.value=!1}},z=o=>o.title&&String(o.title).trim()||o.scenario_name||`场景 #${o.scenario_id}`,y=o=>o==="batch"?"批量":o==="scheduled"?"定时":"手动",U=o=>o==="batch"?"is-batch":o==="scheduled"?"is-sched":"is-manual",D=S(!1),W=S(!1),k=S(null),P=S("报告明细"),j=async o=>{P.value=z(o),D.value=!0,W.value=!0,k.value=null;try{const t=await le.get(`/test-scenarios/reports/${o.id}`);k.value=t}catch{k.value=null}finally{W.value=!1}},N=(o,t)=>o.length>t?`${o.slice(0,t)}…`:o,i=C(()=>typeof window<"u"?Math.min(560,window.innerWidth-24):560);return et(()=>{B()}),(o,t)=>(E(),T("div",Nt,[a("div",Ft,[t[19]||(t[19]=tt('<header class="exec-rpt-hero" data-v-4603d0f6><div class="exec-rpt-hero-text" data-v-4603d0f6><p class="exec-rpt-eyebrow" data-v-4603d0f6>Execution intelligence</p><h1 class="exec-rpt-title" data-v-4603d0f6>执行报告</h1><p class="exec-rpt-sub" data-v-4603d0f6> 聚合自动化场景的单步调试与批量运行结果，支持检索与下钻明细。 </p></div><div class="exec-rpt-hero-visual" aria-hidden="true" data-v-4603d0f6><div class="exec-rpt-orbit" data-v-4603d0f6></div><div class="exec-rpt-glow" data-v-4603d0f6></div></div></header>',1)),a("section",Mt,[a("div",Ht,[t[3]||(t[3]=a("span",{class:"exec-rpt-stat-label"},"报告总数",-1)),a("span",Pt,d(g.value),1),t[4]||(t[4]=a("span",{class:"exec-rpt-stat-hint"},"当前列表",-1))]),a("div",It,[t[5]||(t[5]=a("span",{class:"exec-rpt-stat-label"},"批量运行",-1)),a("span",Dt,d(w.value),1),t[6]||(t[6]=a("span",{class:"exec-rpt-stat-hint"},"trigger: batch",-1))]),a("div",Wt,[t[7]||(t[7]=a("span",{class:"exec-rpt-stat-label"},"累计通过步骤",-1)),a("span",Lt,d(O.value),1),t[8]||(t[8]=a("span",{class:"exec-rpt-stat-hint"},"Σ pass",-1))]),a("div",At,[t[9]||(t[9]=a("span",{class:"exec-rpt-stat-label"},"累计失败步骤",-1)),a("span",Ut,d(M.value),1),t[10]||(t[10]=a("span",{class:"exec-rpt-stat-hint"},"Σ fail",-1))])]),a("div",jt,[b(h(lt),{value:f.value,"onUpdate:value":t[0]||(t[0]=e=>f.value=e),placeholder:"搜索场景名、标题、创建者…",clearable:"",round:"",class:"exec-rpt-search",onKeyup:rt(B,["enter"])},{prefix:F(()=>[b(h(Y),{component:h(at),class:"exec-rpt-search-ico"},null,8,["component"])]),_:1},8,["value"]),b(h(dt),{value:p.value,"onUpdate:value":t[1]||(t[1]=e=>p.value=e),options:$,style:{width:"140px"},size:"medium"},null,8,["value"]),b(h(st),{quaternary:"",circle:"",onClick:B},{icon:F(()=>[b(h(Y),{component:h(nt)},null,8,["component"])]),_:1})]),b(h(de),{show:s.value,class:"exec-rpt-spin"},{default:F(()=>[!s.value&&c.value.length===0?(E(),T("div",Yt,[a("div",Xt,[b(h(Y),{component:h(ot),size:40,class:"exec-rpt-empty-ico"},null,8,["component"])]),t[11]||(t[11]=a("p",{class:"exec-rpt-empty-title"},"暂无执行记录",-1)),t[12]||(t[12]=a("p",{class:"exec-rpt-empty-desc"}," 在「自动化测试」中执行步骤或点击「批量运行」后，报告将自动出现在此处。 ",-1))])):(E(),T("div",Vt,[(E(!0),T(J,null,ne(c.value,e=>{var u,v,x;return E(),T("article",{key:e.id,class:"exec-rpt-card",onClick:I=>j(e)},[a("div",Kt,[a("div",Qt,[a("span",{class:ie(["exec-rpt-pill",U(e.trigger_type)])},d(y(e.trigger_type)),3),a("h2",Gt,d(z(e)),1)]),a("p",Jt,[a("span",null,d(e.scenario_name||"—"),1),t[13]||(t[13]=a("span",{class:"dot"},"·",-1)),a("span",null,d(e.env_name||"默认环境"),1),t[14]||(t[14]=a("span",{class:"dot"},"·",-1)),a("span",null,d(e.created_at),1),t[15]||(t[15]=a("span",{class:"dot"},"·",-1)),a("span",null,d(e.creator||"—"),1)])]),a("div",Zt,[a("div",er,[t[16]||(t[16]=a("span",{class:"n"},"总",-1)),a("b",null,d(((u=e.summary)==null?void 0:u.total)??0),1)]),a("div",tr,[t[17]||(t[17]=a("span",{class:"n"},"过",-1)),a("b",null,d(((v=e.summary)==null?void 0:v.pass)??0),1)]),a("div",rr,[t[18]||(t[18]=a("span",{class:"n"},"败",-1)),a("b",null,d(((x=e.summary)==null?void 0:x.fail)??0),1)])]),b(h(Y),{component:h(it),class:"exec-rpt-chevron"},null,8,["component"])],8,qt)}),128))]))]),_:1},8,["show"])]),b(h(Tt),{show:D.value,"onUpdate:show":t[2]||(t[2]=e=>D.value=e),width:i.value,placement:"right",class:"exec-rpt-drawer"},{default:F(()=>[b(h(Ot),{title:P.value,closable:""},{default:F(()=>[b(h(de),{show:W.value},{default:F(()=>[k.value?(E(),T(J,{key:0},[a("div",sr,[b(h(X),{type:"success",size:"small",round:""},{default:F(()=>{var e;return[V("通过 "+d(((e=k.value.summary)==null?void 0:e.pass)??0),1)]}),_:1}),b(h(X),{type:"error",size:"small",round:""},{default:F(()=>{var e;return[V("失败 "+d(((e=k.value.summary)==null?void 0:e.fail)??0),1)]}),_:1}),b(h(X),{size:"small",round:""},{default:F(()=>{var e;return[V("共 "+d(((e=k.value.summary)==null?void 0:e.total)??0)+" 步",1)]}),_:1})]),b(h(ct),{style:{"max-height":"calc(100vh - 140px)"}},{default:F(()=>[(E(!0),T(J,null,ne(k.value.entries||[],(e,u)=>(E(),T("div",{key:e.id||u,class:"exec-rpt-d-entry"},[a("div",or,[a("span",{class:ie(["exec-rpt-d-pass",e.pass?"ok":"bad"])},d(e.pass?"PASS":"FAIL"),3),a("strong",null,d(e.name),1),b(h(X),{size:"tiny",round:""},{default:F(()=>[V(d(e.method),1)]),_:2},1024),e.statusCode!=null?(E(),T("span",ar,d(e.statusCode),1)):q("",!0),e.elapsedMs!=null?(E(),T("span",nr,d(Math.round(e.elapsedMs))+"ms",1)):q("",!0)]),a("div",ir,d(e.url),1),e.responseBodyText?(E(),T("pre",lr,d(N(e.responseBodyText,1500)),1)):e.error?(E(),T("div",dr,d(e.error),1)):q("",!0)]))),128))]),_:1})],64)):q("",!0)]),_:1},8,["show"])]),_:1},8,["title"])]),_:1},8,["show","width"])]))}});const Cr=ut(cr,[["__scopeId","data-v-4603d0f6"]]);export{Cr as default};
