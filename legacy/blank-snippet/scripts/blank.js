(function() {
    var snippet = document.getElementById('blankSnippet');
    snippet.addEventListener('show_snippet', function(e) {
        document.getElementById('snippets').style.display = 'none';
        document.getElementById('contentContainer').style.backgroundImage = 'none';
    });
})();
