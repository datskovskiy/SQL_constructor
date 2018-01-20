var check_lib = true;
var Errors = {getHTTPObject:function() {
  var http = null;
  if (typeof ActiveXObject != "undefined") {
    try {
      http = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        http = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (E) {
        http = false;
      }
    }
  } else {
    if (window.XMLHttpRequest) {
      try {
        http = new XMLHttpRequest;
      } catch (e) {
        http = null;
      }
    }
  }
  return http;
}, load:function(srcUrl, callback, method) {
  var http = this.getHTTPObject();
  if (!http || !srcUrl) {
    return;
  }
  var url = srcUrl;
  url += url.indexOf("?") + 1 ? "&" : "?";
  url += "uid=" + (new Date).getTime();
  var parameters = null;
  if (method == "POST") {
    var parts = url.split("?");
    url = parts[0];
    parameters = parts[1];
  }
  http.open(method, url, true);
  if (method == "POST") {
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.setRequestHeader("Content-length", parameters.length);
    http.setRequestHeader("Connection", "close");
  }
  http.onreadystatechange = function() {
    if (http.readyState == 4) {
      if (http.status == 200) {
        var result = "";
        if (http.responseText) {
          result = http.responseText;
        }
        if (callback) {
          callback(result);
        }
      }
    }
  };
  http.send(parameters);
}, handler:function(msg, url, line) {
  var error = '<b style="color:#ff0066">JavaScript Error</b>\n<br/>\n' + "Message: " + msg + "\n<br>\n" + "Url: " + url + "\n<br>\n" + "Line: " + line + "\n<br>\n";
  var error_alert = "JavaScript Error\n" + "Message: " + msg + "\n\n" + "Url: " + url + "\n\n" + "Line: " + line + "\n\n";
  if (navigator && navigator.userAgent) {
    error = error + "userAgent: " + navigator.userAgent;
  }
  var dialog = document.createElement("div");
  dialog.className = "errordialog";
  dialog.innerHTML = error;
  if (document && (document.body && document.body.appendChild)) {
    document.body.appendChild(dialog);
  } else {
    alert(error_alert);
  }
  Errors.post_error({msg:msg, url:url, line:line, userAgent:navigator.userAgent});
  return true;
}, post_error:function(params) {
  var url = "handlers/clientError.axd?";
  for (var i in params) {
    if (params.hasOwnProperty(i)) {
      url += i + "=" + encodeURI(params[i]) + "&";
    }
  }
  this.load(url, null, "POST");
}};
(function() {
  this.MooTools = {version:"1.4.5", build:"ab8ea8824dc3b24b6666867a2c4ed58ebb762cf0"};
  var typeOf = this.typeOf = function(item) {
    if (item == null) {
      return "null";
    }
    if (item.$family != null) {
      return item.$family();
    }
    if (item.nodeName) {
      if (item.nodeType == 1) {
        return "element";
      }
      if (item.nodeType == 3) {
        return/\S/.test(item.nodeValue) ? "textnode" : "whitespace";
      }
    } else {
      if (typeof item.length == "number") {
        if (item.callee) {
          return "arguments";
        }
        if ("item" in item) {
          return "collection";
        }
      }
    }
    return typeof item;
  };
  var instanceOf = this.instanceOf = function(item, object) {
    if (item == null) {
      return false;
    }
    var constructor = item.$constructor || item.constructor;
    while (constructor) {
      if (constructor === object) {
        return true;
      }
      constructor = constructor.parent;
    }
    if (!item.hasOwnProperty) {
      return false;
    }
    return item instanceof object;
  };
  var Function = this.Function;
  var enumerables = true;
  for (var i in{toString:1}) {
    enumerables = null;
  }
  if (enumerables) {
    enumerables = ["hasOwnProperty", "valueOf", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "constructor"];
  }
  Function.prototype.overloadSetter = function(usePlural) {
    var self = this;
    return function(a, b) {
      if (a == null) {
        return this;
      }
      if (usePlural || typeof a != "string") {
        for (var k in a) {
          self.call(this, k, a[k]);
        }
        if (enumerables) {
          for (var i = enumerables.length;i--;) {
            k = enumerables[i];
            if (a.hasOwnProperty(k)) {
              self.call(this, k, a[k]);
            }
          }
        }
      } else {
        self.call(this, a, b);
      }
      return this;
    };
  };
  Function.prototype.overloadGetter = function(usePlural) {
    var self = this;
    return function(a) {
      var args, result;
      if (typeof a != "string") {
        args = a;
      } else {
        if (arguments.length > 1) {
          args = arguments;
        } else {
          if (usePlural) {
            args = [a];
          }
        }
      }
      if (args) {
        result = {};
        for (var i = 0;i < args.length;i++) {
          result[args[i]] = self.call(this, args[i]);
        }
      } else {
        result = self.call(this, a);
      }
      return result;
    };
  };
  Function.prototype.extend = function(key, value) {
    this[key] = value;
  }.overloadSetter();
  Function.prototype.implement = function(key, value) {
    this.prototype[key] = value;
  }.overloadSetter();
  var slice = Array.prototype.slice;
  Function.from = function(item) {
    return typeOf(item) == "function" ? item : function() {
      return item;
    };
  };
  Array.from = function(item) {
    if (item == null) {
      return[];
    }
    return mooType.isEnumerable(item) && typeof item != "string" ? typeOf(item) == "array" ? item : slice.call(item) : [item];
  };
  Number.from = function(item) {
    var number = parseFloat(item);
    return isFinite(number) ? number : null;
  };
  String.from = function(item) {
    return item + "";
  };
  Function.implement({mHide:function() {
    this.$hidden = true;
    return this;
  }, protect:function() {
    this.$protected = true;
    return this;
  }});
  var mooType = this.mooType = this.mooType = function(name, object) {
    if (name) {
      var lower = name.toLowerCase();
      var typeCheck = function(item) {
        return typeOf(item) == lower;
      };
      mooType["is" + name] = typeCheck;
      if (object != null) {
        object.prototype.$family = function() {
          return lower;
        }.mHide();
      }
    }
    if (object == null) {
      return null;
    }
    object.extend(this);
    object.$constructor = mooType;
    object.prototype.$constructor = object;
    return object;
  };
  var toString = Object.prototype.toString;
  mooType.isEnumerable = function(item) {
    return item != null && (typeof item.length == "number" && toString.call(item) != "[object Function]");
  };
  var hooks = {};
  var hooksOf = function(object) {
    var type = typeOf(object.prototype);
    return hooks[type] || (hooks[type] = []);
  };
  var implement = function(name, method) {
    if (method && method.$hidden) {
      return;
    }
    var hooks = hooksOf(this);
    for (var i = 0;i < hooks.length;i++) {
      var hook = hooks[i];
      if (typeOf(hook) == "type") {
        implement.call(hook, name, method);
      } else {
        hook.call(this, name, method);
      }
    }
    var previous = this.prototype[name];
    if (previous == null || !previous.$protected) {
      this.prototype[name] = method;
    }
    if (this[name] == null && typeOf(method) == "function") {
      extend.call(this, name, function(item) {
        return method.apply(item, slice.call(arguments, 1));
      });
    }
  };
  var extend = function(name, method) {
    if (method && method.$hidden) {
      return;
    }
    var previous = this[name];
    if (previous == null || !previous.$protected) {
      this[name] = method;
    }
  };
  mooType.implement({implement:implement.overloadSetter(), extend:extend.overloadSetter(), alias:function(name, existing) {
    implement.call(this, name, this.prototype[existing]);
  }.overloadSetter(), mirror:function(hook) {
    hooksOf(this).push(hook);
    return this;
  }});
  new mooType("mooType", mooType);
  var force = function(name, object, methods) {
    var isType = object != Object, prototype = object.prototype;
    if (isType) {
      object = new mooType(name, object);
    }
    for (var i = 0, l = methods.length;i < l;i++) {
      var key = methods[i], generic = object[key], proto = prototype[key];
      if (generic) {
        generic.protect();
      }
      if (isType && proto) {
        object.implement(key, proto.protect());
      }
    }
    if (isType) {
      var methodsEnumerable = prototype.propertyIsEnumerable(methods[0]);
      object.forEachMethod = function(fn) {
        if (!methodsEnumerable) {
          for (var i = 0, l = methods.length;i < l;i++) {
            fn.call(prototype, prototype[methods[i]], methods[i]);
          }
        }
        for (var key in prototype) {
          fn.call(prototype, prototype[key], key);
        }
      };
    }
    return force;
  };
  force("String", String, ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "quote", "replace", "search", "slice", "split", "substr", "substring", "trim", "toLowerCase", "toUpperCase"])("Array", Array, ["pop", "push", "reverse", "shift", "sort", "splice", "unshift", "concat", "join", "slice", "indexOf", "lastIndexOf", "filter", "forEach", "every", "map", "some", "reduce", "reduceRight"])("Number", Number, ["toExponential", "toFixed", "toLocaleString", "toPrecision"])("Function", 
  Function, ["apply", "call", "bind"])("RegExp", RegExp, ["exec", "test"])("Object", Object, ["create", "defineProperty", "defineProperties", "keys", "getPrototypeOf", "getOwnPropertyDescriptor", "getOwnPropertyNames", "preventExtensions", "isExtensible", "seal", "isSealed", "freeze", "isFrozen"])("Date", Date, ["now"]);
  Object.extend = extend.overloadSetter();
  Date.extend("now", function() {
    return+new Date;
  });
  new mooType("Boolean", Boolean);
  Number.prototype.$family = function() {
    return isFinite(this) ? "number" : "null";
  }.mHide();
  Number.extend("random", function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  });
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  Object.extend("forEach", function(object, fn, bind) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        fn.call(bind, object[key], key, object);
      }
    }
  });
  Object.each = Object.forEach;
  Array.implement({forEach:function(fn, bind) {
    for (var i = 0, l = this.length;i < l;i++) {
      if (i in this) {
        fn.call(bind, this[i], i, this);
      }
    }
  }, each:function(fn, bind) {
    Array.forEach(this, fn, bind);
    return this;
  }});
  var cloneOf = function(item) {
    switch(typeOf(item)) {
      case "array":
        return item.clone();
      case "object":
        return Object.clone(item);
      default:
        return item;
    }
  };
  Array.implement("clone", function() {
    var i = this.length, clone = new Array(i);
    while (i--) {
      clone[i] = cloneOf(this[i]);
    }
    return clone;
  });
  var mergeOne = function(source, key, current) {
    switch(typeOf(current)) {
      case "object":
        if (typeOf(source[key]) == "object") {
          Object.merge(source[key], current);
        } else {
          source[key] = Object.clone(current);
        }
        break;
      case "array":
        source[key] = current.clone();
        break;
      default:
        source[key] = current;
    }
    return source;
  };
  Object.extend({merge:function(source, k, v) {
    if (typeOf(k) == "string") {
      return mergeOne(source, k, v);
    }
    for (var i = 1, l = arguments.length;i < l;i++) {
      var object = arguments[i];
      for (var key in object) {
        mergeOne(source, key, object[key]);
      }
    }
    return source;
  }, clone:function(object) {
    var clone = {};
    for (var key in object) {
      clone[key] = cloneOf(object[key]);
    }
    return clone;
  }, append:function(original) {
    for (var i = 1, l = arguments.length;i < l;i++) {
      var extended = arguments[i] || {};
      for (var key in extended) {
        original[key] = extended[key];
      }
    }
    return original;
  }});
  ["Object", "WhiteSpace", "TextNode", "Collection", "Arguments"].each(function(name) {
    new mooType(name);
  });
  var UID = Date.now();
  String.extend("uniqueID", function() {
    return(UID++).toString(36);
  });
})();
Array.implement({every:function(fn, bind) {
  for (var i = 0, l = this.length >>> 0;i < l;i++) {
    if (i in this && !fn.call(bind, this[i], i, this)) {
      return false;
    }
  }
  return true;
}, filter:function(fn, bind) {
  var results = [];
  for (var value, i = 0, l = this.length >>> 0;i < l;i++) {
    if (i in this) {
      value = this[i];
      if (fn.call(bind, value, i, this)) {
        results.push(value);
      }
    }
  }
  return results;
}, indexOf:function(item, from) {
  var length = this.length >>> 0;
  for (var i = from < 0 ? Math.max(0, length + from) : from || 0;i < length;i++) {
    if (this[i] === item) {
      return i;
    }
  }
  return-1;
}, map:function(fn, bind) {
  var length = this.length >>> 0, results = Array(length);
  for (var i = 0;i < length;i++) {
    if (i in this) {
      results[i] = fn.call(bind, this[i], i, this);
    }
  }
  return results;
}, some:function(fn, bind) {
  for (var i = 0, l = this.length >>> 0;i < l;i++) {
    if (i in this && fn.call(bind, this[i], i, this)) {
      return true;
    }
  }
  return false;
}, clean:function() {
  return this.filter(function(item) {
    return item != null;
  });
}, invoke:function(methodName) {
  var args = Array.slice(arguments, 1);
  return this.map(function(item) {
    return item[methodName].apply(item, args);
  });
}, associate:function(keys) {
  var obj = {}, length = Math.min(this.length, keys.length);
  for (var i = 0;i < length;i++) {
    obj[keys[i]] = this[i];
  }
  return obj;
}, link:function(object) {
  var result = {};
  for (var i = 0, l = this.length;i < l;i++) {
    for (var key in object) {
      if (object[key](this[i])) {
        result[key] = this[i];
        delete object[key];
        break;
      }
    }
  }
  return result;
}, contains:function(item, from) {
  return this.indexOf(item, from) != -1;
}, append:function(array) {
  this.push.apply(this, array);
  return this;
}, getLast:function() {
  return this.length ? this[this.length - 1] : null;
}, getRandom:function() {
  return this.length ? this[Number.random(0, this.length - 1)] : null;
}, include:function(item) {
  if (!this.contains(item)) {
    this.push(item);
  }
  return this;
}, combine:function(array) {
  for (var i = 0, l = array.length;i < l;i++) {
    this.include(array[i]);
  }
  return this;
}, erase:function(item) {
  for (var i = this.length;i--;) {
    if (this[i] === item) {
      this.splice(i, 1);
    }
  }
  return this;
}, empty:function() {
  this.length = 0;
  return this;
}, flatten:function() {
  var array = [];
  for (var i = 0, l = this.length;i < l;i++) {
    var type = typeOf(this[i]);
    if (type == "null") {
      continue;
    }
    array = array.concat(type == "array" || (type == "collection" || (type == "arguments" || instanceOf(this[i], Array))) ? Array.flatten(this[i]) : this[i]);
  }
  return array;
}, pick:function() {
  for (var i = 0, l = this.length;i < l;i++) {
    if (this[i] != null) {
      return this[i];
    }
  }
  return null;
}, hexToRgb:function(array) {
  if (this.length != 3) {
    return null;
  }
  var rgb = this.map(function(value) {
    if (value.length == 1) {
      value += value;
    }
    return value.toInt(16);
  });
  return array ? rgb : "rgb(" + rgb + ")";
}, rgbToHex:function(array) {
  if (this.length < 3) {
    return null;
  }
  if (this.length == 4 && (this[3] == 0 && !array)) {
    return "transparent";
  }
  var hex = [];
  for (var i = 0;i < 3;i++) {
    var bit = (this[i] - 0).toString(16);
    hex.push(bit.length == 1 ? "0" + bit : bit);
  }
  return array ? hex : "#" + hex.join("");
}});
String.implement({test:function(regex, params) {
  return(typeOf(regex) == "regexp" ? regex : new RegExp("" + regex, params)).test(this);
}, contains:function(string, separator) {
  return separator ? (separator + this + separator).indexOf(separator + string + separator) > -1 : String(this).indexOf(string) > -1;
}, trim:function() {
  return String(this).replace(/^\s+|\s+$/g, "");
}, clean:function() {
  return String(this).replace(/\s+/g, " ").trim();
}, camelCase:function() {
  return String(this).replace(/-\D/g, function(match) {
    return match.charAt(1).toUpperCase();
  });
}, hyphenate:function() {
  return String(this).replace(/[A-Z]/g, function(match) {
    return "-" + match.charAt(0).toLowerCase();
  });
}, capitalize:function() {
  return String(this).replace(/\b[a-z]/g, function(match) {
    return match.toUpperCase();
  });
}, escapeRegExp:function() {
  return String(this).replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
}, toInt:function(base) {
  return parseInt(this, base || 10);
}, toFloat:function() {
  return parseFloat(this);
}, hexToRgb:function(array) {
  var hex = String(this).match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
  return hex ? hex.slice(1).hexToRgb(array) : null;
}, rgbToHex:function(array) {
  var rgb = String(this).match(/\d{1,3}/g);
  return rgb ? rgb.rgbToHex(array) : null;
}, substitute:function(object, regexp) {
  return String(this).replace(regexp || /\\?\{([^{}]+)\}/g, function(match, name) {
    if (match.charAt(0) == "\\") {
      return match.slice(1);
    }
    return object[name] != null ? object[name] : "";
  });
}});
Function.extend({attempt:function() {
  for (var i = 0, l = arguments.length;i < l;i++) {
    try {
      return arguments[i]();
    } catch (e) {
    }
  }
  return null;
}});
Function.implement({attempt:function(args, bind) {
  try {
    return this.apply(bind, Array.from(args));
  } catch (e) {
  }
  return null;
}, bind:function(that) {
  var self = this, args = arguments.length > 1 ? Array.slice(arguments, 1) : null, F = function() {
  };
  var bound = function() {
    var context = that, length = arguments.length;
    if (this instanceof bound) {
      F.prototype = self.prototype;
      context = new F;
    }
    var result = !args && !length ? self.call(context) : self.apply(context, args && length ? args.concat(Array.slice(arguments)) : args || arguments);
    return context == that ? result : context;
  };
  return bound;
}, pass:function(args, bind) {
  var self = this;
  if (args != null) {
    args = Array.from(args);
  }
  return function() {
    return self.apply(bind, args || arguments);
  };
}, delay:function(delay, bind, args) {
  return setTimeout(this.pass(args == null ? [] : args, bind), delay);
}, periodical:function(periodical, bind, args) {
  return setInterval(this.pass(args == null ? [] : args, bind), periodical);
}});
Number.implement({limit:function(min, max) {
  return Math.min(max, Math.max(min, this));
}, round:function(precision) {
  precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
  return Math.round(this * precision) / precision;
}, times:function(fn, bind) {
  for (var i = 0;i < this;i++) {
    fn.call(bind, i, this);
  }
}, toFloat:function() {
  return parseFloat(this);
}, toInt:function(base) {
  return parseInt(this, base || 10);
}});
Number.alias("each", "times");
(function(math) {
  var methods = {};
  math.each(function(name) {
    if (!Number[name]) {
      methods[name] = function() {
        return Math[name].apply(null, [this].concat(Array.from(arguments)));
      };
    }
  });
  Number.implement(methods);
})(["abs", "acos", "asin", "atan", "atan2", "ceil", "cos", "exp", "floor", "log", "max", "min", "pow", "sin", "sqrt", "tan"]);
(function() {
  var Class = this.Class = new mooType("Class", function(params) {
    if (instanceOf(params, Function)) {
      params = {initialize:params};
    }
    var newClass = function() {
      reset(this);
      if (newClass.$prototyping) {
        return this;
      }
      this.$caller = null;
      var value = this.initialize ? this.initialize.apply(this, arguments) : this;
      this.$caller = this.caller = null;
      return value;
    }.extend(this).implement(params);
    newClass.$constructor = Class;
    newClass.prototype.$constructor = newClass;
    newClass.prototype.parent = parent;
    return newClass;
  });
  var parent = function() {
    if (!this.$caller) {
      throw new Error('The method "parent" cannot be called.');
    }
    var name = this.$caller.$name, parent = this.$caller.$owner.parent, previous = parent ? parent.prototype[name] : null;
    if (!previous) {
      throw new Error('The method "' + name + '" has no parent.');
    }
    return previous.apply(this, arguments);
  };
  var reset = function(object) {
    for (var key in object) {
      var value = object[key];
      switch(typeOf(value)) {
        case "object":
          var F = function() {
          };
          F.prototype = value;
          object[key] = reset(new F);
          break;
        case "array":
          object[key] = value.clone();
          break;
      }
    }
    return object;
  };
  var wrap = function(self, key, method) {
    if (method.$origin) {
      method = method.$origin;
    }
    var wrapper = function() {
      if (method.$protected && this.$caller == null) {
        throw new Error('The method "' + key + '" cannot be called.');
      }
      var caller = this.caller, current = this.$caller;
      this.caller = current;
      this.$caller = wrapper;
      var result = method.apply(this, arguments);
      this.$caller = current;
      this.caller = caller;
      return result;
    }.extend({$owner:self, $origin:method, $name:key});
    return wrapper;
  };
  var implement = function(key, value, retain) {
    if (Class.Mutators.hasOwnProperty(key)) {
      value = Class.Mutators[key].call(this, value);
      if (value == null) {
        return this;
      }
    }
    if (typeOf(value) == "function") {
      if (value.$hidden) {
        return this;
      }
      this.prototype[key] = retain ? value : wrap(this, key, value);
    } else {
      Object.merge(this.prototype, key, value);
    }
    return this;
  };
  var getInstance = function(klass) {
    klass.$prototyping = true;
    var proto = new klass;
    delete klass.$prototyping;
    return proto;
  };
  Class.implement("implement", implement.overloadSetter());
  Class.Mutators = {Extends:function(parent) {
    this.parent = parent;
    this.prototype = getInstance(parent);
  }, Implements:function(items) {
    Array.from(items).each(function(item) {
      var instance = new item;
      for (var key in instance) {
        implement.call(this, key, instance[key], true);
      }
    }, this);
  }};
})();
(function($) {
  $.support.touch = "ontouchend" in document;
  if (!$.support.touch) {
    return;
  }
  var mouseProto = $.ui.mouse.prototype;
  var _mouseInit = mouseProto._mouseInit;
  var touchHandled;
  function simulateMouseEvent(event, simulatedType) {
    if (event.originalEvent.touches.length > 1) {
      return;
    }
    event.preventDefault();
    var t = event.originalEvent.changedTouches[0];
    var simulatedEvent = document.createEvent("MouseEvents");
    simulatedEvent.initMouseEvent(simulatedType, true, true, window, 1, t.screenX, t.screenY, t.clientX, t.clientY, false, false, false, false, 0, null);
    event.target.dispatchEvent(simulatedEvent);
  }
  mouseProto._touchStart = function(event) {
    var me = this;
    if (touchHandled || !me._mouseCapture(event.originalEvent.changedTouches[0])) {
      return;
    }
    touchHandled = true;
    me._touchMoved = false;
    simulateMouseEvent(event, "mouseover");
    simulateMouseEvent(event, "mousemove");
    simulateMouseEvent(event, "mousedown");
  };
  mouseProto._touchMove = function(event) {
    if (!touchHandled) {
      return;
    }
    this._touchMoved = true;
    simulateMouseEvent(event, "mousemove");
  };
  mouseProto._touchEnd = function(event) {
    if (!touchHandled) {
      return;
    }
    simulateMouseEvent(event, "mouseup");
    simulateMouseEvent(event, "mouseout");
    if (!this._touchMoved) {
      simulateMouseEvent(event, "click");
    }
    touchHandled = false;
  };
  mouseProto._mouseInit = function() {
    var me = this;
    me.element.bind("touchstart", $.proxy(me, "_touchStart")).bind("touchmove", $.proxy(me, "_touchMove")).bind("touchend", $.proxy(me, "_touchEnd"));
    _mouseInit.call(me);
  };
})(jQuery);
var _global_timer_ = null;
(function($) {
  $.fn.longClickContextMenu = function() {
    $(this).longclick(function(e) {
      var t = e.currentTarget;
      var o = $(e.currentTarget).offset();
      if (e.pageX - o.left > t.clientWidth) {
        return;
      }
      var element = $(e.target);
      element.contextMenu({x:e.clientX, y:e.clientY});
    });
  };
  var $_fn_click = $.fn.click;
  $.fn.click = function click(duration, handler) {
    if (!handler) {
      return $_fn_click.apply(this, arguments);
    }
    return $(this).bind(type, handler);
  };
  $.fn.longclick = function longclick() {
    var args = [].splice.call(arguments, 0), handler = args.pop(), duration = args.pop(), $this = $(this);
    return handler ? $this.click(duration, handler) : $this.trigger(type);
  };
  $.longclick = {duration:1E3};
  $.event.special.longclick = {setup:function(data, namespaces) {
    if (!/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      $(this).bind(_mousedown_, schedule).bind([_mousemove_, _mouseup_, _mouseout_, _contextmenu_].join(" "), annul).bind(_click_, click);
    } else {
      touch_enabled(this).bind(_touchstart_, schedule).bind([_touchend_, _touchmove_, _touchcancel_].join(" "), annul).bind(_click_, click).css({WebkitUserSelect:"none"});
    }
  }, teardown:function(namespaces) {
    $(this).unbind(namespace);
  }};
  function touch_enabled(element) {
    $.each("touchstart touchmove touchend touchcancel".split(/ /), function bind(ix, it) {
      element.addEventListener(it, function trigger_jquery_event(event) {
        $(element).trigger(it);
      }, false);
    });
    return $(element);
  }
  function schedule(event) {
    if (_global_timer_) {
      return;
    }
    var element = this;
    var args = arguments;
    $(this).data(_fired_, false);
    _global_timer_ = setTimeout(scheduled, $.longclick.duration);
    function scheduled() {
      $(element).data(_fired_, true);
      event.type = type;
      jQuery.event.dispatch.apply(element, args);
    }
  }
  function annul(event) {
    if (_global_timer_) {
      clearTimeout(_global_timer_);
      _global_timer_ = null;
    }
  }
  function click(event) {
    if ($(this).data(_fired_)) {
      return event.stopImmediatePropagation() || false;
    }
  }
  var type = "longclick";
  var namespace = "." + type;
  var _mousedown_ = "mousedown" + namespace;
  var _click_ = "click" + namespace;
  var _mousemove_ = "mousemove" + namespace;
  var _mouseup_ = "mouseup" + namespace;
  var _mouseout_ = "mouseout" + namespace;
  var _contextmenu_ = "contextmenu" + namespace;
  var _touchstart_ = "touchstart" + namespace;
  var _touchend_ = "touchend" + namespace;
  var _touchmove_ = "touchmove" + namespace;
  var _touchcancel_ = "touchcancel" + namespace;
  var _duration_ = "duration" + namespace;
  var _timer_ = "timer" + namespace;
  var _fired_ = "fired" + namespace;
})(jQuery);
(function($) {
  $.fn.paginate = function(options) {
    var opts = $.extend({}, $.fn.paginate.defaults, options);
    return this.each(function() {
      $this = $(this);
      var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
      var selectedpage = o.start;
      $.fn.draw(o, $this, selectedpage);
    });
  };
  var outsidewidth_tmp = 0;
  var insidewidth = 0;
  var bName = navigator.appName;
  var bVer = navigator.appVersion;
  if (bVer.indexOf("MSIE 7.0") > 0) {
    var ver = "ie7"
  }
  $.fn.paginate.defaults = {count:5, start:12, display:5, border:true, border_color:"#fff", text_color:"#8cc59d", background_color:"black", border_hover_color:"#fff", text_hover_color:"#fff", background_hover_color:"#fff", rotate:true, images:true, mouse:"slide", onChange:function() {
    return false;
  }};
  $.fn.draw = function(o, obj, selectedpage) {
    if (o.display > o.count) {
      o.display = o.count;
    }
    $this.empty();
    if (o.images) {
      var spreviousclass = "jPag-sprevious-img";
      var previousclass = "jPag-previous-img";
      var snextclass = "jPag-snext-img";
      var nextclass = "jPag-next-img";
    } else {
      var spreviousclass = "jPag-sprevious";
      var previousclass = "jPag-previous";
      var snextclass = "jPag-snext";
      var nextclass = "jPag-next";
    }
    if (o.rotate) {
      var _rotleft = $("<div>&lt;</div>").jQButton({icons:{primary:"ui-icon-carat-1-w"}, text:false})
    }
    $this.html('<div id="wrapper1">' + '<div id="wrapper2">' + '<div id="maincol">' + '<div id="leftcol"></div>' + '<div id="rightcol"></div>' + '<div id="centercol"></div>' + "</div>" + "</div>" + "</div>");
    var _divwrapleft = $("#leftcol").addClass("jPag-control-back");
    _divwrapleft.append(_rotleft);
    var _ulwrapdiv = $('<table cellpadding="0" cellspacing="0">').css("overflow", "hidden");
    var _ul = $("<tr>").addClass("jPag-pages");
    var c = (o.display - 1) / 2;
    var first = selectedpage - c;
    var selobj;
    for (var i = 0;i < o.count;i++) {
      var val = i + 1;
      if (val == selectedpage) {
        var _obj = $('<td class="li">').html('<span class="jPag-current">' + val + "</span>");
        selobj = _obj;
        _ul.append(_obj);
      } else {
        var _obj = $('<td class="li">').html("<a>" + val + "</a>");
        _ul.append(_obj);
      }
    }
    _ulwrapdiv.append(_ul);
    if (o.rotate) {
      var _rotright = $("<div>&gt;</div>").jQButton({icons:{primary:"ui-icon-carat-1-e"}, text:false})
    }
    var _divwrapright = $("#rightcol").addClass("jPag-control-front");
    _divwrapright.append(_rotright);
    $("#centercol").append(_ulwrapdiv);
    var _outer = $("#centercol");
    var test_interval = null;
    function hideArrow() {
      $("#leftcol").hide();
      $("#rightcol").hide();
    }
    function showArrow() {
      $("#leftcol").show();
      $("#rightcol").show();
    }
    function testWidth() {
      if (_outer.width() == 0) {
        return;
      }
      clearInterval(test_interval);
      if (_ulwrapdiv.width() <= _outer.width()) {
        hideArrow();
      } else {
        showArrow();
      }
    }
    if (_outer.width() == 0) {
      test_interval = setInterval(testWidth, 500);
    } else {
      testWidth();
    }
    $this.addClass("jPaginate");
    if (!o.border) {
      if (o.background_color == "none") {
        var a_css = {"color":o.text_color}
      } else {
        var a_css = {"color":o.text_color, "background-color":o.background_color}
      }
      if (o.background_hover_color == "none") {
        var hover_css = {"color":o.text_hover_color}
      } else {
        var hover_css = {"color":o.text_hover_color, "background-color":o.background_hover_color}
      }
    } else {
      if (o.background_color == "none") {
        var a_css = {"color":o.text_color, "border":"1px solid " + o.border_color}
      } else {
        var a_css = {"color":o.text_color, "background-color":o.background_color, "border":"1px solid " + o.border_color}
      }
      if (o.background_hover_color == "none") {
        var hover_css = {"color":o.text_hover_color, "border":"1px solid " + o.border_hover_color}
      } else {
        var hover_css = {"color":o.text_hover_color, "background-color":o.background_hover_color, "border":"1px solid " + o.border_hover_color}
      }
    }
    $.fn.applystyle(o, $this, a_css, hover_css, _ul, _ulwrapdiv, _divwrapright);
    var outsidewidth = outsidewidth_tmp - 1;
    if (ver == "ie7") {
    } else {
    }
    if (o.mouse == "press") {
      _rotright.mousedown(function() {
        thumbs_mouse_interval = setInterval(function() {
          var left = _ulwrapdiv.parent().scrollLeft() + 5;
          _ulwrapdiv.parent().scrollLeft(left);
        }, 20);
      }).mouseup(function() {
        clearInterval(thumbs_mouse_interval);
      });
      _rotleft.mousedown(function() {
        thumbs_mouse_interval = setInterval(function() {
          var left = _ulwrapdiv.parent().scrollLeft() - 5;
          _ulwrapdiv.parent().scrollLeft(left);
        }, 20);
      }).mouseup(function() {
        clearInterval(thumbs_mouse_interval);
      });
    }
    _ulwrapdiv.find(".li").click(function(e) {
      selobj.html("<a>" + selobj.find(".jPag-current").html() + "</a>");
      var currval = $(this).find("a").html();
      $(this).html('<span class="jPag-current">' + currval + "</span>");
      selobj = $(this);
      $.fn.applystyle(o, $(this).parent().parent().parent(), a_css, hover_css, _ul, _ulwrapdiv, _divwrapright);
      var left = this.offsetLeft / 2;
      var left2 = _ulwrapdiv.scrollLeft() + left;
      var tmp = left - outsidewidth / 2;
      if (ver == "ie7") {
        _ulwrapdiv.animate({scrollLeft:left + tmp + 52 + "px"});
      } else {
        _ulwrapdiv.animate({scrollLeft:left + tmp + "px"});
      }
      o.onChange(currval);
    });
    var last = _ulwrapdiv.find(".li").eq(o.start - 1);
    var left = 0;
    if (last.length) {
      left = last[0].offsetLeft / 2;
    }
    var tmp = left - outsidewidth / 2;
    if (ver == "ie7") {
      _ulwrapdiv.animate({scrollLeft:left + tmp + 52 + "px"});
    } else {
      _ulwrapdiv.animate({scrollLeft:left + tmp + "px"});
    }
  };
  $.fn.applystyle = function(o, obj, a_css, hover_css, _ul, _ulwrapdiv, _divwrapright) {
    obj.find("a").css(a_css);
    obj.find("span.jPag-current").css(hover_css);
    obj.find("a").hover(function() {
      $(this).css(hover_css);
    }, function() {
      $(this).css(a_css);
    });
    insidewidth = 0;
    obj.find(".li").each(function(i, n) {
      if (i == o.display - 1) {
        outsidewidth_tmp = this.offsetLeft + this.offsetWidth;
      }
      insidewidth += this.offsetWidth;
    });
    insidewidth += 3;
  };
})(jQuery);
(function($) {
  $.extend({debounce:function(fn, timeout, ctx, invokeAsap) {
    var timer;
    return function() {
      var args = arguments;
      ctx = ctx || this;
      invokeAsap && (!timer && fn.apply(ctx, args));
      clearTimeout(timer);
      timer = setTimeout(function() {
        !invokeAsap && fn.apply(ctx, args);
        timer = null;
      }, timeout);
    };
  }, throttle:function(fn, timeout, ctx) {
    var timer, args, needInvoke;
    return function() {
      args = arguments;
      needInvoke = true;
      ctx = ctx || this;
      if (!timer) {
        (function() {
          if (needInvoke) {
            fn.apply(ctx, args);
            needInvoke = false;
            timer = setTimeout(arguments.callee, timeout);
          } else {
            timer = null;
          }
        })();
      }
    };
  }});
})(jQuery);
(function($) {
  var strings = {strConversion:{__repr:function(i) {
    switch(this.__getType(i)) {
      case "array":
      ;
      case "date":
      ;
      case "number":
        return i.toString();
      case "object":
        var o = [];
        for (x = 0;x < i.length;i++) {
          o.push(i + ": " + this.__repr(i[x]));
        }
        return o.join(", ");
      case "string":
        return i;
      default:
        return i;
    }
  }, __getType:function(i) {
    if (!i || !i.constructor) {
      return typeof i;
    }
    var match = i.constructor.toString().match(/Array|Number|String|Object|Date/);
    return match && match[0].toLowerCase() || typeof i;
  }, __pad:function(str, l, s, t) {
    var p = s || " ";
    var o = str;
    if (l - str.length > 0) {
      o = (new Array(Math.ceil(l / p.length))).join(p).substr(0, t = !t ? l : t == 1 ? 0 : Math.ceil(l / 2)) + str + p.substr(0, l - t);
    }
    return o;
  }, __getInput:function(arg, args) {
    var key = arg.getKey();
    switch(this.__getType(args)) {
      case "object":
        var keys = key.split(".");
        var obj = args;
        for (var subkey = 0;subkey < keys.length;subkey++) {
          obj = obj[keys[subkey]];
        }
        if (typeof obj != "undefined") {
          if (strings.strConversion.__getType(obj) == "array") {
            return arg.getFormat().match(/\.\*/) && obj[1] || obj;
          }
          return obj;
        } else {
        }
        break;
      case "array":
        key = parseInt(key, 10);
        if (arg.getFormat().match(/\.\*/) && typeof args[key + 1] != "undefined") {
          return args[key + 1];
        } else {
          if (typeof args[key] != "undefined") {
            return args[key];
          } else {
            return key;
          }
        }
        break;
    }
    return "{" + key + "}";
  }, __formatToken:function(token, args) {
    var arg = new Argument(token, args);
    return strings.strConversion[arg.getFormat().slice(-1)](this.__getInput(arg, args), arg);
  }, d:function(input, arg) {
    var o = parseInt(input, 10);
    var p = arg.getPaddingLength();
    if (p) {
      return this.__pad(o.toString(), p, arg.getPaddingString(), 0);
    } else {
      return o;
    }
  }, i:function(input, args) {
    return this.d(input, args);
  }, o:function(input, arg) {
    var o = input.toString(8);
    if (arg.isAlternate()) {
      o = this.__pad(o, o.length + 1, "0", 0);
    }
    return this.__pad(o, arg.getPaddingLength(), arg.getPaddingString(), 0);
  }, u:function(input, args) {
    return Math.abs(this.d(input, args));
  }, x:function(input, arg) {
    var o = parseInt(input, 10).toString(16);
    o = this.__pad(o, arg.getPaddingLength(), arg.getPaddingString(), 0);
    return arg.isAlternate() ? "0x" + o : o;
  }, X:function(input, arg) {
    return this.x(input, arg).toUpperCase();
  }, e:function(input, arg) {
    return parseFloat(input, 10).toExponential(arg.getPrecision());
  }, E:function(input, arg) {
    return this.e(input, arg).toUpperCase();
  }, f:function(input, arg) {
    return this.__pad(parseFloat(input, 10).toFixed(arg.getPrecision()), arg.getPaddingLength(), arg.getPaddingString(), 0);
  }, F:function(input, args) {
    return this.f(input, args);
  }, g:function(input, arg) {
    var o = parseFloat(input, 10);
    return o.toString().length > 6 ? Math.round(o.toExponential(arg.getPrecision())) : o;
  }, G:function(input, args) {
    return this.g(input, args);
  }, c:function(input, args) {
    var match = input.match(/\w|\d/);
    return match && match[0] || "";
  }, r:function(input, args) {
    return this.__repr(input);
  }, s:function(input, args) {
    return input.toString && input.toString() || "" + input;
  }}, format:function(str, args) {
    var end = 0;
    var start = 0;
    var match = false;
    var buffer = [];
    var token = "";
    var tmp = (str || "").split("");
    for (start = 0;start < tmp.length;start++) {
      if (tmp[start] == "{" && tmp[start + 1] != "{") {
        end = str.indexOf("}", start);
        token = tmp.slice(start + 1, end).join("");
        buffer.push(strings.strConversion.__formatToken(token, typeof arguments[1] != "object" ? arguments2Array(arguments, 2) : args || []));
      } else {
        if (start > end || buffer.length < 1) {
          buffer.push(tmp[start]);
        }
      }
    }
    return buffer.length > 1 ? buffer.join("") : buffer[0];
  }, calc:function(str, args) {
    return eval(format(str, args));
  }, repeat:function(s, n) {
    return(new Array(n + 1)).join(s);
  }, UTF8encode:function(s) {
    return unescape(encodeURIComponent(s));
  }, UTF8decode:function(s) {
    return decodeURIComponent(escape(s));
  }, tpl:function() {
    var out = "", render = true;
    if (arguments.length == 2 && $.isArray(arguments[1])) {
      this[arguments[0]] = arguments[1].join("");
      return jQuery;
    }
    if (arguments.length == 2 && $.isString(arguments[1])) {
      this[arguments[0]] = arguments[1];
      return jQuery;
    }
    if (arguments.length == 1) {
      return $(this[arguments[0]]);
    }
    if (arguments.length == 2 && arguments[1] == false) {
      return this[arguments[0]];
    }
    if (arguments.length == 2 && $.isObject(arguments[1])) {
      return $($.format(this[arguments[0]], arguments[1]));
    }
    if (arguments.length == 3 && $.isObject(arguments[1])) {
      return arguments[2] == true ? $.format(this[arguments[0]], arguments[1]) : $($.format(this[arguments[0]], arguments[1]));
    }
  }};
  var Argument = function(arg, args) {
    this.__arg = arg;
    this.__args = args;
    this.__max_precision = parseFloat("1." + (new Array(32)).join("1"), 10).toString().length - 3;
    this.__def_precision = 6;
    this.getString = function() {
      return this.__arg;
    };
    this.getKey = function() {
      return this.__arg.split(":")[0];
    };
    this.getFormat = function() {
      var match = this.getString().split(":");
      return match && match[1] ? match[1] : "s";
    };
    this.getPrecision = function() {
      var match = this.getFormat().match(/\.(\d+|\*)/g);
      if (!match) {
        return this.__def_precision;
      } else {
        match = match[0].slice(1);
        if (match != "*") {
          return parseInt(match, 10);
        } else {
          if (strings.strConversion.__getType(this.__args) == "array") {
            return this.__args[1] && this.__args[0] || this.__def_precision;
          } else {
            if (strings.strConversion.__getType(this.__args) == "object") {
              return this.__args[this.getKey()] && this.__args[this.getKey()][0] || this.__def_precision;
            } else {
              return this.__def_precision;
            }
          }
        }
      }
    };
    this.getPaddingLength = function() {
      var match = false;
      if (this.isAlternate()) {
        match = this.getString().match(/0?#0?(\d+)/);
        if (match && match[1]) {
          return parseInt(match[1], 10);
        }
      }
      match = this.getString().match(/(0|\.)(\d+|\*)/g);
      return match && parseInt(match[0].slice(1), 10) || 0;
    };
    this.getPaddingString = function() {
      var o = "";
      if (this.isAlternate()) {
        o = " ";
      }
      if (this.getFormat().match(/#0|0#|^0|\.\d+/)) {
        o = "0";
      }
      return o;
    };
    this.getFlags = function() {
      var match = this.getString().matc(/^(0|\#|\-|\+|\s)+/);
      return match && match[0].split("") || [];
    };
    this.isAlternate = function() {
      return!!this.getFormat().match(/^0?#/);
    };
  };
  var arguments2Array = function(args, shift) {
    var o = [];
    for (l = args.length, x = (shift || 0) - 1;x < l;x++) {
      o.push(args[x]);
    }
    return o;
  };
  $.extend(strings);
})(jQuery);
(function($) {
  $.toJSON = function(o) {
    if (typeof JSON == "object" && JSON.stringify) {
      return JSON.stringify(o);
    }
    var type = typeof o;
    if (o === null) {
      return "null";
    }
    if (type == "undefined") {
      return undefined;
    }
    if (type == "number" || type == "boolean") {
      return o + "";
    }
    if (type == "string") {
      return $.quoteString(o);
    }
    if (type == "object") {
      if (typeof o.toJSON == "function") {
        return $.toJSON(o.toJSON());
      }
      if (o.constructor === Date) {
        var month = o.getUTCMonth() + 1;
        if (month < 10) {
          month = "0" + month;
        }
        var day = o.getUTCDate();
        if (day < 10) {
          day = "0" + day;
        }
        var year = o.getUTCFullYear();
        var hours = o.getUTCHours();
        if (hours < 10) {
          hours = "0" + hours;
        }
        var minutes = o.getUTCMinutes();
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        var seconds = o.getUTCSeconds();
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        var milli = o.getUTCMilliseconds();
        if (milli < 100) {
          milli = "0" + milli;
        }
        if (milli < 10) {
          milli = "0" + milli;
        }
        return'"' + year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + "." + milli + 'Z"';
      }
      if (o.constructor === Array) {
        var ret = [];
        for (var i = 0;i < o.length;i++) {
          ret.push($.toJSON(o[i]) || "null");
        }
        return "[" + ret.join(",") + "]";
      }
      var pairs = [];
      for (var k in o) {
        var name;
        var type = typeof k;
        if (type == "number") {
          name = '"' + k + '"';
        } else {
          if (type == "string") {
            name = $.quoteString(k);
          } else {
            continue;
          }
        }
        if (typeof o[k] == "function") {
          continue;
        }
        var val = $.toJSON(o[k]);
        pairs.push(name + ":" + val);
      }
      return "{" + pairs.join(", ") + "}";
    }
  };
  $.evalJSON = function(src) {
    if (typeof JSON == "object" && JSON.parse) {
      return JSON.parse(src);
    }
    return eval("(" + src + ")");
  };
  $.secureEvalJSON = function(src) {
    if (typeof JSON == "object" && JSON.parse) {
      return JSON.parse(src);
    }
    var filtered = src;
    filtered = filtered.replace(/\\["\\\/bfnrtu]/g, "@");
    filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]");
    filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, "");
    if (/^[\],:{}\s]*$/.test(filtered)) {
      return eval("(" + src + ")");
    } else {
      throw new SyntaxError("Error parsing JSON, source is not valid.");
    }
  };
  $.quoteString = function(string) {
    if (string.match(_escapeable)) {
      return'"' + string.replace(_escapeable, function(a) {
        var c = _meta[a];
        if (typeof c === "string") {
          return c;
        }
        c = a.charCodeAt();
        return "\\u00" + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
      }) + '"';
    }
    return'"' + string + '"';
  };
  var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
  var _meta = {"\b":"\\b", "\t":"\\t", "\n":"\\n", "\f":"\\f", "\r":"\\r", '"':'\\"', "\\":"\\\\"};
})(jQuery);
(function($) {
  $.fn.addOption = function() {
    var add = function(el, v, t, sO) {
      var option = document.createElement("option");
      option.value = v, option.text = t;
      var o = el.options;
      var oL = o.length;
      if (!el.cache) {
        el.cache = {};
        for (var i = 0;i < oL;i++) {
          el.cache[o[i].value] = i;
        }
      }
      if (typeof el.cache[v] == "undefined") {
        el.cache[v] = oL;
      }
      el.options[el.cache[v]] = option;
      if (sO) {
        option.selected = true;
      }
    };
    var a = arguments;
    if (a.length == 0) {
      return this;
    }
    var sO = true;
    var m = false;
    var items, v, t;
    if (typeof a[0] == "object") {
      m = true;
      items = a[0];
    }
    if (a.length >= 2) {
      if (typeof a[1] == "boolean") {
        sO = a[1];
      } else {
        if (typeof a[2] == "boolean") {
          sO = a[2];
        }
      }
      if (!m) {
        v = a[0];
        t = a[1];
      }
    }
    this.each(function() {
      if (this.nodeName.toLowerCase() != "select") {
        return;
      }
      if (m) {
        for (var item in items) {
          add(this, item, items[item], sO);
        }
      } else {
        add(this, v, t, sO);
      }
    });
    return this;
  };
  $.fn.ajaxAddOption = function(url, params, select, fn, args) {
    if (typeof url != "string") {
      return this;
    }
    if (typeof params != "object") {
      params = {};
    }
    if (typeof select != "boolean") {
      select = true;
    }
    this.each(function() {
      var el = this;
      $.getJSON(url, params, function(r) {
        $(el).addOption(r, select);
        if (typeof fn == "function") {
          if (typeof args == "object") {
            fn.apply(el, args);
          } else {
            fn.call(el);
          }
        }
      });
    });
    return this;
  };
  $.fn.removeOption = function() {
    var a = arguments;
    if (a.length == 0) {
      return this;
    }
    var ta = typeof a[0];
    var v, index;
    if (ta == "string" || (ta == "object" || ta == "function")) {
      v = a[0];
      if (v.constructor == Array) {
        var l = v.length;
        for (var i = 0;i < l;i++) {
          this.removeOption(v[i], a[1]);
        }
        return this;
      }
    } else {
      if (ta == "number") {
        index = a[0];
      } else {
        return this;
      }
    }
    this.each(function() {
      if (this.nodeName.toLowerCase() != "select") {
        return;
      }
      if (this.cache) {
        this.cache = null;
      }
      var remove = false;
      var o = this.options;
      if (!!v) {
        var oL = o.length;
        for (var i = oL - 1;i >= 0;i--) {
          if (v.constructor == RegExp) {
            if (o[i].value.match(v)) {
              remove = true;
            }
          } else {
            if (o[i].value == v) {
              remove = true;
            }
          }
          if (remove && a[1] === true) {
            remove = o[i].selected;
          }
          if (remove) {
            o[i] = null;
          }
          remove = false;
        }
      } else {
        if (a[1] === true) {
          remove = o[index].selected;
        } else {
          remove = true;
        }
        if (remove) {
          this.remove(index);
        }
      }
    });
    return this;
  };
  $.fn.sortOptions = function(ascending) {
    var sel = $(this).selectedValues();
    var a = typeof ascending == "undefined" ? true : !!ascending;
    this.each(function() {
      if (this.nodeName.toLowerCase() != "select") {
        return;
      }
      var o = this.options;
      var oL = o.length;
      var sA = [];
      for (var i = 0;i < oL;i++) {
        sA[i] = {v:o[i].value, t:o[i].text};
      }
      sA.sort(function(o1, o2) {
        o1t = o1.t.toLowerCase(), o2t = o2.t.toLowerCase();
        if (o1t == o2t) {
          return 0;
        }
        if (a) {
          return o1t < o2t ? -1 : 1;
        } else {
          return o1t > o2t ? -1 : 1;
        }
      });
      for (var i = 0;i < oL;i++) {
        o[i].text = sA[i].t;
        o[i].value = sA[i].v;
      }
    }).selectOptions(sel, true);
    return this;
  };
  $.fn.selectOptions = function(value, clear) {
    var v = value;
    var vT = typeof value;
    if (vT == "object" && v.constructor == Array) {
      var $this = this;
      $.each(v, function() {
        $this.selectOptions(this, clear);
      });
    }
    var c = clear || false;
    if (vT != "string" && (vT != "function" && vT != "object")) {
      return this;
    }
    this.each(function() {
      if (this.nodeName.toLowerCase() != "select") {
        return this;
      }
      var o = this.options;
      var oL = o.length;
      for (var i = 0;i < oL;i++) {
        if (v.constructor == RegExp) {
          if (o[i].value.match(v)) {
            o[i].selected = true;
          } else {
            if (c) {
              o[i].selected = false;
            }
          }
        } else {
          if (o[i].value == v) {
            o[i].selected = true;
          } else {
            if (c) {
              o[i].selected = false;
            }
          }
        }
      }
    });
    return this;
  };
  $.fn.copyOptions = function(to, which) {
    var w = which || "selected";
    if ($(to).size() == 0) {
      return this;
    }
    this.each(function() {
      if (this.nodeName.toLowerCase() != "select") {
        return this;
      }
      var o = this.options;
      var oL = o.length;
      for (var i = 0;i < oL;i++) {
        if (w == "all" || w == "selected" && o[i].selected) {
          $(to).addOption(o[i].value, o[i].text);
        }
      }
    });
    return this;
  };
  $.fn.containsOption = function(value, fn) {
    var found = false;
    var v = value;
    var vT = typeof v;
    var fT = typeof fn;
    if (vT != "string" && (vT != "function" && vT != "object")) {
      return fT == "function" ? this : found;
    }
    this.each(function() {
      if (this.nodeName.toLowerCase() != "select") {
        return this;
      }
      if (found && fT != "function") {
        return false;
      }
      var o = this.options;
      var oL = o.length;
      for (var i = 0;i < oL;i++) {
        if (v.constructor == RegExp) {
          if (o[i].value.match(v)) {
            found = true;
            if (fT == "function") {
              fn.call(o[i], i);
            }
          }
        } else {
          if (o[i].value == v) {
            found = true;
            if (fT == "function") {
              fn.call(o[i], i);
            }
          }
        }
      }
    });
    return fT == "function" ? this : found;
  };
  $.fn.selectedValues = function() {
    var v = [];
    this.selectedOptions().each(function() {
      v[v.length] = this.value;
    });
    return v;
  };
  $.fn.selectedTexts = function() {
    var t = [];
    this.selectedOptions().each(function() {
      t[t.length] = this.text;
    });
    return t;
  };
  $.fn.selectedOptions = function() {
    return this.find("option:selected");
  };
})(jQuery);
(function($) {
  $.extend($.fn, {swapClass:function(c1, c2) {
    var c1Elements = this.filter("." + c1);
    this.filter("." + c2).removeClass(c2).addClass(c1);
    c1Elements.removeClass(c1).addClass(c2);
    return this;
  }, replaceClass:function(c1, c2) {
    return this.filter("." + c1).removeClass(c1).addClass(c2).end();
  }, hoverClass:function(className) {
    className = className || "hover";
    return this.hover(function() {
      $(this).addClass(className);
    }, function() {
      $(this).removeClass(className);
    });
  }, heightToggle:function(animated, callback) {
    animated ? this.animate({height:"toggle"}, animated, callback) : this.each(function() {
      jQuery(this)[jQuery(this).is(":hidden") ? "show" : "hide"]();
      if (callback) {
        callback.apply(this, arguments);
      }
    });
  }, heightHide:function(animated, callback) {
    if (animated) {
      this.animate({height:"hide"}, animated, callback);
    } else {
      this.hide();
      if (callback) {
        this.each(callback);
      }
    }
  }, prepareBranches:function(settings) {
    if (!settings.prerendered) {
      this.filter(":last-child:not(ul)").addClass(CLASSES.last);
      this.filter((settings.collapsed ? "" : "." + CLASSES.closed) + ":not(." + CLASSES.open + ")").find(">ul").hide();
    }
    return this.filter(":has(>ul)");
  }, applyClasses:function(settings, toggler) {
    if (!settings.prerendered) {
      this.filter(":has(>ul:hidden)").addClass(CLASSES.expandable).replaceClass(CLASSES.last, CLASSES.lastExpandable);
      this.not(":has(>ul:hidden)").addClass(CLASSES.collapsable).replaceClass(CLASSES.last, CLASSES.lastCollapsable);
      this.prepend('<div class="' + CLASSES.hitarea + '"/>').find("div." + CLASSES.hitarea).each(function() {
        var classes = "";
        $.each($(this).parent().attr("class").split(" "), function() {
          classes += this + "-hitarea ";
        });
        $(this).addClass(classes);
      });
    }
    this.find("div." + CLASSES.hitarea).click(toggler);
  }, treeview:function(settings) {
    settings = $.extend({cookieId:"treeview"}, settings);
    if (settings.add) {
      return this.trigger("add", [settings.add]);
    }
    if (settings.toggle) {
      var callback = settings.toggle;
      settings.toggle = function() {
        return callback.apply($(this).parent()[0], arguments);
      };
    }
    function treeController(tree, control) {
      function handler(filter) {
        return function() {
          toggler.apply($("div." + CLASSES.hitarea, tree).filter(function() {
            return filter ? $(this).parent("." + filter).length : true;
          }));
          return false;
        };
      }
      $("a:eq(0)", control).click(handler(CLASSES.collapsable));
      $("a:eq(1)", control).click(handler(CLASSES.expandable));
      $("a:eq(2)", control).click(handler());
    }
    function toggler() {
      $(this).parent().find(">.hitarea").swapClass(CLASSES.collapsableHitarea, CLASSES.expandableHitarea).swapClass(CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea).end().swapClass(CLASSES.collapsable, CLASSES.expandable).swapClass(CLASSES.lastCollapsable, CLASSES.lastExpandable).find(">ul").heightToggle(settings.animated, settings.toggle);
      if (settings.unique) {
        $(this).parent().siblings().find(">.hitarea").replaceClass(CLASSES.collapsableHitarea, CLASSES.expandableHitarea).replaceClass(CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea).end().replaceClass(CLASSES.collapsable, CLASSES.expandable).replaceClass(CLASSES.lastCollapsable, CLASSES.lastExpandable).find(">ul").heightHide(settings.animated, settings.toggle);
      }
    }
    function serialize() {
      function binary(arg) {
        return arg ? 1 : 0;
      }
      var data = [];
      branches.each(function(i, e) {
        data[i] = $(e).is(":has(>ul:visible)") ? 1 : 0;
      });
      $.cookie(settings.cookieId, data.join(""));
    }
    function deserialize() {
      var stored = $.cookie(settings.cookieId);
      if (stored) {
        var data = stored.split("");
        branches.each(function(i, e) {
          $(e).find(">ul")[parseInt(data[i]) ? "show" : "hide"]();
        });
      }
    }
    this.addClass("treeview");
    var branches = this.find("li").prepareBranches(settings);
    switch(settings.persist) {
      case "cookie":
        var toggleCallback = settings.toggle;
        settings.toggle = function() {
          serialize();
          if (toggleCallback) {
            toggleCallback.apply(this, arguments);
          }
        };
        deserialize();
        break;
      case "location":
        var current = this.find("a").filter(function() {
          return this.href.toLowerCase() == location.href.toLowerCase();
        });
        if (current.length) {
          current.addClass("selected").parents("ul, li").add(current.next()).show();
        }
        break;
    }
    branches.applyClasses(settings, toggler);
    if (settings.control) {
      treeController(this, settings.control);
      $(settings.control).show();
    }
    return this.bind("add", function(event, branches) {
      $(branches).prev().removeClass(CLASSES.last).removeClass(CLASSES.lastCollapsable).removeClass(CLASSES.lastExpandable).find(">.hitarea").removeClass(CLASSES.lastCollapsableHitarea).removeClass(CLASSES.lastExpandableHitarea);
      $(branches).find("li").andSelf().prepareBranches(settings).applyClasses(settings, toggler);
    });
  }});
  var CLASSES = $.fn.treeview.classes = {open:"open", closed:"closed", expandable:"expandable", expandableHitarea:"expandable-hitarea", lastExpandableHitarea:"lastExpandable-hitarea", collapsable:"collapsable", collapsableHitarea:"collapsable-hitarea", lastCollapsableHitarea:"lastCollapsable-hitarea", lastCollapsable:"lastCollapsable", lastExpandable:"lastExpandable", last:"last", hitarea:"hitarea"};
  $.fn.Treeview = $.fn.treeview;
})(jQuery);
(function($, undefined) {
  $.support.htmlMenuitem = "HTMLMenuItemElement" in window;
  $.support.htmlCommand = "HTMLCommandElement" in window;
  $.support.eventSelectstart = "onselectstart" in document.documentElement;
  if (!$.ui || !$.ui.widget) {
    var _cleanData = $.cleanData;
    $.cleanData = function(elems) {
      for (var i = 0, elem;(elem = elems[i]) != null;i++) {
        try {
          $(elem).triggerHandler("remove");
        } catch (e) {
        }
      }
      _cleanData(elems);
    };
  }
  var $currentTrigger = null, initialized = false, $win = $(window), counter = 0, namespaces = {}, menus = {}, types = {}, defaults = {selector:null, appendTo:null, trigger:"right", autoHide:false, delay:200, reposition:false, determinePosition:function($menu) {
    if ($.ui && $.ui.position) {
      $menu.css("display", "block").position({my:"left top", at:"left bottom", of:this, offset:"0 5", collision:"fit"}).css("display", "none");
    } else {
      var offset = this.offset();
      offset.top += this.outerHeight();
      offset.left += this.outerWidth() / 2 - $menu.outerWidth() / 2;
      $menu.css(offset);
    }
  }, position:function(opt, x, y) {
    var $this = this, offset;
    if (!x && !y) {
      opt.determinePosition.call(this, opt.$menu);
      return;
    } else {
      if (x === "maintain" && y === "maintain") {
        offset = opt.$menu.position();
      } else {
        offset = {top:y, left:x};
      }
    }
    var bottom = $win.scrollTop() + $win.height(), right = $win.scrollLeft() + $win.width(), height = opt.$menu.height(), width = opt.$menu.width();
    if (offset.top + height > bottom) {
      offset.top -= height;
    }
    if (offset.top < 0) {
      offset.top = 0;
    }
    if (offset.left + width > right) {
      offset.left -= width;
    }
    opt.$menu.css(offset);
  }, positionSubmenu:function($menu) {
    if ($.ui && $.ui.position) {
      $menu.css("display", "block").position({my:"left top", at:"right top", of:this, collision:"flipfit fit"}).css("display", "");
    } else {
      var offset = {top:0, left:this.outerWidth()};
      $menu.css(offset);
    }
  }, zIndex:6101, animation:{duration:0, show:"slideDown", hide:"slideUp"}, events:{show:$.noop, hide:$.noop}, callback:null, items:{}}, hoveract = {timer:null, pageX:null, pageY:null}, zindex = function($t) {
    return 6100;
    var zin = 0, $tt = $t;
    while (true) {
      zin = Math.max(zin, parseInt($tt.css("z-index"), 10) || 0);
      $tt = $tt.parent();
      if (!$tt || (!$tt.length || "html body".indexOf($tt.prop("nodeName").toLowerCase()) > -1)) {
        break;
      }
    }
    return zin;
  }, handle = {abortevent:function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }, contextmenu:function(e) {
    var $this = $(this);
    if (e.data.trigger == "right") {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    if (e.data.trigger != "right" && e.originalEvent) {
      return;
    }
    if ($this.hasClass("context-menu-active")) {
      return;
    }
    if (!$this.hasClass("context-menu-disabled")) {
      $currentTrigger = $this;
      if (e.data.build) {
        var built = e.data.build($currentTrigger, e);
        if (built === false) {
          return;
        }
        if (built.callback !== undefined && built.callback != null) {
          e.data.callback = built.callback;
        }
        e.data = $.extend(true, {}, built, defaults, e.data || {});
        if (!e.data.items || $.isEmptyObject(e.data.items)) {
          if (window.console) {
            (console.error || console.log).call(console, "No items specified to show in contextMenu");
          }
          throw new Error("No Items specified");
        }
        e.data.$trigger = $currentTrigger;
        op.create(e.data);
      }
      op.show.call($this, e.data, e.pageX, e.pageY);
    }
  }, click:function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    $(this).trigger($.Event("contextmenu", {data:e.data, pageX:e.pageX, pageY:e.pageY}));
  }, mousedown:function(e) {
    var $this = $(this);
    if ($currentTrigger && ($currentTrigger.length && !$currentTrigger.is($this))) {
      $currentTrigger.data("contextMenu").$menu.trigger("contextmenu:hide");
    }
    if (e.button == 2) {
      $currentTrigger = $this.data("contextMenuActive", true);
    }
  }, mouseup:function(e) {
    var $this = $(this);
    if ($this.data("contextMenuActive") && ($currentTrigger && ($currentTrigger.length && ($currentTrigger.is($this) && !$this.hasClass("context-menu-disabled"))))) {
      e.preventDefault();
      e.stopImmediatePropagation();
      $currentTrigger = $this;
      $this.trigger($.Event("contextmenu", {data:e.data, pageX:e.pageX, pageY:e.pageY}));
    }
    $this.removeData("contextMenuActive");
  }, mouseenter:function(e) {
    var $this = $(this), $related = $(e.relatedTarget), $document = $(document);
    if ($related.is(".context-menu-list") || $related.closest(".context-menu-list").length) {
      return;
    }
    if ($currentTrigger && $currentTrigger.length) {
      return;
    }
    hoveract.pageX = e.pageX;
    hoveract.pageY = e.pageY;
    hoveract.data = e.data;
    $document.on("mousemove.contextMenuShow", handle.mousemove);
    hoveract.timer = setTimeout(function() {
      hoveract.timer = null;
      $document.off("mousemove.contextMenuShow");
      $currentTrigger = $this;
      $this.trigger($.Event("contextmenu", {data:hoveract.data, pageX:hoveract.pageX, pageY:hoveract.pageY}));
    }, e.data.delay);
  }, mousemove:function(e) {
    hoveract.pageX = e.pageX;
    hoveract.pageY = e.pageY;
  }, mouseleave:function(e) {
    var $related = $(e.relatedTarget);
    if ($related.is(".context-menu-list") || $related.closest(".context-menu-list").length) {
      return;
    }
    try {
      clearTimeout(hoveract.timer);
    } catch (e) {
    }
    hoveract.timer = null;
  }, layerClick:function(e) {
    var $this = $(this), root = $this.data("contextMenuRoot"), button = e.button, x = e.pageX, y = e.pageY, target, offset;
    e.preventDefault();
    e.stopImmediatePropagation();
    setTimeout(function() {
      var $window;
      var triggerAction = root.trigger == "left" && button === 0 || root.trigger == "right" && button === 2;
      if (document.elementFromPoint && root.$layer) {
        root.$layer.hide();
        target = document.elementFromPoint(x - $win.scrollLeft(), y - $win.scrollTop());
        root.$layer.show();
      }
      if (root.reposition && triggerAction) {
        if (document.elementFromPoint) {
          if (root.$trigger.is(target) || root.$trigger.has(target).length) {
            root.position.call(root.$trigger, root, x, y);
            return;
          }
        } else {
          offset = root.$trigger.offset();
          $window = $(window);
          offset.top += $window.scrollTop();
          if (offset.top <= e.pageY) {
            offset.left += $window.scrollLeft();
            if (offset.left <= e.pageX) {
              offset.bottom = offset.top + root.$trigger.outerHeight();
              if (offset.bottom >= e.pageY) {
                offset.right = offset.left + root.$trigger.outerWidth();
                if (offset.right >= e.pageX) {
                  root.position.call(root.$trigger, root, x, y);
                  return;
                }
              }
            }
          }
        }
      }
      if (target && triggerAction) {
        root.$trigger.one("contextmenu:hidden", function() {
          $(target).contextMenu({x:x, y:y});
        });
      }
      root.$menu.trigger("contextmenu:hide");
    }, 50);
  }, keyStop:function(e, opt) {
    if (!opt.isInput) {
      e.preventDefault();
    }
    e.stopPropagation();
  }, key:function(e) {
    var opt = {};
    if ($currentTrigger) {
      opt = $currentTrigger.data("contextMenu") || {};
    }
    switch(e.keyCode) {
      case 9:
      ;
      case 38:
        handle.keyStop(e, opt);
        if (opt.isInput) {
          if (e.keyCode == 9 && e.shiftKey) {
            e.preventDefault();
            opt.$selected && opt.$selected.find("input, textarea, select").blur();
            opt.$menu.trigger("prevcommand");
            return;
          } else {
            if (e.keyCode == 38 && opt.$selected.find("input, textarea, select").prop("type") == "checkbox") {
              e.preventDefault();
              return;
            }
          }
        } else {
          if (e.keyCode != 9 || e.shiftKey) {
            opt.$menu.trigger("prevcommand");
            return;
          }
        }
      ;
      case 40:
        handle.keyStop(e, opt);
        if (opt.isInput) {
          if (e.keyCode == 9) {
            e.preventDefault();
            opt.$selected && opt.$selected.find("input, textarea, select").blur();
            opt.$menu.trigger("nextcommand");
            return;
          } else {
            if (e.keyCode == 40 && opt.$selected.find("input, textarea, select").prop("type") == "checkbox") {
              e.preventDefault();
              return;
            }
          }
        } else {
          opt.$menu.trigger("nextcommand");
          return;
        }
        break;
      case 37:
        handle.keyStop(e, opt);
        if (opt.isInput || (!opt.$selected || !opt.$selected.length)) {
          break;
        }
        if (!opt.$selected.parent().hasClass("context-menu-root")) {
          var $parent = opt.$selected.parent().parent();
          opt.$selected.trigger("contextmenu:blur");
          opt.$selected = $parent;
          return;
        }
        break;
      case 39:
        handle.keyStop(e, opt);
        if (opt.isInput || (!opt.$selected || !opt.$selected.length)) {
          break;
        }
        var itemdata = opt.$selected.data("contextMenu") || {};
        if (itemdata.$menu && opt.$selected.hasClass("context-menu-submenu")) {
          opt.$selected = null;
          itemdata.$selected = null;
          itemdata.$menu.trigger("nextcommand");
          return;
        }
        break;
      case 35:
      ;
      case 36:
        if (opt.$selected && opt.$selected.find("input, textarea, select").length) {
          return;
        } else {
          (opt.$selected && opt.$selected.parent() || opt.$menu).children(":not(.disabled, .not-selectable)")[e.keyCode == 36 ? "first" : "last"]().trigger("contextmenu:focus");
          e.preventDefault();
          return;
        }
        break;
      case 13:
        handle.keyStop(e, opt);
        if (opt.isInput) {
          if (opt.$selected && !opt.$selected.is("textarea, select")) {
            e.preventDefault();
            return;
          }
          break;
        }
        opt.$selected && opt.$selected.trigger("mouseup");
        return;
      case 32:
      ;
      case 33:
      ;
      case 34:
        handle.keyStop(e, opt);
        return;
      case 27:
        handle.keyStop(e, opt);
        opt.$menu.trigger("contextmenu:hide");
        return;
      default:
        var k = String.fromCharCode(e.keyCode).toUpperCase();
        if (opt.accesskeys && opt.accesskeys[k]) {
          opt.accesskeys[k].$node.trigger(opt.accesskeys[k].$menu ? "contextmenu:focus" : "mouseup");
          return;
        }
        break;
    }
    e.stopPropagation();
    opt.$selected && opt.$selected.trigger(e);
  }, prevItem:function(e) {
    e.stopPropagation();
    var opt = $(this).data("contextMenu") || {};
    if (opt.$selected) {
      var $s = opt.$selected;
      opt = opt.$selected.parent().data("contextMenu") || {};
      opt.$selected = $s;
    }
    var $children = opt.$menu.children(), $prev = !opt.$selected || !opt.$selected.prev().length ? $children.last() : opt.$selected.prev(), $round = $prev;
    while ($prev.hasClass("disabled") || $prev.hasClass("not-selectable")) {
      if ($prev.prev().length) {
        $prev = $prev.prev();
      } else {
        $prev = $children.last();
      }
      if ($prev.is($round)) {
        return;
      }
    }
    if (opt.$selected) {
      handle.itemMouseleave.call(opt.$selected.get(0), e);
    }
    handle.itemMouseenter.call($prev.get(0), e);
    var $input = $prev.find("input, textarea, select");
    if ($input.length) {
      $input.focus();
    }
  }, nextItem:function(e) {
    e.stopPropagation();
    var opt = $(this).data("contextMenu") || {};
    if (opt.$selected) {
      var $s = opt.$selected;
      opt = opt.$selected.parent().data("contextMenu") || {};
      opt.$selected = $s;
    }
    var $children = opt.$menu.children(), $next = !opt.$selected || !opt.$selected.next().length ? $children.first() : opt.$selected.next(), $round = $next;
    while ($next.hasClass("disabled") || $next.hasClass("not-selectable")) {
      if ($next.next().length) {
        $next = $next.next();
      } else {
        $next = $children.first();
      }
      if ($next.is($round)) {
        return;
      }
    }
    if (opt.$selected) {
      handle.itemMouseleave.call(opt.$selected.get(0), e);
    }
    handle.itemMouseenter.call($next.get(0), e);
    var $input = $next.find("input, textarea, select");
    if ($input.length) {
      $input.focus();
    }
  }, focusInput:function(e) {
    var $this = $(this).closest(".context-menu-item"), data = $this.data(), opt = data.contextMenu, root = data.contextMenuRoot;
    root.$selected = opt.$selected = $this;
    root.isInput = opt.isInput = true;
  }, blurInput:function(e) {
    var $this = $(this).closest(".context-menu-item"), data = $this.data(), opt = data.contextMenu, root = data.contextMenuRoot;
    root.isInput = opt.isInput = false;
  }, menuMouseenter:function(e) {
    var root = $(this).data().contextMenuRoot;
    root.hovering = true;
  }, menuMouseleave:function(e) {
    var root = $(this).data().contextMenuRoot;
    if (root.$layer && root.$layer.is(e.relatedTarget)) {
      root.hovering = false;
    }
  }, itemMouseenter:function(e) {
    var $this = $(this), data = $this.data(), opt = data.contextMenu, root = data.contextMenuRoot;
    root.hovering = true;
    if (e && (root.$layer && root.$layer.is(e.relatedTarget))) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    (opt.$menu ? opt : root).$menu.children(".hover").trigger("contextmenu:blur");
    if ($this.hasClass("disabled") || $this.hasClass("not-selectable")) {
      opt.$selected = null;
      return;
    }
    $this.trigger("contextmenu:focus");
  }, itemMouseleave:function(e) {
    var $this = $(this), data = $this.data(), opt = data.contextMenu, root = data.contextMenuRoot;
    if (root !== opt && (root.$layer && root.$layer.is(e.relatedTarget))) {
      root.$selected && root.$selected.trigger("contextmenu:blur");
      e.preventDefault();
      e.stopImmediatePropagation();
      root.$selected = opt.$selected = opt.$node;
      return;
    }
    $this.trigger("contextmenu:blur");
  }, itemClick:function(e) {
    var $this = $(this), data = $this.data(), opt = data.contextMenu, root = data.contextMenuRoot, key = data.contextMenuKey, callback;
    if (!opt.items[key] || $this.is(".disabled, .context-menu-submenu, .context-menu-separator, .not-selectable")) {
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    if ($.isFunction(root.callbacks[key]) && Object.prototype.hasOwnProperty.call(root.callbacks, key)) {
      callback = root.callbacks[key];
    } else {
      if ($.isFunction(root.callback)) {
        callback = root.callback;
      } else {
        return;
      }
    }
    if (callback.call(root.$trigger, key, root, data) !== false) {
      root.$menu.trigger("contextmenu:hide");
    } else {
      if (root.$menu.parent().length) {
        op.update.call(root.$trigger, root);
      }
    }
  }, inputClick:function(e) {
    e.stopImmediatePropagation();
  }, hideMenu:function(e, data) {
    var root = $(this).data("contextMenuRoot");
    op.hide.call(root.$trigger, root, data && data.force);
  }, focusItem:function(e) {
    e.stopPropagation();
    var $this = $(this), data = $this.data(), opt = data.contextMenu, root = data.contextMenuRoot;
    $this.addClass("hover").siblings(".hover").trigger("contextmenu:blur");
    opt.$selected = root.$selected = $this;
    if (opt.$node) {
      root.positionSubmenu.call(opt.$node, opt.$menu);
    }
  }, blurItem:function(e) {
    e.stopPropagation();
    var $this = $(this), data = $this.data(), opt = data.contextMenu;
    $this.removeClass("hover");
    opt.$selected = null;
  }}, op = {show:function(opt, x, y) {
    if (typeof globalMenu != "undefined" && globalMenu) {
      return;
    }
    globalMenu = true;
    var $trigger = $(this), css = {};
    $("#context-menu-layer").trigger("mousedown");
    opt.$trigger = $trigger;
    opt.x = x;
    opt.y = y;
    if (opt.events.show.call($trigger, opt) === false) {
      $currentTrigger = null;
      return;
    }
    op.update.call($trigger, opt);
    opt.position.call($trigger, opt, x, y);
    if (opt.zIndex) {
      css.zIndex = zindex($trigger) + opt.zIndex;
    }
    op.layer.call(opt.$menu, opt, css.zIndex);
    opt.$menu.find("ul").css("zIndex", css.zIndex + 1);
    opt.$menu.css(css)[opt.animation.show](opt.animation.duration, function() {
      $trigger.trigger("contextmenu:visible");
    });
    $trigger.data("contextMenu", opt).addClass("context-menu-active");
    $(document).off("keydown.contextMenu").on("keydown.contextMenu", handle.key);
    if (opt.autoHide) {
      $(document).on("mousemove.contextMenuAutoHide", function(e) {
        var pos = $trigger.offset();
        pos.right = pos.left + $trigger.outerWidth();
        pos.bottom = pos.top + $trigger.outerHeight();
        if (opt.$layer && (!opt.hovering && (!(e.pageX >= pos.left && e.pageX <= pos.right) || !(e.pageY >= pos.top && e.pageY <= pos.bottom)))) {
          opt.$menu.trigger("contextmenu:hide");
        }
      });
    }
  }, hide:function(opt, force) {
    var $trigger = $(this);
    if (!opt) {
      opt = $trigger.data("contextMenu") || {};
    }
    if (!force && (opt.events && opt.events.hide.call($trigger, opt) === false)) {
      return;
    }
    $trigger.removeData("contextMenu").removeClass("context-menu-active");
    if (opt.$layer) {
      setTimeout(function($layer) {
        return function() {
          $layer.remove();
        };
      }(opt.$layer), 10);
      try {
        delete opt.$layer;
      } catch (e) {
        opt.$layer = null;
      }
    }
    $currentTrigger = null;
    opt.$menu.find(".hover").trigger("contextmenu:blur");
    opt.$selected = null;
    $(document).off(".contextMenuAutoHide").off("keydown.contextMenu");
    opt.$menu && opt.$menu[opt.animation.hide](opt.animation.duration, function() {
      if (opt.build) {
        opt.$menu.remove();
        $.each(opt, function(key, value) {
          switch(key) {
            case "ns":
            ;
            case "selector":
            ;
            case "build":
            ;
            case "trigger":
              return true;
            default:
              opt[key] = undefined;
              try {
                delete opt[key];
              } catch (e) {
              }
              return true;
          }
        });
      }
      setTimeout(function() {
        $trigger.trigger("contextmenu:hidden");
      }, 10);
    });
    globalMenu = false;
  }, create:function(opt, root) {
    if (root === undefined) {
      root = opt;
    }
    opt.$menu = $('<ul class="context-menu-list"></ul>').addClass(opt.className || "").data({"contextMenu":opt, "contextMenuRoot":root});
    $.each(["callbacks", "commands", "inputs"], function(i, k) {
      opt[k] = {};
      if (!root[k]) {
        root[k] = {};
      }
    });
    root.accesskeys || (root.accesskeys = {});
    $.each(opt.items, function(key, item) {
      var $t = $('<li class="context-menu-item"></li>').addClass(item.className || ""), $label = null, $input = null;
      $t.on("click", $.noop);
      item.$node = $t.data({"contextMenu":opt, "contextMenuRoot":root, "contextMenuKey":key});
      if (item.accesskey) {
        var aks = splitAccesskey(item.accesskey);
        for (var i = 0, ak;ak = aks[i];i++) {
          if (!root.accesskeys[ak]) {
            root.accesskeys[ak] = item;
            item._name = item.name.replace(new RegExp("(" + ak + ")", "i"), '<span class="context-menu-accesskey">$1</span>');
            break;
          }
        }
      }
      if (typeof item == "string") {
        $t.addClass("context-menu-separator not-selectable");
      } else {
        if (item.type && types[item.type]) {
          types[item.type].call($t, item, opt, root);
          $.each([opt, root], function(i, k) {
            k.commands[key] = item;
            if ($.isFunction(item.callback)) {
              k.callbacks[key] = item.callback;
            }
          });
        } else {
          if (item.type == "html") {
            $t.addClass("context-menu-html not-selectable");
          } else {
            if (item.type) {
              $label = $("<label></label>").appendTo($t);
              $("<span></span>").html(item._name || item.name).appendTo($label);
              $t.addClass("context-menu-input");
              opt.hasTypes = true;
              $.each([opt, root], function(i, k) {
                k.commands[key] = item;
                k.inputs[key] = item;
              });
            } else {
              if (item.items) {
                item.type = "sub";
              }
            }
          }
          switch(item.type) {
            case "text":
              $input = $('<input type="text" value="1" name="" value="">').attr("name", "context-menu-input-" + key).val(item.value || "").appendTo($label);
              break;
            case "textarea":
              $input = $('<textarea name=""></textarea>').attr("name", "context-menu-input-" + key).val(item.value || "").appendTo($label);
              if (item.height) {
                $input.height(item.height);
              }
              break;
            case "checkbox":
              $input = $('<input type="checkbox" value="1" name="" value="">').attr("name", "context-menu-input-" + key).val(item.value || "").prop("checked", !!item.selected).prependTo($label);
              break;
            case "radio":
              $input = $('<input type="radio" value="1" name="" value="">').attr("name", "context-menu-input-" + item.radio).val(item.value || "").prop("checked", !!item.selected).prependTo($label);
              break;
            case "select":
              $input = $('<select name="">').attr("name", "context-menu-input-" + key).appendTo($label);
              if (item.options) {
                $.each(item.options, function(value, text) {
                  $("<option></option>").val(value).text(text).appendTo($input);
                });
                $input.val(item.selected);
              }
              break;
            case "sub":
              $("<span></span>").html(item._name || item.name).appendTo($t);
              item.appendTo = item.$node;
              op.create(item, root);
              $t.data("contextMenu", item).addClass("context-menu-submenu");
              item.callback = null;
              break;
            case "html":
              $(item.html).appendTo($t);
              break;
            default:
              $.each([opt, root], function(i, k) {
                k.commands[key] = item;
                if ($.isFunction(item.callback)) {
                  k.callbacks[key] = item.callback;
                }
              });
              $("<span></span>").html(item._name || (item.name || "")).appendTo($t);
              break;
          }
          if (item.type && (item.type != "sub" && item.type != "html")) {
            $input.on("focus", handle.focusInput).on("blur", handle.blurInput);
            if (item.events) {
              $input.on(item.events, opt);
            }
          }
          if (item.icon) {
            $t.addClass("icon icon-" + item.icon);
          }
        }
      }
      item.$input = $input;
      item.$label = $label;
      $t.appendTo(opt.$menu);
      if (!opt.hasTypes && $.support.eventSelectstart) {
        $t.on("selectstart.disableTextSelect", handle.abortevent);
      }
    });
    if (!opt.$node) {
      opt.$menu.css("display", "none").addClass("context-menu-root");
    }
    opt.$menu.appendTo(opt.appendTo || document.body);
  }, resize:function($menu, nested) {
    $menu.css({position:"absolute", display:"block"});
    $menu.data("width", Math.ceil($menu.width()) + 1);
    $menu.css({position:"static", minWidth:"0px", maxWidth:"100000px"});
    $menu.find("> li > ul").each(function() {
      op.resize($(this), true);
    });
    if (!nested) {
      $menu.find("ul").addBack().css({position:"", display:"", minWidth:"", maxWidth:""}).width(function() {
        return $(this).data("width");
      });
    }
  }, update:function(opt, root) {
    var $trigger = this;
    if (root === undefined) {
      root = opt;
      op.resize(opt.$menu);
    }
    opt.$menu.children().each(function() {
      var $item = $(this), key = $item.data("contextMenuKey"), item = opt.items[key], disabled = $.isFunction(item.disabled) && item.disabled.call($trigger, key, root) || item.disabled === true;
      $item[disabled ? "addClass" : "removeClass"]("disabled");
      if (item.type) {
        $item.find("input, select, textarea").prop("disabled", disabled);
        switch(item.type) {
          case "text":
          ;
          case "textarea":
            item.$input.val(item.value || "");
            break;
          case "checkbox":
          ;
          case "radio":
            item.$input.val(item.value || "").prop("checked", !!item.selected);
            break;
          case "select":
            item.$input.val(item.selected || "");
            break;
        }
      }
      if (item.$menu) {
        op.update.call($trigger, item, root);
      }
    });
  }, layer:function(opt, zIndex) {
    var $l = $("#context-menu-layer");
    if ($l) {
      $l.remove();
    }
    var $layer = opt.$layer = $('<div id="context-menu-layer" style="position:fixed; z-index:' + zIndex + '; top:0; left:0; opacity: 0; filter: alpha(opacity=0); background-color: #000;"></div>').css({height:$win.height(), width:$win.width(), display:"block"}).data("contextMenuRoot", opt).insertBefore(this).on("contextmenu", handle.abortevent).on("mousedown", handle.layerClick);
    if (document.body.style.maxWidth === undefined) {
      $layer.css({"position":"absolute", "height":$(document).height()});
    }
    return $layer;
  }};
  function splitAccesskey(val) {
    var t = val.split(/\s+/), keys = [];
    for (var i = 0, k;k = t[i];i++) {
      k = k.charAt(0).toUpperCase();
      keys.push(k);
    }
    return keys;
  }
  $.fn.contextMenu = function(operation) {
    if (operation === undefined) {
      this.first().trigger("contextmenu");
    } else {
      if (operation.x && operation.y) {
        this.first().trigger($.Event("contextmenu", {pageX:operation.x, pageY:operation.y}));
      } else {
        if (operation === "hide") {
          var $menu = this.first().data("contextMenu") ? this.first().data("contextMenu").$menu : null;
          $menu && $menu.trigger("contextmenu:hide");
        } else {
          if (operation === "destroy") {
            $.contextMenu("destroy", {context:this});
          } else {
            if (operation === "element") {
              if (this.data("contextMenu") != null) {
                return this.data("contextMenu").$menu;
              }
              return[];
            } else {
              if ($.isPlainObject(operation)) {
                operation.context = this;
                $.contextMenu("create", operation);
              } else {
                if (operation) {
                  this.removeClass("context-menu-disabled");
                } else {
                  if (!operation) {
                    this.addClass("context-menu-disabled");
                  }
                }
              }
            }
          }
        }
      }
    }
    return this;
  };
  $.contextMenu = function(operation, options) {
    if (typeof operation != "string") {
      options = operation;
      operation = "create";
    }
    if (typeof options == "string") {
      options = {selector:options};
    } else {
      if (options === undefined) {
        options = {};
      }
    }
    var o = $.extend(true, {}, defaults, options || {});
    var $document = $(document);
    var $context = $document;
    var _hasContext = false;
    if (!o.context || !o.context.length) {
      o.context = document;
    } else {
      $context = $(o.context).first();
      o.context = $context.get(0);
      _hasContext = o.context !== document;
    }
    switch(operation) {
      case "create":
        if (!o.selector) {
          throw new Error("No selector specified");
        }
        if (o.selector.match(/.context-menu-(list|item|input)($|\s)/)) {
          throw new Error('Cannot bind to selector "' + o.selector + '" as it contains a reserved className');
        }
        if (!o.build && (!o.items || $.isEmptyObject(o.items))) {
          throw new Error("No Items specified");
        }
        counter++;
        o.ns = ".contextMenu" + counter;
        if (!_hasContext) {
          namespaces[o.selector] = o.ns;
        }
        menus[o.ns] = o;
        if (!o.trigger) {
          o.trigger = "right";
        }
        if (!initialized) {
          $document.on({"contextmenu:hide.contextMenu":handle.hideMenu, "prevcommand.contextMenu":handle.prevItem, "nextcommand.contextMenu":handle.nextItem, "contextmenu.contextMenu":handle.abortevent, "mouseenter.contextMenu":handle.menuMouseenter, "mouseleave.contextMenu":handle.menuMouseleave}, ".context-menu-list").on("mouseup.contextMenu", ".context-menu-input", handle.inputClick).on({"mouseup.contextMenu":handle.itemClick, "contextmenu:focus.contextMenu":handle.focusItem, "contextmenu:blur.contextMenu":handle.blurItem, 
          "contextmenu.contextMenu":handle.abortevent, "mouseenter.contextMenu":handle.itemMouseenter, "mouseleave.contextMenu":handle.itemMouseleave}, ".context-menu-item");
          initialized = true;
        }
        $context.on("contextmenu" + o.ns, o.selector, o, handle.contextmenu);
        if (_hasContext) {
          $context.on("remove" + o.ns, function() {
            $(this).contextMenu("destroy");
          });
        }
        switch(o.trigger) {
          case "hover":
            $context.on("mouseenter" + o.ns, o.selector, o, handle.mouseenter).on("mouseleave" + o.ns, o.selector, o, handle.mouseleave);
            break;
          case "left":
            $context.on("click" + o.ns, o.selector, o, handle.click);
            break;
        }
        if (!o.build) {
          op.create(o);
        }
        break;
      case "destroy":
        var $visibleMenu;
        if (_hasContext) {
          var context = o.context;
          $.each(menus, function(ns, o) {
            if (o.context !== context) {
              return true;
            }
            $visibleMenu = $(".context-menu-list").filter(":visible");
            if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is($(o.context).find(o.selector))) {
              $visibleMenu.trigger("contextmenu:hide", {force:true});
            }
            try {
              if (menus[o.ns].$menu) {
                menus[o.ns].$menu.remove();
              }
              delete menus[o.ns];
            } catch (e) {
              menus[o.ns] = null;
            }
            $(o.context).off(o.ns);
            return true;
          });
        } else {
          if (!o.selector) {
            $document.off(".contextMenu .contextMenuAutoHide");
            $.each(menus, function(ns, o) {
              $(o.context).off(o.ns);
            });
            namespaces = {};
            menus = {};
            counter = 0;
            initialized = false;
            $("#context-menu-layer, .context-menu-list").remove();
          } else {
            if (namespaces[o.selector]) {
              $visibleMenu = $(".context-menu-list").filter(":visible");
              if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is(o.selector)) {
                $visibleMenu.trigger("contextmenu:hide", {force:true});
              }
              try {
                if (menus[namespaces[o.selector]].$menu) {
                  menus[namespaces[o.selector]].$menu.remove();
                }
                delete menus[namespaces[o.selector]];
              } catch (e) {
                menus[namespaces[o.selector]] = null;
              }
              $document.off(namespaces[o.selector]);
            }
          }
        }
        break;
      case "html5":
        if (!$.support.htmlCommand && !$.support.htmlMenuitem || typeof options == "boolean" && options) {
          $('menu[type="context"]').each(function() {
            if (this.id) {
              $.contextMenu({selector:"[contextmenu=" + this.id + "]", items:$.contextMenu.fromMenu(this)});
            }
          }).css("display", "none");
        }
        break;
      default:
        throw new Error('Unknown operation "' + operation + '"');;
    }
    return this;
  };
  $.contextMenu.setInputValues = function(opt, data) {
    if (data === undefined) {
      data = {};
    }
    $.each(opt.inputs, function(key, item) {
      switch(item.type) {
        case "text":
        ;
        case "textarea":
          item.value = data[key] || "";
          break;
        case "checkbox":
          item.selected = data[key] ? true : false;
          break;
        case "radio":
          item.selected = (data[item.radio] || "") == item.value ? true : false;
          break;
        case "select":
          item.selected = data[key] || "";
          break;
      }
    });
  };
  $.contextMenu.getInputValues = function(opt, data) {
    if (data === undefined) {
      data = {};
    }
    $.each(opt.inputs, function(key, item) {
      switch(item.type) {
        case "text":
        ;
        case "textarea":
        ;
        case "select":
          data[key] = item.$input.val();
          break;
        case "checkbox":
          data[key] = item.$input.prop("checked");
          break;
        case "radio":
          if (item.$input.prop("checked")) {
            data[item.radio] = item.value;
          }
          break;
      }
    });
    return data;
  };
  function inputLabel(node) {
    return node.id && $('label[for="' + node.id + '"]').val() || node.name;
  }
  function menuChildren(items, $children, counter) {
    if (!counter) {
      counter = 0;
    }
    $children.each(function() {
      var $node = $(this), node = this, nodeName = this.nodeName.toLowerCase(), label, item;
      if (nodeName == "label" && $node.find("input, textarea, select").length) {
        label = $node.html();
        $node = $node.children().first();
        node = $node.get(0);
        nodeName = node.nodeName.toLowerCase();
      }
      switch(nodeName) {
        case "menu":
          item = {name:$node.attr("label"), items:{}};
          counter = menuChildren(item.items, $node.children(), counter);
          break;
        case "a":
        ;
        case "button":
          item = {name:$node.html(), disabled:!!$node.attr("disabled"), callback:function() {
            return function() {
              $node.click();
            };
          }()};
          break;
        case "menuitem":
        ;
        case "command":
          switch($node.attr("type")) {
            case undefined:
            ;
            case "command":
            ;
            case "menuitem":
              item = {name:$node.attr("label"), disabled:!!$node.attr("disabled"), callback:function() {
                return function() {
                  $node.click();
                };
              }()};
              break;
            case "checkbox":
              item = {type:"checkbox", disabled:!!$node.attr("disabled"), name:$node.attr("label"), selected:!!$node.attr("checked")};
              break;
            case "radio":
              item = {type:"radio", disabled:!!$node.attr("disabled"), name:$node.attr("label"), radio:$node.attr("radiogroup"), value:$node.attr("id"), selected:!!$node.attr("checked")};
              break;
            default:
              item = undefined;
          }
          break;
        case "hr":
          item = "-------";
          break;
        case "input":
          switch($node.attr("type")) {
            case "text":
              item = {type:"text", name:label || inputLabel(node), disabled:!!$node.attr("disabled"), value:$node.val()};
              break;
            case "checkbox":
              item = {type:"checkbox", name:label || inputLabel(node), disabled:!!$node.attr("disabled"), selected:!!$node.attr("checked")};
              break;
            case "radio":
              item = {type:"radio", name:label || inputLabel(node), disabled:!!$node.attr("disabled"), radio:!!$node.attr("name"), value:$node.val(), selected:!!$node.attr("checked")};
              break;
            default:
              item = undefined;
              break;
          }
          break;
        case "select":
          item = {type:"select", name:label || inputLabel(node), disabled:!!$node.attr("disabled"), selected:$node.val(), options:{}};
          $node.children().each(function() {
            item.options[this.value] = $(this).html();
          });
          break;
        case "textarea":
          item = {type:"textarea", name:label || inputLabel(node), disabled:!!$node.attr("disabled"), value:$node.val()};
          break;
        case "label":
          break;
        default:
          item = {type:"html", html:$node.clone(true)};
          break;
      }
      if (item) {
        counter++;
        items["key" + counter] = item;
      }
    });
    return counter;
  }
  $.contextMenu.fromMenu = function(element) {
    var $this = $(element), items = {};
    menuChildren(items, $this.children());
    return items;
  };
  $.contextMenu.defaults = defaults;
  $.contextMenu.types = types;
  $.contextMenu.handle = handle;
  $.contextMenu.op = op;
  $.contextMenu.menus = menus;
})(jQuery);
var EditableSelectWrapper = function(id) {
  this.id = id;
  this.element = null;
  this.values = new Array;
  this.list_height = 0;
  this.list_item_height = 20;
  this.UpdateValues = function(values) {
    delete this.values;
    this.values = new Array;
    var li = new Array;
    for (var i = 0;i < values.length;i++) {
      var value = values[i];
      li.push('<li value="' + i + '" class="' + value.cssClass + '">' + escapeHTML(value.text) + "</li>");
      this.values.push(value.value);
    }
    this.element.html("<ul>" + li.join("\n") + "</ul>");
    var me = this;
    this.element.bindEx("mouseup", function(e) {
      var li = e.target;
      if (li.tagName.toUpperCase() != "LI") {
        return;
      }
      var $li = $(e.target);
      e.stopPropagation();
      this.currentContext.pickListItem($li.text(), me.currentContext.getListValue(li.value));
    }, this).bindEx("mousedown", function(e) {
      e.stopPropagation();
    }, this);
    this.adjustHeight();
    this.checkScroll(10);
  };
  this.adjustHeight = function() {
    this.element.css("visibility", "hidden");
    this.element.show();
    var elements = this.element.find("li");
    if (elements.length > 0) {
      this.list_item_height = elements[0].offsetHeight;
    }
    this.element.css("visibility", "visible");
    this.element.hide();
  };
  this.checkScroll = function(items_then_scroll) {
    if (this.element.find("li").length > items_then_scroll) {
      this.list_height = this.list_item_height * items_then_scroll;
      this.element.css("height", this.list_height + "px");
      this.element.css("overflow", "auto");
    } else {
      this.element.css("height", "auto");
      this.element.css("overflow", "visible");
    }
  };
  this.getListValue = function(index) {
    return this.values[index];
  };
  this.clearHighlightMatches = function() {
    this.element.find("li").removeClass("match");
  };
  this.highlightSelected = function(text) {
    var current_value = toLower(text);
    this.clearHighlightMatches();
    var matches = this.getMatchItems(current_value);
    $(matches).addClass("match");
    if (matches.length > 0) {
      this.selectListItem($(matches[0]));
    } else {
      this.selectFirstListItem();
    }
  };
  this.getMatchItemNext = function(text) {
    var current_value = toLower(text);
    var matches = this.getMatchItems(current_value);
    var current = this.getSelectedListItem();
    if (current.length > 0 && matches.length > 1) {
      var index = matches.indexOf(current[0]);
      if (index < matches.length - 1) {
        return $(matches[index + 1]);
      } else {
        return $(matches[0]);
      }
    }
    return null;
  };
  this.getMatchItemPrev = function(text) {
    var current_value = toLower(text);
    var matches = this.getMatchItems(current_value);
    var current = this.getSelectedListItem();
    if (current.length > 0 && matches.length > 1) {
      var index = matches.indexOf(current[0]);
      if (index > 0) {
        return $(matches[index - 1]);
      } else {
        return $(matches[matches.length - 1]);
      }
    }
    return null;
  };
  this.getMatchItems = function(text) {
    var result = [];
    if (isEmpty(text)) {
      return result;
    }
    var pattern = text.replace(/([$-/:-?{-~!"^_`\[\]\\])/g, "\\$1");
    var elements = this.element.find("li");
    for (var i = 0;i < elements.length;i++) {
      var li = elements[i];
      var li_text = toLower(!isEmpty(li.textContent) ? li.textContent : li.innerText);
      var li_value = toLower(this.getListValue(li.value));
      if (QB.Web.Grid.QuickFilterInExpressionMatchFromBeginning) {
        pattern = "(^" + text + ")|([.]" + text + ")";
      }
      if (text == li_text || text == li_value) {
        result.push(li);
      } else {
        if (li_text.test(pattern) || li_value.test(pattern)) {
          result.push(li);
        }
      }
    }
    return result;
  };
  this.clearSelectedListItem = function() {
    this.element.find("li.selected").removeClass("selected");
  };
  this.selectNewListItem = function(text, direction, userEdit) {
    var li = this.getSelectedListItem();
    if (!li.length) {
      li = this.selectFirstListItem();
    }
    var sib = null;
    if (direction == "down") {
      if (userEdit) {
        sib = this.getMatchItemNext(text);
      }
      if (sib == null) {
        sib = li.next();
      }
    } else {
      if (direction == "up") {
        if (userEdit) {
          sib = this.getMatchItemPrev(text);
        }
        if (sib == null) {
          sib = li.prev();
        }
      }
    }
    if (sib != null) {
      this.selectListItem(sib);
      this.unselectListItem(li);
    }
  };
  this.selectListItem = function(li) {
    this.clearSelectedListItem();
    li.addClass("selected");
    this.scrollToListItem(li);
  };
  this.selectFirstListItem = function() {
    var first = this.element.find("li:first");
    this.selectListItem(first);
    return first;
  };
  this.unselectListItem = function(list_item) {
    list_item.removeClass("selected");
  };
  this.getSelectedListItem = function() {
    return this.element.find("li.selected");
  };
  this.scrollToListItem = function(list_item) {
    if (this.list_height && (list_item != null && list_item.length > 0)) {
      this.element.scrollTop(list_item[0].offsetTop - this.list_height / 2);
    }
  };
  this.init = function() {
    this.element = $('<div class="editable-select-options"></div>').appendTo($(document.body));
  };
  this.init();
};
var EditableSelectStatic = {wrappers:{}, instances:[], handlers:{}, inited:false, context:null, init:function() {
  this.initEvents();
  this.inited = true;
}, initEvents:function() {
}, GetWrapper:function(wrapperId) {
  if (isEmpty(wrapperId) || isEmpty(this.wrappers[wrapperId])) {
    this.wrappers[wrapperId] = new EditableSelectWrapper(wrapperId);
  }
  return this.wrappers[wrapperId];
}, UpdateWrapper:function(id, values) {
  this.GetWrapper(id).UpdateValues(values);
}};
(function($) {
  $.fn.editableSelect = function(options) {
    if (!EditableSelectStatic.inited) {
      EditableSelectStatic.init();
    }
    var me = this;
    var defaults = {bg_iframe:false, onSelect:true, items_then_scroll:10, case_sensitive:false};
    var settings = $.extend(defaults, options);
    var instance = false;
    $(this).each(function(i, domElement) {
      var element = $(domElement);
      if (element.data("editable-selecter") == undefined) {
        EditableSelectStatic.instances.push(new EditableSelect(domElement, settings));
        element.data("editable-selecter", EditableSelectStatic.instances.length - 1);
      }
    });
    return $(this);
  };
  $.fn.editableSelectInstances = function() {
    var ret = [];
    $(this).each(function() {
      if ($(this).data("editable-selecter") !== undefined) {
        ret[ret.length] = EditableSelectStatic.instances[$(this).data("editable-selecter")];
      }
    });
    return ret;
  };
  var EditableSelect = function(select, settings) {
    this.init(select, settings);
  };
  EditableSelect.prototype = {isActive:false, settings:false, textControl:false, select:false, wrapper:false, wrapperId:null, list_is_visible:false, hide_on_blur_timeout:false, bg_iframe:false, padding_right:13, current_value:"", options_value:[], userEdit:false, autoShow:false, init:function(select, settings) {
    this.settings = settings;
    this.wrapperId = this.settings.wrapperId;
    this.wrapper = EditableSelectStatic.GetWrapper(this.wrapperId);
    this.handler = this.settings.onSelect;
    if (!isEmpty(this.wrapperId)) {
      EditableSelectStatic.handlers[this.wrapperId] = this.settings.onSelect;
    }
    this.options = [];
    if (!isEmpty(this.settings.options)) {
      this.options = this.settings.options;
    }
    this.select = $(select);
    this.textControl = $('<input type="text">');
    this.textControl.attr("aria-label", this.select.attr("aria-label"));
    this.textControl.val(this.settings.value);
    this.textControl.attr("name", this.select.attr("name"));
    this.textControl.data("editable-selecter", this.select.data("editable-selecter"));
    this.select.attr("disabled", "disabled");
    var id = this.select.attr("id");
    if (!id) {
      id = "editable-select" + EditableSelectStatic.instances.length;
    }
    this.id = id;
    this.textControl.attr("id", id);
    this.textControl.attr("autocomplete", "off");
    this.textControl.addClass("editable-select");
    this.select.attr("id", id + "_hidden_select");
    this.initInputEvents(this.textControl, this);
    this.duplicateOptions();
    this.positionElements();
    this.setWidths();
    if (this.settings.bg_iframe) {
      var bg_iframe = $('<iframe frameborder="0" class="editable-select-iframe" src="about:blank;"></iframe>');
      $(document.body).append(bg_iframe);
      bg_iframe.width(this.select.width() + 2);
      bg_iframe.height(this.wrapper.element.height());
      bg_iframe.css({top:this.wrapper.element.css("top"), left:this.wrapper.element.css("left")});
      this.bg_iframe = bg_iframe;
    }
  }, duplicateOptions:function() {
    var me = this;
    var wrapperCleared = false;
    var values = new Array;
    this.select.find("option").each(function(index, option) {
      var $option = $(option);
      var text = $option.text();
      var val = $option.attr("value");
      var selected = false;
      if ($option.attr("selected") || option.selected) {
        me.textControl.val(text);
        me.current_value = text;
        me.current_options_value = val;
        selected = true;
      }
      var cssClass = $option.attr("class");
      values.push({selected:selected, text:text, value:val, cssClass:cssClass});
    });
    if (values.length > 0) {
      this.wrapper.UpdateValues(values);
      this.wrapper.element.addClass("disable-selection");
      this.wrapper.checkScroll(this.settings.items_then_scroll);
    }
  }, getControl:function() {
    return this.textControl;
  }, onSelect:function(e) {
    var context = this.wrapper.currentContext;
    if (typeof context.handler == "function") {
      context.handler.call(context, context.textControl, e);
    }
  }, editStart:function() {
    if (this.isActive) {
      return;
    }
    this.isActive = true;
    this.current_value = this.textControl.val();
    this.userEdit = false;
    this.adjustWrapper(this);
    if (this.autoShow) {
      this.showList();
    }
  }, editEnd:function(e) {
    if (!this.isActive) {
      return;
    }
    this.wrapper.clearSelectedListItem();
    this.hideList();
    this.onSelect(e);
    this.isActive = false;
  }, onTextboxChanged:function(reset_options_value) {
    if (this.textControl.val() != this.current_value) {
      this.userEdit = true;
      this.current_value = this.textControl.val();
      this.wrapper.highlightSelected(this.textControl.val());
    }
  }, initInputEvents:function(textControl, me2) {
    var me = this;
    var timer = false;
    textControl.focus(function(e) {
      me.editStart();
    }).blur(function(e) {
      if (!me.list_is_visible) {
        me.editEnd(e);
      }
    }).click(function(e) {
      e.stopPropagation();
      me.editStart();
      if (e.pageX - $(this).offset().left > $(this).width() - 16) {
        if (me.list_is_visible) {
          me.hideList();
        } else {
          me.showList();
        }
      }
    }).keydown(function(e) {
      me.isActive = true;
      switch(e.keyCode) {
        case 40:
          if (!me.listIsVisible()) {
            me.showList();
          } else {
            e.preventDefault();
            me.wrapper.selectNewListItem(me.textControl.val(), "down", me.userEdit);
          }
          break;
        case 38:
          if (me.listIsVisible()) {
            e.preventDefault();
            me.wrapper.selectNewListItem(me.textControl.val(), "up", me.userEdit);
          } else {
            me.showList();
          }
          break;
        case 9:
          if (me.listIsVisible()) {
            var $li = me.wrapper.getSelectedListItem();
            if ($li.length) {
              me.pickListItem($li.text(), me.getListValue($li[0].value));
            }
          } else {
            me.editEnd();
          }
          break;
        case 27:
          e.preventDefault();
          me.editEnd();
          return false;
          break;
        case 13:
          e.preventDefault();
          if (me.list_is_visible) {
            var $li = me.wrapper.getSelectedListItem();
            if ($li.length) {
              me.pickListItem($li.text(), me.getListValue($li[0].value));
            }
          } else {
            me.editEnd();
          }
          return false;
          break;
      }
    }).keyup($.debounce(me.onTextboxChanged, 100, me)).keypress(function(e) {
      if (e.keyCode == 13) {
        e.preventDefault();
        return false;
      }
    });
  }, pickListItem:function(text, val) {
    this.current_value = text;
    this.current_options_value = val;
    this.textControl.val(val);
    this.editEnd();
  }, listIsVisible:function() {
    return this.list_is_visible;
  }, adjustWrapper:function(context) {
    this.adjustWrapperPosition();
    this.adjustWrapperSize();
    EditableSelectStatic.context = context;
    this.wrapper.currentContext = context;
  }, adjustWrapperPosition:function() {
    var offset = this.textControl.offset();
    offset.top += this.textControl[0].offsetHeight;
    this.wrapper.element.css({top:offset.top + "px", left:offset.left + "px"});
  }, adjustWrapperSize:function() {
    var width = this.textControl[0].clientWidth;
    this.wrapper.element.width(width);
  }, showList:function() {
    this.hideOtherLists();
    this.overlay = new $.ui.editableSelectOverlay.overlay(this);
    this.wrapper.element.show();
    this.adjustWrapper(this);
    this.list_is_visible = true;
    if (this.settings.bg_iframe) {
      this.bg_iframe.show();
    }
    this.wrapper.checkScroll(10);
    this.wrapper.highlightSelected(this.textControl.val());
  }, getListValue:function(index) {
    return this.wrapper.values[index];
  }, hideList:function() {
    if (this.overlay != null) {
      this.overlay.destroy();
    }
    this.wrapper.element.hide();
    this.list_is_visible = false;
    if (this.settings.bg_iframe) {
      this.bg_iframe.hide();
    }
  }, hideOtherLists:function() {
    for (var i = 0;i < EditableSelectStatic.instances.length;i++) {
      if (i != this.select.data("editable-selecter")) {
        EditableSelectStatic.instances[i].hideList();
      }
    }
  }, positionElements:function() {
    this.select.after(this.textControl);
    this.select.hide();
    $(document.body).append(this.wrapper.element);
  }, setWidths:function() {
    var width = this.select.width() + 2 * 0;
    if (this.bg_iframe) {
      this.bg_iframe.width(width + 4);
    }
  }};
  $.ui.editableSelectOverlay = {overlay:function(dialog) {
    this.$el = $.ui.editableSelectOverlay.overlay.create(dialog);
  }};
  $.extend($.ui.editableSelectOverlay.overlay, {self:this, instances:[], oldInstances:[], maxZ:4E3, events:$.map("focus,mousedown,keydown,keypress".split(","), function(event) {
    return event + ".dialog-overlay";
  }).join(" "), create:function(dialog) {
    if (this.instances.length === 0) {
      $(window).bind("resize.dialog-overlay", $.ui.editableSelectOverlay.overlay.resize);
    }
    var $el = $('<div class="editable-select-options-overlay"></div>').appendTo(dialog.textControl.parent()).css({width:this.width(), height:this.height()});
    $el.bind("mousedown.dialog-overlay", function(event) {
      dialog.editEnd();
      var element = document.elementFromPoint(event.clientX, event.clientY);
      if (element != null) {
        try {
          var eventName = "click";
          if (element.dispatchEvent) {
            var e = document.createEvent("MouseEvent");
            e.initMouseEvent(eventName, true, true, window, 0, event.screenX, event.screenY, event.clientX, event.clientY, false, false, false, false, 0, null);
            element.dispatchEvent(e);
          } else {
            if (element.fireEvent) {
              element.fireEvent("on" + eventName);
            }
          }
        } catch (err) {
        }
      }
    });
    if ($.fn.bgiframe) {
      $el.bgiframe();
    }
    this.instances.push($el);
    return $el;
  }, destroy:function($el) {
    if ($el != null) {
      $el.remove();
    }
    if (this.instances.length === 0) {
      $([document, window]).unbind(".dialog-overlay");
    }
  }, height:function() {
    var scrollHeight, offsetHeight;
    return $(document).height() + "px";
  }, width:function() {
    var scrollWidth, offsetWidth;
    return $(document).width() + "px";
  }, resize:function() {
    var $overlays = $([]);
    $.each($.ui.editableSelectOverlay.overlay.instances, function() {
      $overlays = $overlays.add(this);
    });
    $overlays.css({width:0, height:0}).css({width:$.ui.editableSelectOverlay.overlay.width(), height:$.ui.editableSelectOverlay.overlay.height()});
  }});
  $.extend($.ui.editableSelectOverlay.overlay.prototype, {destroy:function() {
    $.ui.editableSelectOverlay.overlay.destroy(this.$el);
  }});
})(jQuery);
(function($) {
  var R = $.refresh = $.fn.refresh = function(a, b, c) {
    return R.setup(opts.apply(this, arguments));
  };
  function opts(a, b, c) {
    var r = $.extend({}, R);
    if (typeof a == "string") {
      r.url = a;
      if (b && !$.isFunction(b)) {
        r.time = b;
      } else {
        c = b;
      }
      if (c) {
        r.success = c;
      }
    } else {
      $.extend(r, a);
    }
    if (!r.target) {
      r.target = this ? this : $;
    }
    if (!r.type && !$.rest) {
      r.type = "GET";
    }
    return r;
  }
  $.extend(R, {version:"0.5", url:null, time:178, success:null, method:null, setup:function(r) {
    if (r.cancel) {
      r.cancel();
    }
    r.id = setInterval(function() {
      r.refresh(r);
    }, r.time * 1E3);
    r.cancel = function() {
      clearInterval(r.id);
      return r;
    };
    return r;
  }, refresh:function(r) {
    if (r.lastReturn) {
      delete r.lastReturn;
    }
    r.lastReturn = r.target["ajax"](r);
  }});
})(jQuery);
jQuery.tableDnD = {currentTable:null, dragObject:null, mouseOffset:null, oldY:0, build:function(options) {
  this.each(function() {
    this.tableDnDConfig = jQuery.extend({onDragStyle:null, onDropStyle:null, onDragClass:"tDnD_whileDrag", onDrop:null, onDragStart:null, scrollAmount:5, serializeRegexp:/[^\-]*$/, serializeParamName:null, dragHandle:null}, options || {});
    jQuery.tableDnD.makeDraggable(this);
  });
  jQuery(document).bind("mousemove", jQuery.tableDnD.mousemove).bind("mouseup", jQuery.tableDnD.mouseup);
  return this;
}, makeDraggable:function(table) {
  var config = table.tableDnDConfig;
  if (table.tableDnDConfig.dragHandle) {
    $(document).on("mousedown", "#qb-ui-grid td." + table.tableDnDConfig.dragHandle, function(ev) {
      if ($(ev.currentTarget).parents("tr:first").next().length == 0) {
        return;
      }
      jQuery.tableDnD.dragObject = this.parentNode;
      jQuery.tableDnD.currentTable = table;
      jQuery.tableDnD.mouseOffset = jQuery.tableDnD.getMouseOffset(this, ev);
      if (config.onDragStart) {
        config.onDragStart(table, this);
      }
      return false;
    });
  } else {
    $(document).on("mousedown", "#qb-ui-grid table td." + table.tableDnDConfig.dragHandle, function(ev) {
      if (ev.target.tagName == "TD") {
        jQuery.tableDnD.dragObject = this;
        jQuery.tableDnD.currentTable = table;
        jQuery.tableDnD.mouseOffset = jQuery.tableDnD.getMouseOffset(this, ev);
        if (config.onDragStart) {
          config.onDragStart(table, this);
        }
        return false;
      }
    });
  }
}, updateTables:function() {
  this.each(function() {
    if (this.tableDnDConfig) {
      jQuery.tableDnD.makeDraggable(this);
    }
  });
}, mouseCoords:function(ev) {
  if (ev.pageX || ev.pageY) {
    return{x:ev.pageX, y:ev.pageY};
  }
  return{x:ev.clientX + document.body.scrollLeft - document.body.clientLeft, y:ev.clientY + document.body.scrollTop - document.body.clientTop};
}, getMouseOffset:function(target, ev) {
  ev = ev || window.event;
  var docPos = this.getPosition(target);
  var mousePos = this.mouseCoords(ev);
  return{x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
}, getPosition:function(e) {
  var left = 0;
  var top = 0;
  if (e.offsetHeight == 0) {
    e = e.firstChild;
  }
  while (e.offsetParent) {
    left += e.offsetLeft;
    top += e.offsetTop;
    e = e.offsetParent;
  }
  left += e.offsetLeft;
  top += e.offsetTop;
  return{x:left, y:top};
}, mousemove:function(ev) {
  if (jQuery.tableDnD.dragObject == null) {
    return;
  }
  var dragObj = jQuery(jQuery.tableDnD.dragObject);
  var config = jQuery.tableDnD.currentTable.tableDnDConfig;
  var mousePos = jQuery.tableDnD.mouseCoords(ev);
  var y = mousePos.y - jQuery.tableDnD.mouseOffset.y;
  var yOffset = window.pageYOffset;
  if (document.all) {
    if (typeof document.compatMode != "undefined" && document.compatMode != "BackCompat") {
      yOffset = document.documentElement.scrollTop;
    } else {
      if (typeof document.body != "undefined") {
        yOffset = document.body.scrollTop;
      }
    }
  }
  if (mousePos.y - yOffset < config.scrollAmount) {
    window.scrollBy(0, -config.scrollAmount);
  } else {
    var windowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
    if (windowHeight - (mousePos.y - yOffset) < config.scrollAmount) {
      window.scrollBy(0, config.scrollAmount);
    }
  }
  if (y != jQuery.tableDnD.oldY) {
    var movingDown = y > jQuery.tableDnD.oldY;
    jQuery.tableDnD.oldY = y;
    if (config.onDragClass) {
      dragObj.addClass(config.onDragClass);
    } else {
      dragObj.css(config.onDragStyle);
    }
    var currentRow = jQuery.tableDnD.findDropTargetRow(dragObj, y);
    if (currentRow && currentRow.className != "ui-qb-grid-row-header") {
      if (movingDown && jQuery.tableDnD.dragObject != currentRow) {
        jQuery.tableDnD.dragObject.parentNode.insertBefore(jQuery.tableDnD.dragObject, currentRow.nextSibling);
      } else {
        if (!movingDown && jQuery.tableDnD.dragObject != currentRow) {
          jQuery.tableDnD.dragObject.parentNode.insertBefore(jQuery.tableDnD.dragObject, currentRow);
        }
      }
    }
  }
  return false;
}, findDropTargetRow:function(draggedRow, y) {
  var rows = jQuery.tableDnD.currentTable.rows;
  for (var i = 0;i < rows.length;i++) {
    var row = rows[i];
    if ($(row).next().length == 0) {
      return;
    }
    var rowY = this.getPosition(row).y;
    var rowHeight = parseInt(row.offsetHeight) / 2;
    if (row.offsetHeight == 0) {
      rowY = this.getPosition(row.firstChild).y;
      rowHeight = parseInt(row.firstChild.offsetHeight) / 2;
    }
    if (y > rowY - rowHeight && y < rowY + rowHeight) {
      if (row == draggedRow) {
        return null;
      }
      var config = jQuery.tableDnD.currentTable.tableDnDConfig;
      if (config.onAllowDrop) {
        if (config.onAllowDrop(draggedRow, row)) {
          return row;
        } else {
          return null;
        }
      } else {
        var nodrop = jQuery(row).hasClass("nodrop");
        if (!nodrop) {
          return row;
        } else {
          return null;
        }
      }
      return row;
    }
  }
  return null;
}, mouseup:function(e) {
  if (jQuery.tableDnD.currentTable && jQuery.tableDnD.dragObject) {
    var droppedRow = jQuery.tableDnD.dragObject;
    var config = jQuery.tableDnD.currentTable.tableDnDConfig;
    if (config.onDragClass) {
      jQuery(droppedRow).removeClass(config.onDragClass);
    } else {
      jQuery(droppedRow).css(config.onDropStyle);
    }
    jQuery.tableDnD.dragObject = null;
    if (config.onDrop) {
      config.onDrop(jQuery.tableDnD.currentTable, droppedRow);
    }
    jQuery.tableDnD.currentTable = null;
  }
}, serialize:function() {
  if (jQuery.tableDnD.currentTable) {
    return jQuery.tableDnD.serializeTable(jQuery.tableDnD.currentTable);
  } else {
    return "Error: No Table id set, you need to set an id on your table and every row";
  }
}, serializeTable:function(table) {
  var result = "";
  var tableId = table.id;
  var rows = table.rows;
  for (var i = 0;i < rows.length;i++) {
    if (result.length > 0) {
      result += "&";
    }
    var rowId = rows[i].id;
    if (rowId && (rowId && (table.tableDnDConfig && table.tableDnDConfig.serializeRegexp))) {
      rowId = rowId.match(table.tableDnDConfig.serializeRegexp)[0];
    }
    result += tableId + "[]=" + rowId;
  }
  return result;
}, serializeTables:function() {
  var result = "";
  this.each(function() {
    result += jQuery.tableDnD.serializeTable(this);
  });
  return result;
}};
jQuery.fn.extend({tableDnD:jQuery.tableDnD.build, tableDnDUpdate:jQuery.tableDnD.updateTables, tableDnDSerialize:jQuery.tableDnD.serializeTables});
(function($) {
  $.widget("ui.selectmenu", {options:{appendTo:"body", typeAhead:1E3, style:"dropdown", positionOptions:null, width:null, menuWidth:null, handleWidth:26, maxHeight:null, icons:null, format:null, escapeHtml:false, bgImage:function() {
  }}, _create:function() {
    var self = this, o = this.options;
    var selectmenuId = this.element.uniqueId().attr("id");
    this.ids = [selectmenuId, selectmenuId + "-button", selectmenuId + "-menu"];
    this._safemouseup = true;
    this.isOpen = false;
    this.newelement = $("<a />", {"class":"ui-selectmenu ui-widget ui-state-default ui-corner-all", "id":this.ids[1], "role":"button", "href":"#nogo", "tabindex":this.element.attr("disabled") ? 1 : 0, "aria-haspopup":true, "aria-owns":this.ids[2]});
    this.newelementWrap = $("<span />").append(this.newelement).insertAfter(this.element);
    var tabindex = this.element.attr("tabindex");
    if (tabindex) {
      this.newelement.attr("tabindex", tabindex);
    }
    this.newelement.data("selectelement", this.element);
    this.selectmenuIcon = $('<span class="ui-selectmenu-icon ui-icon"></span>').prependTo(this.newelement);
    this.newelement.prepend('<span class="ui-selectmenu-status" />');
    this.element.bind({"click.selectmenu":function(event) {
      self.newelement.focus();
      event.preventDefault();
    }});
    this.newelement.bind("mousedown.selectmenu", function(event) {
      self._toggle(event, true);
      if (o.style == "popup") {
        self._safemouseup = false;
        setTimeout(function() {
          self._safemouseup = true;
        }, 300);
      }
      event.preventDefault();
    }).bind("click.selectmenu", function(event) {
      event.preventDefault();
    }).bind("keydown.selectmenu", function(event) {
      var ret = false;
      switch(event.keyCode) {
        case $.ui.keyCode.ENTER:
          ret = true;
          break;
        case $.ui.keyCode.SPACE:
          self._toggle(event);
          break;
        case $.ui.keyCode.UP:
          if (event.altKey) {
            self.open(event);
          } else {
            self._moveSelection(-1);
          }
          break;
        case $.ui.keyCode.DOWN:
          if (event.altKey) {
            self.open(event);
          } else {
            self._moveSelection(1);
          }
          break;
        case $.ui.keyCode.LEFT:
          self._moveSelection(-1);
          break;
        case $.ui.keyCode.RIGHT:
          self._moveSelection(1);
          break;
        case $.ui.keyCode.TAB:
          ret = true;
          break;
        case $.ui.keyCode.PAGE_UP:
        ;
        case $.ui.keyCode.HOME:
          self.index(0);
          break;
        case $.ui.keyCode.PAGE_DOWN:
        ;
        case $.ui.keyCode.END:
          self.index(self._optionLis.length);
          break;
        default:
          ret = true;
      }
      return ret;
    }).bind("keypress.selectmenu", function(event) {
      if (event.which > 0) {
        self._typeAhead(event.which, "mouseup");
      }
      return true;
    }).bind("mouseover.selectmenu", function() {
      if (!o.disabled) {
        $(this).addClass("ui-state-hover");
      }
    }).bind("mouseout.selectmenu", function() {
      if (!o.disabled) {
        $(this).removeClass("ui-state-hover");
      }
    }).bind("focus.selectmenu", function() {
      if (!o.disabled) {
        $(this).addClass("ui-state-focus");
      }
    }).bind("blur.selectmenu", function() {
      if (!o.disabled) {
        $(this).removeClass("ui-state-focus");
      }
    });
    $(document).bind("mousedown.selectmenu-" + this.ids[0], function(event) {
      if (self.isOpen && !$(event.target).closest("#" + self.ids[1]).length) {
        self.close(event);
      }
    });
    this.element.bind("click.selectmenu", function() {
      self._refreshValue();
    }).bind("focus.selectmenu", function() {
      if (self.newelement) {
        self.newelement[0].focus();
      }
    });
    if (!o.width) {
      o.width = this.element.outerWidth();
    }
    this.newelement.width(o.width);
    this.element.hide();
    this.list = $("<ul />", {"class":"ui-widget ui-widget-content", "aria-hidden":true, "role":"listbox", "aria-labelledby":this.ids[1], "id":this.ids[2]});
    this.listWrap = $("<div />", {"class":"ui-selectmenu-menu"}).append(this.list).appendTo(o.appendTo);
    this.list.bind("keydown.selectmenu", function(event) {
      var ret = false;
      switch(event.keyCode) {
        case $.ui.keyCode.UP:
          if (event.altKey) {
            self.close(event, true);
          } else {
            self._moveFocus(-1);
          }
          break;
        case $.ui.keyCode.DOWN:
          if (event.altKey) {
            self.close(event, true);
          } else {
            self._moveFocus(1);
          }
          break;
        case $.ui.keyCode.LEFT:
          self._moveFocus(-1);
          break;
        case $.ui.keyCode.RIGHT:
          self._moveFocus(1);
          break;
        case $.ui.keyCode.HOME:
          self._moveFocus(":first");
          break;
        case $.ui.keyCode.PAGE_UP:
          self._scrollPage("up");
          break;
        case $.ui.keyCode.PAGE_DOWN:
          self._scrollPage("down");
          break;
        case $.ui.keyCode.END:
          self._moveFocus(":last");
          break;
        case $.ui.keyCode.ENTER:
        ;
        case $.ui.keyCode.SPACE:
          self.close(event, true);
          $(event.target).parents("li:eq(0)").trigger("mouseup");
          break;
        case $.ui.keyCode.TAB:
          ret = true;
          self.close(event, true);
          $(event.target).parents("li:eq(0)").trigger("mouseup");
          break;
        case $.ui.keyCode.ESCAPE:
          self.close(event, true);
          break;
        default:
          ret = true;
      }
      return ret;
    }).bind("keypress.selectmenu", function(event) {
      if (event.which > 0) {
        self._typeAhead(event.which, "focus");
      }
      return true;
    }).bind("mousedown.selectmenu mouseup.selectmenu", function() {
      return false;
    });
    $(window).bind("resize.selectmenu-" + this.ids[0], $.proxy(self.close, this));
  }, _init:function() {
    var self = this, o = this.options;
    var selectOptionData = [];
    this.element.find("option").each(function() {
      var opt = $(this);
      selectOptionData.push({value:opt.attr("value"), text:self._formatText(opt.text(), opt), selected:opt.attr("selected"), disabled:opt.attr("disabled"), classes:opt.attr("class"), typeahead:opt.attr("typeahead"), parentOptGroup:opt.parent("optgroup"), bgImage:o.bgImage.call(opt)});
    });
    var activeClass = self.options.style == "popup" ? " ui-state-active" : "";
    this.list.html("");
    if (selectOptionData.length) {
      for (var i = 0;i < selectOptionData.length;i++) {
        var thisLiAttr = {role:"presentation"};
        if (selectOptionData[i].disabled) {
          thisLiAttr["class"] = "ui-state-disabled";
        }
        var thisAAttr = {html:selectOptionData[i].text || "&nbsp;", href:"#nogo", tabindex:-1, role:"option", "aria-selected":false};
        if (selectOptionData[i].disabled) {
          thisAAttr["aria-disabled"] = true;
        }
        if (selectOptionData[i].typeahead) {
          thisAAttr["typeahead"] = selectOptionData[i].typeahead;
        }
        var thisA = $("<a/>", thisAAttr).bind("focus.selectmenu", function() {
          $(this).parent().mouseover();
        }).bind("blur.selectmenu", function() {
          $(this).parent().mouseout();
        });
        var thisLi = $("<li/>", thisLiAttr).append(thisA).data("index", i).addClass(selectOptionData[i].classes).data("optionClasses", selectOptionData[i].classes || "").bind("mouseup.selectmenu", function(event) {
          if (self._safemouseup && (!self._disabled(event.currentTarget) && !self._disabled($(event.currentTarget).parents("ul > li.ui-selectmenu-group ")))) {
            self.index($(this).data("index"));
            self.select(event);
            self.close(event, true);
          }
          return false;
        }).bind("click.selectmenu", function() {
          return false;
        }).bind("mouseover.selectmenu", function(e) {
          if (!$(this).hasClass("ui-state-disabled") && !$(this).parent("ul").parent("li").hasClass("ui-state-disabled")) {
            e.optionValue = self.element[0].options[$(this).data("index")].value;
            self._trigger("hover", e, self._uiHash());
            self._selectedOptionLi().addClass(activeClass);
            self._focusedOptionLi().removeClass("ui-selectmenu-item-focus ui-state-hover");
            $(this).removeClass("ui-state-active").addClass("ui-selectmenu-item-focus ui-state-hover");
          }
        }).bind("mouseout.selectmenu", function(e) {
          if ($(this).is(self._selectedOptionLi())) {
            $(this).addClass(activeClass);
          }
          e.optionValue = self.element[0].options[$(this).data("index")].value;
          self._trigger("blur", e, self._uiHash());
          $(this).removeClass("ui-selectmenu-item-focus ui-state-hover");
        });
        if (selectOptionData[i].parentOptGroup.length) {
          var optGroupName = "ui-selectmenu-group-" + this.element.find("optgroup").index(selectOptionData[i].parentOptGroup);
          if (this.list.find("li." + optGroupName).length) {
            this.list.find("li." + optGroupName + ":last ul").append(thisLi);
          } else {
            $('<li role="presentation" class="ui-selectmenu-group ' + optGroupName + (selectOptionData[i].parentOptGroup.attr("disabled") ? " " + 'ui-state-disabled" aria-disabled="true"' : '"') + '><span class="ui-selectmenu-group-label">' + selectOptionData[i].parentOptGroup.attr("label") + "</span><ul></ul></li>").appendTo(this.list).find("ul").append(thisLi);
          }
        } else {
          thisLi.appendTo(this.list);
        }
        if (o.icons) {
          for (var j in o.icons) {
            if (thisLi.is(o.icons[j].find)) {
              thisLi.data("optionClasses", selectOptionData[i].classes + " ui-selectmenu-hasIcon").addClass("ui-selectmenu-hasIcon");
              var iconClass = o.icons[j].icon || "";
              thisLi.find("a:eq(0)").prepend('<span class="ui-selectmenu-item-icon ui-icon ' + iconClass + '"></span>');
              if (selectOptionData[i].bgImage) {
                thisLi.find("span").css("background-image", selectOptionData[i].bgImage);
              }
            }
          }
        }
      }
    } else {
      $('<li role="presentation"><a href="#nogo" tabindex="-1" role="option"></a></li>').appendTo(this.list);
    }
    var isDropDown = o.style == "dropdown";
    this.newelement.toggleClass("ui-selectmenu-dropdown", isDropDown).toggleClass("ui-selectmenu-popup", !isDropDown);
    this.list.toggleClass("ui-selectmenu-menu-dropdown ui-corner-bottom", isDropDown).toggleClass("ui-selectmenu-menu-popup ui-corner-all", !isDropDown).find("li:first").toggleClass("ui-corner-top", !isDropDown).end().find("li:last").addClass("ui-corner-bottom");
    this.selectmenuIcon.toggleClass("ui-icon-triangle-1-s", isDropDown).toggleClass("ui-icon-triangle-2-n-s", !isDropDown);
    if (o.style == "dropdown") {
      this.list.width(o.menuWidth ? o.menuWidth : o.width);
    } else {
      this.list.width(o.menuWidth ? o.menuWidth : o.width - o.handleWidth);
    }
    if (!navigator.userAgent.match(/Android 2/)) {
      var listH = this.listWrap.height();
      var winH = $(window).height();
      var maxH = o.maxHeight ? Math.min(o.maxHeight, winH) : winH / 3;
      if (listH > maxH) {
        this.list.height(maxH);
      }
    }
    this._optionLis = this.list.find("li:not(.ui-selectmenu-group)");
    if (this.element.attr("disabled")) {
      this.disable();
    } else {
      this.enable();
    }
    this._refreshValue();
    this._selectedOptionLi().addClass("ui-selectmenu-item-focus");
    clearTimeout(this.refreshTimeout);
    this.refreshTimeout = window.setTimeout(function() {
      self._refreshPosition();
    }, 200);
  }, destroy:function() {
    this.element.removeData(this.widgetName).removeClass("ui-selectmenu-disabled" + " " + "ui-state-disabled").removeAttr("aria-disabled").unbind(".selectmenu");
    $(window).unbind(".selectmenu-" + this.ids[0]);
    $(document).unbind(".selectmenu-" + this.ids[0]);
    this.newelementWrap.remove();
    this.listWrap.remove();
    this.element.unbind(".selectmenu").show();
    $.Widget.prototype.destroy.apply(this, arguments);
  }, _typeAhead:function(code, eventType) {
    var self = this, c = String.fromCharCode(code).toLowerCase(), matchee = null, nextIndex = null;
    if (self._typeAhead_timer) {
      window.clearTimeout(self._typeAhead_timer);
      self._typeAhead_timer = undefined;
    }
    self._typeAhead_chars = (self._typeAhead_chars === undefined ? "" : self._typeAhead_chars).concat(c);
    if (self._typeAhead_chars.length < 2 || self._typeAhead_chars.substr(-2, 1) === c && self._typeAhead_cycling) {
      self._typeAhead_cycling = true;
      matchee = c;
    } else {
      self._typeAhead_cycling = false;
      matchee = self._typeAhead_chars;
    }
    var selectedIndex = (eventType !== "focus" ? this._selectedOptionLi().data("index") : this._focusedOptionLi().data("index")) || 0;
    for (var i = 0;i < this._optionLis.length;i++) {
      var thisText = this._optionLis.eq(i).text().substr(0, matchee.length).toLowerCase();
      if (thisText === matchee) {
        if (self._typeAhead_cycling) {
          if (nextIndex === null) {
            nextIndex = i;
          }
          if (i > selectedIndex) {
            nextIndex = i;
            break;
          }
        } else {
          nextIndex = i;
        }
      }
    }
    if (nextIndex !== null) {
      this._optionLis.eq(nextIndex).find("a").trigger(eventType);
    }
    self._typeAhead_timer = window.setTimeout(function() {
      self._typeAhead_timer = undefined;
      self._typeAhead_chars = undefined;
      self._typeAhead_cycling = undefined;
    }, self.options.typeAhead);
  }, _uiHash:function() {
    var index = this.index();
    return{index:index, option:$("option", this.element).get(index), value:this.element[0].value};
  }, open:function(event) {
    if (this.newelement.attr("aria-disabled") != "true") {
      var self = this, o = this.options, selected = this._selectedOptionLi(), link = selected.find("a");
      self._closeOthers(event);
      self.newelement.addClass("ui-state-active");
      self.list.attr("aria-hidden", false);
      self.listWrap.addClass("ui-selectmenu-open");
      if (o.style == "dropdown") {
        self.newelement.removeClass("ui-corner-all").addClass("ui-corner-top");
      } else {
        this.list.css("left", -5E3).scrollTop(this.list.scrollTop() + selected.position().top - this.list.outerHeight() / 2 + selected.outerHeight() / 2).css("left", "auto");
      }
      self._refreshPosition();
      if (link.length) {
        link[0].focus();
      }
      self.isOpen = true;
      self._trigger("open", event, self._uiHash());
    }
  }, close:function(event, retainFocus) {
    if (this.newelement.is(".ui-state-active")) {
      this.newelement.removeClass("ui-state-active");
      this.listWrap.removeClass("ui-selectmenu-open");
      this.list.attr("aria-hidden", true);
      if (this.options.style == "dropdown") {
        this.newelement.removeClass("ui-corner-top").addClass("ui-corner-all");
      }
      if (retainFocus) {
        this.newelement.focus();
      }
      this.isOpen = false;
      this._trigger("close", event, this._uiHash());
    }
  }, change:function(event) {
    this.element.trigger("change");
    this._trigger("change", event, this._uiHash());
  }, select:function(event) {
    if (this._disabled(event.currentTarget)) {
      return false;
    }
    this._trigger("select", event, this._uiHash());
  }, widget:function() {
    return this.listWrap.add(this.newelementWrap);
  }, _closeOthers:function(event) {
    $(".ui-selectmenu.ui-state-active").not(this.newelement).each(function() {
      $(this).data("selectelement").selectmenu("close", event);
    });
    $(".ui-selectmenu.ui-state-hover").trigger("mouseout");
  }, _toggle:function(event, retainFocus) {
    if (this.isOpen) {
      this.close(event, retainFocus);
    } else {
      this.open(event);
    }
  }, _formatText:function(text, opt) {
    if (this.options.format) {
      text = this.options.format(text, opt);
    } else {
      if (this.options.escapeHtml) {
        text = $("<div />").text(text).html();
      }
    }
    return text;
  }, _selectedIndex:function() {
    return this.element[0].selectedIndex;
  }, _selectedOptionLi:function() {
    return this._optionLis.eq(this._selectedIndex());
  }, _focusedOptionLi:function() {
    return this.list.find(".ui-selectmenu-item-focus");
  }, _moveSelection:function(amt, recIndex) {
    if (!this.options.disabled) {
      var currIndex = parseInt(this._selectedOptionLi().data("index") || 0, 10);
      var newIndex = currIndex + amt;
      if (newIndex < 0) {
        newIndex = 0;
      }
      if (newIndex > this._optionLis.size() - 1) {
        newIndex = this._optionLis.size() - 1;
      }
      if (newIndex === recIndex) {
        return false;
      }
      if (this._optionLis.eq(newIndex).hasClass("ui-state-disabled")) {
        amt > 0 ? ++amt : --amt;
        this._moveSelection(amt, newIndex);
      } else {
        this._optionLis.eq(newIndex).trigger("mouseover").trigger("mouseup");
      }
    }
  }, _moveFocus:function(amt, recIndex) {
    if (!isNaN(amt)) {
      var currIndex = parseInt(this._focusedOptionLi().data("index") || 0, 10);
      var newIndex = currIndex + amt;
    } else {
      var newIndex = parseInt(this._optionLis.filter(amt).data("index"), 10)
    }
    if (newIndex < 0) {
      newIndex = 0;
    }
    if (newIndex > this._optionLis.size() - 1) {
      newIndex = this._optionLis.size() - 1;
    }
    if (newIndex === recIndex) {
      return false;
    }
    var activeID = "ui-selectmenu-item-" + Math.round(Math.random() * 1E3);
    this._focusedOptionLi().find("a:eq(0)").attr("id", "");
    if (this._optionLis.eq(newIndex).hasClass("ui-state-disabled")) {
      amt > 0 ? ++amt : --amt;
      this._moveFocus(amt, newIndex);
    } else {
      this._optionLis.eq(newIndex).find("a:eq(0)").attr("id", activeID).focus();
    }
    this.list.attr("aria-activedescendant", activeID);
  }, _scrollPage:function(direction) {
    var numPerPage = Math.floor(this.list.outerHeight() / this._optionLis.first().outerHeight());
    numPerPage = direction == "up" ? -numPerPage : numPerPage;
    this._moveFocus(numPerPage);
  }, _setOption:function(key, value) {
    this.options[key] = value;
    if (key == "disabled") {
      if (value) {
        this.close();
      }
      this.element.add(this.newelement).add(this.list)[value ? "addClass" : "removeClass"]("ui-selectmenu-disabled " + "ui-state-disabled").attr("aria-disabled", value).attr("tabindex", value ? 1 : 0);
    }
  }, disable:function(index, type) {
    if (typeof index == "undefined") {
      this._setOption("disabled", true);
    } else {
      this._toggleEnabled(type || "option", index, false);
    }
  }, enable:function(index, type) {
    if (typeof index == "undefined") {
      this._setOption("disabled", false);
    } else {
      this._toggleEnabled(type || "option", index, true);
    }
  }, _disabled:function(elem) {
    return $(elem).hasClass("ui-state-disabled");
  }, _toggleEnabled:function(type, index, flag) {
    var element = this.element.find(type).eq(index), elements = type === "optgroup" ? this.list.find("li.ui-selectmenu-group-" + index) : this._optionLis.eq(index);
    if (elements) {
      elements.toggleClass("ui-state-disabled", !flag).attr("aria-disabled", !flag);
      if (flag) {
        element.removeAttr("disabled");
      } else {
        element.attr("disabled", "disabled");
      }
    }
  }, index:function(newIndex) {
    if (arguments.length) {
      if (!this._disabled($(this._optionLis[newIndex])) && newIndex != this._selectedIndex()) {
        this.element[0].selectedIndex = newIndex;
        this._refreshValue();
        this.change();
      } else {
        return false;
      }
    } else {
      return this._selectedIndex();
    }
  }, value:function(newValue) {
    if (arguments.length && newValue != this.element[0].value) {
      this.element[0].value = newValue;
      this._refreshValue();
      this.change();
    } else {
      return this.element[0].value;
    }
  }, _refreshValue:function() {
    var activeClass = this.options.style == "popup" ? " ui-state-active" : "";
    var activeID = "ui-selectmenu-item-" + Math.round(Math.random() * 1E3);
    this.list.find(".ui-selectmenu-item-selected").removeClass("ui-selectmenu-item-selected" + activeClass).find("a").attr("aria-selected", "false").attr("id", "");
    this._selectedOptionLi().addClass("ui-selectmenu-item-selected" + activeClass).find("a").attr("aria-selected", "true").attr("id", activeID);
    var currentOptionClasses = this.newelement.data("optionClasses") ? this.newelement.data("optionClasses") : "";
    var newOptionClasses = this._selectedOptionLi().data("optionClasses") ? this._selectedOptionLi().data("optionClasses") : "";
    this.newelement.removeClass(currentOptionClasses).data("optionClasses", newOptionClasses).addClass(newOptionClasses).find(".ui-selectmenu-status").html(this._selectedOptionLi().find("a:eq(0)").html());
    this.list.attr("aria-activedescendant", activeID);
  }, _refreshPosition:function() {
    var o = this.options, positionDefault = {of:this.newelement, my:"left top", at:"left bottom", collision:"flip"};
    if (o.style == "popup") {
      var selected = this._selectedOptionLi();
      positionDefault.my = "left top" + (this.list.offset().top - selected.offset().top - (this.newelement.outerHeight() + selected.outerHeight()) / 2);
      positionDefault.collision = "fit";
    }
    this.listWrap.removeAttr("style").zIndex(this.element.zIndex() + 2).position($.extend(positionDefault, o.positionOptions));
  }});
})(jQuery);
(function(factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else {
    factory(jQuery);
  }
})(function($) {
  var table = $.widget("aw.table", {OVERSCROLL_FIX:1, DEFAULT_HEADER_BORDERS:0, alwaysScrollY:false, alwaysNoScrollY:false, defaultElement:"<table>", isVisible:false, colgroup:null, innerTable:null, headerRow:null, innerTableTbody:null, lastScrollY:false, defaultWidth:[24, 24, 24, 120, 80, 90, 100, 100, 85, 70, 60, 40, 40], options:{scrollable:["y"], columns:{resizable:null, minWidths:null, maxWidths:null}, width:null, height:null, keepColumnsTableWidth:true}, _getWidth:function(e) {
    var $e;
    if (e.length) {
      $e = e;
      e = e[0];
    } else {
      $e = $(e);
    }
    if (e.style.display == "none") {
      if (isEmpty(e.style.width)) {
        return 0;
      }
      return parseInt(e.style.width);
    }
    return $e.outerWidth();
  }, _setWidth:function(e, width, outerWidthDiff, setMaxWidth) {
    if (width == 0) {
      return;
    }
    var $e;
    if (e.length) {
      $e = e;
      e = e[0];
    } else {
      $e = $(e);
    }
    if (outerWidthDiff == undefined || outerWidthDiff == null) {
      if (e.style.display != "none") {
        outerWidthDiff = $e.outerWidth() - $e.width();
      } else {
        outerWidthDiff = this.DEFAULT_HEADER_BORDERS;
      }
    }
    var trueWidth = width - outerWidthDiff;
    $e.width(trueWidth);
    if (setMaxWidth) {
    }
  }, _getHeight:function(e) {
    return $(e).outerHeight();
  }, getHeaderCellByBodyCellIndexFiltered:function(cellIndex, headerCells) {
    var headerCell = this.getHeaderCellByBodyCellIndex(cellIndex, headerCells);
    if (headerCell != null) {
      if (headerCell.style.display == "none" || (!isEmpty(headerCell.attributes["colspan"]) || headerCell.nextSibling == null)) {
        headerCell = null;
      }
    }
    return headerCell;
  }, getHeaderCellByBodyCellIndex:function(cellIndex, headerCells) {
    var trueIndex = 0;
    var totalspan = 0;
    for (var i = 0;i < headerCells.length;i++) {
      var $th = headerCells[i];
      trueIndex = i + totalspan;
      if ($th.attributes["colspan"]) {
        var span = 0 + $th.attributes["colspan"].value - 1;
        if (trueIndex <= cellIndex && cellIndex <= trueIndex + span) {
          return $th;
        }
        totalspan += span;
      }
      if (trueIndex == cellIndex) {
        return $th;
      }
    }
    return null;
  }, _initWidths:function() {
    var that = this;
    var result = this._getBodyFirstRowCells().map(function(i, e) {
      var width = 0;
      if (e.style.display == "none") {
        width = $(e).outerWidth();
      } else {
        width = that._getWidth(e);
      }
      if (width <= 2) {
        width = that.defaultWidth[i];
      }
      return width;
    }).get();
    return result;
  }, _getOriginalHeaderRow:function() {
    if (this.headerRow == null) {
      this.headerRow = this.element.find("> thead > tr:first-child").first();
    }
    if (this.headerRow.length == 0) {
      this.headerRow = 0;
    }
    return this.headerRow;
  }, _getHeaderRow:function() {
    if (this.headerRow == null) {
      this.headerRow = this.element.parent().find(".sticky-thead > thead > tr:first-child").first();
    }
    if (this.headerRow.length == 0) {
      this.headerRow = 0;
    }
    return this.headerRow;
  }, _getColgroup:function() {
    if (this.colgroup == null) {
      this.colgroup = this.element.find("colgroup");
    }
    if (this.colgroup.length == 0) {
      this.colgroup = null;
    }
    return this.colgroup;
  }, _geInnerTableTbody:function() {
    if (this.innerTableTbody == null) {
      this.innerTableTbody = this.element.find("> tbody:first");
    }
    if (this.innerTableTbody.length == 0) {
      this.innerTableTbody = null;
    }
    return this.innerTableTbody;
  }, _getInnerTable:function() {
    if (this.innerTable == null) {
      this.innerTable = this.element;
    }
    if (this.innerTable.length == 0) {
      this.innerTable = null;
    }
    return this.innerTable;
  }, _getBodyFirstRow:function() {
    return this.element.find("> tbody tr.ui-qb-grid-row:first-child");
  }, _getHeaderCells:function() {
    return this._getHeaderRow().children();
  }, _getBodyFirstRowCells:function() {
    return this._getBodyFirstRow().children();
  }, _getColgroupCells:function() {
    var colgroup = this._getColgroup();
    if (colgroup == null) {
      return[];
    }
    return colgroup.children();
  }, _hasScroll:function(element) {
    var $element = $(element);
    return{"x":$element.outerWidth() < $element.prop("scrollWidth"), "y":$element.outerHeight() < $element.prop("scrollHeight")};
  }, _hasScrollY:function() {
    if (this.alwaysScrollY) {
      return true;
    }
    if (this.alwaysNoScrollY) {
      return false;
    }
    var element = this.element.parent()[0];
    var offsetHeight = element.offsetHeight;
    if (offsetHeight == 0) {
      offsetHeight = element.clientHeight;
    }
    return offsetHeight < element.scrollHeight;
  }, updateHeaderCellWidth:function(hasScrollY) {
    var that = this;
    if (hasScrollY == undefined) {
      hasScrollY = this._hasScrollY();
    }
    this._setTableHeaderWidth(this._getTotalWidthStatic(), hasScrollY);
    var colspan = 0;
    this._getHeaderCells().each(function(i, e) {
      var trueIndex = i + colspan;
      var width = 0;
      if (e.attributes["colspan"]) {
        var span = 0 + e.attributes["colspan"].value - 1;
        for (var j = 0;j <= span;j++) {
          width += that.columnWidths[trueIndex + j];
        }
        colspan += span;
      } else {
        width = that.columnWidths[trueIndex];
      }
      if (trueIndex == that.columnWidths.length - 1) {
      }
      that._setWidth(e, width, null, true);
    });
  }, syncTable:function() {
    this._syncColWidths();
    this._setTableHeaderWidth();
  }, resetTable:function() {
    this._getInnerTable().css("max-width", "100%");
    this._removeAllWidth();
    this.columnWidths = this._initWidths();
    this._getInnerTable().css("max-width", "0px");
    this._setColCellWidth();
    this.updateHeaderCellWidth();
  }, _setColCellWidth:function() {
    var that = this;
    this._getColgroupCells().each(function(i, e) {
      if (that.columnWidths[i] > 0) {
        that._setWidth(e, that.columnWidths[i]);
      }
    });
  }, _removeAllWidth:function() {
    var that = this;
    this._getColgroupCells().width("auto");
  }, _fixFirstCols:function(columnWidths) {
    return;
  }, _syncColWidths:function() {
    var that = this;
    var scrollY = this._hasScrollY();
    if (scrollY && !this.lastScrollY) {
      var parentW = this.element.parent().width();
      var w = this.element.outerWidth();
      if (w == 0) {
        w = this.element.width();
      }
      if (w > 0 && (parentW > 0 && w <= parentW)) {
        var firstColsW = that.columnWidths[0] + that.columnWidths[1] + that.columnWidths[2];
        var scale = (this.element.parent()[0].clientWidth - firstColsW - 1) / (w - firstColsW);
        for (var i = 3;i < that.columnWidths.length;i++) {
          that.columnWidths[i] = that.columnWidths[i] * scale;
        }
      }
    }
    if (scrollY) {
      this.lastScrollY = true;
    }
    this._setColCellWidth();
    that.columnWidths = this._getBodyCellWidths();
    this._fixFirstCols(that.columnWidths);
    this.updateHeaderCellWidth();
    this.element.css("max-width", "0px");
    this.$stickyHead.css("max-width", "0px");
    that.columnWidths = this._getBodyAndHeaderCellWidths();
    this._fixFirstCols(that.columnWidths);
    this._setColCellWidth();
    this.updateHeaderCellWidth();
    this._setTableBodyWidth(this.columnWidths);
  }, _getBodyAndHeaderCellWidths:function() {
    var that = this;
    var headerCells = this._getHeaderCells();
    var result = this._getBodyFirstRowCells().map(function(i, e) {
      var width = 0;
      if (e.style.display == "none") {
        width = $(e).outerWidth();
      } else {
        width = that._getWidth(e);
      }
      var headerCell = that.getHeaderCellByBodyCellIndexFiltered(i, headerCells);
      if (headerCell) {
        var headerWidth = that._getWidth(headerCell);
        width = Math.max(width, headerWidth);
      }
      return width;
    }).get();
    return result;
  }, _getBodyCellWidths:function() {
    var that = this;
    var result = this._getBodyFirstRowCells().map(function(i, e) {
      var width = 0;
      if (e.style.display == "none") {
        width = $(e).outerWidth();
      } else {
        width = that._getWidth(e);
      }
      if (width <= 2 && !that.element.is(":visible")) {
        width = that.defaultWidth[i];
      }
      return width;
    }).get();
    return result;
  }, _getTotalWidthStatic:function(columnWidths) {
    if (columnWidths == undefined) {
      columnWidths = this.columnWidths;
    }
    var total = 0;
    var cells = this._getColgroupCells();
    for (var i = 0;i < columnWidths.length;i++) {
      if (cells.length < i && (cells[i] != null && cells[i].style.display == "none")) {
        total += 0;
      } else {
        total += columnWidths[i];
      }
    }
    return total;
  }, _setTableWidth:function(width, hasScrollY) {
    if (width == undefined) {
      width = this.columnWidths;
    }
    if (Array.isArray(width)) {
      width = this._getTotalWidthStatic(width);
    }
    this._setTableBodyWidth(width);
    this._setTableHeaderWidth(width, hasScrollY);
  }, _setTableBodyWidth:function(width) {
    return;
    if (width == undefined) {
      width = this.columnWidths;
    }
    if (Array.isArray(width)) {
      width = this._getTotalWidthStatic(width);
    }
    var body = this._getInnerTable();
    body.width(width);
  }, _setTableHeaderWidth:function(width, hasScrollY) {
    return;
    if (width == undefined) {
      width = this.columnWidths;
    }
    if (Array.isArray(width)) {
      width = this._getTotalWidthStatic(width);
    }
    if (hasScrollY == undefined) {
      hasScrollY = this._hasScrollY();
    }
    var headerRow = this._getHeaderRow();
    var headerWidth = width + (hasScrollY ? this.sbwidth : 0);
    headerWidth = headerWidth;
    this.element.parent().find(".sticky-thead").width(headerWidth);
  }, _getOuterTbody:function() {
    if (this.outerTbody == null) {
      this.outerTbody = this.element.find("> tbody");
    }
    return this.outerTbody;
  }, _setBodyBounds:function() {
    var tbody_height = this.element.height() - this.element.find("thead").map(function(i, e) {
      return $(e).length ? $(e).outerHeight() : 0;
    }).get().reduce(function(prev, current) {
      return prev + current;
    }, 0);
  }, _createColGroup:function(widths) {
    var colgroup = $("<colgroup/>");
    var headerCells = this._getBodyFirstRowCells();
    for (var i = 0;i < headerCells.length;i++) {
      var cell = $(headerCells[i]);
      var col = $("<col />");
      var colspan = cell.attr("colspan");
      if (isEmpty(colspan)) {
        colspan = 1;
      } else {
        colspan = parseInt(colspan);
      }
      col.attr("span", colspan);
      col.attr("class", cell.attr("class"));
      if (cell.css("display") == "none") {
        col.css("display", cell.css("display"));
      }
      var width = widths[i];
      col.width(width);
      colgroup.append(col);
    }
    return colgroup;
  }, _create:function() {
    this._super();
    var me = this;
    this.columnWidths = [];
    this.resizeLock = false;
    var $table = this.element;
    this.isVisible = this.element.is(":visible");
    this.sbwidth = jQuery.position.scrollbarWidth();
    this.size = this._parseSize(this.options.width, this.options.height);
    this.scrollable = this._parseScrollable(this.options.scrollable);
    this.columnCount = $table.find("> tbody > tr").children().length;
    this.columns = this._parseColumns(this.options.columns);
    this.size = {"width":this.size.width !== null ? this.size.width : this._getWidth($table), "height":this.size.height !== null ? this.size.height : this._getHeight($table)};
    this.innerSize = {"width":this.size.width - ($table.outerWidth() - $table.width()), "height":this.size.height - ($table.outerHeight() - $table.height())};
    this.newTable();
    var initW = $table.parent().width() - 3;
    this.columnWidths = this._initWidths();
    var headerHeightStr;
    var headerHeight = this.$stickyHead.find("tr").outerHeight();
    if (headerHeight > 0) {
      headerHeightStr = headerHeight + "px";
      $table.find("> thead").css({"height":headerHeightStr});
      $table.css({"margin-top":headerHeightStr});
    }
    this._getInnerTable().attr("class", $table.attr("class"));
    $("#qb-ui-grid table")[0].style.width = initW + "px";
    $("#qb-ui-grid table")[0].style["min-width"] = initW + "px";
    if (this.isVisible) {
      this._setBodyBounds();
    }
    this.hasScroll = {};
    this.columnWidths = this._initWidths();
    this._setTableWidth(this.columnWidths);
    this.element.find("thead").remove();
    $("#qb-ui-grid table")[0].style.width = "";
    $("#qb-ui-grid table")[0].style["min-width"] = "";
    if (this.columns.resizable != null) {
      var resizable_params = this._getResizeableParams();
      this._getHeaderCells().each(function(i, e) {
        if (me.columns.resizable[i] && $(e).hasClass("allow-resize")) {
          if (me.columns.minWidths != null) {
            resizable_params["minWidth"] = me.columns.minWidths[i];
          }
          if (me.columns.maxWidths != null) {
            resizable_params["maxWidth"] = me.columns.maxWidths[i];
          }
          $(e).resizable(resizable_params);
        }
      });
    }
    if (!me.hasScroll.x) {
      me._on($table.find("> tbody").get(0), {"scroll":function(event) {
        var offset = -1 * $(event.target).scrollLeft();
        me._getHeaderRow().css("left", offset + "px");
      }});
      me.hasScroll.x = true;
    }
    var colgroup = this._createColGroup(this.columnWidths);
    this._geInnerTableTbody().before(colgroup);
    this.syncTable();
    QBWebCoreGridResizeLock = false;
  }, newTable:function() {
    this.$w = $(window);
    if (this.element.hasClass("overflow-y")) {
      this.element.removeClass("overflow-y").parent().addClass("overflow-y");
    }
    this.$stickyHead = this.element.siblings(".sticky-thead");
    this.$stickyWrap = this.element.parent(".sticky-wrap");
    var me = this;
    this.element.parent(".sticky-wrap").scroll(function() {
      me.repositionStickyHead();
    });
    this.$w.scroll(function() {
      me.repositionStickyHead();
    });
  }, repositionStickyHead:function() {
    this.$stickyHead.css({top:this.$stickyWrap.scrollTop()});
  }, _destroy:function() {
  }, _isNullorUndefined:function(value) {
    return value === null || typeof value == "undefined";
  }, _parseSize:function(width, height) {
    var size = {};
    if (this._isNullorUndefined(width) || !this._isPositiveNonZeroInt(width)) {
      size.width = null;
    } else {
      size.width = width;
    }
    if (this._isNullorUndefined(height) || !this._isPositiveNonZeroInt(height)) {
      size.height = null;
    } else {
      size.height = height;
    }
    return size;
  }, _parseScrollable:function(value) {
    var scrollable;
    if (value === true) {
      scrollable = {"x":true, "y":true};
    } else {
      if (value == "x") {
        scrollable = {"x":true, "y":false};
      } else {
        if (value == "y") {
          scrollable = {"x":false, "y":true};
        } else {
          if ($.isArray(value)) {
            scrollable = {"x":$.inArray("x", value), "y":$.inArray("y", value)};
          } else {
            scrollable = {"x":false, "y":false};
          }
        }
      }
    }
    return scrollable;
  }, _parseColumns:function(columns) {
    var temp = {};
    temp["resizable"] = this._isNullorUndefined(columns) ? null : this._parseResizable(columns.resizable);
    temp["minWidths"] = this._isNullorUndefined(columns) ? null : this._parseWidth(columns.minWidths);
    temp["maxWidths"] = this._isNullorUndefined(columns) ? null : this._parseWidth(columns.maxWidths);
    return temp;
  }, _parseResizable:function(resizable) {
    var temp = [];
    if (this._isNullorUndefined(resizable)) {
      return null;
    } else {
      if ($.isFunction(resizable)) {
        temp = resizable();
      } else {
        if ($.isArray(resizable)) {
          temp = resizable;
        } else {
          if (resizable === true) {
            for (var i = 0;i < this.columnCount;i++) {
              temp[i] = true;
            }
            return temp;
          } else {
            return null;
          }
        }
      }
    }
    if (!$.isArray(temp) || (temp.length != this.columnCount || !temp.every(function(value) {
      return value === true || value === false;
    }))) {
      return null;
    }
    return temp;
  }, _isInt:function(value) {
    return+value == Math.floor(+value);
  }, _isPositiveInt:function(value) {
    return+value == Math.floor(+value) && +value >= 0;
  }, _isPositiveNonZeroInt:function(value) {
    return+value == Math.floor(+value) && +value > 0;
  }, _parseWidth:function(width) {
    var temp = [];
    if (this._isNullorUndefined(width)) {
      return null;
    } else {
      if ($.isFunction(width)) {
        temp = width();
      } else {
        if ($.isArray(width)) {
          temp = width;
        } else {
          if (this._isPositiveInt(width)) {
            var value = +width;
            for (var i = 0;i < this.columnCount;i++) {
              temp[i] = value;
            }
            return temp;
          } else {
            return null;
          }
        }
      }
    }
    var that = this;
    if (!$.isArray(temp) || (temp.length != this.columnCount || !temp.every(function(value) {
      return that._isPositiveInt(value);
    }))) {
      return null;
    }
    return temp;
  }, _scale:function(widths, finalTotal, currentTotal) {
    if (typeof currentTotal == "undefined") {
      currentTotal = 0;
      for (var i = 0;i < widths.length;i++) {
        currentTotal += widths[i];
      }
    }
    var scale = finalTotal / currentTotal;
    var newWidths = [];
    var newTotal = 0;
    for (var i = 0;i < widths.length - 1;i++) {
      newWidths[i] = Math.round(scale * widths[i]);
      newTotal += newWidths[i];
    }
    newWidths[i] = finalTotal - newTotal;
    return newWidths;
  }, resize:function(width, height) {
    var that = this;
    var newsize = this._parseSize(width, height);
    var $table = this.element;
    if (newsize.width != null) {
      $table.css("width", width);
      this.size.width = newsize.width;
      this.innerSize.width = newsize.width - ($table.outerWidth() - $table.width());
      var total = this._getTotalWidthStatic();
      if (this.scrollable.x) {
        if (this.hasScroll.x || !this.options.keepColumnsTableWidth) {
          var hadScroll_x = this.hasScroll.x;
          var hasScroll_x = this._hasScroll($table.parent()).x;
          if (!hadScroll_x && hasScroll_x) {
            this._on($table.find("> tbody").get(0), {"scroll":function(event) {
              var offset = -1 * $(event.target).scrollLeft();
              that._getHeaderRow().css("left", offset + "px");
            }});
            this._setTableWidth(total);
            this.hasScroll.x = true;
          } else {
            if (hadScroll_x && !hasScroll_x) {
              this._off($table.find("> tbody"), "scroll");
              this.hasScroll.x = false;
            }
          }
        } else {
          this.columnWidths = this._scale(this.columnWidths, this.innerSize.width, total);
          if (this.hasScroll.x) {
            this._getInnerTable().find("tbody").css("width", "");
            this._getHeaderRow().width(this.innerSize.width + "px");
            this._off($table.find("> tbody"), "scroll");
            this.hasScroll.x = false;
          }
        }
      } else {
        if (total != this.innerSize.width) {
          this.columnWidths = this._scale(this.columnWidths, this.innerSize.width, total);
        }
      }
      $table.children().css("width", this.innerSize.width + "px");
    }
    if (height != null) {
      this.size.height = newsize.height;
      this.innerSize.height = newsize.height - ($table.outerHeight() - $table.height());
      this._setBodyBounds();
    }
    this.refresh();
  }, refresh:function() {
    this._syncColWidths();
  }, body:function(rows) {
    this._getInnerTable().find("tbody").html(rows);
    this.refresh();
  }, _getHeaderCellsIndex:function(element) {
    return $(element).index();
  }, _getHeaderCellsIndexTrue:function(element) {
    var headerCells = this._getHeaderCells();
    var result = 0;
    for (var i = 0;i < headerCells.length;i++) {
      var cell = headerCells[i];
      if (cell.attributes["colspan"]) {
        result += 0 + cell.attributes["colspan"].value - 1;
      }
      if (cell == element) {
        break;
      }
      result++;
    }
    return result;
  }, _getResizeableParams:function() {
    var that = this;
    var $table = this.element;
    var $headerCell;
    var bodyCell;
    var colIndex;
    var cellIndex;
    var resized_widths = [];
    var diff = 0;
    var hasScrollY;
    var cellOuterDiff;
    var totalWidth = 0;
    var colCell;
    var newWidth;
    var originalSize = 0;
    return{handles:"e", start:function(event, ui) {
      that.lastScrollY = true;
      $headerCell = ui.element;
      originalSize = that._getWidth($headerCell);
      colIndex = that._getHeaderCellsIndexTrue(ui.element[0]);
      cellIndex = that._getHeaderCellsIndexTrue(ui.element[0]);
      colCell = that._getColgroupCells()[colIndex];
      bodyCell = that._getBodyFirstRowCells()[cellIndex];
      that.resizeLock = false;
      QBWebCoreGridResizeLock = true;
      hasScrollY = that._hasScrollY();
      cellOuterDiff = $(bodyCell).outerWidth() - $(bodyCell).width();
      totalWidth = that._getTotalWidthStatic();
    }, resize:function(event, ui) {
      if (that.resizeLock) {
        return;
      }
      that.resizeLock = true;
      var newDiff = ui.size.width - ui.originalSize.width;
      if (newDiff == diff) {
        return;
      }
      diff = newDiff;
      for (var i = 0;i < that.columnWidths.length;i++) {
        resized_widths[i] = that.columnWidths[i];
      }
      that._setTableWidth(totalWidth + diff, hasScrollY);
      that._setWidth(colCell, resized_widths[cellIndex] + diff);
      that._setWidth(bodyCell, resized_widths[cellIndex] + diff);
      newWidth = Math.max(that._getWidth(bodyCell), that._getWidth($headerCell));
      if (resized_widths[cellIndex] + diff < newWidth) {
        diff = newWidth - originalSize;
        that._setTableWidth(totalWidth + diff, hasScrollY);
        that._setWidth(colCell, resized_widths[cellIndex] + diff);
        that._setWidth(ui.element, resized_widths[cellIndex] + diff);
        that._setTableWidth(totalWidth + diff, hasScrollY);
      }
      that.resizeLock = false;
      resized_widths[cellIndex] += diff;
    }, stop:function(event, ui) {
      QBWebCoreGridResizeLock = false;
      that.resizeLock = false;
      for (var i = 0;i < that.columnWidths.length;i++) {
        that.columnWidths[i] = resized_widths[i];
      }
      that.syncTable();
    }};
  }});
});
(function(factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else {
    factory(jQuery);
  }
})(function($) {
  $.fn.addBack = $.fn.addBack || $.fn.andSelf;
  $.fn.extend({actualF:function(method, options) {
    return this.actual(method, $.extend({fastCheck:true}, options));
  }, actual:function(method, options) {
    if (!this[method]) {
      throw'$.actual => The jQuery method "' + method + '" you called does not exist';
    }
    var defaults = {absolute:false, clone:false, includeMargin:false, display:"block", fastCheck:false};
    var configs = $.extend(defaults, options);
    var $target = this.eq(0);
    var fix, restore;
    if (configs.fastCheck) {
      var value = $target[method]();
      if (value > 10) {
        return value;
      }
    }
    if (configs.clone === true) {
      fix = function() {
        var style = "position: absolute !important; top: -1000 !important; ";
        $target = $target.clone().attr("style", style).appendTo("body");
      };
      restore = function() {
        $target.remove();
      };
    } else {
      var tmp = [];
      var style = "";
      var $hidden;
      fix = function() {
        $hidden = $target.parents().addBack().filter(":hidden");
        style += "visibility: hidden !important; display: " + configs.display + " !important; ";
        if (configs.absolute === true) {
          style += "position: absolute !important; ";
        }
        $hidden.each(function() {
          var $this = $(this);
          var thisStyle = $this.attr("style");
          tmp.push(thisStyle);
          $this.attr("style", thisStyle ? thisStyle + ";" + style : style);
        });
      };
      restore = function() {
        $hidden.each(function(i) {
          var $this = $(this);
          var _tmp = tmp[i];
          if (_tmp === undefined) {
            $this.removeAttr("style");
          } else {
            $this.attr("style", _tmp);
          }
        });
      };
    }
    fix();
    var actual = /(outer)/.test(method) ? $target[method](configs.includeMargin) : $target[method]();
    restore();
    return actual;
  }});
});
(function(glob) {
  var version = "0.4.2", has = "hasOwnProperty", separator = /[\.\/]/, wildcard = "*", fun = function() {
  }, numsort = function(a, b) {
    return a - b;
  }, current_event, stop, events = {n:{}}, eve = function(name, scope) {
    name = String(name);
    var e = events, oldstop = stop, args = Array.prototype.slice.call(arguments, 2), listeners = eve.listeners(name), z = 0, f = false, l, indexed = [], queue = {}, out = [], ce = current_event, errors = [];
    current_event = name;
    stop = 0;
    for (var i = 0, ii = listeners.length;i < ii;i++) {
      if ("zIndex" in listeners[i]) {
        indexed.push(listeners[i].zIndex);
        if (listeners[i].zIndex < 0) {
          queue[listeners[i].zIndex] = listeners[i];
        }
      }
    }
    indexed.sort(numsort);
    while (indexed[z] < 0) {
      l = queue[indexed[z++]];
      out.push(l.apply(scope, args));
      if (stop) {
        stop = oldstop;
        return out;
      }
    }
    for (i = 0;i < ii;i++) {
      l = listeners[i];
      if ("zIndex" in l) {
        if (l.zIndex == indexed[z]) {
          out.push(l.apply(scope, args));
          if (stop) {
            break;
          }
          do {
            z++;
            l = queue[indexed[z]];
            l && out.push(l.apply(scope, args));
            if (stop) {
              break;
            }
          } while (l);
        } else {
          queue[l.zIndex] = l;
        }
      } else {
        out.push(l.apply(scope, args));
        if (stop) {
          break;
        }
      }
    }
    stop = oldstop;
    current_event = ce;
    return out.length ? out : null;
  };
  eve._events = events;
  eve.listeners = function(name) {
    var names = name.split(separator), e = events, item, items, k, i, ii, j, jj, nes, es = [e], out = [];
    for (i = 0, ii = names.length;i < ii;i++) {
      nes = [];
      for (j = 0, jj = es.length;j < jj;j++) {
        e = es[j].n;
        items = [e[names[i]], e[wildcard]];
        k = 2;
        while (k--) {
          item = items[k];
          if (item) {
            nes.push(item);
            out = out.concat(item.f || []);
          }
        }
      }
      es = nes;
    }
    return out;
  };
  eve.on = function(name, f) {
    name = String(name);
    if (typeof f != "function") {
      return function() {
      };
    }
    var names = name.split(separator), e = events;
    for (var i = 0, ii = names.length;i < ii;i++) {
      e = e.n;
      e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = {n:{}});
    }
    e.f = e.f || [];
    for (i = 0, ii = e.f.length;i < ii;i++) {
      if (e.f[i] == f) {
        return fun;
      }
    }
    e.f.push(f);
    return function(zIndex) {
      if (+zIndex == +zIndex) {
        f.zIndex = +zIndex;
      }
    };
  };
  eve.f = function(event) {
    var attrs = [].slice.call(arguments, 1);
    return function() {
      eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
    };
  };
  eve.stop = function() {
    stop = 1;
  };
  eve.nt = function(subname) {
    if (subname) {
      return(new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)")).test(current_event);
    }
    return current_event;
  };
  eve.nts = function() {
    return current_event.split(separator);
  };
  eve.off = eve.unbind = function(name, f) {
    if (!name) {
      eve._events = events = {n:{}};
      return;
    }
    var names = name.split(separator), e, key, splice, i, ii, j, jj, cur = [events];
    for (i = 0, ii = names.length;i < ii;i++) {
      for (j = 0;j < cur.length;j += splice.length - 2) {
        splice = [j, 1];
        e = cur[j].n;
        if (names[i] != wildcard) {
          if (e[names[i]]) {
            splice.push(e[names[i]]);
          }
        } else {
          for (key in e) {
            if (e[has](key)) {
              splice.push(e[key]);
            }
          }
        }
        cur.splice.apply(cur, splice);
      }
    }
    for (i = 0, ii = cur.length;i < ii;i++) {
      e = cur[i];
      while (e.n) {
        if (f) {
          if (e.f) {
            for (j = 0, jj = e.f.length;j < jj;j++) {
              if (e.f[j] == f) {
                e.f.splice(j, 1);
                break;
              }
            }
            !e.f.length && delete e.f;
          }
          for (key in e.n) {
            if (e.n[has](key) && e.n[key].f) {
              var funcs = e.n[key].f;
              for (j = 0, jj = funcs.length;j < jj;j++) {
                if (funcs[j] == f) {
                  funcs.splice(j, 1);
                  break;
                }
              }
              !funcs.length && delete e.n[key].f;
            }
          }
        } else {
          delete e.f;
          for (key in e.n) {
            if (e.n[has](key) && e.n[key].f) {
              delete e.n[key].f;
            }
          }
        }
        e = e.n;
      }
    }
  };
  eve.once = function(name, f) {
    var f2 = function() {
      eve.unbind(name, f2);
      return f.apply(this, arguments);
    };
    return eve.on(name, f2);
  };
  eve.version = version;
  eve.toString = function() {
    return "You are running Eve " + version;
  };
  typeof module != "undefined" && module.exports ? module.exports = eve : typeof define != "undefined" ? define("eve", [], function() {
    return eve;
  }) : glob.eve = eve;
})(window || this);
(function(glob, factory) {
  if (typeof define === "function" && define.amd) {
    define(["eve"], function(eve) {
      return factory(glob, eve);
    });
  } else {
    factory(glob, glob.eve);
  }
})(this, function(window, eve) {
  function R(first) {
    if (R.is(first, "function")) {
      return loaded ? first() : eve.on("raphael.DOMload", first);
    } else {
      if (R.is(first, array)) {
        return R._engine.create[apply](R, first.splice(0, 3 + R.is(first[0], nu))).add(first);
      } else {
        var args = Array.prototype.slice.call(arguments, 0);
        if (R.is(args[args.length - 1], "function")) {
          var f = args.pop();
          return loaded ? f.call(R._engine.create[apply](R, args)) : eve.on("raphael.DOMload", function() {
            f.call(R._engine.create[apply](R, args));
          });
        } else {
          return R._engine.create[apply](R, arguments);
        }
      }
    }
  }
  R.version = "2.1.2";
  R.eve = eve;
  var loaded, separator = /[, ]+/, elements = {circle:1, rect:1, path:1, ellipse:1, text:1, image:1}, formatrg = /\{(\d+)\}/g, proto = "prototype", has = "hasOwnProperty", g = {doc:document, win:window}, oldRaphael = {was:Object.prototype[has].call(g.win, "Raphael"), is:g.win.Raphael}, Paper = function() {
    this.ca = this.customAttributes = {};
  }, paperproto, appendChild = "appendChild", apply = "apply", concat = "concat", supportsTouch = "ontouchstart" in g.win || g.win.DocumentTouch && g.doc instanceof DocumentTouch, E = "", S = " ", Str = String, split = "split", events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[split](S), touchMap = {mousedown:"touchstart", mousemove:"touchmove", mouseup:"touchend"}, lowerCase = Str.prototype.toLowerCase, math = Math, mmax = math.max, 
  mmin = math.min, abs = math.abs, pow = math.pow, PI = math.PI, nu = "number", string = "string", array = "array", toString = "toString", fillString = "fill", objectToString = Object.prototype.toString, paper = {}, push = "push", ISURL = R._ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i, colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i, 
  isnan = {"NaN":1, "Infinity":1, "-Infinity":1}, bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/, round = math.round, setAttribute = "setAttribute", toFloat = parseFloat, toInt = parseInt, upperCase = Str.prototype.toUpperCase, availableAttrs = R._availableAttrs = {"arrow-end":"none", "arrow-start":"none", blur:0, "clip-rect":"0 0 1e9 1e9", cursor:"default", cx:0, cy:0, fill:"#fff", "fill-opacity":1, font:'10px "Arial"', "font-family":'"Arial"', "font-size":"10", "font-style":"normal", 
  "font-weight":400, gradient:0, height:0, href:"http://raphaeljs.com/", "letter-spacing":0, opacity:1, path:"M0,0", r:0, rx:0, ry:0, src:"", stroke:"#000", "stroke-dasharray":"", "stroke-linecap":"butt", "stroke-linejoin":"butt", "stroke-miterlimit":0, "stroke-opacity":1, "stroke-width":1, target:"_blank", "text-anchor":"middle", title:"Raphael", transform:"", width:0, x:0, y:0}, availableAnimAttrs = R._availableAnimAttrs = {blur:nu, "clip-rect":"csv", cx:nu, cy:nu, fill:"colour", "fill-opacity":nu, 
  "font-size":nu, height:nu, opacity:nu, path:"path", r:nu, rx:nu, ry:nu, stroke:"colour", "stroke-opacity":nu, "stroke-width":nu, transform:"transform", width:nu, x:nu, y:nu}, whitespace = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]/g, commaSpaces = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/, 
  hsrg = {hs:1, rg:1}, p2s = /,?([achlmqrstvxz]),?/gi, pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig, 
  tCommand = /([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig, pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig, 
  radial_gradient = R._radial_gradient = /^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/, eldata = {}, sortByKey = function(a, b) {
    return a.key - b.key;
  }, sortByNumber = function(a, b) {
    return toFloat(a) - toFloat(b);
  }, fun = function() {
  }, pipe = function(x) {
    return x;
  }, rectPath = R._rectPath = function(x, y, w, h, r) {
    if (r) {
      return[["M", x + r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
    }
    return[["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
  }, ellipsePath = function(x, y, rx, ry) {
    if (ry == null) {
      ry = rx;
    }
    return[["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
  }, getPath = R._getPath = {path:function(el) {
    return el.attr("path");
  }, circle:function(el) {
    var a = el.attrs;
    return ellipsePath(a.cx, a.cy, a.r);
  }, ellipse:function(el) {
    var a = el.attrs;
    return ellipsePath(a.cx, a.cy, a.rx, a.ry);
  }, rect:function(el) {
    var a = el.attrs;
    return rectPath(a.x, a.y, a.width, a.height, a.r);
  }, image:function(el) {
    var a = el.attrs;
    return rectPath(a.x, a.y, a.width, a.height);
  }, text:function(el) {
    var bbox = el._getBBox();
    return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
  }, set:function(el) {
    var bbox = el._getBBox();
    return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
  }}, mapPath = R.mapPath = function(path, matrix) {
    if (!matrix) {
      return path;
    }
    var x, y, i, j, ii, jj, pathi;
    path = path2curve(path);
    for (i = 0, ii = path.length;i < ii;i++) {
      pathi = path[i];
      for (j = 1, jj = pathi.length;j < jj;j += 2) {
        x = matrix.x(pathi[j], pathi[j + 1]);
        y = matrix.y(pathi[j], pathi[j + 1]);
        pathi[j] = x;
        pathi[j + 1] = y;
      }
    }
    return path;
  };
  R._g = g;
  R.type = g.win.SVGAngle || g.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML";
  if (R.type == "VML") {
    var d = g.doc.createElement("div"), b;
    d.innerHTML = '<v:shape adj="1"/>';
    b = d.firstChild;
    b.style.behavior = "url(#default#VML)";
    if (!(b && typeof b.adj == "object")) {
      return R.type = E;
    }
    d = null;
  }
  R.svg = !(R.vml = R.type == "VML");
  R._Paper = Paper;
  R.fn = paperproto = Paper.prototype = R.prototype;
  R._id = 0;
  R._oid = 0;
  R.is = function(o, type) {
    type = lowerCase.call(type);
    if (type == "finite") {
      return!isnan[has](+o);
    }
    if (type == "array") {
      return o instanceof Array;
    }
    return type == "null" && o === null || (type == typeof o && o !== null || (type == "object" && o === Object(o) || (type == "array" && (Array.isArray && Array.isArray(o)) || objectToString.call(o).slice(8, -1).toLowerCase() == type)));
  };
  function clone(obj) {
    if (typeof obj == "function" || Object(obj) !== obj) {
      return obj;
    }
    var res = new obj.constructor;
    for (var key in obj) {
      if (obj[has](key)) {
        res[key] = clone(obj[key]);
      }
    }
    return res;
  }
  R.angle = function(x1, y1, x2, y2, x3, y3) {
    if (x3 == null) {
      var x = x1 - x2, y = y1 - y2;
      if (!x && !y) {
        return 0;
      }
      return(180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
    } else {
      return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
    }
  };
  R.rad = function(deg) {
    return deg % 360 * PI / 180;
  };
  R.deg = function(rad) {
    return rad * 180 / PI % 360;
  };
  R.snapTo = function(values, value, tolerance) {
    tolerance = R.is(tolerance, "finite") ? tolerance : 10;
    if (R.is(values, array)) {
      var i = values.length;
      while (i--) {
        if (abs(values[i] - value) <= tolerance) {
          return values[i];
        }
      }
    } else {
      values = +values;
      var rem = value % values;
      if (rem < tolerance) {
        return value - rem;
      }
      if (rem > values - tolerance) {
        return value - rem + values;
      }
    }
    return value;
  };
  var createUUID = R.createUUID = function(uuidRegEx, uuidReplacer) {
    return function() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
    };
  }(/[xy]/g, function(c) {
    var r = math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
  R.setWindow = function(newwin) {
    eve("raphael.setWindow", R, g.win, newwin);
    g.win = newwin;
    g.doc = g.win.document;
    if (R._engine.initWin) {
      R._engine.initWin(g.win);
    }
  };
  var toHex = function(color) {
    if (R.vml) {
      var trim = /^\s+|\s+$/g;
      var bod;
      try {
        var docum = new ActiveXObject("htmlfile");
        docum.write("<body>");
        docum.close();
        bod = docum.body;
      } catch (e) {
        bod = createPopup().document.body;
      }
      var range = bod.createTextRange();
      toHex = cacher(function(color) {
        try {
          bod.style.color = Str(color).replace(trim, E);
          var value = range.queryCommandValue("ForeColor");
          value = (value & 255) << 16 | value & 65280 | (value & 16711680) >>> 16;
          return "#" + ("000000" + value.toString(16)).slice(-6);
        } catch (e) {
          return "none";
        }
      });
    } else {
      var i = g.doc.createElement("i");
      i.title = "Rapha\u00ebl Colour Picker";
      i.style.display = "none";
      g.doc.body.appendChild(i);
      toHex = cacher(function(color) {
        i.style.color = color;
        return g.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
      });
    }
    return toHex(color);
  }, hsbtoString = function() {
    return "hsb(" + [this.h, this.s, this.b] + ")";
  }, hsltoString = function() {
    return "hsl(" + [this.h, this.s, this.l] + ")";
  }, rgbtoString = function() {
    return this.hex;
  }, prepareRGB = function(r, g, b) {
    if (g == null && (R.is(r, "object") && ("r" in r && ("g" in r && "b" in r)))) {
      b = r.b;
      g = r.g;
      r = r.r;
    }
    if (g == null && R.is(r, string)) {
      var clr = R.getRGB(r);
      r = clr.r;
      g = clr.g;
      b = clr.b;
    }
    if (r > 1 || (g > 1 || b > 1)) {
      r /= 255;
      g /= 255;
      b /= 255;
    }
    return[r, g, b];
  }, packageRGB = function(r, g, b, o) {
    r *= 255;
    g *= 255;
    b *= 255;
    var rgb = {r:r, g:g, b:b, hex:R.rgb(r, g, b), toString:rgbtoString};
    R.is(o, "finite") && (rgb.opacity = o);
    return rgb;
  };
  R.color = function(clr) {
    var rgb;
    if (R.is(clr, "object") && ("h" in clr && ("s" in clr && "b" in clr))) {
      rgb = R.hsb2rgb(clr);
      clr.r = rgb.r;
      clr.g = rgb.g;
      clr.b = rgb.b;
      clr.hex = rgb.hex;
    } else {
      if (R.is(clr, "object") && ("h" in clr && ("s" in clr && "l" in clr))) {
        rgb = R.hsl2rgb(clr);
        clr.r = rgb.r;
        clr.g = rgb.g;
        clr.b = rgb.b;
        clr.hex = rgb.hex;
      } else {
        if (R.is(clr, "string")) {
          clr = R.getRGB(clr);
        }
        if (R.is(clr, "object") && ("r" in clr && ("g" in clr && "b" in clr))) {
          rgb = R.rgb2hsl(clr);
          clr.h = rgb.h;
          clr.s = rgb.s;
          clr.l = rgb.l;
          rgb = R.rgb2hsb(clr);
          clr.v = rgb.b;
        } else {
          clr = {hex:"none"};
          clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
        }
      }
    }
    clr.toString = rgbtoString;
    return clr;
  };
  R.hsb2rgb = function(h, s, v, o) {
    if (this.is(h, "object") && ("h" in h && ("s" in h && "b" in h))) {
      v = h.b;
      s = h.s;
      h = h.h;
      o = h.o;
    }
    h *= 360;
    var R, G, B, X, C;
    h = h % 360 / 60;
    C = v * s;
    X = C * (1 - abs(h % 2 - 1));
    R = G = B = v - C;
    h = ~~h;
    R += [C, X, 0, 0, X, C][h];
    G += [X, C, C, X, 0, 0][h];
    B += [0, 0, X, C, C, X][h];
    return packageRGB(R, G, B, o);
  };
  R.hsl2rgb = function(h, s, l, o) {
    if (this.is(h, "object") && ("h" in h && ("s" in h && "l" in h))) {
      l = h.l;
      s = h.s;
      h = h.h;
    }
    if (h > 1 || (s > 1 || l > 1)) {
      h /= 360;
      s /= 100;
      l /= 100;
    }
    h *= 360;
    var R, G, B, X, C;
    h = h % 360 / 60;
    C = 2 * s * (l < 0.5 ? l : 1 - l);
    X = C * (1 - abs(h % 2 - 1));
    R = G = B = l - C / 2;
    h = ~~h;
    R += [C, X, 0, 0, X, C][h];
    G += [X, C, C, X, 0, 0][h];
    B += [0, 0, X, C, C, X][h];
    return packageRGB(R, G, B, o);
  };
  R.rgb2hsb = function(r, g, b) {
    b = prepareRGB(r, g, b);
    r = b[0];
    g = b[1];
    b = b[2];
    var H, S, V, C;
    V = mmax(r, g, b);
    C = V - mmin(r, g, b);
    H = C == 0 ? null : V == r ? (g - b) / C : V == g ? (b - r) / C + 2 : (r - g) / C + 4;
    H = (H + 360) % 6 * 60 / 360;
    S = C == 0 ? 0 : C / V;
    return{h:H, s:S, b:V, toString:hsbtoString};
  };
  R.rgb2hsl = function(r, g, b) {
    b = prepareRGB(r, g, b);
    r = b[0];
    g = b[1];
    b = b[2];
    var H, S, L, M, m, C;
    M = mmax(r, g, b);
    m = mmin(r, g, b);
    C = M - m;
    H = C == 0 ? null : M == r ? (g - b) / C : M == g ? (b - r) / C + 2 : (r - g) / C + 4;
    H = (H + 360) % 6 * 60 / 360;
    L = (M + m) / 2;
    S = C == 0 ? 0 : L < 0.5 ? C / (2 * L) : C / (2 - 2 * L);
    return{h:H, s:S, l:L, toString:hsltoString};
  };
  R._path2string = function() {
    return this.join(",").replace(p2s, "$1");
  };
  function repush(array, item) {
    for (var i = 0, ii = array.length;i < ii;i++) {
      if (array[i] === item) {
        return array.push(array.splice(i, 1)[0]);
      }
    }
  }
  function cacher(f, scope, postprocessor) {
    function newf() {
      var arg = Array.prototype.slice.call(arguments, 0), args = arg.join("\u2400"), cache = newf.cache = newf.cache || {}, count = newf.count = newf.count || [];
      if (cache[has](args)) {
        repush(count, args);
        return postprocessor ? postprocessor(cache[args]) : cache[args];
      }
      count.length >= 1E3 && delete cache[count.shift()];
      count.push(args);
      cache[args] = f[apply](scope, arg);
      return postprocessor ? postprocessor(cache[args]) : cache[args];
    }
    return newf;
  }
  var preload = R._preload = function(src, f) {
    var img = g.doc.createElement("img");
    img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
    img.onload = function() {
      f.call(this);
      this.onload = null;
      g.doc.body.removeChild(this);
    };
    img.onerror = function() {
      g.doc.body.removeChild(this);
    };
    g.doc.body.appendChild(img);
    img.src = src;
  };
  function clrToString() {
    return this.hex;
  }
  R.getRGB = cacher(function(colour) {
    if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
      return{r:-1, g:-1, b:-1, hex:"none", error:1, toString:clrToString};
    }
    if (colour == "none") {
      return{r:-1, g:-1, b:-1, hex:"none", toString:clrToString};
    }
    !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
    var res, red, green, blue, opacity, t, values, rgb = colour.match(colourRegExp);
    if (rgb) {
      if (rgb[2]) {
        blue = toInt(rgb[2].substring(5), 16);
        green = toInt(rgb[2].substring(3, 5), 16);
        red = toInt(rgb[2].substring(1, 3), 16);
      }
      if (rgb[3]) {
        blue = toInt((t = rgb[3].charAt(3)) + t, 16);
        green = toInt((t = rgb[3].charAt(2)) + t, 16);
        red = toInt((t = rgb[3].charAt(1)) + t, 16);
      }
      if (rgb[4]) {
        values = rgb[4][split](commaSpaces);
        red = toFloat(values[0]);
        values[0].slice(-1) == "%" && (red *= 2.55);
        green = toFloat(values[1]);
        values[1].slice(-1) == "%" && (green *= 2.55);
        blue = toFloat(values[2]);
        values[2].slice(-1) == "%" && (blue *= 2.55);
        rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
        values[3] && (values[3].slice(-1) == "%" && (opacity /= 100));
      }
      if (rgb[5]) {
        values = rgb[5][split](commaSpaces);
        red = toFloat(values[0]);
        values[0].slice(-1) == "%" && (red *= 2.55);
        green = toFloat(values[1]);
        values[1].slice(-1) == "%" && (green *= 2.55);
        blue = toFloat(values[2]);
        values[2].slice(-1) == "%" && (blue *= 2.55);
        (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\u00b0") && (red /= 360);
        rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
        values[3] && (values[3].slice(-1) == "%" && (opacity /= 100));
        return R.hsb2rgb(red, green, blue, opacity);
      }
      if (rgb[6]) {
        values = rgb[6][split](commaSpaces);
        red = toFloat(values[0]);
        values[0].slice(-1) == "%" && (red *= 2.55);
        green = toFloat(values[1]);
        values[1].slice(-1) == "%" && (green *= 2.55);
        blue = toFloat(values[2]);
        values[2].slice(-1) == "%" && (blue *= 2.55);
        (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\u00b0") && (red /= 360);
        rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
        values[3] && (values[3].slice(-1) == "%" && (opacity /= 100));
        return R.hsl2rgb(red, green, blue, opacity);
      }
      rgb = {r:red, g:green, b:blue, toString:clrToString};
      rgb.hex = "#" + (16777216 | blue | green << 8 | red << 16).toString(16).slice(1);
      R.is(opacity, "finite") && (rgb.opacity = opacity);
      return rgb;
    }
    return{r:-1, g:-1, b:-1, hex:"none", error:1, toString:clrToString};
  }, R);
  R.hsb = cacher(function(h, s, b) {
    return R.hsb2rgb(h, s, b).hex;
  });
  R.hsl = cacher(function(h, s, l) {
    return R.hsl2rgb(h, s, l).hex;
  });
  R.rgb = cacher(function(r, g, b) {
    return "#" + (16777216 | b | g << 8 | r << 16).toString(16).slice(1);
  });
  R.getColor = function(value) {
    var start = this.getColor.start = this.getColor.start || {h:0, s:1, b:value || 0.75}, rgb = this.hsb2rgb(start.h, start.s, start.b);
    start.h += 0.075;
    if (start.h > 1) {
      start.h = 0;
      start.s -= 0.2;
      start.s <= 0 && (this.getColor.start = {h:0, s:1, b:start.b});
    }
    return rgb.hex;
  };
  R.getColor.reset = function() {
    delete this.start;
  };
  function catmullRom2bezier(crp, z) {
    var d = [];
    for (var i = 0, iLen = crp.length;iLen - 2 * !z > i;i += 2) {
      var p = [{x:+crp[i - 2], y:+crp[i - 1]}, {x:+crp[i], y:+crp[i + 1]}, {x:+crp[i + 2], y:+crp[i + 3]}, {x:+crp[i + 4], y:+crp[i + 5]}];
      if (z) {
        if (!i) {
          p[0] = {x:+crp[iLen - 2], y:+crp[iLen - 1]};
        } else {
          if (iLen - 4 == i) {
            p[3] = {x:+crp[0], y:+crp[1]};
          } else {
            if (iLen - 2 == i) {
              p[2] = {x:+crp[0], y:+crp[1]};
              p[3] = {x:+crp[2], y:+crp[3]};
            }
          }
        }
      } else {
        if (iLen - 4 == i) {
          p[3] = p[2];
        } else {
          if (!i) {
            p[0] = {x:+crp[i], y:+crp[i + 1]};
          }
        }
      }
      d.push(["C", (-p[0].x + 6 * p[1].x + p[2].x) / 6, (-p[0].y + 6 * p[1].y + p[2].y) / 6, (p[1].x + 6 * p[2].x - p[3].x) / 6, (p[1].y + 6 * p[2].y - p[3].y) / 6, p[2].x, p[2].y]);
    }
    return d;
  }
  R.parsePathString = function(pathString) {
    if (!pathString) {
      return null;
    }
    var pth = paths(pathString);
    if (pth.arr) {
      return pathClone(pth.arr);
    }
    var paramCounts = {a:7, c:6, h:1, l:2, m:2, r:4, q:4, s:4, t:2, v:1, z:0}, data = [];
    if (R.is(pathString, array) && R.is(pathString[0], array)) {
      data = pathClone(pathString);
    }
    if (!data.length) {
      Str(pathString).replace(pathCommand, function(a, b, c) {
        var params = [], name = b.toLowerCase();
        c.replace(pathValues, function(a, b) {
          b && params.push(+b);
        });
        if (name == "m" && params.length > 2) {
          data.push([b][concat](params.splice(0, 2)));
          name = "l";
          b = b == "m" ? "l" : "L";
        }
        if (name == "r") {
          data.push([b][concat](params));
        } else {
          while (params.length >= paramCounts[name]) {
            data.push([b][concat](params.splice(0, paramCounts[name])));
            if (!paramCounts[name]) {
              break;
            }
          }
        }
      });
    }
    data.toString = R._path2string;
    pth.arr = pathClone(data);
    return data;
  };
  R.parseTransformString = cacher(function(TString) {
    if (!TString) {
      return null;
    }
    var paramCounts = {r:3, s:4, t:2, m:6}, data = [];
    if (R.is(TString, array) && R.is(TString[0], array)) {
      data = pathClone(TString);
    }
    if (!data.length) {
      Str(TString).replace(tCommand, function(a, b, c) {
        var params = [], name = lowerCase.call(b);
        c.replace(pathValues, function(a, b) {
          b && params.push(+b);
        });
        data.push([b][concat](params));
      });
    }
    data.toString = R._path2string;
    return data;
  });
  var paths = function(ps) {
    var p = paths.ps = paths.ps || {};
    if (p[ps]) {
      p[ps].sleep = 100;
    } else {
      p[ps] = {sleep:100};
    }
    setTimeout(function() {
      for (var key in p) {
        if (p[has](key) && key != ps) {
          p[key].sleep--;
          !p[key].sleep && delete p[key];
        }
      }
    });
    return p[ps];
  };
  R.findDotsAtSegment = function(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
    var t1 = 1 - t, t13 = pow(t1, 3), t12 = pow(t1, 2), t2 = t * t, t3 = t2 * t, x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x, y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y, mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x), my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y), nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x), ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y), ax = t1 * p1x + t * c1x, ay = t1 * p1y + 
    t * c1y, cx = t1 * c2x + t * p2x, cy = t1 * c2y + t * p2y, alpha = 90 - math.atan2(mx - nx, my - ny) * 180 / PI;
    (mx > nx || my < ny) && (alpha += 180);
    return{x:x, y:y, m:{x:mx, y:my}, n:{x:nx, y:ny}, start:{x:ax, y:ay}, end:{x:cx, y:cy}, alpha:alpha};
  };
  R.bezierBBox = function(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
    if (!R.is(p1x, "array")) {
      p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
    }
    var bbox = curveDim.apply(null, p1x);
    return{x:bbox.min.x, y:bbox.min.y, x2:bbox.max.x, y2:bbox.max.y, width:bbox.max.x - bbox.min.x, height:bbox.max.y - bbox.min.y};
  };
  R.isPointInsideBBox = function(bbox, x, y) {
    return x >= bbox.x && (x <= bbox.x2 && (y >= bbox.y && y <= bbox.y2));
  };
  R.isBBoxIntersect = function(bbox1, bbox2) {
    var i = R.isPointInsideBBox;
    return i(bbox2, bbox1.x, bbox1.y) || (i(bbox2, bbox1.x2, bbox1.y) || (i(bbox2, bbox1.x, bbox1.y2) || (i(bbox2, bbox1.x2, bbox1.y2) || (i(bbox1, bbox2.x, bbox2.y) || (i(bbox1, bbox2.x2, bbox2.y) || (i(bbox1, bbox2.x, bbox2.y2) || (i(bbox1, bbox2.x2, bbox2.y2) || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x) && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y))))))));
  };
  function base3(t, p1, p2, p3, p4) {
    var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4, t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
    return t * t2 - 3 * p1 + 3 * p2;
  }
  function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
    if (z == null) {
      z = 1;
    }
    z = z > 1 ? 1 : z < 0 ? 0 : z;
    var z2 = z / 2, n = 12, Tvalues = [-0.1252, 0.1252, -0.3678, 0.3678, -0.5873, 0.5873, -0.7699, 0.7699, -0.9041, 0.9041, -0.9816, 0.9816], Cvalues = [0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069, 0.1069, 0.0472, 0.0472], sum = 0;
    for (var i = 0;i < n;i++) {
      var ct = z2 * Tvalues[i] + z2, xbase = base3(ct, x1, x2, x3, x4), ybase = base3(ct, y1, y2, y3, y4), comb = xbase * xbase + ybase * ybase;
      sum += Cvalues[i] * math.sqrt(comb);
    }
    return z2 * sum;
  }
  function getTatLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
    if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
      return;
    }
    var t = 1, step = t / 2, t2 = t - step, l, e = 0.01;
    l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
    while (abs(l - ll) > e) {
      step /= 2;
      t2 += (l < ll ? 1 : -1) * step;
      l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
    }
    return t2;
  }
  function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    if (mmax(x1, x2) < mmin(x3, x4) || (mmin(x1, x2) > mmax(x3, x4) || (mmax(y1, y2) < mmin(y3, y4) || mmin(y1, y2) > mmax(y3, y4)))) {
      return;
    }
    var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4), ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4), denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (!denominator) {
      return;
    }
    var px = nx / denominator, py = ny / denominator, px2 = +px.toFixed(2), py2 = +py.toFixed(2);
    if (px2 < +mmin(x1, x2).toFixed(2) || (px2 > +mmax(x1, x2).toFixed(2) || (px2 < +mmin(x3, x4).toFixed(2) || (px2 > +mmax(x3, x4).toFixed(2) || (py2 < +mmin(y1, y2).toFixed(2) || (py2 > +mmax(y1, y2).toFixed(2) || (py2 < +mmin(y3, y4).toFixed(2) || py2 > +mmax(y3, y4).toFixed(2)))))))) {
      return;
    }
    return{x:px, y:py};
  }
  function inter(bez1, bez2) {
    return interHelper(bez1, bez2);
  }
  function interCount(bez1, bez2) {
    return interHelper(bez1, bez2, 1);
  }
  function interHelper(bez1, bez2, justCount) {
    var bbox1 = R.bezierBBox(bez1), bbox2 = R.bezierBBox(bez2);
    if (!R.isBBoxIntersect(bbox1, bbox2)) {
      return justCount ? 0 : [];
    }
    var l1 = bezlen.apply(0, bez1), l2 = bezlen.apply(0, bez2), n1 = mmax(~~(l1 / 5), 1), n2 = mmax(~~(l2 / 5), 1), dots1 = [], dots2 = [], xy = {}, res = justCount ? 0 : [];
    for (var i = 0;i < n1 + 1;i++) {
      var p = R.findDotsAtSegment.apply(R, bez1.concat(i / n1));
      dots1.push({x:p.x, y:p.y, t:i / n1});
    }
    for (i = 0;i < n2 + 1;i++) {
      p = R.findDotsAtSegment.apply(R, bez2.concat(i / n2));
      dots2.push({x:p.x, y:p.y, t:i / n2});
    }
    for (i = 0;i < n1;i++) {
      for (var j = 0;j < n2;j++) {
        var di = dots1[i], di1 = dots1[i + 1], dj = dots2[j], dj1 = dots2[j + 1], ci = abs(di1.x - di.x) < 0.001 ? "y" : "x", cj = abs(dj1.x - dj.x) < 0.001 ? "y" : "x", is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
        if (is) {
          if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
            continue;
          }
          xy[is.x.toFixed(4)] = is.y.toFixed(4);
          var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t), t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
          if (t1 >= 0 && (t1 <= 1.001 && (t2 >= 0 && t2 <= 1.001))) {
            if (justCount) {
              res++;
            } else {
              res.push({x:is.x, y:is.y, t1:mmin(t1, 1), t2:mmin(t2, 1)});
            }
          }
        }
      }
    }
    return res;
  }
  R.pathIntersection = function(path1, path2) {
    return interPathHelper(path1, path2);
  };
  R.pathIntersectionNumber = function(path1, path2) {
    return interPathHelper(path1, path2, 1);
  };
  function interPathHelper(path1, path2, justCount) {
    path1 = R._path2curve(path1);
    path2 = R._path2curve(path2);
    var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2, res = justCount ? 0 : [];
    for (var i = 0, ii = path1.length;i < ii;i++) {
      var pi = path1[i];
      if (pi[0] == "M") {
        x1 = x1m = pi[1];
        y1 = y1m = pi[2];
      } else {
        if (pi[0] == "C") {
          bez1 = [x1, y1].concat(pi.slice(1));
          x1 = bez1[6];
          y1 = bez1[7];
        } else {
          bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
          x1 = x1m;
          y1 = y1m;
        }
        for (var j = 0, jj = path2.length;j < jj;j++) {
          var pj = path2[j];
          if (pj[0] == "M") {
            x2 = x2m = pj[1];
            y2 = y2m = pj[2];
          } else {
            if (pj[0] == "C") {
              bez2 = [x2, y2].concat(pj.slice(1));
              x2 = bez2[6];
              y2 = bez2[7];
            } else {
              bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
              x2 = x2m;
              y2 = y2m;
            }
            var intr = interHelper(bez1, bez2, justCount);
            if (justCount) {
              res += intr;
            } else {
              for (var k = 0, kk = intr.length;k < kk;k++) {
                intr[k].segment1 = i;
                intr[k].segment2 = j;
                intr[k].bez1 = bez1;
                intr[k].bez2 = bez2;
              }
              res = res.concat(intr);
            }
          }
        }
      }
    }
    return res;
  }
  R.isPointInsidePath = function(path, x, y) {
    var bbox = R.pathBBox(path);
    return R.isPointInsideBBox(bbox, x, y) && interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
  };
  R._removedFactory = function(methodname) {
    return function() {
      eve("raphael.log", null, "Rapha\u00ebl: you are calling to method \u201c" + methodname + "\u201d of removed object", methodname);
    };
  };
  var pathDimensions = R.pathBBox = function(path) {
    var pth = paths(path);
    if (pth.bbox) {
      return clone(pth.bbox);
    }
    if (!path) {
      return{x:0, y:0, width:0, height:0, x2:0, y2:0};
    }
    path = path2curve(path);
    var x = 0, y = 0, X = [], Y = [], p;
    for (var i = 0, ii = path.length;i < ii;i++) {
      p = path[i];
      if (p[0] == "M") {
        x = p[1];
        y = p[2];
        X.push(x);
        Y.push(y);
      } else {
        var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
        X = X[concat](dim.min.x, dim.max.x);
        Y = Y[concat](dim.min.y, dim.max.y);
        x = p[5];
        y = p[6];
      }
    }
    var xmin = mmin[apply](0, X), ymin = mmin[apply](0, Y), xmax = mmax[apply](0, X), ymax = mmax[apply](0, Y), width = xmax - xmin, height = ymax - ymin, bb = {x:xmin, y:ymin, x2:xmax, y2:ymax, width:width, height:height, cx:xmin + width / 2, cy:ymin + height / 2};
    pth.bbox = clone(bb);
    return bb;
  }, pathClone = function(pathArray) {
    var res = clone(pathArray);
    res.toString = R._path2string;
    return res;
  }, pathToRelative = R._pathToRelative = function(pathArray) {
    var pth = paths(pathArray);
    if (pth.rel) {
      return pathClone(pth.rel);
    }
    if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) {
      pathArray = R.parsePathString(pathArray);
    }
    var res = [], x = 0, y = 0, mx = 0, my = 0, start = 0;
    if (pathArray[0][0] == "M") {
      x = pathArray[0][1];
      y = pathArray[0][2];
      mx = x;
      my = y;
      start++;
      res.push(["M", x, y]);
    }
    for (var i = start, ii = pathArray.length;i < ii;i++) {
      var r = res[i] = [], pa = pathArray[i];
      if (pa[0] != lowerCase.call(pa[0])) {
        r[0] = lowerCase.call(pa[0]);
        switch(r[0]) {
          case "a":
            r[1] = pa[1];
            r[2] = pa[2];
            r[3] = pa[3];
            r[4] = pa[4];
            r[5] = pa[5];
            r[6] = +(pa[6] - x).toFixed(3);
            r[7] = +(pa[7] - y).toFixed(3);
            break;
          case "v":
            r[1] = +(pa[1] - y).toFixed(3);
            break;
          case "m":
            mx = pa[1];
            my = pa[2];
          default:
            for (var j = 1, jj = pa.length;j < jj;j++) {
              r[j] = +(pa[j] - (j % 2 ? x : y)).toFixed(3);
            }
          ;
        }
      } else {
        r = res[i] = [];
        if (pa[0] == "m") {
          mx = pa[1] + x;
          my = pa[2] + y;
        }
        for (var k = 0, kk = pa.length;k < kk;k++) {
          res[i][k] = pa[k];
        }
      }
      var len = res[i].length;
      switch(res[i][0]) {
        case "z":
          x = mx;
          y = my;
          break;
        case "h":
          x += +res[i][len - 1];
          break;
        case "v":
          y += +res[i][len - 1];
          break;
        default:
          x += +res[i][len - 2];
          y += +res[i][len - 1];
      }
    }
    res.toString = R._path2string;
    pth.rel = pathClone(res);
    return res;
  }, pathToAbsolute = R._pathToAbsolute = function(pathArray) {
    var pth = paths(pathArray);
    if (pth.abs) {
      return pathClone(pth.abs);
    }
    if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) {
      pathArray = R.parsePathString(pathArray);
    }
    if (!pathArray || !pathArray.length) {
      return[["M", 0, 0]];
    }
    var res = [], x = 0, y = 0, mx = 0, my = 0, start = 0;
    if (pathArray[0][0] == "M") {
      x = +pathArray[0][1];
      y = +pathArray[0][2];
      mx = x;
      my = y;
      start++;
      res[0] = ["M", x, y];
    }
    var crz = pathArray.length == 3 && (pathArray[0][0] == "M" && (pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z"));
    for (var r, pa, i = start, ii = pathArray.length;i < ii;i++) {
      res.push(r = []);
      pa = pathArray[i];
      if (pa[0] != upperCase.call(pa[0])) {
        r[0] = upperCase.call(pa[0]);
        switch(r[0]) {
          case "A":
            r[1] = pa[1];
            r[2] = pa[2];
            r[3] = pa[3];
            r[4] = pa[4];
            r[5] = pa[5];
            r[6] = +(pa[6] + x);
            r[7] = +(pa[7] + y);
            break;
          case "V":
            r[1] = +pa[1] + y;
            break;
          case "H":
            r[1] = +pa[1] + x;
            break;
          case "R":
            var dots = [x, y][concat](pa.slice(1));
            for (var j = 2, jj = dots.length;j < jj;j++) {
              dots[j] = +dots[j] + x;
              dots[++j] = +dots[j] + y;
            }
            res.pop();
            res = res[concat](catmullRom2bezier(dots, crz));
            break;
          case "M":
            mx = +pa[1] + x;
            my = +pa[2] + y;
          default:
            for (j = 1, jj = pa.length;j < jj;j++) {
              r[j] = +pa[j] + (j % 2 ? x : y);
            }
          ;
        }
      } else {
        if (pa[0] == "R") {
          dots = [x, y][concat](pa.slice(1));
          res.pop();
          res = res[concat](catmullRom2bezier(dots, crz));
          r = ["R"][concat](pa.slice(-2));
        } else {
          for (var k = 0, kk = pa.length;k < kk;k++) {
            r[k] = pa[k];
          }
        }
      }
      switch(r[0]) {
        case "Z":
          x = mx;
          y = my;
          break;
        case "H":
          x = r[1];
          break;
        case "V":
          y = r[1];
          break;
        case "M":
          mx = r[r.length - 2];
          my = r[r.length - 1];
        default:
          x = r[r.length - 2];
          y = r[r.length - 1];
      }
    }
    res.toString = R._path2string;
    pth.abs = pathClone(res);
    return res;
  }, l2c = function(x1, y1, x2, y2) {
    return[x1, y1, x2, y2, x2, y2];
  }, q2c = function(x1, y1, ax, ay, x2, y2) {
    var _13 = 1 / 3, _23 = 2 / 3;
    return[_13 * x1 + _23 * ax, _13 * y1 + _23 * ay, _13 * x2 + _23 * ax, _13 * y2 + _23 * ay, x2, y2];
  }, a2c = function(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
    var _120 = PI * 120 / 180, rad = PI / 180 * (+angle || 0), res = [], xy, rotate = cacher(function(x, y, rad) {
      var X = x * math.cos(rad) - y * math.sin(rad), Y = x * math.sin(rad) + y * math.cos(rad);
      return{x:X, y:Y};
    });
    if (!recursive) {
      xy = rotate(x1, y1, -rad);
      x1 = xy.x;
      y1 = xy.y;
      xy = rotate(x2, y2, -rad);
      x2 = xy.x;
      y2 = xy.y;
      var cos = math.cos(PI / 180 * angle), sin = math.sin(PI / 180 * angle), x = (x1 - x2) / 2, y = (y1 - y2) / 2;
      var h = x * x / (rx * rx) + y * y / (ry * ry);
      if (h > 1) {
        h = math.sqrt(h);
        rx = h * rx;
        ry = h * ry;
      }
      var rx2 = rx * rx, ry2 = ry * ry, k = (large_arc_flag == sweep_flag ? -1 : 1) * math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))), cx = k * rx * y / ry + (x1 + x2) / 2, cy = k * -ry * x / rx + (y1 + y2) / 2, f1 = math.asin(((y1 - cy) / ry).toFixed(9)), f2 = math.asin(((y2 - cy) / ry).toFixed(9));
      f1 = x1 < cx ? PI - f1 : f1;
      f2 = x2 < cx ? PI - f2 : f2;
      f1 < 0 && (f1 = PI * 2 + f1);
      f2 < 0 && (f2 = PI * 2 + f2);
      if (sweep_flag && f1 > f2) {
        f1 = f1 - PI * 2;
      }
      if (!sweep_flag && f2 > f1) {
        f2 = f2 - PI * 2;
      }
    } else {
      f1 = recursive[0];
      f2 = recursive[1];
      cx = recursive[2];
      cy = recursive[3];
    }
    var df = f2 - f1;
    if (abs(df) > _120) {
      var f2old = f2, x2old = x2, y2old = y2;
      f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
      x2 = cx + rx * math.cos(f2);
      y2 = cy + ry * math.sin(f2);
      res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
    }
    df = f2 - f1;
    var c1 = math.cos(f1), s1 = math.sin(f1), c2 = math.cos(f2), s2 = math.sin(f2), t = math.tan(df / 4), hx = 4 / 3 * rx * t, hy = 4 / 3 * ry * t, m1 = [x1, y1], m2 = [x1 + hx * s1, y1 - hy * c1], m3 = [x2 + hx * s2, y2 - hy * c2], m4 = [x2, y2];
    m2[0] = 2 * m1[0] - m2[0];
    m2[1] = 2 * m1[1] - m2[1];
    if (recursive) {
      return[m2, m3, m4][concat](res);
    } else {
      res = [m2, m3, m4][concat](res).join()[split](",");
      var newres = [];
      for (var i = 0, ii = res.length;i < ii;i++) {
        newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
      }
      return newres;
    }
  }, findDotAtSegment = function(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
    var t1 = 1 - t;
    return{x:pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x, y:pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y};
  }, curveDim = cacher(function(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
    var a = c2x - 2 * c1x + p1x - (p2x - 2 * c2x + c1x), b = 2 * (c1x - p1x) - 2 * (c2x - c1x), c = p1x - c1x, t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a, t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a, y = [p1y, p2y], x = [p1x, p2x], dot;
    abs(t1) > "1e12" && (t1 = 0.5);
    abs(t2) > "1e12" && (t2 = 0.5);
    if (t1 > 0 && t1 < 1) {
      dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
      x.push(dot.x);
      y.push(dot.y);
    }
    if (t2 > 0 && t2 < 1) {
      dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
      x.push(dot.x);
      y.push(dot.y);
    }
    a = c2y - 2 * c1y + p1y - (p2y - 2 * c2y + c1y);
    b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
    c = p1y - c1y;
    t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
    t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
    abs(t1) > "1e12" && (t1 = 0.5);
    abs(t2) > "1e12" && (t2 = 0.5);
    if (t1 > 0 && t1 < 1) {
      dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
      x.push(dot.x);
      y.push(dot.y);
    }
    if (t2 > 0 && t2 < 1) {
      dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
      x.push(dot.x);
      y.push(dot.y);
    }
    return{min:{x:mmin[apply](0, x), y:mmin[apply](0, y)}, max:{x:mmax[apply](0, x), y:mmax[apply](0, y)}};
  }), path2curve = R._path2curve = cacher(function(path, path2) {
    var pth = !path2 && paths(path);
    if (!path2 && pth.curve) {
      return pathClone(pth.curve);
    }
    var p = pathToAbsolute(path), p2 = path2 && pathToAbsolute(path2), attrs = {x:0, y:0, bx:0, by:0, X:0, Y:0, qx:null, qy:null}, attrs2 = {x:0, y:0, bx:0, by:0, X:0, Y:0, qx:null, qy:null}, processPath = function(path, d, pcom) {
      var nx, ny, tq = {T:1, Q:1};
      if (!path) {
        return["C", d.x, d.y, d.x, d.y, d.x, d.y];
      }
      !(path[0] in tq) && (d.qx = d.qy = null);
      switch(path[0]) {
        case "M":
          d.X = path[1];
          d.Y = path[2];
          break;
        case "A":
          path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
          break;
        case "S":
          if (pcom == "C" || pcom == "S") {
            nx = d.x * 2 - d.bx;
            ny = d.y * 2 - d.by;
          } else {
            nx = d.x;
            ny = d.y;
          }
          path = ["C", nx, ny][concat](path.slice(1));
          break;
        case "T":
          if (pcom == "Q" || pcom == "T") {
            d.qx = d.x * 2 - d.qx;
            d.qy = d.y * 2 - d.qy;
          } else {
            d.qx = d.x;
            d.qy = d.y;
          }
          path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
          break;
        case "Q":
          d.qx = path[1];
          d.qy = path[2];
          path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
          break;
        case "L":
          path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
          break;
        case "H":
          path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
          break;
        case "V":
          path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
          break;
        case "Z":
          path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
          break;
      }
      return path;
    }, fixArc = function(pp, i) {
      if (pp[i].length > 7) {
        pp[i].shift();
        var pi = pp[i];
        while (pi.length) {
          pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
        }
        pp.splice(i, 1);
        ii = mmax(p.length, p2 && p2.length || 0);
      }
    }, fixM = function(path1, path2, a1, a2, i) {
      if (path1 && (path2 && (path1[i][0] == "M" && path2[i][0] != "M"))) {
        path2.splice(i, 0, ["M", a2.x, a2.y]);
        a1.bx = 0;
        a1.by = 0;
        a1.x = path1[i][1];
        a1.y = path1[i][2];
        ii = mmax(p.length, p2 && p2.length || 0);
      }
    };
    for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0);i < ii;i++) {
      p[i] = processPath(p[i], attrs);
      fixArc(p, i);
      p2 && (p2[i] = processPath(p2[i], attrs2));
      p2 && fixArc(p2, i);
      fixM(p, p2, attrs, attrs2, i);
      fixM(p2, p, attrs2, attrs, i);
      var seg = p[i], seg2 = p2 && p2[i], seglen = seg.length, seg2len = p2 && seg2.length;
      attrs.x = seg[seglen - 2];
      attrs.y = seg[seglen - 1];
      attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
      attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
      attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
      attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
      attrs2.x = p2 && seg2[seg2len - 2];
      attrs2.y = p2 && seg2[seg2len - 1];
    }
    if (!p2) {
      pth.curve = pathClone(p);
    }
    return p2 ? [p, p2] : p;
  }, null, pathClone), parseDots = R._parseDots = cacher(function(gradient) {
    var dots = [];
    for (var i = 0, ii = gradient.length;i < ii;i++) {
      var dot = {}, par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
      dot.color = R.getRGB(par[1]);
      if (dot.color.error) {
        return null;
      }
      dot.color = dot.color.hex;
      par[2] && (dot.offset = par[2] + "%");
      dots.push(dot);
    }
    for (i = 1, ii = dots.length - 1;i < ii;i++) {
      if (!dots[i].offset) {
        var start = toFloat(dots[i - 1].offset || 0), end = 0;
        for (var j = i + 1;j < ii;j++) {
          if (dots[j].offset) {
            end = dots[j].offset;
            break;
          }
        }
        if (!end) {
          end = 100;
          j = ii;
        }
        end = toFloat(end);
        var d = (end - start) / (j - i + 1);
        for (;i < j;i++) {
          start += d;
          dots[i].offset = start + "%";
        }
      }
    }
    return dots;
  }), tear = R._tear = function(el, paper) {
    el == paper.top && (paper.top = el.prev);
    el == paper.bottom && (paper.bottom = el.next);
    el.next && (el.next.prev = el.prev);
    el.prev && (el.prev.next = el.next);
  }, tofront = R._tofront = function(el, paper) {
    if (paper.top === el) {
      return;
    }
    tear(el, paper);
    el.next = null;
    el.prev = paper.top;
    paper.top.next = el;
    paper.top = el;
  }, toback = R._toback = function(el, paper) {
    if (paper.bottom === el) {
      return;
    }
    tear(el, paper);
    el.next = paper.bottom;
    el.prev = null;
    paper.bottom.prev = el;
    paper.bottom = el;
  }, insertafter = R._insertafter = function(el, el2, paper) {
    tear(el, paper);
    el2 == paper.top && (paper.top = el);
    el2.next && (el2.next.prev = el);
    el.next = el2.next;
    el.prev = el2;
    el2.next = el;
  }, insertbefore = R._insertbefore = function(el, el2, paper) {
    tear(el, paper);
    el2 == paper.bottom && (paper.bottom = el);
    el2.prev && (el2.prev.next = el);
    el.prev = el2.prev;
    el2.prev = el;
    el.next = el2;
  }, toMatrix = R.toMatrix = function(path, transform) {
    var bb = pathDimensions(path), el = {_:{transform:E}, getBBox:function() {
      return bb;
    }};
    extractTransform(el, transform);
    return el.matrix;
  }, transformPath = R.transformPath = function(path, transform) {
    return mapPath(path, toMatrix(path, transform));
  }, extractTransform = R._extractTransform = function(el, tstr) {
    if (tstr == null) {
      return el._.transform;
    }
    tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || E);
    var tdata = R.parseTransformString(tstr), deg = 0, dx = 0, dy = 0, sx = 1, sy = 1, _ = el._, m = new Matrix;
    _.transform = tdata || [];
    if (tdata) {
      for (var i = 0, ii = tdata.length;i < ii;i++) {
        var t = tdata[i], tlen = t.length, command = Str(t[0]).toLowerCase(), absolute = t[0] != command, inver = absolute ? m.invert() : 0, x1, y1, x2, y2, bb;
        if (command == "t" && tlen == 3) {
          if (absolute) {
            x1 = inver.x(0, 0);
            y1 = inver.y(0, 0);
            x2 = inver.x(t[1], t[2]);
            y2 = inver.y(t[1], t[2]);
            m.translate(x2 - x1, y2 - y1);
          } else {
            m.translate(t[1], t[2]);
          }
        } else {
          if (command == "r") {
            if (tlen == 2) {
              bb = bb || el.getBBox(1);
              m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
              deg += t[1];
            } else {
              if (tlen == 4) {
                if (absolute) {
                  x2 = inver.x(t[2], t[3]);
                  y2 = inver.y(t[2], t[3]);
                  m.rotate(t[1], x2, y2);
                } else {
                  m.rotate(t[1], t[2], t[3]);
                }
                deg += t[1];
              }
            }
          } else {
            if (command == "s") {
              if (tlen == 2 || tlen == 3) {
                bb = bb || el.getBBox(1);
                m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                sx *= t[1];
                sy *= t[tlen - 1];
              } else {
                if (tlen == 5) {
                  if (absolute) {
                    x2 = inver.x(t[3], t[4]);
                    y2 = inver.y(t[3], t[4]);
                    m.scale(t[1], t[2], x2, y2);
                  } else {
                    m.scale(t[1], t[2], t[3], t[4]);
                  }
                  sx *= t[1];
                  sy *= t[2];
                }
              }
            } else {
              if (command == "m" && tlen == 7) {
                m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
              }
            }
          }
        }
        _.dirtyT = 1;
        el.matrix = m;
      }
    }
    el.matrix = m;
    _.sx = sx;
    _.sy = sy;
    _.deg = deg;
    _.dx = dx = m.e;
    _.dy = dy = m.f;
    if (sx == 1 && (sy == 1 && (!deg && _.bbox))) {
      _.bbox.x += +dx;
      _.bbox.y += +dy;
    } else {
      _.dirtyT = 1;
    }
  }, getEmpty = function(item) {
    var l = item[0];
    switch(l.toLowerCase()) {
      case "t":
        return[l, 0, 0];
      case "m":
        return[l, 1, 0, 0, 1, 0, 0];
      case "r":
        if (item.length == 4) {
          return[l, 0, item[2], item[3]];
        } else {
          return[l, 0];
        }
      ;
      case "s":
        if (item.length == 5) {
          return[l, 1, 1, item[3], item[4]];
        } else {
          if (item.length == 3) {
            return[l, 1, 1];
          } else {
            return[l, 1];
          }
        }
      ;
    }
  }, equaliseTransform = R._equaliseTransform = function(t1, t2) {
    t2 = Str(t2).replace(/\.{3}|\u2026/g, t1);
    t1 = R.parseTransformString(t1) || [];
    t2 = R.parseTransformString(t2) || [];
    var maxlength = mmax(t1.length, t2.length), from = [], to = [], i = 0, j, jj, tt1, tt2;
    for (;i < maxlength;i++) {
      tt1 = t1[i] || getEmpty(t2[i]);
      tt2 = t2[i] || getEmpty(tt1);
      if (tt1[0] != tt2[0] || (tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3]) || tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4]))) {
        return;
      }
      from[i] = [];
      to[i] = [];
      for (j = 0, jj = mmax(tt1.length, tt2.length);j < jj;j++) {
        j in tt1 && (from[i][j] = tt1[j]);
        j in tt2 && (to[i][j] = tt2[j]);
      }
    }
    return{from:from, to:to};
  };
  R._getContainer = function(x, y, w, h) {
    var container;
    container = h == null && !R.is(x, "object") ? g.doc.getElementById(x) : x;
    if (container == null) {
      return;
    }
    if (container.tagName) {
      if (y == null) {
        return{container:container, width:container.style.pixelWidth || container.offsetWidth, height:container.style.pixelHeight || container.offsetHeight};
      } else {
        return{container:container, width:y, height:w};
      }
    }
    return{container:1, x:x, y:y, width:w, height:h};
  };
  R.pathToRelative = pathToRelative;
  R._engine = {};
  R.path2curve = path2curve;
  R.matrix = function(a, b, c, d, e, f) {
    return new Matrix(a, b, c, d, e, f);
  };
  function Matrix(a, b, c, d, e, f) {
    if (a != null) {
      this.a = +a;
      this.b = +b;
      this.c = +c;
      this.d = +d;
      this.e = +e;
      this.f = +f;
    } else {
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 1;
      this.e = 0;
      this.f = 0;
    }
  }
  (function(matrixproto) {
    matrixproto.add = function(a, b, c, d, e, f) {
      var out = [[], [], []], m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]], matrix = [[a, c, e], [b, d, f], [0, 0, 1]], x, y, z, res;
      if (a && a instanceof Matrix) {
        matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
      }
      for (x = 0;x < 3;x++) {
        for (y = 0;y < 3;y++) {
          res = 0;
          for (z = 0;z < 3;z++) {
            res += m[x][z] * matrix[z][y];
          }
          out[x][y] = res;
        }
      }
      this.a = out[0][0];
      this.b = out[1][0];
      this.c = out[0][1];
      this.d = out[1][1];
      this.e = out[0][2];
      this.f = out[1][2];
    };
    matrixproto.invert = function() {
      var me = this, x = me.a * me.d - me.b * me.c;
      return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
    };
    matrixproto.clone = function() {
      return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
    };
    matrixproto.translate = function(x, y) {
      this.add(1, 0, 0, 1, x, y);
    };
    matrixproto.scale = function(x, y, cx, cy) {
      y == null && (y = x);
      (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
      this.add(x, 0, 0, y, 0, 0);
      (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
    };
    matrixproto.rotate = function(a, x, y) {
      a = R.rad(a);
      x = x || 0;
      y = y || 0;
      var cos = +math.cos(a).toFixed(9), sin = +math.sin(a).toFixed(9);
      this.add(cos, sin, -sin, cos, x, y);
      this.add(1, 0, 0, 1, -x, -y);
    };
    matrixproto.x = function(x, y) {
      return x * this.a + y * this.c + this.e;
    };
    matrixproto.y = function(x, y) {
      return x * this.b + y * this.d + this.f;
    };
    matrixproto.get = function(i) {
      return+this[Str.fromCharCode(97 + i)].toFixed(4);
    };
    matrixproto.toString = function() {
      return R.svg ? "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")" : [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join();
    };
    matrixproto.toFilter = function() {
      return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) + ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) + ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
    };
    matrixproto.offset = function() {
      return[this.e.toFixed(4), this.f.toFixed(4)];
    };
    function norm(a) {
      return a[0] * a[0] + a[1] * a[1];
    }
    function normalize(a) {
      var mag = math.sqrt(norm(a));
      a[0] && (a[0] /= mag);
      a[1] && (a[1] /= mag);
    }
    matrixproto.split = function() {
      var out = {};
      out.dx = this.e;
      out.dy = this.f;
      var row = [[this.a, this.c], [this.b, this.d]];
      out.scalex = math.sqrt(norm(row[0]));
      normalize(row[0]);
      out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
      row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];
      out.scaley = math.sqrt(norm(row[1]));
      normalize(row[1]);
      out.shear /= out.scaley;
      var sin = -row[0][1], cos = row[1][1];
      if (cos < 0) {
        out.rotate = R.deg(math.acos(cos));
        if (sin < 0) {
          out.rotate = 360 - out.rotate;
        }
      } else {
        out.rotate = R.deg(math.asin(sin));
      }
      out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
      out.isSuperSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate);
      out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
      return out;
    };
    matrixproto.toTransformString = function(shorter) {
      var s = shorter || this[split]();
      if (s.isSimple) {
        s.scalex = +s.scalex.toFixed(4);
        s.scaley = +s.scaley.toFixed(4);
        s.rotate = +s.rotate.toFixed(4);
        return(s.dx || s.dy ? "t" + [s.dx, s.dy] : E) + (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) + (s.rotate ? "r" + [s.rotate, 0, 0] : E);
      } else {
        return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
      }
    };
  })(Matrix.prototype);
  var version = navigator.userAgent.match(/Version\/(.*?)\s/) || navigator.userAgent.match(/Chrome\/(\d+)/);
  if (navigator.vendor == "Apple Computer, Inc." && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP") || navigator.vendor == "Google Inc." && (version && version[1] < 8)) {
    paperproto.safari = function() {
      var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke:"none"});
      setTimeout(function() {
        rect.remove();
      });
    };
  } else {
    paperproto.safari = fun;
  }
  var preventDefault = function() {
    this.returnValue = false;
  }, preventTouch = function() {
    return this.originalEvent.preventDefault();
  }, stopPropagation = function() {
    this.cancelBubble = true;
  }, stopTouch = function() {
    return this.originalEvent.stopPropagation();
  }, getEventPosition = function(e) {
    var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop, scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;
    return{x:e.clientX + scrollX, y:e.clientY + scrollY};
  }, addEvent = function() {
    if (g.doc.addEventListener) {
      return function(obj, type, fn, element) {
        var f = function(e) {
          var pos = getEventPosition(e);
          return fn.call(element, e, pos.x, pos.y);
        };
        obj.addEventListener(type, f, false);
        if (supportsTouch && touchMap[type]) {
          var _f = function(e) {
            var pos = getEventPosition(e), olde = e;
            for (var i = 0, ii = e.targetTouches && e.targetTouches.length;i < ii;i++) {
              if (e.targetTouches[i].target == obj) {
                e = e.targetTouches[i];
                e.originalEvent = olde;
                e.preventDefault = preventTouch;
                e.stopPropagation = stopTouch;
                break;
              }
            }
            return fn.call(element, e, pos.x, pos.y);
          };
          obj.addEventListener(touchMap[type], _f, false);
        }
        return function() {
          obj.removeEventListener(type, f, false);
          if (supportsTouch && touchMap[type]) {
            obj.removeEventListener(touchMap[type], f, false);
          }
          return true;
        };
      };
    } else {
      if (g.doc.attachEvent) {
        return function(obj, type, fn, element) {
          var f = function(e) {
            e = e || g.win.event;
            var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop, scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft, x = e.clientX + scrollX, y = e.clientY + scrollY;
            e.preventDefault = e.preventDefault || preventDefault;
            e.stopPropagation = e.stopPropagation || stopPropagation;
            return fn.call(element, e, x, y);
          };
          obj.attachEvent("on" + type, f);
          var detacher = function() {
            obj.detachEvent("on" + type, f);
            return true;
          };
          return detacher;
        };
      }
    }
  }(), drag = [], dragMove = function(e) {
    var x = e.clientX, y = e.clientY, scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop, scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft, dragi, j = drag.length;
    while (j--) {
      dragi = drag[j];
      if (supportsTouch && e.touches) {
        var i = e.touches.length, touch;
        while (i--) {
          touch = e.touches[i];
          if (touch.identifier == dragi.el._drag.id) {
            x = touch.clientX;
            y = touch.clientY;
            (e.originalEvent ? e.originalEvent : e).preventDefault();
            break;
          }
        }
      } else {
        e.preventDefault();
      }
      var node = dragi.el.node, o, next = node.nextSibling, parent = node.parentNode, display = node.style.display;
      g.win.opera && parent.removeChild(node);
      node.style.display = "none";
      o = dragi.el.paper.getElementByPoint(x, y);
      node.style.display = display;
      g.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
      o && eve("raphael.drag.over." + dragi.el.id, dragi.el, o);
      x += scrollX;
      y += scrollY;
      eve("raphael.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
    }
  }, dragUp = function(e) {
    R.unmousemove(dragMove).unmouseup(dragUp);
    var i = drag.length, dragi;
    while (i--) {
      dragi = drag[i];
      dragi.el._drag = {};
      eve("raphael.drag.end." + dragi.el.id, dragi.end_scope || (dragi.start_scope || (dragi.move_scope || dragi.el)), e);
    }
    drag = [];
  }, elproto = R.el = {};
  for (var i = events.length;i--;) {
    (function(eventName) {
      R[eventName] = elproto[eventName] = function(fn, scope) {
        if (R.is(fn, "function")) {
          this.events = this.events || [];
          this.events.push({name:eventName, f:fn, unbind:addEvent(this.shape || (this.node || g.doc), eventName, fn, scope || this)});
        }
        return this;
      };
      R["un" + eventName] = elproto["un" + eventName] = function(fn) {
        var events = this.events || [], l = events.length;
        while (l--) {
          if (events[l].name == eventName && (R.is(fn, "undefined") || events[l].f == fn)) {
            events[l].unbind();
            events.splice(l, 1);
            !events.length && delete this.events;
          }
        }
        return this;
      };
    })(events[i]);
  }
  elproto.data = function(key, value) {
    var data = eldata[this.id] = eldata[this.id] || {};
    if (arguments.length == 0) {
      return data;
    }
    if (arguments.length == 1) {
      if (R.is(key, "object")) {
        for (var i in key) {
          if (key[has](i)) {
            this.data(i, key[i]);
          }
        }
        return this;
      }
      eve("raphael.data.get." + this.id, this, data[key], key);
      return data[key];
    }
    data[key] = value;
    eve("raphael.data.set." + this.id, this, value, key);
    return this;
  };
  elproto.removeData = function(key) {
    if (key == null) {
      eldata[this.id] = {};
    } else {
      eldata[this.id] && delete eldata[this.id][key];
    }
    return this;
  };
  elproto.getData = function() {
    return clone(eldata[this.id] || {});
  };
  elproto.hover = function(f_in, f_out, scope_in, scope_out) {
    return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
  };
  elproto.unhover = function(f_in, f_out) {
    return this.unmouseover(f_in).unmouseout(f_out);
  };
  var draggable = [];
  elproto.drag = function(onmove, onstart, onend, move_scope, start_scope, end_scope) {
    function start(e) {
      (e.originalEvent || e).preventDefault();
      var x = e.clientX, y = e.clientY, scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop, scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;
      this._drag.id = e.identifier;
      if (supportsTouch && e.touches) {
        var i = e.touches.length, touch;
        while (i--) {
          touch = e.touches[i];
          this._drag.id = touch.identifier;
          if (touch.identifier == this._drag.id) {
            x = touch.clientX;
            y = touch.clientY;
            break;
          }
        }
      }
      this._drag.x = x + scrollX;
      this._drag.y = y + scrollY;
      !drag.length && R.mousemove(dragMove).mouseup(dragUp);
      drag.push({el:this, move_scope:move_scope, start_scope:start_scope, end_scope:end_scope});
      onstart && eve.on("raphael.drag.start." + this.id, onstart);
      onmove && eve.on("raphael.drag.move." + this.id, onmove);
      onend && eve.on("raphael.drag.end." + this.id, onend);
      eve("raphael.drag.start." + this.id, start_scope || (move_scope || this), e.clientX + scrollX, e.clientY + scrollY, e);
    }
    this._drag = {};
    draggable.push({el:this, start:start});
    this.mousedown(start);
    return this;
  };
  elproto.onDragOver = function(f) {
    f ? eve.on("raphael.drag.over." + this.id, f) : eve.unbind("raphael.drag.over." + this.id);
  };
  elproto.undrag = function() {
    var i = draggable.length;
    while (i--) {
      if (draggable[i].el == this) {
        this.unmousedown(draggable[i].start);
        draggable.splice(i, 1);
        eve.unbind("raphael.drag.*." + this.id);
      }
    }
    !draggable.length && R.unmousemove(dragMove).unmouseup(dragUp);
    drag = [];
  };
  paperproto.circle = function(x, y, r) {
    var out = R._engine.circle(this, x || 0, y || 0, r || 0);
    this.__set__ && this.__set__.push(out);
    return out;
  };
  paperproto.rect = function(x, y, w, h, r) {
    var out = R._engine.rect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
    this.__set__ && this.__set__.push(out);
    return out;
  };
  paperproto.ellipse = function(x, y, rx, ry) {
    var out = R._engine.ellipse(this, x || 0, y || 0, rx || 0, ry || 0);
    this.__set__ && this.__set__.push(out);
    return out;
  };
  paperproto.path = function(pathString) {
    pathString && (!R.is(pathString, string) && (!R.is(pathString[0], array) && (pathString += E)));
    var out = R._engine.path(R.format[apply](R, arguments), this);
    this.__set__ && this.__set__.push(out);
    return out;
  };
  paperproto.image = function(src, x, y, w, h) {
    var out = R._engine.image(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
    this.__set__ && this.__set__.push(out);
    return out;
  };
  paperproto.text = function(x, y, text) {
    var out = R._engine.text(this, x || 0, y || 0, Str(text));
    this.__set__ && this.__set__.push(out);
    return out;
  };
  paperproto.set = function(itemsArray) {
    !R.is(itemsArray, "array") && (itemsArray = Array.prototype.splice.call(arguments, 0, arguments.length));
    var out = new Set(itemsArray);
    this.__set__ && this.__set__.push(out);
    out["paper"] = this;
    out["type"] = "set";
    return out;
  };
  paperproto.setStart = function(set) {
    this.__set__ = set || this.set();
  };
  paperproto.setFinish = function(set) {
    var out = this.__set__;
    delete this.__set__;
    return out;
  };
  paperproto.setSize = function(width, height) {
    return R._engine.setSize.call(this, width, height);
  };
  paperproto.setViewBox = function(x, y, w, h, fit) {
    return R._engine.setViewBox.call(this, x, y, w, h, fit);
  };
  paperproto.top = paperproto.bottom = null;
  paperproto.raphael = R;
  var getOffset = function(elem) {
    var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement, clientTop = docElem.clientTop || (body.clientTop || 0), clientLeft = docElem.clientLeft || (body.clientLeft || 0), top = box.top + (g.win.pageYOffset || (docElem.scrollTop || body.scrollTop)) - clientTop, left = box.left + (g.win.pageXOffset || (docElem.scrollLeft || body.scrollLeft)) - clientLeft;
    return{y:top, x:left};
  };
  paperproto.getElementByPoint = function(x, y) {
    var paper = this, svg = paper.canvas, target = g.doc.elementFromPoint(x, y);
    if (g.win.opera && target.tagName == "svg") {
      var so = getOffset(svg), sr = svg.createSVGRect();
      sr.x = x - so.x;
      sr.y = y - so.y;
      sr.width = sr.height = 1;
      var hits = svg.getIntersectionList(sr, null);
      if (hits.length) {
        target = hits[hits.length - 1];
      }
    }
    if (!target) {
      return null;
    }
    while (target.parentNode && (target != svg.parentNode && !target.raphael)) {
      target = target.parentNode;
    }
    target == paper.canvas.parentNode && (target = svg);
    target = target && target.raphael ? paper.getById(target.raphaelid) : null;
    return target;
  };
  paperproto.getElementsByBBox = function(bbox) {
    var set = this.set();
    this.forEach(function(el) {
      if (R.isBBoxIntersect(el.getBBox(), bbox)) {
        set.push(el);
      }
    });
    return set;
  };
  paperproto.getById = function(id) {
    var bot = this.bottom;
    while (bot) {
      if (bot.id == id) {
        return bot;
      }
      bot = bot.next;
    }
    return null;
  };
  paperproto.forEach = function(callback, thisArg) {
    var bot = this.bottom;
    while (bot) {
      if (callback.call(thisArg, bot) === false) {
        return this;
      }
      bot = bot.next;
    }
    return this;
  };
  paperproto.getElementsByPoint = function(x, y) {
    var set = this.set();
    this.forEach(function(el) {
      if (el.isPointInside(x, y)) {
        set.push(el);
      }
    });
    return set;
  };
  function x_y() {
    return this.x + S + this.y;
  }
  function x_y_w_h() {
    return this.x + S + this.y + S + this.width + " \u00d7 " + this.height;
  }
  elproto.isPointInside = function(x, y) {
    var rp = this.realPath = getPath[this.type](this);
    if (this.attr("transform") && this.attr("transform").length) {
      rp = R.transformPath(rp, this.attr("transform"));
    }
    return R.isPointInsidePath(rp, x, y);
  };
  elproto.getBBox = function(isWithoutTransform) {
    if (this.removed) {
      return{};
    }
    var _ = this._;
    if (isWithoutTransform) {
      if (_.dirty || !_.bboxwt) {
        this.realPath = getPath[this.type](this);
        _.bboxwt = pathDimensions(this.realPath);
        _.bboxwt.toString = x_y_w_h;
        _.dirty = 0;
      }
      return _.bboxwt;
    }
    if (_.dirty || (_.dirtyT || !_.bbox)) {
      if (_.dirty || !this.realPath) {
        _.bboxwt = 0;
        this.realPath = getPath[this.type](this);
      }
      _.bbox = pathDimensions(mapPath(this.realPath, this.matrix));
      _.bbox.toString = x_y_w_h;
      _.dirty = _.dirtyT = 0;
    }
    return _.bbox;
  };
  elproto.clone = function() {
    if (this.removed) {
      return null;
    }
    var out = this.paper[this.type]().attr(this.attr());
    this.__set__ && this.__set__.push(out);
    return out;
  };
  elproto.glow = function(glow) {
    if (this.type == "text") {
      return null;
    }
    glow = glow || {};
    var s = {width:(glow.width || 10) + (+this.attr("stroke-width") || 1), fill:glow.fill || false, opacity:glow.opacity || 0.5, offsetx:glow.offsetx || 0, offsety:glow.offsety || 0, color:glow.color || "#000"}, c = s.width / 2, r = this.paper, out = r.set(), path = this.realPath || getPath[this.type](this);
    path = this.matrix ? mapPath(path, this.matrix) : path;
    for (var i = 1;i < c + 1;i++) {
      out.push(r.path(path).attr({stroke:s.color, fill:s.fill ? s.color : "none", "stroke-linejoin":"round", "stroke-linecap":"round", "stroke-width":+(s.width / c * i).toFixed(3), opacity:+(s.opacity / c).toFixed(3)}));
    }
    return out.insertBefore(this).translate(s.offsetx, s.offsety);
  };
  var curveslengths = {}, getPointAtSegmentLength = function(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
    if (length == null) {
      return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
    } else {
      return R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTatLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
    }
  }, getLengthFactory = function(istotal, subpath) {
    return function(path, length, onlystart) {
      path = path2curve(path);
      var x, y, p, l, sp = "", subpaths = {}, point, len = 0;
      for (var i = 0, ii = path.length;i < ii;i++) {
        p = path[i];
        if (p[0] == "M") {
          x = +p[1];
          y = +p[2];
        } else {
          l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
          if (len + l > length) {
            if (subpath && !subpaths.start) {
              point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
              sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
              if (onlystart) {
                return sp;
              }
              subpaths.start = sp;
              sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
              len += l;
              x = +p[5];
              y = +p[6];
              continue;
            }
            if (!istotal && !subpath) {
              point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
              return{x:point.x, y:point.y, alpha:point.alpha};
            }
          }
          len += l;
          x = +p[5];
          y = +p[6];
        }
        sp += p.shift() + p;
      }
      subpaths.end = sp;
      point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
      point.alpha && (point = {x:point.x, y:point.y, alpha:point.alpha});
      return point;
    };
  };
  var getTotalLength = getLengthFactory(1), getPointAtLength = getLengthFactory(), getSubpathsAtLength = getLengthFactory(0, 1);
  R.getTotalLength = getTotalLength;
  R.getPointAtLength = getPointAtLength;
  R.getSubpath = function(path, from, to) {
    if (this.getTotalLength(path) - to < 1E-6) {
      return getSubpathsAtLength(path, from).end;
    }
    var a = getSubpathsAtLength(path, to, 1);
    return from ? getSubpathsAtLength(a, from).end : a;
  };
  elproto.getTotalLength = function() {
    var path = this.getPath();
    if (!path) {
      return;
    }
    if (this.node.getTotalLength) {
      return this.node.getTotalLength();
    }
    return getTotalLength(path);
  };
  elproto.getPointAtLength = function(length) {
    var path = this.getPath();
    if (!path) {
      return;
    }
    return getPointAtLength(path, length);
  };
  elproto.getPath = function() {
    var path, getPath = R._getPath[this.type];
    if (this.type == "text" || this.type == "set") {
      return;
    }
    if (getPath) {
      path = getPath(this);
    }
    return path;
  };
  elproto.getSubpath = function(from, to) {
    var path = this.getPath();
    if (!path) {
      return;
    }
    return R.getSubpath(path, from, to);
  };
  var ef = R.easing_formulas = {linear:function(n) {
    return n;
  }, "<":function(n) {
    return pow(n, 1.7);
  }, ">":function(n) {
    return pow(n, 0.48);
  }, "<>":function(n) {
    var q = 0.48 - n / 1.04, Q = math.sqrt(0.1734 + q * q), x = Q - q, X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1), y = -Q - q, Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1), t = X + Y + 0.5;
    return(1 - t) * 3 * t * t + t * t * t;
  }, backIn:function(n) {
    var s = 1.70158;
    return n * n * ((s + 1) * n - s);
  }, backOut:function(n) {
    n = n - 1;
    var s = 1.70158;
    return n * n * ((s + 1) * n + s) + 1;
  }, elastic:function(n) {
    if (n == !!n) {
      return n;
    }
    return pow(2, -10 * n) * math.sin((n - 0.075) * (2 * PI) / 0.3) + 1;
  }, bounce:function(n) {
    var s = 7.5625, p = 2.75, l;
    if (n < 1 / p) {
      l = s * n * n;
    } else {
      if (n < 2 / p) {
        n -= 1.5 / p;
        l = s * n * n + 0.75;
      } else {
        if (n < 2.5 / p) {
          n -= 2.25 / p;
          l = s * n * n + 0.9375;
        } else {
          n -= 2.625 / p;
          l = s * n * n + 0.984375;
        }
      }
    }
    return l;
  }};
  ef.easeIn = ef["ease-in"] = ef["<"];
  ef.easeOut = ef["ease-out"] = ef[">"];
  ef.easeInOut = ef["ease-in-out"] = ef["<>"];
  ef["back-in"] = ef.backIn;
  ef["back-out"] = ef.backOut;
  var animationElements = [], requestAnimFrame = window.requestAnimationFrame || (window.webkitRequestAnimationFrame || (window.mozRequestAnimationFrame || (window.oRequestAnimationFrame || (window.msRequestAnimationFrame || function(callback) {
    setTimeout(callback, 16);
  })))), animation = function() {
    var Now = +new Date, l = 0;
    for (;l < animationElements.length;l++) {
      var e = animationElements[l];
      if (e.el.removed || e.paused) {
        continue;
      }
      var time = Now - e.start, ms = e.ms, easing = e.easing, from = e.from, diff = e.diff, to = e.to, t = e.t, that = e.el, set = {}, now, init = {}, key;
      if (e.initstatus) {
        time = (e.initstatus * e.anim.top - e.prev) / (e.percent - e.prev) * ms;
        e.status = e.initstatus;
        delete e.initstatus;
        e.stop && animationElements.splice(l--, 1);
      } else {
        e.status = (e.prev + (e.percent - e.prev) * (time / ms)) / e.anim.top;
      }
      if (time < 0) {
        continue;
      }
      if (time < ms) {
        var pos = easing(time / ms);
        for (var attr in from) {
          if (from[has](attr)) {
            switch(availableAnimAttrs[attr]) {
              case nu:
                now = +from[attr] + pos * ms * diff[attr];
                break;
              case "colour":
                now = "rgb(" + [upto255(round(from[attr].r + pos * ms * diff[attr].r)), upto255(round(from[attr].g + pos * ms * diff[attr].g)), upto255(round(from[attr].b + pos * ms * diff[attr].b))].join(",") + ")";
                break;
              case "path":
                now = [];
                for (var i = 0, ii = from[attr].length;i < ii;i++) {
                  now[i] = [from[attr][i][0]];
                  for (var j = 1, jj = from[attr][i].length;j < jj;j++) {
                    now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                  }
                  now[i] = now[i].join(S);
                }
                now = now.join(S);
                break;
              case "transform":
                if (diff[attr].real) {
                  now = [];
                  for (i = 0, ii = from[attr].length;i < ii;i++) {
                    now[i] = [from[attr][i][0]];
                    for (j = 1, jj = from[attr][i].length;j < jj;j++) {
                      now[i][j] = from[attr][i][j] + pos * ms * diff[attr][i][j];
                    }
                  }
                } else {
                  var get = function(i) {
                    return+from[attr][i] + pos * ms * diff[attr][i];
                  };
                  now = [["m", get(0), get(1), get(2), get(3), get(4), get(5)]];
                }
                break;
              case "csv":
                if (attr == "clip-rect") {
                  now = [];
                  i = 4;
                  while (i--) {
                    now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                  }
                }
                break;
              default:
                var from2 = [][concat](from[attr]);
                now = [];
                i = that.paper.customAttributes[attr].length;
                while (i--) {
                  now[i] = +from2[i] + pos * ms * diff[attr][i];
                }
                break;
            }
            set[attr] = now;
          }
        }
        that.attr(set);
        (function(id, that, anim) {
          setTimeout(function() {
            eve("raphael.anim.frame." + id, that, anim);
          });
        })(that.id, that, e.anim);
      } else {
        (function(f, el, a) {
          setTimeout(function() {
            eve("raphael.anim.frame." + el.id, el, a);
            eve("raphael.anim.finish." + el.id, el, a);
            R.is(f, "function") && f.call(el);
          });
        })(e.callback, that, e.anim);
        that.attr(to);
        animationElements.splice(l--, 1);
        if (e.repeat > 1 && !e.next) {
          for (key in to) {
            if (to[has](key)) {
              init[key] = e.totalOrigin[key];
            }
          }
          e.el.attr(init);
          runAnimation(e.anim, e.el, e.anim.percents[0], null, e.totalOrigin, e.repeat - 1);
        }
        if (e.next && !e.stop) {
          runAnimation(e.anim, e.el, e.next, null, e.totalOrigin, e.repeat);
        }
      }
    }
    R.svg && (that && (that.paper && that.paper.safari()));
    animationElements.length && requestAnimFrame(animation);
  }, upto255 = function(color) {
    return color > 255 ? 255 : color < 0 ? 0 : color;
  };
  elproto.animateWith = function(el, anim, params, ms, easing, callback) {
    var element = this;
    if (element.removed) {
      callback && callback.call(element);
      return element;
    }
    var a = params instanceof Animation ? params : R.animation(params, ms, easing, callback), x, y;
    runAnimation(a, element, a.percents[0], null, element.attr());
    for (var i = 0, ii = animationElements.length;i < ii;i++) {
      if (animationElements[i].anim == anim && animationElements[i].el == el) {
        animationElements[ii - 1].start = animationElements[i].start;
        break;
      }
    }
    return element;
  };
  function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
    var cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx, cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
    function sampleCurveX(t) {
      return((ax * t + bx) * t + cx) * t;
    }
    function solve(x, epsilon) {
      var t = solveCurveX(x, epsilon);
      return((ay * t + by) * t + cy) * t;
    }
    function solveCurveX(x, epsilon) {
      var t0, t1, t2, x2, d2, i;
      for (t2 = x, i = 0;i < 8;i++) {
        x2 = sampleCurveX(t2) - x;
        if (abs(x2) < epsilon) {
          return t2;
        }
        d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
        if (abs(d2) < 1E-6) {
          break;
        }
        t2 = t2 - x2 / d2;
      }
      t0 = 0;
      t1 = 1;
      t2 = x;
      if (t2 < t0) {
        return t0;
      }
      if (t2 > t1) {
        return t1;
      }
      while (t0 < t1) {
        x2 = sampleCurveX(t2);
        if (abs(x2 - x) < epsilon) {
          return t2;
        }
        if (x > x2) {
          t0 = t2;
        } else {
          t1 = t2;
        }
        t2 = (t1 - t0) / 2 + t0;
      }
      return t2;
    }
    return solve(t, 1 / (200 * duration));
  }
  elproto.onAnimation = function(f) {
    f ? eve.on("raphael.anim.frame." + this.id, f) : eve.unbind("raphael.anim.frame." + this.id);
    return this;
  };
  function Animation(anim, ms) {
    var percents = [], newAnim = {};
    this.ms = ms;
    this.times = 1;
    if (anim) {
      for (var attr in anim) {
        if (anim[has](attr)) {
          newAnim[toFloat(attr)] = anim[attr];
          percents.push(toFloat(attr));
        }
      }
      percents.sort(sortByNumber);
    }
    this.anim = newAnim;
    this.top = percents[percents.length - 1];
    this.percents = percents;
  }
  Animation.prototype.delay = function(delay) {
    var a = new Animation(this.anim, this.ms);
    a.times = this.times;
    a.del = +delay || 0;
    return a;
  };
  Animation.prototype.repeat = function(times) {
    var a = new Animation(this.anim, this.ms);
    a.del = this.del;
    a.times = math.floor(mmax(times, 0)) || 1;
    return a;
  };
  function runAnimation(anim, element, percent, status, totalOrigin, times) {
    percent = toFloat(percent);
    var params, isInAnim, isInAnimSet, percents = [], next, prev, timestamp, ms = anim.ms, from = {}, to = {}, diff = {};
    if (status) {
      for (i = 0, ii = animationElements.length;i < ii;i++) {
        var e = animationElements[i];
        if (e.el.id == element.id && e.anim == anim) {
          if (e.percent != percent) {
            animationElements.splice(i, 1);
            isInAnimSet = 1;
          } else {
            isInAnim = e;
          }
          element.attr(e.totalOrigin);
          break;
        }
      }
    } else {
      status = +to;
    }
    for (var i = 0, ii = anim.percents.length;i < ii;i++) {
      if (anim.percents[i] == percent || anim.percents[i] > status * anim.top) {
        percent = anim.percents[i];
        prev = anim.percents[i - 1] || 0;
        ms = ms / anim.top * (percent - prev);
        next = anim.percents[i + 1];
        params = anim.anim[percent];
        break;
      } else {
        if (status) {
          element.attr(anim.anim[anim.percents[i]]);
        }
      }
    }
    if (!params) {
      return;
    }
    if (!isInAnim) {
      for (var attr in params) {
        if (params[has](attr)) {
          if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
            from[attr] = element.attr(attr);
            from[attr] == null && (from[attr] = availableAttrs[attr]);
            to[attr] = params[attr];
            switch(availableAnimAttrs[attr]) {
              case nu:
                diff[attr] = (to[attr] - from[attr]) / ms;
                break;
              case "colour":
                from[attr] = R.getRGB(from[attr]);
                var toColour = R.getRGB(to[attr]);
                diff[attr] = {r:(toColour.r - from[attr].r) / ms, g:(toColour.g - from[attr].g) / ms, b:(toColour.b - from[attr].b) / ms};
                break;
              case "path":
                var pathes = path2curve(from[attr], to[attr]), toPath = pathes[1];
                from[attr] = pathes[0];
                diff[attr] = [];
                for (i = 0, ii = from[attr].length;i < ii;i++) {
                  diff[attr][i] = [0];
                  for (var j = 1, jj = from[attr][i].length;j < jj;j++) {
                    diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                  }
                }
                break;
              case "transform":
                var _ = element._, eq = equaliseTransform(_[attr], to[attr]);
                if (eq) {
                  from[attr] = eq.from;
                  to[attr] = eq.to;
                  diff[attr] = [];
                  diff[attr].real = true;
                  for (i = 0, ii = from[attr].length;i < ii;i++) {
                    diff[attr][i] = [from[attr][i][0]];
                    for (j = 1, jj = from[attr][i].length;j < jj;j++) {
                      diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                    }
                  }
                } else {
                  var m = element.matrix || new Matrix, to2 = {_:{transform:_.transform}, getBBox:function() {
                    return element.getBBox(1);
                  }};
                  from[attr] = [m.a, m.b, m.c, m.d, m.e, m.f];
                  extractTransform(to2, to[attr]);
                  to[attr] = to2._.transform;
                  diff[attr] = [(to2.matrix.a - m.a) / ms, (to2.matrix.b - m.b) / ms, (to2.matrix.c - m.c) / ms, (to2.matrix.d - m.d) / ms, (to2.matrix.e - m.e) / ms, (to2.matrix.f - m.f) / ms];
                }
                break;
              case "csv":
                var values = Str(params[attr])[split](separator), from2 = Str(from[attr])[split](separator);
                if (attr == "clip-rect") {
                  from[attr] = from2;
                  diff[attr] = [];
                  i = from2.length;
                  while (i--) {
                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                  }
                }
                to[attr] = values;
                break;
              default:
                values = [][concat](params[attr]);
                from2 = [][concat](from[attr]);
                diff[attr] = [];
                i = element.paper.customAttributes[attr].length;
                while (i--) {
                  diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                }
                break;
            }
          }
        }
      }
      var easing = params.easing, easyeasy = R.easing_formulas[easing];
      if (!easyeasy) {
        easyeasy = Str(easing).match(bezierrg);
        if (easyeasy && easyeasy.length == 5) {
          var curve = easyeasy;
          easyeasy = function(t) {
            return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
          };
        } else {
          easyeasy = pipe;
        }
      }
      timestamp = params.start || (anim.start || +new Date);
      e = {anim:anim, percent:percent, timestamp:timestamp, start:timestamp + (anim.del || 0), status:0, initstatus:status || 0, stop:false, ms:ms, easing:easyeasy, from:from, diff:diff, to:to, el:element, callback:params.callback, prev:prev, next:next, repeat:times || anim.times, origin:element.attr(), totalOrigin:totalOrigin};
      animationElements.push(e);
      if (status && (!isInAnim && !isInAnimSet)) {
        e.stop = true;
        e.start = new Date - ms * status;
        if (animationElements.length == 1) {
          return animation();
        }
      }
      if (isInAnimSet) {
        e.start = new Date - e.ms * status;
      }
      animationElements.length == 1 && requestAnimFrame(animation);
    } else {
      isInAnim.initstatus = status;
      isInAnim.start = new Date - isInAnim.ms * status;
    }
    eve("raphael.anim.start." + element.id, element, anim);
  }
  R.animation = function(params, ms, easing, callback) {
    if (params instanceof Animation) {
      return params;
    }
    if (R.is(easing, "function") || !easing) {
      callback = callback || (easing || null);
      easing = null;
    }
    params = Object(params);
    ms = +ms || 0;
    var p = {}, json, attr;
    for (attr in params) {
      if (params[has](attr) && (toFloat(attr) != attr && toFloat(attr) + "%" != attr)) {
        json = true;
        p[attr] = params[attr];
      }
    }
    if (!json) {
      return new Animation(params, ms);
    } else {
      easing && (p.easing = easing);
      callback && (p.callback = callback);
      return new Animation({100:p}, ms);
    }
  };
  elproto.animate = function(params, ms, easing, callback) {
    var element = this;
    if (element.removed) {
      callback && callback.call(element);
      return element;
    }
    var anim = params instanceof Animation ? params : R.animation(params, ms, easing, callback);
    runAnimation(anim, element, anim.percents[0], null, element.attr());
    return element;
  };
  elproto.setTime = function(anim, value) {
    if (anim && value != null) {
      this.status(anim, mmin(value, anim.ms) / anim.ms);
    }
    return this;
  };
  elproto.status = function(anim, value) {
    var out = [], i = 0, len, e;
    if (value != null) {
      runAnimation(anim, this, -1, mmin(value, 1));
      return this;
    } else {
      len = animationElements.length;
      for (;i < len;i++) {
        e = animationElements[i];
        if (e.el.id == this.id && (!anim || e.anim == anim)) {
          if (anim) {
            return e.status;
          }
          out.push({anim:e.anim, status:e.status});
        }
      }
      if (anim) {
        return 0;
      }
      return out;
    }
  };
  elproto.pause = function(anim) {
    for (var i = 0;i < animationElements.length;i++) {
      if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
        if (eve("raphael.anim.pause." + this.id, this, animationElements[i].anim) !== false) {
          animationElements[i].paused = true;
        }
      }
    }
    return this;
  };
  elproto.resume = function(anim) {
    for (var i = 0;i < animationElements.length;i++) {
      if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
        var e = animationElements[i];
        if (eve("raphael.anim.resume." + this.id, this, e.anim) !== false) {
          delete e.paused;
          this.status(e.anim, e.status);
        }
      }
    }
    return this;
  };
  elproto.stop = function(anim) {
    for (var i = 0;i < animationElements.length;i++) {
      if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
        if (eve("raphael.anim.stop." + this.id, this, animationElements[i].anim) !== false) {
          animationElements.splice(i--, 1);
        }
      }
    }
    return this;
  };
  function stopAnimation(paper) {
    for (var i = 0;i < animationElements.length;i++) {
      if (animationElements[i].el.paper == paper) {
        animationElements.splice(i--, 1);
      }
    }
  }
  eve.on("raphael.remove", stopAnimation);
  eve.on("raphael.clear", stopAnimation);
  elproto.toString = function() {
    return "Rapha\u00ebl\u2019s object";
  };
  var Set = function(items) {
    this.items = [];
    this.length = 0;
    this.type = "set";
    if (items) {
      for (var i = 0, ii = items.length;i < ii;i++) {
        if (items[i] && (items[i].constructor == elproto.constructor || items[i].constructor == Set)) {
          this[this.items.length] = this.items[this.items.length] = items[i];
          this.length++;
        }
      }
    }
  }, setproto = Set.prototype;
  setproto.push = function() {
    var item, len;
    for (var i = 0, ii = arguments.length;i < ii;i++) {
      item = arguments[i];
      if (item && (item.constructor == elproto.constructor || item.constructor == Set)) {
        len = this.items.length;
        this[len] = this.items[len] = item;
        this.length++;
      }
    }
    return this;
  };
  setproto.pop = function() {
    this.length && delete this[this.length--];
    return this.items.pop();
  };
  setproto.forEach = function(callback, thisArg) {
    for (var i = 0, ii = this.items.length;i < ii;i++) {
      if (callback.call(thisArg, this.items[i], i) === false) {
        return this;
      }
    }
    return this;
  };
  for (var method in elproto) {
    if (elproto[has](method)) {
      setproto[method] = function(methodname) {
        return function() {
          var arg = arguments;
          return this.forEach(function(el) {
            el[methodname][apply](el, arg);
          });
        };
      }(method);
    }
  }
  setproto.attr = function(name, value) {
    if (name && (R.is(name, array) && R.is(name[0], "object"))) {
      for (var j = 0, jj = name.length;j < jj;j++) {
        this.items[j].attr(name[j]);
      }
    } else {
      for (var i = 0, ii = this.items.length;i < ii;i++) {
        this.items[i].attr(name, value);
      }
    }
    return this;
  };
  setproto.clear = function() {
    while (this.length) {
      this.pop();
    }
  };
  setproto.splice = function(index, count, insertion) {
    index = index < 0 ? mmax(this.length + index, 0) : index;
    count = mmax(0, mmin(this.length - index, count));
    var tail = [], todel = [], args = [], i;
    for (i = 2;i < arguments.length;i++) {
      args.push(arguments[i]);
    }
    for (i = 0;i < count;i++) {
      todel.push(this[index + i]);
    }
    for (;i < this.length - index;i++) {
      tail.push(this[index + i]);
    }
    var arglen = args.length;
    for (i = 0;i < arglen + tail.length;i++) {
      this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
    }
    i = this.items.length = this.length -= count - arglen;
    while (this[i]) {
      delete this[i++];
    }
    return new Set(todel);
  };
  setproto.exclude = function(el) {
    for (var i = 0, ii = this.length;i < ii;i++) {
      if (this[i] == el) {
        this.splice(i, 1);
        return true;
      }
    }
  };
  setproto.animate = function(params, ms, easing, callback) {
    (R.is(easing, "function") || !easing) && (callback = easing || null);
    var len = this.items.length, i = len, item, set = this, collector;
    if (!len) {
      return this;
    }
    callback && (collector = function() {
      !--len && callback.call(set);
    });
    easing = R.is(easing, string) ? easing : collector;
    var anim = R.animation(params, ms, easing, collector);
    item = this.items[--i].animate(anim);
    while (i--) {
      this.items[i] && (!this.items[i].removed && this.items[i].animateWith(item, anim, anim));
      this.items[i] && !this.items[i].removed || len--;
    }
    return this;
  };
  setproto.insertAfter = function(el) {
    var i = this.items.length;
    while (i--) {
      this.items[i].insertAfter(el);
    }
    return this;
  };
  setproto.getBBox = function() {
    var x = [], y = [], x2 = [], y2 = [];
    for (var i = this.items.length;i--;) {
      if (!this.items[i].removed) {
        var box = this.items[i].getBBox();
        x.push(box.x);
        y.push(box.y);
        x2.push(box.x + box.width);
        y2.push(box.y + box.height);
      }
    }
    x = mmin[apply](0, x);
    y = mmin[apply](0, y);
    x2 = mmax[apply](0, x2);
    y2 = mmax[apply](0, y2);
    return{x:x, y:y, x2:x2, y2:y2, width:x2 - x, height:y2 - y};
  };
  setproto.clone = function(s) {
    s = this.paper.set();
    for (var i = 0, ii = this.items.length;i < ii;i++) {
      s.push(this.items[i].clone());
    }
    return s;
  };
  setproto.toString = function() {
    return "Rapha\u00ebl\u2018s set";
  };
  setproto.glow = function(glowConfig) {
    var ret = this.paper.set();
    this.forEach(function(shape, index) {
      var g = shape.glow(glowConfig);
      if (g != null) {
        g.forEach(function(shape2, index2) {
          ret.push(shape2);
        });
      }
    });
    return ret;
  };
  setproto.isPointInside = function(x, y) {
    var isPointInside = false;
    this.forEach(function(el) {
      if (el.isPointInside(x, y)) {
        isPointInside = true;
        return false;
      }
    });
    return isPointInside;
  };
  R.registerFont = function(font) {
    if (!font.face) {
      return font;
    }
    this.fonts = this.fonts || {};
    var fontcopy = {w:font.w, face:{}, glyphs:{}}, family = font.face["font-family"];
    for (var prop in font.face) {
      if (font.face[has](prop)) {
        fontcopy.face[prop] = font.face[prop];
      }
    }
    if (this.fonts[family]) {
      this.fonts[family].push(fontcopy);
    } else {
      this.fonts[family] = [fontcopy];
    }
    if (!font.svg) {
      fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
      for (var glyph in font.glyphs) {
        if (font.glyphs[has](glyph)) {
          var path = font.glyphs[glyph];
          fontcopy.glyphs[glyph] = {w:path.w, k:{}, d:path.d && "M" + path.d.replace(/[mlcxtrv]/g, function(command) {
            return{l:"L", c:"C", x:"z", t:"m", r:"l", v:"c"}[command] || "M";
          }) + "z"};
          if (path.k) {
            for (var k in path.k) {
              if (path[has](k)) {
                fontcopy.glyphs[glyph].k[k] = path.k[k];
              }
            }
          }
        }
      }
    }
    return font;
  };
  paperproto.getFont = function(family, weight, style, stretch) {
    stretch = stretch || "normal";
    style = style || "normal";
    weight = +weight || ({normal:400, bold:700, lighter:300, bolder:800}[weight] || 400);
    if (!R.fonts) {
      return;
    }
    var font = R.fonts[family];
    if (!font) {
      var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
      for (var fontName in R.fonts) {
        if (R.fonts[has](fontName)) {
          if (name.test(fontName)) {
            font = R.fonts[fontName];
            break;
          }
        }
      }
    }
    var thefont;
    if (font) {
      for (var i = 0, ii = font.length;i < ii;i++) {
        thefont = font[i];
        if (thefont.face["font-weight"] == weight && ((thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch)) {
          break;
        }
      }
    }
    return thefont;
  };
  paperproto.print = function(x, y, string, font, size, origin, letter_spacing, line_spacing) {
    origin = origin || "middle";
    letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
    line_spacing = mmax(mmin(line_spacing || 1, 3), 1);
    var letters = Str(string)[split](E), shift = 0, notfirst = 0, path = E, scale;
    R.is(font, "string") && (font = this.getFont(font));
    if (font) {
      scale = (size || 16) / font.face["units-per-em"];
      var bb = font.face.bbox[split](separator), top = +bb[0], lineHeight = bb[3] - bb[1], shifty = 0, height = +bb[1] + (origin == "baseline" ? lineHeight + +font.face.descent : lineHeight / 2);
      for (var i = 0, ii = letters.length;i < ii;i++) {
        if (letters[i] == "\n") {
          shift = 0;
          curr = 0;
          notfirst = 0;
          shifty += lineHeight * line_spacing;
        } else {
          var prev = notfirst && font.glyphs[letters[i - 1]] || {}, curr = font.glyphs[letters[i]];
          shift += notfirst ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + font.w * letter_spacing : 0;
          notfirst = 1;
        }
        if (curr && curr.d) {
          path += R.transformPath(curr.d, ["t", shift * scale, shifty * scale, "s", scale, scale, top, height, "t", (x - top) / scale, (y - height) / scale]);
        }
      }
    }
    return this.path(path).attr({fill:"#000", stroke:"none"});
  };
  paperproto.add = function(json) {
    if (R.is(json, "array")) {
      var res = this.set(), i = 0, ii = json.length, j;
      for (;i < ii;i++) {
        j = json[i] || {};
        elements[has](j.type) && res.push(this[j.type]().attr(j));
      }
    }
    return res;
  };
  R.format = function(token, params) {
    var args = R.is(params, array) ? [0][concat](params) : arguments;
    token && (R.is(token, string) && (args.length - 1 && (token = token.replace(formatrg, function(str, i) {
      return args[++i] == null ? E : args[i];
    }))));
    return token || E;
  };
  R.fullfill = function() {
    var tokenRegex = /\{([^\}]+)\}/g, objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, replacer = function(all, key, obj) {
      var res = obj;
      key.replace(objNotationRegex, function(all, name, quote, quotedName, isFunc) {
        name = name || quotedName;
        if (res) {
          if (name in res) {
            res = res[name];
          }
          typeof res == "function" && (isFunc && (res = res()));
        }
      });
      res = (res == null || res == obj ? all : res) + "";
      return res;
    };
    return function(str, obj) {
      return String(str).replace(tokenRegex, function(all, key) {
        return replacer(all, key, obj);
      });
    };
  }();
  R.ninja = function() {
    oldRaphael.was ? g.win.Raphael = oldRaphael.is : delete Raphael;
    return R;
  };
  R.st = setproto;
  (function(doc, loaded, f) {
    if (doc.readyState == null && doc.addEventListener) {
      doc.addEventListener(loaded, f = function() {
        doc.removeEventListener(loaded, f, false);
        doc.readyState = "complete";
      }, false);
      doc.readyState = "loading";
    }
    function isLoaded() {
      /in/.test(doc.readyState) ? setTimeout(isLoaded, 9) : R.eve("raphael.DOMload");
    }
    isLoaded();
  })(document, "DOMContentLoaded");
  eve.on("raphael.DOMload", function() {
    loaded = true;
  });
  (function() {
    if (!R.svg) {
      return;
    }
    var has = "hasOwnProperty", Str = String, toFloat = parseFloat, toInt = parseInt, math = Math, mmax = math.max, abs = math.abs, pow = math.pow, separator = /[, ]+/, eve = R.eve, E = "", S = " ";
    var xlink = "http://www.w3.org/1999/xlink", markers = {block:"M5,0 0,2.5 5,5z", classic:"M5,0 0,2.5 5,5 3.5,3 3.5,2z", diamond:"M2.5,0 5,2.5 2.5,5 0,2.5z", open:"M6,1 1,3.5 6,6", oval:"M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"}, markerCounter = {};
    var $ = function(el, attr) {
      if (attr) {
        if (typeof el == "string") {
          el = $(el);
        }
        for (var key in attr) {
          if (attr[has](key)) {
            if (key.substring(0, 6) == "xlink:") {
              el.setAttributeNS(xlink, key.substring(6), Str(attr[key]));
            } else {
              el.setAttribute(key, Str(attr[key]));
            }
          }
        }
      } else {
        el = R._g.doc.createElementNS("http://www.w3.org/2000/svg", el);
        el.style && (el.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
      }
      return el;
    }, addGradientFill = function(element, gradient) {
      var type = "linear", id = element.id + gradient, fx = 0.5, fy = 0.5, o = element.node, SVG = element.paper, s = o.style, el = R._g.doc.getElementById(id);
      if (!el) {
        gradient = Str(gradient).replace(R._radial_gradient, function(all, _fx, _fy) {
          type = "radial";
          if (_fx && _fy) {
            fx = toFloat(_fx);
            fy = toFloat(_fy);
            var dir = (fy > 0.5) * 2 - 1;
            pow(fx - 0.5, 2) + pow(fy - 0.5, 2) > 0.25 && ((fy = math.sqrt(0.25 - pow(fx - 0.5, 2)) * dir + 0.5) && (fy != 0.5 && (fy = fy.toFixed(5) - 1E-5 * dir)));
          }
          return E;
        });
        gradient = gradient.split(/\s*\-\s*/);
        if (type == "linear") {
          var angle = gradient.shift();
          angle = -toFloat(angle);
          if (isNaN(angle)) {
            return null;
          }
          var vector = [0, 0, math.cos(R.rad(angle)), math.sin(R.rad(angle))], max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
          vector[2] *= max;
          vector[3] *= max;
          if (vector[2] < 0) {
            vector[0] = -vector[2];
            vector[2] = 0;
          }
          if (vector[3] < 0) {
            vector[1] = -vector[3];
            vector[3] = 0;
          }
        }
        var dots = R._parseDots(gradient);
        if (!dots) {
          return null;
        }
        id = id.replace(/[\(\)\s,\xb0#]/g, "_");
        if (element.gradient && id != element.gradient.id) {
          SVG.defs.removeChild(element.gradient);
          delete element.gradient;
        }
        if (!element.gradient) {
          el = $(type + "Gradient", {id:id});
          element.gradient = el;
          $(el, type == "radial" ? {fx:fx, fy:fy} : {x1:vector[0], y1:vector[1], x2:vector[2], y2:vector[3], gradientTransform:element.matrix.invert()});
          SVG.defs.appendChild(el);
          for (var i = 0, ii = dots.length;i < ii;i++) {
            el.appendChild($("stop", {offset:dots[i].offset ? dots[i].offset : i ? "100%" : "0%", "stop-color":dots[i].color || "#fff"}));
          }
        }
      }
      $(o, {fill:"url(#" + id + ")", opacity:1, "fill-opacity":1});
      s.fill = E;
      s.opacity = 1;
      s.fillOpacity = 1;
      return 1;
    }, updatePosition = function(o) {
      var bbox = o.getBBox(1);
      $(o.pattern, {patternTransform:o.matrix.invert() + " translate(" + bbox.x + "," + bbox.y + ")"});
    }, addArrow = function(o, value, isEnd) {
      if (o.type == "path") {
        var values = Str(value).toLowerCase().split("-"), p = o.paper, se = isEnd ? "end" : "start", node = o.node, attrs = o.attrs, stroke = attrs["stroke-width"], i = values.length, type = "classic", from, to, dx, refX, attr, w = 3, h = 3, t = 5;
        while (i--) {
          switch(values[i]) {
            case "block":
            ;
            case "classic":
            ;
            case "oval":
            ;
            case "diamond":
            ;
            case "open":
            ;
            case "none":
              type = values[i];
              break;
            case "wide":
              h = 5;
              break;
            case "narrow":
              h = 2;
              break;
            case "long":
              w = 5;
              break;
            case "short":
              w = 2;
              break;
          }
        }
        if (type == "open") {
          w += 2;
          h += 2;
          t += 2;
          dx = 1;
          refX = isEnd ? 4 : 1;
          attr = {fill:"none", stroke:attrs.stroke};
        } else {
          refX = dx = w / 2;
          attr = {fill:attrs.stroke, stroke:"none"};
        }
        if (o._.arrows) {
          if (isEnd) {
            o._.arrows.endPath && markerCounter[o._.arrows.endPath]--;
            o._.arrows.endMarker && markerCounter[o._.arrows.endMarker]--;
          } else {
            o._.arrows.startPath && markerCounter[o._.arrows.startPath]--;
            o._.arrows.startMarker && markerCounter[o._.arrows.startMarker]--;
          }
        } else {
          o._.arrows = {};
        }
        if (type != "none") {
          var pathId = "raphael-marker-" + type, markerId = "raphael-marker-" + se + type + w + h;
          if (!R._g.doc.getElementById(pathId)) {
            p.defs.appendChild($($("path"), {"stroke-linecap":"round", d:markers[type], id:pathId}));
            markerCounter[pathId] = 1;
          } else {
            markerCounter[pathId]++;
          }
          var marker = R._g.doc.getElementById(markerId), use;
          if (!marker) {
            marker = $($("marker"), {id:markerId, markerHeight:h, markerWidth:w, orient:"auto", refX:refX, refY:h / 2});
            use = $($("use"), {"xlink:href":"#" + pathId, transform:(isEnd ? "rotate(180 " + w / 2 + " " + h / 2 + ") " : E) + "scale(" + w / t + "," + h / t + ")", "stroke-width":(1 / ((w / t + h / t) / 2)).toFixed(4)});
            marker.appendChild(use);
            p.defs.appendChild(marker);
            markerCounter[markerId] = 1;
          } else {
            markerCounter[markerId]++;
            use = marker.getElementsByTagName("use")[0];
          }
          $(use, attr);
          var delta = dx * (type != "diamond" && type != "oval");
          if (isEnd) {
            from = o._.arrows.startdx * stroke || 0;
            to = R.getTotalLength(attrs.path) - delta * stroke;
          } else {
            from = delta * stroke;
            to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
          }
          attr = {};
          attr["marker-" + se] = "url(#" + markerId + ")";
          if (to || from) {
            attr.d = R.getSubpath(attrs.path, from, to);
          }
          $(node, attr);
          o._.arrows[se + "Path"] = pathId;
          o._.arrows[se + "Marker"] = markerId;
          o._.arrows[se + "dx"] = delta;
          o._.arrows[se + "Type"] = type;
          o._.arrows[se + "String"] = value;
        } else {
          if (isEnd) {
            from = o._.arrows.startdx * stroke || 0;
            to = R.getTotalLength(attrs.path) - from;
          } else {
            from = 0;
            to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
          }
          o._.arrows[se + "Path"] && $(node, {d:R.getSubpath(attrs.path, from, to)});
          delete o._.arrows[se + "Path"];
          delete o._.arrows[se + "Marker"];
          delete o._.arrows[se + "dx"];
          delete o._.arrows[se + "Type"];
          delete o._.arrows[se + "String"];
        }
        for (attr in markerCounter) {
          if (markerCounter[has](attr) && !markerCounter[attr]) {
            var item = R._g.doc.getElementById(attr);
            item && item.parentNode.removeChild(item);
          }
        }
      }
    }, dasharray = {"":[0], "none":[0], "-":[3, 1], ".":[1, 1], "-.":[3, 1, 1, 1], "-..":[3, 1, 1, 1, 1, 1], ". ":[1, 3], "- ":[4, 3], "--":[8, 3], "- .":[4, 3, 1, 3], "--.":[8, 3, 1, 3], "--..":[8, 3, 1, 3, 1, 3]}, addDashes = function(o, value, params) {
      value = dasharray[Str(value).toLowerCase()];
      if (value) {
        var width = o.attrs["stroke-width"] || "1", butt = {round:width, square:width, butt:0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0, dashes = [], i = value.length;
        while (i--) {
          dashes[i] = value[i] * width + (i % 2 ? 1 : -1) * butt;
        }
        $(o.node, {"stroke-dasharray":dashes.join(",")});
      }
    }, setFillAndStroke = function(o, params) {
      var node = o.node, attrs = o.attrs, vis = node.style.visibility;
      node.style.visibility = "hidden";
      for (var att in params) {
        if (params[has](att)) {
          if (!R._availableAttrs[has](att)) {
            continue;
          }
          var value = params[att];
          attrs[att] = value;
          switch(att) {
            case "blur":
              o.blur(value);
              break;
            case "title":
              var title = node.getElementsByTagName("title");
              if (title.length && (title = title[0])) {
                title.firstChild.nodeValue = value;
              } else {
                title = $("title");
                var val = R._g.doc.createTextNode(value);
                title.appendChild(val);
                node.appendChild(title);
              }
              break;
            case "href":
            ;
            case "target":
              var pn = node.parentNode;
              if (pn.tagName.toLowerCase() != "a") {
                var hl = $("a");
                pn.insertBefore(hl, node);
                hl.appendChild(node);
                pn = hl;
              }
              if (att == "target") {
                pn.setAttributeNS(xlink, "show", value == "blank" ? "new" : value);
              } else {
                pn.setAttributeNS(xlink, att, value);
              }
              break;
            case "cursor":
              node.style.cursor = value;
              break;
            case "transform":
              o.transform(value);
              break;
            case "arrow-start":
              addArrow(o, value);
              break;
            case "arrow-end":
              addArrow(o, value, 1);
              break;
            case "clip-rect":
              var rect = Str(value).split(separator);
              if (rect.length == 4) {
                o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                var el = $("clipPath"), rc = $("rect");
                el.id = R.createUUID();
                $(rc, {x:rect[0], y:rect[1], width:rect[2], height:rect[3]});
                el.appendChild(rc);
                o.paper.defs.appendChild(el);
                $(node, {"clip-path":"url(#" + el.id + ")"});
                o.clip = rc;
              }
              if (!value) {
                var path = node.getAttribute("clip-path");
                if (path) {
                  var clip = R._g.doc.getElementById(path.replace(/(^url\(#|\)$)/g, E));
                  clip && clip.parentNode.removeChild(clip);
                  $(node, {"clip-path":E});
                  delete o.clip;
                }
              }
              break;
            case "path":
              if (o.type == "path") {
                $(node, {d:value ? attrs.path = R._pathToAbsolute(value) : "M0,0"});
                o._.dirty = 1;
                if (o._.arrows) {
                  "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                  "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                }
              }
              break;
            case "width":
              node.setAttribute(att, value);
              o._.dirty = 1;
              if (attrs.fx) {
                att = "x";
                value = attrs.x;
              } else {
                break;
              }
            ;
            case "x":
              if (attrs.fx) {
                value = -attrs.x - (attrs.width || 0);
              }
            ;
            case "rx":
              if (att == "rx" && o.type == "rect") {
                break;
              }
            ;
            case "cx":
              node.setAttribute(att, value);
              o.pattern && updatePosition(o);
              o._.dirty = 1;
              break;
            case "height":
              node.setAttribute(att, value);
              o._.dirty = 1;
              if (attrs.fy) {
                att = "y";
                value = attrs.y;
              } else {
                break;
              }
            ;
            case "y":
              if (attrs.fy) {
                value = -attrs.y - (attrs.height || 0);
              }
            ;
            case "ry":
              if (att == "ry" && o.type == "rect") {
                break;
              }
            ;
            case "cy":
              node.setAttribute(att, value);
              o.pattern && updatePosition(o);
              o._.dirty = 1;
              break;
            case "r":
              if (o.type == "rect") {
                $(node, {rx:value, ry:value});
              } else {
                node.setAttribute(att, value);
              }
              o._.dirty = 1;
              break;
            case "src":
              if (o.type == "image") {
                node.setAttributeNS(xlink, "href", value);
              }
              break;
            case "stroke-width":
              if (o._.sx != 1 || o._.sy != 1) {
                value /= mmax(abs(o._.sx), abs(o._.sy)) || 1;
              }
              if (o.paper._vbSize) {
                value *= o.paper._vbSize;
              }
              node.setAttribute(att, value);
              if (attrs["stroke-dasharray"]) {
                addDashes(o, attrs["stroke-dasharray"], params);
              }
              if (o._.arrows) {
                "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
              }
              break;
            case "stroke-dasharray":
              addDashes(o, value, params);
              break;
            case "fill":
              var isURL = Str(value).match(R._ISURL);
              if (isURL) {
                el = $("pattern");
                var ig = $("image");
                el.id = R.createUUID();
                $(el, {x:0, y:0, patternUnits:"userSpaceOnUse", height:1, width:1});
                $(ig, {x:0, y:0, "xlink:href":isURL[1]});
                el.appendChild(ig);
                (function(el) {
                  R._preload(isURL[1], function() {
                    var w = this.offsetWidth, h = this.offsetHeight;
                    $(el, {width:w, height:h});
                    $(ig, {width:w, height:h});
                    o.paper.safari();
                  });
                })(el);
                o.paper.defs.appendChild(el);
                $(node, {fill:"url(#" + el.id + ")"});
                o.pattern = el;
                o.pattern && updatePosition(o);
                break;
              }
              var clr = R.getRGB(value);
              if (!clr.error) {
                delete params.gradient;
                delete attrs.gradient;
                !R.is(attrs.opacity, "undefined") && (R.is(params.opacity, "undefined") && $(node, {opacity:attrs.opacity}));
                !R.is(attrs["fill-opacity"], "undefined") && (R.is(params["fill-opacity"], "undefined") && $(node, {"fill-opacity":attrs["fill-opacity"]}));
              } else {
                if ((o.type == "circle" || (o.type == "ellipse" || Str(value).charAt() != "r")) && addGradientFill(o, value)) {
                  if ("opacity" in attrs || "fill-opacity" in attrs) {
                    var gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                    if (gradient) {
                      var stops = gradient.getElementsByTagName("stop");
                      $(stops[stops.length - 1], {"stop-opacity":("opacity" in attrs ? attrs.opacity : 1) * ("fill-opacity" in attrs ? attrs["fill-opacity"] : 1)});
                    }
                  }
                  attrs.gradient = value;
                  attrs.fill = "none";
                  break;
                }
              }
              clr[has]("opacity") && $(node, {"fill-opacity":clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
            case "stroke":
              clr = R.getRGB(value);
              node.setAttribute(att, clr.hex);
              att == "stroke" && (clr[has]("opacity") && $(node, {"stroke-opacity":clr.opacity > 1 ? clr.opacity / 100 : clr.opacity}));
              if (att == "stroke" && o._.arrows) {
                "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
              }
              break;
            case "gradient":
              (o.type == "circle" || (o.type == "ellipse" || Str(value).charAt() != "r")) && addGradientFill(o, value);
              break;
            case "opacity":
              if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                $(node, {"stroke-opacity":value > 1 ? value / 100 : value});
              }
            ;
            case "fill-opacity":
              if (attrs.gradient) {
                gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                if (gradient) {
                  stops = gradient.getElementsByTagName("stop");
                  $(stops[stops.length - 1], {"stop-opacity":value});
                }
                break;
              }
            ;
            default:
              att == "font-size" && (value = toInt(value, 10) + "px");
              var cssrule = att.replace(/(\-.)/g, function(w) {
                return w.substring(1).toUpperCase();
              });
              node.style[cssrule] = value;
              o._.dirty = 1;
              node.setAttribute(att, value);
              break;
          }
        }
      }
      tuneText(o, params);
      node.style.visibility = vis;
    }, leading = 1.2, tuneText = function(el, params) {
      if (el.type != "text" || !(params[has]("text") || (params[has]("font") || (params[has]("font-size") || (params[has]("x") || params[has]("y")))))) {
        return;
      }
      var a = el.attrs, node = el.node, fontSize = node.firstChild ? toInt(R._g.doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;
      if (params[has]("text")) {
        a.text = params.text;
        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }
        var texts = Str(params.text).split("\n"), tspans = [], tspan;
        for (var i = 0, ii = texts.length;i < ii;i++) {
          tspan = $("tspan");
          i && $(tspan, {dy:fontSize * leading, x:a.x});
          tspan.appendChild(R._g.doc.createTextNode(texts[i]));
          node.appendChild(tspan);
          tspans[i] = tspan;
        }
      } else {
        tspans = node.getElementsByTagName("tspan");
        for (i = 0, ii = tspans.length;i < ii;i++) {
          if (i) {
            $(tspans[i], {dy:fontSize * leading, x:a.x});
          } else {
            $(tspans[0], {dy:0});
          }
        }
      }
      $(node, {x:a.x, y:a.y});
      el._.dirty = 1;
      var bb = el._getBBox(), dif = a.y - (bb.y + bb.height / 2);
      dif && (R.is(dif, "finite") && $(tspans[0], {dy:dif}));
    }, Element = function(node, svg) {
      var X = 0, Y = 0;
      this[0] = this.node = node;
      node.raphael = true;
      this.id = R._oid++;
      node.raphaelid = this.id;
      this.matrix = R.matrix();
      this.realPath = null;
      this.paper = svg;
      this.attrs = this.attrs || {};
      this._ = {transform:[], sx:1, sy:1, deg:0, dx:0, dy:0, dirty:1};
      !svg.bottom && (svg.bottom = this);
      this.prev = svg.top;
      svg.top && (svg.top.next = this);
      svg.top = this;
      this.next = null;
    }, elproto = R.el;
    Element.prototype = elproto;
    elproto.constructor = Element;
    R._engine.path = function(pathString, SVG) {
      var el = $("path");
      SVG.canvas && SVG.canvas.appendChild(el);
      var p = new Element(el, SVG);
      p.type = "path";
      setFillAndStroke(p, {fill:"none", stroke:"#000", path:pathString});
      return p;
    };
    elproto.rotate = function(deg, cx, cy) {
      if (this.removed) {
        return this;
      }
      deg = Str(deg).split(separator);
      if (deg.length - 1) {
        cx = toFloat(deg[1]);
        cy = toFloat(deg[2]);
      }
      deg = toFloat(deg[0]);
      cy == null && (cx = cy);
      if (cx == null || cy == null) {
        var bbox = this.getBBox(1);
        cx = bbox.x + bbox.width / 2;
        cy = bbox.y + bbox.height / 2;
      }
      this.transform(this._.transform.concat([["r", deg, cx, cy]]));
      return this;
    };
    elproto.scale = function(sx, sy, cx, cy) {
      if (this.removed) {
        return this;
      }
      sx = Str(sx).split(separator);
      if (sx.length - 1) {
        sy = toFloat(sx[1]);
        cx = toFloat(sx[2]);
        cy = toFloat(sx[3]);
      }
      sx = toFloat(sx[0]);
      sy == null && (sy = sx);
      cy == null && (cx = cy);
      if (cx == null || cy == null) {
        var bbox = this.getBBox(1)
      }
      cx = cx == null ? bbox.x + bbox.width / 2 : cx;
      cy = cy == null ? bbox.y + bbox.height / 2 : cy;
      this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
      return this;
    };
    elproto.translate = function(dx, dy) {
      if (this.removed) {
        return this;
      }
      dx = Str(dx).split(separator);
      if (dx.length - 1) {
        dy = toFloat(dx[1]);
      }
      dx = toFloat(dx[0]) || 0;
      dy = +dy || 0;
      this.transform(this._.transform.concat([["t", dx, dy]]));
      return this;
    };
    elproto.transform = function(tstr) {
      var _ = this._;
      if (tstr == null) {
        return _.transform;
      }
      R._extractTransform(this, tstr);
      this.clip && $(this.clip, {transform:this.matrix.invert()});
      this.pattern && updatePosition(this);
      this.node && $(this.node, {transform:this.matrix});
      if (_.sx != 1 || _.sy != 1) {
        var sw = this.attrs[has]("stroke-width") ? this.attrs["stroke-width"] : 1;
        this.attr({"stroke-width":sw});
      }
      return this;
    };
    elproto.hide = function() {
      !this.removed && this.paper.safari(this.node.style.display = "none");
      return this;
    };
    elproto.show = function() {
      !this.removed && this.paper.safari(this.node.style.display = "");
      return this;
    };
    elproto.remove = function() {
      if (this.removed || !this.node.parentNode) {
        return;
      }
      var paper = this.paper;
      paper.__set__ && paper.__set__.exclude(this);
      eve.unbind("raphael.*.*." + this.id);
      if (this.gradient) {
        paper.defs.removeChild(this.gradient);
      }
      R._tear(this, paper);
      if (this.node.parentNode.tagName.toLowerCase() == "a") {
        this.node.parentNode.parentNode.removeChild(this.node.parentNode);
      } else {
        this.node.parentNode.removeChild(this.node);
      }
      for (var i in this) {
        this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
      }
      this.removed = true;
    };
    elproto._getBBox = function() {
      if (this.node.style.display == "none") {
        this.show();
        var hide = true;
      }
      var bbox = {};
      try {
        bbox = this.node.getBBox();
      } catch (e) {
      } finally {
        bbox = bbox || {};
      }
      hide && this.hide();
      return bbox;
    };
    elproto.attr = function(name, value) {
      if (this.removed) {
        return this;
      }
      if (name == null) {
        var res = {};
        for (var a in this.attrs) {
          if (this.attrs[has](a)) {
            res[a] = this.attrs[a];
          }
        }
        res.gradient && (res.fill == "none" && ((res.fill = res.gradient) && delete res.gradient));
        res.transform = this._.transform;
        return res;
      }
      if (value == null && R.is(name, "string")) {
        if (name == "fill" && (this.attrs.fill == "none" && this.attrs.gradient)) {
          return this.attrs.gradient;
        }
        if (name == "transform") {
          return this._.transform;
        }
        var names = name.split(separator), out = {};
        for (var i = 0, ii = names.length;i < ii;i++) {
          name = names[i];
          if (name in this.attrs) {
            out[name] = this.attrs[name];
          } else {
            if (R.is(this.paper.customAttributes[name], "function")) {
              out[name] = this.paper.customAttributes[name].def;
            } else {
              out[name] = R._availableAttrs[name];
            }
          }
        }
        return ii - 1 ? out : out[names[0]];
      }
      if (value == null && R.is(name, "array")) {
        out = {};
        for (i = 0, ii = name.length;i < ii;i++) {
          out[name[i]] = this.attr(name[i]);
        }
        return out;
      }
      if (value != null) {
        var params = {};
        params[name] = value;
      } else {
        if (name != null && R.is(name, "object")) {
          params = name;
        }
      }
      for (var key in params) {
        eve("raphael.attr." + key + "." + this.id, this, params[key]);
      }
      for (key in this.paper.customAttributes) {
        if (this.paper.customAttributes[has](key) && (params[has](key) && R.is(this.paper.customAttributes[key], "function"))) {
          var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
          this.attrs[key] = params[key];
          for (var subkey in par) {
            if (par[has](subkey)) {
              params[subkey] = par[subkey];
            }
          }
        }
      }
      setFillAndStroke(this, params);
      return this;
    };
    elproto.toFront = function() {
      if (this.removed) {
        return this;
      }
      if (this.node.parentNode.tagName.toLowerCase() == "a") {
        this.node.parentNode.parentNode.appendChild(this.node.parentNode);
      } else {
        this.node.parentNode.appendChild(this.node);
      }
      var svg = this.paper;
      svg.top != this && R._tofront(this, svg);
      return this;
    };
    elproto.toBack = function() {
      if (this.removed) {
        return this;
      }
      var parent = this.node.parentNode;
      if (parent.tagName.toLowerCase() == "a") {
        parent.parentNode.insertBefore(this.node.parentNode, this.node.parentNode.parentNode.firstChild);
      } else {
        if (parent.firstChild != this.node) {
          parent.insertBefore(this.node, this.node.parentNode.firstChild);
        }
      }
      R._toback(this, this.paper);
      var svg = this.paper;
      return this;
    };
    elproto.insertAfter = function(element) {
      if (this.removed) {
        return this;
      }
      var node = element.node || element[element.length - 1].node;
      if (node.nextSibling) {
        node.parentNode.insertBefore(this.node, node.nextSibling);
      } else {
        node.parentNode.appendChild(this.node);
      }
      R._insertafter(this, element, this.paper);
      return this;
    };
    elproto.insertBefore = function(element) {
      if (this.removed) {
        return this;
      }
      var node = element.node || element[0].node;
      node.parentNode.insertBefore(this.node, node);
      R._insertbefore(this, element, this.paper);
      return this;
    };
    elproto.blur = function(size) {
      var t = this;
      if (+size !== 0) {
        var fltr = $("filter"), blur = $("feGaussianBlur");
        t.attrs.blur = size;
        fltr.id = R.createUUID();
        $(blur, {stdDeviation:+size || 1.5});
        fltr.appendChild(blur);
        t.paper.defs.appendChild(fltr);
        t._blur = fltr;
        $(t.node, {filter:"url(#" + fltr.id + ")"});
      } else {
        if (t._blur) {
          t._blur.parentNode.removeChild(t._blur);
          delete t._blur;
          delete t.attrs.blur;
        }
        t.node.removeAttribute("filter");
      }
      return t;
    };
    R._engine.circle = function(svg, x, y, r) {
      var el = $("circle");
      svg.canvas && svg.canvas.appendChild(el);
      var res = new Element(el, svg);
      res.attrs = {cx:x, cy:y, r:r, fill:"none", stroke:"#000"};
      res.type = "circle";
      $(el, res.attrs);
      return res;
    };
    R._engine.rect = function(svg, x, y, w, h, r) {
      var el = $("rect");
      svg.canvas && svg.canvas.appendChild(el);
      var res = new Element(el, svg);
      res.attrs = {x:x, y:y, width:w, height:h, r:r || 0, rx:r || 0, ry:r || 0, fill:"none", stroke:"#000"};
      res.type = "rect";
      $(el, res.attrs);
      return res;
    };
    R._engine.ellipse = function(svg, x, y, rx, ry) {
      var el = $("ellipse");
      svg.canvas && svg.canvas.appendChild(el);
      var res = new Element(el, svg);
      res.attrs = {cx:x, cy:y, rx:rx, ry:ry, fill:"none", stroke:"#000"};
      res.type = "ellipse";
      $(el, res.attrs);
      return res;
    };
    R._engine.image = function(svg, src, x, y, w, h) {
      var el = $("image");
      $(el, {x:x, y:y, width:w, height:h, preserveAspectRatio:"none"});
      el.setAttributeNS(xlink, "href", src);
      svg.canvas && svg.canvas.appendChild(el);
      var res = new Element(el, svg);
      res.attrs = {x:x, y:y, width:w, height:h, src:src};
      res.type = "image";
      return res;
    };
    R._engine.text = function(svg, x, y, text) {
      var el = $("text");
      svg.canvas && svg.canvas.appendChild(el);
      var res = new Element(el, svg);
      res.attrs = {x:x, y:y, "text-anchor":"middle", text:text, font:R._availableAttrs.font, stroke:"none", fill:"#000"};
      res.type = "text";
      setFillAndStroke(res, res.attrs);
      return res;
    };
    R._engine.setSize = function(width, height) {
      this.width = width || this.width;
      this.height = height || this.height;
      this.canvas.setAttribute("width", this.width);
      this.canvas.setAttribute("height", this.height);
      if (this._viewBox) {
        this.setViewBox.apply(this, this._viewBox);
      }
      return this;
    };
    R._engine.create = function() {
      var con = R._getContainer.apply(0, arguments), container = con && con.container, x = con.x, y = con.y, width = con.width, height = con.height;
      if (!container) {
        throw new Error("SVG container not found.");
      }
      var cnvs = $("svg"), css = "overflow:hidden;", isFloating;
      x = x || 0;
      y = y || 0;
      width = width || 512;
      height = height || 342;
      $(cnvs, {height:height, version:1.1, width:width, xmlns:"http://www.w3.org/2000/svg"});
      if (container == 1) {
        cnvs.style.cssText = css + "position:absolute;left:" + x + "px;top:" + y + "px";
        R._g.doc.body.appendChild(cnvs);
        isFloating = 1;
      } else {
        cnvs.style.cssText = css + "position:relative";
        if (container.firstChild) {
          container.insertBefore(cnvs, container.firstChild);
        } else {
          container.appendChild(cnvs);
        }
      }
      container = new R._Paper;
      container.width = width;
      container.height = height;
      container.canvas = cnvs;
      container.clear();
      container._left = container._top = 0;
      isFloating && (container.renderfix = function() {
      });
      container.renderfix();
      return container;
    };
    R._engine.setViewBox = function(x, y, w, h, fit) {
      eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
      var size = mmax(w / this.width, h / this.height), top = this.top, aspectRatio = fit ? "meet" : "xMinYMin", vb, sw;
      if (x == null) {
        if (this._vbSize) {
          size = 1;
        }
        delete this._vbSize;
        vb = "0 0 " + this.width + S + this.height;
      } else {
        this._vbSize = size;
        vb = x + S + y + S + w + S + h;
      }
      $(this.canvas, {viewBox:vb, preserveAspectRatio:aspectRatio});
      while (size && top) {
        sw = "stroke-width" in top.attrs ? top.attrs["stroke-width"] : 1;
        top.attr({"stroke-width":sw});
        top._.dirty = 1;
        top._.dirtyT = 1;
        top = top.prev;
      }
      this._viewBox = [x, y, w, h, !!fit];
      return this;
    };
    R.prototype.renderfix = function() {
      var cnvs = this.canvas, s = cnvs.style, pos;
      try {
        pos = cnvs.getScreenCTM() || cnvs.createSVGMatrix();
      } catch (e) {
        pos = cnvs.createSVGMatrix();
      }
      var left = -pos.e % 1, top = -pos.f % 1;
      if (left || top) {
        if (left) {
          this._left = (this._left + left) % 1;
          s.left = this._left + "px";
        }
        if (top) {
          this._top = (this._top + top) % 1;
          s.top = this._top + "px";
        }
      }
    };
    R.prototype.clear = function() {
      R.eve("raphael.clear", this);
      var c = this.canvas;
      while (c.firstChild) {
        c.removeChild(c.firstChild);
      }
      this.bottom = this.top = null;
      (this.desc = $("desc")).appendChild(R._g.doc.createTextNode("Created with Rapha\u00ebl " + R.version));
      c.appendChild(this.desc);
      c.appendChild(this.defs = $("defs"));
    };
    R.prototype.remove = function() {
      eve("raphael.remove", this);
      this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
      for (var i in this) {
        this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
      }
    };
    var setproto = R.st;
    for (var method in elproto) {
      if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = function(methodname) {
          return function() {
            var arg = arguments;
            return this.forEach(function(el) {
              el[methodname].apply(el, arg);
            });
          };
        }(method);
      }
    }
  })();
  (function() {
    if (!R.vml) {
      return;
    }
    var has = "hasOwnProperty", Str = String, toFloat = parseFloat, math = Math, round = math.round, mmax = math.max, mmin = math.min, abs = math.abs, fillString = "fill", separator = /[, ]+/, eve = R.eve, ms = " progid:DXImageTransform.Microsoft", S = " ", E = "", map = {M:"m", L:"l", C:"c", Z:"x", m:"t", l:"r", c:"v", z:"x"}, bites = /([clmz]),?([^clmz]*)/gi, blurregexp = / progid:\S+Blur\([^\)]+\)/g, val = /-?[^,\s-]+/g, cssDot = "position:absolute;left:0;top:0;width:1px;height:1px", zoom = 21600, 
    pathTypes = {path:1, rect:1, image:1}, ovalTypes = {circle:1, ellipse:1}, path2vml = function(path) {
      var total = /[ahqstv]/ig, command = R._pathToAbsolute;
      Str(path).match(total) && (command = R._path2curve);
      total = /[clmz]/g;
      if (command == R._pathToAbsolute && !Str(path).match(total)) {
        var res = Str(path).replace(bites, function(all, command, args) {
          var vals = [], isMove = command.toLowerCase() == "m", res = map[command];
          args.replace(val, function(value) {
            if (isMove && vals.length == 2) {
              res += vals + map[command == "m" ? "l" : "L"];
              vals = [];
            }
            vals.push(round(value * zoom));
          });
          return res + vals;
        });
        return res;
      }
      var pa = command(path), p, r;
      res = [];
      for (var i = 0, ii = pa.length;i < ii;i++) {
        p = pa[i];
        r = pa[i][0].toLowerCase();
        r == "z" && (r = "x");
        for (var j = 1, jj = p.length;j < jj;j++) {
          r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
        }
        res.push(r);
      }
      return res.join(S);
    }, compensation = function(deg, dx, dy) {
      var m = R.matrix();
      m.rotate(-deg, 0.5, 0.5);
      return{dx:m.x(dx, dy), dy:m.y(dx, dy)};
    }, setCoords = function(p, sx, sy, dx, dy, deg) {
      var _ = p._, m = p.matrix, fillpos = _.fillpos, o = p.node, s = o.style, y = 1, flip = "", dxdy, kx = zoom / sx, ky = zoom / sy;
      s.visibility = "hidden";
      if (!sx || !sy) {
        return;
      }
      o.coordsize = abs(kx) + S + abs(ky);
      s.rotation = deg * (sx * sy < 0 ? -1 : 1);
      if (deg) {
        var c = compensation(deg, dx, dy);
        dx = c.dx;
        dy = c.dy;
      }
      sx < 0 && (flip += "x");
      sy < 0 && ((flip += " y") && (y = -1));
      s.flip = flip;
      o.coordorigin = dx * -kx + S + dy * -ky;
      if (fillpos || _.fillsize) {
        var fill = o.getElementsByTagName(fillString);
        fill = fill && fill[0];
        o.removeChild(fill);
        if (fillpos) {
          c = compensation(deg, m.x(fillpos[0], fillpos[1]), m.y(fillpos[0], fillpos[1]));
          fill.position = c.dx * y + S + c.dy * y;
        }
        if (_.fillsize) {
          fill.size = _.fillsize[0] * abs(sx) + S + _.fillsize[1] * abs(sy);
        }
        o.appendChild(fill);
      }
      s.visibility = "visible";
    };
    R.toString = function() {
      return "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\u00ebl " + this.version;
    };
    var addArrow = function(o, value, isEnd) {
      var values = Str(value).toLowerCase().split("-"), se = isEnd ? "end" : "start", i = values.length, type = "classic", w = "medium", h = "medium";
      while (i--) {
        switch(values[i]) {
          case "block":
          ;
          case "classic":
          ;
          case "oval":
          ;
          case "diamond":
          ;
          case "open":
          ;
          case "none":
            type = values[i];
            break;
          case "wide":
          ;
          case "narrow":
            h = values[i];
            break;
          case "long":
          ;
          case "short":
            w = values[i];
            break;
        }
      }
      var stroke = o.node.getElementsByTagName("stroke")[0];
      stroke[se + "arrow"] = type;
      stroke[se + "arrowlength"] = w;
      stroke[se + "arrowwidth"] = h;
    }, setFillAndStroke = function(o, params) {
      o.attrs = o.attrs || {};
      var node = o.node, a = o.attrs, s = node.style, xy, newpath = pathTypes[o.type] && (params.x != a.x || (params.y != a.y || (params.width != a.width || (params.height != a.height || (params.cx != a.cx || (params.cy != a.cy || (params.rx != a.rx || (params.ry != a.ry || params.r != a.r)))))))), isOval = ovalTypes[o.type] && (a.cx != params.cx || (a.cy != params.cy || (a.r != params.r || (a.rx != params.rx || a.ry != params.ry)))), res = o;
      for (var par in params) {
        if (params[has](par)) {
          a[par] = params[par];
        }
      }
      if (newpath) {
        a.path = R._getPath[o.type](o);
        o._.dirty = 1;
      }
      params.href && (node.href = params.href);
      params.title && (node.title = params.title);
      params.target && (node.target = params.target);
      params.cursor && (s.cursor = params.cursor);
      "blur" in params && o.blur(params.blur);
      if (params.path && o.type == "path" || newpath) {
        node.path = path2vml(~Str(a.path).toLowerCase().indexOf("r") ? R._pathToAbsolute(a.path) : a.path);
        if (o.type == "image") {
          o._.fillpos = [a.x, a.y];
          o._.fillsize = [a.width, a.height];
          setCoords(o, 1, 1, 0, 0, 0);
        }
      }
      "transform" in params && o.transform(params.transform);
      if (isOval) {
        var cx = +a.cx, cy = +a.cy, rx = +a.rx || (+a.r || 0), ry = +a.ry || (+a.r || 0);
        node.path = R.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x", round((cx - rx) * zoom), round((cy - ry) * zoom), round((cx + rx) * zoom), round((cy + ry) * zoom), round(cx * zoom));
        o._.dirty = 1;
      }
      if ("clip-rect" in params) {
        var rect = Str(params["clip-rect"]).split(separator);
        if (rect.length == 4) {
          rect[2] = +rect[2] + +rect[0];
          rect[3] = +rect[3] + +rect[1];
          var div = node.clipRect || R._g.doc.createElement("div"), dstyle = div.style;
          dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
          if (!node.clipRect) {
            dstyle.position = "absolute";
            dstyle.top = 0;
            dstyle.left = 0;
            dstyle.width = o.paper.width + "px";
            dstyle.height = o.paper.height + "px";
            node.parentNode.insertBefore(div, node);
            div.appendChild(node);
            node.clipRect = div;
          }
        }
        if (!params["clip-rect"]) {
          node.clipRect && (node.clipRect.style.clip = "auto");
        }
      }
      if (o.textpath) {
        var textpathStyle = o.textpath.style;
        params.font && (textpathStyle.font = params.font);
        params["font-family"] && (textpathStyle.fontFamily = '"' + params["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g, E) + '"');
        params["font-size"] && (textpathStyle.fontSize = params["font-size"]);
        params["font-weight"] && (textpathStyle.fontWeight = params["font-weight"]);
        params["font-style"] && (textpathStyle.fontStyle = params["font-style"]);
      }
      if ("arrow-start" in params) {
        addArrow(res, params["arrow-start"]);
      }
      if ("arrow-end" in params) {
        addArrow(res, params["arrow-end"], 1);
      }
      if (params.opacity != null || (params["stroke-width"] != null || (params.fill != null || (params.src != null || (params.stroke != null || (params["stroke-width"] != null || (params["stroke-opacity"] != null || (params["fill-opacity"] != null || (params["stroke-dasharray"] != null || (params["stroke-miterlimit"] != null || (params["stroke-linejoin"] != null || params["stroke-linecap"] != null))))))))))) {
        var fill = node.getElementsByTagName(fillString), newfill = false;
        fill = fill && fill[0];
        !fill && (newfill = fill = createNode(fillString));
        if (o.type == "image" && params.src) {
          fill.src = params.src;
        }
        params.fill && (fill.on = true);
        if (fill.on == null || (params.fill == "none" || params.fill === null)) {
          fill.on = false;
        }
        if (fill.on && params.fill) {
          var isURL = Str(params.fill).match(R._ISURL);
          if (isURL) {
            fill.parentNode == node && node.removeChild(fill);
            fill.rotate = true;
            fill.src = isURL[1];
            fill.type = "tile";
            var bbox = o.getBBox(1);
            fill.position = bbox.x + S + bbox.y;
            o._.fillpos = [bbox.x, bbox.y];
            R._preload(isURL[1], function() {
              o._.fillsize = [this.offsetWidth, this.offsetHeight];
            });
          } else {
            fill.color = R.getRGB(params.fill).hex;
            fill.src = E;
            fill.type = "solid";
            if (R.getRGB(params.fill).error && ((res.type in {circle:1, ellipse:1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill, fill))) {
              a.fill = "none";
              a.gradient = params.fill;
              fill.rotate = false;
            }
          }
        }
        if ("fill-opacity" in params || "opacity" in params) {
          var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
          opacity = mmin(mmax(opacity, 0), 1);
          fill.opacity = opacity;
          if (fill.src) {
            fill.color = "none";
          }
        }
        node.appendChild(fill);
        var stroke = node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0], newstroke = false;
        !stroke && (newstroke = stroke = createNode("stroke"));
        if (params.stroke && params.stroke != "none" || (params["stroke-width"] || (params["stroke-opacity"] != null || (params["stroke-dasharray"] || (params["stroke-miterlimit"] || (params["stroke-linejoin"] || params["stroke-linecap"])))))) {
          stroke.on = true;
        }
        (params.stroke == "none" || (params.stroke === null || (stroke.on == null || (params.stroke == 0 || params["stroke-width"] == 0)))) && (stroke.on = false);
        var strokeColor = R.getRGB(params.stroke);
        stroke.on && (params.stroke && (stroke.color = strokeColor.hex));
        opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
        var width = (toFloat(params["stroke-width"]) || 1) * 0.75;
        opacity = mmin(mmax(opacity, 0), 1);
        params["stroke-width"] == null && (width = a["stroke-width"]);
        params["stroke-width"] && (stroke.weight = width);
        width && (width < 1 && ((opacity *= width) && (stroke.weight = 1)));
        stroke.opacity = opacity;
        params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
        stroke.miterlimit = params["stroke-miterlimit"] || 8;
        params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
        if ("stroke-dasharray" in params) {
          var dasharray = {"-":"shortdash", ".":"shortdot", "-.":"shortdashdot", "-..":"shortdashdotdot", ". ":"dot", "- ":"dash", "--":"longdash", "- .":"dashdot", "--.":"longdashdot", "--..":"longdashdotdot"};
          stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
        }
        newstroke && node.appendChild(stroke);
      }
      if (res.type == "text") {
        res.paper.canvas.style.display = E;
        var span = res.paper.span, m = 100, fontSize = a.font && a.font.match(/\d+(?:\.\d*)?(?=px)/);
        s = span.style;
        a.font && (s.font = a.font);
        a["font-family"] && (s.fontFamily = a["font-family"]);
        a["font-weight"] && (s.fontWeight = a["font-weight"]);
        a["font-style"] && (s.fontStyle = a["font-style"]);
        fontSize = toFloat(a["font-size"] || fontSize && fontSize[0]) || 10;
        s.fontSize = fontSize * m + "px";
        res.textpath.string && (span.innerHTML = Str(res.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>"));
        var brect = span.getBoundingClientRect();
        res.W = a.w = (brect.right - brect.left) / m;
        res.H = a.h = (brect.bottom - brect.top) / m;
        res.X = a.x;
        res.Y = a.y + res.H / 2;
        ("x" in params || "y" in params) && (res.path.v = R.format("m{0},{1}l{2},{1}", round(a.x * zoom), round(a.y * zoom), round(a.x * zoom) + 1));
        var dirtyattrs = ["x", "y", "text", "font", "font-family", "font-weight", "font-style", "font-size"];
        for (var d = 0, dd = dirtyattrs.length;d < dd;d++) {
          if (dirtyattrs[d] in params) {
            res._.dirty = 1;
            break;
          }
        }
        switch(a["text-anchor"]) {
          case "start":
            res.textpath.style["v-text-align"] = "left";
            res.bbx = res.W / 2;
            break;
          case "end":
            res.textpath.style["v-text-align"] = "right";
            res.bbx = -res.W / 2;
            break;
          default:
            res.textpath.style["v-text-align"] = "center";
            res.bbx = 0;
            break;
        }
        res.textpath.style["v-text-kern"] = true;
      }
    }, addGradientFill = function(o, gradient, fill) {
      o.attrs = o.attrs || {};
      var attrs = o.attrs, pow = Math.pow, opacity, oindex, type = "linear", fxfy = ".5 .5";
      o.attrs.gradient = gradient;
      gradient = Str(gradient).replace(R._radial_gradient, function(all, fx, fy) {
        type = "radial";
        if (fx && fy) {
          fx = toFloat(fx);
          fy = toFloat(fy);
          pow(fx - 0.5, 2) + pow(fy - 0.5, 2) > 0.25 && (fy = math.sqrt(0.25 - pow(fx - 0.5, 2)) * ((fy > 0.5) * 2 - 1) + 0.5);
          fxfy = fx + S + fy;
        }
        return E;
      });
      gradient = gradient.split(/\s*\-\s*/);
      if (type == "linear") {
        var angle = gradient.shift();
        angle = -toFloat(angle);
        if (isNaN(angle)) {
          return null;
        }
      }
      var dots = R._parseDots(gradient);
      if (!dots) {
        return null;
      }
      o = o.shape || o.node;
      if (dots.length) {
        o.removeChild(fill);
        fill.on = true;
        fill.method = "none";
        fill.color = dots[0].color;
        fill.color2 = dots[dots.length - 1].color;
        var clrs = [];
        for (var i = 0, ii = dots.length;i < ii;i++) {
          dots[i].offset && clrs.push(dots[i].offset + S + dots[i].color);
        }
        fill.colors = clrs.length ? clrs.join() : "0% " + fill.color;
        if (type == "radial") {
          fill.type = "gradientTitle";
          fill.focus = "100%";
          fill.focussize = "0 0";
          fill.focusposition = fxfy;
          fill.angle = 0;
        } else {
          fill.type = "gradient";
          fill.angle = (270 - angle) % 360;
        }
        o.appendChild(fill);
      }
      return 1;
    }, Element = function(node, vml) {
      this[0] = this.node = node;
      node.raphael = true;
      this.id = R._oid++;
      node.raphaelid = this.id;
      this.X = 0;
      this.Y = 0;
      this.attrs = {};
      this.paper = vml;
      this.matrix = R.matrix();
      this._ = {transform:[], sx:1, sy:1, dx:0, dy:0, deg:0, dirty:1, dirtyT:1};
      !vml.bottom && (vml.bottom = this);
      this.prev = vml.top;
      vml.top && (vml.top.next = this);
      vml.top = this;
      this.next = null;
    };
    var elproto = R.el;
    Element.prototype = elproto;
    elproto.constructor = Element;
    elproto.transform = function(tstr) {
      if (tstr == null) {
        return this._.transform;
      }
      var vbs = this.paper._viewBoxShift, vbt = vbs ? "s" + [vbs.scale, vbs.scale] + "-1-1t" + [vbs.dx, vbs.dy] : E, oldt;
      if (vbs) {
        oldt = tstr = Str(tstr).replace(/\.{3}|\u2026/g, this._.transform || E);
      }
      R._extractTransform(this, vbt + tstr);
      var matrix = this.matrix.clone(), skew = this.skew, o = this.node, split, isGrad = ~Str(this.attrs.fill).indexOf("-"), isPatt = !Str(this.attrs.fill).indexOf("url(");
      matrix.translate(1, 1);
      if (isPatt || (isGrad || this.type == "image")) {
        skew.matrix = "1 0 0 1";
        skew.offset = "0 0";
        split = matrix.split();
        if (isGrad && split.noRotation || !split.isSimple) {
          o.style.filter = matrix.toFilter();
          var bb = this.getBBox(), bbt = this.getBBox(1), dx = bb.x - bbt.x, dy = bb.y - bbt.y;
          o.coordorigin = dx * -zoom + S + dy * -zoom;
          setCoords(this, 1, 1, dx, dy, 0);
        } else {
          o.style.filter = E;
          setCoords(this, split.scalex, split.scaley, split.dx, split.dy, split.rotate);
        }
      } else {
        o.style.filter = E;
        skew.matrix = Str(matrix);
        skew.offset = matrix.offset();
      }
      oldt && (this._.transform = oldt);
      return this;
    };
    elproto.rotate = function(deg, cx, cy) {
      if (this.removed) {
        return this;
      }
      if (deg == null) {
        return;
      }
      deg = Str(deg).split(separator);
      if (deg.length - 1) {
        cx = toFloat(deg[1]);
        cy = toFloat(deg[2]);
      }
      deg = toFloat(deg[0]);
      cy == null && (cx = cy);
      if (cx == null || cy == null) {
        var bbox = this.getBBox(1);
        cx = bbox.x + bbox.width / 2;
        cy = bbox.y + bbox.height / 2;
      }
      this._.dirtyT = 1;
      this.transform(this._.transform.concat([["r", deg, cx, cy]]));
      return this;
    };
    elproto.translate = function(dx, dy) {
      if (this.removed) {
        return this;
      }
      dx = Str(dx).split(separator);
      if (dx.length - 1) {
        dy = toFloat(dx[1]);
      }
      dx = toFloat(dx[0]) || 0;
      dy = +dy || 0;
      if (this._.bbox) {
        this._.bbox.x += dx;
        this._.bbox.y += dy;
      }
      this.transform(this._.transform.concat([["t", dx, dy]]));
      return this;
    };
    elproto.scale = function(sx, sy, cx, cy) {
      if (this.removed) {
        return this;
      }
      sx = Str(sx).split(separator);
      if (sx.length - 1) {
        sy = toFloat(sx[1]);
        cx = toFloat(sx[2]);
        cy = toFloat(sx[3]);
        isNaN(cx) && (cx = null);
        isNaN(cy) && (cy = null);
      }
      sx = toFloat(sx[0]);
      sy == null && (sy = sx);
      cy == null && (cx = cy);
      if (cx == null || cy == null) {
        var bbox = this.getBBox(1)
      }
      cx = cx == null ? bbox.x + bbox.width / 2 : cx;
      cy = cy == null ? bbox.y + bbox.height / 2 : cy;
      this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
      this._.dirtyT = 1;
      return this;
    };
    elproto.hide = function() {
      !this.removed && (this.node.style.display = "none");
      return this;
    };
    elproto.show = function() {
      !this.removed && (this.node.style.display = E);
      return this;
    };
    elproto._getBBox = function() {
      if (this.removed) {
        return{};
      }
      return{x:this.X + (this.bbx || 0) - this.W / 2, y:this.Y - this.H, width:this.W, height:this.H};
    };
    elproto.remove = function() {
      if (this.removed || !this.node.parentNode) {
        return;
      }
      this.paper.__set__ && this.paper.__set__.exclude(this);
      R.eve.unbind("raphael.*.*." + this.id);
      R._tear(this, this.paper);
      this.node.parentNode.removeChild(this.node);
      this.shape && this.shape.parentNode.removeChild(this.shape);
      for (var i in this) {
        this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
      }
      this.removed = true;
    };
    elproto.attr = function(name, value) {
      if (this.removed) {
        return this;
      }
      if (name == null) {
        var res = {};
        for (var a in this.attrs) {
          if (this.attrs[has](a)) {
            res[a] = this.attrs[a];
          }
        }
        res.gradient && (res.fill == "none" && ((res.fill = res.gradient) && delete res.gradient));
        res.transform = this._.transform;
        return res;
      }
      if (value == null && R.is(name, "string")) {
        if (name == fillString && (this.attrs.fill == "none" && this.attrs.gradient)) {
          return this.attrs.gradient;
        }
        var names = name.split(separator), out = {};
        for (var i = 0, ii = names.length;i < ii;i++) {
          name = names[i];
          if (name in this.attrs) {
            out[name] = this.attrs[name];
          } else {
            if (R.is(this.paper.customAttributes[name], "function")) {
              out[name] = this.paper.customAttributes[name].def;
            } else {
              out[name] = R._availableAttrs[name];
            }
          }
        }
        return ii - 1 ? out : out[names[0]];
      }
      if (this.attrs && (value == null && R.is(name, "array"))) {
        out = {};
        for (i = 0, ii = name.length;i < ii;i++) {
          out[name[i]] = this.attr(name[i]);
        }
        return out;
      }
      var params;
      if (value != null) {
        params = {};
        params[name] = value;
      }
      value == null && (R.is(name, "object") && (params = name));
      for (var key in params) {
        eve("raphael.attr." + key + "." + this.id, this, params[key]);
      }
      if (params) {
        for (key in this.paper.customAttributes) {
          if (this.paper.customAttributes[has](key) && (params[has](key) && R.is(this.paper.customAttributes[key], "function"))) {
            var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
            this.attrs[key] = params[key];
            for (var subkey in par) {
              if (par[has](subkey)) {
                params[subkey] = par[subkey];
              }
            }
          }
        }
        if (params.text && this.type == "text") {
          this.textpath.string = params.text;
        }
        setFillAndStroke(this, params);
      }
      return this;
    };
    elproto.toFront = function() {
      !this.removed && this.node.parentNode.appendChild(this.node);
      this.paper && (this.paper.top != this && R._tofront(this, this.paper));
      return this;
    };
    elproto.toBack = function() {
      if (this.removed) {
        return this;
      }
      if (this.node.parentNode.firstChild != this.node) {
        this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
        R._toback(this, this.paper);
      }
      return this;
    };
    elproto.insertAfter = function(element) {
      if (this.removed) {
        return this;
      }
      if (element.constructor == R.st.constructor) {
        element = element[element.length - 1];
      }
      if (element.node.nextSibling) {
        element.node.parentNode.insertBefore(this.node, element.node.nextSibling);
      } else {
        element.node.parentNode.appendChild(this.node);
      }
      R._insertafter(this, element, this.paper);
      return this;
    };
    elproto.insertBefore = function(element) {
      if (this.removed) {
        return this;
      }
      if (element.constructor == R.st.constructor) {
        element = element[0];
      }
      element.node.parentNode.insertBefore(this.node, element.node);
      R._insertbefore(this, element, this.paper);
      return this;
    };
    elproto.blur = function(size) {
      var s = this.node.runtimeStyle, f = s.filter;
      f = f.replace(blurregexp, E);
      if (+size !== 0) {
        this.attrs.blur = size;
        s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
        s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
      } else {
        s.filter = f;
        s.margin = 0;
        delete this.attrs.blur;
      }
      return this;
    };
    R._engine.path = function(pathString, vml) {
      var el = createNode("shape");
      el.style.cssText = cssDot;
      el.coordsize = zoom + S + zoom;
      el.coordorigin = vml.coordorigin;
      var p = new Element(el, vml), attr = {fill:"none", stroke:"#000"};
      pathString && (attr.path = pathString);
      p.type = "path";
      p.path = [];
      p.Path = E;
      setFillAndStroke(p, attr);
      vml.canvas.appendChild(el);
      var skew = createNode("skew");
      skew.on = true;
      el.appendChild(skew);
      p.skew = skew;
      p.transform(E);
      return p;
    };
    R._engine.rect = function(vml, x, y, w, h, r) {
      var path = R._rectPath(x, y, w, h, r), res = vml.path(path), a = res.attrs;
      res.X = a.x = x;
      res.Y = a.y = y;
      res.W = a.width = w;
      res.H = a.height = h;
      a.r = r;
      a.path = path;
      res.type = "rect";
      return res;
    };
    R._engine.ellipse = function(vml, x, y, rx, ry) {
      var res = vml.path(), a = res.attrs;
      res.X = x - rx;
      res.Y = y - ry;
      res.W = rx * 2;
      res.H = ry * 2;
      res.type = "ellipse";
      setFillAndStroke(res, {cx:x, cy:y, rx:rx, ry:ry});
      return res;
    };
    R._engine.circle = function(vml, x, y, r) {
      var res = vml.path(), a = res.attrs;
      res.X = x - r;
      res.Y = y - r;
      res.W = res.H = r * 2;
      res.type = "circle";
      setFillAndStroke(res, {cx:x, cy:y, r:r});
      return res;
    };
    R._engine.image = function(vml, src, x, y, w, h) {
      var path = R._rectPath(x, y, w, h), res = vml.path(path).attr({stroke:"none"}), a = res.attrs, node = res.node, fill = node.getElementsByTagName(fillString)[0];
      a.src = src;
      res.X = a.x = x;
      res.Y = a.y = y;
      res.W = a.width = w;
      res.H = a.height = h;
      a.path = path;
      res.type = "image";
      fill.parentNode == node && node.removeChild(fill);
      fill.rotate = true;
      fill.src = src;
      fill.type = "tile";
      res._.fillpos = [x, y];
      res._.fillsize = [w, h];
      node.appendChild(fill);
      setCoords(res, 1, 1, 0, 0, 0);
      return res;
    };
    R._engine.text = function(vml, x, y, text) {
      var el = createNode("shape"), path = createNode("path"), o = createNode("textpath");
      x = x || 0;
      y = y || 0;
      text = text || "";
      path.v = R.format("m{0},{1}l{2},{1}", round(x * zoom), round(y * zoom), round(x * zoom) + 1);
      path.textpathok = true;
      o.string = Str(text);
      o.on = true;
      el.style.cssText = cssDot;
      el.coordsize = zoom + S + zoom;
      el.coordorigin = "0 0";
      var p = new Element(el, vml), attr = {fill:"#000", stroke:"none", font:R._availableAttrs.font, text:text};
      p.shape = el;
      p.path = path;
      p.textpath = o;
      p.type = "text";
      p.attrs.text = Str(text);
      p.attrs.x = x;
      p.attrs.y = y;
      p.attrs.w = 1;
      p.attrs.h = 1;
      setFillAndStroke(p, attr);
      el.appendChild(o);
      el.appendChild(path);
      vml.canvas.appendChild(el);
      var skew = createNode("skew");
      skew.on = true;
      el.appendChild(skew);
      p.skew = skew;
      p.transform(E);
      return p;
    };
    R._engine.setSize = function(width, height) {
      var cs = this.canvas.style;
      this.width = width;
      this.height = height;
      width == +width && (width += "px");
      height == +height && (height += "px");
      cs.width = width;
      cs.height = height;
      cs.clip = "rect(0 " + width + " " + height + " 0)";
      if (this._viewBox) {
        R._engine.setViewBox.apply(this, this._viewBox);
      }
      return this;
    };
    R._engine.setViewBox = function(x, y, w, h, fit) {
      R.eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
      var width = this.width, height = this.height, size = 1 / mmax(w / width, h / height), H, W;
      if (fit) {
        H = height / h;
        W = width / w;
        if (w * H < width) {
          x -= (width - w * H) / 2 / H;
        }
        if (h * W < height) {
          y -= (height - h * W) / 2 / W;
        }
      }
      this._viewBox = [x, y, w, h, !!fit];
      this._viewBoxShift = {dx:-x, dy:-y, scale:size};
      this.forEach(function(el) {
        el.transform("...");
      });
      return this;
    };
    var createNode;
    R._engine.initWin = function(win) {
      var doc = win.document;
      doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
      try {
        !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
        createNode = function(tagName) {
          return doc.createElement("<rvml:" + tagName + ' class="rvml">');
        };
      } catch (e) {
        createNode = function(tagName) {
          return doc.createElement("<" + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
        };
      }
    };
    R._engine.initWin(R._g.win);
    R._engine.create = function() {
      var con = R._getContainer.apply(0, arguments), container = con.container, height = con.height, s, width = con.width, x = con.x, y = con.y;
      if (!container) {
        throw new Error("VML container not found.");
      }
      var res = new R._Paper, c = res.canvas = R._g.doc.createElement("div"), cs = c.style;
      x = x || 0;
      y = y || 0;
      width = width || 512;
      height = height || 342;
      res.width = width;
      res.height = height;
      width == +width && (width += "px");
      height == +height && (height += "px");
      res.coordsize = zoom * 1E3 + S + zoom * 1E3;
      res.coordorigin = "0 0";
      res.span = R._g.doc.createElement("span");
      res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;";
      c.appendChild(res.span);
      cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
      if (container == 1) {
        R._g.doc.body.appendChild(c);
        cs.left = x + "px";
        cs.top = y + "px";
        cs.position = "absolute";
      } else {
        if (container.firstChild) {
          container.insertBefore(c, container.firstChild);
        } else {
          container.appendChild(c);
        }
      }
      res.renderfix = function() {
      };
      return res;
    };
    R.prototype.clear = function() {
      R.eve("raphael.clear", this);
      this.canvas.innerHTML = E;
      this.span = R._g.doc.createElement("span");
      this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
      this.canvas.appendChild(this.span);
      this.bottom = this.top = null;
    };
    R.prototype.remove = function() {
      R.eve("raphael.remove", this);
      this.canvas.parentNode.removeChild(this.canvas);
      for (var i in this) {
        this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
      }
      return true;
    };
    var setproto = R.st;
    for (var method in elproto) {
      if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = function(methodname) {
          return function() {
            var arg = arguments;
            return this.forEach(function(el) {
              el[methodname].apply(el, arg);
            });
          };
        }(method);
      }
    }
  })();
  oldRaphael.was ? g.win.Raphael = R : Raphael = R;
  return R;
});
var QBWebCanvasLink = function(param) {
  this.color = null;
  this.thin = null;
  this.bg = null;
  this.line = null;
  this.startType = null;
  this.start = null;
  this.endType = null;
  this.end = null;
  this.object = null;
  this.graphics = null;
  this._init = function(param) {
  };
  this._init(param);
};
function getBBox(obj) {
  var box = {x:0, y:0, width:0, height:0};
  if (!obj.length) {
    return box;
  }
  var o = obj[0];
  function getBoxToParent(element, parentId) {
    box = {x:0, y:0, width:element.clientWidth, height:element.clientHeight};
    while (element) {
      if (element.id == parentId) {
        break;
      }
      box.x += element.offsetLeft - element.scrollLeft + element.clientLeft;
      box.y += element.offsetTop - element.scrollTop + element.clientTop;
      element = element.offsetParent;
    }
    return box;
  }
  if (o.tagName == "TR") {
    box = getBoxToParent(o, "qb-ui-canvas");
  } else {
    if (o.tagName == "TABLE") {
      box = getBoxToParent(o, "qb-ui-canvas");
    } else {
      if (o.tagName == "DIV") {
        box = getBoxToParent(o, "qb-ui-canvas");
      }
    }
  }
  return box;
}
function round1000(x) {
  return Math.round(x * 1E3) / 1E3;
}
function getLineCoord(bb1, bb2) {
  var minLeg = 15;
  var p1 = [{x:bb1.x, y:bb1.y + bb1.height / 2}, {x:bb1.x + bb1.width, y:bb1.y + bb1.height / 2}];
  var p2 = [{x:bb2.x, y:bb2.y + bb2.height / 2}, {x:bb2.x + bb2.width, y:bb2.y + bb2.height / 2}];
  var d = [], dis = [];
  for (var i1 = 0;i1 < p1.length;i1++) {
    for (var i2 = 0;i2 < p2.length;i2++) {
      var dx = Math.abs(p1[i1].x - p2[i2].x);
      var dy = Math.abs(p1[i1].y - p2[i2].y);
      var len = dx * dx + dy * dy;
      dis.push(len);
      d.push({i1:i1, i2:i2});
    }
  }
  var res = {i1:0, i2:0};
  var idx = -1;
  var min = -1;
  for (var i = 0;i < dis.length;i++) {
    if (min == -1 || dis[i] < min) {
      min = dis[i];
      idx = i;
    }
  }
  if (idx > 0) {
    res = d[idx];
  }
  var x1 = p1[res.i1].x, y1 = p1[res.i1].y, x4 = p2[res.i2].x, y4 = p2[res.i2].y, y2 = y1, y3 = y4;
  var dx = Math.max(Math.abs(x1 - x4) / 2, minLeg);
  var x2 = [x1 - dx, x1 + dx][res.i1];
  var x3 = [x4 - dx, x4 + dx][res.i2];
  return{x1:round1000(x1), y1:round1000(y1), x2:round1000(x2), y2:round1000(y2), x3:round1000(x3), y3:round1000(y3), x4:round1000(x4), y4:round1000(y4)};
}
function fixOutsideBounds(box, parentBox) {
  var R = Raphael == null ? defaults : Raphael;
  var first = box;
  if (R.is(box, "function")) {
    return parentBox ? first() : eve.on("raphael.DOMload", first);
  } else {
    if (R.is(first, true)) {
      return R._engine.create[box](R, first.splice(0, 3 + R.is(first[0], null))).add(first);
    } else {
      var args = Array.prototype.slice.call(arguments, 0);
      if (R.is(args[args.length - 1], "function")) {
        var f = args.pop();
        return first ? f.call(R._engine.create[box](R, args)) : eve.on("raphael.DOMload", function() {
          f.call(R._engine.create[box](R, args));
        });
      } else {
        return R._engine.create[box](R, arguments);
      }
    }
  }
}
Raphael.fn.UpdateConnection = function(link) {
  if (!link.Left || !link.Right) {
    return false;
  }
  if (!link.Left.field || !link.Right.field) {
    return false;
  }
  if (!link.Left.field.element || !link.Right.field.element) {
    return false;
  }
  var graph = link.graphics;
  var shortLeg = 8;
  var color = graph.color;
  var fromType = link.Left.Type;
  var toType = link.Right.Type;
  function calculateBox(link) {
    var linkBox = getBBox(link.field.element);
    if (link.table) {
      var tableBox = getBBox(link.table.element);
      linkBox.x = tableBox.x - 1;
      linkBox.width = tableBox.width + 2;
      if (linkBox.y < tableBox.y) {
        linkBox.y = tableBox.y;
      } else {
        if (linkBox.y > tableBox.y + tableBox.height - linkBox.height) {
          linkBox.y = tableBox.y + tableBox.height - linkBox.height;
        }
      }
    }
    return linkBox;
  }
  var leftBox = calculateBox(link.Left);
  var rightBox = calculateBox(link.Right);
  var lineCoord = getLineCoord(leftBox, rightBox);
  var startD = lineCoord.x1 < lineCoord.x2 ? 1 : -1;
  var endD = lineCoord.x4 < lineCoord.x3 ? 1 : -1;
  var path = ["M", lineCoord.x1, lineCoord.y1, "L", lineCoord.x1 + shortLeg * startD, lineCoord.y1, "C", lineCoord.x2, lineCoord.y2, lineCoord.x3, lineCoord.y3, lineCoord.x4 + shortLeg * endD, lineCoord.y4, "L", lineCoord.x4, lineCoord.y4].join(",");
  graph.start = configEnds(graph.start, toType, color, lineCoord.x1, lineCoord.y1, startD);
  graph.end = configEnds(graph.end, fromType, color, lineCoord.x4, lineCoord.y4, endD);
  if (graph.path = path && (graph.line && graph.bg)) {
    graph.bg.attr({path:path});
    graph.line.attr({path:path});
    $(graph.bg.node).addClass("link-context");
  }
  return true;
};
Raphael.fn.UpdateConnection;
Raphael.fn.CreateConnection = function(obj, attr) {
  var link = new QBWebCanvasLink;
  link.color = attr.split("|")[0] || "#000000";
  link.thin = attr.split("|")[1] || 3;
  link.thinBg = 15;
  link.line = this.path("M,0,0").attr({stroke:link.color, fill:"none", "stroke-width":link.thin, "stroke-linecap":"round", "stroke-linejoin":"round"});
  link.bg = this.path("M,0,0").attr({stroke:link.color, fill:"none", "stroke-width":link.thinBg, "stroke-opacity":0.01});
  link.startType = obj.Right.Type;
  link.start = configEnds(null, link.startType, link.color);
  link.endType = obj.Left.Type;
  link.end = configEnds(null, link.endType, link.color);
  link.object = obj;
  return link;
};
function configEnds(obj, type, color, x, y, d) {
  if (!x) {
    x = 0;
  }
  if (!y) {
    y = 0;
  }
  if (!d) {
    d = 1;
  }
  var typeMismatch = false;
  if (obj != null && obj.node) {
    switch(type) {
      case MetaData.JoinType.Inner:
        typeMismatch = obj.node.nodeName != "circle";
        break;
      case MetaData.JoinType.Outer:
        typeMismatch = obj.node.nodeName != "path";
        break;
    }
  }
  if (typeMismatch) {
    if (obj && obj.remove) {
      obj.remove();
    }
    obj = null;
  }
  if (obj == null) {
    switch(type) {
      case MetaData.JoinType.Inner:
        obj = QB.Web.Canvas.r.circle(0, 0, 5);
        obj.attr({fill:color, "stroke-width":0});
        break;
      case MetaData.JoinType.Outer:
        obj = QB.Web.Canvas.r.path("M,0,0");
        obj.attr({fill:color, "stroke-width":0});
        break;
    }
  }
  switch(type) {
    case MetaData.JoinType.Inner:
      obj.attr({cx:x, cy:y});
      break;
    case MetaData.JoinType.Outer:
      var dx = 8;
      var dy = 5;
      var path = ["M", x, y, "L", x, y + 1, x + dx * d, y + dy, x + dx * d, y - dy, x, y - 1, "Z"].join(",");
      obj.attr({path:path});
      break;
  }
  return obj;
}
;
/*
 * Packer
 * Javascript Compressor
 * http://dean.edwards.name/
 * http://www.smallsharptools.com/Projects/Packer/
*/

// ..\..\src\Common\Client\js\release\usr_v2_11_1.js
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?"":e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1;};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p;}('K XU=1l;K Kh={Ko:1a(){K 6s=1d;if(2A vS!="2x"){6E{6s=1T vS("11j.Kk")}6G(e){6E{6s=1T vS("BV.Kk")}6G(E){6s=1k}}}1j{if(3z.Kj){6E{6s=1T Kj}6G(e){6s=1d}}}1b 6s},BP:1a(H4,1X,4h){K 6s=J.Ko();if(!6s||!H4){1b}K 5k=H4;5k+=5k.5e("?")+1?"&":"?";5k+="11i="+(1T 5Y).Ug();K v4=1d;if(4h=="r8"){K H5=5k.3S("?");5k=H5[0];v4=H5[1]}6s.7F(4h,5k,1l);if(4h=="r8"){6s.H1("Km-1C","nn/x-dC-11m-11l");6s.H1("Km-1f",v4.1f);6s.H1("11h","6n")}6s.11d=1a(){if(6s.qL==4){if(6s.7l==gj){K 1O="";if(6s.Ke){1O=6s.Ke}if(1X){1X(1O)}}}};6s.11c(v4)},7P:1a(8U,5k,cv){K 5u=\'<b 2G="3X:#11e">CD 9T</b>\\n<br/>\\n\'+"gG: "+8U+"\\n<br>\\n"+"xa: "+5k+"\\n<br>\\n"+"Kd: "+cv+"\\n<br>\\n";K Ki="CD 9T\\n"+"gG: "+8U+"\\n\\n"+"xa: "+5k+"\\n\\n"+"Kd: "+cv+"\\n\\n";if(c7&&c7.ge){5u=5u+"ge: "+c7.ge}K 3T=2K.e7("2C");3T.da="11f";3T.qK=5u;if(2K&&(2K.3G&&2K.3G.4m)){2K.3G.4m(3T)}1j{eY(Ki)}Kh.Kg({8U:8U,5k:5k,cv:cv,ge:c7.ge});1b 1l},Kg:1a(1D){K 5k="r6/11v.11u?";1p(K i in 1D){if(1D.86(i)){5k+=i+"="+11w(1D[i])+"&"}}J.BP(5k,1d,"r8")}};(1a(){J.11y={6P:"1.4.5",9F:"11x"};K 7I=J.7I=1a(1i){if(1i==1d){1b"1d"}if(1i.$9j!=1d){1b 1i.$9j()}if(1i.98){if(1i.Kw==1){1b"1g"}if(1i.Kw==3){1b/\\S/.9z(1i.Oy)?"11t":"Mg"}}1j{if(2A 1i.1f=="dr"){if(1i.KH){1b"2F"}if("1i"in 1i){1b"JZ"}}}1b 2A 1i};K tQ=J.tQ=1a(1i,1A){if(1i==1d){1b 1k}K 5L=1i.$5L||1i.5L;4x(5L){if(5L===1A){1b 1l}5L=5L.1P}if(!1i.86){1b 1k}1b 1i g8 1A};K aK=J.aK;K kA=1l;1p(K i in{3Y:1}){kA=1d}if(kA){kA=["86","TY","TX","vp","Cm","3Y","5L"]}aK.3f.hZ=1a(vH){K 2H=J;1b 1a(a,b){if(a==1d){1b J}if(vH||2A a!="4E"){1p(K k in a){2H.2J(J,k,a[k])}if(kA){1p(K i=kA.1f;i--;){k=kA[i];if(a.86(k)){2H.2J(J,k,a[k])}}}}1j{2H.2J(J,a,b)}1b J}};aK.3f.11p=1a(vH){K 2H=J;1b 1a(a){K 2w,1O;if(2A a!="4E"){2w=a}1j{if(2F.1f>1){2w=2F}1j{if(vH){2w=[a]}}}if(2w){1O={};1p(K i=0;i<2w.1f;i++){1O[2w[i]]=2H.2J(J,2w[i])}}1j{1O=2H.2J(J,a)}1b 1O}};aK.3f.4D=1a(1r,1o){J[1r]=1o}.hZ();aK.3f.83=1a(1r,1o){J.3f[1r]=1o}.hZ();K 4d=3R.3f.4d;aK.2L=1a(1i){1b 7I(1i)=="1a"?1i:1a(){1b 1i}};3R.2L=1a(1i){if(1i==1d){1b[]}1b ao.Ky(1i)&&2A 1i!="4E"?7I(1i)=="4t"?1i:4d.2J(1i):[1i]};6o.2L=1a(1i){K dr=e6(1i);1b Kp(dr)?dr:1d};61.2L=1a(1i){1b 1i+""};aK.83({GN:1a(){J.$6d=1l;1b J},Gl:1a(){J.$tK=1l;1b J}});K ao=J.ao=J.ao=1a(1x,1A){if(1x){K Gh=1x.49();K KA=1a(1i){1b 7I(1i)==Gh};ao["is"+1x]=KA;if(1A!=1d){1A.3f.$9j=1a(){1b Gh}.GN()}}if(1A==1d){1b 1d}1A.4D(J);1A.$5L=ao;1A.3f.$5L=1A;1b 1A};K 3Y=5g.3f.3Y;ao.Ky=1a(1i){1b 1i!=1d&&(2A 1i.1f=="dr"&&3Y.2J(1i)!="[1A aK]")};K nM={};K Gf=1a(1A){K 1C=7I(1A.3f);1b nM[1C]||(nM[1C]=[])};K 83=1a(1x,4h){if(4h&&4h.$6d){1b}K nM=Gf(J);1p(K i=0;i<nM.1f;i++){K nw=nM[i];if(7I(nw)=="1C"){83.2J(nw,1x,4h)}1j{nw.2J(J,1x,4h)}}K d4=J.3f[1x];if(d4==1d||!d4.$tK){J.3f[1x]=4h}if(J[1x]==1d&&7I(4h)=="1a"){4D.2J(J,1x,1a(1i){1b 4h.3w(1i,4d.2J(2F,1))})}};K 4D=1a(1x,4h){if(4h&&4h.$6d){1b}K d4=J[1x];if(d4==1d||!d4.$tK){J[1x]=4h}};ao.83({83:83.hZ(),4D:4D.hZ(),aC:1a(1x,ku){83.2J(J,1x,J.3f[ku])}.hZ(),11o:1a(nw){Gf(J).1G(nw);1b J}});1T ao("ao",ao);K bD=1a(1x,1A,cp){K uq=1A!=5g,3f=1A.3f;if(uq){1A=1T ao(1x,1A)}1p(K i=0,l=cp.1f;i<l;i++){K 1r=cp[i],Gg=1A[1r],mp=3f[1r];if(Gg){Gg.Gl()}if(uq&&mp){1A.83(1r,mp.Gl())}}if(uq){K Kq=3f.vp(cp[0]);1A.11b=1a(fn){if(!Kq){1p(K i=0,l=cp.1f;i<l;i++){fn.2J(3f,3f[cp[i]],cp[i])}}1p(K 1r in 3f){fn.2J(3f,3f[1r],1r)}}}1b bD};bD("61",61,["cn","KF","4e","5e","CK","3x","Ms","3t","10P","4d","3S","7z","hb","s0","49","9i"])("3R",3R,["eO","1G","10R","dE","hP","5W","10T","4e","5x","4d","5e","CK","43","a6","pC","bC","JW","tC","10S"])("6o",6o,["Fj","5a","Cm","10O"])("aK",aK,["3w","2J","2S"])("eh",eh,["10K","9z"])("5g",5g,["8J","10J","10L","93","10N","10M","10U","117","112","118","11a","119","111"])("5Y",5Y,["7S"]);5g.4D=4D.hZ();5Y.4D("7S",1a(){1b+1T 5Y});1T ao("h6",h6);6o.3f.$9j=1a(){1b Kp(J)?"dr":"1d"}.GN();6o.4D("lV",1a(6e,4o){1b 3A.bf(3A.lV()*(4o-6e+1)+6e)});K 86=5g.3f.86;5g.4D("a6",1a(1A,fn,2S){1p(K 1r in 1A){if(86.2J(1A,1r)){fn.2J(2S,1A[1r],1r,1A)}}});5g.2p=5g.a6;3R.83({a6:1a(fn,2S){1p(K i=0,l=J.1f;i<l;i++){if(i in J){fn.2J(2S,J[i],i,J)}}},2p:1a(fn,2S){3R.a6(J,fn,2S);1b J}});K GE=1a(1i){3P(7I(1i)){1q"4t":1b 1i.6z();1q"1A":1b 5g.6z(1i);5N:1b 1i}};3R.83("6z",1a(){K i=J.1f,6z=1T 3R(i);4x(i--){6z[i]=GE(J[i])}1b 6z});K Gu=1a(cg,1r,6t){3P(7I(6t)){1q"1A":if(7I(cg[1r])=="1A"){5g.Ip(cg[1r],6t)}1j{cg[1r]=5g.6z(6t)}1s;1q"4t":cg[1r]=6t.6z();1s;5N:cg[1r]=6t}1b cg};5g.4D({Ip:1a(cg,k,v){if(7I(k)=="4E"){1b Gu(cg,k,v)}1p(K i=1,l=2F.1f;i<l;i++){K 1A=2F[i];1p(K 1r in 1A){Gu(cg,1r,1A[1r])}}1b cg},6z:1a(1A){K 6z={};1p(K 1r in 1A){6z[1r]=GE(1A[1r])}1b 6z},2Y:1a(sI){1p(K i=1,l=2F.1f;i<l;i++){K HL=2F[i]||{};1p(K 1r in HL){sI[1r]=HL[1r]}}1b sI}});["5g","10W","10V","10X","10Z"].2p(1a(1x){1T ao(1x)});K Ks=5Y.7S();61.4D("10Y",1a(){1b(Ks++).3Y(36)})})();3R.83({pC:1a(fn,2S){1p(K i=0,l=J.1f>>>0;i<l;i++){if(i in J&&!fn.2J(2S,J[i],i,J)){1b 1k}}1b 1l},43:1a(fn,2S){K fO=[];1p(K 1o,i=0,l=J.1f>>>0;i<l;i++){if(i in J){1o=J[i];if(fn.2J(2S,1o,i,J)){fO.1G(1o)}}}1b fO},5e:1a(1i,2L){K 1f=J.1f>>>0;1p(K i=2L<0?3A.4o(0,1f+2L):2L||0;i<1f;i++){if(J[i]===1i){1b i}}1b-1},bC:1a(fn,2S){K 1f=J.1f>>>0,fO=3R(1f);1p(K i=0;i<1f;i++){if(i in J){fO[i]=fn.2J(2S,J[i],i,J)}}1b fO},JW:1a(fn,2S){1p(K i=0,l=J.1f>>>0;i<l;i++){if(i in J&&fn.2J(2S,J[i],i,J)){1b 1l}}1b 1k},JX:1a(){1b J.43(1a(1i){1b 1i!=1d})},124:1a(JV){K 2w=3R.4d(2F,1);1b J.bC(1a(1i){1b 1i[JV].3w(1i,2w)})},126:1a(93){K 1y={},1f=3A.6e(J.1f,93.1f);1p(K i=0;i<1f;i++){1y[93[i]]=J[i]}1b 1y},2k:1a(1A){K 1O={};1p(K i=0,l=J.1f;i<l;i++){1p(K 1r in 1A){if(1A[1r](J[i])){1O[1r]=J[i];4q 1A[1r];1s}}}1b 1O},cW:1a(1i,2L){1b J.5e(1i,2L)!=-1},2Y:1a(4t){J.1G.3w(J,4t);1b J},129:1a(){1b J.1f?J[J.1f-1]:1d},127:1a(){1b J.1f?J[6o.lV(0,J.1f-1)]:1d},JU:1a(1i){if(!J.cW(1i)){J.1G(1i)}1b J},123:1a(4t){1p(K i=0,l=4t.1f;i<l;i++){J.JU(4t[i])}1b J},11X:1a(1i){1p(K i=J.1f;i--;){if(J[i]===1i){J.5W(i,1)}}1b J},ew:1a(){J.1f=0;1b J},JY:1a(){K 4t=[];1p(K i=0,l=J.1f;i<l;i++){K 1C=7I(J[i]);if(1C=="1d"){ap}4t=4t.4e(1C=="4t"||(1C=="JZ"||(1C=="2F"||tQ(J[i],3R)))?3R.JY(J[i]):J[i])}1b 4t},122:1a(){1p(K i=0,l=J.1f;i<l;i++){if(J[i]!=1d){1b J[i]}}1b 1d},HQ:1a(4t){if(J.1f!=3){1b 1d}K 4p=J.bC(1a(1o){if(1o.1f==1){1o+=1o}1b 1o.b8(16)});1b 4t?4p:"4p("+4p+")"},HO:1a(4t){if(J.1f<3){1b 1d}if(J.1f==4&&(J[3]==0&&!4t)){1b"121"}K 7d=[];1p(K i=0;i<3;i++){K uz=(J[i]-0).3Y(16);7d.1G(uz.1f==1?"0"+uz:uz)}1b 4t?7d:"#"+7d.5x("")}});61.83({9z:1a(ux,1D){1b(7I(ux)=="HS"?ux:1T eh(""+ux,1D)).9z(J)},cW:1a(4E,6f){1b 6f?(6f+J+6f).5e(6f+4E+6f)>-1:61(J).5e(4E)>-1},s0:1a(){1b 61(J).3t(/^\\s+|\\s+$/g,"")},JX:1a(){1b 61(J).3t(/\\s+/g," ").s0()},12a:1a(){1b 61(J).3t(/-\\D/g,1a(3x){1b 3x.cn(1).9i()})},12i:1a(){1b 61(J).3t(/[A-Z]/g,1a(3x){1b"-"+3x.cn(0).49()})},12h:1a(){1b 61(J).3t(/\\b[a-z]/g,1a(3x){1b 3x.9i()})},12j:1a(){1b 61(J).3t(/([-.*+?^${}()|[\\]\\/\\\\])/g,"\\\\$1")},b8:1a(jT){1b 6u(J,jT||10)},4i:1a(){1b e6(J)},HQ:1a(4t){K 7d=61(J).3x(/^#?(\\w{1,2})(\\w{1,2})(\\w{1,2})$/);1b 7d?7d.4d(1).HQ(4t):1d},HO:1a(4t){K 4p=61(J).3x(/\\d{1,3}/g);1b 4p?4p.HO(4t):1d},12l:1a(1A,HS){1b 61(J).3t(HS||/\\\\?\\{([^{}]+)\\}/g,1a(3x,1x){if(3x.cn(0)=="\\\\"){1b 3x.4d(1)}1b 1A[1x]!=1d?1A[1x]:""})}});aK.4D({JP:1a(){1p(K i=0,l=2F.1f;i<l;i++){6E{1b 2F[i]()}6G(e){}}1b 1d}});aK.83({JP:1a(2w,2S){6E{1b J.3w(2S,3R.2L(2w))}6G(e){}1b 1d},2S:1a(3h){K 2H=J,2w=2F.1f>1?3R.4d(2F,1):1d,F=1a(){};K Io=1a(){K 2W=3h,1f=2F.1f;if(J g8 Io){F.3f=2H.3f;2W=1T F}K 1O=!2w&&!1f?2H.2J(2W):2H.3w(2W,2w&&1f?2w.4e(3R.4d(2F)):2w||2F);1b 2W==3h?1O:2W};1b Io},Ik:1a(2w,2S){K 2H=J;if(2w!=1d){2w=3R.2L(2w)}1b 1a(){1b 2H.3w(2S,2w||2F)}},hp:1a(hp,2S,2w){1b 6W(J.Ik(2w==1d?[]:2w,2S),hp)},Il:1a(Il,2S,2w){1b pG(J.Ik(2w==1d?[]:2w,2S),Il)}});6o.83({Cc:1a(6e,4o){1b 3A.6e(4o,3A.4o(6e,J))},5m:1a(hO){hO=3A.6Q(10,hO||0).5a(hO<0?-hO:0);1b 3A.5m(J*hO)/hO},e1:1a(fn,2S){1p(K i=0;i<J;i++){fn.2J(2S,i,J)}},4i:1a(){1b e6(J)},b8:1a(jT){1b 6u(J,jT||10)}});6o.aC("2p","e1");(1a(4b){K cp={};4b.2p(1a(1x){if(!6o[1x]){cp[1x]=1a(){1b 3A[1x].3w(1d,[J].4e(3R.2L(2F)))}}});6o.83(cp)})(["4G","MV","vt","12k","Ij","j3","a5","12g","bf","mK","4o","6e","6Q","9J","bw","Nk"]);(1a(){K 6N=J.6N=1T ao("6N",1a(1D){if(tQ(1D,aK)){1D={dg:1D}}K jl=1a(){zh(J);if(jl.$Iq){1b J}J.$aq=1d;K 1o=J.dg?J.dg.3w(J,2F):J;J.$aq=J.aq=1d;1b 1o}.4D(J).83(1D);jl.$5L=6N;jl.3f.$5L=jl;jl.3f.1P=1P;1b jl});K 1P=1a(){if(!J.$aq){96 1T 9T(\'oG 4h "1P" JO be vo.\')}K 1x=J.$aq.$1x,1P=J.$aq.$JT.1P,d4=1P?1P.3f[1x]:1d;if(!d4){96 1T 9T(\'oG 4h "\'+1x+\'" 3Q no 1P.\')}1b d4.3w(J,2F)};K zh=1a(1A){1p(K 1r in 1A){K 1o=1A[1r];3P(7I(1o)){1q"1A":K F=1a(){};F.3f=1o;1A[1r]=zh(1T F);1s;1q"4t":1A[1r]=1o.6z();1s}}1b 1A};K pH=1a(2H,1r,4h){if(4h.$hQ){4h=4h.$hQ}K 6T=1a(){if(4h.$tK&&J.$aq==1d){96 1T 9T(\'oG 4h "\'+1r+\'" JO be vo.\')}K aq=J.aq,6t=J.$aq;J.aq=6t;J.$aq=6T;K 1O=4h.3w(J,2F);J.$aq=6t;J.aq=aq;1b 1O}.4D({$JT:2H,$hQ:4h,$1x:1r});1b 6T};K 83=1a(1r,1o,JS){if(6N.HR.86(1r)){1o=6N.HR[1r].2J(J,1o);if(1o==1d){1b J}}if(7I(1o)=="1a"){if(1o.$6d){1b J}J.3f[1r]=JS?1o:pH(J,1r,1o)}1j{5g.Ip(J.3f,1r,1o)}1b J};K K8=1a(tD){tD.$Iq=1l;K mp=1T tD;4q tD.$Iq;1b mp};6N.83("83",83.hZ());6N.HR={bZ:1a(1P){J.1P=1P;J.3f=K8(1P)},11J:1a(1J){3R.2L(1J).2p(1a(1i){K gA=1T 1i;1p(K 1r in gA){83.2J(J,1r,gA[1r],1l)}},J)}}})();(1a($){$.gy.aB="11E"in 2K;if(!$.gy.aB){1b}K mq=$.ui.tI.3f;K tT=mq.tT;K mm;1a io(1N,K6){if(1N.fF.jn.1f>1){1b}1N.4H();K t=1N.fF.Kb[0];K IL=2K.O6("11A");IL.O5(K6,1l,1l,3z,1,t.O4,t.O9,t.d0,t.cT,1k,1k,1k,1k,0,1d);1N.3g.Ii(IL)}mq.K2=1a(1N){K me=J;if(mm||!me.11B(1N.fF.Kb[0])){1b}mm=1l;me.DE=1k;io(1N,"hi");io(1N,"bi");io(1N,"7T")};mq.K0=1a(1N){if(!mm){1b}J.DE=1l;io(1N,"bi")};mq.K4=1a(1N){if(!mm){1b}io(1N,"7k");io(1N,"fB");if(!J.DE){io(1N,"3F")}mm=1k};mq.tT=1a(){K me=J;me.1g.2S("sV",$.bs(me,"K2")).2S("sW",$.bs(me,"K0")).2S("sT",$.bs(me,"K4"));tT.2J(me)}})(2I);K jX=1d;(1a($){$.fn.og=1a(){$(J).ha(1a(e){K t=e.7a;K o=$(e.7a).2v();if(e.7E-o.2f>t.ma){1b}K 1g=$(e.3g);1g.2P({x:e.d0,y:e.cT})})};K $Ld=$.fn.3F;$.fn.3F=1a 3F(5C,7P){if(!7P){1b $Ld.3w(J,2F)}1b $(J).2S(1C,7P)};$.fn.ha=1a ha(){K 2w=[].5W.2J(2F,0),7P=2w.eO(),5C=2w.eO(),$J=$(J);1b 7P?$J.3F(5C,7P):$J.1R(1C)};$.ha={5C:9m};$.1N.11Q.ha={Iz:1a(1h,cL){if(!/11M|11L|11N/i.9z(c7.ge)){$(J).2S(Le,E7).2S([L4,L2,L0,La].5x(" "),E4).2S(Ec,3F)}1j{Lg(J).2S(L9,E7).2S([L7,Lp,Lo].5x(" "),E4).2S(Ec,3F).2U({11P:"3q"})}},11O:1a(cL){$(J).8W(az)}};1a Lg(1g){$.2p("sV sW sT DU".3S(/ /),1a 2S(ix,it){1g.dO(it,1a 10I(1N){$(1g).1R(it)},1k)});1b $(1g)}1a E7(1N){if(jX){1b}K 1g=J;K 2w=2F;$(J).1h(vl,1k);jX=6W(Lf,$.ha.5C);1a Lf(){$(1g).1h(vl,1l);1N.1C=1C;2I.1N.ZC.3w(1g,2w)}}1a E4(1N){if(jX){hg(jX);jX=1d}}1a 3F(1N){if($(J).1h(vl)){1b 1N.fd()||1k}}K 1C="ha";K az="."+1C;K Le="7T"+az;K Ec="3F"+az;K L4="bi"+az;K L2="7k"+az;K L0="fB"+az;K La="5K"+az;K L9="sV"+az;K L7="sT"+az;K Lp="sW"+az;K Lo="DU"+az;K Zz="5C"+az;K ZH="a8"+az;K vl="SR"+az})(2I);(1a($){$.fn.u7=1a(1v){K k2=$.4D({},$.fn.u7.bn,1v);1b J.2p(1a(){$J=$(J);K o=$.ZQ?$.4D({},k2,$J.1h()):k2;K rV=o.3a;$.fn.l8(o,$J,rV)})};K F9=0;K uJ=0;K ZS=c7.ZR;K Ln=c7.ZN;if(Ln.5e("ZJ 7.0")>0){K uT="uV"}$.fn.u7.bn={71:5,3a:12,4T:5,h4:1l,D6:"#nc",l9:"#ZI",kV:"ZK",Fr:"#nc",ly:"#nc",lA:"#nc",6l:1l,Bz:1l,tI:"ZM",sz:1a(){1b 1k}};$.fn.l8=1a(o,1y,rV){if(o.4T>o.71){o.4T=o.71}$J.ew();if(o.Bz){K Ls="aI-Lr-ei";K Lj="aI-d4-ei";K Li="aI-Lh-ei";K Lm="aI-3B-ei"}1j{K Ls="aI-Lr";K Lj="aI-d4";K Li="aI-Lh";K Lm="aI-3B"}if(o.6l){K Fy=$("<2C>&lt;</2C>").d1({dM:{r9:"ui-3V-Lk-1-w"},2g:1k})}$J.3J(\'<2C id="Zh">\'+\'<2C id="Zd">\'+\'<2C id="Z9">\'+\'<2C id="vD"></2C>\'+\'<2C id="vC"></2C>\'+\'<2C id="qq"></2C>\'+"</2C>"+"</2C>"+"</2C>");K Ll=$("#vD").2r("aI-3r-yQ");Ll.2Y(Fy);K 9b=$(\'<1H zI="0" zL="0">\').2U("er","6d");K ke=$("<tr>").2r("aI-Z8");K c=(o.4T-1)/2;K 4A=rV-c;K pU;1p(K i=0;i<o.71;i++){K 2b=i+1;if(2b==rV){K rT=$(\'<td 2t="li">\').3J(\'<2u 2t="aI-6t">\'+2b+"</2u>");pU=rT;ke.2Y(rT)}1j{K rT=$(\'<td 2t="li">\').3J("<a>"+2b+"</a>");ke.2Y(rT)}}9b.2Y(ke);if(o.6l){K Fx=$("<2C>&gt;</2C>").d1({dM:{r9:"ui-3V-Lk-1-e"},2g:1k})}K pv=$("#vC").2r("aI-3r-Zb");pv.2Y(Fx);$("#qq").2Y(9b);K vv=$("#qq");K Di=1d;1a KZ(){$("#vD").3C();$("#vC").3C()}1a KJ(){$("#vD").5p();$("#vC").5p()}1a Dj(){if(vv.1m()==0){1b}wI(Di);if(9b.1m()<=vv.1m()){KZ()}1j{KJ()}}if(vv.1m()==0){Di=pG(Dj,lp)}1j{Dj()}$J.2r("Zp");if(!o.h4){if(o.kV=="3q"){K fP={"3X":o.l9}}1j{K fP={"3X":o.l9,"mt-3X":o.kV}}if(o.lA=="3q"){K fQ={"3X":o.ly}}1j{K fQ={"3X":o.ly,"mt-3X":o.lA}}}1j{if(o.kV=="3q"){K fP={"3X":o.l9,"h4":"lw rN "+o.D6}}1j{K fP={"3X":o.l9,"mt-3X":o.kV,"h4":"lw rN "+o.D6}}if(o.lA=="3q"){K fQ={"3X":o.ly,"h4":"lw rN "+o.Fr}}1j{K fQ={"3X":o.ly,"mt-3X":o.lA,"h4":"lw rN "+o.Fr}}}$.fn.Fd(o,$J,fP,fQ,ke,9b,pv);K Fu=F9-1;if(uT=="uV"){}1j{}if(o.tI=="SI"){Fx.7T(1a(){uS=pG(1a(){K 2f=9b.1P().54()+5;9b.1P().54(2f)},20)}).7k(1a(){wI(uS)});Fy.7T(1a(){uS=pG(1a(){K 2f=9b.1P().54()-5;9b.1P().54(2f)},20)}).7k(1a(){wI(uS)})}9b.2B(".li").3F(1a(e){pU.3J("<a>"+pU.2B(".aI-6t").3J()+"</a>");K Ft=$(J).2B("a").3J();$(J).3J(\'<2u 2t="aI-6t">\'+Ft+"</2u>");pU=$(J);$.fn.Fd(o,$(J).1P().1P().1P(),fP,fQ,ke,9b,pv);K 2f=J.91/2;K 10s=9b.54()+2f;K 8T=2f-Fu/2;if(uT=="uV"){9b.4X({54:2f+8T+52+"px"})}1j{9b.4X({54:2f+8T+"px"})}o.sz(Ft)});K 7Y=9b.2B(".li").eq(o.3a-1);K 2f=0;if(7Y.1f){2f=7Y[0].91/2}K 8T=2f-Fu/2;if(uT=="uV"){9b.4X({54:2f+8T+52+"px"})}1j{9b.4X({54:2f+8T+"px"})}};$.fn.Fd=1a(o,1y,fP,fQ,ke,9b,pv){1y.2B("a").2U(fP);1y.2B("2u.aI-6t").2U(fQ);1y.2B("a").7u(1a(){$(J).2U(fQ)},1a(){$(J).2U(fP)});uJ=0;1y.2B(".li").2p(1a(i,n){if(i==o.4T-1){F9=J.91+J.hj}uJ+=J.hj});uJ+=3}})(2I);(1a($){$.4D({ih:1a(fn,uN,aJ,Fa){K a8;1b 1a(){K 2w=2F;aJ=aJ||J;Fa&&(!a8&&fn.3w(aJ,2w));hg(a8);a8=6W(1a(){!Fa&&fn.3w(aJ,2w);a8=1d},uN)}},C2:1a(fn,uN,aJ){K a8,2w,uL;1b 1a(){2w=2F;uL=1l;aJ=aJ||J;if(!a8){(1a(){if(uL){fn.3w(aJ,2w);uL=1k;a8=6W(2F.KH,uN)}1j{a8=1d}})()}}}})})(2I);(1a($){K jy={mX:{Fi:1a(i){3P(J.n6(i)){1q"4t":;1q"10y":;1q"dr":1b i.3Y();1q"1A":K o=[];1p(x=0;x<i.1f;i++){o.1G(i+": "+J.Fi(i[x]))}1b o.5x(", ");1q"4E":1b i;5N:1b i}},n6:1a(i){if(!i||!i.5L){1b 2A i}K 3x=i.5L.3Y().3x(/3R|6o|61|5g|5Y/);1b 3x&&3x[0].49()||2A i},nL:1a(7X,l,s,t){K p=s||" ";K o=7X;if(l-7X.1f>0){o=(1T 3R(3A.j3(l/ p.1f))).5x(p).7z(0, t = !t ? l : t == 1 ? 0 : 3A.j3(l /2))+7X+p.7z(0,l-t)}1b o},KM:1a(4M,2w){K 1r=4M.v5();3P(J.n6(2w)){1q"1A":K 93=1r.3S(".");K 1y=2w;1p(K dW=0;dW<93.1f;dW++){1y=1y[93[dW]]}if(2A 1y!="2x"){if(jy.mX.n6(1y)=="4t"){1b 4M.jv().3x(/\\.\\*/)&&1y[1]||1y}1b 1y}1j{}1s;1q"4t":1r=6u(1r,10);if(4M.jv().3x(/\\.\\*/)&&2A 2w[1r+1]!="2x"){1b 2w[1r+1]}1j{if(2A 2w[1r]!="2x"){1b 2w[1r]}1j{1b 1r}}1s}1b"{"+1r+"}"},KL:1a(eB,2w){K 4M=1T KD(eB,2w);1b jy.mX[4M.jv().4d(-1)](J.KM(4M,2w),4M)},d:1a(2a,4M){K o=6u(2a,10);K p=4M.o5();if(p){1b J.nL(o.3Y(),p,4M.oH(),0)}1j{1b o}},i:1a(2a,2w){1b J.d(2a,2w)},o:1a(2a,4M){K o=2a.3Y(8);if(4M.oa()){o=J.nL(o,o.1f+1,"0",0)}1b J.nL(o,4M.o5(),4M.oH(),0)},u:1a(2a,2w){1b 3A.4G(J.d(2a,2w))},x:1a(2a,4M){K o=6u(2a,10).3Y(16);o=J.nL(o,4M.o5(),4M.oH(),0);1b 4M.oa()?"10z"+o:o},X:1a(2a,4M){1b J.x(2a,4M).9i()},e:1a(2a,4M){1b e6(2a,10).Fj(4M.vd())},E:1a(2a,4M){1b J.e(2a,4M).9i()},f:1a(2a,4M){1b J.nL(e6(2a,10).5a(4M.vd()),4M.o5(),4M.oH(),0)},F:1a(2a,2w){1b J.f(2a,2w)},g:1a(2a,4M){K o=e6(2a,10);1b o.3Y().1f>6?3A.5m(o.Fj(4M.vd())):o},G:1a(2a,2w){1b J.g(2a,2w)},c:1a(2a,2w){K 3x=2a.3x(/\\w|\\d/);1b 3x&&3x[0]||""},r:1a(2a,2w){1b J.Fi(2a)},s:1a(2a,2w){1b 2a.3Y&&2a.3Y()||""+2a}},7p:1a(7X,2w){K 5d=0;K 3a=0;K 3x=1k;K ki=[];K eB="";K 8T=(7X||"").3S("");1p(3a=0;3a<8T.1f;3a++){if(8T[3a]=="{"&&8T[3a+1]!="{"){5d=7X.5e("}",3a);eB=8T.4d(3a+1,5d).5x("");ki.1G(jy.mX.KL(eB,2A 2F[1]!="1A"?KC(2F,2):2w||[]))}1j{if(3a>5d||ki.1f<1){ki.1G(8T[3a])}}}1b ki.1f>1?ki.5x(""):ki[0]},102:1a(7X,2w){1b yV(7p(7X,2w))},mh:1a(s,n){1b(1T 3R(n+1)).5x(s)},105:1a(s){1b 104(ZY(s))},ZU:1a(s){1b ZT(ZV(s))},ZX:1a(){K 2E="",ZW=1l;if(2F.1f==2&&$.cD(2F[1])){J[2F[0]]=2F[1].5x("");1b 2I}if(2F.1f==2&&$.107(2F[1])){J[2F[0]]=2F[1];1b 2I}if(2F.1f==1){1b $(J[2F[0]])}if(2F.1f==2&&2F[1]==1k){1b J[2F[0]]}if(2F.1f==2&&$.KK(2F[1])){1b $($.7p(J[2F[0]],2F[1]))}if(2F.1f==3&&$.KK(2F[1])){1b 2F[2]==1l?$.7p(J[2F[0]],2F[1]):$($.7p(J[2F[0]],2F[1]))}}};K KD=1a(4M,2w){J.FS=4M;J.jF=2w;J.10h=e6("1."+(1T 3R(32)).5x("1"),10).3Y().1f-3;J.pK=6;J.ou=1a(){1b J.FS};J.v5=1a(){1b J.FS.3S(":")[0]};J.jv=1a(){K 3x=J.ou().3S(":");1b 3x&&3x[1]?3x[1]:"s"};J.vd=1a(){K 3x=J.jv().3x(/\\.(\\d+|\\*)/g);if(!3x){1b J.pK}1j{3x=3x[0].4d(1);if(3x!="*"){1b 6u(3x,10)}1j{if(jy.mX.n6(J.jF)=="4t"){1b J.jF[1]&&J.jF[0]||J.pK}1j{if(jy.mX.n6(J.jF)=="1A"){1b J.jF[J.v5()]&&J.jF[J.v5()][0]||J.pK}1j{1b J.pK}}}}};J.o5=1a(){K 3x=1k;if(J.oa()){3x=J.ou().3x(/0?#0?(\\d+)/);if(3x&&3x[1]){1b 6u(3x[1],10)}}3x=J.ou().3x(/(0|\\.)(\\d+|\\*)/g);1b 3x&&6u(3x[0].4d(1),10)||0};J.oH=1a(){K o="";if(J.oa()){o=" "}if(J.jv().3x(/#0|0#|^0|\\.\\d+/)){o="0"}1b o};J.10b=1a(){K 3x=J.ou().10d(/^(0|\\#|\\-|\\+|\\s)+/);1b 3x&&3x[0].3S("")||[]};J.oa=1a(){1b!!J.jv().3x(/^0?#/)}};K KC=1a(2w,dE){K o=[];1p(l=2w.1f,x=(dE||0)-1;x<l;x++){o.1G(2w[x])}1b o};$.4D(jy)})(2I);(1a($){$.ic=1a(o){if(2A fc=="1A"&&fc.KB){1b fc.KB(o)}K 1C=2A o;if(o===1d){1b"1d"}if(1C=="2x"){1b 2x}if(1C=="dr"||1C=="p8"){1b o+""}if(1C=="4E"){1b $.FK(o)}if(1C=="1A"){if(2A o.ic=="1a"){1b $.ic(o.ic())}if(o.5L===5Y){K oU=o.10c()+1;if(oU<10){oU="0"+oU}K ob=o.12m();if(ob<10){ob="0"+ob}K KG=o.14v();K p7=o.14u();if(p7<10){p7="0"+p7}K pu=o.14w();if(pu<10){pu="0"+pu}K o6=o.14y();if(o6<10){o6="0"+o6}K i6=o.14x();if(i6<100){i6="0"+i6}if(i6<10){i6="0"+i6}1b\'"\'+KG+"-"+oU+"-"+ob+"T"+p7+":"+pu+":"+o6+"."+i6+\'Z"\'}if(o.5L===3R){K 8M=[];1p(K i=0;i<o.1f;i++){8M.1G($.ic(o[i])||"1d")}1b"["+8M.5x(",")+"]"}K FJ=[];1p(K k in o){K 1x;K 1C=2A k;if(1C=="dr"){1x=\'"\'+k+\'"\'}1j{if(1C=="4E"){1x=$.FK(k)}1j{ap}}if(2A o[k]=="1a"){ap}K 2b=$.ic(o[k]);FJ.1G(1x+":"+2b)}1b"{"+FJ.5x(", ")+"}"}};$.14s=1a(4L){if(2A fc=="1A"&&fc.ti){1b fc.ti(4L)}1b yV("("+4L+")")};$.14r=1a(4L){if(2A fc=="1A"&&fc.ti){1b fc.ti(4L)}K h3=4L;h3=h3.3t(/\\\\["\\\\\\/14H]/g,"@");h3=h3.3t(/"[^"\\\\\\n\\r]*"|1l|1k|1d|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?/g,"]");h3=h3.3t(/(?:^|:|,)(?:\\s*\\[)+/g,"");if(/^[\\],:{}\\s]*$/.9z(h3)){1b yV("("+4L+")")}1j{96 1T 14G("9T 14I fc, cg is 6j 14J.")}};$.FK=1a(4E){if(4E.3x(Ey)){1b\'"\'+4E.3t(Ey,1a(a){K c=KV[a];if(2A c==="4E"){1b c}c=a.KF();1b"\\\\14B"+3A.bf(c/16).3Y(16)+(c%16).3Y(16)})+\'"\'}1b\'"\'+4E+\'"\'};K Ey=/["\\\\\\14C-\\14E\\14D-\\14n]/g;K KV={"\\b":"\\\\b","\\t":"\\\\t","\\n":"\\\\n","\\f":"\\\\f","\\r":"\\\\r",\'"\':\'\\\\"\',"\\\\":"\\\\\\\\"}})(2I);(1a($){$.fn.EF=1a(){K 5F=1a(el,v,t,sO){K 2T=2K.e7("2T");2T.1o=v,2T.2g=t;K o=el.1v;K oL=o.1f;if(!el.8H){el.8H={};1p(K i=0;i<oL;i++){el.8H[o[i].1o]=i}}if(2A el.8H[v]=="2x"){el.8H[v]=oL}el.1v[el.8H[v]]=2T;if(sO){2T.1Y=1l}};K a=2F;if(a.1f==0){1b J}K sO=1l;K m=1k;K 1J,v,t;if(2A a[0]=="1A"){m=1l;1J=a[0]}if(a.1f>=2){if(2A a[1]=="p8"){sO=a[1]}1j{if(2A a[2]=="p8"){sO=a[2]}}if(!m){v=a[0];t=a[1]}}J.2p(1a(){if(J.98.49()!="2y"){1b}if(m){1p(K 1i in 1J){5F(J,1i,1J[1i],sO)}}1j{5F(J,v,t,sO)}});1b J};$.fn.145=1a(5k,1D,2y,fn,2w){if(2A 5k!="4E"){1b J}if(2A 1D!="1A"){1D={}}if(2A 2y!="p8"){2y=1l}J.2p(1a(){K el=J;$.148(5k,1D,1a(r){$(el).EF(r,2y);if(2A fn=="1a"){if(2A 2w=="1A"){fn.3w(el,2w)}1j{fn.2J(el)}}})});1b J};$.fn.KU=1a(){K a=2F;if(a.1f==0){1b J}K ta=2A a[0];K v,1W;if(ta=="4E"||(ta=="1A"||ta=="1a")){v=a[0];if(v.5L==3R){K l=v.1f;1p(K i=0;i<l;i++){J.KU(v[i],a[1])}1b J}}1j{if(ta=="dr"){1W=a[0]}1j{1b J}}J.2p(1a(){if(J.98.49()!="2y"){1b}if(J.8H){J.8H=1d}K 3M=1k;K o=J.1v;if(!!v){K oL=o.1f;1p(K i=oL-1;i>=0;i--){if(v.5L==eh){if(o[i].1o.3x(v)){3M=1l}}1j{if(o[i].1o==v){3M=1l}}if(3M&&a[1]===1l){3M=o[i].1Y}if(3M){o[i]=1d}3M=1k}}1j{if(a[1]===1l){3M=o[1W].1Y}1j{3M=1l}if(3M){J.3M(1W)}}});1b J};$.fn.149=1a(Ev){K KT=$(J).KY();K a=2A Ev=="2x"?1l:!!Ev;J.2p(1a(){if(J.98.49()!="2y"){1b}K o=J.1v;K oL=o.1f;K sA=[];1p(K i=0;i<oL;i++){sA[i]={v:o[i].1o,t:o[i].2g}}sA.hP(1a(o1,o2){tb=o1.t.49(),t8=o2.t.49();if(tb==t8){1b 0}if(a){1b tb<t8?-1:1}1j{1b tb>t8?-1:1}});1p(K i=0;i<oL;i++){o[i].2g=sA[i].t;o[i].1o=sA[i].v}}).uk(KT,1l);1b J};$.fn.uk=1a(1o,9I){K v=1o;K vT=2A 1o;if(vT=="1A"&&v.5L==3R){K $J=J;$.2p(v,1a(){$J.uk(J,9I)})}K c=9I||1k;if(vT!="4E"&&(vT!="1a"&&vT!="1A")){1b J}J.2p(1a(){if(J.98.49()!="2y"){1b J}K o=J.1v;K oL=o.1f;1p(K i=0;i<oL;i++){if(v.5L==eh){if(o[i].1o.3x(v)){o[i].1Y=1l}1j{if(c){o[i].1Y=1k}}}1j{if(o[i].1o==v){o[i].1Y=1l}1j{if(c){o[i].1Y=1k}}}}});1b J};$.fn.13X=1a(to,lP){K w=lP||"1Y";if($(to).4l()==0){1b J}J.2p(1a(){if(J.98.49()!="2y"){1b J}K o=J.1v;K oL=o.1f;1p(K i=0;i<oL;i++){if(w=="73"||w=="1Y"&&o[i].1Y){$(to).EF(o[i].1o,o[i].2g)}}});1b J};$.fn.13W=1a(1o,fn){K a7=1k;K v=1o;K vT=2A v;K fT=2A fn;if(vT!="4E"&&(vT!="1a"&&vT!="1A")){1b fT=="1a"?J:a7}J.2p(1a(){if(J.98.49()!="2y"){1b J}if(a7&&fT!="1a"){1b 1k}K o=J.1v;K oL=o.1f;1p(K i=0;i<oL;i++){if(v.5L==eh){if(o[i].1o.3x(v)){a7=1l;if(fT=="1a"){fn.2J(o[i],i)}}}1j{if(o[i].1o==v){a7=1l;if(fT=="1a"){fn.2J(o[i],i)}}}}});1b fT=="1a"?J:a7};$.fn.KY=1a(){K v=[];J.El().2p(1a(){v[v.1f]=J.1o});1b v};$.fn.13Y=1a(){K t=[];J.El().2p(1a(){t[t.1f]=J.2g});1b t};$.fn.El=1a(){1b J.2B("2T:1Y")}})(2I);(1a($){$.4D($.fn,{qO:1a(c1,c2){K KX=J.43("."+c1);J.43("."+c2).3K(c2).2r(c1);KX.3K(c1).2r(c2);1b J},jO:1a(c1,c2){1b J.43("."+c1).3K(c1).2r(c2).5d()},zA:1a(da){da=da||"7u";1b J.7u(1a(){$(J).2r(da)},1a(){$(J).3K(da)})},KP:1a(iy,1X){iy?J.4X({1w:"cV"},iy,1X):J.2p(1a(){2I(J)[2I(J).is(":6d")?"5p":"3C"]();if(1X){1X.3w(J,2F)}})},KO:1a(iy,1X){if(iy){J.4X({1w:"3C"},iy,1X)}1j{J.3C();if(1X){J.2p(1X)}}},ES:1a(3i){if(!3i.KW){J.43(":7Y-zo:6j(ul)").2r(5D.7Y);J.43((3i.aZ?"":"."+5D.EQ)+":6j(."+5D.7F+")").2B(">ul").3C()}1b J.43(":3Q(>ul)")},EU:1a(3i,mI){if(!3i.KW){J.43(":3Q(>ul:6d)").2r(5D.9M).jO(5D.7Y,5D.jN);J.6j(":3Q(>ul:6d)").2r(5D.dD).jO(5D.7Y,5D.jQ);J.nE(\'<2C 2t="\'+5D.4Y+\'"/>\').2B("2C."+5D.4Y).2p(1a(){K iw="";$.2p($(J).1P().1n("2t").3S(" "),1a(){iw+=J+"-4Y "});$(J).2r(iw)})}J.2B("2C."+5D.4Y).3F(mI)},lu:1a(3i){3i=$.4D({EW:"lu"},3i);if(3i.5F){1b J.1R("5F",[3i.5F])}if(3i.cV){K 1X=3i.cV;3i.cV=1a(){1b 1X.3w($(J).1P()[0],2F)}}1a KQ(3I,3r){1a 7P(43){1b 1a(){mI.3w($("2C."+5D.4Y,3I).43(1a(){1b 43?$(J).1P("."+43).1f:1l}));1b 1k}}$("a:eq(0)",3r).3F(7P(5D.dD));$("a:eq(1)",3r).3F(7P(5D.9M));$("a:eq(2)",3r).3F(7P())}1a mI(){$(J).1P().2B(">.4Y").qO(5D.F1,5D.EJ).qO(5D.yz,5D.yE).5d().qO(5D.dD,5D.9M).qO(5D.jQ,5D.jN).2B(">ul").KP(3i.iy,3i.cV);if(3i.14i){$(J).1P().Fc().2B(">.4Y").jO(5D.F1,5D.EJ).jO(5D.yz,5D.yE).5d().jO(5D.dD,5D.9M).jO(5D.jQ,5D.jN).2B(">ul").KO(3i.iy,3i.cV)}}1a Ed(){1a 14m(4M){1b 4M?1:0}K 1h=[];jP.2p(1a(i,e){1h[i]=$(e).is(":3Q(>ul:6v)")?1:0});$.F2(3i.EW,1h.5x(""))}1a KR(){K EX=$.F2(3i.EW);if(EX){K 1h=EX.3S("");jP.2p(1a(i,e){$(e).2B(">ul")[6u(1h[i])?"5p":"3C"]()})}}J.2r("lu");K jP=J.2B("li").ES(3i);3P(3i.14h){1q"F2":K EM=3i.cV;3i.cV=1a(){Ed();if(EM){EM.3w(J,2F)}};KR();1s;1q"gM":K 6t=J.2B("a").43(1a(){1b J.5B.49()==gM.5B.49()});if(6t.1f){6t.2r("1Y").7s("ul, li").5F(6t.3B()).5p()}1s}jP.EU(3i,mI);if(3i.3r){KQ(J,3i.3r);$(3i.3r).5p()}1b J.2S("5F",1a(1N,jP){$(jP).3W().3K(5D.7Y).3K(5D.jQ).3K(5D.jN).2B(">.4Y").3K(5D.yz).3K(5D.yE);$(jP).2B("li").M4().ES(3i).EU(3i,mI)})}});K 5D=$.fn.lu.iw={7F:"7F",EQ:"EQ",9M:"9M",EJ:"9M-4Y",yE:"jN-4Y",dD:"dD",F1:"dD-4Y",yz:"jQ-4Y",jQ:"jQ",jN:"jN",7Y:"7Y",4Y:"4Y"};$.fn.14g=$.fn.lu})(2I);(1a($,2x){$.gy.Jt="14f"in 3z;$.gy.Jv="15k"in 3z;$.gy.Jz="15j"in 2K.9k;if(!$.ui||!$.ui.8z){K Jc=$.J8;$.J8=1a(Ep){1p(K i=0,4f;(4f=Ep[i])!=1d;i++){6E{$(4f).15l("3M")}6G(e){}}Jc(Ep)}}K $8y=1d,rj=1k,$5R=$(3z),d6=0,cL={},aM={},mf={},bn={4s:1d,4n:1d,1R:"8t",Jw:1k,hp:gj,nH:1k,JA:1a($1V){if($.ui&&$.ui.2R){$1V.2U("4T","5J").2R({my:"2f 1M",at:"2f 4O",of:J,2v:"0 5",jB:"cP"}).2U("4T","3q")}1j{K 2v=J.2v();2v.1M+=J.7g();2v.2f+=J.8b()/ 2 - $1V.8b() /2;$1V.2U(2v)}},2R:1a(1L,x,y){K $J=J,2v;if(!x&&!y){1L.JA.2J(J,1L.$1V);1b}1j{if(x==="JL"&&y==="JL"){2v=1L.$1V.2R()}1j{2v={1M:y,2f:x}}}K 4O=$5R.4Q()+$5R.1w(),8t=$5R.54()+$5R.1m(),1w=1L.$1V.1w(),1m=1L.$1V.1m();if(2v.1M+1w>4O){2v.1M-=1w}if(2v.1M<0){2v.1M=0}if(2v.2f+1m>8t){2v.2f-=1m}1L.$1V.2U(2v)},Jm:1a($1V){if($.ui&&$.ui.2R){$1V.2U("4T","5J").2R({my:"2f 1M",at:"8t 1M",of:J,jB:"15n cP"}).2U("4T","")}1j{K 2v={1M:0,2f:J.8b()};$1V.2U(2v)}},4u:15m,7n:{5C:0,5p:"RN",3C:"RK"},4U:{5p:$.tM,3C:$.tM},1X:1d,1J:{}},c8={a8:1d,7E:1d,89:1d},Jx=1a($t){1b 15i;K z1=0,$tt=$t;4x(1l){z1=3A.4o(z1,6u($tt.2U("z-1W"),10)||0);$tt=$tt.1P();if(!$tt||(!$tt.1f||"3J 3G".5e($tt.6Y("98").49())>-1)){1s}}1b z1},5t={ol:1a(e){e.4H();e.fd()},5K:1a(e){K $J=$(J);if(e.1h.1R=="8t"){e.4H();e.fd()}if(e.1h.1R!="8t"&&e.fF){1b}if($J.4J("2W-1V-8S")){1b}if(!$J.4J("2W-1V-2O")){$8y=$J;if(e.1h.9F){K kW=e.1h.9F($8y,e);if(kW===1k){1b}if(kW.1X!==2x&&kW.1X!=1d){e.1h.1X=kW.1X}e.1h=$.4D(1l,{},kW,bn,e.1h||{});if(!e.1h.1J||$.Jb(e.1h.1J)){if(3z.d5){(d5.5u||d5.mK).2J(d5,"No 1J yj to 5p in 2P")}96 1T 9T("No 2Q yj")}e.1h.$1R=$8y;op.8J(e.1h)}op.5p.2J($J,e.1h,e.7E,e.89)}},3F:1a(e){e.4H();e.fd();$(J).1R($.yg("5K",{1h:e.1h,7E:e.7E,89:e.89}))},7T:1a(e){K $J=$(J);if($8y&&($8y.1f&&!$8y.is($J))){$8y.1h("2P").$1V.1R("5K:3C")}if(e.3e==2){$8y=$J.1h("FO",1l)}},7k:1a(e){K $J=$(J);if($J.1h("FO")&&($8y&&($8y.1f&&($8y.is($J)&&!$J.4J("2W-1V-2O"))))){e.4H();e.fd();$8y=$J;$J.1R($.yg("5K",{1h:e.1h,7E:e.7E,89:e.89}))}$J.pE("FO")},mN:1a(e){K $J=$(J),$mv=$(e.rF),$2K=$(2K);if($mv.is(".2W-1V-5v")||$mv.jK(".2W-1V-5v").1f){1b}if($8y&&$8y.1f){1b}c8.7E=e.7E;c8.89=e.89;c8.1h=e.1h;$2K.on("bi.Jo",5t.bi);c8.a8=6W(1a(){c8.a8=1d;$2K.fv("bi.Jo");$8y=$J;$J.1R($.yg("5K",{1h:c8.1h,7E:c8.7E,89:c8.89}))},e.1h.hp)},bi:1a(e){c8.7E=e.7E;c8.89=e.89},q4:1a(e){K $mv=$(e.rF);if($mv.is(".2W-1V-5v")||$mv.jK(".2W-1V-5v").1f){1b}6E{hg(c8.a8)}6G(e){}c8.a8=1d},Jg:1a(e){K $J=$(J),2D=$J.1h("ai"),3e=e.3e,x=e.7E,y=e.89,3g,2v;e.4H();e.fd();6W(1a(){K $3z;K FP=2D.1R=="2f"&&3e===0||2D.1R=="8t"&&3e===2;if(2K.ss&&2D.$7c){2D.$7c.3C();3g=2K.ss(x-$5R.54(),y-$5R.4Q());2D.$7c.5p()}if(2D.nH&&FP){if(2K.ss){if(2D.$1R.is(3g)||2D.$1R.3Q(3g).1f){2D.2R.2J(2D.$1R,2D,x,y);1b}}1j{2v=2D.$1R.2v();$3z=$(3z);2v.1M+=$3z.4Q();if(2v.1M<=e.89){2v.2f+=$3z.54();if(2v.2f<=e.7E){2v.4O=2v.1M+2D.$1R.7g();if(2v.4O>=e.89){2v.8t=2v.2f+2D.$1R.8b();if(2v.8t>=e.7E){2D.2R.2J(2D.$1R,2D,x,y);1b}}}}}}if(3g&&FP){2D.$1R.uF("5K:6d",1a(){$(3g).2P({x:x,y:y})})}2D.$1V.1R("5K:3C")},50)},iF:1a(e,1L){if(!1L.fA){e.4H()}e.6X()},1r:1a(e){K 1L={};if($8y){1L=$8y.1h("2P")||{}}3P(e.3Z){1q 9:;1q 38:5t.iF(e,1L);if(1L.fA){if(e.3Z==9&&e.pB){e.4H();1L.$1Y&&1L.$1Y.2B("2a, 8s, 2y").4W();1L.$1V.1R("Ir");1b}1j{if(e.3Z==38&&1L.$1Y.2B("2a, 8s, 2y").6Y("1C")=="9h"){e.4H();1b}}}1j{if(e.3Z!=9||e.pB){1L.$1V.1R("Ir");1b}};1q 40:5t.iF(e,1L);if(1L.fA){if(e.3Z==9){e.4H();1L.$1Y&&1L.$1Y.2B("2a, 8s, 2y").4W();1L.$1V.1R("zC");1b}1j{if(e.3Z==40&&1L.$1Y.2B("2a, 8s, 2y").6Y("1C")=="9h"){e.4H();1b}}}1j{1L.$1V.1R("zC");1b}1s;1q 37:5t.iF(e,1L);if(1L.fA||(!1L.$1Y||!1L.$1Y.1f)){1s}if(!1L.$1Y.1P().4J("2W-1V-2D")){K $1P=1L.$1Y.1P().1P();1L.$1Y.1R("5K:4W");1L.$1Y=$1P;1b}1s;1q 39:5t.iF(e,1L);if(1L.fA||(!1L.$1Y||!1L.$1Y.1f)){1s}K yN=1L.$1Y.1h("2P")||{};if(yN.$1V&&1L.$1Y.4J("2W-1V-CW")){1L.$1Y=1d;yN.$1Y=1d;yN.$1V.1R("zC");1b}1s;1q 35:;1q 36:if(1L.$1Y&&1L.$1Y.2B("2a, 8s, 2y").1f){1b}1j{(1L.$1Y&&1L.$1Y.1P()||1L.$1V).5w(":6j(.2O, .6j-jA)")[e.3Z==36?"4A":"7Y"]().1R("5K:3k");e.4H();1b}1s;1q 13:5t.iF(e,1L);if(1L.fA){if(1L.$1Y&&!1L.$1Y.is("8s, 2y")){e.4H();1b}1s}1L.$1Y&&1L.$1Y.1R("7k");1b;1q 32:;1q 33:;1q 34:5t.iF(e,1L);1b;1q 27:5t.iF(e,1L);1L.$1V.1R("5K:3C");1b;5N:K k=61.G0(e.3Z).9i();if(1L.i7&&1L.i7[k]){1L.i7[k].$1u.1R(1L.i7[k].$1V?"5K:3k":"7k");1b}1s}e.6X();1L.$1Y&&1L.$1Y.1R(e)},k7:1a(e){e.6X();K 1L=$(J).1h("2P")||{};if(1L.$1Y){K $s=1L.$1Y;1L=1L.$1Y.1P().1h("2P")||{};1L.$1Y=$s}K $5w=1L.$1V.5w(),$3W=!1L.$1Y||!1L.$1Y.3W().1f?$5w.7Y():1L.$1Y.3W(),$5m=$3W;4x($3W.4J("2O")||$3W.4J("6j-jA")){if($3W.3W().1f){$3W=$3W.3W()}1j{$3W=$5w.7Y()}if($3W.is($5m)){1b}}if(1L.$1Y){5t.zN.2J(1L.$1Y.4w(0),e)}5t.zu.2J($3W.4w(0),e);K $2a=$3W.2B("2a, 8s, 2y");if($2a.1f){$2a.3k()}},iU:1a(e){e.6X();K 1L=$(J).1h("2P")||{};if(1L.$1Y){K $s=1L.$1Y;1L=1L.$1Y.1P().1h("2P")||{};1L.$1Y=$s}K $5w=1L.$1V.5w(),$3B=!1L.$1Y||!1L.$1Y.3B().1f?$5w.4A():1L.$1Y.3B(),$5m=$3B;4x($3B.4J("2O")||$3B.4J("6j-jA")){if($3B.3B().1f){$3B=$3B.3B()}1j{$3B=$5w.4A()}if($3B.is($5m)){1b}}if(1L.$1Y){5t.zN.2J(1L.$1Y.4w(0),e)}5t.zu.2J($3B.4w(0),e);K $2a=$3B.2B("2a, 8s, 2y");if($2a.1f){$2a.3k()}},Jn:1a(e){K $J=$(J).jK(".2W-1V-1i"),1h=$J.1h(),1L=1h.2P,2D=1h.ai;2D.$1Y=1L.$1Y=$J;2D.fA=1L.fA=1l},JJ:1a(e){K $J=$(J).jK(".2W-1V-1i"),1h=$J.1h(),1L=1h.2P,2D=1h.ai;2D.fA=1L.fA=1k},JF:1a(e){K 2D=$(J).1h().ai;2D.yb=1l},JC:1a(e){K 2D=$(J).1h().ai;if(2D.$7c&&2D.$7c.is(e.rF)){2D.yb=1k}},zu:1a(e){K $J=$(J),1h=$J.1h(),1L=1h.2P,2D=1h.ai;2D.yb=1l;if(e&&(2D.$7c&&2D.$7c.is(e.rF))){e.4H();e.fd()}(1L.$1V?1L:2D).$1V.5w(".7u").1R("5K:4W");if($J.4J("2O")||$J.4J("6j-jA")){1L.$1Y=1d;1b}$J.1R("5K:3k")},zN:1a(e){K $J=$(J),1h=$J.1h(),1L=1h.2P,2D=1h.ai;if(2D!==1L&&(2D.$7c&&2D.$7c.is(e.rF))){2D.$1Y&&2D.$1Y.1R("5K:4W");e.4H();e.fd();2D.$1Y=1L.$1Y=1L.$1u;1b}$J.1R("5K:4W")},JM:1a(e){K $J=$(J),1h=$J.1h(),1L=1h.2P,2D=1h.ai,1r=1h.Dq,1X;if(!1L.1J[1r]||$J.is(".2O, .2W-1V-CW, .2W-1V-6f, .6j-jA")){1b}e.4H();e.fd();if($.cS(2D.mC[1r])&&5g.3f.86.2J(2D.mC,1r)){1X=2D.mC[1r]}1j{if($.cS(2D.1X)){1X=2D.1X}1j{1b}}if(1X.2J(2D.$1R,1r,2D,1h)!==1k){2D.$1V.1R("5K:3C")}1j{if(2D.$1V.1P().1f){op.7R.2J(2D.$1R,2D)}}},JB:1a(e){e.fd()},Je:1a(e,1h){K 2D=$(J).1h("ai");op.3C.2J(2D.$1R,2D,1h&&1h.bD)},JI:1a(e){e.6X();K $J=$(J),1h=$J.1h(),1L=1h.2P,2D=1h.ai;$J.2r("7u").Fc(".7u").1R("5K:4W");1L.$1Y=2D.$1Y=$J;if(1L.$1u){2D.Jm.2J(1L.$1u,1L.$1V)}},Jj:1a(e){e.6X();K $J=$(J),1h=$J.1h(),1L=1h.2P;$J.3K("7u");1L.$1Y=1d}},op={5p:1a(1L,x,y){if(2A ye!="2x"&&ye){1b}ye=1l;K $1R=$(J),2U={};$("#2W-1V-7c").1R("7T");1L.$1R=$1R;1L.x=x;1L.y=y;if(1L.4U.5p.2J($1R,1L)===1k){$8y=1d;1b}op.7R.2J($1R,1L);1L.2R.2J($1R,1L,x,y);if(1L.4u){2U.4u=Jx($1R)+1L.4u}op.7c.2J(1L.$1V,1L,2U.4u);1L.$1V.2B("ul").2U("4u",2U.4u+1);1L.$1V.2U(2U)[1L.7n.5p](1L.7n.5C,1a(){$1R.1R("5K:6v")});$1R.1h("2P",1L).2r("2W-1V-8S");$(2K).fv("8h.2P").on("8h.2P",5t.1r);if(1L.Jw){$(2K).on("bi.J2",1a(e){K 3u=$1R.2v();3u.8t=3u.2f+$1R.8b();3u.4O=3u.1M+$1R.7g();if(1L.$7c&&(!1L.yb&&(!(e.7E>=3u.2f&&e.7E<=3u.8t)||!(e.89>=3u.1M&&e.89<=3u.4O)))){1L.$1V.1R("5K:3C")}})}},3C:1a(1L,bD){K $1R=$(J);if(!1L){1L=$1R.1h("2P")||{}}if(!bD&&(1L.4U&&1L.4U.3C.2J($1R,1L)===1k)){1b}$1R.pE("2P").3K("2W-1V-8S");if(1L.$7c){6W(1a($7c){1b 1a(){$7c.3M()}}(1L.$7c),10);6E{4q 1L.$7c}6G(e){1L.$7c=1d}}$8y=1d;1L.$1V.2B(".7u").1R("5K:4W");1L.$1Y=1d;$(2K).fv(".J2").fv("8h.2P");1L.$1V&&1L.$1V[1L.7n.3C](1L.7n.5C,1a(){if(1L.9F){1L.$1V.3M();$.2p(1L,1a(1r,1o){3P(1r){1q"ns":;1q"4s":;1q"9F":;1q"1R":1b 1l;5N:1L[1r]=2x;6E{4q 1L[1r]}6G(e){}1b 1l}})}6W(1a(){$1R.1R("5K:6d")},10)});ye=1k},8J:1a(1L,2D){if(2D===2x){2D=1L}1L.$1V=$(\'<ul 2t="2W-1V-5v"></ul>\').2r(1L.da||"").1h({"2P":1L,"ai":2D});$.2p(["mC","y7","zJ"],1a(i,k){1L[k]={};if(!2D[k]){2D[k]={}}});2D.i7||(2D.i7={});$.2p(1L.1J,1a(1r,1i){K $t=$(\'<li 2t="2W-1V-1i"></li>\').2r(1i.da||""),$3H=1d,$2a=1d;$t.on("3F",$.tM);1i.$1u=$t.1h({"2P":1L,"ai":2D,"Dq":1r});if(1i.CC){K Jl=Jd(1i.CC);1p(K i=0,ak;ak=Jl[i];i++){if(!2D.i7[ak]){2D.i7[ak]=1i;1i.yo=1i.1x.3t(1T eh("("+ak+")","i"),\'<2u 2t="2W-1V-CC">$1</2u>\');1s}}}if(2A 1i=="4E"){$t.2r("2W-1V-6f 6j-jA")}1j{if(1i.1C&&mf[1i.1C]){mf[1i.1C].2J($t,1i,1L,2D);$.2p([1L,2D],1a(i,k){k.y7[1r]=1i;if($.cS(1i.1X)){k.mC[1r]=1i.1X}})}1j{if(1i.1C=="3J"){$t.2r("2W-1V-3J 6j-jA")}1j{if(1i.1C){$3H=$("<3H></3H>").4n($t);$("<2u></2u>").3J(1i.yo||1i.1x).4n($3H);$t.2r("2W-1V-2a");1L.JH=1l;$.2p([1L,2D],1a(i,k){k.y7[1r]=1i;k.zJ[1r]=1i})}1j{if(1i.1J){1i.1C="k5"}}}3P(1i.1C){1q"2g":$2a=$(\'<2a 1C="2g" 1o="1" 1x="" 1o="">\').1n("1x","2W-1V-2a-"+1r).2b(1i.1o||"").4n($3H);1s;1q"8s":$2a=$(\'<8s 1x=""></8s>\').1n("1x","2W-1V-2a-"+1r).2b(1i.1o||"").4n($3H);if(1i.1w){$2a.1w(1i.1w)}1s;1q"9h":$2a=$(\'<2a 1C="9h" 1o="1" 1x="" 1o="">\').1n("1x","2W-1V-2a-"+1r).2b(1i.1o||"").6Y("4r",!!1i.1Y).yM($3H);1s;1q"9Y":$2a=$(\'<2a 1C="9Y" 1o="1" 1x="" 1o="">\').1n("1x","2W-1V-2a-"+1i.9Y).2b(1i.1o||"").6Y("4r",!!1i.1Y).yM($3H);1s;1q"2y":$2a=$(\'<2y 1x="">\').1n("1x","2W-1V-2a-"+1r).4n($3H);if(1i.1v){$.2p(1i.1v,1a(1o,2g){$("<2T></2T>").2b(1o).2g(2g).4n($2a)});$2a.2b(1i.1Y)}1s;1q"k5":$("<2u></2u>").3J(1i.yo||1i.1x).4n($t);1i.4n=1i.$1u;op.8J(1i,2D);$t.1h("2P",1i).2r("2W-1V-CW");1i.1X=1d;1s;1q"3J":$(1i.3J).4n($t);1s;5N:$.2p([1L,2D],1a(i,k){k.y7[1r]=1i;if($.cS(1i.1X)){k.mC[1r]=1i.1X}});$("<2u></2u>").3J(1i.yo||(1i.1x||"")).4n($t);1s}if(1i.1C&&(1i.1C!="k5"&&1i.1C!="3J")){$2a.on("3k",5t.Jn).on("4W",5t.JJ);if(1i.4U){$2a.on(1i.4U,1L)}}if(1i.3V){$t.2r("3V 3V-"+1i.3V)}}}1i.$2a=$2a;1i.$3H=$3H;$t.4n(1L.$1V);if(!1L.JH&&$.gy.Jz){$t.on("15q.15p",5t.ol)}});if(!1L.$1u){1L.$1V.2U("4T","3q").2r("2W-1V-2D")}1L.$1V.4n(1L.4n||2K.3G)},62:1a($1V,JE){$1V.2U({2R:"7U",4T:"5J"});$1V.1h("1m",3A.j3($1V.1m())+1);$1V.2U({2R:"Kv",fe:"yl",a9:"15r"});$1V.2B("> li > ul").2p(1a(){op.62($(J),1l)});if(!JE){$1V.2B("ul").xM().2U({2R:"",4T:"",fe:"",a9:""}).1m(1a(){1b $(J).1h("1m")})}},7R:1a(1L,2D){K $1R=J;if(2D===2x){2D=1L;op.62(1L.$1V)}1L.$1V.5w().2p(1a(){K $1i=$(J),1r=$1i.1h("Dq"),1i=1L.1J[1r],2O=$.cS(1i.2O)&&1i.2O.2J($1R,1r,2D)||1i.2O===1l;$1i[2O?"2r":"3K"]("2O");if(1i.1C){$1i.2B("2a, 2y, 8s").6Y("2O",2O);3P(1i.1C){1q"2g":;1q"8s":1i.$2a.2b(1i.1o||"");1s;1q"9h":;1q"9Y":1i.$2a.2b(1i.1o||"").6Y("4r",!!1i.1Y);1s;1q"2y":1i.$2a.2b(1i.1Y||"");1s}}if(1i.$1V){op.7R.2J($1R,1i,2D)}})},7c:1a(1L,4u){K $l=$("#2W-1V-7c");if($l){$l.3M()}K $7c=1L.$7c=$(\'<2C id="2W-1V-7c" 2G="2R:Kx; z-1W:\'+4u+\'; 1M:0; 2f:0; 2X: 0; 43: fw(2X=0); mt-3X: #eg;"></2C>\').2U({1w:$5R.1w(),1m:$5R.1m(),4T:"5J"}).1h("ai",1L).87(J).on("5K",5t.ol).on("7T",5t.Jg);if(2K.3G.2G.a9===2x){$7c.2U({"2R":"7U","1w":$(2K).1w()})}1b $7c}};1a Jd(2b){K t=2b.3S(/\\s+/),93=[];1p(K i=0,k;k=t[i];i++){k=k.cn(0).9i();93.1G(k)}1b 93}$.fn.2P=1a(7A){if(7A===2x){J.4A().1R("5K")}1j{if(7A.x&&7A.y){J.4A().1R($.yg("5K",{7E:7A.x,89:7A.y}))}1j{if(7A==="3C"){K $1V=J.4A().1h("2P")?J.4A().1h("2P").$1V:1d;$1V&&$1V.1R("5K:3C")}1j{if(7A==="6F"){$.2P("6F",{2W:J})}1j{if(7A==="1g"){if(J.1h("2P")!=1d){1b J.1h("2P").$1V}1b[]}1j{if($.UR(7A)){7A.2W=J;$.2P("8J",7A)}1j{if(7A){J.3K("2W-1V-2O")}1j{if(!7A){J.2r("2W-1V-2O")}}}}}}}}1b J};$.2P=1a(7A,1v){if(2A 7A!="4E"){1v=7A;7A="8J"}if(2A 1v=="4E"){1v={4s:1v}}1j{if(1v===2x){1v={}}}K o=$.4D(1l,{},bn,1v||{});K $2K=$(2K);K $2W=$2K;K pS=1k;if(!o.2W||!o.2W.1f){o.2W=2K}1j{$2W=$(o.2W).4A();o.2W=$2W.4w(0);pS=o.2W!==2K}3P(7A){1q"8J":if(!o.4s){96 1T 9T("No 4s yj")}if(o.4s.3x(/.2W-1V-(5v|1i|2a)($|\\s)/)){96 1T 9T(\'15b 2S to 4s "\'+o.4s+\'" as it cW a 14S da\')}if(!o.9F&&(!o.1J||$.Jb(o.1J))){96 1T 9T("No 2Q yj")}d6++;o.ns=".2P"+d6;if(!pS){cL[o.4s]=o.ns}aM[o.ns]=o;if(!o.1R){o.1R="8t"}if(!rj){$2K.on({"5K:3C.2P":5t.Je,"Ir.2P":5t.k7,"zC.2P":5t.iU,"5K.2P":5t.ol,"mN.2P":5t.JF,"q4.2P":5t.JC},".2W-1V-5v").on("7k.2P",".2W-1V-2a",5t.JB).on({"7k.2P":5t.JM,"5K:3k.2P":5t.JI,"5K:4W.2P":5t.Jj,"5K.2P":5t.ol,"mN.2P":5t.zu,"q4.2P":5t.zN},".2W-1V-1i");rj=1l}$2W.on("5K"+o.ns,o.4s,o,5t.5K);if(pS){$2W.on("3M"+o.ns,1a(){$(J).2P("6F")})}3P(o.1R){1q"7u":$2W.on("mN"+o.ns,o.4s,o,5t.mN).on("q4"+o.ns,o.4s,o,5t.q4);1s;1q"2f":$2W.on("3F"+o.ns,o.4s,o,5t.3F);1s}if(!o.9F){op.8J(o)}1s;1q"6F":K $h2;if(pS){K 2W=o.2W;$.2p(aM,1a(ns,o){if(o.2W!==2W){1b 1l}$h2=$(".2W-1V-5v").43(":6v");if($h2.1f&&$h2.1h().ai.$1R.is($(o.2W).2B(o.4s))){$h2.1R("5K:3C",{bD:1l})}6E{if(aM[o.ns].$1V){aM[o.ns].$1V.3M()}4q aM[o.ns]}6G(e){aM[o.ns]=1d}$(o.2W).fv(o.ns);1b 1l})}1j{if(!o.4s){$2K.fv(".2P .J2");$.2p(aM,1a(ns,o){$(o.2W).fv(o.ns)});cL={};aM={};d6=0;rj=1k;$("#2W-1V-7c, .2W-1V-5v").3M()}1j{if(cL[o.4s]){$h2=$(".2W-1V-5v").43(":6v");if($h2.1f&&$h2.1h().ai.$1R.is(o.4s)){$h2.1R("5K:3C",{bD:1l})}6E{if(aM[cL[o.4s]].$1V){aM[cL[o.4s]].$1V.3M()}4q aM[cL[o.4s]]}6G(e){aM[cL[o.4s]]=1d}$2K.fv(cL[o.4s])}}}1s;1q"14L":if(!$.gy.Jv&&!$.gy.Jt||2A 1v=="p8"&&1v){$(\'1V[1C="2W"]\').2p(1a(){if(J.id){$.2P({4s:"[5K="+J.id+"]",1J:$.2P.Ja(J)})}}).2U("4T","3q")}1s;5N:96 1T 9T(\'hK 7A "\'+7A+\'"\')}1b J};$.2P.14W=1a(1L,1h){if(1h===2x){1h={}}$.2p(1L.zJ,1a(1r,1i){3P(1i.1C){1q"2g":;1q"8s":1i.1o=1h[1r]||"";1s;1q"9h":1i.1Y=1h[1r]?1l:1k;1s;1q"9Y":1i.1Y=(1h[1i.9Y]||"")==1i.1o?1l:1k;1s;1q"2y":1i.1Y=1h[1r]||"";1s}})};$.2P.155=1a(1L,1h){if(1h===2x){1h={}}$.2p(1L.zJ,1a(1r,1i){3P(1i.1C){1q"2g":;1q"8s":;1q"2y":1h[1r]=1i.$2a.2b();1s;1q"9h":1h[1r]=1i.$2a.6Y("4r");1s;1q"9Y":if(1i.$2a.6Y("4r")){1h[1i.9Y]=1i.1o}1s}});1b 1h};1a n5(1u){1b 1u.id&&$(\'3H[1p="\'+1u.id+\'"]\').2b()||1u.1x}1a Ga(1J,$5w,d6){if(!d6){d6=0}$5w.2p(1a(){K $1u=$(J),1u=J,98=J.98.49(),3H,1i;if(98=="3H"&&$1u.2B("2a, 8s, 2y").1f){3H=$1u.3J();$1u=$1u.5w().4A();1u=$1u.4w(0);98=1u.98.49()}3P(98){1q"1V":1i={1x:$1u.1n("3H"),1J:{}};d6=Ga(1i.1J,$1u.5w(),d6);1s;1q"a":;1q"3e":1i={1x:$1u.3J(),2O:!!$1u.1n("2O"),1X:1a(){1b 1a(){$1u.3F()}}()};1s;1q"JK":;1q"9l":3P($1u.1n("1C")){1q 2x:;1q"9l":;1q"JK":1i={1x:$1u.1n("3H"),2O:!!$1u.1n("2O"),1X:1a(){1b 1a(){$1u.3F()}}()};1s;1q"9h":1i={1C:"9h",2O:!!$1u.1n("2O"),1x:$1u.1n("3H"),1Y:!!$1u.1n("4r")};1s;1q"9Y":1i={1C:"9Y",2O:!!$1u.1n("2O"),1x:$1u.1n("3H"),9Y:$1u.1n("157"),1o:$1u.1n("id"),1Y:!!$1u.1n("4r")};1s;5N:1i=2x}1s;1q"hr":1i="-------";1s;1q"2a":3P($1u.1n("1C")){1q"2g":1i={1C:"2g",1x:3H||n5(1u),2O:!!$1u.1n("2O"),1o:$1u.2b()};1s;1q"9h":1i={1C:"9h",1x:3H||n5(1u),2O:!!$1u.1n("2O"),1Y:!!$1u.1n("4r")};1s;1q"9Y":1i={1C:"9Y",1x:3H||n5(1u),2O:!!$1u.1n("2O"),9Y:!!$1u.1n("1x"),1o:$1u.2b(),1Y:!!$1u.1n("4r")};1s;5N:1i=2x;1s}1s;1q"2y":1i={1C:"2y",1x:3H||n5(1u),2O:!!$1u.1n("2O"),1Y:$1u.2b(),1v:{}};$1u.5w().2p(1a(){1i.1v[J.1o]=$(J).3J()});1s;1q"8s":1i={1C:"8s",1x:3H||n5(1u),2O:!!$1u.1n("2O"),1o:$1u.2b()};1s;1q"3H":1s;5N:1i={1C:"3J",3J:$1u.6z(1l)};1s}if(1i){d6++;1J["1r"+d6]=1i}});1b d6}$.2P.Ja=1a(1g){K $J=$(1g),1J={};Ga(1J,$J.5w());1b 1J};$.2P.bn=bn;$.2P.mf=mf;$.2P.5t=5t;$.2P.op=op;$.2P.aM=aM})(2I);K NW=1a(id){J.id=id;J.1g=1d;J.2Z=1T 3R;J.pe=0;J.Hm=20;J.Hq=1a(2Z){4q J.2Z;J.2Z=1T 3R;K li=1T 3R;1p(K i=0;i<2Z.1f;i++){K 1o=2Z[i];li.1G(\'<li 1o="\'+i+\'" 2t="\'+1o.bB+\'">\'+qv(1o.2g)+"</li>");J.2Z.1G(1o.1o)}J.1g.3J("<ul>"+li.5x("\\n")+"</ul>");K me=J;J.1g.4K("7k",1a(e){K li=e.3g;if(li.6L.9i()!="LI"){1b}K $li=$(e.3g);e.6X();J.z5.z8($li.2g(),me.z5.l7(li.1o))},J).4K("7T",1a(e){e.6X()},J);J.JN();J.zv(10)};J.JN=1a(){J.1g.2U("i0","6d");J.1g.5p();K b7=J.1g.2B("li");if(b7.1f>0){J.Hm=b7[0].9n}J.1g.2U("i0","6v");J.1g.3C()};J.zv=1a(oz){if(J.1g.2B("li").1f>oz){J.pe=J.Hm*oz;J.1g.2U("1w",J.pe+"px");J.1g.2U("er","6h")}1j{J.1g.2U("1w","6h");J.1g.2U("er","6v")}};J.l7=1a(1W){1b J.2Z[1W]};J.JD=1a(){J.1g.2B("li").3K("3x")};J.IA=1a(2g){K dt=nk(2g);J.JD();K ad=J.zf(dt);$(ad).2r("3x");if(ad.1f>0){J.zr($(ad[0]))}1j{J.GY()}};J.J9=1a(2g){K dt=nk(2g);K ad=J.zf(dt);K 6t=J.lf();if(6t.1f>0&&ad.1f>1){K 1W=ad.5e(6t[0]);if(1W<ad.1f-1){1b $(ad[1W+1])}1j{1b $(ad[0])}}1b 1d};J.NY=1a(2g){K dt=nk(2g);K ad=J.zf(dt);K 6t=J.lf();if(6t.1f>0&&ad.1f>1){K 1W=ad.5e(6t[0]);if(1W>0){1b $(ad[1W-1])}1j{1b $(ad[ad.1f-1])}}1b 1d};J.zf=1a(2g){K 1O=[];if(1B(2g)){1b 1O}K e8=2g.3t(/([$-/:-?{-~!"^2j`\\[\\]\\\\])/g, "\\\\$1");K b7=J.1g.2B("li");1p(K i=0;i<b7.1f;i++){K li=b7[i];K GV=nk(!1B(li.Ji)?li.Ji:li.13V);K GT=nk(J.l7(li.1o));if(QB.1e.2e.zB){e8="(^"+2g+")|([.]"+2g+")"}if(2g==GV||2g==GT){1O.1G(li)}1j{if(GV.9z(e8)||GT.9z(e8)){1O.1G(li)}}}1b 1O};J.Hu=1a(){J.1g.2B("li.1Y").3K("1Y")};J.Gn=1a(2g,eA,iG){K li=J.lf();if(!li.1f){li=J.GY()}K gD=1d;if(eA=="f4"){if(iG){gD=J.J9(2g)}if(gD==1d){gD=li.3B()}}1j{if(eA=="up"){if(iG){gD=J.NY(2g)}if(gD==1d){gD=li.3W()}}}if(gD!=1d){J.zr(gD);J.NX(li)}};J.zr=1a(li){J.Hu();li.2r("1Y");J.O2(li)};J.GY=1a(){K 4A=J.1g.2B("li:4A");J.zr(4A);1b 4A};J.NX=1a(nT){nT.3K("1Y")};J.lf=1a(){1b J.1g.2B("li.1Y")};J.O2=1a(nT){if(J.pe&&(nT!=1d&&nT.1f>0)){J.1g.4Q(nT[0].9H-J.pe/2)}};J.8Z=1a(){J.1g=$(\'<2C 2t="d7-2y-1v"></2C>\').4n($(2K.3G))};J.8Z()};K bo={zm:{},dK:[],r6:{},Hy:1k,2W:1d,8Z:1a(){J.O1();J.Hy=1l},O1:1a(){},Hk:1a(bA){if(1B(bA)||1B(J.zm[bA])){J.zm[bA]=1T NW(bA)}1b J.zm[bA]},DQ:1a(id,2Z){J.Hk(id).Hq(2Z)}};(1a($){$.fn.J1=1a(1v){if(!bo.Hy){bo.8Z()}K me=J;K bn={ae:1k,h8:1l,oz:10,12N:1k};K 3i=$.4D(bn,1v);K gA=1k;$(J).2p(1a(i,HF){K 1g=$(HF);if(1g.1h("d7-kq")==2x){bo.dK.1G(1T HG(HF,3i));1g.1h("d7-kq",bo.dK.1f-1)}});1b $(J)};$.fn.IZ=1a(){K 8M=[];$(J).2p(1a(){if($(J).1h("d7-kq")!==2x){8M[8M.1f]=bo.dK[$(J).1h("d7-kq")]}});1b 8M};K HG=1a(2y,3i){J.8Z(2y,3i)};HG.3f={kP:1k,3i:1k,6O:1k,2y:1k,6T:1k,bA:1d,kp:1k,12W:1k,ae:1k,135:13,dt:"",134:[],iG:1k,NR:1k,8Z:1a(2y,3i){J.3i=3i;J.bA=J.3i.bA;J.6T=bo.Hk(J.bA);J.7P=J.3i.h8;if(!1B(J.bA)){bo.r6[J.bA]=J.3i.h8}J.1v=[];if(!1B(J.3i.1v)){J.1v=J.3i.1v}J.2y=$(2y);J.6O=$(\'<2a 1C="2g">\');J.6O.1n("6p-3H",J.2y.1n("6p-3H"));J.6O.2b(J.3i.1o);J.6O.1n("1x",J.2y.1n("1x"));J.6O.1h("d7-kq",J.2y.1h("d7-kq"));J.2y.1n("2O","2O");K id=J.2y.1n("id");if(!id){id="d7-2y"+bo.dK.1f}J.id=id;J.6O.1n("id",id);J.6O.1n("136","fv");J.6O.2r("d7-2y");J.2y.1n("id",id+"139");J.NQ(J.6O,J);J.NS();J.Oe();J.Oa();if(J.3i.ae){K ae=$(\'<e4 137="0" 2t="d7-2y-e4" 4L="MP:Ae;"></e4>\');$(2K.3G).2Y(ae);ae.1m(J.2y.1m()+2);ae.1w(J.6T.1g.1w());ae.2U({1M:J.6T.1g.2U("1M"),2f:J.6T.1g.2U("2f")});J.ae=ae}},NS:1a(){K me=J;K 12Y=1k;K 2Z=1T 3R;J.2y.2B("2T").2p(1a(1W,2T){K $2T=$(2T);K 2g=$2T.2g();K 2b=$2T.1n("1o");K 1Y=1k;if($2T.1n("1Y")||2T.1Y){me.6O.2b(2g);me.dt=2g;me.NU=2b;1Y=1l}K bB=$2T.1n("2t");2Z.1G({1Y:1Y,2g:2g,1o:2b,bB:bB})});if(2Z.1f>0){J.6T.Hq(2Z);J.6T.1g.2r("zG-VY");J.6T.zv(J.3i.oz)}},IX:1a(){1b J.6O},h8:1a(e){K 2W=J.6T.z5;if(2A 2W.7P=="1a"){2W.7P.2J(2W,2W.6O,e)}},Ge:1a(){if(J.kP){1b}J.kP=1l;J.dt=J.6O.2b();J.iG=1k;J.Iu(J);if(J.NR){J.pW()}},kr:1a(e){if(!J.kP){1b}J.6T.Hu();J.wv();J.h8(e);J.kP=1k},NV:1a(130){if(J.6O.2b()!=J.dt){J.iG=1l;J.dt=J.6O.2b();J.6T.IA(J.6O.2b())}},NQ:1a(6O,12u){K me=J;K a8=1k;6O.3k(1a(e){me.Ge()}).4W(1a(e){if(!me.kp){me.kr(e)}}).3F(1a(e){e.6X();me.Ge();if(e.7E-$(J).2v().2f>$(J).1m()-16){if(me.kp){me.wv()}1j{me.pW()}}}).8h(1a(e){me.kP=1l;3P(e.3Z){1q 40:if(!me.z3()){me.pW()}1j{e.4H();me.6T.Gn(me.6O.2b(),"f4",me.iG)}1s;1q 38:if(me.z3()){e.4H();me.6T.Gn(me.6O.2b(),"up",me.iG)}1j{me.pW()}1s;1q 9:if(me.z3()){K $li=me.6T.lf();if($li.1f){me.z8($li.2g(),me.l7($li[0].1o))}}1j{me.kr()}1s;1q 27:e.4H();me.kr();1b 1k;1s;1q 13:e.4H();if(me.kp){K $li=me.6T.lf();if($li.1f){me.z8($li.2g(),me.l7($li[0].1o))}}1j{me.kr()}1b 1k;1s}}).qW($.ih(me.NV,100,me)).iZ(1a(e){if(e.3Z==13){e.4H();1b 1k}})},z8:1a(2g,2b){J.dt=2g;J.NU=2b;J.6O.2b(2b);J.kr()},z3:1a(){1b J.kp},Iu:1a(2W){J.NT();J.O3();bo.2W=2W;J.6T.z5=2W},NT:1a(){K 2v=J.6O.2v();2v.1M+=J.6O[0].9n;J.6T.1g.2U({1M:2v.1M+"px",2f:2v.2f+"px"})},O3:1a(){K 1m=J.6O[0].ma;J.6T.1g.1m(1m)},pW:1a(){J.Og();J.8k=1T $.ui.eR.8k(J);J.6T.1g.5p();J.Iu(J);J.kp=1l;if(J.3i.ae){J.ae.5p()}J.6T.zv(10);J.6T.IA(J.6O.2b())},l7:1a(1W){1b J.6T.2Z[1W]},wv:1a(){if(J.8k!=1d){J.8k.6F()}J.6T.1g.3C();J.kp=1k;if(J.3i.ae){J.ae.3C()}},Og:1a(){1p(K i=0;i<bo.dK.1f;i++){if(i!=J.2y.1h("d7-kq")){bo.dK[i].wv()}}},Oe:1a(){J.2y.xc(J.6O);J.2y.3C();$(2K.3G).2Y(J.6T.1g)},Oa:1a(){K 1m=J.2y.1m()+2*0;if(J.ae){J.ae.1m(1m+4)}}};$.ui.eR={8k:1a(3T){J.$el=$.ui.eR.8k.8J(3T)}};$.4D($.ui.eR.8k,{2H:J,dK:[],12J:[],f3:12I,4U:$.bC("3k,7T,8h,iZ".3S(","),1a(1N){1b 1N+".3T-8k"}).5x(" "),8J:1a(3T){if(J.dK.1f===0){$(3z).2S("62.3T-8k",$.ui.eR.8k.62)}K $el=$(\'<2C 2t="d7-2y-1v-8k"></2C>\').4n(3T.6O.1P()).2U({1m:J.1m(),1w:J.1w()});$el.2S("7T.3T-8k",1a(1N){3T.kr();K 1g=2K.ss(1N.d0,1N.cT);if(1g!=1d){6E{K ey="3F";if(1g.Ii){K e=2K.O6("12D");e.O5(ey,1l,1l,3z,0,1N.O4,1N.O9,1N.d0,1N.cT,1k,1k,1k,1k,0,1d);1g.Ii(e)}1j{if(1g.O8){1g.O8("on"+ey)}}}6G(13H){}}});if($.fn.gd){$el.gd()}J.dK.1G($el);1b $el},6F:1a($el){if($el!=1d){$el.3M()}if(J.dK.1f===0){$([2K,3z]).8W(".3T-8k")}},1w:1a(){K fS,9n;1b $(2K).1w()+"px"},1m:1a(){K sk,hj;1b $(2K).1m()+"px"},62:1a(){K $wn=$([]);$.2p($.ui.eR.8k.dK,1a(){$wn=$wn.5F(J)});$wn.2U({1m:0,1w:0}).2U({1m:$.ui.eR.8k.1m(),1w:$.ui.eR.8k.1w()})}});$.4D($.ui.eR.8k.3f,{6F:1a(){$.ui.eR.8k.6F(J.$el)}})})(2I);(1a($){K R=$.7W=$.fn.7W=1a(a,b,c){1b R.Iz(k2.3w(J,2F))};1a k2(a,b,c){K r=$.4D({},R);if(2A a=="4E"){r.5k=a;if(b&&!$.cS(b)){r.g4=b}1j{c=b}if(c){r.xQ=c}}1j{$.4D(r,a)}if(!r.3g){r.3g=J?J:$}if(!r.1C&&!$.13y){r.1C="13A"}1b r}$.4D(R,{6P:"0.5",5k:1d,g4:178,xQ:1d,4h:1d,Iz:1a(r){if(r.nW){r.nW()}r.id=pG(1a(){r.7W(r)},r.g4*9m);r.nW=1a(){wI(r.id);1b r};1b r},7W:1a(r){if(r.Iv){4q r.Iv}r.Iv=r.3g["zR"](r)}})})(2I);2I.4N={dI:1d,bv:1d,wK:1d,wz:0,9F:1a(1v){J.2p(1a(){J.d8=2I.4D({Nx:1d,NA:1d,s7:"13J",zq:1d,om:1d,oR:5,DX:/[^\\-]*$/,13R:1d,pg:1d},1v||{});2I.4N.DJ(J)});2I(2K).2S("bi",2I.4N.bi).2S("7k",2I.4N.7k);1b J},DJ:1a(1H){K 7q=1H.d8;if(1H.d8.pg){$(2K).on("7T","#qb-ui-4k td."+1H.d8.pg,1a(ev){if($(ev.7a).7s("tr:4A").3B().1f==0){1b}2I.4N.bv=J.3l;2I.4N.dI=1H;2I.4N.wK=2I.4N.DF(J,ev);if(7q.om){7q.om(1H,J)}1b 1k})}1j{$(2K).on("7T","#qb-ui-4k 1H td."+1H.d8.pg,1a(ev){if(ev.3g.6L=="TD"){2I.4N.bv=J;2I.4N.dI=1H;2I.4N.wK=2I.4N.DF(J,ev);if(7q.om){7q.om(1H,J)}1b 1k}})}},Ny:1a(){J.2p(1a(){if(J.d8){2I.4N.DJ(J)}})},DL:1a(ev){if(ev.7E||ev.89){1b{x:ev.7E,y:ev.89}}1b{x:ev.d0+2K.3G.54-2K.3G.nl,y:ev.cT+2K.3G.4Q-2K.3G.nG}},DF:1a(3g,ev){ev=ev||3z.1N;K DG=J.wD(3g);K k4=J.DL(ev);1b{x:k4.x-DG.x,y:k4.y-DG.y}},wD:1a(e){K 2f=0;K 1M=0;if(e.9n==0){e=e.8E}4x(e.fD){2f+=e.91;1M+=e.9H;e=e.fD}2f+=e.91;1M+=e.9H;1b{x:2f,y:1M}},bi:1a(ev){if(2I.4N.bv==1d){1b}K wC=2I(2I.4N.bv);K 7q=2I.4N.dI.d8;K k4=2I.4N.DL(ev);K y=k4.y-2I.4N.wK.y;K oS=3z.MU;if(2K.73){if(2A 2K.O7!="2x"&&2K.O7!="13P"){oS=2K.9k.4Q}1j{if(2A 2K.3G!="2x"){oS=2K.3G.4Q}}}if(k4.y-oS<7q.oR){3z.HB(0,-7q.oR)}1j{K NP=3z.kQ?3z.kQ:2K.9k.mc?2K.9k.mc:2K.3G.mc;if(NP-(k4.y-oS)<7q.oR){3z.HB(0,7q.oR)}}if(y!=2I.4N.wz){K Ds=y>2I.4N.wz;2I.4N.wz=y;if(7q.s7){wC.2r(7q.s7)}1j{wC.2U(7q.Nx)}K k8=2I.4N.Nw(wC,y);if(k8&&k8.da!="ui-qb-4k-1I-7O"){if(Ds&&2I.4N.bv!=k8){2I.4N.bv.3l.87(2I.4N.bv,k8.jE)}1j{if(!Ds&&2I.4N.bv!=k8){2I.4N.bv.3l.87(2I.4N.bv,k8)}}}}1b 1k},Nw:1a(Dz,y){K 3o=2I.4N.dI.3o;1p(K i=0;i<3o.1f;i++){K 1I=3o[i];if($(1I).3B().1f==0){1b}K w0=J.wD(1I).y;K vX=6u(1I.9n)/2;if(1I.9n==0){w0=J.wD(1I.8E).y;vX=6u(1I.8E.9n)/2}if(y>w0-vX&&y<w0+vX){if(1I==Dz){1b 1d}K 7q=2I.4N.dI.d8;if(7q.Nv){if(7q.Nv(Dz,1I)){1b 1I}1j{1b 1d}}1j{K DA=2I(1I).4J("DA");if(!DA){1b 1I}1j{1b 1d}}1b 1I}}1b 1d},7k:1a(e){if(2I.4N.dI&&2I.4N.bv){K wc=2I.4N.bv;K 7q=2I.4N.dI.d8;if(7q.s7){2I(wc).3K(7q.s7)}1j{2I(wc).2U(7q.NA)}2I.4N.bv=1d;if(7q.zq){7q.zq(2I.4N.dI,wc)}2I.4N.dI=1d}},Ed:1a(){if(2I.4N.dI){1b 2I.4N.DZ(2I.4N.dI)}1j{1b"9T: No aU id 5U, IV WX to 5U an id on Wx 1H qV pC 1I"}},DZ:1a(1H){K 1O="";K Nz=1H.id;K 3o=1H.3o;1p(K i=0;i<3o.1f;i++){if(1O.1f>0){1O+="&"}K lN=3o[i].id;if(lN&&(lN&&(1H.d8&&1H.d8.DX))){lN=lN.3x(1H.d8.DX)[0]}1O+=Nz+"[]="+lN}1b 1O},Nu:1a(){K 1O="";J.2p(1a(){1O+=2I.4N.DZ(J)});1b 1O}};2I.fn.4D({4N:2I.4N.9F,13N:2I.4N.Ny,13x:2I.4N.Nu});(1a($){$.8z("ui.3L",{1v:{4n:"3G",OR:9m,2G:"iX",P5:1d,1m:1d,sU:1d,OT:26,9s:1d,dM:1d,7p:1d,Pd:1k,sL:1a(){}},ov:1a(){K 2H=J,o=J.1v;K wb=J.1g.13h().1n("id");J.fG=[wb,wb+"-3e",wb+"-1V"];J.yH=1l;J.ls=1k;J.7b=$("<a />",{"2t":"ui-3L ui-8z ui-4P-5N ui-bd-73","id":J.fG[1],"iT":"3e","5B":"#EA","6U":J.1g.1n("2O")?1:0,"6p-13i":1l,"6p-13k":J.fG[2]});J.F6=$("<2u />").2Y(J.7b).gN(J.1g);K 6U=J.1g.1n("6U");if(6U){J.7b.1n("6U",6U)}J.7b.1h("P0",J.1g);J.OY=$(\'<2u 2t="ui-3L-3V ui-3V"></2u>\').yM(J.7b);J.7b.nE(\'<2u 2t="ui-3L-7l" />\');J.1g.2S({"3F.3L":1a(1N){2H.7b.3k();1N.4H()}});J.7b.2S("7T.3L",1a(1N){2H.EV(1N,1l);if(o.2G=="nq"){2H.yH=1k;6W(1a(){2H.yH=1l},vK)}1N.4H()}).2S("3F.3L",1a(1N){1N.4H()}).2S("8h.3L",1a(1N){K 8M=1k;3P(1N.3Z){1q $.ui.3Z.NO:8M=1l;1s;1q $.ui.3Z.NN:2H.EV(1N);1s;1q $.ui.3Z.UP:if(1N.wg){2H.7F(1N)}1j{2H.lx(-1)}1s;1q $.ui.3Z.Nn:if(1N.wg){2H.7F(1N)}1j{2H.lx(1)}1s;1q $.ui.3Z.Ns:2H.lx(-1);1s;1q $.ui.3Z.Nr:2H.lx(1);1s;1q $.ui.3Z.NM:8M=1l;1s;1q $.ui.3Z.NL:;1q $.ui.3Z.NB:2H.1W(0);1s;1q $.ui.3Z.NK:;1q $.ui.3Z.NJ:2H.1W(2H.9o.1f);1s;5N:8M=1l}1b 8M}).2S("iZ.3L",1a(1N){if(1N.lP>0){2H.EN(1N.lP,"7k")}1b 1l}).2S("hi.3L",1a(){if(!o.2O){$(J).2r("ui-4P-7u")}}).2S("fB.3L",1a(){if(!o.2O){$(J).3K("ui-4P-7u")}}).2S("3k.3L",1a(){if(!o.2O){$(J).2r("ui-4P-3k")}}).2S("4W.3L",1a(){if(!o.2O){$(J).3K("ui-4P-3k")}});$(2K).2S("7T.3L-"+J.fG[0],1a(1N){if(2H.ls&&!$(1N.3g).jK("#"+2H.fG[1]).1f){2H.6n(1N)}});J.1g.2S("3F.3L",1a(){2H.qM()}).2S("3k.3L",1a(){if(2H.7b){2H.7b[0].3k()}});if(!o.1m){o.1m=J.1g.8b()}J.7b.1m(o.1m);J.1g.3C();J.5v=$("<ul />",{"2t":"ui-8z ui-8z-dm","6p-6d":1l,"iT":"13j","6p-13f":J.fG[1],"id":J.fG[2]});J.j9=$("<2C />",{"2t":"ui-3L-1V"}).2Y(J.5v).4n(o.4n);J.5v.2S("8h.3L",1a(1N){K 8M=1k;3P(1N.3Z){1q $.ui.3Z.UP:if(1N.wg){2H.6n(1N,1l)}1j{2H.gL(-1)}1s;1q $.ui.3Z.Nn:if(1N.wg){2H.6n(1N,1l)}1j{2H.gL(1)}1s;1q $.ui.3Z.Ns:2H.gL(-1);1s;1q $.ui.3Z.Nr:2H.gL(1);1s;1q $.ui.3Z.NB:2H.gL(":4A");1s;1q $.ui.3Z.NL:2H.EY("up");1s;1q $.ui.3Z.NK:2H.EY("f4");1s;1q $.ui.3Z.NJ:2H.gL(":7Y");1s;1q $.ui.3Z.NO:;1q $.ui.3Z.NN:2H.6n(1N,1l);$(1N.3g).7s("li:eq(0)").1R("7k");1s;1q $.ui.3Z.NM:8M=1l;2H.6n(1N,1l);$(1N.3g).7s("li:eq(0)").1R("7k");1s;1q $.ui.3Z.13w:2H.6n(1N,1l);1s;5N:8M=1l}1b 8M}).2S("iZ.3L",1a(1N){if(1N.lP>0){2H.EN(1N.lP,"3k")}1b 1l}).2S("7T.3L 7k.3L",1a(){1b 1k});$(3z).2S("62.3L-"+J.fG[0],$.bs(2H.6n,J))},B0:1a(){K 2H=J,o=J.1v;K 9f=[];J.1g.2B("2T").2p(1a(){K 1L=$(J);9f.1G({1o:1L.1n("1o"),2g:2H.P8(1L.2g(),1L),1Y:1L.1n("1Y"),2O:1L.1n("2O"),iw:1L.1n("2t"),rQ:1L.1n("rQ"),rK:1L.1P("Es"),sL:o.sL.2J(1L)})});K n3=2H.1v.2G=="nq"?" ui-4P-8S":"";J.5v.3J("");if(9f.1f){1p(K i=0;i<9f.1f;i++){K Fb={iT:"FA"};if(9f[i].2O){Fb["2t"]="ui-4P-2O"}K w4={3J:9f[i].2g||"&2q;",5B:"#EA",6U:-1,iT:"2T","6p-1Y":1k};if(9f[i].2O){w4["6p-2O"]=1l}if(9f[i].rQ){w4["rQ"]=9f[i].rQ}K NI=$("<a/>",w4).2S("3k.3L",1a(){$(J).1P().hi()}).2S("4W.3L",1a(){$(J).1P().fB()});K iJ=$("<li/>",Fb).2Y(NI).1h("1W",i).2r(9f[i].iw).1h("j6",9f[i].iw||"").2S("7k.3L",1a(1N){if(2H.yH&&(!2H.ra(1N.7a)&&!2H.ra($(1N.7a).7s("ul > li.ui-3L-d9 ")))){2H.1W($(J).1h("1W"));2H.2y(1N);2H.6n(1N,1l)}1b 1k}).2S("3F.3L",1a(){1b 1k}).2S("hi.3L",1a(e){if(!$(J).4J("ui-4P-2O")&&!$(J).1P("ul").1P("li").4J("ui-4P-2O")){e.NE=2H.1g[0].1v[$(J).1h("1W")].1o;2H.9q("7u",e,2H.gn());2H.dv().2r(n3);2H.qG().3K("ui-3L-1i-3k ui-4P-7u");$(J).3K("ui-4P-8S").2r("ui-3L-1i-3k ui-4P-7u")}}).2S("fB.3L",1a(e){if($(J).is(2H.dv())){$(J).2r(n3)}e.NE=2H.1g[0].1v[$(J).1h("1W")].1o;2H.9q("4W",e,2H.gn());$(J).3K("ui-3L-1i-3k ui-4P-7u")});if(9f[i].rK.1f){K w9="ui-3L-d9-"+J.1g.2B("Es").1W(9f[i].rK);if(J.5v.2B("li."+w9).1f){J.5v.2B("li."+w9+":7Y ul").2Y(iJ)}1j{$(\'<li iT="FA" 2t="ui-3L-d9 \'+w9+(9f[i].rK.1n("2O")?" "+\'ui-4P-2O" 6p-2O="1l"\':\'"\')+\'><2u 2t="ui-3L-d9-3H">\'+9f[i].rK.1n("3H")+"</2u><ul></ul></li>").4n(J.5v).2B("ul").2Y(iJ)}}1j{iJ.4n(J.5v)}if(o.dM){1p(K j in o.dM){if(iJ.is(o.dM[j].2B)){iJ.1h("j6",9f[i].iw+" ui-3L-NC").2r("ui-3L-NC");K uW=o.dM[j].3V||"";iJ.2B("a:eq(0)").nE(\'<2u 2t="ui-3L-1i-3V ui-3V \'+uW+\'"></2u>\');if(9f[i].sL){iJ.2B("2u").2U("mt-ac",9f[i].sL)}}}}}}1j{$(\'<li iT="FA"><a 5B="#EA" 6U="-1" iT="2T"></a></li>\').4n(J.5v)}K iD=o.2G=="iX";J.7b.8L("ui-3L-iX",iD).8L("ui-3L-nq",!iD);J.5v.8L("ui-3L-1V-iX ui-bd-4O",iD).8L("ui-3L-1V-nq ui-bd-73",!iD).2B("li:4A").8L("ui-bd-1M",!iD).5d().2B("li:7Y").2r("ui-bd-4O");J.OY.8L("ui-3V-qf-1-s",iD).8L("ui-3V-qf-2-n-s",!iD);if(o.2G=="iX"){J.5v.1m(o.sU?o.sU:o.1m)}1j{J.5v.1m(o.sU?o.sU:o.1m-o.OT)}if(!c7.ge.3x(/XB 2/)){K OO=J.j9.1w();K ET=$(3z).1w();K EK=o.9s?3A.6e(o.9s,ET):ET/3;if(OO>EK){J.5v.1w(EK)}}J.9o=J.5v.2B("li:6j(.ui-3L-d9)");if(J.1g.1n("2O")){J.zG()}1j{J.Pc()}J.qM();J.dv().2r("ui-3L-1i-3k");hg(J.ON);J.ON=3z.6W(1a(){2H.EC()},gj)},6F:1a(){J.1g.pE(J.YF).3K("ui-3L-2O"+" "+"ui-4P-2O").ng("6p-2O").8W(".3L");$(3z).8W(".3L-"+J.fG[0]);$(2K).8W(".3L-"+J.fG[0]);J.F6.3M();J.j9.3M();J.1g.8W(".3L").5p();$.HN.3f.6F.3w(J,2F)},EN:1a(FR,F4){K 2H=J,c=61.G0(FR).49(),si=1d,f0=1d;if(2H.sh){3z.hg(2H.sh);2H.sh=2x}2H.j1=(2H.j1===2x?"":2H.j1).4e(c);if(2H.j1.1f<2||2H.j1.7z(-2,1)===c&&2H.sB){2H.sB=1l;si=c}1j{2H.sB=1k;si=2H.j1}K dF=(F4!=="3k"?J.dv().1h("1W"):J.qG().1h("1W"))||0;1p(K i=0;i<J.9o.1f;i++){K OS=J.9o.eq(i).2g().7z(0,si.1f).49();if(OS===si){if(2H.sB){if(f0===1d){f0=i}if(i>dF){f0=i;1s}}1j{f0=i}}}if(f0!==1d){J.9o.eq(f0).2B("a").1R(F4)}2H.sh=3z.6W(1a(){2H.sh=2x;2H.j1=2x;2H.sB=2x},2H.1v.OR)},gn:1a(){K 1W=J.1W();1b{1W:1W,2T:$("2T",J.1g).4w(1W),1o:J.1g[0].1o}},7F:1a(1N){if(J.7b.1n("6p-2O")!="1l"){K 2H=J,o=J.1v,1Y=J.dv(),2k=1Y.2B("a");2H.OQ(1N);2H.7b.2r("ui-4P-8S");2H.5v.1n("6p-6d",1k);2H.j9.2r("ui-3L-7F");if(o.2G=="iX"){2H.7b.3K("ui-bd-73").2r("ui-bd-1M")}1j{J.5v.2U("2f",-YC).4Q(J.5v.4Q()+1Y.2R().1M-J.5v.7g()/ 2 + 1Y.7g() /2).2U("2f","6h")}2H.EC();if(2k.1f){2k[0].3k()}2H.ls=1l;2H.9q("7F",1N,2H.gn())}},6n:1a(1N,xH){if(J.7b.is(".ui-4P-8S")){J.7b.3K("ui-4P-8S");J.j9.3K("ui-3L-7F");J.5v.1n("6p-6d",1l);if(J.1v.2G=="iX"){J.7b.3K("ui-bd-1M").2r("ui-bd-73")}if(xH){J.7b.3k()}J.ls=1k;J.9q("6n",1N,J.gn())}},dp:1a(1N){J.1g.1R("dp");J.9q("dp",1N,J.gn())},2y:1a(1N){if(J.ra(1N.7a)){1b 1k}J.9q("2y",1N,J.gn())},8z:1a(){1b J.j9.5F(J.F6)},OQ:1a(1N){$(".ui-3L.ui-4P-8S").6j(J.7b).2p(1a(){$(J).1h("P0").3L("6n",1N)});$(".ui-3L.ui-4P-7u").1R("fB")},EV:1a(1N,xH){if(J.ls){J.6n(1N,xH)}1j{J.7F(1N)}},P8:1a(2g,1L){if(J.1v.7p){2g=J.1v.7p(2g,1L)}1j{if(J.1v.Pd){2g=$("<2C />").2g(2g).3J()}}1b 2g},wS:1a(){1b J.1g[0].dF},dv:1a(){1b J.9o.eq(J.wS())},qG:1a(){1b J.5v.2B(".ui-3L-1i-3k")},lx:1a(bh,wR){if(!J.1v.2O){K x7=6u(J.dv().1h("1W")||0,10);K 5M=x7+bh;if(5M<0){5M=0}if(5M>J.9o.4l()-1){5M=J.9o.4l()-1}if(5M===wR){1b 1k}if(J.9o.eq(5M).4J("ui-4P-2O")){bh>0?++bh:--bh;J.lx(bh,5M)}1j{J.9o.eq(5M).1R("hi").1R("7k")}}},gL:1a(bh,wR){if(!9B(bh)){K x7=6u(J.qG().1h("1W")||0,10);K 5M=x7+bh}1j{K 5M=6u(J.9o.43(bh).1h("1W"),10)}if(5M<0){5M=0}if(5M>J.9o.4l()-1){5M=J.9o.4l()-1}if(5M===wR){1b 1k}K mQ="ui-3L-1i-"+3A.5m(3A.lV()*9m);J.qG().2B("a:eq(0)").1n("id","");if(J.9o.eq(5M).4J("ui-4P-2O")){bh>0?++bh:--bh;J.gL(bh,5M)}1j{J.9o.eq(5M).2B("a:eq(0)").1n("id",mQ).3k()}J.5v.1n("6p-P3",mQ)},EY:1a(eA){K q9=3A.bf(J.5v.7g()/J.9o.4A().7g());q9=eA=="up"?-q9:q9;J.gL(q9)},s4:1a(1r,1o){J.1v[1r]=1o;if(1r=="2O"){if(1o){J.6n()}J.1g.5F(J.7b).5F(J.5v)[1o?"2r":"3K"]("ui-3L-2O "+"ui-4P-2O").1n("6p-2O",1o).1n("6U",1o?1:0)}},zG:1a(1W,1C){if(2A 1W=="2x"){J.s4("2O",1l)}1j{J.Eu(1C||"2T",1W,1k)}},Pc:1a(1W,1C){if(2A 1W=="2x"){J.s4("2O",1k)}1j{J.Eu(1C||"2T",1W,1l)}},ra:1a(4f){1b $(4f).4J("ui-4P-2O")},Eu:1a(1C,1W,x9){K 1g=J.1g.2B(1C).eq(1W),b7=1C==="Es"?J.5v.2B("li.ui-3L-d9-"+1W):J.9o.eq(1W);if(b7){b7.8L("ui-4P-2O",!x9).1n("6p-2O",!x9);if(x9){1g.ng("2O")}1j{1g.1n("2O","2O")}}},1W:1a(5M){if(2F.1f){if(!J.ra($(J.9o[5M]))&&5M!=J.wS()){J.1g[0].dF=5M;J.qM();J.dp()}1j{1b 1k}}1j{1b J.wS()}},1o:1a(4z){if(2F.1f&&4z!=J.1g[0].1o){J.1g[0].1o=4z;J.qM();J.dp()}1j{1b J.1g[0].1o}},qM:1a(){K n3=J.1v.2G=="nq"?" ui-4P-8S":"";K mQ="ui-3L-1i-"+3A.5m(3A.lV()*9m);J.5v.2B(".ui-3L-1i-1Y").3K("ui-3L-1i-1Y"+n3).2B("a").1n("6p-1Y","1k").1n("id","");J.dv().2r("ui-3L-1i-1Y"+n3).2B("a").1n("6p-1Y","1l").1n("id",mQ);K P7=J.7b.1h("j6")?J.7b.1h("j6"):"";K EE=J.dv().1h("j6")?J.dv().1h("j6"):"";J.7b.3K(P7).1h("j6",EE).2r(EE).2B(".ui-3L-7l").3J(J.dv().2B("a:eq(0)").3J());J.5v.1n("6p-P3",mQ)},EC:1a(){K o=J.1v,wd={of:J.7b,my:"2f 1M",at:"2f 4O",jB:"l0"};if(o.2G=="nq"){K 1Y=J.dv();wd.my="2f 1M"+(J.5v.2v().1M-1Y.2v().1M-(J.7b.7g()+1Y.7g())/2);wd.jB="cP"}J.j9.ng("2G").4u(J.1g.4u()+2).2R($.4D(wd,o.P5))}})})(2I);(1a(bG){if(2A aV==="1a"&&aV.vg){aV(["fJ"],bG)}1j{bG(2I)}})(1a($){K 1H=$.8z("aw.1H",{YH:1,P4:0,Ov:1k,Ou:1k,Z5:"<1H>",Fk:1k,9V:1d,lc:1d,dJ:1d,nS:1d,w8:1k,7r:[24,24,24,120,80,90,100,100,85,70,60,40,40],1v:{dR:["y"],9D:{5f:1d,rX:1d,os:1d},1m:1d,1w:1d,HV:1l},gC:1a(e){K $e;if(e.1f){$e=e;e=e[0]}1j{$e=$(e)}if(e.2G.4T=="3q"){if(1B(e.2G.1m)){1b 0}1b 6u(e.2G.1m)}1b $e.8b()},j7:1a(e,1m,nh,Ot){if(1m==0){1b}K $e;if(e.1f){$e=e;e=e[0]}1j{$e=$(e)}if(nh==2x||nh==1d){if(e.2G.4T!="3q"){nh=$e.8b()-$e.1m()}1j{nh=J.P4}}K OM=1m-nh;$e.1m(OM);if(Ot){}},On:1a(e){1b $(e).7g()},Oj:1a(aL,cR){K b1=J.Os(aL,cR);if(b1!=1d){if(b1.2G.4T=="3q"||(!1B(b1.jc["9c"])||b1.jE==1d)){b1=1d}}1b b1},Os:1a(aL,cR){K gx=0;K FL=0;1p(K i=0;i<cR.1f;i++){K $th=cR[i];gx=i+FL;if($th.jc["9c"]){K 2u=0+$th.jc["9c"].1o-1;if(gx<=aL&&aL<=gx+2u){1b $th}FL+=2u}if(gx==aL){1b $th}}1b 1d},yB:1a(){K 3h=J;K 1O=J.nr().bC(1a(i,e){K 1m=0;if(e.2G.4T=="3q"){1m=$(e).8b()}1j{1m=3h.gC(e)}if(1m<=2){1m=3h.7r[i]}1b 1m}).4w();1b 1O},YD:1a(){if(J.dJ==1d){J.dJ=J.1g.2B("> eU > tr:4A-zo").4A()}if(J.dJ.1f==0){J.dJ=0}1b J.dJ},mR:1a(){if(J.dJ==1d){J.dJ=J.1g.1P().2B(".hD-eU > eU > tr:4A-zo").4A()}if(J.dJ.1f==0){J.dJ=0}1b J.dJ},Ow:1a(){if(J.9V==1d){J.9V=J.1g.2B("9V")}if(J.9V.1f==0){J.9V=1d}1b J.9V},OF:1a(){if(J.nS==1d){J.nS=J.1g.2B("> ep:4A")}if(J.nS.1f==0){J.nS=1d}1b J.nS},ja:1a(){if(J.lc==1d){J.lc=J.1g}if(J.lc.1f==0){J.lc=1d}1b J.lc},Oq:1a(){1b J.1g.2B("> ep tr.ui-qb-4k-1I:4A-zo")},rf:1a(){1b J.mR().5w()},nr:1a(){1b J.Oq().5w()},r0:1a(){K 9V=J.Ow();if(9V==1d){1b[]}1b 9V.5w()},OB:1a(1g){K $1g=$(1g);1b{"x":$1g.8b()<$1g.6Y("sk"),"y":$1g.7g()<$1g.6Y("fS")}},qX:1a(){if(J.Ov){1b 1l}if(J.Ou){1b 1k}K 1g=J.1g.1P()[0];K 9n=1g.9n;if(9n==0){9n=1g.mc}1b 9n<1g.fS},yf:1a(aS){K 3h=J;if(aS==2x){aS=J.qX()}J.y8(J.j2(),aS);K 9c=0;J.rf().2p(1a(i,e){K gx=i+9c;K 1m=0;if(e.jc["9c"]){K 2u=0+e.jc["9c"].1o-1;1p(K j=0;j<=2u;j++){1m+=3h.5j[gx+j]}9c+=2u}1j{1m=3h.5j[gx]}if(gx==3h.5j.1f-1){}3h.j7(e,1m,1d,1l)})},z7:1a(){J.CF();J.y8()},xO:1a(){J.ja().2U("4o-1m","100%");J.Op();J.5j=J.yB();J.ja().2U("4o-1m","yl");J.yt();J.yf()},yt:1a(){K 3h=J;J.r0().2p(1a(i,e){if(3h.5j[i]>0){3h.j7(e,3h.5j[i])}})},Op:1a(){K 3h=J;J.r0().1m("6h")},FW:1a(5j){1b},CF:1a(){K 3h=J;K de=J.qX();if(de&&!J.w8){K FD=J.1g.1P().1m();K w=J.1g.8b();if(w==0){w=J.1g.1m()}if(w>0&&(FD>0&&w<=FD)){K FU=3h.5j[0]+3h.5j[1]+3h.5j[2];K 81=(J.1g.1P()[0].ma-FU-1)/(w-FU);1p(K i=3;i<3h.5j.1f;i++){3h.5j[i]=3h.5j[i]*81}}}if(de){J.w8=1l}J.yt();3h.5j=J.Oi();J.FW(3h.5j);J.yf();J.1g.2U("4o-1m","yl");J.$z0.2U("4o-1m","yl");3h.5j=J.Ol();J.FW(3h.5j);J.yt();J.yf();J.FM(J.5j)},Ol:1a(){K 3h=J;K cR=J.rf();K 1O=J.nr().bC(1a(i,e){K 1m=0;if(e.2G.4T=="3q"){1m=$(e).8b()}1j{1m=3h.gC(e)}K b1=3h.Oj(i,cR);if(b1){K lL=3h.gC(b1);1m=3A.4o(1m,lL)}1b 1m}).4w();1b 1O},Oi:1a(){K 3h=J;K 1O=J.nr().bC(1a(i,e){K 1m=0;if(e.2G.4T=="3q"){1m=$(e).8b()}1j{1m=3h.gC(e)}if(1m<=2&&!3h.1g.is(":6v")){1m=3h.7r[i]}1b 1m}).4w();1b 1O},j2:1a(5j){if(5j==2x){5j=J.5j}K cf=0;K 6q=J.r0();1p(K i=0;i<5j.1f;i++){if(6q.1f<i&&(6q[i]!=1d&&6q[i].2G.4T=="3q")){cf+=0}1j{cf+=5j[i]}}1b cf},mJ:1a(1m,aS){if(1m==2x){1m=J.5j}if(3R.cD(1m)){1m=J.j2(1m)}J.FM(1m);J.y8(1m,aS)},FM:1a(1m){1b;if(1m==2x){1m=J.5j}if(3R.cD(1m)){1m=J.j2(1m)}K 3G=J.ja();3G.1m(1m)},y8:1a(1m,aS){1b;if(1m==2x){1m=J.5j}if(3R.cD(1m)){1m=J.j2(1m)}if(aS==2x){aS=J.qX()}K dJ=J.mR();K lL=1m+(aS?J.Oo:0);lL=lL;J.1g.1P().2B(".hD-eU").1m(lL)},Z6:1a(){if(J.FQ==1d){J.FQ=J.1g.2B("> ep")}1b J.FQ},De:1a(){K Z7=J.1g.1w()-J.1g.2B("eU").bC(1a(i,e){1b $(e).1f?$(e).7g():0}).4w().tC(1a(3W,6t){1b 3W+6t},0)},OG:1a(kO){K 9V=$("<9V/>");K cR=J.nr();1p(K i=0;i<cR.1f;i++){K 3O=$(cR[i]);K ik=$("<ik />");K 9c=3O.1n("9c");if(1B(9c)){9c=1}1j{9c=6u(9c)}ik.1n("2u",9c);ik.1n("2t",3O.1n("2t"));if(3O.2U("4T")=="3q"){ik.2U("4T",3O.2U("4T"))}K 1m=kO[i];ik.1m(1m);9V.2Y(ik)}1b 9V},ov:1a(){J.Z4();K me=J;J.5j=[];J.mL=1k;K $1H=J.1g;J.Fk=J.1g.is(":6v");J.Oo=2I.2R.Z2();J.4l=J.D1(J.1v.1m,J.1v.1w);J.dR=J.OE(J.1v.dR);J.pL=$1H.2B("> ep > tr").5w().1f;J.9D=J.OA(J.1v.9D);J.4l={"1m":J.4l.1m!==1d?J.4l.1m:J.gC($1H),"1w":J.4l.1w!==1d?J.4l.1w:J.On($1H)};J.hf={"1m":J.4l.1m-($1H.8b()-$1H.1m()),"1w":J.4l.1w-($1H.7g()-$1H.1w())};J.OJ();K Fg=$1H.1P().1m()-3;J.5j=J.yB();K yP;K Fh=J.$z0.2B("tr").7g();if(Fh>0){yP=Fh+"px";$1H.2B("> eU").2U({"1w":yP});$1H.2U({"kb-1M":yP})}J.ja().1n("2t",$1H.1n("2t"));$("#qb-ui-4k 1H")[0].2G.1m=Fg+"px";$("#qb-ui-4k 1H")[0].2G["6e-1m"]=Fg+"px";if(J.Fk){J.De()}J.f6={};J.5j=J.yB();J.mJ(J.5j);J.1g.2B("eU").3M();$("#qb-ui-4k 1H")[0].2G.1m="";$("#qb-ui-4k 1H")[0].2G["6e-1m"]="";if(J.9D.5f!=1d){K yx=J.LX();J.rf().2p(1a(i,e){if(me.9D.5f[i]&&$(e).4J("Vr-62")){if(me.9D.rX!=1d){yx["fe"]=me.9D.rX[i]}if(me.9D.os!=1d){yx["a9"]=me.9D.os[i]}$(e).5f(yx)}})}if(!me.f6.x){me.Ma($1H.2B("> ep").4w(0),{"9y":1a(1N){K 2v=-1*$(1N.3g).54();me.mR().2U("2f",2v+"px")}});me.f6.x=1l}K 9V=J.OG(J.5j);J.OF().xr(9V);J.z7();Cy=1k},OJ:1a(){J.$w=$(3z);if(J.1g.4J("er-y")){J.1g.3K("er-y").1P().2r("er-y")}J.$z0=J.1g.Fc(".hD-eU");J.$OI=J.1g.1P(".hD-pH");K me=J;J.1g.1P(".hD-pH").9y(1a(){me.Fv()});J.$w.9y(1a(){me.Fv()})},Fv:1a(){J.$z0.2U({1M:J.$OI.4Q()})},Xw:1a(){},hI:1a(1o){1b 1o===1d||2A 1o=="2x"},D1:1a(1m,1w){K 4l={};if(J.hI(1m)||!J.Fw(1m)){4l.1m=1d}1j{4l.1m=1m}if(J.hI(1w)||!J.Fw(1w)){4l.1w=1d}1j{4l.1w=1w}1b 4l},OE:1a(1o){K dR;if(1o===1l){dR={"x":1l,"y":1l}}1j{if(1o=="x"){dR={"x":1l,"y":1k}}1j{if(1o=="y"){dR={"x":1k,"y":1l}}1j{if($.cD(1o)){dR={"x":$.vu("x",1o),"y":$.vu("y",1o)}}1j{dR={"x":1k,"y":1k}}}}}1b dR},OA:1a(9D){K 7D={};7D["5f"]=J.hI(9D)?1d:J.Oz(9D.5f);7D["rX"]=J.hI(9D)?1d:J.Fs(9D.rX);7D["os"]=J.hI(9D)?1d:J.Fs(9D.os);1b 7D},Oz:1a(5f){K 7D=[];if(J.hI(5f)){1b 1d}1j{if($.cS(5f)){7D=5f()}1j{if($.cD(5f)){7D=5f}1j{if(5f===1l){1p(K i=0;i<J.pL;i++){7D[i]=1l}1b 7D}1j{1b 1d}}}}if(!$.cD(7D)||(7D.1f!=J.pL||!7D.pC(1a(1o){1b 1o===1l||1o===1k}))){1b 1d}1b 7D},Ya:1a(1o){1b+1o==3A.bf(+1o)},Fq:1a(1o){1b+1o==3A.bf(+1o)&&+1o>=0},Fw:1a(1o){1b+1o==3A.bf(+1o)&&+1o>0},Fs:1a(1m){K 7D=[];if(J.hI(1m)){1b 1d}1j{if($.cS(1m)){7D=1m()}1j{if($.cD(1m)){7D=1m}1j{if(J.Fq(1m)){K 1o=+1m;1p(K i=0;i<J.pL;i++){7D[i]=1o}1b 7D}1j{1b 1d}}}}K 3h=J;if(!$.cD(7D)||(7D.1f!=J.pL||!7D.pC(1a(1o){1b 3h.Fq(1o)}))){1b 1d}1b 7D},Dg:1a(kO,Da,nZ){if(2A nZ=="2x"){nZ=0;1p(K i=0;i<kO.1f;i++){nZ+=kO[i]}}K 81=Da/nZ;K sD=[];K D9=0;1p(K i=0;i<kO.1f-1;i++){sD[i]=3A.5m(81*kO[i]);D9+=sD[i]}sD[i]=Da-D9;1b sD},62:1a(1m,1w){K 3h=J;K na=J.D1(1m,1w);K $1H=J.1g;if(na.1m!=1d){$1H.2U("1m",1m);J.4l.1m=na.1m;J.hf.1m=na.1m-($1H.8b()-$1H.1m());K cf=J.j2();if(J.dR.x){if(J.f6.x||!J.1v.HV){K Dm=J.f6.x;K Dh=J.OB($1H.1P()).x;if(!Dm&&Dh){J.Ma($1H.2B("> ep").4w(0),{"9y":1a(1N){K 2v=-1*$(1N.3g).54();3h.mR().2U("2f",2v+"px")}});J.mJ(cf);J.f6.x=1l}1j{if(Dm&&!Dh){J.M9($1H.2B("> ep"),"9y");J.f6.x=1k}}}1j{J.5j=J.Dg(J.5j,J.hf.1m,cf);if(J.f6.x){J.ja().2B("ep").2U("1m","");J.mR().1m(J.hf.1m+"px");J.M9($1H.2B("> ep"),"9y");J.f6.x=1k}}}1j{if(cf!=J.hf.1m){J.5j=J.Dg(J.5j,J.hf.1m,cf)}}$1H.5w().2U("1m",J.hf.1m+"px")}if(1w!=1d){J.4l.1w=na.1w;J.hf.1w=na.1w-($1H.7g()-$1H.1w());J.De()}J.7W()},7W:1a(){J.CF()},3G:1a(3o){J.ja().2B("ep").3J(3o);J.7W()},YN:1a(1g){1b $(1g).1W()},CI:1a(1g){K cR=J.rf();K 1O=0;1p(K i=0;i<cR.1f;i++){K 3O=cR[i];if(3O.jc["9c"]){1O+=0+3O.jc["9c"].1o-1}if(3O==1g){1s}1O++}1b 1O},LX:1a(){K 3h=J;K $1H=J.1g;K $b1;K np;K CE;K aL;K gz=[];K 57=0;K aS;K LW;K qP=0;K xv;K xo;K jD=0;1b{fV:"e",3a:1a(1N,ui){3h.w8=1l;$b1=ui.1g;jD=3h.gC($b1);CE=3h.CI(ui.1g[0]);aL=3h.CI(ui.1g[0]);xv=3h.r0()[CE];np=3h.nr()[aL];3h.mL=1k;Cy=1l;aS=3h.qX();LW=$(np).8b()-$(np).1m();qP=3h.j2()},62:1a(1N,ui){if(3h.mL){1b}3h.mL=1l;K CA=ui.4l.1m-ui.jD.1m;if(CA==57){1b}57=CA;1p(K i=0;i<3h.5j.1f;i++){gz[i]=3h.5j[i]}3h.mJ(qP+57,aS);3h.j7(xv,gz[aL]+57);3h.j7(np,gz[aL]+57);xo=3A.4o(3h.gC(np),3h.gC($b1));if(gz[aL]+57<xo){57=xo-jD;3h.mJ(qP+57,aS);3h.j7(xv,gz[aL]+57);3h.j7(ui.1g,gz[aL]+57);3h.mJ(qP+57,aS)}3h.mL=1k;gz[aL]+=57},6x:1a(1N,ui){Cy=1k;3h.mL=1k;1p(K i=0;i<3h.5j.1f;i++){3h.5j[i]=gz[i]}3h.z7()}}}})});(1a(bG){if(2A aV==="1a"&&aV.vg){aV(["fJ"],bG)}1j{bG(2I)}})(1a($){$.fn.xM=$.fn.xM||$.fn.M4;$.fn.4D({aE:1a(4h,1v){1b J.hR(4h,$.4D({CB:1l},1v))},hR:1a(4h,1v){if(!J[4h]){96\'$.hR => oG 2I 4h "\'+4h+\'" IV vo vN 6j Yp\'}K bn={7U:1k,6z:1k,M3:1k,4T:"5J",CB:1k};K nN=$.4D(bn,1v);K $3g=J.eq(0);K wW,n0;if(nN.CB){K 1o=$3g[4h]();if(1o>10){1b 1o}}if(nN.6z===1l){wW=1a(){K 2G="2R: 7U !qU; 1M: -Ym !qU; ";$3g=$3g.6z().1n("2G",2G).4n("3G")};n0=1a(){$3g.3M()}}1j{K 8T=[];K 2G="";K $6d;wW=1a(){$6d=$3g.7s().xM().43(":6d");2G+="i0: 6d !qU; 4T: "+nN.4T+" !qU; ";if(nN.7U===1l){2G+="2R: 7U !qU; "}$6d.2p(1a(){K $J=$(J);K xK=$J.1n("2G");8T.1G(xK);$J.1n("2G",xK?xK+";"+2G:2G)})};n0=1a(){$6d.2p(1a(i){K $J=$(J);K CU=8T[i];if(CU===2x){$J.ng("2G")}1j{$J.1n("2G",CU)}})}}wW();K hR=/(Xy)/.9z(4h)?$3g[4h](nN.M3):$3g[4h]();n0();1b hR}})});(1a(kX){K 6P="0.4.2",3Q="86",6f=/[\\.\\/]/,CQ="*",jR=1a(){},LZ=1a(a,b){1b a-b},jg,6x,4U={n:{}},3j=1a(1x,bt){1x=61(1x);K e=4U,CM=6x,2w=3R.3f.4d.2J(2F,2),fC=3j.fC(1x),z=0,f=1k,l,jh=[],et={},2E=[],ce=jg,XA=[];jg=1x;6x=0;1p(K i=0,ii=fC.1f;i<ii;i++){if("4u"in fC[i]){jh.1G(fC[i].4u);if(fC[i].4u<0){et[fC[i].4u]=fC[i]}}}jh.hP(LZ);4x(jh[z]<0){l=et[jh[z++]];2E.1G(l.3w(bt,2w));if(6x){6x=CM;1b 2E}}1p(i=0;i<ii;i++){l=fC[i];if("4u"in l){if(l.4u==jh[z]){2E.1G(l.3w(bt,2w));if(6x){1s}do{z++;l=et[jh[z]];l&&2E.1G(l.3w(bt,2w));if(6x){1s}}4x(l)}1j{et[l.4u]=l}}1j{2E.1G(l.3w(bt,2w));if(6x){1s}}}6x=CM;jg=ce;1b 2E.1f?2E:1d};3j.fH=4U;3j.fC=1a(1x){K 8c=1x.3S(6f),e=4U,1i,1J,k,i,ii,j,jj,xn,es=[e],2E=[];1p(i=0,ii=8c.1f;i<ii;i++){xn=[];1p(j=0,jj=es.1f;j<jj;j++){e=es[j].n;1J=[e[8c[i]],e[CQ]];k=2;4x(k--){1i=1J[k];if(1i){xn.1G(1i);2E=2E.4e(1i.f||[])}}}es=xn}1b 2E};3j.on=1a(1x,f){1x=61(1x);if(2A f!="1a"){1b 1a(){}}K 8c=1x.3S(6f),e=4U;1p(K i=0,ii=8c.1f;i<ii;i++){e=e.n;e=e.86(8c[i])&&e[8c[i]]||(e[8c[i]]={n:{}})}e.f=e.f||[];1p(i=0,ii=e.f.1f;i<ii;i++){if(e.f[i]==f){1b jR}}e.f.1G(f);1b 1a(4u){if(+4u==+4u){f.4u=+4u}}};3j.f=1a(1N){K 2s=[].4d.2J(2F,1);1b 1a(){3j.3w(1d,[1N,1d].4e(2s).4e([].4d.2J(2F,0)))}};3j.6x=1a(){6x=1};3j.nt=1a(CL){if(CL){1b(1T eh("(?:\\\\.|\\\\/|^)"+CL+"(?:\\\\.|\\\\/|$)")).9z(jg)}1b jg};3j.XV=1a(){1b jg.3S(6f)};3j.fv=3j.8W=1a(1x,f){if(!1x){3j.fH=4U={n:{}};1b}K 8c=1x.3S(6f),e,1r,5W,i,ii,j,jj,jm=[4U];1p(i=0,ii=8c.1f;i<ii;i++){1p(j=0;j<jm.1f;j+=5W.1f-2){5W=[j,1];e=jm[j].n;if(8c[i]!=CQ){if(e[8c[i]]){5W.1G(e[8c[i]])}}1j{1p(1r in e){if(e[3Q](1r)){5W.1G(e[1r])}}}jm.5W.3w(jm,5W)}}1p(i=0,ii=jm.1f;i<ii;i++){e=jm[i];4x(e.n){if(f){if(e.f){1p(j=0,jj=e.f.1f;j<jj;j++){if(e.f[j]==f){e.f.5W(j,1);1s}}!e.f.1f&&4q e.f}1p(1r in e.n){if(e.n[3Q](1r)&&e.n[1r].f){K qC=e.n[1r].f;1p(j=0,jj=qC.1f;j<jj;j++){if(qC[j]==f){qC.5W(j,1);1s}}!qC.1f&&4q e.n[1r].f}}}1j{4q e.f;1p(1r in e.n){if(e.n[3Q](1r)&&e.n[1r].f){4q e.n[1r].f}}}e=e.n}}};3j.Y9=1a(1x,f){K f2=1a(){3j.8W(1x,f2);1b f.3w(J,2F)};1b 3j.on(1x,f2)};3j.6P=6P;3j.3Y=1a(){1b"Uc BC OP Y2 "+6P};2A j5!="2x"&&j5.vi?j5.vi=3j:2A aV!="2x"?aV("3j",[],1a(){1b 3j}):kX.3j=3j})(3z||J);(1a(kX,bG){if(2A aV==="1a"&&aV.vg){aV(["3j"],1a(3j){1b bG(kX,3j)})}1j{bG(kX,kX.3j)}})(J,1a(3z,3j){1a R(4A){if(R.is(4A,"1a")){1b c5?4A():3j.on("4F.lK",4A)}1j{if(R.is(4A,4t)){1b R.5h.8J[3w](R,4A.5W(0,3+R.is(4A[0],nu))).5F(4A)}1j{K 2w=3R.3f.4d.2J(2F,0);if(R.is(2w[2w.1f-1],"1a")){K f=2w.eO();1b c5?f.2J(R.5h.8J[3w](R,2w)):3j.on("4F.lK",1a(){f.2J(R.5h.8J[3w](R,2w))})}1j{1b R.5h.8J[3w](R,2F)}}}}R.6P="2.1.2";R.3j=3j;K c5,6f=/[, ]+/,b7={ah:1,4I:1,1K:1,bQ:1,2g:1,ac:1},Mq=/\\{(\\d+)\\}/g,mp="3f",3Q="86",g={3m:2K,5R:3z},tf={Bb:5g.3f[3Q].2J(g.5R,"cB"),is:g.5R.cB},E9=1a(){J.ca=J.ab={}},78,4m="4m",3w="3w",4e="4e",qk="Y5"in g.5R||g.5R.Mm&&g.3m g8 Mm,E="",S=" ",4B=61,3S="3S",4U="3F u4 7T bi fB hi 7k sV sW sT DU"[3S](S),qJ={7T:"sV",bi:"sW",7k:"sT"},pc=4B.3f.49,4b=3A,5E=4b.4o,6S=4b.6e,4G=4b.4G,6Q=4b.6Q,PI=4b.PI,nu="dr",4E="4E",4t="4t",3Y="3Y",jC="2d",Mj=5g.3f.3Y,2M={},1G="1G",XM=R.Cv=/^5k\\([\'"]?([^\\)]+?)[\'"]?\\)$/i,Kl=/^\\s*((#[a-f\\d]{6})|(#[a-f\\d]{3})|BM?\\(\\s*([\\d\\.]+%?\\s*,\\s*[\\d\\.]+%?\\s*,\\s*[\\d\\.]+%?(?:\\s*,\\s*[\\d\\.]+%?)?)\\s*\\)|Lw?\\(\\s*([\\d\\.]+(?:4V|\\A2|%)?\\s*,\\s*[\\d\\.]+%?\\s*,\\s*[\\d\\.]+(?:%?\\s*,\\s*[\\d\\.]+)?)%?\\s*\\)|LR?\\(\\s*([\\d\\.]+(?:4V|\\A2|%)?\\s*,\\s*[\\d\\.]+%?\\s*,\\s*[\\d\\.]+(?:%?\\s*,\\s*[\\d\\.]+)?)%?\\s*\\))\\s*$/i,Mk={"XL":1,"Mi":1,"-Mi":1},N9=/^(?:XF-)?XE\\(([^,]+),([^,]+),([^,]+),([^\\)]+)\\)/,5m=4b.5m,bS="bS",4i=e6,b8=6u,IO=4B.3f.9i,Na=R.nj={"cA-5d":"3q","cA-3a":"3q",4W:0,"76-4I":"0 0 1e9 1e9",mB:"5N",cx:0,cy:0,2d:"#nc","2d-2X":1,3d:\'YO "Mh"\',"3d-9j":\'"Mh"\',"3d-4l":"10","3d-2G":"wL","3d-bz":rD,4y:0,1w:0,5B:"6s://YG.Bo/","Z3-YV":0,2X:1,1K:"M0,0",r:0,rx:0,ry:0,4L:"",2m:"#eg","2m-aX":"","2m-ez":"lO","2m-iY":"lO","2m-rO":0,"2m-2X":1,"2m-1m":1,3g:"YU","2g-Cb":"zP",5c:"cB",4j:"",1m:0,x:0,y:0},uO=R.Z0={4W:nu,"76-4I":"AC",cx:nu,cy:nu,2d:"b4","2d-2X":nu,"3d-4l":nu,1w:nu,2X:nu,1K:"1K",r:nu,rx:nu,ry:nu,2m:"b4","2m-2X":nu,"2m-1m":nu,4j:"4j",1m:nu,x:nu,y:nu},Mg=/[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]/g,wj=/[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]*,[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]*/,Lt={hs:1,rg:1},Lv=/,?([YY]),?/gi,LS=/([Yl])[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]*,?[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]*)+)/ig,LO=/([YA])[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]*,?[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]*)+)/ig,Ig=/(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]*,?[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]*/ig,Yr=R.C0=/^r(?:\\(([^,]+?)[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]*,[\\cz\\cu\\cq\\cI\\cK\\cM\\cG\\ch\\bT\\bM\\bH\\c9\\cc\\bX\\c4\\bK\\bN\\bJ\\cJ\\bP\\c3\\cd\\bE\\bR\\cO]*([^\\)]+?)\\))?/,jk={},YW=1a(a,b){1b a.1r-b.1r},Ne=1a(a,b){1b 4i(a)-4i(b)},jR=1a(){},N1=1a(x){1b x},sb=R.AI=1a(x,y,w,h,r){if(r){1b[["M",x+r,y],["l",w-r*2,0],["a",r,r,0,0,1,r,r],["l",0,h-r*2],["a",r,r,0,0,1,-r,r],["l",r*2-w,0],["a",r,r,0,0,1,-r,-r],["l",0,r*2-h],["a",r,r,0,0,1,r,-r],["z"]]}1b[["M",x,y],["l",w,0],["l",0,h],["l",-w,0],["z"]]},E5=1a(x,y,rx,ry){if(ry==1d){ry=rx}1b[["M",x,y],["m",0,-ry],["a",rx,ry,0,1,1,0,2*ry],["a",rx,ry,0,1,1,0,-2*ry],["z"]]},cZ=R.Cp={1K:1a(el){1b el.1n("1K")},ah:1a(el){K a=el.2s;1b E5(a.cx,a.cy,a.r)},bQ:1a(el){K a=el.2s;1b E5(a.cx,a.cy,a.rx,a.ry)},4I:1a(el){K a=el.2s;1b sb(a.x,a.y,a.1m,a.1w,a.r)},ac:1a(el){K a=el.2s;1b sb(a.x,a.y,a.1m,a.1w)},2g:1a(el){K 3p=el.o0();1b sb(3p.x,3p.y,3p.1m,3p.1w)},5U:1a(el){K 3p=el.o0();1b sb(3p.x,3p.y,3p.1m,3p.1w)}},rM=R.rM=1a(1K,5b){if(!5b){1b 1K}K x,y,i,j,ii,jj,gH;1K=kh(1K);1p(i=0,ii=1K.1f;i<ii;i++){gH=1K[i];1p(j=1,jj=gH.1f;j<jj;j+=2){x=5b.x(gH[j],gH[j+1]);y=5b.y(gH[j],gH[j+1]);gH[j]=x;gH[j+1]=y}}1b 1K};R.8F=g;R.1C=g.5R.Z1||g.3m.YT.YJ("6s://dC.w3.e9/TR/YK/YL#YQ","1.1")?"eZ":"jM";if(R.1C=="jM"){K d=g.3m.e7("2C"),b;d.qK=\'<v:ec Ml="1"/>\';b=d.8E;b.2G.Jq="5k(#5N#jM)";if(!(b&&2A b.Ml=="1A")){1b R.1C=E}d=1d}R.3b=!(R.6M=R.1C=="jM");R.Ba=E9;R.fn=78=E9.3f=R.3f;R.Xz=0;R.AQ=0;R.is=1a(o,1C){1C=pc.2J(1C);if(1C=="rL"){1b!Mk[3Q](+o)}if(1C=="4t"){1b o g8 3R}1b 1C=="1d"&&o===1d||(1C==2A o&&o!==1d||(1C=="1A"&&o===5g(o)||(1C=="4t"&&(3R.cD&&3R.cD(o))||Mj.2J(o).4d(8,-1).49()==1C)))};1a 6z(1y){if(2A 1y=="1a"||5g(1y)!==1y){1b 1y}K 1F=1T 1y.5L;1p(K 1r in 1y){if(1y[3Q](1r)){1F[1r]=6z(1y[1r])}}1b 1F}R.8n=1a(x1,y1,x2,y2,x3,y3){if(x3==1d){K x=x1-x2,y=y1-y2;if(!x&&!y){1b 0}1b(180+4b.Ij(-y,-x)*180/PI+9O)%9O}1j{1b R.8n(x1,y1,x3,y3)-R.8n(x2,y2,x3,y3)}};R.9U=1a(4V){1b 4V%9O*PI/180};R.4V=1a(9U){1b 9U*180/PI%9O};R.XJ=1a(2Z,1o,f9){f9=R.is(f9,"rL")?f9:10;if(R.is(2Z,4t)){K i=2Z.1f;4x(i--){if(4G(2Z[i]-1o)<=f9){1b 2Z[i]}}}1j{2Z=+2Z;K s3=1o%2Z;if(s3<f9){1b 1o-s3}if(s3>2Z-f9){1b 1o-s3+2Z}}1b 1o};K oN=R.oN=1a(LV,LC){1b 1a(){1b"Xu-Xv-Y3-Y0-Y1".3t(LV,LC).9i()}}(/[xy]/g,1a(c){K r=4b.lV()*16|0,v=c=="x"?r:r&3|8;1b v.3Y(16)});R.LB=1a(Dw){3j("4F.LB",R,g.5R,Dw);g.5R=Dw;g.3m=g.5R.2K;if(R.5h.yO){R.5h.yO(g.5R)}};K pP=1a(3X){if(R.6M){K s0=/^\\s+|\\s+$/g;K rZ;6E{K vW=1T vS("XN");vW.XO("<3G>");vW.6n();rZ=vW.3G}6G(e){rZ=XX().2K.3G}K dX=rZ.q0();pP=du(1a(3X){6E{rZ.2G.3X=4B(3X).3t(s0,E);K 1o=dX.1dt("1dv");1o=(1o&gu)<<16|1o&1dj|(1o&1dm)>>>16;1b"#"+("Ka"+1o.3Y(16)).4d(-6)}6G(e){1b"3q"}})}1j{K i=g.3m.e7("i");i.5c="mo\\mk 1dp 1dn";i.2G.4T="3q";g.3m.3G.4m(i);pP=du(1a(3X){i.2G.3X=3X;1b g.3m.lG.tH(i,E).Om("3X")})}1b pP(3X)},LF=1a(){1b"LP("+[J.h,J.s,J.b]+")"},Lz=1a(){1b"LU("+[J.h,J.s,J.l]+")"},DD=1a(){1b J.7d},DN=1a(r,g,b){if(g==1d&&(R.is(r,"1A")&&("r"in r&&("g"in r&&"b"in r)))){b=r.b;g=r.g;r=r.r}if(g==1d&&R.is(r,4E)){K 4a=R.cX(r);r=4a.r;g=4a.g;b=4a.b}if(r>1||(g>1||b>1)){r/=gu;g/=gu;b/=gu}1b[r,g,b]},DB=1a(r,g,b,o){r*=gu;g*=gu;b*=gu;K 4p={r:r,g:g,b:b,7d:R.4p(r,g,b),3Y:DD};R.is(o,"rL")&&(4p.2X=o);1b 4p};R.3X=1a(4a){K 4p;if(R.is(4a,"1A")&&("h"in 4a&&("s"in 4a&&"b"in 4a))){4p=R.o7(4a);4a.r=4p.r;4a.g=4p.g;4a.b=4p.b;4a.7d=4p.7d}1j{if(R.is(4a,"1A")&&("h"in 4a&&("s"in 4a&&"l"in 4a))){4p=R.zb(4a);4a.r=4p.r;4a.g=4p.g;4a.b=4p.b;4a.7d=4p.7d}1j{if(R.is(4a,"4E")){4a=R.cX(4a)}if(R.is(4a,"1A")&&("r"in 4a&&("g"in 4a&&"b"in 4a))){4p=R.LD(4a);4a.h=4p.h;4a.s=4p.s;4a.l=4p.l;4p=R.LA(4a);4a.v=4p.b}1j{4a={7d:"3q"};4a.r=4a.g=4a.b=4a.h=4a.s=4a.v=4a.l=-1}}}4a.3Y=DD;1b 4a};R.o7=1a(h,s,v,o){if(J.is(h,"1A")&&("h"in h&&("s"in h&&"b"in h))){v=h.b;s=h.s;h=h.h;o=h.o}h*=9O;K R,G,B,X,C;h=h%9O/60;C=v*s;X=C*(1-4G(h%2-1));R=G=B=v-C;h=~~h;R+=[C,X,0,0,X,C][h];G+=[X,C,C,X,0,0][h];B+=[0,0,X,C,C,X][h];1b DB(R,G,B,o)};R.zb=1a(h,s,l,o){if(J.is(h,"1A")&&("h"in h&&("s"in h&&"l"in h))){l=h.l;s=h.s;h=h.h}if(h>1||(s>1||l>1)){h/=9O;s/=100;l/=100}h*=9O;K R,G,B,X,C;h=h%9O/60;C=2*s*(l<0.5?l:1-l);X=C*(1-4G(h%2-1));R=G=B=l-C/2;h=~~h;R+=[C,X,0,0,X,C][h];G+=[X,C,C,X,0,0][h];B+=[0,0,X,C,C,X][h];1b DB(R,G,B,o)};R.LA=1a(r,g,b){b=DN(r,g,b);r=b[0];g=b[1];b=b[2];K H,S,V,C;V=5E(r,g,b);C=V-6S(r,g,b);H=C==0?1d:V==r?(g-b)/ C : V == g ? (b - r) /C+2:(r-g)/C+4;H=(H+9O)%6*60/9O;S=C==0?0:C/V;1b{h:H,s:S,b:V,3Y:LF}};R.LD=1a(r,g,b){b=DN(r,g,b);r=b[0];g=b[1];b=b[2];K H,S,L,M,m,C;M=5E(r,g,b);m=6S(r,g,b);C=M-m;H=C==0?1d:M==r?(g-b)/ C : M == g ? (b - r) /C+2:(r-g)/C+4;H=(H+9O)%6*60/9O;L=(M+m)/2;S=C==0?0:L<0.5?C/ (2 * L) : C /(2-2*L);1b{h:H,s:S,l:L,3Y:Lz}};R.nB=1a(){1b J.5x(",").3t(Lv,"$1")};1a Lu(4t,1i){1p(K i=0,ii=4t.1f;i<ii;i++){if(4t[i]===1i){1b 4t.1G(4t.5W(i,1)[0])}}}1a du(f,bt,nX){1a lR(){K 4M=3R.3f.4d.2J(2F,0),2w=4M.5x("\\1dy"),8H=lR.8H=lR.8H||{},71=lR.71=lR.71||[];if(8H[3Q](2w)){Lu(71,2w);1b nX?nX(8H[2w]):8H[2w]}71.1f>=9m&&4q 8H[71.dE()];71.1G(2w);8H[2w]=f[3w](bt,4M);1b nX?nX(8H[2w]):8H[2w]}1b lR}K 1dD=R.Cx=1a(4L,f){K ei=g.3m.e7("ei");ei.2G.iA="2R:7U;2f:-nC;1M:-nC";ei.jf=1a(){f.2J(J);J.jf=1d;g.3m.3G.8a(J)};ei.1d0=1a(){g.3m.3G.8a(J)};g.3m.3G.4m(ei);ei.4L=4L};1a oX(){1b J.7d}R.cX=du(1a(b4){if(!b4||!!((b4=4B(b4)).5e("-")+1)){1b{r:-1,g:-1,b:-1,7d:"3q",5u:1,3Y:oX}}if(b4=="3q"){1b{r:-1,g:-1,b:-1,7d:"3q",3Y:oX}}!(Lt[3Q](b4.49().hb(0,2))||b4.cn()=="#")&&(b4=pP(b4));K 1F,aN,cN,bI,2X,t,2Z,4p=b4.3x(Kl);if(4p){if(4p[2]){bI=b8(4p[2].hb(5),16);cN=b8(4p[2].hb(3,5),16);aN=b8(4p[2].hb(1,3),16)}if(4p[3]){bI=b8((t=4p[3].cn(3))+t,16);cN=b8((t=4p[3].cn(2))+t,16);aN=b8((t=4p[3].cn(1))+t,16)}if(4p[4]){2Z=4p[4][3S](wj);aN=4i(2Z[0]);2Z[0].4d(-1)=="%"&&(aN*=2.55);cN=4i(2Z[1]);2Z[1].4d(-1)=="%"&&(cN*=2.55);bI=4i(2Z[2]);2Z[2].4d(-1)=="%"&&(bI*=2.55);4p[1].49().4d(0,4)=="BM"&&(2X=4i(2Z[3]));2Z[3]&&(2Z[3].4d(-1)=="%"&&(2X/=100))}if(4p[5]){2Z=4p[5][3S](wj);aN=4i(2Z[0]);2Z[0].4d(-1)=="%"&&(aN*=2.55);cN=4i(2Z[1]);2Z[1].4d(-1)=="%"&&(cN*=2.55);bI=4i(2Z[2]);2Z[2].4d(-1)=="%"&&(bI*=2.55);(2Z[0].4d(-3)=="4V"||2Z[0].4d(-1)=="\\LG")&&(aN/=9O);4p[1].49().4d(0,4)=="Lw"&&(2X=4i(2Z[3]));2Z[3]&&(2Z[3].4d(-1)=="%"&&(2X/=100));1b R.o7(aN,cN,bI,2X)}if(4p[6]){2Z=4p[6][3S](wj);aN=4i(2Z[0]);2Z[0].4d(-1)=="%"&&(aN*=2.55);cN=4i(2Z[1]);2Z[1].4d(-1)=="%"&&(cN*=2.55);bI=4i(2Z[2]);2Z[2].4d(-1)=="%"&&(bI*=2.55);(2Z[0].4d(-3)=="4V"||2Z[0].4d(-1)=="\\LG")&&(aN/=9O);4p[1].49().4d(0,4)=="LR"&&(2X=4i(2Z[3]));2Z[3]&&(2Z[3].4d(-1)=="%"&&(2X/=100));1b R.zb(aN,cN,bI,2X)}4p={r:aN,g:cN,b:bI,3Y:oX};4p.7d="#"+(LT|bI|cN<<8|aN<<16).3Y(16).4d(1);R.is(2X,"rL")&&(4p.2X=2X);1b 4p}1b{r:-1,g:-1,b:-1,7d:"3q",5u:1,3Y:oX}},R);R.LP=du(1a(h,s,b){1b R.o7(h,s,b).7d});R.LU=du(1a(h,s,l){1b R.zb(h,s,l).7d});R.4p=du(1a(r,g,b){1b"#"+(LT|b|g<<8|r<<16).3Y(16).4d(1)});R.oi=1a(1o){K 3a=J.oi.3a=J.oi.3a||{h:0,s:1,b:1o||0.75},4p=J.o7(3a.h,3a.s,3a.b);3a.h+=0.MS;if(3a.h>1){3a.h=0;3a.s-=0.2;3a.s<=0&&(J.oi.3a={h:0,s:1,b:3a.b})}1b 4p.7d};R.oi.zh=1a(){4q J.3a};1a IP(8I,z){K d=[];1p(K i=0,kM=8I.1f;kM-2*!z>i;i+=2){K p=[{x:+8I[i-2],y:+8I[i-1]},{x:+8I[i],y:+8I[i+1]},{x:+8I[i+2],y:+8I[i+3]},{x:+8I[i+4],y:+8I[i+5]}];if(z){if(!i){p[0]={x:+8I[kM-2],y:+8I[kM-1]}}1j{if(kM-4==i){p[3]={x:+8I[0],y:+8I[1]}}1j{if(kM-2==i){p[2]={x:+8I[0],y:+8I[1]};p[3]={x:+8I[2],y:+8I[3]}}}}}1j{if(kM-4==i){p[3]=p[2]}1j{if(!i){p[0]={x:+8I[i],y:+8I[i+1]}}}}d.1G(["C",(-p[0].x+6*p[1].x+p[2].x)/ 6, (-p[0].y + 6 * p[1].y + p[2].y) /6,(p[1].x+6*p[2].x-p[3].x)/ 6, (p[1].y + 6 * p[2].y - p[3].y) /6,p[2].x,p[2].y])}1b d}R.IM=1a(9E){if(!9E){1b 1d}K 8D=hC(9E);if(8D.fR){1b dq(8D.fR)}K pM={a:7,c:6,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,z:0},1h=[];if(R.is(9E,4t)&&R.is(9E[0],4t)){1h=dq(9E)}if(!1h.1f){4B(9E).3t(LS,1a(a,b,c){K 1D=[],1x=b.49();c.3t(Ig,1a(a,b){b&&1D.1G(+b)});if(1x=="m"&&1D.1f>2){1h.1G([b][4e](1D.5W(0,2)));1x="l";b=b=="m"?"l":"L"}if(1x=="r"){1h.1G([b][4e](1D))}1j{4x(1D.1f>=pM[1x]){1h.1G([b][4e](1D.5W(0,pM[1x])));if(!pM[1x]){1s}}}})}1h.3Y=R.nB;8D.fR=dq(1h);1b 1h};R.vG=du(1a(nf){if(!nf){1b 1d}K pM={r:3,s:4,t:2,m:6},1h=[];if(R.is(nf,4t)&&R.is(nf[0],4t)){1h=dq(nf)}if(!1h.1f){4B(nf).3t(LO,1a(a,b,c){K 1D=[],1x=pc.2J(b);c.3t(Ig,1a(a,b){b&&1D.1G(+b)});1h.1G([b][4e](1D))})}1h.3Y=R.nB;1b 1h});K hC=1a(ps){K p=hC.ps=hC.ps||{};if(p[ps]){p[ps].yv=100}1j{p[ps]={yv:100}}6W(1a(){1p(K 1r in p){if(p[3Q](1r)&&1r!=ps){p[1r].yv--;!p[1r].yv&&4q p[1r]}}});1b p[ps]};R.sj=1a(6D,7e,72,74,7V,82,8o,8l,t){K t1=1-t,If=6Q(t1,3),Ih=6Q(t1,2),t2=t*t,t3=t2*t,x=If*6D+Ih*3*t*72+t1*3*t*t*7V+t3*8o,y=If*7e+Ih*3*t*74+t1*3*t*t*82+t3*8l,mx=6D+2*t*(72-6D)+t2*(7V-2*72+6D),my=7e+2*t*(74-7e)+t2*(82-2*74+7e),nx=72+2*t*(7V-72)+t2*(8o-2*7V+72),ny=74+2*t*(82-74)+t2*(8l-2*82+74),ax=t1*6D+t*72,ay=t1*7e+t*74,cx=t1*7V+t*8o,cy=t1*82+t*8l,fw=90-4b.Ij(mx-nx,my-ny)*180/PI;(mx>nx||my<ny)&&(fw+=180);1b{x:x,y:y,m:{x:mx,y:my},n:{x:nx,y:ny},3a:{x:ax,y:ay},5d:{x:cx,y:cy},fw:fw}};R.HY=1a(6D,7e,72,74,7V,82,8o,8l){if(!R.is(6D,"4t")){6D=[6D,7e,72,74,7V,82,8o,8l]}K 3p=GD.3w(1d,6D);1b{x:3p.6e.x,y:3p.6e.y,x2:3p.4o.x,y2:3p.4o.y,1m:3p.4o.x-3p.6e.x,1w:3p.4o.y-3p.6e.y}};R.IS=1a(3p,x,y){1b x>=3p.x&&(x<=3p.x2&&(y>=3p.y&&y<=3p.y2))};R.GZ=1a(7M,7L){K i=R.IS;1b i(7L,7M.x,7M.y)||(i(7L,7M.x2,7M.y)||(i(7L,7M.x,7M.y2)||(i(7L,7M.x2,7M.y2)||(i(7M,7L.x,7L.y)||(i(7M,7L.x2,7L.y)||(i(7M,7L.x,7L.y2)||(i(7M,7L.x2,7L.y2)||(7M.x<7L.x2&&7M.x>7L.x||7L.x<7M.x2&&7L.x>7M.x)&&(7M.y<7L.y2&&7M.y>7L.y||7L.y<7M.y2&&7L.y>7M.y))))))))};1a HW(t,p1,p2,p3,p4){K t1=-3*p1+9*p2-9*p3+3*p4,t2=t*t1+6*p1-12*p2+6*p3;1b t*t2-3*p1+3*p2}1a kF(x1,y1,x2,y2,x3,y3,x4,y4,z){if(z==1d){z=1}z=z>1?1:z<0?0:z;K z2=z/2,n=12,MY=[-0.LJ,0.LJ,-0.LN,0.LN,-0.LM,0.LM,-0.LL,0.LL,-0.Mt,0.Mt,-0.N5,0.N5],MX=[0.N4,0.N4,0.N3,0.N3,0.N8,0.N8,0.N7,0.N7,0.N6,0.N6,0.N2,0.N2],I5=0;1p(K i=0;i<n;i++){K ct=z2*MY[i]+z2,I2=HW(ct,x1,x2,x3,x4),I4=HW(ct,y1,y2,y3,y4),MW=I2*I2+I4*I4;I5+=MX[i]*4b.bw(MW)}1b z2*I5}1a MM(x1,y1,x2,y2,x3,y3,x4,y4,ll){if(ll<0||kF(x1,y1,x2,y2,x3,y3,x4,y4)<ll){1b}K t=1,qQ=t/2,t2=t-qQ,l,e=0.JR;l=kF(x1,y1,x2,y2,x3,y3,x4,y4,t2);4x(4G(l-ll)>e){qQ/=2;t2+=(l<ll?1:-1)*qQ;l=kF(x1,y1,x2,y2,x3,y3,x4,y4,t2)}1b t2}1a Gk(x1,y1,x2,y2,x3,y3,x4,y4){if(5E(x1,x2)<6S(x3,x4)||(6S(x1,x2)>5E(x3,x4)||(5E(y1,y2)<6S(y3,y4)||6S(y1,y2)>5E(y3,y4)))){1b}K nx=(x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4),ny=(x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4),yU=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);if(!yU){1b}K px=nx/ yU, py = ny /yU,sK=+px.5a(2),sJ=+py.5a(2);if(sK<+6S(x1,x2).5a(2)||(sK>+5E(x1,x2).5a(2)||(sK<+6S(x3,x4).5a(2)||(sK>+5E(x3,x4).5a(2)||(sJ<+6S(y1,y2).5a(2)||(sJ>+5E(y1,y2).5a(2)||(sJ<+6S(y3,y4).5a(2)||sJ>+5E(y3,y4).5a(2)))))))){1b}1b{x:px,y:py}}1a 1bF(9P,9W){1b yG(9P,9W)}1a 1bP(9P,9W){1b yG(9P,9W,1)}1a yG(9P,9W,hw){K 7M=R.HY(9P),7L=R.HY(9W);if(!R.GZ(7M,7L)){1b hw?0:[]}K l1=kF.3w(0,9P),l2=kF.3w(0,9W),n1=5E(~~(l1/ 5), 1), n2 = 5E(~~(l2 /5),1),yY=[],yX=[],xy={},1F=hw?0:[];1p(K i=0;i<n1+1;i++){K p=R.sj.3w(R,9P.4e(i/n1));yY.1G({x:p.x,y:p.y,t:i/n1})}1p(i=0;i<n2+1;i++){p=R.sj.3w(R,9W.4e(i/n2));yX.1G({x:p.x,y:p.y,t:i/n2})}1p(i=0;i<n1;i++){1p(K j=0;j<n2;j++){K di=yY[i],lH=yY[i+1],dj=yX[j],lh=yX[j+1],ci=4G(lH.x-di.x)<0.yD?"y":"x",cj=4G(lh.x-dj.x)<0.yD?"y":"x",is=Gk(di.x,di.y,lH.x,lH.y,dj.x,dj.y,lh.x,lh.y);if(is){if(xy[is.x.5a(4)]==is.y.5a(4)){ap}xy[is.x.5a(4)]=is.y.5a(4);K t1=di.t+4G((is[ci]-di[ci])/ (lH[ci] - di[ci])) * (lH.t - di.t), t2 = dj.t + 4G((is[cj] - dj[cj]) /(lh[cj]-dj[cj]))*(lh.t-dj.t);if(t1>=0&&(t1<=1.yD&&(t2>=0&&t2<=1.yD))){if(hw){1F++}1j{1F.1G({x:is.x,y:is.y,t1:6S(t1,1),t2:6S(t2,1)})}}}}}1b 1F}R.1cI=1a(b6,9d){1b tw(b6,9d)};R.1cr=1a(b6,9d){1b tw(b6,9d,1)};1a tw(b6,9d,hw){b6=R.xN(b6);9d=R.xN(9d);K x1,y1,x2,y2,rh,rq,qN,qZ,9P,9W,1F=hw?0:[];1p(K i=0,ii=b6.1f;i<ii;i++){K pi=b6[i];if(pi[0]=="M"){x1=rh=pi[1];y1=rq=pi[2]}1j{if(pi[0]=="C"){9P=[x1,y1].4e(pi.4d(1));x1=9P[6];y1=9P[7]}1j{9P=[x1,y1,x1,y1,rh,rq,rh,rq];x1=rh;y1=rq}1p(K j=0,jj=9d.1f;j<jj;j++){K pj=9d[j];if(pj[0]=="M"){x2=qN=pj[1];y2=qZ=pj[2]}1j{if(pj[0]=="C"){9W=[x2,y2].4e(pj.4d(1));x2=9W[6];y2=9W[7]}1j{9W=[x2,y2,x2,y2,qN,qZ,qN,qZ];x2=qN;y2=qZ}K hA=yG(9P,9W,hw);if(hw){1F+=hA}1j{1p(K k=0,kk=hA.1f;k<kk;k++){hA[k].1c4=i;hA[k].1cn=j;hA[k].9P=9P;hA[k].9W=9W}1F=1F.4e(hA)}}}}}1b 1F}R.MI=1a(1K,x,y){K 3p=R.N0(1K);1b R.IS(3p,x,y)&&tw(1K,[["M",x,y],["H",3p.x2+10]],1)%2==1};R.sq=1a(fX){1b 1a(){3j("4F.mK",1d,"mo\\mk: IV BC 1cf to 4h \\1ck"+fX+"\\1cj of 5S 1A",fX)}};K tY=R.N0=1a(1K){K 8D=hC(1K);if(8D.3p){1b 6z(8D.3p)}if(!1K){1b{x:0,y:0,1m:0,1w:0,x2:0,y2:0}}1K=kh(1K);K x=0,y=0,X=[],Y=[],p;1p(K i=0,ii=1K.1f;i<ii;i++){p=1K[i];if(p[0]=="M"){x=p[1];y=p[2];X.1G(x);Y.1G(y)}1j{K sR=GD(x,y,p[1],p[2],p[3],p[4],p[5],p[6]);X=X[4e](sR.6e.x,sR.4o.x);Y=Y[4e](sR.6e.y,sR.4o.y);x=p[5];y=p[6]}}K tm=6S[3w](0,X),tl=6S[3w](0,Y),IC=5E[3w](0,X),ID=5E[3w](0,Y),1m=IC-tm,1w=ID-tl,bb={x:tm,y:tl,x2:IC,y2:ID,1m:1m,1w:1w,cx:tm+1m/ 2, cy:tl + 1w /2};8D.3p=6z(bb);1b bb},dq=1a(6b){K 1F=6z(6b);1F.3Y=R.nB;1b 1F},G1=R.1ca=1a(6b){K 8D=hC(6b);if(8D.IN){1b dq(8D.IN)}if(!R.is(6b,4t)||!R.is(6b&&6b[0],4t)){6b=R.IM(6b)}K 1F=[],x=0,y=0,mx=0,my=0,3a=0;if(6b[0][0]=="M"){x=6b[0][1];y=6b[0][2];mx=x;my=y;3a++;1F.1G(["M",x,y])}1p(K i=3a,ii=6b.1f;i<ii;i++){K r=1F[i]=[],pa=6b[i];if(pa[0]!=pc.2J(pa[0])){r[0]=pc.2J(pa[0]);3P(r[0]){1q"a":r[1]=pa[1];r[2]=pa[2];r[3]=pa[3];r[4]=pa[4];r[5]=pa[5];r[6]=+(pa[6]-x).5a(3);r[7]=+(pa[7]-y).5a(3);1s;1q"v":r[1]=+(pa[1]-y).5a(3);1s;1q"m":mx=pa[1];my=pa[2];5N:1p(K j=1,jj=pa.1f;j<jj;j++){r[j]=+(pa[j]-(j%2?x:y)).5a(3)}}}1j{r=1F[i]=[];if(pa[0]=="m"){mx=pa[1]+x;my=pa[2]+y}1p(K k=0,kk=pa.1f;k<kk;k++){1F[i][k]=pa[k]}}K 6w=1F[i].1f;3P(1F[i][0]){1q"z":x=mx;y=my;1s;1q"h":x+=+1F[i][6w-1];1s;1q"v":y+=+1F[i][6w-1];1s;5N:x+=+1F[i][6w-2];y+=+1F[i][6w-1]}}1F.3Y=R.nB;8D.IN=dq(1F);1b 1F},Gt=R.sG=1a(6b){K 8D=hC(6b);if(8D.4G){1b dq(8D.4G)}if(!R.is(6b,4t)||!R.is(6b&&6b[0],4t)){6b=R.IM(6b)}if(!6b||!6b.1f){1b[["M",0,0]]}K 1F=[],x=0,y=0,mx=0,my=0,3a=0;if(6b[0][0]=="M"){x=+6b[0][1];y=+6b[0][2];mx=x;my=y;3a++;1F[0]=["M",x,y]}K IH=6b.1f==3&&(6b[0][0]=="M"&&(6b[1][0].9i()=="R"&&6b[2][0].9i()=="Z"));1p(K r,pa,i=3a,ii=6b.1f;i<ii;i++){1F.1G(r=[]);pa=6b[i];if(pa[0]!=IO.2J(pa[0])){r[0]=IO.2J(pa[0]);3P(r[0]){1q"A":r[1]=pa[1];r[2]=pa[2];r[3]=pa[3];r[4]=pa[4];r[5]=pa[5];r[6]=+(pa[6]+x);r[7]=+(pa[7]+y);1s;1q"V":r[1]=+pa[1]+y;1s;1q"H":r[1]=+pa[1]+x;1s;1q"R":K 5V=[x,y][4e](pa.4d(1));1p(K j=2,jj=5V.1f;j<jj;j++){5V[j]=+5V[j]+x;5V[++j]=+5V[j]+y}1F.eO();1F=1F[4e](IP(5V,IH));1s;1q"M":mx=+pa[1]+x;my=+pa[2]+y;5N:1p(j=1,jj=pa.1f;j<jj;j++){r[j]=+pa[j]+(j%2?x:y)}}}1j{if(pa[0]=="R"){5V=[x,y][4e](pa.4d(1));1F.eO();1F=1F[4e](IP(5V,IH));r=["R"][4e](pa.4d(-2))}1j{1p(K k=0,kk=pa.1f;k<kk;k++){r[k]=pa[k]}}}3P(r[0]){1q"Z":x=mx;y=my;1s;1q"H":x=r[1];1s;1q"V":y=r[1];1s;1q"M":mx=r[r.1f-2];my=r[r.1f-1];5N:x=r[r.1f-2];y=r[r.1f-1]}}1F.3Y=R.nB;8D.4G=dq(1F);1b 1F},pN=1a(x1,y1,x2,y2){1b[x1,y1,x2,y2,x2,y2]},GF=1a(x1,y1,ax,ay,x2,y2){K ox=1/ 3, oF = 2 /3;1b[ox*x1+oF*ax,ox*y1+oF*ay,ox*x2+oF*ax,ox*y2+oF*ay,x2,y2]},Gs=1a(x1,y1,rx,ry,8n,Ni,n8,x2,y2,jI){K II=PI*120/ 180, 9U = PI /180*(+8n||0),1F=[],xy,6l=du(1a(x,y,9U){K X=x*4b.a5(9U)-y*4b.9J(9U),Y=x*4b.9J(9U)+y*4b.a5(9U);1b{x:X,y:Y}});if(!jI){xy=6l(x1,y1,-9U);x1=xy.x;y1=xy.y;xy=6l(x2,y2,-9U);x2=xy.x;y2=xy.y;K a5=4b.a5(PI/ 180 * 8n), 9J = 4b.9J(PI /180*8n),x=(x1-x2)/ 2, y = (y1 - y2) /2;K h=x*x/ (rx * rx) + y * y /(ry*ry);if(h>1){h=4b.bw(h);rx=h*rx;ry=h*ry}K v2=rx*rx,v3=ry*ry,k=(Ni==n8?-1:1)*4b.bw(4G((v2*v3-v2*y*y-v3*x*x)/ (v2 * y * y + v3 * x * x))), cx = k * rx * y /ry+(x1+x2)/ 2, cy = k * -ry * x /rx+(y1+y2)/ 2, f1 = 4b.vt(((y1 - cy) /ry).5a(9)),f2=4b.vt(((y2-cy)/ry).5a(9));f1=x1<cx?PI-f1:f1;f2=x2<cx?PI-f2:f2;f1<0&&(f1=PI*2+f1);f2<0&&(f2=PI*2+f2);if(n8&&f1>f2){f1=f1-PI*2}if(!n8&&f2>f1){f2=f2-PI*2}}1j{f1=jI[0];f2=jI[1];cx=jI[2];cy=jI[3]}K df=f2-f1;if(4G(df)>II){K Nl=f2,Nh=x2,Nm=y2;f2=f1+II*(n8&&f2>f1?1:-1);x2=cx+rx*4b.a5(f2);y2=cy+ry*4b.9J(f2);1F=Gs(x2,y2,rx,ry,8n,0,n8,Nh,Nm,[f2,Nl,cx,cy])}df=f2-f1;K c1=4b.a5(f1),s1=4b.9J(f1),c2=4b.a5(f2),s2=4b.9J(f2),t=4b.Nk(df/ 4), hx = 4 /3*rx*t,hy=4/3*ry*t,m1=[x1,y1],m2=[x1+hx*s1,y1-hy*c1],m3=[x2+hx*s2,y2-hy*c2],m4=[x2,y2];m2[0]=2*m1[0]-m2[0];m2[1]=2*m1[1]-m2[1];if(jI){1b[m2,m3,m4][4e](1F)}1j{1F=[m2,m3,m4][4e](1F).5x()[3S](",");K GA=[];1p(K i=0,ii=1F.1f;i<ii;i++){GA[i]=i%2?6l(1F[i-1],1F[i],9U).y:6l(1F[i],1F[i+1],9U).x}1b GA}},pf=1a(6D,7e,72,74,7V,82,8o,8l,t){K t1=1-t;1b{x:6Q(t1,3)*6D+6Q(t1,2)*3*t*72+t1*3*t*t*7V+6Q(t,3)*8o,y:6Q(t1,3)*7e+6Q(t1,2)*3*t*74+t1*3*t*t*82+6Q(t,3)*8l}},GD=du(1a(6D,7e,72,74,7V,82,8o,8l){K a=7V-2*72+6D-(8o-2*7V+72),b=2*(72-6D)-2*(7V-72),c=6D-72,t1=(-b+4b.bw(b*b-4*a*c))/ 2 /a,t2=(-b-4b.bw(b*b-4*a*c))/ 2 /a,y=[7e,8l],x=[6D,8o],7J;4G(t1)>"vc"&&(t1=0.5);4G(t2)>"vc"&&(t2=0.5);if(t1>0&&t1<1){7J=pf(6D,7e,72,74,7V,82,8o,8l,t1);x.1G(7J.x);y.1G(7J.y)}if(t2>0&&t2<1){7J=pf(6D,7e,72,74,7V,82,8o,8l,t2);x.1G(7J.x);y.1G(7J.y)}a=82-2*74+7e-(8l-2*82+74);b=2*(74-7e)-2*(82-74);c=7e-74;t1=(-b+4b.bw(b*b-4*a*c))/ 2 /a;t2=(-b-4b.bw(b*b-4*a*c))/ 2 /a;4G(t1)>"vc"&&(t1=0.5);4G(t2)>"vc"&&(t2=0.5);if(t1>0&&t1<1){7J=pf(6D,7e,72,74,7V,82,8o,8l,t1);x.1G(7J.x);y.1G(7J.y)}if(t2>0&&t2<1){7J=pf(6D,7e,72,74,7V,82,8o,8l,t2);x.1G(7J.x);y.1G(7J.y)}1b{6e:{x:6S[3w](0,x),y:6S[3w](0,y)},4o:{x:5E[3w](0,x),y:5E[3w](0,y)}}}),kh=R.xN=du(1a(1K,9d){K 8D=!9d&&hC(1K);if(!9d&&8D.hB){1b dq(8D.hB)}K p=Gt(1K),p2=9d&&Gt(9d),2s={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:1d,qy:1d},fo={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:1d,qy:1d},GO=1a(1K,d,pd){K nx,ny,tq={T:1,Q:1};if(!1K){1b["C",d.x,d.y,d.x,d.y,d.x,d.y]}!(1K[0]in tq)&&(d.qx=d.qy=1d);3P(1K[0]){1q"M":d.X=1K[1];d.Y=1K[2];1s;1q"A":1K=["C"][4e](Gs[3w](0,[d.x,d.y][4e](1K.4d(1))));1s;1q"S":if(pd=="C"||pd=="S"){nx=d.x*2-d.bx;ny=d.y*2-d.by}1j{nx=d.x;ny=d.y}1K=["C",nx,ny][4e](1K.4d(1));1s;1q"T":if(pd=="Q"||pd=="T"){d.qx=d.x*2-d.qx;d.qy=d.y*2-d.qy}1j{d.qx=d.x;d.qy=d.y}1K=["C"][4e](GF(d.x,d.y,d.qx,d.qy,1K[1],1K[2]));1s;1q"Q":d.qx=1K[1];d.qy=1K[2];1K=["C"][4e](GF(d.x,d.y,1K[1],1K[2],1K[3],1K[4]));1s;1q"L":1K=["C"][4e](pN(d.x,d.y,1K[1],1K[2]));1s;1q"H":1K=["C"][4e](pN(d.x,d.y,1K[1],d.y));1s;1q"V":1K=["C"][4e](pN(d.x,d.y,d.x,1K[1]));1s;1q"Z":1K=["C"][4e](pN(d.x,d.y,d.X,d.Y));1s}1b 1K},GR=1a(pp,i){if(pp[i].1f>7){pp[i].dE();K pi=pp[i];4x(pi.1f){pp.5W(i++,0,["C"][4e](pi.5W(0,6)))}pp.5W(i,1);ii=5E(p.1f,p2&&p2.1f||0)}},GQ=1a(b6,9d,a1,a2,i){if(b6&&(9d&&(b6[i][0]=="M"&&9d[i][0]!="M"))){9d.5W(i,0,["M",a2.x,a2.y]);a1.bx=0;a1.by=0;a1.x=b6[i][1];a1.y=b6[i][2];ii=5E(p.1f,p2&&p2.1f||0)}};1p(K i=0,ii=5E(p.1f,p2&&p2.1f||0);i<ii;i++){p[i]=GO(p[i],2s);GR(p,i);p2&&(p2[i]=GO(p2[i],fo));p2&&GR(p2,i);GQ(p,p2,2s,fo,i);GQ(p2,p,fo,2s,i);K lz=p[i],mg=p2&&p2[i],pA=lz.1f,pT=p2&&mg.1f;2s.x=lz[pA-2];2s.y=lz[pA-1];2s.bx=4i(lz[pA-4])||2s.x;2s.by=4i(lz[pA-3])||2s.y;fo.bx=p2&&(4i(mg[pT-4])||fo.x);fo.by=p2&&(4i(mg[pT-3])||fo.y);fo.x=p2&&mg[pT-2];fo.y=p2&&mg[pT-1]}if(!p2){8D.hB=dq(p)}1b p2?[p,p2]:p},1d,dq),1d3=R.Ce=du(1a(4y){K 5V=[];1p(K i=0,ii=4y.1f;i<ii;i++){K 7J={},af=4y[i].3x(/^([^:]*):?([\\d\\.]*)/);7J.3X=R.cX(af[1]);if(7J.3X.5u){1b 1d}7J.3X=7J.3X.7d;af[2]&&(7J.2v=af[2]+"%");5V.1G(7J)}1p(i=1,ii=5V.1f-1;i<ii;i++){if(!5V[i].2v){K 3a=4i(5V[i-1].2v||0),5d=0;1p(K j=i+1;j<ii;j++){if(5V[j].2v){5d=5V[j].2v;1s}}if(!5d){5d=100;j=ii}5d=4i(5d);K d=(5d-3a)/(j-i+1);1p(;i<j;i++){3a+=d;5V[i].2v=3a+"%"}}}1b 5V}),oE=R.AA=1a(el,2M){el==2M.1M&&(2M.1M=el.3W);el==2M.4O&&(2M.4O=el.3B);el.3B&&(el.3B.3W=el.3W);el.3W&&(el.3W.3B=el.3B)},1dc=R.Av=1a(el,2M){if(2M.1M===el){1b}oE(el,2M);el.3B=1d;el.3W=2M.1M;2M.1M.3B=el;2M.1M=el},1di=R.Aw=1a(el,2M){if(2M.4O===el){1b}oE(el,2M);el.3B=2M.4O;el.3W=1d;2M.4O.3W=el;2M.4O=el},1d5=R.Ax=1a(el,bp,2M){oE(el,2M);bp==2M.1M&&(2M.1M=el);bp.3B&&(bp.3B.3W=el);el.3B=bp.3B;el.3W=bp;bp.3B=el},1db=R.AG=1a(el,bp,2M){oE(el,2M);bp==2M.4O&&(2M.4O=el);bp.3W&&(bp.3W.3B=el);el.3W=bp.3W;bp.3W=el;el.3B=bp},G7=R.G7=1a(1K,4j){K bb=tY(1K),el={2j:{4j:E},7t:1a(){1b bb}};AF(el,4j);1b el.5b},wf=R.wf=1a(1K,4j){1b rM(1K,G7(1K,4j))},AF=R.AN=1a(el,cm){if(cm==1d){1b el.2j.4j}cm=4B(cm).3t(/\\.{3}|\\AL/g,el.2j.4j||E);K o4=R.vG(cm),4V=0,dx=0,dy=0,sx=1,sy=1,2j=el.2j,m=1T fN;2j.4j=o4||[];if(o4){1p(K i=0,ii=o4.1f;i<ii;i++){K t=o4[i],fj=t.1f,9l=4B(t[0]).49(),7U=t[0]!=9l,gs=7U?m.oj():0,x1,y1,x2,y2,bb;if(9l=="t"&&fj==3){if(7U){x1=gs.x(0,0);y1=gs.y(0,0);x2=gs.x(t[1],t[2]);y2=gs.y(t[1],t[2]);m.i8(x2-x1,y2-y1)}1j{m.i8(t[1],t[2])}}1j{if(9l=="r"){if(fj==2){bb=bb||el.7t(1);m.6l(t[1],bb.x+bb.1m/ 2, bb.y + bb.1w /2);4V+=t[1]}1j{if(fj==4){if(7U){x2=gs.x(t[2],t[3]);y2=gs.y(t[2],t[3]);m.6l(t[1],x2,y2)}1j{m.6l(t[1],t[2],t[3])}4V+=t[1]}}}1j{if(9l=="s"){if(fj==2||fj==3){bb=bb||el.7t(1);m.81(t[1],t[fj-1],bb.x+bb.1m/ 2, bb.y + bb.1w /2);sx*=t[1];sy*=t[fj-1]}1j{if(fj==5){if(7U){x2=gs.x(t[3],t[4]);y2=gs.y(t[3],t[4]);m.81(t[1],t[2],x2,y2)}1j{m.81(t[1],t[2],t[3],t[4])}sx*=t[1];sy*=t[2]}}}1j{if(9l=="m"&&fj==7){m.5F(t[1],t[2],t[3],t[4],t[5],t[6])}}}}2j.il=1;el.5b=m}}el.5b=m;2j.sx=sx;2j.sy=sy;2j.4V=4V;2j.dx=dx=m.e;2j.dy=dy=m.f;if(sx==1&&(sy==1&&(!4V&&2j.3p))){2j.3p.x+=+dx;2j.3p.y+=+dy}1j{2j.il=1}},G6=1a(1i){K l=1i[0];3P(l.49()){1q"t":1b[l,0,0];1q"m":1b[l,1,0,0,1,0,0];1q"r":if(1i.1f==4){1b[l,0,1i[2],1i[3]]}1j{1b[l,0]};1q"s":if(1i.1f==5){1b[l,1,1,1i[3],1i[4]]}1j{if(1i.1f==3){1b[l,1,1]}1j{1b[l,1]}}}},Nc=R.1dP=1a(t1,t2){t2=4B(t2).3t(/\\.{3}|\\AL/g,t1);t1=R.vG(t1)||[];t2=R.vG(t2)||[];K Nf=5E(t1.1f,t2.1f),2L=[],to=[],i=0,j,jj,bO,eS;1p(;i<Nf;i++){bO=t1[i]||G6(t2[i]);eS=t2[i]||G6(bO);if(bO[0]!=eS[0]||(bO[0].49()=="r"&&(bO[2]!=eS[2]||bO[3]!=eS[3])||bO[0].49()=="s"&&(bO[3]!=eS[3]||bO[4]!=eS[4]))){1b}2L[i]=[];to[i]=[];1p(j=0,jj=5E(bO.1f,eS.1f);j<jj;j++){j in bO&&(2L[i][j]=bO[j]);j in eS&&(to[i][j]=eS[j])}}1b{2L:2L,to:to}};R.Bc=1a(x,y,w,h){K 3E;3E=h==1d&&!R.is(x,"1A")?g.3m.hk(x):x;if(3E==1d){1b}if(3E.6L){if(y==1d){1b{3E:3E,1m:3E.2G.1dW||3E.hj,1w:3E.2G.1e3||3E.9n}}1j{1b{3E:3E,1m:y,1w:w}}}1b{3E:1,x:x,y:y,1m:w,1w:h}};R.G1=G1;R.5h={};R.kh=kh;R.5b=1a(a,b,c,d,e,f){1b 1T fN(a,b,c,d,e,f)};1a fN(a,b,c,d,e,f){if(a!=1d){J.a=+a;J.b=+b;J.c=+c;J.d=+d;J.e=+e;J.f=+f}1j{J.a=1;J.b=0;J.c=0;J.d=1;J.e=0;J.f=0}}(1a(au){au.5F=1a(a,b,c,d,e,f){K 2E=[[],[],[]],m=[[J.a,J.c,J.e],[J.b,J.d,J.f],[0,0,1]],5b=[[a,c,e],[b,d,f],[0,0,1]],x,y,z,1F;if(a&&a g8 fN){5b=[[a.a,a.c,a.e],[a.b,a.d,a.f],[0,0,1]]}1p(x=0;x<3;x++){1p(y=0;y<3;y++){1F=0;1p(z=0;z<3;z++){1F+=m[x][z]*5b[z][y]}2E[x][y]=1F}}J.a=2E[0][0];J.b=2E[1][0];J.c=2E[0][1];J.d=2E[1][1];J.e=2E[0][2];J.f=2E[1][2]};au.oj=1a(){K me=J,x=me.a*me.d-me.b*me.c;1b 1T fN(me.d/ x, -me.b /x,-me.c/ x, me.a /x,(me.c*me.f-me.d*me.e)/ x, (me.b * me.e - me.a * me.f) /x)};au.6z=1a(){1b 1T fN(J.a,J.b,J.c,J.d,J.e,J.f)};au.i8=1a(x,y){J.5F(1,0,0,1,x,y)};au.81=1a(x,y,cx,cy){y==1d&&(y=x);(cx||cy)&&J.5F(1,0,0,1,cx,cy);J.5F(x,0,0,y,0,0);(cx||cy)&&J.5F(1,0,0,1,-cx,-cy)};au.6l=1a(a,x,y){a=R.9U(a);x=x||0;y=y||0;K a5=+4b.a5(a).5a(9),9J=+4b.9J(a).5a(9);J.5F(a5,9J,-9J,a5,x,y);J.5F(1,0,0,1,-x,-y)};au.x=1a(x,y){1b x*J.a+y*J.c+J.e};au.y=1a(x,y){1b x*J.b+y*J.d+J.f};au.4w=1a(i){1b+J[4B.G0(97+i)].5a(4)};au.3Y=1a(){1b R.3b?"5b("+[J.4w(0),J.4w(1),J.4w(2),J.4w(3),J.4w(4),J.4w(5)].5x()+")":[J.4w(0),J.4w(2),J.4w(1),J.4w(3),0,0].5x()};au.Od=1a(){1b"BT:Pb.BV.fN(1bO="+J.4w(0)+", CH="+J.4w(2)+", 1bD="+J.4w(1)+", 1bI="+J.4w(3)+", Dx="+J.4w(4)+", Dy="+J.4w(5)+", 1c1=\'6h B8\')"};au.2v=1a(){1b[J.e.5a(4),J.f.5a(4)]};1a vf(a){1b a[0]*a[0]+a[1]*a[1]}1a Gm(a){K G5=4b.bw(vf(a));a[0]&&(a[0]/=G5);a[1]&&(a[1]/=G5)}au.3S=1a(){K 2E={};2E.dx=J.e;2E.dy=J.f;K 1I=[[J.a,J.c],[J.b,J.d]];2E.iE=4b.bw(vf(1I[0]));Gm(1I[0]);2E.iR=1I[0][0]*1I[1][0]+1I[0][1]*1I[1][1];1I[1]=[1I[1][0]-1I[0][0]*2E.iR,1I[1][1]-1I[0][1]*2E.iR];2E.gE=4b.bw(vf(1I[1]));Gm(1I[1]);2E.iR/=2E.gE;K 9J=-1I[0][1],a5=1I[1][1];if(a5<0){2E.6l=R.4V(4b.MV(a5));if(9J<0){2E.6l=9O-2E.6l}}1j{2E.6l=R.4V(4b.vt(9J))}2E.AY=!+2E.iR.5a(9)&&(2E.iE.5a(9)==2E.gE.5a(9)||!2E.6l);2E.1bR=!+2E.iR.5a(9)&&(2E.iE.5a(9)==2E.gE.5a(9)&&!2E.6l);2E.Oc=!+2E.iR.5a(9)&&!2E.6l;1b 2E};au.1bk=1a(MC){K s=MC||J[3S]();if(s.AY){s.iE=+s.iE.5a(4);s.gE=+s.gE.5a(4);s.6l=+s.6l.5a(4);1b(s.dx||s.dy?"t"+[s.dx,s.dy]:E)+(s.iE!=1||s.gE!=1?"s"+[s.iE,s.gE,0,0]:E)+(s.6l?"r"+[s.6l,0,0]:E)}1j{1b"m"+[J.4w(0),J.4w(1),J.4w(2),J.4w(3),J.4w(4),J.4w(5)]}}})(fN.3f);K 6P=c7.ge.3x(/1bm\\/(.*?)\\s/)||c7.ge.3x(/1bf\\/(\\d+)/);if(c7.MB=="1be 1bh, MG."&&(6P&&6P[1]<4||c7.1bg.4d(0,2)=="iP")||c7.MB=="1bp MG."&&(6P&&6P[1]<8)){78.mi=1a(){K 4I=J.4I(-99,-99,J.1m+99,J.1w+99).1n({2m:"3q"});6W(1a(){4I.3M()})}}1j{78.mi=jR}K 4H=1a(){J.1bx=1k},ME=1a(){1b J.fF.4H()},6X=1a(){J.1bB=1l},MA=1a(){1b J.fF.6X()},Hs=1a(e){K de=g.3m.9k.4Q||g.3m.3G.4Q,gg=g.3m.9k.54||g.3m.3G.54;1b{x:e.d0+gg,y:e.cT+de}},Mu=1a(){if(g.3m.dO){1b 1a(1y,1C,fn,1g){K f=1a(e){K 3u=Hs(e);1b fn.2J(1g,e,3u.x,3u.y)};1y.dO(1C,f,1k);if(qk&&qJ[1C]){K Mw=1a(e){K 3u=Hs(e),MF=e;1p(K i=0,ii=e.tS&&e.tS.1f;i<ii;i++){if(e.tS[i].3g==1y){e=e.tS[i];e.fF=MF;e.4H=ME;e.6X=MA;1s}}1b fn.2J(1g,e,3u.x,3u.y)};1y.dO(qJ[1C],Mw,1k)}1b 1a(){1y.qp(1C,f,1k);if(qk&&qJ[1C]){1y.qp(qJ[1C],f,1k)}1b 1l}}}1j{if(g.3m.jq){1b 1a(1y,1C,fn,1g){K f=1a(e){e=e||g.5R.1N;K de=g.3m.9k.4Q||g.3m.3G.4Q,gg=g.3m.9k.54||g.3m.3G.54,x=e.d0+gg,y=e.cT+de;e.4H=e.4H||4H;e.6X=e.6X||6X;1b fn.2J(1g,e,x,y)};1y.jq("on"+1C,f);K Mv=1a(){1y.BK("on"+1C,f);1b 1l};1b Mv}}}}(),5T=[],uB=1a(e){K x=e.d0,y=e.cT,de=g.3m.9k.4Q||g.3m.3G.4Q,gg=g.3m.9k.54||g.3m.3G.54,8r,j=5T.1f;4x(j--){8r=5T[j];if(qk&&e.jn){K i=e.jn.1f,aB;4x(i--){aB=e.jn[i];if(aB.u8==8r.el.fK.id){x=aB.d0;y=aB.cT;(e.fF?e.fF:e).4H();1s}}}1j{e.4H()}K 1u=8r.el.1u,o,3B=1u.jE,1P=1u.3l,4T=1u.2G.4T;g.5R.H0&&1P.8a(1u);1u.2G.4T="3q";o=8r.el.2M.MT(x,y);1u.2G.4T=4T;g.5R.H0&&(3B?1P.87(1u,3B):1P.4m(1u));o&&3j("4F.5T.fl."+8r.el.id,8r.el,o);x+=gg;y+=de;3j("4F.5T.f5."+8r.el.id,8r.mV||8r.el,x-8r.el.fK.x,y-8r.el.fK.y,x,y,e)}},ua=1a(e){R.MR(uB).MQ(ua);K i=5T.1f,8r;4x(i--){8r=5T[i];8r.el.fK={};3j("4F.5T.5d."+8r.el.id,8r.uy||(8r.ro||(8r.mV||8r.el)),e)}5T=[]},3y=R.el={};1p(K i=4U.1f;i--;){(1a(ey){R[ey]=3y[ey]=1a(fn,bt){if(R.is(fn,"1a")){J.4U=J.4U||[];J.4U.1G({1x:ey,f:fn,8W:Mu(J.ec||(J.1u||g.3m),ey,fn,bt||J)})}1b J};R["un"+ey]=3y["un"+ey]=1a(fn){K 4U=J.4U||[],l=4U.1f;4x(l--){if(4U[l].1x==ey&&(R.is(fn,"2x")||4U[l].f==fn)){4U[l].8W();4U.5W(l,1);!4U.1f&&4q J.4U}}1b J}})(4U[i])}3y.1h=1a(1r,1o){K 1h=jk[J.id]=jk[J.id]||{};if(2F.1f==0){1b 1h}if(2F.1f==1){if(R.is(1r,"1A")){1p(K i in 1r){if(1r[3Q](i)){J.1h(i,1r[i])}}1b J}3j("4F.1h.4w."+J.id,J,1h[1r],1r);1b 1h[1r]}1h[1r]=1o;3j("4F.1h.5U."+J.id,J,1o,1r);1b J};3y.pE=1a(1r){if(1r==1d){jk[J.id]={}}1j{jk[J.id]&&4q jk[J.id][1r]}1b J};3y.1c3=1a(){1b 6z(jk[J.id]||{})};3y.7u=1a(tP,tO,Hp,Mz){1b J.hi(tP,Hp).fB(tO,Mz||Hp)};3y.1bH=1a(tP,tO){1b J.1ci(tP).1cg(tO)};K 7j=[];3y.5T=1a(HI,HK,HE,mV,ro,uy){1a 3a(e){(e.fF||e).4H();K x=e.d0,y=e.cT,de=g.3m.9k.4Q||g.3m.3G.4Q,gg=g.3m.9k.54||g.3m.3G.54;J.fK.id=e.u8;if(qk&&e.jn){K i=e.jn.1f,aB;4x(i--){aB=e.jn[i];J.fK.id=aB.u8;if(aB.u8==J.fK.id){x=aB.d0;y=aB.cT;1s}}}J.fK.x=x+gg;J.fK.y=y+de;!5T.1f&&R.bi(uB).7k(ua);5T.1G({el:J,mV:mV,ro:ro,uy:uy});HK&&3j.on("4F.5T.3a."+J.id,HK);HI&&3j.on("4F.5T.f5."+J.id,HI);HE&&3j.on("4F.5T.5d."+J.id,HE);3j("4F.5T.3a."+J.id,ro||(mV||J),e.d0+gg,e.cT+de,e)}J.fK={};7j.1G({el:J,3a:3a});J.7T(3a);1b J};3y.1cM=1a(f){f?3j.on("4F.5T.fl."+J.id,f):3j.8W("4F.5T.fl."+J.id)};3y.1cN=1a(){K i=7j.1f;4x(i--){if(7j[i].el==J){J.1cw(7j[i].3a);7j.5W(i,1);3j.8W("4F.5T.*."+J.id)}}!7j.1f&&R.MR(uB).MQ(ua);5T=[]};78.ah=1a(x,y,r){K 2E=R.5h.ah(J,x||0,y||0,r||0);J.7C&&J.7C.1G(2E);1b 2E};78.4I=1a(x,y,w,h,r){K 2E=R.5h.4I(J,x||0,y||0,w||0,h||0,r||0);J.7C&&J.7C.1G(2E);1b 2E};78.bQ=1a(x,y,rx,ry){K 2E=R.5h.bQ(J,x||0,y||0,rx||0,ry||0);J.7C&&J.7C.1G(2E);1b 2E};78.1K=1a(9E){9E&&(!R.is(9E,4E)&&(!R.is(9E[0],4t)&&(9E+=E)));K 2E=R.5h.1K(R.7p[3w](R,2F),J);J.7C&&J.7C.1G(2E);1b 2E};78.ac=1a(4L,x,y,w,h){K 2E=R.5h.ac(J,4L||"MP:Ae",x||0,y||0,w||0,h||0);J.7C&&J.7C.1G(2E);1b 2E};78.2g=1a(x,y,2g){K 2E=R.5h.2g(J,x||0,y||0,4B(2g));J.7C&&J.7C.1G(2E);1b 2E};78.5U=1a(uo){!R.is(uo,"4t")&&(uo=3R.3f.5W.2J(2F,0,2F.1f));K 2E=1T nF(uo);J.7C&&J.7C.1G(2E);2E["2M"]=J;2E["1C"]="5U";1b 2E};78.1cA=1a(5U){J.7C=5U||J.5U()};78.1bt=1a(5U){K 2E=J.7C;4q J.7C;1b 2E};78.nO=1a(1m,1w){1b R.5h.nO.2J(J,1m,1w)};78.i9=1a(x,y,w,h,cP){1b R.5h.i9.2J(J,x,y,w,h,cP)};78.1M=78.4O=1d;78.4F=R;K MO=1a(4f){K 5P=4f.sa(),3m=4f.uP,3G=3m.3G,gl=3m.9k,nG=gl.nG||(3G.nG||0),nl=gl.nl||(3G.nl||0),1M=5P.1M+(g.5R.MU||(gl.4Q||3G.4Q))-nG,2f=5P.2f+(g.5R.1bu||(gl.54||3G.54))-nl;1b{y:1M,x:2f}};78.MT=1a(x,y){K 2M=J,3b=2M.1Z,3g=g.3m.ss(x,y);if(g.5R.H0&&3g.6L=="3b"){K so=MO(3b),sr=3b.1bw();sr.x=x-so.x;sr.y=y-so.y;sr.1m=sr.1w=1;K uj=3b.1bd(sr,1d);if(uj.1f){3g=uj[uj.1f-1]}}if(!3g){1b 1d}4x(3g.3l&&(3g!=3b.3l&&!3g.4F)){3g=3g.3l}3g==2M.1Z.3l&&(3g=3b);3g=3g&&3g.4F?2M.MK(3g.AR):1d;1b 3g};78.1bn=1a(3p){K 5U=J.5U();J.a6(1a(el){if(R.GZ(el.7t(),3p)){5U.1G(el)}});1b 5U};78.MK=1a(id){K bU=J.4O;4x(bU){if(bU.id==id){1b bU}bU=bU.3B}1b 1d};78.a6=1a(1X,yn){K bU=J.4O;4x(bU){if(1X.2J(yn,bU)===1k){1b J}bU=bU.3B}1b J};78.1bj=1a(x,y){K 5U=J.5U();J.a6(1a(el){if(el.km(x,y)){5U.1G(el)}});1b 5U};1a 1bl(){1b J.x+S+J.y}1a Hf(){1b J.x+S+J.y+S+J.1m+" \\1bC "+J.1w}3y.km=1a(x,y){K rp=J.i3=cZ[J.1C](J);if(J.1n("4j")&&J.1n("4j").1f){rp=R.wf(rp,J.1n("4j"))}1b R.MI(rp,x,y)};3y.7t=1a(MN){if(J.5S){1b{}}K 2j=J.2j;if(MN){if(2j.8P||!2j.sH){J.i3=cZ[J.1C](J);2j.sH=tY(J.i3);2j.sH.3Y=Hf;2j.8P=0}1b 2j.sH}if(2j.8P||(2j.il||!2j.3p)){if(2j.8P||!J.i3){2j.sH=0;J.i3=cZ[J.1C](J)}2j.3p=tY(rM(J.i3,J.5b));2j.3p.3Y=Hf;2j.8P=2j.il=0}1b 2j.3p};3y.6z=1a(){if(J.5S){1b 1d}K 2E=J.2M[J.1C]().1n(J.1n());J.7C&&J.7C.1G(2E);1b 2E};3y.dN=1a(dN){if(J.1C=="2g"){1b 1d}dN=dN||{};K s={1m:(dN.1m||10)+(+J.1n("2m-1m")||1),2d:dN.2d||1k,2X:dN.2X||0.5,Hj:dN.Hj||0,Hh:dN.Hh||0,3X:dN.3X||"#eg"},c=s.1m/2,r=J.2M,2E=r.5U(),1K=J.i3||cZ[J.1C](J);1K=J.5b?rM(1K,J.5b):1K;1p(K i=1;i<c+1;i++){2E.1G(r.1K(1K).1n({2m:s.3X,2d:s.2d?s.3X:"3q","2m-iY":"5m","2m-ez":"5m","2m-1m":+(s.1m/ c * i).5a(3), 2X:+(s.2X /c).5a(3)}))}1b 2E.87(J).i8(s.Hj,s.Hh)};K 1c0={},ts=1a(6D,7e,72,74,7V,82,8o,8l,1f){if(1f==1d){1b kF(6D,7e,72,74,7V,82,8o,8l)}1j{1b R.sj(6D,7e,72,74,7V,82,8o,8l,MM(6D,7e,72,74,7V,82,8o,8l,1f))}},t5=1a(Ha,tj){1b 1a(1K,1f,ML){1K=kh(1K);K x,y,p,l,sp="",sY={},7h,6w=0;1p(K i=0,ii=1K.1f;i<ii;i++){p=1K[i];if(p[0]=="M"){x=+p[1];y=+p[2]}1j{l=ts(x,y,p[1],p[2],p[3],p[4],p[5],p[6]);if(6w+l>1f){if(tj&&!sY.3a){7h=ts(x,y,p[1],p[2],p[3],p[4],p[5],p[6],1f-6w);sp+=["C"+7h.3a.x,7h.3a.y,7h.m.x,7h.m.y,7h.x,7h.y];if(ML){1b sp}sY.3a=sp;sp=["M"+7h.x,7h.y+"C"+7h.n.x,7h.n.y,7h.5d.x,7h.5d.y,p[5],p[6]].5x();6w+=l;x=+p[5];y=+p[6];ap}if(!Ha&&!tj){7h=ts(x,y,p[1],p[2],p[3],p[4],p[5],p[6],1f-6w);1b{x:7h.x,y:7h.y,fw:7h.fw}}}6w+=l;x=+p[5];y=+p[6]}sp+=p.dE()+p}sY.5d=sp;7h=Ha?6w:tj?sY:R.sj(x,y,p[0],p[1],p[2],p[3],p[4],p[5],1);7h.fw&&(7h={x:7h.x,y:7h.y,fw:7h.fw});1b 7h}};K dP=t5(1),oP=t5(),v8=t5(0,1);R.dP=dP;R.oP=oP;R.oD=1a(1K,2L,to){if(J.dP(1K)-to<1E-6){1b v8(1K,2L).5d}K a=v8(1K,to,1);1b 2L?v8(a,2L).5d:a};3y.dP=1a(){K 1K=J.cZ();if(!1K){1b}if(J.1u.dP){1b J.1u.dP()}1b dP(1K)};3y.oP=1a(1f){K 1K=J.cZ();if(!1K){1b}1b oP(1K,1f)};3y.cZ=1a(){K 1K,cZ=R.Cp[J.1C];if(J.1C=="2g"||J.1C=="5U"){1b}if(cZ){1K=cZ(J)}1b 1K};3y.oD=1a(2L,to){K 1K=J.cZ();if(!1K){1b}1b R.oD(1K,2L,to)};K ef=R.Nj={oT:1a(n){1b n},"<":1a(n){1b 6Q(n,1.7)},">":1a(n){1b 6Q(n,0.48)},"<>":1a(n){K q=0.48-n/ 1.1bM, Q = 4b.bw(0.1bN + q * q), x = Q - q, X = 6Q(4G(x), 1 /3)*(x<0?-1:1),y=-Q-q,Y=6Q(4G(y),1/3)*(y<0?-1:1),t=X+Y+0.5;1b(1-t)*3*t*t+t*t*t},MH:1a(n){K s=1.MJ;1b n*n*((s+1)*n-s)},Mx:1a(n){n=n-1;K s=1.MJ;1b n*n*((s+1)*n+s)+1},1bL:1a(n){if(n==!!n){1b n}1b 6Q(2,-10*n)*4b.9J((n-0.MS)*(2*PI)/0.3)+1},1eb:1a(n){K s=7.1dQ,p=2.75,l;if(n<1/p){l=s*n*n}1j{if(n<2/p){n-=1.5/p;l=s*n*n+0.75}1j{if(n<2.5/p){n-=2.25/p;l=s*n*n+0.1dM}1j{n-=2.1dL/p;l=s*n*n+0.1dO}}}1b l}};ef.1e0=ef["A8-in"]=ef["<"];ef.1e2=ef["A8-2E"]=ef[">"];ef.1e1=ef["A8-in-2E"]=ef["<>"];ef["yQ-in"]=ef.MH;ef["yQ-2E"]=ef.Mx;K 5G=[],B5=3z.1dX||(3z.1dT||(3z.1dR||(3z.1eg||(3z.1e4||1a(1X){6W(1X,16)})))),7n=1a(){K My=+1T 5Y,l=0;1p(;l<5G.1f;l++){K e=5G[l];if(e.el.5S||e.Bq){ap}K g4=My-e.3a,ms=e.ms,6B=e.6B,2L=e.2L,57=e.57,to=e.to,t=e.t,3h=e.el,5U={},7S,8Z={},1r;if(e.m9){g4=(e.m9*e.2V.1M-e.3W)/(e.cr-e.3W)*ms;e.7l=e.m9;4q e.m9;e.6x&&5G.5W(l--,1)}1j{e.7l=(e.3W+(e.cr-e.3W)*(g4/ ms)) /e.2V.1M}if(g4<0){ap}if(g4<ms){K 3u=6B(g4/ms);1p(K 1n in 2L){if(2L[3Q](1n)){3P(uO[1n]){1q nu:7S=+2L[1n]+3u*ms*57[1n];1s;1q"b4":7S="4p("+[tR(5m(2L[1n].r+3u*ms*57[1n].r)),tR(5m(2L[1n].g+3u*ms*57[1n].g)),tR(5m(2L[1n].b+3u*ms*57[1n].b))].5x(",")+")";1s;1q"1K":7S=[];1p(K i=0,ii=2L[1n].1f;i<ii;i++){7S[i]=[2L[1n][i][0]];1p(K j=1,jj=2L[1n][i].1f;j<jj;j++){7S[i][j]=+2L[1n][i][j]+3u*ms*57[1n][i][j]}7S[i]=7S[i].5x(S)}7S=7S.5x(S);1s;1q"4j":if(57[1n].Ng){7S=[];1p(i=0,ii=2L[1n].1f;i<ii;i++){7S[i]=[2L[1n][i][0]];1p(j=1,jj=2L[1n][i].1f;j<jj;j++){7S[i][j]=2L[1n][i][j]+3u*ms*57[1n][i][j]}}}1j{K 4w=1a(i){1b+2L[1n][i]+3u*ms*57[1n][i]};7S=[["m",4w(0),4w(1),4w(2),4w(3),4w(4),4w(5)]]}1s;1q"AC":if(1n=="76-4I"){7S=[];i=4;4x(i--){7S[i]=+2L[1n][i]+3u*ms*57[1n][i]}}1s;5N:K jG=[][4e](2L[1n]);7S=[];i=3h.2M.ab[1n].1f;4x(i--){7S[i]=+jG[i]+3u*ms*57[1n][i]}1s}5U[1n]=7S}}3h.1n(5U);(1a(id,3h,2V){6W(1a(){3j("4F.2V.vk."+id,3h,2V)})})(3h.id,3h,e.2V)}1j{(1a(f,el,a){6W(1a(){3j("4F.2V.vk."+el.id,el,a);3j("4F.2V.1e5."+el.id,el,a);R.is(f,"1a")&&f.2J(el)})})(e.1X,3h,e.2V);3h.1n(to);5G.5W(l--,1);if(e.mh>1&&!e.3B){1p(1r in to){if(to[3Q](1r)){8Z[1r]=e.jU[1r]}}e.el.1n(8Z);md(e.2V,e.el,e.2V.9r[0],1d,e.jU,e.mh-1)}if(e.3B&&!e.6x){md(e.2V,e.el,e.3B,1d,e.jU,e.mh)}}}R.3b&&(3h&&(3h.2M&&3h.2M.mi()));5G.1f&&B5(7n)},tR=1a(3X){1b 3X>gu?gu:3X<0?0:3X};3y.LQ=1a(el,2V,1D,ms,6B,1X){K 1g=J;if(1g.5S){1X&&1X.2J(1g);1b 1g}K a=1D g8 f7?1D:R.7n(1D,ms,6B,1X),x,y;md(a,1g,a.9r[0],1d,1g.1n());1p(K i=0,ii=5G.1f;i<ii;i++){if(5G[i].2V==2V&&5G[i].el==el){5G[ii-1].3a=5G[i].3a;1s}}1b 1g};1a MZ(t,6D,7e,8o,8l,5C){K cx=3*6D,bx=3*(8o-6D)-cx,ax=1-cx-bx,cy=3*7e,by=3*(8l-7e)-cy,ay=1-cy-by;1a Cu(t){1b((ax*t+bx)*t+cx)*t}1a Nd(x,rA){K t=MD(x,rA);1b((ay*t+by)*t+cy)*t}1a MD(x,rA){K t0,t1,t2,x2,d2,i;1p(t2=x,i=0;i<8;i++){x2=Cu(t2)-x;if(4G(x2)<rA){1b t2}d2=(3*ax*t2+2*bx)*t2+cx;if(4G(d2)<1E-6){1s}t2=t2-x2/d2}t0=0;t1=1;t2=x;if(t2<t0){1b t0}if(t2>t1){1b t1}4x(t0<t1){x2=Cu(t2);if(4G(x2-x)<rA){1b t2}if(x>x2){t0=t2}1j{t1=t2}t2=(t1-t0)/2+t0}1b t2}1b Nd(t,1/(gj*5C))}3y.1cX=1a(f){f?3j.on("4F.2V.vk."+J.id,f):3j.8W("4F.2V.vk."+J.id);1b J};1a f7(2V,ms){K 9r=[],Ch={};J.ms=ms;J.e1=1;if(2V){1p(K 1n in 2V){if(2V[3Q](1n)){Ch[4i(1n)]=2V[1n];9r.1G(4i(1n))}}9r.hP(Ne)}J.2V=Ch;J.1M=9r[9r.1f-1];J.9r=9r}f7.3f.hp=1a(hp){K a=1T f7(J.2V,J.ms);a.e1=J.e1;a.t4=+hp||0;1b a};f7.3f.mh=1a(e1){K a=1T f7(J.2V,J.ms);a.t4=J.t4;a.e1=4b.bf(5E(e1,0))||1;1b a};1a md(2V,1g,cr,7l,jU,e1){cr=4i(cr);K 1D,jz,yT,9r=[],3B,3W,qS,ms=2V.ms,2L={},to={},57={};if(7l){1p(i=0,ii=5G.1f;i<ii;i++){K e=5G[i];if(e.el.id==1g.id&&e.2V==2V){if(e.cr!=cr){5G.5W(i,1);yT=1}1j{jz=e}1g.1n(e.jU);1s}}}1j{7l=+to}1p(K i=0,ii=2V.9r.1f;i<ii;i++){if(2V.9r[i]==cr||2V.9r[i]>7l*2V.1M){cr=2V.9r[i];3W=2V.9r[i-1]||0;ms=ms/2V.1M*(cr-3W);3B=2V.9r[i+1];1D=2V.2V[cr];1s}1j{if(7l){1g.1n(2V.2V[2V.9r[i]])}}}if(!1D){1b}if(!jz){1p(K 1n in 1D){if(1D[3Q](1n)){if(uO[3Q](1n)||1g.2M.ab[3Q](1n)){2L[1n]=1g.1n(1n);2L[1n]==1d&&(2L[1n]=Na[1n]);to[1n]=1D[1n];3P(uO[1n]){1q nu:57[1n]=(to[1n]-2L[1n])/ms;1s;1q"b4":2L[1n]=R.cX(2L[1n]);K v6=R.cX(to[1n]);57[1n]={r:(v6.r-2L[1n].r)/ ms, g:(v6.g - 2L[1n].g) /ms,b:(v6.b-2L[1n].b)/ms};1s;1q"1K":K Ay=kh(2L[1n],to[1n]),Nb=Ay[1];2L[1n]=Ay[0];57[1n]=[];1p(i=0,ii=2L[1n].1f;i<ii;i++){57[1n][i]=[0];1p(K j=1,jj=2L[1n][i].1f;j<jj;j++){57[1n][i][j]=(Nb[i][j]-2L[1n][i][j])/ms}}1s;1q"4j":K 2j=1g.2j,eq=Nc(2j[1n],to[1n]);if(eq){2L[1n]=eq.2L;to[1n]=eq.to;57[1n]=[];57[1n].Ng=1l;1p(i=0,ii=2L[1n].1f;i<ii;i++){57[1n][i]=[2L[1n][i][0]];1p(j=1,jj=2L[1n][i].1f;j<jj;j++){57[1n][i][j]=(to[1n][i][j]-2L[1n][i][j])/ms}}}1j{K m=1g.5b||1T fN,g2={2j:{4j:2j.4j},7t:1a(){1b 1g.7t(1)}};2L[1n]=[m.a,m.b,m.c,m.d,m.e,m.f];AF(g2,to[1n]);to[1n]=g2.2j.4j;57[1n]=[(g2.5b.a-m.a)/ ms, (g2.5b.b - m.b) /ms,(g2.5b.c-m.c)/ ms, (g2.5b.d - m.d) /ms,(g2.5b.e-m.e)/ ms, (g2.5b.f - m.f) /ms]}1s;1q"AC":K 2Z=4B(1D[1n])[3S](6f),jG=4B(2L[1n])[3S](6f);if(1n=="76-4I"){2L[1n]=jG;57[1n]=[];i=jG.1f;4x(i--){57[1n][i]=(2Z[i]-2L[1n][i])/ms}}to[1n]=2Z;1s;5N:2Z=[][4e](1D[1n]);jG=[][4e](2L[1n]);57[1n]=[];i=1g.2M.ab[1n].1f;4x(i--){57[1n][i]=((2Z[i]||0)-(jG[i]||0))/ms}1s}}}}K 6B=1D.6B,gP=R.Nj[6B];if(!gP){gP=4B(6B).3x(N9);if(gP&&gP.1f==5){K hB=gP;gP=1a(t){1b MZ(t,+hB[1],+hB[2],+hB[3],+hB[4],ms)}}1j{gP=N1}}qS=1D.3a||(2V.3a||+1T 5Y);e={2V:2V,cr:cr,qS:qS,3a:qS+(2V.t4||0),7l:0,m9:7l||0,6x:1k,ms:ms,6B:gP,2L:2L,57:57,to:to,el:1g,1X:1D.1X,3W:3W,3B:3B,mh:e1||2V.e1,hQ:1g.1n(),jU:jU};5G.1G(e);if(7l&&(!jz&&!yT)){e.6x=1l;e.3a=1T 5Y-ms*7l;if(5G.1f==1){1b 7n()}}if(yT){e.3a=1T 5Y-e.ms*7l}5G.1f==1&&B5(7n)}1j{jz.m9=7l;jz.3a=1T 5Y-jz.ms*7l}3j("4F.2V.3a."+1g.id,1g,2V)}R.7n=1a(1D,ms,6B,1X){if(1D g8 f7){1b 1D}if(R.is(6B,"1a")||!6B){1X=1X||(6B||1d);6B=1d}1D=5g(1D);ms=+ms||0;K p={},eu,1n;1p(1n in 1D){if(1D[3Q](1n)&&(4i(1n)!=1n&&4i(1n)+"%"!=1n)){eu=1l;p[1n]=1D[1n]}}if(!eu){1b 1T f7(1D,ms)}1j{6B&&(p.6B=6B);1X&&(p.1X=1X);1b 1T f7({100:p},ms)}};3y.4X=1a(1D,ms,6B,1X){K 1g=J;if(1g.5S){1X&&1X.2J(1g);1b 1g}K 2V=1D g8 f7?1D:R.7n(1D,ms,6B,1X);md(2V,1g,2V.9r[0],1d,1g.1n());1b 1g};3y.1dI=1a(2V,1o){if(2V&&1o!=1d){J.7l(2V,6S(1o,2V.ms)/2V.ms)}1b J};3y.7l=1a(2V,1o){K 2E=[],i=0,6w,e;if(1o!=1d){md(2V,J,-1,6S(1o,1));1b J}1j{6w=5G.1f;1p(;i<6w;i++){e=5G[i];if(e.el.id==J.id&&(!2V||e.2V==2V)){if(2V){1b e.7l}2E.1G({2V:e.2V,7l:e.7l})}}if(2V){1b 0}1b 2E}};3y.LH=1a(2V){1p(K i=0;i<5G.1f;i++){if(5G[i].el.id==J.id&&(!2V||5G[i].2V==2V)){if(3j("4F.2V.LH."+J.id,J,5G[i].2V)!==1k){5G[i].Bq=1l}}}1b J};3y.LK=1a(2V){1p(K i=0;i<5G.1f;i++){if(5G[i].el.id==J.id&&(!2V||5G[i].2V==2V)){K e=5G[i];if(3j("4F.2V.LK."+J.id,J,e.2V)!==1k){4q e.Bq;J.7l(e.2V,e.7l)}}}1b J};3y.6x=1a(2V){1p(K i=0;i<5G.1f;i++){if(5G[i].el.id==J.id&&(!2V||5G[i].2V==2V)){if(3j("4F.2V.6x."+J.id,J,5G[i].2V)!==1k){5G.5W(i--,1)}}}1b J};1a Bk(2M){1p(K i=0;i<5G.1f;i++){if(5G[i].el.2M==2M){5G.5W(i--,1)}}}3j.on("4F.3M",Bk);3j.on("4F.9I",Bk);3y.3Y=1a(){1b"mo\\mk\\1dk 1A"};K nF=1a(1J){J.1J=[];J.1f=0;J.1C="5U";if(1J){1p(K i=0,ii=1J.1f;i<ii;i++){if(1J[i]&&(1J[i].5L==3y.5L||1J[i].5L==nF)){J[J.1J.1f]=J.1J[J.1J.1f]=1J[i];J.1f++}}}},7H=nF.3f;7H.1G=1a(){K 1i,6w;1p(K i=0,ii=2F.1f;i<ii;i++){1i=2F[i];if(1i&&(1i.5L==3y.5L||1i.5L==nF)){6w=J.1J.1f;J[6w]=J.1J[6w]=1i;J.1f++}}1b J};7H.eO=1a(){J.1f&&4q J[J.1f--];1b J.1J.eO()};7H.a6=1a(1X,yn){1p(K i=0,ii=J.1J.1f;i<ii;i++){if(1X.2J(yn,J.1J[i],i)===1k){1b J}}1b J};1p(K 4h in 3y){if(3y[3Q](4h)){7H[4h]=1a(fX){1b 1a(){K 4M=2F;1b J.a6(1a(el){el[fX][3w](el,4M)})}}(4h)}}7H.1n=1a(1x,1o){if(1x&&(R.is(1x,4t)&&R.is(1x[0],"1A"))){1p(K j=0,jj=1x.1f;j<jj;j++){J.1J[j].1n(1x[j])}}1j{1p(K i=0,ii=J.1J.1f;i<ii;i++){J.1J[i].1n(1x,1o)}}1b J};7H.9I=1a(){4x(J.1f){J.eO()}};7H.5W=1a(1W,71,1du){1W=1W<0?5E(J.1f+1W,0):1W;71=5E(0,6S(J.1f-1W,71));K zD=[],AJ=[],2w=[],i;1p(i=2;i<2F.1f;i++){2w.1G(2F[i])}1p(i=0;i<71;i++){AJ.1G(J[1W+i])}1p(;i<J.1f-1W;i++){zD.1G(J[1W+i])}K oZ=2w.1f;1p(i=0;i<oZ+zD.1f;i++){J.1J[1W+i]=J[1W+i]=i<oZ?2w[i]:zD[i-oZ]}i=J.1J.1f=J.1f-=71-oZ;4x(J[i]){4q J[i++]}1b 1T nF(AJ)};7H.Az=1a(el){1p(K i=0,ii=J.1f;i<ii;i++){if(J[i]==el){J.5W(i,1);1b 1l}}};7H.4X=1a(1D,ms,6B,1X){(R.is(6B,"1a")||!6B)&&(1X=6B||1d);K 6w=J.1J.1f,i=6w,1i,5U=J,zs;if(!6w){1b J}1X&&(zs=1a(){!--6w&&1X.2J(5U)});6B=R.is(6B,4E)?6B:zs;K 2V=R.7n(1D,ms,6B,zs);1i=J.1J[--i].4X(2V);4x(i--){J.1J[i]&&(!J.1J[i].5S&&J.1J[i].LQ(1i,2V,2V));J.1J[i]&&!J.1J[i].5S||6w--}1b J};7H.gN=1a(el){K i=J.1J.1f;4x(i--){J.1J[i].gN(el)}1b J};7H.7t=1a(){K x=[],y=[],x2=[],y2=[];1p(K i=J.1J.1f;i--;){if(!J.1J[i].5S){K 5P=J.1J[i].7t();x.1G(5P.x);y.1G(5P.y);x2.1G(5P.x+5P.1m);y2.1G(5P.y+5P.1w)}}x=6S[3w](0,x);y=6S[3w](0,y);x2=5E[3w](0,x2);y2=5E[3w](0,y2);1b{x:x,y:y,x2:x2,y2:y2,1m:x2-x,1w:y2-y}};7H.6z=1a(s){s=J.2M.5U();1p(K i=0,ii=J.1J.1f;i<ii;i++){s.1G(J.1J[i].6z())}1b s};7H.3Y=1a(){1b"mo\\mk\\1dq 5U"};7H.dN=1a(Lx){K 8M=J.2M.5U();J.a6(1a(ec,1W){K g=ec.dN(Lx);if(g!=1d){g.a6(1a(Ly,1dr){8M.1G(Ly)})}});1b 8M};7H.km=1a(x,y){K km=1k;J.a6(1a(el){if(el.km(x,y)){km=1l;1b 1k}});1b km};R.1bc=1a(3d){if(!3d.aa){1b 3d}J.eT=J.eT||{};K kn={w:3d.w,aa:{},hV:{}},9j=3d.aa["3d-9j"];1p(K 6Y in 3d.aa){if(3d.aa[3Q](6Y)){kn.aa[6Y]=3d.aa[6Y]}}if(J.eT[9j]){J.eT[9j].1G(kn)}1j{J.eT[9j]=[kn]}if(!3d.3b){kn.aa["Cf-Ci-em"]=b8(3d.aa["Cf-Ci-em"],10);1p(K nV in 3d.hV){if(3d.hV[3Q](nV)){K 1K=3d.hV[nV];kn.hV[nV]={w:1K.w,k:{},d:1K.d&&"M"+1K.d.3t(/[17r]/g,1a(9l){1b{l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"}[9l]||"M"})+"z"};if(1K.k){1p(K k in 1K.k){if(1K[3Q](k)){kn.hV[nV].k[k]=1K.k[k]}}}}}}1b 3d};78.LE=1a(9j,bz,2G,oA){oA=oA||"wL";2G=2G||"wL";bz=+bz||({wL:rD,17s:17u,17t:vK,17m:Dc}[bz]||rD);if(!R.eT){1b}K 3d=R.eT[9j];if(!3d){K 1x=1T eh("(^|\\\\s)"+9j.3t(/[^\\w\\d\\s+!~.:2j-]/g,E)+"(\\\\s|$)","i");1p(K wB in R.eT){if(R.eT[3Q](wB)){if(1x.9z(wB)){3d=R.eT[wB];1s}}}}K ka;if(3d){1p(K i=0,ii=3d.1f;i<ii;i++){ka=3d[i];if(ka.aa["3d-bz"]==bz&&((ka.aa["3d-2G"]==2G||!ka.aa["3d-2G"])&&ka.aa["3d-oA"]==oA)){1s}}}1b ka};78.17p=1a(x,y,4E,3d,4l,hQ,vQ,vM){hQ=hQ||"zP";vQ=5E(6S(vQ||0,1),-1);vM=5E(6S(vM||1,3),1);K mb=4B(4E)[3S](E),dE=0,rz=0,1K=E,81;R.is(3d,"4E")&&(3d=J.LE(3d));if(3d){81=(4l||16)/3d.aa["Cf-Ci-em"];K bb=3d.aa.3p[3S](6f),1M=+bb[0],vV=bb[3]-bb[1],Bu=0,1w=+bb[1]+(hQ=="17A"?vV+ +3d.aa.17C:vV/2);1p(K i=0,ii=mb.1f;i<ii;i++){if(mb[i]=="\\n"){dE=0;ia=0;rz=0;Bu+=vV*vM}1j{K 3W=rz&&3d.hV[mb[i-1]]||{},ia=3d.hV[mb[i]];dE+=rz?(3W.w||3d.w)+(3W.k&&3W.k[mb[i]]||0)+3d.w*vQ:0;rz=1}if(ia&&ia.d){1K+=R.wf(ia.d,["t",dE*81,Bu*81,"s",81,81,1M,1w,"t",(x-1M)/ 81, (y - 1w) /81])}}}1b J.1K(1K).1n({2d:"#eg",2m:"3q"})};78.5F=1a(eu){if(R.is(eu,"4t")){K 1F=J.5U(),i=0,ii=eu.1f,j;1p(;i<ii;i++){j=eu[i]||{};b7[3Q](j.1C)&&1F.1G(J[j.1C]().1n(j))}}1b 1F};R.7p=1a(eB,1D){K 2w=R.is(1D,4t)?[0][4e](1D):2F;eB&&(R.is(eB,4E)&&(2w.1f-1&&(eB=eB.3t(Mq,1a(7X,i){1b 2w[++i]==1d?E:2w[i]}))));1b eB||E};R.17v=1a(){K Mp=/\\{([^\\}]+)\\}/g,Mr=/(?:(?:^|\\.)(.+?)(?=\\[|\\.|$|\\()|\\[(\'|")(.+?)\\2\\])(\\(\\))?/g,Mf=1a(73,1r,1y){K 1F=1y;1r.3t(Mr,1a(73,1x,Ms,Mn,Mo){1x=1x||Mn;if(1F){if(1x in 1F){1F=1F[1x]}2A 1F=="1a"&&(Mo&&(1F=1F()))}});1F=(1F==1d||1F==1y?73:1F)+"";1b 1F};1b 1a(7X,1y){1b 61(7X).3t(Mp,1a(73,1r){1b Mf(73,1r,1y)})}}();R.17k=1a(){tf.Bb?g.5R.cB=tf.is:4q cB;1b R};R.st=7H;(1a(3m,c5,f){if(3m.qL==1d&&3m.dO){3m.dO(c5,f=1a(){3m.qp(c5,f,1k);3m.qL="xt"},1k);3m.qL="dQ"}1a BU(){/in/.9z(3m.qL)?6W(BU,9):R.3j("4F.lK")}BU()})(2K,"175");3j.on("4F.lK",1a(){c5=1l});(1a(){if(!R.3b){1b}K 3Q="86",4B=61,4i=e6,b8=6u,4b=3A,5E=4b.4o,4G=4b.4G,6Q=4b.6Q,6f=/[, ]+/,3j=R.3j,E="",S=" ";K dB="6s://dC.w3.e9/QO/dB",Me={5J:"M5,0 0,2.5 5,5z",sX:"M5,0 0,2.5 5,5 3.5,3 3.5,2z",xF:"M2.5,0 5,2.5 2.5,5 0,2.5z",7F:"M6,1 1,3.5 6,6",xD:"M2.5,179.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,176"},dw={};K $=1a(el,1n){if(1n){if(2A el=="4E"){el=$(el)}1p(K 1r in 1n){if(1n[3Q](1r)){if(1r.hb(0,6)=="dB:"){el.sg(dB,1r.hb(6),4B(1n[1r]))}1j{el.bS(1r,4B(1n[1r]))}}}}1j{el=R.8F.3m.16Z("6s://dC.w3.e9/iv/3b",el);el.2G&&(el.2G.16Y="BM(0,0,0,0)")}1b el},s9=1a(1g,4y){K 1C="oT",id=1g.id+4y,fx=0.5,fy=0.5,o=1g.1u,eZ=1g.2M,s=o.2G,el=R.8F.3m.hk(id);if(!el){4y=4B(4y).3t(R.C0,1a(73,BO,Am){1C="wH";if(BO&&Am){fx=4i(BO);fy=4i(Am);K A4=(fy>0.5)*2-1;6Q(fx-0.5,2)+6Q(fy-0.5,2)>0.25&&((fy=4b.bw(0.25-6Q(fx-0.5,2))*A4+0.5)&&(fy!=0.5&&(fy=fy.5a(5)-1E-5*A4)))}1b E});4y=4y.3S(/\\s*\\-\\s*/);if(1C=="oT"){K 8n=4y.dE();8n=-4i(8n);if(9B(8n)){1b 1d}K 9N=[0,0,4b.a5(R.9U(8n)),4b.9J(R.9U(8n))],4o=1/(5E(4G(9N[2]),4G(9N[3]))||1);9N[2]*=4o;9N[3]*=4o;if(9N[2]<0){9N[0]=-9N[2];9N[2]=0}if(9N[3]<0){9N[1]=-9N[3];9N[3]=0}}K 5V=R.Ce(4y);if(!5V){1b 1d}id=id.3t(/[\\(\\)\\s,\\A2#]/g,"2j");if(1g.4y&&id!=1g.4y.id){eZ.ee.8a(1g.4y);4q 1g.4y}if(!1g.4y){el=$(1C+"170",{id:id});1g.4y=el;$(el,1C=="wH"?{fx:fx,fy:fy}:{x1:9N[0],y1:9N[1],x2:9N[2],y2:9N[3],172:1g.5b.oj()});eZ.ee.4m(el);1p(K i=0,ii=5V.1f;i<ii;i++){el.4m($("6x",{2v:5V[i].2v?5V[i].2v:i?"100%":"0%","6x-3X":5V[i].3X||"#nc"}))}}}$(o,{2d:"5k(#"+id+")",2X:1,"2d-2X":1});s.2d=E;s.2X=1;s.171=1;1b 1},pZ=1a(o){K 3p=o.7t(1);$(o.e8,{17g:o.5b.oj()+" i8("+3p.x+","+3p.y+")"})},dT=1a(o,1o,gV){if(o.1C=="1K"){K 2Z=4B(1o).49().3S("-"),p=o.2M,se=gV?"5d":"3a",1u=o.1u,2s=o.2s,2m=2s["2m-1m"],i=2Z.1f,1C="sX",2L,to,dx,su,1n,w=3,h=3,t=5;4x(i--){3P(2Z[i]){1q"5J":;1q"sX":;1q"xD":;1q"xF":;1q"7F":;1q"3q":1C=2Z[i];1s;1q"OZ":h=5;1s;1q"OU":h=2;1s;1q"OV":w=5;1s;1q"OW":w=2;1s}}if(1C=="7F"){w+=2;h+=2;t+=2;dx=1;su=gV?4:1;1n={2d:"3q",2m:2s.2m}}1j{su=dx=w/2;1n={2d:2s.2m,2m:"3q"}}if(o.2j.5l){if(gV){o.2j.5l.LY&&dw[o.2j.5l.LY]--;o.2j.5l.M7&&dw[o.2j.5l.M7]--}1j{o.2j.5l.Mc&&dw[o.2j.5l.Mc]--;o.2j.5l.Md&&dw[o.2j.5l.Md]--}}1j{o.2j.5l={}}if(1C!="3q"){K kJ="4F-eM-"+1C,kD="4F-eM-"+se+1C+w+h;if(!R.8F.3m.hk(kJ)){p.ee.4m($($("1K"),{"2m-ez":"5m",d:Me[1C],id:kJ}));dw[kJ]=1}1j{dw[kJ]++}K eM=R.8F.3m.hk(kD),kw;if(!eM){eM=$($("eM"),{id:kD,17h:h,17j:w,17i:"6h",su:su,17b:h/2});kw=$($("kw"),{"dB:5B":"#"+kJ,4j:(gV?"6l(180 "+w/ 2 + " " + h /2+") ":E)+"81("+w/ t + "," + h /t+")","2m-1m":(1/ ((w /t+h/ t) /2)).5a(4)});eM.4m(kw);p.ee.4m(eM);dw[kD]=1}1j{dw[kD]++;kw=eM.eD("kw")[0]}$(kw,1n);K wl=dx*(1C!="xF"&&1C!="xD");if(gV){2L=o.2j.5l.Mb*2m||0;to=R.dP(2s.1K)-wl*2m}1j{2L=wl*2m;to=R.dP(2s.1K)-(o.2j.5l.OC*2m||0)}1n={};1n["eM-"+se]="5k(#"+kD+")";if(to||2L){1n.d=R.oD(2s.1K,2L,to)}$(1u,1n);o.2j.5l[se+"dH"]=kJ;o.2j.5l[se+"OD"]=kD;o.2j.5l[se+"dx"]=wl;o.2j.5l[se+"4R"]=1C;o.2j.5l[se+"61"]=1o}1j{if(gV){2L=o.2j.5l.Mb*2m||0;to=R.dP(2s.1K)-2L}1j{2L=0;to=R.dP(2s.1K)-(o.2j.5l.OC*2m||0)}o.2j.5l[se+"dH"]&&$(1u,{d:R.oD(2s.1K,2L,to)});4q o.2j.5l[se+"dH"];4q o.2j.5l[se+"OD"];4q o.2j.5l[se+"dx"];4q o.2j.5l[se+"4R"];4q o.2j.5l[se+"61"]}1p(1n in dw){if(dw[3Q](1n)&&!dw[1n]){K 1i=R.8F.3m.hk(1n);1i&&1i.3l.8a(1i)}}}},aX={"":[0],"3q":[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},A5=1a(o,1o,1D){1o=aX[4B(1o).49()];if(1o){K 1m=o.2s["2m-1m"]||"1",lO={5m:1m,Ct:1m,lO:0}[o.2s["2m-ez"]||1D["2m-ez"]]||0,Ab=[],i=1o.1f;4x(i--){Ab[i]=1o[i]*1m+(i%2?1:-1)*lO}$(o.1u,{"2m-aX":Ab.5x(",")})}},fa=1a(o,1D){K 1u=o.1u,2s=o.2s,OH=1u.2G.i0;1u.2G.i0="6d";1p(K 7v in 1D){if(1D[3Q](7v)){if(!R.nj[3Q](7v)){ap}K 1o=1D[7v];2s[7v]=1o;3P(7v){1q"4W":o.4W(1o);1s;1q"5c":K 5c=1u.eD("5c");if(5c.1f&&(5c=5c[0])){5c.8E.Oy=1o}1j{5c=$("5c");K 2b=R.8F.3m.zV(1o);5c.4m(2b);1u.4m(5c)}1s;1q"5B":;1q"3g":K pn=1u.3l;if(pn.6L.49()!="a"){K hl=$("a");pn.87(hl,1u);hl.4m(1u);pn=hl}if(7v=="3g"){pn.sg(dB,"5p",1o=="Ae"?"1T":1o)}1j{pn.sg(dB,7v,1o)}1s;1q"mB":1u.2G.mB=1o;1s;1q"4j":o.4j(1o);1s;1q"cA-3a":dT(o,1o);1s;1q"cA-5d":dT(o,1o,1);1s;1q"76-4I":K 4I=4B(1o).3S(6f);if(4I.1f==4){o.76&&o.76.3l.3l.8a(o.76.3l);K el=$("18e"),rc=$("4I");el.id=R.oN();$(rc,{x:4I[0],y:4I[1],1m:4I[2],1w:4I[3]});el.4m(rc);o.2M.ee.4m(el);$(1u,{"76-1K":"5k(#"+el.id+")"});o.76=rc}if(!1o){K 1K=1u.zO("76-1K");if(1K){K 76=R.8F.3m.hk(1K.3t(/(^5k\\(#|\\)$)/g,E));76&&76.3l.8a(76);$(1u,{"76-1K":E});4q o.76}}1s;1q"1K":if(o.1C=="1K"){$(1u,{d:1o?2s.1K=R.sG(1o):"M0,0"});o.2j.8P=1;if(o.2j.5l){"mZ"in o.2j.5l&&dT(o,o.2j.5l.mZ);"lX"in o.2j.5l&&dT(o,o.2j.5l.lX,1)}}1s;1q"1m":1u.bS(7v,1o);o.2j.8P=1;if(2s.fx){7v="x";1o=2s.x}1j{1s};1q"x":if(2s.fx){1o=-2s.x-(2s.1m||0)};1q"rx":if(7v=="rx"&&o.1C=="4I"){1s};1q"cx":1u.bS(7v,1o);o.e8&&pZ(o);o.2j.8P=1;1s;1q"1w":1u.bS(7v,1o);o.2j.8P=1;if(2s.fy){7v="y";1o=2s.y}1j{1s};1q"y":if(2s.fy){1o=-2s.y-(2s.1w||0)};1q"ry":if(7v=="ry"&&o.1C=="4I"){1s};1q"cy":1u.bS(7v,1o);o.e8&&pZ(o);o.2j.8P=1;1s;1q"r":if(o.1C=="4I"){$(1u,{rx:1o,ry:1o})}1j{1u.bS(7v,1o)}o.2j.8P=1;1s;1q"4L":if(o.1C=="ac"){1u.sg(dB,"5B",1o)}1s;1q"2m-1m":if(o.2j.sx!=1||o.2j.sy!=1){1o/=5E(4G(o.2j.sx),4G(o.2j.sy))||1}if(o.2M.sQ){1o*=o.2M.sQ}1u.bS(7v,1o);if(2s["2m-aX"]){A5(o,2s["2m-aX"],1D)}if(o.2j.5l){"mZ"in o.2j.5l&&dT(o,o.2j.5l.mZ);"lX"in o.2j.5l&&dT(o,o.2j.5l.lX,1)}1s;1q"2m-aX":A5(o,1o,1D);1s;1q"2d":K ir=4B(1o).3x(R.Cv);if(ir){el=$("e8");K ig=$("ac");el.id=R.oN();$(el,{x:0,y:0,18f:"184",1w:1,1m:1});$(ig,{x:0,y:0,"dB:5B":ir[1]});el.4m(ig);(1a(el){R.Cx(ir[1],1a(){K w=J.hj,h=J.9n;$(el,{1m:w,1w:h});$(ig,{1m:w,1w:h});o.2M.mi()})})(el);o.2M.ee.4m(el);$(1u,{2d:"5k(#"+el.id+")"});o.e8=el;o.e8&&pZ(o);1s}K 4a=R.cX(1o);if(!4a.5u){4q 1D.4y;4q 2s.4y;!R.is(2s.2X,"2x")&&(R.is(1D.2X,"2x")&&$(1u,{2X:2s.2X}));!R.is(2s["2d-2X"],"2x")&&(R.is(1D["2d-2X"],"2x")&&$(1u,{"2d-2X":2s["2d-2X"]}))}1j{if((o.1C=="ah"||(o.1C=="bQ"||4B(1o).cn()!="r"))&&s9(o,1o)){if("2X"in 2s||"2d-2X"in 2s){K 4y=R.8F.3m.hk(1u.zO("2d").3t(/^5k\\(#|\\)$/g,E));if(4y){K lE=4y.eD("6x");$(lE[lE.1f-1],{"6x-2X":("2X"in 2s?2s.2X:1)*("2d-2X"in 2s?2s["2d-2X"]:1)})}}2s.4y=1o;2s.2d="3q";1s}}4a[3Q]("2X")&&$(1u,{"2d-2X":4a.2X>1?4a.2X/100:4a.2X});1q"2m":4a=R.cX(1o);1u.bS(7v,4a.7d);7v=="2m"&&(4a[3Q]("2X")&&$(1u,{"2m-2X":4a.2X>1?4a.2X/100:4a.2X}));if(7v=="2m"&&o.2j.5l){"mZ"in o.2j.5l&&dT(o,o.2j.5l.mZ);"lX"in o.2j.5l&&dT(o,o.2j.5l.lX,1)}1s;1q"4y":(o.1C=="ah"||(o.1C=="bQ"||4B(1o).cn()!="r"))&&s9(o,1o);1s;1q"2X":if(2s.4y&&!2s[3Q]("2m-2X")){$(1u,{"2m-2X":1o>1?1o/100:1o})};1q"2d-2X":if(2s.4y){4y=R.8F.3m.hk(1u.zO("2d").3t(/^5k\\(#|\\)$/g,E));if(4y){lE=4y.eD("6x");$(lE[lE.1f-1],{"6x-2X":1o})}1s};5N:7v=="3d-4l"&&(1o=b8(1o,10)+"px");K OL=7v.3t(/(\\-.)/g,1a(w){1b w.hb(1).9i()});1u.2G[OL]=1o;o.2j.8P=1;1u.bS(7v,1o);1s}}}Ox(o,1D);1u.2G.i0=OH},Aj=1.2,Ox=1a(el,1D){if(el.1C!="2g"||!(1D[3Q]("2g")||(1D[3Q]("3d")||(1D[3Q]("3d-4l")||(1D[3Q]("x")||1D[3Q]("y")))))){1b}K a=el.2s,1u=el.1u,eP=1u.8E?b8(R.8F.3m.lG.tH(1u.8E,E).Om("3d-4l"),10):10;if(1D[3Q]("2g")){a.2g=1D.2g;4x(1u.8E){1u.8a(1u.8E)}K zS=4B(1D.2g).3S("\\n"),kR=[],iK;1p(K i=0,ii=zS.1f;i<ii;i++){iK=$("iK");i&&$(iK,{dy:eP*Aj,x:a.x});iK.4m(R.8F.3m.zV(zS[i]));1u.4m(iK);kR[i]=iK}}1j{kR=1u.eD("iK");1p(i=0,ii=kR.1f;i<ii;i++){if(i){$(kR[i],{dy:eP*Aj,x:a.x})}1j{$(kR[0],{dy:0})}}}$(1u,{x:a.x,y:a.y});el.2j.8P=1;K bb=el.o0(),yR=a.y-(bb.y+bb.1w/2);yR&&(R.is(yR,"rL")&&$(kR[0],{dy:yR}))},b3=1a(1u,3b){K X=0,Y=0;J[0]=J.1u=1u;1u.4F=1l;J.id=R.AQ++;1u.AR=J.id;J.5b=R.5b();J.i3=1d;J.2M=3b;J.2s=J.2s||{};J.2j={4j:[],sx:1,sy:1,4V:0,dx:0,dy:0,8P:1};!3b.4O&&(3b.4O=J);J.3W=3b.1M;3b.1M&&(3b.1M.3B=J);3b.1M=J;J.3B=1d},3y=R.el;b3.3f=3y;3y.5L=b3;R.5h.1K=1a(9E,eZ){K el=$("1K");eZ.1Z&&eZ.1Z.4m(el);K p=1T b3(el,eZ);p.1C="1K";fa(p,{2d:"3q",2m:"#eg",1K:9E});1b p};3y.6l=1a(4V,cx,cy){if(J.5S){1b J}4V=4B(4V).3S(6f);if(4V.1f-1){cx=4i(4V[1]);cy=4i(4V[2])}4V=4i(4V[0]);cy==1d&&(cx=cy);if(cx==1d||cy==1d){K 3p=J.7t(1);cx=3p.x+3p.1m/2;cy=3p.y+3p.1w/2}J.4j(J.2j.4j.4e([["r",4V,cx,cy]]));1b J};3y.81=1a(sx,sy,cx,cy){if(J.5S){1b J}sx=4B(sx).3S(6f);if(sx.1f-1){sy=4i(sx[1]);cx=4i(sx[2]);cy=4i(sx[3])}sx=4i(sx[0]);sy==1d&&(sy=sx);cy==1d&&(cx=cy);if(cx==1d||cy==1d){K 3p=J.7t(1)}cx=cx==1d?3p.x+3p.1m/2:cx;cy=cy==1d?3p.y+3p.1w/2:cy;J.4j(J.2j.4j.4e([["s",sx,sy,cx,cy]]));1b J};3y.i8=1a(dx,dy){if(J.5S){1b J}dx=4B(dx).3S(6f);if(dx.1f-1){dy=4i(dx[1])}dx=4i(dx[0])||0;dy=+dy||0;J.4j(J.2j.4j.4e([["t",dx,dy]]));1b J};3y.4j=1a(cm){K 2j=J.2j;if(cm==1d){1b 2j.4j}R.AN(J,cm);J.76&&$(J.76,{4j:J.5b.oj()});J.e8&&pZ(J);J.1u&&$(J.1u,{4j:J.5b});if(2j.sx!=1||2j.sy!=1){K sw=J.2s[3Q]("2m-1m")?J.2s["2m-1m"]:1;J.1n({"2m-1m":sw})}1b J};3y.3C=1a(){!J.5S&&J.2M.mi(J.1u.2G.4T="3q");1b J};3y.5p=1a(){!J.5S&&J.2M.mi(J.1u.2G.4T="");1b J};3y.3M=1a(){if(J.5S||!J.1u.3l){1b}K 2M=J.2M;2M.7C&&2M.7C.Az(J);3j.8W("4F.*.*."+J.id);if(J.4y){2M.ee.8a(J.4y)}R.AA(J,2M);if(J.1u.3l.6L.49()=="a"){J.1u.3l.3l.8a(J.1u.3l)}1j{J.1u.3l.8a(J.1u)}1p(K i in J){J[i]=2A J[i]=="1a"?R.sq(i):1d}J.5S=1l};3y.o0=1a(){if(J.1u.2G.4T=="3q"){J.5p();K 3C=1l}K 3p={};6E{3p=J.1u.7t()}6G(e){}UV{3p=3p||{}}3C&&J.3C();1b 3p};3y.1n=1a(1x,1o){if(J.5S){1b J}if(1x==1d){K 1F={};1p(K a in J.2s){if(J.2s[3Q](a)){1F[a]=J.2s[a]}}1F.4y&&(1F.2d=="3q"&&((1F.2d=1F.4y)&&4q 1F.4y));1F.4j=J.2j.4j;1b 1F}if(1o==1d&&R.is(1x,"4E")){if(1x=="2d"&&(J.2s.2d=="3q"&&J.2s.4y)){1b J.2s.4y}if(1x=="4j"){1b J.2j.4j}K 8c=1x.3S(6f),2E={};1p(K i=0,ii=8c.1f;i<ii;i++){1x=8c[i];if(1x in J.2s){2E[1x]=J.2s[1x]}1j{if(R.is(J.2M.ab[1x],"1a")){2E[1x]=J.2M.ab[1x].O0}1j{2E[1x]=R.nj[1x]}}}1b ii-1?2E:2E[8c[0]]}if(1o==1d&&R.is(1x,"4t")){2E={};1p(i=0,ii=1x.1f;i<ii;i++){2E[1x[i]]=J.1n(1x[i])}1b 2E}if(1o!=1d){K 1D={};1D[1x]=1o}1j{if(1x!=1d&&R.is(1x,"1A")){1D=1x}}1p(K 1r in 1D){3j("4F.1n."+1r+"."+J.id,J,1D[1r])}1p(1r in J.2M.ab){if(J.2M.ab[3Q](1r)&&(1D[3Q](1r)&&R.is(J.2M.ab[1r],"1a"))){K af=J.2M.ab[1r].3w(J,[].4e(1D[1r]));J.2s[1r]=1D[1r];1p(K dW in af){if(af[3Q](dW)){1D[dW]=af[dW]}}}}fa(J,1D);1b J};3y.NZ=1a(){if(J.5S){1b J}if(J.1u.3l.6L.49()=="a"){J.1u.3l.3l.4m(J.1u.3l)}1j{J.1u.3l.4m(J.1u)}K 3b=J.2M;3b.1M!=J&&R.Av(J,3b);1b J};3y.Jf=1a(){if(J.5S){1b J}K 1P=J.1u.3l;if(1P.6L.49()=="a"){1P.3l.87(J.1u.3l,J.1u.3l.3l.8E)}1j{if(1P.8E!=J.1u){1P.87(J.1u,J.1u.3l.8E)}}R.Aw(J,J.2M);K 3b=J.2M;1b J};3y.gN=1a(1g){if(J.5S){1b J}K 1u=1g.1u||1g[1g.1f-1].1u;if(1u.jE){1u.3l.87(J.1u,1u.jE)}1j{1u.3l.4m(J.1u)}R.Ax(J,1g,J.2M);1b J};3y.87=1a(1g){if(J.5S){1b J}K 1u=1g.1u||1g[0].1u;1u.3l.87(J.1u,1u);R.AG(J,1g,J.2M);1b J};3y.4W=1a(4l){K t=J;if(+4l!==0){K ml=$("43"),4W=$("18k");t.2s.4W=4l;ml.id=R.oN();$(4W,{17Z:+4l||1.5});ml.4m(4W);t.2M.ee.4m(ml);t.sf=ml;$(t.1u,{43:"5k(#"+ml.id+")"})}1j{if(t.sf){t.sf.3l.8a(t.sf);4q t.sf;4q t.2s.4W}t.1u.17K("43")}1b t};R.5h.ah=1a(3b,x,y,r){K el=$("ah");3b.1Z&&3b.1Z.4m(el);K 1F=1T b3(el,3b);1F.2s={cx:x,cy:y,r:r,2d:"3q",2m:"#eg"};1F.1C="ah";$(el,1F.2s);1b 1F};R.5h.4I=1a(3b,x,y,w,h,r){K el=$("4I");3b.1Z&&3b.1Z.4m(el);K 1F=1T b3(el,3b);1F.2s={x:x,y:y,1m:w,1w:h,r:r||0,rx:r||0,ry:r||0,2d:"3q",2m:"#eg"};1F.1C="4I";$(el,1F.2s);1b 1F};R.5h.bQ=1a(3b,x,y,rx,ry){K el=$("bQ");3b.1Z&&3b.1Z.4m(el);K 1F=1T b3(el,3b);1F.2s={cx:x,cy:y,rx:rx,ry:ry,2d:"3q",2m:"#eg"};1F.1C="bQ";$(el,1F.2s);1b 1F};R.5h.ac=1a(3b,4L,x,y,w,h){K el=$("ac");$(el,{x:x,y:y,1m:w,1w:h,P6:"3q"});el.sg(dB,"5B",4L);3b.1Z&&3b.1Z.4m(el);K 1F=1T b3(el,3b);1F.2s={x:x,y:y,1m:w,1w:h,4L:4L};1F.1C="ac";1b 1F};R.5h.2g=1a(3b,x,y,2g){K el=$("2g");3b.1Z&&3b.1Z.4m(el);K 1F=1T b3(el,3b);1F.2s={x:x,y:y,"2g-Cb":"zP",2g:2g,3d:R.nj.3d,2m:"3q",2d:"#eg"};1F.1C="2g";fa(1F,1F.2s);1b 1F};R.5h.nO=1a(1m,1w){J.1m=1m||J.1m;J.1w=1w||J.1w;J.1Z.bS("1m",J.1m);J.1Z.bS("1w",J.1w);if(J.hX){J.i9.3w(J,J.hX)}1b J};R.5h.8J=1a(){K bV=R.Bc.3w(0,2F),3E=bV&&bV.3E,x=bV.x,y=bV.y,1m=bV.1m,1w=bV.1w;if(!3E){96 1T 9T("eZ 3E 6j a7.")}K cQ=$("3b"),2U="er:6d;",Ag;x=x||0;y=y||0;1m=1m||xZ;1w=1w||Jh;$(cQ,{1w:1w,6P:1.1,1m:1m,fZ:"6s://dC.w3.e9/iv/3b"});if(3E==1){cQ.2G.iA=2U+"2R:7U;2f:"+x+"px;1M:"+y+"px";R.8F.3m.3G.4m(cQ);Ag=1}1j{cQ.2G.iA=2U+"2R:pw";if(3E.8E){3E.87(cQ,3E.8E)}1j{3E.4m(cQ)}}3E=1T R.Ba;3E.1m=1m;3E.1w=1w;3E.1Z=cQ;3E.9I();3E.w6=3E.xu=0;Ag&&(3E.yJ=1a(){});3E.yJ();1b 3E};R.5h.i9=1a(x,y,w,h,cP){3j("4F.i9",J,J.hX,[x,y,w,h,cP]);K 4l=5E(w/ J.1m, h /J.1w),1M=J.1M,P1=cP?"17G":"17F",vb,sw;if(x==1d){if(J.sQ){4l=1}4q J.sQ;vb="0 0 "+J.1m+S+J.1w}1j{J.sQ=4l;vb=x+S+y+S+w+S+h}$(J.1Z,{jW:vb,P6:P1});4x(4l&&1M){sw="2m-1m"in 1M.2s?1M.2s["2m-1m"]:1;1M.1n({"2m-1m":sw});1M.2j.8P=1;1M.2j.il=1;1M=1M.3W}J.hX=[x,y,w,h,!!cP];1b J};R.3f.yJ=1a(){K cQ=J.1Z,s=cQ.2G,3u;6E{3u=cQ.17J()||cQ.P2()}6G(e){3u=cQ.P2()}K 2f=-3u.e%1,1M=-3u.f%1;if(2f||1M){if(2f){J.w6=(J.w6+2f)%1;s.2f=J.w6+"px"}if(1M){J.xu=(J.xu+1M)%1;s.1M=J.xu+"px"}}};R.3f.9I=1a(){R.3j("4F.9I",J);K c=J.1Z;4x(c.8E){c.8a(c.8E)}J.4O=J.1M=1d;(J.rI=$("rI")).4m(R.8F.3m.zV("WL iL mo\\mk "+R.6P));c.4m(J.rI);c.4m(J.ee=$("ee"))};R.3f.3M=1a(){3j("4F.3M",J);J.1Z.3l&&J.1Z.3l.8a(J.1Z);1p(K i in J){J[i]=2A J[i]=="1a"?R.sq(i):1d}};K 7H=R.st;1p(K 4h in 3y){if(3y[3Q](4h)&&!7H[3Q](4h)){7H[4h]=1a(fX){1b 1a(){K 4M=2F;1b J.a6(1a(el){el[fX].3w(el,4M)})}}(4h)}}})();(1a(){if(!R.6M){1b}K 3Q="86",4B=61,4i=e6,4b=3A,5m=4b.5m,5E=4b.4o,6S=4b.6e,4G=4b.4G,jC="2d",6f=/[, ]+/,3j=R.3j,ms=" BT:Pb.BV",S=" ",E="",bC={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},P9=/([BA]),?([^BA]*)/gi,JG=/ BT:\\S+Jp\\([^\\)]+\\)/g,2b=/-?[^,\\s-]+/g,Bj="2R:7U;2f:0;1M:0;1m:lw;1w:lw",7o=17I,Oh={1K:1,4I:1,ac:1},NF={ah:1,bQ:1},NG=1a(1K){K cf=/[17V]/ig,9l=R.sG;4B(1K).3x(cf)&&(9l=R.xN);cf=/[BA]/g;if(9l==R.sG&&!4B(1K).3x(cf)){K 1F=4B(1K).3t(P9,1a(73,9l,2w){K le=[],Pa=9l.49()=="m",1F=bC[9l];2w.3t(2b,1a(1o){if(Pa&&le.1f==2){1F+=le+bC[9l=="m"?"l":"L"];le=[]}le.1G(5m(1o*7o))});1b 1F+le});1b 1F}K pa=9l(1K),p,r;1F=[];1p(K i=0,ii=pa.1f;i<ii;i++){p=pa[i];r=pa[i][0].49();r=="z"&&(r="x");1p(K j=1,jj=p.1f;j<jj;j++){r+=5m(p[j]*7o)+(j!=jj-1?",":E)}1F.1G(r)}1b 1F.5x(S)},Bw=1a(4V,dx,dy){K m=R.5b();m.6l(-4V,0.5,0.5);1b{dx:m.x(dx,dy),dy:m.y(dx,dy)}},oM=1a(p,sx,sy,dx,dy,4V){K 2j=p.2j,m=p.5b,ej=2j.ej,o=p.1u,s=o.2G,y=1,l0="",17W,kx=7o/ sx, ky = 7o /sy;s.i0="6d";if(!sx||!sy){1b}o.yy=4G(kx)+S+4G(ky);s.17Y=4V*(sx*sy<0?-1:1);if(4V){K c=Bw(4V,dx,dy);dx=c.dx;dy=c.dy}sx<0&&(l0+="x");sy<0&&((l0+=" y")&&(y=-1));s.l0=l0;o.mH=dx*-kx+S+dy*-ky;if(ej||2j.jx){K 2d=o.eD(jC);2d=2d&&2d[0];o.8a(2d);if(ej){c=Bw(4V,m.x(ej[0],ej[1]),m.y(ej[0],ej[1]));2d.2R=c.dx*y+S+c.dy*y}if(2j.jx){2d.4l=2j.jx[0]*4G(sx)+S+2j.jx[1]*4G(sy)}o.4m(2d)}s.i0="6v"};R.3Y=1a(){1b"17Q BN 17P\\17R gy eZ. 17T f4 to jM.\\17S BC OP mo\\mk "+J.6P};K dT=1a(o,1o,gV){K 2Z=4B(1o).49().3S("-"),se=gV?"5d":"3a",i=2Z.1f,1C="sX",w="OX",h="OX";4x(i--){3P(2Z[i]){1q"5J":;1q"sX":;1q"xD":;1q"xF":;1q"7F":;1q"3q":1C=2Z[i];1s;1q"OZ":;1q"OU":h=2Z[i];1s;1q"OV":;1q"OW":w=2Z[i];1s}}K 2m=o.1u.eD("2m")[0];2m[se+"cA"]=1C;2m[se+"15Y"]=w;2m[se+"16e"]=h},fa=1a(o,1D){o.2s=o.2s||{};K 1u=o.1u,a=o.2s,s=1u.2G,xy,Cn=Oh[o.1C]&&(1D.x!=a.x||(1D.y!=a.y||(1D.1m!=a.1m||(1D.1w!=a.1w||(1D.cx!=a.cx||(1D.cy!=a.cy||(1D.rx!=a.rx||(1D.ry!=a.ry||1D.r!=a.r)))))))),NH=NF[o.1C]&&(a.cx!=1D.cx||(a.cy!=1D.cy||(a.r!=1D.r||(a.rx!=1D.rx||a.ry!=1D.ry)))),1F=o;1p(K af in 1D){if(1D[3Q](af)){a[af]=1D[af]}}if(Cn){a.1K=R.Cp[o.1C](o);o.2j.8P=1}1D.5B&&(1u.5B=1D.5B);1D.5c&&(1u.5c=1D.5c);1D.3g&&(1u.3g=1D.3g);1D.mB&&(s.mB=1D.mB);"4W"in 1D&&o.4W(1D.4W);if(1D.1K&&o.1C=="1K"||Cn){1u.1K=NG(~4B(a.1K).49().5e("r")?R.sG(a.1K):a.1K);if(o.1C=="ac"){o.2j.ej=[a.x,a.y];o.2j.jx=[a.1m,a.1w];oM(o,1,1,0,0,0)}}"4j"in 1D&&o.4j(1D.4j);if(NH){K cx=+a.cx,cy=+a.cy,rx=+a.rx||(+a.r||0),ry=+a.ry||(+a.r||0);1u.1K=R.7p("ar{0},{1},{2},{3},{4},{1},{4},{1}x",5m((cx-rx)*7o),5m((cy-ry)*7o),5m((cx+rx)*7o),5m((cy+ry)*7o),5m(cx*7o));o.2j.8P=1}if("76-4I"in 1D){K 4I=4B(1D["76-4I"]).3S(6f);if(4I.1f==4){4I[2]=+4I[2]+ +4I[0];4I[3]=+4I[3]+ +4I[1];K 2C=1u.sN||R.8F.3m.e7("2C"),iV=2C.2G;iV.76=R.7p("4I({1}px {2}px {3}px {0}px)",4I);if(!1u.sN){iV.2R="7U";iV.1M=0;iV.2f=0;iV.1m=o.2M.1m+"px";iV.1w=o.2M.1w+"px";1u.3l.87(2C,1u);2C.4m(1u);1u.sN=2C}}if(!1D["76-4I"]){1u.sN&&(1u.sN.2G.76="6h")}}if(o.ed){K mA=o.ed.2G;1D.3d&&(mA.3d=1D.3d);1D["3d-9j"]&&(mA.Nt=\'"\'+1D["3d-9j"].3S(",")[0].3t(/^[\'"]+|[\'"]+$/g,E)+\'"\');1D["3d-4l"]&&(mA.eP=1D["3d-4l"]);1D["3d-bz"]&&(mA.Np=1D["3d-bz"]);1D["3d-2G"]&&(mA.Nq=1D["3d-2G"])}if("cA-3a"in 1D){dT(1F,1D["cA-3a"])}if("cA-5d"in 1D){dT(1F,1D["cA-5d"],1)}if(1D.2X!=1d||(1D["2m-1m"]!=1d||(1D.2d!=1d||(1D.4L!=1d||(1D.2m!=1d||(1D["2m-1m"]!=1d||(1D["2m-2X"]!=1d||(1D["2d-2X"]!=1d||(1D["2m-aX"]!=1d||(1D["2m-rO"]!=1d||(1D["2m-iY"]!=1d||1D["2m-ez"]!=1d))))))))))){K 2d=1u.eD(jC),ND=1k;2d=2d&&2d[0];!2d&&(ND=2d=e5(jC));if(o.1C=="ac"&&1D.4L){2d.4L=1D.4L}1D.2d&&(2d.on=1l);if(2d.on==1d||(1D.2d=="3q"||1D.2d===1d)){2d.on=1k}if(2d.on&&1D.2d){K ir=4B(1D.2d).3x(R.Cv);if(ir){2d.3l==1u&&1u.8a(2d);2d.6l=1l;2d.4L=ir[1];2d.1C="Jy";K 3p=o.7t(1);2d.2R=3p.x+S+3p.y;o.2j.ej=[3p.x,3p.y];R.Cx(ir[1],1a(){o.2j.jx=[J.hj,J.9n]})}1j{2d.3X=R.cX(1D.2d).7d;2d.4L=E;2d.1C="rN";if(R.cX(1D.2d).5u&&((1F.1C in{ah:1,bQ:1}||4B(1D.2d).cn()!="r")&&s9(1F,1D.2d,2d))){a.2d="3q";a.4y=1D.2d;2d.6l=1k}}}if("2d-2X"in 1D||"2X"in 1D){K 2X=((+a["2d-2X"]+1||2)-1)*((+a.2X+1||2)-1)*((+R.cX(1D.2d).o+1||2)-1);2X=6S(5E(2X,0),1);2d.2X=2X;if(2d.4L){2d.3X="3q"}}1u.4m(2d);K 2m=1u.eD("2m")&&1u.eD("2m")[0],Cj=1k;!2m&&(Cj=2m=e5("2m"));if(1D.2m&&1D.2m!="3q"||(1D["2m-1m"]||(1D["2m-2X"]!=1d||(1D["2m-aX"]||(1D["2m-rO"]||(1D["2m-iY"]||1D["2m-ez"])))))){2m.on=1l}(1D.2m=="3q"||(1D.2m===1d||(2m.on==1d||(1D.2m==0||1D["2m-1m"]==0))))&&(2m.on=1k);K Cs=R.cX(1D.2m);2m.on&&(1D.2m&&(2m.3X=Cs.7d));2X=((+a["2m-2X"]+1||2)-1)*((+a.2X+1||2)-1)*((+Cs.o+1||2)-1);K 1m=(4i(1D["2m-1m"])||1)*0.75;2X=6S(5E(2X,0),1);1D["2m-1m"]==1d&&(1m=a["2m-1m"]);1D["2m-1m"]&&(2m.bz=1m);1m&&(1m<1&&((2X*=1m)&&(2m.bz=1)));2m.2X=2X;1D["2m-iY"]&&(2m.15P=1D["2m-iY"]||"15R");2m.rO=1D["2m-rO"]||8;1D["2m-ez"]&&(2m.15S=1D["2m-ez"]=="lO"?"15K":1D["2m-ez"]=="Ct"?"Ct":"5m");if("2m-aX"in 1D){K aX={"-":"15O",".":"15N","-.":"16J","-..":"16I",". ":"7J","- ":"16K","--":"16M","- .":"16L","--.":"16E","--..":"16D"};2m.16F=aX[3Q](1D["2m-aX"])?aX[1D["2m-aX"]]:E}Cj&&1u.4m(2m)}if(1F.1C=="2g"){1F.2M.1Z.2G.4T=E;K 2u=1F.2M.2u,m=100,eP=a.3d&&a.3d.3x(/\\d+(?:\\.\\d*)?(?=px)/);s=2u.2G;a.3d&&(s.3d=a.3d);a["3d-9j"]&&(s.Nt=a["3d-9j"]);a["3d-bz"]&&(s.Np=a["3d-bz"]);a["3d-2G"]&&(s.Nq=a["3d-2G"]);eP=4i(a["3d-4l"]||eP&&eP[0])||10;s.eP=eP*m+"px";1F.ed.4E&&(2u.qK=4B(1F.ed.4E).3t(/</g,"&#60;").3t(/&/g,"&#38;").3t(/\\n/g,"<br>"));K rC=2u.sa();1F.W=a.w=(rC.8t-rC.2f)/m;1F.H=a.h=(rC.4O-rC.1M)/m;1F.X=a.x;1F.Y=a.y+1F.H/2;("x"in 1D||"y"in 1D)&&(1F.1K.v=R.7p("m{0},{1}l{2},{1}",5m(a.x*7o),5m(a.y*7o),5m(a.x*7o)+1));K Ca=["x","y","2g","3d","3d-9j","3d-bz","3d-2G","3d-4l"];1p(K d=0,dd=Ca.1f;d<dd;d++){if(Ca[d]in 1D){1F.2j.8P=1;1s}}3P(a["2g-Cb"]){1q"3a":1F.ed.2G["v-2g-BZ"]="2f";1F.zj=1F.W/2;1s;1q"5d":1F.ed.2G["v-2g-BZ"]="8t";1F.zj=-1F.W/2;1s;5N:1F.ed.2G["v-2g-BZ"]="16R";1F.zj=0;1s}1F.ed.2G["v-2g-16Q"]=1l}},s9=1a(o,4y,2d){o.2s=o.2s||{};K 2s=o.2s,6Q=3A.6Q,2X,16C,1C="oT",AP=".5 .5";o.2s.4y=4y;4y=4B(4y).3t(R.C0,1a(73,fx,fy){1C="wH";if(fx&&fy){fx=4i(fx);fy=4i(fy);6Q(fx-0.5,2)+6Q(fy-0.5,2)>0.25&&(fy=4b.bw(0.25-6Q(fx-0.5,2))*((fy>0.5)*2-1)+0.5);AP=fx+S+fy}1b E});4y=4y.3S(/\\s*\\-\\s*/);if(1C=="oT"){K 8n=4y.dE();8n=-4i(8n);if(9B(8n)){1b 1d}}K 5V=R.Ce(4y);if(!5V){1b 1d}o=o.ec||o.1u;if(5V.1f){o.8a(2d);2d.on=1l;2d.4h="3q";2d.3X=5V[0].3X;2d.16j=5V[5V.1f-1].3X;K wN=[];1p(K i=0,ii=5V.1f;i<ii;i++){5V[i].2v&&wN.1G(5V[i].2v+S+5V[i].3X)}2d.16i=wN.1f?wN.5x():"0% "+2d.3X;if(1C=="wH"){2d.1C="16m";2d.3k="100%";2d.16l="0 0";2d.16y=AP;2d.8n=0}1j{2d.1C="4y";2d.8n=(16x-8n)%9O}o.4m(2d)}1b 1},b3=1a(1u,6M){J[0]=J.1u=1u;1u.4F=1l;J.id=R.AQ++;1u.AR=J.id;J.X=0;J.Y=0;J.2s={};J.2M=6M;J.5b=R.5b();J.2j={4j:[],sx:1,sy:1,dx:0,dy:0,4V:0,8P:1,il:1};!6M.4O&&(6M.4O=J);J.3W=6M.1M;6M.1M&&(6M.1M.3B=J);6M.1M=J;J.3B=1d};K 3y=R.el;b3.3f=3y;3y.5L=b3;3y.4j=1a(cm){if(cm==1d){1b J.2j.4j}K kl=J.2M.Jk,Of=kl?"s"+[kl.81,kl.81]+"-1-1t"+[kl.dx,kl.dy]:E,zn;if(kl){zn=cm=4B(cm).3t(/\\.{3}|\\AL/g,J.2j.4j||E)}R.AN(J,Of+cm);K 5b=J.5b.6z(),9p=J.9p,o=J.1u,3S,AX=~4B(J.2s.2d).5e("-"),Ob=!4B(J.2s.2d).5e("5k(");5b.i8(1,1);if(Ob||(AX||J.1C=="ac")){9p.5b="1 0 0 1";9p.2v="0 0";3S=5b.3S();if(AX&&3S.Oc||!3S.AY){o.2G.43=5b.Od();K bb=J.7t(),AT=J.7t(1),dx=bb.x-AT.x,dy=bb.y-AT.y;o.mH=dx*-7o+S+dy*-7o;oM(J,1,1,dx,dy,0)}1j{o.2G.43=E;oM(J,3S.iE,3S.gE,3S.dx,3S.dy,3S.6l)}}1j{o.2G.43=E;9p.5b=4B(5b);9p.2v=5b.2v()}zn&&(J.2j.4j=zn);1b J};3y.6l=1a(4V,cx,cy){if(J.5S){1b J}if(4V==1d){1b}4V=4B(4V).3S(6f);if(4V.1f-1){cx=4i(4V[1]);cy=4i(4V[2])}4V=4i(4V[0]);cy==1d&&(cx=cy);if(cx==1d||cy==1d){K 3p=J.7t(1);cx=3p.x+3p.1m/2;cy=3p.y+3p.1w/2}J.2j.il=1;J.4j(J.2j.4j.4e([["r",4V,cx,cy]]));1b J};3y.i8=1a(dx,dy){if(J.5S){1b J}dx=4B(dx).3S(6f);if(dx.1f-1){dy=4i(dx[1])}dx=4i(dx[0])||0;dy=+dy||0;if(J.2j.3p){J.2j.3p.x+=dx;J.2j.3p.y+=dy}J.4j(J.2j.4j.4e([["t",dx,dy]]));1b J};3y.81=1a(sx,sy,cx,cy){if(J.5S){1b J}sx=4B(sx).3S(6f);if(sx.1f-1){sy=4i(sx[1]);cx=4i(sx[2]);cy=4i(sx[3]);9B(cx)&&(cx=1d);9B(cy)&&(cy=1d)}sx=4i(sx[0]);sy==1d&&(sy=sx);cy==1d&&(cx=cy);if(cx==1d||cy==1d){K 3p=J.7t(1)}cx=cx==1d?3p.x+3p.1m/2:cx;cy=cy==1d?3p.y+3p.1w/2:cy;J.4j(J.2j.4j.4e([["s",sx,sy,cx,cy]]));J.2j.il=1;1b J};3y.3C=1a(){!J.5S&&(J.1u.2G.4T="3q");1b J};3y.5p=1a(){!J.5S&&(J.1u.2G.4T=E);1b J};3y.o0=1a(){if(J.5S){1b{}}1b{x:J.X+(J.zj||0)-J.W/2,y:J.Y-J.H,1m:J.W,1w:J.H}};3y.3M=1a(){if(J.5S||!J.1u.3l){1b}J.2M.7C&&J.2M.7C.Az(J);R.3j.8W("4F.*.*."+J.id);R.AA(J,J.2M);J.1u.3l.8a(J.1u);J.ec&&J.ec.3l.8a(J.ec);1p(K i in J){J[i]=2A J[i]=="1a"?R.sq(i):1d}J.5S=1l};3y.1n=1a(1x,1o){if(J.5S){1b J}if(1x==1d){K 1F={};1p(K a in J.2s){if(J.2s[3Q](a)){1F[a]=J.2s[a]}}1F.4y&&(1F.2d=="3q"&&((1F.2d=1F.4y)&&4q 1F.4y));1F.4j=J.2j.4j;1b 1F}if(1o==1d&&R.is(1x,"4E")){if(1x==jC&&(J.2s.2d=="3q"&&J.2s.4y)){1b J.2s.4y}K 8c=1x.3S(6f),2E={};1p(K i=0,ii=8c.1f;i<ii;i++){1x=8c[i];if(1x in J.2s){2E[1x]=J.2s[1x]}1j{if(R.is(J.2M.ab[1x],"1a")){2E[1x]=J.2M.ab[1x].O0}1j{2E[1x]=R.nj[1x]}}}1b ii-1?2E:2E[8c[0]]}if(J.2s&&(1o==1d&&R.is(1x,"4t"))){2E={};1p(i=0,ii=1x.1f;i<ii;i++){2E[1x[i]]=J.1n(1x[i])}1b 2E}K 1D;if(1o!=1d){1D={};1D[1x]=1o}1o==1d&&(R.is(1x,"1A")&&(1D=1x));1p(K 1r in 1D){3j("4F.1n."+1r+"."+J.id,J,1D[1r])}if(1D){1p(1r in J.2M.ab){if(J.2M.ab[3Q](1r)&&(1D[3Q](1r)&&R.is(J.2M.ab[1r],"1a"))){K af=J.2M.ab[1r].3w(J,[].4e(1D[1r]));J.2s[1r]=1D[1r];1p(K dW in af){if(af[3Q](dW)){1D[dW]=af[dW]}}}}if(1D.2g&&J.1C=="2g"){J.ed.4E=1D.2g}fa(J,1D)}1b J};3y.NZ=1a(){!J.5S&&J.1u.3l.4m(J.1u);J.2M&&(J.2M.1M!=J&&R.Av(J,J.2M));1b J};3y.Jf=1a(){if(J.5S){1b J}if(J.1u.3l.8E!=J.1u){J.1u.3l.87(J.1u,J.1u.3l.8E);R.Aw(J,J.2M)}1b J};3y.gN=1a(1g){if(J.5S){1b J}if(1g.5L==R.st.5L){1g=1g[1g.1f-1]}if(1g.1u.jE){1g.1u.3l.87(J.1u,1g.1u.jE)}1j{1g.1u.3l.4m(J.1u)}R.Ax(J,1g,J.2M);1b J};3y.87=1a(1g){if(J.5S){1b J}if(1g.5L==R.st.5L){1g=1g[0]}1g.1u.3l.87(J.1u,1g.1u);R.AG(J,1g,J.2M);1b J};3y.4W=1a(4l){K s=J.1u.19S,f=s.43;f=f.3t(JG,E);if(+4l!==0){J.2s.4W=4l;s.43=f+S+ms+".Jp(19V="+(+4l||1.5)+")";s.kb=R.7p("-{0}px 0 0 -{0}px",5m(+4l||1.5))}1j{s.43=f;s.kb=0;4q J.2s.4W}1b J};R.5h.1K=1a(9E,6M){K el=e5("ec");el.2G.iA=Bj;el.yy=7o+S+7o;el.mH=6M.mH;K p=1T b3(el,6M),1n={2d:"3q",2m:"#eg"};9E&&(1n.1K=9E);p.1C="1K";p.1K=[];p.dH=E;fa(p,1n);6M.1Z.4m(el);K 9p=e5("9p");9p.on=1l;el.4m(9p);p.9p=9p;p.4j(E);1b p};R.5h.4I=1a(6M,x,y,w,h,r){K 1K=R.AI(x,y,w,h,r),1F=6M.1K(1K),a=1F.2s;1F.X=a.x=x;1F.Y=a.y=y;1F.W=a.1m=w;1F.H=a.1w=h;a.r=r;a.1K=1K;1F.1C="4I";1b 1F};R.5h.bQ=1a(6M,x,y,rx,ry){K 1F=6M.1K(),a=1F.2s;1F.X=x-rx;1F.Y=y-ry;1F.W=rx*2;1F.H=ry*2;1F.1C="bQ";fa(1F,{cx:x,cy:y,rx:rx,ry:ry});1b 1F};R.5h.ah=1a(6M,x,y,r){K 1F=6M.1K(),a=1F.2s;1F.X=x-r;1F.Y=y-r;1F.W=1F.H=r*2;1F.1C="ah";fa(1F,{cx:x,cy:y,r:r});1b 1F};R.5h.ac=1a(6M,4L,x,y,w,h){K 1K=R.AI(x,y,w,h),1F=6M.1K(1K).1n({2m:"3q"}),a=1F.2s,1u=1F.1u,2d=1u.eD(jC)[0];a.4L=4L;1F.X=a.x=x;1F.Y=a.y=y;1F.W=a.1m=w;1F.H=a.1w=h;a.1K=1K;1F.1C="ac";2d.3l==1u&&1u.8a(2d);2d.6l=1l;2d.4L=4L;2d.1C="Jy";1F.2j.ej=[x,y];1F.2j.jx=[w,h];1u.4m(2d);oM(1F,1,1,0,0,0);1b 1F};R.5h.2g=1a(6M,x,y,2g){K el=e5("ec"),1K=e5("1K"),o=e5("ed");x=x||0;y=y||0;2g=2g||"";1K.v=R.7p("m{0},{1}l{2},{1}",5m(x*7o),5m(y*7o),5m(x*7o)+1);1K.1a4=1l;o.4E=4B(2g);o.on=1l;el.2G.iA=Bj;el.yy=7o+S+7o;el.mH="0 0";K p=1T b3(el,6M),1n={2d:"#eg",2m:"3q",3d:R.nj.3d,2g:2g};p.ec=el;p.1K=1K;p.ed=o;p.1C="2g";p.2s.2g=4B(2g);p.2s.x=x;p.2s.y=y;p.2s.w=1;p.2s.h=1;fa(p,1n);el.4m(o);el.4m(1K);6M.1Z.4m(el);K 9p=e5("9p");9p.on=1l;el.4m(9p);p.9p=9p;p.4j(E);1b p};R.5h.nO=1a(1m,1w){K cs=J.1Z.2G;J.1m=1m;J.1w=1w;1m==+1m&&(1m+="px");1w==+1w&&(1w+="px");cs.1m=1m;cs.1w=1w;cs.76="4I(0 "+1m+" "+1w+" 0)";if(J.hX){R.5h.i9.3w(J,J.hX)}1b J};R.5h.i9=1a(x,y,w,h,cP){R.3j("4F.i9",J,J.hX,[x,y,w,h,cP]);K 1m=J.1m,1w=J.1w,4l=1/ 5E(w /1m,h/1w),H,W;if(cP){H=1w/h;W=1m/w;if(w*H<1m){x-=(1m-w*H)/ 2 /H}if(h*W<1w){y-=(1w-h*W)/ 2 /W}}J.hX=[x,y,w,h,!!cP];J.Jk={dx:-x,dy:-y,81:4l};J.a6(1a(el){el.4j("...")});1b J};K e5;R.5h.yO=1a(5R){K 3m=5R.2K;3m.1ba().1b3(".mr","Jq:5k(#5N#jM)");6E{!3m.cL.mr&&3m.cL.5F("mr","Ju:Js-Jr-Bo:6M");e5=1a(6L){1b 3m.e7("<mr:"+6L+\' 2t="mr">\')}}6G(e){e5=1a(6L){1b 3m.e7("<"+6L+\' fZ="Ju:Js-Jr.Bo:6M" 2t="mr">\')}}};R.5h.yO(R.8F.5R);R.5h.8J=1a(){K bV=R.Bc.3w(0,2F),3E=bV.3E,1w=bV.1w,s,1m=bV.1m,x=bV.x,y=bV.y;if(!3E){96 1T 9T("jM 3E 6j a7.")}K 1F=1T R.Ba,c=1F.1Z=R.8F.3m.e7("2C"),cs=c.2G;x=x||0;y=y||0;1m=1m||xZ;1w=1w||Jh;1F.1m=1m;1F.1w=1w;1m==+1m&&(1m+="px");1w==+1w&&(1w+="px");1F.yy=7o*9m+S+7o*9m;1F.mH="0 0";1F.2u=R.8F.3m.e7("2u");1F.2u.2G.iA="2R:7U;2f:-nC;1M:-nC;KS:0;kb:0;cv-1w:1;";c.4m(1F.2u);cs.iA=R.7p("1M:0;2f:0;1m:{0};1w:{1};4T:KN-5J;2R:pw;76:4I(0 {0} {1} 0);er:6d",1m,1w);if(3E==1){R.8F.3m.3G.4m(c);cs.2f=x+"px";cs.1M=y+"px";cs.2R="7U"}1j{if(3E.8E){3E.87(c,3E.8E)}1j{3E.4m(c)}}1F.yJ=1a(){};1b 1F};R.3f.9I=1a(){R.3j("4F.9I",J);J.1Z.qK=E;J.2u=R.8F.3m.e7("2u");J.2u.2G.iA="2R:7U;2f:-nC;1M:-nC;KS:0;kb:0;cv-1w:1;4T:KN;";J.1Z.4m(J.2u);J.4O=J.1M=1d};R.3f.3M=1a(){R.3j("4F.3M",J);J.1Z.3l.8a(J.1Z);1p(K i in J){J[i]=2A J[i]=="1a"?R.sq(i):1d}1b 1l};K 7H=R.st;1p(K 4h in 3y){if(3y[3Q](4h)&&!7H[3Q](4h)){7H[4h]=1a(fX){1b 1a(){K 4M=2F;1b J.a6(1a(el){el[fX].3w(el,4M)})}}(4h)}}})();tf.Bb?g.5R.cB=R:cB=R;1b R});K K9=1a(B3){J.3X=1d;J.Bx=1d;J.bg=1d;J.cv=1d;J.BJ=1d;J.3a=1d;J.BS=1d;J.5d=1d;J.1A=1d;J.8V=1d;J.B0=1a(B3){};J.B0(B3)};1a 7t(1y){K 5P={x:0,y:0,1m:0,1w:0};if(!1y.1f){1b 5P}K o=1y[0];1a v7(1g,KE){5P={x:0,y:0,1m:1g.ma,1w:1g.mc};4x(1g){if(1g.id==KE){1s}5P.x+=1g.91-1g.54+1g.nl;5P.y+=1g.9H-1g.4Q+1g.nG;1g=1g.fD}1b 5P}if(o.6L=="TR"){5P=v7(o,"qb-ui-1Z")}1j{if(o.6L=="T0"){5P=v7(o,"qb-ui-1Z")}1j{if(o.6L=="199"){5P=v7(o,"qb-ui-1Z")}}}1b 5P}1a gp(x){1b 3A.5m(x*9m)/9m}1a Lb(hY,iI){K KI=15;K p1=[{x:hY.x,y:hY.y+hY.1w/ 2}, {x:hY.x + hY.1m, y:hY.y + hY.1w /2}];K p2=[{x:iI.x,y:iI.y+iI.1w/ 2}, {x:iI.x + iI.1m, y:iI.y + iI.1w /2}];K d=[],p6=[];1p(K i1=0;i1<p1.1f;i1++){1p(K i2=0;i2<p2.1f;i2++){K dx=3A.4G(p1[i1].x-p2[i2].x);K dy=3A.4G(p1[i1].y-p2[i2].y);K 6w=dx*dx+dy*dy;p6.1G(6w);d.1G({i1:i1,i2:i2})}}K 1F={i1:0,i2:0};K vy=-1;K 6e=-1;1p(K i=0;i<p6.1f;i++){if(6e==-1||p6[i]<6e){6e=p6[i];vy=i}}if(vy>0){1F=d[vy]}K x1=p1[1F.i1].x,y1=p1[1F.i1].y,x4=p2[1F.i2].x,y4=p2[1F.i2].y,y2=y1,y3=y4;K dx=3A.4o(3A.4G(x1-x4)/2,KI);K x2=[x1-dx,x1+dx][1F.i1];K x3=[x4-dx,x4+dx][1F.i2];1b{x1:gp(x1),y1:gp(y1),x2:gp(x2),y2:gp(y2),x3:gp(x3),y3:gp(y3),x4:gp(x4),y4:gp(y4)}}1a 18Z(5P,Lq){K R=cB==1d?bn:cB;K 4A=5P;if(R.is(5P,"1a")){1b Lq?4A():3j.on("4F.lK",4A)}1j{if(R.is(4A,1l)){1b R.5h.8J[5P](R,4A.5W(0,3+R.is(4A[0],1d))).5F(4A)}1j{K 2w=3R.3f.4d.2J(2F,0);if(R.is(2w[2w.1f-1],"1a")){K f=2w.eO();1b 4A?f.2J(R.5h.8J[5P](R,2w)):3j.on("4F.lK",1a(){f.2J(R.5h.8J[5P](R,2w))})}1j{1b R.5h.8J[5P](R,2F)}}}}cB.fn.AW=1a(2k){if(!2k.5r||!2k.5y){1b 1k}if(!2k.5r.28||!2k.5y.28){1b 1k}if(!2k.5r.28.1g||!2k.5y.28.1g){1b 1k}K bY=2k.8V;K Cq=8;K 3X=bY.3X;K K1=2k.5r.4R;K K5=2k.5y.4R;1a Ck(2k){K eQ=7t(2k.28.1g);if(2k.1H){K gf=7t(2k.1H.1g);eQ.x=gf.x-1;eQ.1m=gf.1m+2;if(eQ.y<gf.y){eQ.y=gf.y}1j{if(eQ.y>gf.y+gf.1w-eQ.1w){eQ.y=gf.y+gf.1w-eQ.1w}}}1b eQ}K Lc=Ck(2k.5r);K K3=Ck(2k.5y);K 8m=Lb(Lc,K3);K BY=8m.x1<8m.x2?1:-1;K BI=8m.x4<8m.x3?1:-1;K 1K=["M",8m.x1,8m.y1,"L",8m.x1+Cq*BY,8m.y1,"C",8m.x2,8m.y2,8m.x3,8m.y3,8m.x4+Cq*BI,8m.y4,"L",8m.x4,8m.y4].5x(",");bY.3a=qI(bY.3a,K5,3X,8m.x1,8m.y1,BY);bY.5d=qI(bY.5d,K1,3X,8m.x4,8m.y4,BI);if(bY.1K=1K&&(bY.cv&&bY.bg)){bY.bg.1n({1K:1K});bY.cv.1n({1K:1K});$(bY.bg.1u).2r("2k-2W")}1b 1l};cB.fn.AW;cB.fn.Sa=1a(1y,1n){K 2k=1T K9;2k.3X=1n.3S("|")[0]||"#Ka";2k.Bx=1n.3S("|")[1]||3;2k.K7=15;2k.cv=J.1K("M,0,0").1n({2m:2k.3X,2d:"3q","2m-1m":2k.Bx,"2m-ez":"5m","2m-iY":"5m"});2k.bg=J.1K("M,0,0").1n({2m:2k.3X,2d:"3q","2m-1m":2k.K7,"2m-2X":0.JR});2k.BJ=1y.5y.4R;2k.3a=qI(1d,2k.BJ,2k.3X);2k.BS=1y.5r.4R;2k.5d=qI(1d,2k.BS,2k.3X);2k.1A=1y;1b 2k};1a qI(1y,1C,3X,x,y,d){if(!x){x=0}if(!y){y=0}if(!d){d=1}K tL=1k;if(1y!=1d&&1y.1u){3P(1C){1q 1S.8K.dZ:tL=1y.1u.98!="ah";1s;1q 1S.8K.fi:tL=1y.1u.98!="1K";1s}}if(tL){if(1y&&1y.3M){1y.3M()}1y=1d}if(1y==1d){3P(1C){1q 1S.8K.dZ:1y=QB.1e.2i.r.ah(0,0,5);1y.1n({2d:3X,"2m-1m":0});1s;1q 1S.8K.fi:1y=QB.1e.2i.r.1K("M,0,0");1y.1n({2d:3X,"2m-1m":0});1s}}3P(1C){1q 1S.8K.dZ:1y.1n({cx:x,cy:y});1s;1q 1S.8K.fi:K dx=8;K dy=5;K 1K=["M",x,y,"L",x,y+1,x+dx*d,y+dy,x+dx*d,y-dy,x,y-1,"Z"].5x(",");1y.1n({1K:1K});1s}1b 1y};K TL=1l;1a 18w(1A,1N,7P){if(2A 1A.dO!="2x"){1A.dO(1N,7P,1k)}1j{if(2A 1A.jq!="2x"){1A.jq("on"+1N,7P)}1j{96"JQ BN"}}}1a 18v(1A,1N,7P){if(2A 1A.qp!="2x"){1A.qp(1N,7P,1k)}1j{if(2A 1A.BK!="2x"){1A.BK("on"+1N,7P)}1j{96"JQ BN"}}}1a 18I(fn){K 2D=3z.dO||3z.jq?3z:2K.dO?2K:2K.1P||1d;if(2D){if(2D.dO){2D.dO("BP",fn,1k)}1j{if(2D.jq){2D.jq("jf",fn)}}}1j{if(2A 3z.jf=="1a"){K ku=3z.jf;3z.jf=1a(){ku();fn()}}1j{3z.jf=fn}}}K uA=[];K Ap=1k;1a 18H(fn){if(!Ap){uA.1G(fn)}1j{fn()}}1a W2(){Ap=1l;1p(K i=0;i<uA.1f;i++){uA[i]()}};K Kc=0;if(!3R.5e){3R.3f.5e=1a(1y){1p(K i=0;i<J.1f;i++){if(J[i]==1y){1b i}}1b-1}}4v={xW:1a(){1b++Kc},3Y:1a(1y){if(1y==2x||1y==1d){1b""}1b 1y.3Y()}};4v.pO=1a(4L,bc){K p,v;1p(p in 4L){if(2A 4L[p]==="1a"){bc[p]=4L[p]}1j{v=4L[p];bc[p]=v}}1b bc};4v.RX=1a(4L,bc){K p,v;1p(p in 4L){if(bc[p]===2x){ap}if(2A 4L[p]==="1a"){bc[p]=4L[p]}1j{v=4L[p];bc[p]=v}}1b bc};4v.Hw=1a($1g,3H){if($1g.1f&&!1B(3H)){$1g.1n("6p-3H",3H.3t(/&2q;/g," ").3t(/&DM;/g,"&"))}};4v.Ku=1a(4L,bc){K p,v;1p(p in 4L){if(2A 4L[p]==="1a"){bc[p]=4L[p]}1j{if(4L.86(p)){v=4L[p];if(v&&"1A"===2A v){bc[p]=4v.Kt(v)}1j{bc[p]=v}}}}1b bc};4v.Kt=1a(o){if(!o||"1A"!==2A o){1b o}K c=o g8 3R?[]:{};1b 4v.Ku(o,c)};4v.18J=1a(el,1P){K 1O={2f:el.54,1m:el.sk,1M:el.4Q,1w:el.fS};1O.8t=1O.1m-1O.2f;1O.4O=1O.1w-1O.1M;if(1P){1O=4v.A7(1O,1P)}1b 1O};4v.hN=1a(el,1P){K r=el.sa();K 1O={2f:3A.bf(r.2f),8t:3A.bf(r.8t),1M:3A.bf(r.1M),4O:3A.bf(r.4O)};if(!r.1m){1O.1m=r.8t-r.2f}1j{1O.1m=r.1m}if(!r.1w){1O.1w=r.4O-r.1M}1j{1O.1w=r.1w}if(1P){1O=4v.A7(1O,1P)}1b 1O};4v.A7=1a(r,p){1b{2f:r.2f-p.2f,1M:r.1M-p.1M,8t:r.8t-p.2f,4O:r.4O-p.1M,1w:r.1w,1m:r.1m}};4v.18L=1a(4s){K 4o=0;$(4s).2p(1a(){4o=3A.4o(4o,$(J).1w())}).1w(4o)};4v.18K=1a(4s){K 4o=0;$(4s).2p(1a(){4o=3A.4o(4o,$(J).1m())}).1m(4o)};4v.18D=1a(1y){if(1y){if(2A 1y=="4E"){if(1y!=""){1b 1y}}}1b""};4v.b2=1a(fR,1y){if(1y){if(2A 1y=="4E"){if(1y!=""){fR.1G(1y)}}}};2I.fn.ck=1a(1o){K iH=J.1n("1C");iH=1B(iH)?"":iH.49();if(1o===2x){if(iH=="9h"){1b J[0].4r}1j{if(iH=="9Y"){if(J[0].4r){1b J.1n("1o")}1j{1b 1d}}}1b J.2b()}if(iH=="9h"){if(1o==1l&&!J.1n("4r")){J.1n("4r","4r")}if(1o!=1l&&J.1n("4r")){J.ng("4r")}if(1o==1l&&!J.6Y("4r")){J.6Y("4r",1l)}if(1o!=1l&&J.6Y("4r")){J.6Y("4r",1k)}1b}1j{if(iH=="9Y"){K Kr=J.1n("1o");if(Kr==1o){J.1n("4r","1l");J[0].4r=1l}1j{J.ng("4r")}1b}1j{K 6L="";if(!1B(J[0])&&!1B(J[0].6L)){6L=J[0].6L}if(6L.49()=="2y"){J.uk(1B(1o)?"":1o.3Y());1b}}}if(1o==1d){1o=""}J.2b(1o)};2I.fn.19D=1a(qj){if(!J[0]){1b{1M:0,2f:0}}if(J[0]===J[0].uP.3G){1b 2I.2v.19C(J[0])}2I.2v.rj||2I.2v.dg();if(2A qj=="4E"){if(qj!=""){K 1P=J.7s(qj);if(1P.1f){4q 1P}}}1j{K 1P=qj}K 4f=J[0],fD=4f.fD,Kz=4f,3m=4f.uP,iq,gl=3m.9k,3G=3m.3G,lG=3m.lG,oK=lG.tH(4f,1d),1M=4f.9H,2f=4f.91;4x((4f=4f.3l)&&(4f!==3G&&4f!==gl)){iq=lG.tH(4f,1d);1M-=4f.4Q,2f-=4f.54;if(4f===fD){1M+=4f.9H,2f+=4f.91;if(2I.2v.19x&&!(2I.2v.19z&&/^t(Ul|d|h)$/i.9z(4f.6L))){1M+=6u(iq.GB,10)||0,2f+=6u(iq.Gz,10)||0}Kz=fD,fD=4f.fD}if(2I.2v.19A&&iq.er!=="6v"){1M+=6u(iq.GB,10)||0,2f+=6u(iq.Gz,10)||0}oK=iq;if($.vu(4f,1P)>=0){1s}}if(oK.2R==="pw"||oK.2R==="Kv"){1M+=3G.9H,2f+=3G.91}if(oK.2R==="Kx"){1M+=3A.4o(gl.4Q,3G.4Q),2f+=3A.4o(gl.54,3G.54)}1b{1M:1M,2f:2f}};1a 19I(3h,A3){if(2F.1f>2){K Ad=[];1p(K n=2;n<2F.1f;++n){Ad.1G(2F[n])}1b 1a(){1b A3.3w(3h,Ad)}}1j{1b 1a(){1b A3.2J(3h)}}}K fL=1a(a,b){if(1B(a)){a={}}if(1B(b)){b={}}K 1O={};$.4D(1O,a,b);1b 1O};K xi=1a(1y,28){K fR=1y[28];if(fR!=1d&&fR.1f>0){1b fR}4q 1y[28];1b 1d};K 1B=1a(1y){if(1y===2x){1b 1l}if(1y==1d){1b 1l}if(1y===""){1b 1l}1b 1k};K nk=1a(7X){if(!1B(7X)){1b 7X.49()}1b 7X};K 19i=1a(7X){if(!1B(7X)){1b 7X.9i()}1b 7X};K 2q=1a(1y){if(1y===2x){1b""}if(1y==1d){1b""}if(1y==""){1b""}1b 1y.3t(/ /g,"&2q;")};1a Kf(fM,g3,g5){1b 1a(a,b){if(!1B(fM)&&a[fM]<b[fM]){1b-1}if(!1B(fM)&&a[fM]>b[fM]){1b 1}if(!1B(g3)&&a[g3]<b[g3]){1b-1}if(!1B(g3)&&a[g3]>b[g3]){1b 1}if(!1B(g5)&&a[g5]<b[g5]){1b-1}if(!1B(g5)&&a[g5]>b[g5]){1b 1}1b 0}}3R.3f.vz=1a(fM,g3,g5){1b J.hP(Kf(fM,g3,g5))};K dU=1a(a,b){if(1B(a)&&1B(b)){1b 1l}if(1B(a)||1B(b)){1b 1k}1b a.49()==b.49()};4v.y6=1a(a,b){if(1B(a)&&1B(b)){1b 1l}1b a==b};1a 4D(qr,53){K F=1a(){};F.3f=53.3f;qr.3f=1T F;qr.3f.5L=qr;qr.19d=53.3f}1a 19c(Kn,cp){1p(K 4h in cp){Kn.3f[4h]=cp[4h]}}5Y.3f.7p=1a(7p){K t6="";K 3t=5Y.n4;1p(K i=0;i<7p.1f;i++){K tp=7p.cn(i);if(3t[tp]){t6+=3t[tp].2J(J)}1j{t6+=tp}}1b t6};5Y.n4={VX:["19v","19u","19n","19m","Vv","19o","19q","19p","19t","19r","19s","19f"],VV:["19g","19e","19k","19l","Vv","19j","19h","19w","19K","19L","19J","19H"],VO:["19P","19Q","19O","19M","19N","19B","19y"],VN:["19F","19G","19E","18F","18G","18E","18C"],d:1a(){1b(J.g6()<10?"0":"")+J.g6()},D:1a(){1b 5Y.n4.VO[J.uH()]},j:1a(){1b J.g6()},l:1a(){1b 5Y.n4.VN[J.uH()]},N:1a(){1b J.uH()+1},S:1a(){1b J.g6()%10==1&&J.g6()!=11?"st":J.g6()%10==2&&J.g6()!=12?"nd":J.g6()%10==3&&J.g6()!=13?"rd":"th"},w:1a(){1b J.uH()},z:1a(){1b"hJ rY iO"},W:1a(){1b"hJ rY iO"},F:1a(){1b 5Y.n4.VV[J.kU()]},m:1a(){1b(J.kU()<9?"0":"")+(J.kU()+1)},M:1a(){1b 5Y.n4.VX[J.kU()]},n:1a(){1b J.kU()+1},t:1a(){1b"hJ rY iO"},L:1a(){1b J.ql()%4==0&&J.ql()%100!=0||J.ql()%rD==0?"1":"0"},o:1a(){1b"hJ iO"},Y:1a(){1b J.ql()},y:1a(){1b(""+J.ql()).7z(2)},a:1a(){1b J.iz()<12?"am":"pm"},A:1a(){1b J.iz()<12?"AM":"PM"},B:1a(){1b"hJ rY iO"},g:1a(){1b J.iz()%12||12},G:1a(){1b J.iz()},h:1a(){1b((J.iz()%12||12)<10?"0":"")+(J.iz()%12||12)},H:1a(){1b(J.iz()<10?"0":"")+J.iz()},i:1a(){1b(J.VJ()<10?"0":"")+J.VJ()},s:1a(){1b(J.VM()<10?"0":"")+J.VM()},e:1a(){1b"hJ rY iO"},I:1a(){1b"hJ iO"},O:1a(){1b(-J.fY()<0?"-":"+")+(3A.4G(J.fY()/ 60) < 10 ? "0" : "") + 3A.4G(J.fY() /60)+"18u"},P:1a(){1b(-J.fY()<0?"-":"+")+(3A.4G(J.fY()/ 60) < 10 ? "0" : "") + 3A.4G(J.fY() /60)+":"+(3A.4G(J.fY()%60)<10?"0":"")+3A.4G(J.fY()%60)},T:1a(){K m=J.kU();J.V0(0);K 1O=J.18s().3t(/^.+ \\(?([^\\)]+)\\)?$/,"$1");J.V0(m);1b 1O},Z:1a(){1b-J.fY()*60},c:1a(){1b J.7p("Y-m-d")+"T"+J.7p("H:i:sP")},r:1a(){1b J.3Y()},U:1a(){1b J.Ug()/9m}};2I.fn.4K=1a(1C,1h,fn,dS){if(2A 1C==="1A"){1p(K 1r in 1C){J.2S(1r,1h,1C[1r],fn)}1b J}if(2I.cS(1h)){dS=fn;fn=1h;1h=2x}fn=dS===2x?fn:2I.1N.U2(fn,dS);1b 1C==="18t"?J.uF(1C,1h,fn,dS):J.2p(1a(){2I.1N.5F(J,1C,fn,1h)})};2I.fn.18A=1a(1C,1h,fn,dS){if(2I.cS(1h)){if(fn!==2x){dS=fn}fn=1h;1h=2x}2I(J.2W).2S(18B(1C,J.4s),{1h:1h,4s:J.4s,18z:1C},fn,dS);1b J};2I.1N.U2=1a(fn,bs,dS){if(bs!==2x&&!2I.cS(bs)){dS=bs;bs=2x}bs=bs||1a(){1b fn.3w(dS!==2x?dS:J,2F)};bs.8f=fn.8f=fn.8f||(bs.8f||J.8f++);1b bs};3R.3f.3M=1a(2L,to){if(2A 2L=="1A"){2L=J.5e(2L)}J.5W(2L,!to||1+to-2L+(!(to<0^2L>=0)&&(to<0||-1)*J.1f));1b J.1f};K U3={"&":"&DM;","<":"&lt;",">":"&gt;",\'"\':"&18x;","\'":"&#39;","/":"&#18y;"};qv=1a(s){if(1B(s)){1b s}1b(s+"").3t(/[&<>"\'\\/]/g,1a(s){1b U3[s]})};if(!5g.93){5g.93=1a(){K 86=5g.3f.86,Ua=!{3Y:1d}.vp("3Y"),vm=["3Y","Cm","TY","86","TX","vp","5L"],U9=vm.1f;1b 1a(1y){if(2A 1y!=="1A"&&(2A 1y!=="1a"||1y===1d)){96 1T tc("5g.93 vo on 18M-1A")}K 1O=[],6Y,i;1p(6Y in 1y){if(86.2J(1y,6Y)){1O.1G(6Y)}}if(Ua){1p(i=0;i<U9;i++){if(86.2J(1y,vm[i])){1O.1G(vm[i])}}}1b 1O}}()}(1a($){$.2p(["5p","3C"],1a(i,ev){K el=$.fn[ev];$.fn[ev]=1a(){K 1O=el.3w(J,2F);J.1R(ev);1b 1O}})})(2I);(1a(bG){if(2A aV==="1a"&&aV.vg){aV(["fJ"],bG)}1j{if(2A j5!=="2x"&&j5.vi){j5.vi=bG(190("fJ"))}1j{bG(2I)}}})(1a($){K $fp=$.fp=1a(3g,5C,3i){1b $(3z).fp(3g,5C,3i)};$fp.bn={bu:"xy",5C:0,Cc:1l};1a Bt(4f){1b!4f.98||$.vu(4f.98.49(),["e4","#2K","3J","3G"])!==-1}$.fn.Uq=1a(3u){J.2p(1a(1W,4f){if(4f.q0){K dX=4f.q0();dX.RA(1l);dX.Rz("xY",3u);dX.Rt("xY",3u);dX.2y()}1j{if(4f.ya){4f.ya(3u,3u)}}if(4f.54){4f.54=0}});1b J};$.fn.fp=1a(3g,5C,3i){if(2A 5C==="1A"){3i=5C;5C=0}if(2A 3i==="1a"){3i={UO:3i}}if(3g==="4o"){3g=191}3i=$.4D({},$fp.bn,3i);5C=5C||3i.5C;K et=3i.et&&3i.bu.1f>1;if(et){5C/=2}3i.2v=uK(3i.2v);3i.fl=uK(3i.fl);1b J.2p(1a(){if(3g===1d){1b}K 5R=Bt(J),4f=5R?J.18X||3z:J,$4f=$(4f),8Y=3g,1n={},vF;3P(2A 8Y){1q"dr":;1q"4E":if(/^([+-]=?)?\\d+(\\.\\d+)?(px|%)?$/.9z(8Y)){8Y=uK(8Y);1s}8Y=5R?$(8Y):$(8Y,4f);if(!8Y.1f){1b};1q"1A":if(8Y.is||8Y.2G){vF=(8Y=$(8Y)).2v()}}K 2v=$.cS(3i.2v)&&3i.2v(4f,8Y)||3i.2v;$.2p(3i.bu.3S(""),1a(i,bu){K oB=bu==="x"?"5r":"18Y",3u=oB.49(),1r="9y"+oB,3W=$4f[1r](),4o=$fp.4o(4f,bu);if(vF){1n[1r]=vF[3u]+(5R?0:3W-$4f.2v()[3u]);if(3i.kb){1n[1r]-=6u(8Y.2U("kb"+oB),10)||0;1n[1r]-=6u(8Y.2U("h4"+oB+"gv"),10)||0}1n[1r]+=2v[3u]||0;if(3i.fl[3u]){1n[1r]+=8Y[bu==="x"?"1m":"1w"]()*3i.fl[3u]}}1j{K 2b=8Y[3u];1n[1r]=2b.4d&&2b.4d(-1)==="%"?e6(2b)/100*4o:2b}if(3i.Cc&&/^\\d+$/.9z(1n[1r])){1n[1r]=1n[1r]<=0?0:3A.6e(1n[1r],4o)}if(!i&&3i.bu.1f>1){if(3W===1n[1r]){1n={}}1j{if(et){4X(3i.19a);1n={}}}}});4X(3i.UO);1a 4X(1X){K k2=$.4D({},3i,{et:1l,5C:5C,xt:1X&&1a(){1X.2J(4f,8Y,3i)}});$4f.4X(1n,k2)}})};$fp.4o=1a(4f,bu){K uQ=bu==="x"?"gv":"hc",9y="9y"+uQ;if(!Bt(4f)){1b 4f[9y]-$(4f)[uQ.49()]()}K 4l="19b"+uQ,3m=4f.uP||4f.2K,3J=3m.9k,3G=3m.3G;1b 3A.4o(3J[9y],3G[9y])-3A.6e(3J[4l],3G[4l])};1a uK(2b){1b $.cS(2b)||$.UR(2b)?2b:{1M:2b,2f:2b}}$.UQ.UK.54=$.UQ.UK.4Q={4w:1a(t){1b $(t.4f)[t.6Y]()},5U:1a(t){K ia=J.4w(t);if(t.1v.193&&(t.AB&&t.AB!==ia)){1b $(t.4f).6x()}K 3B=3A.5m(t.7S);if(ia!==3B){$(t.4f)[t.6Y](3B);t.AB=J.4w(t)}}};1b $fp});if(!3R.3f.tC){3R.3f.tC=1a(jR){K 6w=J.1f;if(2A jR!="1a"){96 1T tc}if(6w==0&&2F.1f==1){96 1T tc}K i=0;if(2F.1f>=2){K rv=2F[1]}1j{do{if(i in J){rv=J[i++];1s}if(++i>=6w){96 1T tc}}4x(1l)}1p(;i<6w;i++){if(i in J){rv=jR.2J(1d,rv,J[i],i,J)}}1b rv}}if(!3R.cD){3R.cD=1a(4M){1b 5g.3f.3Y.2J(4M)==="[1A 3R]"}};if(2A QB=="2x"){QB={}}if(2A QB.1e=="2x"){QB.1e={}}if(2A QB.1e.2N=="2x"){QB.1e.2N={}}if(2A QB.1e.1U=="2x"){QB.1e.1U={}}if(2A d5=="2x"){d5={mK:1a(){},IG:1a(){}}}K 194=1l;if(2A QB=="2x"){QB={}}if(2A QB.1e=="2x"){QB.1e={}}if(2A QB.1e.2N=="2x"){QB.1e.2N={}}if(2A QB.1e.1U=="2x"){QB.1e.1U={}}QB.1e.1U.18Q=1a(){J.9G=1d;J.7y=1d;J.eH=1d};QB.1e.1U.18R=1a(){J.8p=1d};QB.1e.1U.Dn=1a(){J.cw=1d;J.9e=1d;J.Ie=1d;J.6R=[];J.8w=1d;J.k0=1k;J.3v=1d;J.7Q=1k;J.6y=1k;J.dG=1k;J.m6=1d;J.gJ=1d;J.8j=0;J.6C=1d;J.Vg=1d;J.Ri=1d;J.FV=0;J.FC=1d;J.cH=1d;J.cl=1d};QB.1e.1U.jH=1a(){J.9e=1d;J.18P=1d;J.51=1d;J.ni=1d;J.jV=0;J.5A=[];J.3v=1d;J.3N=1d;J.5g=1d;J.QN=1l;J.fh=1d;J.lM="";J.18N=1k;J.kI=1d;J.kG=1d;J.7Q=1k;J.Pm=1k;J.6y=1k;J.TW=1d;J.6C=1d;J.J7=1d;J.Hr=1d;J.G8={A6:{8q:1l,9g:0,dc:"",ex:""},An:{9g:1,8q:1l,dc:"",ex:""},ud:{9g:2,8q:1l,dc:"",ex:""},o8:{ve:1k,9g:3,8q:1l,dc:"",ex:""},G9:1k,gJ:0,GJ:1l,Aq:1k};J.sC=[];J.cU=1d;J.X=1d;J.Y=1d;J.fU=1d;J.nv=1d};QB.1e.1U.18O=1a(){J.qt=2;J.51="";J.18V=1d;J.18W=1d;J.tG=1k;J.wM=1d;J.18U=1d};QB.1e.1U.S4=1a(){J.7Q=1d;J.6y=1d;J.5r=1d;J.hn=1d;J.5y=1d};QB.1e.1U.S0=1a(){J.18S=0;J.4R=0;J.eo=1d;J.18T=1d;J.aA=1d;J.vn=1d};QB.1e.1U.19R=1a(){J.5X=1d;J.1aK=1d};QB.1e.1U.wh=1a(){J.1aL=1d;J.8w=1d;J.u9=1d;J.3v=1d;J.dA=1k;J.GL=1d;J.7i=1d;J.fU=1d;J.vB=1d;J.1aJ=1k;J.1aH=0;J.o9=1k;J.W5=1k;J.1aI=1k;J.1aP=0;J.GG=1d;J.1aQ=0;J.Al=1d};QB.1e.1U.Ta=1a(){J.51=1d;J.X=1d;J.Y=1d;J.gv=1d;J.hc=1d;J.T3=1d};QB.1e.1U.qz=1a(){J.m5=[];J.2Q=1d;J.v0=1d;J.1aO=30;J.vE=0;J.dL="";J.gr="";J.1aM=1k;J.dH="";J.SD=1k};QB.1e.1U.B1=1a(){J.dL="";J.gr="";J.2Q=1d;J.RL=1k;J.4R=0;J.Br=1d;J.8j=0;J.51=1d;J.fU=1d;J.dH=1d;J.fh=1d;J.3N=1d;J.Uz=1k;J.gW=1k;J.Bh=1k;J.yc=1d;J.Bi=0;J.Bf=1d;J.Bg=1k;J.nv=1d};QB.1e.1U.1aN=1a(){J.2Q=1d;J.4R=0;J.Br=1d;J.8j=0;J.51=1d;J.fU=1d;J.dH=1d;J.fh=1d;J.3N=1d;J.Uz=1k;J.gW=1k;J.Bh=1k;J.yc=1d;J.Bi=0;J.Bf=1d;J.Bg=1k;J.nv=1d};QB.1e.1U.Sc=1a(){J.nY=[];J.Sb=1d;J.3v="1aA-B7-B7-B7-1aB";J.1az=1d;J.4R=0;J.Sd=1k};QB.1e.1U.AV=1a(){J.lB=1d;J.bl=1d;J.dA=1d;J.tG=1k};QB.1e.1U.gR=1a(){J.dL=1d;J.fz=1d;J.We=1d;J.Wz=1d;J.2i=1d;J.QH=1d;J.g0=1d;J.kz=1d;J.QD=1d;J.1ax=1d;J.aU=1d;J.2e=1d};QB.1e.1U.1ay=1a(){J.2Q=[]};QB.1e.1U.Ut=1a(){J.db="Ut";J.51=1d;J.3v=1d;J.fz=1d};QB.1e.1U.Wt=1a(){J.2Q=[]};QB.1e.1U.1aF=1a(){J.db=1d;J.3N=1d;J.fz=1d;J.H9=1k;J.2Q=[];J.3v=1d;J.dL=1d};QB.1e.1U.1aG=1a(){J.3v=1d;J.gm=1d;J.R0=1d;J.eG=1k;J.1aE=1k;J.8q=1l;J.51=1d;J.6N=1d;J.8i=1d;J.1aC=1k;J.zk=1d;J.kz=[];J.tU=[];J.2Q=[]};QB.1e.1U.CS=1a(){J.xj=[];J.aO=0;J.4R=3;J.1aD=1d;J.2Q=[];J.6H=1d;J.8v=0;J.6a=1d;J.84=1d};QB.1e.1U.E6=1a(){J.2Q=[];J.6H=1d;J.8v=0;J.6a=1d;J.84=1d;J.4R=0};QB.1e.1U.U8=1a(){J.4R=1;J.2Q=[];J.6H=1d;J.8v=0;J.6a=1d;J.84=1d};QB.1e.1U.E1=1a(){J.aO=0;J.4R=3;J.2Q=[];J.6H=1d;J.8v=0;J.6a=1d;J.84=1d};QB.1e.1U.DT=1a(){J.bL=1d;J.4R=2;J.2Q=[];J.6H=1d;J.8v=0;J.6a=1d;J.84=1d};QB.1e.1U.1aR=1a(){J.1b5=0;J.3N=1d;J.1b6=1;J.j0=1};QB.1e.1U.1b4=1a(){J.1b2=1d;J.3N=1d;J.1bb="";J.1b9="61";J.1b7=0;J.1b8=1d;J.1aV=1d;J.1aW=1d;J.wM=1d;J.1aU=1d;J.lB=1d};QB.1e.1U.xA=1a(){J.8i=1d;J.9T=1d;J.1aS=1d;J.1aT={3u:0,ik:0,cv:0}};QB.1e.1U.G8=1a(){J.A6={8q:1l,9g:0,dc:"",ex:""};J.An={9g:1,8q:1l,dc:"",ex:""};J.ud={9g:2,8q:1l,dc:"",ex:""};J.o8={ve:1k,9g:3,8q:1l,dc:"",ex:""};J.G9=1k;J.gJ=0;J.GJ=1l;J.Aq=1k};QB.1e.1U.3U={QK:{AD:"1b0&2q;kS",5g:"5g:",9e:"9e:",Ok:"OK",gb:"gb"},S2:{AD:"cU&2q;kS",1b1:"5r&2q;5g",1aZ:"5y&2q;5g",1aX:"dG&2q;9X&2q;Xb&2q;5r",1aY:"dG&2q;9X&2q;Xb&2q;5y",1a5:"5r&2q;6H",1a6:"5y&2q;6H",1a2:"1a3&2q;8w",Ok:"OK",gb:"gb"},TM:{AD:"C4&2q;kS",Xm:"Xm",1aa:"1ab&2q;1a9:",Ok:"OK",gb:"gb"},4g:{6R:{Dt:"8q",8w:"8w",cw:"cw",9e:"6H&2q;3N",gJ:"X7&2q;4R",m6:"X7&2q;1a7",k0:"k0",1a8:"xV&2q;By",Du:"6R&2q;1p",wF:"6R",Vt:"Or..."},AH:"AH",19W:"AH&2q;Wm",19U:"19T&2q;iL&2q;Wm",1a0:"pO&2q;F0&2q;8X",1a1:"X0&2q;F0&2q;k5-i4",19Z:"lS&2q;19X",19Y:"lS&2q;1ac",1aq:"lS&2q;up",1ar:"lS&2q;f4",1ap:"h9&2q;1i",1an:"WD&2q;ew&2q;1i",5A:"5A",Ws:"Ws",1ao:"aU",1av:"kL",1aw:"lU",1au:"hK",1as:"Wy&2q;2y&2q;1at&2q;1ag&2q;to&2q;1ah.",1af:"ie&2q;BF:&2q;{0}&2q;qR,&2q;{1}&2q;1ad,&2q;{2}&2q;1ae.",kS:"kS",h9:"h9",1al:"h9&2q;kz",1am:"dG&2q;9X",dG:"dG...",9X:"9X",Wi:"Wi",Wh:"Wh",Wc:"Wc",Wb:"Wb",1ak:"1ai&2q;9X",1aj:"18r&2q;9X",BB:"dG&2q;73&2q;3o&2q;2L&2q;{0}",16v:"C4&2q;is&2q;WT,&2q;WX&2q;to&2q;be&2q;16w",Th:"16u",pY:"pY...",WQ:"WQ",Rm:"8i&2q;i4&2q;2g&2q;is&2q;WT.&2q;W4&2q;to&2q;7R&2q;ip&2q;16s&2q;16t.",X5:"X5",kv:"fz&2q;cg",ff:"ff",Ht:"Ht",16A:"g0&2q;qe&2q;1H",16B:"g0&2q;WG&2q;aU&2q;8w",16z:"g0&2q;X0&2q;WG&2q;aU&2q;8w",16k:"Wa",VP:"WD&2q;k5-i4",16q:"oG&2q;5q&2q;iL&2q;16r&2q;1x&2q;16p&2q;16n&2q;in&2q;ip&2q;6t&2q;k5-i4.",kz:"kz",WJ:"WJ",WI:"WI",16o:"g0 kz",Qb:"WK&2q;2Z",Qa:"WK&2q;16P",HZ:"C3&2q;k5-i4",UX:"C3&2q;3n",UL:"C3&2q;6I",zl:"zl",bk:"bk",kI:"kI",kG:"kG",z4:"z4",ze:"ze",aU:"aU",kL:"kL",lU:"lU",pX:"pX",5X:"5X",cw:"cw",xX:"xX",At:"16N&2q;db",Af:"16O&2q;C4",16V:"16W"},16U:"en"};QB.1e.2N.16S={kI:0,kG:1,4R:2};QB.1e.2N.jV={aU:0,kL:1,16T:2,aK:3,R0:4,16G:5};QB.1e.2N.16H={hK:0,15M:1,15L:2};QB.1e.2N.15T={dZ:0,fi:1};QB.1e.2N.15Q={eV:0,15D:1,15E:2};QB.1e.2N.jL={eV:0,yA:1,yC:2};QB.1e.2N.15C={15A:1,15B:2,sZ:3};QB.1e.2N.15I={15J:0,15H:1,15F:2,h6:3,15G:4,5Y:5,Fl:6,15U:7,16b:8,3v:9,16c:10,Qi:11,16a:12,5g:13,168:14,169:15,61:16,R8:17,16g:18,16h:19,16f:20,16d:21,15Z:22,15X:23,15V:25,15W:26,166:27};QB.1e.2N.7w={Vn:0,Vh:1,Vu:2,rB:3,Vp:4,Vs:5,Va:6,Ea:7,Ee:8,VR:9,VU:10,VQ:11,VF:12,Vy:13,VA:14,VK:15,VL:16,VI:17};QB.1e.2N.6K={hK:0,bl:1,hH:2,5Y:3,h6:4};QB.1e.2N.167={hK:0,61:1,165:2,161:3,5Y:4,R8:5,Fl:6,h6:7};QB.1e.2N.ba={9X:0,wY:1,qs:2,eV:3};QB.1e.2N.pq={zl:1,bk:2,kI:4,kG:8,z4:16,ze:30,aU:32,kL:64,lU:128,pX:Pv,5X:Pu,cw:xZ,xX:Aa,ff:Pr,At:Po,Pq:Pn,Af:Pp,9X:164};QB.1e.2N.GK={eV:0,3N:1,fh:2};3s={8x:0,gw:[],CJ:[],gG:"",BF:{},8i:1d,2i:{9G:[],7y:[]},2e:{8p:[]},aT:1d,3v:1d,fz:1d,c6:{2Q:[],BW:0},eF:"",av:1d,R3:[],kC:1d,gR:{},ek:1d,gS:1k,vZ:1k,PJ:1k,16X:1k,gI:[],iQ:1d,8N:1d,zZ:1k,xA:1d,95:1d,ln:1d,j4:{},8A:1d,7f:1d,e3:1d,BL:1a(){J.gG="";J.BF={};J.8i=1d;J.oI=1d;J.2i={9G:[],7y:[]};J.2e={8p:[]};J.gw=[];J.CJ=[];J.c6={2Q:[],BW:0};J.7f=1d;J.fz=1d;J.eF="";J.av=1d;J.R3=[];J.ek=1d;J.gR={};J.j4={};J.8A=1d}};ib=1T 6N({fH:{},2S:1a(1N,1X,2W){J.fH||(J.fH={});K 4U=J.fH[1N]||(J.fH[1N]=[]);4U.1G({1X:1X,2W:2W,aJ:2W||J});1b J},1R:1a(1N){if(!J.fH){1b J}K 2w=3R.3f.4d.2J(2F,1);K 4U=J.fH[1N];K BH=J.fH.73;if(4U){J.BG(1N,4U,2w)}if(BH){J.BG(1N,BH,2F)}1b J},BG:1a(1N,4U,2w){K ev,i=-1,l=4U.1f,a1=2w[0],a2=2w[1],a3=2w[2];3P(2w.1f){1q 0:4x(++i<l){(ev=4U[i]).1X.2J(ev.aJ,1N)}1b;1q 1:4x(++i<l){(ev=4U[i]).1X.2J(ev.aJ,1N,a1)}1b;1q 2:4x(++i<l){(ev=4U[i]).1X.2J(ev.aJ,1N,a1,a2)}1b;1q 3:4x(++i<l){(ev=4U[i]).1X.2J(ev.aJ,1N,a1,a2,a3)}1b;5N:4x(++i<l){(ev=4U[i]).1X.3w(ev.aJ,[1N].4e(2w))}1b}},dg:1a(){}});Rd=1T 6N({bZ:ib,2l:{6J:"6J"}});Rc=1T 6N({bZ:ib,2l:{6J:"6J"}});PE=1T 6N({bZ:ib,2l:{ie:"ie",6J:"6J"}});PD=1T 6N({bZ:ib,2l:{ie:"ie",6J:"17X"}});PC=1T 6N({bZ:ib,2l:{6J:"6J"}});PB=1T 6N({bZ:ib,2l:{6J:"6J"}});Ph=1T 6N({bZ:ib,95:1T Rd,2i:1T Rc,2e:1T PC,8A:1T PB,ea:1T PE,iB:1T PD,2l:{x6:"x6",6J:"6J",Ah:"Ah",wQ:"wQ",zT:"zT",po:"po",xh:"xh",wV:"wV",wU:"wU",wO:"wO",DI:"DI"},3s:3s,ln:1d,eF:"",8N:{},kC:1d,av:1d,gI:1d,iQ:1d,ek:1d,8i:"",oI:"",yr:"",aT:"",rS:1k,3v:1d,c5:1k,Ao:1k,9t:0,c6:[],gS:1k,xB:1k,8x:0,dg:1a(){J.Py=$.ih(J.PK,17U,J);J.PO=$.ih(J.Pw,9m,J)},zF:1a(1X){K me=J;if(J.9t<0){J.9t=0}if(J.9t>0){6W(1a(){me.zF(1X)},100);1b}1b me.6g(1X)},Pw:1a(1X){J.6g(1X,1l)},A1:1a(bq){QB.1e.3D.pD.2i.ga[bq]=fL({},J.3s.2i);if(J.3s.2e!=1d&&(J.3s.2e.8p!=1d&&J.3s.2e.8p.1f)){QB.1e.3D.pD.2e.ga[bq]=fL({},J.3s.2e)}},6g:1a(1X,Pz){if(!QB.1e.2o.xB&&Pz){1b}QB.1e.2o.xB=1k;K me=J;if(J.9t<0){J.9t=0}J.8x++;K 5k=3z.gM.5B;if(3z.1M&&3z.1M.gM){5k=3z.1M.gM.5B}J.3s.xa=5k;J.3s.8x=J.8x;J.3s.aT=J.aT;J.3s.3v=J.3v;if(1B(J.3s.2i)){J.3s.2i={}}J.3s.2i.eH={eG:QB.1e.2i.Tb()};xi(J.3s.2i,"9G");xi(J.3s.2i,"7y");xi(J.3s.2e,"8p");J.A1(J.8x);if(J.c6.1f>0){J.3s.c6.BW=J.c6[J.c6.1f-1].Id}J.1R(J.2l.x6,J.3s);K 1h=$.ic(J.3s);me.3s.BL();J.9t++;J.Py();$.zR({5k:s5+"?42=Rb",1C:"r8",PN:"eu",PL:"nn/eu",8H:1k,1h:1h,xQ:1a(1h){QB.1e.2o.1R(QB.1e.2o.2l.6J,1h);me.gh(1h);if(1X&&7I(1X)=="1a"){1X(1h)}},5u:1a(FY,FT,PP){if($(".fs").1f==0){1b}if(!nA){eY(Cz)}},xt:me.FX});me.gS=1k},B2:1a(42,1X){K me=J;if(J.9t<0){J.9t=0}K bq=J.8x++;K 5k=3z.gM.5B;if(3z.1M&&3z.1M.gM){5k=3z.1M.gM.5B}J.3s.xa=5k;J.3s.8x=bq;J.3s.aT=J.aT;J.3s.3v=J.3v;K 1h=$.ic(J.3s);me.3s.BL();J.9t++;$.zR({5k:s5+"?42="+42,1C:"r8",PN:"eu",PL:"nn/eu",8H:1k,1h:1h,xQ:1a(1h){QB.1e.2o.1R(QB.1e.2o.2l.6J,1h);me.gh(1h);if(1X&&7I(1X)=="1a"){1X(1h)}},5u:1a(FY,FT,PP){if($(".fs").1f==0){1b}if(!nA){eY(Cz)}},xt:me.FX});me.gS=1k},7R:1a(1X){J.3s.gw.1G("7R");J.zF(1X)},mP:1a(1X){J.3s.gw.1G("mP");J.6g(1X)},qB:1a(1X){J.3s.gw.1G("qB");J.6g(1X)},Db:1a(1X){J.A1(J.8x+1);QB.1e.2o.gS=1l;QB.1e.2o.xB=1l;1b J.PO(1X)},PK:1a(){J.9t=0;1b},b5:1a(PG,1N,Ar,PF){if(!1B(Ar)){PG.1R(1N,Ar,PF)}},gh:1a(1h){if(1h!=1d&&1h!==2x){K me=J;if(1B(J.aT)){J.aT=1h.aT}if(1B(J.3v)){J.3v=1h.3v}if((1h.wm||J.wm)&&1h.PJ||(1B(1h.aT)||J.aT!=1h.aT||(1B(1h.3v)||J.3v!=1h.3v))){gM.17H();1b;1b}J.ln=1h.ln;J.eF=1h.eF;J.av=1h.av;J.gI=1h.gI;J.8N=1h.8N;J.iQ=1h.iQ;if(!1B(1h.j4)&&5g.93(1h.j4).1f>0){J.j4=1h.j4}if(!1B(1h.ek)){J.ek=1h.ek}J.b5(J.ea,J.ea.2l.6J,1h.7f);J.b5(J.iB,J.iB.2l.6J,1h.e3);if(!1B(J.ea)&&!J.c5){J.c5=1l;J.ea.1R(J.ea.2l.ie,1l)}if(!1B(J.iB)&&!J.Ao){J.Ao=1l;J.iB.1R(J.iB.2l.ie,1l)}J.b5(J,J.2l.wQ,1h.8i,1h.8x);J.b5(J.8A,J.8A.2l.6J,1h.8A,1h.8x);J.b5(J.2i,J.2i.2l.6J,1h.2i,1h.8x);J.b5(J.2e,J.2e.2l.6J,1h.2e,1h.8x);J.b5(J,J.2l.xh,1h.kC,1h.8x);J.b5(J.95,J.95.2l.6J,1h.95,1h.8x);J.b5(J,J.2l.wO,1h.gR,1h.8x);J.b5(J,J.2l.wV,1h.c6,1h.8x);J.b5(J,J.2l.Ah,1h.fz,1h.8x);J.b5(J,J.2l.wU,1h.17N,1h.8x);if(1h.zZ!=1d&&1h.zZ){J.1R(J.2l.zT,1h.8i,1h.8x)}J.b5(J,J.2l.po,1h.xA)}J.9t--},WU:1a(66){66.6y=1l;J.3s.2i.9G.1G(66)},WW:1a(66){66.7Q=1l;J.3s.2i.9G.1G(66)},WR:1a(66){66.Pm=1l;J.3s.2i.9G.1G(66)},QM:1a(66){J.3s.2i.9G.1G(66)},WY:1a(2k){2k.6y=1l;J.3s.2i.7y.1G(2k)},17O:1a(2k){2k.7Q=1l;J.3s.2i.7y.1G(2k)},Wf:1a(2k){J.3s.2i.7y.1G(2k)},D4:1a(9a){J.3s.8i=9a},17M:1a(3o){1p(K i=0;i<3o.1f;i++){3o[i].6y=1l}QB.1e.2o.3s.2e.8p=QB.1e.2o.3s.2e.8p.4e(3o)},sM:1a(3o){QB.1e.2o.3s.2e.8p=QB.1e.2o.3s.2e.8p.4e(3o)},17L:1a(3o){1p(K i=0;i<3o.1f;i++){3o[i].7Q=1l}QB.1e.2o.3s.2e.8p=QB.1e.2o.3s.2e.8p.4e(3o)}});QB.1e.2o=1T Ph;1S={iS:{kI:0,kG:1,aU:2,kL:3,lU:4,pX:5,cU:6,ff:7},pq:{1:QB.1e.1U.3U.4g.zl,2:QB.1e.1U.3U.4g.bk,4:QB.1e.1U.3U.4g.kI,8:QB.1e.1U.3U.4g.kG,16:QB.1e.1U.3U.4g.z4,30:QB.1e.1U.3U.4g.ze,32:QB.1e.1U.3U.4g.aU,64:QB.1e.1U.3U.4g.kL,128:QB.1e.1U.3U.4g.lU,Pv:QB.1e.1U.3U.4g.pX,Pu:QB.1e.1U.3U.4g.5X,xZ:QB.1e.1U.3U.4g.cw,Aa:QB.1e.1U.3U.4g.xX,Pr:QB.1e.1U.3U.4g.ff,Po:QB.1e.1U.3U.4g.At,Pn:QB.1e.1U.3U.4g.Pq,Pp:QB.1e.1U.3U.4g.Af,dl:1a(Qe){1p(K 1r in J){if(Qe==1r){1b J[1r]}}1b 1d}},2n:{42:-1,lJ:0,1Y:1,3n:2,aC:3,9x:4,7G:5,cF:6,eN:7,dn:8,6I:9,oO:10,2p:1a(1X){1p(K i=-1;i<=9;i++){1X(i,J.dl(i))}1p(K i=0;i<QB.1e.2e.k9;i++){1X(10+i,"Dp"+(i+1))}},dl:1a(2b){1p(K 1r in J){if(J[1r]==2b){1b 1r}}1b 1d}},8i:{s6:{eV:0,yw:1,IW:2,2p:1a(1X){1p(K i=0;i<=2;i++){1X(i,J.dl(i))}},dl:1a(2b){1p(K 1r in J){if(2b==J[1r]){1b 1r}}1b 1d}},cw:[" ","18l","18j","18h","18i","18p","18q"],yq:{oQ:"UE",zW:"18o",2p:1a(1X){1X(J.oQ,J.dl(J.oQ));1X(J.zW,J.dl(J.zW))},dl:1a(2b){if(2b==J.oQ){1b QB.1e.1U.3U.4g.Qb.3t("&2q;"," ")}1b QB.1e.1U.3U.4g.Qa.3t("&2q;"," ")}}},8K:{dZ:0,fi:1,cV:1a(1y){K 18m=1y;if(1y==1S.8K.dZ){1y=1S.8K.fi}1j{1y=1S.8K.dZ}1b 1y}},5g:1a(2T){J.iW={};J.qc="";J.Ac="";J.1x="";J.aC="";J.1C="";J.Qo="";J.PS=1d;J.id=4v.xW();if(2T){4v.pO(2T,J)}},18n:1a(2T){J.1x="18a";J.Qo="18b";J.1C="Qi";J.4l="4";J.hO="10";J.189="1";J.181=1k;if(2T){4v.pO(2T,J)}},18g:1a(1y){K 1O=[];if(1y.iW==1S.iS.aU){4v.b2(1O,1y.Ac);4v.b2(1O,1y.qc);4v.b2(1O,1y.1x)}if(1y.iW==1S.iS.ff){K 1P=1y.1P;if(1P){4v.b2(1O,1P.Ac);4v.b2(1O,1P.qc);4v.b2(1O,1P.1x);4v.b2(1O,1y.1x)}}1b 1O.5x(".")},A9:1a(28,1H){K 1O=[];if(1H){1B(1H.9e)?4v.b2(1O,1H.3N):4v.b2(1O,1H.9e);4v.b2(1O,28.7i)}1b 1O.5x(".")},18c:1a(1y){if(1y==1d){1b""}K 1O=[];if(1y.iW==1S.iS.aU){4v.b2(1O,1y.1x)}if(1y.iW==1S.iS.ff){K 1P=1y.PS;if(1P){4v.b2(1O,1P.1x);4v.b2(1O,1y.1x)}}1b 1O.5x(".")},S3:1a(3n,wr,p5,zK,pV){if(3n!=""){1b 3n}K 1O=1S.A9(wr,p5)+" = "+1S.A9(zK,pV);1b 1O},Q7:1a(){J.5X=[];J.kH=1a(){4q J.5X;J.5X=[]};J.18d=1a(kY){if(!kY.5X){1b}J.kH();K me=J;1p(K i=0;i<kY.5X.1f;i++){J.5X.1G(kY.5X[i])}}}};17d=1T 1S.Q7;K aW=15;QB.1e.2i={6v:1k,1Z:1d,8V:1d,5X:[],5i:[],r:1d,qY:1k,tV:1k,sZ:1k,17e:0,17c:0,vw:1k,uE:1k,uv:1k,us:1k,Dd:1a(8f){1p(K i=0;i<J.5X.1f;i++){K 1y=J.5X[i];K kY=1y.1h("4C");if(4v.y6(8f,kY.nv)){1b 1y}}1b 1d},D5:1a(ld,l5){1b ld.3v==l5.3v||(ld.6y||l5.6y)&&ld.6C==l5.6C},D7:1a(ld,l5){1b ld.51==l5.51},lq:1a(8g){K 1O=1d;if(1B(8g)){1b 1O}$.2p(J.5X,1a(1W,1y){K 1H=1y.1h("1A");if(dU(1H.9e,8g)||(dU(1H.3N,8g)||(dU(1H.lM,8g)||(dU(1H.ni,8g)||dU(1H.fU,8g))))){1O=1y;1b 1k}});1b 1O},17a:1a(m8){if(m8==1d){1b}K b9=m8.4d();K kE=[];K kT=[];K zU=[];K me=J;1p(K i=J.5X.1f-1;i>=0;i--){K 1y=J.5X[i];K zX=1y.1h("1A");K qg=1d;1p(K j=b9.1f-1;j>=0;j--){K fW=b9[j];if(J.D5(zX,fW)){b9.3M(j);qg=fW;1s}}if(qg==1d){1p(K j=b9.1f-1;j>=0;j--){K fW=b9[j];if(J.D7(zX,fW)){b9.3M(j);qg=fW;1s}}}if(qg!=1d){kT.1G({1Q:fW,6Z:1y})}1j{kE.1G(1y)}}$.2p(b9,1a(1W,fW){zU.1G(fW)});K bm=1a(1v,6Z){K 1y=J.bm(1v,6Z);if(6Z===2x||6Z==1d){1y.4K(QB.1e.7N.2l.ri,J.D3,J);1y.4K(QB.1e.7N.2l.qm,J.CY,J);1y.4K(QB.1e.7N.2l.qn,J.CZ,J);1y.4K(QB.1e.7N.2l.qd,J.gT,J)}J.4k.8Q("qH");1b 1y};K kK=1a(1v,6Z,kB){K 1y=J.kK(1v,6Z,kB);J.4k.8Q("qH");1b 1y};$.2p(kT,1a(1W,1y){kK({1A:1y.1Q},1y.6Z,1l)});$.2p(kE,1a(1W,1y){J.ym(1y,1l)});$.2p(zU,1a(1W,1y){bm({1A:1y})})},kK:1a(1v,6Z,kB){K 2v=6Z.2v();K wu={};K ww=1d;if(6Z!=1d){K hL=6Z.1h("1A");K nD=1v.1A;if(hL&&nD){wu[hL.3v]=nD.3v;ww=hL.3v;if(hL.5A&&nD.5A){$.2p(hL.5A,1a(i,28){if(hL.5A[i]&&nD.5A[i]){wu[hL.5A[i].3v]=nD.5A[i].3v}})}}}1v.kB=kB;6Z.6r("W8",1v);if(ww){$.2p(QB.1e.2i.7y.Tu(ww),1a(i,2k){2k.pz(wu)})}6E{6Z.2v(2v)}6G(e){}1b 6Z},bm:1a(1v,6Z){if(6Z==1d){K 8e=$("<2C></2C>");if(J.1Z!=1d&&J.1Z.1f>0){J.1Z.2Y(8e)}1j{1v.6v=1k}8e.6r(1v);8e.4K(QB.1e.7N.2l.t7,{1y:8e},J.PZ,J);8e.4K(QB.1e.7N.2l.tv,{1y:8e},J.Q1,J);8e.4K(QB.1e.7N.2l.tu,{1y:8e},J.T9,J);if(!1v.2R&&!1v.9R){K 2R=J.Tk(8e);8e.91=2R[0];8e.9H=2R[1];8e.6r("2R",2R)}J.5X.1G(8e);1b 8e}1j{6Z.6r("7R",1v);1b 6Z}},ym:1a(1A,lk){1A.6r("6n",1d,lk)},PZ:1a(e,1h){K 1y=e.1h.1y;K Q2=1y.1h("hm");J.5X.3M(1y);QB.1e.2i.7y.Ty(Q2)},Q1:1a(e,1h){K 1y=e.1h.1y;J.1Z.1R(QB.1e.2i.2l.x5,1y)},T9:1a(e,1h){K 1y=e.1h.1y;J.1Z.1R(QB.1e.2i.2l.wT,1y)},RW:1a(3v){K 1y=1d;$.2p(J.5X,1a(1W,o){if(o.1h("hm")==3v){1y=o.1h("Qv");1b 1k}});1b 1y},RV:1a(1H,T8){K 1O=1d;if(1H==1d){1b 1O}$.2p(1H.5O,1a(1W,28){if(28.1A.3v==T8){1O=28;1b 1k}});1b 1O},S8:1a(1H,6m){K 1O=1d;if(1H==1d){1b 1O}$.2p(1H.5O,1a(1W,28){if(28.1A.7i==6m){1O=28;1b 1k}});1b 1O},Tb:1a(){K 1O=[];$.2p(J.5X,1a(1W,1y){K 1H=1y.1h("1A");if(1H==1d){1b 1l}K l=1T QB.1e.1U.Ta;K p=1y.2R();if(1H.5A){l.T3=1H.5A.1f}l.51=1H.51;l.X=1y[0].91;l.Y=1y[0].9H;l.gv=1y.6r("2T","1m");if(l.gv=="6h"){l.gv=1d}l.hc=1y.6r("2T","1w");if(l.hc=="6h"){l.hc=1d}1O.1G(l)});1b 1O},Qr:1a(rH){if(rH==1d){1b}if(rH.1f==0){1b}$.2p(J.5X,1a(1W,1y){K 1H=1y.1h("1A");if(1H==1d){1b 1l}K aY=1d;1p(K 1W=0;1W<rH.1f;1W++){K l=rH[1W];if(l.51==1H.51){aY=l;1s}}if(aY!=1d){if(aY.X!=0&&(!1B(aY.X)&&(aY.Y!=0&&!1B(aY.Y)))){1y.6r("2R",[aY.X,aY.Y])}if(aY.gv!=0&&!1B(aY.gv)){1y.6r("2T","1m",aY.gv)}if(aY.hc!=0&&!1B(aY.hc)){1y.6r("2T","1w",aY.hc)}}})},S7:1a(1H){if(1H==1d){1b 1d}1b 1H.dz},Tk:1a(8e){K 1m=J.1Z.1m();if(1m<gj){1m=Aa}K cb=[0,1m];K cC=[0,17f];K jt=[];K ow=8e.1m();K oh=8e.1w();if(ow==0){ow=gj}if(oh==0){oh=150}K w=ow+aW*2;K h=oh+aW*2;J.Tf(cb,cC,jt,8e);if(J.qY){1b J.Td(cb,cC,jt,w,h)}1j{1b J.Tg(cb,cC,jt,w,h)}},Tg:1a(xs,ys,gU,w,h){1p(K j=0;j<ys.1f;j++){1p(K i=0;i<xs.1f;i++){if(gU[i][j]==0){if(J.Au(xs,ys,gU,i,j,w,h)){1b[xs[i]+aW,ys[j]+aW]}}}}1b[aW,aW]},Td:1a(xs,ys,gU,w,h){1p(K j=0;j<ys.1f;j++){1p(K i=xs.1f-1;i>=0;i--){if(gU[i][j]==0){if(J.Au(xs,ys,gU,i,j,w,h)){if(i+1<xs.1f){1b[xs[i+1]+aW-w,ys[j]+aW]}}}}}1b[aW,aW]},Tf:1a(cb,cC,jt,8e){$.2p(J.5X,1a(){if(J==8e){1b 1l}K 1y=J[0];cb.1G(1y.91-aW);cC.1G(1y.9H-aW);K ow=1y.hj;K oh=1y.9n;if(ow==0){ow=gj}if(oh==0){oh=150}cb.1G(1y.91+ow+aW);cC.1G(1y.9H+oh+aW)});cb.hP(1a(a,b){1b a-b});cC.hP(1a(a,b){1b a-b});1p(K i=0;i<cb.1f;i++){K 1I=[];1p(K j=0;j<cC.1f;j++){1I.1G(i==cb.1f-1||j==cC.1f-1?1:0)}jt.1G(1I)}$.2p(J.5X,1a(){K 1y=J[0];K SS=1y.91;K SM=1y.9H;K ow=1y.hj;K oh=1y.9n;if(ow==0){ow=gj}if(oh==0){oh=150}K SP=1y.91+ow;K SL=1y.9H+oh;K DP=0;K Ai=0;1p(K i=0;i<cb.1f;i++){if(cb[i]<=SS){DP=i}if(SP<=cb[i]){Ai=i;1s}}K Ak=0;K zY=0;1p(K j=0;j<cC.1f;j++){if(cC[j]<=SM){Ak=j}if(SL<=cC[j]){zY=j;1s}}1p(K i=DP;i<Ai;i++){1p(K j=Ak;j<zY;j++){jt[i][j]=1}}})},62:1a(){if(J.1Z==1d||J.1Z.1f==0){1b 1d}K 1Z=J.1Z[0];J.r.nO(1,1);K w=1Z.sk-18;K h=1Z.fS-18;if(w<0){w=0}if(h<0){h=0}J.r.nO(w,h)},Au:1a(xs,ys,gU,xl,xe,w,h){if(gU[xl][xe]==1){1b 1k}1p(K j=xe;j<=ys.1f;j++){if(ys[j]-ys[xe]>=h){1s}1p(K i=xl;i<xs.1f;i++){if(xs[i]-xs[xl]>=w){1s}if(gU[i][j]==1){1b 1k}}}1b 1l},e0:1a(){if(J.1Z==1d||J.1Z.1f==0){1b 1d}QB.1e.2i.7y.l8();if(mS===2x){1b}J.n9()},vY:1a(){K 3T=J.rP();if(3T){3T.3T("7F")}J.62()},hv:1a(42,1i,1v,we){3P(42){1q"fm":J.vY();1s;5N:J.1Z.1R(QB.1e.2i.2l.xk,{42:42,1i:1i,we:we})}},rP:1a(){if(QB.1e.3D.eF==""||QB.1e.3D.eF=="173"){1b 1d}K dV="#qb-ui-i4-174-"+QB.1e.3D.eF;K $k6=$(dV);if($k6.1f){if(1B(QB.1e.3D.h0[dV])){K 92={};92[" OK "]=1a(){$(J).2B("[1x]").2p(1a(i,28){K $28=$(28);K 6m=$28.1n("1x");K pb=$28.ck();if(pb!=1d){QB.1e.3D.av[6m]=pb}});$(J).3T("6n");QB.1e.3D.WP();QB.1e.2o.6g()};92[QB.1e.1U.3U.TM.gb]=1a(){$(J).3T("6n")};QB.1e.3D.h0[dV]=$k6.3T({vh:1k,5f:1k,G4:1l,4u:Gd,a9:G3,9s:17y,1m:"S5",7F:1a(e,ui){K $3T=$(e.3g);1p(K BR in QB.1e.3D.av){K TI=QB.1e.3D.av[BR];K 5O=$3T.2B("[1x="+BR+"]");1p(K i=0;i<5O.1f;i++){K $28=$(5O[i]);$28.ck(TI)}K TE=$(\'2a[1x^="17z"]\',$k6);TE.2p(1a(){J.2O=QB.1e.3D.av.17x})}},92:92})}}1b QB.1e.3D.h0[dV]},kj:1a(7B){if(7B==1d||7B.1f==0){1b 1d}K 1J={};K 5I;1p(K i=0;i<7B.1f;i++){5I=7B[i];if(5I.3N!=1d&&5I.3N.7z(0,1)=="-"){1J[5I.db+i]=5I.3N}1j{1J[5I.db]={1x:5I.3N,3V:5I.db+(5I.H9?" 4r":""),1J:J.kj(5I.2Q),1h:5I.3v,1r:5I.db}}}1b 1J},eI:1a(1V){K me=J;if(J.BE){1b}if(1B(1V)||1V.2Q.1f==0){1b}K 1J=J.kj(1V.2Q);$.2P("6F","#qb-ui-1Z");$.2P({4s:"#qb-ui-1Z",4u:aQ,17w:{5C:0},1X:1a(42,1v){K 1i=1d;6E{1i=1v.$1Y.1h().2P.1J[42]}6G(e){}K 2R={1M:1v.y-$("#qb-ui-1Z").2v().1M,2f:1v.x-$("#qb-ui-1Z").2v().2f};me.hv(42,1i,1v,{2R:2R})},1J:1J})},QI:1a(1V){K me=J;if(1B(1V)||1V.2Q.1f==0){1b}if(J.BD){1b}K 4s="#qb-ui-1Z 3b 1K, #qb-ui-1Z .2k-2W";K 1J=J.kj(1V.2Q);$.2P("6F",4s);$.2P({4s:4s,4u:aQ,7n:{5C:0},nH:1k,9F:1a($1R,e){K me=$1R.1h("me");if(2A me=="2x"){1b}K 1i=1J["73-2L"];if(1i){1i.1x=QB.1e.1U.3U.4g.BB.3t("{0}","<xT>"+me.5r.1H.4C.51+"</xT>");if(me.5r.4R==1S.8K.dZ){1i.3V=1i.1r}1j{1i.3V=1i.1r+" 4r"}}1i=1J["73-to"];if(1i){1i.1x=QB.1e.1U.3U.4g.BB.3t("{0}","<xT>"+me.5y.1H.4C.51+"</xT>");if(me.5y.4R==1S.8K.dZ){1i.3V=1i.1r}1j{1i.3V=1i.1r+" 4r"}}1b{1J:1J}},1X:1a(42,1v){K me=J.1h("me");if(me){me.hv(42)}},1J:{}})},QE:1a(1V,TT){K me=J;if(1B(1V)||1V.2Q.1f==0){1b}if(J.Bv){1b}K 4s=".qb-ui-1H";K 1J=J.kj(1V.2Q);K TV=J.kj(TT.2Q);$.2P("6F",4s);$.2P({4s:4s,4u:aQ,7n:{5C:0},nH:1k,9F:1a($1R,e){K 1H=$1R.1h("me");if(1H&&(1H.4C&&1H.4C.TW)){e.1h.1J=TV}1j{e.1h.1J=1J}1b{}},1X:1a(42,1v){K me=J.1h("me");if(me){me.hv(42)}},1J:1J})},8Z:1a(){K me=J;K Co="qb-ui-1Z";J.1Z=$("#qb-ui-1Z");J.qY=J.1Z.4J("qY");J.tV=J.1Z.4J("tV");J.sZ=J.1Z.4J("sZ");J.vw=J.1Z.4J("vw");J.uE=J.1Z.4J("uE");J.uv=J.1Z.4J("uv");J.us=J.1Z.4J("us");J.Bv=J.1Z.4J("Bv");J.BD=J.1Z.4J("BD");J.BE=J.1Z.4J("BE");if(!J.1Z.1f){1b 1d}J.6v=1l;J.8V=$("#"+Co);K w=J.1Z[0].sk;K h=J.1Z[0].fS;if(w==0){w=9m}if(h==0){h=9m}J.r=cB(Co,w-18,h-18);K 7r=J.1Z.1n("7r");if(!9B(7r)){7r=6o(7r)}if(!1B(7r)){$.ui.6r.3f.1v.7r=7r}K 9C=J.1Z.1n("9C");if(!9B(9C)){9C=6o(9C)}if(!1B(9C)){$.ui.6r.3f.1v.9C=9C}J.1Z.3F(1a(e){K Cr=26;if(e.7a.id=="qb-ui-1Z"||e.7a.6L=="3b"){K Cl=$(J).2v();K x=e.7E-Cl.2f;K y=e.89-Cl.1M;if(x>=J.ma-Cr&&y<Cr){me.vY()}}});$("#qb-ui-1Z").3F(1a(e){K Tr=36;K Tq=26;if(e.3g.id=="qb-ui-1Z-bY"||e.3g.6L=="3b"){K x=!1B(e.TS)?e.TS:e.17D;K y=!1B(e.TN)?e.TN:e.17E;if(x>=J.ma-Tr&&y<Tq){me.vY()}}});J.1Z.8O({zA:"qb-ui-1Z-7u",Is:".qb-ui-1Z-8O",f9:"aB",In:1a(e,ui){K 1Z=$("#qb-ui-1Z")[0];if(ui.45.4J("qb-ui-3I-28-45")){K 9Q=ui.45.1h("9Q");K eb=ui.45.1h("eb");K 1A=ui.45.1h("1A");K 9L=ui.45.1h("9L");if(9L==1d){9L=1T QB.1e.1U.jH;9L.6y=1l;9L.51=eb;9L.3N=eb}K dk=4v.hN(ui.45[0],4v.hN(1Z));dk.1M+=1Z.4Q;$(me.1Z).1R(QB.1e.2i.2l.xm,{1H:9L,28:1A,8g:eb,6m:9Q,9R:[dk.2f,dk.1M]})}1j{K 1A=ui.45.1h("1A");if(1A==1d){1A=1T QB.1e.1U.jH;1A.6y=1l;1A.51=ui.45.1h("9Q");1A.3N=ui.45.1h("9Q")}K dk=4v.hN(ui.45[0],4v.hN(1Z));if(dk.2f<0){dk.2f=0}if(dk.1M<0){dk.1M=0}dk.1M+=1Z.4Q;K zx={1A:1A,9R:[dk.2f,dk.1M]};$(me.1Z).1R(QB.1e.2i.2l.xR,zx)}}});J.n9=$.C2(J.62,9m,J);J.jw=$.C2(J.e0,5,J);J.Tt=$.ih(J.e0,lp,J);J.1Z.62(1a(e,ui){me.jw()});$("#qb-ui-1Z").on("vU",1a(1N,ui){me.62()});$("#qb-ui-3I-qA").on("vU",1a(1N,ui){me.62()});$("#qb-ui-3I").on("vU",1a(1N,ui){me.62()});$("#qb-ui").on("vU",1a(1N,ui){me.62()});J.n9();$(3z).62(1a(e){if(e.3g!=3z){1b}me.n9()});1b J},n9:1a(){},jw:1a(){},Tt:1a(){}};QB.1e.2i.2l={xR:"xR",Df:"Df",x5:"x5",wT:"wT",Tp:"Tp",xm:"xm",xk:"xk"};QB.1e.2i.7y={5i:[],rw:1a(1Q){K 2k=1T QB.1e.2i.cU(1Q);QB.1e.2i.7y.1G(2k);1b 2k},zd:1a(2k,1Q){2k.1Q(1Q)},l8:1a(){if(!QB.1e.2i.6v){1b 1d}$.2p(J.5i,1a(1W,2k){2k.l8()})},1G:1a(1y){J.5i.1G(1y)},17B:1a(2k){1p(K i=0;i<J.5i.1f;i++){if(J.5i[i].2k==2k){1b J.5i[i]}}1b 1d},17o:1a(5i){if(5i==1d){1b 1k}if(5i.1f==0){1b 1k}J.zp();1p(K 1W=0;1W<5i.1f;1W++){K 8d=5i[1W];K aD=1d;if(8d.5r!=1d&&8d.5y!=1d){aD=J.z6(8d.5r.aA,8d.5y.aA)}if(aD==1d){J.rw(8d)}1j{aD.sc=1k;J.zd(aD,8d)}}J.za();QB.1e.2i.e0()},z6:1a(TA,Tz){1p(K i=J.5i.1f-1;i>=0;i--){K 2k=J.5i[i];if(2k.5r&&2k.5y){if(2k.5r.aA==TA&&2k.5y.aA==Tz){1b J.5i[i]}}}1b 1d},17n:1a(8V){1p(K i=0;i<J.5i.1f;i++){if(J.5i[i].8V==8V){J.m7(i);1s}}},Ty:1a(8f){1p(K i=J.5i.1f-1;i>=0;i--){K 2k=J.5i[i];if(2k.5r!=1d&&2k.5y!=1d){if(2k.5r.eo==8f||2k.5y.eo==8f){J.m7(i)}}}},3M:1a(2k){if(2k===2x){1b}if(2k==1d){1b}1p(K i=0;i<J.5i.1f;i++){if(J.5i[i]==2k){J.m7(i);1s}}2k=1d},17l:1a(){1p(K i=J.5i.1f-1;i>=0;i--){J.m7(i)}},za:1a(){1p(K i=J.5i.1f-1;i>=0;i--){if(J.5i[i].sc){J.m7(i)}}},m7:1a(1W){K 2k=J.5i[1W];if(2k.8V!=1d){J.o3(2k.8V.cv);J.o3(2k.8V.bg);J.o3(2k.8V.3a);J.o3(2k.8V.5d);4q 2k.8V}4q 2k;J.5i.5W(1W,1)},Tu:1a(8f){K 1O=[];1p(K i=J.5i.1f-1;i>=0;i--){K 2k=J.5i[i];if(2k.5r!=1d&&2k.5y!=1d){if(2k.5r.eo==8f||2k.5y.eo==8f){1O.1G(2k)}}}1b 1O},17q:1a(5i){if(5i==1d){1b 1k}if(5i.1f==0){1b 1k}J.zp();1p(K 1W=0;1W<5i.1f;1W++){K 8d=5i[1W];K aD=1d;if(8d.5r!=1d&&8d.5y!=1d){aD=J.z6(8d.5r.aA,8d.5y.aA)}if(aD==1d){J.rw(8d)}1j{aD.sc=1k;J.zd(aD,8d)}}J.za()},zp:1a(){1p(K i=J.5i.1f-1;i>=0;i--){J.5i[i].sc=1l}},o3:1a(1y){if(1y){if(1y.3M){1y.3M();1y=1d}}}};QB.1e.2i.AK=1a(1Q){J.28=1d;J.1H=1d;J.1Q=1a(2b){if(2b===2x){K 1Q=1T QB.1e.1U.S0;4v.RX(J,1Q);1b 1Q}1j{J.1H=1d;J.28=1d;4v.pO(2b,J);J.AO()}};J.AO=1a(){if(1B(J.1H)){J.1H=QB.1e.2i.RW(J.eo)}if(1B(J.28)){J.28=QB.1e.2i.RV(J.1H,J.aA);if(J.28==1d){J.28=QB.1e.2i.S8(J.1H,J.vn)}if(J.28==1d){J.28={};J.28.1g=QB.1e.2i.S7(J.1H)}}};J.pz=1a(ho){if(ho[J.eo]){J.1H=1d;J.eo=ho[J.eo]}if(ho[J.aA]){J.28=1d;J.aA=ho[J.aA]}J.AO()};if(1Q!=1d){J.1Q(1Q)}};QB.1e.2i.cU=1a(1Q){if(!QB.1e.2i.6v){1b 1d}K me=J;J.hn="";J.7Q=1k;J.6y=1Q.6y==1l;J.5r=1T QB.1e.2i.AK;J.5y=1T QB.1e.2i.AK;J.8V=1d;J.id=4v.xW();J.RH=1a(7q){if(me.8V!=1d){1b}me.8V=QB.1e.2i.6v?QB.1e.2i.r.Sa(me,"#1dw|2"):1d};J.l8=1a(){if(QB.1e.2i.6v){QB.1e.2i.r.AW(me)}};J.hv=1a(42){K bF=1k;3P(42){1q"73-2L":me.5r.4R=1S.8K.cV(me.5r.4R);bF=1l;1s;1q"73-to":me.5y.4R=1S.8K.cV(me.5y.4R);bF=1l;1s;1q"4q":me.7Q=1l;bF=1l;1s;1q"fm":K 3T=$("#2k-fm-3T");K wr=me.5r.28.1A;K zK=me.5y.28.1A;K p5=me.5r.1H.4C;K pV=me.5y.1H.4C;$("2a[1x=2L-1A]",3T).2b(p5.51);$("2a[1x=to-1A]",3T).2b(pV.51);$("2a[1x=2L-1A-2y]",3T)[0].4r=me.5r.4R==1S.8K.fi;$("2a[1x=to-1A-2y]",3T)[0].4r=me.5y.4R==1S.8K.fi;$("2a[1x=1A-3n-2a]",3T).2b(1S.S3(me.hn,wr,p5,zK,pV));K 92={};92[" OK "]=1a(){me.5r.4R=$("2a[1x=2L-1A-2y]",3T).ck()?1S.8K.fi:1S.8K.dZ;me.5y.4R=$("2a[1x=to-1A-2y]",3T).ck()?1S.8K.fi:1S.8K.dZ;me.hn=$("2a[1x=1A-3n-2a]",3T).2b();K 1g=me.8V.1K[0];$("#qb-ui-1Z").1R(QB.1e.2i.cU.2l.rs,me);QB.1e.2i.e0();$(J).3T("6n")};92[QB.1e.1U.3U.S2.gb]=1a(){$(J).3T("6n")};3T.3T({5f:1k,4u:Gd,a9:G3,1m:"S5",G4:1l,92:92});1s}if(bF){K 1g=me.8V.1K[0];$("#qb-ui-1Z").1R(QB.1e.2i.cU.2l.rs,me)}QB.1e.2i.e0()};J.tB=1a(){K 1Q=1T QB.1e.1U.S4;1Q.5r=J.5r.1Q();1Q.5y=J.5y.1Q();1Q.7Q=J.7Q;1Q.6y=J.6y;1Q.hn=J.hn;1b 1Q};J.tA=1a(1Q){J.5r.1Q(1Q.5r);J.5y.1Q(1Q.5y);J.7Q=1Q.7Q;J.6y=1Q.6y;J.hn=1Q.hn};J.1Q=1a(2b){if(2b===2x){1b J.tB()}1j{J.tA(2b)}};J.pz=1a(ho){J.5r.pz(ho);J.5y.pz(ho)};J.8Z=1a(){J.1Q(1Q);J.RH();K AE=$(J.8V.bg.1u);AE.1h("me",J);AE.og()};J.8Z()};QB.1e.2i.cU.2l={rs:"rs"};QB.1e.e3=1a(){J.1g=1d;J.h5=1k;J.al=1T 3R;J.1J=1T 3R;J.d3=J.1J;J.43="";J.fg=$("#qb-ui-3I-1J");J.yK=$(".qb-ui-3I-1i-43-5J");J.jJ=$("#qb-ui-3I-h3-1J");J.1dl=1d;J.vJ=$("#qb-ui-3I-1i-dQ-8k");J.B6=1;J.RC=1a(2g,ks){K r=1T eh("("+ks+")","ig");1b 2g.3t(r,\'<2u 2t="qb-ui-3I-ks">$1</2u>\')};J.hM=1a(1u,3l,oC,lZ){K me=J;K hG=1u.2Q;K 1K=1u.dH;K RO=1B(3l);if(1B(3l)){3l=J.fg;K tF=1u.dH.3S("/");1p(K i=1;i<tF.1f;i++){K Bl=tF[i];if(1B(Bl)){1s}K 1u=3l.5w("ul").5w("li:eq("+Bl+")");if(1u.1f){3l=1u}1j{3l=1d;1s}}}if(1B(3l)){3l=J.fg}if(!1B(hG)){if(hG.1f>0){K $ul=3l.5w("ul");$ul.5w(".3I-1u").3K("dQ");if($ul.1f==0){$ul=$("<ul>").4n(3l);if(oC){if((1u.4R&QB.1e.2N.pq.5X)==0){J.y9($ul,1l)}1j{J.Bn($ul,1l)}}1j{if(3l.4J("1u-im")||1u.Bi<=J.B6){J.y9($ul,1l)}1j{J.Bn($ul,1l)}}}1j{$ul.3J("")}1p(K i=0;i<hG.1f;i++){K 1i=hG[i];if(1i!=1d){K te=QB.1e.1U.3U.4g.kv+" "+1i.51;K fb=1i.51;if(oC&&(1i.4R&QB.1e.2N.pq.5X)!=0){fb=1i.yc}fb=fb.3t(/ /g,"&2q;");if(oC){fb=J.RC(fb,J.43)}K hz="";K 1C=1S.pq.dl(1i.4R);if(!1B(1C)){hz+=1C+": "}hz+=1i.Bf;if(!1B(1i.fh)){hz+="\\n"+1i.fh}K Bp=1i.Bg;K 1do=1i.gW?"gW=1l ":"";K RQ=1i.Bh?"qb-ui-1A ":"";K RD=Bp?"1u-9M ":"1u-1dG ";K RP=\'<2C 2t="\'+RD+\'">&2q;</2C>\';K Bm="1u-aZ";if(lZ&&lZ.cW(1i.dH)){Bm="1u-im"}K 2u=\'<2u 6U="0" 2t="3I-1u qb-ui-1Z-8O qb-ui-4k-8O qb-ui-1A-\'+1i.Br+" "+RQ+(Bp?"is-9M":"")+\'" 6p-3H="\'+te+\'" 5c="\'+hz+\'">\'+fb+"</2u>";K $li=$("<li>"+RP+2u+"</li>");$li.1n("2t",Bm);$li.1n("1W",1i.8j);$li.1n("fb",1i.51);$li.1n("1x",1i.3N);$li.1n("1dz",1i.yc);$li.1n("1K",1i.dH);$li.1n("9Q",1i.fU);if(1i.gW){$li.1n("gW","1l")}}$ul.2Y($li);J.q7($ul);if(RO&&$ul.is(":6d")){J.y9($ul)}if(1i.2Q!=1d&&1i.2Q.1f>0){J.hM(1i,$li,oC,lZ)}}}}};J.gh=1a(1h){if(1h==1d||1h===2x){1b}if(1h.RL&&1h.gr==J.43){J.fg.3C();J.jJ.5p();J.jJ.3J("");J.yK.3K("dQ");J.hM(1h,J.jJ,1l)}1j{J.jJ.3C();J.fg.5p();K lZ=$("li.1u-im","#qb-ui-3I-1J").bC(1a(){1b $(J).1n("1K")}).4w();J.hM(1h,1d,1k,lZ)}};J.uf=1a(){J.43=$("#qb-ui-3I-1i-43-2a").2b()};J.ue=1a(e){$("#qb-ui-3I-1i-43-2a").2b("");J.43="";J.ji(e)};J.ut=1a(e){if(e.3Z==13){e.6X();1b 1k}J.ub(e)};J.uG=1a(e){if(e.3Z==13){e.6X();1b 1k}};J.ji=1a(e){J.43=e.7a.1o;if(1B(J.43)){J.jJ.3C();J.fg.5p();J.jJ.3J("")}1j{J.SB(J.43)}};J.Bn=1a($1u,lI,$aj){if(1B($aj)){$aj=$1u.1P("li")}$aj.2r("1u-aZ");$aj.3K("1u-im");if(lI){$1u.3C()}1j{$1u.RK(tE)}};J.y9=1a($1u,lI,$aj){if(1B($aj)){$aj=$1u.1P("li")}$aj.2r("1u-im");$aj.3K("1u-aZ");if(lI){$1u.5p()}1j{$1u.RN(tE)}};J.Cw=1a($1u,lI,$aj){if(1B($aj)){$aj=$1u.1P("li")}$aj.8L("1u-im");$aj.8L("1u-aZ");if(lI){$1u.cV()}1j{$1u.1dx(tE)}};J.q7=1a($1g){K me=J;$1g.2B(".qb-ui-1A").7j({2X:0.8,4n:"3G",sS:10,vs:"mn",45:1a(e){K 1g=e.7a.3l;K $li=$(1g);K 1i=1T QB.1e.1U.jH;1i.6y=1l;1i.51=$li.1n("fb");1i.3N=$li.1n("9Q");K 45=$("<2C ></2C>");45.6r({lT:1l,1A:1i,4u:Sk});45.2r("qb-ui-1Z-8O");1b 45[0]}});$1g.2B(".qb-ui-1A-28").7j({2X:1,4n:"3G",sS:10,vs:"mn",45:1a(e){K $1g=$(e.7a.3l);K $vq=$1g.7s("li");K 1x=$1g.1n("1x");K 45=$(\'<2u 2t="qb-ui-3I-28-45 qb-ui-4k-8O qb-ui-1Z-8O">\'+1x.3t(/ /g,"&2q;")+"</2u>");45.1h("9Q",$1g.1n("9Q"));45.1h("eb",$vq.1n("9Q"));1b 45[0]}})};J.wa=1a(){K me=J;K 1g=$(".qb-ui-3I-qA");J.h5=1g.4J("h5");J.BQ=1g.4J("RM");if(!1B(1g.1n("Sz"))){J.B6=6o(1g.1n("Sz"))}$("#qb-ui-3I-1i-5J").u6();$("#qb-ui-3I-1i-43-2a").4K("qW",me.ut,me);$("#qb-ui-3I-1i-43-2a").4K("8h",me.uG,me);$("#qb-ui-3I-1i-43-9I").4K("3F",me.ue,me);1a bm(1g){K $li=$(1g);K 1i=1T QB.1e.1U.jH;1i.6y=1l;1i.51=$li.1n("fb");1i.3N=$li.1n("9Q");me.1g.1R(QB.1e.e3.2l.iC,1i)}$(2K).on("u4","#qb-ui-3I-1J .qb-ui-1A 2u",1a(e){if($(e.7a).4J("28")){1b 1k}bm(e.7a.3l);e.6X();1b 1k});$(2K).on("8h","#qb-ui-3I-1J .qb-ui-1A 2u",1a(e){if(e.3Z==13){bm(e.7a.3l);e.6X();1b 1k}});J.uf();J.1g=1g;1b 1g};J.B9=1a(e){K 1g=e.7a;1b J.B8(1g)};J.Su=1a($li){if($li.1n("gW")){1b 1k}K me=J;$li.5w(".3I-1u").2r("dQ");K 1K=$li.1n("1K");QB.1e.2o.3s.gw.1G("Bd");QB.1e.2o.3s.e3=1T QB.1e.1U.B1;QB.1e.2o.3s.e3.dH=1K;QB.1e.2o.B2("Bd",1a(){me.Sy($li)});1b 1l};J.Sy=1a($li){$li.5w(".3I-1u").3K("dQ");$li.1n("gW",1l)};J.SB=1a(43){K me=J;J.yK.2r("dQ");QB.1e.2o.3s.gw.1G("1dC");QB.1e.2o.3s.e3=1T QB.1e.1U.B1;QB.1e.2o.3s.e3.gr=J.43;QB.1e.2o.B2("Bd",1a(){me.Sx()});1b 1l};J.Sx=1a($li){J.yK.3K("dQ")};J.B8=1a(1g){K $li=$(1g).1P("li");K $ul=$li.5w("ul");if($ul.1f&&$ul.3J()!==""){J.Cw($ul,1k,$li)}1j{if(!1B($li.1n("gW"))){J.Cw($ul,1k,$li)}1j{J.Su($li)}}};J.ub=$.ih(J.ji,lp,J);K me=J;$(2K).on("3F",".3I-1u.is-9M",1a(e){me.B9(e)});$(2K).on("3F",".1u-9M",1a(e){me.B9(e)})};QB.1e.e3.2l={um:"um",iC:"iC"};QB.1e.7f=1a(){J.1dB=10;J.3I=1d;J.h5=1k;J.al=1T 3R;J.1J=1T 3R;J.d3=J.1J;J.43="";J.jp=6;J.eC=24;J.rk=3;J.fg=$("#qb-ui-3I-1J");J.vJ=$("#qb-ui-3I-1i-dQ-8k");J.pF=0;J.k1=1k;J.u5=0;J.eX=1;J.SG=1k;J.jV=1a(1W){1p(K 1r in QB.1e.2N.jV){if(QB.1e.2N.jV[1r]==1W){1b 1r}}1b"1H"};J.hM=1a(){K me=J;K pJ=1T 3R;pJ.1G("<ul>");J.fg.3J("");if(!1B(J.d3)){K 71=J.d3.1f;K 3a=3A.6e((J.eX-1)*J.eC,71);K 5d=3A.6e(J.eX*J.eC,71);K q2="";1p(K i=3a;i<5d;i++){K 1i=J.d3[i];K t9=i+1==5d?" 7Y":"";if(1i!=1d){K Bs=J.BQ?\'<br><2u 2t="T1">\'+1i.fh+"</2u>":"";K te=QB.1e.1U.3U.4g.kv+" "+1i.lM;K 1x=1i.lM.3t(/ /g,"&2q;");K hz=!1B(1i.fU)?1i.fU:1i.lM;if(!1B(1i.fh)){hz+="\\n"+1i.fh}K 2u=\'<2u 6U="0" 2t="qb-ui-1Z-8O 1cZ \'+J.jV(1i.jV).49()+\'" 6p-3H="\'+te+\'" 5c="\'+hz+\'">\'+1x+"</2u>";if(!J.h5){q2=\'<li 2t="qb-ui-1A qb-ui-1A-1H\'+t9+\'" id="qb-ui-3I-1i-\'+i+\'">\'+2u+Bs+"</li>"}1j{K oY="";K Be="";K 28=1d;K B4="";1p(K j=0;j<1i.5A.1f;j++){28=1i.5A[j];B4="<2u 2t=\'28\'>"+28.vB.3t(/ /g,"&2q;")+"</2u>";K SH=j+1==1i.5A.1f?" 7Y":"";Be=\'<li 2t="qb-ui-1A-28 qb-ui-4k-8O qb-ui-1Z-8O SK\'+SH+\'" id="qb-ui-3I-1i-28-\'+j+\'">\'+B4+"</li>";oY+=Be}oY=\'<ul 2t="qb-ui-3I qb-6d">\'+oY+"</ul>";q2=\'<li 2t="qb-ui-1A qb-ui-1A-1H 9M SK\'+t9+\'" id="qb-ui-3I-1i-\'+i+\'">\'+"<2C 2t=\\"4Y qb-ui-1A-4Y qb-ui-1A-1H-4Y 9M-4Y\\" 1cY=\\"$J = $(J); if ($J.4J(\'dD-4Y\')) { $J.1P().8L(\'dD\');$J.1P().8L(\'9M\'); $J.8L(\'dD-4Y\'); $J.8L(\'9M-4Y\'); $(\'~ul\', $(J)).3C(); } 1j {$J.1P().8L(\'dD\');$J.1P().8L(\'9M\'); $J.8L(\'dD-4Y\'); $J.8L(\'9M-4Y\'); $(\'~ul\', $(J)).5p(); }\\"></2C>"+2u+Bs+oY+"</li>"}}1j{q2=\'<li 2t="qb-ui-1A qb-ui-1A-1H\'+t9+\'" id="qb-ui-3I-1i-\'+i+\'">\'+\'<2u 2t="1H">\'+QB.1e.1U.3U.4g.pY+"</2u></li>"}pJ.1G(q2)}}pJ.1G("</ul>");J.fg.3J(pJ.5x(""));J.q7();J.So();$("#qb-ui-3I-1i-5J").u6()};J.SC=1a(1h){K lr=$("#qb-ui-3I-al");lr.3J("");J.al=1T 3R;1p(K i=0;i<1h.m5.1f;i++){K 9u=1h.m5[i];K g7=J.Sg(i+1,9u);g7.1h("1C",9u.4R);g7.1h("8f",9u.3v);K kZ=g7.ck();K AZ=1T 3R;K dF=-1;1p(K j=0;j<9u.nY.1f;j++){K 2T=9u.nY[j];if(dF==-1&&(!1B(kZ)&&dU(2T.lB,kZ))){dF=j}if(dF==-1&&2T.dA){dF=j}}if(dF==-1){dF=0}1p(K j=0;j<9u.nY.1f;j++){K 2T=9u.nY[j];K 2O="";if(2T.tG==1l){2O=" 2O"}K 1Y="";if(dF==j){1Y=" 1Y"}AZ.1G(\'<2T 1o="\'+2T.lB+\'"\'+2O+1Y+">"+2T.bl+"</2T>")}g7.3J(AZ.5x(""));g7.3L({1m:"100%"});J.al.1G(g7)}};J.gh=1a(1h){if(1h==1d||2A 1h==="2x"){1b}if(1h.2Q==1d||2A 1h.2Q==="2x"){1b}K me=J;J.pF=1h.v0;J.SG=1h.SD==1l;J.k1=1k;K pI=1k;if(1h.gr!=""&&(1h.gr!=2x&&1h.gr!=1d)){pI=1l;J.k1=1l}if(1h.vE==0){J.eX=1;J.SC(1h);J.1J=[];if(1h.2Q.1f!=1h.v0){J.k1=1l}}K Sh=1h.2Q.1f;K SF=1h.vE;K SE=1h.v0;1p(K mY=SF,va=0;mY<SE;mY++,va++){if(va<Sh){J.1J[mY]=1h.2Q[va]}1j{if(J.1J[mY]==2x){J.1J[mY]=1d;J.k1=1l}}}J.Cd(pI);J.hM();J.Sq()};J.St=1a(){if(J.1J.1f<J.pF){1b 1l}K 3a=3A.4o(0,(J.eX-1)*J.eC);K 5d=3A.6e(J.pF,J.eX*J.eC);1p(K i=3a;i<5d;i++){if(J.1J[i]==1d){1b 1l}}1b 1k};J.Sg=1a(i,9u){K lr=$("#qb-ui-3I-al");K id="qb-ui-3I-al-2y-"+i;K 1g=$("#"+id);if(1g.71){1b 1g}K me=J;K 3J=$(\'<2C 2t="qb-ui-3I-al-5J 1d1-\'+i+" 2y-1C-"+9u.4R+\'">                         <2C 2t="qb-ui-3I-al-3H"></2C>                         <2C 2t="qb-ui-3I-al-2y">                             <2y id="\'+id+\'"></2y>                         </2C>                     </2C>\');lr.2Y(3J);1g=$("#"+id);1g.1h("1W",i);1g.1h("8f",9u.3v);1g.4K("dp",me.Sp,me);1g.4K("1d4",me.Sr,me);1b 1g};J.vj=1a(AU){K Sf=$("#qb-ui-3I-al");K al=$("2y",Sf);K AS=[];al.2p(1a(i,s){K 9u=1T QB.1e.1U.Sc;9u.Sb=s.1o;if(!1B(AU)){9u.Sd=s.id==AU.id}9u.4R=$(s).1h("1C");9u.3v=$(s).1h("8f");AS.1G(9u)});1b AS};J.1cR=1a(2y,1v){K me=J;K 1g=2y[0];1p(K i=0;i<1g.1v.1f;i++){K 2T=1g.1v[i];K fk=1T QB.1e.1U.AV;fk.lB=2T.1o;fk.bl=2T.2g;fk.dA=2T.1Y;1v.1G(fk)}};J.1cU=1a(2y,1v){K me=J;K 1g=2y[0];1p(K i=0;i<1g.1v.1f;i++){K 2T=1g.1v[i];K fk=1T QB.1e.1U.AV;fk.lB=2T.1o;fk.bl=2T.2g;fk.dA=2T.1Y;1v.1G(fk)}};J.uf=1a(){J.43=$("#qb-ui-3I-1i-43-2a").2b()};J.ue=1a(e){$("#qb-ui-3I-1i-43-2a").2b("");J.43="";J.ji(e)};J.Cd=1a(pI){K vA=1d;K uR=!1B(J.43);if(uR){6E{vA=1T eh(J.43,"i")}6G(e){vA=1d;uR=1k}}if(!uR||pI){J.d3=J.1J;J.u5=J.pF}1j{if(!1B(J.1J)){J.d3=1T 3R;1p(K i=0;i<J.1J.1f;i++){K 1i=J.1J[i];if(1i==1d){J.Cg();1b}if(!vA.9z(1i.lM)){ap}J.d3.1G(1i)}J.u5=J.d3.1f}}};J.ut=1a(e){if(e.3Z==13){e.6X();1b 1k}if(J.k1){J.ub(e)}1j{J.ji(e)}};J.uG=1a(e){if(e.3Z==13){e.6X();1b 1k}};J.ji=1a(e){J.eX=1;J.43=e.7a.1o;if(!J.k1){J.Cd();J.hM()}1j{J.Cg()}};J.vr=1a(){J.fg.3J("");J.vJ.5p()};J.Sq=1a(){J.vJ.3C()};J.Cg=1a(){J.vr();K 1h=QB.1e.2o.3s;1h.7f=1T QB.1e.1U.qz;1h.7f.m5=J.vj();1h.7f.dL="4w";1h.7f.gr=J.43;QB.1e.2o.6g()};J.SA=1a(){J.vr();K 1h=QB.1e.2o.3s;1h.7f=1T QB.1e.1U.qz;1h.7f.m5=J.vj();1h.7f.dL="4w";1h.7f.gr=J.43;1h.7f.vE=(J.eX-1)*J.eC;QB.1e.2o.6g()};J.Sp=1a(e){K me=J;K 1W=$(e.7a).1h("1W");K 1h=QB.1e.2o.3s;1h.7f=1T QB.1e.1U.qz;1h.7f.m5=J.vj(e.3g);J.Ss(1W);QB.1e.2o.6g()};J.Ss=1a(1W){1p(K i=1W;i<J.al.1f;i++){K g7=J.al[i];g7.3J("<2T>pY...</2T>")}J.vr()};J.Sr=1a(){};J.q7=1a(){K me=J;$(".qb-ui-1A>2u").7j({2X:0.8,4n:"3G",sS:10,vs:"mn",3a:1a(1N,ui){},45:1a(e){K 1g=e.7a.3l;K tX=1g.id.7z("qb-ui-3I-1i-".1f);K 1i=me.d3[tX];K 45=$("<2C ></2C>");1i.6y=1l;45.6r({lT:1l,1A:1i,4u:Sk});45.2r("qb-ui-1Z-8O");1b 45[0]}});$(".qb-ui-1A-28").7j({2X:1,4n:"3G",vs:"mn",sS:10,45:1a(e){K 1g=e.7a;K tX=1g.id.7z("qb-ui-3I-1i-28-".1f);K vq=$(1g).7s("li");K Sn=vq.1n("id").7z("qb-ui-3I-1i-".1f);K tW=me.d3[Sn];if(tW==1d){1b}K 1i=tW.5A[tX];if(1i==1d){1b}K 45=$(\'<2u 2t="qb-ui-3I-28-45 qb-ui-4k-8O qb-ui-1Z-8O">\'+1i.7i.3t(/ /g,"&2q;")+"</2u>");45.1h("1A",1i);45.1h("9L",tW);1b 45[0]}});$(".4Y",J.3I).3F(1a(e){})};J.So=1a(){K me=J;K 71=3A.j3(J.u5/J.eC);K 1g=$("#qb-ui-3I-1i-1d9-5J");if(71<=1){1g.3J("");1b}if(me.Se==71){me.BX=$("#qq").54()}1j{me.Se=71;me.BX=0}1g.u7({71:71,3a:J.eX,4T:me.jp,h4:1k,l9:"#1e6",kV:"3q",ly:"#1ea",lA:"3q",Bz:1l,tI:"SI",sz:1a(E2){me.eX=6o(E2);me.Sv();me.hM()}});$("#qq").54(me.BX)};J.Sv=1a(){if(!J.St()){1b}J.SA()};J.wa=1a(){K me=J;K 1g=$(".qb-ui-3I");J.h5=1g.4J("h5");J.BQ=1g.4J("RM");if(1g.1n("RF")!=""){J.eC=1g.1n("RF")}if(J.eC<=0||J.eC==""){J.eC=24}if(1g.1n("RJ")!=""){J.rk=1g.1n("RJ")}if(J.rk<=0||J.rk==""){J.rk=3}K zQ=1g.1n("jp");if(zQ!=""){6E{K jp=6o(zQ);if(jp>0){J.jp=jp}}6G(e){}}$("#qb-ui-3I-1i-43-2a").4K("qW",me.ut,me);$("#qb-ui-3I-1i-43-2a").4K("8h",me.uG,me);$("#qb-ui-3I-1i-43-9I").4K("3F",me.ue,me);1a bm(1g){K RG=1g.id.7z("qb-ui-3I-1i-".1f);K 1i=me.d3[RG];me.3I.1R(QB.1e.7f.2l.iC,1i)}$(2K).on("u4","#qb-ui-3I-1J .qb-ui-1A 2u",1a(e){if($(e.7a).4J("28")){1b 1k}bm(e.7a.3l)});$(2K).on("8h","#qb-ui-3I-1J .qb-ui-1A 2u",1a(e){if(e.3Z==13){bm(e.7a.3l)}});J.uf();J.3I=1g;1b 1g};J.ub=$.ih(J.ji,lp,J);1b J.3I};QB.1e.7f.2l={um:"um",iC:"iC"};QB.1e.GH=1a(28,69,uh,1v){K me=J;J.iW=1S.iS.ff;J.1A=28;J.1H=uh;J.1P=69;J.4r=28.dA;J.1g=$(\'<tr 6U="-1" />\').2r("qb-ui-1H-28 ag").1h("J",J).1h("1A",28).1h("1H",uh).1h("hm",28.3v).1h("1P",69).1h("uU",69.3v);4v.Hw(J.1g,QB.1e.1U.3U.4g.ff+" "+28.7i);if(28.7i=="*"){J.1g.2r("qb-ui-1H-28-k3")}J.tg=$(\'<2a 1C="9h" 1o="1" 6U="-1" \'+(28.dA?" 4r":"")+"/>").3F(1a(){me.eL(J.4r);uh.uM([me])});J.1g.8h(1a(e){3P(e.3Z){1q 13:;1q 32:me.tg.1R("3F");e.4H()}});J.A0=$(\'<2u 2t="qb-ui-1H-28-3V">&2q;</2u>\');if(28.o9){J.A0.2r("qb-ui-1H-28-3V-pk")}K pQ=1v.A6;K ph=1v.An;K As=1v.Aq;K uX=1v.ud;K v9=1v.o8;K 6m=28.vB;if(1B(6m)){6m=28.7i}K SW=!1B(28.Al)?\'<2u 2t="qb-ui-1H-28-1C-4l">\'+"("+28.Al+")"+"</2u>":"";K uI=28.7i!="*"&&(28.u9!=1d&&28.u9!="1d")?uX.dc+28.u9+SW+1v.ud.ex:"";J.T2=$(\'<2u 2t="qb-ui-1H-28-2y">\'+pQ.dc+"</2u>").2r(QB.1e.2i.us?"qb-6d":"").2Y(J.tg);J.6m=$(\'<2u 2t="qb-ui-1H-28-1x">\'+ph.dc+2q(6m)+ph.ex+"</2u>").2r(QB.1e.2i.uE?"qb-6d":"");J.uI=$(\'<2u 2t="qb-ui-1H-28-1C">\'+uI+"</2u>").2r(QB.1e.2i.uv?"qb-6d":"");J.SZ=$(\'<2u 2t="qb-ui-1H-28-T1">\'+pQ.dc+(v9.ve?28.GL:2q(28.GG))+1v.o8.ex+"</2u>").2r(QB.1e.2i.vw?"qb-6d":"");K 6q=[];6q.1G({3r:J.A0,9g:-1,8q:1l});6q.1G({3r:J.T2,9g:pQ.9g,8q:pQ.8q});6q.1G({3r:J.6m,9g:ph.9g,8q:ph.8q});6q.1G({3r:J.uI,9g:uX.9g,8q:uX.8q});6q.1G({3r:J.SZ,9g:v9.9g,8q:v9.8q});6q.vz("9g");K 7K;if(As){7K=me.1g}1j{7K=$("<td W3 />");7K.4n(me.1g)}1p(K i=0;i<6q.1f;i++){K 3O=6q[i];if(As){7K.2Y($("<td td"+(i+1)+\'" />\').2Y(3O.3r))}1j{7K.2Y(3O.3r)}}J.eL=1a(1o){J.4r=1o;J.1A.dA=J.4r;J.tg[0].4r=J.4r};J.7t=1a(){K 5P={x:0,y:0,1m:0,1w:0};K o=J.1g;K Gy=hN(QB.1e.2i.1Z[0]);K hd=hN(o,Gy);K 1P=o;do{if(1P.6L.9i()=="T0"){1P=1P.3l;if(1P){1P=1P.3l}1s}1P=1P.3l}4x(1P!=1d);K he=hd;if(1P!=1d){he=hN(1P,Gy)}if(hd.1M<he.1M){5P.y=he.1M}1j{if(hd.1M>he.4O-hd.1w/2){5P.y=he.4O-hd.1w/2}1j{5P.y=hd.1M}}5P.1w=hd.1w;5P.1m=he.1m;5P.x=he.2f;1b 5P}};QB.1e.GH.2l={SO:"SO"};K Hi=20;QB.1e.95=1a(){J.3r=$("#qb-ui-1Z-aH");J.1V=1d;K j8=J;K jr=J.3r;K mT=0;K r7=0;K nm=0;J.Qq=1a(qw){if(J.3r.1n("SQ")&&J.3r.1n("SQ").49()=="1k"){1b}K $3E=$("#qb-ui-1Z-aH-8C");if(!$3E){1b}K $b7=[];1p(K i=0;i<qw.2Q.1f;i++){K 1i=qw.2Q[i];K 2g=1i.bl;if(1B(2g)){2g="&2q;"}if(2g==="+"){2g=QB.1e.3D.eW.gX}K $1g=$(\'<2C 2t="3r" id="qb-ui-1Z-aH-8C\'+(i+1)+\'">\'+2g+"</2C>").2r(1i.ju);$1g.d1();if(1i.eG){$1g.2r("ui-4P-8S");$1g.1n("6U",-1)}1j{$1g.1n("6U",0);$1g.8h(1a(e){if(e.3Z==32||e.3Z==13){$(e.3g).1R("3F")}})}$1g.1h("1i",1i);$1g.3F(1a(e){K $1g=$(e.7a);if($1g.1h("SR.ha")){1b}K 1i=$1g.1h("1i");if(1i&&1i.dL){QB.1e.3D.zi(1i.dL)}1j{$("#"+$1g[0].id).2P()}if(1i&&1i.eG){$1g.2r("ui-4P-8S");e.4H();1b 1k}});$1g.7u(1a(e){K $1g=$(e.7a);K 1i=$1g.1h("1i");if(1i&&1i.eG){$1g.2r("ui-4P-8S");e.4H();1b 1k}});$1g.4W(1a(e){K $1g=$(e.7a);K 1i=$1g.1h("1i");if(1i&&1i.eG){$1g.2r("ui-4P-8S");e.4H();1b 1k}});$1g.og();J.Q3($1g,1i.gR);$b7.1G($1g)}$3E.ew();$jr=$(\'<2C id="qb-ui-1Z-aH-8C-jr">\');$jr.4n($3E).2Y($b7)};1a uD(9K,4X){if(9K<0){9K=0}1j{if(9K>nm){9K=nm}}Te(9K)}1a Te(9K){if(9K===2x){9K=1bE.2R().2f}Hb=9K;K 1bG=Hb===0,1bY=Hb==nm,mO=9K/nm,Ti=-mO*(mT-r7);jr.2U("2f",Ti)}1a uu(){1b-jr.2R().2f}1a 1bW(pl,pr,aP){1b 1a(){T6(pl,pr,J,aP);J.4W();1b 1k}}1a T6(pl,pr,cA,aP){cA=$(cA).2r("T7");K 3j,ot,Hc=1l,H7=1a(){if(pl!==0){j8.HC(pl*30)}if(pr!==0){j8.HD(pr*30)}ot=6W(H7,Hc?vK:50);Hc=1k};H7();3j=aP?"fB.j8":"7k.j8";aP=aP||$("3J");aP.2S(3j,1a(){cA.3K("T7");ot&&hg(ot);ot=1d;aP.8W(3j)})}J.Hd=1a(7B){if(7B==1d||7B.1f==0){1b 1d}K 1J={};K 5I;1p(K i=0;i<7B.1f;i++){5I=7B[i];K 1r=5I.db;if(5I.3N!=1d&&5I.3N.7z(0,1)=="-"){1J[1r]=5I.3N}1j{1J[1r]={1x:5I.3N,3V:1r+(5I.H9?" 4r":""),1J:J.Hd(5I.2Q),1h:5I}}}1b 1J};J.Q3=1a($1g,1V){K me=J;if(1B(1V)||1V.2Q.1f==0){1b}K 1J=J.Hd(1V.2Q);K 4s="#"+$1g[0].id;$.2P("6F",4s);$.2P({4s:4s,4u:aQ,7n:{5C:0},1J:1J,1X:1a(42,1v){K 5I=1v.1J[42].1h;me.xg(42,5I)}});$.2P.mf.1bZ=1a(1i,1L,2D){J.on("8h",1a(e){})}};J.xg=1a(1r,1i){K 42=1d;if(1i!=1d&&2A 1i.dL!="2x"){42=1i.dL}42.3v=QB.1e.2o.ek;J.3r.1R(QB.1e.95.2l.w2,42)};J.vx=1a(s){if(s==1d){1b s}if(s.1f<=Hi){1b s}1b s.7z(0,Hi)+"&1bS;"};J.PR=1a(1P){K 1J=[];if(1P==1d){1b 1J}$.2p(1P.2Q,1a(1W,1i){if(!1i.8q){1b}if(1i.eG){1b}1J.1G(1i)});1b 1J};J.PU=1a(1P){K fq=1d;if(1P==1d){1b fq}$.2p(1P.2Q,1a(1W,1i){if(1i.eG){fq=1i}});1b fq};J.GX=1a($3e){$3e.1n("6U",0);$3e.8h(1a(e){if(e.3Z==32||e.3Z==13){$(e.3g).1R("3F")}})};J.GU=1a(1i,2O){K me=J;K 3V="ui-3V-qb-"+1i.6N;K $3e=$(\'<2C 2t="8X He-3e">\'+J.vx(1i.51)+"</2C>").1h("HH",1i.3v).1h("gm",1i.gm).d1({2O:2O,dM:{r9:3V}}).3F(1a(e){me.ur(e);e.6X();1b 1k});$3e.2r("He-3e");if(2O){$3e.2r("ui-4P-8S");$3e.2r("He-3e-8S")}1j{J.GX($3e)}$3e.5w(".ui-3V-qb-qe").3J(QB.1e.3D.eW.ty);1b $3e};J.PW=1a(1J){K me=J;K $ul=$("<ul/>");$.2p(1J,1a(1W,gq){K 3V="ui-3V-qb-"+gq.6N;K $li=$("<li></li>").4n($ul);K 3b="";if(gq.6N==="qe"){3b=QB.1e.3D.eW.ty}$li.2Y(\'<2u 2t="ui-3V \'+3V+\'">\'+3b+"</2u>");K $3e=$(\'<a 5B="#\'+me.vx(gq.51)+\'">\'+me.vx(gq.51)+"</a>").1h("HH",gq.3v).1h("gm",gq.gm).3F(1a(e){$ul.3C();me.ur(e);e.6X();1b 1k});$li.2Y($3e)});$ul.1V({2y:1a(e,ui){$ul.3C();me.ur(e);e.6X();1b 1k}});me.ru=1d;me.GW=gj;$ul.on("1bV",1a(){hg(me.ru)}).on("1bU",1a(1N){if(me.H6){1b}me.ru=6W(1a(){$ul.3C()},me.GW)});1b $ul};J.H3=1a(1i,1P){K me=J;K 8C=[];if(1i==1d){1b 8C}K 1J=J.PR(1i);K fq=J.PU(1i);K Hg=fq===1d;K $3e=J.GU(1i,Hg);$3e.2r("3e-5U");8C.1G($3e);K rt=1d;if(1i.tU!=1d&&1i.tU.1f>0){rt=1i.tU}1j{if(1P!=1d&&1P.2Q.1f>1){rt=1P.2Q}}if(rt!=1d){K kP=Hg;$3e.d1("2T","dM.Rs","ui-3V-qf-1-s");$3e.5w(".ui-3V-qb-qe").3J(QB.1e.3D.eW.ty);$3e.7u(1a(e){if(me.1V!=1d){me.1V.3C()}me.1V=$(J).3B("ul").5p().2R({my:"2f 1M",at:"2f 4O",of:$(J)});me.1V.2U({"6e-1m":$(J).8b()});$(2K).uF("3F",1a(){me.1V.3C()})}).on("hi",1a(){hg(me.ru);me.H6=1l}).on("fB",1a(1N){me.H6=1k;me.ru=6W(1a(){me.1V.3C()},me.GW)});K $PX=$("<2C>&2q;</2C>").d1({2g:1k,dM:{r9:"ui-3V-qf-1-s"}}).3F(1a(e){if(me.1V!=1d){me.1V.3C()}me.1V=$(J).3B().5p().2R({my:"2f 1M",at:"2f 4O",of:$(J).3W(".ui-3e")});$(2K).uF("3F",1a(){me.1V.3C()});e.6X();1b 1k});J.GX($PX);K $ul=J.PW(rt);8C.1G($ul)}if(1J.1f>0||1l){if(fq!=1d){}1j{K $2C=$(\'<2C 2t="ui-8z-7O ui-4P-8S ui-bd-73 8X-3e-3E 3e-5U">&2q;</2C>\').d1({2O:1l});$2C.2r("ui-4P-8S");8C.1G($2C);$.2p(1J,1a(1W,gq){K 3e=me.GU(gq);$2C.5w(".ui-3e-2g").2Y(3e)})}}1j{if(fq!=1d){}}if(fq!=1d){K Ql=J.H3(fq,1i);8C=8C.4e(Ql)}1b 8C};J.ur=1a(e){K $1g=$(e.7a);K aR=$1g.1h("gm");if(!1B(aR)){J.3r.1R(QB.1e.95.2l.w1,aR)}1b 1k};J.Qt=1a(e2){K me=J;K $3r=$("#qb-ui-1Z-aH-1bo-3E");if(e2!=1d&&e2.2Q!=1d){K $1J=me.H3(e2);K $Qn=$("<2C id=\'qb-ui-1Z-8X-gX-3e\'>"+QB.1e.3D.eW.gX+"</2C>");$3r.ew();$3r.2Y($1J);$3r.2B(".8X-3e-3E > .ui-3e-2g").2Y($Qn);$3r.1bs({1J:".3e-5U"});$3r.2B("ul").1n("6U",-1);$3r.2B("a").1n("6U",0)}1b $3r};$.4D(J,{1br:1a(s){s=$.4D({},3i,s);1bq(s)},Ps:1a(aP,Pg,4X){Ps(aP,Pg,4X)},fp:1a(9K,n7,4X){ug(9K,4X);uc(n7,4X)},ug:1a(9K,4X){ug(9K,4X)},uc:1a(n7,4X){uc(n7,4X)},1cz:1a(Pl,4X){ug(Pl*(mT-r7),4X)},1cy:1a(PH,4X){uc(PH*(uw-HA),4X)},HB:1a(r3,r5,4X){j8.HC(r3,4X);j8.HD(r5,4X)},HC:1a(r3,4X){K 9K=uu()+3A[r3<0?"bf":"j3"](r3);K mO=9K/(mT-r7);uD(mO*nm,4X)},HD:1a(r5,4X){K n7=Hz()+3A[r5<0?"bf":"j3"](r5),mO=n7/(uw-HA);tN(mO*Rg,4X)},uD:1a(x,4X){uD(x,4X)},tN:1a(y,4X){tN(y,4X)},4X:1a(aP,6Y,1o,Px){K 1D={};1D[6Y]=1o;aP.4X(1D,{"5C":3i.1cC,"6B":3i.1cu,"et":1k,"qQ":Px})},1cL:1a(){1b uu()},1cO:1a(){1b Hz()},1cG:1a(){1b mT},1cK:1a(){1b uw},1cJ:1a(){1b uu()/(mT-r7)},1c9:1a(){1b Hz()/(uw-HA)},1c8:1a(){1b 1c7},1c6:1a(){1b 1c5},1cl:1a(){1b jr},1cq:1a(4X){tN(Rg,4X)},1cp:$.tM,6F:1a(){6F()}});1b J};QB.1e.jd=1a(){J.1g=1d;J.h5=1k;J.Hn=1a(qo){if(qo==1d||qo.1f<=0){1b 1d}K Hx=0;K $1g=$("<ul />");1p(K i=0;i<qo.1f;i++){K 1u=qo[i];if(!1u.8q){ap}Hx++;K $li=$("<li />");$li.1h("HH",1u.3v);$li.1h("gm",1u.gm);$li.3J(\'<2u 2t="\'+1u.6N+(1u.eG?" 8S":"")+\'">\'+1u.51+"</2u>");$li.2Y(J.Hn(1u.2Q));$1g.2Y($li)}if(Hx>0){1b $1g}1b 1d};J.EB=1a(e2){K me=J;K 3r=$("#qb-ui-3I-Ho");if(e2!=1d&&e2.2Q!=1d){3r.3J("");3r.2Y(me.Hn([e2]));K 1g=$("#qb-ui-3I-Ho>ul");J.1g=1g.lu({});1g.2B("*").u6();$("#qb-ui-3I-Ho 2u").3F(1a(){K $1g=1d;K aR=1d;if(J.lr!=1d){$1g=$(J.lr);aR=$1g.1h("gm")}if(!1B(aR)){me.1g.1R(QB.1e.jd.2l.w5,aR)}1b 1k})}1b 3r};J.q7=1a(){K me=J;$(".4Y",J.1g).3F(1a(e){})};$("#qb-ui-1Z-aH-gX-3e").d1({dM:{Rs:"ui-3V-qf-1-s"}});1b J.1g};QB.1e.jd.2l={w5:"w5"};QB.1e.95.2l={w1:"w1",w2:"w2"};K kd=1d;QB.1e.7N={4C:1d,5O:[],1v:{1cm:"<3d 2t=\'qb-ui-1H-eK-2g-qc-1x\'>{qc}</3d>.<3d 2t=\'qb-ui-1H-eK-2g-1H-1x\'>{1x}</3d>",vh:1l,gd:1k,Ro:"",7j:1l,3C:1d,1w:"6h",1m:"6h",cE:5,fe:90,9s:1k,a9:1k,6v:1l,lT:1k,2R:{my:"2f 1M",at:"2f+15 1M+15",of:"#qb-ui-1Z",jB:"3q",1c2:1a(3u){K Hl=$(J).2U(3u).2v().1M;if(Hl<0){$(J).2U("1M",3u.1M-Hl)}}},5f:1l,5p:1d,tF:1l,5c:"",4u:9m,9C:150,7r:tE},1cH:{Wk:"3a.7j",5T:"5T.7j",Wq:"6x.7j",9s:"9s.5f",cE:"cE.5f",a9:"a9.5f",fe:"fe.5f",Xh:"3a.5f",62:"5T.5f",Xi:"6x.5f"},7K:1d,b0:1d,Rr:"qb-ui-1H "+"ui-8z "+"ui-8z-dm "+"ui-bd-73 ",cY:1k,ag:".ag:6v",Rp:".ag:6v:4A",QC:".ag:6v:7Y",hv:1a(42){K me=J;if(me.4C!=1d&&me.4C.6y){1b 1k}3P(42){1q"eL":me.Gv(1l);1s;1q"1cQ":me.Gv(1k);1s;1q"4q":me.6n();1s;1q"1cx":me.Wv();1s;1q"fm":K 3T=me.rP(me);if(3T!=1d){3T.3T("7F")}1s}},eI:1a(){K me=J;K 6A=".eK-3e.3e-2k";$.2P("6F",6A);K 1J={};K eA=1d;1p(K i=0;i<me.4C.sC.1f;i++){K gc=me.4C.sC[i];if(eA==1d){eA=gc.qt}if(eA!=gc.qt){1J["6f-"+i]="---------";eA=gc.qt}1J[gc.51]={1x:gc.51,3V:"1ct-1A-eA-"+gc.qt,1h:gc,da:gc.tG?"ks":""}}$.2P({4s:6A,4u:aQ,7n:{5C:0},1X:1a(42,1v){K zg=1v.$1Y.1h().2P.1J[42];me.1g.1R(QB.1e.7N.2l.qn,zg.1h)},1J:1J});1b 6A},QF:1a(3e){K me=J;K 6A=".eK-3e.3e-2k";if(me.4C==1d){1b}3e.7T(1a(){me.eI();$(6A).2P();K $1V=$(6A).2P("1g");if($1V){$1V.2R({my:"2f 1M",at:"2f 4O",of:J})}})},ov:1a(7R){K me=J;J.4C=me.1v.1A;J.gS=1k;if(!J.5O){J.5O=[]}K 69=J.4C;if(J.4C!=1d&&!1B(J.4C.6C)){J.6C=J.4C.6C}1j{J.6C=IK()}69.6C=J.6C;$(me.1g).1h("4C",69);$(me.1g).1h("me",J);K tJ=0;6E{tJ=6o(me.1g.2U("z-1W"));if(tJ>0){me.1v.4u=tJ}}6G(e){}me.1g.2r(J.Rr+me.1v.Ro).2U({2R:"7U",4u:me.1v.4u});me.1g.1n("6U",0);if(!7R){me.1g.3k(1a(e){me.cY=1k})}1a gZ(3k){K 1O=1d;if(3k.4J("qb-ui-1H")){1O=3k}1j{1O=3k.3B()}4x(1l){if(1O.1f==0){1s}if(1O.is(me.ag)){1b 1O}K a7=1O.2B(me.Rp);if(a7.1f){1b a7}1O=1O.3B()}K 1P=3k.1P();if(1P.4J("qb-ui-1H")){1b $()}1b gZ(1P)}1a gY(3k){K 1O=1d;if(3k.4J("qb-ui-1H")){1O=3k}1j{1O=3k.3W()}4x(1l){if(1O.1f==0){1s}if(1O.is(me.ag)){1b 1O}K a7=1O.2B(me.QC);if(a7.1f){1b a7}1O=1O.3W()}K 1P=3k.1P();if(1P.4J("qb-ui-1H")){1b $()}1b gY(1P)}if(!7R){me.1g.8h(1a(e){3P(e.3Z){1q 13:if(me.cY){1b}me.cY=1l;gZ(me.1g).3k();e.4H();1s;1q 9:if(!me.cY){1b}K 3k=me.1g.2B(":3k");if(!3k.1f){3k=me.1g}K 1g=1d;if(e.pB){1g=gY(3k)}1j{1g=gZ(3k)}if(1g.1f){1g.3k();e.4H();1b 1k}1j{me.cY=1k}}})}J.5Z=me.1g;if(me.1v.9R){me.1v.2R.at="2f+"+me.1v.9R[0]+" 1M+"+me.1v.9R[1];me.2R.2v=me.1v.2R.2v;me.rW(me.1v.9R);me.1v.9R=1d}if(J.lW==1d){J.lW=$(\'<2u 2t="qb-ui-1H-eK-2g"></2u>\')}K 5c=J.WS();4v.Hw(me.1g,QB.1e.1U.3U.4g.kv+" "+5c);J.lW.1n("5c",J.4C.51);J.lW.3J(5c);if(J.dz==1d){J.u1=[];if(!1B(J.4C)&&!1B(J.4C.Hr)){J.u1=J.p9("8X","ui-3V-8X-u3").1n("6p-3H","").1n("6p-3H","1cD to 8X");J.u1.3F(1a(1N){me.1g.1R(QB.1e.7N.2l.qd,me.4C.Hr);1b 1k})}J.sd=J.p9("2k","ui-3V-2k-u3").1n("6p-3H","").1n("6p-3H","1bv kN");J.Gj=J.p9("fm","ui-3V-fm-u3").1n("6p-3H",QB.1e.1U.3U.4g.kS);J.Gi=J.p9("6n","ui-3V-6n-u3").1n("6p-3H","").1n("6p-3H","Ht");J.dz=$(\'<2C 2t="qb-ui-1H-eK ui-8z-7O ui-bd-73 ui-45-1by 7p-1H"></2C>\').2Y(J.lW).2Y(J.u1).2Y(J.sd).2Y(J.Gj).2Y(J.Gi).2S("u4",1a(){me.QT()});J.dz.4n(me.1g).2r("qb-ui-1H-28-5c");J.dz.1h("aZ",1k);J.Gi.3F(1a(1N){me.6n(1N);1b 1k});J.Gj.3F(1a(1N){if(me.4C!=1d&&me.4C.6y){1b 1k}K 3T=me.rP(me);if(3T!=1d){3T.3T("7F")}1b 1k});J.QF(J.sd)}if(J.4C!=1d&&J.4C.6y){J.dz.2B(".3e-fm").3C();J.dz.2B(".3e-2k").3C()}1j{J.dz.2B(".3e-fm").5p();J.dz.2B(".3e-2k").5p()}if(!QB.1e.3D.vZ&&(69!=1d&&(69.sC!=1d&&69.sC.1f>0))){J.sd.5p()}1j{J.sd.3C()}K sl=1l;if(7R){if(69&&69.5A){if(J.5O.1f==69.5A.1f+1){6E{if(J.5O.1f>1&&69.5A.1f>1){K hU=J.5O[1].1A;K hW=69.5A[1];sl=hU.3v!=hW.3v}}6G(e){sl=1l}}1j{sl=1l}}}if(sl){if(me.b0!=1d){me.b0.3M()}me.b0=$(\'<2C 2t="qb-ui-1H-28-3E ui-3T-dm ui-8z-dm"></2C>\').9y(1a(){QB.1e.2i.jw()}).1n("6U",-1);me.7K=me.b0;me.rU=$(\'<1H zL="0" zI="0"></1H>\').4n(me.b0);if(!me.1v.lT&&(me.4C.6y&&(69==1d||69!=1d&&(69.5A==1d||69.5A!=1d&&69.5A.1f==0)))){J.W6(me.rU)}1j{if(69&&69.5A){J.Wg(69,me.rU)}}me.b0.4n(me.1g);me.b0.og()}if(J.4C.6y){me.b0.2r("tZ")}1j{me.b0.3K("tZ")}me.la=me.1g[0].fS-me.7K[0].fS;me.1v.cE=3A.4o(me.1v.cE,me.la);me.1v.9s=1k;$(".qb-ui-1H-28:Qs",me.rU).2r("Qs");me.1v.7j&&($.fn.7j&&J.Iy());me.1v.5f&&($.fn.5f&&J.Iw());if(!7R){J.q5=1k}me.1v.gd&&($.fn.gd&&me.7K.gd());me.1v.gd&&($.fn.gd&&me.1g.gd());me.QQ();me.1v.9s=1k;me.1v.vh&&J.7F();J.iW=1S.iS.aU;me.1g.1h("Qv",me);me.1g.1h("1A",69);me.1g.1h("hm",69.3v);me.1g.2B("*").u6();me.1g.7T(1a(1N){me.Gx(1k,1N)});J.QT=1a(){if(me.1g.1h("aZ")){me.1g.1h("aZ",1k);me.aZ=1k;me.2T("1w",J.QX)}1j{me.1g.1h("aZ",1l);me.aZ=1l;J.QX=J.2T("1w");me.2T("1w",J.dz.aE("7g"))}QB.1e.2i.e0();1b 1k};K 5O=$(".qb-ui-1H-28",me.1g).43(":6j(.qb-ui-1H-28-k3)");if(!QB.1e.2i.tV&&!QB.1e.2i.sZ){5O.7j({sS:10,9y:1k,45:1a(1N){K 3g=1N.3g;K tr=1d;if(3g.6L.9i()=="TR"){tr=$(3g).6z()}1j{K 1P=3g;do{if(1P.6L.9i()=="TR"){1s}1P=1P.3l}4x(1P!=1d);if(1P){tr=$(1P).6z()}}K 45=$(\'<1H 2t="qb-ui-1H ui-8z ui-8z-dm qb-ui-7j-45-28" zI="0" zL="0"></1H>\').2Y(tr);kd=45;1b 45},4n:"#qb-ui-1Z",2X:0.8,3a:1a(1N,ui){QB.1e.3D.Ew();me.1g.1h("Gr",1l);K 45=$(ui.45);K sI=$(J);ui.45.1m($(J).1m());QB.1e.2i.7y.3M(mS);mS=1T QB.1e.2i.cU({5r:{28:{1g:sI},1H:me},5y:{28:{1g:45}}});QB.1e.2i.7y.1G(mS);me.gS=1k},6x:1a(1N,ui){QB.1e.2i.7y.3M(mS);QB.1e.2i.e0();me.1g.1h("Gr",1k);kd=1d},5T:1a(1N,ui){QB.1e.2i.jw()}}).8O({Is:".qb-ui-1H-28",zA:"qb-ui-1H-28-ks",f9:"Gk",2E:1a(1N,ui){QB.1e.3D.RE(J)},fl:1a(1N,ui){if(me.4C.6y){$(ui.45).2r("tZ")}1j{$(ui.45).3K("tZ")}QB.1e.3D.RB(J)},In:1a(1N,ui){if(me.4C.6y){1b 1k}if(!Vj(1N.3g,$("#qb-ui-1Z").4w(0))){1b 1k}K 1M=QB.1e.3D.RI();if(1M.1f&&1M[0]!=J){1b}QB.1e.3D.Ew();K hU=$(ui.7j);K hW=$(J);K Gp="";if(hU.1h("1A")&&hU.1h("1A").7i){Gp=hU.1h("1A").7i}K Gq="";if(hW.1h("1A")&&hW.1h("1A").7i){Gq=hW.1h("1A").7i}K 2k=QB.1e.2i.7y.rw({6y:1l,5r:{eo:hU.1h("uU"),aA:hU.1h("hm"),vn:Gp},5y:{eo:hW.1h("uU"),aA:hW.1h("hm"),vn:Gq}});QB.1e.2i.e0();K 1Q=2k.1Q();me.1g.1R(QB.1e.7N.2l.qm,1Q);me.1g.1h("Gr",1k);me.gS=1k}})}},rP:1a(2W){K dV="#1H-fm-3T";if(1B(QB.1e.3D.h0[dV])){K $k6=$(dV);if($k6.1f){K 92={};92[" OK "]=1a(){K 4C=$(J).1h("4C");4C.9e=$("2a[1x=1A-aC]",$(J)).ck();4C.5g=$("2a[1x=1A-1x]",$(J)).ck();$(J).3T("6n");QB.1e.2o.QM(4C);QB.1e.2o.6g()};92[QB.1e.1U.3U.QK.gb]=1a(){$(J).3T("6n")};QB.1e.3D.h0[dV]=$k6.3T({5f:1k,4u:Gd,a9:G3,vh:1k,1m:rD,G4:1l,7F:1a(e,ui){K 4C=$(J).1h("4C");$("2a[1x=1A-1x]",$(J)).2b(4C.5g);$("2a[1x=1A-1x]").1n("EG",4C.QN);$("2a[1x=1A-aC]",$(J)).2b(4C.9e)},92:92})}}if(!1B(QB.1e.3D.h0[dV])){QB.1e.3D.h0[dV].1h("4C",2W.4C)}1b QB.1e.3D.h0[dV]},QQ:1a(){K 1bK=12;if(J.1v.lT){J.1g.1w("6h");K 9s=J.1v.9C;if(!9B(9s)){9s+="px"}K a9=J.1v.7r;if(!9B(a9)){a9+="px"}J.1g.2U({"4o-1w":9s,"4o-1m":a9});J.1g.1m(J.1v.7r);J.7K.1w("6h");J.7K.1m("6h");1b}K WN=J.1g.aE("1w");if(WN>J.1v.9C){J.1v.1w=J.1v.9C}K WB=J.1g.aE("1m");if(WB>J.1v.7r){J.1v.1m=J.1v.7r}K X2=40;J.1g.1w("6h");J.7K.1w("6h");K dm=J.rU;K G2=J.1g;K 5c=J.dz;K WF=J.lW;K Gc=dm.hR("7g");K X4=G2.hR("7g");K WZ=5c.hR("7g");K vI=dm.aE("1m");K X1=G2.aE("8b");K Gb=5c.aE("8b");K 1dY=WF.aE("1m");if(Gc==0&&vI==0){1b}K f6=vI>X1-Gb;K 1m=3A.4o(Gb,vI);if(!1B(J.1v.7r)&&J.1v.7r!="6h"){1m=J.1v.7r}K X3=Gc+WZ;K 1w=3A.6e(X4,J.1v.9C);if(1m>X2){J.1v.1m=6o(1m)}if(1w>0){J.1v.1w=1w;J.1v.9s=X3}J.rE()},WS:1a(){if(!1B(J.4C.51)){1b J.4C.51.3t(/ /g,"&2q;").3t(/</g,"&lt;").3t(/>/g,"&gt;")}1j{1b""}},Wg:1a(69,b0){K me=J;K 1v=69.G8;if(1B(1v)){1v={}}K 5O=[];if(!1v.G9){K k3=1T QB.1e.1U.wh;k3.7i="*";k3.vB="*";k3.dA=69.J7;5O.1G(k3)}K o9=1v.GJ?"W5":"";3P(1v.gJ){1q QB.1e.2N.GK.3N:69.5A.vz(o9,"7i");1s;1q QB.1e.2N.GK.fh:69.5A.vz(o9,1v.o8.ve?"GL":"GG");1s}me.5O=[];5O=5O.4e(69.5A);$.2p(5O,1a(1r,28){K f=1T QB.1e.GH(28,69,me,1v);me.5O.1G(f);b0.2Y(f.1g)})},W6:1a(b0){K me=J;K f=$(\'<tr 2t="qb-ui-1H-28" ><td W3=""><2u 2t="dQ">&2q;</2u><2u 2t="qb-ui-1H-28-1x">\'+QB.1e.1U.3U.4g.pY+"</2u></td></tr>");b0.2Y(f)},p9:1a(bB,uW){K 3b="";3P(bB){1q"6n":3b=QB.1e.3D.eW.TG;1s;1q"fm":3b=QB.1e.3D.eW.Sj;1s;1q"8X":3b=QB.1e.3D.eW.SU;1s;1q"2k":3b=QB.1e.3D.eW.Q0;1s}1b $(\'<a 5B="#">\'+3b+"</a>").2r("ui-bd-73 eK-3e 3e-"+bB+" ag").7u(1a(){$(J).2r("ui-4P-7u")},1a(){$(J).3K("ui-4P-7u")}).7T(1a(ev){ev.6X()}).2Y($("<2u/>").2r("ui-3V "+uW)).1n("6U",-1)},1dJ:1a(){if(!J.GI){J.GI=$("#qb-ui-4k")}1b J.GI},7t:1a(){1b{x:J.2v().2f,y:J.2v().1M,1m:J.1m(),1w:J.1w()}},7R:1a(1h){if(!1B(kd)){kd.1R("7k")}K me=J;K 1y=1h.1A;me.1g.1h("hm",1y.3v);$(".qb-ui-1H-28",me.1g).2p(1a(){K 28=$(J);28.1h("uU",1y.3v);K 8f=1d;$.2p(1y.5A,1a(1r,GM){if(dU(GM.7i,28.1h("1A").7i)){8f=GM.3v;1b 1k}});28.1h("hm",8f)});J.1g.1R(QB.1e.7N.2l.IR)},W8:1a(1v){if(!1B(kd)){kd.1R("7k")}J.1v=$.4D(J.1v,1v);K 1dK=J.1g.aE("1m");K 1dE=J.1g.1w();K h=J.1v.1w;K w=J.1v.1m;K Wu=J.5O.1f;K GS=0;if(1v!=1d&&(1v.1A!=1d&&1v.1A.5A!=1d)){GS=1v.1A.5A.1f+1}K GP=GS!=Wu;if(GP){J.1v.1w="6h";J.1v.1m="6h"}1j{J.1v.1w=h;J.1v.1m=w}K 9y=J.7K.4Q();J.ov(1l);if(GP){J.1v.1w="6h";J.1v.1m="6h"}1j{J.1v.1w=h;J.1v.1m=w}J.rE();J.7K.4Q(9y)},6F:1a(Xk){K me=J;if(!Xk){J.1g.1R(QB.1e.7N.2l.t7)}me.1g.3J("").3C().8W(".6r").pE("6r").4n("3G").5w().3M()},6n:1a(1N,lk){K me=J;if(!lk){me.1g.1R(QB.1e.7N.2l.tv)}if(1k===me.9q("UH",1N)){1b}me.1g.8W("iZ.qb-ui-1H");me.1g.3C()&&me.9q("6n",1N);me.q5=1k;me.6F()},Wv:1a(1N,lk){K me=J;if(!lk){me.1g.1R(QB.1e.7N.2l.tu)}J.6n(1N,1l)},ls:1a(){1b J.q5},Gx:1a(bD,1N){K me=J;K 4u=6o(me.1g.2U("z-1W"));4u=3A.4o(J.1v.4u,4u);if(bD){$.ui.6r.f3++}if(4u<aQ&&4u>$.ui.6r.f3){$.ui.6r.f3=4u}1j{if(4u<$.ui.6r.f3){$.ui.6r.f3++;4u=$.ui.6r.f3}}if($.ui.6r.f3>aQ){$.ui.6r.f3=aQ}K Ww={4Q:me.1g.1n("4Q"),54:me.1g.1n("54")};me.1g.2U("z-1W",4u).1n(Ww);J.9q("3k",1N)},uM:1a(5O){J.1g.1R(QB.1e.7N.2l.ri,{1H:J.1Q(),5O:5O})},Gv:1a(4r){K me=J;K 5O=J.5O;K fO=[];$.2p(5O,1a(){K 28=J;if(28.1A.7i!="*"&&J.4r!=4r){28.eL(4r);fO.1G(28)}});me.uM(fO)},lQ:1a(6m,4r,y5){K me=J;K 5O=J.5O;K Gw=[];$.2p(5O,1a(1W){K 28=J;if(28.1A.7i==6m||28.1A.fU==6m){$(".qb-ui-1H-28-2y 2a",28.1g).2p(1a(){if(28.4r!=4r){28.eL(4r);Gw.1G(28)}})}});if(y5){me.uM(Gw)}},7F:1a(){if(J.q5){1b}K 1v=J.1v;J.rE();J.rW(1v.2R);J.Gx(1l);J.9q("7F");J.q5=1l},Iy:1a(){K me=J;K 3m=$(2K),GC;1a hF(ui){1b{2R:ui.2R,2v:ui.2v}}me.5Z.7j({1d6:1k,Hv:1k,nW:".ui-3T-dm, .ui-3T-eK-6n",5t:".qb-ui-1H-eK",9A:"1P",9y:1l,3a:1a(1N,ui){K c=$(J);GC=me.1v.1w==="6h"?"6h":c.1w();c.1w(c.1w()).2r("ui-3T-Wp");if($.ui.gk.6t!=1d&&($.ui.gk.6t.9A!=1d&&$.ui.gk.6t.9A.1f>3)){$.ui.gk.6t.9A[2]=uY;$.ui.gk.6t.9A[3]=uY}me.J3();me.9q("Wk",1N,hF(ui))},5T:1a(1N,ui){QB.1e.2i.jw();me.9q("5T",1N,hF(ui))},6x:1a(1N,ui){QB.1e.2i.62();QB.1e.2i.e0();me.1v.2R.at="2f+"+(ui.2R.2f-3m.54())+" 1M+"+(ui.2R.1M-3m.4Q());$(J).3K("ui-3T-Wp").1w(GC);me.1g.1R(QB.1e.7N.2l.IT,me);QB.1e.2o.6g();me.J5();me.9q("Wq",1N,hF(ui))}})},1e8:1a(){K ce,co,fl,o=J.1v;if(o.9A==="1P"){o.9A=J.45[0].3l}if(o.9A==="2K"||o.9A==="3z"){J.9A=[0-J.2v.pw.2f-J.2v.1P.2f,0-J.2v.pw.1M-J.2v.1P.1M,$(o.9A==="2K"?2K:3z).1m()-J.Wo.1m-J.uZ.2f,($(o.9A==="2K"?2K:3z).1w()||2K.3G.3l.fS)-J.Wo.1w-J.uZ.1M]}if(!/^(2K|3z|1P)$/.9z(o.9A)){ce=$(o.9A)[0];co=$(o.9A).2v();fl=$(ce).2U("er")!=="6d";J.9A=[co.2f+(6u($(ce).2U("Gz"),10)||0)+(6u($(ce).2U("1bJ"),10)||0)-J.uZ.2f,co.1M+(6u($(ce).2U("GB"),10)||0)+(6u($(ce).2U("1bi"),10)||0)-J.uZ.1M,uY,uY]}},Iw:1a(fV){fV=fV===2x?J.1v.5f:fV;K me=J,1v=me.1v,2R=me.5Z.2U("2R"),Xa=2A fV==="4E"?fV:"se";1a hF(ui){1b{Xs:ui.Xs,jD:ui.jD,2R:ui.2R,4l:ui.4l}}me.5Z.5f({nW:".ui-3T-dm",9A:"2K",1bA:me.7K,fe:1v.fe,fV:Xa,3a:1a(1N,ui){$(J).2r("ui-3T-Xe");me.J3();me.9q("Xh",1N,hF(ui))},62:1a(1N,ui){me.9q("62",1N,hF(ui));QB.1e.2i.n9();QB.1e.2i.jw()},6x:1a(1N,ui){K 2v=me.5Z.2v(),2f=2v.2f-me.2K.54(),1M=2v.1M-me.2K.4Q();1v.1w=me.5Z.1w();1v.1m=me.5Z.1m();1v.2R={my:"2f 1M",at:"2f"+(2f>=0?"+":"")+2f+" "+"1M"+(1M>=0?"+":"")+1M,of:me.3z};$(J).3K("ui-3T-Xe");me.J5();me.9q("Xi",1N,hF(ui));QB.1e.2o.6g()}}).2U("2R",2R).2B(".ui-5f-se").2r("ui-3V ui-3V-1bz-1cB-se")},1cs:1a(){K 1v=J.1v;K 1w=J.la;if(1v.1w==="6h"){if(!9B(1v.cE)){1w=3A.4o(1w,1v.cE)}}1j{K h=0;if(!9B(1v.cE)){h=1v.cE}if(!9B(1v.1w)){1w=3A.6e(h,1v.1w)}1w=3A.4o(1w,h)}1b 1w},2R:1a(3u){J.rW(3u)},rW:1a(3u){if(!J.1v.6v){1b}K g1=[],2v=[0,0];K IQ=1k;if(3u){if(2A 3u==="4E"||2A 3u==="1A"&&"0"in 3u){g1=3u.3S?3u.3S(" "):[3u[0],3u[1]];if(g1.1f===1){g1[1]=g1[0]}$.2p(["2f","1M"],1a(i,UC){if(+g1[i]===g1[i]){2v[i]=g1[i];g1[i]=UC;IQ=1l}});3u={my:"2f 1M",of:"#qb-ui-1Z",at:"2f+"+2v[0]+" 1M+"+2v[1],jB:"3q"}}3u=$.4D({},J.1v.2R,3u)}1j{3u=J.1v.2R}K 2f=0;K 1M=0;6E{if(IQ){2f=2v[0];1M=2v[1]}1j{2f=3u.at.3x(/2f([+-]*\\d+)/)[1]*1;1M=3u.at.3x(/1M([+-]*\\d+)/)[1]*1}}6G(e){}J.1v.2R=3u;if(J.1v.6v&&(J.1v.2R.of==1d||$(J.1v.2R.of).1f>0)){J.5Z.5p();3u.of="#qb-ui-1Z";3u.jB="3q";J.1g.2U({1M:1M,2f:2f})}},s4:1a(1r,1o){K me=J,5Z=me.5Z,hE=5Z.is(":1h(ui-5f)"),62=1k;3P(1r){1q"UH":1r="1cv";1s;1q"92":me.1cE(1o);62=1l;1s;1q"1cP":me.1cF.2g(""+1o);1s;1q"Uv":5Z.3K(me.1v.Uv).2r(1cd+1o);1s;1q"2O":if(1o){5Z.2r("ui-3T-2O")}1j{5Z.3K("ui-3T-2O")}1s;1q"7j":if(1o){me.Iy()}1j{5Z.7j("6F")}1s;1q"1w":62=1l;1s;1q"9s":if(hE){5Z.5f("2T","9s",1o)}62=1l;1s;1q"a9":if(hE){5Z.5f("2T","a9",1o)}62=1l;1s;1q"cE":if(hE){5Z.5f("2T","cE",1o)}62=1l;1s;1q"fe":if(hE){5Z.5f("2T","fe",1o)}62=1l;1s;1q"2R":me.rW(1o);1s;1q"5f":if(hE&&!1o){5Z.5f("6F")}if(hE&&2A 1o==="4E"){5Z.5f("2T","fV",1o)}if(!hE&&1o!==1k){me.Iw(1o)}1s;1q"5c":$(".ui-3T-5c",me.1cc).3J(""+(1o||"&#160;"));1s;1q"1m":62=1l;1s}$.HN.3f.s4.3w(me,2F);if(62){me.rE()}},rE:1a(){K o=J.1v;if(o.lT){J.1g.1m(J.1v.7r);1b}K 4Q=J.7K.4Q();if(o.1m==="6h"||o.1m==0){J.7K.1m("6h");J.5Z.2U({1m:"6h"});if(!9B(J.1v.7r)){if(J.1g.aE("1m")>J.1v.7r){J.1g.1m(J.1v.7r);o.1m=J.1v.7r}}}1j{J.5Z.1m(o.1m)}J.5Z.1w("6h");J.7K.1w("6h");K tk=J.dz.aE("7g");K mE=J.5Z.aE("1w");K la=tk;K IB=mE;if(o.1w==="6h"||o.1w==0){J.7K.1w("6h");J.5Z.2U({cE:la,9s:IB,1w:"6h"});if(!9B(J.1v.9C)&&J.1g.aE("1w")>J.1v.9C){J.1g.1w(J.1v.9C);o.1w=J.1v.9C;J.5Z.1w(o.1w);mE=J.5Z.aE("1w");K kQ=mE-tk;J.7K.7g(kQ)}}1j{J.5Z.1w(o.1w);mE=J.5Z.aE("1w");K kQ=mE-tk;J.7K.7g(kQ)}if(J.5Z.is(":1h(ui-5f)")){J.5Z.5f("2T","cE",la);J.5Z.5f("2T","9s",IB)}J.7K.4Q(4Q)},J3:1a(){J.tz=J.2K.2B("e4").bC(1a(){K e4=$(J);1b $("<2C>").2U({2R:"7U",1m:e4.8b(),1w:e4.7g()}).4n(e4.1P()).2v(e4.2v())[0]})},J5:1a(){if(J.tz){J.tz.3M();4q J.tz}},1ce:1a(1N){if($(1N.3g).jK(".ui-3T").1f){1b 1l}1b!!$(1N.3g).jK(".ui-sn").1f},tB:1a(){K me=J;K 1Q=fL({},J.4C);1Q.5A=[];$.2p(me.5O,1a(){K 28=J;if(28.1A.7i=="*"){1Q.J7=28.4r}1j{1Q.5A.1G(28.1A)}});1b 1Q},tA:1a(1Q){J.4C=1Q},1Q:1a(2b){if(2b===2x){1b J.tB()}1j{J.tA(2b)}}};(1a($){$.8z("ui.6r",QB.1e.7N);$.4D($.ui.6r,{6P:"1.8.2",Vk:"2R",1ch:0,f3:0,7t:1a(){K 1Z=$("#qb-ui-1Z");1b{x:J.2v().2f-1Z.2v().2f,y:J.2v().1M-1Z.2v().1M,1m:J.8b(),1w:J.7g()}}})})(2I);QB.1e.7N.2l={ri:"ri",UA:"UA",tv:"tv",tu:"tu",t7:"t7",IT:"IT",IR:"IR",qm:"qm",Ux:"Ux",qn:"qn",qd:"qd"};QB.1e.Uy={};QB.1e.Uy.2l={sz:"sz"};QB.1e.lC=1a(1r,1P){J.3r=1d;J.f8=1d;J.8R=1d;J.5Q=1d;J.5s=1r;J.6V=1P;J.9S=1d;J.1co=1a(4z){J.ij=1l;if(J.5Q){J.5Q.ck(4z)}J.dh()};J.8G=1a(4z){if(J.5Q){J.5Q.ck(4z)}J.1o(4z);J.7R()};J.1o=1a(4z){if(4z===2x){1b J.9S}J.9S=4z};J.aG=1a(){K aG=J.9S;if(!1B(J.9S)){3P(J.5s){1q 1S.2n.3n:aG=qv(J.9S);1s;1q 1S.2n.aC:aG=qv(J.9S);1s;1q 1S.2n.cF:aG=J.9S;1s;1q 1S.2n.9x:aG=1S.8i.s6.dl(J.9S);if(aG=="eV"){aG=""}1s;1q 1S.2n.7G:K 1o=J.6V.88(1S.2n.9x);if(1B(1o)||1o==0){aG=""}1s;1q 1S.2n.dn:aG=1S.8i.yq.dl(J.9S);1s;5N:if(J.5s>=1S.2n.6I){aG=qv(J.9S)}1s}}if(1B(aG)){aG=" "}1b aG};J.3M=1a(){};J.I0=1a(){K gO=1k;K c0=1k;if(J.5s==1S.2n.3n){gO=J.6V.cH&&J.6V.cH.1f>0;c0=(QB.1e.2e.h1&QB.1e.2N.jL.yA)!=0}1j{if(J.5s>=1S.2n.6I){gO=J.6V.cl&&J.6V.cl.1f>0;c0=(QB.1e.2e.h1&QB.1e.2N.jL.yC)!=0}}if(gO||c0){J.8R.2r("UU")}1j{J.8R.3K("UU")}};J.7R=1a(bD){K me=J;if(J.f8!=1d){J.f8[0].qK=J.aG()}if(J.5Q!=1d){if(J.5s==1S.2n.cF){if(!1B(QB.1e.3D.8N)&&!1B(QB.1e.3D.8N.re)){if(J.5Q.5w().1f!=QB.1e.3D.8N.re.1f){J.5Q.5w().3M();K 1Y="";K 2y=[];$.2p(QB.1e.3D.8N.re,1a(1W,2b){1Y="";2y.1G(\'<2T 1o="\'+2b+\'"\'+1Y+">"+(2b==1d?"":2b)+"</2T>");me.5Q.2Y($(\'<2T 1o="\'+2b+\'"\'+1Y+">"+(2b==1d?"":2b)+"</2T>"))})}}}if(bD||(!QB.1e.2e.oy.cW(J.5s)||J.5s>=1S.2n.6I)){J.5Q.ck(J.9S);J.I0()}}};J.Up=1a(){if(J.f8!=1d){J.f8.3C()}if(J.8R!=1d){J.UM();J.8R.5p()}if(J.5Q!=1d){J.5Q.3k()}};J.IJ=1a(){if(J.f8==1d){1b}6E{QB.1e.2e.yi++;J.f8.5p();if(J.8R!=1d){J.8R.3C();J.UJ()}}UV{QB.1e.2e.yi--}};J.I1=1a(bD,4S){if(2A 4S=="2x"){4S=1d}K me=J;if(4S==1d){3P(J.5s){1q 1S.2n.lJ:4S=$("<2C></2C>");4S.jS=1l;4S.2S("3F",1a(e){$(me).1R(QB.1e.lC.2l.y0,{1r:me.5s,4z:1l,6k:1k})});me.3r.2S("8h",1a(e){if(e.3Z==13||e.3Z==32){me.5Q.1R("3F")}});1s;1q 1S.2n.42:4S=$("<2C></2C>");4S.jS=1l;1s;1q 1S.2n.1Y:4S=$(\'<2a 1C="9h" 1o="1l" />\');4S.1n("6U",-1);4S.jS=1l;1s;1q 1S.2n.eN:4S=$(\'<2a 1C="9h" 1o="1l" />\');4S.1n("6U",-1);4S.jS=1l;1s}}if(4S==1d){if(bD){3P(J.5s){1q 1S.2n.3n:4S=$("<2y />");K yL=4S.J1({bA:"4k-3n",1o:me.9S,h8:1a(e){K 3O=e.7s(".ui-qb-4k-1I-3O-bW-5J");if(3O.1f){3O.1h("me").dh()}}});K 8T=yL.IZ()[0];4S=8T.IX();4S.qT=1l;1s;1q 1S.2n.cF:K 2y=["<2y>"];if(!1B(QB.1e.3D.8N)&&!1B(QB.1e.3D.8N.re)){K 1Y="";$.2p(QB.1e.3D.8N.re,1a(1W,2b){1Y=2b==me.9S?\' 1Y="1Y" \':"";2y.1G(\'<2T 1o="\'+2b+\'"\'+1Y+">"+(2b==1d?"":2b)+"</2T>")})}2y.1G("</2y>");4S=$(2y.5x(""));4S.2S("dp 4W",1a(){K 3O=$(J).7s(".ui-qb-4k-1I-3O-bW-5J");if(3O.1f){3O.1h("me").dh()}});1s;1q 1S.2n.9x:K 2y=["<2y>"];if(!QB.1e.2e.yk){1S.8i.s6.2p(1a(1W,2b){2y.1G(\'<2T 1o="\'+1W+\'">\'+(2b==1d?"":2b)+"</2T>")})}1j{2y.1G(\'<2T 1o="0">eV</2T>\');2y.1G(\'<2T 1o="1">yw yF US</2T>\');2y.1G(\'<2T 1o="1">yw yF UT</2T>\');2y.1G(\'<2T 1o="2">IW yF US</2T>\');2y.1G(\'<2T 1o="2">IW yF UT</2T>\')}2y.1G("</2y>");4S=$(2y.5x(""));4S.2S("dp 4W",1a(){K 3O=$(J).7s(".ui-qb-4k-1I-3O-bW-5J");if(3O.1f){3O.1h("me").dh()}});1s;1q 1S.2n.7G:4S=$("<2y />");K yL=4S.J1({bA:"4k-7G",h8:1a(e){K 3O=e.7s(".ui-qb-4k-1I-3O-bW-5J");if(3O.1f){3O.1h("me").dh()}}});K 8T=yL.IZ()[0];4S=8T.IX();4S.qT=1l;1s;1q 1S.2n.dn:K 2y=["<2y>"];1S.8i.yq.2p(1a(1W,2b){2y.1G(\'<2T 1o="\'+1W+\'">\'+(2b==1d?"":2b)+"</2T>")});2y.1G("</2y>");4S=$(2y.5x(""));4S.2S("dp 4W",1a(){K 3O=$(J).7s(".ui-qb-4k-1I-3O-bW-5J");if(3O.1f){3O.1h("me").dh()}});1s}}1j{4S=$("<2C></2C>")}}if(4S==1d){4S=$(\'<2a 1C="2g" 1o="" />\');4S.4K("8h",me.UZ,me)}4S.2r("ui-qb-4k-1I-3O-bW-3r");4S.1cb(1a(e){me.3r.3K("ui-HU-3k")});4S.1n("6p-3H",QB.1e.2e.9v[J.5s]);if(!4S.qT){if(4S.jS){4S.dp(1a(){me.dh()});4S.qT=1l}1j{K 4U="4W";if(4S[0].6L.49()=="2y"){4U+=" dp"}4S.2S(4U,1a(){K 3O=$(J).7s(".ui-qb-4k-1I-3O-bW-5J");if(3O.1f){3O.1h("me").dh()}});4S.qT=1l}}1b 4S};J.UZ=1a(e){if(e.3Z==13){e.6X();J.dh();1b 1k}};J.UN=1a(){J.$IY=$(\'<3e 2t="UW">\');J.$IY.d1({dM:{r9:"ui-3V-SV"},2g:1k}).1h("me",J).7T(1a(1N){K me=1d;K 3O=$(J).7s(".ui-qb-4k-1I-3O-bW-5J");if(3O.1f){me=3O.1h("me")}1j{1b}K gO=1k;K c0=1k;K 7x=[];if(me.5s==1S.2n.3n){7x=me.6V.cH;gO=7x&&7x.1f>0;c0=(QB.1e.2e.h1&QB.1e.2N.jL.yA)!=0}1j{if(me.5s>=1S.2n.6I){7x=me.6V.cl;gO=7x&&7x.1f>0;c0=(QB.1e.2e.h1&QB.1e.2N.jL.yC)!=0}}if(c0&&!gO){$(me.6V).1R(QB.1e.ht.2l.gK,{5q:me.5s,1o:me.9S,1Q:me.6V.1Q(),3O:me})}1j{if(1k&&(!c0&&(gO&&7x.1f==1))){QB.1e.3D.gT(1d,7x[0].zk)}1j{QB.1e.2e.gQ.2P()}}1N.4H();1b 1k}).3F(1a(1N){1N.4H();1b 1k});$.2P({4s:".UW",4u:aQ,7n:{5C:0},nH:1k,9F:1a($1R,e){K me=1d;K 3O=$1R.7s(".ui-qb-4k-1I-3O-bW-5J");if(3O.1f){me=3O.1h("me")}QB.1e.2e.gQ.1h("me",me);if(2A me=="2x"||me==1d){1b{1J:{}}}K hu={};K c0=1k;K 7x=[];K 8U="";if(me.5s==1S.2n.3n){7x=me.6V.cH;c0=(QB.1e.2e.h1&QB.1e.2N.jL.yA)!=0;8U=QB.1e.1U.3U.4g.UX}1j{if(me.5s>=1S.2n.6I){7x=me.6V.cl;c0=(QB.1e.2e.h1&QB.1e.2N.jL.yC)!=0;8U=QB.1e.1U.3U.4g.UL}}K 1i=1d;if(c0){1i={1x:8U,3V:"bW",1h:1d,1r:"bW"};hu[1i.1r]=1i}if(7x&&7x.1f){1p(K i=0;i<7x.1f;i++){K nK=7x[i];1i={1x:QB.1e.1U.3U.4g.HZ+\' "\'+nK.51+\'"\',3V:"kg-8X",1h:nK.zk,1r:"kg-8X-"+i};hu[1i.1r]=1i}}1b{1J:hu}},1X:1a(42,1v){K me=$(J).1h("me");if(42.5e("kg-8X")==0){QB.1e.2o.3s.ek=1v.1J[42].1h;if(!me.dh()){QB.1e.3D.gT(1d,1v.1J[42].1h)}}1j{if(42=="bW"){$(me.6V).1R(QB.1e.ht.2l.gK,{5q:me.5s,1o:me.9S,1Q:me.6V.1Q(),3O:me})}}},1J:{}});1b J.$IY};J.UM=1a(){if(J.5s==1S.2n.3n||J.5s>=1S.2n.6I){QB.1e.2e.gQ.yW().yM(J.8R)}if(!QB.1e.2e.oy.cW(J.5s)){1b 1k}J.7R(1l);J.l6.3J("");6E{J.5Q.1h("me",J);if(1B(J.5Q.1h("me"))){}J.5Q.yW().4n(J.l6);J.5Q.1h("yZ",1k)}6G(e){}};J.UJ=1a(){if(J.5s==1S.2n.3n||J.5s>=1S.2n.6I){if(QB.1e.2e.gQ.1P()!=QB.1e.2e.ne){QB.1e.2e.gQ.yW().4n(QB.1e.2e.ne)}}if(!QB.1e.2e.oy.cW(J.5s)){1b 1k}if(!J.5Q.1h("yZ")){6E{J.5Q.yW().4n(QB.1e.2e.ne);J.5Q.1h("yZ",1l)}6G(e){}}J.l6.3J("");1b 1l};J.I7=1a(){K me=J;if(J.8R==1d){J.8R=$(\'<2C 2t="ui-qb-4k-1I-3O-bW-5J"></2C>\');J.8R.4n(J.3r)}if(J.5s==1S.2n.3n||J.5s>=1S.2n.6I){if(QB.1e.2e.gQ==1d){QB.1e.2e.gQ=J.UN();QB.1e.2e.gQ.4n(QB.1e.2e.ne)}K $2u=$(\'<2u 2t="1bT"></2u>\');J.8R.2Y($2u);J.l6=$2u;J.I0()}1j{J.l6=J.8R}if(QB.1e.2e.oy.cW(J.5s)){if(1B(QB.1e.2e.yh[J.5s])){J.5Q=J.I1(1l);QB.1e.2e.yh[J.5s]=J.5Q;J.5Q.4n(QB.1e.2e.ne);J.5Q.1h("yZ",1l)}1j{J.5Q=QB.1e.2e.yh[J.5s]}}1j{K HX=1d;if(J.6V.6V.It!=1d){HX=J.6V.6V.It(J.5s,J,J.6V)}J.5Q=J.I1(1l,HX);J.l6.2Y(J.5Q)}if(!J.5Q.jS){J.8R.3C()}J.8R.1h("me",J)};J.IF=1a(){if(J.8R!=1d){J.8R.5w().3M();J.8R.3M();J.8R=1d}J.I7()};J.Uj=1a(){K me=J;3P(J.5s){1q 1S.2n.lJ:;1q 1S.2n.42:;1q 1S.2n.1Y:;1q 1S.2n.eN:1b 1d}K $I3=$("<2C></2C>").2r("ui-qb-4k-1I-3O-qA-5J").2r("ui-qb-4k-1I-3O-qA-3r");$I3.3F(1a(e){if(jX){1b}if(FI&&me.5s==1S.2n.aC){QB.1e.3D.EZ("1bQ Ur is ip 1bX of ip PA 6P. Uc Un 4w 1dV of 1dU qV Un be Ul to aV 1dZ Ur in ip 1dN 6P.");1b 1k}me.wx()});1b $I3};J.wx=1a(){if(QB.1e.2e.kf==J){1b}QB.1e.2e.cY=1l;if(QB.1e.2e.kf!=1d){QB.1e.2e.kf.dh()}QB.1e.2e.kf=J;if(J.5s==1S.2n.3n||!J.6V.1B()&&!J.6V.Vx()){J.Up();QB.1e.2e.kf=J}J.3r.2r("ui-HU-3k");if(J.5Q!=1d&&(J.5Q.1f>0&&J.5Q[0].6L.49()=="2a")){J.5Q.Uq(0)}};J.dh=1a(){K bF=1k;K HM=1l;K 6k=J.1o();K 4z=J.5Q.ck();if(!4v.y6(6k,4z)&&!(6k==1d&&(4z==" "||4z==0))){bF=1l;K rR=J.6V.88(1S.2n.9x);3P(J.5s){1q 1S.2n.7G:if(1B(4z)||4z==0){if(!1B(rR)||rR!==0){J.6V.8G(1S.2n.9x,1S.8i.s6.1dS)}}1j{6k=1B(6k)?Uf:6o(6k);4z=6o(4z);if(9B(4z)){4z=0}if(9B(6k)){6k=Uf}4z+=4z<6k?-0.5:+0.5;if(1B(rR)||rR==0){J.6V.8G(1S.2n.9x,1S.8i.s6.yw);J.6V.mF(1S.2n.9x)}HM=1k}1s}J.1o(4z);if(HM){J.6V.mF()}J.IJ();$(J).1R(QB.1e.lC.2l.y0,{1r:J.5s,4z:4z,6k:6k,ij:J.ij});J.ij=1k}1j{J.IJ()}QB.1e.2e.kf=1d;if(!J.5Q.jS){J.3r.3K("ui-HU-3k")}1b bF};J.Ue=1a(1r){K jT="ui-qb-4k-1I-";if(1r>=1S.2n.oO){1b jT+"Dp"}1b jT+1S.2n.dl(1r)};J.gZ=1a(3k){if(!3k.1f){1b $()}K 1O=3k.3B();if(1O.is(":ag")){1b 1O}1O=1O.2B(":ag:4A");if(1O.1f){1b 1O}K 1P=3k.1P();1b J.gZ(1P)};J.gY=1a(3k){if(!3k.1f){1b $()}K 1O=3k.3W();if(1O.is(":ag")){1b 1O}1O=1O.2B(":ag:7Y");if(1O.1f){1b 1O}K 1P=3k.1P();1b J.gY(1P)};J.8Z=1a(1r,1P){K me=J;J.3r=$(\'<td 2t="ui-8z-dm ui-qb-4k-1I-3O \'+J.Ue(J.5s)+\'" />\');J.3r.1n("6U",0);K yd=J.5s;if(yd>1S.2n.6I){yd=1S.2n.6I}J.3r.1n("6p-3H",QB.1e.2e.9v[yd]);J.f8=J.Uj();if(J.f8!=1d){J.f8.4n(J.3r)}J.I7();J.3r.1ed(1a(e){if(QB.1e.2e!=1d&&QB.1e.2e.2O){1b}if(QB.1e.2e.yi>0){1b}if(me.3r[0]!=e.3g){1b}if(FI&&me.5s==1S.2n.aC){1b 1k}me.wx()});J.3r.8h(1a(e){3P(e.3Z){1q 9:if(e.pB){me.gY(me.3r).3k();e.4H()}}})};J.8Z(1r,1P)};QB.1e.lC.2l={y0:"1ee",1e7:"1ef",gK:"gK"};QB.1e.ht=1a(1Q,1P){J.6V=1P;J.1ec=1;J.6q={};J.1da=4v.xW();J.3v=1d;J.3r=1d;J.oc=1k;J.cH=[];J.cl=[];J.6C=IK();J.1d8=1k;J.1B=1a(){1b 1B(J.6q[1S.2n.3n].1o())};J.Vx=1a(){K 2b=J.6q[1S.2n.3n].1o();if(1B(2b)){1b 1k}1b 2b.5e(".*")>=0};J.eL=1a(2b){K kZ=J.6q[1S.2n.1Y].1o();if(2b===2x){1b kZ}1j{if(kZ!=2b){J.6q[1S.2n.1Y].1o(2b);J.Ib(1d,{1r:1S.2n.1Y,4z:2b});1b 1l}}1b 1k};J.88=1a(1r){1b J.6q[1r].1o()};J.WC=1a(){1b!1B(J.88(1S.2n.cF))||!1B(J.88(1S.2n.6I))};J.8G=1a(1r,1o,y5){if(1o===2x){1o=1d}K 4z=1o;K 6k=J.6q[1r].1o();if(4v.y6(4z,6k)){1b 1k}3P(1r){1q 1S.2n.9x:J.8G(1S.2n.7G,1d,y5);1s;1q 1S.2n.7G:if(1B(4z)||4z==0){4z=""}1s;5N:}J.6q[1r].1o(4z);1b 1l};J.Ib=1a(e,1h){K 1r=1h.1r;K 4z=1h.4z;K 6k=1h.6k;$(J).1R(QB.1e.ht.2l.J6,{1r:1r,4z:4z,6k:6k,1I:J,ij:1h.ij});J.mU()};J.mU=1a(){K me=J;K z9=me.1B();1p(K 1r in me.6q){if(1r==1S.2n.3n){ap}K 3O=me.6q[1r];3O.3r.1n("6U",z9?-1:0)}};J.VE=1a(){K me=J;K 3J=$(\'<tr 2t="ui-qb-4k-1I" />\');1S.2n.2p(1a(1r){K 3O=1T QB.1e.lC(1r,me);$(3O).4K(QB.1e.lC.2l.y0,me.Ib,me);3O.3r.4n(3J);me.6q[1r]=3O});J.mU();3J.1h("1A",J);3J.1h("me",J);1b 3J};J.3M=1a(){J.oc=1l;J.3r.5w().3M();J.3r.3M();J.3r.3J("")};J.mF=1a(lo){K me=J;1p(K 1r in me.6q){K 3O=me.6q[1r];if(lo===2x||lo==1r){3O.7R()}}J.mU()};J.V3=1a(lo){K me=J;1p(K 1r in me.6q){K 3O=me.6q[1r];if(lo===2x||lo==1r){3O.IF()}}J.mU()};J.VC=1a(){J.8G(1S.2n.1Y,!J.1B());J.8G(1S.2n.eN,1k);J.8G(1S.2n.dn,1S.8i.yq.oQ)};J.hT=1a(p0,oJ,lv,yp){K a=4v.3Y(J.88(1S.2n.3n)).49();K b=4v.3Y(p0).49();if(1B(a)||1B(b)){yp=1k}if(!yp&&a==b||yp&&(a.5e(b)>=0||b.5e(a)>0)){if(oJ===2x||oJ==4v.3Y(J.88(1S.2n.cF)).49()){if(lv===2x||lv==4v.3Y(J.88(1S.2n.aC)).49()){1b 1l}}}1b 1k};J.Vc=1a(p0,oJ,lv){1b J.hT(p0,oJ,lv,1l)};J.1Q=1a(1o){if(1o===2x){1b J.VD()}1j{1b J.yu(1o)}};J.7R=1a(1Q){K 6i=J.yu(1Q);if(6i){J.mF()}1b 6i};J.yu=1a(1Q){K 6i=1k;if(1B(1Q)){1b 6i}6i=J.8G(1S.2n.3n,1Q.8w)||6i;6i=J.8G(1S.2n.cF,1Q.cw)||6i;6i=J.8G(1S.2n.aC,1Q.9e)||6i;6i=J.8G(1S.2n.eN,1Q.k0)||6i;6i=J.8G(1S.2n.dn,1Q.Ie)||6i;6i=J.8G(1S.2n.9x,1Q.gJ)||6i;6i=J.8G(1S.2n.7G,1Q.m6)||6i;1p(K i=0;i<QB.1e.2e.k9+1;i++){6i=J.8G(1S.2n.6I+i,1Q.6R[i])||6i}if(J.3v!=1Q.3v){J.3v=1Q.3v;6i=1l}if(!1B(1Q.6C)&&J.6C!=1Q.6C){J.6C=1Q.6C;6i=1l}if(!1B(1Q.3v)&&J.6C!=1d){if(!1B(1Q.3v)){J.6C=1d}6i=1l}if(J.oc!=1Q.7Q){J.oc=1Q.7Q;6i=1l}if(J.8j!=1Q.8j){J.8j=1Q.8j;6i=1l}K Ic=-1;K Ia=-1;if(1Q.cH){Ia=1Q.cH.1f}if(J.cH){Ic=J.cH.1f}if(Ic!=Ia){6i=1l}J.cH=1Q.cH;K I8=-1;K I9=-1;if(1Q.cl){I9=1Q.cl.1f}if(J.cl){I8=J.cl.1f}if(I8!=I9){6i=1l}J.cl=1Q.cl;6i=J.8G(1S.2n.1Y,1Q.dG&&!J.1B())||6i;J.mU();1b 6i};J.VD=1a(){K 1Q=1T QB.1e.1U.Dn;1Q.dG=J.88(1S.2n.1Y);1Q.8w=J.88(1S.2n.3n);1Q.cw=J.88(1S.2n.cF);1Q.9e=J.88(1S.2n.aC);1Q.k0=J.88(1S.2n.eN);1Q.Ie=J.88(1S.2n.dn);1Q.gJ=J.88(1S.2n.9x);1Q.m6=J.88(1S.2n.7G);1Q.6R[0]=J.88(1S.2n.6I);1p(K i=0;i<QB.1e.2e.k9;i++){1Q.6R[1+i]=J.88(1S.2n.oO+i)}1Q.3v=J.3v;1Q.7Q=J.oc;1Q.6C=J.6C;1Q.8j=J.3r==1d?0:J.3r.1W();1b 1Q};J.8Z=1a(1Q){J.3r=J.VE();J.3r.og();J.VC();J.yu(1Q);J.mF()};J.8Z(1Q)};QB.1e.ht.2l={J6:"1d7",gK:"gK"};QB.1e.2e={3o:[],k9:2,zB:1k,1dg:1d,oo:1d,cY:1k,mj:0,1dh:[],2O:1k,yi:0,h1:0,wi:1k,yk:1k,IU:1k,yh:[],gQ:1d,It:1d,oy:[1S.2n.3n,1S.2n.9x,1S.2n.7G,1S.2n.cF,1S.2n.dn],gZ:1a(3k){if(!3k.1f){1b $()}K 1O=3k.3B();if(1O.is(":ag")){1b 1O}1O=1O.2B(":ag:4A");if(1O.1f){1b 1O}K 1P=3k.1P();1b J.gZ(1P)},Dl:1a(){J.mj++},D2:1a(){J.mj--;if(J.mj==0){J.hS();J.kc()}},gY:1a(3k){if(!3k.1f){1b $()}K 1O=3k.3W();if(1O.is(":ag")){1b 1O}1O=1O.2B(":ag:7Y");if(1O.1f){1b 1O}K 1P=3k.1P();1b J.gY(1P)},ov:1a(){K me=J;QB.1e.2e.h1=J.1g.1n("h1");QB.1e.2e.yk=J.1g.1n("yk")=="sF";QB.1e.2e.wi=J.1g.1n("wi")=="sF";QB.1e.2e.ne=$(\'<2C 2t="qb-6d"></2C>\').4n(J.1g);K x=J.1g.1n("k9");if(x!=1d&&(x!=""&&!9B(x))){QB.1e.2e.k9=6o(x)}if(J.1g.1n("zB")=="sF"){QB.1e.2e.zB=1l}J.1g.2r("ui-8z").2r("ui-qb-4k");J.1g.8O({zA:"qb-ui-4k-7u",Is:".qb-ui-4k-8O",f9:"aB",In:1a(e,ui){if(ui.45.4J("qb-ui-3I-28-45")){K 9Q=ui.45.1h("9Q");K eb=ui.45.1h("eb");K 1A=ui.45.1h("1A");K 9L=ui.45.1h("9L");if(9L==1d){9L=1T QB.1e.1U.jH;9L.6y=1l;9L.51=eb;9L.3N=eb}$(J).1R(QB.1e.2e.2l.xf,{1H:9L,28:1A,8g:eb,6m:9Q})}1j{K 1df=$(J);K 1A=ui.45.1h("1A");if(1A==1d){1A=1T QB.1e.1U.jH;1A.6y=1l;1A.51=ui.45.1h("9Q");1A.3N=ui.45.1h("9Q")}K 28;if(1A.5A.1f>0){28=1A.ff[0]}1j{28=1T QB.1e.1U.wh;1A.5A=[28]}28.dA=1l;K zx={1A:1A};$(J).1R(QB.1e.2e.2l.xd,zx)}}});J.1g.2r("qb-ui-4k-3E");J.1g.2r("hD-pH");J.1H=$(\'<1H zL="0" zI="0" h4="0" />\').2r("ui-8z-dm").2r("zG-VY").2r("hD-1dd").2r("er-y").4n(J.1g);if(2A hq=="2x"||!hq){J.HT=$(\'<1H 2t="hD-eU" />\').4n(J.1g)}1j{J.HT=J.1H}J.V6().4n(J.HT);J.lF=$("<ep/>").4n(J.1H);K me=J;J.ko();J.hS();me.1g.3k(1a(e){QB.1e.2e.cY=1k});me.1g.1n("6U",0);me.1g.8h(1a(e){3P(e.3Z){1q 13:if(QB.1e.2e.cY){1b}QB.1e.2e.cY=1l;me.1g.2B("[6U]:6v:4A").3k();e.4H();1s;1q 9:if(!QB.1e.2e.cY){if(!e.pB){me.gZ(me.1g).3k()}1j{me.gY(me.1g).3k()}e.4H()}}});K jD=0;if(2A hq=="2x"||!hq){J.IU=1l;J.1H.1H({dR:1l,HV:!1l,9D:{5f:1l}})}J.W0()},W0:1a(){K me=J;me.1H.4N({zq:1a(1H,1I){K 1y=$(1I).1h("1A");if(!1y.1B()){me.1g.1R(QB.1e.2e.2l.aF,{1I:1y})}},pg:"ui-qb-4k-1I-42"})},6F:1a(){J.1g.3K("ui-qb-4k").8W(".8Q");J.1H.3M();$.HN.3f.6F.3w(J,2F)},ko:1a(){K HP=1k;$.2p(J.3o,1a(1r,1I){if(1I.1B()){HP=1l;1b 1k}});if(!HP){J.mM(1d)}},eI:1a(1V){K me=J;if(1B(1V)||1V.2Q.1f==0){1b}K 4s=".ui-qb-4k-1I";K 1J=QB.1e.2i.kj(1V.2Q);$.2P("6F",4s);$.2P({4s:4s,4u:aQ,7n:{5C:0},nH:1k,9F:1a($1R,e){K me=$1R.1h("me");if(2A me=="2x"){1b{1J:1J}}K hu={};K 7x=1d;if($(e.3g).7s().4J("ui-qb-4k-1I-3n")){7x=me.cH;K 1I=me;if(1I&&1B(1I.88(1S.2n.3n))){K 1i={1x:QB.1e.1U.3U.4g.VP,3V:"kg-8X",1h:1d,1r:"J0-8X"};hu[1i.1r]=1i}}if($(e.3g).7s().4J("ui-qb-4k-1I-6I")){7x=me.cl}if(7x&&7x.1f){1p(K i=0;i<7x.1f;i++){K nK=7x[i];K 1i={1x:QB.1e.1U.3U.4g.HZ+" "+nK.51,3V:"kg-8X",1h:nK.zk,1r:"kg-8X-"+i};hu[1i.1r]=1i}}1b{1J:hu}},1X:1a(42,1v){K 1I=J.1h("me");me.hv(42,1I,1v.1J[42])},1J:1J})},hv:1a(42,1I,zg){K me=J;K el=1I.3r;if(42.5e("kg-8X")==0){QB.1e.3D.gT(1d,zg.1h)}3P(42){1q"J0-8X":1I.8G(1S.2n.3n,"(2y *)",1l);1I.8G(1S.2n.1Y,1l,1l);me.1g.1R(QB.1e.2e.2l.aF,{1I:1I});me.ko();1s;1q"f5-up":if(el.3B().1f){el.87(el.3W());if(!1I.1B()){me.1g.1R(QB.1e.2e.2l.aF,{1I:1I})}}1s;1q"f5-f4":K 3B=el.3B();if(3B.1f&&3B.3B().1f){el.gN(3B);if(!1I.1B()){me.1g.1R(QB.1e.2e.2l.aF,{1I:1I})}}1s;1q"1I-4q":if(me.3o.1f>1){me.kt(1I)}1j{if(1I.1B()){1b}1j{me.kt(1I);me.ko()}}me.ko(1I);me.hS();me.1g.1R(QB.1e.2e.2l.aF,{1I:1I,1r:1S.2n.lJ,4z:1l,6k:1k});1s;1q"1I-J0":me.mM(1d,el);1s}},xO:1a(){if(2A hq=="2x"||!hq){if(J.1H.1H("gA")){J.1H.1H("gA").xO()}}},kc:1a(){if(!J.IU){1b}if(J.mj!=0){1b}if(2A hq=="2x"||!hq){if(J.1H.1H("gA")){J.1H.1H("gA").z7()}}},mM:1a(4Z,lm,5M,lD){K bF=1k;K 1I=J.Vb(4Z);if(1I==1d){bF=1l;1I=1T QB.1e.ht(4Z,J);$(1I).4K(QB.1e.ht.2l.J6,{1I:1I},J.Vf,J);$(1I).4K(QB.1e.ht.2l.gK,1I,J.gK,J);if(1I!=1d&&(!1I.1B()&&1B(lm))){lm=J.VS()}if(5M===0||!1B(5M)){5M=6o(5M);K lj=$("tr:6j(.ui-qb-4k-1I-7O)",J.lF).eq(5M);if(lj.1f){lj.xr(1I.3r)}1j{1I.3r.4n(J.lF)}}1j{if(lm!=1d&&lm.1f){1I.3r.87(lm)}1j{1I.3r.4n(J.lF)}}if(!lD){J.1g.1R(QB.1e.2e.2l.Ek,{1I:1I})}J.3o.1G(1I)}1j{if(5M===0||!1B(5M)){5M=6o(5M);K VT=1I.3r[0].1de-1;if(5M!=VT){K lj=$("tr:6j(.ui-qb-4k-1I-7O)",J.lF).eq(5M);if(lj.1f){lj.xr(1I.3r)}}}bF=1I.7R(4Z);if(!lD&&bF){J.1g.1R(QB.1e.2e.2l.aF,{1I:1I})}}if(1I!=1d&&1I.3r!=1d){K oe=$(".ui-qb-4k-1I-dn",1I.3r);if(oe.1f>0){oe.2U("4T",J.oo?"":"3q")}}if(!lD&&bF){J.hS()}J.kc();1b 1I},Rh:1a(){1b J.3o},1cV:1a(){K J4=1d;$.2p(J.3o,1a(1r,1I){K z9=1I.1B();if(z9){J4=1I;1b 1k}});1b J4},kt:1a(IE,lD){K 4Z;1p(K i=J.3o.1f-1;i>=0;i--){K 1I=J.3o[i];if(1I.3v==IE.3v){if(!1B(1I.3v)||1B(1I.3v)&&1I.3r==IE.3r){J.3o.3M(1I);1I.7Q=1l;1I.3M();4Z=1I.1Q()}}}J.hS();if(4Z){4Z.7Q=1l;if(!lD){J.1g.1R(QB.1e.2e.2l.Eo,{4Z:4Z})}}J.kc()},1cW:1a(1Q){K 3o=J.Ix(1Q);1p(K 1I in 3o){1I.3M();J.3o.3M(1I);4q 1I}J.hS()},1cS:1a(8f){K 1O=1d;$.2p(J.3o,1a(1r,1I){if(1I.3v==8f){1O=1I;1b 1k}});1b 1O},VS:1a(){1b J.lF.2B("tr:7Y:6j(.ui-qb-4k-1I-7O)")},Vb:1a(4Z){K 3o=J.Ix(4Z);if(3o.1f>0){1b 3o[0]}1b 1d},Ix:1a(4Z){K 1O=[];K zE=[];K ws=[];K wt=[];K wq=[];if(4Z==1d){1b 1O}K p0=4v.3Y(4Z.8w).49();K lv=4v.3Y(4Z.9e).49();1p(K i=0;i<J.3o.1f;i++){K 1I=J.3o[i];if(!1B(1I.3v)&&(!1B(4Z.3v)&&1I.3v==4Z.3v)){zE.1G(1I)}1j{if(!1B(1I.6C)&&(!1B(4Z.6C)&&1I.6C==4Z.6C)){ws.1G(1I)}1j{if(1I.hT(4Z.8w,4Z.cw,4Z.9e)){if(4Z.8j==i){wt.1G(1I)}1j{wq.1G(1I)}}}}}if(zE.1f>0){1O=zE}1j{if(ws.1f>0){1O=ws}}if(wt.1f>0){1O=wt}if(wq.1f>0){1O=wq}1b 1O},qH:1a(){1b;$.2p(J.3o,1a(1r,1I){1I.6q[1S.2n.3n].IF();if(QB.1e.2e.kf==1I.6q[1S.2n.3n]){1I.6q[1S.2n.3n].wx()}})},Vm:1a(3n){K 3o=J.wp(3n);if(3o.1f>0){1b 3o[0]}1b 1d},wp:1a(3n){K 1O=[];$.2p(J.3o,1a(1r,1I){if(1I.hT(3n,"")){1O.1G(1I)}});if(1O.1f>0){1b 1O}$.2p(J.3o,1a(1r,1I){if(1I.Vc(3n,"")){1O.1G(1I)}});1b 1O},R9:1a(1Q){J.Dl();K 3k=$(":3k");$("#qb-ui-1Z").3k();QB.1e.2e.2O=1l;K me=J;if(1B(1Q)){1b}K FZ=[];$.2p(1Q.8p,1a(1W,hG){if(!hG.7Q){FZ.1G(me.mM(hG,1d,1W,1l))}});1p(K i=J.3o.1f-1;i>=0;i--){if(i>J.3o.1f-1){ap}K oV=J.3o[i];if(oV!=1d){if(FZ.5e(oV)==-1&&!oV.1B()){J.kt(oV,1l)}}}J.D2();QB.1e.2e.2O=1k},R2:1a(){K 2Z=[];if(QB.1e.2i.5X!=1d&&QB.1e.2i.5X.1f!=1d){1p(K i=0;i<QB.1e.2i.5X.1f;i++){K 1y=QB.1e.2i.5X[i];K 1H=1y.1h("1A");K 8g=!1B(1H.ni)?1H.ni:1H.3N;K DH=8g+".*";2Z.1G({1Y:1k,2g:DH,1o:DH,bB:"1H"});$(1H.5A).2p(1a(){K 28=J;K pb=8g+"."+28.7i;K V9=28.7i;2Z.1G({1Y:1k,2g:V9,1o:pb,bB:"28"})})}}bo.DQ("4k-3n",2Z)},1cT:1a(1I,4r){1I.eL(4r)},gK:1a(e,1h){1h.1I=e.1h.1I;J.1g.1R(QB.1e.2e.2l.DC,1h)},DI:1a(e,1h){J.kc()},Vf:1a(e,1h){K 1I=e.1h.1I;K 1r=1d;K 4z=1d;K 6k=1d;if(1h){1r=1h.1r;4z=1h.4z;6k=1h.6k}1b J.Vd(1I,1r,6k,4z,1h.ij)},1d2:1a(4Z,5q,3n,1X){if(!QB.1e.2e.wi){if(1X&&7I(1X)=="1a"){1X()}1b}4Z.Vg=1l;4Z.FV=5q;4Z.FC=3n;QB.1e.2o.sM([4Z]);QB.1e.2o.6g(1X)},Vd:1a(1I,5q,6k,4z,DO){if(5q==1S.2n.lJ&&4z){if(J.3o.1f>1){J.kt(1I,1l)}1j{if(1I.1B()){1b}1j{J.kt(1I,1l);J.ko()}}}J.ko(1I);J.hS(1I);J.1g.1R(QB.1e.2e.2l.aF,{1I:1I,1r:5q,4z:4z,6k:6k,DO:DO});J.kc()},hS:1a(1I){if(J.mj!=0){1b}J.V5(1I);J.Ve(1I)},Ve:1a(){K q1=[];1p(K i=0;i<J.3o.1f;i++){K 1I=J.3o[i];K 1o=1I.88(1S.2n.9x);if(1o!=1d&&1o>0){q1.1G({1I:1I,7G:1I.88(1S.2n.7G)})}}q1.hP(J.V4);K 2Z=[];1p(K i=0;i<q1.1f;i++){2Z.1G({1Y:1k,2g:61(i+1),1o:61(i+1),bB:"7G"});K 1I=q1[i].1I;1I.8G(1S.2n.7G,i+1,1l);1I.mF(1S.2n.7G)}2Z.1G({1Y:1k,2g:61(i+1),1o:61(i+1),bB:"7G"});bo.DQ("4k-7G",2Z)},SY:1a(){1p(K i=0;i<J.3o.1f;i++){K 1I=J.3o[i];1I.V3(1S.2n.cF)}},V4:1a(a,b){K mw=b.7G;K mz=a.7G;if(1B(mz)||mz<0){1b 1}if(1B(mw)||mw<0){1b-1}mz=6o(mz);mw=6o(mw);1b mz-mw},V5:1a(1I){K wG=1k;1p(K i=0;i<J.3o.1f;i++){if(J.3o[i].88(1S.2n.eN)){wG=1l;1s}}if(J.oo==wG){1b 1k}J.oo=wG;K oe=$(".ui-qb-4k .ui-qb-4k-1I-dn");oe.2U("4T",J.oo?"":"3q");J.kc();1b 1l},V6:1a(){K 7O=$("<eU />");K tr=$("<tr />").2r("ui-qb-4k-1I-7O").2r("ui-8z-7O").4n(7O);K 4A=1l;K 1dA="";QB.1e.2e.9v={};QB.1e.2e.9v[1S.2n.42]="";QB.1e.2e.9v[1S.2n.lJ]=QB.1e.1U.3U.4g.h9;QB.1e.2e.9v[1S.2n.1Y]=QB.1e.1U.3U.4g.6R.Dt;QB.1e.2e.9v[1S.2n.3n]=QB.1e.1U.3U.4g.6R.8w;QB.1e.2e.9v[1S.2n.cF]=QB.1e.1U.3U.4g.6R.cw;QB.1e.2e.9v[1S.2n.aC]=QB.1e.1U.3U.4g.6R.9e;QB.1e.2e.9v[1S.2n.9x]=QB.1e.1U.3U.4g.6R.gJ;QB.1e.2e.9v[1S.2n.7G]=QB.1e.1U.3U.4g.6R.m6;QB.1e.2e.9v[1S.2n.eN]=QB.1e.1U.3U.4g.6R.k0;QB.1e.2e.9v[1S.2n.dn]=QB.1e.1U.3U.4g.6R.Du;QB.1e.2e.9v[1S.2n.6I]=QB.1e.1U.3U.4g.6R.wF;QB.1e.2e.9v[1S.2n.oO]=QB.1e.1U.3U.4g.6R.wF;$.2p(QB.1e.2e.9v,1a(i,3O){QB.1e.2e.9v[i]=3O.3t("&2q;"," ").3t("&DM;","&")});$.2p(J.Vq(),1a(){if(4A){$(\'<th 2t="ui-4P-5N ui-qb-4k-1I-\'+J.1x+\'" 9c="3"><2u>\'+J.7O+"</2u></th>").4n(tr);4A=1k}1j{$(\'<th 2t="Vr-62 ui-4P-5N ui-qb-4k-1I-\'+J.1x+\'"><2u>\'+J.7O+"</2u></th>").4n(tr)}});1b 7O},Vq:1a(){K 3o={};3o[1S.2n.1Y]={dY:1,1x:"1Y",7O:QB.1e.1U.3U.4g.6R.Dt,1C:"9h"};3o[1S.2n.3n]={dY:2,1x:"3n",7O:QB.1e.1U.3U.4g.6R.8w,1C:"3n"};3o[1S.2n.aC]={dY:3,1x:"aC",7O:QB.1e.1U.3U.4g.6R.9e,1C:"2g"};3o[1S.2n.9x]={dY:4,1x:"9x",7O:QB.1e.1U.3U.4g.6R.gJ,1C:"2y"};3o[1S.2n.7G]={dY:5,1x:"7G",7O:QB.1e.1U.3U.4g.6R.m6,1C:"2y"};3o[1S.2n.cF]={dY:6,1x:"cF",7O:QB.1e.1U.3U.4g.6R.cw,1C:"2y"};3o[1S.2n.eN]={dY:7,1x:"eN",7O:QB.1e.1U.3U.4g.6R.k0,1C:"9h"};3o[1S.2n.dn]={dY:8,1x:"dn",7O:QB.1e.1U.3U.4g.6R.Du,1C:"2y"};3o[1S.2n.6I]={dY:9,1x:"6I",7O:QB.1e.1U.3U.4g.6R.wF,1C:"2g"};1p(K i=0;i<QB.1e.2e.k9;i++){3o[1S.2n.oO+i]={dY:10+i,1x:"Dp",7O:QB.1e.1U.3U.4g.6R.Vt,1C:"2g"}}1b 3o}};QB.1e.2e.2l={Ek:"1dH",Eo:"1dF",aF:"Ei",xd:"xd",xf:"xf",DC:"DC"};(1a($){$.8z("ui.8Q",QB.1e.2e);$.4D($.ui.8Q,{Vk:"1ds Vm wp mM eI",6P:"1.7.1"})})(2I);QB.1e.1U.gF={hK:0,6H:1,DS:2,xV:3,UB:4};QB.1e.1U.7m={};QB.1e.1U.7m[QB.1e.2N.7w.Vn]={3N:"XZ iL",8B:1,7Z:[QB.1e.2N.6K.bl]};QB.1e.1U.7m[QB.1e.2N.7w.Vh]={3N:"cW",8B:1,7Z:[QB.1e.2N.6K.bl]};QB.1e.1U.7m[QB.1e.2N.7w.Vu]={3N:"Y6 iL",8B:1,7Z:[QB.1e.2N.6K.bl]};QB.1e.1U.7m[QB.1e.2N.7w.rB]={3N:"is hT to",8B:1,7Z:[]};QB.1e.1U.7m[QB.1e.2N.7w.Vp]={3N:"vN 6j 3a iL",8B:1,7Z:[QB.1e.2N.6K.bl]};QB.1e.1U.7m[QB.1e.2N.7w.Vs]={3N:"vN 6j XG",8B:1,7Z:[QB.1e.2N.6K.bl]};QB.1e.1U.7m[QB.1e.2N.7w.Va]={3N:"vN 6j 5d iL",8B:1,7Z:[QB.1e.2N.6K.bl]};QB.1e.1U.7m[QB.1e.2N.7w.Ea]={3N:"is in 5v",8B:1,7Z:[]};QB.1e.1U.7m[QB.1e.2N.7w.VR]={3N:"is 6j hT to",8B:1,7Z:[]};QB.1e.1U.7m[QB.1e.2N.7w.Ee]={3N:"is 6j in 5v",8B:1,7Z:[]};QB.1e.1U.7m[QB.1e.2N.7w.VU]={3N:"is 1d",8B:0,7Z:[]};QB.1e.1U.7m[QB.1e.2N.7w.VQ]={3N:"is 6j 1d",8B:0,7Z:[]};QB.1e.1U.7m[QB.1e.2N.7w.Vy]={3N:"is Vz vP",8B:1,7Z:[QB.1e.2N.6K.hH,QB.1e.2N.6K.5Y]};QB.1e.1U.7m[QB.1e.2N.7w.VA]={3N:"is Vz vP or hT to",8B:1,7Z:[QB.1e.2N.6K.hH,QB.1e.2N.6K.5Y]};QB.1e.1U.7m[QB.1e.2N.7w.VK]={3N:"is VG vP",8B:1,7Z:[QB.1e.2N.6K.hH,QB.1e.2N.6K.5Y]};QB.1e.1U.7m[QB.1e.2N.7w.VL]={3N:"is VG vP or hT to",8B:1,7Z:[QB.1e.2N.6K.hH,QB.1e.2N.6K.5Y]};QB.1e.1U.7m[QB.1e.2N.7w.VF]={3N:"is Ui",8B:2,7Z:[QB.1e.2N.6K.hH,QB.1e.2N.6K.5Y]};QB.1e.1U.7m[QB.1e.2N.7w.VI]={3N:"is 6j Ui",8B:2,7Z:[QB.1e.2N.6K.hH,QB.1e.2N.6K.5Y]};QB.1e.1U.iN={};QB.1e.1U.iN[QB.1e.2N.ba.9X]={3N:"9X",ju:"73"};QB.1e.1U.iN[QB.1e.2N.ba.wY]={3N:"hJ 9X",ju:"Yn"};QB.1e.1U.iN[QB.1e.2N.ba.qs]={3N:"qs",ju:"Ye"};QB.1e.1U.iN[QB.1e.2N.ba.eV]={3N:"eV",ju:"3q"};QB.1e.xS=1a(){J.$1C=1d};QB.1e.qu=1T 6N({$1C:"fr.qE.1e.bk.qD.E6, fr.qF.1e.bk",53:1d,2Q:[],4R:QB.1e.1U.gF.hK,6H:1d,8v:QB.1e.2N.7w.rB,6a:1d,84:1d,fI:1k,h7:1k,1g:1d,a4:1a(){K a4=J;4x(a4.53!=1d){a4=a4.53}1b a4},xI:1a(1Q){1Q.$1C=J.$1C;1Q.4R=J.4R;1Q.6H=J.6H;1Q.8v=J.8v;1Q.6a=J.6a;1Q.84=J.84},xJ:1a(1Q){1Q.2Q=[];$.2p(J.2Q,1a(1W,1i){1Q.2Q.1G(1i.jo())})},jo:1a(){K 1Q=$.4D(1T QB.1e.xS,1T QB.1e.1U.E6);J.xI(1Q);J.xJ(1Q);1b 1Q},Us:1a(1Q){K 1O=1d;if(1Q==1d){1b 1O}3P(1Q.4R){1q QB.1e.1U.gF.6H:1O=1T QB.1e.Eg(J);1O.qa(1Q);1s;1q QB.1e.1U.gF.DS:1O=1T QB.1e.DR(J);1O.qa(1Q);1s;1q QB.1e.1U.gF.xV:1O=1T QB.1e.wP(J);1O.qa(1Q);1s}1b 1O},qa:1a(1Q){K me=J;J.4R=1Q.4R;J.6H=1Q.6H;J.8v=1Q.8v;J.bL=1Q.bL;J.aO=1Q.aO;J.6a=1Q.6a;J.84=1Q.84;$.2p(1Q.2Q,1a(1W,1i){me.2Q.1G(me.Us(1i))})},CP:1a(5q){J.6H=5q;if(J.6H!=1d){if(QB.1e.1U.7m[J.8v].7Z.1f!=0&&!QB.1e.1U.7m[J.8v].7Z.cW(J.8v)){J.8v=QB.1e.2N.7w.rB}}1j{J.8v=QB.1e.2N.7w.rB}},8j:1a(){if(J.53==1d){1b-1}1b J.53.2Q.5e(J)},Yi:1a(){if(J.53==1d){1b 1d}K i=J.53.2Q.5e(J);if(i>=J.53.2Q.1f-1){1b 1d}1b J.53.2Q[i+1]},qi:1a(){if(J.53==1d){1b 1d}K i=J.53.2Q.5e(J);if(i<=0){1b 1d}1b J.53.2Q[i-1]},Um:1a(){if(J.53==1d){1b 0}1b J.53.2Q.1f},DW:1a(){1b QB.1e.1U.7m[J.8v]},xL:1a(){K 1O="";if(!J.a4().rn){1b 1O}if(J.qi()==1d){1b 1O}if(J.53==1d){1b 1O}3P(6o(J.53.aO)){1q QB.1e.2N.ba.9X:;1q QB.1e.2N.ba.wY:1O=$("<2u> qV </2u>");1s;1q QB.1e.2N.ba.qs:;1q QB.1e.2N.ba.eV:1O=$("<2u> or </2u>");1s}1b 1O},Xj:1a(){K 1J={};$.2p(J.a4().xj,1a(1W,5q){1J[5q.3N]={1x:5q.3N,3V:"28",1h:5q}});1b 1J},UD:1a(1i){K 1J={};$.2p(QB.1e.1U.7m,1a(1W,1g){if(1i.6H!=1d){if(1g.7Z.1f!=0){if(1i.6H!=1d&&1g.7Z.cW(1i.6H.j0)){1J[1W]={1x:1g.3N,3V:"",1h:1g}}}1j{1J[1W]={1x:1g.3N,3V:"",1h:1g}}}});1b 1J},Xc:1a(1i){K 1J={};$.2p(QB.1e.1U.iN,1a(1W,1g){1J[1W]={1x:1g.3N,3V:"",1h:1g}});1b 1J},xG:1a(){K 1J={};1J["f5-up"]={1x:"lS up",3V:"f5-up",2O:J.8j()<=0};1J["f5-f4"]={1x:"lS f4",3V:"f5-f4",2O:J.8j()>=J.Um()-1};1J["6f"]="---------";1b 1J},8u:1a(){J.sE()},l3:1a(){1b 1l},sE:1a(){if(J.6H==1d){J.fI=1l;J.h7=1l;1b}if(J.8v==QB.1e.2N.7w.Ea||J.8v==QB.1e.2N.7w.Ee){1b!1B(J.6a)}3P(J.6H.j0){1q QB.1e.2N.6K.h6:;1q QB.1e.2N.6K.5Y:;1q QB.1e.2N.6K.bl:;1q QB.1e.2N.6K.hK:J.fI=!1B(J.6a);J.h7=!1B(J.84);1s;1q QB.1e.2N.6K.hH:J.fI=!1B(J.6a)&&$.Uo(J.6a);J.h7=!1B(J.84)&&$.Uo(J.84);1s}},hh:1a(){J.8u()},lg:1a(){1b{}},U1:1a(){K 1W=J.8j();K 1i=J.53.2Q[1W];if(1W<=0||(J.53==1d||J.1g==1d)){1b 1k}K Ef=1W-1;K k7=J.53.2Q[Ef];if(k7==1d||k7.1g==1d){1b 1k}J.1g.87(k7.1g);J.53.2Q[1W]=k7;J.53.2Q[Ef]=1i;1b 1l},U0:1a(){K 1W=J.8j();K 1i=J.53.2Q[1W];if(J.53==1d||(J.1g==1d||1W>=J.53.2Q.1f-1)){1b 1k}K f0=1W+1;K iU=J.53.2Q[f0];if(iU==1d||iU.1g==1d){1b 1k}iU.1g.87(J.1g);J.53.2Q[1W]=iU;J.53.2Q[f0]=1i;1b 1l},TZ:1a(){K 1W=J.8j();J.53.2Q.3M(1W);J.1g.3M();1b 1l},Ub:1a(){$.2p(J.2Q,1a(1W,1i){1i.1g.3M()});J.2Q=[];1b 1l},nI:1a(1i){K 1W=1i.8j();if(1W==0){J.1g.nE(1i.8u())}1j{1i.qi().1g.xc(1i.8u())}},E0:1a(){K 1i=1T QB.1e.Eg(J.53);J.53.2Q.1G(1i);J.53.nI(1i);1b 1i},U6:1a(){K 1i=1T QB.1e.DR(J.53);J.53.2Q.1G(1i);J.53.nI(1i);1b 1i},U5:1a(){K 1i=1T QB.1e.wP(J.53);J.53.2Q.1G(1i);J.53.nI(1i);1b 1i},xg:1a(1r){3P(1r){1q"f5-up":1b J.U1();1s;1q"f5-f4":1b J.U0();1s;1q"4q":1b J.TZ();1s;1q"9I":1b J.Ub();1s;1q"5F-6I-1p-5q":1b J.E0();1s;1q"5F-wX-6I":1b J.U6();1s;1q"5F-d9-of-x0":1b J.U5();1s}1b 1k},CN:1a(1r,5q){J.CP(5q);J.hh();1b 1l},X8:1a(1r){J.8v=1r;J.hh();1b 1l},Xp:1a(1r){J.aO=1r;J.hh();1b 1l},dg:1a(1P){if(1P!==2x){J.53=1P}}});QB.1e.Eg=1T 6N({bZ:QB.1e.qu,4R:QB.1e.1U.gF.6H,$1C:"fr.qE.1e.bk.qD.U8, fr.qF.1e.bk",lg:1a(){K 1J=J.xG();1J["4q"]={1x:"h9",3V:"E3"};1b 1J},l3:1a(){if(J.6H==1d){1b 1k}K Eb=J.DW();if(Eb!=1d){3P(Eb.8B){1q 2:1b J.fI&&J.h7;1s;1q 1:1b J.fI;1s;1q 0:1b 1l;1s}}1b 1l},l4:1a($1g,fu,5q){K me=J;if(1B(fu)){fu=1}K 2b="";if(fu==2){if(!1B(J.84)){2b=J.84}}1j{if(!1B(J.6a)){2b=J.6a}}K $2a;if(!1B(5q)&&5q.j0==QB.1e.2N.6K.h6){K xx="";if(1B(J.6a)||(!1B(J.6a)&&J.6a==1||!1B(J.6a)&&J.6a.9i=="Yv")){xx="1Y"}K U7=xx==""?"1Y":"";$2a=$("<2y>"+"<2T "+xx+\' 1o="1">sF</2T>\'+"<2T "+U7+\' 1o="0">Uu</2T>\'+"</2y>").2y(1a(1N){J.4W()}).dp(1a(1N){J.4W()})}1j{$2a=$(\'<2a 1o="\'+2b+\'">\')}$2a.iZ(1a(1N){if(1N.3Z==10||(1N.3Z==13||1N.3Z==27)){1N.4H();J.4W()}});if(!1B(5q)&&5q.j0==QB.1e.2N.6K.5Y){$2a.sn({Yw:1l,Yx:1l,YZ:"YM:XK",h8:1a(2b,XH){$2a.2b(2b);if(fu==2){me.84=2b}1j{me.6a=2b}me.sE(2b,fu)},XI:1a(){2b=$2a.2b();if(fu==2){me.84=2b}1j{me.6a=2b}me.hh()}});if($2a.2b()===""){$2a.sn("Xx",1T 5Y)}$2a.gN($1g).3k()}1j{$2a.gN($1g);$2a.3k();6W(1a(){$2a.4W(1a(){K 2b=$2a.2b();if(fu==2){me.84=2b}1j{me.6a=2b}me.sE(2b,fu);me.hh()})},9m)}},xp:1a(1o,5q){if(!1B(5q)){3P(5q.j0){1q QB.1e.2N.6K.h6:1b 1o==1?"sF":"Uu"}}1b 1o},8u:1a(){K me=J;J.1P(2F);if(J.1g==1d){J.1g=$(\'<2C 2t="qb-ui-5n-5o-5J 1i">\')}J.1g.ew();J.1g.1h("1i",J);J.1g.2Y($(\'<2C 2t="qb-ui-5n-5o-3e 7J">\'));J.1g.2Y(" ");J.1g.2Y(J.xL());K 5q=J.6H;if(1B(5q)){J.1g.2Y($(\'<a 2t="qb-ui-5n-5o-2k-28-2y 9w" 5B="#">[2y 5q]</a>\'))}1j{J.1g.2Y($(\'<a 2t="qb-ui-5n-5o-2k-28-2y" 5B="#">\'+5q.3N+"</a>"))}J.1g.2Y(" ");K Uw=QB.1e.1U.7m[J.8v].3N;J.1g.2Y($(\'<a 2t="qb-ui-5n-5o-2k-7A" 5B="#">\'+Uw+"</a>"));J.1g.2Y(" ");K UG=J.DW();K $a0;K $fE;3P(6o(UG.8B)){1q 1:if(1B(J.6a)){$a0=$(\'<a 2t="qb-ui-5n-5o-2k-1o 9w" 5B="#">[xP 1o]</a>\')}1j{$a0=$(\'<a 2t="qb-ui-5n-5o-2k-1o" 5B="#"></a>\');$a0.2g(J.xp(J.6a,J.6H))}$a0.3F(1a(e){K $1g=$(J);$1g.3C();me.l4($1g,1,5q);1b 1k});J.1g.2Y($a0);if(!1B(J.6a)&&!J.fI){$a0.2r("9w");J.1g.2Y(\' <2u 2t="mn-1o">UF 1o</2u>\')}1s;1q 2:if(1B(J.6a)){$a0=$(\'<a 2t="qb-ui-5n-5o-2k-1o 9w" 5B="#">[xP 1o]</a>\')}1j{$a0=$(\'<a 2t="qb-ui-5n-5o-2k-1o" 5B="#"></a>\');$a0.2g(J.xp(J.6a,J.6H))}if(!J.fI){$a0.2r("9w")}$a0.3F(1a(e){K $1g=$(J);$1g.3C();me.l4($1g,1,5q);1b 1k});J.1g.2Y($a0);J.1g.2Y($("<2u> qV </2u>"));if(1B(J.84)){$fE=$(\'<a 2t="qb-ui-5n-5o-2k-1o 9w" 5B="#">[xP 1o]</a>\')}1j{$fE=$(\'<a 2t="qb-ui-5n-5o-2k-1o" 5B="#"></a>\');$fE.2g(J.xp(J.84,J.6H))}if(!J.h7){$fE.2r("9w")}$fE.3F(1a(e){K $1g=$(J);$1g.3C();me.l4($1g,2,5q);1b 1k});J.1g.2Y($fE);if(!1B(J.6a)&&!J.fI||!1B(J.84)&&!J.h7){if(!1B(J.6a)&&!J.fI){$a0.2r("9w")}if(!1B(J.84)&&!J.h7){$fE.2r("9w")}J.1g.2Y(\' <2u 2t="mn-1o">UF 1o</2u>\')}1s}if(!1B(5q)&&5q.j0==QB.1e.2N.6K.5Y){if(!1B($a0)){$a0.sn()}if(!1B($fE)){$fE.sn()}}1b J.1g},dg:1a(1P){J.1P(1P)}});QB.1e.DR=1T 6N({bZ:QB.1e.qu,4R:QB.1e.1U.gF.DS,$1C:"fr.qE.1e.bk.qD.DT, fr.qF.1e.bk",bL:"",xU:1k,lg:1a(){K 1J=J.xG();1J["4q"]={1x:"h9",3V:"E3"};1b 1J},jo:1a(){K 1Q=$.4D(1T QB.1e.xS,1T QB.1e.1U.DT);J.xI(1Q);1Q.bL=J.bL;J.xJ(1Q);1b 1Q},l3:1a(){1b J.xU},sE:1a(2b,fu){J.xU=!1B(J.bL)},l4:1a($1g){K me=J;K 2b="";if(!1B(J.bL)){2b=J.bL}K $2a=$(\'<2a 1o="\'+2b+\'">\').iZ(1a(1N){if(1N.3Z==10||1N.3Z==13){1N.4H();J.4W()}}).4W(1a(){me.bL=$2a.2b();me.6a=me.bL;me.hh()}).gN($1g).3k()},8u:1a(){K me=J;J.1P(2F);if(J.1g==1d){J.1g=$(\'<2C 2t="qb-ui-5n-5o-5J 1i">\')}J.1g.1h("1i",J);J.1g.ew();J.1g.2Y($(\'<2C 2t="qb-ui-5n-5o-3e 7J">\'));K $lb;J.1g.2Y(J.xL());if(1B(J.bL)){$lb=$(\'<a 2t="qb-ui-5n-5o-2k-1o 9w" 5B="#">[xP 6I]</a>\')}1j{$lb=$(\'<a 2t="qb-ui-5n-5o-2k-1o" 5B="#">\'+J.bL+"</a>")}if(!J.xU){$lb.2r("9w")}$lb.3F(1a(e){K $1g=$(J);$1g.3C();me.l4($1g);1b 1k});J.1g.2Y($lb);1b J.1g},dg:1a(1P){J.1P(1P)}});QB.1e.wP=1T 6N({bZ:QB.1e.qu,4R:QB.1e.1U.gF.xV,$1C:"fr.qE.1e.bk.qD.E1, fr.qF.1e.bk",aO:QB.1e.2N.ba.9X,jo:1a(){K 1Q=$.4D(1T QB.1e.xS,1T QB.1e.1U.E1);J.xI(1Q);1Q.aO=J.aO;J.xJ(1Q);1b 1Q},l3:1a(){K 1O=1l;if(J.2Q.1f==0&&J.53!=1d){1b 1k}$.2p(J.2Q,1a(1W,1i){if(!1i.l3()){1O=1k;1b 1k}});1b 1O},lg:1a(){K 1J=J.xG();1J["9I"]={1x:"kH",3V:"E2",2O:J.2Q.1f<=0};1J["4q"]={1x:"h9",3V:"E3"};1b 1J},nI:1a(1i){K 1W=1i.8j();if(1W==0){J.1g.5w(".qb-ui-5n-5o-4Y").nE(1i.8u())}1j{1i.qi().1g.xc(1i.8u())}},CR:1a(){1b QB.1e.1U.iN[J.aO]},8u:1a(){J.1P(2F);if(J.1g==1d){J.1g=$(\'<2C 2t="qb-ui-5n-5o-5J d9">\')}J.1g.1h("1i",J);J.1g.ew();J.1g.2Y($(\'<2C 2t="qb-ui-5n-5o-3e bd">\'));K nU=J.CR();K $3H=$(\'<2C id="qb-ui-5n-5o-3H">\');$3H.2Y(J.xL());K $a=$(\'<a 2t="qb-ui-5n-5o-2k-CV" 5B="#">\'+nU.3N+"</a>");$3H.2Y($a);$3H.2Y($("<2u> "+J.a4().mW+"</2u>"));J.1g.2Y($3H);K $4Y=$(\'<2C 2t="qb-ui-5n-5o-4Y \'+nU.ju+\'">\');$.2p(J.2Q,1a(1W,1i){$4Y.2Y(1i.8u())});K xb=1T QB.1e.x8(J);$4Y.2Y(xb.8u());J.1g.2Y($4Y);1b J.1g},dg:1a(1P){J.1P(1P);if(1P!=1d){3P(6o(1P.aO)){1q QB.1e.2N.ba.9X:;1q QB.1e.2N.ba.wY:J.aO=QB.1e.2N.ba.qs;1s;5N:J.aO=QB.1e.2N.ba.9X}}}});QB.1e.x8=1T 6N({bZ:QB.1e.qu,4R:QB.1e.1U.gF.UB,lg:1a(){K 1J={"5F-6I-1p-5q":{1x:"g0 6I 1p 5q",3V:"5F-6I-1p-5q"},"5F-wX-6I":{1x:"g0 wX 6I",3V:"5F-wX-6I"},"6f":"---------","5F-d9-of-x0":{1x:"g0 d9 of x0",3V:"5F-d9-of-x0"}};1b 1J},8u:1a(){if(J.1g==1d){J.1g=$(\'<2C 2t="qb-ui-5n-5o-5J 5F">\')}J.1g.1h("1i",J);J.1g.ew();J.1g.2Y($(\'<2C 2t="qb-ui-5n-5o-3e gX">\'));J.1g.2Y($(\'<a 2t="qb-ui-5n-5o-2k-28-2y" 5B="#">[...]</a>\'));1b J.1g},CN:1a(1r,5q){K 1i=J.E0();1i.CP(5q);1i.hh();1b 1l},dg:1a(1P){J.1P(1P)}});QB.1e.8A=1T 6N({bZ:QB.1e.wP,$1C:"fr.qE.1e.bk.qD.CS, fr.qF.1e.bk",53:1d,rm:"UE",mW:"of ip Y8 XW",rl:"[kH]",rn:1l,2Q:[],gh:1a(1h){J.xj=1h.xj;J.2Q=[];J.qa(1h);J.CT()},kH:1a(){J.2Q.2p(1a(1i,i){1i.1g.3M()});J.2Q=[]},Xl:1a(){K me=J;K 6A=".qb-ui-5n-5o-3e";$.2P("6F",6A);$.2P({4s:6A,4u:aQ,7n:{5C:0},1R:"2f",1J:{},9F:1a($1R,e){K 1i=$1R.7s(".qb-ui-5n-5o-5J:4A").1h("1i");if(1i==1d){1b 1k}K 1J=1i.lg();if(1J==1d||5g.93(1J).1f==0){1b 1k}1b{1X:1a(1r){1i.xg(1r,1J[1r].1h)},1J:1J}}})},Xq:1a(){K me=J;K 6A=".qb-ui-5n-5o-2k-7A";$.2P("6F",6A);$.2P({4s:6A,4u:aQ,7n:{5C:0},1R:"2f",1J:{},9F:1a($1R,e){K 1i=$1R.7s(".qb-ui-5n-5o-5J:4A").1h("1i");if(1i==1d){1b 1k}K 7B=1i.UD(1i);if(7B==1d||5g.93(7B).1f==0){1b 1k}1b{1X:1a(1r){1i.X8(1r)},1J:7B}}})},Xt:1a(){K me=J;K 6A=".qb-ui-5n-5o-2k-CV";$.2P("6F",6A);$.2P({4s:6A,4u:aQ,7n:{5C:0},1R:"2f",1J:{},9F:1a($1R,e){K 1i=$1R.7s(".qb-ui-5n-5o-5J:4A").1h("1i");if(1i==1d){1b 1k}K 7B=1i.Xc(1i);if(7B==1d||5g.93(7B).1f==0){1b 1k}1b{1X:1a(1r){1i.Xp(1r)},1J:7B}}})},Xf:1a(){K me=J;K 6A=".qb-ui-5n-5o-2k-28-2y";$.2P("6F",6A);K 1V=$.2P({4s:6A,4u:aQ,7n:{5C:0},1R:"2f",1J:{},da:"Y4",9F:1a($1R,e){K 1i=$1R.7s(".qb-ui-5n-5o-5J:4A").1h("1i");if(1i==1d){1b 1k}K 1J=1i.Xj();if(1J==1d||5g.93(1J).1f==0){1b 1k}1b{1X:1a(1r){1i.CN(1r,1J[1r].1h)},1J:1J}}})},CT:1a(){K me=J;J.2D.ew();J.2D.2Y(J.8u());1b;K $4Y=$(\'<2C 2t="qb-ui-5n-5o-4Y 73">\');$.2p(J.2Q,1a(1W,1i){$4Y.2Y(1i.8u())});K X6=1T QB.1e.x8(J);$4Y.2Y(X6.8u());J.2D.2Y($4Y);J.1g=$4Y},nI:1a(1i){K 1W=1i.8j();if(1W==0){J.1g.5w(".qb-ui-5n-5o-4Y").nE(1i.8u())}1j{1i.qi().1g.xc(1i.8u())}},8u:1a(){K Xr=J.a4();if(J.1g==1d){J.1g=$(\'<2C 2t="qb-ui-5n-5o-5J d9 2D">\')}J.1g.1h("1i",J);J.1g.ew();K nU=J.CR();K $3H=$(\'<2C id="qb-ui-5n-5o-3H">\');$3H.2Y("<2u>"+J.a4().rm+" </2u>");K $a=$(\'<a 2t="qb-ui-5n-5o-2k-CV" 5B="#">\'+nU.3N+"</a>");$3H.2Y($a);$3H.2Y($("<2u> "+J.a4().mW+"</2u>"));$3H.2Y("&2q;&2q;");K CX=$(\'<a 2t="qb-ui-5n-5o-2k-9I-1J" 5B="#">\'+J.a4().rl+"</a>");CX.3F(1a(e){e.4H();Xr.kH()});$3H.2Y(CX);J.1g.2Y($3H);K $4Y=$(\'<2C 2t="qb-ui-5n-5o-4Y \'+nU.ju+\'">\');$.2p(J.2Q,1a(1W,1i){$4Y.2Y(1i.8u())});K xb=1T QB.1e.x8(J);$4Y.2Y(xb.8u());J.1g.2Y($4Y);1b J.1g},jo:1a(){K 1Q=1T QB.1e.1U.CS;1Q.aO=J.aO;1Q.2Q=[];$.2p(J.2Q,1a(1W,1i){1Q.2Q.1G(1i.jo())});1b 1Q},6g:1a(1X){QB.1e.2o.3s.8A=J.jo();QB.1e.2o.6g(1X)},7R:1a(1X){QB.1e.2o.3s.8A=1d;QB.1e.2o.6g(1X)},dg:1a(1P){J.2D=$("#qb-ui-5n-5o");if(J.2D.1f){if(!1B(J.2D.1n("mW"))){J.mW=J.2D.1n("mW")}if(!1B(J.2D.1n("rm"))){J.rm=J.2D.1n("rm")}if(!1B(J.2D.1n("rl"))){J.rl=J.2D.1n("rl")}if(!1B(J.2D.1n("rn"))){J.rn=J.2D.1n("rn").49()=="1l"}}J.1P(1d);J.CT();J.Xl();J.Xf();J.Xq();J.Xt()}});QB.1e.8A.2l={X9:"X9",Xg:"Xg"};K 6P=4;K Pe=1l;K s5="r6/";K EL="1.11.0";K TH="2.99.99";K EI="1.11.0";K TQ="2.99.99";K TF="CD j5 Wl.js is 6j c5.";K F3="2I Xd is 6j a7.";K TO="xw Xd is 6j a7.";K TU="Xo 2I 6P v.$1 Xn! 2I v.$2 or Wn is Wj.";K TB="Xo xw 6P v.$1 Xn! xw v.$2 or Wn is Wj.";K S9=\'Ys Yt dQ dY. 2I qV xw Yy be c5 xr dQ ip "Wl.js"\';K Cz=\'Yq r6 Yg is Yd. Wy eL Wx "Yj.7q" Yk.\';K nA=1k;K 3D=1a(){J.jb=1d;J.7f=1d;J.2i=1d;J.F7=1d;J.2e=1d;J.iu=1d;J.5i=[];J.h0={};J.5X=[];J.oW="";J.8i=1d;J.yr=1d;J.rS=1k;J.3v=1d;J.je=1d;J.eF="";J.8N={};J.kC=1d;J.av=1d;J.8A=1d;J.xA=1d;J.rr="";J.qY=1k;J.9t=0;J.wZ=1l;J.pD={2e:{ga:{},fz:{}},2i:{ga:{},fz:{}}};J.zc=1a(aR){K w7=QB.1e.2o.j4[aR];if(!1B(w7)){J.Er(1d,w7.2i);J.Eq(1d,w7.2e)}QB.1e.2o.ek=aR};J.zi=1a(42){K me=J;if(42.db=="Wt-Wa-W4"){J.zc(42.3v)}if(QB.1e.2o.gS){6W(1a(){me.zi(42)},50);1b}QB.1e.2o.3s.CJ.1G(42);QB.1e.2o.6g()};J.Qp=1a(e,2k){K 1Q=2k.1Q();if(2k.7Q){QB.1e.2i.7y.3M(2k)}QB.1e.2o.Wf(1Q);QB.1e.2o.6g()};J.En=1a(e,1h){K 42=1h.42;K 1i=1h.1i;QB.1e.2o.3s.gR.dL=42;QB.1e.2o.3s.gR.fz=1i.1h;QB.1e.2o.3s.gR.We=1h.we;QB.1e.2o.3s.gR.Wz="1Z";QB.1e.2o.6g()};J.Et=1a(e,1v){K 1H=1v.1H;K 28=1v.28;K 9R=1v.9R;K nb=1d;if(1H!=1d&&1H.nv!=1d){nb=QB.1e.2i.Dd(1H.nv)}if(nb==1d){nb=QB.1e.2i.lq(1v.8g)}K 6m=1d;if(28!=1d){6m=28.7i}if(1B(6m)){6m=1v.6m}K q6="";if(!1B(6m)){q6=6m.7z(6m.CK(".")+1)}if(nb==1d){if(1H.5A.1f>0){$.2p(1H.5A,1a(i,f){if(dU(f.7i,q6)){f.dA=1l}})}1j{K 28=1T QB.1e.1U.wh;28.7i=q6;28.dA=1l;1H.5A=[28]}K 1v={1A:1H,9R:9R};J.nJ(e,1v)}1j{nb.6r("lQ",q6,1l,1l)}};J.nJ=1a(e,1v){1v.1A.6y=1l;K 1y=J.bm(1v);K 66=1v.1A;if(1v.9R&&1v.9R.1f>=2){66.X=1v.9R[0];66.Y=1v.9R[1]}K 5B=$(1y).1h("me");if(5B!=1d){66.6C=5B.6C}if(J.2i!=1d){J.2i.1R(QB.1e.2i.2l.Df,1y)}QB.1e.2o.WU(66);QB.1e.2o.6g()};J.Q8=1a(e,1h){K 1y=$(1h);K 66=1y.1h("4C");QB.1e.2o.WW(66);QB.1e.2o.6g()};J.Qm=1a(e,1h){K 1y=$(1h);K 66=1y.1h("4C");QB.1e.2o.WR(66);QB.1e.2o.6g()};J.Qh=1a(e,1h){$(J).1R(J.2l.Sw,1h);QB.1e.2o.sM([1h.1I.1Q()]);QB.1e.2o.Db();$(J).1R(J.2l.SJ,1h)};J.Qk=1a(e,1h){K 4Z=1h.4Z;QB.1e.2o.sM([4Z]);QB.1e.2o.Db();$(J).1R(J.2l.Si,1h)};J.WA=1a(1H,28){K 3n="";3n+=!1B(1H.ni)?1H.ni:1H.3N;3n+="."+28.7i;1b 3n};J.CY=1a(e,1h){QB.1e.2o.WY(1h);QB.1e.2o.6g()};J.WH=1a(66){K $1Z=$("#qb-ui-1Z");if(66[0].91<$1Z.54()||(66[0].9H<$1Z.4Q()||(66[0].91+66.1m()>$1Z.54()+$1Z.1m()||66[0].9H+66.1w()>$1Z.4Q()+$1Z.1w()))){K x=66[0].91+66.1m()/ 2 - $1Z.1m() /2;K y=66[0].9H+66.1w()/ 2 - $1Z.1w() /2;$1Z.4X({54:x,4Q:y},lp)}66.2B(".qb-ui-1H-eK").WE("ks",{},Dc).WE("ks",{},Dc)};J.CZ=1a(e,2k){K ku=QB.1e.2i.Dd(2k.wM);if(ku!=1d){J.WH(ku);1b}K 1v=1d;if(2k.kv==1d){1v={1A:{3v:2k.wM,51:2k.51,cU:2k}}}1j{2k.kv.cU=2k;1v={1A:2k.kv}}J.nJ(1d,1v)};J.D3=1a(e,1h){K 5O=1h.5O;K qR=[];K 3o=[];J.2e.8Q("Dl");1p(K i=0;i<5O.1f;i++){K 28=5O[i];K 4r=28.4r;K 3n=J.WA(28.1P,28.1A);K wo=J.2e.8Q("wp",3n);1p(K j=0;j<wo.1f;j++){K 1I=wo[j];if(4r){if(1I.eL(4r)){3o.1G(1I.1Q())}}1j{if(1I.WC()){if(1I.eL(4r)){3o.1G(1I.1Q())}}1j{3o.1G(1I.1Q());J.2e.8Q("kt",1I)}}}if(4r&&wo.1f==0){K wk=1T QB.1e.1U.Dn;wk.8w=3n;wk.dG=4r;K WM=J.2e.8Q("mM",wk);3o.1G(WM.1Q())}K Dk=1d;1p(K j=0;j<qR.1f;j++){if(28.1P!=1d&&28.1P.51==qR[j].51){Dk=qR[j];1s}}if(Dk==1d){K 1Q=fL({},28.1P);1Q.Yb=1l;QB.1e.2o.3s.2i.9G.1G(1Q)}}J.2e.8Q("D2")};J.bm=1a(1v,6Z){K 1y=QB.1e.2i.bm(1v,6Z);if(6Z===2x||6Z==1d){1y.4K(QB.1e.7N.2l.ri,J.D3,J);1y.4K(QB.1e.7N.2l.qm,J.CY,J);1y.4K(QB.1e.7N.2l.qn,J.CZ,J);1y.4K(QB.1e.7N.2l.qd,J.gT,J)}J.2e.8Q("qH");1b 1y};J.kK=1a(1v,6Z,kB){K 1y=QB.1e.2i.kK(1v,6Z,kB);J.2e.8Q("qH");1b 1y};J.ym=1a(1y){};J.qB=1a(1X){QB.1e.2o.3s.gw.1G("qB");J.D0();J.FG();QB.1e.2o.6g(1X)};J.VZ=1a(1X){QB.1e.2o.3s.gw.1G("qB");J.D0();QB.1e.2o.D4(1d);QB.1e.2o.6g(1X)};J.D0=1a(){QB.1e.2o.3s.7f=1T QB.1e.1U.qz;QB.1e.2o.3s.7f.dL="4w"};J.Qd=1a(){if(J.5H.2b()==J.oW){1b}J.oW=J.5H.2b();J.wZ=1l;J.Qj();$(J).1R(J.2l.F8,J.oW);$(".qb-ui-5H-7W-3e-3E").5p()};J.FG=1a(){K 9a=1d;if(J.5H!=1d&&(J.5H.1f>0&&J.5H.is(":6v"))){9a=J.5H.2b()}1j{9a=J.yr}J.8i=9a;QB.1e.2o.D4(J.8i);1b 1l};J.WP=1a(){QB.1e.2o.3s.av=J.av;1b 1l};J.sv=1a(2g,bB){K me=J;if(!1B(2g)&&2g!=" "){if(bB!==2x){J.bj.3K("9w 5u mD");J.bj.2r(bB)}J.bj.3J(2g);$("#qb-ui-5H-vL").2r("D8").3K("WO")}1j{if($("#qb-ui-5H-vL").4J("D8")){$("#qb-ui-5H-vL").3K("D8").2r("WO")}1j{me.bj.3K("9w 5u mD");me.bj.3J("&2q;")}6W(1a(){me.bj.3K("9w 5u mD");me.bj.3J("&2q;")},9m)}};J.EZ=1a(2g){J.bj.3K("9w 5u");J.bj.2r("mD");J.sv(2g)};J.Y7=1a(2g){J.bj.3K("5u mD");J.bj.2r("9w");J.sv(2g)};J.XT=1a(2g){J.bj.3K("9w mD");J.bj.2r("5u");J.sv(2g)};J.PY=1a(){if(J.wZ){if(QB.1e.2o.oI!=J.5H.2b()){QB.1e.2o.oI=J.5H.2b()}}};J.Ex=1a(e,1A){K 1v={1A:1A};J.nJ(1d,1v)};J.gT=1a(e,aR){K me=J;if(QB.1e.2o.9t>0){6W(1a(){me.gT(e,aR)},100);1b}if(!1B(aR)){J.zc(aR);QB.1e.2o.3s.ek=aR;QB.1e.2o.6g()}};J.Pt=1a(e,42){QB.1e.3D.zi(42)};J.Pi=1a(e,1h){J.jb.gh(1h)};J.Pf=1a(e,1h){J.jb.gh(1h)};J.Qx=1a(5i){if(5i==1d){1b 1k}QB.1e.2i.7y.zp();1p(K 1W=0;1W<5i.1f;1W++){K 8d=5i[1W];K aD=1d;if(8d.5r!=1d&&8d.5y!=1d){aD=QB.1e.2i.7y.z6(8d.5r.aA,8d.5y.aA)}if(aD==1d){QB.1e.2i.7y.rw(8d)}1j{aD.sc=1k;QB.1e.2i.7y.zd(aD,8d)}}QB.1e.2i.7y.za()};J.QP=1a(zH,kN){1p(K j=kN.1f-1;j>=0;j--){K zM=kN[j];if(QB.1e.2i.D5(zH,zM)){1b j}}1b-1};J.QR=1a(zH,kN){1p(K j=kN.1f-1;j>=0;j--){K zM=kN[j];if(QB.1e.2i.D7(zH,zM)){1b j}}1b-1};J.Qw=1a(m8){if(m8==1d){1b}K b9=m8.4d();K kE=[];K kT=[];K Fm=[];K me=J;1p(K i=QB.1e.2i.5X.1f-1;i>=0;i--){K q3=QB.1e.2i.5X[i];K Eh=q3.1h("1A");K 9Z=J.QP(Eh,b9);if(9Z==-1){9Z=J.QR(Eh,b9)}if(9Z==-1){kE.1G(q3)}1j{K Fp=b9[9Z];b9.3M(9Z);if(!Fp.7Q){kT.1G({1Q:Fp,6Z:q3})}1j{kE.1G(q3)}}}$.2p(b9,1a(1W,1Q){Fm.1G(1Q)});$.2p(kT,1a(1W,1y){me.kK({1A:1y.1Q},1y.6Z,1l)});$.2p(kE,1a(1W,ds){QB.1e.2i.ym(ds,1l)});$.2p(Fm,1a(1W,1Q){if(!1Q.7Q){me.bm({1A:1Q})}})};J.QY=1a(eJ,Fn){if(eJ==1d||eJ.1f==0){1b eJ}1p(K j=0;j<Fn.1f;j++){K nQ=Fn[j];K 9Z=-1;1p(K i=0;i<eJ.1f;i++){K nR=eJ[i];if(!1B(nR.6C)&&nR.6C==nQ.6C||(!1B(nR.3v)&&nR.3v==nQ.3v||nR.51==nQ.51)){9Z=i;1s}}if(9Z!=-1){eJ[9Z]=fL(eJ[9Z],nQ)}1j{eJ.1G(nQ)}}1b eJ};J.QL=1a(g9,Fo){if(g9==1d){1b g9}1p(K j=0;j<Fo.1f;j++){K r2=Fo[j];K 9Z=-1;1p(K i=0;i<g9.1f;i++){K r1=g9[i];if(r1.8j==r2.8j&&dU(r1.8w,r2.8w)||dU(r1.8w,r2.8w)&&dU(r1.9e,r2.9e)){9Z=i;1s}}if(9Z!=-1){g9[9Z]=fL(g9[9Z],r2)}1j{if(!r2.7Q){g9.1G(r2)}}}1b g9};J.R6=1a(1h,r){if(!1B(r.8p)&&r.8p.1f>0){if(!1B(r.8p)&&r.8p.1f>0){1h.8p=J.QL(1h.8p,r.8p)}}1b 1h};J.QZ=1a(1h,r){if(!1B(r.eH)){if(1B(1h.eH)){1h.eH={}}1h.eH=fL(1h.eH,r.eH)}if(!1B(r.9G)&&r.9G.1f>0){if(!1B(r.9G)&&r.9G.1f>0){1h.9G=J.QY(1h.9G,r.9G)}}1b 1h};J.FN=1a(lY,1h,bq,7P){if(1B(bq)){1b}K me=J;1p(K i in lY.ga){if(!lY.ga.86(i)){ap}if(i<=bq){ap}K r=lY.ga[i];if(1B(7P)){1h=fL(1h,r)}1j{1h=7P.2J(J,1h,r)}}if(lY.ga.86(bq)){4q lY.ga[bq]}1b 1h};J.Er=1a(e,1h,bq){K 1Z=J.FN(QB.1e.3D.pD.2i,1h,bq,J.QZ);if(1Z==1d){1b}J.Qw(1Z.9G);J.Qx(1Z.7y);if(1Z.eH!=1d){QB.1e.2i.Qr(1Z.eH.eG)}if($("#qb-ui-1Z").is(":6v")){QB.1e.2i.e0()}};J.PQ=1a(e,qw){if(J.iu!=1d){J.iu.Qq(qw)}};J.Q5=1a(e,e2){K me=J;if(1B(e2)){1b}J.kC=e2;if(J.je!=1d){J.je.EB(J.kC)}if(J.iu!=1d){J.iu.Qt(J.kC)}};J.T4=1a(e,1V){if(QB.1e.2i!=1d){QB.1e.2i.eI(1V.2i);QB.1e.2i.QI(1V.QH);QB.1e.2i.QE(1V.aU,1V.QD)}J.2e.8Q("eI",1V.2e);J.eI(1V.kz,"#qb-ui-1Z-aH-gX-3e");J.eI(1V.g0,"#qb-ui-1Z-8X-gX-3e")};J.Q4=1a(e,zt){if(zt==1d){1b}K me=J;K yI=0;if(J.c6.1f>0){yI=J.c6[J.c6.1f-1].Id}1p(K 1W=0;1W<zt.2Q.1f;1W++){K 8U=zt.2Q[1W];if(yI==1d||8U.Id>yI){J.c6.1G(8U);K Ff="XD";if(8U.4R==2){Ff="XC"}if(8U.4R==3){Ff="9T"}K YS=yV(8U.Fl).7p("H:i:s")}}};J.Q6=1a(e,5u){J.po=5u;J.rr="";if(5u!=1d){J.rr=5u.gG}if(5u==1d){1b}if(1B(5u.gG)){1b}K 3E=$(".qb-ui-5H-7W-3e-3E");3E.5p();K 3H=$(".qb-ui-5H-7W-3e-3H");K 8U=\'<2C 2t="vO"><p>\'+5u.gG+"</p></2C>";K 92=\'<2C 2t="8C">\'+\'<2a 1C="3e" 2t="ui-4P-5N" id="5u-8C-go-to-2R" 1o="Go to 5u 2R">\'+\'<2a 1C="3e" 2t="ui-4P-5N" id="5u-8C-9I" 1o="kH i4">\'+\'<2a 1C="3e" 2t="ui-4P-5N" id="5u-8C-n0" 1o="YI yQ to ip d4 i4.">\'+"</2C>";3E.2r("5u");3E.2r("zy");3H.3J("<2C>"+8U+92+"</2C>")};J.Qf=1a(){J.Ry()};J.Qc=1a(){J.5H.2b("");J.xq()};J.Q9=1a(){J.5H.2b(J.R1);J.xq()};J.Em=1a(){K 3E=$(".qb-ui-5H-7W-3e-3E");3E.3K("5u");3E.3K("zy");K 3H=$(".qb-ui-5H-7W-3e-3H");K 8U=\'<2C 2t="vO"><p>\'+QB.1e.1U.3U.4g.Rm+\'</p><2C 2t="vO">\';3H.3J(8U)};J.Ry=1a(){K 5u=J.po;K 3E=$(".qb-ui-5H-7W-3e-3E");3E.3K("zy");3E.3C();if(5u!=1d&&5u.Rx!=1d){K 2a=$("#qb-ui-5H 8s");if(2a.1f!=1){2a=$("#9a-FR")}if(2a.1f!=1){1b}1j{2a=2a[0]}K 3u=5u.Rx.3u;6E{if(2a.ya){2a.3k();2a.ya(3u,3u)}1j{if(2a.q0){K dX=2a.q0();dX.RA(1l);dX.Rz("xY",3u);dX.Rt("xY",3u);dX.2y()}}}6G(e){}}};J.Eq=1a(e,1h,bq){if(1h==1d||1h.8p==1d){1b}K 4k=J.FN(QB.1e.3D.pD.2e,1h,bq,J.R6);if(4k==1d){1b}K me=J;me.2e.8Q("R9",4k);me.2e.8Q("R2")};J.T5=1a(e,9a){if(7I(e)=="4E"&&9a===2x){9a=e}if(9a!==" "&&1B(9a)){1b}J.5H.2b(9a);J.oW=J.5H.2b();J.yr=9a;J.8i=9a;QB.1e.2o.oI=9a;J.Em();if(1B(J.rr)){$(".qb-ui-5H-7W-3e-3E").3C()}if(!1B(9a)){J.R1=9a}};J.PT=1a(e,a4){if(1B(a4)){1b}if(J.8A==1d){1b}J.8A.gh(a4)};J.Yc=1a(1X){J.FH(1a(1h){if(1X&&7I(1X)=="1a"){1X(1h.gI)}})};J.Yh=1a(1D,1X){QB.1e.2o.3s.gI=1D;1b QB.1e.2o.zF(1X)};J.FX=1a(FY,FT){};J.Ei=1a(e,1h){$(J).1R(J.2l.FB,1h);K 1I=1h.1I;K 1r=1h.1r;K 6k=1h.6k;K 4z=1h.4z;K 3o=[];K 4Z=1I.1Q();4Z.Ri=1h.ij;4Z.FV=1r;4Z.FC=4z;if(1I.7Q){K 3n=4Z.8w;if(!1B(3n)&&3n.5e(".")!=-1){K 8g=3n.7z(0,3n.5e("."));K 6m=3n.7z(3n.5e(".")+1);K 1H=QB.1e.2i.lq(8g);if(1H!=1d){1H.6r("lQ",6m,1k)}}}3P(1r){1q 1S.2n.1Y:K 3n=4Z.8w;if(!1B(3n)&&3n.5e(".")!=-1){K 8g=3n.7z(0,3n.5e("."));K 6m=3n.7z(3n.5e(".")+1);K 1H=QB.1e.2i.lq(8g);if(1H!=1d){1H.6r("lQ",6m,4z)}}3o.1G(4Z);1s;1q 1S.2n.3n:K 1Y=4Z.dG;if(1B(6k)&&6k!=4z){1Y=1l;4Z.dG=1l}K 3n=6k;if(!1B(3n)&&3n.5e(".")!=-1){K 8g=3n.7z(0,3n.5e("."));K 6m=3n.7z(3n.5e(".")+1);K 1H=QB.1e.2i.lq(8g);if(1H!=1d){1H.6r("lQ",6m,1k)}}3n=4z;if(1Y&&(!1B(3n)&&3n.5e(".")!=-1)){K 8g=3n.7z(0,3n.5e("."));K 6m=3n.7z(3n.5e(".")+1);K 1H=QB.1e.2i.lq(8g);if(1H!=1d){1H.6r("lQ",6m,1Y)}}3o.1G(4Z);1s;1q 1S.2n.9x:;1q 1S.2n.7G:K FE=J.2e.8Q("Rh");1p(K i=0;i<FE.1f;i++){3o.1G(FE[i].1Q())}1s;5N:3o.1G(4Z)}QB.1e.2o.sM(3o);QB.1e.2o.6g();$(J).1R(J.2l.aF,1h)};J.Fz=1a(7B){if(7B==1d||7B.1f==0){1b 1d}K 1J={};K 5I;1p(K i=0;i<7B.1f;i++){5I=7B[i];if(5I.3N!=1d&&5I.3N.7z(0,1)=="-"){1J[5I.db]=5I.3N}1j{1J[5I.db]={1x:5I.3N,3V:5I.db,1J:J.Fz(5I.2Q),1h:5I.3v}}}1b 1J};J.eI=1a(1V,6A){K me=J;if(1B(1V)||1V.2Q.1f==0){1b}K 1J=J.Fz(1V.2Q);K $6A=$(6A);if($6A.1f>0){$6A[0].Re=0}$6A.d1().1n("Re",0).8h(1a(e){if(e.3Z==13||e.3Z==32){$(e.3g).1R("3F")}});$.2P("6F",6A);$.2P({4s:6A,4u:aQ,7n:{5C:0},1X:1a(42,1v){K 1i=1d;6E{1i=1v.$1Y.1h().2P.1J[42]}6G(e){}6W(1a(){me.En(J,{42:42,1i:1i})},0)},1J:1J});$6A.3F(1a(){$(6A).2P();$1V=$(6A).2P("1g");if($1V){$1V.2R({my:"2f 1M",at:"2f 4O",of:J})}})};J.Yz=1a(1X){if(J.8A.l3()){J.8A.6g(1X);1b 1l}1j{1b 1k}};J.Rb=1a(1X){QB.1e.2o.6g(1X)};J.YB=1a(1X){J.zc(QB.1e.2o.ln);QB.1e.2o.3s.ek=QB.1e.2o.ln;QB.1e.2o.6g(1X)};J.YE=1a(1X){QB.1e.2o.3s.8A=1d;QB.1e.2o.6g(1X)};J.Qg=1a(1X){$(".qb-ui-5H-7W-3e-3E.5u").2r("zy")};J.xq=1a(1X){$(".qb-ui-5H-7W-3e").2r("Ra");J.xC(1a(){$(".qb-ui-5H-7W-3e").3K("Ra");if(1X&&7I(1X)=="1a"){1X()}});1b 1k};J.xC=1a(1X){J.rr="";J.FG();QB.1e.2o.6g(1X);$(J).1R(J.2l.FF);1b 1k};J.FH=1a(1X){K me=J;if(J.9t<0){J.9t=0}if(J.9t>0){6W(1a(){me.FH(1X)},100);1b}J.xC(1X)};J.7R=1a(1X){QB.1e.2o.7R(1X)};J.mP=1a(1X){QB.1e.2o.mP(1X)};J.8Z=1a(){nA=!($(".fs").1n("nA")===2x);if(!nA){J.TJ()}QB.1e.2o.aT=$(".fs").1n("aT");QB.1e.2o.wm=$(".fs").1n("wm")=="1l";FI=$(".fs").1n("PA")=="1l";EH=$(".fs").1n("YR")=="1l";J.rS=$(".fs").1n("rS")=="1l";K Ez=$(".fs").1n("Yf");if(!1B(Ez)){s5=Ez}J.vZ=$("#qb-ui-1Z").4J("vZ");K me=J;J.c6=[];J.c5=1k;if(!J.rS){$.7W(s5+"?42=YX&YP="+QB.1e.2o.aT,vK,1a(1h){})}J.bj=$("#qb-ui-5H-vL-vO");J.2e=$("#qb-ui-4k").8Q();J.F7=J.2e.8Q("gA");QB.1e.2i.8Z();J.2i=QB.1e.2i!=1d?QB.1e.2i.1Z:1d;if($(".qb-ui-3I").1f){J.jb=1T QB.1e.7f;J.7f=J.jb.wa();J.7f.4K(QB.1e.7f.2l.iC,J.Ex,J);QB.1e.2o.ea.2S(QB.1e.2o.ea.2l.6J,J.Pi,J)}1j{if($(".qb-ui-3I-qA").1f){J.jb=1T QB.1e.e3;J.7f=J.jb.wa();J.7f.4K(QB.1e.e3.2l.iC,J.Ex,J);QB.1e.2o.iB.2S(QB.1e.2o.iB.2l.6J,J.Pf,J)}}J.je=1d;J.iu=1d;if(Pe){J.je=1T QB.1e.jd;J.iu=1T QB.1e.95;J.95=J.iu.3r}if(J.je!=1d){J.jd=J.je.EB();J.jd.4K(QB.1e.jd.2l.w5,J.gT,J)}if(J.95!=1d){J.95.4K(QB.1e.95.2l.w1,J.gT,J);J.95.4K(QB.1e.95.2l.w2,J.Pt,J)}J.5H=$("#qb-ui-5H 8s");if(EH){J.5H.1n["EG"]="EG"}if(!EH){J.5H.4K("qW 4W qW 2a XS",J.Qd,J);$("#qb-ui-5H-8C-7W").4K("3F",J.xC,J)}$("#qb-ui-5H-8C-mP").4K("3F",1a(){QB.1e.2o.mP()},J);$(".qb-ui-5H-7W-3e-3E").3C();$(".qb-ui-5H-7W-3e").4K("3F",J.xq,J);$(".qb-ui-5H-7W-3e").4K("mN",J.Qg,J);$(2K).on("3F","#5u-8C-go-to-2R",1a(){me.Qf();1b 1l});$(2K).on("3F","#5u-8C-9I",1a(){me.Qc()});$(2K).on("3F","#5u-8C-n0",1a(){me.Q9()});J.Em();if(J.2i!=1d){J.2i.4K(QB.1e.2i.2l.xR,J.nJ,J);J.2i.4K(QB.1e.2i.2l.x5,J.Q8,J);J.2i.4K(QB.1e.2i.2l.wT,J.Qm,J);J.2i.4K(QB.1e.2i.2l.xm,J.Et,J);J.2i.4K(QB.1e.2i.2l.xk,J.En,J);J.2i.4K(QB.1e.2i.cU.2l.rs,J.Qp,J)}J.2e.4K(QB.1e.2e.2l.aF,J.Ei,J);J.2e.4K(QB.1e.2e.2l.Ek,J.Qh,J);J.2e.4K(QB.1e.2e.2l.Eo,J.Qk,J);J.2e.4K(QB.1e.2e.2l.xd,J.nJ,J);J.2e.4K(QB.1e.2e.2l.xf,J.Et,J);J.Qj=$.ih(J.PY,lp,J);J.8A=1T QB.1e.8A;QB.1e.2o.95.2S(QB.1e.2o.95.2l.6J,J.PQ,J);QB.1e.2o.2e.2S(QB.1e.2o.2e.2l.6J,J.Eq,J);QB.1e.2o.2i.2S(QB.1e.2o.2i.2l.6J,J.Er,J);QB.1e.2o.8A.2S(QB.1e.2o.8A.2l.6J,J.PT,J);QB.1e.2o.2S(QB.1e.2o.2l.xh,J.Q5,J);QB.1e.2o.2S(QB.1e.2o.2l.wV,J.Q4,J);QB.1e.2o.2S(QB.1e.2o.2l.wU,J.Q6,J);QB.1e.2o.2S(QB.1e.2o.2l.wO,J.T4,J);QB.1e.2o.2S(QB.1e.2o.2l.wQ,J.T5,J);QB.1e.2o.ea.2S(QB.1e.2o.2l.x6,1a(e,1h){J.EZ(QB.1e.1U.3U.4g.Th)},J);QB.1e.2o.2S(QB.1e.2o.2l.6J,1a(e,1h){if(1B(1h)){1b}J.wZ=1k;J.eF=1h.eF;if(!1B(1h.av)){J.av=1h.av}if(!1B(1h.gI)){J.gI=1h.gI}if(!1B(1h.8N)){J.8N=1h.8N;if(!1B(1h.8N.Tj)&&!1h.8N.Tj){$("#qb-ui-1Z-aH-F0-ST").3C()}if(!1B(1h.8N.Tc)&&!1h.8N.Tc){$("#qb-ui-1Z-aH-Yo-ST").3C()}me.2e.8Q("SY")}if(!1B(1h.iQ)){J.iQ=1h.iQ}J.sv(1h.gG.bl,1h.gG.6N)},J);QB.1e.2o.ea.2S(QB.1e.2o.ea.2l.ie,1a(e,1h){K F5=$("#e4-8k",1P.2K.3G);if(F5.1f){F5.3C()}},J);$(".ft-1R","#qb-ui-1Z-aH").3F(1a(){me.SX()})};J.Yu=1a(){J.F7.xO()};J.SX=1a(6v){if(6v==2x){$(".ft-5J","#qb-ui-1Z-aH").8L("ft-4P-im ft-4P-aZ");1b}if(6v){$(".ft-5J","#qb-ui-1Z-aH").3K("ft-4P-aZ").2r("ft-4P-");$("#qb-ui-1Z-aH").2r("TK")}1j{$(".ft-5J","#qb-ui-1Z-aH").3K("ft-4P-im").2r("ft-4P-aZ");$("#qb-ui-1Z-aH").3K("TK")}};J.gB=1a(7X){1b 6o(7X.3t(/(\\.|^)(\\d)(?=\\.|$)/g,"$10$2").3t(/(\\d+)\\.(?:(\\d+)\\.*)/,"$1.$2"))};J.TJ=1a(){if($(".fs").1f==0){1b}if(7I(TL)=="2x"){eY(TF)}if(!($&&($.fn&&$.fn.fJ))){eY(F3)}if(!($&&($.fn&&$.fn.fJ))){eY(F3)}1j{if(J.gB($.fn.fJ)<J.gB(EL)||J.gB($.fn.fJ)>J.gB(TH)){eY(TU.3t("$1",$.fn.fJ).3t("$2",EL))}}if(!($&&($.ui&&$.ui.6P))){eY(TO)}1j{if(J.gB($.ui.6P)<J.gB(EI)||J.gB($.ui.6P)>J.gB(TQ)){eY(TB.3t("$1",$.ui.6P).3t("$2",EI))}}if($&&($.fn&&$.fn.fJ)){if($.fn.ck===2x){eY(S9)}}};J.RI=1a(){1b QB.1e.3D.xE};J.ED=1a(){K EO;K EP=0;1p(K i=0;i<QB.1e.3D.mG.1f;i++){K 1g=$("*[1M-8O-id="+QB.1e.3D.mG[i]+"]");K ER=6o($(1g).7s(".qb-ui-1H:eq(0)").2U("z-1W"));if(ER>EP){EP=ER;EO=1g}}1b EO};J.RB=1a(el){QB.1e.3D.mG.1G(QB.1e.3D.xz);$(el).1n("1M-8O-id",QB.1e.3D.xz);QB.1e.3D.xz++;QB.1e.3D.xE=J.ED()};J.RE=1a(el){K 2R=QB.1e.3D.mG.5e(6u($(el).1n("1M-8O-id")));QB.1e.3D.mG.5W(2R,1);QB.1e.3D.xE=J.ED()};J.Ew=1a(){QB.1e.3D.mG=1T 3R;QB.1e.3D.xE=1d;QB.1e.3D.xz=0};J.2l={RS:"RS",RR:"RR",F8:"F8",FF:"FF",FB:"FB",aF:"aF",Sw:"aF",SJ:"aF",Si:"aF"};QB.1e.XQ=J.2l;J.eW={gX:\'<3b 2t="3b--gX" fZ="6s://dC.w3.e9/iv/3b" 1m="16" 1w="16" jW="0 0 16 16"><5c>5F-1H</5c><1K d="M2.Sm XR.Sl 1 1 1.7 1 2.XP.XY 14.3 1.Sl 15 2.Sm 13p.13q.3 15 15 14.3 15 13.13o.13m 1.7 14.3 1 13.PV 13n.13r" 2d="#VB"/><1K d="CH 13v" 2d="#qh"/></3b>\',Sj:\'<3b 2t="3b--13u-13s" fZ="6s://dC.w3.e9/iv/3b" 1m="16" 1w="16" jW="0 0 16 16"><5c>13t</5c><g 2d="3q" 2d-rJ="s8"><1K d="M-110-13l-zw"/><1K d="CH.13d 8.13e.RT-.192.i5-.13c.i5-.RU 0-.13a-.sm-.S1-.i5-.Tm.wy-.DV.114-.r4.144-.E8.jY-.TP-1.2-2.wE-.jY-.132-.RZ-.18-.m0-.S6-1.pt.6c-.Tw-.24-.Tx-.Tv-1.iM-.vR-.oq-1.13b.QW 2.108 9.188 2 9.13g 2h-2.4c-.15 0-.TC.108-.jZ.Tn-.oq 1.Dv-.m0.15-.To.Tl-1.iM.vR-1.pt-.6c-.138-.rG-.jZ 0-.m0.S6-1.2 2.wE-.13O.132-.i5.jZ.jY.RY.wy.DV-.RT.192-.i5.39-.i5.RU 0 .198.sm.S1.i5.vR-1.wy.DV-.114.r4-.144.E8-.jY.RY.2 2.wE.jY.132.RZ.18.m0.Ts.pt-.6c.Tw.24.Tx.Tv 1.iM.vR.oq 1.Dv.sm.144.144.E8.jZ.13M.4c.15 0 .TC-.108.jZ-.Tn.oq-1.Dv.m0-.15.To-.Tl 1.iM-.Tm.pt.6c.138.rG.jZ 0 .m0-.Ts.2-2.wE.jY-.132.i5-.jZ-.jY-.TP-1.wy-.13K.13L 10.1c-1.158 0-2.1-.wA-2.1-2.1 0-1.158.wA-2.1 2.1-2.1 1.158 0 2.1.wA 2.1 2.1 0 1.158-.wA 2.1-2.1 2.1z" 2d="#qh"/></g></3b>\',TG:\'<3b 2t="3b--4q" fZ="6s://dC.w3.e9/iv/3b" 1m="16" 1w="16" jW="0 0 16 16"><5c>13T</5c><g 2d="3q" 2d-rJ="s8"><1K d="M-110-13U-zw"/><1K d="13S 3.13Q.mu 1 8 5.mu 3.wJ 1 1 3.wJ 5.mu 8 1 12.mu 3.wJ 15 8 10.wJ 12.mu 15 15 12.mu 10.13B 8 15 3.13C" 2d="#qh"/></g></3b>\',SU:\'<3b 2t="3b--SV" fZ="6s://dC.w3.e9/iv/3b" 1m="16" 1w="16" jW="0 0 16 16"><5c>13z</5c><g 2d="3q" 2d-rJ="s8"><1K d="M-110-13D-zw"/><1K d="M2 11.13I.13G.13E.zz-7.13F-2.5-2.12C 11.12B.12z-6.12A.26-.26.26-.68 0-.12E-1.56-1.12H-.26-.26-.68-.26-.94 12F-1.22 1.22 2.5 2.5 1.22-1.12G" 2d="#qh"/></g></3b>\',Q0:\'<3b 2t="3b--2k" 1m="16" 1w="16" jW="0 0 16 16" fZ="6s://dC.w3.e9/iv/3b"><5c>12y</5c><g 2d="3q" 2d-rJ="s8"><1K d="M-110-12q-zw"/><1K d="12r.3 7.12p-.15-.Rw-.36-.65-.12n-.Rl-.59-.12o-.12s-.Rj-.Do.12w-.CO.CO-.3.3c-.Rk.Rn-.103.115-.144.178.Rq.12x.77.187 1.rG.47.12v.CG.PV.67.47 1.od.iM.12t-.12K.131-.yS.63-.12Z.oq-.2.Qz-.QA.12X-.iM.sm-.34.34-.nz.nz-.44.44-1.147 1.QG-.31.31-.Ej.48-1.162.48-.44 0-.133-.17-1.162-.48-.31-.31-.48-.Ej-.48-1.162 0-.44.17-.85.48-1.12O.15-1.15c-.12P-.QU-.114-.41-.143-.QV-.QS-.156-.q8-.12L-.q8-.nz-.Qy-.29.H2-.58.1-.12M-2.r4 2.12Q-1.tn 1.QJ-1.tn 3.16 0 4.12U.Pj.Pj 1.39.Pk 2.18.Pk.79 0 1.58-.3 2.182-.12V.12T-2.r4.31-.Rf.18-.177.12R-.zz.R4-.58.197-.12S.33-.151.R5-1.H2.H2-.186.od-.zz.od-.152 0-.23-.R7-.46-.yS-.Ru-.Rv-.195-.106-.14Z-.19-.14X.14Y-4.153.pt 2.3 11.159 2 10.15a 2c-.79 0-1.58.3-2.183.154.14O 4.14P-.31.Rf-.18.18-.14N.U4-.R4.58-.197.14M-.33.14Q-.R5 1.q8-.14U.186-.od.zz-.od.14V 0 .23.R7.46.yS.Ru.Rv.196.106.14T.19.14R.15.Rw.15s.65.15t.Rl.59.15u.15y.Rj.Do-.Do.29-.CO.15z-.3c.Rk-.Rn.103-.116.144-.18-.Rq-.15x-.77-.185-1.rG-.47-.CG-.CG-.15v-.67-.47-1.rG-.iM-.15w.15o-.15g.yS-.15h.15f-.15d.198-.Qz.QA-.15e.iM-.sm.34-.34.nz-.nz.44-.44 1.147-1.QG.31-.31.Ej-.48 1.163-.48.44 0 .85.17 1.16.48.Qu.64.Qu 1.14e.Qy 2.14c-1.15 1.15c.14d.QU.113.41.142.QV.QS.156.q8.QW.q8.nz.14l.29-.14k.58-.1.14j.r4-2.14b.tn-1.QJ 1.tn-3.16 0-4.13Z" 2d="#qh"/></g></3b>\',ty:\'<3b 2t="3b--140-qe" fZ="6s://dC.w3.e9/iv/3b" fZ:dB="6s://dC.w3.e9/QO/dB" 1m="Wr" 1w="Wr" jW="0 0 16 16" 6P="1.1"><5c>141</5c><rI>WL iL 14a.</rI><ee/><g id="146-1" 2m="3q" 2m-1m="1" 2d="3q" 2d-rJ="s8"><4I id="14A" x="-110" y="-14F" 1m="14K" 1w="14z"/><1K d="M1,3.pR C1,1.W9 1.WV,1 3.pR,1 14q.v1,1 14o.Wd,1 15,1.WV 15,3.pR 14p,12.v1 14t,14.Wd 14.W7,15 12.v1,15 L3.pR,15 C1.W9,15 1,14.W7 1,12.v1 L1,3.pR Z M6.Uk,10.Im C6.109,9.10a 6.10e,9.10i 7.10j,8.10f C7.10g,8.ZZ 7.101,8.10k 8.10A,7.10B C8.10x,7.10C 8.10G,7.10H 8.10F,6.10D C8.10E,6.10w 8.Fe,6.10o 8.Fe,5.10p C8.Fe,5.10n 8.10l,5.10m 8.10q,4.10u C8.10v,4.10t 8.10r,4.u0 7.UY,4.u0 C7.Zn,4.u0 7.Zo,4.Zm 7.Zk,4.Zl C7.Zt,4.Zu 7.Zs,5.Zq 7.Zr,5.UI L5.Zj,5.UI L5.Zc,5.Za C5.Zi,4.Zg 5.Ze,4.Zf 5.Zv,3.ZL C6.ZO,3.ZP 7.ZA,2.DY 7.UY,2.DY C8.Zy,2.DY 9.Zw,3.Zx 10.ZB,3.ZF DK.ZG,4.ZE 10.Dr,4.ZD 10.Dr,5.11U DK.Dr,6.11V 10.11T,6.11R 10.u0,7.11S DK.11K,7.11C 9.11D,8.11z 9.U4,8.11I C9.11H,8.11F 8.11G,9.11W 8.12e,9.12f C8.12d,9.12b 8.Ud,9.12c 8.Ud,10.Im L6.Uk,10.Im Z M8.I6,13 L6.Uh,13 L6.Uh,11.VH L8.I6,11.VH L8.I6,13 Z" id="11Z-11Y" 2d="#VB"/></g></3b>\'}};if(!3z.d5){3z.d5={}}if(!3z.d5.mK){3z.d5.mK=1a(){}}if(!3z.d5.IG){3z.d5.IG=1a(){}}K nn;K mS=1d;K uC=0;1a IK(){if(uC==1d){uC=0}1b uC++}2I(2K).125(1a(){$.fn.d1=$.fn.3e;if($.fn.3e&&$.fn.3e.VW){K W1=$.fn.3e.VW();$.fn.d1=$.fn.3e;$.fn.3e=W1}QB.1e.3D=1T 3D;QB.1e.3D.8Z();nn=QB.1e.3D;W2();nn.VZ()});$.ui.7j.3f.10Q=1a(1N,u2){J.2R=J.V1(1N);J.V2=J.V7("7U");if(J.1v.Hv){if(J.1v.5T){J.1v.5T()}}1j{if(!u2){K ui=J.gn();if(J.9q("5T",1N,ui)===1k){J.V8({});1b 1k}J.2R=ui.2R}}if(!J.1v.bu||J.1v.bu!="y"){J.45[0].2G.2f=J.2R.2f+"px"}if(!J.1v.bu||J.1v.bu!="x"){J.45[0].2G.1M=J.2R.1M+"px"}if($.ui.gk){$.ui.gk.5T(J,1N)}1b 1k};$.ui.7j.3f.11r=1a(1N,u2){if(J.11s){J.2v.1P=J.11q()}J.2R=J.V1(1N,1l);J.V2=J.V7("7U");if(J.1v.Hv){if(J.1v.5T){J.1v.5T()}}1j{if(!u2){K ui=J.gn();if(J.9q("5T",1N,ui)===1k){J.V8({});1b 1k}J.2R=ui.2R}}J.45[0].2G.2f=J.2R.2f+"px";J.45[0].2G.1M=J.2R.1M+"px";if($.ui.gk){$.ui.gk.5T(J,1N)}1b 1k};2I.fn.11n=1a(bt){K 1g=J;if(!1g){1b}K 3g=$(1g);if(3g.is(":6v")==1k){1b 1k}bt=$(bt||3z);K 1M=bt.4Q();K bU=1M+bt.1w();K HJ=3g.2v().1M;K Vw=HJ+3g.1w();1b Vw<=bU&&HJ>=1M};1a 11g($aP){K nP=$(3z).4Q(),ok=nP+$(3z).1w(),1M=$aP.2v().1M,4O=1M+$aP.7g(1l);1b 1M>nP&&1M<ok||(4O>nP&&4O<ok||(nP>=1M&&nP<=4O||ok>=1M&&ok<=4O))}1a Vo(1g){K 2v=0;4x(1g){2v+=1g["9H"];1g=1g.fD}1b 2v}K Vj=1a(el,Vi){K 1M=el.sa().1M,4I,el=el.3l;do{4I=el.sa();if(1M<=4I.4O===1k){1b 1k}if(el==Vi){1b 1l}el=el.3l}4x(el!=2K.3G);1b 1M<=2K.9k.mc};1a 11k(tx){if(!tx){1b 1k}K H8=Vo(tx);K Vl=H8+tx.9n;K rb=0;if(2K.9k.4Q){rb=2K.9k.4Q}1j{rb=2K.3G.4Q}K SN=rb+3z.kQ;1b Vl>=rb&&H8<=SN};',62,4729,'|||||||||||||||||||||||||||||||||||||||||||||this|var||||||||||||||||||||||||||function|return||null|Web|length|element|data|item|else|false|true|width|attr|value|for|case|key|break||node|options|height|name|obj||object|isEmpty|type|params||res|push|table|row|items|path|opt|top|event|result|parent|dto|trigger|MetaData|new|Dto|menu|index|callback|selected|canvas|||||||||field||input|val||fill|Grid|left|text||Canvas|_|link|Events|stroke|FieldParamType|Core|each|nbsp|addClass|attrs|class|span|offset|args|undefined|select||typeof|find|div|root|out|arguments|style|self|jQuery|call|document|from|paper|Enum|disabled|contextMenu|Items|position|bind|option|css|anim|context|opacity|append|values|||||||||||start|svg||font|button|prototype|target|that|settings|eve|focus|parentNode|doc|expression|rows|bbox|none|control|ExchangeObject|replace|pos|Guid|apply|match|elproto|window|Math|next|hide|Application|container|click|body|label|tree|html|removeClass|selectmenu|remove|Name|cell|switch|has|Array|split|dialog|Localizer|icon|prev|color|toString|keyCode|||action|filter||helper||||toLowerCase|clr|math||slice|concat|elem|Strings|method|toFloat|transform|grid|size|appendChild|appendTo|max|rgb|delete|checked|selector|array|zIndex|Utils|get|while|gradient|newValue|first|Str|metaDataObject|extend|string|raphael|abs|preventDefault|rect|hasClass|bindEx|src|arg|tableDnD|bottom|state|scrollTop|Type|editControl|display|events|deg|blur|animate|hitarea|rowDto||Caption||Parent|scrollLeft|||diff|||toFixed|matrix|title|end|indexOf|resizable|Object|_engine|links|columnWidths|url|arrows|round|criteria|builder|show|column|Left|_key|handle|error|list|children|join|Right||Fields|href|duration|CLASSES|mmax|add|animationElements|editor|dtoItem|block|contextmenu|constructor|newIndex|default|fields|box|_editControl|win|removed|drag|set|dots|splice|Objects|Date|uiDialog||String|resize||||dataSource|||mdo|Value1|pathArray||hidden|min|separator|sendDataToServer|auto|rowChanged|not|oldValue|rotate|fieldName|close|Number|aria|cells|qbtable|http|current|parseInt|visible|len|stop|IsNew|clone|menuSelector|easing|TempId|p1x|try|destroy|catch|Column|condition|DataReceived|KindOfField|tagName|vml|Class|textControl|version|pow|Criteria|mmin|wrapper|tabindex|_parent|setTimeout|stopPropagation|prop|existingObject||count|c1x|all|c1y||clip||paperproto||currentTarget|newelement|layer|hex|p1y|Tree|outerHeight|point|NameStr|draggable|mouseup|status|CriteriaBuilderConditionOperator|animation|zoom|format|config|defaultWidth|parents|getBBox|hover|att|ConditionOperator|subQueries|Links|substr|operation|menuItems|__set__|temp|pageX|open|sortingOrder|setproto|typeOf|dot|subElement|bbox2|bbox1|TableObject|header|handler|IsDeleted|update|now|mousedown|absolute|c2x|refresh|str|last|ValueKinds||scale|c2y|implement|Value2||hasOwnProperty|insertBefore|getValue|pageY|removeChild|outerWidth|names|linkDto|newObject|guid|tableName|keydown|SQL|Index|overlay|p2y|lineCoord|angle|p2x|Rows|Visible|dragi|textarea|right|buildElement|Operator|Expression|RequestID|currentTrigger|widget|CriteriaBuilder|ValuesCount|controls|pth|firstChild|_g|setValue|cache|crp|create|JoinType|toggleClass|ret|SyntaxProviderData|droppable|dirty|QBGrid|_editBlock|active|tmp|msg|graphics|unbind|subquery|targ|init||offsetLeft|buttons|keys||NavBar|throw||nodeName||sql|_ulwrapdiv|colspan|path2|Alias|selectOptionData|DrawOrder|checkbox|toUpperCase|family|documentElement|command|1E3|offsetHeight|_optionLis|skew|_trigger|percents|maxHeight|Lock|selectDto|cellName|warning|sorting|scroll|test|containment|isNaN|defaultHeight|columns|pathString|build|DataSources|offsetTop|clear|sin|destX|parentObject|expandable|vector|360|bez1|nameFull|coordinates|_value|Error|rad|colgroup|bez2|All|radio|foundIndex|valueElement1||||criteriaBuilder|cos|forEach|found|timer|maxWidth|face|customAttributes|image|matches|bg_iframe|par|tabbable|circle|contextMenuRoot|nodeParent||selects|||mooType|continue|caller||||matrixproto|QueryProperties||||namespace|FieldGuid|touch|alias|existingLink|actualF|GridOnRowChanged|valueHTML|navbar|jPag|ctx|Function|cellIndex|menus|red|JunctionType|ele|6E3|unionSubQuery|hasScrollY|SessionID|Table|define|objectBorder|dasharray|objectLayout|collapsed|fieldsContainer|headerCell|SmartPush|Element|colour|checkTrigger|path1|elements|toInt|newObjects|JunctionItemType||trg|corner||floor||amt|mousemove|statusBar|Server|Text|addObject|defaults|EditableSelectStatic|el2|requestID||proxy|scope|axis|dragObject|sqrt|||weight|wrapperId|cssClass|map|force|u3000|hasChanges|factory|u2001|blue|u2008|u2006|Condition|u2000|u2007|tt1|u200a|ellipse|u2028|setAttribute|u180e|bot|con|edit|u2004|graph|Extends|hasExpressionBuilder|||u202f|u2005|loaded|Messages|navigator|hoveract|u2002||meshX|u2003|u205f||total|source|u1680|||valEx|ConditionSubQueries|tstr|charAt||methods|x0b|percent|||x0a|line|Aggregate|||x09|arrow|Raphael|meshY|isArray|minHeight|aggregate|xa0|ExpressionSubQueries|x0c|u2009|x0d|namespaces|x20|green|u2029|fit|cnvs|headerCells|isFunction|clientY|Link|toggle|contains|getRGB|inFocus|getPath|clientX|jQButton||filtredItems|previous|console|counter|editable|tableDnDConfig|group|className|Key|Prefix||scrollY||initialize|_cellEditEnd|||rec|getKeyName|content|groupingCriterion||change|pathClone|number||current_value|cacher|_selectedOptionLi|markerCounter|||titleBar|IsSelected|xlink|www|collapsable|shift|selectedIndex|Select|Path|currentTable|headerRow|instances|Action|icons|glow|addEventListener|getTotalLength|loading|scrollable|thisObject|addArrow|strcmp|dialogId|subkey|range|order|Inner|redraw|times|queryStructure|TreeView|iframe|createNode|parseFloat|createElement|pattern|org|MetadataTree|parentNameFull|shape|textpath|defs||000|RegExp|img|fillpos|ActiveUnionSubQuery||||DatasourceGuid|tbody||overflow||queue|json||empty|Postfix|eventName|linecap|direction|token|itemsPageSize|getElementsByTagName||SyntaxProviderName|Active|Layout|updateContextMenu|dsList1|titlebar|check|marker|grouping|pop|fontSize|linkBox|editableSelectOverlay|tt2|fonts|thead|None|svgContainer|currentPage|alert|SVG|nextIndex|||maxZ|down|move|hasScroll|Animation|_viewBlock|tolerance|setFillAndStroke|caption|JSON|stopImmediatePropagation|minWidth|Field|itemsElement|Description|Outer|tlen|optionDto|over|properties||attrs2|scrollTo|activeItem|ActiveDatabaseSoftware|QueryBuilderControl|collapsible|valueNumber|off|alpha|||Data|isInput|mouseout|listeners|offsetParent|valueElement2|originalEvent|ids|_events|Value1IsValid|jquery|_drag|mergeObj|property1|Matrix|results|a_css|hover_css|arr|scrollHeight||NameFull|handles|newDatasourceDto|methodname|getTimezoneOffset|xmlns|Add|myAt|to2|property2|time|property3|getDate|selectElement|instanceof|rows1|Requests|Cancel|linkedObject|bgiframe|userAgent|tableBox|scrollX|importData||200|ddmanager|docElem|UnionSubQuery|_uiHash||round1000|subItem|Filter|inver||255|Width|Actions|trueIndex|support|resized_widths|instance|versionToNumber|_getWidth|sib|scaley|CriteriaBuilderItemType|Message|pathi|QueryParams|SortType|BeforeCustomEditCell|_moveFocus|location|insertAfter|hasSubQuery|easyeasy|CustomEditButtons|ContextMenu|wait|onTreeStructureClick|marked|isEnd|IsLoaded|plus|getPrevTabbable|getNextTabbable|dialogs|UseCustomExpressionBuilder|visibleMenu|filtered|border|showFields|Boolean|Value2IsValid|onSelect|Delete|longclick|substring|Height|oRec|pRec|innerSize|clearTimeout|updateElement|mouseover|offsetWidth|getElementById||objectGuid|LinkExpression|guidHash|delay|FIXED_GRID|||GridRow|additionalItems|menuCallback|justCount|||tooltip|intr|curve|paths|sticky|isResizable|filteredUi|itemDto|Numeric|_isNullorUndefined|Not|Unknown|oldObj|buildItems|getRec|precision|sort|origin|actual|updateTable|equal|obj1|glyphs|obj2|_viewBox|bb1|overloadSetter|visibility|||realPath|query|042|milli|accesskeys|translate|setViewBox|curr|QBWebCoreBindable|toJSON||Loaded|||debounce||afterCustomEdit|col|dirtyT|expanded||simulateMouseEvent|the|computedStyle|isURL|||NavBarComponent|2000|classes||animated|getHours|cssText|MetadataTreeView|TreeDoubleClickNode|isDropDown|scalex|keyStop|userEdit|attrType|bb2|thisLi|tspan|with|014|CriteriaBuilderJunctionItemType|Supported||QueryTransformerSQL|shear|ObjectType|role|nextItem|dstyle|objectType|dropdown|linejoin|keypress|ValueKind|_typeAhead_chars|_getTotalWidthStatic|ceil|QueryStructureContainer|module|optionClasses|_setWidth|jsp|listWrap|_getInnerTable|TreeComponent|attributes|TreeStructure|treeStructure|onload|current_event|indexed|filterChangeRoutine||eldata|newClass|cur|touches|getDto|VisiblePaginationLinksCount|attachEvent|pane||markedMeshCells|CssClass|getFormat|redrawT|fillsize|strings|isInAnim|selectable|collision|fillString|originalSize|nextSibling|__args|from2|DataSourceDto|recursive|filteredItemsElement|closest|AffectedColumns|VML|lastExpandable|replaceClass|branches|lastCollapsable|fun|instantEdit|base|totalOrigin|DataSourceType|viewBox|_global_timer_|072|294|Grouping|itemsListIncomplete|opts|asterisk|mousePos|sub|dialogTarget|prevItem|currentRow|orColumnCount|thefont|margin|updateTableHeader|globalFieldDragHelper|_ul|CurrentEditCell|goto|path2curve|buffer|updateContextMenuItems||vbs|isPointInside|fontcopy|tryAddEmptyRow|list_is_visible|selecter|editEnd|highlight|removeRow|existing|DataSource|use|||CTE|enumerables|skipEvents|QueryStructure|markerId|objectsToRemove|bezlen|Schema|Clear|Database|pathId|updateObject|View|iLen|objects|widths|isActive|innerHeight|tspans|Properties|objectsToUpdate|getMonth|background_color|built|glob|metadata|currentValue|flip|||isValid|showEditor|dto2|_editControlPlaceholder|getListValue|draw|text_color|minContentHeight|valueElement|innerTable|dto1|vals|getSelectedListItem|getButtonContextMenuItems|dj1||wrongRow|doNotGenerateEvent||appendBefore|RootQuery|keyToUpdate|500|findTableByName|parentElement|isOpen||treeview|srcAlias|1px|_moveSelection|text_hover_color|seg|background_hover_color|Value|GridRowCell|skipEvent|stops|tableBody|defaultView|di1|noAnimation|deleting|DOMload|headerWidth|NameNotQuoted|rowId|butt|which|checkField|newf|Move|isHelper|Procedure|random|titleBarText|endString|pendingObject|expandedNodes|366|||||Selects|SortOrder|removeByIndex|dataSources|initstatus|clientWidth|letters|clientHeight|runAnimation||types|seg2|repeat|safari|updateCount|u00ebl|fltr|touchHandled|invalid|Rapha|proto|mouseProto|rvml||background|667|related|valueB|||valueA|textpathStyle|cursor|callbacks|information|fullIOH|updateRowControl|d_hoveringOverElements|coordorigin|toggler|_setTableWidth|log|resizeLock|addOrUpdateRow|mouseenter|percentScrolled|reconnect|activeID|_getHeaderRow|globalTempLink|contentWidth|updateTabindex|move_scope|JunctionPostfix|strConversion|globalIndex|startString|restore|||activeClass|replaceChars|inputLabel|__getType|destY|sweep_flag|resizeT|newsize|tableObj|fff||hiddenBlock|TString|removeAttr|outerWidthDiff|NameInQuery|_availableAttrs|toLower|clientLeft|dragMaxX|application||bodyCell|popup|_getBodyFirstRowCells||||MetadataGuid|hook|||472|suppressConfigurationWarning|_path2string|9999em|newObj|prepend|Set|clientTop|reposition|appendElement|onAddTableToCanvas|subQuery|__pad|hooks|configs|setSize|lBound|ds2|ds1|innerTableTbody|list_item|joinType|glyph|cancel|postprocessor|Options|currentTotal|_getBBox|||_removeGraph|tdata|getPaddingLength|seconds|hsb2rgb|DescriptionColumnOptions|PrimaryKey|isAlternate|day|deleted|053|groupColumns||longClickContextMenu||getColor|invert|uBound|abortevent|onDragStart||showGrouping||228||maxWidths|scrollTimeout|getString|_create||_13|staticControlKeys|items_then_scroll|stretch|Pos|filterMode|getSubpath|tear|_23|The|getPaddingString|ClientSQL|srcAggregate|prevComputedStyle||setCoords|createUUID|conditionOr1|getPointAtLength|forValues|scrollAmount|yOffset|linear|month|testRow|editorVal|clrToString|fieldsHtml|arglen|srcExpression|||||mdoFromTable|dis|hours|boolean|_createTitleButton||fieldValue|lowerCase|pcom|list_height|findDotAtSegment|dragHandle|optionsNameColumnOptions||||dirX|||SQLError||MetadataType|dirY||494|minutes|_divwrapright|relative|||UpdateGuids|seglen|shiftKey|every|pendingChanges|removeData|itemsCount|setInterval|wrap|serverSideFilter|itemsHtml|__def_precision|columnCount|paramCounts|l2c|Copy|toHex|optionsMarkColumnOptions|00585866|_hasContext|seg2len|selobj|mdoToTable|showList|Synonym|Loading|updatePosition|createTextRange|rowItems|itemHtml|existingDS|mouseleave|_isOpen|shortFieldName|bindItemsEvents|036|numPerPage|setDto||schema|TableObjectOnSubqueryClick|derived|triangle|matchDatasourceDto|FFF|PreviousItem|parentSelector|supportsTouch|getFullYear|TableObjectOnLinkCreate|TableObjectOnLinkedObjectSelected|nodes|removeEventListener|centercol|Child|Any|Direction|CriteriaBuilderItem|escapeHTML|navBar|||ExchangeTreeDto|view|fullUpdate|funcs|Models|ActiveQueryBuilder|ActiveQueryBuilder2|_focusedOptionLi|updateExpressionControl|configEnds|touchMap|innerHTML|readyState|_refreshValue|x2m|swapClass|totalWidth|step|tables|timestamp|binded|important|and|keyup|_hasScrollY|RightToLeft|y2m|_getColgroupCells|||deltaX|09|deltaY|handlers|paneWidth|POST|primary|_disabled|visibleTop|||AggregateList|_getHeaderCells||x1m|TableObjectOnCheckField|initialized|itemsPagePreload|ClearItemsText|RootJunctionPrefix|ShowPrefixes|start_scope||y1m|SQLErrorMessage|CanvasLinkOnChanged|childItems|blurTimer||CreateLink|||notfirst|epsilon|IsEqualTo|brect|400|_size|relatedTarget|054|layout|desc|rule|parentOptGroup|finite|mapPath|solid|miterlimit|GetPropertyDialog|typeahead|currentSorting|DisableSessionKeeper|_obj|fieldsTable|selectedpage|_position|minWidths|Yet|bod|trim|||rem|_setOption|QBHandlers|Sorting|onDragClass|evenodd|addGradientFill|getBoundingClientRect|rectPath|ToDelete|buttonLink||_blur|setAttributeNS|_typeAhead_timer|matchee|findDotsAtSegment|scrollWidth|updateFields|018|datepicker|||_removedFactory||elementFromPoint||refX|MessageText||||onChange||_typeAhead_cycling|LinkedObjects|newWidths|validateValue|True|_pathToAbsolute|bboxwt|original|py2|px2|bgImage|updateGridRows|clipRect|||_vbSize|dim|distance|touchend|menuWidth|touchstart|touchmove|classic|subpaths|AllowJoinTypeChanging|||||del|getLengthFactory|returnStr|TableObjectOnDestroy|o2t|lastI||o1t|TypeError||ariaName|oldRaphael|fieldCheckbox||parse|subpath|titleBarOH|ymin|xmin|205||curChar|||getPointAtSegmentLength||TableObjectOnTrash|TableObjectOnClose|interPathHelper|elt|tabDerrived|iframeBlocks|_setDto|_getDto|reduce|klass|250|stack|Disabled|getComputedStyle|mouse|cssZIndex|protected|typeMismatch|noop|positionDragY|f_out|f_in|instanceOf|upto255|targetTouches|_mouseInit|ContextItems|DenyLinkManipulations|parentItem|itemIndex|pathDimensions|cursorWait|46875|buttonSubquery|noPropagation|small|dblclick|filtredItemsCount|disableSelection|paginate|identifier|FieldTypeName|dragUp|filterChangeRoutineT|scrollToY|TypeColumnOptions|filterClear|updateFilter|scrollToX|parentTable||hits|selectOptions||TreeSelectNode||itemsArray||isType|breadcrumbClick|HideColumnMark|filterChange|contentPositionX|HideColumnType|contentHeight|regex|end_scope|bit|OnApplicationReadyHandlers|dragMove|GlobalTempId|positionDragX|HideColumnName|one|filterChangeStub|getDay|fieldType|insidewidth|both|needInvoke|onFieldCheck|timeout|availableAnimAttrs|ownerDocument|Dim|needFilter|thumbs_mouse_interval|ver|parentGuid|ie7|iconClass|optionsTypeColumnOptions|1E5|margins|ItemsCount|9941413|rx2|ry2|parameters|getKey|toColour|getBoxToParent|getSubpathsAtLength|optionsDescriptionColumnOptions|localIndex||1e12|getPrecision|UseLongDescription|norm|amd|autoOpen|exports|fillSelects|frame|_fired_|dontEnums|FieldName|called|propertyIsEnumerable|elementParent|ShowLoadingItems|revert|asin|inArray|_outer|HideColumnDescription|trimCaption|idx|sortBy|filterRegExp|NameStrNotQuoted|rightcol|leftcol|ItemsStart|toff|parseTransformString|usePlural|contentW|loadingItemsOverlay|300|statusbar|line_spacing|does|message|than|letter_spacing|588l|ActiveXObject||resizestop|lineHeight|docum|rowHeight|ShowPropertyDialog|DisableLinkedObjectsButton|rowY|NavBarBreadCrumbSelectNode|NavBarAction||thisAAttr|TreeStructureSelectNode|_left|structureItem|lastScrollY|optGroupName|buildNewTree|selectmenuId|droppedRow|positionDefault|clientData|transformPath|altKey|MetadataFieldDto|UseCustomExpressionBuilderServerEvents|commaSpaces|gridItemDto|delta|DisablePageReload|overlays|gridRows|findRowsByExpression|result4|mdoFrom|result2|result3|updateGuidHash|hideList|oldGuid|_cellEditStart|266|oldY|942|fontName|dragObj|getPosition|076c|CriteriaItem|newShowGrouping|radial|clearInterval|333|mouseOffset|normal|MetadataObjectGuid|clrs|ContextMenuReceived|CriteriaBuilderItemGroup|SQLReceived|recIndex|_selectedIndex|CanvasOnTrashTable|SQLEErrorReceived|MessagesReceived|fix|general|NotAll|editorChangesEnabled|conditions|||||CanvasOnRemoveTable|DataSending|currIndex|CriteriaBuilderItemPlus|flag|Url|plusButton|after|GridOnAddTable|yi1|GridOnAddTableField|contextMenuCallback|QueryStructureChanged|removeEmptyArray|Columns|CanvasContextMenuCommand|xi1|CanvasOnAddTableField|nes|newWidth|GetValueText|refreshButtonClick|before||complete|_top|colCell|jQueryUI|selectedTrue||d_i|SqlErrorEventArgs|delayedSend|refreshSql|oval|d_topElement|diamond|getButtonContextMenuItemsMove|retainFocus|fillDto|fillDtoItems|thisStyle|getJoinPrefix|addBack|_path2curve|resetTable|enter|success|CanvasOnAddTable|TypedObject|strong|ConditionIsValid|Group|GetUID|Parameter|character|512|GridRowCellOnChanged|||||generateEvent|isEqual|commands|_setTableHeaderWidth|expandNode|setSelectionRange|hovering|QualifiedName|cellNameKey|globalMenu|updateHeaderCellWidth|Event|staticEditControls|blockFocus|specified|NullOrderingInOrderBy|0px|removeObject|thisArg|_name|similar|GroupingCriterion|hiddenSQL||_setColCellWidth|_importDto|sleep|Ascending|resizable_params|coordsize|lastCollapsableHitarea|ExpressionColumn|_initWidths|ConditionColumns|001|lastExpandableHitarea|Nulls|interHelper|_safemouseup|lastId|renderfix|filterBlock|editableSelectControl|prependTo|itemdata|initWin|headerHeightStr|back|dif|08|isInAnimSet|denominator|eval|detach|dots2|dots1|inHiddenBlock|stickyHead|zin||listIsVisible|Package|currentContext|getByGuid|syncTable|pickListItem|rowIsEmpty|removeAllMarked|hsl2rgb|ChangeActiveUnionSubquery|UpdateLink|Namespaces|getMatchItems|menuItem|reset|DoAction|bbx|ActiveUnionSubqueryGuid|Root|wrappers|oldt|child|markAllForDelete|onDrop|selectListItem|collector|messages|itemMouseenter|checkScroll|240z|objectOptions|persistent|374|hoverClass|QuickFilterInExpressionMatchFromBeginning|nextcommand|tail|result1|sendDataToServerWithLock|disable|testDS|cellpadding|inputs|mdoTo|cellspacing|newDSdto|itemMouseleave|getAttribute|middle|VisiblePaginationLinksCountAttr|ajax|texts|SQLChanged|objectsToAdd|createTextNode|forGroup|canvasDatasourceDto|freeY2|SQLUpdatedServerFlag|fieldIcon|updatePendingObjects|xb0|thatMethod|dir|addDashes|MarkColumnOptions|relativeRec|ease|GetFullFieldName|1024|dashes|database|_params|blank|UserQuery|isFloating|UserDataReceived|freeX2|leading|freeY1|SizeStr|_fy|NameColumnOptions|loadedNew|OnApplicationReadyFlag|FixedColumnMode|data1|optionsFixedColumnMode|ForeignKey|getNextEmptyPlaceRoutine_Test|_tofront|_toback|_insertafter|pathes|exclude|_tear|_last|csv|Title|linkNode|extractTransform|_insertbefore|Remove|_rectPath|todel|LinkPart|u2026||_extractTransform|UpdateObjects|fxfy|_oid|raphaelid|selectsDto|bbt|currentSelect|SelectOptionDto|UpdateConnection|isGrad|isSimple|optionsHtml|_init|ExchangeTreeViewDto|sendDataToServerCutsom|param|spanField|requestAnimFrame|defaultExpandLevel|0000|expand|objectClick|_Paper|was|_getContainer|GetTreeNode|fieldElement|FullQualifiedName|IsExpandable|IsMetadataObject|Level|cssDot|stopAnimation|nodeIndex|nodeExpandedClass|collapseNode|com|isExpandable|paused|TypeStr|descriptionHtml|isWin|shifty|DisableDatasourcePropertiesDialog|compensation|thin||images|clmz|SelectAllRowsFrom|are|DisableLinkPropertiesDialog|DisableQueryPropertiesDialog|Metadata|triggerEvents|allEvents|endD|startType|detachEvent|flush|rgba|browser|_fx|load|showDescriptions|propertyName|endType|progid|isLoaded|Microsoft|LastItemId|laspPagerScrollLeft|startD|align|_radial_gradient||throttle|Edit|Query||||||dirtyattrs|anchor|limit|applyFilter|_parseDots|units|LoadDataByFilter|newAnim|per|newstroke|calculateBox|parentOffset|toLocaleString|newpath|targetId|_getPath|shortLeg|propSize|strokeColor|square|sampleCurveX|_ISURL|toggleNode|_preload|QBWebCoreGridResizeLock|errHandlersConfiguration|newDiff|fastCheck|accesskey|JavaScript|colIndex|_syncColWidths|293|M12|_getHeaderCellsIndexTrue|Actions1|lastIndexOf|subname|oldstop|fieldContextMenuCallback|288|setColumn|wildcard|getJunctionItemType|CriteriaBuilderDto|buildControlItems|_tmp|junctionType|submenu|clearButton|onLinkCreate|onLinkedObjectSelected|prepareSyncMetadata|_parseSize|endUpdate|onCheckFieldInTable|updateSQL|dtoIsEqual|border_color|dtoIsSimilar|slidedown|newTotal|finalTotal|sendDataToServerDelayed|800|findTableByDataSourceGuid|_setBodyBounds|MetadataObjectAdded|_scale|hasScroll_x|test_interval|testWidth|existingTable|beginUpdate|hadScroll_x|GridRowDto|416|conditionOr|contextMenuKey|90625|movingDown|Output|CriteriaType|59c|newwin|||draggedRow|nodrop|packageRGB|GridBeforeCustomEditCell|rgbtoString|_touchMoved|getMouseOffset|docPos|tableValue|AfterCustomEditCell|makeDraggable|C10|mouseCoords|amp|prepareRGB|customEdit|freeX1|UpdateWrapper|CriteriaBuilderItemGeneral|General|CriteriaBuilderItemGeneralDto|touchcancel|99c|getOperatorObject|serializeRegexp|90332031|serializeTable|actionAddItem|CriteriaBuilderItemGroupDto|page|cross|annul|ellipsePath|CriteriaBuilderItemDto|schedule|252|Paper|IsInList|operator|_click_|serialize|IsNotInList|prevIndex|CriteriaBuilderItemRow|existingDSdto|onGridRowChanged|723|GridOnAddRow|selectedOptions|clearSqlError|onCanvasContextMenuCommand|GridOnRemoveRow|elems|importGrid|importCanvas|optgroup|onAddTableFieldToCanvas|_toggleEnabled|ascending|DroppableClear|onTreeDoubleClick|_escapeable|handlersPath|nogo|buildTree|_refreshPosition|DroppableDetermineTopElement|newOptionClasses|addOption|readonly|QBFREE|jQueryUIMinVersion|expandableHitarea|maxH|jQueryMinVersion|toggleCallback|_typeAhead|tmp_winner|tmp_highest|closed|z_index|prepareBranches|winH|applyClasses|_toggle|cookieId|stored|_scrollPage|MessageInfo|union|collapsableHitarea|cookie|errNoJQ|eventType|iFrameOverlay|newelementWrap|GridComponent|SQLTextChanged|outsidewidth_tmp|invokeAsap|thisLiAttr|siblings|applystyle|95800781|msgType|initW|headerHeight|__repr|toExponential|isVisible|DateTime|dtoToAdd|dsList2|rows2|matchNewDto|_isPositiveInt|border_hover_color|_parseWidth|currval|outsidewidth|repositionStickyHead|_isPositiveNonZeroInt|_rotright|_rotleft|generateContextMenuItems|presentation|GridOnRowChanging|ChangedCellValue|parentW|allRows|RefreshSQLClick|prepareSyncSQL|refreshSqlWithLock|QBTRIAL|pairs|quoteString|totalspan|_setTableBodyWidth|checkPending|contextMenuActive|triggerAction|outerTbody|code|__arg|textStatus|firstColsW|ChangedCellIndex|_fixFirstCols|ajaxFinish|jqXHR|newRows|fromCharCode|pathToRelative|component|600|modal|mag|getEmpty|toMatrix|FieldListOptions|HideAsteriskItem|menuChildren|titleW|contentH|8E3|editStart|hooksOf|generic|lower|buttonClose|buttonProperties|intersect|protect|normalize|selectNewListItem||obj1FieldName|obj2FieldName|busy|a2c|pathToAbsolute|mergeOne|checkAllField|checkedFields|moveToTop|cRec|borderLeftWidth|newres|borderTopWidth|heightBeforeDrag|curveDim|cloneOf|q2c|ShortDescription|TableObjectField|_grid|KeyFieldsFirst|FieldListSortType|LongDescription|newField|mHide|processPath|needResize|fixM|fixArc|newFieldsCount|li_value|createButton|li_text|blurTimeAbandoned|acces|selectFirstListItem|isBBoxIntersect|opera|setRequestHeader|034|buildBreadcrumbElements|srcUrl|parts|keepMenu|doScroll|posTop|Checked|istotal|horizontalDragPosition|isFirst|generateNavBarContextMenuItems|nav|x_y_w_h|isCurrentQuery|offsety|MAX_CAPTION_LENGTH|offsetx|GetWrapper|topOffset|list_item_height|buildElements|structure|scope_in|UpdateValues|QueryGuid|getEventPosition|Close|clearSelectedListItem|fastDrag|AriaLabel|nodeCount|inited|contentPositionY|paneHeight|scrollBy|scrollByX|scrollByY|onend|domElement|EditableSelect|GUID|onmove|elTop|onstart|extended|needUpdate|Widget|rgbToHex|hasEmpty|hexToRgb|Mutators|regexp|stickyTable|global|keepColumnsTableWidth|base3|userControl|bezierBBox|GotoSubquery|updateCustomEditButton|_createEditControl|xbase|viewBlock|ybase|sum|7734375|_createEditBlock|conditionSubQueriesLength|dtoConditionSubQueriesLength|dtoExpressionSubQueriesLength|onCellChanged|expressionSubQueriesLength||ConditionType|t13|pathValues|t12|dispatchEvent|atan2|pass|periodical|1767578|drop|bound|merge|prototyping|prevcommand|accept|CustomEditControl|adjustWrapper|lastReturn|_makeResizable|findRowsByDto|_makeDraggable|setup|highlightSelected|maxContentHeight|xmax|ymax|rowToDelete|_reCreateEditBlock|debug|crz|_120|_switchToView|GetTempId|simulatedEvent|parsePathString|rel|upperCase|catmullRom2bezier|simpleOffset|TableObjectOnUpdated|isPointInsideBBox|TableObjectOnMoved|tableHeaderFixed|you|Descending|getControl|customEditButton|editableSelectInstances|insert|editableSelect|contextMenuAutoHide|_blockFrames|emptyRow|_unblockFrames|GridRowOnChanged|AllFieldsSelected|cleanData|getMatchItemNext|fromMenu|isEmptyObject|_cleanData|splitAccesskey|hideMenu|toBack|layerClick|342|textContent|blurItem|_viewBoxShift|aks|positionSubmenu|focusInput|contextMenuShow|Blur|behavior|microsoft|schemas|htmlMenuitem|urn|htmlCommand|autoHide|zindex|tile|eventSelectstart|determinePosition|inputClick|menuMouseleave|clearHighlightMatches|nested|menuMouseenter|blurregexp|hasTypes|focusItem|blurInput|menuitem|maintain|itemClick|adjustHeight|cannot|attempt|Incompatible|01|retain|owner|include|methodName|some|clean|flatten|collection|_touchMove|fromType|_touchStart|rightBox|_touchEnd|toType|simulatedType|thinBg|getInstance|QBWebCanvasLink|000000|changedTouches|GlobalUID|Line|responseText|dynamicSort|post_error|Errors|error_alert|XMLHttpRequest|XMLHTTP|colourRegExp|Content|cls|getHTTPObject|isFinite|methodsEnumerable|tagValue|UID|Clone|DeepCopy|static|nodeType|fixed|isEnumerable|prevOffsetParent|typeCheck|stringify|arguments2Array|Argument|parentId|charCodeAt|year|callee|minLeg|showArrow|isObject|__formatToken|__getInput|inline|heightHide|heightToggle|treeController|deserialize|padding|sel|removeOption|_meta|prerendered|c1Elements|selectedValues|hideArrow|_mouseout_||_mouseup_||_mousemove_|||_touchend_||_touchstart_|_contextmenu_|getLineCoord|leftBox|_fn_click|_mousedown_|scheduled|touch_enabled|snext|snextclass|previousclass|carat|_divwrapleft|nextclass|bVer|_touchcancel_|_touchmove_|parentBox|sprevious|spreviousclass|hsrg|repush|p2s|hsba|glowConfig|shape2|hsltoString|rgb2hsb|setWindow|uuidReplacer|rgb2hsl|getFont|hsbtoString|u00b0|pause||1252|resume|7699|5873|3678|tCommand|hsb|animateWith|hsla|pathCommand|16777216|hsl|uuidRegEx|cellOuterDiff|_getResizeableParams|endPath|numsort||||includeMargin|andSelf|||endMarker||_off|_on|startdx|startPath|startMarker|markers|replacer|whitespace|Arial|Infinity|objectToString|isnan|adj|DocumentTouch|quotedName|isFunc|tokenRegex|formatrg|objNotationRegex|quote|9041|addEvent|detacher|_f|backOut|Now|scope_out|stopTouch|vendor|shorter|solveCurveX|preventTouch|olde|Inc|backIn|isPointInsidePath|70158|getById|onlystart|getTatLen|isWithoutTransform|getOffset|about|unmouseup|unmousemove|075|getElementByPoint|pageYOffset|acos|comb|Cvalues|Tvalues|CubicBezierAtTime|pathBBox|pipe|0472|2335|2491|9816|1069|1601|2032|bezierrg|availableAttrs|toPath|equaliseTransform|solve|sortByNumber|maxlength|real|x2old|large_arc_flag|easing_formulas|tan|f2old|y2old|DOWN||fontWeight|fontStyle|RIGHT|LEFT|fontFamily|serializeTables|onAllowDrop|findDropTargetRow|onDragStyle|updateTables|tableId|onDropStyle|HOME|hasIcon|newfill|optionValue|ovalTypes|path2vml|isOval|thisA|END|PAGE_DOWN|PAGE_UP|TAB|SPACE|ENTER|windowHeight|initInputEvents|autoShow|duplicateOptions|adjustWrapperPosition|current_options_value|onTextboxChanged|EditableSelectWrapper|unselectListItem|getMatchItemPrev|toFront|def|initEvents|scrollToListItem|adjustWrapperSize|screenX|initMouseEvent|createEvent|compatMode|fireEvent|screenY|setWidths|isPatt|noRotation|toFilter|positionElements|vbt|hideOtherLists|pathTypes|_getBodyCellWidths|getHeaderCellByBodyCellIndexFiltered||_getBodyAndHeaderCellWidths|getPropertyValue|_getHeight|sbwidth|_removeAllWidth|_getBodyFirstRow||getHeaderCellByBodyCellIndex|setMaxWidth|alwaysNoScrollY|alwaysScrollY|_getColgroup|tuneText|nodeValue|_parseResizable|_parseColumns|_hasScroll|enddx|Marker|_parseScrollable|_geInnerTableTbody|_createColGroup|vis|stickyWrap|newTable||cssrule|trueWidth|refreshTimeout|listH|running|_closeOthers|typeAhead|thisText|handleWidth|narrow|long|short|medium|selectmenuIcon|wide|selectelement|aspectRatio|createSVGMatrix|activedescendant|DEFAULT_HEADER_BORDERS|positionOptions|preserveAspectRatio|currentOptionClasses|_formatText|bites|isMove|DXImageTransform|enable|escapeHtml|SUBQUERY_ENABLED|importMetadataNew|stickToTop|QBWebCore|importMetadata|602|903|destPercentX|IsTrashed|7168|4096|8192|ObjectMetadata|2048|scrollToElement|onNavBarAction|480|256|sendDataToServerInternal|stepCallback|clearSyncDebounce|delayed|trial|QBWebCoreCriteriaBuilder|QBWebCoreGrid|QBWebCoreMetadataTreeView|QBWebCoreMetadataTree|data2|triggerObject|destPercentY||NeedRebindUserInit|clearSync|contentType||dataType|sendDataToServerDelayedWrapper|errorThrown|importNavBar|getInactiveItems|parentObj|importCriteriaBuilder|getActiveItem|444|createChildMenu|childButton|onEditorChangeDebounced|onObjectDestroy|link16|onObjectClose|objGuid|updateNavBarContextMenu|importMessages|importQueryStructure|importSQLEError|Container|onRemoveObjectFromCanvas|EditorRestoreLastGood|ConditionTypeHaving|ConditionTypeWhere|EditorClear|onEditorChange|targetKey|EditorGoToErrorPosition|refreshButtonHover|onGridRowAdded|Int32|onEditorChangeDebouncedCall|onGridRowRemoved|childButtons|onTrashObjectFromCanvas|subqueryPlusButton|typeName|onCanvasLinkChanged|updateUnionControls|setLayout|odd|updateBreadcrumb|642|classObject|importCanvasObjects|importCanvasLinks|002|442|376||tabbableLast|TableCTE|updateTableContextMenu|createLinkObjectsMenu|147c|CanvasLink|updateLinkContextMenu|206|DataSourcePropertiesForm|mergeGridRowObj|updateDataSource|ObjectReadOnly|1999|findCanvasDataSource|adjustSize|findCanvasDataSourceSimilar|02|collapseTable|203|622|314|lastHeight|mergeDataSourcesObj|checkPendingCanvas|SubQuery|lastGoodSQL|updateExpression|SubQueries|453|398|checkPendingGrid|028|Time|importDto|spinning|sync|QBWebCoreCanvas|QBWebCoreNavBar|tabIndex|31c|dragMaxY|getAllRows|AfterCustomEdit|634l|056|925s|RefreshSQL|055|qbtableClass|tabbableFirst|397|uiQBTableClasses|secondary|moveStart|686|043|335|ErrorPos|clickSQLEError|moveEnd|collapse|DroppableOver|highlightText|isExpandableClass|DroppableOut|ItemsPerPage|itemId|createGraph|DroppableGetTopElement|PreloadedPagesCount|slideUp|IsFiltered|showDescriptons|slideDown|needExpand|expandableBlock|isMetadataObjectClass|sqlError|sqlChanged|024|588|getObjectFieldByGuid|getObjectByGuid|CopyInner|384l1|234|DataSourceLinkPartDto|396|LinkPropertiesForm|GetLinkExpression|DataSourceLinkDto|500px|132l|getObjectHeader|getObjectFieldByName|errWrongScriptOrder|CreateConnection|SelectedValue|TreeSelectDto|IsChanged|laspPagerCount|selectsParent|recreateSelect|localCount|GridOnRowRemoved|settingsWorkTool|7E3|692|556|parentIndexId|buildPager|selectChange|HideLoadingItems|selectDataRefresh|ShowLoadingSelect|needLoadItems|loadChildItems|TryLoadItems|GridOnRowAdding|loadFilteredItemsCallback|loadChildItemsCallback|DefaultExpandLevel|LoadDataByPager|loadFilteredItems|buildSelects|ShowAllItemInGroupingSelectLists|globalCount|globalStart|showAllItemInGroupingSelectLists|lastJ|press|GridOnRowAdded|lined|objY2|objY1|visibleBottom|TableObjectFieldOnCheckField|objX2|UnionNavBarVisible|fired|objX1|panel|pencilSmall|pencil|fieldTypeSize|toggleNavbar|updateAggregateColumn|fieldDescription|TABLE|description|fieldSelect|FieldCount|importContextMenu|importSQL|arrowScroll|jspActive|fieldGuid|onObjectTrash|DataSourceLayoutDto|getLayout|IsSupportCTE|getNextEmptyPlaceRoutine_Find_RTL|_positionDragX|getNextEmptyPlaceRoutine_Fill|getNextEmptyPlaceRoutine_Find|Updating|destLeft|IsSupportUnions|getEmptyPlaceCoord|354|588l1|252l|702|CanvasOnDropObject|propSizeY|propSizeX|132l1|redrawD|findByTableGuid|438|312|648|removeByTableGuid|rightGuid|leftGuid|errWrongJQUI|276||IntoControls|errNoScript|delete16|jQueryMaxVersion|propertyValue|checkProjectConfigure|nooverflow|check_usr|QueryPropertiesForm|layerY|errNoJQUI|384l|jQueryUIMaxVersion||layerX|menuCTE|errWrongJQ|itemsCTE|IsCTE|isPrototypeOf|valueOf|actionDelete|actionMoveDown|actionMoveUp|proxyEx|__entityMap|375|actionAddGroup|actionAddGeneral|selectedFalse|CriteriaBuilderItemRowDto|dontEnumsLength|hasDontEnumBug|actionClear|You|78710938|_getCssClass|9999|getTime|85253906|between|_createViewBlock|84570313|able|TotalCount|will|isNumeric|_switchToEdit|setCursorPosition|aliases|createFromDto|ActionDto|False|dialogClass|operatorText|TableObjectOnLinkDelete|Editor|HasChild|TableObjectOnCreate|Plus|offsetPosition|getOperationContextMenuItems|Where|Invalid|operatorObj|beforeclose|69238281|_utilizeEditBlock|propHooks|EditCondition|_initializeEditBlock|createCombinedButton|onAfter||Tween|isPlainObject|First|Last|showCustomEdit|finally|customExpressionEdit|EditExpression|97363281|suppressEnter|setMonth|_generatePosition|positionAbs|reCreateEditBlock|rowSorter|toggleGroupColumn|generateHeaders|_convertPositionTo|_mouseUp|fieldText|DoesNotEndWith|findRowByDto|equalSimilar|RowChanged|updateSortingOrderColumn|onRowChanged|BeforeCustomEdit|Contains|topParent|visibleY|getter|posBottom|findRowByExpression|StartsWith|getPositionTop|DoesNotStartWith|getRowHeaderList|allow|DoesNotContain|CriteriaOr|EndsWith|May|elBot|isAsterisk|IsLessThan|less|IsLessThanOrEqualTo|039BE5|fillDefaultValues|_exportDto|createRowControl|IsBetween|greater|3115234|IsNotBetween|getMinutes|IsGreaterThan|IsGreaterThanOrEqualTo|getSeconds|longDays|shortDays|InsertSubQuery|IsNotNull|IsNotEqualTo|getLastRowControl|oldIndex|IsNull|longMonths|noConflict|shortMonths|selection|updateOnLoad|tableDragConfig|btn|OnApplicationReadyTrigger|nowrap|Click|NotPrimaryKey|generateLoadingFields|1029399|reCreate|89805351|Union|Synonyms|Procedures|1019465|ClientData|updateLink|generateFields|Views|Tables|required|dragStart|usr_vXXX|brackets|higher|helperProportions|dragging|dragStop|16px|Relations|UnionNavBar|oldFieldsCount|trash|saveScroll|your|Please|ActiveMenu|getTableFieldExpression|width2|hasAggregateOrCriteria|Insert|effect|titleText|Common|highlightDataSource|Unions|Subqueries|For|Created|newRow|height2|slideup|prepareSyncQueryProperties|Refresh|trashDataSource|generateTitle|changed|addDataSource|89706013|removeDataSource|need|addLink|titleH|New|componentW|titleButtonW|heightMax|componentH|Reconnect|plusItem|Sort|operationContextMenuCallback|CriteriaBuilderItemAdded|resizeHandles|From|getJunctionTypeContextMenuItems|library|resizing|createFieldSelect|CriteriaBuilderChanged|resizeStart|resizeStop|getFieldsContextMenuItems|preventEvent|createButtonMenu|Default|detected|Incorrect|junctionTypeContextMenuCallback|createOperationMenu|selfCriteriaBuilder|originalPosition|createJunctionTypeMenu|xxxxxxxx|xxxx|_destroy|setDate|outer|_id|errors|Android|Warning|Info|bezier|cubic|contain|inst|onClose|snapTo|2100|NaN|ISURL|htmlfile|write|556v10|ApplicationEvents|1C1|propertychange|MessageError|check_lib|nts|succeed|createPopup|888C1|starts|yxxx|xxxxxxxxxxxx|Eve|4xxx|criteriaBuilderFieldSelect|ontouchstart|ends|MessageWarning|following|once|_isInt|ClientOnly|getQueryParams|incorrect|any|HandlersPath|configuration|setQueryParamValues|NextItem|web|file|achlmrqstvz|1000|notall|cte|exist|HTTP|radial_gradient|Wrong|script|resetLayout|TRUE|changeMonth|changeYear|must|syncCriteriaBuilder|rstm|switchToRootQuery|5E3|_getOriginalHeaderRow|updateCriteriaBuilder|widgetName|raphaeljs|OVERSCROLL_FIX|Get|hasFeature|SVG11|feature|1900|_getHeaderCellsIndex|10px|sessionID|BasicStructure|free|msgTime|implementation|_blank|spacing|sortByKey|ping|achlmqrstvxz|yearRange|_availableAnimAttrs|SVGAngle|scrollbarWidth|letter|_super|defaultElement|_getOuterTbody|tbody_height|pages|maincol|65136719|front|17089844|wrapper2|41015365|07112864|75357624|wrapper1|15722649|18457031|34472656|78662109|57470597|73209515|52246183|jPaginate|30045377|07128906|07584638|1669913|99853622|9296875|60172265|16650127|8850957|_duration_|13052964|1235352|dispatch|93131062|21924091|69287109|6453477|_timer_|8cc59d|MSIE|black|60400391|slide|appVersion|44922135|13687917|meta|appName|bName|decodeURIComponent|UTF8decode|escape|render|tpl|encodeURIComponent|49511568||62727616|calc||unescape|UTF8encode||isString||85026044|55696305|getFlags|getUTCMonth|matc|94026605|79589844|29117926|__max_precision|09668119|11572266|13281462|87255945|08398561|41666457|22786654|8359375|70166016|28808751|left2|59179564|83789062|53076086|57535656|37923305|date|0x|12402344|70898438|45833208|87841797|88281325|73242188|5820305|18147938|trigger_jquery_event|defineProperty|exec|defineProperties|getOwnPropertyDescriptor|getPrototypeOf|toPrecision|search|_mouseDragOrig|reverse|reduceRight|unshift|getOwnPropertyNames|TextNode|WhiteSpace|Collection|uniqueID|Arguments||isFrozen|isExtensible|||||preventExtensions|seal|freeze|isSealed|forEachMethod|send|onreadystatechange|ff0066|errordialog|inViewport|Connection|uid|Msxml2|isElementVisible|urlencoded|form|isOnScreen|mirror|overloadGetter|_getParentOffset|_mouseDrag|hasFixedAncestor|textnode|axd|clientError|encodeURI|ab8ea8824dc3b24b6666867a2c4ed58ebb762cf0|MooTools|3037093|MouseEvents|_mouseCapture|89697508|81250219|ontouchend|8414724|98649128|14257696|63183594|Implements|1770819|ipad|iphone|ipod|teardown|WebkitUserSelect|special|9262671|41162109|7604181|82910156|39876587|05680228|erase|515|Rectangle||transparent|pick|combine|invoke|ready|associate|getRandom||getLast|camelCase|49886178|79850071|82698528|90673828|27783203|exp|capitalize|hyphenate|escapeRegExp|atan|substitute|getUTCDate|635|484|26c|405h240V795h|M10|925|213|me2|292|417|026|LINKED_OBJECTS_Link_symbol_16|807|807c|502zm11|502L2|MouseEvent|94l|0l|22z|56c|4E3|oldInstances|012|313|865l|case_sensitive|162l1|067|09c|328|323|088|364|903l2|hide_on_blur_timeout|625l|wrapperCleared|077|reset_options_value|426||852|options_value|padding_right|autocomplete|frameborder||_hidden_select|204|59C9|384|296|588c|labelledby|038|uniqueId|haspopup|listbox|owns|441h240V759h|556C15|1H2|444V2|15h10|888C14|556z|tool|DATASOURCE_Settings_Work_Tool_16|work|9H9v3H7V9H4V7h3V4h2v3h3v2z|ESCAPE|tableDnDSerialize|rest|DATASOURCE_EDIT_Pencil_striped_symbol_for_interface_edit_buttons_16|GET|344|333z|289h240V911h|5l7|373|5h2|err|502v2|tDnD_whileDrag|99zM7|838|252h2|tableDnDUpdate|078|BackCompat|333L12|serializeParamName|M15|DATASOURCE_Delete_16|215h240V985h|innerText|containsOption|copyOptions|selectedTexts|364z|tab|tab_derived||||ajaxAddOption|Page||getJSON|sortOptions|Sketch|09c1|324l|066|683|HTMLMenuItemElement|Treeview|persist|unique|865l2|033|003|binary|x9f|C14|L15|L12|secureEvalJSON|evalJSON|C15|getUTCHours|getUTCFullYear|getUTCMinutes|getUTCMilliseconds|getUTCSeconds|1200|CONTEXT_MENU_table_row_delete|u00|x00|x7f|x1f|679|SyntaxError|bfnrtu|parsing|valid|240|html5|324|327|646|992l|674|574|reserved|388|035|562|setInputValues|573zm2|797|387||673|563|357C12|904L6|getInputValues||radiogroup||705|917|Cannot||227|624l|076|424|628|6100|onselectstart|HTMLCommandElement|triggerHandler|6101|flipfit|013|disableTextSelect|selectstart|100000px|358|633|485|445|212|025|926|298|Allow|Deny|LinkManipulations|Asc|Desc|Byte|Currency|Binary|DbType|AnsiString|flat|Many|One|shortdot|shortdash|joinstyle|ItemSortType|miter|endcap|LinkSideType|Decimal|Xml|DateTime2|StringFixedLength|arrowlength|AnsiStringFixedLength||NumericInt|||16382|NumericFrac|DateTimeOffset|KindOfType|SByte|Single|Int64|Double|Int16|VarNumeric|arrowwidth|UInt64|UInt16|UInt32|colors|color2|UnionSubMenu|focussize|gradientTitle|exists|AddCTEShort|already|ColumnNameAlreadyUsed|same|visual|representation|Update|SqlChanged|updated|270|focusposition|AddNewCTE|AddSubQuery|AddCTE|oindex|longdashdotdot|longdashdot|dashstyle|Other|LinkCardinality|shortdashdotdot|shortdashdot|dash|dashdot|longdash|Foreign|User|groups|kern|center|TreeSelectTypeDto|StoredProc|currentLanguage|MainQuery|Main|MultipleQueriesPerSession|webkitTapHighlightColor|createElementNS|Gradient|fillOpacity|gradientTransform|Universal|props|DOMContentLoaded|0z|||0A2|updateObjects|refY|windowsSizeH|mdc|windowsSizeW|32E3|patternTransform|markerHeight|orient|markerWidth|ninja|removeAll|bolder|removeByGraphics|getByLinkNew|print|updateLinks|mlcxtrv|bold|lighter|700|fullfill|animportCanvasimation|DenyIntoClause|450|Into|baseline|getByLink|descent|offsetX|offsetY|xMinYMin|meet|reload|21600|getScreenCTM|removeAttribute|removeGridRows|addGridRows|SQLEditorError|removeLink|doesn|Your|u2019t|nYou|Falling|1E4|ahqstv|dxdy|DataReceivedNew|rotation|stdDeviation||nullable|||userSpaceOnUse|||||primaryKey|objid|int|GetName|LoadFromObject|clipPath|patternUnits|GetFullName|LAST|MAX|FIRST|feGaussianBlur|COUNT|old|ObjectField|Having|MIN|SUM|Uncheck|toTimeString|unload|00|removeHandler|addHandler|quot|x2F|live|liveEx|liveConvert|Saturday|SmartAdd|Friday|Wednesday|Thursday|OnApplicationReady|setGlobalOnLoad|getRec1|equalWidth|equalHeight|non|System|LinkObjectDto|AliasNotQuoted|CanvasDto|GridDto|Cardinality|DatasourceName|DataSourceGuid|LeftFields|RightFields|contentWindow|Top|fixOutsideBounds|require|9E9||interrupt|GLOBAL_DEBUG|||||DIV|onAfterFirst|client|GenerateClass|superclass|February|Dec|January|July|toUpper|June|March|April|Apr|Mar|Jun|Aug|Jul|Oct|Nov|Sep|Feb|Jan|August|doesNotAddBorder|Sat|doesAddBorderForTableAndCells|subtractsBorderForOverflowNotVisible|Fri|bodyOffset|offsetWithParent|Tuesday|Sunday|Monday|December|delegate|November|September|October|Wed|Thu|Tue|Sun|Mon|MetaDataDto|runtimeStyle|Enclose|EncloseWithBrackets|pixelradius|RemoveBrackets|backward|MoveForward|MoveBackward|CopyToNewUnionSubQuery|NewUnionSubQuery|JoinExpression|Join|textpathok|LeftColumn|RightColumn|Order|GroupBy|Option|CacheOptions|Cache|forward|views|procedures|MetadataObjectCount|Provider|proceed|Check|UncheckAll|CheckAll|DeleteCTE|SelectAll|InsertEmptyItem|ObjectTypeTable|RemoveItem|MoveUp|MoveDown|SelectSyntaxProvider|Syntax|ObjectTypeUnknown|ObjectTypeView|ObjectTypeProcedure|UnionsAdd|ContextMenuDto|Label|00000000|000000000000|Expanded|Test|Selected|ContextMenuItemDto|QueryStructureDto|Precision|ReadOnly|Nullable|Command|AltName|ItemsListIncomplete|MetadataStructureItemDto|ItemsPacketSize|Scale|Size|OutputColumnDto|ErrorToken|ErrorTokenPos|MetadataFieldGuid|ComparedField|ComparedObject|SelectAllFromLeft|SelectAllFromRight|RightObject|Datasource|LeftObject|Symbol|addRule|QueryParamDto|FieldType|Kind|DataTypeDB|CompareOperator|DataType|createStyleSheet|FullName|registerFont|getIntersectionList|Apple|Chrome|platform|Computer|paddingTop|getElementsByPoint|toTransformString|x_y|Version|getElementsByBBox|breadcrumb|Google|initialise|reinitialise|buttonset|setFinish|pageXOffset|Linked|createSVGRect|returnValue|clearfix|grip|alsoResize|cancelBubble|u00d7|M21|horizontalDrag|inter|isAtLeft|unhover|M22|paddingLeft|MIN_HEIGHT|elastic|04|1734|M11|interCount|Random|isSuperSimple|hellip|inputSpan|menublur|menufocus|getArrowScroll|limitation|isAtRight|myType|curveslengths|sizingmethod|using|getData|segment1|isScrollableV|getIsScrollableV|isScrollableH|getIsScrollableH|getPercentScrolledY|_pathToRelative|focusout|uiDialogTitlebar|uiDialogClasses|_allowInteraction|calling|unmouseout|uuid|unmouseover|u201d|u201c|getContentPane|tableNameTemplate|segment2|updateValue|hijackInternalLinks|scrollToBottom|pathIntersectionNumber|_minHeight|linked|animateEase|beforeClose|unmousedown|deleteCTE|scrollToPercentY|scrollToPercentX|setStart|diagonal|animateDuration|Switch|_createButtons|uiDialogTitlebarCloseText|getContentWidth|setDataSwitch|pathIntersection|getPercentScrolledX|getContentHeight|getContentPositionX|onDragOver|undrag|getContentPositionY|closeText|uncheck|fillSelectOptions2|findRowByGuid|checkRow|fillSelectOptions1|findEmptyRow|removeRowByDto|onAnimation|onclick|folder|onerror|level|OnBeforeCustomEditCell|parseDots|dataRefresh|insertafter|addClasses|onGridRowCellChanged|isEmptyRow|pager|_UID|insertbefore|tofront|enabled|rowIndex|targetPlace|currentEdit|rowsHeaders|toback|65280|u2019s|itemsElementRoot|16711680|Picker|isLoadedAttr|Colour|u2018s|index2|findRow|queryCommandValue|insertion|ForeColor|000B9D|slideToggle|u2400|qualifiedName|collspan|MAX_SELECTS|GetTreeFilteredNode|preload|oldHeight|onRemoveRow|nonexpandable|onAddRow|setTime|getGrid|oldWidth|625|9375|paid|984375|_equaliseTransform|5625|mozRequestAnimationFrame|NONE|webkitRequestAnimationFrame|them|rid|pixelWidth|requestAnimationFrame|titleTextW|own|easeIn|easeInOut|easeOut|pixelHeight|msRequestAnimationFrame|finish|79B5E3|GridRowCellOnDeleted|_setContainment||2573AF|bounce|sortOrder|focusin|onChanged|onDeleted|oRequestAnimationFrame'.split('|'),0,{}))

