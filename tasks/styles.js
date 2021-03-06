'use strict';

module.exports = (gulp, $, pkg) => {
  const reportError = require('../lib/error.js');

  // Copyright notice placed at top of compiled CSS
  const copyrightPlaceholder = '/*! #copyright DO NOT REMOVE# */';
  const copyrightNotice = ['/*!',
    ' * ' + pkg.title + ' - ' + pkg.description,
    ' * @version v' + pkg.version,
    ' * @link ' + pkg.homepage,
    ' * @author ' + pkg.author,
    ' */',
    ''].join('\n');

  // Settings for clean-css plugin
  const cleanCssOptions = {
    level: {
      2: {
        all: true,
      }
    }
  };

  // @task: Build Sass styles from components.
  const task = (args) => {
    const options = Object.assign($.minimist(process.argv.slice(2), {
      string: ['outputStyle'],
      boolean: ['sourcemaps', 'production'],
      default: { },
    }), args);
    return gulp.src(pkg.gulpPaths.styles.src, { base: pkg.gulpPaths.styles.srcDir })
      .pipe($.plumber())
      .pipe($.stylelint({
        syntax: 'scss',
        reporters: [{
          formatter: 'string',
          console: true
        }]
      }))
      .pipe($.if(options.sourcemaps, $.sourcemaps.init()))
      .pipe($.sass({
        importer: $.magicImporter({
          disableImportOnce: true
        }),
        outputStyle: options.outputStyle
      }).on('error', reportError))
      .pipe($.cssUrlCustomHash({
        targetFileType: ['jpe?g', 'png', 'webp', 'svg', 'gif', 'ico', 'otf', 'ttf', 'eot', 'woff2?'],
      }))
      .pipe($.autoprefixer())
      .pipe($.if(options.sourcemaps, $.sourcemaps.write()))
      .pipe($.if(options.production, $.replace(copyrightPlaceholder, copyrightNotice)))
      .pipe($.if(options.production, $.cleanCss(cleanCssOptions)))
      .pipe($.if(options.production, $.rename({ suffix: '.min' })))
      .pipe(gulp.dest(pkg.gulpPaths.styles.dest))
      .pipe($.livereload());
  };

  gulp.task('styles', task);
  gulp.task('styles:production', () => task({
    outputStyle: 'compressed',
    sourcemaps: false,
    production: true,
  }));
};
