# TODO: Figure out a better way to edit the DB

import base64
import ConfigParser
import os
import time
from os.path import isfile
from subprocess import CalledProcessError, check_output

import sqlite3
from fabric.decorators import task
from jinja2 import Environment, FileSystemLoader
from slimit import minify
from watchdog.events import PatternMatchingEventHandler
from watchdog.observers import Observer


BUILD_OUT_FILE = 'build.html'
SNIPPET_CONTENT_FILE = 'content.html'
JS_FILE = 'script.js'
CSS_FILE = 'styles.css'
LESS_FILE = 'styles.less'

LESS_BIN = os.environ.get('LESS_BIN', 'lessc')

IGNORE_PATTERNS = (BUILD_OUT_FILE, '.gitignore', 'fabfile.py', 'README.md',
                   'requirements.txt', 'LICENSE')
IGNORE_PATTERNS = ['*{0}'.format(filename) for filename in IGNORE_PATTERNS]

config = ConfigParser.ConfigParser()
config.read('.snippetconfig')
database_present = config.has_section('Database')


class MonitorBuildPushEventHandler(PatternMatchingEventHandler):
    def on_any_event(self, event):
        """Runs the build_push_all task when any filesystem event occurs."""
        print "Files have changed, pushing..."
        build()
        push()


env = Environment(autoescape=True, loader=FileSystemLoader('./'))


def base64img(filename):
    if filename.endswith('png'):
        mimetype = 'image/png'
    elif filename.endswith(('jpg', 'jpeg')):
        mimetype = 'image/jpeg'
    else:
        return ''

    with open(filename, 'r') as f:
        data = base64.encodestring(f.read())
    return 'data:%s;base64,%s' % (mimetype, data)
env.globals['base64img'] = base64img


@task
def monitor():
    """
    Monitors the current directory for changes and pushes when they happen.
    """
    observer = Observer()
    handler = MonitorBuildPushEventHandler(ignore_patterns=IGNORE_PATTERNS)
    observer.schedule(handler, '.', recursive=True)
    print "Monitoring for changes..."
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


@task
def push():
    """
    Checks for database configuration info and pushes the last built snippet
    to the specified database
    """

    if (database_present):
        with open(BUILD_OUT_FILE, 'r') as snippet:
            conn = sqlite3.connect(config.get('Database', 'db_path'))
            conn.execute("""
                UPDATE homesnippets_snippet
                SET body=?
                WHERE id=?
            """, (snippet.read(), config.get('Database', 'snippet_id')))
            conn.commit()
            conn.close()


@task
def db_setup():
    """Setup database details and create snippet to push updates to."""

    if not config.has_section('Database'):
        config.add_section('Database')

    if 'HOMESNIPPETS_DATABASE' in os.environ:
        print ('Using path from HOMESNIPPETS_DATABASE: {0}'
               .format(os.environ['HOMESNIPPETS_DATABASE']))
        db_path = os.environ['HOMESNIPPETS_DATABASE']
    else:
        db_path = raw_input('Enter the absolute path to the sqlite '
                            'database file: ')

    while not _test_sqlite3_db(db_path):
        db_path = raw_input('Error validating database. Enter absolute path'
                            ' to database file (blank to quit setup): ')
        if not db_path:
            return

    config.set('Database', 'db_path', db_path)

    # Get name to use for snippet.
    name = raw_input('Please enter the product name you will use to view this '
                     'snippet (i.e. flicks_video):')

    # Set up snippet to push to
    conn = sqlite3.connect(db_path)

    # Create client rule
    conn.execute("""
        INSERT INTO homesnippets_clientmatchrule (description, name, exclude,
                                                  created, modified)
        VALUES (?, ?, 0, datetime('now'), datetime('now'))
    """, ['Name: {0}'.format(name), name])
    client_rule_id = _get_last_insert_rowid(conn)

    # Create snippet
    conn.execute("""
        INSERT INTO homesnippets_snippet (name, body, disabled, preview,
                                           created, modified)
        VALUES (?, '', 0, 0, datetime('now'), datetime('now'))
    """, (name,))
    snippet_id = _get_last_insert_rowid(conn)

    # Associate snippet with rule
    conn.execute("""
        INSERT INTO homesnippets_snippet_client_match_rules
            (snippet_id, clientmatchrule_id)
        VALUES (?, ?)
    """, (snippet_id, client_rule_id))

    conn.commit()
    conn.close()

    config.set('Database', 'snippet_id', snippet_id)
    config.set('Database', 'client_rule_id', client_rule_id)

    # TODO: Handle failure better
    with open('.snippetconfig', 'w') as f:
        config.write(f)
    print ''


def _get_last_insert_rowid(conn):
    cursor = conn.execute('SELECT last_insert_rowid()')
    result = cursor.fetchone()
    if result is not None:
        return result[0]
    else:
        return None


def _test_sqlite3_db(db_path):
    """Very basic test for validity of database."""

    # Check for file existance and if it's a sqlite3 db
    if isfile(db_path):
        try:
            conn = sqlite3.connect(db_path)

            # TODO: If we really care, do a more thorough check
            # If it has the homesnippets_snippet table we're content
            tables = [r[0] for r in conn.execute("""
                SELECT name FROM sqlite_master
                WHERE type='table'
            """).fetchall()]
            conn.close()

            if 'homesnippets_snippet' in tables:
                return True
        except sqlite3.DatabaseError:
            pass

    return False


@task
def build():
    """Builds the snippet."""
    # Use the LESS file over the CSS file if it exists.
    css = ''
    if os.path.isfile(LESS_FILE):
        args = [LESS_BIN, '-x', LESS_FILE]
        try:
            css = check_output(args)
        except CalledProcessError, e:
            print 'Error compiling %s with command `%s`:' % (filename, args)
            print e.output
            print 'File will be ignored.'
    elif os.path.isfile(CSS_FILE):
        with open(CSS_FILE, 'r') as f:
            css = f.read()

    js = ''
    if os.path.isfile(JS_FILE):
        with open(JS_FILE, 'r') as f:
            js = minify(f.read())

    template = env.get_template(SNIPPET_CONTENT_FILE)

    with open(BUILD_OUT_FILE, 'w') as output:
        output.write(template.render({
            'css': css,
            'js': js
        }))
