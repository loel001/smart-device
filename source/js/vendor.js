/* stylelint-disable*/
/* eslint-disable*/
'use strict';
(function () {

  /*! Picturefill - v2.3.1 - 2015-04-09
   * http://scottjehl.github.io/picturefill
   * Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT */
  /*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

  window.matchMedia || (window.matchMedia = function () {
    "use strict";

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = (window.styleMedia || window.media);

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
        script = document.getElementsByTagName('script')[0],
        info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function (media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());
  /*! Picturefill - Responsive Images that work today.
   *  Author: Scott Jehl, Filament Group, 2012 ( new proposal implemented by Shawn Jansepar )
   *  License: MIT/GPLv2
   *  Spec: http://picture.responsiveimages.org/
   */
  (function (w, doc, image) {
    // Enable strict mode
    "use strict";

    function expose(picturefill) {
      /* expose picturefill */
      if (typeof module === "object" && typeof module.exports === "object") {
        // CommonJS, just export
        module.exports = picturefill;
      } else if (typeof define === "function" && define.amd) {
        // AMD support
        define("picturefill", function () {
          return picturefill;
        });
      }
      if (typeof w === "object") {
        // If no AMD and we are in the browser, attach to window
        w.picturefill = picturefill;
      }
    }

    // If picture is supported, well, that's awesome. Let's get outta here...
    if (w.HTMLPictureElement) {
      expose(function () {
      });
      return;
    }

    // HTML shim|v it for old IE (IE9 will still need the HTML video tag workaround)
    doc.createElement("picture");

    // local object for method references and testing exposure
    var pf = w.picturefill || {};

    var regWDesc = /\s+\+?\d+(e\d+)?w/;

    // namespace
    pf.ns = "picturefill";

    // srcset support test
    (function () {
      pf.srcsetSupported = "srcset" in image;
      pf.sizesSupported = "sizes" in image;
      pf.curSrcSupported = "currentSrc" in image;
    })();

    // just a string trim workaround
    pf.trim = function (str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
    };

    /**
     * Gets a string and returns the absolute URL
     * @param src
     * @returns {String} absolute URL
     */
    pf.makeUrl = (function () {
      var anchor = doc.createElement("a");
      return function (src) {
        anchor.href = src;
        return anchor.href;
      };
    })();

    /**
     * Shortcut method for https://w3c.github.io/webappsec/specs/mixedcontent/#restricts-mixed-content ( for easy overriding in tests )
     */
    pf.restrictsMixedContent = function () {
      return w.location.protocol === "https:";
    };
    /**
     * Shortcut method for matchMedia ( for easy overriding in tests )
     */

    pf.matchesMedia = function (media) {
      return w.matchMedia && w.matchMedia(media).matches;
    };

    // Shortcut method for `devicePixelRatio` ( for easy overriding in tests )
    pf.getDpr = function () {
      return (w.devicePixelRatio || 1);
    };

    /**
     * Get width in css pixel value from a "length" value
     * http://dev.w3.org/csswg/css-values-3/#length-value
     */
    pf.getWidthFromLength = function (length) {
      var cssValue;
      // If a length is specified and doesn’t contain a percentage, and it is greater than 0 or using `calc`, use it. Else, abort.
      if (!(length && length.indexOf("%") > -1 === false && (parseFloat(length) > 0 || length.indexOf("calc(") > -1))) {
        return false;
      }

      /**
       * If length is specified in  `vw` units, use `%` instead since the div we’re measuring
       * is injected at the top of the document.
       *
       * TODO: maybe we should put this behind a feature test for `vw`? The risk of doing this is possible browser inconsistancies with vw vs %
       */
      length = length.replace("vw", "%");

      // Create a cached element for getting length value widths
      if (!pf.lengthEl) {
        pf.lengthEl = doc.createElement("div");

        // Positioning styles help prevent padding/margin/width on `html` or `body` from throwing calculations off.
        pf.lengthEl.style.cssText = "border:0;display:block;font-size:1em;left:0;margin:0;padding:0;position:absolute;visibility:hidden";

        // Add a class, so that everyone knows where this element comes from
        pf.lengthEl.className = "helper-from-picturefill-js";
      }

      pf.lengthEl.style.width = "0px";

      try {
        pf.lengthEl.style.width = length;
      } catch (e) {
      }

      doc.body.appendChild(pf.lengthEl);

      cssValue = pf.lengthEl.offsetWidth;

      if (cssValue <= 0) {
        cssValue = false;
      }

      doc.body.removeChild(pf.lengthEl);

      return cssValue;
    };

    pf.detectTypeSupport = function (type, typeUri) {
      // based on Modernizr's lossless img-webp test
      // note: asynchronous
      var image = new w.Image();
      image.onerror = function () {
        pf.types[type] = false;
        picturefill();
      };
      image.onload = function () {
        pf.types[type] = image.width === 1;
        picturefill();
      };
      image.src = typeUri;

      return "pending";
    };
    // container of supported mime types that one might need to qualify before using
    pf.types = pf.types || {};

    pf.initTypeDetects = function () {
      // Add support for standard mime types
      pf.types["image/jpeg"] = true;
      pf.types["image/gif"] = true;
      pf.types["image/png"] = true;
      pf.types["image/svg+xml"] = doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
      pf.types["image/webp"] = pf.detectTypeSupport("image/webp", "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=");
    };

    pf.verifyTypeSupport = function (source) {
      var type = source.getAttribute("type");
      // if type attribute exists, return test result, otherwise return true
      if (type === null || type === "") {
        return true;
      } else {
        var pfType = pf.types[type];
        // if the type test is a function, run it and return "pending" status. The function will rerun picturefill on pending elements once finished.
        if (typeof pfType === "string" && pfType !== "pending") {
          pf.types[type] = pf.detectTypeSupport(type, pfType);
          return "pending";
        } else if (typeof pfType === "function") {
          pfType();
          return "pending";
        } else {
          return pfType;
        }
      }
    };

    // Parses an individual `size` and returns the length, and optional media query
    pf.parseSize = function (sourceSizeStr) {
      var match = /(\([^)]+\))?\s*(.+)/g.exec(sourceSizeStr);
      return {
        media: match && match[1],
        length: match && match[2]
      };
    };

    // Takes a string of sizes and returns the width in pixels as a number
    pf.findWidthFromSourceSize = function (sourceSizeListStr) {
      // Split up source size list, ie ( max-width: 30em ) 100%, ( max-width: 50em ) 50%, 33%
      //                            or (min-width:30em) calc(30% - 15px)
      var sourceSizeList = pf.trim(sourceSizeListStr).split(/\s*,\s*/),
        winningLength;

      for (var i = 0, len = sourceSizeList.length; i < len; i++) {
        // Match <media-condition>? length, ie ( min-width: 50em ) 100%
        var sourceSize = sourceSizeList[i],
          // Split "( min-width: 50em ) 100%" into separate strings
          parsedSize = pf.parseSize(sourceSize),
          length = parsedSize.length,
          media = parsedSize.media;

        if (!length) {
          continue;
        }
        // if there is no media query or it matches, choose this as our winning length
        if ((!media || pf.matchesMedia(media)) &&
          // pass the length to a method that can properly determine length
          // in pixels based on these formats: http://dev.w3.org/csswg/css-values-3/#length-value
          (winningLength = pf.getWidthFromLength(length))) {
          break;
        }
      }

      //if we have no winningLength fallback to 100vw
      return winningLength || Math.max(w.innerWidth || 0, doc.documentElement.clientWidth);
    };

    pf.parseSrcset = function (srcset) {
      /**
       * A lot of this was pulled from Boris Smus’ parser for the now-defunct WHATWG `srcset`
       * https://github.com/borismus/srcset-polyfill/blob/master/js/srcset-info.js
       *
       * 1. Let input (`srcset`) be the value passed to this algorithm.
       * 2. Let position be a pointer into input, initially pointing at the start of the string.
       * 3. Let raw candidates be an initially empty ordered list of URLs with associated
       *    unparsed descriptors. The order of entries in the list is the order in which entries
       *    are added to the list.
       */
      var candidates = [];

      while (srcset !== "") {
        srcset = srcset.replace(/^\s+/g, "");

        // 5. Collect a sequence of characters that are not space characters, and let that be url.
        var pos = srcset.search(/\s/g),
          url, descriptor = null;

        if (pos !== -1) {
          url = srcset.slice(0, pos);

          var last = url.slice(-1);

          // 6. If url ends with a U+002C COMMA character (,), remove that character from url
          // and let descriptors be the empty string. Otherwise, follow these substeps
          // 6.1. If url is empty, then jump to the step labeled descriptor parser.

          if (last === "," || url === "") {
            url = url.replace(/,+$/, "");
            descriptor = "";
          }
          srcset = srcset.slice(pos + 1);

          // 6.2. Collect a sequence of characters that are not U+002C COMMA characters (,), and
          // let that be descriptors.
          if (descriptor === null) {
            var descpos = srcset.indexOf(",");
            if (descpos !== -1) {
              descriptor = srcset.slice(0, descpos);
              srcset = srcset.slice(descpos + 1);
            } else {
              descriptor = srcset;
              srcset = "";
            }
          }
        } else {
          url = srcset;
          srcset = "";
        }

        // 7. Add url to raw candidates, associated with descriptors.
        if (url || descriptor) {
          candidates.push({
            url: url,
            descriptor: descriptor
          });
        }
      }
      return candidates;
    };

    pf.parseDescriptor = function (descriptor, sizesattr) {
      // 11. Descriptor parser: Let candidates be an initially empty source set. The order of entries in the list
      // is the order in which entries are added to the list.
      var sizes = sizesattr || "100vw",
        sizeDescriptor = descriptor && descriptor.replace(/(^\s+|\s+$)/g, ""),
        widthInCssPixels = pf.findWidthFromSourceSize(sizes),
        resCandidate;

      if (sizeDescriptor) {
        var splitDescriptor = sizeDescriptor.split(" ");

        for (var i = splitDescriptor.length - 1; i >= 0; i--) {
          var curr = splitDescriptor[i],
            lastchar = curr && curr.slice(curr.length - 1);

          if ((lastchar === "h" || lastchar === "w") && !pf.sizesSupported) {
            resCandidate = parseFloat((parseInt(curr, 10) / widthInCssPixels));
          } else if (lastchar === "x") {
            var res = curr && parseFloat(curr, 10);
            resCandidate = res && !isNaN(res) ? res : 1;
          }
        }
      }
      return resCandidate || 1;
    };

    /**
     * Takes a srcset in the form of url/
     * ex. "images/pic-medium.png 1x, images/pic-medium-2x.png 2x" or
     *     "images/pic-medium.png 400w, images/pic-medium-2x.png 800w" or
     *     "images/pic-small.png"
     * Get an array of image candidates in the form of
     *      {url: "/foo/bar.png", resolution: 1}
     * where resolution is http://dev.w3.org/csswg/css-values-3/#resolution-value
     * If sizes is specified, resolution is calculated
     */
    pf.getCandidatesFromSourceSet = function (srcset, sizes) {
      var candidates = pf.parseSrcset(srcset),
        formattedCandidates = [];

      for (var i = 0, len = candidates.length; i < len; i++) {
        var candidate = candidates[i];

        formattedCandidates.push({
          url: candidate.url,
          resolution: pf.parseDescriptor(candidate.descriptor, sizes)
        });
      }
      return formattedCandidates;
    };

    /**
     * if it's an img element and it has a srcset property,
     * we need to remove the attribute so we can manipulate src
     * (the property's existence infers native srcset support, and a srcset-supporting browser will prioritize srcset's value over our winning picture candidate)
     * this moves srcset's value to memory for later use and removes the attr
     */
    pf.dodgeSrcset = function (img) {
      if (img.srcset) {
        img[pf.ns].srcset = img.srcset;
        img.srcset = "";
        img.setAttribute("data-pfsrcset", img[pf.ns].srcset);
      }
    };

    // Accept a source or img element and process its srcset and sizes attrs
    pf.processSourceSet = function (el) {
      var srcset = el.getAttribute("srcset"),
        sizes = el.getAttribute("sizes"),
        candidates = [];

      // if it's an img element, use the cached srcset property (defined or not)
      if (el.nodeName.toUpperCase() === "IMG" && el[pf.ns] && el[pf.ns].srcset) {
        srcset = el[pf.ns].srcset;
      }

      if (srcset) {
        candidates = pf.getCandidatesFromSourceSet(srcset, sizes);
      }
      return candidates;
    };

    pf.backfaceVisibilityFix = function (picImg) {
      // See: https://github.com/scottjehl/picturefill/issues/332
      var style = picImg.style || {},
        WebkitBackfaceVisibility = "webkitBackfaceVisibility" in style,
        currentZoom = style.zoom;

      if (WebkitBackfaceVisibility) {
        style.zoom = ".999";

        WebkitBackfaceVisibility = picImg.offsetWidth;

        style.zoom = currentZoom;
      }
    };

    pf.setIntrinsicSize = (function () {
      var urlCache = {};
      var setSize = function (picImg, width, res) {
        if (width) {
          picImg.setAttribute("width", parseInt(width / res, 10));
        }
      };
      return function (picImg, bestCandidate) {
        var img;
        if (!picImg[pf.ns] || w.pfStopIntrinsicSize) {
          return;
        }
        if (picImg[pf.ns].dims === undefined) {
          picImg[pf.ns].dims = picImg.getAttribute("width") || picImg.getAttribute("height");
        }
        if (picImg[pf.ns].dims) {
          return;
        }

        if (bestCandidate.url in urlCache) {
          setSize(picImg, urlCache[bestCandidate.url], bestCandidate.resolution);
        } else {
          img = doc.createElement("img");
          img.onload = function () {
            urlCache[bestCandidate.url] = img.width;

            //IE 10/11 don't calculate width for svg outside document
            if (!urlCache[bestCandidate.url]) {
              try {
                doc.body.appendChild(img);
                urlCache[bestCandidate.url] = img.width || img.offsetWidth;
                doc.body.removeChild(img);
              } catch (e) {
              }
            }

            if (picImg.src === bestCandidate.url) {
              setSize(picImg, urlCache[bestCandidate.url], bestCandidate.resolution);
            }
            picImg = null;
            img.onload = null;
            img = null;
          };
          img.src = bestCandidate.url;
        }
      };
    })();

    pf.applyBestCandidate = function (candidates, picImg) {
      var candidate,
        length,
        bestCandidate;

      candidates.sort(pf.ascendingSort);

      length = candidates.length;
      bestCandidate = candidates[length - 1];

      for (var i = 0; i < length; i++) {
        candidate = candidates[i];
        if (candidate.resolution >= pf.getDpr()) {
          bestCandidate = candidate;
          break;
        }
      }

      if (bestCandidate) {

        bestCandidate.url = pf.makeUrl(bestCandidate.url);

        if (picImg.src !== bestCandidate.url) {
          if (pf.restrictsMixedContent() && bestCandidate.url.substr(0, "http:".length).toLowerCase() === "http:") {
            if (window.console !== undefined) {
              console.warn("Blocked mixed content image " + bestCandidate.url);
            }
          } else {
            picImg.src = bestCandidate.url;
            // currentSrc attribute and property to match
            // http://picture.responsiveimages.org/#the-img-element
            if (!pf.curSrcSupported) {
              picImg.currentSrc = picImg.src;
            }

            pf.backfaceVisibilityFix(picImg);
          }
        }

        pf.setIntrinsicSize(picImg, bestCandidate);
      }
    };

    pf.ascendingSort = function (a, b) {
      return a.resolution - b.resolution;
    };

    /**
     * In IE9, <source> elements get removed if they aren't children of
     * video elements. Thus, we conditionally wrap source elements
     * using <!--[if IE 9]><video style="display: none;"><![endif]-->
     * and must account for that here by moving those source elements
     * back into the picture element.
     */
    pf.removeVideoShim = function (picture) {
      var videos = picture.getElementsByTagName("video");
      if (videos.length) {
        var video = videos[0],
          vsources = video.getElementsByTagName("source");
        while (vsources.length) {
          picture.insertBefore(vsources[0], video);
        }
        // Remove the video element once we're finished removing its children
        video.parentNode.removeChild(video);
      }
    };

    /**
     * Find all `img` elements, and add them to the candidate list if they have
     * a `picture` parent, a `sizes` attribute in basic `srcset` supporting browsers,
     * a `srcset` attribute at all, and they haven’t been evaluated already.
     */
    pf.getAllElements = function () {
      var elems = [],
        imgs = doc.getElementsByTagName("img");

      for (var h = 0, len = imgs.length; h < len; h++) {
        var currImg = imgs[h];

        if (currImg.parentNode.nodeName.toUpperCase() === "PICTURE" ||
          (currImg.getAttribute("srcset") !== null) || currImg[pf.ns] && currImg[pf.ns].srcset !== null) {
          elems.push(currImg);
        }
      }
      return elems;
    };

    pf.getMatch = function (img, picture) {
      var sources = picture.childNodes,
        match;

      // Go through each child, and if they have media queries, evaluate them
      for (var j = 0, slen = sources.length; j < slen; j++) {
        var source = sources[j];

        // ignore non-element nodes
        if (source.nodeType !== 1) {
          continue;
        }

        // Hitting the `img` element that started everything stops the search for `sources`.
        // If no previous `source` matches, the `img` itself is evaluated later.
        if (source === img) {
          return match;
        }

        // ignore non-`source` nodes
        if (source.nodeName.toUpperCase() !== "SOURCE") {
          continue;
        }
        // if it's a source element that has the `src` property set, throw a warning in the console
        if (source.getAttribute("src") !== null && typeof console !== undefined) {
          console.warn("The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.");
        }

        var media = source.getAttribute("media");

        // if source does not have a srcset attribute, skip
        if (!source.getAttribute("srcset")) {
          continue;
        }

        // if there's no media specified, OR w.matchMedia is supported
        if ((!media || pf.matchesMedia(media))) {
          var typeSupported = pf.verifyTypeSupport(source);

          if (typeSupported === true) {
            match = source;
            break;
          } else if (typeSupported === "pending") {
            return false;
          }
        }
      }

      return match;
    };

    function picturefill(opt) {
      var elements,
        element,
        parent,
        firstMatch,
        candidates,
        options = opt || {};

      elements = options.elements || pf.getAllElements();

      // Loop through all elements
      for (var i = 0, plen = elements.length; i < plen; i++) {
        element = elements[i];
        parent = element.parentNode;
        firstMatch = undefined;
        candidates = undefined;

        // immediately skip non-`img` nodes
        if (element.nodeName.toUpperCase() !== "IMG") {
          continue;
        }

        // expando for caching data on the img
        if (!element[pf.ns]) {
          element[pf.ns] = {};
        }

        // if the element has already been evaluated, skip it unless
        // `options.reevaluate` is set to true ( this, for example,
        // is set to true when running `picturefill` on `resize` ).
        if (!options.reevaluate && element[pf.ns].evaluated) {
          continue;
        }

        // if `img` is in a `picture` element
        if (parent && parent.nodeName.toUpperCase() === "PICTURE") {

          // IE9 video workaround
          pf.removeVideoShim(parent);

          // return the first match which might undefined
          // returns false if there is a pending source
          // TODO the return type here is brutal, cleanup
          firstMatch = pf.getMatch(element, parent);

          // if any sources are pending in this picture due to async type test(s)
          // remove the evaluated attr and skip for now ( the pending test will
          // rerun picturefill on this element when complete)
          if (firstMatch === false) {
            continue;
          }
        } else {
          firstMatch = undefined;
        }

        // Cache and remove `srcset` if present and we’re going to be doing `picture`/`srcset`/`sizes` polyfilling to it.
        if ((parent && parent.nodeName.toUpperCase() === "PICTURE") ||
          (!pf.sizesSupported && (element.srcset && regWDesc.test(element.srcset)))) {
          pf.dodgeSrcset(element);
        }

        if (firstMatch) {
          candidates = pf.processSourceSet(firstMatch);
          pf.applyBestCandidate(candidates, element);
        } else {
          // No sources matched, so we’re down to processing the inner `img` as a source.
          candidates = pf.processSourceSet(element);

          if (element.srcset === undefined || element[pf.ns].srcset) {
            // Either `srcset` is completely unsupported, or we need to polyfill `sizes` functionality.
            pf.applyBestCandidate(candidates, element);
          } // Else, resolution-only `srcset` is supported natively.
        }

        // set evaluated to true to avoid unnecessary reparsing
        element[pf.ns].evaluated = true;
      }
    }

    /**
     * Sets up picture polyfill by polling the document and running
     * the polyfill every 250ms until the document is ready.
     * Also attaches picturefill on resize
     */
    function runPicturefill() {
      pf.initTypeDetects();
      picturefill();
      var intervalId = setInterval(function () {
        // When the document has finished loading, stop checking for new images
        // https://github.com/ded/domready/blob/master/ready.js#L15
        picturefill();

        if (/^loaded|^i|^c/.test(doc.readyState)) {
          clearInterval(intervalId);
          return;
        }
      }, 250);

      var resizeTimer;
      var handleResize = function () {
        picturefill({
          reevaluate: true
        });
      };

      function checkResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 60);
      }

      if (w.addEventListener) {
        w.addEventListener("resize", checkResize, false);
      } else if (w.attachEvent) {
        w.attachEvent("onresize", checkResize);
      }
    }

    runPicturefill();

    /* expose methods for testing */
    picturefill._ = pf;

    expose(picturefill);

  })(window, window.document, new window.Image());
  (function (window, factory) {
    var lazySizes = factory(window, window.document, Date);
    window.lazySizes = lazySizes;
    if (typeof module == 'object' && module.exports) {
      module.exports = lazySizes;
    }
  }(typeof window != 'undefined' ?
    window : {}, function l(window, document, Date) { // Pass in the windoe Date function also for SSR because the Date class can be lost
      'use strict';
      /*jshint eqnull:true */

      var lazysizes, lazySizesCfg;

      (function () {
        var prop;

        var lazySizesDefaults = {
          lazyClass: 'lazyload',
          loadedClass: 'lazyloaded',
          loadingClass: 'lazyloading',
          preloadClass: 'lazypreload',
          errorClass: 'lazyerror',
          //strictClass: 'lazystrict',
          autosizesClass: 'lazyautosizes',
          srcAttr: 'data-src',
          srcsetAttr: 'data-srcset',
          sizesAttr: 'data-sizes',
          //preloadAfterLoad: false,
          minSize: 40,
          customMedia: {},
          init: true,
          expFactor: 1.5,
          hFac: 0.8,
          loadMode: 2,
          loadHidden: true,
          ricTimeout: 0,
          throttleDelay: 125,
        };

        lazySizesCfg = window.lazySizesConfig || window.lazysizesConfig || {};

        for (prop in lazySizesDefaults) {
          if (!(prop in lazySizesCfg)) {
            lazySizesCfg[prop] = lazySizesDefaults[prop];
          }
        }
      })();

      if (!document || !document.getElementsByClassName) {
        return {
          init: function () {
          },
          cfg: lazySizesCfg,
          noSupport: true,
        };
      }

      var docElem = document.documentElement;

      var supportPicture = window.HTMLPictureElement;

      var _addEventListener = 'addEventListener';

      var _getAttribute = 'getAttribute';

      /**
       * Update to bind to window because 'this' becomes null during SSR
       * builds.
       */
      var addEventListener = window[_addEventListener].bind(window);

      var setTimeout = window.setTimeout;

      var requestAnimationFrame = window.requestAnimationFrame || setTimeout;

      var requestIdleCallback = window.requestIdleCallback;

      var regPicture = /^picture$/i;

      var loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

      var regClassCache = {};

      var forEach = Array.prototype.forEach;

      var hasClass = function (ele, cls) {
        if (!regClassCache[cls]) {
          regClassCache[cls] = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        }
        return regClassCache[cls].test(ele[_getAttribute]('class') || '') && regClassCache[cls];
      };

      var addClass = function (ele, cls) {
        if (!hasClass(ele, cls)) {
          ele.setAttribute('class', (ele[_getAttribute]('class') || '').trim() + ' ' + cls);
        }
      };

      var removeClass = function (ele, cls) {
        var reg;
        if ((reg = hasClass(ele, cls))) {
          ele.setAttribute('class', (ele[_getAttribute]('class') || '').replace(reg, ' '));
        }
      };

      var addRemoveLoadEvents = function (dom, fn, add) {
        var action = add ? _addEventListener : 'removeEventListener';
        if (add) {
          addRemoveLoadEvents(dom, fn);
        }
        loadEvents.forEach(function (evt) {
          dom[action](evt, fn);
        });
      };

      var triggerEvent = function (elem, name, detail, noBubbles, noCancelable) {
        var event = document.createEvent('Event');

        if (!detail) {
          detail = {};
        }

        detail.instance = lazysizes;

        event.initEvent(name, !noBubbles, !noCancelable);

        event.detail = detail;

        elem.dispatchEvent(event);
        return event;
      };

      var updatePolyfill = function (el, full) {
        var polyfill;
        if (!supportPicture && (polyfill = (window.picturefill || lazySizesCfg.pf))) {
          if (full && full.src && !el[_getAttribute]('srcset')) {
            el.setAttribute('srcset', full.src);
          }
          polyfill({reevaluate: true, elements: [el]});
        } else if (full && full.src) {
          el.src = full.src;
        }
      };

      var getCSS = function (elem, style) {
        return (getComputedStyle(elem, null) || {})[style];
      };

      var getWidth = function (elem, parent, width) {
        width = width || elem.offsetWidth;

        while (width < lazySizesCfg.minSize && parent && !elem._lazysizesWidth) {
          width = parent.offsetWidth;
          parent = parent.parentNode;
        }

        return width;
      };

      var rAF = (function () {
        var running, waiting;
        var firstFns = [];
        var secondFns = [];
        var fns = firstFns;

        var run = function () {
          var runFns = fns;

          fns = firstFns.length ? secondFns : firstFns;

          running = true;
          waiting = false;

          while (runFns.length) {
            runFns.shift()();
          }

          running = false;
        };

        var rafBatch = function (fn, queue) {
          if (running && !queue) {
            fn.apply(this, arguments);
          } else {
            fns.push(fn);

            if (!waiting) {
              waiting = true;
              (document.hidden ? setTimeout : requestAnimationFrame)(run);
            }
          }
        };

        rafBatch._lsFlush = run;

        return rafBatch;
      })();

      var rAFIt = function (fn, simple) {
        return simple ?
          function () {
            rAF(fn);
          } :
          function () {
            var that = this;
            var args = arguments;
            rAF(function () {
              fn.apply(that, args);
            });
          }
          ;
      };

      var throttle = function (fn) {
        var running;
        var lastTime = 0;
        var gDelay = lazySizesCfg.throttleDelay;
        var rICTimeout = lazySizesCfg.ricTimeout;
        var run = function () {
          running = false;
          lastTime = Date.now();
          fn();
        };
        var idleCallback = requestIdleCallback && rICTimeout > 49 ?
          function () {
            requestIdleCallback(run, {timeout: rICTimeout});

            if (rICTimeout !== lazySizesCfg.ricTimeout) {
              rICTimeout = lazySizesCfg.ricTimeout;
            }
          } :
          rAFIt(function () {
            setTimeout(run);
          }, true)
        ;

        return function (isPriority) {
          var delay;

          if ((isPriority = isPriority === true)) {
            rICTimeout = 33;
          }

          if (running) {
            return;
          }

          running = true;

          delay = gDelay - (Date.now() - lastTime);

          if (delay < 0) {
            delay = 0;
          }

          if (isPriority || delay < 9) {
            idleCallback();
          } else {
            setTimeout(idleCallback, delay);
          }
        };
      };

      //based on http://modernjavascript.blogspot.de/2013/08/building-better-debounce.html
      var debounce = function (func) {
        var timeout, timestamp;
        var wait = 99;
        var run = function () {
          timeout = null;
          func();
        };
        var later = function () {
          var last = Date.now() - timestamp;

          if (last < wait) {
            setTimeout(later, wait - last);
          } else {
            (requestIdleCallback || run)(run);
          }
        };

        return function () {
          timestamp = Date.now();

          if (!timeout) {
            timeout = setTimeout(later, wait);
          }
        };
      };

      var loader = (function () {
        var preloadElems, isCompleted, resetPreloadingTimer, loadMode, started;

        var eLvW, elvH, eLtop, eLleft, eLright, eLbottom, isBodyHidden;

        var regImg = /^img$/i;
        var regIframe = /^iframe$/i;

        var supportScroll = ('onscroll' in window) && !(/(gle|ing)bot/.test(navigator.userAgent));

        var shrinkExpand = 0;
        var currentExpand = 0;

        var isLoading = 0;
        var lowRuns = -1;

        var resetPreloading = function (e) {
          isLoading--;
          if (!e || isLoading < 0 || !e.target) {
            isLoading = 0;
          }
        };

        var isVisible = function (elem) {
          if (isBodyHidden == null) {
            isBodyHidden = getCSS(document.body, 'visibility') == 'hidden';
          }

          return isBodyHidden || !(getCSS(elem.parentNode, 'visibility') == 'hidden' && getCSS(elem, 'visibility') == 'hidden');
        };

        var isNestedVisible = function (elem, elemExpand) {
          var outerRect;
          var parent = elem;
          var visible = isVisible(elem);

          eLtop -= elemExpand;
          eLbottom += elemExpand;
          eLleft -= elemExpand;
          eLright += elemExpand;

          while (visible && (parent = parent.offsetParent) && parent != document.body && parent != docElem) {
            visible = ((getCSS(parent, 'opacity') || 1) > 0);

            if (visible && getCSS(parent, 'overflow') != 'visible') {
              outerRect = parent.getBoundingClientRect();
              visible = eLright > outerRect.left &&
                eLleft < outerRect.right &&
                eLbottom > outerRect.top - 1 &&
                eLtop < outerRect.bottom + 1
              ;
            }
          }

          return visible;
        };

        var checkElements = function () {
          var eLlen, i, rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal,
            beforeExpandVal, defaultExpand, preloadExpand, hFac;
          var lazyloadElems = lazysizes.elements;

          if ((loadMode = lazySizesCfg.loadMode) && isLoading < 8 && (eLlen = lazyloadElems.length)) {

            i = 0;

            lowRuns++;

            for (; i < eLlen; i++) {

              if (!lazyloadElems[i] || lazyloadElems[i]._lazyRace) {
                continue;
              }

              if (!supportScroll || (lazysizes.prematureUnveil && lazysizes.prematureUnveil(lazyloadElems[i]))) {
                unveilElement(lazyloadElems[i]);
                continue;
              }

              if (!(elemExpandVal = lazyloadElems[i][_getAttribute]('data-expand')) || !(elemExpand = elemExpandVal * 1)) {
                elemExpand = currentExpand;
              }

              if (!defaultExpand) {
                defaultExpand = (!lazySizesCfg.expand || lazySizesCfg.expand < 1) ?
                  docElem.clientHeight > 500 && docElem.clientWidth > 500 ? 500 : 370 :
                  lazySizesCfg.expand;

                lazysizes._defEx = defaultExpand;

                preloadExpand = defaultExpand * lazySizesCfg.expFactor;
                hFac = lazySizesCfg.hFac;
                isBodyHidden = null;

                if (currentExpand < preloadExpand && isLoading < 1 && lowRuns > 2 && loadMode > 2 && !document.hidden) {
                  currentExpand = preloadExpand;
                  lowRuns = 0;
                } else if (loadMode > 1 && lowRuns > 1 && isLoading < 6) {
                  currentExpand = defaultExpand;
                } else {
                  currentExpand = shrinkExpand;
                }
              }

              if (beforeExpandVal !== elemExpand) {
                eLvW = innerWidth + (elemExpand * hFac);
                elvH = innerHeight + elemExpand;
                elemNegativeExpand = elemExpand * -1;
                beforeExpandVal = elemExpand;
              }

              rect = lazyloadElems[i].getBoundingClientRect();

              if ((eLbottom = rect.bottom) >= elemNegativeExpand &&
                (eLtop = rect.top) <= elvH &&
                (eLright = rect.right) >= elemNegativeExpand * hFac &&
                (eLleft = rect.left) <= eLvW &&
                (eLbottom || eLright || eLleft || eLtop) &&
                (lazySizesCfg.loadHidden || isVisible(lazyloadElems[i])) &&
                ((isCompleted && isLoading < 3 && !elemExpandVal && (loadMode < 3 || lowRuns < 4)) || isNestedVisible(lazyloadElems[i], elemExpand))) {
                unveilElement(lazyloadElems[i]);
                loadedSomething = true;
                if (isLoading > 9) {
                  break;
                }
              } else if (!loadedSomething && isCompleted && !autoLoadElem &&
                isLoading < 4 && lowRuns < 4 && loadMode > 2 &&
                (preloadElems[0] || lazySizesCfg.preloadAfterLoad) &&
                (preloadElems[0] || (!elemExpandVal && ((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[i][_getAttribute](lazySizesCfg.sizesAttr) != 'auto')))) {
                autoLoadElem = preloadElems[0] || lazyloadElems[i];
              }
            }

            if (autoLoadElem && !loadedSomething) {
              unveilElement(autoLoadElem);
            }
          }
        };

        var throttledCheckElements = throttle(checkElements);

        var switchLoadingClass = function (e) {
          var elem = e.target;

          if (elem._lazyCache) {
            delete elem._lazyCache;
            return;
          }

          resetPreloading(e);
          addClass(elem, lazySizesCfg.loadedClass);
          removeClass(elem, lazySizesCfg.loadingClass);
          addRemoveLoadEvents(elem, rafSwitchLoadingClass);
          triggerEvent(elem, 'lazyloaded');
        };
        var rafedSwitchLoadingClass = rAFIt(switchLoadingClass);
        var rafSwitchLoadingClass = function (e) {
          rafedSwitchLoadingClass({target: e.target});
        };

        var changeIframeSrc = function (elem, src) {
          try {
            elem.contentWindow.location.replace(src);
          } catch (e) {
            elem.src = src;
          }
        };

        var handleSources = function (source) {
          var customMedia;

          var sourceSrcset = source[_getAttribute](lazySizesCfg.srcsetAttr);

          if ((customMedia = lazySizesCfg.customMedia[source[_getAttribute]('data-media') || source[_getAttribute]('media')])) {
            source.setAttribute('media', customMedia);
          }

          if (sourceSrcset) {
            source.setAttribute('srcset', sourceSrcset);
          }
        };

        var lazyUnveil = rAFIt(function (elem, detail, isAuto, sizes, isImg) {
          var src, srcset, parent, isPicture, event, firesLoad;

          if (!(event = triggerEvent(elem, 'lazybeforeunveil', detail)).defaultPrevented) {

            if (sizes) {
              if (isAuto) {
                addClass(elem, lazySizesCfg.autosizesClass);
              } else {
                elem.setAttribute('sizes', sizes);
              }
            }

            srcset = elem[_getAttribute](lazySizesCfg.srcsetAttr);
            src = elem[_getAttribute](lazySizesCfg.srcAttr);

            if (isImg) {
              parent = elem.parentNode;
              isPicture = parent && regPicture.test(parent.nodeName || '');
            }

            firesLoad = detail.firesLoad || (('src' in elem) && (srcset || src || isPicture));

            event = {target: elem};

            addClass(elem, lazySizesCfg.loadingClass);

            if (firesLoad) {
              clearTimeout(resetPreloadingTimer);
              resetPreloadingTimer = setTimeout(resetPreloading, 2500);
              addRemoveLoadEvents(elem, rafSwitchLoadingClass, true);
            }

            if (isPicture) {
              forEach.call(parent.getElementsByTagName('source'), handleSources);
            }

            if (srcset) {
              elem.setAttribute('srcset', srcset);
            } else if (src && !isPicture) {
              if (regIframe.test(elem.nodeName)) {
                changeIframeSrc(elem, src);
              } else {
                elem.src = src;
              }
            }

            if (isImg && (srcset || isPicture)) {
              updatePolyfill(elem, {src: src});
            }
          }

          if (elem._lazyRace) {
            delete elem._lazyRace;
          }
          removeClass(elem, lazySizesCfg.lazyClass);

          rAF(function () {
            // Part of this can be removed as soon as this fix is older: https://bugs.chromium.org/p/chromium/issues/detail?id=7731 (2015)
            var isLoaded = elem.complete && elem.naturalWidth > 1;

            if (!firesLoad || isLoaded) {
              if (isLoaded) {
                addClass(elem, 'ls-is-cached');
              }
              switchLoadingClass(event);
              elem._lazyCache = true;
              setTimeout(function () {
                if ('_lazyCache' in elem) {
                  delete elem._lazyCache;
                }
              }, 9);
            }
            if (elem.loading == 'lazy') {
              isLoading--;
            }
          }, true);
        });

        var unveilElement = function (elem) {
          if (elem._lazyRace) {
            return;
          }
          var detail;

          var isImg = regImg.test(elem.nodeName);

          //allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
          var sizes = isImg && (elem[_getAttribute](lazySizesCfg.sizesAttr) || elem[_getAttribute]('sizes'));
          var isAuto = sizes == 'auto';

          if ((isAuto || !isCompleted) && isImg && (elem[_getAttribute]('src') || elem.srcset) && !elem.complete && !hasClass(elem, lazySizesCfg.errorClass) && hasClass(elem, lazySizesCfg.lazyClass)) {
            return;
          }

          detail = triggerEvent(elem, 'lazyunveilread').detail;

          if (isAuto) {
            autoSizer.updateElem(elem, true, elem.offsetWidth);
          }

          elem._lazyRace = true;
          isLoading++;

          lazyUnveil(elem, detail, isAuto, sizes, isImg);
        };

        var afterScroll = debounce(function () {
          lazySizesCfg.loadMode = 3;
          throttledCheckElements();
        });

        var altLoadmodeScrollListner = function () {
          if (lazySizesCfg.loadMode == 3) {
            lazySizesCfg.loadMode = 2;
          }
          afterScroll();
        };

        var onload = function () {
          if (isCompleted) {
            return;
          }
          if (Date.now() - started < 999) {
            setTimeout(onload, 999);
            return;
          }


          isCompleted = true;

          lazySizesCfg.loadMode = 3;

          throttledCheckElements();

          addEventListener('scroll', altLoadmodeScrollListner, true);
        };

        return {
          _: function () {
            started = Date.now();

            lazysizes.elements = document.getElementsByClassName(lazySizesCfg.lazyClass);
            preloadElems = document.getElementsByClassName(lazySizesCfg.lazyClass + ' ' + lazySizesCfg.preloadClass);

            addEventListener('scroll', throttledCheckElements, true);

            addEventListener('resize', throttledCheckElements, true);

            addEventListener('pageshow', function (e) {
              if (e.persisted) {
                var loadingElements = document.querySelectorAll('.' + lazySizesCfg.loadingClass);

                if (loadingElements.length && loadingElements.forEach) {
                  requestAnimationFrame(function () {
                    loadingElements.forEach(function (img) {
                      if (img.complete) {
                        unveilElement(img);
                      }
                    });
                  });
                }
              }
            });

            if (window.MutationObserver) {
              new MutationObserver(throttledCheckElements).observe(docElem, {
                childList: true,
                subtree: true,
                attributes: true
              });
            } else {
              docElem[_addEventListener]('DOMNodeInserted', throttledCheckElements, true);
              docElem[_addEventListener]('DOMAttrModified', throttledCheckElements, true);
              setInterval(throttledCheckElements, 999);
            }

            addEventListener('hashchange', throttledCheckElements, true);

            //, 'fullscreenchange'
            ['focus', 'mouseover', 'click', 'load', 'transitionend', 'animationend'].forEach(function (name) {
              document[_addEventListener](name, throttledCheckElements, true);
            });

            if ((/d$|^c/.test(document.readyState))) {
              onload();
            } else {
              addEventListener('load', onload);
              document[_addEventListener]('DOMContentLoaded', throttledCheckElements);
              setTimeout(onload, 20000);
            }

            if (lazysizes.elements.length) {
              checkElements();
              rAF._lsFlush();
            } else {
              throttledCheckElements();
            }
          },
          checkElems: throttledCheckElements,
          unveil: unveilElement,
          _aLSL: altLoadmodeScrollListner,
        };
      })();


      var autoSizer = (function () {
        var autosizesElems;

        var sizeElement = rAFIt(function (elem, parent, event, width) {
          var sources, i, len;
          elem._lazysizesWidth = width;
          width += 'px';

          elem.setAttribute('sizes', width);

          if (regPicture.test(parent.nodeName || '')) {
            sources = parent.getElementsByTagName('source');
            for (i = 0, len = sources.length; i < len; i++) {
              sources[i].setAttribute('sizes', width);
            }
          }

          if (!event.detail.dataAttr) {
            updatePolyfill(elem, event.detail);
          }
        });
        var getSizeElement = function (elem, dataAttr, width) {
          var event;
          var parent = elem.parentNode;

          if (parent) {
            width = getWidth(elem, parent, width);
            event = triggerEvent(elem, 'lazybeforesizes', {width: width, dataAttr: !!dataAttr});

            if (!event.defaultPrevented) {
              width = event.detail.width;

              if (width && width !== elem._lazysizesWidth) {
                sizeElement(elem, parent, event, width);
              }
            }
          }
        };

        var updateElementsSizes = function () {
          var i;
          var len = autosizesElems.length;
          if (len) {
            i = 0;

            for (; i < len; i++) {
              getSizeElement(autosizesElems[i]);
            }
          }
        };

        var debouncedUpdateElementsSizes = debounce(updateElementsSizes);

        return {
          _: function () {
            autosizesElems = document.getElementsByClassName(lazySizesCfg.autosizesClass);
            addEventListener('resize', debouncedUpdateElementsSizes);
          },
          checkElems: debouncedUpdateElementsSizes,
          updateElem: getSizeElement
        };
      })();

      var init = function () {
        if (!init.i && document.getElementsByClassName) {
          init.i = true;
          autoSizer._();
          loader._();
        }
      };

      setTimeout(function () {
        if (lazySizesCfg.init) {
          init();
        }
      });

      lazysizes = {
        cfg: lazySizesCfg,
        autoSizer: autoSizer,
        loader: loader,
        init: init,
        uP: updatePolyfill,
        aC: addClass,
        rC: removeClass,
        hC: hasClass,
        fire: triggerEvent,
        gW: getWidth,
        rAF: rAF,
      };

      return lazysizes;
    }
  ));

  window.addEventListener("DOMContentLoaded", function () {
    function setCursorPosition(pos, elem) {
      elem.focus();
      if (elem.setSelectionRange) elem.setSelectionRange(pos, pos);
      else if (elem.createTextRange) {
        var range = elem.createTextRange();
        range.collapse(true);
        range.moveEnd("character", pos);
        range.moveStart("character", pos);
        range.select()
      }
    }

    function mask(event) {
      var matrix = "+7 (___) ___ ____",
        i = 0,
        def = matrix.replace(/\D/g, ""),
        val = this.value.replace(/\D/g, "");
      if (def.length >= val.length) val = def;
      this.value = matrix.replace(/./g, function (a) {
        return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a
      });
      if (event.type == "blur") {
        if (this.value.length == 2) this.value = ""
      } else setCursorPosition(this.value.length, this)
    };
    var input = document.querySelector("#telephone");
    input.addEventListener("input", mask, false);
    input.addEventListener("focus", mask, false);
    input.addEventListener("blur", mask, false);
    var inputNumber = document.querySelector("#telephone-number");
    inputNumber.addEventListener("input", mask, false);
    inputNumber.addEventListener("focus", mask, false);
    inputNumber.addEventListener("blur", mask, false);
  });

  // Defaults

  const defaultInstanceSettings = {
    update: null,
    begin: null,
    loopBegin: null,
    changeBegin: null,
    change: null,
    changeComplete: null,
    loopComplete: null,
    complete: null,
    loop: 1,
    direction: 'normal',
    autoplay: true,
    timelineOffset: 0
  }

  const defaultTweenSettings = {
    duration: 1000,
    delay: 0,
    endDelay: 0,
    easing: 'easeOutElastic(1, .5)',
    round: 0
  }

  const validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective'];

// Caching

  const cache = {
    CSS: {},
    springs: {}
  }

// Utils

  function minMax(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function stringContains(str, text) {
    return str.indexOf(text) > -1;
  }

  function applyArguments(func, args) {
    return func.apply(null, args);
  }

  const is = {
    arr: a => Array.isArray(a),
    obj: a => stringContains(Object.prototype.toString.call(a), 'Object'),
    pth: a => is.obj(a) && a.hasOwnProperty('totalLength'),
    svg: a => a instanceof SVGElement,
    inp: a => a instanceof HTMLInputElement,
    dom: a => a.nodeType || is.svg(a),
    str: a => typeof a === 'string',
    fnc: a => typeof a === 'function',
    und: a => typeof a === 'undefined',
    hex: a => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a),
    rgb: a => /^rgb/.test(a),
    hsl: a => /^hsl/.test(a),
    col: a => (is.hex(a) || is.rgb(a) || is.hsl(a)),
    key: a => !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'
  }

// Easings

  function parseEasingParameters(string) {
    const match = /\(([^)]+)\)/.exec(string);
    return match ? match[1].split(',').map(p => parseFloat(p)) : [];
  }

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

  function spring(string, duration) {

    const params = parseEasingParameters(string);
    const mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
    const stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
    const damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
    const velocity =  minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
    const w0 = Math.sqrt(stiffness / mass);
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));
    const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
    const a = 1;
    const b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

    function solver(t) {
      let progress = duration ? (duration * t) / 1000 : t;
      if (zeta < 1) {
        progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
      } else {
        progress = (a + b * progress) * Math.exp(-progress * w0);
      }
      if (t === 0 || t === 1) return t;
      return 1 - progress;
    }

    function getDuration() {
      const cached = cache.springs[string];
      if (cached) return cached;
      const frame = 1/6;
      let elapsed = 0;
      let rest = 0;
      while(true) {
        elapsed += frame;
        if (solver(elapsed) === 1) {
          rest++;
          if (rest >= 16) break;
        } else {
          rest = 0;
        }
      }
      const duration = elapsed * frame * 1000;
      cache.springs[string] = duration;
      return duration;
    }

    return duration ? solver : getDuration;

  }

// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

  function steps(steps = 10) {
    return t => Math.round(t * steps) * (1 / steps);
  }

// BezierEasing https://github.com/gre/bezier-easing

  const bezier = (() => {

    const kSplineTableSize = 11;
    const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 };
    function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 };
    function C(aA1)      { return 3.0 * aA1 };

    function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT };
    function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) };

    function binarySubdivide(aX, aA, aB, mX1, mX2) {
      let currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) { aB = currentT } else { aA = currentT };
      } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
      return currentT;
    }

    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
      for (let i = 0; i < 4; ++i) {
        const currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) return aGuessT;
        const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    }

    function bezier(mX1, mY1, mX2, mY2) {

      if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) return;
      let sampleValues = new Float32Array(kSplineTableSize);

      if (mX1 !== mY1 || mX2 !== mY2) {
        for (let i = 0; i < kSplineTableSize; ++i) {
          sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
      }

      function getTForX(aX) {

        let intervalStart = 0;
        let currentSample = 1;
        const lastSample = kSplineTableSize - 1;

        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }

        --currentSample;

        const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        const guessForT = intervalStart + dist * kSampleStepSize;
        const initialSlope = getSlope(guessForT, mX1, mX2);

        if (initialSlope >= 0.001) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }

      }

      return x => {
        if (mX1 === mY1 && mX2 === mY2) return x;
        if (x === 0 || x === 1) return x;
        return calcBezier(getTForX(x), mY1, mY2);
      }

    }

    return bezier;

  })();

  const penner = (() => {

    // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

    const eases = { linear: () => t => t };

    const functionEasings = {
      Sine: () => t => 1 - Math.cos(t * Math.PI / 2),
      Circ: () => t => 1 - Math.sqrt(1 - t * t),
      Back: () => t => t * t * (3 * t - 2),
      Bounce: () => t => {
        let pow2, b = 4;
        while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {};
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
      },
      Elastic: (amplitude = 1, period = .5) => {
        const a = minMax(amplitude, 1, 10);
        const p = minMax(period, .1, 2);
        return t => {
          return (t === 0 || t === 1) ? t :
            -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
        }
      }
    }

    const baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

    baseEasings.forEach((name, i) => {
      functionEasings[name] = () => t => Math.pow(t, i + 2);
    });

    Object.keys(functionEasings).forEach(name => {
      const easeIn = functionEasings[name];
      eases['easeIn' + name] = easeIn;
      eases['easeOut' + name] = (a, b) => t => 1 - easeIn(a, b)(1 - t);
      eases['easeInOut' + name] = (a, b) => t => t < 0.5 ? easeIn(a, b)(t * 2) / 2 :
        1 - easeIn(a, b)(t * -2 + 2) / 2;
    });

    return eases;

  })();

  function parseEasings(easing, duration) {
    if (is.fnc(easing)) return easing;
    const name = easing.split('(')[0];
    const ease = penner[name];
    const args = parseEasingParameters(easing);
    switch (name) {
      case 'spring' : return spring(easing, duration);
      case 'cubicBezier' : return applyArguments(bezier, args);
      case 'steps' : return applyArguments(steps, args);
      default : return applyArguments(ease, args);
    }
  }

