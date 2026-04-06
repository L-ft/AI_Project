import{l as O,M as u,aY as v,n as x,p as i,O as R,bc as F,I as N,d as V,q,s as H,v as D,x as $,y as J,r as K,z as s,aH as Y,aJ as G,ay as Q,A as U,be as X,aS as Z,aR as c,V as oo,bm as eo,bn as ro,bo as no,bl as lo}from"./index-c5729718.js";const so={iconMargin:"11px 8px 0 12px",iconMarginRtl:"11px 12px 0 8px",iconSize:"24px",closeIconSize:"16px",closeSize:"20px",closeMargin:"13px 14px 0 0",closeMarginRtl:"13px 0 0 14px",padding:"13px"};function to(r){const{lineHeight:o,borderRadius:d,fontWeightStrong:C,baseColor:t,dividerColor:b,actionColor:y,textColor1:g,textColor2:l,closeColorHover:h,closeColorPressed:f,closeIconColor:p,closeIconColorHover:m,closeIconColorPressed:n,infoColor:e,successColor:I,warningColor:z,errorColor:S,fontSize:P}=r;return Object.assign(Object.assign({},so),{fontSize:P,lineHeight:o,titleFontWeight:C,borderRadius:d,border:`1px solid ${b}`,color:y,titleTextColor:g,iconColor:l,contentTextColor:l,closeBorderRadius:d,closeColorHover:h,closeColorPressed:f,closeIconColor:p,closeIconColorHover:m,closeIconColorPressed:n,borderInfo:`1px solid ${u(t,v(e,{alpha:.25}))}`,colorInfo:u(t,v(e,{alpha:.08})),titleTextColorInfo:g,iconColorInfo:e,contentTextColorInfo:l,closeColorHoverInfo:h,closeColorPressedInfo:f,closeIconColorInfo:p,closeIconColorHoverInfo:m,closeIconColorPressedInfo:n,borderSuccess:`1px solid ${u(t,v(I,{alpha:.25}))}`,colorSuccess:u(t,v(I,{alpha:.08})),titleTextColorSuccess:g,iconColorSuccess:I,contentTextColorSuccess:l,closeColorHoverSuccess:h,closeColorPressedSuccess:f,closeIconColorSuccess:p,closeIconColorHoverSuccess:m,closeIconColorPressedSuccess:n,borderWarning:`1px solid ${u(t,v(z,{alpha:.33}))}`,colorWarning:u(t,v(z,{alpha:.08})),titleTextColorWarning:g,iconColorWarning:z,contentTextColorWarning:l,closeColorHoverWarning:h,closeColorPressedWarning:f,closeIconColorWarning:p,closeIconColorHoverWarning:m,closeIconColorPressedWarning:n,borderError:`1px solid ${u(t,v(S,{alpha:.25}))}`,colorError:u(t,v(S,{alpha:.08})),titleTextColorError:g,iconColorError:S,contentTextColorError:l,closeColorHoverError:h,closeColorPressedError:f,closeIconColorError:p,closeIconColorHoverError:m,closeIconColorPressedError:n})}const io={name:"Alert",common:O,self:to},ao=io,co=x("alert",`
 line-height: var(--n-line-height);
 border-radius: var(--n-border-radius);
 position: relative;
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-color);
 text-align: start;
 word-break: break-word;
`,[i("border",`
 border-radius: inherit;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 transition: border-color .3s var(--n-bezier);
 border: var(--n-border);
 pointer-events: none;
 `),R("closable",[x("alert-body",[i("title",`
 padding-right: 24px;
 `)])]),i("icon",{color:"var(--n-icon-color)"}),x("alert-body",{padding:"var(--n-padding)"},[i("title",{color:"var(--n-title-text-color)"}),i("content",{color:"var(--n-content-text-color)"})]),F({originalTransition:"transform .3s var(--n-bezier)",enterToProps:{transform:"scale(1)"},leaveToProps:{transform:"scale(0.9)"}}),i("icon",`
 position: absolute;
 left: 0;
 top: 0;
 align-items: center;
 justify-content: center;
 display: flex;
 width: var(--n-icon-size);
 height: var(--n-icon-size);
 font-size: var(--n-icon-size);
 margin: var(--n-icon-margin);
 `),i("close",`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 position: absolute;
 right: 0;
 top: 0;
 margin: var(--n-close-margin);
 `),R("show-icon",[x("alert-body",{paddingLeft:"calc(var(--n-icon-margin-left) + var(--n-icon-size) + var(--n-icon-margin-right))"})]),R("right-adjust",[x("alert-body",{paddingRight:"calc(var(--n-close-size) + var(--n-padding) + 2px)"})]),x("alert-body",`
 border-radius: var(--n-border-radius);
 transition: border-color .3s var(--n-bezier);
 `,[i("title",`
 transition: color .3s var(--n-bezier);
 font-size: 16px;
 line-height: 19px;
 font-weight: var(--n-title-font-weight);
 `,[N("& +",[i("content",{marginTop:"9px"})])]),i("content",{transition:"color .3s var(--n-bezier)",fontSize:"var(--n-font-size)"})]),i("icon",{transition:"color .3s var(--n-bezier)"})]),go=Object.assign(Object.assign({},H.props),{title:String,showIcon:{type:Boolean,default:!0},type:{type:String,default:"default"},bordered:{type:Boolean,default:!0},closable:Boolean,onClose:Function,onAfterLeave:Function,onAfterHide:Function}),uo=V({name:"Alert",inheritAttrs:!1,props:go,slots:Object,setup(r){const{mergedClsPrefixRef:o,mergedBorderedRef:d,inlineThemeDisabled:C,mergedRtlRef:t}=q(r),b=H("Alert","-alert",co,ao,r,o),y=D("Alert",t,o),g=$(()=>{const{common:{cubicBezierEaseInOut:n},self:e}=b.value,{fontSize:I,borderRadius:z,titleFontWeight:S,lineHeight:P,iconSize:E,iconMargin:T,iconMarginRtl:A,closeIconSize:W,closeBorderRadius:w,closeSize:B,closeMargin:_,closeMarginRtl:L,padding:M}=e,{type:a}=r,{left:j,right:k}=Z(T);return{"--n-bezier":n,"--n-color":e[c("color",a)],"--n-close-icon-size":W,"--n-close-border-radius":w,"--n-close-color-hover":e[c("closeColorHover",a)],"--n-close-color-pressed":e[c("closeColorPressed",a)],"--n-close-icon-color":e[c("closeIconColor",a)],"--n-close-icon-color-hover":e[c("closeIconColorHover",a)],"--n-close-icon-color-pressed":e[c("closeIconColorPressed",a)],"--n-icon-color":e[c("iconColor",a)],"--n-border":e[c("border",a)],"--n-title-text-color":e[c("titleTextColor",a)],"--n-content-text-color":e[c("contentTextColor",a)],"--n-line-height":P,"--n-border-radius":z,"--n-font-size":I,"--n-title-font-weight":S,"--n-icon-size":E,"--n-icon-margin":T,"--n-icon-margin-rtl":A,"--n-close-size":B,"--n-close-margin":_,"--n-close-margin-rtl":L,"--n-padding":M,"--n-icon-margin-left":j,"--n-icon-margin-right":k}}),l=C?J("alert",$(()=>r.type[0]),g,r):void 0,h=K(!0),f=()=>{const{onAfterLeave:n,onAfterHide:e}=r;n&&n(),e&&e()};return{rtlEnabled:y,mergedClsPrefix:o,mergedBordered:d,visible:h,handleCloseClick:()=>{var n;Promise.resolve((n=r.onClose)===null||n===void 0?void 0:n.call(r)).then(e=>{e!==!1&&(h.value=!1)})},handleAfterLeave:()=>{f()},mergedTheme:b,cssVars:C?void 0:g,themeClass:l==null?void 0:l.themeClass,onRender:l==null?void 0:l.onRender}},render(){var r;return(r=this.onRender)===null||r===void 0||r.call(this),s(X,{onAfterLeave:this.handleAfterLeave},{default:()=>{const{mergedClsPrefix:o,$slots:d}=this,C={class:[`${o}-alert`,this.themeClass,this.closable&&`${o}-alert--closable`,this.showIcon&&`${o}-alert--show-icon`,!this.title&&this.closable&&`${o}-alert--right-adjust`,this.rtlEnabled&&`${o}-alert--rtl`],style:this.cssVars,role:"alert"};return this.visible?s("div",Object.assign({},Y(this.$attrs,C)),this.closable&&s(G,{clsPrefix:o,class:`${o}-alert__close`,onClick:this.handleCloseClick}),this.bordered&&s("div",{class:`${o}-alert__border`}),this.showIcon&&s("div",{class:`${o}-alert__icon`,"aria-hidden":"true"},Q(d.icon,()=>[s(oo,{clsPrefix:o},{default:()=>{switch(this.type){case"success":return s(lo,null);case"info":return s(no,null);case"warning":return s(ro,null);case"error":return s(eo,null);default:return null}}})])),s("div",{class:[`${o}-alert-body`,this.mergedBordered&&`${o}-alert-body--bordered`]},U(d.header,t=>{const b=t||this.title;return b?s("div",{class:`${o}-alert-body__title`},b):null}),d.default&&s("div",{class:`${o}-alert-body__content`},d))):null}})}});export{uo as N};
