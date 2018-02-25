require("babel-register");
require("babel-polyfill");

var Extension = require("./extension.js");

exports.activate = Extension.activate;
exports.deactivate = Extension.deactivate;