// Strings

  function selectString(str) {
    try {
      let nodes = document.querySelectorAll(str);
      return nodes;
    } catch(e) {
      return;
    }
  }

// Arrays

  function filterArray(arr, callback) {
    const len = arr.length;
    const thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    const result = [];
    for (let i = 0; i < len; i++) {
      if (i in arr) {
        const val = arr[i];
        if (callback.call(thisArg, val, i, arr)) {
          result.push(val);
        }
      }
    }
    return result;
  }

  function flattenArray(arr) {
    return arr.reduce((a, b) => a.concat(is.arr(b) ? flattenArray(b) : b), []);
  }

  function toArray(o) {
    if (is.arr(o)) return o;
    if (is.str(o)) o = selectString(o) || o;
    if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
    return [o];
  }

  function arrayContains(arr, val) {
    return arr.some(a => a === val);
  }

// Objects

  function cloneObject(o) {
    const clone = {};
    for (let p in o) clone[p] = o[p];
    return clone;
  }

  function replaceObjectProps(o1, o2) {
    const o = cloneObject(o1);
    for (let p in o1) o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
    return o;
  }

  function mergeObjects(o1, o2) {
    const o = cloneObject(o1);
    for (let p in o2) o[p] = is.und(o1[p]) ? o2[p] : o1[p];
    return o;
  }

