const gulp = require('gulp')
const download = require('gulp-download')
const unzip = require('gulp-unzip')
const clean = require('gulp-clean')
const fs = require('fs')

gulp.task('download', () => {
    return download('https://github.com/viosey/hexo-theme-material/archive/canary.zip')
        .pipe(gulp.dest("./"))
})


gulp.task('unzip theme', [ 'download' ], () => {
    return gulp.src('canary.zip')
        .pipe(unzip())
        .pipe(gulp.dest('./themes'))
})

gulp.task('clean up', [ 'unzip theme' ], () => {
    return gulp.src('canary.zip')
        .pipe(clean())
})

gulp.task('rename dir', [ 'clean up' ], (cb) => {
    fs.rename('./themes/hexo-theme-material-canary/', './themes/material/', err => {
        if (err) {
            throw err
        }
        cb()
    })
})

gulp.task('merge', 
    [ 'rename dir' ] , // add annotation to disable 
    done => {
    const mergeDir = (source, dest) => {
        const files = fs.readdirSync(source)
        for (const file of files) {
            if (fs.statSync(source + file).isDirectory()) {
                if (!fs.existsSync(dest + file + '/')) {
                    fs.mkdirSync(dest + file + '/')
                }
                mergeDir(source + file + '/', dest + file + '/')
            } else {
                if (fs.existsSync(dest + file)) {
                    fs.unlinkSync(dest + file)
                }
                // console.log(dest + file)
                fs.copyFileSync(source + file, dest + file)
            }
        }
    } 
    mergeDir('./merge/', './themes/material/')
    done()
})

gulp.task('default', [ 'merge' ])