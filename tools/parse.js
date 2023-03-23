var data = '';
process.stdin.on('data', (input) => {
	if (input !== null) {
		data += input.toString();
	}
});

process.stdin.on('end', (input) => {
	function readVar() {
		for (var j = i + 1; j < data.length; j++) {
			let value = data.charCodeAt(j);
			if ((value >= 65 && value <= 90) || (value >= 97 && value <= 122) || value === 95 || value === 36 || (value >= 48 && value <= 57)) {
				continue;
			}
			break;
		}
		tokens.push(data.substring(i, j));
		i = j;
	}

	function readNum() {
		for (var j = i + 1; j < data.length; j++) {
			let value = data.charCodeAt(j);
			if ((value >= 48 && value <= 57) || value === 46) {
				continue;
			}
			break;
		}
		tokens.push(data.substring(i, j));
		i = j;
	}

	function readStr() {
		for (var j = i + 1; j < data.length; j++) {
			let value = data.charCodeAt(j);
			if (value === 92) {
				j++;
				continue;
			} else if (value !== code) {
				continue;
			}
			break;
		}
		tokens.push(data.substring(i, ++j));
		i = j;
	}

	function readLineComment() {
		for (var j = i + 1; j < data.length; j++) {
			if (data.charAt(j) !== '\n') {
				continue;
			}
			break;
		}
		if (data.substring(i, j) === '//ecui.interfaces{') {
			status = 1;
			comment = true;
			infFuncCount = funcStack.length + 1;
			count = 1;
		} else if (data.substring(i, j) === '//ecui.interfaces}') {
			status = 0;
		}
		i = j + 1;
	}

	function readComment() {
		for (var j = i + 1; j < data.length; j++) {
			if (data.charAt(j) !== '*' || data.charAt(j + 1) !== '/') {
				continue;
			}
			break;
		}
		i = j + 2;
	}

	var code;
	var i;
	var comment;
	var tokens = [];
	var divi = false;
	var status = 0; // 1 - interface / 2 - class
	var count = 0;
	var stack = [];
	var funcCount = 0;
	var funcStack = [];
	var inheritCount;
	for (i = 0; i < data.length; ) {
		code = data.charCodeAt(i);
		if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || code === 36) {
			readVar();
			if (tokens[tokens.length - 2] !== '.' && tokens[tokens.length - 1] === 'function') {
				funcStack.push(funcCount);
				funcCount = 0;
				if (status >= 4 && funcStack.length === stack[stack.length - 2] + 1) {
					/^(\s+\w*)?\s*\(\s*([\w.$]+|\))/.test(data.substring(i));
					var index = data.indexOf('(', i);
					data = data.substring(0, index + 1) + '_class' + (RegExp.$2 === ')' ? '' : ', ') + data.substring(index + 1);
				}
			} else if (status === 1) {
				if (tokens[tokens.length - 2] !== '.' && tokens[tokens.length - 1] === '_class') {
					data = data.substring(0, i - 6) + 'this.Class' + data.substring(i).replace(/^\s*\.\s*([$\w]+)\s*\(\s*([^\s])/, function (match, $1, $2) {
						return '.' + $1 + '.call(this.__ECUI__this' + ($2 === ')' ? ')' : ', ' + $2);
					});
					i = i + 10 - 6;
				}
			} else if (tokens[tokens.length - 2] !== '.' && tokens[tokens.length - 1] === '_class') {
                   data = data.substring(0, i) + data.substring(i).replace(/^\s*\.\s*([$\w]+)\s*\(\s*([^\s])/, function (macth, $1, $2) {
                           return '.' + $1 + '.call(this' + ($2 === ')' ? ')' : ', ' + $2);
                   });
			} else {
				if (tokens[tokens.length - 2] !== '.' && tokens[tokens.length - 1] === '_super') {
					data = data.substring(0, i - 6) + stack[stack.length - 1] + data.substring(i).replace(/^\s*(\.[^(]+)?\s*\(\s*([^\s])/, function (macth, $1, $2) {
						return ($1 ? '.prototype' + $1 : '') + '.call(this' + ($2 === ')' ? ')' : ', ' + $2);
					});
					i = i + stack[stack.length - 1].length - 6;
				} else if (tokens[tokens.length - 2] === '(' && tokens[tokens.length - 3] === 'inherits' && tokens[tokens.length - 4] === '.' && ['core', 'ecui'].indexOf(tokens[tokens.length - 5]) >= 0) {
					if (status >= 2) {
						stack.push(--count);
					}
					stack.push(funcStack.length);
					status = 2;
					count = 1;
					/^([\s\w.$]+)/.test(data.substring(i));
					stack.push(tokens[tokens.length - 1] + RegExp.$1);
					i += RegExp.$1.length;
				} else if (funcStack.length === stack[stack.length - 2] && status >= 2 && inheritCount === undefined && tokens[tokens.length - 1] !== 'true' && tokens[tokens.length - 1] !== 'false' && tokens[tokens.length - 2] === ',') {
					status++;
				}
			}
			divi = true;
		} else if (code >= 48 && code <= 57) {
			readNum();
			divi = true;
		} else if (code === 39 || code === 34) {
			readStr();
			divi = true;
		} else if (code === 47) {
			if (data.charAt(i + 1) === '/') {
				readLineComment();
			} else if (data.charAt(i + 1) === '*') {
				readComment();
			} else if (divi) {
				tokens.push(data.charAt(i++));
				divi = false;
			} else {
				readStr();
				divi = true;
			}
		} else if (code !== 32 && code !== 10) {
			if (status) {
				if (code === 40) {
					count++;
				} else if (code === 41) {
					count--;
					if (!count) {
						if (status === 1) {
							status = 0;
						} else if (status >= 2) {
							stack.pop();
							stack.pop();
							if (stack.length) {
								count = stack.pop();
								status = 2;
							} else {
								status = 0;
							}
						}
					}
				}
			}
			if (code === 123) {
				if (funcStack.length === stack[stack.length - 2] && status >= 2 && inheritCount === undefined && tokens[tokens.length - 1] === ',') {
					inheritCount = funcCount;
				}
				funcCount++;
			} else if (code === 125) {
				funcCount--;
				if (funcStack.length === stack[stack.length - 2] && inheritCount === funcCount) {
					status++;
					inheritCount = undefined;
				}
				if (!funcCount) {
					if (funcStack.length) {
						funcCount = funcStack.pop();
					}
				}
			}
			tokens.push(data.charAt(i++));
			if (code === 41) {
				divi = true;
			} else {
				divi = false;
			}
		} else {
			i++;
		}

		if (status === 1 && tokens[tokens.length - 3] === 'this' && (tokens[tokens.length - 2] !== '.' || tokens[tokens.length - 1].charAt(0) !== '_') && funcStack.length === infFuncCount) {
			var index = data.lastIndexOf('this', i);
			if (tokens[tokens.length - 1] === 'this') {
				index = data.lastIndexOf('this', index - 1)
			}
			data = data.substring(0, index + 4) + '.__ECUI__this' + data.substring(index + 4);
			tokens.push('');
			i += 13;
		}
		if (tokens[tokens.length - 1] === '(' && tokens[tokens.length - 2] === 'interfaces' && tokens[tokens.length - 3] === '.' && ['core', 'ecui'].indexOf(tokens[tokens.length - 4]) >= 0) {
			status = 1;
			infFuncCount = funcStack.length + 1;
			count = 1;
		}
	}
	console.log(data);
})
