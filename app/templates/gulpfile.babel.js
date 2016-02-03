import _ from "lodash"
import gulp from "gulp"
import del from "del"
import gulpPlugins from "gulp-load-plugins"
import runSequence from "run-sequence"
let $ = gulpPlugins()

gulp.task("build", () => {
  return gulp.src(["src/**/*.js", "!src/www/**/*"])
    .pipe($.babel())
    .pipe(gulp.dest("lib"))
})

gulp.task("lint", () => {
  return gulp.src("src/**/*.js")
    .pipe($.eslint())
    .pipe($.eslint.format())
})

gulp.task("test", () => {
  process.env.NODE_ENV = "test"
  return gulp.src("test/**/*.js")
    .pipe($.mocha({
      reporter: "spec",
      clearRequireCache: true,
      ignoreLeaks: true,
      timeout: 20000,
      bail: true
    }))
})

gulp.task("watch", () => {
  gulp.watch(["./src/**/*"], () => {
    runSequence("clean", "statics", "templates", "build", "dist", "serve")
  })
})

gulp.task("clean", (cb) => {
  return del(["dist", "lib"], cb)
})

gulp.task("dist", () => {
  return gulp.src(["lib/**/*", "package.json", "LICENSE", "README.md"])
    .pipe(gulp.dest("dist"))
})

gulp.task("serve", (cb) => {
  require("./dist/server").run()
  cb()
})

gulp.task("run", (cb) => {
  return runSequence("watch", "serve")
})

gulp.task("default", (cb) => {
  return runSequence("clean", "statics", "templates", "build", "dist", cb)
})
