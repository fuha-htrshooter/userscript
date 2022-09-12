// ==UserScript==
// @name         ニコニコスクロール
// @namespace    http://tampermonkey.net/
// @description  視聴ページを表示され次第動画に合わせてスクロールする
// @version      0.01
// @author       fuha
// @match        *://www.nicovideo.jp/watch/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 動画へスクロールする
    $(function() {
        $("html,body").animate({scrollTop:$('.VideoOwnerIcon').offset().top});
    });
})();
