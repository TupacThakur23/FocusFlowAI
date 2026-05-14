(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) r(s);
  new MutationObserver(s => {
    for (const o of s) if (o.type === "childList") for (const l of o.addedNodes) l.tagName === "LINK" && l.rel === "modulepreload" && r(l);
  }).observe(document, {
    childList: !0,
    subtree: !0
  });
  function n(s) {
    const o = {};
    return s.integrity && (o.integrity = s.integrity), s.referrerPolicy && (o.referrerPolicy = s.referrerPolicy), s.crossOrigin === "use-credentials" ? o.credentials = "include" : s.crossOrigin === "anonymous" ? o.credentials = "omit" : o.credentials = "same-origin", o;
  }
  function r(s) {
    if (s.ep) return;
    s.ep = !0;
    const o = n(s);
    fetch(s.href, o);
  }
})();
function qf(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Zu = {
    exports: {}
  },
  oo = {},
  ec = {
    exports: {}
  },
  K = {};
var Br = Symbol.for("react.element"),
  Kf = Symbol.for("react.portal"),
  Xf = Symbol.for("react.fragment"),
  Gf = Symbol.for("react.strict_mode"),
  Yf = Symbol.for("react.profiler"),
  Jf = Symbol.for("react.provider"),
  Zf = Symbol.for("react.context"),
  ep = Symbol.for("react.forward_ref"),
  tp = Symbol.for("react.suspense"),
  np = Symbol.for("react.memo"),
  rp = Symbol.for("react.lazy"),
  va = Symbol.iterator;
function sp(e) {
  return e === null || typeof e != "object" ? null : (e = va && e[va] || e["@@iterator"], typeof e == "function" ? e : null);
}
var tc = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {}
  },
  nc = Object.assign,
  rc = {};
function Yn(e, t, n) {
  this.props = e, this.context = t, this.refs = rc, this.updater = n || tc;
}
Yn.prototype.isReactComponent = {};
Yn.prototype.setState = function (e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
Yn.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function sc() {}
sc.prototype = Yn.prototype;
function hi(e, t, n) {
  this.props = e, this.context = t, this.refs = rc, this.updater = n || tc;
}
var mi = hi.prototype = new sc();
mi.constructor = hi;
nc(mi, Yn.prototype);
mi.isPureReactComponent = !0;
var wa = Array.isArray,
  oc = Object.prototype.hasOwnProperty,
  xi = {
    current: null
  },
  lc = {
    key: !0,
    ref: !0,
    __self: !0,
    __source: !0
  };
function ic(e, t, n) {
  var r,
    s = {},
    o = null,
    l = null;
  if (t != null) for (r in t.ref !== void 0 && (l = t.ref), t.key !== void 0 && (o = "" + t.key), t) oc.call(t, r) && !lc.hasOwnProperty(r) && (s[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) s.children = n;else if (1 < a) {
    for (var u = Array(a), d = 0; d < a; d++) u[d] = arguments[d + 2];
    s.children = u;
  }
  if (e && e.defaultProps) for (r in a = e.defaultProps, a) s[r] === void 0 && (s[r] = a[r]);
  return {
    $$typeof: Br,
    type: e,
    key: o,
    ref: l,
    props: s,
    _owner: xi.current
  };
}
function op(e, t) {
  return {
    $$typeof: Br,
    type: e.type,
    key: t,
    ref: e.ref,
    props: e.props,
    _owner: e._owner
  };
}
function gi(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Br;
}
function lp(e) {
  var t = {
    "=": "=0",
    ":": "=2"
  };
  return "$" + e.replace(/[=:]/g, function (n) {
    return t[n];
  });
}
var ka = /\/+/g;
function To(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? lp("" + e.key) : t.toString(36);
}
function ys(e, t, n, r, s) {
  var o = typeof e;
  (o === "undefined" || o === "boolean") && (e = null);
  var l = !1;
  if (e === null) l = !0;else switch (o) {
    case "string":
    case "number":
      l = !0;
      break;
    case "object":
      switch (e.$$typeof) {
        case Br:
        case Kf:
          l = !0;
      }
  }
  if (l) return l = e, s = s(l), e = r === "" ? "." + To(l, 0) : r, wa(s) ? (n = "", e != null && (n = e.replace(ka, "$&/") + "/"), ys(s, t, n, "", function (d) {
    return d;
  })) : s != null && (gi(s) && (s = op(s, n + (!s.key || l && l.key === s.key ? "" : ("" + s.key).replace(ka, "$&/") + "/") + e)), t.push(s)), 1;
  if (l = 0, r = r === "" ? "." : r + ":", wa(e)) for (var a = 0; a < e.length; a++) {
    o = e[a];
    var u = r + To(o, a);
    l += ys(o, t, n, u, s);
  } else if (u = sp(e), typeof u == "function") for (e = u.call(e), a = 0; !(o = e.next()).done;) o = o.value, u = r + To(o, a++), l += ys(o, t, n, u, s);else if (o === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return l;
}
function Jr(e, t, n) {
  if (e == null) return e;
  var r = [],
    s = 0;
  return ys(e, r, "", "", function (o) {
    return t.call(n, o, s++);
  }), r;
}
function ip(e) {
  if (e._status === -1) {
    var t = e._result;
    t = t(), t.then(function (n) {
      (e._status === 0 || e._status === -1) && (e._status = 1, e._result = n);
    }, function (n) {
      (e._status === 0 || e._status === -1) && (e._status = 2, e._result = n);
    }), e._status === -1 && (e._status = 0, e._result = t);
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var _e = {
    current: null
  },
  vs = {
    transition: null
  },
  ap = {
    ReactCurrentDispatcher: _e,
    ReactCurrentBatchConfig: vs,
    ReactCurrentOwner: xi
  };
function ac() {
  throw Error("act(...) is not supported in production builds of React.");
}
K.Children = {
  map: Jr,
  forEach: function (e, t, n) {
    Jr(e, function () {
      t.apply(this, arguments);
    }, n);
  },
  count: function (e) {
    var t = 0;
    return Jr(e, function () {
      t++;
    }), t;
  },
  toArray: function (e) {
    return Jr(e, function (t) {
      return t;
    }) || [];
  },
  only: function (e) {
    if (!gi(e)) throw Error("React.Children.only expected to receive a single React element child.");
    return e;
  }
};
K.Component = Yn;
K.Fragment = Xf;
K.Profiler = Yf;
K.PureComponent = hi;
K.StrictMode = Gf;
K.Suspense = tp;
K.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ap;
K.act = ac;
K.cloneElement = function (e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = nc({}, e.props),
    s = e.key,
    o = e.ref,
    l = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (o = t.ref, l = xi.current), t.key !== void 0 && (s = "" + t.key), e.type && e.type.defaultProps) var a = e.type.defaultProps;
    for (u in t) oc.call(t, u) && !lc.hasOwnProperty(u) && (r[u] = t[u] === void 0 && a !== void 0 ? a[u] : t[u]);
  }
  var u = arguments.length - 2;
  if (u === 1) r.children = n;else if (1 < u) {
    a = Array(u);
    for (var d = 0; d < u; d++) a[d] = arguments[d + 2];
    r.children = a;
  }
  return {
    $$typeof: Br,
    type: e.type,
    key: s,
    ref: o,
    props: r,
    _owner: l
  };
};
K.createContext = function (e) {
  return e = {
    $$typeof: Zf,
    _currentValue: e,
    _currentValue2: e,
    _threadCount: 0,
    Provider: null,
    Consumer: null,
    _defaultValue: null,
    _globalName: null
  }, e.Provider = {
    $$typeof: Jf,
    _context: e
  }, e.Consumer = e;
};
K.createElement = ic;
K.createFactory = function (e) {
  var t = ic.bind(null, e);
  return t.type = e, t;
};
K.createRef = function () {
  return {
    current: null
  };
};
K.forwardRef = function (e) {
  return {
    $$typeof: ep,
    render: e
  };
};
K.isValidElement = gi;
K.lazy = function (e) {
  return {
    $$typeof: rp,
    _payload: {
      _status: -1,
      _result: e
    },
    _init: ip
  };
};
K.memo = function (e, t) {
  return {
    $$typeof: np,
    type: e,
    compare: t === void 0 ? null : t
  };
};
K.startTransition = function (e) {
  var t = vs.transition;
  vs.transition = {};
  try {
    e();
  } finally {
    vs.transition = t;
  }
};
K.unstable_act = ac;
K.useCallback = function (e, t) {
  return _e.current.useCallback(e, t);
};
K.useContext = function (e) {
  return _e.current.useContext(e);
};
K.useDebugValue = function () {};
K.useDeferredValue = function (e) {
  return _e.current.useDeferredValue(e);
};
K.useEffect = function (e, t) {
  return _e.current.useEffect(e, t);
};
K.useId = function () {
  return _e.current.useId();
};
K.useImperativeHandle = function (e, t, n) {
  return _e.current.useImperativeHandle(e, t, n);
};
K.useInsertionEffect = function (e, t) {
  return _e.current.useInsertionEffect(e, t);
};
K.useLayoutEffect = function (e, t) {
  return _e.current.useLayoutEffect(e, t);
};
K.useMemo = function (e, t) {
  return _e.current.useMemo(e, t);
};
K.useReducer = function (e, t, n) {
  return _e.current.useReducer(e, t, n);
};
K.useRef = function (e) {
  return _e.current.useRef(e);
};
K.useState = function (e) {
  return _e.current.useState(e);
};
K.useSyncExternalStore = function (e, t, n) {
  return _e.current.useSyncExternalStore(e, t, n);
};
K.useTransition = function () {
  return _e.current.useTransition();
};
K.version = "18.3.1";
ec.exports = K;
var E = ec.exports;
const up = qf(E);
var cp = E,
  dp = Symbol.for("react.element"),
  fp = Symbol.for("react.fragment"),
  pp = Object.prototype.hasOwnProperty,
  hp = cp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  mp = {
    key: !0,
    ref: !0,
    __self: !0,
    __source: !0
  };
function uc(e, t, n) {
  var r,
    s = {},
    o = null,
    l = null;
  n !== void 0 && (o = "" + n), t.key !== void 0 && (o = "" + t.key), t.ref !== void 0 && (l = t.ref);
  for (r in t) pp.call(t, r) && !mp.hasOwnProperty(r) && (s[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) s[r] === void 0 && (s[r] = t[r]);
  return {
    $$typeof: dp,
    type: e,
    key: o,
    ref: l,
    props: s,
    _owner: hp.current
  };
}
oo.Fragment = fp;
oo.jsx = uc;
oo.jsxs = uc;
Zu.exports = oo;
var i = Zu.exports,
  fl = {},
  cc = {
    exports: {}
  },
  Be = {},
  dc = {
    exports: {}
  },
  fc = {};
(function (e) {
  function t(C, b) {
    var O = C.length;
    C.push(b);
    e: for (; 0 < O;) {
      var z = O - 1 >>> 1,
        B = C[z];
      if (0 < s(B, b)) C[z] = b, C[O] = B, O = z;else break e;
    }
  }
  function n(C) {
    return C.length === 0 ? null : C[0];
  }
  function r(C) {
    if (C.length === 0) return null;
    var b = C[0],
      O = C.pop();
    if (O !== b) {
      C[0] = O;
      e: for (var z = 0, B = C.length, D = B >>> 1; z < D;) {
        var q = 2 * (z + 1) - 1,
          J = C[q],
          ee = q + 1,
          Z = C[ee];
        if (0 > s(J, O)) ee < B && 0 > s(Z, J) ? (C[z] = Z, C[ee] = O, z = ee) : (C[z] = J, C[q] = O, z = q);else if (ee < B && 0 > s(Z, O)) C[z] = Z, C[ee] = O, z = ee;else break e;
      }
    }
    return b;
  }
  function s(C, b) {
    var O = C.sortIndex - b.sortIndex;
    return O !== 0 ? O : C.id - b.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var o = performance;
    e.unstable_now = function () {
      return o.now();
    };
  } else {
    var l = Date,
      a = l.now();
    e.unstable_now = function () {
      return l.now() - a;
    };
  }
  var u = [],
    d = [],
    c = 1,
    h = null,
    x = 3,
    v = !1,
    g = !1,
    y = !1,
    S = typeof setTimeout == "function" ? setTimeout : null,
    m = typeof clearTimeout == "function" ? clearTimeout : null,
    p = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function f(C) {
    for (var b = n(d); b !== null;) {
      if (b.callback === null) r(d);else if (b.startTime <= C) r(d), b.sortIndex = b.expirationTime, t(u, b);else break;
      b = n(d);
    }
  }
  function w(C) {
    if (y = !1, f(C), !g) if (n(u) !== null) g = !0, L(j);else {
      var b = n(d);
      b !== null && I(w, b.startTime - C);
    }
  }
  function j(C, b) {
    g = !1, y && (y = !1, m(P), P = -1), v = !0;
    var O = x;
    try {
      for (f(b), h = n(u); h !== null && (!(h.expirationTime > b) || C && !Q());) {
        var z = h.callback;
        if (typeof z == "function") {
          h.callback = null, x = h.priorityLevel;
          var B = z(h.expirationTime <= b);
          b = e.unstable_now(), typeof B == "function" ? h.callback = B : h === n(u) && r(u), f(b);
        } else r(u);
        h = n(u);
      }
      if (h !== null) var D = !0;else {
        var q = n(d);
        q !== null && I(w, q.startTime - b), D = !1;
      }
      return D;
    } finally {
      h = null, x = O, v = !1;
    }
  }
  var A = !1,
    _ = null,
    P = -1,
    U = 5,
    F = -1;
  function Q() {
    return !(e.unstable_now() - F < U);
  }
  function ce() {
    if (_ !== null) {
      var C = e.unstable_now();
      F = C;
      var b = !0;
      try {
        b = _(!0, C);
      } finally {
        b ? G() : (A = !1, _ = null);
      }
    } else A = !1;
  }
  var G;
  if (typeof p == "function") G = function () {
    p(ce);
  };else if (typeof MessageChannel < "u") {
    var ne = new MessageChannel(),
      T = ne.port2;
    ne.port1.onmessage = ce, G = function () {
      T.postMessage(null);
    };
  } else G = function () {
    S(ce, 0);
  };
  function L(C) {
    _ = C, A || (A = !0, G());
  }
  function I(C, b) {
    P = S(function () {
      C(e.unstable_now());
    }, b);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function (C) {
    C.callback = null;
  }, e.unstable_continueExecution = function () {
    g || v || (g = !0, L(j));
  }, e.unstable_forceFrameRate = function (C) {
    0 > C || 125 < C ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : U = 0 < C ? Math.floor(1e3 / C) : 5;
  }, e.unstable_getCurrentPriorityLevel = function () {
    return x;
  }, e.unstable_getFirstCallbackNode = function () {
    return n(u);
  }, e.unstable_next = function (C) {
    switch (x) {
      case 1:
      case 2:
      case 3:
        var b = 3;
        break;
      default:
        b = x;
    }
    var O = x;
    x = b;
    try {
      return C();
    } finally {
      x = O;
    }
  }, e.unstable_pauseExecution = function () {}, e.unstable_requestPaint = function () {}, e.unstable_runWithPriority = function (C, b) {
    switch (C) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        C = 3;
    }
    var O = x;
    x = C;
    try {
      return b();
    } finally {
      x = O;
    }
  }, e.unstable_scheduleCallback = function (C, b, O) {
    var z = e.unstable_now();
    switch (typeof O == "object" && O !== null ? (O = O.delay, O = typeof O == "number" && 0 < O ? z + O : z) : O = z, C) {
      case 1:
        var B = -1;
        break;
      case 2:
        B = 250;
        break;
      case 5:
        B = 1073741823;
        break;
      case 4:
        B = 1e4;
        break;
      default:
        B = 5e3;
    }
    return B = O + B, C = {
      id: c++,
      callback: b,
      priorityLevel: C,
      startTime: O,
      expirationTime: B,
      sortIndex: -1
    }, O > z ? (C.sortIndex = O, t(d, C), n(u) === null && C === n(d) && (y ? (m(P), P = -1) : y = !0, I(w, O - z))) : (C.sortIndex = B, t(u, C), g || v || (g = !0, L(j))), C;
  }, e.unstable_shouldYield = Q, e.unstable_wrapCallback = function (C) {
    var b = x;
    return function () {
      var O = x;
      x = b;
      try {
        return C.apply(this, arguments);
      } finally {
        x = O;
      }
    };
  };
})(fc);
dc.exports = fc;
var xp = dc.exports;
var gp = E,
  Ue = xp;
function R(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var pc = new Set(),
  Nr = {};
function gn(e, t) {
  Bn(e, t), Bn(e + "Capture", t);
}
function Bn(e, t) {
  for (Nr[e] = t, e = 0; e < t.length; e++) pc.add(t[e]);
}
var Et = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"),
  pl = Object.prototype.hasOwnProperty,
  yp = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  Sa = {},
  ba = {};
function vp(e) {
  return pl.call(ba, e) ? !0 : pl.call(Sa, e) ? !1 : yp.test(e) ? ba[e] = !0 : (Sa[e] = !0, !1);
}
function wp(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function kp(e, t, n, r) {
  if (t === null || typeof t > "u" || wp(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null) switch (n.type) {
    case 3:
      return !t;
    case 4:
      return t === !1;
    case 5:
      return isNaN(t);
    case 6:
      return isNaN(t) || 1 > t;
  }
  return !1;
}
function Te(e, t, n, r, s, o, l) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = s, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = o, this.removeEmptyString = l;
}
var we = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function (e) {
  we[e] = new Te(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function (e) {
  var t = e[0];
  we[t] = new Te(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (e) {
  we[e] = new Te(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function (e) {
  we[e] = new Te(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function (e) {
  we[e] = new Te(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function (e) {
  we[e] = new Te(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function (e) {
  we[e] = new Te(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function (e) {
  we[e] = new Te(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function (e) {
  we[e] = new Te(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var yi = /[\-:]([a-z])/g;
function vi(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function (e) {
  var t = e.replace(yi, vi);
  we[t] = new Te(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function (e) {
  var t = e.replace(yi, vi);
  we[t] = new Te(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
  var t = e.replace(yi, vi);
  we[t] = new Te(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function (e) {
  we[e] = new Te(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
we.xlinkHref = new Te("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function (e) {
  we[e] = new Te(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function wi(e, t, n, r) {
  var s = we.hasOwnProperty(t) ? we[t] : null;
  (s !== null ? s.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (kp(t, n, s, r) && (n = null), r || s === null ? vp(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : s.mustUseProperty ? e[s.propertyName] = n === null ? s.type === 3 ? !1 : "" : n : (t = s.attributeName, r = s.attributeNamespace, n === null ? e.removeAttribute(t) : (s = s.type, n = s === 3 || s === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var Tt = gp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Zr = Symbol.for("react.element"),
  bn = Symbol.for("react.portal"),
  Nn = Symbol.for("react.fragment"),
  ki = Symbol.for("react.strict_mode"),
  hl = Symbol.for("react.profiler"),
  hc = Symbol.for("react.provider"),
  mc = Symbol.for("react.context"),
  Si = Symbol.for("react.forward_ref"),
  ml = Symbol.for("react.suspense"),
  xl = Symbol.for("react.suspense_list"),
  bi = Symbol.for("react.memo"),
  Pt = Symbol.for("react.lazy"),
  xc = Symbol.for("react.offscreen"),
  Na = Symbol.iterator;
function tr(e) {
  return e === null || typeof e != "object" ? null : (e = Na && e[Na] || e["@@iterator"], typeof e == "function" ? e : null);
}
var ae = Object.assign,
  Ro;
function cr(e) {
  if (Ro === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    Ro = t && t[1] || "";
  }
  return `
` + Ro + e;
}
var Ao = !1;
function Oo(e, t) {
  if (!e || Ao) return "";
  Ao = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t) {
      if (t = function () {
        throw Error();
      }, Object.defineProperty(t.prototype, "props", {
        set: function () {
          throw Error();
        }
      }), typeof Reflect == "object" && Reflect.construct) {
        try {
          Reflect.construct(t, []);
        } catch (d) {
          var r = d;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (d) {
          r = d;
        }
        e.call(t.prototype);
      }
    } else {
      try {
        throw Error();
      } catch (d) {
        r = d;
      }
      e();
    }
  } catch (d) {
    if (d && r && typeof d.stack == "string") {
      for (var s = d.stack.split(`
`), o = r.stack.split(`
`), l = s.length - 1, a = o.length - 1; 1 <= l && 0 <= a && s[l] !== o[a];) a--;
      for (; 1 <= l && 0 <= a; l--, a--) if (s[l] !== o[a]) {
        if (l !== 1 || a !== 1) do if (l--, a--, 0 > a || s[l] !== o[a]) {
          var u = `
` + s[l].replace(" at new ", " at ");
          return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
        } while (1 <= l && 0 <= a);
        break;
      }
    }
  } finally {
    Ao = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? cr(e) : "";
}
function Sp(e) {
  switch (e.tag) {
    case 5:
      return cr(e.type);
    case 16:
      return cr("Lazy");
    case 13:
      return cr("Suspense");
    case 19:
      return cr("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = Oo(e.type, !1), e;
    case 11:
      return e = Oo(e.type.render, !1), e;
    case 1:
      return e = Oo(e.type, !0), e;
    default:
      return "";
  }
}
function gl(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Nn:
      return "Fragment";
    case bn:
      return "Portal";
    case hl:
      return "Profiler";
    case ki:
      return "StrictMode";
    case ml:
      return "Suspense";
    case xl:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case mc:
      return (e.displayName || "Context") + ".Consumer";
    case hc:
      return (e._context.displayName || "Context") + ".Provider";
    case Si:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case bi:
      return t = e.displayName || null, t !== null ? t : gl(e.type) || "Memo";
    case Pt:
      t = e._payload, e = e._init;
      try {
        return gl(e(t));
      } catch {}
  }
  return null;
}
function bp(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return gl(t);
    case 8:
      return t === ki ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function Kt(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function gc(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function Np(e) {
  var t = gc(e) ? "checked" : "value",
    n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
    r = "" + e[t];
  if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
    var s = n.get,
      o = n.set;
    return Object.defineProperty(e, t, {
      configurable: !0,
      get: function () {
        return s.call(this);
      },
      set: function (l) {
        r = "" + l, o.call(this, l);
      }
    }), Object.defineProperty(e, t, {
      enumerable: n.enumerable
    }), {
      getValue: function () {
        return r;
      },
      setValue: function (l) {
        r = "" + l;
      },
      stopTracking: function () {
        e._valueTracker = null, delete e[t];
      }
    };
  }
}
function es(e) {
  e._valueTracker || (e._valueTracker = Np(e));
}
function yc(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = "";
  return e && (r = gc(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function Ps(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function yl(e, t) {
  var n = t.checked;
  return ae({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked
  });
}
function Ea(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  n = Kt(t.value != null ? t.value : n), e._wrapperState = {
    initialChecked: r,
    initialValue: n,
    controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null
  };
}
function vc(e, t) {
  t = t.checked, t != null && wi(e, "checked", t, !1);
}
function vl(e, t) {
  vc(e, t);
  var n = Kt(t.value),
    r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? wl(e, t.type, n) : t.hasOwnProperty("defaultValue") && wl(e, t.type, Kt(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function ja(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function wl(e, t, n) {
  (t !== "number" || Ps(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var dr = Array.isArray;
function zn(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var s = 0; s < n.length; s++) t["$" + n[s]] = !0;
    for (n = 0; n < e.length; n++) s = t.hasOwnProperty("$" + e[n].value), e[n].selected !== s && (e[n].selected = s), s && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + Kt(n), t = null, s = 0; s < e.length; s++) {
      if (e[s].value === n) {
        e[s].selected = !0, r && (e[s].defaultSelected = !0);
        return;
      }
      t !== null || e[s].disabled || (t = e[s]);
    }
    t !== null && (t.selected = !0);
  }
}
function kl(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(R(91));
  return ae({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: "" + e._wrapperState.initialValue
  });
}
function Ca(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(R(92));
      if (dr(n)) {
        if (1 < n.length) throw Error(R(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = {
    initialValue: Kt(n)
  };
}
function wc(e, t) {
  var n = Kt(t.value),
    r = Kt(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function _a(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function kc(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Sl(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? kc(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var ts,
  Sc = function (e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function (t, n, r, s) {
      MSApp.execUnsafeLocalFunction(function () {
        return e(t, n, r, s);
      });
    } : e;
  }(function (e, t) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;else {
      for (ts = ts || document.createElement("div"), ts.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = ts.firstChild; e.firstChild;) e.removeChild(e.firstChild);
      for (; t.firstChild;) e.appendChild(t.firstChild);
    }
  });
function Er(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var hr = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0
  },
  Ep = ["Webkit", "ms", "Moz", "O"];
Object.keys(hr).forEach(function (e) {
  Ep.forEach(function (t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), hr[t] = hr[e];
  });
});
function bc(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || hr.hasOwnProperty(e) && hr[e] ? ("" + t).trim() : t + "px";
}
function Nc(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0,
      s = bc(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, s) : e[n] = s;
  }
}
var jp = ae({
  menuitem: !0
}, {
  area: !0,
  base: !0,
  br: !0,
  col: !0,
  embed: !0,
  hr: !0,
  img: !0,
  input: !0,
  keygen: !0,
  link: !0,
  meta: !0,
  param: !0,
  source: !0,
  track: !0,
  wbr: !0
});
function bl(e, t) {
  if (t) {
    if (jp[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(R(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(R(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(R(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(R(62));
  }
}
function Nl(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var El = null;
function Ni(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var jl = null,
  Mn = null,
  In = null;
function Ta(e) {
  if (e = Vr(e)) {
    if (typeof jl != "function") throw Error(R(280));
    var t = e.stateNode;
    t && (t = co(t), jl(e.stateNode, e.type, t));
  }
}
function Ec(e) {
  Mn ? In ? In.push(e) : In = [e] : Mn = e;
}
function jc() {
  if (Mn) {
    var e = Mn,
      t = In;
    if (In = Mn = null, Ta(e), t) for (e = 0; e < t.length; e++) Ta(t[e]);
  }
}
function Cc(e, t) {
  return e(t);
}
function _c() {}
var Po = !1;
function Tc(e, t, n) {
  if (Po) return e(t, n);
  Po = !0;
  try {
    return Cc(e, t, n);
  } finally {
    Po = !1, (Mn !== null || In !== null) && (_c(), jc());
  }
}
function jr(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = co(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(R(231, t, typeof n));
  return n;
}
var Cl = !1;
if (Et) try {
  var nr = {};
  Object.defineProperty(nr, "passive", {
    get: function () {
      Cl = !0;
    }
  }), window.addEventListener("test", nr, nr), window.removeEventListener("test", nr, nr);
} catch {
  Cl = !1;
}
function Cp(e, t, n, r, s, o, l, a, u) {
  var d = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, d);
  } catch (c) {
    this.onError(c);
  }
}
var mr = !1,
  Ls = null,
  zs = !1,
  _l = null,
  _p = {
    onError: function (e) {
      mr = !0, Ls = e;
    }
  };
function Tp(e, t, n, r, s, o, l, a, u) {
  mr = !1, Ls = null, Cp.apply(_p, arguments);
}
function Rp(e, t, n, r, s, o, l, a, u) {
  if (Tp.apply(this, arguments), mr) {
    if (mr) {
      var d = Ls;
      mr = !1, Ls = null;
    } else throw Error(R(198));
    zs || (zs = !0, _l = d);
  }
}
function yn(e) {
  var t = e,
    n = e;
  if (e.alternate) for (; t.return;) t = t.return;else {
    e = t;
    do t = e, t.flags & 4098 && (n = t.return), e = t.return; while (e);
  }
  return t.tag === 3 ? n : null;
}
function Rc(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function Ra(e) {
  if (yn(e) !== e) throw Error(R(188));
}
function Ap(e) {
  var t = e.alternate;
  if (!t) {
    if (t = yn(e), t === null) throw Error(R(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t;;) {
    var s = n.return;
    if (s === null) break;
    var o = s.alternate;
    if (o === null) {
      if (r = s.return, r !== null) {
        n = r;
        continue;
      }
      break;
    }
    if (s.child === o.child) {
      for (o = s.child; o;) {
        if (o === n) return Ra(s), e;
        if (o === r) return Ra(s), t;
        o = o.sibling;
      }
      throw Error(R(188));
    }
    if (n.return !== r.return) n = s, r = o;else {
      for (var l = !1, a = s.child; a;) {
        if (a === n) {
          l = !0, n = s, r = o;
          break;
        }
        if (a === r) {
          l = !0, r = s, n = o;
          break;
        }
        a = a.sibling;
      }
      if (!l) {
        for (a = o.child; a;) {
          if (a === n) {
            l = !0, n = o, r = s;
            break;
          }
          if (a === r) {
            l = !0, r = o, n = s;
            break;
          }
          a = a.sibling;
        }
        if (!l) throw Error(R(189));
      }
    }
    if (n.alternate !== r) throw Error(R(190));
  }
  if (n.tag !== 3) throw Error(R(188));
  return n.stateNode.current === n ? e : t;
}
function Ac(e) {
  return e = Ap(e), e !== null ? Oc(e) : null;
}
function Oc(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null;) {
    var t = Oc(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Pc = Ue.unstable_scheduleCallback,
  Aa = Ue.unstable_cancelCallback,
  Op = Ue.unstable_shouldYield,
  Pp = Ue.unstable_requestPaint,
  de = Ue.unstable_now,
  Lp = Ue.unstable_getCurrentPriorityLevel,
  Ei = Ue.unstable_ImmediatePriority,
  Lc = Ue.unstable_UserBlockingPriority,
  Ms = Ue.unstable_NormalPriority,
  zp = Ue.unstable_LowPriority,
  zc = Ue.unstable_IdlePriority,
  lo = null,
  ht = null;
function Mp(e) {
  if (ht && typeof ht.onCommitFiberRoot == "function") try {
    ht.onCommitFiberRoot(lo, e, void 0, (e.current.flags & 128) === 128);
  } catch {}
}
var st = Math.clz32 ? Math.clz32 : Fp,
  Ip = Math.log,
  Dp = Math.LN2;
function Fp(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (Ip(e) / Dp | 0) | 0;
}
var ns = 64,
  rs = 4194304;
function fr(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function Is(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    s = e.suspendedLanes,
    o = e.pingedLanes,
    l = n & 268435455;
  if (l !== 0) {
    var a = l & ~s;
    a !== 0 ? r = fr(a) : (o &= l, o !== 0 && (r = fr(o)));
  } else l = n & ~s, l !== 0 ? r = fr(l) : o !== 0 && (r = fr(o));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & s) && (s = r & -r, o = t & -t, s >= o || s === 16 && (o & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t;) n = 31 - st(t), s = 1 << n, r |= e[n], t &= ~s;
  return r;
}
function $p(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function Up(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, s = e.expirationTimes, o = e.pendingLanes; 0 < o;) {
    var l = 31 - st(o),
      a = 1 << l,
      u = s[l];
    u === -1 ? (!(a & n) || a & r) && (s[l] = $p(a, t)) : u <= t && (e.expiredLanes |= a), o &= ~a;
  }
}
function Tl(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function Mc() {
  var e = ns;
  return ns <<= 1, !(ns & 4194240) && (ns = 64), e;
}
function Lo(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Hr(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - st(t), e[t] = n;
}
function Bp(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n;) {
    var s = 31 - st(n),
      o = 1 << s;
    t[s] = 0, r[s] = -1, e[s] = -1, n &= ~o;
  }
}
function ji(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n;) {
    var r = 31 - st(n),
      s = 1 << r;
    s & t | e[r] & t && (e[r] |= t), n &= ~s;
  }
}
var Y = 0;
function Ic(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var Dc,
  Ci,
  Fc,
  $c,
  Uc,
  Rl = !1,
  ss = [],
  Ft = null,
  $t = null,
  Ut = null,
  Cr = new Map(),
  _r = new Map(),
  zt = [],
  Hp = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Oa(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      Ft = null;
      break;
    case "dragenter":
    case "dragleave":
      $t = null;
      break;
    case "mouseover":
    case "mouseout":
      Ut = null;
      break;
    case "pointerover":
    case "pointerout":
      Cr.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      _r.delete(t.pointerId);
  }
}
function rr(e, t, n, r, s, o) {
  return e === null || e.nativeEvent !== o ? (e = {
    blockedOn: t,
    domEventName: n,
    eventSystemFlags: r,
    nativeEvent: o,
    targetContainers: [s]
  }, t !== null && (t = Vr(t), t !== null && Ci(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, s !== null && t.indexOf(s) === -1 && t.push(s), e);
}
function Wp(e, t, n, r, s) {
  switch (t) {
    case "focusin":
      return Ft = rr(Ft, e, t, n, r, s), !0;
    case "dragenter":
      return $t = rr($t, e, t, n, r, s), !0;
    case "mouseover":
      return Ut = rr(Ut, e, t, n, r, s), !0;
    case "pointerover":
      var o = s.pointerId;
      return Cr.set(o, rr(Cr.get(o) || null, e, t, n, r, s)), !0;
    case "gotpointercapture":
      return o = s.pointerId, _r.set(o, rr(_r.get(o) || null, e, t, n, r, s)), !0;
  }
  return !1;
}
function Bc(e) {
  var t = tn(e.target);
  if (t !== null) {
    var n = yn(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Rc(n), t !== null) {
          e.blockedOn = t, Uc(e.priority, function () {
            Fc(n);
          });
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function ws(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length;) {
    var n = Al(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      El = r, n.target.dispatchEvent(r), El = null;
    } else return t = Vr(n), t !== null && Ci(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function Pa(e, t, n) {
  ws(e) && n.delete(t);
}
function Vp() {
  Rl = !1, Ft !== null && ws(Ft) && (Ft = null), $t !== null && ws($t) && ($t = null), Ut !== null && ws(Ut) && (Ut = null), Cr.forEach(Pa), _r.forEach(Pa);
}
function sr(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Rl || (Rl = !0, Ue.unstable_scheduleCallback(Ue.unstable_NormalPriority, Vp)));
}
function Tr(e) {
  function t(s) {
    return sr(s, e);
  }
  if (0 < ss.length) {
    sr(ss[0], e);
    for (var n = 1; n < ss.length; n++) {
      var r = ss[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (Ft !== null && sr(Ft, e), $t !== null && sr($t, e), Ut !== null && sr(Ut, e), Cr.forEach(t), _r.forEach(t), n = 0; n < zt.length; n++) r = zt[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < zt.length && (n = zt[0], n.blockedOn === null);) Bc(n), n.blockedOn === null && zt.shift();
}
var Dn = Tt.ReactCurrentBatchConfig,
  Ds = !0;
function Qp(e, t, n, r) {
  var s = Y,
    o = Dn.transition;
  Dn.transition = null;
  try {
    Y = 1, _i(e, t, n, r);
  } finally {
    Y = s, Dn.transition = o;
  }
}
function qp(e, t, n, r) {
  var s = Y,
    o = Dn.transition;
  Dn.transition = null;
  try {
    Y = 4, _i(e, t, n, r);
  } finally {
    Y = s, Dn.transition = o;
  }
}
function _i(e, t, n, r) {
  if (Ds) {
    var s = Al(e, t, n, r);
    if (s === null) Wo(e, t, r, Fs, n), Oa(e, r);else if (Wp(s, e, t, n, r)) r.stopPropagation();else if (Oa(e, r), t & 4 && -1 < Hp.indexOf(e)) {
      for (; s !== null;) {
        var o = Vr(s);
        if (o !== null && Dc(o), o = Al(e, t, n, r), o === null && Wo(e, t, r, Fs, n), o === s) break;
        s = o;
      }
      s !== null && r.stopPropagation();
    } else Wo(e, t, r, null, n);
  }
}
var Fs = null;
function Al(e, t, n, r) {
  if (Fs = null, e = Ni(r), e = tn(e), e !== null) if (t = yn(e), t === null) e = null;else if (n = t.tag, n === 13) {
    if (e = Rc(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return Fs = e, null;
}
function Hc(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (Lp()) {
        case Ei:
          return 1;
        case Lc:
          return 4;
        case Ms:
        case zp:
          return 16;
        case zc:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var It = null,
  Ti = null,
  ks = null;
function Wc() {
  if (ks) return ks;
  var e,
    t = Ti,
    n = t.length,
    r,
    s = "value" in It ? It.value : It.textContent,
    o = s.length;
  for (e = 0; e < n && t[e] === s[e]; e++);
  var l = n - e;
  for (r = 1; r <= l && t[n - r] === s[o - r]; r++);
  return ks = s.slice(e, 1 < r ? 1 - r : void 0);
}
function Ss(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function os() {
  return !0;
}
function La() {
  return !1;
}
function He(e) {
  function t(n, r, s, o, l) {
    this._reactName = n, this._targetInst = s, this.type = r, this.nativeEvent = o, this.target = l, this.currentTarget = null;
    for (var a in e) e.hasOwnProperty(a) && (n = e[a], this[a] = n ? n(o) : o[a]);
    return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? os : La, this.isPropagationStopped = La, this;
  }
  return ae(t.prototype, {
    preventDefault: function () {
      this.defaultPrevented = !0;
      var n = this.nativeEvent;
      n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = os);
    },
    stopPropagation: function () {
      var n = this.nativeEvent;
      n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = os);
    },
    persist: function () {},
    isPersistent: os
  }), t;
}
var Jn = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  },
  Ri = He(Jn),
  Wr = ae({}, Jn, {
    view: 0,
    detail: 0
  }),
  Kp = He(Wr),
  zo,
  Mo,
  or,
  io = ae({}, Wr, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Ai,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    },
    movementX: function (e) {
      return "movementX" in e ? e.movementX : (e !== or && (or && e.type === "mousemove" ? (zo = e.screenX - or.screenX, Mo = e.screenY - or.screenY) : Mo = zo = 0, or = e), zo);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : Mo;
    }
  }),
  za = He(io),
  Xp = ae({}, io, {
    dataTransfer: 0
  }),
  Gp = He(Xp),
  Yp = ae({}, Wr, {
    relatedTarget: 0
  }),
  Io = He(Yp),
  Jp = ae({}, Jn, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }),
  Zp = He(Jp),
  eh = ae({}, Jn, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }),
  th = He(eh),
  nh = ae({}, Jn, {
    data: 0
  }),
  Ma = He(nh),
  rh = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  },
  sh = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  },
  oh = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
function lh(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = oh[e]) ? !!t[e] : !1;
}
function Ai() {
  return lh;
}
var ih = ae({}, Wr, {
    key: function (e) {
      if (e.key) {
        var t = rh[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress" ? (e = Ss(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? sh[e.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Ai,
    charCode: function (e) {
      return e.type === "keypress" ? Ss(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress" ? Ss(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }),
  ah = He(ih),
  uh = ae({}, io, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }),
  Ia = He(uh),
  ch = ae({}, Wr, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Ai
  }),
  dh = He(ch),
  fh = ae({}, Jn, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }),
  ph = He(fh),
  hh = ae({}, io, {
    deltaX: function (e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function (e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }),
  mh = He(hh),
  xh = [9, 13, 27, 32],
  Oi = Et && "CompositionEvent" in window,
  xr = null;
Et && "documentMode" in document && (xr = document.documentMode);
var gh = Et && "TextEvent" in window && !xr,
  Vc = Et && (!Oi || xr && 8 < xr && 11 >= xr),
  Da = " ",
  Fa = !1;
function Qc(e, t) {
  switch (e) {
    case "keyup":
      return xh.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function qc(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var En = !1;
function yh(e, t) {
  switch (e) {
    case "compositionend":
      return qc(t);
    case "keypress":
      return t.which !== 32 ? null : (Fa = !0, Da);
    case "textInput":
      return e = t.data, e === Da && Fa ? null : e;
    default:
      return null;
  }
}
function vh(e, t) {
  if (En) return e === "compositionend" || !Oi && Qc(e, t) ? (e = Wc(), ks = Ti = It = null, En = !1, e) : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return Vc && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var wh = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0
};
function $a(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!wh[e.type] : t === "textarea";
}
function Kc(e, t, n, r) {
  Ec(r), t = $s(t, "onChange"), 0 < t.length && (n = new Ri("onChange", "change", null, n, r), e.push({
    event: n,
    listeners: t
  }));
}
var gr = null,
  Rr = null;
function kh(e) {
  od(e, 0);
}
function ao(e) {
  var t = _n(e);
  if (yc(t)) return e;
}
function Sh(e, t) {
  if (e === "change") return t;
}
var Xc = !1;
if (Et) {
  var Do;
  if (Et) {
    var Fo = "oninput" in document;
    if (!Fo) {
      var Ua = document.createElement("div");
      Ua.setAttribute("oninput", "return;"), Fo = typeof Ua.oninput == "function";
    }
    Do = Fo;
  } else Do = !1;
  Xc = Do && (!document.documentMode || 9 < document.documentMode);
}
function Ba() {
  gr && (gr.detachEvent("onpropertychange", Gc), Rr = gr = null);
}
function Gc(e) {
  if (e.propertyName === "value" && ao(Rr)) {
    var t = [];
    Kc(t, Rr, e, Ni(e)), Tc(kh, t);
  }
}
function bh(e, t, n) {
  e === "focusin" ? (Ba(), gr = t, Rr = n, gr.attachEvent("onpropertychange", Gc)) : e === "focusout" && Ba();
}
function Nh(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return ao(Rr);
}
function Eh(e, t) {
  if (e === "click") return ao(t);
}
function jh(e, t) {
  if (e === "input" || e === "change") return ao(t);
}
function Ch(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var lt = typeof Object.is == "function" ? Object.is : Ch;
function Ar(e, t) {
  if (lt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var s = n[r];
    if (!pl.call(t, s) || !lt(e[s], t[s])) return !1;
  }
  return !0;
}
function Ha(e) {
  for (; e && e.firstChild;) e = e.firstChild;
  return e;
}
function Wa(e, t) {
  var n = Ha(e);
  e = 0;
  for (var r; n;) {
    if (n.nodeType === 3) {
      if (r = e + n.textContent.length, e <= t && r >= t) return {
        node: n,
        offset: t - e
      };
      e = r;
    }
    e: {
      for (; n;) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = Ha(n);
  }
}
function Yc(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Yc(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function Jc() {
  for (var e = window, t = Ps(); t instanceof e.HTMLIFrameElement;) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;else break;
    t = Ps(e.document);
  }
  return t;
}
function Pi(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function _h(e) {
  var t = Jc(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && Yc(n.ownerDocument.documentElement, n)) {
    if (r !== null && Pi(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var s = n.textContent.length,
          o = Math.min(r.start, s);
        r = r.end === void 0 ? o : Math.min(r.end, s), !e.extend && o > r && (s = r, r = o, o = s), s = Wa(n, o);
        var l = Wa(n, r);
        s && l && (e.rangeCount !== 1 || e.anchorNode !== s.node || e.anchorOffset !== s.offset || e.focusNode !== l.node || e.focusOffset !== l.offset) && (t = t.createRange(), t.setStart(s.node, s.offset), e.removeAllRanges(), o > r ? (e.addRange(t), e.extend(l.node, l.offset)) : (t.setEnd(l.node, l.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; e = e.parentNode;) e.nodeType === 1 && t.push({
      element: e,
      left: e.scrollLeft,
      top: e.scrollTop
    });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
  }
}
var Th = Et && "documentMode" in document && 11 >= document.documentMode,
  jn = null,
  Ol = null,
  yr = null,
  Pl = !1;
function Va(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Pl || jn == null || jn !== Ps(r) || (r = jn, "selectionStart" in r && Pi(r) ? r = {
    start: r.selectionStart,
    end: r.selectionEnd
  } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
    anchorNode: r.anchorNode,
    anchorOffset: r.anchorOffset,
    focusNode: r.focusNode,
    focusOffset: r.focusOffset
  }), yr && Ar(yr, r) || (yr = r, r = $s(Ol, "onSelect"), 0 < r.length && (t = new Ri("onSelect", "select", null, t, n), e.push({
    event: t,
    listeners: r
  }), t.target = jn)));
}
function ls(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var Cn = {
    animationend: ls("Animation", "AnimationEnd"),
    animationiteration: ls("Animation", "AnimationIteration"),
    animationstart: ls("Animation", "AnimationStart"),
    transitionend: ls("Transition", "TransitionEnd")
  },
  $o = {},
  Zc = {};
Et && (Zc = document.createElement("div").style, "AnimationEvent" in window || (delete Cn.animationend.animation, delete Cn.animationiteration.animation, delete Cn.animationstart.animation), "TransitionEvent" in window || delete Cn.transitionend.transition);
function uo(e) {
  if ($o[e]) return $o[e];
  if (!Cn[e]) return e;
  var t = Cn[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in Zc) return $o[e] = t[n];
  return e;
}
var ed = uo("animationend"),
  td = uo("animationiteration"),
  nd = uo("animationstart"),
  rd = uo("transitionend"),
  sd = new Map(),
  Qa = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function Gt(e, t) {
  sd.set(e, t), gn(t, [e]);
}
for (var Uo = 0; Uo < Qa.length; Uo++) {
  var Bo = Qa[Uo],
    Rh = Bo.toLowerCase(),
    Ah = Bo[0].toUpperCase() + Bo.slice(1);
  Gt(Rh, "on" + Ah);
}
Gt(ed, "onAnimationEnd");
Gt(td, "onAnimationIteration");
Gt(nd, "onAnimationStart");
Gt("dblclick", "onDoubleClick");
Gt("focusin", "onFocus");
Gt("focusout", "onBlur");
Gt(rd, "onTransitionEnd");
Bn("onMouseEnter", ["mouseout", "mouseover"]);
Bn("onMouseLeave", ["mouseout", "mouseover"]);
Bn("onPointerEnter", ["pointerout", "pointerover"]);
Bn("onPointerLeave", ["pointerout", "pointerover"]);
gn("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
gn("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
gn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
gn("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
gn("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
gn("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var pr = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),
  Oh = new Set("cancel close invalid load scroll toggle".split(" ").concat(pr));
function qa(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, Rp(r, t, void 0, e), e.currentTarget = null;
}
function od(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n],
      s = r.event;
    r = r.listeners;
    e: {
      var o = void 0;
      if (t) for (var l = r.length - 1; 0 <= l; l--) {
        var a = r[l],
          u = a.instance,
          d = a.currentTarget;
        if (a = a.listener, u !== o && s.isPropagationStopped()) break e;
        qa(s, a, d), o = u;
      } else for (l = 0; l < r.length; l++) {
        if (a = r[l], u = a.instance, d = a.currentTarget, a = a.listener, u !== o && s.isPropagationStopped()) break e;
        qa(s, a, d), o = u;
      }
    }
  }
  if (zs) throw e = _l, zs = !1, _l = null, e;
}
function re(e, t) {
  var n = t[Dl];
  n === void 0 && (n = t[Dl] = new Set());
  var r = e + "__bubble";
  n.has(r) || (ld(t, e, 2, !1), n.add(r));
}
function Ho(e, t, n) {
  var r = 0;
  t && (r |= 4), ld(n, e, r, t);
}
var is = "_reactListening" + Math.random().toString(36).slice(2);
function Or(e) {
  if (!e[is]) {
    e[is] = !0, pc.forEach(function (n) {
      n !== "selectionchange" && (Oh.has(n) || Ho(n, !1, e), Ho(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[is] || (t[is] = !0, Ho("selectionchange", !1, t));
  }
}
function ld(e, t, n, r) {
  switch (Hc(t)) {
    case 1:
      var s = Qp;
      break;
    case 4:
      s = qp;
      break;
    default:
      s = _i;
  }
  n = s.bind(null, t, n, e), s = void 0, !Cl || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (s = !0), r ? s !== void 0 ? e.addEventListener(t, n, {
    capture: !0,
    passive: s
  }) : e.addEventListener(t, n, !0) : s !== void 0 ? e.addEventListener(t, n, {
    passive: s
  }) : e.addEventListener(t, n, !1);
}
function Wo(e, t, n, r, s) {
  var o = r;
  if (!(t & 1) && !(t & 2) && r !== null) e: for (;;) {
    if (r === null) return;
    var l = r.tag;
    if (l === 3 || l === 4) {
      var a = r.stateNode.containerInfo;
      if (a === s || a.nodeType === 8 && a.parentNode === s) break;
      if (l === 4) for (l = r.return; l !== null;) {
        var u = l.tag;
        if ((u === 3 || u === 4) && (u = l.stateNode.containerInfo, u === s || u.nodeType === 8 && u.parentNode === s)) return;
        l = l.return;
      }
      for (; a !== null;) {
        if (l = tn(a), l === null) return;
        if (u = l.tag, u === 5 || u === 6) {
          r = o = l;
          continue e;
        }
        a = a.parentNode;
      }
    }
    r = r.return;
  }
  Tc(function () {
    var d = o,
      c = Ni(n),
      h = [];
    e: {
      var x = sd.get(e);
      if (x !== void 0) {
        var v = Ri,
          g = e;
        switch (e) {
          case "keypress":
            if (Ss(n) === 0) break e;
          case "keydown":
          case "keyup":
            v = ah;
            break;
          case "focusin":
            g = "focus", v = Io;
            break;
          case "focusout":
            g = "blur", v = Io;
            break;
          case "beforeblur":
          case "afterblur":
            v = Io;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            v = za;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            v = Gp;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            v = dh;
            break;
          case ed:
          case td:
          case nd:
            v = Zp;
            break;
          case rd:
            v = ph;
            break;
          case "scroll":
            v = Kp;
            break;
          case "wheel":
            v = mh;
            break;
          case "copy":
          case "cut":
          case "paste":
            v = th;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            v = Ia;
        }
        var y = (t & 4) !== 0,
          S = !y && e === "scroll",
          m = y ? x !== null ? x + "Capture" : null : x;
        y = [];
        for (var p = d, f; p !== null;) {
          f = p;
          var w = f.stateNode;
          if (f.tag === 5 && w !== null && (f = w, m !== null && (w = jr(p, m), w != null && y.push(Pr(p, w, f)))), S) break;
          p = p.return;
        }
        0 < y.length && (x = new v(x, g, null, n, c), h.push({
          event: x,
          listeners: y
        }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (x = e === "mouseover" || e === "pointerover", v = e === "mouseout" || e === "pointerout", x && n !== El && (g = n.relatedTarget || n.fromElement) && (tn(g) || g[jt])) break e;
        if ((v || x) && (x = c.window === c ? c : (x = c.ownerDocument) ? x.defaultView || x.parentWindow : window, v ? (g = n.relatedTarget || n.toElement, v = d, g = g ? tn(g) : null, g !== null && (S = yn(g), g !== S || g.tag !== 5 && g.tag !== 6) && (g = null)) : (v = null, g = d), v !== g)) {
          if (y = za, w = "onMouseLeave", m = "onMouseEnter", p = "mouse", (e === "pointerout" || e === "pointerover") && (y = Ia, w = "onPointerLeave", m = "onPointerEnter", p = "pointer"), S = v == null ? x : _n(v), f = g == null ? x : _n(g), x = new y(w, p + "leave", v, n, c), x.target = S, x.relatedTarget = f, w = null, tn(c) === d && (y = new y(m, p + "enter", g, n, c), y.target = f, y.relatedTarget = S, w = y), S = w, v && g) t: {
            for (y = v, m = g, p = 0, f = y; f; f = vn(f)) p++;
            for (f = 0, w = m; w; w = vn(w)) f++;
            for (; 0 < p - f;) y = vn(y), p--;
            for (; 0 < f - p;) m = vn(m), f--;
            for (; p--;) {
              if (y === m || m !== null && y === m.alternate) break t;
              y = vn(y), m = vn(m);
            }
            y = null;
          } else y = null;
          v !== null && Ka(h, x, v, y, !1), g !== null && S !== null && Ka(h, S, g, y, !0);
        }
      }
      e: {
        if (x = d ? _n(d) : window, v = x.nodeName && x.nodeName.toLowerCase(), v === "select" || v === "input" && x.type === "file") var j = Sh;else if ($a(x)) {
          if (Xc) j = jh;else {
            j = Nh;
            var A = bh;
          }
        } else (v = x.nodeName) && v.toLowerCase() === "input" && (x.type === "checkbox" || x.type === "radio") && (j = Eh);
        if (j && (j = j(e, d))) {
          Kc(h, j, n, c);
          break e;
        }
        A && A(e, x, d), e === "focusout" && (A = x._wrapperState) && A.controlled && x.type === "number" && wl(x, "number", x.value);
      }
      switch (A = d ? _n(d) : window, e) {
        case "focusin":
          ($a(A) || A.contentEditable === "true") && (jn = A, Ol = d, yr = null);
          break;
        case "focusout":
          yr = Ol = jn = null;
          break;
        case "mousedown":
          Pl = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Pl = !1, Va(h, n, c);
          break;
        case "selectionchange":
          if (Th) break;
        case "keydown":
        case "keyup":
          Va(h, n, c);
      }
      var _;
      if (Oi) e: {
        switch (e) {
          case "compositionstart":
            var P = "onCompositionStart";
            break e;
          case "compositionend":
            P = "onCompositionEnd";
            break e;
          case "compositionupdate":
            P = "onCompositionUpdate";
            break e;
        }
        P = void 0;
      } else En ? Qc(e, n) && (P = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (P = "onCompositionStart");
      P && (Vc && n.locale !== "ko" && (En || P !== "onCompositionStart" ? P === "onCompositionEnd" && En && (_ = Wc()) : (It = c, Ti = "value" in It ? It.value : It.textContent, En = !0)), A = $s(d, P), 0 < A.length && (P = new Ma(P, e, null, n, c), h.push({
        event: P,
        listeners: A
      }), _ ? P.data = _ : (_ = qc(n), _ !== null && (P.data = _)))), (_ = gh ? yh(e, n) : vh(e, n)) && (d = $s(d, "onBeforeInput"), 0 < d.length && (c = new Ma("onBeforeInput", "beforeinput", null, n, c), h.push({
        event: c,
        listeners: d
      }), c.data = _));
    }
    od(h, t);
  });
}
function Pr(e, t, n) {
  return {
    instance: e,
    listener: t,
    currentTarget: n
  };
}
function $s(e, t) {
  for (var n = t + "Capture", r = []; e !== null;) {
    var s = e,
      o = s.stateNode;
    s.tag === 5 && o !== null && (s = o, o = jr(e, n), o != null && r.unshift(Pr(e, o, s)), o = jr(e, t), o != null && r.push(Pr(e, o, s))), e = e.return;
  }
  return r;
}
function vn(e) {
  if (e === null) return null;
  do e = e.return; while (e && e.tag !== 5);
  return e || null;
}
function Ka(e, t, n, r, s) {
  for (var o = t._reactName, l = []; n !== null && n !== r;) {
    var a = n,
      u = a.alternate,
      d = a.stateNode;
    if (u !== null && u === r) break;
    a.tag === 5 && d !== null && (a = d, s ? (u = jr(n, o), u != null && l.unshift(Pr(n, u, a))) : s || (u = jr(n, o), u != null && l.push(Pr(n, u, a)))), n = n.return;
  }
  l.length !== 0 && e.push({
    event: t,
    listeners: l
  });
}
var Ph = /\r\n?/g,
  Lh = /\u0000|\uFFFD/g;
function Xa(e) {
  return (typeof e == "string" ? e : "" + e).replace(Ph, `
`).replace(Lh, "");
}
function as(e, t, n) {
  if (t = Xa(t), Xa(e) !== t && n) throw Error(R(425));
}
function Us() {}
var Ll = null,
  zl = null;
function Ml(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var Il = typeof setTimeout == "function" ? setTimeout : void 0,
  zh = typeof clearTimeout == "function" ? clearTimeout : void 0,
  Ga = typeof Promise == "function" ? Promise : void 0,
  Mh = typeof queueMicrotask == "function" ? queueMicrotask : typeof Ga < "u" ? function (e) {
    return Ga.resolve(null).then(e).catch(Ih);
  } : Il;
function Ih(e) {
  setTimeout(function () {
    throw e;
  });
}
function Vo(e, t) {
  var n = t,
    r = 0;
  do {
    var s = n.nextSibling;
    if (e.removeChild(n), s && s.nodeType === 8) if (n = s.data, n === "/$") {
      if (r === 0) {
        e.removeChild(s), Tr(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = s;
  } while (n);
  Tr(t);
}
function Bt(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function Ya(e) {
  e = e.previousSibling;
  for (var t = 0; e;) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var Zn = Math.random().toString(36).slice(2),
  pt = "__reactFiber$" + Zn,
  Lr = "__reactProps$" + Zn,
  jt = "__reactContainer$" + Zn,
  Dl = "__reactEvents$" + Zn,
  Dh = "__reactListeners$" + Zn,
  Fh = "__reactHandles$" + Zn;
function tn(e) {
  var t = e[pt];
  if (t) return t;
  for (var n = e.parentNode; n;) {
    if (t = n[jt] || n[pt]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Ya(e); e !== null;) {
        if (n = e[pt]) return n;
        e = Ya(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function Vr(e) {
  return e = e[pt] || e[jt], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function _n(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(R(33));
}
function co(e) {
  return e[Lr] || null;
}
var Fl = [],
  Tn = -1;
function Yt(e) {
  return {
    current: e
  };
}
function se(e) {
  0 > Tn || (e.current = Fl[Tn], Fl[Tn] = null, Tn--);
}
function te(e, t) {
  Tn++, Fl[Tn] = e.current, e.current = t;
}
var Xt = {},
  Ee = Yt(Xt),
  Pe = Yt(!1),
  dn = Xt;
function Hn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Xt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var s = {},
    o;
  for (o in n) s[o] = t[o];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = s), s;
}
function Le(e) {
  return e = e.childContextTypes, e != null;
}
function Bs() {
  se(Pe), se(Ee);
}
function Ja(e, t, n) {
  if (Ee.current !== Xt) throw Error(R(168));
  te(Ee, t), te(Pe, n);
}
function id(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var s in r) if (!(s in t)) throw Error(R(108, bp(e) || "Unknown", s));
  return ae({}, n, r);
}
function Hs(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Xt, dn = Ee.current, te(Ee, e), te(Pe, Pe.current), !0;
}
function Za(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(R(169));
  n ? (e = id(e, t, dn), r.__reactInternalMemoizedMergedChildContext = e, se(Pe), se(Ee), te(Ee, e)) : se(Pe), te(Pe, n);
}
var wt = null,
  fo = !1,
  Qo = !1;
function ad(e) {
  wt === null ? wt = [e] : wt.push(e);
}
function $h(e) {
  fo = !0, ad(e);
}
function Jt() {
  if (!Qo && wt !== null) {
    Qo = !0;
    var e = 0,
      t = Y;
    try {
      var n = wt;
      for (Y = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0); while (r !== null);
      }
      wt = null, fo = !1;
    } catch (s) {
      throw wt !== null && (wt = wt.slice(e + 1)), Pc(Ei, Jt), s;
    } finally {
      Y = t, Qo = !1;
    }
  }
  return null;
}
var Rn = [],
  An = 0,
  Ws = null,
  Vs = 0,
  Qe = [],
  qe = 0,
  fn = null,
  St = 1,
  bt = "";
function Zt(e, t) {
  Rn[An++] = Vs, Rn[An++] = Ws, Ws = e, Vs = t;
}
function ud(e, t, n) {
  Qe[qe++] = St, Qe[qe++] = bt, Qe[qe++] = fn, fn = e;
  var r = St;
  e = bt;
  var s = 32 - st(r) - 1;
  r &= ~(1 << s), n += 1;
  var o = 32 - st(t) + s;
  if (30 < o) {
    var l = s - s % 5;
    o = (r & (1 << l) - 1).toString(32), r >>= l, s -= l, St = 1 << 32 - st(t) + s | n << s | r, bt = o + e;
  } else St = 1 << o | n << s | r, bt = e;
}
function Li(e) {
  e.return !== null && (Zt(e, 1), ud(e, 1, 0));
}
function zi(e) {
  for (; e === Ws;) Ws = Rn[--An], Rn[An] = null, Vs = Rn[--An], Rn[An] = null;
  for (; e === fn;) fn = Qe[--qe], Qe[qe] = null, bt = Qe[--qe], Qe[qe] = null, St = Qe[--qe], Qe[qe] = null;
}
var $e = null,
  Fe = null,
  oe = !1,
  rt = null;
function cd(e, t) {
  var n = Xe(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function eu(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, $e = e, Fe = Bt(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, $e = e, Fe = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = fn !== null ? {
        id: St,
        overflow: bt
      } : null, e.memoizedState = {
        dehydrated: t,
        treeContext: n,
        retryLane: 1073741824
      }, n = Xe(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, $e = e, Fe = null, !0) : !1;
    default:
      return !1;
  }
}
function $l(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Ul(e) {
  if (oe) {
    var t = Fe;
    if (t) {
      var n = t;
      if (!eu(e, t)) {
        if ($l(e)) throw Error(R(418));
        t = Bt(n.nextSibling);
        var r = $e;
        t && eu(e, t) ? cd(r, n) : (e.flags = e.flags & -4097 | 2, oe = !1, $e = e);
      }
    } else {
      if ($l(e)) throw Error(R(418));
      e.flags = e.flags & -4097 | 2, oe = !1, $e = e;
    }
  }
}
function tu(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;) e = e.return;
  $e = e;
}
function us(e) {
  if (e !== $e) return !1;
  if (!oe) return tu(e), oe = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !Ml(e.type, e.memoizedProps)), t && (t = Fe)) {
    if ($l(e)) throw dd(), Error(R(418));
    for (; t;) cd(e, t), t = Bt(t.nextSibling);
  }
  if (tu(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(R(317));
    e: {
      for (e = e.nextSibling, t = 0; e;) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Fe = Bt(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      Fe = null;
    }
  } else Fe = $e ? Bt(e.stateNode.nextSibling) : null;
  return !0;
}
function dd() {
  for (var e = Fe; e;) e = Bt(e.nextSibling);
}
function Wn() {
  Fe = $e = null, oe = !1;
}
function Mi(e) {
  rt === null ? rt = [e] : rt.push(e);
}
var Uh = Tt.ReactCurrentBatchConfig;
function lr(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(R(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(R(147, e));
      var s = r,
        o = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === o ? t.ref : (t = function (l) {
        var a = s.refs;
        l === null ? delete a[o] : a[o] = l;
      }, t._stringRef = o, t);
    }
    if (typeof e != "string") throw Error(R(284));
    if (!n._owner) throw Error(R(290, e));
  }
  return e;
}
function cs(e, t) {
  throw e = Object.prototype.toString.call(t), Error(R(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function nu(e) {
  var t = e._init;
  return t(e._payload);
}
function fd(e) {
  function t(m, p) {
    if (e) {
      var f = m.deletions;
      f === null ? (m.deletions = [p], m.flags |= 16) : f.push(p);
    }
  }
  function n(m, p) {
    if (!e) return null;
    for (; p !== null;) t(m, p), p = p.sibling;
    return null;
  }
  function r(m, p) {
    for (m = new Map(); p !== null;) p.key !== null ? m.set(p.key, p) : m.set(p.index, p), p = p.sibling;
    return m;
  }
  function s(m, p) {
    return m = Qt(m, p), m.index = 0, m.sibling = null, m;
  }
  function o(m, p, f) {
    return m.index = f, e ? (f = m.alternate, f !== null ? (f = f.index, f < p ? (m.flags |= 2, p) : f) : (m.flags |= 2, p)) : (m.flags |= 1048576, p);
  }
  function l(m) {
    return e && m.alternate === null && (m.flags |= 2), m;
  }
  function a(m, p, f, w) {
    return p === null || p.tag !== 6 ? (p = Zo(f, m.mode, w), p.return = m, p) : (p = s(p, f), p.return = m, p);
  }
  function u(m, p, f, w) {
    var j = f.type;
    return j === Nn ? c(m, p, f.props.children, w, f.key) : p !== null && (p.elementType === j || typeof j == "object" && j !== null && j.$$typeof === Pt && nu(j) === p.type) ? (w = s(p, f.props), w.ref = lr(m, p, f), w.return = m, w) : (w = Ts(f.type, f.key, f.props, null, m.mode, w), w.ref = lr(m, p, f), w.return = m, w);
  }
  function d(m, p, f, w) {
    return p === null || p.tag !== 4 || p.stateNode.containerInfo !== f.containerInfo || p.stateNode.implementation !== f.implementation ? (p = el(f, m.mode, w), p.return = m, p) : (p = s(p, f.children || []), p.return = m, p);
  }
  function c(m, p, f, w, j) {
    return p === null || p.tag !== 7 ? (p = un(f, m.mode, w, j), p.return = m, p) : (p = s(p, f), p.return = m, p);
  }
  function h(m, p, f) {
    if (typeof p == "string" && p !== "" || typeof p == "number") return p = Zo("" + p, m.mode, f), p.return = m, p;
    if (typeof p == "object" && p !== null) {
      switch (p.$$typeof) {
        case Zr:
          return f = Ts(p.type, p.key, p.props, null, m.mode, f), f.ref = lr(m, null, p), f.return = m, f;
        case bn:
          return p = el(p, m.mode, f), p.return = m, p;
        case Pt:
          var w = p._init;
          return h(m, w(p._payload), f);
      }
      if (dr(p) || tr(p)) return p = un(p, m.mode, f, null), p.return = m, p;
      cs(m, p);
    }
    return null;
  }
  function x(m, p, f, w) {
    var j = p !== null ? p.key : null;
    if (typeof f == "string" && f !== "" || typeof f == "number") return j !== null ? null : a(m, p, "" + f, w);
    if (typeof f == "object" && f !== null) {
      switch (f.$$typeof) {
        case Zr:
          return f.key === j ? u(m, p, f, w) : null;
        case bn:
          return f.key === j ? d(m, p, f, w) : null;
        case Pt:
          return j = f._init, x(m, p, j(f._payload), w);
      }
      if (dr(f) || tr(f)) return j !== null ? null : c(m, p, f, w, null);
      cs(m, f);
    }
    return null;
  }
  function v(m, p, f, w, j) {
    if (typeof w == "string" && w !== "" || typeof w == "number") return m = m.get(f) || null, a(p, m, "" + w, j);
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case Zr:
          return m = m.get(w.key === null ? f : w.key) || null, u(p, m, w, j);
        case bn:
          return m = m.get(w.key === null ? f : w.key) || null, d(p, m, w, j);
        case Pt:
          var A = w._init;
          return v(m, p, f, A(w._payload), j);
      }
      if (dr(w) || tr(w)) return m = m.get(f) || null, c(p, m, w, j, null);
      cs(p, w);
    }
    return null;
  }
  function g(m, p, f, w) {
    for (var j = null, A = null, _ = p, P = p = 0, U = null; _ !== null && P < f.length; P++) {
      _.index > P ? (U = _, _ = null) : U = _.sibling;
      var F = x(m, _, f[P], w);
      if (F === null) {
        _ === null && (_ = U);
        break;
      }
      e && _ && F.alternate === null && t(m, _), p = o(F, p, P), A === null ? j = F : A.sibling = F, A = F, _ = U;
    }
    if (P === f.length) return n(m, _), oe && Zt(m, P), j;
    if (_ === null) {
      for (; P < f.length; P++) _ = h(m, f[P], w), _ !== null && (p = o(_, p, P), A === null ? j = _ : A.sibling = _, A = _);
      return oe && Zt(m, P), j;
    }
    for (_ = r(m, _); P < f.length; P++) U = v(_, m, P, f[P], w), U !== null && (e && U.alternate !== null && _.delete(U.key === null ? P : U.key), p = o(U, p, P), A === null ? j = U : A.sibling = U, A = U);
    return e && _.forEach(function (Q) {
      return t(m, Q);
    }), oe && Zt(m, P), j;
  }
  function y(m, p, f, w) {
    var j = tr(f);
    if (typeof j != "function") throw Error(R(150));
    if (f = j.call(f), f == null) throw Error(R(151));
    for (var A = j = null, _ = p, P = p = 0, U = null, F = f.next(); _ !== null && !F.done; P++, F = f.next()) {
      _.index > P ? (U = _, _ = null) : U = _.sibling;
      var Q = x(m, _, F.value, w);
      if (Q === null) {
        _ === null && (_ = U);
        break;
      }
      e && _ && Q.alternate === null && t(m, _), p = o(Q, p, P), A === null ? j = Q : A.sibling = Q, A = Q, _ = U;
    }
    if (F.done) return n(m, _), oe && Zt(m, P), j;
    if (_ === null) {
      for (; !F.done; P++, F = f.next()) F = h(m, F.value, w), F !== null && (p = o(F, p, P), A === null ? j = F : A.sibling = F, A = F);
      return oe && Zt(m, P), j;
    }
    for (_ = r(m, _); !F.done; P++, F = f.next()) F = v(_, m, P, F.value, w), F !== null && (e && F.alternate !== null && _.delete(F.key === null ? P : F.key), p = o(F, p, P), A === null ? j = F : A.sibling = F, A = F);
    return e && _.forEach(function (ce) {
      return t(m, ce);
    }), oe && Zt(m, P), j;
  }
  function S(m, p, f, w) {
    if (typeof f == "object" && f !== null && f.type === Nn && f.key === null && (f = f.props.children), typeof f == "object" && f !== null) {
      switch (f.$$typeof) {
        case Zr:
          e: {
            for (var j = f.key, A = p; A !== null;) {
              if (A.key === j) {
                if (j = f.type, j === Nn) {
                  if (A.tag === 7) {
                    n(m, A.sibling), p = s(A, f.props.children), p.return = m, m = p;
                    break e;
                  }
                } else if (A.elementType === j || typeof j == "object" && j !== null && j.$$typeof === Pt && nu(j) === A.type) {
                  n(m, A.sibling), p = s(A, f.props), p.ref = lr(m, A, f), p.return = m, m = p;
                  break e;
                }
                n(m, A);
                break;
              } else t(m, A);
              A = A.sibling;
            }
            f.type === Nn ? (p = un(f.props.children, m.mode, w, f.key), p.return = m, m = p) : (w = Ts(f.type, f.key, f.props, null, m.mode, w), w.ref = lr(m, p, f), w.return = m, m = w);
          }
          return l(m);
        case bn:
          e: {
            for (A = f.key; p !== null;) {
              if (p.key === A) {
                if (p.tag === 4 && p.stateNode.containerInfo === f.containerInfo && p.stateNode.implementation === f.implementation) {
                  n(m, p.sibling), p = s(p, f.children || []), p.return = m, m = p;
                  break e;
                } else {
                  n(m, p);
                  break;
                }
              } else t(m, p);
              p = p.sibling;
            }
            p = el(f, m.mode, w), p.return = m, m = p;
          }
          return l(m);
        case Pt:
          return A = f._init, S(m, p, A(f._payload), w);
      }
      if (dr(f)) return g(m, p, f, w);
      if (tr(f)) return y(m, p, f, w);
      cs(m, f);
    }
    return typeof f == "string" && f !== "" || typeof f == "number" ? (f = "" + f, p !== null && p.tag === 6 ? (n(m, p.sibling), p = s(p, f), p.return = m, m = p) : (n(m, p), p = Zo(f, m.mode, w), p.return = m, m = p), l(m)) : n(m, p);
  }
  return S;
}
var Vn = fd(!0),
  pd = fd(!1),
  Qs = Yt(null),
  qs = null,
  On = null,
  Ii = null;
function Di() {
  Ii = On = qs = null;
}
function Fi(e) {
  var t = Qs.current;
  se(Qs), e._currentValue = t;
}
function Bl(e, t, n) {
  for (; e !== null;) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function Fn(e, t) {
  qs = e, Ii = On = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (Oe = !0), e.firstContext = null);
}
function Ye(e) {
  var t = e._currentValue;
  if (Ii !== e) if (e = {
    context: e,
    memoizedValue: t,
    next: null
  }, On === null) {
    if (qs === null) throw Error(R(308));
    On = e, qs.dependencies = {
      lanes: 0,
      firstContext: e
    };
  } else On = On.next = e;
  return t;
}
var nn = null;
function $i(e) {
  nn === null ? nn = [e] : nn.push(e);
}
function hd(e, t, n, r) {
  var s = t.interleaved;
  return s === null ? (n.next = n, $i(t)) : (n.next = s.next, s.next = n), t.interleaved = n, Ct(e, r);
}
function Ct(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null;) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var Lt = !1;
function Ui(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      pending: null,
      interleaved: null,
      lanes: 0
    },
    effects: null
  };
}
function md(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
    baseState: e.baseState,
    firstBaseUpdate: e.firstBaseUpdate,
    lastBaseUpdate: e.lastBaseUpdate,
    shared: e.shared,
    effects: e.effects
  });
}
function Nt(e, t) {
  return {
    eventTime: e,
    lane: t,
    tag: 0,
    payload: null,
    callback: null,
    next: null
  };
}
function Ht(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, X & 2) {
    var s = r.pending;
    return s === null ? t.next = t : (t.next = s.next, s.next = t), r.pending = t, Ct(e, n);
  }
  return s = r.interleaved, s === null ? (t.next = t, $i(r)) : (t.next = s.next, s.next = t), r.interleaved = t, Ct(e, n);
}
function bs(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, ji(e, n);
  }
}
function ru(e, t) {
  var n = e.updateQueue,
    r = e.alternate;
  if (r !== null && (r = r.updateQueue, n === r)) {
    var s = null,
      o = null;
    if (n = n.firstBaseUpdate, n !== null) {
      do {
        var l = {
          eventTime: n.eventTime,
          lane: n.lane,
          tag: n.tag,
          payload: n.payload,
          callback: n.callback,
          next: null
        };
        o === null ? s = o = l : o = o.next = l, n = n.next;
      } while (n !== null);
      o === null ? s = o = t : o = o.next = t;
    } else s = o = t;
    n = {
      baseState: r.baseState,
      firstBaseUpdate: s,
      lastBaseUpdate: o,
      shared: r.shared,
      effects: r.effects
    }, e.updateQueue = n;
    return;
  }
  e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
}
function Ks(e, t, n, r) {
  var s = e.updateQueue;
  Lt = !1;
  var o = s.firstBaseUpdate,
    l = s.lastBaseUpdate,
    a = s.shared.pending;
  if (a !== null) {
    s.shared.pending = null;
    var u = a,
      d = u.next;
    u.next = null, l === null ? o = d : l.next = d, l = u;
    var c = e.alternate;
    c !== null && (c = c.updateQueue, a = c.lastBaseUpdate, a !== l && (a === null ? c.firstBaseUpdate = d : a.next = d, c.lastBaseUpdate = u));
  }
  if (o !== null) {
    var h = s.baseState;
    l = 0, c = d = u = null, a = o;
    do {
      var x = a.lane,
        v = a.eventTime;
      if ((r & x) === x) {
        c !== null && (c = c.next = {
          eventTime: v,
          lane: 0,
          tag: a.tag,
          payload: a.payload,
          callback: a.callback,
          next: null
        });
        e: {
          var g = e,
            y = a;
          switch (x = t, v = n, y.tag) {
            case 1:
              if (g = y.payload, typeof g == "function") {
                h = g.call(v, h, x);
                break e;
              }
              h = g;
              break e;
            case 3:
              g.flags = g.flags & -65537 | 128;
            case 0:
              if (g = y.payload, x = typeof g == "function" ? g.call(v, h, x) : g, x == null) break e;
              h = ae({}, h, x);
              break e;
            case 2:
              Lt = !0;
          }
        }
        a.callback !== null && a.lane !== 0 && (e.flags |= 64, x = s.effects, x === null ? s.effects = [a] : x.push(a));
      } else v = {
        eventTime: v,
        lane: x,
        tag: a.tag,
        payload: a.payload,
        callback: a.callback,
        next: null
      }, c === null ? (d = c = v, u = h) : c = c.next = v, l |= x;
      if (a = a.next, a === null) {
        if (a = s.shared.pending, a === null) break;
        x = a, a = x.next, x.next = null, s.lastBaseUpdate = x, s.shared.pending = null;
      }
    } while (!0);
    if (c === null && (u = h), s.baseState = u, s.firstBaseUpdate = d, s.lastBaseUpdate = c, t = s.shared.interleaved, t !== null) {
      s = t;
      do l |= s.lane, s = s.next; while (s !== t);
    } else o === null && (s.shared.lanes = 0);
    hn |= l, e.lanes = l, e.memoizedState = h;
  }
}
function su(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t],
      s = r.callback;
    if (s !== null) {
      if (r.callback = null, r = n, typeof s != "function") throw Error(R(191, s));
      s.call(r);
    }
  }
}
var Qr = {},
  mt = Yt(Qr),
  zr = Yt(Qr),
  Mr = Yt(Qr);
function rn(e) {
  if (e === Qr) throw Error(R(174));
  return e;
}
function Bi(e, t) {
  switch (te(Mr, t), te(zr, e), te(mt, Qr), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Sl(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Sl(t, e);
  }
  se(mt), te(mt, t);
}
function Qn() {
  se(mt), se(zr), se(Mr);
}
function xd(e) {
  rn(Mr.current);
  var t = rn(mt.current),
    n = Sl(t, e.type);
  t !== n && (te(zr, e), te(mt, n));
}
function Hi(e) {
  zr.current === e && (se(mt), se(zr));
}
var le = Yt(0);
function Xs(e) {
  for (var t = e; t !== null;) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      t.child.return = t, t = t.child;
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null;) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    t.sibling.return = t.return, t = t.sibling;
  }
  return null;
}
var qo = [];
function Wi() {
  for (var e = 0; e < qo.length; e++) qo[e]._workInProgressVersionPrimary = null;
  qo.length = 0;
}
var Ns = Tt.ReactCurrentDispatcher,
  Ko = Tt.ReactCurrentBatchConfig,
  pn = 0,
  ie = null,
  he = null,
  xe = null,
  Gs = !1,
  vr = !1,
  Ir = 0,
  Bh = 0;
function ke() {
  throw Error(R(321));
}
function Vi(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!lt(e[n], t[n])) return !1;
  return !0;
}
function Qi(e, t, n, r, s, o) {
  if (pn = o, ie = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Ns.current = e === null || e.memoizedState === null ? Qh : qh, e = n(r, s), vr) {
    o = 0;
    do {
      if (vr = !1, Ir = 0, 25 <= o) throw Error(R(301));
      o += 1, xe = he = null, t.updateQueue = null, Ns.current = Kh, e = n(r, s);
    } while (vr);
  }
  if (Ns.current = Ys, t = he !== null && he.next !== null, pn = 0, xe = he = ie = null, Gs = !1, t) throw Error(R(300));
  return e;
}
function qi() {
  var e = Ir !== 0;
  return Ir = 0, e;
}
function ft() {
  var e = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  return xe === null ? ie.memoizedState = xe = e : xe = xe.next = e, xe;
}
function Je() {
  if (he === null) {
    var e = ie.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = he.next;
  var t = xe === null ? ie.memoizedState : xe.next;
  if (t !== null) xe = t, he = e;else {
    if (e === null) throw Error(R(310));
    he = e, e = {
      memoizedState: he.memoizedState,
      baseState: he.baseState,
      baseQueue: he.baseQueue,
      queue: he.queue,
      next: null
    }, xe === null ? ie.memoizedState = xe = e : xe = xe.next = e;
  }
  return xe;
}
function Dr(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function Xo(e) {
  var t = Je(),
    n = t.queue;
  if (n === null) throw Error(R(311));
  n.lastRenderedReducer = e;
  var r = he,
    s = r.baseQueue,
    o = n.pending;
  if (o !== null) {
    if (s !== null) {
      var l = s.next;
      s.next = o.next, o.next = l;
    }
    r.baseQueue = s = o, n.pending = null;
  }
  if (s !== null) {
    o = s.next, r = r.baseState;
    var a = l = null,
      u = null,
      d = o;
    do {
      var c = d.lane;
      if ((pn & c) === c) u !== null && (u = u.next = {
        lane: 0,
        action: d.action,
        hasEagerState: d.hasEagerState,
        eagerState: d.eagerState,
        next: null
      }), r = d.hasEagerState ? d.eagerState : e(r, d.action);else {
        var h = {
          lane: c,
          action: d.action,
          hasEagerState: d.hasEagerState,
          eagerState: d.eagerState,
          next: null
        };
        u === null ? (a = u = h, l = r) : u = u.next = h, ie.lanes |= c, hn |= c;
      }
      d = d.next;
    } while (d !== null && d !== o);
    u === null ? l = r : u.next = a, lt(r, t.memoizedState) || (Oe = !0), t.memoizedState = r, t.baseState = l, t.baseQueue = u, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    s = e;
    do o = s.lane, ie.lanes |= o, hn |= o, s = s.next; while (s !== e);
  } else s === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function Go(e) {
  var t = Je(),
    n = t.queue;
  if (n === null) throw Error(R(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch,
    s = n.pending,
    o = t.memoizedState;
  if (s !== null) {
    n.pending = null;
    var l = s = s.next;
    do o = e(o, l.action), l = l.next; while (l !== s);
    lt(o, t.memoizedState) || (Oe = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
  }
  return [o, r];
}
function gd() {}
function yd(e, t) {
  var n = ie,
    r = Je(),
    s = t(),
    o = !lt(r.memoizedState, s);
  if (o && (r.memoizedState = s, Oe = !0), r = r.queue, Ki(kd.bind(null, n, r, e), [e]), r.getSnapshot !== t || o || xe !== null && xe.memoizedState.tag & 1) {
    if (n.flags |= 2048, Fr(9, wd.bind(null, n, r, s, t), void 0, null), ge === null) throw Error(R(349));
    pn & 30 || vd(n, t, s);
  }
  return s;
}
function vd(e, t, n) {
  e.flags |= 16384, e = {
    getSnapshot: t,
    value: n
  }, t = ie.updateQueue, t === null ? (t = {
    lastEffect: null,
    stores: null
  }, ie.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function wd(e, t, n, r) {
  t.value = n, t.getSnapshot = r, Sd(t) && bd(e);
}
function kd(e, t, n) {
  return n(function () {
    Sd(t) && bd(e);
  });
}
function Sd(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !lt(e, n);
  } catch {
    return !0;
  }
}
function bd(e) {
  var t = Ct(e, 1);
  t !== null && ot(t, e, 1, -1);
}
function ou(e) {
  var t = ft();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = {
    pending: null,
    interleaved: null,
    lanes: 0,
    dispatch: null,
    lastRenderedReducer: Dr,
    lastRenderedState: e
  }, t.queue = e, e = e.dispatch = Vh.bind(null, ie, e), [t.memoizedState, e];
}
function Fr(e, t, n, r) {
  return e = {
    tag: e,
    create: t,
    destroy: n,
    deps: r,
    next: null
  }, t = ie.updateQueue, t === null ? (t = {
    lastEffect: null,
    stores: null
  }, ie.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function Nd() {
  return Je().memoizedState;
}
function Es(e, t, n, r) {
  var s = ft();
  ie.flags |= e, s.memoizedState = Fr(1 | t, n, void 0, r === void 0 ? null : r);
}
function po(e, t, n, r) {
  var s = Je();
  r = r === void 0 ? null : r;
  var o = void 0;
  if (he !== null) {
    var l = he.memoizedState;
    if (o = l.destroy, r !== null && Vi(r, l.deps)) {
      s.memoizedState = Fr(t, n, o, r);
      return;
    }
  }
  ie.flags |= e, s.memoizedState = Fr(1 | t, n, o, r);
}
function lu(e, t) {
  return Es(8390656, 8, e, t);
}
function Ki(e, t) {
  return po(2048, 8, e, t);
}
function Ed(e, t) {
  return po(4, 2, e, t);
}
function jd(e, t) {
  return po(4, 4, e, t);
}
function Cd(e, t) {
  if (typeof t == "function") return e = e(), t(e), function () {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function () {
    t.current = null;
  };
}
function _d(e, t, n) {
  return n = n != null ? n.concat([e]) : null, po(4, 4, Cd.bind(null, t, e), n);
}
function Xi() {}
function Td(e, t) {
  var n = Je();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Vi(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function Rd(e, t) {
  var n = Je();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Vi(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Ad(e, t, n) {
  return pn & 21 ? (lt(n, t) || (n = Mc(), ie.lanes |= n, hn |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, Oe = !0), e.memoizedState = n);
}
function Hh(e, t) {
  var n = Y;
  Y = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = Ko.transition;
  Ko.transition = {};
  try {
    e(!1), t();
  } finally {
    Y = n, Ko.transition = r;
  }
}
function Od() {
  return Je().memoizedState;
}
function Wh(e, t, n) {
  var r = Vt(e);
  if (n = {
    lane: r,
    action: n,
    hasEagerState: !1,
    eagerState: null,
    next: null
  }, Pd(e)) Ld(t, n);else if (n = hd(e, t, n, r), n !== null) {
    var s = Ce();
    ot(n, e, r, s), zd(n, t, r);
  }
}
function Vh(e, t, n) {
  var r = Vt(e),
    s = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
  if (Pd(e)) Ld(t, s);else {
    var o = e.alternate;
    if (e.lanes === 0 && (o === null || o.lanes === 0) && (o = t.lastRenderedReducer, o !== null)) try {
      var l = t.lastRenderedState,
        a = o(l, n);
      if (s.hasEagerState = !0, s.eagerState = a, lt(a, l)) {
        var u = t.interleaved;
        u === null ? (s.next = s, $i(t)) : (s.next = u.next, u.next = s), t.interleaved = s;
        return;
      }
    } catch {} finally {}
    n = hd(e, t, s, r), n !== null && (s = Ce(), ot(n, e, r, s), zd(n, t, r));
  }
}
function Pd(e) {
  var t = e.alternate;
  return e === ie || t !== null && t === ie;
}
function Ld(e, t) {
  vr = Gs = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function zd(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, ji(e, n);
  }
}
var Ys = {
    readContext: Ye,
    useCallback: ke,
    useContext: ke,
    useEffect: ke,
    useImperativeHandle: ke,
    useInsertionEffect: ke,
    useLayoutEffect: ke,
    useMemo: ke,
    useReducer: ke,
    useRef: ke,
    useState: ke,
    useDebugValue: ke,
    useDeferredValue: ke,
    useTransition: ke,
    useMutableSource: ke,
    useSyncExternalStore: ke,
    useId: ke,
    unstable_isNewReconciler: !1
  },
  Qh = {
    readContext: Ye,
    useCallback: function (e, t) {
      return ft().memoizedState = [e, t === void 0 ? null : t], e;
    },
    useContext: Ye,
    useEffect: lu,
    useImperativeHandle: function (e, t, n) {
      return n = n != null ? n.concat([e]) : null, Es(4194308, 4, Cd.bind(null, t, e), n);
    },
    useLayoutEffect: function (e, t) {
      return Es(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return Es(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = ft();
      return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
    },
    useReducer: function (e, t, n) {
      var r = ft();
      return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = {
        pending: null,
        interleaved: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: t
      }, r.queue = e, e = e.dispatch = Wh.bind(null, ie, e), [r.memoizedState, e];
    },
    useRef: function (e) {
      var t = ft();
      return e = {
        current: e
      }, t.memoizedState = e;
    },
    useState: ou,
    useDebugValue: Xi,
    useDeferredValue: function (e) {
      return ft().memoizedState = e;
    },
    useTransition: function () {
      var e = ou(!1),
        t = e[0];
      return e = Hh.bind(null, e[1]), ft().memoizedState = e, [t, e];
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = ie,
        s = ft();
      if (oe) {
        if (n === void 0) throw Error(R(407));
        n = n();
      } else {
        if (n = t(), ge === null) throw Error(R(349));
        pn & 30 || vd(r, t, n);
      }
      s.memoizedState = n;
      var o = {
        value: n,
        getSnapshot: t
      };
      return s.queue = o, lu(kd.bind(null, r, o, e), [e]), r.flags |= 2048, Fr(9, wd.bind(null, r, o, n, t), void 0, null), n;
    },
    useId: function () {
      var e = ft(),
        t = ge.identifierPrefix;
      if (oe) {
        var n = bt,
          r = St;
        n = (r & ~(1 << 32 - st(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = Ir++, 0 < n && (t += "H" + n.toString(32)), t += ":";
      } else n = Bh++, t = ":" + t + "r" + n.toString(32) + ":";
      return e.memoizedState = t;
    },
    unstable_isNewReconciler: !1
  },
  qh = {
    readContext: Ye,
    useCallback: Td,
    useContext: Ye,
    useEffect: Ki,
    useImperativeHandle: _d,
    useInsertionEffect: Ed,
    useLayoutEffect: jd,
    useMemo: Rd,
    useReducer: Xo,
    useRef: Nd,
    useState: function () {
      return Xo(Dr);
    },
    useDebugValue: Xi,
    useDeferredValue: function (e) {
      var t = Je();
      return Ad(t, he.memoizedState, e);
    },
    useTransition: function () {
      var e = Xo(Dr)[0],
        t = Je().memoizedState;
      return [e, t];
    },
    useMutableSource: gd,
    useSyncExternalStore: yd,
    useId: Od,
    unstable_isNewReconciler: !1
  },
  Kh = {
    readContext: Ye,
    useCallback: Td,
    useContext: Ye,
    useEffect: Ki,
    useImperativeHandle: _d,
    useInsertionEffect: Ed,
    useLayoutEffect: jd,
    useMemo: Rd,
    useReducer: Go,
    useRef: Nd,
    useState: function () {
      return Go(Dr);
    },
    useDebugValue: Xi,
    useDeferredValue: function (e) {
      var t = Je();
      return he === null ? t.memoizedState = e : Ad(t, he.memoizedState, e);
    },
    useTransition: function () {
      var e = Go(Dr)[0],
        t = Je().memoizedState;
      return [e, t];
    },
    useMutableSource: gd,
    useSyncExternalStore: yd,
    useId: Od,
    unstable_isNewReconciler: !1
  };
function tt(e, t) {
  if (e && e.defaultProps) {
    t = ae({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function Hl(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : ae({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var ho = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? yn(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = Ce(),
      s = Vt(e),
      o = Nt(r, s);
    o.payload = t, n != null && (o.callback = n), t = Ht(e, o, s), t !== null && (ot(t, e, s, r), bs(t, e, s));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = Ce(),
      s = Vt(e),
      o = Nt(r, s);
    o.tag = 1, o.payload = t, n != null && (o.callback = n), t = Ht(e, o, s), t !== null && (ot(t, e, s, r), bs(t, e, s));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = Ce(),
      r = Vt(e),
      s = Nt(n, r);
    s.tag = 2, t != null && (s.callback = t), t = Ht(e, s, r), t !== null && (ot(t, e, r, n), bs(t, e, r));
  }
};
function iu(e, t, n, r, s, o, l) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, o, l) : t.prototype && t.prototype.isPureReactComponent ? !Ar(n, r) || !Ar(s, o) : !0;
}
function Md(e, t, n) {
  var r = !1,
    s = Xt,
    o = t.contextType;
  return typeof o == "object" && o !== null ? o = Ye(o) : (s = Le(t) ? dn : Ee.current, r = t.contextTypes, o = (r = r != null) ? Hn(e, s) : Xt), t = new t(n, o), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = ho, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = s, e.__reactInternalMemoizedMaskedChildContext = o), t;
}
function au(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && ho.enqueueReplaceState(t, t.state, null);
}
function Wl(e, t, n, r) {
  var s = e.stateNode;
  s.props = n, s.state = e.memoizedState, s.refs = {}, Ui(e);
  var o = t.contextType;
  typeof o == "object" && o !== null ? s.context = Ye(o) : (o = Le(t) ? dn : Ee.current, s.context = Hn(e, o)), s.state = e.memoizedState, o = t.getDerivedStateFromProps, typeof o == "function" && (Hl(e, t, o, n), s.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof s.getSnapshotBeforeUpdate == "function" || typeof s.UNSAFE_componentWillMount != "function" && typeof s.componentWillMount != "function" || (t = s.state, typeof s.componentWillMount == "function" && s.componentWillMount(), typeof s.UNSAFE_componentWillMount == "function" && s.UNSAFE_componentWillMount(), t !== s.state && ho.enqueueReplaceState(s, s.state, null), Ks(e, n, s, r), s.state = e.memoizedState), typeof s.componentDidMount == "function" && (e.flags |= 4194308);
}
function qn(e, t) {
  try {
    var n = "",
      r = t;
    do n += Sp(r), r = r.return; while (r);
    var s = n;
  } catch (o) {
    s = `
Error generating stack: ` + o.message + `
` + o.stack;
  }
  return {
    value: e,
    source: t,
    stack: s,
    digest: null
  };
}
function Yo(e, t, n) {
  return {
    value: e,
    source: null,
    stack: n ?? null,
    digest: t ?? null
  };
}
function Vl(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var Xh = typeof WeakMap == "function" ? WeakMap : Map;
function Id(e, t, n) {
  n = Nt(-1, n), n.tag = 3, n.payload = {
    element: null
  };
  var r = t.value;
  return n.callback = function () {
    Zs || (Zs = !0, ti = r), Vl(e, t);
  }, n;
}
function Dd(e, t, n) {
  n = Nt(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var s = t.value;
    n.payload = function () {
      return r(s);
    }, n.callback = function () {
      Vl(e, t);
    };
  }
  var o = e.stateNode;
  return o !== null && typeof o.componentDidCatch == "function" && (n.callback = function () {
    Vl(e, t), typeof r != "function" && (Wt === null ? Wt = new Set([this]) : Wt.add(this));
    var l = t.stack;
    this.componentDidCatch(t.value, {
      componentStack: l !== null ? l : ""
    });
  }), n;
}
function uu(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Xh();
    var s = new Set();
    r.set(t, s);
  } else s = r.get(t), s === void 0 && (s = new Set(), r.set(t, s));
  s.has(n) || (s.add(n), e = u0.bind(null, e, t, n), t.then(e, e));
}
function cu(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function du(e, t, n, r, s) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = s, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = Nt(-1, 1), t.tag = 2, Ht(n, t, 1))), n.lanes |= 1), e);
}
var Gh = Tt.ReactCurrentOwner,
  Oe = !1;
function je(e, t, n, r) {
  t.child = e === null ? pd(t, null, n, r) : Vn(t, e.child, n, r);
}
function fu(e, t, n, r, s) {
  n = n.render;
  var o = t.ref;
  return Fn(t, s), r = Qi(e, t, n, r, o, s), n = qi(), e !== null && !Oe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~s, _t(e, t, s)) : (oe && n && Li(t), t.flags |= 1, je(e, t, r, s), t.child);
}
function pu(e, t, n, r, s) {
  if (e === null) {
    var o = n.type;
    return typeof o == "function" && !ra(o) && o.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = o, Fd(e, t, o, r, s)) : (e = Ts(n.type, null, r, t, t.mode, s), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (o = e.child, !(e.lanes & s)) {
    var l = o.memoizedProps;
    if (n = n.compare, n = n !== null ? n : Ar, n(l, r) && e.ref === t.ref) return _t(e, t, s);
  }
  return t.flags |= 1, e = Qt(o, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Fd(e, t, n, r, s) {
  if (e !== null) {
    var o = e.memoizedProps;
    if (Ar(o, r) && e.ref === t.ref) if (Oe = !1, t.pendingProps = r = o, (e.lanes & s) !== 0) e.flags & 131072 && (Oe = !0);else return t.lanes = e.lanes, _t(e, t, s);
  }
  return Ql(e, t, n, r, s);
}
function $d(e, t, n) {
  var r = t.pendingProps,
    s = r.children,
    o = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") {
    if (!(t.mode & 1)) t.memoizedState = {
      baseLanes: 0,
      cachePool: null,
      transitions: null
    }, te(Ln, De), De |= n;else {
      if (!(n & 1073741824)) return e = o !== null ? o.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = {
        baseLanes: e,
        cachePool: null,
        transitions: null
      }, t.updateQueue = null, te(Ln, De), De |= e, null;
      t.memoizedState = {
        baseLanes: 0,
        cachePool: null,
        transitions: null
      }, r = o !== null ? o.baseLanes : n, te(Ln, De), De |= r;
    }
  } else o !== null ? (r = o.baseLanes | n, t.memoizedState = null) : r = n, te(Ln, De), De |= r;
  return je(e, t, s, n), t.child;
}
function Ud(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function Ql(e, t, n, r, s) {
  var o = Le(n) ? dn : Ee.current;
  return o = Hn(t, o), Fn(t, s), n = Qi(e, t, n, r, o, s), r = qi(), e !== null && !Oe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~s, _t(e, t, s)) : (oe && r && Li(t), t.flags |= 1, je(e, t, n, s), t.child);
}
function hu(e, t, n, r, s) {
  if (Le(n)) {
    var o = !0;
    Hs(t);
  } else o = !1;
  if (Fn(t, s), t.stateNode === null) js(e, t), Md(t, n, r), Wl(t, n, r, s), r = !0;else if (e === null) {
    var l = t.stateNode,
      a = t.memoizedProps;
    l.props = a;
    var u = l.context,
      d = n.contextType;
    typeof d == "object" && d !== null ? d = Ye(d) : (d = Le(n) ? dn : Ee.current, d = Hn(t, d));
    var c = n.getDerivedStateFromProps,
      h = typeof c == "function" || typeof l.getSnapshotBeforeUpdate == "function";
    h || typeof l.UNSAFE_componentWillReceiveProps != "function" && typeof l.componentWillReceiveProps != "function" || (a !== r || u !== d) && au(t, l, r, d), Lt = !1;
    var x = t.memoizedState;
    l.state = x, Ks(t, r, l, s), u = t.memoizedState, a !== r || x !== u || Pe.current || Lt ? (typeof c == "function" && (Hl(t, n, c, r), u = t.memoizedState), (a = Lt || iu(t, n, a, r, x, u, d)) ? (h || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount()), typeof l.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof l.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = u), l.props = r, l.state = u, l.context = d, r = a) : (typeof l.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    l = t.stateNode, md(e, t), a = t.memoizedProps, d = t.type === t.elementType ? a : tt(t.type, a), l.props = d, h = t.pendingProps, x = l.context, u = n.contextType, typeof u == "object" && u !== null ? u = Ye(u) : (u = Le(n) ? dn : Ee.current, u = Hn(t, u));
    var v = n.getDerivedStateFromProps;
    (c = typeof v == "function" || typeof l.getSnapshotBeforeUpdate == "function") || typeof l.UNSAFE_componentWillReceiveProps != "function" && typeof l.componentWillReceiveProps != "function" || (a !== h || x !== u) && au(t, l, r, u), Lt = !1, x = t.memoizedState, l.state = x, Ks(t, r, l, s);
    var g = t.memoizedState;
    a !== h || x !== g || Pe.current || Lt ? (typeof v == "function" && (Hl(t, n, v, r), g = t.memoizedState), (d = Lt || iu(t, n, d, r, x, g, u) || !1) ? (c || typeof l.UNSAFE_componentWillUpdate != "function" && typeof l.componentWillUpdate != "function" || (typeof l.componentWillUpdate == "function" && l.componentWillUpdate(r, g, u), typeof l.UNSAFE_componentWillUpdate == "function" && l.UNSAFE_componentWillUpdate(r, g, u)), typeof l.componentDidUpdate == "function" && (t.flags |= 4), typeof l.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof l.componentDidUpdate != "function" || a === e.memoizedProps && x === e.memoizedState || (t.flags |= 4), typeof l.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && x === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = g), l.props = r, l.state = g, l.context = u, r = d) : (typeof l.componentDidUpdate != "function" || a === e.memoizedProps && x === e.memoizedState || (t.flags |= 4), typeof l.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && x === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return ql(e, t, n, r, o, s);
}
function ql(e, t, n, r, s, o) {
  Ud(e, t);
  var l = (t.flags & 128) !== 0;
  if (!r && !l) return s && Za(t, n, !1), _t(e, t, o);
  r = t.stateNode, Gh.current = t;
  var a = l && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && l ? (t.child = Vn(t, e.child, null, o), t.child = Vn(t, null, a, o)) : je(e, t, a, o), t.memoizedState = r.state, s && Za(t, n, !0), t.child;
}
function Bd(e) {
  var t = e.stateNode;
  t.pendingContext ? Ja(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Ja(e, t.context, !1), Bi(e, t.containerInfo);
}
function mu(e, t, n, r, s) {
  return Wn(), Mi(s), t.flags |= 256, je(e, t, n, r), t.child;
}
var Kl = {
  dehydrated: null,
  treeContext: null,
  retryLane: 0
};
function Xl(e) {
  return {
    baseLanes: e,
    cachePool: null,
    transitions: null
  };
}
function Hd(e, t, n) {
  var r = t.pendingProps,
    s = le.current,
    o = !1,
    l = (t.flags & 128) !== 0,
    a;
  if ((a = l) || (a = e !== null && e.memoizedState === null ? !1 : (s & 2) !== 0), a ? (o = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (s |= 1), te(le, s & 1), e === null) return Ul(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (l = r.children, e = r.fallback, o ? (r = t.mode, o = t.child, l = {
    mode: "hidden",
    children: l
  }, !(r & 1) && o !== null ? (o.childLanes = 0, o.pendingProps = l) : o = go(l, r, 0, null), e = un(e, r, n, null), o.return = t, e.return = t, o.sibling = e, t.child = o, t.child.memoizedState = Xl(n), t.memoizedState = Kl, e) : Gi(t, l));
  if (s = e.memoizedState, s !== null && (a = s.dehydrated, a !== null)) return Yh(e, t, l, r, a, s, n);
  if (o) {
    o = r.fallback, l = t.mode, s = e.child, a = s.sibling;
    var u = {
      mode: "hidden",
      children: r.children
    };
    return !(l & 1) && t.child !== s ? (r = t.child, r.childLanes = 0, r.pendingProps = u, t.deletions = null) : (r = Qt(s, u), r.subtreeFlags = s.subtreeFlags & 14680064), a !== null ? o = Qt(a, o) : (o = un(o, l, n, null), o.flags |= 2), o.return = t, r.return = t, r.sibling = o, t.child = r, r = o, o = t.child, l = e.child.memoizedState, l = l === null ? Xl(n) : {
      baseLanes: l.baseLanes | n,
      cachePool: null,
      transitions: l.transitions
    }, o.memoizedState = l, o.childLanes = e.childLanes & ~n, t.memoizedState = Kl, r;
  }
  return o = e.child, e = o.sibling, r = Qt(o, {
    mode: "visible",
    children: r.children
  }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function Gi(e, t) {
  return t = go({
    mode: "visible",
    children: t
  }, e.mode, 0, null), t.return = e, e.child = t;
}
function ds(e, t, n, r) {
  return r !== null && Mi(r), Vn(t, e.child, null, n), e = Gi(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function Yh(e, t, n, r, s, o, l) {
  if (n) return t.flags & 256 ? (t.flags &= -257, r = Yo(Error(R(422))), ds(e, t, l, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (o = r.fallback, s = t.mode, r = go({
    mode: "visible",
    children: r.children
  }, s, 0, null), o = un(o, s, l, null), o.flags |= 2, r.return = t, o.return = t, r.sibling = o, t.child = r, t.mode & 1 && Vn(t, e.child, null, l), t.child.memoizedState = Xl(l), t.memoizedState = Kl, o);
  if (!(t.mode & 1)) return ds(e, t, l, null);
  if (s.data === "$!") {
    if (r = s.nextSibling && s.nextSibling.dataset, r) var a = r.dgst;
    return r = a, o = Error(R(419)), r = Yo(o, r, void 0), ds(e, t, l, r);
  }
  if (a = (l & e.childLanes) !== 0, Oe || a) {
    if (r = ge, r !== null) {
      switch (l & -l) {
        case 4:
          s = 2;
          break;
        case 16:
          s = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          s = 32;
          break;
        case 536870912:
          s = 268435456;
          break;
        default:
          s = 0;
      }
      s = s & (r.suspendedLanes | l) ? 0 : s, s !== 0 && s !== o.retryLane && (o.retryLane = s, Ct(e, s), ot(r, e, s, -1));
    }
    return na(), r = Yo(Error(R(421))), ds(e, t, l, r);
  }
  return s.data === "$?" ? (t.flags |= 128, t.child = e.child, t = c0.bind(null, e), s._reactRetry = t, null) : (e = o.treeContext, Fe = Bt(s.nextSibling), $e = t, oe = !0, rt = null, e !== null && (Qe[qe++] = St, Qe[qe++] = bt, Qe[qe++] = fn, St = e.id, bt = e.overflow, fn = t), t = Gi(t, r.children), t.flags |= 4096, t);
}
function xu(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), Bl(e.return, t, n);
}
function Jo(e, t, n, r, s) {
  var o = e.memoizedState;
  o === null ? e.memoizedState = {
    isBackwards: t,
    rendering: null,
    renderingStartTime: 0,
    last: r,
    tail: n,
    tailMode: s
  } : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = s);
}
function Wd(e, t, n) {
  var r = t.pendingProps,
    s = r.revealOrder,
    o = r.tail;
  if (je(e, t, r.children, n), r = le.current, r & 2) r = r & 1 | 2, t.flags |= 128;else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null;) {
      if (e.tag === 13) e.memoizedState !== null && xu(e, n, t);else if (e.tag === 19) xu(e, n, t);else if (e.child !== null) {
        e.child.return = e, e = e.child;
        continue;
      }
      if (e === t) break e;
      for (; e.sibling === null;) {
        if (e.return === null || e.return === t) break e;
        e = e.return;
      }
      e.sibling.return = e.return, e = e.sibling;
    }
    r &= 1;
  }
  if (te(le, r), !(t.mode & 1)) t.memoizedState = null;else switch (s) {
    case "forwards":
      for (n = t.child, s = null; n !== null;) e = n.alternate, e !== null && Xs(e) === null && (s = n), n = n.sibling;
      n = s, n === null ? (s = t.child, t.child = null) : (s = n.sibling, n.sibling = null), Jo(t, !1, s, n, o);
      break;
    case "backwards":
      for (n = null, s = t.child, t.child = null; s !== null;) {
        if (e = s.alternate, e !== null && Xs(e) === null) {
          t.child = s;
          break;
        }
        e = s.sibling, s.sibling = n, n = s, s = e;
      }
      Jo(t, !0, n, null, o);
      break;
    case "together":
      Jo(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function js(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function _t(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), hn |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(R(153));
  if (t.child !== null) {
    for (e = t.child, n = Qt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Qt(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function Jh(e, t, n) {
  switch (t.tag) {
    case 3:
      Bd(t), Wn();
      break;
    case 5:
      xd(t);
      break;
    case 1:
      Le(t.type) && Hs(t);
      break;
    case 4:
      Bi(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        s = t.memoizedProps.value;
      te(Qs, r._currentValue), r._currentValue = s;
      break;
    case 13:
      if (r = t.memoizedState, r !== null) return r.dehydrated !== null ? (te(le, le.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? Hd(e, t, n) : (te(le, le.current & 1), e = _t(e, t, n), e !== null ? e.sibling : null);
      te(le, le.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return Wd(e, t, n);
        t.flags |= 128;
      }
      if (s = t.memoizedState, s !== null && (s.rendering = null, s.tail = null, s.lastEffect = null), te(le, le.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, $d(e, t, n);
  }
  return _t(e, t, n);
}
var Vd, Gl, Qd, qd;
Vd = function (e, t) {
  for (var n = t.child; n !== null;) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);else if (n.tag !== 4 && n.child !== null) {
      n.child.return = n, n = n.child;
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null;) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    n.sibling.return = n.return, n = n.sibling;
  }
};
Gl = function () {};
Qd = function (e, t, n, r) {
  var s = e.memoizedProps;
  if (s !== r) {
    e = t.stateNode, rn(mt.current);
    var o = null;
    switch (n) {
      case "input":
        s = yl(e, s), r = yl(e, r), o = [];
        break;
      case "select":
        s = ae({}, s, {
          value: void 0
        }), r = ae({}, r, {
          value: void 0
        }), o = [];
        break;
      case "textarea":
        s = kl(e, s), r = kl(e, r), o = [];
        break;
      default:
        typeof s.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Us);
    }
    bl(n, r);
    var l;
    n = null;
    for (d in s) if (!r.hasOwnProperty(d) && s.hasOwnProperty(d) && s[d] != null) if (d === "style") {
      var a = s[d];
      for (l in a) a.hasOwnProperty(l) && (n || (n = {}), n[l] = "");
    } else d !== "dangerouslySetInnerHTML" && d !== "children" && d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && d !== "autoFocus" && (Nr.hasOwnProperty(d) ? o || (o = []) : (o = o || []).push(d, null));
    for (d in r) {
      var u = r[d];
      if (a = s != null ? s[d] : void 0, r.hasOwnProperty(d) && u !== a && (u != null || a != null)) if (d === "style") {
        if (a) {
          for (l in a) !a.hasOwnProperty(l) || u && u.hasOwnProperty(l) || (n || (n = {}), n[l] = "");
          for (l in u) u.hasOwnProperty(l) && a[l] !== u[l] && (n || (n = {}), n[l] = u[l]);
        } else n || (o || (o = []), o.push(d, n)), n = u;
      } else d === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, a = a ? a.__html : void 0, u != null && a !== u && (o = o || []).push(d, u)) : d === "children" ? typeof u != "string" && typeof u != "number" || (o = o || []).push(d, "" + u) : d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && (Nr.hasOwnProperty(d) ? (u != null && d === "onScroll" && re("scroll", e), o || a === u || (o = [])) : (o = o || []).push(d, u));
    }
    n && (o = o || []).push("style", n);
    var d = o;
    (t.updateQueue = d) && (t.flags |= 4);
  }
};
qd = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function ir(e, t) {
  if (!oe) switch (e.tailMode) {
    case "hidden":
      t = e.tail;
      for (var n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
      n === null ? e.tail = null : n.sibling = null;
      break;
    case "collapsed":
      n = e.tail;
      for (var r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
      r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
  }
}
function Se(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    n = 0,
    r = 0;
  if (t) for (var s = e.child; s !== null;) n |= s.lanes | s.childLanes, r |= s.subtreeFlags & 14680064, r |= s.flags & 14680064, s.return = e, s = s.sibling;else for (s = e.child; s !== null;) n |= s.lanes | s.childLanes, r |= s.subtreeFlags, r |= s.flags, s.return = e, s = s.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function Zh(e, t, n) {
  var r = t.pendingProps;
  switch (zi(t), t.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return Se(t), null;
    case 1:
      return Le(t.type) && Bs(), Se(t), null;
    case 3:
      return r = t.stateNode, Qn(), se(Pe), se(Ee), Wi(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (us(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, rt !== null && (si(rt), rt = null))), Gl(e, t), Se(t), null;
    case 5:
      Hi(t);
      var s = rn(Mr.current);
      if (n = t.type, e !== null && t.stateNode != null) Qd(e, t, n, r, s), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);else {
        if (!r) {
          if (t.stateNode === null) throw Error(R(166));
          return Se(t), null;
        }
        if (e = rn(mt.current), us(t)) {
          r = t.stateNode, n = t.type;
          var o = t.memoizedProps;
          switch (r[pt] = t, r[Lr] = o, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              re("cancel", r), re("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              re("load", r);
              break;
            case "video":
            case "audio":
              for (s = 0; s < pr.length; s++) re(pr[s], r);
              break;
            case "source":
              re("error", r);
              break;
            case "img":
            case "image":
            case "link":
              re("error", r), re("load", r);
              break;
            case "details":
              re("toggle", r);
              break;
            case "input":
              Ea(r, o), re("invalid", r);
              break;
            case "select":
              r._wrapperState = {
                wasMultiple: !!o.multiple
              }, re("invalid", r);
              break;
            case "textarea":
              Ca(r, o), re("invalid", r);
          }
          bl(n, o), s = null;
          for (var l in o) if (o.hasOwnProperty(l)) {
            var a = o[l];
            l === "children" ? typeof a == "string" ? r.textContent !== a && (o.suppressHydrationWarning !== !0 && as(r.textContent, a, e), s = ["children", a]) : typeof a == "number" && r.textContent !== "" + a && (o.suppressHydrationWarning !== !0 && as(r.textContent, a, e), s = ["children", "" + a]) : Nr.hasOwnProperty(l) && a != null && l === "onScroll" && re("scroll", r);
          }
          switch (n) {
            case "input":
              es(r), ja(r, o, !0);
              break;
            case "textarea":
              es(r), _a(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof o.onClick == "function" && (r.onclick = Us);
          }
          r = s, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          l = s.nodeType === 9 ? s : s.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = kc(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = l.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = l.createElement(n, {
            is: r.is
          }) : (e = l.createElement(n), n === "select" && (l = e, r.multiple ? l.multiple = !0 : r.size && (l.size = r.size))) : e = l.createElementNS(e, n), e[pt] = t, e[Lr] = r, Vd(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (l = Nl(n, r), n) {
              case "dialog":
                re("cancel", e), re("close", e), s = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                re("load", e), s = r;
                break;
              case "video":
              case "audio":
                for (s = 0; s < pr.length; s++) re(pr[s], e);
                s = r;
                break;
              case "source":
                re("error", e), s = r;
                break;
              case "img":
              case "image":
              case "link":
                re("error", e), re("load", e), s = r;
                break;
              case "details":
                re("toggle", e), s = r;
                break;
              case "input":
                Ea(e, r), s = yl(e, r), re("invalid", e);
                break;
              case "option":
                s = r;
                break;
              case "select":
                e._wrapperState = {
                  wasMultiple: !!r.multiple
                }, s = ae({}, r, {
                  value: void 0
                }), re("invalid", e);
                break;
              case "textarea":
                Ca(e, r), s = kl(e, r), re("invalid", e);
                break;
              default:
                s = r;
            }
            bl(n, s), a = s;
            for (o in a) if (a.hasOwnProperty(o)) {
              var u = a[o];
              o === "style" ? Nc(e, u) : o === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && Sc(e, u)) : o === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && Er(e, u) : typeof u == "number" && Er(e, "" + u) : o !== "suppressContentEditableWarning" && o !== "suppressHydrationWarning" && o !== "autoFocus" && (Nr.hasOwnProperty(o) ? u != null && o === "onScroll" && re("scroll", e) : u != null && wi(e, o, u, l));
            }
            switch (n) {
              case "input":
                es(e), ja(e, r, !1);
                break;
              case "textarea":
                es(e), _a(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + Kt(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, o = r.value, o != null ? zn(e, !!r.multiple, o, !1) : r.defaultValue != null && zn(e, !!r.multiple, r.defaultValue, !0);
                break;
              default:
                typeof s.onClick == "function" && (e.onclick = Us);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
      }
      return Se(t), null;
    case 6:
      if (e && t.stateNode != null) qd(e, t, e.memoizedProps, r);else {
        if (typeof r != "string" && t.stateNode === null) throw Error(R(166));
        if (n = rn(Mr.current), rn(mt.current), us(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[pt] = t, (o = r.nodeValue !== n) && (e = $e, e !== null)) switch (e.tag) {
            case 3:
              as(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && as(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          o && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[pt] = t, t.stateNode = r;
      }
      return Se(t), null;
    case 13:
      if (se(le), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (oe && Fe !== null && t.mode & 1 && !(t.flags & 128)) dd(), Wn(), t.flags |= 98560, o = !1;else if (o = us(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!o) throw Error(R(318));
            if (o = t.memoizedState, o = o !== null ? o.dehydrated : null, !o) throw Error(R(317));
            o[pt] = t;
          } else Wn(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          Se(t), o = !1;
        } else rt !== null && (si(rt), rt = null), o = !0;
        if (!o) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || le.current & 1 ? me === 0 && (me = 3) : na())), t.updateQueue !== null && (t.flags |= 4), Se(t), null);
    case 4:
      return Qn(), Gl(e, t), e === null && Or(t.stateNode.containerInfo), Se(t), null;
    case 10:
      return Fi(t.type._context), Se(t), null;
    case 17:
      return Le(t.type) && Bs(), Se(t), null;
    case 19:
      if (se(le), o = t.memoizedState, o === null) return Se(t), null;
      if (r = (t.flags & 128) !== 0, l = o.rendering, l === null) {
        if (r) ir(o, !1);else {
          if (me !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
            if (l = Xs(e), l !== null) {
              for (t.flags |= 128, ir(o, !1), r = l.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null;) o = n, e = r, o.flags &= 14680066, l = o.alternate, l === null ? (o.childLanes = 0, o.lanes = e, o.child = null, o.subtreeFlags = 0, o.memoizedProps = null, o.memoizedState = null, o.updateQueue = null, o.dependencies = null, o.stateNode = null) : (o.childLanes = l.childLanes, o.lanes = l.lanes, o.child = l.child, o.subtreeFlags = 0, o.deletions = null, o.memoizedProps = l.memoizedProps, o.memoizedState = l.memoizedState, o.updateQueue = l.updateQueue, o.type = l.type, e = l.dependencies, o.dependencies = e === null ? null : {
                lanes: e.lanes,
                firstContext: e.firstContext
              }), n = n.sibling;
              return te(le, le.current & 1 | 2), t.child;
            }
            e = e.sibling;
          }
          o.tail !== null && de() > Kn && (t.flags |= 128, r = !0, ir(o, !1), t.lanes = 4194304);
        }
      } else {
        if (!r) if (e = Xs(l), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), ir(o, !0), o.tail === null && o.tailMode === "hidden" && !l.alternate && !oe) return Se(t), null;
        } else 2 * de() - o.renderingStartTime > Kn && n !== 1073741824 && (t.flags |= 128, r = !0, ir(o, !1), t.lanes = 4194304);
        o.isBackwards ? (l.sibling = t.child, t.child = l) : (n = o.last, n !== null ? n.sibling = l : t.child = l, o.last = l);
      }
      return o.tail !== null ? (t = o.tail, o.rendering = t, o.tail = t.sibling, o.renderingStartTime = de(), t.sibling = null, n = le.current, te(le, r ? n & 1 | 2 : n & 1), t) : (Se(t), null);
    case 22:
    case 23:
      return ta(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? De & 1073741824 && (Se(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Se(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(R(156, t.tag));
}
function e0(e, t) {
  switch (zi(t), t.tag) {
    case 1:
      return Le(t.type) && Bs(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return Qn(), se(Pe), se(Ee), Wi(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return Hi(t), null;
    case 13:
      if (se(le), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(R(340));
        Wn();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return se(le), null;
    case 4:
      return Qn(), null;
    case 10:
      return Fi(t.type._context), null;
    case 22:
    case 23:
      return ta(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var fs = !1,
  be = !1,
  t0 = typeof WeakSet == "function" ? WeakSet : Set,
  M = null;
function Pn(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    ue(e, t, r);
  } else n.current = null;
}
function Yl(e, t, n) {
  try {
    n();
  } catch (r) {
    ue(e, t, r);
  }
}
var gu = !1;
function n0(e, t) {
  if (Ll = Ds, e = Jc(), Pi(e)) {
    if ("selectionStart" in e) var n = {
      start: e.selectionStart,
      end: e.selectionEnd
    };else e: {
      n = (n = e.ownerDocument) && n.defaultView || window;
      var r = n.getSelection && n.getSelection();
      if (r && r.rangeCount !== 0) {
        n = r.anchorNode;
        var s = r.anchorOffset,
          o = r.focusNode;
        r = r.focusOffset;
        try {
          n.nodeType, o.nodeType;
        } catch {
          n = null;
          break e;
        }
        var l = 0,
          a = -1,
          u = -1,
          d = 0,
          c = 0,
          h = e,
          x = null;
        t: for (;;) {
          for (var v; h !== n || s !== 0 && h.nodeType !== 3 || (a = l + s), h !== o || r !== 0 && h.nodeType !== 3 || (u = l + r), h.nodeType === 3 && (l += h.nodeValue.length), (v = h.firstChild) !== null;) x = h, h = v;
          for (;;) {
            if (h === e) break t;
            if (x === n && ++d === s && (a = l), x === o && ++c === r && (u = l), (v = h.nextSibling) !== null) break;
            h = x, x = h.parentNode;
          }
          h = v;
        }
        n = a === -1 || u === -1 ? null : {
          start: a,
          end: u
        };
      } else n = null;
    }
    n = n || {
      start: 0,
      end: 0
    };
  } else n = null;
  for (zl = {
    focusedElem: e,
    selectionRange: n
  }, Ds = !1, M = t; M !== null;) if (t = M, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, M = e;else for (; M !== null;) {
    t = M;
    try {
      var g = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (g !== null) {
            var y = g.memoizedProps,
              S = g.memoizedState,
              m = t.stateNode,
              p = m.getSnapshotBeforeUpdate(t.elementType === t.type ? y : tt(t.type, y), S);
            m.__reactInternalSnapshotBeforeUpdate = p;
          }
          break;
        case 3:
          var f = t.stateNode.containerInfo;
          f.nodeType === 1 ? f.textContent = "" : f.nodeType === 9 && f.documentElement && f.removeChild(f.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(R(163));
      }
    } catch (w) {
      ue(t, t.return, w);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, M = e;
      break;
    }
    M = t.return;
  }
  return g = gu, gu = !1, g;
}
function wr(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var s = r = r.next;
    do {
      if ((s.tag & e) === e) {
        var o = s.destroy;
        s.destroy = void 0, o !== void 0 && Yl(t, n, o);
      }
      s = s.next;
    } while (s !== r);
  }
}
function mo(e, t) {
  if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
    var n = t = t.next;
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function Jl(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : t.current = e;
  }
}
function Kd(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, Kd(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[pt], delete t[Lr], delete t[Dl], delete t[Dh], delete t[Fh])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function Xd(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function yu(e) {
  e: for (;;) {
    for (; e.sibling === null;) {
      if (e.return === null || Xd(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function Zl(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Us));else if (r !== 4 && (e = e.child, e !== null)) for (Zl(e, t, n), e = e.sibling; e !== null;) Zl(e, t, n), e = e.sibling;
}
function ei(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);else if (r !== 4 && (e = e.child, e !== null)) for (ei(e, t, n), e = e.sibling; e !== null;) ei(e, t, n), e = e.sibling;
}
var ye = null,
  nt = !1;
function At(e, t, n) {
  for (n = n.child; n !== null;) Gd(e, t, n), n = n.sibling;
}
function Gd(e, t, n) {
  if (ht && typeof ht.onCommitFiberUnmount == "function") try {
    ht.onCommitFiberUnmount(lo, n);
  } catch {}
  switch (n.tag) {
    case 5:
      be || Pn(n, t);
    case 6:
      var r = ye,
        s = nt;
      ye = null, At(e, t, n), ye = r, nt = s, ye !== null && (nt ? (e = ye, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : ye.removeChild(n.stateNode));
      break;
    case 18:
      ye !== null && (nt ? (e = ye, n = n.stateNode, e.nodeType === 8 ? Vo(e.parentNode, n) : e.nodeType === 1 && Vo(e, n), Tr(e)) : Vo(ye, n.stateNode));
      break;
    case 4:
      r = ye, s = nt, ye = n.stateNode.containerInfo, nt = !0, At(e, t, n), ye = r, nt = s;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!be && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        s = r = r.next;
        do {
          var o = s,
            l = o.destroy;
          o = o.tag, l !== void 0 && (o & 2 || o & 4) && Yl(n, t, l), s = s.next;
        } while (s !== r);
      }
      At(e, t, n);
      break;
    case 1:
      if (!be && (Pn(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (a) {
        ue(n, t, a);
      }
      At(e, t, n);
      break;
    case 21:
      At(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (be = (r = be) || n.memoizedState !== null, At(e, t, n), be = r) : At(e, t, n);
      break;
    default:
      At(e, t, n);
  }
}
function vu(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new t0()), t.forEach(function (r) {
      var s = d0.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(s, s));
    });
  }
}
function et(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var s = n[r];
    try {
      var o = e,
        l = t,
        a = l;
      e: for (; a !== null;) {
        switch (a.tag) {
          case 5:
            ye = a.stateNode, nt = !1;
            break e;
          case 3:
            ye = a.stateNode.containerInfo, nt = !0;
            break e;
          case 4:
            ye = a.stateNode.containerInfo, nt = !0;
            break e;
        }
        a = a.return;
      }
      if (ye === null) throw Error(R(160));
      Gd(o, l, s), ye = null, nt = !1;
      var u = s.alternate;
      u !== null && (u.return = null), s.return = null;
    } catch (d) {
      ue(s, t, d);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null;) Yd(t, e), t = t.sibling;
}
function Yd(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (et(t, e), at(e), r & 4) {
        try {
          wr(3, e, e.return), mo(3, e);
        } catch (y) {
          ue(e, e.return, y);
        }
        try {
          wr(5, e, e.return);
        } catch (y) {
          ue(e, e.return, y);
        }
      }
      break;
    case 1:
      et(t, e), at(e), r & 512 && n !== null && Pn(n, n.return);
      break;
    case 5:
      if (et(t, e), at(e), r & 512 && n !== null && Pn(n, n.return), e.flags & 32) {
        var s = e.stateNode;
        try {
          Er(s, "");
        } catch (y) {
          ue(e, e.return, y);
        }
      }
      if (r & 4 && (s = e.stateNode, s != null)) {
        var o = e.memoizedProps,
          l = n !== null ? n.memoizedProps : o,
          a = e.type,
          u = e.updateQueue;
        if (e.updateQueue = null, u !== null) try {
          a === "input" && o.type === "radio" && o.name != null && vc(s, o), Nl(a, l);
          var d = Nl(a, o);
          for (l = 0; l < u.length; l += 2) {
            var c = u[l],
              h = u[l + 1];
            c === "style" ? Nc(s, h) : c === "dangerouslySetInnerHTML" ? Sc(s, h) : c === "children" ? Er(s, h) : wi(s, c, h, d);
          }
          switch (a) {
            case "input":
              vl(s, o);
              break;
            case "textarea":
              wc(s, o);
              break;
            case "select":
              var x = s._wrapperState.wasMultiple;
              s._wrapperState.wasMultiple = !!o.multiple;
              var v = o.value;
              v != null ? zn(s, !!o.multiple, v, !1) : x !== !!o.multiple && (o.defaultValue != null ? zn(s, !!o.multiple, o.defaultValue, !0) : zn(s, !!o.multiple, o.multiple ? [] : "", !1));
          }
          s[Lr] = o;
        } catch (y) {
          ue(e, e.return, y);
        }
      }
      break;
    case 6:
      if (et(t, e), at(e), r & 4) {
        if (e.stateNode === null) throw Error(R(162));
        s = e.stateNode, o = e.memoizedProps;
        try {
          s.nodeValue = o;
        } catch (y) {
          ue(e, e.return, y);
        }
      }
      break;
    case 3:
      if (et(t, e), at(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        Tr(t.containerInfo);
      } catch (y) {
        ue(e, e.return, y);
      }
      break;
    case 4:
      et(t, e), at(e);
      break;
    case 13:
      et(t, e), at(e), s = e.child, s.flags & 8192 && (o = s.memoizedState !== null, s.stateNode.isHidden = o, !o || s.alternate !== null && s.alternate.memoizedState !== null || (Zi = de())), r & 4 && vu(e);
      break;
    case 22:
      if (c = n !== null && n.memoizedState !== null, e.mode & 1 ? (be = (d = be) || c, et(t, e), be = d) : et(t, e), at(e), r & 8192) {
        if (d = e.memoizedState !== null, (e.stateNode.isHidden = d) && !c && e.mode & 1) for (M = e, c = e.child; c !== null;) {
          for (h = M = c; M !== null;) {
            switch (x = M, v = x.child, x.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                wr(4, x, x.return);
                break;
              case 1:
                Pn(x, x.return);
                var g = x.stateNode;
                if (typeof g.componentWillUnmount == "function") {
                  r = x, n = x.return;
                  try {
                    t = r, g.props = t.memoizedProps, g.state = t.memoizedState, g.componentWillUnmount();
                  } catch (y) {
                    ue(r, n, y);
                  }
                }
                break;
              case 5:
                Pn(x, x.return);
                break;
              case 22:
                if (x.memoizedState !== null) {
                  ku(h);
                  continue;
                }
            }
            v !== null ? (v.return = x, M = v) : ku(h);
          }
          c = c.sibling;
        }
        e: for (c = null, h = e;;) {
          if (h.tag === 5) {
            if (c === null) {
              c = h;
              try {
                s = h.stateNode, d ? (o = s.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none") : (a = h.stateNode, u = h.memoizedProps.style, l = u != null && u.hasOwnProperty("display") ? u.display : null, a.style.display = bc("display", l));
              } catch (y) {
                ue(e, e.return, y);
              }
            }
          } else if (h.tag === 6) {
            if (c === null) try {
              h.stateNode.nodeValue = d ? "" : h.memoizedProps;
            } catch (y) {
              ue(e, e.return, y);
            }
          } else if ((h.tag !== 22 && h.tag !== 23 || h.memoizedState === null || h === e) && h.child !== null) {
            h.child.return = h, h = h.child;
            continue;
          }
          if (h === e) break e;
          for (; h.sibling === null;) {
            if (h.return === null || h.return === e) break e;
            c === h && (c = null), h = h.return;
          }
          c === h && (c = null), h.sibling.return = h.return, h = h.sibling;
        }
      }
      break;
    case 19:
      et(t, e), at(e), r & 4 && vu(e);
      break;
    case 21:
      break;
    default:
      et(t, e), at(e);
  }
}
function at(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null;) {
          if (Xd(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(R(160));
      }
      switch (r.tag) {
        case 5:
          var s = r.stateNode;
          r.flags & 32 && (Er(s, ""), r.flags &= -33);
          var o = yu(e);
          ei(e, o, s);
          break;
        case 3:
        case 4:
          var l = r.stateNode.containerInfo,
            a = yu(e);
          Zl(e, a, l);
          break;
        default:
          throw Error(R(161));
      }
    } catch (u) {
      ue(e, e.return, u);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function r0(e, t, n) {
  M = e, Jd(e);
}
function Jd(e, t, n) {
  for (var r = (e.mode & 1) !== 0; M !== null;) {
    var s = M,
      o = s.child;
    if (s.tag === 22 && r) {
      var l = s.memoizedState !== null || fs;
      if (!l) {
        var a = s.alternate,
          u = a !== null && a.memoizedState !== null || be;
        a = fs;
        var d = be;
        if (fs = l, (be = u) && !d) for (M = s; M !== null;) l = M, u = l.child, l.tag === 22 && l.memoizedState !== null ? Su(s) : u !== null ? (u.return = l, M = u) : Su(s);
        for (; o !== null;) M = o, Jd(o), o = o.sibling;
        M = s, fs = a, be = d;
      }
      wu(e);
    } else s.subtreeFlags & 8772 && o !== null ? (o.return = s, M = o) : wu(e);
  }
}
function wu(e) {
  for (; M !== null;) {
    var t = M;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            be || mo(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !be) if (n === null) r.componentDidMount();else {
              var s = t.elementType === t.type ? n.memoizedProps : tt(t.type, n.memoizedProps);
              r.componentDidUpdate(s, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var o = t.updateQueue;
            o !== null && su(t, o, r);
            break;
          case 3:
            var l = t.updateQueue;
            if (l !== null) {
              if (n = null, t.child !== null) switch (t.child.tag) {
                case 5:
                  n = t.child.stateNode;
                  break;
                case 1:
                  n = t.child.stateNode;
              }
              su(t, l, n);
            }
            break;
          case 5:
            var a = t.stateNode;
            if (n === null && t.flags & 4) {
              n = a;
              var u = t.memoizedProps;
              switch (t.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  u.autoFocus && n.focus();
                  break;
                case "img":
                  u.src && (n.src = u.src);
              }
            }
            break;
          case 6:
            break;
          case 4:
            break;
          case 12:
            break;
          case 13:
            if (t.memoizedState === null) {
              var d = t.alternate;
              if (d !== null) {
                var c = d.memoizedState;
                if (c !== null) {
                  var h = c.dehydrated;
                  h !== null && Tr(h);
                }
              }
            }
            break;
          case 19:
          case 17:
          case 21:
          case 22:
          case 23:
          case 25:
            break;
          default:
            throw Error(R(163));
        }
        be || t.flags & 512 && Jl(t);
      } catch (x) {
        ue(t, t.return, x);
      }
    }
    if (t === e) {
      M = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, M = n;
      break;
    }
    M = t.return;
  }
}
function ku(e) {
  for (; M !== null;) {
    var t = M;
    if (t === e) {
      M = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, M = n;
      break;
    }
    M = t.return;
  }
}
function Su(e) {
  for (; M !== null;) {
    var t = M;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            mo(4, t);
          } catch (u) {
            ue(t, n, u);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var s = t.return;
            try {
              r.componentDidMount();
            } catch (u) {
              ue(t, s, u);
            }
          }
          var o = t.return;
          try {
            Jl(t);
          } catch (u) {
            ue(t, o, u);
          }
          break;
        case 5:
          var l = t.return;
          try {
            Jl(t);
          } catch (u) {
            ue(t, l, u);
          }
      }
    } catch (u) {
      ue(t, t.return, u);
    }
    if (t === e) {
      M = null;
      break;
    }
    var a = t.sibling;
    if (a !== null) {
      a.return = t.return, M = a;
      break;
    }
    M = t.return;
  }
}
var s0 = Math.ceil,
  Js = Tt.ReactCurrentDispatcher,
  Yi = Tt.ReactCurrentOwner,
  Ge = Tt.ReactCurrentBatchConfig,
  X = 0,
  ge = null,
  pe = null,
  ve = 0,
  De = 0,
  Ln = Yt(0),
  me = 0,
  $r = null,
  hn = 0,
  xo = 0,
  Ji = 0,
  kr = null,
  Ae = null,
  Zi = 0,
  Kn = 1 / 0,
  vt = null,
  Zs = !1,
  ti = null,
  Wt = null,
  ps = !1,
  Dt = null,
  eo = 0,
  Sr = 0,
  ni = null,
  Cs = -1,
  _s = 0;
function Ce() {
  return X & 6 ? de() : Cs !== -1 ? Cs : Cs = de();
}
function Vt(e) {
  return e.mode & 1 ? X & 2 && ve !== 0 ? ve & -ve : Uh.transition !== null ? (_s === 0 && (_s = Mc()), _s) : (e = Y, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Hc(e.type)), e) : 1;
}
function ot(e, t, n, r) {
  if (50 < Sr) throw Sr = 0, ni = null, Error(R(185));
  Hr(e, n, r), (!(X & 2) || e !== ge) && (e === ge && (!(X & 2) && (xo |= n), me === 4 && Mt(e, ve)), ze(e, r), n === 1 && X === 0 && !(t.mode & 1) && (Kn = de() + 500, fo && Jt()));
}
function ze(e, t) {
  var n = e.callbackNode;
  Up(e, t);
  var r = Is(e, e === ge ? ve : 0);
  if (r === 0) n !== null && Aa(n), e.callbackNode = null, e.callbackPriority = 0;else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && Aa(n), t === 1) e.tag === 0 ? $h(bu.bind(null, e)) : ad(bu.bind(null, e)), Mh(function () {
      !(X & 6) && Jt();
    }), n = null;else {
      switch (Ic(r)) {
        case 1:
          n = Ei;
          break;
        case 4:
          n = Lc;
          break;
        case 16:
          n = Ms;
          break;
        case 536870912:
          n = zc;
          break;
        default:
          n = Ms;
      }
      n = lf(n, Zd.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function Zd(e, t) {
  if (Cs = -1, _s = 0, X & 6) throw Error(R(327));
  var n = e.callbackNode;
  if ($n() && e.callbackNode !== n) return null;
  var r = Is(e, e === ge ? ve : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = to(e, r);else {
    t = r;
    var s = X;
    X |= 2;
    var o = tf();
    (ge !== e || ve !== t) && (vt = null, Kn = de() + 500, an(e, t));
    do try {
      i0();
      break;
    } catch (a) {
      ef(e, a);
    } while (!0);
    Di(), Js.current = o, X = s, pe !== null ? t = 0 : (ge = null, ve = 0, t = me);
  }
  if (t !== 0) {
    if (t === 2 && (s = Tl(e), s !== 0 && (r = s, t = ri(e, s))), t === 1) throw n = $r, an(e, 0), Mt(e, r), ze(e, de()), n;
    if (t === 6) Mt(e, r);else {
      if (s = e.current.alternate, !(r & 30) && !o0(s) && (t = to(e, r), t === 2 && (o = Tl(e), o !== 0 && (r = o, t = ri(e, o))), t === 1)) throw n = $r, an(e, 0), Mt(e, r), ze(e, de()), n;
      switch (e.finishedWork = s, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(R(345));
        case 2:
          en(e, Ae, vt);
          break;
        case 3:
          if (Mt(e, r), (r & 130023424) === r && (t = Zi + 500 - de(), 10 < t)) {
            if (Is(e, 0) !== 0) break;
            if (s = e.suspendedLanes, (s & r) !== r) {
              Ce(), e.pingedLanes |= e.suspendedLanes & s;
              break;
            }
            e.timeoutHandle = Il(en.bind(null, e, Ae, vt), t);
            break;
          }
          en(e, Ae, vt);
          break;
        case 4:
          if (Mt(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, s = -1; 0 < r;) {
            var l = 31 - st(r);
            o = 1 << l, l = t[l], l > s && (s = l), r &= ~o;
          }
          if (r = s, r = de() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * s0(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = Il(en.bind(null, e, Ae, vt), r);
            break;
          }
          en(e, Ae, vt);
          break;
        case 5:
          en(e, Ae, vt);
          break;
        default:
          throw Error(R(329));
      }
    }
  }
  return ze(e, de()), e.callbackNode === n ? Zd.bind(null, e) : null;
}
function ri(e, t) {
  var n = kr;
  return e.current.memoizedState.isDehydrated && (an(e, t).flags |= 256), e = to(e, t), e !== 2 && (t = Ae, Ae = n, t !== null && si(t)), e;
}
function si(e) {
  Ae === null ? Ae = e : Ae.push.apply(Ae, e);
}
function o0(e) {
  for (var t = e;;) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var s = n[r],
          o = s.getSnapshot;
        s = s.value;
        try {
          if (!lt(o(), s)) return !1;
        } catch {
          return !1;
        }
      }
    }
    if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;else {
      if (t === e) break;
      for (; t.sibling === null;) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
  }
  return !0;
}
function Mt(e, t) {
  for (t &= ~Ji, t &= ~xo, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t;) {
    var n = 31 - st(t),
      r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function bu(e) {
  if (X & 6) throw Error(R(327));
  $n();
  var t = Is(e, 0);
  if (!(t & 1)) return ze(e, de()), null;
  var n = to(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Tl(e);
    r !== 0 && (t = r, n = ri(e, r));
  }
  if (n === 1) throw n = $r, an(e, 0), Mt(e, t), ze(e, de()), n;
  if (n === 6) throw Error(R(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, en(e, Ae, vt), ze(e, de()), null;
}
function ea(e, t) {
  var n = X;
  X |= 1;
  try {
    return e(t);
  } finally {
    X = n, X === 0 && (Kn = de() + 500, fo && Jt());
  }
}
function mn(e) {
  Dt !== null && Dt.tag === 0 && !(X & 6) && $n();
  var t = X;
  X |= 1;
  var n = Ge.transition,
    r = Y;
  try {
    if (Ge.transition = null, Y = 1, e) return e();
  } finally {
    Y = r, Ge.transition = n, X = t, !(X & 6) && Jt();
  }
}
function ta() {
  De = Ln.current, se(Ln);
}
function an(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, zh(n)), pe !== null) for (n = pe.return; n !== null;) {
    var r = n;
    switch (zi(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && Bs();
        break;
      case 3:
        Qn(), se(Pe), se(Ee), Wi();
        break;
      case 5:
        Hi(r);
        break;
      case 4:
        Qn();
        break;
      case 13:
        se(le);
        break;
      case 19:
        se(le);
        break;
      case 10:
        Fi(r.type._context);
        break;
      case 22:
      case 23:
        ta();
    }
    n = n.return;
  }
  if (ge = e, pe = e = Qt(e.current, null), ve = De = t, me = 0, $r = null, Ji = xo = hn = 0, Ae = kr = null, nn !== null) {
    for (t = 0; t < nn.length; t++) if (n = nn[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var s = r.next,
        o = n.pending;
      if (o !== null) {
        var l = o.next;
        o.next = s, r.next = l;
      }
      n.pending = r;
    }
    nn = null;
  }
  return e;
}
function ef(e, t) {
  do {
    var n = pe;
    try {
      if (Di(), Ns.current = Ys, Gs) {
        for (var r = ie.memoizedState; r !== null;) {
          var s = r.queue;
          s !== null && (s.pending = null), r = r.next;
        }
        Gs = !1;
      }
      if (pn = 0, xe = he = ie = null, vr = !1, Ir = 0, Yi.current = null, n === null || n.return === null) {
        me = 1, $r = t, pe = null;
        break;
      }
      e: {
        var o = e,
          l = n.return,
          a = n,
          u = t;
        if (t = ve, a.flags |= 32768, u !== null && typeof u == "object" && typeof u.then == "function") {
          var d = u,
            c = a,
            h = c.tag;
          if (!(c.mode & 1) && (h === 0 || h === 11 || h === 15)) {
            var x = c.alternate;
            x ? (c.updateQueue = x.updateQueue, c.memoizedState = x.memoizedState, c.lanes = x.lanes) : (c.updateQueue = null, c.memoizedState = null);
          }
          var v = cu(l);
          if (v !== null) {
            v.flags &= -257, du(v, l, a, o, t), v.mode & 1 && uu(o, d, t), t = v, u = d;
            var g = t.updateQueue;
            if (g === null) {
              var y = new Set();
              y.add(u), t.updateQueue = y;
            } else g.add(u);
            break e;
          } else {
            if (!(t & 1)) {
              uu(o, d, t), na();
              break e;
            }
            u = Error(R(426));
          }
        } else if (oe && a.mode & 1) {
          var S = cu(l);
          if (S !== null) {
            !(S.flags & 65536) && (S.flags |= 256), du(S, l, a, o, t), Mi(qn(u, a));
            break e;
          }
        }
        o = u = qn(u, a), me !== 4 && (me = 2), kr === null ? kr = [o] : kr.push(o), o = l;
        do {
          switch (o.tag) {
            case 3:
              o.flags |= 65536, t &= -t, o.lanes |= t;
              var m = Id(o, u, t);
              ru(o, m);
              break e;
            case 1:
              a = u;
              var p = o.type,
                f = o.stateNode;
              if (!(o.flags & 128) && (typeof p.getDerivedStateFromError == "function" || f !== null && typeof f.componentDidCatch == "function" && (Wt === null || !Wt.has(f)))) {
                o.flags |= 65536, t &= -t, o.lanes |= t;
                var w = Dd(o, a, t);
                ru(o, w);
                break e;
              }
          }
          o = o.return;
        } while (o !== null);
      }
      rf(n);
    } catch (j) {
      t = j, pe === n && n !== null && (pe = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function tf() {
  var e = Js.current;
  return Js.current = Ys, e === null ? Ys : e;
}
function na() {
  (me === 0 || me === 3 || me === 2) && (me = 4), ge === null || !(hn & 268435455) && !(xo & 268435455) || Mt(ge, ve);
}
function to(e, t) {
  var n = X;
  X |= 2;
  var r = tf();
  (ge !== e || ve !== t) && (vt = null, an(e, t));
  do try {
    l0();
    break;
  } catch (s) {
    ef(e, s);
  } while (!0);
  if (Di(), X = n, Js.current = r, pe !== null) throw Error(R(261));
  return ge = null, ve = 0, me;
}
function l0() {
  for (; pe !== null;) nf(pe);
}
function i0() {
  for (; pe !== null && !Op();) nf(pe);
}
function nf(e) {
  var t = of(e.alternate, e, De);
  e.memoizedProps = e.pendingProps, t === null ? rf(e) : pe = t, Yi.current = null;
}
function rf(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = e0(n, t), n !== null) {
        n.flags &= 32767, pe = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;else {
        me = 6, pe = null;
        return;
      }
    } else if (n = Zh(n, t, De), n !== null) {
      pe = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      pe = t;
      return;
    }
    pe = t = e;
  } while (t !== null);
  me === 0 && (me = 5);
}
function en(e, t, n) {
  var r = Y,
    s = Ge.transition;
  try {
    Ge.transition = null, Y = 1, a0(e, t, n, r);
  } finally {
    Ge.transition = s, Y = r;
  }
  return null;
}
function a0(e, t, n, r) {
  do $n(); while (Dt !== null);
  if (X & 6) throw Error(R(327));
  n = e.finishedWork;
  var s = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(R(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var o = n.lanes | n.childLanes;
  if (Bp(e, o), e === ge && (pe = ge = null, ve = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || ps || (ps = !0, lf(Ms, function () {
    return $n(), null;
  })), o = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || o) {
    o = Ge.transition, Ge.transition = null;
    var l = Y;
    Y = 1;
    var a = X;
    X |= 4, Yi.current = null, n0(e, n), Yd(n, e), _h(zl), Ds = !!Ll, zl = Ll = null, e.current = n, r0(n), Pp(), X = a, Y = l, Ge.transition = o;
  } else e.current = n;
  if (ps && (ps = !1, Dt = e, eo = s), o = e.pendingLanes, o === 0 && (Wt = null), Mp(n.stateNode), ze(e, de()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) s = t[n], r(s.value, {
    componentStack: s.stack,
    digest: s.digest
  });
  if (Zs) throw Zs = !1, e = ti, ti = null, e;
  return eo & 1 && e.tag !== 0 && $n(), o = e.pendingLanes, o & 1 ? e === ni ? Sr++ : (Sr = 0, ni = e) : Sr = 0, Jt(), null;
}
function $n() {
  if (Dt !== null) {
    var e = Ic(eo),
      t = Ge.transition,
      n = Y;
    try {
      if (Ge.transition = null, Y = 16 > e ? 16 : e, Dt === null) var r = !1;else {
        if (e = Dt, Dt = null, eo = 0, X & 6) throw Error(R(331));
        var s = X;
        for (X |= 4, M = e.current; M !== null;) {
          var o = M,
            l = o.child;
          if (M.flags & 16) {
            var a = o.deletions;
            if (a !== null) {
              for (var u = 0; u < a.length; u++) {
                var d = a[u];
                for (M = d; M !== null;) {
                  var c = M;
                  switch (c.tag) {
                    case 0:
                    case 11:
                    case 15:
                      wr(8, c, o);
                  }
                  var h = c.child;
                  if (h !== null) h.return = c, M = h;else for (; M !== null;) {
                    c = M;
                    var x = c.sibling,
                      v = c.return;
                    if (Kd(c), c === d) {
                      M = null;
                      break;
                    }
                    if (x !== null) {
                      x.return = v, M = x;
                      break;
                    }
                    M = v;
                  }
                }
              }
              var g = o.alternate;
              if (g !== null) {
                var y = g.child;
                if (y !== null) {
                  g.child = null;
                  do {
                    var S = y.sibling;
                    y.sibling = null, y = S;
                  } while (y !== null);
                }
              }
              M = o;
            }
          }
          if (o.subtreeFlags & 2064 && l !== null) l.return = o, M = l;else e: for (; M !== null;) {
            if (o = M, o.flags & 2048) switch (o.tag) {
              case 0:
              case 11:
              case 15:
                wr(9, o, o.return);
            }
            var m = o.sibling;
            if (m !== null) {
              m.return = o.return, M = m;
              break e;
            }
            M = o.return;
          }
        }
        var p = e.current;
        for (M = p; M !== null;) {
          l = M;
          var f = l.child;
          if (l.subtreeFlags & 2064 && f !== null) f.return = l, M = f;else e: for (l = p; M !== null;) {
            if (a = M, a.flags & 2048) try {
              switch (a.tag) {
                case 0:
                case 11:
                case 15:
                  mo(9, a);
              }
            } catch (j) {
              ue(a, a.return, j);
            }
            if (a === l) {
              M = null;
              break e;
            }
            var w = a.sibling;
            if (w !== null) {
              w.return = a.return, M = w;
              break e;
            }
            M = a.return;
          }
        }
        if (X = s, Jt(), ht && typeof ht.onPostCommitFiberRoot == "function") try {
          ht.onPostCommitFiberRoot(lo, e);
        } catch {}
        r = !0;
      }
      return r;
    } finally {
      Y = n, Ge.transition = t;
    }
  }
  return !1;
}
function Nu(e, t, n) {
  t = qn(n, t), t = Id(e, t, 1), e = Ht(e, t, 1), t = Ce(), e !== null && (Hr(e, 1, t), ze(e, t));
}
function ue(e, t, n) {
  if (e.tag === 3) Nu(e, e, n);else for (; t !== null;) {
    if (t.tag === 3) {
      Nu(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Wt === null || !Wt.has(r))) {
        e = qn(n, e), e = Dd(t, e, 1), t = Ht(t, e, 1), e = Ce(), t !== null && (Hr(t, 1, e), ze(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function u0(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = Ce(), e.pingedLanes |= e.suspendedLanes & n, ge === e && (ve & n) === n && (me === 4 || me === 3 && (ve & 130023424) === ve && 500 > de() - Zi ? an(e, 0) : Ji |= n), ze(e, t);
}
function sf(e, t) {
  t === 0 && (e.mode & 1 ? (t = rs, rs <<= 1, !(rs & 130023424) && (rs = 4194304)) : t = 1);
  var n = Ce();
  e = Ct(e, t), e !== null && (Hr(e, t, n), ze(e, n));
}
function c0(e) {
  var t = e.memoizedState,
    n = 0;
  t !== null && (n = t.retryLane), sf(e, n);
}
function d0(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode,
        s = e.memoizedState;
      s !== null && (n = s.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(R(314));
  }
  r !== null && r.delete(t), sf(e, n);
}
var of;
of = function (e, t, n) {
  if (e !== null) {
    if (e.memoizedProps !== t.pendingProps || Pe.current) Oe = !0;else {
      if (!(e.lanes & n) && !(t.flags & 128)) return Oe = !1, Jh(e, t, n);
      Oe = !!(e.flags & 131072);
    }
  } else Oe = !1, oe && t.flags & 1048576 && ud(t, Vs, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      js(e, t), e = t.pendingProps;
      var s = Hn(t, Ee.current);
      Fn(t, n), s = Qi(null, t, r, e, s, n);
      var o = qi();
      return t.flags |= 1, typeof s == "object" && s !== null && typeof s.render == "function" && s.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, Le(r) ? (o = !0, Hs(t)) : o = !1, t.memoizedState = s.state !== null && s.state !== void 0 ? s.state : null, Ui(t), s.updater = ho, t.stateNode = s, s._reactInternals = t, Wl(t, r, e, n), t = ql(null, t, r, !0, o, n)) : (t.tag = 0, oe && o && Li(t), je(null, t, s, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (js(e, t), e = t.pendingProps, s = r._init, r = s(r._payload), t.type = r, s = t.tag = p0(r), e = tt(r, e), s) {
          case 0:
            t = Ql(null, t, r, e, n);
            break e;
          case 1:
            t = hu(null, t, r, e, n);
            break e;
          case 11:
            t = fu(null, t, r, e, n);
            break e;
          case 14:
            t = pu(null, t, r, tt(r.type, e), n);
            break e;
        }
        throw Error(R(306, r, ""));
      }
      return t;
    case 0:
      return r = t.type, s = t.pendingProps, s = t.elementType === r ? s : tt(r, s), Ql(e, t, r, s, n);
    case 1:
      return r = t.type, s = t.pendingProps, s = t.elementType === r ? s : tt(r, s), hu(e, t, r, s, n);
    case 3:
      e: {
        if (Bd(t), e === null) throw Error(R(387));
        r = t.pendingProps, o = t.memoizedState, s = o.element, md(e, t), Ks(t, r, null, n);
        var l = t.memoizedState;
        if (r = l.element, o.isDehydrated) {
          if (o = {
            element: r,
            isDehydrated: !1,
            cache: l.cache,
            pendingSuspenseBoundaries: l.pendingSuspenseBoundaries,
            transitions: l.transitions
          }, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
            s = qn(Error(R(423)), t), t = mu(e, t, r, n, s);
            break e;
          } else if (r !== s) {
            s = qn(Error(R(424)), t), t = mu(e, t, r, n, s);
            break e;
          } else for (Fe = Bt(t.stateNode.containerInfo.firstChild), $e = t, oe = !0, rt = null, n = pd(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
        } else {
          if (Wn(), r === s) {
            t = _t(e, t, n);
            break e;
          }
          je(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return xd(t), e === null && Ul(t), r = t.type, s = t.pendingProps, o = e !== null ? e.memoizedProps : null, l = s.children, Ml(r, s) ? l = null : o !== null && Ml(r, o) && (t.flags |= 32), Ud(e, t), je(e, t, l, n), t.child;
    case 6:
      return e === null && Ul(t), null;
    case 13:
      return Hd(e, t, n);
    case 4:
      return Bi(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Vn(t, null, r, n) : je(e, t, r, n), t.child;
    case 11:
      return r = t.type, s = t.pendingProps, s = t.elementType === r ? s : tt(r, s), fu(e, t, r, s, n);
    case 7:
      return je(e, t, t.pendingProps, n), t.child;
    case 8:
      return je(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return je(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, s = t.pendingProps, o = t.memoizedProps, l = s.value, te(Qs, r._currentValue), r._currentValue = l, o !== null) if (lt(o.value, l)) {
          if (o.children === s.children && !Pe.current) {
            t = _t(e, t, n);
            break e;
          }
        } else for (o = t.child, o !== null && (o.return = t); o !== null;) {
          var a = o.dependencies;
          if (a !== null) {
            l = o.child;
            for (var u = a.firstContext; u !== null;) {
              if (u.context === r) {
                if (o.tag === 1) {
                  u = Nt(-1, n & -n), u.tag = 2;
                  var d = o.updateQueue;
                  if (d !== null) {
                    d = d.shared;
                    var c = d.pending;
                    c === null ? u.next = u : (u.next = c.next, c.next = u), d.pending = u;
                  }
                }
                o.lanes |= n, u = o.alternate, u !== null && (u.lanes |= n), Bl(o.return, n, t), a.lanes |= n;
                break;
              }
              u = u.next;
            }
          } else if (o.tag === 10) l = o.type === t.type ? null : o.child;else if (o.tag === 18) {
            if (l = o.return, l === null) throw Error(R(341));
            l.lanes |= n, a = l.alternate, a !== null && (a.lanes |= n), Bl(l, n, t), l = o.sibling;
          } else l = o.child;
          if (l !== null) l.return = o;else for (l = o; l !== null;) {
            if (l === t) {
              l = null;
              break;
            }
            if (o = l.sibling, o !== null) {
              o.return = l.return, l = o;
              break;
            }
            l = l.return;
          }
          o = l;
        }
        je(e, t, s.children, n), t = t.child;
      }
      return t;
    case 9:
      return s = t.type, r = t.pendingProps.children, Fn(t, n), s = Ye(s), r = r(s), t.flags |= 1, je(e, t, r, n), t.child;
    case 14:
      return r = t.type, s = tt(r, t.pendingProps), s = tt(r.type, s), pu(e, t, r, s, n);
    case 15:
      return Fd(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, s = t.pendingProps, s = t.elementType === r ? s : tt(r, s), js(e, t), t.tag = 1, Le(r) ? (e = !0, Hs(t)) : e = !1, Fn(t, n), Md(t, r, s), Wl(t, r, s, n), ql(null, t, r, !0, e, n);
    case 19:
      return Wd(e, t, n);
    case 22:
      return $d(e, t, n);
  }
  throw Error(R(156, t.tag));
};
function lf(e, t) {
  return Pc(e, t);
}
function f0(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function Xe(e, t, n, r) {
  return new f0(e, t, n, r);
}
function ra(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function p0(e) {
  if (typeof e == "function") return ra(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Si) return 11;
    if (e === bi) return 14;
  }
  return 2;
}
function Qt(e, t) {
  var n = e.alternate;
  return n === null ? (n = Xe(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
    lanes: t.lanes,
    firstContext: t.firstContext
  }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function Ts(e, t, n, r, s, o) {
  var l = 2;
  if (r = e, typeof e == "function") ra(e) && (l = 1);else if (typeof e == "string") l = 5;else e: switch (e) {
    case Nn:
      return un(n.children, s, o, t);
    case ki:
      l = 8, s |= 8;
      break;
    case hl:
      return e = Xe(12, n, t, s | 2), e.elementType = hl, e.lanes = o, e;
    case ml:
      return e = Xe(13, n, t, s), e.elementType = ml, e.lanes = o, e;
    case xl:
      return e = Xe(19, n, t, s), e.elementType = xl, e.lanes = o, e;
    case xc:
      return go(n, s, o, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case hc:
          l = 10;
          break e;
        case mc:
          l = 9;
          break e;
        case Si:
          l = 11;
          break e;
        case bi:
          l = 14;
          break e;
        case Pt:
          l = 16, r = null;
          break e;
      }
      throw Error(R(130, e == null ? e : typeof e, ""));
  }
  return t = Xe(l, n, t, s), t.elementType = e, t.type = r, t.lanes = o, t;
}
function un(e, t, n, r) {
  return e = Xe(7, e, r, t), e.lanes = n, e;
}
function go(e, t, n, r) {
  return e = Xe(22, e, r, t), e.elementType = xc, e.lanes = n, e.stateNode = {
    isHidden: !1
  }, e;
}
function Zo(e, t, n) {
  return e = Xe(6, e, null, t), e.lanes = n, e;
}
function el(e, t, n) {
  return t = Xe(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = {
    containerInfo: e.containerInfo,
    pendingChildren: null,
    implementation: e.implementation
  }, t;
}
function h0(e, t, n, r, s) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Lo(0), this.expirationTimes = Lo(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Lo(0), this.identifierPrefix = r, this.onRecoverableError = s, this.mutableSourceEagerHydrationData = null;
}
function sa(e, t, n, r, s, o, l, a, u) {
  return e = new h0(e, t, n, a, u), t === 1 ? (t = 1, o === !0 && (t |= 8)) : t = 0, o = Xe(3, null, null, t), e.current = o, o.stateNode = e, o.memoizedState = {
    element: r,
    isDehydrated: n,
    cache: null,
    transitions: null,
    pendingSuspenseBoundaries: null
  }, Ui(o), e;
}
function m0(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: bn,
    key: r == null ? null : "" + r,
    children: e,
    containerInfo: t,
    implementation: n
  };
}
function af(e) {
  if (!e) return Xt;
  e = e._reactInternals;
  e: {
    if (yn(e) !== e || e.tag !== 1) throw Error(R(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (Le(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(R(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (Le(n)) return id(e, n, t);
  }
  return t;
}
function uf(e, t, n, r, s, o, l, a, u) {
  return e = sa(n, r, !0, e, s, o, l, a, u), e.context = af(null), n = e.current, r = Ce(), s = Vt(n), o = Nt(r, s), o.callback = t ?? null, Ht(n, o, s), e.current.lanes = s, Hr(e, s, r), ze(e, r), e;
}
function yo(e, t, n, r) {
  var s = t.current,
    o = Ce(),
    l = Vt(s);
  return n = af(n), t.context === null ? t.context = n : t.pendingContext = n, t = Nt(o, l), t.payload = {
    element: e
  }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = Ht(s, t, l), e !== null && (ot(e, s, l, o), bs(e, s, l)), l;
}
function no(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Eu(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function oa(e, t) {
  Eu(e, t), (e = e.alternate) && Eu(e, t);
}
function x0() {
  return null;
}
var cf = typeof reportError == "function" ? reportError : function (e) {
  console.error(e);
};
function la(e) {
  this._internalRoot = e;
}
vo.prototype.render = la.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(R(409));
  yo(e, t, null, null);
};
vo.prototype.unmount = la.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    mn(function () {
      yo(null, e, null, null);
    }), t[jt] = null;
  }
};
function vo(e) {
  this._internalRoot = e;
}
vo.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = $c();
    e = {
      blockedOn: null,
      target: e,
      priority: t
    };
    for (var n = 0; n < zt.length && t !== 0 && t < zt[n].priority; n++);
    zt.splice(n, 0, e), n === 0 && Bc(e);
  }
};
function ia(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function wo(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function ju() {}
function g0(e, t, n, r, s) {
  if (s) {
    if (typeof r == "function") {
      var o = r;
      r = function () {
        var d = no(l);
        o.call(d);
      };
    }
    var l = uf(t, r, e, 0, null, !1, !1, "", ju);
    return e._reactRootContainer = l, e[jt] = l.current, Or(e.nodeType === 8 ? e.parentNode : e), mn(), l;
  }
  for (; s = e.lastChild;) e.removeChild(s);
  if (typeof r == "function") {
    var a = r;
    r = function () {
      var d = no(u);
      a.call(d);
    };
  }
  var u = sa(e, 0, !1, null, null, !1, !1, "", ju);
  return e._reactRootContainer = u, e[jt] = u.current, Or(e.nodeType === 8 ? e.parentNode : e), mn(function () {
    yo(t, u, n, r);
  }), u;
}
function ko(e, t, n, r, s) {
  var o = n._reactRootContainer;
  if (o) {
    var l = o;
    if (typeof s == "function") {
      var a = s;
      s = function () {
        var u = no(l);
        a.call(u);
      };
    }
    yo(t, l, e, s);
  } else l = g0(n, t, e, s, r);
  return no(l);
}
Dc = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = fr(t.pendingLanes);
        n !== 0 && (ji(t, n | 1), ze(t, de()), !(X & 6) && (Kn = de() + 500, Jt()));
      }
      break;
    case 13:
      mn(function () {
        var r = Ct(e, 1);
        if (r !== null) {
          var s = Ce();
          ot(r, e, 1, s);
        }
      }), oa(e, 1);
  }
};
Ci = function (e) {
  if (e.tag === 13) {
    var t = Ct(e, 134217728);
    if (t !== null) {
      var n = Ce();
      ot(t, e, 134217728, n);
    }
    oa(e, 134217728);
  }
};
Fc = function (e) {
  if (e.tag === 13) {
    var t = Vt(e),
      n = Ct(e, t);
    if (n !== null) {
      var r = Ce();
      ot(n, e, t, r);
    }
    oa(e, t);
  }
};
$c = function () {
  return Y;
};
Uc = function (e, t) {
  var n = Y;
  try {
    return Y = e, t();
  } finally {
    Y = n;
  }
};
jl = function (e, t, n) {
  switch (t) {
    case "input":
      if (vl(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode;) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var s = co(r);
            if (!s) throw Error(R(90));
            yc(r), vl(r, s);
          }
        }
      }
      break;
    case "textarea":
      wc(e, n);
      break;
    case "select":
      t = n.value, t != null && zn(e, !!n.multiple, t, !1);
  }
};
Cc = ea;
_c = mn;
var y0 = {
    usingClientEntryPoint: !1,
    Events: [Vr, _n, co, Ec, jc, ea]
  },
  ar = {
    findFiberByHostInstance: tn,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom"
  },
  v0 = {
    bundleType: ar.bundleType,
    version: ar.version,
    rendererPackageName: ar.rendererPackageName,
    rendererConfig: ar.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: Tt.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return e = Ac(e), e === null ? null : e.stateNode;
    },
    findFiberByHostInstance: ar.findFiberByHostInstance || x0,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426"
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var hs = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hs.isDisabled && hs.supportsFiber) try {
    lo = hs.inject(v0), ht = hs;
  } catch {}
}
Be.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = y0;
Be.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!ia(t)) throw Error(R(200));
  return m0(e, t, null, n);
};
Be.createRoot = function (e, t) {
  if (!ia(e)) throw Error(R(299));
  var n = !1,
    r = "",
    s = cf;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (s = t.onRecoverableError)), t = sa(e, 1, !1, null, null, n, !1, r, s), e[jt] = t.current, Or(e.nodeType === 8 ? e.parentNode : e), new la(t);
};
Be.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0) throw typeof e.render == "function" ? Error(R(188)) : (e = Object.keys(e).join(","), Error(R(268, e)));
  return e = Ac(t), e = e === null ? null : e.stateNode, e;
};
Be.flushSync = function (e) {
  return mn(e);
};
Be.hydrate = function (e, t, n) {
  if (!wo(t)) throw Error(R(200));
  return ko(null, e, t, !0, n);
};
Be.hydrateRoot = function (e, t, n) {
  if (!ia(e)) throw Error(R(405));
  var r = n != null && n.hydratedSources || null,
    s = !1,
    o = "",
    l = cf;
  if (n != null && (n.unstable_strictMode === !0 && (s = !0), n.identifierPrefix !== void 0 && (o = n.identifierPrefix), n.onRecoverableError !== void 0 && (l = n.onRecoverableError)), t = uf(t, null, e, 1, n ?? null, s, !1, o, l), e[jt] = t.current, Or(e), r) for (e = 0; e < r.length; e++) n = r[e], s = n._getVersion, s = s(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, s] : t.mutableSourceEagerHydrationData.push(n, s);
  return new vo(t);
};
Be.render = function (e, t, n) {
  if (!wo(t)) throw Error(R(200));
  return ko(null, e, t, !1, n);
};
Be.unmountComponentAtNode = function (e) {
  if (!wo(e)) throw Error(R(40));
  return e._reactRootContainer ? (mn(function () {
    ko(null, null, e, !1, function () {
      e._reactRootContainer = null, e[jt] = null;
    });
  }), !0) : !1;
};
Be.unstable_batchedUpdates = ea;
Be.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!wo(n)) throw Error(R(200));
  if (e == null || e._reactInternals === void 0) throw Error(R(38));
  return ko(e, t, n, !1, r);
};
Be.version = "18.3.1-next-f1338f8080-20240426";
function df() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(df);
  } catch (e) {
    console.error(e);
  }
}
df(), cc.exports = Be;
var w0 = cc.exports,
  Cu = w0;
fl.createRoot = Cu.createRoot, fl.hydrateRoot = Cu.hydrateRoot;
const ff = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
const k0 = e => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const S0 = e => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (t, n, r) => r ? r.toUpperCase() : n.toLowerCase());
const _u = e => {
  const t = S0(e);
  return t.charAt(0).toUpperCase() + t.slice(1);
};
var tl = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const b0 = e => {
    for (const t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
    return !1;
  },
  N0 = E.createContext({}),
  E0 = () => E.useContext(N0),
  j0 = E.forwardRef(({
    color: e,
    size: t,
    strokeWidth: n,
    absoluteStrokeWidth: r,
    className: s = "",
    children: o,
    iconNode: l,
    ...a
  }, u) => {
    const {
        size: d = 24,
        strokeWidth: c = 2,
        absoluteStrokeWidth: h = !1,
        color: x = "currentColor",
        className: v = ""
      } = E0() ?? {},
      g = r ?? h ? Number(n ?? c) * 24 / Number(t ?? d) : n ?? c;
    return E.createElement("svg", {
      ref: u,
      ...tl,
      width: t ?? d ?? tl.width,
      height: t ?? d ?? tl.height,
      stroke: e ?? x,
      strokeWidth: g,
      className: ff("lucide", v, s),
      ...(!o && !b0(a) && {
        "aria-hidden": "true"
      }),
      ...a
    }, [...l.map(([y, S]) => E.createElement(y, S)), ...(Array.isArray(o) ? o : [o])]);
  });
const W = (e, t) => {
  const n = E.forwardRef(({
    className: r,
    ...s
  }, o) => E.createElement(j0, {
    ref: o,
    iconNode: t,
    className: ff(`lucide-${k0(_u(e))}`, `lucide-${e}`, r),
    ...s
  }));
  return n.displayName = _u(e), n;
};
const C0 = [["path", {
    d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
    key: "169zse"
  }]],
  Tu = W("activity", C0);
const _0 = [["path", {
    d: "m12 19-7-7 7-7",
    key: "1l729n"
  }], ["path", {
    d: "M19 12H5",
    key: "x3x0zl"
  }]],
  T0 = W("arrow-left", _0);
const R0 = [["path", {
    d: "M5 12h14",
    key: "1ays0h"
  }], ["path", {
    d: "m12 5 7 7-7 7",
    key: "xquz4c"
  }]],
  Ru = W("arrow-right", R0);
const A0 = [["path", {
    d: "M7 7h10v10",
    key: "1tivn9"
  }], ["path", {
    d: "M7 17 17 7",
    key: "1vkiza"
  }]],
  O0 = W("arrow-up-right", A0);
const P0 = [["path", {
    d: "M10.268 21a2 2 0 0 0 3.464 0",
    key: "vwvbt9"
  }], ["path", {
    d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
    key: "11g9vi"
  }]],
  L0 = W("bell", P0);
const z0 = [["path", {
    d: "M12 7v14",
    key: "1akyts"
  }], ["path", {
    d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
    key: "ruj8y"
  }]],
  M0 = W("book-open", z0);
const I0 = [["path", {
    d: "M12 7v6",
    key: "lw1j43"
  }], ["path", {
    d: "M15 10H9",
    key: "o6yqo3"
  }], ["path", {
    d: "M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",
    key: "oz39mx"
  }]],
  oi = W("bookmark-plus", I0);
const D0 = [["path", {
    d: "M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",
    key: "oz39mx"
  }]],
  pf = W("bookmark", D0);
const F0 = [["path", {
    d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
    key: "l5xja"
  }], ["path", {
    d: "M9 13a4.5 4.5 0 0 0 3-4",
    key: "10igwf"
  }], ["path", {
    d: "M6.003 5.125A3 3 0 0 0 6.401 6.5",
    key: "105sqy"
  }], ["path", {
    d: "M3.477 10.896a4 4 0 0 1 .585-.396",
    key: "ql3yin"
  }], ["path", {
    d: "M6 18a4 4 0 0 1-1.967-.516",
    key: "2e4loj"
  }], ["path", {
    d: "M12 13h4",
    key: "1ku699"
  }], ["path", {
    d: "M12 18h6a2 2 0 0 1 2 2v1",
    key: "105ag5"
  }], ["path", {
    d: "M12 8h8",
    key: "1lhi5i"
  }], ["path", {
    d: "M16 8V5a2 2 0 0 1 2-2",
    key: "u6izg6"
  }], ["circle", {
    cx: "16",
    cy: "13",
    r: ".5",
    key: "ry7gng"
  }], ["circle", {
    cx: "18",
    cy: "3",
    r: ".5",
    key: "1aiba7"
  }], ["circle", {
    cx: "20",
    cy: "21",
    r: ".5",
    key: "yhc1fs"
  }], ["circle", {
    cx: "20",
    cy: "8",
    r: ".5",
    key: "1e43v0"
  }]],
  kt = W("brain-circuit", F0);
const $0 = [["path", {
    d: "m6 9 6 6 6-6",
    key: "qrunsl"
  }]],
  aa = W("chevron-down", $0);
const U0 = [["path", {
    d: "m9 18 6-6-6-6",
    key: "mthhwq"
  }]],
  B0 = W("chevron-right", U0);
const H0 = [["path", {
    d: "m11 17-5-5 5-5",
    key: "13zhaf"
  }], ["path", {
    d: "m18 17-5-5 5-5",
    key: "h8a8et"
  }]],
  W0 = W("chevrons-left", H0);
const V0 = [["path", {
    d: "m6 17 5-5-5-5",
    key: "xnjwq"
  }], ["path", {
    d: "m13 17 5-5-5-5",
    key: "17xmmf"
  }]],
  Q0 = W("chevrons-right", V0);
const q0 = [["circle", {
    cx: "12",
    cy: "12",
    r: "10",
    key: "1mglay"
  }], ["path", {
    d: "m9 12 2 2 4-4",
    key: "dzmm74"
  }]],
  hf = W("circle-check", q0);
const K0 = [["circle", {
    cx: "12",
    cy: "12",
    r: "10",
    key: "1mglay"
  }], ["path", {
    d: "M12 6v6l4 2",
    key: "mmk7yg"
  }]],
  br = W("clock", K0);
const X0 = [["rect", {
    width: "14",
    height: "14",
    x: "8",
    y: "8",
    rx: "2",
    ry: "2",
    key: "17jyea"
  }], ["path", {
    d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
    key: "zix9uf"
  }]],
  mf = W("copy", X0);
const G0 = [["circle", {
    cx: "12",
    cy: "12",
    r: "1",
    key: "41hilf"
  }], ["circle", {
    cx: "19",
    cy: "12",
    r: "1",
    key: "1wjl8i"
  }], ["circle", {
    cx: "5",
    cy: "12",
    r: "1",
    key: "1pcz8c"
  }]],
  li = W("ellipsis", G0);
const Y0 = [["path", {
    d: "M15 3h6v6",
    key: "1q9fwt"
  }], ["path", {
    d: "M10 14 21 3",
    key: "gplh6r"
  }], ["path", {
    d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
    key: "a6xqqp"
  }]],
  ua = W("external-link", Y0);
const J0 = [["path", {
    d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
    key: "1oefj6"
  }], ["path", {
    d: "M14 2v5a1 1 0 0 0 1 1h5",
    key: "wfsgrz"
  }], ["path", {
    d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1",
    key: "1oajmo"
  }], ["path", {
    d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1",
    key: "mpwhp6"
  }]],
  ii = W("file-braces", J0);
const Z0 = [["path", {
    d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
    key: "1oefj6"
  }], ["path", {
    d: "M14 2v5a1 1 0 0 0 1 1h5",
    key: "wfsgrz"
  }], ["path", {
    d: "M10 9H8",
    key: "b1mrlr"
  }], ["path", {
    d: "M16 13H8",
    key: "t4e002"
  }], ["path", {
    d: "M16 17H8",
    key: "z1uh3a"
  }]],
  xt = W("file-text", Z0);
const em = [["path", {
    d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
    key: "1kt360"
  }]],
  Un = W("folder", em);
const tm = [["path", {
    d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
    key: "j76jl0"
  }], ["path", {
    d: "M22 10v6",
    key: "1lu8f3"
  }], ["path", {
    d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5",
    key: "1r8lef"
  }]],
  Ur = W("graduation-cap", tm);
const nm = [["path", {
    d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",
    key: "5wwlr5"
  }], ["path", {
    d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    key: "r6nss1"
  }]],
  ai = W("house", nm);
const rm = [["rect", {
    width: "7",
    height: "7",
    x: "3",
    y: "3",
    rx: "1",
    key: "1g98yp"
  }], ["rect", {
    width: "7",
    height: "7",
    x: "14",
    y: "3",
    rx: "1",
    key: "6d4xhi"
  }], ["rect", {
    width: "7",
    height: "7",
    x: "14",
    y: "14",
    rx: "1",
    key: "nxv5o0"
  }], ["rect", {
    width: "7",
    height: "7",
    x: "3",
    y: "14",
    rx: "1",
    key: "1bb6yr"
  }]],
  sn = W("layout-grid", rm);
const sm = [["path", {
    d: "m16 6 4 14",
    key: "ji33uf"
  }], ["path", {
    d: "M12 6v14",
    key: "1n7gus"
  }], ["path", {
    d: "M8 8v12",
    key: "1gg7y9"
  }], ["path", {
    d: "M4 4v16",
    key: "6qkkli"
  }]],
  xf = W("library", sm);
const om = [["path", {
    d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    key: "1gvzjb"
  }], ["path", {
    d: "M9 18h6",
    key: "x1upvd"
  }], ["path", {
    d: "M10 22h4",
    key: "ceow96"
  }]],
  lm = W("lightbulb", om);
const im = [["path", {
    d: "M9 17H7A5 5 0 0 1 7 7h2",
    key: "8i5ue5"
  }], ["path", {
    d: "M15 7h2a5 5 0 1 1 0 10h-2",
    key: "1b9ql8"
  }], ["line", {
    x1: "8",
    x2: "16",
    y1: "12",
    y2: "12",
    key: "1jonct"
  }]],
  am = W("link-2", im);
const um = [["path", {
    d: "M3 5h.01",
    key: "18ugdj"
  }], ["path", {
    d: "M3 12h.01",
    key: "nlz23k"
  }], ["path", {
    d: "M3 19h.01",
    key: "noohij"
  }], ["path", {
    d: "M8 5h13",
    key: "1pao27"
  }], ["path", {
    d: "M8 12h13",
    key: "1za7za"
  }], ["path", {
    d: "M8 19h13",
    key: "m83p4d"
  }]],
  gf = W("list", um);
const cm = [["path", {
    d: "M21 12a9 9 0 1 1-6.219-8.56",
    key: "13zald"
  }]],
  ca = W("loader-circle", cm);
const dm = [["path", {
    d: "M12 19v3",
    key: "npa21l"
  }], ["path", {
    d: "M19 10v2a7 7 0 0 1-14 0v-2",
    key: "1vc78b"
  }], ["rect", {
    x: "9",
    y: "2",
    width: "6",
    height: "13",
    rx: "3",
    key: "s6n7sd"
  }]],
  fm = W("mic", dm);
const pm = [["path", {
    d: "M5 12h14",
    key: "1ays0h"
  }]],
  hm = W("minus", pm);
const mm = [["rect", {
    width: "18",
    height: "18",
    x: "3",
    y: "3",
    rx: "2",
    key: "afitv7"
  }], ["path", {
    d: "M3 9h18",
    key: "1pudct"
  }], ["path", {
    d: "M9 21V9",
    key: "1oto5p"
  }]],
  xm = W("panels-top-left", mm);
const gm = [["path", {
    d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",
    key: "1miecu"
  }]],
  ym = W("paperclip", gm);
const vm = [["path", {
    d: "M5 12h14",
    key: "1ays0h"
  }], ["path", {
    d: "M12 5v14",
    key: "s699le"
  }]],
  ro = W("plus", vm);
const wm = [["path", {
    d: "m21 21-4.34-4.34",
    key: "14j7rj"
  }], ["circle", {
    cx: "11",
    cy: "11",
    r: "8",
    key: "4ej97u"
  }]],
  da = W("search", wm);
const km = [["path", {
    d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
    key: "1ffxy3"
  }], ["path", {
    d: "m21.854 2.147-10.94 10.939",
    key: "12cjpa"
  }]],
  yf = W("send", km);
const Sm = [["path", {
    d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
    key: "oel41y"
  }], ["path", {
    d: "m9 12 2 2 4-4",
    key: "dzmm74"
  }]],
  bm = W("shield-check", Sm);
const Nm = [["path", {
    d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
    key: "1s2grr"
  }], ["path", {
    d: "M20 2v4",
    key: "1rf3ol"
  }], ["path", {
    d: "M22 4h-4",
    key: "gwowj6"
  }], ["circle", {
    cx: "4",
    cy: "20",
    r: "2",
    key: "6kqj1y"
  }]],
  qt = W("sparkles", Nm);
const Em = [["path", {
    d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
    key: "r04s7s"
  }]],
  fa = W("star", Em);
const jm = [["path", {
    d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",
    key: "m61m77"
  }], ["path", {
    d: "M17 14V2",
    key: "8ymqnk"
  }]],
  Cm = W("thumbs-down", jm);
const _m = [["path", {
    d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
    key: "emmmcr"
  }], ["path", {
    d: "M7 10v12",
    key: "1qc93n"
  }]],
  Tm = W("thumbs-up", _m);
const Rm = [["path", {
    d: "M10 11v6",
    key: "nco0om"
  }], ["path", {
    d: "M14 11v6",
    key: "outv1u"
  }], ["path", {
    d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
    key: "miytrc"
  }], ["path", {
    d: "M3 6h18",
    key: "d0wm0j"
  }], ["path", {
    d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    key: "e791ji"
  }]],
  Am = W("trash-2", Rm);
const Om = [["path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    key: "1yyitq"
  }], ["circle", {
    cx: "9",
    cy: "7",
    r: "4",
    key: "nufk8"
  }], ["line", {
    x1: "19",
    x2: "19",
    y1: "8",
    y2: "14",
    key: "1bvyxn"
  }], ["line", {
    x1: "22",
    x2: "16",
    y1: "11",
    y2: "11",
    key: "1shjgl"
  }]],
  Pm = W("user-plus", Om);
const Lm = [["path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    key: "1yyitq"
  }], ["path", {
    d: "M16 3.128a4 4 0 0 1 0 7.744",
    key: "16gr8j"
  }], ["path", {
    d: "M22 21v-2a4 4 0 0 0-3-3.87",
    key: "kshegd"
  }], ["circle", {
    cx: "9",
    cy: "7",
    r: "4",
    key: "nufk8"
  }]],
  vf = W("users", Lm);
const zm = [["path", {
    d: "M18 6 6 18",
    key: "1bl5f8"
  }], ["path", {
    d: "m6 6 12 12",
    key: "d8bk6v"
  }]],
  wf = W("x", zm);
const Mm = [["path", {
    d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
    key: "1xq2db"
  }]],
  Xn = W("zap", Mm),
  ui = (e, t = {}) => {
    const {
        storage: n = "session",
        storageKey: r,
        defaultValue: s,
        immediate: o = !0,
        debounceMs: l = 0
      } = t,
      [a, u] = E.useState(s),
      [d, c] = E.useState(!0),
      [h, x] = E.useState(null),
      v = E.useRef(null),
      g = E.useRef(null),
      y = E.useRef(null);
    E.useEffect(() => ((async () => {
      try {
        typeof chrome < "u" && chrome.storage ? window.stateManager ? y.current = window.stateManager : y.current = Im() : y.current = Dm(), o && (await S()), c(!1);
      } catch (w) {
        console.error("StateManager initialization failed:", w), x(w.message), c(!1);
      }
    })(), () => {
      v.current && v.current(), g.current && clearTimeout(g.current);
    }), [e, o]);
    const S = E.useCallback(async () => {
      if (y.current) try {
        const f = await y.current.getState(r || e, {
          storage: n
        });
        u(f !== void 0 ? f : s), x(null);
      } catch (f) {
        console.error("Failed to load initial state:", f), x(f.message);
      }
    }, [e, r, s, n]);
    E.useEffect(() => {
      if (!y.current || !o) return;
      const f = `${n}:${r || e}`,
        w = y.current.subscribe(f, j => {
          const A = j.value;
          l > 0 ? (g.current && clearTimeout(g.current), g.current = setTimeout(() => {
            u(A), x(null);
          }, l)) : (u(A), x(null));
        }, {
          immediate: !0
        });
      return v.current = w, () => {
        w && w();
      };
    }, [e, r, n, o, l]);
    const m = E.useCallback(async f => {
        if (!y.current) throw new Error("StateManager not initialized");
        try {
          x(null), await y.current.setState(r || e, f, {
            storage: n
          }), u(f);
        } catch (w) {
          throw console.error("Failed to set state:", w), x(w.message), w;
        }
      }, [e, r, n]),
      p = E.useCallback(async () => {
        if (!y.current) throw new Error("StateManager not initialized");
        try {
          x(null), await y.current.clearState(r || e, {
            storage: n
          }), u(s);
        } catch (f) {
          throw console.error("Failed to clear state:", f), x(f.message), f;
        }
      }, [e, r, s, n]);
    return [a, m, {
      loading: d,
      error: h,
      clearState: p,
      refresh: S
    }];
  };
function Im() {
  const e = new Map(),
    t = new Map();
  return {
    async getState(n, r = {}) {
      const s = `${r.storage || "session"}:${n}`;
      return e.get(s);
    },
    async setState(n, r, s = {}) {
      const o = `${s.storage || "session"}:${n}`;
      e.set(o, r), t.has(o) && t.get(o).forEach(l => {
        try {
          l({
            value: r,
            oldValue: e.get(o),
            source: "direct"
          });
        } catch (a) {
          console.error("State listener error:", a);
        }
      });
    },
    subscribe(n, r) {
      return t.has(n) || t.set(n, new Set()), t.get(n).add(r), () => {
        const s = t.get(n);
        s && (s.delete(r), s.size === 0 && t.delete(n));
      };
    },
    clearState(n, r = {}) {
      const s = `${r.storage || "session"}:${n}`;
      e.delete(s), t.delete(s);
    },
    getStats() {
      return {
        stateSize: e.size,
        listenerCount: Array.from(t.values()).reduce((n, r) => n + r.size, 0)
      };
    }
  };
}
function Dm() {
  const e = new Map(),
    t = new Map();
  return {
    async getState(n, r = {}) {
      const s = `${r.storage || "session"}:${n}`;
      return e.get(s);
    },
    async setState(n, r, s = {}) {
      const o = `${s.storage || "session"}:${n}`,
        l = e.get(o);
      e.set(o, r), await new Promise(a => setTimeout(a, 50)), t.has(o) && t.get(o).forEach(a => {
        try {
          a({
            value: r,
            oldValue: l,
            source: "mock"
          });
        } catch (u) {
          console.error("Mock state listener error:", u);
        }
      });
    },
    subscribe(n, r) {
      return t.has(n) || t.set(n, new Set()), t.get(n).add(r), () => {
        const s = t.get(n);
        s && (s.delete(r), s.size === 0 && t.delete(n));
      };
    },
    clearState(n, r = {}) {
      const s = `${r.storage || "session"}:${n}`;
      e.delete(s), t.delete(s);
    },
    getStats() {
      return {
        mock: !0,
        stateSize: e.size,
        listenerCount: Array.from(t.values()).reduce((n, r) => n + r.size, 0)
      };
    }
  };
}
const Fm = (e = {}) => {
    const {
        autoHideOnNavigation: t = !0,
        keyboardShortcut: n = !0,
        mobileBreakpoint: r = 768,
        animationDuration: s = 300
      } = e,
      [o, l] = E.useState(!1),
      [a, u] = E.useState(!1),
      [d, c] = E.useState(!1),
      [h, x] = E.useState({
        x: 0,
        y: 0
      }),
      [v, g] = E.useState({
        width: 400,
        height: "100vh"
      }),
      [y, S] = E.useState(!1),
      [m, p] = E.useState(!1),
      [f, w] = E.useState(!1),
      [j, A] = E.useState(null),
      [_, P] = ui("aideIsCollapsed", {
        defaultValue: !0,
        storage: "local"
      }),
      U = E.useRef(null);
    E.useEffect(() => {
      (async () => {
        try {
          w(!0), A(null), window.location.search.includes("mode=sidebar") ? (c(!0), l(!_)) : typeof chrome < "u" && chrome.runtime && chrome.runtime.sendMessage && chrome.runtime.sendMessage({
            type: "GET_SIDEBAR_STATE"
          }, B => {
            if (chrome.runtime.lastError) {
              console.warn("GET_SIDEBAR_STATE failed:", chrome.runtime.lastError.message);
              return;
            }
            if (B && B.success) {
              const D = B.state || B.sidebar || B;
              l(!!(D != null && D.isOpen)), c(!!(D != null && D.isVisible));
            }
          }), w(!1);
        } catch (z) {
          A((z == null ? void 0 : z.message) || "Unknown error during sidebar initialization"), w(!1);
        }
      })();
      const O = z => {
        z.type === "SIDEBAR_TOGGLED" && (l(z.isVisible), c(z.isVisible), P(!z.isVisible));
      };
      return typeof chrome < "u" && chrome.runtime && chrome.runtime.onMessage && chrome.runtime.onMessage.addListener(O), () => {
        U.current && clearTimeout(U.current), typeof chrome < "u" && chrome.runtime && chrome.runtime.onMessage && chrome.runtime.onMessage.removeListener(O);
      };
    }, [_]), E.useEffect(() => {
      const b = () => {
        const O = window.innerWidth <= r;
        S(O), p(!!(O && o));
      };
      return b(), window.addEventListener("resize", b), () => window.removeEventListener("resize", b);
    }, [r, o]), E.useEffect(() => {
      if (!n) return;
      const b = O => {
        (O.ctrlKey || O.metaKey) && O.shiftKey && O.key.toLowerCase() === "f" && (O.preventDefault(), Q()), O.key === "Escape" && o && G();
      };
      return document.addEventListener("keydown", b), () => document.removeEventListener("keydown", b);
    }, [n, o]);
    const F = async b => new Promise(O => {
        typeof chrome < "u" && chrome.runtime && chrome.runtime.sendMessage ? window.location.search.includes("mode=sidebar") ? chrome.runtime.sendMessage({
          type: b + "_REQUEST"
        }, z => {
          chrome.runtime.lastError && console.warn(chrome.runtime.lastError.message), O(z);
        }) : chrome.tabs.query({
          active: !0,
          currentWindow: !0
        }, z => {
          z[0] ? chrome.tabs.sendMessage(z[0].id, {
            type: b
          }, B => {
            chrome.runtime.lastError && console.warn(chrome.runtime.lastError.message), O(B);
          }) : O(null);
        }) : O(null);
      }),
      Q = E.useCallback(async () => {
        if (!(a || f)) try {
          u(!0), A(null);
          const b = await F("TOGGLE_SIDEBAR");
          b && b.success && (l(b.visible), P(!b.visible)), U.current && clearTimeout(U.current), U.current = setTimeout(() => u(!1), s);
        } catch (b) {
          A(b.message), u(!1);
        }
      }, [a, f, P, s]),
      ce = E.useCallback(async () => {
        if (!(o || a || f)) try {
          u(!0), A(null);
          const b = await F("OPEN_SIDEBAR");
          b && b.success && (l(!0), P(!1)), setTimeout(() => u(!1), s);
        } catch (b) {
          A(b.message), u(!1);
        }
      }, [o, a, f, P, s]),
      G = E.useCallback(async () => {
        if (!(!o || a || f)) try {
          u(!0), A(null);
          const b = await F("CLOSE_SIDEBAR");
          b && b.success && (l(!1), P(!0)), setTimeout(() => u(!1), s);
        } catch (b) {
          A(b.message), u(!1);
        }
      }, [o, a, f, P, s]),
      ne = E.useCallback((b, O) => x({
        x: b,
        y: O
      }), []),
      T = E.useCallback((b, O) => g({
        width: b,
        height: O
      }), []),
      L = E.useCallback(async () => {
        try {
          w(!0), await G(), x({
            x: 0,
            y: 0
          }), g({
            width: 400,
            height: "100vh"
          }), w(!1);
        } catch (b) {
          A(b.message), w(!1);
        }
      }, [G]),
      I = E.useCallback(() => {
        const b = ["focusflow-sidebar"];
        return o && b.push("focusflow-sidebar--open"), a && b.push("focusflow-sidebar--animating"), d && b.push("focusflow-sidebar--visible"), y && b.push("focusflow-sidebar--mobile"), m && b.push("focusflow-sidebar--overlay"), b.join(" ");
      }, [o, a, d, y, m]),
      C = E.useCallback(() => ({
        "--sidebar-width": `${v.width}px`,
        "--sidebar-height": typeof v.height == "number" ? `${v.height}px` : v.height,
        "--sidebar-x": `${h.x}px`,
        "--sidebar-y": `${h.y}px`,
        "--animation-duration": `${s}ms`,
        transform: `translate(${o ? "0" : "100%"}, 0)`,
        transition: a ? `transform ${s}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none"
      }), [o, a, v, h, s]);
    return {
      isOpen: o,
      isVisible: d,
      isAnimating: a,
      isLoading: f,
      error: j,
      isMobile: y,
      hasOverlay: m,
      position: h,
      size: v,
      isCollapsed: !o,
      canToggle: !a && !f,
      toggleSidebar: Q,
      openSidebar: ce,
      closeSidebar: G,
      resetSidebar: L,
      updatePosition: ne,
      updateSize: T,
      getSidebarClasses: I,
      getSidebarStyles: C,
      collapsedState: _
    };
  },
  $m = {
    isConnected: !0,
    isLoading: !1,
    error: null,
    currentTab: null,
    selectedText: "",
    researchSession: null,
    sidebarOpen: !1,
    sidebarAnimating: !1,
    isMobile: !1,
    activeView: "launcher",
    theme: "dark",
    debugMode: !1,
    performance: {
      messageCount: 0,
      lastActivity: null,
      errors: []
    }
  },
  V = {
    SET_CONNECTED: "SET_CONNECTED",
    SET_LOADING: "SET_LOADING",
    SET_ERROR: "SET_ERROR",
    CLEAR_ERROR: "CLEAR_ERROR",
    SET_CURRENT_TAB: "SET_CURRENT_TAB",
    SET_SELECTED_TEXT: "SET_SELECTED_TEXT",
    SET_RESEARCH_SESSION: "SET_RESEARCH_SESSION",
    CLEAR_CONTENT: "CLEAR_CONTENT",
    SET_SIDEBAR_OPEN: "SET_SIDEBAR_OPEN",
    SET_SIDEBAR_ANIMATING: "SET_SIDEBAR_ANIMATING",
    SET_MOBILE: "SET_MOBILE",
    SET_ACTIVE_VIEW: "SET_ACTIVE_VIEW",
    SET_THEME: "SET_THEME",
    INCREMENT_MESSAGE_COUNT: "INCREMENT_MESSAGE_COUNT",
    UPDATE_LAST_ACTIVITY: "UPDATE_LAST_ACTIVITY",
    ADD_ERROR: "ADD_ERROR",
    CLEAR_ERRORS: "CLEAR_ERRORS"
  };
function Um(e, t) {
  switch (t.type) {
    case V.SET_CONNECTED:
      return {
        ...e,
        isConnected: t.payload
      };
    case V.SET_LOADING:
      return {
        ...e,
        isLoading: t.payload
      };
    case V.SET_ERROR:
      return {
        ...e,
        error: t.payload,
        performance: {
          ...e.performance,
          errors: [...e.performance.errors, t.payload].slice(-10)
        }
      };
    case V.CLEAR_ERROR:
      return {
        ...e,
        error: null
      };
    case V.SET_CURRENT_TAB:
      return {
        ...e,
        currentTab: t.payload
      };
    case V.SET_SELECTED_TEXT:
      return {
        ...e,
        selectedText: t.payload
      };
    case V.SET_RESEARCH_SESSION:
      return {
        ...e,
        researchSession: t.payload
      };
    case V.CLEAR_CONTENT:
      return {
        ...e,
        selectedText: "",
        researchSession: null
      };
    case V.SET_SIDEBAR_OPEN:
      return {
        ...e,
        sidebarOpen: t.payload
      };
    case V.SET_SIDEBAR_ANIMATING:
      return {
        ...e,
        sidebarAnimating: t.payload
      };
    case V.SET_MOBILE:
      return {
        ...e,
        isMobile: t.payload
      };
    case V.SET_ACTIVE_VIEW:
      return {
        ...e,
        activeView: t.payload
      };
    case V.SET_THEME:
      return {
        ...e,
        theme: t.payload
      };
    case V.INCREMENT_MESSAGE_COUNT:
      return {
        ...e,
        performance: {
          ...e.performance,
          messageCount: e.performance.messageCount + 1
        }
      };
    case V.UPDATE_LAST_ACTIVITY:
      return {
        ...e,
        performance: {
          ...e.performance,
          lastActivity: t.payload
        }
      };
    case V.ADD_ERROR:
      return {
        ...e,
        performance: {
          ...e.performance,
          errors: [...e.performance.errors, t.payload].slice(-10)
        }
      };
    case V.CLEAR_ERRORS:
      return {
        ...e,
        performance: {
          ...e.performance,
          errors: []
        }
      };
    default:
      return e;
  }
}
const kf = E.createContext(),
  Bm = ({
    children: e
  }) => {
    const [t, n] = E.useReducer(Um, $m),
      r = Fm(),
      [s] = ui("aideCurrentTab", {
        storage: "local",
        defaultValue: null
      }),
      [o] = ui("aideCurrentSelection", {
        storage: "local",
        defaultValue: ""
      });
    E.useEffect(() => {
      (async () => {
        try {
          typeof chrome < "u" && chrome.runtime && chrome.runtime.sendMessage && chrome.runtime.sendMessage({
            type: "AIDE_GET_ACTIVE_TAB"
          }, h => {
            chrome.runtime.lastError || h && h.success && h.tab && n({
              type: V.SET_CURRENT_TAB,
              payload: h.tab
            });
          });
        } catch {}
      })();
    }, []), E.useEffect(() => {
      if (typeof chrome > "u" || !chrome.storage) return;
      chrome.storage.local.get(["aideResearchSession"], h => {
        if (h.aideResearchSession) try {
          const x = JSON.parse(h.aideResearchSession);
          n({
            type: V.SET_RESEARCH_SESSION,
            payload: x
          });
        } catch {}
      });
      const c = (h, x) => {
        if (x === "local" && h.aideResearchSession) try {
          const v = h.aideResearchSession.newValue;
          if (!v) {
            n({
              type: V.SET_RESEARCH_SESSION,
              payload: null
            });
            return;
          }
          const g = typeof v == "string" ? JSON.parse(v) : v;
          n({
            type: V.SET_RESEARCH_SESSION,
            payload: g
          });
        } catch {}
      };
      return chrome.storage.onChanged.addListener(c), () => chrome.storage.onChanged.removeListener(c);
    }, []), E.useEffect(() => {
      if (typeof chrome > "u" || !chrome.runtime || !chrome.runtime.onMessage) return;
      const c = h => {
        h.type === "TAB_CHANGED" && h.tab && n({
          type: V.SET_CURRENT_TAB,
          payload: h.tab
        }), h.type === "SESSION_UPDATED" && h.session && n({
          type: V.SET_RESEARCH_SESSION,
          payload: h.session
        });
      };
      return chrome.runtime.onMessage.addListener(c), () => chrome.runtime.onMessage.removeListener(c);
    }, []), E.useEffect(() => {
      n({
        type: V.SET_CURRENT_TAB,
        payload: s
      });
    }, [s]), E.useEffect(() => {
      n({
        type: V.SET_SELECTED_TEXT,
        payload: o
      });
    }, [o]), E.useEffect(() => {
      r && typeof r.isOpen == "boolean" && (n({
        type: V.SET_SIDEBAR_OPEN,
        payload: r.isOpen
      }), n({
        type: V.SET_SIDEBAR_ANIMATING,
        payload: r.isAnimating
      }), n({
        type: V.SET_MOBILE,
        payload: r.isMobile
      }));
    }, [r == null ? void 0 : r.isOpen, r == null ? void 0 : r.isVisible, r == null ? void 0 : r.isAnimating, r == null ? void 0 : r.isMobile]);
    const l = E.useCallback(c => new Promise(h => {
        typeof chrome < "u" && chrome.runtime && chrome.runtime.sendMessage ? chrome.runtime.sendMessage(c, x => {
          chrome.runtime.lastError && console.warn(chrome.runtime.lastError.message), h(x);
        }) : h(null);
      }), []),
      a = E.useCallback(c => new Promise(h => {
        typeof chrome < "u" && chrome.tabs ? chrome.tabs.query({
          active: !0,
          currentWindow: !0
        }, x => {
          x[0] ? chrome.tabs.sendMessage(x[0].id, c, v => {
            chrome.runtime.lastError && console.warn(chrome.runtime.lastError.message), h(v);
          }) : h(null);
        }) : h(null);
      }), []),
      u = E.useMemo(() => ({
        setConnected: c => n({
          type: V.SET_CONNECTED,
          payload: c
        }),
        setLoading: c => n({
          type: V.SET_LOADING,
          payload: c
        }),
        setError: c => n({
          type: V.SET_ERROR,
          payload: c
        }),
        clearError: () => n({
          type: V.CLEAR_ERROR
        }),
        setCurrentTab: c => n({
          type: V.SET_CURRENT_TAB,
          payload: c
        }),
        setSelectedText: c => n({
          type: V.SET_SELECTED_TEXT,
          payload: c
        }),
        clearContent: () => n({
          type: V.CLEAR_CONTENT
        }),
        setSidebarOpen: c => n({
          type: V.SET_SIDEBAR_OPEN,
          payload: c
        }),
        setSidebarAnimating: c => n({
          type: V.SET_SIDEBAR_ANIMATING,
          payload: c
        }),
        setActiveView: c => n({
          type: V.SET_ACTIVE_VIEW,
          payload: c
        }),
        setTheme: c => n({
          type: V.SET_THEME,
          payload: c
        }),
        clearErrors: () => n({
          type: V.CLEAR_ERRORS
        }),
        sendMessage: l,
        sendToContent: a,
        extractContent: async () => {
          try {
            return typeof chrome < "u" && chrome.runtime && chrome.runtime.sendMessage ? new Promise(c => {
              chrome.runtime.sendMessage({
                type: "EXTRACT_CONTENT_REQUEST"
              }, h => {
                chrome.runtime.lastError && console.warn("Extraction chrome message failed", chrome.runtime.lastError.message), c(h);
              });
            }) : null;
          } catch (c) {
            console.error("Extraction request failed", c);
          }
        },
        removeSource: async c => {
          typeof chrome > "u" || !chrome.storage || chrome.storage.local.get(["aideResearchSession"], h => {
            if (h.aideResearchSession) {
              let x = JSON.parse(h.aideResearchSession);
              x.extractedPages = x.extractedPages.filter(v => v.url !== c), x.updatedAt = new Date().toISOString(), chrome.storage.local.set({
                aideResearchSession: JSON.stringify(x)
              });
            }
          });
        },
        clearSession: async () => {
          typeof chrome > "u" || !chrome.storage || chrome.storage.local.remove("aideResearchSession");
        },
        toggleSidebar: r.toggleSidebar,
        openSidebar: r.openSidebar,
        closeSidebar: r.closeSidebar,
        exportState: () => {
          var c;
          return {
            context: t,
            sidebar: ((c = r.getState) == null ? void 0 : c.call(r)) || {},
            timestamp: new Date().toISOString()
          };
        }
      }), [n, l, a, r]),
      d = E.useMemo(() => {
        var c, h;
        return {
          ...t,
          ...r,
          actions: u,
          isReady: t.isConnected && !t.isLoading,
          hasContent: !!(((h = (c = t.researchSession) == null ? void 0 : c.extractedPages) == null ? void 0 : h.length) > 0 || t.selectedText),
          hasError: !!t.error,
          isProduction: !0
        };
      }, [t, r, u]);
    return i.jsx(kf.Provider, {
      value: d,
      children: e
    });
  },
  Hm = () => {
    const e = E.useContext(kf);
    if (!e) throw new Error("useExtension must be used within an ExtensionProvider");
    return e;
  };
function Sf(e, t) {
  return function () {
    return e.apply(t, arguments);
  };
}
const {
    toString: Wm
  } = Object.prototype,
  {
    getPrototypeOf: So
  } = Object,
  {
    iterator: bo,
    toStringTag: bf
  } = Symbol,
  No = (e => t => {
    const n = Wm.call(t);
    return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
  })(Object.create(null)),
  it = e => (e = e.toLowerCase(), t => No(t) === e),
  Eo = e => t => typeof t === e,
  {
    isArray: er
  } = Array,
  Gn = Eo("undefined");
function qr(e) {
  return e !== null && !Gn(e) && e.constructor !== null && !Gn(e.constructor) && Me(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Nf = it("ArrayBuffer");
function Vm(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Nf(e.buffer), t;
}
const Qm = Eo("string"),
  Me = Eo("function"),
  Ef = Eo("number"),
  Kr = e => e !== null && typeof e == "object",
  qm = e => e === !0 || e === !1,
  Rs = e => {
    if (No(e) !== "object") return !1;
    const t = So(e);
    return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(bf in e) && !(bo in e);
  },
  Km = e => {
    if (!Kr(e) || qr(e)) return !1;
    try {
      return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
    } catch {
      return !1;
    }
  },
  Xm = it("Date"),
  Gm = it("File"),
  Ym = e => !!(e && typeof e.uri < "u"),
  Jm = e => e && typeof e.getParts < "u",
  Zm = it("Blob"),
  ex = it("FileList"),
  tx = e => Kr(e) && Me(e.pipe);
function nx() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const Au = nx(),
  Ou = typeof Au.FormData < "u" ? Au.FormData : void 0,
  rx = e => {
    if (!e) return !1;
    if (Ou && e instanceof Ou) return !0;
    const t = So(e);
    if (!t || t === Object.prototype || !Me(e.append)) return !1;
    const n = No(e);
    return n === "formdata" || n === "object" && Me(e.toString) && e.toString() === "[object FormData]";
  },
  sx = it("URLSearchParams"),
  [ox, lx, ix, ax] = ["ReadableStream", "Request", "Response", "Headers"].map(it),
  ux = e => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Xr(e, t, {
  allOwnKeys: n = !1
} = {}) {
  if (e === null || typeof e > "u") return;
  let r, s;
  if (typeof e != "object" && (e = [e]), er(e)) for (r = 0, s = e.length; r < s; r++) t.call(null, e[r], r, e);else {
    if (qr(e)) return;
    const o = n ? Object.getOwnPropertyNames(e) : Object.keys(e),
      l = o.length;
    let a;
    for (r = 0; r < l; r++) a = o[r], t.call(null, e[a], a, e);
  }
}
function jf(e, t) {
  if (qr(e)) return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length,
    s;
  for (; r-- > 0;) if (s = n[r], t === s.toLowerCase()) return s;
  return null;
}
const on = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global,
  Cf = e => !Gn(e) && e !== on;
function ci() {
  const {
      caseless: e,
      skipUndefined: t
    } = Cf(this) && this || {},
    n = {},
    r = (s, o) => {
      if (o === "__proto__" || o === "constructor" || o === "prototype") return;
      const l = e && jf(n, o) || o;
      Rs(n[l]) && Rs(s) ? n[l] = ci(n[l], s) : Rs(s) ? n[l] = ci({}, s) : er(s) ? n[l] = s.slice() : (!t || !Gn(s)) && (n[l] = s);
    };
  for (let s = 0, o = arguments.length; s < o; s++) arguments[s] && Xr(arguments[s], r);
  return n;
}
const cx = (e, t, n, {
    allOwnKeys: r
  } = {}) => (Xr(t, (s, o) => {
    n && Me(s) ? Object.defineProperty(e, o, {
      value: Sf(s, n),
      writable: !0,
      enumerable: !0,
      configurable: !0
    }) : Object.defineProperty(e, o, {
      value: s,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  }, {
    allOwnKeys: r
  }), e),
  dx = e => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e),
  fx = (e, t, n, r) => {
    e.prototype = Object.create(t.prototype, r), Object.defineProperty(e.prototype, "constructor", {
      value: e,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(e, "super", {
      value: t.prototype
    }), n && Object.assign(e.prototype, n);
  },
  px = (e, t, n, r) => {
    let s, o, l;
    const a = {};
    if (t = t || {}, e == null) return t;
    do {
      for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0;) l = s[o], (!r || r(l, e, t)) && !a[l] && (t[l] = e[l], a[l] = !0);
      e = n !== !1 && So(e);
    } while (e && (!n || n(e, t)) && e !== Object.prototype);
    return t;
  },
  hx = (e, t, n) => {
    e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
    const r = e.indexOf(t, n);
    return r !== -1 && r === n;
  },
  mx = e => {
    if (!e) return null;
    if (er(e)) return e;
    let t = e.length;
    if (!Ef(t)) return null;
    const n = new Array(t);
    for (; t-- > 0;) n[t] = e[t];
    return n;
  },
  xx = (e => t => e && t instanceof e)(typeof Uint8Array < "u" && So(Uint8Array)),
  gx = (e, t) => {
    const r = (e && e[bo]).call(e);
    let s;
    for (; (s = r.next()) && !s.done;) {
      const o = s.value;
      t.call(e, o[0], o[1]);
    }
  },
  yx = (e, t) => {
    let n;
    const r = [];
    for (; (n = e.exec(t)) !== null;) r.push(n);
    return r;
  },
  vx = it("HTMLFormElement"),
  wx = e => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (n, r, s) {
    return r.toUpperCase() + s;
  }),
  Pu = (({
    hasOwnProperty: e
  }) => (t, n) => e.call(t, n))(Object.prototype),
  kx = it("RegExp"),
  _f = (e, t) => {
    const n = Object.getOwnPropertyDescriptors(e),
      r = {};
    Xr(n, (s, o) => {
      let l;
      (l = t(s, o, e)) !== !1 && (r[o] = l || s);
    }), Object.defineProperties(e, r);
  },
  Sx = e => {
    _f(e, (t, n) => {
      if (Me(e) && ["arguments", "caller", "callee"].indexOf(n) !== -1) return !1;
      const r = e[n];
      if (Me(r)) {
        if (t.enumerable = !1, "writable" in t) {
          t.writable = !1;
          return;
        }
        t.set || (t.set = () => {
          throw Error("Can not rewrite read-only method '" + n + "'");
        });
      }
    });
  },
  bx = (e, t) => {
    const n = {},
      r = s => {
        s.forEach(o => {
          n[o] = !0;
        });
      };
    return er(e) ? r(e) : r(String(e).split(t)), n;
  },
  Nx = () => {},
  Ex = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function jx(e) {
  return !!(e && Me(e.append) && e[bf] === "FormData" && e[bo]);
}
const Cx = e => {
    const t = new Array(10),
      n = (r, s) => {
        if (Kr(r)) {
          if (t.indexOf(r) >= 0) return;
          if (qr(r)) return r;
          if (!("toJSON" in r)) {
            t[s] = r;
            const o = er(r) ? [] : {};
            return Xr(r, (l, a) => {
              const u = n(l, s + 1);
              !Gn(u) && (o[a] = u);
            }), t[s] = void 0, o;
          }
        }
        return r;
      };
    return n(e, 0);
  },
  _x = it("AsyncFunction"),
  Tx = e => e && (Kr(e) || Me(e)) && Me(e.then) && Me(e.catch),
  Tf = ((e, t) => e ? setImmediate : t ? ((n, r) => (on.addEventListener("message", ({
    source: s,
    data: o
  }) => {
    s === on && o === n && r.length && r.shift()();
  }, !1), s => {
    r.push(s), on.postMessage(n, "*");
  }))(`axios@${Math.random()}`, []) : n => setTimeout(n))(typeof setImmediate == "function", Me(on.postMessage)),
  Rx = typeof queueMicrotask < "u" ? queueMicrotask.bind(on) : typeof process < "u" && process.nextTick || Tf,
  Ax = e => e != null && Me(e[bo]),
  k = {
    isArray: er,
    isArrayBuffer: Nf,
    isBuffer: qr,
    isFormData: rx,
    isArrayBufferView: Vm,
    isString: Qm,
    isNumber: Ef,
    isBoolean: qm,
    isObject: Kr,
    isPlainObject: Rs,
    isEmptyObject: Km,
    isReadableStream: ox,
    isRequest: lx,
    isResponse: ix,
    isHeaders: ax,
    isUndefined: Gn,
    isDate: Xm,
    isFile: Gm,
    isReactNativeBlob: Ym,
    isReactNative: Jm,
    isBlob: Zm,
    isRegExp: kx,
    isFunction: Me,
    isStream: tx,
    isURLSearchParams: sx,
    isTypedArray: xx,
    isFileList: ex,
    forEach: Xr,
    merge: ci,
    extend: cx,
    trim: ux,
    stripBOM: dx,
    inherits: fx,
    toFlatObject: px,
    kindOf: No,
    kindOfTest: it,
    endsWith: hx,
    toArray: mx,
    forEachEntry: gx,
    matchAll: yx,
    isHTMLForm: vx,
    hasOwnProperty: Pu,
    hasOwnProp: Pu,
    reduceDescriptors: _f,
    freezeMethods: Sx,
    toObjectSet: bx,
    toCamelCase: wx,
    noop: Nx,
    toFiniteNumber: Ex,
    findKey: jf,
    global: on,
    isContextDefined: Cf,
    isSpecCompliantForm: jx,
    toJSONObject: Cx,
    isAsyncFn: _x,
    isThenable: Tx,
    setImmediate: Tf,
    asap: Rx,
    isIterable: Ax
  };
let $ = class Rf extends Error {
  static from(t, n, r, s, o, l) {
    const a = new Rf(t.message, n || t.code, r, s, o);
    return a.cause = t, a.name = t.name, t.status != null && a.status == null && (a.status = t.status), l && Object.assign(a, l), a;
  }
  constructor(t, n, r, s, o) {
    super(t), Object.defineProperty(this, "message", {
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, n && (this.code = n), r && (this.config = r), s && (this.request = s), o && (this.response = o, this.status = o.status);
  }
  toJSON() {
    return {
      message: this.message,
      name: this.name,
      description: this.description,
      number: this.number,
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      config: k.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
};
$.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
$.ERR_BAD_OPTION = "ERR_BAD_OPTION";
$.ECONNABORTED = "ECONNABORTED";
$.ETIMEDOUT = "ETIMEDOUT";
$.ERR_NETWORK = "ERR_NETWORK";
$.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
$.ERR_DEPRECATED = "ERR_DEPRECATED";
$.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
$.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
$.ERR_CANCELED = "ERR_CANCELED";
$.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
$.ERR_INVALID_URL = "ERR_INVALID_URL";
$.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const Ox = null;
function di(e) {
  return k.isPlainObject(e) || k.isArray(e);
}
function Af(e) {
  return k.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function nl(e, t, n) {
  return e ? e.concat(t).map(function (s, o) {
    return s = Af(s), !n && o ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function Px(e) {
  return k.isArray(e) && !e.some(di);
}
const Lx = k.toFlatObject(k, {}, null, function (t) {
  return /^is[A-Z]/.test(t);
});
function jo(e, t, n) {
  if (!k.isObject(e)) throw new TypeError("target must be an object");
  t = t || new FormData(), n = k.toFlatObject(n, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function (S, m) {
    return !k.isUndefined(m[S]);
  });
  const r = n.metaTokens,
    s = n.visitor || h,
    o = n.dots,
    l = n.indexes,
    a = n.Blob || typeof Blob < "u" && Blob,
    u = n.maxDepth === void 0 ? 100 : n.maxDepth,
    d = a && k.isSpecCompliantForm(t);
  if (!k.isFunction(s)) throw new TypeError("visitor must be a function");
  function c(y) {
    if (y === null) return "";
    if (k.isDate(y)) return y.toISOString();
    if (k.isBoolean(y)) return y.toString();
    if (!d && k.isBlob(y)) throw new $("Blob is not supported. Use a Buffer instead.");
    return k.isArrayBuffer(y) || k.isTypedArray(y) ? d && typeof Blob == "function" ? new Blob([y]) : Buffer.from(y) : y;
  }
  function h(y, S, m) {
    let p = y;
    if (k.isReactNative(t) && k.isReactNativeBlob(y)) return t.append(nl(m, S, o), c(y)), !1;
    if (y && !m && typeof y == "object") {
      if (k.endsWith(S, "{}")) S = r ? S : S.slice(0, -2), y = JSON.stringify(y);else if (k.isArray(y) && Px(y) || (k.isFileList(y) || k.endsWith(S, "[]")) && (p = k.toArray(y))) return S = Af(S), p.forEach(function (w, j) {
        !(k.isUndefined(w) || w === null) && t.append(l === !0 ? nl([S], j, o) : l === null ? S : S + "[]", c(w));
      }), !1;
    }
    return di(y) ? !0 : (t.append(nl(m, S, o), c(y)), !1);
  }
  const x = [],
    v = Object.assign(Lx, {
      defaultVisitor: h,
      convertValue: c,
      isVisitable: di
    });
  function g(y, S, m = 0) {
    if (!k.isUndefined(y)) {
      if (m > u) throw new $("Object is too deeply nested (" + m + " levels). Max depth: " + u, $.ERR_FORM_DATA_DEPTH_EXCEEDED);
      if (x.indexOf(y) !== -1) throw Error("Circular reference detected in " + S.join("."));
      x.push(y), k.forEach(y, function (f, w) {
        (!(k.isUndefined(f) || f === null) && s.call(t, f, k.isString(w) ? w.trim() : w, S, v)) === !0 && g(f, S ? S.concat(w) : [w], m + 1);
      }), x.pop();
    }
  }
  if (!k.isObject(e)) throw new TypeError("data must be an object");
  return g(e), t;
}
function Lu(e) {
  const t = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+"
  };
  return encodeURIComponent(e).replace(/[!'()~]|%20/g, function (r) {
    return t[r];
  });
}
function pa(e, t) {
  this._pairs = [], e && jo(e, this, t);
}
const Of = pa.prototype;
Of.append = function (t, n) {
  this._pairs.push([t, n]);
};
Of.toString = function (t) {
  const n = t ? function (r) {
    return t.call(this, r, Lu);
  } : Lu;
  return this._pairs.map(function (s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function zx(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function Pf(e, t, n) {
  if (!t) return e;
  const r = n && n.encode || zx,
    s = k.isFunction(n) ? {
      serialize: n
    } : n,
    o = s && s.serialize;
  let l;
  if (o ? l = o(t, s) : l = k.isURLSearchParams(t) ? t.toString() : new pa(t, s).toString(r), l) {
    const a = e.indexOf("#");
    a !== -1 && (e = e.slice(0, a)), e += (e.indexOf("?") === -1 ? "?" : "&") + l;
  }
  return e;
}
class zu {
  constructor() {
    this.handlers = [];
  }
  use(t, n, r) {
    return this.handlers.push({
      fulfilled: t,
      rejected: n,
      synchronous: r ? r.synchronous : !1,
      runWhen: r ? r.runWhen : null
    }), this.handlers.length - 1;
  }
  eject(t) {
    this.handlers[t] && (this.handlers[t] = null);
  }
  clear() {
    this.handlers && (this.handlers = []);
  }
  forEach(t) {
    k.forEach(this.handlers, function (r) {
      r !== null && t(r);
    });
  }
}
const ha = {
    silentJSONParsing: !0,
    forcedJSONParsing: !0,
    clarifyTimeoutError: !1,
    legacyInterceptorReqResOrdering: !0
  },
  Mx = typeof URLSearchParams < "u" ? URLSearchParams : pa,
  Ix = typeof FormData < "u" ? FormData : null,
  Dx = typeof Blob < "u" ? Blob : null,
  Fx = {
    isBrowser: !0,
    classes: {
      URLSearchParams: Mx,
      FormData: Ix,
      Blob: Dx
    },
    protocols: ["http", "https", "file", "blob", "url", "data"]
  },
  ma = typeof window < "u" && typeof document < "u",
  fi = typeof navigator == "object" && navigator || void 0,
  $x = ma && (!fi || ["ReactNative", "NativeScript", "NS"].indexOf(fi.product) < 0),
  Ux = typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope && typeof self.importScripts == "function",
  Bx = ma && window.location.href || "http://localhost",
  Hx = Object.freeze(Object.defineProperty({
    __proto__: null,
    hasBrowserEnv: ma,
    hasStandardBrowserEnv: $x,
    hasStandardBrowserWebWorkerEnv: Ux,
    navigator: fi,
    origin: Bx
  }, Symbol.toStringTag, {
    value: "Module"
  })),
  Ne = {
    ...Hx,
    ...Fx
  };
function Wx(e, t) {
  return jo(e, new Ne.classes.URLSearchParams(), {
    visitor: function (n, r, s, o) {
      return Ne.isNode && k.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
function Vx(e) {
  return k.matchAll(/\w+|\[(\w*)]/g, e).map(t => t[0] === "[]" ? "" : t[1] || t[0]);
}
function Qx(e) {
  const t = {},
    n = Object.keys(e);
  let r;
  const s = n.length;
  let o;
  for (r = 0; r < s; r++) o = n[r], t[o] = e[o];
  return t;
}
function Lf(e) {
  function t(n, r, s, o) {
    let l = n[o++];
    if (l === "__proto__") return !0;
    const a = Number.isFinite(+l),
      u = o >= n.length;
    return l = !l && k.isArray(s) ? s.length : l, u ? (k.hasOwnProp(s, l) ? s[l] = k.isArray(s[l]) ? s[l].concat(r) : [s[l], r] : s[l] = r, !a) : ((!s[l] || !k.isObject(s[l])) && (s[l] = []), t(n, r, s[l], o) && k.isArray(s[l]) && (s[l] = Qx(s[l])), !a);
  }
  if (k.isFormData(e) && k.isFunction(e.entries)) {
    const n = {};
    return k.forEachEntry(e, (r, s) => {
      t(Vx(r), s, n, 0);
    }), n;
  }
  return null;
}
const wn = (e, t) => e != null && k.hasOwnProp(e, t) ? e[t] : void 0;
function qx(e, t, n) {
  if (k.isString(e)) try {
    return (t || JSON.parse)(e), k.trim(e);
  } catch (r) {
    if (r.name !== "SyntaxError") throw r;
  }
  return (n || JSON.stringify)(e);
}
const Gr = {
  transitional: ha,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function (t, n) {
    const r = n.getContentType() || "",
      s = r.indexOf("application/json") > -1,
      o = k.isObject(t);
    if (o && k.isHTMLForm(t) && (t = new FormData(t)), k.isFormData(t)) return s ? JSON.stringify(Lf(t)) : t;
    if (k.isArrayBuffer(t) || k.isBuffer(t) || k.isStream(t) || k.isFile(t) || k.isBlob(t) || k.isReadableStream(t)) return t;
    if (k.isArrayBufferView(t)) return t.buffer;
    if (k.isURLSearchParams(t)) return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
    let a;
    if (o) {
      const u = wn(this, "formSerializer");
      if (r.indexOf("application/x-www-form-urlencoded") > -1) return Wx(t, u).toString();
      if ((a = k.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
        const d = wn(this, "env"),
          c = d && d.FormData;
        return jo(a ? {
          "files[]": t
        } : t, c && new c(), u);
      }
    }
    return o || s ? (n.setContentType("application/json", !1), qx(t)) : t;
  }],
  transformResponse: [function (t) {
    const n = wn(this, "transitional") || Gr.transitional,
      r = n && n.forcedJSONParsing,
      s = wn(this, "responseType"),
      o = s === "json";
    if (k.isResponse(t) || k.isReadableStream(t)) return t;
    if (t && k.isString(t) && (r && !s || o)) {
      const a = !(n && n.silentJSONParsing) && o;
      try {
        return JSON.parse(t, wn(this, "parseReviver"));
      } catch (u) {
        if (a) throw u.name === "SyntaxError" ? $.from(u, $.ERR_BAD_RESPONSE, this, null, wn(this, "response")) : u;
      }
    }
    return t;
  }],
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: Ne.classes.FormData,
    Blob: Ne.classes.Blob
  },
  validateStatus: function (t) {
    return t >= 200 && t < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
k.forEach(["delete", "get", "head", "post", "put", "patch"], e => {
  Gr.headers[e] = {};
});
const Kx = k.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]),
  Xx = e => {
    const t = {};
    let n, r, s;
    return e && e.split(`
`).forEach(function (l) {
      s = l.indexOf(":"), n = l.substring(0, s).trim().toLowerCase(), r = l.substring(s + 1).trim(), !(!n || t[n] && Kx[n]) && (n === "set-cookie" ? t[n] ? t[n].push(r) : t[n] = [r] : t[n] = t[n] ? t[n] + ", " + r : r);
    }), t;
  },
  Mu = Symbol("internals"),
  Gx = /[^\x09\x20-\x7E\x80-\xFF]/g;
function Yx(e) {
  let t = 0,
    n = e.length;
  for (; t < n;) {
    const r = e.charCodeAt(t);
    if (r !== 9 && r !== 32) break;
    t += 1;
  }
  for (; n > t;) {
    const r = e.charCodeAt(n - 1);
    if (r !== 9 && r !== 32) break;
    n -= 1;
  }
  return t === 0 && n === e.length ? e : e.slice(t, n);
}
function ur(e) {
  return e && String(e).trim().toLowerCase();
}
function Jx(e) {
  return Yx(e.replace(Gx, ""));
}
function As(e) {
  return e === !1 || e == null ? e : k.isArray(e) ? e.map(As) : Jx(String(e));
}
function Zx(e) {
  const t = Object.create(null),
    n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e);) t[r[1]] = r[2];
  return t;
}
const eg = e => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function rl(e, t, n, r, s) {
  if (k.isFunction(r)) return r.call(this, t, n);
  if (s && (t = n), !!k.isString(t)) {
    if (k.isString(r)) return t.indexOf(r) !== -1;
    if (k.isRegExp(r)) return r.test(t);
  }
}
function tg(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function ng(e, t) {
  const n = k.toCamelCase(" " + t);
  ["get", "set", "has"].forEach(r => {
    Object.defineProperty(e, r + n, {
      value: function (s, o, l) {
        return this[r].call(this, t, s, o, l);
      },
      configurable: !0
    });
  });
}
let Ie = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const s = this;
    function o(a, u, d) {
      const c = ur(u);
      if (!c) throw new Error("header name must be a non-empty string");
      const h = k.findKey(s, c);
      (!h || s[h] === void 0 || d === !0 || d === void 0 && s[h] !== !1) && (s[h || u] = As(a));
    }
    const l = (a, u) => k.forEach(a, (d, c) => o(d, c, u));
    if (k.isPlainObject(t) || t instanceof this.constructor) l(t, n);else if (k.isString(t) && (t = t.trim()) && !eg(t)) l(Xx(t), n);else if (k.isObject(t) && k.isIterable(t)) {
      let a = {},
        u,
        d;
      for (const c of t) {
        if (!k.isArray(c)) throw TypeError("Object iterator must return a key-value pair");
        a[d = c[0]] = (u = a[d]) ? k.isArray(u) ? [...u, c[1]] : [u, c[1]] : c[1];
      }
      l(a, n);
    } else t != null && o(n, t, r);
    return this;
  }
  get(t, n) {
    if (t = ur(t), t) {
      const r = k.findKey(this, t);
      if (r) {
        const s = this[r];
        if (!n) return s;
        if (n === !0) return Zx(s);
        if (k.isFunction(n)) return n.call(this, s, r);
        if (k.isRegExp(n)) return n.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = ur(t), t) {
      const r = k.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || rl(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let s = !1;
    function o(l) {
      if (l = ur(l), l) {
        const a = k.findKey(r, l);
        a && (!n || rl(r, r[a], a, n)) && (delete r[a], s = !0);
      }
    }
    return k.isArray(t) ? t.forEach(o) : o(t), s;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length,
      s = !1;
    for (; r--;) {
      const o = n[r];
      (!t || rl(this, this[o], o, t, !0)) && (delete this[o], s = !0);
    }
    return s;
  }
  normalize(t) {
    const n = this,
      r = {};
    return k.forEach(this, (s, o) => {
      const l = k.findKey(r, o);
      if (l) {
        n[l] = As(s), delete n[o];
        return;
      }
      const a = t ? tg(o) : String(o).trim();
      a !== o && delete n[o], n[a] = As(s), r[a] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = Object.create(null);
    return k.forEach(this, (r, s) => {
      r != null && r !== !1 && (n[s] = t && k.isArray(r) ? r.join(", ") : r);
    }), n;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([t, n]) => t + ": " + n).join(`
`);
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach(s => r.set(s)), r;
  }
  static accessor(t) {
    const r = (this[Mu] = this[Mu] = {
        accessors: {}
      }).accessors,
      s = this.prototype;
    function o(l) {
      const a = ur(l);
      r[a] || (ng(s, l), r[a] = !0);
    }
    return k.isArray(t) ? t.forEach(o) : o(t), this;
  }
};
Ie.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
k.reduceDescriptors(Ie.prototype, ({
  value: e
}, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    }
  };
});
k.freezeMethods(Ie);
function sl(e, t) {
  const n = this || Gr,
    r = t || n,
    s = Ie.from(r.headers);
  let o = r.data;
  return k.forEach(e, function (a) {
    o = a.call(n, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function zf(e) {
  return !!(e && e.__CANCEL__);
}
let Yr = class extends $ {
  constructor(t, n, r) {
    super(t ?? "canceled", $.ERR_CANCELED, n, r), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function Mf(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new $("Request failed with status code " + n.status, [$.ERR_BAD_REQUEST, $.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4], n.config, n.request, n));
}
function rg(e) {
  const t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
  return t && t[1] || "";
}
function sg(e, t) {
  e = e || 10;
  const n = new Array(e),
    r = new Array(e);
  let s = 0,
    o = 0,
    l;
  return t = t !== void 0 ? t : 1e3, function (u) {
    const d = Date.now(),
      c = r[o];
    l || (l = d), n[s] = u, r[s] = d;
    let h = o,
      x = 0;
    for (; h !== s;) x += n[h++], h = h % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), d - l < t) return;
    const v = c && d - c;
    return v ? Math.round(x * 1e3 / v) : void 0;
  };
}
function og(e, t) {
  let n = 0,
    r = 1e3 / t,
    s,
    o;
  const l = (d, c = Date.now()) => {
    n = c, s = null, o && (clearTimeout(o), o = null), e(...d);
  };
  return [(...d) => {
    const c = Date.now(),
      h = c - n;
    h >= r ? l(d, c) : (s = d, o || (o = setTimeout(() => {
      o = null, l(s);
    }, r - h)));
  }, () => s && l(s)];
}
const so = (e, t, n = 3) => {
    let r = 0;
    const s = sg(50, 250);
    return og(o => {
      const l = o.loaded,
        a = o.lengthComputable ? o.total : void 0,
        u = a != null ? Math.min(l, a) : l,
        d = Math.max(0, u - r),
        c = s(d);
      r = Math.max(r, u);
      const h = {
        loaded: u,
        total: a,
        progress: a ? u / a : void 0,
        bytes: d,
        rate: c || void 0,
        estimated: c && a ? (a - u) / c : void 0,
        event: o,
        lengthComputable: a != null,
        [t ? "download" : "upload"]: !0
      };
      e(h);
    }, n);
  },
  Iu = (e, t) => {
    const n = e != null;
    return [r => t[0]({
      lengthComputable: n,
      total: e,
      loaded: r
    }), t[1]];
  },
  Du = e => (...t) => k.asap(() => e(...t)),
  lg = Ne.hasStandardBrowserEnv ? ((e, t) => n => (n = new URL(n, Ne.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(new URL(Ne.origin), Ne.navigator && /(msie|trident)/i.test(Ne.navigator.userAgent)) : () => !0,
  ig = Ne.hasStandardBrowserEnv ? {
    write(e, t, n, r, s, o, l) {
      if (typeof document > "u") return;
      const a = [`${e}=${encodeURIComponent(t)}`];
      k.isNumber(n) && a.push(`expires=${new Date(n).toUTCString()}`), k.isString(r) && a.push(`path=${r}`), k.isString(s) && a.push(`domain=${s}`), o === !0 && a.push("secure"), k.isString(l) && a.push(`SameSite=${l}`), document.cookie = a.join("; ");
    },
    read(e) {
      if (typeof document > "u") return null;
      const t = document.cookie.match(new RegExp("(?:^|; )" + e + "=([^;]*)"));
      return t ? decodeURIComponent(t[1]) : null;
    },
    remove(e) {
      this.write(e, "", Date.now() - 864e5, "/");
    }
  } : {
    write() {},
    read() {
      return null;
    },
    remove() {}
  };
function ag(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function ug(e, t) {
  return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function If(e, t, n) {
  let r = !ag(t);
  return e && (r || n === !1) ? ug(e, t) : t;
}
const Fu = e => e instanceof Ie ? {
  ...e
} : e;
function xn(e, t) {
  t = t || {};
  const n = Object.create(null);
  Object.defineProperty(n, "hasOwnProperty", {
    value: Object.prototype.hasOwnProperty,
    enumerable: !1,
    writable: !0,
    configurable: !0
  });
  function r(d, c, h, x) {
    return k.isPlainObject(d) && k.isPlainObject(c) ? k.merge.call({
      caseless: x
    }, d, c) : k.isPlainObject(c) ? k.merge({}, c) : k.isArray(c) ? c.slice() : c;
  }
  function s(d, c, h, x) {
    if (k.isUndefined(c)) {
      if (!k.isUndefined(d)) return r(void 0, d, h, x);
    } else return r(d, c, h, x);
  }
  function o(d, c) {
    if (!k.isUndefined(c)) return r(void 0, c);
  }
  function l(d, c) {
    if (k.isUndefined(c)) {
      if (!k.isUndefined(d)) return r(void 0, d);
    } else return r(void 0, c);
  }
  function a(d, c, h) {
    if (k.hasOwnProp(t, h)) return r(d, c);
    if (k.hasOwnProp(e, h)) return r(void 0, d);
  }
  const u = {
    url: o,
    method: o,
    data: o,
    baseURL: l,
    transformRequest: l,
    transformResponse: l,
    paramsSerializer: l,
    timeout: l,
    timeoutMessage: l,
    withCredentials: l,
    withXSRFToken: l,
    adapter: l,
    responseType: l,
    xsrfCookieName: l,
    xsrfHeaderName: l,
    onUploadProgress: l,
    onDownloadProgress: l,
    decompress: l,
    maxContentLength: l,
    maxBodyLength: l,
    beforeRedirect: l,
    transport: l,
    httpAgent: l,
    httpsAgent: l,
    cancelToken: l,
    socketPath: l,
    allowedSocketPaths: l,
    responseEncoding: l,
    validateStatus: a,
    headers: (d, c, h) => s(Fu(d), Fu(c), h, !0)
  };
  return k.forEach(Object.keys({
    ...e,
    ...t
  }), function (c) {
    if (c === "__proto__" || c === "constructor" || c === "prototype") return;
    const h = k.hasOwnProp(u, c) ? u[c] : s,
      x = k.hasOwnProp(e, c) ? e[c] : void 0,
      v = k.hasOwnProp(t, c) ? t[c] : void 0,
      g = h(x, v, c);
    k.isUndefined(g) && h !== a || (n[c] = g);
  }), n;
}
const Df = e => {
    const t = xn({}, e),
      n = x => k.hasOwnProp(t, x) ? t[x] : void 0,
      r = n("data");
    let s = n("withXSRFToken");
    const o = n("xsrfHeaderName"),
      l = n("xsrfCookieName");
    let a = n("headers");
    const u = n("auth"),
      d = n("baseURL"),
      c = n("allowAbsoluteUrls"),
      h = n("url");
    if (t.headers = a = Ie.from(a), t.url = Pf(If(d, h, c), e.params, e.paramsSerializer), u && a.set("Authorization", "Basic " + btoa((u.username || "") + ":" + (u.password ? unescape(encodeURIComponent(u.password)) : ""))), k.isFormData(r)) {
      if (Ne.hasStandardBrowserEnv || Ne.hasStandardBrowserWebWorkerEnv) a.setContentType(void 0);else if (k.isFunction(r.getHeaders)) {
        const x = r.getHeaders(),
          v = ["content-type", "content-length"];
        Object.entries(x).forEach(([g, y]) => {
          v.includes(g.toLowerCase()) && a.set(g, y);
        });
      }
    }
    if (Ne.hasStandardBrowserEnv && (k.isFunction(s) && (s = s(t)), s === !0 || s == null && lg(t.url))) {
      const v = o && l && ig.read(l);
      v && a.set(o, v);
    }
    return t;
  },
  cg = typeof XMLHttpRequest < "u",
  dg = cg && function (e) {
    return new Promise(function (n, r) {
      const s = Df(e);
      let o = s.data;
      const l = Ie.from(s.headers).normalize();
      let {
          responseType: a,
          onUploadProgress: u,
          onDownloadProgress: d
        } = s,
        c,
        h,
        x,
        v,
        g;
      function y() {
        v && v(), g && g(), s.cancelToken && s.cancelToken.unsubscribe(c), s.signal && s.signal.removeEventListener("abort", c);
      }
      let S = new XMLHttpRequest();
      S.open(s.method.toUpperCase(), s.url, !0), S.timeout = s.timeout;
      function m() {
        if (!S) return;
        const f = Ie.from("getAllResponseHeaders" in S && S.getAllResponseHeaders()),
          j = {
            data: !a || a === "text" || a === "json" ? S.responseText : S.response,
            status: S.status,
            statusText: S.statusText,
            headers: f,
            config: e,
            request: S
          };
        Mf(function (_) {
          n(_), y();
        }, function (_) {
          r(_), y();
        }, j), S = null;
      }
      "onloadend" in S ? S.onloadend = m : S.onreadystatechange = function () {
        !S || S.readyState !== 4 || S.status === 0 && !(S.responseURL && S.responseURL.indexOf("file:") === 0) || setTimeout(m);
      }, S.onabort = function () {
        S && (r(new $("Request aborted", $.ECONNABORTED, e, S)), S = null);
      }, S.onerror = function (w) {
        const j = w && w.message ? w.message : "Network Error",
          A = new $(j, $.ERR_NETWORK, e, S);
        A.event = w || null, r(A), S = null;
      }, S.ontimeout = function () {
        let w = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
        const j = s.transitional || ha;
        s.timeoutErrorMessage && (w = s.timeoutErrorMessage), r(new $(w, j.clarifyTimeoutError ? $.ETIMEDOUT : $.ECONNABORTED, e, S)), S = null;
      }, o === void 0 && l.setContentType(null), "setRequestHeader" in S && k.forEach(l.toJSON(), function (w, j) {
        S.setRequestHeader(j, w);
      }), k.isUndefined(s.withCredentials) || (S.withCredentials = !!s.withCredentials), a && a !== "json" && (S.responseType = s.responseType), d && ([x, g] = so(d, !0), S.addEventListener("progress", x)), u && S.upload && ([h, v] = so(u), S.upload.addEventListener("progress", h), S.upload.addEventListener("loadend", v)), (s.cancelToken || s.signal) && (c = f => {
        S && (r(!f || f.type ? new Yr(null, e, S) : f), S.abort(), S = null);
      }, s.cancelToken && s.cancelToken.subscribe(c), s.signal && (s.signal.aborted ? c() : s.signal.addEventListener("abort", c)));
      const p = rg(s.url);
      if (p && Ne.protocols.indexOf(p) === -1) {
        r(new $("Unsupported protocol " + p + ":", $.ERR_BAD_REQUEST, e));
        return;
      }
      S.send(o || null);
    });
  },
  fg = (e, t) => {
    const {
      length: n
    } = e = e ? e.filter(Boolean) : [];
    if (t || n) {
      let r = new AbortController(),
        s;
      const o = function (d) {
        if (!s) {
          s = !0, a();
          const c = d instanceof Error ? d : this.reason;
          r.abort(c instanceof $ ? c : new Yr(c instanceof Error ? c.message : c));
        }
      };
      let l = t && setTimeout(() => {
        l = null, o(new $(`timeout of ${t}ms exceeded`, $.ETIMEDOUT));
      }, t);
      const a = () => {
        e && (l && clearTimeout(l), l = null, e.forEach(d => {
          d.unsubscribe ? d.unsubscribe(o) : d.removeEventListener("abort", o);
        }), e = null);
      };
      e.forEach(d => d.addEventListener("abort", o));
      const {
        signal: u
      } = r;
      return u.unsubscribe = () => k.asap(a), u;
    }
  },
  pg = function* (e, t) {
    let n = e.byteLength;
    if (n < t) {
      yield e;
      return;
    }
    let r = 0,
      s;
    for (; r < n;) s = r + t, yield e.slice(r, s), r = s;
  },
  hg = async function* (e, t) {
    for await (const n of mg(e)) yield* pg(n, t);
  },
  mg = async function* (e) {
    if (e[Symbol.asyncIterator]) {
      yield* e;
      return;
    }
    const t = e.getReader();
    try {
      for (;;) {
        const {
          done: n,
          value: r
        } = await t.read();
        if (n) break;
        yield r;
      }
    } finally {
      await t.cancel();
    }
  },
  $u = (e, t, n, r) => {
    const s = hg(e, t);
    let o = 0,
      l,
      a = u => {
        l || (l = !0, r && r(u));
      };
    return new ReadableStream({
      async pull(u) {
        try {
          const {
            done: d,
            value: c
          } = await s.next();
          if (d) {
            a(), u.close();
            return;
          }
          let h = c.byteLength;
          if (n) {
            let x = o += h;
            n(x);
          }
          u.enqueue(new Uint8Array(c));
        } catch (d) {
          throw a(d), d;
        }
      },
      cancel(u) {
        return a(u), s.return();
      }
    }, {
      highWaterMark: 2
    });
  },
  Uu = 64 * 1024,
  {
    isFunction: ms
  } = k,
  xg = (({
    Request: e,
    Response: t
  }) => ({
    Request: e,
    Response: t
  }))(k.global),
  {
    ReadableStream: Bu,
    TextEncoder: Hu
  } = k.global,
  Wu = (e, ...t) => {
    try {
      return !!e(...t);
    } catch {
      return !1;
    }
  },
  gg = e => {
    e = k.merge.call({
      skipUndefined: !0
    }, xg, e);
    const {
        fetch: t,
        Request: n,
        Response: r
      } = e,
      s = t ? ms(t) : typeof fetch == "function",
      o = ms(n),
      l = ms(r);
    if (!s) return !1;
    const a = s && ms(Bu),
      u = s && (typeof Hu == "function" ? (g => y => g.encode(y))(new Hu()) : async g => new Uint8Array(await new n(g).arrayBuffer())),
      d = o && a && Wu(() => {
        let g = !1;
        const y = new n(Ne.origin, {
            body: new Bu(),
            method: "POST",
            get duplex() {
              return g = !0, "half";
            }
          }),
          S = y.headers.has("Content-Type");
        return y.body != null && y.body.cancel(), g && !S;
      }),
      c = l && a && Wu(() => k.isReadableStream(new r("").body)),
      h = {
        stream: c && (g => g.body)
      };
    s && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach(g => {
      !h[g] && (h[g] = (y, S) => {
        let m = y && y[g];
        if (m) return m.call(y);
        throw new $(`Response type '${g}' is not supported`, $.ERR_NOT_SUPPORT, S);
      });
    });
    const x = async g => {
        if (g == null) return 0;
        if (k.isBlob(g)) return g.size;
        if (k.isSpecCompliantForm(g)) return (await new n(Ne.origin, {
          method: "POST",
          body: g
        }).arrayBuffer()).byteLength;
        if (k.isArrayBufferView(g) || k.isArrayBuffer(g)) return g.byteLength;
        if (k.isURLSearchParams(g) && (g = g + ""), k.isString(g)) return (await u(g)).byteLength;
      },
      v = async (g, y) => {
        const S = k.toFiniteNumber(g.getContentLength());
        return S ?? x(y);
      };
    return async g => {
      let {
          url: y,
          method: S,
          data: m,
          signal: p,
          cancelToken: f,
          timeout: w,
          onDownloadProgress: j,
          onUploadProgress: A,
          responseType: _,
          headers: P,
          withCredentials: U = "same-origin",
          fetchOptions: F
        } = Df(g),
        Q = t || fetch;
      _ = _ ? (_ + "").toLowerCase() : "text";
      let ce = fg([p, f && f.toAbortSignal()], w),
        G = null;
      const ne = ce && ce.unsubscribe && (() => {
        ce.unsubscribe();
      });
      let T;
      try {
        if (A && d && S !== "get" && S !== "head" && (T = await v(P, m)) !== 0) {
          let z = new n(y, {
              method: "POST",
              body: m,
              duplex: "half"
            }),
            B;
          if (k.isFormData(m) && (B = z.headers.get("content-type")) && P.setContentType(B), z.body) {
            const [D, q] = Iu(T, so(Du(A)));
            m = $u(z.body, Uu, D, q);
          }
        }
        k.isString(U) || (U = U ? "include" : "omit");
        const L = o && "credentials" in n.prototype;
        if (k.isFormData(m)) {
          const z = P.getContentType();
          z && /^multipart\/form-data/i.test(z) && !/boundary=/i.test(z) && P.delete("content-type");
        }
        const I = {
          ...F,
          signal: ce,
          method: S.toUpperCase(),
          headers: P.normalize().toJSON(),
          body: m,
          duplex: "half",
          credentials: L ? U : void 0
        };
        G = o && new n(y, I);
        let C = await (o ? Q(G, F) : Q(y, I));
        const b = c && (_ === "stream" || _ === "response");
        if (c && (j || b && ne)) {
          const z = {};
          ["status", "statusText", "headers"].forEach(J => {
            z[J] = C[J];
          });
          const B = k.toFiniteNumber(C.headers.get("content-length")),
            [D, q] = j && Iu(B, so(Du(j), !0)) || [];
          C = new r($u(C.body, Uu, D, () => {
            q && q(), ne && ne();
          }), z);
        }
        _ = _ || "text";
        let O = await h[k.findKey(h, _) || "text"](C, g);
        return !b && ne && ne(), await new Promise((z, B) => {
          Mf(z, B, {
            data: O,
            headers: Ie.from(C.headers),
            status: C.status,
            statusText: C.statusText,
            config: g,
            request: G
          });
        });
      } catch (L) {
        throw ne && ne(), L && L.name === "TypeError" && /Load failed|fetch/i.test(L.message) ? Object.assign(new $("Network Error", $.ERR_NETWORK, g, G, L && L.response), {
          cause: L.cause || L
        }) : $.from(L, L && L.code, g, G, L && L.response);
      }
    };
  },
  yg = new Map(),
  Ff = e => {
    let t = e && e.env || {};
    const {
        fetch: n,
        Request: r,
        Response: s
      } = t,
      o = [r, s, n];
    let l = o.length,
      a = l,
      u,
      d,
      c = yg;
    for (; a--;) u = o[a], d = c.get(u), d === void 0 && c.set(u, d = a ? new Map() : gg(t)), c = d;
    return d;
  };
Ff();
const xa = {
  http: Ox,
  xhr: dg,
  fetch: {
    get: Ff
  }
};
k.forEach(xa, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", {
        value: t
      });
    } catch {}
    Object.defineProperty(e, "adapterName", {
      value: t
    });
  }
});
const Vu = e => `- ${e}`,
  vg = e => k.isFunction(e) || e === null || e === !1;
function wg(e, t) {
  e = k.isArray(e) ? e : [e];
  const {
    length: n
  } = e;
  let r, s;
  const o = {};
  for (let l = 0; l < n; l++) {
    r = e[l];
    let a;
    if (s = r, !vg(r) && (s = xa[(a = String(r)).toLowerCase()], s === void 0)) throw new $(`Unknown adapter '${a}'`);
    if (s && (k.isFunction(s) || (s = s.get(t)))) break;
    o[a || "#" + l] = s;
  }
  if (!s) {
    const l = Object.entries(o).map(([u, d]) => `adapter ${u} ` + (d === !1 ? "is not supported by the environment" : "is not available in the build"));
    let a = n ? l.length > 1 ? `since :
` + l.map(Vu).join(`
`) : " " + Vu(l[0]) : "as no adapter specified";
    throw new $("There is no suitable adapter to dispatch the request " + a, "ERR_NOT_SUPPORT");
  }
  return s;
}
const $f = {
  getAdapter: wg,
  adapters: xa
};
function ol(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted) throw new Yr(null, e);
}
function Qu(e) {
  return ol(e), e.headers = Ie.from(e.headers), e.data = sl.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), $f.getAdapter(e.adapter || Gr.adapter, e)(e).then(function (r) {
    return ol(e), r.data = sl.call(e, e.transformResponse, r), r.headers = Ie.from(r.headers), r;
  }, function (r) {
    return zf(r) || (ol(e), r && r.response && (r.response.data = sl.call(e, e.transformResponse, r.response), r.response.headers = Ie.from(r.response.headers))), Promise.reject(r);
  });
}
const Uf = "1.15.2",
  Co = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  Co[e] = function (r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const qu = {};
Co.transitional = function (t, n, r) {
  function s(o, l) {
    return "[Axios v" + Uf + "] Transitional option '" + o + "'" + l + (r ? ". " + r : "");
  }
  return (o, l, a) => {
    if (t === !1) throw new $(s(l, " has been removed" + (n ? " in " + n : "")), $.ERR_DEPRECATED);
    return n && !qu[l] && (qu[l] = !0, console.warn(s(l, " has been deprecated since v" + n + " and will be removed in the near future"))), t ? t(o, l, a) : !0;
  };
};
Co.spelling = function (t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function kg(e, t, n) {
  if (typeof e != "object") throw new $("options must be an object", $.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let s = r.length;
  for (; s-- > 0;) {
    const o = r[s],
      l = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (l) {
      const a = e[o],
        u = a === void 0 || l(a, o, e);
      if (u !== !0) throw new $("option " + o + " must be " + u, $.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (n !== !0) throw new $("Unknown option " + o, $.ERR_BAD_OPTION);
  }
}
const Os = {
    assertOptions: kg,
    validators: Co
  },
  Ve = Os.validators;
let cn = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new zu(),
      response: new zu()
    };
  }
  async request(t, n) {
    try {
      return await this._request(t, n);
    } catch (r) {
      if (r instanceof Error) {
        let s = {};
        Error.captureStackTrace ? Error.captureStackTrace(s) : s = new Error();
        const o = (() => {
          if (!s.stack) return "";
          const l = s.stack.indexOf(`
`);
          return l === -1 ? "" : s.stack.slice(l + 1);
        })();
        try {
          if (!r.stack) r.stack = o;else if (o) {
            const l = o.indexOf(`
`),
              a = l === -1 ? -1 : o.indexOf(`
`, l + 1),
              u = a === -1 ? "" : o.slice(a + 1);
            String(r.stack).endsWith(u) || (r.stack += `
` + o);
          }
        } catch {}
      }
      throw r;
    }
  }
  _request(t, n) {
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = xn(this.defaults, n);
    const {
      transitional: r,
      paramsSerializer: s,
      headers: o
    } = n;
    r !== void 0 && Os.assertOptions(r, {
      silentJSONParsing: Ve.transitional(Ve.boolean),
      forcedJSONParsing: Ve.transitional(Ve.boolean),
      clarifyTimeoutError: Ve.transitional(Ve.boolean),
      legacyInterceptorReqResOrdering: Ve.transitional(Ve.boolean)
    }, !1), s != null && (k.isFunction(s) ? n.paramsSerializer = {
      serialize: s
    } : Os.assertOptions(s, {
      encode: Ve.function,
      serialize: Ve.function
    }, !0)), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), Os.assertOptions(n, {
      baseUrl: Ve.spelling("baseURL"),
      withXsrfToken: Ve.spelling("withXSRFToken")
    }, !0), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let l = o && k.merge(o.common, o[n.method]);
    o && k.forEach(["delete", "get", "head", "post", "put", "patch", "common"], g => {
      delete o[g];
    }), n.headers = Ie.concat(l, o);
    const a = [];
    let u = !0;
    this.interceptors.request.forEach(function (y) {
      if (typeof y.runWhen == "function" && y.runWhen(n) === !1) return;
      u = u && y.synchronous;
      const S = n.transitional || ha;
      S && S.legacyInterceptorReqResOrdering ? a.unshift(y.fulfilled, y.rejected) : a.push(y.fulfilled, y.rejected);
    });
    const d = [];
    this.interceptors.response.forEach(function (y) {
      d.push(y.fulfilled, y.rejected);
    });
    let c,
      h = 0,
      x;
    if (!u) {
      const g = [Qu.bind(this), void 0];
      for (g.unshift(...a), g.push(...d), x = g.length, c = Promise.resolve(n); h < x;) c = c.then(g[h++], g[h++]);
      return c;
    }
    x = a.length;
    let v = n;
    for (; h < x;) {
      const g = a[h++],
        y = a[h++];
      try {
        v = g(v);
      } catch (S) {
        y.call(this, S);
        break;
      }
    }
    try {
      c = Qu.call(this, v);
    } catch (g) {
      return Promise.reject(g);
    }
    for (h = 0, x = d.length; h < x;) c = c.then(d[h++], d[h++]);
    return c;
  }
  getUri(t) {
    t = xn(this.defaults, t);
    const n = If(t.baseURL, t.url, t.allowAbsoluteUrls);
    return Pf(n, t.params, t.paramsSerializer);
  }
};
k.forEach(["delete", "get", "head", "options"], function (t) {
  cn.prototype[t] = function (n, r) {
    return this.request(xn(r || {}, {
      method: t,
      url: n,
      data: (r || {}).data
    }));
  };
});
k.forEach(["post", "put", "patch"], function (t) {
  function n(r) {
    return function (o, l, a) {
      return this.request(xn(a || {}, {
        method: t,
        headers: r ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: o,
        data: l
      }));
    };
  }
  cn.prototype[t] = n(), cn.prototype[t + "Form"] = n(!0);
});
let Sg = class Bf {
  constructor(t) {
    if (typeof t != "function") throw new TypeError("executor must be a function.");
    let n;
    this.promise = new Promise(function (o) {
      n = o;
    });
    const r = this;
    this.promise.then(s => {
      if (!r._listeners) return;
      let o = r._listeners.length;
      for (; o-- > 0;) r._listeners[o](s);
      r._listeners = null;
    }), this.promise.then = s => {
      let o;
      const l = new Promise(a => {
        r.subscribe(a), o = a;
      }).then(s);
      return l.cancel = function () {
        r.unsubscribe(o);
      }, l;
    }, t(function (o, l, a) {
      r.reason || (r.reason = new Yr(o, l, a), n(r.reason));
    });
  }
  throwIfRequested() {
    if (this.reason) throw this.reason;
  }
  subscribe(t) {
    if (this.reason) {
      t(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(t) : this._listeners = [t];
  }
  unsubscribe(t) {
    if (!this._listeners) return;
    const n = this._listeners.indexOf(t);
    n !== -1 && this._listeners.splice(n, 1);
  }
  toAbortSignal() {
    const t = new AbortController(),
      n = r => {
        t.abort(r);
      };
    return this.subscribe(n), t.signal.unsubscribe = () => this.unsubscribe(n), t.signal;
  }
  static source() {
    let t;
    return {
      token: new Bf(function (s) {
        t = s;
      }),
      cancel: t
    };
  }
};
function bg(e) {
  return function (n) {
    return e.apply(null, n);
  };
}
function Ng(e) {
  return k.isObject(e) && e.isAxiosError === !0;
}
const pi = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(pi).forEach(([e, t]) => {
  pi[t] = e;
});
function Hf(e) {
  const t = new cn(e),
    n = Sf(cn.prototype.request, t);
  return k.extend(n, cn.prototype, t, {
    allOwnKeys: !0
  }), k.extend(n, t, null, {
    allOwnKeys: !0
  }), n.create = function (s) {
    return Hf(xn(e, s));
  }, n;
}
const fe = Hf(Gr);
fe.Axios = cn;
fe.CanceledError = Yr;
fe.CancelToken = Sg;
fe.isCancel = zf;
fe.VERSION = Uf;
fe.toFormData = jo;
fe.AxiosError = $;
fe.Cancel = fe.CanceledError;
fe.all = function (t) {
  return Promise.all(t);
};
fe.spread = bg;
fe.isAxiosError = Ng;
fe.mergeConfig = xn;
fe.AxiosHeaders = Ie;
fe.formToJSON = e => Lf(k.isHTMLForm(e) ? new FormData(e) : e);
fe.getAdapter = $f.getAdapter;
fe.HttpStatusCode = pi;
fe.default = fe;
const {
    Axios: ry,
    AxiosError: sy,
    CanceledError: oy,
    isCancel: ly,
    CancelToken: iy,
    VERSION: ay,
    all: uy,
    Cancel: cy,
    isAxiosError: dy,
    spread: fy,
    toFormData: py,
    AxiosHeaders: hy,
    HttpStatusCode: my,
    formToJSON: xy,
    getAdapter: gy,
    mergeConfig: yy
  } = fe,
  Eg = "http://localhost:5000",
  Ke = fe.create({
    baseURL: Eg
  }),
  Ku = [{
    id: "SUMMARY",
    icon: xt,
    label: "Summary",
    desc: "Get concise summaries",
    color: "#b45cff",
    glow: "shadow-purple-500/20",
    border: "border-purple-500/40",
    bg: "bg-purple-500/[0.05]"
  }, {
    id: "EXPLAIN",
    icon: lm,
    label: "Explain",
    desc: "Understand complex topics",
    color: "#22d3ee",
    glow: "shadow-cyan-500/20",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/[0.05]"
  }, {
    id: "SOURCES",
    icon: am,
    label: "Sources",
    desc: "Discover related sources",
    color: "#00f58a",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/[0.05]"
  }, {
    id: "POINTS",
    icon: gf,
    label: "Key Points",
    desc: "Extract key takeaways",
    color: "#ffd21f",
    glow: "shadow-yellow-500/20",
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/[0.05]"
  }, {
    id: "CARDS",
    icon: Ur,
    label: "Flashcards",
    desc: "Generate smart flashcards",
    color: "#ff5cdf",
    glow: "shadow-pink-500/20",
    border: "border-pink-500/40",
    bg: "bg-pink-500/[0.05]"
  }, {
    id: "VIVA",
    icon: qt,
    label: "Viva Mode",
    desc: "Test your understanding",
    color: "#a855ff",
    glow: "shadow-violet-500/20",
    border: "border-violet-500/40",
    bg: "bg-violet-500/[0.05]"
  }],
  ln = {
    title: "Current webpage",
    hostname: "ready for context",
    url: "manual-context",
    favicon: "icon.png",
    text: "FocusFlow AI helps convert browsing into research by extracting page context, summarizing ideas, explaining concepts, generating flashcards, preparing viva questions, and saving knowledge into workbooks."
  },
  ll = [{
    name: "Research Workbook",
    meta: "Default research space",
    color: "from-blue-500 to-violet-600"
  }],
  _o = (e = "") => e.replace(/\s+/g, " ").trim(),
  jg = (e = "") => _o(e).split(new RegExp("(?<=[.!?])\\s+")).filter(Boolean),
  Cg = (e = "") => Math.max(1, Math.ceil(_o(e).split(/\s+/).filter(Boolean).length / 220));
function _g(e, t = "current page") {
  try {
    return new URL(e).hostname.replace(/^www\./, "");
  } catch {
    return t;
  }
}
function Tg(e = "", t = "") {
  const n = `${t} ${e}`.toLowerCase(),
    s = [["AI", ["ai", "artificial intelligence", "model", "machine learning", "neural"]], ["Architecture", ["architecture", "system", "framework", "structure"]], ["Research", ["research", "study", "paper", "analysis", "survey"]], ["Learning", ["learn", "student", "education", "revision", "concept"]], ["Ethics", ["ethic", "alignment", "safety", "responsible", "risk"]], ["Technology", ["software", "browser", "extension", "web", "engineering"]]].filter(([, o]) => o.some(l => n.includes(l))).map(([o]) => o);
  return [...new Set(s), "Context", "Knowledge"].slice(0, 4);
}
function Wf(e) {
  return e.topics.slice(0, 6).map((t, n) => ({
    q: n % 2 === 0 ? `What is ${t}?` : `Why is ${t} important?`,
    a: e.keyPoints[n] || `${t} is one of the main ideas detected in this page context.`
  }));
}
function Vf(e) {
  return [{
    q: `What is the main idea of ${e.title}?`,
    a: e.summary
  }, {
    q: "Which topic is most important here?",
    a: e.topics[0] || "The extracted page context."
  }, {
    q: "What practical insight can you take from this page?",
    a: e.insight
  }, {
    q: "What would you research next?",
    a: `Follow the connected ideas around ${e.topics.slice(0, 2).join(" and ")}.`
  }];
}
function il(e, t = null) {
  var d, c;
  const n = _o((e == null ? void 0 : e.text) || (e == null ? void 0 : e.content) || (e == null ? void 0 : e.summary) || ln.text),
    r = (e == null ? void 0 : e.title) || ln.title,
    s = (e == null ? void 0 : e.url) || ln.url,
    o = jg(n),
    l = ((d = t == null ? void 0 : t.topics) != null && d.length ? t.topics : Tg(n, r)).slice(0, 5),
    a = ((c = t == null ? void 0 : t.keyPoints) != null && c.length ? t.keyPoints : o.slice(0, 5)).map(h => String(h).replace(/^[-*]\s*/, "").slice(0, 180)),
    u = (t == null ? void 0 : t.summary) || o.slice(0, 2).join(" ") || "This page is ready for focused AI research.";
  return {
    title: r,
    url: s,
    hostname: (e == null ? void 0 : e.hostname) || _g(s, ln.hostname),
    favicon: (e == null ? void 0 : e.favicon) || (e == null ? void 0 : e.favIconUrl) || "icon.png",
    text: n,
    topics: l,
    keyPoints: a.length ? a : [u],
    summary: u,
    insight: a[0] || `${r} connects ${l.slice(0, 2).join(" and ").toLowerCase()} into a research thread.`,
    readingTime: (e == null ? void 0 : e.readingTime) || Cg(n),
    contentType: (t == null ? void 0 : t.contentType) || "webpage",
    complexity: (t == null ? void 0 : t.complexity) || "intermediate"
  };
}
function Qf(e) {
  return e.topics.slice(0, 4).map(t => ({
    title: `${t} research path`,
    desc: `Explore supporting references connected to ${t.toLowerCase()} and this page.`,
    url: `https://www.google.com/search?q=${encodeURIComponent(`${t} ${e.title}`)}`
  }));
}
function Rg() {
  const {
      actions: e,
      researchSession: t,
      currentTab: n,
      selectedText: r
    } = Hm(),
    [s, o] = E.useState("HOME"),
    [l, a] = E.useState("IDLE"),
    [u, d] = E.useState(null),
    [c, h] = E.useState(!1),
    [x, v] = E.useState(""),
    [g, y] = E.useState([]),
    [S, m] = E.useState(ll[0].name),
    [p, f] = E.useState(ll),
    [w, j] = E.useState(["Summary"]),
    [A, _] = E.useState(["AI", "Research"]),
    [P, U] = E.useState(!1),
    [F, Q] = E.useState(!1),
    [ce, G] = E.useState(""),
    ne = E.useMemo(() => {
      const D = (t == null ? void 0 : t.pages) || (t == null ? void 0 : t.extractedPages) || [];
      return u || D[D.length - 1] || n || ln;
    }, [t, n, u]),
    T = u || il(ne),
    L = Ku.find(D => D.id === s),
    I = l === "COMPLETED" || !!u;
  E.useEffect(() => {
    let D = !1;
    return (async () => {
      try {
        const J = await Ke.get("/api/research/workbooks"),
          ee = Array.isArray(J.data) && J.data.length ? J.data : ll.map(Re => Re.name);
        if (D) return;
        const Z = ee.map((Re, gt) => ({
          name: Re,
          meta: gt === 0 ? "Primary research space" : "Saved workbook",
          color: ["from-blue-500 to-violet-600", "from-emerald-400 to-teal-600", "from-orange-400 to-amber-600", "from-cyan-400 to-blue-700"][gt % 4]
        }));
        f(Z), m(Re => Z.some(gt => gt.name === Re) ? Re : Z[0].name);
      } catch (J) {
        console.warn("Workbook list unavailable, using local defaults", J == null ? void 0 : J.message);
      }
    })(), () => {
      D = !0;
    };
  }, []);
  const C = async D => {
      try {
        return (await Ke.post("/api/ai/deep-analysis", {
          text: D.text || D.content || "",
          title: D.title,
          url: D.url,
          wordCount: _o(D.text || D.content || "").split(/\s+/).length
        })).data;
      } catch (q) {
        return console.warn("Deep analysis unavailable, using local analysis", q == null ? void 0 : q.message), null;
      }
    },
    b = async () => {
      var D, q, J;
      a("EXTRACTING"), G("");
      try {
        let ee = null;
        const Z = await (((D = e.extractContent) == null ? void 0 : D.call(e)) || ((q = e.sendMessage) == null ? void 0 : q.call(e, {
          type: "EXTRACT_CONTENT_REQUEST"
        })));
        Z != null && Z.success && Z.content && (ee = Z.content, await ((J = e.sendMessage) == null ? void 0 : J.call(e, {
          type: "SAVE_TO_SESSION",
          content: ee
        })));
        const Re = ee || ne || ln,
          gt = Re.text || Re.content ? await C(Re) : null;
        d(il(Re, gt)), a("COMPLETED");
      } catch (ee) {
        console.error("Extraction failed:", ee), d(il(ne || ln)), a("COMPLETED");
      }
    },
    O = (D = "page") => {
      var q, J;
      return {
        topic: T.title,
        link: T.url,
        workbook: S,
        summary: T.summary,
        notes: `${T.insight}

Topics: ${T.topics.join(", ")}`,
        outputs: {
          summary: T.summary,
          answer: ((q = g[g.length - 1]) == null ? void 0 : q.a) || "",
          question: ((J = g[g.length - 1]) == null ? void 0 : J.q) || "",
          selectedText: T.text.slice(0, 4e3),
          studyNotes: T.keyPoints.join(`
`),
          relatedSources: Qf(T).map((ee, Z) => ({
            id: Z + 1,
            text: ee.desc,
            title: ee.title,
            url: ee.url
          })),
          flashcards: Wf(T),
          viva: Vf(T),
          saveType: D,
          saveOptions: w,
          tags: A
        }
      };
    },
    z = async (D = "page") => {
      U(!0), G("");
      try {
        await Ke.post("/api/research", O(D)), f(q => q.some(J => J.name === S) ? q : [{
          name: S,
          meta: "Saved workbook",
          color: "from-blue-500 to-violet-600"
        }, ...q]), G(D === "session" ? "Session saved to Research Hub" : "Page saved to Research Hub");
      } catch (q) {
        console.error("Save failed:", q), G("Start the backend server, then save again.");
      } finally {
        U(!1);
      }
    },
    B = async () => {
      var q;
      const D = x.trim();
      if (!(!D || F)) {
        v(""), Q(!0), y(J => [...J.slice(-3), {
          q: D,
          a: "Thinking..."
        }]);
        try {
          const ee = ((q = (await Ke.post("/api/ai/ask", {
            context: T.text,
            question: D
          })).data) == null ? void 0 : q.answer) || T.insight;
          y(Z => [...Z.slice(0, -1), {
            q: D,
            a: ee
          }]);
        } catch {
          y(ee => [...ee.slice(0, -1), {
            q: D,
            a: I ? T.insight : "Extract the page first and I can answer with full context."
          }]);
        } finally {
          Q(!1);
        }
      }
    };
  return i.jsxs("div", {
    className: "relative flex h-full w-full flex-col overflow-hidden bg-[#020614] text-white font-sans selection:bg-blue-500/30",
    children: [i.jsx("div", {
      className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(70,91,255,0.20),transparent_35%),radial-gradient(circle_at_90%_35%,rgba(143,68,255,0.10),transparent_34%)]"
    }), i.jsxs("header", {
      className: "relative z-20 flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.08] px-5",
      children: [s === "HOME" ? i.jsxs("div", {
        className: "min-w-0",
        children: [i.jsxs("div", {
          className: "flex items-center gap-3",
          children: [i.jsx("img", {
            src: "icon.png",
            alt: "",
            className: "h-9 w-9 rounded-xl object-contain"
          }), i.jsxs("h1", {
            className: "text-[15px] font-black tracking-tight",
            children: ["FocusFlow ", i.jsx("span", {
              className: "text-blue-400",
              children: "AI"
            })]
          })]
        }), i.jsxs("div", {
          className: "mt-1 flex items-center gap-2 pl-0.5",
          children: [i.jsx("span", {
            className: "h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"
          }), i.jsx("span", {
            className: "text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400",
            children: "Ready"
          })]
        })]
      }) : i.jsxs("button", {
        onClick: () => o("HOME"),
        className: "group flex items-center gap-3 text-left",
        children: [i.jsx("span", {
          className: "flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 transition group-hover:border-white/20 group-hover:text-white",
          children: i.jsx(T0, {
            size: 18
          })
        }), i.jsx("span", {
          className: "text-[13px] font-black",
          style: {
            color: L == null ? void 0 : L.color
          },
          children: L == null ? void 0 : L.label
        })]
      }), i.jsxs("div", {
        className: "flex items-center gap-2 text-gray-400",
        children: [i.jsx("button", {
          className: "flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:text-white",
          children: i.jsx(hm, {
            size: 15
          })
        }), i.jsx("button", {
          className: "flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:text-white",
          children: i.jsx(wf, {
            size: 16
          })
        })]
      })]
    }), i.jsx("main", {
      className: "relative z-10 flex-1 overflow-y-auto px-5 pb-32 pt-4 no-scrollbar",
      children: s === "HOME" ? i.jsxs("div", {
        className: "space-y-4",
        children: [i.jsx(Ag, {
          analysis: T,
          onRefresh: b
        }), i.jsx(Og, {
          state: l,
          analysis: T,
          onExtract: b
        }), i.jsx("div", {
          className: "grid grid-cols-2 gap-3",
          children: Ku.map(D => i.jsx(Pg, {
            tool: D,
            onClick: () => o(D.id)
          }, D.id))
        }), g.map((D, q) => i.jsx(Ig, {
          line: D
        }, q))]
      }) : i.jsx(Lg, {
        mode: s,
        analysis: T,
        selectedText: r
      })
    }), i.jsxs("footer", {
      className: "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#020614] via-[#020614]/95 to-transparent px-4 pb-4 pt-12",
      children: [c && i.jsx($g, {
        workbook: S,
        setWorkbook: m,
        workbookOptions: p,
        selectedSaveTypes: w,
        setSelectedSaveTypes: j,
        selectedTags: A,
        setSelectedTags: _,
        isSaving: P,
        saveMessage: ce,
        onClose: () => h(!1),
        onSave: () => z("workbook")
      }), i.jsxs("div", {
        className: "flex h-[68px] items-center gap-2 rounded-2xl border border-white/10 bg-[#080d1d]/90 p-2 shadow-2xl backdrop-blur-2xl",
        children: [i.jsxs("button", {
          onClick: () => h(D => !D),
          className: `flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border text-[8px] font-black uppercase transition ${c ? "border-blue-400 bg-blue-600 text-white" : "border-blue-500/20 bg-blue-500/[0.08] text-blue-300 hover:text-white"}`,
          children: [i.jsx(oi, {
            size: 15
          }), "Save"]
        }), i.jsxs("button", {
          className: "flex h-12 shrink-0 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-gray-300",
          children: [i.jsx(Xn, {
            size: 15
          }), "Prompts ", i.jsx(aa, {
            size: 13
          })]
        }), i.jsx("input", {
          value: x,
          onChange: D => v(D.target.value),
          onKeyDown: D => D.key === "Enter" && B(),
          placeholder: "Ask anything...",
          className: "min-w-0 flex-1 bg-transparent px-2 text-[13px] font-medium text-white outline-none placeholder:text-gray-600"
        }), i.jsx("button", {
          className: "p-2 text-gray-500 hover:text-blue-300",
          children: i.jsx(fm, {
            size: 18
          })
        }), i.jsx("button", {
          onClick: B,
          disabled: F,
          className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 disabled:opacity-60",
          children: F ? i.jsx(ca, {
            size: 18,
            className: "animate-spin"
          }) : i.jsx(yf, {
            size: 19
          })
        })]
      }), i.jsxs("div", {
        className: "mt-3 flex items-center justify-center gap-6 text-[8px] font-black uppercase tracking-[0.18em] text-gray-600",
        children: [i.jsx("span", {
          children: "End-to-end encrypted"
        }), i.jsxs("span", {
          className: "flex items-center gap-2",
          children: [i.jsx("span", {
            className: "h-1.5 w-1.5 rounded-full bg-emerald-400"
          }), "Real-time context"]
        })]
      })]
    })]
  });
}
function Ag({
  analysis: e,
  onRefresh: t
}) {
  return i.jsxs("section", {
    className: "flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5 backdrop-blur-xl",
    children: [i.jsx("div", {
      className: "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.05]",
      children: i.jsx("img", {
        src: e.favicon || "icon.png",
        alt: "",
        className: "h-5 w-5 object-contain"
      })
    }), i.jsxs("div", {
      className: "min-w-0 flex-1",
      children: [i.jsx("h2", {
        className: "truncate text-[13px] font-black text-white",
        children: e.title
      }), i.jsx("p", {
        className: "mt-0.5 truncate text-[11px] font-medium text-gray-500",
        children: e.hostname
      })]
    }), i.jsx("button", {
      onClick: t,
      className: "rounded-lg p-2 text-gray-500 transition hover:bg-white/[0.05] hover:text-white",
      title: "Refresh context",
      children: i.jsx(ua, {
        size: 17
      })
    })]
  });
}
function Og({
  state: e,
  analysis: t,
  onExtract: n
}) {
  const r = e === "COMPLETED",
    s = e === "EXTRACTING";
  return i.jsxs("section", {
    className: "relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#050a1a]/80 p-6 text-center shadow-2xl backdrop-blur-xl",
    children: [i.jsx("div", {
      className: "pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent"
    }), i.jsx("div", {
      className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 shadow-[0_0_45px_rgba(68,100,255,0.35)]",
      children: s ? i.jsx(ca, {
        className: "h-8 w-8 animate-spin"
      }) : r ? i.jsx(hf, {
        className: "h-8 w-8 text-emerald-300"
      }) : i.jsx(kt, {
        className: "h-8 w-8"
      })
    }), r ? i.jsxs("div", {
      children: [i.jsx("p", {
        className: "mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300",
        children: "Extraction Complete"
      }), i.jsx("h2", {
        className: "mx-auto mb-3 max-w-[360px] text-[14px] font-black leading-snug text-white",
        children: t.insight
      }), i.jsx("div", {
        className: "mb-4 flex flex-wrap justify-center gap-2",
        children: t.topics.map(o => i.jsx("span", {
          className: "rounded-full border border-blue-400/15 bg-blue-500/[0.06] px-3 py-1 text-[10px] font-bold text-gray-300",
          children: o
        }, o))
      }), i.jsx("p", {
        className: "mx-auto mb-4 line-clamp-2 max-w-[370px] text-[12px] leading-relaxed text-gray-400",
        children: t.summary
      }), i.jsxs("div", {
        className: "inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-gray-500",
        children: [i.jsx(br, {
          size: 12
        }), " ", t.readingTime, " min read"]
      })]
    }) : i.jsxs("div", {
      children: [i.jsx("h2", {
        className: "mb-2 text-[17px] font-black text-white",
        children: "Ready to analyze this page"
      }), i.jsx("p", {
        className: "mx-auto mb-5 max-w-[300px] text-[12px] leading-relaxed text-gray-400",
        children: "Extract key insights, summarize content, and uncover what matters."
      }), i.jsxs("button", {
        onClick: n,
        disabled: s,
        className: "inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-7 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-blue-600/30 transition active:scale-95 disabled:opacity-70",
        children: [s ? "Extracting" : "Extract Content", i.jsx(Xn, {
          size: 14
        })]
      })]
    })]
  });
}
function Pg({
  tool: e,
  onClick: t
}) {
  return i.jsx("button", {
    onClick: t,
    className: `group relative min-h-[118px] overflow-hidden rounded-2xl border ${e.border} ${e.bg} p-4 text-left shadow-xl ${e.glow} transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.055]`,
    children: i.jsxs("div", {
      className: "flex h-full items-center gap-4",
      children: [i.jsx("div", {
        className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/20",
        style: {
          color: e.color
        },
        children: i.jsx(e.icon, {
          size: 28
        })
      }), i.jsxs("div", {
        className: "min-w-0",
        children: [i.jsx("p", {
          className: "text-[13px] font-black uppercase tracking-[0.09em] text-white",
          children: e.label
        }), i.jsx("p", {
          className: "mt-2 text-[12px] leading-snug text-gray-400",
          children: e.desc
        }), i.jsx("div", {
          className: "mt-3 h-0.5 w-9 rounded-full",
          style: {
            background: e.color
          }
        })]
      })]
    })
  });
}
function Lg({
  mode: e,
  analysis: t,
  selectedText: n
}) {
  return e === "SUMMARY" ? i.jsxs(kn, {
    title: "AI Summary",
    color: "#b45cff",
    children: [i.jsx("p", {
      children: t.summary
    }), i.jsx("ul", {
      className: "space-y-2",
      children: t.keyPoints.slice(0, 3).map(r => i.jsx(Xu, {
        color: "#b45cff",
        children: r
      }, r))
    })]
  }) : e === "EXPLAIN" ? i.jsxs(kn, {
    title: "Explanation",
    color: "#22d3ee",
    children: [i.jsx("p", {
      children: n ? `Selected text: ${n}` : "Highlight text on the webpage, then return here for a contextual explanation."
    }), i.jsx("p", {
      children: n ? `In simple terms, this connects to ${t.topics.slice(0, 2).join(" and ").toLowerCase()}. ${t.insight}` : t.insight
    })]
  }) : e === "SOURCES" ? i.jsx(kn, {
    title: "Related Sources",
    color: "#00f58a",
    children: Qf(t).map(r => i.jsx(zg, {
      source: r
    }, r.url))
  }) : e === "POINTS" ? i.jsx(kn, {
    title: "Key Points",
    color: "#ffd21f",
    children: i.jsx("ul", {
      className: "space-y-3",
      children: t.keyPoints.map(r => i.jsx(Xu, {
        color: "#ffd21f",
        children: r
      }, r))
    })
  }) : e === "CARDS" ? i.jsxs(kn, {
    title: "Flashcards",
    color: "#ff5cdf",
    children: [i.jsx("div", {
      className: "grid grid-cols-2 gap-3",
      children: Wf(t).slice(0, 4).map(r => i.jsx(Mg, {
        card: r
      }, r.q))
    }), i.jsxs("div", {
      className: "mt-3 flex justify-center gap-1.5",
      children: [i.jsx("span", {
        className: "h-1.5 w-5 rounded-full bg-violet-400"
      }), i.jsx("span", {
        className: "h-1.5 w-1.5 rounded-full bg-white/20"
      }), i.jsx("span", {
        className: "h-1.5 w-1.5 rounded-full bg-white/20"
      })]
    })]
  }) : i.jsx(kn, {
    title: "Viva Questions",
    color: "#a855ff",
    children: i.jsx("div", {
      className: "space-y-3",
      children: Vf(t).map((r, s) => i.jsxs("div", {
        className: "text-[12px] leading-relaxed",
        children: [i.jsxs("p", {
          className: "font-bold text-white",
          children: ["Q", s + 1, ". ", r.q]
        }), i.jsxs("p", {
          className: "mt-1 text-gray-400",
          children: ["A. ", r.a]
        })]
      }, r.q))
    })
  });
}
function kn({
  title: e,
  color: t,
  children: n
}) {
  return i.jsxs("section", {
    className: "rounded-2xl border border-white/[0.10] bg-[#060b19]/85 text-[13px] leading-relaxed text-gray-300 shadow-2xl backdrop-blur-xl",
    children: [i.jsxs("div", {
      className: "flex items-center justify-between border-b border-white/[0.06] px-4 py-3",
      children: [i.jsx("h2", {
        className: "text-[11px] font-black uppercase tracking-[0.16em]",
        style: {
          color: t
        },
        children: e
      }), i.jsx(mf, {
        size: 16,
        className: "text-gray-500"
      })]
    }), i.jsx("div", {
      className: "space-y-4 p-4",
      children: n
    })]
  });
}
function Xu({
  color: e,
  children: t
}) {
  return i.jsxs("li", {
    className: "flex gap-3 text-[12px] leading-relaxed text-gray-300",
    children: [i.jsx("span", {
      className: "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
      style: {
        background: e
      }
    }), t]
  });
}
function zg({
  source: e
}) {
  return i.jsxs("a", {
    href: e.url,
    target: "_blank",
    rel: "noreferrer",
    className: "flex gap-3 rounded-xl border border-white/[0.05] bg-white/[0.03] p-3 transition hover:bg-white/[0.06]",
    children: [i.jsx("span", {
      className: "mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300"
    }), i.jsxs("span", {
      className: "min-w-0 flex-1",
      children: [i.jsx("span", {
        className: "block text-[12px] font-bold text-white",
        children: e.title
      }), i.jsx("span", {
        className: "mt-1 block truncate text-[11px] text-blue-400",
        children: e.url
      })]
    }), i.jsx(ua, {
      size: 14,
      className: "text-gray-500"
    })]
  });
}
function Mg({
  card: e
}) {
  return i.jsxs("div", {
    className: "min-h-[118px] rounded-xl border border-pink-400/25 bg-pink-500/[0.04] p-3",
    children: [i.jsx("h3", {
      className: "mb-2 text-[11px] font-black text-white",
      children: e.q
    }), i.jsx("p", {
      className: "line-clamp-4 text-[10px] leading-relaxed text-gray-400",
      children: e.a
    })]
  });
}
function Ig({
  line: e
}) {
  return i.jsxs("div", {
    className: "rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-[12px] leading-relaxed text-gray-300",
    children: [i.jsx("p", {
      className: "mb-2 font-bold text-white",
      children: e.q
    }), i.jsx("p", {
      children: e.a
    })]
  });
}
const Dg = [{
    id: "Summary",
    icon: xt
  }, {
    id: "Key Points",
    icon: gf
  }, {
    id: "Full Content",
    icon: xt
  }, {
    id: "Flashcards",
    icon: Ur
  }, {
    id: "Viva Notes",
    icon: qt
  }],
  Fg = ["AI", "Research", "ML", "Study"];
function $g({
  workbook: e,
  setWorkbook: t,
  workbookOptions: n,
  selectedSaveTypes: r,
  setSelectedSaveTypes: s,
  selectedTags: o,
  setSelectedTags: l,
  isSaving: a,
  saveMessage: u,
  onClose: d,
  onSave: c
}) {
  const [h, x] = E.useState(!1),
    [v, g] = E.useState(""),
    y = n.some(f => f.name === e) ? n : [{
      name: e,
      meta: "New workbook",
      color: "from-blue-500 to-violet-600"
    }, ...n],
    S = f => {
      s(w => w.includes(f) ? w.filter(j => j !== f) : [...w, f]);
    },
    m = f => {
      l(w => w.includes(f) ? w.filter(j => j !== f) : [...w, f]);
    },
    p = () => {
      const f = v.trim();
      f && (t(f), g(""), x(!1));
    };
  return i.jsxs("div", {
    className: "mb-3 rounded-2xl border border-white/10 bg-[#080d1d]/95 p-4 shadow-2xl backdrop-blur-2xl",
    children: [i.jsxs("div", {
      className: "mb-4 flex items-start justify-between",
      children: [i.jsxs("div", {
        className: "flex items-start gap-3",
        children: [i.jsx("div", {
          className: "flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/[0.12] text-violet-300",
          children: i.jsx(oi, {
            size: 18
          })
        }), i.jsxs("div", {
          children: [i.jsx("h3", {
            className: "text-[13px] font-black text-white",
            children: "Save to Research Hub"
          }), i.jsx("p", {
            className: "mt-0.5 text-[11px] text-gray-500",
            children: "Organize and revisit your knowledge"
          })]
        })]
      }), i.jsx("button", {
        onClick: d,
        className: "rounded-lg p-1 text-gray-500 transition hover:bg-white/[0.05] hover:text-white",
        children: i.jsx(wf, {
          size: 16
        })
      })]
    }), i.jsxs("div", {
      className: "grid grid-cols-[1fr_0.95fr] gap-5",
      children: [i.jsxs("div", {
        children: [i.jsx("p", {
          className: "mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-gray-500",
          children: "Select Workbook"
        }), i.jsxs("div", {
          className: "space-y-2",
          children: [y.map(f => {
            const w = e === f.name;
            return i.jsxs("button", {
              onClick: () => t(f.name),
              className: `flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${w ? "border-blue-500 bg-blue-500/[0.10]" : "border-white/[0.07] bg-white/[0.035] hover:border-white/[0.14]"}`,
              children: [i.jsx("span", {
                className: `h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br ${f.color} shadow-lg`
              }), i.jsxs("span", {
                className: "min-w-0 flex-1",
                children: [i.jsx("span", {
                  className: "block truncate text-[12px] font-black text-white",
                  children: f.name
                }), i.jsx("span", {
                  className: "mt-0.5 block truncate text-[10px] font-medium text-gray-500",
                  children: f.meta
                })]
              }), i.jsx(fa, {
                size: 15,
                className: w ? "text-blue-300" : "text-gray-500"
              })]
            }, f.name);
          }), h ? i.jsxs("div", {
            className: "rounded-xl border border-dashed border-violet-500/70 bg-violet-500/[0.04] p-2",
            children: [i.jsx("input", {
              value: v,
              onChange: f => g(f.target.value),
              onKeyDown: f => f.key === "Enter" && p(),
              autoFocus: !0,
              placeholder: "Workbook name",
              className: "mb-2 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-[11px] font-bold text-white outline-none placeholder:text-gray-600 focus:border-violet-400/50"
            }), i.jsxs("div", {
              className: "flex gap-2",
              children: [i.jsx("button", {
                onClick: p,
                className: "flex-1 rounded-lg bg-violet-500 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white",
                children: "Use"
              }), i.jsx("button", {
                onClick: () => {
                  g(""), x(!1);
                },
                className: "rounded-lg border border-white/[0.08] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gray-400",
                children: "Cancel"
              })]
            })]
          }) : i.jsxs("button", {
            onClick: () => x(!0),
            className: "flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-violet-500/70 bg-violet-500/[0.04] px-3 py-3 text-[11px] font-black text-violet-300 transition hover:bg-violet-500/[0.10]",
            children: [i.jsx(ro, {
              size: 16
            }), " Create New Workbook"]
          })]
        })]
      }), i.jsxs("div", {
        children: [i.jsx("p", {
          className: "mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-gray-500",
          children: "What to Save"
        }), i.jsx("div", {
          className: "grid grid-cols-2 gap-2",
          children: Dg.map(({
            id: f,
            icon: w
          }) => {
            const j = r.includes(f);
            return i.jsxs("button", {
              onClick: () => S(f),
              className: `flex items-center gap-2 rounded-xl border px-3 py-3 text-[11px] font-bold transition ${j ? "border-blue-500 bg-blue-500/[0.10] text-white" : "border-white/[0.07] bg-white/[0.04] text-gray-300 hover:border-white/[0.14]"}`,
              children: [i.jsx(w, {
                size: 15,
                className: j ? "text-blue-300" : "text-gray-500"
              }), " ", f]
            }, f);
          })
        }), i.jsx("p", {
          className: "mb-2 mt-6 text-[9px] font-black uppercase tracking-[0.16em] text-gray-500",
          children: "Add Tags (Optional)"
        }), i.jsxs("div", {
          className: "mb-6 flex flex-wrap gap-2",
          children: [Fg.map(f => {
            const w = o.includes(f);
            return i.jsx("button", {
              onClick: () => m(f),
              className: `rounded-full px-3 py-1.5 text-[10px] font-bold transition ${w ? "bg-blue-500/20 text-blue-200" : "bg-white/[0.06] text-gray-400 hover:text-white"}`,
              children: f
            }, f);
          }), i.jsx("button", {
            className: "flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-gray-400 hover:text-white",
            children: i.jsx(ro, {
              size: 13
            })
          })]
        }), i.jsxs("button", {
          onClick: c,
          disabled: a || r.length === 0,
          className: "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-3.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-60",
          children: [a ? i.jsx(ca, {
            size: 15,
            className: "animate-spin"
          }) : i.jsx(oi, {
            size: 15
          }), " Save to Workbook"]
        })]
      })]
    }), i.jsx("div", {
      className: "mt-4 border-t border-white/[0.06] pt-4 text-center text-[11px] font-medium text-gray-500",
      children: "Your data is private and secure"
    }), u && i.jsx("p", {
      className: "mt-2 text-center text-[10px] font-bold text-emerald-300",
      children: u
    })]
  });
}
const Gu = ["bg-emerald-500/20 text-emerald-400", "bg-blue-500/20 text-blue-400", "bg-violet-500/20 text-violet-400", "bg-orange-500/20 text-orange-400"],
  Yu = ["text-emerald-400", "text-blue-400", "text-violet-400", "text-orange-400"],
  Ug = (e, t = 0) => String(e || "").startsWith("bg-") ? e : Gu[t % Gu.length],
  Bg = (e, t = 0) => String(e || "").startsWith("text-") ? e : Yu[t % Yu.length];
function Hg({
  title: e = "AI Research",
  initialPrompt: t = "",
  onBack: n
}) {
  var Re, gt, ga;
  const [r, s] = E.useState(!1),
    [o, l] = E.useState(""),
    [a, u] = E.useState([]),
    [d, c] = E.useState(!1),
    [h, x] = E.useState({
      keyInsights: [],
      topEntities: []
    }),
    [v, g] = E.useState(!0),
    [y, S] = E.useState([]),
    [m, p] = E.useState("overview"),
    [f, w] = E.useState(null),
    [j, A] = E.useState(""),
    [_, P] = E.useState("insights"),
    [U, F] = E.useState(""),
    [Q, ce] = E.useState(!1),
    G = E.useRef(null),
    ne = E.useRef(!1),
    T = async () => {
      try {
        const N = await Ke.get(`/api/research?workbook=${encodeURIComponent(e)}`),
          H = Array.isArray(N.data) ? N.data : [];
        S(H), w(We => We && H.some(yt => yt._id === We._id) ? We : H[0] || null);
      } catch (N) {
        console.error("Failed to fetch workbook items", N), S([]), w(null);
      }
    },
    L = async () => {
      g(!0);
      try {
        const N = await Ke.get(`/api/ai/workbook-insights?workbook=${encodeURIComponent(e)}`);
        x(N.data || {
          keyInsights: [],
          topEntities: []
        });
      } catch (N) {
        console.error("Failed to fetch insights", N);
      } finally {
        g(!1);
      }
    };
  E.useEffect(() => {
    var N;
    (N = G.current) == null || N.scrollIntoView({
      behavior: "smooth"
    });
  }, [a, d]), E.useEffect(() => {
    T();
  }, [e]), E.useEffect(() => {
    L();
  }, [e]);
  const I = y.filter(N => [N.topic, N.summary, N.notes, N.link, ...(N.tags || [])].filter(Boolean).join(" ").toLowerCase().includes(j.toLowerCase())),
    C = I.flatMap(N => {
      var H;
      return ((H = N.outputs) == null ? void 0 : H.flashcards) || [];
    }),
    b = I.flatMap(N => {
      var H;
      return ((H = N.outputs) == null ? void 0 : H.viva) || [];
    }),
    O = I.flatMap(N => {
      var We;
      const H = ((We = N.outputs) == null ? void 0 : We.relatedSources) || [];
      return [...(N.link ? [{
        title: N.topic,
        url: N.link,
        text: N.summary || "Saved source"
      }] : []), ...H];
    }),
    z = (Re = h.topEntities) != null && Re.length ? h.topEntities : I.flatMap(N => N.tags || []).slice(0, 5).map((N, H) => ({
      label: N,
      count: H + 1,
      color: "text-blue-500"
    }));
  E.useEffect(() => {
    w(I[0] || null);
  }, [e, y.length]), E.useEffect(() => {
    !t || ne.current || (ne.current = !0, D(t));
  }, [t]);
  const B = N => {
      F(N), setTimeout(() => F(""), 1800);
    },
    D = async (N = "") => {
      const H = (N || o).trim();
      if (!H || d) return;
      const We = {
        role: "user",
        text: H,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };
      u(yt => [...yt, We]), l(""), c(!0);
      try {
        const Ze = await (await fetch("http://localhost:5000/api/ai/workbook-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            workbook: e,
            query: We.text
          })
        })).json();
        u(Rt => [...Rt, {
          role: "assistant",
          data: Ze
        }]);
      } catch (yt) {
        console.error("Chat failed", yt), u(Ze => [...Ze, {
          role: "assistant",
          data: {
            introText: "I could not reach the workbook AI route. Your saved pages are still available here.",
            insights: []
          }
        }]);
      } finally {
        c(!1);
      }
    },
    q = async N => {
      try {
        await navigator.clipboard.writeText(N), B("Copied");
      } catch {
        B("Copy unavailable");
      }
    },
    J = async N => {
      try {
        await Ke.post("/api/research", {
          topic: `Copilot note - ${e}`,
          workbook: e,
          summary: (N == null ? void 0 : N.introText) || "Saved workbook copilot note.",
          notes: ((N == null ? void 0 : N.insights) || []).map(H => `${H.title}: ${H.desc}`).join(`
`),
          outputs: {
            answer: (N == null ? void 0 : N.introText) || "",
            saveType: "copilot-note",
            tags: ["Copilot", "Synthesis"]
          }
        }), B("Saved as note");
      } catch (H) {
        console.error("Save assistant note failed", H), B("Save failed");
      }
    },
    ee = (N, H = "page") => {
      w(N), p(H);
    },
    Z = N => D(N);
  return i.jsxs("div", {
    className: "w-full h-screen flex bg-[#0a0c14] text-white font-sans overflow-hidden",
    children: [i.jsxs("div", {
      className: `${r ? "w-[72px]" : "w-[260px]"} bg-[#05060b] border-r border-white/[0.05] flex flex-col shrink-0 z-20 transition-all duration-300 ease-in-out`,
      children: [i.jsxs("div", {
        className: `h-16 flex items-center ${r ? "justify-center" : "px-6 justify-between"} mb-2 border-b border-white/[0.02]`,
        children: [i.jsxs("div", {
          className: "flex items-center gap-3",
          children: [i.jsx("div", {
            className: "w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0",
            children: i.jsx(Xn, {
              className: "w-4 h-4 text-white fill-white"
            })
          }), !r && i.jsxs("div", {
            className: "animate-in fade-in duration-300",
            children: [i.jsx("h1", {
              className: "text-sm font-black tracking-tighter text-white leading-none",
              children: "FocusFlow"
            }), i.jsx("span", {
              className: "text-[9px] font-bold text-blue-500 tracking-widest uppercase",
              children: "Studio"
            })]
          })]
        }), i.jsx("button", {
          onClick: () => s(!r),
          className: `p-1.5 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors ${r ? "hidden" : "block"}`,
          children: i.jsx(W0, {
            size: 16
          })
        })]
      }), r && i.jsx("div", {
        className: "flex justify-center mb-6",
        children: i.jsx("button", {
          onClick: () => s(!1),
          className: "p-1.5 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors mt-2",
          children: i.jsx(Q0, {
            size: 16
          })
        })
      }), i.jsxs("div", {
        className: "flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar pb-6",
        children: [i.jsxs(al, {
          title: "Discovery",
          isCollapsed: r,
          children: [i.jsx(ut, {
            icon: ai,
            label: "Home",
            isCollapsed: r,
            onClick: n
          }), i.jsx(ut, {
            icon: xf,
            label: "Knowledge Base",
            isCollapsed: r,
            onClick: () => p("page")
          }), i.jsx(ut, {
            icon: br,
            label: "Recent Sessions",
            isCollapsed: r,
            onClick: () => p("overview")
          }), i.jsx(ut, {
            icon: pf,
            label: "Pinned Insights",
            count: 3,
            isCollapsed: r
          })]
        }), i.jsxs(al, {
          title: "Workspaces",
          isCollapsed: r,
          children: [i.jsx(ut, {
            icon: Un,
            label: "All Workbooks",
            isCollapsed: r,
            active: !0
          }), i.jsx(ut, {
            icon: sn,
            label: "Collections",
            isCollapsed: r
          }), i.jsx(ut, {
            icon: vf,
            label: "Shared with Me",
            isCollapsed: r
          })]
        }), i.jsxs(al, {
          title: "Tools",
          isCollapsed: r,
          children: [i.jsx(ut, {
            icon: sn,
            label: "Flashcards",
            isCollapsed: r,
            onClick: () => p("flashcards")
          }), i.jsx(ut, {
            icon: qt,
            label: "Viva Practice",
            isCollapsed: r,
            onClick: () => p("viva")
          }), i.jsx(ut, {
            icon: kt,
            label: "AI Assistant",
            isCollapsed: r,
            onClick: () => p("chat")
          })]
        }), !r && i.jsxs("div", {
          className: "mt-4 p-4 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05] rounded-2xl relative overflow-hidden group",
          children: [i.jsx("div", {
            className: "absolute top-0 right-0 p-3 opacity-20",
            children: i.jsx(Xn, {
              size: 40
            })
          }), i.jsx("h4", {
            className: "text-[12px] font-bold text-orange-400 flex items-center gap-1.5 mb-1.5",
            children: "👑 Pro Plan"
          }), i.jsx("p", {
            className: "text-[10px] text-gray-400 leading-relaxed mb-3",
            children: "Unlock unlimited access to all features and AI tools."
          }), i.jsx("button", {
            className: "w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-colors",
            children: "Upgrade Plan"
          })]
        })]
      }), i.jsxs("div", {
        className: `p-4 border-t border-white/[0.05] flex ${r ? "justify-center" : "items-center gap-3"} transition-all`,
        children: [i.jsx("div", {
          className: "w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 cursor-pointer hover:bg-white/20 transition-colors",
          children: "LA"
        }), !r && i.jsxs(i.Fragment, {
          children: [i.jsxs("div", {
            className: "flex-1 min-w-0",
            children: [i.jsx("h5", {
              className: "text-[12px] font-bold text-white truncate",
              children: "Lakshya"
            }), i.jsx("p", {
              className: "text-[10px] text-gray-500 truncate",
              children: "lakshya@example.com"
            })]
          }), i.jsx(li, {
            className: "w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors"
          })]
        })]
      })]
    }), i.jsxs("div", {
      className: "w-[280px] bg-[#080911] border-r border-white/[0.05] flex flex-col shrink-0 z-10 hidden md:flex",
      children: [i.jsx("div", {
        className: "h-16 flex items-center px-5 border-b border-white/[0.02] shrink-0",
        children: i.jsxs("h2", {
          className: "text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-between w-full",
          children: ["Workbook Contents", i.jsx("button", {
            className: "text-gray-500 hover:text-white transition-colors",
            children: i.jsx(ro, {
              size: 14
            })
          })]
        })
      }), i.jsxs("div", {
        className: "flex-1 overflow-y-auto px-3 py-5 custom-scrollbar space-y-6",
        children: [i.jsx("div", {
          className: "space-y-1",
          children: i.jsx(Wg, {
            icon: ai,
            label: "Overview",
            active: m === "overview",
            onClick: () => p("overview")
          })
        }), i.jsxs("div", {
          className: "space-y-1",
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2",
            children: "Saved Pages"
          }), I.length > 0 ? I.slice(0, 5).map((N, H) => i.jsx(ct, {
            label: N.topic || "Untitled Research",
            activeIndicator: (f == null ? void 0 : f._id) === N._id,
            onClick: () => ee(N, "page")
          }, N._id || H)) : i.jsx(ct, {
            label: "No saved pages yet"
          }), I.length > 5 && i.jsxs("button", {
            onClick: () => p("page"),
            className: "text-[11px] font-bold text-gray-500 hover:text-white transition-colors px-2 mt-2",
            children: ["Show ", I.length - 5, " more"]
          })]
        }), i.jsxs("div", {
          className: "space-y-1",
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2",
            children: "Notes"
          }), I.slice(0, 3).map((N, H) => i.jsx(ct, {
            icon: ii,
            label: N.summary ? N.summary.slice(0, 36) : "Research Note",
            activeIndicator: (f == null ? void 0 : f._id) === N._id && m === "notes",
            onClick: () => ee(N, "notes")
          }, N._id || H)), I.length === 0 && i.jsx(ct, {
            icon: ii,
            label: "Key Concepts"
          })]
        }), i.jsxs("div", {
          className: "space-y-1",
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2",
            children: "Flashcards"
          }), C.slice(0, 2).map((N, H) => i.jsx(ct, {
            icon: Tu,
            label: N.q || "Flashcard",
            activeIndicator: m === "flashcards" && H === 0,
            onClick: () => p("flashcards")
          }, H)), C.length === 0 && i.jsx(ct, {
            icon: Tu,
            label: "No flashcards saved yet"
          })]
        }), i.jsxs("div", {
          className: "space-y-1",
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2",
            children: "Viva Sessions"
          }), b.slice(0, 2).map((N, H) => i.jsx(ct, {
            icon: Ur,
            label: N.q || "Viva Question",
            activeIndicator: m === "viva" && H === 0,
            onClick: () => p("viva")
          }, H)), b.length === 0 && i.jsx(ct, {
            icon: Ur,
            label: "No viva notes saved yet"
          })]
        }), i.jsxs("div", {
          className: "space-y-1",
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2",
            children: "AI Syntheses"
          }), i.jsx(ct, {
            icon: qt,
            label: "AI Research Summary",
            activeIndicator: m === "synthesis",
            onClick: () => {
              p("synthesis"), Z("Summarize this workbook");
            }
          }), i.jsx(ct, {
            icon: xt,
            label: "Trends & Insights",
            activeIndicator: _ === "connections",
            onClick: () => P("connections")
          })]
        })]
      })]
    }), i.jsxs("div", {
      className: "flex-1 flex flex-col min-w-0 bg-[#0a0c14] relative",
      children: [i.jsxs("div", {
        className: "h-auto py-3 min-h-[64px] flex items-center justify-between px-8 border-b border-white/[0.02] shrink-0 bg-[#05060b]/50 backdrop-blur-xl absolute top-0 left-0 right-0 z-20",
        children: [i.jsxs("div", {
          className: "flex items-center gap-4",
          children: [i.jsx("div", {
            className: "w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0",
            children: i.jsx(Un, {
              className: "w-4 h-4 text-emerald-500"
            })
          }), i.jsxs("div", {
            className: "flex flex-col justify-center",
            children: [i.jsxs("h2", {
              className: "text-[14px] font-bold text-white flex items-center gap-2",
              children: [e, " ", i.jsx(aa, {
                size: 14,
                className: "text-gray-500"
              })]
            }), i.jsxs("div", {
              className: "flex items-center gap-2 text-[11px] text-gray-500 font-medium mt-0.5",
              children: [i.jsxs("span", {
                children: [y.length, " items"]
              }), " ", i.jsx("span", {
                children: "-"
              }), " ", i.jsx("span", {
                children: "You"
              }), i.jsx("span", {
                className: "px-1.5 py-[1px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded font-bold uppercase tracking-widest text-[8px]",
                children: "Active"
              })]
            })]
          })]
        }), i.jsxs("div", {
          className: "flex items-center gap-4",
          children: [i.jsxs("div", {
            className: "relative group w-[240px]",
            children: [i.jsx(da, {
              className: "w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"
            }), i.jsx("input", {
              type: "text",
              value: j,
              onChange: N => A(N.target.value),
              onKeyDown: N => {
                N.key === "Enter" && j.trim() && Z(`Search this workbook for ${j.trim()}`);
              },
              placeholder: "Search in this workbook...",
              className: "w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] focus:border-blue-500/50 rounded-xl pl-9 pr-9 py-1.5 text-[12px] text-white placeholder-gray-500 focus:outline-none transition-all"
            }), i.jsxs("div", {
              className: "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50",
              children: [i.jsx("span", {
                className: "text-[9px] font-bold border border-white/20 rounded px-1 py-0.5",
                children: "⌘"
              }), i.jsx("span", {
                className: "text-[9px] font-bold border border-white/20 rounded px-1 py-0.5",
                children: "K"
              })]
            })]
          }), i.jsxs("div", {
            className: "flex items-center gap-2",
            children: [i.jsxs("button", {
              onClick: () => {
                q(`${e}: ${y.length} saved items`);
              },
              className: "px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-lg text-[12px] font-bold text-white flex items-center gap-2 transition-colors",
              children: [i.jsx(Pm, {
                size: 14
              }), " Share"]
            }), i.jsx("button", {
              onClick: () => {
                ce(N => !N), B(Q ? "Unpinned" : "Pinned");
              },
              className: `p-1.5 hover:bg-white/[0.05] border border-white/[0.05] rounded-lg transition-colors ${Q ? "text-orange-400" : "text-gray-400 hover:text-white"}`,
              children: i.jsx(fa, {
                size: 14,
                fill: Q ? "currentColor" : "none"
              })
            }), i.jsx("button", {
              onClick: T,
              className: "p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.05] rounded-lg transition-colors",
              children: i.jsx(li, {
                size: 14
              })
            })]
          })]
        })]
      }), i.jsx("div", {
        className: "flex-1 overflow-y-auto px-8 pt-24 pb-32 custom-scrollbar flex flex-col",
        children: i.jsxs("div", {
          className: "max-w-3xl mx-auto w-full flex-1 flex flex-col justify-end space-y-8",
          children: [m !== "chat" && i.jsx(Qg, {
            activeContent: m,
            title: e,
            selectedItem: f,
            researchItems: I,
            flashcards: C,
            viva: b,
            sources: O,
            insights: h,
            onAsk: Z,
            onOpenItem: N => ee(N, "page"),
            onCopy: q
          }), m === "chat" && a.length === 0 && i.jsxs("div", {
            className: "flex flex-col items-center justify-center text-center py-10 opacity-60",
            children: [i.jsx(kt, {
              className: "w-10 h-10 text-blue-500 mb-4"
            }), i.jsx("h3", {
              className: "text-xl font-bold text-white mb-2",
              children: "AI Research Copilot"
            }), i.jsx("p", {
              className: "text-sm text-gray-400",
              children: "Your AI research partner. Ask anything about your workspace."
            })]
          }), a.map((N, H) => {
            var We, yt;
            return N.role === "user" ? i.jsx("div", {
              className: "flex justify-end animate-in fade-in slide-in-from-bottom-4",
              children: i.jsxs("div", {
                className: "flex items-end gap-3 max-w-[80%]",
                children: [i.jsxs("div", {
                  className: "bg-[#1e1e2d] text-white px-5 py-3.5 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed shadow-lg",
                  children: [N.text, i.jsx("div", {
                    className: "text-right text-[10px] text-gray-500 mt-2",
                    children: N.time
                  })]
                }), i.jsx("div", {
                  className: "w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0 shadow-lg",
                  children: "LA"
                })]
              })
            }, H) : i.jsxs("div", {
              className: "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-6 duration-500",
              children: [i.jsx("div", {
                className: "w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20",
                children: i.jsx(qt, {
                  className: "w-4 h-4 text-white"
                })
              }), i.jsxs("div", {
                className: "flex-1 bg-white/[0.02] border border-white/[0.05] rounded-[24px] rounded-tl-sm p-6 shadow-xl",
                children: [i.jsx("p", {
                  className: "text-[14px] text-gray-300 mb-6 font-medium",
                  children: ((We = N.data) == null ? void 0 : We.introText) || "Here are some insights:"
                }), ((yt = N.data) == null ? void 0 : yt.insights) && N.data.insights.length > 0 && i.jsx("div", {
                  className: "space-y-4 mb-6",
                  children: N.data.insights.map((Ze, Rt) => i.jsx(Vg, {
                    number: Rt + 1,
                    color: Ug(Ze.color, Rt),
                    title: Ze.title,
                    desc: Ze.desc,
                    sources: Ze.sources
                  }, Rt))
                }), i.jsxs("div", {
                  className: "flex items-center justify-between pt-4 border-t border-white/[0.04]",
                  children: [i.jsxs("div", {
                    className: "flex items-center gap-4",
                    children: [i.jsxs("button", {
                      onClick: () => {
                        var Ze, Rt;
                        return q(`${((Ze = N.data) == null ? void 0 : Ze.introText) || ""}
${(((Rt = N.data) == null ? void 0 : Rt.insights) || []).map(ya => `${ya.title}: ${ya.desc}`).join(`
`)}`);
                      },
                      className: "flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-white transition-colors",
                      children: [i.jsx(mf, {
                        size: 12
                      }), " Copy"]
                    }), i.jsxs("button", {
                      onClick: () => J(N.data),
                      className: "flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-white transition-colors",
                      children: [i.jsx(ua, {
                        size: 12
                      }), " Save as note"]
                    })]
                  }), i.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [i.jsx("button", {
                      className: "p-1.5 text-gray-500 hover:text-green-400 transition-colors rounded-lg hover:bg-green-400/10",
                      children: i.jsx(Tm, {
                        size: 14
                      })
                    }), i.jsx("button", {
                      className: "p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10",
                      children: i.jsx(Cm, {
                        size: 14
                      })
                    })]
                  })]
                })]
              })]
            }, H);
          }), d && i.jsxs("div", {
            className: "flex items-start gap-4 animate-in fade-in",
            children: [i.jsx("div", {
              className: "w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 animate-pulse",
              children: i.jsx(kt, {
                className: "w-4 h-4 text-white"
              })
            }), i.jsx("div", {
              className: "flex-1 bg-white/[0.02] border border-white/[0.05] rounded-[24px] rounded-tl-sm p-6 shadow-xl",
              children: i.jsxs("div", {
                className: "flex items-center gap-2",
                children: [i.jsx("div", {
                  className: "w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                }), i.jsx("div", {
                  className: "w-2 h-2 rounded-full bg-blue-500 animate-bounce",
                  style: {
                    animationDelay: "0.2s"
                  }
                }), i.jsx("div", {
                  className: "w-2 h-2 rounded-full bg-blue-500 animate-bounce",
                  style: {
                    animationDelay: "0.4s"
                  }
                })]
              })
            })]
          }), i.jsx("div", {
            ref: G
          })]
        })
      }), i.jsx("div", {
        className: "absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0c14] via-[#0a0c14] to-transparent pointer-events-none z-20",
        children: i.jsxs("div", {
          className: "max-w-3xl mx-auto pointer-events-auto",
          children: [i.jsx("div", {
            className: "bg-[#05060b] border border-white/[0.08] rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
            children: i.jsxs("div", {
              className: "relative flex items-center",
              children: [i.jsx("button", {
                className: "p-2.5 text-gray-500 hover:text-white transition-colors rounded-xl hover:bg-white/[0.05]",
                children: i.jsx(ym, {
                  size: 18
                })
              }), i.jsx("input", {
                type: "text",
                value: o,
                onChange: N => l(N.target.value),
                onFocus: () => p("chat"),
                onKeyDown: N => {
                  N.key === "Enter" && D();
                },
                placeholder: "Ask anything about your research...",
                className: "flex-1 bg-transparent border-none px-3 py-3 text-[14px] text-white placeholder-gray-500 focus:outline-none"
              }), i.jsx("button", {
                onClick: D,
                className: `p-2.5 rounded-xl transition-all ${o.trim() ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-white/[0.03] text-gray-600"}`,
                children: i.jsx(yf, {
                  size: 18,
                  fill: o.trim() ? "white" : "none"
                })
              })]
            })
          }), i.jsxs("div", {
            className: "flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-2",
            children: [i.jsx(xs, {
              icon: xt,
              text: "Summarize this workbook",
              onClick: () => Z("Summarize this workbook")
            }), i.jsx(xs, {
              icon: kt,
              text: "Find connections",
              onClick: () => Z("Find connections across this workbook")
            }), i.jsx(xs, {
              icon: M0,
              text: "Generate study guide",
              onClick: () => Z("Generate a study guide from this workbook")
            }), i.jsx(xs, {
              icon: sn,
              text: "Create flashcards",
              onClick: () => {
                p("flashcards"), Z("Create flashcards from this workbook");
              }
            }), U && i.jsx("span", {
              className: "ml-auto rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-300",
              children: U
            })]
          })]
        })
      })]
    }), i.jsxs("div", {
      className: "w-[320px] bg-[#05060b] border-l border-white/[0.05] flex flex-col shrink-0 z-10 hidden lg:flex",
      children: [i.jsxs("div", {
        className: "p-6 border-b border-white/[0.02]",
        children: [i.jsx("h3", {
          className: "text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4",
          children: "Context"
        }), i.jsxs("div", {
          className: "flex items-center gap-6 border-b border-white/[0.05]",
          children: [i.jsx(cl, {
            label: "Insights",
            active: _ === "insights",
            onClick: () => P("insights")
          }), i.jsx(cl, {
            label: "Connections",
            active: _ === "connections",
            onClick: () => P("connections")
          }), i.jsx(cl, {
            label: "Sources",
            active: _ === "sources",
            onClick: () => P("sources")
          })]
        })]
      }), i.jsxs("div", {
        className: "flex-1 overflow-y-auto px-6 py-2 custom-scrollbar space-y-8",
        children: [v ? i.jsx("div", {
          className: "py-10 flex justify-center",
          children: i.jsx("div", {
            className: "w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
          })
        }) : _ === "connections" ? i.jsxs("div", {
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3",
            children: "Connections"
          }), i.jsx("div", {
            className: "space-y-1",
            children: z.length > 0 ? z.map((N, H) => i.jsx(Ju, {
              label: N.label,
              count: N.count,
              icon: kt,
              color: N.color || "text-blue-500"
            }, `${N.label}-${H}`)) : i.jsx("p", {
              className: "text-xs text-gray-500",
              children: "No connections found yet."
            })
          })]
        }) : _ === "sources" ? i.jsxs("div", {
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3",
            children: "Sources"
          }), i.jsx("div", {
            className: "space-y-2",
            children: O.length > 0 ? O.slice(0, 8).map((N, H) => i.jsxs("a", {
              href: N.url,
              target: "_blank",
              rel: "noreferrer",
              className: "block rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 hover:bg-white/[0.05]",
              children: [i.jsx("p", {
                className: "truncate text-[12px] font-bold text-white",
                children: N.title || N.text || "Source"
              }), i.jsx("p", {
                className: "mt-1 truncate text-[10px] text-blue-400",
                children: N.url || "Saved source"
              })]
            }, `${N.url || N.title}-${H}`)) : i.jsx("p", {
              className: "text-xs text-gray-500",
              children: "No sources saved yet."
            })
          })]
        }) : i.jsxs(i.Fragment, {
          children: [i.jsxs("div", {
            children: [i.jsx("h3", {
              className: "text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3",
              children: "Key Insights"
            }), i.jsx("div", {
              className: "space-y-3",
              children: ((gt = h.keyInsights) == null ? void 0 : gt.length) > 0 ? h.keyInsights.map((N, H) => i.jsx(qg, {
                title: N.title,
                color: Bg(N.color, H),
                desc: N.desc,
                chartColor: N.chartColor || "border-emerald-500"
              }, H)) : i.jsx("p", {
                className: "text-xs text-gray-500",
                children: "Not enough data to generate insights."
              })
            })]
          }), i.jsxs("div", {
            className: "mt-8",
            children: [i.jsx("h3", {
              className: "text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3",
              children: "Top Entities"
            }), i.jsx("div", {
              className: "space-y-1",
              children: ((ga = h.topEntities) == null ? void 0 : ga.length) > 0 ? h.topEntities.map((N, H) => i.jsx(Ju, {
                label: N.label,
                count: N.count,
                icon: kt,
                color: N.color || "text-blue-500"
              }, H)) : i.jsx("p", {
                className: "text-xs text-gray-500",
                children: "No entities found."
              })
            })]
          })]
        }), i.jsxs("div", {
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3",
            children: "Suggested Actions"
          }), i.jsxs("div", {
            className: "space-y-2",
            children: [i.jsx(dl, {
              icon: xt,
              label: "Review saved notes",
              onClick: () => {
                p("notes");
              }
            }), i.jsx(dl, {
              icon: sn,
              label: "Create flashcards from saved pages",
              onClick: () => {
                p("flashcards"), Z("Create flashcards from saved pages");
              }
            }), i.jsx(dl, {
              icon: hf,
              label: "Generate summary of all saved pages",
              onClick: () => Z("Generate summary of all saved pages")
            })]
          })]
        })]
      })]
    })]
  });
}
function al({
  title: e,
  children: t,
  isCollapsed: n
}) {
  return n ? i.jsx("div", {
    className: "space-y-2 mb-4",
    children: t
  }) : i.jsxs("div", {
    className: "space-y-1 mb-2",
    children: [i.jsx("h3", {
      className: "text-[10px] font-black text-gray-600 uppercase tracking-widest px-3 mb-2",
      children: e
    }), t]
  });
}
function ut({
  icon: e,
  label: t,
  active: n,
  count: r,
  isCollapsed: s,
  onClick: o
}) {
  return i.jsxs("button", {
    onClick: o,
    className: `
        flex items-center ${s ? "justify-center w-10 h-10 mx-auto" : "justify-between w-full px-3 py-2"} rounded-xl transition-all duration-300 group
        ${n ? "bg-blue-600/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"}
      `,
    title: s ? t : void 0,
    children: [i.jsxs("div", {
      className: `flex items-center ${s ? "justify-center" : "gap-3"}`,
      children: [i.jsx(e, {
        className: `w-4 h-4 transition-colors duration-300 ${n ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300"}`
      }), !s && i.jsx("span", {
        className: `text-[13px] font-bold ${n ? "text-white" : "text-gray-400 group-hover:text-white"}`,
        children: t
      })]
    }), !s && r && i.jsx("span", {
      className: "text-[10px] font-black bg-white/[0.05] border border-white/[0.05] px-2 py-0.5 rounded-full text-white",
      children: r
    })]
  });
}
function Wg({
  icon: e,
  label: t,
  active: n,
  onClick: r
}) {
  return i.jsxs("button", {
    onClick: r,
    className: `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-bold transition-all ${n ? "bg-blue-600/10 text-white" : "text-gray-400 hover:bg-white/[0.03] hover:text-white"}`,
    children: [i.jsx(e, {
      size: 16,
      className: n ? "text-blue-500" : "text-gray-500"
    }), " ", t]
  });
}
function ct({
  icon: e = xt,
  label: t,
  activeIndicator: n,
  onClick: r
}) {
  return i.jsxs("button", {
    onClick: r,
    className: "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-400 hover:text-white hover:bg-white/[0.02] transition-colors group",
    children: [i.jsxs("div", {
      className: "flex items-center gap-3 min-w-0",
      children: [i.jsx(e, {
        size: 14,
        className: "text-gray-600 group-hover:text-gray-400 shrink-0"
      }), i.jsx("span", {
        className: "truncate",
        children: t
      })]
    }), n && i.jsx("div", {
      className: "w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
    })]
  });
}
function Vg({
  number: e,
  color: t,
  title: n,
  desc: r,
  sources: s
}) {
  return i.jsxs("div", {
    className: "flex gap-4 p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer group",
    children: [i.jsx("div", {
      className: `w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${t}`,
      children: e
    }), i.jsxs("div", {
      children: [i.jsx("h4", {
        className: "text-[13px] font-bold text-white mb-1 group-hover:text-blue-400 transition-colors",
        children: n
      }), i.jsx("p", {
        className: "text-[12px] text-gray-400 mb-2 leading-relaxed",
        children: r
      }), i.jsx("span", {
        className: "text-[10px] font-bold text-gray-500 uppercase tracking-widest",
        children: s
      })]
    })]
  });
}
function Qg({
  activeContent: e,
  title: t,
  selectedItem: n,
  researchItems: r,
  flashcards: s,
  viva: o,
  sources: l,
  insights: a,
  onAsk: u,
  onOpenItem: d,
  onCopy: c
}) {
  var h, x;
  return e === "flashcards" ? i.jsx(Sn, {
    icon: sn,
    title: "Flashcards",
    subtitle: `${s.length} cards generated from saved pages`,
    children: i.jsx("div", {
      className: "grid grid-cols-2 gap-3",
      children: s.length ? s.slice(0, 8).map((v, g) => i.jsxs("div", {
        className: "rounded-xl border border-pink-400/20 bg-pink-500/[0.04] p-4",
        children: [i.jsx("p", {
          className: "text-[12px] font-black text-white",
          children: v.q || v.topic || "Study Card"
        }), i.jsx("p", {
          className: "mt-2 text-[11px] leading-relaxed text-gray-400",
          children: v.a || v.explanation || "Review the saved page context."
        })]
      }, `${v.q}-${g}`)) : i.jsx(ul, {
        text: "No flashcards saved yet."
      })
    })
  }) : e === "viva" ? i.jsx(Sn, {
    icon: Ur,
    title: "Viva Practice",
    subtitle: `${o.length} questions available`,
    children: i.jsx("div", {
      className: "space-y-3",
      children: o.length ? o.slice(0, 10).map((v, g) => i.jsxs("div", {
        className: "rounded-xl border border-violet-400/20 bg-violet-500/[0.04] p-4 text-[12px]",
        children: [i.jsxs("p", {
          className: "font-black text-white",
          children: ["Q", g + 1, ". ", v.q || "Question"]
        }), i.jsx("p", {
          className: "mt-2 leading-relaxed text-gray-400",
          children: v.a || "Use your saved notes to answer this."
        })]
      }, `${v.q}-${g}`)) : i.jsx(ul, {
        text: "No viva notes saved yet."
      })
    })
  }) : e === "synthesis" ? i.jsxs(Sn, {
    icon: qt,
    title: "AI Synthesis",
    subtitle: "Connected workbook intelligence",
    children: [i.jsx("p", {
      className: "text-[13px] leading-relaxed text-gray-300",
      children: ((x = (h = a.keyInsights) == null ? void 0 : h[0]) == null ? void 0 : x.desc) || `Ask FocusFlow to synthesize the ${r.length} saved item${r.length === 1 ? "" : "s"} in ${t}.`
    }), i.jsx("button", {
      onClick: () => u("Synthesize the strongest ideas across this workbook"),
      className: "mt-4 rounded-xl bg-blue-600 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white",
      children: "Generate synthesis"
    })]
  }) : e === "notes" && n ? i.jsx(Sn, {
    icon: ii,
    title: "Saved Note",
    subtitle: n.topic || "Saved research",
    children: i.jsx("p", {
      className: "text-[13px] leading-relaxed text-gray-300",
      children: n.notes || n.summary || "No notes saved for this item yet."
    })
  }) : e === "page" && n ? i.jsxs(Sn, {
    icon: xt,
    title: n.topic || "Saved Page",
    subtitle: n.link || "Saved research item",
    children: [i.jsx("p", {
      className: "text-[13px] leading-relaxed text-gray-300",
      children: n.summary || n.notes || "No summary saved yet."
    }), i.jsx("div", {
      className: "mt-5 flex flex-wrap gap-2",
      children: (n.tags || []).map(v => i.jsx("span", {
        className: "rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold text-blue-200",
        children: v
      }, v))
    }), i.jsxs("div", {
      className: "mt-5 flex gap-2",
      children: [n.link && i.jsx("a", {
        href: n.link,
        target: "_blank",
        rel: "noreferrer",
        className: "rounded-xl border border-white/[0.08] px-3 py-2 text-[11px] font-bold text-gray-300 hover:text-white",
        children: "Open source"
      }), i.jsx("button", {
        onClick: () => u(`Explain ${n.topic}`),
        className: "rounded-xl bg-blue-600 px-3 py-2 text-[11px] font-bold text-white",
        children: "Ask about this"
      }), i.jsx("button", {
        onClick: () => c(`${n.topic}

${n.summary || n.notes || ""}`),
        className: "rounded-xl border border-white/[0.08] px-3 py-2 text-[11px] font-bold text-gray-300 hover:text-white",
        children: "Copy"
      })]
    })]
  }) : i.jsx(Sn, {
    icon: kt,
    title: `${t} Overview`,
    subtitle: `${r.length} saved item${r.length === 1 ? "" : "s"}`,
    children: i.jsx("div", {
      className: "space-y-2",
      children: r.length ? r.slice(0, 6).map(v => i.jsxs("button", {
        onClick: () => d(v),
        className: "w-full rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-left hover:bg-white/[0.05]",
        children: [i.jsx("p", {
          className: "truncate text-[13px] font-black text-white",
          children: v.topic || "Untitled Research"
        }), i.jsx("p", {
          className: "mt-2 line-clamp-2 text-[12px] leading-relaxed text-gray-400",
          children: v.summary || v.notes || "Saved from Aide."
        })]
      }, v._id)) : i.jsx(ul, {
        text: "This workbook is ready. Save a page from the Aide sidebar to start building it."
      })
    })
  });
}
function Sn({
  icon: e,
  title: t,
  subtitle: n,
  children: r
}) {
  return i.jsxs("section", {
    className: "rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-6 shadow-xl",
    children: [i.jsxs("div", {
      className: "mb-5 flex items-center gap-3",
      children: [i.jsx("div", {
        className: "flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400",
        children: i.jsx(e, {
          size: 18
        })
      }), i.jsxs("div", {
        className: "min-w-0",
        children: [i.jsx("h3", {
          className: "truncate text-[16px] font-black text-white",
          children: t
        }), i.jsx("p", {
          className: "mt-1 truncate text-[12px] text-gray-500",
          children: n
        })]
      })]
    }), r]
  });
}
function ul({
  text: e
}) {
  return i.jsx("div", {
    className: "rounded-xl border border-dashed border-white/[0.08] p-6 text-center text-[12px] font-bold text-gray-500",
    children: e
  });
}
function cl({
  label: e,
  active: t,
  onClick: n
}) {
  return i.jsx("button", {
    onClick: n,
    className: `text-[13px] font-bold pb-2 border-b-2 transition-colors ${t ? "text-blue-500 border-blue-500" : "text-gray-500 border-transparent hover:text-white"}`,
    children: e
  });
}
function xs({
  icon: e,
  text: t,
  onClick: n
}) {
  return i.jsxs("button", {
    onClick: n,
    className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-[11px] font-bold text-gray-400 hover:text-white transition-colors whitespace-nowrap",
    children: [i.jsx(e, {
      size: 12,
      className: "text-gray-500"
    }), " ", t]
  });
}
function qg({
  title: e,
  desc: t,
  color: n,
  chartColor: r
}) {
  return i.jsxs("div", {
    className: "p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-colors group cursor-pointer",
    children: [i.jsx("h4", {
      className: `text-[12px] font-bold mb-1 ${n}`,
      children: e
    }), i.jsx("p", {
      className: "text-[11px] text-gray-400 leading-relaxed mb-3",
      children: t
    }), i.jsx("div", {
      className: "h-4 flex items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity",
      children: i.jsx("div", {
        className: `w-full border-t border-dashed ${r} transform -skew-y-12`
      })
    })]
  });
}
function Ju({
  label: e,
  count: t,
  icon: n,
  color: r
}) {
  return i.jsxs("div", {
    className: "flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group",
    children: [i.jsxs("div", {
      className: "flex items-center gap-3",
      children: [i.jsx(n, {
        size: 14,
        className: `${r} opacity-80 group-hover:opacity-100`
      }), i.jsx("span", {
        className: "text-[12px] font-bold text-gray-300 group-hover:text-white",
        children: e
      })]
    }), i.jsx("span", {
      className: "text-[11px] font-black text-gray-600 bg-white/[0.03] px-2 py-0.5 rounded-md",
      children: t
    })]
  });
}
function dl({
  icon: e,
  label: t,
  onClick: n
}) {
  return i.jsxs("button", {
    onClick: n,
    className: "w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.05] transition-colors text-left group",
    children: [i.jsx(e, {
      size: 14,
      className: "text-gray-500 group-hover:text-blue-400 transition-colors shrink-0"
    }), i.jsx("span", {
      className: "text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors leading-snug",
      children: t
    })]
  });
}
function Kg() {
  const [e, t] = E.useState([]),
    [n, r] = E.useState([]),
    [s, o] = E.useState(!0),
    [l, a] = E.useState(""),
    [u, d] = E.useState(!1),
    [c, h] = E.useState("all"),
    [x, v] = E.useState(null),
    [g, y] = E.useState(["Research Workbook"]),
    [S, m] = E.useState(!1),
    [p, f] = E.useState(""),
    [w, j] = E.useState(""),
    A = async () => {
      o(!0);
      try {
        const [T, L] = await Promise.all([Ke.get("/api/research"), Ke.get("/api/research/workbooks")]),
          I = Array.isArray(T.data) ? T.data : [],
          C = Array.isArray(L.data) && L.data.length ? L.data : ["Research Workbook"];
        t(I), r(I), y(C);
      } catch (T) {
        console.error("Failed to fetch research:", T);
      } finally {
        o(!1);
      }
    };
  E.useEffect(() => {
    A();
  }, []);
  const _ = E.useMemo(() => g.map(T => {
      var C, b;
      const L = e.filter(O => (O.workbook || "Research Workbook") === T),
        I = (C = L[0]) != null && C.date ? new Date(L[0].date) : null;
      return {
        name: T,
        count: L.length,
        desc: ((b = L[0]) == null ? void 0 : b.summary) || "Research workspace.",
        time: I ? `Updated ${I.toLocaleDateString(void 0, {
          month: "short",
          day: "numeric"
        })}` : "Ready for pages"
      };
    }), [e, g]),
    P = E.useMemo(() => c === "recent" ? n.slice(0, 6) : c === "pinned" ? n.filter(T => {
      var L, I;
      return ((L = T.tags) == null ? void 0 : L.includes("Pinned")) || ((I = T.saveOptions) == null ? void 0 : I.includes("Pinned"));
    }) : c === "flashcards" ? n.filter(T => {
      var L, I;
      return (I = (L = T.outputs) == null ? void 0 : L.flashcards) == null ? void 0 : I.length;
    }) : c === "viva" ? n.filter(T => {
      var L, I;
      return (I = (L = T.outputs) == null ? void 0 : L.viva) == null ? void 0 : I.length;
    }) : n, [c, n]),
    U = (T, L = "") => {
      j(L), v(T);
    },
    F = async () => {
      const T = p.trim();
      if (T) try {
        await Ke.post("/api/research/workbooks", {
          name: T
        }), y(L => [T, ...L.filter(I => I !== T)]), f(""), m(!1), U(T);
      } catch (L) {
        console.error("Failed to create workbook:", L);
      }
    },
    Q = (T = "What are the key themes in my research?") => {
      var I, C;
      const L = ((I = _.find(b => b.count > 0)) == null ? void 0 : I.name) || ((C = _[0]) == null ? void 0 : C.name) || "Research Workbook";
      U(L, T);
    };
  E.useEffect(() => {
    const T = async () => {
      try {
        const C = (await Ke.post("/api/research/semantic-search", {
            query: l
          })).data,
          b = e.filter(O => ((O == null ? void 0 : O.topic) || "").toLowerCase().includes(l.toLowerCase()) || (O == null ? void 0 : O.summary) && O.summary.toLowerCase().includes(l.toLowerCase()) || (O == null ? void 0 : O.notes) && O.notes.toLowerCase().includes(l.toLowerCase()) || (O == null ? void 0 : O.workbook) && O.workbook.toLowerCase().includes(l.toLowerCase()));
        r(Array.isArray(C) && C.length > 0 ? C : b);
      } catch (I) {
        console.error("Semantic search failed", I);
      } finally {
        d(!1);
      }
    };
    if (!l.trim()) {
      r(e), d(!1);
      return;
    }
    d(!0);
    const L = setTimeout(T, 500);
    return () => clearTimeout(L);
  }, [l, e]);
  const ce = async T => {
      try {
        await Ke.delete(`/api/research/${T}`), t(L => L.filter(I => I._id !== T)), r(L => L.filter(I => I._id !== T));
      } catch (L) {
        console.error("Failed to delete:", L);
      }
    },
    G = _.length,
    ne = e.length;
  return x ? i.jsx(Hg, {
    title: x,
    initialPrompt: w,
    onBack: () => {
      v(null), A();
    }
  }) : i.jsxs("div", {
    className: "w-full h-screen flex bg-[#0a0c14] text-white font-sans overflow-hidden",
    children: [i.jsxs("div", {
      className: "w-[260px] bg-[#05060b] border-r border-white/[0.05] flex flex-col shrink-0 z-10",
      children: [i.jsxs("div", {
        className: "h-16 flex items-center px-6 gap-3 mb-2",
        children: [i.jsx("div", {
          className: "w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/20",
          children: i.jsx(Xn, {
            className: "w-4 h-4 text-white fill-white"
          })
        }), i.jsxs("div", {
          children: [i.jsx("h1", {
            className: "text-sm font-black tracking-tighter text-white leading-none",
            children: "FocusFlow"
          }), i.jsx("span", {
            className: "text-[9px] font-bold text-blue-500 tracking-widest uppercase",
            children: "Studio"
          })]
        })]
      }), i.jsxs("div", {
        className: "flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar pb-6",
        children: [i.jsxs("div", {
          className: "space-y-1",
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-3",
            children: "Discovery"
          }), i.jsx(dt, {
            icon: ai,
            label: "Home",
            active: c === "all",
            onClick: () => h("all")
          }), i.jsx(dt, {
            icon: xf,
            label: "Knowledge Base",
            active: c === "knowledge",
            onClick: () => h("knowledge")
          }), i.jsx(dt, {
            icon: br,
            label: "Recent Sessions",
            active: c === "recent",
            onClick: () => h("recent")
          }), i.jsx(dt, {
            icon: pf,
            label: "Pinned Insights",
            active: c === "pinned",
            count: e.filter(T => {
              var L, I;
              return ((L = T.tags) == null ? void 0 : L.includes("Pinned")) || ((I = T.saveOptions) == null ? void 0 : I.includes("Pinned"));
            }).length,
            onClick: () => h("pinned")
          })]
        }), i.jsxs("div", {
          className: "space-y-1",
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-3",
            children: "Workspaces"
          }), i.jsx(dt, {
            icon: Un,
            label: "All Workbooks",
            active: c === "workbooks",
            count: G,
            onClick: () => h("workbooks")
          }), i.jsx(dt, {
            icon: sn,
            label: "Collections",
            active: c === "collections",
            onClick: () => h("collections")
          }), i.jsx(dt, {
            icon: vf,
            label: "Shared with Me",
            active: c === "shared",
            onClick: () => h("shared")
          })]
        }), i.jsxs("div", {
          className: "space-y-1",
          children: [i.jsx("h3", {
            className: "text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-3",
            children: "Tools"
          }), i.jsx(dt, {
            icon: sn,
            label: "Flashcards",
            active: c === "flashcards",
            onClick: () => h("flashcards")
          }), i.jsx(dt, {
            icon: qt,
            label: "Viva Practice",
            active: c === "viva",
            onClick: () => h("viva")
          }), i.jsx(dt, {
            icon: kt,
            label: "AI Assistant",
            onClick: () => Q()
          })]
        }), i.jsxs("div", {
          className: "mt-4 p-4 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05] rounded-2xl relative overflow-hidden group",
          children: [i.jsx("div", {
            className: "absolute top-0 right-0 p-3 opacity-20",
            children: i.jsx(Xn, {
              size: 40
            })
          }), i.jsx("h4", {
            className: "text-[12px] font-bold text-orange-400 flex items-center gap-1.5 mb-1.5",
            children: "👑 Pro Plan"
          }), i.jsx("p", {
            className: "text-[10px] text-gray-400 leading-relaxed mb-3",
            children: "Unlock unlimited access to all features and AI tools."
          }), i.jsx("button", {
            className: "w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-colors",
            children: "Upgrade Plan"
          })]
        })]
      }), i.jsx("div", {
        className: "p-4 border-t border-white/[0.05]",
        children: i.jsxs("div", {
          className: "flex items-center gap-3 px-2 cursor-pointer hover:bg-white/[0.03] p-2 rounded-xl transition-colors",
          children: [i.jsx("div", {
            className: "w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white",
            children: "PH"
          }), i.jsxs("div", {
            className: "flex-1 min-w-0",
            children: [i.jsx("h5", {
              className: "text-[12px] font-bold text-white truncate",
              children: "Phillip"
            }), i.jsx("p", {
              className: "text-[10px] text-gray-500 truncate",
              children: "phillip@example.com"
            })]
          }), i.jsx(li, {
            className: "w-4 h-4 text-gray-500"
          })]
        })
      })]
    }), i.jsxs("div", {
      className: "flex-1 flex flex-col min-w-0 z-10 relative bg-[#0a0c14]",
      children: [i.jsxs("div", {
        className: "h-16 flex items-center justify-between px-10 border-b border-white/[0.02] shrink-0",
        children: [i.jsxs("div", {
          className: "relative group w-[500px]",
          children: [i.jsx(da, {
            className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"
          }), i.jsx("input", {
            type: "text",
            value: l,
            onChange: T => a(T.target.value),
            placeholder: "Search your research, notes, and insights...",
            className: "w-full bg-[#05060b] border border-white/[0.05] focus:border-blue-500/50 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition-all shadow-inner"
          }), i.jsx("div", {
            className: "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50",
            children: u ? i.jsx("div", {
              className: "w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            }) : i.jsxs(i.Fragment, {
              children: [i.jsx("span", {
                className: "text-[10px] font-bold border border-white/20 rounded px-1.5 py-0.5",
                children: "⌘"
              }), i.jsx("span", {
                className: "text-[10px] font-bold border border-white/20 rounded px-1.5 py-0.5",
                children: "K"
              })]
            })
          })]
        }), i.jsxs("div", {
          className: "flex items-center gap-5",
          children: [i.jsx("button", {
            className: "text-gray-400 hover:text-white transition-colors",
            children: i.jsx(L0, {
              className: "w-5 h-5"
            })
          }), S ? i.jsxs("div", {
            className: "flex items-center gap-2 rounded-xl border border-blue-500/30 bg-[#05060b] p-1.5",
            children: [i.jsx("input", {
              value: p,
              onChange: T => f(T.target.value),
              onKeyDown: T => T.key === "Enter" && F(),
              autoFocus: !0,
              placeholder: "Workbook name",
              className: "w-44 bg-transparent px-2 text-[12px] font-bold text-white outline-none placeholder:text-gray-600"
            }), i.jsx("button", {
              onClick: F,
              className: "rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-black text-white",
              children: "Create"
            }), i.jsx("button", {
              onClick: () => {
                m(!1), f("");
              },
              className: "rounded-lg px-2 py-1.5 text-[11px] font-bold text-gray-400 hover:text-white",
              children: "Cancel"
            })]
          }) : i.jsxs("button", {
            onClick: () => m(!0),
            className: "bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2",
            children: [i.jsx(ro, {
              className: "w-4 h-4"
            }), "New Workbook ", i.jsx(aa, {
              className: "w-3 h-3 ml-1"
            })]
          })]
        })]
      }), i.jsx("div", {
        className: "flex-1 overflow-y-auto px-10 py-8 custom-scrollbar",
        children: i.jsxs("div", {
          className: "max-w-[1200px] mx-auto space-y-10",
          children: [i.jsxs("header", {
            className: "animate-in fade-in slide-in-from-left-4 duration-700",
            children: [i.jsxs("h2", {
              className: "text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3",
              children: ["Welcome back, Researcher ", i.jsx("span", {
                className: "text-2xl animate-waving-hand origin-bottom-right inline-block",
                children: "👋"
              })]
            }), i.jsx("p", {
              className: "text-gray-400 text-sm font-medium",
              children: "Your research hub. All your knowledge. One place to explore and create."
            })]
          }), i.jsxs("div", {
            className: "grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100",
            children: [i.jsx(gs, {
              icon: Un,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              value: G,
              label: "Workbooks",
              sub: "Active spaces"
            }), i.jsx(gs, {
              icon: xt,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              value: ne,
              label: "Saved Items",
              sub: "Across all workbooks"
            }), i.jsx(gs, {
              icon: br,
              color: "text-violet-500",
              bg: "bg-violet-500/10",
              value: "0h",
              label: "Research Time",
              sub: "This week"
            }), i.jsx(gs, {
              icon: fa,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
              value: "0",
              label: "Pinned Insights",
              sub: "Quick access"
            })]
          }), i.jsxs("div", {
            className: "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200",
            children: [i.jsxs("div", {
              className: "flex items-center justify-between mb-4",
              children: [i.jsx("h3", {
                className: "text-lg font-bold text-white tracking-tight",
                children: "My Workbooks"
              }), i.jsxs("button", {
                className: "text-[12px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors",
                children: ["View all ", i.jsx(B0, {
                  size: 14
                })]
              })]
            }), i.jsx("div", {
              className: "grid grid-cols-4 gap-4",
              children: (() => {
                const T = ["from-indigo-900/40 to-blue-900/20 border-indigo-500/20", "from-emerald-900/40 to-teal-900/20 border-emerald-500/20", "from-orange-900/40 to-red-900/20 border-orange-500/20", "from-blue-900/40 to-cyan-900/20 border-blue-500/20"],
                  L = ["bg-indigo-500", "bg-emerald-500", "bg-orange-500", "bg-blue-500"];
                return _.length === 0 ? i.jsxs("div", {
                  className: "col-span-4 border border-dashed border-white/[0.1] rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-white/[0.01]",
                  children: [i.jsx(Un, {
                    className: "w-10 h-10 text-gray-600 mb-4"
                  }), i.jsx("h4", {
                    className: "text-white font-bold mb-1",
                    children: "No Workbooks Yet"
                  }), i.jsx("p", {
                    className: "text-sm text-gray-500 max-w-sm",
                    children: "Use the Aide sidebar to extract information and build your first workbook."
                  })]
                }) : _.map((I, C) => i.jsx(Xg, {
                  title: I.name,
                  desc: I.desc,
                  items: `${I.count} items`,
                  time: I.time,
                  theme: T[C % T.length],
                  accent: L[C % L.length],
                  progress: `w-[${Math.min(Math.max(I.count, 1) * 8, 100)}%]`,
                  onClick: () => U(I.name)
                }, C));
              })()
            })]
          }), i.jsxs("div", {
            className: "grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300",
            children: [i.jsxs("div", {
              className: "bg-[#05060b] border border-white/[0.05] rounded-[24px] p-6 flex flex-col",
              children: [i.jsxs("div", {
                className: "flex items-center justify-between mb-6",
                children: [i.jsx("h3", {
                  className: "text-[15px] font-bold text-white tracking-tight",
                  children: "Recent Activity"
                }), i.jsx("button", {
                  className: "text-[12px] font-bold text-blue-400 hover:text-blue-300 transition-colors",
                  children: "View all"
                })]
              }), i.jsx("div", {
                className: "space-y-1 flex-1",
                children: s ? i.jsx("div", {
                  className: "text-center py-10 text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse",
                  children: "Loading Activity..."
                }) : P.length > 0 ? P.slice(0, 5).map((T, L) => i.jsx(Gg, {
                  icon: xt,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                  action: "Saved insight from",
                  target: T != null && T.topic ? T.topic.length > 30 ? T.topic.substring(0, 30) + "..." : T.topic : "Untitled",
                  context: (T == null ? void 0 : T.workbook) || "Research",
                  time: T != null && T.date ? new Date(T.date).toLocaleDateString(void 0, {
                    month: "short",
                    day: "numeric"
                  }) : "Unknown",
                  onOpen: () => U((T == null ? void 0 : T.workbook) || "Research Workbook", `Summarize "${(T == null ? void 0 : T.topic) || "this saved page"}"`),
                  onDelete: () => ce(T._id)
                }, T._id || L)) : i.jsxs("div", {
                  className: "flex flex-col items-center justify-center py-8 text-center bg-white/[0.01] border border-dashed border-white/[0.05] rounded-xl",
                  children: [i.jsx(br, {
                    className: "w-6 h-6 text-gray-600 mb-2"
                  }), i.jsx("p", {
                    className: "text-xs text-gray-500 font-medium",
                    children: "No recent activity found."
                  })]
                })
              })]
            }), i.jsxs("div", {
              className: "bg-[#05060b] border border-white/[0.05] rounded-[24px] p-6 flex flex-col relative overflow-hidden group",
              children: [i.jsx("div", {
                className: "absolute inset-0 bg-gradient-to-br from-blue-600/5 to-violet-600/5 pointer-events-none"
              }), i.jsxs("div", {
                className: "flex items-center gap-3 mb-2 relative z-10",
                children: [i.jsx("h3", {
                  className: "text-[16px] font-bold text-white tracking-tight",
                  children: "AI Research Copilot"
                }), i.jsx("span", {
                  className: "px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400",
                  children: "BETA"
                })]
              }), i.jsx("p", {
                className: "text-sm text-gray-400 mb-6 relative z-10",
                children: "Ask questions across your entire knowledge base."
              }), i.jsx("div", {
                className: "space-y-2.5 mb-6 relative z-10 flex-1",
                children: ne > 0 ? i.jsxs(i.Fragment, {
                  children: [i.jsx(Ot, {
                    text: "What are the key themes in my research?",
                    onClick: Q
                  }), i.jsx(Ot, {
                    text: "Find connections across my workbooks",
                    onClick: Q
                  }), i.jsx(Ot, {
                    text: "Summarize my saved insights",
                    onClick: Q
                  }), i.jsx(Ot, {
                    text: "How can I optimize my research flow?",
                    onClick: Q
                  })]
                }) : i.jsxs(i.Fragment, {
                  children: [i.jsx(Ot, {
                    text: "How do I get started with FocusFlow?",
                    onClick: Q
                  }), i.jsx(Ot, {
                    text: "How do I extract notes using the Aide?",
                    onClick: Q
                  }), i.jsx(Ot, {
                    text: "What can the AI Copilot do for me?",
                    onClick: Q
                  }), i.jsx(Ot, {
                    text: "Show me a quick start guide",
                    onClick: Q
                  })]
                })
              }), i.jsxs("button", {
                onClick: () => Q(),
                className: "w-full relative z-10 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-black text-[13px] transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-between px-6",
                children: ["Ask Copilot ", i.jsx(O0, {
                  size: 16
                })]
              })]
            })]
          })]
        })
      })]
    })]
  });
}
function dt({
  icon: e,
  label: t,
  active: n,
  count: r,
  onClick: s
}) {
  return i.jsxs("button", {
    onClick: s,
    className: `
        w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 group
        ${n ? "bg-blue-600/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"}
      `,
    children: [i.jsxs("div", {
      className: "flex items-center gap-3",
      children: [i.jsx(e, {
        className: `w-4 h-4 transition-colors duration-300 ${n ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300"}`
      }), i.jsx("span", {
        className: `text-[13px] font-bold ${n ? "text-white" : "text-gray-400 group-hover:text-white"}`,
        children: t
      })]
    }), r && i.jsx("span", {
      className: "text-[10px] font-black bg-white/[0.05] border border-white/[0.05] px-2 py-0.5 rounded-full text-white",
      children: r
    })]
  });
}
function gs({
  icon: e,
  color: t,
  bg: n,
  value: r,
  label: s,
  sub: o
}) {
  return i.jsxs("div", {
    className: "p-5 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors",
    children: [i.jsx("div", {
      className: `w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${n}`,
      children: i.jsx(e, {
        className: `w-5 h-5 ${t}`
      })
    }), i.jsxs("div", {
      children: [i.jsx("div", {
        className: "flex items-baseline gap-2 mb-0.5",
        children: i.jsx("span", {
          className: "text-2xl font-black text-white leading-none",
          children: r
        })
      }), i.jsx("p", {
        className: "text-[13px] font-bold text-gray-300",
        children: s
      }), i.jsx("p", {
        className: "text-[11px] text-gray-500 font-medium",
        children: o
      })]
    })]
  });
}
function Xg({
  title: e,
  desc: t,
  items: n,
  time: r,
  theme: s,
  accent: o,
  progress: l,
  onClick: a
}) {
  return i.jsxs("div", {
    onClick: a,
    className: `group p-5 bg-gradient-to-br ${s} border rounded-2xl relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 cursor-pointer`,
    children: [i.jsx("div", {
      className: "absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"
    }), i.jsxs("div", {
      className: "relative z-10 flex flex-col h-full",
      children: [i.jsx("div", {
        className: "w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md mb-4 border border-white/10",
        children: i.jsx(Un, {
          className: "w-4 h-4 text-white"
        })
      }), i.jsx("h4", {
        className: "text-[15px] font-bold text-white mb-2 leading-tight",
        children: e
      }), i.jsx("p", {
        className: "text-[12px] text-gray-400 mb-6 flex-1 line-clamp-2 leading-relaxed",
        children: t
      }), i.jsxs("div", {
        className: "flex items-center gap-2 text-[11px] text-gray-400 font-medium mb-3",
        children: [i.jsx("span", {
          className: "text-white",
          children: n
        }), " • ", i.jsx("span", {
          children: r
        })]
      }), i.jsx("div", {
        className: "w-full h-1 bg-white/10 rounded-full overflow-hidden",
        children: i.jsx("div", {
          className: `h-full ${o} ${l} rounded-full`
        })
      })]
    })]
  });
}
function Gg({
  icon: e,
  color: t,
  bg: n,
  action: r,
  target: s,
  context: o,
  time: l,
  onOpen: a,
  onDelete: u
}) {
  return i.jsxs("div", {
    className: "flex items-center gap-4 p-2.5 hover:bg-white/[0.02] rounded-xl transition-colors cursor-pointer group",
    children: [i.jsx("div", {
      className: `w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n}`,
      children: i.jsx(e, {
        className: `w-3.5 h-3.5 ${t}`
      })
    }), i.jsx("button", {
      onClick: a,
      className: "flex-1 min-w-0 text-left",
      children: i.jsxs("p", {
        className: "text-[13px] text-gray-400 truncate",
        children: [r, " ", i.jsx("span", {
          className: "text-blue-400 group-hover:underline",
          children: s
        }), " • ", i.jsx("span", {
          className: "text-gray-500",
          children: o
        })]
      })
    }), i.jsx("span", {
      className: "text-[11px] text-gray-500 shrink-0",
      children: l
    }), u && i.jsx("button", {
      onClick: d => {
        d.stopPropagation(), u();
      },
      className: "rounded-lg p-1 text-gray-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100",
      title: "Delete saved item",
      children: i.jsx(Am, {
        size: 13
      })
    })]
  });
}
function Ot({
  text: e,
  onClick: t
}) {
  return i.jsxs("button", {
    onClick: () => t == null ? void 0 : t(e),
    className: "w-full flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] rounded-xl transition-colors group text-left",
    children: [i.jsx("div", {
      className: "w-5 h-5 rounded-md bg-white/[0.05] flex items-center justify-center shrink-0 border border-white/[0.05]",
      children: i.jsx(da, {
        className: "w-3 h-3 text-gray-400 group-hover:text-blue-400 transition-colors"
      })
    }), i.jsx("span", {
      className: "text-[12px] text-gray-300 group-hover:text-white transition-colors truncate",
      children: e
    })]
  });
}
function Yg({
  onNavigate: e
}) {
  console.log("🚀 ADAPTIVE WORKSPACE ACTIVE (v2.0.1)");
  const t = () => {
      if (console.log("🚀 CLICK: Aide button clicked"), typeof chrome < "u" && chrome.scripting && chrome.tabs) {
        const r = chrome.runtime.getURL("index.html?mode=sidebar");
        chrome.tabs.query({
          active: !0,
          currentWindow: !0
        }, s => {
          if (!s || !s[0]) return;
          const o = s[0].id;
          chrome.scripting.executeScript({
            target: {
              tabId: o
            },
            func: l => {
              const a = "ff-floating-panel",
                u = "ff-floating-fab",
                d = document.getElementById(a);
              d && d.remove();
              const c = document.getElementById(u);
              c && c.remove();
              const h = 480,
                x = "100vh",
                v = document.createElement("div");
              v.id = a, v.style.cssText = ["position:fixed", "top:0", "right:0", `width:${h}px`, `height:${x}`, "z-index:2147483647", "display:flex", "flex-direction:column", "border-radius:0", "border-left:1px solid rgba(255,255,255,0.08)", "box-shadow:0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)", "background:rgba(5, 8, 22, 0.85)", "backdrop-filter:blur(30px) saturate(150%)", 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', "transition:transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease", "overflow:hidden"].join(";");
              const g = document.createElement("div");
              g.style.cssText = ["height:56px", "min-height:56px", "background:transparent", "display:flex", "align-items:center", "padding:0 20px", "gap:12px", "cursor:grab", "flex-shrink:0", "user-select:none"].join(";");
              const y = document.createElement("div");
              y.style.cssText = "display:flex;flex-direction:column;flex:1";
              const S = document.createElement("div");
              S.style.cssText = "display:flex;align-items:center;gap:8px";
              const m = document.createElement("img");
              m.src = chrome.runtime.getURL("icon.png"), m.style.cssText = "width:32px;height:32px;object-fit:contain;display:block;border-radius:8px;", m.alt = "FocusFlow";
              const p = document.createElement("span");
              p.style.cssText = "font-size:14px;font-weight:900;color:rgba(255,255,255,0.9);letter-spacing:-0.2px", p.innerHTML = 'FocusFlow <span style="color:#4F8CFF">AI</span>';
              const f = document.createElement("div");
              f.style.cssText = "display:flex;align-items:center;gap:6px;margin-top:2px";
              const w = document.createElement("div");
              w.style.cssText = "width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981";
              const j = document.createElement("span");
              j.style.cssText = "font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:1px", j.textContent = "Ready", S.append(m, p), f.append(w, j), y.append(S, f);
              const A = document.createElement("div");
              A.style.cssText = "display:flex;align-items:center;gap:4px";
              const _ = document.createElement("button");
              _.style.cssText = "background:rgba(255,255,255,0.05);border:none;color:rgba(255,255,255,0.4);border-radius:8px;width:28px;height:28px;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s", _.textContent = "−", _.onmouseenter = () => _.style.background = "rgba(255,255,255,0.1)", _.onmouseleave = () => _.style.background = "rgba(255,255,255,0.05)", _.onclick = () => {
                v.style.transform = "translate(100%, 0) scale(0.9)", v.style.opacity = "0", setTimeout(() => {
                  v.style.display = "none";
                  const z = document.getElementById(u);
                  z && (z.style.display = "flex");
                }, 400);
              };
              const P = document.createElement("button");
              P.style.cssText = "background:rgba(255,255,255,0.05);border:none;color:rgba(255,255,255,0.4);border-radius:8px;width:28px;height:28px;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s", P.textContent = "✕", P.onmouseenter = () => {
                P.style.background = "rgba(220,38,38,0.2)", P.style.color = "#fff";
              }, P.onmouseleave = () => {
                P.style.background = "rgba(255,255,255,0.05)", P.style.color = "rgba(255,255,255,0.4)";
              }, P.onclick = () => {
                v.style.transform = "translateY(20px) scale(0.95)", v.style.opacity = "0", setTimeout(() => v.remove(), 300);
              }, A.append(_, P), g.append(y, A);
              let U = !1,
                F,
                Q,
                ce,
                G,
                ne = 0,
                T = 0;
              g.addEventListener("mousedown", z => {
                z.target.tagName !== "BUTTON" && (ce = z.clientX - ne, G = z.clientY - T, U = !0, g.style.cursor = "grabbing");
              }), window.addEventListener("mousemove", z => {
                U && (z.preventDefault(), F = z.clientX - ce, Q = z.clientY - G, ne = F, T = Q, v.style.transform = `translate(${F}px, ${Q}px)`);
              }), window.addEventListener("mouseup", () => {
                U = !1, g.style.cursor = "grab";
              });
              const L = document.createElement("iframe");
              L.src = l, L.style.cssText = "flex:1;width:100%;border:none;background:transparent;display:block", L.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
              const I = document.createElement("div");
              I.style.cssText = "position:absolute;left:0;top:0;width:6px;height:100%;cursor:ew-resize;z-index:2147483648";
              let C = !1;
              I.addEventListener("mousedown", z => {
                C = !0, document.body.style.cursor = "ew-resize";
              }), window.addEventListener("mousemove", z => {
                if (C) {
                  const B = window.innerWidth - z.clientX;
                  B >= 420 && B <= 850 && (v.style.width = `${B}px`);
                }
              }), window.addEventListener("mouseup", () => {
                C = !1, document.body.style.cursor = "default";
              }), v.append(g, L, I), document.body.appendChild(v);
              const b = document.createElement("button");
              b.id = u, b.style.cssText = ["position:fixed", "bottom:40px", "right:40px", "width:64px", "height:64px", "border-radius:18px", "background:#0d1117", "border:1.5px solid rgba(100,80,255,0.3)", "cursor:pointer", "z-index:2147483646", "box-shadow:0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(99,66,255,0.25)", "display:none", "align-items:center", "justify-content:center", "transition:transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"].join(";"), b.innerHTML = `<img src="${chrome.runtime.getURL("icon.png")}" style="width:56px;height:56px;object-fit:contain;display:block;border-radius:14px;" alt="FocusFlow" />`;
              const O = document.createElement("style");
              O.textContent = `
              @keyframes orbPulse {
                0% { box-shadow: 0 0 0 0 rgba(79, 140, 255, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(79, 140, 255, 0); }
                100% { box-shadow: 0 0 0 0 rgba(79, 140, 255, 0); }
              }
              #ff-floating-fab:hover { animation: orbPulse 1.5s infinite; }
            `, document.head.appendChild(O), b.onmouseenter = () => b.style.transform = "scale(1.1) rotate(5deg)", b.onmouseleave = () => b.style.transform = "scale(1) rotate(0deg)", b.onclick = () => {
                v.style.display = "flex", setTimeout(() => {
                  v.style.transform = "translate(0, 0) scale(1)", v.style.opacity = "1";
                }, 10), b.style.display = "none";
              }, document.body.appendChild(b);
            },
            args: [r]
          }).catch(l => console.error("FocusFlow: executeScript failed", l)), setTimeout(() => window.close(), 100);
        });
      } else e && e("aide");
    },
    n = () => {
      console.log("🚀 CLICK: Research Hub button clicked"), chrome && chrome.tabs ? (chrome.tabs.create({
        url: chrome.runtime.getURL("index.html#research")
      }), window.close()) : e && e("research");
    };
  return i.jsxs("div", {
    className: "w-[320px] h-[440px] flex flex-col bg-[#03040b] text-white font-sans overflow-hidden",
    children: [i.jsx("div", {
      className: "absolute top-0 right-0 w-32 h-32 bg-blue-600/15 blur-[60px] -z-10"
    }), i.jsx("div", {
      className: "absolute bottom-0 left-0 w-32 h-32 bg-violet-600/10 blur-[60px] -z-10"
    }), i.jsx("div", {
      className: "pt-10 pb-6 px-7",
      children: i.jsx("div", {
        className: "flex items-center justify-between mb-4",
        children: i.jsxs("div", {
          className: "flex items-center gap-3.5",
          children: [i.jsx("img", {
            src: "icon.png",
            alt: "FocusFlow",
            className: "w-12 h-12 object-contain rounded-2xl"
          }), i.jsxs("div", {
            children: [i.jsx("h1", {
              className: "text-xl font-black text-white tracking-tighter leading-none uppercase",
              children: "FocusFlow"
            }), i.jsxs("div", {
              className: "flex items-center gap-1.5 mt-1.5",
              children: [i.jsx(bm, {
                className: "w-3 h-3 text-emerald-500"
              }), i.jsx("p", {
                className: "text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]",
                children: "Enterprise AI"
              })]
            })]
          })]
        })
      })
    }), i.jsxs("div", {
      className: "flex-1 px-6 py-2 space-y-5",
      children: [i.jsxs("button", {
        onClick: t,
        className: "group relative w-full p-5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-blue-500/30 rounded-[2rem] flex items-center gap-5 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10",
        children: [i.jsx("div", {
          className: "w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500",
          children: i.jsx(qt, {
            className: "w-6 h-6 text-blue-400"
          })
        }), i.jsxs("div", {
          className: "flex-1 text-left",
          children: [i.jsx("h3", {
            className: "text-[14px] font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors",
            children: "Aide Extension"
          }), i.jsx("p", {
            className: "text-[11px] text-gray-500 font-medium mt-0.5",
            children: "Real-time web synthesis"
          })]
        }), i.jsx(Ru, {
          className: "w-4 h-4 text-gray-700 group-hover:text-blue-400 group-hover:translate-x-1.5 transition-all duration-500"
        })]
      }), i.jsxs("button", {
        onClick: n,
        className: "group relative w-full p-5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-violet-500/30 rounded-[2rem] flex items-center gap-5 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10",
        children: [i.jsx("div", {
          className: "w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-500",
          children: i.jsx(xm, {
            className: "w-6 h-6 text-violet-400"
          })
        }), i.jsxs("div", {
          className: "flex-1 text-left",
          children: [i.jsx("h3", {
            className: "text-[14px] font-black text-white uppercase tracking-tight group-hover:text-violet-400 transition-colors",
            children: "Research Studio"
          }), i.jsx("p", {
            className: "text-[11px] text-gray-500 font-medium mt-0.5",
            children: "Knowledge Operating System"
          })]
        }), i.jsx(Ru, {
          className: "w-4 h-4 text-gray-700 group-hover:text-violet-400 group-hover:translate-x-1.5 transition-all duration-500"
        })]
      })]
    }), i.jsx("div", {
      className: "py-8 flex flex-col items-center",
      children: i.jsxs("div", {
        className: "flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04]",
        children: [i.jsx("div", {
          className: "w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
        }), i.jsx("span", {
          className: "text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]",
          children: "Engine Running"
        })]
      })
    })]
  });
}
console.log("🎯 APP: Loading with mode detection");
function Jg() {
  const [e, t] = E.useState("launcher"),
    [n, r] = E.useState("popup");
  return E.useEffect(() => {
    const s = new URLSearchParams(window.location.search),
      o = window.location.hash.slice(1);
    s.get("mode") === "sidebar" ? (r("sidebar"), t("aide"), document.body.className = "sidebar-mode") : o === "research" ? (r("workspace"), t("research"), document.body.className = "workspace-mode") : (r("popup"), t("launcher"), document.body.className = "popup-mode");
  }, []), n === "sidebar" ? i.jsx(Rg, {}) : n === "workspace" ? i.jsx(Kg, {}) : n === "popup" ? i.jsx(Yg, {}) : i.jsx("div", {
    className: "w-full h-full bg-[#050816] text-white flex items-center justify-center",
    children: i.jsxs("div", {
      className: "text-center",
      children: [i.jsx("h1", {
        className: "text-2xl font-bold mb-2",
        children: "FocusFlow AI"
      }), i.jsx("p", {
        className: "text-gray-400",
        children: "Loading..."
      })]
    })
  });
}
function Zg() {
  return i.jsx(Bm, {
    children: i.jsx(Jg, {})
  });
}
window.FOCUSFLOW_RENDER_STATUS = "loading";
console.log("🚀 FocusFlow AI: Starting React mount", {
  rootElement: document.getElementById("root"),
  timestamp: Date.now(),
  userAgent: navigator.userAgent
});
try {
  fl.createRoot(document.getElementById("root")).render(i.jsx(up.StrictMode, {
    children: i.jsx(Zg, {})
  })), window.FOCUSFLOW_RENDER_STATUS = "mounted", console.log("✅ FocusFlow AI: React app mounted successfully", {
    status: "mounted",
    timestamp: Date.now()
  });
} catch (e) {
  window.FOCUSFLOW_RENDER_STATUS = "failed", console.error("❌ FocusFlow AI: React mount failed", {
    error: e.message,
    stack: e.stack,
    timestamp: Date.now()
  });
}
