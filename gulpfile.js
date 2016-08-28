'use strict';

// Получение настроек папок из package.json
// const pjson = require('./package.json');
// const dirs = pjson.config.directories;
// const ghPagesUrl = pjson.config.ghPages;

// Зависимости проекта
const gulp = require('gulp');
const less = require('gulp-less');
const debug = require('gulp-debug');
const sourcemaps = require('gulp-sourcemaps');
const cleanss = require('gulp-cleancss');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const rename = require('gulp-rename');
const gulpIf = require('gulp-if');
// const del = require('del');
// const imagemin = require('gulp-imagemin');
// const pngquant = require('imagemin-pngquant');
// const svgstore = require('gulp-svgstore');
// const svgmin = require('gulp-svgmin');
// const path = require('path');
// const cheerio = require('gulp-cheerio');
// const fileinclude = require('gulp-file-include');
// const newer = require('gulp-newer');
const notify = require('gulp-notify');
// const uglify = require('gulp-uglify');
// const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
// const replace = require('gulp-replace');
const ghPages = require('gulp-gh-pages');
const fs = require('fs');

// Запуск `NODE_ENV=production npm start [задача]` приведет к сборке без sourcemaps
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV == 'dev';

// Запуск `port=3004 npm start` приведет к запуску сервера обновлений на 3004 порту и всей обычной автоматизации
const port = process.env.port ? process.env.port : 3000;

// Файлы компилируемых компонентов
// let blocks = getComponentsFiles();

// Вывод в консоль информации о взятых в сборку файлах (без LESS)
// if(blocks.js.length) {
//   console.log('---------- В сборку и обработку взяты JS-файлы:');
//   console.log(blocks.js);
// }
// if(blocks.img.length) {
//   console.log('---------- В сборку и обработку взяты изображения:');
//   console.log(blocks.img);
// }
// if(blocks.additionalCss.length) {
//   console.log('---------- В сборку скопированы добавочные CSS:');
//   console.log(blocks.additionalCss);
// }



// Компиляция LESS
gulp.task('less', function () {
  console.log('---------- Компиляция LESS');
  return gulp.src('less/style.less')
    .pipe(gulpIf(isDev, sourcemaps.init()))
    .pipe(debug({title: "LESS:"}))
    .pipe(less())
    .on('error', notify.onError(function(err){
      return {
        title: 'Styles compilation error',
        message: err.message
      }
    }))
    .pipe(postcss([
        autoprefixer({browsers: ['last 2 version']}),
        mqpacker
    ]))
    .pipe(gulpIf(!isDev, cleanss()))
    .pipe(rename('style.css'))
    .pipe(debug({title: "RENAME:"}))
    .pipe(gulpIf(isDev, sourcemaps.write()))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
});

// Копирование добавочных CSS, которые хочется иметь отдельными файлами
// gulp.task('copy:css', function(callback) {
//   if(blocks.additionalCss.length > 0) {
//     console.log('---------- копирование CSS');
//     return gulp.src(blocks.additionalCss, {since: gulp.lastRun('copy:css')})
//       .pipe(postcss([
//           autoprefixer({browsers: ['last 2 version']}),
//           mqpacker
//       ]))
//       .pipe(cleanss())
//       .pipe(gulp.dest(dirs.build + '/css'));
//   }
//   else {
//     console.log('---------- Копирование CSS: нет дополнительного CSS');
//     callback();
//   }
// });

// Копирование и оптимизация изображений
// gulp.task('img', function () {
//   console.log('---------- Копирование и оптимизация картинок');
//   return gulp.src(blocks.img ) // только для изменившихся с последнего запуска файлов
//     .pipe(gulp.dest(dirs.build + '/img'));
// });

// Оптимизация изображений // folder=src/img/icons/ npm start img:opt
const folder = process.env.folder;
gulp.task('img:opt', function (callback) {
  if(folder){
    console.log('---------- Оптимизация картинок');
    return gulp.src(folder + '/*.{jpg,jpeg,gif,png,svg}')
      .pipe(imagemin({
          progressive: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()]
      }))
      .pipe(gulp.dest(folder));
  }
  else {
    console.log('---------- Оптимизация картинок: ошибка (не указана папка)');
    console.log('---------- Пример вызова команды: folder=src/blocks/block-name/img_to_bg/ npm start img:opt');
    callback();
  }
});

