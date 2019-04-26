'use strict';

const util = require('util');

module.exports = {
    name: 'compatibility',
    nodeTypes: ['rule'],
    message: 'Compatibility(%s): "%s".',

    lint: function compatibilityLinter (config, node) {
        const properties = [];
        const results = [];
        const flexs = [];

        node.walkDecls((decl) => {
            /**
             * walkDecls will walk even those Declaration nodes that are nested
             * under other nested Rule nodes
             */
            if (decl.parent !== node) {
                return true;
            }

            if (decl.prop.indexOf('flex') >= 0 && config.ios) {
                flexs.push(decl);
            }

            /**
             * We let this happen regardless of if the array already
             * contains the property name, for debugging purposes. It doesn't
             * hurt anything.
             */
            properties.push(decl.prop);
        });

        flexs.forEach((decl) => {
            if (!properties.includes('-webkit-' + decl.prop)) {
                results.push({
                    message: util.format(this.message, 'IOS 8', '-webkit-' + decl.prop),
                    column: decl.source.start.column,
                    line: decl.source.start.line
                });
            }
            if (decl.prop === 'flex' && +decl.value === 1 && !properties.includes('position')) {
                results.push({
                    message: util.format(this.message, 'IOS 10', 'position:relative'),
                    column: decl.source.start.column,
                    line: decl.source.start.line
                });
            }
        });

        if (results.length) {
            return results;
        }
    }
};
