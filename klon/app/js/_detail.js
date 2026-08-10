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
        if ($infoBox.children().length) {
            $('.p-info-wrapper').append($infoBox);
        }
    }
}