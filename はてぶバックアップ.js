// ==UserScript==
// @name         はてブ編集中バックアップ
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  はてなブログの編集画面にて、内容を定期的に保存する。
// @author       fuha
// @match        https://blog.hatena.ne.jp/fuha/fuha.hatenablog.com/edit?*
// @import       https://code.jquery.com/jquery-3.4.1.slim.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 保存間隔 (秒)
    const SAVE_INTERVAL = 1800;
    // 保存キー
    const SAVE_KEY = "Fuha.HatenaBlog.Backup-";

    // 記事内容をHTMLへ直接挿入可能な文字列に変換する
    function escapeTextToHtml(strKiji) {
        if (!strKiji) return "";

        return strKiji.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 渡された関数を定期実行する関数
    function cronExec(waitSec, callbackFunc) {
        // 経過時間（秒）
        var spanedSec = 0;
        // 1秒間隔で無名関数を実行
        var id = setInterval(function () {
            spanedSec++;
            // 待機時間 <= 経過時間の場合、コールバック関数を実行して経過時間リセット
            if (waitSec <= spanedSec) {
                callbackFunc();
                spanedSec = 0;
            }
        }, 1000);
    }

    // 一覧HTMLを生成
    function getBackupListHtml() {
        // キー一覧取得
        var keyAry = [];
        var keylist = "";
        for (var i = 0; i < window.localStorage.length; i++) {
            var viewKey = window.localStorage.key(i);
            if (viewKey.startsWith(SAVE_KEY)) {
                keyAry.push(viewKey);
            }
        }
        // ソート実行
        keyAry.sort();
        // 一覧HTML生成
        for (i = 0; i < keyAry.length; i++) {
            keylist = keylist + '<dt style="text-decoration:underline" onclick="Fuha_clickTitle(this)">' + keyAry[i] + '</dt>'
                + '<dd style="display:none"><pre>' + escapeTextToHtml(window.localStorage.getItem(keyAry[i])) + '</pre></dd>';
        }
        return keylist;
    }

    // 読み込み後に実行
    $(function(){
        // 保存イベント登録
        cronExec(SAVE_INTERVAL, function() {
            var titleKey = $(".editor-title-input").val();
            var dt = new Date();
            var saveKey = SAVE_KEY + titleKey + "-"
                + dt.getFullYear()
                + (dt.getMonth() < 9 ? "0" : "") + (dt.getMonth() + 1)
                + (dt.getDate() < 10 ? "0" : "") + dt.getDate()
                + "-"
                + (dt.getHours() < 10 ? "0" : "") + dt.getHours()
                + (dt.getMinutes() < 10 ? "0" : "") + dt.getMinutes()
                + (dt.getSeconds() < 10 ? "0" : "") + dt.getSeconds();
            window.localStorage.setItem(saveKey, $(".editor-body-textarea").val());
            $("#fuha-bk-status").text("ステータス：保存実行　" + new Date());
            $("#fuha-bk-list").html(getBackupListHtml());
        });

        // 一覧を生成
        var initDt = new Date();
        var keylist = getBackupListHtml();
        $('<hr><div>■はてブ編集中バックアップ（保存間隔：' + SAVE_INTERVAL + '秒）　<button onclick="Fuha_delBk()">全削除</button><br>'
            + '<span id="fuha-bk-status">ステータス：初期表示　' + initDt + '</span>'
            + '<dl id="fuha-bk-list" style="border:1px black solid;height:200px;overflow:scroll;font-size:x-small">' + keylist + '</dl>'
            + '<script>function Fuha_delBk(){'
            + 'var kA=[];'
            + 'for(var i=0;i<window.localStorage.length;i++){'
            + 'var k=window.localStorage.key(i);'
            + 'if(k.startsWith("' + SAVE_KEY +'")){'
            + 'kA.push(k);'
            + '}}'
            + 'for(i=0;i<kA.length;i++){'
            + 'window.localStorage.removeItem(kA[i]);'
            + '}'
            + '$("#fuha-bk-status").text("ステータス：削除実行　" + new Date());'
            + '$("#fuha-bk-list").html("");'
            + '}'
            + 'function Fuha_clickTitle(e){'
            + 'var at=$(e).next().css("display");'
            + '$(e).next().css("display",(at=="none")?"inline":"none");'
            + '}</script></div>').appendTo("body");
    });
})();
