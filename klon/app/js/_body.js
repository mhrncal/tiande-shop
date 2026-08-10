(function () {
    var customer = getShoptetDataLayer('customer');
    var email = customer && customer.email ? customer.email : null;
    if (!email) return;

    var is9 = $('body').hasClass('id--9');
    var is16 = $('body').hasClass('id--16');
    var is17 = $('body').hasClass('id--17');

    loadPoints();

    if (is9) {
        $(document).on('change', '.cart-table input.amount', debounce(loadPoints, 300));
        $(document).on('click', '.cart-table .increase, .cart-table .decrease, .cart-table .remove-item', debounce(loadPoints, 500));
    }

    function getItems() {
        var items = [];

        if (is9) {
            $('.cart-table tr.removeable[data-micro-sku]').each(function () {
                var sku = String($(this).attr('data-micro-sku') || '').trim();
                var amount = parseFloat($(this).find('input.amount').val()) || 0;

                if (sku && amount > 0) {
                    items.push({
                        code: sku,
                        amount: amount
                    });
                }
            });
        }

        if (is16 || is17) {
            $('.cart-item[data-micro-sku]').each(function () {
                var sku = String($(this).attr('data-micro-sku') || '').trim();

                var amount = parseFloat(
                    $(this)
                        .find('.cart-item-amount')
                        .text()
                        .replace(',', '.')
                ) || 0;

                if (sku && amount > 0) {
                    items.push({
                        code: sku,
                        amount: amount
                    });
                }
            });
        }

        return items;
    }

    function loadPoints() {
        $.ajax({
            url: 'https://tiande-8294.rostiapp.cz/api-points.php',
            type: 'GET',
            dataType: 'json',

            data: {
                email: email,
                items: JSON.stringify(getItems())
            },

            success: function (data) {
                if (!data || !data.success) return;

                renderTop(data);

                if (is9) {
                    renderCart(data);
                }

                if (is16 || is17) {
                    renderRecap(data);
                }

                if (is17) {
                    fillOrderPoints(data);
                }
            }
        });
    }

    function renderTop(data) {
        var current = round(parseFloat(data.current) || 0);

        var month = [
            'lednu',
            'únoru',
            'březnu',
            'dubnu',
            'květnu',
            'červnu',
            'červenci',
            'srpnu',
            'září',
            'říjnu',
            'listopadu',
            'prosinci'
        ][new Date().getMonth()];

        var $box = $('#mh-top-points');

        if (!$box.length) {
            $box = $('<div id="mh-top-points" class="mh-top-points"></div>');
            $('.top-navigation-tools').prepend($box);
        }

        $box.html(
            '<span>Body v ' + month + ':</span> ' +
            '<strong>' + current + '</strong>'
        );
    }

    function renderCart(data) {
        var current = round(parseFloat(data.current) || 0);
        var previous = round(parseFloat(data.previous) || 0);
        var order = round(data.cart ? parseFloat(data.cart.points) || 0 : 0);
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

        var missing = nextLimit !== null
            ? round(Math.max(0, nextLimit - total))
            : 0;

        var html =
            '<div class="mh-order-points">' +
                '<div>' +
                    '<span class="tiande-info__label">Aktuální měsíc:</span>' +
                    '<span class="tiande-info__value">' + current + ' bodů</span>' +
                '</div>' +
                '<div>' +
                    '<span class="tiande-info__label">Tato objednávka:</span>' +
                    '<span class="tiande-info__value">' + order + ' bodů</span>' +
                '</div>' +
                '<div>' +
                    '<span class="tiande-info__label">Celkem:</span>' +
                    '<span class="tiande-info__value">' + total + ' bodů</span>' +
                '</div>';

        if (discount) {
            html +=
                '<div class="superSale">' +
                    'Dosažená sleva: <strong>' + discount + ' %</strong>' +
                '</div>';
        }

        if (nextDiscount !== null) {
            html +=
                '<div class="superSale">' +
                    'Do ' + nextDiscount + ' % slevy chybí ' +
                    '<strong>' + missing + ' bodů</strong>' +
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
        var order = round(
            data.cart
                ? parseFloat(data.cart.points) || 0
                : 0
        );

        var $box = $('.totalpoints');

        if (!$box.length) {
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
        var order = round(
            data.cart ? parseFloat(data.cart.points) || 0 : 0
        );

        var $input = $('#order_additional_field_01_name');

        if (!$input.length) {
            var $form = $('.co-contact-information')

            if (!$form.length) {
                console.log('Nenalezen checkout formulář');
                return;
            }

            $form.append(
                '<div class="form-group hide dp-order-points-field"><label for="order_additional_field_01_name">Body za objednávku</label>' +
                
                    '<input ' +
                        'name="varchar1" ' +
                        'id="order_additional_field_01_name" ' +
                        'value="">' +
                '</div>'
            );

            $input = $('#order_additional_field_01_name');
        }

        $input.val(String(order));

        console.log('Body vloženy do varchar1:', $input.val());
    }

    function round(n) {
        return Math.round(n * 10) / 10;
    }

    function debounce(fn, wait) {
        var t;

        return function () {
            clearTimeout(t);
            t = setTimeout(fn, wait);
        };
    }
})();