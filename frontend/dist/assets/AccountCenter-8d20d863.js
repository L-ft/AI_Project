import{l as I,n as m,au as j,p as u,M as b,d as R,q as O,s as $,x as S,y as T,z as l,a5 as V,L as P,T as y,bM as Z,bN as J,v as H,O as Q,Z as Y,S as ee,X as te,aK as re,u as ie,r as B,c as oe,a as d,b as a,w as o,e as i,o as ne,k as D,bS as le,g as x,t as _,H as ae,j as C,N as L,a4 as se,m as de}from"./index-046e80b1.js";import{U as ce}from"./UploadOutlined-57cd4de9.js";import{C as ve}from"./CheckCircleOutlined-219fb868.js";import{a as M,N as ue}from"./Grid-7f9a7623.js";import{_ as fe}from"./_plugin-vue_export-helper-c27b6911.js";function he(t){const{textColor1:e,dividerColor:n,fontWeightStrong:s}=t;return{textColor:e,color:n,fontWeight:s}}const ge={name:"Divider",common:I,self:he},me=ge,pe=m("divider",`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[j("vertical",`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[j("no-title",`
 display: flex;
 align-items: center;
 `)]),u("title",`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),b("title-position-left",[u("line",[b("left",{width:"28px"})])]),b("title-position-right",[u("line",[b("right",{width:"28px"})])]),b("dashed",[u("line",`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),b("vertical",`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),u("line",`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),j("dashed",[u("line",{backgroundColor:"var(--n-color)"})]),b("dashed",[u("line",{borderColor:"var(--n-color)"})]),b("vertical",{backgroundColor:"var(--n-color)"})]),be=Object.assign(Object.assign({},$.props),{titlePlacement:{type:String,default:"center"},dashed:Boolean,vertical:Boolean}),xe=R({name:"Divider",props:be,setup(t){const{mergedClsPrefixRef:e,inlineThemeDisabled:n}=O(t),s=$("Divider","-divider",pe,me,t,e),g=S(()=>{const{common:{cubicBezierEaseInOut:c},self:{color:h,textColor:r,fontWeight:p}}=s.value;return{"--n-bezier":c,"--n-color":h,"--n-text-color":r,"--n-font-weight":p}}),f=n?T("divider",void 0,g,t):void 0;return{mergedClsPrefix:e,cssVars:n?void 0:g,themeClass:f==null?void 0:f.themeClass,onRender:f==null?void 0:f.onRender}},render(){var t;const{$slots:e,titlePlacement:n,vertical:s,dashed:g,cssVars:f,mergedClsPrefix:c}=this;return(t=this.onRender)===null||t===void 0||t.call(this),l("div",{role:"separator",class:[`${c}-divider`,this.themeClass,{[`${c}-divider--vertical`]:s,[`${c}-divider--no-title`]:!e.default,[`${c}-divider--dashed`]:g,[`${c}-divider--title-position-${n}`]:e.default&&n}],style:f},s?null:l("div",{class:`${c}-divider__line ${c}-divider__line--left`}),!s&&e.default?l(V,null,l("div",{class:`${c}-divider__title`},this.$slots),l("div",{class:`${c}-divider__line ${c}-divider__line--right`})):null)}});function _e(t){const{textColor2:e,cardColor:n,modalColor:s,popoverColor:g,dividerColor:f,borderRadius:c,fontSize:h,hoverColor:r}=t;return{textColor:e,color:n,colorHover:r,colorModal:s,colorHoverModal:P(s,r),colorPopover:g,colorHoverPopover:P(g,r),borderColor:f,borderColorModal:P(s,f),borderColorPopover:P(g,f),borderRadius:c,fontSize:h}}const ye={name:"List",common:I,self:_e},Ce=ye;function $e(t){const{textColor1:e,textColor2:n,fontWeightStrong:s,fontSize:g}=t;return{fontSize:g,titleTextColor:e,textColor:n,titleFontWeight:s}}const we={name:"Thing",common:I,self:$e},ze=we,ke=y([m("list",`
 --n-merged-border-color: var(--n-border-color);
 --n-merged-color: var(--n-color);
 --n-merged-color-hover: var(--n-color-hover);
 margin: 0;
 font-size: var(--n-font-size);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 padding: 0;
 list-style-type: none;
 color: var(--n-text-color);
 background-color: var(--n-merged-color);
 `,[b("show-divider",[m("list-item",[y("&:not(:last-child)",[u("divider",`
 background-color: var(--n-merged-border-color);
 `)])])]),b("clickable",[m("list-item",`
 cursor: pointer;
 `)]),b("bordered",`
 border: 1px solid var(--n-merged-border-color);
 border-radius: var(--n-border-radius);
 `),b("hoverable",[m("list-item",`
 border-radius: var(--n-border-radius);
 `,[y("&:hover",`
 background-color: var(--n-merged-color-hover);
 `,[u("divider",`
 background-color: transparent;
 `)])])]),b("bordered, hoverable",[m("list-item",`
 padding: 12px 20px;
 `),u("header, footer",`
 padding: 12px 20px;
 `)]),u("header, footer",`
 padding: 12px 0;
 box-sizing: border-box;
 transition: border-color .3s var(--n-bezier);
 `,[y("&:not(:last-child)",`
 border-bottom: 1px solid var(--n-merged-border-color);
 `)]),m("list-item",`
 position: relative;
 padding: 12px 0; 
 box-sizing: border-box;
 display: flex;
 flex-wrap: nowrap;
 align-items: center;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[u("prefix",`
 margin-right: 20px;
 flex: 0;
 `),u("suffix",`
 margin-left: 20px;
 flex: 0;
 `),u("main",`
 flex: 1;
 `),u("divider",`
 height: 1px;
 position: absolute;
 bottom: 0;
 left: 0;
 right: 0;
 background-color: transparent;
 transition: background-color .3s var(--n-bezier);
 pointer-events: none;
 `)])]),Z(m("list",`
 --n-merged-color-hover: var(--n-color-hover-modal);
 --n-merged-color: var(--n-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `)),J(m("list",`
 --n-merged-color-hover: var(--n-color-hover-popover);
 --n-merged-color: var(--n-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `))]),Re=Object.assign(Object.assign({},$.props),{size:{type:String,default:"medium"},bordered:Boolean,clickable:Boolean,hoverable:Boolean,showDivider:{type:Boolean,default:!0}}),A=ee("n-list"),Pe=R({name:"List",props:Re,slots:Object,setup(t){const{mergedClsPrefixRef:e,inlineThemeDisabled:n,mergedRtlRef:s}=O(t),g=H("List",s,e),f=$("List","-list",ke,Ce,t,e);Q(A,{showDividerRef:Y(t,"showDivider"),mergedClsPrefixRef:e});const c=S(()=>{const{common:{cubicBezierEaseInOut:r},self:{fontSize:p,textColor:v,color:w,colorModal:E,colorPopover:N,borderColor:K,borderColorModal:W,borderColorPopover:U,borderRadius:F,colorHover:q,colorHoverModal:G,colorHoverPopover:X}}=f.value;return{"--n-font-size":p,"--n-bezier":r,"--n-text-color":v,"--n-color":w,"--n-border-radius":F,"--n-border-color":K,"--n-border-color-modal":W,"--n-border-color-popover":U,"--n-color-modal":E,"--n-color-popover":N,"--n-color-hover":q,"--n-color-hover-modal":G,"--n-color-hover-popover":X}}),h=n?T("list",void 0,c,t):void 0;return{mergedClsPrefix:e,rtlEnabled:g,cssVars:n?void 0:c,themeClass:h==null?void 0:h.themeClass,onRender:h==null?void 0:h.onRender}},render(){var t;const{$slots:e,mergedClsPrefix:n,onRender:s}=this;return s==null||s(),l("ul",{class:[`${n}-list`,this.rtlEnabled&&`${n}-list--rtl`,this.bordered&&`${n}-list--bordered`,this.showDivider&&`${n}-list--show-divider`,this.hoverable&&`${n}-list--hoverable`,this.clickable&&`${n}-list--clickable`,this.themeClass],style:this.cssVars},e.header?l("div",{class:`${n}-list__header`},e.header()):null,(t=e.default)===null||t===void 0?void 0:t.call(e),e.footer?l("div",{class:`${n}-list__footer`},e.footer()):null)}}),z=R({name:"ListItem",slots:Object,setup(){const t=te(A,null);return t||re("list-item","`n-list-item` must be placed in `n-list`."),{showDivider:t.showDividerRef,mergedClsPrefix:t.mergedClsPrefixRef}},render(){const{$slots:t,mergedClsPrefix:e}=this;return l("li",{class:`${e}-list-item`},t.prefix?l("div",{class:`${e}-list-item__prefix`},t.prefix()):null,t.default?l("div",{class:`${e}-list-item__main`},t):null,t.suffix?l("div",{class:`${e}-list-item__suffix`},t.suffix()):null,this.showDivider&&l("div",{class:`${e}-list-item__divider`}))}}),Se=m("thing",`
 display: flex;
 transition: color .3s var(--n-bezier);
 font-size: var(--n-font-size);
 color: var(--n-text-color);
`,[m("thing-avatar",`
 margin-right: 12px;
 margin-top: 2px;
 `),m("thing-avatar-header-wrapper",`
 display: flex;
 flex-wrap: nowrap;
 `,[m("thing-header-wrapper",`
 flex: 1;
 `)]),m("thing-main",`
 flex-grow: 1;
 `,[m("thing-header",`
 display: flex;
 margin-bottom: 4px;
 justify-content: space-between;
 align-items: center;
 `,[u("title",`
 font-size: 16px;
 font-weight: var(--n-title-font-weight);
 transition: color .3s var(--n-bezier);
 color: var(--n-title-text-color);
 `)]),u("description",[y("&:not(:last-child)",`
 margin-bottom: 4px;
 `)]),u("content",[y("&:not(:first-child)",`
 margin-top: 12px;
 `)]),u("footer",[y("&:not(:first-child)",`
 margin-top: 12px;
 `)]),u("action",[y("&:not(:first-child)",`
 margin-top: 12px;
 `)])])]),Ee=Object.assign(Object.assign({},$.props),{title:String,titleExtra:String,description:String,descriptionClass:String,descriptionStyle:[String,Object],content:String,contentClass:String,contentStyle:[String,Object],contentIndented:Boolean}),k=R({name:"Thing",props:Ee,slots:Object,setup(t,{slots:e}){const{mergedClsPrefixRef:n,inlineThemeDisabled:s,mergedRtlRef:g}=O(t),f=$("Thing","-thing",Se,ze,t,n),c=H("Thing",g,n),h=S(()=>{const{self:{titleTextColor:p,textColor:v,titleFontWeight:w,fontSize:E},common:{cubicBezierEaseInOut:N}}=f.value;return{"--n-bezier":N,"--n-font-size":E,"--n-text-color":v,"--n-title-font-weight":w,"--n-title-text-color":p}}),r=s?T("thing",void 0,h,t):void 0;return()=>{var p;const{value:v}=n,w=c?c.value:!1;return(p=r==null?void 0:r.onRender)===null||p===void 0||p.call(r),l("div",{class:[`${v}-thing`,r==null?void 0:r.themeClass,w&&`${v}-thing--rtl`],style:s?void 0:h.value},e.avatar&&t.contentIndented?l("div",{class:`${v}-thing-avatar`},e.avatar()):null,l("div",{class:`${v}-thing-main`},!t.contentIndented&&(e.header||t.title||e["header-extra"]||t.titleExtra||e.avatar)?l("div",{class:`${v}-thing-avatar-header-wrapper`},e.avatar?l("div",{class:`${v}-thing-avatar`},e.avatar()):null,e.header||t.title||e["header-extra"]||t.titleExtra?l("div",{class:`${v}-thing-header-wrapper`},l("div",{class:`${v}-thing-header`},e.header||t.title?l("div",{class:`${v}-thing-header__title`},e.header?e.header():t.title):null,e["header-extra"]||t.titleExtra?l("div",{class:`${v}-thing-header__extra`},e["header-extra"]?e["header-extra"]():t.titleExtra):null),e.description||t.description?l("div",{class:[`${v}-thing-main__description`,t.descriptionClass],style:t.descriptionStyle},e.description?e.description():t.description):null):null):l(V,null,e.header||t.title||e["header-extra"]||t.titleExtra?l("div",{class:`${v}-thing-header`},e.header||t.title?l("div",{class:`${v}-thing-header__title`},e.header?e.header():t.title):null,e["header-extra"]||t.titleExtra?l("div",{class:`${v}-thing-header__extra`},e["header-extra"]?e["header-extra"]():t.titleExtra):null):null,e.description||t.description?l("div",{class:[`${v}-thing-main__description`,t.descriptionClass],style:t.descriptionStyle},e.description?e.description():t.description):null),e.default||t.content?l("div",{class:[`${v}-thing-main__content`,t.contentClass],style:t.contentStyle},e.default?e.default():t.content):null,e.footer?l("div",{class:`${v}-thing-main__footer`},e.footer()):null,e.action?l("div",{class:`${v}-thing-main__action`},e.action()):null))}}}),Ne={class:"account-page"},je={class:"account-inner"},Ie={class:"avatar-section"},Oe={class:"avatar-wrap"},Te={class:"profile-name"},Be={class:"profile-details"},De={class:"detail-row"},Le={class:"detail-value"},Me={class:"detail-row"},Ve={class:"detail-value"},He={class:"security-value"},Ae={class:"security-value security-value--success"},Ke={class:"security-value key-text"},We=R({__name:"AccountCenter",setup(t){const e=ie(),n=B("ai_7f2d90a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"),s=B(!1),g=S(()=>n.value.substring(0,6)+"****************************"),f=h=>h?h.replace(/(\d{3})\d{4}(\d{4})/,"$1****$2"):"",c=()=>{navigator.clipboard.writeText(n.value),de.success("API 密钥已复制到剪贴板")};return(h,r)=>(ne(),oe("div",Ne,[d("div",je,[r[16]||(r[16]=d("header",{class:"account-header"},[d("p",{class:"account-eyebrow"},"个人中心"),d("h1",{class:"account-title"},"账户设置"),d("p",{class:"account-sub"},"管理您的个人信息、登录凭证与安全偏好。")],-1)),a(i(ue),{"x-gap":24,"y-gap":24,cols:24},{default:o(()=>[a(i(M),{span:8},{default:o(()=>[a(i(D),{bordered:!1,class:"account-card profile-card"},{default:o(()=>[d("div",Ie,[d("div",Oe,[a(i(le),{size:96,round:"",style:{backgroundColor:"var(--color-primary-500)",fontSize:"38px"}},{default:o(()=>{var p;return[x(_((p=i(e).username)==null?void 0:p.slice(0,1).toUpperCase()),1)]}),_:1}),r[1]||(r[1]=d("div",{class:"avatar-ring"},null,-1))]),d("h2",Te,_(i(e).username),1),a(i(ae),{type:"primary",round:"",size:"small",class:"profile-role-tag"},{default:o(()=>[x(_(i(e).role),1)]),_:1}),a(i(C),{size:"small",quaternary:"",round:"",class:"change-avatar-btn"},{icon:o(()=>[a(i(L),{component:i(ce)},null,8,["component"])]),default:o(()=>[r[2]||(r[2]=x(" 更换头像 ",-1))]),_:1})]),a(i(xe),{style:{margin:"16px 0"}}),d("div",Be,[d("div",De,[r[3]||(r[3]=d("span",{class:"detail-label"},"账户名称",-1)),d("span",Le,_(i(e).username),1)]),d("div",Me,[r[4]||(r[4]=d("span",{class:"detail-label"},"注册手机",-1)),d("span",Ve,_(i(e).phone),1)])])]),_:1})]),_:1}),a(i(M),{span:16},{default:o(()=>[a(i(D),{title:"安全设置",bordered:!1,class:"account-card"},{default:o(()=>[a(i(Pe),{"show-divider":!0},{default:o(()=>[a(i(z),null,{suffix:o(()=>[a(i(C),{text:"",type:"primary"},{default:o(()=>[...r[5]||(r[5]=[x("修改",-1)])]),_:1})]),default:o(()=>[a(i(k),{title:"登录密码"},{description:o(()=>[...r[6]||(r[6]=[d("span",{class:"security-desc"},"安全性高的密码可以使账号更安全。建议您定期更换密码。",-1)])]),_:1})]),_:1}),a(i(z),null,{suffix:o(()=>[a(i(C),{text:"",type:"primary"},{default:o(()=>[...r[7]||(r[7]=[x("修改",-1)])]),_:1})]),default:o(()=>[a(i(k),{title:"手机绑定"},{description:o(()=>[r[8]||(r[8]=d("span",{class:"security-desc"},"绑定手机号码用于接收验证码、找回密码、重要安全设置的校验等。",-1)),d("div",He,_(f(i(e).phone)),1)]),_:1})]),_:1}),a(i(z),null,{suffix:o(()=>[a(i(C),{text:"",type:"primary"},{default:o(()=>[...r[9]||(r[9]=[x("修改",-1)])]),_:1})]),default:o(()=>[a(i(k),{title:"操作保护"},{description:o(()=>[r[11]||(r[11]=d("span",{class:"security-desc"},"在关键操作（如：API密钥重置、权限修改）时，通过验证方式再次确认您的身份。",-1)),d("div",Ae,[a(i(L),{component:i(ve)},null,8,["component"]),r[10]||(r[10]=x(" 已开启保护 ",-1))])]),_:1})]),_:1}),a(i(z),null,{suffix:o(()=>[a(i(se),null,{default:o(()=>[a(i(C),{text:"",type:"primary",onClick:r[0]||(r[0]=p=>s.value=!s.value)},{default:o(()=>[x(_(s.value?"隐藏":"显示"),1)]),_:1}),a(i(C),{text:"",type:"primary",onClick:c},{default:o(()=>[...r[12]||(r[12]=[x("复制",-1)])]),_:1})]),_:1})]),default:o(()=>[a(i(k),{title:"API 密钥 (Access Key)"},{description:o(()=>[r[13]||(r[13]=d("span",{class:"security-desc"},"用于调用平台 API 或执行引擎的身份凭证。请妥善保管。",-1)),d("div",Ke,_(s.value?n.value:g.value),1)]),_:1})]),_:1}),a(i(z),null,{suffix:o(()=>[a(i(C),{text:"",type:"primary"},{default:o(()=>[...r[14]||(r[14]=[x("修改",-1)])]),_:1})]),default:o(()=>[a(i(k),{title:"登录保持时长"},{description:o(()=>[...r[15]||(r[15]=[d("span",{class:"security-desc"},"您可以设置保持登录的时间长度，超过该时间系统会自动退出登录。（系统默认认证3小时）",-1),d("div",{class:"security-value"},"12小时",-1)])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})])]))}});const Ze=fe(We,[["__scopeId","data-v-16489b2b"]]);export{Ze as default};
