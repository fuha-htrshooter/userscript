// ==UserScript==
// @name         DDRプレイ履歴送信
// @namespace    https://github.com/fuha-htrshooter/
// @version      0.6
// @description  「最近プレーした楽曲」画面に、表内容をJSONでPOSTするボタンを追加する
// @match        https://p.eagate.573.jp/game/ddr/ddr*/playdata/music_recent.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=p.eagate.573.jp
// @grant        GM_xmlhttpRequest
// ==/UserScript==

function add_button(appendParent, addEventFunction) {
    const zNode = document.createElement ("div");
    zNode.innerHTML = '<button id="myButton" type="button" style="padding: 0.35rem 1rem; font-weight: bold; border: 2px solid #27acd9; background: #27acd9; color: #fff">送信</button>';
    zNode.setAttribute("id", "myContainer");
    appendParent.appendChild(zNode);
    document.getElementById("myButton").addEventListener("click", addEventFunction, false);
}

(function() {
    'use strict';

    // 受信したJSONを元に差分登録するスクリプト
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxrmfvUThg6E4_-X--TlWVoB1wleEPL5mDWgKngTDlbPdJ7cmhuM2N8myr4wCOGlzxb/exec";

    add_button(document.getElementsByTagName("h2")[0], function (e) {
        // 出力バッファ
        var data = [];

        // 行ごとにテーブル処理
        $('table.table-ui tbody tr').each(function(rownum) {
            // 曲名
            const name = $(this).find('.music-name').text().trim();
            // 難易度
            const difficulty = $(this).find('.diff-style-container .diff').contents()
            .filter(function(){return this.nodeType==Node.TEXT_NODE}).text().trim();
            const style = $(this).find('.diff-style-container .level').text().trim()
            .replace("DOUBLE","DP-").replace("SINGLE","SP-");
            // スコア
            const score = $(this).find('.score').text().trim();
            // ランク
            const rankSrc = $(this).find('.rank img[src*="/images/playdata/rank_"]').attr('src');
            const rank = rankSrc.split('/').pop().split('?')[0].replace(/rank_s_|\.png/g, "")
            .replace("_p", "+").replace("_m", "-").toUpperCase();
            // 日時
            const timestamp =  $(this).find('.date').text().trim();

            // 1行分を追加
            data.push({
                name: name,
                chart: style + difficulty,
                rank: rank,
                score: score,
                timestamp: timestamp
            });
        });

        // 送信確認
        if (confirm("送信しますか？\nいいえの場合ダイアログ表示のみ行って終了します。")) {
            // 送信実行
            const funcMsg = (ev, res) => alert("[" + ev + "] status: " + res.status + "\n" + res.responseText);
            GM_xmlhttpRequest({
                method: "POST",
                url: GAS_URL,
                data: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                },
                onload: res => alert(res.responseText),
                onerror: res => funcMsg("error", res),
                onabort: res => funcMsg("abort", res),
                ontimeout: res => funcMsg("timeout", res)
            });
        } else {
            // ダイアログ表示
            alert(JSON.stringify(data));
        }
    });
})();
