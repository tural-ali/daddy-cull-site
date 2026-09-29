// Daddy, Cull! landing page. Every picture on the page is drawn here, in the
// app's own look, and plays while it is on screen: the hero's Year calendar
// once, every other scene in a loop. With less motion asked for, each shows
// one still moment instead. The photos are made up, drawn as the app's own
// synthetic library draws them, and every name and number is an example.
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var now = new Date();
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var todayLabel = now.getDate() + ' ' + monthNames[now.getMonth()];
  var year = now.getFullYear();

  // Every date a scene shows is counted from the reader's today, so the page
  // always looks like the app would on the day it is read.
  function ago(days) { return new Date(year, now.getMonth(), now.getDate() - days); }
  function sameDay(y) {
    var d = new Date(y, now.getMonth(), now.getDate());
    return d.getMonth() === now.getMonth() ? d : new Date(y, now.getMonth() + 1, 0);
  }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()); }
  function shortDate(d) { return d.getDate() + ' ' + monthNames[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); }
  function longDate(d) { return d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear(); }

  /* ---------- Little helpers ---------- */

  function icon(name, cls) {
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }
  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }
  function $(root, selector) { return root.querySelector(selector); }
  function $$(root, selector) { return Array.prototype.slice.call(root.querySelectorAll(selector)); }
  function seeded(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function fmt(n) { return Math.round(n).toLocaleString('en-GB'); }
  function relRect(node, root) {
    var a = node.getBoundingClientRect(), b = root.getBoundingClientRect();
    return {x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height};
  }
  function animate(node, frames, options) {
    if (!node.animate) return Promise.resolve();
    var animation = node.animate(frames, options);
    return animation.finished ? animation.finished.catch(function () {}) : new Promise(function (r) { setTimeout(r, options.duration || 300); });
  }

  /* ---------- Synthetic photos ---------- */

  var palettes = [
    {sky: ['#3d7a8a', '#a9d3d6'], sun: '#f6f3ea', m: ['#6b989d', '#44717a', '#244a52'], water: true},
    {sky: ['#8fb6c9', '#dfe7df'], sun: '#fdf8e8', m: ['#a09aa6', '#71836d', '#415d41']},
    {sky: ['#f08a5d', '#fac991'], sun: '#ffe6b8', m: ['#c05a4f', '#8f363b', '#5c2029']},
    {sky: ['#2d3a66', '#8f82b3'], sun: '#f7dc8f', m: ['#7d6dab', '#574b88', '#352d5d'], water: true},
    {sky: ['#1f3b5a', '#79a6c8'], sun: '#eef2f7', m: ['#557593', '#37536f', '#1e3348']},
    {sky: ['#6aa7a0', '#dcf0e4'], sun: '#ffffff', m: ['#77a684', '#4f7d5e', '#2e5339']},
    {sky: ['#c96f8a', '#f5c6b5'], sun: '#fff2dc', m: ['#a0617c', '#72405f', '#45263f']},
    {sky: ['#4a6d84', '#f1cb8a'], sun: '#fff4d6', m: ['#80858c', '#545b63', '#30353b'], water: true}
  ];
  var photoCache = {};
  function photo(seed) {
    if (photoCache[seed]) return photoCache[seed];
    var r = seeded(seed * 7919 + 17), p = palettes[seed % palettes.length];
    var w = 300, h = 200, horizon = p.water ? 128 : 200;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.sky[0] + '"/><stop offset="1" stop-color="' + p.sky[1] + '"/></linearGradient>' +
      '<clipPath id="w"><rect y="' + horizon + '" width="300" height="' + (h - horizon) + '"/></clipPath></defs>' +
      '<rect width="300" height="200" fill="url(#s)"/>' +
      '<circle cx="' + (60 + r() * 180).toFixed(0) + '" cy="' + (34 + r() * 36).toFixed(0) + '" r="' + (11 + r() * 9).toFixed(0) + '" fill="' + p.sun + '" opacity=".95"/>';
    var ridges = '';
    p.m.forEach(function (colour, layer) {
      var base = horizon - 62 + layer * 22, points = '0,' + h;
      for (var x = 0; x <= w; x += 10) {
        var peak = Math.abs(Math.sin(x / (38 + layer * 9) + seed + layer)) * (30 - layer * 6);
        points += ' ' + x + ',' + (base - peak + r() * 9).toFixed(1);
      }
      points += ' ' + w + ',' + h;
      ridges += '<polygon points="' + points + '" fill="' + colour + '"/>';
    });
    svg += ridges;
    if (p.water) {
      svg += '<rect y="' + horizon + '" width="300" height="' + (h - horizon) + '" fill="' + p.m[2] + '"/>' +
        '<g clip-path="url(#w)"><g transform="translate(0 ' + (horizon * 2) + ') scale(1 -1)" opacity=".35">' + ridges + '</g></g>' +
        '<rect y="' + horizon + '" width="300" height="' + (h - horizon) + '" fill="' + p.sky[1] + '" opacity=".12"/>';
    }
    svg += '</svg>';
    photoCache[seed] = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    return photoCache[seed];
  }
  function tile(seed, cls, extra) {
    var node = el('div', 'ph' + (cls ? ' ' + cls : ''), extra || '');
    node.style.backgroundImage = photo(seed);
    return node;
  }

  /* ---------- Scenes ---------- */

  var scenes = {};

  // A scene's clock only runs while the scene is on screen and the tab is
  // open, so a loop never plays to nobody. Scenes on the Features stage start
  // again from the top each time they come forward; a wait from a run that
  // was started over throws, and the loop begins afresh.
  var AGAIN = {};
  function makeWait(state) {
    return function (ms) {
      return new Promise(function (resolve, reject) {
        var left = ms, last = performance.now();
        (function tick() {
          if (state.gen !== state.runGen) { reject(AGAIN); return; }
          var t = performance.now();
          if (state.visible && !document.hidden) left -= t - last;
          last = t;
          if (left <= 0) resolve(); else setTimeout(tick, Math.min(left, 100));
        })();
      });
    };
  }
  function run(state) {
    if (state.running) return;
    state.running = true;
    (async function () {
      for (;;) {
        state.runGen = state.gen;
        try { await state.api.loop(); } catch (e) { if (e !== AGAIN) { console.error(e); return; } }
      }
    })();
  }
  function show(state, visible, fresh) {
    if (visible && fresh && state.running && !state.visible) state.gen++;
    state.visible = visible;
    if (visible) run(state);
  }

  function start() {
    var observer = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { show(entry.target.__scene, entry.isIntersecting, false); });
    }, {threshold: 0.25}) : null;

    $$(document, '[data-scene]').forEach(function (node) {
      var make = scenes[node.dataset.scene];
      if (!make) return;
      var inner = el('div', 'sci sc-' + node.dataset.scene);
      inner.setAttribute('aria-hidden', 'true');
      node.appendChild(inner);
      var state = {visible: false, running: false, gen: 0, runGen: 0};
      state.wait = makeWait(state);
      state.api = make(inner, state.wait);
      node.__scene = state;
      if (reduce || !observer) {
        if (state.api.still) state.api.still();
        return;
      }
      if (!node.closest('.stage')) observer.observe(node);
    });
  }

  function press(key) {
    key.classList.add('down');
    setTimeout(function () { key.classList.remove('down'); }, 220);
  }

  function confetti(root, x, y) {
    if (reduce) return;
    var colours = ['var(--coral)', 'var(--amber)', 'var(--mint)', '#8fb6ff'];
    for (var i = 0; i < 26; i++) {
      var bit = el('span', 'bit');
      bit.style.left = x + 'px';
      bit.style.top = y + 'px';
      bit.style.background = colours[i % colours.length];
      root.appendChild(bit);
      var angle = Math.random() * Math.PI * 2, distance = 50 + Math.random() * 90;
      var dx = Math.cos(angle) * distance, dy = Math.sin(angle) * distance - 40;
      (function (node) {
        animate(node, [
          {transform: 'translate(0,0) rotate(0deg)', opacity: 1},
          {transform: 'translate(' + dx + 'px,' + (dy + 90) + 'px) rotate(' + (Math.random() * 540) + 'deg)', opacity: 0}
        ], {duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)'}).then(function () { node.remove(); });
      })(bit);
    }
  }

  // A photo drawn in to a dot and thrown into the Bin, as the app does it.
  function throwToBin(root, from, bin) {
    var a = relRect(from, root), b = relRect(bin, root);
    var dot = el('span', 'fly');
    dot.style.backgroundImage = from.style.backgroundImage;
    dot.style.left = (a.x + a.w / 2 - 9) + 'px';
    dot.style.top = (a.y + a.h / 2 - 9) + 'px';
    root.appendChild(dot);
    var dx = b.x + b.w / 2 - (a.x + a.w / 2), dy = b.y + b.h / 2 - (a.y + a.h / 2);
    return animate(dot, [
      {transform: 'translate(0,0) scale(2.4)', opacity: 0.9},
      {transform: 'translate(' + dx * 0.45 + 'px,' + (dy * 0.45 - 60) + 'px) scale(1)', opacity: 1, offset: 0.5},
      {transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.4)', opacity: 0.6}
    ], {duration: 700, easing: 'cubic-bezier(.45,.05,.35,1)'}).then(function () {
      dot.remove();
      animate(bin, [{transform: 'scale(1)'}, {transform: 'scale(1.3)'}, {transform: 'scale(1)'}], {duration: 320, easing: 'ease-out'});
    });
  }

  function appFrame(opts) {
    var frame = el('div', 'app');
    frame.innerHTML =
      '<div class="app-top">' +
        '<img class="app-mark" src="images/mark.svg" alt="">' +
        '<span class="app-streak">' + icon('local_fire_department') + '<b data-streak>6</b></span>' +
        '<span class="app-ico">' + icon('notifications') + '</span>' +
        '<span class="app-ico">' + icon('pending_actions') + '</span>' +
        '<span class="app-search">' + icon('search') +
          (opts.pill ? '<span class="app-pill">' + icon('calendar_month') + opts.pill + '</span>' : '') +
          '<span class="app-ph">' + (opts.placeholder || 'Filter, or go to another date') + '</span></span>' +
        (opts.action ? '<span class="app-action" data-action>' + icon('check') + '<span>' + opts.action + '</span></span>' : '') +
      '</div>' +
      '<div class="app-body">' +
        '<div class="app-side">' +
          side('photo', 'Today', opts.page === 'today') +
          side('calendar_month', 'Year') +
          '<span class="side-h">Collections</span>' +
          side('filter_none', 'Duplicates') +
          '<span class="side-h">Sync</span>' +
          side('cloud_sync', 'Apple Photos') +
          '<span class="side-h" data-tools hidden>Tools</span>' +
          '<span data-tools-items></span>' +
          '<span class="side-h">History</span>' +
          side('history', 'Log') +
          '<span class="side-item" data-bin>' + icon('delete') + '<span class="side-l">Bin</span><b class="side-n" data-bin-count hidden>0</b></span>' +
          '<span class="side-gap"></span>' +
          '<span class="side-item">' + icon('check_circle') + '<span class="side-l">Reviewed</span></span>' +
          '<span class="side-meter"><span data-meter></span></span>' +
          side('extension', 'Addons', opts.page === 'addons') +
          side('settings', 'Settings') +
        '</div>' +
        '<div class="app-main"></div>' +
      '</div>';
    return frame;
    function side(name, label, on) {
      return '<span class="side-item' + (on ? ' on' : '') + '">' + icon(name) + '<span class="side-l">' + label + '</span></span>';
    }
  }

  /* The hero: the Year calendar, filling in once up to today. */
  (function () {
    var grid = $(document, '[data-grid]');
    if (!grid) return;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var lengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var todayMonth = now.getMonth(), todayDay = now.getDate();
    var random = seeded(20130929);
    var before = [], filed = 0;
    var fragment = document.createDocumentFragment();
    months.forEach(function (name, month) {
      fragment.appendChild(el('span', 'm', name.toUpperCase()));
      for (var day = 1; day <= 31; day++) {
        if (day > lengths[month]) { fragment.appendChild(el('span', 'gap')); continue; }
        var r = random();
        var kind = r < 0.07 ? '' : r < 0.6 ? 'few' : r < 0.86 ? 'some' : 'many';
        var cell = el('span', 'c' + (kind ? ' ' + kind : ''));
        cell.title = day + ' ' + name;
        if (kind) filed++;
        if (month === todayMonth && day === todayDay) {
          cell.className = 'c now';
          if (!kind) filed++;
        } else if (kind && (month < todayMonth || (month === todayMonth && day < todayDay))) {
          before.push(cell);
        }
        fragment.appendChild(cell);
      }
    });
    grid.appendChild(fragment);
    var count = $(document, '[data-reviewed]'), bar = $(document, '[data-bar]');
    $(document, '[data-dates]').textContent = filed;
    $(document, '[data-today-label]').textContent = 'Today, ' + todayLabel;
    function show(done) {
      for (var i = 0; i < done; i++) before[i].classList.add('done');
      count.textContent = done;
      bar.style.width = (done / filed * 100).toFixed(2) + '%';
    }
    if (reduce || !before.length || !('IntersectionObserver' in window)) { show(before.length); return; }
    // The year fills in while the calendar is on screen, and again each time
    // it comes back, so a reader who looks at it after the headline still
    // sees it happen. Off screen or in a hidden tab its clock stands still.
    var FILL = 5200, HOLD = 3400, REST = 700, cycle = FILL + HOLD + REST;
    var clock = 0, last = null, visible = false, shown = 0, ticking = false;
    function paint(target) {
      for (; shown < target; shown++) before[shown].classList.add('done');
      for (; shown > target; shown--) before[shown - 1].classList.remove('done');
      count.textContent = shown;
      bar.style.width = (shown / filed * 100).toFixed(2) + '%';
    }
    function frame(time) {
      if (!visible) { ticking = false; last = null; return; }
      if (last !== null && !document.hidden) clock = (clock + time - last) % cycle;
      last = time;
      var progress = Math.min(1, clock / FILL);
      paint(clock < FILL + HOLD ? Math.round((1 - Math.pow(1 - progress, 2)) * before.length) : 0);
      requestAnimationFrame(frame);
    }
    new IntersectionObserver(function (entries) {
      var now = entries[entries.length - 1].isIntersecting;
      if (now && !visible) { clock = 0; paint(0); }
      visible = now;
      if (visible && !ticking) { ticking = true; requestAnimationFrame(frame); }
    }, {threshold: 0.4}).observe(grid);
  })();

  /* Today: a day being cleaned up, one key at a time. */
  scenes.today = function (root, wait) {
    var frame = appFrame({page: 'today', pill: todayLabel, action: 'Mark ' + todayLabel + ' reviewed'});
    root.appendChild(frame);
    var main = $(frame, '.app-main');
    main.innerHTML =
      '<div class="day-h"><h4>' + todayLabel + '</h4><p><b>9</b> memories · <b>3</b> years · 41.2 MB</p></div>' +
      '<div class="yr"><h5>' + (year - 10) + ' <span>3 memories</span></h5><div class="row" data-row="0"></div></div>' +
      '<div class="yr"><h5>' + (year - 7) + ' <span>2 memories</span></h5><div class="row" data-row="1"></div></div>' +
      '<div class="yr"><h5>' + (year - 3) + ' <span>4 memories</span></h5><div class="row" data-row="2"></div></div>' +
      '<div class="keyhint" data-hint></div>' +
      '<div class="done-card" data-card><div class="done-in">' + icon('task_alt') + '<b>' + todayLabel + ' reviewed</b><span>7 kept · 2 in the Bin · 1 favourite</span></div></div>';
    var layout = [[[3, 1.5], [8, 0.75], [5, 1.5]], [[2, 1.5], [14, 1.33, '0:14']], [[9, 1], [12, 1.5], [7, 1.5], [13, 0.75]]];
    var tiles = [];
    layout.forEach(function (row, index) {
      var holder = $(main, '[data-row="' + index + '"]');
      holder.style.setProperty('--sum', row.reduce(function (sum, item) { return sum + item[1]; }, 0));
      row.forEach(function (item) {
        var node = tile(item[0], '', '<span class="ph-heart">' + icon('favorite-fill') + '</span>' + (item[2] ? '<span class="ph-dur">' + item[2] + '</span>' : '') + '<span class="ph-kept">' + icon('check') + '</span>');
        node.style.flexGrow = item[1];
        node.dataset.grow = item[1];
        holder.appendChild(node);
        tiles.push(node);
      });
    });
    var hint = $(main, '[data-hint]'), card = $(main, '[data-card]');
    var bin = $(frame, '[data-bin]'), binCount = $(frame, '[data-bin-count]');
    var streak = $(frame, '[data-streak]'), meter = $(frame, '[data-meter]'), action = $(frame, '[data-action]');
    var inBin = 0;

    function reset() {
      tiles.forEach(function (t) { t.className = 'ph'; t.style.flexGrow = t.dataset.grow; });
      inBin = 0; binCount.hidden = true; streak.textContent = '6';
      meter.style.width = '38%'; card.classList.remove('show'); action.classList.remove('hit'); hint.classList.remove('show');
    }
    function setBin(n) { inBin = n; binCount.textContent = n; binCount.hidden = n === 0; }
    async function key(k, label) {
      hint.innerHTML = '<kbd>' + k + '</kbd> ' + label;
      hint.classList.add('show');
      press(hint.firstChild);
      await wait(260);
    }
    async function focus(t) {
      tiles.forEach(function (x) { x.classList.remove('focus'); });
      if (t) t.classList.add('focus');
      await wait(520);
    }
    async function remove(t) {
      await key('X', 'removes');
      throwToBin(frame, t, bin);
      t.classList.add('gone');
      t.style.flexGrow = 0;
      await wait(720);
      setBin(inBin + 1);
    }
    return {
      still: function () {
        reset();
        tiles[0].classList.add('kept'); tiles[3].classList.add('kept'); tiles[2].classList.add('fav');
        tiles[1].classList.add('gone'); tiles[1].style.flexGrow = 0; setBin(1);
      },
      loop: async function () {
        reset();
        await wait(900);
        await focus(tiles[0]); await key('K', 'keeps'); tiles[0].classList.add('kept'); await wait(500);
        await focus(tiles[1]); await remove(tiles[1]);
        await focus(tiles[2]); await key('F', 'favourites'); tiles[2].classList.add('fav'); await wait(700);
        await key('⌘Z', 'undoes'); tiles[1].classList.remove('gone'); tiles[1].style.flexGrow = tiles[1].dataset.grow; setBin(0); await wait(700);
        await focus(tiles[1]); await key('K', 'keeps'); tiles[1].classList.add('kept'); await wait(400);
        await focus(tiles[3]); await key('K', 'keeps'); tiles[3].classList.add('kept'); await wait(300);
        await focus(tiles[4]); await remove(tiles[4]);
        await focus(tiles[5]); await key('K', 'keeps'); tiles[5].classList.add('kept'); await wait(300);
        await focus(tiles[7]); await remove(tiles[7]);
        await focus(null);
        await key('⇧R', 'marks the date reviewed');
        action.classList.add('hit');
        await wait(350);
        hint.classList.remove('show');
        card.classList.add('show');
        streak.textContent = '7';
        animate(streak.parentNode, [{transform: 'scale(1)'}, {transform: 'scale(1.35)'}, {transform: 'scale(1)'}], {duration: 420});
        meter.style.width = '41%';
        var c = relRect(card.firstChild, frame);
        confetti(frame, c.x + c.w / 2, c.y + c.h / 2);
        await wait(3200);
      }
    };
  };

  /* How it works, 1: files arriving from every source. */
  scenes.sources = function (root, wait) {
    var sources = [
      ['sd_card', 'Camera card', ['DSC_1180.NEF', 'DSC_1181.JPG']],
      ['cloud_download', 'iCloud Photos', ['IMG_5531.HEIC', 'IMG_5532.MOV']],
      ['photo_library', 'Apple Photos', ['IMG_4410.HEIC', 'IMG_4412.MOV']],
      ['inventory_2', 'Google Takeout', ['PXL_0021.jpg', 'PXL_0022.mp4']]
    ];
    root.innerHTML = '<div class="src-list">' + sources.map(function (s) {
      return '<span class="src">' + icon(s[0]) + s[1] + '</span>';
    }).join('') + '</div><div class="inbox">' + icon('folder') + '<b>Import</b><span><b data-n>0</b> files</span></div>';
    var rows = $$(root, '.src'), box = $(root, '.inbox'), n = $(root, '[data-n]');
    return {
      still: function () { n.textContent = '8'; },
      loop: async function () {
        n.textContent = '0';
        for (var i = 0; i < 8; i++) {
          var s = i % 4, row = rows[s];
          row.classList.add('on');
          var chip = el('span', 'fchip', '<i style="background-image:' + photo(i + 20).replace(/"/g, "'") + '"></i>' + sources[s][2][i >> 2]);
          root.appendChild(chip);
          var a = relRect(row, root), b = relRect(box, root);
          chip.style.left = (a.x + a.w - 20) + 'px'; chip.style.top = (a.y + 2) + 'px';
          var dx = b.x + 16 - (a.x + a.w - 20), dy = b.y + b.h / 2 - 12 - a.y;
          (function (c, r) {
            animate(c, [{transform: 'translate(0,0)', opacity: 0}, {transform: 'translate(' + dx * 0.2 + 'px,' + dy * 0.2 + 'px)', opacity: 1, offset: 0.2}, {transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.6)', opacity: 0}], {duration: 1100, easing: 'ease-in-out'}).then(function () {
              c.remove(); r.classList.remove('on');
              n.textContent = +n.textContent + 1;
              animate(box, [{transform: 'scale(1)'}, {transform: 'scale(1.04)'}, {transform: 'scale(1)'}], {duration: 260});
            });
          })(chip, row);
          await wait(650);
        }
        await wait(2200);
      }
    };
  };

  /* How it works, 2: a photo filed under the day it was taken. */
  scenes.filing = function (root, wait) {
    var takenOn = ago(1), day = iso(takenOn);
    var lines = [
      [0, 'folder', 'Library/'], [1, 'folder', day.slice(0, 4) + '/'], [2, 'folder', day.slice(0, 7) + '/'], [3, 'folder', day + '/'],
      [4, 'image', 'IMG_5531.HEIC'], [4, 'videocam', 'IMG_5531.MOV']
    ];
    root.innerHTML = '<div class="file-in"><span class="fchip still" data-chip><i style="background-image:' + photo(4).replace(/"/g, "'") + '"></i>IMG_5531.HEIC</span><span class="taken" data-taken>Taken ' + longDate(takenOn) + '</span></div>' +
      '<div class="ftree">' + lines.map(function (l) {
        return '<span class="fl" style="--d:' + l[0] + '">' + icon(l[1]) + l[2] + '</span>';
      }).join('') + '<span class="fl dupe" style="--d:0">' + icon('layers') + 'Already in the library: IMG_0412.JPG</span></div>';
    var rows = $$(root, '.fl'), chip = $(root, '[data-chip]'), taken = $(root, '[data-taken]');
    return {
      still: function () { rows.forEach(function (r) { r.classList.add('show'); }); taken.classList.add('show'); },
      loop: async function () {
        rows.forEach(function (r) { r.classList.remove('show', 'hot'); });
        taken.classList.remove('show'); chip.classList.remove('gone');
        await wait(700);
        taken.classList.add('show');
        await wait(700);
        for (var i = 0; i < 4; i++) { rows[i].classList.add('show'); if (i === 3) rows[i].classList.add('hot'); await wait(320); }
        chip.classList.add('gone');
        rows[4].classList.add('show', 'hot'); await wait(260);
        rows[5].classList.add('show', 'hot'); await wait(900);
        rows[6].classList.add('show');
        await wait(2600);
      }
    };
  };

  /* How it works, 3: the four keys on one photo. */
  scenes.keys = function (root, wait) {
    root.innerHTML = '<div class="keys-stage"></div><div class="keycaps"><kbd>K</kbd><kbd>X</kbd><kbd>F</kbd><kbd>⌘Z</kbd></div><span class="keys-said" data-said></span>';
    var stage = $(root, '.keys-stage');
    var t = tile(2, '', '<span class="ph-heart">' + icon('favorite-fill') + '</span><span class="ph-kept">' + icon('check') + '</span><span class="ph-bin">' + icon('delete') + ' In the Bin</span>');
    stage.appendChild(t);
    var caps = $$(root, '.keycaps kbd'), said = $(root, '[data-said]');
    async function step(i, words, fn) { press(caps[i]); caps[i].classList.add('lit'); said.textContent = words; fn(); await wait(1100); caps[i].classList.remove('lit'); }
    return {
      still: function () { t.classList.add('kept', 'fav'); said.textContent = 'Kept, with a heart'; },
      loop: async function () {
        t.className = 'ph'; said.textContent = '';
        await wait(600);
        await step(0, 'Kept', function () { t.classList.add('kept'); });
        await step(1, 'Moved to the Bin', function () { t.classList.remove('kept'); t.classList.add('binned'); });
        await step(3, 'Undone', function () { t.classList.remove('binned'); t.classList.add('kept'); });
        await step(2, 'Favourited', function () { t.classList.add('fav'); });
        await wait(1200);
      }
    };
  };

  /* Duplicates: three identical copies, one kept. */
  scenes.duplicates = function (root, wait) {
    root.innerHTML = '<div class="mini-panel"><p class="mini-meta">3 identical copies · 241.9 KB each · <b data-free>483.8 KB</b> <span data-free-l>reclaimable</span></p><div class="dup-row"></div><span class="pill-btn" data-go>Keep the selected copy, mark the other 2 for the Bin</span></div><span class="mini-bin" data-bin>' + icon('delete') + '</span>';
    var row = $(root, '.dup-row'), labels = [iso(sameDay(year - 7)), iso(sameDay(year - 7)), iso(new Date(year - 7, now.getMonth(), now.getDate() + 88))], tiles = [];
    labels.forEach(function (label) {
      var t = tile(0, '', '<span class="badge" data-b>choose as keeper</span><span class="ph-date">' + label + '</span>');
      row.appendChild(t); tiles.push(t);
    });
    var go = $(root, '[data-go]'), bin = $(root, '[data-bin]'), freeL = $(root, '[data-free-l]');
    function choose(i) {
      tiles.forEach(function (t, j) {
        t.classList.toggle('keeper', i === j);
        $(t, '[data-b]').innerHTML = i === j ? icon('check') + 'keep this one' : 'choose as keeper';
      });
    }
    return {
      still: function () { choose(0); },
      loop: async function () {
        tiles.forEach(function (t) { t.classList.remove('gone'); });
        freeL.textContent = 'reclaimable'; go.classList.remove('hit');
        choose(-1);
        await wait(800); choose(2); await wait(700); choose(1); await wait(700); choose(0); await wait(900);
        go.classList.add('hit'); await wait(300);
        for (var i = 1; i < 3; i++) { throwToBin(root, tiles[i], bin); tiles[i].classList.add('gone'); await wait(250); }
        await wait(600);
        freeL.textContent = 'freed';
        await wait(2400);
      }
    };
  };

  /* Viewer: a RAW and its JPEG, the Info panel, turning. */
  scenes.viewer = function (root, wait) {
    root.innerHTML = '<div class="viewer"><div class="v-stage"><span class="v-badge" data-fmt>RAW</span></div><div class="v-info"><b>Info</b><dl>' +
      '<dt>Taken</dt><dd>' + shortDate(sameDay(year - 7)) + ', 17:42</dd><dt>Size</dt><dd data-size>6000 × 4000 · 24.3 MB</dd><dt>File</dt><dd data-file>DSC_1180.NEF</dd><dt>SHA-256</dt><dd class="mono">9f2c…a41e</dd></dl></div></div>' +
      '<div class="v-keys"><kbd data-k="i">I</kbd><kbd data-k="r">]</kbd><kbd data-k="n">→</kbd></div>';
    var stage = $(root, '.v-stage'), info = $(root, '.v-info'), fmtBadge = $(root, '[data-fmt]');
    var size = $(root, '[data-size]'), file = $(root, '[data-file]');
    var img = tile(5, 'v-img');
    stage.insertBefore(img, stage.firstChild);
    var keyI = $(root, '[data-k="i"]'), keyR = $(root, '[data-k="r"]'), keyN = $(root, '[data-k="n"]');
    function raw(on) {
      fmtBadge.textContent = on ? 'RAW' : 'JPEG';
      size.textContent = on ? '6000 × 4000 · 24.3 MB' : '6000 × 4000 · 8.1 MB';
      file.textContent = on ? 'DSC_1180.NEF' : 'DSC_1180.JPG';
    }
    return {
      still: function () { info.classList.add('open'); },
      loop: async function () {
        info.classList.remove('open'); img.style.transform = ''; img.style.backgroundImage = photo(5); raw(true);
        await wait(900);
        press(keyI); info.classList.add('open'); await wait(1200);
        raw(false); await wait(1000); raw(true); await wait(900);
        press(keyR); img.style.transform = 'rotate(90deg) scale(.66)'; await wait(1200);
        img.style.transform = ''; await wait(700);
        press(keyN); await animate(img, [{opacity: 1}, {opacity: 0}], {duration: 200});
        img.style.backgroundImage = photo(13); file.textContent = 'IMG_0412.HEIC'; fmtBadge.textContent = 'HEIC'; size.textContent = '4032 × 3024 · 2.9 MB';
        await animate(img, [{opacity: 0}, {opacity: 1}], {duration: 240});
        await wait(1800);
      }
    };
  };

  /* Undo: choices taken back and done again. */
  scenes.undo = function (root, wait) {
    var choices = [['check', 'Kept', 'IMG_0412.JPG'], ['delete', 'Removed', 'IMG_0413.MOV'], ['favorite', 'Favourited', 'DSC_1180.NEF'], ['delete', 'Removed', 'IMG_0415.HEIC']];
    root.innerHTML = '<div class="mini-panel undo"><div class="undo-h"><b>Log</b><span data-depth></span></div><div class="undo-list"></div></div><div class="v-keys"><kbd data-z>⌘Z</kbd><kbd data-u>⌘U</kbd></div>';
    var list = $(root, '.undo-list'), depth = $(root, '[data-depth]'), z = $(root, '[data-z]'), u = $(root, '[data-u]');
    var rows = choices.map(function (c, i) {
      var r = el('div', 'undo-row', icon(c[0]) + '<b>' + c[1] + '</b><span>' + c[2] + '</span><em>' + (i + 1) + ' min ago</em>');
      return r;
    });
    function count() {
      var live = rows.filter(function (r) { return r.parentNode && !r.classList.contains('undone'); }).length;
      depth.textContent = live + ' to take back';
    }
    return {
      still: function () { rows.slice().reverse().forEach(function (r) { list.appendChild(r); }); rows[3].classList.add('undone'); count(); },
      loop: async function () {
        list.innerHTML = ''; rows.forEach(function (r) { r.classList.remove('undone'); });
        count();
        for (var i = 0; i < rows.length; i++) { list.insertBefore(rows[i], list.firstChild); count(); await wait(500); }
        await wait(600);
        press(z); rows[3].classList.add('undone'); count(); await wait(900);
        press(z); rows[2].classList.add('undone'); count(); await wait(900);
        press(u); rows[2].classList.remove('undone'); count(); await wait(2200);
      }
    };
  };

  /* A Bin task in the background, and the grace period. */
  scenes.tasks = function (root, wait) {
    root.innerHTML = '<div class="mini-panel tasks"><div class="task" data-t1><span class="ring" data-ring></span><div><b>Restoring 1,240 files from the Bin</b><span data-t1s>0 of 1,240</span></div></div>' +
      '<div class="task" data-t2><span class="ring warn">' + icon('delete') + '</span><div><b>Deleting 86 files for good</b><span data-t2s>Waiting</span></div><span class="pill-btn small" data-retry hidden>Try again</span></div>' +
      '<div class="grace"></div></div>';
    var ring = $(root, '[data-ring]'), t1s = $(root, '[data-t1s]'), t2s = $(root, '[data-t2s]'), retry = $(root, '[data-retry]');
    var grace = $(root, '.grace');
    var g = tile(3, '', '<span class="count">Deleted for good in <b data-days>30</b> days</span>');
    grace.appendChild(g);
    var days = $(root, '[data-days]');
    function progress(p) { ring.style.setProperty('--p', p); t1s.textContent = fmt(p * 1240) + ' of 1,240'; }
    return {
      still: function () { progress(0.6); days.textContent = '29'; },
      loop: async function () {
        progress(0); ring.classList.remove('ok'); t2s.textContent = 'Waiting'; retry.hidden = true; days.textContent = '30';
        await wait(500);
        for (var i = 1; i <= 20; i++) { progress(i / 20); if (i % 7 === 0) days.textContent = +days.textContent - 1; await wait(110); }
        ring.classList.add('ok'); t1s.textContent = 'Restored 1,240 files';
        await wait(700);
        t2s.textContent = '84 deleted · 2 could not be'; retry.hidden = false;
        await wait(1100); retry.classList.add('hit'); await wait(300); retry.classList.remove('hit'); retry.hidden = true;
        t2s.textContent = 'Deleted 86 files'; days.textContent = '27';
        await wait(2400);
      }
    };
  };

  /* New arrivals: the bell, and a red dot on a reviewed date. */
  scenes.arrivals = function (root, wait) {
    root.innerHTML = '<div class="bellrow"><span class="bell" data-bell>' + icon('notifications') + '<b data-bn hidden>0</b></span></div><div class="mini-panel notes"></div><div class="strip"></div>';
    var notes = $(root, '.notes'), bell = $(root, '[data-bell]'), bn = $(root, '[data-bn]'), strip = $(root, '.strip');
    for (var d = 6; d >= 0; d--) strip.appendChild(el('span', 'scell done', '<i>' + ago(d).getDate() + '</i>'));
    var cells = $$(strip, '.scell');
    var items = [['12 files reached', shortDate(ago(1))], ['3 files reached', shortDate(ago(4))], ['1 deletion on the phone marked for the Bin', '']];
    return {
      still: function () { cells[5].classList.add('dot'); bn.hidden = false; bn.textContent = '2'; },
      loop: async function () {
        notes.innerHTML = ''; bn.hidden = true; cells.forEach(function (c) { c.classList.remove('dot'); });
        await wait(800);
        for (var i = 0; i < items.length; i++) {
          var n = el('div', 'note', icon(i === 2 ? 'delete' : 'photo_library') + '<span>' + items[i][0] + (items[i][1] ? ' <b>' + items[i][1] + '</b>' : '') + '</span>');
          notes.appendChild(n);
          bn.hidden = false; bn.textContent = i + 1;
          animate(bell, [{transform: 'rotate(0)'}, {transform: 'rotate(14deg)'}, {transform: 'rotate(-10deg)'}, {transform: 'rotate(0)'}], {duration: 420});
          if (i === 0) cells[5].classList.add('dot');
          if (i === 1) cells[2].classList.add('dot');
          await wait(1000);
        }
        await wait(2200);
      }
    };
  };

  /* The review streak. */
  scenes.streak = function (root, wait) {
    root.innerHTML = '<div class="streak"><span class="flame">' + icon('local_fire_department-fill') + '<b data-s>0</b></span><span class="streak-l">days in a row</span></div><div class="week"></div>';
    var week = $(root, '.week'), s = $(root, '[data-s]'), labels = [6, 5, 4, 3, 2, 1, 0].map(function (d) { return 'SMTWTFS'.charAt(ago(d).getDay()); });
    labels.forEach(function (l) { week.appendChild(el('span', 'wd', '<i>' + l + '</i>' + icon('check'))); });
    var days = $$(week, '.wd');
    return {
      still: function () { days.forEach(function (d) { d.classList.add('on'); }); s.textContent = '7'; },
      loop: async function () {
        days.forEach(function (d) { d.classList.remove('on'); }); s.textContent = '0';
        await wait(700);
        for (var i = 0; i < 7; i++) {
          days[i].classList.add('on'); s.textContent = i + 1;
          animate(s.parentNode, [{transform: 'scale(1)'}, {transform: 'scale(1.18)'}, {transform: 'scale(1)'}], {duration: 300});
          await wait(520);
        }
        var r = relRect(s.parentNode, root);
        confetti(root, r.x + r.w / 2, r.y + r.h / 2);
        await wait(2600);
      }
    };
  };

  /* Google Photos from Takeout: an export sorted against the library. */
  scenes.takeout = function (root, wait) {
    root.innerHTML = '<div class="zip">' + icon('inventory_2') + '<b>takeout-001.zip</b><span>50 GB</span></div>' +
      '<div class="buckets"><div class="bk new"><b data-a>0</b><span>Not in the library</span></div><div class="bk diff"><b data-b>0</b><span>Different copies</span></div><div class="bk have"><b data-c>0</b><span>Already in the library</span></div></div>' +
      '<span class="pill-btn" data-add>Add 1,204 to the library</span>';
    var zip = $(root, '.zip'), a = $(root, '[data-a]'), b = $(root, '[data-b]'), c = $(root, '[data-c]'), add = $(root, '[data-add]');
    var bks = $$(root, '.bk');
    return {
      still: function () { a.textContent = '1,204'; b.textContent = '38'; c.textContent = '8,911'; },
      loop: async function () {
        a.textContent = b.textContent = c.textContent = '0'; add.classList.remove('hit', 'show');
        await wait(700);
        for (var i = 0; i < 12; i++) {
          var which = i % 6 === 5 ? 1 : i % 2 ? 2 : 0, bk = bks[which];
          var dot = tile(30 + i, 'tdot'); root.appendChild(dot);
          var from = relRect(zip, root), to = relRect(bk, root);
          dot.style.left = (from.x + from.w / 2 - 10) + 'px'; dot.style.top = (from.y + from.h - 10) + 'px';
          (function (d) {
            animate(d, [{transform: 'translate(0,0)', opacity: 1}, {transform: 'translate(' + (to.x + to.w / 2 - from.x - from.w / 2) + 'px,' + (to.y + 14 - from.y - from.h) + 'px) scale(.5)', opacity: 0}], {duration: 700, easing: 'ease-in'}).then(function () { d.remove(); });
          })(dot);
          var p = (i + 1) / 12;
          a.textContent = fmt(1204 * Math.min(1, p * 1.05)); b.textContent = fmt(38 * p); c.textContent = fmt(8911 * p);
          await wait(260);
        }
        a.textContent = '1,204'; b.textContent = '38'; c.textContent = '8,911';
        await wait(500);
        add.classList.add('show'); await wait(700); add.classList.add('hit');
        await wait(2400);
      }
    };
  };

  /* Apple Photos, kept in step by Cull Sync on the Mac. */
  scenes.applephotos = function (root, wait) {
    root.innerHTML = '<div class="menubar"><span></span><img src="images/mark.svg" alt=""><span class="mb-t">Cull Sync · connected</span></div>' +
      '<div class="lanes"><div class="lane"><b>Daddy Cull</b><div class="lane-items" data-from></div></div><div class="arrow">' + icon('sync') + '</div><div class="lane"><b>Photos</b><div class="lane-items" data-to></div></div></div>' +
      '<p class="lane-note" data-note>0 removals and 0 favourites carried across</p>';
    var from = $(root, '[data-from]'), to = $(root, '[data-to]'), note = $(root, '[data-note]');
    var kinds = ['delete', 'favorite', 'delete', 'delete'];
    return {
      still: function () { note.textContent = '3 removals and 1 favourite carried across'; },
      loop: async function () {
        from.innerHTML = ''; to.innerHTML = ''; note.textContent = 'Checking Photos…';
        kinds.forEach(function (k, i) { from.appendChild(tile(40 + i, 'lane-ph', '<span class="lk ' + k + '">' + icon(k === 'favorite' ? 'favorite-fill' : 'delete') + '</span>')); });
        await wait(1100);
        var items = $$(from, '.ph'), removed = 0, favs = 0;
        for (var i = 0; i < items.length; i++) {
          var a = relRect(items[i], root), b = relRect(to, root);
          var copy = items[i].cloneNode(true); copy.classList.add('moving'); root.appendChild(copy);
          copy.style.left = a.x + 'px'; copy.style.top = a.y + 'px'; copy.style.width = a.w + 'px'; copy.style.height = a.h + 'px';
          items[i].classList.add('sent');
          await animate(copy, [{transform: 'translate(0,0)'}, {transform: 'translate(' + (b.x - a.x + (to.children.length % 2) * (a.w + 6)) + 'px,' + (b.y - a.y + Math.floor(to.children.length / 2) * (a.h + 6)) + 'px)'}], {duration: 520, easing: 'ease-in-out'});
          copy.remove();
          to.appendChild(tile(40 + i, 'lane-ph done', '<span class="lk ' + kinds[i] + '">' + icon(kinds[i] === 'favorite' ? 'favorite-fill' : 'check') + '</span>'));
          if (kinds[i] === 'favorite') favs++; else removed++;
          note.textContent = removed + ' removal' + (removed === 1 ? '' : 's') + ' and ' + favs + ' favourite' + (favs === 1 ? '' : 's') + ' carried across';
          await wait(200);
        }
        await wait(2600);
      }
    };
  };

  /* A page's guide, hidden with Got it and brought back with the question mark. */
  scenes.guide = function (root, wait) {
    root.innerHTML = '<div class="mini-top"><span>Today</span><span class="q" data-q>?</span></div>' +
      '<div class="guide" data-guide><div class="guide-h">' + icon('info') + '<b>How a day works</b><span class="pill-btn small ghost" data-got>Got it</span></div>' +
      '<ul><li>In a photo, <kbd>K</kbd> keeps, <kbd>X</kbd> removes and <kbd>F</kbd> favourites.</li><li><kbd>←</kbd> and <kbd>→</kbd> step through.</li><li>When the day is done, mark it reviewed with <kbd>⇧</kbd><kbd>R</kbd>.</li></ul></div>' +
      '<div class="guide-grid">' + [8, 9, 10, 11].map(function (s) { return '<span class="ph" style="background-image:' + photo(s).replace(/"/g, "'") + '"></span>'; }).join('') + '</div>';
    var guide = $(root, '[data-guide]'), got = $(root, '[data-got]'), q = $(root, '[data-q]');
    return {
      still: function () {},
      loop: async function () {
        guide.classList.remove('hide'); got.classList.remove('hit'); q.classList.remove('hit');
        await wait(2600);
        got.classList.add('hit'); await wait(250);
        guide.classList.add('hide'); await wait(1800);
        q.classList.add('hit'); await wait(260); q.classList.remove('hit');
        guide.classList.remove('hide'); got.classList.remove('hit');
        await wait(1800);
      }
    };
  };

  /* The sidebar's library totals. */
  scenes.totals = function (root, wait) {
    root.innerHTML = '<div class="mini-side"><div class="lib-h">' + icon('perm_media') + '<b>Library</b></div><table><tr><th>Photos</th><td data-pf>0</td><td data-pb>0 GB</td></tr><tr><th>Videos</th><td data-vf>0</td><td data-vb>0 TB</td></tr><tfoot><tr><th>Total</th><td data-tf>0</td><td data-tb>0 TB</td></tr></tfoot></table></div>';
    var pf = $(root, '[data-pf]'), pb = $(root, '[data-pb]'), vf = $(root, '[data-vf]'), vb = $(root, '[data-vb]'), tf = $(root, '[data-tf]'), tb = $(root, '[data-tb]');
    function set(p, extra) {
      var photos = 38412 * p + extra, videos = 19807 * p;
      pf.textContent = fmt(photos); vf.textContent = fmt(videos); tf.textContent = fmt(photos + videos);
      pb.textContent = Math.round(581 * p + extra * 0.004) + ' GB'; vb.textContent = (2.8 * p).toFixed(1) + ' TB'; tb.textContent = (3.4 * p).toFixed(1) + ' TB';
    }
    return {
      still: function () { set(1, 0); },
      loop: async function () {
        for (var i = 0; i <= 24; i++) { set(1 - Math.pow(1 - i / 24, 3), 0); await wait(45); }
        await wait(1200);
        for (var j = 1; j <= 12; j++) { set(1, j); await wait(160); }
        await wait(2600);
      }
    };
  };

  /* Day and night by the reader's clock. */
  scenes.daynight = function (root, wait) {
    root.innerHTML = '<div class="dn night"><div class="dn-top"><img src="images/mark.svg" alt=""><span class="dn-search"></span><span class="dn-clock" data-clock>' + icon('dark_mode') + '<b>21:00</b></span></div><div class="dn-grid">' +
      [1, 2, 3, 4, 5, 6].map(function (s) { return '<span class="ph" style="background-image:' + photo(s).replace(/"/g, "'") + '"></span>'; }).join('') + '</div></div>';
    var dn = $(root, '.dn'), clock = $(root, '[data-clock]');
    function set(day, time) {
      dn.classList.toggle('night', !day);
      clock.innerHTML = icon(day ? 'light_mode' : 'dark_mode') + '<b>' + time + '</b>';
    }
    return {
      still: function () { set(false, '21:00'); },
      loop: async function () {
        set(false, '21:00'); await wait(1600);
        set(false, '06:59'); await wait(700);
        set(true, '07:00'); await wait(2200);
        set(true, '18:59'); await wait(700);
        set(false, '19:00'); await wait(1600);
      }
    };
  };

  /* On a server: a web container that only reads, a writer that files. */
  scenes.server = function (root, wait) {
    root.innerHTML = '<div class="srv"><div class="box imp">' + icon('folder') + '<b>Import</b></div>' +
      '<div class="box wr">' + icon('dns') + '<b>writer</b><span>files and restores</span></div>' +
      '<div class="box lib">' + icon('photo_library') + '<b>Library</b></div>' +
      '<div class="box web">' + icon('dns') + '<b>web</b><span>' + icon('lock') + 'reads only</span></div>' +
      '<svg class="wires" viewBox="0 0 300 150" preserveAspectRatio="none"><path d="M60 40 H120"/><path d="M180 40 H240"/><path class="ro" d="M270 66 V92 H180"/></svg></div>';
    var srv = $(root, '.srv');
    return {
      still: function () {},
      loop: async function () {
        var imp = $(srv, '.imp'), wr = $(srv, '.wr'), lib = $(srv, '.lib');
        for (var i = 0; i < 3; i++) {
          var dot = tile(50 + i, 'tdot'); srv.appendChild(dot);
          var a = relRect(imp, srv), b = relRect(wr, srv), c = relRect(lib, srv);
          dot.style.left = (a.x + a.w / 2 - 10) + 'px'; dot.style.top = (a.y + a.h / 2 - 10) + 'px';
          await animate(dot, [
            {transform: 'translate(0,0)'},
            {transform: 'translate(' + (b.x + b.w / 2 - a.x - a.w / 2) + 'px,' + (b.y + b.h / 2 - a.y - a.h / 2) + 'px)', offset: 0.45},
            {transform: 'translate(' + (c.x + c.w / 2 - a.x - a.w / 2) + 'px,' + (c.y + c.h / 2 - a.y - a.h / 2) + 'px) scale(.6)'}
          ], {duration: 1400, easing: 'ease-in-out'});
          dot.remove();
          animate(lib, [{transform: 'scale(1)'}, {transform: 'scale(1.05)'}, {transform: 'scale(1)'}], {duration: 260});
          await wait(300);
        }
        await wait(1500);
      }
    };
  };

  /* The API: counts, then the event stream. */
  scenes.terminal = function (root, wait) {
    root.innerHTML = '<div class="term"><div class="term-bar"><i></i><i></i><i></i><span>Terminal</span></div><pre class="term-body" data-body></pre></div>';
    var body = $(root, '[data-body]');
    var stats = [
      '<span class="d">HTTP/1.1 200 OK</span>',
      '<span class="d">X-Cull-Api-Version: 1</span>',
      '',
      '{',
      '  <span class="k">"total"</span>: <span class="n">58219</span>,',
      '  <span class="k">"calendarDates"</span>: <span class="n">366</span>,',
      '  <span class="k">"reviewedDates"</span>: <span class="n">41</span>,',
      '  <span class="k">"streak"</span>: <span class="n">7</span>,',
      '  <span class="k">"favourites"</span>: <span class="n">1308</span>,',
      '  <span class="k">"library"</span>: {',
      '    <span class="k">"photos"</span>: { <span class="k">"files"</span>: <span class="n">38412</span>, <span class="k">"bytes"</span>: <span class="n">581034118212</span> },',
      '    <span class="k">"videos"</span>: { <span class="k">"files"</span>: <span class="n">19807</span>, <span class="k">"bytes"</span>: <span class="n">2804519736044</span> }',
      '  }, <span class="d">…</span>',
      '}'
    ];
    var events = [
      ['catalogue', null, '{"generation": 412}'],
      ['decision', 1043, '{"assetId": 88121, "status": "keep", "favourite": false, "previousStatus": "unreviewed", …}'],
      ['decision', 1044, '{"assetId": 88122, "status": "cull", "favourite": false, "previousStatus": "unreviewed", …}'],
      ['decision', 1045, '{"assetId": 88127, "status": "keep", "favourite": true, "previousStatus": "keep", …}']
    ];
    async function type(text) {
      var line = el('span', 'cmdline', '<span class="pr">$</span> ');
      var typed = el('span', '');
      line.appendChild(typed); line.appendChild(el('span', 'caret'));
      body.appendChild(line);
      for (var i = 0; i < text.length; i++) { typed.textContent += text[i]; await wait(22); }
      await wait(250);
      line.lastChild.remove();
      body.appendChild(document.createTextNode('\n'));
    }
    function out(html) { var s = el('span', 'outl', html + '\n'); body.appendChild(s); body.scrollTop = body.scrollHeight; }
    return {
      still: function () {
        body.innerHTML = '<span class="cmdline"><span class="pr">$</span> curl -si http://127.0.0.1:8830/api/stats</span>\n' + stats.join('\n') + '\n';
      },
      loop: async function () {
        body.innerHTML = '';
        await wait(500);
        await type('curl -si http://127.0.0.1:8830/api/stats');
        for (var i = 0; i < stats.length; i++) { out(stats[i]); await wait(70); }
        await wait(1500);
        await type('curl -sN http://127.0.0.1:8830/api/events');
        for (var j = 0; j < events.length; j++) {
          out('<span class="k">event:</span> ' + events[j][0] + (events[j][1] ? '\n<span class="k">id:</span> ' + events[j][1] : '') + '\n<span class="k">data:</span> <span class="s">' + events[j][2].replace(/</g, '&lt;') + '</span>');
          await wait(j === 0 ? 900 : 1300);
        }
        await wait(2600);
      }
    };
  };

  /* Addons: one dropped in, asked about, turned on, its page in the sidebar. */
  scenes.addons = function (root, wait) {
    var frame = appFrame({page: 'addons', placeholder: 'Go to a date, like ' + shortDate(sameDay(year - 7))});
    root.appendChild(frame);
    var main = $(frame, '.app-main');
    var rows = [
      ['screenshot_region', 'Screenshots', 'Review screenshots and screen recordings apart from the photos.', false],
      ['photo_library', 'Google Photos', 'Add what a Google Takeout export holds and the library lacks.', true],
      ['favorite', 'Immich', 'Set the favourites you choose in Immich too.', true],
      ['movie', 'Jellyfin', 'Have Jellyfin scan again when files leave the library or come back.', true],
      ['perm_media', 'Library totals', 'Show how many photos and videos the library holds.', true]
    ];
    main.innerHTML = '<div class="ad-h"><h4>Addons</h4><p>Everything beyond reviewing dates, finding duplicates and the Bin.</p></div>' +
      '<h5 class="ad-sec">Your own</h5><div class="ad-list" data-own><p class="ad-empty" data-empty>Drop a folder with an addon.json into the addons folder.</p></div>' +
      '<h5 class="ad-sec">Cull’s own</h5><div class="ad-list">' + rows.map(row).join('') + '</div>' +
      '<div class="modal" data-modal><div class="modal-in"><b>Turn on Hello, Cull?</b><p>It will be allowed to:</p><ul><li>' + icon('check') + 'Read your library, its dates, choices and settings</li></ul><div class="modal-b"><span class="pill-btn small ghost">Cancel</span><span class="pill-btn small" data-yes>Turn on</span></div></div></div>';
    function row(r) {
      return '<div class="ad"><span class="ad-i">' + icon(r[0]) + '</span><div><b>' + r[1] + '</b><span>' + r[2] + '</span></div><span class="sw' + (r[3] ? ' on' : '') + '"></span></div>';
    }
    var own = $(main, '[data-own]'), empty = $(main, '[data-empty]'), modal = $(main, '[data-modal]'), yes = $(main, '[data-yes]');
    var tools = $(frame, '[data-tools]'), toolItems = $(frame, '[data-tools-items]');
    var mine = el('div', 'ad mine', '<span class="ad-i">' + icon('extension') + '</span><div><b>Hello, Cull <em>0.1.0</em></b><span>Shows what the library holds.</span></div><span class="sw" data-sw></span>');
    var sw = $(mine, '[data-sw]');
    var item = el('span', 'side-item new', icon('extension') + '<span class="side-l">Hello</span>');
    return {
      still: function () { empty.remove(); own.appendChild(mine); sw.classList.add('on'); tools.hidden = false; toolItems.appendChild(item); },
      loop: async function () {
        if (mine.parentNode) mine.remove();
        if (!empty.parentNode) own.appendChild(empty);
        sw.classList.remove('on', 'hit'); modal.classList.remove('show'); yes.classList.remove('hit');
        tools.hidden = true; if (item.parentNode) item.remove();
        await wait(1200);
        empty.remove(); own.appendChild(mine);
        animate(mine, [{opacity: 0, transform: 'translateY(-8px)'}, {opacity: 1, transform: 'none'}], {duration: 360});
        mine.classList.add('fresh');
        await wait(1300);
        sw.classList.add('hit'); await wait(250); sw.classList.remove('hit');
        modal.classList.add('show'); await wait(1700);
        yes.classList.add('hit'); await wait(260);
        modal.classList.remove('show'); sw.classList.add('on'); mine.classList.remove('fresh');
        await wait(350);
        tools.hidden = false; toolItems.appendChild(item);
        animate(item, [{opacity: 0, transform: 'translateX(-10px)'}, {opacity: 1, transform: 'none'}], {duration: 360});
        await wait(3000);
      }
    };
  };

  /* Plays well with the rest. */
  scenes.friends = function (root, wait) {
    root.innerHTML = '<div class="hub"><svg class="spokes" viewBox="0 0 400 260" preserveAspectRatio="none"><path d="M200 130 L70 50"/><path d="M200 130 L330 50"/><path class="quiet" d="M200 130 L70 210"/><path class="quiet" d="M200 130 L330 210"/></svg>' +
      '<div class="node core">' + icon('photo_library') + '<b>Library</b><span>plain folders</span></div>' +
      '<div class="node n1" data-immich><b>Immich</b><span data-is>favourites</span></div>' +
      '<div class="node n2" data-jelly><b>Jellyfin</b><span data-js>rescans</span></div>' +
      '<div class="node n3"><b>Plex</b><span>reads the folders</span></div>' +
      '<div class="node n4"><b>Finder</b><span>reads the folders</span></div></div>';
    var hub = $(root, '.hub'), core = $(root, '.core'), immich = $(root, '[data-immich]'), jelly = $(root, '[data-jelly]');
    var is = $(root, '[data-is]'), js = $(root, '[data-js]');
    async function send(target, iconName, cls) {
      var a = relRect(core, hub), b = relRect(target, hub);
      var dot = el('span', 'hubdot ' + cls, icon(iconName)); hub.appendChild(dot);
      dot.style.left = (a.x + a.w / 2 - 13) + 'px'; dot.style.top = (a.y + a.h / 2 - 13) + 'px';
      await animate(dot, [{transform: 'translate(0,0) scale(.6)', opacity: 0}, {transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0.15}, {transform: 'translate(' + (b.x + b.w / 2 - a.x - a.w / 2) + 'px,' + (b.y + b.h / 2 - a.y - a.h / 2) + 'px) scale(.8)', opacity: 1}], {duration: 1000, easing: 'ease-in-out'});
      dot.remove();
      target.classList.add('ping'); setTimeout(function () { target.classList.remove('ping'); }, 600);
    }
    return {
      still: function () { is.textContent = 'favourite set'; js.textContent = 'scan requested'; },
      loop: async function () {
        is.textContent = 'favourites'; js.textContent = 'rescans';
        await wait(800);
        await send(immich, 'favorite-fill', 'heart'); is.textContent = 'favourite set';
        await wait(900);
        await send(jelly, 'sync', 'scan'); js.textContent = 'scan requested';
        await wait(2400);
      }
    };
  };

  /* The installer's steps. */
  scenes.install = function (root, wait) {
    var steps = [
      'Checking this Mac against the requirements',
      'Installing exiftool, ffmpeg and uv',
      'Downloading the latest release and checking its checksum',
      'Asking about icloudpd and osxphotos',
      'Starting Daddy Cull in the background',
      'Opening the setup wizard'
    ];
    root.innerHTML = '<ol class="inst">' + steps.map(function (s) { return '<li><span class="st"></span>' + s + '</li>'; }).join('') + '</ol>';
    var items = $$(root, 'li');
    return {
      still: function () { items.forEach(function (i) { i.className = 'ok'; }); },
      loop: async function () {
        items.forEach(function (i) { i.className = ''; });
        await wait(600);
        for (var i = 0; i < items.length; i++) { items[i].className = 'run'; await wait(750); items[i].className = 'ok'; }
        await wait(2600);
      }
    };
  };

  start();

  /* ---------- The Features stage ---------- */
  // The beats scroll past a pinned stage; whichever is nearest the reading
  // line brings its scene forward and starts it from the top.
  var showcase = $(document, '[data-showcase]');
  var beats = showcase ? $$(showcase, '.beat') : [];
  var stageScenes = showcase ? $$(showcase, '.stage .scene') : [];
  var dots = showcase ? $(showcase, '[data-dots]') : null;
  var narrow = window.matchMedia('(max-width: 980px)');
  var current = null;
  function readingLine() { return window.innerHeight * (narrow.matches ? 0.72 : 0.5); }
  beats.forEach(function (beat) {
    var button = el('button', '');
    button.type = 'button';
    button.setAttribute('aria-label', $(beat, 'h3').textContent);
    button.addEventListener('click', function () {
      var r = beat.getBoundingClientRect();
      window.scrollTo({top: window.scrollY + r.top + r.height / 2 - readingLine(), behavior: reduce ? 'auto' : 'smooth'});
    });
    dots.appendChild(button);
  });
  function stage() {
    if (!showcase) return;
    var vh = window.innerHeight, box = showcase.getBoundingClientRect();
    var inView = box.bottom > 0 && box.top < vh;
    var line = readingLine(), best = beats[0], distance = Infinity;
    beats.forEach(function (beat) {
      var r = beat.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - line);
      if (d < distance) { distance = d; best = beat; }
    });
    if (best !== current) {
      current = best;
      beats.forEach(function (beat, i) {
        var on = beat === best;
        beat.classList.toggle('on', on);
        dots.children[i].classList.toggle('on', on);
        if (on) dots.children[i].setAttribute('aria-current', 'true'); else dots.children[i].removeAttribute('aria-current');
      });
      stageScenes.forEach(function (node) { node.classList.toggle('on', node.dataset.scene === best.dataset.beat); });
    }
    if (reduce) return;
    stageScenes.forEach(function (node) {
      if (node.__scene) show(node.__scene, inView && node.dataset.scene === current.dataset.beat, true);
    });
  }

  /* ---------- Sections arriving ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        reveal.unobserve(entry.target);
      });
    }, {threshold: 0.15, rootMargin: '0px 0px -8% 0px'});
    // Siblings in a row arrive one after another.
    var groups = {'.head': false, '.why-grid > div': true, '.steps > li': true, '.api-copy': false, '.scene-term': false,
      '.addons-copy': false, '.friends-in > *': true, '.facts > div': true, '.timeline > li': false,
      '.install-in > *': true, '.scene-note': false, '.center': false};
    Object.keys(groups).forEach(function (selector) {
      $$(document, selector).forEach(function (node) {
        node.classList.add('rv');
        if (groups[selector]) node.style.transitionDelay = Math.min(Array.prototype.indexOf.call(node.parentNode.children, node), 4) * 90 + 'ms';
        reveal.observe(node);
      });
    });
  }

  // The two big app views tilt up into place as they come in, as a product
  // shot would.
  var rises = reduce ? [] : $$(document, '[data-rise]');
  function rise() {
    var vh = window.innerHeight;
    rises.forEach(function (node) {
      var r = node.getBoundingClientRect();
      if (r.top > vh || r.bottom < 0) return;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
      var eased = 1 - Math.pow(1 - p, 3);
      node.style.transform = 'perspective(1600px) rotateX(' + ((1 - eased) * 16).toFixed(2) + 'deg) scale(' + (0.9 + 0.1 * eased).toFixed(4) + ')';
      node.style.opacity = (0.4 + 0.6 * eased).toFixed(3);
    });
  }

  // The header's pill slides to the section being read.
  var nav = $(document, 'nav'), pill = $(document, '.nav-pill');
  var links = $$(document, 'nav a[href^="#"]');
  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var here, placedAt;
  function place() {
    var line = window.innerHeight * 0.35, found = null;
    sections.forEach(function (section, i) { if (section.getBoundingClientRect().top < line) found = links[i]; });
    if (found && sections[links.indexOf(found)].getBoundingClientRect().bottom < line) found = null;
    if (found === here && placedAt === nav.offsetWidth) return;
    here = found;
    placedAt = nav.offsetWidth;
    links.forEach(function (a) { if (a === found) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    if (!found || !found.offsetParent) { pill.classList.remove('show'); return; }
    pill.style.width = found.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + found.offsetLeft + 'px)';
    pill.classList.add('show');
  }

  var ticking = false;
  function frame() {
    ticking = false;
    stage(); rise(); place();
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  frame();

  /* ---------- Install tabs ---------- */
  var tabs = $$(document, '[role="tab"]');
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { select(index); });
    tab.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      var next = (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      select(next); tabs[next].focus();
    });
  });
  function select(index) {
    if (tabs[index].getAttribute('aria-selected') === 'true') return;
    if (document.startViewTransition && !reduce) document.startViewTransition(function () { choose(index); });
    else choose(index);
  }
  function choose(index) {
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute('aria-selected', on);
      tab.tabIndex = on ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
    });
  }

  /* ---------- Copy buttons ---------- */
  $$(document, '[data-copy]').forEach(function (box) {
    var button = $(box, '.copy'), code = $(box, 'code');
    button.addEventListener('click', function () {
      var done = function () {
        button.textContent = 'Copied';
        setTimeout(function () { button.textContent = 'Copy'; }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(code.textContent).then(done, function () { selectText(code); });
      else selectText(code);
    });
  });
  function selectText(node) {
    var range = document.createRange();
    range.selectNodeContents(node);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
})();
