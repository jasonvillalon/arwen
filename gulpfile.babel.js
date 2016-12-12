var gulp = require("gulp"),
  gulpPlugins = require("gulp-load-plugins"),
  runSequence = require("run-sequence"),
  del = require("del");
let $ = gulpPlugins();

gulp.task("dist", function() {
  return gulp.src(["src/**/*"])
    .pipe(gulp.dest("dist/"));
  return gulp.src(["dist/**/*"])
    .pipe(gulp.dest("./"));
});
gulp.task("build", function() {
  return gulp.src(["dist/*/*.js"])
  .pipe($.babel())
  .pipe(gulp.dest("dist/"));
});
gulp.task("deploy", function() {
  return gulp.src(["dist/**/*"])
    .pipe(gulp.dest("./"));
});

gulp.task("clean", (cb) => {
  return del(["dist", "lib", "app", "check-changes", "check-update", "create-component", "install-component", "install-component-deps", "migrate"], cb)
})

gulp.task("lint", function() {
  return gulp.src(["src/*/*.js", "!src/**/templates/*", "!src/**/templates/**/*"])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

gulp.task("default", function(cb) {
  return runSequence("clean", "lint", "dist", "build", "deploy", cb);
});
