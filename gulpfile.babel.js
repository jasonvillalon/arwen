import gulp from "gulp"
import gulpPlugins from "gulp-load-plugins"
import runSequence from "run-sequence"
let $ = gulpPlugins()

gulp.task("build", () => {
  return gulp.src(["src/*/*.js"])
    .pipe($.babel())
    .pipe(gulp.dest("./"))
})

gulp.task("lint", () => {
  return gulp.src(["src/*/*.js", "!src/**/templates/*", "!src/**/templates/**/*"])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
})

gulp.task("default", (cb) => {
  return runSequence("lint", "build", cb)
})
