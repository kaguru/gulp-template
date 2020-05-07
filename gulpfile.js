// gulpfile.js
var gulp = require('gulp');
var webserver = require('gulp-webserver');
var inject = require('gulp-inject');
var del = require('del');
var sass = require('gulp-sass');
var htmlclean = require('gulp-htmlclean');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var minify = require('gulp-minify-css');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');

sass.compiler = require('node-sass');


var paths = {
  src: 'src/**/*',
  srcHTML: 'src/**/*.html',
  srcCSS: 'src/assets/css/*.css',
  srcSCSS: 'src/assets/scss/*.scss',
  srcSASS: 'src/assets/sass/*.sass',
  srcBootstrapSCSS: 'node_modules/bootstrap/scss/bootstrap.scss',
  srcChartsJS: 'node_modules/chart.js/dist/Chart.min.js',
  srcJS: 'src/assets/js/*.js',
  srcJquery: 'node_modules/jquery/dist/jquery.min.js',
  srcBootstrapJS: 'node_modules/bootstrap/dist/js/bootstrap.min.js',
  srcIMAGES: 'src/assets/**/*.{png,jpg,svg}',
  srcFONTS: 'src/assets/**/*.{eot,ttf,woff,woff2}',

  tmp: 'tmp',
  tmpAssets: 'tmp/assets',
  tmpIndex: 'tmp/index.html',
  tmpHtml: 'tmp/*.html',
  tmpCSS: 'tmp/assets/css/style.min.css',
  tmpJS: 'tmp/assets/js/script.min.js',
  tmpIMAGES: 'tmp/assets/images/*',
  tmpFonts: 'tmp/assets/fonts/*',

  dist: 'dist',
  distAssets: 'dist/assets',
  distHtml: 'dist/*.html',
  distCSS: 'dist/assets/css/style.min.css',
  distJS: 'dist/assets/js/script.min.js',
  distIMAGES: 'dist/assets/images/*',
  distFonts: 'dist/assets/fonts/*',

  node_modules: 'node_modules'
};

// Development Mode - tmp Folder
// copy all html files from src folder to the tmp folder
gulp.task('html', function () {
  return gulp.src(paths.srcHTML)
  .pipe(gulp.dest(paths.tmp));
});

// copy all custom css styles file to css folder
gulp.task('css', function () {
  return gulp.src(paths.srcCSS)
  .pipe(rename({ dirname: 'css' }))
  .pipe(gulp.dest(paths.tmpAssets));
});

// concat bootstrap scss sass and all scss to css/style.min.css
gulp.task('scss', function () {
  return gulp.src([paths.srcBootstrapSCSS, paths.srcSCSS, paths.srcSASS])
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.min.css'))
    .pipe(minify())
    .pipe(rename({ dirname: 'css' }))
    .pipe(gulp.dest(paths.tmpAssets));
});

// concat jquery bootstrapjs chartjs and all custom js to js/script.min.js
gulp.task('js', function () {
  return gulp.src([paths.srcJquery, paths.srcBootstrapJS, paths.srcChartsJS, paths.srcJS])
    .pipe(concat('script.min.js'))
    .pipe(plumber())
    .pipe(babel({
      presets: [
        ['@babel/env', {
          modules: false
        }]
      ]
    }))
    .pipe(uglify())
    .pipe(rename({ dirname: 'js' }))
    .pipe(gulp.dest(paths.tmpAssets));
});

gulp.task('bootstrap-js', function () {
  return gulp.src([paths.srcBootstrapJS])
    .pipe(concat('bootstrap.min.js'))
    .pipe(uglify())
    .pipe(rename({ dirname: 'js' }))
    .pipe(gulp.dest(paths.tmpAssets));
});

gulp.task('images', function () {
  return gulp.src(paths.srcIMAGES)
  .pipe(gulp.dest(paths.tmpAssets));
});

gulp.task('fonts', function () {
  return gulp.src(paths.srcFONTS)
  .pipe(gulp.dest(paths.tmpAssets));
});

gulp.task('copy', ['html', 'css', 'scss', 'js', 'bootstrap-js', 'images', 'fonts']);
// gulp.task('copy', ['html', 'css', 'scss', 'js', 'images', 'fonts']);

gulp.task('inject', ['copy'], function () {
  var css = gulp.src(paths.tmpCSS);
  var js = gulp.src(paths.tmpJS);
  var images = gulp.src(paths.tmpIMAGES);
  return gulp.src(paths.tmpHtml)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(inject( images, { relative:true } ))
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('serve', ['inject'], function () {
  return gulp.src(paths.tmp)
    .pipe(webserver({
      port: 3000,
      livereload: true
    }));
});

gulp.task('watch', ['serve'], function () {
  gulp.watch(paths.src, ['inject']);
});


// Build Dist
gulp.task('html:dist', function () {
  return gulp.src(paths.srcHTML)
    .pipe(htmlclean())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('css:dist', function () {
  return gulp.src(paths.srcCSS)
    .pipe(rename({ dirname: 'css' }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('scss:dist', function () {
  return gulp.src([paths.srcSCSS])
  .pipe(sass().on('error', sass.logError))
  .pipe(concat('style.min.css'))
  .pipe(minify())
  .pipe(rename({ dirname: 'css' }))
  .pipe(gulp.dest(paths.distAssets));
});

gulp.task('js:dist', function () {
  return gulp.src(paths.srcJS)
    .pipe(concat('script.min.js'))
    .pipe(plumber())
    .pipe(babel({
      presets: [
        ['@babel/env', {
          modules: false
        }]
      ]
    }))
    .pipe(uglify())
    .pipe(rename({ dirname: 'js' }))
    .pipe(gulp.dest(paths.distAssets));
});

gulp.task('images:dist', function () {
  return gulp.src(paths.srcIMAGES)
    .pipe(gulp.dest(paths.distAssets));
});

gulp.task('fonts:dist', function () {
  return gulp.src(paths.srcFONTS)
  .pipe(gulp.dest(paths.distAssets));
});

gulp.task('copy:dist', ['html:dist', 'scss:dist', 'css:dist', 'js:dist', 'images:dist', 'fonts:dist']);

gulp.task('inject:dist', ['copy:dist'], function () {
  var css = gulp.src(paths.distCSS);
  var js = gulp.src(paths.distJS);
  var images = gulp.src(paths.distIMAGES);
  return gulp.src(paths.distHtml)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(inject( images, { relative:true } ))
    .pipe(gulp.dest(paths.dist));
});

// Delete tmp and dist folders
gulp.task('clean', function () {
  del([paths.tmp, paths.dist]);
});

gulp.task('build', ['inject:dist']);
gulp.task('default', ['watch']);
