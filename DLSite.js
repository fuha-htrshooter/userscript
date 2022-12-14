// ==UserScript==
// @name         DLSiteのカート情報をテキスト化
// @namespace    http://tampermonkey.net/
// @version      0.10
// @description  買い物記録シートに貼り付ける用のTSVを生成する。
// @author       fuha
// @match        https://www.dlsite.com/*/cart
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    $(function() {
        // 空ボックスを生成
        $('<div style="color:gray; overflow:scroll">' +
          'price-list made by Tempermonkey.<br>' +
          '<textarea id="forcopyarea" rows="10" cols="150" style="font-size:7pt; color:gray;">' +
          '</textarea></div>').appendTo(".confirm_title");

        // アイテム毎に情報を取得してテキストエリアに結合
        var itemNum = 0;
        $(".buy_now .cart_list_item").not("._removed").each(function(index, element) {
            itemNum++;
            var cartData = $("#forcopyarea").text();

            // 定価情報をAPIからAjaxで取得
            var productUrl = $(element).find(".work_thumb a").attr("href");
            console.log(element);
            var productId = productUrl.replace(/.*\/([^/]*).x?html?/, "$1");
            $.ajax({
                type: "POST",
                url: "https://www.dlsite.com/home/product/info/ajax/=/product_id/" + productId + ".html",
                scheme: "https",
                dataType:"json"
            }).done(function(json){
                // 取得したJSONから定価情報を取得 (no-value mean no discount)
                var targetData = json[productId]["official_price_str"] || json[productId]["price_str"];
                if (targetData == undefined) targetData = "";
                // 定価情報をテキストエリアへ反映
                var areaValue = $("#forcopyarea").text();
                $("#forcopyarea").text(areaValue.replace("<" + productId + ">", targetData));
            });

            var dt = new Date();
            var today = dt.getFullYear() + "/"
            + (dt.getMonth() < 9 ? "0" : "") + (dt.getMonth() + 1) + "/"
            + (dt.getDate() < 10 ? "0" : "") + dt.getDate();

            var title = $(element).find(".work_name a").text();
            var officialPrice = "<" + productId + ">";
            var discount = $(element).find(".type_sale").text().replace("%OFF", "%");
            if (discount == "") discount = "0%";
            var price = $(element).find(".work_price").text().replace(/[ \t\r\n]/g,"").replace(/円.*/, "");
            var point = $(element).find(".work_point").text().replace("pt還元", "").replace(/[ \t\r\n]/g,"");

            cartData = cartData + today + "\t" + title + "\t" + officialPrice + "\t" + price + "\t"
                + discount + "\t"+ point + "\r\n";
            $("#forcopyarea").text(cartData);
        });

        // クーポン情報を末尾に追記
        setTimeout(function() {
            $(".coupon_available").each(function(index, element) {
                var cartData = $("#forcopyarea").text();

                // クーポン名
                var couponName = $(element).find(".coupon_name").text();
                // 割引後価格
                var couponAmount = parseInt($(element).find(".coupon_detail .total").text().replace(",", ""));
                // 割引前価格
                var amount = parseInt($("._payment_amount").text().replace(",", ""));

                var dt = new Date();
                var today = dt.getFullYear() + "/"
                + (dt.getMonth() < 9 ? "0" : "") + (dt.getMonth() + 1) + "/"
                + (dt.getDate() < 10 ? "0" : "") + dt.getDate();

                cartData = cartData + today + "\t" + couponName + "\t\t" + (couponAmount - amount)
                    + "\t\t\r\n";
                $("#forcopyarea").text(cartData);
            })
        }, 500);
    });
})();
