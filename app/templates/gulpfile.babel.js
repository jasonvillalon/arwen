import gulp from "gulp"
import del from "del"
import gulpPlugins from "gulp-load-plugins"
import runSequence from "run-sequence"
import nodemon from "gulp-nodemon"
import bunyan from "bunyan"
import pkg from "./package.json"
import path from "path"
import moment from "moment"
let $ = gulpPlugins()

gulp.task("build", () => {
  return gulp.src(["src/**/*.js", "!src/www/**/*"])
    .pipe($.babel())
    .pipe(gulp.dest("lib"))
})

gulp.task("statics", () => {
  return gulp.src("src/www/**/*.*")
  .pipe(gulp.dest("lib/www"))
})

gulp.task("templates", () => {
  return gulp.src("src/templates/**/*.*")
  .pipe(gulp.dest("lib/templates"))
})

gulp.task("lint", () => {
  return gulp.src("src/**/*.js")
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
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

// gulp.task("watch", () => {
//   gulp.watch(["./src/**/*"], () => {
//     runSequence("clean", "statics", "templates", "lint", "build", "dist", "serve")
//   })
// })

gulp.task("clean", (cb) => {
  return del(["dist", "lib"], cb)
})

gulp.task("dist", () => {
  return gulp.src(["lib/**/*", "package.json", "LICENSE", "README.md"])
    .pipe(gulp.dest("dist"))
})

gulp.task("serve", () => {
  nodemon({
    script: "./script/run",
    tasks: ["lint"]
  })
  .on("restart", function() {
    console.log("restarted!")
  })
  .on("crash", function() {
    let logFile = path.join("./", "restart-log.json")
    let logger = bunyan.createLogger({
      name: pkg.name,
      streams: [
        {
          path: logFile,
          level: "trace"
        }
      ]
    })
    logger.info("Restart started at " + moment().format("MM/DD/YYYY HH:mm:ss"))
  })
})

gulp.task("run", () => {
  return runSequence("default", "lint", "serve")
})

gulp.task("default", (cb) => {
  return runSequence("clean", "statics", "templates", "build", "dist", cb)
})
