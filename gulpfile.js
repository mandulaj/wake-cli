var gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul');

gulp.task('test', function(cb) {
  gulp.src(['lib/**/*.js', 'index.js'])
    .pipe(istanbul()) // Covering files
    .on('finish', function() {
      gulp.src(['test/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports()) // Creating the reports after tests runned
        .on('end', cb);
    });
});