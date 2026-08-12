(function ($) {

    var customer = getShoptetDataLayer('customer');
    var email = customer && customer.email ? customer.email : null;

    if (!email) return;

    var $body = $('body');
    var is9 = $body.hasClass('id--9');
    var is16 = $body.hasClass('id--16');
    var is17 = $body.hasClass('id--17');

    // První načtení stránky
    loadPoints();

    // Shoptet AJAX změna košíku
    if (is9) {
        $(document).on('ShoptetDOMContentLoaded', function () {
            loadPoints();
        });
    }


    function getItems() {
        var items = [];
        var selector = is9
            ? '.cart-table tr.removeable[data-micro-sku]'
            : '.cart-item[data-micro-sku]';

        $(selector).each(function () {
            var $item = $(this);
            var code = String($item.attr('data-micro-sku') || '').trim();

            var amount = is9
                ? parseFloat($item.find('input.amount').val()) || 0
                : parseFloat(
                    $item.find('.cart-item-amount').text().replace(',', '.')
                ) || 0;

            if (code && amount > 0) {
                items.push({
                    code: code,
                    amount: amount
                });
            }
        });

        return items;
    }


    function loadPoints() {
        $.getJSON(
            'https://tiande-8294.rostiapp.cz/import-bodu/api_points.php',
            {
                email: email,
                items: JSON.stringify(getItems())
            }
        ).done(function (data) {
            if (!data || !data.success) return;

            renderTop(data);

            if (is9) renderCart(data);
            if (is16 || is17) renderRecap(data);
            if (is17) fillOrderPoints(data);
        });
    }


    function getCurrent(data) {
        return round(
            parseFloat(
                data.current && typeof data.current === 'object'
                    ? data.current.points
                    : data.current
            ) || 0
        );
    }


    function getOrder(data) {
        return round(
            data.cart
                ? parseFloat(data.cart.points) || 0
                : 0
        );
    }


    function renderTop(data) {
        var months = [
            'lednu', 'únoru', 'březnu', 'dubnu',
            'květnu', 'červnu', 'červenci', 'srpnu',
            'září', 'říjnu', 'listopadu', 'prosinci'
        ];

        var $box = $('#mh-top-points');

        if (!$box.length) {
            $box = $('<div id="mh-top-points" class="mh-top-points"></div>');
            $('.top-navigation-tools').prepend($box);
        }

        $box.html(
            '<span>Body v ' + months[new Date().getMonth()] + ':</span> ' +
            '<strong>' + getCurrent(data) + '</strong>'
        );
    }


    function renderCart(data) {
        var current = getCurrent(data);
        var order = getOrder(data);
        var total = round(current + order);

        var discount = 0;
        var nextDiscount = 5;
        var nextLimit = 100;

        if (total >= 100) {
            discount = 5;
            nextDiscount = 10;
            nextLimit = 300;
        }

        if (total >= 300) {
            discount = 10;
            nextDiscount = 15;
            nextLimit = 1000;
        }

        if (total >= 1000) {
            discount = 15;
            nextDiscount = null;
            nextLimit = null;
        }

        var html =
            '<div class="mh-order-points">' +
                row('Aktuální měsíc:', current + ' bodů') +
                row('Tato objednávka:', order + ' bodů') +
                row('Celkem:', total + ' bodů');

        if (discount) {
            html +=
                '<div class="superSale">' +
                    'Dosažená sleva: <strong>' + discount + ' %</strong>' +
                '</div>';
        }

        if (nextDiscount !== null) {
            html +=
                '<div class="superSale">' +
                    'Do ' + nextDiscount + ' % bonusové slevy chybí ' +
                    '<strong>' +
                        round(Math.max(0, nextLimit - total)) +
                        ' bodů' +
                    '</strong>' +
                '</div>';
        } else {
            html +=
                '<div class="superSale">' +
                    '<strong>Dosáhli jste nejvyšší úrovně bonusové slevy.</strong>' +
                '</div>';
        }

        html +=
            '<p>' +
                '<a target="_blank" href="https://www.tiande-shop.eu/nakupni-akce/vyhodny-marketing-tiande">' +
                    'Podrobnosti o výpočtu bonusové slevy' +
                '</a>' +
            '</p>' +
            '</div>';

        var $box = $('#totalPoints');

        if (!$box.length) {
            $box = $('<div id="totalPoints"></div>');
            $('.cart-content .cart-summary').append($box);
        }

        $box.html(html);
    }


    function renderRecap(data) {
        var order = getOrder(data);

        if (!$('.totalpoints').length) {
            $('.order-summary-item .price-wrapper').append(
                '<span class="price-label price-secondary totalpoints">' +
                    'Součet bodů za objednávku' +
                '</span> ' +
                '<strong class="price price-secondary totalpoints-value">' +
                    order + ' bodů' +
                '</strong>'
            );
        } else {
            $('.totalpoints-value').text(order + ' bodů');
        }
    }


    function fillOrderPoints(data) {
        var order = getOrder(data);
        var $input = $('#order_additional_field_01_name');

        if (!$input.length) {
            var $form = $('.co-contact-information');

            if (!$form.length) return;

            $form.append(
                '<input type="hidden" ' +
                    'name="varchar1" ' +
                    'id="order_additional_field_01_name" ' +
                    'value="">'
            );

            $input = $('#order_additional_field_01_name');
        }

        $input.val(order);
    }


    function row(label, value) {
        return (
            '<div>' +
                '<span class="tiande-info__label">' + label + '</span>' +
                '<span class="tiande-info__value">' + value + '</span>' +
            '</div>'
        );
    }


    function round(n) {
        return Math.round(n * 10) / 10;
    }

})(jQuery);
