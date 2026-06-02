// MindReply — booking.js
// Currency switcher, card interactions

(function () {
    'use strict';

    // ── Currency Switcher ──────────────────────────────────────────
    var activeCurrency = { rate: 1, symbol: '£' };

    function formatPrice(baseGbp, rate, symbol) {
        var converted = baseGbp * rate;
        if (rate >= 100) return symbol + ' ' + Math.round(converted).toLocaleString();
        return symbol + Math.round(converted * 2) / 2; // round to nearest 0.5
    }

    function updateAllPrices() {
        var els = document.querySelectorAll('[data-base-gbp]');
        els.forEach(function (el) {
            var base = parseFloat(el.getAttribute('data-base-gbp'));
            el.textContent = formatPrice(base, activeCurrency.rate, activeCurrency.symbol);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var tabs = document.querySelectorAll('.mr-currency-btn');
        tabs.forEach(function (btn) {
            btn.addEventListener('click', function () {
                tabs.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                activeCurrency = {
                    rate: parseFloat(btn.getAttribute('data-rate')),
                    symbol: btn.getAttribute('data-symbol')
                };
                updateAllPrices();
            });
        });
    });

    // ── Smooth filter scroll to grid ─────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        var chips = document.querySelectorAll('.mr-filter-chip');
        chips.forEach(function (chip) {
            chip.addEventListener('click', function (e) {
                // let the href navigate; just ensure grid is visible after load
                setTimeout(function () {
                    var grid = document.getElementById('profGrid');
                    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 80);
            });
        });
    });

}());
