/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */
(function(factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        var g = window.Granite = window.Granite || {};
        g.Sling = factory();
    }
}(function() {
    "use strict";

    /**
     * A helper class providing a set of Sling-related utilities.
     * @static
     * @singleton
     * @class Granite.Sling
     */
    return {
        /**
         * The selector for infinite hierarchy depth when retrieving repository content.
         * @static
         * @final
         * @type String
         */
        SELECTOR_INFINITY: ".infinity",

        /**
         * The parameter name for the used character set.
         * @static
         * @final
         * @type String
         */
        CHARSET: "_charset_",

        /**
         * The parameter name for the status.
         * @static
         * @final
         * @type String
         */
        STATUS: ":status",

        /**
         * The parameter value for the status type "browser".
         * @static
         * @final
         * @type String
         */
        STATUS_BROWSER: "browser",

        /**
         * The parameter name for the operation.
         * @static
         * @final
         * @type String
         */
        OPERATION: ":operation",

        /**
         * The parameter value for the delete operation.
         * @static
         * @final
         * @type String
         */
        OPERATION_DELETE: "delete",

        /**
         * The parameter value for the move operation.
         * @static
         * @final
         * @type String
         */
        OPERATION_MOVE: "move",

        /**
         * The parameter name suffix for deleting.
         * @static
         * @final
         * @type String
         */
        DELETE_SUFFIX: "@Delete",

        /**
         * The parameter name suffix for setting a type hint.
         * @static
         * @final
         * @type String
         */
        TYPEHINT_SUFFIX: "@TypeHint",

        /**
         * The parameter name suffix for copying.
         * @static
         * @final
         * @type String
         */
        COPY_SUFFIX: "@CopyFrom",

        /**
         * The parameter name suffix for moving.
         * @static
         * @final
         * @type String
         */
        MOVE_SUFFIX: "@MoveFrom",

        /**
         * The parameter name for the ordering.
         * @static
         * @final
         * @type String
         */
        ORDER: ":order",

        /**
         * The parameter name for the replace flag.
         * @static
         * @final
         * @type String
         */
        REPLACE: ":replace",

        /**
         * The parameter name for the destination flag.
         * @static
         * @final
         * @type String
         */
        DESTINATION: ":dest",

        /**
         * The parameter name for the save parameter prefix.
         * @static
         * @final
         * @type String
         */
        SAVE_PARAM_PREFIX: ":saveParamPrefix",

        /**
         * The parameter name for input fields that should be ignored by Sling.
         * @static
         * @final
         * @type String
         */
        IGNORE_PARAM: ":ignore",

        /**
         * The parameter name for login requests.
         * @static
         * @final
         * @type String
         */
        REQUEST_LOGIN_PARAM: "sling:authRequestLogin",

        /**
         * The login URL.
         * @static
         * @final
         * @type String
         */
        LOGIN_URL: "/system/sling/login.html",

        /**
         * The logout URL.
         * @static
         * @final
         * @type String
         */
        LOGOUT_URL: "/system/sling/logout.html"
    };
}));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */
(function(factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        var g = window.Granite = window.Granite || {};
        g.Util = factory();
    }
}(function() {
    "use strict";

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Polyfill
    var isArray = function(arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    };

    /**
     * A helper class providing a set of general utilities.
     * @static
     * @singleton
     * @class Granite.Util
     */
    return {
        /**
         * Replaces occurrences of <code>{n}</code> in the specified text with the texts from the snippets.
         *
         * @example
         * var text = Granite.Util.patchText("{0} has signed in.", "Jack");
         * // text = "Jack has signed in."
         * var text2 = Granite.Util.patchText("{0} {1} has signed in from {2}.", ["Jack", "McFarland", "x.x.x.x"]);
         * // text2 = "Jack McFarland has signed in from x.x.x.x."
         *
         * @param {String} text The text.
         * @param {String|String[]} snippets The text(s) replacing <code>{n}</code>.
         * @returns {String} The patched text.
         */
        patchText: function(text, snippets) {
            if (snippets) {
                if (!isArray(snippets)) {
                    text = text.replace("{0}", snippets);
                } else {
                    for (var i = 0; i < snippets.length; i++) {
                        text = text.replace(("{" + i + "}"), snippets[i]);
                    }
                }
            }
            return text;
        },

        /**
         * Returns the top most accessible window.
         * Check {@link .setIFrameMode} to avoid security exception message on WebKit browsers
         * if this method is called in an iFrame included in a window from different domain.
         *
         * @returns {Window} The top window.
         */
        getTopWindow: function() {
            var win = window;
            if (this.iFrameTopWindow) {
                return this.iFrameTopWindow;
            }
            try {
                // try to access parent
                // win.parent.location.href throws an exception if not authorized (e.g. different location in a portlet)
                while (win.parent && win !== win.parent && win.parent.location.href) {
                    win = win.parent;
                }
            } catch (error) {
                // ignored
            }
            return win;
        },

        /**
         * Allows to define if Granite.Util is running in an iFrame and parent window is in another domain
         * (and optionally define what would be the top window in that case.
         * This is necessary to use {@link .getTopWindow} in a iFrame on WebKit based browsers because
         * {@link .getTopWindow} iterates on parent windows to find the top one which triggers a security exception
         * if one parent window is in a different domain. Exception cannot be caught but is not breaking the JS
         * execution.
         *
         * @param {Window} [topWindow=window] The iFrame top window. Must be running on the same host to avoid
         * security exception.
         */
        setIFrameMode: function(topWindow) {
            this.iFrameTopWindow = topWindow || window;
        },

        /**
         * Applies default properties if non-existent into the base object.
         * Child objects are merged recursively.
         * REMARK:
         *   - objects are recursively merged
         *   - simple type object properties are copied over the base
         *   - arrays are cloned and override the base (no value merging)
         *
         * @param {Object} base The object.
         * @param {...Object} pass The objects to be copied onto the base.
         * @returns {Object} The base object with defaults.
         */
        applyDefaults: function() {
            var override;
            var base = arguments[0] || {};

            for (var i = 1; i < arguments.length; i++) {
                override = arguments[i];

                for (var name in override) {
                    var value = override[name];

                    if (override.hasOwnProperty(name) && value !== undefined) {
                        if (value !== null && typeof value === "object" && !(value instanceof Array)) {
                            // nested object
                            base[name] = this.applyDefaults(base[name], value);
                        } else if (value instanceof Array) {
                            // override array
                            base[name] = value.slice(0);
                        } else {
                            // simple type
                            base[name] = value;
                        }
                    }
                }
            }

            return base;
        },

        /**
         * Returns the keycode from the given event.
         * It is a normalized value over variation of browsers' inconsistencies.
         *
         * @param {UIEvent} event The event.
         * @returns {Number} The keycode.
         */
        getKeyCode: function(event) {
            return event.keyCode ? event.keyCode : event.which;
        }
    };
}));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */
/* global CQURLInfo:false, G_XHR_HOOK:false */
/* eslint strict: 0 */
(function(factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("@granite/util"), require("jquery"));
    } else {
        window.Granite.HTTP = factory(Granite.Util, jQuery);
    }
}(function(util, $) {
    /**
     * A helper class providing a set of HTTP-related utilities.
     * @static
     * @singleton
     * @class Granite.HTTP
     */
    return (function() {
        /**
         * The context path used on the server.
         * May only be set by {@link #detectContextPath}.
         * @type String
         */
        var contextPath = null;

        /**
         * The regular expression to detect the context path used
         * on the server using the URL of this script.
         * @readonly
         * @type RegExp
         */
        // eslint-disable-next-line max-len
        var SCRIPT_URL_REGEXP = /^(?:http|https):\/\/[^/]+(\/.*)\/(?:etc\.clientlibs|etc(\/.*)*\/clientlibs|libs(\/.*)*\/clientlibs|apps(\/.*)*\/clientlibs|etc\/designs).*\.js(\?.*)?$/;

        /**
         * The regular expression to match `#` and other non-ASCII characters in a URI.
         * @readonly
         * @type RegExp
         */
        var ENCODE_PATH_REGEXP = /[^\w-.~%:/?[\]@!$&'()*+,;=]/;

        /**
         * The regular expression to parse URI.
         * @readonly
         * @type RegExp
         * @see https://tools.ietf.org/html/rfc3986#appendix-B
         */
        var URI_REGEXP = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

        /**
         * Indicates after a session timeout if a refresh has already been triggered
         * in order to avoid multiple alerts.
         * @type String
         */
        var loginRedirected = false;

        var self = {};

        /**
         * Returns the scheme and authority (userinfo, host, port) components of the given URI;
         * or an empty string if the URI does not have the components.
         *
         * This method assumes the URI is valid.
         *
         * e.g. `scheme://userinfo@host:80/path?query#fragment` -> `scheme://userinfo@host:80`
         *
         * @param {String} uri The URI
         * @returns {String} The scheme and authority components
         */
        self.getSchemeAndAuthority = function(uri) {
            if (!uri) {
                return "";
            }

            var result = URI_REGEXP.exec(uri);

            if (result === null) {
                return "";
            }

            return [ result[1], result[3] ].join("");
        };

        /**
         * Returns the context path used on the server.
         *
         * @returns {String} The context path
         */
        self.getContextPath = function() {
            // Keep cache of calculated path.
            if (contextPath === null) {
                contextPath = self.detectContextPath();
            }
            return contextPath;
        };

        /**
         * Detects the context path used on the server.
         *
         * @returns {String} The context path
         * @private
         */
        self.detectContextPath = function() {
            try {
                if (window.CQURLInfo) {
                    contextPath = CQURLInfo.contextPath || "";
                } else {
                    var scripts = document.getElementsByTagName("script");
                    for (var i = 0; i < scripts.length; i++) {
                        var result = SCRIPT_URL_REGEXP.exec(scripts[i].src);
                        if (result) {
                            contextPath = result[1];
                            return contextPath;
                        }
                    }
                    contextPath = "";
                }
            } catch (e) {
                // ignored
            }

            return contextPath;
        };

        /**
         * Makes sure the specified relative URL starts with the context path
         * used on the server. If an absolute URL is passed, it will be returned
         * as-is.
         *
         * @param {String} url The URL
         * @returns {String} The externalized URL
         */
        self.externalize = function(url) {
            try {
                if (url.indexOf("/") === 0 && self.getContextPath() && url.indexOf(self.getContextPath() + "/") !== 0) {
                    url = self.getContextPath() + url;
                }
            } catch (e) {
                // ignored
            }
            return url;
        };

        /**
         * Removes scheme, authority and context path from the specified
         * absolute URL if it has the same scheme and authority as the
         * specified document (or the current one). If a relative URL is passed,
         * the context path will be stripped if present.
         *
         * @param {String} url The URL
         * @param {String} doc (optional) The document
         * @returns {String} The internalized URL
         */
        self.internalize = function(url, doc) {
            if (url.charAt(0) === "/") {
                if (contextPath === url) {
                    return "";
                } else if (contextPath && url.indexOf(contextPath + "/") === 0) {
                    return url.substring(contextPath.length);
                } else {
                    return url;
                }
            }

            if (!doc) {
                doc = document;
            }
            var docHost = self.getSchemeAndAuthority(doc.location.href);
            var urlHost = self.getSchemeAndAuthority(url);
            if (docHost === urlHost) {
                return url.substring(urlHost.length + (contextPath ? contextPath.length : 0));
            } else {
                return url;
            }
        };

        /**
         * Removes all parts but the path from the specified URL.
         * <p>Examples:<pre><code>
         /x/y.sel.html?param=abc => /x/y
         </code></pre>
         * <pre><code>
         http://www.day.com/foo/bar.html => /foo/bar
         </code></pre><p>
         *
         * @param {String} url The URL, may be empty. If empty <code>window.location.href</code> is taken.
         * @returns {String} The path
         */
        self.getPath = function(url) {
            if (!url) {
                if (window.CQURLInfo && CQURLInfo.requestPath) {
                    return CQURLInfo.requestPath;
                } else {
                    url = window.location.pathname;
                }
            } else {
                url = self.removeParameters(url);
                url = self.removeAnchor(url);
            }

            url = self.internalize(url);
            var i = url.indexOf(".", url.lastIndexOf("/"));
            if (i !== -1) {
                url = url.substring(0, i);
            }
            return url;
        };

        /**
         * Removes the fragment component from the given URI.
         *
         * This method assumes the URI is valid.
         *
         * e.g. `scheme://userinfo@host:80/path?query#fragment` -> `scheme://userinfo@host:80/path?query`
         *
         * @param {String} uri The URI
         * @returns {String} The URI without fragment component
         */
        self.removeAnchor = function(uri) {
            var fragmentIndex = uri.indexOf("#");
            if (fragmentIndex >= 0) {
                return uri.substring(0, fragmentIndex);
            } else {
                return uri;
            }
        };

        /**
         * Removes the query component and its subsequent fragment component from the given URI.
         * i.e. When query component exists, the subsequent fragment component is also removed.
         * However, when query component doesn't exist, fragment component is not removed.
         *
         * The assumption here is that the usages of `#` before the `?` are intended as part of the path component
         * that need to be encoded separately.
         * This assumption is made because `c.d.cq.commons.jcr.JcrUtil#isValidName` allows `#`.
         *
         * e.g. `scheme://userinfo@host:80/path#with#hash?query#fragment` -> `scheme://userinfo@host:80/path#with#hash`
         *
         * @param {String} uri The URL
         * @returns {String} The URI without the query component and its subsequent fragment component
         */
        self.removeParameters = function(uri) {
            var queryIndex = uri.indexOf("?");
            if (queryIndex >= 0) {
                return uri.substring(0, queryIndex);
            } else {
                return uri;
            }
        };

        /**
         * Encodes the path component of the given URI if it is not already encoded.
         * See {@link #encodePath} for the details of the encoding.
         *
         * e.g. `scheme://userinfo@host:80/path#with#hash?query#fragment`
         * -> `scheme://userinfo@host:80/path%23with%23hash?query#fragment`
         *
         * @param {String} uri The URI to encode
         * @returns {String} The encoded URI
         */
        self.encodePathOfURI = function(uri) {
            var DELIMS = [ "?", "#" ];

            var parts = [ uri ];
            var delim;
            for (var i = 0, ln = DELIMS.length; i < ln; i++) {
                delim = DELIMS[i];
                if (uri.indexOf(delim) >= 0) {
                    parts = uri.split(delim);
                    break;
                }
            }

            if (ENCODE_PATH_REGEXP.test(parts[0])) {
                parts[0] = self.encodePath(parts[0]);
            }

            return parts.join(delim);
        };

        /**
         * Encodes the given URI using `encodeURI`.
         *
         * This method is used to encode URI components from the scheme component up to the path component (inclusive).
         * Therefore, `?` and `#` are also encoded in addition.
         *
         * However `[` and `]` are not encoded.
         * The assumption here is that the usages of `[` and `]` are only at the host component (for IPv6),
         * not at the path component.
         * This assumption is made because `c.d.cq.commons.jcr.JcrUtil#isValidName` disallows `[` and `]`.
         *
         * Examples
         *
         * * `scheme://userinfo@host:80/path?query#fragment` -> `scheme://userinfo@host:80/path%3Fquery%23fragment`
         * * `http://[2001:db8:85a3:8d3:1319:8a2e:370:7348]/` -> `http://[2001:db8:85a3:8d3:1319:8a2e:370:7348]/`
         *
         * @param {String} uri The URI to encode
         * @returns {String} The encoded URI
         */
        self.encodePath = function(uri) {
            uri = encodeURI(uri);

            // Decode back `%5B` and `%5D`.
            // The `[` and `]` are not valid characters at the path component and need to be encoded,
            // which `encodeURI` does correctly.
            // However as mentioned in the doc, they are assumed to be used for authority component only.
            uri = uri.replace(/%5B/g, "[").replace(/%5D/g, "]");

            uri = uri.replace(/\?/g, "%3F");
            uri = uri.replace(/#/g, "%23");

            return uri;
        };

        /**
         * Handles login redirection if needed.
         */
        self.handleLoginRedirect = function() {
            if (!loginRedirected) {
                loginRedirected = true;
                alert(Granite.I18n.get("Your request could not be completed because you have been signed out."));

                var l = util.getTopWindow().document.location;
                l.href = self.externalize("/") + "?resource=" + encodeURIComponent(l.pathname + l.search + l.hash);
            }
        };

        /**
         * Gets the XHR hooked URL if called in a portlet context
         *
         * @param {String} url The URL to get
         * @param {String} method The method to use to retrieve the XHR hooked URL
         * @param {Object} params The parameters
         * @returns {String} The XHR hooked URL if available, the provided URL otherwise
         */
        self.getXhrHook = function(url, method, params) {
            method = method || "GET";
            if (window.G_XHR_HOOK && typeof G_XHR_HOOK === "function") {
                var p = {
                    "url": url,
                    "method": method
                };
                if (params) {
                    p["params"] = params;
                }
                return G_XHR_HOOK(p);
            }
            return null;
        };

        /**
         * Evaluates and returns the body of the specified response object.
         * Alternatively, a URL can be specified, in which case it will be
         * requested using a synchornous {@link #get} in order to acquire
         * the response object.
         *
         * @param {Object|String} response The response object or URL
         * @returns {Object} The evaluated response body
         * @since 5.3
         */
        self.eval = function(response) {
            if (typeof response !== "object") {
                response = $.ajax({
                    url: response,
                    type: "get",
                    async: false
                });
            }
            try {
                // support responseText for backward compatibility (pre 5.3)
                // eslint-disable-next-line no-eval
                return eval("(" + (response.body ? response.body
                    : response.responseText) + ")");
            } catch (e) {
                // ignored
            }
            return null;
        };

        return self;
    }());
}));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */
(function(factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("@granite/http"));
    } else {
        window.Granite.I18n = factory(window.Granite.HTTP);
    }
}(function(HTTP) {
    "use strict";

    /**
     * A helper class providing a set of utilities related to internationalization (i18n).
     *
     * <h3>Locale Priorities</h3>
     * <p>The locale is read based on the following priorities:</p>
     * <ol>
     *   <li>manually specified locale</li>
     *   <li><code>document.documentElement.lang</code></li>
     *   <li><code>Granite.I18n.LOCALE_DEFAULT</code></li>
     * </ol>
     *
     * <h3>Dictionary Priorities</h3>
     * <p>The dictionary URL is read based on the following priorities:</p>
     * <ol>
     *   <li>manually specified URL (<code>urlPrefix</code, <code>urlSuffix</code>)</li>
     *   <li><code>data-i18n-dictionary-src</code> attribute at &lt;html&gt; element,
     *       which has the type of <a href="http://tools.ietf.org/html/rfc6570">URI Template</a> string</li>
     *   <li>The URL resolved from default <code>urlPrefix</code> and <code>urlSuffix</code></li>
     * </ol>
     *
     * <h3>URI Template of data-i18n-dictionary-src</h3>
     * <p>It expects the variable named <code>locale</code>,
     * which will be fetched from the locale (based on priorities above).
     * E.g. <code>&lt;html lang="en" data-i18n-dictionary-src="/libs/cq/i18n/dict.{+locale}.json"&gt;</code>.</p>
     *
     * @static
     * @class Granite.I18n
     */
    return (function() {
        /**
         * The map where the dictionaries are stored under their locale.
         * @type Object
         */
        var dicts = {};

        /**
         * The prefix for the URL used to request dictionaries from the server.
         * @type String
         */
        var urlPrefix = "/libs/cq/i18n/dict.";

        /**
         * The suffix for the URL used to request dictionaries from the server.
         * @type String
         */
        var urlSuffix = ".json";

        /**
         * The manually specified locale as a String or a function that returns the locale as a string.
         * @type String
         */
        var manualLocale = undefined;

        /**
         * If the current locale represents pseudo translations.
         * In that case the dictionary is expected to provide just a special
         * translation pattern to automatically convert all original strings.
         */
        var pseudoTranslations = false;

        var languages = null;

        var self = {};

        /**
         * Indicates if the dictionary parameters are specified manually.
         */
        var manualDictionary = false;

        var getDictionaryUrl = function(locale) {
            if (manualDictionary) {
                return urlPrefix + locale + urlSuffix;
            }

            var dictionarySrc;
            var htmlEl = document.querySelector("html");
            if (htmlEl) {
                dictionarySrc = htmlEl.getAttribute("data-i18n-dictionary-src");
            }

            if (!dictionarySrc) {
                return urlPrefix + locale + urlSuffix;
            }

            // dictionarySrc is a URITemplate
            // Use simple string replacement for now; for more complicated scenario, please use Granite.URITemplate
            return dictionarySrc.replace("{locale}", encodeURIComponent(locale)).replace("{+locale}", locale);
        };

        var patchText = function(text, snippets) {
            if (snippets) {
                if (Array.isArray(snippets)) {
                    for (var i = 0; i < snippets.length; i++) {
                        text = text.replace("{" + i + "}", snippets[i]);
                    }
                } else {
                    text = text.replace("{0}", snippets);
                }
            }
            return text;
        };

        /**
         * The default locale (en).
         * @readonly
         * @type String
         */
        self.LOCALE_DEFAULT = "en";

        /**
         * The language code for pseudo translations.
         * @readonly
         * @type String
         */
        self.PSEUDO_LANGUAGE = "zz";

        /**
         * The dictionary key for pseudo translation pattern.
         * @readonly
         * @type String
         */
        self.PSEUDO_PATTERN_KEY = "_pseudoPattern_";

        /**
         * Initializes I18n with the given config options:
         * <ul>
         * <li>locale: the current locale (defaults to "en")</li>
         * <li>urlPrefix: the prefix for the URL used to request dictionaries from
         * the server (defaults to "/libs/cq/i18n/dict.")</li>
         * <li>urlSuffix: the suffix for the URL used to request dictionaries from
         * the server (defaults to ".json")</li>
         * </ul>
         * Sample config. The dictioniary would be requested from
         * "/apps/i18n/dict.fr.json":
         <code><pre>{
         "locale": "fr",
         "urlPrefix": "/apps/i18n/dict.",
         "urlSuffix": ".json"
         }</pre></code>
         *
         * @param {Object} config The config
         */
        self.init = function(config) {
            config  = config || {};

            this.setLocale(config.locale);
            this.setUrlPrefix(config.urlPrefix);
            this.setUrlSuffix(config.urlSuffix);
        };

        /**
         * Sets the current locale.
         *
         * @param {String|Function} locale The locale or a function that returns the locale as a string
         */
        self.setLocale = function(locale) {
            if (!locale) {
                return;
            }
            manualLocale = locale;
        };

        /**
         * Returns the current locale based on the priorities.
         *
         * @returns {String} The locale
         */
        self.getLocale = function() {
            if (typeof manualLocale === "function") {
                // execute function first time only and store result in currentLocale
                manualLocale = manualLocale();
            }
            return manualLocale || document.documentElement.lang || self.LOCALE_DEFAULT;
        };

        /**
         * Sets the prefix for the URL used to request dictionaries from
         * the server. The locale and URL suffix will be appended.
         *
         * @param {String} prefix The URL prefix
         */
        self.setUrlPrefix = function(prefix) {
            if (!prefix) {
                return;
            }
            urlPrefix = prefix;
            manualDictionary = true;
        };

        /**
         * Sets the suffix for the URL used to request dictionaries from
         * the server. It will be appended to the URL prefix and locale.
         *
         * @param {String} suffix The URL suffix
         */
        self.setUrlSuffix = function(suffix) {
            if (!suffix) {
                return;
            }
            urlSuffix = suffix;
            manualDictionary = true;
        };

        /**
         * Returns the dictionary for the specified locale. This method
         * will request the dictionary using the URL prefix, the locale,
         * and the URL suffix. If no locale is specified, the current
         * locale is used.
         *
         * @param {String} locale (optional) The locale
         * @returns {Object} The dictionary
         */
        self.getDictionary = function(locale) {
            locale = locale || self.getLocale();

            if (!dicts[locale]) {
                pseudoTranslations = locale.indexOf(self.PSEUDO_LANGUAGE) === 0;

                try {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", HTTP.externalize(getDictionaryUrl(locale)), false);
                    xhr.send();

                    dicts[locale] = JSON.parse(xhr.responseText);
                } catch (e) {
                    // ignored
                }
                if (!dicts[locale]) {
                    dicts[locale] = {};
                }
            }
            return dicts[locale];
        };

        /**
         * Translates the specified text into the current language.
         *
         * @param {String} text The text to translate
         * @param {String[]} snippets The snippets replacing <code>{n}</code> (optional)
         * @param {String} note A hint for translators (optional)
         * @returns {String} The translated text
         */
        self.get = function(text, snippets, note) {
            var dict;
            var newText;
            var lookupText;

            dict = self.getDictionary();

            // note that pseudoTranslations is initialized in the getDictionary() call above
            lookupText = pseudoTranslations ? self.PSEUDO_PATTERN_KEY
                : note ? text + " ((" + note + "))"
                    : text;
            if (dict) {
                newText = dict[lookupText];
            }
            if (!newText) {
                newText = text;
            }
            if (pseudoTranslations) {
                newText = newText.replace("{string}", text).replace("{comment}", note ? note : "");
            }
            return patchText(newText, snippets);
        };

        /**
         * Translates the specified text into the current language. Use this
         * method to translate String variables, e.g. data from the server.
         *
         * @param {String} text The text to translate
         * @param {String} note A hint for translators (optional)
         * @returns {String} The translated text
         */
        self.getVar = function(text, note) {
            if (!text) {
                return null;
            }
            return self.get(text, null, note);
        };

        /**
         * Returns the available languages, including a "title" property with a display name:
         * for instance "German" for "de" or "German (Switzerland)" for "de_ch".
         *
         * @returns {Object} An object with language codes as keys and an object with "title",
         *                  "language", "country" and "defaultCountry" members.
         */
        self.getLanguages = function() {
            if (!languages) {
                try {
                    // use overlay servlet so customers can define /apps/wcm/core/resources/languages
                    // TODO: broken!!!
                    var url = HTTP.externalize("/libs/wcm/core/resources/languages.overlay.infinity.json");
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, false);
                    xhr.send();

                    var json = JSON.parse(xhr.responseText);

                    Object.keys(json).forEach(function(prop) {
                        var lang = json[prop];
                        if (lang.language) {
                            lang.title = self.getVar(lang.language);
                        }
                        if (lang.title && lang.country && lang.country !== "*") {
                            lang.title += " (" + self.getVar(lang.country) + ")";
                        }
                    });
                    languages = json;
                } catch (e) {
                    languages = {};
                }
            }
            return languages;
        };

        /**
         * Parses a language code string such as "de_CH" and returns an object with
         * language and country extracted. The delimiter can be "_" or "-".
         *
         * @param {String} langCode a language code such as "de" or "de_CH" or "de-ch"
         * @returns {Object} an object with "code" ("de_CH"), "language" ("de") and "country" ("CH")
         *                  (or null if langCode was null)
         */
        self.parseLocale = function(langCode) {
            if (!langCode) {
                return null;
            }
            var pos = langCode.indexOf("_");
            if (pos < 0) {
                pos = langCode.indexOf("-");
            }

            var language;
            var country;
            if (pos < 0) {
                language = langCode;
                country = null;
            } else {
                language = langCode.substring(0, pos);
                country = langCode.substring(pos + 1);
            }
            return {
                code: langCode,
                language: language,
                country: country
            };
        };

        return self;
    }());
}));

!function(e){"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof exports?e(require("jquery")):e(jQuery)}((function(e){let n=/\+/g;function o(e){return c.raw?e:encodeURIComponent(e)}function t(e){return c.raw?e:decodeURIComponent(e)}function i(e){return o(c.json?JSON.stringify(e):String(e))}function r(o,t){return o=c.raw?o:function(e){0===e.indexOf('"')&&(e=e.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return e=decodeURIComponent(e.replace(n," ")),c.json?JSON.parse(e):e}catch(e){}}(o),e.isFunction(t)?t(o):o}let c=e.cookie=function(n,u,f){if(void 0!==u&&!e.isFunction(u)){if("number"==typeof(f=e.extend({},c.defaults,f)).expires){let e=f.expires,n=f.expires=new Date;n.setTime(+n+864e5*e)}return document.cookie=[o(n),"=",i(u),f.expires?"; expires="+f.expires.toUTCString():"",f.path?"; path="+f.path:"",f.domain?"; domain="+f.domain:"",f.secure?"; secure":""].join("")}let d=n?void 0:{},p=document.cookie?document.cookie.split("; "):[];for(let e=0,o=p.length;e<o;e++){let o=p[e].split("="),i=t(o.shift()),c=o.join("=");if(n&&n===i){d=r(c,u);break}n||void 0===(c=r(c))||(d[i]=c)}return d};c.defaults={},e.removeCookie=function(n,o){return void 0!==e.cookie(n)&&(e.cookie(n,"",e.extend({},o,{expires:-1})),!e.cookie(n))}}));

//i18 多语言
var LAG_SITE_CODE = "zh_CN";
var LAG_SOURCE = "100000007";
var LAG_CHANNEL_CODE = "WEBSITE";
var LAG_COUNTRY_CODE = digitalData.page.pageInfo.countryCode;
var LAG_LANG = "zh-cn";
var LAN_LANG_CODE = "zh-cn";
var LAG_COUNTRY = digitalData.page.pageInfo.countryCode;
var LAG_LANGUAGE = "zh-cn";
var LAG_APP_NUMBER = "A182283838";
var LAG_MAP_ICO_URL = "/content/dam/huawei-cbg-site/cn/map/{index}.svg";
var __isAuth = ($.cookie("__isAuth")==="true")?true:false;
var isCreateUserInfo = ($.cookie("__isCreateUserInfo")==="true")?true:false;
var dcountryCode = digitalData.page.pageInfo.countryCode;

var regpostcode = /^[\s\S]*$/
if(dcountryCode == "FR"){
    regpostcode = /^\d{5}$/;
}else if(dcountryCode == "UK"){
    regpostcode = /^[A-Za-z0-9][A-Za-z0-9 ]{3,6}[A-Za-z0-9]$/
}
var loginstate = -1;
var logininfo = {};

var underageTips = ($("#underageTips").val() || "").trim();
var underageTipsBtn = ($("#underageTips").attr("btnText") || "").trim();
/*
* regpostcode fr邮编验证(5位数字)
*loginstate 登录状态 -1 未登录 ， 0 成功 ，1 跨站
*logininfo 脱敏用户信息
*regpostcode 海外邮编校验规则
* */

var countryLangConfig = {
    "AE": {siteCode: "ar_AE", languageCode: "ar", casLangCode: "ar-ae", ccpdLangCode: "en", captchaLangCode: "ar"},
    "BH": {siteCode: "en_BH", languageCode: "en", casLangCode: "en-bh", ccpdLangCode: "en", captchaLangCode: "en-GB"},
    "EG": {
        siteCode: "ar_EG",
        languageCode: "ar",
        casLangCode: "ar-eg",
        ccpdLangCode: "en",
        siteCode4Honor: "ar_EG_H",
        captchaLangCode: "ar"
    },
    "JO": {siteCode: "en_JO", languageCode: "en", casLangCode: "en-jo", ccpdLangCode: "en", captchaLangCode: "en-US"},
    "KW": {siteCode: "ar_KW", languageCode: "ar", casLangCode: "ar-kw", ccpdLangCode: "en", captchaLangCode: "ar"},
    "LB": {siteCode: "en_LB", languageCode: "en", casLangCode: "en-lb", ccpdLangCode: "en", captchaLangCode: "en-GB"},
    "SA": {siteCode: "ar_SA", languageCode: "ar", casLangCode: "ar-sa", ccpdLangCode: "ar", captchaLangCode: "ar"},

    "AZ": {siteCode: "az_AZ", languageCode: "az", casLangCode: "az-az", captchaLangCode: "az"},
    "BG": {
        siteCode: "bg_BG",
        languageCode: "bg",
        casLangCode: "bg-bg",
        ccpdLangCode: "en",
        siteCode4Honor: "bg_BG_H",
        captchaLangCode: "bg"
    },
    "BA": {siteCode: "bs_BA", languageCode: "bs", casLangCode: "bs-ba", ccpdLangCode: "en", captchaLangCode: "en-GB"},
    "CZ": {
        siteCode: "cs_CZ",
        languageCode: "cs",
        casLangCode: "cs-cz",
        ccpdLangCode: "en",
        siteCode4Honor: "cs_CZ_H",
        captchaLangCode: "cs"
    },
    "DK": {siteCode: "da_DK", languageCode: "da", casLangCode: "da-dk", ccpdLangCode: "en", captchaLangCode: "da"},
    "AT": {siteCode: "de_AT", languageCode: "de", casLangCode: "de-at", ccpdLangCode: "en", captchaLangCode: "de"},
    "CH": {siteCode: "de_CH", languageCode: "de", casLangCode: "de-ch", captchaLangCode: "de"},
    "DE": {
        siteCode: "de_DE",
        languageCode: "de",
        casLangCode: "de-de",
        ccpdLangCode: "en",
        siteCode4Honor: "de_DE_H",
        captchaLangCode: "de"
    },
    "CY": {siteCode: "el_CY", languageCode: "el", casLangCode: "el-cy", ccpdLangCode: "en", captchaLangCode: "el"},
    "GR": {
        siteCode: "el_GR",
        languageCode: "el",
        casLangCode: "el-gr",
        ccpdLangCode: "en",
        siteCode4Honor: "el_GR_H",
        captchaLangCode: "el"
    },

    "AU": {siteCode: "en_AU", languageCode: "en", casLangCode: "en-au", ccpdLangCode: "en", captchaLangCode: "en-GB"},
    "BD": {siteCode: "en_BD", languageCode: "en", casLangCode: "en-us", ccpdLangCode: "en", captchaLangCode: "en-GB"},

    "EN": {siteCode: "en_EN", languageCode: "en", casLangCode: "en-us", captchaLangCode: "en-GB"},
    "ET": {siteCode: "en_ET", languageCode: "en", casLangCode: "en-us", captchaLangCode: "en-US"},
    "GB": {
        siteCode: "en_GB",
        languageCode: "en",
        casLangCode: "en-gb",
        ccpdLangCode: "en",
        siteCode4Honor: "en_GB_H",
        captchaLangCode: "en-GB"
    },
    "GH": {siteCode: "en_GH", languageCode: "en", casLangCode: "en-gh", ccpdLangCode: "en", captchaLangCode: "en-US"},
    "IE": {siteCode: "en_IE", languageCode: "en", casLangCode: "en-ie", ccpdLangCode: "en", captchaLangCode: "en-GB"},
    "IN": {
        siteCode: "en_IN",
        languageCode: "en",
        casLangCode: "en-in",
        ccpdLangCode: "en",
        siteCode4Honor: "en_IN_H",
        captchaLangCode: "en-GB"
    },
    "IQ": {siteCode: "en_IQ", languageCode: "en", casLangCode: "en-us", captchaLangCode: "en-US"},

    "JM": {siteCode: "en_JM", languageCode: "en", casLangCode: "en-jm", captchaLangCode: "en-GB"},
    "KE": {siteCode: "en_KE", languageCode: "en", casLangCode: "en-ke", ccpdLangCode: "en", captchaLangCode: "en-GB"},
    "KH": {siteCode: "en_KH", languageCode: "en", casLangCode: "en-us", ccpdLangCode: "en", captchaLangCode: "en-GB"},

    "LK": {siteCode: "en_LK", languageCode: "en", casLangCode: "en-us", ccpdLangCode: "en", captchaLangCode: "en-GB"},

    "MU": {siteCode: "en_MU", languageCode: "en", casLangCode: "en-mu", ccpdLangCode: "en", captchaLangCode: "en-GB"},
    "MY": {
        siteCode: "en_MY",
        languageCode: "en",
        casLangCode: "en-my",
        ccpdLangCode: "en",
        siteCode4Honor: "en_MY_H",
        captchaLangCode: "en-GB"
    },
    "NA": {siteCode: "en_NA", languageCode: "en", casLangCode: "en-na", captchaLangCode: "en-GB"},
    "NG": {siteCode: "en_NG", languageCode: "en", casLangCode: "en-ng", ccpdLangCode: "en", captchaLangCode: "en-US"},

    "NP": {siteCode: "en_NP", languageCode: "en", casLangCode: "en-us", captchaLangCode: "en-US"},
    "NZ": {siteCode: "en_NZ", languageCode: "en", casLangCode: "en-nz", ccpdLangCode: "en", captchaLangCode: "en-GB"},
    "OM": {siteCode: "en_OM", languageCode: "en", casLangCode: "en-us", ccpdLangCode: "en", captchaLangCode: "en-GB"},
    "PH": {
        siteCode: "en_PH",
        languageCode: "en",
        casLangCode: "en-ph",
        ccpdLangCode: "en",
        siteCode4Honor: "en_PH_H",
        captchaLangCode: "en-US"
    },
    "PK": {
        siteCode: "en_PK",
        languageCode: "en",
        casLangCode: "en-pk",
        ccpdLangCode: "en",
        siteCode4Honor: "en_PK_H",
        captchaLangCode: "en-GB"
    },
    "QA": {siteCode: "en_QA", languageCode: "en", casLangCode: "en-us", ccpdLangCode: "en", captchaLangCode: "en-GB"},

    "SG": {
        siteCode: "en_SG",
        languageCode: "en",
        casLangCode: "en-sg",
        ccpdLangCode: "en",
        siteCode4Honor: "en_SG_H",
        captchaLangCode: "en-GB"
    },
    "TT": {siteCode: "en_TT", languageCode: "en", casLangCode: "en-tt", captchaLangCode: "en-GB"},
    "TZ": {siteCode: "en_TZ", languageCode: "en", casLangCode: "en-tz", captchaLangCode: "en-GB"},
    "UG": {siteCode: "en_UG", languageCode: "en", casLangCode: "en-ug", captchaLangCode: "en-GB"},
    "US": {siteCode: "en_US", languageCode: "en", casLangCode: "en-us", captchaLangCode: "en-US"},
    "ZA": {
        siteCode: "en_ZA",
        languageCode: "en",
        casLangCode: "en-za",
        ccpdLangCode: "en",
        siteCode4Honor: "en_ZA_H",
        captchaLangCode: "en-US"
    },
    "ZM": {siteCode: "en_ZM", languageCode: "en", casLangCode: "en-zm", captchaLangCode: "en-GB"},
    "AR": {siteCode: "es_AR", languageCode: "es", casLangCode: "es-ar", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "BO": {siteCode: "es_BO", languageCode: "es", casLangCode: "es-bo", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "CL": {siteCode: "es_CL", languageCode: "es", casLangCode: "es-cl", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "CO": {
        siteCode: "es_CO",
        languageCode: "es",
        casLangCode: "es-co",
        ccpdLangCode: "es",
        siteCode4Honor: "es_CO_H",
        captchaLangCode: "es-la"
    },
    "CR": {siteCode: "es_CR", languageCode: "es", casLangCode: "es-cr", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "DO": {siteCode: "es_DO", languageCode: "es", casLangCode: "es-do", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "EC": {siteCode: "es_EC", languageCode: "es", casLangCode: "es-ec", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "ES": {
        siteCode: "es_ES",
        languageCode: "es",
        casLangCode: "es-es",
        ccpdLangCode: "es",
        siteCode4Honor: "es_ES_H",
        captchaLangCode: "es"
    },
    "GT": {siteCode: "es_GT", languageCode: "es", casLangCode: "es-gt", ccpdLangCode: "es", captchaLangCode: "es"},
    "HN": {siteCode: "es_HN", languageCode: "es", casLangCode: "es-hn", ccpdLangCode: "es", captchaLangCode: "es"},
    "MX": {
        siteCode: "es_MX",
        languageCode: "es",
        casLangCode: "es-mx",
        ccpdLangCode: "es",
        siteCode4Honor: "es_MX_H",
        captchaLangCode: "es-la"
    },
    "PA": {siteCode: "es_PA", languageCode: "es", casLangCode: "es-pa", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "PE": {siteCode: "es_PE", languageCode: "es", casLangCode: "es-pe", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "PY": {siteCode: "es_PY", languageCode: "es", casLangCode: "es-py", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "SV": {siteCode: "es_SV", languageCode: "es", casLangCode: "es-sv", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "UY": {siteCode: "es_UY", languageCode: "es", casLangCode: "es-uy", ccpdLangCode: "es", captchaLangCode: "es-la"},
    "VE": {siteCode: "es_VE", languageCode: "es", casLangCode: "es-ve", captchaLangCode: "es-la"},
    "EE": {siteCode: "et_EE", languageCode: "et", casLangCode: "et-ee", ccpdLangCode: "en", captchaLangCode: "et"},

    "IR": {siteCode: "fa_IR", languageCode: "fa", casLangCode: "fa-ir", captchaLangCode: "fa"},
    "FI": {
        siteCode: "fi_FI",
        languageCode: "fi",
        casLangCode: "fi-fi",
        ccpdLangCode: "en",
        siteCode4Honor: "fi_FI_H",
        captchaLangCode: "fi"
    },

    "CA": {siteCode: "fr_CA", languageCode: "fr", casLangCode: "fr-ca", ccpdLangCode: "en", captchaLangCode: "en-US"},
    "CD": {siteCode: "fr_CD", languageCode: "fr", casLangCode: "fr-cd", captchaLangCode: "fr"},

    "CI": {siteCode: "fr_CI", languageCode: "fr", casLangCode: "fr-ci", captchaLangCode: "fr"},
    "DZ": {siteCode: "fr_DZ", languageCode: "fr", casLangCode: "fr-dz", ccpdLangCode: "en", captchaLangCode: "fr"},
    "FR": {
        siteCode: "fr_FR",
        languageCode: "fr",
        casLangCode: "fr-fr",
        ccpdLangCode: "en",
        siteCode4Honor: "fr_FR_H",
        captchaLangCode: "fr"
    },
    "MA": {siteCode: "fr_MA", languageCode: "fr", casLangCode: "fr-ma", ccpdLangCode: "en", captchaLangCode: "fr"},
    "TN": {siteCode: "fr_TN", languageCode: "fr", casLangCode: "fr-tn", ccpdLangCode: "en", captchaLangCode: "fr"},
    "HR": {siteCode: "hr_HR", languageCode: "hr", casLangCode: "hr-hr", ccpdLangCode: "en", captchaLangCode: "hr"},
    "HU": {
        siteCode: "hu_HU",
        languageCode: "hu",
        casLangCode: "hu-hu",
        ccpdLangCode: "en",
        siteCode4Honor: "hu_HU_H",
        captchaLangCode: "hu"
    },
    "ID": {
        siteCode: "id_ID",
        languageCode: "id",
        casLangCode: "in-id",
        ccpdLangCode: "en",
        siteCode4Honor: "id_ID_H",
        captchaLangCode: "id"
    },

    "IT": {
        siteCode: "it_IT",
        languageCode: "it",
        casLangCode: "it-it",
        ccpdLangCode: "en",
        siteCode4Honor: "it_IT_H",
        captchaLangCode: "it"
    },
    "JP": {siteCode: "ja_JP", languageCode: "ja", casLangCode: "ja-jp", ccpdLangCode: "ja", captchaLangCode: "ja"},

    "KR": {siteCode: "ko_KR", languageCode: "ko", casLangCode: "ko-kr", ccpdLangCode: "en", captchaLangCode: "ko"},
    "LT": {siteCode: "lt_LT", languageCode: "lt", casLangCode: "lt-lt", ccpdLangCode: "en", captchaLangCode: "lt"},
    "LV": {siteCode: "lv_LV", languageCode: "lv", casLangCode: "lv-lv", ccpdLangCode: "en", captchaLangCode: "lv"},
    "MK": {siteCode: "mk_MK", languageCode: "mk", casLangCode: "mk-mk", ccpdLangCode: "en", captchaLangCode: "mk"},
    "MM": {
        siteCode: "my_MM",
        languageCode: "my",
        casLangCode: "my-mm",
        ccpdLangCode: "en",
        siteCode4Honor: "my_MM_H",
        captchaLangCode: "my"
    },
    "BE": {siteCode: "nl_BE", languageCode: "nl", casLangCode: "nl-be", ccpdLangCode: "en", captchaLangCode: "nl"},
    "NL": {
        siteCode: "nl_NL",
        languageCode: "nl",
        casLangCode: "nl-nl",
        ccpdLangCode: "en",
        siteCode4Honor: "nl_NL_H",
        captchaLangCode: "nl"
    },
    "NO": {
        siteCode: "no_NO",
        languageCode: "no",
        casLangCode: "nb-no",
        ccpdLangCode: "en",
        siteCode4Honor: "no_NO_H",
        captchaLangCode: "no"
    },
    "PL": {
        siteCode: "pl_PL",
        languageCode: "pl",
        casLangCode: "pl-pl",
        ccpdLangCode: "en",
        siteCode4Honor: "pl_PL_H",
        captchaLangCode: "pl"
    },
    "AO": {siteCode: "pt_AO", languageCode: "pt", casLangCode: "pt-ao", captchaLangCode: "pt"},
    "PT": {siteCode: "pt_PT", languageCode: "pt", casLangCode: "pt-pt", ccpdLangCode: "en", captchaLangCode: "pt"},
    "MD": {siteCode: "ro_MD", languageCode: "ro", casLangCode: "ro-md", ccpdLangCode: "en", captchaLangCode: "ro"},
    "RO": {siteCode: "ro_RO", languageCode: "ro", casLangCode: "ro-ro", ccpdLangCode: "en", captchaLangCode: "ro"},
    "RU": {siteCode: "ru_RU", languageCode: "ru", casLangCode: "ru-ru", ccpdLangCode: "ru", captchaLangCode: "ru"},
    "SK": {siteCode: "sk_SK", languageCode: "sk", casLangCode: "sk-sk", ccpdLangCode: "en", captchaLangCode: "sk"},
    "SI": {siteCode: "sl_SI", languageCode: "sl", casLangCode: "sl-si", ccpdLangCode: "en", captchaLangCode: "sl"},
    "RS": {
        siteCode: "sr_RS",
        languageCode: "sr",
        casLangCode: "sr-sp",
        ccpdLangCode: "en",
        siteCode4Honor: "sr_RS_H",
        captchaLangCode: "sr"
    },
    "SE": {
        siteCode: "sv_SE",
        languageCode: "sv",
        casLangCode: "sv-se",
        ccpdLangCode: "en",
        siteCode4Honor: "sv_SE_H",
        captchaLangCode: "sv"
    },
    "TH": {
        siteCode: "th_TH",
        languageCode: "th",
        casLangCode: "th-th",
        ccpdLangCode: "en",
        siteCode4Honor: "th_TH_H",
        captchaLangCode: "th"
    },
    "TR": {
        siteCode: "tr_TR",
        languageCode: "tr",
        casLangCode: "tr-tr",
        ccpdLangCode: "en",
        siteCode4Honor: "tr_TR_H",
        captchaLangCode: "tr"
    },
    "UA": {siteCode: "uk_UA", languageCode: "uk", casLangCode: "uk-ua", ccpdLangCode: "en", captchaLangCode: "uk"},
    "VN": {
        siteCode: "vi_VN",
        languageCode: "vi",
        casLangCode: "vi-vn",
        ccpdLangCode: "en",
        siteCode4Honor: "vi_VN_H",
        captchaLangCode: "vi"
    },
    "CN": {
        siteCode: "zh_CN",
        languageCode: "zh-cn",
        casLangCode: "zh-cn",
        siteCode4Honor: "zh_CN_H",
        captchaLangCode: "zh-CN"
    },
    "HK": {
        siteCode: "zh-tw_HK",
        languageCode: "zh-tw",
        casLangCode: "zh-hk",
        siteCode4Honor: "zh-tw_HK_H",
        captchaLangCode: "zh-HK"
    },
    "TW": {siteCode: "zh-tw_TW", languageCode: "zh-tw", casLangCode: "zh-tw", captchaLangCode: "zh-TW"},
    "UK": {
        siteCode: "en_GB",
        languageCode: "en",
        casLangCode: "en-gb",
        ccpdLangCode: "en",
        siteCode4Honor: "en_GB_H",
        captchaLangCode: "en-GB"
    },
    "MEA": {siteCode: "en_mea", siteCode4Honor: "en_mea_H", languageCode: "en", captchaLangCode: "en-GB"},
    "MEA-AR": {siteCode: "ar_EG", siteCode4Honor: "ar_EG_H", languageCode: "ar", captchaLangCode: "ar"},
    "LEVANT": {
        siteCode: "en_LEVANT",
        languageCode: "en",
        casLangCode: "en-us",
        siteCode4Honor: "ar_IQ_H",
        captchaLangCode: "en-US"
    },
    "FA": {
        siteCode: "fa_FA",
        languageCode: "fa",
        casLangCode: "fa-ir",
        siteCode4Honor: "fa_IR_H",
        captchaLangCode: "fa"
    },
    "LATIN": {
        siteCode: "es_LATIN",
        languageCode: "es",
        casLangCode: "es-us",
        ccpdLangCode: "es",
        captchaLangCode: "es"
    },
    "IL": {siteCode: "he_IL", languageCode: "he", casLangCode: "he-il", ccpdLangCode: "en", captchaLangCode: "he"},
    "SD": {siteCode: "ar_SD", languageCode: "ar", casLangCode: "ar-sd", captchaLangCode: "ar"},
    "BR": {siteCode: "pt_BR", languageCode: "pt", casLangCode: "pt-br", ccpdLangCode: "en", captchaLangCode: "pt"},
    "KZ": {siteCode: "ru_KZ", languageCode: "ru", casLangCode: "ru-kz", ccpdLangCode: "en", captchaLangCode: "ru"},
    "BY": {
        siteCode: "ru_BE",
        languageCode: "ru",
        casLangCode: "ru-by",
        ccpdLangCode: "en",
        siteCode4Honor: "ru_BE_H",
        captchaLangCode: "ru"
    },
    "UZ": {siteCode: "ru_UZ", languageCode: "ru", casLangCode: "ru-ru", ccpdLangCode: "en", captchaLangCode: "uz"},
    "LA": {siteCode: "lo_LA", languageCode: "lo", casLangCode: "lo-la", ccpdLangCode: "en", captchaLangCode: "lo"},
    "CG": {siteCode: "fr_CG", languageCode: "fr", casLangCode: "fr-cg", captchaLangCode: "fr"},
    "BW": {siteCode: "en_BW", languageCode: "en", casLangCode: "en-bw", captchaLangCode: "en-GB"}
};

var sysConfig = {
    siteCode: countryLangConfig[LAG_COUNTRY_CODE]?countryLangConfig[LAG_COUNTRY_CODE].siteCode:LAG_SITE_CODE,
    siteCode4Honor: countryLangConfig[LAG_COUNTRY_CODE]?countryLangConfig[LAG_COUNTRY_CODE].siteCode4Honor : "",

    source: LAG_SOURCE,
    channelCode: LAG_CHANNEL_CODE,
    countryCode : LAG_COUNTRY_CODE,
    langCode : countryLangConfig[LAG_COUNTRY_CODE]?countryLangConfig[LAG_COUNTRY_CODE].languageCode:LAN_LANG_CODE,
    country: LAG_COUNTRY,
    language: countryLangConfig[LAG_COUNTRY_CODE]?countryLangConfig[LAG_COUNTRY_CODE].languageCode:LAN_LANG_CODE,
    mapIcoUrl: LAG_MAP_ICO_URL,
    lang: countryLangConfig[LAG_COUNTRY_CODE]?countryLangConfig[LAG_COUNTRY_CODE].languageCode:LAN_LANG_CODE,
    appNumber: LAG_APP_NUMBER,
    casLangCode :countryLangConfig[LAG_COUNTRY_CODE]?countryLangConfig[LAG_COUNTRY_CODE].casLangCode:LAN_LANG_CODE,
    ccpdLangCode:countryLangConfig[LAG_COUNTRY_CODE]?countryLangConfig[LAG_COUNTRY_CODE].ccpdLangCode:LAN_LANG_CODE,
    captchaLangCode: countryLangConfig[LAG_COUNTRY_CODE] ? countryLangConfig[LAG_COUNTRY_CODE].captchaLangCode : "",
};

sysConfig.reqClientType = "27";

if (sysConfig.countryCode === "UK") {
    sysConfig.countryCode = "GB";
    sysConfig.country = "GB";
} else if (sysConfig.countryCode === "CN1") {
    sysConfig.countryCode = "CN";
    sysConfig.country = "CN";
} else if (sysConfig.countryCode === "EN") {
    sysConfig.countryCode = "Global";
    sysConfig.country = "Global";
} else if (digitalData.page.pageInfo.siteCode === "uses") {
    sysConfig.langCode = "es";
    sysConfig.language = "es";
    sysConfig.siteCode = "en_US";
    sysConfig.casLangCode = "es-us";
    sysConfig.countryCode = "US";
} else if (digitalData.page.pageInfo.siteCode === "saen") {
    sysConfig.langCode = "en";
    sysConfig.language = "en";
    sysConfig.siteCode = "en_SA";
    sysConfig.casLangCode = "en-us";
    sysConfig.countryCode = "SA";
    sysConfig.ccpdLangCode = "en";
    sysConfig.siteCode4Honor = "en_SA_H";
    sysConfig.captchaLangCode = "en-US"
} else if (digitalData.page.pageInfo.siteCode === "sa") {
    sysConfig.langCode = "ar";
    sysConfig.language = "ar";
    sysConfig.siteCode = "ar_SA";
    sysConfig.casLangCode = "ar-sa";
    sysConfig.countryCode = "SA";
} else if (digitalData.page.pageInfo.siteCode === "aeen") {
    sysConfig.langCode = "en";
    sysConfig.language = "en";
    sysConfig.lang = "en";
    sysConfig.siteCode = "en_AE";
    sysConfig.casLangCode = "en-us";
    sysConfig.countryCode = "AE";
    sysConfig.ccpdLangCode = "en";
    sysConfig.siteCode4Honor = "en_AE_H"
    sysConfig.captchaLangCode = "en-US"
} else if (digitalData.page.pageInfo.siteCode === "befr") {
    sysConfig.langCode = "fr";
    sysConfig.language = "fr";
    sysConfig.siteCode = "fr_BE";
    sysConfig.casLangCode = "fr-be";
    sysConfig.countryCode = "BE";
    sysConfig.ccpdLangCode = "en";
    sysConfig.captchaLangCode = "fr"
} else if (digitalData.page.pageInfo.siteCode === "chfr") {
    sysConfig.langCode = "fr";
    sysConfig.language = "fr";
    sysConfig.siteCode = "fr_CH";
    sysConfig.casLangCode = "fr-ch";
    sysConfig.countryCode = "CH";
    sysConfig.captchaLangCode = "fr"
} else if (digitalData.page.pageInfo.siteCode === "kwen") {
    sysConfig.langCode = "en";
    sysConfig.language = "en";
    sysConfig.siteCode = "en_KW";
    sysConfig.casLangCode = "en-us";
    sysConfig.countryCode = "KW";
    sysConfig.ccpdLangCode = "en";
    sysConfig.captchaLangCode = "en-GB"
} else if (digitalData.page.pageInfo.siteCode === "levantar") {
    sysConfig.langCode = "ar";
    sysConfig.language = "ar";
    sysConfig.siteCode = "ar_LEVANT";
    sysConfig.casLangCode = "ar-eg";
    sysConfig.countryCode = "LEVANT";
    sysConfig.ccpdLangCode = "en";
    sysConfig.captchaLangCode = "ar"
} else if (digitalData.page.pageInfo.siteCode === "latinen") {
    sysConfig.langCode = "en";
    sysConfig.language = "en";
    sysConfig.siteCode = "en_LATIN";
    sysConfig.casLangCode = "en-us";
    sysConfig.countryCode = "LATIN";
    sysConfig.ccpdLangCode = "es";
} else if (digitalData.page.pageInfo.siteCode === "ca") {
    sysConfig.langCode = "en";
    sysConfig.language = "en";
    sysConfig.siteCode = "en_CA";
    sysConfig.casLangCode = "en-ca";
    sysConfig.countryCode = "CA";
} else if (digitalData.page.pageInfo.siteCode === "egen") {
    sysConfig.langCode = "en";
    sysConfig.language = "en";
    sysConfig.siteCode = "en_EG";
    sysConfig.casLangCode = "en-us";
    sysConfig.countryCode = "EG";
    sysConfig.captchaLangCode = "en-GB"
} else if (digitalData.page.pageInfo.siteCode === "mmen") {
    sysConfig.langCode = "en";
    sysConfig.language = "en";
    sysConfig.siteCode = "en_MM";
    sysConfig.casLangCode = "en-us";
    sysConfig.countryCode = "MM";
    sysConfig.ccpdLangCode = "en";
} else if (sysConfig.countryCode === "FA") {
    sysConfig.countryCode = "AE";
    sysConfig.country = "AE";
    sysConfig.siteCode = "fa_AE";
    sysConfig.ccpdLangCode = "en";
} else if (sysConfig.countryCode === "TW") {
    sysConfig.language = "zh-cn";
} else if (digitalData.page.pageInfo.siteCode === "lvru") {
    sysConfig.langCode = "ru";
    sysConfig.language = "ru";
    sysConfig.siteCode = "ru_LV";
    sysConfig.casLangCode = "ru-lv";
    sysConfig.countryCode = "LV";
    sysConfig.ccpdLangCode = "en";
} else if (digitalData.page.pageInfo.siteCode === "eeru") {
    sysConfig.langCode = "ru";
    sysConfig.language = "ru";
    sysConfig.siteCode = "ru_EE";
    sysConfig.casLangCode = "ru-ee";
    sysConfig.countryCode = "EE";
    sysConfig.ccpdLangCode= "en";
} else if (digitalData.page.pageInfo.siteCode === "mdru") {
    sysConfig.langCode = "ru";
    sysConfig.language = "ru";
    sysConfig.siteCode = "ru_MD";
    sysConfig.casLangCode = "ru-md";
    sysConfig.countryCode = "MD";
} else if (digitalData.page.pageInfo.siteCode === "qaar") {
    sysConfig.langCode = "ar";
    sysConfig.language = "ar";
    sysConfig.siteCode = "ar_QA";
    sysConfig.casLangCode = "ar-qa";
    sysConfig.countryCode = "QA";
    sysConfig.ccpdLangCode= "en";
    sysConfig.captchaLangCode = "ar"
} else if (digitalData.page.pageInfo.siteCode === "omar") {
    sysConfig.langCode = "ar";
    sysConfig.language = "ar";
    sysConfig.siteCode = "ar_OM";
    sysConfig.casLangCode = "ar-om";
    sysConfig.countryCode = "OM";
    sysConfig.ccpdLangCode= "en";
    sysConfig.captchaLangCode = "ar"
} else if (digitalData.page.pageInfo.siteCode === "bhar") {
    sysConfig.langCode = "ar";
    sysConfig.language = "ar";
    sysConfig.siteCode = "ar_BH";
    sysConfig.casLangCode = "ar-bh";
    sysConfig.countryCode = "BH";
    sysConfig.ccpdLangCode= "en";
    sysConfig.captchaLangCode = "ar"
} else if (digitalData.page.pageInfo.siteCode === "joar") {
    sysConfig.langCode = "ar";
    sysConfig.language = "ar";
    sysConfig.siteCode = "ar_JO";
    sysConfig.casLangCode = "ar-jo";
    sysConfig.countryCode = "JO";
    sysConfig.ccpdLangCode= "en";
    sysConfig.captchaLangCode = "ar"
} else if (digitalData.page.pageInfo.siteCode === "lbar") {
    sysConfig.langCode = "ar";
    sysConfig.language = "ar";
    sysConfig.siteCode = "ar_LB";
    sysConfig.casLangCode = "ar-lb";
    sysConfig.countryCode = "LB";
    sysConfig.ccpdLangCode= "en";
} else if (digitalData.page.pageInfo.siteCode === "kzkk") {
    sysConfig.langCode = "kk";
    sysConfig.language = "kk";
    sysConfig.siteCode = "kk_KZ";
    sysConfig.casLangCode = "kk_kz";
    sysConfig.countryCode = "KZ";
    sysConfig.ccpdLangCode= "en";
} else if (digitalData.page.pageInfo.siteCode === "cafr") {
    sysConfig.captchaLangCode = "fr"
} else if (digitalData.page.pageInfo.siteCode === "dzar") {
    sysConfig.captchaLangCode = "ar"
} else if (digitalData.page.pageInfo.siteCode === "maar") {
    sysConfig.captchaLangCode = "ar"
} else if (digitalData.page.pageInfo.siteCode === "mn") {
    sysConfig.captchaLangCode = "mn"
} else if (digitalData.page.pageInfo.siteCode === "tnar") {
    sysConfig.captchaLangCode = "ar"
};

var requestConfig = {
    channelCode: sysConfig.channelCode,
    countryCode: sysConfig.countryCode,
    langCode: sysConfig.langCode,
    country : sysConfig.countryCode,
    language:sysConfig.language,
    siteCode : sysConfig.siteCode,
    ccpdLangCode:sysConfig.ccpdLangCode,
    siteCode4Honor: sysConfig.siteCode4Honor,
    isHonor: location.pathname.startsWith('/honor') || location.pathname.startsWith('/content/honor'),
    groupCode: {}
};

let excludeDomainList = window.digitalData.page.pageInfo.excludeDomainList || '';
if (excludeDomainList) {
    excludeDomainList = excludeDomainList.split(',');
} else {
    excludeDomainList = [];
}

function domainConsistencyCheck(currentApiUrl) {
    if (!window.digitalData || !window.digitalData.page || !window.digitalData.page.pageInfo || !window.digitalData.page.pageInfo.checkDomain) {
        return currentApiUrl;
    }
    if (check(currentApiUrl)) {
        return domainCheck(currentApiUrl);
    }
    return currentApiUrl;
}

function domainCheck(url) {
    let apiHost;
    try {
        apiHost = new URL(url).host;
    } catch (e) {
        return url;
    }
    let currentHostDomain = extractDomain(location.hostname);
    let apiHostDomain = extractDomain(apiHost);
    if ((apiHostDomain !== '.huawei.com' && apiHostDomain !== '.huawei.cn') || currentHostDomain === apiHostDomain) {
        // 仅处理.huawei.com/.cn域名
        return url;
    }
    return url.replace(apiHostDomain, currentHostDomain);
}

function extractDomain(host) {
    let hostArr = host.split('.');
    let length = hostArr.length;
    if (length >= 2) {
        return '.' + hostArr.slice(length-2, length).join('.');
    }
    return host;
}

function check(url) {
    return excludeDomainList.filter(excludeDomain => {
        return url.startsWith(excludeDomain);
    }).length === 0;
}

(function () {
    if (!window.digitalData || !window.digitalData.page || !window.digitalData.page.pageInfo || !window.digitalData.page.pageInfo.checkDomain) {
        return;
    }
    $.ajaxPrefilter((options) => {
        let currentApiUrl = options.url;
        try {
            if (check(currentApiUrl)) {
                options.url = domainCheck(currentApiUrl);
            }
        } catch (e) {
        }
    })
})();
var NoJsonpCountry = new Array("MX", "CL", "PE", "CO", "LATIN", "AR", "BR")

// ajax等待动画
function ajaxLoadingAnimate() {
    if (apiSysConfig.enabledAjaxLoadingAnimate == true) {
        //显示ajax等待动画
        $("body").append("<div class=\"ajax-animate\"></div>");
        $(".ajax-animate").addClass("show");
    }
}

// 清除登录信息
function removeLoginInfo() {
    removeLoginCookie();
    $.removeCookie("loginCallback", {path: "/"});
    $.removeCookie("agree-privacy-policy", {path: "/"})
    if (isUnifiedLoginSite()) {
        removeUnifiedLoginCookie();
    }
}

//处理String-》Json
function handleStringToJson(str) {
    if (str.indexOf("(") > 0) {
        var stData = str.split("(")[0];
        str = str.replace(stData, "");
        str = str.substr(1, str.length);
    } else {
        str = str.substr(1, str.length);
    }
    str = str.substr(0, str.length - 1);
    var json = JSON.parse(str);
    return json;
}

//处理鉴权相关500003错误码登录
function handleLogin() {
    if (!isShowLogin()) {
        return;
    }
    removeLoginInfo();
    if ($(".user-center").data("isPreviewMode")) {
        window.location.href = casUrl + "/logout?service=" + encodeURIComponent($(".login-menu-component").attr("data-support-url"));
        return;
    }
    window.location.href = getLoginUri();
}

/**
 * 基础请求封装
 */
var userLogin = {
    request: function (relativeUrl, requestData, success, error, async) {
        if (apiurl == null || apiurl == "") {
            return;
        }
        var _requestData = requestData;
        ajaxLoadingAnimate()

        var url = apiurl + relativeUrl;
        if (relativeUrl.indexOf("http") == 0) {
            url = relativeUrl;
        }
        if (async === undefined) {
            async = apiSysConfig.async;
        }
        if (NoJsonpCountry.indexOf(sysConfig.countryCode) > -1) {
            $.ajax({
                url: url,
                type: "GET",
                dataType: "html",
                data: _requestData,
                async: async,
                success: function (data, textStatus, request) {
                    //处理String-》Json
                    data = handleStringToJson(data);
                    try {
                        if (data.responseCode != null && data.responseCode == "500003") {
                            handleLogin();
                        }
                    } catch (e) {
                    }
                    success && success(data);
                    apiSysConfig.enabledAjaxLoadingAnimate && $($(".ajax-animate")[0]).remove();
                },
                complete: function () {
                },
                error: function () {
                    error && error();
                    apiSysConfig.enabledAjaxLoadingAnimate && $($(".ajax-animate")[0]).remove();
                }
            });
        } else {
            $.ajax({
                url: url,
                type: "GET",
                dataType: "jsonp",
                jsonp: "jsonp",
                data: _requestData,
                async: async,
                success: function (data) {
                    try {
                        if (data.responseCode != null && data.responseCode == "500003") {
                            handleLogin();
                        }
                    } catch (e) {
                    }
                    success && success(data);
                    apiSysConfig.enabledAjaxLoadingAnimate && $($(".ajax-animate")[0]).remove();
                },
                complete: function () {
                },
                error: function () {
                    error && error();
                    apiSysConfig.enabledAjaxLoadingAnimate && $($(".ajax-animate")[0]).remove();
                }
            });
        }
    },
}
;$(function () {
    /*delete left or right some Specified character eg:lab "_" */
    String.prototype.trimSpecial = function (char) {
        if (char) {
            return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
        }
        return this.replace(/^\s+|\s+$/g, '');
    };
    setTimeout(function () {
        $(".a-sup-common,#accountNumber,#accountHeader").on("click", function () {
            try {
                const lab = $(this).attr('lab') ? getContent($(this).attr('lab')) : 'Error: Not Maintain Value';
                const act = $(this).attr('act') ? getContent($(this).attr('act')) : 'Error: Not Maintain Value';
                const cat = $(this).attr('cat') ? getContent($(this).attr('cat')) : 'Error: Not Maintain Value';
                ga('send', 'event', cat, act, lab);
                ga4SendByAttr(cat, act, lab, $(this).parents('[data-gaevent]'));
            } catch (e) {
            }
        })
    }, 3000);
    const supportListenerV27 = "expressRepaireServiceModify expressRepaireServiceSubmit repairStatusInquirySumbit doorToDoorServiceSubmit appointmentServiceModify appointmentServiceSubmit warrantyQuerySubmit topicPageInteractions topicListSiteSearch mailServiceSubmit homePageSiteSearch sparePartsPriceSubmit userCenterAdd userCenterModify userCenterDelete";
    $(document).on(supportListenerV27, function (event) {
        try {
            const cat = DataLayerUtil.getEvent(event.type, 'cat');
            const act = DataLayerUtil.getEvent(event.type, 'act');
            const lab = DataLayerUtil.getEvent(event.type, 'lab');
            ga('send', 'event', cat, act, lab)
        } catch (e) {
        }
    });
});

class HwbrInvoke {
    callbacks = {}
    callbackStatus = {
        NO_RESULT: 0,
        OK: 1,
        CANCEL: 2
    }
    hwbrCallbackId = Math.floor(Math.random() * 2000000000)
    isProcessing = false
    messagesFromNative = []

    nextTick(callback) {
        let that = this;
        const timer = setTimeout(() => {
            clearTimeout(timer)
            callback.bind(that)();
        }, 0)
    }

    callbackFromNative(callbackId, isSuccess, status, args, keepCallback) {
        const callback = this.callbacks[callbackId];
        if (callback) {
            if (isSuccess && status === this.callbackStatus.OK) {
                callback.success.call(null, args)
            } else if (!isSuccess) {
                callback.fail.call(null, args, status)
            }
            if (!keepCallback) {
                delete this.callbacks[callbackId]
            }
        }
    }

    exec(successCallback, failCallback, service, action, args) {
        const execCallbackId = service + this.hwbrCallbackId++;
        if (successCallback || failCallback) {
            this.callbacks[execCallbackId] = {
                success: successCallback,
                fail: failCallback
            }
        }
        const messages = window._hwbrNative
            && typeof window._hwbrNative.invoke === 'function'
            && window._hwbrNative.invoke(service, action, execCallbackId, args, -1);
        if (messages) {
            this.messagesFromNative.push(messages);
            this.nextTick(this.processMessages)
        }
    }

    invoke(service, action, args, success, fail, cancel, complete) {
        if (window._hwbrNative) {
            const hasCallback = success || fail || cancel || complete;
            this.exec(hasCallback ? successParams => {
                    success && success(successParams);
                    complete && complete(successParams)
                }
                : null, hasCallback ? (failParams, status) => {
                    if ((status === this.callbackStatus.CANCEL) && cancel) {
                        cancel(failParams)
                    } else {
                        fail && fail(failParams, status)
                    }
                    complete && complete(failParams, status)
                }
                : null, service, action, [JSON.stringify(args)])
        }
    }

    buildPayload(payload, message) {
        const trans = {
            s: function (msg) {
                return msg.slice(1)
            },
            t: function (msg) {
                return true
            },
            f: function (msg) {
                return false
            },
            N: function (msg) {
                return null
            },
            n: function (msg) {
                return Number(msg.slice(1))
            },
            A: function (msg) {
                return atob(msg.slice(1))
            },
            S: function (msg) {
                return atob(msg.slice(1))
            },
        };
        payload.push((trans[message.charAt(0)] || (function (msg) {
                return JSON.parse(msg)
            }
        ))(message))
    }

    processMessage(message) {
        const firstChar = message.charAt(0);
        if (firstChar === 'S' || firstChar === 'F') {
            const success = firstChar === 'S';
            const keepCallback = message.charAt(1) === '1';
            const spaceIdx = message.indexOf(' ', 2);
            const status = Number(message.slice(2, spaceIdx));
            const nextSpaceIdx = message.indexOf(' ', spaceIdx + 1);
            const msgCallbackId = message.slice(spaceIdx + 1, nextSpaceIdx);
            const payloadMessage = message.slice(nextSpaceIdx + 1);
            let payload = [];
            this.buildPayload(payload, payloadMessage);
            if (payload.length === 1) {
                payload = payload[0]
            }
            this.callbackFromNative(msgCallbackId, success, status, payload, keepCallback)
        }
    }

    processMessages() {
        if (this.isProcessing || this.messagesFromNative.length === 0) {
            return
        }
        this.isProcessing = true;
        try {
            const message = this.popMessageFromQueue();
            this.processMessage(message)
        } finally {
            this.isProcessing = false;
            if (this.messagesFromNative.length > 0) {
                this.nextTick(this.processMessages)
            }
        }
    }

    popMessageFromQueue() {
        let messageBatch = this.messagesFromNative.shift();
        if (messageBatch === '*') {
            return '*'
        }
        const spaceIdx = messageBatch.indexOf(' ');
        const msgLen = Number(messageBatch.slice(0, spaceIdx));
        const message = messageBatch.substring(spaceIdx + 1, spaceIdx + 1 + msgLen);
        messageBatch = messageBatch.slice(spaceIdx + msgLen + 1);
        if (messageBatch) {
            this.messagesFromNative.unshift(messageBatch)
        }
        return message
    }
}
const hwbrInvoke = new HwbrInvoke()

$(() => {
    if (!window.hwbr) {
        // hwbr.callbackFromNative需要开放到window下，客户端会回调此方法
        window.hwbr = {}
    }
    const fns = []
    if (typeof window.hwbr.callbackFromNative === 'function') {
        fns.push(window.hwbr.callbackFromNative)
    }

    fns.push((callbackId, isSuccess, status, args, keepCallback) => {
        hwbrInvoke.callbackFromNative(callbackId, isSuccess, status, args, keepCallback)
    })

    window.hwbr.callbackFromNative = (...args) => {
        fns.forEach(fn => fn(...args))
    }
});
/**
 * 创建切换登录登出的AuthController单例的类
 * 整合相关方法到AuthController类上，方便后续扩展
 * 备注：jQuery的延迟对象转promise对象的实现与ECMA标准规
 * 范的原生Promise有细微差异，也没有灵活性，所以未使用
 * 采用闭包形式，隔离接口urls
 * @type {AuthController}
 */
var AuthController = (function (win) {
	var singleton = null;
	var pageConfig = win.sysConfig;
	var mktConfig = win.mktConfig;

	var uumApi = mktConfig.uumApi;
	var sgwApi = mktConfig.sgwApi;
	var errMsg = 'The sgwApi parameter is not configured!';
	var uumLogOut = mktConfig.uumApi.endsWith('users') ? '/v1/logout/gotoLogout' : '/users/v1/logout/gotoLogout';
	var shuttleToUrls = {
		getAuthUrls: sgwApi + '/myhuawei/uum/appLoginRegister/1',
		logout: mktConfig.uumApi + uumLogOut,
		userInfo: sgwApi + '/myhuawei/uum/info/1'
	};

	// UUM过期时间4小时
	var expireTime = 4 * 60 * 60 *1000;

	/**
	 * 声明一个单例类
	 * @returns {null|AuthController}
	 * @constructor
	 */
	function AuthController() {
		if (singleton) {
			return singleton;
		}

		this.SGW_APP_ID = 'EDCF82D77A5AB59706CD5F2163F67427';

		return (singleton = this);
	}

	/**
	 * 检测sgwApi有没有值【暂时只检测sgwApi】
	 * @param isThrowErr 是否抛出错误对象
	 * @returns {boolean} 返回布尔值类型的结果
	 */
	AuthController.prototype.checkBaseUrl = function (isThrowErr) {
		if (!sgwApi) {
			if (isThrowErr) {
				throw new Error(errMsg);
			}

			return false;
		}

		return true;
	};

	/**
	 * 判断是否是电商的页面
	 * @returns {boolean}
	 */
	AuthController.prototype.isEcComSitePage = function(){
		try{
			return (isECommerceSite === 'Self-eCommerce' || isECommerceSite === 'Fusion-eCommerce') && typeof ecCom !== 'undefined';
		}catch(e){
			return false;
		}
	}

	AuthController.prototype.isSupportPage = function() {
		return location.href.indexOf('/support/') > 0;
	}

	/**
	 * 获取用户信息
	 * @param isAsync
	 * @returns {Promise<unknown>|object|null}
	 */
	AuthController.prototype.getUserInfo = function (isAsync) {
		var _isAsync = typeof isAsync === 'boolean' ? isAsync : false;
		var ctx = this;
		var options = {
			url: shuttleToUrls.userInfo,
			async: _isAsync,
			type: 'get',
			headers: {
				'SGW-APP-ID': ctx.SGW_APP_ID
			},
			xhrFields: {
				withCredentials: true
			}
		};

		if(_isAsync){
			/**
			 * 注意：由于jQuery发送ajax异步请求时与Promise存在一定兼容性问题，success回调函数中不能使用Promise的reject方法抛
			 * 出错误，否则不能用Promise的catch方法捕获到success函数抛出的异步错误
			 */
			return new Promise(function (resolve, reject) {
				$.ajax(
					$.extend({}, options, {
						success: function (res) {
							var isSuccess = res && res.resultCode === 0;

							ctx.__userInfo = isSuccess ? res.data : null;
							ctx.__isLoggedIn = !!ctx.__userInfo;
							resolve(ctx.__userInfo);
						},
						error: function (jqXhr) {
							if (isUserLock(jqXhr)) {
								ctx.__userLocked = true;
								ctx.__userInfo = "lockedUser";
							} else {
								ctx.__userInfo = null;
							}
							reject();
						}
					})
				);
			});
		}

		$.ajax(
			$.extend({}, options, {
				success: function (res) {
					var isSuccess = res && res.resultCode === 0;

					ctx.__userInfo = isSuccess ? res.data : null;
				},
				error: function (jqXhr) {
					if (isUserLock(jqXhr)) {
						ctx.__userLocked = true;
						ctx.__userInfo = "lockedUser";
					} else {
						ctx.__userInfo = null;
					}
				}
			})
		);
		ctx.__isLoggedIn = !!ctx.__userInfo;
		ctx.__expireTime = new Date().getTime() + expireTime;
		return ctx.__userInfo;
	}

	/**
	 * 检测是否已经登录（uum）
	 * @param isAsync
	 * @returns {Promise<boolean>|boolean}
	 */
	AuthController.prototype.checkIsLoggedIn = function (isAsync) {
		var _isAsync = typeof isAsync === 'boolean' ? isAsync : false;
		var ctx = this;
		if (ctx.__expireTime && ctx.__expireTime >= new Date().getTime() && ctx.__userInfo) {
			// 登录未过期, 并且当且已登录, 直接返回true
			return true;
		}
		var resultOrPromise = ctx.getUserInfo(_isAsync);

		if(_isAsync){
			return resultOrPromise.then(function(userInfo){
				ctx.__isLoggedIn = !!userInfo;
				return ctx.__isLoggedIn;
			}).catch(function(){
				ctx.__isLoggedIn = false;
			});
		}

		ctx.__isLoggedIn = !!resultOrPromise;

		return ctx.__isLoggedIn;
	}

	/**
	 * 同步|异步获取登录的跳转链接
	 * @param isAsync 是否异步发起请求
	 * @param targetCbUrl 回调的目标链接，不传值则使用页面链接
	 * @returns {Promise<any>|Object} 返回Promise对象
	 */
	AuthController.prototype.getAuthorUrls = function (isAsync, targetCbUrl) {
		var ctx = this;
		var _isAsync = typeof isAsync === 'boolean' ? isAsync : false;
		var hasBaseUrl = ctx.checkBaseUrl();
		var options = {
			url: shuttleToUrls.getAuthUrls,
			data: {
				callback: targetCbUrl || (document.defaultView.location || document.location).href,
				siteCode: pageConfig.siteCode,
				lang: pageConfig.language || pageConfig.lang,
				countryCode: pageConfig.countryCode
			},
			headers: {
				'SGW-APP-ID': ctx.SGW_APP_ID
			},
			async: _isAsync,
			timeout: 3000,
			dataType: 'json',
		};

		if (!hasBaseUrl) {
			return _isAsync ? Promise.reject(errMsg).catch(console.error) : {};
		}

		if (_isAsync) {
			return new Promise(function (resolve, reject) {
				$.ajax(
					$.extend({}, options, {
						success: function (resData) {
							if (resData && resData.data && Object.keys(resData.data).length) {
								ctx.__authUrls = resData.data;
								resolve(ctx.__authUrls);
							} else {
								reject();
							}
						},
						error: function () {
							reject();
						}
					})
				);
			});
		}

		$.ajax(
			$.extend({}, options, {
				success: function (resData) {
					ctx.__authUrls = resData.data;
				},
				error: function () {
					ctx.__authUrls = null;
				}
			})
		);

		return ctx.__authUrls;
	};

	/**
	 * 获取登录uum接口的url
	 * @param isAsync 是否异步发起请求
	 * @param targetCbUrl 回调的目标链接
	 */
	AuthController.prototype.getLoginUrl = function (isAsync, targetCbUrl) {
		try{
			var _isAsync = typeof isAsync === 'boolean' ? isAsync : false;

			var result = this.getAuthorUrls(_isAsync, targetCbUrl);

			if (isAsync) {
				return result.then(function (urls) {
					return urls.loginWebUrl || targetCbUrl;
				}).catch(console.error);
			}

			return result? result.loginWebUrl : targetCbUrl;
		}catch(err){
			return targetCbUrl;
		}
	};

	/**
	 * 同步登录uum
	 * 排除电商的静默登录，2023.7 新增服务在电商站点情况下也拉起uum登录
	 * @param loginUrl 登录uum的接口url
	 * @param isSilent 是否静默登录（采用jsonp形式）
	 * @param completeCB 完成后的回调函数
	 */
	AuthController.prototype.syncLogin = function (loginUrl, isSilent, completeCB) {
		try{
			if ((this.isEcComSitePage() && !this.isSupportPage()) || !loginUrl) {
				return;
			}

			var _isSilent = typeof isSilent === 'boolean' ? isSilent : true;

			if (_isSilent) {
				$.ajax({
					type: "get",
					dataType: "jsonp",
					jsonp: "jsonp",
					async: false,
					url: loginUrl,
					complete: function () {
						if (supportv2.enableCsrfVerify && pageCategory == 'support') {
							// 各模块每拉起一次登录，都会重新setCookie, 所以必须重新获取csrf-token防止接口403
							ccpcCsrfToken = initToken();
						}
						(typeof completeCB === 'function') && completeCB();
					}
				})
			} else {
				(document.defaultView.location || document.location).href = loginUrl;
			}
		}catch(e){
			console.error('syncLogin: ', e)
		}
	}

	/**
	 * 登出uum
	 * @param targetCbUrl 回调的目标链接，不传值则使用页面链接
	 * @param completeCB 完成后的回调函数
	 * @returns {String | Undefined}
	 */
	AuthController.prototype.syncLogout = function (targetCbUrl, completeCB) {
		if (!uumApi) {
			return;
		}

		try {
			var params = {
				callback: targetCbUrl || (document.defaultView.location || document.location).href,
				siteCode: pageConfig.siteCode,
				lang: pageConfig.language || pageConfig.lang,
				countryCode: pageConfig.countryCode
			};

			$.ajax({
				type: 'get',
				data: params,
				dataType: 'jsonp',
				jsonp: 'jsonp',
				async: false,
				url: shuttleToUrls.logout,
				complete: function () {
					(typeof completeCB === 'function') && completeCB();
				}
			})
		} catch (e) {
			console.error('An error occurred while logging out!');
		}
	};

	/**
	 * app登录
	 *
	 * @param accessToken
	 */
	AuthController.prototype.appLogin = function (accessToken) {
		var that = this
		// 查询用户信息失败，删除登录对应cookie信息
		$.removeCookie("_ext_u_e_", {path:'/'});
		if(that.checkIsLoggedIn()){
			setLoginCookie();
			return;
		}
		const url = sgwApi + '/hsf/uum/webview-login/1'
		const options = {
			url: url,
			async: false,
			type: 'post',
			contentType: "application/json",
			dataType: 'json',
			data: JSON.stringify({
				accessToken: accessToken,
				siteCode: pageConfig.siteCode,
				clientType: 96,  // 官网端口代号
			}),
			headers: {
				'SGW-APP-ID': supportv2.ccpcSgwAppId,
				"tCsrfToken": getCsrfToken(that)
			},
			xhrFields: {
				withCredentials: true
			}
		};

		$.ajax(
			$.extend({}, options, {
				success: function (res) {
					if (res) {
						if (res.resultCode === 0) {
							sessionStorage.removeItem("appLoginRetry")
							location.reload();
						}

						if (isMHWAppWebview() && res.resultCode === 401 && !sessionStorage.getItem("appLoginRetry")) {
							// app at失效，刷新AT，重新进行登录
							// 重试一次，防止异常
							sessionStorage.setItem("appLoginRetry", "1")
							refreshAppAt();
						}
					}
				}
			})
		);
	}

	/**
	 * app刷新jwt
	 */
	function refreshAppAt() {
		// app js bridge client lib path
		const jsBridgeLibPath = '/etc/designs/huawei-cbg-site/statics/js-bridge.js';
		// 加载 js client lib 成功后绑定相应对作
		$.getScript(jsBridgeLibPath, () => {
			window.clientJsBridge.call(
				{"path": "jsp://com.huawei.phoneservice/account/refreshJWT"}
				, (at) => {
					if (at) {
						location.reload();
					}
				}, () => {
				}
			);
		});
	}

	/**
	 * 是否鸿蒙单框架浏览器打开
	 *
	 * @returns {boolean}
	 */
	AuthController.prototype.isPureHarmony = () => {
		const userAgent = navigator.userAgent;
		return /OpenHarmony|HarmonyOS/i.test(userAgent) && /HuaweiBrowser/i.test(userAgent);
	}

	/**
	 * 调用华为单框架浏览器触发登录
	 *
	 * @param clickedUrl 默认跳转地址
	 * @param failCallback 失败方法回调
	 */
	AuthController.prototype.invokeHwBrLogin = function (clickedUrl, failCallback) {
		try {
			hwbrInvoke.invoke('app', 'getPluginList', "", (res) => {
				if (res && res.includes('linkedLogin')) {
					this.getLoginUrl(true, clickedUrl).then(loginUrl => {
						const loginWebUrl = new URL(loginUrl);
						const searchParams = loginWebUrl.searchParams;
						const clientId = searchParams.get("client_id");
						hwbrInvoke.invoke('linkedLogin', 'isLogin', {
							clientId: clientId
						}, () => {
							hwBrLogin(loginUrl, searchParams, failCallback);
						}, () => {
							failCallback();
						}, () => {
							failCallback();
						})
					})
				} else {
					failCallback();
				}
			}, () => {
				failCallback();
			})
		} catch (e) {
			failCallback();
		}
	}

	/**
	 * 失败场景重新拉起登录，鸿蒙单框架浏览器拉起单框架登录
	 *
	 * @param clickedUrl
	 * @param isAsync
	 */
	AuthController.prototype.reLogin = function (isAsync, clickedUrl) {
		// 当前仅放开给服务使用
		if (this.isPureHarmony() && this.isSupportPage() && !isMHWAppWebview()) {
			this.invokeHwBrLogin(clickedUrl, () => {
				let formatClickedUrl = clickedUrl || location.href.replace('#login', '');
				window.location.href  = this.getLoginUrl(isAsync, formatClickedUrl);
			})

			// 防止浏览器刷新，返回锚点
			return '#login';
		} else {
			return this.getLoginUrl(isAsync, clickedUrl);
		}
	}

	/**
	 * 单框架浏览器登录api调用
	 *
	 * @param loginUrl uum接口获取的接口地址
	 * @param searchParams searchParams
	 * @param failCallback 失败回调
	 */
	function hwBrLogin(loginUrl, searchParams, failCallback) {
		try {
			const clientId = searchParams.get("client_id");
			const accessType = searchParams.get("access_type");
			const scope = searchParams.get("scope");
			const redirectUri = getParameterByRegex(loginUrl,"redirect_uri");
			const uiLocales = searchParams.get("lang");
			hwbrInvoke.invoke('linkedLogin', 'login', {
				clientId: clientId,
				redirectUri: redirectUri,
				accessType: accessType,
				scope: scope,
				ui_locales: uiLocales
			}, (res) => {
			}, (err) => {
				failCallback();
			});
		} catch (e) {
			failCallback();
		}
	}

	/**
	 * redirect_uri等存在特殊参数获取
	 *
	 * @param url
	 * @param paramName
	 * @returns {*|null}
	 */
	function getParameterByRegex(url, paramName) {
		// 转义参数名中的特殊字符
		const escapedParam = paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		// 构建正则表达式匹配参数
		const regex = new RegExp(`[?&]${escapedParam}=([^&#]*)`);
		const match = url.match(regex);

		return match ? match[1] : null;
	}

	function isUserLock(jqXhr) {
		if (jqXhr.status === 403 && jqXhr.responseJSON && jqXhr.responseJSON.result) {
			const result = JSON.parse(jqXhr.responseJSON.result);
			// 账号被锁编码
			return result.resultCode === 202010001;
		}
		return false;
	}

	/**
	 * 获取CSRFToken
	 * @returns {string}
	 */
	function getCsrfToken(ctx) {
		let that = this;
		if (this.CSRFToken) {
			return this.CSRFToken
		}
		var url = sgwApi + '/myhuawei/uum/csrfToken/1?_=' + new Date().getTime();
		var options = {
			url: url,
			async: false,
			type: 'get',
			headers: {
				'SGW-APP-ID': ctx.SGW_APP_ID
			},
			xhrFields: {
				withCredentials: true
			}
		};

		$.ajax(
			$.extend({}, options, {
				success: function (result) {
					if (result && result.resultCode === 0) {
						that.CSRFToken = result.data
					} else {
						that.CSRFToken = ''
					}
				},
				error: function (e) {
					that.CSRFToken = ''
				}
			})
		);

		return that.CSRFToken
	}

	return AuthController;
})(document.defaultView || window);

// 实例化AuthController类
var authController = new AuthController();

/**
 * getATSecurity成功触发后，会回调pushAt方法，app在官网侧登录
 * @param accessToken
 */
window.pushAT = function(accessToken){
	if (accessToken) {
		authController.appLogin(accessToken);
	}
}

function getParameterFromUrl(paramName) {
	// 转义参数名中的特殊字符
	const escapedParam = paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	// 构建正则表达式匹配参数
	const regex = new RegExp(`[?&]${escapedParam}=([^&#]*)`);
	const match = location.href.match(regex);

	return match ? match[1] : null;
}

function isMHWAppWebview() {
	return window.hicareJsInterface && window.hicareJsInterface.getAppCommonInfo;
}

const wecomMiniAccessToken = getParameterFromUrl("at");
if (wecomMiniAccessToken) {
	window.pushAT(wecomMiniAccessToken);
} else if(isMHWAppWebview()){
	processUserLogin(authController.getUserInfo(false));
	// MHW-APP嵌入标识, 0不强制拉起登录,若app登录则拉起登录, 1则需要强制拉起登录
	window.hicareJsInterface.getATSecurity(0,'CBG-SITE_Service');
} else {
	if (window.isECommerceSite !== 'None' && window.isEcommercePage) {
		// 电商站点及电商页面走异步登录
		ecommerceSiteAsyncLogin();
	} else {
		/**
		 * 非电商站点/电商页面走同步方法，获取用户信息，若获取到用户信息
		 * 则塞一个新的cookie _ext_u_e_，用于替换cmkt登录的标识
		 */
		processUserLogin(authController.getUserInfo(false));
	}
}

function ecommerceSiteAsyncLogin() {
	authController.getUserInfo(true)
		.then((userInfo) => {
			processUserLogin(userInfo);
		}).catch(() => {
		processUserLogin();
	});
}

function processUserLogin(userInfo) {
	if (authController.__userLocked) {
		setLoginCookie();
		const $userAccountLock = $('#userAccountLock');
		const title = $userAccountLock.data('title') || '注销服务申请已通过';
		const desc = $userAccountLock.data('desc') || '正在为您注销服务中，该华为账号暂无法使用我的华为相关服务，敬请谅解。';
		const btnTxt = $userAccountLock.data('btn') || '确定';

		showRestrictionLoginDialog({
			title: title,
			desc: desc,
			okStr: btnTxt,
			dailogClass: "user-lock-wrap restrictionLogin"
		}, () => {
			uumLogout(window.location.href);
		});
		return;
	}
	if (userInfo) {
		setLoginCookie();
	} else {
		// 查询用户信息失败，删除登录对应cookie信息
		$.removeCookie("_ext_u_e_", {path:'/'});
	}
}

var casUrl = "";
var apiurl = "";
var cmktUrl = "";
var huaweitimeApiUrl = "";
var riskControl2cApiUrl = "";
if ((typeof supportv2 != "undefined") && (typeof supportv2.apiBaseUrl != "undefined")) {
	apiurl = supportv2.apiBaseUrl;
}
if ((typeof supportv2 != "undefined") && (typeof supportv2.casUrl != "undefined")) {
	casUrl = supportv2.casUrl;
}
if ((typeof supportv2 != "undefined") && (typeof supportv2.toCApiUrl != "undefined")) {
	riskControl2cApiUrl = supportv2.toCApiUrl + '/2cRiskControl';
}
if ((typeof supportv2 != "undefined") && (typeof supportv2.cmktApiUrl != "undefined")) {
	cmktUrl = supportv2.cmktApiUrl;
}
if ((typeof loginApiUrl != "undefined") && (typeof loginApiUrl.huaweitimeApiUrl != "undefined")) {
	huaweitimeApiUrl = loginApiUrl.huaweitimeApiUrl;
}
if (window.location.href.indexOf("debugClientLibs")<0 ){
	window.console.log=function(){}
}
var apiSysConfig = {
	async: true,
	contentType: "application/x-www-form-urlencoded;charset=utf-8",
	enabledAjaxLoadingAnimate: false,
	ajaxAnimateGif: "img_con_v27_gif_loading.gif",
};

/**
 * 设置cmktLogin cookie
 */
function setLoginCookie() {
	let exp = new Date();
	// 4小时转化为毫秒
	exp.setTime(exp.getTime() + 4 * 60 * 60 * 1000);
	window.document.cookie = "_ext_u_e_" + "=" + "1" + ";path=" + "/" + ";expires=" + exp.toGMTString();
}
/**
 * 获取当前地址的参数
 * @param name
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg); //匹配目标参数
	if (r != null) {
		return decodeURIComponent(r[2]);
	}
	return null; //返回参数值
}

function isLogin() {
	return !!$.cookie("_ext_u_e_");
}

/**
 * 获取跳转链接，默认shopLogin为false，即默认取mkt登录地址
 * @param clickUrl 用户自定义的登录网址
 */
function getLoginUri(clickUrl){
	return new AuthController().reLogin(false, getSiteUrl(clickUrl));
}

/**
 * 预留空方法，防止minisite使用报错
 */
function processLoginStatus() {
}

/**
 * 获取跳转链接
 *
 * @param clickurl
 *学堂 的登录网址
 */
function newGetHuaweiTimeLoginUri(clickurl){
	if(casUrl == null || casUrl == ""){
		return "";
	}
	var siteUrl = getSiteUrl(clickurl);
	var baseLoginUrl;
	var loginUrl;
	var callbackUrl = huaweitimeApiUrl+"/login/cloudplatforms?siteURL=" + encodeURIComponent(siteUrl);
	if ($(window).width() > 767) {
		baseLoginUrl = casUrl+"/portal/loginAuth.html";
		loginUrl = casUrl+"/remoteLogin?reqClientType="+sysConfig.reqClientType+"&loginChannel=27000000&countryCode="+sysConfig.countryCode+"&lang="+sysConfig.casLangCode+"&themeName=red&loginUrl=" + encodeURIComponent(baseLoginUrl);
		loginUrl += "&service=" + encodeURIComponent(callbackUrl);
	}else {
		baseLoginUrl = casUrl+"/portal/loginAuth.html";
		loginUrl = casUrl+"/remoteLogin?reqClientType="+sysConfig.reqClientType+"&loginChannel=27000002&countryCode="+sysConfig.countryCode+"&lang="+sysConfig.casLangCode+"&themeName=huawei&loginUrl=" + encodeURIComponent(baseLoginUrl);
		loginUrl += "&service=" + encodeURIComponent(callbackUrl);
	}
	return loginUrl;
}

function getSiteUrl(clickUrl) {
	var siteUrl = window.location.href;
	if(siteUrl.indexOf("loginCallback=true") === -1){
		if (siteUrl.indexOf("?") > 0) {
			siteUrl = siteUrl + "&loginCallback=true";
		} else {
			siteUrl = siteUrl + "?loginCallback=true";
		}
	}
	if(clickUrl){
		if (clickUrl.indexOf('http://') === 0 || clickUrl.indexOf('https://') === 0) {
			siteUrl = clickUrl;
		} else{
			siteUrl =location.origin + clickUrl;
		}
	}
	return siteUrl;
}

/**
 * 获取用户信息接口地址参数
 * @param name
 */
function getNewUserUrl(){
	return window.location.href;
}

/**
 *
 * 获取注册地址
 * @returns
 */
function getRegisterUrl(registerType){
	var registerUrl = "";
	if(casUrl){
		if ($(window).width() > 1023) {
			registerUrl = casUrl + "/portal/userRegister/" + (registerType == "phone" ? "regbyphone.html" : "regbyemail.html") + "?reqClientType=" + sysConfig.reqClientType + "&loginChannel=27000000&countryCode=" + sysConfig.countryCode + "&loginUrl=" + encodeURIComponent(casUrl + "/portal/loginAuth.html") + "&service="
				+ encodeURIComponent(location.href) + "&lang=" + sysConfig.casLangCode + "&themeName=red";
		}else{
			registerUrl = casUrl + "/mobile/standard/register/wapRegister.html" + "?reqClientType=" + sysConfig.reqClientType + "&loginChannel=27000000&countryCode=" + sysConfig.countryCode + "&loginUrl=" + encodeURIComponent(casUrl + "/mobile/standard/wapLogin.html") + "&service="
				+ encodeURIComponent(location.href) + "&lang=" + sysConfig.casLangCode + "&themeName=huawei";
		}
	}
	return registerUrl;
}
/**
 * 获取注销地址
 * @returns
 */
function uumLogout(redirectUrl){
	new AuthController().syncLogout(redirectUrl, function () {
		$(document).trigger('privacyPopup',true);
		window.location.href = (redirectUrl==null)?Mkt.Util.getSafeUrl(window.location.href):Mkt.Util.getSafeUrl(redirectUrl);
	});
}

/**
 * 获取云账号信息，用mkt未登录，则不调用
 * @param name
 */
function getHuaweiAccount(){
	if(!isLogin()){
		return;
	}

	if (!authController.__userInfo) {
		removeLoginCookie();
		/* 登录失败 */
		loginstate = 3 ;
		//若此时论坛或cmsc等为登录状态，尝试拉起uum登录
		loginWhenExpires();
		return;
	}
	var userInfo = authController.__userInfo;
	buildUserLoginInfo(userInfo);
	//儿童登录限制
	var isEcom = isECommerceSite == "Self-eCommerce" || isECommerceSite == "Fusion-eCommerce";
	var isAemEdit = $("#is-edit-mode").val() == "true";
	if(!isEcom && !isAemEdit && userInfo.ageGroupFlag && userInfo.ageGroupFlag == "2" && underageTips && underageTipsBtn){
		//官网儿童登录限制
		queryAemServiceConfig(filterXSS(underageTips),filterXSS(underageTipsBtn));
	}
	thirdPartyLogin();
}

/**
 * 调用ServiceConfigAEM平台的配置项
 * @param title 提示信息
 * @param btnText 提示信息确认按钮
 */
function queryAemServiceConfig(title, btnText) {
	//预约
	var reservation = $(".reservation").length > 0 && $(".html-text-component .reservation").length === 0;
	var reservationForeign = $(".reservation-foreign").length > 0 && $(".html-text-component .reservation-foreign").length === 0;
	//寄修
	var expressRepair = $(".express-repair-edit").length > 0 && $(".html-text-component .express-repair-edit").length === 0;
	var expressRepairForeign = $(".express-application-foreign").length > 0 && $(".html-text-component .express-application-foreign").length === 0;
	var noLoginExpressRepair = $(".express-repair-edit.login-free").length === 0;
	//用户中心
	var userCenter = $(".left-tag-container-component").length > 0 && $(".html-text-component .left-tag-container-component").length === 0;
	//预约回电
	var reservationCallback = $(".reservation-callback-component").length > 0 && $(".html-text-component .reservation-callback-component").length === 0;
	var homePageUrl = "https://"+ window.location.host +"/"+ siteCode +"/support/";
	if(reservation || reservationForeign || expressRepair || expressRepairForeign || !noLoginExpressRepair || userCenter || reservationCallback){
		setTimeout(function(){
			//统一登录执行异步注销
			uumLogout(homePageUrl);
		}, 3000);
	}
	var lastUrl = window.location.href;
	showRestrictionLoginDialog({
		title: title,
		okStr: btnText,
		dailogClass: "restrictionLogin"
	}, function() {
		//执行注销
		uumLogout(lastUrl);
	});

}

/**显示对话框
 * config title 提示语
 * config.okStr 确认按钮文案
 * */
function showRestrictionLoginDialog(config, okCallback, cancelCallback) {
	var content =
		"<div class='s-dialog "+(config.dailogClass ? config.dailogClass : "")+"'>" +
		"   <div class='s-content-dialog'>" +
		"       <div class='s-dialog-title'>" +
		"           <p>" + config.title + "</p>" +
		"       </div>" +
		(config.desc ? ("<div class='desc-wrap'><p>"+ config.desc +"</p></div>") : "") +
		"       <div class='s-dialog-btn'>" +
		"           <a class='s-btn s-ok-btn' href='javascript:;' >" + config.okStr + "</a>" +
		"       </div>" +
		"       <div class='close'><i></i></div>" +
		"   </div>" +
		"</div>";
	$("body").append(content);
	setTimeout(function () {
		$("body").addClass('scroll-disabled');
		$(".s-dialog .s-content-dialog").toggleClass("s-show");
	}, 500);

	$(".s-dialog .s-ok-btn").on("click", function () {
		var cancelDesc = $(".s-reason-dialog .s-advice").val();
		var cancelResonCode = $(".s-cancel-reason label.red_selected").attr("cancelResonCode");
		$(".s-dialog .s-content-dialog").toggleClass("s-show");
		$(this).off("click");
		setTimeout(function () {
			$("body > .s-dialog").remove();
			$("body").removeClass('scroll-disabled');
			okCallback && okCallback();
		}, 500);
		$(".s-dialog .s-ok-btn,.s-dialog .s-cancel-bt,.s-dialog .close").off("click");

	});

	$(".s-dialog .close").on("click", function () {
		$(".s-dialog .s-content-dialog").toggleClass("s-show");
		$(this).off("click");
		setTimeout(function () {
			$("body > .s-dialog").remove();
			$("body").removeClass('scroll-disabled');
			okCallback && okCallback();
		}, 500);
		$(".s-dialog .s-ok-btn,.s-dialog .s-cancel-bt,.s-dialog .close").off("click");
	});
}

/**
 * 嘗試重新拉起mkt登錄后，查詢用戶信息
 */
function getHuaweiAccountByRetry(){
	if(!isLogin()){
		return;
	}
	var userInfo = authController.getUserInfo(false)
	if (userInfo == null) {
		removeLoginCookie();
		/* 登录失败 */
		loginstate = 3 ;
		return;
	}
	setLoginCookie();
	buildUserLoginInfo(userInfo);
	thirdPartyLogin();
}

function buildUserLoginInfo(userInfo) {
	loginstate = 0;
	// 待SHA加密
	window.encUser = userInfo.userId;
	var userAccount = anonymizatizeName(userInfo.userAccount);
	logininfo = {
		"cbgid": userInfo.userId,
		"ac_loNa": userAccount,
		"username": userAccount || anonymizatizeName(userInfo.userName) || userInfo.nickName
	}
}

/**
 huaweitime异步登录
 **/
function huaweiTimeLogin(){
	if(casUrl && requestConfig.countryCode === 'CN'){
		$.ajax({
			type:"get",
			dataType:"jsonp",
			jsonp:"jsonp",
			url:newGetHuaweiTimeLoginUri(getNewUserUrl()),
			complete: function(){
				uumLogin();
			}
		})
	}
}

/**
 * 如果uum未登录，则重新拉起uum登录
 */
function uumLogin() {
	var authController = new AuthController();
	if(isLogin() && !authController.checkIsLoggedIn(false)) {
		authController.getLoginUrl(true)
			.then(function (loginUrl) {
				authController.syncLogin(loginUrl, true, function () {
					$(document).trigger('privacyPopup');
				});
			});
	}
}

/**
 * 处理cmkt/cmsc和华为学堂的登录互通
 */
function processCmscAndHuaweiTimeLoginStatus(){
	if (typeof loginApiUrl === 'undefined') {
		return;
	}
	if (!!$.cookie("_ext_u_e_") && !$.cookie("userID") && loginApiUrl.huaweitimeApiUrl) {
		//学堂未登录则调用一次登录
		huaweiTimeLogin();
	}
}

/**
 * 登录失效后尝试重新拉起登录
 */
function loginWhenExpires(){
	if (isUnifiedLoginSite()) {
		//论坛、电商统一登录场景
		var vLogged = !!((typeof ecCom != "undefined") && ecCom.isVisitor());
		//论坛、电商、cmsc登录时拉起官网
		if((!vLogged && $.cookie("ec-loginStatus")) || $.cookie("cbgcommunityUserinfo"+digitalData.page.pageInfo.countryCode) || $.cookie("_ext_u_e_")){
			$.ajax({
				type:"get",
				dataType:"jsonp",
				url:getLoginUri(getNewUserUrl()),
				complete : function(){
					//重新查询
					loginstate = -1;
					getHuaweiAccountByRetry();
				}
			})
		}
	}
}

/*
 * 判断是否统一登录站点
 */
function isUnifiedLoginSite(){
	try{
		if(isECommerceSite){
			return isECommerceSite === "Self-eCommerce" || isECommerceSite === "Fusion-eCommerce";
		}
	}	catch(e){

	}
	return false;
}

$(function () {
	if ( ($(".login-menu-component").length == 0 && $(".huawei-v4 .login-v4-wrap .login-v4 .login-v4-cnt .show-login").length == 0 )) {
		return;
	}
	getHuaweiAccount();
	if(sysConfig.siteCode === "en_EN"){
		return;
	}
	processCmscAndHuaweiTimeLoginStatus();

	var nl = $('.login-menu-component').attr('data-support-login')
	if(typeof(nl) != "undefined" && nl == "no"){
		return;
	}
	$(".conv3_nav .icon_close").after($(".login-menu-component").html());
	setTimeout(function () {

		$(".conv3_nav .navcon  .login-menu").on("mouseenter", function (event) {
			event.stopPropagation();
			$(this).addClass("active");
		});
		$(".conv3_nav .navcon  .login-menu").on("click", function (event) {
			event.stopPropagation();
			if ($(this).hasClass("active")){
				$(this).removeClass("active");
			}else{
				$(this).addClass("active");
			}

		});
		$(".conv3_nav .navcon .login-menu").on("mouseleave", function (event) {
			event.stopPropagation();
			$(this).removeClass("active");
		});


		if (!isLogin()) {
			$(".conv3_nav .navcon  .login-menu.singin").on("click", function (event) {
				event.stopPropagation();
				$.removeCookie("AuthorizationInfo", {path:"/"});
			});
		}
		else {
			//已登录
			$(".conv3_nav .navcon  .login-menu").addClass("singin");
			getUserInfoFromUum(contactUserInfo);
			setTimeout(function () {
				$(".login-menu.singin").click(function (event) {
					event.stopPropagation();
					if (isLogin()) {
						window.location.href = $(".login-menu-component").attr("data-support-usercenter-url");
					}
					if ($(this).hasClass("active")) {
						$(this).removeClass("active");
					} else {
						$(this).addClass("active");
					}

				})
			})
		}
	}, 200);

	$(".huawei-v3 .header-wrap .right-box .login .login-wrap .login-cnt ul li.track-order-v3,.huawei-v3 .header-wrap .right-box .login .login-wrap .login-cnt ul li.app-track-order-v3").on("click",function(event){
		event.stopPropagation();
	})
});

function websiteLogOut(){
	if (casUrl) {
		$.ajax({
			type:"get",
			dataType:"jsonp",
			url: casUrl+"/logout?service=" + encodeURIComponent(window.location.href),
			success:function(){}
		});
	}
}

function webLogout(){
	removeLoginCookie();
	$.removeCookie("agree-privacy-policy",{path:"/"})
	if(isUnifiedLoginSite()){
		removeUnifiedLoginCookie();
	}
	__isAuth = false;
	isCreateUserInfo = false;
	websiteLogOut();
}

/**
 * 学堂异步登出
 */
function huaweitimeLogout(callback){
	if(loginApiUrl.huaweitimeApiUrl != null && loginApiUrl.huaweitimeApiUrl != ""){
		$.ajax({
			type:"get",
			dataType:"jsonp",
			url: Mkt.Util.getSafeUrl(casUrl+"/logout?service="+encodeURIComponent(loginApiUrl.huaweitimeApiUrl+"/logout/cloudplatforms?siteURL=" + encodeURIComponent(getNewUserUrl()))),
			complete:function(){
				$(document).trigger('privacyPopup',true);
				callback && callback();
			}
		});
	}
}

//登录相关
function needLogin(needLoginFlag) {
	if(!isShowLogin()){
		return;
	}
	// needLoginFlag 用于忽略在编辑模式下的跳转
	if( typeof needLoginFlag == 'undefined'){
		needLoginFlag = $(".user-center").data("isPreviewMode");
	}

	//鉴权
	if (!isLogin()) {
		$(function () {
			setTimeout(function () {
				if (needLoginFlag == false) {
					return;
				}

				window.location.href = getLoginUri(null);
			}, 200)
		})
		removeLoginCookie();
		$.removeCookie("agree-privacy-policy",{path:"/"})
		if(isUnifiedLoginSite()){
			removeUnifiedLoginCookie();
		}
	}
}

function isShowLogin(){
	if(isECommerceSite == "Self-eCommerce" || isECommerceSite == "Fusion-eCommerce"){
		return true;
	}

	var nl = $('.login-menu-component').attr('data-support-login') || $(".huawei-v4 .login-v4-wrap .login-v4 .login-v4-cnt .show-login").attr("data-support-login");
	return !(typeof (nl) != "undefined" && nl == "no");
}

/*鉴权登录*/
$(function () {
	setTimeout(function () {
		$("[data-auth-href]").each(function () {
			$(this).on("click", function (event) {
				var that = this;
				var clickurl = $(this).attr("data-auth-href");
				if(isShowLogin()){
					if (authController.checkIsLoggedIn(false)) {
						window.location.href = $(that).attr("data-auth-href");
					} else {
						if(location.href.indexOf("/express-repair") !=-1 || location.href.indexOf("/reservation") !=-1 || location.href.indexOf("/repair-appointment") !=-1){
							window.location.href=getLoginUri(clickurl);
						}else{
							window.location.href=getLoginUri(location.href);
						}
					}
				}else{
					window.location.href = $(that).attr("data-auth-href");
				}
			});
		});
	}, 1000);
})

/**
 * 注销时删除cookie
 * @returns
 */
function removeLoginCookie(){
	$.removeCookie("_ext_u_e_", {path:'/'});
	$.removeCookie("ac_loNa", {path:'/'});
	$.removeCookie("AuthorizationInfo",{path:"/"});
	$.removeCookie("__isAuth",{path:"/"});
	$.removeCookie("__isCreateUserInfo",{path:"/"});
	$.removeCookie("loginCallback",{path:"/"});
}

/**
 * 若当前站点配置了统一登录，删除统一登录相关的cookie
 * 即删除mkt/服务/论坛/电商等登录逻辑相关数据
 */
function removeUnifiedLoginCookie(){
	try{
		$.removeCookie('cbgcommunityloginStatus',{path:"/"});
		$.removeCookie("cbgLoginTag",{path:"/"});
		sessionStorage.getItem('ec-loginStatus') ? sessionStorage.removeItem('ec-loginStatus') : '';
		$.removeCookie("ec-loginStatus",{path:"/"})

		$.removeCookie("forumLogin",{path:"/"})
		$.removeCookie("ac_loNa", {path:"/"+window.digitalData.page.pageInfo.siteCode2+"/"});

		//兼容旧的论坛注销方式
		$.removeCookie("loginUserinfo",{path:"/"+window.digitalData.page.pageInfo.siteCode2+"/"});
	}catch(e){

	}
}

function showPrivacyPolicy(config, okCallback, cancelCallback) {
	var content =
		"<div class='s-dialog-fr-privacy'>" +
		"   <div class='s-content-dialog'>" +
		"       <div class='s-dialog-title'>" +
		"       </div><div class='s-dialog-content'>" + config.content +
		"       </div><div class='s-dialog-btn'>" +
		"           <a class='s-btn s-cancel-btn'>" +config.cancelStr+ "</a>" +
		"           <a class='s-btn s-ok-btn'>" + config.okStr+ "</a>" +
		"       </div>" +
		"   </div>" +
		"</div>";
	$("body").append(content);
	setTimeout(function () {
		$(".s-dialog-fr-privacy .s-content-dialog").toggleClass("s-show");
	}, 0);

	$(".s-dialog-fr-privacy .s-ok-btn").on("click", function () {
		$(".s-dialog-fr-privacy .s-content-dialog").toggleClass("s-show");
		$(this).off("click");
		setTimeout(function () {
			$("body > .s-dialog-fr-privacy").remove();
			okCallback && okCallback();
		}, 500);
		$(".s-dialog-fr-privacy .s-ok-btn,.s-dialog-fr-privacy .s-cancel-bt").off("click");
	});
	$(".s-dialog-fr-privacy  .s-cancel-btn").on("click", function () {
		$(".s-dialog .s-content-dialog").toggleClass("s-show");
		$(this).off("click");
		setTimeout(function () {
			$("body > .s-dialog-fr-privacy").remove();
			cancelCallback && cancelCallback();
		}, 500);
		$(".s-dialog-fr-privacy .s-ok-btn,.s-dialog-fr-privacy .s-cancel-bt").off("click");
	});

}
/***马来导航集成up登录:
 *背景：1、官网登录成功后，调一次第三方的登录接口
 *	   2、第三方登录的接口在组件里面配置Call Url After Login
 *      3、配置了第三方接口才会调，不配就不调用
 ***/
function thirdPartyLogin(){
	var loginDom = $("i.third-party-login-url");
	if(getUrlParam("loginCallback") !== "true" || sysConfig.countryCode !== "RU" || loginDom.length === 0) {
		return;
	}
	var loginUrl = loginDom.attr("data-callback-url");
	if(loginUrl) {
		$.ajax({
			type:"get",
			url:loginUrl,
			dataType:"jsonp",
			jsonp:"jsonp",
			complete:function(){
				if(isLogin()){
					var authController = new AuthController();
					authController.getLoginUrl(true)
						.then(function(loginUrl){
							authController.syncLogin(loginUrl, true, function () {
								$(document).trigger('privacyPopup');
							});
						});
				}
			}
		})
	}
}

/**
 * iRetail部分  MKT SUPPORT 都有
 */
var apiIRetail = {
	/**功能描述：查询服务热线。
	 *应用场景：问题解决–联系客服–服务热线。
	 */
	getHotline: function (requestData, success) {
		var request = requestData;
		request.countryCode = requestConfig.countryCode;
		request.langCode = requestConfig.langCode;
		userLogin.request("/iRetail/getHotline/1000", request, success);
	}
};

function checkStorageStatus(){
	var _s = false;
	try{
		if(window.localStorage){
			_s = true
		}
	}catch(e){

	}
	return _s
}

// 学堂minisite使用
function getHuaweiTimeLoginUri(clickurl, shopLogin) {
	return getLoginUri(clickurl, shopLogin);
}

/**
 * 新增新知识库搜索‘适用区域’ 参数 特殊站点code 处理
 */
function buildNewKownApplicableRegion(requestData) {
	if(sysConfig.countryCode == 'Global'){
		requestData.applicable_region = '0';
	}else{
		if(digitalData.page.pageInfo.siteCode == "latin"){
			requestData.applicable_region = 'CO';
		}else if(digitalData.page.pageInfo.siteCode == "latinen"){
			requestData.applicable_region = 'US';
		}else if(digitalData.page.pageInfo.siteCode == "levantar"){
			requestData.applicable_region = 'EG';
		}else if(digitalData.page.pageInfo.siteCode == "levant"){
			requestData.applicable_region = 'US';
		}else{
			requestData.applicable_region = sysConfig.countryCode;
		}
	}
	return requestData;
}
/**
 * 用户输入检查
 */
function checkInputStr(str){
	var reg = /^[^"#&'\+;<=>\\]{0,1000}$/
	return reg.test(str)
}
/**
 * 登录状态获取
 */
function getLoginStates(nextstep){
	var extue = $.cookie("_ext_u_e_");
	if( extue && (extue == "1" || extue == 1)){
		nextstep && nextstep();
	}else{
		removeLoginCookie();
		if($(".huawei-v4 .login-v4-wrap .login-v4 .login-v4-cnt .show-login").length > 0){
			uumLogout($(".huawei-v4 .login-v4-wrap .login-v4 .login-v4-cnt .show-login").attr("data-support-url"));
		}else{
			uumLogout($(".login-menu-component").attr("data-support-url"));
		}
	}
}

/**
 * 公共方法，从uum获取用户信息并执行回调方法
 *
 * @param callbackFn 回调方法
 */
function getUserInfoFromUum(callbackFn) {
	var authController = new AuthController();
	var isLoggedIn = authController.__userInfo != null;
	if (!isLoggedIn) {
		var _loginUrl = authController.getLoginUrl(false);
		authController.syncLogin(_loginUrl,true, function(){
			if(!authController.checkIsLoggedIn(false)){
				callbackFn(authController.__userInfo);
			}
		});
	} else {
		callbackFn(authController.__userInfo);
	}
}

/**
 * 拼接信息
 *
 * @param userInfo
 */
function contactUserInfo(userInfo) {
	if (authController.__userInfo) {
		var headPictureUrl = userInfo.headPictureUrl;
		if (headPictureUrl) {
			$("body").append("<style>.login-menu.singin,.login-menu.login-phone.singin .user-logined:before{  background-image:url(" + headPictureUrl + ") }</style>");
		}
		var name = getUumInfoName(userInfo);
		$("body").append("<style>.login-menu.singin .login-menu-contaner:after { content: '" + name + "'; }</style>");
	}
}

/**
 * 获取正确展示的名称
 *
 * @param userInfo uum返回用户信息
 * @returns {string} 名称
 */
function getUumInfoName(userInfo) {
	if (userInfo) {
		var nickName = userInfo.nickName;
		var userName = userInfo.userName;
		return checkNickName(nickName) ? anonymizatizeName(nickName) : anonymizatizeName(userName);
	}
	return "";
}

/**
 * 检查名字属性
 *
 * @param name name属性
 * @returns {boolean} true/false
 */
function checkNickName(name) {
	if (name == "" || name == undefined) {
		return false;
	}
	return !/^\d+$/.test(name);
}

/**
 * 数据脱敏
 *
 * @param value 未脱敏数据
 * @returns {string} 脱敏后数据
 */
function anonymizatizeName(value) {
	var result = "";
	if (value && value.length > 1) {
		if(value.indexOf("@") > -1) {
			var prefixStr = value.substring(0, value.indexOf("@"));
			result = anonymizatizeName(prefixStr) + "@***";
		} else {
			result = value.substring(0, value.length / 2) + getStarString(value);
		}
		return result;
	}
	return "*";
}

/**
 * 获取*字符串
 *
 * @param value 原始字符串
 * @returns {string} 字符串*
 */
function getStarString(value) {
	if (value.length === 0) {
		return "*";
	}
	var result = "";
	for(var i=0; i<Math.floor(value.length/2); i++) {
		result += "*";
	}
	return result;
}

var ccpcCsrfToken;

/**
 * 初始化token
 *
 * @returns {string}
 */
function initToken() {
	var ccpcCsrfToken = '';
	var getTokenUrl = mktConfig.sgwApi + '/myhuawei/uum/csrfToken/1?_=' + Date.now();
	var requstOptions = {
		type: "get",
		url: getTokenUrl,
		headers: {
			"SGW-APP-ID": supportv2.uumSgwAppId
		},
		xhrFields: {
			withCredentials: true
		},
		async: false
	}
	$.ajax($.extend({}, requstOptions, {
		success: function(res) {
			if (res && res.resultCode === 0) {
				ccpcCsrfToken = res.data;
			} else {
				ccpcCsrfToken = "";
			}
		},
		error: function(e) {
			ccpcCsrfToken = "";
		}
	}));
	return ccpcCsrfToken;
}

/**
 * csrfToken校验失败弹框, 点击确认则刷新页面
 */
function tokenExpireConfirmDialog() {
	$("body").append('<div class="token-expire-dialog">' +
		'<div class="token-dialog-wrap">' +
		'<div class="token-dialog-title">' +
		'<h3>' + Mkt.I18n.get('Session timeout, please refresh the page and try again!') + '</h3>' +
		'</div>' +
		'<div class="token-dialog-btn">' +
		'<a class="token-confirm-btn" href="javascript:;">' + Mkt.I18n.get('Yes') + '</a>' +
		'</div>' +
		'<div class="close"></div>' +
		'</div>'+
		'</div>');
	$("body").addClass('dialog-open');
	$('.token-dialog-wrap').stop().toggle(0, function (){
		$(this).addClass('show');
	});
	$('.token-expire-dialog .token-confirm-btn').on('click', function () {
		// 点击确认重新刷新页面
		window.location.reload();
	})
	$('.token-expire-dialog .close').on('click', function () {
		$('.token-expire-dialog').remove();
		$("body").removeClass('dialog-open');
	})
}

(function () {
	if (!supportv2.enableCsrfVerify || pageCategory != 'support') {
		// 开关未开启 或 非服务页面, 不触发改逻辑, 若后续所有站点营销服社调用接口地址3+x一致, 可以删除该判断
		return;
	}
	if (!$.cookie('_ext_u_e_')) {
		// 未登录状态下，进入页面初始化token，登录状态下由登录接口触发
		ccpcCsrfToken = initToken();
	}
	$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
		// 服务中台接口 ajax拦截，用于添加Tcsrftoken header
		if (options.type == 'POST' && (options.url.startsWith(supportv2.apiBaseUrl) || options.url.startsWith(riskControl2cApiUrl) || (typeof ccpcSgwApiUrl != 'undefined' && options.url.startsWith(ccpcSgwApiUrl)))) {
			if (!ccpcCsrfToken) {
				// 再次判断，防止出现空的情况
				ccpcCsrfToken = initToken();
			}
			options.headers = $.extend(options.headers, {
				Tcsrftoken: ccpcCsrfToken
			})
		}
	})
	$(document).ajaxError(function(event,request,settings) {
		// token过期导致接口403拦截
		if (request.status == 403 && request.responseJSON && request.responseJSON.result) {
			var errorResp = JSON.parse(request.responseJSON.result);
			if (errorResp.resultCode == 1010002) {
				tokenExpireConfirmDialog();
			}
		}
	});
})();
var login_leave="";
$(function () {
    if ($(window).width() > 1023) {
        if ($("#header-v3 .nav-wrap .login").length == 0) {
            return;
        }
    } else {
        if($(".app-nav .app-nav-wrap .app-login-icon").length == 0) {
            return;
        }
    }

    /* it添加活动路口 */
    $(".login-cnt .login-other-items").on("click", function(a) {
        a.stopPropagation()
    });

     setTimeout(function () {
        //登录按钮, en站点不适用此方案
        $("#header-v3 .nav-wrap .login .signInBtn, .app-nav .app-login-icon .signInBtn").on("click", function (event) {
        	if(typeof(communityLogin) != "undefined"){
        		return;
        	}
            event.stopPropagation();
            window.location.href=getLoginUri();
        });

        $("#header-v3 .nav-wrap .login").on("mouseenter", function (event) {
            event.stopPropagation();
            $(this).addClass("active");
            clearTimeout(login_leave);
        });

        $("#header-v3 .nav-wrap .login, .app-nav .app-login-icon").on("click", function (event) {
            event.stopPropagation();
            if ($(this).hasClass("active")){
                $(this).removeClass("active");
            }else{
                $(this).addClass("active");
            }

        });
        $("#header-v3 .nav-wrap .login").on("mouseleave",function (event) {
            event.stopPropagation();
            var _t =$(this);
            login_leave=setTimeout(function () {
                _t.removeClass("active");
            }, 300);
        });

        $(".app-login-bullet .app-sign .app-loginout").on("click", function (event) {
        	if(typeof(communityLogin) != "undefined"){
        		return;
        	}
            window.location.href =  $(".app-login-bullet .app-sign .app-loginout").attr("data-url");
        });
        $("#header-v3 .nav-wrap .login .my-exit,.conv3_wrap .user-center .my-exit,.user-info-header .user-info .my-exit, .app-nav .app-login-icon .my-exit").on("click", function (event) {
            event.stopPropagation();
             $.removeCookie("ac_loNa", {path:'/'});
             $.removeCookie("AuthorizationInfo",{path:"/"});
             $.removeCookie("__isAuth",{path:"/"});
             $.removeCookie("__isCreateUserInfo",{path:"/"});
             $.removeCookie("loginCallback",{path:"/"});
             $.removeCookie("agree-privacy-policy",{path:"/"})
             if(isUnifiedLoginSite()){
                 removeUnifiedLoginCookie();
             }

             var reidrectUrl = encodeURIComponent($(".login-menu-component").attr("data-support-url"));
             if(location.href.indexOf("/community/") != -1 && (isUnifiedLoginSite())){
                 reidrectUrl = encodeURIComponent(location.href);
                 if(location.href.indexOf("/community/user-center")!=-1 || location.href.indexOf("/login/")!=-1 ){
                     reidrectUrl = encodeURIComponent(location.href.substring(0,location.href.lastIndexOf("/community/"))+"/community/");
                 }
             }

             window.location.href = Mkt.Util.filterText(casUrl+"/logout?service=" + reidrectUrl);
         });
        if (isLogin() == false) {
            $("#header-v3 .nav-wrap .login.singin, .app-nav .app-login-icon.singin").on("click", function (event) {
                event.stopPropagation();
                $.removeCookie("AuthorizationInfo");
                if (isLogin()) {
                	try{}catch(e){
     	            }
                    window.location.href = $(".login-menu-component").attr("data-support-usercenter-url");
                } else {

                }

            });
        }
        else {
            //已登录
            $("#header-v3 .nav-wrap .login, .app-nav .app-login-icon").addClass("singin");
            $(".login-cnt .shop-bag-bnt").on("click", function (event) {
                event.stopPropagation();
            })
            getUserInfoFromUum(function (userInfo) {
                $(".login.singin .show-logout .singin-user,.app-login-icon.singin  .app-sign-user .singin-user").text(getUumInfoName(userInfo));
            })
            setTimeout(function () {
                $(".login.singin").click(function (event) {
                    event.stopPropagation();
                    if (isLogin()) {
                        window.location.href = $(".login-menu-component").attr("data-support-usercenter-url");
                    } else {

                    }
                    if ($(this).hasClass("active")) {
                        $(this).removeClass("active");
                    } else {
                        $(this).addClass("active");
                    }

                })
            })
        }
    }, 200);
});

/*  community login */

/*
*登录注册功能
*url 传递此参数表示注册，不传表示登录
*/
function forumLogin(url) {
    var href = window.location.href;
    var loginUrl = "https://" + clientLoginUrl + loginPort + "/oauth2/v2/authorize?reqClientType="+ reqClientType +"&response_type=code&client_id=" + clientID + "&redirect_uri=https%3A%2F%2F" + window.location.host + "%2F" + digitalData.page.pageInfo.siteCode2 + "%2Fcommunity%2Flogin%2F&scope=https%3A%2F%2Fwww.huawei.com%2Fauth%2Faccount%2Fbase.profile&display=page&lang=" + sysConfig.casLangCode;
    url && (loginUrl = url);
    setCookieCommunity("currentUrl", getCookieUri(), 24);
    if(window.location.href.indexOf("/community")  == -1){
    	setCookieCommunity("cbgcommunitylogin", "1", 24);
    }
    window.location.href = loginUrl;
}
/*
*mobiel端注册
*/
function forumMobileLogin(){
	window.location.href = "https://" + clientUrl + "/CAS/mobile/standard/register/wapRegister.html?reqClientType="+ reqClientType +"&loginChannel="+ loginChannel +"&countryCode=" + sysConfig.countryCode + "&lang=" + sysConfig.casLangCode + "&loginUrl=https%3A%2F%2F" + clientUrl + "%2FCAS%2Fportal%2Flogin.html&service=https%3A%2F%2F" + clientLoginUrl + "%2Foauth2%2Fv2%2Fauthorize%3Fresponse_type%3Dcode%26client_id%3D" + clientID + "%26redirect_uri%3Dhttps%253A%252F%252F" + window.location.host + "%252F" + digitalData.page.pageInfo.siteCode2 + "%252Fcommunity%252Flogin%252F%26scope%3Dhttps%253A%252F%252Fwww.huawei.com%252Fauth%252Faccount%252Fbase.profile%26display%3Dpage"
}


/*
*PC登出功能
*/
function forumLogout(){
	var logouturi = $("#forum-clientLogoutUrl").val();
    var uri = window.location.href;
    if(uri.indexOf("/community") == -1){
    	setCookieCommunity("cbgcommunitylogout", "1", 24);
    }
	window.location.href = Mkt.Util.filterText(logouturi)
}
/*
*Mobile登出功能
*/
function forumMobileLogout(){
    var url = ajaxUrl + "user/logout";
    var tk; // 处理token
    if (getCookieCommunity("tk")) {
        tk = getCookieCommunity("tk");
    }

    // 参数
    var params = {};
    if (SITE_CODE == "worldwide") {
        params.site = digitalData.page.pageInfo.siteCode;
    } else {
        params.site = SITE_CODE;
    }

    if (getCookieCommunity("loginUserinfo")) {
        var loginUserinfo = JSON.parse(getCookieCommunity("loginUserinfo"));
        params.loginUserId = loginUserinfo.userId;
    } else {
        return;
    }
    var headUrl = window.location.protocol  + "//" + window.location.host +"/" + digitalData.page.pageInfo.siteCode2;
    params.redirectUri = encodeURIComponent(headUrl);
    $.ajax({
        url: Mkt.Util.getSafeUrl(url),
        type: "post",
        data:JSON.stringify(Mkt.Util.filterObject(params)),
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        headers: {
            "CSRFToken": tk
        },
        crossDomain: true,
        contentType: "application/json",
        success: function (data, status, request) {
            $(".forum-login,.app-login-icon").removeClass("singin");
            delCookieCommunity("currentUrl");
			delCookieCommunity("cbgcommunitylogin");
            // token添加
            if (request.getResponseHeader("CSRFToken")) {
                tk = request.getResponseHeader("CSRFToken");
                delCookieCommunity("tk");
                setCookieCommunity("tk", request.getResponseHeader("CSRFToken"), 24);
            };
            // 成功
            if (data.resultCode == "1" || !data.resultCode) {
                // 清除登录状态
                // 清除用户信息
                if (getCookieCommunity("loginUserinfo")) {
                    delCookieCommunity("loginUserinfo");
                };
                if(getCookieCommunity("blacklist")) {
    				delCookieCommunity("blacklist", false);
                }
                // 清除协议
                if (window.localStorage && window.localStorage.getItem("pactList")) {
                    window.localStorage.removeItem("pactList");
                };
                if (data && data.url) {
                    // 退出接口返回url
                    // 跳转UP退出
                    window.location.href = data.url;
                } else {
                    // 跳转官网首页
                    window.location.href = "/" + digitalData.page.pageInfo.siteCode2;
                }
            } else {
            	CommunityLoginFailTipDialog(data.resultMsg,function(){})
            }
        },
        error: function (xhr, status, error) {
            // token添加
            if (xhr.getResponseHeader("CSRFToken")) {
                tk = xhr.getResponseHeader("CSRFToken");
                setCookieCommunity("tk", xhr.getResponseHeader("CSRFToken"), 24);
            };
            // 弹出对应错误信息
            if (xhr && xhr.responseJSON) {
                 CommunityLoginFailTipDialog(xhr.responseJSON.resultMsg,function(){})
            } else {
                    var str =  $("#forum-networkplroblemtips").val() ;
                    CommunityLoginFailTipDialog(str,function(){})
            }
        }
    });
}
/*
*community 专用设定cookie
*c_name cookie名称
*value cookie值
*expirehours 有效时间(小时)
*/
function setCookieCommunity(c_name, value, expirehours) {
    var exdate = new Date();
    exdate.setTime(exdate.getTime() + expirehours * 60 * 60 * 1000);
    document.cookie = c_name + "=" + escape(value) + ((expirehours == null) ? "" : ";expires=" + exdate.toGMTString()) + ";path=/" + digitalData.page.pageInfo.siteCode2 + "/;";
}
/*
*community 专用设定取cookie
*c_name cookie名称
*/
function getCookieCommunity(c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}
/*
*community 专用取cookie
*c_name cookie名称
*/
function delCookieCommunity(name) {
    var exdate = new Date();
    exdate.setTime(exdate.getTime() - 1);
    var cval = getCookieCommunity(name);
    if (cval != null && cval != "") {
        document.cookie = name + "=" + "" + ";expires=" + exdate.toGMTString() + ";path=/" + digitalData.page.pageInfo.siteCode2 + "/;";
    }
}
/*
*判断登录状态
*/
function getLoginStateCommunity(){
	var s = getCookieCommunity("loginUserinfo");
    if(s && s != ""){
		$(".forum-login,.app-login-icon").addClass("singin");
    }else{
		$(".forum-login,.app-login-icon").removeClass("singin");
    }
}
/*
*获取登录地址uri截断
*/
function getCookieUri(){
    var pathname = window.location.pathname;
    pathname = pathname.substring(1,pathname.length)
    pathname = pathname.substring(pathname.indexOf("/")+1,pathname.length)
    if(pathname == ""){
        pathname = " "
    }
    return pathname;
}

/*
*首页显示Pop窗
*/
function popWindowInHomepageCommunity(){
	var s = getCookieCommunity("popcommunity");
    if(s && s != ""){
        /*30天内不弹出*/
		return;
    }else{
        /* 设定隐藏时间30天 */
    	setTimeout(function(){
    		$(".forum-home-mask").show();
    	},500)
		setCookieCommunity("popcommunity", "1", 720);
    }
}
/*
*个人中心uri
*/
function goAccountCenter() {
    var nowUrl = window.location.href
    var headUrl = nowUrl.substring(0, nowUrl.lastIndexOf("user-center"))
    var url = "https://" + clientUrl + "/AMW/portal/userCenter/index.html?loginChannel=40005000&reqClientType=3040&lang=" + sysConfig.casLangCode + "&service=" + headUrl + "/login/"
    window.open(Mkt.Util.getSafeUrl(url));
}
/*
*登录失败弹出窗
*/
function CommunityLoginFailTipDialog(text, callback) {
    var content =
        "<div class='community-dialog'>" +
        "   <div class='s-info-dialog'>" +
        "       <div class='s-info-title'>" +
        "           <h3><span class='" + "fail-icon" + "'></span>" + Mkt.Util.filterText(text) + "</h3>" +
        "       </div>" +
        "   </div>" +
        "</div>";
    $("body").append(content);
    setTimeout(function () {
        $(".community-dialog .s-info-dialog").toggleClass("s-show");
        setTimeout(function () {
            $(".community-dialog .s-info-dialog").css("opacity", 0);
            setTimeout(function () {
                $("body > .community-dialog").remove();
                callback && callback();
            }, 1600);
        }, 1600)

    }, 0);
}

$(function () {
	if(typeof(communityLogin) == "undefined"){
		return;
	}
    getLoginStateCommunity();
    if(digitalData.page.category.pageType == "homepage" && $("#forum-showPop").val() == "1"){
		popWindowInHomepageCommunity();
    }
    $(".forum-login .signInBtn, .app-nav .forum-login-app .signInBtn").click(function(){
        /* pc,mobile端登录 */
		forumLogin();
    })
    $(".forum-login .registeredBtn").click(function(){
        /* pc端注册 */
        var signupuri = "https://" + clientUrl + "/CAS/portal/userRegister/regbyphone.html?reqClientType=" + reqClientType + "&loginChannel=" + loginChannel + "&countryCode=" + sysConfig.countryCode + "&lang=" + sysConfig.casLangCode + "&loginUrl=https%3A%2F%2F" + clientUrl + "%2FCAS%2Fportal%2Flogin.html&service=https%3A%2F%2F" + clientLoginUrl + "%2Foauth2%2Fv2%2Fauthorize%3Fresponse_type%3Dcode%26client_id%3D" + clientID + "%26redirect_uri%3Dhttps%253A%252F%252F" + window.location.host + "%252F" + digitalData.page.pageInfo.siteCode2 + "%252Fcommunity%252Flogin%252F%26scope%3Dhttps%253A%252F%252Fwww.huawei.com%252Fauth%252Faccount%252Fbase.profile%26display%3Dpage";
		forumLogin(signupuri);
    })
    $(".forum-login .logout-btn a").click(function(){
        /* pc端登出 */
    	ga('send', 'event', 'user_center', 'click_on_logout_tuff', 'header_navigation');
		forumLogout();
    })
	$(".forum-login-app .registeredBtn").click(function(){
        /* mobile端注册 */
		forumMobileLogin();
    })
    $(".forum-login-app .app-logout-btn a").click(function(){
        /* mobile端登出 */
		forumMobileLogout();
    })
    $(".forum-login .show-logout .user-info").parent().click(function(){
        /* 个人中心跳转 */
		goAccountCenter();
    })
    $(".forum-home-mask .forum-home-close").click(function(){
        /* pop窗关闭 */
		$(".forum-home-mask").hide();
    })
    $(".forum-home-mask .sign-button a").click(function(){
        /* pop窗注册 */
      	if($(window).width() < 1024){
      		forumMobileLogin();
		}else{
			var signupuri = "https://" + clientUrl + "/CAS/portal/userRegister/regbyphone.html?reqClientType=" + reqClientType + "&loginChannel=" + loginChannel + "&countryCode=" + sysConfig.countryCode + "&lang=" + sysConfig.casLangCode + "&loginUrl=https%3A%2F%2F" + clientUrl + "%2FCAS%2Fportal%2Flogin.html&service=https%3A%2F%2F" + clientLoginUrl + "%2Foauth2%2Fv2%2Fauthorize%3Fresponse_type%3Dcode%26client_id%3D" + clientID + "%26redirect_uri%3Dhttps%253A%252F%252F" + window.location.host + "%252F" + digitalData.page.pageInfo.siteCode2 + "%252Fcommunity%252Flogin%252F%26scope%3Dhttps%253A%252F%252Fwww.huawei.com%252Fauth%252Faccount%252Fbase.profile%26display%3Dpage";
    		forumLogin(signupuri);
		}
    })
    $(".forum-home-mask .sign-text a").click(function(){
    /* pop窗登录 */
    	forumLogin();
    })
});

;
$(function() {
  // 隐私协议本地存储的key
  const PRIVACY_LOCAL_KEY = 'privacyAgreement';

  // SGW-APP-ID
  const SGW_APP_ID = 'EDCF82D77A5AB59706CD5F2163F67427';

  const privacyTitle = filterXSS($('#privacy-popup-title').val()); // 隐私协议标题

   // 隐私协议ids
  const privacyIds = (function() {
    let resultList = [];
    const ids = $('#privacy-popup-ids').val() || '';
    if (ids) {
      resultList = ids.split(',');
    }
    return resultList;
  })();
  const privacyContent = filterXSS($('#privacy-popup-content').val()); // 隐私协议主要内容
  const privacyAgree = filterXSS($('#privacy-popup-agree').val()); // 隐私协议是否显示勾选框
  const privacyCheckNote = filterXSS($('#privacy-popup-checkNote').val()); // checknote
  const privacyRemark = filterXSS($('#privacy-popup-remark').val()); // 备注
  const privacyAgreeText = filterXSS($('#privacy-popup-agreeText').val()) || 'Agree'; // 同意按钮文案
  const privacyRejectText = filterXSS($('#privacy-popup-rejectText').val()) || 'Disagree'; // 拒绝按钮文案
  const I18N_CLOSE = filterXSS($('#privacy-close-i18n').val() || 'Close'); // 关闭按钮文案
  const I18N_PRIVACY_ERROR = filterXSS($('#privacy-errortip-i18n').val()); // 隐私协议接口失败时报错文案
  const privacyButtonLineStyle = window.privacyButtonLineStyle || false; // 隐私弹窗确认按钮是否使用线条样式 - 使其不具备引导性

  // 隐私协议签署中
  let signLoading = false;

  let logoutCB;

  const isAppWebview = function () {
    return window.integrationJsInterface ||
           window.integrationJsInterfaceWebview ||
           window.hicareJsInterface ||
           window.kocJsInterface ||
           window.fansJSInterface;
  };

  /**
   * @description 通过登录状态处理隐私协议弹窗
   * @param {boolean} login 登录状态，默认已登录
   * @param {Function} logoutCallback 退出登录callback
   */
  function showPrivacyPopupByLogin(login = true, logoutCallback) {
    logoutCB = logoutCallback;

    // 未登录情况下移除缓存
    if (!login) {
      clearLocalData();
      return;
    }

    // 隐私协议开关关闭
    if (!privacyPopupSwitch) {
      return;
    }

    // 如果本地存在已签署的数据，则不执行
    const localPrivacyData = getLocalAgreementData();
    if (localPrivacyData) {
      return;
    }

    // 隐私协议id未配置
    if (privacyIds.length === 0) {
      return;
    }

    getResignAgreementNeed().then(function(needResign) {
      if (needResign) {
        showPrivacyPolicyDialog();
      } else {
        setLocalAgreementData(true);
      }
    })
  };

  // 将方法暴露到window中以供官网/社区调用
  window.showPrivacyPopupByLogin = showPrivacyPopupByLogin;

  /**
   * @description 获取本地存储的隐私协议数据
   */
  function getLocalAgreementData() {
    return localStorage.getItem(PRIVACY_LOCAL_KEY) === siteCode;
  }

  /**
   * @description 设置隐私协议本地存储的值 - 仅同意协议时才存储对应的key
   */
  function setLocalAgreementData(agree) {
    // 不同意则不做缓存
    if (!agree) {
      return;
    }
    localStorage.setItem(PRIVACY_LOCAL_KEY, siteCode);
  }

  /**
   * @description 清除隐私协议相关的本地存储数据
   */
  function clearLocalData() {
    localStorage.removeItem(PRIVACY_LOCAL_KEY);
  }

  // 记录签署记录接口的请求次数
  let fetchErrorTimes = 0;

  /**
   * @description 获取是否需要重新签协议
   */
  function getResignAgreementNeed() {
    var def = $.Deferred();
    const agrInfo = [];
    const country = getCSGSiteCode();
    privacyIds.map(function(id) {
      agrInfo.push({
        agrType: id,
        country: country,
      })
    });

    const headers = {
      "SGW-APP-ID": SGW_APP_ID,
      "Tcsrftoken": initToken()
    };

    // 同步请求服务网关接口
    $.ajax({
      url: mktConfig.sgwApi + '/myhuawei/meservice/tmsAgreementRecord/2',
      type: 'post',
      data: JSON.stringify({
        agrInfo,
      }),
      dataType: 'json',
      traditional: true,
      xhrFields: {
        withCredentials: true,
      },
      contentType: 'application/json',
      headers: headers,
      crossDomain: true,
      success: function(response) {
        if (response.code === '200') {
          // 根据数据判断是否需要重新签署response.data
          const needResign = getNeedResign(response.data.signInfo);

          // 请求成功，清空接口错误次数
          fetchErrorTimes = 0;
          def.resolve(needResign);
        } else {
          // 未登录情况下移除签署缓存
          if (String(response.code) === '401') {
            clearLocalData();
            logoutCB && logoutCB();
            return;
          }
          retryFetchRecord();
          def.reject(false);
        }
      },
      error: function(xhr) {
        retryFetchRecord();
        def.reject(xhr);
      },
    });
    return def.promise();
  }

  /**
   * @description 接口失败重新发起请求，重复三次
   */
  function retryFetchRecord() {
    fetchErrorTimes++;
    if (fetchErrorTimes < 3) {
      showPrivacyPopupByLogin(true, logoutCB);
    } else {
      showFetchError();
    }
  }

  function showFetchError() {
    const html = getFetchErrorHtml();
    $('body').append(html);
    $('.privacy-error-close').on('click', () => {
      logoutCB && logoutCB();
      removePriDialog();
    });
  }

  /**
   * @description 获取请求失败时弹出的html
   */
  function getFetchErrorHtml() {
    return `<div class="privacy-dialog">
      <div class="privacy-content-cover privacy-error-cover">
        <div class="privacy-content privacy-error-content">
            <svg width="48px" height="48px" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <title>7677E44F-5FDF-4A51-B253-4EF3F152852F_0@3x</title>
              <g id="隐私声明用户协议交互优化" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="PC_获取失败" transform="translate(-936.000000, -387.000000)">
                      <g id="7677E44F-5FDF-4A51-B253-4EF3F152852F_0" transform="translate(936.000000, 387.000000)">
                          <circle id="Oval" fill="#EFEFEF" cx="24" cy="24" r="24"></circle>
                          <polygon id="Fill-1" fill="#000000" points="22 27 26 27 26 14 22 14"></polygon>
                          <polygon id="Fill-2" fill="#000000" points="22 34 26 34 26 30 22 30"></polygon>
                      </g>
                  </g>
              </g>
          </svg>
          <p class="privacy-error-text">${I18N_PRIVACY_ERROR}</p>
          <button class="privacy-error-close">${I18N_CLOSE}</button>
        </div>
      </div>
    </div>
    `;
  }

  /**
   * @description 获取是否需要重新签署
   * @param {Array<{any}>} signInfo 接口返回的签署记录数据
   */
  function getNeedResign(signInfo) {
    // 无签署记录情况下
    if (!signInfo || signInfo.length === 0) {
      return true;
    }
    const needSignList = signInfo.filter((sign) => {
      return sign.needSign;
    })
    return needSignList && needSignList.length > 0;
  }

  /**
   * @description 获取CSG所需的站点编码，兼容多站点
   * @returns {String} 国家编码
   */
  function getCSGSiteCode() {
    // CSG国家编码与一体化官网国家编码存在部分站点不统一，此处进行配置
    const siteCodeMap = {
        "uk": "gb",
        "ae-en": "ae",
        "eg-en": "eg",
        "sa-en": "sa",
    }
    const specialSiteCode = siteCodeMap[siteCode] || siteCode;
    return specialSiteCode.toUpperCase();
  }

  /**
   * @description 展示弹窗
   */
  function showPrivacyPolicyDialog() {
    if ($('.login-user-privacy-dialog').length === 0 && !isAppWebview()) {
      const dialogHtml = getPrivacyDialog();
      $('html').addClass('overflow-hidden');
      $('body').append(dialogHtml);

      bindPrivacyDialogEvent();
    }
  }

  /**
   * @description 获取隐私协议弹窗dialog的html
   */
  function getPrivacyDialog() {
    return `<div class="privacy-dialog login-user-privacy-dialog" id="privacy-dialog">
    <div class="privacy-content-cover">
      <div class="privacy-content">
          <div class="privacy-title">${ privacyTitle }</div>
          <div class="privacy-content-text">
            ${ privacyContent }
          </div>
          <div class="privacy-line"></div>
          <div class="privacy-checknote">
            ${  getPrivacyCheckbox() }
            <div class="privacy-checknote-text">
              <p>${ privacyCheckNote }</p>
              <div class="privacy-remark">${ privacyRemark }</div>
            </div>
          </div>
          <div class="privacy-buttons">
            <button class="privacy-discard">${ privacyRejectText }</button>
            <button class="privacy-accept ${ privacyAgree ? '' : 'usable' } ${ privacyButtonLineStyle ? 'privacy-accept-line' : '' } ">${ privacyAgreeText }</button>
          </div>
        </div>
      </div>
    <div>`;
  }

  /**
   *
   * @returns chenbox的html节点
   */
  function getPrivacyCheckbox() {
    if (!privacyAgree) {
      return '';
    }
    return `<input type="checkbox" id="dialog-privacy-checkbox" class="privacy-checkbox" />
    <label for="dialog-privacy-checkbox" class="privacy-checkbox-label">
      <svg class="svg-nochecked" xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='20' height='20' viewBox='0 0 20 20'>
        <defs>
          <style>.a,.b{fill:none;}.b{fill-rule:evenodd;}.c{fill:#f5f5f5;}.d{clip-path:url(public-v4/css/#a);}</style>
          <clipPath id='a'>
            <rect class='a' width='20' height='20' transform='translate(0 -20)' />
          </clipPath>
        </defs>
        <g transform='translate(-182 -2811)'>
          <path class='b' d='M4-26H16a4,4,0,0,1,4,4v12a4,4,0,0,1-4,4H4a4,4,0,0,1-4-4V-22A4,4,0,0,1,4-26Z' transform='translate(182 2837)' />
          <path class='b' d='M4-26H16a4,4,0,0,1,4,4v12a4,4,0,0,1-4,4H4a4,4,0,0,1-4-4V-22A4,4,0,0,1,4-26Z' transform='translate(182 2837)' />
          <rect class='c' width='20' height='20' rx='4' transform='translate(182 2811)' />
          <g class='d' transform='translate(182 2831)'>
            <image width='20' height='20' transform='translate(0 -20)' xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAANdJREFUOBHt1EFPg0AQhuFStei98eL//2neemyiRhG/BzINp8qmHDvJx8Cy887swk63m+0p7hj10T4aozXWZdJv9BWdom8DYG8eop9oiFqAD5n/GOG8A75GqvqMQGVsAYoFexaLLMNHBKhCsBagoqyKvQCqaLlcL1qA5jOMXrnoy2WuhSXsklgMxlBf1EApt01WcZMH3NTuwNu3876H2+yhP9wBL7VSK44ffRRnmTfAys9P1681l59YWpeWpZeplHm5ViCkax2ic2UALmgd9gz9a8vE+unwB39rNy2nbmwYAAAAAElFTkSuQmCC' />
          </g>
        </g>
      </svg>
      <svg class ="svg-checked" xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='20' height='20' viewBox='0 0 20 20'>
        <defs>
          <style>.a,.b,.c{fill:none;}.b{clip-rule:evenodd;}.c{fill-rule:evenodd;}.d{fill:#f5f5f5;}.e{clip-path:url(#a);}.f{clip-path:url(#b);}.g{clip-path:url(#c);}.h{isolation:isolate;}.i{clip-path:url(#d);}.j{clip-path:url(#e);}.k{clip-path:url(#f);}</style>
          <clipPath id='a'>
            <rect class='a' width='20' height='20' transform='translate(0 -20)' />
          </clipPath>
          <clipPath id='b'>
            <path class='a' d='M7-6.914,4.707-9.207a1,1,0,0,0-1.414,0,1,1,0,0,0,0,1.414l3,3a1,1,0,0,0,1.414,0l5-5a1,1,0,0,0,0-1.414,1,1,0,0,0-1.414,0Z' />
          </clipPath>
          <clipPath id='c'>
            <path class='a' d='M0,0H16V-16H0Z' />
          </clipPath>
          <clipPath id='d'>
            <rect class='a' width='20' height='18' transform='translate(-2 -17)' />
          </clipPath>
          <clipPath id='e'>
            <path class='a' d='M3-4H13v-8H3Z' />
          </clipPath>
          <clipPath id='f'>
            <path class='b' d='M0-16H16V0H0Z' />
          </clipPath>
        </defs>
        <g transform='translate(-540 -2811)'>
          <path class='c' d='M4-26H16a4,4,0,0,1,4,4v12a4,4,0,0,1-4,4H4a4,4,0,0,1-4-4V-22A4,4,0,0,1,4-26Z' transform='translate(540 2837)' />
          <path class='c' d='M4-26H16a4,4,0,0,1,4,4v12a4,4,0,0,1-4,4H4a4,4,0,0,1-4-4V-22A4,4,0,0,1,4-26Z' transform='translate(540 2837)' />
          <rect class='d' width='20' height='20' rx='4' transform='translate(540 2811)' />
          <g class='e' transform='translate(540 2831)'>
            <image width='20' height='20' transform='translate(0 -20)' xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAANdJREFUOBHt1EFPg0AQhuFStei98eL//2neemyiRhG/BzINp8qmHDvJx8Cy887swk63m+0p7hj10T4aozXWZdJv9BWdom8DYG8eop9oiFqAD5n/GOG8A75GqvqMQGVsAYoFexaLLMNHBKhCsBagoqyKvQCqaLlcL1qA5jOMXrnoy2WuhSXsklgMxlBf1EApt01WcZMH3NTuwNu3876H2+yhP9wBL7VSK44ffRRnmTfAys9P1681l59YWpeWpZeplHm5ViCkax2ic2UALmgd9gz9a8vE+unwB39rNy2nbmwYAAAAAElFTkSuQmCC' />
          </g>
          <g transform='translate(542 2829.5)'>
            <g class='f'>
              <g class='g'>
                <g class='h'>
                  <g class='i'>
                    <g class='j'>
                      <path d='M-2-16.5H18V.5H-2Z' />
                    </g>
                    <g class='k'>
                      <g class='j'>
                        <path d='M-5-21H21V5H-5Z' />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </label>`;
  }

  function bindPrivacyDialogEvent() {
    // 勾选框改变事件
    $('#dialog-privacy-checkbox').on('change', function() {
      const checked = $(this).prop('checked');
      if (checked) {
        $('.privacy-accept').addClass('usable');
      } else {
        $('.privacy-accept').removeClass('usable');
      }
    });

    // 拒绝按钮事件
    $('.privacy-dialog .privacy-discard').on('click', function() {
      // 拒绝--退出登录
      const disAgreeCallBack = function() {
        if (logoutCB) {
          logoutCB();
        }
      };

      signTmsAgree(false).then(disAgreeCallBack, disAgreeCallBack);
    });

    // 同意按钮事件
    $('.privacy-dialog .privacy-accept').on('click', function() {
      // 开启了隐私协议checkbox校验是否勾选
      if (privacyAgree) {
        const checked = $('#dialog-privacy-checkbox').prop('checked');
        if (!checked) {
          // 未勾选
          return;
        }
      }
      signTmsAgree(true);
    });
  }

  /**
   * @description 签署TMS隐私协议
   * @param {boolean} agree 是否同意签署协议，默认同意
   */
  function signTmsAgree(agree = true) {
    if (signLoading) {
      return;
    }
    signLoading = true;
    var def = $.Deferred();
    const signInfo = [];
    const country = getCSGSiteCode();
    privacyIds.map(function(id) {
      signInfo.push({
        agrType: id,
        country: country,
        isAgree: agree,
        language: $('#privacy-language-code').val() || 'cn',
      })
    });

    const headers = {
      "SGW-APP-ID": SGW_APP_ID,
      "Tcsrftoken": initToken()
    };

    // 同步请求服务网关接口
    $.ajax({
      url: mktConfig.sgwApi + '/myhuawei/meservice/tmsAgree/2',
      type: 'post',
      data: JSON.stringify({
        signInfo,
      }),
      contentType: 'application/json',
      xhrFields: {
        withCredentials: true,
      },
      headers: headers,
      success: function(response) {
        if (response.code === '200') {
          setLocalAgreementData(agree);
          def.resolve(true);
        } else {
          def.resolve(false);
        }
      },
      error: function(xhr) {
        def.reject(xhr);
      },
      complete: function() {
        signLoading = false;
        removePriDialog();
      },
    });
    return def.promise();
  }

  /**
   * @description 移除隐私协议弹窗
   */
  function removePriDialog() {
    $('.privacy-dialog').remove();
    $('html').removeClass('overflow-hidden');
  }

});
;if(typeof allowHA !="undefined" && allowHA){
    (function () {
        var HaSdkVersion = "2.1.5.301",   // sdk版本

            userAccount, // 用户标示

            screenWidth = screen.width,

            screenHeight = screen.height,

            pattern = 1, // 非0为兼容模式

            isInit = false,

            pageViewId = "",

            expireTime = 500,

            intervalTime = 30 * 60 * 1000,

            url = location.href,

            configCookieNamePrefix = "HW_",

            url_path = "",

            baseinfotypeSwitch1 = false, // 页面进入事件上报开关

            baseinfotypeSwitch2 = false, // 窗口关闭事件开关

            type1 = "baseinfotype",

            type2 = "customEvent",

            type3 = "elementEvent",

            type4 = "clickEvent",

            waitTime = 0,

            CXX = "",

            idsite = "",

            waitTimeFlag = true,

            isNewVf = false,

            waitTimeFlagTime = 0,

            referrer = document.referrer,

            cvar = '',

            title = "",

            documentTitle = '',

            uid = "",

            idts = "",

            idvc = 1,

            idn = "",

            refts = "",

            viewts = "",

            urlHashTag = false,

            properties = {},

            serverUrl = "",

            accessTime = new Date().getTime(),

            saveAccessTime = -1,

            eventName = "",

            eventLabel = "",

            elementInfo = {},

            customData = {},

            UA = {
                type: function () {
                    var u = navigator.userAgent;
                    if (u.match(/AppleWebKit.*Mobile.*/)) {
                        if (u.indexOf(" wv") !== -1) {
                            return 2
                        } else {
                            return 1
                        }
                    } else {
                        return 0
                    }
                }()
            };

        _hasdk = function () {

            function sendData(eventNameP, eventLabelP, customDataP, cvarP) {
                eventNameP ? eventName = eventNameP : '';
                eventLabelP ? eventLabel = eventLabelP : '';
                customDataP ? customData = customDataP : '';
                cvarP ? elementInfo.cvar = cvarP : '';
                execReport(type2)
                return this
            }

            function sendClickData(eventNameP, eventLabelP, customDataP, cvarP) {
                eventNameP ? eventName = eventNameP : '';
                eventLabelP ? eventLabel = eventLabelP : '';
                customDataP ? customData = customDataP : '';
                cvarP ? elementInfo.cvar = cvarP : '';
                execReport(type4)
                return this
            }
            function setOnReportUrl(serverUrlP) {
                serverUrlP ? serverUrl = serverUrlP : "";
                return this
            }

            function setPageData(cvarP) {
                cvarP ? cvar = cvarP : '';
                return this
            }
            function setTitle(titleP) {
                titleP ? title = titleP : "";
                return this
            }

            function setUserAccount(userAccountP) {
                userAccountP ? userAccount = userAccountP : "";
                return this
            }

            function setUid(uidP) {
                uidP ? uid = uidP : "";
                return this
            }

            function setCXX(CXXP) {
                CXXP ? CXX = CXXP : "";
                return this
            }

            function setBaseinfotypeSwitch(flag) {
                baseinfotypeSwitch1 = flag;
                return this
            }

            function setWindowCloseSwitch(flag) {
                baseinfotypeSwitch2 = flag
                return this
            }

            function setIdsite(idsiteValue) {
                idsiteValue ? idsite = idsiteValue : "";
                return this
            }

            function setSessionTimeoutDuration(interval){
                interval ? intervalTime = interval : ""
                return this
            }
            return {
                push: apply,
                bindclick: bindclick,
                sendData: sendData,
                sendClickData:sendClickData,
                setOnReportUrl: setOnReportUrl,
                setTitle: setTitle,
                setUserAccount: setUserAccount,
                setUid: setUid,
                setCXX: setCXX,
                setBaseinfotypeSwitch: setBaseinfotypeSwitch,
                setWindowCloseSwitch: setWindowCloseSwitch,
                setSessionTimeoutDuration: setSessionTimeoutDuration,
                setIdsite: setIdsite,
                setPageData:setPageData
            }
        }();


        (function bindReady() {
            domHasAlready();
            if (window.addEventListener) {
                document.addEventListener('DOMContentLoaded', reportPageEntryEvent, false);
            } else if (window.attachEvent) {
                doScroll();
            }
        })();


        // ie6-8通过判断doScroll判断DOM是否加载完毕
        function doScroll() {
            try {
                document.documentElement.doScroll('left');
            } catch (error) {
                return setTimeout(doScroll, 20);
            }
            baseinfotypeSwitch1 ? execReport("baseinfotype") : "";
        }

        function apply() {
            var i, f, parameterArray;
            for (i = 0; i < arguments.length; i += 1) { //flags
                parameterArray = arguments[i];
                f = parameterArray.shift();
                try {
                    if (typeof f === 'string' || f instanceof String) {
                        _hasdk[f].apply(_hasdk, parameterArray);
                    } else {
                        f.apply(_hasdk, parameterArray);
                    }
                } catch (e) {
                    console.error('Invalid method:' + f + ', please check!!!')
                }
            }
            return this
        }

        function deletToken(url) {
            var tempArr = url.split("&");
            for (var i = 0; i < tempArr.length; i++) {
                var tempArrSmall = tempArr[i].split("=");
                if (tempArrSmall[0].toLocaleLowerCase() === "token".toLocaleLowerCase()) {
                    tempArr.splice(i, 1)
                    break
                }
            }
            return tempArr.join("&")
        }

        function domHasAlready() {
            init();
            waitTime = 0
            attachEventListener(window, 'beforeunload', beforeUnloadHandler, false);
            attachEventListener(document, "visibilitychange", stateChanged);
        }

        // 计算在页面停留的有效时间（仅计算当前页面可见的时间）
        function stateChanged() {
            if (waitTimeFlag) {
                var nowTime = new Date().getTime();
                waitTime += nowTime - (waitTimeFlagTime || accessTime)
            } else {
                waitTimeFlagTime = new Date().getTime();
            }
            waitTimeFlag = !waitTimeFlag
        }

        // 初始化
        function init() {
            // 页面dom初始化后获取页面title
            !title ? title = document.title : "";
            documentTitle = document.title;
            url_path = location.host;
        }
        // 上报页面进入事件
        function reportPageEntryEvent(){
            baseinfotypeSwitch1 ? execReport("baseinfotype") : "";
            document.removeEventListener('DOMContentLoaded', reportPageEntryEvent, false);
        }
        // init cookie相关的参数
        function initCookie(){
            isInit = true;
            var visitFlag = getCookieValue(getCookieName("id"));
            // refts 渠道来源的时间
            if (referrer && !getCookieValue(getCookieName("refts"))) {
                var time = new Date().getTime();
                addCookie(getCookieName("refts"), time, 180 * 24 * 60 * 60 * 1000, "/");
                refts = time;
            } else {
                refts = getCookieValue(getCookieName("refts"))
            }
            // viewts 最后一次访问的时间
            viewts = getCookieValue(getCookieName("viewts"));
            // idvc 访问次数
            if (!getCookieValue(getCookieName("idvc"))) {
                addCookie(getCookieName("idvc"), 1, 365 * 24 * 60 * 60 * 1000, "/");
            } else {
                addCookie(getCookieName("idvc"), getCookieValue(getCookieName("idvc")) - 0 + 1, 365 * 24 * 60 * 60 * 1000, "/");
            }
            idvc = getCookieValue(getCookieName("idvc"));
            saveAccessTime = 0
            if (visitFlag === "" || !visitFlag) {
                var visitFlag = getUuid(),
                    time = new Date().getTime();
                // id cookieid ,idts id创建的时间
                addCookie(getCookieName("id"), visitFlag, 365 * 24 * 60 * 60 * 1000, "/");
                addCookie(getCookieName("idts"), time, 365 * 24 * 60 * 60 * 1000, "/");
                idts = time;
                !userAccount ? userAccount = visitFlag : ''
                isNewVf = true
            } else {
                idts = getCookieValue(getCookieName("idts"));
                userAccount ? "" : userAccount = visitFlag;
            }
            handleSessionId();
        }

        //处理SessionID
        function handleSessionId(){
            idn = getCookieValue(getCookieName("idn"));
            if(idn === "" || !idn){
                idn = getUuid();
            }
            addCookie(getCookieName("idn"),idn,intervalTime,"/");
        }

        // 上报参数处理
        function parseParamToString(options) {
            var str = '';
            for (var i = 0; i < options.length; i++) {
                var key = options[i][0];
                var value = options[i][1];
                if (value == null) {
                    value = ""
                }
                if (i > 0)
                    str += "&";
                str = str + key + "=" + value;
            }
            return str;
        }

        // 上报模型处理
        function execReport(type) {
            if(!isInit){
                initCookie();
            }
            if(serverUrl === ""){
                console.error("serverUrl is empty");
                return;
            }
            if(idsite === ""){
                console.error("idsite is empty");
                return;
            }

            var option = [];
            properties = {
                url: deletToken(window.location.href),
                title: title,
                at: accessTime,
                rf: deletToken(referrer)
            };

            if (type === type1) {
                properties.res = screenWidth + " X " + screenHeight;
                if (saveAccessTime !== -1) {
                    var time = new Date().getTime();
                    properties.cwt = time;
                    properties.dt = waitTime
                }
            }
            if (type === type2 || type === type4) {
                properties.en = eventName;
                properties.el = eventLabel;
                properties.cd = customData;
            }
            if (type === type3) {
                properties.ei = elementInfo.elementId === document ? "#document" : elementInfo.elementId;
                properties.ec = elementInfo.cls;
                properties.ps = elementInfo.position;
                properties.data = elementInfo.data === undefined ? "" : elementInfo.data;
                properties.cd = customData;
            }
            option.push(["type", type])
            option.push(["vf", userAccount])
            option.push(["rt", new Date().getTime()])
            if (pattern === 0) {
                option.push(["pt", encodeURIComponent(JSON.stringify(properties))])
                var postStr = parseParamToString(option);
                onReport(postStr)
            } else {
                option.push(["pt", properties])
                handleSessionId();
                var data = {
                    type: option[0][1],
                    vf: option[1][1],
                    rt: option[2][1],
                    ut: UA.type,
                    cxx: CXX,
                    idsite: idsite,
                    suid: uid,
                    cvar: elementInfo.cvar ? elementInfo.cvar : cvar,
                    idts: idts,
                    idvc: idvc,
                    idn: idn,
                    refts: refts,
                    viewts: viewts,
                    hsv: HaSdkVersion,
                    data: option[3][1]
                }

                var SupportOld = getParams(type) + '&idsite=' + encodeURIComponent(idsite) +
                    '&rec=1' +
                    '&r=' + "886244" +
                    '&h=' + new Date().getHours() + '&m=' + new Date().getMinutes() + '&s=' + new Date().getSeconds() +
                    '&url=' + encodeURIComponent(url) +
                    '&_id=' + encodeURIComponent(userAccount) + '&_idts=' + idts + '&_idvc=' + idvc +
                    '&_idn=' + idn +
                    '&urlref=' + referrer +
                    '&_refts=' + refts +
                    '&_viewts=' + viewts +
                    '&scd=' + "24" +
                    '&vpr=' + screenWidth + " X " + screenHeight +
                    '&cvar=' +  encodeURIComponent(elementInfo.cvar ? elementInfo.cvar : cvar) +
                    '&pdf=' + '1' +
                    '&qt=' + "0" +
                    '&data=' + encodeURIComponent(JSON.stringify(data));
                onReport(SupportOld);
            }
        }

        // 根据上报事件类型得到对象参数
        function getParams(type) {
            var result = 'action_name=' + encodeURIComponent(title);
            if(type === type3 || type === type4)
            {
                result = 'link=' + encodeURIComponent(title);
            }
            return result
        }


        // 上报采集信息
        function onReport(postStr) {
            var image = new Image(1, 1);
            serverUrl ? image.src = serverUrl + "?" + postStr : image.src = "";
            restoreObj()
        }


        // 还原参数
        function restoreObj() {
            properties = {};
            elementInfo = {};
            customData = {}
        }

        function getCookieValue(name) {
            var cookiePattern = new RegExp('(^|;)[ ]*' + name + '=([^;]*)'),
                cookieMatch = cookiePattern.exec(document.cookie);
            return cookieMatch ? decodeURIComponent(cookieMatch[2]) : 0;
        }

        function addCookie(cookieName, value, msToExpire, path, domain, secure) {
            var expiryDate;
            if (msToExpire) {
                expiryDate = new Date();
                expiryDate.setTime(expiryDate.getTime() + msToExpire);
            }
            document.cookie = cookieName + '=' + encodeURIComponent(value) +
                (msToExpire ? ';expires=' + expiryDate.toGMTString() : '') +
                ';path=' + (path || '/') +
                (domain ? ';domain=' + domain : '') +
                (secure ? ';secure' : '');
        }


        // 生成UUID
        function getUuid() {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
            s[8] = s[13] = s[18] = s[23] = "";
            var uuid = s.join("");
            return uuid;
        }

        function getCookieName(baseName) {
            return (configCookieNamePrefix + baseName + '_' + idsite + '_' + url_path).replace(/\./g, '_');
        }

        // 获取当前时间
        function getNowFormatDate(date) {
            var seperator1 = "", seperator2 = "", month = date.getMonth() + 1, strDate = date.getDate(),
                hours = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            if (hours >= 0 && hours <= 9) {
                hours = "0" + hours;
            }

            if (minutes >= 0 && minutes <= 9) {
                minutes = "0" + minutes;
            }
            if (seconds >= 0 && seconds <= 9) {
                seconds = "0" + seconds;
            }
            var currentdate = date.getFullYear() + seperator1 + month + seperator1
                + strDate + "" + hours + seperator2 + minutes + seperator2
                + seconds;
            return currentdate;
        }

        // 事件监听
        function bindclick(elid, _type, data, cvarP) {
            var dom = elid === document ? document : document.getElementById(elid)
            if (dom) {
                /** TODO 对_type做校验，只支持一些type。？ **/
                addEventListenerHa(dom, data, elid, _type, cvarP);
            }
            return this
        }

        // 事件信息处理
        function eventDealWidth(data, elid, el, e, cvarP) {
            var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;   //height
            var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;      //width
            elementInfo.elementId = elid;
            elementInfo.cls = el.className;
            elementInfo.data = data;
            elementInfo.cvar = cvarP;
            elementInfo.position = {
                res: e.screenX + "X" + e.screenY,
                vpr: e.clientX + "X" + e.clientY,
                doc: w + "X" + h
            }
            execReport(type3);
        }

        // 页面元素监听上报
        function addEventListenerHa(dom, data, elid, type, cvarP) {
            function eventToDo(e) {
                eventDealWidth(data, elid, dom, e, cvarP)
            }

            attachEventListener(dom, type, eventToDo)
        }

        // 绑定事件
        function attachEventListener(obj, e, fun) {
            obj.attachEvent ? obj.attachEvent("on" + e, fun) : obj
                .addEventListener(e, fun, false);
        }

        // beforeunload处理
        function beforeUnloadHandler() {
            var now, nowTime = new Date().getTime(), expireDateTime = nowTime + expireTime;
            stateChanged()
            addCookie(getCookieName("viewts"), nowTime, 365 * 24 * 60 * 60 * 1000, "/");
            baseinfotypeSwitch2 ? execReport("baseinfotype") : "";
            if (expireDateTime) {
                var i = 0;
                do {
                    now = new Date();
                    i++;
                    if (i > 1000) break;
                } while (now.getTime() < expireDateTime);
            }
        }
    })()

    if (typeof module !== "undefined" && typeof module.exports === "object") {
        module.exports = _hasdk
    }
}
	/**
	 * jQuery MD5 hash algorithm function
	 * 
	 * 	<code>
	 * 		Calculate the md5 hash of a String 
	 * 		String $.md5 ( String str )
	 * 	</code>
	 * 
	 * Calculates the MD5 hash of str using the » RSA Data Security, Inc. MD5 Message-Digest Algorithm, and returns that hash. 
	 * MD5 (Message-Digest algorithm 5) is a widely-used cryptographic hash function with a 128-bit hash value. MD5 has been employed in a wide variety of security applications, and is also commonly used to check the integrity of data. The generated hash is also non-reversable. Data cannot be retrieved from the message digest, the digest uniquely identifies the data.
	 * MD5 was developed by Professor Ronald L. Rivest in 1994. Its 128 bit (16 byte) message digest makes it a faster implementation than SHA-1.
	 * This script is used to process a variable length message into a fixed-length output of 128 bits using the MD5 algorithm. It is fully compatible with UTF-8 encoding. It is very useful when u want to transfer encrypted passwords over the internet. If you plan using UTF-8 encoding in your project don't forget to set the page encoding to UTF-8 (Content-Type meta tag). 
	 * This function orginally get from the WebToolkit and rewrite for using as the jQuery plugin.
	 * 
	 * Example
	 * 	Code
	 * 		<code>
	 * 			$.md5("I'm Persian."); 
	 * 		</code>
	 * 	Result
	 * 		<code>
	 * 			"b8c901d0f02223f9761016cfff9d68df"
	 * 		</code>
	 * 
	 * @alias Muhammad Hussein Fattahizadeh < muhammad [AT] semnanweb [DOT] com >
	 * @link http://www.semnanweb.com/jquery-plugin/md5.html
	 * @see http://www.webtoolkit.info/
	 * @license http://www.gnu.org/licenses/gpl.html [GNU General Public License]
	 * @param {jQuery} {md5:function(string))
	 * @return string
	 */
	(function($){
		var rotateLeft = function(lValue, iShiftBits) {
			return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
		}
		var addUnsigned = function(lX, lY) {
			var lX4, lY4, lX8, lY8, lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
			if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			if (lX4 | lY4) {
				if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ lX8 ^ lY8);
			}
		}
		var F = function(x, y, z) {
			return (x & y) | ((~ x) & z);
		}
		var G = function(x, y, z) {
			return (x & z) | (y & (~ z));
		}
		var H = function(x, y, z) {
			return (x ^ y ^ z);
		}
		var I = function(x, y, z) {
			return (y ^ (x | (~ z)));
		}
		var FF = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var GG = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var HH = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var II = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var convertToWordArray = function(string) {
			var lWordCount;
			var lMessageLength = string.length;
			var lNumberOfWordsTempOne = lMessageLength + 8;
			var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
			var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
			var lWordArray = Array(lNumberOfWords - 1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while (lByteCount < lMessageLength) {
				lWordCount = (lByteCount - (lByteCount % 4)) / 4;
				lBytePosition = (lByteCount % 4) * 8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount - (lByteCount % 4)) / 4;
			lBytePosition = (lByteCount % 4) * 8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
			lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
			lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
			return lWordArray;
		};
		var wordToHex = function(lValue) {
			var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
			for (lCount = 0; lCount <= 3; lCount++) {
				lByte = (lValue >>> (lCount * 8)) & 255;
				WordToHexValueTemp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
			}
			return WordToHexValue;
		};
		var uTF8Encode = function(string) {
			string = string.replace(/\x0d\x0a/g, "\x0a");
			var output = "";
			for (var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);
				if (c < 128) {
					output += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					output += String.fromCharCode((c >> 6) | 192);
					output += String.fromCharCode((c & 63) | 128);
				} else {
					output += String.fromCharCode((c >> 12) | 224);
					output += String.fromCharCode(((c >> 6) & 63) | 128);
					output += String.fromCharCode((c & 63) | 128);
				}
			}
			return output;
		};
		$.extend({
			md5: function(string) {
				var x = Array();
				var k, AA, BB, CC, DD, a, b, c, d;
				var S11=7, S12=12, S13=17, S14=22;
				var S21=5, S22=9 , S23=14, S24=20;
				var S31=4, S32=11, S33=16, S34=23;
				var S41=6, S42=10, S43=15, S44=21;
				string = uTF8Encode(string);
				x = convertToWordArray(string);
				a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
				for (k = 0; k < x.length; k += 16) {
					AA = a; BB = b; CC = c; DD = d;
					a = FF(a, b, c, d, x[k+0],  S11, 0xD76AA478);
					d = FF(d, a, b, c, x[k+1],  S12, 0xE8C7B756);
					c = FF(c, d, a, b, x[k+2],  S13, 0x242070DB);
					b = FF(b, c, d, a, x[k+3],  S14, 0xC1BDCEEE);
					a = FF(a, b, c, d, x[k+4],  S11, 0xF57C0FAF);
					d = FF(d, a, b, c, x[k+5],  S12, 0x4787C62A);
					c = FF(c, d, a, b, x[k+6],  S13, 0xA8304613);
					b = FF(b, c, d, a, x[k+7],  S14, 0xFD469501);
					a = FF(a, b, c, d, x[k+8],  S11, 0x698098D8);
					d = FF(d, a, b, c, x[k+9],  S12, 0x8B44F7AF);
					c = FF(c, d, a, b, x[k+10], S13, 0xFFFF5BB1);
					b = FF(b, c, d, a, x[k+11], S14, 0x895CD7BE);
					a = FF(a, b, c, d, x[k+12], S11, 0x6B901122);
					d = FF(d, a, b, c, x[k+13], S12, 0xFD987193);
					c = FF(c, d, a, b, x[k+14], S13, 0xA679438E);
					b = FF(b, c, d, a, x[k+15], S14, 0x49B40821);
					a = GG(a, b, c, d, x[k+1],  S21, 0xF61E2562);
					d = GG(d, a, b, c, x[k+6],  S22, 0xC040B340);
					c = GG(c, d, a, b, x[k+11], S23, 0x265E5A51);
					b = GG(b, c, d, a, x[k+0],  S24, 0xE9B6C7AA);
					a = GG(a, b, c, d, x[k+5],  S21, 0xD62F105D);
					d = GG(d, a, b, c, x[k+10], S22, 0x2441453);
					c = GG(c, d, a, b, x[k+15], S23, 0xD8A1E681);
					b = GG(b, c, d, a, x[k+4],  S24, 0xE7D3FBC8);
					a = GG(a, b, c, d, x[k+9],  S21, 0x21E1CDE6);
					d = GG(d, a, b, c, x[k+14], S22, 0xC33707D6);
					c = GG(c, d, a, b, x[k+3],  S23, 0xF4D50D87);
					b = GG(b, c, d, a, x[k+8],  S24, 0x455A14ED);
					a = GG(a, b, c, d, x[k+13], S21, 0xA9E3E905);
					d = GG(d, a, b, c, x[k+2],  S22, 0xFCEFA3F8);
					c = GG(c, d, a, b, x[k+7],  S23, 0x676F02D9);
					b = GG(b, c, d, a, x[k+12], S24, 0x8D2A4C8A);
					a = HH(a, b, c, d, x[k+5],  S31, 0xFFFA3942);
					d = HH(d, a, b, c, x[k+8],  S32, 0x8771F681);
					c = HH(c, d, a, b, x[k+11], S33, 0x6D9D6122);
					b = HH(b, c, d, a, x[k+14], S34, 0xFDE5380C);
					a = HH(a, b, c, d, x[k+1],  S31, 0xA4BEEA44);
					d = HH(d, a, b, c, x[k+4],  S32, 0x4BDECFA9);
					c = HH(c, d, a, b, x[k+7],  S33, 0xF6BB4B60);
					b = HH(b, c, d, a, x[k+10], S34, 0xBEBFBC70);
					a = HH(a, b, c, d, x[k+13], S31, 0x289B7EC6);
					d = HH(d, a, b, c, x[k+0],  S32, 0xEAA127FA);
					c = HH(c, d, a, b, x[k+3],  S33, 0xD4EF3085);
					b = HH(b, c, d, a, x[k+6],  S34, 0x4881D05);
					a = HH(a, b, c, d, x[k+9],  S31, 0xD9D4D039);
					d = HH(d, a, b, c, x[k+12], S32, 0xE6DB99E5);
					c = HH(c, d, a, b, x[k+15], S33, 0x1FA27CF8);
					b = HH(b, c, d, a, x[k+2],  S34, 0xC4AC5665);
					a = II(a, b, c, d, x[k+0],  S41, 0xF4292244);
					d = II(d, a, b, c, x[k+7],  S42, 0x432AFF97);
					c = II(c, d, a, b, x[k+14], S43, 0xAB9423A7);
					b = II(b, c, d, a, x[k+5],  S44, 0xFC93A039);
					a = II(a, b, c, d, x[k+12], S41, 0x655B59C3);
					d = II(d, a, b, c, x[k+3],  S42, 0x8F0CCC92);
					c = II(c, d, a, b, x[k+10], S43, 0xFFEFF47D);
					b = II(b, c, d, a, x[k+1],  S44, 0x85845DD1);
					a = II(a, b, c, d, x[k+8],  S41, 0x6FA87E4F);
					d = II(d, a, b, c, x[k+15], S42, 0xFE2CE6E0);
					c = II(c, d, a, b, x[k+6],  S43, 0xA3014314);
					b = II(b, c, d, a, x[k+13], S44, 0x4E0811A1);
					a = II(a, b, c, d, x[k+4],  S41, 0xF7537E82);
					d = II(d, a, b, c, x[k+11], S42, 0xBD3AF235);
					c = II(c, d, a, b, x[k+2],  S43, 0x2AD7D2BB);
					b = II(b, c, d, a, x[k+9],  S44, 0xEB86D391);
					a = addUnsigned(a, AA);
					b = addUnsigned(b, BB);
					c = addUnsigned(c, CC);
					d = addUnsigned(d, DD);
				}
				var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
				return tempValue.toLowerCase();
			}
		});
	})(jQuery);

 function getDmpaClient(){
	 return (window.viewType()=="mobile")?"mobile":"pc";
 }

 function getDmpaSid(){
	 return $.md5(new Date().getTime()+""+Math.random());
 }

 function getDmpaSite(){
	 return window.digitalData.page.pageInfo.siteCode2.toUpperCase();
 }

function addCcpcDmpaAnalytics(searchFrom, searchModule, data, result, sid){ }

function trackCcpcSearchClick(sid, kowlegeId, title, index, pageNo, type, interventions, scope){ }

 /**
  * card display
  * @param sid
  * @param scope
  * @param typeName
  * @param result
  * @returns
  */
function trackCcpcCardDisplay(sid, scope, typeName, result){ }

function getGAData(str) {
    if (!str)
        return null;
    var at = str.split(' - ')
    var s = queryVariableD(at[0])
    for (var i = 1; i < at.length; i++)
    {
        s = s + " - " + queryVariableD(at[i])
    }
    return s
}


window.variableTagD = {
    '<page title>': digitalData.page.pageInfo.pageName,
    '<URL>': digitalData.page.pageInfo.uri,
    '<product name>': digitalData.product ? digitalData.product.productInfo.marketingName : ''
};


window.queryVariableD = function(str) {
    var vd = window.variableTagD
    var s = str
    var reg = /^<.*>$/
    for (var key in vd) {
        if (key == str)
            s = vd[key]
    }
    if (reg.test(s))
        s = ''
    return s
}


 /**
  * 在JS逻辑中调用，传递所需参数发送dmpa事件
  * dmpa 的事件部署方法
  * @param eType
  * @param cat
  * @param value
  * @param lab
  * @param QueryResult
  * @param SearchPageNum
  * @param ProductName
  */
 function sendDmpaByAttr(eType,cat,act,lab,QueryResult,SearchPageNum,ProductName){ }

 /**
  *  在JS逻辑中调用，传递所需参数发送dmpa事件
  *  dmpa 的事件部署方法
  * @param cat
  * @param act
  * @param lab
  * @param QueryResult
  * @param SearchPageNum
  * @param ProductName
  * @param FAQViewTime
  * @param FAQChannelEntrance
  * @param FAQParameter
  */
 function sendDmpaByAttr2(eType,cat,act,lab,QueryResult,SearchPageNum,ProductName, FAQViewTime,FAQChannelEntrance, FAQParameter) { }

 /**
  *  在JS逻辑中调用，传递所需参数发送dmpa事件
  *  dmpa 的事件部署方法
  * @param cat
  * @param act
  * @param lab
  * @param QueryResult
  * @param SearchPageNum
  * @param ProductName
  * @param FAQViewTime
  * @param FAQChannelEntrance
  * @param FAQParameter
  * @param ContentTitle
  */
 function sendDmpaByAttr3(eType,cat,act,lab,QueryResult,SearchPageNum,ProductName, FAQViewTime,FAQChannelEntrance, FAQParameter,ContentTitle) { }


/**
  * 在JS逻辑中调用，传递所需参数发送dmpa事件
  * dmpa 的事件部署方法
  * @param data 对象
  */
 function sendDmpaByData(data){ }

 /**
  * 传递tag对象进行dmpa发送
  * @param tag
  */
 function sendDmpaByCurrentTag(tag){ }

/**
 * 埋码需要绑定的方法，这个方法包括两个账号的GA 和 AA
 */
function gaAndAaByAttr3(cat,act,lab,QueryResult,SearchPageNum,ProductName, FAQViewTime,FAQChannelEntrance, FAQParameter,ContentTitle,ContentId,$gaElement)
{
	 var lab = lab ? getGAData(lab) : 'Error: Not Maintain Value';
	 var act = act ? getGAData(act) : 'Error: Not Maintain Value';
	 var cat = cat ? getGAData(cat) : 'Error: Not Maintain Value';
	 var ga4Cat = cat;
	 cat = cat + "+" + sysConfig.countryCode + "+"  + sysConfig.language;

	 var QueryResult = QueryResult ? QueryResult : null;
	 var SearchPageNum = SearchPageNum ? SearchPageNum : null;
	 var ProductName = ProductName ? ProductName : null;

	 var FAQViewTime = FAQViewTime ? FAQViewTime : null;
	 var FAQChannelEntrance = FAQChannelEntrance ? FAQChannelEntrance : null;
	 var FAQParameter = FAQParameter ? FAQParameter : null;
     var ContentTitle = ContentTitle ? ContentTitle : null;
     var ContentId = ContentId ? ContentId : null;

	 if (typeof ga === 'function') {
	 	try {
			ga('newhuaiweisupport.send', 'event', cat, act, lab ,
				{
					'dimension7':  QueryResult,
					'dimension8':  SearchPageNum,
					'dimension9':  ProductName,
					'dimension10':  FAQViewTime,
					'dimension11':  FAQChannelEntrance,
					'dimension12':  FAQParameter,
					'dimension13': ContentTitle,
					'dimension16': ContentId
				}
			);
			ga('send', 'event', cat, act, lab);
		} catch (e) {

		}
	 }
	 ga4SendByAttr(ga4Cat, act, lab, $gaElement)
}


 /**
  * 埋码需要绑定的方法，这个方法包括两个账号的GA 和 AA
  */
 function gaAndAaByAttr2(cat,act,lab,QueryResult,SearchPageNum,ProductName, FAQViewTime,FAQChannelEntrance, FAQParameter,FAQApplicableProduct)
 {
	 var lab = lab ? getGAData(lab) : 'Error: Not Maintain Value';
	 var act = act ? getGAData(act) : 'Error: Not Maintain Value';
	 var cat = cat ? getGAData(cat) : 'Error: Not Maintain Value';
	 cat = cat + "+" + sysConfig.countryCode + "+"  + sysConfig.language;

	 var QueryResult = QueryResult ? QueryResult : null;
	 var SearchPageNum = SearchPageNum ? SearchPageNum : null;
	 var ProductName = ProductName ? ProductName : null;

	 var FAQViewTime = FAQViewTime ? FAQViewTime : null;
	 var FAQChannelEntrance = FAQChannelEntrance ? FAQChannelEntrance : null;
	 var FAQParameter = FAQParameter ? FAQParameter : null;

	 if (typeof ga === 'function') {
	 	try {
			ga('newhuaiweisupport.send', 'event', cat, act, lab ,
				{
					nonInteraction: true,
					'dimension7':  QueryResult,
					'dimension8':  SearchPageNum,
					'dimension9':  ProductName,
					'dimension10':  FAQViewTime,
					'dimension11':  FAQChannelEntrance,
					'dimension12':  FAQParameter,
					'dimension14': FAQApplicableProduct
				}
			);
			ga('send', 'event', cat, act, lab);
		} catch (e) {}
	 }

 }


/**
 * 埋码需要绑定的方法，这个方法包括两个账号的GA 和 AA
 */
function gaAndAaByAttr(cat,act,lab,QueryResult,SearchPageNum,ProductName,$gaElement, addtionalObj)
{
    var lab = lab ? getGAData(lab) : 'Error: Not Maintain Value';
    var act = act ? getGAData(act) : 'Error: Not Maintain Value';
    var cat = cat ? getGAData(cat) : 'Error: Not Maintain Value';
    var ga4Cat = cat;
    cat = cat + "+" + sysConfig.countryCode + "+"  + sysConfig.language;

    var QueryResult = QueryResult ? QueryResult : null;
    var SearchPageNum = SearchPageNum ? SearchPageNum : null;
    var ProductName = ProductName ? ProductName : null;

    if (typeof ga === 'function') {
    	try {
			ga('newhuaiweisupport.send', 'event', cat, act, lab ,
				{
					'dimension7':  QueryResult,
					'dimension8':  SearchPageNum,
					'dimension9':  ProductName
				}
			);
			ga('send', 'event', cat, act, lab);
		} catch (e) {}
    }
	ga4SendByAttr(ga4Cat, act, lab, $gaElement, addtionalObj);
}

 /**
  * ga4埋码方法
  *
  * @param cat cat
  * @param act act
  * @param lab lab
  * @param $gaElement ga埋码数据绑定元素块
  * @param additionalObj 绑定非公共参数
  */
 function ga4SendByAttr(cat,act,lab,$gaElement, additionalObj) {

	// GA4 埋码部分, $gaElement包含模块event, module, level信息元素
	var obj = {};
	obj.event = 'other_page_interactions';
	// 优先级 元素埋置 > 页面维度配置
	obj.support_entrance_level1 = supportv2.gaEntrance || '';
	obj.module = supportv2.gaModule;
	var support_entrance_level2 = supportv2.entranceLv2ForGa || '';
	var productCategory1 = supportv2.productCategory1 || '';
	var productCategory2 = supportv2.productCategory2 || '';
	var productCategory3 = supportv2.productCategory3 || '';
	var productCategory4 = supportv2.productCategory4 || '';
	if ($gaElement) {
		obj.event = $gaElement.data('gaevent') || obj.event;
		obj.module = $gaElement.data('gamodule') || obj.module;
		obj.support_entrance_level1 = $gaElement.data('entrancelevel') || obj.support_entrance_level1;
		support_entrance_level2 = $gaElement.data('entranceLv2ForGa') || support_entrance_level2;
		productCategory1 = $gaElement.data('productCategory1') || productCategory1;
		productCategory2 = $gaElement.data('productCategory2') || productCategory2;
		productCategory3 = $gaElement.data('productCategory3') || productCategory3;
		productCategory4 = $gaElement.data('productCategory4') || productCategory4;
	}
	if (support_entrance_level2) {
		obj.support_entrance_level2 = support_entrance_level2;
	}
	if (productCategory1) {
		obj.product_category1 = productCategory1;
	}
	if (productCategory2) {
		obj.product_category2 = productCategory2;
	}
	if (productCategory3) {
		obj.product_category3 = productCategory3;
	}
	if (productCategory4) {
		obj.product_category4 = productCategory4;
	}
	obj.country = sysConfig.countryCode;
	obj.language = sysConfig.language;
	obj.ua_category = cat;
	obj.ua_action = act;
	processGa4Lab(lab, obj);
	// additionalObj相同key覆盖obj
	$.extend(obj, additionalObj)
	window.dataLayer.push(obj);
}

 /**
  * GA4 ua_label字段，单个最长长度限制为500
  * 超过500,进行切割,ua_label1,2,3,4,5,最多切割至ua_label5
  *	空格及中文都算一个字符
  *
  * @param lab 埋码lab字符串
  * @param dataLayerObj ga4埋码对象
  */
function processGa4Lab(lab, dataLayerObj) {
	dataLayerObj.ua_label = lab.substring(0, 500);
	var length = lab.length;
	// 向上取整, 最大为5
	var size = Math.min(Math.ceil(length/500), 6);
	for (var index = 0; index < size-1; index++) {
		var currentIndex = index + 1;
		var startIndex = currentIndex * 500;
		var endIndex = startIndex + 500;
		dataLayerObj['ua_label' + currentIndex] = lab.substring(startIndex, endIndex);
	}
}

/**
 * 埋码需要绑定的方法，这个方法包括两个账号的GA 和 AA
 * 针对第8种情况，某些a标签不触发，手动绑定onclick事件，绑此方法
 */
function gaAndAaByCurrentTag(tag, additionalObj)
{
	var event = window.event;
	if(!event || !event.isTrusted || $(event.target).closest($(tag)).length < 1){
		return ;
	}

    var lab = $(tag).attr('lab') ? getGAData($(tag).attr('lab')) : 'Error: Not Maintain Value';
    var act = $(tag).attr('act') ? getGAData($(tag).attr('act')) : 'Error: Not Maintain Value';
    var cat = $(tag).attr('cat') ? getGAData($(tag).attr('cat')) : 'Error: Not Maintain Value';
    var ga4Cat = cat;
    cat = cat + "+" + sysConfig.countryCode + "+"  + sysConfig.language;

    var QueryResult = $(tag).attr('queryresult') ? $(tag).attr('queryresult') : null;
    var SearchPageNum = $(tag).attr('searchpagenum') ? $(tag).attr('searchpagenum') : null;
    var ProductName = $(tag).attr('productname') ? $(tag).attr('productname') : null;

    if (typeof ga === 'function') {
    	try {
			ga('newhuaiweisupport.send', 'event', cat, act, lab ,
				{
					'dimension7':  QueryResult,
					'dimension8':  SearchPageNum,
					'dimension9':  ProductName
				}
			);
			ga('send', 'event', cat, act, lab);
		} catch (e) {}
    }

	ga4SendByAttr(ga4Cat, act, lab, $(tag).parents('[data-gaevent]'), additionalObj);
}

/**
 * 埋码需要绑定的方法，这个方法包括两个账号的GA 和 AA
 */
function gaAndAabyASupportCommon(event, additionalObj)
{
	if(!event || !event.originalEvent || !event.originalEvent.isTrusted){
		return ;
	}
    var lab = $(this).attr('lab') ? getGAData($(this).attr('lab')) : 'Error: Not Maintain Value';
    var act = $(this).attr('act') ? getGAData($(this).attr('act')) : 'Error: Not Maintain Value';
    var cat = $(this).attr('cat') ? getGAData($(this).attr('cat')) : 'Error: Not Maintain Value';
    var ga4Cat = cat;
    cat = cat + "+" + sysConfig.countryCode + "+"  + sysConfig.language;
    var QueryResult = $(this).attr('queryresult') ? $(this).attr('queryresult') : null;
    var SearchPageNum = $(this).attr('searchpagenum') ? $(this).attr('searchpagenum') : null;
    var ProductName = $(this).attr('productname') ? $(this).attr('productname') : null;

    if (typeof ga === 'function') {
    	try {
			ga('newhuaiweisupport.send', 'event', cat, act, lab ,
				{
					'dimension7':  QueryResult,
					'dimension8':  SearchPageNum,
					'dimension9':  ProductName
				}
			);
			ga('send', 'event', cat, act, lab);
		} catch (e) {}
    }
	var $gaElement = $(this);
    if (!$gaElement.data('gaevent')) {
		$gaElement = $(this).parents('[data-gaevent]');
	}
	ga4SendByAttr(ga4Cat, act, lab, $gaElement, additionalObj);
}

    /**
    * 针对第 1 种情况，页面中包含a-support-common class的，采用直接绑定埋码的方法
    */
    $(document).on('click', ".a-support-common", gaAndAabyASupportCommon);


	 /**
	  * 发送虚拟页面的GA
	  * 这里获取到当前页面的地址之后要砍掉最后一个斜杠，因为在埋点的时候是以斜杠开始的，如果拼在一起会多出一个斜杠
	  * 形成类似 /cn/support/express-repair/create//step3/pop-up-contact的格式
	  */
	 function sendPageViewGA(path)
	 {
		 if (typeof ga === 'function') {
			var pageUri = window.digitalData.page.pageInfo.uri;
			if(pageUri != "" && (pageUri.lastIndexOf("/") == pageUri.length - 1))
			{
				pageUri = pageUri.substr(0,pageUri.length - 1);
			}
			var fullPath =  pageUri + path;
			try {
				ga('newhuaiweisupport.send', 'pageview', fullPath);
			} catch (e) {}
		 }
	 }

	 /**
	  * 当用onclick事件调用的时候绑定此方法发送虚拟页面的传值
	  * @param tag
	  */
 	 function sendPageViewGAByTag(tag)
	 {
		 var path = $(tag).attr('ga-path') ? $(tag).attr('ga-path') : null;
		 sendPageViewGA(path);
	 }

	 /**
	  *
	  * @param tag
	  */
	 function sendPageViewGAByThis()
	 {
		 var path = $(this).attr('ga-path') ? $(this).attr('ga-path') : null;
		 sendPageViewGA(path);
	 }

	 /**
	  *
	  * 采用class绑定的单击方式方式
	  * 绑定虚拟页面的传值
	  *
	  **/
	 $(document).on('click', ".ga-page-view", sendPageViewGAByThis);


	/**
	* 初始化HA的环境
	*/
	function initHaEnvironment(haSdk,haURLs) {
		var haURL = "";
		var siteCode = window.digitalData.page.pageInfo.siteCode;
		if(window.digitalData.page.pageInfo.isProd)
		{
			if(Object.prototype.hasOwnProperty.call(haURLs.China.sites, siteCode))
			{
				haURL = haURLs.China.url;
			}
			else if (Object.prototype.hasOwnProperty.call(haURLs.Russia.sites, countryCode))
			{
				haURL = haURLs.Russia.url;
			}
			else if (Object.prototype.hasOwnProperty.call(haURLs.Europe.sites, countryCode))
			{
				haURL = haURLs.Europe.url;
			}
			else if (Object.prototype.hasOwnProperty.call(haURLs.Singapore.sites, countryCode))
			{
				haURL = haURLs.Singapore.url;
			}
		}
		else
		{
			haURL = haURLs.test.url;
		}

		haSdk.setOnReportUrl(haURL);
		haSdk.setIdsite ('huawei_website_20191106');
		haSdk.setBaseinfotypeSwitch  (false);
		haSdk.setWindowCloseSwitch  (false);
		var title = document.title;
		haSdk.setTitle (title);
		haSdk.setCXX(sysConfig.countryCode);
		haSdk.setUid("acf0c6ba42h");
	}

	 /**
	  *
	  * HA的站点访问地址，不同的站点访问不同的地址,
	  *
	  * 比如中国的站点有en，cn
	  * 欧洲的因为隐私问题不可以把数据传到中国，
	  * 就把欧洲国家的地址设置为欧洲的服务器
	  * 东南亚等国家传到新加坡服务器
	  * 俄罗斯将传到俄罗斯服务器
	  *
	  * 不同的服务器有不同的地址
	  * 但是测试地址只用同一个，
	  * 当站点需要变化的时候将需要把此js打补丁
	  * 因为今后站点请求服务器变化的可能性不会太大，
	  * 因此没必要在AEM配置，
	  * 减少配置的工作量
	  *
	  * 这个地方sites采用采用json的方式形成类似java中的map，
	  * 而不是用json数组，
	  * 这样做的目的是为了避免循环遍历出是否有此站点，
	  * 如果用json格式的话在调用的时候可以采用
	  * hasOwnProperty判断是否有这个站点
	  * 这样避免了需要循环
	  *
	  * 生产和测试地址不同
	  * 绑定虚拟页面的传值
	  *
	  **/
	 var haURLsJson = {
		 "test":{
			 "url" : "https://cloudbackup.hwcloudtest.cn:6447/webv1"
		 },
		 "China":{
			 "url":"https://metrics-drcn.dt.hicloud.com/webv1",
			 "sites":{"en":"","cn":""}
		 },
		 "Russia":{
			 "url":"https://metrics5.data.hicloud.com:6447/webv1",
			 "sites":{"ru":""}
		 },
		 "Europe":{
			 "url":"https://metrics2.data.hicloud.com:6447/webv1",
			 "sites":{"at":"","by":"","be":"","ba":"","br":"","bg":"","hr":"","cy":"","cz":"","dk":"","ee":"","fi":"","fr":"",
				 "de":"","gr":"","hu":"","ie":"","it":"","jp":"","kr":"","lv":"","lt":"","md":"","nl":"","mk":"","no":"","pl":"",
				 "pt":"","ro":"","rs":"","sk":"","si":"","es":"","se":"","ch":"","tr":"","ua":"","uk":"","us":"",
				 "us-es":"","ch-fr":"","md-ru":"","be-fr":"","lv-ru":""}
		 },
		 "Singapore":{
			 "url":"https://metrics-dra.dt.hicloud.com:6447/webv1",
			 "sites":{"dz":"","ar":"","az":"","bd":"","bo":"","bw":"","kh":"","cm":"","ca":"","ca-fr":"","cl":"","co":"","cg":"",
				 "cr":"","do":"","ec":"","eg":"","eg-e":"","et-en":"","gh":"","gt":"","hk":"","in":"","id":"","ir":"","ir-fa":"",
				 "il":"","kz":"","ke":"","kw":"","kw-en":"","la":"","latin":"","latin-en":"","levant":"","levant-ar":"","my":"",
				 "mu":"","mx":"","ma":"","mm":"","np":"","nz":"","ng":"","pk":"","pa":"","py":"","pe":"","ph":"","sa":"",
				 "sa-en":"","sg":"","za":"","lk":"","tw":"","th":"","tg":"","tn":"","ae":"","ae-fa":"","uy":"","uz":"","vn":""}
		 }
	 };

     /**
      * HA页面打点
      * 页面打点是指在页面加载的时候的打点，用来统计页面的访问量
      */
    function sendPageHAEvent() {
         var ha_page_event_data = {};
         ha_page_event_data.languagecode = sysConfig.language;
         ha_page_event_data.countrycode = sysConfig.countryCode;
         ha_page_event_data.id = "page_event_" + sysConfig.countryCode;
         ha_page_event_data.pageID = window.digitalData.page.pageInfo.pageName;
         ha_page_event_data.url = document.location.pathname;

    }


     try {
        if(allowHA)
        {
            var haSdk = _hasdk || [];
            initHaEnvironment(haSdk,haURLsJson);

            sendPageHAEvent();
        }
     }
     catch (e) {
     }

 	/**
	  * 上报HA的方法，这个方法不要在页面上直接调用
	  * 这个调用的时候判断是否已经初始化，
	  * 如果已经初始化将进行调用
	  * 之前是屏蔽掉中国的，如果不是中国将不做调用
	  * 原因是之前没有国外的服务器，
	  * 如果放开将都传到中国的HA服务器上
	  * 12月份已经做了国家HA服务器的区分
	  * 因此删除非中国的判断
	 */
	 function sendHa(data) {
        if(haSdk !== undefined && haSdk !== null && allowHA)
        {
            haSdk.sendData(data.id, data.id, data);
        }
	 }

    /**
    *
    * HA埋码的执行方法
    * 这个方法需要传递一个对象，包含HA的字段
    * 或者json
    */
    function haDispach(data)
    {
        data.languagecode = sysConfig.language;
        data.countrycode = sysConfig.countryCode;
		sendHa(data);
    }

    /**
    *
    * HA埋码的执行方法
    * 传递tag进来之后再执行
    **/
    function haDispachByThis()
    {
        var data = {};

		data.languagecode = sysConfig.language;
		data.countrycode = sysConfig.countryCode;

        var id = $(this).attr('ha-id') ? $(this).attr('ha-id') : null;
        if(id != null)
		{
			data.id = id;
		}
        var url = $(this).attr('ha-url') ? $(this).attr('ha-url') : null;
        if(url != null)
		{
			data.url = url;
		}
        var type = $(this).attr('ha-type') ? $(this).attr('ha-type') : null;
		if(type != null)
		{
			data.type = type;
		}
        var title = $(this).attr('ha-title') ? $(this).attr('ha-title') : null;
		if(title != null)
		{
			data.title = title;
		}
        var time = $(this).attr('ha-time') ? $(this).attr('ha-time') : null;
		if(time != null)
		{
			data.time = time;
		}
        var result = $(this).attr('ha-result') ? $(this).attr('ha-result') : null;
		if(result != null)
		{
			data.result = result;
		}
        var province = $(this).attr('ha-province') ? $(this).attr('ha-province') : null;
		if(province != null)
		{
			data.province = province;
		}
        var position = $(this).attr('ha-position') ? $(this).attr('ha-position') : null;
		if(position != null)
		{
			data.position = position;
		}
        var name = $(this).attr('ha-name') ? $(this).attr('ha-name') : null;
		if(name != null)
		{
			data.name = name;
		}
        var keyword = $(this).attr('ha-keyword') ? $(this).attr('ha-keyword') : null;
		if(keyword != null)
		{
			data.keyword = keyword;
		}
        var date = $(this).attr('ha-date') ? $(this).attr('ha-date') : null;
		if(date != null)
		{
			data.date = date;
		}
        var cycle = $(this).attr('ha-cycle') ? $(this).attr('ha-cycle') : null;
		if(cycle != null)
		{
			data.cycle = cycle;
		}
        var content = $(this).attr('ha-content') ? $(this).attr('ha-content') : null;
		if(content != null)
		{
			data.content = content;
		}
        var confirm = $(this).attr('ha-confirm') ? $(this).attr('ha-confirm') : null;
		if(confirm != null)
		{
			data.confirm = confirm;
		}
        var city = $(this).attr('ha-city') ? $(this).attr('ha-city') : null;
		if(city != null)
		{
			data.city = city;
		}
        var category = $(this).attr('ha-cat') ? $(this).attr('ha-cat') : null;
		if(category != null)
		{
			data.category = category;
		}
        var area = $(this).attr('ha-area') ? $(this).attr('ha-area') : null;
		if(area != null)
		{
			data.area = area;
		}
		var duration = $(this).attr('ha-duration') ? $(this).attr('ha-duration') : null;
		if(duration != null)
		{
			data.duration = duration;
		}
		var street = $(this).attr('ha-street') ? $(this).attr('ha-street') : null;
		if(street != null)
		{
			data.street = street;
		}

		sendHa(data);
    }


    /**
    *
    * HA埋码的执行方法
    * 传递tag进来之后再执行
    **/
    function haDispachByTag(tag)
    {
    	var data = {};
		data.languagecode = sysConfig.language;
		data.countrycode = sysConfig.countryCode;
        var id = $(tag).attr('ha-id') ? $(tag).attr('ha-id') : null;
		if(id != null)
		{
			data.id = id;
		}
        var url = $(tag).attr('ha-url') ? $(tag).attr('ha-url') : null;
		if(url != null)
		{
			data.url = id;
		}
        var type = $(tag).attr('ha-type') ? $(tag).attr('ha-type') : null;
		if(type != null)
		{
			data.type = type;
		}
        var title = $(tag).attr('ha-title') ? $(tag).attr('ha-title') : null;
		if(title != null)
		{
			data.title = title;
		}
        var time = $(tag).attr('ha-time') ? $(tag).attr('ha-time') : null;
		if(time != null)
		{
			data.time = time;
		}
        var result = $(tag).attr('ha-result') ? $(tag).attr('ha-result') : null;
		if(result != null)
		{
			data.result = result;
		}
        var province = $(tag).attr('ha-province') ? $(tag).attr('ha-province') : null;
		if(province != null)
		{
			data.province = province;
		}
        var position = $(tag).attr('ha-position') ? $(tag).attr('ha-position') : null;
		if(position != null)
		{
			data.position = position;
		}
        var name = $(tag).attr('ha-name') ? $(tag).attr('ha-name') : null;
		if(name != null)
		{
			data.name = name;
		}
        var keyword = $(tag).attr('ha-keyword') ? $(tag).attr('ha-keyword') : null;
		if(keyword != null)
		{
			data.keyword = keyword;
		}
        var date = $(tag).attr('ha-date') ? $(tag).attr('ha-date') : null;
		if(date != null)
		{
			data.date = date;
		}
        var cycle = $(tag).attr('ha-cycle') ? $(tag).attr('ha-cycle') : null;
		if(cycle != null)
		{
			data.cycle = cycle;
		}
        var content = $(tag).attr('ha-content') ? $(tag).attr('ha-content') : null;
		if(content != null)
		{
			data.content = content;
		}
        var confirm = $(tag).attr('ha-confirm') ? $(tag).attr('ha-confirm') : null;
		if(confirm != null)
		{
			data.confirm = confirm;
		}
        var city = $(tag).attr('ha-city') ? $(tag).attr('ha-city') : null;
		if(city != null)
		{
			data.city = city;
		}
        var category = $(tag).attr('ha-cat') ? $(tag).attr('ha-cat') : null;
		if(category != null)
		{
			data.category = category;
		}
        var area = $(tag).attr('ha-area') ? $(tag).attr('ha-area') : null;
		if(area != null)
		{
			data.area = area;
		}
		var duration = $(tag).attr('ha-duration') ? $(tag).attr('ha-duration') : null;
		if(duration != null)
		{
			data.duration = duration;
		}
		var street = $(tag).attr('ha-street') ? $(tag).attr('ha-street') : null;
		if(street != null)
		{
			data.street = street;
		}

		sendHa(data);
    }


    /**
    *
    * 采用class绑定的单击方式方式
    *
    **/
    $(document).on('click', ".ha-click-dispach", haDispachByThis);




 /**
  * 日期格式化
  * @param {date} val 日期
  * @param {string} fmt 格式
  */
 function dmpaDateFormat(val, fmt) {
	 var o = {
		 'M+': val.getMonth() + 1, //月份
		 'd+': val.getDate(), //日
		 'h+': val.getHours(), //小时
		 'm+': val.getMinutes(), //分
		 's+': val.getSeconds(), //秒
		 'q+': Math.floor((val.getMonth() + 3) / 3), //季度
		 S: val.getMilliseconds() //毫秒
	 };
	 if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (val.getFullYear() + '').substr(4 - RegExp.$1.length));
	 for (var k in o)
		 if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : (`00${o[k]}`).substr(String(o[k]).length));
	 return fmt;
 }


 /**
  * 时区转换，按照当地时间进行计算
  * 这个当地时间是按照站点获取的时区进行计算，如果获取不到站点的时区就以客户端浏览器时区为依据
  * 传进来的timeStr的参数格式为: 2020-03-18 08:21:31
  */
 function timeConversion(timeStr) {
	 var computerTimeZone = (-1) * new Date().getTimezoneOffset() / 60;
	 var timeDifference = computerTimeZone * 60 * 60 * 1000;

	 var timeStrProcess = (timeStr.substring(0, 19)).replace(/-/g,'/');
	 // 获取真实的时间戳
	 var timeStamp = new Date(timeStrProcess).getTime() + timeDifference;

	 var countryTimeZone = computerTimeZone;
	 if(window.sessionStorage.getItem("timeZoneOffeset") != null)
	 {
		 countryTimeZone = window.sessionStorage.getItem("timeZoneOffeset");
	 }
	 // 修正的假的时间戳，之所以用修正的假的时间戳，是因为从电脑取时间串的时候会根据客户端电脑时区做转换，用经过修正的假的时间戳就会抹平
	 // 客户端电脑时区和站点时区不一致的情况的时间差，形成以站点时区为准的时间点
	 var amendFakeTimeStamp = timeStamp + (countryTimeZone - computerTimeZone) * 60 * 60 * 1000;

	 return dmpaDateFormat(new Date(amendFakeTimeStamp),"yyyy-MM-dd hh:mm:ss");
 }

    /*点击复选框*/
    function checkIsUrgent(){
    	var isUrgent = $('.product-urgent-download').is(':checked');
    	var cat = 'product';
        var act = 'Click on software search';
		var lab = '';
        if(isUrgent) {
        	lab = 'open';
        }else{
        	lab = 'close';
		}
		var ha_id = "product_click_emergency_download";
		var haData = {id:ha_id,ha_confirm:lab};
		haDispach(haData);
        gaAndAaByAttr(cat,act,lab,"","","");

    }

function deviceType(){
	var iWinWidth = window.innerWidth || $(window).width();
	return iWinWidth >= 1024 ? 'pc' : (iWinWidth < 768 ? 'mobile' : 'tablet');
}



var supportPageCategory = window.digitalData ? window.digitalData.page.category.pageType: '';
if(typeof supportPageCategory != "undefined" && supportPageCategory == "support"){

	var cat = "scroll";
	 var value = (deviceType() == 'pc' ? 'Desktop' : deviceType()) + " scroll";

	 var gaHACat = value + "+" + sysConfig.countryCode + "+"  + sysConfig.language;
	 var lab = window.location.pathname;
	 var ga4Labl = getGAData("<page title>");
	 var roll_25 = 0;
	 var roll_50 = 0;
	 var roll_75 = 0;
	 var roll_100 = 0;
	 var gaScrollPercent = 0;
	 var ga4AdditionalObj = {
	 	 event: 'support_interaction',
		 module: 'scroll',
		 support_entrance_level1: 'common'
	 }
	 $(document).on('scroll',function(){
		 gaScrollPercent = getCookie('scrollPercentage') || 0;
		 if(gaScrollPercent > 24 && gaScrollPercent < 49 && roll_25==0){
			 roll_25 = 1
			 var act = "Content 25%"
			 sendDmpaByAttr("scroll", cat, value, act);
			 //ga
			 if (typeof ga === 'function') {
			 	try {
					ga('newhuaiweisupport.send', 'event', gaHACat, act, lab,{nonInteraction: true});
					ga('send', 'event', gaHACat, act, lab,{nonInteraction: true});
				} catch (e) {}
			 }
			 ga4SendByAttr(value, act, ga4Labl, undefined, ga4AdditionalObj)
			 // 3 ha发送
			 var haData = {id:"content_scroll",title:"25%"};
			 haDispach(haData);
		 }
		 if(gaScrollPercent > 49 && gaScrollPercent < 74 && roll_50==0){
			 roll_50 = 1
			 sendDmpaByAttr("scroll", cat, value, "Content 50%");
			 var act = "Content 50%"
			 if (typeof ga === 'function') {
			 	try {
					ga('newhuaiweisupport.send', 'event', gaHACat, act, lab,{nonInteraction: true});
					ga('send', 'event', gaHACat, act, lab,{nonInteraction: true});
				} catch (e) {}
			 }
			 ga4SendByAttr(value, act, ga4Labl, undefined, ga4AdditionalObj)
			 // 3 ha发送
			 var haData = {id:"content_scroll",title:"50%"};
			 haDispach(haData);
		 }
		 if(gaScrollPercent > 74 && gaScrollPercent < 99 && roll_75===0){
			 roll_75 = 1
			 sendDmpaByAttr("scroll", cat, value, "Content 75%");
			 var act = "Content 75%"
			 if (typeof ga === 'function') {
				 ga('newhuaiweisupport.send', 'event', gaHACat, act, lab,{nonInteraction: true});
				 ga('send', 'event', gaHACat, act, lab,{nonInteraction: true});
			 }
			 ga4SendByAttr(value, act, ga4Labl, undefined, ga4AdditionalObj)
			 // 3 ha发送
			 var haData = {id:"content_scroll",title:"75%"};
			 haDispach(haData);
		 }
		 if(gaScrollPercent == 100 && roll_100==0){
			 roll_100 = 1
			 var act = "Content 100%"
			 sendDmpaByAttr("scroll", cat, value, act);
			 if (typeof ga === 'function') {
			 	try {
					ga('newhuaiweisupport.send', 'event', gaHACat, act, lab,{nonInteraction: true});
					ga('send', 'event', gaHACat, act, lab,{nonInteraction: true});
				} catch (e) {

				}
			 }
			 ga4SendByAttr(value, act, ga4Labl, undefined, ga4AdditionalObj)
			 // 3 ha发送
			 var haData = {id:"content_scroll",title:"100%"};
			 haDispach(haData);
		 }
	 })
 }

/*
 * Jwpalyer Plugin
 *
 * Version:  6.6.3896
 *
 */

"undefined"==typeof jwplayer&&(jwplayer=function(e){if(jwplayer.api)return jwplayer.api.selectPlayer(e)},jwplayer.version="6.6.3896",jwplayer.vid=document.createElement("video"),jwplayer.audio=document.createElement("audio"),jwplayer.source=document.createElement("source"),function(s){function e(e){return function(){return t(e)}}function l(e){return function(){e("Error loading file")}}function u(t,n,r,i){return function(){try{var e=t.responseXML;if(e&&e.firstChild)return r(t)}catch(e){}(e=f.parseXML(t.responseText))&&e.firstChild?(t=f.extend({},t,{responseXML:e}),r(t)):i&&i(t.responseText?"Invalid XML":n)}}var c=document,d=window,n=navigator,f=s.utils=function(){};f.exists=function(e){switch(typeof e){case"string":return 0<e.length;case"object":return null!==e;case"undefined":return!1}return!0},f.styleDimension=function(e){return e+(0<e.toString().indexOf("%")?"":"px")},f.getAbsolutePath=function(e,t){if(f.exists(t)||(t=c.location.href),f.exists(e)){var n;if(n=f.exists(e)?(n=e.indexOf("://"),r=e.indexOf("?"),0<n&&(r<0||n<r)):void 0)return e;n=t.substring(0,t.indexOf("://")+3);for(var r=t.substring(n.length,t.indexOf("/",n.length+1)),i=0===e.indexOf("/")?e.split("/"):(i=(i=t.split("?")[0]).substring(n.length+r.length+1,i.lastIndexOf("/"))).split("/").concat(e.split("/")),a=[],o=0;o<i.length;o++)i[o]&&f.exists(i[o])&&"."!=i[o]&&(".."==i[o]?a.pop():a.push(i[o]));return n+r+"/"+a.join("/")}},f.extend=function(){var n=f.extend.arguments;if(1<n.length){for(var e=1;e<n.length;e++)f.foreach(n[e],function(e,t){try{f.exists(t)&&(n[0][e]=t)}catch(e){}});return n[0]}return null},f.log=function(e,t){"undefined"!=typeof console&&void 0!==console.log&&(t?console.log(e,t):console.log(e))};var t=f.userAgentMatch=function(e){return null!==n.userAgent.toLowerCase().match(e)};f.isIE=e(/msie/i),f.isFF=e(/firefox/i),f.isChrome=e(/chrome/i),f.isIOS=e(/iP(hone|ad|od)/i),f.isIPod=e(/iP(hone|od)/i),f.isIPad=e(/iPad/i),f.isSafari602=e(/Macintosh.*Mac OS X 10_8.*6\.0\.\d* Safari/i),f.isSafari=function(){return t(/safari/i)&&!t(/chrome/i)&&!t(/chromium/i)&&!t(/android/i)},f.isAndroid=function(e){return t(e?RegExp("android.*"+e,"i"):/android/i)},f.isMobile=function(){return f.isIOS()||f.isAndroid()},f.saveCookie=function(e,t){c.cookie="jwplayer."+e+"="+t+"; path=/"},f.getCookies=function(){for(var e={},t=c.cookie.split("; "),n=0;n<t.length;n++){var r=t[n].split("=");0==r[0].indexOf("jwplayer.")&&(e[r[0].substring(9,r[0].length)]=r[1])}return e},f.typeOf=function(e){var t=typeof e;return"object"==t?e?e instanceof Array?"array":t:"null":t},f.translateEventResponse=function(e,t){var n=f.extend({},t);return e!=s.events.JWPLAYER_FULLSCREEN||n.fullscreen?"object"==typeof n.data?delete(n=f.extend(n,n.data)).data:"object"==typeof n.metadata&&f.deepReplaceKeyName(n.metadata,["__dot__","__spc__","__dsh__","__default__"],["."," ","-","default"]):(n.fullscreen="true"==n.message,delete n.message),f.foreach(["position","duration","offset"],function(e,t){n[t]&&(n[t]=Math.round(1e3*n[t])/1e3)}),n},f.flashVersion=function(){if(f.isAndroid())return 0;var e,t=n.plugins;try{if("undefined"!==t&&(e=t["Shockwave Flash"]))return parseInt(e.description.replace(/\D+(\d+)\..*/,"$1"))}catch(e){}if(void 0!==d.ActiveXObject)try{if(e=new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))return parseInt(e.GetVariable("$version").split(" ")[1].split(",")[0])}catch(e){}return 0},f.getScriptPath=function(e){for(var t=c.getElementsByTagName("script"),n=0;n<t.length;n++){var r=t[n].src;if(r&&0<=r.indexOf(e))return r.substr(0,r.indexOf(e))}return""},f.deepReplaceKeyName=function(a,o,l){switch(s.utils.typeOf(a)){case"array":for(var e=0;e<a.length;e++)a[e]=s.utils.deepReplaceKeyName(a[e],o,l);break;case"object":f.foreach(a,function(e,t){var n;if(o instanceof Array&&l instanceof Array){if(o.length!=l.length)return;n=o}else n=[o];for(var r=e,i=0;i<n.length;i++)r=r.replace(RegExp(o[i],"g"),l[i]);a[r]=s.utils.deepReplaceKeyName(t,o,l),e!=r&&delete a[e]})}return a};var r=f.pluginPathType={ABSOLUTE:0,RELATIVE:1,CDN:2};f.getPluginPathType=function(e){if("string"==typeof e){var t=(e=e.split("?")[0]).indexOf("://");if(0<t)return r.ABSOLUTE;var n=e.indexOf("/");return e=f.extension(e),!(t<0&&n<0)||e&&isNaN(e)?r.RELATIVE:r.CDN}},f.getPluginName=function(e){return e.replace(/^(.*\/)?([^-]*)-?.*\.(swf|js)$/,"$2")},f.getPluginVersion=function(e){return e.replace(/[^-]*-?([^\.]*).*$/,"$1")},f.isYouTube=function(e){return/^(http|\/\/).*(youtube\.com|youtu\.be)\/.+/.test(e)},f.youTubeID=function(e){try{return/v[=\/]([^?&]*)|youtu\.be\/([^?]*)|^([\w-]*)$/i.exec(e).slice(1).join("").replace("?","")}catch(e){return""}},f.isRtmp=function(e,t){return 0==e.indexOf("rtmp")||"rtmp"==t},f.foreach=function(e,t){for(var n in e)"function"===f.typeOf(e.hasOwnProperty)&&!Object.prototype.hasOwnProperty.call(e,n)||t(n,e[n])},f.isHTTPS=function(){return 0==d.location.href.indexOf("https")},f.repo=function(){var e="/etc/designs/huawei-cbg-site/statics/";try{f.isHTTPS()&&(e=e.replace("http://","https://"))}catch(e){}return e},f.ajax=function(t,e,n){var r,i,a,o;0<t.indexOf("#")&&(t=t.replace(/#.*$/,"")),(i=!!((i=t)&&0<=i.indexOf("://")&&i.split("/")[2]!=d.location.href.split("/")[2]))&&f.exists(d.XDomainRequest)?((r=new XDomainRequest).onload=u(r,t,e,n),r.onerror=l(n)):f.exists(d.XMLHttpRequest)?(a=r=new XMLHttpRequest,o=t,r.onreadystatechange=function(){if(4===a.readyState)switch(a.status){case 200:u(a,o,e,n)();break;case 404:n("File not found")}},r.onerror=l(n)):n&&n();try{r.open("GET",t,!0),r.send(null)}catch(e){n&&n(t)}return r},f.parseXML=function(e){try{var t;if(d.DOMParser){t=(new DOMParser).parseFromString(e,"text/xml");try{if("parsererror"==t.childNodes[0].firstChild.nodeName)return}catch(e){}}else(t=new ActiveXObject("Microsoft.XMLDOM")).async="false",t.loadXML(e);return t}catch(e){}},f.filterPlaylist=function(e,t){for(var n=[],r=0;r<e.length;r++){var i=f.extend({},e[r]);if(i.sources=f.filterSources(i.sources),0<i.sources.length){for(var a=0;a<i.sources.length;a++){var o=i.sources[a];o.label||(o.label=a.toString())}n.push(i)}}if(t&&0==n.length)for(r=0;r<e.length;r++)if((i=f.extend({},e[r])).sources=f.filterSources(i.sources,!0),0<i.sources.length){for(a=0;a<i.sources.length;a++)(o=i.sources[a]).label||(o.label=a.toString());n.push(i)}return n},f.filterSources=function(e,t){var n,r,i=f.extensionmap;if(e){r=[];for(var a=0;a<e.length;a++){var o=e[a].type,l=e[a].file;l&&l.trim&&(l=l.trim()),o||(o=i.extType(f.extension(l)),e[a].type=o),t?s.embed.flashCanPlay(l,o)&&(o==(n=n||o)&&r.push(f.extend({},e[a]))):f.canPlayHTML5(o)&&(o==(n=n||o)&&r.push(f.extend({},e[a])))}}return r},f.canPlayHTML5=function(e){return(!f.isAndroid()||"hls"!=e&&"m3u"!=e&&"m3u8"!=e)&&(!!(e=f.extensionmap.types[e])&&!!s.vid.canPlayType&&s.vid.canPlayType(e))},f.seconds=function(e){var t=(e=e.replace(",",".")).split(":"),n=0;return"s"==e.substr(-1)?n=Number(e.substr(0,e.length-1)):"m"==e.substr(-1)?n=60*Number(e.substr(0,e.length-1)):"h"==e.substr(-1)?n=3600*Number(e.substr(0,e.length-1)):1<t.length?(n=Number(t[t.length-1]),n+=60*Number(t[t.length-2]),3==t.length&&(n+=3600*Number(t[t.length-3]))):n=Number(e),n},f.serialize=function(e){return null==e?null:"true"==e.toString().toLowerCase()||"false"!=e.toString().toLowerCase()&&(isNaN(Number(e))||5<e.length||0==e.length?e:Number(e))}}(jwplayer),function(e){var t=e.foreach,i={mp4:"video/mp4",vorbis:"audio/ogg",ogg:"video/ogg",webm:"video/webm",aac:"audio/mp4",mp3:"audio/mpeg",hls:"application/vnd.apple.mpegurl"},n={mp4:i.mp4,f4v:i.mp4,m4v:i.mp4,mov:i.mp4,m4a:i.aac,f4a:i.aac,aac:i.aac,mp3:i.mp3,ogv:i.ogg,ogg:i.vorbis,oga:i.vorbis,webm:i.webm,m3u8:i.hls,hls:i.hls},r={flv:"video",f4v:"video",mov:"video",m4a:"video",m4v:"video",mp4:"video",aac:"video",f4a:"video",mp3:"sound",smil:"rtmp",m3u8:"hls",hls:"hls"},a=e.extensionmap={};t(n,function(e,t){a[e]={html5:t}}),t(r,function(e,t){a[e]||(a[e]={}),a[e].flash=t}),a.types=i,a.mimeType=function(n){var r;return t(i,function(e,t){r||t!=n||(r=e)}),r},a.extType=function(e){return a.mimeType(n[e])}}(jwplayer.utils),function(l){var s=l.loaderstatus={NEW:0,LOADING:1,ERROR:2,COMPLETE:3},u=document;l.scriptloader=function(n){function r(){a=s.ERROR,e.sendEvent(o.ERROR)}function i(){a=s.COMPLETE,e.sendEvent(o.COMPLETE)}var a=s.NEW,o=jwplayer.events,e=new o.eventdispatcher;l.extend(this,e),this.load=function(){var e,t=l.scriptloader.loaders[n];!t||t.getStatus()!=s.NEW&&t.getStatus()!=s.LOADING?(l.scriptloader.loaders[n]=this,a==s.NEW&&(a=s.LOADING,(e=u.createElement("script")).addEventListener?(e.onload=i,e.onerror=r):e.readyState&&(e.onreadystatechange=function(){"loaded"!=e.readyState&&"complete"!=e.readyState||i()}),u.getElementsByTagName("head")[0].appendChild(e),e.src=n)):(t.addEventListener(o.ERROR,r),t.addEventListener(o.COMPLETE,i))},this.getStatus=function(){return a}},l.scriptloader.loaders={}}(jwplayer.utils),function(e){e.trim=function(e){return e.replace(/^\s*/,"").replace(/\s*$/,"")},e.pad=function(e,t,n){for(n=n||"0";e.length<t;)e=n+e;return e},e.xmlAttribute=function(e,t){for(var n=0;n<e.attributes.length;n++)if(e.attributes[n].name&&e.attributes[n].name.toLowerCase()==t.toLowerCase())return e.attributes[n].value.toString();return""},e.extension=function(e){return e&&"rtmp"!=e.substr(0,4)?-1<(e=e.substring(e.lastIndexOf("/")+1,e.length).split("?")[0].split("#")[0]).lastIndexOf(".")?e.substr(e.lastIndexOf(".")+1,e.length).toLowerCase():void 0:""},e.stringToColor=function(e){return 3==(e=e.replace(/(#|0x)?([0-9A-F]{3,6})$/gi,"$2")).length&&(e=e.charAt(0)+e.charAt(0)+e.charAt(1)+e.charAt(1)+e.charAt(2)+e.charAt(2)),parseInt(e,16)}}(jwplayer.utils),function(c){var d="touchmove",f="touchstart";c.touch=function(e){function t(e){e.type==f?(a=!0,l=r(u.DRAG_START,e)):e.type==d?a&&(s||(n(u.DRAG_START,e,l),s=!0),n(u.DRAG,e)):(a&&(s?n(u.DRAG_END,e):(e.cancelBubble=!0,n(u.TAP,e))),a=s=!1,l=null)}function n(e,t,n){o[e]&&(t.preventManipulation&&t.preventManipulation(),t.preventDefault&&t.preventDefault(),t=n||r(e,t))&&o[e](t)}function r(e,t){var n=null;if(t.touches&&t.touches.length?n=t.touches[0]:t.changedTouches&&t.changedTouches.length&&(n=t.changedTouches[0]),!n)return null;t=i.getBoundingClientRect(),n={type:e,target:i,x:n.pageX-window.pageXOffset-t.left,y:n.pageY,deltaX:0,deltaY:0};return e!=u.TAP&&l&&(n.deltaX=n.x-l.x,n.deltaY=n.y-l.y),n}var i=e,a=!1,o={},l=null,s=!1,u=c.touchEvents;return document.addEventListener(d,t),document.addEventListener("touchend",function(e){a&&s&&n(u.DRAG_END,e),a=s=!1,l=null}),document.addEventListener("touchcancel",t),e.addEventListener(f,t),e.addEventListener("touchend",t),this.addEventListener=function(e,t){o[e]=t},this.removeEventListener=function(e){delete o[e]},this}}(jwplayer.utils),jwplayer.utils.touchEvents={DRAG:"jwplayerDrag",DRAG_START:"jwplayerDragStart",DRAG_END:"jwplayerDragEnd",TAP:"jwplayerTap"},function(a){a.key=function(e){var t,n,r;this.edition=function(){return r&&r.getTime()<(new Date).getTime()?"invalid":t},this.token=function(){return n},a.exists(e)||(e="");try{var i=(e="").split("/");(t=i[0])?/^(free|pro|premium|ads)$/i.test(t)?(n=i[1],i[2]&&0<parseInt(i[2])&&(r=new Date).setTime(String(i[2]))):t="invalid":t="free"}catch(e){t="invalid"}}}(jwplayer.utils),function(){var d=jwplayer.utils.tea={};d.encrypt=function(e,t){if(0==e.length)return"";var n=d.strToLongs(p.encode(e));n.length<=1&&(n[1]=0);for(var r,i=d.strToLongs(p.encode(t).slice(0,16)),a=n.length,o=n[a-1],l=n[0],s=Math.floor(6+52/a),u=0;0<s--;){r=(u+=2654435769)>>>2&3;for(var c=0;c<a;c++)o=(o>>>5^(l=n[(c+1)%a])<<2)+(l>>>3^o<<4)^(u^l)+(i[3&c^r]^o),o=n[c]+=o}return n=d.longsToStr(n),f.encode(n)},d.decrypt=function(e,t){if(0==e.length)return"";for(var n,r=d.strToLongs(f.decode(e)),i=d.strToLongs(p.encode(t).slice(0,16)),a=r.length,o=r[a-1],l=r[0],s=2654435769*Math.floor(6+52/a);0!=s;){n=s>>>2&3;for(var u=a-1;0<=u;u--)o=((o=r[0<u?u-1:a-1])>>>5^l<<2)+(l>>>3^o<<4)^(s^l)+(i[3&u^n]^o),l=r[u]-=o;s-=2654435769}return r=(r=d.longsToStr(r)).replace(/\0+$/,""),p.decode(r)},d.strToLongs=function(e){for(var t=Array(Math.ceil(e.length/4)),n=0;n<t.length;n++)t[n]=e.charCodeAt(4*n)+(e.charCodeAt(4*n+1)<<8)+(e.charCodeAt(4*n+2)<<16)+(e.charCodeAt(4*n+3)<<24);return t},d.longsToStr=function(e){for(var t=Array(e.length),n=0;n<e.length;n++)t[n]=String.fromCharCode(255&e[n],e[n]>>>8&255,e[n]>>>16&255,e[n]>>>24&255);return t.join("")};var f={code:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e,t){var n,r,i,a,o=[],l="",s=f.code,u=void 0!==t&&t?p.encode(e):e,c=u.length%3;if(0<c)for(;c++<3;)l+="=",u+="\0";for(c=0;c<u.length;c+=3)n=(a=u.charCodeAt(c)<<16|u.charCodeAt(c+1)<<8|u.charCodeAt(c+2))>>18&63,r=a>>12&63,i=a>>6&63,a&=63,o[c/3]=s.charAt(n)+s.charAt(r)+s.charAt(i)+s.charAt(a);return(o=o.join("")).slice(0,o.length-l.length)+l},decode:function(e,t){t=void 0!==t&&t;for(var n,r,i,a,o,l=[],s=f.code,u=t?p.decode(e):e,c=0;c<u.length;c+=4)n=(i=s.indexOf(u.charAt(c))<<18|s.indexOf(u.charAt(c+1))<<12|(a=s.indexOf(u.charAt(c+2)))<<6|(o=s.indexOf(u.charAt(c+3))))>>>16&255,r=i>>>8&255,i&=255,l[c/4]=String.fromCharCode(n,r,i),64==o&&(l[c/4]=String.fromCharCode(n,r)),64==a&&(l[c/4]=String.fromCharCode(n));return a=l.join(""),t?p.decode(a):a}},p={encode:function(e){return(e=e.replace(/[\u0080-\u07ff]/g,function(e){return e=e.charCodeAt(0),String.fromCharCode(192|e>>6,128|63&e)})).replace(/[\u0800-\uffff]/g,function(e){return e=e.charCodeAt(0),String.fromCharCode(224|e>>12,128|e>>6&63,128|63&e)})},decode:function(e){return(e=e.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,function(e){return e=(15&e.charCodeAt(0))<<12|(63&e.charCodeAt(1))<<6|63&e.charCodeAt(2),String.fromCharCode(e)})).replace(/[\u00c0-\u00df][\u0080-\u00bf]/g,function(e){return e=(31&e.charCodeAt(0))<<6|63&e.charCodeAt(1),String.fromCharCode(e)})}}}(),jwplayer.events={COMPLETE:"COMPLETE",ERROR:"ERROR",API_READY:"jwplayerAPIReady",JWPLAYER_READY:"jwplayerReady",JWPLAYER_FULLSCREEN:"jwplayerFullscreen",JWPLAYER_RESIZE:"jwplayerResize",JWPLAYER_ERROR:"jwplayerError",JWPLAYER_SETUP_ERROR:"jwplayerSetupError",JWPLAYER_MEDIA_BEFOREPLAY:"jwplayerMediaBeforePlay",JWPLAYER_MEDIA_BEFORECOMPLETE:"jwplayerMediaBeforeComplete",JWPLAYER_COMPONENT_SHOW:"jwplayerComponentShow",JWPLAYER_COMPONENT_HIDE:"jwplayerComponentHide",JWPLAYER_MEDIA_BUFFER:"jwplayerMediaBuffer",JWPLAYER_MEDIA_BUFFER_FULL:"jwplayerMediaBufferFull",JWPLAYER_MEDIA_ERROR:"jwplayerMediaError",JWPLAYER_MEDIA_LOADED:"jwplayerMediaLoaded",JWPLAYER_MEDIA_COMPLETE:"jwplayerMediaComplete",JWPLAYER_MEDIA_SEEK:"jwplayerMediaSeek",JWPLAYER_MEDIA_TIME:"jwplayerMediaTime",JWPLAYER_MEDIA_VOLUME:"jwplayerMediaVolume",JWPLAYER_MEDIA_META:"jwplayerMediaMeta",JWPLAYER_MEDIA_MUTE:"jwplayerMediaMute",JWPLAYER_MEDIA_LEVELS:"jwplayerMediaLevels",JWPLAYER_MEDIA_LEVEL_CHANGED:"jwplayerMediaLevelChanged",JWPLAYER_CAPTIONS_CHANGED:"jwplayerCaptionsChanged",JWPLAYER_CAPTIONS_LIST:"jwplayerCaptionsList",JWPLAYER_PLAYER_STATE:"jwplayerPlayerState",state:{BUFFERING:"BUFFERING",IDLE:"IDLE",PAUSED:"PAUSED",PLAYING:"PLAYING"},JWPLAYER_PLAYLIST_LOADED:"jwplayerPlaylistLoaded",JWPLAYER_PLAYLIST_ITEM:"jwplayerPlaylistItem",JWPLAYER_PLAYLIST_COMPLETE:"jwplayerPlaylistComplete",JWPLAYER_DISPLAY_CLICK:"jwplayerViewClick",JWPLAYER_CONTROLS:"jwplayerViewControls",JWPLAYER_USER_ACTION:"jwplayerUserAction",JWPLAYER_INSTREAM_CLICK:"jwplayerInstreamClicked",JWPLAYER_INSTREAM_DESTROYED:"jwplayerInstreamDestroyed",JWPLAYER_AD_TIME:"jwplayerAdTime",JWPLAYER_AD_ERROR:"jwplayerAdError",JWPLAYER_AD_CLICK:"jwplayerAdClicked",JWPLAYER_AD_COMPLETE:"jwplayerAdComplete",JWPLAYER_AD_IMPRESSION:"jwplayerAdImpression",JWPLAYER_AD_COMPANIONS:"jwplayerAdCompanions"},function(e){let l=Function;var s=jwplayer.utils;e.eventdispatcher=function(r,i){var a,o;this.resetEventListeners=function(){a={},o=[]},this.resetEventListeners(),this.addEventListener=function(e,t,n){try{s.exists(a[e])||(a[e]=[]),"string"===s.typeOf(t)&&(t=new l("return "+t)()),a[e].push({listener:t,count:n})}catch(e){s.log("error",e)}return!1},this.removeEventListener=function(e,t){if(a[e]){try{for(var n=0;n<a[e].length;n++)if(a[e][n].listener.toString()==t.toString()){a[e].splice(n,1);break}}catch(e){s.log("error",e)}return!1}},this.addGlobalListener=function(e,t){try{"string"===s.typeOf(e)&&(e=new l("return "+e)()),o.push({listener:e,count:t})}catch(e){s.log("error",e)}return!1},this.removeGlobalListener=function(e){if(e){try{for(var t=0;t<o.length;t++)if(o[t].listener.toString()==e.toString()){o.splice(t,1);break}}catch(e){s.log("error",e)}return!1}},this.sendEvent=function(t,e){if(s.exists(e)||(e={}),s.extend(e,{id:r,version:jwplayer.version,type:t}),i&&s.log(t,e),"undefined"!=s.typeOf(a[t]))for(var n=0;n<a[t].length;n++){try{a[t][n].listener(e)}catch(e){s.log("There was an error while handling a listener: "+e.toString(),a[t][n].listener)}a[t][n]&&(1===a[t][n].count?delete a[t][n]:0<a[t][n].count&&--a[t][n].count)}for(n=0;n<o.length;n++){try{o[n].listener(e)}catch(e){s.log("There was an error while handling a listener: "+e.toString(),o[n].listener)}o[n]&&(1===o[n].count?delete o[n]:0<o[n].count&&--o[n].count)}}}}(jwplayer.events),function(a){var o={},n={};a.plugins=function(){},a.plugins.loadPlugins=function(e,t){return n[e]=new a.plugins.pluginloader(new a.plugins.model(o),t),n[e]},a.plugins.registerPlugin=function(e,t,n,r){var i=a.utils.getPluginName(e);o[i]||(o[i]=new a.plugins.plugin(e)),o[i].registerPlugin(e,t,n,r)}}(jwplayer),function(r){r.plugins.model=function(n){this.addPlugin=function(e){var t=r.utils.getPluginName(e);return n[t]||(n[t]=new r.plugins.plugin(e)),n[t]},this.getPlugins=function(){return n}}}(jwplayer),function(e){var d=jwplayer.utils,f=jwplayer.events;e.pluginmodes={FLASH:0,JAVASCRIPT:1,HYBRID:2},e.plugin=function(t){function n(){switch(d.getPluginPathType(t)){case d.pluginPathType.ABSOLUTE:return t;case d.pluginPathType.RELATIVE:return d.getAbsolutePath(t,window.location.href)}}function r(){s=setTimeout(function(){u=d.loaderstatus.COMPLETE,c.sendEvent(f.COMPLETE)},1e3)}function i(){u=d.loaderstatus.ERROR,c.sendEvent(f.ERROR)}var a,o,l,s,u=d.loaderstatus.NEW,c=new f.eventdispatcher;d.extend(this,c),this.load=function(){var e;u==d.loaderstatus.NEW&&(0<t.lastIndexOf(".swf")?(a=t,u=d.loaderstatus.COMPLETE,c.sendEvent(f.COMPLETE)):d.getPluginPathType(t)==d.pluginPathType.CDN?(u=d.loaderstatus.COMPLETE,c.sendEvent(f.COMPLETE)):(u=d.loaderstatus.LOADING,(e=new d.scriptloader(n())).addEventListener(f.COMPLETE,r),e.addEventListener(f.ERROR,i),e.load()))},this.registerPlugin=function(e,t,n,r){s&&(clearTimeout(s),s=void 0),l=t,n&&r?(a=r,o=n):"string"==typeof n?a=n:"function"==typeof n?o=n:n||r||(a=e),u=d.loaderstatus.COMPLETE,c.sendEvent(f.COMPLETE)},this.getStatus=function(){return u},this.getPluginName=function(){return d.getPluginName(t)},this.getFlashPath=function(){if(a)switch(d.getPluginPathType(a)){case d.pluginPathType.ABSOLUTE:return a;case d.pluginPathType.RELATIVE:return 0<t.lastIndexOf(".swf")?d.getAbsolutePath(a,window.location.href):d.getAbsolutePath(a,n())}return null},this.getJS=function(){return o},this.getTarget=function(){return l},this.getPluginmode=function(){return void 0!==a&&void 0!==o?e.pluginmodes.HYBRID:void 0!==a?e.pluginmodes.FLASH:void 0!==o?e.pluginmodes.JAVASCRIPT:void 0},this.getNewInstance=function(e,t,n){return new o(e,t,n)},this.getURL=function(){return t}}}(jwplayer.plugins),function(d){var h=d.utils,f=d.events,g=h.foreach;d.plugins.pluginloader=function(t,n){function a(){l?u.sendEvent(f.ERROR,{message:o}):e||(e=!0,i=h.loaderstatus.COMPLETE,u.sendEvent(f.COMPLETE))}function r(){var r,i;s||a(),e||l||(r=0,i=t.getPlugins(),h.foreach(s,function(e){e=h.getPluginName(e);var t=i[e];e=t.getJS();var n=t.getTarget();(t=t.getStatus())==h.loaderstatus.LOADING||t==h.loaderstatus.NEW?r++:e&&(!n||parseFloat(n)>parseFloat(d.version))&&(l=!0,o="Incompatible player version",a())}),0==r&&a())}var o,i=h.loaderstatus.NEW,e=!1,l=!1,s=n,u=new f.eventdispatcher;h.extend(this,u),this.setupPlugins=function(l,s,u){var c={length:0,plugins:{}},d=0,f={},p=t.getPlugins();return g(s.plugins,function(e,t){var n,r=h.getPluginName(e),i=p[r],e=i.getFlashPath(),a=i.getJS(),o=i.getURL();e&&(c.plugins[e]=h.extend({},t),c.plugins[e].pluginmode=i.getPluginmode(),c.length++);try{a&&s.plugins&&s.plugins[o]&&((n=document.createElement("div")).id=l.id+"_"+r,n.style.position="absolute",n.style.top=0,n.style.zIndex=d+10,f[r]=i.getNewInstance(l,h.extend({},s.plugins[o]),n),d++,l.onReady(u(f[r],n,!0)),l.onResize(u(f[r],n)))}catch(e){h.log("ERROR: Failed to load "+r+".")}}),l.plugins=f,c},this.load=function(){var e;h.exists(n)&&"object"!=h.typeOf(n)||(i=h.loaderstatus.LOADING,g(n,function(e){h.exists(e)&&((e=t.addPlugin(e)).addEventListener(f.COMPLETE,r),e.addEventListener(f.ERROR,c))}),e=t.getPlugins(),g(e,function(e,t){t.load()})),r()};var c=this.pluginFailed=function(){l||(l=!0,o="File not found",a())};this.getStatus=function(){return i}}}(jwplayer),jwplayer,jwplayer.parsers={localName:function(e){return e&&(e.localName||e.baseName)||""},textContent:function(e){return e&&(e.textContent||e.text)||""},getChildNode:function(e,t){return e.childNodes[t]},numChildren:function(e){return e.childNodes?e.childNodes.length:0}},function(s){var u=s.parsers;(u.jwparser=function(){}).parseEntry=function(e,t){for(var n=[],r=[],i=s.utils.xmlAttribute,a=0;a<e.childNodes.length;a++){var o,l=e.childNodes[a];"jwplayer"==l.prefix&&("source"==(o=u.localName(l))?(delete t.sources,n.push({file:i(l,"file"),default:i(l,"default"),label:i(l,"label"),type:i(l,"type")})):"track"==o?(delete t.tracks,r.push({file:i(l,"file"),default:i(l,"default"),kind:i(l,"kind"),label:i(l,"label")})):(t[o]=s.utils.serialize(u.textContent(l)),"file"==o&&t.sources&&delete t.sources)),t.file||(t.file=t.link)}if(n.length)for(t.sources=[],a=0;a<n.length;a++)0<n[a].file.length&&(n[a].default="true"==n[a].default,n[a].label.length||delete n[a].label,t.sources.push(n[a]));if(r.length)for(t.tracks=[],a=0;a<r.length;a++)0<r[a].file.length&&(r[a].default="true"==r[a].default,r[a].kind=r[a].kind.length?r[a].kind:"captions",r[a].label.length||delete r[a].label,t.tracks.push(r[a]));return t}}(jwplayer),function(e){var l=jwplayer.utils,s=l.xmlAttribute,u=e.localName,c=e.textContent,d=e.numChildren,f=e.mediaparser=function(){};f.parseGroup=function(e,t){for(var n=[],r=0;r<d(e);r++)if("media"==(a=e.childNodes[r]).prefix&&u(a))switch(u(a).toLowerCase()){case"content":s(a,"duration")&&(t.duration=l.seconds(s(a,"duration"))),0<d(a)&&(t=f.parseGroup(a,t)),s(a,"url")&&(t.sources||(t.sources=[]),t.sources.push({file:s(a,"url"),type:s(a,"type"),width:s(a,"width"),label:s(a,"label")}));break;case"title":t.title=c(a);break;case"description":t.description=c(a);break;case"guid":t.mediaid=c(a);break;case"thumbnail":t.image||(t.image=s(a,"url"));break;case"group":f.parseGroup(a,t);break;case"subtitle":var i,a,o={};o.file=s(a,"url"),o.kind="captions",0<s(a,"lang").length&&(i=o,a={zh:"Chinese",nl:"Dutch",en:"English",fr:"French",de:"German",it:"Italian",ja:"Japanese",pt:"Portuguese",ru:"Russian",es:"Spanish"}[a=s(a,"lang")]||a,i.label=a),n.push(o)}for(Object.prototype.hasOwnProperty.call(t,"tracks")||(t.tracks=[]),r=0;r<n.length;r++)t.tracks.push(n[r]);return t}}(jwplayer.parsers),function(o){var l=jwplayer.utils,s=o.textContent,u=o.getChildNode,c=o.numChildren,d=o.localName;o.rssparser={},o.rssparser.parse=function(e){for(var t=[],n=0;n<c(e);n++){var r=u(e,n);if("channel"==d(r).toLowerCase())for(var i=0;i<c(r);i++){var a=u(r,i);"item"==d(a).toLowerCase()&&t.push(function(e){for(var t={},n=0;n<e.childNodes.length;n++){var r=e.childNodes[n],i=d(r);if(i)switch(i.toLowerCase()){case"enclosure":t.file=l.xmlAttribute(r,"url");break;case"title":t.title=s(r);break;case"guid":t.mediaid=s(r);break;case"pubdate":t.date=s(r);break;case"description":t.description=s(r);break;case"link":t.link=s(r);break;case"category":t.tags=t.tags?t.tags+s(r):s(r)}}return t=o.mediaparser.parseGroup(e,t),t=o.jwparser.parseEntry(e,t),new jwplayer.playlist.item(t)}(a))}}return t}}(jwplayer.parsers),function(r){r.playlist=function(e){var t=[];if("array"==r.utils.typeOf(e))for(var n=0;n<e.length;n++)t.push(new r.playlist.item(e[n]));else t.push(new r.playlist.item(e));return t}}(jwplayer),function(a){var o=a.item=function(e){var t=jwplayer.utils,n=t.extend({},o.defaults,e);n.tracks=e&&t.exists(e.tracks)?e.tracks:[],0==n.sources.length&&(n.sources=[new a.source(n)]);for(var r=0;r<n.sources.length;r++){var i=n.sources[r].default;n.sources[r].default=!!i&&"true"==i.toString(),n.sources[r]=new a.source(n.sources[r])}if(n.captions&&!t.exists(e.tracks)){for(e=0;e<n.captions.length;e++)n.tracks.push(n.captions[e]);delete n.captions}for(r=0;r<n.tracks.length;r++)n.tracks[r]=new a.track(n.tracks[r]);return n};o.defaults={description:"",image:"",mediaid:"",title:"",sources:[],tracks:[]}}(jwplayer.playlist),function(o){var e=jwplayer,r=e.utils,l=e.events,s=e.parsers;o.loader=function(){function t(e){try{var t=e.responseXML.childNodes;e="";for(var n,r=0;r<t.length&&8==(e=t[r]).nodeType;r++);"xml"==s.localName(e)&&(e=e.nextSibling),"rss"!=s.localName(e)?i("Not a valid RSS feed"):(n=new o(s.rssparser.parse(e)),a.sendEvent(l.JWPLAYER_PLAYLIST_LOADED,{playlist:n}))}catch(e){i()}}function n(e){i(e.match(/invalid/i)?"Not a valid RSS feed":"")}function i(e){a.sendEvent(l.JWPLAYER_ERROR,{message:e||"Error loading file"})}var a=new l.eventdispatcher;r.extend(this,a),this.load=function(e){r.ajax(e,t,n)}}}(jwplayer.playlist),function(e){var r=jwplayer.utils,i={file:void 0,label:void 0,type:void 0,default:void 0};e.source=function(t){var n=r.extend({},i);return r.foreach(i,function(e){r.exists(t[e])&&(n[e]=t[e],delete t[e])}),n.type&&0<n.type.indexOf("/")&&(n.type=r.extensionmap.mimeType(n.type)),"m3u8"==n.type&&(n.type="hls"),"smil"==n.type&&(n.type="rtmp"),n}}(jwplayer.playlist),function(e){var r=jwplayer.utils,i={file:void 0,label:void 0,kind:"captions",default:!1};e.track=function(t){var n=r.extend({},i);return t=t||{},r.foreach(i,function(e){r.exists(t[e])&&(n[e]=t[e],delete t[e])}),n}}(jwplayer.playlist),function(E){var m=E.utils,v=E.events,A=document,w=E.embed=function(a){function o(e){t(d,i+e.message)}function l(e){e&&e.message?t(d,"Error loading playlist: "+e.message):t(d,i+"No playable sources found")}function u(){t(d,"Adobe SiteCatalyst Error: Could not find Media Module")}function t(e,t){var n,r;p.fallback?((n=e.style).backgroundColor="#000",n.color="#FFF",n.width=m.styleDimension(p.width),n.height=m.styleDimension(p.height),n.display="table",n.opacity=1,(r=(n=document.createElement("p")).style).verticalAlign="middle",r.textAlign="center",r.display="table-cell",r.font="15px/20px Arial, Helvetica, sans-serif",n.innerHTML=t.replace(":",":<br>"),e.innerHTML="",e.appendChild(n),c(t,!0)):c(t,!1)}function c(e,t){y&&(clearTimeout(y),y=null),a.dispatchEvent(v.JWPLAYER_SETUP_ERROR,{message:e,fallback:t})}var d,e,f,p=new w.config(a.config),n=p.width,r=p.height,i="Error loading player: ",h=E.plugins.loadPlugins(a.id,p.plugins),g=!1,y=null;return p.fallbackDiv&&(f=p.fallbackDiv,delete p.fallbackDiv),p.id=a.id,e=A.getElementById(a.id),p.aspectratio?a.config.aspectratio=p.aspectratio:delete a.config.aspectratio,(d=A.createElement("div")).id=e.id,d.style.width=0<n.toString().indexOf("%")?n:n+"px",d.style.height=0<r.toString().indexOf("%")?r:r+"px",e.parentNode.replaceChild(d,e),E.embed.errorScreen=t,h.addEventListener(v.COMPLETE,function t(){if(p.sitecatalyst)try{null!=s&&Object.prototype.hasOwnProperty.call(s,"Media")||u()}catch(e){return void u()}if("array"==m.typeOf(p.playlist)&&p.playlist.length<2&&(0==p.playlist.length||!p.playlist[0].sources||0==p.playlist[0].sources.length))l();else if(!g)if("string"==m.typeOf(p.playlist)){var e=new E.playlist.loader;e.addEventListener(v.JWPLAYER_PLAYLIST_LOADED,function(e){p.playlist=e.playlist,g=!1,t()}),e.addEventListener(v.JWPLAYER_ERROR,function(e){g=!1,l(e)}),g=!0,e.load(p.playlist)}else if(h.getStatus()==m.loaderstatus.COMPLETE){for(e=0;e<p.modes.length;e++)if(p.modes[e].type&&w[p.modes[e].type]){var n=m.extend({},p),r=new w[p.modes[e].type](d,p.modes[e],n,h,a);if(r.supportsConfig())return r.addEventListener(v.ERROR,o),r.embed(),function(n,e){m.foreach(e,function(e,t){"function"==typeof n[e]&&n[e].call(n,t)})}(a,n.events),a}var i;p.fallback?(i="No suitable players found and fallback enabled",y=setTimeout(function(){c(i,!0)},10),m.log(i),new w.download(d,p,l)):(c(i="No suitable players found and fallback disabled",!1),m.log(i),d.parentNode.replaceChild(f,d))}}),h.addEventListener(v.ERROR,function(e){t(d,"Could not load plugins: "+e.message)}),h.load(),a}}(jwplayer),function(i){function a(t){if(t.playlist)for(var e=0;e<t.playlist.length;e++)t.playlist[e]=new l(t.playlist[e]);else{var n={};o.foreach(l.defaults,function(e){r(t,n,e)}),n.sources||(t.levels?(n.sources=t.levels,delete t.levels):(r(t,e={},"file"),r(t,e,"type"),n.sources=e.file?[e]:[])),t.playlist=[new l(n)]}}function r(e,t,n){o.exists(e[n])&&(t[n]=e[n],delete e[n])}var o=i.utils,l=i.playlist.item;(i.embed.config=function(e){var t={fallback:!0,height:270,primary:"html5",width:480,base:e.base||o.getScriptPath("jwplayer.js"),aspectratio:""};e=o.extend(t,i.defaults,e);var n,t={type:"html5",src:"/en/ucmf/groups/public/documents/webasset/jwplayer_cej.html5.js"},r={type:"flash",src:e.base+"jwplayer.flash.swf"};return e.modes="flash"==e.primary?[r,t]:[t,r],e.listbar&&(e.playlistsize=e.listbar.size,e.playlistposition=e.listbar.position,e.playlistlayout=e.listbar.layout),e.flashplayer&&(r.src=e.flashplayer),e.html5player&&(t.src=e.html5player),a(e),t="string"!=typeof(r=e.aspectratio)||!o.exists(r)||-1==(n=r.indexOf(":"))?0:(t=parseFloat(r.substr(0,n)),r=parseFloat(r.substr(n+1)),t<=0||r<=0?0:r/t*100+"%"),-1!=e.width.toString().indexOf("%")&&t?e.aspectratio=t:delete e.aspectratio,e}).addConfig=function(e,t){return a(t),o.extend(e,t)}}(jwplayer),function(e){var y=e.utils,E=document;e.embed.download=function(e,t,n){function r(e,t){for(var n=E.querySelectorAll(e),r=0;r<n.length;r++)y.foreach(t,function(e,t){n[r].style[e]=t})}function i(e,t,n){return e=E.createElement(e),t&&(e.className="jwdownload"+t),n&&n.appendChild(e),e}var a,o=(f=y.extend({},t)).width||480,l=f.height||320;t=t.logo||{prefix:y.repo(),file:"logo.png",margin:10};var s,u,c,d,f=f.playlist,p=["mp4","aac","mp3"];if(f&&f.length){for(a=(d=f[0]).sources,f=0;f<a.length;f++){var h=a[f],g=h.type||y.extensionmap.extType(y.extension(h.file));h.file&&y.foreach(p,function(e){g==p[e]?(s=h.file,u=d.image):y.isYouTube(h.file)&&(c=h.file)})}s?(a=s,n=u,e&&(f=i("a","display",e),i("div","icon",f),i("div","logo",f),a&&f.setAttribute("href",y.getAbsolutePath(a))),f="#"+e.id+" .jwdownload",e.style.width="",e.style.height="",r(f+"display",{width:y.styleDimension(Math.max(320,o)),height:y.styleDimension(Math.max(180,l)),background:"black center no-repeat "+(n?"url("+n+")":""),backgroundSize:"contain",position:"relative",border:"none",display:"block"}),r(f+"display div",{position:"absolute",width:"100%",height:"100%"}),r(f+"logo",{top:t.margin+"px",right:t.margin+"px",background:"top right no-repeat url("+t.prefix+t.file+")"}),r(f+"icon",{background:"center no-repeat url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgNJREFUeNrs28lqwkAYB/CZqNVDDj2r6FN41QeIy8Fe+gj6BL275Q08u9FbT8ZdwVfotSBYEPUkxFOoks4EKiJdaDuTjMn3wWBO0V/+sySR8SNSqVRKIR8qaXHkzlqS9jCfzzWcTCYp9hF5o+59sVjsiRzcegSckFzcjT+ruN80TeSlAjCAAXzdJSGPFXRpAAMYwACGZQkSdhG4WCzehMNhqV6vG6vVSrirKVEw66YoSqDb7cqlUilE8JjHd/y1MQefVzqdDmiaJpfLZWHgXMHn8F6vJ1cqlVAkEsGuAn83J4gAd2RZymQygX6/L1erVQt+9ZPWb+CDwcCC2zXGJaewl/DhcHhK3DVj+KfKZrMWvFarcYNLomAv4aPRSFZVlTlcSPA5fDweW/BoNIqFnKV53JvncjkLns/n/cLdS+92O7RYLLgsKfv9/t8XlDn4eDyiw+HA9Jyz2eyt0+kY2+3WFC5hluej0Ha7zQQq9PPwdDq1Et1sNsx/nFBgCqWJ8oAK1aUptNVqcYWewE4nahfU0YQnk4ntUEfGMIU2m01HoLaCKbTRaDgKtaVLk9tBYaBcE/6Artdr4RZ5TB6/dC+9iIe/WgAMYADDpAUJAxjAAAYwgGFZgoS/AtNNTF7Z2bL0BYPBV3Jw5xFwwWcYxgtBP5OkE8i9G7aWGOOCruvauwADALMLMEbKf4SdAAAAAElFTkSuQmCC)"})):c?(t=c,(e=i("embed","",e)).src="http://www.youtube.com/v/"+y.youTubeID(t),e.type="application/x-shockwave-flash",e.width=o,e.height=l):n()}}}(jwplayer),function(e){var h=e.utils,g=e.events,y={};(e.embed.flash=function(a,o,l,s,u){function c(e,t,n){var r=document.createElement("param");r.setAttribute("name",t),r.setAttribute("value",n),e.appendChild(r)}function d(t,n,r){return function(){try{r&&document.getElementById(u.id+"_wrapper").appendChild(n);var e=document.getElementById(u.id).getPluginConfig("display");"function"==typeof t.resize&&t.resize(e.width,e.height),n.style.left=e.x,n.style.top=e.h}catch(e){}}}var f=new e.events.eventdispatcher,p=h.flashVersion();h.extend(this,f),this.embed=function(){if(l.id=u.id,p<10)return f.sendEvent(g.ERROR,{message:"Flash version must be 10.0 or greater"}),!1;var e,t,n,r=u.config.listbar,i=h.extend({},l);for(a.id+"_wrapper"==a.parentNode.id?t=document.getElementById(a.id+"_wrapper"):(t=document.createElement("div"),(n=document.createElement("div")).style.display="none",n.id=a.id+"_aspect",t.id=a.id+"_wrapper",t.style.position="relative",t.style.display="block",t.style.width=h.styleDimension(i.width),t.style.height=h.styleDimension(i.height),u.config.aspectratio&&(e=parseFloat(u.config.aspectratio),n.style.display="block",n.style.marginTop=u.config.aspectratio,t.style.height="auto",t.style.display="inline-block",r&&("bottom"==r.position?n.style.paddingBottom=r.size+"px":"right"==r.position&&(n.style.marginBottom=-1*r.size*(e/100)+"px"))),a.parentNode.replaceChild(t,a),t.appendChild(a),t.appendChild(n)),0<(t=s.setupPlugins(u,i,d)).length?h.extend(i,function(e){if(!e)return{};var r={},i=[];return h.foreach(e,function(e,t){var n=h.getPluginName(e);i.push(e),h.foreach(t,function(e,t){r[n+"."+e]=t})}),r.plugins=i.join(","),r}(t.plugins)):delete i.plugins,void 0!==i["dock.position"]&&"false"==i["dock.position"].toString().toLowerCase()&&(i.dock=i["dock.position"],delete i["dock.position"]),t=i.wmode||(i.height&&i.height<=40?"transparent":"opaque"),n="height width modes events primary base fallback volume".split(" "),r=0;r<n.length;r++)delete i[n[r]];n=h.getCookies(),h.foreach(n,function(e,t){void 0===i[e]&&(i[e]=t)}),(n=window.location.href.split("/")).splice(n.length-1,1),n=n.join("/"),i.base=n+"/",y[a.id]=i,t=h.isIE()?(n='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" " width="100%" height="100%"id="'+a.id+'" name="'+a.id+'" tabindex=0"">',n+='<param name="movie" value="'+o.src+'">',n+='<param name="allowfullscreen" value="true"><param name="allowscriptaccess" value="always">',n+='<param name="seamlesstabbing" value="true">',n+='<param name="wmode" value="'+t+'">',n+='<param name="bgcolor" value="#000000">',n+="</object>",a.outerHTML=n,document.getElementById(a.id)):((n=document.createElement("object")).setAttribute("type","application/x-shockwave-flash"),n.setAttribute("data",o.src),n.setAttribute("width","100%"),n.setAttribute("height","100%"),n.setAttribute("bgcolor","#000000"),n.setAttribute("id",a.id),n.setAttribute("name",a.id),n.setAttribute("tabindex",0),c(n,"allowfullscreen","true"),c(n,"allowscriptaccess","always"),c(n,"seamlesstabbing","true"),c(n,"wmode",t),a.parentNode.replaceChild(n,a),n),u.config.aspectratio&&(t.style.position="absolute"),u.container=t,u.setPlayer(t,"flash")},this.supportsConfig=function(){if(p){if(!l)return!0;if("string"==h.typeOf(l.playlist))return!0;try{var e=l.playlist[0].sources;if(void 0===e)return!0;for(var t=0;t<e.length;t++)if(e[t].file&&n(e[t].file,e[t].type))return!0}catch(e){}}return!1}}).getVars=function(e){return y[e]};var n=e.embed.flashCanPlay=function(e,t){if(h.isYouTube(e)||h.isRtmp(e,t)||"hls"==t)return!0;e=h.extensionmap[t||h.extension(e)];return!!e&&!!e.flash}}(jwplayer),function(u){var c=u.utils,d=c.extensionmap,f=u.events;u.embed.html5=function(i,t,s,n,r){function a(t,n,r){return function(){try{var e=document.querySelector("#"+i.id+" .jwmain");r&&e.appendChild(n),"function"==typeof t.resize&&(t.resize(e.clientWidth,e.clientHeight),setTimeout(function(){t.resize(e.clientWidth,e.clientHeight)},400)),n.left=e.style.left,n.top=e.style.top}catch(e){}}}function o(e){l.sendEvent(e.type,{message:"HTML5 player not found"})}var l=this,e=new f.eventdispatcher;c.extend(l,e),l.embed=function(){var e;u.html5?(n.setupPlugins(r,s,a),i.innerHTML="",delete(e=u.utils.extend({},s)).volume,e=new u.html5.player(e),r.container=document.getElementById(r.id),r.setPlayer(e,"html5")):((e=new c.scriptloader(t.src)).addEventListener(f.ERROR,o),e.addEventListener(f.COMPLETE,l.embed),e.load())},l.supportsConfig=function(){if(u.vid.canPlayType)try{if("string"==c.typeOf(s.playlist))return!0;for(var e=s.playlist[0].sources,t=0;t<e.length;t++){var n,r=e[t].file,i=e[t].type;if(null!==navigator.userAgent.match(/BlackBerry/i)||c.isAndroid()&&("m3u"==c.extension(r)||"m3u8"==c.extension(r))||c.isRtmp(r,i))n=!1;else{var a,r=d[i||c.extension(r)];if(!r||r.flash&&!r.html5)a=!1;else{var o=r.html5,l=u.vid;if(o)try{a=!!l.canPlayType(o)}catch(e){a=!1}else a=!0}n=a}if(n)return!0}}catch(e){}return!1}}}(jwplayer),function(f){var p=f.embed,h=f.utils,e=h.extend(function(e){var t=h.repo(),n=h.extend({},f.defaults),r=h.extend({},n,e.config),i=e.config,a=r.plugins,o=r.analytics,l=t+"jwpsrv.js",s=t+"sharing.js",u=t+"related.js",c=t+"gapro.js",n=f.key||n.key,d=new f.utils.key(n).edition(),a=a||{};switch("ads"==d&&r.advertising&&(r.advertising.client.match(".js$|.swf$")?a[r.advertising.client]=r.advertising:a[t+r.advertising.client+".js"]=r.advertising),delete i.advertising,i.key=n,r.analytics&&r.analytics.client&&r.analytics.client.match(".js$|.swf$")&&(l=r.analytics.client),delete i.analytics,"free"!=d&&o&&!1===o.enabled||(a[l]=o||{}),delete a.sharing,delete a.related,d){case"premium":case"ads":r.related&&(r.related.client&&r.related.client.match(".js$|.swf$")&&(u=r.related.client),a[u]=r.related),r.ga&&(r.ga.client&&r.ga.client.match(".js$|.swf$")&&(c=r.ga.client),a[c]=r.ga),i.sitecatalyst&&new f.embed.sitecatalyst(e);case"pro":r.sharing&&(r.sharing.client&&r.sharing.client.match(".js$|.swf$")&&(s=r.sharing.client),a[s]=r.sharing),r.skin&&(i.skin=r.skin.replace(/^(beelden|bekle|five|glow|modieus|roundster|stormtrooper|vapor)$/i,h.repo()+"skins/$1.xml"))}return i.plugins=a,new p(e)},p);f.embed=e}(jwplayer),function(e){var g=jwplayer.utils;e.sitecatalyst=function(e){function n(e){d.debug&&g.log(e)}function r(e){return(e=(e=(e=e.split("/"))[e.length-1]).split("?"))[0]}function t(){var e;p||(p=!0,e=c.getPosition(),n("stop: "+a+" : "+e),s.Media.stop(a,e))}function i(){h||(t(),h=!0,n("close: "+a),s.Media.close(a),u=!0,l=0)}var a,o,l,u,c=e,d=g.extend({},c.config.sitecatalyst),f={onPlay:function(){var e;u||(e=c.getPosition(),p=!1,n("play: "+a+" : "+e),s.Media.play(a,e))},onPause:t,onBuffer:t,onIdle:i,onPlaylistItem:function(e){try{var t;u=!0,i(),l=0,t=d.mediaName||(t=c.getPlaylistItem(e.index)).title||(t.file?r(t.file):t.sources&&t.sources.length?r(t.sources[0].file):""),a=t,o=d.playerName||c.id}catch(e){g.log(e)}},onTime:function(){if(u){var e=c.getDuration();if(-1==e)return;h=p=u=!1,n("open: "+a+" : "+e+" : "+o),s.Media.open(a,e,o),n("play: "+a+" : 0"),s.Media.play(a,0)}var t,e=c.getPosition();3<=Math.abs(e-l)&&(n("seek: "+(t=l)+" to "+e),n("stop: "+a+" : "+t),s.Media.stop(a,t),n("play: "+a+" : "+e),s.Media.play(a,e)),l=e},onComplete:i},p=!0,h=!0;g.foreach(f,function(e){c[e](f[e])})}}(jwplayer.embed),function(E){var i=[],m=E.utils,v=E.events,A=v.state,w=document,P=E.api=function(e){function t(t,n){return function(e){return n(t,e)}}function n(i,e){return s[i]||(s[i]=[],a(v.JWPLAYER_PLAYER_STATE,function(e){var t=e.newstate;if(e=e.oldstate,t==i){var n=s[t];if(n)for(var r=0;r<n.length;r++)"function"==typeof n[r]&&n[r].call(this,{oldstate:e,newstate:t})}})),s[i].push(e),o}function r(e,t){try{e.jwAddEventListener(t,'function(dat) { jwplayer("'+o.id+'").dispatchEvent("'+t+'", dat); }')}catch(e){m.log("Could not add internal listener")}}function a(e,t){return l[e]||(l[e]=[],u&&c&&r(u,e)),l[e].push(t),o}function i(){if(c){for(var e=arguments[0],t=[],n=1;n<arguments.length;n++)t.push(arguments[n]);if(void 0!==u&&"function"==typeof u[e])switch(t.length){case 4:return u[e](t[0],t[1],t[2],t[3]);case 3:return u[e](t[0],t[1],t[2]);case 2:return u[e](t[0],t[1]);case 1:return u[e](t[0]);default:return u[e]()}return null}d.push(arguments)}var o=this,l={},s={},u=void 0,c=!1,d=[],f=void 0,p={},h={};o.container=e,o.id=e.id,o.getBuffer=function(){return i("jwGetBuffer")},o.getContainer=function(){return o.container},o.addButton=function(e,t,n,r){try{h[r]=n,i("jwDockAddButton",e,t,"jwplayer('"+o.id+"').callback('"+r+"')",r)}catch(e){m.log("Could not add dock button"+e.message)}},o.removeButton=function(e){i("jwDockRemoveButton",e)},o.callback=function(e){h[e]&&h[e]()},o.forceState=function(e){return i("jwForceState",e),o},o.releaseState=function(){return i("jwReleaseState")},o.getDuration=function(){return i("jwGetDuration")},o.getFullscreen=function(){return i("jwGetFullscreen")},o.getHeight=function(){return i("jwGetHeight")},o.getLockState=function(){return i("jwGetLockState")},o.getMeta=function(){return o.getItemMeta()},o.getMute=function(){return i("jwGetMute")},o.getPlaylist=function(){var e=i("jwGetPlaylist");return"flash"==o.renderingMode&&m.deepReplaceKeyName(e,["__dot__","__spc__","__dsh__","__default__"],["."," ","-","default"]),e},o.getPlaylistItem=function(e){return m.exists(e)||(e=o.getPlaylistIndex()),o.getPlaylist()[e]},o.getPlaylistIndex=function(){return i("jwGetPlaylistIndex")},o.getPosition=function(){return i("jwGetPosition")},o.getRenderingMode=function(){return o.renderingMode},o.getState=function(){return i("jwGetState")},o.getVolume=function(){return i("jwGetVolume")},o.getWidth=function(){return i("jwGetWidth")},o.setFullscreen=function(e){return m.exists(e)?i("jwSetFullscreen",e):i("jwSetFullscreen",!i("jwGetFullscreen")),o},o.setMute=function(e){return m.exists(e)?i("jwSetMute",e):i("jwSetMute",!i("jwGetMute")),o},o.lock=function(){return o},o.unlock=function(){return o},o.load=function(e){return i("jwLoad",e),o},o.playlistItem=function(e){return i("jwPlaylistItem",parseInt(e)),o},o.playlistPrev=function(){return i("jwPlaylistPrev"),o},o.playlistNext=function(){return i("jwPlaylistNext"),o},o.resize=function(e,t){var n,r;return"flash"!==o.renderingMode?((n=document.getElementById(o.id)).className=n.className.replace(/\s+aspectMode/,""),n.style.display="block",i("jwResize",e,t)):(n=w.getElementById(o.id+"_wrapper"),(r=w.getElementById(o.id+"_aspect"))&&(r.style.display="none"),n&&(n.style.display="block",n.style.width=m.styleDimension(e),n.style.height=m.styleDimension(t))),o},o.play=function(e){return void 0===e?(e=o.getState())==A.PLAYING||e==A.BUFFERING?i("jwPause"):i("jwPlay"):i("jwPlay",e),o},o.pause=function(e){return void 0===e?(e=o.getState())==A.PLAYING||e==A.BUFFERING?i("jwPause"):i("jwPlay"):i("jwPause",e),o},o.stop=function(){return i("jwStop"),o},o.seek=function(e){return i("jwSeek",e),o},o.setVolume=function(e){return i("jwSetVolume",e),o},o.loadInstream=function(e,t){return f=new P.instream(this,u,e,t)},o.getQualityLevels=function(){return i("jwGetQualityLevels")},o.getCurrentQuality=function(){return i("jwGetCurrentQuality")},o.setCurrentQuality=function(e){i("jwSetCurrentQuality",e)},o.getCaptionsList=function(){return i("jwGetCaptionsList")},o.getCurrentCaptions=function(){return i("jwGetCurrentCaptions")},o.setCurrentCaptions=function(e){i("jwSetCurrentCaptions",e)},o.getControls=function(){return i("jwGetControls")},o.getSafeRegion=function(){return i("jwGetSafeRegion")},o.setControls=function(e){i("jwSetControls",e)},o.destroyPlayer=function(){i("jwPlayerDestroy")},o.playAd=function(e){i("jwPlayAd",e)};var g={onBufferChange:v.JWPLAYER_MEDIA_BUFFER,onBufferFull:v.JWPLAYER_MEDIA_BUFFER_FULL,onError:v.JWPLAYER_ERROR,onSetupError:v.JWPLAYER_SETUP_ERROR,onFullscreen:v.JWPLAYER_FULLSCREEN,onMeta:v.JWPLAYER_MEDIA_META,onMute:v.JWPLAYER_MEDIA_MUTE,onPlaylist:v.JWPLAYER_PLAYLIST_LOADED,onPlaylistItem:v.JWPLAYER_PLAYLIST_ITEM,onPlaylistComplete:v.JWPLAYER_PLAYLIST_COMPLETE,onReady:v.API_READY,onResize:v.JWPLAYER_RESIZE,onComplete:v.JWPLAYER_MEDIA_COMPLETE,onSeek:v.JWPLAYER_MEDIA_SEEK,onTime:v.JWPLAYER_MEDIA_TIME,onVolume:v.JWPLAYER_MEDIA_VOLUME,onBeforePlay:v.JWPLAYER_MEDIA_BEFOREPLAY,onBeforeComplete:v.JWPLAYER_MEDIA_BEFORECOMPLETE,onDisplayClick:v.JWPLAYER_DISPLAY_CLICK,onControls:v.JWPLAYER_CONTROLS,onQualityLevels:v.JWPLAYER_MEDIA_LEVELS,onQualityChange:v.JWPLAYER_MEDIA_LEVEL_CHANGED,onCaptionsList:v.JWPLAYER_CAPTIONS_LIST,onCaptionsChange:v.JWPLAYER_CAPTIONS_CHANGED,onAdError:v.JWPLAYER_AD_ERROR,onAdClick:v.JWPLAYER_AD_CLICK,onAdImpression:v.JWPLAYER_AD_IMPRESSION,onAdTime:v.JWPLAYER_AD_TIME,onAdComplete:v.JWPLAYER_AD_COMPLETE,onAdCompanions:v.JWPLAYER_AD_COMPANIONS};m.foreach(g,function(e){o[e]=t(g[e],a)});var y={onBuffer:A.BUFFERING,onPause:A.PAUSED,onPlay:A.PLAYING,onIdle:A.IDLE};return m.foreach(y,function(e){o[e]=t(y[e],n)}),o.remove=function(){if(!c)throw"Cannot call remove() before player is ready";d=[],P.destroyPlayer(this.id)},o.setup=function(e){if(E.embed){var t=w.getElementById(o.id);return t&&(e.fallbackDiv=t),t=o,d=[],P.destroyPlayer(t.id),(t=E(o.id)).config=e,new E.embed(t)}return o},o.registerPlugin=function(e,t,n,r){E.plugins.registerPlugin(e,t,n,r)},o.setPlayer=function(e,t){u=e,o.renderingMode=t},o.detachMedia=function(){if("html5"==o.renderingMode)return i("jwDetachMedia")},o.attachMedia=function(e){if("html5"==o.renderingMode)return i("jwAttachMedia",e)},o.dispatchEvent=function(e,t){if(l[e])for(var n=m.translateEventResponse(e,t),r=0;r<l[e].length;r++)if("function"==typeof l[e][r])try{e==v.JWPLAYER_PLAYLIST_LOADED&&m.deepReplaceKeyName(n.playlist,["__dot__","__spc__","__dsh__","__default__"],["."," ","-","default"]),l[e][r].call(this,n)}catch(e){m.log("There was an error calling back an event handler")}},o.dispatchInstreamEvent=function(e){f&&f.dispatchEvent(e,arguments)},o.callInternal=i,o.playerReady=function(e){for(c=!0,u||o.setPlayer(w.getElementById(e.id)),o.container=w.getElementById(o.id),m.foreach(l,function(e){r(u,e)}),a(v.JWPLAYER_PLAYLIST_ITEM,function(){p={}}),a(v.JWPLAYER_MEDIA_META,function(e){m.extend(p,e.metadata)}),o.dispatchEvent(v.API_READY);0<d.length;)i.apply(this,d.shift())},o.getItemMeta=function(){return p},o.isBeforePlay=function(){return u.jwIsBeforePlay()},o.isBeforeComplete=function(){return u.jwIsBeforeComplete()},o};P.selectPlayer=function(e){var t;return m.exists(e)||(e=0),e.nodeType?t=e:"string"==typeof e&&(t=w.getElementById(e)),t?(e=P.playerById(t.id))?e:P.addPlayer(new P(t)):"number"==typeof e?i[e]:null},P.playerById=function(e){for(var t=0;t<i.length;t++)if(i[t].id==e)return i[t];return null},P.addPlayer=function(e){for(var t=0;t<i.length;t++)if(i[t]==e)return e;return i.push(e),e},P.destroyPlayer=function(e){for(var t,n=-1,r=0;r<i.length;r++)i[r].id==e&&(t=i[n=r]);return 0<=n&&(e=t.id,r=w.getElementById(e+("flash"==t.renderingMode?"_wrapper":"")),m.clearCss&&m.clearCss("#"+e),r&&("html5"==t.renderingMode&&t.destroyPlayer(),(t=w.createElement("div")).id=e,r.parentNode.replaceChild(t,r)),i.splice(n,1)),null},E.playerReady=function(e){var t=E.api.playerById(e.id);(t||E.api.selectPlayer(e.id)).playerReady(e)}}(jwplayer),function(e){var c=e.events,d=e.utils,f=c.state;e.api.instream=function(e,t,n,r){function i(e,t){return s[e]||(s[e]=[],l.jwInstreamAddEventListener(e,'function(dat) { jwplayer("'+o.id+'").dispatchInstreamEvent("'+e+'", dat); }')),s[e].push(t),this}function a(a,e){return u[a]||(u[a]=[],i(c.JWPLAYER_PLAYER_STATE,function(e){var t=e.newstate,n=e.oldstate;if(t==a){var r=u[t];if(r)for(var i=0;i<r.length;i++)"function"==typeof r[i]&&r[i].call(this,{oldstate:n,newstate:t,type:e.type})}})),u[a].push(e),this}var o=e,l=t,s={},u={};this.dispatchEvent=function(e,t){if(s[e])for(var n=d.translateEventResponse(e,t[1]),r=0;r<s[e].length;r++)"function"==typeof s[e][r]&&s[e][r].call(this,n)},this.onError=function(e){return i(c.JWPLAYER_ERROR,e)},this.onFullscreen=function(e){return i(c.JWPLAYER_FULLSCREEN,e)},this.onMeta=function(e){return i(c.JWPLAYER_MEDIA_META,e)},this.onMute=function(e){return i(c.JWPLAYER_MEDIA_MUTE,e)},this.onComplete=function(e){return i(c.JWPLAYER_MEDIA_COMPLETE,e)},this.onTime=function(e){return i(c.JWPLAYER_MEDIA_TIME,e)},this.onBuffer=function(e){return a(f.BUFFERING,e)},this.onPause=function(e){return a(f.PAUSED,e)},this.onPlay=function(e){return a(f.PLAYING,e)},this.onIdle=function(e){return a(f.IDLE,e)},this.onClick=function(e){return i(c.JWPLAYER_INSTREAM_CLICK,e)},this.onInstreamDestroyed=function(e){return i(c.JWPLAYER_INSTREAM_DESTROYED,e)},this.play=function(e){l.jwInstreamPlay(e)},this.pause=function(e){l.jwInstreamPause(e)},this.destroy=function(){l.jwInstreamDestroy()},this.setText=function(e){l.jwInstreamSetText(e||"")},o.callInternal("jwLoadInstream",n,r||{})}}(jwplayer),function(r){var e=r.api,t=e.selectPlayer;e.selectPlayer=function(e){return(e=t(e))?e:{registerPlugin:function(e,t,n){r.plugins.registerPlugin(e,t,n)}}}}(jwplayer));

// Provide the startsWith and endsWitch method for broswers without this method .
if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (prefix){
	  return this.slice(0, prefix.length) === prefix;
	};
  }
$(function(){
	// analytics event for footer
	$('.conv3_footer .listcon .menu_foot_products').on('click', function () {
		var wrap = $(this).attr('wrap');
		if(!wrap) {
			return;
		}
		var act = 'open';
		var cat = 'footer:menu:explore';
		var lab = 'phones:all phones';
		if(wrap.startsWith("menu_module_")) {
			wrap = wrap.replace('menu_module_', '');
			lab = 'more products:' + wrap;
		}
		analyticsSubmit(cat, act, lab, EVENT_TYPE_OPEN_MENU_SECOND_LEVEL)
	});
})

window.viewType = function () {
	var iWinWidth = window.innerWidth || $(window).width();
	return iWinWidth >= 1024 ? 'pc' : (iWinWidth < 768 ? 'mobile' : 'tablet');
}

$.fn.initJwplayer = function( settings ) {
	var thisDom = $(this),
		defs = {
			'path': '../',
			'target': 'self',
			'autostart': false
		};
	var timer_video = null, thisLabel = thisDom.data('t-lab'), isAndroid = $.isAndroid();
	window.conv3VidoeControl = window.conv3VidoeControl || {};
	$.extend(defs, settings);
	return this.each(function (e) {
		var eventAction = 0;
		var isPlaying = false;
		var handleVideo = function( videoDom, behavior ) {
			switch (behavior) {
				case 'show':
					videoDom.find('video').show();
					videoDom.find('.jwpreview').css({'opacity': 0, 'visibility': 'hidden'});
					videoDom.find('.jwcontrolbar').show();
					break;
				case 'hide':
					videoDom.find('video').hide();
					videoDom.find('.jwpreview').css({'opacity': 1, 'visibility': 'visible'});
					videoDom.find('.jwcontrolbar').hide();
					break;
			}
		};
        var viewtimes = $(this).data('t-viewtimes');
        var played =false;
		var video = {
			id: $(this).data('video-id'),
			image: $(this).data('video-image'),
			link: $(this).data('video-link'),//@desc video link
			aspectratio: $(this).data('video-ratio'),
			file: $(this).attr('href'),
			width: '100%',
			label: $(this).data('t-label'),
			autostart: defs.autostart,
			flashplayer: "/etc/designs/huawei-cbg-site/statics/hw_jwflash.swf",
            tracks:[{		//字幕文件配置
				file:$(this).data('video-track'),
				label:"on",
				kind:"captions",
				"default":true
			}],
			captions:{back:false,color: $(this).data('caption-color') || 'ffffff',fontsize:15},
			events: {//@desc add events for video
				"onReady": function () {},
				"onPlay": function (e) {
					$(".jwdisplay").removeClass("x-mask");
					$(".jwpreview").removeClass("x-opacity");
					$('.jwplayer .x-over').hide();
					clearTimeout(timer_video);
					if ( !thisDom.data('video-start') ) {
						$.trackVideo('Video Milestone', 'start', video.label + "," + queryVariable('<URL>'));
						thisDom.data('video-start', true);
					} else {
						$.trackVideo('Video Play/Pause/Exit', 'play',  video.label + "," + queryVariable('<URL>'));
					}
					isPlaying = true;
					clearTimeout(timer_player);
					isAndroid && handleVideo(thisVideoDom, 'show');
				},
				"onPause": function () {
					isAndroid && handleVideo(thisVideoDom, 'hide');
				},
				"onComplete": function () {
					$(".jwdisplay").addClass("x-mask");
					$(".jwpreview").addClass("x-opacity");
					$('.jwplayer .x-over').show();
					isPlaying = false;
					clearTimeout(timer_player);
					isAndroid && handleVideo(thisVideoDom, 'hide');
				}
			}
		};
		var thisVideoDom = null, timer_player = null;
		var pauseVideo = function() {
			jwplayer(video.id).pause(true);
			isPlaying = false;
			clearTimeout(timer_player);
			timer_player = setTimeout(function() {
				video.events.onPause();
			}, 100);
		};
		conv3VidoeControl.pause = conv3VidoeControl.pause || [];
		conv3VidoeControl.pause.push(pauseVideo);
		if ( isAndroid ) {
			$(window).on('scroll', function() {
				if ( isPlaying ) pauseVideo();
			});
		}

		if ($('html').hasClass('ie9') ||$('html').hasClass('ie8') || $('html').hasClass('ie7')) {
			video.primary = 'flash';
        }else{
            video.primary = 'html5';
        }
		var width = 1600, height = 900;
		if (typeof (video.aspectratio) == 'string' && /^[0-9]{1,2}:[0-9]{1,2}$/.test(video.aspectratio)) {
			var ratio = video.aspectratio.split(':');
			height = width * parseInt(ratio[1]) / parseInt(ratio[0]);
		}
		if ( defs.target == 'self' ) {
			$(this).html('<div id="' + video.id + '"></div>');
			try {
				jwplayer(video.id).setup(video);
                if (viewtimes) {
                    jwplayer(video.id).onPlay(function (event) {
                        if(played) return;
                        var video_page =window.digitalData.page.pageInfo.uri.split("/").reverse()[1].split(".")[0];
                        addStatistics(video_page);
                        played=true;
                    });
                }
				jwplayer(video.id).onReady(function (event) {
					thisVideoDom = $('#' + video.id);
				});
			}
			catch (e) { }
		} else if ( defs.target == 'fancybox' ) {
			var oFFScorll = function(ev) {
				ev.stopPropagation();
				ev.preventDefault();
				return false;
			};
			$('head').append('<link href="/etc/designs/huawei-cbg-site/statics/jquery.fancybox-v2.1.5.css" rel="stylesheet" type="text/css" />');
			$.getScript("/etc/designs/huawei-cbg-site/statics/lib-bundle.js", function() {
				$.fancybox('<div id="' + video.id + '" class="cbg-jwplayer"></div><div class="cbg-video-mask"></div>', {
					width: width, height: height, padding: 0, margin: 20, autoSize: false, aspectRatio: true, scrolling: 'no',
					beforeShow: function () {
						try {
							// when display youtube and youku
							if(thisDom.data('iframe-url')) {
				            	var iframe = '<iframe height="100%" width="100%" src="' + thisDom.data('iframe-url') + '?autoplay=1" frameborder=0 allowfullscreen></iframe>';
			            		$('.fancybox-wrap #videoPlayer').remove();
				            	$('.fancybox-wrap .fancybox-inner').prepend(iframe);

				            } else {
				            	jwplayer(video.id).setup(video);
								jwplayer(video.id).onFullscreen(function (event) {
									event.fullscreen ? $('.fancybox-close').hide() : $('.fancybox-close').show();
									!event.fullscreen && $('.jwcontrolbar').css({'opacity': 0, 'display': 'inline-block'});
								});
								jwplayer(video.id).onReady(function (event) {
									$('.cbg-video-mask').fadeOut();
									thisVideoDom = $('#' + video.id);
								});
								$('.fancybox-overlay').on('touchmove', oFFScorll);
								$('#cbg-banner').flexslider('pause');
				            }
						}
                        catch (e) { }
                        // 解决真机可滑动BUG，暂时方案（没调整插件前提）- lvsihao - 20190202
                        if(window.innerWidth < 1024){
                            var winHeight = $(window).height(),
                            videoHeight = $('.fancybox-inner').height(),
                            _top = parseFloat((winHeight - videoHeight) /2);
                            $('.fancybox-wrap').css('top',_top);
                            _scrollTop=$(document).scrollTop();
                            $("html,body").css({
                                "height":$(window).height(),
                                "overflow":"hidden",
                            }).scrollTop(_scrollTop);
                            return _scrollTop;
                        }
                        // =================== END ===================
					},
					afterClose: function () {
                        $("[data-video-id]").removeClass("active");
                        // 解决真机可滑动BUG，暂时方案（没调整插件前提）- lvsihao - 20190202
                        // 恢复页面可滑动
                        if (window.innerWidth < 1024) {
                            $('html,body').removeAttr('style').scrollTop(_scrollTop);
                         }
                        // =================== END ===================
					},
					beforeClose: function() {
						var videoName = thisDom.data('video-name') || '<video name>';
						var lab = "<product name> - " + videoName + " - <page title>";
						if(thisDom.data('iframe-url')) {
							// when display youtube and youku
						} else {
                            jwplayer(0).stop();
                            jwplayer(video.id).stop();
                            var playedPercentage = Math.floor(jwplayer(video.id).getPosition()*100/jwplayer(video.id).getDuration());
						}
						 window.dataLayer.push({
                            "event": "video",
                            "videoStep":"close",
                            "videoName":videoName,
                            "productMktName":pageProductInfo&&pageProductInfo.marketingName ||'',
                            "productCategory":pageProductInfo&&pageProductInfo.category||'',
                            "clickName" : "video "+videoName+"_close",
                            "clickType" : "action"
                         })
					}
				});

			});
		}
	});
};

var videotrack = new Array();
$.fn.initH5player = function( settings ) {
	var thisDom = $(this),defs = {'path': '../','target': 'self','autostart': false};
	$.extend(defs, settings);
	return this.each(function (e) {
		var video = {
			id: $(this).data('video-id'),
			image: $(this).data('video-image'),
			aspectratio: $(this).data('video-ratio'),
			file: $(this).attr('href'),
			tracks:$(this).data('video-track')
		}

		//GA数据统计记录单个播放视频(只统计一次)0： 统计GA数据，1：不统计
        var timesForGA = {};
        timesForGA.endedEventTime = 0;
        timesForGA.playPercentTime_25 = 0;
        timesForGA.playPercentTime_50 = 0;
        timesForGA.playPercentTime_75 = 0;
        var pageProductInfo =  window.digitalData.product ? window.digitalData.product.productInfo:'';
        var productMktName = pageProductInfo&&pageProductInfo.marketingName ||'';
        var productCategory = pageProductInfo&&pageProductInfo.category||'';

		if(addVideoList(video.file)){
			videotrack.push(video);
		}
		var thisvideo = [];
		for(var i = 0; i < videotrack.length; i++){
			if(videotrack[i].file == video.file){
				thisvideo = videotrack[i];
				break;
			}
		}
		var videoName = thisDom.data('video-name');
		var productName = digitalData.product?digitalData.product.productInfo.marketingName:'';
		video.label = productName === '' ? videoName + " - " + digitalData.page.pageInfo.pageName:
		       productName + " - " + videoName + " - " + digitalData.page.pageInfo.pageName;
		if($(this).data('t-label')){
			video.label = $(this).data('t-label');
		}
        var marginArray = [0,0,0,0]; // 视频上右下左边距 数组
        var width = settings.width === '0' ?  1280 : Number(settings.width) || 1280;  // 视频最大宽度1280
        var height = settings.height === '0' ?  720 : Number(settings.height) || 720;
        var widthHeightRatio = width / height || 1;
        var reallyWidth = window.innerWidth > width ? width : window.innerWidth; // 视频宽度限制在窗口宽度内，窗口宽度-视频左右间距
        var reallyHeight = reallyWidth / widthHeightRatio;
        reallyHeight = reallyHeight > window.innerHeight ? window.innerHeight: reallyHeight ;  // 视频最大高度，窗口高度-80(与fancybox保持一致)
        if (typeof (video.aspectratio) == 'string' && /^[0-9]{1,2}:[0-9]{1,2}$/.test(video.aspectratio)) {
			var ratio = video.aspectratio.split(':');
			height = width * parseInt(ratio[1]) / parseInt(ratio[0]);
        }
        /* 判断字幕文件是否存在 */
        if(video.tracks ) {
            var v = "<video controls autoplay playsinline='true' webkit-playsinline='true' controlsList='nodownload' poster='"+ video.image +"' id='"+ video.id+"' style='width:100%;max-height:100%;' src='"+ video.file +"'><track src='"+ video.tracks +"' kind='subtitles' default />Your browser does not support mp4 video.</video>";
        } else {
            var v = "<video controls autoplay playsinline='true' webkit-playsinline='true' controlsList='nodownload' poster='"+ video.image +"' id='"+ video.id+"' style='width:100%;max-height:100%;' src='"+ video.file +"'></video>";
        }
		if ( defs.target == 'self' ) {
			$(this).html('<div class="self-video">'+ v +'</div>');
            var maxCount =  1000;
            var loadTimer = setInterval(function(){
                var $video = $("#" + video.id) ;
                var videoDom = $video[0];
                if($video.length > 0 && videoDom.readyState == "4"){
                    videoDom.play();
                    //GA & AT 埋码
                    handleGAInVideoEventListener(videoDom,video.label,timesForGA, productMktName, productCategory);
                    clearInterval(loadTimer);
                }
                if(maxCount-- < 1){
                    clearInterval(loadTimer);
                }
            }, 100)
		} else if ( defs.target == 'fancybox' ) {
			$('head').append('<link href="/etc/designs/huawei-cbg-site/clientlib-campaign-v4/public-v4/css/publicfunction.css" rel="stylesheet" type="text/css" />');
            $.getScript("/etc/designs/huawei-cbg-site/statics/lib-bundle.js", function() {
				//news-list 视频详情页视频播放, series list 推荐弹窗视频播放
                $.fancybox(`<div class="cbg-jwplayer" style="display: flex;height:${reallyHeight}px;width:${reallyWidth}px;align-items: center;background:#000;position: fixed;left: 50%;top:50%;transform: translate(-50%,-50%);">${v}</div><div class="cbg-video-mask"></div>`, {
                    width: reallyWidth,
					height: reallyHeight,
                    minWidth: reallyWidth,
                    minHeight: reallyHeight,
                    padding: 0,
                    margin: marginArray,
					autoSize: false,
                    aspectRatio: true,
                    scrolling: 'no',
					beforeShow: function() {
						var maxCount =  1000;
						var loadTimer = setInterval(function(){
							var $video = $("#" + video.id) ;
							var videoDom = $video[0];
							if($video.length > 0 && videoDom.readyState == "4"){
                                videoDom.play();
								//GA & AT 埋码
                                handleGAInVideoEventListener(videoDom,video.label,timesForGA, productMktName, productCategory);
								clearInterval(loadTimer);
							}
							if(maxCount-- < 1){
								clearInterval(loadTimer);
							}
						}, 100);
					},
					afterClose: function() {
					},
					beforeClose: function() {
						var $video = $("#" + video.id) ;
						var videoDom = $video[0];
                        videoDom.currentTime = 0;
						closeAllVideo(video.id);

						//视频关闭时 GA & AT 埋码
						pushVideoDatalayer(video.label, "close", productMktName, productCategory);
					}
				});
			});
		}
	});
};

/**
 * 视频播放事件与GA&AT处理
 * @param $video 视频本体
 * @param videoName 视频名称
 * @param timesForGA [] 各事件GA统计次数 （timesForGA.endedEventTime,timesForGA.playPercentTime_25,timesForGA.playPercentTime_50,
 *      timesForGA.playPercentTime_75）
 *     GA数据统计记录单个播放视频(只统计一次)0： 统计GA数据，1：不统计
 * @param productMktName
 * @param productCategory
 * @returns
 */
function handleGAInVideoEventListener($video, videoName, timesForGA, productMktName, productCategory) {
    if (timesForGA == null) {
        return false;
    }
    //视频开始播放GA数据
    pushVideoDatalayer(videoName, "play", productMktName, productCategory);

    //添加播放完毕的监听
    $video.onended = function(event){
          if(timesForGA.endedEventTime == 0){
            timesForGA.endedEventTime = 1;
            pushVideoDatalayer(videoName, "100%", productMktName, productCategory);
         }
    }

    //添加播放暂停的监听
    $video.onpause = function(event){
         if($video.currentTime == 0 || $video.currentTime == $video.duration){
           return false;
         }
         pushVideoDatalayer(videoName, "pause", productMktName, productCategory);
    }

   //添加播放过程中的监听
   	$video.ontimeupdate = function(){
       videoStepHandleGaEvent($video, videoName, timesForGA, productMktName, productCategory);
   }

}

/**
 * 视频播放过程中的事件与GA处理
 * @param $video 视频本体
 * @param videoName 视频名称
 * @param timesForGA [] 各事件GA统计次数 （timesForGA.endedEventTime,timesForGA.playPercentTime_25,timesForGA.playPercentTime_50,
 *      timesForGA.playPercentTime_75）
 *     GA数据统计记录单个播放视频(只统计一次)0： 统计GA数据，1：不统计
 * @param productMktName
 * @param productCategory
 * @returns
 */
function videoStepHandleGaEvent($video, videoName, timesForGA, productMktName, productCategory) {
    var playPercentNum =  Math.floor($video.currentTime*100/$video.duration);
    if(playPercentNum >= 25 && playPercentNum < 50 && timesForGA.playPercentTime_25 == 0) {
      pushVideoDatalayer(videoName, "25%", productMktName, productCategory);
      timesForGA.playPercentTime_25 = 1;
    } else if (playPercentNum >= 50 && playPercentNum < 75 && timesForGA.playPercentTime_50 == 0){
      pushVideoDatalayer(videoName, "50%", productMktName, productCategory);
      timesForGA.playPercentTime_50 = 1;
    } else if (playPercentNum >= 75 && playPercentNum < 100 && timesForGA.playPercentTime_75 == 0){
      pushVideoDatalayer(videoName, "75%", productMktName, productCategory);
      timesForGA.playPercentTime_75 = 1;
    }
}

function addVideoList(file){
	var l = videotrack.length;
	for(var i = 0; i < l ; i++){
		if(videotrack[i].file == file){
			return false;
		}
	}
	return true;
}


function closeAllVideo(vid){
	document.getElementById(vid).pause();
}

(function ($) {
	$.fn.addSelector = function (settings) {
		var thisSelector = $(this);
		var defs = { 'tabView': undefined, 'tabClass': 'current', 'tabChangeTitle': true };
		var isTabView = function () { return defs.tabView == 'both' || (defs.tabView && defs.tabView.indexOf(viewType()) > -1);};
		$.extend(defs, settings);
		thisSelector.find('.select').on('click', function (ev) {
			if (isTabView()) return;
			var thisSelect = $(this),
				thisOl = thisSelect.find('ol'),
				siblingsSelect = thisSelect.siblings('.select');
			var thisSelectli = thisOl.find('li');
			defs.gaFn && defs.gaFn(thisSelect);
			if ((thisSelect.parents('.add-contact-info').length > 0 || thisSelect.parents('.user-perfect-dialog').length > 0) && thisSelectli.length == 0) return;
            thisSelectli.length === 0 && thisOl.addClass('no-data');
			if ( thisSelect.hasClass('disable') ) return;
			if (thisOl.data('slide') == 'open') {
				thisOl.slideUp(250, function () {thisOl.data('slide', 'close');});
				setTimeout(function(){thisSelect.find('span').removeClass('active');},250)
			} else {
				thisOl.slideDown(250, function () {thisOl.data('slide', 'open');});
				thisSelect.find('span').addClass('active');
			}
			siblingsSelect.find('ol').slideUp(250, function () {$(this).data('slide', 'close');});
			siblingsSelect.find('span').removeClass('active');
			if(thisSelect.parents('.add-contact-info').length > 0 || thisSelect.parents('.user-perfect-dialog').length > 0){
	                var prarentSiblingsSelect = thisSelect.parents('.s-selector').siblings('.s-selector');
	                prarentSiblingsSelect.find('ol').slideUp(250, function () {$(this).data('slide', 'close');});
					prarentSiblingsSelect.find('span').removeClass('active');
			}
			ev.stopPropagation();
		});
		thisSelector.find('.select ol li').off('click.compareItem').on('click.compareItem', function (ev, autoTrigger) {
			var thisLi = $(this),
				thisSpan = thisLi.parents('.select').eq(0).find('span'),
				sText = thisLi.text(),
				spText = thisSpan.text();
			if (isTabView()) {
				thisLi.addClass(defs.tabClass).siblings('li').removeClass(defs.tabClass);
			} else {
				thisLi.addClass(defs.tabClass).siblings('li').removeClass(defs.tabClass);
                thisLi.parents('.select').eq(0).find('ol').slideUp(250, function () { $(this).data('slide', 'close'); });
			}
			defs.tabChangeTitle && thisSpan.text(sText);
			thisSelector.trigger('selected', { 'val': sText, '_mark': thisLi.parents('ol').eq(0).attr('_mark') });
			if (!autoTrigger) {
				defs.itemGaFn && defs.itemGaFn(thisLi);
			}
			setTimeout(function(){
				$(".conv3_search_wrap .result_news_pc .list li strong").each(function(){
					var title = $(this).find("a");
					if (title.height() > 45 ) {
						$(this).addClass("ellipsis");
					}
				});
				$(".conv3_search_wrap .result_news_pc .list li p").each(function(){
					var descript = $(this).find("span.content");
					if (descript.height() > 65 ) {
						$(this).addClass("ellipsis");
					}
				});
			},500);
			ev.stopPropagation();
			setTimeout(function(){thisSpan.removeClass('active');},250)
		});
		$('body').on('click', function () {
			if (isTabView()) return;
			var aSelect = thisSelector.find('.select');
			aSelect.find('ol').slideUp(250, function () {
				$(this).data('slide', 'close');
			});
            setTimeout(function(){aSelect.find('span').removeClass('active');},250)
		});
		if (isTabView()) {
			$(window).on('resize', function () {
				let flag = isTabView()
				if (flag) {
					thisSelector.find('.select ol').show();
				} else {
					thisSelector.find('.select ol').hide();
				}
			});
		}
		return thisSelector;
	};

})(jQuery);


/*
 * select input button render
 **/
function RenderSelectInput(jqSelector, placeHolder, inputCallback) {
	var selectHeight = parseInt($(jqSelector).css("height").replace("px", ""));
	var selectWidth = parseInt($(jqSelector).css("width").replace("px", ""));
	var spanJq = $(jqSelector).children("span").first();
	spanJq.after("<input type='text' class='select-input' " + "placeholder='" + placeHolder + "' />");
	var inputJq = $(jqSelector).children("input").first();
	var olJq = $(jqSelector).children("ol").first();
	spanJq.css("font-size", "0");
	inputJq.css(
		{
			"height": selectHeight + "px",
			"position": "relative",
			"display": "block",
			"left": "0",
			"top": "-" + selectHeight + "px",
			"border-width": "0",
			"width": $(spanJq).css("width"),
			"outline": "none",
			"background-color": "transparent",
			"margin-right": "auto",
			"margin-left": "auto"
		});

	inputJq.keyup(function () {
		if (inputCallback != "undefined") {
			inputCallback(inputJq,function(){
				olJq.children("li").each(function () {
					if ($(this).text().toUpperCase().indexOf($(inputJq).val().toUpperCase()) >= 0) {
						$(this).html(
							$(this).text().replace($(inputJq).val().toUpperCase(), "<strong style='color:red;' >" + $(inputJq).val().toUpperCase() + "</strong>")
						);
						$(this).show();
					}
					else {
						$(this).hide();
					}
				});

				if (!$(spanJq).hasClass("active")) $(spanJq).addClass("active");
				setTimeout(function () { $(olJq).css("display", "block") }, 500);

			});
		}


	});

	inputJq.focus(function (event) {
		if (inputJq.val()=="") {
			return;
		}
		if (!$(spanJq).hasClass("active")) $(spanJq).addClass("active");
		setTimeout(function () { $(olJq).css("display", "block") }, 500);
	});
	$(window).resize(function () {inputJq.css({ "width": $(spanJq).css("width") });});
	$(jqSelector + " ol").first().find("li").on("click", function () {
		$(inputJq).val($(this).text());
		$(jqSelector + " ol").first().hide();
	});
	window.SelectProduct = function (productName) {
		setTimeout(function(){
			$(".conv3_certification_wrap .conv3_global_selector .select input").first().val(productName);
			$(".conv3_global_selector .select ol").hide();
		},200);

	}

}

/**  android;ios or other  */
$.isAndroid = function() {
    return navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;
};
$.isIos = function() {
    return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios&#32456;&#31471;
};
$.isMobile = function(){
	 var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod","Phone","Tablet");
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) { return true; };
    };
    return false;
}
$.isPc = function(){
	return !$.isMobile();
}
$.equip = function() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) { return Agents[v]; };
    };
    return "pc";
};


function HeightKey(txt, key, tag) {
    var str = txt
    var _keys = key
    var k_index = (str && _keys) ? str.toLowerCase().indexOf(_keys.toLowerCase()) : -1;
    if (k_index > -1) {
        if (k_index == 0) {
            var str1 = "<" + tag + ">" + str.substring(0, _keys.length) + "</" + tag + ">"
            var str2 = str.substring(_keys.length, str.length)
            var str3 = ''
        } else {
            var str1 = str.substring(0, k_index)
            var str2 = "<" + tag + ">" + str.substring(k_index, _keys.length + k_index) + "</" + tag + ">"
            var str3 = str.substring(_keys.length + k_index, txt.length)
        }
        str = str1 + str2 + str3;
    }
    return str
}

function getURLParam(name) {
	var m = decodeURIComponent(window.location.href).match(new RegExp("[?&]" + name + "=([^=&]*)(&|$)"));
	return m ? m[1]: null;
}

var monthtxt =  $(".month_txt").val()
if(monthtxt == "" || monthtxt == "month txt")	monthtxt = "January,February,March,April,May,June,July,August,September,October,November,December"
var montharray = monthtxt.split(",")

function formatMonth(month) {
	var m = parseInt(month)
	return montharray[m-1]
}
function formatTime(str,site) {
	if (str && str != '') {
		var ta = str.split('-')
		var m = formatMonth(ta[1])
		return m + " " + ta[2] + ", " + ta[0]
	} else {
		return ''
	}
}

function deleteHttp(str){
    if(str != null && typeof str=="string"){
        if(str.indexOf('http:') == 0){
            return  str.substring(5,str.length);
        }else if(str.indexOf('https:') == 0){
            return  str.substring(6,str.length);
        }else{
			return  str;
        }
	}else{
	  	return str
	}
}
function formatString(field) {
    if (field) {
        return field;
    }
    return "";
}
function getVideoActionStatus(playedPercentage) {
	if(playedPercentage < 25) {
		return 'Video Start';
	}
	if(playedPercentage < 50) {
		return 'Video 25%';
	}
	if(playedPercentage < 75) {
		return 'Video 50%';
	}
	if(playedPercentage < 99) {
		return 'Video 75%';
	}
	return 'Video Complete';
}
function setCookie(name,value){
	var Days = 7;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days*24*60*60*1000);
	document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + ";path=/";
}

function getCookie(name){
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
		return unescape(arr[2]);
	else
		return null;
}

function delCookie(name){
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval=getCookie(name);
	if(cval!=null)	document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}

function getExplorerInfo() {
	var explorer = window.navigator.userAgent.toLowerCase() ;
	if (explorer.indexOf("msie") >= 0) {
		var ver=explorer.match(/msie ([\d.]+)/)[1];
		return {type:"IE",version:ver};
	}else if (explorer.indexOf("Edge") >= 0) {
		var ver=explorer.match(/Edge\/([\d.]+)/)[1];
		return {type:"Edge",version:ver};
	}else if (explorer.indexOf("firefox") >= 0) {
		var ver=explorer.match(/firefox\/([\d.]+)/)[1];
		return {type:"Firefox",version:ver};
	}else if(explorer.indexOf("chrome") >= 0){
		var ver=explorer.match(/chrome\/([\d.]+)/)[1];
		return {type:"Chrome",version:ver};
	}else if(explorer.indexOf("opera") >= 0){
		var ver=explorer.match(/opera.([\d.]+)/)[1];
		return {type:"Opera",version:ver};
	}else if(explorer.indexOf("safari") >= 0){
		return {type:"Safari",version:0};
	}else{
		return {type:0,version:0};
	}
}



function snsShare(type,url){
	var u = url || document.location.href;
    var t = encodeURIComponent(document.title);
	var shareUrl = ''
	switch (type) {
		case "facebook":
			shareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + u;
			break;
		case "googleplus":
			shareUrl = "https://plus.google.com/u/0/share?text=" + t + encodeURIComponent(' ') + u;
			break;
		case "twitter":
			shareUrl =  "https://twitter.com/intent/tweet?text=" + t + encodeURIComponent(' ') + u;
			break;
        case "sinablog":
			shareUrl =  "http://v.t.sina.com.cn/share/share.php?url=" + u + "&title=" + t + "&appkey=330242870";
			break;
        case "qqblog":
			shareUrl =  'http://shuqian.qq.com/post?from=3&title='+ t + '&uri='+ encodeURIComponent(document.location.href)+ '&jumpback=2&noui=1';
			break;
		default:
			shareUrl =  '';
	}
	window.open(shareUrl,type,"toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=800,height=500,location=1")
}

var basesupport="/support/services/";
function setInitMap(b, c) {
    var a = b.address == undefined ? "beijing" : b.address;
    b.geocoder.geocode({
        address: b.address
    }, function(g, e) {
        if (e == google.maps.GeocoderStatus.OK) {
            var d = {
                zoom: 10,
                center: g[0].geometry.location,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var f = new google.maps.Map(document.getElementById(b.id),d);
            c && c(f)
        }
    })
}
function loadMapScript(b) {
    b = b || "en";
    var a = document.createElement("script");
    a.type = "text/javascript";
    a.setAttribute("async", "");
    a.setAttribute("defer", "");
    a.src = "//maps.google.com/maps/api/js?key=AIzaSyB5ykZNED0-oT4i1RZRqS9oetClB7wCwfE&language=" + b.toLowerCase() + "&callback=initMap";
    document.body.appendChild(a)
}
/*for v27 suport home page*/
var MenuPageHistory = function ($) {
    function MenuPageHistory(option) {
		this.option = option;
        this.pages = [];
        this.closeCallBack;
        this.prePushCallBack;
    }
    MenuPageHistory.prototype.PushPage = function (jqPageSelector, callBack) {
        var that = this;
        that.prePushCallBack && that.prePushCallBack();
        setTimeout(function () {
            if (that.pages.length > 0) {
                let preJqPageSelector = that.pages[that.pages.length - 1];
                that.pages.push(jqPageSelector);
                $(preJqPageSelector).slideUp(that.option.slideSpeed, function () {
                    $(jqPageSelector).slideDown(that.option.slideSpeed, function () {
                        callBack && callBack();
                    });
                });
            }
            else {
                that.pages.push(jqPageSelector);
                $(jqPageSelector).slideDown(that.option.slideSpeed, function () {
                    callBack && callBack();
                });
            }
        }, 200);
    }

    MenuPageHistory.prototype.PopPage = function (callBack) {
        var that = this;
        if (this.pages.length > 1) {
			let preJqPageSelector = this.pages[this.pages.length - 2];
            let currJqPageSelector = this.pages[this.pages.length - 1];
            $(currJqPageSelector).slideUp(this.option.slideSpeed, function () {
                $(preJqPageSelector).slideDown(that.option.slideSpeed, function () {
                    that.pages.splice(that.pages.length - 1, 1);
                    callBack && callBack();

                });
            });
        }
        else if (this.pages.length === 1) {
            let currJqPageSelector = this.pages[this.pages.length - 1];
            $(currJqPageSelector).slideUp(this.option.slideSpeed, function () {
                that.pages.splice(that.pages.length - 1, 1);
                callBack && callBack();
                if (that.pages.length == 0) that.closeCallBack && that.closeCallBack();
            });
        }
    }

    MenuPageHistory.prototype.ClosePage = function (callBack) {
        var that = this;
        try {
            let currJqPageSelector = this.pages[this.pages.length - 1];
            if (!currJqPageSelector) {
                callBack && callBack();
                return;
            }
            $(currJqPageSelector).slideUp(this.option.slideSpeed, function () {
                that.pages.splice(0, that.pages.length);
                callBack && callBack();
                that.closeCallBack && that.closeCallBack();
            });
        }
        catch (e) {
            callBack && callBack();
        }

    }

    MenuPageHistory.prototype.CloseHandler = function (callBack) {
        if (callBack) this.closeCallBack = callBack;
    }

    MenuPageHistory.prototype.BeforePushPageHandler = function (callBack) {
        if (callBack) this.prePushCallBack = callBack;
    }

    return MenuPageHistory;
} (jQuery);
var slideSpeed = 250;
var fotterScrollTop = 0;
var menuPageHistory = new MenuPageHistory({ slideSpeed: slideSpeed });
menuPageHistory.BeforePushPageHandler(function () {
    if (fotterScrollTop == 0) {
        fotterScrollTop = $(document).scrollTop();
    }
    $(document).scrollTop(0);
});
menuPageHistory.CloseHandler(function () {
    $("#normal_nav .navcon .menu ul li").removeClass("current");
    $(document).scrollTop(fotterScrollTop);
    fotterScrollTop = 0;
});


/*图片路径无效 加载 loading 图片     zhangweiwu-180729*/
$(function(){
	var browser=getExplorerInfo();
	setTimeout(function(){
        $('img').each(function () {
            $(this).attr('onerror', function (_, attr) {
                return attr || 'imgErrorUrl(this)';
            });
        });
	},3000);
});

var imgErrorUrl=function(ths, _isTransparentImg){
    var isTransparentImg = typeof _isTransparentImg === 'boolean' ? _isTransparentImg : false;
	var thsImg= $(ths) || $(this);
    var _imgUrl = "/etc/designs/huawei-cbg-site/clientlib-v3/images/hw-logo1-80.png";
    var transparentImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    var imgUrl = isTransparentImg ? transparentImg : _imgUrl;

    if (thsImg.hasClass("imgerror-defaultlogo")) {
        return;
    } else {
        thsImg.attr("src", imgUrl).addClass("imgerror-defaultlogo");
    }
}


function clickLazyImgs(obj){
	obj.find("img.lazy_src").each(function(){
		$(this).attr("src",$(this).data("src")).removeClass("lazy_src").show()
	})
}

function scrollLazyImgs(obj,dis){
	var _top = parseInt($(document).scrollTop());
	var mytop = parseInt(obj.offset().top) - (dis ||200);
	if(_top >= mytop){
		obj.find("img.scroll_src").each(function(index){
			$(this).attr("src",$(this).data("src")).removeClass("scroll_src").show()
		})
	}
}
/* lazy load img by add class */
function classLazy($p,top){
	var t = top || 500;
	var st = parseInt($(document).scrollTop()) + t;
	$(".lazy_class").each(function(){
        var mt = $(this).offset().top;
        st >= mt ? $(this).addClass($(this).data("class")).removeClass("lazy_class") : '' ;
	})
}
$(function(){
	$(".part_description,.spec-contect p").each(function(){
		if($(this).text().indexOf("≥")!=-1){
			$(this).text($(this).text().replace(/≥/g,">="));
		}
		if($(this).text().indexOf("≤")!=-1){
			$(this).text($(this).text().replace(/≤/g,"<="));
		}
	});
})

/* for head set v3 black*/
function getV3PageTypeByCategory(c){
	switch(c){
		case "phones"  : return "phones";
		case "laptops" : return "laptops";
		case "tablets" : return "tablets";
		case "wearables" : return "wearables";
		case "smart-home" : return "smart-home";
		case "mobile-broadband" : return "more-products";
		case "accessories" : return "more-products";
		case "about-us" : return "setCurrentNav";
        case "legal" : return "setCurrentNav";
        case "store-finder" : return "setCurrentNav";
		default : return "0";
	}
}
function setV3CurrentNav(){
	var $nv = $('.header-wrap>.nav-wrap>.left-box>ul>li');
	var nvl = $nv.length
	var _pt = getV3PageTypeByCategory(digitalData.page.category.primaryCategory);
	var _pc = digitalData.page.category.pageType;
	var _pm = digitalData.page.category.primaryCategory
	if(_pc == "support"){
		for(var i = nvl -1; i >0; i--){
			if($nv.eq(i).find('a').attr('href') && $nv.eq(i).find('a').attr('href').indexOf("/support") > 0){
				$nv.eq(i).addClass('curpage');
				break;
			}
		}
	}else if(_pm == "emui"){
		for(var i = nvl -1; i >0; i--){
			if($nv.eq(i).find('a').attr('href') && $nv.eq(i).find('a').attr('href').indexOf("/emui") > 0){
				$nv.eq(i).addClass('curpage');
				break;
			}
		}
	}else if(_pt!="0" && _pt != "setCurrentNav"){
		var _c = 0
		for(var i =0; i < nvl; i++){
			if($nv.eq(i).attr("wrap") == _pt){
				$nv.eq(i).addClass('curpage');
				_c = 1
				break
			}
		}
		_c == 0?$(".header-wrap>.nav-wrap>.left-box>ul>li[wrap='more-products']").addClass('curpage'):""
	}
}
$(document).ready(function(){
	if($(window).width() > 767){
		setV3CurrentNav();
	}

	/*input输入文本输入限制 500个字符    181115 */
	$("input[type='text']").each(function(i,input){
		var $input=$(input);
		if(!$input.attr("maxlength")){
			$input.attr("maxlength",500);
		}
	})
});

/*plphidedata_arr 转Json*/
var plphidedataToJson=function(){
	var plpJson=[];
	$(".plphidedata_arr span").each(function(i,span){
		if($(span).text().length>0){
			plpJson.push(JSON.parse($(span).text().trim()))
		}
	});
	return plpJson;
}

String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}

;(function() {
	if(typeof Mkt === 'undefined'){
		window.Mkt = (function(){
			let util = {
				filterObject: function (obj,reg) {
					try {
						let replaceReg = reg || /^\s+|\s+$/g;
						let filterObj = Array.isArray(obj) ? [] : {};

						for (let key in obj) {
							if (Object.prototype.hasOwnProperty.call(obj, key)) {
								let value = obj[key];
								if (value !== null && typeof value === 'object') {
									filterObj[key] = util.filterObject(value,replaceReg);
								} else {
									if (value && typeof value === 'string') {
										filterObj[key] = util.filterText(value,replaceReg);
									} else {
										filterObj[key] = value;
									}
								}
							}
						}

						return filterObj;
					} catch (e) {
						return obj;
					}
				},
				getSafeUrl: function (url) {
					try {
						const requestUrl = new URL(url);
						if (requestUrl.protocol === 'http:' || requestUrl.protocol === 'https:') {
							return url;
						}

						return url;
					} catch (e) {
						return url;
					}
				},
				filterText: function (text,reg) {
					try {
						let replaceReg = reg || /^\s+|\s+$/g;
						return text.replace(replaceReg, '');
					} catch (e) {
						return text;
					}
				},
                windowWidth: function () {
                    let de = document.documentElement;
                    return window.innerWidth || (de && de.clientWidth) || document.body.clientWidth
                }
			};

			return {Util: util};
		})()
	}
})();

/* 处理移动端真机上 视频播放 背景内容可滑动的问题*/
$(function () {
    $(".play_video").on("click", function () {
        //mob
        if (window.innerWidth < 1024) {
            var fancyTime = setInterval(function () {
                clearInterval(fancyTime);
                var winHeight = $(window).height(),
                    videoHeight = $('.fancybox-inner').height(),
                    _top = parseFloat((winHeight - videoHeight) / 2);
                $('.fancybox-wrap').css('top', _top);
                _scrollTop = $(document).scrollTop();
                $("html,body").scrollTop(_scrollTop);
                $(".fancybox-overlay,.fancybox-close").on("click", function () {
                    $('html,body').removeAttr('style').scrollTop(_scrollTop);
                })
                return _scrollTop
            }, 500);
            $(document).on("click", ".fancybox-close", function () {
                $('html,body').removeAttr('style').scrollTop(_scrollTop);
            })
        }else{
            //pc
            var fancyTimes=setInterval(function(){
                if($(".fancybox-mobile.fancybox-opened").length>0){
                    clearInterval(fancyTimes);
                    $("body").css("overflow","visible");
                    $(".fancybox-overlay,.fancybox-close").on("click",function(){
                        $("html,body").css("overflow","visible");
                        $("body").css("height","auto");
                    })
                }
            },500);
        }
    })
})
var _scrollTop = 0; //保存滚动值
//双语站点语言选择
var bilingual_site_cookie = getCookie("bilingual_site_cookie") ? getCookie("bilingual_site_cookie") : ""; //cookie
var current_site_code = digitalData.page.pageInfo.siteCode || "" //当前站点编码
var current_country_code = digitalData.page.pageInfo.countryCode || ""; //当前国家编码
var site_code = ""; //要存储的站点编码
var country_code = ""; //要存储的国家编码
var cookieArr = []; //cookie字符串分割数组
var cookieStr = ""; //cookie字符串
var c_flag = false; //国家编码是否已存在于cookie的标识;false表示不存在，true表示存在
var s_flag = false; //站点编码是否已存在于cookie的标识;false表示不存在，true表示存在
var replace_str = ""; //要替换的国家编码、站点编码字符串
var cookie_info = ""; //要存储的国家编码、站点编码字符串
var path_name = window.location.pathname; //取地址
var click_flag = false; //点击的是否是当前的站点，false表示不是，true表示是

if (path_name.indexOf("/editor.html/content/huawei-cbg-site/") == 0) {
	//编辑模式,path_name已/editor.html/content/huawei-cbg-site/开头
	path_name = path_name.replace("/editor.html/content/huawei-cbg-site/", "");
	if (path_name.indexOf("/") > -1) {
		//非首页，
		current_site_code = path_name.split("/")[0];
	} else {
		//首页，
		current_site_code = path_name.split(".")[0];
	}
} else if (path_name.indexOf("/content/huawei-cbg-site/") == 0) {
	//预览模式，path_name已/content/huawei-cbg-site/开头
	path_name = path_name.replace("/content/huawei-cbg-site/", "");
	if (path_name.indexOf("/") > -1) {
		//非首页，
		current_site_code = path_name.split("/")[0];
	} else {
		//首页，
		current_site_code = path_name.split(".")[0];
	}
} else {
	//正式发布的sit、uat、生产环境，
	current_site_code = path_name.split("/")[1];
}

/**
 * 首页 (不包括qingyun的首页) 和 support所属页面 一级导航固定顶部显示
 * 除上述页面，一级导航跟随页面滚动
 */
$(document).ready(function() {

	if(Granite && Granite.author){
		return;
	}

	const pageType = window.digitalData ? window.digitalData.page.category.pageType : '';

	const isHuaweiQingyun = $('.huawei-qingyun').length > 0;

	const isHomePage = pageType === 'homepage' && !isHuaweiQingyun;

	const isSupportPage = pageType === 'support';

	if (!isHomePage && !isSupportPage) {
		$('.v4.header').addClass('scroll-with-screen');
	}
});

$(document).ready(function(){
	//app嵌套页面不展示
	if (window.integrationJsInterface || window.integrationJsInterfaceWebview) {
		return;
	}
	
	//是否有双语站点弹窗,并且配置了语言选择项
	var $siteChooseMask = $(".site_choose_mask");
    if($siteChooseMask.length >0){
    	// 将弹窗提示 迁移到页面顶部
		$('#topTipsBox').prepend($siteChooseMask)
		$('#header-v4,.site-header').addClass('has-top-tips');
		
		var editorMode = $("#is_editor").attr("data-is-editor-mode"); // 当前页面模式是否是编辑模式
		
        //给当前站点语言的按钮加高亮状态
        $(".site_choose_mask p span.site_choose_btn").each(function(){
			if($(this).attr("sitecode") && $(this).attr("sitecode") == current_site_code ){
				$(this).addClass("current").siblings().addClass("other");
            }
        });
        //右下角语言选择按钮点击
        $("a.lang_change").click(function() {
            if($(this).attr("scode") && $(this).attr("scode") != ""){
                c_flag = false;
            	s_flag = false;
                var choose_site_code = $(this).attr("scode");
				site_code = choose_site_code;
                country_code = current_country_code;
                cookie_info = country_code + '|' + site_code;
                cookieJudgment(cookie_info, site_code,"yes");
            }
        });
        if( bilingual_site_cookie != ''){
            site_code = current_site_code;

            // 更新双语站点选择中 相关站点code状态和数据
			updateCodeStatusAndData();

            if (c_flag == true && s_flag == false) { //当前countryCode已经存在于cookie,并且siteCode不存在于cookie,属于非主语言网站，强制跳转到主语言网站
                site_code = replace_str.split("|")[1];
                windowHref(site_code);
			} else if (c_flag == false && editorMode == "false") { //当前countryCode不存在于cookie，意味着是一个全新的双语网站，显示语言弹出窗， 编辑页面不展示，预览页面和发布页面展示
				showSitChooseMask();
			}
        }else{
            //首次进双语站点，编辑页面不展示，预览页面和发布页面展示
			if(editorMode == "false"){
				showSitChooseMask();
            }
        }
        //弹窗关闭按钮
		$(document).on("click","#close_btn",function(e){
            e.stopPropagation();
            //对语言选择进行GA埋码
            var cat = "navigation";
            var act = "site_language_box_close";
            var lab = current_site_code;
			if(typeof ga  == 'function'){
				ga('send', 'event', cat, act, lab);
			}
			//dmpa埋码
			var $link = getCurrentBtnUrl() == window.location.href ? window.location.href : getCurrentBtnUrl();
			dmpaCommon("trackEvent", "click", "pop_up interaction", 'Close',$link);
            $("html").removeClass("htmlbody_scroll");
            hideSitChooseMask();
            site_code = current_site_code;
			country_code = current_country_code;
            cookie_info = country_code + '|' + site_code;
            cookieJudgment(cookie_info,site_code,"yes",false);//是否跳转 flse：不跳转

        })
		function getCurrentBtnUrl(siteCode){
			var url;
			var origin = window.location.origin;
			var pathname = window.location.pathname;
			var search = window.location.search;
			siteCode = siteCode || site_code;
			if (pathname.indexOf("/editor.html/content/huawei-cbg-site/") == 0) { //编辑模式,pathname已/editor.html/content/huawei-cbg-site/开头
				pathname = pathname.replace("/editor.html/content/huawei-cbg-site/", "");
				if (pathname.indexOf("/") > -1) { //非首页，
					pathname = pathname.replace(pathname.split("/")[0], siteCode);
					pathname = "/editor.html/content/huawei-cbg-site/" + pathname;
					url = origin + pathname;
				} else { //首页，
					pathname = pathname.replace(pathname.split(".")[0], siteCode);
					pathname = "/editor.html/content/huawei-cbg-site/" + pathname;
					url = origin + pathname + search;
				}
			} else if (pathname.indexOf("/content/huawei-cbg-site/") == 0) { //预览模式，pathname已/content/huawei-cbg-site/开头
				pathname = pathname.replace("/content/huawei-cbg-site/", "");
				if (pathname.indexOf("/") > -1) { //非首页，
					pathname = pathname.replace(pathname.split("/")[0], siteCode);
					pathname = "/content/huawei-cbg-site/" + pathname;
					url = origin + pathname + search;
				} else { //首页，
					pathname = pathname.replace(pathname.split(".")[0], siteCode);
					pathname = "/content/huawei-cbg-site/" + pathname;
					url = origin + pathname + search;
				}
			} else { //正式发布的sit、uat、生产环境，
				pathname = pathname.replace('/' + current_site_code + '/', '/' + siteCode + '/');
				url = origin + pathname + search;
			}
			return url;
		}
        //语言选择按钮点击
        $(document).on("click",".site_choose_btn",function(e){
            e.stopPropagation();
            //对语言选择进行GA埋码
            var cat = "navigation";
            var act = "site_language_select";
            var lab = current_site_code + '_' + $(this).text();
			if(typeof ga  == 'function'){
				ga('send', 'event', cat, act, lab);
			}
			//dmpa埋码
			var $buttonName =  $(this).attr('data-language').toLowerCase() =='english' ? "English" : "Arabic",
				$link = getCurrentBtnUrl() == window.location.href ? window.location.href : getCurrentBtnUrl();
			dmpaCommon("trackEvent", "click", "pop_up interaction", $buttonName,$link);
            var click = "yes";
            if($(this).hasClass("current")){//点击的是当前站点
				click_flag = true;
            }else{
				click_flag = false;
            }

			var choose_site_code = $(this).attr("siteCode");
            if(choose_site_code){
                $("html").removeClass("htmlbody_scroll");
				hideSitChooseMask();
                site_code = choose_site_code;
                country_code = current_country_code;
                cookie_info = country_code + '|' + site_code;
                cookieJudgment(cookie_info,site_code,click);
            }

        })

		/*
		* 更新双语站点选择中 相关站点code状态和数据
		* */
		function updateCodeStatusAndData(){
			cookieStr = getCookie("bilingual_site_cookie");
			cookieArr = cookieStr.split(",");
			for (var i = 0; i < cookieArr.length; i++) {
				//循环cookie,当前countryCode是否已经存在于cookie，判断选择的siteCode是否已经存在于cookie
				//当前countryCode已经存在于cookie
				if (cookieArr[i].split("|")[0] == current_country_code) {
					c_flag = true;
					replace_str = cookieArr[i];
					//当前siteCode已经存在于cookie
					if (cookieArr[i].split("|")[1] == site_code) {
						s_flag = true;
					}
				}
			}
		}

		//cookie判断
        function cookieJudgment(cookie_info, site_code,click,jump) {
            //如果cookie存在
            if (getCookie("bilingual_site_cookie") && getCookie("bilingual_site_cookie") != "") {
				// 更新双语站点选择中 相关站点code状态和数据
            	updateCodeStatusAndData();

                if (c_flag == true && s_flag == true && click == "yes" ) { //当前countryCode已经存在于cookie,并且siteCode已经存在于cookie
					windowHref(site_code,click);
                }else if (c_flag == true && s_flag == false) { //当前countryCode已经存在于cookie,并且siteCode不存在于cookie,替换cookie
                    cookieStr = cookieStr.replace(replace_str, cookie_info);
                    setCookie("bilingual_site_cookie", cookieStr);
                    windowHref(site_code,click);
                } else if (c_flag == false) { //当前countryCode不存在于cookie，取出之前的cookie字符串，拼接上要存的cookie字符串，再存储cookie
                    cookieStr = cookieStr + "," + cookie_info;
                    setCookie("bilingual_site_cookie", cookieStr);
                    windowHref(site_code,click);
                }
            } else {
                cookieArr.push(cookie_info);
                setCookie("bilingual_site_cookie", cookieArr);
                windowHref(site_code,"yes",jump);
            }
        }
        //链接跳转
        function windowHref(siteCode,click,jump) {
			if(jump==false){
				return
			}
            if(click == "yes"){
				window.location.href = getCurrentBtnUrl(siteCode);
            }else{
				if(editorMode == "false"){
					showSitChooseMask();
				}
            }
        }
        
    	// 显示或隐藏双语站点切换提示，并更新Header Placeholder高度
    	function showSitChooseMask(){
			$siteChooseMask.show();
			updateHeaderHg();
		}
    	function hideSitChooseMask(){
			$siteChooseMask.hide();
			updateHeaderHg();
		}
    	// 更新Header高度，同时更新相关组件UI定位位置
    	function updateHeaderHg(){
        	var $header = $('#header-v4');
        	var $headerPh = $("#header-placeholder");
    		var headerHeight = $header.innerHeight();
			if(headerHeight < 300){
				$headerPh.css({"height":headerHeight});
				$(document).scrollTop("1px");
			}
			$(".n12-search").css("top",headerHeight);

			if(Mkt.Util.windowWidth() > 1199) {
				$('.main-nav .popup').css("top",headerHeight);
				// 主导航v2版本 移动端UI 相关弹窗适配
				var isNavV2MbUI = $header.hasClass('nav-v2') && (Mkt.Util.windowWidth()<1366 || $header.hasClass('mb-ui'));
				if(isNavV2MbUI){
					$('.v4.n01-main-navigation.nav-v2 .main-nav,.huawei-v4 .login-v4-wrap .login-v4').css('top',headerHeight);
				}
			}else{
				$('.main-nav').css("top",headerHeight);
				$('.huawei-v4 .login-v4-wrap .login-v4').css('top',headerHeight);
			}
    	}
    }
})


document.addEventListener('DOMContentLoaded', () => {

	let mktGlobalBuyContainer = $('.mkt-global-buy-container');

	let MktGlobalBuy = $('.mkt-global-buy-container .product-tabs__button');

	let globalBuyInterval = setInterval(()=> {
		let n06SecondNavBuyButton = $('.v4.n06-second-navigation .product-tabs__button');

		if (!n06SecondNavBuyButton.length || !mktGlobalBuyContainer.length) {
			clearInterval(globalBuyInterval);
			return;
		}

		if (MktGlobalBuy.length > 0) {
			clearInterval(globalBuyInterval);
			return;
		}

		if (n06SecondNavBuyButton.length > 0) {
			let title = n06SecondNavBuyButton.attr('title') || n06SecondNavBuyButton.data('title');
			if (title) {
				handleMktGlobalBuyTitle(title);
				clearInterval(globalBuyInterval);
			}
		}
	}, 100);

	function handleMktGlobalBuyTitle(title){

		let buyButton = $('<button>', {
			class: 'button',
			text: title.trim()
		});

		mktGlobalBuyContainer.append(buyButton);

		mktGlobalBuyContainer.removeClass('opacity');

	}
});

window.addEventListener('load', () => {
	let n06SecondNavBuyButton = $('.v4.n06-second-navigation .product-tabs__button');

	let mktGlobalBuyContainer = $('.mkt-global-buy-container');

	if (!n06SecondNavBuyButton.length || !mktGlobalBuyContainer.length) {
		return;
	}

	setTimeout(()=>{
		const newButton = n06SecondNavBuyButton.clone(true);

		newButton.attr('data-eventtype', 'pdp-to-pop-huawei-click_kv');

		mktGlobalBuyContainer.empty();

		mktGlobalBuyContainer.append(newButton);

		mktGlobalBuyContainer.removeClass('opacity');
	},100)

	$(document).on('click', '.mkt-global-buy-container button', function () {

		window.dataLayer.push({
			event: $(this).data('eventtype') || '',
			clickName: "product details_click to pop_huawei",
			clickType: "action",
			productMktName: $(this).data('nameforga') || ''
		});

		const isEcSite = window.isECommerceSite !== 'None';

		let secondNavActiveTitle =  $('#second-navigation-v4').find(".product-link__active").data("title")||'';

		isEcSite && Mkt.Util.pushHaPoint("110200055","Seconded_Navigation_Component_Click",{
			"componentry_name": "Seconded_Navigation_Component",
			"componentry_title": "",
			"card_title": secondNavActiveTitle, //$商品名称
			"button_name": 'top banner buy button',
			"etype": "click"
		})
	})

});


/**
 * @file 站点Cookie管控功能
 */
$(document).ready(function () {
    appEmbedded();
    IEVersion();
    thirdPartyAccessAction();

    var acceptRetainDay = window.cookieInitEnvHandleForModeB ? +cookieInitEnvHandleForModeB.getDataset('acceptRetainDay') : 360;
    var rejectRetainDay = window.cookieInitEnvHandleForModeB ? +cookieInitEnvHandleForModeB.getDataset('rejectRetainDay') : 360;
    var xIconAcceptState = window.cookieInitEnvHandleForModeB ? cookieInitEnvHandleForModeB.getDataset('closeIconToAccept'): 'false';
    var browsingToAccept = window.cookieInitEnvHandleForModeB ? cookieInitEnvHandleForModeB.getDataset('browsingToAccept'): 'false';
    var _isEnabledNewCookieSettings = window.cookieInitEnvHandleForModeB ? cookieInitEnvHandleForModeB.getDataset('newCfgModeEnabled') : 'false';
    var isEnabledNewCookieSettings = _isEnabledNewCookieSettings === 'true';

    // B模式新增清除cookie的功能
    window.cookieInitEnvHandleForModeB && cookieInitEnvHandleForModeB.clearCookie();

    //如果当前cookie 模式是 B模式,且首页有配置推送时间
    if (!isEnabledNewCookieSettings && enableNewCookieCfg && cookieModeSetting === 'fusionPromptModeB' && pushForConsentTime !== '') {
        pushConsentTimeHandle(pushForConsentTime);
    }

    if($(".huawei-convergent-cookie").length > 0) {
        showJpCookie();
        var acceptFlag = getCookie("huawei_store_accept_cookie_flag");
        var isEnabledBrowsing = (window.cookieInitEnvHandleForModeB && isEnabledNewCookieSettings) ? (browsingToAccept === 'true') : enableDefaultCookieAccept;
        // 当开启新cookie配置 且 未禁用B管控模式下的默认页面链接按钮点击启用Cookie动用 且 未曾操作过同意cookie按钮 时 监听页面链接按钮点击事件执行默认同意动作
        if (enableNewCookieCfg &&
            cookieModeSetting &&
            (cookieModeSetting === 'fusionPromptModeB') &&
            isEnabledBrowsing &&
            !acceptFlag) {
            cookieBListenClick(false);
        }
    }else {
        showCookieTip();
    }

    $(".huawei-ie-tips .huawei-ie-close").on("click", function () {
        $(".huawei-ie-tips").slideUp(500);
    })
    $(".huawei-v4 .huawei-cookie-cnt .huawei-cookie-close").on("click", function () {
        cookieTips();
    })
    /* jp cookie click agrees*/
    $(".convergent-cookie-agree").on("click",function(){
        setJPCookie("huawei_store_accept_cookie_flag",true, acceptRetainDay);
        setJPCookie("huawei_store_accept_cookie_choose", "1|1|1", acceptRetainDay);
        JPCookieBanner();
    });

    /* jp cookie click reject*/
    $(".convergent-cookie-reject").on("click",function(){
        setJPCookie("huawei_store_accept_cookie_flag",true, rejectRetainDay);
        setJPCookie("huawei_store_accept_cookie_choose", "0|0|0", rejectRetainDay);
        JPCookieBanner();
    });

    /* jp cookie click close*/
    $(".huawei-convergent-cookie:not(.x-btn-disabled) .convergent-cookie-close").on("click",function(){
        if(window.cookieInitEnvHandleForModeB && isEnabledNewCookieSettings){
            var isAcceptAction = xIconAcceptState === 'true';
            var _retainDay = isAcceptAction ? acceptRetainDay : rejectRetainDay;
            setJPCookie("huawei_store_accept_cookie_flag", true, _retainDay);
            setJPCookie("huawei_store_accept_cookie_choose", isAcceptAction ? '1|1|1' : '0|0|0', _retainDay);
            JPCookieBanner();
        }else{
            var isNotModeD = !!$('.huawei-convergent-cookie.model-default').length;
            if(!enableNewCookieCfg || isNotModeD){
                JPCookieBanner(false);
            } else {
                setJPCookie("huawei_store_accept_cookie_flag", true, 360);
                setJPCookie("huawei_store_accept_cookie_choose", "1|1|1", 360);
                JPCookieBanner();
            }
        }
    });

    $(".second-mask-wrap").on("click", function () {
        $(".second-navigation .second-nav .icon-app").click();
    })

    // cookie popup modeB details (category && privacy)
    var cookiePcFlag = Mkt.Util.windowWidth() > 1079;
    // detail btn click
    var $cookieDetailButton = $('.huawei-convergent-cookie .convergent-cookie-details-btn .details-btn');
    const cookieNewEl = document.querySelector('.huawei-convergent-cookie.new-b-mode');
    const glassBgEle = cookieNewEl ? cookieNewEl.querySelector('.frosted-glass-bg') : null;

    $cookieDetailButton.on('click', function () {
        if ($(this).hasClass('open')) {
            if (glassBgEle) {
                cookieNewEl.classList.remove('desc-open');
                requestAnimationFrame(() => {
                    glassBgEle.style.removeProperty('--glass_bg_height');
                });
            }
            $(this).removeClass('open');
            $('html').removeClass('no-scroll');
            $(this).text($(this).attr('data-show-text') || '');
            $(this).attr('title', $(this).attr('data-show-text') || '');
            $(this).parent().next().stop().slideUp();
        } else {
            $(this).addClass('open');
            cookieNewEl.classList.add('desc-open');
            $('html').addClass('no-scroll');
            $(this).text($(this).attr('data-hide-text') || '');
            $(this).attr('title', $(this).attr('data-hide-text') || '');
            $(this).parent().next().stop().slideDown(function(){
                if(cookiePcFlag){
                    handleDescriptionContainerWidth();
                } else if (glassBgEle) {
                    requestAnimationFrame(() => {
                        glassBgEle.style.setProperty('--glass_bg_height', `${cookieNewEl.scrollHeight}px`);
                    });
                }
                $('.huawei-v4 .huawei-convergent-cookie .convergent-cookie-bottom').addClass('no-opacity');
            });
        }
    });
    
    let $cookieRejectButton = $('.huawei-convergent-cookie .convergent-cookie-button-wrapper .convergent-cookie-button .convergent-cookie-reject');
    $cookieRejectButton.on('click', function () {
        clearAllCookie('.huawei.com', '.huawei.cn')
    });

    function clearAllCookie(otherPath, currentPath) {
  let keys = document.cookie.match(/[^ =;]+(?=\=)/g);

  if (keys) {
    let date = new Date(0);

    for (let i = keys.length; i--;) {
      let key = keys[i];
      if (key.trim() !== 'CookieInformationConsent' && key.trim() !== 'cookie_consent') {
      $.cookie(key, '', { expires: date, path: '/' });
      $.cookie(key, '', { expires: date, path: '/',domain: window.location.hostname});
      otherPath && ($.cookie(key, '', { expires: date, path: '/',domain: otherPath}));
      currentPath && ($.cookie(key, '', { expires: date, path: '/',domain: currentPath}));
      } 
    }
  }
}
    // pc端 descriptionContainer 计算
    function handleDescriptionContainerWidth(){
        var $nameContainer = $('.huawei-convergent-cookie .convergent-cookie-bottom .name-container');
        var $descriptionContainer = $('.huawei-convergent-cookie .convergent-cookie-bottom .description-container');
        var nameContainerMaxWidth = 0;
        $nameContainer.each(function(){
            if ($(this).outerWidth(true) > nameContainerMaxWidth) {
                nameContainerMaxWidth = $(this).outerWidth(true);
            }
        })

        var descriptionPadding = document.dir === 'rtl' ?
            $descriptionContainer.css('padding-left').split('px')[0]:
            $descriptionContainer.css('padding-right').split('px')[0];
        var descriptionContainerWidth = $('.huawei-convergent-cookie  .convergent-cookie-bottom').width()-nameContainerMaxWidth-descriptionPadding;
        $nameContainer.width(nameContainerMaxWidth-54);
        $descriptionContainer.width(descriptionContainerWidth);
    }


    function handleButtonOneRow(){
        if(Mkt.Util.windowWidth() > 1080 || Mkt.Util.windowWidth() < 768){
            return;
        }
        var cookieBoxWidth = $('.convergent-cookie-cnt').width();
        var cookieTextWidth = $('.convergent-cookie-txt').width();
        var cookieButtonWidth = $('.convergent-cookie-button-wrapper').outerWidth();
        var maxNumber = 0;
        $('.convergent-cookie-button').each(function (index, ele) {
            var width =  $(ele).width();
            maxNumber = maxNumber < width ? width : maxNumber;
        });
        if((cookieBoxWidth - cookieTextWidth - cookieButtonWidth) > maxNumber){
            $('.convergent-cookie-button-group').addClass('one-row');
        }else{
            $('.convergent-cookie-button-group').removeClass('one-row');
        }
    }
    handleButtonOneRow();


    // category tab click
    var $categoryTab = $('.huawei-convergent-cookie .convergent-cookie-bottom .indicator-button.categories');
    var $privacyTab = $('.huawei-convergent-cookie .convergent-cookie-bottom .indicator-button.privacy');
    var $categoryWrapper = $('.huawei-convergent-cookie .convergent-cookie-bottom .categories-wrapper');
    var $privacyWrapper = $('.huawei-convergent-cookie .convergent-cookie-bottom .privacy-wrapper');
    var $saveButton = $('.huawei-convergent-cookie .convergent-cookie-save-button .save-button');
    $categoryTab.on('click', function () {
        $privacyTab.removeClass('active');
        $categoryTab.addClass('active');
        $privacyWrapper.hide();
        $categoryWrapper.show();
        $saveButton.removeClass('hide');
    });
    $privacyTab.on('click', function () {
        $categoryTab.removeClass('active');
        $privacyTab.addClass('active');
        $categoryWrapper.hide();
        $privacyWrapper.show();
        $saveButton.addClass('hide');
    });

    var $indicatorButton = $('.huawei-convergent-cookie .convergent-cookie-bottom .indicator-button') || '';
    $indicatorButton ? $indicatorButton.eq(0).addClass('active') : '';
    ($privacyTab && $privacyTab.hasClass('active')) ? $saveButton.addClass('hide') : '';

    // pc 默认选中第一个
    if(cookiePcFlag){
        $('.huawei-convergent-cookie .convergent-cookie-bottom .categories-container').eq(0).length ?
            $('.huawei-convergent-cookie .convergent-cookie-bottom .categories-container').eq(0).addClass('checked') :
            '';
    }
    // category click pc:category-name
    var $categoryName = $('.huawei-convergent-cookie .convergent-cookie-bottom .name-container');
    if(cookiePcFlag){
        $categoryName.on('click', function (e) {
            e.preventDefault();
            var $categoryContainer = $(this).parents('.categories-container');
            if (!$categoryContainer.hasClass('checked')) {
                $categoryContainer.addClass('checked');
                $categoryContainer.siblings('.categories-container').removeClass('checked');
            }
        });
    }

    // categories click mob:categories-container
    var $categoryContainer = $('.huawei-convergent-cookie .convergent-cookie-bottom .categories-container');
    if(!cookiePcFlag){
        $categoryContainer.on('click', function (e) {
            e.preventDefault();
            if ($(this).hasClass('checked')) {
                $(this).removeClass('checked');
                $(this).siblings('.categories-container').removeClass('checked');
                $(this).find('.cookie-description-bg-color').slideUp();
            }else{
                $(this).addClass('checked');
                $(this).siblings('.categories-container').removeClass('checked');
                $(this).find('.cookie-description-bg-color').slideDown();
                $(this).siblings('.categories-container').find('.cookie-description-bg-color').slideUp();
            }
        });
    }

    // switch click
    var $switchContainer = $('.huawei-convergent-cookie .convergent-cookie-bottom .switch-container');
    $switchContainer.on('click', function (e) {
        e.preventDefault();
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
        }
        return false;
    });

})
var lastWinWidth = $(window).width();
$(window).on("resize", function () {
    if($(".huawei-convergent-cookie").length > 0) {
        /* Only the width is changed */
        var currentWinWidth = $(window).width();
        if(currentWinWidth != lastWinWidth) {
            showJpCookie();
            lastWinWidth = currentWinWidth;
        }
    }else {
        showCookieTip();
    }
})

/* top search stat*/
var site = window.digitalData.page.pageInfo.siteCode2.toUpperCase();
var pre_url = supportv2.supportApiUrl + "/services/service/";

function getSiteLanguage () {
    return window.digitalData.page.pageInfo.language ? window.digitalData.page.pageInfo.language.replace("_", "-") : "";
}

/* top search end*/
function cookieTips () {
    var winW = $(window).width();
    $(".huawei-bootom-cookie").hide();
    setCookie("agreed-huawei-cookiepolicy", "1");
    $("#footer-v3").removeAttr("style");
    $(".custom-service").removeAttr("style");
    $(".supportquestionnairedom-side").removeAttr("style");
    if (typeof support != 'undefined' && support.Util) {
        support.Util.initModuleEvaluationLocation();
        support.Util.initSharePosition();
    }
    $(".manhattan_topBtn").removeAttr("style");
    $("#content-v3-compare").css({ transform: "none", "-webkit-transform": "none" });
    $("#up").css("bottom", 5 + "vh");
    $(".post-create").removeAttr("style");
    $(".cbg-backtotop").css("bottom", 50 + "px");
    $(".emui9-backtotop").css("bottom", 50 + "px");
    if (winW < 1024) {
        $(".custom-service-container,.scroll-top").removeAttr("style");
        $("#livechat-compact-container").css("z-index", 2147483639);
        $(".header-gblnav-default").css("bottom", "0px");
        $(".huawei-bootom-cookie")
            .hide(function () {
                if ($(".app-nav-icon").hasClass("clicked")) {
                    var appHeaderHeight = $(window).height() - $(".app-nav").height() - $(".huawei-bootom-cookie:visible").outerHeight(),
                        navheight = $(".second-navigation:visible").height(),
                        headerHeight = $(".app-nav").height();
                    $(".header-wrap").height(appHeaderHeight + navheight - $(".header-gblnav-default").height());
                    $("#header-v3").css({ height: appHeaderHeight + navheight, top: headerHeight - navheight + "px", "z-index": 151 });
                } else {
                    headerHeigh();
                }
            })
            .css("height", "0");
    }
    //
    var pdpCompare = $(".content-v3-compare");
    if (pdpCompare.is(":visible")) {
        pdpCompare.css({
            top: "100%"
        })
    }
    if($('.support-bootom-cookie').length > 0) {
        $('.support-bootom-cookie').css('bottom',0);
    }
}

$(document).on("click",".convergent-cookie-close,.convergent-cookie-button a",function(){
    if($('.support-bootom-cookie').length > 0) {
        $('.support-bootom-cookie').css('bottom',0);
    }
})

function showCookieTip (str) {
    //app嵌套页面不展示
    if (window.integrationJsInterface || window.integrationJsInterfaceWebview) {
        return;
    }
    //融合电商cookie勾选，该cookie不显示
    if($(".huawei-convergent-cookie").length > 0) {
        return;
    }
    if ($("#cookieType").val() == "othercookie") {
        delCookie("agreed-huawei-cookiepolicy");
        headerHeigh();
        return;
    }
    var _ag = getCookie("agreed-huawei-cookiepolicy");
    if (_ag == "1") {
        $(".huawei-bootom-cookie").remove();
        headerHeigh();
    } else {
        $(".huawei-bootom-cookie").show();
        var cookitheight = $(".huawei-bootom-cookie").outerHeight();
        if ($(".huawei-bootom-cookie").hasClass("cookie-style-two")) {
            cookitheight = $(".huawei-cookie-cnt").outerHeight();
        }
        $("#footer-v3").css("padding-bottom", cookitheight + "px");
        $(".manhattan_topBtn").css("bottom", cookitheight + 10 + "px");
        $(".emui9-backtotop").css("bottom", cookitheight + 10 + "px");
        $(".manhattan_topBtn").css("bottom", cookitheight + 10 + "px");
        $(".post-create").css({ bottom: cookitheight + 10 + "px", top: "auto" });
        $(".cbg-backtotop").css("bottom", cookitheight + 15 + "px");

        // 适配其他元素UI
        fixedPageUIForCookieDOM(cookitheight);
    }
}

/**
 * jp cookie
 * @param _isNeedPublished 默认存储到cookie和提交数据到服务器
 * @constructor
 */
function JPCookieBanner(_isNeedPublished , _isCommitData){
    var winW = $(window).width();
    $(".huawei-convergent-cookie").hide();
    $(".custom-service").removeAttr("style");
    $(".supportquestionnairedom-side").removeAttr("style");
    if (typeof window.handleEntrancePopupPosition === 'function') {
        window.handleEntrancePopupPosition();
    }
    $(".manhattan_topBtn").removeAttr("style");
    $("#content-v3-compare").css({ transform: "none", "-webkit-transform": "none" });
    $("#up").css("bottom", 5 + "vh");
    $(".post-create").removeAttr("style");
    $(".cbg-backtotop").css("bottom", 50 + "px");
    $(".emui9-backtotop").css("bottom", 50 + "px");
    $("body").removeClass("convergentCookie");
    $("html").removeClass("no-scroll");
    if (winW < 1024) {
        $(".custom-service-container,.scroll-top").removeAttr("style");
        $("#livechat-compact-container").css("z-index", 2147483639);
        $(".header-gblnav-default").css("bottom", "0px");
    }
    var pdpCompare = $(".content-v3-compare")
    if (pdpCompare.is(":visible")) {
        pdpCompare.css({
            top: "100%"
        })
    }

    var isChanged = window.cookieInitEnvHandleForModeB && cookieInitEnvHandleForModeB.isChosenChanged();
    var isCommitData = typeof _isCommitData === 'boolean' ? _isCommitData : true;
    if(isChanged && isCommitData){
        var isNeedPublished = typeof _isNeedPublished === 'boolean' ? _isNeedPublished : true;
        var chosenCookieCats = getCookie('huawei_store_accept_cookie_choose');
        var isAccept = chosenCookieCats && chosenCookieCats !== '0|0|0';
        cookieInitEnvHandleForModeB.commitData({ consentStatus: isAccept ? 'approved': 'denied', isNeedPublished: isNeedPublished , isAccept: isAccept });
    }
}

function setJPCookie(key,value,day) {
    var expires = day * 24 * 60 * 60 * 1000;
    var date = new Date(+new Date()+expires);
    var pathVal = window.siteCode;
    let cookieDomain = "huawei.com";
    if (location.host.endsWith("huawei.cn")) {
        cookieDomain = "huawei.cn";
    }
    document.cookie = key + "=" + value + ";expires=" + date.toUTCString() + ";domain=" + cookieDomain + ";path=/" + pathVal + "; Secure; SameSite=Lax";
}

/**
 * 显示cookie弹窗
 * @param {Boolean|Undefined} isForceShow 是否强制显示cookie弹窗，默认为false
 */
function showJpCookie(isForceShow) {
    //app嵌套页面不展示
    if (window.integrationJsInterface || window.integrationJsInterfaceWebview) {
        return;
    }

    var isForceDisplay = typeof isForceShow === 'boolean' ? isForceShow : false;
    var _ag = getCookie("huawei_store_accept_cookie_flag");

    if(isForceDisplay || !_ag || (_ag === 'false')) {
        $(".huawei-convergent-cookie").show();
        var cookitheight = $(".huawei-convergent-cookie").outerHeight();
        $(".manhattan_topBtn").css("bottom", cookitheight + 10 + "px");
        $(".emui9-backtotop").css("bottom", cookitheight + 10 + "px");
        $(".post-create").css({ bottom: cookitheight + 10 + "px", top: "auto" });
        $(".cbg-backtotop").css("bottom", cookitheight + 15 + "px");
        $("body").addClass("convergentCookie");

        // 适配其他元素UI
        fixedPageUIForCookieDOM(cookitheight);
    }

    window.cookieInitEnvHandleForModeB && cookieInitEnvHandleForModeB.updateInnerVarState(isForceShow);
}
// 因cookie UI 而适配页面其他元素
function fixedPageUIForCookieDOM(cookitheight){
    if (window.innerWidth < 1024) {
        $(".header-gblnav-default").css("bottom", cookitheight + "px");
        $(".custom-service-container,.scroll-top").css("z-index", 207);
    } else {
        if($(".custom-service").length > 0 && IsPersonalComputer()){
            var serviceBottom = $('.custom-service').css('bottom');
            var serviceHeight =  $('.custom-service').outerHeight();
            $(".supportquestionnairedom-side").css("bottom", parseInt(serviceBottom ? serviceBottom : 0) + parseInt(serviceHeight? serviceHeight : 0) + "px");
        }
    }

    if (window.innerWidth > 767.98) {
        $(".custom-service-v5").css("bottom", cookitheight + 9 + "px");
        var serviceBottom = $('.custom-service').css('bottom');
        var serviceHeight =  $('.custom-service').outerHeight();
        $(".supportquestionnairedom-side").css("bottom", parseInt(serviceBottom ? serviceBottom : 0) + parseInt(serviceHeight? serviceHeight : 0) + 10 + "px");
        $(".custom-service-container .custom-service-v5 .contact-list-v5").css("bottom", parseInt(serviceHeight? serviceHeight : 0) + 10 + "px");
    }

}

function headerHeigh () {
    if ($(".product-detail-container").not("#More_Support").length > 0) $("body").addClass("v3-suppro-detail");
}

/*Custom / move js*/
function setSessionuuid(uuidUrl, imageUrl, $tag, $img){
    $.ajax({
        type:"GET",
        async:false,
        url: deleteHttp(uuidUrl),
        dataType:"jsonp",
        jsonp:"jsonp",
        data:{},
        success:function(data){
            $tag.val(data.sessionuuid)
            $img.attr("src", imageUrl + "?tm=" + Math.random() + "&sessionuuid=" + data.sessionuuid + "&timep=" + Date().valueOf())
        }
    });
}

//PDP旧版浏览器升级提示
function IEVersion () {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
    var isIE11 = userAgent.indexOf("Trident") > -1 && userAgent.indexOf("rv:11.0") > -1;
    var ismate10m5ucuc = userAgent.indexOf("HUAWEIALP") > -1 || userAgent.indexOf("HUAWEISHT") > -1 || userAgent.indexOf("HUAWEICMR") > -1;
    var ieversion = 0;
    if (isIE) {
        ieversion = 1;
    } else if (isEdge) {
        ieversion = -1;
    } else if (isIE11) {
        ieversion = -1;
    } else if (ismate10m5ucuc) {
        ieversion = 1;
    }

    if (ieversion == 1) {
        $(".huawei-ie-tips").slideDown(500);
    } else {
        $(".huawei-ie-tips").remove();
    }
}

// cookie管控 B模式弹窗 随页面滚动交互事件
function cookieBListenClick(isNeedPublished){
    var acceptRetainDay = window.cookieInitEnvHandleForModeB ? +cookieInitEnvHandleForModeB.getDataset('acceptRetainDay') : 360;

    $('a,button').not('.convergent-cookie-agree,.convergent-cookie-reject,.convergent-cookie-close').on('click', function() {
        setJPCookie("huawei_store_accept_cookie_flag",true, acceptRetainDay);
        setJPCookie("huawei_store_accept_cookie_choose", "1|0|0", acceptRetainDay);

        if (ctlAnalysisCookie) {
            activeCookieScripts('analysis-cookie');
        }
        if (ctlAdvertiseCookie) {
            activeCookieScripts('advertise-cookie');
        }

        JPCookieBanner(!!isNeedPublished);
    })
}

/* APP PDP页面自动隐藏头尾 */
function appEmbedded(){
    if (window.integrationJsInterface || window.integrationJsInterfaceWebview) {
        $("body").addClass("app-hidden");
    }
}
let thirdPartyParentHost;

/* 判断当前页面请求是来自 Pmall 或 ISRP */
function thirdPartyEmbedded(){
    if (window.integrationJsInterface || window.integrationJsInterfaceWebview) {
        // APP嵌入，不展示
        return true;
    }
    let thirdPartyPathName;
    thirdPartyParentHost = document.referrer;
    if (parent !== window) {
        try {
            thirdPartyPathName = top.location.href;
        }catch (e) {
            thirdPartyPathName = window.location.href;
        }
    }else{
        thirdPartyPathName = window.location.href;
    }

    var thirdPartyFlag = thirdPartyPathName.indexOf("integrateMode\=iframe") != -1;
    return thirdPartyFlag || false ;
}

/* pmall和ISRP销售助手端 PDP页面自动隐藏头尾 && 二级导航 && robotIcon */
function thirdPartyAccessAction(){
    if (thirdPartyEmbedded()) {
        $("body").addClass("nav-hidden");
        window.top.postMessage('nav-hidden-success', thirdPartyParentHost);
    } else {
        activeCookieScripts('default-load-cookie'); // 加载GTM及相关Cookie
    }
}

function filterObject(obj, reg) {
    try {
        const filterObj = Array.isArray(obj) ? [] : {};
        let replaceReg = reg || /^\\s+|\\s+$/g;

        // 遍历对象的每个属性
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (typeof value === 'object' && value !== null) {
                    filterObj[key] = self.filterObject(value,replaceReg);
                } else {
                    if (value && typeof value === 'string') {
                        filterObj[key] = self.filterText(value,replaceReg);
                    } else {
                        filterObj[key] = value;
                    }
                }
            }
        }

        return filterObj;
    } catch (err) {
        return obj;
    }
}

function pushConsentTimeHandle(pushConsentTime) {
    var values = window.localStorage.getItem("push_for_consent_time") || "";
    var currentSiteCode = window.siteCode;

    var hasModified = false;
    var hasExistInValues = false;
    var valueArr = [];
    if (values != "") {
        valueArr = JSON.parse(values);

        // 如果当前站点已保存，且当前配置时间与保存时间不一致，则修改对应站点时间
        $.each(valueArr, function (index, obj) {
            if (obj.siteCode === currentSiteCode) {
                hasExistInValues = true;
                if (obj.time != pushConsentTime.trim()) {
                    hasModified = true;
                    obj.time = pushConsentTime;
                }
            }
        });
    }

    let cookieDomain = 'huawei.com';
    if (location.host.endsWith("huawei.cn")) {
        cookieDomain = "huawei.cn";
    }
    // 数组中未找到，或是本地localStorage未找到数据时，需要添加对应数据到数组
    if (!hasExistInValues || valueArr.length < 1) {
        valueArr.push({"siteCode":currentSiteCode,"time":pushConsentTime.trim()});
        window.localStorage.setItem('push_for_consent_time', JSON.stringify(filterObject(valueArr)));

        // 删除对应cookie,将重新显示cookie弹窗
        $.removeCookie("huawei_store_accept_cookie_flag",{domain:cookieDomain,path:"/"+currentSiteCode});
        $.removeCookie("huawei_store_accept_cookie_choose",{domain:cookieDomain,path:"/"+currentSiteCode});
    } else if (hasExistInValues && hasModified) {
        // 该站点信息已存在于数组当中，且有被修改时，需要更新本地localStorage存储数据
        window.localStorage.setItem('push_for_consent_time', JSON.stringify(filterObject(valueArr)));

        // 删除对应cookie,将重新显示cookie弹窗
        $.removeCookie("huawei_store_accept_cookie_flag",{domain:cookieDomain,path:"/"+currentSiteCode});
        $.removeCookie("huawei_store_accept_cookie_choose",{domain:cookieDomain,path:"/"+currentSiteCode});
    }

    window.cookieInitEnvHandleForModeB && cookieInitEnvHandleForModeB.updateInnerVarState();
}

var defaultImgLogo=$(window).width() < 1024 ? "/etc/designs/huawei-cbg-site/clientlib-v3/images/loading-40.png" : "/etc/designs/huawei-cbg-site/clientlib-v3/images/loading-80.png";

var buyFeature=function(ths,storeFinder,disclaimer,nameforga){
	var thsBtn=ths||$(this);
	var btnType=thsBtn.attr("data-buybtntype");
	var productId=thsBtn.attr("data-pid");
	var productName=thsBtn.attr("data-pname");
	var targetType=thsBtn.attr("data-targettype");
	var eventtype = thsBtn.attr("data-eventtype");
	var position = thsBtn.attr("data-position");
	var siteCode2=window.digitalData.page.pageInfo.siteCode2;

    //ecommerce buy
    if (thsBtn.hasClass("eCommerce-buy")) {
        var targetUrl = thsBtn.data("ecbuylink"),
            data_productId = thsBtn.attr("data-ecpid"),
            data_openInNewPage = thsBtn.data("ecopeninnewpage"),
            data_btnlinkinfo = thsBtn.attr("data-btnlinkinfo"),
            data_type = thsBtn.attr('data-buttonType');
        var ecTargetType = data_openInNewPage ? "_blank" : "_self";
        var appAPI = window.integrationJsInterface || window.integrationJsInterfaceWebview;
        if (appAPI) {
            //app购买,跳转到原生页面
            appAPI.startAppActivity(data_productId);
            return;
        }

        if (data_type === "explore" && data_btnlinkinfo) {
            buyToPdp_gtm(nameforga, position, eventtype);
            fun_ecommerce(ecTargetType, data_btnlinkinfo);
        } else {
            //融合电商buy按钮埋码，按照跳转到vmall电商方案处理
            buyToThirdParty_gtm(nameforga, position, eventtype, thsBtn);
            fun_ecommerce(ecTargetType, targetUrl);
        }
        return;
    }

	if(btnType == "none"){
	    buyToPdp_gtm(nameforga, position, eventtype);
	    var targetUrl=thsBtn.attr("data-btnlinkinfo");
	    if(targetUrl.indexOf("/content/huawei-cbg-site") == 0){
	        targetUrl = targetUrl.replace("/content/huawei-cbg-site", "");
	    }
        if(targetType=="_self"){
            window.location.href=targetUrl;
        }else{
            window.open(targetUrl);
        }
	}else if(btnType=="partner"){
	    buyOpenPopup_gtm(nameforga, position, eventtype);
		var pCountryBeal = thsBtn.attr("data-pcountrybeal") == "true";
		var pCountryTitle = thsBtn.attr("data-pcountrytitle");
		pCountryTitle=!!pCountryTitle ? pCountryTitle : Mkt.I18n.get("Select Country");
		//生成pop弹窗的结构，后续数据处理只要填充数据就好了
		createPopupToBuy();
		var showStoreFinder = storeFinder && storeFinder.showStoreFinder;
		var storeFinderInNewPage = "_self";
		var storeFinderLink = "";
		if(showStoreFinder){
			storeFinderInNewPage = storeFinder.openStoreFinderInNewPage ? "_blank " : "_self";
			storeFinderLink = storeFinder.storeFinderLink;
		}
		var detailPath = thsBtn.attr("data-btnlinkinfo");
		if(detailPath.indexOf(".html") > 0){
		    detailPath = detailPath.substring(0, detailPath.lastIndexOf(".html"));
		}
		var ajaxPartnerUrl = detailPath + "/_jcr_content.partners-v4.json";
        var allInOne = {};
        allInOne.showStoreFinder = showStoreFinder;
        allInOne.storeFinderLink = storeFinderLink;
        allInOne.storeFinderInNewPage = storeFinderInNewPage;
        allInOne.pCountryBeal = pCountryBeal;
        allInOne.pCountryTitle = pCountryTitle;
        var comb = {};
        comb.nameforga = nameforga;
        comb.eventtype = eventtype;
        comb.bannerposition = position;
        comb.targetType = targetType;
        fun_partner(ajaxPartnerUrl, allInOne, comb, disclaimer,productName);
	}else if(btnType=="third-party-site"){
	    var isToPsp = false;
	    var targetUrl= thsBtn.attr("data-btnlinkinfo") || '';
        if (targetUrl){
            var isCurrPage = targetUrl.indexOf(window.location.href) != -1;
            var urlTxt = Mkt.Util.isDispatcher ? '/' : '/content/huawei-cbg-site/';
            var isCurrSite = targetUrl.indexOf(window.location.origin + urlTxt + siteCode2) != -1;
            var isPSP = Mkt.Util.isDispatcher ? targetUrl.lastIndexOf('/select') != -1 : targetUrl.indexOf('/select.html') != -1;
            var pageType = thsBtn.attr("data-pagetype");
            if (isCurrSite && isPSP) {
                // 匹配PSP页
                isToPsp = true;
            }else if(isCurrPage && targetUrl.indexOf('#') != -1){
                eventtype = "product-detail-footer";
            }else if(pageType && pageType == 'search' && targetUrl.indexOf('#') != -1){
                eventtype = "search-product-detail-footer";
            }
        }
        buyToThirdParty_gtm(nameforga, position, eventtype, thsBtn, isToPsp);
        fun_thirdParty(targetType,targetUrl,siteCode2);
    }else if(btnType=="global-buy"){
        buyOpenPopup_gtm(nameforga, position, eventtype);
        if(!!productId){
            //生成pop弹窗的结构，后续数据处理只要填充数据就好了
            createPopupToBuy();
            var comb = {};
            comb.nameforga = nameforga;
            comb.eventtype = eventtype;
            comb.bannerposition = position;
            comb.targetType = targetType;
            getECSiteList(siteCode2, productId, productName, comb);
            if($.isIos()){$("#pdbuypage").trigger("click");}
        }
    }else{
        //channel-advisor和price-spider不实现
        console.log(productId + "-->" +btnType)
    }
}

/*=========== 购买类型 函数-1：partner  ============*/
/**
 * 产品对应的partner的数据
 * @param ajaxPartnerUrl
 * @param allInOne
 * @param comb
 * @param disclaimer
 * @param productName
 */
const fun_partner = function (ajaxPartnerUrl, allInOne, comb, disclaimer, productName) {
    // 是否显示store finder链接
    var showStoreFinder = allInOne.showStoreFinder;
    var storeFinderLink = allInOne.storeFinderLink;
    var storeFinderInNewPage = allInOne.storeFinderInNewPage;
    // 是否显示partner country选择框
    var pCountryBeal = allInOne.pCountryBeal;
    // partner country 下拉框的默认值
    var pCountryTitle = allInOne.pCountryTitle;

    var nameforga = comb.nameforga;
    var eventtype = comb.eventtype;
    var bannerposition = comb.bannerposition;
    // 新页面打开方式
    var targetType = comb.targetType;
    $.getJSON(ajaxPartnerUrl, function(res) {
        var pcountryClass = "";
        //生成country下拉框
        if (pCountryBeal) {
            pcountryClass = "pdbuypage-pcountry";
            $("#pdbuypage .pcountry-selbox").show();
            $("#pdbuypage .pcountry-countryname").html(pCountryTitle);
            if(res && res.countries) {
                var liHtml="";
                for(var key in res.countries){
                    liHtml+='<li class="pcountry-list-li" value="'+ key
                        +'" title="'+ res.countries[key] +'">'+ res.countries[key] +'</li>';
                }
                $("#pdbuypage .pcountry-list").append(liHtml);
            }
            addEventListener();
        }
        //生成partner list
        if(res && res.partners){
            var partnerListHtml = "";
            res.partners.forEach(function (partner, index, array) {
                partnerListHtml += '<li class="pdbuypage-listitem pdbuypage-listitem-partner '+ pcountryClass +'" data-pcountry="'+ partner.countryTag +'">'+
                                        '<a href="'+ partner.link +'" data-selectedpartnerbuy="'+partner.name
                    +'" data-nameforga="'+nameforga
                    +'" data-eventtype="'+eventtype
                    +'" data-bannerposition="'+bannerposition
                    +'"  target="'+ targetType
                    +'" data-parterlink="'+ partner.link
                    +'" class="pdbuypage-listitem-link">'+
                                            '<img src="'+ partner.icon +'" onerror="javascript:this.src=\''+defaultImgLogo+'\'" alt="'+ partner.name +'" class="pdbuypage-listitem-img" />'+
                                        '</a>'+
                                    '</li>';
            });
            $("#pdbuypage .pdbuypage-listul").html(partnerListHtml);
            $("#pdbuypage .pdbuypage-title-tipinfo").html(Mkt.I18n.get("Your Huawei device is available here"));
        }

        // 二级按钮点击埋码:针对跳转第三方商城
        $("#pdbuypage .pdbuypage-list ul").on('click.buryCode', 'a', function () {
            const ecPlatform = ($(this).data('selectedpartnerbuy') || '').trim();
            let currentPageCategory = '';
            if (window.digitalData && window.digitalData.page && window.digitalData.page.category) {
                currentPageCategory = window.digitalData.page.category.pageType || '';
            }
            window.dataLayer.push({
                "event": "buyNowOn3rdPlatform",
                "pageCategory": currentPageCategory,
                "productMktName": productName || '',
                "ecPlatform": ecPlatform
            });
        })

        //判断store finder显不显示
        if(!!showStoreFinder){
            $(".pdbuypage-footinfo").show();
            $(".pdbuypage-footinfo span").html(Mkt.I18n.get("If you want to buy in store, please click"));
            $(".pdbuypage-footinfo a").text(" " + Mkt.I18n.get("Store finder")).attr({ "href" : storeFinderLink, "target" : storeFinderInNewPage });
        }else{
            $(".pdbuypage-footinfo").hide();
        }

        if(disclaimer && disclaimer.length > 0){
            $(".pdbuypage-disclaimer").html(disclaimer).show();
        }

        partnerShow();
    });

    function addEventListener(){
        $(".pcountry-active").on("click",function(){/*国家列表点击区域,点解切换 下拉列表*/
            var thsActive=$(this);
            if(thsActive.attr("type")=="hide"){
                thsActive.attr("type","show");
                thsActive.find(".pcountry-arrow").addClass("pcountry-arrowup");
                thsActive.parent().find(".pcountry-list").slideDown(300);
                if($(window).width()<1024){
                    $(".pcountry-bg").show();
                    $(".pdbuypage-listul").css("overflow-y","hidden");
                }
            }else{
                thsActive.attr("type","hide");
                thsActive.find(".pcountry-arrow").removeClass("pcountry-arrowup");
                thsActive.parent().find(".pcountry-list").slideUp(300);
                $(".pcountry-bg").hide();
                $(".pdbuypage-listul").css("overflow-y","auto");
            }
        });
        $(".pcountry-list-li").on("click",function(){/*点击国家选项*/
            $(".pcountry-list-liactive").removeClass("pcountry-list-liactive");
            $(".pdbuypage-listitem-partner").hide();
            var thsListLi=$(this);
            thsListLi.addClass("pcountry-list-liactive");
            var thsCountryText=thsListLi.text();
            var thsCountryVal=thsListLi.attr("value");
            $(".pcountry-active .pcountry-countryname").text(thsCountryText).attr("title",thsCountryText);
            $(".pcountry-active").attr({"value":thsCountryVal,"type":"hide"});
            $(".pcountry-arrow").removeClass("pcountry-arrowup");
            $(".pcountry-list").slideUp(300,function(){
                $(".pcountry-bg").hide();
                $(".pdbuypage-listul").css("overflow-y","auto");
            });
            $(".pdbuypage-listitem-partner").each(function(i,li){
                var thsLi=$(li);
                if(thsLi.attr("data-pcountry") == thsCountryVal){
                    thsLi.show().css("float","left");
                }else{
                    thsLi.hide();
                }
            })

        })
        $(".pcountry-bg").on("click",function(){
            $(".pcountry-list").slideUp(300,function(){
                $(".pcountry-bg").hide();
                $(".pdbuypage-listul").css("overflow-y","auto");
                $(".pcountry-active").attr({"type":"hide"});
                $(".pcountry-arrow").removeClass("pcountry-arrowup");
            });
        })
    }

    function partnerShow(){
        var mobileSrollTop=0;
        if($(window).width()>=1024){
            if($(".pdbuypage-listul .pdbuypage-listitem").length>3){
                $(".pdbuypage-listul .pdbuypage-listitem").css("float","left");
            }
            if($.isIos()){
                mobileSrollTop=$(window).scrollTop();
                $("html").addClass("htmlbody_scroll");
            }
        }else{
            if($(".pdbuypage-listul .pdbuypage-listitem").length>2){
                $(".pdbuypage-listul .pdbuypage-listitem").css("float","left");
            }
            mobileSrollTop=$(window).scrollTop();
            $("html").addClass("htmlbody_scroll");
        }

        $("body.huawei-v4").css("overflow-y","hidden");
        $("#pdbuypage").stop().slideDown(300,function(){
             setTimeout(function(){
                $("#pdbuypage").trigger("click");
             },200);

            // 动态设置list高度
            setListHeight();
        });
        $(".pdbuypage-close").on("click",function(){
            $("#pdbuypage").slideUp(300,function(){
                $("body.huawei-v4").css("overflow-y","auto");
                $("html").removeClass("htmlbody_scroll");
                if($(window).width()<1024||$.isIos()){
                    $(window).scrollTop(mobileSrollTop);
                }
                $("#pdbuypage").remove();
            });
        });

    }
}


/*=========== 购买类型 函数-2：third-party-site  ============*/
/*targetType 新页面打开方式，targetUrl：新页面链接，siteCode2：站点代码 */
var fun_thirdParty=function(targetType,targetUrl,siteCode2){
	if(targetUrl.indexOf("http")=="-1"){
		var host=window.location.href.split('/'+siteCode2+'/')[0];
		if(targetUrl.indexOf("/")==0){
			targetUrl=host+targetUrl;
		}else{
			targetUrl=host+"/"+targetUrl;
		}
	}

	// 第三方购买跳转前添加外联弹窗配置 (首页外联弹窗已打开)
	if (enableExternalLinkPopup) {
	    handleExternalLink(targetUrl, targetType);
	} else {
	    if(targetType === '_self'){
            window.location.href = targetUrl;
        }else{
            window.open(targetUrl);
        }
	}
}

/*=========== 购买类型 函数-3：global-buy  ============*/
/**
 * 获取电商站点列表数据
 * @param siteCode2 当前站点
 * @param productId admin产品下PRODUCT OPTIONS/Support v2 Product ID的值
 * @param productName 产品名称
 * @param comb 参数组合
 */
var getECSiteList = function(siteCode2, productId, productName, comb){
    var ecSiteList = [];
    var getECSiteListApi = '/content/dam/huawei-cbg-site/en/worldwide/js/ecommerce-site-list.json';
    $.ajax({
        url: getECSiteListApi,
        type: "GET",
        success:function (data){
            if(data && data.selfEcommerce){
                data.selfEcommerce.forEach(function(item){
                    ecSiteList.push(item.siteCode);
                });
            }
        },
        complete:function(){
            // 不管成功与否 都会执行 全球购国家站点清单渲染
            fun_globalBuy(siteCode2, productId, productName, comb,ecSiteList);
        }
    });
};

/*
 * 站点JSON数组 按照某一属性 字母顺序排序
 * @param siteArr 站点JSON数组
 * @param param 排序属性
 */
var arrSortBySiteNameLetter = function(siteArr,param){
    return siteArr.sort(function(prev,next){
        return prev[param].localeCompare(next[param]);
    })
}

/*
 * 区域站点排序
 * ① 电商站点排在最前，其他站点置后
 * ② 站点以SiteName首字母顺序排序
 * @param areaItem 初始获取的站点清单
 * @param ecSiteList 电商站点清单
 */
var areaSiteSort = function(areaItem,ecSiteList){
    var currAreaECSite=[], // 当前区域电商站
        currAreaOtherSite = []; // 当前区域其他站

    for(var country in areaItem) {
        if (Object.prototype.hasOwnProperty.call(areaItem, country)) {
            areaItem[country].countryName = country;
            if(ecSiteList.length > 0 && ecSiteList.indexOf(country) > -1){
                areaItem[country].isECSite = 'true';
                currAreaECSite.push(areaItem[country])
            }else {
                areaItem[country].isECSite = 'false';
                currAreaOtherSite.push(areaItem[country])
            }
        }
    }
    currAreaECSite = arrSortBySiteNameLetter(currAreaECSite,'siteName');
    currAreaOtherSite = arrSortBySiteNameLetter(currAreaOtherSite,'siteName');
    return currAreaECSite.concat(currAreaOtherSite);
}


/**
 * globalBuy
 * @param siteCode2 当前站点
 * @param productId admin产品下PRODUCT OPTIONS/Support v2 Product ID的值
 * @param productName 产品名称
 * @param comb 参数组合
 * @param ecSiteList 电商站点清单
 */
var fun_globalBuy = function(siteCode2, productId, productName, comb,ecSiteList) {
    var nameforga = comb.nameforga;
    var eventtype = comb.eventtype;
    var bannerposition = comb.bannerposition;
    var targetType = comb.targetType;

    var host = location.href.split('/'+siteCode2+'/')[0];
	if(host.indexOf('.html') > -1){
		host = location.href.split('/'+siteCode2+'.html')[0];
    }

    //请求数据
	var globalBuyUrl = host + "/en/hidden/product/"+productId+"/_jcr_content/content.json";
	$.getJSON(globalBuyUrl,function(res){
	    if(!res || !res.buyInfo){
	        return;
        }
        var globalBuyListHtml = getGlobalBuyListHtml(res.buyInfo);

		// 国家 弹框 数据弹框 (与partner 共用结构)
		$(".pdbuypage-box").addClass("pdbuypage-box-global");
		$(".pdbuypage-title-productname").html(productName).parent().show();
		$(".pdbuypage-title-productplane").html(Mkt.I18n.get("Region to buy"));
		$(".pdbuypage-title-tipinfo").html(Mkt.I18n.get("Please Select Your Country"));
		$(".pdbuypage-listul").html(globalBuyListHtml);
		$(".pdbuypage-footinfo").hide();

		// 全球购弹窗交互事件
        globalBuyPopUpWindowUX();

	});

	// 动态拼接 站点区域+站点清单 DOM
	var getGlobalBuyListHtml = function(buyInfo){
        //遍历区域
        var globalBuyJson = JSON.parse(buyInfo);
        var globalBuyListHtml = "";
        for(var area in globalBuyJson){
            if(Object.prototype.hasOwnProperty.call(globalBuyJson, area)){
                // 获取排序后的站点清单
                var sortedAreaItem = areaSiteSort(globalBuyJson[area],ecSiteList);
                // 动态拼接站点DOM
                var countryStr = getCountryDomStr(sortedAreaItem);

                if(area === 'Middle East / Africa'){
                    // 替换区域名称，同时将其置于区域第一位
                    area = 'Africa and Middle East';
                    globalBuyListHtml = getAreaDomStr(area,countryStr) + globalBuyListHtml;
                }else{
                    globalBuyListHtml += getAreaDomStr(area,countryStr)
                }
            }
        }
        return globalBuyListHtml;
    }
    // 动态拼接区域DOM
    var getAreaDomStr = function(area,countryStr){
        return '<li class="pdbuypage-listitem pdbuypage-listitem-global">'+
            '<p class="pdbuypage-listitem-area">'+ area +'</p>'+
            '<div class="pdbuypage-listitem-country">'+ countryStr+'</div>' +
            '</li>';
    }
    // 动态拼接站点DOM
    var getCountryDomStr = function(sortedAreaItem){
        var countryStr = "";
        for(var country in sortedAreaItem){
            if (Object.prototype.hasOwnProperty.call(sortedAreaItem, country)) {
                countryStr += '<a href="' + sortedAreaItem[country].buyLink;
                countryStr += '" data-selectedglobalbuy="' + sortedAreaItem[country].countryName;
                countryStr += '" data-nameforga="' + nameforga;
                countryStr += '" data-eventtype="' + eventtype;
                countryStr += '" data-bannerposition="' + bannerposition;
                countryStr += '" target="' + targetType;
                countryStr += '" data-parterlink="" class="pdbuypage-listitem-link">';
                countryStr += '<span class="pdbuypage-listitem-name">' + sortedAreaItem[country].localSiteName + '</span>';
                if (sortedAreaItem[country].isECSite === 'true') {
                    countryStr += '<span class="icon icon-cart"></span>';
                }
                countryStr += '</a>';
            }
        }
        return countryStr;
    }
};

// 动态计算list高度
var setListHeight = function(){
    var boxH = $(".pdbuypage-box").height();
    var titleH = $(".pdbuypage-title").is(":visible") ? $(".pdbuypage-title").outerHeight(true) : 0;
    var countryH = $(".pcountry-selbox").is(":visible") ? $(".pcountry-selbox").outerHeight(true) : 0;
    var footerH = $(".pdbuypage-footinfo").is(":visible") ? $(".pdbuypage-footinfo").outerHeight(true) : 0;
    var disclaimerH = $(".pdbuypage-disclaimer").is(":visible") ? $(".pdbuypage-disclaimer").outerHeight(true) : 0;
    $(".pdbuypage-list").height(boxH-titleH-countryH-footerH-disclaimerH);
}

// 全球购弹窗交互事件
var globalBuyPopUpWindowUX = function(){
    var mobileSrollTop=0;
    if($(window).width()<1024){
        mobileSrollTop=$(window).scrollTop();
        $("html").addClass("htmlbody_scroll");
    }else if($.isIos()){
        mobileSrollTop=$(window).scrollTop();
        $("html").addClass("htmlbody_scroll");
    }

    var win_scrollTop = $(window).scrollTop();
    $("body").css({"overflow":"hidden","position":"fixed","top":-win_scrollTop,width: "100%"});

    $("#pdbuypage").stop().slideDown(300,function(){
        setTimeout(function(){
            $("#pdbuypage").trigger("click");
        },200);
        // 动态设置list高度
        setListHeight();
    });

    $(".pdbuypage-close").on("click",function(){
        $("body").css({"overflow":"auto","position":"static",'top':'auto',width: "auto"});
        $("html").removeClass("htmlbody_scroll");
        $(window).scrollTop(win_scrollTop);
        $("#pdbuypage").slideUp(300,function(){
            $("#pdbuypage").remove();
        });
    });
    // 增加区域折叠功能
    $('.pdbuypage-listitem-global .pdbuypage-listitem-area').click(function(){
       $(this).parent().toggleClass('active');
       $(this).siblings('.pdbuypage-listitem-country').slideToggle();
    });
};

/*=========== 购买类型 函数-4：huawei-eCommerce  ============*/
/*targetType：新页面打开方式，targetUrl：新页面链接 */
var fun_ecommerce = function (targetType, targetUrl) {
    if (targetUrl) {
        if (!targetUrl.startsWith("http") && !targetUrl.startsWith("https")) {
            if (targetUrl.indexOf("/content/huawei-cbg-site") > -1) {
                targetUrl = targetUrl.split("/content/huawei-cbg-site")[1];
            }
            targetUrl = dialogLinkHandler(targetUrl);
        }
        if (targetType === "_self") {
            window.location.href = targetUrl;
        } else {
            window.open(targetUrl);
        }
    }
}

/* 产品购买弹框 动态添加 html 代码*/
/*[select]: 放置在buy弹框的 父元素(可不填-即默认添加在.huawei-v4 尾部)*/
var createPopupToBuy=function(select){
	var buyAlertModelHtml='<div id="pdbuypage">'+
				'<div class="pdbuypage-bg"></div>'+
				'<div class="pdbuypage-box">'+
					'<p class="pdbuypage-close">'+
                        '<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><g fill="#3C3C3C" fill-rule="evenodd"><path d="M8 7l17 17-1 1L7 8z"></path><path d="M7 24L24 7l1 1L8 25z"></path></g></svg>'+
                    '</p>'+
					'<div class="pdbuypage-title">'+
						'<p class="pdbuypage-title-product">'+
							'<span class="pdbuypage-title-productplane"></span>'+
							'<span class="pdbuypage-title-productname"></span>'+
						'</p>'+
						'<p class="pdbuypage-title-tipinfo"></p>'+
                        '<p class="pdbuypage-ecommerce-tipinfo">'+
                            '<span class="icon icon-cart"></span>'+
                            '<span class="ec-tip-content"> This icon represents that Huawei e-commerce is available in this country or region.</span>'+
                        '</p>'+
					'</div>'+
					'<div class="pcountry-selbox" style="display:none">'+
                        '<div class="pcountry-bg"></div>'+
                        '<div class="pcountry-country">'+
                            '<p class="pcountry-active" type="hide">'+
                                '<b class="pcountry-countryname"></b>'+
                                '<b class="pcountry-arrow"></b>'+
                            '</p>'+
                            '<ul class="pcountry-list"></ul>'+
                        '</div>'+
                    '</div>'+
					'<div class="pdbuypage-list">'+
						'<ul class="pdbuypage-listul">'+
						'</ul>'+
					'</div>'+
					'<p class="pdbuypage-footinfo">'+
						'<span></span>'+
						'<a href="javascript:;" class="pdbuypage-shopSearch"></a>'+
					'</p>'+
					'<p class="pdbuypage-disclaimer"></p>'+
				'</div>'+
			'</div>';
	var selector=select||".huawei-v4";
	if($(selector+" .pdbuypage").length>0){
		$(selector+" .pdbuypage").remove();
	}
	$(selector).append(buyAlertModelHtml);

	$("#pdbuypage").on("click",function(){
    	$("#pdbuypage").css("z-index",parseInt($("#pdbuypage").css("z-index"))+1);
    })
}

var buyBtnAttributes=function(product,nameforga,position,eventtype){
    if(!product){
        return;
    }
    //如果admin页面没有配置buy button text, 从i18n读
    if(product.buyButtonMode && product.buyButtonMode.buyButtonText && product.buyButtonMode.buyButtonText.length > 0){
        product.buyButtonText = product.buyButtonMode.buyButtonText;
    }else{
        product.buyButtonText = Mkt.I18n.get("Buy");
    }
    //设置buy按钮的data属性
    var attr = {};
    attr["data-pid"] = product.productId;
    attr["data-pname"] = product.marketingName;
    if(product.buyButtonMode){
        attr["data-buybtntype"] = product.buyButtonMode.buttonType;
        attr["data-targettype"] = product.buyButtonMode.openInNewPage ? "_blank" : "_self";
        attr["data-eventtype"] = eventtype;
        attr["data-position"] = position;
        switch(attr["data-buybtntype"]){
            case "none":
                //只有none的情况下buy button 显示Explore
                product.buyButtonText = Mkt.I18n.get("Explore Product");
                attr["data-btnlinkinfo"] = product.detailLink;
                break;
            case "partner":
                attr["data-storelink"] = product.buyButtonMode.storeFinderLink;
                attr["data-btnlinkinfo"] = product.detailLink;
                attr["data-pcountrybeal"] = product.buyButtonMode.partnerCountryFilterEffective;
                attr["data-pcountrytitle"] = product.buyButtonMode.partnerCountryFilterTitle;
                break;
            case "third-party-site":
                attr["data-btnlinkinfo"] = $(window).width() < 1024 ? product.buyButtonMode.mobileThirdPartySiteLink : product.buyButtonMode.thirdPartySiteLink;
                break;
            case "global-buy":
                attr["data-btnlinkinfo"] = product.detailLink;
                break;
            default:
                break;
        }
    }
    //eCommerce data
    attr["data-enableec"] = product.enableEc;
    attr["data-ecpid"] = product.ecProductId;
    attr["data-ecbuylink"] = product.ecBuyLink;
    attr["data-ecopeninnewpage"] = product.ecOpenInNewPage;
    attr["data-onepricedisplay"] = product.onePriceDisplay;

    product.buyButtonAttr = attr;
}

// 电商商品详情数据
var getPrdDisplayDetailInfo = function (productId, asyncValue) {
    var def = $.Deferred();
    var params = {};
    params.api = "queryPrdDisplayDetailInfo";
    params.type = "GET";
    params.data = {};
    params.data.productId = productId;
    if (asyncValue != undefined) {
        params.async = asyncValue;
    }
    params.success = function (data) {
        def.resolve(data);
    }
    params.error = function (xhr, status, error) {
        def.reject(xhr, status, error);
    }

    if (asyncValue != undefined && !asyncValue) {
        return ecCom.ajaxReq(params);
    } else {
        ecCom.ajaxReq(params);
        return def.promise();
    }
}

var ecRenderEcomercePrice = function(){

    var ecommerceProductId =[];

    //list 为组件中所有有效的数据模块,并隱藏掉buy购买按钮，待价格信息返回之后，再显示
    function getComponentEcProductIdAttr(list) {
        var productIdArr = $.map(list,function(element,index){
            var $buyBtn = $(element).find('.global-buy-button').hide();
            var productId = $buyBtn.attr('data-ecpid') || '';
            if($buyBtn.attr('data-enableec') == 'true' && productId != ''){
                //隐藏购买按钮，若有价格显示后再显示
               $buyBtn.addClass('eCommerce-buy');
            }
            return productId;
       })
       return productIdArr;
    }

    function unique(array) {
        return array.filter(function(item, index, array) {
            return array.indexOf(item, 0) === index;
        });
    }

    //获取hero-carousel-component组件productid
    ecommerceProductId = ecommerceProductId.concat(getComponentEcProductIdAttr($('.hero-carousel__slide-wrap')));
    //获取product-card-component组件productid
    ecommerceProductId = ecommerceProductId.concat(getComponentEcProductIdAttr($('.products-card-component .product-card')));
    //获取product-carousel-component组件productid
    ecommerceProductId = ecommerceProductId.concat(getComponentEcProductIdAttr($('.product-carousel-component .product-carousel__product')));

    ecommerceProductId = unique(ecommerceProductId);
    if(ecommerceProductId.length == 0){
        return;
    }
    getMinPriceAndInv(ecommerceProductId).then(
        function(data) {
            // 构造minPriceAndInv Map
            var minPriceAndInvMap = new Map();
            if (data.data.minPriceAndInvList) {
                $.each(data.data.minPriceAndInvList, function(index, minPriceAndInvObj){
                    minPriceAndInvMap.set(minPriceAndInvObj.productId + "", minPriceAndInvObj);
                });
            }
            // 价格新下渲染
            addHeroCarouselEcomPrice(minPriceAndInvMap);
            addProductCardEcomPrice(minPriceAndInvMap);
            addProductCarouselEcomPrice(minPriceAndInvMap);
        },
         function() {
             var blankMap = new Map();
             addHeroCarouselEcomPrice(blankMap);
             addProductCardEcomPrice(blankMap);
             addProductCarouselEcomPrice(blankMap);
         }
    );

    // 首页banner只渲染购买按钮逻辑，不渲染价格信息
    function addHeroCarouselEcomPrice(data){
        var afterInitSlideArr = $('.hero-carousel__slide-wrap');
        $.each(afterInitSlideArr,function (number,element) {
            var $buyBtn = $(element).find('.global-buy-button');
            $($buyBtn).each(function () {
                addHeroCarouselEcBuyBtn($(this),data);
            })

        })
    }
    /*
    *  渲染电商站点 Hero CarouselComponentBuy按钮
    *  特殊注意：一个banner轮播图中配置多个buy按钮
    */
    function addHeroCarouselEcBuyBtn($buyBtn,data){
        var productInfoJson = JSON.parse($buyBtn.prev('[name="buyBtnInfo"]').val() || '{}');

        // Step1 判断是否启用【Enable eCommerce Button Setting】 和 是否有 购买页（hasPcp)
        var enableEc = productInfoJson.enableEc === 'true' ? true : false;
        if(!enableEc){
            return;
        }

        // Step2 判断是否启用【Enable Amin Page Price Setting】
        var ecAdminSetting = productInfoJson.ecAdminSetting === 'true' ? true : false;
        if(ecAdminSetting){
            $buyBtn.show();
            return;
        }

        // Step3 依据纯电商接口数据渲染buy按钮
        var productId = $buyBtn.attr('data-ecpid') || '';
        var minPriceAndInvData = data.get(productId.trim()) || {};
        window.handleBuyButtonTextForECommerceSite(ecAdminSetting, enableEc, minPriceAndInvData, $buyBtn);
    }
    /*
    * 渲染电商站点 Product Card Component价格和Buy按钮
    * 默认，buy按钮隐藏
    */
    function addProductCardEcomPrice(minPriceAndInvMap){
        var productCards = $('.products-card-component .product-card');
        $.each(productCards, function(index, productCardEle){
            var $buyBtn = $(productCardEle).find('.global-buy-button');
            var $productPrice = $(productCardEle).find('.product-card__price');
            ecSitePriceAndBuyBtn($buyBtn,$productPrice,minPriceAndInvMap);
        });
    }
    /*
    * 渲染电商站点 Product Carousel Component 价格和Buy按钮
    * 默认，buy按钮隐藏
    */
    function addProductCarouselEcomPrice(minPriceAndInvMap){
        var productCarouselSlides = $('.product-carousel-component .product-carousel__product');
        $.each(productCarouselSlides, function(index, productCarouselSlideEle){
            var $buyBtn = $(productCarouselSlideEle).find('.global-buy-button');
            var $productPrice = $(productCarouselSlideEle).find('.product-carousel__price');
            ecSitePriceAndBuyBtn($buyBtn,$productPrice,minPriceAndInvMap);
        });

    }
    /*
    * 最新价格和buy按钮逻辑处理
    * 涉及组件：Product Card Component 和 Product Carousel Component
    * @param $buyBtn：buy按钮DOM对象
    * @param $productPrice：价格DOM对象
    * @param minPriceAndInvMap：电商价格接口数据Map
    */
    function ecSitePriceAndBuyBtn($buyBtn,$productPrice,minPriceAndInvMap){
        // 产品admin配置的json数据
        var productInfoJson = JSON.parse($buyBtn.prev('.buy-btn-info').val() || '{}');

        // 未启用【Enable eCommerce Button Setting】，则不显示 价格和购买按钮，逻辑结束
        var enableEc = productInfoJson.enableEc === 'true' ? true : false;
        if(!enableEc){
            return;
        }

        // 是否启用【Enable Amin Page Price Setting】
        var ecAdminSetting = productInfoJson.ecAdminSetting === 'true' ? true : false;
        // 是否有 购买页（hasPcp)
        var hasPcp = productInfoJson.hasPcp || false;
        // 是否只显示价格
        var onePriceDisplay = productInfoJson.onePriceDisplay || false;

        if(ecAdminSetting){
            // 查看Admin price，若配置则显示
            var adminPrice = productInfoJson.price || 0;
            if(adminPrice){
                var priceHtml = createAdminPriceHtml(window.ecCurrency(adminPrice),onePriceDisplay);
                $productPrice.addClass("has-price-info").html(priceHtml);
            }
            // buy按钮展示逻辑
            if(hasPcp){
                $buyBtn.show();
            }
        }else{
            // 获取当前产品的 接口价格数据
            var productId = $buyBtn.attr('data-ecpid') || "";
            var productMinPriceAndInv = minPriceAndInvMap.get(productId.trim()) || {};
            if (productMinPriceAndInv && !$.isEmptyObject(productMinPriceAndInv)) {
                // 集成电商价格展示逻辑
                if(!productMinPriceAndInv.sureDepositPrice) {
                    let priceHtml = createPriceHtml(productMinPriceAndInv, productInfoJson);
                    $productPrice.addClass("has-price-info").html(priceHtml);
                }

                // buy按钮展示逻辑
                if(hasPcp){
                    window.handleBuyButtonTextForECommerceSite(ecAdminSetting, enableEc, productMinPriceAndInv, $buyBtn);
                }
            }
        }
    }
    /*
    * 针对Admin Price做格式渲染
    */
    function createAdminPriceHtml(adminPrice, onePriceDisplay) {
        // from文本
        var fromBehind = "";
        var fromFront = "";
        if (showFrom && !onePriceDisplay) {
            if (putFromFront) {
                fromFront = ecCom.I18n.get('ec_from') + " ";
            } else {
                fromBehind = " " + ecCom.I18n.get('ec_from');
            }
        }

        // pc/wap price html生成
        var priceHtml = "";
        if (window.innerWidth > 1199.98) {
            priceHtml = '<div class="ec-price">'+
                '<span class="from-front">' + fromFront + '</span>'+
                '<p class="sale-price">' +
                adminPrice +
                '<span class="from-behind">' + fromBehind + '</span>' +
                '</p></div>';
        } else {
            priceHtml = '<div class="ec-price">'+
                '<p class="sale-price">' +
                '<span class="from-front">' + fromFront + '</span>' +
                adminPrice +
                '<span class="from-behind">' + fromBehind + '</span>' +
                '</p></div>';
        }
        return priceHtml;
    }
    /*
    * 对电商接口价格数据 渲染
    */
    function createPriceHtml(minPriceAndInvData, buyButtonInfo) {
        // from文本
        var fromBehind = "";
        var fromFront = "";
        if (showFrom && !buyButtonInfo.onePriceDisplay) {
            if (putFromFront) {
                fromFront = ecCom.I18n.get('ec_from') + " ";
            } else {
                fromBehind = " " + ecCom.I18n.get('ec_from');
            }
        }

        // 分期信息
        var hasInstallment = "";
        var installmentText = "";
        if (minPriceAndInvData.installmentInfos) {
            hasInstallment = "has-installment";
            if(enableInstallmentCfg) {
                // 当开启分期显示配置时，依配置进行分期文本组装
                installmentText = window.ecInstallmentFullText(minPriceAndInvData.installmentInfos);
            }else{
                var maxInstallmentNum = minPriceAndInvData.installmentInfos.sort(function (a, b) {
                    return b.num - a.num;
                })[0].num;

                if (site === "UK" || site === "DE" ||  site === "ES") {
                    installmentText = ecCom.I18n.get("ec_installment_or") + ' ' + ecCom.I18n.get("ec_finance_available");
                } else {
                    installmentText = ecCom.I18n.get("ec_installment_or") + ' ' + ecCom.I18n.get("ec_payment_in_installments", [maxInstallmentNum]);
                }
            }
        }

        var salePrice = ecCurrency(minPriceAndInvData.minUnitPrice);
        var orderPriceWithHtml = getOrderPriceHtml(minPriceAndInvData.minUnitPrice, minPriceAndInvData.minOrderPrice);
        // pc/wap price html生成
        var priceHtml = "";
        if (window.innerWidth > 1199.98) {
            priceHtml = '<div class="ec-price">'+
                '<span class="from-front">' + fromFront + '</span>'+
                '<p class="sale-price">' +
                    salePrice +
                    '<span class="from-behind">' + fromBehind + '</span>' +
                '</p>'+
                orderPriceWithHtml +
                '<span class="installment ' + hasInstallment + '">' + installmentText + '</span>' +
            '</div>';
        } else {
            priceHtml = '<div class="ec-price">'+
                '<p class="sale-price">' +
                    '<span class="from-front">' + fromFront + '</span>' +
                    salePrice +
                    '<span class="from-behind">' + fromBehind + '</span>' +
                    orderPriceWithHtml +
                '</p>'+
                '<span class="installment ' + hasInstallment + '">' + installmentText + '</span>' +
            '</div>';

        }

        return priceHtml;
    }
}

function getOrderPriceHtml(salePrice, orderPrice) {
    var originalPriceHtml = "";
    if (salePrice != orderPrice) {
        var originalPrice = ecCurrency(orderPrice);
        // RRP 注释信息
        var tips = "";
        if (rrpTips) {
            tips = '<strong class="rrp-tips"></strong>';
        }
        // 是否要展示划线样式
        if (enableScribes) {
            // 显示划线样式
            originalPriceHtml = enableRRP ? '<span>'+RRPText+'</span>' + '<span class="original-price" style="text-decoration:line-through;">' + originalPrice + tips + '</span>'
                                          : '<span class="original-price" style="text-decoration:line-through;">' + originalPrice + '</span>';
        } else {
            // 不显示划线样式
            originalPriceHtml = enableRRP ? '<span>'+RRPText+'</span>' + '<span class="original-price">' + originalPrice + tips + '</span>'
                                          : '<span class="original-price">' + originalPrice + '</span>';
        }
    }

    return originalPriceHtml;
}

$(function () {
	$(document).on("click",".global-buy-button",function(e){
        e.preventDefault();
        var productInfoJson = ($(this).prev("input[name='buyBtnInfo']") || {}).val();
        var productInfo = JSON.parse(productInfoJson);
        if(productInfo != null) {
            var position = $(this).attr('data-position');
            var eventtype = $(this).attr('data-eventtype');
            var nameforga = $(this).attr('data-nameforga');
            var bannerName = eventtype== 'navi' ? nameforga : (nameforga ? nameforga + "_" + productInfo.marketingName : productInfo.marketingName);
            buyBtnAttributes(productInfo,nameforga,position,eventtype);
            for (var name in productInfo.buyButtonAttr){
                $(this).attr(name, productInfo.buyButtonAttr[name]);
            }
            var storeFinder = {showStoreFinder: productInfo.showStoreFinder, openStoreFinderInNewPage: productInfo.openStoreFinderInNewPage, storeFinderLink: productInfo.storeFinderLink};
            buyFeature($(this), storeFinder, productInfo.disclaimer,bannerName);
        }
    });
})

var RESULT_SUCCESS_CODE = 0;

// 批量产品价格和库存接口数据返回Map {productId:PriceAndInventoryInformation}
var currentPageMinPriceAndInvMap = new Map();

// 批量产品相关子产品接口数据返回Map {productId:PrdDisplayInfos}
var currentPagePrdDisplayInfosMap = new Map();

// 批量产品SKU接口数据返回Map
var currentPagePrdSkuDataMap = new Map();

// 获取电商价格接口信息
var currentPageMinPriceAndInvMapFun = function(){
    var productIdList = [];
    var productId;
    $(".global-eCommerce-price[data-interfacename='queryMinPriceAndInv']:not([data-async=true])").each(function () {
        productId = $(this).attr('data-ecproductid') || "";
        if ("" != productId && productIdList.indexOf(productId.trim()) == -1) {
            productIdList.push(productId.trim());
        }
    });
    if(productIdList && productIdList.length > 0){
        /* 同步调用ajax方法*/
        var data = getMinPriceAndInv(productIdList, false);
        if(data && RESULT_SUCCESS_CODE === data.resultCode) {
            /* 成功返回数据 */
            var minPriceAndInvList = data.data.minPriceAndInvList;
            if (minPriceAndInvList && minPriceAndInvList.length > 0) {
                $.each(minPriceAndInvList, function (i) {
                    currentPageMinPriceAndInvMap.set(minPriceAndInvList[i].productId.toString(), minPriceAndInvList[i]);
                });
            }
        } else {
            /* 返回数据失败 */
            console.error(data.message + ' : queryMinPriceAndInv');
        }
    }
};

/**
 * 以组件为单位，查询组件内的产品价格信息
 * 不处理cn站点，仅支持电商站点，为currentPageMinPriceAndInvMapFun的替代异步调用方法
 * @param $componentEle 组件dom的jQuery封装对象
 * @returns {Promise<Array>} 返回用Promise包装的包含价格信息的数组对象
 */
function asyncGetAllProductsInfoInComponent ($componentEle) {
    return new Promise((resolve) => {
        if(!$componentEle.length){
            resolve([]);
            return;
        }

        let filterClass = '.global-eCommerce-price[data-interfacename=queryMinPriceAndInv][data-async=true]';
        let $prodItems = $componentEle.find(filterClass);

        if(!$prodItems.length){
            resolve([]);
            return;
        }

        if (typeof currentPageMinPriceAndInvMap === 'undefined') {
            window.currentPageMinPriceAndInvMap = new Map();
        }

        let allProductIds = [];
        $prodItems.each(function() {
            let productId = ($(this).attr('data-ecproductid') || '').trim();

            if (productId && allProductIds.indexOf(productId) === -1 && !currentPageMinPriceAndInvMap.has(productId)) {
                allProductIds.push(productId);
            }
        });

        if(!allProductIds.length) {
            resolve([]);
            return;
        }

        getMinPriceAndInv(allProductIds, true)
            .then((data) => {
                if(data && RESULT_SUCCESS_CODE === data.resultCode) {
                    let resDataList = data.data.minPriceAndInvList;

                    if (resDataList && resDataList.length > 0) {
                        $.each(resDataList,  (i) => {
                            currentPageMinPriceAndInvMap.set(resDataList[i].productId.toString(), resDataList[i]);
                        });
                    }

                    resolve(resDataList);
                }else {
                    resolve([]);
                }
            })
            .catch(() => resolve([]));
    });
}

// 批量电商价格、库存、分期信息
function getMinPriceAndInv(productIdArr, asyncValue, isQuerySBomId) {
    var def = $.Deferred();

    var params = {};
    params.api = "queryMinPriceAndInv";
    params.type = "GET";
    params.data = {};
    params.data.productIds = productIdArr;

    if(typeof isQuerySBomId === 'boolean' && isQuerySBomId){
        params.data.needQueryColorDeposit = true;
    }

    if (asyncValue != undefined) {
        params.async = asyncValue;
    }
    params.success =  (data) => def.resolve(data);

    params.error =  (xhr, status, error) => def.reject(xhr, status, error);

    if (asyncValue != undefined && !asyncValue) {
        return Mkt.Util.ajaxReq(params);
    } else {
        Mkt.Util.ajaxReq(params);
        return def.promise();
    }
};

// 获取批量产品相关子产品接口数据
var currentPagePrdDisplayInfosMapFun = function(){
    var productIdList = [];
    var productId;
    $("[data-vmallbtn='true']").each(function() {
        productId = $(this).attr('data-ecproductid') || '';
        if ('' != productId && productIdList.indexOf(productId.trim()) == -1) {
            productIdList.push(productId.trim());
        }
    });
    if(productIdList && productIdList.length > 0){
        /* 同步调用ajax方法*/
        var data = getPrdDisplayInfos(productIdList, false);
        if(data && data.resultCode === RESULT_SUCCESS_CODE) {
            /* 成功返回数据 */
            var prdDisplayInfos = data.data.prdDisplayInfos;
            if (prdDisplayInfos && prdDisplayInfos.length > 0) {
                $.each(prdDisplayInfos, function (i) {
                    currentPagePrdDisplayInfosMap.set(prdDisplayInfos[i].disPrdId.toString(), prdDisplayInfos[i]);
                });
            }
        } else {
            /* 返回数据失败 */
            console.error(data.message + ' : queryPrdDisplayInfos');
        }
    }
};

// 获取批量产品sku详情接口数据
var currentPagePrdSkuDataMapFun = function(){
    var sbomCodeList = [];
    var prdSbomCode;
    $('.promo-integration-item.promo-eCommerce-integration').each(function() {
        prdSbomCode = $(this).attr('data-ecsbomcode') || '';
        if ('' != prdSbomCode && sbomCodeList.indexOf(prdSbomCode.trim()) == -1) {
            sbomCodeList.push(prdSbomCode.trim());
        }
    });
    if(sbomCodeList && sbomCodeList.length > 0){
        /* 同步调用ajax方法*/
        var data = getPrdSkuDatas(sbomCodeList, false);
        if(data && data.resultCode === RESULT_SUCCESS_CODE) {
            var sbomDataList = data.data.sbomList;
            if (sbomDataList && sbomDataList.length > 0) {
                $.each(sbomDataList, function (i) {
                    currentPagePrdSkuDataMap.set(sbomDataList[i].sbomCode.toString(), sbomDataList[i]);
                });
            }
        } else {
            console.error(data.message + ' : queryPrdSkuDatas');
        }
    }
};

// 批量电商商品和子商品详情数据
var getPrdDisplayInfos = function (productIdArr, asyncValue) {
    var def = $.Deferred();

    var params = {};
    params.api = "queryPrdDisplayInfos";
    params.type = "GET";
    params.data = {};
    params.data.productIds = productIdArr;
    if (asyncValue != undefined) {
        params.async = asyncValue;
    }
    params.success = function (data) {
        def.resolve(data);
    }
    params.error = function (xhr, status, error) {
        def.reject(xhr, status, error);
    }

    if (asyncValue != undefined && !asyncValue) {
        return Mkt.Util.ajaxReq(params);
    } else {
        Mkt.Util.ajaxReq(params);
        return def.promise();
    }
};

// 批量取得电商sku商品数据
var getPrdSkuDatas = function (sbomCodeArr, asyncValue) {
    var def = $.Deferred();
    var params = {};
    params.api = "querySbomByCodes";
    params.type = "GET";
    params.data = {};
    params.data.sbomCodes = sbomCodeArr;
    if (asyncValue != undefined) {
        params.async = asyncValue;
    }
    params.success = function (data) {
        def.resolve(data);
    }
    params.error = function (xhr, status, error) {
        def.reject(xhr, status, error);
    }

    if (asyncValue != undefined && !asyncValue) {
        return Mkt.Util.ajaxReq(params);
    } else {
        Mkt.Util.ajaxReq(params);
        return def.promise();
    }
};

// 批量产品价格数据返回Map
var currentPageProductMinPriceSkuMap = new Map();

// 获取电商价格接口信息
var currentPageProductMinPriceSkuMapFun = function(){
    var productIds = [];
    var productId;
    // 仅开启的集成价格
    $(".global-eCommerce-price[data-interfacename='queryMinPriceAndInv']").each(function() {
        productId = $(this).attr('data-ecproductid') || '';
        if ('' != productId && productIds.indexOf(productId.trim()) == -1) {
            productIds.push(productId.trim());
        }
    });

    // 仅开启了vmall btn
    $("[data-vmallbtn='true']").each(function() {
        productId = $(this).attr('data-ecproductid') || '';
        if ('' != productId && productIds.indexOf(productId.trim()) == -1) {
            productIds.push(productId.trim());
        }
    });

    if(productIds && productIds.length > 0){
        /* 同步调用ajax方法*/
        var result = getProductMinPriceSku(productIds, false);
        if(result && RESULT_SUCCESS_CODE === result.resultCode) {
            /* 成功返回数据 */
            var productMinPriceList = result.data.prdDisplayInfos;
            if (productMinPriceList && productMinPriceList.length > 0) {
                $.each(productMinPriceList, function (i) {
                    currentPageProductMinPriceSkuMap.set(productMinPriceList[i].disPrdId.toString(), productMinPriceList[i]);
                });
            }
        } else {
            /* 返回数据失败 */
            console.error(result.message + ' : queryMinPriceSku');
        }
    }
};

// 批量查询商品电商价格的最低价格
var getProductMinPriceSku = function (productIdArr, asyncValue) {
    var def = $.Deferred();

    var params = {};
    params.api = "queryMinPriceSku";
    params.type = "GET";
    params.data = {};
    params.data.productIds = productIdArr;
    if (asyncValue != undefined) {
        params.async = asyncValue;
    }
    params.success = function (data) {
        def.resolve(data);
    }
    params.error = function (xhr, status, error) {
        def.reject(xhr, status, error);
    }

    if (asyncValue != undefined && !asyncValue) {
        return Mkt.Util.ajaxReq(params);
    } else {
        Mkt.Util.ajaxReq(params);
        return def.promise();
    }
};

function componentPreprocessor(componentName, obj) {
    if (!(typeof componentName === 'string' && componentName)) {
        return Promise.resolve();
    }

    window.__outerHandler = window.__outerHandler || [];

    const fieldName = 'handler';
    const hasTasks = Array.isArray(window.__outerHandler) && window.__outerHandler.length;

    if (hasTasks) {
        return window.__outerHandler.reduce((promise, curTaskHandler) => {
            if (curTaskHandler.componentName !== componentName) {
                return promise;
            }

            return promise.then((result) => curTaskHandler[fieldName].call(obj, result)).catch(() => {
            });
        }, Promise.resolve());
    }

    return Promise.resolve();
}
var EVENT_TYPE_EMAIL_SUBMIT_SUCCESS = "emailSubSuccess";
var EVENT_TYPE_EMAIL_SUBMIT_FAIL = "emailSubFail";
var EVENT_TYPE_SPAREPART_PRICE = "supportSparepartPrice";
var EVENT_TYPE_M2M_DISTRIBUTOR = "m2mDistributor";
var EVENT_TYPE_CONTACT_US_FEEDBACK = "contactUsFeedback";
var EVENT_TYPE_CONTACT_US_HOTLINE = "contactUsHotline";
var EVENT_TYPE_CONTACT_US_TECHNICAL = "contactUsTechnical";
var EVENT_TYPE_APPOINTMENT_SERVICE = "appointmentServiceSuccess";
var EVENT_TYPE_FIND_A_STORE = "findAStore";
var EVENT_TYPE_SUPPORT_SEARCH_AND_RESULT = "supportSearchAndResultSuccess";
var EVENT_TYPE_PRODUCT_FILTER = "headerProductFilter";
var EVENT_TYPE_PRODUCT_COMPARE_ADD = "productCompareAdd";
var EVENT_TYPE_PRODUCT_CANCEL_CLOSE = "productCancelClose";
var EVENT_TYPE_PRESS_NEWS_LIST = "pressNewsList";
var EVENT_TYPE_PRESS_NEWS_LIST_SEARCH = "pressNewsListSearch";
var EVENT_TYPE_PRESS_AWARD_LIST = "pressAwardList";
var EVENT_TYPE_PRESS_VIDEO_LIST = "pressVideoList";
var EVENT_TYPE_PDP_FAQ_SEARCH = "supportPdpFaqSearch";
var EVENT_TYPE_FAQ_PDP_FEEDBACK = "faqDetailpageIsthisContentHelpful";
var EVENT_TYPE_POST_REPAIR = "submitPostalRepairApointment";
var EVENT_TYPE_FIND_SERVICE_CENTER_COUNTRY_CITY = "submitFindServiceByCountryCity";
var EVENT_TYPE_FIND_SERVICE_CENTER_DISTANCE = "submitFindServiceByAddressDistance";
var EVENT_TYPE_VIDEO_CLOSED = "videoClosed";
var EVENT_TYPE_SEARCH_RECYCLING_POINT = "searchRecyclingPoint";
var EVENT_TYPE_SP_LANDING_PAGE_SEARCH = "supportLandingPageSearch";
var EVENT_AUTO_SUGGEST_SEARCH = "autoSuggestSearch";
var EVENT_PURE_SEARCH = "pureSearch";
var EVENT_SEARCH_BY_DROPDOWN_FILTER = "searchByDropdownFilter";
var EVENT_COMPARISON_FILTER = "comparisonFilter";
var EVENT_CLICK_FIND_SERVICE_CENTER = "clickOnSupportServiceCenterResult";
var EVENT_TYPE_SHOW_CONTENT = "showContent";
var EVENT_TYPE_HIDE_CONTENT = "hideContent";
var EVENT_TYPE_HOTSPOTS_CLICK = "hotspotsClicked";
var EVENT_TYPE_PS_PRODUCT_LISTING_SEARCH = "supportProductListingSearch";
var EVENT_TYPE_SUPPORT_PDP_DROPDOWN = "supportPdpDropdown";
var EVENT_TYPE_HOT_SEARCH = "HotSearch";
var EVENT_TYPE_SUPPORT_SEARCH = "SupportSearch";
var EVENT_TYPE_OPEN_MENU_FIRST_LEVEL = "openMenuFirstLevel";
var EVENT_TYPE_OPEN_MENU_SECOND_LEVEL = "openMenuSecondLevel";
var EVENT_TYPE_SUPPORT_SEARCH_AUTO_SUGGEST = "supportSearchAutoSuggest";
var EVENT_TYPE_NEWS_LIST_LOAD_MORE = "newsListLoadMore";
var EVENT_TYPE_PRODUCT_MENU_MODULE_LOAD_MORE = "productMenuModuleLoadMore";
var EVENT_TYPE_SEARCH_RECYCLING_STORE_CLICK = "searchRecyclingStoreClick";
/*add 12-28*/
var EVENT_TYPE_EXPRESS_REPAIRE_SERVICE_MODIFY = "expressRepaireServiceModify";
var EVENT_TYPE_EXPRESS_REPAIRE_SERVICE_SUBMIT = "expressRepaireServiceSubmit";
var EVENT_TYPE_REPAIR_STATUS_INQUIRY_SUMBIT = "repairStatusInquirySumbit";
var EVENT_TYPE_DOOR_TO_DOOR_SERVICE_SUBMIT = "doorToDoorServiceSubmit";
var EVENT_TYPE_APPOINTMENT_SERVICE_MODIFY  = "appointmentServiceModify";
var EVENT_TYPE_APPOINTMENT_SERVICE_SUBMIT = "appointmentServiceSubmit";
var EVENT_TYPE_WARRANTY_QUERY_SUBMIT ="warrantyQuerySubmit";
var EVENT_TYPE_TOPIC_PAGE_INTERACTIONS = "topicPageInteractions";
var EVENT_TYPE_TOPIC_LIST_SITE_SEARCH = "topicListSiteSearch";
var EVENT_TYPE_MAIL_SERVICE_SUBMIT = "mailServiceSubmit";
var EVENT_TYPE_HOME_PAGE_SITE_SEARCH = "homePageSiteSearch";
var EVENT_TYPE_SPAREPARTS_PRICE_SUBMIT = "sparePartsPriceSubmit";
var EVENT_TYPE_USER_CENTER_ADD = "userCenterAdd";
var EVENT_TYPE_USER_CENTER_MODIFY = "userCenterModify";
var EVENT_TYPE_USER_CENTER_DELETE = "userCenterDelete";
var pageProductGTMV4 =  window.digitalData.product?window.digitalData.product.productInfo:""

function analyticsSubmit(cat, act, lab, customEventType) {
	if (!cat || !act || !lab) {
		return;
	}

	// add values into datalayer (4 default properties)
	var eventObj = {
		cat: cat,
		act: act,
		lab: lab,
		customEventType: customEventType
	};

	// additional properties will be added in json format
	for (var i = 4; i < arguments.length; i++) {
		for (var key in arguments[i]) {
			eventObj[key] = arguments[i][key];
		}
	}

	DataLayerUtil.addEvent(eventObj);
	//trigger custom jquery event at the document level
	DataLayerUtil.triggerEvent(customEventType);
}

var DataLayerUtil = {
	addEvent: function (obj) {
		// adds interaction (api/js) data into datalayer
		window.digitalData.event.push({
			eventInfo: obj
		});
	},
	getEvent: function (eventType, item) {
		// gets the last interaction (api/js) data from datalayer
		var val = null;
		try {
			if (digitalData && digitalData.event && digitalData.event instanceof Array) {
				var events = digitalData.event;
				var length = events.length;
				for (var i = length - 1; i >= 0; i--) {
					var ei = events[i].eventInfo;
					if (ei.customEventType == eventType && ei[item]) {
						val = getContent(ei[item].toString()).trim();
						break;
					}
				}
			}
		} catch (err) {
		}
		return val;
	},
	triggerEvent: function (eventName) {
		// triggers custom jquery event for listeners to execute or fire tags
		$(document).trigger(eventName);
	}
};

/**
 * 设置视频播放的datalayer
 * @param videoName
 * @param videoStep
 * @param productMktName
 * @param productCategory
 * @returns
 */
function pushVideoDatalayer(videoName, videoStep, productMktName, productCategory) {
	window.dataLayer && window.dataLayer.push({
        "event": "video",
        "videoStep": videoStep,
        "videoName": videoName,
        "productMktName": productMktName ? productMktName :'',
        "productCategory": productCategory ? productCategory : '',
        "clickName": "video " + videoName + "_" + videoStep,
        "clickType": "action"
    })
}
function getCookie(cname) {
    var name = cname + "=";
    var cookieStr = document.cookie;
    var ca = cookieStr.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return decodeURIComponent(c.substring(name.length, c.length));
        }
    }
    return '';
}

function setCookie(cname, cvalue, exdays) {
    /** {object} d - The date of now. */
    var d = new Date(),
        /** {string} expires - The date of expiration. */
        expires = "";
    if(exdays){
        /** Set in milliseconds d + exdays. */
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        /** Convert expires in UTC format. */
        expires = "expires=" + d.toUTCString();
    }
    /** Add the new cookie to document.cookie. */
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";

    return "";
}


/*
*contact us v2 懒加载
*
*/
$(document).ready(function () {
    if($('.contact-us-v2').length > 0){
        Mkt.Util.imgLazyLoad($('.contact-us-v2 img.img-lazy'));
    }
})
/*! jQuery & Zepto Lazy v1.7.10 - http://jquery.eisbehr.de/lazy - MIT&GPL-2.0 license - Copyright 2012-2018 Daniel 'Eisbehr' Kern */
!function(t,e){"use strict";function r(r,a,i,u,l){function f(){L=t.devicePixelRatio>1,i=c(i),a.delay>=0&&setTimeout(function(){s(!0)},a.delay),(a.delay<0||a.combined)&&(u.e=v(a.throttle,function(t){"resize"===t.type&&(w=B=-1),s(t.all)}),u.a=function(t){t=c(t),i.push.apply(i,t)},u.g=function(){return i=n(i).filter(function(){return!n(this).data(a.loadedName)})},u.f=function(t){for(var e=0;e<t.length;e++){var r=i.filter(function(){return this===t[e]});r.length&&s(!1,r)}},s(),n(a.appendScroll).on("scroll."+l+" resize."+l,u.e))}function c(t){var i=a.defaultImage,o=a.placeholder,u=a.imageBase,l=a.srcsetAttribute,f=a.loaderAttribute,c=a._f||{};t=n(t).filter(function(){var t=n(this),r=m(this);return!t.data(a.handledName)&&(t.attr(a.attribute)||t.attr(l)||t.attr(f)||c[r]!==e)}).data("plugin_"+a.name,r);for(var s=0,d=t.length;s<d;s++){var A=n(t[s]),g=m(t[s]),h=A.attr(a.imageBaseAttribute)||u;g===N&&h&&A.attr(l)&&A.attr(l,b(A.attr(l),h)),c[g]===e||A.attr(f)||A.attr(f,c[g]),g===N&&i&&!A.attr(E)?A.attr(E,i):g===N||!o||A.css(O)&&"none"!==A.css(O)||A.css(O,"url('"+o+"')")}return t}function s(t,e){if(!i.length)return void(a.autoDestroy&&r.destroy());for(var o=e||i,u=!1,l=a.imageBase||"",f=a.srcsetAttribute,c=a.handledName,s=0;s<o.length;s++)if(t||e||A(o[s])){var g=n(o[s]),h=m(o[s]),b=g.attr(a.attribute),v=g.attr(a.imageBaseAttribute)||l,p=g.attr(a.loaderAttribute);g.data(c)||a.visibleOnly&&!g.is(":visible")||!((b||g.attr(f))&&(h===N&&(v+b!==g.attr(E)||g.attr(f)!==g.attr(F))||h!==N&&v+b!==g.css(O))||p)||(u=!0,g.data(c,!0),d(g,h,v,p))}u&&(i=n(i).filter(function(){return!n(this).data(c)}))}function d(t,e,r,i){++z;var o=function(){y("onError",t),p(),o=n.noop};y("beforeLoad",t);var u=a.attribute,l=a.srcsetAttribute,f=a.sizesAttribute,c=a.retinaAttribute,s=a.removeAttribute,d=a.loadedName,A=t.attr(c);if(i){var g=function(){s&&t.removeAttr(a.loaderAttribute),t.data(d,!0),y(T,t),setTimeout(p,1),g=n.noop};t.off(I).one(I,o).one(D,g),y(i,t,function(e){e?(t.off(D),g()):(t.off(I),o())})||t.trigger(I)}else{var h=n(new Image);h.one(I,o).one(D,function(){t.hide(),e===N?t.attr(C,h.attr(C)).attr(F,h.attr(F)).attr(E,h.attr(E)):t.css(O,"url('"+h.attr(E)+"')"),t[a.effect](a.effectTime),s&&(t.removeAttr(u+" "+l+" "+c+" "+a.imageBaseAttribute),f!==C&&t.removeAttr(f)),t.data(d,!0),y(T,t),h.remove(),p()});var m=(L&&A?A:t.attr(u))||"";h.attr(C,t.attr(f)).attr(F,t.attr(l)).attr(E,m?r+m:null),h.complete&&h.trigger(D)}}function A(t){var e=t.getBoundingClientRect(),r=a.scrollDirection,n=a.threshold,i=h()+n>e.top&&-n<e.bottom,o=g()+n>e.left&&-n<e.right;return"vertical"===r?i:"horizontal"===r?o:i&&o}function g(){return w>=0?w:w=n(t).width()}function h(){return B>=0?B:B=n(t).height()}function m(t){return t.tagName.toLowerCase()}function b(t,e){if(e){var r=t.split(",");t="";for(var a=0,n=r.length;a<n;a++)t+=e+r[a].trim()+(a!==n-1?",":"")}return t}function v(t,e){var n,i=0;return function(o,u){function l(){i=+new Date,e.call(r,o)}var f=+new Date-i;n&&clearTimeout(n),f>t||!a.enableThrottle||u?l():n=setTimeout(l,t-f)}}function p(){--z,i.length||z||y("onFinishedAll")}function y(t,e,n){return!!(t=a[t])&&(t.apply(r,[].slice.call(arguments,1)),!0)}var z=0,w=-1,B=-1,L=!1,T="afterLoad",D="load",I="error",N="img",E="src",F="srcset",C="sizes",O="background-image";"event"===a.bind||o?f():n(t).on(D+"."+l,f)}function a(a,o){var u=this,l=n.extend({},u.config,o),f={},c=l.name+"-"+ ++i;return u.config=function(t,r){return r===e?l[t]:(l[t]=r,u)},u.addItems=function(t){return f.a&&f.a("string"===n.type(t)?n(t):t),u},u.getItems=function(){return f.g?f.g():{}},u.update=function(t){return f.e&&f.e({},!t),u},u.force=function(t){return f.f&&f.f("string"===n.type(t)?n(t):t),u},u.loadAll=function(){return f.e&&f.e({all:!0},!0),u},u.destroy=function(){return n(l.appendScroll).off("."+c,f.e),n(t).off("."+c),f={},e},r(u,l,a,f,c),l.chainable?a:u}var n=t.jQuery||t.Zepto,i=0,o=!1;n.fn.Lazy=n.fn.lazy=function(t){return new a(this,t)},n.Lazy=n.lazy=function(t,r,i){if(n.isFunction(r)&&(i=r,r=[]),n.isFunction(i)){t=n.isArray(t)?t:[t],r=n.isArray(r)?r:[r];for(var o=a.prototype.config,u=o._f||(o._f={}),l=0,f=t.length;l<f;l++)(o[t[l]]===e||n.isFunction(o[t[l]]))&&(o[t[l]]=i);for(var c=0,s=r.length;c<s;c++)u[r[c]]=t[0]}},a.prototype.config={name:"lazy",chainable:!0,autoDestroy:!0,bind:"load",threshold:500,visibleOnly:!1,appendScroll:t,scrollDirection:"both",imageBase:null,defaultImage:"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",placeholder:null,delay:-1,combined:!1,attribute:"data-src",srcsetAttribute:"data-srcset",sizesAttribute:"data-sizes",retinaAttribute:"data-retina",loaderAttribute:"data-loader",imageBaseAttribute:"data-imagebase",removeAttribute:!0,handledName:"handled",loadedName:"loaded",effect:"show",effectTime:0,enableThrottle:!0,throttle:250,beforeLoad:e,afterLoad:e,onError:e,onFinishedAll:e},n(t).on("load",function(){o=!0})}(window);
jwplayer.key = "uG/VHSbjrT7/udRHL0vnyr5GjyFu3WZQ9+VRUxia1vs=";
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).mktHelpers=e()}(this,(function(){"use strict";var t={throttle:function(t,e){if("function"==typeof t){var n,o,i=e||100,f=Date.now(),u=function(){t.apply(n,o)};return function(){n=this,o=arguments;var t=Date.now();t-f-i>=0&&(f=t,setTimeout(u,i))}}},debounce:function(t,e,n){if("function"==typeof t){var o="boolean"==typeof n&&n,i=e||100;return function(){if("function"==typeof t){var e=this,n=arguments;clearTimeout(t.__id),o&&!t.__id?(!t.__id&&t.apply(e,n),t.__id=setTimeout((function(){t.__id=null}),i)):t.__id=setTimeout((function(){t.apply(e,n)}),i)}}}},tryCatch:function(t,e){var n=e||"";try{n=t()}catch(t){return n}return n},version:"1.0.0"};return t}));

/**
 * version 1.0.0
 * 注：微信二次分享（基于jQuery延迟对象Deferred异步开发，非ES6的promise异步）
 * 通过isUseCCPCMethod参数调用封装ccpc接口或者封装自己的分享到微信的方法
 * 可以在当前方案失败的情况下，自动切换到另一种方案
 * 由于使用wx sdk后，再使用ccpc方案会导致ccpc方案也会失败，
 * 所以应该优先使用ccpc方案，失败后再切换自行封装实现的方案
 */

;(function () {
    'use strict';

    /**
     * 返回一个延迟指定时间的延迟对象
     * @param _time {number} 延迟时间(单位:ms)
     * @returns {object} 返回基于jquery的延迟对象
     */
    function sleep(_time) {
        let time = _time || 30;
        let def = $.Deferred();

        let timerId = setTimeout(() => def.reject(time), time);

        return def.always(function () {
            window.clearTimeout(timerId);
            timerId = null;
        });
    }

    /**
     * 通过接口（ajax或jsonp）获取微信签名
     * 注： 通过sleep函数来限制因为网络或服务器响应慢导致长时间的获取不到接口签名的情况
     * @param reqOpts {object} 请求的参数
     * @param delay {number} 延迟的最大时间
     * @returns {object} 返回基于jquery的延迟对象
     */
    function getWechatSignature(reqOpts, delay) {
        let _reqOpts = $.extend({}, reqOpts);
        let def = sleep(delay);

        return $.when($.ajax(Mkt.Util.filterObject(_reqOpts)).always(function () {
            def.resolve('success');
        }), def);
    }

    /**
     * 下载脚本【使用到闭包函数，用于保存每次成功请求url的记
     * 录到map上，防止每次请求同样的url】
     * @returns {function} 闭包函数，真正去处理请求的函数
     */
    function _loadScript() {
        let map = {};

        /**
         * 真正执行下载脚本的函数
         * @param {string} scriptUrl 请求的脚本url
         * @param {boolean} cache 是否缓存get方法的请求
         * @returns {object}  返回基于jquery的延迟对象
         */
        return function (scriptUrl, cache) {
            if (map[scriptUrl]) {
                return $.Deferred().resolve('[' + scriptUrl + '] was downloaded successfully!');
            }

            return $.ajax({
                type: 'GET',
                url: scriptUrl,
                dataType: 'script',
                async: true,
                cache: typeof cache === 'undefined'
            }).done(function () {
                map[scriptUrl] = true;
            });
        };
    }

    let loadScript = _loadScript();

    let WechatShare = (function () {
        /**
         * 创建微信分享的类
         * @param {object} _config 包含部分微信配置和urls配置【wx和urls字段】
         * @param {object | undefined} callbacks 分享成功和失败【包含取消分享】的回调函数【可选，success和fail字段】
         * @param {object | undefined} shareConf 分享到微信的自定义配置对象【可选，需要合并到微信分享事件的配置字段】
         */
        function WechatShare(_config, callbacks, shareConf) {
            let config = _config || {};

            let _wxConf = config.wechat;
            let wxConf = _wxConf === undefined ? {} : _wxConf;

            let _urls = config.urls;
            let urls = _urls === undefined ? {} : _urls;

            this.wxConf = wxConf;
            this.urls = urls;

            Object.prototype.toString.call(this.urls.needToBeLoadedScripts) !== '[object Array]' && (this.urls.needToBeLoadedScripts = []);

            this.isUseCCPCMethod = !!config.isUseCCPCMethod;
            this.delay = config.delay || 5000;

            this.share = shareConf || {};

            let _callbacks = callbacks || {};
            let success = _callbacks.success;
            let fail = _callbacks.fail;

            typeof success === 'function' && (this.successCb = success);
            typeof fail === 'function' && (this.failCb = fail);

            this.__maxExecCount = 4;
            this.__count = 0;

            this.defaultWxConfig = {
                debug: false,
                jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
            };
        }

        /**
         * WechatShare原型上的初始化方法
         */
        WechatShare.prototype.init = function () {
            if (this.initialized || (++this.__count) > this.__maxExecCount) {
                return;
            }

            if (this.isUseCCPCMethod || this.checkConfig()) {
                let _this = this;
                this.initialized = true;

                this.loadMultiScripts(
                    function () {
                        if (window.eruda && !window.__initEruda) {
                            typeof window.eruda.init === 'function' && window.eruda.init();
                            window.__initEruda = true;
                        }

                        if (_this.isUseCCPCMethod && !this.__failToExecWithCcpc) {
                            _this.subscribeWxEventWithCcpcMethod(function (result) {
                                this.initialized = true;
                                this.__resData = result;
                            }, function () {
                                console.error('Failed to subscribe to WeChat events!');
                                this.initialized = false;
                                this.__failToExecWithCcpc = true;
                                this.isUseCCPCMethod = false;
                                this.init();
                            });
                        } else {
                            _this.getWechatSignature()
                                .done(function (res) {
                                    _this.handleGetSignatureRes(res[0], function () {
                                        _this.registerWxEvent(_this.share);
                                    });
                                })
                                .fail(function (cause) {
                                    console.error('Failed to get WechatSignature!');
                                    typeof _this.failCb === 'function' && _this.failCb(cause);
                                    _this.initialized = false;
                                    _this.isUseCCPCMethod = true;
                                    _this.__failToExecWithCcpc = false;
                                    _this.init();
                                });
                        }
                    },
                    function (e) {
                        typeof _this.failCb === 'function' && _this.failCb(e);
                        _this.initialized = false;
                        _this.isUseCCPCMethod = !_this.isUseCCPCMethod;
                        _this.__failToExecWithCcpc = !_this.isUseCCPCMethod;
                        _this.init();
                    }
                );
            } else {
                typeof this.failCb === 'function' && this.failCb();
            }
        };

        WechatShare.prototype.subscribeWxEventWithCcpcMethod = function (successCallback, failCallback) {
            try {
                if (!this.isUseCCPCMethod) {
                    throw new Error('The current isUseCCPCMethod field value is true. Please note the instance parameters!');
                }

                if (!this.initialized) {
                    return;
                }

                let _this = this;

                let metaDom = document.head.querySelector('meta[name=description]');
                let desc = (metaDom && metaDom.content) ? metaDom.content : document.title; // 分享描述

                let info = {
                    title: document.title, // 分享标题
                    link: window.location.href, // 分享链接
                    imgUrl: this.urls.thumbnailImg, // 分享页面的缩略图
                    desc: desc // 分享描述
                }

                $.extend(info, {
                    success: this.successCb,
                    cancel: this.failCb,
                    fail: this.failCb
                }, this.share);

                let dtd = sleep(_this.delay).always((result) => {
                    if (typeof result === 'object' && result.status) {
                        return;
                    }

                    typeof failCallback === 'function' && failCallback.call(_this);
                });

                window.setWxConfig(info, {}, () => dtd.reject({status: false}));

                window.getWxSignature(function (res) {
                    dtd.resolve({status: true});
                    typeof successCallback === 'function' && successCallback.call(_this, res);
                }, function (err) {
                    dtd.reject({status: false});
                    typeof _this.failCb === 'function' && _this.failCb(err);
                });
            } catch (err) {
                console.error('An error occurred in the method[shareWithCcpcMethod]!');
                typeof failCallback === 'function' && failCallback.call(_this);
            }
        }

        /**
         * WechatShare原型上的用于检测必要参数的方法
         * @returns {boolean} 所有参数是否全部通过
         */
        WechatShare.prototype.checkConfig = function () {
            if (this.isUseCCPCMethod) {
                return true;
            }

            let isAllOk = true;
            let fields = [];

            if (this.isUseCCPCMethod && !this.urls.needToBeLoadedScripts.length) {
                fields.push('needToBeLoadedScripts');
            }

            if (!this.urls.signature || typeof this.urls.signature !== 'string') {
                fields.push('signature');
            }

            if (fields.length) {
                isAllOk = false;
            }

            return isAllOk;
        };

        /**
         * WechatShare原型上用于下载需要用到的js的方法【支持同时下载多个js】
         * @param {function} successCallbacks 下载微信sdk脚本成功后的回调函数
         * @param {function} failCallbacks 下载微信sdk脚本失败后的回调函数
         */
        WechatShare.prototype.loadMultiScripts = function (successCallbacks, failCallbacks) {
            if (this.initialized) {
                let dtd = sleep(this.delay);
                let __list = [];
                let ctx = this;
                let needToBeLoadedScripts = $.extend([], this.urls.needToBeLoadedScripts);
                let wxSdkUrl = '//res.wx.qq.com/open/js/jweixin-1.6.0.js';

                if (!this.isUseCCPCMethod || this.__failToExecWithCcpc) {
                    let index = needToBeLoadedScripts.length;

                    let isExist = needToBeLoadedScripts.some((scriptUrl, idx) => {
                        let isMatched = /(shareSdk|ccpc)/i.test(scriptUrl);

                        if (isMatched) {
                            index = idx;
                        }

                        return isMatched;
                    });

                    delete window.setWxConfig;
                    delete window.getWxSignature;
                    delete window.creatTipFrame;

                    let ccpcUrl = needToBeLoadedScripts.splice(index, isExist ? 1 : 0, wxSdkUrl);

                    if (isExist) {
                        ctx.__ccpcUrl = ccpcUrl;
                    }
                } else {
                    delete window.wx;

                    let idx = needToBeLoadedScripts.indexOf(wxSdkUrl);
                    (idx > -1) && needToBeLoadedScripts.splice(idx, 1);

                    if (ctx.__ccpcUrl) {
                        let isExist = needToBeLoadedScripts.indexOf(ctx.__ccpcUrl) > -1;

                        !isExist && needToBeLoadedScripts.push(ctx.__ccpcUrl);
                    }
                }

                let defs = needToBeLoadedScripts
                    .filter(Boolean)
                    .map(function (scriptUrlItem, _, array) {
                        return loadScript(scriptUrlItem).always(function () {
                            __list.push(scriptUrlItem);
                            (array.length === __list.length) && dtd.resolve('success');
                        });
                    })
                    .concat(dtd);

                if (defs.length === 1) {
                    dtd.reject('no request urls');
                }

                $.when
                    .apply(null, defs)
                    .done(function (data) {
                        typeof successCallbacks === 'function' && successCallbacks(data);
                    })
                    .fail(function (e) {
                        typeof failCallbacks === 'function' && failCallbacks(e);
                    });
            }
        };

        /**
         * WechatShare原型上用于获取微信签名的方法
         * @returns {object} 返回基于jquery的延迟对象
         */
        WechatShare.prototype.getWechatSignature = function () {
            if (mktConfig.sgwApi && this.urls.signature && ((this.initialized && !this.isUseCCPCMethod) || this.__failToExecWithCcpc)) {
                let opt = {
                    type: 'POST',
                    url: Mkt.Util.filterText(mktConfig.sgwApi + this.urls.signature),
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        url: Mkt.Util.getSafeUrl(window.location.href)
                    }),
                    beforeSend: function (xhr) {
                        if (window.supportv2 && supportv2.uumSgwAppId) {
                            xhr.setRequestHeader('SGW-APP-ID', supportv2.uumSgwAppId);
                        }
                    }
                }

                return getWechatSignature(opt, this.delay);
            } else {
                return $.Deferred().reject('Failed to get the signature!');
            }
        };

        /**
         * WechatShare原型上用于获取微信签名成功后的方法
         * @param {object} resData 通过接口获取到的响应信息
         * @param {function | undefined} cb 处理微信签名后的回调函数
         */
        WechatShare.prototype.handleGetSignatureRes = function (resData, cb) {
            let _resData = resData || {};
            this.__resData = _resData;
            this.injectWxConfig(
                $.extend(
                    {},
                    this.defaultWxConfig,
                    {
                        appId: _resData.data.appId,
                        timestamp: _resData.data.timestamp,
                        nonceStr: _resData.data.noncestr,
                        signature: _resData.data.signatureStr
                    },
                    this.wxConf
                ), cb
            );
        };

        /**
         * 注入微信配置【非ccpc方法】
         * @param {object} conf 需要注入的微信配置
         * @param {function | undefined} cb 注入微信配置后的回调函数
         */
        WechatShare.prototype.injectWxConfig = function (conf, cb) {
            let _this = this;

            if (!this.__failToExecWithCcpc && (this.isUseCCPCMethod || !this.initialized || this.__isInjectWxConfig)) {
                return;
            }

            let curConfig = $.extend({}, this.wxConf, conf);

            let isSignatureNotOK = Object.keys(curConfig).some((field) => {
                if (['nonceStr', 'signature', 'timestamp'].indexOf(field) > -1 && !curConfig[field]) {
                    return true;
                }
            });

            if (isSignatureNotOK) {
                _this.initialized = false;
                _this.isUseCCPCMethod = true;
                _this.__failToExecWithCcpc = false;
                _this.init();

                return;
            }

            typeof this.failCb === 'function' && wx.error(function (res) {
                _this.failCb(res);
                _this.__isInjectWxConfig = false;

                _this.initialized = false;
                _this.isUseCCPCMethod = true;
                _this.__failToExecWithCcpc = false;
                _this.init();
            });

            wx.config(curConfig);
            this.__isInjectWxConfig = true;
            typeof cb === 'function' && cb();
        };

        /**
         * 注册分享到微信的相关事件【非ccpc方法】
         * @param {object} shareData 需要注入分享到微信的部分配置信息
         */
        WechatShare.prototype.registerWxEvent = function (shareData) {
            if (!this.__failToExecWithCcpc && (this.isUseCCPCMethod || !this.initialized || this.__isRegisterWxEvent)) {
                return;
            }

            let _shareData = shareData || {};
            let metaDom = document.head.querySelector('meta[name=description]');
            let desc = (metaDom && metaDom.content) ? metaDom.content : document.title; // 分享描述

            let defaultShareData = {
                title: document.title, // 分享标题
                link: window.location.href, // 分享链接
                imgUrl: this.urls.thumbnailImg // 分享页面的缩略图
            };

            let cbsMap = {
                success: function () {
                    typeof this.successCb === 'function' && this.successCb();
                },
                cancel: function () {
                    typeof this.failCb === 'function' && this.failCb();
                }
            };

            let shareConf = $.extend({}, defaultShareData, cbsMap, _shareData);

            wx.ready(function () {
                //分享给朋友圈
                wx.updateTimelineShareData(shareConf);
                //分享给朋友
                wx.updateAppMessageShareData($.extend({desc: desc}, shareConf));
            });

            this.__isRegisterWxEvent = true;
        };

        return WechatShare;
    })();

    $(function () {
        /**
         * 检测是否是微信浏览器
         * @returns {boolean}
         */
        function isWechatBrowser() {
            let userAgent = window.navigator.userAgent.toLowerCase();

            return /MicroMessenger/i.test(userAgent);
        }

        let $input = $('#thumbnailImagePath');
        let thumbnailImg = ($input.val() || '').trim() || $('#news_contain').find('img').eq(0).attr('src') || '';
        let ccpcApiUrl = ($input.attr('data-ccpc-api') || '').trim();

        /**
         * 'https://h5hosting-drcn.dbankcdn.cn/cch5/HiCare/myHuawei-shareSdk/shareSdk.js'// 生产环境
         * 'https://unpkg.com/eruda@2.4.1/eruda.js' eruda调试工具
         * 相关url的map【needToBeLoadedScripts字段在开发模式加载eruda（方便移动端查看调试信息）和微信sdk的js】
         * needToBeLoadedScripts: 包含微信sdk的url链接，也可以包含其他js链接 【必填】
         * signature: 删除该接口path，不再切换uum
         * thumbnailImg: 分享到微信的缩略图路径【必填，在aem配置该url地址，未配置就用空字符串】
         * isGetSignatureByJsonp: 是否用jsonp形式获取微信签名【可选】
         */
        let urls = {
            needToBeLoadedScripts: [],
            thumbnailImg: thumbnailImg,
            isGetSignatureByJsonp: false
        };

        ccpcApiUrl && urls.needToBeLoadedScripts.push(ccpcApiUrl);

        /**
         * 部分需要注入的微信配置，由开发者提供;
         * appId: 已经无需该配置
         * debug: 微信sdk的调试开关 [如果isUseCCPCMethod为true,此字段无需设置]
         * jsApiList: 需要使用到的微信sdk的api [如果isUseCCPCMethod为true,此字段无需设置]
         */
        let wechat = {
            debug: false,
            jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
        };

        /**
         * 所有配置整体在WechatShare类实例化时传入
         * wechat: 微信配置 [如果isUseCCPCMethod为true,此字段无需设置]
         * isUseCCPCMethod: 是否使用ccpc封装的方法;
         * delay: 设置调用微信接口和下载js的最大延迟时间(单位:ms);
         */
        let conf = {
            urls: urls,
            wechat: wechat,
            isUseCCPCMethod: !!ccpcApiUrl,
            delay: 5000
        };

        /**
         * isEnableWxShare: aem配置微信分享的开关【必填】;
         */
        let baseConf = {
            isEnableWxShare: Boolean($input.length)
        };

        if (baseConf.isEnableWxShare && isWechatBrowser()) {
            let wxShare = new WechatShare(conf);
            wxShare.init();
        }
    });
})();

