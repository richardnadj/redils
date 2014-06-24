var hello = '',
	camelCase = 1,
	things = ['hello', 'stuff'],
	fun = null;

fun = (function(variable) {
	variable = 1;
	return variable;
})();

for (var i = 0; i < things.length; i++) {
	hello = things[i];
}

function named() {}

(function() {})();