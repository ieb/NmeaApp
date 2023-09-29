/*jshint node:false */
"use strict";

require("core-js/modules/es6.object.define-property.js");
require("core-js/modules/es6.string.iterator.js");
require("core-js/modules/es6.object.to-string.js");
require("core-js/modules/es6.array.iterator.js");
require("core-js/modules/web.dom.iterable.js");
require("core-js/modules/es6.string.includes.js");
require("core-js/modules/es7.array.includes.js");
require("core-js/modules/es6.symbol.js");
require("core-js/modules/es6.number.constructor.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Admin = /*#__PURE__*/function () {
  function Admin() {
    _classCallCheck(this, Admin);
    if (!XMLHttpRequest.DONE) {
      XMLHttpRequest.UNSENT = XMLHttpRequest.UNSENT || 0;
      XMLHttpRequest.OPENED = XMLHttpRequest.OPENED || 1;
      XMLHttpRequest.HEADERS_RECEIVED = XMLHttpRequest.HEADERS_RECEIVED || 2;
      XMLHttpRequest.LOADING = XMLHttpRequest.LOADING || 3;
      XMLHttpRequest.DONE = XMLHttpRequest.DONE || 4;
    }
    var that = this;
    this.fetch("/admin/status", function (response) {
      var status = JSON.parse(response);
      document.getElementById("heap").innerHTML = (status.heap / 1024).toFixed(0);
      document.getElementById("disk_total").innerHTML = (status.disk.total / 1204).toFixed(0);
      document.getElementById("disk_used").innerHTML = (status.disk.used / 1024).toFixed(0);
      document.getElementById("disk_free").innerHTML = (status.disk.free / 1024).toFixed(0);
    });
    document.getElementById("update").onclick = function (ev) {
      var links = document.getElementById("links");
      var selectedOption = links.options[links.selectedIndex];
      var url = selectedOption.getAttribute("url");
      var updatename = selectedOption.getAttribute("updatename");
      var updatefile = selectedOption.getAttribute("updatefile");
      var updatetype = selectedOption.getAttribute("updatetype");
      document.getElementById("http_status").innerHTML = "updating";
      var form = new FormData();
      var content = new Blob([document.getElementById("display").value], {
        type: updatetype
      });
      form.append(updatename, content, updatefile);
      var post = new XMLHttpRequest();
      post.open("POST", url, true);
      post.onreadystatechange = function () {
        if (post.readyState === XMLHttpRequest.DONE) {
          if (post.status === 200) {
            var res = JSON.parse(post.responseText);
            if (res.ok) {
              document.getElementById("http_status").innerHTML = "ok " + res.msg;
              that.load(url);
            } else {
              document.getElementById("http_status").innerHTML = "failed " + res.msg;
            }
          } else {
            document.getElementById("http_status").innerHTML = "failed " + post.status + " " + post.statusText;
          }
        }
      };
      post.send(form);
    };
    document.getElementById("reboot").onclick = function (ev) {
      document.getElementById("http_status").innerHTML = "rebooting";
      var form = new URLSearchParams();
      form.append("reboot", "true");
      var post = new XMLHttpRequest();
      post.open("POST", "/admin/reboot", true);
      post.onreadystatechange = function () {
        if (post.readyState === XMLHttpRequest.DONE) {
          if (post.status === 200) {
            var res = JSON.parse(post.responseText);
            if (res.ok) {
              document.getElementById("http_status").innerHTML = "ok " + res.msg;
            } else {
              document.getElementById("http_status").innerHTML = "failed " + res.msg;
            }
          } else {
            document.getElementById("http_status").innerHTML = "failed " + post.status + " " + post.statusText;
          }
        }
      };
      post.send(form);
    };
    var links = document.getElementById("links");
    links.onchange = function (ev) {
      that.loadSelected(this.options[this.selectedIndex]);
    };
    this.loadSelected(links.options[links.selectedIndex]);
  }
  _createClass(Admin, [{
    key: "loadSelected",
    value: function loadSelected(option) {
      var showButtons = option.getAttribute("showbuttons");
      if (showButtons) {
        document.getElementById("buttons").hidden = false;
      } else {
        document.getElementById("buttons").hidden = true;
      }
      this.load(option.getAttribute("url"));
    }
  }, {
    key: "load",
    value: function load(url) {
      document.getElementById("display").value = "loading....";
      this.fetch(url, function (response, contentType) {
        if (contentType.includes("application/json")) {
          document.getElementById("display").value = JSON.stringify(JSON.parse(response), null, 2);
        } else {
          document.getElementById("display").value = response;
        }
      }, function (status, statusText) {
        document.getElementById("display").value = "Failed " + status + " " + statusText;
      });
    }
  }, {
    key: "fetch",
    value: function fetch(url, cb, error) {
      error = error || function () {};
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            cb(httpRequest.responseText, httpRequest.getResponseHeader("content-type"));
          } else {
            error(httpRequest.status, httpRequest.statusText);
          }
        }
      };
      httpRequest.open('GET', url);
      httpRequest.send();
    }
  }]);
  return Admin;
}();