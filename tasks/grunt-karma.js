'use strict';

var runner = require('karma').runner;
var server = require('karma').server;
var path = require('path');
require('colors');

module.exports = function (grunt) {
    var _ = grunt.util._;
    grunt.registerMultiTask('karma', 'Run browser unit- and integration-tests with karma.', function() {
        var done = this.async();
        var options = this.options({
            background: false
        });
        var data = this.data;
        //merge options onto data, with data taking precedence
        data = _.merge(options, data);
        data.configFile = path.resolve(data.configFile);

        if (data.configFile) {
            data.configFile = grunt.template.process(data.configFile);
        }
        //support `karma run`, useful for grunt watch
        if (this.flags.run) {
            runner.run(data, done);
            return;
        }
        //allow karma to be run in the background so it doesn't block grunt
        if (this.data.background) {
            var args = [];
            args.push(path.join(__dirname, 'tasks/helper/karma-server.js'));
            args.push(JSON.stringify(data));
            grunt.util.spawn({
                cmd: 'node',
                args: args
            }, function () {});
            done();
        } else {
            server.start(data, function(status) {
                // unfortunately, the return-code (or status) of karma-server means
                // means sth different than the status expected by grunt
                done(!status)
            });
        }
    });
};
