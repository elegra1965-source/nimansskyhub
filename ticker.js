/* No Man's Sky Hub — "Recently charted" ticker (2026-10-17, Tony).
   Shows how many systems travellers charted on the Galactic Map today / this week,
   then a slow tape of "<name> charted <system> · <galaxy> · 2 h ago" links that fly
   straight to that system. Pauses on hover, keyboard focus or a finger press so a
   link can be tapped; "SEE ALL" opens the map's own Recently charted list.
   Data: the map's small ?recent=1 feed (no personal data: just what each traveller
   chose to type as their name). Hidden if the feed can't be reached or is empty. */
(function () {
  var box = document.getElementById('chartedTicker');
  if (!box) return;
  var MAP = 'https://map.nomansskyhub.app';
  var FEED = MAP + '/.netlify/functions/system-edit?recent=1';
  var GAL = ['Euclid','Hilbert Dimension','Calypso','Hesperius Dimension','Hyades','Ickjamatew','Budullangr','Kikolgallr','Eltiensleen','Eissentam','Elkupalos','Aptarkaba','Ontiniangp','Odiwagiri','Ogtialabi','Muhacksonto','Hitonskyer','Rerasmutul','Isdoraijung','Doctinawyra','Loychazinq','Zukasizawa','Ekwathore','Yeberhahne','Twerbetek','Sivarates','Eajerandal','Aldukesci','Wotyarogii','Sudzerbal','Maupenzhay','Sugueziume','Brogoweldian','Ehbogdenbu','Ijsenufryos','Nipikulha','Autsurabin','Lusontrygiamh','Rewmanawa','Ethiophodhe','Urastrykle','Xobeurindj','Oniijialdu','Wucetosucc','Ebyeloof','Odyavanta','Milekistri','Waferganh','Agnusopwit','Teyaypilny','Zalienkosm','Ladgudiraf','Mushonponte','Amsentisz','Fladiselm','Laanawemb','Ilkerloor','Davanossi','Ploehrliou','Corpinyaya','Leckandmeram','Quulngais','Nokokipsechl','Rinblodesa','Loydporpen','Ibtrevskip','Elkowaldb','Heholhofsko','Yebrilowisod','Husalvangewi',"Ovna'uesed",'Bahibusey','Nuybeliaure','Doshawchuc','Ruckinarkh','Thorettac','Nuponoparau','Moglaschil','Uiweupose','Nasmilete','Ekdaluskin','Hakapanasy','Dimonimba','Cajaccari','Olonerovo','Umlanswick','Henayliszm','Utzenmate','Umirpaiya','Paholiang','Iaereznika','Yudukagath','Boealalosnj','Yaevarcko','Coellosipp','Wayndohalou','Smoduraykl','Apmaneessu','Hicanpaav','Akvasanta','Tuychelisaor','Rivskimbe','Daksanquix','Kissonlin','Aediabiel','Ulosaginyik','Roclaytonycar','Kichiaroa','Irceauffey','Nudquathsenfe','Getaizakaal','Hansolmien','Bloytisagra','Ladsenlay','Luyugoslasr','Ubredhatk','Cidoniana','Jasinessa','Torweierf','Saffneckm','Thnistner','Dotusingg','Luleukous','Jelmandan','Otimanaso','Enjaxusanto','Sezviktorew','Zikehpm','Bephembah','Broomerrai','Meximicka','Venessika','Gaiteseling','Zosakasiro','Drajayanes','Ooibekuar','Urckiansi','Dozivadido','Emiekereks','Meykinunukur','Kimycuristh','Roansfien','Isgarmeso','Daitibeli','Gucuttarik','Enlaythie','Drewweste','Akbulkabi','Homskiw','Zavainlani','Jewijkmas','Itlhotagra','Podalicess','Hiviusauer','Halsebenk','Puikitoac','Gaybakuaria','Grbodubhe','Rycempler','Indjalala','Fontenikk','Pasycihelwhee','Ikbaksmit','Telicianses','Oyleyzhan','Uagerosat','Impoxectin','Twoodmand','Hilfsesorbs','Ezdaranit','Wiensanshe','Ewheelonc','Litzmantufa','Emarmatosi','Mufimbomacvi','Wongquarum','Hapirajua','Igbinduina','Wepaitvas','Sthatigudi','Yekathsebehn','Ebedeagurst','Nolisonia','Ulexovitab','Iodhinxois','Irroswitzs','Bifredait','Beiraghedwe','Yeonatlak','Cugnatachh','Nozoryenki','Ebralduri','Evcickcandj','Ziybosswin','Heperclait','Sugiuniam','Aaseertush','Uglyestemaa','Horeroedsh','Drundemiso','Ityanianat','Purneyrine','Dokiessmat','Nupiacheh','Dihewsonj','Rudrailhik','Tweretnort','Snatreetze','Iwundaracos','Digarlewena','Erquagsta','Logovoloin','Boyaghosganh','Kuolungau','Pehneldept','Yevettiiqidcon','Sahliacabru','Noggalterpor','Chmageaki','Veticueca','Vittesbursul','Nootanore','Innebdjerah','Kisvarcini','Cuzcogipper','Pamanhermonsu','Brotoghek','Mibittara','Huruahili','Raldwicarn','Ezdartlic','Badesclema','Isenkeyan','Iadoitesu','Yagrovoisi','Ewcomechio','Inunnunnoda','Dischiutun','Yuwarugha','Ialmendra','Reponudrle','Rinjanagrbo','Zeziceloh','Oeileutasc','Zicniijinis','Dugnowarilda','Neuxoisan','Ilmenhorn','Rukwatsuku','Nepitzaspru','Chcehoemig','Haffneyrin','Uliciawai','Tuhgrespod','Iousongola','Odyalutai'];
  var DAY = 864e5;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function plain(s) { var t = document.createElement('textarea'); t.innerHTML = String(s || ''); return t.value; }
  function ago(t) {
    var s = Math.max(0, (Date.now() - t) / 1000);
    if (s < 90) return 'just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    var d = Math.round(s / 86400); return d + (d === 1 ? ' day ago' : ' days ago');
  }

  function item(x, dup) {
    var a = el('a', 'tick-item' + (dup ? ' tick-dup' : ''));
    a.href = MAP + '/?arrival=1&addr=' + x.address + '&galaxy=' + x.galaxy;
    a.target = '_blank'; a.rel = 'noopener';
    if (dup) { a.setAttribute('aria-hidden', 'true'); a.tabIndex = -1; }
    a.appendChild(el('b', null, x.who));
    a.appendChild(document.createTextNode(' charted '));
    a.appendChild(el('i', null, x.name));
    a.appendChild(el('small', null, (GAL[x.galaxy] || ('Galaxy ' + (x.galaxy + 1))) + ' · ' + ago(x.t)));
    return a;
  }

  function render(list) {
    var start = new Date(); start.setHours(0, 0, 0, 0);
    var week = list.filter(function (x) { return x.t > Date.now() - 7 * DAY; });
    var today = week.filter(function (x) { return x.t >= start.getTime(); }).length;
    var named = week.filter(function (x) { return x.who; }).slice(0, 20);
    if (!week.length) { box.hidden = true; return; }

    box.textContent = '';
    // say plainly what is being counted: a first-time visitor doesn't know the map takes edits
    var lab = el('div', 'tick-lab');
    var k = el('span', 'tl-k');
    k.appendChild(el('span', 'dot'));
    k.appendChild(document.createTextNode('LIVE FROM THE GALACTIC MAP'));
    lab.appendChild(k);
    var n = el('span', 'tl-n');
    var sys = function (v) { return v === 1 ? ' SYSTEM' : ' SYSTEMS'; };
    var part = function (num, words) { var p = el('span', 'tl-p'); p.appendChild(el('b', null, String(num))); p.appendChild(document.createTextNode(words)); return p; };
    if (today) {
      n.appendChild(part(today, sys(today) + ' CHARTED BY TRAVELLERS TODAY'));
      n.appendChild(el('span', 'tl-sep', '·'));
      n.appendChild(part(week.length, ' THIS WEEK'));
    } else {
      n.appendChild(part(week.length, sys(week.length) + ' CHARTED BY TRAVELLERS THIS WEEK'));
    }
    lab.appendChild(n);
    box.appendChild(lab);

    var view = el('div', 'tick-view');
    var track = el('div', 'tick-track');
    var items = named.length ? named : [];
    items.forEach(function (x) { track.appendChild(item(x, false)); });
    items.forEach(function (x) { track.appendChild(item(x, true)); }); // second copy makes the loop seamless
    if (!items.length) track.appendChild(el('span', 'tick-item', 'Travellers are charting the galaxy right now'));
    view.appendChild(track);
    box.appendChild(view);

    var all = el('a', 'tick-all', 'SEE ALL ›');
    all.href = MAP + '/?recent=1'; all.target = '_blank'; all.rel = 'noopener';
    all.setAttribute('aria-label', 'See all recently charted systems on the Galactic Map');
    box.appendChild(all);
    box.setAttribute('aria-label', 'Live from the Galactic Map: ' + (today ? today + ' systems charted by travellers today, ' : '') + week.length + ' this week');
    box.hidden = false;

    // a steady, readable speed (~40px a second) whatever the number of items
    requestAnimationFrame(function () {
      var w = track.scrollWidth / 2;
      track.style.setProperty('--tick-dur', Math.max(20, Math.round(w / 40)) + 's');
    });
  }

  // a finger press holds the tape still long enough to tap a link
  var holdT;
  box.addEventListener('touchstart', function () { clearTimeout(holdT); box.classList.add('held'); }, { passive: true });
  box.addEventListener('touchend', function () { clearTimeout(holdT); holdT = setTimeout(function () { box.classList.remove('held'); }, 3000); }, { passive: true });

  fetch(FEED).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
    var list = ((j && j.systems) || []).map(function (s) {
      return { t: Date.parse(s.editedAt), galaxy: s.galaxy | 0, address: String(s.address || '').toUpperCase(), name: plain(s.name) || 'an unnamed system', who: plain(s.editor).trim() };
    }).filter(function (x) { return x.t && /^[0-9A-F]{12}$/.test(x.address); });
    render(list);
  }).catch(function () { box.hidden = true; });
})();