// Сборка SVG-спрайта для блока sprite-svg--localstorage
// gulp.task('svgstore', function (callback) {
//   let spritePath = dirs.source + '/blocks/sprite-svg--localstorage/svg/';
//   if(fileExist(spritePath) !== false) {
//     console.log('---------- Сборка SVG спрайта');
//     return gulp.src(spritePath + '*.svg')
//       .pipe(svgmin(function (file) {
//         return {
//           plugins: [{
//             cleanupIDs: {
//               minify: true
//             }
//           }]
//         }
//       }))
//       .pipe(svgstore({ inlineSvg: true }))
//       .pipe(cheerio(function ($) {
//         $('svg').attr('style',  'display:none');
//       }))
//       .pipe(rename('sprite-svg--ls.svg'))
//       .pipe(gulp.dest(dirs.source + '/blocks/sprite-svg--localstorage/img'));
//   }
//   else {
//     console.log('---------- Сборка SVG спрайта: нет папки с картинками');
//     callback();
//   }
// });

// Сборка HTML
// gulp.task('html', function() {
//   console.log('---------- сборка HTML');
//   return gulp.src(dirs.source + '/*.html')
//     .pipe(fileinclude({
//       prefix: '@@',
//       basepath: '@file',
//       indent: true,
//     }))
//     .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
//     .pipe(gulp.dest(dirs.build));
// });

// Конкатенация и углификация Javascript
// gulp.task('js', function (callback) {
//   if(blocks.js.length > 0){
//     console.log('---------- Обработка JS');
//     return gulp.src(blocks.js)
//       .pipe(debug({title: "JS:"}))
//       .pipe(gulpIf(isDev, sourcemaps.init()))
//       .pipe(concat('script.min.js'))
//       .pipe(gulpIf(!isDev, uglify()))
//       .on('error', notify.onError(function(err){
//         return {
//           title: 'Javascript uglify error',
//           message: err.message
//         }
//       }))
//       .pipe(gulpIf(isDev, sourcemaps.write('.')))
//       .pipe(gulpIf(isDev, debug({title: "JS SOURCEMAPS:"})))
//       .pipe(gulp.dest(dirs.build + '/js'));
//   }
//   else {
//     console.log('---------- Обработка JS: в сборке нет JS-файлов');
//     callback();
//   }
// });

// Копирование JS-библиотек (если есть)
// gulp.task('js:copy', function (callback) {
//   let jsLibs = [];
//   if(fileExistAndHasContent(dirs.source + '/js/jquery.js')) {
//     jsLibs.push(dirs.source + '/js/jquery.js');
//   }
//   if(jsLibs){
//     console.log('---------- Копирование JS-библиотек');
//     return gulp.src(jsLibs)
//       .pipe(gulp.dest(dirs.build + '/js'));
//   }
//   else {
//     callback();
//   }
// });

// Очистка папки сборки
// gulp.task('clean', function () {
//   console.log('---------- Очистка папки сборки');
//   return del([
//     dirs.build + '/**/*',
//     '!' + dirs.build + '/readme.md'
//   ]);
// });

// Сборка всего
gulp.task('build', gulp.series(
  // 'clean',
  // 'svgstore',
  // gulp.parallel('less', 'copy:css', 'img', 'js', 'js:copy'),
  // 'html'
  'less'
));

// Локальный сервер, слежение
gulp.task('serve', gulp.series('build', function() {
  browserSync.init({
    server: './',
    port: port,
    startPath: 'index.html'

  });
  // gulp.watch([
  //   dirs.source + '/*.html',
  //   dirs.source + '/_include/*.html',
  //   dirs.source + '/blocks/**/*.html',
  // ], gulp.series('html', reloader));
  gulp.watch('less/**/*.less', gulp.series('less'));
  // if(blocks.img) {
  //   gulp.watch(blocks.img, gulp.series('img', reloader));
  // }
  // if(blocks.js) {
  //   gulp.watch(blocks.js, gulp.series('js', reloader));
  // }
}));

// Отправка в GH pages (ветку gh-pages репозитория)
gulp.task('deploy', function() {
  return gulp.src('./**/*')
    .pipe(ghPages());
});

// Задача по умолчанию
gulp.task('default',
  gulp.series('serve')
);

// Перезагрузка в браузере
function reloader(done) {
  browserSync.reload();
  done();
}

