'use strict';

const isVariable = require('../utils/is-variable');

module.exports = {
    name: 'propertyOrdering',
    nodeTypes: ['rule'],
    message: 'Property ordering is not alphabetized',

    orders: [
        'position', 'float', 'display', 'visibility', 'flex', 'flex-direction', 'flex-grow',
        'top', 'right', 'bottom', 'left', 'z-index',
        'box-sizing', 'overflow', 'overflow-x', 'overflow-y',
        'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'border', 'border-width', 'border-style', 'border-color',
        'border-top', 'border-top-width', 'border-top-style', 'border-top-color',
        'border-right', 'border-right-width', 'border-right-style', 'border-right-color',
        'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
        'border-left', 'border-left-width', 'border-left-style', 'border-left-color',
        'border-radius', 'border-spacing',
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'font', 'font-family', 'font-size', 'font-style', 'font-weight', 'font-variant',
        'color', 'text-align', 'vertical-align', 'line-height', 'text-indent', 'letter-spacing',
        'word-break', 'white-space', 'text-overflow',
        'background', 'background-color', 'background-image', 'background-repeat', 'background-position',
        'background-size', 'background-clip', 'background-origin', 'background-attachment'
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
                let previousPropName = previousProp.replace(/-webkit-/, '');
                let currentPropertyName = currentProperty.replace(/-webkit-/, '');
                let prevIndex = this.orders.indexOf(previousPropName);
                let currIndex = this.orders.indexOf(currentPropertyName);
                if (previousPropName !== previousProp) {
                    previousPropName += '-';
                }
                if (currentPropertyName !== currentProperty) {
                    currentPropertyName += '-';
                }
                if ((currIndex > prevIndex) || (prevIndex === -1 && previousPropName.localeCompare(currentPropertyName) > 0)) {
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
