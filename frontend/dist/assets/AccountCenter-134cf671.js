import{l as L,L as S,T as _,n as v,M as $,p as f,bl as G,bm as X,d as k,q as B,v as D,s as R,O as Y,Z,x as N,y as A,z as a,S as J,X as Q,aO as ee,a4 as te,u as re,r as j,c as oe,a as l,b as n,w as i,e as o,o as ie,k as I,bY as ne,g as h,t as x,H as ae,j as y,N as T,a5 as le,m as se}from"./index-a57f3fe4.js";import{U as de}from"./UploadOutlined-739f004f.js";import{C as ce}from"./CheckCircleOutlined-3844a90f.js";import{a as O,N as ue}from"./Grid-6473c156.js";import{N as ve}from"./Divider-14dbf0e4.js";import{_ as fe}from"./_plugin-vue_export-helper-c27b6911.js";function me(t){const{textColor2:e,cardColor:s,modalColor:c,popoverColor:m,dividerColor:p,borderRadius:b,fontSize:u,hoverColor:r}=t;return{textColor:e,color:s,colorHover:r,colorModal:c,colorHoverModal:S(c,r),colorPopover:m,colorHoverPopover:S(m,r),borderColor:p,borderColorModal:S(c,p),borderColorPopover:S(m,p),borderRadius:b,fontSize:u}}const ge={name:"List",common:L,self:me},he=ge;function pe(t){const{textColor1:e,textColor2:s,fontWeightStrong:c,fontSize:m}=t;return{fontSize:m,titleTextColor:e,textColor:s,titleFontWeight:c}}const be={name:"Thing",common:L,self:pe},xe=be,_e=_([v("list",`
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
 `,[$("show-divider",[v("list-item",[_("&:not(:last-child)",[f("divider",`
 background-color: var(--n-merged-border-color);
 `)])])]),$("clickable",[v("list-item",`
 cursor: pointer;
 `)]),$("bordered",`
 border: 1px solid var(--n-merged-border-color);
 border-radius: var(--n-border-radius);
 `),$("hoverable",[v("list-item",`
 border-radius: var(--n-border-radius);
 `,[_("&:hover",`
 background-color: var(--n-merged-color-hover);
 `,[f("divider",`
 background-color: transparent;
 `)])])]),$("bordered, hoverable",[v("list-item",`
 padding: 12px 20px;
 `),f("header, footer",`
 padding: 12px 20px;
 `)]),f("header, footer",`
 padding: 12px 0;
 box-sizing: border-box;
 transition: border-color .3s var(--n-bezier);
 `,[_("&:not(:last-child)",`
 border-bottom: 1px solid var(--n-merged-border-color);
 `)]),v("list-item",`
 position: relative;
 padding: 12px 0; 
 box-sizing: border-box;
 display: flex;
 flex-wrap: nowrap;
 align-items: center;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[f("prefix",`
 margin-right: 20px;
 flex: 0;
 `),f("suffix",`
 margin-left: 20px;
 flex: 0;
 `),f("main",`
 flex: 1;
 `),f("divider",`
 height: 1px;
 position: absolute;
 bottom: 0;
 left: 0;
 right: 0;
 background-color: transparent;
 transition: background-color .3s var(--n-bezier);
 pointer-events: none;
 `)])]),G(v("list",`
 --n-merged-color-hover: var(--n-color-hover-modal);
 --n-merged-color: var(--n-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `)),X(v("list",`
 --n-merged-color-hover: var(--n-color-hover-popover);
 --n-merged-color: var(--n-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `))]),ye=Object.assign(Object.assign({},R.props),{size:{type:String,default:"medium"},bordered:Boolean,clickable:Boolean,hoverable:Boolean,showDivider:{type:Boolean,default:!0}}),H=J("n-list"),Ce=k({name:"List",props:ye,slots:Object,setup(t){const{mergedClsPrefixRef:e,inlineThemeDisabled:s,mergedRtlRef:c}=B(t),m=D("List",c,e),p=R("List","-list",_e,he,t,e);Y(H,{showDividerRef:Z(t,"showDivider"),mergedClsPrefixRef:e});const b=N(()=>{const{common:{cubicBezierEaseInOut:r},self:{fontSize:g,textColor:d,color:C,colorModal:P,colorPopover:E,borderColor:M,borderColorModal:V,borderColorPopover:K,borderRadius:U,colorHover:F,colorHoverModal:W,colorHoverPopover:q}}=p.value;return{"--n-font-size":g,"--n-bezier":r,"--n-text-color":d,"--n-color":C,"--n-border-radius":U,"--n-border-color":M,"--n-border-color-modal":V,"--n-border-color-popover":K,"--n-color-modal":P,"--n-color-popover":E,"--n-color-hover":F,"--n-color-hover-modal":W,"--n-color-hover-popover":q}}),u=s?A("list",void 0,b,t):void 0;return{mergedClsPrefix:e,rtlEnabled:m,cssVars:s?void 0:b,themeClass:u==null?void 0:u.themeClass,onRender:u==null?void 0:u.onRender}},render(){var t;const{$slots:e,mergedClsPrefix:s,onRender:c}=this;return c==null||c(),a("ul",{class:[`${s}-list`,this.rtlEnabled&&`${s}-list--rtl`,this.bordered&&`${s}-list--bordered`,this.showDivider&&`${s}-list--show-divider`,this.hoverable&&`${s}-list--hoverable`,this.clickable&&`${s}-list--clickable`,this.themeClass],style:this.cssVars},e.header?a("div",{class:`${s}-list__header`},e.header()):null,(t=e.default)===null||t===void 0?void 0:t.call(e),e.footer?a("div",{class:`${s}-list__footer`},e.footer()):null)}}),z=k({name:"ListItem",slots:Object,setup(){const t=Q(H,null);return t||ee("list-item","`n-list-item` must be placed in `n-list`."),{showDivider:t.showDividerRef,mergedClsPrefix:t.mergedClsPrefixRef}},render(){const{$slots:t,mergedClsPrefix:e}=this;return a("li",{class:`${e}-list-item`},t.prefix?a("div",{class:`${e}-list-item__prefix`},t.prefix()):null,t.default?a("div",{class:`${e}-list-item__main`},t):null,t.suffix?a("div",{class:`${e}-list-item__suffix`},t.suffix()):null,this.showDivider&&a("div",{class:`${e}-list-item__divider`}))}}),$e=v("thing",`
 display: flex;
 transition: color .3s var(--n-bezier);
 font-size: var(--n-font-size);
 color: var(--n-text-color);
`,[v("thing-avatar",`
 margin-right: 12px;
 margin-top: 2px;
 `),v("thing-avatar-header-wrapper",`
 display: flex;
 flex-wrap: nowrap;
 `,[v("thing-header-wrapper",`
 flex: 1;
 `)]),v("thing-main",`
 flex-grow: 1;
 `,[v("thing-header",`
 display: flex;
 margin-bottom: 4px;
 justify-content: space-between;
 align-items: center;
 `,[f("title",`
 font-size: 16px;
 font-weight: var(--n-title-font-weight);
 transition: color .3s var(--n-bezier);
 color: var(--n-title-text-color);
 `)]),f("description",[_("&:not(:last-child)",`
 margin-bottom: 4px;
 `)]),f("content",[_("&:not(:first-child)",`
 margin-top: 12px;
 `)]),f("footer",[_("&:not(:first-child)",`
 margin-top: 12px;
 `)]),f("action",[_("&:not(:first-child)",`
 margin-top: 12px;
 `)])])]),ze=Object.assign(Object.assign({},R.props),{title:String,titleExtra:String,description:String,descriptionClass:String,descriptionStyle:[String,Object],content:String,contentClass:String,contentStyle:[String,Object],contentIndented:Boolean}),w=k({name:"Thing",props:ze,slots:Object,setup(t,{slots:e}){const{mergedClsPrefixRef:s,inlineThemeDisabled:c,mergedRtlRef:m}=B(t),p=R("Thing","-thing",$e,xe,t,s),b=D("Thing",m,s),u=N(()=>{const{self:{titleTextColor:g,textColor:d,titleFontWeight:C,fontSize:P},common:{cubicBezierEaseInOut:E}}=p.value;return{"--n-bezier":E,"--n-font-size":P,"--n-text-color":d,"--n-title-font-weight":C,"--n-title-text-color":g}}),r=c?A("thing",void 0,u,t):void 0;return()=>{var g;const{value:d}=s,C=b?b.value:!1;return(g=r==null?void 0:r.onRender)===null||g===void 0||g.call(r),a("div",{class:[`${d}-thing`,r==null?void 0:r.themeClass,C&&`${d}-thing--rtl`],style:c?void 0:u.value},e.avatar&&t.contentIndented?a("div",{class:`${d}-thing-avatar`},e.avatar()):null,a("div",{class:`${d}-thing-main`},!t.contentIndented&&(e.header||t.title||e["header-extra"]||t.titleExtra||e.avatar)?a("div",{class:`${d}-thing-avatar-header-wrapper`},e.avatar?a("div",{class:`${d}-thing-avatar`},e.avatar()):null,e.header||t.title||e["header-extra"]||t.titleExtra?a("div",{class:`${d}-thing-header-wrapper`},a("div",{class:`${d}-thing-header`},e.header||t.title?a("div",{class:`${d}-thing-header__title`},e.header?e.header():t.title):null,e["header-extra"]||t.titleExtra?a("div",{class:`${d}-thing-header__extra`},e["header-extra"]?e["header-extra"]():t.titleExtra):null),e.description||t.description?a("div",{class:[`${d}-thing-main__description`,t.descriptionClass],style:t.descriptionStyle},e.description?e.description():t.description):null):null):a(te,null,e.header||t.title||e["header-extra"]||t.titleExtra?a("div",{class:`${d}-thing-header`},e.header||t.title?a("div",{class:`${d}-thing-header__title`},e.header?e.header():t.title):null,e["header-extra"]||t.titleExtra?a("div",{class:`${d}-thing-header__extra`},e["header-extra"]?e["header-extra"]():t.titleExtra):null):null,e.description||t.description?a("div",{class:[`${d}-thing-main__description`,t.descriptionClass],style:t.descriptionStyle},e.description?e.description():t.description):null),e.default||t.content?a("div",{class:[`${d}-thing-main__content`,t.contentClass],style:t.contentStyle},e.default?e.default():t.content):null,e.footer?a("div",{class:`${d}-thing-main__footer`},e.footer()):null,e.action?a("div",{class:`${d}-thing-main__action`},e.action()):null))}}}),we={class:"account-page"},Se={class:"account-inner"},ke={class:"avatar-section"},Re={class:"avatar-wrap"},Pe={class:"profile-name"},Ee={class:"profile-details"},Ne={class:"detail-row"},je={class:"detail-value"},Ie={class:"detail-row"},Te={class:"detail-value"},Oe={class:"security-value"},Le={class:"security-value security-value--success"},Be={class:"security-value key-text"},De=k({__name:"AccountCenter",setup(t){const e=re(),s=j("ai_7f2d90a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"),c=j(!1),m=N(()=>s.value.substring(0,6)+"****************************"),p=u=>u?u.replace(/(\d{3})\d{4}(\d{4})/,"$1****$2"):"",b=()=>{navigator.clipboard.writeText(s.value),se.success("API 密钥已复制到剪贴板")};return(u,r)=>(ie(),oe("div",we,[l("div",Se,[r[16]||(r[16]=l("header",{class:"account-header"},[l("p",{class:"account-eyebrow"},"个人中心"),l("h1",{class:"account-title"},"账户设置"),l("p",{class:"account-sub"},"管理您的个人信息、登录凭证与安全偏好。")],-1)),n(o(ue),{"x-gap":24,"y-gap":24,cols:24},{default:i(()=>[n(o(O),{span:8},{default:i(()=>[n(o(I),{bordered:!1,class:"account-card profile-card"},{default:i(()=>[l("div",ke,[l("div",Re,[n(o(ne),{size:96,round:"",style:{backgroundColor:"var(--color-primary-500)",fontSize:"38px"}},{default:i(()=>{var g;return[h(x((g=o(e).username)==null?void 0:g.slice(0,1).toUpperCase()),1)]}),_:1}),r[1]||(r[1]=l("div",{class:"avatar-ring"},null,-1))]),l("h2",Pe,x(o(e).username),1),n(o(ae),{type:"primary",round:"",size:"small",class:"profile-role-tag"},{default:i(()=>[h(x(o(e).role),1)]),_:1}),n(o(y),{size:"small",quaternary:"",round:"",class:"change-avatar-btn"},{icon:i(()=>[n(o(T),{component:o(de)},null,8,["component"])]),default:i(()=>[r[2]||(r[2]=h(" 更换头像 ",-1))]),_:1})]),n(o(ve),{style:{margin:"16px 0"}}),l("div",Ee,[l("div",Ne,[r[3]||(r[3]=l("span",{class:"detail-label"},"账户名称",-1)),l("span",je,x(o(e).username),1)]),l("div",Ie,[r[4]||(r[4]=l("span",{class:"detail-label"},"注册手机",-1)),l("span",Te,x(o(e).phone),1)])])]),_:1})]),_:1}),n(o(O),{span:16},{default:i(()=>[n(o(I),{title:"安全设置",bordered:!1,class:"account-card"},{default:i(()=>[n(o(Ce),{"show-divider":!0},{default:i(()=>[n(o(z),null,{suffix:i(()=>[n(o(y),{text:"",type:"primary"},{default:i(()=>[...r[5]||(r[5]=[h("修改",-1)])]),_:1})]),default:i(()=>[n(o(w),{title:"登录密码"},{description:i(()=>[...r[6]||(r[6]=[l("span",{class:"security-desc"},"安全性高的密码可以使账号更安全。建议您定期更换密码。",-1)])]),_:1})]),_:1}),n(o(z),null,{suffix:i(()=>[n(o(y),{text:"",type:"primary"},{default:i(()=>[...r[7]||(r[7]=[h("修改",-1)])]),_:1})]),default:i(()=>[n(o(w),{title:"手机绑定"},{description:i(()=>[r[8]||(r[8]=l("span",{class:"security-desc"},"绑定手机号码用于接收验证码、找回密码、重要安全设置的校验等。",-1)),l("div",Oe,x(p(o(e).phone)),1)]),_:1})]),_:1}),n(o(z),null,{suffix:i(()=>[n(o(y),{text:"",type:"primary"},{default:i(()=>[...r[9]||(r[9]=[h("修改",-1)])]),_:1})]),default:i(()=>[n(o(w),{title:"操作保护"},{description:i(()=>[r[11]||(r[11]=l("span",{class:"security-desc"},"在关键操作（如：API密钥重置、权限修改）时，通过验证方式再次确认您的身份。",-1)),l("div",Le,[n(o(T),{component:o(ce)},null,8,["component"]),r[10]||(r[10]=h(" 已开启保护 ",-1))])]),_:1})]),_:1}),n(o(z),null,{suffix:i(()=>[n(o(le),null,{default:i(()=>[n(o(y),{text:"",type:"primary",onClick:r[0]||(r[0]=g=>c.value=!c.value)},{default:i(()=>[h(x(c.value?"隐藏":"显示"),1)]),_:1}),n(o(y),{text:"",type:"primary",onClick:b},{default:i(()=>[...r[12]||(r[12]=[h("复制",-1)])]),_:1})]),_:1})]),default:i(()=>[n(o(w),{title:"API 密钥 (Access Key)"},{description:i(()=>[r[13]||(r[13]=l("span",{class:"security-desc"},"用于调用平台 API 或执行引擎的身份凭证。请妥善保管。",-1)),l("div",Be,x(c.value?s.value:m.value),1)]),_:1})]),_:1}),n(o(z),null,{suffix:i(()=>[n(o(y),{text:"",type:"primary"},{default:i(()=>[...r[14]||(r[14]=[h("修改",-1)])]),_:1})]),default:i(()=>[n(o(w),{title:"登录保持时长"},{description:i(()=>[...r[15]||(r[15]=[l("span",{class:"security-desc"},"您可以设置保持登录的时间长度，超过该时间系统会自动退出登录。（系统默认认证3小时）",-1),l("div",{class:"security-value"},"12小时",-1)])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})])]))}});const Fe=fe(De,[["__scopeId","data-v-16489b2b"]]);export{Fe as default};
