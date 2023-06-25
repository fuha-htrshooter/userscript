// ==UserScript==
// @name         DDRプレイ履歴コピー
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  「最近プレーした楽曲」画面の表示時、表示内容をコピペ用テキストにしたダイアログを出力する。
// @author       fuha
// @match        https://p.eagate.573.jp/game/ddr/ddra*/p/playdata/music_recent.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=573.jp
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    $(function() {
        // 出力文字列バッファ
        var text = '';

        // 行ごとにテーブル処理
        $('#data_tbl tr').each(function(rownum) {
            // 1行分のバッファ配列
            var row = [];
            // プレイスタイル表記 ("SP-" or "DP-")
            var playStyle = '';

            // 列ごとに行処理
            $(this).find('td').each(function(colnum) {
                // 詳細ページへのリンクからプレイスタイル取得 (後続列の変換で使用)
                var linkSrc = $(this).find('a[href^="/game/ddr/ddra3/p/playdata/music_detail.html?index="]').attr('href');
                if (linkSrc) {
                    playStyle = (linkSrc.slice(-1) <= 4) ? "SP-" : "DP-";
                }

                // 変換処理
                var colTxt = $(this).text().trim();
                var rankSrc = $(this).find('img[src^="/game/ddr/ddra3/p/images/play_data/rank_"]').attr('src');
                if (rankSrc) {
                    // ランク列：画像をURLから文字列化
                    var rankText = rankSrc.split('/').pop().split('?')[0].replace(/rank_s_|\.png/g, "");
                    row.push(rankText.replace("_p", "+").replace("_m", "-").toUpperCase());
                } else if (/^(BEGINNER|BASIC|DIFFICULT|EXPERT|CHALLENGE)$/.test(colTxt)) {
                    // 難易度列：プレイスタイルを前に追加
                    row.push(playStyle + colTxt);
                } else {
                    // 上記以外：そのまま設定
                    row.push(colTxt);
                }
            });

            // 1行をテキスト保存
            text += row.join('\t') + '\n';
        });

        // ダイアログ出力
        alert(text);
    })
})();
