import{l as O,n as m,$ as N,p as u,_ as b,d as $,q as B,s as w,x as S,y as I,z as l,a3 as H,ab as P,H as y,aA as Y,aB as Z,v as M,T as ee,O as te,L as re,M as ie,bi as oe,o as A,c as K,a as d,u as ne,r as L,b as a,w as n,e as i,k as T,bx as le,g as x,t as _,F as ae,j as C,N as D,aL as se,m as de}from"./index-d836ab7c.js";import{C as ce}from"./CheckCircleOutlined-dc30e7ac.js";import{a as V,N as ve}from"./Grid-048999b0.js";import{_ as ue}from"./_plugin-vue_export-helper-c27b6911.js";function he(t){const{textColor1:e,dividerColor:o,fontWeightStrong:s}=t;return{textColor:e,color:o,fontWeight:s}}const fe={name:"Divider",common:O,self:he},ge=fe,me=m("divider",`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[N("vertical",`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[N("no-title",`
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
 `),N("dashed",[u("line",{backgroundColor:"var(--n-color)"})]),b("dashed",[u("line",{borderColor:"var(--n-color)"})]),b("vertical",{backgroundColor:"var(--n-color)"})]),pe=Object.assign(Object.assign({},w.props),{titlePlacement:{type:String,default:"center"},dashed:Boolean,vertical:Boolean}),be=$({name:"Divider",props:pe,setup(t){const{mergedClsPrefixRef:e,inlineThemeDisabled:o}=B(t),s=w("Divider","-divider",me,ge,t,e),g=S(()=>{const{common:{cubicBezierEaseInOut:c},self:{color:f,textColor:r,fontWeight:p}}=s.value;return{"--n-bezier":c,"--n-color":f,"--n-text-color":r,"--n-font-weight":p}}),h=o?I("divider",void 0,g,t):void 0;return{mergedClsPrefix:e,cssVars:o?void 0:g,themeClass:h==null?void 0:h.themeClass,onRender:h==null?void 0:h.onRender}},render(){var t;const{$slots:e,titlePlacement:o,vertical:s,dashed:g,cssVars:h,mergedClsPrefix:c}=this;return(t=this.onRender)===null||t===void 0||t.call(this),l("div",{role:"separator",class:[`${c}-divider`,this.themeClass,{[`${c}-divider--vertical`]:s,[`${c}-divider--no-title`]:!e.default,[`${c}-divider--dashed`]:g,[`${c}-divider--title-position-${o}`]:e.default&&o}],style:h},s?null:l("div",{class:`${c}-divider__line ${c}-divider__line--left`}),!s&&e.default?l(H,null,l("div",{class:`${c}-divider__title`},this.$slots),l("div",{class:`${c}-divider__line ${c}-divider__line--right`})):null)}});function xe(t){const{textColor2:e,cardColor:o,modalColor:s,popoverColor:g,dividerColor:h,borderRadius:c,fontSize:f,hoverColor:r}=t;return{textColor:e,color:o,colorHover:r,colorModal:s,colorHoverModal:P(s,r),colorPopover:g,colorHoverPopover:P(g,r),borderColor:h,borderColorModal:P(s,h),borderColorPopover:P(g,h),borderRadius:c,fontSize:f}}const _e={name:"List",common:O,self:xe},ye=_e;function Ce(t){const{textColor1:e,textColor2:o,fontWeightStrong:s,fontSize:g}=t;return{fontSize:g,titleTextColor:e,textColor:o,titleFontWeight:s}}const $e={name:"Thing",common:O,self:Ce},we=$e,ze=y([m("list",`
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
 `)])]),Y(m("list",`
 --n-merged-color-hover: var(--n-color-hover-modal);
 --n-merged-color: var(--n-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `)),Z(m("list",`
 --n-merged-color-hover: var(--n-color-hover-popover);
 --n-merged-color: var(--n-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `))]),ke=Object.assign(Object.assign({},w.props),{size:{type:String,default:"medium"},bordered:Boolean,clickable:Boolean,hoverable:Boolean,showDivider:{type:Boolean,default:!0}}),W=re("n-list"),Re=$({name:"List",props:ke,slots:Object,setup(t){const{mergedClsPrefixRef:e,inlineThemeDisabled:o,mergedRtlRef:s}=B(t),g=M("List",s,e),h=w("List","-list",ze,ye,t,e);ee(W,{showDividerRef:te(t,"showDivider"),mergedClsPrefixRef:e});const c=S(()=>{const{common:{cubicBezierEaseInOut:r},self:{fontSize:p,textColor:v,color:z,colorModal:E,colorPopover:j,borderColor:F,borderColorModal:U,borderColorPopover:q,borderRadius:G,colorHover:J,colorHoverModal:Q,colorHoverPopover:X}}=h.value;return{"--n-font-size":p,"--n-bezier":r,"--n-text-color":v,"--n-color":z,"--n-border-radius":G,"--n-border-color":F,"--n-border-color-modal":U,"--n-border-color-popover":q,"--n-color-modal":E,"--n-color-popover":j,"--n-color-hover":J,"--n-color-hover-modal":Q,"--n-color-hover-popover":X}}),f=o?I("list",void 0,c,t):void 0;return{mergedClsPrefix:e,rtlEnabled:g,cssVars:o?void 0:c,themeClass:f==null?void 0:f.themeClass,onRender:f==null?void 0:f.onRender}},render(){var t;const{$slots:e,mergedClsPrefix:o,onRender:s}=this;return s==null||s(),l("ul",{class:[`${o}-list`,this.rtlEnabled&&`${o}-list--rtl`,this.bordered&&`${o}-list--bordered`,this.showDivider&&`${o}-list--show-divider`,this.hoverable&&`${o}-list--hoverable`,this.clickable&&`${o}-list--clickable`,this.themeClass],style:this.cssVars},e.header?l("div",{class:`${o}-list__header`},e.header()):null,(t=e.default)===null||t===void 0?void 0:t.call(e),e.footer?l("div",{class:`${o}-list__footer`},e.footer()):null)}}),k=$({name:"ListItem",slots:Object,setup(){const t=ie(W,null);return t||oe("list-item","`n-list-item` must be placed in `n-list`."),{showDivider:t.showDividerRef,mergedClsPrefix:t.mergedClsPrefixRef}},render(){const{$slots:t,mergedClsPrefix:e}=this;return l("li",{class:`${e}-list-item`},t.prefix?l("div",{class:`${e}-list-item__prefix`},t.prefix()):null,t.default?l("div",{class:`${e}-list-item__main`},t):null,t.suffix?l("div",{class:`${e}-list-item__suffix`},t.suffix()):null,this.showDivider&&l("div",{class:`${e}-list-item__divider`}))}}),Pe=m("thing",`
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
 `)])])]),Se=Object.assign(Object.assign({},w.props),{title:String,titleExtra:String,description:String,descriptionClass:String,descriptionStyle:[String,Object],content:String,contentClass:String,contentStyle:[String,Object],contentIndented:Boolean}),R=$({name:"Thing",props:Se,slots:Object,setup(t,{slots:e}){const{mergedClsPrefixRef:o,inlineThemeDisabled:s,mergedRtlRef:g}=B(t),h=w("Thing","-thing",Pe,we,t,o),c=M("Thing",g,o),f=S(()=>{const{self:{titleTextColor:p,textColor:v,titleFontWeight:z,fontSize:E},common:{cubicBezierEaseInOut:j}}=h.value;return{"--n-bezier":j,"--n-font-size":E,"--n-text-color":v,"--n-title-font-weight":z,"--n-title-text-color":p}}),r=s?I("thing",void 0,f,t):void 0;return()=>{var p;const{value:v}=o,z=c?c.value:!1;return(p=r==null?void 0:r.onRender)===null||p===void 0||p.call(r),l("div",{class:[`${v}-thing`,r==null?void 0:r.themeClass,z&&`${v}-thing--rtl`],style:s?void 0:f.value},e.avatar&&t.contentIndented?l("div",{class:`${v}-thing-avatar`},e.avatar()):null,l("div",{class:`${v}-thing-main`},!t.contentIndented&&(e.header||t.title||e["header-extra"]||t.titleExtra||e.avatar)?l("div",{class:`${v}-thing-avatar-header-wrapper`},e.avatar?l("div",{class:`${v}-thing-avatar`},e.avatar()):null,e.header||t.title||e["header-extra"]||t.titleExtra?l("div",{class:`${v}-thing-header-wrapper`},l("div",{class:`${v}-thing-header`},e.header||t.title?l("div",{class:`${v}-thing-header__title`},e.header?e.header():t.title):null,e["header-extra"]||t.titleExtra?l("div",{class:`${v}-thing-header__extra`},e["header-extra"]?e["header-extra"]():t.titleExtra):null),e.description||t.description?l("div",{class:[`${v}-thing-main__description`,t.descriptionClass],style:t.descriptionStyle},e.description?e.description():t.description):null):null):l(H,null,e.header||t.title||e["header-extra"]||t.titleExtra?l("div",{class:`${v}-thing-header`},e.header||t.title?l("div",{class:`${v}-thing-header__title`},e.header?e.header():t.title):null,e["header-extra"]||t.titleExtra?l("div",{class:`${v}-thing-header__extra`},e["header-extra"]?e["header-extra"]():t.titleExtra):null):null,e.description||t.description?l("div",{class:[`${v}-thing-main__description`,t.descriptionClass],style:t.descriptionStyle},e.description?e.description():t.description):null),e.default||t.content?l("div",{class:[`${v}-thing-main__content`,t.contentClass],style:t.contentStyle},e.default?e.default():t.content):null,e.footer?l("div",{class:`${v}-thing-main__footer`},e.footer()):null,e.action?l("div",{class:`${v}-thing-main__action`},e.action()):null))}}}),Ee={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 1024 1024"},je=d("path",{d:"M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 0 0-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z",fill:"currentColor"},null,-1),Ne=[je],Oe=$({name:"UploadOutlined",render:function(e,o){return A(),K("svg",Ee,Ne)}}),Be={class:"account-page"},Ie={class:"account-inner"},Le={class:"avatar-section"},Te={class:"avatar-wrap"},De={class:"profile-name"},Ve={class:"profile-details"},He={class:"detail-row"},Me={class:"detail-value"},Ae={class:"detail-row"},Ke={class:"detail-value"},We={class:"security-value"},Fe={class:"security-value security-value--success"},Ue={class:"security-value key-text"},qe=$({__name:"AccountCenter",setup(t){const e=ne(),o=L("ai_7f2d90a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"),s=L(!1),g=S(()=>o.value.substring(0,6)+"****************************"),h=f=>f?f.replace(/(\d{3})\d{4}(\d{4})/,"$1****$2"):"",c=()=>{navigator.clipboard.writeText(o.value),de.success("API 密钥已复制到剪贴板")};return(f,r)=>(A(),K("div",Be,[d("div",Ie,[r[16]||(r[16]=d("header",{class:"account-header"},[d("p",{class:"account-eyebrow"},"个人中心"),d("h1",{class:"account-title"},"账户设置"),d("p",{class:"account-sub"},"管理您的个人信息、登录凭证与安全偏好。")],-1)),a(i(ve),{"x-gap":24,"y-gap":24,cols:24},{default:n(()=>[a(i(V),{span:8},{default:n(()=>[a(i(T),{bordered:!1,class:"account-card profile-card"},{default:n(()=>[d("div",Le,[d("div",Te,[a(i(le),{size:96,round:"",style:{backgroundColor:"var(--color-primary-500)",fontSize:"38px"}},{default:n(()=>{var p;return[x(_((p=i(e).username)==null?void 0:p.slice(0,1).toUpperCase()),1)]}),_:1}),r[1]||(r[1]=d("div",{class:"avatar-ring"},null,-1))]),d("h2",De,_(i(e).username),1),a(i(ae),{type:"primary",round:"",size:"small",class:"profile-role-tag"},{default:n(()=>[x(_(i(e).role),1)]),_:1}),a(i(C),{size:"small",quaternary:"",round:"",class:"change-avatar-btn"},{icon:n(()=>[a(i(D),{component:i(Oe)},null,8,["component"])]),default:n(()=>[r[2]||(r[2]=x(" 更换头像 ",-1))]),_:1})]),a(i(be),{style:{margin:"16px 0"}}),d("div",Ve,[d("div",He,[r[3]||(r[3]=d("span",{class:"detail-label"},"账户名称",-1)),d("span",Me,_(i(e).username),1)]),d("div",Ae,[r[4]||(r[4]=d("span",{class:"detail-label"},"注册手机",-1)),d("span",Ke,_(i(e).phone),1)])])]),_:1})]),_:1}),a(i(V),{span:16},{default:n(()=>[a(i(T),{title:"安全设置",bordered:!1,class:"account-card"},{default:n(()=>[a(i(Re),{"show-divider":!0},{default:n(()=>[a(i(k),null,{suffix:n(()=>[a(i(C),{text:"",type:"primary"},{default:n(()=>[...r[5]||(r[5]=[x("修改",-1)])]),_:1})]),default:n(()=>[a(i(R),{title:"登录密码"},{description:n(()=>[...r[6]||(r[6]=[d("span",{class:"security-desc"},"安全性高的密码可以使账号更安全。建议您定期更换密码。",-1)])]),_:1})]),_:1}),a(i(k),null,{suffix:n(()=>[a(i(C),{text:"",type:"primary"},{default:n(()=>[...r[7]||(r[7]=[x("修改",-1)])]),_:1})]),default:n(()=>[a(i(R),{title:"手机绑定"},{description:n(()=>[r[8]||(r[8]=d("span",{class:"security-desc"},"绑定手机号码用于接收验证码、找回密码、重要安全设置的校验等。",-1)),d("div",We,_(h(i(e).phone)),1)]),_:1})]),_:1}),a(i(k),null,{suffix:n(()=>[a(i(C),{text:"",type:"primary"},{default:n(()=>[...r[9]||(r[9]=[x("修改",-1)])]),_:1})]),default:n(()=>[a(i(R),{title:"操作保护"},{description:n(()=>[r[11]||(r[11]=d("span",{class:"security-desc"},"在关键操作（如：API密钥重置、权限修改）时，通过验证方式再次确认您的身份。",-1)),d("div",Fe,[a(i(D),{component:i(ce)},null,8,["component"]),r[10]||(r[10]=x(" 已开启保护 ",-1))])]),_:1})]),_:1}),a(i(k),null,{suffix:n(()=>[a(i(se),null,{default:n(()=>[a(i(C),{text:"",type:"primary",onClick:r[0]||(r[0]=p=>s.value=!s.value)},{default:n(()=>[x(_(s.value?"隐藏":"显示"),1)]),_:1}),a(i(C),{text:"",type:"primary",onClick:c},{default:n(()=>[...r[12]||(r[12]=[x("复制",-1)])]),_:1})]),_:1})]),default:n(()=>[a(i(R),{title:"API 密钥 (Access Key)"},{description:n(()=>[r[13]||(r[13]=d("span",{class:"security-desc"},"用于调用平台 API 或执行引擎的身份凭证。请妥善保管。",-1)),d("div",Ue,_(s.value?o.value:g.value),1)]),_:1})]),_:1}),a(i(k),null,{suffix:n(()=>[a(i(C),{text:"",type:"primary"},{default:n(()=>[...r[14]||(r[14]=[x("修改",-1)])]),_:1})]),default:n(()=>[a(i(R),{title:"登录保持时长"},{description:n(()=>[...r[15]||(r[15]=[d("span",{class:"security-desc"},"您可以设置保持登录的时间长度，超过该时间系统会自动退出登录。（系统默认认证3小时）",-1),d("div",{class:"security-value"},"12小时",-1)])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})])]))}});const Ye=ue(qe,[["__scopeId","data-v-16489b2b"]]);export{Ye as default};
