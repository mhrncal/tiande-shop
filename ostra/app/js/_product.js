document.addEventListener('ShoptetDOMPageContentLoaded', customProduct);
document.addEventListener('ShoptetPageSortingChanged', customProduct);
document.addEventListener('ShoptetDOMPageMoreProductsLoaded', customProduct);
$(document).ready(customProduct);

function customProduct() {
    var codes = [];

    $('.product').each(function () {
        var $p = $(this);
        var code = $p.find('[data-micro="sku"]').first().text().trim();

        if (!code || $p.data('points-loaded')) return;

        $p.attr('data-points-code', code);
        codes.push(code);
    });

    if (!codes.length) return;

    codes = [...new Set(codes)];

    $.ajax({
        url: 'https://tiande-8294.rostiapp.cz/import-bodu/product-points.php',
        type: 'GET',
        dataType: 'json',
        data: {
            codes: JSON.stringify(codes)
        },
        success: function (data) {
            if (!data.success || !data.products) return;

            var points = {};

            $.each(data.products, function (_, item) {
                points[String(item.code)] = item;
            });

            $('.product').each(function () {
                var $p = $(this);
                var code = $p.attr('data-points-code');
                var item = points[code];

                if (!code || !item) return;

                $p.data('points-loaded', true);

                if (!item.found) return;

                $p.find('.flag').filter(function () {
                    return $(this).text().trim().toUpperCase() === 'BODY';
                }).first().text('BODY ' + item.points);
            });
        },
        error: function (xhr, status, error) {
            console.error('Points API:', status, error);
            console.log(xhr.responseText);
        }
    });
}