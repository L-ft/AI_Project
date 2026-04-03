import{C as en,bP as qe,B as be,an as gn,d as ue,z as a,J as nn,l as tn,a9 as Jn,M as pn,bj as Fe,bQ as on,as as Ge,a4 as Xn,aE as bn,n as R,p as _,_ as G,H as te,$ as Xe,ay as mn,s as Oe,q as ln,v as wn,O as j,r as M,x as B,T as an,y as rn,A as sn,ak as Zn,am as et,a2 as nt,bw as tt,E as xn,ac as ot,a6 as pe,bn as Be,Q as Ie,bR as it,K as lt,b9 as Se,a1 as rt,bS as at,F as Qe,bT as dn,Y as st,a3 as dt,a0 as cn,bl as ct,aF as ut,bK as ht,a5 as Ze,bU as ft,bV as vt,bW as gt,aQ as pt,b3 as bt,bF as un,P as mt,bX as wt,bY as xt,R as ne,o as yt,c as Ct,a as St}from"./index-3d630a95.js";import{a as Ft,u as Ot}from"./Input-a9260569.js";import{e as Tt,V as Rt,N as Mt}from"./Empty-c4932958.js";function yn(e,l){l&&(en(()=>{const{value:s}=e;s&&qe.registerHandler(s,l)}),be(e,(s,d)=>{d&&qe.unregisterHandler(d)},{deep:!1}),gn(()=>{const{value:s}=e;s&&qe.unregisterHandler(s)}))}function hn(e){switch(typeof e){case"string":return e||void 0;case"number":return String(e);default:return}}function Ye(e){const l=e.filter(s=>s!==void 0);if(l.length!==0)return l.length===1?l[0]:s=>{e.forEach(d=>{d&&d(s)})}}const Pt=ue({name:"Checkmark",render(){return a("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16"},a("g",{fill:"none"},a("path",{d:"M14.046 3.486a.75.75 0 0 1-.032 1.06l-7.93 7.474a.85.85 0 0 1-1.188-.022l-2.68-2.72a.75.75 0 1 1 1.068-1.053l2.234 2.267l7.468-7.038a.75.75 0 0 1 1.06.032z",fill:"currentColor"})))}}),zt=ue({props:{onFocus:Function,onBlur:Function},setup(e){return()=>a("div",{style:"width: 0; height: 0",tabindex:0,onFocus:e.onFocus,onBlur:e.onBlur})}}),kt={height:"calc(var(--n-option-height) * 7.6)",paddingTiny:"4px 0",paddingSmall:"4px 0",paddingMedium:"4px 0",paddingLarge:"4px 0",paddingHuge:"4px 0",optionPaddingTiny:"0 12px",optionPaddingSmall:"0 12px",optionPaddingMedium:"0 12px",optionPaddingLarge:"0 12px",optionPaddingHuge:"0 12px",loadingSize:"18px"};function _t(e){const{borderRadius:l,popoverColor:s,textColor3:d,dividerColor:c,textColor2:v,primaryColorPressed:f,textColorDisabled:i,primaryColor:C,opacityDisabled:z,hoverColor:p,fontSizeTiny:$,fontSizeSmall:O,fontSizeMedium:w,fontSizeLarge:b,fontSizeHuge:k,heightTiny:V,heightSmall:T,heightMedium:S,heightLarge:P,heightHuge:I}=e;return Object.assign(Object.assign({},kt),{optionFontSizeTiny:$,optionFontSizeSmall:O,optionFontSizeMedium:w,optionFontSizeLarge:b,optionFontSizeHuge:k,optionHeightTiny:V,optionHeightSmall:T,optionHeightMedium:S,optionHeightLarge:P,optionHeightHuge:I,borderRadius:l,color:s,groupHeaderTextColor:d,actionDividerColor:c,optionTextColor:v,optionTextColorPressed:f,optionTextColorDisabled:i,optionTextColorActive:C,optionOpacityDisabled:z,optionCheckColor:C,optionColorPending:p,optionColorActive:"rgba(0, 0, 0, 0)",optionColorActivePending:p,actionTextColor:v,loadingColor:C})}const $t=nn({name:"InternalSelectMenu",common:tn,peers:{Scrollbar:Jn,Empty:Tt},self:_t}),Cn=$t,fn=ue({name:"NBaseSelectGroupHeader",props:{clsPrefix:{type:String,required:!0},tmNode:{type:Object,required:!0}},setup(){const{renderLabelRef:e,renderOptionRef:l,labelFieldRef:s,nodePropsRef:d}=pn(on);return{labelField:s,nodeProps:d,renderLabel:e,renderOption:l}},render(){const{clsPrefix:e,renderLabel:l,renderOption:s,nodeProps:d,tmNode:{rawNode:c}}=this,v=d==null?void 0:d(c),f=l?l(c,!1):Fe(c[this.labelField],c,!1),i=a("div",Object.assign({},v,{class:[`${e}-base-select-group-header`,v==null?void 0:v.class]}),f);return c.render?c.render({node:i,option:c}):s?s({node:i,option:c,selected:!1}):i}});function Bt(e,l){return a(bn,{name:"fade-in-scale-up-transition"},{default:()=>e?a(Xn,{clsPrefix:l,class:`${l}-base-select-option__check`},{default:()=>a(Pt)}):null})}const vn=ue({name:"NBaseSelectOption",props:{clsPrefix:{type:String,required:!0},tmNode:{type:Object,required:!0}},setup(e){const{valueRef:l,pendingTmNodeRef:s,multipleRef:d,valueSetRef:c,renderLabelRef:v,renderOptionRef:f,labelFieldRef:i,valueFieldRef:C,showCheckmarkRef:z,nodePropsRef:p,handleOptionClick:$,handleOptionMouseEnter:O}=pn(on),w=Ge(()=>{const{value:T}=s;return T?e.tmNode.key===T.key:!1});function b(T){const{tmNode:S}=e;S.disabled||$(T,S)}function k(T){const{tmNode:S}=e;S.disabled||O(T,S)}function V(T){const{tmNode:S}=e,{value:P}=w;S.disabled||P||O(T,S)}return{multiple:d,isGrouped:Ge(()=>{const{tmNode:T}=e,{parent:S}=T;return S&&S.rawNode.type==="group"}),showCheckmark:z,nodeProps:p,isPending:w,isSelected:Ge(()=>{const{value:T}=l,{value:S}=d;if(T===null)return!1;const P=e.tmNode.rawNode[C.value];if(S){const{value:I}=c;return I.has(P)}else return T===P}),labelField:i,renderLabel:v,renderOption:f,handleMouseMove:V,handleMouseEnter:k,handleClick:b}},render(){const{clsPrefix:e,tmNode:{rawNode:l},isSelected:s,isPending:d,isGrouped:c,showCheckmark:v,nodeProps:f,renderOption:i,renderLabel:C,handleClick:z,handleMouseEnter:p,handleMouseMove:$}=this,O=Bt(s,e),w=C?[C(l,s),v&&O]:[Fe(l[this.labelField],l,s),v&&O],b=f==null?void 0:f(l),k=a("div",Object.assign({},b,{class:[`${e}-base-select-option`,l.class,b==null?void 0:b.class,{[`${e}-base-select-option--disabled`]:l.disabled,[`${e}-base-select-option--selected`]:s,[`${e}-base-select-option--grouped`]:c,[`${e}-base-select-option--pending`]:d,[`${e}-base-select-option--show-checkmark`]:v}],style:[(b==null?void 0:b.style)||"",l.style||""],onClick:Ye([z,b==null?void 0:b.onClick]),onMouseenter:Ye([p,b==null?void 0:b.onMouseenter]),onMousemove:Ye([$,b==null?void 0:b.onMousemove])}),a("div",{class:`${e}-base-select-option__content`},w));return l.render?l.render({node:k,option:l,selected:s}):i?i({node:k,option:l,selected:s}):k}}),It=R("base-select-menu",`
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
 `,[_("content",`
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
 `),_("loading, empty",`
 display: flex;
 padding: 12px 32px;
 flex: 1;
 justify-content: center;
 `),_("loading",`
 color: var(--n-loading-color);
 font-size: var(--n-loading-size);
 `),_("header",`
 padding: 8px var(--n-option-padding-left);
 font-size: var(--n-option-font-size);
 transition: 
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 border-bottom: 1px solid var(--n-action-divider-color);
 color: var(--n-action-text-color);
 `),_("action",`
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
 `,[Xe("selected",`
 color: var(--n-option-text-color-disabled);
 `),G("selected",`
 opacity: var(--n-option-opacity-disabled);
 `)]),_("check",`
 font-size: 16px;
 position: absolute;
 right: calc(var(--n-option-padding-right) - 4px);
 top: calc(50% - 7px);
 color: var(--n-option-check-color);
 transition: color .3s var(--n-bezier);
 `,[mn({enterScale:"0.5"})])])]),At=ue({name:"InternalSelectMenu",props:Object.assign(Object.assign({},Oe.props),{clsPrefix:{type:String,required:!0},scrollable:{type:Boolean,default:!0},treeMate:{type:Object,required:!0},multiple:Boolean,size:{type:String,default:"medium"},value:{type:[String,Number,Array],default:null},autoPending:Boolean,virtualScroll:{type:Boolean,default:!0},show:{type:Boolean,default:!0},labelField:{type:String,default:"label"},valueField:{type:String,default:"value"},loading:Boolean,focusable:Boolean,renderLabel:Function,renderOption:Function,nodeProps:Function,showCheckmark:{type:Boolean,default:!0},onMousedown:Function,onScroll:Function,onFocus:Function,onBlur:Function,onKeyup:Function,onKeydown:Function,onTabOut:Function,onMouseenter:Function,onMouseleave:Function,onResize:Function,resetMenuOnOptionsChange:{type:Boolean,default:!0},inlineThemeDisabled:Boolean,onToggle:Function}),setup(e){const{mergedClsPrefixRef:l,mergedRtlRef:s}=ln(e),d=wn("InternalSelectMenu",s,l),c=Oe("InternalSelectMenu","-internal-select-menu",It,Cn,e,j(e,"clsPrefix")),v=M(null),f=M(null),i=M(null),C=B(()=>e.treeMate.getFlattenedNodes()),z=B(()=>tt(C.value)),p=M(null);function $(){const{treeMate:o}=e;let u=null;const{value:D}=e;D===null?u=o.getFirstAvailableNode():(e.multiple?u=o.getNode((D||[])[(D||[]).length-1]):u=o.getNode(D),(!u||u.disabled)&&(u=o.getFirstAvailableNode())),X(u||null)}function O(){const{value:o}=p;o&&!e.treeMate.getNode(o.key)&&(p.value=null)}let w;be(()=>e.show,o=>{o?w=be(()=>e.treeMate,()=>{e.resetMenuOnOptionsChange?(e.autoPending?$():O(),xn(he)):O()},{immediate:!0}):w==null||w()},{immediate:!0}),gn(()=>{w==null||w()});const b=B(()=>ot(c.value.self[pe("optionHeight",e.size)])),k=B(()=>Be(c.value.self[pe("padding",e.size)])),V=B(()=>e.multiple&&Array.isArray(e.value)?new Set(e.value):new Set),T=B(()=>{const o=C.value;return o&&o.length===0});function S(o){const{onToggle:u}=e;u&&u(o)}function P(o){const{onScroll:u}=e;u&&u(o)}function I(o){var u;(u=i.value)===null||u===void 0||u.sync(),P(o)}function A(){var o;(o=i.value)===null||o===void 0||o.sync()}function U(){const{value:o}=p;return o||null}function W(o,u){u.disabled||X(u,!1)}function oe(o,u){u.disabled||S(u)}function ie(o){var u;Ie(o,"action")||(u=e.onKeyup)===null||u===void 0||u.call(e,o)}function Q(o){var u;Ie(o,"action")||(u=e.onKeydown)===null||u===void 0||u.call(e,o)}function Y(o){var u;(u=e.onMousedown)===null||u===void 0||u.call(e,o),!e.focusable&&o.preventDefault()}function J(){const{value:o}=p;o&&X(o.getNext({loop:!0}),!0)}function E(){const{value:o}=p;o&&X(o.getPrev({loop:!0}),!0)}function X(o,u=!1){p.value=o,u&&he()}function he(){var o,u;const D=p.value;if(!D)return;const re=z.value(D.key);re!==null&&(e.virtualScroll?(o=f.value)===null||o===void 0||o.scrollTo({index:re}):(u=i.value)===null||u===void 0||u.scrollTo({index:re,elSize:b.value}))}function se(o){var u,D;!((u=v.value)===null||u===void 0)&&u.contains(o.target)&&((D=e.onFocus)===null||D===void 0||D.call(e,o))}function Te(o){var u,D;!((u=v.value)===null||u===void 0)&&u.contains(o.relatedTarget)||(D=e.onBlur)===null||D===void 0||D.call(e,o)}an(on,{handleOptionMouseEnter:W,handleOptionClick:oe,valueSetRef:V,pendingTmNodeRef:p,nodePropsRef:j(e,"nodeProps"),showCheckmarkRef:j(e,"showCheckmark"),multipleRef:j(e,"multiple"),valueRef:j(e,"value"),renderLabelRef:j(e,"renderLabel"),renderOptionRef:j(e,"renderOption"),labelFieldRef:j(e,"labelField"),valueFieldRef:j(e,"valueField")}),an(it,v),en(()=>{const{value:o}=i;o&&o.sync()});const le=B(()=>{const{size:o}=e,{common:{cubicBezierEaseInOut:u},self:{height:D,borderRadius:re,color:we,groupHeaderTextColor:xe,actionDividerColor:ae,optionTextColorPressed:q,optionTextColor:ye,optionTextColorDisabled:de,optionTextColorActive:Re,optionOpacityDisabled:Me,optionCheckColor:Pe,actionTextColor:ze,optionColorPending:fe,optionColorActive:ve,loadingColor:ke,loadingSize:_e,optionColorActivePending:$e,[pe("optionFontSize",o)]:Ce,[pe("optionHeight",o)]:ge,[pe("optionPadding",o)]:H}}=c.value;return{"--n-height":D,"--n-action-divider-color":ae,"--n-action-text-color":ze,"--n-bezier":u,"--n-border-radius":re,"--n-color":we,"--n-option-font-size":Ce,"--n-group-header-text-color":xe,"--n-option-check-color":Pe,"--n-option-color-pending":fe,"--n-option-color-active":ve,"--n-option-color-active-pending":$e,"--n-option-height":ge,"--n-option-opacity-disabled":Me,"--n-option-text-color":ye,"--n-option-text-color-active":Re,"--n-option-text-color-disabled":de,"--n-option-text-color-pressed":q,"--n-option-padding":H,"--n-option-padding-left":Be(H,"left"),"--n-option-padding-right":Be(H,"right"),"--n-loading-color":ke,"--n-loading-size":_e}}),{inlineThemeDisabled:me}=e,K=me?rn("internal-select-menu",B(()=>e.size[0]),le,e):void 0,Z={selfRef:v,next:J,prev:E,getPendingTmNode:U};return yn(v,e.onResize),Object.assign({mergedTheme:c,mergedClsPrefix:l,rtlEnabled:d,virtualListRef:f,scrollbarRef:i,itemSize:b,padding:k,flattenedNodes:C,empty:T,virtualListContainer(){const{value:o}=f;return o==null?void 0:o.listElRef},virtualListContent(){const{value:o}=f;return o==null?void 0:o.itemsElRef},doScroll:P,handleFocusin:se,handleFocusout:Te,handleKeyUp:ie,handleKeyDown:Q,handleMouseDown:Y,handleVirtualListResize:A,handleVirtualListScroll:I,cssVars:me?void 0:le,themeClass:K==null?void 0:K.themeClass,onRender:K==null?void 0:K.onRender},Z)},render(){const{$slots:e,virtualScroll:l,clsPrefix:s,mergedTheme:d,themeClass:c,onRender:v}=this;return v==null||v(),a("div",{ref:"selfRef",tabindex:this.focusable?0:-1,class:[`${s}-base-select-menu`,this.rtlEnabled&&`${s}-base-select-menu--rtl`,c,this.multiple&&`${s}-base-select-menu--multiple`],style:this.cssVars,onFocusin:this.handleFocusin,onFocusout:this.handleFocusout,onKeyup:this.handleKeyUp,onKeydown:this.handleKeyDown,onMousedown:this.handleMouseDown,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},sn(e.header,f=>f&&a("div",{class:`${s}-base-select-menu__header`,"data-header":!0,key:"header"},f)),this.loading?a("div",{class:`${s}-base-select-menu__loading`},a(Zn,{clsPrefix:s,strokeWidth:20})):this.empty?a("div",{class:`${s}-base-select-menu__empty`,"data-empty":!0},nt(e.empty,()=>[a(Mt,{theme:d.peers.Empty,themeOverrides:d.peerOverrides.Empty,size:this.size})])):a(et,{ref:"scrollbarRef",theme:d.peers.Scrollbar,themeOverrides:d.peerOverrides.Scrollbar,scrollable:this.scrollable,container:l?this.virtualListContainer:void 0,content:l?this.virtualListContent:void 0,onScroll:l?void 0:this.doScroll},{default:()=>l?a(Rt,{ref:"virtualListRef",class:`${s}-virtual-list`,items:this.flattenedNodes,itemSize:this.itemSize,showScrollbar:!1,paddingTop:this.padding.top,paddingBottom:this.padding.bottom,onResize:this.handleVirtualListResize,onScroll:this.handleVirtualListScroll,itemResizable:!0},{default:({item:f})=>f.isGroup?a(fn,{key:f.key,clsPrefix:s,tmNode:f}):f.ignored?null:a(vn,{clsPrefix:s,key:f.key,tmNode:f})}):a("div",{class:`${s}-base-select-menu-option-wrapper`,style:{paddingTop:this.padding.top,paddingBottom:this.padding.bottom}},this.flattenedNodes.map(f=>f.isGroup?a(fn,{key:f.key,clsPrefix:s,tmNode:f}):a(vn,{clsPrefix:s,key:f.key,tmNode:f})))}),sn(e.action,f=>f&&[a("div",{class:`${s}-base-select-menu__action`,"data-action":!0,key:"action"},f),a(zt,{onFocus:this.onTabOut,key:"focus-detector"})]))}}),Et={paddingSingle:"0 26px 0 12px",paddingMultiple:"3px 26px 0 12px",clearSize:"16px",arrowSize:"16px"};function Dt(e){const{borderRadius:l,textColor2:s,textColorDisabled:d,inputColor:c,inputColorDisabled:v,primaryColor:f,primaryColorHover:i,warningColor:C,warningColorHover:z,errorColor:p,errorColorHover:$,borderColor:O,iconColor:w,iconColorDisabled:b,clearColor:k,clearColorHover:V,clearColorPressed:T,placeholderColor:S,placeholderColorDisabled:P,fontSizeTiny:I,fontSizeSmall:A,fontSizeMedium:U,fontSizeLarge:W,heightTiny:oe,heightSmall:ie,heightMedium:Q,heightLarge:Y,fontWeight:J}=e;return Object.assign(Object.assign({},Et),{fontSizeTiny:I,fontSizeSmall:A,fontSizeMedium:U,fontSizeLarge:W,heightTiny:oe,heightSmall:ie,heightMedium:Q,heightLarge:Y,borderRadius:l,fontWeight:J,textColor:s,textColorDisabled:d,placeholderColor:S,placeholderColorDisabled:P,color:c,colorDisabled:v,colorActive:c,border:`1px solid ${O}`,borderHover:`1px solid ${i}`,borderActive:`1px solid ${f}`,borderFocus:`1px solid ${i}`,boxShadowHover:"none",boxShadowActive:`0 0 0 2px ${Se(f,{alpha:.2})}`,boxShadowFocus:`0 0 0 2px ${Se(f,{alpha:.2})}`,caretColor:f,arrowColor:w,arrowColorDisabled:b,loadingColor:f,borderWarning:`1px solid ${C}`,borderHoverWarning:`1px solid ${z}`,borderActiveWarning:`1px solid ${C}`,borderFocusWarning:`1px solid ${z}`,boxShadowHoverWarning:"none",boxShadowActiveWarning:`0 0 0 2px ${Se(C,{alpha:.2})}`,boxShadowFocusWarning:`0 0 0 2px ${Se(C,{alpha:.2})}`,colorActiveWarning:c,caretColorWarning:C,borderError:`1px solid ${p}`,borderHoverError:`1px solid ${$}`,borderActiveError:`1px solid ${p}`,borderFocusError:`1px solid ${$}`,boxShadowHoverError:"none",boxShadowActiveError:`0 0 0 2px ${Se(p,{alpha:.2})}`,boxShadowFocusError:`0 0 0 2px ${Se(p,{alpha:.2})}`,colorActiveError:c,caretColorError:p,clearColor:k,clearColorHover:V,clearColorPressed:T})}const Nt=nn({name:"InternalSelection",common:tn,peers:{Popover:lt},self:Dt}),Sn=Nt,Lt=te([R("base-selection",`
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
 `),R("base-selection-tags","min-height: var(--n-height);"),_("border, state-border",`
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
 `),_("state-border",`
 z-index: 1;
 border-color: #0000;
 `),R("base-suffix",`
 cursor: pointer;
 position: absolute;
 top: 50%;
 transform: translateY(-50%);
 right: 10px;
 `,[_("arrow",`
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
 `,[_("wrapper",`
 flex-basis: 0;
 flex-grow: 1;
 overflow: hidden;
 text-overflow: ellipsis;
 `)]),R("base-selection-placeholder",`
 color: var(--n-placeholder-color);
 `,[_("inner",`
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
 `,[_("content",`
 text-overflow: ellipsis;
 overflow: hidden;
 white-space: nowrap; 
 `)]),_("render-label",`
 color: var(--n-text-color);
 `)]),Xe("disabled",[te("&:hover",[_("state-border",`
 box-shadow: var(--n-box-shadow-hover);
 border: var(--n-border-hover);
 `)]),G("focus",[_("state-border",`
 box-shadow: var(--n-box-shadow-focus);
 border: var(--n-border-focus);
 `)]),G("active",[_("state-border",`
 box-shadow: var(--n-box-shadow-active);
 border: var(--n-border-active);
 `),R("base-selection-label","background-color: var(--n-color-active);"),R("base-selection-tags","background-color: var(--n-color-active);")])]),G("disabled","cursor: not-allowed;",[_("arrow",`
 color: var(--n-arrow-color-disabled);
 `),R("base-selection-label",`
 cursor: not-allowed;
 background-color: var(--n-color-disabled);
 `,[R("base-selection-input",`
 cursor: not-allowed;
 color: var(--n-text-color-disabled);
 `),_("render-label",`
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
 `,[_("input",`
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
 `),_("mirror",`
 position: absolute;
 left: 0;
 top: 0;
 white-space: pre;
 visibility: hidden;
 user-select: none;
 -webkit-user-select: none;
 opacity: 0;
 `)]),["warning","error"].map(e=>G(`${e}-status`,[_("state-border",`border: var(--n-border-${e});`),Xe("disabled",[te("&:hover",[_("state-border",`
 box-shadow: var(--n-box-shadow-hover-${e});
 border: var(--n-border-hover-${e});
 `)]),G("active",[_("state-border",`
 box-shadow: var(--n-box-shadow-active-${e});
 border: var(--n-border-active-${e});
 `),R("base-selection-label",`background-color: var(--n-color-active-${e});`),R("base-selection-tags",`background-color: var(--n-color-active-${e});`)]),G("focus",[_("state-border",`
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
 `,[_("content",`
 line-height: 1.25;
 text-overflow: ellipsis;
 overflow: hidden;
 `)])])]),Vt=ue({name:"InternalSelection",props:Object.assign(Object.assign({},Oe.props),{clsPrefix:{type:String,required:!0},bordered:{type:Boolean,default:void 0},active:Boolean,pattern:{type:String,default:""},placeholder:String,selectedOption:{type:Object,default:null},selectedOptions:{type:Array,default:null},labelField:{type:String,default:"label"},valueField:{type:String,default:"value"},multiple:Boolean,filterable:Boolean,clearable:Boolean,disabled:Boolean,size:{type:String,default:"medium"},loading:Boolean,autofocus:Boolean,showArrow:{type:Boolean,default:!0},inputProps:Object,focused:Boolean,renderTag:Function,onKeydown:Function,onClick:Function,onBlur:Function,onFocus:Function,onDeleteOption:Function,maxTagCount:[String,Number],ellipsisTagPopoverProps:Object,onClear:Function,onPatternInput:Function,onPatternFocus:Function,onPatternBlur:Function,renderLabel:Function,status:String,inlineThemeDisabled:Boolean,ignoreComposition:{type:Boolean,default:!0},onResize:Function}),setup(e){const{mergedClsPrefixRef:l,mergedRtlRef:s}=ln(e),d=wn("InternalSelection",s,l),c=M(null),v=M(null),f=M(null),i=M(null),C=M(null),z=M(null),p=M(null),$=M(null),O=M(null),w=M(null),b=M(!1),k=M(!1),V=M(!1),T=Oe("InternalSelection","-internal-selection",Lt,Sn,e,j(e,"clsPrefix")),S=B(()=>e.clearable&&!e.disabled&&(V.value||e.active)),P=B(()=>e.selectedOption?e.renderTag?e.renderTag({option:e.selectedOption,handleClose:()=>{}}):e.renderLabel?e.renderLabel(e.selectedOption,!0):Fe(e.selectedOption[e.labelField],e.selectedOption,!0):e.placeholder),I=B(()=>{const t=e.selectedOption;if(t)return t[e.labelField]}),A=B(()=>e.multiple?!!(Array.isArray(e.selectedOptions)&&e.selectedOptions.length):e.selectedOption!==null);function U(){var t;const{value:h}=c;if(h){const{value:N}=v;N&&(N.style.width=`${h.offsetWidth}px`,e.maxTagCount!=="responsive"&&((t=O.value)===null||t===void 0||t.sync({showAllItemsBeforeCalculate:!1})))}}function W(){const{value:t}=w;t&&(t.style.display="none")}function oe(){const{value:t}=w;t&&(t.style.display="inline-block")}be(j(e,"active"),t=>{t||W()}),be(j(e,"pattern"),()=>{e.multiple&&xn(U)});function ie(t){const{onFocus:h}=e;h&&h(t)}function Q(t){const{onBlur:h}=e;h&&h(t)}function Y(t){const{onDeleteOption:h}=e;h&&h(t)}function J(t){const{onClear:h}=e;h&&h(t)}function E(t){const{onPatternInput:h}=e;h&&h(t)}function X(t){var h;(!t.relatedTarget||!(!((h=f.value)===null||h===void 0)&&h.contains(t.relatedTarget)))&&ie(t)}function he(t){var h;!((h=f.value)===null||h===void 0)&&h.contains(t.relatedTarget)||Q(t)}function se(t){J(t)}function Te(){V.value=!0}function le(){V.value=!1}function me(t){!e.active||!e.filterable||t.target!==v.value&&t.preventDefault()}function K(t){Y(t)}const Z=M(!1);function o(t){if(t.key==="Backspace"&&!Z.value&&!e.pattern.length){const{selectedOptions:h}=e;h!=null&&h.length&&K(h[h.length-1])}}let u=null;function D(t){const{value:h}=c;if(h){const N=t.target.value;h.textContent=N,U()}e.ignoreComposition&&Z.value?u=t:E(t)}function re(){Z.value=!0}function we(){Z.value=!1,e.ignoreComposition&&E(u),u=null}function xe(t){var h;k.value=!0,(h=e.onPatternFocus)===null||h===void 0||h.call(e,t)}function ae(t){var h;k.value=!1,(h=e.onPatternBlur)===null||h===void 0||h.call(e,t)}function q(){var t,h;if(e.filterable)k.value=!1,(t=z.value)===null||t===void 0||t.blur(),(h=v.value)===null||h===void 0||h.blur();else if(e.multiple){const{value:N}=i;N==null||N.blur()}else{const{value:N}=C;N==null||N.blur()}}function ye(){var t,h,N;e.filterable?(k.value=!1,(t=z.value)===null||t===void 0||t.focus()):e.multiple?(h=i.value)===null||h===void 0||h.focus():(N=C.value)===null||N===void 0||N.focus()}function de(){const{value:t}=v;t&&(oe(),t.focus())}function Re(){const{value:t}=v;t&&t.blur()}function Me(t){const{value:h}=p;h&&h.setTextContent(`+${t}`)}function Pe(){const{value:t}=$;return t}function ze(){return v.value}let fe=null;function ve(){fe!==null&&window.clearTimeout(fe)}function ke(){e.active||(ve(),fe=window.setTimeout(()=>{A.value&&(b.value=!0)},100))}function _e(){ve()}function $e(t){t||(ve(),b.value=!1)}be(A,t=>{t||(b.value=!1)}),en(()=>{rt(()=>{const t=z.value;t&&(e.disabled?t.removeAttribute("tabindex"):t.tabIndex=k.value?-1:0)})}),yn(f,e.onResize);const{inlineThemeDisabled:Ce}=e,ge=B(()=>{const{size:t}=e,{common:{cubicBezierEaseInOut:h},self:{fontWeight:N,borderRadius:je,color:We,placeholderColor:Ae,textColor:Ee,paddingSingle:De,paddingMultiple:Ke,caretColor:Ue,colorDisabled:Ne,textColorDisabled:ce,placeholderColorDisabled:n,colorActive:r,boxShadowFocus:g,boxShadowActive:F,boxShadowHover:x,border:m,borderFocus:y,borderHover:L,borderActive:ee,arrowColor:On,arrowColorDisabled:Tn,loadingColor:Rn,colorActiveWarning:Mn,boxShadowFocusWarning:Pn,boxShadowActiveWarning:zn,boxShadowHoverWarning:kn,borderWarning:_n,borderFocusWarning:$n,borderHoverWarning:Bn,borderActiveWarning:In,colorActiveError:An,boxShadowFocusError:En,boxShadowActiveError:Dn,boxShadowHoverError:Nn,borderError:Ln,borderFocusError:Vn,borderHoverError:Hn,borderActiveError:jn,clearColor:Wn,clearColorHover:Kn,clearColorPressed:Un,clearSize:qn,arrowSize:Gn,[pe("height",t)]:Qn,[pe("fontSize",t)]:Yn}}=T.value,Le=Be(De),Ve=Be(Ke);return{"--n-bezier":h,"--n-border":m,"--n-border-active":ee,"--n-border-focus":y,"--n-border-hover":L,"--n-border-radius":je,"--n-box-shadow-active":F,"--n-box-shadow-focus":g,"--n-box-shadow-hover":x,"--n-caret-color":Ue,"--n-color":We,"--n-color-active":r,"--n-color-disabled":Ne,"--n-font-size":Yn,"--n-height":Qn,"--n-padding-single-top":Le.top,"--n-padding-multiple-top":Ve.top,"--n-padding-single-right":Le.right,"--n-padding-multiple-right":Ve.right,"--n-padding-single-left":Le.left,"--n-padding-multiple-left":Ve.left,"--n-padding-single-bottom":Le.bottom,"--n-padding-multiple-bottom":Ve.bottom,"--n-placeholder-color":Ae,"--n-placeholder-color-disabled":n,"--n-text-color":Ee,"--n-text-color-disabled":ce,"--n-arrow-color":On,"--n-arrow-color-disabled":Tn,"--n-loading-color":Rn,"--n-color-active-warning":Mn,"--n-box-shadow-focus-warning":Pn,"--n-box-shadow-active-warning":zn,"--n-box-shadow-hover-warning":kn,"--n-border-warning":_n,"--n-border-focus-warning":$n,"--n-border-hover-warning":Bn,"--n-border-active-warning":In,"--n-color-active-error":An,"--n-box-shadow-focus-error":En,"--n-box-shadow-active-error":Dn,"--n-box-shadow-hover-error":Nn,"--n-border-error":Ln,"--n-border-focus-error":Vn,"--n-border-hover-error":Hn,"--n-border-active-error":jn,"--n-clear-size":qn,"--n-clear-color":Wn,"--n-clear-color-hover":Kn,"--n-clear-color-pressed":Un,"--n-arrow-size":Gn,"--n-font-weight":N}}),H=Ce?rn("internal-selection",B(()=>e.size[0]),ge,e):void 0;return{mergedTheme:T,mergedClearable:S,mergedClsPrefix:l,rtlEnabled:d,patternInputFocused:k,filterablePlaceholder:P,label:I,selected:A,showTagsPanel:b,isComposing:Z,counterRef:p,counterWrapperRef:$,patternInputMirrorRef:c,patternInputRef:v,selfRef:f,multipleElRef:i,singleElRef:C,patternInputWrapperRef:z,overflowRef:O,inputTagElRef:w,handleMouseDown:me,handleFocusin:X,handleClear:se,handleMouseEnter:Te,handleMouseLeave:le,handleDeleteOption:K,handlePatternKeyDown:o,handlePatternInputInput:D,handlePatternInputBlur:ae,handlePatternInputFocus:xe,handleMouseEnterCounter:ke,handleMouseLeaveCounter:_e,handleFocusout:he,handleCompositionEnd:we,handleCompositionStart:re,onPopoverUpdateShow:$e,focus:ye,focusInput:de,blur:q,blurInput:Re,updateCounter:Me,getCounter:Pe,getTail:ze,renderLabel:e.renderLabel,cssVars:Ce?void 0:ge,themeClass:H==null?void 0:H.themeClass,onRender:H==null?void 0:H.onRender}},render(){const{status:e,multiple:l,size:s,disabled:d,filterable:c,maxTagCount:v,bordered:f,clsPrefix:i,ellipsisTagPopoverProps:C,onRender:z,renderTag:p,renderLabel:$}=this;z==null||z();const O=v==="responsive",w=typeof v=="number",b=O||w,k=a(at,null,{default:()=>a(Ft,{clsPrefix:i,loading:this.loading,showArrow:this.showArrow,showClear:this.mergedClearable&&this.selected,onClear:this.handleClear},{default:()=>{var T,S;return(S=(T=this.$slots).arrow)===null||S===void 0?void 0:S.call(T)}})});let V;if(l){const{labelField:T}=this,S=E=>a("div",{class:`${i}-base-selection-tag-wrapper`,key:E.value},p?p({option:E,handleClose:()=>{this.handleDeleteOption(E)}}):a(Qe,{size:s,closable:!E.disabled,disabled:d,onClose:()=>{this.handleDeleteOption(E)},internalCloseIsButtonTag:!1,internalCloseFocusable:!1},{default:()=>$?$(E,!0):Fe(E[T],E,!0)})),P=()=>(w?this.selectedOptions.slice(0,v):this.selectedOptions).map(S),I=c?a("div",{class:`${i}-base-selection-input-tag`,ref:"inputTagElRef",key:"__input-tag__"},a("input",Object.assign({},this.inputProps,{ref:"patternInputRef",tabindex:-1,disabled:d,value:this.pattern,autofocus:this.autofocus,class:`${i}-base-selection-input-tag__input`,onBlur:this.handlePatternInputBlur,onFocus:this.handlePatternInputFocus,onKeydown:this.handlePatternKeyDown,onInput:this.handlePatternInputInput,onCompositionstart:this.handleCompositionStart,onCompositionend:this.handleCompositionEnd})),a("span",{ref:"patternInputMirrorRef",class:`${i}-base-selection-input-tag__mirror`},this.pattern)):null,A=O?()=>a("div",{class:`${i}-base-selection-tag-wrapper`,ref:"counterWrapperRef"},a(Qe,{size:s,ref:"counterRef",onMouseenter:this.handleMouseEnterCounter,onMouseleave:this.handleMouseLeaveCounter,disabled:d})):void 0;let U;if(w){const E=this.selectedOptions.length-v;E>0&&(U=a("div",{class:`${i}-base-selection-tag-wrapper`,key:"__counter__"},a(Qe,{size:s,ref:"counterRef",onMouseenter:this.handleMouseEnterCounter,disabled:d},{default:()=>`+${E}`})))}const W=O?c?a(dn,{ref:"overflowRef",updateCounter:this.updateCounter,getCounter:this.getCounter,getTail:this.getTail,style:{width:"100%",display:"flex",overflow:"hidden"}},{default:P,counter:A,tail:()=>I}):a(dn,{ref:"overflowRef",updateCounter:this.updateCounter,getCounter:this.getCounter,style:{width:"100%",display:"flex",overflow:"hidden"}},{default:P,counter:A}):w&&U?P().concat(U):P(),oe=b?()=>a("div",{class:`${i}-base-selection-popover`},O?P():this.selectedOptions.map(S)):void 0,ie=b?Object.assign({show:this.showTagsPanel,trigger:"hover",overlap:!0,placement:"top",width:"trigger",onUpdateShow:this.onPopoverUpdateShow,theme:this.mergedTheme.peers.Popover,themeOverrides:this.mergedTheme.peerOverrides.Popover},C):null,Y=(this.selected?!1:this.active?!this.pattern&&!this.isComposing:!0)?a("div",{class:`${i}-base-selection-placeholder ${i}-base-selection-overlay`},a("div",{class:`${i}-base-selection-placeholder__inner`},this.placeholder)):null,J=c?a("div",{ref:"patternInputWrapperRef",class:`${i}-base-selection-tags`},W,O?null:I,k):a("div",{ref:"multipleElRef",class:`${i}-base-selection-tags`,tabindex:d?void 0:0},W,k);V=a(dt,null,b?a(st,Object.assign({},ie,{scrollable:!0,style:"max-height: calc(var(--v-target-height) * 6.6);"}),{trigger:()=>J,default:oe}):J,Y)}else if(c){const T=this.pattern||this.isComposing,S=this.active?!T:!this.selected,P=this.active?!1:this.selected;V=a("div",{ref:"patternInputWrapperRef",class:`${i}-base-selection-label`,title:this.patternInputFocused?void 0:hn(this.label)},a("input",Object.assign({},this.inputProps,{ref:"patternInputRef",class:`${i}-base-selection-input`,value:this.active?this.pattern:"",placeholder:"",readonly:d,disabled:d,tabindex:-1,autofocus:this.autofocus,onFocus:this.handlePatternInputFocus,onBlur:this.handlePatternInputBlur,onInput:this.handlePatternInputInput,onCompositionstart:this.handleCompositionStart,onCompositionend:this.handleCompositionEnd})),P?a("div",{class:`${i}-base-selection-label__render-label ${i}-base-selection-overlay`,key:"input"},a("div",{class:`${i}-base-selection-overlay__wrapper`},p?p({option:this.selectedOption,handleClose:()=>{}}):$?$(this.selectedOption,!0):Fe(this.label,this.selectedOption,!0))):null,S?a("div",{class:`${i}-base-selection-placeholder ${i}-base-selection-overlay`,key:"placeholder"},a("div",{class:`${i}-base-selection-overlay__wrapper`},this.filterablePlaceholder)):null,k)}else V=a("div",{ref:"singleElRef",class:`${i}-base-selection-label`,tabindex:this.disabled?void 0:0},this.label!==void 0?a("div",{class:`${i}-base-selection-input`,title:hn(this.label),key:"input"},a("div",{class:`${i}-base-selection-input__content`},p?p({option:this.selectedOption,handleClose:()=>{}}):$?$(this.selectedOption,!0):Fe(this.label,this.selectedOption,!0))):a("div",{class:`${i}-base-selection-placeholder ${i}-base-selection-overlay`,key:"placeholder"},a("div",{class:`${i}-base-selection-placeholder__inner`},this.placeholder)),k);return a("div",{ref:"selfRef",class:[`${i}-base-selection`,this.rtlEnabled&&`${i}-base-selection--rtl`,this.themeClass,e&&`${i}-base-selection--${e}-status`,{[`${i}-base-selection--active`]:this.active,[`${i}-base-selection--selected`]:this.selected||this.active&&this.pattern,[`${i}-base-selection--disabled`]:this.disabled,[`${i}-base-selection--multiple`]:this.multiple,[`${i}-base-selection--focus`]:this.focused}],style:this.cssVars,onClick:this.onClick,onMouseenter:this.handleMouseEnter,onMouseleave:this.handleMouseLeave,onKeydown:this.onKeydown,onFocusin:this.handleFocusin,onFocusout:this.handleFocusout,onMousedown:this.handleMouseDown},V,f?a("div",{class:`${i}-base-selection__border`}):null,f?a("div",{class:`${i}-base-selection__state-border`}):null)}});function He(e){return e.type==="group"}function Fn(e){return e.type==="ignored"}function Je(e,l){try{return!!(1+l.toString().toLowerCase().indexOf(e.trim().toLowerCase()))}catch{return!1}}function Ht(e,l){return{getIsGroup:He,getIgnored:Fn,getKey(d){return He(d)?d.name||d.key||"key-required":d[e]},getChildren(d){return d[l]}}}function jt(e,l,s,d){if(!l)return e;function c(v){if(!Array.isArray(v))return[];const f=[];for(const i of v)if(He(i)){const C=c(i[d]);C.length&&f.push(Object.assign({},i,{[d]:C}))}else{if(Fn(i))continue;l(s,i)&&f.push(i)}return f}return c(e)}function Wt(e,l,s){const d=new Map;return e.forEach(c=>{He(c)?c[s].forEach(v=>{d.set(v[l],v)}):d.set(c[l],c)}),d}function Kt(e){const{boxShadow2:l}=e;return{menuBoxShadow:l}}const Ut=nn({name:"Select",common:tn,peers:{InternalSelection:Sn,InternalSelectMenu:Cn},self:Kt}),qt=Ut,Gt=te([R("select",`
 z-index: auto;
 outline: none;
 width: 100%;
 position: relative;
 font-weight: var(--n-font-weight);
 `),R("select-menu",`
 margin: 4px 0;
 box-shadow: var(--n-menu-box-shadow);
 `,[mn({originalTransition:"background-color .3s var(--n-bezier), box-shadow .3s var(--n-bezier)"})])]),Qt=Object.assign(Object.assign({},Oe.props),{to:Ze.propTo,bordered:{type:Boolean,default:void 0},clearable:Boolean,clearFilterAfterSelect:{type:Boolean,default:!0},options:{type:Array,default:()=>[]},defaultValue:{type:[String,Number,Array],default:null},keyboard:{type:Boolean,default:!0},value:[String,Number,Array],placeholder:String,menuProps:Object,multiple:Boolean,size:String,menuSize:{type:String},filterable:Boolean,disabled:{type:Boolean,default:void 0},remote:Boolean,loading:Boolean,filter:Function,placement:{type:String,default:"bottom-start"},widthMode:{type:String,default:"trigger"},tag:Boolean,onCreate:Function,fallbackOption:{type:[Function,Boolean],default:void 0},show:{type:Boolean,default:void 0},showArrow:{type:Boolean,default:!0},maxTagCount:[Number,String],ellipsisTagPopoverProps:Object,consistentMenuWidth:{type:Boolean,default:!0},virtualScroll:{type:Boolean,default:!0},labelField:{type:String,default:"label"},valueField:{type:String,default:"value"},childrenField:{type:String,default:"children"},renderLabel:Function,renderOption:Function,renderTag:Function,"onUpdate:value":[Function,Array],inputProps:Object,nodeProps:Function,ignoreComposition:{type:Boolean,default:!0},showOnFocus:Boolean,onUpdateValue:[Function,Array],onBlur:[Function,Array],onClear:[Function,Array],onFocus:[Function,Array],onScroll:[Function,Array],onSearch:[Function,Array],onUpdateShow:[Function,Array],"onUpdate:show":[Function,Array],displayDirective:{type:String,default:"show"},resetMenuOnOptionsChange:{type:Boolean,default:!0},status:String,showCheckmark:{type:Boolean,default:!0},onChange:[Function,Array],items:Array}),to=ue({name:"Select",props:Qt,slots:Object,setup(e){const{mergedClsPrefixRef:l,mergedBorderedRef:s,namespaceRef:d,inlineThemeDisabled:c}=ln(e),v=Oe("Select","-select",Gt,qt,e,l),f=M(e.defaultValue),i=j(e,"value"),C=cn(i,f),z=M(!1),p=M(""),$=ct(e,["items","options"]),O=M([]),w=M([]),b=B(()=>w.value.concat(O.value).concat($.value)),k=B(()=>{const{filter:n}=e;if(n)return n;const{labelField:r,valueField:g}=e;return(F,x)=>{if(!x)return!1;const m=x[r];if(typeof m=="string")return Je(F,m);const y=x[g];return typeof y=="string"?Je(F,y):typeof y=="number"?Je(F,String(y)):!1}}),V=B(()=>{if(e.remote)return $.value;{const{value:n}=b,{value:r}=p;return!r.length||!e.filterable?n:jt(n,k.value,r,e.childrenField)}}),T=B(()=>{const{valueField:n,childrenField:r}=e,g=Ht(n,r);return mt(V.value,g)}),S=B(()=>Wt(b.value,e.valueField,e.childrenField)),P=M(!1),I=cn(j(e,"show"),P),A=M(null),U=M(null),W=M(null),{localeRef:oe}=Ot("Select"),ie=B(()=>{var n;return(n=e.placeholder)!==null&&n!==void 0?n:oe.value.placeholder}),Q=[],Y=M(new Map),J=B(()=>{const{fallbackOption:n}=e;if(n===void 0){const{labelField:r,valueField:g}=e;return F=>({[r]:String(F),[g]:F})}return n===!1?!1:r=>Object.assign(n(r),{value:r})});function E(n){const r=e.remote,{value:g}=Y,{value:F}=S,{value:x}=J,m=[];return n.forEach(y=>{if(F.has(y))m.push(F.get(y));else if(r&&g.has(y))m.push(g.get(y));else if(x){const L=x(y);L&&m.push(L)}}),m}const X=B(()=>{if(e.multiple){const{value:n}=C;return Array.isArray(n)?E(n):[]}return null}),he=B(()=>{const{value:n}=C;return!e.multiple&&!Array.isArray(n)?n===null?null:E([n])[0]||null:null}),se=ut(e),{mergedSizeRef:Te,mergedDisabledRef:le,mergedStatusRef:me}=se;function K(n,r){const{onChange:g,"onUpdate:value":F,onUpdateValue:x}=e,{nTriggerFormChange:m,nTriggerFormInput:y}=se;g&&ne(g,n,r),x&&ne(x,n,r),F&&ne(F,n,r),f.value=n,m(),y()}function Z(n){const{onBlur:r}=e,{nTriggerFormBlur:g}=se;r&&ne(r,n),g()}function o(){const{onClear:n}=e;n&&ne(n)}function u(n){const{onFocus:r,showOnFocus:g}=e,{nTriggerFormFocus:F}=se;r&&ne(r,n),F(),g&&ae()}function D(n){const{onSearch:r}=e;r&&ne(r,n)}function re(n){const{onScroll:r}=e;r&&ne(r,n)}function we(){var n;const{remote:r,multiple:g}=e;if(r){const{value:F}=Y;if(g){const{valueField:x}=e;(n=X.value)===null||n===void 0||n.forEach(m=>{F.set(m[x],m)})}else{const x=he.value;x&&F.set(x[e.valueField],x)}}}function xe(n){const{onUpdateShow:r,"onUpdate:show":g}=e;r&&ne(r,n),g&&ne(g,n),P.value=n}function ae(){le.value||(xe(!0),P.value=!0,e.filterable&&De())}function q(){xe(!1)}function ye(){p.value="",w.value=Q}const de=M(!1);function Re(){e.filterable&&(de.value=!0)}function Me(){e.filterable&&(de.value=!1,I.value||ye())}function Pe(){le.value||(I.value?e.filterable?De():q():ae())}function ze(n){var r,g;!((g=(r=W.value)===null||r===void 0?void 0:r.selfRef)===null||g===void 0)&&g.contains(n.relatedTarget)||(z.value=!1,Z(n),q())}function fe(n){u(n),z.value=!0}function ve(){z.value=!0}function ke(n){var r;!((r=A.value)===null||r===void 0)&&r.$el.contains(n.relatedTarget)||(z.value=!1,Z(n),q())}function _e(){var n;(n=A.value)===null||n===void 0||n.focus(),q()}function $e(n){var r;I.value&&(!((r=A.value)===null||r===void 0)&&r.$el.contains(wt(n))||q())}function Ce(n){if(!Array.isArray(n))return[];if(J.value)return Array.from(n);{const{remote:r}=e,{value:g}=S;if(r){const{value:F}=Y;return n.filter(x=>g.has(x)||F.has(x))}else return n.filter(F=>g.has(F))}}function ge(n){H(n.rawNode)}function H(n){if(le.value)return;const{tag:r,remote:g,clearFilterAfterSelect:F,valueField:x}=e;if(r&&!g){const{value:m}=w,y=m[0]||null;if(y){const L=O.value;L.length?L.push(y):O.value=[y],w.value=Q}}if(g&&Y.value.set(n[x],n),e.multiple){const m=Ce(C.value),y=m.findIndex(L=>L===n[x]);if(~y){if(m.splice(y,1),r&&!g){const L=t(n[x]);~L&&(O.value.splice(L,1),F&&(p.value=""))}}else m.push(n[x]),F&&(p.value="");K(m,E(m))}else{if(r&&!g){const m=t(n[x]);~m?O.value=[O.value[m]]:O.value=Q}Ee(),q(),K(n[x],n)}}function t(n){return O.value.findIndex(g=>g[e.valueField]===n)}function h(n){I.value||ae();const{value:r}=n.target;p.value=r;const{tag:g,remote:F}=e;if(D(r),g&&!F){if(!r){w.value=Q;return}const{onCreate:x}=e,m=x?x(r):{[e.labelField]:r,[e.valueField]:r},{valueField:y,labelField:L}=e;$.value.some(ee=>ee[y]===m[y]||ee[L]===m[L])||O.value.some(ee=>ee[y]===m[y]||ee[L]===m[L])?w.value=Q:w.value=[m]}}function N(n){n.stopPropagation();const{multiple:r}=e;!r&&e.filterable&&q(),o(),r?K([],[]):K(null,null)}function je(n){!Ie(n,"action")&&!Ie(n,"empty")&&!Ie(n,"header")&&n.preventDefault()}function We(n){re(n)}function Ae(n){var r,g,F,x,m;if(!e.keyboard){n.preventDefault();return}switch(n.key){case" ":if(e.filterable)break;n.preventDefault();case"Enter":if(!(!((r=A.value)===null||r===void 0)&&r.isComposing)){if(I.value){const y=(g=W.value)===null||g===void 0?void 0:g.getPendingTmNode();y?ge(y):e.filterable||(q(),Ee())}else if(ae(),e.tag&&de.value){const y=w.value[0];if(y){const L=y[e.valueField],{value:ee}=C;e.multiple&&Array.isArray(ee)&&ee.includes(L)||H(y)}}}n.preventDefault();break;case"ArrowUp":if(n.preventDefault(),e.loading)return;I.value&&((F=W.value)===null||F===void 0||F.prev());break;case"ArrowDown":if(n.preventDefault(),e.loading)return;I.value?(x=W.value)===null||x===void 0||x.next():ae();break;case"Escape":I.value&&(xt(n),q()),(m=A.value)===null||m===void 0||m.focus();break}}function Ee(){var n;(n=A.value)===null||n===void 0||n.focus()}function De(){var n;(n=A.value)===null||n===void 0||n.focusInput()}function Ke(){var n;I.value&&((n=U.value)===null||n===void 0||n.syncPosition())}we(),be(j(e,"options"),we);const Ue={focus:()=>{var n;(n=A.value)===null||n===void 0||n.focus()},focusInput:()=>{var n;(n=A.value)===null||n===void 0||n.focusInput()},blur:()=>{var n;(n=A.value)===null||n===void 0||n.blur()},blurInput:()=>{var n;(n=A.value)===null||n===void 0||n.blurInput()}},Ne=B(()=>{const{self:{menuBoxShadow:n}}=v.value;return{"--n-menu-box-shadow":n}}),ce=c?rn("select",void 0,Ne,e):void 0;return Object.assign(Object.assign({},Ue),{mergedStatus:me,mergedClsPrefix:l,mergedBordered:s,namespace:d,treeMate:T,isMounted:ht(),triggerRef:A,menuRef:W,pattern:p,uncontrolledShow:P,mergedShow:I,adjustedTo:Ze(e),uncontrolledValue:f,mergedValue:C,followerRef:U,localizedPlaceholder:ie,selectedOption:he,selectedOptions:X,mergedSize:Te,mergedDisabled:le,focused:z,activeWithoutMenuOpen:de,inlineThemeDisabled:c,onTriggerInputFocus:Re,onTriggerInputBlur:Me,handleTriggerOrMenuResize:Ke,handleMenuFocus:ve,handleMenuBlur:ke,handleMenuTabOut:_e,handleTriggerClick:Pe,handleToggle:ge,handleDeleteOption:H,handlePatternInput:h,handleClear:N,handleTriggerBlur:ze,handleTriggerFocus:fe,handleKeydown:Ae,handleMenuAfterLeave:ye,handleMenuClickOutside:$e,handleMenuScroll:We,handleMenuKeydown:Ae,handleMenuMousedown:je,mergedTheme:v,cssVars:c?void 0:Ne,themeClass:ce==null?void 0:ce.themeClass,onRender:ce==null?void 0:ce.onRender})},render(){return a("div",{class:`${this.mergedClsPrefix}-select`},a(ft,null,{default:()=>[a(vt,null,{default:()=>a(Vt,{ref:"triggerRef",inlineThemeDisabled:this.inlineThemeDisabled,status:this.mergedStatus,inputProps:this.inputProps,clsPrefix:this.mergedClsPrefix,showArrow:this.showArrow,maxTagCount:this.maxTagCount,ellipsisTagPopoverProps:this.ellipsisTagPopoverProps,bordered:this.mergedBordered,active:this.activeWithoutMenuOpen||this.mergedShow,pattern:this.pattern,placeholder:this.localizedPlaceholder,selectedOption:this.selectedOption,selectedOptions:this.selectedOptions,multiple:this.multiple,renderTag:this.renderTag,renderLabel:this.renderLabel,filterable:this.filterable,clearable:this.clearable,disabled:this.mergedDisabled,size:this.mergedSize,theme:this.mergedTheme.peers.InternalSelection,labelField:this.labelField,valueField:this.valueField,themeOverrides:this.mergedTheme.peerOverrides.InternalSelection,loading:this.loading,focused:this.focused,onClick:this.handleTriggerClick,onDeleteOption:this.handleDeleteOption,onPatternInput:this.handlePatternInput,onClear:this.handleClear,onBlur:this.handleTriggerBlur,onFocus:this.handleTriggerFocus,onKeydown:this.handleKeydown,onPatternBlur:this.onTriggerInputBlur,onPatternFocus:this.onTriggerInputFocus,onResize:this.handleTriggerOrMenuResize,ignoreComposition:this.ignoreComposition},{arrow:()=>{var e,l;return[(l=(e=this.$slots).arrow)===null||l===void 0?void 0:l.call(e)]}})}),a(gt,{ref:"followerRef",show:this.mergedShow,to:this.adjustedTo,teleportDisabled:this.adjustedTo===Ze.tdkey,containerClass:this.namespace,width:this.consistentMenuWidth?"target":void 0,minWidth:"target",placement:this.placement},{default:()=>a(bn,{name:"fade-in-scale-up-transition",appear:this.isMounted,onAfterLeave:this.handleMenuAfterLeave},{default:()=>{var e,l,s;return this.mergedShow||this.displayDirective==="show"?((e=this.onRender)===null||e===void 0||e.call(this),pt(a(At,Object.assign({},this.menuProps,{ref:"menuRef",onResize:this.handleTriggerOrMenuResize,inlineThemeDisabled:this.inlineThemeDisabled,virtualScroll:this.consistentMenuWidth&&this.virtualScroll,class:[`${this.mergedClsPrefix}-select-menu`,this.themeClass,(l=this.menuProps)===null||l===void 0?void 0:l.class],clsPrefix:this.mergedClsPrefix,focusable:!0,labelField:this.labelField,valueField:this.valueField,autoPending:!0,nodeProps:this.nodeProps,theme:this.mergedTheme.peers.InternalSelectMenu,themeOverrides:this.mergedTheme.peerOverrides.InternalSelectMenu,treeMate:this.treeMate,multiple:this.multiple,size:this.menuSize,renderOption:this.renderOption,renderLabel:this.renderLabel,value:this.mergedValue,style:[(s=this.menuProps)===null||s===void 0?void 0:s.style,this.cssVars],onToggle:this.handleToggle,onScroll:this.handleMenuScroll,onFocus:this.handleMenuFocus,onBlur:this.handleMenuBlur,onKeydown:this.handleMenuKeydown,onTabOut:this.handleMenuTabOut,onMousedown:this.handleMenuMousedown,show:this.mergedShow,showCheckmark:this.showCheckmark,resetMenuOnOptionsChange:this.resetMenuOnOptionsChange}),{empty:()=>{var d,c;return[(c=(d=this.$slots).empty)===null||c===void 0?void 0:c.call(d)]},header:()=>{var d,c;return[(c=(d=this.$slots).header)===null||c===void 0?void 0:c.call(d)]},action:()=>{var d,c;return[(c=(d=this.$slots).action)===null||c===void 0?void 0:c.call(d)]}}),this.displayDirective==="show"?[[bt,this.mergedShow],[un,this.handleMenuClickOutside,void 0,{capture:!0}]]:[[un,this.handleMenuClickOutside,void 0,{capture:!0}]])):null}})})]}))}}),Yt={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 1024 1024"},Jt=St("path",{d:"M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1c-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z",fill:"currentColor"},null,-1),Xt=[Jt],oo=ue({name:"SearchOutlined",render:function(l,s){return yt(),Ct("svg",Yt,Xt)}});export{At as N,oo as S,to as a,Ht as c,Cn as i,Ye as m,qt as s};
