if (!self.define) {
	const e = e => {
		'require' !== e && (e += '.js');
		let r = Promise.resolve();
		return s[e] || (r = new Promise(async r => {
			if ('document' in self) {
				const s = document.createElement('script');
				s.src = e, document.head.appendChild(s), s.onload = r;
			} else importScripts(e), r();
		})), r.then(() => {
			if (!s[e]) throw new Error(`Module ${e} didn’t register its module`);
			return s[e];
		});
	}, r = (r, s) => {
		Promise.all(r.map(e)).then(e => s(1 === e.length ? e[0] : e));
	}, s = {require: Promise.resolve(r)};
	self.define = (r, i, c) => {
		s[r] || (s[r] = Promise.resolve().then(() => {
			let s = {};
			const f = {uri: location.origin + r.slice(1)};
			return Promise.all(i.map(r => {
				switch (r) {
					case'exports':
						return s;
					case'module':
						return f;
					default:
						return e(r);
				}
			})).then(e => {
				const r = c(...e);
				return s.default || (s.default = r), s;
			});
		}));
	};
}
define('./sw.js', ['./workbox-96642457'], (function (e) {
	'use strict';
	self.addEventListener('message', e => {
		e.data && 'SKIP_WAITING' === e.data.type && self.skipWaiting();
	}), e.precacheAndRoute([{
		url: 'css/app.4bc98c05.css',
		revision: '958d671f486c14ea4d64bfae1e33d008'
	}, {url: 'favicon.ico', revision: '1ba2ae710d927f13d483fd5d1e548c9b'}, {
		url: 'img/felt-2.6f41da64.jpg',
		revision: '6f41da64269fe49ca5faf95cf45e83e5'
	}, {url: 'img/wood-grain-4.effba2f8.png', revision: 'effba2f80711b92459cf63216f8f0b7c'}, {
		url: 'index.html',
		revision: '0c9dfe28cc85bfe0f24169088815a5d2'
	}, {url: 'js/app.ff1e7ece.js', revision: '40d6526f487fb50c473ab312bcf21998'}, {
		url: 'js/chunk-vendors.c70735c9.js',
		revision: 'ea277083aa82c36306ba903319aca97e'
	}, {url: 'manifest.webmanifest', revision: 'eaca44fb5430dc7ce5cd288d332e662b'}, {
		url: 'sw.js',
		revision: '3b286e0605cbfda13958344bdfb4eca8'
	}], {});
}));
//# sourceMappingURL=sw.js.map
