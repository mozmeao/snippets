# about:home Persona Switcher Snippet

Snippet for the Firefox about:home page that showcases personas and allows users to preview and install the personas directly from the about:home page.

## Development

* Set up [home-snippets-server][] and install [home-snippets-switcher][].
* Open a terminal.
* `git clone git://github.com/mozilla/about-home-persona-switcher.git`
* `cd about-home-persona-switcher`
* Paste the contents of `./snippet.html` into a new snippet via the home-snippets-server admin interface.
    * If you started the home-snippets-server with `python manage.py runserver` the admin interface is located at <http://localhost:8000/admin/>.
* In the `about-home-persona-switcher` directory, run the command `python -m SimpleHTTPServer 3033`
    * This runs a web server in the current directory on port 3033. If you want to use a different port, you will have to change the command as well as changing the iframe link in the snippet code.
* Navigate to `about:home` and make sure you point the home-snippets-switcher to `http://localhost:8000`

[home-snippets-server]: https://github.com/lmorchard/home-snippets-server
[home-snippets-switcher]: https://github.com/lmorchard/home-snippets-switcher
