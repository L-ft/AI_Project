import{l as T,aa as S,G as b,n as v,Z as $,p as f,az as J,aA as Q,d as k,q as B,v as V,s as R,S as X,M as Y,x as j,y as M,z as l,K as ee,L as te,bh as re,a2 as oe,o as A,c as D,a as c,u as ie,r as I,b as n,w as i,e as o,k as N,bw as ne,g as x,t as y,j as _,N as L,aN as le,m as ae}from"./index-7e07b5ae.js";import{C as se}from"./CheckCircleOutlined-bad8ba4b.js";import{a as O,N as de}from"./Grid-49ba8fa2.js";import{_ as ce}from"./_plugin-vue_export-helper-c27b6911.js";function ue(t){const{textColor2:e,cardColor:a,modalColor:d,popoverColor:h,dividerColor:g,borderRadius:p,fontSize:u,hoverColor:r}=t;return{textColor:e,color:a,colorHover:r,colorModal:d,colorHoverModal:S(d,r),colorPopover:h,colorHoverPopover:S(h,r),borderColor:g,borderColorModal:S(d,g),borderColorPopover:S(h,g),borderRadius:p,fontSize:u}}const ve={name:"List",common:T,self:ue},fe=ve;function he(t){const{textColor1:e,textColor2:a,fontWeightStrong:d,fontSize:h}=t;return{fontSize:h,titleTextColor:e,textColor:a,titleFontWeight:d}}const me={name:"Thing",common:T,self:he},ge=me,pe=b([v("list",`
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
 `,[$("show-divider",[v("list-item",[b("&:not(:last-child)",[f("divider",`
 background-color: var(--n-merged-border-color);
 `)])])]),$("clickable",[v("list-item",`
 cursor: pointer;
 `)]),$("bordered",`
 border: 1px solid var(--n-merged-border-color);
 border-radius: var(--n-border-radius);
 `),$("hoverable",[v("list-item",`
 border-radius: var(--n-border-radius);
 `,[b("&:hover",`
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
 `,[b("&:not(:last-child)",`
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
 `)])]),J(v("list",`
 --n-merged-color-hover: var(--n-color-hover-modal);
 --n-merged-color: var(--n-color-modal);
 --n-merged-border-color: var(--n-border-color-modal);
 `)),Q(v("list",`
 --n-merged-color-hover: var(--n-color-hover-popover);
 --n-merged-color: var(--n-color-popover);
 --n-merged-border-color: var(--n-border-color-popover);
 `))]),xe=Object.assign(Object.assign({},R.props),{size:{type:String,default:"medium"},bordered:Boolean,clickable:Boolean,hoverable:Boolean,showDivider:{type:Boolean,default:!0}}),H=ee("n-list"),be=k({name:"List",props:xe,slots:Object,setup(t){const{mergedClsPrefixRef:e,inlineThemeDisabled:a,mergedRtlRef:d}=B(t),h=V("List",d,e),g=R("List","-list",pe,fe,t,e);X(H,{showDividerRef:Y(t,"showDivider"),mergedClsPrefixRef:e});const p=j(()=>{const{common:{cubicBezierEaseInOut:r},self:{fontSize:m,textColor:s,color:C,colorModal:P,colorPopover:E,borderColor:K,borderColorModal:U,borderColorPopover:F,borderRadius:G,colorHover:W,colorHoverModal:q,colorHoverPopover:Z}}=g.value;return{"--n-font-size":m,"--n-bezier":r,"--n-text-color":s,"--n-color":C,"--n-border-radius":G,"--n-border-color":K,"--n-border-color-modal":U,"--n-border-color-popover":F,"--n-color-modal":P,"--n-color-popover":E,"--n-color-hover":W,"--n-color-hover-modal":q,"--n-color-hover-popover":Z}}),u=a?M("list",void 0,p,t):void 0;return{mergedClsPrefix:e,rtlEnabled:h,cssVars:a?void 0:p,themeClass:u==null?void 0:u.themeClass,onRender:u==null?void 0:u.onRender}},render(){var t;const{$slots:e,mergedClsPrefix:a,onRender:d}=this;return d==null||d(),l("ul",{class:[`${a}-list`,this.rtlEnabled&&`${a}-list--rtl`,this.bordered&&`${a}-list--bordered`,this.showDivider&&`${a}-list--show-divider`,this.hoverable&&`${a}-list--hoverable`,this.clickable&&`${a}-list--clickable`,this.themeClass],style:this.cssVars},e.header?l("div",{class:`${a}-list__header`},e.header()):null,(t=e.default)===null||t===void 0?void 0:t.call(e),e.footer?l("div",{class:`${a}-list__footer`},e.footer()):null)}}),w=k({name:"ListItem",slots:Object,setup(){const t=te(H,null);return t||re("list-item","`n-list-item` must be placed in `n-list`."),{showDivider:t.showDividerRef,mergedClsPrefix:t.mergedClsPrefixRef}},render(){const{$slots:t,mergedClsPrefix:e}=this;return l("li",{class:`${e}-list-item`},t.prefix?l("div",{class:`${e}-list-item__prefix`},t.prefix()):null,t.default?l("div",{class:`${e}-list-item__main`},t):null,t.suffix?l("div",{class:`${e}-list-item__suffix`},t.suffix()):null,this.showDivider&&l("div",{class:`${e}-list-item__divider`}))}}),_e=v("thing",`
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
 `)]),f("description",[b("&:not(:last-child)",`
 margin-bottom: 4px;
 `)]),f("content",[b("&:not(:first-child)",`
 margin-top: 12px;
 `)]),f("footer",[b("&:not(:first-child)",`
 margin-top: 12px;
 `)]),f("action",[b("&:not(:first-child)",`
 margin-top: 12px;
 `)])])]),ye=Object.assign(Object.assign({},R.props),{title:String,titleExtra:String,description:String,descriptionClass:String,descriptionStyle:[String,Object],content:String,contentClass:String,contentStyle:[String,Object],contentIndented:Boolean}),z=k({name:"Thing",props:ye,slots:Object,setup(t,{slots:e}){const{mergedClsPrefixRef:a,inlineThemeDisabled:d,mergedRtlRef:h}=B(t),g=R("Thing","-thing",_e,ge,t,a),p=V("Thing",h,a),u=j(()=>{const{self:{titleTextColor:m,textColor:s,titleFontWeight:C,fontSize:P},common:{cubicBezierEaseInOut:E}}=g.value;return{"--n-bezier":E,"--n-font-size":P,"--n-text-color":s,"--n-title-font-weight":C,"--n-title-text-color":m}}),r=d?M("thing",void 0,u,t):void 0;return()=>{var m;const{value:s}=a,C=p?p.value:!1;return(m=r==null?void 0:r.onRender)===null||m===void 0||m.call(r),l("div",{class:[`${s}-thing`,r==null?void 0:r.themeClass,C&&`${s}-thing--rtl`],style:d?void 0:u.value},e.avatar&&t.contentIndented?l("div",{class:`${s}-thing-avatar`},e.avatar()):null,l("div",{class:`${s}-thing-main`},!t.contentIndented&&(e.header||t.title||e["header-extra"]||t.titleExtra||e.avatar)?l("div",{class:`${s}-thing-avatar-header-wrapper`},e.avatar?l("div",{class:`${s}-thing-avatar`},e.avatar()):null,e.header||t.title||e["header-extra"]||t.titleExtra?l("div",{class:`${s}-thing-header-wrapper`},l("div",{class:`${s}-thing-header`},e.header||t.title?l("div",{class:`${s}-thing-header__title`},e.header?e.header():t.title):null,e["header-extra"]||t.titleExtra?l("div",{class:`${s}-thing-header__extra`},e["header-extra"]?e["header-extra"]():t.titleExtra):null),e.description||t.description?l("div",{class:[`${s}-thing-main__description`,t.descriptionClass],style:t.descriptionStyle},e.description?e.description():t.description):null):null):l(oe,null,e.header||t.title||e["header-extra"]||t.titleExtra?l("div",{class:`${s}-thing-header`},e.header||t.title?l("div",{class:`${s}-thing-header__title`},e.header?e.header():t.title):null,e["header-extra"]||t.titleExtra?l("div",{class:`${s}-thing-header__extra`},e["header-extra"]?e["header-extra"]():t.titleExtra):null):null,e.description||t.description?l("div",{class:[`${s}-thing-main__description`,t.descriptionClass],style:t.descriptionStyle},e.description?e.description():t.description):null),e.default||t.content?l("div",{class:[`${s}-thing-main__content`,t.contentClass],style:t.contentStyle},e.default?e.default():t.content):null,e.footer?l("div",{class:`${s}-thing-main__footer`},e.footer()):null,e.action?l("div",{class:`${s}-thing-main__action`},e.action()):null))}}}),Ce={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 1024 1024"},$e=c("path",{d:"M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 0 0-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z",fill:"currentColor"},null,-1),we=[$e],ze=k({name:"UploadOutlined",render:function(e,a){return A(),D("svg",Ce,we)}}),ke={class:"account-container"},Se={class:"avatar-section"},Re={class:"user-details"},Pe={class:"detail-item"},Ee={class:"value"},je={class:"detail-item"},Ie={class:"value"},Ne={class:"security-value"},Le={class:"security-value status-on"},Oe={class:"security-value key-text"},Te=k({__name:"AccountCenter",setup(t){const e=ie(),a=I("ai_7f2d90a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p"),d=I(!1),h=j(()=>a.value.substring(0,6)+"****************************"),g=u=>u?u.replace(/(\d{3})\d{4}(\d{4})/,"$1****$2"):"",p=()=>{navigator.clipboard.writeText(a.value),ae.success("API 密钥已复制到剪贴板")};return(u,r)=>(A(),D("div",ke,[n(o(de),{"x-gap":24,cols:24},{default:i(()=>[n(o(O),{span:8},{default:i(()=>[n(o(N),{class:"info-card",bordered:!1},{default:i(()=>[c("div",Se,[n(o(ne),{size:120,round:"",style:{backgroundColor:"#0077ff",fontSize:"48px"}},{default:i(()=>{var m;return[x(y((m=o(e).username)==null?void 0:m.slice(0,1).toUpperCase()),1)]}),_:1}),n(o(_),{class:"change-avatar-btn",size:"small",quaternary:"",round:""},{icon:i(()=>[n(o(L),{component:o(ze)},null,8,["component"])]),default:i(()=>[r[1]||(r[1]=x(" 更换头像 ",-1))]),_:1})]),c("div",Re,[c("div",Pe,[r[2]||(r[2]=c("span",{class:"label"},"账户名称：",-1)),c("span",Ee,y(o(e).username),1)]),c("div",je,[r[3]||(r[3]=c("span",{class:"label"},"注册账号：",-1)),c("span",Ie,y(o(e).phone),1)])])]),_:1})]),_:1}),n(o(O),{span:16},{default:i(()=>[n(o(N),{title:"安全设置",bordered:!1,class:"security-card"},{default:i(()=>[n(o(be),{"show-divider":!0},{default:i(()=>[n(o(w),null,{suffix:i(()=>[n(o(_),{text:"",type:"primary"},{default:i(()=>[...r[4]||(r[4]=[x("修改",-1)])]),_:1})]),default:i(()=>[n(o(z),{title:"登录密码"},{description:i(()=>[...r[5]||(r[5]=[c("span",{class:"security-desc"},"安全性高的密码可以使账号更安全。建议您定期更换密码。",-1)])]),_:1})]),_:1}),n(o(w),null,{suffix:i(()=>[n(o(_),{text:"",type:"primary"},{default:i(()=>[...r[6]||(r[6]=[x("修改",-1)])]),_:1})]),default:i(()=>[n(o(z),{title:"手机绑定"},{description:i(()=>[r[7]||(r[7]=c("span",{class:"security-desc"},"绑定手机号码用于接收验证码、找回密码、重要安全设置的校验等。",-1)),c("div",Ne,y(g(o(e).phone)),1)]),_:1})]),_:1}),n(o(w),null,{suffix:i(()=>[n(o(_),{text:"",type:"primary"},{default:i(()=>[...r[8]||(r[8]=[x("修改",-1)])]),_:1})]),default:i(()=>[n(o(z),{title:"操作保护"},{description:i(()=>[r[10]||(r[10]=c("span",{class:"security-desc"},"在关键操作（如：API密钥重置、权限修改）时，通过验证方式再次确认您的身份。",-1)),c("div",Le,[n(o(L),{component:o(se)},null,8,["component"]),r[9]||(r[9]=x(" 已开启保护 ",-1))])]),_:1})]),_:1}),n(o(w),null,{suffix:i(()=>[n(o(le),null,{default:i(()=>[n(o(_),{text:"",type:"primary",onClick:r[0]||(r[0]=m=>d.value=!d.value)},{default:i(()=>[x(y(d.value?"隐藏":"显示"),1)]),_:1}),n(o(_),{text:"",type:"primary",onClick:p},{default:i(()=>[...r[11]||(r[11]=[x("复制",-1)])]),_:1})]),_:1})]),default:i(()=>[n(o(z),{title:"API 密钥 (Access Key)"},{description:i(()=>[r[12]||(r[12]=c("span",{class:"security-desc"},"用于调用平台 API 或执行引擎的身份凭证。请妥善保管。",-1)),c("div",Oe,y(d.value?a.value:h.value),1)]),_:1})]),_:1}),n(o(w),null,{suffix:i(()=>[n(o(_),{text:"",type:"primary"},{default:i(()=>[...r[13]||(r[13]=[x("修改",-1)])]),_:1})]),default:i(()=>[n(o(z),{title:"登录保持时长"},{description:i(()=>[...r[14]||(r[14]=[c("span",{class:"security-desc"},"您可以设置保持登录的时间长度，超过该时间系统会自动退出登录。（系统默认认证3小时）",-1),c("div",{class:"security-value"},"12小时",-1)])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]))}});const De=ce(Te,[["__scopeId","data-v-fd66ab2d"]]);export{De as default};
