//<![CDATA[
var snippet_container = document.getElementById('snippetContainer');
var snippets = snippet_container.getElementsByClassName('snippet');
if (snippets.length > 0) {
    var show_snippet = snippets[Math.floor(Math.random()*snippets.length)];
    show_snippet.style.display = 'block';
    try {
        activateSnippetsButtonClick(show_snippet);
    } catch (err) {
        // Do nothing, most likely a newer version w/o
        // activateSnippetsButtonClick
    }

    // Send impression to the snippets stats server.
    var snippet_id = show_snippet.parentNode.dataset.snippetId;
    send_impression(snippet_id);

    // Trigger show_snippet event on snippet node.
    var evt = document.createEvent('Event');
    evt.initEvent('show_snippet', true, true);
    show_snippet.dispatchEvent(evt);
} else {
    localStorage['snippets'] = '';
    showSnippets();
}

// Notifies stats server that the given snippet ID
// was shown. No personally-identifiable information
// is sent.
function send_impression(id) {
    var sample_rate = 0.01;
    var url = 'https://snippets-stats.mozilla.org/foo.html';

    if (Math.random() <= sample_rate) {
        var r = XMLHttpRequest();
        r.open('POST', url + '?snippet_name=' + id);
        r.send();
    }
}
//]]>
