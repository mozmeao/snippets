(function() {
    var brand_start = document.getElementById('brandStart'),
        doom_container = document.getElementById('doom_container'),
        bar = document.getElementById('black_bar_of_doom');


var date = new Date(),
    gmt = date.getTime() + (date.getTimezoneOffset() * 60),
    est = gmt - (5 * 60 * 60),
    end = new Date('Wed, 18 Jan 2012 20:00:00 EST').getTime();

    if (est < end) {
        doom_container.removeChild(bar);
        brand_start.appendChild(bar);
        document.body.className = 'dark';
    }
})();
