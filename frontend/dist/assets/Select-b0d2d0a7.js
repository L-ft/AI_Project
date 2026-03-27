import{C as en,bO as qe,B as pe,am as gn,d as be,z as a,I as nn,l as tn,a8 as Xn,L as pn,bi as Fe,bP as on,ar as Ge,a3 as Yn,aD as bn,n as R,p as $,Z as G,G as te,_ as Ye,ax as mn,s as Oe,q as ln,v as wn,M as j,r as M,x as I,S as an,y as rn,A as sn,aj as Zn,al as et,a1 as nt,bv as tt,E as xn,ab as ot,a5 as ge,bm as Ie,P as Be,bQ as it,J as lt,b8 as Se,a0 as rt,bR as at,F as Je,bS as dn,X as st,a2 as dt,$ as un,bk as ut,aE as ct,bJ as ht,a4 as Ze,bT as ft,bU as vt,bV as gt,aP as pt,b2 as bt,bE as cn,O as mt,bW as wt,bX as xt,Q as ne}from"./index-7e07b5ae.js";import{a as yt,u as Ct}from"./Input-91bf670a.js";import{e as St,V as Ft,N as Ot}from"./Empty-4dd9647a.js";function yn(e,r){r&&(en(()=>{const{value:s}=e;s&&qe.registerHandler(s,r)}),pe(e,(s,d)=>{d&&qe.unregisterHandler(d)},{deep:!1}),gn(()=>{const{value:s}=e;s&&qe.unregisterHandler(s)}))}function hn(e){switch(typeof e){case"string":return e||void 0;case"number":return String(e);default:return}}function Qe(e){const r=e.filter(s=>s!==void 0);if(r.length!==0)return r.length===1?r[0]:s=>{e.forEach(d=>{d&&d(s)})}}const Tt=be({name:"Checkmark",render(){return a("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16"},a("g",{fill:"none"},a("path",{d:"M14.046 3.486a.75.75 0 0 1-.032 1.06l-7.93 7.474a.85.85 0 0 1-1.188-.022l-2.68-2.72a.75.75 0 1 1 1.068-1.053l2.234 2.267l7.468-7.038a.75.75 0 0 1 1.06.032z",fill:"currentColor"})))}}),Rt=be({props:{onFocus:Function,onBlur:Function},setup(e){return()=>a("div",{style:"width: 0; height: 0",tabindex:0,onFocus:e.onFocus,onBlur:e.onBlur})}}),Mt={height:"calc(var(--n-option-height) * 7.6)",paddingTiny:"4px 0",paddingSmall:"4px 0",paddingMedium:"4px 0",paddingLarge:"4px 0",paddingHuge:"4px 0",optionPaddingTiny:"0 12px",optionPaddingSmall:"0 12px",optionPaddingMedium:"0 12px",optionPaddingLarge:"0 12px",optionPaddingHuge:"0 12px",loadingSize:"18px"};function Pt(e){const{borderRadius:r,popoverColor:s,textColor3:d,dividerColor:u,textColor2:v,primaryColorPressed:f,textColorDisabled:i,primaryColor:C,opacityDisabled:z,hoverColor:p,fontSizeTiny:_,fontSizeSmall:O,fontSizeMedium:w,fontSizeLarge:b,fontSizeHuge:k,heightTiny:V,heightSmall:T,heightMedium:S,heightLarge:P,heightHuge:B}=e;return Object.assign(Object.assign({},Mt),{optionFontSizeTiny:_,optionFontSizeSmall:O,optionFontSizeMedium:w,optionFontSizeLarge:b,optionFontSizeHuge:k,optionHeightTiny:V,optionHeightSmall:T,optionHeightMedium:S,optionHeightLarge:P,optionHeightHuge:B,borderRadius:r,color:s,groupHeaderTextColor:d,actionDividerColor:u,optionTextColor:v,optionTextColorPressed:f,optionTextColorDisabled:i,optionTextColorActive:C,optionOpacityDisabled:z,optionCheckColor:C,optionColorPending:p,optionColorActive:"rgba(0, 0, 0, 0)",optionColorActivePending:p,actionTextColor:v,loadingColor:C})}const zt=nn({name:"InternalSelectMenu",common:tn,peers:{Scrollbar:Xn,Empty:St},self:Pt}),Cn=zt,fn=be({name:"NBaseSelectGroupHeader",props:{clsPrefix:{type:String,required:!0},tmNode:{type:Object,required:!0}},setup(){const{renderLabelRef:e,renderOptionRef:r,labelFieldRef:s,nodePropsRef:d}=pn(on);return{labelField:s,nodeProps:d,renderLabel:e,renderOption:r}},render(){const{clsPrefix:e,renderLabel:r,renderOption:s,nodeProps:d,tmNode:{rawNode:u}}=this,v=d==null?void 0:d(u),f=r?r(u,!1):Fe(u[this.labelField],u,!1),i=a("div",Object.assign({},v,{class:[`${e}-base-select-group-header`,v==null?void 0:v.class]}),f);return u.render?u.render({node:i,option:u}):s?s({node:i,option:u,selected:!1}):i}});function kt(e,r){return a(bn,{name:"fade-in-scale-up-transition"},{default:()=>e?a(Yn,{clsPrefix:r,class:`${r}-base-select-option__check`},{default:()=>a(Tt)}):null})}const vn=be({name:"NBaseSelectOption",props:{clsPrefix:{type:String,required:!0},tmNode:{type:Object,required:!0}},setup(e){const{valueRef:r,pendingTmNodeRef:s,multipleRef:d,valueSetRef:u,renderLabelRef:v,renderOptionRef:f,labelFieldRef:i,valueFieldRef:C,showCheckmarkRef:z,nodePropsRef:p,handleOptionClick:_,handleOptionMouseEnter:O}=pn(on),w=Ge(()=>{const{value:T}=s;return T?e.tmNode.key===T.key:!1});function b(T){const{tmNode:S}=e;S.disabled||_(T,S)}function k(T){const{tmNode:S}=e;S.disabled||O(T,S)}function V(T){const{tmNode:S}=e,{value:P}=w;S.disabled||P||O(T,S)}return{multiple:d,isGrouped:Ge(()=>{const{tmNode:T}=e,{parent:S}=T;return S&&S.rawNode.type==="group"}),showCheckmark:z,nodeProps:p,isPending:w,isSelected:Ge(()=>{const{value:T}=r,{value:S}=d;if(T===null)return!1;const P=e.tmNode.rawNode[C.value];if(S){const{value:B}=u;return B.has(P)}else return T===P}),labelField:i,renderLabel:v,renderOption:f,handleMouseMove:V,handleMouseEnter:k,handleClick:b}},render(){const{clsPrefix:e,tmNode:{rawNode:r},isSelected:s,isPending:d,isGrouped:u,showCheckmark:v,nodeProps:f,renderOption:i,renderLabel:C,handleClick:z,handleMouseEnter:p,handleMouseMove:_}=this,O=kt(s,e),w=C?[C(r,s),v&&O]:[Fe(r[this.labelField],r,s),v&&O],b=f==null?void 0:f(r),k=a("div",Object.assign({},b,{class:[`${e}-base-select-option`,r.class,b==null?void 0:b.class,{[`${e}-base-select-option--disabled`]:r.disabled,[`${e}-base-select-option--selected`]:s,[`${e}-base-select-option--grouped`]:u,[`${e}-base-select-option--pending`]:d,[`${e}-base-select-option--show-checkmark`]:v}],style:[(b==null?void 0:b.style)||"",r.style||""],onClick:Qe([z,b==null?void 0:b.onClick]),onMouseenter:Qe([p,b==null?void 0:b.onMouseenter]),onMousemove:Qe([_,b==null?void 0:b.onMousemove])}),a("div",{class:`${e}-base-select-option__content`},w));return r.render?r.render({node:k,option:r,selected:s}):i?i({node:k,option:r,selected:s}):k}}),$t=R("base-select-menu",`
 line-height: 1.5;
 outline: none;
 z-index: 0;
 position: relative;
 border-radius: var(--n-border-radius);
 transition:
 background-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 background-color: var(--n-color);
`,[R("scrollbar",`
 max-height: var(--n-height);
 `),R("virtual-list",`
 max-height: var(--n-height);
 `),R("base-select-option",`
 min-height: var(--n-option-height);
 font-size: var(--n-option-font-size);
 display: flex;
 align-items: center;
 `,[$("content",`
 z-index: 1;
 white-space: nowrap;
 text-overflow: ellipsis;
 overflow: hidden;
 `)]),R("base-select-group-header",`
 min-height: var(--n-option-height);
 font-size: .93em;
 display: flex;
 align-items: center;
 `),R("base-select-menu-option-wrapper",`
 position: relative;
 width: 100%;
 `),$("loading, empty",`
 display: flex;
 padding: 12px 32px;
 flex: 1;
 justify-content: center;
 `),$("loading",`
 color: var(--n-loading-color);
 font-size: var(--n-loading-size);
 `),$("header",`
 padding: 8px var(--n-option-padding-left);
 font-size: var(--n-option-font-size);
 transition: 
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 border-bottom: 1px solid var(--n-action-divider-color);
 color: var(--n-action-text-color);
 `),$("action",`
 padding: 8px var(--n-option-padding-left);
 font-size: var(--n-option-font-size);
 transition: 
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 border-top: 1px solid var(--n-action-divider-color);
 color: var(--n-action-text-color);
 `),R("base-select-group-header",`
 position: relative;
 cursor: default;
 padding: var(--n-option-padding);
 color: var(--n-group-header-text-color);
 `),R("base-select-option",`
 cursor: pointer;
 position: relative;
 padding: var(--n-option-padding);
 transition:
 color .3s var(--n-bezier),
 opacity .3s var(--n-bezier);
 box-sizing: border-box;
 color: var(--n-option-text-color);
 opacity: 1;
 `,[G("show-checkmark",`
 padding-right: calc(var(--n-option-padding-right) + 20px);
 `),te("&::before",`
 content: "";
 position: absolute;
 left: 4px;
 right: 4px;
 top: 0;
 bottom: 0;
 border-radius: var(--n-border-radius);
 transition: background-color .3s var(--n-bezier);
 `),te("&:active",`
 color: var(--n-option-text-color-pressed);
 `),G("grouped",`
 padding-left: calc(var(--n-option-padding-left) * 1.5);
 `),G("pending",[te("&::before",`
 background-color: var(--n-option-color-pending);
 `)]),G("selected",`
 color: var(--n-option-text-color-active);
 `,[te("&::before",`
 background-color: var(--n-option-color-active);
 `),G("pending",[te("&::before",`
 background-color: var(--n-option-color-active-pending);
 `)])]),G("disabled",`
 cursor: not-allowed;
 `,[Ye("selected",`
 color: var(--n-option-text-color-disabled);
 `),G("selected",`
 opacity: var(--n-option-opacity-disabled);
 `)]),$("check",`
 font-size: 16px;
 position: absolute;
 right: calc(var(--n-option-padding-right) - 4px);
 top: calc(50% - 7px);
 color: var(--n-option-check-color);
 transition: color .3s var(--n-bezier);
 `,[mn({enterScale:"0.5"})])])]),_t=be({name:"InternalSelectMenu",props:Object.assign(Object.assign({},Oe.props),{clsPrefix:{type:String,required:!0},scrollable:{type:Boolean,default:!0},treeMate:{type:Object,required:!0},multiple:Boolean,size:{type:String,default:"medium"},value:{type:[String,Number,Array],default:null},autoPending:Boolean,virtualScroll:{type:Boolean,default:!0},show:{type:Boolean,default:!0},labelField:{type:String,default:"label"},valueField:{type:String,default:"value"},loading:Boolean,focusable:Boolean,renderLabel:Function,renderOption:Function,nodeProps:Function,showCheckmark:{type:Boolean,default:!0},onMousedown:Function,onScroll:Function,onFocus:Function,onBlur:Function,onKeyup:Function,onKeydown:Function,onTabOut:Function,onMouseenter:Function,onMouseleave:Function,onResize:Function,resetMenuOnOptionsChange:{type:Boolean,default:!0},inlineThemeDisabled:Boolean,onToggle:Function}),setup(e){const{mergedClsPrefixRef:r,mergedRtlRef:s}=ln(e),d=wn("InternalSelectMenu",s,r),u=Oe("InternalSelectMenu","-internal-select-menu",$t,Cn,e,j(e,"clsPrefix")),v=M(null),f=M(null),i=M(null),C=I(()=>e.treeMate.getFlattenedNodes()),z=I(()=>tt(C.value)),p=M(null);function _(){const{treeMate:o}=e;let c=null;const{value:D}=e;D===null?c=o.getFirstAvailableNode():(e.multiple?c=o.getNode((D||[])[(D||[]).length-1]):c=o.getNode(D),(!c||c.disabled)&&(c=o.getFirstAvailableNode())),Y(c||null)}function O(){const{value:o}=p;o&&!e.treeMate.getNode(o.key)&&(p.value=null)}let w;pe(()=>e.show,o=>{o?w=pe(()=>e.treeMate,()=>{e.resetMenuOnOptionsChange?(e.autoPending?_():O(),xn(ce)):O()},{immediate:!0}):w==null||w()},{immediate:!0}),gn(()=>{w==null||w()});const b=I(()=>ot(u.value.self[ge("optionHeight",e.size)])),k=I(()=>Ie(u.value.self[ge("padding",e.size)])),V=I(()=>e.multiple&&Array.isArray(e.value)?new Set(e.value):new Set),T=I(()=>{const o=C.value;return o&&o.length===0});function S(o){const{onToggle:c}=e;c&&c(o)}function P(o){const{onScroll:c}=e;c&&c(o)}function B(o){var c;(c=i.value)===null||c===void 0||c.sync(),P(o)}function A(){var o;(o=i.value)===null||o===void 0||o.sync()}function U(){const{value:o}=p;return o||null}function W(o,c){c.disabled||Y(c,!1)}function oe(o,c){c.disabled||S(c)}function ie(o){var c;Be(o,"action")||(c=e.onKeyup)===null||c===void 0||c.call(e,o)}function J(o){var c;Be(o,"action")||(c=e.onKeydown)===null||c===void 0||c.call(e,o)}function Q(o){var c;(c=e.onMousedown)===null||c===void 0||c.call(e,o),!e.focusable&&o.preventDefault()}function X(){const{value:o}=p;o&&Y(o.getNext({loop:!0}),!0)}function E(){const{value:o}=p;o&&Y(o.getPrev({loop:!0}),!0)}function Y(o,c=!1){p.value=o,c&&ce()}function ce(){var o,c;const D=p.value;if(!D)return;const re=z.value(D.key);re!==null&&(e.virtualScroll?(o=f.value)===null||o===void 0||o.scrollTo({index:re}):(c=i.value)===null||c===void 0||c.scrollTo({index:re,elSize:b.value}))}function se(o){var c,D;!((c=v.value)===null||c===void 0)&&c.contains(o.target)&&((D=e.onFocus)===null||D===void 0||D.call(e,o))}function Te(o){var c,D;!((c=v.value)===null||c===void 0)&&c.contains(o.relatedTarget)||(D=e.onBlur)===null||D===void 0||D.call(e,o)}an(on,{handleOptionMouseEnter:W,handleOptionClick:oe,valueSetRef:V,pendingTmNodeRef:p,nodePropsRef:j(e,"nodeProps"),showCheckmarkRef:j(e,"showCheckmark"),multipleRef:j(e,"multiple"),valueRef:j(e,"value"),renderLabelRef:j(e,"renderLabel"),renderOptionRef:j(e,"renderOption"),labelFieldRef:j(e,"labelField"),valueFieldRef:j(e,"valueField")}),an(it,v),en(()=>{const{value:o}=i;o&&o.sync()});const le=I(()=>{const{size:o}=e,{common:{cubicBezierEaseInOut:c},self:{height:D,borderRadius:re,color:we,groupHeaderTextColor:xe,actionDividerColor:ae,optionTextColorPressed:q,optionTextColor:ye,optionTextColorDisabled:de,optionTextColorActive:Re,optionOpacityDisabled:Me,optionCheckColor:Pe,actionTextColor:ze,optionColorPending:he,optionColorActive:fe,loadingColor:ke,loadingSize:$e,optionColorActivePending:_e,[ge("optionFontSize",o)]:Ce,[ge("optionHeight",o)]:ve,[ge("optionPadding",o)]:H}}=u.value;return{"--n-height":D,"--n-action-divider-color":ae,"--n-action-text-color":ze,"--n-bezier":c,"--n-border-radius":re,"--n-color":we,"--n-option-font-size":Ce,"--n-group-header-text-color":xe,"--n-option-check-color":Pe,"--n-option-color-pending":he,"--n-option-color-active":fe,"--n-option-color-active-pending":_e,"--n-option-height":ve,"--n-option-opacity-disabled":Me,"--n-option-text-color":ye,"--n-option-text-color-active":Re,"--n-option-text-color-disabled":de,"--n-option-text-color-pressed":q,"--n-option-padding":H,"--n-option-padding-left":Ie(H,"left"),"--n-option-padding-right":Ie(H,"right"),"--n-loading-color":ke,"--n-loading-size":$e}}),{inlineThemeDisabled:me}=e,K=me?rn("internal-select-menu",I(()=>e.size[0]),le,e):void 0,Z={selfRef:v,next:X,prev:E,getPendingTmNode:U};return yn(v,e.onResize),Object.assign({mergedTheme:u,mergedClsPrefix:r,rtlEnabled:d,virtualListRef:f,scrollbarRef:i,itemSize:b,padding:k,flattenedNodes:C,empty:T,virtualListContainer(){const{value:o}=f;return o==null?void 0:o.listElRef},virtualListContent(){const{value:o}=f;return o==null?void 0:o.itemsElRef},doScroll:P,handleFocusin:se,handleFocusout:Te,handleKeyUp:ie,handleKeyDown:J,handleMouseDown:Q,handleVirtualListResize:A,handleVirtualListScroll:B,cssVars:me?void 0:le,themeClass:K==null?void 0:K.themeClass,onRender:K==null?void 0:K.onRender},Z)},render(){const{$slots:e,virtualScroll:r,clsPrefix:s,mergedTheme:d,themeClass:u,onRender:v}=this;return v==null||v(),a("div",{ref:"selfRef",tabindex:this.focusable?0:-1,class:[`${s}-base-select-menu`,this.rtlEnabled&&`${s}-base-select-menu--rtl`,u,this.multiple&&`${s}-base-select-menu--multiple`],style:this.cssVars,onFocusin:this.handleFocusin,onFocusout:this.handleFocusout,onKeyup:this.handleKeyUp,onKeydown:this.handleKeyDown,onMousedown:this.handleMouseDown,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},sn(e.header,f=>f&&a("div",{class:`${s}-base-select-menu__header`,"data-header":!0,key:"header"},f)),this.loading?a("div",{class:`${s}-base-select-menu__loading`},a(Zn,{clsPrefix:s,strokeWidth:20})):this.empty?a("div",{class:`${s}-base-select-menu__empty`,"data-empty":!0},nt(e.empty,()=>[a(Ot,{theme:d.peers.Empty,themeOverrides:d.peerOverrides.Empty,size:this.size})])):a(et,{ref:"scrollbarRef",theme:d.peers.Scrollbar,themeOverrides:d.peerOverrides.Scrollbar,scrollable:this.scrollable,container:r?this.virtualListContainer:void 0,content:r?this.virtualListContent:void 0,onScroll:r?void 0:this.doScroll},{default:()=>r?a(Ft,{ref:"virtualListRef",class:`${s}-virtual-list`,items:this.flattenedNodes,itemSize:this.itemSize,showScrollbar:!1,paddingTop:this.padding.top,paddingBottom:this.padding.bottom,onResize:this.handleVirtualListResize,onScroll:this.handleVirtualListScroll,itemResizable:!0},{default:({item:f})=>f.isGroup?a(fn,{key:f.key,clsPrefix:s,tmNode:f}):f.ignored?null:a(vn,{clsPrefix:s,key:f.key,tmNode:f})}):a("div",{class:`${s}-base-select-menu-option-wrapper`,style:{paddingTop:this.padding.top,paddingBottom:this.padding.bottom}},this.flattenedNodes.map(f=>f.isGroup?a(fn,{key:f.key,clsPrefix:s,tmNode:f}):a(vn,{clsPrefix:s,key:f.key,tmNode:f})))}),sn(e.action,f=>f&&[a("div",{class:`${s}-base-select-menu__action`,"data-action":!0,key:"action"},f),a(Rt,{onFocus:this.onTabOut,key:"focus-detector"})]))}}),It={paddingSingle:"0 26px 0 12px",paddingMultiple:"3px 26px 0 12px",clearSize:"16px",arrowSize:"16px"};function Bt(e){const{borderRadius:r,textColor2:s,textColorDisabled:d,inputColor:u,inputColorDisabled:v,primaryColor:f,primaryColorHover:i,warningColor:C,warningColorHover:z,errorColor:p,errorColorHover:_,borderColor:O,iconColor:w,iconColorDisabled:b,clearColor:k,clearColorHover:V,clearColorPressed:T,placeholderColor:S,placeholderColorDisabled:P,fontSizeTiny:B,fontSizeSmall:A,fontSizeMedium:U,fontSizeLarge:W,heightTiny:oe,heightSmall:ie,heightMedium:J,heightLarge:Q,fontWeight:X}=e;return Object.assign(Object.assign({},It),{fontSizeTiny:B,fontSizeSmall:A,fontSizeMedium:U,fontSizeLarge:W,heightTiny:oe,heightSmall:ie,heightMedium:J,heightLarge:Q,borderRadius:r,fontWeight:X,textColor:s,textColorDisabled:d,placeholderColor:S,placeholderColorDisabled:P,color:u,colorDisabled:v,colorActive:u,border:`1px solid ${O}`,borderHover:`1px solid ${i}`,borderActive:`1px solid ${f}`,borderFocus:`1px solid ${i}`,boxShadowHover:"none",boxShadowActive:`0 0 0 2px ${Se(f,{alpha:.2})}`,boxShadowFocus:`0 0 0 2px ${Se(f,{alpha:.2})}`,caretColor:f,arrowColor:w,arrowColorDisabled:b,loadingColor:f,borderWarning:`1px solid ${C}`,borderHoverWarning:`1px solid ${z}`,borderActiveWarning:`1px solid ${C}`,borderFocusWarning:`1px solid ${z}`,boxShadowHoverWarning:"none",boxShadowActiveWarning:`0 0 0 2px ${Se(C,{alpha:.2})}`,boxShadowFocusWarning:`0 0 0 2px ${Se(C,{alpha:.2})}`,colorActiveWarning:u,caretColorWarning:C,borderError:`1px solid ${p}`,borderHoverError:`1px solid ${_}`,borderActiveError:`1px solid ${p}`,borderFocusError:`1px solid ${_}`,boxShadowHoverError:"none",boxShadowActiveError:`0 0 0 2px ${Se(p,{alpha:.2})}`,boxShadowFocusError:`0 0 0 2px ${Se(p,{alpha:.2})}`,colorActiveError:u,caretColorError:p,clearColor:k,clearColorHover:V,clearColorPressed:T})}const At=nn({name:"InternalSelection",common:tn,peers:{Popover:lt},self:Bt}),Sn=At,Et=te([R("base-selection",`
 --n-padding-single: var(--n-padding-single-top) var(--n-padding-single-right) var(--n-padding-single-bottom) var(--n-padding-single-left);
 --n-padding-multiple: var(--n-padding-multiple-top) var(--n-padding-multiple-right) var(--n-padding-multiple-bottom) var(--n-padding-multiple-left);
 position: relative;
 z-index: auto;
 box-shadow: none;
 width: 100%;
 max-width: 100%;
 display: inline-block;
 vertical-align: bottom;
 border-radius: var(--n-border-radius);
 min-height: var(--n-height);
 line-height: 1.5;
 font-size: var(--n-font-size);
 `,[R("base-loading",`
 color: var(--n-loading-color);
 `),R("base-selection-tags","min-height: var(--n-height);"),$("border, state-border",`
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 pointer-events: none;
 border: var(--n-border);
 border-radius: inherit;
 transition:
 box-shadow .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `),$("state-border",`
 z-index: 1;
 border-color: #0000;
 `),R("base-suffix",`
 cursor: pointer;
 position: absolute;
 top: 50%;
 transform: translateY(-50%);
 right: 10px;
 `,[$("arrow",`
 font-size: var(--n-arrow-size);
 color: var(--n-arrow-color);
 transition: color .3s var(--n-bezier);
 `)]),R("base-selection-overlay",`
 display: flex;
 align-items: center;
 white-space: nowrap;
 pointer-events: none;
 position: absolute;
 top: 0;
 right: 0;
 bottom: 0;
 left: 0;
 padding: var(--n-padding-single);
 transition: color .3s var(--n-bezier);
 `,[$("wrapper",`
 flex-basis: 0;
 flex-grow: 1;
 overflow: hidden;
 text-overflow: ellipsis;
 `)]),R("base-selection-placeholder",`
 color: var(--n-placeholder-color);
 `,[$("inner",`
 max-width: 100%;
 overflow: hidden;
 `)]),R("base-selection-tags",`
 cursor: pointer;
 outline: none;
 box-sizing: border-box;
 position: relative;
 z-index: auto;
 display: flex;
 padding: var(--n-padding-multiple);
 flex-wrap: wrap;
 align-items: center;
 width: 100%;
 vertical-align: bottom;
 background-color: var(--n-color);
 border-radius: inherit;
 transition:
 color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `),R("base-selection-label",`
 height: var(--n-height);
 display: inline-flex;
 width: 100%;
 vertical-align: bottom;
 cursor: pointer;
 outline: none;
 z-index: auto;
 box-sizing: border-box;
 position: relative;
 transition:
 color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 border-radius: inherit;
 background-color: var(--n-color);
 align-items: center;
 `,[R("base-selection-input",`
 font-size: inherit;
 line-height: inherit;
 outline: none;
 cursor: pointer;
 box-sizing: border-box;
 border:none;
 width: 100%;
 padding: var(--n-padding-single);
 background-color: #0000;
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 caret-color: var(--n-caret-color);
 `,[$("content",`
 text-overflow: ellipsis;
 overflow: hidden;
 white-space: nowrap; 
 `)]),$("render-label",`
 color: var(--n-text-color);
 `)]),Ye("disabled",[te("&:hover",[$("state-border",`
 box-shadow: var(--n-box-shadow-hover);
 border: var(--n-border-hover);
 `)]),G("focus",[$("state-border",`
 box-shadow: var(--n-box-shadow-focus);
 border: var(--n-border-focus);
 `)]),G("active",[$("state-border",`
 box-shadow: var(--n-box-shadow-active);
 border: var(--n-border-active);
 `),R("base-selection-label","background-color: var(--n-color-active);"),R("base-selection-tags","background-color: var(--n-color-active);")])]),G("disabled","cursor: not-allowed;",[$("arrow",`
 color: var(--n-arrow-color-disabled);
 `),R("base-selection-label",`
 cursor: not-allowed;
 background-color: var(--n-color-disabled);
 `,[R("base-selection-input",`
 cursor: not-allowed;
 color: var(--n-text-color-disabled);
 `),$("render-label",`
 color: var(--n-text-color-disabled);
 `)]),R("base-selection-tags",`
 cursor: not-allowed;
 background-color: var(--n-color-disabled);
 `),R("base-selection-placeholder",`
 cursor: not-allowed;
 color: var(--n-placeholder-color-disabled);
 `)]),R("base-selection-input-tag",`
 height: calc(var(--n-height) - 6px);
 line-height: calc(var(--n-height) - 6px);
 outline: none;
 display: none;
 position: relative;
 margin-bottom: 3px;
 max-width: 100%;
 vertical-align: bottom;
 `,[$("input",`
 font-size: inherit;
 font-family: inherit;
 min-width: 1px;
 padding: 0;
 background-color: #0000;
 outline: none;
 border: none;
 max-width: 100%;
 overflow: hidden;
 width: 1em;
 line-height: inherit;
 cursor: pointer;
 color: var(--n-text-color);
 caret-color: var(--n-caret-color);
 `),$("mirror",`
 position: absolute;
 left: 0;
 top: 0;
 white-space: pre;
 visibility: hidden;
 user-select: none;
 -webkit-user-select: none;
 opacity: 0;
 `)]),["warning","error"].map(e=>G(`${e}-status`,[$("state-border",`border: var(--n-border-${e});`),Ye("disabled",[te("&:hover",[$("state-border",`
 box-shadow: var(--n-box-shadow-hover-${e});
 border: var(--n-border-hover-${e});
 `)]),G("active",[$("state-border",`
 box-shadow: var(--n-box-shadow-active-${e});
 border: var(--n-border-active-${e});
 `),R("base-selection-label",`background-color: var(--n-color-active-${e});`),R("base-selection-tags",`background-color: var(--n-color-active-${e});`)]),G("focus",[$("state-border",`
 box-shadow: var(--n-box-shadow-focus-${e});
 border: var(--n-border-focus-${e});
 `)])])]))]),R("base-selection-popover",`
 margin-bottom: -3px;
 display: flex;
 flex-wrap: wrap;
 margin-right: -8px;
 `),R("base-selection-tag-wrapper",`
 max-width: 100%;
 display: inline-flex;
 padding: 0 7px 3px 0;
 `,[te("&:last-child","padding-right: 0;"),R("tag",`
 font-size: 14px;
 max-width: 100%;
 `,[$("content",`
 line-height: 1.25;
 text-overflow: ellipsis;
 overflow: hidden;
 `)])])]),Dt=be({name:"InternalSelection",props:Object.assign(Object.assign({},Oe.props),{clsPrefix:{type:String,required:!0},bordered:{type:Boolean,default:void 0},active:Boolean,pattern:{type:String,default:""},placeholder:String,selectedOption:{type:Object,default:null},selectedOptions:{type:Array,default:null},labelField:{type:String,default:"label"},valueField:{type:String,default:"value"},multiple:Boolean,filterable:Boolean,clearable:Boolean,disabled:Boolean,size:{type:String,default:"medium"},loading:Boolean,autofocus:Boolean,showArrow:{type:Boolean,default:!0},inputProps:Object,focused:Boolean,renderTag:Function,onKeydown:Function,onClick:Function,onBlur:Function,onFocus:Function,onDeleteOption:Function,maxTagCount:[String,Number],ellipsisTagPopoverProps:Object,onClear:Function,onPatternInput:Function,onPatternFocus:Function,onPatternBlur:Function,renderLabel:Function,status:String,inlineThemeDisabled:Boolean,ignoreComposition:{type:Boolean,default:!0},onResize:Function}),setup(e){const{mergedClsPrefixRef:r,mergedRtlRef:s}=ln(e),d=wn("InternalSelection",s,r),u=M(null),v=M(null),f=M(null),i=M(null),C=M(null),z=M(null),p=M(null),_=M(null),O=M(null),w=M(null),b=M(!1),k=M(!1),V=M(!1),T=Oe("InternalSelection","-internal-selection",Et,Sn,e,j(e,"clsPrefix")),S=I(()=>e.clearable&&!e.disabled&&(V.value||e.active)),P=I(()=>e.selectedOption?e.renderTag?e.renderTag({option:e.selectedOption,handleClose:()=>{}}):e.renderLabel?e.renderLabel(e.selectedOption,!0):Fe(e.selectedOption[e.labelField],e.selectedOption,!0):e.placeholder),B=I(()=>{const t=e.selectedOption;if(t)return t[e.labelField]}),A=I(()=>e.multiple?!!(Array.isArray(e.selectedOptions)&&e.selectedOptions.length):e.selectedOption!==null);function U(){var t;const{value:h}=u;if(h){const{value:N}=v;N&&(N.style.width=`${h.offsetWidth}px`,e.maxTagCount!=="responsive"&&((t=O.value)===null||t===void 0||t.sync({showAllItemsBeforeCalculate:!1})))}}function W(){const{value:t}=w;t&&(t.style.display="none")}function oe(){const{value:t}=w;t&&(t.style.display="inline-block")}pe(j(e,"active"),t=>{t||W()}),pe(j(e,"pattern"),()=>{e.multiple&&xn(U)});function ie(t){const{onFocus:h}=e;h&&h(t)}function J(t){const{onBlur:h}=e;h&&h(t)}function Q(t){const{onDeleteOption:h}=e;h&&h(t)}function X(t){const{onClear:h}=e;h&&h(t)}function E(t){const{onPatternInput:h}=e;h&&h(t)}function Y(t){var h;(!t.relatedTarget||!(!((h=f.value)===null||h===void 0)&&h.contains(t.relatedTarget)))&&ie(t)}function ce(t){var h;!((h=f.value)===null||h===void 0)&&h.contains(t.relatedTarget)||J(t)}function se(t){X(t)}function Te(){V.value=!0}function le(){V.value=!1}function me(t){!e.active||!e.filterable||t.target!==v.value&&t.preventDefault()}function K(t){Q(t)}const Z=M(!1);function o(t){if(t.key==="Backspace"&&!Z.value&&!e.pattern.length){const{selectedOptions:h}=e;h!=null&&h.length&&K(h[h.length-1])}}let c=null;function D(t){const{value:h}=u;if(h){const N=t.target.value;h.textContent=N,U()}e.ignoreComposition&&Z.value?c=t:E(t)}function re(){Z.value=!0}function we(){Z.value=!1,e.ignoreComposition&&E(c),c=null}function xe(t){var h;k.value=!0,(h=e.onPatternFocus)===null||h===void 0||h.call(e,t)}function ae(t){var h;k.value=!1,(h=e.onPatternBlur)===null||h===void 0||h.call(e,t)}function q(){var t,h;if(e.filterable)k.value=!1,(t=z.value)===null||t===void 0||t.blur(),(h=v.value)===null||h===void 0||h.blur();else if(e.multiple){const{value:N}=i;N==null||N.blur()}else{const{value:N}=C;N==null||N.blur()}}function ye(){var t,h,N;e.filterable?(k.value=!1,(t=z.value)===null||t===void 0||t.focus()):e.multiple?(h=i.value)===null||h===void 0||h.focus():(N=C.value)===null||N===void 0||N.focus()}function de(){const{value:t}=v;t&&(oe(),t.focus())}function Re(){const{value:t}=v;t&&t.blur()}function Me(t){const{value:h}=p;h&&h.setTextContent(`+${t}`)}function Pe(){const{value:t}=_;return t}function ze(){return v.value}let he=null;function fe(){he!==null&&window.clearTimeout(he)}function ke(){e.active||(fe(),he=window.setTimeout(()=>{A.value&&(b.value=!0)},100))}function $e(){fe()}function _e(t){t||(fe(),b.value=!1)}pe(A,t=>{t||(b.value=!1)}),en(()=>{rt(()=>{const t=z.value;t&&(e.disabled?t.removeAttribute("tabindex"):t.tabIndex=k.value?-1:0)})}),yn(f,e.onResize);const{inlineThemeDisabled:Ce}=e,ve=I(()=>{const{size:t}=e,{common:{cubicBezierEaseInOut:h},self:{fontWeight:N,borderRadius:je,color:We,placeholderColor:Ae,textColor:Ee,paddingSingle:De,paddingMultiple:Ke,caretColor:Ue,colorDisabled:Ne,textColorDisabled:ue,placeholderColorDisabled:n,colorActive:l,boxShadowFocus:g,boxShadowActive:F,boxShadowHover:x,border:m,borderFocus:y,borderHover:L,borderActive:ee,arrowColor:On,arrowColorDisabled:Tn,loadingColor:Rn,colorActiveWarning:Mn,boxShadowFocusWarning:Pn,boxShadowActiveWarning:zn,boxShadowHoverWarning:kn,borderWarning:$n,borderFocusWarning:_n,borderHoverWarning:In,borderActiveWarning:Bn,colorActiveError:An,boxShadowFocusError:En,boxShadowActiveError:Dn,boxShadowHoverError:Nn,borderError:Ln,borderFocusError:Vn,borderHoverError:Hn,borderActiveError:jn,clearColor:Wn,clearColorHover:Kn,clearColorPressed:Un,clearSize:qn,arrowSize:Gn,[ge("height",t)]:Jn,[ge("fontSize",t)]:Qn}}=T.value,Le=Ie(De),Ve=Ie(Ke);return{"--n-bezier":h,"--n-border":m,"--n-border-active":ee,"--n-border-focus":y,"--n-border-hover":L,"--n-border-radius":je,"--n-box-shadow-active":F,"--n-box-shadow-focus":g,"--n-box-shadow-hover":x,"--n-caret-color":Ue,"--n-color":We,"--n-color-active":l,"--n-color-disabled":Ne,"--n-font-size":Qn,"--n-height":Jn,"--n-padding-single-top":Le.top,"--n-padding-multiple-top":Ve.top,"--n-padding-single-right":Le.right,"--n-padding-multiple-right":Ve.right,"--n-padding-single-left":Le.left,"--n-padding-multiple-left":Ve.left,"--n-padding-single-bottom":Le.bottom,"--n-padding-multiple-bottom":Ve.bottom,"--n-placeholder-color":Ae,"--n-placeholder-color-disabled":n,"--n-text-color":Ee,"--n-text-color-disabled":ue,"--n-arrow-color":On,"--n-arrow-color-disabled":Tn,"--n-loading-color":Rn,"--n-color-active-warning":Mn,"--n-box-shadow-focus-warning":Pn,"--n-box-shadow-active-warning":zn,"--n-box-shadow-hover-warning":kn,"--n-border-warning":$n,"--n-border-focus-warning":_n,"--n-border-hover-warning":In,"--n-border-active-warning":Bn,"--n-color-active-error":An,"--n-box-shadow-focus-error":En,"--n-box-shadow-active-error":Dn,"--n-box-shadow-hover-error":Nn,"--n-border-error":Ln,"--n-border-focus-error":Vn,"--n-border-hover-error":Hn,"--n-border-active-error":jn,"--n-clear-size":qn,"--n-clear-color":Wn,"--n-clear-color-hover":Kn,"--n-clear-color-pressed":Un,"--n-arrow-size":Gn,"--n-font-weight":N}}),H=Ce?rn("internal-selection",I(()=>e.size[0]),ve,e):void 0;return{mergedTheme:T,mergedClearable:S,mergedClsPrefix:r,rtlEnabled:d,patternInputFocused:k,filterablePlaceholder:P,label:B,selected:A,showTagsPanel:b,isComposing:Z,counterRef:p,counterWrapperRef:_,patternInputMirrorRef:u,patternInputRef:v,selfRef:f,multipleElRef:i,singleElRef:C,patternInputWrapperRef:z,overflowRef:O,inputTagElRef:w,handleMouseDown:me,handleFocusin:Y,handleClear:se,handleMouseEnter:Te,handleMouseLeave:le,handleDeleteOption:K,handlePatternKeyDown:o,handlePatternInputInput:D,handlePatternInputBlur:ae,handlePatternInputFocus:xe,handleMouseEnterCounter:ke,handleMouseLeaveCounter:$e,handleFocusout:ce,handleCompositionEnd:we,handleCompositionStart:re,onPopoverUpdateShow:_e,focus:ye,focusInput:de,blur:q,blurInput:Re,updateCounter:Me,getCounter:Pe,getTail:ze,renderLabel:e.renderLabel,cssVars:Ce?void 0:ve,themeClass:H==null?void 0:H.themeClass,onRender:H==null?void 0:H.onRender}},render(){const{status:e,multiple:r,size:s,disabled:d,filterable:u,maxTagCount:v,bordered:f,clsPrefix:i,ellipsisTagPopoverProps:C,onRender:z,renderTag:p,renderLabel:_}=this;z==null||z();const O=v==="responsive",w=typeof v=="number",b=O||w,k=a(at,null,{default:()=>a(yt,{clsPrefix:i,loading:this.loading,showArrow:this.showArrow,showClear:this.mergedClearable&&this.selected,onClear:this.handleClear},{default:()=>{var T,S;return(S=(T=this.$slots).arrow)===null||S===void 0?void 0:S.call(T)}})});let V;if(r){const{labelField:T}=this,S=E=>a("div",{class:`${i}-base-selection-tag-wrapper`,key:E.value},p?p({option:E,handleClose:()=>{this.handleDeleteOption(E)}}):a(Je,{size:s,closable:!E.disabled,disabled:d,onClose:()=>{this.handleDeleteOption(E)},internalCloseIsButtonTag:!1,internalCloseFocusable:!1},{default:()=>_?_(E,!0):Fe(E[T],E,!0)})),P=()=>(w?this.selectedOptions.slice(0,v):this.selectedOptions).map(S),B=u?a("div",{class:`${i}-base-selection-input-tag`,ref:"inputTagElRef",key:"__input-tag__"},a("input",Object.assign({},this.inputProps,{ref:"patternInputRef",tabindex:-1,disabled:d,value:this.pattern,autofocus:this.autofocus,class:`${i}-base-selection-input-tag__input`,onBlur:this.handlePatternInputBlur,onFocus:this.handlePatternInputFocus,onKeydown:this.handlePatternKeyDown,onInput:this.handlePatternInputInput,onCompositionstart:this.handleCompositionStart,onCompositionend:this.handleCompositionEnd})),a("span",{ref:"patternInputMirrorRef",class:`${i}-base-selection-input-tag__mirror`},this.pattern)):null,A=O?()=>a("div",{class:`${i}-base-selection-tag-wrapper`,ref:"counterWrapperRef"},a(Je,{size:s,ref:"counterRef",onMouseenter:this.handleMouseEnterCounter,onMouseleave:this.handleMouseLeaveCounter,disabled:d})):void 0;let U;if(w){const E=this.selectedOptions.length-v;E>0&&(U=a("div",{class:`${i}-base-selection-tag-wrapper`,key:"__counter__"},a(Je,{size:s,ref:"counterRef",onMouseenter:this.handleMouseEnterCounter,disabled:d},{default:()=>`+${E}`})))}const W=O?u?a(dn,{ref:"overflowRef",updateCounter:this.updateCounter,getCounter:this.getCounter,getTail:this.getTail,style:{width:"100%",display:"flex",overflow:"hidden"}},{default:P,counter:A,tail:()=>B}):a(dn,{ref:"overflowRef",updateCounter:this.updateCounter,getCounter:this.getCounter,style:{width:"100%",display:"flex",overflow:"hidden"}},{default:P,counter:A}):w&&U?P().concat(U):P(),oe=b?()=>a("div",{class:`${i}-base-selection-popover`},O?P():this.selectedOptions.map(S)):void 0,ie=b?Object.assign({show:this.showTagsPanel,trigger:"hover",overlap:!0,placement:"top",width:"trigger",onUpdateShow:this.onPopoverUpdateShow,theme:this.mergedTheme.peers.Popover,themeOverrides:this.mergedTheme.peerOverrides.Popover},C):null,Q=(this.selected?!1:this.active?!this.pattern&&!this.isComposing:!0)?a("div",{class:`${i}-base-selection-placeholder ${i}-base-selection-overlay`},a("div",{class:`${i}-base-selection-placeholder__inner`},this.placeholder)):null,X=u?a("div",{ref:"patternInputWrapperRef",class:`${i}-base-selection-tags`},W,O?null:B,k):a("div",{ref:"multipleElRef",class:`${i}-base-selection-tags`,tabindex:d?void 0:0},W,k);V=a(dt,null,b?a(st,Object.assign({},ie,{scrollable:!0,style:"max-height: calc(var(--v-target-height) * 6.6);"}),{trigger:()=>X,default:oe}):X,Q)}else if(u){const T=this.pattern||this.isComposing,S=this.active?!T:!this.selected,P=this.active?!1:this.selected;V=a("div",{ref:"patternInputWrapperRef",class:`${i}-base-selection-label`,title:this.patternInputFocused?void 0:hn(this.label)},a("input",Object.assign({},this.inputProps,{ref:"patternInputRef",class:`${i}-base-selection-input`,value:this.active?this.pattern:"",placeholder:"",readonly:d,disabled:d,tabindex:-1,autofocus:this.autofocus,onFocus:this.handlePatternInputFocus,onBlur:this.handlePatternInputBlur,onInput:this.handlePatternInputInput,onCompositionstart:this.handleCompositionStart,onCompositionend:this.handleCompositionEnd})),P?a("div",{class:`${i}-base-selection-label__render-label ${i}-base-selection-overlay`,key:"input"},a("div",{class:`${i}-base-selection-overlay__wrapper`},p?p({option:this.selectedOption,handleClose:()=>{}}):_?_(this.selectedOption,!0):Fe(this.label,this.selectedOption,!0))):null,S?a("div",{class:`${i}-base-selection-placeholder ${i}-base-selection-overlay`,key:"placeholder"},a("div",{class:`${i}-base-selection-overlay__wrapper`},this.filterablePlaceholder)):null,k)}else V=a("div",{ref:"singleElRef",class:`${i}-base-selection-label`,tabindex:this.disabled?void 0:0},this.label!==void 0?a("div",{class:`${i}-base-selection-input`,title:hn(this.label),key:"input"},a("div",{class:`${i}-base-selection-input__content`},p?p({option:this.selectedOption,handleClose:()=>{}}):_?_(this.selectedOption,!0):Fe(this.label,this.selectedOption,!0))):a("div",{class:`${i}-base-selection-placeholder ${i}-base-selection-overlay`,key:"placeholder"},a("div",{class:`${i}-base-selection-placeholder__inner`},this.placeholder)),k);return a("div",{ref:"selfRef",class:[`${i}-base-selection`,this.rtlEnabled&&`${i}-base-selection--rtl`,this.themeClass,e&&`${i}-base-selection--${e}-status`,{[`${i}-base-selection--active`]:this.active,[`${i}-base-selection--selected`]:this.selected||this.active&&this.pattern,[`${i}-base-selection--disabled`]:this.disabled,[`${i}-base-selection--multiple`]:this.multiple,[`${i}-base-selection--focus`]:this.focused}],style:this.cssVars,onClick:this.onClick,onMouseenter:this.handleMouseEnter,onMouseleave:this.handleMouseLeave,onKeydown:this.onKeydown,onFocusin:this.handleFocusin,onFocusout:this.handleFocusout,onMousedown:this.handleMouseDown},V,f?a("div",{class:`${i}-base-selection__border`}):null,f?a("div",{class:`${i}-base-selection__state-border`}):null)}});function He(e){return e.type==="group"}function Fn(e){return e.type==="ignored"}function Xe(e,r){try{return!!(1+r.toString().toLowerCase().indexOf(e.trim().toLowerCase()))}catch{return!1}}function Nt(e,r){return{getIsGroup:He,getIgnored:Fn,getKey(d){return He(d)?d.name||d.key||"key-required":d[e]},getChildren(d){return d[r]}}}function Lt(e,r,s,d){if(!r)return e;function u(v){if(!Array.isArray(v))return[];const f=[];for(const i of v)if(He(i)){const C=u(i[d]);C.length&&f.push(Object.assign({},i,{[d]:C}))}else{if(Fn(i))continue;r(s,i)&&f.push(i)}return f}return u(e)}function Vt(e,r,s){const d=new Map;return e.forEach(u=>{He(u)?u[s].forEach(v=>{d.set(v[r],v)}):d.set(u[r],u)}),d}function Ht(e){const{boxShadow2:r}=e;return{menuBoxShadow:r}}const jt=nn({name:"Select",common:tn,peers:{InternalSelection:Sn,InternalSelectMenu:Cn},self:Ht}),Wt=jt,Kt=te([R("select",`
 z-index: auto;
 outline: none;
 width: 100%;
 position: relative;
 font-weight: var(--n-font-weight);
 `),R("select-menu",`
 margin: 4px 0;
 box-shadow: var(--n-menu-box-shadow);
 `,[mn({originalTransition:"background-color .3s var(--n-bezier), box-shadow .3s var(--n-bezier)"})])]),Ut=Object.assign(Object.assign({},Oe.props),{to:Ze.propTo,bordered:{type:Boolean,default:void 0},clearable:Boolean,clearFilterAfterSelect:{type:Boolean,default:!0},options:{type:Array,default:()=>[]},defaultValue:{type:[String,Number,Array],default:null},keyboard:{type:Boolean,default:!0},value:[String,Number,Array],placeholder:String,menuProps:Object,multiple:Boolean,size:String,menuSize:{type:String},filterable:Boolean,disabled:{type:Boolean,default:void 0},remote:Boolean,loading:Boolean,filter:Function,placement:{type:String,default:"bottom-start"},widthMode:{type:String,default:"trigger"},tag:Boolean,onCreate:Function,fallbackOption:{type:[Function,Boolean],default:void 0},show:{type:Boolean,default:void 0},showArrow:{type:Boolean,default:!0},maxTagCount:[Number,String],ellipsisTagPopoverProps:Object,consistentMenuWidth:{type:Boolean,default:!0},virtualScroll:{type:Boolean,default:!0},labelField:{type:String,default:"label"},valueField:{type:String,default:"value"},childrenField:{type:String,default:"children"},renderLabel:Function,renderOption:Function,renderTag:Function,"onUpdate:value":[Function,Array],inputProps:Object,nodeProps:Function,ignoreComposition:{type:Boolean,default:!0},showOnFocus:Boolean,onUpdateValue:[Function,Array],onBlur:[Function,Array],onClear:[Function,Array],onFocus:[Function,Array],onScroll:[Function,Array],onSearch:[Function,Array],onUpdateShow:[Function,Array],"onUpdate:show":[Function,Array],displayDirective:{type:String,default:"show"},resetMenuOnOptionsChange:{type:Boolean,default:!0},status:String,showCheckmark:{type:Boolean,default:!0},onChange:[Function,Array],items:Array}),Qt=be({name:"Select",props:Ut,slots:Object,setup(e){const{mergedClsPrefixRef:r,mergedBorderedRef:s,namespaceRef:d,inlineThemeDisabled:u}=ln(e),v=Oe("Select","-select",Kt,Wt,e,r),f=M(e.defaultValue),i=j(e,"value"),C=un(i,f),z=M(!1),p=M(""),_=ut(e,["items","options"]),O=M([]),w=M([]),b=I(()=>w.value.concat(O.value).concat(_.value)),k=I(()=>{const{filter:n}=e;if(n)return n;const{labelField:l,valueField:g}=e;return(F,x)=>{if(!x)return!1;const m=x[l];if(typeof m=="string")return Xe(F,m);const y=x[g];return typeof y=="string"?Xe(F,y):typeof y=="number"?Xe(F,String(y)):!1}}),V=I(()=>{if(e.remote)return _.value;{const{value:n}=b,{value:l}=p;return!l.length||!e.filterable?n:Lt(n,k.value,l,e.childrenField)}}),T=I(()=>{const{valueField:n,childrenField:l}=e,g=Nt(n,l);return mt(V.value,g)}),S=I(()=>Vt(b.value,e.valueField,e.childrenField)),P=M(!1),B=un(j(e,"show"),P),A=M(null),U=M(null),W=M(null),{localeRef:oe}=Ct("Select"),ie=I(()=>{var n;return(n=e.placeholder)!==null&&n!==void 0?n:oe.value.placeholder}),J=[],Q=M(new Map),X=I(()=>{const{fallbackOption:n}=e;if(n===void 0){const{labelField:l,valueField:g}=e;return F=>({[l]:String(F),[g]:F})}return n===!1?!1:l=>Object.assign(n(l),{value:l})});function E(n){const l=e.remote,{value:g}=Q,{value:F}=S,{value:x}=X,m=[];return n.forEach(y=>{if(F.has(y))m.push(F.get(y));else if(l&&g.has(y))m.push(g.get(y));else if(x){const L=x(y);L&&m.push(L)}}),m}const Y=I(()=>{if(e.multiple){const{value:n}=C;return Array.isArray(n)?E(n):[]}return null}),ce=I(()=>{const{value:n}=C;return!e.multiple&&!Array.isArray(n)?n===null?null:E([n])[0]||null:null}),se=ct(e),{mergedSizeRef:Te,mergedDisabledRef:le,mergedStatusRef:me}=se;function K(n,l){const{onChange:g,"onUpdate:value":F,onUpdateValue:x}=e,{nTriggerFormChange:m,nTriggerFormInput:y}=se;g&&ne(g,n,l),x&&ne(x,n,l),F&&ne(F,n,l),f.value=n,m(),y()}function Z(n){const{onBlur:l}=e,{nTriggerFormBlur:g}=se;l&&ne(l,n),g()}function o(){const{onClear:n}=e;n&&ne(n)}function c(n){const{onFocus:l,showOnFocus:g}=e,{nTriggerFormFocus:F}=se;l&&ne(l,n),F(),g&&ae()}function D(n){const{onSearch:l}=e;l&&ne(l,n)}function re(n){const{onScroll:l}=e;l&&ne(l,n)}function we(){var n;const{remote:l,multiple:g}=e;if(l){const{value:F}=Q;if(g){const{valueField:x}=e;(n=Y.value)===null||n===void 0||n.forEach(m=>{F.set(m[x],m)})}else{const x=ce.value;x&&F.set(x[e.valueField],x)}}}function xe(n){const{onUpdateShow:l,"onUpdate:show":g}=e;l&&ne(l,n),g&&ne(g,n),P.value=n}function ae(){le.value||(xe(!0),P.value=!0,e.filterable&&De())}function q(){xe(!1)}function ye(){p.value="",w.value=J}const de=M(!1);function Re(){e.filterable&&(de.value=!0)}function Me(){e.filterable&&(de.value=!1,B.value||ye())}function Pe(){le.value||(B.value?e.filterable?De():q():ae())}function ze(n){var l,g;!((g=(l=W.value)===null||l===void 0?void 0:l.selfRef)===null||g===void 0)&&g.contains(n.relatedTarget)||(z.value=!1,Z(n),q())}function he(n){c(n),z.value=!0}function fe(){z.value=!0}function ke(n){var l;!((l=A.value)===null||l===void 0)&&l.$el.contains(n.relatedTarget)||(z.value=!1,Z(n),q())}function $e(){var n;(n=A.value)===null||n===void 0||n.focus(),q()}function _e(n){var l;B.value&&(!((l=A.value)===null||l===void 0)&&l.$el.contains(wt(n))||q())}function Ce(n){if(!Array.isArray(n))return[];if(X.value)return Array.from(n);{const{remote:l}=e,{value:g}=S;if(l){const{value:F}=Q;return n.filter(x=>g.has(x)||F.has(x))}else return n.filter(F=>g.has(F))}}function ve(n){H(n.rawNode)}function H(n){if(le.value)return;const{tag:l,remote:g,clearFilterAfterSelect:F,valueField:x}=e;if(l&&!g){const{value:m}=w,y=m[0]||null;if(y){const L=O.value;L.length?L.push(y):O.value=[y],w.value=J}}if(g&&Q.value.set(n[x],n),e.multiple){const m=Ce(C.value),y=m.findIndex(L=>L===n[x]);if(~y){if(m.splice(y,1),l&&!g){const L=t(n[x]);~L&&(O.value.splice(L,1),F&&(p.value=""))}}else m.push(n[x]),F&&(p.value="");K(m,E(m))}else{if(l&&!g){const m=t(n[x]);~m?O.value=[O.value[m]]:O.value=J}Ee(),q(),K(n[x],n)}}function t(n){return O.value.findIndex(g=>g[e.valueField]===n)}function h(n){B.value||ae();const{value:l}=n.target;p.value=l;const{tag:g,remote:F}=e;if(D(l),g&&!F){if(!l){w.value=J;return}const{onCreate:x}=e,m=x?x(l):{[e.labelField]:l,[e.valueField]:l},{valueField:y,labelField:L}=e;_.value.some(ee=>ee[y]===m[y]||ee[L]===m[L])||O.value.some(ee=>ee[y]===m[y]||ee[L]===m[L])?w.value=J:w.value=[m]}}function N(n){n.stopPropagation();const{multiple:l}=e;!l&&e.filterable&&q(),o(),l?K([],[]):K(null,null)}function je(n){!Be(n,"action")&&!Be(n,"empty")&&!Be(n,"header")&&n.preventDefault()}function We(n){re(n)}function Ae(n){var l,g,F,x,m;if(!e.keyboard){n.preventDefault();return}switch(n.key){case" ":if(e.filterable)break;n.preventDefault();case"Enter":if(!(!((l=A.value)===null||l===void 0)&&l.isComposing)){if(B.value){const y=(g=W.value)===null||g===void 0?void 0:g.getPendingTmNode();y?ve(y):e.filterable||(q(),Ee())}else if(ae(),e.tag&&de.value){const y=w.value[0];if(y){const L=y[e.valueField],{value:ee}=C;e.multiple&&Array.isArray(ee)&&ee.includes(L)||H(y)}}}n.preventDefault();break;case"ArrowUp":if(n.preventDefault(),e.loading)return;B.value&&((F=W.value)===null||F===void 0||F.prev());break;case"ArrowDown":if(n.preventDefault(),e.loading)return;B.value?(x=W.value)===null||x===void 0||x.next():ae();break;case"Escape":B.value&&(xt(n),q()),(m=A.value)===null||m===void 0||m.focus();break}}function Ee(){var n;(n=A.value)===null||n===void 0||n.focus()}function De(){var n;(n=A.value)===null||n===void 0||n.focusInput()}function Ke(){var n;B.value&&((n=U.value)===null||n===void 0||n.syncPosition())}we(),pe(j(e,"options"),we);const Ue={focus:()=>{var n;(n=A.value)===null||n===void 0||n.focus()},focusInput:()=>{var n;(n=A.value)===null||n===void 0||n.focusInput()},blur:()=>{var n;(n=A.value)===null||n===void 0||n.blur()},blurInput:()=>{var n;(n=A.value)===null||n===void 0||n.blurInput()}},Ne=I(()=>{const{self:{menuBoxShadow:n}}=v.value;return{"--n-menu-box-shadow":n}}),ue=u?rn("select",void 0,Ne,e):void 0;return Object.assign(Object.assign({},Ue),{mergedStatus:me,mergedClsPrefix:r,mergedBordered:s,namespace:d,treeMate:T,isMounted:ht(),triggerRef:A,menuRef:W,pattern:p,uncontrolledShow:P,mergedShow:B,adjustedTo:Ze(e),uncontrolledValue:f,mergedValue:C,followerRef:U,localizedPlaceholder:ie,selectedOption:ce,selectedOptions:Y,mergedSize:Te,mergedDisabled:le,focused:z,activeWithoutMenuOpen:de,inlineThemeDisabled:u,onTriggerInputFocus:Re,onTriggerInputBlur:Me,handleTriggerOrMenuResize:Ke,handleMenuFocus:fe,handleMenuBlur:ke,handleMenuTabOut:$e,handleTriggerClick:Pe,handleToggle:ve,handleDeleteOption:H,handlePatternInput:h,handleClear:N,handleTriggerBlur:ze,handleTriggerFocus:he,handleKeydown:Ae,handleMenuAfterLeave:ye,handleMenuClickOutside:_e,handleMenuScroll:We,handleMenuKeydown:Ae,handleMenuMousedown:je,mergedTheme:v,cssVars:u?void 0:Ne,themeClass:ue==null?void 0:ue.themeClass,onRender:ue==null?void 0:ue.onRender})},render(){return a("div",{class:`${this.mergedClsPrefix}-select`},a(ft,null,{default:()=>[a(vt,null,{default:()=>a(Dt,{ref:"triggerRef",inlineThemeDisabled:this.inlineThemeDisabled,status:this.mergedStatus,inputProps:this.inputProps,clsPrefix:this.mergedClsPrefix,showArrow:this.showArrow,maxTagCount:this.maxTagCount,ellipsisTagPopoverProps:this.ellipsisTagPopoverProps,bordered:this.mergedBordered,active:this.activeWithoutMenuOpen||this.mergedShow,pattern:this.pattern,placeholder:this.localizedPlaceholder,selectedOption:this.selectedOption,selectedOptions:this.selectedOptions,multiple:this.multiple,renderTag:this.renderTag,renderLabel:this.renderLabel,filterable:this.filterable,clearable:this.clearable,disabled:this.mergedDisabled,size:this.mergedSize,theme:this.mergedTheme.peers.InternalSelection,labelField:this.labelField,valueField:this.valueField,themeOverrides:this.mergedTheme.peerOverrides.InternalSelection,loading:this.loading,focused:this.focused,onClick:this.handleTriggerClick,onDeleteOption:this.handleDeleteOption,onPatternInput:this.handlePatternInput,onClear:this.handleClear,onBlur:this.handleTriggerBlur,onFocus:this.handleTriggerFocus,onKeydown:this.handleKeydown,onPatternBlur:this.onTriggerInputBlur,onPatternFocus:this.onTriggerInputFocus,onResize:this.handleTriggerOrMenuResize,ignoreComposition:this.ignoreComposition},{arrow:()=>{var e,r;return[(r=(e=this.$slots).arrow)===null||r===void 0?void 0:r.call(e)]}})}),a(gt,{ref:"followerRef",show:this.mergedShow,to:this.adjustedTo,teleportDisabled:this.adjustedTo===Ze.tdkey,containerClass:this.namespace,width:this.consistentMenuWidth?"target":void 0,minWidth:"target",placement:this.placement},{default:()=>a(bn,{name:"fade-in-scale-up-transition",appear:this.isMounted,onAfterLeave:this.handleMenuAfterLeave},{default:()=>{var e,r,s;return this.mergedShow||this.displayDirective==="show"?((e=this.onRender)===null||e===void 0||e.call(this),pt(a(_t,Object.assign({},this.menuProps,{ref:"menuRef",onResize:this.handleTriggerOrMenuResize,inlineThemeDisabled:this.inlineThemeDisabled,virtualScroll:this.consistentMenuWidth&&this.virtualScroll,class:[`${this.mergedClsPrefix}-select-menu`,this.themeClass,(r=this.menuProps)===null||r===void 0?void 0:r.class],clsPrefix:this.mergedClsPrefix,focusable:!0,labelField:this.labelField,valueField:this.valueField,autoPending:!0,nodeProps:this.nodeProps,theme:this.mergedTheme.peers.InternalSelectMenu,themeOverrides:this.mergedTheme.peerOverrides.InternalSelectMenu,treeMate:this.treeMate,multiple:this.multiple,size:this.menuSize,renderOption:this.renderOption,renderLabel:this.renderLabel,value:this.mergedValue,style:[(s=this.menuProps)===null||s===void 0?void 0:s.style,this.cssVars],onToggle:this.handleToggle,onScroll:this.handleMenuScroll,onFocus:this.handleMenuFocus,onBlur:this.handleMenuBlur,onKeydown:this.handleMenuKeydown,onTabOut:this.handleMenuTabOut,onMousedown:this.handleMenuMousedown,show:this.mergedShow,showCheckmark:this.showCheckmark,resetMenuOnOptionsChange:this.resetMenuOnOptionsChange}),{empty:()=>{var d,u;return[(u=(d=this.$slots).empty)===null||u===void 0?void 0:u.call(d)]},header:()=>{var d,u;return[(u=(d=this.$slots).header)===null||u===void 0?void 0:u.call(d)]},action:()=>{var d,u;return[(u=(d=this.$slots).action)===null||u===void 0?void 0:u.call(d)]}}),this.displayDirective==="show"?[[bt,this.mergedShow],[cn,this.handleMenuClickOutside,void 0,{capture:!0}]]:[[cn,this.handleMenuClickOutside,void 0,{capture:!0}]])):null}})})]}))}});export{_t as N,Qt as a,Nt as c,Cn as i,Qe as m,Wt as s};
