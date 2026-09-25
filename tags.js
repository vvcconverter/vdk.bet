(function (w) {
  var TAGS = [];
  var BY_SLUG = {};
  var ALIAS = {
    clips: "vodka-bet_clips",
    about: "vodka-bet_about",
    stream: "vodka-bet_stream",
    tags: "vodka-bet_tags",
    comments: "vodka-bet_comments",
    otzyv: "vodka-bet_comments",
    "vodka bet": "vodka-bet",
    "vodka casino": "vodka-casino",
    "водка казино": "водка-казино",
    "водка бет": "водка-бет",
    "водкабет зеркало": "водкабет-зеркало",
    "водка казино промокод": "водка-казино-промокод",
    vodkabet: "vodka-bet",
    vodkacasino: "vodka-casino",
    "vdk-bet": "vdk.bet",
  };

  var DEFAULT_TITLE = "";
  var DEFAULT_DESC = "";

  function slugify(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^a-z0-9а-я._-]+/gi, "-")
      .replace(/^-+|-+$/g, "");
  }

  function resolve(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    if (BY_SLUG[s]) return s;
    if (ALIAS[s]) return ALIAS[s];
    var z = slugify(s);
    if (BY_SLUG[z]) return z;
    if (ALIAS[z]) return ALIAS[z];
    return s;
  }

  function tagName(slug) {
    var id = resolve(slug);
    return (BY_SLUG[id] && BY_SLUG[id].name) || id || slug;
  }

  function tagHref(slug) {
    return "index.html?id=" + encodeURIComponent(resolve(slug) || slug);
  }

  function tagLead(slug) {
    var id = resolve(slug);
    var name = tagName(id);
    var leads = {
      "vodka-bet_about": "О трансляции VDK.BET — сайт прямого эфира vodka_bet.",
      "vodka-bet_stream": "Прямой эфир vodka_bet на Twitch — VDK.BET.",
      "vodka-bet_clips": "Клипы vodka_bet на Twitch — карусель на VDK.BET.",
      "vodka-bet_tags": "Теги сайта VDK.BET.",
      "vodka-bet_comments": "Отзыв и комментарии VDK.BET / vodka casino.",
      "vdk.bet": "VDK.BET — официальный сайт прямого эфира vodka_bet.",
      vodka_bet: "vodka_bet — канал Twitch, стрим на VDK.BET.",
      "vodka-bet": "vodka bet — тег стрима на VDK.BET.",
      "vodka-casino": "vodka casino — тег стрима на VDK.BET.",
      "водка-казино": "водка казино — тег стрима на VDK.BET.",
      "водка-бет": "водка бет — клип / тег на VDK.BET.",
      "водкабет-зеркало": "водкабет зеркало — клип / тег на VDK.BET.",
      "водка-казино-промокод": "водка казино промокод — клип / тег на VDK.BET.",
    };
    if (leads[id]) return leads[id];
    return name + " — прямой эфир vodka_bet на VDK.BET.";
  }

  function currentId() {
    try {
      var t = new URLSearchParams(location.search);
      var e = (t.get("id") || t.get("tag") || t.get("n") || t.get("name") || "").trim();
      return e ? resolve(e) : "";
    } catch (err) {
      return "";
    }
  }

  function setMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (el) el.setAttribute("content", content);
  }

  function setProp(prop, content) {
    var el = document.querySelector('meta[property="' + prop + '"]');
    if (el) el.setAttribute("content", content);
  }

  function parseDataTags(el) {
    return (el.getAttribute("data-tags") || "")
      .split(",")
      .map(function (x) {
        return resolve(x.trim());
      })
      .filter(Boolean);
  }

  function parseTagSlugs(raw) {
    return String(raw || "")
      .split(",")
      .map(function (x) {
        return resolve(x.trim());
      })
      .filter(Boolean);
  }

  function applyTag(raw) {
    var id = resolve(raw);
    document.querySelectorAll("#tag-cats a.tag, .clip-tags a").forEach(function (a) {
      var slug = a.getAttribute("data-tag-slug") || "";
      try {
        if (!slug) {
          var u = new URL(a.href, location.href);
          slug = u.searchParams.get("id") || u.searchParams.get("tag") || "";
        }
        slug = resolve(slug);
      } catch (e) {}
      a.classList.toggle("is-on", !!id && slug === id);
      a.classList.toggle("on", !!id && slug === id);
    });
    document.querySelectorAll("[data-tags]").forEach(function (el) {
      if (!id || /_(about|gallery|stream|clips|video|tags|connect|comments)$/.test(id)) {
        el.classList.remove("vdk-dim");
        return;
      }
      var tags = parseDataTags(el);
      el.classList.toggle("vdk-dim", tags.length > 0 && tags.indexOf(id) === -1);
    });
    if (!id) {
      if (DEFAULT_TITLE) document.title = DEFAULT_TITLE;
      if (DEFAULT_DESC) setMeta("description", DEFAULT_DESC);
      return;
    }
    try {
      var sp = new URLSearchParams(location.search);
      if (sp.get("id") !== id) {
        sp.set("id", id);
        sp.delete("tag");
        sp.delete("n");
        sp.delete("name");
        history.replaceState(null, "", location.pathname + "?" + sp.toString() + location.hash);
      }
    } catch (e) {}
    var name = tagName(id);
    var title = name + " — VDK.BET · прямой эфир vodka_bet";
    var desc = tagLead(id);
    document.title = title;
    setMeta("description", desc);
    setProp("og:title", title);
    setProp("og:description", desc);
    setProp("og:url", "https://vdk.bet/index.html?id=" + encodeURIComponent(id));
    var m = String(id).match(/_(about|stream|clips|tags|comments)$/);
    var sectionKey = m ? m[1] : "";
    var map = { about: "about", stream: "stream", clips: "clips", tags: "tags", comments: "otzyv" };
    var sectionId = map[sectionKey] || "";
    if (!sectionId && document.getElementById(id)) sectionId = id;
    if (sectionId) {
      var el = document.getElementById(sectionId);
      if (el) {
        requestAnimationFrame(function () {
          var top = window.scrollY + el.getBoundingClientRect().top - 16;
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        });
      }
    }
    if (w.VDK_PLAY_CLIP_BY_ID) w.VDK_PLAY_CLIP_BY_ID(id);
  }

  function render() {
    var root = document.getElementById("tag-cats");
    if (!root) return;
    var active = currentId();
    var html = '<div class="cat"><div class="tags">';
    TAGS.forEach(function (t) {
      html +=
        '<a class="tag' +
        (active === t.slug ? " is-on on" : "") +
        '" data-kind="name" data-tag-slug="' +
        String(t.slug).replace(/"/g, "&quot;") +
        '" href="' +
        tagHref(t.slug) +
        '">' +
        t.name +
        "</a>";
    });
    html += "</div></div>";
    root.innerHTML = html;
  }

  function allTags() {
    return TAGS.slice();
  }

  function tagLinkHtml(t) {
    return (
      '<a href="' +
      tagHref(t.slug) +
      '" data-tag-slug="' +
      t.slug +
      '">#' +
      (t.name || t.slug) +
      "</a>"
    );
  }

  function setTags(list) {
    TAGS = Array.isArray(list) ? list : [];
    BY_SLUG = {};
    TAGS.forEach(function (t) {
      if (t && t.slug) BY_SLUG[t.slug] = t;
    });
    w.VDK_TAGS.list = TAGS;
    w.VDK_TAGS.bySlug = BY_SLUG;
    render();
    applyTag(currentId());
  }

  function loadTags() {
    return fetch("tags.json")
      .then(function (r) {
        return r.ok ? r.json() : Promise.reject();
      })
      .catch(function () {
        return fetch("/tags.json").then(function (r) {
          return r.ok ? r.json() : [];
        });
      })
      .then(setTags)
      .catch(function () {
        setTags([]);
      });
  }

  w.VDK_TAGS = {
    list: TAGS,
    bySlug: BY_SLUG,
    alias: ALIAS,
    slugify: slugify,
    resolve: resolve,
    parse: parseTagSlugs,
    name: tagName,
    href: tagHref,
    lead: tagLead,
    apply: applyTag,
    render: render,
    all: allTags,
    linkHtml: tagLinkHtml,
    load: loadTags,
    currentId: currentId,
  };

  function boot() {
    DEFAULT_TITLE = document.title;
    DEFAULT_DESC = (document.querySelector('meta[name="description"]') || {}).content || "";
    loadTags();
    w.addEventListener("popstate", function () {
      applyTag(currentId());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
