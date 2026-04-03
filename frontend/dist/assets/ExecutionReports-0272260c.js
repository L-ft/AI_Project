import{J as Ne,l as Oe,a9 as Fe,d as G,r as S,M as ce,x as C,q as ue,v as He,a1 as Me,B as Z,an as Ie,bC as Pe,T as K,aQ as ee,b3 as re,z as p,bD as De,aE as he,ah as Le,am as pe,bE as te,bF as We,bG as Ae,bH as je,bI as Ue,H as l,bA as J,n as R,_ as M,p as W,bJ as Xe,bK as Ye,s as me,a0 as se,O as oe,bL as Ve,y as qe,bM as Ke,bN as Ge,ad as ne,bO as Je,R as A,bi as Qe,bk as Ze,C as et,c as T,a as n,G as tt,t as d,b,w as F,b7 as rt,e as h,o as E,N as X,j as st,a3 as Q,aP as ae,aN as ie,F as Y,g as V,i as q}from"./index-6be918e1.js";import{e as le}from"./exec-request-efc87ff8.js";import{S as ot,a as nt}from"./SearchOutlined-c1b8336e.js";import{S as at,F as it}from"./SyncOutlined-851e10bd.js";import{R as lt}from"./RightOutlined-a1f78afe.js";import{N as dt}from"./Input-27e4a1eb.js";import{N as de}from"./Spin-69e4e0c6.js";import{N as ct}from"./Scrollbar-4ec92c13.js";import{_ as ut}from"./_plugin-vue_export-helper-c27b6911.js";import"./axios-78d57de0.js";import"./Empty-029123d5.js";function ht(r){const{modalColor:s,textColor1:a,textColor2:f,boxShadow3:m,lineHeight:$,fontWeightStrong:c,dividerColor:g,closeColorHover:w,closeColorPressed:N,closeIconColor:H,closeIconColorHover:_,closeIconColorPressed:B,borderRadius:z,primaryColorHover:y}=r;return{bodyPadding:"16px 24px",borderRadius:z,headerPadding:"16px 24px",footerPadding:"16px 24px",color:s,textColor:f,titleTextColor:a,titleFontSize:"18px",titleFontWeight:c,boxShadow:m,lineHeight:$,headerBorderBottom:`1px solid ${g}`,footerBorderTop:`1px solid ${g}`,closeIconColor:H,closeIconColorHover:_,closeIconColorPressed:B,closeSize:"22px",closeIconSize:"18px",closeColorHover:w,closeColorPressed:N,closeBorderRadius:z,resizableTriggerColorHover:y}}const pt=Ne({name:"Drawer",common:Oe,peers:{Scrollbar:Fe},self:ht}),mt=pt,ft=G({name:"NDrawerContent",inheritAttrs:!1,props:{blockScroll:Boolean,show:{type:Boolean,default:void 0},displayDirective:{type:String,required:!0},placement:{type:String,required:!0},contentClass:String,contentStyle:[Object,String],nativeScrollbar:{type:Boolean,required:!0},scrollbarProps:Object,trapFocus:{type:Boolean,default:!0},autoFocus:{type:Boolean,default:!0},showMask:{type:[Boolean,String],required:!0},maxWidth:Number,maxHeight:Number,minWidth:Number,minHeight:Number,resizable:Boolean,onClickoutside:Function,onAfterLeave:Function,onAfterEnter:Function,onEsc:Function},setup(r){const s=S(!!r.show),a=S(null),f=ce(te);let m=0,$="",c=null;const g=S(!1),w=S(!1),N=C(()=>r.placement==="top"||r.placement==="bottom"),{mergedClsPrefixRef:H,mergedRtlRef:_}=ue(r),B=He("Drawer",_,H),z=i,y=e=>{w.value=!0,m=N.value?e.clientY:e.clientX,$=document.body.style.cursor,document.body.style.cursor=N.value?"ns-resize":"ew-resize",document.body.addEventListener("mousemove",O),document.body.addEventListener("mouseleave",z),document.body.addEventListener("mouseup",i)},j=()=>{c!==null&&(window.clearTimeout(c),c=null),w.value?g.value=!0:c=window.setTimeout(()=>{g.value=!0},300)},D=()=>{c!==null&&(window.clearTimeout(c),c=null),g.value=!1},{doUpdateHeight:L,doUpdateWidth:k}=f,I=e=>{const{maxWidth:u}=r;if(u&&e>u)return u;const{minWidth:v}=r;return v&&e<v?v:e},U=e=>{const{maxHeight:u}=r;if(u&&e>u)return u;const{minHeight:v}=r;return v&&e<v?v:e};function O(e){var u,v;if(w.value)if(N.value){let x=((u=a.value)===null||u===void 0?void 0:u.offsetHeight)||0;const P=m-e.clientY;x+=r.placement==="bottom"?P:-P,x=U(x),L(x),m=e.clientY}else{let x=((v=a.value)===null||v===void 0?void 0:v.offsetWidth)||0;const P=m-e.clientX;x+=r.placement==="right"?P:-P,x=I(x),k(x),m=e.clientX}}function i(){w.value&&(m=0,w.value=!1,document.body.style.cursor=$,document.body.removeEventListener("mousemove",O),document.body.removeEventListener("mouseup",i),document.body.removeEventListener("mouseleave",z))}Me(()=>{r.show&&(s.value=!0)}),Z(()=>r.show,e=>{e||i()}),Ie(()=>{i()});const o=C(()=>{const{show:e}=r,u=[[re,e]];return r.showMask||u.push([We,r.onClickoutside,void 0,{capture:!0}]),u});function t(){var e;s.value=!1,(e=r.onAfterLeave)===null||e===void 0||e.call(r)}return Pe(C(()=>r.blockScroll&&s.value)),K(Ae,a),K(je,null),K(Ue,null),{bodyRef:a,rtlEnabled:B,mergedClsPrefix:f.mergedClsPrefixRef,isMounted:f.isMountedRef,mergedTheme:f.mergedThemeRef,displayed:s,transitionName:C(()=>({right:"slide-in-from-right-transition",left:"slide-in-from-left-transition",top:"slide-in-from-top-transition",bottom:"slide-in-from-bottom-transition"})[r.placement]),handleAfterLeave:t,bodyDirectives:o,handleMousedownResizeTrigger:y,handleMouseenterResizeTrigger:j,handleMouseleaveResizeTrigger:D,isDragging:w,isHoverOnResizeTrigger:g}},render(){const{$slots:r,mergedClsPrefix:s}=this;return this.displayDirective==="show"||this.displayed||this.show?ee(p("div",{role:"none"},p(De,{disabled:!this.showMask||!this.trapFocus,active:this.show,autoFocus:this.autoFocus,onEsc:this.onEsc},{default:()=>p(he,{name:this.transitionName,appear:this.isMounted,onAfterEnter:this.onAfterEnter,onAfterLeave:this.handleAfterLeave},{default:()=>ee(p("div",Le(this.$attrs,{role:"dialog",ref:"bodyRef","aria-modal":"true",class:[`${s}-drawer`,this.rtlEnabled&&`${s}-drawer--rtl`,`${s}-drawer--${this.placement}-placement`,this.isDragging&&`${s}-drawer--unselectable`,this.nativeScrollbar&&`${s}-drawer--native-scrollbar`]}),[this.resizable?p("div",{class:[`${s}-drawer__resize-trigger`,(this.isDragging||this.isHoverOnResizeTrigger)&&`${s}-drawer__resize-trigger--hover`],onMouseenter:this.handleMouseenterResizeTrigger,onMouseleave:this.handleMouseleaveResizeTrigger,onMousedown:this.handleMousedownResizeTrigger}):null,this.nativeScrollbar?p("div",{class:[`${s}-drawer-content-wrapper`,this.contentClass],style:this.contentStyle,role:"none"},r):p(pe,Object.assign({},this.scrollbarProps,{contentStyle:this.contentStyle,contentClass:[`${s}-drawer-content-wrapper`,this.contentClass],theme:this.mergedTheme.peers.Scrollbar,themeOverrides:this.mergedTheme.peerOverrides.Scrollbar}),r)]),this.bodyDirectives)})})),[[re,this.displayDirective==="if"||this.displayed||this.show]]):null}}),{cubicBezierEaseIn:vt,cubicBezierEaseOut:bt}=J;function gt({duration:r="0.3s",leaveDuration:s="0.2s",name:a="slide-in-from-bottom"}={}){return[l(`&.${a}-transition-leave-active`,{transition:`transform ${s} ${vt}`}),l(`&.${a}-transition-enter-active`,{transition:`transform ${r} ${bt}`}),l(`&.${a}-transition-enter-to`,{transform:"translateY(0)"}),l(`&.${a}-transition-enter-from`,{transform:"translateY(100%)"}),l(`&.${a}-transition-leave-from`,{transform:"translateY(0)"}),l(`&.${a}-transition-leave-to`,{transform:"translateY(100%)"})]}const{cubicBezierEaseIn:yt,cubicBezierEaseOut:wt}=J;function xt({duration:r="0.3s",leaveDuration:s="0.2s",name:a="slide-in-from-left"}={}){return[l(`&.${a}-transition-leave-active`,{transition:`transform ${s} ${yt}`}),l(`&.${a}-transition-enter-active`,{transition:`transform ${r} ${wt}`}),l(`&.${a}-transition-enter-to`,{transform:"translateX(0)"}),l(`&.${a}-transition-enter-from`,{transform:"translateX(-100%)"}),l(`&.${a}-transition-leave-from`,{transform:"translateX(0)"}),l(`&.${a}-transition-leave-to`,{transform:"translateX(-100%)"})]}const{cubicBezierEaseIn:St,cubicBezierEaseOut:Ct}=J;function zt({duration:r="0.3s",leaveDuration:s="0.2s",name:a="slide-in-from-right"}={}){return[l(`&.${a}-transition-leave-active`,{transition:`transform ${s} ${St}`}),l(`&.${a}-transition-enter-active`,{transition:`transform ${r} ${Ct}`}),l(`&.${a}-transition-enter-to`,{transform:"translateX(0)"}),l(`&.${a}-transition-enter-from`,{transform:"translateX(100%)"}),l(`&.${a}-transition-leave-from`,{transform:"translateX(0)"}),l(`&.${a}-transition-leave-to`,{transform:"translateX(100%)"})]}const{cubicBezierEaseIn:$t,cubicBezierEaseOut:_t}=J;function Bt({duration:r="0.3s",leaveDuration:s="0.2s",name:a="slide-in-from-top"}={}){return[l(`&.${a}-transition-leave-active`,{transition:`transform ${s} ${$t}`}),l(`&.${a}-transition-enter-active`,{transition:`transform ${r} ${_t}`}),l(`&.${a}-transition-enter-to`,{transform:"translateY(0)"}),l(`&.${a}-transition-enter-from`,{transform:"translateY(-100%)"}),l(`&.${a}-transition-leave-from`,{transform:"translateY(0)"}),l(`&.${a}-transition-leave-to`,{transform:"translateY(-100%)"})]}const kt=l([R("drawer",`
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
 `,[zt(),xt(),Bt(),gt(),M("unselectable",`
 user-select: none; 
 -webkit-user-select: none;
 `),M("native-scrollbar",[R("drawer-content-wrapper",`
 overflow: auto;
 height: 100%;
 `)]),W("resize-trigger",`
 position: absolute;
 background-color: #0000;
 transition: background-color .3s var(--n-bezier);
 `,[M("hover",`
 background-color: var(--n-resize-trigger-color-hover);
 `)]),R("drawer-content-wrapper",`
 box-sizing: border-box;
 `),R("drawer-content",`
 height: 100%;
 display: flex;
 flex-direction: column;
 `,[M("native-scrollbar",[R("drawer-body-content-wrapper",`
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
 `,[W("main",`
 flex: 1;
 `),W("close",`
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
 `)]),M("right-placement",`
 top: 0;
 bottom: 0;
 right: 0;
 border-top-left-radius: var(--n-border-radius);
 border-bottom-left-radius: var(--n-border-radius);
 `,[W("resize-trigger",`
 width: 3px;
 height: 100%;
 top: 0;
 left: 0;
 transform: translateX(-1.5px);
 cursor: ew-resize;
 `)]),M("left-placement",`
 top: 0;
 bottom: 0;
 left: 0;
 border-top-right-radius: var(--n-border-radius);
 border-bottom-right-radius: var(--n-border-radius);
 `,[W("resize-trigger",`
 width: 3px;
 height: 100%;
 top: 0;
 right: 0;
 transform: translateX(1.5px);
 cursor: ew-resize;
 `)]),M("top-placement",`
 top: 0;
 left: 0;
 right: 0;
 border-bottom-left-radius: var(--n-border-radius);
 border-bottom-right-radius: var(--n-border-radius);
 `,[W("resize-trigger",`
 width: 100%;
 height: 3px;
 bottom: 0;
 left: 0;
 transform: translateY(1.5px);
 cursor: ns-resize;
 `)]),M("bottom-placement",`
 left: 0;
 bottom: 0;
 right: 0;
 border-top-left-radius: var(--n-border-radius);
 border-top-right-radius: var(--n-border-radius);
 `,[W("resize-trigger",`
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
 `,[M("invisible",`
 background-color: rgba(0, 0, 0, 0)
 `),Xe({enterDuration:"0.2s",leaveDuration:"0.2s",enterCubicBezier:"var(--n-bezier-in)",leaveCubicBezier:"var(--n-bezier-out)"})])]),Rt=Object.assign(Object.assign({},me.props),{show:Boolean,width:[Number,String],height:[Number,String],placement:{type:String,default:"right"},maskClosable:{type:Boolean,default:!0},showMask:{type:[Boolean,String],default:!0},to:[String,Object],displayDirective:{type:String,default:"if"},nativeScrollbar:{type:Boolean,default:!0},zIndex:Number,onMaskClick:Function,scrollbarProps:Object,contentClass:String,contentStyle:[Object,String],trapFocus:{type:Boolean,default:!0},onEsc:Function,autoFocus:{type:Boolean,default:!0},closeOnEsc:{type:Boolean,default:!0},blockScroll:{type:Boolean,default:!0},maxWidth:Number,maxHeight:Number,minWidth:Number,minHeight:Number,resizable:Boolean,defaultWidth:{type:[Number,String],default:251},defaultHeight:{type:[Number,String],default:251},onUpdateWidth:[Function,Array],onUpdateHeight:[Function,Array],"onUpdate:width":[Function,Array],"onUpdate:height":[Function,Array],"onUpdate:show":[Function,Array],onUpdateShow:[Function,Array],onAfterEnter:Function,onAfterLeave:Function,drawerStyle:[String,Object],drawerClass:String,target:null,onShow:Function,onHide:Function}),Tt=G({name:"Drawer",inheritAttrs:!1,props:Rt,setup(r){const{mergedClsPrefixRef:s,namespaceRef:a,inlineThemeDisabled:f}=ue(r),m=Ye(),$=me("Drawer","-drawer",kt,mt,r,s),c=S(r.defaultWidth),g=S(r.defaultHeight),w=se(oe(r,"width"),c),N=se(oe(r,"height"),g),H=C(()=>{const{placement:i}=r;return i==="top"||i==="bottom"?"":ne(w.value)}),_=C(()=>{const{placement:i}=r;return i==="left"||i==="right"?"":ne(N.value)}),B=i=>{const{onUpdateWidth:o,"onUpdate:width":t}=r;o&&A(o,i),t&&A(t,i),c.value=i},z=i=>{const{onUpdateHeight:o,"onUpdate:width":t}=r;o&&A(o,i),t&&A(t,i),g.value=i},y=C(()=>[{width:H.value,height:_.value},r.drawerStyle||""]);function j(i){const{onMaskClick:o,maskClosable:t}=r;t&&I(!1),o&&o(i)}function D(i){j(i)}const L=Ve();function k(i){var o;(o=r.onEsc)===null||o===void 0||o.call(r),r.show&&r.closeOnEsc&&Je(i)&&(L.value||I(!1))}function I(i){const{onHide:o,onUpdateShow:t,"onUpdate:show":e}=r;t&&A(t,i),e&&A(e,i),o&&!i&&A(o,i)}K(te,{isMountedRef:m,mergedThemeRef:$,mergedClsPrefixRef:s,doUpdateShow:I,doUpdateHeight:z,doUpdateWidth:B});const U=C(()=>{const{common:{cubicBezierEaseInOut:i,cubicBezierEaseIn:o,cubicBezierEaseOut:t},self:{color:e,textColor:u,boxShadow:v,lineHeight:x,headerPadding:P,footerPadding:fe,borderRadius:ve,bodyPadding:be,titleFontSize:ge,titleTextColor:ye,titleFontWeight:we,headerBorderBottom:xe,footerBorderTop:Se,closeIconColor:Ce,closeIconColorHover:ze,closeIconColorPressed:$e,closeColorHover:_e,closeColorPressed:Be,closeIconSize:ke,closeSize:Re,closeBorderRadius:Te,resizableTriggerColorHover:Ee}}=$.value;return{"--n-line-height":x,"--n-color":e,"--n-border-radius":ve,"--n-text-color":u,"--n-box-shadow":v,"--n-bezier":i,"--n-bezier-out":t,"--n-bezier-in":o,"--n-header-padding":P,"--n-body-padding":be,"--n-footer-padding":fe,"--n-title-text-color":ye,"--n-title-font-size":ge,"--n-title-font-weight":we,"--n-header-border-bottom":xe,"--n-footer-border-top":Se,"--n-close-icon-color":Ce,"--n-close-icon-color-hover":ze,"--n-close-icon-color-pressed":$e,"--n-close-size":Re,"--n-close-color-hover":_e,"--n-close-color-pressed":Be,"--n-close-icon-size":ke,"--n-close-border-radius":Te,"--n-resize-trigger-color-hover":Ee}}),O=f?qe("drawer",void 0,U,r):void 0;return{mergedClsPrefix:s,namespace:a,mergedBodyStyle:y,handleOutsideClick:D,handleMaskClick:j,handleEsc:k,mergedTheme:$,cssVars:f?void 0:U,themeClass:O==null?void 0:O.themeClass,onRender:O==null?void 0:O.onRender,isMounted:m}},render(){const{mergedClsPrefix:r}=this;return p(Ge,{to:this.to,show:this.show},{default:()=>{var s;return(s=this.onRender)===null||s===void 0||s.call(this),ee(p("div",{class:[`${r}-drawer-container`,this.namespace,this.themeClass],style:this.cssVars,role:"none"},this.showMask?p(he,{name:"fade-in-transition",appear:this.isMounted},{default:()=>this.show?p("div",{"aria-hidden":!0,class:[`${r}-drawer-mask`,this.showMask==="transparent"&&`${r}-drawer-mask--invisible`],onClick:this.handleMaskClick}):null}):null,p(ft,Object.assign({},this.$attrs,{class:[this.drawerClass,this.$attrs.class],style:[this.mergedBodyStyle,this.$attrs.style],blockScroll:this.blockScroll,contentStyle:this.contentStyle,contentClass:this.contentClass,placement:this.placement,scrollbarProps:this.scrollbarProps,show:this.show,displayDirective:this.displayDirective,nativeScrollbar:this.nativeScrollbar,onAfterEnter:this.onAfterEnter,onAfterLeave:this.onAfterLeave,trapFocus:this.trapFocus,autoFocus:this.autoFocus,resizable:this.resizable,maxHeight:this.maxHeight,minHeight:this.minHeight,maxWidth:this.maxWidth,minWidth:this.minWidth,showMask:this.showMask,onEsc:this.handleEsc,onClickoutside:this.handleOutsideClick}),this.$slots)),[[Ke,{zIndex:this.zIndex,enabled:this.show}]])}})}}),Et={title:String,headerClass:String,headerStyle:[Object,String],footerClass:String,footerStyle:[Object,String],bodyClass:String,bodyStyle:[Object,String],bodyContentClass:String,bodyContentStyle:[Object,String],nativeScrollbar:{type:Boolean,default:!0},scrollbarProps:Object,closable:Boolean},Nt=G({name:"DrawerContent",props:Et,slots:Object,setup(){const r=ce(te,null);r||Qe("drawer-content","`n-drawer-content` must be placed inside `n-drawer`.");const{doUpdateShow:s}=r;function a(){s(!1)}return{handleCloseClick:a,mergedTheme:r.mergedThemeRef,mergedClsPrefix:r.mergedClsPrefixRef}},render(){const{title:r,mergedClsPrefix:s,nativeScrollbar:a,mergedTheme:f,bodyClass:m,bodyStyle:$,bodyContentClass:c,bodyContentStyle:g,headerClass:w,headerStyle:N,footerClass:H,footerStyle:_,scrollbarProps:B,closable:z,$slots:y}=this;return p("div",{role:"none",class:[`${s}-drawer-content`,a&&`${s}-drawer-content--native-scrollbar`]},y.header||r||z?p("div",{class:[`${s}-drawer-header`,w],style:N,role:"none"},p("div",{class:`${s}-drawer-header__main`,role:"heading","aria-level":"1"},y.header!==void 0?y.header():r),z&&p(Ze,{onClick:this.handleCloseClick,clsPrefix:s,class:`${s}-drawer-header__close`,absolute:!0})):null,a?p("div",{class:[`${s}-drawer-body`,m],style:$,role:"none"},p("div",{class:[`${s}-drawer-body-content-wrapper`,c],style:g,role:"none"},y)):p(pe,Object.assign({themeOverrides:f.peerOverrides.Scrollbar,theme:f.peers.Scrollbar},B,{class:`${s}-drawer-body`,contentClass:[`${s}-drawer-body-content-wrapper`,c],contentStyle:g}),y),y.footer?p("div",{class:[`${s}-drawer-footer`,H],style:_,role:"none"},y.footer()):null)}}),Ot={class:"exec-rpt-page"},Ft={class:"exec-rpt-inner"},Ht={class:"exec-rpt-stats"},Mt={class:"exec-rpt-stat-card"},It={class:"exec-rpt-stat-val"},Pt={class:"exec-rpt-stat-card accent"},Dt={class:"exec-rpt-stat-val"},Lt={class:"exec-rpt-stat-card success"},Wt={class:"exec-rpt-stat-val"},At={class:"exec-rpt-stat-card warn"},jt={class:"exec-rpt-stat-val"},Ut={class:"exec-rpt-toolbar"},Xt={key:0,class:"exec-rpt-empty"},Yt={class:"exec-rpt-empty-ico-wrap"},Vt={key:1,class:"exec-rpt-list"},qt=["onClick"],Kt={class:"exec-rpt-card-main"},Gt={class:"exec-rpt-card-title-row"},Jt={class:"exec-rpt-card-title"},Qt={class:"exec-rpt-card-meta"},Zt={class:"exec-rpt-card-metrics"},er={class:"exec-rpt-metric"},tr={class:"exec-rpt-metric ok"},rr={class:"exec-rpt-metric bad"},sr={class:"exec-rpt-d-sum"},or={class:"exec-rpt-d-entry-hd"},nr={key:0,class:"exec-rpt-d-code"},ar={key:1,class:"exec-rpt-d-ms"},ir={class:"exec-rpt-d-url"},lr={key:0,class:"exec-rpt-d-body"},dr={key:1,class:"exec-rpt-d-err"},cr=G({__name:"ExecutionReports",setup(r){const s=S(!1),a=S([]),f=S(""),m=S("all"),$=[{label:"全部来源",value:"all"},{label:"手动单步",value:"manual"},{label:"批量运行",value:"batch"},{label:"定时",value:"scheduled"}],c=C(()=>{let o=a.value;return m.value!=="all"&&(o=o.filter(t=>(t.trigger_type||"manual")===m.value)),o}),g=C(()=>c.value.length),w=C(()=>c.value.filter(o=>o.trigger_type==="batch").length),N=C(()=>c.value.reduce((o,t)=>{var e;return o+Number(((e=t.summary)==null?void 0:e.pass)??0)},0)),H=C(()=>c.value.reduce((o,t)=>{var e;return o+Number(((e=t.summary)==null?void 0:e.fail)??0)},0));let _=null;Z(f,()=>{_&&clearTimeout(_),_=setTimeout(()=>{_=null,B()},400)}),Z(m,()=>{});const B=async()=>{s.value=!0;try{const o=f.value.trim(),t=await le.get("/test-scenarios/reports",{params:{q:o||void 0,limit:200}});a.value=Array.isArray(t)?t:[]}catch{a.value=[]}finally{s.value=!1}},z=o=>o.title&&String(o.title).trim()||o.scenario_name||`场景 #${o.scenario_id}`,y=o=>o==="batch"?"批量":o==="scheduled"?"定时":"手动",j=o=>o==="batch"?"is-batch":o==="scheduled"?"is-sched":"is-manual",D=S(!1),L=S(!1),k=S(null),I=S("报告明细"),U=async o=>{I.value=z(o),D.value=!0,L.value=!0,k.value=null;try{const t=await le.get(`/test-scenarios/reports/${o.id}`);k.value=t}catch{k.value=null}finally{L.value=!1}},O=(o,t)=>o.length>t?`${o.slice(0,t)}…`:o,i=C(()=>typeof window<"u"?Math.min(560,window.innerWidth-24):560);return et(()=>{B()}),(o,t)=>(E(),T("div",Ot,[n("div",Ft,[t[19]||(t[19]=tt('<header class="exec-rpt-hero" data-v-4603d0f6><div class="exec-rpt-hero-text" data-v-4603d0f6><p class="exec-rpt-eyebrow" data-v-4603d0f6>Execution intelligence</p><h1 class="exec-rpt-title" data-v-4603d0f6>执行报告</h1><p class="exec-rpt-sub" data-v-4603d0f6> 聚合自动化场景的单步调试与批量运行结果，支持检索与下钻明细。 </p></div><div class="exec-rpt-hero-visual" aria-hidden="true" data-v-4603d0f6><div class="exec-rpt-orbit" data-v-4603d0f6></div><div class="exec-rpt-glow" data-v-4603d0f6></div></div></header>',1)),n("section",Ht,[n("div",Mt,[t[3]||(t[3]=n("span",{class:"exec-rpt-stat-label"},"报告总数",-1)),n("span",It,d(g.value),1),t[4]||(t[4]=n("span",{class:"exec-rpt-stat-hint"},"当前列表",-1))]),n("div",Pt,[t[5]||(t[5]=n("span",{class:"exec-rpt-stat-label"},"批量运行",-1)),n("span",Dt,d(w.value),1),t[6]||(t[6]=n("span",{class:"exec-rpt-stat-hint"},"trigger: batch",-1))]),n("div",Lt,[t[7]||(t[7]=n("span",{class:"exec-rpt-stat-label"},"累计通过步骤",-1)),n("span",Wt,d(N.value),1),t[8]||(t[8]=n("span",{class:"exec-rpt-stat-hint"},"Σ pass",-1))]),n("div",At,[t[9]||(t[9]=n("span",{class:"exec-rpt-stat-label"},"累计失败步骤",-1)),n("span",jt,d(H.value),1),t[10]||(t[10]=n("span",{class:"exec-rpt-stat-hint"},"Σ fail",-1))])]),n("div",Ut,[b(h(dt),{value:f.value,"onUpdate:value":t[0]||(t[0]=e=>f.value=e),placeholder:"搜索场景名、标题、创建者…",clearable:"",round:"",class:"exec-rpt-search",onKeyup:rt(B,["enter"])},{prefix:F(()=>[b(h(X),{component:h(ot),class:"exec-rpt-search-ico"},null,8,["component"])]),_:1},8,["value"]),b(h(nt),{value:m.value,"onUpdate:value":t[1]||(t[1]=e=>m.value=e),options:$,style:{width:"140px"},size:"medium"},null,8,["value"]),b(h(st),{quaternary:"",circle:"",onClick:B},{icon:F(()=>[b(h(X),{component:h(at)},null,8,["component"])]),_:1})]),b(h(de),{show:s.value,class:"exec-rpt-spin"},{default:F(()=>[!s.value&&c.value.length===0?(E(),T("div",Xt,[n("div",Yt,[b(h(X),{component:h(it),size:40,class:"exec-rpt-empty-ico"},null,8,["component"])]),t[11]||(t[11]=n("p",{class:"exec-rpt-empty-title"},"暂无执行记录",-1)),t[12]||(t[12]=n("p",{class:"exec-rpt-empty-desc"}," 在「自动化测试」中执行步骤或点击「批量运行」后，报告将自动出现在此处。 ",-1))])):(E(),T("div",Vt,[(E(!0),T(Q,null,ae(c.value,e=>{var u,v,x;return E(),T("article",{key:e.id,class:"exec-rpt-card",onClick:P=>U(e)},[n("div",Kt,[n("div",Gt,[n("span",{class:ie(["exec-rpt-pill",j(e.trigger_type)])},d(y(e.trigger_type)),3),n("h2",Jt,d(z(e)),1)]),n("p",Qt,[n("span",null,d(e.scenario_name||"—"),1),t[13]||(t[13]=n("span",{class:"dot"},"·",-1)),n("span",null,d(e.env_name||"默认环境"),1),t[14]||(t[14]=n("span",{class:"dot"},"·",-1)),n("span",null,d(e.created_at),1),t[15]||(t[15]=n("span",{class:"dot"},"·",-1)),n("span",null,d(e.creator||"—"),1)])]),n("div",Zt,[n("div",er,[t[16]||(t[16]=n("span",{class:"n"},"总",-1)),n("b",null,d(((u=e.summary)==null?void 0:u.total)??0),1)]),n("div",tr,[t[17]||(t[17]=n("span",{class:"n"},"过",-1)),n("b",null,d(((v=e.summary)==null?void 0:v.pass)??0),1)]),n("div",rr,[t[18]||(t[18]=n("span",{class:"n"},"败",-1)),n("b",null,d(((x=e.summary)==null?void 0:x.fail)??0),1)])]),b(h(X),{component:h(lt),class:"exec-rpt-chevron"},null,8,["component"])],8,qt)}),128))]))]),_:1},8,["show"])]),b(h(Tt),{show:D.value,"onUpdate:show":t[2]||(t[2]=e=>D.value=e),width:i.value,placement:"right",class:"exec-rpt-drawer"},{default:F(()=>[b(h(Nt),{title:I.value,closable:""},{default:F(()=>[b(h(de),{show:L.value},{default:F(()=>[k.value?(E(),T(Q,{key:0},[n("div",sr,[b(h(Y),{type:"success",size:"small",round:""},{default:F(()=>{var e;return[V("通过 "+d(((e=k.value.summary)==null?void 0:e.pass)??0),1)]}),_:1}),b(h(Y),{type:"error",size:"small",round:""},{default:F(()=>{var e;return[V("失败 "+d(((e=k.value.summary)==null?void 0:e.fail)??0),1)]}),_:1}),b(h(Y),{size:"small",round:""},{default:F(()=>{var e;return[V("共 "+d(((e=k.value.summary)==null?void 0:e.total)??0)+" 步",1)]}),_:1})]),b(h(ct),{style:{"max-height":"calc(100vh - 140px)"}},{default:F(()=>[(E(!0),T(Q,null,ae(k.value.entries||[],(e,u)=>(E(),T("div",{key:e.id||u,class:"exec-rpt-d-entry"},[n("div",or,[n("span",{class:ie(["exec-rpt-d-pass",e.pass?"ok":"bad"])},d(e.pass?"PASS":"FAIL"),3),n("strong",null,d(e.name),1),b(h(Y),{size:"tiny",round:""},{default:F(()=>[V(d(e.method),1)]),_:2},1024),e.statusCode!=null?(E(),T("span",nr,d(e.statusCode),1)):q("",!0),e.elapsedMs!=null?(E(),T("span",ar,d(Math.round(e.elapsedMs))+"ms",1)):q("",!0)]),n("div",ir,d(e.url),1),e.responseBodyText?(E(),T("pre",lr,d(O(e.responseBodyText,1500)),1)):e.error?(E(),T("div",dr,d(e.error),1)):q("",!0)]))),128))]),_:1})],64)):q("",!0)]),_:1},8,["show"])]),_:1},8,["title"])]),_:1},8,["show","width"])]))}});const Sr=ut(cr,[["__scopeId","data-v-4603d0f6"]]);export{Sr as default};
