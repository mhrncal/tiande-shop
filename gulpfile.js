const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const fs = require('fs');
const browsersync = require('browser-sync').create();
const sftp = require('gulp-sftp-up4');
const gulpif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const argv = require('yargs').argv;

const files = {
    scssPath: 'app/scss/**/*.scss',
    jsPath: 'app/js/**/*.js',
};

const source = require('./gulpsource.json');

function gulpScss() {
    return src(files.scssPath)
        .pipe(gulpif(argv.source, sourcemaps.init())) // Inicializace sourcemaps pokud je příznak aktivní
        .pipe(sass())
        .pipe(concat('allstyle.css'))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(gulpif(argv.source, sourcemaps.write('.'))) // Zápis sourcemaps inline do CSS souboru
        .pipe(sftp({
			host: source.hostname,
			user: source.username,
			pass: source.password,
			port: source.port
		}))
        .pipe(dest('dist'));
}

function gulpJs() {
    return src(files.jsPath)
        .pipe(gulpif(argv.source, sourcemaps.init())) // Inicializace sourcemaps pokud je příznak aktivní
        .pipe(concat('allscript.js'))
        .pipe(terser())
        .pipe(gulpif(argv.source, sourcemaps.write('.'))) // Zápis sourcemaps do stejného adresáře
        .pipe(sftp({
			host: source.hostname,
			user: source.username,
			pass: source.password,
			port: source.port
		}))
        .pipe(dest('dist'));
}

function browserSyncServe(cb) {
    const primaryPath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const secondaryPath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

    fs.access(primaryPath, fs.constants.F_OK, (err) => {
        let browserPath;

        if (err) {
            console.log(`${primaryPath} není dostupný, používám sekundární cestu.`);
            browserPath = secondaryPath;
        } else {
            console.log(`${primaryPath} byl nalezen.`);
            browserPath = primaryPath;
        }

        // Dynamické nastavení target URL
        let targetUrl;
        if (/^\d+$/.test(source.url)) { // Test, zda source.url obsahuje pouze čísla
            targetUrl = 'https://' + source.url + '.myshoptet.com';
            console.log(`testovací url`);
        } else {
            targetUrl = 'https://www.' + source.url;
            console.log(`ostrá url`);
        }

        // Inicializace BrowserSync
        browsersync.init({
            open: true,
            browser: [browserPath],
            proxy: {
                target: targetUrl, // Použije dynamicky nastavenou URL
            },
            files: ['*.css', '*.js'],
            notify: {
                styles: {
                    top: 'auto',
                    bottom: '0',
                },
            },
        });
        cb();
    });
}

function browserSyncReload(cb) {
    browsersync.reload();
    cb();
}

function watchTask() {
    watch(
        [files.scssPath, files.jsPath],
        { interval: 1000, usePolling: true },
        series(parallel(gulpScss, gulpJs))
    );
}

function bsWatchTask() {
    watch('index.html', browserSyncReload);
    watch(
        [files.scssPath, files.jsPath],
        { interval: 1000, usePolling: true },
        series(parallel(gulpScss, gulpJs), browserSyncReload)
    );
}

exports.default = series(parallel(gulpScss, gulpJs), watchTask);
exports.bs = series(
    parallel(gulpScss, gulpJs),
    browserSyncServe,
    bsWatchTask
);