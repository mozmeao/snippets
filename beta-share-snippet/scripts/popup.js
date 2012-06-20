(function() {
    function popup_onclick(e) {
        e.preventDefault();
        var new_window = window.open(this.href, 'share', 'height=300, width=600');
        if (window.focus) {
            new_window.focus();
        }
    }

    var snippet = document.getElementById('beta-share-snippet');
    snippet.addEventListener('show_snippet', function(e) {
        var links = document.querySelectorAll('a.popup');
        for (var k = 0; k < links.length; k++) {
            var link = links[k];
            link.addEventListener('click', popup_onclick, true);
        }
    });
})();
