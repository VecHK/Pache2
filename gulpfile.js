const child_process = require('child_process');
const gulp = require("gulp");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const less = require('gulp-less');
const path = require('path');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const beep = require('beeper');

gulp.task('es6toes5', () => {
	return gulp.src("admin/src/*.js")
		.pipe(plumber({
			errorHandler: function (err) {
				beep('*-*-');
				notify.onError('Error: <%= error.message %>').apply(this, arguments);
			}}
		))
		.pipe(sourcemaps.init())
		.pipe(babel())
		/* .pipe(concat("all.js")) */
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("admin/script/"));
});

gulp.task('less', () => {
	return gulp.src('admin/less/*.less')
		.pipe(plumber({
			errorHandler: function (err) {
				beep('*-*-');
				notify.onError('Error: <%= error.message %>').apply(this, arguments);
			}}
		))
		.pipe(less({
			paths: [ 'admin/less/' ],
		}))
		.pipe(gulp.dest('admin/style/'));
})

gulp.task('watch', () => {
	gulp.watch('admin/src/*.js', ['es6toes5']);
	gulp.watch('admin/less/*.less', ['less']);
});

gulp.task('default', ['es6toes5', 'minify', 'watch']);
