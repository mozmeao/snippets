# about:home Snippet Template

A template project layout to help jump-start Firefox about:home snippet
development.

## Prerequisites

* Tested on OS X Snow Leopard
* Python 2.7 (may work with older versions)
* (Recommended) virtualenv + pip
* (Recommended) A local install of [home-snippets-server][]

[home-snippets-server]: https://github.com/lmorchard/home-snippets-server

## How-to

1. `git clone git://github.com/Osmose/snippet-dev-template.git`
2. `cd snippet-dev-template`
  * (Optional) If you don't have Pystache or Fabric installed, or are running
    inside of a virtualenv,  run `pip install -r requirements.txt`
3. Create your snippet.
   * HTML goes in `content.html`
   * CSS in `styles.css`
   * Javascript in `script.js`
   * Images in `images/` (See 'Using Images' below)
4. `fab build`
   * Compiled snippet will be in `build.html`

## Auto-update Database

`fabfile.py` can create and update a snippet in your database directly.

1. `fab db_setup`
2. Enter an absolute path to the sqlite3 database file for your
   home-snippets-server.
3. Enter a name for the snippet. This will be used both for the snippet name
   and as the Product Name in the client match rule for the snippet to make it
   easier to preview the snippet.
3. `fab push`

**Note:** You can set the environment variable `HOMESNIPPETS_DATABASE` to the
absolute path to your database to bypass entering the path in every time you
create a new snippet and hook up your database.

## Auto-Build and Push

`fabfile.py` can also monitor your project for changes and automatically build your snippet and even push to the database without user input.

`fab monitor` will monitor for changes and execute a `build` and `push` when it detects changes.

## Using Images

Any images placed in the `images/` directory can be automatically embedded using data URIs into your content.html file:

```
content.html:

<img src="{{#base64img}}some_image.png{{/base64img}}" />
```

The result of the code above embeds `images/some_image.png` into an `<img>` tag in the snippet using base64 data URI encoding.

## Future Improvement Ideas

* Replace raw queries with a better alternative
