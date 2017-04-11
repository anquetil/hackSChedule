'use strict';
import gulp from 'gulp';
import browserSync from 'browser-sync';
browserSync.create();

let _build = './build';
let _server = './server';
let _public = './public';

/* ————— REACT ————— */

import WebpackStream from 'webpack-stream';
import CompressionPlugin from 'compression-webpack-plugin';

gulp.task('build:dev', () => {
	var entries = _public + '/index.js';
	return gulp.src(entries)
		.pipe(WebpackStream(require('./webpack.config')))
		.pipe(gulp.dest(_build))
		.pipe(browserSync.stream());
});

gulp.task('build:prod', () => {
	var entries = _public + '/index.js';
	return gulp.src(entries)
		.pipe(WebpackStream(require('./webpack.config.prod')))
		.pipe(gulp.dest(_build));
});

/* –———— SCSS ————— */
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import postcss from 'gulp-postcss';
import extend from 'postcss-simple-extend';
import nested from 'postcss-nested';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

gulp.task('scss', () => {
  var entries = _public + '/styles/main.scss';
  return gulp.src(entries)
	  .pipe(sass().on('error', sass.logError))
	  .pipe(cleanCSS({ compatibility: 'ie8' }))
	  .pipe(postcss([extend, nested, autoprefixer, cssnano]))
	  .pipe(gulp.dest(_build))
		.pipe(browserSync.stream());
});

/* ————— SERVER ————— */

import nodemon from 'gulp-nodemon';

gulp.task('nodemon', () => {
  nodemon({
    script: _server + '/app.js',
    watch: _server,
    ext: 'js',
    env: { NODE_ENV: 'development' },
  });
});

/* ————— ENTRY SCRIPTS ————— */

gulp.task('watch', ['build:dev', 'scss', 'nodemon'], () => {
	browserSync.init(null, {
		proxy: "http://localhost:5000",
	});

	gulp.watch(_public + '/styles/**/*.scss', ['scss']);
	gulp.watch(_public + '/**/*.js', ['build:dev']);
});

gulp.task('build', ['build:prod']);
