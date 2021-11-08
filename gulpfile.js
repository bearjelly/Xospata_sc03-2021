
/**********************************************************/
/* gulp task */
/**********************************************************/
/* File version              1.0                      */
/* Last modified            2019/11/21                   */
/* Last modified by          yohan                         */
/**********************************************************/

const gulp = require('gulp'),
  shell = require("shelljs");
const {
  watch
} = require('gulp');
const path = require('path');
const baseDir = path.resolve(process.cwd());

const rootFolder = path.join(baseDir, "Xospata_sc03-2021")

//gulp로 shared파일 자동 생성

gulp.task("watch", function () {
    watch(baseDir + "/shared/**/*", gulp.series("gen-shared", done => done()));
});
 gulp.task("gen-shared", function (done) {

      shell.cd(rootFolder);
      shell.cp("-Rf", baseDir + "/shared", rootFolder);
    
      done();
    });
    

gulp.task("default", gulp.series("gen-shared"));
