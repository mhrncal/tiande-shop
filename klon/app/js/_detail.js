if ($('.type-detail').length) {
    if ($('.tab-content .extended-description').length) {
        var $infoBox = $('<div class="tiande-info"></div>');
        $('.tab-content .extended-description .detail-parameters tr').each(function () {
            var label = $(this).find('th').text().trim().replace(':', '');
            var value = $(this).find('td').text().trim();
            if (label === 'Body' || label === 'Balení') {
                $infoBox.append(
                    '<div class="tiande-info__item">' +
                        '<div class="tiande-info__label">' + label + ':</div>' +
                        '<div class="tiande-info__value">' + value + '</div>' +
                    '</div>'
                );
            }
        });
        $infoBox.append(
            '<div class="tiande-info__item">' +
                '<div class="tiande-info__label">Kód produktu:</div>' +
                '<div class="tiande-info__value">' +$('.p-detail-inner .p-code span:not(.p-code-label)').html() + '</div>' +
            '</div>'
        );
        if ($infoBox.children().length) {
            $('.p-info-wrapper').append($infoBox);
        }
    }
    else{
        $('.p-info-wrapper').append('<div class="tiande-info__item">' +
                '<div class="tiande-info__label">Kód produktu:</div>' +
                '<div class="tiande-info__value">' +$('.p-detail-inner .p-code span:not(.p-code-label)').html() + '</div>' +
            '</div>');
    }

    $(function () {
        $('.p-final-price-wrapper').each(function () {
            var $wrapper = $(this);
            var $standard = $wrapper.find('.price-standard');
            var $final = $wrapper.find('.price-final');
            var $save = $wrapper.find('.price-save');
               
            
            // Ušetříte: XXX Kč (–XX %)
            if ($standard.length && $final.length && $save.length) {
                var standardPrice = parseFloat($standard.text().trim().replace(/\s/g, '').replace('Kč', '').replace(',', '.'));
                var finalPrice = parseFloat($final.find('.price-final-holder').text().trim().replace(/\s/g, '').replace('Kč', '').replace(',', '.'));
                var discountPercent = $.trim($save.text());
              

                if (!isNaN(standardPrice) && !isNaN(finalPrice)) {
                    var saved = standardPrice - finalPrice;
                    var savedFormatted = Number(saved).ShoptetFormatAsCurrency()
                    $save.html(
                        '<span class="custom-save-label">Ušetříte:</span>' +
                        '<span class="custom-save-value">' +
                            savedFormatted + ' (' + discountPercent + ')' +
                        '</span>'
                    );
                }
            }
            // Katalogová cena
            if ($standard.length && !$standard.find('.custom-price-label').length) {
                $standard.prepend('<span class="custom-price-label">Běžná cena:</span>');
            }
            // Vaše cena
           /* if ($final.length && !$final.find('.custom-price-label').length) {
                $final.prepend('<span class="custom-price-label">Vaše cena</span>');
            }*/
        });
    });
}