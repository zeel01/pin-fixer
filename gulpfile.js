/* eslint-disable no-unused-vars */
/* global require exports*/
const Gulp = require("gulp");
const zip = require("gulp-zip");

function createRelease(cb) {
	return Gulp.src([
		"module.json",
		"pin-fixer.js",
		"pin-fixer.css",
		"noteSettings.html",
		"sceneSettings.html",
		"lang/*"
	], { base: "." })
		.pipe(zip("pin-fixer.zip"))
		.pipe(Gulp.dest("./"));
}

exports.zip = createRelease;
exports.default = createRelease;