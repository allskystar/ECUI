'use strict';

const isVariable = require('../utils/is-variable');

module.exports = {
    name: 'propertyOrdering',
    nodeTypes: ['rule'],
    message: 'Property ordering is not alphabetized',

    orders: [
        'position', 'display', 'float', 'visibility', 'overflow',
        'top', 'right', 'bottom', 'left', 'z-index',
        'width', 'height', 'padding', 'border', 'margin',
        'font', 'color', 'line-height', 'letter-spacing', 'text-align',
        'background'
    ].reverse(),

    lint: function propertyOrderingLinter (config, node) {
        // Only support alpha for now
        if (config.style !== 'alpha') {
            throw new Error(`Invalid setting value for propertyOrdering: ${ config.style }`);
        }

        let previousProp = null;
        const results = [];

        node.each((child) => {
            if (child.type !== 'decl' || results.length) {
                return;
            }

            const property = child.prop;

            // Ignore declarations without a property and variables
            if (!property || isVariable(property)) {
                return;
            }

            const currentProperty = property.toLowerCase();

            // Check for proper ordering
            if (previousProp) {
                let currentSplit = currentProperty.split('-');
                let previousSplit = previousProp.split('-');
                let i = 0;
                for (; i < currentSplit.length; i++) {
                    if (currentSplit[i] !== previousSplit[i]) {
                        break;
                    }
                }
                let currentName = currentSplit[i];
                let previousName = previousSplit[i];
                if (this.orders.indexOf(currentName) > this.orders.indexOf(previousName) || (this.orders.indexOf(previousName) === -1 && this.orders.indexOf(previousProp) === -1 && previousProp.localeCompare(currentProperty) > 0)) {
                    results.push({
                        column: child.source.start.column,
                        line: child.source.start.line,
                        message: this.message
                    });
                }
            }

            previousProp = currentProperty;
        });

        if (results.length) {
            return results;
        }
    }
};
