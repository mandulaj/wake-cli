var gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  coveralls = require('gulp-coveralls'),
  istanbul = require('gulp-istanbul');

gulp.task('pre-test', function(){
  return gulp.src(['./lib/**/*.js'])
    .pipe(istanbul({includeUntested: true})) // Covering files
    .pipe(istanbul.hookRequire())
})


gulp.task('test', ['pre-test'], function(cb) {
    return gulp.src(['./test/*test.js'])
      .pipe(mocha({reporter: 'spec'}))
      //.pipe(istanbul.writeReports()) // Creating the reports after tests runned
      //.pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('coverage', function() {
  gulp.src("coverage/lcov.info")
    .pipe(coveralls());
});


gulp.task("default", ['test']);
