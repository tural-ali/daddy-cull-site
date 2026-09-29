// The hero's Year calendar: every date of the year, coloured by how many
// photos still wait on it, as the app's Year page draws it. The dates before
// today are then marked reviewed one after another, to show what one date a
// day adds up to. The colours are made up, the same on every visit.
(function () {
  var grid = document.querySelector('[data-grid]');
  if (!grid) return;
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var lengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var now = new Date();
  var todayMonth = now.getMonth(), todayDay = now.getDate();

  // A small seeded generator, so the calendar looks the same each time.
  var seed = 20130929;
  function random() {
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  var before = [], filed = 0, today = null;
  var fragment = document.createDocumentFragment();
  months.forEach(function (name, month) {
    var label = document.createElement('span');
    label.className = 'm';
    label.textContent = name.toUpperCase();
    fragment.appendChild(label);
    for (var day = 1; day <= 31; day++) {
      var cell = document.createElement('span');
      if (day > lengths[month]) {
        cell.className = 'gap';
        fragment.appendChild(cell);
        continue;
      }
      var r = random();
      var kind = r < 0.07 ? '' : r < 0.6 ? 'few' : r < 0.86 ? 'some' : 'many';
      cell.className = 'c' + (kind ? ' ' + kind : '');
      cell.title = day + ' ' + name;
      if (kind) filed++;
      if (month === todayMonth && day === todayDay) {
        today = cell;
        cell.className = 'c now';
        if (!kind) filed++;
      } else if (kind && (month < todayMonth || (month === todayMonth && day < todayDay))) {
        before.push(cell);
      }
      fragment.appendChild(cell);
    }
  });
  grid.appendChild(fragment);

  var count = document.querySelector('[data-reviewed]');
  var total = document.querySelector('[data-dates]');
  var bar = document.querySelector('[data-bar]');
  var label = document.querySelector('[data-today-label]');
  total.textContent = filed;
  if (label) label.textContent = 'Today, ' + todayDay + ' ' + now.toLocaleString('en-GB', {month: 'long'});

  function show(done) {
    for (var i = 0; i < done; i++) before[i].classList.add('done');
    count.textContent = done;
    bar.style.width = (done / filed * 100).toFixed(2) + '%';
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !before.length) {
    show(before.length);
    return;
  }
  // About three seconds whatever the date, starting once the page has settled.
  var duration = 3000, start = null, shown = 0;
  function frame(time) {
    if (start === null) start = time;
    var progress = Math.min(1, (time - start) / duration);
    var eased = 1 - Math.pow(1 - progress, 2);
    var target = Math.round(eased * before.length);
    for (; shown < target; shown++) before[shown].classList.add('done');
    count.textContent = shown;
    bar.style.width = (shown / filed * 100).toFixed(2) + '%';
    if (progress < 1) requestAnimationFrame(frame);
  }
  setTimeout(function () { requestAnimationFrame(frame); }, 500);
})();

// Copy buttons for the install command.
document.querySelectorAll('[data-copy]').forEach(function (box) {
  var button = box.querySelector('.copy');
  var code = box.querySelector('code');
  button.addEventListener('click', function () {
    var done = function () {
      button.textContent = 'Copied';
      setTimeout(function () { button.textContent = 'Copy'; }, 1800);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code.textContent).then(done, function () { select(code); });
    } else {
      select(code);
    }
  });
});

function select(node) {
  var range = document.createRange();
  range.selectNodeContents(node);
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}
