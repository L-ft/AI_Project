import{l as j,ab as t,H as o,n as C,_ as b,$ as N,aA as W,aB as F,d as P,q as A,s as k,v as D,x as z,y as I,z as K,a6 as x,o as G,c as J,a as f}from"./index-d836ab7c.js";const Q={thPaddingSmall:"6px",thPaddingMedium:"12px",thPaddingLarge:"12px",tdPaddingSmall:"6px",tdPaddingMedium:"12px",tdPaddingLarge:"12px"};function U(e){const{dividerColor:r,cardColor:d,modalColor:n,popoverColor:a,tableHeaderColor:s,tableColorStriped:i,textColor1:l,textColor2:c,borderRadius:h,fontWeightStrong:g,lineHeight:p,fontSizeSmall:v,fontSizeMedium:m,fontSizeLarge:u}=e;return Object.assign(Object.assign({},Q),{fontSizeSmall:v,fontSizeMedium:m,fontSizeLarge:u,lineHeight:p,borderRadius:h,borderColor:t(d,r),borderColorModal:t(n,r),borderColorPopover:t(a,r),tdColor:d,tdColorModal:n,tdColorPopover:a,tdColorStriped:t(d,i),tdColorStripedModal:t(n,i),tdColorStripedPopover:t(a,i),thColor:t(d,s),thColorModal:t(n,s),thColorPopover:t(a,s),thTextColor:l,tdTextColor:c,thFontWeight:g})}const X={name:"Table",common:j,self:U},Y=X,Z=o([C("table",`
 font-size: var(--n-font-size);
 font-variant-numeric: tabular-nums;
 line-height: var(--n-line-height);
 width: 100%;
 border-radius: var(--n-border-radius) var(--n-border-radius) 0 0;
 text-align: left;
 border-collapse: separate;
 border-spacing: 0;
 overflow: hidden;
 background-color: var(--n-td-color);
 border-color: var(--n-merged-border-color);
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 --n-merged-border-color: var(--n-border-color);
 `,[o("th",`
 white-space: nowrap;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 text-align: inherit;
 padding: var(--n-th-padding);
 vertical-align: inherit;
 text-transform: none;
 border: 0px solid var(--n-merged-border-color);
 font-weight: var(--n-th-font-weight);
 color: var(--n-th-text-color);
 background-color: var(--n-th-color);
 border-bottom: 1px solid var(--n-merged-border-color);
 border-right: 1px solid var(--n-merged-border-color);
 `,[o("&:last-child",`
 border-right: 0px solid var(--n-merged-border-color);
 `)]),o("td",`
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 padding: var(--n-td-padding);
 color: var(--n-td-text-color);
 background-color: var(--n-td-color);
 border: 0px solid var(--n-merged-border-color);
 border-right: 1px solid var(--n-merged-border-color);
 border-bottom: 1px solid var(--n-merged-border-color);
 `,[o("&:last-child",`
 border-right: 0px solid var(--n-merged-border-color);
 `)]),b("bordered",`
 border: 1px solid var(--n-merged-border-color);
 border-radius: var(--n-border-radius);
 `,[o("tr",[o("&:last-child",[o("td",`
 border-bottom: 0 solid var(--n-merged-border-color);
 `)])])]),b("single-line",[o("th",`
 border-right: 0px solid var(--n-merged-border-color);
 `),o("td",`
 border-right: 0px solid var(--n-merged-border-color);
 `)]),b("single-column",[o("tr",[o("&:not(:last-child)",[o("td",`
 border-bottom: 0px solid var(--n-merged-border-color);
 `)])])]),b("striped",[o("tr:nth-of-type(even)",[o("td","background-color: var(--n-td-color-striped)")])]),N("bottom-bordered",[o("tr",[o("&:last-child",[o("td",`
 border-bottom: 0px solid var(--n-merged-border-color);
 `)])])])]),W(C("table",`
 background-color: var(--n-td-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `,[o("th",`
 background-color: var(--n-th-color-modal);
 `),o("td",`
 background-color: var(--n-td-color-modal);
 `)])),F(C("table",`
 background-color: var(--n-td-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `,[o("th",`
 background-color: var(--n-th-color-popover);
 `),o("td",`
 background-color: var(--n-td-color-popover);
 `)]))]),oo=Object.assign(Object.assign({},k.props),{bordered:{type:Boolean,default:!0},bottomBordered:{type:Boolean,default:!0},singleLine:{type:Boolean,default:!0},striped:Boolean,singleColumn:Boolean,size:{type:String,default:"medium"}}),io=P({name:"Table",props:oo,setup(e){const{mergedClsPrefixRef:r,inlineThemeDisabled:d,mergedRtlRef:n}=A(e),a=k("Table","-table",Z,Y,e,r),s=D("Table",n,r),i=z(()=>{const{size:c}=e,{self:{borderColor:h,tdColor:g,tdColorModal:p,tdColorPopover:v,thColor:m,thColorModal:u,thColorPopover:S,thTextColor:w,tdTextColor:M,borderRadius:B,thFontWeight:_,lineHeight:R,borderColorModal:T,borderColorPopover:$,tdColorStriped:q,tdColorStripedModal:y,tdColorStripedPopover:L,[x("fontSize",c)]:O,[x("tdPadding",c)]:H,[x("thPadding",c)]:V},common:{cubicBezierEaseInOut:E}}=a.value;return{"--n-bezier":E,"--n-td-color":g,"--n-td-color-modal":p,"--n-td-color-popover":v,"--n-td-text-color":M,"--n-border-color":h,"--n-border-color-modal":T,"--n-border-color-popover":$,"--n-border-radius":B,"--n-font-size":O,"--n-th-color":m,"--n-th-color-modal":u,"--n-th-color-popover":S,"--n-th-font-weight":_,"--n-th-text-color":w,"--n-line-height":R,"--n-td-padding":H,"--n-th-padding":V,"--n-td-color-striped":q,"--n-td-color-striped-modal":y,"--n-td-color-striped-popover":L}}),l=d?I("table",z(()=>e.size[0]),i,e):void 0;return{rtlEnabled:s,mergedClsPrefix:r,cssVars:d?void 0:i,themeClass:l==null?void 0:l.themeClass,onRender:l==null?void 0:l.onRender}},render(){var e;const{mergedClsPrefix:r}=this;return(e=this.onRender)===null||e===void 0||e.call(this),K("table",{class:[`${r}-table`,this.themeClass,{[`${r}-table--rtl`]:this.rtlEnabled,[`${r}-table--bottom-bordered`]:this.bottomBordered,[`${r}-table--bordered`]:this.bordered,[`${r}-table--single-line`]:this.singleLine,[`${r}-table--single-column`]:this.singleColumn,[`${r}-table--striped`]:this.striped}],style:this.cssVars},this.$slots)}}),ro={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 1024 1024"},eo=f("defs",null,null,-1),to=f("path",{d:"M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z",fill:"currentColor"},null,-1),lo=f("path",{d:"M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z",fill:"currentColor"},null,-1),no=[eo,to,lo],so=P({name:"PlusOutlined",render:function(r,d){return G(),J("svg",ro,no)}});export{io as N,so as P};
