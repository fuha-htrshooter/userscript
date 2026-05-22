// ==UserScript==
// @name         DDRプレイ履歴送信
// @namespace    https://github.com/fuha-htrshooter/
// @version      0.5
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

    // 送信先URL
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxrmfvUThg6E4_-X--TlWVoB1wleEPL5mDWgKngTDlbPdJ7cmhuM2N8myr4wCOGlzxb/exec";

    add_button(document.getElementsByTagName("h2")[0], function (e) {
        // 送信確認
        if (!confirm("送信します。よろしいですか？")) {
            return;
        }

        // 出力バッファ
        var data = [];

        // 行ごとにテーブル処理
        $('#data_tbl tr').each(function(rownum) {
            // 1行分のバッファ配列
            var row = [];

            // 列ごとに行処理
            $(this).find('td').each(function(colnum) {
                if (colnum == 1) {
                    // 難易度
                    var styleTxt = $(this).find('[class="style"]').text().replace("DOUBLE","DP-").replace("SINGLE","SP-");
                    var difficultTxt = $(this).find('[class="difficulty"]').text();
                    row.push(styleTxt + difficultTxt);
                } else if (colnum == 2) {
                    // ランク
                    var rankSrc = $(this).find('img[src^="/game/ddr/ddrworld/images/playdata/rank_"]').attr('src');
                    var rankTxt = rankSrc.split('/').pop().split('?')[0].replace(/rank_s_|\.png/g, "");
                    row.push(rankTxt.replace("_p", "+").replace("_m", "-").toUpperCase());
                } else {
                    // 上記以外
                    row.push($(this).text().trim());
                }
            });

            // 1行分を追加
            data.push({
                name: row[0],
                chart: row[1],
                rank: row[2],
                score: row[3],
                timestamp: row[4]
            });
        });

        // 送信実行
        GM_xmlhttpRequest({
            method: "POST",
            url: GAS_URL,
            data: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            },
            onload: res => {
                alert(res.responseText);
            },
            onerror: res => {
                alert("[error] status: " + res.status + "\n" + res.responseText);
            },
            onabort: res => {
                alert("[abort] status: " + res.status + "\n" + res.responseText);
            },
        });
    });
})();
