'use strict';

const util = require('util');

module.exports = {
    name: 'trailingWhitespace',
    nodeTypes: ['root'],
    message: "There should't be any trailing whitespace.",

    lint: function trailingWhitespaceLinter (config, node) {
        // Ignore empty files
        if (node.source.input.css.length === 0) {
            return;
        }

        // We'll convert the AST to the Less source and just loop through each line
        node = node.source.input.css;

        const results = [];

        let levels = 0;
        let comment = false;

        node.split('\n').forEach((line, index) => {
            if (/[ \t]+$/g.test(line)) {
                results.push({
                    column: line.length,
                    line: index + 1, // Since index is zero-based
                    message: this.message
                });
            }

            if (line.trim().length) {
                let start = 0;
                if (comment) {
                    start = line.indexOf('*/');
                    if (start >= 0) {
                        comment = false;
                        line = line.slice(start + 2);
                    }
                }
                if (!comment && line.trim().length) {
                    if (/^ */g.test(line)) {
                        let len = RegExp.lastMatch.length;
                        if (line.charAt(len) === '}') {
                            levels--;
                        }
                        if (start + len !== levels * 4) {
                            results.push({
                                column: start + len + 1,
                                line: index + 1, // Since index is zero-based
                                message: util.format("The indent should be %s whitespace.", levels * 4)
                            });
                        }

                        while (true) {
                            start = line.indexOf('/*');
                            if (start < 0) {
                                break;
                            }
                            let end = line.indexOf('*/', start + 2);
                            if (end < 0) {
                                comment = true;
                                line = line.slice(0, start);
                                break;
                            }
                            line = line.slice(0, start) + line.slice(end + 2);
                        }

                        if (line.indexOf('{') >= 0) {
                            levels++;
                        }
                    }
                }
            }
        });

        if (results.length) {
            return results;
        }
    }
};
