(()=>{"use strict";var e,r,t,n,o,a={},i={};function s(e){var r=i[e];if(void 0!==r)return r.exports;var t=i[e]={id:e,loaded:!1,exports:{}};return a[e].call(t.exports,t,t.exports,s),t.loaded=!0,t.exports}s.m=a,s.amdD=function(){throw new Error("define cannot be used indirect")},s.amdO={},e="function"==typeof Symbol?Symbol("webpack queues"):"__webpack_queues__",r="function"==typeof Symbol?Symbol("webpack exports"):"__webpack_exports__",t="function"==typeof Symbol?Symbol("webpack error"):"__webpack_error__",n=e=>{e&&!e.d&&(e.d=1,e.forEach((e=>e.r--)),e.forEach((e=>e.r--?e.r++:e())))},s.a=(o,a,i)=>{var s;i&&((s=[]).d=1);var c,p,l,u=new Set,d=o.exports,f=new Promise(((e,r)=>{l=r,p=e}));f[r]=d,f[e]=e=>(s&&e(s),u.forEach(e),f.catch((e=>{}))),o.exports=f,a((o=>{var a;c=(o=>o.map((o=>{if(null!==o&&"object"==typeof o){if(o[e])return o;if(o.then){var a=[];a.d=0,o.then((e=>{i[r]=e,n(a)}),(e=>{i[t]=e,n(a)}));var i={};return i[e]=e=>e(a),i}}var s={};return s[e]=e=>{},s[r]=o,s})))(o);var i=()=>c.map((e=>{if(e[t])throw e[t];return e[r]})),p=new Promise((r=>{(a=()=>r(i)).r=0;var t=e=>e!==s&&!u.has(e)&&(u.add(e),e&&!e.d&&(a.r++,e.push(a)));c.map((r=>r[e](t)))}));return a.r?p:i()}),(e=>(e?l(f[t]=e):p(d),n(s)))),s&&(s.d=0)},o=[],s.O=(e,r,t,n)=>{if(!r){var a=1/0;for(l=0;l<o.length;l++){for(var[r,t,n]=o[l],i=!0,c=0;c<r.length;c++)(!1&n||a>=n)&&Object.keys(s.O).every((e=>s.O[e](r[c])))?r.splice(c--,1):(i=!1,n<a&&(a=n));if(i){o.splice(l--,1);var p=t();void 0!==p&&(e=p)}}return e}n=n||0;for(var l=o.length;l>0&&o[l-1][2]>n;l--)o[l]=o[l-1];o[l]=[r,t,n]},s.n=e=>{var r=e&&e.__esModule?()=>e.default:()=>e;return s.d(r,{a:r}),r},s.d=(e,r)=>{for(var t in r)s.o(r,t)&&!s.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:r[t]})},s.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),s.hmd=e=>((e=Object.create(e)).children||(e.children=[]),Object.defineProperty(e,"exports",{enumerable:!0,set:()=>{throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+e.id)}}),e),s.o=(e,r)=>Object.prototype.hasOwnProperty.call(e,r),s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),s.v=(e,r,t,n)=>{var o=fetch(s.p+""+t+".module.wasm");return"function"==typeof WebAssembly.instantiateStreaming?WebAssembly.instantiateStreaming(o,n).then((r=>Object.assign(e,r.instance.exports))):o.then((e=>e.arrayBuffer())).then((e=>WebAssembly.instantiate(e,n))).then((r=>Object.assign(e,r.instance.exports)))},(()=>{var e;s.g.importScripts&&(e=s.g.location+"");var r=s.g.document;if(!e&&r&&(r.currentScript&&(e=r.currentScript.src),!e)){var t=r.getElementsByTagName("script");t.length&&(e=t[t.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),s.p=e})(),(()=>{var e={303:0};s.O.j=r=>0===e[r];var r=(r,t)=>{var n,o,[a,i,c]=t,p=0;if(a.some((r=>0!==e[r]))){for(n in i)s.o(i,n)&&(s.m[n]=i[n]);if(c)var l=c(s)}for(r&&r(t);p<a.length;p++)o=a[p],s.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return s.O(l)},t=self.webpackChunk=self.webpackChunk||[];t.forEach(r.bind(null,0)),t.push=r.bind(null,t.push.bind(t))})()})();