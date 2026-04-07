import{d as ee,r as E,aA as ut,aB as vt,z as b,aC as ye,aD as gt,aE as Z,aF as ht,l as xt,R as mt,W as Le,aG as yt,x as Q,aH as Ct,a4 as St,T as Tt,aI as wt,aJ as Pt,aK as Rt,n as r,L as s,S as C,p as L,aq as zt,q as Lt,s as $e,aL as Ce,aM as ne,X as $t,B as oe,C as Bt,M as Wt,Y as M,aN as At,aO as Et,y as _t,A as Se,aP as ie,$ as K,aQ as kt,F as se,aR as j,aS as J,a6 as Mt,ak as jt,aT as Vt,aU as Ht}from"./index-c333c3f8.js";import{A as It}from"./Add-480b8172.js";const Ot=ye(".v-x-scroll",{overflow:"auto",scrollbarWidth:"none"},[ye("&::-webkit-scrollbar",{width:0,height:0})]),Ft=ee({name:"XScroll",props:{disabled:Boolean,onScroll:Function},setup(){const e=E(null);function n(l){!(l.currentTarget.offsetWidth<l.currentTarget.scrollWidth)||l.deltaY===0||(l.currentTarget.scrollLeft+=l.deltaY+l.deltaX,l.preventDefault())}const i=ut();return Ot.mount({id:"vueuc/x-scroll",head:!0,anchorMetaName:vt,ssr:i}),Object.assign({selfRef:e,handleWheel:n},{scrollTo(...l){var y;(y=e.value)===null||y===void 0||y.scrollTo(...l)}})},render(){return b("div",{ref:"selfRef",onScroll:this.onScroll,onWheel:this.disabled?void 0:this.handleWheel,class:"v-x-scroll"},this.$slots)}});var Gt=/\s/;function Dt(e){for(var n=e.length;n--&&Gt.test(e.charAt(n)););return n}var Nt=/^\s+/;function Xt(e){return e&&e.slice(0,Dt(e)+1).replace(Nt,"")}var Te=0/0,Ut=/^[-+]0x[0-9a-f]+$/i,Yt=/^0b[01]+$/i,qt=/^0o[0-7]+$/i,Kt=parseInt;function we(e){if(typeof e=="number")return e;if(gt(e))return Te;if(Z(e)){var n=typeof e.valueOf=="function"?e.valueOf():e;e=Z(n)?n+"":n}if(typeof e!="string")return e===0?e:+e;e=Xt(e);var i=Yt.test(e);return i||qt.test(e)?Kt(e.slice(2),i?2:8):Ut.test(e)?Te:+e}var Jt=function(){return ht.Date.now()};const le=Jt;var Qt="Expected a function",Zt=Math.max,ea=Math.min;function ta(e,n,i){var f,l,y,v,p,m,h=0,x=!1,$=!1,P=!0;if(typeof e!="function")throw new TypeError(Qt);n=we(n)||0,Z(i)&&(x=!!i.leading,$="maxWait"in i,y=$?Zt(we(i.maxWait)||0,n):y,P="trailing"in i?!!i.trailing:P);function g(c){var z=f,I=l;return f=l=void 0,h=c,v=e.apply(I,z),v}function w(c){return h=c,p=setTimeout(W,n),x?g(c):v}function S(c){var z=c-m,I=c-h,X=n-z;return $?ea(X,y-I):X}function R(c){var z=c-m,I=c-h;return m===void 0||z>=n||z<0||$&&I>=y}function W(){var c=le();if(R(c))return B(c);p=setTimeout(W,S(c))}function B(c){return p=void 0,P&&f?g(c):(f=l=void 0,v)}function H(){p!==void 0&&clearTimeout(p),h=0,f=m=l=p=void 0}function A(){return p===void 0?v:B(le())}function u(){var c=le(),z=R(c);if(f=arguments,l=this,m=c,z){if(p===void 0)return w(m);if($)return clearTimeout(p),p=setTimeout(W,n),g(m)}return p===void 0&&(p=setTimeout(W,n)),v}return u.cancel=H,u.flush=A,u}var aa="Expected a function";function ra(e,n,i){var f=!0,l=!0;if(typeof e!="function")throw new TypeError(aa);return Z(i)&&(f="leading"in i?!!i.leading:f,l="trailing"in i?!!i.trailing:l),ta(e,n,{leading:f,maxWait:n,trailing:l})}const na={tabFontSizeSmall:"14px",tabFontSizeMedium:"14px",tabFontSizeLarge:"16px",tabGapSmallLine:"36px",tabGapMediumLine:"36px",tabGapLargeLine:"36px",tabGapSmallLineVertical:"8px",tabGapMediumLineVertical:"8px",tabGapLargeLineVertical:"8px",tabPaddingSmallLine:"6px 0",tabPaddingMediumLine:"10px 0",tabPaddingLargeLine:"14px 0",tabPaddingVerticalSmallLine:"6px 12px",tabPaddingVerticalMediumLine:"8px 16px",tabPaddingVerticalLargeLine:"10px 20px",tabGapSmallBar:"36px",tabGapMediumBar:"36px",tabGapLargeBar:"36px",tabGapSmallBarVertical:"8px",tabGapMediumBarVertical:"8px",tabGapLargeBarVertical:"8px",tabPaddingSmallBar:"4px 0",tabPaddingMediumBar:"6px 0",tabPaddingLargeBar:"10px 0",tabPaddingVerticalSmallBar:"6px 12px",tabPaddingVerticalMediumBar:"8px 16px",tabPaddingVerticalLargeBar:"10px 20px",tabGapSmallCard:"4px",tabGapMediumCard:"4px",tabGapLargeCard:"4px",tabGapSmallCardVertical:"4px",tabGapMediumCardVertical:"4px",tabGapLargeCardVertical:"4px",tabPaddingSmallCard:"8px 16px",tabPaddingMediumCard:"10px 20px",tabPaddingLargeCard:"12px 24px",tabPaddingSmallSegment:"4px 0",tabPaddingMediumSegment:"6px 0",tabPaddingLargeSegment:"8px 0",tabPaddingVerticalLargeSegment:"0 8px",tabPaddingVerticalSmallCard:"8px 12px",tabPaddingVerticalMediumCard:"10px 16px",tabPaddingVerticalLargeCard:"12px 20px",tabPaddingVerticalSmallSegment:"0 4px",tabPaddingVerticalMediumSegment:"0 6px",tabGapSmallSegment:"0",tabGapMediumSegment:"0",tabGapLargeSegment:"0",tabGapSmallSegmentVertical:"0",tabGapMediumSegmentVertical:"0",tabGapLargeSegmentVertical:"0",panePaddingSmall:"8px 0 0 0",panePaddingMedium:"12px 0 0 0",panePaddingLarge:"16px 0 0 0",closeSize:"18px",closeIconSize:"14px"};function oa(e){const{textColor2:n,primaryColor:i,textColorDisabled:f,closeIconColor:l,closeIconColorHover:y,closeIconColorPressed:v,closeColorHover:p,closeColorPressed:m,tabColor:h,baseColor:x,dividerColor:$,fontWeight:P,textColor1:g,borderRadius:w,fontSize:S,fontWeightStrong:R}=e;return Object.assign(Object.assign({},na),{colorSegment:h,tabFontSizeCard:S,tabTextColorLine:g,tabTextColorActiveLine:i,tabTextColorHoverLine:i,tabTextColorDisabledLine:f,tabTextColorSegment:g,tabTextColorActiveSegment:n,tabTextColorHoverSegment:n,tabTextColorDisabledSegment:f,tabTextColorBar:g,tabTextColorActiveBar:i,tabTextColorHoverBar:i,tabTextColorDisabledBar:f,tabTextColorCard:g,tabTextColorHoverCard:g,tabTextColorActiveCard:i,tabTextColorDisabledCard:f,barColor:i,closeIconColor:l,closeIconColorHover:y,closeIconColorPressed:v,closeColorHover:p,closeColorPressed:m,closeBorderRadius:w,tabColor:h,tabColorSegment:x,tabBorderColor:$,tabFontWeightActive:P,tabFontWeight:P,tabBorderRadius:w,paneTextColor:n,fontWeightStrong:R})}const ia={name:"Tabs",common:xt,self:oa},sa=ia,fe=mt("n-tabs"),Be={tab:[String,Number,Object,Function],name:{type:[String,Number],required:!0},disabled:Boolean,displayDirective:{type:String,default:"if"},closable:{type:Boolean,default:void 0},tabProps:Object,label:[String,Number,Object,Function]},pa=ee({__TAB_PANE__:!0,name:"TabPane",alias:["TabPanel"],props:Be,slots:Object,setup(e){const n=Le(fe,null);return n||yt("tab-pane","`n-tab-pane` must be placed inside `n-tabs`."),{style:n.paneStyleRef,class:n.paneClassRef,mergedClsPrefix:n.mergedClsPrefixRef}},render(){return b("div",{class:[`${this.mergedClsPrefix}-tab-pane`,this.class],style:this.style},this.$slots)}}),la=Object.assign({internalLeftPadded:Boolean,internalAddable:Boolean,internalCreatedByPane:Boolean},Rt(Be,["displayDirective"])),ce=ee({__TAB__:!0,inheritAttrs:!1,name:"Tab",props:la,setup(e){const{mergedClsPrefixRef:n,valueRef:i,typeRef:f,closableRef:l,tabStyleRef:y,addTabStyleRef:v,tabClassRef:p,addTabClassRef:m,tabChangeIdRef:h,onBeforeLeaveRef:x,triggerRef:$,handleAdd:P,activateTab:g,handleClose:w}=Le(fe);return{trigger:$,mergedClosable:Q(()=>{if(e.internalAddable)return!1;const{closable:S}=e;return S===void 0?l.value:S}),style:y,addStyle:v,tabClass:p,addTabClass:m,clsPrefix:n,value:i,type:f,handleClose(S){S.stopPropagation(),!e.disabled&&w(e.name)},activateTab(){if(e.disabled)return;if(e.internalAddable){P();return}const{name:S}=e,R=++h.id;if(S!==i.value){const{value:W}=x;W?Promise.resolve(W(e.name,i.value)).then(B=>{B&&h.id===R&&g(S)}):g(S)}}}},render(){const{internalAddable:e,clsPrefix:n,name:i,disabled:f,label:l,tab:y,value:v,mergedClosable:p,trigger:m,$slots:{default:h}}=this,x=l??y;return b("div",{class:`${n}-tabs-tab-wrapper`},this.internalLeftPadded?b("div",{class:`${n}-tabs-tab-pad`}):null,b("div",Object.assign({key:i,"data-name":i,"data-disabled":f?!0:void 0},Ct({class:[`${n}-tabs-tab`,v===i&&`${n}-tabs-tab--active`,f&&`${n}-tabs-tab--disabled`,p&&`${n}-tabs-tab--closable`,e&&`${n}-tabs-tab--addable`,e?this.addTabClass:this.tabClass],onClick:m==="click"?this.activateTab:void 0,onMouseenter:m==="hover"?this.activateTab:void 0,style:e?this.addStyle:this.style},this.internalCreatedByPane?this.tabProps||{}:this.$attrs)),b("span",{class:`${n}-tabs-tab__label`},e?b(St,null,b("div",{class:`${n}-tabs-tab__height-placeholder`}," "),b(Tt,{clsPrefix:n},{default:()=>b(It,null)})):h?h():typeof x=="object"?x:wt(x??i)),p&&this.type==="card"?b(Pt,{clsPrefix:n,class:`${n}-tabs-tab__close`,onClick:this.handleClose,disabled:f}):null))}}),da=r("tabs",`
 box-sizing: border-box;
 width: 100%;
 display: flex;
 flex-direction: column;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
`,[s("segment-type",[r("tabs-rail",[C("&.transition-disabled",[r("tabs-capsule",`
 transition: none;
 `)])])]),s("top",[r("tab-pane",`
 padding: var(--n-pane-padding-top) var(--n-pane-padding-right) var(--n-pane-padding-bottom) var(--n-pane-padding-left);
 `)]),s("left",[r("tab-pane",`
 padding: var(--n-pane-padding-right) var(--n-pane-padding-bottom) var(--n-pane-padding-left) var(--n-pane-padding-top);
 `)]),s("left, right",`
 flex-direction: row;
 `,[r("tabs-bar",`
 width: 2px;
 right: 0;
 transition:
 top .2s var(--n-bezier),
 max-height .2s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `),r("tabs-tab",`
 padding: var(--n-tab-padding-vertical); 
 `)]),s("right",`
 flex-direction: row-reverse;
 `,[r("tab-pane",`
 padding: var(--n-pane-padding-left) var(--n-pane-padding-top) var(--n-pane-padding-right) var(--n-pane-padding-bottom);
 `),r("tabs-bar",`
 left: 0;
 `)]),s("bottom",`
 flex-direction: column-reverse;
 justify-content: flex-end;
 `,[r("tab-pane",`
 padding: var(--n-pane-padding-bottom) var(--n-pane-padding-right) var(--n-pane-padding-top) var(--n-pane-padding-left);
 `),r("tabs-bar",`
 top: 0;
 `)]),r("tabs-rail",`
 position: relative;
 padding: 3px;
 border-radius: var(--n-tab-border-radius);
 width: 100%;
 background-color: var(--n-color-segment);
 transition: background-color .3s var(--n-bezier);
 display: flex;
 align-items: center;
 `,[r("tabs-capsule",`
 border-radius: var(--n-tab-border-radius);
 position: absolute;
 pointer-events: none;
 background-color: var(--n-tab-color-segment);
 box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .08);
 transition: transform 0.3s var(--n-bezier);
 `),r("tabs-tab-wrapper",`
 flex-basis: 0;
 flex-grow: 1;
 display: flex;
 align-items: center;
 justify-content: center;
 `,[r("tabs-tab",`
 overflow: hidden;
 border-radius: var(--n-tab-border-radius);
 width: 100%;
 display: flex;
 align-items: center;
 justify-content: center;
 `,[s("active",`
 font-weight: var(--n-font-weight-strong);
 color: var(--n-tab-text-color-active);
 `),C("&:hover",`
 color: var(--n-tab-text-color-hover);
 `)])])]),s("flex",[r("tabs-nav",`
 width: 100%;
 position: relative;
 `,[r("tabs-wrapper",`
 width: 100%;
 `,[r("tabs-tab",`
 margin-right: 0;
 `)])])]),r("tabs-nav",`
 box-sizing: border-box;
 line-height: 1.5;
 display: flex;
 transition: border-color .3s var(--n-bezier);
 `,[L("prefix, suffix",`
 display: flex;
 align-items: center;
 `),L("prefix","padding-right: 16px;"),L("suffix","padding-left: 16px;")]),s("top, bottom",[C(">",[r("tabs-nav",[r("tabs-nav-scroll-wrapper",[C("&::before",`
 top: 0;
 bottom: 0;
 left: 0;
 width: 20px;
 `),C("&::after",`
 top: 0;
 bottom: 0;
 right: 0;
 width: 20px;
 `),s("shadow-start",[C("&::before",`
 box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, .12);
 `)]),s("shadow-end",[C("&::after",`
 box-shadow: inset -10px 0 8px -8px rgba(0, 0, 0, .12);
 `)])])])])]),s("left, right",[r("tabs-nav-scroll-content",`
 flex-direction: column;
 `),C(">",[r("tabs-nav",[r("tabs-nav-scroll-wrapper",[C("&::before",`
 top: 0;
 left: 0;
 right: 0;
 height: 20px;
 `),C("&::after",`
 bottom: 0;
 left: 0;
 right: 0;
 height: 20px;
 `),s("shadow-start",[C("&::before",`
 box-shadow: inset 0 10px 8px -8px rgba(0, 0, 0, .12);
 `)]),s("shadow-end",[C("&::after",`
 box-shadow: inset 0 -10px 8px -8px rgba(0, 0, 0, .12);
 `)])])])])]),r("tabs-nav-scroll-wrapper",`
 flex: 1;
 position: relative;
 overflow: hidden;
 `,[r("tabs-nav-y-scroll",`
 height: 100%;
 width: 100%;
 overflow-y: auto; 
 scrollbar-width: none;
 `,[C("&::-webkit-scrollbar, &::-webkit-scrollbar-track-piece, &::-webkit-scrollbar-thumb",`
 width: 0;
 height: 0;
 display: none;
 `)]),C("&::before, &::after",`
 transition: box-shadow .3s var(--n-bezier);
 pointer-events: none;
 content: "";
 position: absolute;
 z-index: 1;
 `)]),r("tabs-nav-scroll-content",`
 display: flex;
 position: relative;
 min-width: 100%;
 min-height: 100%;
 width: fit-content;
 box-sizing: border-box;
 `),r("tabs-wrapper",`
 display: inline-flex;
 flex-wrap: nowrap;
 position: relative;
 `),r("tabs-tab-wrapper",`
 display: flex;
 flex-wrap: nowrap;
 flex-shrink: 0;
 flex-grow: 0;
 `),r("tabs-tab",`
 cursor: pointer;
 white-space: nowrap;
 flex-wrap: nowrap;
 display: inline-flex;
 align-items: center;
 color: var(--n-tab-text-color);
 font-size: var(--n-tab-font-size);
 background-clip: padding-box;
 padding: var(--n-tab-padding);
 transition:
 box-shadow .3s var(--n-bezier),
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[s("disabled",{cursor:"not-allowed"}),L("close",`
 margin-left: 6px;
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),L("label",`
 display: flex;
 align-items: center;
 z-index: 1;
 `)]),r("tabs-bar",`
 position: absolute;
 bottom: 0;
 height: 2px;
 border-radius: 1px;
 background-color: var(--n-bar-color);
 transition:
 left .2s var(--n-bezier),
 max-width .2s var(--n-bezier),
 opacity .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `,[C("&.transition-disabled",`
 transition: none;
 `),s("disabled",`
 background-color: var(--n-tab-text-color-disabled)
 `)]),r("tabs-pane-wrapper",`
 position: relative;
 overflow: hidden;
 transition: max-height .2s var(--n-bezier);
 `),r("tab-pane",`
 color: var(--n-pane-text-color);
 width: 100%;
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 opacity .2s var(--n-bezier);
 left: 0;
 right: 0;
 top: 0;
 `,[C("&.next-transition-leave-active, &.prev-transition-leave-active, &.next-transition-enter-active, &.prev-transition-enter-active",`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 transform .2s var(--n-bezier),
 opacity .2s var(--n-bezier);
 `),C("&.next-transition-leave-active, &.prev-transition-leave-active",`
 position: absolute;
 `),C("&.next-transition-enter-from, &.prev-transition-leave-to",`
 transform: translateX(32px);
 opacity: 0;
 `),C("&.next-transition-leave-to, &.prev-transition-enter-from",`
 transform: translateX(-32px);
 opacity: 0;
 `),C("&.next-transition-leave-from, &.next-transition-enter-to, &.prev-transition-leave-from, &.prev-transition-enter-to",`
 transform: translateX(0);
 opacity: 1;
 `)]),r("tabs-tab-pad",`
 box-sizing: border-box;
 width: var(--n-tab-gap);
 flex-grow: 0;
 flex-shrink: 0;
 `),s("line-type, bar-type",[r("tabs-tab",`
 font-weight: var(--n-tab-font-weight);
 box-sizing: border-box;
 vertical-align: bottom;
 `,[C("&:hover",{color:"var(--n-tab-text-color-hover)"}),s("active",`
 color: var(--n-tab-text-color-active);
 font-weight: var(--n-tab-font-weight-active);
 `),s("disabled",{color:"var(--n-tab-text-color-disabled)"})])]),r("tabs-nav",[s("line-type",[s("top",[L("prefix, suffix",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 bottom: -1px;
 `)]),s("left",[L("prefix, suffix",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 right: -1px;
 `)]),s("right",[L("prefix, suffix",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 left: -1px;
 `)]),s("bottom",[L("prefix, suffix",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-nav-scroll-content",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-bar",`
 top: -1px;
 `)]),L("prefix, suffix",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-nav-scroll-content",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-bar",`
 border-radius: 0;
 `)]),s("card-type",[L("prefix, suffix",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-pad",`
 flex-grow: 1;
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-tab-pad",`
 transition: border-color .3s var(--n-bezier);
 `),r("tabs-tab",`
 font-weight: var(--n-tab-font-weight);
 border: 1px solid var(--n-tab-border-color);
 background-color: var(--n-tab-color);
 box-sizing: border-box;
 position: relative;
 vertical-align: bottom;
 display: flex;
 justify-content: space-between;
 font-size: var(--n-tab-font-size);
 color: var(--n-tab-text-color);
 `,[s("addable",`
 padding-left: 8px;
 padding-right: 8px;
 font-size: 16px;
 justify-content: center;
 `,[L("height-placeholder",`
 width: 0;
 font-size: var(--n-tab-font-size);
 `),zt("disabled",[C("&:hover",`
 color: var(--n-tab-text-color-hover);
 `)])]),s("closable","padding-right: 8px;"),s("active",`
 background-color: #0000;
 font-weight: var(--n-tab-font-weight-active);
 color: var(--n-tab-text-color-active);
 `),s("disabled","color: var(--n-tab-text-color-disabled);")])]),s("left, right",`
 flex-direction: column; 
 `,[L("prefix, suffix",`
 padding: var(--n-tab-padding-vertical);
 `),r("tabs-wrapper",`
 flex-direction: column;
 `),r("tabs-tab-wrapper",`
 flex-direction: column;
 `,[r("tabs-tab-pad",`
 height: var(--n-tab-gap-vertical);
 width: 100%;
 `)])]),s("top",[s("card-type",[r("tabs-scroll-padding","border-bottom: 1px solid var(--n-tab-border-color);"),L("prefix, suffix",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-top-left-radius: var(--n-tab-border-radius);
 border-top-right-radius: var(--n-tab-border-radius);
 `,[s("active",`
 border-bottom: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-bottom: 1px solid var(--n-tab-border-color);
 `)])]),s("left",[s("card-type",[r("tabs-scroll-padding","border-right: 1px solid var(--n-tab-border-color);"),L("prefix, suffix",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-top-left-radius: var(--n-tab-border-radius);
 border-bottom-left-radius: var(--n-tab-border-radius);
 `,[s("active",`
 border-right: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-right: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-right: 1px solid var(--n-tab-border-color);
 `)])]),s("right",[s("card-type",[r("tabs-scroll-padding","border-left: 1px solid var(--n-tab-border-color);"),L("prefix, suffix",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-top-right-radius: var(--n-tab-border-radius);
 border-bottom-right-radius: var(--n-tab-border-radius);
 `,[s("active",`
 border-left: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-left: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-left: 1px solid var(--n-tab-border-color);
 `)])]),s("bottom",[s("card-type",[r("tabs-scroll-padding","border-top: 1px solid var(--n-tab-border-color);"),L("prefix, suffix",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-tab",`
 border-bottom-left-radius: var(--n-tab-border-radius);
 border-bottom-right-radius: var(--n-tab-border-radius);
 `,[s("active",`
 border-top: 1px solid #0000;
 `)]),r("tabs-tab-pad",`
 border-top: 1px solid var(--n-tab-border-color);
 `),r("tabs-pad",`
 border-top: 1px solid var(--n-tab-border-color);
 `)])])])]),de=ra,ba=Object.assign(Object.assign({},$e.props),{value:[String,Number],defaultValue:[String,Number],trigger:{type:String,default:"click"},type:{type:String,default:"bar"},closable:Boolean,justifyContent:String,size:{type:String,default:"medium"},placement:{type:String,default:"top"},tabStyle:[String,Object],tabClass:String,addTabStyle:[String,Object],addTabClass:String,barWidth:Number,paneClass:String,paneStyle:[String,Object],paneWrapperClass:String,paneWrapperStyle:[String,Object],addable:[Boolean,Object],tabsPadding:{type:Number,default:0},animated:Boolean,onBeforeLeave:Function,onAdd:Function,"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],onClose:[Function,Array],labelSize:String,activeName:[String,Number],onActiveNameChange:[Function,Array]}),ua=ee({name:"Tabs",props:ba,slots:Object,setup(e,{slots:n}){var i,f,l,y;const{mergedClsPrefixRef:v,inlineThemeDisabled:p}=Lt(e),m=$e("Tabs","-tabs",da,sa,e,v),h=E(null),x=E(null),$=E(null),P=E(null),g=E(null),w=E(null),S=E(!0),R=E(!0),W=Ce(e,["labelSize","size"]),B=Ce(e,["activeName","value"]),H=E((f=(i=B.value)!==null&&i!==void 0?i:e.defaultValue)!==null&&f!==void 0?f:n.default?(y=(l=ne(n.default())[0])===null||l===void 0?void 0:l.props)===null||y===void 0?void 0:y.name:null),A=$t(B,H),u={id:0},c=Q(()=>{if(!(!e.justifyContent||e.type==="card"))return{display:"flex",justifyContent:e.justifyContent}});oe(A,()=>{u.id=0,U(),ue()});function z(){var t;const{value:a}=A;return a===null?null:(t=h.value)===null||t===void 0?void 0:t.querySelector(`[data-name="${a}"]`)}function I(t){if(e.type==="card")return;const{value:a}=x;if(!a)return;const o=a.style.opacity==="0";if(t){const d=`${v.value}-tabs-bar--disabled`,{barWidth:T,placement:_}=e;if(t.dataset.disabled==="true"?a.classList.add(d):a.classList.remove(d),["top","bottom"].includes(_)){if(pe(["top","maxHeight","height"]),typeof T=="number"&&t.offsetWidth>=T){const k=Math.floor((t.offsetWidth-T)/2)+t.offsetLeft;a.style.left=`${k}px`,a.style.maxWidth=`${T}px`}else a.style.left=`${t.offsetLeft}px`,a.style.maxWidth=`${t.offsetWidth}px`;a.style.width="8192px",o&&(a.style.transition="none"),a.offsetWidth,o&&(a.style.transition="",a.style.opacity="1")}else{if(pe(["left","maxWidth","width"]),typeof T=="number"&&t.offsetHeight>=T){const k=Math.floor((t.offsetHeight-T)/2)+t.offsetTop;a.style.top=`${k}px`,a.style.maxHeight=`${T}px`}else a.style.top=`${t.offsetTop}px`,a.style.maxHeight=`${t.offsetHeight}px`;a.style.height="8192px",o&&(a.style.transition="none"),a.offsetHeight,o&&(a.style.transition="",a.style.opacity="1")}}}function X(){if(e.type==="card")return;const{value:t}=x;t&&(t.style.opacity="0")}function pe(t){const{value:a}=x;if(a)for(const o of t)a.style[o]=""}function U(){if(e.type==="card")return;const t=z();t?I(t):X()}function ue(){var t;const a=(t=g.value)===null||t===void 0?void 0:t.$el;if(!a)return;const o=z();if(!o)return;const{scrollLeft:d,offsetWidth:T}=a,{offsetLeft:_,offsetWidth:k}=o;d>_?a.scrollTo({top:0,left:_,behavior:"smooth"}):_+k>d+T&&a.scrollTo({top:0,left:_+k-T,behavior:"smooth"})}const Y=E(null);let te=0,V=null;function We(t){const a=Y.value;if(a){te=t.getBoundingClientRect().height;const o=`${te}px`,d=()=>{a.style.height=o,a.style.maxHeight=o};V?(d(),V(),V=null):V=d}}function Ae(t){const a=Y.value;if(a){const o=t.getBoundingClientRect().height,d=()=>{document.body.offsetHeight,a.style.maxHeight=`${o}px`,a.style.height=`${Math.max(te,o)}px`};V?(V(),V=null,d()):V=d}}function Ee(){const t=Y.value;if(t){t.style.maxHeight="",t.style.height="";const{paneWrapperStyle:a}=e;if(typeof a=="string")t.style.cssText=a;else if(a){const{maxHeight:o,height:d}=a;o!==void 0&&(t.style.maxHeight=o),d!==void 0&&(t.style.height=d)}}}const ve={value:[]},ge=E("next");function _e(t){const a=A.value;let o="next";for(const d of ve.value){if(d===a)break;if(d===t){o="prev";break}}ge.value=o,ke(t)}function ke(t){const{onActiveNameChange:a,onUpdateValue:o,"onUpdate:value":d}=e;a&&K(a,t),o&&K(o,t),d&&K(d,t),H.value=t}function Me(t){const{onClose:a}=e;a&&K(a,t)}function he(){const{value:t}=x;if(!t)return;const a="transition-disabled";t.classList.add(a),U(),t.classList.remove(a)}const O=E(null);function ae({transitionDisabled:t}){const a=h.value;if(!a)return;t&&a.classList.add("transition-disabled");const o=z();o&&O.value&&(O.value.style.width=`${o.offsetWidth}px`,O.value.style.height=`${o.offsetHeight}px`,O.value.style.transform=`translateX(${o.offsetLeft-kt(getComputedStyle(a).paddingLeft)}px)`,t&&O.value.offsetWidth),t&&a.classList.remove("transition-disabled")}oe([A],()=>{e.type==="segment"&&se(()=>{ae({transitionDisabled:!1})})}),Bt(()=>{e.type==="segment"&&ae({transitionDisabled:!0})});let xe=0;function je(t){var a;if(t.contentRect.width===0&&t.contentRect.height===0||xe===t.contentRect.width)return;xe=t.contentRect.width;const{type:o}=e;if((o==="line"||o==="bar")&&he(),o!=="segment"){const{placement:d}=e;re((d==="top"||d==="bottom"?(a=g.value)===null||a===void 0?void 0:a.$el:w.value)||null)}}const Ve=de(je,64);oe([()=>e.justifyContent,()=>e.size],()=>{se(()=>{const{type:t}=e;(t==="line"||t==="bar")&&he()})});const F=E(!1);function He(t){var a;const{target:o,contentRect:{width:d,height:T}}=t,_=o.parentElement.parentElement.offsetWidth,k=o.parentElement.parentElement.offsetHeight,{placement:D}=e;if(!F.value)D==="top"||D==="bottom"?_<d&&(F.value=!0):k<T&&(F.value=!0);else{const{value:N}=P;if(!N)return;D==="top"||D==="bottom"?_-d>N.$el.offsetWidth&&(F.value=!1):k-T>N.$el.offsetHeight&&(F.value=!1)}re(((a=g.value)===null||a===void 0?void 0:a.$el)||null)}const Ie=de(He,64);function Oe(){const{onAdd:t}=e;t&&t(),se(()=>{const a=z(),{value:o}=g;!a||!o||o.scrollTo({left:a.offsetLeft,top:0,behavior:"smooth"})})}function re(t){if(!t)return;const{placement:a}=e;if(a==="top"||a==="bottom"){const{scrollLeft:o,scrollWidth:d,offsetWidth:T}=t;S.value=o<=0,R.value=o+T>=d}else{const{scrollTop:o,scrollHeight:d,offsetHeight:T}=t;S.value=o<=0,R.value=o+T>=d}}const Fe=de(t=>{re(t.target)},64);Wt(fe,{triggerRef:M(e,"trigger"),tabStyleRef:M(e,"tabStyle"),tabClassRef:M(e,"tabClass"),addTabStyleRef:M(e,"addTabStyle"),addTabClassRef:M(e,"addTabClass"),paneClassRef:M(e,"paneClass"),paneStyleRef:M(e,"paneStyle"),mergedClsPrefixRef:v,typeRef:M(e,"type"),closableRef:M(e,"closable"),valueRef:A,tabChangeIdRef:u,onBeforeLeaveRef:M(e,"onBeforeLeave"),activateTab:_e,handleClose:Me,handleAdd:Oe}),At(()=>{U(),ue()}),Et(()=>{const{value:t}=$;if(!t)return;const{value:a}=v,o=`${a}-tabs-nav-scroll-wrapper--shadow-start`,d=`${a}-tabs-nav-scroll-wrapper--shadow-end`;S.value?t.classList.remove(o):t.classList.add(o),R.value?t.classList.remove(d):t.classList.add(d)});const Ge={syncBarPosition:()=>{U()}},De=()=>{ae({transitionDisabled:!0})},me=Q(()=>{const{value:t}=W,{type:a}=e,o={card:"Card",bar:"Bar",line:"Line",segment:"Segment"}[a],d=`${t}${o}`,{self:{barColor:T,closeIconColor:_,closeIconColorHover:k,closeIconColorPressed:D,tabColor:N,tabBorderColor:Ne,paneTextColor:Xe,tabFontWeight:Ue,tabBorderRadius:Ye,tabFontWeightActive:qe,colorSegment:Ke,fontWeightStrong:Je,tabColorSegment:Qe,closeSize:Ze,closeIconSize:et,closeColorHover:tt,closeColorPressed:at,closeBorderRadius:rt,[j("panePadding",t)]:q,[j("tabPadding",d)]:nt,[j("tabPaddingVertical",d)]:ot,[j("tabGap",d)]:it,[j("tabGap",`${d}Vertical`)]:st,[j("tabTextColor",a)]:lt,[j("tabTextColorActive",a)]:dt,[j("tabTextColorHover",a)]:bt,[j("tabTextColorDisabled",a)]:ct,[j("tabFontSize",t)]:ft},common:{cubicBezierEaseInOut:pt}}=m.value;return{"--n-bezier":pt,"--n-color-segment":Ke,"--n-bar-color":T,"--n-tab-font-size":ft,"--n-tab-text-color":lt,"--n-tab-text-color-active":dt,"--n-tab-text-color-disabled":ct,"--n-tab-text-color-hover":bt,"--n-pane-text-color":Xe,"--n-tab-border-color":Ne,"--n-tab-border-radius":Ye,"--n-close-size":Ze,"--n-close-icon-size":et,"--n-close-color-hover":tt,"--n-close-color-pressed":at,"--n-close-border-radius":rt,"--n-close-icon-color":_,"--n-close-icon-color-hover":k,"--n-close-icon-color-pressed":D,"--n-tab-color":N,"--n-tab-font-weight":Ue,"--n-tab-font-weight-active":qe,"--n-tab-padding":nt,"--n-tab-padding-vertical":ot,"--n-tab-gap":it,"--n-tab-gap-vertical":st,"--n-pane-padding-left":J(q,"left"),"--n-pane-padding-right":J(q,"right"),"--n-pane-padding-top":J(q,"top"),"--n-pane-padding-bottom":J(q,"bottom"),"--n-font-weight-strong":Je,"--n-tab-color-segment":Qe}}),G=p?_t("tabs",Q(()=>`${W.value[0]}${e.type[0]}`),me,e):void 0;return Object.assign({mergedClsPrefix:v,mergedValue:A,renderedNames:new Set,segmentCapsuleElRef:O,tabsPaneWrapperRef:Y,tabsElRef:h,barElRef:x,addTabInstRef:P,xScrollInstRef:g,scrollWrapperElRef:$,addTabFixed:F,tabWrapperStyle:c,handleNavResize:Ve,mergedSize:W,handleScroll:Fe,handleTabsResize:Ie,cssVars:p?void 0:me,themeClass:G==null?void 0:G.themeClass,animationDirection:ge,renderNameListRef:ve,yScrollElRef:w,handleSegmentResize:De,onAnimationBeforeLeave:We,onAnimationEnter:Ae,onAnimationAfterEnter:Ee,onRender:G==null?void 0:G.onRender},Ge)},render(){const{mergedClsPrefix:e,type:n,placement:i,addTabFixed:f,addable:l,mergedSize:y,renderNameListRef:v,onRender:p,paneWrapperClass:m,paneWrapperStyle:h,$slots:{default:x,prefix:$,suffix:P}}=this;p==null||p();const g=x?ne(x()).filter(u=>u.type.__TAB_PANE__===!0):[],w=x?ne(x()).filter(u=>u.type.__TAB__===!0):[],S=!w.length,R=n==="card",W=n==="segment",B=!R&&!W&&this.justifyContent;v.value=[];const H=()=>{const u=b("div",{style:this.tabWrapperStyle,class:`${e}-tabs-wrapper`},B?null:b("div",{class:`${e}-tabs-scroll-padding`,style:i==="top"||i==="bottom"?{width:`${this.tabsPadding}px`}:{height:`${this.tabsPadding}px`}}),S?g.map((c,z)=>(v.value.push(c.props.name),be(b(ce,Object.assign({},c.props,{internalCreatedByPane:!0,internalLeftPadded:z!==0&&(!B||B==="center"||B==="start"||B==="end")}),c.children?{default:c.children.tab}:void 0)))):w.map((c,z)=>(v.value.push(c.props.name),be(z!==0&&!B?ze(c):c))),!f&&l&&R?Re(l,(S?g.length:w.length)!==0):null,B?null:b("div",{class:`${e}-tabs-scroll-padding`,style:{width:`${this.tabsPadding}px`}}));return b("div",{ref:"tabsElRef",class:`${e}-tabs-nav-scroll-content`},R&&l?b(ie,{onResize:this.handleTabsResize},{default:()=>u}):u,R?b("div",{class:`${e}-tabs-pad`}):null,R?null:b("div",{ref:"barElRef",class:`${e}-tabs-bar`}))},A=W?"top":i;return b("div",{class:[`${e}-tabs`,this.themeClass,`${e}-tabs--${n}-type`,`${e}-tabs--${y}-size`,B&&`${e}-tabs--flex`,`${e}-tabs--${A}`],style:this.cssVars},b("div",{class:[`${e}-tabs-nav--${n}-type`,`${e}-tabs-nav--${A}`,`${e}-tabs-nav`]},Se($,u=>u&&b("div",{class:`${e}-tabs-nav__prefix`},u)),W?b(ie,{onResize:this.handleSegmentResize},{default:()=>b("div",{class:`${e}-tabs-rail`,ref:"tabsElRef"},b("div",{class:`${e}-tabs-capsule`,ref:"segmentCapsuleElRef"},b("div",{class:`${e}-tabs-wrapper`},b("div",{class:`${e}-tabs-tab`}))),S?g.map((u,c)=>(v.value.push(u.props.name),b(ce,Object.assign({},u.props,{internalCreatedByPane:!0,internalLeftPadded:c!==0}),u.children?{default:u.children.tab}:void 0))):w.map((u,c)=>(v.value.push(u.props.name),c===0?u:ze(u))))}):b(ie,{onResize:this.handleNavResize},{default:()=>b("div",{class:`${e}-tabs-nav-scroll-wrapper`,ref:"scrollWrapperElRef"},["top","bottom"].includes(A)?b(Ft,{ref:"xScrollInstRef",onScroll:this.handleScroll},{default:H}):b("div",{class:`${e}-tabs-nav-y-scroll`,onScroll:this.handleScroll,ref:"yScrollElRef"},H()))}),f&&l&&R?Re(l,!0):null,Se(P,u=>u&&b("div",{class:`${e}-tabs-nav__suffix`},u))),S&&(this.animated&&(A==="top"||A==="bottom")?b("div",{ref:"tabsPaneWrapperRef",style:h,class:[`${e}-tabs-pane-wrapper`,m]},Pe(g,this.mergedValue,this.renderedNames,this.onAnimationBeforeLeave,this.onAnimationEnter,this.onAnimationAfterEnter,this.animationDirection)):Pe(g,this.mergedValue,this.renderedNames)))}});function Pe(e,n,i,f,l,y,v){const p=[];return e.forEach(m=>{const{name:h,displayDirective:x,"display-directive":$}=m.props,P=w=>x===w||$===w,g=n===h;if(m.key!==void 0&&(m.key=h),g||P("show")||P("show:lazy")&&i.has(h)){i.has(h)||i.add(h);const w=!P("if");p.push(w?Mt(m,[[jt,g]]):m)}}),v?b(Vt,{name:`${v}-transition`,onBeforeLeave:f,onEnter:l,onAfterEnter:y},{default:()=>p}):p}function Re(e,n){return b(ce,{ref:"addTabInstRef",key:"__addable",name:"__addable",internalCreatedByPane:!0,internalAddable:!0,internalLeftPadded:n,disabled:typeof e=="object"&&e.disabled})}function ze(e){const n=Ht(e);return n.props?n.props.internalLeftPadded=!0:n.props={internalLeftPadded:!0},n}function be(e){return Array.isArray(e.dynamicProps)?e.dynamicProps.includes("internalLeftPadded")||e.dynamicProps.push("internalLeftPadded"):e.dynamicProps=["internalLeftPadded"],e}export{ua as N,ce as a,pa as b};
