var gulp = require("gulp"),
  gulpPlugins = require("gulp-load-plugins"),
  runSequence = require("run-sequence");
let $ = gulpPlugins();

gulp.task("build", function() {
  return gulp.src(["src/*/*.js"])
    .pipe($.babel())
    .pipe(gulp.dest("./"));
});

gulp.task("lint", function() {
  return gulp.src(["src/*/*.js", "!src/**/templates/*", "!src/**/templates/**/*"])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

gulp.task("default", function(cb) {
  return runSequence("lint", "build", cb);
});