// Colors

  function rgbToRgba(rgbValue) {
    const rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
    return rgb ? `rgba(${rgb[1]},1)` : rgbValue;
  }

  function hexToRgba(hexValue) {
    const rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const hex = hexValue.replace(rgx, (m, r, g, b) => r + r + g + g + b + b );
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);
    return `rgba(${r},${g},${b},1)`;
  }

  function hslToRgba(hslValue) {
    const hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
    const h = parseInt(hsl[1], 10) / 360;
    const s = parseInt(hsl[2], 10) / 100;
    const l = parseInt(hsl[3], 10) / 100;
    const a = hsl[4] || 1;
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    let r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return `rgba(${r * 255},${g * 255},${b * 255},${a})`;
  }

  function colorToRgb(val) {
    if (is.rgb(val)) return rgbToRgba(val);
    if (is.hex(val)) return hexToRgba(val);
    if (is.hsl(val)) return hslToRgba(val);
  }

// Units

  function getUnit(val) {
    const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
    if (split) return split[1];
  }

  function getTransformUnit(propName) {
    if (stringContains(propName, 'translate') || propName === 'perspective') return 'px';
    if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) return 'deg';
  }

// Values

  function getFunctionValue(val, animatable) {
    if (!is.fnc(val)) return val;
    return val(animatable.target, animatable.id, animatable.total);
  }

  function getAttribute(el, prop) {
    return el.getAttribute(prop);
  }

  function convertPxToUnit(el, value, unit) {
    const valueUnit = getUnit(value);
    if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) return value;
    const cached = cache.CSS[value + unit];
    if (!is.und(cached)) return cached;
    const baseline = 100;
    const tempEl = document.createElement(el.tagName);
    const parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
    parentEl.appendChild(tempEl);
    tempEl.style.position = 'absolute';
    tempEl.style.width = baseline + unit;
    const factor = baseline / tempEl.offsetWidth;
    parentEl.removeChild(tempEl);
    const convertedUnit = factor * parseFloat(value);
    cache.CSS[value + unit] = convertedUnit;
    return convertedUnit;
  }

  function getCSSValue(el, prop, unit) {
    if (prop in el.style) {
      const uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      const value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
      return unit ? convertPxToUnit(el, value, unit) : value;
    }
  }

  function getAnimationType(el, prop) {
    if (is.dom(el) && !is.inp(el) && (getAttribute(el, prop) || (is.svg(el) && el[prop]))) return 'attribute';
    if (is.dom(el) && arrayContains(validTransforms, prop)) return 'transform';
    if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) return 'css';
    if (el[prop] != null) return 'object';
  }

  function getElementTransforms(el) {
    if (!is.dom(el)) return;
    const str = el.style.transform || '';
    const reg  = /(\w+)\(([^)]*)\)/g;
    const transforms = new Map();
    let m; while (m = reg.exec(str)) transforms.set(m[1], m[2]);
    return transforms;
  }

  function getTransformValue(el, propName, animatable, unit) {
    const defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
    const value = getElementTransforms(el).get(propName) || defaultVal;
    if (animatable) {
      animatable.transforms.list.set(propName, value);
      animatable.transforms['last'] = propName;
    }
    return unit ? convertPxToUnit(el, value, unit) : value;
  }

  function getOriginalTargetValue(target, propName, unit, animatable) {
    switch (getAnimationType(target, propName)) {
      case 'transform': return getTransformValue(target, propName, animatable, unit);
      case 'css': return getCSSValue(target, propName, unit);
      case 'attribute': return getAttribute(target, propName);
      default: return target[propName] || 0;
    }
  }

  function getRelativeValue(to, from) {
    const operator = /^(\*=|\+=|-=)/.exec(to);
    if (!operator) return to;
    const u = getUnit(to) || 0;
    const x = parseFloat(from);
    const y = parseFloat(to.replace(operator[0], ''));
    switch (operator[0][0]) {
      case '+': return x + y + u;
      case '-': return x - y + u;
      case '*': return x * y + u;
    }
  }

  function validateValue(val, unit) {
    if (is.col(val)) return colorToRgb(val);
    if (/\s/g.test(val)) return val;
    const originalUnit = getUnit(val);
    const unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
    if (unit) return unitLess + unit;
    return unitLess;
  }

// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

  function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  function getCircleLength(el) {
    return Math.PI * 2 * getAttribute(el, 'r');
  }

  function getRectLength(el) {
    return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
  }

  function getLineLength(el) {
    return getDistance(
      {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')},
      {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
    );
  }

  function getPolylineLength(el) {
    const points = el.points;
    let totalLength = 0;
    let previousPos;
    for (let i = 0 ; i < points.numberOfItems; i++) {
      const currentPos = points.getItem(i);
      if (i > 0) totalLength += getDistance(previousPos, currentPos);
      previousPos = currentPos;
    }
    return totalLength;
  }

  function getPolygonLength(el) {
    const points = el.points;
    return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
  }

// Path animation

  function getTotalLength(el) {
    if (el.getTotalLength) return el.getTotalLength();
    switch(el.tagName.toLowerCase()) {
      case 'circle': return getCircleLength(el);
      case 'rect': return getRectLength(el);
      case 'line': return getLineLength(el);
      case 'polyline': return getPolylineLength(el);
      case 'polygon': return getPolygonLength(el);
    }
  }

  function setDashoffset(el) {
    const pathLength = getTotalLength(el);
    el.setAttribute('stroke-dasharray', pathLength);
    return pathLength;
  }

// Motion path

  function getParentSvgEl(el) {
    let parentEl = el.parentNode;
    while (is.svg(parentEl)) {
      if (!is.svg(parentEl.parentNode)) break;
      parentEl = parentEl.parentNode;
    }
    return parentEl;
  }

  function getParentSvg(pathEl, svgData) {
    const svg = svgData || {};
    const parentSvgEl = svg.el || getParentSvgEl(pathEl);
    const rect = parentSvgEl.getBoundingClientRect();
    const viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
    const width = rect.width;
    const height = rect.height;
    const viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
    return {
      el: parentSvgEl,
      viewBox: viewBox,
      x: viewBox[0] / 1,
      y: viewBox[1] / 1,
      w: width / viewBox[2],
      h: height / viewBox[3]
    }
  }

  function getPath(path, percent) {
    const pathEl = is.str(path) ? selectString(path)[0] : path;
    const p = percent || 100;
    return function(property) {
      return {
        property,
        el: pathEl,
        svg: getParentSvg(pathEl),
        totalLength: getTotalLength(pathEl) * (p / 100)
      }
    }
  }

  function getPathProgress(path, progress) {
    function point(offset = 0) {
      const l = progress + offset >= 1 ? progress + offset : 0;
      return path.el.getPointAtLength(l);
    }
    const svg = getParentSvg(path.el, path.svg)
    const p = point();
    const p0 = point(-1);
    const p1 = point(+1);
    switch (path.property) {
      case 'x': return (p.x - svg.x) * svg.w;
      case 'y': return (p.y - svg.y) * svg.h;
      case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
    }
  }

// Decompose value

  function decomposeValue(val, unit) {
    // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
    // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
    const rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
    const value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
    return {
      original: value,
      numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
      strings: (is.str(val) || unit) ? value.split(rgx) : []
    }
  }

// Animatables

  function parseTargets(targets) {
    const targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
    return filterArray(targetsArray, (item, pos, self) => self.indexOf(item) === pos);
  }

  function getAnimatables(targets) {
    const parsed = parseTargets(targets);
    return parsed.map((t, i) => {
      return {target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
    });
  }

// Properties

  function normalizePropertyTweens(prop, tweenSettings) {
    let settings = cloneObject(tweenSettings);
    // Override duration if easing is a spring
    if (/^spring/.test(settings.easing)) settings.duration = spring(settings.easing);
    if (is.arr(prop)) {
      const l = prop.length;
      const isFromTo = (l === 2 && !is.obj(prop[0]));
      if (!isFromTo) {
        // Duration divided by the number of tweens
        if (!is.fnc(tweenSettings.duration)) settings.duration = tweenSettings.duration / l;
      } else {
        // Transform [from, to] values shorthand to a valid tween value
        prop = {value: prop};
      }
    }
    const propArray = is.arr(prop) ? prop : [prop];
    return propArray.map((v, i) => {
      const obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
      // Default delay value should only be applied to the first tween
      if (is.und(obj.delay)) obj.delay = !i ? tweenSettings.delay : 0;
      // Default endDelay value should only be applied to the last tween
      if (is.und(obj.endDelay)) obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0;
      return obj;
    }).map(k => mergeObjects(k, settings));
  }


  function flattenKeyframes(keyframes) {
    const propertyNames = filterArray(flattenArray(keyframes.map(key => Object.keys(key))), p => is.key(p))
      .reduce((a,b) => { if (a.indexOf(b) < 0) a.push(b); return a; }, []);
    const properties = {};
    for (let i = 0; i < propertyNames.length; i++) {
      const propName = propertyNames[i];
      properties[propName] = keyframes.map(key => {
        const newKey = {};
        for (let p in key) {
          if (is.key(p)) {
            if (p == propName) newKey.value = key[p];
          } else {
            newKey[p] = key[p];
          }
        }
        return newKey;
      });
    }
    return properties;
  }

  function getProperties(tweenSettings, params) {
    const properties = [];
    const keyframes = params.keyframes;
    if (keyframes) params = mergeObjects(flattenKeyframes(keyframes), params);;
    for (let p in params) {
      if (is.key(p)) {
        properties.push({
          name: p,
          tweens: normalizePropertyTweens(params[p], tweenSettings)
        });
      }
    }
    return properties;
  }

// Tweens

  function normalizeTweenValues(tween, animatable) {
    const t = {};
    for (let p in tween) {
      let value = getFunctionValue(tween[p], animatable);
      if (is.arr(value)) {
        value = value.map(v => getFunctionValue(v, animatable));
        if (value.length === 1) value = value[0];
      }
      t[p] = value;
    }
    t.duration = parseFloat(t.duration);
    t.delay = parseFloat(t.delay);
    return t;
  }

  function normalizeTweens(prop, animatable) {
    let previousTween;
    return prop.tweens.map(t => {
      const tween = normalizeTweenValues(t, animatable);
      const tweenValue = tween.value;
      let to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
      const toUnit = getUnit(to);
      const originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
      const previousValue = previousTween ? previousTween.to.original : originalValue;
      const from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
      const fromUnit = getUnit(from) || getUnit(originalValue);
      const unit = toUnit || fromUnit;
      if (is.und(to)) to = previousValue;
      tween.from = decomposeValue(from, unit);
      tween.to = decomposeValue(getRelativeValue(to, from), unit);
      tween.start = previousTween ? previousTween.end : 0;
      tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
      tween.easing = parseEasings(tween.easing, tween.duration);
      tween.isPath = is.pth(tweenValue);
      tween.isColor = is.col(tween.from.original);
      if (tween.isColor) tween.round = 1;
      previousTween = tween;
      return tween;
    });
  }

// Tween progress

  const setProgressValue = {
    css: (t, p, v) => t.style[p] = v,
    attribute: (t, p, v) => t.setAttribute(p, v),
    object: (t, p, v) => t[p] = v,
    transform: (t, p, v, transforms, manual) => {
      transforms.list.set(p, v);
      if (p === transforms.last || manual) {
        let str = '';
        transforms.list.forEach((value, prop) => { str += `${prop}(${value}) `; });
        t.style.transform = str;
      }
    }
  }

// Set Value helper

  function setTargetsValue(targets, properties) {
    const animatables = getAnimatables(targets);
    animatables.forEach(animatable => {
      for (let property in properties) {
        const value = getFunctionValue(properties[property], animatable);
        const target = animatable.target;
        const valueUnit = getUnit(value);
        const originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
        const unit = valueUnit || getUnit(originalValue);
        const to = getRelativeValue(validateValue(value, unit), originalValue);
        const animType = getAnimationType(target, property);
        setProgressValue[animType](target, property, to, animatable.transforms, true);
      }
    });
  }

// Animations

  function createAnimation(animatable, prop) {
    const animType = getAnimationType(animatable.target, prop.name);
    if (animType) {
      const tweens = normalizeTweens(prop, animatable);
      const lastTween = tweens[tweens.length - 1];
      return {
        type: animType,
        property: prop.name,
        animatable: animatable,
        tweens: tweens,
        duration: lastTween.end,
        delay: tweens[0].delay,
        endDelay: lastTween.endDelay
      }
    }
  }

  function getAnimations(animatables, properties) {
    return filterArray(flattenArray(animatables.map(animatable => {
      return properties.map(prop => {
        return createAnimation(animatable, prop);
      });
    })), a => !is.und(a));
  }

// Create Instance

  function getInstanceTimings(animations, tweenSettings) {
    const animLength = animations.length;
    const getTlOffset = anim => anim.timelineOffset ? anim.timelineOffset : 0;
    const timings = {};
    timings.duration = animLength ? Math.max.apply(Math, animations.map(anim => getTlOffset(anim) + anim.duration)) : tweenSettings.duration;
    timings.delay = animLength ? Math.min.apply(Math, animations.map(anim => getTlOffset(anim) + anim.delay)) : tweenSettings.delay;
    timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(anim => getTlOffset(anim) + anim.duration - anim.endDelay)) : tweenSettings.endDelay;
    return timings;
  }

  let instanceID = 0;

  function createNewInstance(params) {
    const instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
    const tweenSettings = replaceObjectProps(defaultTweenSettings, params);
    const properties = getProperties(tweenSettings, params);
    const animatables = getAnimatables(params.targets);
    const animations = getAnimations(animatables, properties);
    const timings = getInstanceTimings(animations, tweenSettings);
    const id = instanceID;
    instanceID++;
    return mergeObjects(instanceSettings, {
      id: id,
      children: [],
      animatables: animatables,
      animations: animations,
      duration: timings.duration,
      delay: timings.delay,
      endDelay: timings.endDelay
    });
  }

// Core

  let activeInstances = [];
  let pausedInstances = [];
  let raf;

  const engine = (() => {
    function play() {
      raf = requestAnimationFrame(step);
    }
    function step(t) {
      let activeInstancesLength = activeInstances.length;
      if (activeInstancesLength) {
        let i = 0;
        while (i < activeInstancesLength) {
          const activeInstance = activeInstances[i];
          if (!activeInstance.paused) {
            activeInstance.tick(t);
          } else {
            const instanceIndex = activeInstances.indexOf(activeInstance);
            if (instanceIndex > -1) {
              activeInstances.splice(instanceIndex, 1);
              activeInstancesLength = activeInstances.length;
            }
          }
          i++;
        }
        play();
      } else {
        raf = cancelAnimationFrame(raf);
      }
    }
    return play;
  })();

  function handleVisibilityChange() {
    if (document.hidden) {
      activeInstances.forEach(ins => ins.pause());
      pausedInstances = activeInstances.slice(0);
      anime.running = activeInstances = [];
    } else {
      pausedInstances.forEach(ins => ins.play());
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

// Public Instance

  function anime(params = {}) {

    let startTime = 0, lastTime = 0, now = 0;
    let children, childrenLength = 0;
    let resolve = null;

    function makePromise(instance) {
      const promise = window.Promise && new Promise(_resolve => resolve = _resolve);
      instance.finished = promise;
      return promise;
    }

    let instance = createNewInstance(params);
    let promise = makePromise(instance);

    function toggleInstanceDirection() {
      const direction = instance.direction;
      if (direction !== 'alternate') {
        instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
      }
      instance.reversed = !instance.reversed;
      children.forEach(child => child.reversed = instance.reversed);
    }

    function adjustTime(time) {
      return instance.reversed ? instance.duration - time : time;
    }

    function resetTime() {
      startTime = 0;
      lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
    }

    function seekChild(time, child) {
      if (child) child.seek(time - child.timelineOffset);
    }

    function syncInstanceChildren(time) {
      if (!instance.reversePlayback) {
        for (let i = 0; i < childrenLength; i++) seekChild(time, children[i]);
      } else {
        for (let i = childrenLength; i--;) seekChild(time, children[i]);
      }
    }

    function setAnimationsProgress(insTime) {
      let i = 0;
      const animations = instance.animations;
      const animationsLength = animations.length;
      while (i < animationsLength) {
        const anim = animations[i];
        const animatable = anim.animatable;
        const tweens = anim.tweens;
        const tweenLength = tweens.length - 1;
        let tween = tweens[tweenLength];
        // Only check for keyframes if there is more than one tween
        if (tweenLength) tween = filterArray(tweens, t => (insTime < t.end))[0] || tween;
        const elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
        const eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
        const strings = tween.to.strings;
        const round = tween.round;
        const numbers = [];
        const toNumbersLength = tween.to.numbers.length;
        let progress;
        for (let n = 0; n < toNumbersLength; n++) {
          let value;
          const toNumber = tween.to.numbers[n];
          const fromNumber = tween.from.numbers[n] || 0;
          if (!tween.isPath) {
            value = fromNumber + (eased * (toNumber - fromNumber));
          } else {
            value = getPathProgress(tween.value, eased * toNumber);
          }
          if (round) {
            if (!(tween.isColor && n > 2)) {
              value = Math.round(value * round) / round;
            }
          }
          numbers.push(value);
        }
        // Manual Array.reduce for better performances
        const stringsLength = strings.length;
        if (!stringsLength) {
          progress = numbers[0];
        } else {
          progress = strings[0];
          for (let s = 0; s < stringsLength; s++) {
            const a = strings[s];
            const b = strings[s + 1];
            const n = numbers[s];
            if (!isNaN(n)) {
              if (!b) {
                progress += n + ' ';
              } else {
                progress += n + b;
              }
            }
          }
        }
        setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
        anim.currentValue = progress;
        i++;
      }
    }

    function setCallback(cb) {
      if (instance[cb] && !instance.passThrough) instance[cb](instance);
    }

    function countIteration() {
      if (instance.remaining && instance.remaining !== true) {
        instance.remaining--;
      }
    }

    function setInstanceProgress(engineTime) {
      const insDuration = instance.duration;
      const insDelay = instance.delay;
      const insEndDelay = insDuration - instance.endDelay;
      const insTime = adjustTime(engineTime);
      instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
      instance.reversePlayback = insTime < instance.currentTime;
      if (children) { syncInstanceChildren(insTime); }
      if (!instance.began && instance.currentTime > 0) {
        instance.began = true;
        setCallback('begin');
      }
      if (!instance.loopBegan && instance.currentTime > 0) {
        instance.loopBegan = true;
        setCallback('loopBegin');
      }
      if (insTime <= insDelay && instance.currentTime !== 0) {
        setAnimationsProgress(0);
      }
      if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
        setAnimationsProgress(insDuration);
      }
      if (insTime > insDelay && insTime < insEndDelay) {
        if (!instance.changeBegan) {
          instance.changeBegan = true;
          instance.changeCompleted = false;
          setCallback('changeBegin');
        }
        setCallback('change');
        setAnimationsProgress(insTime);
      } else {
        if (instance.changeBegan) {
          instance.changeCompleted = true;
          instance.changeBegan = false;
          setCallback('changeComplete');
        }
      }
      instance.currentTime = minMax(insTime, 0, insDuration);
      if (instance.began) setCallback('update');
      if (engineTime >= insDuration) {
        lastTime = 0;
        countIteration();
        if (!instance.remaining) {
          instance.paused = true;
          if (!instance.completed) {
            instance.completed = true;
            setCallback('loopComplete');
            setCallback('complete');
            if (!instance.passThrough && 'Promise' in window) {
              resolve();
              promise = makePromise(instance);
            }
          }
        } else {
          startTime = now;
          setCallback('loopComplete');
          instance.loopBegan = false;
          if (instance.direction === 'alternate') {
            toggleInstanceDirection();
          }
        }
      }
    }

    instance.reset = function() {
      const direction = instance.direction;
      instance.passThrough = false;
      instance.currentTime = 0;
      instance.progress = 0;
      instance.paused = true;
      instance.began = false;
      instance.loopBegan = false;
      instance.changeBegan = false;
      instance.completed = false;
      instance.changeCompleted = false;
      instance.reversePlayback = false;
      instance.reversed = direction === 'reverse';
      instance.remaining = instance.loop;
      children = instance.children;
      childrenLength = children.length;
      for (let i = childrenLength; i--;) instance.children[i].reset();
      if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) instance.remaining++;
      setAnimationsProgress(instance.reversed ? instance.duration : 0);
    }

    // Set Value helper

    instance.set = function(targets, properties) {
      setTargetsValue(targets, properties);
      return instance;
    }

    instance.tick = function(t) {
      now = t;
      if (!startTime) startTime = now;
      setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
    }

    instance.seek = function(time) {
      setInstanceProgress(adjustTime(time));
    }

    instance.pause = function() {
      instance.paused = true;
      resetTime();
    }

    instance.play = function() {
      if (!instance.paused) return;
      if (instance.completed) instance.reset();
      instance.paused = false;
      activeInstances.push(instance);
      resetTime();
      if (!raf) engine();
    }

    instance.reverse = function() {
      toggleInstanceDirection();
      resetTime();
    }

    instance.restart = function() {
      instance.reset();
      instance.play();
    }

    instance.reset();

    if (instance.autoplay) instance.play();

    return instance;

  }

// Remove targets from animation

  function removeTargetsFromAnimations(targetsArray, animations) {
    for (let a = animations.length; a--;) {
      if (arrayContains(targetsArray, animations[a].animatable.target)) {
        animations.splice(a, 1);
      }
    }
  }

  function removeTargets(targets) {
    const targetsArray = parseTargets(targets);
    for (let i = activeInstances.length; i--;) {
      const instance = activeInstances[i];
      const animations = instance.animations;
      const children = instance.children;
      removeTargetsFromAnimations(targetsArray, animations);
      for (let c = children.length; c--;) {
        const child = children[c];
        const childAnimations = child.animations;
        removeTargetsFromAnimations(targetsArray, childAnimations);
        if (!childAnimations.length && !child.children.length) children.splice(c, 1);
      }
      if (!animations.length && !children.length) instance.pause();
    }
  }

// Stagger helpers

  function stagger(val, params = {}) {
    const direction = params.direction || 'normal';
    const easing = params.easing ? parseEasings(params.easing) : null;
    const grid = params.grid;
    const axis = params.axis;
    let fromIndex = params.from || 0;
    const fromFirst = fromIndex === 'first';
    const fromCenter = fromIndex === 'center';
    const fromLast = fromIndex === 'last';
    const isRange = is.arr(val);
    const val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
    const val2 = isRange ? parseFloat(val[1]) : 0;
    const unit = getUnit(isRange ? val[1] : val) || 0;
    const start = params.start || 0 + (isRange ? val1 : 0);
    let values = [];
    let maxValue = 0;
    return (el, i, t) => {
      if (fromFirst) fromIndex = 0;
      if (fromCenter) fromIndex = (t - 1) / 2;
      if (fromLast) fromIndex = t - 1;
      if (!values.length) {
        for (let index = 0; index < t; index++) {
          if (!grid) {
            values.push(Math.abs(fromIndex - index));
          } else {
            const fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
            const fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
            const toX = index%grid[0];
            const toY = Math.floor(index/grid[0]);
            const distanceX = fromX - toX;
            const distanceY = fromY - toY;
            let value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            if (axis === 'x') value = -distanceX;
            if (axis === 'y') value = -distanceY;
            values.push(value);
          }
          maxValue = Math.max(...values);
        }
        if (easing) values = values.map(val => easing(val / maxValue) * maxValue);
        if (direction === 'reverse') values = values.map(val => axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val));
      }
      const spacing = isRange ? (val2 - val1) / maxValue : val1;
      return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
    }
  }

// Timeline

  function timeline(params = {}) {
    let tl = anime(params);
    tl.duration = 0;
    tl.add = function(instanceParams, timelineOffset) {
      const tlIndex = activeInstances.indexOf(tl);
      const children = tl.children;
      if (tlIndex > -1) activeInstances.splice(tlIndex, 1);
      function passThrough(ins) { ins.passThrough = true; };
      for (let i = 0; i < children.length; i++) passThrough(children[i]);
      let insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
      insParams.targets = insParams.targets || params.targets;
      const tlDuration = tl.duration;
      insParams.autoplay = false;
      insParams.direction = tl.direction;
      insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
      passThrough(tl);
      tl.seek(insParams.timelineOffset);
      const ins = anime(insParams);
      passThrough(ins);
      const totalDuration = ins.duration + insParams.timelineOffset;
      children.push(ins);
      const timings = getInstanceTimings(children, params);
      tl.delay = timings.delay;
      tl.endDelay = timings.endDelay;
      tl.duration = timings.duration;
      tl.seek(0);
      tl.reset();
      if (tl.autoplay) tl.play();
      return tl;
    }
    return tl;
  }

  anime.version = '3.1.0';
  anime.speed = 1;
  anime.running = activeInstances;
  anime.remove = removeTargets;
  anime.get = getOriginalTargetValue;
  anime.set = setTargetsValue;
  anime.convertPx = convertPxToUnit;
  anime.path = getPath;
  anime.setDashoffset = setDashoffset;
  anime.stagger = stagger;
  anime.timeline = timeline;
  anime.easing = parseEasings;
  anime.penner = penner;
  anime.random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const button = document.querySelector('.page-header__scroll');
  const buttonScroll = document.querySelector('.page-header__button');
  const scrollElement = window.document.scrollingElement || window.document.body || window.document.documentElement;
  button.addEventListener('click', () => {
    // use anime.js
    anime({
      targets: scrollElement,
      scrollTop: document.querySelector('.about-company__information').offsetTop,
      duration: 1000,
      easing: 'easeInOutQuad'
    });
  });
  buttonScroll.addEventListener('click', () => {
    // use anime.js
    anime({
      targets: scrollElement,
      scrollTop: document.querySelector('.page-footer').offsetTop,
      duration: 2500,
      easing: 'easeInOutQuad'
    });
  });
})();
