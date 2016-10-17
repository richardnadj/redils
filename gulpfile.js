var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	clean = require('gulp-clean'),
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
};


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

gulp.task('update-index', function() {
	return gulp.src([vars.devDir+'index.html'])
		.pipe(gulp.dest(vars.distDir));
});

gulp.task('update-scss', function() {
	return gulp.src([vars.devDir+'css/sass/'+vars.pluginName+'.scss'])
		.pipe(rename({prefix: '_'}))
		.pipe(gulp.dest(vars.distDir+'css'));
});

gulp.task('update-js', function() {
	return gulp.src([vars.devDir+'js/'+vars.pluginName+'.js'])
		.pipe(gulp.dest(vars.distDir+'js'));
});

gulp.task('publish-css', function() {
	return gulp.src(vars.devDir+'css/main.css')
		.pipe(minifycss({keepBreaks: true}))
		.pipe(gulp.dest(vars.distDir+'css'));
});

gulp.task('publish-redils-css', function() {
	return gulp.src('dev/css/sass/redils.scss')
		.pipe(
			sass({
				outputStyle: 'expanded',
				errLogToConsole: false,
				onError: function(err) {
					return notify().write(err);
				}
			})
		)
		.pipe(autoprefixer())
		.pipe(rename({basename: vars.pluginName, extname: '.css'}))
		.pipe(gulp.dest(vars.distDir+'css'))
		.pipe(minifycss())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(vars.distDir+'css'));
});

gulp.task('publish-js', function() {
	return gulp.src(vars.devDir+'js/'+vars.pluginName+'.js')
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(vars.distDir+'js'));
});


// Publish
gulp.task('publish', ['clean-live'], function() {
	gulp.start('update-index', 'update-js', 'update-scss', 'publish-redils-css', 'publish-css', 'publish-js');
});

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
		.pipe(jshint.reporter('default'))
		.pipe(browserSync.reload({stream:true}));
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

