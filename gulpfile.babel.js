'use strict';
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import rename from 'gulp-rename';
import browserSync from 'browser-sync';
browserSync.create();

let dest = './www/res';
let server = './src/server';
let pub = './src/public';

gulp.task('react', () => {
  var entries = pub + '/render.js';
  return browserify({
    entries: entries,
    extensions: ['.js'],
    debug: true,
  })
  .transform('babelify', { presets: ['es2015', 'react'] })
  .on('error', error)
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(rename('app.js'))
  .pipe(gulp.dest(dest))
  .pipe(browserSync.stream());
});

gulp.task('scss', () => {
  var entries = pub + '/scss/main.scss';
  return gulp.src(entries)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
});

gulp.task('nodemon', () => {
  nodemon({
    script: server + '/app.js',
    watch: server,
    ext: 'js',
    env: { NODE_ENV: 'development' },
  });
});

gulp.task('watch', ['scss', 'react'], () => {

  browserSync.init(null, {
		proxy: "http://localhost:5000",
	});

  gulp.watch(pub + '/scss/**/*.scss', ['scss']);
  gulp.watch(pub + '/**/*.js', ['react']);
});

gulp.task('default', ['watch', 'nodemon']);

function error(err) {
  console.log(err);
  this.emit('end');
}
