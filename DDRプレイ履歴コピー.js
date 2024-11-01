// ==UserScript==
// @name          DDRプレイ履歴コピー
// @namespace    https://github.com/fuha-htrshooter/
// @version      0.4  2024/09/13  DDR WORLD対応
// @description  「最近プレーした楽曲」画面に、表示内容をコピペ用テキストにするボタンを追加する。
// @match        https://p.eagate.573.jp/game/ddr/ddr*/playdata/music_recent.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=573.jp
// @grant        GM_setClipboard
// ==/UserScript==

function add_button(appendParent, addEventFunction) {
    const zNode = document.createElement ("div");
    zNode.innerHTML = '<button id="myButton" type="button" style="display: block; text-align: center; vertical-align: middle; text-decoration: none; margin: auto; padding: 0.25rem 1rem; font-weight: bold; border: 2px solid #27acd9; background: #27acd9; color: #fff; transition: 0.5s;">TSVコピー</button>';
    zNode.setAttribute("id", "myContainer");
    appendParent.childNodes[0].setAttribute("style", "width: 88%; float: left")
    appendParent.appendChild(zNode);
    document.getElementById("myButton").addEventListener("click", addEventFunction, false);
}

(function() {
    'use strict';

    add_button(document.getElementsByTagName("h2")[0], function (e) {
        // 出力文字列バッファ
        var text = '';

        // 記録済みの最新プレー日時を入力（省略時は全件出力）
        var inputTs = prompt("記録済の最終プレー日時を入力");
        var recentTs = (inputTs != "") ? new Date(inputTs) : null;

        // 行ごとにテーブル処理
        $('#data_tbl tr').each(function(rownum) {
            // 前回のプレー日時より後のデータのみ表示
            var currentTs = new Date($(this).find('td:nth-child(5)').text());
            if (recentTs == null || recentTs < currentTs) {
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

                // 1行をテキスト保存
                text += row.join('\t') + '\n';
            }
        });

        // ダイアログ出力
        if (text == "") {
            // コピー不要
            alert("[対象なし] 記録が必要な履歴はありません。");
        } else {
            var lineNum = (text.match(/\n/g) || []).length;
            if (lineNum < 50) {
                // 通常コピー
                GM_setClipboard(text);
                alert("[正常終了] " + lineNum + "行コピーしました。");
            } else {
                // 記録漏れあり (コメント行を追加)
                const dt = new Date(new Date(inputTs).getTime() + 1000);
                const year = dt.getFullYear();
                const month = dt.getMonth() + 1;
                const day = dt.getDate();
                const hours = dt.getHours();
                const minutes = dt.getMinutes();
                const seconds = dt.getSeconds();
                text += `記録漏れ\t-\t-\t-\t${year}-${month}-${day} ${hours}:${minutes}:${seconds}\n`;

                GM_setClipboard(text);
                alert("[警告] 末尾まで到達。記録漏れの可能性があります。");
            }
        }
    });
})();
