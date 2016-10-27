/*
 * Gulp User Tasks
 */

const gulp = require('gulp')
const cordial = require('@thebespokepixel/cordial')()

// transpilation/formatting
gulp.task('bundle', cordial.macro({
	source: 'src/index.js'
}).basic())

gulp.task('master', cordial.macro({
	master: true,
	source: 'src/index.js'
}).basic())

// Docs
gulp.task('docs', cordial.shell({
	source: 'npm run doc-build'
}).job())

// ReadMe
gulp.task('readme', cordial.shell({
	source: 'npm run readme'
}).job())

// Clean
gulp.task('clean', cordial.shell({
	source: ['npm-debug.*', './.nyc_output', './test/coverage']
}).trash())

// Tests
gulp.task('ava', cordial.test().ava(['test/*.js']))
gulp.task('xo', cordial.test().xo(['src/**.js']))
gulp.task('test', gulp.parallel('xo', 'ava'))

// Hooks
gulp.task('start-release', gulp.series('reset', 'clean', 'master', 'readme'))
gulp.task('post-flow-release-start', gulp.series('start-release', 'version-release', 'docs', 'commit'))

// Default
gulp.task('default', gulp.series('bump', 'clean', gulp.parallel('docs', 'bundle', 'readme')))
