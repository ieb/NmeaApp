"use strict";

require("core-js/modules/es6.symbol.js");
require("core-js/modules/es6.number.constructor.js");
require("core-js/modules/es6.object.define-property.js");
require("core-js/modules/es6.object.set-prototype-of.js");
require("core-js/modules/es6.function.bind.js");
require("core-js/modules/es6.object.get-prototype-of.js");
require("core-js/modules/es6.reflect.construct.js");
require("core-js/modules/es6.object.create.js");
require("core-js/modules/es6.string.iterator.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowLayout = exports.EInkUpdater = exports.EInkUIController = exports.EInkTextBox = exports.EInkTemperature = exports.EInkSys = exports.EInkStats = exports.EInkSpeed = exports.EInkRelativeAngle = exports.EInkRatio = exports.EInkPossition = exports.EInkPilot = exports.EInkLog = exports.EInkFix = exports.EInkEngineStatus = exports.EInkDrawingContext = exports.EInkDistance = exports.EInkDataStoreFactory = exports.EInkCurrent = exports.EInkCircularStats = exports.EInkBearing = exports.EInkAttitude = void 0;
require("core-js/modules/es6.date.now.js");
require("core-js/modules/es6.object.to-string.js");
require("core-js/modules/es6.array.iterator.js");
require("core-js/modules/web.dom.iterable.js");
require("core-js/modules/es6.regexp.split.js");
require("core-js/modules/es6.string.starts-with.js");
require("core-js/modules/es6.string.ends-with.js");
require("core-js/modules/es6.array.slice.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
var EInkUIController = /*#__PURE__*/_createClass(function EInkUIController(options) {
  _classCallCheck(this, EInkUIController);
  this.drawingContext = options.context;
  this.rotateControl = options.rotateControl;
  this.pageControl = options.pageControl;
  this.themeControl = options.themeControl;
  this.themes = options.themes;
  this.rotation = false;
  this.theme = 0;
  var that = this;
  if (this.rotateControl) {
    this.rotateControl.addEventListener("click", function (event) {
      that.rotation = !that.rotation;
      that.drawingContext.setOrientation(that.rotation);
      console.log("Rotate Click");
    });
  }
  if (this.pageControl) {
    this.pageControl.addEventListener("click", function (event) {
      that.drawingContext.nextPage();
      console.log("Page Click");
    });
  }
  if (this.themeControl) {
    this.themeControl.addEventListener("click", function (event) {
      that.theme++;
      if (that.theme === that.themes.length) {
        that.theme = 0;
      }
      that.drawingContext.setTheme(that.themes[that.theme]);
      console.log(that.themes[that.theme]);
    });
  }

  // Kindle 1st gen doesnt have a viable mouse, so there is no need to support this on a gen 1 kindle device
  // paperwhite browser has a thouch screen and has zones to tap for page turns.
  // andriod and other browsers have touch support or mouse.
  // not supporting iphone as the devices are simply to expensive to support, might work, might not.
  var startX, startY, startTouch;
  this.drawingContext.canvas.addEventListener("touchstart", function (event) {
    startX = event.touches[0].pageX;
    startY = event.touches[0].pageY;
    startTouch = new Date().getTime();
  });
  this.drawingContext.canvas.addEventListener("touchmove", function (event) {
    event.preventDefault();
  });
  this.drawingContext.canvas.addEventListener("touchend", function (event) {
    var moveX = startX - event.changedTouches[0].pageX;
    var moveY = startY - event.changedTouches[0].pageY;
    var elapsed = new Date().getTime() - startTouch;
    if (elapsed < 1000) {
      if (Math.abs(moveX) > 150 && Math.abs(moveY) < 100) {
        if (moveX > 0) {
          that.drawingContext.nextPage();
        } else {
          that.drawingContext.prevPage();
        }
      } else if (Math.abs(moveY) > 150 && Math.abs(moveX) < 100) {
        that.theme++;
        if (that.theme === that.themes.length) {
          that.theme = 0;
        }
        that.drawingContext.setTheme(that.themes[that.theme]);
      }
    }
  });
  var mouseStartX, mouseStartY, startMouse;
  this.drawingContext.canvas.addEventListener("mousedown", function (event) {
    mouseStartX = event.pageX;
    mouseStartY = event.pageY;
    startMouse = new Date().getTime();
  });
  this.drawingContext.canvas.addEventListener("mousemove", function (event) {
    event.preventDefault();
  });
  this.drawingContext.canvas.addEventListener("mouseup", function (event) {
    var moveX = mouseStartX - event.pageX;
    var moveY = mouseStartY - event.pageY;
    var elapsed = new Date().getTime() - startMouse;
    if (elapsed < 1000) {
      if (Math.abs(moveX) > 150 && Math.abs(moveY) < 100) {
        if (moveX > 0) {
          that.drawingContext.nextPage();
        } else {
          that.drawingContext.prevPage();
        }
      } else if (Math.abs(moveY) > 150 && Math.abs(moveX) < 100) {
        that.theme++;
        if (that.theme === that.themes.length) {
          that.theme = 0;
        }
        that.drawingContext.setTheme(that.themes[that.theme]);
      }
    }
  });
});
exports.EInkUIController = EInkUIController;
;
var EInkDataStoreFactory = /*#__PURE__*/_createClass(function EInkDataStoreFactory(options) {
  _classCallCheck(this, EInkDataStoreFactory);
  _defineProperty(this, "getStore", function (d, path) {
    if (d && !this.dataStores[path]) {
      if (d.meta !== undefined && d.meta.units === "rad") {
        this.dataStores[path] = new EInkCircularStats();
      } else {
        this.dataStores[path] = new EInkStats();
      }
    }
    return this.dataStores[path];
  });
  this.dataStores = {};
});
exports.EInkDataStoreFactory = EInkDataStoreFactory;
var FlowLayout = /*#__PURE__*/function () {
  function FlowLayout(rows, cols) {
    _classCallCheck(this, FlowLayout);
    this.rows = rows;
    this.cols = cols;
    this.row = 0;
    this.col = 0;
    this.page = -1;
    this.pages = [];
    this.newPage();
  }
  _createClass(FlowLayout, [{
    key: "append",
    value: function append(box) {
      this.pages[this.page].push(box);
      box.x = this.col;
      box.y = this.row;
      this.next();
    }
  }, {
    key: "setPageSize",
    value: function setPageSize(w, h) {
      for (var p = 0; p < this.pages.length; p++) {
        for (var i = 0; i < this.pages[p].length; i++) {
          this.pages[p][i].setSize(this.cols, this.rows, w, h);
        }
      }
    }
  }, {
    key: "setPageTitle",
    value: function setPageTitle(title) {
      this.pages[this.page].title = title;
    }
  }, {
    key: "newPage",
    value: function newPage() {
      this.page++;
      this.row = 0;
      this.col = 0;
      this.pages[this.page] = [];
      this.setPageTitle("Page " + this.page);
    }
  }, {
    key: "next",
    value: function next() {
      this.col++;
      if (this.col >= this.cols) {
        this.col = 0;
        this.row++;
        if (this.row >= this.rows) {
          this.newPage();
        }
      }
    }
  }]);
  return FlowLayout;
}();
exports.FlowLayout = FlowLayout;
var EInkDrawingContext = /*#__PURE__*/function (_React$Component) {
  _inherits(EInkDrawingContext, _React$Component);
  var _super = _createSuper(EInkDrawingContext);
  function EInkDrawingContext(options) {
    var _this;
    _classCallCheck(this, EInkDrawingContext);
    _this.dataStoreFactory = new EInkDataStoreFactory();
    _this.canvas = options.canvas;
    _this.body = options.body;
    _this.themes = options.themes || {};
    _this.layout = options.layout;
    _this.page = 0;
    _this.ctx = canvas.getContext("2d");
    _this.setTheme(options.theme || "default");
    if (options.width == undefined || options.width === "100%") {
      options.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    }
    if (options.height === undefined || options.height === "100%") {
      options.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    /*
    May need this for kindle or a fixed size
    var win = window,
        doc = document,
        docElem = doc.documentElement,
        body = doc.getElementsByTagName('body')[0],
        x = win.innerWidth || docElem.clientWidth || body.clientWidth,
        y = win.innerHeight|| docElem.clientHeight|| body.clientHeight;
    alert(x + ' × ' + y);
    */
    //console.log("Width ",  options.width, "Height", options.height);
    _this.setOrientation(options.portrait, options.width, options.height);
    return _possibleConstructorReturn(_this);
  }
  _createClass(EInkDrawingContext, [{
    key: "setOrientation",
    value: function setOrientation(portrait, width, height) {
      this.width = width || this.width;
      this.height = height || this.height;
      if (portrait) {
        this.canvas.setAttribute("width", this.width + "px");
        this.canvas.setAttribute("height", this.height + "px");
        this.ctx.translate(10, 10);
        this.layout.setPageSize(this.width, this.height);
      } else {
        this.canvas.setAttribute("width", this.height + "px");
        this.canvas.setAttribute("height", this.width + "px");
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.translate(-this.width + 10, 10);
        this.layout.setPageSize(this.height, this.width);
      }
    }
  }, {
    key: "nextPage",
    value: function nextPage() {
      this.page++;
      if (this.page >= this.layout.pages.length) {
        this.page = 0;
      }
      this.body.setAttribute("style", "background-color:" + this.theme.background);
      this.canvas.setAttribute("style", "background-color:" + this.theme.background);
      this.ctx.clearRect(-10, -10, this.width + 10, this.height + 10);
      this.render();
    }
  }, {
    key: "prevPage",
    value: function prevPage() {
      this.page--;
      if (this.page < 0) {
        this.page = this.layout.pages.length - 1;
      }
      this.body.setAttribute("style", "background-color:" + this.theme.background);
      this.canvas.setAttribute("style", "background-color:" + this.theme.background);
      this.ctx.clearRect(-10, -10, this.width + 10, this.height + 10);
      this.render();
    }
  }, {
    key: "setTheme",
    value: function setTheme(theme) {
      if (this.themeName != theme) {
        this.theme = this.themes[theme];
        this.themeName = theme;
        this.body.setAttribute("style", "background-color:" + this.theme.background);
        this.canvas.setAttribute("style", "background-color:" + this.theme.background);
        this.ctx.clearRect(-10, -10, this.width + 10, this.height + 10);
        this.render();
      }
    }
  }, {
    key: "update",
    value: function update(state) {
      for (var p = 0; p < this.layout.pages.length; p++) {
        for (var i = 0; i < this.layout.pages[p].length; i++) {
          try {
            this.layout.pages[p][i].update(state, this.dataStoreFactory);
          } catch (e) {
            console.log("Error " + e);
          }
        }
      }
      this.render();
    }
  }, {
    key: "render",
    value: function render() {
      for (var i = 0; i < this.layout.pages[this.page].length; i++) {
        try {
          this.layout.pages[this.page][i].render(this.ctx, this.theme, this.dataStoreFactory);
        } catch (e) {
          console.log("Error " + e);
        }
      }
      ;
    }
  }]);
  return EInkDrawingContext;
}(React.Component);
exports.EInkDrawingContext = EInkDrawingContext;
;
var EInkUpdater = /*#__PURE__*/function () {
  function EInkUpdater(options) {
    _classCallCheck(this, EInkUpdater);
    this.url = options.url;
    this.period = options.period;
    if (isKindle) {
      this.period = Math.max(this.period, 2000);
    }
    this.calculations = options.calculations || {
      enhance: function enhance() {}
    };
    this.context = options.context;
    if (!XMLHttpRequest.DONE) {
      XMLHttpRequest.UNSENT = XMLHttpRequest.UNSENT || 0;
      XMLHttpRequest.OPENED = XMLHttpRequest.OPENED || 1;
      XMLHttpRequest.HEADERS_RECEIVED = XMLHttpRequest.HEADERS_RECEIVED || 2;
      XMLHttpRequest.LOADING = XMLHttpRequest.LOADING || 3;
      XMLHttpRequest.DONE = XMLHttpRequest.DONE || 4;
    }
    if (this.period) {
      var that = this;
      console.log(this.period);
      setInterval(function () {
        try {
          that.update();
        } catch (e) {
          console.log("error " + e);
        }
      }, this.period);
    }
  }
  _createClass(EInkUpdater, [{
    key: "update",
    value: function update() {
      return;
      // This comes from the data model.
      var that = this;
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            var start = Date.now();
            var state = JSON.parse(httpRequest.responseText);
            state._ts = new Date().getTime();
            Calcs.prototype.save(state, 'sys.updateTime', that.updateTime, new Date(), "ms", "Timetaken to process update", true);
            that.calculations.enhance(state);
            that.context.update(state);
            that.updateTime = Date.now() - start;
          }
        }
      };
      httpRequest.open('GET', this.url);
      httpRequest.send();
    }
  }]);
  return EInkUpdater;
}(); // stats classes -------------------------------------
exports.EInkUpdater = EInkUpdater;
var EInkStats = /*#__PURE__*/function () {
  function EInkStats(options) {
    _classCallCheck(this, EInkStats);
    this.withStats = true;
    this._ts = 0;
    this.currentValue = 0.0;
    this.values = [];
    this.mean = 0;
    this.max = 0;
    this.min = 0;
    this.stdev = 0;
  }
  _createClass(EInkStats, [{
    key: "doUpdate",
    value: function doUpdate(state) {
      if (!state._ts) {
        state._ts = new Date().getTime();
      }
      if (this._ts === state.ts) {
        return false;
      }
      this._ts = state._ts;
      return true;
    }
  }, {
    key: "updateValues",
    value: function updateValues(v, state) {
      if (!this.doUpdate(state)) {
        return;
      }
      this.currentValue = v;
      if (!this.withStats) {
        return;
      }
      this.values.push(v);
      while (this.values.length > 100) {
        this.values.shift();
      }
      var s = 0.0;
      var n = 0.0;
      for (var i = 0; i < this.values.length; i++) {
        w = (i + 1) / 2;
        s += this.values[i] * w;
        n += w;
      }
      this.mean = s / n;
      s = 0.0;
      n = 0.0;
      for (var i = 0; i < this.values.length; i++) {
        w = (i + 1) / 2;
        s += (this.values[i] - this.mean) * (this.values[i] - this.mean) * w;
        n += w;
      }
      this.stdev = Math.sqrt(s / n);
      this.min = this.mean;
      this.max = this.mean;
      for (var i = this.values.length - 1; i >= 0; i--) {
        this.min = Math.min(this.values[i], this.min);
      }
      ;
      for (var i = this.values.length - 1; i >= 0; i--) {
        this.max = Math.max(this.values[i], this.max);
      }
      ;
    }
  }]);
  return EInkStats;
}();
exports.EInkStats = EInkStats;
var EInkCircularStats = /*#__PURE__*/function (_EInkStats) {
  _inherits(EInkCircularStats, _EInkStats);
  var _super2 = _createSuper(EInkCircularStats);
  function EInkCircularStats(options) {
    var _this2;
    _classCallCheck(this, EInkCircularStats);
    _this2 = _super2.call(this, options);
    _this2.sinvalues = [];
    _this2.cosvalues = [];
    return _this2;
  }
  _createClass(EInkCircularStats, [{
    key: "updateValues",
    value: function updateValues(v, state) {
      if (!this.doUpdate(state)) {
        return;
      }
      this.currentValue = v;
      if (!this.withStats) {
        return;
      }
      this.values.push(v);
      while (this.values.length > 100) {
        this.values.shift();
      }
      this.sinvalues.push(Math.sin(v));
      while (this.sinvalues.length > 100) {
        this.sinvalues.shift();
      }
      this.cosvalues.push(Math.cos(v));
      while (this.cosvalues.length > 100) {
        this.cosvalues.shift();
      }
      var s = 0.0,
        c = 0.0;
      var n = 0.0;
      for (var i = 0; i < this.values.length; i++) {
        w = (i + 1) / 2;
        s += this.sinvalues[i] * w;
        c += this.cosvalues[i] * w;
        n += w;
      }
      this.mean = Math.atan2(s / n, c / n);

      // probably not the right way of calculating a SD of a circular
      // value, however it does produces a viable result.
      // other methods are estimates.
      // Not 100% certain about the weighting here.
      s = 0.0;
      n = 0.0;
      for (var i = 0; i < this.values.length; i++) {
        w = (i + 1) / 2;
        a = this.values[i] - this.mean;
        // find the smallest sweep from the mean.
        if (a > Math.PI) {
          a = a - 2 * Math.PI;
        } else if (a < -Math.PI) {
          a = a + 2 * Math.PI;
        }
        s += a * a * w;
        n += w;
      }
      this.stdev = Math.sqrt(s / n);
      this.min = this.mean;
      this.max = this.mean;
      for (var i = this.values.length - 1; i >= 0; i--) {
        this.min = Math.min(this.values[i], this.min);
      }
      ;
      for (var i = this.values.length - 1; i >= 0; i--) {
        this.max = Math.max(this.values[i], this.max);
      }
      ;
    }
  }]);
  return EInkCircularStats;
}(EInkStats); // UI classes -------------------------------------
exports.EInkCircularStats = EInkCircularStats;
var EInkTextBox = /*#__PURE__*/function () {
  function EInkTextBox(options) {
    _classCallCheck(this, EInkTextBox);
    this.options = options;
    this.path = options.path;
    this.pathElements = options.path.split(".");
    this.labels = options.labels || {};
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.displayUnits = options.displayUnits || "";
    this.displayPositive = options.displayPositive;
    this.displayNegative = options.displayNegative;
    this.withStats = options.withStats === undefined ? true : options.withStats;
    this.scale = options.scale || 1;
    this.offset = options.offset || 0;
    this.precision = options.precision === undefined ? 1 : options.precision;
    this.out = "no data";
    this.data = undefined;
    this.suppliedDisplayFn = options.suppliedDisplayFn;
    this.dims = {
      w: 10,
      h: 10,
      t: 0,
      l: 0
    };
    if (this.withStats) {
      this.outmean = "-";
      this.outstdev = "-";
      this.outmax = "-";
      this.outmin = "-";
    }
  }
  _createClass(EInkTextBox, [{
    key: "resolve",
    value: function resolve(state, path) {
      var pathElements = this.pathElements;
      if (path) {
        pathElements = path.split(".");
      }
      var n = state;
      for (var i = 0; n && i < pathElements.length; i++) {
        if (pathElements[i].startsWith("[") && pathElements[i].endsWith("]")) {
          var filterElements = pathElements[i].slice(1, -1).split(",");
          var filters = [];
          var debug = false;
          for (var j = 0; j < filterElements.length; j++) {
            if (filterElements[j] == "debug") {
              debug = true;
            } else {
              filters.push(filterElements[j].split("=="));
            }
          }
          if (debug) {
            console.log("Processed Filter ", filters);
          }
          var nextN = undefined;
          for (var k in n) {
            if (debug) {
              console.log("checking ", n, k[n]);
            }
            var matches = 0;
            for (var j = 0; j < filters.length; j++) {
              if (n[k][filters[j][0]] == filters[j][1]) {
                matches++;
              }
            }
            if (matches == filters.length) {
              if (debug) {
                console.log(n[k], "hit", matches);
              }
              nextN = n[k];
              break;
            } else {
              if (debug) {
                console.log(n[k], "miss", matches);
              }
            }
          }
          n = nextN;
        } else {
          n = n[pathElements[i]];
        }
      }
      if (n !== undefined && _typeof(n) !== "object") {
        return {
          value: n,
          meta: this.meta
        };
      }
      return n;
    }
  }, {
    key: "toDispay",
    value: function toDispay(v, precision, displayUnits, neg, pos) {
      var dis = displayUnits === undefined ? this.displayUnits : displayUnits;
      var neg = neg === undefined ? this.displayNegative : neg;
      var pos = pos === undefined ? this.displayPositive : pos;
      var res = v.toFixed(precision === undefined ? this.precision : precision);
      if (neg && res < 0) {
        res = -res;
        res = neg + res + dis;
      } else if (pos && res > 0) {
        res = pos + res + dis;
      } else {
        res = res + dis;
      }
      return res;
    }
  }, {
    key: "formatOutput",
    value: function formatOutput(data, scale, precision, offset) {
      if (this.suppliedDisplayFn) {
        return this.suppliedDisplayFn(data);
      }
      scale = scale || this.scale;
      offset = offset || this.offset;
      if (!this.withStats) {
        this.out = this.toDispay(data.currentValue * scale + offset, precision);
      } else {
        this.out = this.toDispay(data.currentValue * scale + offset, precision);
        this.outmax = this.toDispay(data.max * scale + offset, precision);
        this.outmin = this.toDispay(data.min * scale + offset, precision);
        this.outmean = "\u03BC " + this.toDispay(data.mean * scale + offset, precision);
        this.outstdev = "\u03C3 " + this.toDispay(data.stdev * scale, precision, this.displayUnits, "", "");
      }
      return this.out;
    }
  }, {
    key: "setSize",
    value: function setSize(cols, rows, screenWidth, screenHeight) {
      var boxHeightFactor = 1.1; // 10% margin top and bottom of box
      var boxWidthFactor = 2.3 / 2.2; // margin left and right of box
      var boxRatio = 1.2 / 2.2; // ratio of box height to box width
      var fontRatio = 1 / 2.2; // ratio of font height to font width
      var w1 = (screenWidth - 40) / cols;
      var w2 = screenHeight / boxHeightFactor / rows * (1 / boxRatio);
      this.dims.w = Math.min(w1, w2);
      this.dims.sz = this.dims.w * fontRatio;
      this.dims.h = this.dims.w * boxRatio;
      this.dims.t = this.y * this.dims.h * boxHeightFactor;
      this.dims.l = this.x * this.dims.w * boxWidthFactor;
    }
  }, {
    key: "startDraw",
    value: function startDraw(ctx, theme) {
      ctx.translate(this.dims.l, this.dims.t);
      ctx.beginPath();
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, this.dims.w, this.dims.h);
      ctx.strokeRect(0, 0, this.dims.w, this.dims.h);
      ctx.fillStyle = theme.foreground;
      ctx.strokeStyle = theme.foreground;
    }
  }, {
    key: "endDraw",
    value: function endDraw(ctx) {
      ctx.translate(-this.dims.l, -this.dims.t);
    }
  }, {
    key: "twoLineLeft",
    value: function twoLineLeft(ctx, l1, l2) {
      ctx.font = this.dims.sz / 3 + "px arial";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText(l1, this.dims.w * 0.1, this.dims.h * 0.2 + this.dims.sz / 3);
      ctx.fillText(l2, this.dims.w * 0.1, this.dims.h * 0.2 + 2 * this.dims.sz / 3);
    }
  }, {
    key: "twoLineRight",
    value: function twoLineRight(ctx, l1, l2) {
      ctx.font = this.dims.sz / 3 + "px arial";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "right";
      ctx.fillText(l1, this.dims.w * 0.95, this.dims.h * 0.2 + this.dims.sz / 3);
      ctx.fillText(l2, this.dims.w * 0.95, this.dims.h * 0.2 + 2 * this.dims.sz / 3);
    }
  }, {
    key: "baseLine",
    value: function baseLine(ctx, l, r) {
      ctx.textBaseline = "bottom";
      ctx.font = this.dims.sz / 4 + "px arial";
      if (l) {
        ctx.textAlign = "left";
        ctx.fillText(l, this.dims.w * 0.05, this.dims.h);
      }
      if (r) {
        ctx.textAlign = "right";
        ctx.fillText(r, this.dims.w * 0.95, this.dims.h);
      }
    }
  }, {
    key: "update",
    value: function update(state, dataStoreFactory) {
      var d = this.resolve(state);
      if (!d) {
        return;
      }
      var data = dataStoreFactory.getStore(d, this.path);
      data.updateValues(d.value, state);
    }
  }, {
    key: "render",
    value: function render(ctx, theme, dataStoreFactory) {
      var data = dataStoreFactory.getStore(undefined, this.path);
      if (data) {
        this.formatOutput(data);
      }
      var labels = this.labels;
      this.startDraw(ctx, theme);
      ctx.font = this.dims.sz + "px arial";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "center";
      var txtW = ctx.measureText(this.out).width;
      if (txtW > this.dims.w * 0.8) {
        ctx.font = this.dims.sz * (this.dims.w * 0.8 / txtW) + "px arial";
        ctx.fillText(this.out, this.dims.w * 0.5, this.dims.h * 0.9);
      } else {
        ctx.fillText(this.out, this.dims.w * 0.5, this.dims.h);
      }
      if (labels) {
        ctx.font = this.dims.sz / 4 + "px arial";
        ctx.textAlign = "left";
        if (labels.tl && !this.withStats) {
          ctx.fillText(labels.tl, this.dims.w * 0.05, sz / 4);
        }
        if (labels.bl) {
          ctx.fillText(labels.bl, this.dims.w * 0.05, this.dims.h);
        }
        ctx.textAlign = "right";
        if (labels.tr && !this.withStats) {
          ctx.fillText(labels.tr, this.dims.w * 0.95, this.dims.sz / 4);
        }
        if (labels.br) {
          ctx.fillText(labels.br, this.dims.w * 0.95, this.dims.h);
        }
      }
      if (this.withStats) {
        ctx.textAlign = "left";
        ctx.fillText(this.outmin, this.dims.w * 0.05, this.dims.sz / 4);
        ctx.textAlign = "right";
        ctx.fillText(this.outmax, this.dims.w * 0.95, this.dims.sz / 4);
        ctx.font = this.dims.sz / 8 + "px arial";
        ctx.textAlign = "center";
        ctx.fillText(this.outmean, this.dims.w * 0.5, this.dims.sz / 8);
        ctx.fillText(this.outstdev, this.dims.w * 0.5, this.dims.sz / 4);
      }
      this.endDraw(ctx, this.dims);
    }
  }], [{
    key: "number",
    value: function number(path, name, units, precision, scale, offset) {
      return new EInkTextBox({
        path: path,
        labels: {
          bl: name,
          br: units
        },
        withStats: false,
        scale: scale || 1.0,
        offset: offset || 0,
        precision: precision == undefined ? 2 : precision
      });
    }
  }, {
    key: "text",
    value: function text(path, name, units, displayFn) {
      return new EInkTextBox({
        path: path,
        labels: {
          bl: name,
          br: units
        },
        withStats: false,
        suppliedDisplayFn: displayFn
      });
    }
  }]);
  return EInkTextBox;
}();
exports.EInkTextBox = EInkTextBox;
var EInkEngineStatus = /*#__PURE__*/function (_EInkTextBox) {
  _inherits(EInkEngineStatus, _EInkTextBox);
  var _super3 = _createSuper(EInkEngineStatus);
  function EInkEngineStatus(path) {
    var _this3;
    _classCallCheck(this, EInkEngineStatus);
    _this3 = _super3.call(this, {
      path: path,
      withStats: false
    });
    _this3.engineStatus = undefined;
    return _this3;
  }
  _createClass(EInkEngineStatus, [{
    key: "update",
    value: function update(state, dataStoreFactory) {
      var d = this.resolve(state);
      if (d == undefined) {
        return;
      }
      this.engineStatus = d;
    }
  }, {
    key: "render",
    value: function render(ctx, theme, dataStoreFactory) {
      this.startDraw(ctx, theme);
      ctx.font = this.dims.sz / 2 + "px arial";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      if (this.engineStatus && this.engineStatus.status1 === 0 && this.engineStatus.status2 === 0) {
        ctx.fillText("ok", this.dims.w * 0.5, this.dims.h / 2);
      } else {
        ctx.fillText("alarm", this.dims.w * 0.5, this.dims.h / 2);
      }
      this.baseLine(ctx, "alarm", "status");
      ctx.textAlign = "center";
      ctx.fillText("engine", this.dims.w * 0.5, this.dims.sz / 4);
      this.endDraw(ctx, this.dims);
    }
  }]);
  return EInkEngineStatus;
}(EInkTextBox);
exports.EInkEngineStatus = EInkEngineStatus;
var EInkPilot = /*#__PURE__*/function (_EInkTextBox2) {
  _inherits(EInkPilot, _EInkTextBox2);
  var _super4 = _createSuper(EInkPilot);
  function EInkPilot(x, y) {
    _classCallCheck(this, EInkPilot);
    return _super4.call(this, {
      path: "none",
      x: x,
      y: y,
      withStats: false,
      scale: 180 / Math.PI,
      precision: 0
    });
  }
  _createClass(EInkPilot, [{
    key: "update",
    value: function update(state, dataStoreFactory) {
      // no action as there are no stats stored centrally.
      return;
    }
  }, {
    key: "render",
    value: function render(ctx, state, theme, dataStoreFactory) {
      var heading = "-",
        autoState = "-";
      var d = this.resolve(state, "steering.autopilot.state");
      if (d) {
        autoState = d.value;
        h = this.resolve(state, "steering.autopilot.target.headingMagnetic");
        if (h) {
          heading = this.formatOutput({
            currentValue: h.value
          });
        }
      }
      this.startDraw(ctx, theme);
      ctx.font = this.dims.sz + "px arial";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "center";
      ctx.fillText(heading, dim.w * 0.5, dim.h);
      this.baseLine(ctx, autoState, "deg");
      ctx.textAlign = "center";
      ctx.fillText("pilot", this.dims.w * 0.5, this.dims.sz / 4);
      this.endDraw(ctx);
    }
  }]);
  return EInkPilot;
}(EInkTextBox);
exports.EInkPilot = EInkPilot;
var EInkLog = /*#__PURE__*/function (_EInkTextBox3) {
  _inherits(EInkLog, _EInkTextBox3);
  var _super5 = _createSuper(EInkLog);
  function EInkLog(x, y) {
    _classCallCheck(this, EInkLog);
    return _super5.call(this, {
      path: "none",
      x: x,
      y: y,
      withStats: false,
      scale: 1 / 1852,
      precision: 1
    });
  }
  _createClass(EInkLog, [{
    key: "update",
    value: function update(state, dataStoreFactory) {
      // no action as there are no stats stored centrally.
      return;
    }
  }, {
    key: "render",
    value: function render(ctx, state, theme, dataStoreFactory) {
      // there are 2 paths
      // navigation.trip.log (m)   distance
      // navigation.log (m) distance

      var t = this.resolve(state, "navigation.trip.log");
      var l = this.resolve(state, "navigation.log");
      var trip = "-.-",
        log = "-.-";
      if (t || l) {
        trip = "0.0";
        if (t) {
          trip = this.formatOutput({
            currentValue: t.value
          }, this.scale, 2);
        }
        log = "0.0";
        if (l) {
          log = this.formatOutput({
            currentValue: l.value
          });
        }
      }
      // this will need some adjustment
      this.startDraw(ctx, theme);
      this.twoLineLeft(ctx, "t: " + trip, "l: " + log);
      this.baseLine(ctx, "log", "Nm");
      this.endDraw(ctx);
    }
  }]);
  return EInkLog;
}(EInkTextBox);
exports.EInkLog = EInkLog;
var EInkFix = /*#__PURE__*/function (_EInkTextBox4) {
  _inherits(EInkFix, _EInkTextBox4);
  var _super6 = _createSuper(EInkFix);
  function EInkFix(x, y) {
    _classCallCheck(this, EInkFix);
    return _super6.call(this, {
      path: "none",
      x: x,
      y: y,
      withStats: false,
      scale: 1 / 1852,
      precision: 1
    });
  }
  _createClass(EInkFix, [{
    key: "update",
    value: function update(state, dataStoreFactory) {
      // no action as there are no stats stored centrally.
      return;
    }
  }, {
    key: "render",
    value: function render(ctx, state, theme, dataStoreFactory) {
      /*EInkFix
      navigation.gnss.methodQuality (text) fix
      navigation.gnss.horizontalDilution (float) fix
      navigation.gnss.type (text) fix
      navigation.gnss.satellites (int) fix
      navigation.gnss.integrity (text) fix
       */

      var gnss = "-",
        methodQuality = "-",
        horizontalDilution = "-",
        type = "-",
        satellites = "-",
        integrity = "-";
      if (state && state.navigation && state.navigation.gnss) {
        gnss = state.navigation.gnss;
        methodQuality = gnss.methodQuality ? gnss.methodQuality.value : "-";
        horizontalDilution = gnss.horizontalDilution ? gnss.horizontalDilution.value : "-";
        type = gnss.type ? gnss.type.value : "-";
        satellites = gnss.satellites ? gnss.satellites.value : "-";
        integrity = gnss.integrity ? gnss.integrity.value : "-";
      }

      // this will need some adjustment
      this.startDraw(ctx, theme);
      ctx.font = this.dims.sz / 6 + "px arial";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText(methodQuality, this.dims.w * 0.05, this.dims.sz / 4);
      ctx.fillText("sat:" + satellites, this.dims.w * 0.05, 2 * this.dims.sz / 4);
      ctx.fillText("hdop:" + horizontalDilution, this.dims.w * 0.05, 3 * this.dims.sz / 4);
      ctx.font = this.dims.sz / 6 + "px arial";
      ctx.fillText(type, this.dims.w * 0.05, this.dims.sz);
      this.endDraw(ctx);
    }
  }]);
  return EInkFix;
}(EInkTextBox);
exports.EInkFix = EInkFix;
var EInkPossition = /*#__PURE__*/function (_EInkTextBox5) {
  _inherits(EInkPossition, _EInkTextBox5);
  var _super7 = _createSuper(EInkPossition);
  function EInkPossition(x, y) {
    _classCallCheck(this, EInkPossition);
    return _super7.call(this, {
      path: "none",
      x: x,
      y: y,
      withStats: false,
      scale: 1,
      precision: 1
    });
  }
  _createClass(EInkPossition, [{
    key: "update",
    value: function update(state, dataStoreFactory) {
      // no action as there are no stats stored centrally.
      return;
    }
  }, {
    key: "toLatitude",
    value: function toLatitude(lat) {
      var NS = "N";
      if (lat < 0) {
        lat = -lat;
        NS = "S";
      }
      var d = Math.floor(lat);
      var m = (60 * (lat - d)).toFixed(3);
      return ("00" + d).slice(-2) + "\xB0" + ("00" + m).slice(-6) + "\u2032" + NS;
    }
  }, {
    key: "toLongitude",
    value: function toLongitude(lon) {
      var EW = "E";
      if (lon < 0) {
        lon = -lon;
        EW = "W";
      }
      var d = Math.floor(lon);
      var m = (60 * (lon - d)).toFixed(3);
      return ("000" + d).slice(-3) + "\xB0" + ("00" + m).slice(-6) + "\u2032" + EW;
    }
  }, {
    key: "parseDate",
    value: function parseDate(dateStr) {
      var regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(.*)Z/gm;
      var m;
      if ((m = regex.exec(dateStr)) !== null) {
        var s = Math.floor(m[6]);
        var ms = m[6] - s;
        var date = new Date(Date.UTC(m[1], m[2] - 1, m[3], m[4], m[5], s, ms));
        return date.toUTCString();
      }
      return dateStr;
    }
  }, {
    key: "render",
    value: function render(ctx, state, theme, dataStoreFactory) {
      /*
      EInkPossition
      navigation.position (lat, lon, deg) position
      navigation.datetime (date)
       */

      var lat = "--\xB0--.---\u2032N",
        lon = "---\xB0--.---\u2032W",
        ts = "-";
      if (state && state.navigation && state.navigation.position && state.navigation.position.value) {
        lat = this.toLatitude(state.navigation.position.value.latitude);
        lon = this.toLongitude(state.navigation.position.value.longitude);
      }
      if (state && state.navigation && state.navigation.datetime && state.navigation.datetime.value) {
        ts = this.parseDate(state.navigation.datetime.value);
      }
      // this will need some adjustment

      this.startDraw(ctx, theme);
      this.twoLineRight(ctx, lat, lon);
      ctx.font = this.dims.sz / 7 + "px arial";
      ctx.fillText(ts, this.dims.w * 0.95, this.dims.h * 0.95);
      this.endDraw(ctx);
    }
  }]);
  return EInkPossition;
}(EInkTextBox);
exports.EInkPossition = EInkPossition;
var EInkCurrent = /*#__PURE__*/function (_EInkTextBox6) {
  _inherits(EInkCurrent, _EInkTextBox6);
  var _super8 = _createSuper(EInkCurrent);
  function EInkCurrent(x, y) {
    _classCallCheck(this, EInkCurrent);
    return _super8.call(this, {
      path: "none",
      x: x,
      y: y,
      withStats: false,
      scale: 1,
      precision: 1
    });
  }
  _createClass(EInkCurrent, [{
    key: "update",
    value: function update(state, dataStoreFactory) {
      // no action as there are no stats stored centrally.
      return;
    }
  }, {
    key: "render",
    value: function render(ctx, state, theme, dataStoreFactory) {
      /*
       EInkCurrent
       environment.current (drift (m/s), setTrue (rad))
       */
      var drift = "-",
        set = "-";
      if (state && state.environment && state.environment.current) {
        drift = this.formatOutput({
          currentValue: state.environment.current.value.drift
        }, 1.943844, 1);
        set = this.formatOutput({
          currentValue: state.environment.current.value.setTrue
        }, 180 / Math.PI, 1);
      }

      // this will need some adjustment
      this.startDraw(ctx, theme);
      this.twoLineLeft(ctx, drift + " Kn", set + "\xB0T");
      this.baseLine(ctx, "current");
      this.endDraw(ctx);
    }
  }]);
  return EInkCurrent;
}(EInkTextBox);
exports.EInkCurrent = EInkCurrent;
var EInkAttitude = /*#__PURE__*/function (_EInkTextBox7) {
  _inherits(EInkAttitude, _EInkTextBox7);
  var _super9 = _createSuper(EInkAttitude);
  function EInkAttitude(x, y) {
    _classCallCheck(this, EInkAttitude);
    return _super9.call(this, {
      path: "none",
      x: x,
      y: y,
      withStats: false,
      scale: 180 / Math.PI,
      precision: 1
    });
  }
  _createClass(EInkAttitude, [{
    key: "update",
    value: function update(state, dataStoreFactory) {
      // no action as there are no stats stored centrally.
      return;
    }
  }, {
    key: "render",
    value: function render(ctx, state, theme, dataStoreFactory) {
      /*
       EInkAttitude
       navigation.attitude (roll, pitch, yaw rad)
       */
      var attitude = "-",
        roll = "-",
        pitch = "-",
        yaw = "-";
      if (state && state.navigation && state.navigation.attitude) {
        attitude = state.navigation.attitude;
        roll = this.formatOutput({
          currentValue: attitude.value.roll
        });
        pitch = this.formatOutput({
          currentValue: attitude.value.pitch
        });
        yaw = this.formatOutput({
          currentValue: attitude.value.yaw
        });
      }

      // this will need some adjustment
      this.startDraw(ctx, theme);
      this.twoLineLeft(ctx, "roll:" + roll + "\xB0", "pitch:" + pitch + "\xB0");
      this.baseLine(ctx, "attitude", "deg");
      this.endDraw(ctx);
    }
  }]);
  return EInkAttitude;
}(EInkTextBox);
exports.EInkAttitude = EInkAttitude;
var EInkRelativeAngle = /*#__PURE__*/function (_EInkTextBox8) {
  _inherits(EInkRelativeAngle, _EInkTextBox8);
  var _super10 = _createSuper(EInkRelativeAngle);
  function EInkRelativeAngle(path, label, x, y, precision) {
    _classCallCheck(this, EInkRelativeAngle);
    return _super10.call(this, {
      path: path,
      labels: {
        bl: label,
        br: "deg"
      },
      x: x,
      y: y,
      withStats: true,
      displayUnits: "\xB0",
      displayNegative: "P",
      displayPositive: "S",
      textSize: 3,
      scale: 180 / Math.PI,
      precision: precision == undefined ? 0 : precision
    });
  }
  _createClass(EInkRelativeAngle, [{
    key: "formatOutput",
    value: function formatOutput(data, scale, precision) {
      scale = scale || this.scale;
      if (!this.withStats) {
        this.out = this.toDispay(data.currentValue * scale, precision);
      } else {
        this.out = this.toDispay(data.currentValue * scale, precision);
        this.outmax = this.toDispay(data.max * scale, precision);
        this.outmin = this.toDispay(data.min * scale, precision);
        this.outmean = "\u03BC " + this.toDispay(data.mean * scale, precision);
        this.outstdev = "\u03C3 " + this.toDispay(data.stdev * scale, 1, this.displayUnits, "", "");
      }
      return this.out;
    }
  }]);
  return EInkRelativeAngle;
}(EInkTextBox);
exports.EInkRelativeAngle = EInkRelativeAngle;
var EInkSpeed = /*#__PURE__*/function (_EInkTextBox9) {
  _inherits(EInkSpeed, _EInkTextBox9);
  var _super11 = _createSuper(EInkSpeed);
  function EInkSpeed(path, label, x, y, precision) {
    _classCallCheck(this, EInkSpeed);
    return _super11.call(this, {
      path: path,
      labels: {
        bl: label,
        br: "kn"
      },
      x: x,
      y: y,
      withStats: true,
      scale: 1.943844,
      precision: precision == undefined ? 1 : precision
    });
  }
  return _createClass(EInkSpeed);
}(EInkTextBox);
exports.EInkSpeed = EInkSpeed;
var EInkDistance = /*#__PURE__*/function (_EInkTextBox10) {
  _inherits(EInkDistance, _EInkTextBox10);
  var _super12 = _createSuper(EInkDistance);
  function EInkDistance(path, label, x, y, precision) {
    _classCallCheck(this, EInkDistance);
    return _super12.call(this, {
      path: path,
      labels: {
        bl: label,
        br: "m"
      },
      x: x,
      y: y,
      withStats: true,
      scale: 1,
      precision: precision == undefined ? 1 : precision
    });
  }
  return _createClass(EInkDistance);
}(EInkTextBox);
exports.EInkDistance = EInkDistance;
var EInkBearing = /*#__PURE__*/function (_EInkTextBox11) {
  _inherits(EInkBearing, _EInkTextBox11);
  var _super13 = _createSuper(EInkBearing);
  function EInkBearing(path, label, x, y, precision) {
    _classCallCheck(this, EInkBearing);
    return _super13.call(this, {
      path: path,
      labels: {
        bl: label,
        br: "deg"
      },
      x: x,
      y: y,
      withStats: true,
      scale: 180 / Math.PI,
      precision: precision == undefined ? 0 : precision
    });
  }
  return _createClass(EInkBearing);
}(EInkTextBox); // todo
exports.EInkBearing = EInkBearing;
var EInkTemperature = /*#__PURE__*/function (_EInkTextBox12) {
  _inherits(EInkTemperature, _EInkTextBox12);
  var _super14 = _createSuper(EInkTemperature);
  function EInkTemperature(path, label, x, y, precision) {
    _classCallCheck(this, EInkTemperature);
    return _super14.call(this, {
      path: path,
      labels: {
        bl: label,
        br: "C"
      },
      x: x,
      y: y,
      withStats: true,
      scale: 1,
      precision: precision == undefined ? 1 : precision
    });
  }
  _createClass(EInkTemperature, [{
    key: "formatOutput",
    value: function formatOutput(data) {
      if (!this.withStats) {
        this.out = this.toDispay(data.currentValue - 273.15, this.precision);
      } else {
        this.out = this.toDispay(data.currentValue - 273.15, this.precision);
        this.outmax = this.toDispay(data.max - 273.15, this.precision);
        this.outmin = this.toDispay(data.min - 273.15, this.precision);
        this.outmean = "\u03BC " + this.toDispay(data.mean - 273.15, this.precision);
        this.outstdev = "\u03C3 " + this.toDispay(data.stdev, this.precision);
      }
    }
  }]);
  return EInkTemperature;
}(EInkTextBox); // todo
exports.EInkTemperature = EInkTemperature;
var EInkSys = /*#__PURE__*/function (_EInkTextBox13) {
  _inherits(EInkSys, _EInkTextBox13);
  var _super15 = _createSuper(EInkSys);
  function EInkSys(x, y) {
    _classCallCheck(this, EInkSys);
    return _super15.call(this, {
      path: "none",
      labels: {
        bl: "sys"
      },
      x: x,
      y: y,
      withStats: false,
      scale: 1,
      precision: 0
    });
  }
  _createClass(EInkSys, [{
    key: "render",
    value: function render(ctx, state, theme, dataStoreFactory) {
      if (!(state && state.sys)) {
        return;
      }
      var sys = state.sys;
      var polarBuild = sys.polarBuild ? sys.polarBuild.value : "-";
      var calcTime = sys.calcTime ? sys.calcTime.value : "-";
      var updateTime = sys.updateTime ? sys.updateTime.value : "-";
      var jsHeapSizeLimit = sys.jsHeapSizeLimit ? (sys.jsHeapSizeLimit.value / (1024 * 1024)).toFixed(1) : "-";
      var totalJSHeapSize = sys.totalJSHeapSize ? (sys.totalJSHeapSize.value / (1024 * 1024)).toFixed(1) : "-";
      var usedJSHeapSize = sys.usedJSHeapSize ? (sys.usedJSHeapSize.value / (1024 * 1024)).toFixed(1) : "-";

      // this will need some adjustment
      this.startDraw(ctx, theme);
      ctx.font = this.dims.sz / 6 + "px arial";
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText("init: " + polarBuild, this.dims.w * 0.05, this.dims.sz / 4);
      ctx.fillText("calc: " + calcTime, this.dims.w * 0.05, 2 * this.dims.sz / 4);
      ctx.fillText("up: " + updateTime, this.dims.w * 0.05, 3 * this.dims.sz / 4);
      ctx.fillText("mem: " + usedJSHeapSize, this.dims.w * 0.05, 4 * this.dims.sz / 4);
      this.endDraw(ctx);
    }
  }]);
  return EInkSys;
}(EInkTextBox);
exports.EInkSys = EInkSys;
var EInkRatio = /*#__PURE__*/function (_EInkTextBox14) {
  _inherits(EInkRatio, _EInkTextBox14);
  var _super16 = _createSuper(EInkRatio);
  function EInkRatio(path, label, x, y, precision) {
    _classCallCheck(this, EInkRatio);
    return _super16.call(this, {
      path: path,
      labels: {
        bl: label,
        br: "%"
      },
      x: x,
      y: y,
      withStats: true,
      scale: 100,
      precision: precision == undefined ? 0 : precision
    });
  }
  _createClass(EInkRatio, [{
    key: "formatOutput",
    value: function formatOutput(data, scale, precision) {
      scale = scale || this.scale;
      if (!this.withStats) {
        this.out = this.toDispay(data.currentValue * scale, precision);
      } else {
        this.out = this.toDispay(data.currentValue * scale, precision);
        this.outmax = this.toDispay(data.max * scale, precision);
        this.outmin = this.toDispay(data.min * scale, precision);
        this.outmean = "\u03BC " + this.toDispay(data.mean * scale, precision);
        this.outstdev = "\u03C3 " + this.toDispay(data.stdev * scale, 1, this.displayUnits, "", "");
      }
      return this.out;
    }
  }]);
  return EInkRatio;
}(EInkTextBox);
exports.EInkRatio = EInkRatio;