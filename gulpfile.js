var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	changed = require('gulp-changed'),
	notify = require('gulp-notify'),
	clean = require('gulp-clean'),
	git = require('gulp-git'),
	jscs = require('gulp-jscs'),
	header = require('gulp-header'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync');

var vars = {
	devDir: 'dev/',
	distDir: 'dist/',
	bowerJquery: 'bower_components/jquery/dist/jquery.js',
	bowerNormalize: 'bower_components/normalize-scss',
	pluginName: 'redils'
}


//////////////////////////////////////////
// HEADER
//////////////////////////////////////////


var pkg = require('./package.json'),
	banner = [
		'/**',
		' * <%= pkg.name %> - <%= pkg.description %>',
		' * @version v<%= pkg.version %>',
		' * @link <%= pkg.homepage %>',
		' * @author <%= pkg.author %>',
		' * @license <%= pkg.license %>',
		' */',
		'',
	].join('\n');


//////////////////////////////////////////
// PUBLISHING
//////////////////////////////////////////


gulp.task('clean-live', function() {
	return gulp.src(vars.distDir+'*', {read: false})
    	.pipe(clean());
});

gulp.task('update-index', ['clean-live'], function() {
	return gulp.src([vars.devDir+'index.html'])
		.pipe(gulp.dest(vars.distDir));
})

gulp.task('update-scss', ['clean-live'], function() {
	return gulp.src([vars.devDir+'css/sass/_'+vars.pluginName+'.scss'])
		.pipe(gulp.dest(vars.distDir+'css'));
})

gulp.task('publish-css', ['clean-live'], function() {
	return gulp.src(vars.devDir+'css/main.css')
		.pipe(minifycss({keepBreaks: true}))
		.pipe(gulp.dest(vars.distDir+'css'));
})

gulp.task('publish-js', ['clean-live'], function() {
	return gulp.src(vars.devDir+'js/'+vars.pluginName+'.js')
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(vars.distDir+'js'));
})


// Publish
gulp.task('publish', function() {
	gulp.start('update-index', 'update-scss', 'publish-css', 'publish-js');
})

//////////////////////////////////////////
// WATCHING
//////////////////////////////////////////

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        proxy: vars.pluginName+".dev"
    });
});

gulp.task('main-css', function() {

	return gulp.src('dev/css/sass/*.scss')
		.pipe(
			sass({
				outputStyle: 'expanded',
				/*sourceComments: 'map',*/
				includePaths: [vars.bowerNormalize],
				errLogToConsole: false,
				onError: function(err) {
					return notify().write(err);
				}
			})
		)
		.pipe(
			autoprefixer(
				["> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1"],
				{
					map: true,
					from: 'main.scss',
					to: 'main.css'
				}
			)
		)
		.pipe(gulp.dest(vars.devDir+'css')) //Dev version has compiled SCSS but not minified
		.pipe(browserSync.reload({stream:true})); 
});

gulp.task('plugin-js', function() {
	return gulp.src([vars.devDir+'js/'+vars.pluginName+'.js', vars.devDir+'js/styling-example.js'])
		.pipe(jscs().on("error", notify.onError("JSCS: <%= error %>")))
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('init-js', function() {
	return gulp.src([vars.bowerJquery])
		.pipe(gulp.dest(vars.devDir+'js'));
});

gulp.task('bs-reload', function() {
	browserSync.reload();
});

// Watch
gulp.task('default', ['plugin-js', 'init-js', 'main-css', 'browser-sync'], function() {


	//Watch files
	gulp.watch(vars.devDir+'css/sass/**/*.scss', ['main-css']);
	gulp.watch(vars.devDir+'js/'+vars.pluginName+'.js', ['plugin-js']);
	gulp.watch(vars.devDir+"*.html", ['bs-reload']);
	gulp.watch(vars.devDir+"*.js", ['bs-reload']);

});

