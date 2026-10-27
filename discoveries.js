/* No Man's Sky Hub — Traveller Discoveries (2026-10-17, Tony).
   A section right under Galactic Alliances: what other players charted on the Galactic
   Map this week — totals, top surveyors (same card style as the alliance top 5), the six
   latest systems with their screenshots and portal glyphs, and links to the full public
   page (map.nomansskyhub.app/community). Reads the map's small ?discoveries=1 feed, which
   already leaves out bulk imports and anything private. Stays hidden if the feed fails
   or nothing was charted, so the Hub never shows an empty box. */
(function () {
  var MAP = 'https://map.nomansskyhub.app';
  var FEED = MAP + '/.netlify/functions/system-edit?discoveries=1';
  var IMG = 'https://raw.githubusercontent.com/elegra1965-source/nms-galactic-map/';
  var GAL = ['Euclid','Hilbert Dimension','Calypso','Hesperius Dimension','Hyades','Ickjamatew','Budullangr','Kikolgallr','Eltiensleen','Eissentam','Elkupalos','Aptarkaba','Ontiniangp','Odiwagiri','Ogtialabi','Muhacksonto','Hitonskyer','Rerasmutul','Isdoraijung','Doctinawyra','Loychazinq','Zukasizawa','Ekwathore','Yeberhahne','Twerbetek','Sivarates','Eajerandal','Aldukesci','Wotyarogii','Sudzerbal','Maupenzhay','Sugueziume','Brogoweldian','Ehbogdenbu','Ijsenufryos','Nipikulha','Autsurabin','Lusontrygiamh','Rewmanawa','Ethiophodhe','Urastrykle','Xobeurindj','Oniijialdu','Wucetosucc','Ebyeloof','Odyavanta','Milekistri','Waferganh','Agnusopwit','Teyaypilny','Zalienkosm','Ladgudiraf','Mushonponte','Amsentisz','Fladiselm','Laanawemb','Ilkerloor','Davanossi','Ploehrliou','Corpinyaya','Leckandmeram','Quulngais','Nokokipsechl','Rinblodesa','Loydporpen','Ibtrevskip','Elkowaldb','Heholhofsko','Yebrilowisod','Husalvangewi',"Ovna'uesed",'Bahibusey','Nuybeliaure','Doshawchuc','Ruckinarkh','Thorettac','Nuponoparau','Moglaschil','Uiweupose','Nasmilete','Ekdaluskin','Hakapanasy','Dimonimba','Cajaccari','Olonerovo','Umlanswick','Henayliszm','Utzenmate','Umirpaiya','Paholiang','Iaereznika','Yudukagath','Boealalosnj','Yaevarcko','Coellosipp','Wayndohalou','Smoduraykl','Apmaneessu','Hicanpaav','Akvasanta','Tuychelisaor','Rivskimbe','Daksanquix','Kissonlin','Aediabiel','Ulosaginyik','Roclaytonycar','Kichiaroa','Irceauffey','Nudquathsenfe','Getaizakaal','Hansolmien','Bloytisagra','Ladsenlay','Luyugoslasr','Ubredhatk','Cidoniana','Jasinessa','Torweierf','Saffneckm','Thnistner','Dotusingg','Luleukous','Jelmandan','Otimanaso','Enjaxusanto','Sezviktorew','Zikehpm','Bephembah','Broomerrai','Meximicka','Venessika','Gaiteseling','Zosakasiro','Drajayanes','Ooibekuar','Urckiansi','Dozivadido','Emiekereks','Meykinunukur','Kimycuristh','Roansfien','Isgarmeso','Daitibeli','Gucuttarik','Enlaythie','Drewweste','Akbulkabi','Homskiw','Zavainlani','Jewijkmas','Itlhotagra','Podalicess','Hiviusauer','Halsebenk','Puikitoac','Gaybakuaria','Grbodubhe','Rycempler','Indjalala','Fontenikk','Pasycihelwhee','Ikbaksmit','Telicianses','Oyleyzhan','Uagerosat','Impoxectin','Twoodmand','Hilfsesorbs','Ezdaranit','Wiensanshe','Ewheelonc','Litzmantufa','Emarmatosi','Mufimbomacvi','Wongquarum','Hapirajua','Igbinduina','Wepaitvas','Sthatigudi','Yekathsebehn','Ebedeagurst','Nolisonia','Ulexovitab','Iodhinxois','Irroswitzs','Bifredait','Beiraghedwe','Yeonatlak','Cugnatachh','Nozoryenki','Ebralduri','Evcickcandj','Ziybosswin','Heperclait','Sugiuniam','Aaseertush','Uglyestemaa','Horeroedsh','Drundemiso','Ityanianat','Purneyrine','Dokiessmat','Nupiacheh','Dihewsonj','Rudrailhik','Tweretnort','Snatreetze','Iwundaracos','Digarlewena','Erquagsta','Logovoloin','Boyaghosganh','Kuolungau','Pehneldept','Yevettiiqidcon','Sahliacabru','Noggalterpor','Chmageaki','Veticueca','Vittesbursul','Nootanore','Innebdjerah','Kisvarcini','Cuzcogipper','Pamanhermonsu','Brotoghek','Mibittara','Huruahili','Raldwicarn','Ezdartlic','Badesclema','Isenkeyan','Iadoitesu','Yagrovoisi','Ewcomechio','Inunnunnoda','Dischiutun','Yuwarugha','Ialmendra','Reponudrle','Rinjanagrbo','Zeziceloh','Oeileutasc','Zicniijinis','Dugnowarilda','Neuxoisan','Ilmenhorn','Rukwatsuku','Nepitzaspru','Chcehoemig','Haffneyrin','Uliciawai','Tuhgrespod','Iousongola','Odyalutai'];
  var WEEK = 7 * 864e5;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function plain(s) { var t = document.createElement('textarea'); t.innerHTML = String(s || ''); return t.value; }
  function img(u) { return typeof u === 'string' && u.indexOf(IMG) === 0 ? u : ''; }
  function ago(t) {
    var s = Math.max(0, (Date.now() - t) / 1000);
    if (s < 90) return 'just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    var d = Math.round(s / 86400); return d + (d === 1 ? ' day ago' : ' days ago');
  }
  function mapLink(x) { return MAP + '/?arrival=1&addr=' + x.address + '&galaxy=' + x.galaxy; }

  function build(j) {
    var sys = j.systems || {}, cutoff = Date.now() - WEEK;
    var week = (j.events || []).map(function (e) { return { t: Date.parse(e.t), k: e.k, key: e.key, who: e.who, n: e.n || 1 }; })
      .filter(function (e) { return e.t > cutoff; });
    var people = {}, systems = {}, photos = 0, last = {};
    week.forEach(function (e) {
      if (e.k === 'p') { photos++; return; }
      var who = e.k === 'b' ? plain(e.who) : (sys[e.key] && plain(sys[e.key].editor)) || 'Unnamed traveller';
      var p = people[who] || (people[who] = { saves: 0, sys: {} });
      p.saves += e.n;
      if (e.key) { p.sys[e.key] = 1; systems[e.key] = 1; last[e.key] = Math.max(last[e.key] || 0, e.t); }
    });
    var nSys = Object.keys(systems).length;
    if (!nSys) return null;
    var top = Object.keys(people).map(function (n) { return { name: n, saves: people[n].saves, sys: Object.keys(people[n].sys).length }; })
      .sort(function (a, b) { return b.saves - a.saves; }).slice(0, 5);
    var latest = Object.keys(last).sort(function (a, b) { return last[b] - last[a]; }).slice(0, 6)
      .map(function (k) { var x = sys[k]; return x && { t: last[k], galaxy: x.galaxy, address: x.address, name: plain(x.name) || 'Unnamed system', who: plain(x.editor) || 'Unnamed traveller', shots: [img(x.screenshot), img(x.stationPhoto)].filter(Boolean) }; })
      .filter(Boolean);

    var s = el('section', 'al-sec'); s.id = 'discoveries';
    var head = el('div', 'al-head');
    head.appendChild(el('div', 'al-kicker', '◆ Galactic Map · Traveller Discoveries'));
    head.appendChild(el('h2', 'al-title', 'Charted by travellers'));
    head.appendChild(el('p', 'al-sub', 'Real systems other players have documented on the Galactic Map this week, with their screenshots and portal glyphs. Tap one to fly there.'));
    s.appendChild(head);

    var stats = el('div', 'dc-stats');
    [[nSys, nSys === 1 ? 'system charted' : 'systems charted'], [Object.keys(people).length, Object.keys(people).length === 1 ? 'traveller' : 'travellers'], [photos, photos === 1 ? 'photo' : 'photos']].forEach(function (x) {
      var d = el('div', 'dc-stat'); d.appendChild(el('b', null, String(x[0]))); var l = el('span', null, x[1]); l.appendChild(el('span', 'dc-per', '7 days')); d.appendChild(l); stats.appendChild(d);
    });
    s.appendChild(stats);

    var live = el('div', 'al-live dc-live');
    var lh = el('div', 'al-live-h'); lh.appendChild(el('span', 'al-dot')); var lt = el('span', 'dc-htxt', 'TOP SURVEYORS'); lt.appendChild(el('small', 'dc-hsub', 'Most saves this week')); lh.appendChild(lt); live.appendChild(lh);
    top.forEach(function (p, i) {
      var r = el('div', 'al-row al-lrow');
      r.appendChild(el('span', 'pos', String(i + 1)));
      r.appendChild(el('span', 'al-lname', p.name));
      r.appendChild(el('span', 'al-lstat', p.saves + (p.saves === 1 ? ' save' : ' saves') + ' · ' + p.sys + (p.sys === 1 ? ' system' : ' systems')));
      live.appendChild(r);
    });
    // 2026-10-27 (Tony): fill the space under Top surveyors with a 3-step "get on the board" box;
    // the two buttons and the note that sat at the bottom of the section now live in it.
    var col = el('div', 'dc-col'); col.appendChild(live);
    var join = el('div', 'al-live dc-join');
    var jh = el('div', 'al-live-h'); jh.appendChild(el('span', 'al-dot')); var jt = el('span', 'dc-htxt', 'GET ON THE BOARD'); jt.appendChild(el('small', 'dc-hsub', 'Your name here in 3 steps')); jh.appendChild(jt); join.appendChild(jh);
    var ol = el('ol', 'dc-steps');
    ['Open any system on the Galactic Map', 'Tap Edit system, add your name', '📷 Add a station photo — it shows here'].forEach(function (t) { ol.appendChild(el('li', null, t)); });
    join.appendChild(ol);
    col.appendChild(join);
    s.appendChild(col);

    var grid = el('div', 'dc-grid');
    latest.forEach(function (x) {
      var a = el('a', 'dc-card'); a.href = mapLink(x); a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('aria-label', x.name + ', charted by ' + x.who + ', open on the Galactic Map');
      if (x.shots.length) {
        var sh = el('div', 'dc-shots');
        x.shots.forEach(function (u, i) { var im = el('img'); im.src = u; im.loading = 'lazy'; im.alt = i ? 'Space station photo' : 'System screenshot'; sh.appendChild(im); });
        a.appendChild(sh);
      } else a.appendChild(el('div', 'dc-noshot', 'NO PHOTO YET'));
      var b = el('div', 'dc-body');
      b.appendChild(el('div', 'dc-name', x.name));
      var m = el('div', 'dc-meta'); m.appendChild(document.createTextNode('by ')); m.appendChild(el('b', null, x.who));
      m.appendChild(document.createTextNode(' · ' + (GAL[x.galaxy] || ('Galaxy ' + (x.galaxy + 1))) + ' · ' + ago(x.t)));
      b.appendChild(m);
      var g = el('div', 'dc-glyphs'); g.setAttribute('aria-label', 'Portal address ' + x.address);
      x.address.split('').forEach(function (ch) { var im = el('img'); im.src = MAP + '/glyphs/glyph-mask-' + ch + '.png'; im.alt = ch; g.appendChild(im); });
      g.appendChild(el('span', null, x.address));
      b.appendChild(g);
      b.appendChild(el('span', 'dc-go', 'Open on the map →'));
      a.appendChild(b);
      grid.appendChild(a);
    });
    s.appendChild(grid);
    if (latest.length > 1) s.appendChild(el('div', 'dc-swipe', 'SWIPE FOR MORE ›'));

    var ctas = el('div', 'dc-ctas dc-join-ctas');
    var all = el('a', 'al-cta', 'See all discoveries ›'); all.href = MAP + '/community'; all.target = '_blank'; all.rel = 'noopener';
    var add = el('a', 'al-cta', 'Chart your own system'); add.href = MAP + '/'; add.target = '_blank'; add.rel = 'noopener';
    ctas.appendChild(all); ctas.appendChild(add);
    join.appendChild(ctas);
    return s;
  }

  function run() {
    fetch(FEED).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      if (document.getElementById('discoveries')) return;
      var s = build(j); if (!s) return;
      var al = document.getElementById('alliances');
      if (al && al.parentNode) al.parentNode.insertBefore(s, al.nextSibling);
      else { var f = document.querySelector('footer'); if (f) f.parentNode.insertBefore(s, f); }
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
