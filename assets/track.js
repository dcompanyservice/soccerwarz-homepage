/* Soccerwarz site usage counter (2026-10-22, adapted from the Sector31 site)
   Sends only: page path, which kind of button was pressed, and where the visit came from (site category or ?src= value).
   No cookies or device info are stored; the server keeps daily totals per path.
   The server only accepts paths matching ^/(ko|ja|en|zh-tw|zh-cn|de|fr|it|es|pt|ru)/[a-z0-9\-/]{0,100}$ — everything sent is checked against it first. */
(function () {
  try {
    if (!navigator.sendBeacon) return;
    var API = 'https://api.soccer-warz.com/pv?p=';
    var OK = /^\/(ko|ja|en|zh-tw|zh-cn|de|fr|it|es|pt|ru)\/[a-z0-9\-\/]{0,100}$/;
    var path = location.pathname.toLowerCase().replace(/index\.html$/, '');
    if (path.slice(-1) !== '/') path += '/';
    var seg = path.split('/');
    var lang = seg[1];
    if (!OK.test('/' + lang + '/')) return;
    var key = seg.slice(2).filter(function (x) { return x; }).join('-') || 'home';
    var send = function (p) {
      if (!OK.test(p)) return;
      try { navigator.sendBeacon(API + encodeURIComponent(p)); } catch (e) {}
    };
    var clean = function (q) {
      var s = ''; q = String(q || '').toLowerCase();
      for (var i = 0; i < q.length && s.length < 20; i++) {
        var c = q.charAt(i);
        if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c === '-') s += c;
      }
      return s;
    };
    var ends = function (h, d) { return h === d || h.slice(-(d.length + 1)) === '.' + d; };

    send(path);

    var src = '';
    try { src = clean(new URLSearchParams(location.search).get('src')); } catch (e) {}
    if (!src && document.referrer) {
      try {
        var h = new URL(document.referrer).hostname.toLowerCase();
        if (!ends(h, 'soccer-warz.com')) {
          src = (ends(h, 't.co') || ends(h, 'x.com') || ends(h, 'twitter.com')) ? 'x'
              : ends(h, 'instagram.com') ? 'ig'
              : (ends(h, 'youtube.com') || h === 'youtu.be') ? 'yt'
              : (ends(h, 'facebook.com') || ends(h, 'fb.com')) ? 'fb'
              : (h.indexOf('google.') >= 0) ? 'google'
              : ends(h, 'naver.com') ? 'naver'
              : (ends(h, 'yahoo.co.jp') || ends(h, 'yahoo.com')) ? 'yahoo'
              : ends(h, 'sector-31.com') ? 'sector31'
              : 'other';
        }
      } catch (e) {}
    }
    if (src) send('/' + lang + '/from/' + src + '/' + key + '/');

    var kind = function (href) {
      var u = String(href || '').toLowerCase();
      if (u.indexOf('play.google.com') >= 0 || u.indexOf('com.android.vending') >= 0) return 'play';
      if (u.indexOf('apps.apple.com') >= 0) return 'appstore';
      if (u.indexOf('x.com/') >= 0 || u.indexOf('twitter.com/') >= 0) return 'x';
      if (u.indexOf('instagram.com') >= 0) return 'ig';
      if (u.indexOf('youtube.com') >= 0 || u.indexOf('youtu.be') >= 0) return 'yt';
      if (u.indexOf('discord') >= 0) return 'discord';
      if (u.indexOf('mailto:') === 0) return 'mail';
      if (u.indexOf('http') === 0 && u.indexOf('soccer-warz.com') < 0) return 'ext';
      return '';
    };
    document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest('a') : null;
      if (!a) return;
      var k = kind(a.getAttribute('href'));
      if (k) send('/' + lang + '/click/' + k + '/' + key + '/');
    }, true);
  } catch (e) {}
})();
