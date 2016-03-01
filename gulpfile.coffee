###
Client Gulp File
###

gulp = require 'gulp'
cordial = require '@thebespokepixel/cordial'

gulp.task 'bump',       cordial.version.build.inc
gulp.task 'reset',      cordial.version.build.reset
gulp.task 'write',      cordial.version.build.write

gulp.task 'test',       ['xo'],    cordial.test.ava       ['test/*']
gulp.task 'xo',                    cordial.test.xo        ['index.js']

gulp.task 'commit',                cordial.git.commitAll
gulp.task 'push',                  cordial.git.pushAll     'origin'
gulp.task 'backup',     ['push'],  cordial.git.pushAll     'backup'

gulp.task 'publish',    ['test'],  cordial.npm.publish

gulp.task 'default',    ['bump']

gulp.task 'post-flow-release-start', ['reset', 'write'], cordial.flow.release.start
gulp.task 'post-flow-release-finish', ['publish', 'push']
gulp.task 'filter-flow-release-start-version', cordial.flow.release.versionFilter
gulp.task 'filter-flow-release-finish-tag-message', cordial.flow.release.tagFilter

