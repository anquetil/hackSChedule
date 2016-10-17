'use strict';
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import browserify from 'browserify';
import uglify from 'gulp-uglify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import rename from 'gulp-rename';
import browserSync from 'browser-sync';
browserSync.create();

// css
import autoprefixer from 'autoprefixer';
import postcss from 'gulp-postcss';
import scss from 'postcss-scss';
import nested from 'postcss-nested';
import vars from 'postcss-simple-vars';
import extend from 'postcss-simple-extend';
import cssnano from 'cssnano';

let dest = './www/res';
let server = './src/server';
let pub = './src/public';

gulp.task('react', () => {
  var entries = pub + '/render.js';
  return browserify({
    entries: entries,
    extensions: ['.js'],
    debug: (process.env.NODE_ENV != 'production'),
  })
  .transform('babelify', { presets: ['es2015', 'react'] })
  .on('error', error)
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(rename('app.js'))
  .pipe(gulp.dest(dest))
  .pipe(browserSync.stream());
});

gulp.task('scss', () => {
  var entries = pub + '/scss/main.scss';
  gulp.src(entries)
  .pipe(sass().on('error', sass.logError))
  .pipe(cleanCSS({ compatibility: 'ie8' }))
  .pipe(postcss([extend, nested, autoprefixer, cssnano]))
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

gulp.task('watch', ['scss', 'react', 'nodemon'], () => {

  browserSync.init(null, {
		proxy: "http://localhost:5000",
	});

  gulp.watch(pub + '/scss/**/*.scss', ['scss']);
  gulp.watch(pub + '/**/*.js', ['react']);
});

gulp.task('apply-prod-environment', function() {
  process.env.NODE_ENV = 'production';
});

gulp.task('build', ['apply-prod-environment', 'scss', 'react']);

gulp.task('default', ['build']);

function error(err) {
  console.log(err);
  this.emit('end');
}
