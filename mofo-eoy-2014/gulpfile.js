var fs = require('fs');
var gulp = require('gulp');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var connect = require('gulp-connect');

// Construct snippet HTML partials
gulp.task('build-snippets', function() {
  var css = fs.readFileSync('snippet.css');
  var js = fs.readFileSync('snippet.js');

  return gulp.src(['snippet.template', 'snippet-alt.template'])
    .pipe(rename(function (path) {
      path.extname = '.html'
    }))
    .pipe(replace('{{ CSS }}', css))
    .pipe(replace('{{ JS }}', js))
    .pipe(gulp.dest('./build/'));
});

// Construct demo html pages
gulp.task('build-pages', ['build-snippets'], function () {
  var builtSnippet = fs.readFileSync('build/snippet.html');
  var builtSnippetAlt = fs.readFileSync('build/snippet-alt.html');

  gulp.src('index.template')
    .pipe(rename('index.html'))
    .pipe(replace('{{ SNIPPET }}', builtSnippet))
    .pipe(gulp.dest('./build/'));

  gulp.src('index.template')
    .pipe(rename('index-alt.html'))
    .pipe(replace('{{ SNIPPET }}', builtSnippetAlt))
    .pipe(gulp.dest('./build/'));
})

gulp.task('watch', function () {
  var watcher = gulp.watch(['*.template', 'snippet.js', 'snippet.css'], ['build']);
});

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    port: 2014
  });
});

gulp.task('build', ['build-pages']);
gulp.task('default', ['build', 'connect', 'watch']);
