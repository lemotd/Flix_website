/**
 * Figma-compatible Smooth Corners via clip-path: path()
 *
 * Port of figma-squircle (https://github.com/phamfoo/figma-squircle)
 * which reverse-engineers Figma's corner smoothing algorithm.
 *
 * Uses clip-path: path('...') with SVG path commands (cubic bezier + arc)
 * for pixel-perfect Figma-matching smooth corners.
 *
 * Usage:
 *   data-smooth-corners             → reads CSS border-radius, 60% smoothing
 *   data-smooth-corners="20"        → explicit radius in px, 60% smoothing
 */
(function () {
  'use strict';

  // Check clip-path: path() support
  var supportsPath = false;
  try {
    supportsPath =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('clip-path', "path('M0 0')");
  } catch (e) {}
  if (!supportsPath) return;

  var CACHE_KEY = '_scR';
  var SMOOTHING = 0.6; // Figma's iOS default (60%)

  function toRad(deg) { return deg * Math.PI / 180; }

  function getRadius(el, w, h) {
    if (el[CACHE_KEY] !== undefined) return el[CACHE_KEY];
    var attr = el.getAttribute('data-smooth-corners');
    var r;
    if (attr !== null && attr !== '' && !isNaN(parseFloat(attr))) {
      r = parseFloat(attr);
    } else {
      var cs = window.getComputedStyle(el);
      var raw = cs.borderTopLeftRadius || cs.borderRadius || '0';
      r = raw.indexOf('%') !== -1
        ? (parseFloat(raw) / 100) * Math.min(w, h)
        : parseFloat(raw) || 0;
    }
    el[CACHE_KEY] = r;
    return r;
  }

  /**
   * Attempt to read the corner radius for an element.
   * Based on figma-squircle's getPathParamsForCorner
   */
  function getCornerParams(cornerRadius, cornerSmoothing, budget) {
    var p = (1 + cornerSmoothing) * cornerRadius;

    var maxSmoothing = budget / cornerRadius - 1;
    cornerSmoothing = Math.min(cornerSmoothing, maxSmoothing);
    p = Math.min(p, budget);

    var arcMeasure = 90 * (1 - cornerSmoothing);
    var arcSectionLength = Math.sin(toRad(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);

    var angleAlpha = (90 - arcMeasure) / 2;
    var p3ToP4 = cornerRadius * Math.tan(toRad(angleAlpha / 2));

    var angleBeta = 45 * cornerSmoothing;
    var c = p3ToP4 * Math.cos(toRad(angleBeta));
    var d = c * Math.tan(toRad(angleBeta));

    var b = (p - arcSectionLength - c - d) / 3;
    var a = 2 * b;

    return { a: a, b: b, c: c, d: d, p: p, arcSectionLength: arcSectionLength, cornerRadius: cornerRadius };
  }

  function f(n) { return n.toFixed(4); }

  function drawTopRight(q) {
    if (!q.cornerRadius) return 'l ' + f(q.p) + ' 0';
    return 'c ' + f(q.a) + ' 0 ' + f(q.a + q.b) + ' 0 ' + f(q.a + q.b + q.c) + ' ' + f(q.d) +
      ' a ' + f(q.cornerRadius) + ' ' + f(q.cornerRadius) + ' 0 0 1 ' + f(q.arcSectionLength) + ' ' + f(q.arcSectionLength) +
      ' c ' + f(q.d) + ' ' + f(q.c) + ' ' + f(q.d) + ' ' + f(q.b + q.c) + ' ' + f(q.d) + ' ' + f(q.a + q.b + q.c);
  }

  function drawBottomRight(q) {
    if (!q.cornerRadius) return 'l 0 ' + f(q.p);
    return 'c 0 ' + f(q.a) + ' 0 ' + f(q.a + q.b) + ' ' + f(-q.d) + ' ' + f(q.a + q.b + q.c) +
      ' a ' + f(q.cornerRadius) + ' ' + f(q.cornerRadius) + ' 0 0 1 ' + f(-q.arcSectionLength) + ' ' + f(q.arcSectionLength) +
      ' c ' + f(-q.c) + ' ' + f(q.d) + ' ' + f(-(q.b + q.c)) + ' ' + f(q.d) + ' ' + f(-(q.a + q.b + q.c)) + ' ' + f(q.d);
  }

  function drawBottomLeft(q) {
    if (!q.cornerRadius) return 'l ' + f(-q.p) + ' 0';
    return 'c ' + f(-q.a) + ' 0 ' + f(-(q.a + q.b)) + ' 0 ' + f(-(q.a + q.b + q.c)) + ' ' + f(-q.d) +
      ' a ' + f(q.cornerRadius) + ' ' + f(q.cornerRadius) + ' 0 0 1 ' + f(-q.arcSectionLength) + ' ' + f(-q.arcSectionLength) +
      ' c ' + f(-q.d) + ' ' + f(-q.c) + ' ' + f(-q.d) + ' ' + f(-(q.b + q.c)) + ' ' + f(-q.d) + ' ' + f(-(q.a + q.b + q.c));
  }

  function drawTopLeft(q) {
    if (!q.cornerRadius) return 'l 0 ' + f(-q.p);
    return 'c 0 ' + f(-q.a) + ' 0 ' + f(-(q.a + q.b)) + ' ' + f(q.d) + ' ' + f(-(q.a + q.b + q.c)) +
      ' a ' + f(q.cornerRadius) + ' ' + f(q.cornerRadius) + ' 0 0 1 ' + f(q.arcSectionLength) + ' ' + f(-q.arcSectionLength) +
      ' c ' + f(q.c) + ' ' + f(-q.d) + ' ' + f(q.b + q.c) + ' ' + f(-q.d) + ' ' + f(q.a + q.b + q.c) + ' ' + f(-q.d);
  }

  function buildPath(w, h, radius) {
    var r = Math.min(radius, Math.min(w, h) / 2);
    if (r < 1) return '';

    var budget = Math.min(w, h) / 2;
    var q = getCornerParams(r, SMOOTHING, budget);

    return 'M ' + f(w - q.p) + ' 0 ' +
      drawTopRight(q) +
      ' L ' + f(w) + ' ' + f(h - q.p) + ' ' +
      drawBottomRight(q) +
      ' L ' + f(q.p) + ' ' + f(h) + ' ' +
      drawBottomLeft(q) +
      ' L 0 ' + f(q.p) + ' ' +
      drawTopLeft(q) +
      ' Z';
  }

  function apply(el) {
    var w = el.offsetWidth;
    var h = el.offsetHeight;
    if (!w || !h) return;
    var r = getRadius(el, w, h);
    if (r < 1) return;
    var d = buildPath(w, h, r);
    if (!d) return;
    var val = "path('" + d + "')";
    el.style.clipPath = val;
    el.style.webkitClipPath = val;
    el.style.borderRadius = '0';
  }

  function applyAll() {
    var els = document.querySelectorAll('[data-smooth-corners]');
    for (var i = 0; i < els.length; i++) apply(els[i]);
  }

  var ro = null;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) apply(entries[i].target);
    });
  }
  function observe(el) { if (ro) ro.observe(el); }

  function init() {
    applyAll();
    var els = document.querySelectorAll('[data-smooth-corners]');
    for (var i = 0; i < els.length; i++) observe(els[i]);
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
  if (!ro) window.addEventListener('resize', applyAll);

  if (typeof MutationObserver !== 'undefined') {
    var startMO = function () {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var nodes = muts[i].addedNodes;
          for (var j = 0; j < nodes.length; j++) {
            var nd = nodes[j];
            if (nd.nodeType !== 1) continue;
            if (nd.hasAttribute && nd.hasAttribute('data-smooth-corners')) {
              apply(nd); observe(nd);
            }
            if (nd.querySelectorAll) {
              var ch = nd.querySelectorAll('[data-smooth-corners]');
              for (var k = 0; k < ch.length; k++) { apply(ch[k]); observe(ch[k]); }
            }
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) startMO();
    else document.addEventListener('DOMContentLoaded', startMO);
  }
})();
