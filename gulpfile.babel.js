var gulp = require("gulp"),
  gulpPlugins = require("gulp-load-plugins"),
  runSequence = require("run-sequence");
let $ = gulpPlugins();

gulp.task("build", function() {
  gulp.src(["src/**/*"])
    .pipe(gulp.dest("dist/"));
  gulp.src(["dist/*/*.js"])
    .pipe($.babel())
    .pipe(gulp.dest("dist/"));
  return gulp.src(["dist/**/*"])
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
