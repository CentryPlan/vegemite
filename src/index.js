import klona from 'klona';

function loop(list, data, state, idx) {
	var tmp, fn = list[idx++];
	if (!fn) return Promise.resolve(state);

	tmp = fn(state, data);
	if (tmp == null) return loop(list, data, state, idx);
	if (typeof tmp.then == 'function') return tmp.then(d => loop(list, data, d, idx));

	if (typeof tmp == 'object') state = tmp;
	return loop(list, data, state, idx);
}

export default function (obj) {
	var $, tree={}, hooks={}, value = obj || {};

	var rem = (arr, func) => {
		arr.splice(arr.indexOf(func) >>> 0, 1);
	}

	return $ = {
		get state() {
			return klona(value);
		},

		on(evt, func) {
			tree[evt] = (tree[evt] || []).concat(func);
			return () => rem(tree[evt], func);
		},

		set(obj, evt) {
			loop((hooks['*'] || []).concat(evt && hooks[evt] || []), value, klona(value = obj), 0);
		},

		listen(evt, func) {
			if (typeof evt == 'function') {func=evt; evt='*'}
			hooks[evt] = (hooks[evt] || []).concat(func);
			return () => rem(hooks[evt], func);
		},

		dispatch(evt, data) {
			return loop(tree[evt] || [], data, klona(value), 0).then(x => $.set(x, evt));
		}
	};
}
