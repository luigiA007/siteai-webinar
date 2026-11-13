/* SiteAI press tour: lets the presentation drive each demo site with postMessage.
   Messages in:  {siteai:'run', q:'question'} | {siteai:'reset'} | {siteai:'rail'}
   Messages out: {siteai:'ready'} | {siteai:'step', step:'rail'|'typing'|'asked'} */
(function () {
  var SITES = {
    altman:   { input: '.abr-input',  open: function () { window.AltmanRail && AltmanRail.open(); },
                ask: function (q) { window.AAROE.open(q); }, close: function () { window.AAROE && AAROE.close && AAROE.close(); } },
    radiance: { input: '.oair input', open: function () { window.AIRail && AIRail.expand(); },
                ask: function (q) { window.AAROE.open(q); }, close: function () { window.AAROE && AAROE.close && AAROE.close(); } },
    hv:       { input: '.aaroe-input', open: function () { window.AIRail && AIRail.expand && AIRail.expand(); },
                ask: function (q) { window.AAROE.open(q); }, close: function () { window.AAROE && AAROE.close && AAROE.close(); } },
    og:       { input: '.oair input', open: function () { window.OGRail && OGRail.open(); },
                ask: function (q) { window.OGAAROE.open(q); }, close: function () { window.OGAAROE && OGAAROE.close && OGAAROE.close(); } }
  };
  var site = SITES[document.documentElement.getAttribute('data-siteai')] || SITES.altman;
  var token = 0;
  // During scripted runs, don't let the demo pull keyboard focus (or the presenter's scroll position) into the frame.
  var quietUntil = 0, _focus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (o) {
    if (Date.now() < quietUntil) return;
    try { _focus.call(this, Object.assign({}, o || {}, { preventScroll: true })); } catch (e) { _focus.call(this); }
  };
  function quiet() { quietUntil = Date.now() + 12000; }

  // Hide cookie banners so they never cover the demo.
  function hideCookies() {
    var all = document.querySelectorAll('div,section,aside');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.children.length < 12 && /We value your privacy/.test(el.textContent || '')) {
        var cs = getComputedStyle(el);
        if (cs.position === 'fixed') { el.style.display = 'none'; }
      }
    }
  }
  function wait(ms, t) { return new Promise(function (res, rej) { setTimeout(function () { t === token ? res() : rej('stale'); }, ms); }); }
  function say(step) { try { parent.postMessage({ siteai: 'step', step: step }, '*'); } catch (e) {} }
  function visibleInput() {
    var list = document.querySelectorAll(site.input);
    for (var i = 0; i < list.length; i++) { var r = list[i].getBoundingClientRect(); if (r.width > 40 && r.height > 8) return list[i]; }
    return null;
  }
  function reset() {
    token++;
    try { site.close(); } catch (e) {}
    window.scrollTo(0, 0);
    var inp = visibleInput(); if (inp) inp.value = '';
  }
  function ccpInput() {
    var list = document.querySelectorAll('.aaroe-ask input, .aaroe-ask textarea');
    for (var i = 0; i < list.length; i++) { var r = list[i].getBoundingClientRect(); if (r.width > 40 && r.height > 8) return list[i]; }
    return null;
  }
  function typeInto(inp, q, t) {
    var i = 0;
    return new Promise(function (res, rej) {
      (function tick() {
        if (t !== token) return rej('stale');
        inp.value = q.slice(0, ++i);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        if (i < q.length) setTimeout(tick, 34 + Math.random() * 36); else setTimeout(res, 450);
      })();
    });
  }
  // A suggested question goes wherever the visitor is: into the open conversation, or into the launcher.
  function smart(q) {
    var c = ccpInput();
    if (!c) { run(q, true); return; }
    token++; var t = token;
    say('typing');
    typeInto(c, q, t).then(function () {
      if (t !== token) return;
      c.value = ''; c.dispatchEvent(new Event('input', { bubbles: true }));
      site.ask(q); say('asked');
    }).catch(function () {});
  }
  function run(q, keepScroll) {
    if (keepScroll) { token++; } else { reset(); }
    var t = token;
    wait(900, t).then(function () { site.open(); say('rail'); return wait(1100, t); })
      .then(function () {
        var inp = visibleInput();
        if (!inp) return;
        say('typing');
        var i = 0;
        return new Promise(function (res, rej) {
          (function tick() {
            if (t !== token) return rej('stale');
            inp.value = q.slice(0, ++i);
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            if (i < q.length) setTimeout(tick, 38 + Math.random() * 40); else setTimeout(res, 550);
          })();
        });
      })
      .then(function () {
        if (t !== token) return;
        var inp = visibleInput(); if (inp) { inp.value = ''; inp.blur(); }
        site.ask(q); say('asked');
      })
      .catch(function () {});
  }
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.siteai === 'run') { quiet(); run(String(d.q || '')); }
    else if (d.siteai === 'reset') { quiet(); reset(); }
    else if (d.siteai === 'smart') { quiet(); smart(String(d.q || '')); }
    else if (d.siteai === 'ask') { quiet(); reset(); site.ask(String(d.q || '')); say('asked'); }
    else if (d.siteai === 'rail') { reset(); site.open(); }
  });
  hideCookies(); setTimeout(hideCookies, 1500); setTimeout(hideCookies, 4000);
  try { parent.postMessage({ siteai: 'ready' }, '*'); } catch (e) {}
})();
