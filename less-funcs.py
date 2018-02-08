import sys,re,json

class Funcs(object):
	def px2rem(self, value):
		return f2s(float(value[:-2]) / getOption('px2rem', 75)) + 'rem'

def getOption(name, defValue):
	if name in options:
		return options[name]
	else:
		return 75

def f2s(value):
	value = str(value)
	if value[-2:] == ".0":
		return value[:-2]
	else:
		return value

def repl(match):
	if hasattr(funcs, match.group(1)):
		return getattr(funcs, match.group(1))(match.group(2))
	else:
		return match.group()

funcs = Funcs()
pFunc = re.compile(r'(\w+)\(([^)]+)\)')
pKey = re.compile(r'(\w+):')

if len(sys.argv) > 1 and len(sys.argv[1]) > 0:
	options = json.loads(pKey.sub(r'"\1":', sys.argv[1]))
else:
	options = json.loads("{}")

for line in sys.stdin:
	sys.stdout.write(pFunc.sub(repl, line))
