// ==UserScript==
// @name         DLSiteのカート情報をテキスト化
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  カート情報をJSONでPOST送信する。受信側のGoogleスプレッドシートスクリプトと併用する。
// @author       fuha
// @match        https://www.dlsite.com/home/cart
// @match        https://www.dlsite.com/maniax/cart
// @match        https://www.dlsite.com/books/cart
// @match        https://www.dlsite.com/pro/cart
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=www.dlsite.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // ポイント還元率 (指定決済による固定還元前提)
    const POINT_PERCENT = 5
    // 受信したJSONを元に差分登録するスクリプト
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxkXIgA2eyp9U7pfh_HHp4RrTlzuJNmg6tpWtFYa2ZHN3iz0InQe_-qRi_qmKgQ0M6o/exec"

    $(function(){
        // ボタン押下時の処理に追加
        $('#submit_x').click(function(){
            // 出力バッファ
            var data = [];

            // 購入日
            const dt = new Date();
            const today = dt.getFullYear() + "/" +
                  (dt.getMonth() < 9 ? "0" : "") + (dt.getMonth() + 1) + "/" +
                  (dt.getDate() < 10 ? "0" : "") + dt.getDate();

            // アイテム毎に情報を取得して追加
            $(".buy_now .cart_list_item").each(function(index, element) {
                // 製品ID (画像URLから取得)
                const productId = $(element).find(".work_thumb img").attr("src").replace(/.*\/([A-Z0-9]*)_img_.*$/, "$1");
                // 製品名
                const title = $(element).find('.work_name a').text().trim(); ;
                // カテゴリ名
                const category = $(element).find(".work_category").text();
                // 元の価格
                const officialPrice = Number($(element).find(".work_price_original .work_price_base").text().replace(/,/, ''));
                // 割引後の価格
                const price = Number($(element).find(".work_price_discount .work_price_base").text().replace(/,/, ''));
                // 割引率
                const discount = officialPrice ? (100 - Math.round(price * 100 / officialPrice)) + "%" : "-";
                // ポイント (5%固定)
                const point = Math.round(price * 5 / 100);

                data.push({
                    today: today,
                    productId: productId,
                    title: title,
                    category: category,
                    officialPrice: officialPrice ? officialPrice : "-",
                    price: price,
                    discount: discount,
                    point: point
                });
            });

            // クーポン情報を追加
            $(".payment_confirm_box").each(function(index, element) {
                // クーポン名
                const title = $(element).find('.coupon_name').text();
                // 元の価格
                const officialPrice = Number($(element).find(".total_discount .work_price_base").text().replace(/,/, ''));
                // 割引後の価格
                const price = Number($(element).find(".coupon_detail .work_price_base").text().replace(/,/, ''));
                // 割引率
                const discount = (100 - Math.round(price * 100 / officialPrice)) + "%";

                data.push({
                    today: today,
                    productId: "-",
                    title: title,
                    category: "-",
                    officialPrice: "-",
                    price: price - officialPrice,
                    discount: discount,
                    point: "-"
                });
            });

            // 送信確認
            if (confirm("買い物データをスプレッドシートへ送信します。\n"
                        + "いいえの場合ダイアログ表示のみ行って次へ進みます。")) {
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
    });
})();
