const gulp = require("gulp");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const less = require('gulp-less');
const path = require('path');

gulp.task('es6toes5', () => {
	return gulp.src("admin/src/*.js")
		.pipe(sourcemaps.init())
		.pipe(babel())
		/* .pipe(concat("all.js")) */
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("admin/script/"));
});

gulp.task('less', () => {
	return gulp.src('admin/less/*.less')
		.pipe(less({
			paths: [ path.join(__dirname, 'less', 'includes') ]
		}))
		.pipe(gulp.dest('admin/style/'));
})

gulp.task('watch', () => {
	gulp.watch('admin/src/*.js', ['es6toes5']);
	gulp.watch('admin/less/*.less', ['less']);
});

gulp.task('default', ['es6toes5', 'minify', 'watch']);
