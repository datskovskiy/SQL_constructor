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

// ..\..\src\Common\Client\js\release\usr_v2_11_2.js
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?"":e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1;};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p;}('K XU=1l;K Kh={Ko:1a(){K 6t=1d;if(2A zz!="2y"){6E{6t=1T zz("11j.Kk")}6I(e){6E{6t=1T zz("B9.Kk")}6I(E){6t=1k}}}1j{if(3z.Kj){6E{6t=1T Kj}6I(e){6t=1d}}}1b 6t},Ak:1a(Hn,1X,4h){K 6t=J.Ko();if(!6t||!Hn){1b}K 5l=Hn;5l+=5l.5f("?")+1?"&":"?";5l+="11i="+(1T 5Y).Ug();K wT=1d;if(4h=="pD"){K Hs=5l.3R("?");5l=Hs[0];wT=Hs[1]}6t.7C(4h,5l,1l);if(4h=="pD"){6t.GX("Km-1C","lM/x-dN-11m-11l");6t.GX("Km-1f",wT.1f);6t.GX("11h","6q")}6t.11d=1a(){if(6t.rS==4){if(6t.7m==gI){K 1O="";if(6t.Ke){1O=6t.Ke}if(1X){1X(1O)}}}};6t.11c(wT)},7F:1a(8X,5l,cc){K 5q=\'<b 2G="3Y:#11e">Cz 9Z</b>\\n<br/>\\n\'+"h2: "+8X+"\\n<br>\\n"+"vj: "+5l+"\\n<br>\\n"+"Kd: "+cc+"\\n<br>\\n";K Ki="Cz 9Z\\n"+"h2: "+8X+"\\n\\n"+"vj: "+5l+"\\n\\n"+"Kd: "+cc+"\\n\\n";if(cQ&&cQ.h3){5q=5q+"h3: "+cQ.h3}K 3V=2K.eB("2C");3V.db="11f";3V.ov=5q;if(2K&&(2K.3H&&2K.3H.4p)){2K.3H.4p(3V)}1j{ff(Ki)}Kh.Kg({8X:8X,5l:5l,cc:cc,h3:cQ.h3});1b 1l},Kg:1a(1D){K 5l="r4/11v.11u?";1p(K i in 1D){if(1D.87(i)){5l+=i+"="+11w(1D[i])+"&"}}J.Ak(5l,1d,"pD")}};(1a(){J.11y={6Y:"1.4.5",9M:"11x"};K 7Q=J.7Q=1a(1i){if(1i==1d){1b"1d"}if(1i.$96!=1d){1b 1i.$96()}if(1i.9h){if(1i.Kw==1){1b"1g"}if(1i.Kw==3){1b/\\S/.9A(1i.Oy)?"11t":"Mg"}}1j{if(2A 1i.1f=="d8"){if(1i.KH){1b"2F"}if("1i"in 1i){1b"JZ"}}}1b 2A 1i};K xa=J.xa=1a(1i,1A){if(1i==1d){1b 1k}K 5K=1i.$5K||1i.5K;4x(5K){if(5K===1A){1b 1l}5K=5K.1P}if(!1i.87){1b 1k}1b 1i g6 1A};K aX=J.aX;K ka=1l;1p(K i in{3X:1}){ka=1d}if(ka){ka=["87","TY","TX","x5","AD","3X","5K"]}aX.3g.iC=1a(wV){K 2H=J;1b 1a(a,b){if(a==1d){1b J}if(wV||2A a!="4F"){1p(K k in a){2H.2J(J,k,a[k])}if(ka){1p(K i=ka.1f;i--;){k=ka[i];if(a.87(k)){2H.2J(J,k,a[k])}}}}1j{2H.2J(J,a,b)}1b J}};aX.3g.11p=1a(wV){K 2H=J;1b 1a(a){K 2w,1O;if(2A a!="4F"){2w=a}1j{if(2F.1f>1){2w=2F}1j{if(wV){2w=[a]}}}if(2w){1O={};1p(K i=0;i<2w.1f;i++){1O[2w[i]]=2H.2J(J,2w[i])}}1j{1O=2H.2J(J,a)}1b 1O}};aX.3g.4C=1a(1r,1o){J[1r]=1o}.iC();aX.3g.81=1a(1r,1o){J.3g[1r]=1o}.iC();K 4d=3Q.3g.4d;aX.2L=1a(1i){1b 7Q(1i)=="1a"?1i:1a(){1b 1i}};3Q.2L=1a(1i){if(1i==1d){1b[]}1b au.Ky(1i)&&2A 1i!="4F"?7Q(1i)=="4u"?1i:4d.2J(1i):[1i]};6l.2L=1a(1i){K d8=e8(1i);1b Kp(d8)?d8:1d};62.2L=1a(1i){1b 1i+""};aX.81({G6:1a(){J.$6f=1l;1b J},He:1a(){J.$xc=1l;1b J}});K au=J.au=J.au=1a(1x,1A){if(1x){K Hy=1x.3W();K KA=1a(1i){1b 7Q(1i)==Hy};au["is"+1x]=KA;if(1A!=1d){1A.3g.$96=1a(){1b Hy}.G6()}}if(1A==1d){1b 1d}1A.4C(J);1A.$5K=au;1A.3g.$5K=1A;1b 1A};K 3X=5c.3g.3X;au.Ky=1a(1i){1b 1i!=1d&&(2A 1i.1f=="d8"&&3X.2J(1i)!="[1A aX]")};K m0={};K Hw=1a(1A){K 1C=7Q(1A.3g);1b m0[1C]||(m0[1C]=[])};K 81=1a(1x,4h){if(4h&&4h.$6f){1b}K m0=Hw(J);1p(K i=0;i<m0.1f;i++){K lT=m0[i];if(7Q(lT)=="1C"){81.2J(lT,1x,4h)}1j{lT.2J(J,1x,4h)}}K dQ=J.3g[1x];if(dQ==1d||!dQ.$xc){J.3g[1x]=4h}if(J[1x]==1d&&7Q(4h)=="1a"){4C.2J(J,1x,1a(1i){1b 4h.3v(1i,4d.2J(2F,1))})}};K 4C=1a(1x,4h){if(4h&&4h.$6f){1b}K dQ=J[1x];if(dQ==1d||!dQ.$xc){J[1x]=4h}};au.81({81:81.iC(),4C:4C.iC(),aj:1a(1x,iV){81.2J(J,1x,J.3g[iV])}.iC(),11o:1a(lT){Hw(J).1G(lT);1b J}});1T au("au",au);K bc=1a(1x,1A,cE){K wO=1A!=5c,3g=1A.3g;if(wO){1A=1T au(1x,1A)}1p(K i=0,l=cE.1f;i<l;i++){K 1r=cE[i],Hx=1A[1r],mv=3g[1r];if(Hx){Hx.He()}if(wO&&mv){1A.81(1r,mv.He())}}if(wO){K Kq=3g.x5(cE[0]);1A.11b=1a(fn){if(!Kq){1p(K i=0,l=cE.1f;i<l;i++){fn.2J(3g,3g[cE[i]],cE[i])}}1p(K 1r in 3g){fn.2J(3g,3g[1r],1r)}}}1b bc};bc("62",62,["cB","KF","4b","5f","CG","3y","Ms","3u","10P","4d","3R","7x","hg","oi","3W","9p"])("3Q",3Q,["eJ","1G","10R","dP","hQ","5X","10T","4b","5x","4d","5f","CG","42","ag","sX","ba","JW","xH","10S"])("6l",6l,["Fl","5a","AD","10O"])("aX",aX,["3v","2J","2S"])("e3",e3,["10K","9A"])("5c",5c,["8E","10J","10L","95","10N","10M","10U","117","112","118","11a","119","111"])("5Y",5Y,["7R"]);5c.4C=4C.iC();5Y.4C("7R",1a(){1b+1T 5Y});1T au("hp",hp);6l.3g.$96=1a(){1b Kp(J)?"d8":"1d"}.G6();6l.4C("ni",1a(6d,4n){1b 3A.bj(3A.ni()*(4n-6d+1)+6d)});K 87=5c.3g.87;5c.4C("ag",1a(1A,fn,2S){1p(K 1r in 1A){if(87.2J(1A,1r)){fn.2J(2S,1A[1r],1r,1A)}}});5c.2p=5c.ag;3Q.81({ag:1a(fn,2S){1p(K i=0,l=J.1f;i<l;i++){if(i in J){fn.2J(2S,J[i],i,J)}}},2p:1a(fn,2S){3Q.ag(J,fn,2S);1b J}});K GI=1a(1i){3P(7Q(1i)){1q"4u":1b 1i.6w();1q"1A":1b 5c.6w(1i);5P:1b 1i}};3Q.81("6w",1a(){K i=J.1f,6w=1T 3Q(i);4x(i--){6w[i]=GI(J[i])}1b 6w});K GE=1a(c7,1r,6m){3P(7Q(6m)){1q"1A":if(7Q(c7[1r])=="1A"){5c.HB(c7[1r],6m)}1j{c7[1r]=5c.6w(6m)}1s;1q"4u":c7[1r]=6m.6w();1s;5P:c7[1r]=6m}1b c7};5c.4C({HB:1a(c7,k,v){if(7Q(k)=="4F"){1b GE(c7,k,v)}1p(K i=1,l=2F.1f;i<l;i++){K 1A=2F[i];1p(K 1r in 1A){GE(c7,1r,1A[1r])}}1b c7},6w:1a(1A){K 6w={};1p(K 1r in 1A){6w[1r]=GI(1A[1r])}1b 6w},2Y:1a(pe){1p(K i=1,l=2F.1f;i<l;i++){K Gv=2F[i]||{};1p(K 1r in Gv){pe[1r]=Gv[1r]}}1b pe}});["5c","10W","10V","10X","10Z"].2p(1a(1x){1T au(1x)});K Ks=5Y.7R();62.4C("10Y",1a(){1b(Ks++).3X(36)})})();3Q.81({sX:1a(fn,2S){1p(K i=0,l=J.1f>>>0;i<l;i++){if(i in J&&!fn.2J(2S,J[i],i,J)){1b 1k}}1b 1l},42:1a(fn,2S){K g2=[];1p(K 1o,i=0,l=J.1f>>>0;i<l;i++){if(i in J){1o=J[i];if(fn.2J(2S,1o,i,J)){g2.1G(1o)}}}1b g2},5f:1a(1i,2L){K 1f=J.1f>>>0;1p(K i=2L<0?3A.4n(0,1f+2L):2L||0;i<1f;i++){if(J[i]===1i){1b i}}1b-1},ba:1a(fn,2S){K 1f=J.1f>>>0,g2=3Q(1f);1p(K i=0;i<1f;i++){if(i in J){g2[i]=fn.2J(2S,J[i],i,J)}}1b g2},JW:1a(fn,2S){1p(K i=0,l=J.1f>>>0;i<l;i++){if(i in J&&fn.2J(2S,J[i],i,J)){1b 1l}}1b 1k},JX:1a(){1b J.42(1a(1i){1b 1i!=1d})},124:1a(JV){K 2w=3Q.4d(2F,1);1b J.ba(1a(1i){1b 1i[JV].3v(1i,2w)})},126:1a(95){K 1y={},1f=3A.6d(J.1f,95.1f);1p(K i=0;i<1f;i++){1y[95[i]]=J[i]}1b 1y},2k:1a(1A){K 1O={};1p(K i=0,l=J.1f;i<l;i++){1p(K 1r in 1A){if(1A[1r](J[i])){1O[1r]=J[i];4r 1A[1r];1s}}}1b 1O},d0:1a(1i,2L){1b J.5f(1i,2L)!=-1},2Y:1a(4u){J.1G.3v(J,4u);1b J},129:1a(){1b J.1f?J[J.1f-1]:1d},127:1a(){1b J.1f?J[6l.ni(0,J.1f-1)]:1d},JU:1a(1i){if(!J.d0(1i)){J.1G(1i)}1b J},123:1a(4u){1p(K i=0,l=4u.1f;i<l;i++){J.JU(4u[i])}1b J},11X:1a(1i){1p(K i=J.1f;i--;){if(J[i]===1i){J.5X(i,1)}}1b J},eC:1a(){J.1f=0;1b J},JY:1a(){K 4u=[];1p(K i=0,l=J.1f;i<l;i++){K 1C=7Q(J[i]);if(1C=="1d"){aN}4u=4u.4b(1C=="4u"||(1C=="JZ"||(1C=="2F"||xa(J[i],3Q)))?3Q.JY(J[i]):J[i])}1b 4u},122:1a(){1p(K i=0,l=J.1f;i<l;i++){if(J[i]!=1d){1b J[i]}}1b 1d},IU:1a(4u){if(J.1f!=3){1b 1d}K 4m=J.ba(1a(1o){if(1o.1f==1){1o+=1o}1b 1o.bw(16)});1b 4u?4m:"4m("+4m+")"},IR:1a(4u){if(J.1f<3){1b 1d}if(J.1f==4&&(J[3]==0&&!4u)){1b"121"}K 7b=[];1p(K i=0;i<3;i++){K wY=(J[i]-0).3X(16);7b.1G(wY.1f==1?"0"+wY:wY)}1b 4u?7b:"#"+7b.5x("")}});62.81({9A:1a(x9,1D){1b(7Q(x9)=="HO"?x9:1T e3(""+x9,1D)).9A(J)},d0:1a(4F,6e){1b 6e?(6e+J+6e).5f(6e+4F+6e)>-1:62(J).5f(4F)>-1},oi:1a(){1b 62(J).3u(/^\\s+|\\s+$/g,"")},JX:1a(){1b 62(J).3u(/\\s+/g," ").oi()},12a:1a(){1b 62(J).3u(/-\\D/g,1a(3y){1b 3y.cB(1).9p()})},12i:1a(){1b 62(J).3u(/[A-Z]/g,1a(3y){1b"-"+3y.cB(0).3W()})},12h:1a(){1b 62(J).3u(/\\b[a-z]/g,1a(3y){1b 3y.9p()})},12j:1a(){1b 62(J).3u(/([-.*+?^${}()|[\\]\\/\\\\])/g,"\\\\$1")},bw:1a(k2){1b 6u(J,k2||10)},4j:1a(){1b e8(J)},IU:1a(4u){K 7b=62(J).3y(/^#?(\\w{1,2})(\\w{1,2})(\\w{1,2})$/);1b 7b?7b.4d(1).IU(4u):1d},IR:1a(4u){K 4m=62(J).3y(/\\d{1,3}/g);1b 4m?4m.IR(4u):1d},12l:1a(1A,HO){1b 62(J).3u(HO||/\\\\?\\{([^{}]+)\\}/g,1a(3y,1x){if(3y.cB(0)=="\\\\"){1b 3y.4d(1)}1b 1A[1x]!=1d?1A[1x]:""})}});aX.4C({JP:1a(){1p(K i=0,l=2F.1f;i<l;i++){6E{1b 2F[i]()}6I(e){}}1b 1d}});aX.81({JP:1a(2w,2S){6E{1b J.3v(2S,3Q.2L(2w))}6I(e){}1b 1d},2S:1a(3h){K 2H=J,2w=2F.1f>1?3Q.4d(2F,1):1d,F=1a(){};K HX=1a(){K 2V=3h,1f=2F.1f;if(J g6 HX){F.3g=2H.3g;2V=1T F}K 1O=!2w&&!1f?2H.2J(2V):2H.3v(2V,2w&&1f?2w.4b(3Q.4d(2F)):2w||2F);1b 2V==3h?1O:2V};1b HX},HU:1a(2w,2S){K 2H=J;if(2w!=1d){2w=3Q.2L(2w)}1b 1a(){1b 2H.3v(2S,2w||2F)}},hI:1a(hI,2S,2w){1b 6P(J.HU(2w==1d?[]:2w,2S),hI)},HV:1a(HV,2S,2w){1b qh(J.HU(2w==1d?[]:2w,2S),HV)}});6l.81({AI:1a(6d,4n){1b 3A.6d(4n,3A.4n(6d,J))},5o:1a(hP){hP=3A.6X(10,hP||0).5a(hP<0?-hP:0);1b 3A.5o(J*hP)/hP},e7:1a(fn,2S){1p(K i=0;i<J;i++){fn.2J(2S,i,J)}},4j:1a(){1b e8(J)},bw:1a(k2){1b 6u(J,k2||10)}});6l.aj("2p","e7");(1a(4g){K cE={};4g.2p(1a(1x){if(!6l[1x]){cE[1x]=1a(){1b 3A[1x].3v(1d,[J].4b(3Q.2L(2F)))}}});6l.81(cE)})(["4G","MV","u0","12k","HD","ko","aa","12g","bj","lI","4n","6d","6X","9E","bt","Nk"]);(1a(){K 6L=J.6L=1T au("6L",1a(1D){if(xa(1D,aX)){1D={dT:1D}}K kf=1a(){yv(J);if(kf.$HC){1b J}J.$ap=1d;K 1o=J.dT?J.dT.3v(J,2F):J;J.$ap=J.ap=1d;1b 1o}.4C(J).81(1D);kf.$5K=6L;kf.3g.$5K=kf;kf.3g.1P=1P;1b kf});K 1P=1a(){if(!J.$ap){98 1T 9Z(\'qQ 4h "1P" JO be x7.\')}K 1x=J.$ap.$1x,1P=J.$ap.$JT.1P,dQ=1P?1P.3g[1x]:1d;if(!dQ){98 1T 9Z(\'qQ 4h "\'+1x+\'" 3S no 1P.\')}1b dQ.3v(J,2F)};K yv=1a(1A){1p(K 1r in 1A){K 1o=1A[1r];3P(7Q(1o)){1q"1A":K F=1a(){};F.3g=1o;1A[1r]=yv(1T F);1s;1q"4u":1A[1r]=1o.6w();1s}}1b 1A};K ol=1a(2H,1r,4h){if(4h.$iM){4h=4h.$iM}K 6V=1a(){if(4h.$xc&&J.$ap==1d){98 1T 9Z(\'qQ 4h "\'+1r+\'" JO be x7.\')}K ap=J.ap,6m=J.$ap;J.ap=6m;J.$ap=6V;K 1O=4h.3v(J,2F);J.$ap=6m;J.ap=ap;1b 1O}.4C({$JT:2H,$iM:4h,$1x:1r});1b 6V};K 81=1a(1r,1o,JS){if(6L.Im.87(1r)){1o=6L.Im[1r].2J(J,1o);if(1o==1d){1b J}}if(7Q(1o)=="1a"){if(1o.$6f){1b J}J.3g[1r]=JS?1o:ol(J,1r,1o)}1j{5c.HB(J.3g,1r,1o)}1b J};K K8=1a(xb){xb.$HC=1l;K mv=1T xb;4r xb.$HC;1b mv};6L.81("81",81.iC());6L.Im={cG:1a(1P){J.1P=1P;J.3g=K8(1P)},11J:1a(1J){3Q.2L(1J).2p(1a(1i){K gA=1T 1i;1p(K 1r in gA){81.2J(J,1r,gA[1r],1l)}},J)}}})();(1a($){$.ga.aU="11E"in 2K;if(!$.ga.aU){1b}K mo=$.ui.uW.3g;K wZ=mo.wZ;K mq;1a hd(1N,K6){if(1N.fv.jB.1f>1){1b}1N.4I();K t=1N.fv.Kb[0];K I7=2K.O6("11A");I7.O5(K6,1l,1l,3z,1,t.O4,t.O9,t.dS,t.dA,1k,1k,1k,1k,0,1d);1N.3f.Ii(I7)}mo.K2=1a(1N){K me=J;if(mq||!me.11B(1N.fv.Kb[0])){1b}mq=1l;me.DF=1k;hd(1N,"iE");hd(1N,"bq");hd(1N,"88")};mo.K0=1a(1N){if(!mq){1b}J.DF=1l;hd(1N,"bq")};mo.K4=1a(1N){if(!mq){1b}hd(1N,"7i");hd(1N,"eM");if(!J.DF){hd(1N,"3F")}mq=1k};mo.wZ=1a(){K me=J;me.1g.2S("rL",$.b4(me,"K2")).2S("rG",$.b4(me,"K0")).2S("rH",$.b4(me,"K4"));wZ.2J(me)}})(2I);K k7=1d;(1a($){$.fn.oA=1a(){$(J).ia(1a(e){K t=e.7f;K o=$(e.7f).2v();if(e.7I-o.2f>t.nN){1b}K 1g=$(e.3f);1g.2O({x:e.dS,y:e.dA})})};K $Ld=$.fn.3F;$.fn.3F=1a 3F(5D,7F){if(!7F){1b $Ld.3v(J,2F)}1b $(J).2S(1C,7F)};$.fn.ia=1a ia(){K 2w=[].5X.2J(2F,0),7F=2w.eJ(),5D=2w.eJ(),$J=$(J);1b 7F?$J.3F(5D,7F):$J.1R(1C)};$.ia={5D:9i};$.1N.11Q.ia={I9:1a(1h,cF){if(!/11M|11L|11N/i.9A(cQ.h3)){$(J).2S(Le,E9).2S([L4,L2,L0,La].5x(" "),E6).2S(Ee,3F)}1j{Lg(J).2S(L9,E9).2S([L7,Lp,Lo].5x(" "),E6).2S(Ee,3F).2T({11P:"3r"})}},11O:1a(cF){$(J).8Q(aq)}};1a Lg(1g){$.2p("rL rG rH DW".3R(/ /),1a 2S(ix,it){1g.dw(it,1a 10I(1N){$(1g).1R(it)},1k)});1b $(1g)}1a E9(1N){if(k7){1b}K 1g=J;K 2w=2F;$(J).1h(wx,1k);k7=6P(Lf,$.ia.5D);1a Lf(){$(1g).1h(wx,1l);1N.1C=1C;2I.1N.ZC.3v(1g,2w)}}1a E6(1N){if(k7){iB(k7);k7=1d}}1a 3F(1N){if($(J).1h(wx)){1b 1N.fB()||1k}}K 1C="ia";K aq="."+1C;K Le="88"+aq;K Ee="3F"+aq;K L4="bq"+aq;K L2="7i"+aq;K L0="eM"+aq;K La="5H"+aq;K L9="rL"+aq;K L7="rH"+aq;K Lp="rG"+aq;K Lo="DW"+aq;K Zz="5D"+aq;K ZH="a5"+aq;K wx="SR"+aq})(2I);(1a($){$.fn.uL=1a(1v){K k4=$.4C({},$.fn.uL.bk,1v);1b J.2p(1a(){$J=$(J);K o=$.ZQ?$.4C({},k4,$J.1h()):k4;K pf=o.3a;$.fn.nJ(o,$J,pf)})};K Fb=0;K wM=0;K ZS=cQ.ZR;K Ln=cQ.ZN;if(Ln.5f("ZJ 7.0")>0){K wC="wJ"}$.fn.uL.bk={7a:5,3a:12,4T:5,gn:1l,D8:"#mF",mU:"#ZI",mX:"ZK",Fn:"#mF",mP:"#mF",mO:"#mF",6o:1l,Cc:1l,uW:"ZM",o4:1a(){1b 1k}};$.fn.nJ=1a(o,1y,pf){if(o.4T>o.7a){o.4T=o.7a}$J.eC();if(o.Cc){K Ls="ah-Lr-e1";K Lj="ah-dQ-e1";K Li="ah-Lh-e1";K Lm="ah-3C-e1"}1j{K Ls="ah-Lr";K Lj="ah-dQ";K Li="ah-Lh";K Lm="ah-3C"}if(o.6o){K Fu=$("<2C>&lt;</2C>").dC({d9:{oR:"ui-3T-Lk-1-w"},2g:1k})}$J.3J(\'<2C id="Zh">\'+\'<2C id="Zd">\'+\'<2C id="Z9">\'+\'<2C id="wA"></2C>\'+\'<2C id="wt"></2C>\'+\'<2C id="qw"></2C>\'+"</2C>"+"</2C>"+"</2C>");K Ll=$("#wA").2r("ah-3q-w2");Ll.2Y(Fu);K 9e=$(\'<1I yB="0" yG="0">\').2T("e9","6f");K ks=$("<tr>").2r("ah-Z8");K c=(o.4T-1)/2;K 4A=pf-c;K po;1p(K i=0;i<o.7a;i++){K 2b=i+1;if(2b==pf){K oZ=$(\'<td 2s="li">\').3J(\'<2u 2s="ah-6m">\'+2b+"</2u>");po=oZ;ks.2Y(oZ)}1j{K oZ=$(\'<td 2s="li">\').3J("<a>"+2b+"</a>");ks.2Y(oZ)}}9e.2Y(ks);if(o.6o){K Fz=$("<2C>&gt;</2C>").dC({d9:{oR:"ui-3T-Lk-1-e"},2g:1k})}K qK=$("#wt").2r("ah-3q-Zb");qK.2Y(Fz);$("#qw").2Y(9e);K ws=$("#qw");K Dk=1d;1a KZ(){$("#wA").3B();$("#wt").3B()}1a KJ(){$("#wA").5k();$("#wt").5k()}1a Dl(){if(ws.1m()==0){1b}xo(Dk);if(9e.1m()<=ws.1m()){KZ()}1j{KJ()}}if(ws.1m()==0){Dk=qh(Dl,n7)}1j{Dl()}$J.2r("Zp");if(!o.gn){if(o.mX=="3r"){K g7={"3Y":o.mU}}1j{K g7={"3Y":o.mU,"mM-3Y":o.mX}}if(o.mO=="3r"){K fY={"3Y":o.mP}}1j{K fY={"3Y":o.mP,"mM-3Y":o.mO}}}1j{if(o.mX=="3r"){K g7={"3Y":o.mU,"gn":"nv qF "+o.D8}}1j{K g7={"3Y":o.mU,"mM-3Y":o.mX,"gn":"nv qF "+o.D8}}if(o.mO=="3r"){K fY={"3Y":o.mP,"gn":"nv qF "+o.Fn}}1j{K fY={"3Y":o.mP,"mM-3Y":o.mO,"gn":"nv qF "+o.Fn}}}$.fn.Ff(o,$J,g7,fY,ks,9e,qK);K Fw=Fb-1;if(wC=="wJ"){}1j{}if(o.uW=="SI"){Fz.88(1a(){ww=qh(1a(){K 2f=9e.1P().57()+5;9e.1P().57(2f)},20)}).7i(1a(){xo(ww)});Fu.88(1a(){ww=qh(1a(){K 2f=9e.1P().57()-5;9e.1P().57(2f)},20)}).7i(1a(){xo(ww)})}9e.2B(".li").3F(1a(e){po.3J("<a>"+po.2B(".ah-6m").3J()+"</a>");K Fv=$(J).2B("a").3J();$(J).3J(\'<2u 2s="ah-6m">\'+Fv+"</2u>");po=$(J);$.fn.Ff(o,$(J).1P().1P().1P(),g7,fY,ks,9e,qK);K 2f=J.9s/2;K 10s=9e.57()+2f;K 8S=2f-Fw/2;if(wC=="wJ"){9e.51({57:2f+8S+52+"px"})}1j{9e.51({57:2f+8S+"px"})}o.o4(Fv)});K 7W=9e.2B(".li").eq(o.3a-1);K 2f=0;if(7W.1f){2f=7W[0].9s/2}K 8S=2f-Fw/2;if(wC=="wJ"){9e.51({57:2f+8S+52+"px"})}1j{9e.51({57:2f+8S+"px"})}};$.fn.Ff=1a(o,1y,g7,fY,ks,9e,qK){1y.2B("a").2T(g7);1y.2B("2u.ah-6m").2T(fY);1y.2B("a").7r(1a(){$(J).2T(fY)},1a(){$(J).2T(g7)});wM=0;1y.2B(".li").2p(1a(i,n){if(i==o.4T-1){Fb=J.9s+J.ik}wM+=J.ik});wM+=3}})(2I);(1a($){$.4C({ho:1a(fn,wE,al,Fc){K a5;1b 1a(){K 2w=2F;al=al||J;Fc&&(!a5&&fn.3v(al,2w));iB(a5);a5=6P(1a(){!Fc&&fn.3v(al,2w);a5=1d},wE)}},BD:1a(fn,wE,al){K a5,2w,wL;1b 1a(){2w=2F;wL=1l;al=al||J;if(!a5){(1a(){if(wL){fn.3v(al,2w);wL=1k;a5=6P(2F.KH,wE)}1j{a5=1d}})()}}}})})(2I);(1a($){K ku={l9:{FQ:1a(i){3P(J.la(i)){1q"4u":;1q"10y":;1q"d8":1b i.3X();1q"1A":K o=[];1p(x=0;x<i.1f;i++){o.1G(i+": "+J.FQ(i[x]))}1b o.5x(", ");1q"4F":1b i;5P:1b i}},la:1a(i){if(!i||!i.5K){1b 2A i}K 3y=i.5K.3X().3y(/3Q|6l|62|5c|5Y/);1b 3y&&3y[0].3W()||2A i},mg:1a(82,l,s,t){K p=s||" ";K o=82;if(l-82.1f>0){o=(1T 3Q(3A.ko(l/ p.1f))).5x(p).7x(0, t = !t ? l : t == 1 ? 0 : 3A.ko(l /2))+82+p.7x(0,l-t)}1b o},KM:1a(4M,2w){K 1r=4M.wH();3P(J.la(2w)){1q"1A":K 95=1r.3R(".");K 1y=2w;1p(K dq=0;dq<95.1f;dq++){1y=1y[95[dq]]}if(2A 1y!="2y"){if(ku.l9.la(1y)=="4u"){1b 4M.kr().3y(/\\.\\*/)&&1y[1]||1y}1b 1y}1j{}1s;1q"4u":1r=6u(1r,10);if(4M.kr().3y(/\\.\\*/)&&2A 2w[1r+1]!="2y"){1b 2w[1r+1]}1j{if(2A 2w[1r]!="2y"){1b 2w[1r]}1j{1b 1r}}1s}1b"{"+1r+"}"},KL:1a(ey,2w){K 4M=1T KD(ey,2w);1b ku.l9[4M.kr().4d(-1)](J.KM(4M,2w),4M)},d:1a(2a,4M){K o=6u(2a,10);K p=4M.qe();if(p){1b J.mg(o.3X(),p,4M.qg(),0)}1j{1b o}},i:1a(2a,2w){1b J.d(2a,2w)},o:1a(2a,4M){K o=2a.3X(8);if(4M.q5()){o=J.mg(o,o.1f+1,"0",0)}1b J.mg(o,4M.qe(),4M.qg(),0)},u:1a(2a,2w){1b 3A.4G(J.d(2a,2w))},x:1a(2a,4M){K o=6u(2a,10).3X(16);o=J.mg(o,4M.qe(),4M.qg(),0);1b 4M.q5()?"10z"+o:o},X:1a(2a,4M){1b J.x(2a,4M).9p()},e:1a(2a,4M){1b e8(2a,10).Fl(4M.wF())},E:1a(2a,4M){1b J.e(2a,4M).9p()},f:1a(2a,4M){1b J.mg(e8(2a,10).5a(4M.wF()),4M.qe(),4M.qg(),0)},F:1a(2a,2w){1b J.f(2a,2w)},g:1a(2a,4M){K o=e8(2a,10);1b o.3X().1f>6?3A.5o(o.Fl(4M.wF())):o},G:1a(2a,2w){1b J.g(2a,2w)},c:1a(2a,2w){K 3y=2a.3y(/\\w|\\d/);1b 3y&&3y[0]||""},r:1a(2a,2w){1b J.FQ(2a)},s:1a(2a,2w){1b 2a.3X&&2a.3X()||""+2a}},7l:1a(82,2w){K 5e=0;K 3a=0;K 3y=1k;K kt=[];K ey="";K 8S=(82||"").3R("");1p(3a=0;3a<8S.1f;3a++){if(8S[3a]=="{"&&8S[3a+1]!="{"){5e=82.5f("}",3a);ey=8S.4d(3a+1,5e).5x("");kt.1G(ku.l9.KL(ey,2A 2F[1]!="1A"?KC(2F,2):2w||[]))}1j{if(3a>5e||kt.1f<1){kt.1G(8S[3a])}}}1b kt.1f>1?kt.5x(""):kt[0]},102:1a(82,2w){1b w4(7l(82,2w))},lV:1a(s,n){1b(1T 3Q(n+1)).5x(s)},105:1a(s){1b 104(ZY(s))},ZU:1a(s){1b ZT(ZV(s))},ZX:1a(){K 2E="",ZW=1l;if(2F.1f==2&&$.cd(2F[1])){J[2F[0]]=2F[1].5x("");1b 2I}if(2F.1f==2&&$.107(2F[1])){J[2F[0]]=2F[1];1b 2I}if(2F.1f==1){1b $(J[2F[0]])}if(2F.1f==2&&2F[1]==1k){1b J[2F[0]]}if(2F.1f==2&&$.KK(2F[1])){1b $($.7l(J[2F[0]],2F[1]))}if(2F.1f==3&&$.KK(2F[1])){1b 2F[2]==1l?$.7l(J[2F[0]],2F[1]):$($.7l(J[2F[0]],2F[1]))}}};K KD=1a(4M,2w){J.FX=4M;J.kq=2w;J.10h=e8("1."+(1T 3Q(32)).5x("1"),10).3X().1f-3;J.qS=6;J.qc=1a(){1b J.FX};J.wH=1a(){1b J.FX.3R(":")[0]};J.kr=1a(){K 3y=J.qc().3R(":");1b 3y&&3y[1]?3y[1]:"s"};J.wF=1a(){K 3y=J.kr().3y(/\\.(\\d+|\\*)/g);if(!3y){1b J.qS}1j{3y=3y[0].4d(1);if(3y!="*"){1b 6u(3y,10)}1j{if(ku.l9.la(J.kq)=="4u"){1b J.kq[1]&&J.kq[0]||J.qS}1j{if(ku.l9.la(J.kq)=="1A"){1b J.kq[J.wH()]&&J.kq[J.wH()][0]||J.qS}1j{1b J.qS}}}}};J.qe=1a(){K 3y=1k;if(J.q5()){3y=J.qc().3y(/0?#0?(\\d+)/);if(3y&&3y[1]){1b 6u(3y[1],10)}}3y=J.qc().3y(/(0|\\.)(\\d+|\\*)/g);1b 3y&&6u(3y[0].4d(1),10)||0};J.qg=1a(){K o="";if(J.q5()){o=" "}if(J.kr().3y(/#0|0#|^0|\\.\\d+/)){o="0"}1b o};J.10b=1a(){K 3y=J.qc().10d(/^(0|\\#|\\-|\\+|\\s)+/);1b 3y&&3y[0].3R("")||[]};J.q5=1a(){1b!!J.kr().3y(/^0?#/)}};K KC=1a(2w,dP){K o=[];1p(l=2w.1f,x=(dP||0)-1;x<l;x++){o.1G(2w[x])}1b o};$.4C(ku)})(2I);(1a($){$.hn=1a(o){if(2A fk=="1A"&&fk.KB){1b fk.KB(o)}K 1C=2A o;if(o===1d){1b"1d"}if(1C=="2y"){1b 2y}if(1C=="d8"||1C=="qk"){1b o+""}if(1C=="4F"){1b $.FM(o)}if(1C=="1A"){if(2A o.hn=="1a"){1b $.hn(o.hn())}if(o.5K===5Y){K q9=o.10c()+1;if(q9<10){q9="0"+q9}K q8=o.12m();if(q8<10){q8="0"+q8}K KG=o.14v();K qr=o.14u();if(qr<10){qr="0"+qr}K qu=o.14w();if(qu<10){qu="0"+qu}K qt=o.14y();if(qt<10){qt="0"+qt}K hU=o.14x();if(hU<100){hU="0"+hU}if(hU<10){hU="0"+hU}1b\'"\'+KG+"-"+q9+"-"+q8+"T"+qr+":"+qu+":"+qt+"."+hU+\'Z"\'}if(o.5K===3Q){K 8W=[];1p(K i=0;i<o.1f;i++){8W.1G($.hn(o[i])||"1d")}1b"["+8W.5x(",")+"]"}K FL=[];1p(K k in o){K 1x;K 1C=2A k;if(1C=="d8"){1x=\'"\'+k+\'"\'}1j{if(1C=="4F"){1x=$.FM(k)}1j{aN}}if(2A o[k]=="1a"){aN}K 2b=$.hn(o[k]);FL.1G(1x+":"+2b)}1b"{"+FL.5x(", ")+"}"}};$.14s=1a(4J){if(2A fk=="1A"&&fk.xI){1b fk.xI(4J)}1b w4("("+4J+")")};$.14r=1a(4J){if(2A fk=="1A"&&fk.xI){1b fk.xI(4J)}K gZ=4J;gZ=gZ.3u(/\\\\["\\\\\\/14H]/g,"@");gZ=gZ.3u(/"[^"\\\\\\n\\r]*"|1l|1k|1d|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?/g,"]");gZ=gZ.3u(/(?:^|:|,)(?:\\s*\\[)+/g,"");if(/^[\\],:{}\\s]*$/.9A(gZ)){1b w4("("+4J+")")}1j{98 1T 14G("9Z 14I fk, c7 is 6r 14J.")}};$.FM=1a(4F){if(4F.3y(EA)){1b\'"\'+4F.3u(EA,1a(a){K c=KV[a];if(2A c==="4F"){1b c}c=a.KF();1b"\\\\14B"+3A.bj(c/16).3X(16)+(c%16).3X(16)})+\'"\'}1b\'"\'+4F+\'"\'};K EA=/["\\\\\\14C-\\14E\\14D-\\14n]/g;K KV={"\\b":"\\\\b","\\t":"\\\\t","\\n":"\\\\n","\\f":"\\\\f","\\r":"\\\\r",\'"\':\'\\\\"\',"\\\\":"\\\\\\\\"}})(2I);(1a($){$.fn.EH=1a(){K 5L=1a(el,v,t,sO){K 2W=2K.eB("2W");2W.1o=v,2W.2g=t;K o=el.1v;K oL=o.1f;if(!el.8y){el.8y={};1p(K i=0;i<oL;i++){el.8y[o[i].1o]=i}}if(2A el.8y[v]=="2y"){el.8y[v]=oL}el.1v[el.8y[v]]=2W;if(sO){2W.1Z=1l}};K a=2F;if(a.1f==0){1b J}K sO=1l;K m=1k;K 1J,v,t;if(2A a[0]=="1A"){m=1l;1J=a[0]}if(a.1f>=2){if(2A a[1]=="qk"){sO=a[1]}1j{if(2A a[2]=="qk"){sO=a[2]}}if(!m){v=a[0];t=a[1]}}J.2p(1a(){if(J.9h.3W()!="2x"){1b}if(m){1p(K 1i in 1J){5L(J,1i,1J[1i],sO)}}1j{5L(J,v,t,sO)}});1b J};$.fn.145=1a(5l,1D,2x,fn,2w){if(2A 5l!="4F"){1b J}if(2A 1D!="1A"){1D={}}if(2A 2x!="qk"){2x=1l}J.2p(1a(){K el=J;$.148(5l,1D,1a(r){$(el).EH(r,2x);if(2A fn=="1a"){if(2A 2w=="1A"){fn.3v(el,2w)}1j{fn.2J(el)}}})});1b J};$.fn.KU=1a(){K a=2F;if(a.1f==0){1b J}K ta=2A a[0];K v,1W;if(ta=="4F"||(ta=="1A"||ta=="1a")){v=a[0];if(v.5K==3Q){K l=v.1f;1p(K i=0;i<l;i++){J.KU(v[i],a[1])}1b J}}1j{if(ta=="d8"){1W=a[0]}1j{1b J}}J.2p(1a(){if(J.9h.3W()!="2x"){1b}if(J.8y){J.8y=1d}K 3M=1k;K o=J.1v;if(!!v){K oL=o.1f;1p(K i=oL-1;i>=0;i--){if(v.5K==e3){if(o[i].1o.3y(v)){3M=1l}}1j{if(o[i].1o==v){3M=1l}}if(3M&&a[1]===1l){3M=o[i].1Z}if(3M){o[i]=1d}3M=1k}}1j{if(a[1]===1l){3M=o[1W].1Z}1j{3M=1l}if(3M){J.3M(1W)}}});1b J};$.fn.149=1a(Ex){K KT=$(J).KY();K a=2A Ex=="2y"?1l:!!Ex;J.2p(1a(){if(J.9h.3W()!="2x"){1b}K o=J.1v;K oL=o.1f;K sA=[];1p(K i=0;i<oL;i++){sA[i]={v:o[i].1o,t:o[i].2g}}sA.hQ(1a(o1,o2){xK=o1.t.3W(),xJ=o2.t.3W();if(xK==xJ){1b 0}if(a){1b xK<xJ?-1:1}1j{1b xK>xJ?-1:1}});1p(K i=0;i<oL;i++){o[i].2g=sA[i].t;o[i].1o=sA[i].v}}).wP(KT,1l);1b J};$.fn.wP=1a(1o,9J){K v=1o;K vT=2A 1o;if(vT=="1A"&&v.5K==3Q){K $J=J;$.2p(v,1a(){$J.wP(J,9J)})}K c=9J||1k;if(vT!="4F"&&(vT!="1a"&&vT!="1A")){1b J}J.2p(1a(){if(J.9h.3W()!="2x"){1b J}K o=J.1v;K oL=o.1f;1p(K i=0;i<oL;i++){if(v.5K==e3){if(o[i].1o.3y(v)){o[i].1Z=1l}1j{if(c){o[i].1Z=1k}}}1j{if(o[i].1o==v){o[i].1Z=1l}1j{if(c){o[i].1Z=1k}}}}});1b J};$.fn.13X=1a(to,mY){K w=mY||"1Z";if($(to).4l()==0){1b J}J.2p(1a(){if(J.9h.3W()!="2x"){1b J}K o=J.1v;K oL=o.1f;1p(K i=0;i<oL;i++){if(w=="76"||w=="1Z"&&o[i].1Z){$(to).EH(o[i].1o,o[i].2g)}}});1b J};$.fn.13W=1a(1o,fn){K a4=1k;K v=1o;K vT=2A v;K fT=2A fn;if(vT!="4F"&&(vT!="1a"&&vT!="1A")){1b fT=="1a"?J:a4}J.2p(1a(){if(J.9h.3W()!="2x"){1b J}if(a4&&fT!="1a"){1b 1k}K o=J.1v;K oL=o.1f;1p(K i=0;i<oL;i++){if(v.5K==e3){if(o[i].1o.3y(v)){a4=1l;if(fT=="1a"){fn.2J(o[i],i)}}}1j{if(o[i].1o==v){a4=1l;if(fT=="1a"){fn.2J(o[i],i)}}}}});1b fT=="1a"?J:a4};$.fn.KY=1a(){K v=[];J.En().2p(1a(){v[v.1f]=J.1o});1b v};$.fn.13Y=1a(){K t=[];J.En().2p(1a(){t[t.1f]=J.2g});1b t};$.fn.En=1a(){1b J.2B("2W:1Z")}})(2I);(1a($){$.4C($.fn,{ss:1a(c1,c2){K KX=J.42("."+c1);J.42("."+c2).3K(c2).2r(c1);KX.3K(c1).2r(c2);1b J},kw:1a(c1,c2){1b J.42("."+c1).3K(c1).2r(c2).5e()},yu:1a(db){db=db||"7r";1b J.7r(1a(){$(J).2r(db)},1a(){$(J).3K(db)})},KP:1a(iv,1X){iv?J.51({1w:"dR"},iv,1X):J.2p(1a(){2I(J)[2I(J).is(":6f")?"5k":"3B"]();if(1X){1X.3v(J,2F)}})},KO:1a(iv,1X){if(iv){J.51({1w:"3B"},iv,1X)}1j{J.3B();if(1X){J.2p(1X)}}},EU:1a(3i){if(!3i.KW){J.42(":7W-wl:6r(ul)").2r(5C.7W);J.42((3i.b7?"":"."+5C.ES)+":6r(."+5C.7C+")").2B(">ul").3B()}1b J.42(":3S(>ul)")},EQ:1a(3i,kX){if(!3i.KW){J.42(":3S(>ul:6f)").2r(5C.9K).kw(5C.7W,5C.kh);J.6r(":3S(>ul:6f)").2r(5C.dH).kw(5C.7W,5C.kg);J.lq(\'<2C 2s="\'+5C.4Z+\'"/>\').2B("2C."+5C.4Z).2p(1a(){K ha="";$.2p($(J).1P().1n("2s").3R(" "),1a(){ha+=J+"-4Z "});$(J).2r(ha)})}J.2B("2C."+5C.4Z).3F(kX)},nG:1a(3i){3i=$.4C({EY:"nG"},3i);if(3i.5L){1b J.1R("5L",[3i.5L])}if(3i.dR){K 1X=3i.dR;3i.dR=1a(){1b 1X.3v($(J).1P()[0],2F)}}1a KQ(3I,3q){1a 7F(42){1b 1a(){kX.3v($("2C."+5C.4Z,3I).42(1a(){1b 42?$(J).1P("."+42).1f:1l}));1b 1k}}$("a:eq(0)",3q).3F(7F(5C.dH));$("a:eq(1)",3q).3F(7F(5C.9K));$("a:eq(2)",3q).3F(7F())}1a kX(){$(J).1P().2B(">.4Z").ss(5C.F6,5C.EL).ss(5C.xL,5C.xE).5e().ss(5C.dH,5C.9K).ss(5C.kg,5C.kh).2B(">ul").KP(3i.iv,3i.dR);if(3i.14i){$(J).1P().Fe().2B(">.4Z").kw(5C.F6,5C.EL).kw(5C.xL,5C.xE).5e().kw(5C.dH,5C.9K).kw(5C.kg,5C.kh).2B(">ul").KO(3i.iv,3i.dR)}}1a DV(){1a 14m(4M){1b 4M?1:0}K 1h=[];ki.2p(1a(i,e){1h[i]=$(e).is(":3S(>ul:6v)")?1:0});$.F4(3i.EY,1h.5x(""))}1a KR(){K F2=$.F4(3i.EY);if(F2){K 1h=F2.3R("");ki.2p(1a(i,e){$(e).2B(">ul")[6u(1h[i])?"5k":"3B"]()})}}J.2r("nG");K ki=J.2B("li").EU(3i);3P(3i.14h){1q"F4":K EO=3i.dR;3i.dR=1a(){DV();if(EO){EO.3v(J,2F)}};KR();1s;1q"gf":K 6m=J.2B("a").42(1a(){1b J.5B.3W()==gf.5B.3W()});if(6m.1f){6m.2r("1Z").7u("ul, li").5L(6m.3C()).5k()}1s}ki.EQ(3i,kX);if(3i.3q){KQ(J,3i.3q);$(3i.3q).5k()}1b J.2S("5L",1a(1N,ki){$(ki).49().3K(5C.7W).3K(5C.kg).3K(5C.kh).2B(">.4Z").3K(5C.xL).3K(5C.xE);$(ki).2B("li").M4().EU(3i).EQ(3i,kX)})}});K 5C=$.fn.nG.ha={7C:"7C",ES:"ES",9K:"9K",EL:"9K-4Z",xE:"kh-4Z",dH:"dH",F6:"dH-4Z",xL:"kg-4Z",kg:"kg",kh:"kh",7W:"7W",4Z:"4Z"};$.fn.14g=$.fn.nG})(2I);(1a($,2y){$.ga.JN="14f"in 3z;$.ga.JI="15k"in 3z;$.ga.Js="15j"in 2K.9l;if(!$.ui||!$.ui.8u){K Jb=$.J9;$.J9=1a(Er){1p(K i=0,4e;(4e=Er[i])!=1d;i++){6E{$(4e).15l("3M")}6I(e){}}Jb(Er)}}K $8H=1d,rh=1k,$5U=$(3z),cV=0,cF={},aM={},mr={},bk={4s:1d,4o:1d,1R:"8K",JJ:1k,hI:gI,mR:1k,JB:1a($1V){if($.ui&&$.ui.2R){$1V.2T("4T","5J").2R({my:"2f 1M",at:"2f 4P",of:J,2v:"0 5",jk:"cn"}).2T("4T","3r")}1j{K 2v=J.2v();2v.1M+=J.7h();2v.2f+=J.8q()/ 2 - $1V.8q() /2;$1V.2T(2v)}},2R:1a(1L,x,y){K $J=J,2v;if(!x&&!y){1L.JB.2J(J,1L.$1V);1b}1j{if(x==="JE"&&y==="JE"){2v=1L.$1V.2R()}1j{2v={1M:y,2f:x}}}K 4P=$5U.4O()+$5U.1w(),8K=$5U.57()+$5U.1m(),1w=1L.$1V.1w(),1m=1L.$1V.1m();if(2v.1M+1w>4P){2v.1M-=1w}if(2v.1M<0){2v.1M=0}if(2v.2f+1m>8K){2v.2f-=1m}1L.$1V.2T(2v)},Jz:1a($1V){if($.ui&&$.ui.2R){$1V.2T("4T","5J").2R({my:"2f 1M",at:"8K 1M",of:J,jk:"15n cn"}).2T("4T","")}1j{K 2v={1M:0,2f:J.8q()};$1V.2T(2v)}},4t:15m,7v:{5D:0,5k:"RN",3B:"RK"},4U:{5k:$.ux,3B:$.ux},1X:1d,1J:{}},cA={a5:1d,7I:1d,8a:1d},JG=1a($t){1b 15i;K xR=0,$tt=$t;4x(1l){xR=3A.4n(xR,6u($tt.2T("z-1W"),10)||0);$tt=$tt.1P();if(!$tt||(!$tt.1f||"3J 3H".5f($tt.6U("9h").3W())>-1)){1s}}1b xR},5w={qE:1a(e){e.4I();e.fB()},5H:1a(e){K $J=$(J);if(e.1h.1R=="8K"){e.4I();e.fB()}if(e.1h.1R!="8K"&&e.fv){1b}if($J.4H("2V-1V-8R")){1b}if(!$J.4H("2V-1V-2P")){$8H=$J;if(e.1h.9M){K lw=e.1h.9M($8H,e);if(lw===1k){1b}if(lw.1X!==2y&&lw.1X!=1d){e.1h.1X=lw.1X}e.1h=$.4C(1l,{},lw,bk,e.1h||{});if(!e.1h.1J||$.Jc(e.1h.1J)){if(3z.dE){(dE.5q||dE.lI).2J(dE,"No 1J xA to 5k in 2O")}98 1T 9Z("No 2Q xA")}e.1h.$1R=$8H;op.8E(e.1h)}op.5k.2J($J,e.1h,e.7I,e.8a)}},3F:1a(e){e.4I();e.fB();$(J).1R($.xP("5H",{1h:e.1h,7I:e.7I,8a:e.8a}))},88:1a(e){K $J=$(J);if($8H&&($8H.1f&&!$8H.is($J))){$8H.1h("2O").$1V.1R("5H:3B")}if(e.3d==2){$8H=$J.1h("FT",1l)}},7i:1a(e){K $J=$(J);if($J.1h("FT")&&($8H&&($8H.1f&&($8H.is($J)&&!$J.4H("2V-1V-2P"))))){e.4I();e.fB();$8H=$J;$J.1R($.xP("5H",{1h:e.1h,7I:e.7I,8a:e.8a}))}$J.sB("FT")},nU:1a(e){K $J=$(J),$lF=$(e.pc),$2K=$(2K);if($lF.is(".2V-1V-5r")||$lF.jV(".2V-1V-5r").1f){1b}if($8H&&$8H.1f){1b}cA.7I=e.7I;cA.8a=e.8a;cA.1h=e.1h;$2K.on("bq.Jx",5w.bq);cA.a5=6P(1a(){cA.a5=1d;$2K.fG("bq.Jx");$8H=$J;$J.1R($.xP("5H",{1h:cA.1h,7I:cA.7I,8a:cA.8a}))},e.1h.hI)},bq:1a(e){cA.7I=e.7I;cA.8a=e.8a},qY:1a(e){K $lF=$(e.pc);if($lF.is(".2V-1V-5r")||$lF.jV(".2V-1V-5r").1f){1b}6E{iB(cA.a5)}6I(e){}cA.a5=1d},Jo:1a(e){K $J=$(J),2D=$J.1h("av"),3d=e.3d,x=e.7I,y=e.8a,3f,2v;e.4I();e.fB();6P(1a(){K $3z;K FR=2D.1R=="2f"&&3d===0||2D.1R=="8K"&&3d===2;if(2K.qn&&2D.$78){2D.$78.3B();3f=2K.qn(x-$5U.57(),y-$5U.4O());2D.$78.5k()}if(2D.mR&&FR){if(2K.qn){if(2D.$1R.is(3f)||2D.$1R.3S(3f).1f){2D.2R.2J(2D.$1R,2D,x,y);1b}}1j{2v=2D.$1R.2v();$3z=$(3z);2v.1M+=$3z.4O();if(2v.1M<=e.8a){2v.2f+=$3z.57();if(2v.2f<=e.7I){2v.4P=2v.1M+2D.$1R.7h();if(2v.4P>=e.8a){2v.8K=2v.2f+2D.$1R.8q();if(2v.8K>=e.7I){2D.2R.2J(2D.$1R,2D,x,y);1b}}}}}}if(3f&&FR){2D.$1R.tF("5H:6f",1a(){$(3f).2O({x:x,y:y})})}2D.$1V.1R("5H:3B")},50)},iF:1a(e,1L){if(!1L.fC){e.4I()}e.6R()},1r:1a(e){K 1L={};if($8H){1L=$8H.1h("2O")||{}}3P(e.3Z){1q 9:;1q 38:5w.iF(e,1L);if(1L.fC){if(e.3Z==9&&e.nV){e.4I();1L.$1Z&&1L.$1Z.2B("2a, 8D, 2x").4W();1L.$1V.1R("HG");1b}1j{if(e.3Z==38&&1L.$1Z.2B("2a, 8D, 2x").6U("1C")=="9f"){e.4I();1b}}}1j{if(e.3Z!=9||e.nV){1L.$1V.1R("HG");1b}};1q 40:5w.iF(e,1L);if(1L.fC){if(e.3Z==9){e.4I();1L.$1Z&&1L.$1Z.2B("2a, 8D, 2x").4W();1L.$1V.1R("xj");1b}1j{if(e.3Z==40&&1L.$1Z.2B("2a, 8D, 2x").6U("1C")=="9f"){e.4I();1b}}}1j{1L.$1V.1R("xj");1b}1s;1q 37:5w.iF(e,1L);if(1L.fC||(!1L.$1Z||!1L.$1Z.1f)){1s}if(!1L.$1Z.1P().4H("2V-1V-2D")){K $1P=1L.$1Z.1P().1P();1L.$1Z.1R("5H:4W");1L.$1Z=$1P;1b}1s;1q 39:5w.iF(e,1L);if(1L.fC||(!1L.$1Z||!1L.$1Z.1f)){1s}K xV=1L.$1Z.1h("2O")||{};if(xV.$1V&&1L.$1Z.4H("2V-1V-CY")){1L.$1Z=1d;xV.$1Z=1d;xV.$1V.1R("xj");1b}1s;1q 35:;1q 36:if(1L.$1Z&&1L.$1Z.2B("2a, 8D, 2x").1f){1b}1j{(1L.$1Z&&1L.$1Z.1P()||1L.$1V).5u(":6r(.2P, .6r-kp)")[e.3Z==36?"4A":"7W"]().1R("5H:3k");e.4I();1b}1s;1q 13:5w.iF(e,1L);if(1L.fC){if(1L.$1Z&&!1L.$1Z.is("8D, 2x")){e.4I();1b}1s}1L.$1Z&&1L.$1Z.1R("7i");1b;1q 32:;1q 33:;1q 34:5w.iF(e,1L);1b;1q 27:5w.iF(e,1L);1L.$1V.1R("5H:3B");1b;5P:K k=62.Gf(e.3Z).9p();if(1L.iu&&1L.iu[k]){1L.iu[k].$1u.1R(1L.iu[k].$1V?"5H:3k":"7i");1b}1s}e.6R();1L.$1Z&&1L.$1Z.1R(e)},j9:1a(e){e.6R();K 1L=$(J).1h("2O")||{};if(1L.$1Z){K $s=1L.$1Z;1L=1L.$1Z.1P().1h("2O")||{};1L.$1Z=$s}K $5u=1L.$1V.5u(),$49=!1L.$1Z||!1L.$1Z.49().1f?$5u.7W():1L.$1Z.49(),$5o=$49;4x($49.4H("2P")||$49.4H("6r-kp")){if($49.49().1f){$49=$49.49()}1j{$49=$5u.7W()}if($49.is($5o)){1b}}if(1L.$1Z){5w.xm.2J(1L.$1Z.4z(0),e)}5w.xk.2J($49.4z(0),e);K $2a=$49.2B("2a, 8D, 2x");if($2a.1f){$2a.3k()}},iR:1a(e){e.6R();K 1L=$(J).1h("2O")||{};if(1L.$1Z){K $s=1L.$1Z;1L=1L.$1Z.1P().1h("2O")||{};1L.$1Z=$s}K $5u=1L.$1V.5u(),$3C=!1L.$1Z||!1L.$1Z.3C().1f?$5u.4A():1L.$1Z.3C(),$5o=$3C;4x($3C.4H("2P")||$3C.4H("6r-kp")){if($3C.3C().1f){$3C=$3C.3C()}1j{$3C=$5u.4A()}if($3C.is($5o)){1b}}if(1L.$1Z){5w.xm.2J(1L.$1Z.4z(0),e)}5w.xk.2J($3C.4z(0),e);K $2a=$3C.2B("2a, 8D, 2x");if($2a.1f){$2a.3k()}},Jl:1a(e){K $J=$(J).jV(".2V-1V-1i"),1h=$J.1h(),1L=1h.2O,2D=1h.av;2D.$1Z=1L.$1Z=$J;2D.fC=1L.fC=1l},Jf:1a(e){K $J=$(J).jV(".2V-1V-1i"),1h=$J.1h(),1L=1h.2O,2D=1h.av;2D.fC=1L.fC=1k},Ju:1a(e){K 2D=$(J).1h().av;2D.xN=1l},Jv:1a(e){K 2D=$(J).1h().av;if(2D.$78&&2D.$78.is(e.pc)){2D.xN=1k}},xk:1a(e){K $J=$(J),1h=$J.1h(),1L=1h.2O,2D=1h.av;2D.xN=1l;if(e&&(2D.$78&&2D.$78.is(e.pc))){e.4I();e.fB()}(1L.$1V?1L:2D).$1V.5u(".7r").1R("5H:4W");if($J.4H("2P")||$J.4H("6r-kp")){1L.$1Z=1d;1b}$J.1R("5H:3k")},xm:1a(e){K $J=$(J),1h=$J.1h(),1L=1h.2O,2D=1h.av;if(2D!==1L&&(2D.$78&&2D.$78.is(e.pc))){2D.$1Z&&2D.$1Z.1R("5H:4W");e.4I();e.fB();2D.$1Z=1L.$1Z=1L.$1u;1b}$J.1R("5H:4W")},Jn:1a(e){K $J=$(J),1h=$J.1h(),1L=1h.2O,2D=1h.av,1r=1h.Ds,1X;if(!1L.1J[1r]||$J.is(".2P, .2V-1V-CY, .2V-1V-6e, .6r-kp")){1b}e.4I();e.fB();if($.ch(2D.lD[1r])&&5c.3g.87.2J(2D.lD,1r)){1X=2D.lD[1r]}1j{if($.ch(2D.1X)){1X=2D.1X}1j{1b}}if(1X.2J(2D.$1R,1r,2D,1h)!==1k){2D.$1V.1R("5H:3B")}1j{if(2D.$1V.1P().1f){op.7P.2J(2D.$1R,2D)}}},Jt:1a(e){e.fB()},Jq:1a(e,1h){K 2D=$(J).1h("av");op.3B.2J(2D.$1R,2D,1h&&1h.bc)},Jh:1a(e){e.6R();K $J=$(J),1h=$J.1h(),1L=1h.2O,2D=1h.av;$J.2r("7r").Fe(".7r").1R("5H:4W");1L.$1Z=2D.$1Z=$J;if(1L.$1u){2D.Jz.2J(1L.$1u,1L.$1V)}},Jm:1a(e){e.6R();K $J=$(J),1h=$J.1h(),1L=1h.2O;$J.3K("7r");1L.$1Z=1d}},op={5k:1a(1L,x,y){if(2A xM!="2y"&&xM){1b}xM=1l;K $1R=$(J),2T={};$("#2V-1V-78").1R("88");1L.$1R=$1R;1L.x=x;1L.y=y;if(1L.4U.5k.2J($1R,1L)===1k){$8H=1d;1b}op.7P.2J($1R,1L);1L.2R.2J($1R,1L,x,y);if(1L.4t){2T.4t=JG($1R)+1L.4t}op.78.2J(1L.$1V,1L,2T.4t);1L.$1V.2B("ul").2T("4t",2T.4t+1);1L.$1V.2T(2T)[1L.7v.5k](1L.7v.5D,1a(){$1R.1R("5H:6v")});$1R.1h("2O",1L).2r("2V-1V-8R");$(2K).fG("8i.2O").on("8i.2O",5w.1r);if(1L.JJ){$(2K).on("bq.Iu",1a(e){K 3t=$1R.2v();3t.8K=3t.2f+$1R.8q();3t.4P=3t.1M+$1R.7h();if(1L.$78&&(!1L.xN&&(!(e.7I>=3t.2f&&e.7I<=3t.8K)||!(e.8a>=3t.1M&&e.8a<=3t.4P)))){1L.$1V.1R("5H:3B")}})}},3B:1a(1L,bc){K $1R=$(J);if(!1L){1L=$1R.1h("2O")||{}}if(!bc&&(1L.4U&&1L.4U.3B.2J($1R,1L)===1k)){1b}$1R.sB("2O").3K("2V-1V-8R");if(1L.$78){6P(1a($78){1b 1a(){$78.3M()}}(1L.$78),10);6E{4r 1L.$78}6I(e){1L.$78=1d}}$8H=1d;1L.$1V.2B(".7r").1R("5H:4W");1L.$1Z=1d;$(2K).fG(".Iu").fG("8i.2O");1L.$1V&&1L.$1V[1L.7v.3B](1L.7v.5D,1a(){if(1L.9M){1L.$1V.3M();$.2p(1L,1a(1r,1o){3P(1r){1q"ns":;1q"4s":;1q"9M":;1q"1R":1b 1l;5P:1L[1r]=2y;6E{4r 1L[1r]}6I(e){}1b 1l}})}6P(1a(){$1R.1R("5H:6f")},10)});xM=1k},8E:1a(1L,2D){if(2D===2y){2D=1L}1L.$1V=$(\'<ul 2s="2V-1V-5r"></ul>\').2r(1L.db||"").1h({"2O":1L,"av":2D});$.2p(["lD","xO","xl"],1a(i,k){1L[k]={};if(!2D[k]){2D[k]={}}});2D.iu||(2D.iu={});$.2p(1L.1J,1a(1r,1i){K $t=$(\'<li 2s="2V-1V-1i"></li>\').2r(1i.db||""),$3G=1d,$2a=1d;$t.on("3F",$.ux);1i.$1u=$t.1h({"2O":1L,"av":2D,"Ds":1r});if(1i.CE){K Jk=Jr(1i.CE);1p(K i=0,ak;ak=Jk[i];i++){if(!2D.iu[ak]){2D.iu[ak]=1i;1i.xQ=1i.1x.3u(1T e3("("+ak+")","i"),\'<2u 2s="2V-1V-CE">$1</2u>\');1s}}}if(2A 1i=="4F"){$t.2r("2V-1V-6e 6r-kp")}1j{if(1i.1C&&mr[1i.1C]){mr[1i.1C].2J($t,1i,1L,2D);$.2p([1L,2D],1a(i,k){k.xO[1r]=1i;if($.ch(1i.1X)){k.lD[1r]=1i.1X}})}1j{if(1i.1C=="3J"){$t.2r("2V-1V-3J 6r-kp")}1j{if(1i.1C){$3G=$("<3G></3G>").4o($t);$("<2u></2u>").3J(1i.xQ||1i.1x).4o($3G);$t.2r("2V-1V-2a");1L.Ji=1l;$.2p([1L,2D],1a(i,k){k.xO[1r]=1i;k.xl[1r]=1i})}1j{if(1i.1J){1i.1C="jt"}}}3P(1i.1C){1q"2g":$2a=$(\'<2a 1C="2g" 1o="1" 1x="" 1o="">\').1n("1x","2V-1V-2a-"+1r).2b(1i.1o||"").4o($3G);1s;1q"8D":$2a=$(\'<8D 1x=""></8D>\').1n("1x","2V-1V-2a-"+1r).2b(1i.1o||"").4o($3G);if(1i.1w){$2a.1w(1i.1w)}1s;1q"9f":$2a=$(\'<2a 1C="9f" 1o="1" 1x="" 1o="">\').1n("1x","2V-1V-2a-"+1r).2b(1i.1o||"").6U("4q",!!1i.1Z).tl($3G);1s;1q"9Y":$2a=$(\'<2a 1C="9Y" 1o="1" 1x="" 1o="">\').1n("1x","2V-1V-2a-"+1i.9Y).2b(1i.1o||"").6U("4q",!!1i.1Z).tl($3G);1s;1q"2x":$2a=$(\'<2x 1x="">\').1n("1x","2V-1V-2a-"+1r).4o($3G);if(1i.1v){$.2p(1i.1v,1a(1o,2g){$("<2W></2W>").2b(1o).2g(2g).4o($2a)});$2a.2b(1i.1Z)}1s;1q"jt":$("<2u></2u>").3J(1i.xQ||1i.1x).4o($t);1i.4o=1i.$1u;op.8E(1i,2D);$t.1h("2O",1i).2r("2V-1V-CY");1i.1X=1d;1s;1q"3J":$(1i.3J).4o($t);1s;5P:$.2p([1L,2D],1a(i,k){k.xO[1r]=1i;if($.ch(1i.1X)){k.lD[1r]=1i.1X}});$("<2u></2u>").3J(1i.xQ||(1i.1x||"")).4o($t);1s}if(1i.1C&&(1i.1C!="jt"&&1i.1C!="3J")){$2a.on("3k",5w.Jl).on("4W",5w.Jf);if(1i.4U){$2a.on(1i.4U,1L)}}if(1i.3T){$t.2r("3T 3T-"+1i.3T)}}}1i.$2a=$2a;1i.$3G=$3G;$t.4o(1L.$1V);if(!1L.Ji&&$.ga.Js){$t.on("15q.15p",5w.qE)}});if(!1L.$1u){1L.$1V.2T("4T","3r").2r("2V-1V-2D")}1L.$1V.4o(1L.4o||2K.3H)},61:1a($1V,Jp){$1V.2T({2R:"7X",4T:"5J"});$1V.1h("1m",3A.ko($1V.1m())+1);$1V.2T({2R:"Kv",fp:"vS",a8:"15r"});$1V.2B("> li > ul").2p(1a(){op.61($(J),1l)});if(!Jp){$1V.2B("ul").zy().2T({2R:"",4T:"",fp:"",a8:""}).1m(1a(){1b $(J).1h("1m")})}},7P:1a(1L,2D){K $1R=J;if(2D===2y){2D=1L;op.61(1L.$1V)}1L.$1V.5u().2p(1a(){K $1i=$(J),1r=$1i.1h("Ds"),1i=1L.1J[1r],2P=$.ch(1i.2P)&&1i.2P.2J($1R,1r,2D)||1i.2P===1l;$1i[2P?"2r":"3K"]("2P");if(1i.1C){$1i.2B("2a, 2x, 8D").6U("2P",2P);3P(1i.1C){1q"2g":;1q"8D":1i.$2a.2b(1i.1o||"");1s;1q"9f":;1q"9Y":1i.$2a.2b(1i.1o||"").6U("4q",!!1i.1Z);1s;1q"2x":1i.$2a.2b(1i.1Z||"");1s}}if(1i.$1V){op.7P.2J($1R,1i,2D)}})},78:1a(1L,4t){K $l=$("#2V-1V-78");if($l){$l.3M()}K $78=1L.$78=$(\'<2C id="2V-1V-78" 2G="2R:Kx; z-1W:\'+4t+\'; 1M:0; 2f:0; 2X: 0; 42: eN(2X=0); mM-3Y: #e0;"></2C>\').2T({1w:$5U.1w(),1m:$5U.1m(),4T:"5J"}).1h("av",1L).7T(J).on("5H",5w.qE).on("88",5w.Jo);if(2K.3H.2G.a8===2y){$78.2T({"2R":"7X","1w":$(2K).1w()})}1b $78}};1a Jr(2b){K t=2b.3R(/\\s+/),95=[];1p(K i=0,k;k=t[i];i++){k=k.cB(0).9p();95.1G(k)}1b 95}$.fn.2O=1a(7B){if(7B===2y){J.4A().1R("5H")}1j{if(7B.x&&7B.y){J.4A().1R($.xP("5H",{7I:7B.x,8a:7B.y}))}1j{if(7B==="3B"){K $1V=J.4A().1h("2O")?J.4A().1h("2O").$1V:1d;$1V&&$1V.1R("5H:3B")}1j{if(7B==="6C"){$.2O("6C",{2V:J})}1j{if(7B==="1g"){if(J.1h("2O")!=1d){1b J.1h("2O").$1V}1b[]}1j{if($.UR(7B)){7B.2V=J;$.2O("8E",7B)}1j{if(7B){J.3K("2V-1V-2P")}1j{if(!7B){J.2r("2V-1V-2P")}}}}}}}}1b J};$.2O=1a(7B,1v){if(2A 7B!="4F"){1v=7B;7B="8E"}if(2A 1v=="4F"){1v={4s:1v}}1j{if(1v===2y){1v={}}}K o=$.4C(1l,{},bk,1v||{});K $2K=$(2K);K $2V=$2K;K qM=1k;if(!o.2V||!o.2V.1f){o.2V=2K}1j{$2V=$(o.2V).4A();o.2V=$2V.4z(0);qM=o.2V!==2K}3P(7B){1q"8E":if(!o.4s){98 1T 9Z("No 4s xA")}if(o.4s.3y(/.2V-1V-(5r|1i|2a)($|\\s)/)){98 1T 9Z(\'15b 2S to 4s "\'+o.4s+\'" as it d0 a 14S db\')}if(!o.9M&&(!o.1J||$.Jc(o.1J))){98 1T 9Z("No 2Q xA")}cV++;o.ns=".2O"+cV;if(!qM){cF[o.4s]=o.ns}aM[o.ns]=o;if(!o.1R){o.1R="8K"}if(!rh){$2K.on({"5H:3B.2O":5w.Jq,"HG.2O":5w.j9,"xj.2O":5w.iR,"5H.2O":5w.qE,"nU.2O":5w.Ju,"qY.2O":5w.Jv},".2V-1V-5r").on("7i.2O",".2V-1V-2a",5w.Jt).on({"7i.2O":5w.Jn,"5H:3k.2O":5w.Jh,"5H:4W.2O":5w.Jm,"5H.2O":5w.qE,"nU.2O":5w.xk,"qY.2O":5w.xm},".2V-1V-1i");rh=1l}$2V.on("5H"+o.ns,o.4s,o,5w.5H);if(qM){$2V.on("3M"+o.ns,1a(){$(J).2O("6C")})}3P(o.1R){1q"7r":$2V.on("nU"+o.ns,o.4s,o,5w.nU).on("qY"+o.ns,o.4s,o,5w.qY);1s;1q"2f":$2V.on("3F"+o.ns,o.4s,o,5w.3F);1s}if(!o.9M){op.8E(o)}1s;1q"6C":K $gD;if(qM){K 2V=o.2V;$.2p(aM,1a(ns,o){if(o.2V!==2V){1b 1l}$gD=$(".2V-1V-5r").42(":6v");if($gD.1f&&$gD.1h().av.$1R.is($(o.2V).2B(o.4s))){$gD.1R("5H:3B",{bc:1l})}6E{if(aM[o.ns].$1V){aM[o.ns].$1V.3M()}4r aM[o.ns]}6I(e){aM[o.ns]=1d}$(o.2V).fG(o.ns);1b 1l})}1j{if(!o.4s){$2K.fG(".2O .Iu");$.2p(aM,1a(ns,o){$(o.2V).fG(o.ns)});cF={};aM={};cV=0;rh=1k;$("#2V-1V-78, .2V-1V-5r").3M()}1j{if(cF[o.4s]){$gD=$(".2V-1V-5r").42(":6v");if($gD.1f&&$gD.1h().av.$1R.is(o.4s)){$gD.1R("5H:3B",{bc:1l})}6E{if(aM[cF[o.4s]].$1V){aM[cF[o.4s]].$1V.3M()}4r aM[cF[o.4s]]}6I(e){aM[cF[o.4s]]=1d}$2K.fG(cF[o.4s])}}}1s;1q"14L":if(!$.ga.JI&&!$.ga.JN||2A 1v=="qk"&&1v){$(\'1V[1C="2V"]\').2p(1a(){if(J.id){$.2O({4s:"[5H="+J.id+"]",1J:$.2O.JL(J)})}}).2T("4T","3r")}1s;5P:98 1T 9Z(\'hk 7B "\'+7B+\'"\')}1b J};$.2O.14W=1a(1L,1h){if(1h===2y){1h={}}$.2p(1L.xl,1a(1r,1i){3P(1i.1C){1q"2g":;1q"8D":1i.1o=1h[1r]||"";1s;1q"9f":1i.1Z=1h[1r]?1l:1k;1s;1q"9Y":1i.1Z=(1h[1i.9Y]||"")==1i.1o?1l:1k;1s;1q"2x":1i.1Z=1h[1r]||"";1s}})};$.2O.155=1a(1L,1h){if(1h===2y){1h={}}$.2p(1L.xl,1a(1r,1i){3P(1i.1C){1q"2g":;1q"8D":;1q"2x":1h[1r]=1i.$2a.2b();1s;1q"9f":1h[1r]=1i.$2a.6U("4q");1s;1q"9Y":if(1i.$2a.6U("4q")){1h[1i.9Y]=1i.1o}1s}});1b 1h};1a lh(1u){1b 1u.id&&$(\'3G[1p="\'+1u.id+\'"]\').2b()||1u.1x}1a Ge(1J,$5u,cV){if(!cV){cV=0}$5u.2p(1a(){K $1u=$(J),1u=J,9h=J.9h.3W(),3G,1i;if(9h=="3G"&&$1u.2B("2a, 8D, 2x").1f){3G=$1u.3J();$1u=$1u.5u().4A();1u=$1u.4z(0);9h=1u.9h.3W()}3P(9h){1q"1V":1i={1x:$1u.1n("3G"),1J:{}};cV=Ge(1i.1J,$1u.5u(),cV);1s;1q"a":;1q"3d":1i={1x:$1u.3J(),2P:!!$1u.1n("2P"),1X:1a(){1b 1a(){$1u.3F()}}()};1s;1q"JK":;1q"91":3P($1u.1n("1C")){1q 2y:;1q"91":;1q"JK":1i={1x:$1u.1n("3G"),2P:!!$1u.1n("2P"),1X:1a(){1b 1a(){$1u.3F()}}()};1s;1q"9f":1i={1C:"9f",2P:!!$1u.1n("2P"),1x:$1u.1n("3G"),1Z:!!$1u.1n("4q")};1s;1q"9Y":1i={1C:"9Y",2P:!!$1u.1n("2P"),1x:$1u.1n("3G"),9Y:$1u.1n("157"),1o:$1u.1n("id"),1Z:!!$1u.1n("4q")};1s;5P:1i=2y}1s;1q"hr":1i="-------";1s;1q"2a":3P($1u.1n("1C")){1q"2g":1i={1C:"2g",1x:3G||lh(1u),2P:!!$1u.1n("2P"),1o:$1u.2b()};1s;1q"9f":1i={1C:"9f",1x:3G||lh(1u),2P:!!$1u.1n("2P"),1Z:!!$1u.1n("4q")};1s;1q"9Y":1i={1C:"9Y",1x:3G||lh(1u),2P:!!$1u.1n("2P"),9Y:!!$1u.1n("1x"),1o:$1u.2b(),1Z:!!$1u.1n("4q")};1s;5P:1i=2y;1s}1s;1q"2x":1i={1C:"2x",1x:3G||lh(1u),2P:!!$1u.1n("2P"),1Z:$1u.2b(),1v:{}};$1u.5u().2p(1a(){1i.1v[J.1o]=$(J).3J()});1s;1q"8D":1i={1C:"8D",1x:3G||lh(1u),2P:!!$1u.1n("2P"),1o:$1u.2b()};1s;1q"3G":1s;5P:1i={1C:"3J",3J:$1u.6w(1l)};1s}if(1i){cV++;1J["1r"+cV]=1i}});1b cV}$.2O.JL=1a(1g){K $J=$(1g),1J={};Ge(1J,$J.5u());1b 1J};$.2O.bk=bk;$.2O.mr=mr;$.2O.5w=5w;$.2O.op=op;$.2O.aM=aM})(2I);K NW=1a(id){J.id=id;J.1g=1d;J.2Z=1T 3Q;J.qp=0;J.GU=20;J.GV=1a(2Z){4r J.2Z;J.2Z=1T 3Q;K li=1T 3Q;1p(K i=0;i<2Z.1f;i++){K 1o=2Z[i];li.1G(\'<li 1o="\'+i+\'" 2s="\'+1o.bu+\'">\'+o6(1o.2g)+"</li>");J.2Z.1G(1o.1o)}J.1g.3J("<ul>"+li.5x("\\n")+"</ul>");K me=J;J.1g.4K("7i",1a(e){K li=e.3f;if(li.6J.9p()!="LI"){1b}K $li=$(e.3f);e.6R();J.xu.xn($li.2g(),me.xu.nM(li.1o))},J).4K("88",1a(e){e.6R()},J);J.Jy();J.xz(10)};J.Jy=1a(){J.1g.2T("i8","6f");J.1g.5k();K bd=J.1g.2B("li");if(bd.1f>0){J.GU=bd[0].9m}J.1g.2T("i8","6v");J.1g.3B()};J.xz=1a(qs){if(J.1g.2B("li").1f>qs){J.qp=J.GU*qs;J.1g.2T("1w",J.qp+"px");J.1g.2T("e9","6a")}1j{J.1g.2T("1w","6a");J.1g.2T("e9","6v")}};J.nM=1a(1W){1b J.2Z[1W]};J.JC=1a(){J.1g.2B("li").3K("3y")};J.IG=1a(2g){K dm=lU(2g);J.JC();K a7=J.xe(dm);$(a7).2r("3y");if(a7.1f>0){J.xd($(a7[0]))}1j{J.IE()}};J.J8=1a(2g){K dm=lU(2g);K a7=J.xe(dm);K 6m=J.lp();if(6m.1f>0&&a7.1f>1){K 1W=a7.5f(6m[0]);if(1W<a7.1f-1){1b $(a7[1W+1])}1j{1b $(a7[0])}}1b 1d};J.NY=1a(2g){K dm=lU(2g);K a7=J.xe(dm);K 6m=J.lp();if(6m.1f>0&&a7.1f>1){K 1W=a7.5f(6m[0]);if(1W>0){1b $(a7[1W-1])}1j{1b $(a7[a7.1f-1])}}1b 1d};J.xe=1a(2g){K 1O=[];if(1B(2g)){1b 1O}K e5=2g.3u(/([$-/:-?{-~!"^2j`\\[\\]\\\\])/g, "\\\\$1");K bd=J.1g.2B("li");1p(K i=0;i<bd.1f;i++){K li=bd[i];K GL=lU(!1B(li.Ja)?li.Ja:li.13V);K GA=lU(J.nM(li.1o));if(QB.1e.2e.yz){e5="(^"+2g+")|([.]"+2g+")"}if(2g==GL||2g==GA){1O.1G(li)}1j{if(GL.9A(e5)||GA.9A(e5)){1O.1G(li)}}}1b 1O};J.Hc=1a(){J.1g.2B("li.1Z").3K("1Z")};J.Hf=1a(2g,ek,hH){K li=J.lp();if(!li.1f){li=J.IE()}K gm=1d;if(ek=="f5"){if(hH){gm=J.J8(2g)}if(gm==1d){gm=li.3C()}}1j{if(ek=="up"){if(hH){gm=J.NY(2g)}if(gm==1d){gm=li.49()}}}if(gm!=1d){J.xd(gm);J.NX(li)}};J.xd=1a(li){J.Hc();li.2r("1Z");J.O2(li)};J.IE=1a(){K 4A=J.1g.2B("li:4A");J.xd(4A);1b 4A};J.NX=1a(ls){ls.3K("1Z")};J.lp=1a(){1b J.1g.2B("li.1Z")};J.O2=1a(ls){if(J.qp&&(ls!=1d&&ls.1f>0)){J.1g.4O(ls[0].9x-J.qp/2)}};J.8L=1a(){J.1g=$(\'<2C 2s="dn-2x-1v"></2C>\').4o($(2K.3H))};J.8L()};K b8={xf:{},dg:[],r4:{},H1:1k,2V:1d,8L:1a(){J.O1();J.H1=1l},O1:1a(){},GY:1a(b5){if(1B(b5)||1B(J.xf[b5])){J.xf[b5]=1T NW(b5)}1b J.xf[b5]},DR:1a(id,2Z){J.GY(id).GV(2Z)}};(1a($){$.fn.J3=1a(1v){if(!b8.H1){b8.8L()}K me=J;K bk={9Q:1k,iz:1l,qs:10,12N:1k};K 3i=$.4C(bk,1v);K gA=1k;$(J).2p(1a(i,H7){K 1g=$(H7);if(1g.1h("dn-jF")==2y){b8.dg.1G(1T H8(H7,3i));1g.1h("dn-jF",b8.dg.1f-1)}});1b $(J)};$.fn.IY=1a(){K 8W=[];$(J).2p(1a(){if($(J).1h("dn-jF")!==2y){8W[8W.1f]=b8.dg[$(J).1h("dn-jF")]}});1b 8W};K H8=1a(2x,3i){J.8L(2x,3i)};H8.3g={k5:1k,3i:1k,6O:1k,2x:1k,6V:1k,b5:1d,jE:1k,12W:1k,9Q:1k,135:13,dm:"",134:[],hH:1k,NR:1k,8L:1a(2x,3i){J.3i=3i;J.b5=J.3i.b5;J.6V=b8.GY(J.b5);J.7F=J.3i.iz;if(!1B(J.b5)){b8.r4[J.b5]=J.3i.iz}J.1v=[];if(!1B(J.3i.1v)){J.1v=J.3i.1v}J.2x=$(2x);J.6O=$(\'<2a 1C="2g">\');J.6O.1n("6s-3G",J.2x.1n("6s-3G"));J.6O.2b(J.3i.1o);J.6O.1n("1x",J.2x.1n("1x"));J.6O.1h("dn-jF",J.2x.1h("dn-jF"));J.2x.1n("2P","2P");K id=J.2x.1n("id");if(!id){id="dn-2x"+b8.dg.1f}J.id=id;J.6O.1n("id",id);J.6O.1n("136","fG");J.6O.2r("dn-2x");J.2x.1n("id",id+"139");J.NQ(J.6O,J);J.NS();J.Oe();J.Oa();if(J.3i.9Q){K 9Q=$(\'<eF 137="0" 2s="dn-2x-eF" 4J="MP:Bl;"></eF>\');$(2K.3H).2Y(9Q);9Q.1m(J.2x.1m()+2);9Q.1w(J.6V.1g.1w());9Q.2T({1M:J.6V.1g.2T("1M"),2f:J.6V.1g.2T("2f")});J.9Q=9Q}},NS:1a(){K me=J;K 12Y=1k;K 2Z=1T 3Q;J.2x.2B("2W").2p(1a(1W,2W){K $2W=$(2W);K 2g=$2W.2g();K 2b=$2W.1n("1o");K 1Z=1k;if($2W.1n("1Z")||2W.1Z){me.6O.2b(2g);me.dm=2g;me.NU=2b;1Z=1l}K bu=$2W.1n("2s");2Z.1G({1Z:1Z,2g:2g,1o:2b,bu:bu})});if(2Z.1f>0){J.6V.GV(2Z);J.6V.1g.2r("yD-VY");J.6V.xz(J.3i.qs)}},IZ:1a(){1b J.6O},iz:1a(e){K 2V=J.6V.xu;if(2A 2V.7F=="1a"){2V.7F.2J(2V,2V.6O,e)}},Hv:1a(){if(J.k5){1b}J.k5=1l;J.dm=J.6O.2b();J.hH=1k;J.IB(J);if(J.NR){J.q6()}},jC:1a(e){if(!J.k5){1b}J.6V.Hc();J.xx();J.iz(e);J.k5=1k},NV:1a(130){if(J.6O.2b()!=J.dm){J.hH=1l;J.dm=J.6O.2b();J.6V.IG(J.6O.2b())}},NQ:1a(6O,12u){K me=J;K a5=1k;6O.3k(1a(e){me.Hv()}).4W(1a(e){if(!me.jE){me.jC(e)}}).3F(1a(e){e.6R();me.Hv();if(e.7I-$(J).2v().2f>$(J).1m()-16){if(me.jE){me.xx()}1j{me.q6()}}}).8i(1a(e){me.k5=1l;3P(e.3Z){1q 40:if(!me.xv()){me.q6()}1j{e.4I();me.6V.Hf(me.6O.2b(),"f5",me.hH)}1s;1q 38:if(me.xv()){e.4I();me.6V.Hf(me.6O.2b(),"up",me.hH)}1j{me.q6()}1s;1q 9:if(me.xv()){K $li=me.6V.lp();if($li.1f){me.xn($li.2g(),me.nM($li[0].1o))}}1j{me.jC()}1s;1q 27:e.4I();me.jC();1b 1k;1s;1q 13:e.4I();if(me.jE){K $li=me.6V.lp();if($li.1f){me.xn($li.2g(),me.nM($li[0].1o))}}1j{me.jC()}1b 1k;1s}}).pH($.ho(me.NV,100,me)).iO(1a(e){if(e.3Z==13){e.4I();1b 1k}})},xn:1a(2g,2b){J.dm=2g;J.NU=2b;J.6O.2b(2b);J.jC()},xv:1a(){1b J.jE},IB:1a(2V){J.NT();J.O3();b8.2V=2V;J.6V.xu=2V},NT:1a(){K 2v=J.6O.2v();2v.1M+=J.6O[0].9m;J.6V.1g.2T({1M:2v.1M+"px",2f:2v.2f+"px"})},O3:1a(){K 1m=J.6O[0].nN;J.6V.1g.1m(1m)},q6:1a(){J.Og();J.8c=1T $.ui.fw.8c(J);J.6V.1g.5k();J.IB(J);J.jE=1l;if(J.3i.9Q){J.9Q.5k()}J.6V.xz(10);J.6V.IG(J.6O.2b())},nM:1a(1W){1b J.6V.2Z[1W]},xx:1a(){if(J.8c!=1d){J.8c.6C()}J.6V.1g.3B();J.jE=1k;if(J.3i.9Q){J.9Q.3B()}},Og:1a(){1p(K i=0;i<b8.dg.1f;i++){if(i!=J.2x.1h("dn-jF")){b8.dg[i].xx()}}},Oe:1a(){J.2x.yr(J.6O);J.2x.3B();$(2K.3H).2Y(J.6V.1g)},Oa:1a(){K 1m=J.2x.1m()+2*0;if(J.9Q){J.9Q.1m(1m+4)}}};$.ui.fw={8c:1a(3V){J.$el=$.ui.fw.8c.8E(3V)}};$.4C($.ui.fw.8c,{2H:J,dg:[],12J:[],fA:12I,4U:$.ba("3k,88,8i,iO".3R(","),1a(1N){1b 1N+".3V-8c"}).5x(" "),8E:1a(3V){if(J.dg.1f===0){$(3z).2S("61.3V-8c",$.ui.fw.8c.61)}K $el=$(\'<2C 2s="dn-2x-1v-8c"></2C>\').4o(3V.6O.1P()).2T({1m:J.1m(),1w:J.1w()});$el.2S("88.3V-8c",1a(1N){3V.jC();K 1g=2K.qn(1N.dS,1N.dA);if(1g!=1d){6E{K ej="3F";if(1g.Ii){K e=2K.O6("12D");e.O5(ej,1l,1l,3z,0,1N.O4,1N.O9,1N.dS,1N.dA,1k,1k,1k,1k,0,1d);1g.Ii(e)}1j{if(1g.O8){1g.O8("on"+ej)}}}6I(13H){}}});if($.fn.g1){$el.g1()}J.dg.1G($el);1b $el},6C:1a($el){if($el!=1d){$el.3M()}if(J.dg.1f===0){$([2K,3z]).8Q(".3V-8c")}},1w:1a(){K gy,9m;1b $(2K).1w()+"px"},1m:1a(){K rJ,ik;1b $(2K).1m()+"px"},61:1a(){K $xp=$([]);$.2p($.ui.fw.8c.dg,1a(){$xp=$xp.5L(J)});$xp.2T({1m:0,1w:0}).2T({1m:$.ui.fw.8c.1m(),1w:$.ui.fw.8c.1w()})}});$.4C($.ui.fw.8c.3g,{6C:1a(){$.ui.fw.8c.6C(J.$el)}})})(2I);(1a($){K R=$.84=$.fn.84=1a(a,b,c){1b R.I9(k4.3v(J,2F))};1a k4(a,b,c){K r=$.4C({},R);if(2A a=="4F"){r.5l=a;if(b&&!$.ch(b)){r.gs=b}1j{c=b}if(c){r.wd=c}}1j{$.4C(r,a)}if(!r.3f){r.3f=J?J:$}if(!r.1C&&!$.13y){r.1C="13A"}1b r}$.4C(R,{6Y:"0.5",5l:1d,gs:178,wd:1d,4h:1d,I9:1a(r){if(r.rP){r.rP()}r.id=qh(1a(){r.84(r)},r.gs*9i);r.rP=1a(){xo(r.id);1b r};1b r},84:1a(r){if(r.Ia){4r r.Ia}r.Ia=r.3f["B8"](r)}})})(2I);2I.4Q={dL:1d,bp:1d,vu:1d,vx:0,9M:1a(1v){J.2p(1a(){J.dK=2I.4C({Nx:1d,NA:1d,qT:"13J",yC:1d,qi:1d,qN:5,E2:/[^\\-]*$/,13R:1d,oU:1d},1v||{});2I.4Q.DK(J)});2I(2K).2S("bq",2I.4Q.bq).2S("7i",2I.4Q.7i);1b J},DK:1a(1I){K 7w=1I.dK;if(1I.dK.oU){$(2K).on("88","#qb-ui-4k td."+1I.dK.oU,1a(ev){if($(ev.7f).7u("tr:4A").3C().1f==0){1b}2I.4Q.bp=J.3j;2I.4Q.dL=1I;2I.4Q.vu=2I.4Q.DG(J,ev);if(7w.qi){7w.qi(1I,J)}1b 1k})}1j{$(2K).on("88","#qb-ui-4k 1I td."+1I.dK.oU,1a(ev){if(ev.3f.6J=="TD"){2I.4Q.bp=J;2I.4Q.dL=1I;2I.4Q.vu=2I.4Q.DG(J,ev);if(7w.qi){7w.qi(1I,J)}1b 1k}})}},Ny:1a(){J.2p(1a(){if(J.dK){2I.4Q.DK(J)}})},DM:1a(ev){if(ev.7I||ev.8a){1b{x:ev.7I,y:ev.8a}}1b{x:ev.dS+2K.3H.57-2K.3H.lb,y:ev.dA+2K.3H.4O-2K.3H.mh}},DG:1a(3f,ev){ev=ev||3z.1N;K DH=J.vo(3f);K jn=J.DM(ev);1b{x:jn.x-DH.x,y:jn.y-DH.y}},vo:1a(e){K 2f=0;K 1M=0;if(e.9m==0){e=e.8G}4x(e.eR){2f+=e.9s;1M+=e.9x;e=e.eR}2f+=e.9s;1M+=e.9x;1b{x:2f,y:1M}},bq:1a(ev){if(2I.4Q.bp==1d){1b}K vp=2I(2I.4Q.bp);K 7w=2I.4Q.dL.dK;K jn=2I.4Q.DM(ev);K y=jn.y-2I.4Q.vu.y;K qR=3z.MU;if(2K.76){if(2A 2K.O7!="2y"&&2K.O7!="13P"){qR=2K.9l.4O}1j{if(2A 2K.3H!="2y"){qR=2K.3H.4O}}}if(jn.y-qR<7w.qN){3z.H4(0,-7w.qN)}1j{K NP=3z.k9?3z.k9:2K.9l.lW?2K.9l.lW:2K.3H.lW;if(NP-(jn.y-qR)<7w.qN){3z.H4(0,7w.qN)}}if(y!=2I.4Q.vx){K Du=y>2I.4Q.vx;2I.4Q.vx=y;if(7w.qT){vp.2r(7w.qT)}1j{vp.2T(7w.Nx)}K jw=2I.4Q.Nw(vp,y);if(jw&&jw.db!="ui-qb-4k-1H-7M"){if(Du&&2I.4Q.bp!=jw){2I.4Q.bp.3j.7T(2I.4Q.bp,jw.jA)}1j{if(!Du&&2I.4Q.bp!=jw){2I.4Q.bp.3j.7T(2I.4Q.bp,jw)}}}}1b 1k},Nw:1a(DB,y){K 3o=2I.4Q.dL.3o;1p(K i=0;i<3o.1f;i++){K 1H=3o[i];if($(1H).3C().1f==0){1b}K vq=J.vo(1H).y;K vs=6u(1H.9m)/2;if(1H.9m==0){vq=J.vo(1H.8G).y;vs=6u(1H.8G.9m)/2}if(y>vq-vs&&y<vq+vs){if(1H==DB){1b 1d}K 7w=2I.4Q.dL.dK;if(7w.Nv){if(7w.Nv(DB,1H)){1b 1H}1j{1b 1d}}1j{K E8=2I(1H).4H("E8");if(!E8){1b 1H}1j{1b 1d}}1b 1H}}1b 1d},7i:1a(e){if(2I.4Q.dL&&2I.4Q.bp){K vy=2I.4Q.bp;K 7w=2I.4Q.dL.dK;if(7w.qT){2I(vy).3K(7w.qT)}1j{2I(vy).2T(7w.NA)}2I.4Q.bp=1d;if(7w.yC){7w.yC(2I.4Q.dL,vy)}2I.4Q.dL=1d}},DV:1a(){if(2I.4Q.dL){1b 2I.4Q.E1(2I.4Q.dL)}1j{1b"9Z: No ai id 5V, Ix WX to 5V an id on Wx 1I r0 sX 1H"}},E1:1a(1I){K 1O="";K Nz=1I.id;K 3o=1I.3o;1p(K i=0;i<3o.1f;i++){if(1O.1f>0){1O+="&"}K mS=3o[i].id;if(mS&&(mS&&(1I.dK&&1I.dK.E2))){mS=mS.3y(1I.dK.E2)[0]}1O+=Nz+"[]="+mS}1b 1O},Nu:1a(){K 1O="";J.2p(1a(){1O+=2I.4Q.E1(J)});1b 1O}};2I.fn.4C({4Q:2I.4Q.9M,13N:2I.4Q.Ny,13x:2I.4Q.Nu});(1a($){$.8u("ui.3L",{1v:{4o:"3H",OR:9i,2G:"jT",P5:1d,1m:1d,pl:1d,OT:26,9d:1d,d9:1d,7l:1d,Pd:1k,qH:1a(){}},oS:1a(){K 2H=J,o=J.1v;K vF=J.1g.13h().1n("id");J.fa=[vF,vF+"-3d",vF+"-1V"];J.vI=1l;J.kZ=1k;J.7d=$("<a />",{"2s":"ui-3L ui-8u ui-4N-5P ui-b2-76","id":J.fa[1],"jP":"3d","5B":"#Ew","6Q":J.1g.1n("2P")?1:0,"6s-13i":1l,"6s-13k":J.fa[2]});J.F8=$("<2u />").2Y(J.7d).gM(J.1g);K 6Q=J.1g.1n("6Q");if(6Q){J.7d.1n("6Q",6Q)}J.7d.1h("P0",J.1g);J.OY=$(\'<2u 2s="ui-3L-3T ui-3T"></2u>\').tl(J.7d);J.7d.lq(\'<2u 2s="ui-3L-7m" />\');J.1g.2S({"3F.3L":1a(1N){2H.7d.3k();1N.4I()}});J.7d.2S("88.3L",1a(1N){2H.EX(1N,1l);if(o.2G=="lz"){2H.vI=1k;6P(1a(){2H.vI=1l},wq)}1N.4I()}).2S("3F.3L",1a(1N){1N.4I()}).2S("8i.3L",1a(1N){K 8W=1k;3P(1N.3Z){1q $.ui.3Z.NO:8W=1l;1s;1q $.ui.3Z.NN:2H.EX(1N);1s;1q $.ui.3Z.UP:if(1N.vE){2H.7C(1N)}1j{2H.np(-1)}1s;1q $.ui.3Z.Nn:if(1N.vE){2H.7C(1N)}1j{2H.np(1)}1s;1q $.ui.3Z.Ns:2H.np(-1);1s;1q $.ui.3Z.Nr:2H.np(1);1s;1q $.ui.3Z.NM:8W=1l;1s;1q $.ui.3Z.NL:;1q $.ui.3Z.NB:2H.1W(0);1s;1q $.ui.3Z.NK:;1q $.ui.3Z.NJ:2H.1W(2H.9a.1f);1s;5P:8W=1l}1b 8W}).2S("iO.3L",1a(1N){if(1N.mY>0){2H.EJ(1N.mY,"7i")}1b 1l}).2S("iE.3L",1a(){if(!o.2P){$(J).2r("ui-4N-7r")}}).2S("eM.3L",1a(){if(!o.2P){$(J).3K("ui-4N-7r")}}).2S("3k.3L",1a(){if(!o.2P){$(J).2r("ui-4N-3k")}}).2S("4W.3L",1a(){if(!o.2P){$(J).3K("ui-4N-3k")}});$(2K).2S("88.3L-"+J.fa[0],1a(1N){if(2H.kZ&&!$(1N.3f).jV("#"+2H.fa[1]).1f){2H.6q(1N)}});J.1g.2S("3F.3L",1a(){2H.q2()}).2S("3k.3L",1a(){if(2H.7d){2H.7d[0].3k()}});if(!o.1m){o.1m=J.1g.8q()}J.7d.1m(o.1m);J.1g.3B();J.5r=$("<ul />",{"2s":"ui-8u ui-8u-cY","6s-6f":1l,"jP":"13j","6s-13f":J.fa[1],"id":J.fa[2]});J.jM=$("<2C />",{"2s":"ui-3L-1V"}).2Y(J.5r).4o(o.4o);J.5r.2S("8i.3L",1a(1N){K 8W=1k;3P(1N.3Z){1q $.ui.3Z.UP:if(1N.vE){2H.6q(1N,1l)}1j{2H.gS(-1)}1s;1q $.ui.3Z.Nn:if(1N.vE){2H.6q(1N,1l)}1j{2H.gS(1)}1s;1q $.ui.3Z.Ns:2H.gS(-1);1s;1q $.ui.3Z.Nr:2H.gS(1);1s;1q $.ui.3Z.NB:2H.gS(":4A");1s;1q $.ui.3Z.NL:2H.F0("up");1s;1q $.ui.3Z.NK:2H.F0("f5");1s;1q $.ui.3Z.NJ:2H.gS(":7W");1s;1q $.ui.3Z.NO:;1q $.ui.3Z.NN:2H.6q(1N,1l);$(1N.3f).7u("li:eq(0)").1R("7i");1s;1q $.ui.3Z.NM:8W=1l;2H.6q(1N,1l);$(1N.3f).7u("li:eq(0)").1R("7i");1s;1q $.ui.3Z.13w:2H.6q(1N,1l);1s;5P:8W=1l}1b 8W}).2S("iO.3L",1a(1N){if(1N.mY>0){2H.EJ(1N.mY,"3k")}1b 1l}).2S("88.3L 7i.3L",1a(){1b 1k});$(3z).2S("61.3L-"+J.fa[0],$.b4(2H.6q,J))},Aw:1a(){K 2H=J,o=J.1v;K 9r=[];J.1g.2B("2W").2p(1a(){K 1L=$(J);9r.1G({1o:1L.1n("1o"),2g:2H.P8(1L.2g(),1L),1Z:1L.1n("1Z"),2P:1L.1n("2P"),ha:1L.1n("2s"),qJ:1L.1n("qJ"),qG:1L.1P("Eu"),qH:o.qH.2J(1L)})});K na=2H.1v.2G=="lz"?" ui-4N-8R":"";J.5r.3J("");if(9r.1f){1p(K i=0;i<9r.1f;i++){K Fg={jP:"FC"};if(9r[i].2P){Fg["2s"]="ui-4N-2P"}K vG={3J:9r[i].2g||"&2q;",5B:"#Ew",6Q:-1,jP:"2W","6s-1Z":1k};if(9r[i].2P){vG["6s-2P"]=1l}if(9r[i].qJ){vG["qJ"]=9r[i].qJ}K NI=$("<a/>",vG).2S("3k.3L",1a(){$(J).1P().iE()}).2S("4W.3L",1a(){$(J).1P().eM()});K iy=$("<li/>",Fg).2Y(NI).1h("1W",i).2r(9r[i].ha).1h("jN",9r[i].ha||"").2S("7i.3L",1a(1N){if(2H.vI&&(!2H.pW(1N.7f)&&!2H.pW($(1N.7f).7u("ul > li.ui-3L-d1 ")))){2H.1W($(J).1h("1W"));2H.2x(1N);2H.6q(1N,1l)}1b 1k}).2S("3F.3L",1a(){1b 1k}).2S("iE.3L",1a(e){if(!$(J).4H("ui-4N-2P")&&!$(J).1P("ul").1P("li").4H("ui-4N-2P")){e.NE=2H.1g[0].1v[$(J).1h("1W")].1o;2H.9g("7r",e,2H.fV());2H.da().2r(na);2H.p9().3K("ui-3L-1i-3k ui-4N-7r");$(J).3K("ui-4N-8R").2r("ui-3L-1i-3k ui-4N-7r")}}).2S("eM.3L",1a(e){if($(J).is(2H.da())){$(J).2r(na)}e.NE=2H.1g[0].1v[$(J).1h("1W")].1o;2H.9g("4W",e,2H.fV());$(J).3K("ui-3L-1i-3k ui-4N-7r")});if(9r[i].qG.1f){K vH="ui-3L-d1-"+J.1g.2B("Eu").1W(9r[i].qG);if(J.5r.2B("li."+vH).1f){J.5r.2B("li."+vH+":7W ul").2Y(iy)}1j{$(\'<li jP="FC" 2s="ui-3L-d1 \'+vH+(9r[i].qG.1n("2P")?" "+\'ui-4N-2P" 6s-2P="1l"\':\'"\')+\'><2u 2s="ui-3L-d1-3G">\'+9r[i].qG.1n("3G")+"</2u><ul></ul></li>").4o(J.5r).2B("ul").2Y(iy)}}1j{iy.4o(J.5r)}if(o.d9){1p(K j in o.d9){if(iy.is(o.d9[j].2B)){iy.1h("jN",9r[i].ha+" ui-3L-NC").2r("ui-3L-NC");K uf=o.d9[j].3T||"";iy.2B("a:eq(0)").lq(\'<2u 2s="ui-3L-1i-3T ui-3T \'+uf+\'"></2u>\');if(9r[i].qH){iy.2B("2u").2T("mM-af",9r[i].qH)}}}}}}1j{$(\'<li jP="FC"><a 5B="#Ew" 6Q="-1" jP="2W"></a></li>\').4o(J.5r)}K iD=o.2G=="jT";J.7d.8N("ui-3L-jT",iD).8N("ui-3L-lz",!iD);J.5r.8N("ui-3L-1V-jT ui-b2-4P",iD).8N("ui-3L-1V-lz ui-b2-76",!iD).2B("li:4A").8N("ui-b2-1M",!iD).5e().2B("li:7W").2r("ui-b2-4P");J.OY.8N("ui-3T-qf-1-s",iD).8N("ui-3T-qf-2-n-s",!iD);if(o.2G=="jT"){J.5r.1m(o.pl?o.pl:o.1m)}1j{J.5r.1m(o.pl?o.pl:o.1m-o.OT)}if(!cQ.h3.3y(/XB 2/)){K OO=J.jM.1w();K EV=$(3z).1w();K EP=o.9d?3A.6d(o.9d,EV):EV/3;if(OO>EP){J.5r.1w(EP)}}J.9a=J.5r.2B("li:6r(.ui-3L-d1)");if(J.1g.1n("2P")){J.yD()}1j{J.Pc()}J.q2();J.da().2r("ui-3L-1i-3k");iB(J.ON);J.ON=3z.6P(1a(){2H.EE()},gI)},6C:1a(){J.1g.sB(J.YF).3K("ui-3L-2P"+" "+"ui-4N-2P").lL("6s-2P").8Q(".3L");$(3z).8Q(".3L-"+J.fa[0]);$(2K).8Q(".3L-"+J.fa[0]);J.F8.3M();J.jM.3M();J.1g.8Q(".3L").5k();$.Ij.3g.6C.3v(J,2F)},EJ:1a(FN,EM){K 2H=J,c=62.Gf(FN).3W(),pC=1d,eX=1d;if(2H.pw){3z.iB(2H.pw);2H.pw=2y}2H.jQ=(2H.jQ===2y?"":2H.jQ).4b(c);if(2H.jQ.1f<2||2H.jQ.7x(-2,1)===c&&2H.pz){2H.pz=1l;pC=c}1j{2H.pz=1k;pC=2H.jQ}K dr=(EM!=="3k"?J.da().1h("1W"):J.p9().1h("1W"))||0;1p(K i=0;i<J.9a.1f;i++){K OS=J.9a.eq(i).2g().7x(0,pC.1f).3W();if(OS===pC){if(2H.pz){if(eX===1d){eX=i}if(i>dr){eX=i;1s}}1j{eX=i}}}if(eX!==1d){J.9a.eq(eX).2B("a").1R(EM)}2H.pw=3z.6P(1a(){2H.pw=2y;2H.jQ=2y;2H.pz=2y},2H.1v.OR)},fV:1a(){K 1W=J.1W();1b{1W:1W,2W:$("2W",J.1g).4z(1W),1o:J.1g[0].1o}},7C:1a(1N){if(J.7d.1n("6s-2P")!="1l"){K 2H=J,o=J.1v,1Z=J.da(),2k=1Z.2B("a");2H.OQ(1N);2H.7d.2r("ui-4N-8R");2H.5r.1n("6s-6f",1k);2H.jM.2r("ui-3L-7C");if(o.2G=="jT"){2H.7d.3K("ui-b2-76").2r("ui-b2-1M")}1j{J.5r.2T("2f",-YC).4O(J.5r.4O()+1Z.2R().1M-J.5r.7h()/ 2 + 1Z.7h() /2).2T("2f","6a")}2H.EE();if(2k.1f){2k[0].3k()}2H.kZ=1l;2H.9g("7C",1N,2H.fV())}},6q:1a(1N,vn){if(J.7d.is(".ui-4N-8R")){J.7d.3K("ui-4N-8R");J.jM.3K("ui-3L-7C");J.5r.1n("6s-6f",1l);if(J.1v.2G=="jT"){J.7d.3K("ui-b2-1M").2r("ui-b2-76")}if(vn){J.7d.3k()}J.kZ=1k;J.9g("6q",1N,J.fV())}},dF:1a(1N){J.1g.1R("dF");J.9g("dF",1N,J.fV())},2x:1a(1N){if(J.pW(1N.7f)){1b 1k}J.9g("2x",1N,J.fV())},8u:1a(){1b J.jM.5L(J.F8)},OQ:1a(1N){$(".ui-3L.ui-4N-8R").6r(J.7d).2p(1a(){$(J).1h("P0").3L("6q",1N)});$(".ui-3L.ui-4N-7r").1R("eM")},EX:1a(1N,vn){if(J.kZ){J.6q(1N,vn)}1j{J.7C(1N)}},P8:1a(2g,1L){if(J.1v.7l){2g=J.1v.7l(2g,1L)}1j{if(J.1v.Pd){2g=$("<2C />").2g(2g).3J()}}1b 2g},vf:1a(){1b J.1g[0].dr},da:1a(){1b J.9a.eq(J.vf())},p9:1a(){1b J.5r.2B(".ui-3L-1i-3k")},np:1a(b0,v2){if(!J.1v.2P){K va=6u(J.da().1h("1W")||0,10);K 5O=va+b0;if(5O<0){5O=0}if(5O>J.9a.4l()-1){5O=J.9a.4l()-1}if(5O===v2){1b 1k}if(J.9a.eq(5O).4H("ui-4N-2P")){b0>0?++b0:--b0;J.np(b0,5O)}1j{J.9a.eq(5O).1R("iE").1R("7i")}}},gS:1a(b0,v2){if(!9B(b0)){K va=6u(J.p9().1h("1W")||0,10);K 5O=va+b0}1j{K 5O=6u(J.9a.42(b0).1h("1W"),10)}if(5O<0){5O=0}if(5O>J.9a.4l()-1){5O=J.9a.4l()-1}if(5O===v2){1b 1k}K nf="ui-3L-1i-"+3A.5o(3A.ni()*9i);J.p9().2B("a:eq(0)").1n("id","");if(J.9a.eq(5O).4H("ui-4N-2P")){b0>0?++b0:--b0;J.gS(b0,5O)}1j{J.9a.eq(5O).2B("a:eq(0)").1n("id",nf).3k()}J.5r.1n("6s-P3",nf)},F0:1a(ek){K pg=3A.bj(J.5r.7h()/J.9a.4A().7h());pg=ek=="up"?-pg:pg;J.gS(pg)},nX:1a(1r,1o){J.1v[1r]=1o;if(1r=="2P"){if(1o){J.6q()}J.1g.5L(J.7d).5L(J.5r)[1o?"2r":"3K"]("ui-3L-2P "+"ui-4N-2P").1n("6s-2P",1o).1n("6Q",1o?1:0)}},yD:1a(1W,1C){if(2A 1W=="2y"){J.nX("2P",1l)}1j{J.Eq(1C||"2W",1W,1k)}},Pc:1a(1W,1C){if(2A 1W=="2y"){J.nX("2P",1k)}1j{J.Eq(1C||"2W",1W,1l)}},pW:1a(4e){1b $(4e).4H("ui-4N-2P")},Eq:1a(1C,1W,vm){K 1g=J.1g.2B(1C).eq(1W),bd=1C==="Eu"?J.5r.2B("li.ui-3L-d1-"+1W):J.9a.eq(1W);if(bd){bd.8N("ui-4N-2P",!vm).1n("6s-2P",!vm);if(vm){1g.lL("2P")}1j{1g.1n("2P","2P")}}},1W:1a(5O){if(2F.1f){if(!J.pW($(J.9a[5O]))&&5O!=J.vf()){J.1g[0].dr=5O;J.q2();J.dF()}1j{1b 1k}}1j{1b J.vf()}},1o:1a(4y){if(2F.1f&&4y!=J.1g[0].1o){J.1g[0].1o=4y;J.q2();J.dF()}1j{1b J.1g[0].1o}},q2:1a(){K na=J.1v.2G=="lz"?" ui-4N-8R":"";K nf="ui-3L-1i-"+3A.5o(3A.ni()*9i);J.5r.2B(".ui-3L-1i-1Z").3K("ui-3L-1i-1Z"+na).2B("a").1n("6s-1Z","1k").1n("id","");J.da().2r("ui-3L-1i-1Z"+na).2B("a").1n("6s-1Z","1l").1n("id",nf);K P7=J.7d.1h("jN")?J.7d.1h("jN"):"";K Em=J.da().1h("jN")?J.da().1h("jN"):"";J.7d.3K(P7).1h("jN",Em).2r(Em).2B(".ui-3L-7m").3J(J.da().2B("a:eq(0)").3J());J.5r.1n("6s-P3",nf)},EE:1a(){K o=J.1v,wn={of:J.7d,my:"2f 1M",at:"2f 4P",jk:"mZ"};if(o.2G=="lz"){K 1Z=J.da();wn.my="2f 1M"+(J.5r.2v().1M-1Z.2v().1M-(J.7d.7h()+1Z.7h())/2);wn.jk="cn"}J.jM.lL("2G").4t(J.1g.4t()+2).2R($.4C(wn,o.P5))}})})(2I);(1a(bJ){if(2A aS==="1a"&&aS.wN){aS(["fc"],bJ)}1j{bJ(2I)}})(1a($){K 1I=$.8u("aw.1I",{YH:1,P4:0,Ov:1k,Ou:1k,Z5:"<1I>",Fm:1k,9U:1d,nh:1d,dV:1d,nm:1d,zN:1k,7n:[24,24,24,120,80,90,100,100,85,70,60,40,40],1v:{dW:["y"],9w:{5g:1d,sR:1d,sY:1d},1m:1d,1w:1d,Io:1l},fZ:1a(e){K $e;if(e.1f){$e=e;e=e[0]}1j{$e=$(e)}if(e.2G.4T=="3r"){if(1B(e.2G.1m)){1b 0}1b 6u(e.2G.1m)}1b $e.8q()},iY:1a(e,1m,n8,Ot){if(1m==0){1b}K $e;if(e.1f){$e=e;e=e[0]}1j{$e=$(e)}if(n8==2y||n8==1d){if(e.2G.4T!="3r"){n8=$e.8q()-$e.1m()}1j{n8=J.P4}}K OM=1m-n8;$e.1m(OM);if(Ot){}},On:1a(e){1b $(e).7h()},Oj:1a(aT,c0){K b6=J.Os(aT,c0);if(b6!=1d){if(b6.2G.4T=="3r"||(!1B(b6.j8["9k"])||b6.jA==1d)){b6=1d}}1b b6},Os:1a(aT,c0){K gU=0;K FH=0;1p(K i=0;i<c0.1f;i++){K $th=c0[i];gU=i+FH;if($th.j8["9k"]){K 2u=0+$th.j8["9k"].1o-1;if(gU<=aT&&aT<=gU+2u){1b $th}FH+=2u}if(gU==aT){1b $th}}1b 1d},vW:1a(){K 3h=J;K 1O=J.nq().ba(1a(i,e){K 1m=0;if(e.2G.4T=="3r"){1m=$(e).8q()}1j{1m=3h.fZ(e)}if(1m<=2){1m=3h.7n[i]}1b 1m}).4z();1b 1O},YD:1a(){if(J.dV==1d){J.dV=J.1g.2B("> f4 > tr:4A-wl").4A()}if(J.dV.1f==0){J.dV=0}1b J.dV},ne:1a(){if(J.dV==1d){J.dV=J.1g.1P().2B(".hz-f4 > f4 > tr:4A-wl").4A()}if(J.dV.1f==0){J.dV=0}1b J.dV},Ow:1a(){if(J.9U==1d){J.9U=J.1g.2B("9U")}if(J.9U.1f==0){J.9U=1d}1b J.9U},OF:1a(){if(J.nm==1d){J.nm=J.1g.2B("> dZ:4A")}if(J.nm.1f==0){J.nm=1d}1b J.nm},jl:1a(){if(J.nh==1d){J.nh=J.1g}if(J.nh.1f==0){J.nh=1d}1b J.nh},Oq:1a(){1b J.1g.2B("> dZ tr.ui-qb-4k-1H:4A-wl")},ru:1a(){1b J.ne().5u()},nq:1a(){1b J.Oq().5u()},ro:1a(){K 9U=J.Ow();if(9U==1d){1b[]}1b 9U.5u()},OB:1a(1g){K $1g=$(1g);1b{"x":$1g.8q()<$1g.6U("rJ"),"y":$1g.7h()<$1g.6U("gy")}},rr:1a(){if(J.Ov){1b 1l}if(J.Ou){1b 1k}K 1g=J.1g.1P()[0];K 9m=1g.9m;if(9m==0){9m=1g.lW}1b 9m<1g.gy},vJ:1a(aY){K 3h=J;if(aY==2y){aY=J.rr()}J.vU(J.iS(),aY);K 9k=0;J.ru().2p(1a(i,e){K gU=i+9k;K 1m=0;if(e.j8["9k"]){K 2u=0+e.j8["9k"].1o-1;1p(K j=0;j<=2u;j++){1m+=3h.5n[gU+j]}9k+=2u}1j{1m=3h.5n[gU]}if(gU==3h.5n.1f-1){}3h.iY(e,1m,1d,1l)})},ye:1a(){J.CH();J.vU()},vC:1a(){J.jl().2T("4n-1m","100%");J.Op();J.5n=J.vW();J.jl().2T("4n-1m","vS");J.vR();J.vJ()},vR:1a(){K 3h=J;J.ro().2p(1a(i,e){if(3h.5n[i]>0){3h.iY(e,3h.5n[i])}})},Op:1a(){K 3h=J;J.ro().1m("6a")},FY:1a(5n){1b},CH:1a(){K 3h=J;K du=J.rr();if(du&&!J.zN){K FF=J.1g.1P().1m();K w=J.1g.8q();if(w==0){w=J.1g.1m()}if(w>0&&(FF>0&&w<=FF)){K FW=3h.5n[0]+3h.5n[1]+3h.5n[2];K 7Z=(J.1g.1P()[0].nN-FW-1)/(w-FW);1p(K i=3;i<3h.5n.1f;i++){3h.5n[i]=3h.5n[i]*7Z}}}if(du){J.zN=1l}J.vR();3h.5n=J.Oi();J.FY(3h.5n);J.vJ();J.1g.2T("4n-1m","vS");J.$vY.2T("4n-1m","vS");3h.5n=J.Ol();J.FY(3h.5n);J.vR();J.vJ();J.FO(J.5n)},Ol:1a(){K 3h=J;K c0=J.ru();K 1O=J.nq().ba(1a(i,e){K 1m=0;if(e.2G.4T=="3r"){1m=$(e).8q()}1j{1m=3h.fZ(e)}K b6=3h.Oj(i,c0);if(b6){K lx=3h.fZ(b6);1m=3A.4n(1m,lx)}1b 1m}).4z();1b 1O},Oi:1a(){K 3h=J;K 1O=J.nq().ba(1a(i,e){K 1m=0;if(e.2G.4T=="3r"){1m=$(e).8q()}1j{1m=3h.fZ(e)}if(1m<=2&&!3h.1g.is(":6v")){1m=3h.7n[i]}1b 1m}).4z();1b 1O},iS:1a(5n){if(5n==2y){5n=J.5n}K c5=0;K 6p=J.ro();1p(K i=0;i<5n.1f;i++){if(6p.1f<i&&(6p[i]!=1d&&6p[i].2G.4T=="3r")){c5+=0}1j{c5+=5n[i]}}1b c5},mJ:1a(1m,aY){if(1m==2y){1m=J.5n}if(3Q.cd(1m)){1m=J.iS(1m)}J.FO(1m);J.vU(1m,aY)},FO:1a(1m){1b;if(1m==2y){1m=J.5n}if(3Q.cd(1m)){1m=J.iS(1m)}K 3H=J.jl();3H.1m(1m)},vU:1a(1m,aY){1b;if(1m==2y){1m=J.5n}if(3Q.cd(1m)){1m=J.iS(1m)}if(aY==2y){aY=J.rr()}K dV=J.ne();K lx=1m+(aY?J.Oo:0);lx=lx;J.1g.1P().2B(".hz-f4").1m(lx)},Z6:1a(){if(J.FS==1d){J.FS=J.1g.2B("> dZ")}1b J.FS},Dg:1a(){K Z7=J.1g.1w()-J.1g.2B("f4").ba(1a(i,e){1b $(e).1f?$(e).7h():0}).4z().xH(1a(49,6m){1b 49+6m},0)},OG:1a(iZ){K 9U=$("<9U/>");K c0=J.nq();1p(K i=0;i<c0.1f;i++){K 3O=$(c0[i]);K ip=$("<ip />");K 9k=3O.1n("9k");if(1B(9k)){9k=1}1j{9k=6u(9k)}ip.1n("2u",9k);ip.1n("2s",3O.1n("2s"));if(3O.2T("4T")=="3r"){ip.2T("4T",3O.2T("4T"))}K 1m=iZ[i];ip.1m(1m);9U.2Y(ip)}1b 9U},oS:1a(){J.Z4();K me=J;J.5n=[];J.mE=1k;K $1I=J.1g;J.Fm=J.1g.is(":6v");J.Oo=2I.2R.Z2();J.4l=J.D3(J.1v.1m,J.1v.1w);J.dW=J.OE(J.1v.dW);J.sZ=$1I.2B("> dZ > tr").5u().1f;J.9w=J.OA(J.1v.9w);J.4l={"1m":J.4l.1m!==1d?J.4l.1m:J.fZ($1I),"1w":J.4l.1w!==1d?J.4l.1w:J.On($1I)};J.hB={"1m":J.4l.1m-($1I.8q()-$1I.1m()),"1w":J.4l.1w-($1I.7h()-$1I.1w())};J.OJ();K Fi=$1I.1P().1m()-3;J.5n=J.vW();K w5;K Fj=J.$vY.2B("tr").7h();if(Fj>0){w5=Fj+"px";$1I.2B("> f4").2T({"1w":w5});$1I.2T({"k6-1M":w5})}J.jl().1n("2s",$1I.1n("2s"));$("#qb-ui-4k 1I")[0].2G.1m=Fi+"px";$("#qb-ui-4k 1I")[0].2G["6d-1m"]=Fi+"px";if(J.Fm){J.Dg()}J.eQ={};J.5n=J.vW();J.mJ(J.5n);J.1g.2B("f4").3M();$("#qb-ui-4k 1I")[0].2G.1m="";$("#qb-ui-4k 1I")[0].2G["6d-1m"]="";if(J.9w.5g!=1d){K vV=J.LX();J.ru().2p(1a(i,e){if(me.9w.5g[i]&&$(e).4H("Vr-61")){if(me.9w.sR!=1d){vV["fp"]=me.9w.sR[i]}if(me.9w.sY!=1d){vV["a8"]=me.9w.sY[i]}$(e).5g(vV)}})}if(!me.eQ.x){me.Ma($1I.2B("> dZ").4z(0),{"9v":1a(1N){K 2v=-1*$(1N.3f).57();me.ne().2T("2f",2v+"px")}});me.eQ.x=1l}K 9U=J.OG(J.5n);J.OF().zs(9U);J.ye();CA=1k},OJ:1a(){J.$w=$(3z);if(J.1g.4H("e9-y")){J.1g.3K("e9-y").1P().2r("e9-y")}J.$vY=J.1g.Fe(".hz-f4");J.$OI=J.1g.1P(".hz-ol");K me=J;J.1g.1P(".hz-ol").9v(1a(){me.Fd()});J.$w.9v(1a(){me.Fd()})},Fd:1a(){J.$vY.2T({1M:J.$OI.4O()})},Xw:1a(){},hL:1a(1o){1b 1o===1d||2A 1o=="2y"},D3:1a(1m,1w){K 4l={};if(J.hL(1m)||!J.Fy(1m)){4l.1m=1d}1j{4l.1m=1m}if(J.hL(1w)||!J.Fy(1w)){4l.1w=1d}1j{4l.1w=1w}1b 4l},OE:1a(1o){K dW;if(1o===1l){dW={"x":1l,"y":1l}}1j{if(1o=="x"){dW={"x":1l,"y":1k}}1j{if(1o=="y"){dW={"x":1k,"y":1l}}1j{if($.cd(1o)){dW={"x":$.wz("x",1o),"y":$.wz("y",1o)}}1j{dW={"x":1k,"y":1k}}}}}1b dW},OA:1a(9w){K 7H={};7H["5g"]=J.hL(9w)?1d:J.Oz(9w.5g);7H["sR"]=J.hL(9w)?1d:J.Fx(9w.sR);7H["sY"]=J.hL(9w)?1d:J.Fx(9w.sY);1b 7H},Oz:1a(5g){K 7H=[];if(J.hL(5g)){1b 1d}1j{if($.ch(5g)){7H=5g()}1j{if($.cd(5g)){7H=5g}1j{if(5g===1l){1p(K i=0;i<J.sZ;i++){7H[i]=1l}1b 7H}1j{1b 1d}}}}if(!$.cd(7H)||(7H.1f!=J.sZ||!7H.sX(1a(1o){1b 1o===1l||1o===1k}))){1b 1d}1b 7H},Ya:1a(1o){1b+1o==3A.bj(+1o)},Fs:1a(1o){1b+1o==3A.bj(+1o)&&+1o>=0},Fy:1a(1o){1b+1o==3A.bj(+1o)&&+1o>0},Fx:1a(1m){K 7H=[];if(J.hL(1m)){1b 1d}1j{if($.ch(1m)){7H=1m()}1j{if($.cd(1m)){7H=1m}1j{if(J.Fs(1m)){K 1o=+1m;1p(K i=0;i<J.sZ;i++){7H[i]=1o}1b 7H}1j{1b 1d}}}}K 3h=J;if(!$.cd(7H)||(7H.1f!=J.sZ||!7H.sX(1a(1o){1b 3h.Fs(1o)}))){1b 1d}1b 7H},Dc:1a(iZ,D6,sV){if(2A sV=="2y"){sV=0;1p(K i=0;i<iZ.1f;i++){sV+=iZ[i]}}K 7Z=D6/sV;K sG=[];K Db=0;1p(K i=0;i<iZ.1f-1;i++){sG[i]=3A.5o(7Z*iZ[i]);Db+=sG[i]}sG[i]=D6-Db;1b sG},61:1a(1m,1w){K 3h=J;K lo=J.D3(1m,1w);K $1I=J.1g;if(lo.1m!=1d){$1I.2T("1m",1m);J.4l.1m=lo.1m;J.hB.1m=lo.1m-($1I.8q()-$1I.1m());K c5=J.iS();if(J.dW.x){if(J.eQ.x||!J.1v.Io){K Do=J.eQ.x;K Dm=J.OB($1I.1P()).x;if(!Do&&Dm){J.Ma($1I.2B("> dZ").4z(0),{"9v":1a(1N){K 2v=-1*$(1N.3f).57();3h.ne().2T("2f",2v+"px")}});J.mJ(c5);J.eQ.x=1l}1j{if(Do&&!Dm){J.M9($1I.2B("> dZ"),"9v");J.eQ.x=1k}}}1j{J.5n=J.Dc(J.5n,J.hB.1m,c5);if(J.eQ.x){J.jl().2B("dZ").2T("1m","");J.ne().1m(J.hB.1m+"px");J.M9($1I.2B("> dZ"),"9v");J.eQ.x=1k}}}1j{if(c5!=J.hB.1m){J.5n=J.Dc(J.5n,J.hB.1m,c5)}}$1I.5u().2T("1m",J.hB.1m+"px")}if(1w!=1d){J.4l.1w=lo.1w;J.hB.1w=lo.1w-($1I.7h()-$1I.1w());J.Dg()}J.84()},84:1a(){J.CH()},3H:1a(3o){J.jl().2B("dZ").3J(3o);J.84()},YN:1a(1g){1b $(1g).1W()},CK:1a(1g){K c0=J.ru();K 1O=0;1p(K i=0;i<c0.1f;i++){K 3O=c0[i];if(3O.j8["9k"]){1O+=0+3O.j8["9k"].1o-1}if(3O==1g){1s}1O++}1b 1O},LX:1a(){K 3h=J;K $1I=J.1g;K $b6;K nj;K CJ;K aT;K fR=[];K 54=0;K aY;K LW;K r3=0;K zu;K zt;K jp=0;1b{fM:"e",3a:1a(1N,ui){3h.zN=1l;$b6=ui.1g;jp=3h.fZ($b6);CJ=3h.CK(ui.1g[0]);aT=3h.CK(ui.1g[0]);zu=3h.ro()[CJ];nj=3h.nq()[aT];3h.mE=1k;CA=1l;aY=3h.rr();LW=$(nj).8q()-$(nj).1m();r3=3h.iS()},61:1a(1N,ui){if(3h.mE){1b}3h.mE=1l;K CF=ui.4l.1m-ui.jp.1m;if(CF==54){1b}54=CF;1p(K i=0;i<3h.5n.1f;i++){fR[i]=3h.5n[i]}3h.mJ(r3+54,aY);3h.iY(zu,fR[aT]+54);3h.iY(nj,fR[aT]+54);zt=3A.4n(3h.fZ(nj),3h.fZ($b6));if(fR[aT]+54<zt){54=zt-jp;3h.mJ(r3+54,aY);3h.iY(zu,fR[aT]+54);3h.iY(ui.1g,fR[aT]+54);3h.mJ(r3+54,aY)}3h.mE=1k;fR[aT]+=54},6y:1a(1N,ui){CA=1k;3h.mE=1k;1p(K i=0;i<3h.5n.1f;i++){3h.5n[i]=fR[i]}3h.ye()}}}})});(1a(bJ){if(2A aS==="1a"&&aS.wN){aS(["fc"],bJ)}1j{bJ(2I)}})(1a($){$.fn.zy=$.fn.zy||$.fn.M4;$.fn.4C({aE:1a(4h,1v){1b J.he(4h,$.4C({CD:1l},1v))},he:1a(4h,1v){if(!J[4h]){98\'$.he => qQ 2I 4h "\'+4h+\'" Ix x7 yN 6r Yp\'}K bk={7X:1k,6w:1k,M3:1k,4T:"5J",CD:1k};K nF=$.4C(bk,1v);K $3f=J.eq(0);K yk,n9;if(nF.CD){K 1o=$3f[4h]();if(1o>10){1b 1o}}if(nF.6w===1l){yk=1a(){K 2G="2R: 7X !rb; 1M: -Ym !rb; ";$3f=$3f.6w().1n("2G",2G).4o("3H")};n9=1a(){$3f.3M()}}1j{K 8S=[];K 2G="";K $6f;yk=1a(){$6f=$3f.7u().zy().42(":6f");2G+="i8: 6f !rb; 4T: "+nF.4T+" !rb; ";if(nF.7X===1l){2G+="2R: 7X !rb; "}$6f.2p(1a(){K $J=$(J);K zA=$J.1n("2G");8S.1G(zA);$J.1n("2G",zA?zA+";"+2G:2G)})};n9=1a(){$6f.2p(1a(i){K $J=$(J);K CC=8S[i];if(CC===2y){$J.lL("2G")}1j{$J.1n("2G",CC)}})}}yk();K he=/(Xy)/.9A(4h)?$3f[4h](nF.M3):$3f[4h]();n9();1b he}})});(1a(m9){K 6Y="0.4.2",3S="87",6e=/[\\.\\/]/,CM="*",kz=1a(){},LZ=1a(a,b){1b a-b},j1,6y,4U={n:{}},3l=1a(1x,bv){1x=62(1x);K e=4U,CO=6y,2w=3Q.3g.4d.2J(2F,2),ft=3l.ft(1x),z=0,f=1k,l,iU=[],eg={},2E=[],ce=j1,XA=[];j1=1x;6y=0;1p(K i=0,ii=ft.1f;i<ii;i++){if("4t"in ft[i]){iU.1G(ft[i].4t);if(ft[i].4t<0){eg[ft[i].4t]=ft[i]}}}iU.hQ(LZ);4x(iU[z]<0){l=eg[iU[z++]];2E.1G(l.3v(bv,2w));if(6y){6y=CO;1b 2E}}1p(i=0;i<ii;i++){l=ft[i];if("4t"in l){if(l.4t==iU[z]){2E.1G(l.3v(bv,2w));if(6y){1s}do{z++;l=eg[iU[z]];l&&2E.1G(l.3v(bv,2w));if(6y){1s}}4x(l)}1j{eg[l.4t]=l}}1j{2E.1G(l.3v(bv,2w));if(6y){1s}}}6y=CO;j1=ce;1b 2E.1f?2E:1d};3l.f9=4U;3l.ft=1a(1x){K 8d=1x.3R(6e),e=4U,1i,1J,k,i,ii,j,jj,y6,es=[e],2E=[];1p(i=0,ii=8d.1f;i<ii;i++){y6=[];1p(j=0,jj=es.1f;j<jj;j++){e=es[j].n;1J=[e[8d[i]],e[CM]];k=2;4x(k--){1i=1J[k];if(1i){y6.1G(1i);2E=2E.4b(1i.f||[])}}}es=y6}1b 2E};3l.on=1a(1x,f){1x=62(1x);if(2A f!="1a"){1b 1a(){}}K 8d=1x.3R(6e),e=4U;1p(K i=0,ii=8d.1f;i<ii;i++){e=e.n;e=e.87(8d[i])&&e[8d[i]]||(e[8d[i]]={n:{}})}e.f=e.f||[];1p(i=0,ii=e.f.1f;i<ii;i++){if(e.f[i]==f){1b kz}}e.f.1G(f);1b 1a(4t){if(+4t==+4t){f.4t=+4t}}};3l.f=1a(1N){K 2t=[].4d.2J(2F,1);1b 1a(){3l.3v(1d,[1N,1d].4b(2t).4b([].4d.2J(2F,0)))}};3l.6y=1a(){6y=1};3l.nt=1a(CN){if(CN){1b(1T e3("(?:\\\\.|\\\\/|^)"+CN+"(?:\\\\.|\\\\/|$)")).9A(j1)}1b j1};3l.XV=1a(){1b j1.3R(6e)};3l.fG=3l.8Q=1a(1x,f){if(!1x){3l.f9=4U={n:{}};1b}K 8d=1x.3R(6e),e,1r,5X,i,ii,j,jj,j7=[4U];1p(i=0,ii=8d.1f;i<ii;i++){1p(j=0;j<j7.1f;j+=5X.1f-2){5X=[j,1];e=j7[j].n;if(8d[i]!=CM){if(e[8d[i]]){5X.1G(e[8d[i]])}}1j{1p(1r in e){if(e[3S](1r)){5X.1G(e[1r])}}}j7.5X.3v(j7,5X)}}1p(i=0,ii=j7.1f;i<ii;i++){e=j7[i];4x(e.n){if(f){if(e.f){1p(j=0,jj=e.f.1f;j<jj;j++){if(e.f[j]==f){e.f.5X(j,1);1s}}!e.f.1f&&4r e.f}1p(1r in e.n){if(e.n[3S](1r)&&e.n[1r].f){K rY=e.n[1r].f;1p(j=0,jj=rY.1f;j<jj;j++){if(rY[j]==f){rY.5X(j,1);1s}}!rY.1f&&4r e.n[1r].f}}}1j{4r e.f;1p(1r in e.n){if(e.n[3S](1r)&&e.n[1r].f){4r e.n[1r].f}}}e=e.n}}};3l.Y9=1a(1x,f){K f2=1a(){3l.8Q(1x,f2);1b f.3v(J,2F)};1b 3l.on(1x,f2)};3l.6Y=6Y;3l.3X=1a(){1b"Uc Cl OP Y2 "+6Y};2A j4!="2y"&&j4.wy?j4.wy=3l:2A aS!="2y"?aS("3l",[],1a(){1b 3l}):m9.3l=3l})(3z||J);(1a(m9,bJ){if(2A aS==="1a"&&aS.wN){aS(["3l"],1a(3l){1b bJ(m9,3l)})}1j{bJ(m9,m9.3l)}})(J,1a(3z,3l){1a R(4A){if(R.is(4A,"1a")){1b cR?4A():3l.on("4E.mz",4A)}1j{if(R.is(4A,4u)){1b R.5p.8E[3v](R,4A.5X(0,3+R.is(4A[0],nu))).5L(4A)}1j{K 2w=3Q.3g.4d.2J(2F,0);if(R.is(2w[2w.1f-1],"1a")){K f=2w.eJ();1b cR?f.2J(R.5p.8E[3v](R,2w)):3l.on("4E.mz",1a(){f.2J(R.5p.8E[3v](R,2w))})}1j{1b R.5p.8E[3v](R,2F)}}}}R.6Y="2.1.2";R.3l=3l;K cR,6e=/[, ]+/,bd={aK:1,4L:1,1K:1,bS:1,2g:1,af:1},Mq=/\\{(\\d+)\\}/g,mv="3g",3S="87",g={3m:2K,5U:3z},xC={zS:5c.3g[3S].2J(g.5U,"c4"),is:g.5U.c4},E5=1a(){J.ca=J.9S={}},73,4p="4p",3v="3v",4b="4b",qa="Y5"in g.5U||g.5U.Mm&&g.3m g6 Mm,E="",S=" ",4B=62,3R="3R",4U="3F uM 88 bq eM iE 7i rL rG rH DW"[3R](S),qU={88:"rL",bq:"rG",7i:"rH"},rI=4B.3g.3W,4g=3A,5E=4g.4n,6T=4g.6d,4G=4g.4G,6X=4g.6X,PI=4g.PI,nu="d8",4F="4F",4u="4u",3X="3X",kn="2d",Mj=5c.3g.3X,2N={},1G="1G",XM=R.Cf=/^5l\\([\'"]?([^\\)]+?)[\'"]?\\)$/i,Kl=/^\\s*((#[a-f\\d]{6})|(#[a-f\\d]{3})|B7?\\(\\s*([\\d\\.]+%?\\s*,\\s*[\\d\\.]+%?\\s*,\\s*[\\d\\.]+%?(?:\\s*,\\s*[\\d\\.]+%?)?)\\s*\\)|Lw?\\(\\s*([\\d\\.]+(?:4X|\\AU|%)?\\s*,\\s*[\\d\\.]+%?\\s*,\\s*[\\d\\.]+(?:%?\\s*,\\s*[\\d\\.]+)?)%?\\s*\\)|LR?\\(\\s*([\\d\\.]+(?:4X|\\AU|%)?\\s*,\\s*[\\d\\.]+%?\\s*,\\s*[\\d\\.]+(?:%?\\s*,\\s*[\\d\\.]+)?)%?\\s*\\))\\s*$/i,Mk={"XL":1,"Mi":1,"-Mi":1},N9=/^(?:XF-)?XE\\(([^,]+),([^,]+),([^,]+),([^\\)]+)\\)/,5o=4g.5o,cP="cP",4j=e8,bw=6u,Gy=4B.3g.9p,Na=R.lv={"bZ-5e":"3r","bZ-3a":"3r",4W:0,"7c-4L":"0 0 1e9 1e9",mC:"5P",cx:0,cy:0,2d:"#mF","2d-2X":1,3e:\'YO "Mh"\',"3e-96":\'"Mh"\',"3e-4l":"10","3e-2G":"zr","3e-bz":pZ,4v:0,1w:0,5B:"6t://YG.zP/","Z3-YV":0,2X:1,1K:"M0,0",r:0,rx:0,ry:0,4J:"",2n:"#e0","2n-aV":"","2n-et":"mW","2n-kd":"mW","2n-qB":0,"2n-2X":1,"2n-1m":1,3f:"YU","2g-Cy":"BC",5b:"c4",4i:"",1m:0,x:0,y:0},uk=R.Z0={4W:nu,"7c-4L":"AL",cx:nu,cy:nu,2d:"bn","2d-2X":nu,"3e-4l":nu,1w:nu,2X:nu,1K:"1K",r:nu,rx:nu,ry:nu,2n:"bn","2n-2X":nu,"2n-1m":nu,4i:"4i",1m:nu,x:nu,y:nu},Mg=/[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]/g,zh=/[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]*,[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]*/,Lt={hs:1,rg:1},Lv=/,?([YY]),?/gi,LS=/([Yl])[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]*,?[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]*)+)/ig,LO=/([YA])[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]*,?[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]*)+)/ig,Ih=/(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]*,?[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]*/ig,Yr=R.Co=/^r(?:\\(([^,]+?)[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]*,[\\bU\\bV\\bG\\bQ\\bE\\ck\\cg\\cN\\cL\\cz\\cH\\bY\\c9\\c3\\cw\\bT\\bW\\bI\\bL\\cf\\cv\\cu\\cM\\cC\\cS]*([^\\)]+?)\\))?/,jv={},YW=1a(a,b){1b a.1r-b.1r},Ne=1a(a,b){1b 4j(a)-4j(b)},kz=1a(){},N0=1a(x){1b x},oQ=R.BU=1a(x,y,w,h,r){if(r){1b[["M",x+r,y],["l",w-r*2,0],["a",r,r,0,0,1,r,r],["l",0,h-r*2],["a",r,r,0,0,1,-r,r],["l",r*2-w,0],["a",r,r,0,0,1,-r,-r],["l",0,r*2-h],["a",r,r,0,0,1,r,-r],["z"]]}1b[["M",x,y],["l",w,0],["l",0,h],["l",-w,0],["z"]]},E7=1a(x,y,rx,ry){if(ry==1d){ry=rx}1b[["M",x,y],["m",0,-ry],["a",rx,ry,0,1,1,0,2*ry],["a",rx,ry,0,1,1,0,-2*ry],["z"]]},dl=R.Ck={1K:1a(el){1b el.1n("1K")},aK:1a(el){K a=el.2t;1b E7(a.cx,a.cy,a.r)},bS:1a(el){K a=el.2t;1b E7(a.cx,a.cy,a.rx,a.ry)},4L:1a(el){K a=el.2t;1b oQ(a.x,a.y,a.1m,a.1w,a.r)},af:1a(el){K a=el.2t;1b oQ(a.x,a.y,a.1m,a.1w)},2g:1a(el){K 3p=el.qv();1b oQ(3p.x,3p.y,3p.1m,3p.1w)},5V:1a(el){K 3p=el.qv();1b oQ(3p.x,3p.y,3p.1m,3p.1w)}},pd=R.pd=1a(1K,5d){if(!5d){1b 1K}K x,y,i,j,ii,jj,gG;1K=iT(1K);1p(i=0,ii=1K.1f;i<ii;i++){gG=1K[i];1p(j=1,jj=gG.1f;j<jj;j+=2){x=5d.x(gG[j],gG[j+1]);y=5d.y(gG[j],gG[j+1]);gG[j]=x;gG[j+1]=y}}1b 1K};R.8J=g;R.1C=g.5U.Z1||g.3m.YT.YJ("6t://dN.w3.ew/TR/YK/YL#YQ","1.1")?"fe":"kl";if(R.1C=="kl"){K d=g.3m.eB("2C"),b;d.ov=\'<v:ed Ml="1"/>\';b=d.8G;b.2G.Jw="5l(#5P#kl)";if(!(b&&2A b.Ml=="1A")){1b R.1C=E}d=1d}R.3b=!(R.6K=R.1C=="kl");R.zV=E5;R.fn=73=E5.3g=R.3g;R.Xz=0;R.BN=0;R.is=1a(o,1C){1C=rI.2J(1C);if(1C=="s8"){1b!Mk[3S](+o)}if(1C=="4u"){1b o g6 3Q}1b 1C=="1d"&&o===1d||(1C==2A o&&o!==1d||(1C=="1A"&&o===5c(o)||(1C=="4u"&&(3Q.cd&&3Q.cd(o))||Mj.2J(o).4d(8,-1).3W()==1C)))};1a 6w(1y){if(2A 1y=="1a"||5c(1y)!==1y){1b 1y}K 1F=1T 1y.5K;1p(K 1r in 1y){if(1y[3S](1r)){1F[1r]=6w(1y[1r])}}1b 1F}R.8m=1a(x1,y1,x2,y2,x3,y3){if(x3==1d){K x=x1-x2,y=y1-y2;if(!x&&!y){1b 0}1b(180+4g.HD(-y,-x)*180/PI+9G)%9G}1j{1b R.8m(x1,y1,x3,y3)-R.8m(x2,y2,x3,y3)}};R.ab=1a(4X){1b 4X%9G*PI/180};R.4X=1a(ab){1b ab*180/PI%9G};R.XJ=1a(2Z,1o,fr){fr=R.is(fr,"s8")?fr:10;if(R.is(2Z,4u)){K i=2Z.1f;4x(i--){if(4G(2Z[i]-1o)<=fr){1b 2Z[i]}}}1j{2Z=+2Z;K oV=1o%2Z;if(oV<fr){1b 1o-oV}if(oV>2Z-fr){1b 1o-oV+2Z}}1b 1o};K sh=R.sh=1a(LV,LC){1b 1a(){1b"Xu-Xv-Y3-Y0-Y1".3u(LV,LC).9p()}}(/[xy]/g,1a(c){K r=4g.ni()*16|0,v=c=="x"?r:r&3|8;1b v.3X(16)});R.LB=1a(DA){3l("4E.LB",R,g.5U,DA);g.5U=DA;g.3m=g.5U.2K;if(R.5p.xT){R.5p.xT(g.5U)}};K oj=1a(3Y){if(R.6K){K oi=/^\\s+|\\s+$/g;K nW;6E{K zC=1T zz("XN");zC.XO("<3H>");zC.6q();nW=zC.3H}6I(e){nW=XX().2K.3H}K dz=nW.sb();oj=d6(1a(3Y){6E{nW.2G.3Y=4B(3Y).3u(oi,E);K 1o=dz.1dt("1dv");1o=(1o&gw)<<16|1o&1dj|(1o&1dm)>>>16;1b"#"+("Ka"+1o.3X(16)).4d(-6)}6I(e){1b"3r"}})}1j{K i=g.3m.eB("i");i.5b="mG\\mL 1dp 1dn";i.2G.4T="3r";g.3m.3H.4p(i);oj=d6(1a(3Y){i.2G.3Y=3Y;1b g.3m.m6.wW(i,E).Om("3Y")})}1b oj(3Y)},LF=1a(){1b"LP("+[J.h,J.s,J.b]+")"},Lz=1a(){1b"LU("+[J.h,J.s,J.l]+")"},Dz=1a(){1b J.7b},Dt=1a(r,g,b){if(g==1d&&(R.is(r,"1A")&&("r"in r&&("g"in r&&"b"in r)))){b=r.b;g=r.g;r=r.r}if(g==1d&&R.is(r,4F)){K 4a=R.dI(r);r=4a.r;g=4a.g;b=4a.b}if(r>1||(g>1||b>1)){r/=gw;g/=gw;b/=gw}1b[r,g,b]},DD=1a(r,g,b,o){r*=gw;g*=gw;b*=gw;K 4m={r:r,g:g,b:b,7b:R.4m(r,g,b),3X:Dz};R.is(o,"s8")&&(4m.2X=o);1b 4m};R.3Y=1a(4a){K 4m;if(R.is(4a,"1A")&&("h"in 4a&&("s"in 4a&&"b"in 4a))){4m=R.oK(4a);4a.r=4m.r;4a.g=4m.g;4a.b=4m.b;4a.7b=4m.7b}1j{if(R.is(4a,"1A")&&("h"in 4a&&("s"in 4a&&"l"in 4a))){4m=R.yX(4a);4a.r=4m.r;4a.g=4m.g;4a.b=4m.b;4a.7b=4m.7b}1j{if(R.is(4a,"4F")){4a=R.dI(4a)}if(R.is(4a,"1A")&&("r"in 4a&&("g"in 4a&&"b"in 4a))){4m=R.LD(4a);4a.h=4m.h;4a.s=4m.s;4a.l=4m.l;4m=R.LA(4a);4a.v=4m.b}1j{4a={7b:"3r"};4a.r=4a.g=4a.b=4a.h=4a.s=4a.v=4a.l=-1}}}4a.3X=Dz;1b 4a};R.oK=1a(h,s,v,o){if(J.is(h,"1A")&&("h"in h&&("s"in h&&"b"in h))){v=h.b;s=h.s;h=h.h;o=h.o}h*=9G;K R,G,B,X,C;h=h%9G/60;C=v*s;X=C*(1-4G(h%2-1));R=G=B=v-C;h=~~h;R+=[C,X,0,0,X,C][h];G+=[X,C,C,X,0,0][h];B+=[0,0,X,C,C,X][h];1b DD(R,G,B,o)};R.yX=1a(h,s,l,o){if(J.is(h,"1A")&&("h"in h&&("s"in h&&"l"in h))){l=h.l;s=h.s;h=h.h}if(h>1||(s>1||l>1)){h/=9G;s/=100;l/=100}h*=9G;K R,G,B,X,C;h=h%9G/60;C=2*s*(l<0.5?l:1-l);X=C*(1-4G(h%2-1));R=G=B=l-C/2;h=~~h;R+=[C,X,0,0,X,C][h];G+=[X,C,C,X,0,0][h];B+=[0,0,X,C,C,X][h];1b DD(R,G,B,o)};R.LA=1a(r,g,b){b=Dt(r,g,b);r=b[0];g=b[1];b=b[2];K H,S,V,C;V=5E(r,g,b);C=V-6T(r,g,b);H=C==0?1d:V==r?(g-b)/ C : V == g ? (b - r) /C+2:(r-g)/C+4;H=(H+9G)%6*60/9G;S=C==0?0:C/V;1b{h:H,s:S,b:V,3X:LF}};R.LD=1a(r,g,b){b=Dt(r,g,b);r=b[0];g=b[1];b=b[2];K H,S,L,M,m,C;M=5E(r,g,b);m=6T(r,g,b);C=M-m;H=C==0?1d:M==r?(g-b)/ C : M == g ? (b - r) /C+2:(r-g)/C+4;H=(H+9G)%6*60/9G;L=(M+m)/2;S=C==0?0:L<0.5?C/ (2 * L) : C /(2-2*L);1b{h:H,s:S,l:L,3X:Lz}};R.kV=1a(){1b J.5x(",").3u(Lv,"$1")};1a Lu(4u,1i){1p(K i=0,ii=4u.1f;i<ii;i++){if(4u[i]===1i){1b 4u.1G(4u.5X(i,1)[0])}}}1a d6(f,bv,o5){1a lu(){K 4M=3Q.3g.4d.2J(2F,0),2w=4M.5x("\\1dy"),8y=lu.8y=lu.8y||{},7a=lu.7a=lu.7a||[];if(8y[3S](2w)){Lu(7a,2w);1b o5?o5(8y[2w]):8y[2w]}7a.1f>=9i&&4r 8y[7a.dP()];7a.1G(2w);8y[2w]=f[3v](bv,4M);1b o5?o5(8y[2w]):8y[2w]}1b lu}K 1dD=R.Cb=1a(4J,f){K e1=g.3m.eB("e1");e1.2G.i7="2R:7X;2f:-l4;1M:-l4";e1.k8=1a(){f.2J(J);J.k8=1d;g.3m.3H.8e(J)};e1.1d0=1a(){g.3m.3H.8e(J)};g.3m.3H.4p(e1);e1.4J=4J};1a o8(){1b J.7b}R.dI=d6(1a(bn){if(!bn||!!((bn=4B(bn)).5f("-")+1)){1b{r:-1,g:-1,b:-1,7b:"3r",5q:1,3X:o8}}if(bn=="3r"){1b{r:-1,g:-1,b:-1,7b:"3r",3X:o8}}!(Lt[3S](bn.3W().hg(0,2))||bn.cB()=="#")&&(bn=oj(bn));K 1F,aP,bK,bR,2X,t,2Z,4m=bn.3y(Kl);if(4m){if(4m[2]){bR=bw(4m[2].hg(5),16);bK=bw(4m[2].hg(3,5),16);aP=bw(4m[2].hg(1,3),16)}if(4m[3]){bR=bw((t=4m[3].cB(3))+t,16);bK=bw((t=4m[3].cB(2))+t,16);aP=bw((t=4m[3].cB(1))+t,16)}if(4m[4]){2Z=4m[4][3R](zh);aP=4j(2Z[0]);2Z[0].4d(-1)=="%"&&(aP*=2.55);bK=4j(2Z[1]);2Z[1].4d(-1)=="%"&&(bK*=2.55);bR=4j(2Z[2]);2Z[2].4d(-1)=="%"&&(bR*=2.55);4m[1].3W().4d(0,4)=="B7"&&(2X=4j(2Z[3]));2Z[3]&&(2Z[3].4d(-1)=="%"&&(2X/=100))}if(4m[5]){2Z=4m[5][3R](zh);aP=4j(2Z[0]);2Z[0].4d(-1)=="%"&&(aP*=2.55);bK=4j(2Z[1]);2Z[1].4d(-1)=="%"&&(bK*=2.55);bR=4j(2Z[2]);2Z[2].4d(-1)=="%"&&(bR*=2.55);(2Z[0].4d(-3)=="4X"||2Z[0].4d(-1)=="\\LG")&&(aP/=9G);4m[1].3W().4d(0,4)=="Lw"&&(2X=4j(2Z[3]));2Z[3]&&(2Z[3].4d(-1)=="%"&&(2X/=100));1b R.oK(aP,bK,bR,2X)}if(4m[6]){2Z=4m[6][3R](zh);aP=4j(2Z[0]);2Z[0].4d(-1)=="%"&&(aP*=2.55);bK=4j(2Z[1]);2Z[1].4d(-1)=="%"&&(bK*=2.55);bR=4j(2Z[2]);2Z[2].4d(-1)=="%"&&(bR*=2.55);(2Z[0].4d(-3)=="4X"||2Z[0].4d(-1)=="\\LG")&&(aP/=9G);4m[1].3W().4d(0,4)=="LR"&&(2X=4j(2Z[3]));2Z[3]&&(2Z[3].4d(-1)=="%"&&(2X/=100));1b R.yX(aP,bK,bR,2X)}4m={r:aP,g:bK,b:bR,3X:o8};4m.7b="#"+(LT|bR|bK<<8|aP<<16).3X(16).4d(1);R.is(2X,"s8")&&(4m.2X=2X);1b 4m}1b{r:-1,g:-1,b:-1,7b:"3r",5q:1,3X:o8}},R);R.LP=d6(1a(h,s,b){1b R.oK(h,s,b).7b});R.LU=d6(1a(h,s,l){1b R.yX(h,s,l).7b});R.4m=d6(1a(r,g,b){1b"#"+(LT|b|g<<8|r<<16).3X(16).4d(1)});R.oY=1a(1o){K 3a=J.oY.3a=J.oY.3a||{h:0,s:1,b:1o||0.75},4m=J.oK(3a.h,3a.s,3a.b);3a.h+=0.MO;if(3a.h>1){3a.h=0;3a.s-=0.2;3a.s<=0&&(J.oY.3a={h:0,s:1,b:3a.b})}1b 4m.7b};R.oY.yv=1a(){4r J.3a};1a Gw(8B,z){K d=[];1p(K i=0,jq=8B.1f;jq-2*!z>i;i+=2){K p=[{x:+8B[i-2],y:+8B[i-1]},{x:+8B[i],y:+8B[i+1]},{x:+8B[i+2],y:+8B[i+3]},{x:+8B[i+4],y:+8B[i+5]}];if(z){if(!i){p[0]={x:+8B[jq-2],y:+8B[jq-1]}}1j{if(jq-4==i){p[3]={x:+8B[0],y:+8B[1]}}1j{if(jq-2==i){p[2]={x:+8B[0],y:+8B[1]};p[3]={x:+8B[2],y:+8B[3]}}}}}1j{if(jq-4==i){p[3]=p[2]}1j{if(!i){p[0]={x:+8B[i],y:+8B[i+1]}}}}d.1G(["C",(-p[0].x+6*p[1].x+p[2].x)/ 6, (-p[0].y + 6 * p[1].y + p[2].y) /6,(p[1].x+6*p[2].x-p[3].x)/ 6, (p[1].y + 6 * p[2].y - p[3].y) /6,p[2].x,p[2].y])}1b d}R.ID=1a(9L){if(!9L){1b 1d}K 8t=iH(9L);if(8t.gv){1b dk(8t.gv)}K nY={a:7,c:6,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,z:0},1h=[];if(R.is(9L,4u)&&R.is(9L[0],4u)){1h=dk(9L)}if(!1h.1f){4B(9L).3u(LS,1a(a,b,c){K 1D=[],1x=b.3W();c.3u(Ih,1a(a,b){b&&1D.1G(+b)});if(1x=="m"&&1D.1f>2){1h.1G([b][4b](1D.5X(0,2)));1x="l";b=b=="m"?"l":"L"}if(1x=="r"){1h.1G([b][4b](1D))}1j{4x(1D.1f>=nY[1x]){1h.1G([b][4b](1D.5X(0,nY[1x])));if(!nY[1x]){1s}}}})}1h.3X=R.kV;8t.gv=dk(1h);1b 1h};R.tP=d6(1a(kS){if(!kS){1b 1d}K nY={r:3,s:4,t:2,m:6},1h=[];if(R.is(kS,4u)&&R.is(kS[0],4u)){1h=dk(kS)}if(!1h.1f){4B(kS).3u(LO,1a(a,b,c){K 1D=[],1x=rI.2J(b);c.3u(Ih,1a(a,b){b&&1D.1G(+b)});1h.1G([b][4b](1D))})}1h.3X=R.kV;1b 1h});K iH=1a(ps){K p=iH.ps=iH.ps||{};if(p[ps]){p[ps].yO=100}1j{p[ps]={yO:100}}6P(1a(){1p(K 1r in p){if(p[3S](1r)&&1r!=ps){p[1r].yO--;!p[1r].yO&&4r p[1r]}}});1b p[ps]};R.rm=1a(6D,72,74,71,7V,7U,8j,8p,t){K t1=1-t,Ig=6X(t1,3),HJ=6X(t1,2),t2=t*t,t3=t2*t,x=Ig*6D+HJ*3*t*74+t1*3*t*t*7V+t3*8j,y=Ig*72+HJ*3*t*71+t1*3*t*t*7U+t3*8p,mx=6D+2*t*(74-6D)+t2*(7V-2*74+6D),my=72+2*t*(71-72)+t2*(7U-2*71+72),nx=74+2*t*(7V-74)+t2*(8j-2*7V+74),ny=71+2*t*(7U-71)+t2*(8p-2*7U+71),ax=t1*6D+t*74,ay=t1*72+t*71,cx=t1*7V+t*8j,cy=t1*7U+t*8p,eN=90-4g.HD(mx-nx,my-ny)*180/PI;(mx>nx||my<ny)&&(eN+=180);1b{x:x,y:y,m:{x:mx,y:my},n:{x:nx,y:ny},3a:{x:ax,y:ay},5e:{x:cx,y:cy},eN:eN}};R.IP=1a(6D,72,74,71,7V,7U,8j,8p){if(!R.is(6D,"4u")){6D=[6D,72,74,71,7V,7U,8j,8p]}K 3p=GJ.3v(1d,6D);1b{x:3p.6d.x,y:3p.6d.y,x2:3p.4n.x,y2:3p.4n.y,1m:3p.4n.x-3p.6d.x,1w:3p.4n.y-3p.6d.y}};R.IL=1a(3p,x,y){1b x>=3p.x&&(x<=3p.x2&&(y>=3p.y&&y<=3p.y2))};R.Gm=1a(7E,7G){K i=R.IL;1b i(7G,7E.x,7E.y)||(i(7G,7E.x2,7E.y)||(i(7G,7E.x,7E.y2)||(i(7G,7E.x2,7E.y2)||(i(7E,7G.x,7G.y)||(i(7E,7G.x2,7G.y)||(i(7E,7G.x,7G.y2)||(i(7E,7G.x2,7G.y2)||(7E.x<7G.x2&&7E.x>7G.x||7G.x<7E.x2&&7G.x>7E.x)&&(7E.y<7G.y2&&7E.y>7G.y||7G.y<7E.y2&&7G.y>7E.y))))))))};1a IX(t,p1,p2,p3,p4){K t1=-3*p1+9*p2-9*p3+3*p4,t2=t*t1+6*p1-12*p2+6*p3;1b t*t2-3*p1+3*p2}1a k1(x1,y1,x2,y2,x3,y3,x4,y4,z){if(z==1d){z=1}z=z>1?1:z<0?0:z;K z2=z/2,n=12,MY=[-0.LK,0.LK,-0.LH,0.LH,-0.LM,0.LM,-0.LL,0.LL,-0.Mt,0.Mt,-0.N5,0.N5],MX=[0.N4,0.N4,0.N3,0.N3,0.N8,0.N8,0.N7,0.N7,0.N6,0.N6,0.N2,0.N2],IQ=0;1p(K i=0;i<n;i++){K ct=z2*MY[i]+z2,IO=IX(ct,x1,x2,x3,x4),IN=IX(ct,y1,y2,y3,y4),MW=IO*IO+IN*IN;IQ+=MX[i]*4g.bt(MW)}1b z2*IQ}1a MM(x1,y1,x2,y2,x3,y3,x4,y4,ll){if(ll<0||k1(x1,y1,x2,y2,x3,y3,x4,y4)<ll){1b}K t=1,qL=t/2,t2=t-qL,l,e=0.JR;l=k1(x1,y1,x2,y2,x3,y3,x4,y4,t2);4x(4G(l-ll)>e){qL/=2;t2+=(l<ll?1:-1)*qL;l=k1(x1,y1,x2,y2,x3,y3,x4,y4,t2)}1b t2}1a Hg(x1,y1,x2,y2,x3,y3,x4,y4){if(5E(x1,x2)<6T(x3,x4)||(6T(x1,x2)>5E(x3,x4)||(5E(y1,y2)<6T(y3,y4)||6T(y1,y2)>5E(y3,y4)))){1b}K nx=(x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4),ny=(x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4),zo=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);if(!zo){1b}K px=nx/ zo, py = ny /zo,om=+px.5a(2),o9=+py.5a(2);if(om<+6T(x1,x2).5a(2)||(om>+5E(x1,x2).5a(2)||(om<+6T(x3,x4).5a(2)||(om>+5E(x3,x4).5a(2)||(o9<+6T(y1,y2).5a(2)||(o9>+5E(y1,y2).5a(2)||(o9<+6T(y3,y4).5a(2)||o9>+5E(y3,y4).5a(2)))))))){1b}1b{x:px,y:py}}1a 1bF(9P,9V){1b uC(9P,9V)}1a 1bP(9P,9V){1b uC(9P,9V,1)}1a uC(9P,9V,i5){K 7E=R.IP(9P),7G=R.IP(9V);if(!R.Gm(7E,7G)){1b i5?0:[]}K l1=k1.3v(0,9P),l2=k1.3v(0,9V),n1=5E(~~(l1/ 5), 1), n2 = 5E(~~(l2 /5),1),zj=[],ti=[],xy={},1F=i5?0:[];1p(K i=0;i<n1+1;i++){K p=R.rm.3v(R,9P.4b(i/n1));zj.1G({x:p.x,y:p.y,t:i/n1})}1p(i=0;i<n2+1;i++){p=R.rm.3v(R,9V.4b(i/n2));ti.1G({x:p.x,y:p.y,t:i/n2})}1p(i=0;i<n1;i++){1p(K j=0;j<n2;j++){K di=zj[i],lY=zj[i+1],dj=ti[j],lS=ti[j+1],ci=4G(lY.x-di.x)<0.tg?"y":"x",cj=4G(lS.x-dj.x)<0.tg?"y":"x",is=Hg(di.x,di.y,lY.x,lY.y,dj.x,dj.y,lS.x,lS.y);if(is){if(xy[is.x.5a(4)]==is.y.5a(4)){aN}xy[is.x.5a(4)]=is.y.5a(4);K t1=di.t+4G((is[ci]-di[ci])/ (lY[ci] - di[ci])) * (lY.t - di.t), t2 = dj.t + 4G((is[cj] - dj[cj]) /(lS[cj]-dj[cj]))*(lS.t-dj.t);if(t1>=0&&(t1<=1.tg&&(t2>=0&&t2<=1.tg))){if(i5){1F++}1j{1F.1G({x:is.x,y:is.y,t1:6T(t1,1),t2:6T(t2,1)})}}}}}1b 1F}R.1cI=1a(bA,9n){1b uX(bA,9n)};R.1cr=1a(bA,9n){1b uX(bA,9n,1)};1a uX(bA,9n,i5){bA=R.v7(bA);9n=R.v7(9n);K x1,y1,x2,y2,oP,oz,os,oC,9P,9V,1F=i5?0:[];1p(K i=0,ii=bA.1f;i<ii;i++){K pi=bA[i];if(pi[0]=="M"){x1=oP=pi[1];y1=oz=pi[2]}1j{if(pi[0]=="C"){9P=[x1,y1].4b(pi.4d(1));x1=9P[6];y1=9P[7]}1j{9P=[x1,y1,x1,y1,oP,oz,oP,oz];x1=oP;y1=oz}1p(K j=0,jj=9n.1f;j<jj;j++){K pj=9n[j];if(pj[0]=="M"){x2=os=pj[1];y2=oC=pj[2]}1j{if(pj[0]=="C"){9V=[x2,y2].4b(pj.4d(1));x2=9V[6];y2=9V[7]}1j{9V=[x2,y2,x2,y2,os,oC,os,oC];x2=os;y2=oC}K hD=uC(9P,9V,i5);if(i5){1F+=hD}1j{1p(K k=0,kk=hD.1f;k<kk;k++){hD[k].1c4=i;hD[k].1cn=j;hD[k].9P=9P;hD[k].9V=9V}1F=1F.4b(hD)}}}}}1b 1F}R.MJ=1a(1K,x,y){K 3p=R.N1(1K);1b R.IL(3p,x,y)&&uX(1K,[["M",x,y],["H",3p.x2+10]],1)%2==1};R.pJ=1a(gP){1b 1a(){3l("4E.lI",1d,"mG\\mL: Ix Cl 1cf to 4h \\1ck"+gP+"\\1cj of 5R 1A",gP)}};K tD=R.N1=1a(1K){K 8t=iH(1K);if(8t.3p){1b 6w(8t.3p)}if(!1K){1b{x:0,y:0,1m:0,1w:0,x2:0,y2:0}}1K=iT(1K);K x=0,y=0,X=[],Y=[],p;1p(K i=0,ii=1K.1f;i<ii;i++){p=1K[i];if(p[0]=="M"){x=p[1];y=p[2];X.1G(x);Y.1G(y)}1j{K ox=GJ(x,y,p[1],p[2],p[3],p[4],p[5],p[6]);X=X[4b](ox.6d.x,ox.4n.x);Y=Y[4b](ox.6d.y,ox.4n.y);x=p[5];y=p[6]}}K u7=6T[3v](0,X),u6=6T[3v](0,Y),IH=5E[3v](0,X),II=5E[3v](0,Y),1m=IH-u7,1w=II-u6,bb={x:u7,y:u6,x2:IH,y2:II,1m:1m,1w:1w,cx:u7+1m/ 2, cy:u6 + 1w /2};8t.3p=6w(bb);1b bb},dk=1a(6b){K 1F=6w(6b);1F.3X=R.kV;1b 1F},Gh=R.1ca=1a(6b){K 8t=iH(6b);if(8t.IC){1b dk(8t.IC)}if(!R.is(6b,4u)||!R.is(6b&&6b[0],4u)){6b=R.ID(6b)}K 1F=[],x=0,y=0,mx=0,my=0,3a=0;if(6b[0][0]=="M"){x=6b[0][1];y=6b[0][2];mx=x;my=y;3a++;1F.1G(["M",x,y])}1p(K i=3a,ii=6b.1f;i<ii;i++){K r=1F[i]=[],pa=6b[i];if(pa[0]!=rI.2J(pa[0])){r[0]=rI.2J(pa[0]);3P(r[0]){1q"a":r[1]=pa[1];r[2]=pa[2];r[3]=pa[3];r[4]=pa[4];r[5]=pa[5];r[6]=+(pa[6]-x).5a(3);r[7]=+(pa[7]-y).5a(3);1s;1q"v":r[1]=+(pa[1]-y).5a(3);1s;1q"m":mx=pa[1];my=pa[2];5P:1p(K j=1,jj=pa.1f;j<jj;j++){r[j]=+(pa[j]-(j%2?x:y)).5a(3)}}}1j{r=1F[i]=[];if(pa[0]=="m"){mx=pa[1]+x;my=pa[2]+y}1p(K k=0,kk=pa.1f;k<kk;k++){1F[i][k]=pa[k]}}K 6A=1F[i].1f;3P(1F[i][0]){1q"z":x=mx;y=my;1s;1q"h":x+=+1F[i][6A-1];1s;1q"v":y+=+1F[i][6A-1];1s;5P:x+=+1F[i][6A-2];y+=+1F[i][6A-1]}}1F.3X=R.kV;8t.IC=dk(1F);1b 1F},GM=R.q4=1a(6b){K 8t=iH(6b);if(8t.4G){1b dk(8t.4G)}if(!R.is(6b,4u)||!R.is(6b&&6b[0],4u)){6b=R.ID(6b)}if(!6b||!6b.1f){1b[["M",0,0]]}K 1F=[],x=0,y=0,mx=0,my=0,3a=0;if(6b[0][0]=="M"){x=+6b[0][1];y=+6b[0][2];mx=x;my=y;3a++;1F[0]=["M",x,y]}K GB=6b.1f==3&&(6b[0][0]=="M"&&(6b[1][0].9p()=="R"&&6b[2][0].9p()=="Z"));1p(K r,pa,i=3a,ii=6b.1f;i<ii;i++){1F.1G(r=[]);pa=6b[i];if(pa[0]!=Gy.2J(pa[0])){r[0]=Gy.2J(pa[0]);3P(r[0]){1q"A":r[1]=pa[1];r[2]=pa[2];r[3]=pa[3];r[4]=pa[4];r[5]=pa[5];r[6]=+(pa[6]+x);r[7]=+(pa[7]+y);1s;1q"V":r[1]=+pa[1]+y;1s;1q"H":r[1]=+pa[1]+x;1s;1q"R":K 5S=[x,y][4b](pa.4d(1));1p(K j=2,jj=5S.1f;j<jj;j++){5S[j]=+5S[j]+x;5S[++j]=+5S[j]+y}1F.eJ();1F=1F[4b](Gw(5S,GB));1s;1q"M":mx=+pa[1]+x;my=+pa[2]+y;5P:1p(j=1,jj=pa.1f;j<jj;j++){r[j]=+pa[j]+(j%2?x:y)}}}1j{if(pa[0]=="R"){5S=[x,y][4b](pa.4d(1));1F.eJ();1F=1F[4b](Gw(5S,GB));r=["R"][4b](pa.4d(-2))}1j{1p(K k=0,kk=pa.1f;k<kk;k++){r[k]=pa[k]}}}3P(r[0]){1q"Z":x=mx;y=my;1s;1q"H":x=r[1];1s;1q"V":y=r[1];1s;1q"M":mx=r[r.1f-2];my=r[r.1f-1];5P:x=r[r.1f-2];y=r[r.1f-1]}}1F.3X=R.kV;8t.4G=dk(1F);1b 1F},sC=1a(x1,y1,x2,y2){1b[x1,y1,x2,y2,x2,y2]},GF=1a(x1,y1,ax,ay,x2,y2){K rC=1/ 3, rV = 2 /3;1b[rC*x1+rV*ax,rC*y1+rV*ay,rC*x2+rV*ax,rC*y2+rV*ay,x2,y2]},GD=1a(x1,y1,rx,ry,8m,Ni,lj,x2,y2,j2){K Gs=PI*120/ 180, ab = PI /180*(+8m||0),1F=[],xy,6o=d6(1a(x,y,ab){K X=x*4g.aa(ab)-y*4g.9E(ab),Y=x*4g.9E(ab)+y*4g.aa(ab);1b{x:X,y:Y}});if(!j2){xy=6o(x1,y1,-ab);x1=xy.x;y1=xy.y;xy=6o(x2,y2,-ab);x2=xy.x;y2=xy.y;K aa=4g.aa(PI/ 180 * 8m), 9E = 4g.9E(PI /180*8m),x=(x1-x2)/ 2, y = (y1 - y2) /2;K h=x*x/ (rx * rx) + y * y /(ry*ry);if(h>1){h=4g.bt(h);rx=h*rx;ry=h*ry}K u8=rx*rx,u5=ry*ry,k=(Ni==lj?-1:1)*4g.bt(4G((u8*u5-u8*y*y-u5*x*x)/ (u8 * y * y + u5 * x * x))), cx = k * rx * y /ry+(x1+x2)/ 2, cy = k * -ry * x /rx+(y1+y2)/ 2, f1 = 4g.u0(((y1 - cy) /ry).5a(9)),f2=4g.u0(((y2-cy)/ry).5a(9));f1=x1<cx?PI-f1:f1;f2=x2<cx?PI-f2:f2;f1<0&&(f1=PI*2+f1);f2<0&&(f2=PI*2+f2);if(lj&&f1>f2){f1=f1-PI*2}if(!lj&&f2>f1){f2=f2-PI*2}}1j{f1=j2[0];f2=j2[1];cx=j2[2];cy=j2[3]}K df=f2-f1;if(4G(df)>Gs){K Nl=f2,Nh=x2,Nm=y2;f2=f1+Gs*(lj&&f2>f1?1:-1);x2=cx+rx*4g.aa(f2);y2=cy+ry*4g.9E(f2);1F=GD(x2,y2,rx,ry,8m,0,lj,Nh,Nm,[f2,Nl,cx,cy])}df=f2-f1;K c1=4g.aa(f1),s1=4g.9E(f1),c2=4g.aa(f2),s2=4g.9E(f2),t=4g.Nk(df/ 4), hx = 4 /3*rx*t,hy=4/3*ry*t,m1=[x1,y1],m2=[x1+hx*s1,y1-hy*c1],m3=[x2+hx*s2,y2-hy*c2],m4=[x2,y2];m2[0]=2*m1[0]-m2[0];m2[1]=2*m1[1]-m2[1];if(j2){1b[m2,m3,m4][4b](1F)}1j{1F=[m2,m3,m4][4b](1F).5x()[3R](",");K Gt=[];1p(K i=0,ii=1F.1f;i<ii;i++){Gt[i]=i%2?6o(1F[i-1],1F[i],ab).y:6o(1F[i],1F[i+1],ab).x}1b Gt}},r6=1a(6D,72,74,71,7V,7U,8j,8p,t){K t1=1-t;1b{x:6X(t1,3)*6D+6X(t1,2)*3*t*74+t1*3*t*t*7V+6X(t,3)*8j,y:6X(t1,3)*72+6X(t1,2)*3*t*71+t1*3*t*t*7U+6X(t,3)*8p}},GJ=d6(1a(6D,72,74,71,7V,7U,8j,8p){K a=7V-2*74+6D-(8j-2*7V+74),b=2*(74-6D)-2*(7V-74),c=6D-74,t1=(-b+4g.bt(b*b-4*a*c))/ 2 /a,t2=(-b-4g.bt(b*b-4*a*c))/ 2 /a,y=[72,8p],x=[6D,8j],7O;4G(t1)>"u3"&&(t1=0.5);4G(t2)>"u3"&&(t2=0.5);if(t1>0&&t1<1){7O=r6(6D,72,74,71,7V,7U,8j,8p,t1);x.1G(7O.x);y.1G(7O.y)}if(t2>0&&t2<1){7O=r6(6D,72,74,71,7V,7U,8j,8p,t2);x.1G(7O.x);y.1G(7O.y)}a=7U-2*71+72-(8p-2*7U+71);b=2*(71-72)-2*(7U-71);c=72-71;t1=(-b+4g.bt(b*b-4*a*c))/ 2 /a;t2=(-b-4g.bt(b*b-4*a*c))/ 2 /a;4G(t1)>"u3"&&(t1=0.5);4G(t2)>"u3"&&(t2=0.5);if(t1>0&&t1<1){7O=r6(6D,72,74,71,7V,7U,8j,8p,t1);x.1G(7O.x);y.1G(7O.y)}if(t2>0&&t2<1){7O=r6(6D,72,74,71,7V,7U,8j,8p,t2);x.1G(7O.x);y.1G(7O.y)}1b{6d:{x:6T[3v](0,x),y:6T[3v](0,y)},4n:{x:5E[3v](0,x),y:5E[3v](0,y)}}}),iT=R.v7=d6(1a(1K,9n){K 8t=!9n&&iH(1K);if(!9n&&8t.hN){1b dk(8t.hN)}K p=GM(1K),p2=9n&&GM(9n),2t={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:1d,qy:1d},eU={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:1d,qy:1d},G8=1a(1K,d,rs){K nx,ny,tq={T:1,Q:1};if(!1K){1b["C",d.x,d.y,d.x,d.y,d.x,d.y]}!(1K[0]in tq)&&(d.qx=d.qy=1d);3P(1K[0]){1q"M":d.X=1K[1];d.Y=1K[2];1s;1q"A":1K=["C"][4b](GD[3v](0,[d.x,d.y][4b](1K.4d(1))));1s;1q"S":if(rs=="C"||rs=="S"){nx=d.x*2-d.bx;ny=d.y*2-d.by}1j{nx=d.x;ny=d.y}1K=["C",nx,ny][4b](1K.4d(1));1s;1q"T":if(rs=="Q"||rs=="T"){d.qx=d.x*2-d.qx;d.qy=d.y*2-d.qy}1j{d.qx=d.x;d.qy=d.y}1K=["C"][4b](GF(d.x,d.y,d.qx,d.qy,1K[1],1K[2]));1s;1q"Q":d.qx=1K[1];d.qy=1K[2];1K=["C"][4b](GF(d.x,d.y,1K[1],1K[2],1K[3],1K[4]));1s;1q"L":1K=["C"][4b](sC(d.x,d.y,1K[1],1K[2]));1s;1q"H":1K=["C"][4b](sC(d.x,d.y,1K[1],d.y));1s;1q"V":1K=["C"][4b](sC(d.x,d.y,d.x,1K[1]));1s;1q"Z":1K=["C"][4b](sC(d.x,d.y,d.X,d.Y));1s}1b 1K},Gb=1a(pp,i){if(pp[i].1f>7){pp[i].dP();K pi=pp[i];4x(pi.1f){pp.5X(i++,0,["C"][4b](pi.5X(0,6)))}pp.5X(i,1);ii=5E(p.1f,p2&&p2.1f||0)}},Ga=1a(bA,9n,a1,a2,i){if(bA&&(9n&&(bA[i][0]=="M"&&9n[i][0]!="M"))){9n.5X(i,0,["M",a2.x,a2.y]);a1.bx=0;a1.by=0;a1.x=bA[i][1];a1.y=bA[i][2];ii=5E(p.1f,p2&&p2.1f||0)}};1p(K i=0,ii=5E(p.1f,p2&&p2.1f||0);i<ii;i++){p[i]=G8(p[i],2t);Gb(p,i);p2&&(p2[i]=G8(p2[i],eU));p2&&Gb(p2,i);Ga(p,p2,2t,eU,i);Ga(p2,p,eU,2t,i);K lO=p[i],kU=p2&&p2[i],sN=lO.1f,s9=p2&&kU.1f;2t.x=lO[sN-2];2t.y=lO[sN-1];2t.bx=4j(lO[sN-4])||2t.x;2t.by=4j(lO[sN-3])||2t.y;eU.bx=p2&&(4j(kU[s9-4])||eU.x);eU.by=p2&&(4j(kU[s9-3])||eU.y);eU.x=p2&&kU[s9-2];eU.y=p2&&kU[s9-1]}if(!p2){8t.hN=dk(p)}1b p2?[p,p2]:p},1d,dk),1d3=R.BM=d6(1a(4v){K 5S=[];1p(K i=0,ii=4v.1f;i<ii;i++){K 7O={},a0=4v[i].3y(/^([^:]*):?([\\d\\.]*)/);7O.3Y=R.dI(a0[1]);if(7O.3Y.5q){1b 1d}7O.3Y=7O.3Y.7b;a0[2]&&(7O.2v=a0[2]+"%");5S.1G(7O)}1p(i=1,ii=5S.1f-1;i<ii;i++){if(!5S[i].2v){K 3a=4j(5S[i-1].2v||0),5e=0;1p(K j=i+1;j<ii;j++){if(5S[j].2v){5e=5S[j].2v;1s}}if(!5e){5e=100;j=ii}5e=4j(5e);K d=(5e-3a)/(j-i+1);1p(;i<j;i++){3a+=d;5S[i].2v=3a+"%"}}}1b 5S}),si=R.C3=1a(el,2N){el==2N.1M&&(2N.1M=el.49);el==2N.4P&&(2N.4P=el.3C);el.3C&&(el.3C.49=el.49);el.49&&(el.49.3C=el.3C)},1dc=R.BW=1a(el,2N){if(2N.1M===el){1b}si(el,2N);el.3C=1d;el.49=2N.1M;2N.1M.3C=el;2N.1M=el},1di=R.BS=1a(el,2N){if(2N.4P===el){1b}si(el,2N);el.3C=2N.4P;el.49=1d;2N.4P.49=el;2N.4P=el},1d5=R.BR=1a(el,bh,2N){si(el,2N);bh==2N.1M&&(2N.1M=el);bh.3C&&(bh.3C.49=el);el.3C=bh.3C;el.49=bh;bh.3C=el},1db=R.BQ=1a(el,bh,2N){si(el,2N);bh==2N.4P&&(2N.4P=el);bh.49&&(bh.49.3C=el);el.49=bh.49;bh.49=el;el.3C=bh},Gi=R.Gi=1a(1K,4i){K bb=tD(1K),el={2j:{4i:E},7p:1a(){1b bb}};AS(el,4i);1b el.5d},yx=R.yx=1a(1K,4i){1b pd(1K,Gi(1K,4i))},AS=R.BE=1a(el,bP){if(bP==1d){1b el.2j.4i}bP=4B(bP).3u(/\\.{3}|\\BF/g,el.2j.4i||E);K pN=R.tP(bP),4X=0,dx=0,dy=0,sx=1,sy=1,2j=el.2j,m=1T gz;2j.4i=pN||[];if(pN){1p(K i=0,ii=pN.1f;i<ii;i++){K t=pN[i],f8=t.1f,91=4B(t[0]).3W(),7X=t[0]!=91,fL=7X?m.s0():0,x1,y1,x2,y2,bb;if(91=="t"&&f8==3){if(7X){x1=fL.x(0,0);y1=fL.y(0,0);x2=fL.x(t[1],t[2]);y2=fL.y(t[1],t[2]);m.hE(x2-x1,y2-y1)}1j{m.hE(t[1],t[2])}}1j{if(91=="r"){if(f8==2){bb=bb||el.7p(1);m.6o(t[1],bb.x+bb.1m/ 2, bb.y + bb.1w /2);4X+=t[1]}1j{if(f8==4){if(7X){x2=fL.x(t[2],t[3]);y2=fL.y(t[2],t[3]);m.6o(t[1],x2,y2)}1j{m.6o(t[1],t[2],t[3])}4X+=t[1]}}}1j{if(91=="s"){if(f8==2||f8==3){bb=bb||el.7p(1);m.7Z(t[1],t[f8-1],bb.x+bb.1m/ 2, bb.y + bb.1w /2);sx*=t[1];sy*=t[f8-1]}1j{if(f8==5){if(7X){x2=fL.x(t[3],t[4]);y2=fL.y(t[3],t[4]);m.7Z(t[1],t[2],x2,y2)}1j{m.7Z(t[1],t[2],t[3],t[4])}sx*=t[1];sy*=t[2]}}}1j{if(91=="m"&&f8==7){m.5L(t[1],t[2],t[3],t[4],t[5],t[6])}}}}2j.hF=1;el.5d=m}}el.5d=m;2j.sx=sx;2j.sy=sy;2j.4X=4X;2j.dx=dx=m.e;2j.dy=dy=m.f;if(sx==1&&(sy==1&&(!4X&&2j.3p))){2j.3p.x+=+dx;2j.3p.y+=+dy}1j{2j.hF=1}},Gd=1a(1i){K l=1i[0];3P(l.3W()){1q"t":1b[l,0,0];1q"m":1b[l,1,0,0,1,0,0];1q"r":if(1i.1f==4){1b[l,0,1i[2],1i[3]]}1j{1b[l,0]};1q"s":if(1i.1f==5){1b[l,1,1,1i[3],1i[4]]}1j{if(1i.1f==3){1b[l,1,1]}1j{1b[l,1]}}}},Nc=R.1dP=1a(t1,t2){t2=4B(t2).3u(/\\.{3}|\\BF/g,t1);t1=R.tP(t1)||[];t2=R.tP(t2)||[];K Nf=5E(t1.1f,t2.1f),2L=[],to=[],i=0,j,jj,cD,fJ;1p(;i<Nf;i++){cD=t1[i]||Gd(t2[i]);fJ=t2[i]||Gd(cD);if(cD[0]!=fJ[0]||(cD[0].3W()=="r"&&(cD[2]!=fJ[2]||cD[3]!=fJ[3])||cD[0].3W()=="s"&&(cD[3]!=fJ[3]||cD[4]!=fJ[4]))){1b}2L[i]=[];to[i]=[];1p(j=0,jj=5E(cD.1f,fJ.1f);j<jj;j++){j in cD&&(2L[i][j]=cD[j]);j in fJ&&(to[i][j]=fJ[j])}}1b{2L:2L,to:to}};R.zY=1a(x,y,w,h){K 3E;3E=h==1d&&!R.is(x,"1A")?g.3m.ht(x):x;if(3E==1d){1b}if(3E.6J){if(y==1d){1b{3E:3E,1m:3E.2G.1dW||3E.ik,1w:3E.2G.1e3||3E.9m}}1j{1b{3E:3E,1m:y,1w:w}}}1b{3E:1,x:x,y:y,1m:w,1w:h}};R.Gh=Gh;R.5p={};R.iT=iT;R.5d=1a(a,b,c,d,e,f){1b 1T gz(a,b,c,d,e,f)};1a gz(a,b,c,d,e,f){if(a!=1d){J.a=+a;J.b=+b;J.c=+c;J.d=+d;J.e=+e;J.f=+f}1j{J.a=1;J.b=0;J.c=0;J.d=1;J.e=0;J.f=0}}(1a(aG){aG.5L=1a(a,b,c,d,e,f){K 2E=[[],[],[]],m=[[J.a,J.c,J.e],[J.b,J.d,J.f],[0,0,1]],5d=[[a,c,e],[b,d,f],[0,0,1]],x,y,z,1F;if(a&&a g6 gz){5d=[[a.a,a.c,a.e],[a.b,a.d,a.f],[0,0,1]]}1p(x=0;x<3;x++){1p(y=0;y<3;y++){1F=0;1p(z=0;z<3;z++){1F+=m[x][z]*5d[z][y]}2E[x][y]=1F}}J.a=2E[0][0];J.b=2E[1][0];J.c=2E[0][1];J.d=2E[1][1];J.e=2E[0][2];J.f=2E[1][2]};aG.s0=1a(){K me=J,x=me.a*me.d-me.b*me.c;1b 1T gz(me.d/ x, -me.b /x,-me.c/ x, me.a /x,(me.c*me.f-me.d*me.e)/ x, (me.b * me.e - me.a * me.f) /x)};aG.6w=1a(){1b 1T gz(J.a,J.b,J.c,J.d,J.e,J.f)};aG.hE=1a(x,y){J.5L(1,0,0,1,x,y)};aG.7Z=1a(x,y,cx,cy){y==1d&&(y=x);(cx||cy)&&J.5L(1,0,0,1,cx,cy);J.5L(x,0,0,y,0,0);(cx||cy)&&J.5L(1,0,0,1,-cx,-cy)};aG.6o=1a(a,x,y){a=R.ab(a);x=x||0;y=y||0;K aa=+4g.aa(a).5a(9),9E=+4g.9E(a).5a(9);J.5L(aa,9E,-9E,aa,x,y);J.5L(1,0,0,1,-x,-y)};aG.x=1a(x,y){1b x*J.a+y*J.c+J.e};aG.y=1a(x,y){1b x*J.b+y*J.d+J.f};aG.4z=1a(i){1b+J[4B.Gf(97+i)].5a(4)};aG.3X=1a(){1b R.3b?"5d("+[J.4z(0),J.4z(1),J.4z(2),J.4z(3),J.4z(4),J.4z(5)].5x()+")":[J.4z(0),J.4z(2),J.4z(1),J.4z(3),0,0].5x()};aG.Od=1a(){1b"AZ:Pb.B9.gz(1bO="+J.4z(0)+", Df="+J.4z(2)+", 1bD="+J.4z(1)+", 1bI="+J.4z(3)+", Dx="+J.4z(4)+", Dy="+J.4z(5)+", 1c1=\'6a At\')"};aG.2v=1a(){1b[J.e.5a(4),J.f.5a(4)]};1a tL(a){1b a[0]*a[0]+a[1]*a[1]}1a Hm(a){K Hl=4g.bt(tL(a));a[0]&&(a[0]/=Hl);a[1]&&(a[1]/=Hl)}aG.3R=1a(){K 2E={};2E.dx=J.e;2E.dy=J.f;K 1H=[[J.a,J.c],[J.b,J.d]];2E.hw=4g.bt(tL(1H[0]));Hm(1H[0]);2E.jJ=1H[0][0]*1H[1][0]+1H[0][1]*1H[1][1];1H[1]=[1H[1][0]-1H[0][0]*2E.jJ,1H[1][1]-1H[0][1]*2E.jJ];2E.gl=4g.bt(tL(1H[1]));Hm(1H[1]);2E.jJ/=2E.gl;K 9E=-1H[0][1],aa=1H[1][1];if(aa<0){2E.6o=R.4X(4g.MV(aa));if(9E<0){2E.6o=9G-2E.6o}}1j{2E.6o=R.4X(4g.u0(9E))}2E.BH=!+2E.jJ.5a(9)&&(2E.hw.5a(9)==2E.gl.5a(9)||!2E.6o);2E.1bR=!+2E.jJ.5a(9)&&(2E.hw.5a(9)==2E.gl.5a(9)&&!2E.6o);2E.Oc=!+2E.jJ.5a(9)&&!2E.6o;1b 2E};aG.1bk=1a(MD){K s=MD||J[3R]();if(s.BH){s.hw=+s.hw.5a(4);s.gl=+s.gl.5a(4);s.6o=+s.6o.5a(4);1b(s.dx||s.dy?"t"+[s.dx,s.dy]:E)+(s.hw!=1||s.gl!=1?"s"+[s.hw,s.gl,0,0]:E)+(s.6o?"r"+[s.6o,0,0]:E)}1j{1b"m"+[J.4z(0),J.4z(1),J.4z(2),J.4z(3),J.4z(4),J.4z(5)]}}})(gz.3g);K 6Y=cQ.h3.3y(/1bm\\/(.*?)\\s/)||cQ.h3.3y(/1bf\\/(\\d+)/);if(cQ.MB=="1be 1bh, MG."&&(6Y&&6Y[1]<4||cQ.1bg.4d(0,2)=="iP")||cQ.MB=="1bp MG."&&(6Y&&6Y[1]<8)){73.nE=1a(){K 4L=J.4L(-99,-99,J.1m+99,J.1w+99).1n({2n:"3r"});6P(1a(){4L.3M()})}}1j{73.nE=kz}K 4I=1a(){J.1bx=1k},ME=1a(){1b J.fv.4I()},6R=1a(){J.1bB=1l},MA=1a(){1b J.fv.6R()},Hq=1a(e){K du=g.3m.9l.4O||g.3m.3H.4O,gH=g.3m.9l.57||g.3m.3H.57;1b{x:e.dS+gH,y:e.dA+du}},Mu=1a(){if(g.3m.dw){1b 1a(1y,1C,fn,1g){K f=1a(e){K 3t=Hq(e);1b fn.2J(1g,e,3t.x,3t.y)};1y.dw(1C,f,1k);if(qa&&qU[1C]){K Mw=1a(e){K 3t=Hq(e),MF=e;1p(K i=0,ii=e.uR&&e.uR.1f;i<ii;i++){if(e.uR[i].3f==1y){e=e.uR[i];e.fv=MF;e.4I=ME;e.6R=MA;1s}}1b fn.2J(1g,e,3t.x,3t.y)};1y.dw(qU[1C],Mw,1k)}1b 1a(){1y.s4(1C,f,1k);if(qa&&qU[1C]){1y.s4(qU[1C],f,1k)}1b 1l}}}1j{if(g.3m.kb){1b 1a(1y,1C,fn,1g){K f=1a(e){e=e||g.5U.1N;K du=g.3m.9l.4O||g.3m.3H.4O,gH=g.3m.9l.57||g.3m.3H.57,x=e.dS+gH,y=e.dA+du;e.4I=e.4I||4I;e.6R=e.6R||6R;1b fn.2J(1g,e,x,y)};1y.kb("on"+1C,f);K Mv=1a(){1y.A6("on"+1C,f);1b 1l};1b Mv}}}}(),5T=[],uE=1a(e){K x=e.dS,y=e.dA,du=g.3m.9l.4O||g.3m.3H.4O,gH=g.3m.9l.57||g.3m.3H.57,8r,j=5T.1f;4x(j--){8r=5T[j];if(qa&&e.jB){K i=e.jB.1f,aU;4x(i--){aU=e.jB[i];if(aU.ut==8r.el.fs.id){x=aU.dS;y=aU.dA;(e.fv?e.fv:e).4I();1s}}}1j{e.4I()}K 1u=8r.el.1u,o,3C=1u.jA,1P=1u.3j,4T=1u.2G.4T;g.5U.GW&&1P.8e(1u);1u.2G.4T="3r";o=8r.el.2N.MT(x,y);1u.2G.4T=4T;g.5U.GW&&(3C?1P.7T(1u,3C):1P.4p(1u));o&&3l("4E.5T.fz."+8r.el.id,8r.el,o);x+=gH;y+=du;3l("4E.5T.eS."+8r.el.id,8r.lk||8r.el,x-8r.el.fs.x,y-8r.el.fs.y,x,y,e)}},uz=1a(e){R.MR(uE).MQ(uz);K i=5T.1f,8r;4x(i--){8r=5T[i];8r.el.fs={};3l("4E.5T.5e."+8r.el.id,8r.us||(8r.qj||(8r.lk||8r.el)),e)}5T=[]},3x=R.el={};1p(K i=4U.1f;i--;){(1a(ej){R[ej]=3x[ej]=1a(fn,bv){if(R.is(fn,"1a")){J.4U=J.4U||[];J.4U.1G({1x:ej,f:fn,8Q:Mu(J.ed||(J.1u||g.3m),ej,fn,bv||J)})}1b J};R["un"+ej]=3x["un"+ej]=1a(fn){K 4U=J.4U||[],l=4U.1f;4x(l--){if(4U[l].1x==ej&&(R.is(fn,"2y")||4U[l].f==fn)){4U[l].8Q();4U.5X(l,1);!4U.1f&&4r J.4U}}1b J}})(4U[i])}3x.1h=1a(1r,1o){K 1h=jv[J.id]=jv[J.id]||{};if(2F.1f==0){1b 1h}if(2F.1f==1){if(R.is(1r,"1A")){1p(K i in 1r){if(1r[3S](i)){J.1h(i,1r[i])}}1b J}3l("4E.1h.4z."+J.id,J,1h[1r],1r);1b 1h[1r]}1h[1r]=1o;3l("4E.1h.5V."+J.id,J,1o,1r);1b J};3x.sB=1a(1r){if(1r==1d){jv[J.id]={}}1j{jv[J.id]&&4r jv[J.id][1r]}1b J};3x.1c3=1a(){1b 6w(jv[J.id]||{})};3x.7r=1a(uU,uv,GQ,Mz){1b J.iE(uU,GQ).eM(uv,Mz||GQ)};3x.1bH=1a(uU,uv){1b J.1ci(uU).1cg(uv)};K 7g=[];3x.5T=1a(H6,GR,Ha,lk,qj,us){1a 3a(e){(e.fv||e).4I();K x=e.dS,y=e.dA,du=g.3m.9l.4O||g.3m.3H.4O,gH=g.3m.9l.57||g.3m.3H.57;J.fs.id=e.ut;if(qa&&e.jB){K i=e.jB.1f,aU;4x(i--){aU=e.jB[i];J.fs.id=aU.ut;if(aU.ut==J.fs.id){x=aU.dS;y=aU.dA;1s}}}J.fs.x=x+gH;J.fs.y=y+du;!5T.1f&&R.bq(uE).7i(uz);5T.1G({el:J,lk:lk,qj:qj,us:us});GR&&3l.on("4E.5T.3a."+J.id,GR);H6&&3l.on("4E.5T.eS."+J.id,H6);Ha&&3l.on("4E.5T.5e."+J.id,Ha);3l("4E.5T.3a."+J.id,qj||(lk||J),e.dS+gH,e.dA+du,e)}J.fs={};7g.1G({el:J,3a:3a});J.88(3a);1b J};3x.1cM=1a(f){f?3l.on("4E.5T.fz."+J.id,f):3l.8Q("4E.5T.fz."+J.id)};3x.1cN=1a(){K i=7g.1f;4x(i--){if(7g[i].el==J){J.1cw(7g[i].3a);7g.5X(i,1);3l.8Q("4E.5T.*."+J.id)}}!7g.1f&&R.MR(uE).MQ(uz);5T=[]};73.aK=1a(x,y,r){K 2E=R.5p.aK(J,x||0,y||0,r||0);J.7z&&J.7z.1G(2E);1b 2E};73.4L=1a(x,y,w,h,r){K 2E=R.5p.4L(J,x||0,y||0,w||0,h||0,r||0);J.7z&&J.7z.1G(2E);1b 2E};73.bS=1a(x,y,rx,ry){K 2E=R.5p.bS(J,x||0,y||0,rx||0,ry||0);J.7z&&J.7z.1G(2E);1b 2E};73.1K=1a(9L){9L&&(!R.is(9L,4F)&&(!R.is(9L[0],4u)&&(9L+=E)));K 2E=R.5p.1K(R.7l[3v](R,2F),J);J.7z&&J.7z.1G(2E);1b 2E};73.af=1a(4J,x,y,w,h){K 2E=R.5p.af(J,4J||"MP:Bl",x||0,y||0,w||0,h||0);J.7z&&J.7z.1G(2E);1b 2E};73.2g=1a(x,y,2g){K 2E=R.5p.2g(J,x||0,y||0,4B(2g));J.7z&&J.7z.1G(2E);1b 2E};73.5V=1a(t7){!R.is(t7,"4u")&&(t7=3Q.3g.5X.2J(2F,0,2F.1f));K 2E=1T nS(t7);J.7z&&J.7z.1G(2E);2E["2N"]=J;2E["1C"]="5V";1b 2E};73.1cA=1a(5V){J.7z=5V||J.5V()};73.1bt=1a(5V){K 2E=J.7z;4r J.7z;1b 2E};73.nI=1a(1m,1w){1b R.5p.nI.2J(J,1m,1w)};73.iw=1a(x,y,w,h,cn){1b R.5p.iw.2J(J,x,y,w,h,cn)};73.1M=73.4P=1d;73.4E=R;K MS=1a(4e){K 5N=4e.ra(),3m=4e.wI,3H=3m.3H,fU=3m.9l,mh=fU.mh||(3H.mh||0),lb=fU.lb||(3H.lb||0),1M=5N.1M+(g.5U.MU||(fU.4O||3H.4O))-mh,2f=5N.2f+(g.5U.1bu||(fU.57||3H.57))-lb;1b{y:1M,x:2f}};73.MT=1a(x,y){K 2N=J,3b=2N.1Y,3f=g.3m.qn(x,y);if(g.5U.GW&&3f.6J=="3b"){K so=MS(3b),sr=3b.1bw();sr.x=x-so.x;sr.y=y-so.y;sr.1m=sr.1w=1;K tA=3b.1bd(sr,1d);if(tA.1f){3f=tA[tA.1f-1]}}if(!3f){1b 1d}4x(3f.3j&&(3f!=3b.3j&&!3f.4E)){3f=3f.3j}3f==2N.1Y.3j&&(3f=3b);3f=3f&&3f.4E?2N.MK(3f.BJ):1d;1b 3f};73.1bn=1a(3p){K 5V=J.5V();J.ag(1a(el){if(R.Gm(el.7p(),3p)){5V.1G(el)}});1b 5V};73.MK=1a(id){K c8=J.4P;4x(c8){if(c8.id==id){1b c8}c8=c8.3C}1b 1d};73.ag=1a(1X,yM){K c8=J.4P;4x(c8){if(1X.2J(yM,c8)===1k){1b J}c8=c8.3C}1b J};73.1bj=1a(x,y){K 5V=J.5V();J.ag(1a(el){if(el.kF(x,y)){5V.1G(el)}});1b 5V};1a 1bl(){1b J.x+S+J.y}1a Iy(){1b J.x+S+J.y+S+J.1m+" \\1bC "+J.1w}3x.kF=1a(x,y){K rp=J.ij=dl[J.1C](J);if(J.1n("4i")&&J.1n("4i").1f){rp=R.yx(rp,J.1n("4i"))}1b R.MJ(rp,x,y)};3x.7p=1a(MN){if(J.5R){1b{}}K 2j=J.2j;if(MN){if(2j.8T||!2j.pb){J.ij=dl[J.1C](J);2j.pb=tD(J.ij);2j.pb.3X=Iy;2j.8T=0}1b 2j.pb}if(2j.8T||(2j.hF||!2j.3p)){if(2j.8T||!J.ij){2j.pb=0;J.ij=dl[J.1C](J)}2j.3p=tD(pd(J.ij,J.5d));2j.3p.3X=Iy;2j.8T=2j.hF=0}1b 2j.3p};3x.6w=1a(){if(J.5R){1b 1d}K 2E=J.2N[J.1C]().1n(J.1n());J.7z&&J.7z.1G(2E);1b 2E};3x.dh=1a(dh){if(J.1C=="2g"){1b 1d}dh=dh||{};K s={1m:(dh.1m||10)+(+J.1n("2n-1m")||1),2d:dh.2d||1k,2X:dh.2X||0.5,J1:dh.J1||0,IS:dh.IS||0,3Y:dh.3Y||"#e0"},c=s.1m/2,r=J.2N,2E=r.5V(),1K=J.ij||dl[J.1C](J);1K=J.5d?pd(1K,J.5d):1K;1p(K i=1;i<c+1;i++){2E.1G(r.1K(1K).1n({2n:s.3Y,2d:s.2d?s.3Y:"3r","2n-kd":"5o","2n-et":"5o","2n-1m":+(s.1m/ c * i).5a(3), 2X:+(s.2X /c).5a(3)}))}1b 2E.7T(J).hE(s.J1,s.IS)};K 1c0={},tp=1a(6D,72,74,71,7V,7U,8j,8p,1f){if(1f==1d){1b k1(6D,72,74,71,7V,7U,8j,8p)}1j{1b R.rm(6D,72,74,71,7V,7U,8j,8p,MM(6D,72,74,71,7V,7U,8j,8p,1f))}},tm=1a(Ik,ts){1b 1a(1K,1f,ML){1K=iT(1K);K x,y,p,l,sp="",sE={},7j,6A=0;1p(K i=0,ii=1K.1f;i<ii;i++){p=1K[i];if(p[0]=="M"){x=+p[1];y=+p[2]}1j{l=tp(x,y,p[1],p[2],p[3],p[4],p[5],p[6]);if(6A+l>1f){if(ts&&!sE.3a){7j=tp(x,y,p[1],p[2],p[3],p[4],p[5],p[6],1f-6A);sp+=["C"+7j.3a.x,7j.3a.y,7j.m.x,7j.m.y,7j.x,7j.y];if(ML){1b sp}sE.3a=sp;sp=["M"+7j.x,7j.y+"C"+7j.n.x,7j.n.y,7j.5e.x,7j.5e.y,p[5],p[6]].5x();6A+=l;x=+p[5];y=+p[6];aN}if(!Ik&&!ts){7j=tp(x,y,p[1],p[2],p[3],p[4],p[5],p[6],1f-6A);1b{x:7j.x,y:7j.y,eN:7j.eN}}}6A+=l;x=+p[5];y=+p[6]}sp+=p.dP()+p}sE.5e=sp;7j=Ik?6A:ts?sE:R.rm(x,y,p[0],p[1],p[2],p[3],p[4],p[5],1);7j.eN&&(7j={x:7j.x,y:7j.y,eN:7j.eN});1b 7j}};K dO=tm(1),q1=tm(),tj=tm(0,1);R.dO=dO;R.q1=q1;R.sS=1a(1K,2L,to){if(J.dO(1K)-to<1E-6){1b tj(1K,2L).5e}K a=tj(1K,to,1);1b 2L?tj(a,2L).5e:a};3x.dO=1a(){K 1K=J.dl();if(!1K){1b}if(J.1u.dO){1b J.1u.dO()}1b dO(1K)};3x.q1=1a(1f){K 1K=J.dl();if(!1K){1b}1b q1(1K,1f)};3x.dl=1a(){K 1K,dl=R.Ck[J.1C];if(J.1C=="2g"||J.1C=="5V"){1b}if(dl){1K=dl(J)}1b 1K};3x.sS=1a(2L,to){K 1K=J.dl();if(!1K){1b}1b R.sS(1K,2L,to)};K ef=R.Nj={qO:1a(n){1b n},"<":1a(n){1b 6X(n,1.7)},">":1a(n){1b 6X(n,0.48)},"<>":1a(n){K q=0.48-n/ 1.1bM, Q = 4g.bt(0.1bN + q * q), x = Q - q, X = 6X(4G(x), 1 /3)*(x<0?-1:1),y=-Q-q,Y=6X(4G(y),1/3)*(y<0?-1:1),t=X+Y+0.5;1b(1-t)*3*t*t+t*t*t},MH:1a(n){K s=1.MI;1b n*n*((s+1)*n-s)},Mx:1a(n){n=n-1;K s=1.MI;1b n*n*((s+1)*n+s)+1},1bL:1a(n){if(n==!!n){1b n}1b 6X(2,-10*n)*4g.9E((n-0.MO)*(2*PI)/0.3)+1},1eb:1a(n){K s=7.1dQ,p=2.75,l;if(n<1/p){l=s*n*n}1j{if(n<2/p){n-=1.5/p;l=s*n*n+0.75}1j{if(n<2.5/p){n-=2.25/p;l=s*n*n+0.1dM}1j{n-=2.1dL/p;l=s*n*n+0.1dO}}}1b l}};ef.1e0=ef["zT-in"]=ef["<"];ef.1e2=ef["zT-2E"]=ef[">"];ef.1e1=ef["zT-in-2E"]=ef["<>"];ef["w2-in"]=ef.MH;ef["w2-2E"]=ef.Mx;K 5I=[],Am=3z.1dX||(3z.1dT||(3z.1dR||(3z.1eg||(3z.1e4||1a(1X){6P(1X,16)})))),7v=1a(){K My=+1T 5Y,l=0;1p(;l<5I.1f;l++){K e=5I[l];if(e.el.5R||e.AC){aN}K gs=My-e.3a,ms=e.ms,6B=e.6B,2L=e.2L,54=e.54,to=e.to,t=e.t,3h=e.el,5V={},7R,8L={},1r;if(e.mw){gs=(e.mw*e.2U.1M-e.49)/(e.cb-e.49)*ms;e.7m=e.mw;4r e.mw;e.6y&&5I.5X(l--,1)}1j{e.7m=(e.49+(e.cb-e.49)*(gs/ ms)) /e.2U.1M}if(gs<0){aN}if(gs<ms){K 3t=6B(gs/ms);1p(K 1n in 2L){if(2L[3S](1n)){3P(uk[1n]){1q nu:7R=+2L[1n]+3t*ms*54[1n];1s;1q"bn":7R="4m("+[uu(5o(2L[1n].r+3t*ms*54[1n].r)),uu(5o(2L[1n].g+3t*ms*54[1n].g)),uu(5o(2L[1n].b+3t*ms*54[1n].b))].5x(",")+")";1s;1q"1K":7R=[];1p(K i=0,ii=2L[1n].1f;i<ii;i++){7R[i]=[2L[1n][i][0]];1p(K j=1,jj=2L[1n][i].1f;j<jj;j++){7R[i][j]=+2L[1n][i][j]+3t*ms*54[1n][i][j]}7R[i]=7R[i].5x(S)}7R=7R.5x(S);1s;1q"4i":if(54[1n].Ng){7R=[];1p(i=0,ii=2L[1n].1f;i<ii;i++){7R[i]=[2L[1n][i][0]];1p(j=1,jj=2L[1n][i].1f;j<jj;j++){7R[i][j]=2L[1n][i][j]+3t*ms*54[1n][i][j]}}}1j{K 4z=1a(i){1b+2L[1n][i]+3t*ms*54[1n][i]};7R=[["m",4z(0),4z(1),4z(2),4z(3),4z(4),4z(5)]]}1s;1q"AL":if(1n=="7c-4L"){7R=[];i=4;4x(i--){7R[i]=+2L[1n][i]+3t*ms*54[1n][i]}}1s;5P:K jb=[][4b](2L[1n]);7R=[];i=3h.2N.9S[1n].1f;4x(i--){7R[i]=+jb[i]+3t*ms*54[1n][i]}1s}5V[1n]=7R}}3h.1n(5V);(1a(id,3h,2U){6P(1a(){3l("4E.2U.tK."+id,3h,2U)})})(3h.id,3h,e.2U)}1j{(1a(f,el,a){6P(1a(){3l("4E.2U.tK."+el.id,el,a);3l("4E.2U.1e5."+el.id,el,a);R.is(f,"1a")&&f.2J(el)})})(e.1X,3h,e.2U);3h.1n(to);5I.5X(l--,1);if(e.lV>1&&!e.3C){1p(1r in to){if(to[3S](1r)){8L[1r]=e.ke[1r]}}e.el.1n(8L);mi(e.2U,e.el,e.2U.92[0],1d,e.ke,e.lV-1)}if(e.3C&&!e.6y){mi(e.2U,e.el,e.3C,1d,e.ke,e.lV)}}}R.3b&&(3h&&(3h.2N&&3h.2N.nE()));5I.1f&&Am(7v)},uu=1a(3Y){1b 3Y>gw?gw:3Y<0?0:3Y};3x.LQ=1a(el,2U,1D,ms,6B,1X){K 1g=J;if(1g.5R){1X&&1X.2J(1g);1b 1g}K a=1D g6 fH?1D:R.7v(1D,ms,6B,1X),x,y;mi(a,1g,a.92[0],1d,1g.1n());1p(K i=0,ii=5I.1f;i<ii;i++){if(5I[i].2U==2U&&5I[i].el==el){5I[ii-1].3a=5I[i].3a;1s}}1b 1g};1a MZ(t,6D,72,8j,8p,5D){K cx=3*6D,bx=3*(8j-6D)-cx,ax=1-cx-bx,cy=3*72,by=3*(8p-72)-cy,ay=1-cy-by;1a B6(t){1b((ax*t+bx)*t+cx)*t}1a Nd(x,pX){K t=MC(x,pX);1b((ay*t+by)*t+cy)*t}1a MC(x,pX){K t0,t1,t2,x2,d2,i;1p(t2=x,i=0;i<8;i++){x2=B6(t2)-x;if(4G(x2)<pX){1b t2}d2=(3*ax*t2+2*bx)*t2+cx;if(4G(d2)<1E-6){1s}t2=t2-x2/d2}t0=0;t1=1;t2=x;if(t2<t0){1b t0}if(t2>t1){1b t1}4x(t0<t1){x2=B6(t2);if(4G(x2-x)<pX){1b t2}if(x>x2){t0=t2}1j{t1=t2}t2=(t1-t0)/2+t0}1b t2}1b Nd(t,1/(gI*5D))}3x.1cX=1a(f){f?3l.on("4E.2U.tK."+J.id,f):3l.8Q("4E.2U.tK."+J.id);1b J};1a fH(2U,ms){K 92=[],Bp={};J.ms=ms;J.e7=1;if(2U){1p(K 1n in 2U){if(2U[3S](1n)){Bp[4j(1n)]=2U[1n];92.1G(4j(1n))}}92.hQ(Ne)}J.2U=Bp;J.1M=92[92.1f-1];J.92=92}fH.3g.hI=1a(hI){K a=1T fH(J.2U,J.ms);a.e7=J.e7;a.uo=+hI||0;1b a};fH.3g.lV=1a(e7){K a=1T fH(J.2U,J.ms);a.uo=J.uo;a.e7=4g.bj(5E(e7,0))||1;1b a};1a mi(2U,1g,cb,7m,ke,e7){cb=4j(cb);K 1D,k3,zn,92=[],3C,49,oI,ms=2U.ms,2L={},to={},54={};if(7m){1p(i=0,ii=5I.1f;i<ii;i++){K e=5I[i];if(e.el.id==1g.id&&e.2U==2U){if(e.cb!=cb){5I.5X(i,1);zn=1}1j{k3=e}1g.1n(e.ke);1s}}}1j{7m=+to}1p(K i=0,ii=2U.92.1f;i<ii;i++){if(2U.92[i]==cb||2U.92[i]>7m*2U.1M){cb=2U.92[i];49=2U.92[i-1]||0;ms=ms/2U.1M*(cb-49);3C=2U.92[i+1];1D=2U.2U[cb];1s}1j{if(7m){1g.1n(2U.2U[2U.92[i]])}}}if(!1D){1b}if(!k3){1p(K 1n in 1D){if(1D[3S](1n)){if(uk[3S](1n)||1g.2N.9S[3S](1n)){2L[1n]=1g.1n(1n);2L[1n]==1d&&(2L[1n]=Na[1n]);to[1n]=1D[1n];3P(uk[1n]){1q nu:54[1n]=(to[1n]-2L[1n])/ms;1s;1q"bn":2L[1n]=R.dI(2L[1n]);K uh=R.dI(to[1n]);54[1n]={r:(uh.r-2L[1n].r)/ ms, g:(uh.g - 2L[1n].g) /ms,b:(uh.b-2L[1n].b)/ms};1s;1q"1K":K AV=iT(2L[1n],to[1n]),Nb=AV[1];2L[1n]=AV[0];54[1n]=[];1p(i=0,ii=2L[1n].1f;i<ii;i++){54[1n][i]=[0];1p(K j=1,jj=2L[1n][i].1f;j<jj;j++){54[1n][i][j]=(Nb[i][j]-2L[1n][i][j])/ms}}1s;1q"4i":K 2j=1g.2j,eq=Nc(2j[1n],to[1n]);if(eq){2L[1n]=eq.2L;to[1n]=eq.to;54[1n]=[];54[1n].Ng=1l;1p(i=0,ii=2L[1n].1f;i<ii;i++){54[1n][i]=[2L[1n][i][0]];1p(j=1,jj=2L[1n][i].1f;j<jj;j++){54[1n][i][j]=(to[1n][i][j]-2L[1n][i][j])/ms}}}1j{K m=1g.5d||1T gz,gC={2j:{4i:2j.4i},7p:1a(){1b 1g.7p(1)}};2L[1n]=[m.a,m.b,m.c,m.d,m.e,m.f];AS(gC,to[1n]);to[1n]=gC.2j.4i;54[1n]=[(gC.5d.a-m.a)/ ms, (gC.5d.b - m.b) /ms,(gC.5d.c-m.c)/ ms, (gC.5d.d - m.d) /ms,(gC.5d.e-m.e)/ ms, (gC.5d.f - m.f) /ms]}1s;1q"AL":K 2Z=4B(1D[1n])[3R](6e),jb=4B(2L[1n])[3R](6e);if(1n=="7c-4L"){2L[1n]=jb;54[1n]=[];i=jb.1f;4x(i--){54[1n][i]=(2Z[i]-2L[1n][i])/ms}}to[1n]=2Z;1s;5P:2Z=[][4b](1D[1n]);jb=[][4b](2L[1n]);54[1n]=[];i=1g.2N.9S[1n].1f;4x(i--){54[1n][i]=((2Z[i]||0)-(jb[i]||0))/ms}1s}}}}K 6B=1D.6B,gT=R.Nj[6B];if(!gT){gT=4B(6B).3y(N9);if(gT&&gT.1f==5){K hN=gT;gT=1a(t){1b MZ(t,+hN[1],+hN[2],+hN[3],+hN[4],ms)}}1j{gT=N0}}oI=1D.3a||(2U.3a||+1T 5Y);e={2U:2U,cb:cb,oI:oI,3a:oI+(2U.uo||0),7m:0,mw:7m||0,6y:1k,ms:ms,6B:gT,2L:2L,54:54,to:to,el:1g,1X:1D.1X,49:49,3C:3C,lV:e7||2U.e7,iM:1g.1n(),ke:ke};5I.1G(e);if(7m&&(!k3&&!zn)){e.6y=1l;e.3a=1T 5Y-ms*7m;if(5I.1f==1){1b 7v()}}if(zn){e.3a=1T 5Y-e.ms*7m}5I.1f==1&&Am(7v)}1j{k3.mw=7m;k3.3a=1T 5Y-k3.ms*7m}3l("4E.2U.3a."+1g.id,1g,2U)}R.7v=1a(1D,ms,6B,1X){if(1D g6 fH){1b 1D}if(R.is(6B,"1a")||!6B){1X=1X||(6B||1d);6B=1d}1D=5c(1D);ms=+ms||0;K p={},ei,1n;1p(1n in 1D){if(1D[3S](1n)&&(4j(1n)!=1n&&4j(1n)+"%"!=1n)){ei=1l;p[1n]=1D[1n]}}if(!ei){1b 1T fH(1D,ms)}1j{6B&&(p.6B=6B);1X&&(p.1X=1X);1b 1T fH({100:p},ms)}};3x.51=1a(1D,ms,6B,1X){K 1g=J;if(1g.5R){1X&&1X.2J(1g);1b 1g}K 2U=1D g6 fH?1D:R.7v(1D,ms,6B,1X);mi(2U,1g,2U.92[0],1d,1g.1n());1b 1g};3x.1dI=1a(2U,1o){if(2U&&1o!=1d){J.7m(2U,6T(1o,2U.ms)/2U.ms)}1b J};3x.7m=1a(2U,1o){K 2E=[],i=0,6A,e;if(1o!=1d){mi(2U,J,-1,6T(1o,1));1b J}1j{6A=5I.1f;1p(;i<6A;i++){e=5I[i];if(e.el.id==J.id&&(!2U||e.2U==2U)){if(2U){1b e.7m}2E.1G({2U:e.2U,7m:e.7m})}}if(2U){1b 0}1b 2E}};3x.LN=1a(2U){1p(K i=0;i<5I.1f;i++){if(5I[i].el.id==J.id&&(!2U||5I[i].2U==2U)){if(3l("4E.2U.LN."+J.id,J,5I[i].2U)!==1k){5I[i].AC=1l}}}1b J};3x.LJ=1a(2U){1p(K i=0;i<5I.1f;i++){if(5I[i].el.id==J.id&&(!2U||5I[i].2U==2U)){K e=5I[i];if(3l("4E.2U.LJ."+J.id,J,e.2U)!==1k){4r e.AC;J.7m(e.2U,e.7m)}}}1b J};3x.6y=1a(2U){1p(K i=0;i<5I.1f;i++){if(5I[i].el.id==J.id&&(!2U||5I[i].2U==2U)){if(3l("4E.2U.6y."+J.id,J,5I[i].2U)!==1k){5I.5X(i--,1)}}}1b J};1a As(2N){1p(K i=0;i<5I.1f;i++){if(5I[i].el.2N==2N){5I.5X(i--,1)}}}3l.on("4E.3M",As);3l.on("4E.9J",As);3x.3X=1a(){1b"mG\\mL\\1dk 1A"};K nS=1a(1J){J.1J=[];J.1f=0;J.1C="5V";if(1J){1p(K i=0,ii=1J.1f;i<ii;i++){if(1J[i]&&(1J[i].5K==3x.5K||1J[i].5K==nS)){J[J.1J.1f]=J.1J[J.1J.1f]=1J[i];J.1f++}}}},7S=nS.3g;7S.1G=1a(){K 1i,6A;1p(K i=0,ii=2F.1f;i<ii;i++){1i=2F[i];if(1i&&(1i.5K==3x.5K||1i.5K==nS)){6A=J.1J.1f;J[6A]=J.1J[6A]=1i;J.1f++}}1b J};7S.eJ=1a(){J.1f&&4r J[J.1f--];1b J.1J.eJ()};7S.ag=1a(1X,yM){1p(K i=0,ii=J.1J.1f;i<ii;i++){if(1X.2J(yM,J.1J[i],i)===1k){1b J}}1b J};1p(K 4h in 3x){if(3x[3S](4h)){7S[4h]=1a(gP){1b 1a(){K 4M=2F;1b J.ag(1a(el){el[gP][3v](el,4M)})}}(4h)}}7S.1n=1a(1x,1o){if(1x&&(R.is(1x,4u)&&R.is(1x[0],"1A"))){1p(K j=0,jj=1x.1f;j<jj;j++){J.1J[j].1n(1x[j])}}1j{1p(K i=0,ii=J.1J.1f;i<ii;i++){J.1J[i].1n(1x,1o)}}1b J};7S.9J=1a(){4x(J.1f){J.eJ()}};7S.5X=1a(1W,7a,1du){1W=1W<0?5E(J.1f+1W,0):1W;7a=5E(0,6T(J.1f-1W,7a));K yw=[],A1=[],2w=[],i;1p(i=2;i<2F.1f;i++){2w.1G(2F[i])}1p(i=0;i<7a;i++){A1.1G(J[1W+i])}1p(;i<J.1f-1W;i++){yw.1G(J[1W+i])}K nZ=2w.1f;1p(i=0;i<nZ+yw.1f;i++){J.1J[1W+i]=J[1W+i]=i<nZ?2w[i]:yw[i-nZ]}i=J.1J.1f=J.1f-=7a-nZ;4x(J[i]){4r J[i++]}1b 1T nS(A1)};7S.BX=1a(el){1p(K i=0,ii=J.1f;i<ii;i++){if(J[i]==el){J.5X(i,1);1b 1l}}};7S.51=1a(1D,ms,6B,1X){(R.is(6B,"1a")||!6B)&&(1X=6B||1d);K 6A=J.1J.1f,i=6A,1i,5V=J,xY;if(!6A){1b J}1X&&(xY=1a(){!--6A&&1X.2J(5V)});6B=R.is(6B,4F)?6B:xY;K 2U=R.7v(1D,ms,6B,xY);1i=J.1J[--i].51(2U);4x(i--){J.1J[i]&&(!J.1J[i].5R&&J.1J[i].LQ(1i,2U,2U));J.1J[i]&&!J.1J[i].5R||6A--}1b J};7S.gM=1a(el){K i=J.1J.1f;4x(i--){J.1J[i].gM(el)}1b J};7S.7p=1a(){K x=[],y=[],x2=[],y2=[];1p(K i=J.1J.1f;i--;){if(!J.1J[i].5R){K 5N=J.1J[i].7p();x.1G(5N.x);y.1G(5N.y);x2.1G(5N.x+5N.1m);y2.1G(5N.y+5N.1w)}}x=6T[3v](0,x);y=6T[3v](0,y);x2=5E[3v](0,x2);y2=5E[3v](0,y2);1b{x:x,y:y,x2:x2,y2:y2,1m:x2-x,1w:y2-y}};7S.6w=1a(s){s=J.2N.5V();1p(K i=0,ii=J.1J.1f;i<ii;i++){s.1G(J.1J[i].6w())}1b s};7S.3X=1a(){1b"mG\\mL\\1dq 5V"};7S.dh=1a(Lx){K 8W=J.2N.5V();J.ag(1a(ed,1W){K g=ed.dh(Lx);if(g!=1d){g.ag(1a(Ly,1dr){8W.1G(Ly)})}});1b 8W};7S.kF=1a(x,y){K kF=1k;J.ag(1a(el){if(el.kF(x,y)){kF=1l;1b 1k}});1b kF};R.1bc=1a(3e){if(!3e.9T){1b 3e}J.eZ=J.eZ||{};K kE={w:3e.w,9T:{},hh:{}},96=3e.9T["3e-96"];1p(K 6U in 3e.9T){if(3e.9T[3S](6U)){kE.9T[6U]=3e.9T[6U]}}if(J.eZ[96]){J.eZ[96].1G(kE)}1j{J.eZ[96]=[kE]}if(!3e.3b){kE.9T["BY-BZ-em"]=bw(3e.9T["BY-BZ-em"],10);1p(K o0 in 3e.hh){if(3e.hh[3S](o0)){K 1K=3e.hh[o0];kE.hh[o0]={w:1K.w,k:{},d:1K.d&&"M"+1K.d.3u(/[17r]/g,1a(91){1b{l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"}[91]||"M"})+"z"};if(1K.k){1p(K k in 1K.k){if(1K[3S](k)){kE.hh[o0].k[k]=1K.k[k]}}}}}}1b 3e};73.LE=1a(96,bz,2G,oq){oq=oq||"zr";2G=2G||"zr";bz=+bz||({zr:pZ,17s:17u,17t:wq,17m:De}[bz]||pZ);if(!R.eZ){1b}K 3e=R.eZ[96];if(!3e){K 1x=1T e3("(^|\\\\s)"+96.3u(/[^\\w\\d\\s+!~.:2j-]/g,E)+"(\\\\s|$)","i");1p(K zF in R.eZ){if(R.eZ[3S](zF)){if(1x.9A(zF)){3e=R.eZ[zF];1s}}}}K jg;if(3e){1p(K i=0,ii=3e.1f;i<ii;i++){jg=3e[i];if(jg.9T["3e-bz"]==bz&&((jg.9T["3e-2G"]==2G||!jg.9T["3e-2G"])&&jg.9T["3e-oq"]==oq)){1s}}}1b jg};73.17p=1a(x,y,4F,3e,4l,iM,yR,y8){iM=iM||"BC";yR=5E(6T(yR||0,1),-1);y8=5E(6T(y8||1,3),1);K nL=4B(4F)[3R](E),dP=0,ou=0,1K=E,7Z;R.is(3e,"4F")&&(3e=J.LE(3e));if(3e){7Z=(4l||16)/3e.9T["BY-BZ-em"];K bb=3e.9T.3p[3R](6e),1M=+bb[0],zx=bb[3]-bb[1],Cd=0,1w=+bb[1]+(iM=="17A"?zx+ +3e.9T.17C:zx/2);1p(K i=0,ii=nL.1f;i<ii;i++){if(nL[i]=="\\n"){dP=0;hS=0;ou=0;Cd+=zx*y8}1j{K 49=ou&&3e.hh[nL[i-1]]||{},hS=3e.hh[nL[i]];dP+=ou?(49.w||3e.w)+(49.k&&49.k[nL[i]]||0)+3e.w*yR:0;ou=1}if(hS&&hS.d){1K+=R.yx(hS.d,["t",dP*7Z,Cd*7Z,"s",7Z,7Z,1M,1w,"t",(x-1M)/ 7Z, (y - 1w) /7Z])}}}1b J.1K(1K).1n({2d:"#e0",2n:"3r"})};73.5L=1a(ei){if(R.is(ei,"4u")){K 1F=J.5V(),i=0,ii=ei.1f,j;1p(;i<ii;i++){j=ei[i]||{};bd[3S](j.1C)&&1F.1G(J[j.1C]().1n(j))}}1b 1F};R.7l=1a(ey,1D){K 2w=R.is(1D,4u)?[0][4b](1D):2F;ey&&(R.is(ey,4F)&&(2w.1f-1&&(ey=ey.3u(Mq,1a(82,i){1b 2w[++i]==1d?E:2w[i]}))));1b ey||E};R.17v=1a(){K Mp=/\\{([^\\}]+)\\}/g,Mr=/(?:(?:^|\\.)(.+?)(?=\\[|\\.|$|\\()|\\[(\'|")(.+?)\\2\\])(\\(\\))?/g,Mf=1a(76,1r,1y){K 1F=1y;1r.3u(Mr,1a(76,1x,Ms,Mn,Mo){1x=1x||Mn;if(1F){if(1x in 1F){1F=1F[1x]}2A 1F=="1a"&&(Mo&&(1F=1F()))}});1F=(1F==1d||1F==1y?76:1F)+"";1b 1F};1b 1a(82,1y){1b 62(82).3u(Mp,1a(76,1r){1b Mf(76,1r,1y)})}}();R.17k=1a(){xC.zS?g.5U.c4=xC.is:4r c4;1b R};R.st=7S;(1a(3m,cR,f){if(3m.rS==1d&&3m.dw){3m.dw(cR,f=1a(){3m.s4(cR,f,1k);3m.rS="we"},1k);3m.rS="dJ"}1a B1(){/in/.9A(3m.rS)?6P(B1,9):R.3l("4E.mz")}B1()})(2K,"175");3l.on("4E.mz",1a(){cR=1l});(1a(){if(!R.3b){1b}K 3S="87",4B=62,4j=e8,bw=6u,4g=3A,5E=4g.4n,4G=4g.4G,6X=4g.6X,6e=/[, ]+/,3l=R.3l,E="",S=" ";K cT="6t://dN.w3.ew/QO/cT",Me={5J:"M5,0 0,2.5 5,5z",ph:"M5,0 0,2.5 5,5 3.5,3 3.5,2z",vB:"M2.5,0 5,2.5 2.5,5 0,2.5z",7C:"M6,1 1,3.5 6,6",vD:"M2.5,179.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,176"},de={};K $=1a(el,1n){if(1n){if(2A el=="4F"){el=$(el)}1p(K 1r in 1n){if(1n[3S](1r)){if(1r.hg(0,6)=="cT:"){el.sj(cT,1r.hg(6),4B(1n[1r]))}1j{el.cP(1r,4B(1n[1r]))}}}}1j{el=R.8J.3m.16Z("6t://dN.w3.ew/i9/3b",el);el.2G&&(el.2G.16Y="B7(0,0,0,0)")}1b el},qX=1a(1g,4v){K 1C="qO",id=1g.id+4v,fx=0.5,fy=0.5,o=1g.1u,fe=1g.2N,s=o.2G,el=R.8J.3m.ht(id);if(!el){4v=4B(4v).3u(R.Co,1a(76,AQ,AY){1C="xt";if(AQ&&AY){fx=4j(AQ);fy=4j(AY);K AT=(fy>0.5)*2-1;6X(fx-0.5,2)+6X(fy-0.5,2)>0.25&&((fy=4g.bt(0.25-6X(fx-0.5,2))*AT+0.5)&&(fy!=0.5&&(fy=fy.5a(5)-1E-5*AT)))}1b E});4v=4v.3R(/\\s*\\-\\s*/);if(1C=="qO"){K 8m=4v.dP();8m=-4j(8m);if(9B(8m)){1b 1d}K 9D=[0,0,4g.aa(R.ab(8m)),4g.9E(R.ab(8m))],4n=1/(5E(4G(9D[2]),4G(9D[3]))||1);9D[2]*=4n;9D[3]*=4n;if(9D[2]<0){9D[0]=-9D[2];9D[2]=0}if(9D[3]<0){9D[1]=-9D[3];9D[3]=0}}K 5S=R.BM(4v);if(!5S){1b 1d}id=id.3u(/[\\(\\)\\s,\\AU#]/g,"2j");if(1g.4v&&id!=1g.4v.id){fe.ex.8e(1g.4v);4r 1g.4v}if(!1g.4v){el=$(1C+"170",{id:id});1g.4v=el;$(el,1C=="xt"?{fx:fx,fy:fy}:{x1:9D[0],y1:9D[1],x2:9D[2],y2:9D[3],172:1g.5d.s0()});fe.ex.4p(el);1p(K i=0,ii=5S.1f;i<ii;i++){el.4p($("6y",{2v:5S[i].2v?5S[i].2v:i?"100%":"0%","6y-3Y":5S[i].3Y||"#mF"}))}}}$(o,{2d:"5l(#"+id+")",2X:1,"2d-2X":1});s.2d=E;s.2X=1;s.171=1;1b 1},su=1a(o){K 3p=o.7p(1);$(o.e5,{17g:o.5d.s0()+" hE("+3p.x+","+3p.y+")"})},dU=1a(o,1o,fQ){if(o.1C=="1K"){K 2Z=4B(1o).3W().3R("-"),p=o.2N,se=fQ?"5e":"3a",1u=o.1u,2t=o.2t,2n=2t["2n-1m"],i=2Z.1f,1C="ph",2L,to,dx,rj,1n,w=3,h=3,t=5;4x(i--){3P(2Z[i]){1q"5J":;1q"ph":;1q"vD":;1q"vB":;1q"7C":;1q"3r":1C=2Z[i];1s;1q"OZ":h=5;1s;1q"OU":h=2;1s;1q"OV":w=5;1s;1q"OW":w=2;1s}}if(1C=="7C"){w+=2;h+=2;t+=2;dx=1;rj=fQ?4:1;1n={2d:"3r",2n:2t.2n}}1j{rj=dx=w/2;1n={2d:2t.2n,2n:"3r"}}if(o.2j.5m){if(fQ){o.2j.5m.LY&&de[o.2j.5m.LY]--;o.2j.5m.M7&&de[o.2j.5m.M7]--}1j{o.2j.5m.Mc&&de[o.2j.5m.Mc]--;o.2j.5m.Md&&de[o.2j.5m.Md]--}}1j{o.2j.5m={}}if(1C!="3r"){K ji="4E-eV-"+1C,j6="4E-eV-"+se+1C+w+h;if(!R.8J.3m.ht(ji)){p.ex.4p($($("1K"),{"2n-et":"5o",d:Me[1C],id:ji}));de[ji]=1}1j{de[ji]++}K eV=R.8J.3m.ht(j6),iN;if(!eV){eV=$($("eV"),{id:j6,17h:h,17j:w,17i:"6a",rj:rj,17b:h/2});iN=$($("iN"),{"cT:5B":"#"+ji,4i:(fQ?"6o(180 "+w/ 2 + " " + h /2+") ":E)+"7Z("+w/ t + "," + h /t+")","2n-1m":(1/ ((w /t+h/ t) /2)).5a(4)});eV.4p(iN);p.ex.4p(eV);de[j6]=1}1j{de[j6]++;iN=eV.eu("iN")[0]}$(iN,1n);K zc=dx*(1C!="vB"&&1C!="vD");if(fQ){2L=o.2j.5m.Mb*2n||0;to=R.dO(2t.1K)-zc*2n}1j{2L=zc*2n;to=R.dO(2t.1K)-(o.2j.5m.OC*2n||0)}1n={};1n["eV-"+se]="5l(#"+j6+")";if(to||2L){1n.d=R.sS(2t.1K,2L,to)}$(1u,1n);o.2j.5m[se+"dv"]=ji;o.2j.5m[se+"OD"]=j6;o.2j.5m[se+"dx"]=zc;o.2j.5m[se+"4R"]=1C;o.2j.5m[se+"62"]=1o}1j{if(fQ){2L=o.2j.5m.Mb*2n||0;to=R.dO(2t.1K)-2L}1j{2L=0;to=R.dO(2t.1K)-(o.2j.5m.OC*2n||0)}o.2j.5m[se+"dv"]&&$(1u,{d:R.sS(2t.1K,2L,to)});4r o.2j.5m[se+"dv"];4r o.2j.5m[se+"OD"];4r o.2j.5m[se+"dx"];4r o.2j.5m[se+"4R"];4r o.2j.5m[se+"62"]}1p(1n in de){if(de[3S](1n)&&!de[1n]){K 1i=R.8J.3m.ht(1n);1i&&1i.3j.8e(1i)}}}},aV={"":[0],"3r":[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},Bj=1a(o,1o,1D){1o=aV[4B(1o).3W()];if(1o){K 1m=o.2t["2n-1m"]||"1",mW={5o:1m,C4:1m,mW:0}[o.2t["2n-et"]||1D["2n-et"]]||0,Bi=[],i=1o.1f;4x(i--){Bi[i]=1o[i]*1m+(i%2?1:-1)*mW}$(o.1u,{"2n-aV":Bi.5x(",")})}},fF=1a(o,1D){K 1u=o.1u,2t=o.2t,OH=1u.2G.i8;1u.2G.i8="6f";1p(K 7q in 1D){if(1D[3S](7q)){if(!R.lv[3S](7q)){aN}K 1o=1D[7q];2t[7q]=1o;3P(7q){1q"4W":o.4W(1o);1s;1q"5b":K 5b=1u.eu("5b");if(5b.1f&&(5b=5b[0])){5b.8G.Oy=1o}1j{5b=$("5b");K 2b=R.8J.3m.AP(1o);5b.4p(2b);1u.4p(5b)}1s;1q"5B":;1q"3f":K pn=1u.3j;if(pn.6J.3W()!="a"){K hl=$("a");pn.7T(hl,1u);hl.4p(1u);pn=hl}if(7q=="3f"){pn.sj(cT,"5k",1o=="Bl"?"1T":1o)}1j{pn.sj(cT,7q,1o)}1s;1q"mC":1u.2G.mC=1o;1s;1q"4i":o.4i(1o);1s;1q"bZ-3a":dU(o,1o);1s;1q"bZ-5e":dU(o,1o,1);1s;1q"7c-4L":K 4L=4B(1o).3R(6e);if(4L.1f==4){o.7c&&o.7c.3j.3j.8e(o.7c.3j);K el=$("18e"),rc=$("4L");el.id=R.sh();$(rc,{x:4L[0],y:4L[1],1m:4L[2],1w:4L[3]});el.4p(rc);o.2N.ex.4p(el);$(1u,{"7c-1K":"5l(#"+el.id+")"});o.7c=rc}if(!1o){K 1K=1u.Bo("7c-1K");if(1K){K 7c=R.8J.3m.ht(1K.3u(/(^5l\\(#|\\)$)/g,E));7c&&7c.3j.8e(7c);$(1u,{"7c-1K":E});4r o.7c}}1s;1q"1K":if(o.1C=="1K"){$(1u,{d:1o?2t.1K=R.q4(1o):"M0,0"});o.2j.8T=1;if(o.2j.5m){"ml"in o.2j.5m&&dU(o,o.2j.5m.ml);"mf"in o.2j.5m&&dU(o,o.2j.5m.mf,1)}}1s;1q"1m":1u.cP(7q,1o);o.2j.8T=1;if(2t.fx){7q="x";1o=2t.x}1j{1s};1q"x":if(2t.fx){1o=-2t.x-(2t.1m||0)};1q"rx":if(7q=="rx"&&o.1C=="4L"){1s};1q"cx":1u.cP(7q,1o);o.e5&&su(o);o.2j.8T=1;1s;1q"1w":1u.cP(7q,1o);o.2j.8T=1;if(2t.fy){7q="y";1o=2t.y}1j{1s};1q"y":if(2t.fy){1o=-2t.y-(2t.1w||0)};1q"ry":if(7q=="ry"&&o.1C=="4L"){1s};1q"cy":1u.cP(7q,1o);o.e5&&su(o);o.2j.8T=1;1s;1q"r":if(o.1C=="4L"){$(1u,{rx:1o,ry:1o})}1j{1u.cP(7q,1o)}o.2j.8T=1;1s;1q"4J":if(o.1C=="af"){1u.sj(cT,"5B",1o)}1s;1q"2n-1m":if(o.2j.sx!=1||o.2j.sy!=1){1o/=5E(4G(o.2j.sx),4G(o.2j.sy))||1}if(o.2N.pG){1o*=o.2N.pG}1u.cP(7q,1o);if(2t["2n-aV"]){Bj(o,2t["2n-aV"],1D)}if(o.2j.5m){"ml"in o.2j.5m&&dU(o,o.2j.5m.ml);"mf"in o.2j.5m&&dU(o,o.2j.5m.mf,1)}1s;1q"2n-aV":Bj(o,1o,1D);1s;1q"2d":K hm=4B(1o).3y(R.Cf);if(hm){el=$("e5");K ig=$("af");el.id=R.sh();$(el,{x:0,y:0,18f:"184",1w:1,1m:1});$(ig,{x:0,y:0,"cT:5B":hm[1]});el.4p(ig);(1a(el){R.Cb(hm[1],1a(){K w=J.ik,h=J.9m;$(el,{1m:w,1w:h});$(ig,{1m:w,1w:h});o.2N.nE()})})(el);o.2N.ex.4p(el);$(1u,{2d:"5l(#"+el.id+")"});o.e5=el;o.e5&&su(o);1s}K 4a=R.dI(1o);if(!4a.5q){4r 1D.4v;4r 2t.4v;!R.is(2t.2X,"2y")&&(R.is(1D.2X,"2y")&&$(1u,{2X:2t.2X}));!R.is(2t["2d-2X"],"2y")&&(R.is(1D["2d-2X"],"2y")&&$(1u,{"2d-2X":2t["2d-2X"]}))}1j{if((o.1C=="aK"||(o.1C=="bS"||4B(1o).cB()!="r"))&&qX(o,1o)){if("2X"in 2t||"2d-2X"in 2t){K 4v=R.8J.3m.ht(1u.Bo("2d").3u(/^5l\\(#|\\)$/g,E));if(4v){K l8=4v.eu("6y");$(l8[l8.1f-1],{"6y-2X":("2X"in 2t?2t.2X:1)*("2d-2X"in 2t?2t["2d-2X"]:1)})}}2t.4v=1o;2t.2d="3r";1s}}4a[3S]("2X")&&$(1u,{"2d-2X":4a.2X>1?4a.2X/100:4a.2X});1q"2n":4a=R.dI(1o);1u.cP(7q,4a.7b);7q=="2n"&&(4a[3S]("2X")&&$(1u,{"2n-2X":4a.2X>1?4a.2X/100:4a.2X}));if(7q=="2n"&&o.2j.5m){"ml"in o.2j.5m&&dU(o,o.2j.5m.ml);"mf"in o.2j.5m&&dU(o,o.2j.5m.mf,1)}1s;1q"4v":(o.1C=="aK"||(o.1C=="bS"||4B(1o).cB()!="r"))&&qX(o,1o);1s;1q"2X":if(2t.4v&&!2t[3S]("2n-2X")){$(1u,{"2n-2X":1o>1?1o/100:1o})};1q"2d-2X":if(2t.4v){4v=R.8J.3m.ht(1u.Bo("2d").3u(/^5l\\(#|\\)$/g,E));if(4v){l8=4v.eu("6y");$(l8[l8.1f-1],{"6y-2X":1o})}1s};5P:7q=="3e-4l"&&(1o=bw(1o,10)+"px");K OL=7q.3u(/(\\-.)/g,1a(w){1b w.hg(1).9p()});1u.2G[OL]=1o;o.2j.8T=1;1u.cP(7q,1o);1s}}}Ox(o,1D);1u.2G.i8=OH},Bh=1.2,Ox=1a(el,1D){if(el.1C!="2g"||!(1D[3S]("2g")||(1D[3S]("3e")||(1D[3S]("3e-4l")||(1D[3S]("x")||1D[3S]("y")))))){1b}K a=el.2t,1u=el.1u,fE=1u.8G?bw(R.8J.3m.m6.wW(1u.8G,E).Om("3e-4l"),10):10;if(1D[3S]("2g")){a.2g=1D.2g;4x(1u.8G){1u.8e(1u.8G)}K Bd=4B(1D.2g).3R("\\n"),kN=[],ir;1p(K i=0,ii=Bd.1f;i<ii;i++){ir=$("ir");i&&$(ir,{dy:fE*Bh,x:a.x});ir.4p(R.8J.3m.AP(Bd[i]));1u.4p(ir);kN[i]=ir}}1j{kN=1u.eu("ir");1p(i=0,ii=kN.1f;i<ii;i++){if(i){$(kN[i],{dy:fE*Bh,x:a.x})}1j{$(kN[0],{dy:0})}}}$(1u,{x:a.x,y:a.y});el.2j.8T=1;K bb=el.qv(),w0=a.y-(bb.y+bb.1w/2);w0&&(R.is(w0,"s8")&&$(kN[0],{dy:w0}))},bC=1a(1u,3b){K X=0,Y=0;J[0]=J.1u=1u;1u.4E=1l;J.id=R.BN++;1u.BJ=J.id;J.5d=R.5d();J.ij=1d;J.2N=3b;J.2t=J.2t||{};J.2j={4i:[],sx:1,sy:1,4X:0,dx:0,dy:0,8T:1};!3b.4P&&(3b.4P=J);J.49=3b.1M;3b.1M&&(3b.1M.3C=J);3b.1M=J;J.3C=1d},3x=R.el;bC.3g=3x;3x.5K=bC;R.5p.1K=1a(9L,fe){K el=$("1K");fe.1Y&&fe.1Y.4p(el);K p=1T bC(el,fe);p.1C="1K";fF(p,{2d:"3r",2n:"#e0",1K:9L});1b p};3x.6o=1a(4X,cx,cy){if(J.5R){1b J}4X=4B(4X).3R(6e);if(4X.1f-1){cx=4j(4X[1]);cy=4j(4X[2])}4X=4j(4X[0]);cy==1d&&(cx=cy);if(cx==1d||cy==1d){K 3p=J.7p(1);cx=3p.x+3p.1m/2;cy=3p.y+3p.1w/2}J.4i(J.2j.4i.4b([["r",4X,cx,cy]]));1b J};3x.7Z=1a(sx,sy,cx,cy){if(J.5R){1b J}sx=4B(sx).3R(6e);if(sx.1f-1){sy=4j(sx[1]);cx=4j(sx[2]);cy=4j(sx[3])}sx=4j(sx[0]);sy==1d&&(sy=sx);cy==1d&&(cx=cy);if(cx==1d||cy==1d){K 3p=J.7p(1)}cx=cx==1d?3p.x+3p.1m/2:cx;cy=cy==1d?3p.y+3p.1w/2:cy;J.4i(J.2j.4i.4b([["s",sx,sy,cx,cy]]));1b J};3x.hE=1a(dx,dy){if(J.5R){1b J}dx=4B(dx).3R(6e);if(dx.1f-1){dy=4j(dx[1])}dx=4j(dx[0])||0;dy=+dy||0;J.4i(J.2j.4i.4b([["t",dx,dy]]));1b J};3x.4i=1a(bP){K 2j=J.2j;if(bP==1d){1b 2j.4i}R.BE(J,bP);J.7c&&$(J.7c,{4i:J.5d.s0()});J.e5&&su(J);J.1u&&$(J.1u,{4i:J.5d});if(2j.sx!=1||2j.sy!=1){K sw=J.2t[3S]("2n-1m")?J.2t["2n-1m"]:1;J.1n({"2n-1m":sw})}1b J};3x.3B=1a(){!J.5R&&J.2N.nE(J.1u.2G.4T="3r");1b J};3x.5k=1a(){!J.5R&&J.2N.nE(J.1u.2G.4T="");1b J};3x.3M=1a(){if(J.5R||!J.1u.3j){1b}K 2N=J.2N;2N.7z&&2N.7z.BX(J);3l.8Q("4E.*.*."+J.id);if(J.4v){2N.ex.8e(J.4v)}R.C3(J,2N);if(J.1u.3j.6J.3W()=="a"){J.1u.3j.3j.8e(J.1u.3j)}1j{J.1u.3j.8e(J.1u)}1p(K i in J){J[i]=2A J[i]=="1a"?R.pJ(i):1d}J.5R=1l};3x.qv=1a(){if(J.1u.2G.4T=="3r"){J.5k();K 3B=1l}K 3p={};6E{3p=J.1u.7p()}6I(e){}UV{3p=3p||{}}3B&&J.3B();1b 3p};3x.1n=1a(1x,1o){if(J.5R){1b J}if(1x==1d){K 1F={};1p(K a in J.2t){if(J.2t[3S](a)){1F[a]=J.2t[a]}}1F.4v&&(1F.2d=="3r"&&((1F.2d=1F.4v)&&4r 1F.4v));1F.4i=J.2j.4i;1b 1F}if(1o==1d&&R.is(1x,"4F")){if(1x=="2d"&&(J.2t.2d=="3r"&&J.2t.4v)){1b J.2t.4v}if(1x=="4i"){1b J.2j.4i}K 8d=1x.3R(6e),2E={};1p(K i=0,ii=8d.1f;i<ii;i++){1x=8d[i];if(1x in J.2t){2E[1x]=J.2t[1x]}1j{if(R.is(J.2N.9S[1x],"1a")){2E[1x]=J.2N.9S[1x].O0}1j{2E[1x]=R.lv[1x]}}}1b ii-1?2E:2E[8d[0]]}if(1o==1d&&R.is(1x,"4u")){2E={};1p(i=0,ii=1x.1f;i<ii;i++){2E[1x[i]]=J.1n(1x[i])}1b 2E}if(1o!=1d){K 1D={};1D[1x]=1o}1j{if(1x!=1d&&R.is(1x,"1A")){1D=1x}}1p(K 1r in 1D){3l("4E.1n."+1r+"."+J.id,J,1D[1r])}1p(1r in J.2N.9S){if(J.2N.9S[3S](1r)&&(1D[3S](1r)&&R.is(J.2N.9S[1r],"1a"))){K a0=J.2N.9S[1r].3v(J,[].4b(1D[1r]));J.2t[1r]=1D[1r];1p(K dq in a0){if(a0[3S](dq)){1D[dq]=a0[dq]}}}}fF(J,1D);1b J};3x.NZ=1a(){if(J.5R){1b J}if(J.1u.3j.6J.3W()=="a"){J.1u.3j.3j.4p(J.1u.3j)}1j{J.1u.3j.4p(J.1u)}K 3b=J.2N;3b.1M!=J&&R.BW(J,3b);1b J};3x.Je=1a(){if(J.5R){1b J}K 1P=J.1u.3j;if(1P.6J.3W()=="a"){1P.3j.7T(J.1u.3j,J.1u.3j.3j.8G)}1j{if(1P.8G!=J.1u){1P.7T(J.1u,J.1u.3j.8G)}}R.BS(J,J.2N);K 3b=J.2N;1b J};3x.gM=1a(1g){if(J.5R){1b J}K 1u=1g.1u||1g[1g.1f-1].1u;if(1u.jA){1u.3j.7T(J.1u,1u.jA)}1j{1u.3j.4p(J.1u)}R.BR(J,1g,J.2N);1b J};3x.7T=1a(1g){if(J.5R){1b J}K 1u=1g.1u||1g[0].1u;1u.3j.7T(J.1u,1u);R.BQ(J,1g,J.2N);1b J};3x.4W=1a(4l){K t=J;if(+4l!==0){K mI=$("42"),4W=$("18k");t.2t.4W=4l;mI.id=R.sh();$(4W,{17Z:+4l||1.5});mI.4p(4W);t.2N.ex.4p(mI);t.sk=mI;$(t.1u,{42:"5l(#"+mI.id+")"})}1j{if(t.sk){t.sk.3j.8e(t.sk);4r t.sk;4r t.2t.4W}t.1u.17K("42")}1b t};R.5p.aK=1a(3b,x,y,r){K el=$("aK");3b.1Y&&3b.1Y.4p(el);K 1F=1T bC(el,3b);1F.2t={cx:x,cy:y,r:r,2d:"3r",2n:"#e0"};1F.1C="aK";$(el,1F.2t);1b 1F};R.5p.4L=1a(3b,x,y,w,h,r){K el=$("4L");3b.1Y&&3b.1Y.4p(el);K 1F=1T bC(el,3b);1F.2t={x:x,y:y,1m:w,1w:h,r:r||0,rx:r||0,ry:r||0,2d:"3r",2n:"#e0"};1F.1C="4L";$(el,1F.2t);1b 1F};R.5p.bS=1a(3b,x,y,rx,ry){K el=$("bS");3b.1Y&&3b.1Y.4p(el);K 1F=1T bC(el,3b);1F.2t={cx:x,cy:y,rx:rx,ry:ry,2d:"3r",2n:"#e0"};1F.1C="bS";$(el,1F.2t);1b 1F};R.5p.af=1a(3b,4J,x,y,w,h){K el=$("af");$(el,{x:x,y:y,1m:w,1w:h,P6:"3r"});el.sj(cT,"5B",4J);3b.1Y&&3b.1Y.4p(el);K 1F=1T bC(el,3b);1F.2t={x:x,y:y,1m:w,1w:h,4J:4J};1F.1C="af";1b 1F};R.5p.2g=1a(3b,x,y,2g){K el=$("2g");3b.1Y&&3b.1Y.4p(el);K 1F=1T bC(el,3b);1F.2t={x:x,y:y,"2g-Cy":"BC",2g:2g,3e:R.lv.3e,2n:"3r",2d:"#e0"};1F.1C="2g";fF(1F,1F.2t);1b 1F};R.5p.nI=1a(1m,1w){J.1m=1m||J.1m;J.1w=1w||J.1w;J.1Y.cP("1m",J.1m);J.1Y.cP("1w",J.1w);if(J.iA){J.iw.3v(J,J.iA)}1b J};R.5p.8E=1a(){K cO=R.zY.3v(0,2F),3E=cO&&cO.3E,x=cO.x,y=cO.y,1m=cO.1m,1w=cO.1w;if(!3E){98 1T 9Z("fe 3E 6r a4.")}K cq=$("3b"),2T="e9:6f;",Bq;x=x||0;y=y||0;1m=1m||vL;1w=1w||Jd;$(cq,{1w:1w,6Y:1.1,1m:1m,gK:"6t://dN.w3.ew/i9/3b"});if(3E==1){cq.2G.i7=2T+"2R:7X;2f:"+x+"px;1M:"+y+"px";R.8J.3m.3H.4p(cq);Bq=1}1j{cq.2G.i7=2T+"2R:r7";if(3E.8G){3E.7T(cq,3E.8G)}1j{3E.4p(cq)}}3E=1T R.zV;3E.1m=1m;3E.1w=1w;3E.1Y=cq;3E.9J();3E.w7=3E.wc=0;Bq&&(3E.xF=1a(){});3E.xF();1b 3E};R.5p.iw=1a(x,y,w,h,cn){3l("4E.iw",J,J.iA,[x,y,w,h,cn]);K 4l=5E(w/ J.1m, h /J.1w),1M=J.1M,P1=cn?"17G":"17F",vb,sw;if(x==1d){if(J.pG){4l=1}4r J.pG;vb="0 0 "+J.1m+S+J.1w}1j{J.pG=4l;vb=x+S+y+S+w+S+h}$(J.1Y,{kv:vb,P6:P1});4x(4l&&1M){sw="2n-1m"in 1M.2t?1M.2t["2n-1m"]:1;1M.1n({"2n-1m":sw});1M.2j.8T=1;1M.2j.hF=1;1M=1M.49}J.iA=[x,y,w,h,!!cn];1b J};R.3g.xF=1a(){K cq=J.1Y,s=cq.2G,3t;6E{3t=cq.17J()||cq.P2()}6I(e){3t=cq.P2()}K 2f=-3t.e%1,1M=-3t.f%1;if(2f||1M){if(2f){J.w7=(J.w7+2f)%1;s.2f=J.w7+"px"}if(1M){J.wc=(J.wc+1M)%1;s.1M=J.wc+"px"}}};R.3g.9J=1a(){R.3l("4E.9J",J);K c=J.1Y;4x(c.8G){c.8e(c.8G)}J.4P=J.1M=1d;(J.pT=$("pT")).4p(R.8J.3m.AP("WL h9 mG\\mL "+R.6Y));c.4p(J.pT);c.4p(J.ex=$("ex"))};R.3g.3M=1a(){3l("4E.3M",J);J.1Y.3j&&J.1Y.3j.8e(J.1Y);1p(K i in J){J[i]=2A J[i]=="1a"?R.pJ(i):1d}};K 7S=R.st;1p(K 4h in 3x){if(3x[3S](4h)&&!7S[3S](4h)){7S[4h]=1a(gP){1b 1a(){K 4M=2F;1b J.ag(1a(el){el[gP].3v(el,4M)})}}(4h)}}})();(1a(){if(!R.6K){1b}K 3S="87",4B=62,4j=e8,4g=3A,5o=4g.5o,5E=4g.4n,6T=4g.6d,4G=4g.4G,kn="2d",6e=/[, ]+/,3l=R.3l,ms=" AZ:Pb.B9",S=" ",E="",ba={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},P9=/([B4]),?([^B4]*)/gi,JD=/ AZ:\\S+JA\\([^\\)]+\\)/g,2b=/-?[^,\\s-]+/g,zX="2R:7X;2f:0;1M:0;1m:nv;1w:nv",7s=17I,Oh={1K:1,4L:1,af:1},NF={aK:1,bS:1},NG=1a(1K){K c5=/[17V]/ig,91=R.q4;4B(1K).3y(c5)&&(91=R.v7);c5=/[B4]/g;if(91==R.q4&&!4B(1K).3y(c5)){K 1F=4B(1K).3u(P9,1a(76,91,2w){K ng=[],Pa=91.3W()=="m",1F=ba[91];2w.3u(2b,1a(1o){if(Pa&&ng.1f==2){1F+=ng+ba[91=="m"?"l":"L"];ng=[]}ng.1G(5o(1o*7s))});1b 1F+ng});1b 1F}K pa=91(1K),p,r;1F=[];1p(K i=0,ii=pa.1f;i<ii;i++){p=pa[i];r=pa[i][0].3W();r=="z"&&(r="x");1p(K j=1,jj=p.1f;j<jj;j++){r+=5o(p[j]*7s)+(j!=jj-1?",":E)}1F.1G(r)}1b 1F.5x(S)},B2=1a(4X,dx,dy){K m=R.5d();m.6o(-4X,0.5,0.5);1b{dx:m.x(dx,dy),dy:m.y(dx,dy)}},qA=1a(p,sx,sy,dx,dy,4X){K 2j=p.2j,m=p.5d,eh=2j.eh,o=p.1u,s=o.2G,y=1,mZ="",17W,kx=7s/ sx, ky = 7s /sy;s.i8="6f";if(!sx||!sy){1b}o.xS=4G(kx)+S+4G(ky);s.17Y=4X*(sx*sy<0?-1:1);if(4X){K c=B2(4X,dx,dy);dx=c.dx;dy=c.dy}sx<0&&(mZ+="x");sy<0&&((mZ+=" y")&&(y=-1));s.mZ=mZ;o.kY=dx*-kx+S+dy*-ky;if(eh||2j.km){K 2d=o.eu(kn);2d=2d&&2d[0];o.8e(2d);if(eh){c=B2(4X,m.x(eh[0],eh[1]),m.y(eh[0],eh[1]));2d.2R=c.dx*y+S+c.dy*y}if(2j.km){2d.4l=2j.km[0]*4G(sx)+S+2j.km[1]*4G(sy)}o.4p(2d)}s.i8="6v"};R.3X=1a(){1b"17Q A5 17P\\17R ga fe. 17T f5 to kl.\\17S Cl OP mG\\mL "+J.6Y};K dU=1a(o,1o,fQ){K 2Z=4B(1o).3W().3R("-"),se=fQ?"5e":"3a",i=2Z.1f,1C="ph",w="OX",h="OX";4x(i--){3P(2Z[i]){1q"5J":;1q"ph":;1q"vD":;1q"vB":;1q"7C":;1q"3r":1C=2Z[i];1s;1q"OZ":;1q"OU":h=2Z[i];1s;1q"OV":;1q"OW":w=2Z[i];1s}}K 2n=o.1u.eu("2n")[0];2n[se+"bZ"]=1C;2n[se+"15Y"]=w;2n[se+"16e"]=h},fF=1a(o,1D){o.2t=o.2t||{};K 1u=o.1u,a=o.2t,s=1u.2G,xy,Cj=Oh[o.1C]&&(1D.x!=a.x||(1D.y!=a.y||(1D.1m!=a.1m||(1D.1w!=a.1w||(1D.cx!=a.cx||(1D.cy!=a.cy||(1D.rx!=a.rx||(1D.ry!=a.ry||1D.r!=a.r)))))))),NH=NF[o.1C]&&(a.cx!=1D.cx||(a.cy!=1D.cy||(a.r!=1D.r||(a.rx!=1D.rx||a.ry!=1D.ry)))),1F=o;1p(K a0 in 1D){if(1D[3S](a0)){a[a0]=1D[a0]}}if(Cj){a.1K=R.Ck[o.1C](o);o.2j.8T=1}1D.5B&&(1u.5B=1D.5B);1D.5b&&(1u.5b=1D.5b);1D.3f&&(1u.3f=1D.3f);1D.mC&&(s.mC=1D.mC);"4W"in 1D&&o.4W(1D.4W);if(1D.1K&&o.1C=="1K"||Cj){1u.1K=NG(~4B(a.1K).3W().5f("r")?R.q4(a.1K):a.1K);if(o.1C=="af"){o.2j.eh=[a.x,a.y];o.2j.km=[a.1m,a.1w];qA(o,1,1,0,0,0)}}"4i"in 1D&&o.4i(1D.4i);if(NH){K cx=+a.cx,cy=+a.cy,rx=+a.rx||(+a.r||0),ry=+a.ry||(+a.r||0);1u.1K=R.7l("ar{0},{1},{2},{3},{4},{1},{4},{1}x",5o((cx-rx)*7s),5o((cy-ry)*7s),5o((cx+rx)*7s),5o((cy+ry)*7s),5o(cx*7s));o.2j.8T=1}if("7c-4L"in 1D){K 4L=4B(1D["7c-4L"]).3R(6e);if(4L.1f==4){4L[2]=+4L[2]+ +4L[0];4L[3]=+4L[3]+ +4L[1];K 2C=1u.qI||R.8J.3m.eB("2C"),jS=2C.2G;jS.7c=R.7l("4L({1}px {2}px {3}px {0}px)",4L);if(!1u.qI){jS.2R="7X";jS.1M=0;jS.2f=0;jS.1m=o.2N.1m+"px";jS.1w=o.2N.1w+"px";1u.3j.7T(2C,1u);2C.4p(1u);1u.qI=2C}}if(!1D["7c-4L"]){1u.qI&&(1u.qI.2G.7c="6a")}}if(o.e6){K mD=o.e6.2G;1D.3e&&(mD.3e=1D.3e);1D["3e-96"]&&(mD.Nt=\'"\'+1D["3e-96"].3R(",")[0].3u(/^[\'"]+|[\'"]+$/g,E)+\'"\');1D["3e-4l"]&&(mD.fE=1D["3e-4l"]);1D["3e-bz"]&&(mD.Np=1D["3e-bz"]);1D["3e-2G"]&&(mD.Nq=1D["3e-2G"])}if("bZ-3a"in 1D){dU(1F,1D["bZ-3a"])}if("bZ-5e"in 1D){dU(1F,1D["bZ-5e"],1)}if(1D.2X!=1d||(1D["2n-1m"]!=1d||(1D.2d!=1d||(1D.4J!=1d||(1D.2n!=1d||(1D["2n-1m"]!=1d||(1D["2n-2X"]!=1d||(1D["2d-2X"]!=1d||(1D["2n-aV"]!=1d||(1D["2n-qB"]!=1d||(1D["2n-kd"]!=1d||1D["2n-et"]!=1d))))))))))){K 2d=1u.eu(kn),ND=1k;2d=2d&&2d[0];!2d&&(ND=2d=eA(kn));if(o.1C=="af"&&1D.4J){2d.4J=1D.4J}1D.2d&&(2d.on=1l);if(2d.on==1d||(1D.2d=="3r"||1D.2d===1d)){2d.on=1k}if(2d.on&&1D.2d){K hm=4B(1D.2d).3y(R.Cf);if(hm){2d.3j==1u&&1u.8e(2d);2d.6o=1l;2d.4J=hm[1];2d.1C="Jg";K 3p=o.7p(1);2d.2R=3p.x+S+3p.y;o.2j.eh=[3p.x,3p.y];R.Cb(hm[1],1a(){o.2j.km=[J.ik,J.9m]})}1j{2d.3Y=R.dI(1D.2d).7b;2d.4J=E;2d.1C="qF";if(R.dI(1D.2d).5q&&((1F.1C in{aK:1,bS:1}||4B(1D.2d).cB()!="r")&&qX(1F,1D.2d,2d))){a.2d="3r";a.4v=1D.2d;2d.6o=1k}}}if("2d-2X"in 1D||"2X"in 1D){K 2X=((+a["2d-2X"]+1||2)-1)*((+a.2X+1||2)-1)*((+R.dI(1D.2d).o+1||2)-1);2X=6T(5E(2X,0),1);2d.2X=2X;if(2d.4J){2d.3Y="3r"}}1u.4p(2d);K 2n=1u.eu("2n")&&1u.eu("2n")[0],Ce=1k;!2n&&(Ce=2n=eA("2n"));if(1D.2n&&1D.2n!="3r"||(1D["2n-1m"]||(1D["2n-2X"]!=1d||(1D["2n-aV"]||(1D["2n-qB"]||(1D["2n-kd"]||1D["2n-et"])))))){2n.on=1l}(1D.2n=="3r"||(1D.2n===1d||(2n.on==1d||(1D.2n==0||1D["2n-1m"]==0))))&&(2n.on=1k);K Ca=R.dI(1D.2n);2n.on&&(1D.2n&&(2n.3Y=Ca.7b));2X=((+a["2n-2X"]+1||2)-1)*((+a.2X+1||2)-1)*((+Ca.o+1||2)-1);K 1m=(4j(1D["2n-1m"])||1)*0.75;2X=6T(5E(2X,0),1);1D["2n-1m"]==1d&&(1m=a["2n-1m"]);1D["2n-1m"]&&(2n.bz=1m);1m&&(1m<1&&((2X*=1m)&&(2n.bz=1)));2n.2X=2X;1D["2n-kd"]&&(2n.15P=1D["2n-kd"]||"15R");2n.qB=1D["2n-qB"]||8;1D["2n-et"]&&(2n.15S=1D["2n-et"]=="mW"?"15K":1D["2n-et"]=="C4"?"C4":"5o");if("2n-aV"in 1D){K aV={"-":"15O",".":"15N","-.":"16J","-..":"16I",". ":"7O","- ":"16K","--":"16M","- .":"16L","--.":"16E","--..":"16D"};2n.16F=aV[3S](1D["2n-aV"])?aV[1D["2n-aV"]]:E}Ce&&1u.4p(2n)}if(1F.1C=="2g"){1F.2N.1Y.2G.4T=E;K 2u=1F.2N.2u,m=100,fE=a.3e&&a.3e.3y(/\\d+(?:\\.\\d*)?(?=px)/);s=2u.2G;a.3e&&(s.3e=a.3e);a["3e-96"]&&(s.Nt=a["3e-96"]);a["3e-bz"]&&(s.Np=a["3e-bz"]);a["3e-2G"]&&(s.Nq=a["3e-2G"]);fE=4j(a["3e-4l"]||fE&&fE[0])||10;s.fE=fE*m+"px";1F.e6.4F&&(2u.ov=4B(1F.e6.4F).3u(/</g,"&#60;").3u(/&/g,"&#38;").3u(/\\n/g,"<br>"));K qz=2u.ra();1F.W=a.w=(qz.8K-qz.2f)/m;1F.H=a.h=(qz.4P-qz.1M)/m;1F.X=a.x;1F.Y=a.y+1F.H/2;("x"in 1D||"y"in 1D)&&(1F.1K.v=R.7l("m{0},{1}l{2},{1}",5o(a.x*7s),5o(a.y*7s),5o(a.x*7s)+1));K Ct=["x","y","2g","3e","3e-96","3e-bz","3e-2G","3e-4l"];1p(K d=0,dd=Ct.1f;d<dd;d++){if(Ct[d]in 1D){1F.2j.8T=1;1s}}3P(a["2g-Cy"]){1q"3a":1F.e6.2G["v-2g-Cs"]="2f";1F.xh=1F.W/2;1s;1q"5e":1F.e6.2G["v-2g-Cs"]="8K";1F.xh=-1F.W/2;1s;5P:1F.e6.2G["v-2g-Cs"]="16R";1F.xh=0;1s}1F.e6.2G["v-2g-16Q"]=1l}},qX=1a(o,4v,2d){o.2t=o.2t||{};K 2t=o.2t,6X=3A.6X,2X,16C,1C="qO",BK=".5 .5";o.2t.4v=4v;4v=4B(4v).3u(R.Co,1a(76,fx,fy){1C="xt";if(fx&&fy){fx=4j(fx);fy=4j(fy);6X(fx-0.5,2)+6X(fy-0.5,2)>0.25&&(fy=4g.bt(0.25-6X(fx-0.5,2))*((fy>0.5)*2-1)+0.5);BK=fx+S+fy}1b E});4v=4v.3R(/\\s*\\-\\s*/);if(1C=="qO"){K 8m=4v.dP();8m=-4j(8m);if(9B(8m)){1b 1d}}K 5S=R.BM(4v);if(!5S){1b 1d}o=o.ed||o.1u;if(5S.1f){o.8e(2d);2d.on=1l;2d.4h="3r";2d.3Y=5S[0].3Y;2d.16j=5S[5S.1f-1].3Y;K xr=[];1p(K i=0,ii=5S.1f;i<ii;i++){5S[i].2v&&xr.1G(5S[i].2v+S+5S[i].3Y)}2d.16i=xr.1f?xr.5x():"0% "+2d.3Y;if(1C=="xt"){2d.1C="16m";2d.3k="100%";2d.16l="0 0";2d.16y=BK;2d.8m=0}1j{2d.1C="4v";2d.8m=(16x-8m)%9G}o.4p(2d)}1b 1},bC=1a(1u,6K){J[0]=J.1u=1u;1u.4E=1l;J.id=R.BN++;1u.BJ=J.id;J.X=0;J.Y=0;J.2t={};J.2N=6K;J.5d=R.5d();J.2j={4i:[],sx:1,sy:1,dx:0,dy:0,4X:0,8T:1,hF:1};!6K.4P&&(6K.4P=J);J.49=6K.1M;6K.1M&&(6K.1M.3C=J);6K.1M=J;J.3C=1d};K 3x=R.el;bC.3g=3x;3x.5K=bC;3x.4i=1a(bP){if(bP==1d){1b J.2j.4i}K jD=J.2N.Jj,Of=jD?"s"+[jD.7Z,jD.7Z]+"-1-1t"+[jD.dx,jD.dy]:E,xg;if(jD){xg=bP=4B(bP).3u(/\\.{3}|\\BF/g,J.2j.4i||E)}R.BE(J,Of+bP);K 5d=J.5d.6w(),9j=J.9j,o=J.1u,3R,BI=~4B(J.2t.2d).5f("-"),Ob=!4B(J.2t.2d).5f("5l(");5d.hE(1,1);if(Ob||(BI||J.1C=="af")){9j.5d="1 0 0 1";9j.2v="0 0";3R=5d.3R();if(BI&&3R.Oc||!3R.BH){o.2G.42=5d.Od();K bb=J.7p(),BG=J.7p(1),dx=bb.x-BG.x,dy=bb.y-BG.y;o.kY=dx*-7s+S+dy*-7s;qA(J,1,1,dx,dy,0)}1j{o.2G.42=E;qA(J,3R.hw,3R.gl,3R.dx,3R.dy,3R.6o)}}1j{o.2G.42=E;9j.5d=4B(5d);9j.2v=5d.2v()}xg&&(J.2j.4i=xg);1b J};3x.6o=1a(4X,cx,cy){if(J.5R){1b J}if(4X==1d){1b}4X=4B(4X).3R(6e);if(4X.1f-1){cx=4j(4X[1]);cy=4j(4X[2])}4X=4j(4X[0]);cy==1d&&(cx=cy);if(cx==1d||cy==1d){K 3p=J.7p(1);cx=3p.x+3p.1m/2;cy=3p.y+3p.1w/2}J.2j.hF=1;J.4i(J.2j.4i.4b([["r",4X,cx,cy]]));1b J};3x.hE=1a(dx,dy){if(J.5R){1b J}dx=4B(dx).3R(6e);if(dx.1f-1){dy=4j(dx[1])}dx=4j(dx[0])||0;dy=+dy||0;if(J.2j.3p){J.2j.3p.x+=dx;J.2j.3p.y+=dy}J.4i(J.2j.4i.4b([["t",dx,dy]]));1b J};3x.7Z=1a(sx,sy,cx,cy){if(J.5R){1b J}sx=4B(sx).3R(6e);if(sx.1f-1){sy=4j(sx[1]);cx=4j(sx[2]);cy=4j(sx[3]);9B(cx)&&(cx=1d);9B(cy)&&(cy=1d)}sx=4j(sx[0]);sy==1d&&(sy=sx);cy==1d&&(cx=cy);if(cx==1d||cy==1d){K 3p=J.7p(1)}cx=cx==1d?3p.x+3p.1m/2:cx;cy=cy==1d?3p.y+3p.1w/2:cy;J.4i(J.2j.4i.4b([["s",sx,sy,cx,cy]]));J.2j.hF=1;1b J};3x.3B=1a(){!J.5R&&(J.1u.2G.4T="3r");1b J};3x.5k=1a(){!J.5R&&(J.1u.2G.4T=E);1b J};3x.qv=1a(){if(J.5R){1b{}}1b{x:J.X+(J.xh||0)-J.W/2,y:J.Y-J.H,1m:J.W,1w:J.H}};3x.3M=1a(){if(J.5R||!J.1u.3j){1b}J.2N.7z&&J.2N.7z.BX(J);R.3l.8Q("4E.*.*."+J.id);R.C3(J,J.2N);J.1u.3j.8e(J.1u);J.ed&&J.ed.3j.8e(J.ed);1p(K i in J){J[i]=2A J[i]=="1a"?R.pJ(i):1d}J.5R=1l};3x.1n=1a(1x,1o){if(J.5R){1b J}if(1x==1d){K 1F={};1p(K a in J.2t){if(J.2t[3S](a)){1F[a]=J.2t[a]}}1F.4v&&(1F.2d=="3r"&&((1F.2d=1F.4v)&&4r 1F.4v));1F.4i=J.2j.4i;1b 1F}if(1o==1d&&R.is(1x,"4F")){if(1x==kn&&(J.2t.2d=="3r"&&J.2t.4v)){1b J.2t.4v}K 8d=1x.3R(6e),2E={};1p(K i=0,ii=8d.1f;i<ii;i++){1x=8d[i];if(1x in J.2t){2E[1x]=J.2t[1x]}1j{if(R.is(J.2N.9S[1x],"1a")){2E[1x]=J.2N.9S[1x].O0}1j{2E[1x]=R.lv[1x]}}}1b ii-1?2E:2E[8d[0]]}if(J.2t&&(1o==1d&&R.is(1x,"4u"))){2E={};1p(i=0,ii=1x.1f;i<ii;i++){2E[1x[i]]=J.1n(1x[i])}1b 2E}K 1D;if(1o!=1d){1D={};1D[1x]=1o}1o==1d&&(R.is(1x,"1A")&&(1D=1x));1p(K 1r in 1D){3l("4E.1n."+1r+"."+J.id,J,1D[1r])}if(1D){1p(1r in J.2N.9S){if(J.2N.9S[3S](1r)&&(1D[3S](1r)&&R.is(J.2N.9S[1r],"1a"))){K a0=J.2N.9S[1r].3v(J,[].4b(1D[1r]));J.2t[1r]=1D[1r];1p(K dq in a0){if(a0[3S](dq)){1D[dq]=a0[dq]}}}}if(1D.2g&&J.1C=="2g"){J.e6.4F=1D.2g}fF(J,1D)}1b J};3x.NZ=1a(){!J.5R&&J.1u.3j.4p(J.1u);J.2N&&(J.2N.1M!=J&&R.BW(J,J.2N));1b J};3x.Je=1a(){if(J.5R){1b J}if(J.1u.3j.8G!=J.1u){J.1u.3j.7T(J.1u,J.1u.3j.8G);R.BS(J,J.2N)}1b J};3x.gM=1a(1g){if(J.5R){1b J}if(1g.5K==R.st.5K){1g=1g[1g.1f-1]}if(1g.1u.jA){1g.1u.3j.7T(J.1u,1g.1u.jA)}1j{1g.1u.3j.4p(J.1u)}R.BR(J,1g,J.2N);1b J};3x.7T=1a(1g){if(J.5R){1b J}if(1g.5K==R.st.5K){1g=1g[0]}1g.1u.3j.7T(J.1u,1g.1u);R.BQ(J,1g,J.2N);1b J};3x.4W=1a(4l){K s=J.1u.19S,f=s.42;f=f.3u(JD,E);if(+4l!==0){J.2t.4W=4l;s.42=f+S+ms+".JA(19V="+(+4l||1.5)+")";s.k6=R.7l("-{0}px 0 0 -{0}px",5o(+4l||1.5))}1j{s.42=f;s.k6=0;4r J.2t.4W}1b J};R.5p.1K=1a(9L,6K){K el=eA("ed");el.2G.i7=zX;el.xS=7s+S+7s;el.kY=6K.kY;K p=1T bC(el,6K),1n={2d:"3r",2n:"#e0"};9L&&(1n.1K=9L);p.1C="1K";p.1K=[];p.dv=E;fF(p,1n);6K.1Y.4p(el);K 9j=eA("9j");9j.on=1l;el.4p(9j);p.9j=9j;p.4i(E);1b p};R.5p.4L=1a(6K,x,y,w,h,r){K 1K=R.BU(x,y,w,h,r),1F=6K.1K(1K),a=1F.2t;1F.X=a.x=x;1F.Y=a.y=y;1F.W=a.1m=w;1F.H=a.1w=h;a.r=r;a.1K=1K;1F.1C="4L";1b 1F};R.5p.bS=1a(6K,x,y,rx,ry){K 1F=6K.1K(),a=1F.2t;1F.X=x-rx;1F.Y=y-ry;1F.W=rx*2;1F.H=ry*2;1F.1C="bS";fF(1F,{cx:x,cy:y,rx:rx,ry:ry});1b 1F};R.5p.aK=1a(6K,x,y,r){K 1F=6K.1K(),a=1F.2t;1F.X=x-r;1F.Y=y-r;1F.W=1F.H=r*2;1F.1C="aK";fF(1F,{cx:x,cy:y,r:r});1b 1F};R.5p.af=1a(6K,4J,x,y,w,h){K 1K=R.BU(x,y,w,h),1F=6K.1K(1K).1n({2n:"3r"}),a=1F.2t,1u=1F.1u,2d=1u.eu(kn)[0];a.4J=4J;1F.X=a.x=x;1F.Y=a.y=y;1F.W=a.1m=w;1F.H=a.1w=h;a.1K=1K;1F.1C="af";2d.3j==1u&&1u.8e(2d);2d.6o=1l;2d.4J=4J;2d.1C="Jg";1F.2j.eh=[x,y];1F.2j.km=[w,h];1u.4p(2d);qA(1F,1,1,0,0,0);1b 1F};R.5p.2g=1a(6K,x,y,2g){K el=eA("ed"),1K=eA("1K"),o=eA("e6");x=x||0;y=y||0;2g=2g||"";1K.v=R.7l("m{0},{1}l{2},{1}",5o(x*7s),5o(y*7s),5o(x*7s)+1);1K.1a4=1l;o.4F=4B(2g);o.on=1l;el.2G.i7=zX;el.xS=7s+S+7s;el.kY="0 0";K p=1T bC(el,6K),1n={2d:"#e0",2n:"3r",3e:R.lv.3e,2g:2g};p.ed=el;p.1K=1K;p.e6=o;p.1C="2g";p.2t.2g=4B(2g);p.2t.x=x;p.2t.y=y;p.2t.w=1;p.2t.h=1;fF(p,1n);el.4p(o);el.4p(1K);6K.1Y.4p(el);K 9j=eA("9j");9j.on=1l;el.4p(9j);p.9j=9j;p.4i(E);1b p};R.5p.nI=1a(1m,1w){K cs=J.1Y.2G;J.1m=1m;J.1w=1w;1m==+1m&&(1m+="px");1w==+1w&&(1w+="px");cs.1m=1m;cs.1w=1w;cs.7c="4L(0 "+1m+" "+1w+" 0)";if(J.iA){R.5p.iw.3v(J,J.iA)}1b J};R.5p.iw=1a(x,y,w,h,cn){R.3l("4E.iw",J,J.iA,[x,y,w,h,cn]);K 1m=J.1m,1w=J.1w,4l=1/ 5E(w /1m,h/1w),H,W;if(cn){H=1w/h;W=1m/w;if(w*H<1m){x-=(1m-w*H)/ 2 /H}if(h*W<1w){y-=(1w-h*W)/ 2 /W}}J.iA=[x,y,w,h,!!cn];J.Jj={dx:-x,dy:-y,7Z:4l};J.ag(1a(el){el.4i("...")});1b J};K eA;R.5p.xT=1a(5U){K 3m=5U.2K;3m.1ba().1b3(".lB","Jw:5l(#5P#kl)");6E{!3m.cF.lB&&3m.cF.5L("lB","JH:JM-JF-zP:6K");eA=1a(6J){1b 3m.eB("<lB:"+6J+\' 2s="lB">\')}}6I(e){eA=1a(6J){1b 3m.eB("<"+6J+\' gK="JH:JM-JF.zP:6K" 2s="lB">\')}}};R.5p.xT(R.8J.5U);R.5p.8E=1a(){K cO=R.zY.3v(0,2F),3E=cO.3E,1w=cO.1w,s,1m=cO.1m,x=cO.x,y=cO.y;if(!3E){98 1T 9Z("kl 3E 6r a4.")}K 1F=1T R.zV,c=1F.1Y=R.8J.3m.eB("2C"),cs=c.2G;x=x||0;y=y||0;1m=1m||vL;1w=1w||Jd;1F.1m=1m;1F.1w=1w;1m==+1m&&(1m+="px");1w==+1w&&(1w+="px");1F.xS=7s*9i+S+7s*9i;1F.kY="0 0";1F.2u=R.8J.3m.eB("2u");1F.2u.2G.i7="2R:7X;2f:-l4;1M:-l4;KS:0;k6:0;cc-1w:1;";c.4p(1F.2u);cs.i7=R.7l("1M:0;2f:0;1m:{0};1w:{1};4T:KN-5J;2R:r7;7c:4L(0 {0} {1} 0);e9:6f",1m,1w);if(3E==1){R.8J.3m.3H.4p(c);cs.2f=x+"px";cs.1M=y+"px";cs.2R="7X"}1j{if(3E.8G){3E.7T(c,3E.8G)}1j{3E.4p(c)}}1F.xF=1a(){};1b 1F};R.3g.9J=1a(){R.3l("4E.9J",J);J.1Y.ov=E;J.2u=R.8J.3m.eB("2u");J.2u.2G.i7="2R:7X;2f:-l4;1M:-l4;KS:0;k6:0;cc-1w:1;4T:KN;";J.1Y.4p(J.2u);J.4P=J.1M=1d};R.3g.3M=1a(){R.3l("4E.3M",J);J.1Y.3j.8e(J.1Y);1p(K i in J){J[i]=2A J[i]=="1a"?R.pJ(i):1d}1b 1l};K 7S=R.st;1p(K 4h in 3x){if(3x[3S](4h)&&!7S[3S](4h)){7S[4h]=1a(gP){1b 1a(){K 4M=2F;1b J.ag(1a(el){el[gP].3v(el,4M)})}}(4h)}}})();xC.zS?g.5U.c4=R:c4=R;1b R});K K9=1a(Av){J.3Y=1d;J.Ab=1d;J.bg=1d;J.cc=1d;J.A7=1d;J.3a=1d;J.A2=1d;J.5e=1d;J.1A=1d;J.8V=1d;J.Aw=1a(Av){};J.Aw(Av)};1a 7p(1y){K 5N={x:0,y:0,1m:0,1w:0};if(!1y.1f){1b 5N}K o=1y[0];1a wD(1g,KE){5N={x:0,y:0,1m:1g.nN,1w:1g.lW};4x(1g){if(1g.id==KE){1s}5N.x+=1g.9s-1g.57+1g.lb;5N.y+=1g.9x-1g.4O+1g.mh;1g=1g.eR}1b 5N}if(o.6J=="TR"){5N=wD(o,"qb-ui-1Y")}1j{if(o.6J=="T0"){5N=wD(o,"qb-ui-1Y")}1j{if(o.6J=="199"){5N=wD(o,"qb-ui-1Y")}}}1b 5N}1a gX(x){1b 3A.5o(x*9i)/9i}1a Lb(hG,hK){K KI=15;K p1=[{x:hG.x,y:hG.y+hG.1w/ 2}, {x:hG.x + hG.1m, y:hG.y + hG.1w /2}];K p2=[{x:hK.x,y:hK.y+hK.1w/ 2}, {x:hK.x + hK.1m, y:hK.y + hK.1w /2}];K d=[],pt=[];1p(K i1=0;i1<p1.1f;i1++){1p(K i2=0;i2<p2.1f;i2++){K dx=3A.4G(p1[i1].x-p2[i2].x);K dy=3A.4G(p1[i1].y-p2[i2].y);K 6A=dx*dx+dy*dy;pt.1G(6A);d.1G({i1:i1,i2:i2})}}K 1F={i1:0,i2:0};K wu=-1;K 6d=-1;1p(K i=0;i<pt.1f;i++){if(6d==-1||pt[i]<6d){6d=pt[i];wu=i}}if(wu>0){1F=d[wu]}K x1=p1[1F.i1].x,y1=p1[1F.i1].y,x4=p2[1F.i2].x,y4=p2[1F.i2].y,y2=y1,y3=y4;K dx=3A.4n(3A.4G(x1-x4)/2,KI);K x2=[x1-dx,x1+dx][1F.i1];K x3=[x4-dx,x4+dx][1F.i2];1b{x1:gX(x1),y1:gX(y1),x2:gX(x2),y2:gX(y2),x3:gX(x3),y3:gX(y3),x4:gX(x4),y4:gX(y4)}}1a 18Z(5N,Lq){K R=c4==1d?bk:c4;K 4A=5N;if(R.is(5N,"1a")){1b Lq?4A():3l.on("4E.mz",4A)}1j{if(R.is(4A,1l)){1b R.5p.8E[5N](R,4A.5X(0,3+R.is(4A[0],1d))).5L(4A)}1j{K 2w=3Q.3g.4d.2J(2F,0);if(R.is(2w[2w.1f-1],"1a")){K f=2w.eJ();1b 4A?f.2J(R.5p.8E[5N](R,2w)):3l.on("4E.mz",1a(){f.2J(R.5p.8E[5N](R,2w))})}1j{1b R.5p.8E[5N](R,2F)}}}}c4.fn.zW=1a(2k){if(!2k.5v||!2k.5y){1b 1k}if(!2k.5v.28||!2k.5y.28){1b 1k}if(!2k.5v.28.1g||!2k.5y.28.1g){1b 1k}K bX=2k.8V;K A9=8;K 3Y=bX.3Y;K K1=2k.5v.4R;K K5=2k.5y.4R;1a Ao(2k){K eW=7p(2k.28.1g);if(2k.1I){K gW=7p(2k.1I.1g);eW.x=gW.x-1;eW.1m=gW.1m+2;if(eW.y<gW.y){eW.y=gW.y}1j{if(eW.y>gW.y+gW.1w-eW.1w){eW.y=gW.y+gW.1w-eW.1w}}}1b eW}K Lc=Ao(2k.5v);K K3=Ao(2k.5y);K 8l=Lb(Lc,K3);K A8=8l.x1<8l.x2?1:-1;K Ac=8l.x4<8l.x3?1:-1;K 1K=["M",8l.x1,8l.y1,"L",8l.x1+A9*A8,8l.y1,"C",8l.x2,8l.y2,8l.x3,8l.y3,8l.x4+A9*Ac,8l.y4,"L",8l.x4,8l.y4].5x(",");bX.3a=pP(bX.3a,K5,3Y,8l.x1,8l.y1,A8);bX.5e=pP(bX.5e,K1,3Y,8l.x4,8l.y4,Ac);if(bX.1K=1K&&(bX.cc&&bX.bg)){bX.bg.1n({1K:1K});bX.cc.1n({1K:1K});$(bX.bg.1u).2r("2k-2V")}1b 1l};c4.fn.zW;c4.fn.Sa=1a(1y,1n){K 2k=1T K9;2k.3Y=1n.3R("|")[0]||"#Ka";2k.Ab=1n.3R("|")[1]||3;2k.K7=15;2k.cc=J.1K("M,0,0").1n({2n:2k.3Y,2d:"3r","2n-1m":2k.Ab,"2n-et":"5o","2n-kd":"5o"});2k.bg=J.1K("M,0,0").1n({2n:2k.3Y,2d:"3r","2n-1m":2k.K7,"2n-2X":0.JR});2k.A7=1y.5y.4R;2k.3a=pP(1d,2k.A7,2k.3Y);2k.A2=1y.5v.4R;2k.5e=pP(1d,2k.A2,2k.3Y);2k.1A=1y;1b 2k};1a pP(1y,1C,3Y,x,y,d){if(!x){x=0}if(!y){y=0}if(!d){d=1}K x8=1k;if(1y!=1d&&1y.1u){3P(1C){1q 1S.8A.ec:x8=1y.1u.9h!="aK";1s;1q 1S.8A.fb:x8=1y.1u.9h!="1K";1s}}if(x8){if(1y&&1y.3M){1y.3M()}1y=1d}if(1y==1d){3P(1C){1q 1S.8A.ec:1y=QB.1e.2i.r.aK(0,0,5);1y.1n({2d:3Y,"2n-1m":0});1s;1q 1S.8A.fb:1y=QB.1e.2i.r.1K("M,0,0");1y.1n({2d:3Y,"2n-1m":0});1s}}3P(1C){1q 1S.8A.ec:1y.1n({cx:x,cy:y});1s;1q 1S.8A.fb:K dx=8;K dy=5;K 1K=["M",x,y,"L",x,y+1,x+dx*d,y+dy,x+dx*d,y-dy,x,y-1,"Z"].5x(",");1y.1n({1K:1K});1s}1b 1y};K TL=1l;1a 18w(1A,1N,7F){if(2A 1A.dw!="2y"){1A.dw(1N,7F,1k)}1j{if(2A 1A.kb!="2y"){1A.kb("on"+1N,7F)}1j{98"JQ A5"}}}1a 18v(1A,1N,7F){if(2A 1A.s4!="2y"){1A.s4(1N,7F,1k)}1j{if(2A 1A.A6!="2y"){1A.A6("on"+1N,7F)}1j{98"JQ A5"}}}1a 18I(fn){K 2D=3z.dw||3z.kb?3z:2K.dw?2K:2K.1P||1d;if(2D){if(2D.dw){2D.dw("Ak",fn,1k)}1j{if(2D.kb){2D.kb("k8",fn)}}}1j{if(2A 3z.k8=="1a"){K iV=3z.k8;3z.k8=1a(){iV();fn()}}1j{3z.k8=fn}}}K wR=[];K Al=1k;1a 18H(fn){if(!Al){wR.1G(fn)}1j{fn()}}1a W2(){Al=1l;1p(K i=0;i<wR.1f;i++){wR[i]()}};K Kc=0;if(!3Q.5f){3Q.3g.5f=1a(1y){1p(K i=0;i<J.1f;i++){if(J[i]==1y){1b i}}1b-1}}4w={yj:1a(){1b++Kc},3X:1a(1y){if(1y==2y||1y==1d){1b""}1b 1y.3X()}};4w.oW=1a(4J,bf){K p,v;1p(p in 4J){if(2A 4J[p]==="1a"){bf[p]=4J[p]}1j{v=4J[p];bf[p]=v}}1b bf};4w.RX=1a(4J,bf){K p,v;1p(p in 4J){if(bf[p]===2y){aN}if(2A 4J[p]==="1a"){bf[p]=4J[p]}1j{v=4J[p];bf[p]=v}}1b bf};4w.Hu=1a($1g,3G){if($1g.1f&&!1B(3G)){$1g.1n("6s-3G",3G.3u(/&2q;/g," ").3u(/&DO;/g,"&"))}};4w.Ku=1a(4J,bf){K p,v;1p(p in 4J){if(2A 4J[p]==="1a"){bf[p]=4J[p]}1j{if(4J.87(p)){v=4J[p];if(v&&"1A"===2A v){bf[p]=4w.Kt(v)}1j{bf[p]=v}}}}1b bf};4w.Kt=1a(o){if(!o||"1A"!==2A o){1b o}K c=o g6 3Q?[]:{};1b 4w.Ku(o,c)};4w.18J=1a(el,1P){K 1O={2f:el.57,1m:el.rJ,1M:el.4O,1w:el.gy};1O.8K=1O.1m-1O.2f;1O.4P=1O.1w-1O.1M;if(1P){1O=4w.Ai(1O,1P)}1b 1O};4w.hJ=1a(el,1P){K r=el.ra();K 1O={2f:3A.bj(r.2f),8K:3A.bj(r.8K),1M:3A.bj(r.1M),4P:3A.bj(r.4P)};if(!r.1m){1O.1m=r.8K-r.2f}1j{1O.1m=r.1m}if(!r.1w){1O.1w=r.4P-r.1M}1j{1O.1w=r.1w}if(1P){1O=4w.Ai(1O,1P)}1b 1O};4w.Ai=1a(r,p){1b{2f:r.2f-p.2f,1M:r.1M-p.1M,8K:r.8K-p.2f,4P:r.4P-p.1M,1w:r.1w,1m:r.1m}};4w.18L=1a(4s){K 4n=0;$(4s).2p(1a(){4n=3A.4n(4n,$(J).1w())}).1w(4n)};4w.18K=1a(4s){K 4n=0;$(4s).2p(1a(){4n=3A.4n(4n,$(J).1m())}).1m(4n)};4w.18D=1a(1y){if(1y){if(2A 1y=="4F"){if(1y!=""){1b 1y}}}1b""};4w.bo=1a(gv,1y){if(1y){if(2A 1y=="4F"){if(1y!=""){gv.1G(1y)}}}};2I.fn.cK=1a(1o){K io=J.1n("1C");io=1B(io)?"":io.3W();if(1o===2y){if(io=="9f"){1b J[0].4q}1j{if(io=="9Y"){if(J[0].4q){1b J.1n("1o")}1j{1b 1d}}}1b J.2b()}if(io=="9f"){if(1o==1l&&!J.1n("4q")){J.1n("4q","4q")}if(1o!=1l&&J.1n("4q")){J.lL("4q")}if(1o==1l&&!J.6U("4q")){J.6U("4q",1l)}if(1o!=1l&&J.6U("4q")){J.6U("4q",1k)}1b}1j{if(io=="9Y"){K Kr=J.1n("1o");if(Kr==1o){J.1n("4q","1l");J[0].4q=1l}1j{J.lL("4q")}1b}1j{K 6J="";if(!1B(J[0])&&!1B(J[0].6J)){6J=J[0].6J}if(6J.3W()=="2x"){J.wP(1B(1o)?"":1o.3X());1b}}}if(1o==1d){1o=""}J.2b(1o)};2I.fn.19D=1a(r5){if(!J[0]){1b{1M:0,2f:0}}if(J[0]===J[0].wI.3H){1b 2I.2v.19C(J[0])}2I.2v.rh||2I.2v.dT();if(2A r5=="4F"){if(r5!=""){K 1P=J.7u(r5);if(1P.1f){4r 1P}}}1j{K 1P=r5}K 4e=J[0],eR=4e.eR,Kz=4e,3m=4e.wI,iq,fU=3m.9l,3H=3m.3H,m6=3m.m6,qZ=m6.wW(4e,1d),1M=4e.9x,2f=4e.9s;4x((4e=4e.3j)&&(4e!==3H&&4e!==fU)){iq=m6.wW(4e,1d);1M-=4e.4O,2f-=4e.57;if(4e===eR){1M+=4e.9x,2f+=4e.9s;if(2I.2v.19x&&!(2I.2v.19z&&/^t(Ul|d|h)$/i.9A(4e.6J))){1M+=6u(iq.Gu,10)||0,2f+=6u(iq.GK,10)||0}Kz=eR,eR=4e.eR}if(2I.2v.19A&&iq.e9!=="6v"){1M+=6u(iq.Gu,10)||0,2f+=6u(iq.GK,10)||0}qZ=iq;if($.wz(4e,1P)>=0){1s}}if(qZ.2R==="r7"||qZ.2R==="Kv"){1M+=3H.9x,2f+=3H.9s}if(qZ.2R==="Kx"){1M+=3A.4n(fU.4O,3H.4O),2f+=3A.4n(fU.57,3H.57)}1b{1M:1M,2f:2f}};1a 19I(3h,Ag){if(2F.1f>2){K Ah=[];1p(K n=2;n<2F.1f;++n){Ah.1G(2F[n])}1b 1a(){1b Ag.3v(3h,Ah)}}1j{1b 1a(){1b Ag.2J(3h)}}}K gF=1a(a,b){if(1B(a)){a={}}if(1B(b)){b={}}K 1O={};$.4C(1O,a,b);1b 1O};K v4=1a(1y,28){K gv=1y[28];if(gv!=1d&&gv.1f>0){1b gv}4r 1y[28];1b 1d};K 1B=1a(1y){if(1y===2y){1b 1l}if(1y==1d){1b 1l}if(1y===""){1b 1l}1b 1k};K lU=1a(82){if(!1B(82)){1b 82.3W()}1b 82};K 19i=1a(82){if(!1B(82)){1b 82.9p()}1b 82};K 2q=1a(1y){if(1y===2y){1b""}if(1y==1d){1b""}if(1y==""){1b""}1b 1y.3u(/ /g,"&2q;")};1a Kf(gg,ge,gr){1b 1a(a,b){if(!1B(gg)&&a[gg]<b[gg]){1b-1}if(!1B(gg)&&a[gg]>b[gg]){1b 1}if(!1B(ge)&&a[ge]<b[ge]){1b-1}if(!1B(ge)&&a[ge]>b[ge]){1b 1}if(!1B(gr)&&a[gr]<b[gr]){1b-1}if(!1B(gr)&&a[gr]>b[gr]){1b 1}1b 0}}3Q.3g.ud=1a(gg,ge,gr){1b J.hQ(Kf(gg,ge,gr))};K dX=1a(a,b){if(1B(a)&&1B(b)){1b 1l}if(1B(a)||1B(b)){1b 1k}1b a.3W()==b.3W()};4w.yq=1a(a,b){if(1B(a)&&1B(b)){1b 1l}1b a==b};1a 4C(rO,4V){K F=1a(){};F.3g=4V.3g;rO.3g=1T F;rO.3g.5K=rO;rO.19d=4V.3g}1a 19c(Kn,cE){1p(K 4h in cE){Kn.3g[4h]=cE[4h]}}5Y.3g.7l=1a(7l){K yY="";K 3u=5Y.lJ;1p(K i=0;i<7l.1f;i++){K wh=7l.cB(i);if(3u[wh]){yY+=3u[wh].2J(J)}1j{yY+=wh}}1b yY};5Y.lJ={VX:["19v","19u","19n","19m","Vv","19o","19q","19p","19t","19r","19s","19f"],VV:["19g","19e","19k","19l","Vv","19j","19h","19w","19K","19L","19J","19H"],VO:["19P","19Q","19O","19M","19N","19B","19y"],VN:["19F","19G","19E","18F","18G","18E","18C"],d:1a(){1b(J.gc()<10?"0":"")+J.gc()},D:1a(){1b 5Y.lJ.VO[J.wS()]},j:1a(){1b J.gc()},l:1a(){1b 5Y.lJ.VN[J.wS()]},N:1a(){1b J.wS()+1},S:1a(){1b J.gc()%10==1&&J.gc()!=11?"st":J.gc()%10==2&&J.gc()!=12?"nd":J.gc()%10==3&&J.gc()!=13?"rd":"th"},w:1a(){1b J.wS()},z:1a(){1b"ib pQ kc"},W:1a(){1b"ib pQ kc"},F:1a(){1b 5Y.lJ.VV[J.lP()]},m:1a(){1b(J.lP()<9?"0":"")+(J.lP()+1)},M:1a(){1b 5Y.lJ.VX[J.lP()]},n:1a(){1b J.lP()+1},t:1a(){1b"ib pQ kc"},L:1a(){1b J.s7()%4==0&&J.s7()%100!=0||J.s7()%pZ==0?"1":"0"},o:1a(){1b"ib kc"},Y:1a(){1b J.s7()},y:1a(){1b(""+J.s7()).7x(2)},a:1a(){1b J.hX()<12?"am":"pm"},A:1a(){1b J.hX()<12?"AM":"PM"},B:1a(){1b"ib pQ kc"},g:1a(){1b J.hX()%12||12},G:1a(){1b J.hX()},h:1a(){1b((J.hX()%12||12)<10?"0":"")+(J.hX()%12||12)},H:1a(){1b(J.hX()<10?"0":"")+J.hX()},i:1a(){1b(J.VJ()<10?"0":"")+J.VJ()},s:1a(){1b(J.VM()<10?"0":"")+J.VM()},e:1a(){1b"ib pQ kc"},I:1a(){1b"ib kc"},O:1a(){1b(-J.gY()<0?"-":"+")+(3A.4G(J.gY()/ 60) < 10 ? "0" : "") + 3A.4G(J.gY() /60)+"18u"},P:1a(){1b(-J.gY()<0?"-":"+")+(3A.4G(J.gY()/ 60) < 10 ? "0" : "") + 3A.4G(J.gY() /60)+":"+(3A.4G(J.gY()%60)<10?"0":"")+3A.4G(J.gY()%60)},T:1a(){K m=J.lP();J.V0(0);K 1O=J.18s().3u(/^.+ \\(?([^\\)]+)\\)?$/,"$1");J.V0(m);1b 1O},Z:1a(){1b-J.gY()*60},c:1a(){1b J.7l("Y-m-d")+"T"+J.7l("H:i:sP")},r:1a(){1b J.3X()},U:1a(){1b J.Ug()/9i}};2I.fn.4K=1a(1C,1h,fn,cW){if(2A 1C==="1A"){1p(K 1r in 1C){J.2S(1r,1h,1C[1r],fn)}1b J}if(2I.ch(1h)){cW=fn;fn=1h;1h=2y}fn=cW===2y?fn:2I.1N.U2(fn,cW);1b 1C==="18t"?J.tF(1C,1h,fn,cW):J.2p(1a(){2I.1N.5L(J,1C,fn,1h)})};2I.fn.18A=1a(1C,1h,fn,cW){if(2I.ch(1h)){if(fn!==2y){cW=fn}fn=1h;1h=2y}2I(J.2V).2S(18B(1C,J.4s),{1h:1h,4s:J.4s,18z:1C},fn,cW);1b J};2I.1N.U2=1a(fn,b4,cW){if(b4!==2y&&!2I.ch(b4)){cW=b4;b4=2y}b4=b4||1a(){1b fn.3v(cW!==2y?cW:J,2F)};b4.8f=fn.8f=fn.8f||(b4.8f||J.8f++);1b b4};3Q.3g.3M=1a(2L,to){if(2A 2L=="1A"){2L=J.5f(2L)}J.5X(2L,!to||1+to-2L+(!(to<0^2L>=0)&&(to<0||-1)*J.1f));1b J.1f};K U3={"&":"&DO;","<":"&lt;",">":"&gt;",\'"\':"&18x;","\'":"&#39;","/":"&#18y;"};o6=1a(s){if(1B(s)){1b s}1b(s+"").3u(/[&<>"\'\\/]/g,1a(s){1b U3[s]})};if(!5c.95){5c.95=1a(){K 87=5c.3g.87,Ua=!{3X:1d}.x5("3X"),x6=["3X","AD","TY","87","TX","x5","5K"],U9=x6.1f;1b 1a(1y){if(2A 1y!=="1A"&&(2A 1y!=="1a"||1y===1d)){98 1T xG("5c.95 x7 on 18M-1A")}K 1O=[],6U,i;1p(6U in 1y){if(87.2J(1y,6U)){1O.1G(6U)}}if(Ua){1p(i=0;i<U9;i++){if(87.2J(1y,x6[i])){1O.1G(x6[i])}}}1b 1O}}()}(1a($){$.2p(["5k","3B"],1a(i,ev){K el=$.fn[ev];$.fn[ev]=1a(){K 1O=el.3v(J,2F);J.1R(ev);1b 1O}})})(2I);(1a(bJ){if(2A aS==="1a"&&aS.wN){aS(["fc"],bJ)}1j{if(2A j4!=="2y"&&j4.wy){j4.wy=bJ(190("fc"))}1j{bJ(2I)}}})(1a($){K $fm=$.fm=1a(3f,5D,3i){1b $(3z).fm(3f,5D,3i)};$fm.bk={aZ:"xy",5D:0,AI:1l};1a AH(4e){1b!4e.9h||$.wz(4e.9h.3W(),["eF","#2K","3J","3H"])!==-1}$.fn.Uq=1a(3t){J.2p(1a(1W,4e){if(4e.sb){K dz=4e.sb();dz.RA(1l);dz.Rz("vM",3t);dz.Rt("vM",3t);dz.2x()}1j{if(4e.w1){4e.w1(3t,3t)}}if(4e.57){4e.57=0}});1b J};$.fn.fm=1a(3f,5D,3i){if(2A 5D==="1A"){3i=5D;5D=0}if(2A 3i==="1a"){3i={UO:3i}}if(3f==="4n"){3f=191}3i=$.4C({},$fm.bk,3i);5D=5D||3i.5D;K eg=3i.eg&&3i.aZ.1f>1;if(eg){5D/=2}3i.2v=wK(3i.2v);3i.fz=wK(3i.fz);1b J.2p(1a(){if(3f===1d){1b}K 5U=AH(J),4e=5U?J.18X||3z:J,$4e=$(4e),8Z=3f,1n={},wB;3P(2A 8Z){1q"d8":;1q"4F":if(/^([+-]=?)?\\d+(\\.\\d+)?(px|%)?$/.9A(8Z)){8Z=wK(8Z);1s}8Z=5U?$(8Z):$(8Z,4e);if(!8Z.1f){1b};1q"1A":if(8Z.is||8Z.2G){wB=(8Z=$(8Z)).2v()}}K 2v=$.ch(3i.2v)&&3i.2v(4e,8Z)||3i.2v;$.2p(3i.aZ.3R(""),1a(i,aZ){K p7=aZ==="x"?"5v":"18Y",3t=p7.3W(),1r="9v"+p7,49=$4e[1r](),4n=$fm.4n(4e,aZ);if(wB){1n[1r]=wB[3t]+(5U?0:49-$4e.2v()[3t]);if(3i.k6){1n[1r]-=6u(8Z.2T("k6"+p7),10)||0;1n[1r]-=6u(8Z.2T("gn"+p7+"g9"),10)||0}1n[1r]+=2v[3t]||0;if(3i.fz[3t]){1n[1r]+=8Z[aZ==="x"?"1m":"1w"]()*3i.fz[3t]}}1j{K 2b=8Z[3t];1n[1r]=2b.4d&&2b.4d(-1)==="%"?e8(2b)/100*4n:2b}if(3i.AI&&/^\\d+$/.9A(1n[1r])){1n[1r]=1n[1r]<=0?0:3A.6d(1n[1r],4n)}if(!i&&3i.aZ.1f>1){if(49===1n[1r]){1n={}}1j{if(eg){51(3i.19a);1n={}}}}});51(3i.UO);1a 51(1X){K k4=$.4C({},3i,{eg:1l,5D:5D,we:1X&&1a(){1X.2J(4e,8Z,3i)}});$4e.51(1n,k4)}})};$fm.4n=1a(4e,aZ){K wv=aZ==="x"?"g9":"hA",9v="9v"+wv;if(!AH(4e)){1b 4e[9v]-$(4e)[wv.3W()]()}K 4l="19b"+wv,3m=4e.wI||4e.2K,3J=3m.9l,3H=3m.3H;1b 3A.4n(3J[9v],3H[9v])-3A.6d(3J[4l],3H[4l])};1a wK(2b){1b $.ch(2b)||$.UR(2b)?2b:{1M:2b,2f:2b}}$.UQ.UK.57=$.UQ.UK.4O={4z:1a(t){1b $(t.4e)[t.6U]()},5V:1a(t){K hS=J.4z(t);if(t.1v.193&&(t.Au&&t.Au!==hS)){1b $(t.4e).6y()}K 3C=3A.5o(t.7R);if(hS!==3C){$(t.4e)[t.6U](3C);t.Au=J.4z(t)}}};1b $fm});if(!3Q.3g.xH){3Q.3g.xH=1a(kz){K 6A=J.1f;if(2A kz!="1a"){98 1T xG}if(6A==0&&2F.1f==1){98 1T xG}K i=0;if(2F.1f>=2){K rv=2F[1]}1j{do{if(i in J){rv=J[i++];1s}if(++i>=6A){98 1T xG}}4x(1l)}1p(;i<6A;i++){if(i in J){rv=kz.2J(1d,rv,J[i],i,J)}}1b rv}}if(!3Q.cd){3Q.cd=1a(4M){1b 5c.3g.3X.2J(4M)==="[1A 3Q]"}};if(2A QB=="2y"){QB={}}if(2A QB.1e=="2y"){QB.1e={}}if(2A QB.1e.2M=="2y"){QB.1e.2M={}}if(2A QB.1e.1U=="2y"){QB.1e.1U={}}if(2A dE=="2y"){dE={lI:1a(){},Gz:1a(){}}}K 194=1l;if(2A QB=="2y"){QB={}}if(2A QB.1e=="2y"){QB.1e={}}if(2A QB.1e.2M=="2y"){QB.1e.2M={}}if(2A QB.1e.1U=="2y"){QB.1e.1U={}}QB.1e.1U.18Q=1a(){J.9z=1d;J.7D=1d;J.f6=1d};QB.1e.1U.18R=1a(){J.8n=1d};QB.1e.1U.Dj=1a(){J.bM=1d;J.9b=1d;J.HZ=1d;J.6W=[];J.8C=1d;J.je=1k;J.3w=1d;J.7K=1k;J.6x=1k;J.dB=1k;J.m5=1d;J.gp=1d;J.8b=0;J.6F=1d;J.Vg=1d;J.Ri=1d;J.FD=0;J.FE=1d;J.c6=1d;J.bF=1d};QB.1e.1U.jz=1a(){J.9b=1d;J.18P=1d;J.4Y=1d;J.mk=1d;J.jG=0;J.5A=[];J.3w=1d;J.3N=1d;J.5c=1d;J.QN=1l;J.eY=1d;J.nB="";J.18N=1k;J.jI=1d;J.kI=1d;J.7K=1k;J.Pm=1k;J.6x=1k;J.TW=1d;J.6F=1d;J.Iz=1d;J.Hp=1d;J.Gj={Az:{8g:1l,93:0,d5:"",ep:""},Ay:{93:1,8g:1l,d5:"",ep:""},tx:{93:2,8g:1l,d5:"",ep:""},s3:{ub:1k,93:3,8g:1l,d5:"",ep:""},Gk:1k,gp:0,G3:1l,Aq:1k};J.pu=[];J.cU=1d;J.X=1d;J.Y=1d;J.g4=1d;J.nc=1d};QB.1e.1U.18O=1a(){J.qC=2;J.4Y="";J.18V=1d;J.18W=1d;J.v0=1k;J.z8=1d;J.18U=1d};QB.1e.1U.S4=1a(){J.7K=1d;J.6x=1d;J.5v=1d;J.hO=1d;J.5y=1d};QB.1e.1U.S0=1a(){J.18S=0;J.4R=0;J.ez=1d;J.18T=1d;J.ao=1d;J.tS=1d};QB.1e.1U.19R=1a(){J.5W=1d;J.1aK=1d};QB.1e.1U.zI=1a(){J.1aL=1d;J.8C=1d;J.tw=1d;J.3w=1d;J.d4=1k;J.G5=1d;J.7k=1d;J.g4=1d;J.tN=1d;J.1aJ=1k;J.1aH=0;J.rZ=1k;J.W5=1k;J.1aI=1k;J.1aP=0;J.G0=1d;J.1aQ=0;J.Ap=1d};QB.1e.1U.Ta=1a(){J.4Y=1d;J.X=1d;J.Y=1d;J.g9=1d;J.hA=1d;J.T3=1d};QB.1e.1U.sK=1a(){J.l0=[];J.2Q=1d;J.u4=1d;J.1aO=30;J.tJ=0;J.dM="";J.gB="";J.1aM=1k;J.dv="";J.SD=1k};QB.1e.1U.Af=1a(){J.dM="";J.gB="";J.2Q=1d;J.RL=1k;J.4R=0;J.Aa=1d;J.8b=0;J.4Y=1d;J.g4=1d;J.dv=1d;J.eY=1d;J.3N=1d;J.Uz=1k;J.fP=1k;J.AA=1k;J.zH=1d;J.AK=0;J.AJ=1d;J.AF=1k;J.nc=1d};QB.1e.1U.1aN=1a(){J.2Q=1d;J.4R=0;J.Aa=1d;J.8b=0;J.4Y=1d;J.g4=1d;J.dv=1d;J.eY=1d;J.3N=1d;J.Uz=1k;J.fP=1k;J.AA=1k;J.zH=1d;J.AK=0;J.AJ=1d;J.AF=1k;J.nc=1d};QB.1e.1U.Sc=1a(){J.rX=[];J.Sb=1d;J.3w="1aA-zR-zR-zR-1aB";J.1az=1d;J.4R=0;J.Sd=1k};QB.1e.1U.Be=1a(){J.mp=1d;J.b9=1d;J.d4=1d;J.v0=1k};QB.1e.1U.gQ=1a(){J.dM=1d;J.fo=1d;J.We=1d;J.Wz=1d;J.2i=1d;J.QH=1d;J.fX=1d;J.kP=1d;J.QD=1d;J.1ax=1d;J.ai=1d;J.2e=1d};QB.1e.1U.1ay=1a(){J.2Q=[]};QB.1e.1U.Ut=1a(){J.cX="Ut";J.4Y=1d;J.3w=1d;J.fo=1d};QB.1e.1U.Wt=1a(){J.2Q=[]};QB.1e.1U.1aF=1a(){J.cX=1d;J.3N=1d;J.fo=1d;J.HN=1k;J.2Q=[];J.3w=1d;J.dM=1d};QB.1e.1U.1aG=1a(){J.3w=1d;J.gk=1d;J.R0=1d;J.eK=1k;J.1aE=1k;J.8g=1l;J.4Y=1d;J.6L=1d;J.8o=1d;J.1aC=1k;J.yT=1d;J.kP=[];J.tC=[];J.2Q=[]};QB.1e.1U.CU=1a(){J.xW=[];J.aB=0;J.4R=3;J.1aD=1d;J.2Q=[];J.6N=1d;J.8I=0;J.6g=1d;J.83=1d};QB.1e.1U.Eb=1a(){J.2Q=[];J.6N=1d;J.8I=0;J.6g=1d;J.83=1d;J.4R=0};QB.1e.1U.U8=1a(){J.4R=1;J.2Q=[];J.6N=1d;J.8I=0;J.6g=1d;J.83=1d};QB.1e.1U.E3=1a(){J.aB=0;J.4R=3;J.2Q=[];J.6N=1d;J.8I=0;J.6g=1d;J.83=1d};QB.1e.1U.DY=1a(){J.bO=1d;J.4R=2;J.2Q=[];J.6N=1d;J.8I=0;J.6g=1d;J.83=1d};QB.1e.1U.1aR=1a(){J.1b5=0;J.3N=1d;J.1b6=1;J.jc=1};QB.1e.1U.1b4=1a(){J.1b2=1d;J.3N=1d;J.1bb="";J.1b9="62";J.1b7=0;J.1b8=1d;J.1aV=1d;J.1aW=1d;J.z8=1d;J.1aU=1d;J.mp=1d};QB.1e.1U.zw=1a(){J.8o=1d;J.9Z=1d;J.1aS=1d;J.1aT={3t:0,ip:0,cc:0}};QB.1e.1U.Gj=1a(){J.Az={8g:1l,93:0,d5:"",ep:""};J.Ay={93:1,8g:1l,d5:"",ep:""};J.tx={93:2,8g:1l,d5:"",ep:""};J.s3={ub:1k,93:3,8g:1l,d5:"",ep:""};J.Gk=1k;J.gp=0;J.G3=1l;J.Aq=1k};QB.1e.1U.3U={QK:{zZ:"1b0&2q;mV",5c:"5c:",9b:"9b:",Ok:"OK",gJ:"gJ"},S2:{zZ:"cU&2q;mV",1b1:"5v&2q;5c",1aZ:"5y&2q;5c",1aX:"dB&2q;9W&2q;Xb&2q;5v",1aY:"dB&2q;9W&2q;Xb&2q;5y",1a5:"5v&2q;6N",1a6:"5y&2q;6N",1a2:"1a3&2q;8C",Ok:"OK",gJ:"gJ"},TM:{zZ:"Cu&2q;mV",Xm:"Xm",1aa:"1ab&2q;1a9:",Ok:"OK",gJ:"gJ"},4f:{6W:{Dv:"8g",8C:"8C",bM:"bM",9b:"6N&2q;3N",gp:"X7&2q;4R",m5:"X7&2q;1a7",je:"je",1a8:"yQ&2q;By",Dq:"6W&2q;1p",zM:"6W",Vt:"Or..."},BV:"BV",19W:"BV&2q;Wm",19U:"19T&2q;h9&2q;Wm",1a0:"oW&2q;EW&2q;8M",1a1:"X0&2q;EW&2q;jt-i4",19Z:"lH&2q;19X",19Y:"lH&2q;1ac",1aq:"lH&2q;up",1ar:"lH&2q;f5",1ap:"hu&2q;1i",1an:"WD&2q;eC&2q;1i",5A:"5A",Ws:"Ws",1ao:"ai",1av:"kC",1aw:"nz",1au:"hk",1as:"Wy&2q;2x&2q;1at&2q;1ag&2q;to&2q;1ah.",1af:"iL&2q;Cg:&2q;{0}&2q;rk,&2q;{1}&2q;1ad,&2q;{2}&2q;1ae.",mV:"mV",hu:"hu",1al:"hu&2q;kP",1am:"dB&2q;9W",dB:"dB...",9W:"9W",Wi:"Wi",Wh:"Wh",Wc:"Wc",Wb:"Wb",1ak:"1ai&2q;9W",1aj:"18r&2q;9W",B3:"dB&2q;76&2q;3o&2q;2L&2q;{0}",16v:"Cu&2q;is&2q;WT,&2q;WX&2q;to&2q;be&2q;16w",Th:"16u",sa:"sa...",WQ:"WQ",Rm:"8o&2q;i4&2q;2g&2q;is&2q;WT.&2q;W4&2q;to&2q;7P&2q;iG&2q;16s&2q;16t.",X5:"X5",iW:"fo&2q;c7",fu:"fu",Hr:"Hr",16A:"fX&2q;rz&2q;1I",16B:"fX&2q;WG&2q;ai&2q;8C",16z:"fX&2q;X0&2q;WG&2q;ai&2q;8C",16k:"Wa",VP:"WD&2q;jt-i4",16q:"qQ&2q;5s&2q;h9&2q;16r&2q;1x&2q;16p&2q;16n&2q;in&2q;iG&2q;6m&2q;jt-i4.",kP:"kP",WJ:"WJ",WI:"WI",16o:"fX kP",Qb:"WK&2q;2Z",Qa:"WK&2q;16P",I4:"Cx&2q;jt-i4",UX:"Cx&2q;3n",UL:"Cx&2q;6H",w6:"w6",b3:"b3",jI:"jI",kI:"kI",vP:"vP",vO:"vO",ai:"ai",kC:"kC",nz:"nz",sl:"sl",5W:"5W",bM:"bM",vN:"vN",Bz:"16N&2q;cX",Bg:"16O&2q;Cu",16V:"16W"},16U:"en"};QB.1e.2M.16S={jI:0,kI:1,4R:2};QB.1e.2M.jG={ai:0,kC:1,16T:2,aX:3,R0:4,16G:5};QB.1e.2M.16H={hk:0,15M:1,15L:2};QB.1e.2M.15T={ec:0,fb:1};QB.1e.2M.15Q={fh:0,15D:1,15E:2};QB.1e.2M.k0={fh:0,tf:1,te:2};QB.1e.2M.15C={15A:1,15B:2,p0:3};QB.1e.2M.15I={15J:0,15H:1,15F:2,hp:3,15G:4,5Y:5,Fh:6,15U:7,16b:8,3w:9,16c:10,Qi:11,16a:12,5c:13,168:14,169:15,62:16,R8:17,16g:18,16h:19,16f:20,16d:21,15Z:22,15X:23,15V:25,15W:26,166:27};QB.1e.2M.7o={Vn:0,Vh:1,Vu:2,oH:3,Vp:4,Vs:5,Va:6,Ef:7,Eg:8,VR:9,VU:10,VQ:11,VF:12,Vy:13,VA:14,VK:15,VL:16,VI:17};QB.1e.2M.6G={hk:0,b9:1,hj:2,5Y:3,hp:4};QB.1e.2M.167={hk:0,62:1,165:2,161:3,5Y:4,R8:5,Fh:6,hp:7};QB.1e.2M.bl={9W:0,ya:1,rU:2,fh:3};QB.1e.2M.oG={w6:1,b3:2,jI:4,kI:8,vP:16,vO:30,ai:32,kC:64,nz:128,sl:Pv,5W:Pu,bM:vL,vN:BB,fu:Pr,Bz:Po,Pq:Pn,Bg:Pp,9W:164};QB.1e.2M.G4={fh:0,3N:1,eY:2};3s={8s:0,fN:[],CL:[],h2:"",Cg:{},8o:1d,2i:{9z:[],7D:[]},2e:{8n:[]},aL:1d,3w:1d,fo:1d,cm:{2Q:[],B5:0},er:"",aR:1d,R3:[],kK:1d,gQ:{},ea:1d,gV:1k,wj:1k,PJ:1k,16X:1k,h0:[],jW:1d,8P:1d,Br:1k,zw:1d,9c:1d,nr:1d,iQ:{},8z:1d,7e:1d,e4:1d,Bb:1a(){J.h2="";J.Cg={};J.8o=1d;J.sm=1d;J.2i={9z:[],7D:[]};J.2e={8n:[]};J.fN=[];J.CL=[];J.cm={2Q:[],B5:0};J.7e=1d;J.fo=1d;J.er="";J.aR=1d;J.R3=[];J.ea=1d;J.gQ={};J.iQ={};J.8z=1d}};i3=1T 6L({f9:{},2S:1a(1N,1X,2V){J.f9||(J.f9={});K 4U=J.f9[1N]||(J.f9[1N]=[]);4U.1G({1X:1X,2V:2V,al:2V||J});1b J},1R:1a(1N){if(!J.f9){1b J}K 2w=3Q.3g.4d.2J(2F,1);K 4U=J.f9[1N];K Ch=J.f9.76;if(4U){J.Ci(1N,4U,2w)}if(Ch){J.Ci(1N,Ch,2F)}1b J},Ci:1a(1N,4U,2w){K ev,i=-1,l=4U.1f,a1=2w[0],a2=2w[1],a3=2w[2];3P(2w.1f){1q 0:4x(++i<l){(ev=4U[i]).1X.2J(ev.al,1N)}1b;1q 1:4x(++i<l){(ev=4U[i]).1X.2J(ev.al,1N,a1)}1b;1q 2:4x(++i<l){(ev=4U[i]).1X.2J(ev.al,1N,a1,a2)}1b;1q 3:4x(++i<l){(ev=4U[i]).1X.2J(ev.al,1N,a1,a2,a3)}1b;5P:4x(++i<l){(ev=4U[i]).1X.3v(ev.al,[1N].4b(2w))}1b}},dT:1a(){}});Rd=1T 6L({cG:i3,2l:{6M:"6M"}});Rc=1T 6L({cG:i3,2l:{6M:"6M"}});PE=1T 6L({cG:i3,2l:{iL:"iL",6M:"6M"}});PD=1T 6L({cG:i3,2l:{iL:"iL",6M:"17X"}});PC=1T 6L({cG:i3,2l:{6M:"6M"}});PB=1T 6L({cG:i3,2l:{6M:"6M"}});Ph=1T 6L({cG:i3,9c:1T Rd,2i:1T Rc,2e:1T PC,8z:1T PB,eD:1T PE,i0:1T PD,2l:{v8:"v8",6M:"6M",Bu:"Bu",v9:"v9",Bv:"Bv",sd:"sd",vc:"vc",v5:"v5",v3:"v3",v1:"v1",DJ:"DJ"},3s:3s,nr:1d,er:"",8P:{},kK:1d,aR:1d,h0:1d,jW:1d,ea:1d,8o:"",sm:"",vK:"",aL:"",pO:1k,3w:1d,cR:1k,Bt:1k,9H:0,cm:[],gV:1k,w8:1k,8s:0,dT:1a(){J.Py=$.ho(J.PK,17U,J);J.PO=$.ho(J.Pw,9i,J)},vQ:1a(1X){K me=J;if(J.9H<0){J.9H=0}if(J.9H>0){6P(1a(){me.vQ(1X)},100);1b}1b me.6h(1X)},Pw:1a(1X){J.6h(1X,1l)},AX:1a(bm){QB.1e.3D.s5.2i.gu[bm]=gF({},J.3s.2i);if(J.3s.2e!=1d&&(J.3s.2e.8n!=1d&&J.3s.2e.8n.1f)){QB.1e.3D.s5.2e.gu[bm]=gF({},J.3s.2e)}},6h:1a(1X,Pz){if(!QB.1e.2o.w8&&Pz){1b}QB.1e.2o.w8=1k;K me=J;if(J.9H<0){J.9H=0}J.8s++;K 5l=3z.gf.5B;if(3z.1M&&3z.1M.gf){5l=3z.1M.gf.5B}J.3s.vj=5l;J.3s.8s=J.8s;J.3s.aL=J.aL;J.3s.3w=J.3w;if(1B(J.3s.2i)){J.3s.2i={}}J.3s.2i.f6={eK:QB.1e.2i.Tb()};v4(J.3s.2i,"9z");v4(J.3s.2i,"7D");v4(J.3s.2e,"8n");J.AX(J.8s);if(J.cm.1f>0){J.3s.cm.B5=J.cm[J.cm.1f-1].Id}J.1R(J.2l.v8,J.3s);K 1h=$.hn(J.3s);me.3s.Bb();J.9H++;J.Py();$.B8({5l:pK+"?45=Rb",1C:"pD",PN:"ei",PL:"lM/ei",8y:1k,1h:1h,wd:1a(1h){QB.1e.2o.1R(QB.1e.2o.2l.6M,1h);me.g0(1h);if(1X&&7Q(1X)=="1a"){1X(1h)}},5q:1a(FU,FV,PP){if($(".fg").1f==0){1b}if(!n4){ff(CB)}},we:me.FZ});me.gV=1k},Ad:1a(45,1X){K me=J;if(J.9H<0){J.9H=0}K bm=J.8s++;K 5l=3z.gf.5B;if(3z.1M&&3z.1M.gf){5l=3z.1M.gf.5B}J.3s.vj=5l;J.3s.8s=bm;J.3s.aL=J.aL;J.3s.3w=J.3w;K 1h=$.hn(J.3s);me.3s.Bb();J.9H++;$.B8({5l:pK+"?45="+45,1C:"pD",PN:"ei",PL:"lM/ei",8y:1k,1h:1h,wd:1a(1h){QB.1e.2o.1R(QB.1e.2o.2l.6M,1h);me.g0(1h);if(1X&&7Q(1X)=="1a"){1X(1h)}},5q:1a(FU,FV,PP){if($(".fg").1f==0){1b}if(!n4){ff(CB)}},we:me.FZ});me.gV=1k},7P:1a(1X){J.3s.fN.1G("7P");J.vQ(1X)},nQ:1a(1X){J.3s.fN.1G("nQ");J.6h(1X)},sL:1a(1X){J.3s.fN.1G("sL");J.6h(1X)},Dd:1a(1X){J.AX(J.8s+1);QB.1e.2o.gV=1l;QB.1e.2o.w8=1l;1b J.PO(1X)},PK:1a(){J.9H=0;1b},bi:1a(PG,1N,zQ,PF){if(!1B(zQ)){PG.1R(1N,zQ,PF)}},g0:1a(1h){if(1h!=1d&&1h!==2y){K me=J;if(1B(J.aL)){J.aL=1h.aL}if(1B(J.3w)){J.3w=1h.3w}if((1h.wi||J.wi)&&1h.PJ||(1B(1h.aL)||J.aL!=1h.aL||(1B(1h.3w)||J.3w!=1h.3w))){gf.17H();1b;1b}J.nr=1h.nr;J.er=1h.er;J.aR=1h.aR;J.h0=1h.h0;J.8P=1h.8P;J.jW=1h.jW;if(!1B(1h.iQ)&&5c.95(1h.iQ).1f>0){J.iQ=1h.iQ}if(!1B(1h.ea)){J.ea=1h.ea}J.bi(J.eD,J.eD.2l.6M,1h.7e);J.bi(J.i0,J.i0.2l.6M,1h.e4);if(!1B(J.eD)&&!J.cR){J.cR=1l;J.eD.1R(J.eD.2l.iL,1l)}if(!1B(J.i0)&&!J.Bt){J.Bt=1l;J.i0.1R(J.i0.2l.iL,1l)}J.bi(J,J.2l.v9,1h.8o,1h.8s);J.bi(J.8z,J.8z.2l.6M,1h.8z,1h.8s);J.bi(J.2i,J.2i.2l.6M,1h.2i,1h.8s);J.bi(J.2e,J.2e.2l.6M,1h.2e,1h.8s);J.bi(J,J.2l.vc,1h.kK,1h.8s);J.bi(J.9c,J.9c.2l.6M,1h.9c,1h.8s);J.bi(J,J.2l.v1,1h.gQ,1h.8s);J.bi(J,J.2l.v5,1h.cm,1h.8s);J.bi(J,J.2l.Bu,1h.fo,1h.8s);J.bi(J,J.2l.v3,1h.17N,1h.8s);if(1h.Br!=1d&&1h.Br){J.1R(J.2l.Bv,1h.8o,1h.8s)}J.bi(J,J.2l.sd,1h.zw)}J.9H--},WU:1a(66){66.6x=1l;J.3s.2i.9z.1G(66)},WW:1a(66){66.7K=1l;J.3s.2i.9z.1G(66)},WR:1a(66){66.Pm=1l;J.3s.2i.9z.1G(66)},QM:1a(66){J.3s.2i.9z.1G(66)},WY:1a(2k){2k.6x=1l;J.3s.2i.7D.1G(2k)},17O:1a(2k){2k.7K=1l;J.3s.2i.7D.1G(2k)},Wf:1a(2k){J.3s.2i.7D.1G(2k)},D9:1a(9q){J.3s.8o=9q},17M:1a(3o){1p(K i=0;i<3o.1f;i++){3o[i].6x=1l}QB.1e.2o.3s.2e.8n=QB.1e.2o.3s.2e.8n.4b(3o)},sg:1a(3o){QB.1e.2o.3s.2e.8n=QB.1e.2o.3s.2e.8n.4b(3o)},17L:1a(3o){1p(K i=0;i<3o.1f;i++){3o[i].7K=1l}QB.1e.2o.3s.2e.8n=QB.1e.2o.3s.2e.8n.4b(3o)}});QB.1e.2o=1T Ph;1S={jU:{jI:0,kI:1,ai:2,kC:3,nz:4,sl:5,cU:6,fu:7},oG:{1:QB.1e.1U.3U.4f.w6,2:QB.1e.1U.3U.4f.b3,4:QB.1e.1U.3U.4f.jI,8:QB.1e.1U.3U.4f.kI,16:QB.1e.1U.3U.4f.vP,30:QB.1e.1U.3U.4f.vO,32:QB.1e.1U.3U.4f.ai,64:QB.1e.1U.3U.4f.kC,128:QB.1e.1U.3U.4f.nz,Pv:QB.1e.1U.3U.4f.sl,Pu:QB.1e.1U.3U.4f.5W,vL:QB.1e.1U.3U.4f.bM,BB:QB.1e.1U.3U.4f.vN,Pr:QB.1e.1U.3U.4f.fu,Po:QB.1e.1U.3U.4f.Bz,Pn:QB.1e.1U.3U.4f.Pq,Pp:QB.1e.1U.3U.4f.Bg,d7:1a(Qe){1p(K 1r in J){if(Qe==1r){1b J[1r]}}1b 1d}},2m:{45:-1,ly:0,1Z:1,3n:2,aj:3,9O:4,7J:5,cl:6,eP:7,dt:8,6H:9,oN:10,2p:1a(1X){1p(K i=-1;i<=9;i++){1X(i,J.d7(i))}1p(K i=0;i<QB.1e.2e.j0;i++){1X(10+i,"Dr"+(i+1))}},d7:1a(2b){1p(K 1r in J){if(J[1r]==2b){1b 1r}}1b 1d}},8o:{oO:{fh:0,z7:1,J2:2,2p:1a(1X){1p(K i=0;i<=2;i++){1X(i,J.d7(i))}},d7:1a(2b){1p(K 1r in J){if(2b==J[1r]){1b 1r}}1b 1d}},bM:[" ","18l","18j","18h","18i","18p","18q"],yn:{ot:"UE",Bm:"18o",2p:1a(1X){1X(J.ot,J.d7(J.ot));1X(J.Bm,J.d7(J.Bm))},d7:1a(2b){if(2b==J.ot){1b QB.1e.1U.3U.4f.Qb.3u("&2q;"," ")}1b QB.1e.1U.3U.4f.Qa.3u("&2q;"," ")}}},8A:{ec:0,fb:1,dR:1a(1y){K 18m=1y;if(1y==1S.8A.ec){1y=1S.8A.fb}1j{1y=1S.8A.ec}1b 1y}},5c:1a(2W){J.jX={};J.qP="";J.Bk="";J.1x="";J.aj="";J.1C="";J.Qo="";J.PS=1d;J.id=4w.yj();if(2W){4w.oW(2W,J)}},18n:1a(2W){J.1x="18a";J.Qo="18b";J.1C="Qi";J.4l="4";J.hP="10";J.189="1";J.181=1k;if(2W){4w.oW(2W,J)}},18g:1a(1y){K 1O=[];if(1y.jX==1S.jU.ai){4w.bo(1O,1y.Bk);4w.bo(1O,1y.qP);4w.bo(1O,1y.1x)}if(1y.jX==1S.jU.fu){K 1P=1y.1P;if(1P){4w.bo(1O,1P.Bk);4w.bo(1O,1P.qP);4w.bo(1O,1P.1x);4w.bo(1O,1y.1x)}}1b 1O.5x(".")},Bn:1a(28,1I){K 1O=[];if(1I){1B(1I.9b)?4w.bo(1O,1I.3N):4w.bo(1O,1I.9b);4w.bo(1O,28.7k)}1b 1O.5x(".")},18c:1a(1y){if(1y==1d){1b""}K 1O=[];if(1y.jX==1S.jU.ai){4w.bo(1O,1y.1x)}if(1y.jX==1S.jU.fu){K 1P=1y.PS;if(1P){4w.bo(1O,1P.1x);4w.bo(1O,1y.1x)}}1b 1O.5x(".")},S3:1a(3n,yZ,o7,zD,oe){if(3n!=""){1b 3n}K 1O=1S.Bn(yZ,o7)+" = "+1S.Bn(zD,oe);1b 1O},Q7:1a(){J.5W=[];J.kQ=1a(){4r J.5W;J.5W=[]};J.18d=1a(mj){if(!mj.5W){1b}J.kQ();K me=J;1p(K i=0;i<mj.5W.1f;i++){J.5W.1G(mj.5W[i])}}}};17d=1T 1S.Q7;K aD=15;QB.1e.2i={6v:1k,1Y:1d,8V:1d,5W:[],5j:[],r:1d,rq:1k,um:1k,p0:1k,17e:0,17c:0,tu:1k,tG:1k,tH:1k,tB:1k,Di:1a(8f){1p(K i=0;i<J.5W.1f;i++){K 1y=J.5W[i];K mj=1y.1h("4D");if(4w.yq(8f,mj.nc)){1b 1y}}1b 1d},D7:1a(l5,lg){1b l5.3w==lg.3w||(l5.6x||lg.6x)&&l5.6F==lg.6F},Ei:1a(l5,lg){1b l5.4Y==lg.4Y},nT:1a(8k){K 1O=1d;if(1B(8k)){1b 1O}$.2p(J.5W,1a(1W,1y){K 1I=1y.1h("1A");if(dX(1I.9b,8k)||(dX(1I.3N,8k)||(dX(1I.nB,8k)||(dX(1I.mk,8k)||dX(1I.g4,8k))))){1O=1y;1b 1k}});1b 1O},17a:1a(m8){if(m8==1d){1b}K bs=m8.4d();K kJ=[];K lN=[];K Bw=[];K me=J;1p(K i=J.5W.1f-1;i>=0;i--){K 1y=J.5W[i];K Bx=1y.1h("1A");K sI=1d;1p(K j=bs.1f-1;j>=0;j--){K g8=bs[j];if(J.D7(Bx,g8)){bs.3M(j);sI=g8;1s}}if(sI==1d){1p(K j=bs.1f-1;j>=0;j--){K g8=bs[j];if(J.Ei(Bx,g8)){bs.3M(j);sI=g8;1s}}}if(sI!=1d){lN.1G({1Q:g8,6S:1y})}1j{kJ.1G(1y)}}$.2p(bs,1a(1W,g8){Bw.1G(g8)});K bD=1a(1v,6S){K 1y=J.bD(1v,6S);if(6S===2y||6S==1d){1y.4K(QB.1e.7L.2l.sD,J.CZ,J);1y.4K(QB.1e.7L.2l.sf,J.D0,J);1y.4K(QB.1e.7L.2l.sJ,J.D1,J);1y.4K(QB.1e.7L.2l.sH,J.gR,J)}J.4k.8O("sM");1b 1y};K kM=1a(1v,6S,jh){K 1y=J.kM(1v,6S,jh);J.4k.8O("sM");1b 1y};$.2p(lN,1a(1W,1y){kM({1A:1y.1Q},1y.6S,1l)});$.2p(kJ,1a(1W,1y){J.zg(1y,1l)});$.2p(Bw,1a(1W,1y){bD({1A:1y})})},kM:1a(1v,6S,jh){K 2v=6S.2v();K za={};K z0=1d;if(6S!=1d){K ic=6S.1h("1A");K nO=1v.1A;if(ic&&nO){za[ic.3w]=nO.3w;z0=ic.3w;if(ic.5A&&nO.5A){$.2p(ic.5A,1a(i,28){if(ic.5A[i]&&nO.5A[i]){za[ic.5A[i].3w]=nO.5A[i].3w}})}}}1v.jh=jh;6S.6j("W8",1v);if(z0){$.2p(QB.1e.2i.7D.Tu(z0),1a(i,2k){2k.oM(za)})}6E{6S.2v(2v)}6I(e){}1b 6S},bD:1a(1v,6S){if(6S==1d){K 89=$("<2C></2C>");if(J.1Y!=1d&&J.1Y.1f>0){J.1Y.2Y(89)}1j{1v.6v=1k}89.6j(1v);89.4K(QB.1e.7L.2l.uq,{1y:89},J.PZ,J);89.4K(QB.1e.7L.2l.uZ,{1y:89},J.Q1,J);89.4K(QB.1e.7L.2l.uV,{1y:89},J.T9,J);if(!1v.2R&&!1v.9X){K 2R=J.Tk(89);89.9s=2R[0];89.9x=2R[1];89.6j("2R",2R)}J.5W.1G(89);1b 89}1j{6S.6j("7P",1v);1b 6S}},zg:1a(1A,mt){1A.6j("6q",1d,mt)},PZ:1a(e,1h){K 1y=e.1h.1y;K Q2=1y.1h("hR");J.5W.3M(1y);QB.1e.2i.7D.Ty(Q2)},Q1:1a(e,1h){K 1y=e.1h.1y;J.1Y.1R(QB.1e.2i.2l.vh,1y)},T9:1a(e,1h){K 1y=e.1h.1y;J.1Y.1R(QB.1e.2i.2l.vd,1y)},RW:1a(3w){K 1y=1d;$.2p(J.5W,1a(1W,o){if(o.1h("hR")==3w){1y=o.1h("Qv");1b 1k}});1b 1y},RV:1a(1I,T8){K 1O=1d;if(1I==1d){1b 1O}$.2p(1I.5M,1a(1W,28){if(28.1A.3w==T8){1O=28;1b 1k}});1b 1O},S8:1a(1I,6i){K 1O=1d;if(1I==1d){1b 1O}$.2p(1I.5M,1a(1W,28){if(28.1A.7k==6i){1O=28;1b 1k}});1b 1O},Tb:1a(){K 1O=[];$.2p(J.5W,1a(1W,1y){K 1I=1y.1h("1A");if(1I==1d){1b 1l}K l=1T QB.1e.1U.Ta;K p=1y.2R();if(1I.5A){l.T3=1I.5A.1f}l.4Y=1I.4Y;l.X=1y[0].9s;l.Y=1y[0].9x;l.g9=1y.6j("2W","1m");if(l.g9=="6a"){l.g9=1d}l.hA=1y.6j("2W","1w");if(l.hA=="6a"){l.hA=1d}1O.1G(l)});1b 1O},Qr:1a(rn){if(rn==1d){1b}if(rn.1f==0){1b}$.2p(J.5W,1a(1W,1y){K 1I=1y.1h("1A");if(1I==1d){1b 1l}K aH=1d;1p(K 1W=0;1W<rn.1f;1W++){K l=rn[1W];if(l.4Y==1I.4Y){aH=l;1s}}if(aH!=1d){if(aH.X!=0&&(!1B(aH.X)&&(aH.Y!=0&&!1B(aH.Y)))){1y.6j("2R",[aH.X,aH.Y])}if(aH.g9!=0&&!1B(aH.g9)){1y.6j("2W","1m",aH.g9)}if(aH.hA!=0&&!1B(aH.hA)){1y.6j("2W","1w",aH.hA)}}})},S7:1a(1I){if(1I==1d){1b 1d}1b 1I.d3},Tk:1a(89){K 1m=J.1Y.1m();if(1m<gI){1m=BB}K bN=[0,1m];K cI=[0,17f];K jf=[];K ow=89.1m();K oh=89.1w();if(ow==0){ow=gI}if(oh==0){oh=150}K w=ow+aD*2;K h=oh+aD*2;J.Tf(bN,cI,jf,89);if(J.rq){1b J.Td(bN,cI,jf,w,h)}1j{1b J.Tg(bN,cI,jf,w,h)}},Tg:1a(xs,ys,gh,w,h){1p(K j=0;j<ys.1f;j++){1p(K i=0;i<xs.1f;i++){if(gh[i][j]==0){if(J.AR(xs,ys,gh,i,j,w,h)){1b[xs[i]+aD,ys[j]+aD]}}}}1b[aD,aD]},Td:1a(xs,ys,gh,w,h){1p(K j=0;j<ys.1f;j++){1p(K i=xs.1f-1;i>=0;i--){if(gh[i][j]==0){if(J.AR(xs,ys,gh,i,j,w,h)){if(i+1<xs.1f){1b[xs[i+1]+aD-w,ys[j]+aD]}}}}}1b[aD,aD]},Tf:1a(bN,cI,jf,89){$.2p(J.5W,1a(){if(J==89){1b 1l}K 1y=J[0];bN.1G(1y.9s-aD);cI.1G(1y.9x-aD);K ow=1y.ik;K oh=1y.9m;if(ow==0){ow=gI}if(oh==0){oh=150}bN.1G(1y.9s+ow+aD);cI.1G(1y.9x+oh+aD)});bN.hQ(1a(a,b){1b a-b});cI.hQ(1a(a,b){1b a-b});1p(K i=0;i<bN.1f;i++){K 1H=[];1p(K j=0;j<cI.1f;j++){1H.1G(i==bN.1f-1||j==cI.1f-1?1:0)}jf.1G(1H)}$.2p(J.5W,1a(){K 1y=J[0];K SS=1y.9s;K SM=1y.9x;K ow=1y.ik;K oh=1y.9m;if(ow==0){ow=gI}if(oh==0){oh=150}K SP=1y.9s+ow;K SL=1y.9x+oh;K DQ=0;K AW=0;1p(K i=0;i<bN.1f;i++){if(bN[i]<=SS){DQ=i}if(SP<=bN[i]){AW=i;1s}}K AO=0;K AN=0;1p(K j=0;j<cI.1f;j++){if(cI[j]<=SM){AO=j}if(SL<=cI[j]){AN=j;1s}}1p(K i=DQ;i<AW;i++){1p(K j=AO;j<AN;j++){jf[i][j]=1}}})},61:1a(){if(J.1Y==1d||J.1Y.1f==0){1b 1d}K 1Y=J.1Y[0];J.r.nI(1,1);K w=1Y.rJ-18;K h=1Y.gy-18;if(w<0){w=0}if(h<0){h=0}J.r.nI(w,h)},AR:1a(xs,ys,gh,y5,yp,w,h){if(gh[y5][yp]==1){1b 1k}1p(K j=yp;j<=ys.1f;j++){if(ys[j]-ys[yp]>=h){1s}1p(K i=y5;i<xs.1f;i++){if(xs[i]-xs[y5]>=w){1s}if(gh[i][j]==1){1b 1k}}}1b 1l},e2:1a(){if(J.1Y==1d||J.1Y.1f==0){1b 1d}QB.1e.2i.7D.nJ();if(lK===2y){1b}J.ln()},y0:1a(){K 3V=J.pS();if(3V){3V.3V("7C")}J.61()},hf:1a(45,1i,1v,zK){3P(45){1q"f3":J.y0();1s;5P:J.1Y.1R(QB.1e.2i.2l.vl,{45:45,1i:1i,zK:zK})}},pS:1a(){if(QB.1e.3D.er==""||QB.1e.3D.er=="173"){1b 1d}K dp="#qb-ui-i4-174-"+QB.1e.3D.er;K $jK=$(dp);if($jK.1f){if(1B(QB.1e.3D.gL[dp])){K 9o={};9o[" OK "]=1a(){$(J).2B("[1x]").2p(1a(i,28){K $28=$(28);K 6i=$28.1n("1x");K ok=$28.cK();if(ok!=1d){QB.1e.3D.aR[6i]=ok}});$(J).3V("6q");QB.1e.3D.WP();QB.1e.2o.6h()};9o[QB.1e.1U.3U.TM.gJ]=1a(){$(J).3V("6q")};QB.1e.3D.gL[dp]=$jK.3V({tR:1k,5g:1k,Hk:1l,4t:Ho,a8:Hj,9d:17y,1m:"S5",7C:1a(e,ui){K $3V=$(e.3f);1p(K B0 in QB.1e.3D.aR){K TI=QB.1e.3D.aR[B0];K 5M=$3V.2B("[1x="+B0+"]");1p(K i=0;i<5M.1f;i++){K $28=$(5M[i]);$28.cK(TI)}K TE=$(\'2a[1x^="17z"]\',$jK);TE.2p(1a(){J.2P=QB.1e.3D.aR.17x})}},9o:9o})}}1b QB.1e.3D.gL[dp]},ju:1a(7y){if(7y==1d||7y.1f==0){1b 1d}K 1J={};K 5F;1p(K i=0;i<7y.1f;i++){5F=7y[i];if(5F.3N!=1d&&5F.3N.7x(0,1)=="-"){1J[5F.cX+i]=5F.3N}1j{1J[5F.cX]={1x:5F.3N,3T:5F.cX+(5F.HN?" 4q":""),1J:J.ju(5F.2Q),1h:5F.3w,1r:5F.cX}}}1b 1J},f7:1a(1V){K me=J;if(J.Cm){1b}if(1B(1V)||1V.2Q.1f==0){1b}K 1J=J.ju(1V.2Q);$.2O("6C","#qb-ui-1Y");$.2O({4s:"#qb-ui-1Y",4t:aJ,17w:{5D:0},1X:1a(45,1v){K 1i=1d;6E{1i=1v.$1Z.1h().2O.1J[45]}6I(e){}K 2R={1M:1v.y-$("#qb-ui-1Y").2v().1M,2f:1v.x-$("#qb-ui-1Y").2v().2f};me.hf(45,1i,1v,{2R:2R})},1J:1J})},QI:1a(1V){K me=J;if(1B(1V)||1V.2Q.1f==0){1b}if(J.Cw){1b}K 4s="#qb-ui-1Y 3b 1K, #qb-ui-1Y .2k-2V";K 1J=J.ju(1V.2Q);$.2O("6C",4s);$.2O({4s:4s,4t:aJ,7v:{5D:0},mR:1k,9M:1a($1R,e){K me=$1R.1h("me");if(2A me=="2y"){1b}K 1i=1J["76-2L"];if(1i){1i.1x=QB.1e.1U.3U.4f.B3.3u("{0}","<yV>"+me.5v.1I.4D.4Y+"</yV>");if(me.5v.4R==1S.8A.ec){1i.3T=1i.1r}1j{1i.3T=1i.1r+" 4q"}}1i=1J["76-to"];if(1i){1i.1x=QB.1e.1U.3U.4f.B3.3u("{0}","<yV>"+me.5y.1I.4D.4Y+"</yV>");if(me.5y.4R==1S.8A.ec){1i.3T=1i.1r}1j{1i.3T=1i.1r+" 4q"}}1b{1J:1J}},1X:1a(45,1v){K me=J.1h("me");if(me){me.hf(45)}},1J:{}})},QE:1a(1V,TT){K me=J;if(1B(1V)||1V.2Q.1f==0){1b}if(J.Cv){1b}K 4s=".qb-ui-1I";K 1J=J.ju(1V.2Q);K TV=J.ju(TT.2Q);$.2O("6C",4s);$.2O({4s:4s,4t:aJ,7v:{5D:0},mR:1k,9M:1a($1R,e){K 1I=$1R.1h("me");if(1I&&(1I.4D&&1I.4D.TW)){e.1h.1J=TV}1j{e.1h.1J=1J}1b{}},1X:1a(45,1v){K me=J.1h("me");if(me){me.hf(45)}},1J:1J})},8L:1a(){K me=J;K Cr="qb-ui-1Y";J.1Y=$("#qb-ui-1Y");J.rq=J.1Y.4H("rq");J.um=J.1Y.4H("um");J.p0=J.1Y.4H("p0");J.tu=J.1Y.4H("tu");J.tG=J.1Y.4H("tG");J.tH=J.1Y.4H("tH");J.tB=J.1Y.4H("tB");J.Cv=J.1Y.4H("Cv");J.Cw=J.1Y.4H("Cw");J.Cm=J.1Y.4H("Cm");if(!J.1Y.1f){1b 1d}J.6v=1l;J.8V=$("#"+Cr);K w=J.1Y[0].rJ;K h=J.1Y[0].gy;if(w==0){w=9i}if(h==0){h=9i}J.r=c4(Cr,w-18,h-18);K 7n=J.1Y.1n("7n");if(!9B(7n)){7n=6l(7n)}if(!1B(7n)){$.ui.6j.3g.1v.7n=7n}K 9C=J.1Y.1n("9C");if(!9B(9C)){9C=6l(9C)}if(!1B(9C)){$.ui.6j.3g.1v.9C=9C}J.1Y.3F(1a(e){K Cp=26;if(e.7f.id=="qb-ui-1Y"||e.7f.6J=="3b"){K Cq=$(J).2v();K x=e.7I-Cq.2f;K y=e.8a-Cq.1M;if(x>=J.nN-Cp&&y<Cp){me.y0()}}});$("#qb-ui-1Y").3F(1a(e){K Tr=36;K Tq=26;if(e.3f.id=="qb-ui-1Y-bX"||e.3f.6J=="3b"){K x=!1B(e.TS)?e.TS:e.17D;K y=!1B(e.TN)?e.TN:e.17E;if(x>=J.nN-Tr&&y<Tq){me.y0()}}});J.1Y.8U({yu:"qb-ui-1Y-7r",Ie:".qb-ui-1Y-8U",fr:"aU",If:1a(e,ui){K 1Y=$("#qb-ui-1Y")[0];if(ui.43.4H("qb-ui-3I-28-43")){K a6=ui.43.1h("a6");K eo=ui.43.1h("eo");K 1A=ui.43.1h("1A");K 9u=ui.43.1h("9u");if(9u==1d){9u=1T QB.1e.1U.jz;9u.6x=1l;9u.4Y=eo;9u.3N=eo}K dD=4w.hJ(ui.43[0],4w.hJ(1Y));dD.1M+=1Y.4O;$(me.1Y).1R(QB.1e.2i.2l.ve,{1I:9u,28:1A,8k:eo,6i:a6,9X:[dD.2f,dD.1M]})}1j{K 1A=ui.43.1h("1A");if(1A==1d){1A=1T QB.1e.1U.jz;1A.6x=1l;1A.4Y=ui.43.1h("a6");1A.3N=ui.43.1h("a6")}K dD=4w.hJ(ui.43[0],4w.hJ(1Y));if(dD.2f<0){dD.2f=0}if(dD.1M<0){dD.1M=0}dD.1M+=1Y.4O;K yF={1A:1A,9X:[dD.2f,dD.1M]};$(me.1Y).1R(QB.1e.2i.2l.vg,yF)}}});J.ln=$.BD(J.61,9i,J);J.j3=$.BD(J.e2,5,J);J.Tt=$.ho(J.e2,n7,J);J.1Y.61(1a(e,ui){me.j3()});$("#qb-ui-1Y").on("yl",1a(1N,ui){me.61()});$("#qb-ui-3I-pE").on("yl",1a(1N,ui){me.61()});$("#qb-ui-3I").on("yl",1a(1N,ui){me.61()});$("#qb-ui").on("yl",1a(1N,ui){me.61()});J.ln();$(3z).61(1a(e){if(e.3f!=3z){1b}me.ln()});1b J},ln:1a(){},j3:1a(){},Tt:1a(){}};QB.1e.2i.2l={vg:"vg",Dh:"Dh",vh:"vh",vd:"vd",Tp:"Tp",ve:"ve",vl:"vl"};QB.1e.2i.7D={5j:[],sz:1a(1Q){K 2k=1T QB.1e.2i.cU(1Q);QB.1e.2i.7D.1G(2k);1b 2k},zl:1a(2k,1Q){2k.1Q(1Q)},nJ:1a(){if(!QB.1e.2i.6v){1b 1d}$.2p(J.5j,1a(1W,2k){2k.nJ()})},1G:1a(1y){J.5j.1G(1y)},17B:1a(2k){1p(K i=0;i<J.5j.1f;i++){if(J.5j[i].2k==2k){1b J.5j[i]}}1b 1d},17o:1a(5j){if(5j==1d){1b 1k}if(5j.1f==0){1b 1k}J.z4();1p(K 1W=0;1W<5j.1f;1W++){K 8h=5j[1W];K az=1d;if(8h.5v!=1d&&8h.5y!=1d){az=J.zm(8h.5v.ao,8h.5y.ao)}if(az==1d){J.sz(8h)}1j{az.sF=1k;J.zl(az,8h)}}J.zk();QB.1e.2i.e2()},zm:1a(TA,Tz){1p(K i=J.5j.1f-1;i>=0;i--){K 2k=J.5j[i];if(2k.5v&&2k.5y){if(2k.5v.ao==TA&&2k.5y.ao==Tz){1b J.5j[i]}}}1b 1d},17n:1a(8V){1p(K i=0;i<J.5j.1f;i++){if(J.5j[i].8V==8V){J.mu(i);1s}}},Ty:1a(8f){1p(K i=J.5j.1f-1;i>=0;i--){K 2k=J.5j[i];if(2k.5v!=1d&&2k.5y!=1d){if(2k.5v.ez==8f||2k.5y.ez==8f){J.mu(i)}}}},3M:1a(2k){if(2k===2y){1b}if(2k==1d){1b}1p(K i=0;i<J.5j.1f;i++){if(J.5j[i]==2k){J.mu(i);1s}}2k=1d},17l:1a(){1p(K i=J.5j.1f-1;i>=0;i--){J.mu(i)}},zk:1a(){1p(K i=J.5j.1f-1;i>=0;i--){if(J.5j[i].sF){J.mu(i)}}},mu:1a(1W){K 2k=J.5j[1W];if(2k.8V!=1d){J.oB(2k.8V.cc);J.oB(2k.8V.bg);J.oB(2k.8V.3a);J.oB(2k.8V.5e);4r 2k.8V}4r 2k;J.5j.5X(1W,1)},Tu:1a(8f){K 1O=[];1p(K i=J.5j.1f-1;i>=0;i--){K 2k=J.5j[i];if(2k.5v!=1d&&2k.5y!=1d){if(2k.5v.ez==8f||2k.5y.ez==8f){1O.1G(2k)}}}1b 1O},17q:1a(5j){if(5j==1d){1b 1k}if(5j.1f==0){1b 1k}J.z4();1p(K 1W=0;1W<5j.1f;1W++){K 8h=5j[1W];K az=1d;if(8h.5v!=1d&&8h.5y!=1d){az=J.zm(8h.5v.ao,8h.5y.ao)}if(az==1d){J.sz(8h)}1j{az.sF=1k;J.zl(az,8h)}}J.zk()},z4:1a(){1p(K i=J.5j.1f-1;i>=0;i--){J.5j[i].sF=1l}},oB:1a(1y){if(1y){if(1y.3M){1y.3M();1y=1d}}}};QB.1e.2i.zU=1a(1Q){J.28=1d;J.1I=1d;J.1Q=1a(2b){if(2b===2y){K 1Q=1T QB.1e.1U.S0;4w.RX(J,1Q);1b 1Q}1j{J.1I=1d;J.28=1d;4w.oW(2b,J);J.BT()}};J.BT=1a(){if(1B(J.1I)){J.1I=QB.1e.2i.RW(J.ez)}if(1B(J.28)){J.28=QB.1e.2i.RV(J.1I,J.ao);if(J.28==1d){J.28=QB.1e.2i.S8(J.1I,J.tS)}if(J.28==1d){J.28={};J.28.1g=QB.1e.2i.S7(J.1I)}}};J.oM=1a(hv){if(hv[J.ez]){J.1I=1d;J.ez=hv[J.ez]}if(hv[J.ao]){J.28=1d;J.ao=hv[J.ao]}J.BT()};if(1Q!=1d){J.1Q(1Q)}};QB.1e.2i.cU=1a(1Q){if(!QB.1e.2i.6v){1b 1d}K me=J;J.hO="";J.7K=1k;J.6x=1Q.6x==1l;J.5v=1T QB.1e.2i.zU;J.5y=1T QB.1e.2i.zU;J.8V=1d;J.id=4w.yj();J.RH=1a(7w){if(me.8V!=1d){1b}me.8V=QB.1e.2i.6v?QB.1e.2i.r.Sa(me,"#1dw|2"):1d};J.nJ=1a(){if(QB.1e.2i.6v){QB.1e.2i.r.zW(me)}};J.hf=1a(45){K cp=1k;3P(45){1q"76-2L":me.5v.4R=1S.8A.dR(me.5v.4R);cp=1l;1s;1q"76-to":me.5y.4R=1S.8A.dR(me.5y.4R);cp=1l;1s;1q"4r":me.7K=1l;cp=1l;1s;1q"f3":K 3V=$("#2k-f3-3V");K yZ=me.5v.28.1A;K zD=me.5y.28.1A;K o7=me.5v.1I.4D;K oe=me.5y.1I.4D;$("2a[1x=2L-1A]",3V).2b(o7.4Y);$("2a[1x=to-1A]",3V).2b(oe.4Y);$("2a[1x=2L-1A-2x]",3V)[0].4q=me.5v.4R==1S.8A.fb;$("2a[1x=to-1A-2x]",3V)[0].4q=me.5y.4R==1S.8A.fb;$("2a[1x=1A-3n-2a]",3V).2b(1S.S3(me.hO,yZ,o7,zD,oe));K 9o={};9o[" OK "]=1a(){me.5v.4R=$("2a[1x=2L-1A-2x]",3V).cK()?1S.8A.fb:1S.8A.ec;me.5y.4R=$("2a[1x=to-1A-2x]",3V).cK()?1S.8A.fb:1S.8A.ec;me.hO=$("2a[1x=1A-3n-2a]",3V).2b();K 1g=me.8V.1K[0];$("#qb-ui-1Y").1R(QB.1e.2i.cU.2l.pR,me);QB.1e.2i.e2();$(J).3V("6q")};9o[QB.1e.1U.3U.S2.gJ]=1a(){$(J).3V("6q")};3V.3V({5g:1k,4t:Ho,a8:Hj,1m:"S5",Hk:1l,9o:9o});1s}if(cp){K 1g=me.8V.1K[0];$("#qb-ui-1Y").1R(QB.1e.2i.cU.2l.pR,me)}QB.1e.2i.e2()};J.uQ=1a(){K 1Q=1T QB.1e.1U.S4;1Q.5v=J.5v.1Q();1Q.5y=J.5y.1Q();1Q.7K=J.7K;1Q.6x=J.6x;1Q.hO=J.hO;1b 1Q};J.uI=1a(1Q){J.5v.1Q(1Q.5v);J.5y.1Q(1Q.5y);J.7K=1Q.7K;J.6x=1Q.6x;J.hO=1Q.hO};J.1Q=1a(2b){if(2b===2y){1b J.uQ()}1j{J.uI(2b)}};J.oM=1a(hv){J.5v.oM(hv);J.5y.oM(hv)};J.8L=1a(){J.1Q(1Q);J.RH();K Ar=$(J.8V.bg.1u);Ar.1h("me",J);Ar.oA()};J.8L()};QB.1e.2i.cU.2l={pR:"pR"};QB.1e.e4=1a(){J.1g=1d;J.hC=1k;J.aW=1T 3Q;J.1J=1T 3Q;J.dG=J.1J;J.42="";J.eL=$("#qb-ui-3I-1J");J.t6=$(".qb-ui-3I-1i-42-5J");J.jZ=$("#qb-ui-3I-gZ-1J");J.1dl=1d;J.tM=$("#qb-ui-3I-1i-dJ-8c");J.Ae=1;J.RC=1a(2g,j5){K r=1T e3("("+j5+")","ig");1b 2g.3u(r,\'<2u 2s="qb-ui-3I-j5">$1</2u>\')};J.hM=1a(1u,3j,oX,mc){K me=J;K hV=1u.2Q;K 1K=1u.dv;K RO=1B(3j);if(1B(3j)){3j=J.eL;K uS=1u.dv.3R("/");1p(K i=1;i<uS.1f;i++){K AG=uS[i];if(1B(AG)){1s}K 1u=3j.5u("ul").5u("li:eq("+AG+")");if(1u.1f){3j=1u}1j{3j=1d;1s}}}if(1B(3j)){3j=J.eL}if(!1B(hV)){if(hV.1f>0){K $ul=3j.5u("ul");$ul.5u(".3I-1u").3K("dJ");if($ul.1f==0){$ul=$("<ul>").4o(3j);if(oX){if((1u.4R&QB.1e.2M.oG.5W)==0){J.z1($ul,1l)}1j{J.Aj($ul,1l)}}1j{if(3j.4H("1u-hY")||1u.AK<=J.Ae){J.z1($ul,1l)}1j{J.Aj($ul,1l)}}}1j{$ul.3J("")}1p(K i=0;i<hV.1f;i++){K 1i=hV[i];if(1i!=1d){K tY=QB.1e.1U.3U.4f.iW+" "+1i.4Y;K eT=1i.4Y;if(oX&&(1i.4R&QB.1e.2M.oG.5W)!=0){eT=1i.zH}eT=eT.3u(/ /g,"&2q;");if(oX){eT=J.RC(eT,J.42)}K hW="";K 1C=1S.oG.d7(1i.4R);if(!1B(1C)){hW+=1C+": "}hW+=1i.AJ;if(!1B(1i.eY)){hW+="\\n"+1i.eY}K A3=1i.AF;K 1do=1i.fP?"fP=1l ":"";K RQ=1i.AA?"qb-ui-1A ":"";K RD=A3?"1u-9K ":"1u-1dG ";K RP=\'<2C 2s="\'+RD+\'">&2q;</2C>\';K A4="1u-b7";if(mc&&mc.d0(1i.dv)){A4="1u-hY"}K 2u=\'<2u 6Q="0" 2s="3I-1u qb-ui-1Y-8U qb-ui-4k-8U qb-ui-1A-\'+1i.Aa+" "+RQ+(A3?"is-9K":"")+\'" 6s-3G="\'+tY+\'" 5b="\'+hW+\'">\'+eT+"</2u>";K $li=$("<li>"+RP+2u+"</li>");$li.1n("2s",A4);$li.1n("1W",1i.8b);$li.1n("eT",1i.4Y);$li.1n("1x",1i.3N);$li.1n("1dz",1i.zH);$li.1n("1K",1i.dv);$li.1n("a6",1i.g4);if(1i.fP){$li.1n("fP","1l")}}$ul.2Y($li);J.qd($ul);if(RO&&$ul.is(":6f")){J.z1($ul)}if(1i.2Q!=1d&&1i.2Q.1f>0){J.hM(1i,$li,oX,mc)}}}}};J.g0=1a(1h){if(1h==1d||1h===2y){1b}if(1h.RL&&1h.gB==J.42){J.eL.3B();J.jZ.5k();J.jZ.3J("");J.t6.3K("dJ");J.hM(1h,J.jZ,1l)}1j{J.jZ.3B();J.eL.5k();K mc=$("li.1u-hY","#qb-ui-3I-1J").ba(1a(){1b $(J).1n("1K")}).4z();J.hM(1h,1d,1k,mc)}};J.t5=1a(){J.42=$("#qb-ui-3I-1i-42-2a").2b()};J.uD=1a(e){$("#qb-ui-3I-1i-42-2a").2b("");J.42="";J.kA(e)};J.uF=1a(e){if(e.3Z==13){e.6R();1b 1k}J.t9(e)};J.uG=1a(e){if(e.3Z==13){e.6R();1b 1k}};J.kA=1a(e){J.42=e.7f.1o;if(1B(J.42)){J.jZ.3B();J.eL.5k();J.jZ.3J("")}1j{J.SB(J.42)}};J.Aj=1a($1u,lQ,$aC){if(1B($aC)){$aC=$1u.1P("li")}$aC.2r("1u-b7");$aC.3K("1u-hY");if(lQ){$1u.3B()}1j{$1u.RK(uT)}};J.z1=1a($1u,lQ,$aC){if(1B($aC)){$aC=$1u.1P("li")}$aC.2r("1u-hY");$aC.3K("1u-b7");if(lQ){$1u.5k()}1j{$1u.RN(uT)}};J.Ax=1a($1u,lQ,$aC){if(1B($aC)){$aC=$1u.1P("li")}$aC.8N("1u-hY");$aC.8N("1u-b7");if(lQ){$1u.dR()}1j{$1u.1dx(uT)}};J.qd=1a($1g){K me=J;$1g.2B(".qb-ui-1A").7g({2X:0.8,4o:"3H",p5:10,tZ:"mb",43:1a(e){K 1g=e.7f.3j;K $li=$(1g);K 1i=1T QB.1e.1U.jz;1i.6x=1l;1i.4Y=$li.1n("eT");1i.3N=$li.1n("a6");K 43=$("<2C ></2C>");43.6j({nb:1l,1A:1i,4t:Sk});43.2r("qb-ui-1Y-8U");1b 43[0]}});$1g.2B(".qb-ui-1A-28").7g({2X:1,4o:"3H",p5:10,tZ:"mb",43:1a(e){K $1g=$(e.7f.3j);K $tT=$1g.7u("li");K 1x=$1g.1n("1x");K 43=$(\'<2u 2s="qb-ui-3I-28-43 qb-ui-4k-8U qb-ui-1Y-8U">\'+1x.3u(/ /g,"&2q;")+"</2u>");43.1h("a6",$1g.1n("a6"));43.1h("eo",$tT.1n("a6"));1b 43[0]}})};J.wo=1a(){K me=J;K 1g=$(".qb-ui-3I-pE");J.hC=1g.4H("hC");J.C2=1g.4H("RM");if(!1B(1g.1n("Sz"))){J.Ae=6l(1g.1n("Sz"))}$("#qb-ui-3I-1i-5J").uN();$("#qb-ui-3I-1i-42-2a").4K("pH",me.uF,me);$("#qb-ui-3I-1i-42-2a").4K("8i",me.uG,me);$("#qb-ui-3I-1i-42-9J").4K("3F",me.uD,me);1a bD(1g){K $li=$(1g);K 1i=1T QB.1e.1U.jz;1i.6x=1l;1i.4Y=$li.1n("eT");1i.3N=$li.1n("a6");me.1g.1R(QB.1e.e4.2l.hb,1i)}$(2K).on("uM","#qb-ui-3I-1J .qb-ui-1A 2u",1a(e){if($(e.7f).4H("28")){1b 1k}bD(e.7f.3j);e.6R();1b 1k});$(2K).on("8i","#qb-ui-3I-1J .qb-ui-1A 2u",1a(e){if(e.3Z==13){bD(e.7f.3j);e.6R();1b 1k}});J.t5();J.1g=1g;1b 1g};J.A0=1a(e){K 1g=e.7f;1b J.At(1g)};J.Su=1a($li){if($li.1n("fP")){1b 1k}K me=J;$li.5u(".3I-1u").2r("dJ");K 1K=$li.1n("1K");QB.1e.2o.3s.fN.1G("AB");QB.1e.2o.3s.e4=1T QB.1e.1U.Af;QB.1e.2o.3s.e4.dv=1K;QB.1e.2o.Ad("AB",1a(){me.Sy($li)});1b 1l};J.Sy=1a($li){$li.5u(".3I-1u").3K("dJ");$li.1n("fP",1l)};J.SB=1a(42){K me=J;J.t6.2r("dJ");QB.1e.2o.3s.fN.1G("1dC");QB.1e.2o.3s.e4=1T QB.1e.1U.Af;QB.1e.2o.3s.e4.gB=J.42;QB.1e.2o.Ad("AB",1a(){me.Sx()});1b 1l};J.Sx=1a($li){J.t6.3K("dJ")};J.At=1a(1g){K $li=$(1g).1P("li");K $ul=$li.5u("ul");if($ul.1f&&$ul.3J()!==""){J.Ax($ul,1k,$li)}1j{if(!1B($li.1n("fP"))){J.Ax($ul,1k,$li)}1j{J.Su($li)}}};J.t9=$.ho(J.kA,n7,J);K me=J;$(2K).on("3F",".3I-1u.is-9K",1a(e){me.A0(e)});$(2K).on("3F",".1u-9K",1a(e){me.A0(e)})};QB.1e.e4.2l={ty:"ty",hb:"hb"};QB.1e.7e=1a(){J.1dB=10;J.3I=1d;J.hC=1k;J.aW=1T 3Q;J.1J=1T 3Q;J.dG=J.1J;J.42="";J.jx=6;J.eb=24;J.ql=3;J.eL=$("#qb-ui-3I-1J");J.tM=$("#qb-ui-3I-1i-dJ-8c");J.sq=0;J.kH=1k;J.uP=0;J.fq=1;J.SG=1k;J.jG=1a(1W){1p(K 1r in QB.1e.2M.jG){if(QB.1e.2M.jG[1r]==1W){1b 1r}}1b"1I"};J.hM=1a(){K me=J;K rD=1T 3Q;rD.1G("<ul>");J.eL.3J("");if(!1B(J.dG)){K 7a=J.dG.1f;K 3a=3A.6d((J.fq-1)*J.eb,7a);K 5e=3A.6d(J.fq*J.eb,7a);K rE="";1p(K i=3a;i<5e;i++){K 1i=J.dG[i];K u9=i+1==5e?" 7W":"";if(1i!=1d){K Cn=J.C2?\'<br><2u 2s="T1">\'+1i.eY+"</2u>":"";K tY=QB.1e.1U.3U.4f.iW+" "+1i.nB;K 1x=1i.nB.3u(/ /g,"&2q;");K hW=!1B(1i.g4)?1i.g4:1i.nB;if(!1B(1i.eY)){hW+="\\n"+1i.eY}K 2u=\'<2u 6Q="0" 2s="qb-ui-1Y-8U 1cZ \'+J.jG(1i.jG).3W()+\'" 6s-3G="\'+tY+\'" 5b="\'+hW+\'">\'+1x+"</2u>";if(!J.hC){rE=\'<li 2s="qb-ui-1A qb-ui-1A-1I\'+u9+\'" id="qb-ui-3I-1i-\'+i+\'">\'+2u+Cn+"</li>"}1j{K rF="";K BL="";K 28=1d;K BO="";1p(K j=0;j<1i.5A.1f;j++){28=1i.5A[j];BO="<2u 2s=\'28\'>"+28.tN.3u(/ /g,"&2q;")+"</2u>";K SH=j+1==1i.5A.1f?" 7W":"";BL=\'<li 2s="qb-ui-1A-28 qb-ui-4k-8U qb-ui-1Y-8U SK\'+SH+\'" id="qb-ui-3I-1i-28-\'+j+\'">\'+BO+"</li>";rF+=BL}rF=\'<ul 2s="qb-ui-3I qb-6f">\'+rF+"</ul>";rE=\'<li 2s="qb-ui-1A qb-ui-1A-1I 9K SK\'+u9+\'" id="qb-ui-3I-1i-\'+i+\'">\'+"<2C 2s=\\"4Z qb-ui-1A-4Z qb-ui-1A-1I-4Z 9K-4Z\\" 1cY=\\"$J = $(J); if ($J.4H(\'dH-4Z\')) { $J.1P().8N(\'dH\');$J.1P().8N(\'9K\'); $J.8N(\'dH-4Z\'); $J.8N(\'9K-4Z\'); $(\'~ul\', $(J)).3B(); } 1j {$J.1P().8N(\'dH\');$J.1P().8N(\'9K\'); $J.8N(\'dH-4Z\'); $J.8N(\'9K-4Z\'); $(\'~ul\', $(J)).5k(); }\\"></2C>"+2u+Cn+rF+"</li>"}}1j{rE=\'<li 2s="qb-ui-1A qb-ui-1A-1I\'+u9+\'" id="qb-ui-3I-1i-\'+i+\'">\'+\'<2u 2s="1I">\'+QB.1e.1U.3U.4f.sa+"</2u></li>"}rD.1G(rE)}}rD.1G("</ul>");J.eL.3J(rD.5x(""));J.qd();J.So();$("#qb-ui-3I-1i-5J").uN()};J.SC=1a(1h){K nH=$("#qb-ui-3I-aW");nH.3J("");J.aW=1T 3Q;1p(K i=0;i<1h.l0.1f;i++){K 9I=1h.l0[i];K gO=J.Sg(i+1,9I);gO.1h("1C",9I.4R);gO.1h("8f",9I.3w);K l6=gO.cK();K Ba=1T 3Q;K dr=-1;1p(K j=0;j<9I.rX.1f;j++){K 2W=9I.rX[j];if(dr==-1&&(!1B(l6)&&dX(2W.mp,l6))){dr=j}if(dr==-1&&2W.d4){dr=j}}if(dr==-1){dr=0}1p(K j=0;j<9I.rX.1f;j++){K 2W=9I.rX[j];K 2P="";if(2W.v0==1l){2P=" 2P"}K 1Z="";if(dr==j){1Z=" 1Z"}Ba.1G(\'<2W 1o="\'+2W.mp+\'"\'+2P+1Z+">"+2W.b9+"</2W>")}gO.3J(Ba.5x(""));gO.3L({1m:"100%"});J.aW.1G(gO)}};J.g0=1a(1h){if(1h==1d||2A 1h==="2y"){1b}if(1h.2Q==1d||2A 1h.2Q==="2y"){1b}K me=J;J.sq=1h.u4;J.SG=1h.SD==1l;J.kH=1k;K sc=1k;if(1h.gB!=""&&(1h.gB!=2y&&1h.gB!=1d)){sc=1l;J.kH=1l}if(1h.tJ==0){J.fq=1;J.SC(1h);J.1J=[];if(1h.2Q.1f!=1h.u4){J.kH=1l}}K Sh=1h.2Q.1f;K SF=1h.tJ;K SE=1h.u4;1p(K nn=SF,ua=0;nn<SE;nn++,ua++){if(ua<Sh){J.1J[nn]=1h.2Q[ua]}1j{if(J.1J[nn]==2y){J.1J[nn]=1d;J.kH=1l}}}J.BA(sc);J.hM();J.Sq()};J.St=1a(){if(J.1J.1f<J.sq){1b 1l}K 3a=3A.4n(0,(J.fq-1)*J.eb);K 5e=3A.6d(J.sq,J.fq*J.eb);1p(K i=3a;i<5e;i++){if(J.1J[i]==1d){1b 1l}}1b 1k};J.Sg=1a(i,9I){K nH=$("#qb-ui-3I-aW");K id="qb-ui-3I-aW-2x-"+i;K 1g=$("#"+id);if(1g.7a){1b 1g}K me=J;K 3J=$(\'<2C 2s="qb-ui-3I-aW-5J 1d1-\'+i+" 2x-1C-"+9I.4R+\'">                         <2C 2s="qb-ui-3I-aW-3G"></2C>                         <2C 2s="qb-ui-3I-aW-2x">                             <2x id="\'+id+\'"></2x>                         </2C>                     </2C>\');nH.2Y(3J);1g=$("#"+id);1g.1h("1W",i);1g.1h("8f",9I.3w);1g.4K("dF",me.Sp,me);1g.4K("1d4",me.Sr,me);1b 1g};J.tI=1a(Bf){K Sf=$("#qb-ui-3I-aW");K aW=$("2x",Sf);K Bc=[];aW.2p(1a(i,s){K 9I=1T QB.1e.1U.Sc;9I.Sb=s.1o;if(!1B(Bf)){9I.Sd=s.id==Bf.id}9I.4R=$(s).1h("1C");9I.3w=$(s).1h("8f");Bc.1G(9I)});1b Bc};J.1cR=1a(2x,1v){K me=J;K 1g=2x[0];1p(K i=0;i<1g.1v.1f;i++){K 2W=1g.1v[i];K eI=1T QB.1e.1U.Be;eI.mp=2W.1o;eI.b9=2W.2g;eI.d4=2W.1Z;1v.1G(eI)}};J.1cU=1a(2x,1v){K me=J;K 1g=2x[0];1p(K i=0;i<1g.1v.1f;i++){K 2W=1g.1v[i];K eI=1T QB.1e.1U.Be;eI.mp=2W.1o;eI.b9=2W.2g;eI.d4=2W.1Z;1v.1G(eI)}};J.t5=1a(){J.42=$("#qb-ui-3I-1i-42-2a").2b()};J.uD=1a(e){$("#qb-ui-3I-1i-42-2a").2b("");J.42="";J.kA(e)};J.BA=1a(sc){K tO=1d;K uc=!1B(J.42);if(uc){6E{tO=1T e3(J.42,"i")}6I(e){tO=1d;uc=1k}}if(!uc||sc){J.dG=J.1J;J.uP=J.sq}1j{if(!1B(J.1J)){J.dG=1T 3Q;1p(K i=0;i<J.1J.1f;i++){K 1i=J.1J[i];if(1i==1d){J.Bs();1b}if(!tO.9A(1i.nB)){aN}J.dG.1G(1i)}J.uP=J.dG.1f}}};J.uF=1a(e){if(e.3Z==13){e.6R();1b 1k}if(J.kH){J.t9(e)}1j{J.kA(e)}};J.uG=1a(e){if(e.3Z==13){e.6R();1b 1k}};J.kA=1a(e){J.fq=1;J.42=e.7f.1o;if(!J.kH){J.BA();J.hM()}1j{J.Bs()}};J.tX=1a(){J.eL.3J("");J.tM.5k()};J.Sq=1a(){J.tM.3B()};J.Bs=1a(){J.tX();K 1h=QB.1e.2o.3s;1h.7e=1T QB.1e.1U.sK;1h.7e.l0=J.tI();1h.7e.dM="4z";1h.7e.gB=J.42;QB.1e.2o.6h()};J.SA=1a(){J.tX();K 1h=QB.1e.2o.3s;1h.7e=1T QB.1e.1U.sK;1h.7e.l0=J.tI();1h.7e.dM="4z";1h.7e.gB=J.42;1h.7e.tJ=(J.fq-1)*J.eb;QB.1e.2o.6h()};J.Sp=1a(e){K me=J;K 1W=$(e.7f).1h("1W");K 1h=QB.1e.2o.3s;1h.7e=1T QB.1e.1U.sK;1h.7e.l0=J.tI(e.3f);J.Ss(1W);QB.1e.2o.6h()};J.Ss=1a(1W){1p(K i=1W;i<J.aW.1f;i++){K gO=J.aW[i];gO.3J("<2W>sa...</2W>")}J.tX()};J.Sr=1a(){};J.qd=1a(){K me=J;$(".qb-ui-1A>2u").7g({2X:0.8,4o:"3H",p5:10,tZ:"mb",3a:1a(1N,ui){},43:1a(e){K 1g=e.7f.3j;K tU=1g.id.7x("qb-ui-3I-1i-".1f);K 1i=me.dG[tU];K 43=$("<2C ></2C>");1i.6x=1l;43.6j({nb:1l,1A:1i,4t:Sk});43.2r("qb-ui-1Y-8U");1b 43[0]}});$(".qb-ui-1A-28").7g({2X:1,4o:"3H",tZ:"mb",p5:10,43:1a(e){K 1g=e.7f;K tU=1g.id.7x("qb-ui-3I-1i-28-".1f);K tT=$(1g).7u("li");K Sn=tT.1n("id").7x("qb-ui-3I-1i-".1f);K uO=me.dG[Sn];if(uO==1d){1b}K 1i=uO.5A[tU];if(1i==1d){1b}K 43=$(\'<2u 2s="qb-ui-3I-28-43 qb-ui-4k-8U qb-ui-1Y-8U">\'+1i.7k.3u(/ /g,"&2q;")+"</2u>");43.1h("1A",1i);43.1h("9u",uO);1b 43[0]}});$(".4Z",J.3I).3F(1a(e){})};J.So=1a(){K me=J;K 7a=3A.ko(J.uP/J.eb);K 1g=$("#qb-ui-3I-1i-1d9-5J");if(7a<=1){1g.3J("");1b}if(me.Se==7a){me.BP=$("#qw").57()}1j{me.Se=7a;me.BP=0}1g.uL({7a:7a,3a:J.fq,4T:me.jx,gn:1k,mU:"#1e6",mX:"3r",mP:"#1ea",mO:"3r",Cc:1l,uW:"SI",o4:1a(E4){me.fq=6l(E4);me.Sv();me.hM()}});$("#qw").57(me.BP)};J.Sv=1a(){if(!J.St()){1b}J.SA()};J.wo=1a(){K me=J;K 1g=$(".qb-ui-3I");J.hC=1g.4H("hC");J.C2=1g.4H("RM");if(1g.1n("RF")!=""){J.eb=1g.1n("RF")}if(J.eb<=0||J.eb==""){J.eb=24}if(1g.1n("RJ")!=""){J.ql=1g.1n("RJ")}if(J.ql<=0||J.ql==""){J.ql=3}K C0=1g.1n("jx");if(C0!=""){6E{K jx=6l(C0);if(jx>0){J.jx=jx}}6I(e){}}$("#qb-ui-3I-1i-42-2a").4K("pH",me.uF,me);$("#qb-ui-3I-1i-42-2a").4K("8i",me.uG,me);$("#qb-ui-3I-1i-42-9J").4K("3F",me.uD,me);1a bD(1g){K RG=1g.id.7x("qb-ui-3I-1i-".1f);K 1i=me.dG[RG];me.3I.1R(QB.1e.7e.2l.hb,1i)}$(2K).on("uM","#qb-ui-3I-1J .qb-ui-1A 2u",1a(e){if($(e.7f).4H("28")){1b 1k}bD(e.7f.3j)});$(2K).on("8i","#qb-ui-3I-1J .qb-ui-1A 2u",1a(e){if(e.3Z==13){bD(e.7f.3j)}});J.t5();J.3I=1g;1b 1g};J.t9=$.ho(J.kA,n7,J);1b J.3I};QB.1e.7e.2l={ty:"ty",hb:"hb"};QB.1e.G1=1a(28,69,tz,1v){K me=J;J.jX=1S.jU.fu;J.1A=28;J.1I=tz;J.1P=69;J.4q=28.d4;J.1g=$(\'<tr 6Q="-1" />\').2r("qb-ui-1I-28 a9").1h("J",J).1h("1A",28).1h("1I",tz).1h("hR",28.3w).1h("1P",69).1h("uj",69.3w);4w.Hu(J.1g,QB.1e.1U.3U.4f.fu+" "+28.7k);if(28.7k=="*"){J.1g.2r("qb-ui-1I-28-kB")}J.tk=$(\'<2a 1C="9f" 1o="1" 6Q="-1" \'+(28.d4?" 4q":"")+"/>").3F(1a(){me.eH(J.4q);tz.ug([me])});J.1g.8i(1a(e){3P(e.3Z){1q 13:;1q 32:me.tk.1R("3F");e.4I()}});J.AE=$(\'<2u 2s="qb-ui-1I-28-3T">&2q;</2u>\');if(28.rZ){J.AE.2r("qb-ui-1I-28-3T-pk")}K q3=1v.Az;K rl=1v.Ay;K An=1v.Aq;K tc=1v.tx;K tn=1v.s3;K 6i=28.tN;if(1B(6i)){6i=28.7k}K SW=!1B(28.Ap)?\'<2u 2s="qb-ui-1I-28-1C-4l">\'+"("+28.Ap+")"+"</2u>":"";K tb=28.7k!="*"&&(28.tw!=1d&&28.tw!="1d")?tc.d5+28.tw+SW+1v.tx.ep:"";J.T2=$(\'<2u 2s="qb-ui-1I-28-2x">\'+q3.d5+"</2u>").2r(QB.1e.2i.tB?"qb-6f":"").2Y(J.tk);J.6i=$(\'<2u 2s="qb-ui-1I-28-1x">\'+rl.d5+2q(6i)+rl.ep+"</2u>").2r(QB.1e.2i.tG?"qb-6f":"");J.tb=$(\'<2u 2s="qb-ui-1I-28-1C">\'+tb+"</2u>").2r(QB.1e.2i.tH?"qb-6f":"");J.SZ=$(\'<2u 2s="qb-ui-1I-28-T1">\'+q3.d5+(tn.ub?28.G5:2q(28.G0))+1v.s3.ep+"</2u>").2r(QB.1e.2i.tu?"qb-6f":"");K 6p=[];6p.1G({3q:J.AE,93:-1,8g:1l});6p.1G({3q:J.T2,93:q3.93,8g:q3.8g});6p.1G({3q:J.6i,93:rl.93,8g:rl.8g});6p.1G({3q:J.tb,93:tc.93,8g:tc.8g});6p.1G({3q:J.SZ,93:tn.93,8g:tn.8g});6p.ud("93");K 7N;if(An){7N=me.1g}1j{7N=$("<td W3 />");7N.4o(me.1g)}1p(K i=0;i<6p.1f;i++){K 3O=6p[i];if(An){7N.2Y($("<td td"+(i+1)+\'" />\').2Y(3O.3q))}1j{7N.2Y(3O.3q)}}J.eH=1a(1o){J.4q=1o;J.1A.d4=J.4q;J.tk[0].4q=J.4q};J.7p=1a(){K 5N={x:0,y:0,1m:0,1w:0};K o=J.1g;K Il=hJ(QB.1e.2i.1Y[0]);K h7=hJ(o,Il);K 1P=o;do{if(1P.6J.9p()=="T0"){1P=1P.3j;if(1P){1P=1P.3j}1s}1P=1P.3j}4x(1P!=1d);K h8=h7;if(1P!=1d){h8=hJ(1P,Il)}if(h7.1M<h8.1M){5N.y=h8.1M}1j{if(h7.1M>h8.4P-h7.1w/2){5N.y=h8.4P-h7.1w/2}1j{5N.y=h7.1M}}5N.1w=h7.1w;5N.1m=h8.1m;5N.x=h8.2f;1b 5N}};QB.1e.G1.2l={SO:"SO"};K IV=20;QB.1e.9c=1a(){J.3q=$("#qb-ui-1Y-aI");J.1V=1d;K kj=J;K jy=J.3q;K lX=0;K qo=0;K lA=0;J.Qq=1a(sQ){if(J.3q.1n("SQ")&&J.3q.1n("SQ").3W()=="1k"){1b}K $3E=$("#qb-ui-1Y-aI-8x");if(!$3E){1b}K $bd=[];1p(K i=0;i<sQ.2Q.1f;i++){K 1i=sQ.2Q[i];K 2g=1i.b9;if(1B(2g)){2g="&2q;"}if(2g==="+"){2g=QB.1e.3D.fD.fW}K $1g=$(\'<2C 2s="3q" id="qb-ui-1Y-aI-8x\'+(i+1)+\'">\'+2g+"</2C>").2r(1i.ja);$1g.dC();if(1i.eK){$1g.2r("ui-4N-8R");$1g.1n("6Q",-1)}1j{$1g.1n("6Q",0);$1g.8i(1a(e){if(e.3Z==32||e.3Z==13){$(e.3f).1R("3F")}})}$1g.1h("1i",1i);$1g.3F(1a(e){K $1g=$(e.7f);if($1g.1h("SR.ia")){1b}K 1i=$1g.1h("1i");if(1i&&1i.dM){QB.1e.3D.z5(1i.dM)}1j{$("#"+$1g[0].id).2O()}if(1i&&1i.eK){$1g.2r("ui-4N-8R");e.4I();1b 1k}});$1g.7r(1a(e){K $1g=$(e.7f);K 1i=$1g.1h("1i");if(1i&&1i.eK){$1g.2r("ui-4N-8R");e.4I();1b 1k}});$1g.4W(1a(e){K $1g=$(e.7f);K 1i=$1g.1h("1i");if(1i&&1i.eK){$1g.2r("ui-4N-8R");e.4I();1b 1k}});$1g.oA();J.Q3($1g,1i.gQ);$bd.1G($1g)}$3E.eC();$jy=$(\'<2C id="qb-ui-1Y-aI-8x-jy">\');$jy.4o($3E).2Y($bd)};1a uH(9y,51){if(9y<0){9y=0}1j{if(9y>lA){9y=lA}}Te(9y)}1a Te(9y){if(9y===2y){9y=1bE.2R().2f}HF=9y;K 1bG=HF===0,1bY=HF==lA,lC=9y/lA,Ti=-lC*(lX-qo);jy.2T("2f",Ti)}1a uy(){1b-jy.2R().2f}1a 1bW(s6,sv,aO){1b 1a(){T6(s6,sv,J,aO);J.4W();1b 1k}}1a T6(s6,sv,bZ,aO){bZ=$(bZ).2r("T7");K 3l,q0,HE=1l,HT=1a(){if(s6!==0){kj.H5(s6*30)}if(sv!==0){kj.H0(sv*30)}q0=6P(HT,HE?wq:50);HE=1k};HT();3l=aO?"eM.kj":"7i.kj";aO=aO||$("3J");aO.2S(3l,1a(){bZ.3K("T7");q0&&iB(q0);q0=1d;aO.8Q(3l)})}J.IT=1a(7y){if(7y==1d||7y.1f==0){1b 1d}K 1J={};K 5F;1p(K i=0;i<7y.1f;i++){5F=7y[i];K 1r=5F.cX;if(5F.3N!=1d&&5F.3N.7x(0,1)=="-"){1J[1r]=5F.3N}1j{1J[1r]={1x:5F.3N,3T:1r+(5F.HN?" 4q":""),1J:J.IT(5F.2Q),1h:5F}}}1b 1J};J.Q3=1a($1g,1V){K me=J;if(1B(1V)||1V.2Q.1f==0){1b}K 1J=J.IT(1V.2Q);K 4s="#"+$1g[0].id;$.2O("6C",4s);$.2O({4s:4s,4t:aJ,7v:{5D:0},1J:1J,1X:1a(45,1v){K 5F=1v.1J[45].1h;me.xZ(45,5F)}});$.2O.mr.1bZ=1a(1i,1L,2D){J.on("8i",1a(e){})}};J.xZ=1a(1r,1i){K 45=1d;if(1i!=1d&&2A 1i.dM!="2y"){45=1i.dM}45.3w=QB.1e.2o.ea;J.3q.1R(QB.1e.9c.2l.w9,45)};J.tE=1a(s){if(s==1d){1b s}if(s.1f<=IV){1b s}1b s.7x(0,IV)+"&1bS;"};J.PR=1a(1P){K 1J=[];if(1P==1d){1b 1J}$.2p(1P.2Q,1a(1W,1i){if(!1i.8g){1b}if(1i.eK){1b}1J.1G(1i)});1b 1J};J.PU=1a(1P){K fj=1d;if(1P==1d){1b fj}$.2p(1P.2Q,1a(1W,1i){if(1i.eK){fj=1i}});1b fj};J.IF=1a($3d){$3d.1n("6Q",0);$3d.8i(1a(e){if(e.3Z==32||e.3Z==13){$(e.3f).1R("3F")}})};J.Gq=1a(1i,2P){K me=J;K 3T="ui-3T-qb-"+1i.6L;K $3d=$(\'<2C 2s="8M J4-3d">\'+J.tE(1i.4Y)+"</2C>").1h("GS",1i.3w).1h("gk",1i.gk).dC({2P:2P,d9:{oR:3T}}).3F(1a(e){me.tv(e);e.6R();1b 1k});$3d.2r("J4-3d");if(2P){$3d.2r("ui-4N-8R");$3d.2r("J4-3d-8R")}1j{J.IF($3d)}$3d.5u(".ui-3T-qb-rz").3J(QB.1e.3D.fD.xB);1b $3d};J.PW=1a(1J){K me=J;K $ul=$("<ul/>");$.2p(1J,1a(1W,h4){K 3T="ui-3T-qb-"+h4.6L;K $li=$("<li></li>").4o($ul);K 3b="";if(h4.6L==="rz"){3b=QB.1e.3D.fD.xB}$li.2Y(\'<2u 2s="ui-3T \'+3T+\'">\'+3b+"</2u>");K $3d=$(\'<a 5B="#\'+me.tE(h4.4Y)+\'">\'+me.tE(h4.4Y)+"</a>").1h("GS",h4.3w).1h("gk",h4.gk).3F(1a(e){$ul.3B();me.tv(e);e.6R();1b 1k});$li.2Y($3d)});$ul.1V({2x:1a(e,ui){$ul.3B();me.tv(e);e.6R();1b 1k}});me.pr=1d;me.IK=gI;$ul.on("1bV",1a(){iB(me.pr)}).on("1bU",1a(1N){if(me.It){1b}me.pr=6P(1a(){$ul.3B()},me.IK)});1b $ul};J.Gg=1a(1i,1P){K me=J;K 8x=[];if(1i==1d){1b 8x}K 1J=J.PR(1i);K fj=J.PU(1i);K Iq=fj===1d;K $3d=J.Gq(1i,Iq);$3d.2r("3d-5V");8x.1G($3d);K qD=1d;if(1i.tC!=1d&&1i.tC.1f>0){qD=1i.tC}1j{if(1P!=1d&&1P.2Q.1f>1){qD=1P.2Q}}if(qD!=1d){K k5=Iq;$3d.dC("2W","d9.Rs","ui-3T-qf-1-s");$3d.5u(".ui-3T-qb-rz").3J(QB.1e.3D.fD.xB);$3d.7r(1a(e){if(me.1V!=1d){me.1V.3B()}me.1V=$(J).3C("ul").5k().2R({my:"2f 1M",at:"2f 4P",of:$(J)});me.1V.2T({"6d-1m":$(J).8q()});$(2K).tF("3F",1a(){me.1V.3B()})}).on("iE",1a(){iB(me.pr);me.It=1l}).on("eM",1a(1N){me.It=1k;me.pr=6P(1a(){me.1V.3B()},me.IK)});K $PX=$("<2C>&2q;</2C>").dC({2g:1k,d9:{oR:"ui-3T-qf-1-s"}}).3F(1a(e){if(me.1V!=1d){me.1V.3B()}me.1V=$(J).3C().5k().2R({my:"2f 1M",at:"2f 4P",of:$(J).49(".ui-3d")});$(2K).tF("3F",1a(){me.1V.3B()});e.6R();1b 1k});J.IF($PX);K $ul=J.PW(qD);8x.1G($ul)}if(1J.1f>0||1l){if(fj!=1d){}1j{K $2C=$(\'<2C 2s="ui-8u-7M ui-4N-8R ui-b2-76 8M-3d-3E 3d-5V">&2q;</2C>\').dC({2P:1l});$2C.2r("ui-4N-8R");8x.1G($2C);$.2p(1J,1a(1W,h4){K 3d=me.Gq(h4);$2C.5u(".ui-3d-2g").2Y(3d)})}}1j{if(fj!=1d){}}if(fj!=1d){K Ql=J.Gg(fj,1i);8x=8x.4b(Ql)}1b 8x};J.tv=1a(e){K $1g=$(e.7f);K aA=$1g.1h("gk");if(!1B(aA)){J.3q.1R(QB.1e.9c.2l.wb,aA)}1b 1k};J.Qt=1a(dY){K me=J;K $3q=$("#qb-ui-1Y-aI-1bo-3E");if(dY!=1d&&dY.2Q!=1d){K $1J=me.Gg(dY);K $Qn=$("<2C id=\'qb-ui-1Y-8M-fW-3d\'>"+QB.1e.3D.fD.fW+"</2C>");$3q.eC();$3q.2Y($1J);$3q.2B(".8M-3d-3E > .ui-3d-2g").2Y($Qn);$3q.1bs({1J:".3d-5V"});$3q.2B("ul").1n("6Q",-1);$3q.2B("a").1n("6Q",0)}1b $3q};$.4C(J,{1br:1a(s){s=$.4C({},3i,s);1bq(s)},Ps:1a(aO,Pg,51){Ps(aO,Pg,51)},fm:1a(9y,lG,51){t8(9y,51);uA(lG,51)},t8:1a(9y,51){t8(9y,51)},uA:1a(lG,51){uA(lG,51)},1cz:1a(Pl,51){t8(Pl*(lX-qo),51)},1cy:1a(PH,51){uA(PH*(ur-H9),51)},H4:1a(pY,pU,51){kj.H5(pY,51);kj.H0(pU,51)},H5:1a(pY,51){K 9y=uy()+3A[pY<0?"bj":"ko"](pY);K lC=9y/(lX-qo);uH(lC*lA,51)},H0:1a(pU,51){K lG=H2()+3A[pU<0?"bj":"ko"](pU),lC=lG/(ur-H9);uw(lC*Rg,51)},uH:1a(x,51){uH(x,51)},uw:1a(y,51){uw(y,51)},51:1a(aO,6U,1o,Px){K 1D={};1D[6U]=1o;aO.51(1D,{"5D":3i.1cC,"6B":3i.1cu,"eg":1k,"qL":Px})},1cL:1a(){1b uy()},1cO:1a(){1b H2()},1cG:1a(){1b lX},1cK:1a(){1b ur},1cJ:1a(){1b uy()/(lX-qo)},1c9:1a(){1b H2()/(ur-H9)},1c8:1a(){1b 1c7},1c6:1a(){1b 1c5},1cl:1a(){1b jy},1cq:1a(51){uw(Rg,51)},1cp:$.ux,6C:1a(){6C()}});1b J};QB.1e.jO=1a(){J.1g=1d;J.hC=1k;J.GO=1a(q7){if(q7==1d||q7.1f<=0){1b 1d}K GT=0;K $1g=$("<ul />");1p(K i=0;i<q7.1f;i++){K 1u=q7[i];if(!1u.8g){aN}GT++;K $li=$("<li />");$li.1h("GS",1u.3w);$li.1h("gk",1u.gk);$li.3J(\'<2u 2s="\'+1u.6L+(1u.eK?" 8R":"")+\'">\'+1u.4Y+"</2u>");$li.2Y(J.GO(1u.2Q));$1g.2Y($li)}if(GT>0){1b $1g}1b 1d};J.EG=1a(dY){K me=J;K 3q=$("#qb-ui-3I-GP");if(dY!=1d&&dY.2Q!=1d){3q.3J("");3q.2Y(me.GO([dY]));K 1g=$("#qb-ui-3I-GP>ul");J.1g=1g.nG({});1g.2B("*").uN();$("#qb-ui-3I-GP 2u").3F(1a(){K $1g=1d;K aA=1d;if(J.nH!=1d){$1g=$(J.nH);aA=$1g.1h("gk")}if(!1B(aA)){me.1g.1R(QB.1e.jO.2l.wa,aA)}1b 1k})}1b 3q};J.qd=1a(){K me=J;$(".4Z",J.1g).3F(1a(e){})};$("#qb-ui-1Y-aI-fW-3d").dC({d9:{Rs:"ui-3T-qf-1-s"}});1b J.1g};QB.1e.jO.2l={wa:"wa"};QB.1e.9c.2l={wb:"wb",w9:"w9"};K kL=1d;QB.1e.7L={4D:1d,5M:[],1v:{1cm:"<3e 2s=\'qb-ui-1I-eG-2g-qP-1x\'>{qP}</3e>.<3e 2s=\'qb-ui-1I-eG-2g-1I-1x\'>{1x}</3e>",tR:1l,g1:1k,Ro:"",7g:1l,3B:1d,1w:"6a",1m:"6a",cJ:5,fp:90,9d:1k,a8:1k,6v:1l,nb:1k,2R:{my:"2f 1M",at:"2f+15 1M+15",of:"#qb-ui-1Y",jk:"3r",1c2:1a(3t){K GZ=$(J).2T(3t).2v().1M;if(GZ<0){$(J).2T("1M",3t.1M-GZ)}}},5g:1l,5k:1d,uS:1l,5b:"",4t:9i,9C:150,7n:uT},1cH:{Wk:"3a.7g",5T:"5T.7g",Wq:"6y.7g",9d:"9d.5g",cJ:"cJ.5g",a8:"a8.5g",fp:"fp.5g",Xh:"3a.5g",61:"5T.5g",Xi:"6y.5g"},7N:1d,bB:1d,Rr:"qb-ui-1I "+"ui-8u "+"ui-8u-cY "+"ui-b2-76 ",dc:1k,a9:".a9:6v",Rp:".a9:6v:4A",QC:".a9:6v:7W",hf:1a(45){K me=J;if(me.4D!=1d&&me.4D.6x){1b 1k}3P(45){1q"eH":me.GG(1l);1s;1q"1cQ":me.GG(1k);1s;1q"4r":me.6q();1s;1q"1cx":me.Wv();1s;1q"f3":K 3V=me.pS(me);if(3V!=1d){3V.3V("7C")}1s}},f7:1a(){K me=J;K 6z=".eG-3d.3d-2k";$.2O("6C",6z);K 1J={};K ek=1d;1p(K i=0;i<me.4D.pu.1f;i++){K gx=me.4D.pu[i];if(ek==1d){ek=gx.qC}if(ek!=gx.qC){1J["6e-"+i]="---------";ek=gx.qC}1J[gx.4Y]={1x:gx.4Y,3T:"1ct-1A-ek-"+gx.qC,1h:gx,db:gx.v0?"j5":""}}$.2O({4s:6z,4t:aJ,7v:{5D:0},1X:1a(45,1v){K yd=1v.$1Z.1h().2O.1J[45];me.1g.1R(QB.1e.7L.2l.sJ,yd.1h)},1J:1J});1b 6z},QF:1a(3d){K me=J;K 6z=".eG-3d.3d-2k";if(me.4D==1d){1b}3d.88(1a(){me.f7();$(6z).2O();K $1V=$(6z).2O("1g");if($1V){$1V.2R({my:"2f 1M",at:"2f 4P",of:J})}})},oS:1a(7P){K me=J;J.4D=me.1v.1A;J.gV=1k;if(!J.5M){J.5M=[]}K 69=J.4D;if(J.4D!=1d&&!1B(J.4D.6F)){J.6F=J.4D.6F}1j{J.6F=Gr()}69.6F=J.6F;$(me.1g).1h("4D",69);$(me.1g).1h("me",J);K uY=0;6E{uY=6l(me.1g.2T("z-1W"));if(uY>0){me.1v.4t=uY}}6I(e){}me.1g.2r(J.Rr+me.1v.Ro).2T({2R:"7X",4t:me.1v.4t});me.1g.1n("6Q",0);if(!7P){me.1g.3k(1a(e){me.dc=1k})}1a gd(3k){K 1O=1d;if(3k.4H("qb-ui-1I")){1O=3k}1j{1O=3k.3C()}4x(1l){if(1O.1f==0){1s}if(1O.is(me.a9)){1b 1O}K a4=1O.2B(me.Rp);if(a4.1f){1b a4}1O=1O.3C()}K 1P=3k.1P();if(1P.4H("qb-ui-1I")){1b $()}1b gd(1P)}1a gj(3k){K 1O=1d;if(3k.4H("qb-ui-1I")){1O=3k}1j{1O=3k.49()}4x(1l){if(1O.1f==0){1s}if(1O.is(me.a9)){1b 1O}K a4=1O.2B(me.QC);if(a4.1f){1b a4}1O=1O.49()}K 1P=3k.1P();if(1P.4H("qb-ui-1I")){1b $()}1b gj(1P)}if(!7P){me.1g.8i(1a(e){3P(e.3Z){1q 13:if(me.dc){1b}me.dc=1l;gd(me.1g).3k();e.4I();1s;1q 9:if(!me.dc){1b}K 3k=me.1g.2B(":3k");if(!3k.1f){3k=me.1g}K 1g=1d;if(e.nV){1g=gj(3k)}1j{1g=gd(3k)}if(1g.1f){1g.3k();e.4I();1b 1k}1j{me.dc=1k}}})}J.5Z=me.1g;if(me.1v.9X){me.1v.2R.at="2f+"+me.1v.9X[0]+" 1M+"+me.1v.9X[1];me.2R.2v=me.1v.2R.2v;me.od(me.1v.9X);me.1v.9X=1d}if(J.lR==1d){J.lR=$(\'<2u 2s="qb-ui-1I-eG-2g"></2u>\')}K 5b=J.WS();4w.Hu(me.1g,QB.1e.1U.3U.4f.iW+" "+5b);J.lR.1n("5b",J.4D.4Y);J.lR.3J(5b);if(J.d3==1d){J.uJ=[];if(!1B(J.4D)&&!1B(J.4D.Hp)){J.uJ=J.sT("8M","ui-3T-8M-uK").1n("6s-3G","").1n("6s-3G","1cD to 8M");J.uJ.3F(1a(1N){me.1g.1R(QB.1e.7L.2l.sH,me.4D.Hp);1b 1k})}J.pA=J.sT("2k","ui-3T-2k-uK").1n("6s-3G","").1n("6s-3G","1bv kO");J.HA=J.sT("f3","ui-3T-f3-uK").1n("6s-3G",QB.1e.1U.3U.4f.mV);J.Hz=J.sT("6q","ui-3T-6q-uK").1n("6s-3G","").1n("6s-3G","Hr");J.d3=$(\'<2C 2s="qb-ui-1I-eG ui-8u-7M ui-b2-76 ui-43-1by 7l-1I"></2C>\').2Y(J.lR).2Y(J.uJ).2Y(J.pA).2Y(J.HA).2Y(J.Hz).2S("uM",1a(){me.QT()});J.d3.4o(me.1g).2r("qb-ui-1I-28-5b");J.d3.1h("b7",1k);J.Hz.3F(1a(1N){me.6q(1N);1b 1k});J.HA.3F(1a(1N){if(me.4D!=1d&&me.4D.6x){1b 1k}K 3V=me.pS(me);if(3V!=1d){3V.3V("7C")}1b 1k});J.QF(J.pA)}if(J.4D!=1d&&J.4D.6x){J.d3.2B(".3d-f3").3B();J.d3.2B(".3d-2k").3B()}1j{J.d3.2B(".3d-f3").5k();J.d3.2B(".3d-2k").5k()}if(!QB.1e.3D.wj&&(69!=1d&&(69.pu!=1d&&69.pu.1f>0))){J.pA.5k()}1j{J.pA.3B()}K pB=1l;if(7P){if(69&&69.5A){if(J.5M.1f==69.5A.1f+1){6E{if(J.5M.1f>1&&69.5A.1f>1){K h5=J.5M[1].1A;K hc=69.5A[1];pB=h5.3w!=hc.3w}}6I(e){pB=1l}}1j{pB=1l}}}if(pB){if(me.bB!=1d){me.bB.3M()}me.bB=$(\'<2C 2s="qb-ui-1I-28-3E ui-3V-cY ui-8u-cY"></2C>\').9v(1a(){QB.1e.2i.j3()}).1n("6Q",-1);me.7N=me.bB;me.pF=$(\'<1I yG="0" yB="0"></1I>\').4o(me.bB);if(!me.1v.nb&&(me.4D.6x&&(69==1d||69!=1d&&(69.5A==1d||69.5A!=1d&&69.5A.1f==0)))){J.W6(me.pF)}1j{if(69&&69.5A){J.Wg(69,me.pF)}}me.bB.4o(me.1g);me.bB.oA()}if(J.4D.6x){me.bB.2r("tV")}1j{me.bB.3K("tV")}me.lc=me.1g[0].gy-me.7N[0].gy;me.1v.cJ=3A.4n(me.1v.cJ,me.lc);me.1v.9d=1k;$(".qb-ui-1I-28:Qs",me.pF).2r("Qs");me.1v.7g&&($.fn.7g&&J.IA());me.1v.5g&&($.fn.5g&&J.IJ());if(!7P){J.ri=1k}me.1v.g1&&($.fn.g1&&me.7N.g1());me.1v.g1&&($.fn.g1&&me.1g.g1());me.QQ();me.1v.9d=1k;me.1v.tR&&J.7C();J.jX=1S.jU.ai;me.1g.1h("Qv",me);me.1g.1h("1A",69);me.1g.1h("hR",69.3w);me.1g.2B("*").uN();me.1g.88(1a(1N){me.GC(1k,1N)});J.QT=1a(){if(me.1g.1h("b7")){me.1g.1h("b7",1k);me.b7=1k;me.2W("1w",J.QX)}1j{me.1g.1h("b7",1l);me.b7=1l;J.QX=J.2W("1w");me.2W("1w",J.d3.aE("7h"))}QB.1e.2i.e2();1b 1k};K 5M=$(".qb-ui-1I-28",me.1g).42(":6r(.qb-ui-1I-28-kB)");if(!QB.1e.2i.um&&!QB.1e.2i.p0){5M.7g({p5:10,9v:1k,43:1a(1N){K 3f=1N.3f;K tr=1d;if(3f.6J.9p()=="TR"){tr=$(3f).6w()}1j{K 1P=3f;do{if(1P.6J.9p()=="TR"){1s}1P=1P.3j}4x(1P!=1d);if(1P){tr=$(1P).6w()}}K 43=$(\'<1I 2s="qb-ui-1I ui-8u ui-8u-cY qb-ui-7g-43-28" yB="0" yG="0"></1I>\').2Y(tr);kL=43;1b 43},4o:"#qb-ui-1Y",2X:0.8,3a:1a(1N,ui){QB.1e.3D.Ey();me.1g.1h("Hd",1l);K 43=$(ui.43);K pe=$(J);ui.43.1m($(J).1m());QB.1e.2i.7D.3M(lK);lK=1T QB.1e.2i.cU({5v:{28:{1g:pe},1I:me},5y:{28:{1g:43}}});QB.1e.2i.7D.1G(lK);me.gV=1k},6y:1a(1N,ui){QB.1e.2i.7D.3M(lK);QB.1e.2i.e2();me.1g.1h("Hd",1k);kL=1d},5T:1a(1N,ui){QB.1e.2i.j3()}}).8U({Ie:".qb-ui-1I-28",yu:"qb-ui-1I-28-j5",fr:"Hg",2E:1a(1N,ui){QB.1e.3D.RE(J)},fz:1a(1N,ui){if(me.4D.6x){$(ui.43).2r("tV")}1j{$(ui.43).3K("tV")}QB.1e.3D.RB(J)},If:1a(1N,ui){if(me.4D.6x){1b 1k}if(!Vj(1N.3f,$("#qb-ui-1Y").4z(0))){1b 1k}K 1M=QB.1e.3D.RI();if(1M.1f&&1M[0]!=J){1b}QB.1e.3D.Ey();K h5=$(ui.7g);K hc=$(J);K Hh="";if(h5.1h("1A")&&h5.1h("1A").7k){Hh=h5.1h("1A").7k}K Hi="";if(hc.1h("1A")&&hc.1h("1A").7k){Hi=hc.1h("1A").7k}K 2k=QB.1e.2i.7D.sz({6x:1l,5v:{ez:h5.1h("uj"),ao:h5.1h("hR"),tS:Hh},5y:{ez:hc.1h("uj"),ao:hc.1h("hR"),tS:Hi}});QB.1e.2i.e2();K 1Q=2k.1Q();me.1g.1R(QB.1e.7L.2l.sf,1Q);me.1g.1h("Hd",1k);me.gV=1k}})}},pS:1a(2V){K dp="#1I-f3-3V";if(1B(QB.1e.3D.gL[dp])){K $jK=$(dp);if($jK.1f){K 9o={};9o[" OK "]=1a(){K 4D=$(J).1h("4D");4D.9b=$("2a[1x=1A-aj]",$(J)).cK();4D.5c=$("2a[1x=1A-1x]",$(J)).cK();$(J).3V("6q");QB.1e.2o.QM(4D);QB.1e.2o.6h()};9o[QB.1e.1U.3U.QK.gJ]=1a(){$(J).3V("6q")};QB.1e.3D.gL[dp]=$jK.3V({5g:1k,4t:Ho,a8:Hj,tR:1k,1m:pZ,Hk:1l,7C:1a(e,ui){K 4D=$(J).1h("4D");$("2a[1x=1A-1x]",$(J)).2b(4D.5c);$("2a[1x=1A-1x]").1n("EI",4D.QN);$("2a[1x=1A-aj]",$(J)).2b(4D.9b)},9o:9o})}}if(!1B(QB.1e.3D.gL[dp])){QB.1e.3D.gL[dp].1h("4D",2V.4D)}1b QB.1e.3D.gL[dp]},QQ:1a(){K 1bK=12;if(J.1v.nb){J.1g.1w("6a");K 9d=J.1v.9C;if(!9B(9d)){9d+="px"}K a8=J.1v.7n;if(!9B(a8)){a8+="px"}J.1g.2T({"4n-1w":9d,"4n-1m":a8});J.1g.1m(J.1v.7n);J.7N.1w("6a");J.7N.1m("6a");1b}K WN=J.1g.aE("1w");if(WN>J.1v.9C){J.1v.1w=J.1v.9C}K WB=J.1g.aE("1m");if(WB>J.1v.7n){J.1v.1m=J.1v.7n}K X2=40;J.1g.1w("6a");J.7N.1w("6a");K cY=J.pF;K Gc=J.1g;K 5b=J.d3;K WF=J.lR;K Gn=cY.he("7h");K X4=Gc.he("7h");K WZ=5b.he("7h");K tQ=cY.aE("1m");K X1=Gc.aE("8q");K Gl=5b.aE("8q");K 1dY=WF.aE("1m");if(Gn==0&&tQ==0){1b}K eQ=tQ>X1-Gl;K 1m=3A.4n(Gl,tQ);if(!1B(J.1v.7n)&&J.1v.7n!="6a"){1m=J.1v.7n}K X3=Gn+WZ;K 1w=3A.6d(X4,J.1v.9C);if(1m>X2){J.1v.1m=6l(1m)}if(1w>0){J.1v.1w=1w;J.1v.9d=X3}J.og()},WS:1a(){if(!1B(J.4D.4Y)){1b J.4D.4Y.3u(/ /g,"&2q;").3u(/</g,"&lt;").3u(/>/g,"&gt;")}1j{1b""}},Wg:1a(69,bB){K me=J;K 1v=69.Gj;if(1B(1v)){1v={}}K 5M=[];if(!1v.Gk){K kB=1T QB.1e.1U.zI;kB.7k="*";kB.tN="*";kB.d4=69.Iz;5M.1G(kB)}K rZ=1v.G3?"W5":"";3P(1v.gp){1q QB.1e.2M.G4.3N:69.5A.ud(rZ,"7k");1s;1q QB.1e.2M.G4.eY:69.5A.ud(rZ,1v.s3.ub?"G5":"G0");1s}me.5M=[];5M=5M.4b(69.5A);$.2p(5M,1a(1r,28){K f=1T QB.1e.G1(28,69,me,1v);me.5M.1G(f);bB.2Y(f.1g)})},W6:1a(bB){K me=J;K f=$(\'<tr 2s="qb-ui-1I-28" ><td W3=""><2u 2s="dJ">&2q;</2u><2u 2s="qb-ui-1I-28-1x">\'+QB.1e.1U.3U.4f.sa+"</2u></td></tr>");bB.2Y(f)},sT:1a(bu,uf){K 3b="";3P(bu){1q"6q":3b=QB.1e.3D.fD.TG;1s;1q"f3":3b=QB.1e.3D.fD.Sj;1s;1q"8M":3b=QB.1e.3D.fD.SU;1s;1q"2k":3b=QB.1e.3D.fD.Q0;1s}1b $(\'<a 5B="#">\'+3b+"</a>").2r("ui-b2-76 eG-3d 3d-"+bu+" a9").7r(1a(){$(J).2r("ui-4N-7r")},1a(){$(J).3K("ui-4N-7r")}).88(1a(ev){ev.6R()}).2Y($("<2u/>").2r("ui-3T "+uf)).1n("6Q",-1)},1dJ:1a(){if(!J.G2){J.G2=$("#qb-ui-4k")}1b J.G2},7p:1a(){1b{x:J.2v().2f,y:J.2v().1M,1m:J.1m(),1w:J.1w()}},7P:1a(1h){if(!1B(kL)){kL.1R("7i")}K me=J;K 1y=1h.1A;me.1g.1h("hR",1y.3w);$(".qb-ui-1I-28",me.1g).2p(1a(){K 28=$(J);28.1h("uj",1y.3w);K 8f=1d;$.2p(1y.5A,1a(1r,G9){if(dX(G9.7k,28.1h("1A").7k)){8f=G9.3w;1b 1k}});28.1h("hR",8f)});J.1g.1R(QB.1e.7L.2l.Iw)},W8:1a(1v){if(!1B(kL)){kL.1R("7i")}J.1v=$.4C(J.1v,1v);K 1dK=J.1g.aE("1m");K 1dE=J.1g.1w();K h=J.1v.1w;K w=J.1v.1m;K Wu=J.5M.1f;K G7=0;if(1v!=1d&&(1v.1A!=1d&&1v.1A.5A!=1d)){G7=1v.1A.5A.1f+1}K Gp=G7!=Wu;if(Gp){J.1v.1w="6a";J.1v.1m="6a"}1j{J.1v.1w=h;J.1v.1m=w}K 9v=J.7N.4O();J.oS(1l);if(Gp){J.1v.1w="6a";J.1v.1m="6a"}1j{J.1v.1w=h;J.1v.1m=w}J.og();J.7N.4O(9v)},6C:1a(Xk){K me=J;if(!Xk){J.1g.1R(QB.1e.7L.2l.uq)}me.1g.3J("").3B().8Q(".6j").sB("6j").4o("3H").5u().3M()},6q:1a(1N,mt){K me=J;if(!mt){me.1g.1R(QB.1e.7L.2l.uZ)}if(1k===me.9g("UH",1N)){1b}me.1g.8Q("iO.qb-ui-1I");me.1g.3B()&&me.9g("6q",1N);me.ri=1k;me.6C()},Wv:1a(1N,mt){K me=J;if(!mt){me.1g.1R(QB.1e.7L.2l.uV)}J.6q(1N,1l)},kZ:1a(){1b J.ri},GC:1a(bc,1N){K me=J;K 4t=6l(me.1g.2T("z-1W"));4t=3A.4n(J.1v.4t,4t);if(bc){$.ui.6j.fA++}if(4t<aJ&&4t>$.ui.6j.fA){$.ui.6j.fA=4t}1j{if(4t<$.ui.6j.fA){$.ui.6j.fA++;4t=$.ui.6j.fA}}if($.ui.6j.fA>aJ){$.ui.6j.fA=aJ}K Ww={4O:me.1g.1n("4O"),57:me.1g.1n("57")};me.1g.2T("z-1W",4t).1n(Ww);J.9g("3k",1N)},ug:1a(5M){J.1g.1R(QB.1e.7L.2l.sD,{1I:J.1Q(),5M:5M})},GG:1a(4q){K me=J;K 5M=J.5M;K g2=[];$.2p(5M,1a(){K 28=J;if(28.1A.7k!="*"&&J.4q!=4q){28.eH(4q);g2.1G(28)}});me.ug(g2)},mQ:1a(6i,4q,yt){K me=J;K 5M=J.5M;K GH=[];$.2p(5M,1a(1W){K 28=J;if(28.1A.7k==6i||28.1A.g4==6i){$(".qb-ui-1I-28-2x 2a",28.1g).2p(1a(){if(28.4q!=4q){28.eH(4q);GH.1G(28)}})}});if(yt){me.ug(GH)}},7C:1a(){if(J.ri){1b}K 1v=J.1v;J.og();J.od(1v.2R);J.GC(1l);J.9g("7C");J.ri=1l},IA:1a(){K me=J;K 3m=$(2K),GN;1a hZ(ui){1b{2R:ui.2R,2v:ui.2v}}me.5Z.7g({1d6:1k,Ht:1k,rP:".ui-3V-cY, .ui-3V-eG-6q",5w:".qb-ui-1I-eG",9N:"1P",9v:1l,3a:1a(1N,ui){K c=$(J);GN=me.1v.1w==="6a"?"6a":c.1w();c.1w(c.1w()).2r("ui-3V-Wp");if($.ui.fS.6m!=1d&&($.ui.fS.6m.9N!=1d&&$.ui.fS.6m.9N.1f>3)){$.ui.fS.6m.9N[2]=u2;$.ui.fS.6m.9N[3]=u2}me.Ir();me.9g("Wk",1N,hZ(ui))},5T:1a(1N,ui){QB.1e.2i.j3();me.9g("5T",1N,hZ(ui))},6y:1a(1N,ui){QB.1e.2i.61();QB.1e.2i.e2();me.1v.2R.at="2f+"+(ui.2R.2f-3m.57())+" 1M+"+(ui.2R.1M-3m.4O());$(J).3K("ui-3V-Wp").1w(GN);me.1g.1R(QB.1e.7L.2l.Iv,me);QB.1e.2o.6h();me.Ip();me.9g("Wq",1N,hZ(ui))}})},1e8:1a(){K ce,co,fz,o=J.1v;if(o.9N==="1P"){o.9N=J.43[0].3j}if(o.9N==="2K"||o.9N==="3z"){J.9N=[0-J.2v.r7.2f-J.2v.1P.2f,0-J.2v.r7.1M-J.2v.1P.1M,$(o.9N==="2K"?2K:3z).1m()-J.Wo.1m-J.u1.2f,($(o.9N==="2K"?2K:3z).1w()||2K.3H.3j.gy)-J.Wo.1w-J.u1.1M]}if(!/^(2K|3z|1P)$/.9A(o.9N)){ce=$(o.9N)[0];co=$(o.9N).2v();fz=$(ce).2T("e9")!=="6f";J.9N=[co.2f+(6u($(ce).2T("GK"),10)||0)+(6u($(ce).2T("1bJ"),10)||0)-J.u1.2f,co.1M+(6u($(ce).2T("Gu"),10)||0)+(6u($(ce).2T("1bi"),10)||0)-J.u1.1M,u2,u2]}},IJ:1a(fM){fM=fM===2y?J.1v.5g:fM;K me=J,1v=me.1v,2R=me.5Z.2T("2R"),Xa=2A fM==="4F"?fM:"se";1a hZ(ui){1b{Xs:ui.Xs,jp:ui.jp,2R:ui.2R,4l:ui.4l}}me.5Z.5g({rP:".ui-3V-cY",9N:"2K",1bA:me.7N,fp:1v.fp,fM:Xa,3a:1a(1N,ui){$(J).2r("ui-3V-Xe");me.Ir();me.9g("Xh",1N,hZ(ui))},61:1a(1N,ui){me.9g("61",1N,hZ(ui));QB.1e.2i.ln();QB.1e.2i.j3()},6y:1a(1N,ui){K 2v=me.5Z.2v(),2f=2v.2f-me.2K.57(),1M=2v.1M-me.2K.4O();1v.1w=me.5Z.1w();1v.1m=me.5Z.1m();1v.2R={my:"2f 1M",at:"2f"+(2f>=0?"+":"")+2f+" "+"1M"+(1M>=0?"+":"")+1M,of:me.3z};$(J).3K("ui-3V-Xe");me.Ip();me.9g("Xi",1N,hZ(ui));QB.1e.2o.6h()}}).2T("2R",2R).2B(".ui-5g-se").2r("ui-3T ui-3T-1bz-1cB-se")},1cs:1a(){K 1v=J.1v;K 1w=J.lc;if(1v.1w==="6a"){if(!9B(1v.cJ)){1w=3A.4n(1w,1v.cJ)}}1j{K h=0;if(!9B(1v.cJ)){h=1v.cJ}if(!9B(1v.1w)){1w=3A.6d(h,1v.1w)}1w=3A.4n(1w,h)}1b 1w},2R:1a(3t){J.od(3t)},od:1a(3t){if(!J.1v.6v){1b}K gN=[],2v=[0,0];K Gx=1k;if(3t){if(2A 3t==="4F"||2A 3t==="1A"&&"0"in 3t){gN=3t.3R?3t.3R(" "):[3t[0],3t[1]];if(gN.1f===1){gN[1]=gN[0]}$.2p(["2f","1M"],1a(i,UC){if(+gN[i]===gN[i]){2v[i]=gN[i];gN[i]=UC;Gx=1l}});3t={my:"2f 1M",of:"#qb-ui-1Y",at:"2f+"+2v[0]+" 1M+"+2v[1],jk:"3r"}}3t=$.4C({},J.1v.2R,3t)}1j{3t=J.1v.2R}K 2f=0;K 1M=0;6E{if(Gx){2f=2v[0];1M=2v[1]}1j{2f=3t.at.3y(/2f([+-]*\\d+)/)[1]*1;1M=3t.at.3y(/1M([+-]*\\d+)/)[1]*1}}6I(e){}J.1v.2R=3t;if(J.1v.6v&&(J.1v.2R.of==1d||$(J.1v.2R.of).1f>0)){J.5Z.5k();3t.of="#qb-ui-1Y";3t.jk="3r";J.1g.2T({1M:1M,2f:2f})}},nX:1a(1r,1o){K me=J,5Z=me.5Z,h6=5Z.is(":1h(ui-5g)"),61=1k;3P(1r){1q"UH":1r="1cv";1s;1q"9o":me.1cE(1o);61=1l;1s;1q"1cP":me.1cF.2g(""+1o);1s;1q"Uv":5Z.3K(me.1v.Uv).2r(1cd+1o);1s;1q"2P":if(1o){5Z.2r("ui-3V-2P")}1j{5Z.3K("ui-3V-2P")}1s;1q"7g":if(1o){me.IA()}1j{5Z.7g("6C")}1s;1q"1w":61=1l;1s;1q"9d":if(h6){5Z.5g("2W","9d",1o)}61=1l;1s;1q"a8":if(h6){5Z.5g("2W","a8",1o)}61=1l;1s;1q"cJ":if(h6){5Z.5g("2W","cJ",1o)}61=1l;1s;1q"fp":if(h6){5Z.5g("2W","fp",1o)}61=1l;1s;1q"2R":me.od(1o);1s;1q"5g":if(h6&&!1o){5Z.5g("6C")}if(h6&&2A 1o==="4F"){5Z.5g("2W","fM",1o)}if(!h6&&1o!==1k){me.IJ(1o)}1s;1q"5b":$(".ui-3V-5b",me.1cc).3J(""+(1o||"&#160;"));1s;1q"1m":61=1l;1s}$.Ij.3g.nX.3v(me,2F);if(61){me.og()}},og:1a(){K o=J.1v;if(o.nb){J.1g.1m(J.1v.7n);1b}K 4O=J.7N.4O();if(o.1m==="6a"||o.1m==0){J.7N.1m("6a");J.5Z.2T({1m:"6a"});if(!9B(J.1v.7n)){if(J.1g.aE("1m")>J.1v.7n){J.1g.1m(J.1v.7n);o.1m=J.1v.7n}}}1j{J.5Z.1m(o.1m)}J.5Z.1w("6a");J.7N.1w("6a");K ue=J.d3.aE("7h");K kT=J.5Z.aE("1w");K lc=ue;K Is=kT;if(o.1w==="6a"||o.1w==0){J.7N.1w("6a");J.5Z.2T({cJ:lc,9d:Is,1w:"6a"});if(!9B(J.1v.9C)&&J.1g.aE("1w")>J.1v.9C){J.1g.1w(J.1v.9C);o.1w=J.1v.9C;J.5Z.1w(o.1w);kT=J.5Z.aE("1w");K k9=kT-ue;J.7N.7h(k9)}}1j{J.5Z.1w(o.1w);kT=J.5Z.aE("1w");K k9=kT-ue;J.7N.7h(k9)}if(J.5Z.is(":1h(ui-5g)")){J.5Z.5g("2W","cJ",lc);J.5Z.5g("2W","9d",Is)}J.7N.4O(4O)},Ir:1a(){J.tW=J.2K.2B("eF").ba(1a(){K eF=$(J);1b $("<2C>").2T({2R:"7X",1m:eF.8q(),1w:eF.7h()}).4o(eF.1P()).2v(eF.2v())[0]})},Ip:1a(){if(J.tW){J.tW.3M();4r J.tW}},1ce:1a(1N){if($(1N.3f).jV(".ui-3V").1f){1b 1l}1b!!$(1N.3f).jV(".ui-rB").1f},uQ:1a(){K me=J;K 1Q=gF({},J.4D);1Q.5A=[];$.2p(me.5M,1a(){K 28=J;if(28.1A.7k=="*"){1Q.Iz=28.4q}1j{1Q.5A.1G(28.1A)}});1b 1Q},uI:1a(1Q){J.4D=1Q},1Q:1a(2b){if(2b===2y){1b J.uQ()}1j{J.uI(2b)}}};(1a($){$.8u("ui.6j",QB.1e.7L);$.4C($.ui.6j,{6Y:"1.8.2",Vk:"2R",1ch:0,fA:0,7p:1a(){K 1Y=$("#qb-ui-1Y");1b{x:J.2v().2f-1Y.2v().2f,y:J.2v().1M-1Y.2v().1M,1m:J.8q(),1w:J.7h()}}})})(2I);QB.1e.7L.2l={sD:"sD",UA:"UA",uZ:"uZ",uV:"uV",uq:"uq",Iv:"Iv",Iw:"Iw",sf:"sf",Ux:"Ux",sJ:"sJ",sH:"sH"};QB.1e.Uy={};QB.1e.Uy.2l={o4:"o4"};QB.1e.lf=1a(1r,1P){J.3q=1d;J.fK=1d;J.8Y=1d;J.5Q=1d;J.5t=1r;J.6Z=1P;J.ae=1d;J.1co=1a(4y){J.iK=1l;if(J.5Q){J.5Q.cK(4y)}J.cZ()};J.8v=1a(4y){if(J.5Q){J.5Q.cK(4y)}J.1o(4y);J.7P()};J.1o=1a(4y){if(4y===2y){1b J.ae}J.ae=4y};J.aQ=1a(){K aQ=J.ae;if(!1B(J.ae)){3P(J.5t){1q 1S.2m.3n:aQ=o6(J.ae);1s;1q 1S.2m.aj:aQ=o6(J.ae);1s;1q 1S.2m.cl:aQ=J.ae;1s;1q 1S.2m.9O:aQ=1S.8o.oO.d7(J.ae);if(aQ=="fh"){aQ=""}1s;1q 1S.2m.7J:K 1o=J.6Z.86(1S.2m.9O);if(1B(1o)||1o==0){aQ=""}1s;1q 1S.2m.dt:aQ=1S.8o.yn.d7(J.ae);1s;5P:if(J.5t>=1S.2m.6H){aQ=o6(J.ae)}1s}}if(1B(aQ)){aQ=" "}1b aQ};J.3M=1a(){};J.J6=1a(){K gq=1k;K bH=1k;if(J.5t==1S.2m.3n){gq=J.6Z.c6&&J.6Z.c6.1f>0;bH=(QB.1e.2e.fO&QB.1e.2M.k0.tf)!=0}1j{if(J.5t>=1S.2m.6H){gq=J.6Z.bF&&J.6Z.bF.1f>0;bH=(QB.1e.2e.fO&QB.1e.2M.k0.te)!=0}}if(gq||bH){J.8Y.2r("UU")}1j{J.8Y.3K("UU")}};J.7P=1a(bc){K me=J;if(J.fK!=1d){J.fK[0].ov=J.aQ()}if(J.5Q!=1d){if(J.5t==1S.2m.cl){if(!1B(QB.1e.3D.8P)&&!1B(QB.1e.3D.8P.oE)){if(J.5Q.5u().1f!=QB.1e.3D.8P.oE.1f){J.5Q.5u().3M();K 1Z="";K 2x=[];$.2p(QB.1e.3D.8P.oE,1a(1W,2b){1Z="";2x.1G(\'<2W 1o="\'+2b+\'"\'+1Z+">"+(2b==1d?"":2b)+"</2W>");me.5Q.2Y($(\'<2W 1o="\'+2b+\'"\'+1Z+">"+(2b==1d?"":2b)+"</2W>"))})}}}if(bc||(!QB.1e.2e.oT.d0(J.5t)||J.5t>=1S.2m.6H)){J.5Q.cK(J.ae);J.J6()}}};J.Up=1a(){if(J.fK!=1d){J.fK.3B()}if(J.8Y!=1d){J.UM();J.8Y.5k()}if(J.5Q!=1d){J.5Q.3k()}};J.HR=1a(){if(J.fK==1d){1b}6E{QB.1e.2e.yJ++;J.fK.5k();if(J.8Y!=1d){J.8Y.3B();J.UJ()}}UV{QB.1e.2e.yJ--}};J.J5=1a(bc,4S){if(2A 4S=="2y"){4S=1d}K me=J;if(4S==1d){3P(J.5t){1q 1S.2m.ly:4S=$("<2C></2C>");4S.jY=1l;4S.2S("3F",1a(e){$(me).1R(QB.1e.lf.2l.ym,{1r:me.5t,4y:1l,6k:1k})});me.3q.2S("8i",1a(e){if(e.3Z==13||e.3Z==32){me.5Q.1R("3F")}});1s;1q 1S.2m.45:4S=$("<2C></2C>");4S.jY=1l;1s;1q 1S.2m.1Z:4S=$(\'<2a 1C="9f" 1o="1l" />\');4S.1n("6Q",-1);4S.jY=1l;1s;1q 1S.2m.eP:4S=$(\'<2a 1C="9f" 1o="1l" />\');4S.1n("6Q",-1);4S.jY=1l;1s}}if(4S==1d){if(bc){3P(J.5t){1q 1S.2m.3n:4S=$("<2x />");K t4=4S.J3({b5:"4k-3n",1o:me.ae,iz:1a(e){K 3O=e.7u(".ui-qb-4k-1H-3O-cr-5J");if(3O.1f){3O.1h("me").cZ()}}});K 8S=t4.IY()[0];4S=8S.IZ();4S.oy=1l;1s;1q 1S.2m.cl:K 2x=["<2x>"];if(!1B(QB.1e.3D.8P)&&!1B(QB.1e.3D.8P.oE)){K 1Z="";$.2p(QB.1e.3D.8P.oE,1a(1W,2b){1Z=2b==me.ae?\' 1Z="1Z" \':"";2x.1G(\'<2W 1o="\'+2b+\'"\'+1Z+">"+(2b==1d?"":2b)+"</2W>")})}2x.1G("</2x>");4S=$(2x.5x(""));4S.2S("dF 4W",1a(){K 3O=$(J).7u(".ui-qb-4k-1H-3O-cr-5J");if(3O.1f){3O.1h("me").cZ()}});1s;1q 1S.2m.9O:K 2x=["<2x>"];if(!QB.1e.2e.yI){1S.8o.oO.2p(1a(1W,2b){2x.1G(\'<2W 1o="\'+1W+\'">\'+(2b==1d?"":2b)+"</2W>")})}1j{2x.1G(\'<2W 1o="0">fh</2W>\');2x.1G(\'<2W 1o="1">z7 uB US</2W>\');2x.1G(\'<2W 1o="1">z7 uB UT</2W>\');2x.1G(\'<2W 1o="2">J2 uB US</2W>\');2x.1G(\'<2W 1o="2">J2 uB UT</2W>\')}2x.1G("</2x>");4S=$(2x.5x(""));4S.2S("dF 4W",1a(){K 3O=$(J).7u(".ui-qb-4k-1H-3O-cr-5J");if(3O.1f){3O.1h("me").cZ()}});1s;1q 1S.2m.7J:4S=$("<2x />");K t4=4S.J3({b5:"4k-7J",iz:1a(e){K 3O=e.7u(".ui-qb-4k-1H-3O-cr-5J");if(3O.1f){3O.1h("me").cZ()}}});K 8S=t4.IY()[0];4S=8S.IZ();4S.oy=1l;1s;1q 1S.2m.dt:K 2x=["<2x>"];1S.8o.yn.2p(1a(1W,2b){2x.1G(\'<2W 1o="\'+1W+\'">\'+(2b==1d?"":2b)+"</2W>")});2x.1G("</2x>");4S=$(2x.5x(""));4S.2S("dF 4W",1a(){K 3O=$(J).7u(".ui-qb-4k-1H-3O-cr-5J");if(3O.1f){3O.1h("me").cZ()}});1s}}1j{4S=$("<2C></2C>")}}if(4S==1d){4S=$(\'<2a 1C="2g" 1o="" />\');4S.4K("8i",me.UZ,me)}4S.2r("ui-qb-4k-1H-3O-cr-3q");4S.1cb(1a(e){me.3q.3K("ui-HS-3k")});4S.1n("6s-3G",QB.1e.2e.9t[J.5t]);if(!4S.oy){if(4S.jY){4S.dF(1a(){me.cZ()});4S.oy=1l}1j{K 4U="4W";if(4S[0].6J.3W()=="2x"){4U+=" dF"}4S.2S(4U,1a(){K 3O=$(J).7u(".ui-qb-4k-1H-3O-cr-5J");if(3O.1f){3O.1h("me").cZ()}});4S.oy=1l}}1b 4S};J.UZ=1a(e){if(e.3Z==13){e.6R();J.cZ();1b 1k}};J.UN=1a(){J.$J0=$(\'<3d 2s="UW">\');J.$J0.dC({d9:{oR:"ui-3T-SV"},2g:1k}).1h("me",J).88(1a(1N){K me=1d;K 3O=$(J).7u(".ui-qb-4k-1H-3O-cr-5J");if(3O.1f){me=3O.1h("me")}1j{1b}K gq=1k;K bH=1k;K 7A=[];if(me.5t==1S.2m.3n){7A=me.6Z.c6;gq=7A&&7A.1f>0;bH=(QB.1e.2e.fO&QB.1e.2M.k0.tf)!=0}1j{if(me.5t>=1S.2m.6H){7A=me.6Z.bF;gq=7A&&7A.1f>0;bH=(QB.1e.2e.fO&QB.1e.2M.k0.te)!=0}}if(bH&&!gq){$(me.6Z).1R(QB.1e.iJ.2l.h1,{5s:me.5t,1o:me.ae,1Q:me.6Z.1Q(),3O:me})}1j{if(1k&&(!bH&&(gq&&7A.1f==1))){QB.1e.3D.gR(1d,7A[0].yT)}1j{QB.1e.2e.g3.2O()}}1N.4I();1b 1k}).3F(1a(1N){1N.4I();1b 1k});$.2O({4s:".UW",4t:aJ,7v:{5D:0},mR:1k,9M:1a($1R,e){K me=1d;K 3O=$1R.7u(".ui-qb-4k-1H-3O-cr-5J");if(3O.1f){me=3O.1h("me")}QB.1e.2e.g3.1h("me",me);if(2A me=="2y"||me==1d){1b{1J:{}}}K hi={};K bH=1k;K 7A=[];K 8X="";if(me.5t==1S.2m.3n){7A=me.6Z.c6;bH=(QB.1e.2e.fO&QB.1e.2M.k0.tf)!=0;8X=QB.1e.1U.3U.4f.UX}1j{if(me.5t>=1S.2m.6H){7A=me.6Z.bF;bH=(QB.1e.2e.fO&QB.1e.2M.k0.te)!=0;8X=QB.1e.1U.3U.4f.UL}}K 1i=1d;if(bH){1i={1x:8X,3T:"cr",1h:1d,1r:"cr"};hi[1i.1r]=1i}if(7A&&7A.1f){1p(K i=0;i<7A.1f;i++){K mN=7A[i];1i={1x:QB.1e.1U.3U.4f.I4+\' "\'+mN.4Y+\'"\',3T:"jR-8M",1h:mN.yT,1r:"jR-8M-"+i};hi[1i.1r]=1i}}1b{1J:hi}},1X:1a(45,1v){K me=$(J).1h("me");if(45.5f("jR-8M")==0){QB.1e.2o.3s.ea=1v.1J[45].1h;if(!me.cZ()){QB.1e.3D.gR(1d,1v.1J[45].1h)}}1j{if(45=="cr"){$(me.6Z).1R(QB.1e.iJ.2l.h1,{5s:me.5t,1o:me.ae,1Q:me.6Z.1Q(),3O:me})}}},1J:{}});1b J.$J0};J.UM=1a(){if(J.5t==1S.2m.3n||J.5t>=1S.2m.6H){QB.1e.2e.g3.zi().tl(J.8Y)}if(!QB.1e.2e.oT.d0(J.5t)){1b 1k}J.7P(1l);J.m7.3J("");6E{J.5Q.1h("me",J);if(1B(J.5Q.1h("me"))){}J.5Q.zi().4o(J.m7);J.5Q.1h("ze",1k)}6I(e){}};J.UJ=1a(){if(J.5t==1S.2m.3n||J.5t>=1S.2m.6H){if(QB.1e.2e.g3.1P()!=QB.1e.2e.lE){QB.1e.2e.g3.zi().4o(QB.1e.2e.lE)}}if(!QB.1e.2e.oT.d0(J.5t)){1b 1k}if(!J.5Q.1h("ze")){6E{J.5Q.zi().4o(QB.1e.2e.lE);J.5Q.1h("ze",1l)}6I(e){}}J.m7.3J("");1b 1l};J.HW=1a(){K me=J;if(J.8Y==1d){J.8Y=$(\'<2C 2s="ui-qb-4k-1H-3O-cr-5J"></2C>\');J.8Y.4o(J.3q)}if(J.5t==1S.2m.3n||J.5t>=1S.2m.6H){if(QB.1e.2e.g3==1d){QB.1e.2e.g3=J.UN();QB.1e.2e.g3.4o(QB.1e.2e.lE)}K $2u=$(\'<2u 2s="1bT"></2u>\');J.8Y.2Y($2u);J.m7=$2u;J.J6()}1j{J.m7=J.8Y}if(QB.1e.2e.oT.d0(J.5t)){if(1B(QB.1e.2e.yU[J.5t])){J.5Q=J.J5(1l);QB.1e.2e.yU[J.5t]=J.5Q;J.5Q.4o(QB.1e.2e.lE);J.5Q.1h("ze",1l)}1j{J.5Q=QB.1e.2e.yU[J.5t]}}1j{K J7=1d;if(J.6Z.6Z.Ic!=1d){J7=J.6Z.6Z.Ic(J.5t,J,J.6Z)}J.5Q=J.J5(1l,J7);J.m7.2Y(J.5Q)}if(!J.5Q.jY){J.8Y.3B()}J.8Y.1h("me",J)};J.I6=1a(){if(J.8Y!=1d){J.8Y.5u().3M();J.8Y.3M();J.8Y=1d}J.HW()};J.Uj=1a(){K me=J;3P(J.5t){1q 1S.2m.ly:;1q 1S.2m.45:;1q 1S.2m.1Z:;1q 1S.2m.eP:1b 1d}K $IW=$("<2C></2C>").2r("ui-qb-4k-1H-3O-pE-5J").2r("ui-qb-4k-1H-3O-pE-3q");$IW.3F(1a(e){if(k7){1b}if(F9&&me.5t==1S.2m.aj){QB.1e.3D.F1("1bQ Ur is iG 1bX of iG PA 6Y. Uc Un 4z 1dV of 1dU r0 Un be Ul to aS 1dZ Ur in iG 1dN 6Y.");1b 1k}me.z3()});1b $IW};J.z3=1a(){if(QB.1e.2e.jH==J){1b}QB.1e.2e.dc=1l;if(QB.1e.2e.jH!=1d){QB.1e.2e.jH.cZ()}QB.1e.2e.jH=J;if(J.5t==1S.2m.3n||!J.6Z.1B()&&!J.6Z.Vx()){J.Up();QB.1e.2e.jH=J}J.3q.2r("ui-HS-3k");if(J.5Q!=1d&&(J.5Q.1f>0&&J.5Q[0].6J.3W()=="2a")){J.5Q.Uq(0)}};J.cZ=1a(){K cp=1k;K HQ=1l;K 6k=J.1o();K 4y=J.5Q.cK();if(!4w.yq(6k,4y)&&!(6k==1d&&(4y==" "||4y==0))){cp=1l;K oo=J.6Z.86(1S.2m.9O);3P(J.5t){1q 1S.2m.7J:if(1B(4y)||4y==0){if(!1B(oo)||oo!==0){J.6Z.8v(1S.2m.9O,1S.8o.oO.1dS)}}1j{6k=1B(6k)?Uf:6l(6k);4y=6l(4y);if(9B(4y)){4y=0}if(9B(6k)){6k=Uf}4y+=4y<6k?-0.5:+0.5;if(1B(oo)||oo==0){J.6Z.8v(1S.2m.9O,1S.8o.oO.z7);J.6Z.mA(1S.2m.9O)}HQ=1k}1s}J.1o(4y);if(HQ){J.6Z.mA()}J.HR();$(J).1R(QB.1e.lf.2l.ym,{1r:J.5t,4y:4y,6k:6k,iK:J.iK});J.iK=1k}1j{J.HR()}QB.1e.2e.jH=1d;if(!J.5Q.jY){J.3q.3K("ui-HS-3k")}1b cp};J.Ue=1a(1r){K k2="ui-qb-4k-1H-";if(1r>=1S.2m.oN){1b k2+"Dr"}1b k2+1S.2m.d7(1r)};J.gd=1a(3k){if(!3k.1f){1b $()}K 1O=3k.3C();if(1O.is(":a9")){1b 1O}1O=1O.2B(":a9:4A");if(1O.1f){1b 1O}K 1P=3k.1P();1b J.gd(1P)};J.gj=1a(3k){if(!3k.1f){1b $()}K 1O=3k.49();if(1O.is(":a9")){1b 1O}1O=1O.2B(":a9:7W");if(1O.1f){1b 1O}K 1P=3k.1P();1b J.gj(1P)};J.8L=1a(1r,1P){K me=J;J.3q=$(\'<td 2s="ui-8u-cY ui-qb-4k-1H-3O \'+J.Ue(J.5t)+\'" />\');J.3q.1n("6Q",0);K zG=J.5t;if(zG>1S.2m.6H){zG=1S.2m.6H}J.3q.1n("6s-3G",QB.1e.2e.9t[zG]);J.fK=J.Uj();if(J.fK!=1d){J.fK.4o(J.3q)}J.HW();J.3q.1ed(1a(e){if(QB.1e.2e!=1d&&QB.1e.2e.2P){1b}if(QB.1e.2e.yJ>0){1b}if(me.3q[0]!=e.3f){1b}if(F9&&me.5t==1S.2m.aj){1b 1k}me.z3()});J.3q.8i(1a(e){3P(e.3Z){1q 9:if(e.nV){me.gj(me.3q).3k();e.4I()}}})};J.8L(1r,1P)};QB.1e.lf.2l={ym:"1ee",1e7:"1ef",h1:"h1"};QB.1e.iJ=1a(1Q,1P){J.6Z=1P;J.1ec=1;J.6p={};J.1da=4w.yj();J.3w=1d;J.3q=1d;J.oD=1k;J.c6=[];J.bF=[];J.6F=Gr();J.1d8=1k;J.1B=1a(){1b 1B(J.6p[1S.2m.3n].1o())};J.Vx=1a(){K 2b=J.6p[1S.2m.3n].1o();if(1B(2b)){1b 1k}1b 2b.5f(".*")>=0};J.eH=1a(2b){K l6=J.6p[1S.2m.1Z].1o();if(2b===2y){1b l6}1j{if(l6!=2b){J.6p[1S.2m.1Z].1o(2b);J.HK(1d,{1r:1S.2m.1Z,4y:2b});1b 1l}}1b 1k};J.86=1a(1r){1b J.6p[1r].1o()};J.WC=1a(){1b!1B(J.86(1S.2m.cl))||!1B(J.86(1S.2m.6H))};J.8v=1a(1r,1o,yt){if(1o===2y){1o=1d}K 4y=1o;K 6k=J.6p[1r].1o();if(4w.yq(4y,6k)){1b 1k}3P(1r){1q 1S.2m.9O:J.8v(1S.2m.7J,1d,yt);1s;1q 1S.2m.7J:if(1B(4y)||4y==0){4y=""}1s;5P:}J.6p[1r].1o(4y);1b 1l};J.HK=1a(e,1h){K 1r=1h.1r;K 4y=1h.4y;K 6k=1h.6k;$(J).1R(QB.1e.iJ.2l.I1,{1r:1r,4y:4y,6k:6k,1H:J,iK:1h.iK});J.kW()};J.kW=1a(){K me=J;K yf=me.1B();1p(K 1r in me.6p){if(1r==1S.2m.3n){aN}K 3O=me.6p[1r];3O.3q.1n("6Q",yf?-1:0)}};J.VE=1a(){K me=J;K 3J=$(\'<tr 2s="ui-qb-4k-1H" />\');1S.2m.2p(1a(1r){K 3O=1T QB.1e.lf(1r,me);$(3O).4K(QB.1e.lf.2l.ym,me.HK,me);3O.3q.4o(3J);me.6p[1r]=3O});J.kW();3J.1h("1A",J);3J.1h("me",J);1b 3J};J.3M=1a(){J.oD=1l;J.3q.5u().3M();J.3q.3M();J.3q.3J("")};J.mA=1a(ld){K me=J;1p(K 1r in me.6p){K 3O=me.6p[1r];if(ld===2y||ld==1r){3O.7P()}}J.kW()};J.V3=1a(ld){K me=J;1p(K 1r in me.6p){K 3O=me.6p[1r];if(ld===2y||ld==1r){3O.I6()}}J.kW()};J.VC=1a(){J.8v(1S.2m.1Z,!J.1B());J.8v(1S.2m.eP,1k);J.8v(1S.2m.dt,1S.8o.yn.ot)};J.il=1a(oa,oF,n0,yo){K a=4w.3X(J.86(1S.2m.3n)).3W();K b=4w.3X(oa).3W();if(1B(a)||1B(b)){yo=1k}if(!yo&&a==b||yo&&(a.5f(b)>=0||b.5f(a)>0)){if(oF===2y||oF==4w.3X(J.86(1S.2m.cl)).3W()){if(n0===2y||n0==4w.3X(J.86(1S.2m.aj)).3W()){1b 1l}}}1b 1k};J.Vc=1a(oa,oF,n0){1b J.il(oa,oF,n0,1l)};J.1Q=1a(1o){if(1o===2y){1b J.VD()}1j{1b J.yP(1o)}};J.7P=1a(1Q){K 6n=J.yP(1Q);if(6n){J.mA()}1b 6n};J.yP=1a(1Q){K 6n=1k;if(1B(1Q)){1b 6n}6n=J.8v(1S.2m.3n,1Q.8C)||6n;6n=J.8v(1S.2m.cl,1Q.bM)||6n;6n=J.8v(1S.2m.aj,1Q.9b)||6n;6n=J.8v(1S.2m.eP,1Q.je)||6n;6n=J.8v(1S.2m.dt,1Q.HZ)||6n;6n=J.8v(1S.2m.9O,1Q.gp)||6n;6n=J.8v(1S.2m.7J,1Q.m5)||6n;1p(K i=0;i<QB.1e.2e.j0+1;i++){6n=J.8v(1S.2m.6H+i,1Q.6W[i])||6n}if(J.3w!=1Q.3w){J.3w=1Q.3w;6n=1l}if(!1B(1Q.6F)&&J.6F!=1Q.6F){J.6F=1Q.6F;6n=1l}if(!1B(1Q.3w)&&J.6F!=1d){if(!1B(1Q.3w)){J.6F=1d}6n=1l}if(J.oD!=1Q.7K){J.oD=1Q.7K;6n=1l}if(J.8b!=1Q.8b){J.8b=1Q.8b;6n=1l}K HL=-1;K HM=-1;if(1Q.c6){HM=1Q.c6.1f}if(J.c6){HL=J.c6.1f}if(HL!=HM){6n=1l}J.c6=1Q.c6;K HH=-1;K HI=-1;if(1Q.bF){HI=1Q.bF.1f}if(J.bF){HH=J.bF.1f}if(HH!=HI){6n=1l}J.bF=1Q.bF;6n=J.8v(1S.2m.1Z,1Q.dB&&!J.1B())||6n;J.kW();1b 6n};J.VD=1a(){K 1Q=1T QB.1e.1U.Dj;1Q.dB=J.86(1S.2m.1Z);1Q.8C=J.86(1S.2m.3n);1Q.bM=J.86(1S.2m.cl);1Q.9b=J.86(1S.2m.aj);1Q.je=J.86(1S.2m.eP);1Q.HZ=J.86(1S.2m.dt);1Q.gp=J.86(1S.2m.9O);1Q.m5=J.86(1S.2m.7J);1Q.6W[0]=J.86(1S.2m.6H);1p(K i=0;i<QB.1e.2e.j0;i++){1Q.6W[1+i]=J.86(1S.2m.oN+i)}1Q.3w=J.3w;1Q.7K=J.oD;1Q.6F=J.6F;1Q.8b=J.3q==1d?0:J.3q.1W();1b 1Q};J.8L=1a(1Q){J.3q=J.VE();J.3q.oA();J.VC();J.yP(1Q);J.mA()};J.8L(1Q)};QB.1e.iJ.2l={I1:"1d7",h1:"h1"};QB.1e.2e={3o:[],j0:2,yz:1k,1dg:1d,ob:1d,dc:1k,n6:0,1dh:[],2P:1k,yJ:0,fO:0,zd:1k,yI:1k,I0:1k,yU:[],g3:1d,Ic:1d,oT:[1S.2m.3n,1S.2m.9O,1S.2m.7J,1S.2m.cl,1S.2m.dt],gd:1a(3k){if(!3k.1f){1b $()}K 1O=3k.3C();if(1O.is(":a9")){1b 1O}1O=1O.2B(":a9:4A");if(1O.1f){1b 1O}K 1P=3k.1P();1b J.gd(1P)},Dn:1a(){J.n6++},D4:1a(){J.n6--;if(J.n6==0){J.hq();J.kD()}},gj:1a(3k){if(!3k.1f){1b $()}K 1O=3k.49();if(1O.is(":a9")){1b 1O}1O=1O.2B(":a9:7W");if(1O.1f){1b 1O}K 1P=3k.1P();1b J.gj(1P)},oS:1a(){K me=J;QB.1e.2e.fO=J.1g.1n("fO");QB.1e.2e.yI=J.1g.1n("yI")=="rK";QB.1e.2e.zd=J.1g.1n("zd")=="rK";QB.1e.2e.lE=$(\'<2C 2s="qb-6f"></2C>\').4o(J.1g);K x=J.1g.1n("j0");if(x!=1d&&(x!=""&&!9B(x))){QB.1e.2e.j0=6l(x)}if(J.1g.1n("yz")=="rK"){QB.1e.2e.yz=1l}J.1g.2r("ui-8u").2r("ui-qb-4k");J.1g.8U({yu:"qb-ui-4k-7r",Ie:".qb-ui-4k-8U",fr:"aU",If:1a(e,ui){if(ui.43.4H("qb-ui-3I-28-43")){K a6=ui.43.1h("a6");K eo=ui.43.1h("eo");K 1A=ui.43.1h("1A");K 9u=ui.43.1h("9u");if(9u==1d){9u=1T QB.1e.1U.jz;9u.6x=1l;9u.4Y=eo;9u.3N=eo}$(J).1R(QB.1e.2e.2l.vi,{1I:9u,28:1A,8k:eo,6i:a6})}1j{K 1df=$(J);K 1A=ui.43.1h("1A");if(1A==1d){1A=1T QB.1e.1U.jz;1A.6x=1l;1A.4Y=ui.43.1h("a6");1A.3N=ui.43.1h("a6")}K 28;if(1A.5A.1f>0){28=1A.fu[0]}1j{28=1T QB.1e.1U.zI;1A.5A=[28]}28.d4=1l;K yF={1A:1A};$(J).1R(QB.1e.2e.2l.vk,yF)}}});J.1g.2r("qb-ui-4k-3E");J.1g.2r("hz-ol");J.1I=$(\'<1I yG="0" yB="0" gn="0" />\').2r("ui-8u-cY").2r("yD-VY").2r("hz-1dd").2r("e9-y").4o(J.1g);if(2A iI=="2y"||!iI){J.In=$(\'<1I 2s="hz-f4" />\').4o(J.1g)}1j{J.In=J.1I}J.V6().4o(J.In);J.n5=$("<dZ/>").4o(J.1I);K me=J;J.kG();J.hq();me.1g.3k(1a(e){QB.1e.2e.dc=1k});me.1g.1n("6Q",0);me.1g.8i(1a(e){3P(e.3Z){1q 13:if(QB.1e.2e.dc){1b}QB.1e.2e.dc=1l;me.1g.2B("[6Q]:6v:4A").3k();e.4I();1s;1q 9:if(!QB.1e.2e.dc){if(!e.nV){me.gd(me.1g).3k()}1j{me.gj(me.1g).3k()}e.4I()}}});K jp=0;if(2A iI=="2y"||!iI){J.I0=1l;J.1I.1I({dW:1l,Io:!1l,9w:{5g:1l}})}J.W0()},W0:1a(){K me=J;me.1I.4Q({yC:1a(1I,1H){K 1y=$(1H).1h("1A");if(!1y.1B()){me.1g.1R(QB.1e.2e.2l.aF,{1H:1y})}},oU:"ui-qb-4k-1H-45"})},6C:1a(){J.1g.3K("ui-qb-4k").8Q(".8O");J.1I.3M();$.Ij.3g.6C.3v(J,2F)},kG:1a(){K I3=1k;$.2p(J.3o,1a(1r,1H){if(1H.1B()){I3=1l;1b 1k}});if(!I3){J.nA(1d)}},f7:1a(1V){K me=J;if(1B(1V)||1V.2Q.1f==0){1b}K 4s=".ui-qb-4k-1H";K 1J=QB.1e.2i.ju(1V.2Q);$.2O("6C",4s);$.2O({4s:4s,4t:aJ,7v:{5D:0},mR:1k,9M:1a($1R,e){K me=$1R.1h("me");if(2A me=="2y"){1b{1J:1J}}K hi={};K 7A=1d;if($(e.3f).7u().4H("ui-qb-4k-1H-3n")){7A=me.c6;K 1H=me;if(1H&&1B(1H.86(1S.2m.3n))){K 1i={1x:QB.1e.1U.3U.4f.VP,3T:"jR-8M",1h:1d,1r:"I5-8M"};hi[1i.1r]=1i}}if($(e.3f).7u().4H("ui-qb-4k-1H-6H")){7A=me.bF}if(7A&&7A.1f){1p(K i=0;i<7A.1f;i++){K mN=7A[i];K 1i={1x:QB.1e.1U.3U.4f.I4+" "+mN.4Y,3T:"jR-8M",1h:mN.yT,1r:"jR-8M-"+i};hi[1i.1r]=1i}}1b{1J:hi}},1X:1a(45,1v){K 1H=J.1h("me");me.hf(45,1H,1v.1J[45])},1J:1J})},hf:1a(45,1H,yd){K me=J;K el=1H.3q;if(45.5f("jR-8M")==0){QB.1e.3D.gR(1d,yd.1h)}3P(45){1q"I5-8M":1H.8v(1S.2m.3n,"(2x *)",1l);1H.8v(1S.2m.1Z,1l,1l);me.1g.1R(QB.1e.2e.2l.aF,{1H:1H});me.kG();1s;1q"eS-up":if(el.3C().1f){el.7T(el.49());if(!1H.1B()){me.1g.1R(QB.1e.2e.2l.aF,{1H:1H})}}1s;1q"eS-f5":K 3C=el.3C();if(3C.1f&&3C.3C().1f){el.gM(3C);if(!1H.1B()){me.1g.1R(QB.1e.2e.2l.aF,{1H:1H})}}1s;1q"1H-4r":if(me.3o.1f>1){me.jd(1H)}1j{if(1H.1B()){1b}1j{me.jd(1H);me.kG()}}me.kG(1H);me.hq();me.1g.1R(QB.1e.2e.2l.aF,{1H:1H,1r:1S.2m.ly,4y:1l,6k:1k});1s;1q"1H-I5":me.nA(1d,el);1s}},vC:1a(){if(2A iI=="2y"||!iI){if(J.1I.1I("gA")){J.1I.1I("gA").vC()}}},kD:1a(){if(!J.I0){1b}if(J.n6!=0){1b}if(2A iI=="2y"||!iI){if(J.1I.1I("gA")){J.1I.1I("gA").ye()}}},nA:1a(53,mK,5O,nk){K cp=1k;K 1H=J.Vb(53);if(1H==1d){cp=1l;1H=1T QB.1e.iJ(53,J);$(1H).4K(QB.1e.iJ.2l.I1,{1H:1H},J.Vf,J);$(1H).4K(QB.1e.iJ.2l.h1,1H,J.h1,J);if(1H!=1d&&(!1H.1B()&&1B(mK))){mK=J.VS()}if(5O===0||!1B(5O)){5O=6l(5O);K mH=$("tr:6r(.ui-qb-4k-1H-7M)",J.n5).eq(5O);if(mH.1f){mH.zs(1H.3q)}1j{1H.3q.4o(J.n5)}}1j{if(mK!=1d&&mK.1f){1H.3q.7T(mK)}1j{1H.3q.4o(J.n5)}}if(!nk){J.1g.1R(QB.1e.2e.2l.Ep,{1H:1H})}J.3o.1G(1H)}1j{if(5O===0||!1B(5O)){5O=6l(5O);K VT=1H.3q[0].1de-1;if(5O!=VT){K mH=$("tr:6r(.ui-qb-4k-1H-7M)",J.n5).eq(5O);if(mH.1f){mH.zs(1H.3q)}}}cp=1H.7P(53);if(!nk&&cp){J.1g.1R(QB.1e.2e.2l.aF,{1H:1H})}}if(1H!=1d&&1H.3q!=1d){K oc=$(".ui-qb-4k-1H-dt",1H.3q);if(oc.1f>0){oc.2T("4T",J.ob?"":"3r")}}if(!nk&&cp){J.hq()}J.kD();1b 1H},Rh:1a(){1b J.3o},1cV:1a(){K I2=1d;$.2p(J.3o,1a(1r,1H){K yf=1H.1B();if(yf){I2=1H;1b 1k}});1b I2},jd:1a(yi,nk){K 53;1p(K i=J.3o.1f-1;i>=0;i--){K 1H=J.3o[i];if(1H.3w==yi.3w){if(!1B(1H.3w)&&1H.3q==yi.3q||1B(1H.3w)&&1H.3q==yi.3q){J.3o.3M(1H);1H.7K=1l;1H.3M();53=1H.1Q()}}}J.hq();if(53){53.7K=1l;if(!nk){J.1g.1R(QB.1e.2e.2l.Et,{53:53})}}J.kD()},1cW:1a(1Q){K 3o=J.Ib(1Q);1p(K 1H in 3o){1H.3M();J.3o.3M(1H);4r 1H}J.hq()},1cS:1a(8f){K 1O=1d;$.2p(J.3o,1a(1r,1H){if(1H.3w==8f){1O=1H;1b 1k}});1b 1O},VS:1a(){1b J.n5.2B("tr:7W:6r(.ui-qb-4k-1H-7M)")},Vb:1a(53){K 3o=J.Ib(53);if(3o.1f>0){1b 3o[0]}1b 1d},Ib:1a(53){K 1O=[];K zE=[];K zO=[];K zL=[];K zJ=[];if(53==1d){1b 1O}K oa=4w.3X(53.8C).3W();K n0=4w.3X(53.9b).3W();1p(K i=0;i<J.3o.1f;i++){K 1H=J.3o[i];if(!1B(1H.3w)&&(!1B(53.3w)&&1H.3w==53.3w)){zE.1G(1H)}1j{if(!1B(1H.6F)&&(!1B(53.6F)&&1H.6F==53.6F)){zO.1G(1H)}1j{if(1H.il(53.8C,53.bM,53.9b)){if(53.8b==i){zL.1G(1H)}1j{zJ.1G(1H)}}}}}if(zE.1f>0){1O=zE}1j{if(zO.1f>0){1O=zO}}if(zL.1f>0){1O=zL}if(zJ.1f>0){1O=zJ}1b 1O},sM:1a(){1b;$.2p(J.3o,1a(1r,1H){1H.6p[1S.2m.3n].I6();if(QB.1e.2e.jH==1H.6p[1S.2m.3n]){1H.6p[1S.2m.3n].z3()}})},Vm:1a(3n){K 3o=J.z6(3n);if(3o.1f>0){1b 3o[0]}1b 1d},z6:1a(3n){K 1O=[];$.2p(J.3o,1a(1r,1H){if(1H.il(3n,"")){1O.1G(1H)}});if(1O.1f>0){1b 1O}$.2p(J.3o,1a(1r,1H){if(1H.Vc(3n,"")){1O.1G(1H)}});1b 1O},R9:1a(1Q){J.Dn();K 3k=$(":3k");$("#qb-ui-1Y").3k();QB.1e.2e.2P=1l;K me=J;if(1B(1Q)){1b}K I8=[];$.2p(1Q.8n,1a(1W,hV){if(!hV.7K){I8.1G(me.nA(hV,1d,1W,1l))}});1p(K i=J.3o.1f-1;i>=0;i--){if(i>J.3o.1f-1){aN}K o3=J.3o[i];if(o3!=1d){if(I8.5f(o3)==-1&&!o3.1B()){J.jd(o3,1l)}}}J.D4();QB.1e.2e.2P=1k},R2:1a(){K 2Z=[];if(QB.1e.2i.5W!=1d&&QB.1e.2i.5W.1f!=1d){1p(K i=0;i<QB.1e.2i.5W.1f;i++){K 1y=QB.1e.2i.5W[i];K 1I=1y.1h("1A");K 8k=!1B(1I.mk)?1I.mk:1I.3N;K DI=8k+".*";2Z.1G({1Z:1k,2g:DI,1o:DI,bu:"1I"});$(1I.5A).2p(1a(){K 28=J;K ok=8k+"."+28.7k;K V9=28.7k;2Z.1G({1Z:1k,2g:V9,1o:ok,bu:"28"})})}}b8.DR("4k-3n",2Z)},1cT:1a(1H,4q){1H.eH(4q)},h1:1a(e,1h){1h.1H=e.1h.1H;J.1g.1R(QB.1e.2e.2l.DE,1h)},DJ:1a(e,1h){J.kD()},Vf:1a(e,1h){K 1H=e.1h.1H;K 1r=1d;K 4y=1d;K 6k=1d;if(1h){1r=1h.1r;4y=1h.4y;6k=1h.6k}1b J.Vd(1H,1r,6k,4y,1h.iK)},1d2:1a(53,5s,3n,1X){if(!QB.1e.2e.zd){if(1X&&7Q(1X)=="1a"){1X()}1b}53.Vg=1l;53.FD=5s;53.FE=3n;QB.1e.2o.sg([53]);QB.1e.2o.6h(1X)},Vd:1a(1H,5s,6k,4y,DP){if(5s==1S.2m.ly&&4y){if(J.3o.1f>1){J.jd(1H,1l)}1j{if(1H.1B()){1b}1j{J.jd(1H,1l);J.kG()}}}J.kG(1H);J.hq(1H);J.1g.1R(QB.1e.2e.2l.aF,{1H:1H,1r:5s,4y:4y,6k:6k,DP:DP});J.kD()},hq:1a(1H){if(J.n6!=0){1b}J.V5(1H);J.Ve(1H)},Ve:1a(){K oJ=[];1p(K i=0;i<J.3o.1f;i++){K 1H=J.3o[i];K 1o=1H.86(1S.2m.9O);if(1o!=1d&&1o>0){oJ.1G({1H:1H,7J:1H.86(1S.2m.7J)})}}oJ.hQ(J.V4);K 2Z=[];1p(K i=0;i<oJ.1f;i++){2Z.1G({1Z:1k,2g:62(i+1),1o:62(i+1),bu:"7J"});K 1H=oJ[i].1H;1H.8v(1S.2m.7J,i+1,1l);1H.mA(1S.2m.7J)}2Z.1G({1Z:1k,2g:62(i+1),1o:62(i+1),bu:"7J"});b8.DR("4k-7J",2Z)},SY:1a(){1p(K i=0;i<J.3o.1f;i++){K 1H=J.3o[i];1H.V3(1S.2m.cl)}},V4:1a(a,b){K nR=b.7J;K nP=a.7J;if(1B(nP)||nP<0){1b 1}if(1B(nR)||nR<0){1b-1}nP=6l(nP);nR=6l(nR);1b nP-nR},V5:1a(1H){K zp=1k;1p(K i=0;i<J.3o.1f;i++){if(J.3o[i].86(1S.2m.eP)){zp=1l;1s}}if(J.ob==zp){1b 1k}J.ob=zp;K oc=$(".ui-qb-4k .ui-qb-4k-1H-dt");oc.2T("4T",J.ob?"":"3r");J.kD();1b 1l},V6:1a(){K 7M=$("<f4 />");K tr=$("<tr />").2r("ui-qb-4k-1H-7M").2r("ui-8u-7M").4o(7M);K 4A=1l;K 1dA="";QB.1e.2e.9t={};QB.1e.2e.9t[1S.2m.45]="";QB.1e.2e.9t[1S.2m.ly]=QB.1e.1U.3U.4f.hu;QB.1e.2e.9t[1S.2m.1Z]=QB.1e.1U.3U.4f.6W.Dv;QB.1e.2e.9t[1S.2m.3n]=QB.1e.1U.3U.4f.6W.8C;QB.1e.2e.9t[1S.2m.cl]=QB.1e.1U.3U.4f.6W.bM;QB.1e.2e.9t[1S.2m.aj]=QB.1e.1U.3U.4f.6W.9b;QB.1e.2e.9t[1S.2m.9O]=QB.1e.1U.3U.4f.6W.gp;QB.1e.2e.9t[1S.2m.7J]=QB.1e.1U.3U.4f.6W.m5;QB.1e.2e.9t[1S.2m.eP]=QB.1e.1U.3U.4f.6W.je;QB.1e.2e.9t[1S.2m.dt]=QB.1e.1U.3U.4f.6W.Dq;QB.1e.2e.9t[1S.2m.6H]=QB.1e.1U.3U.4f.6W.zM;QB.1e.2e.9t[1S.2m.oN]=QB.1e.1U.3U.4f.6W.zM;$.2p(QB.1e.2e.9t,1a(i,3O){QB.1e.2e.9t[i]=3O.3u("&2q;"," ").3u("&DO;","&")});$.2p(J.Vq(),1a(){if(4A){$(\'<th 2s="ui-4N-5P ui-qb-4k-1H-\'+J.1x+\'" 9k="3"><2u>\'+J.7M+"</2u></th>").4o(tr);4A=1k}1j{$(\'<th 2s="Vr-61 ui-4N-5P ui-qb-4k-1H-\'+J.1x+\'"><2u>\'+J.7M+"</2u></th>").4o(tr)}});1b 7M},Vq:1a(){K 3o={};3o[1S.2m.1Z]={ee:1,1x:"1Z",7M:QB.1e.1U.3U.4f.6W.Dv,1C:"9f"};3o[1S.2m.3n]={ee:2,1x:"3n",7M:QB.1e.1U.3U.4f.6W.8C,1C:"3n"};3o[1S.2m.aj]={ee:3,1x:"aj",7M:QB.1e.1U.3U.4f.6W.9b,1C:"2g"};3o[1S.2m.9O]={ee:4,1x:"9O",7M:QB.1e.1U.3U.4f.6W.gp,1C:"2x"};3o[1S.2m.7J]={ee:5,1x:"7J",7M:QB.1e.1U.3U.4f.6W.m5,1C:"2x"};3o[1S.2m.cl]={ee:6,1x:"cl",7M:QB.1e.1U.3U.4f.6W.bM,1C:"2x"};3o[1S.2m.eP]={ee:7,1x:"eP",7M:QB.1e.1U.3U.4f.6W.je,1C:"9f"};3o[1S.2m.dt]={ee:8,1x:"dt",7M:QB.1e.1U.3U.4f.6W.Dq,1C:"2x"};3o[1S.2m.6H]={ee:9,1x:"6H",7M:QB.1e.1U.3U.4f.6W.zM,1C:"2g"};1p(K i=0;i<QB.1e.2e.j0;i++){3o[1S.2m.oN+i]={ee:10+i,1x:"Dr",7M:QB.1e.1U.3U.4f.6W.Vt,1C:"2g"}}1b 3o}};QB.1e.2e.2l={Ep:"1dH",Et:"1dF",aF:"Ek",vk:"vk",vi:"vi",DE:"DE"};(1a($){$.8u("ui.8O",QB.1e.2e);$.4C($.ui.8O,{Vk:"1ds Vm z6 nA f7",6Y:"1.7.1"})})(2I);QB.1e.1U.g5={hk:0,6N:1,DU:2,yQ:3,UB:4};QB.1e.1U.7t={};QB.1e.1U.7t[QB.1e.2M.7o.Vn]={3N:"XZ h9",8F:1,7Y:[QB.1e.2M.6G.b9]};QB.1e.1U.7t[QB.1e.2M.7o.Vh]={3N:"d0",8F:1,7Y:[QB.1e.2M.6G.b9]};QB.1e.1U.7t[QB.1e.2M.7o.Vu]={3N:"Y6 h9",8F:1,7Y:[QB.1e.2M.6G.b9]};QB.1e.1U.7t[QB.1e.2M.7o.oH]={3N:"is il to",8F:1,7Y:[]};QB.1e.1U.7t[QB.1e.2M.7o.Vp]={3N:"yN 6r 3a h9",8F:1,7Y:[QB.1e.2M.6G.b9]};QB.1e.1U.7t[QB.1e.2M.7o.Vs]={3N:"yN 6r XG",8F:1,7Y:[QB.1e.2M.6G.b9]};QB.1e.1U.7t[QB.1e.2M.7o.Va]={3N:"yN 6r 5e h9",8F:1,7Y:[QB.1e.2M.6G.b9]};QB.1e.1U.7t[QB.1e.2M.7o.Ef]={3N:"is in 5r",8F:1,7Y:[]};QB.1e.1U.7t[QB.1e.2M.7o.VR]={3N:"is 6r il to",8F:1,7Y:[]};QB.1e.1U.7t[QB.1e.2M.7o.Eg]={3N:"is 6r in 5r",8F:1,7Y:[]};QB.1e.1U.7t[QB.1e.2M.7o.VU]={3N:"is 1d",8F:0,7Y:[]};QB.1e.1U.7t[QB.1e.2M.7o.VQ]={3N:"is 6r 1d",8F:0,7Y:[]};QB.1e.1U.7t[QB.1e.2M.7o.Vy]={3N:"is Vz yA",8F:1,7Y:[QB.1e.2M.6G.hj,QB.1e.2M.6G.5Y]};QB.1e.1U.7t[QB.1e.2M.7o.VA]={3N:"is Vz yA or il to",8F:1,7Y:[QB.1e.2M.6G.hj,QB.1e.2M.6G.5Y]};QB.1e.1U.7t[QB.1e.2M.7o.VK]={3N:"is VG yA",8F:1,7Y:[QB.1e.2M.6G.hj,QB.1e.2M.6G.5Y]};QB.1e.1U.7t[QB.1e.2M.7o.VL]={3N:"is VG yA or il to",8F:1,7Y:[QB.1e.2M.6G.hj,QB.1e.2M.6G.5Y]};QB.1e.1U.7t[QB.1e.2M.7o.VF]={3N:"is Ui",8F:2,7Y:[QB.1e.2M.6G.hj,QB.1e.2M.6G.5Y]};QB.1e.1U.7t[QB.1e.2M.7o.VI]={3N:"is 6r Ui",8F:2,7Y:[QB.1e.2M.6G.hj,QB.1e.2M.6G.5Y]};QB.1e.1U.iX={};QB.1e.1U.iX[QB.1e.2M.bl.9W]={3N:"9W",ja:"76"};QB.1e.1U.iX[QB.1e.2M.bl.ya]={3N:"ib 9W",ja:"Yn"};QB.1e.1U.iX[QB.1e.2M.bl.rU]={3N:"rU",ja:"Ye"};QB.1e.1U.iX[QB.1e.2M.bl.fh]={3N:"fh",ja:"3r"};QB.1e.yW=1a(){J.$1C=1d};QB.1e.rT=1T 6L({$1C:"fd.rN.1e.b3.rM.Eb, fd.rR.1e.b3",4V:1d,2Q:[],4R:QB.1e.1U.g5.hk,6N:1d,8I:QB.1e.2M.7o.oH,6g:1d,83:1d,f0:1k,i6:1k,1g:1d,ad:1a(){K ad=J;4x(ad.4V!=1d){ad=ad.4V}1b ad},yL:1a(1Q){1Q.$1C=J.$1C;1Q.4R=J.4R;1Q.6N=J.6N;1Q.8I=J.8I;1Q.6g=J.6g;1Q.83=J.83},yK:1a(1Q){1Q.2Q=[];$.2p(J.2Q,1a(1W,1i){1Q.2Q.1G(1i.jm())})},jm:1a(){K 1Q=$.4C(1T QB.1e.yW,1T QB.1e.1U.Eb);J.yL(1Q);J.yK(1Q);1b 1Q},Us:1a(1Q){K 1O=1d;if(1Q==1d){1b 1O}3P(1Q.4R){1q QB.1e.1U.g5.6N:1O=1T QB.1e.Ec(J);1O.rQ(1Q);1s;1q QB.1e.1U.g5.DU:1O=1T QB.1e.DT(J);1O.rQ(1Q);1s;1q QB.1e.1U.g5.yQ:1O=1T QB.1e.xX(J);1O.rQ(1Q);1s}1b 1O},rQ:1a(1Q){K me=J;J.4R=1Q.4R;J.6N=1Q.6N;J.8I=1Q.8I;J.bO=1Q.bO;J.aB=1Q.aB;J.6g=1Q.6g;J.83=1Q.83;$.2p(1Q.2Q,1a(1W,1i){me.2Q.1G(me.Us(1i))})},CR:1a(5s){J.6N=5s;if(J.6N!=1d){if(QB.1e.1U.7t[J.8I].7Y.1f!=0&&!QB.1e.1U.7t[J.8I].7Y.d0(J.8I)){J.8I=QB.1e.2M.7o.oH}}1j{J.8I=QB.1e.2M.7o.oH}},8b:1a(){if(J.4V==1d){1b-1}1b J.4V.2Q.5f(J)},Yi:1a(){if(J.4V==1d){1b 1d}K i=J.4V.2Q.5f(J);if(i>=J.4V.2Q.1f-1){1b 1d}1b J.4V.2Q[i+1]},rw:1a(){if(J.4V==1d){1b 1d}K i=J.4V.2Q.5f(J);if(i<=0){1b 1d}1b J.4V.2Q[i-1]},Um:1a(){if(J.4V==1d){1b 0}1b J.4V.2Q.1f},DS:1a(){1b QB.1e.1U.7t[J.8I]},y7:1a(){K 1O="";if(!J.ad().rf){1b 1O}if(J.rw()==1d){1b 1O}if(J.4V==1d){1b 1O}3P(6l(J.4V.aB)){1q QB.1e.2M.bl.9W:;1q QB.1e.2M.bl.ya:1O=$("<2u> r0 </2u>");1s;1q QB.1e.2M.bl.rU:;1q QB.1e.2M.bl.fh:1O=$("<2u> or </2u>");1s}1b 1O},Xj:1a(){K 1J={};$.2p(J.ad().xW,1a(1W,5s){1J[5s.3N]={1x:5s.3N,3T:"28",1h:5s}});1b 1J},UD:1a(1i){K 1J={};$.2p(QB.1e.1U.7t,1a(1W,1g){if(1i.6N!=1d){if(1g.7Y.1f!=0){if(1i.6N!=1d&&1g.7Y.d0(1i.6N.jc)){1J[1W]={1x:1g.3N,3T:"",1h:1g}}}1j{1J[1W]={1x:1g.3N,3T:"",1h:1g}}}});1b 1J},Xc:1a(1i){K 1J={};$.2p(QB.1e.1U.iX,1a(1W,1g){1J[1W]={1x:1g.3N,3T:"",1h:1g}});1b 1J},y9:1a(){K 1J={};1J["eS-up"]={1x:"lH up",3T:"eS-up",2P:J.8b()<=0};1J["eS-f5"]={1x:"lH f5",3T:"eS-f5",2P:J.8b()>=J.Um()-1};1J["6e"]="---------";1b 1J},8w:1a(){J.rA()},nl:1a(){1b 1l},rA:1a(){if(J.6N==1d){J.f0=1l;J.i6=1l;1b}if(J.8I==QB.1e.2M.7o.Ef||J.8I==QB.1e.2M.7o.Eg){1b!1B(J.6g)}3P(J.6N.jc){1q QB.1e.2M.6G.hp:;1q QB.1e.2M.6G.5Y:;1q QB.1e.2M.6G.b9:;1q QB.1e.2M.6G.hk:J.f0=!1B(J.6g);J.i6=!1B(J.83);1s;1q QB.1e.2M.6G.hj:J.f0=!1B(J.6g)&&$.Uo(J.6g);J.i6=!1B(J.83)&&$.Uo(J.83);1s}},ie:1a(){J.8w()},lm:1a(){1b{}},U1:1a(){K 1W=J.8b();K 1i=J.4V.2Q[1W];if(1W<=0||(J.4V==1d||J.1g==1d)){1b 1k}K Eh=1W-1;K j9=J.4V.2Q[Eh];if(j9==1d||j9.1g==1d){1b 1k}J.1g.7T(j9.1g);J.4V.2Q[1W]=j9;J.4V.2Q[Eh]=1i;1b 1l},U0:1a(){K 1W=J.8b();K 1i=J.4V.2Q[1W];if(J.4V==1d||(J.1g==1d||1W>=J.4V.2Q.1f-1)){1b 1k}K eX=1W+1;K iR=J.4V.2Q[eX];if(iR==1d||iR.1g==1d){1b 1k}iR.1g.7T(J.1g);J.4V.2Q[1W]=iR;J.4V.2Q[eX]=1i;1b 1l},TZ:1a(){K 1W=J.8b();J.4V.2Q.3M(1W);J.1g.3M();1b 1l},Ub:1a(){$.2p(J.2Q,1a(1W,1i){1i.1g.3M()});J.2Q=[];1b 1l},lr:1a(1i){K 1W=1i.8b();if(1W==0){J.1g.lq(1i.8w())}1j{1i.rw().1g.yr(1i.8w())}},Dp:1a(){K 1i=1T QB.1e.Ec(J.4V);J.4V.2Q.1G(1i);J.4V.lr(1i);1b 1i},U6:1a(){K 1i=1T QB.1e.DT(J.4V);J.4V.2Q.1G(1i);J.4V.lr(1i);1b 1i},U5:1a(){K 1i=1T QB.1e.xX(J.4V);J.4V.2Q.1G(1i);J.4V.lr(1i);1b 1i},xZ:1a(1r){3P(1r){1q"eS-up":1b J.U1();1s;1q"eS-f5":1b J.U0();1s;1q"4r":1b J.TZ();1s;1q"9J":1b J.Ub();1s;1q"5L-6H-1p-5s":1b J.Dp();1s;1q"5L-yc-6H":1b J.U6();1s;1q"5L-d1-of-yb":1b J.U5();1s}1b 1k},CS:1a(1r,5s){J.CR(5s);J.ie();1b 1l},X8:1a(1r){J.8I=1r;J.ie();1b 1l},Xp:1a(1r){J.aB=1r;J.ie();1b 1l},dT:1a(1P){if(1P!==2y){J.4V=1P}}});QB.1e.Ec=1T 6L({cG:QB.1e.rT,4R:QB.1e.1U.g5.6N,$1C:"fd.rN.1e.b3.rM.U8, fd.rR.1e.b3",lm:1a(){K 1J=J.y9();1J["4r"]={1x:"hu",3T:"DZ"};1b 1J},nl:1a(){if(J.6N==1d){1b 1k}K Ed=J.DS();if(Ed!=1d){3P(Ed.8F){1q 2:1b J.f0&&J.i6;1s;1q 1:1b J.f0;1s;1q 0:1b 1l;1s}}1b 1l},l7:1a($1g,fi,5s){K me=J;if(1B(fi)){fi=1}K 2b="";if(fi==2){if(!1B(J.83)){2b=J.83}}1j{if(!1B(J.6g)){2b=J.6g}}K $2a;if(!1B(5s)&&5s.jc==QB.1e.2M.6G.hp){K yE="";if(1B(J.6g)||(!1B(J.6g)&&J.6g==1||!1B(J.6g)&&J.6g.9p=="Yv")){yE="1Z"}K U7=yE==""?"1Z":"";$2a=$("<2x>"+"<2W "+yE+\' 1o="1">rK</2W>\'+"<2W "+U7+\' 1o="0">Uu</2W>\'+"</2x>").2x(1a(1N){J.4W()}).dF(1a(1N){J.4W()})}1j{$2a=$(\'<2a 1o="\'+2b+\'">\')}$2a.iO(1a(1N){if(1N.3Z==10||(1N.3Z==13||1N.3Z==27)){1N.4I();J.4W()}});if(!1B(5s)&&5s.jc==QB.1e.2M.6G.5Y){$2a.rB({Yw:1l,Yx:1l,YZ:"YM:XK",iz:1a(2b,XH){$2a.2b(2b);if(fi==2){me.83=2b}1j{me.6g=2b}me.rA(2b,fi)},XI:1a(){2b=$2a.2b();if(fi==2){me.83=2b}1j{me.6g=2b}me.ie()}});if($2a.2b()===""){$2a.rB("Xx",1T 5Y)}$2a.gM($1g).3k()}1j{$2a.gM($1g);$2a.3k();6P(1a(){$2a.4W(1a(){K 2b=$2a.2b();if(fi==2){me.83=2b}1j{me.6g=2b}me.rA(2b,fi);me.ie()})},9i)}},yH:1a(1o,5s){if(!1B(5s)){3P(5s.jc){1q QB.1e.2M.6G.hp:1b 1o==1?"rK":"Uu"}}1b 1o},8w:1a(){K me=J;J.1P(2F);if(J.1g==1d){J.1g=$(\'<2C 2s="qb-ui-5h-5i-5J 1i">\')}J.1g.eC();J.1g.1h("1i",J);J.1g.2Y($(\'<2C 2s="qb-ui-5h-5i-3d 7O">\'));J.1g.2Y(" ");J.1g.2Y(J.y7());K 5s=J.6N;if(1B(5s)){J.1g.2Y($(\'<a 2s="qb-ui-5h-5i-2k-28-2x 9F" 5B="#">[2x 5s]</a>\'))}1j{J.1g.2Y($(\'<a 2s="qb-ui-5h-5i-2k-28-2x" 5B="#">\'+5s.3N+"</a>"))}J.1g.2Y(" ");K Uw=QB.1e.1U.7t[J.8I].3N;J.1g.2Y($(\'<a 2s="qb-ui-5h-5i-2k-7B" 5B="#">\'+Uw+"</a>"));J.1g.2Y(" ");K UG=J.DS();K $9R;K $fI;3P(6l(UG.8F)){1q 1:if(1B(J.6g)){$9R=$(\'<a 2s="qb-ui-5h-5i-2k-1o 9F" 5B="#">[yy 1o]</a>\')}1j{$9R=$(\'<a 2s="qb-ui-5h-5i-2k-1o" 5B="#"></a>\');$9R.2g(J.yH(J.6g,J.6N))}$9R.3F(1a(e){K $1g=$(J);$1g.3B();me.l7($1g,1,5s);1b 1k});J.1g.2Y($9R);if(!1B(J.6g)&&!J.f0){$9R.2r("9F");J.1g.2Y(\' <2u 2s="mb-1o">UF 1o</2u>\')}1s;1q 2:if(1B(J.6g)){$9R=$(\'<a 2s="qb-ui-5h-5i-2k-1o 9F" 5B="#">[yy 1o]</a>\')}1j{$9R=$(\'<a 2s="qb-ui-5h-5i-2k-1o" 5B="#"></a>\');$9R.2g(J.yH(J.6g,J.6N))}if(!J.f0){$9R.2r("9F")}$9R.3F(1a(e){K $1g=$(J);$1g.3B();me.l7($1g,1,5s);1b 1k});J.1g.2Y($9R);J.1g.2Y($("<2u> r0 </2u>"));if(1B(J.83)){$fI=$(\'<a 2s="qb-ui-5h-5i-2k-1o 9F" 5B="#">[yy 1o]</a>\')}1j{$fI=$(\'<a 2s="qb-ui-5h-5i-2k-1o" 5B="#"></a>\');$fI.2g(J.yH(J.83,J.6N))}if(!J.i6){$fI.2r("9F")}$fI.3F(1a(e){K $1g=$(J);$1g.3B();me.l7($1g,2,5s);1b 1k});J.1g.2Y($fI);if(!1B(J.6g)&&!J.f0||!1B(J.83)&&!J.i6){if(!1B(J.6g)&&!J.f0){$9R.2r("9F")}if(!1B(J.83)&&!J.i6){$fI.2r("9F")}J.1g.2Y(\' <2u 2s="mb-1o">UF 1o</2u>\')}1s}if(!1B(5s)&&5s.jc==QB.1e.2M.6G.5Y){if(!1B($9R)){$9R.rB()}if(!1B($fI)){$fI.rB()}}1b J.1g},dT:1a(1P){J.1P(1P)}});QB.1e.DT=1T 6L({cG:QB.1e.rT,4R:QB.1e.1U.g5.DU,$1C:"fd.rN.1e.b3.rM.DY, fd.rR.1e.b3",bO:"",yS:1k,lm:1a(){K 1J=J.y9();1J["4r"]={1x:"hu",3T:"DZ"};1b 1J},jm:1a(){K 1Q=$.4C(1T QB.1e.yW,1T QB.1e.1U.DY);J.yL(1Q);1Q.bO=J.bO;J.yK(1Q);1b 1Q},nl:1a(){1b J.yS},rA:1a(2b,fi){J.yS=!1B(J.bO)},l7:1a($1g){K me=J;K 2b="";if(!1B(J.bO)){2b=J.bO}K $2a=$(\'<2a 1o="\'+2b+\'">\').iO(1a(1N){if(1N.3Z==10||1N.3Z==13){1N.4I();J.4W()}}).4W(1a(){me.bO=$2a.2b();me.6g=me.bO;me.ie()}).gM($1g).3k()},8w:1a(){K me=J;J.1P(2F);if(J.1g==1d){J.1g=$(\'<2C 2s="qb-ui-5h-5i-5J 1i">\')}J.1g.1h("1i",J);J.1g.eC();J.1g.2Y($(\'<2C 2s="qb-ui-5h-5i-3d 7O">\'));K $le;J.1g.2Y(J.y7());if(1B(J.bO)){$le=$(\'<a 2s="qb-ui-5h-5i-2k-1o 9F" 5B="#">[yy 6H]</a>\')}1j{$le=$(\'<a 2s="qb-ui-5h-5i-2k-1o" 5B="#">\'+J.bO+"</a>")}if(!J.yS){$le.2r("9F")}$le.3F(1a(e){K $1g=$(J);$1g.3B();me.l7($1g);1b 1k});J.1g.2Y($le);1b J.1g},dT:1a(1P){J.1P(1P)}});QB.1e.xX=1T 6L({cG:QB.1e.rT,4R:QB.1e.1U.g5.yQ,$1C:"fd.rN.1e.b3.rM.E3, fd.rR.1e.b3",aB:QB.1e.2M.bl.9W,jm:1a(){K 1Q=$.4C(1T QB.1e.yW,1T QB.1e.1U.E3);J.yL(1Q);1Q.aB=J.aB;J.yK(1Q);1b 1Q},nl:1a(){K 1O=1l;if(J.2Q.1f==0&&J.4V!=1d){1b 1k}$.2p(J.2Q,1a(1W,1i){if(!1i.nl()){1O=1k;1b 1k}});1b 1O},lm:1a(){K 1J=J.y9();1J["9J"]={1x:"kQ",3T:"E4",2P:J.2Q.1f<=0};1J["4r"]={1x:"hu",3T:"DZ"};1b 1J},lr:1a(1i){K 1W=1i.8b();if(1W==0){J.1g.5u(".qb-ui-5h-5i-4Z").lq(1i.8w())}1j{1i.rw().1g.yr(1i.8w())}},CW:1a(){1b QB.1e.1U.iX[J.aB]},8w:1a(){J.1P(2F);if(J.1g==1d){J.1g=$(\'<2C 2s="qb-ui-5h-5i-5J d1">\')}J.1g.1h("1i",J);J.1g.eC();J.1g.2Y($(\'<2C 2s="qb-ui-5h-5i-3d b2">\'));K nw=J.CW();K $3G=$(\'<2C id="qb-ui-5h-5i-3G">\');$3G.2Y(J.y7());K $a=$(\'<a 2s="qb-ui-5h-5i-2k-CX" 5B="#">\'+nw.3N+"</a>");$3G.2Y($a);$3G.2Y($("<2u> "+J.ad().nC+"</2u>"));J.1g.2Y($3G);K $4Z=$(\'<2C 2s="qb-ui-5h-5i-4Z \'+nw.ja+\'">\');$.2p(J.2Q,1a(1W,1i){$4Z.2Y(1i.8w())});K yg=1T QB.1e.yh(J);$4Z.2Y(yg.8w());J.1g.2Y($4Z);1b J.1g},dT:1a(1P){J.1P(1P);if(1P!=1d){3P(6l(1P.aB)){1q QB.1e.2M.bl.9W:;1q QB.1e.2M.bl.ya:J.aB=QB.1e.2M.bl.rU;1s;5P:J.aB=QB.1e.2M.bl.9W}}}});QB.1e.yh=1T 6L({cG:QB.1e.rT,4R:QB.1e.1U.g5.UB,lm:1a(){K 1J={"5L-6H-1p-5s":{1x:"fX 6H 1p 5s",3T:"5L-6H-1p-5s"},"5L-yc-6H":{1x:"fX yc 6H",3T:"5L-yc-6H"},"6e":"---------","5L-d1-of-yb":{1x:"fX d1 of yb",3T:"5L-d1-of-yb"}};1b 1J},8w:1a(){if(J.1g==1d){J.1g=$(\'<2C 2s="qb-ui-5h-5i-5J 5L">\')}J.1g.1h("1i",J);J.1g.eC();J.1g.2Y($(\'<2C 2s="qb-ui-5h-5i-3d fW">\'));J.1g.2Y($(\'<a 2s="qb-ui-5h-5i-2k-28-2x" 5B="#">[...]</a>\'));1b J.1g},CS:1a(1r,5s){K 1i=J.Dp();1i.CR(5s);1i.ie();1b 1l},dT:1a(1P){J.1P(1P)}});QB.1e.8z=1T 6L({cG:QB.1e.xX,$1C:"fd.rN.1e.b3.rM.CU, fd.rR.1e.b3",4V:1d,r9:"UE",nC:"of iG Y8 XW",r8:"[kQ]",rf:1l,2Q:[],g0:1a(1h){J.xW=1h.xW;J.2Q=[];J.rQ(1h);J.CV()},kQ:1a(){J.2Q.2p(1a(1i,i){1i.1g.3M()});J.2Q=[]},Xl:1a(){K me=J;K 6z=".qb-ui-5h-5i-3d";$.2O("6C",6z);$.2O({4s:6z,4t:aJ,7v:{5D:0},1R:"2f",1J:{},9M:1a($1R,e){K 1i=$1R.7u(".qb-ui-5h-5i-5J:4A").1h("1i");if(1i==1d){1b 1k}K 1J=1i.lm();if(1J==1d||5c.95(1J).1f==0){1b 1k}1b{1X:1a(1r){1i.xZ(1r,1J[1r].1h)},1J:1J}}})},Xq:1a(){K me=J;K 6z=".qb-ui-5h-5i-2k-7B";$.2O("6C",6z);$.2O({4s:6z,4t:aJ,7v:{5D:0},1R:"2f",1J:{},9M:1a($1R,e){K 1i=$1R.7u(".qb-ui-5h-5i-5J:4A").1h("1i");if(1i==1d){1b 1k}K 7y=1i.UD(1i);if(7y==1d||5c.95(7y).1f==0){1b 1k}1b{1X:1a(1r){1i.X8(1r)},1J:7y}}})},Xt:1a(){K me=J;K 6z=".qb-ui-5h-5i-2k-CX";$.2O("6C",6z);$.2O({4s:6z,4t:aJ,7v:{5D:0},1R:"2f",1J:{},9M:1a($1R,e){K 1i=$1R.7u(".qb-ui-5h-5i-5J:4A").1h("1i");if(1i==1d){1b 1k}K 7y=1i.Xc(1i);if(7y==1d||5c.95(7y).1f==0){1b 1k}1b{1X:1a(1r){1i.Xp(1r)},1J:7y}}})},Xf:1a(){K me=J;K 6z=".qb-ui-5h-5i-2k-28-2x";$.2O("6C",6z);K 1V=$.2O({4s:6z,4t:aJ,7v:{5D:0},1R:"2f",1J:{},db:"Y4",9M:1a($1R,e){K 1i=$1R.7u(".qb-ui-5h-5i-5J:4A").1h("1i");if(1i==1d){1b 1k}K 1J=1i.Xj();if(1J==1d||5c.95(1J).1f==0){1b 1k}1b{1X:1a(1r){1i.CS(1r,1J[1r].1h)},1J:1J}}})},CV:1a(){K me=J;J.2D.eC();J.2D.2Y(J.8w());1b;K $4Z=$(\'<2C 2s="qb-ui-5h-5i-4Z 76">\');$.2p(J.2Q,1a(1W,1i){$4Z.2Y(1i.8w())});K X6=1T QB.1e.yh(J);$4Z.2Y(X6.8w());J.2D.2Y($4Z);J.1g=$4Z},lr:1a(1i){K 1W=1i.8b();if(1W==0){J.1g.5u(".qb-ui-5h-5i-4Z").lq(1i.8w())}1j{1i.rw().1g.yr(1i.8w())}},8w:1a(){K Xr=J.ad();if(J.1g==1d){J.1g=$(\'<2C 2s="qb-ui-5h-5i-5J d1 2D">\')}J.1g.1h("1i",J);J.1g.eC();K nw=J.CW();K $3G=$(\'<2C id="qb-ui-5h-5i-3G">\');$3G.2Y("<2u>"+J.ad().r9+" </2u>");K $a=$(\'<a 2s="qb-ui-5h-5i-2k-CX" 5B="#">\'+nw.3N+"</a>");$3G.2Y($a);$3G.2Y($("<2u> "+J.ad().nC+"</2u>"));$3G.2Y("&2q;&2q;");K CT=$(\'<a 2s="qb-ui-5h-5i-2k-9J-1J" 5B="#">\'+J.ad().r8+"</a>");CT.3F(1a(e){e.4I();Xr.kQ()});$3G.2Y(CT);J.1g.2Y($3G);K $4Z=$(\'<2C 2s="qb-ui-5h-5i-4Z \'+nw.ja+\'">\');$.2p(J.2Q,1a(1W,1i){$4Z.2Y(1i.8w())});K yg=1T QB.1e.yh(J);$4Z.2Y(yg.8w());J.1g.2Y($4Z);1b J.1g},jm:1a(){K 1Q=1T QB.1e.1U.CU;1Q.aB=J.aB;1Q.2Q=[];$.2p(J.2Q,1a(1W,1i){1Q.2Q.1G(1i.jm())});1b 1Q},6h:1a(1X){QB.1e.2o.3s.8z=J.jm();QB.1e.2o.6h(1X)},7P:1a(1X){QB.1e.2o.3s.8z=1d;QB.1e.2o.6h(1X)},dT:1a(1P){J.2D=$("#qb-ui-5h-5i");if(J.2D.1f){if(!1B(J.2D.1n("nC"))){J.nC=J.2D.1n("nC")}if(!1B(J.2D.1n("r9"))){J.r9=J.2D.1n("r9")}if(!1B(J.2D.1n("r8"))){J.r8=J.2D.1n("r8")}if(!1B(J.2D.1n("rf"))){J.rf=J.2D.1n("rf").3W()=="1l"}}J.1P(1d);J.CV();J.Xl();J.Xf();J.Xq();J.Xt()}});QB.1e.8z.2l={X9:"X9",Xg:"Xg"};K 6Y=4;K Pe=1l;K pK="r4/";K EN="1.11.0";K TH="2.99.99";K EK="1.11.0";K TQ="2.99.99";K TF="Cz j4 Wl.js is 6r cR.";K F5="2I Xd is 6r a4.";K TO="zB Xd is 6r a4.";K TU="Xo 2I 6Y v.$1 Xn! 2I v.$2 or Wn is Wj.";K TB="Xo zB 6Y v.$1 Xn! zB v.$2 or Wn is Wj.";K S9=\'Ys Yt dJ ee. 2I r0 zB Yy be cR zs dJ iG "Wl.js"\';K CB=\'Yq r4 Yg is Yd. Wy eH Wx "Yj.7w" Yk.\';K n4=1k;K 3D=1a(){J.kR=1d;J.7e=1d;J.2i=1d;J.F3=1d;J.2e=1d;J.ih=1d;J.5j=[];J.gL={};J.5W=[];J.sn="";J.8o=1d;J.vK=1d;J.pO=1k;J.3w=1d;J.jL=1d;J.er="";J.8P={};J.kK=1d;J.aR=1d;J.8z=1d;J.zw=1d;J.pM="";J.rq=1k;J.9H=0;J.v6=1l;J.s5={2e:{gu:{},fo:{}},2i:{gu:{},fo:{}}};J.wm=1a(aA){K zv=QB.1e.2o.iQ[aA];if(!1B(zv)){J.EZ(1d,zv.2i);J.Es(1d,zv.2e)}QB.1e.2o.ea=aA};J.z5=1a(45){K me=J;if(45.cX=="Wt-Wa-W4"){J.wm(45.3w)}if(QB.1e.2o.gV){6P(1a(){me.z5(45)},50);1b}QB.1e.2o.3s.CL.1G(45);QB.1e.2o.6h()};J.Qp=1a(e,2k){K 1Q=2k.1Q();if(2k.7K){QB.1e.2i.7D.3M(2k)}QB.1e.2o.Wf(1Q);QB.1e.2o.6h()};J.Ej=1a(e,1h){K 45=1h.45;K 1i=1h.1i;QB.1e.2o.3s.gQ.dM=45;QB.1e.2o.3s.gQ.fo=1i.1h;QB.1e.2o.3s.gQ.We=1h.zK;QB.1e.2o.3s.gQ.Wz="1Y";QB.1e.2o.6h()};J.Ev=1a(e,1v){K 1I=1v.1I;K 28=1v.28;K 9X=1v.9X;K mT=1d;if(1I!=1d&&1I.nc!=1d){mT=QB.1e.2i.Di(1I.nc)}if(mT==1d){mT=QB.1e.2i.nT(1v.8k)}K 6i=1d;if(28!=1d){6i=28.7k}if(1B(6i)){6i=1v.6i}K rt="";if(!1B(6i)){rt=6i.7x(6i.CG(".")+1)}if(mT==1d){if(1I.5A.1f>0){$.2p(1I.5A,1a(i,f){if(dX(f.7k,rt)){f.d4=1l}})}1j{K 28=1T QB.1e.1U.zI;28.7k=rt;28.d4=1l;1I.5A=[28]}K 1v={1A:1I,9X:9X};J.n3(e,1v)}1j{mT.6j("mQ",rt,1l,1l)}};J.n3=1a(e,1v){1v.1A.6x=1l;K 1y=J.bD(1v);K 66=1v.1A;if(1v.9X&&1v.9X.1f>=2){66.X=1v.9X[0];66.Y=1v.9X[1]}K 5B=$(1y).1h("me");if(5B!=1d){66.6F=5B.6F}if(J.2i!=1d){J.2i.1R(QB.1e.2i.2l.Dh,1y)}QB.1e.2o.WU(66);QB.1e.2o.6h()};J.Q8=1a(e,1h){K 1y=$(1h);K 66=1y.1h("4D");QB.1e.2o.WW(66);QB.1e.2o.6h()};J.Qm=1a(e,1h){K 1y=$(1h);K 66=1y.1h("4D");QB.1e.2o.WR(66);QB.1e.2o.6h()};J.Qh=1a(e,1h){$(J).1R(J.2l.Sw,1h);QB.1e.2o.sg([1h.1H.1Q()]);QB.1e.2o.Dd();$(J).1R(J.2l.SJ,1h)};J.Qk=1a(e,1h){K 53=1h.53;QB.1e.2o.sg([53]);QB.1e.2o.Dd();$(J).1R(J.2l.Si,1h)};J.WA=1a(1I,28){K 3n="";3n+=!1B(1I.mk)?1I.mk:1I.3N;3n+="."+28.7k;1b 3n};J.D0=1a(e,1h){QB.1e.2o.WY(1h);QB.1e.2o.6h()};J.WH=1a(66){K $1Y=$("#qb-ui-1Y");if(66[0].9s<$1Y.57()||(66[0].9x<$1Y.4O()||(66[0].9s+66.1m()>$1Y.57()+$1Y.1m()||66[0].9x+66.1w()>$1Y.4O()+$1Y.1w()))){K x=66[0].9s+66.1m()/ 2 - $1Y.1m() /2;K y=66[0].9x+66.1w()/ 2 - $1Y.1w() /2;$1Y.51({57:x,4O:y},n7)}66.2B(".qb-ui-1I-eG").WE("j5",{},De).WE("j5",{},De)};J.D1=1a(e,2k){K iV=QB.1e.2i.Di(2k.z8);if(iV!=1d){J.WH(iV);1b}K 1v=1d;if(2k.iW==1d){1v={1A:{3w:2k.z8,4Y:2k.4Y,cU:2k}}}1j{2k.iW.cU=2k;1v={1A:2k.iW}}J.n3(1d,1v)};J.CZ=1a(e,1h){K 5M=1h.5M;K rk=[];K 3o=[];J.2e.8O("Dn");1p(K i=0;i<5M.1f;i++){K 28=5M[i];K 4q=28.4q;K 3n=J.WA(28.1P,28.1A);K z9=J.2e.8O("z6",3n);1p(K j=0;j<z9.1f;j++){K 1H=z9[j];if(4q){if(1H.eH(4q)){3o.1G(1H.1Q())}}1j{if(1H.WC()){if(1H.eH(4q)){3o.1G(1H.1Q())}}1j{3o.1G(1H.1Q());J.2e.8O("jd",1H)}}}if(4q&&z9.1f==0){K zb=1T QB.1e.1U.Dj;zb.8C=3n;zb.dB=4q;K WM=J.2e.8O("nA",zb);3o.1G(WM.1Q())}K D2=1d;1p(K j=0;j<rk.1f;j++){if(28.1P!=1d&&28.1P.4Y==rk[j].4Y){D2=rk[j];1s}}if(D2==1d){K 1Q=gF({},28.1P);1Q.Yb=1l;QB.1e.2o.3s.2i.9z.1G(1Q)}}J.2e.8O("D4")};J.bD=1a(1v,6S){K 1y=QB.1e.2i.bD(1v,6S);if(6S===2y||6S==1d){1y.4K(QB.1e.7L.2l.sD,J.CZ,J);1y.4K(QB.1e.7L.2l.sf,J.D0,J);1y.4K(QB.1e.7L.2l.sJ,J.D1,J);1y.4K(QB.1e.7L.2l.sH,J.gR,J)}J.2e.8O("sM");1b 1y};J.kM=1a(1v,6S,jh){K 1y=QB.1e.2i.kM(1v,6S,jh);J.2e.8O("sM");1b 1y};J.zg=1a(1y){};J.sL=1a(1X){QB.1e.2o.3s.fN.1G("sL");J.D5();J.FI();QB.1e.2o.6h(1X)};J.VZ=1a(1X){QB.1e.2o.3s.fN.1G("sL");J.D5();QB.1e.2o.D9(1d);QB.1e.2o.6h(1X)};J.D5=1a(){QB.1e.2o.3s.7e=1T QB.1e.1U.sK;QB.1e.2o.3s.7e.dM="4z"};J.Qd=1a(){if(J.5G.2b()==J.sn){1b}J.sn=J.5G.2b();J.v6=1l;J.Qj();$(J).1R(J.2l.Ez,J.sn);$(".qb-ui-5G-84-3d-3E").5k()};J.FI=1a(){K 9q=1d;if(J.5G!=1d&&(J.5G.1f>0&&J.5G.is(":6v"))){9q=J.5G.2b()}1j{9q=J.vK}J.8o=9q;QB.1e.2o.D9(J.8o);1b 1l};J.WP=1a(){QB.1e.2o.3s.aR=J.aR;1b 1l};J.p6=1a(2g,bu){K me=J;if(!1B(2g)&&2g!=" "){if(bu!==2y){J.b1.3K("9F 5q md");J.b1.2r(bu)}J.b1.3J(2g);$("#qb-ui-5G-wr").2r("Da").3K("WO")}1j{if($("#qb-ui-5G-wr").4H("Da")){$("#qb-ui-5G-wr").3K("Da").2r("WO")}1j{me.b1.3K("9F 5q md");me.b1.3J("&2q;")}6P(1a(){me.b1.3K("9F 5q md");me.b1.3J("&2q;")},9i)}};J.F1=1a(2g){J.b1.3K("9F 5q");J.b1.2r("md");J.p6(2g)};J.Y7=1a(2g){J.b1.3K("5q md");J.b1.2r("9F");J.p6(2g)};J.XT=1a(2g){J.b1.3K("9F md");J.b1.2r("5q");J.p6(2g)};J.PY=1a(){if(J.v6){if(QB.1e.2o.sm!=J.5G.2b()){QB.1e.2o.sm=J.5G.2b()}}};J.EC=1a(e,1A){K 1v={1A:1A};J.n3(1d,1v)};J.gR=1a(e,aA){K me=J;if(QB.1e.2o.9H>0){6P(1a(){me.gR(e,aA)},100);1b}if(!1B(aA)){J.wm(aA);QB.1e.2o.3s.ea=aA;QB.1e.2o.6h()}};J.Pt=1a(e,45){QB.1e.3D.z5(45)};J.Pi=1a(e,1h){J.kR.g0(1h)};J.Pf=1a(e,1h){J.kR.g0(1h)};J.Qx=1a(5j){if(5j==1d){1b 1k}QB.1e.2i.7D.z4();1p(K 1W=0;1W<5j.1f;1W++){K 8h=5j[1W];K az=1d;if(8h.5v!=1d&&8h.5y!=1d){az=QB.1e.2i.7D.zm(8h.5v.ao,8h.5y.ao)}if(az==1d){QB.1e.2i.7D.sz(8h)}1j{az.sF=1k;QB.1e.2i.7D.zl(az,8h)}}QB.1e.2i.7D.zk()};J.QP=1a(zq,kO){1p(K j=kO.1f-1;j>=0;j--){K zf=kO[j];if(QB.1e.2i.D7(zq,zf)){1b j}}1b-1};J.QR=1a(zq,kO){1p(K j=kO.1f-1;j>=0;j--){K zf=kO[j];if(QB.1e.2i.Ei(zq,zf)){1b j}}1b-1};J.Qw=1a(m8){if(m8==1d){1b}K bs=m8.4d();K kJ=[];K lN=[];K Fo=[];K me=J;1p(K i=QB.1e.2i.5W.1f-1;i>=0;i--){K sW=QB.1e.2i.5W[i];K Fq=sW.1h("1A");K ac=J.QP(Fq,bs);if(ac==-1){ac=J.QR(Fq,bs)}if(ac==-1){kJ.1G(sW)}1j{K Fr=bs[ac];bs.3M(ac);if(!Fr.7K){lN.1G({1Q:Fr,6S:sW})}1j{kJ.1G(sW)}}}$.2p(bs,1a(1W,1Q){Fo.1G(1Q)});$.2p(lN,1a(1W,1y){me.kM({1A:1y.1Q},1y.6S,1l)});$.2p(kJ,1a(1W,ds){QB.1e.2i.zg(ds,1l)});$.2p(Fo,1a(1W,1Q){if(!1Q.7K){me.bD({1A:1Q})}})};J.QY=1a(eO,Fp){if(eO==1d||eO.1f==0){1b eO}1p(K j=0;j<Fp.1f;j++){K mn=Fp[j];K ac=-1;1p(K i=0;i<eO.1f;i++){K mm=eO[i];if(!1B(mm.6F)&&mm.6F==mn.6F||(!1B(mm.3w)&&mm.3w==mn.3w||mm.4Y==mn.4Y)){ac=i;1s}}if(ac!=-1){eO[ac]=gF(eO[ac],mn)}1j{eO.1G(mn)}}1b eO};J.QL=1a(gE,Ft){if(gE==1d){1b gE}1p(K j=0;j<Ft.1f;j++){K r2=Ft[j];K ac=-1;1p(K i=0;i<gE.1f;i++){K r1=gE[i];if(r1.8b==r2.8b&&dX(r1.8C,r2.8C)||dX(r1.8C,r2.8C)&&dX(r1.9b,r2.9b)){ac=i;1s}}if(ac!=-1){gE[ac]=gF(gE[ac],r2)}1j{if(!r2.7K){gE.1G(r2)}}}1b gE};J.R6=1a(1h,r){if(!1B(r.8n)&&r.8n.1f>0){if(!1B(r.8n)&&r.8n.1f>0){1h.8n=J.QL(1h.8n,r.8n)}}1b 1h};J.QZ=1a(1h,r){if(!1B(r.f6)){if(1B(1h.f6)){1h.f6={}}1h.f6=gF(1h.f6,r.f6)}if(!1B(r.9z)&&r.9z.1f>0){if(!1B(r.9z)&&r.9z.1f>0){1h.9z=J.QY(1h.9z,r.9z)}}1b 1h};J.FP=1a(ma,1h,bm,7F){if(1B(bm)){1b}K me=J;1p(K i in ma.gu){if(!ma.gu.87(i)){aN}if(i<=bm){aN}K r=ma.gu[i];if(1B(7F)){1h=gF(1h,r)}1j{1h=7F.2J(J,1h,r)}}if(ma.gu.87(bm)){4r ma.gu[bm]}1b 1h};J.EZ=1a(e,1h,bm){K 1Y=J.FP(QB.1e.3D.s5.2i,1h,bm,J.QZ);if(1Y==1d){1b}J.Qw(1Y.9z);J.Qx(1Y.7D);if(1Y.f6!=1d){QB.1e.2i.Qr(1Y.f6.eK)}if($("#qb-ui-1Y").is(":6v")){QB.1e.2i.e2()}};J.PQ=1a(e,sQ){if(J.ih!=1d){J.ih.Qq(sQ)}};J.Q5=1a(e,dY){K me=J;if(1B(dY)){1b}J.kK=dY;if(J.jL!=1d){J.jL.EG(J.kK)}if(J.ih!=1d){J.ih.Qt(J.kK)}};J.T4=1a(e,1V){if(QB.1e.2i!=1d){QB.1e.2i.f7(1V.2i);QB.1e.2i.QI(1V.QH);QB.1e.2i.QE(1V.ai,1V.QD)}J.2e.8O("f7",1V.2e);J.f7(1V.kP,"#qb-ui-1Y-aI-fW-3d");J.f7(1V.fX,"#qb-ui-1Y-8M-fW-3d")};J.Q4=1a(e,vZ){if(vZ==1d){1b}K me=J;K vX=0;if(J.cm.1f>0){vX=J.cm[J.cm.1f-1].Id}1p(K 1W=0;1W<vZ.2Q.1f;1W++){K 8X=vZ.2Q[1W];if(vX==1d||8X.Id>vX){J.cm.1G(8X);K Fk="XD";if(8X.4R==2){Fk="XC"}if(8X.4R==3){Fk="9Z"}K YS=w4(8X.Fh).7l("H:i:s")}}};J.Q6=1a(e,5q){J.sd=5q;J.pM="";if(5q!=1d){J.pM=5q.h2}if(5q==1d){1b}if(1B(5q.h2)){1b}K 3E=$(".qb-ui-5G-84-3d-3E");3E.5k();K 3G=$(".qb-ui-5G-84-3d-3G");K 8X=\'<2C 2s="wp"><p>\'+5q.h2+"</p></2C>";K 9o=\'<2C 2s="8x">\'+\'<2a 1C="3d" 2s="ui-4N-5P" id="5q-8x-go-to-2R" 1o="Go to 5q 2R">\'+\'<2a 1C="3d" 2s="ui-4N-5P" id="5q-8x-9J" 1o="kQ i4">\'+\'<2a 1C="3d" 2s="ui-4N-5P" id="5q-8x-n9" 1o="YI w2 to iG dQ i4.">\'+"</2C>";3E.2r("5q");3E.2r("wk");3G.3J("<2C>"+8X+9o+"</2C>")};J.Qf=1a(){J.Ry()};J.Qc=1a(){J.5G.2b("");J.wg()};J.Q9=1a(){J.5G.2b(J.R1);J.wg()};J.Eo=1a(){K 3E=$(".qb-ui-5G-84-3d-3E");3E.3K("5q");3E.3K("wk");K 3G=$(".qb-ui-5G-84-3d-3G");K 8X=\'<2C 2s="wp"><p>\'+QB.1e.1U.3U.4f.Rm+\'</p><2C 2s="wp">\';3G.3J(8X)};J.Ry=1a(){K 5q=J.sd;K 3E=$(".qb-ui-5G-84-3d-3E");3E.3K("wk");3E.3B();if(5q!=1d&&5q.Rx!=1d){K 2a=$("#qb-ui-5G 8D");if(2a.1f!=1){2a=$("#9q-FN")}if(2a.1f!=1){1b}1j{2a=2a[0]}K 3t=5q.Rx.3t;6E{if(2a.w1){2a.3k();2a.w1(3t,3t)}1j{if(2a.sb){K dz=2a.sb();dz.RA(1l);dz.Rz("vM",3t);dz.Rt("vM",3t);dz.2x()}}}6I(e){}}};J.Es=1a(e,1h,bm){if(1h==1d||1h.8n==1d){1b}K 4k=J.FP(QB.1e.3D.s5.2e,1h,bm,J.R6);if(4k==1d){1b}K me=J;me.2e.8O("R9",4k);me.2e.8O("R2")};J.T5=1a(e,9q){if(7Q(e)=="4F"&&9q===2y){9q=e}if(9q!==" "&&1B(9q)){1b}J.5G.2b(9q);J.sn=J.5G.2b();J.vK=9q;J.8o=9q;QB.1e.2o.sm=9q;J.Eo();if(1B(J.pM)){$(".qb-ui-5G-84-3d-3E").3B()}if(!1B(9q)){J.R1=9q}};J.PT=1a(e,ad){if(1B(ad)){1b}if(J.8z==1d){1b}J.8z.g0(ad)};J.Yc=1a(1X){J.FJ(1a(1h){if(1X&&7Q(1X)=="1a"){1X(1h.h0)}})};J.Yh=1a(1D,1X){QB.1e.2o.3s.h0=1D;1b QB.1e.2o.vQ(1X)};J.FZ=1a(FU,FV){};J.Ek=1a(e,1h){$(J).1R(J.2l.FG,1h);K 1H=1h.1H;K 1r=1h.1r;K 6k=1h.6k;K 4y=1h.4y;K 3o=[];K 53=1H.1Q();53.Ri=1h.iK;53.FD=1r;53.FE=4y;if(1H.7K){K 3n=53.8C;if(!1B(3n)&&3n.5f(".")!=-1){K 8k=3n.7x(0,3n.5f("."));K 6i=3n.7x(3n.5f(".")+1);K 1I=QB.1e.2i.nT(8k);if(1I!=1d){1I.6j("mQ",6i,1k)}}}3P(1r){1q 1S.2m.1Z:K 3n=53.8C;if(!1B(3n)&&3n.5f(".")!=-1){K 8k=3n.7x(0,3n.5f("."));K 6i=3n.7x(3n.5f(".")+1);K 1I=QB.1e.2i.nT(8k);if(1I!=1d){1I.6j("mQ",6i,4y)}}3o.1G(53);1s;1q 1S.2m.3n:K 1Z=53.dB;if(1B(6k)&&6k!=4y){1Z=1l;53.dB=1l}K 3n=6k;if(!1B(3n)&&3n.5f(".")!=-1){K 8k=3n.7x(0,3n.5f("."));K 6i=3n.7x(3n.5f(".")+1);K 1I=QB.1e.2i.nT(8k);if(1I!=1d){1I.6j("mQ",6i,1k)}}3n=4y;if(1Z&&(!1B(3n)&&3n.5f(".")!=-1)){K 8k=3n.7x(0,3n.5f("."));K 6i=3n.7x(3n.5f(".")+1);K 1I=QB.1e.2i.nT(8k);if(1I!=1d){1I.6j("mQ",6i,1Z)}}3o.1G(53);1s;1q 1S.2m.9O:;1q 1S.2m.7J:K FA=J.2e.8O("Rh");1p(K i=0;i<FA.1f;i++){3o.1G(FA[i].1Q())}1s;5P:3o.1G(53)}QB.1e.2o.sg(3o);QB.1e.2o.6h();$(J).1R(J.2l.aF,1h)};J.FB=1a(7y){if(7y==1d||7y.1f==0){1b 1d}K 1J={};K 5F;1p(K i=0;i<7y.1f;i++){5F=7y[i];if(5F.3N!=1d&&5F.3N.7x(0,1)=="-"){1J[5F.cX]=5F.3N}1j{1J[5F.cX]={1x:5F.3N,3T:5F.cX,1J:J.FB(5F.2Q),1h:5F.3w}}}1b 1J};J.f7=1a(1V,6z){K me=J;if(1B(1V)||1V.2Q.1f==0){1b}K 1J=J.FB(1V.2Q);K $6z=$(6z);if($6z.1f>0){$6z[0].Re=0}$6z.dC().1n("Re",0).8i(1a(e){if(e.3Z==13||e.3Z==32){$(e.3f).1R("3F")}});$.2O("6C",6z);$.2O({4s:6z,4t:aJ,7v:{5D:0},1X:1a(45,1v){K 1i=1d;6E{1i=1v.$1Z.1h().2O.1J[45]}6I(e){}6P(1a(){me.Ej(J,{45:45,1i:1i})},0)},1J:1J});$6z.3F(1a(){$(6z).2O();$1V=$(6z).2O("1g");if($1V){$1V.2R({my:"2f 1M",at:"2f 4P",of:J})}})};J.Yz=1a(1X){if(J.8z.nl()){J.8z.6h(1X);1b 1l}1j{1b 1k}};J.Rb=1a(1X){QB.1e.2o.6h(1X)};J.YB=1a(1X){J.wm(QB.1e.2o.nr);QB.1e.2o.3s.ea=QB.1e.2o.nr;QB.1e.2o.6h(1X)};J.YE=1a(1X){QB.1e.2o.3s.8z=1d;QB.1e.2o.6h(1X)};J.Qg=1a(1X){$(".qb-ui-5G-84-3d-3E.5q").2r("wk")};J.wg=1a(1X){$(".qb-ui-5G-84-3d").2r("Ra");J.wf(1a(){$(".qb-ui-5G-84-3d").3K("Ra");if(1X&&7Q(1X)=="1a"){1X()}});1b 1k};J.wf=1a(1X){J.pM="";J.FI();QB.1e.2o.6h(1X);$(J).1R(J.2l.FK);1b 1k};J.FJ=1a(1X){K me=J;if(J.9H<0){J.9H=0}if(J.9H>0){6P(1a(){me.FJ(1X)},100);1b}J.wf(1X)};J.7P=1a(1X){QB.1e.2o.7P(1X)};J.nQ=1a(1X){QB.1e.2o.nQ(1X)};J.8L=1a(){n4=!($(".fg").1n("n4")===2y);if(!n4){J.TJ()}QB.1e.2o.aL=$(".fg").1n("aL");QB.1e.2o.wi=$(".fg").1n("wi")=="1l";F9=$(".fg").1n("PA")=="1l";ED=$(".fg").1n("YR")=="1l";J.pO=$(".fg").1n("pO")=="1l";K EB=$(".fg").1n("Yf");if(!1B(EB)){pK=EB}J.wj=$("#qb-ui-1Y").4H("wj");K me=J;J.cm=[];J.cR=1k;if(!J.pO){$.84(pK+"?45=YX&YP="+QB.1e.2o.aL,wq,1a(1h){})}J.b1=$("#qb-ui-5G-wr-wp");J.2e=$("#qb-ui-4k").8O();J.F3=J.2e.8O("gA");QB.1e.2i.8L();J.2i=QB.1e.2i!=1d?QB.1e.2i.1Y:1d;if($(".qb-ui-3I").1f){J.kR=1T QB.1e.7e;J.7e=J.kR.wo();J.7e.4K(QB.1e.7e.2l.hb,J.EC,J);QB.1e.2o.eD.2S(QB.1e.2o.eD.2l.6M,J.Pi,J)}1j{if($(".qb-ui-3I-pE").1f){J.kR=1T QB.1e.e4;J.7e=J.kR.wo();J.7e.4K(QB.1e.e4.2l.hb,J.EC,J);QB.1e.2o.i0.2S(QB.1e.2o.i0.2l.6M,J.Pf,J)}}J.jL=1d;J.ih=1d;if(Pe){J.jL=1T QB.1e.jO;J.ih=1T QB.1e.9c;J.9c=J.ih.3q}if(J.jL!=1d){J.jO=J.jL.EG();J.jO.4K(QB.1e.jO.2l.wa,J.gR,J)}if(J.9c!=1d){J.9c.4K(QB.1e.9c.2l.wb,J.gR,J);J.9c.4K(QB.1e.9c.2l.w9,J.Pt,J)}J.5G=$("#qb-ui-5G 8D");if(ED){J.5G.1n["EI"]="EI"}if(!ED){J.5G.4K("pH 4W pH 2a XS",J.Qd,J);$("#qb-ui-5G-8x-84").4K("3F",J.wf,J)}$("#qb-ui-5G-8x-nQ").4K("3F",1a(){QB.1e.2o.nQ()},J);$(".qb-ui-5G-84-3d-3E").3B();$(".qb-ui-5G-84-3d").4K("3F",J.wg,J);$(".qb-ui-5G-84-3d").4K("nU",J.Qg,J);$(2K).on("3F","#5q-8x-go-to-2R",1a(){me.Qf();1b 1l});$(2K).on("3F","#5q-8x-9J",1a(){me.Qc()});$(2K).on("3F","#5q-8x-n9",1a(){me.Q9()});J.Eo();if(J.2i!=1d){J.2i.4K(QB.1e.2i.2l.vg,J.n3,J);J.2i.4K(QB.1e.2i.2l.vh,J.Q8,J);J.2i.4K(QB.1e.2i.2l.vd,J.Qm,J);J.2i.4K(QB.1e.2i.2l.ve,J.Ev,J);J.2i.4K(QB.1e.2i.2l.vl,J.Ej,J);J.2i.4K(QB.1e.2i.cU.2l.pR,J.Qp,J)}J.2e.4K(QB.1e.2e.2l.aF,J.Ek,J);J.2e.4K(QB.1e.2e.2l.Ep,J.Qh,J);J.2e.4K(QB.1e.2e.2l.Et,J.Qk,J);J.2e.4K(QB.1e.2e.2l.vk,J.n3,J);J.2e.4K(QB.1e.2e.2l.vi,J.Ev,J);J.Qj=$.ho(J.PY,n7,J);J.8z=1T QB.1e.8z;QB.1e.2o.9c.2S(QB.1e.2o.9c.2l.6M,J.PQ,J);QB.1e.2o.2e.2S(QB.1e.2o.2e.2l.6M,J.Es,J);QB.1e.2o.2i.2S(QB.1e.2o.2i.2l.6M,J.EZ,J);QB.1e.2o.8z.2S(QB.1e.2o.8z.2l.6M,J.PT,J);QB.1e.2o.2S(QB.1e.2o.2l.vc,J.Q5,J);QB.1e.2o.2S(QB.1e.2o.2l.v5,J.Q4,J);QB.1e.2o.2S(QB.1e.2o.2l.v3,J.Q6,J);QB.1e.2o.2S(QB.1e.2o.2l.v1,J.T4,J);QB.1e.2o.2S(QB.1e.2o.2l.v9,J.T5,J);QB.1e.2o.eD.2S(QB.1e.2o.2l.v8,1a(e,1h){J.F1(QB.1e.1U.3U.4f.Th)},J);QB.1e.2o.2S(QB.1e.2o.2l.6M,1a(e,1h){if(1B(1h)){1b}J.v6=1k;J.er=1h.er;if(!1B(1h.aR)){J.aR=1h.aR}if(!1B(1h.h0)){J.h0=1h.h0}if(!1B(1h.8P)){J.8P=1h.8P;if(!1B(1h.8P.Tj)&&!1h.8P.Tj){$("#qb-ui-1Y-aI-EW-ST").3B()}if(!1B(1h.8P.Tc)&&!1h.8P.Tc){$("#qb-ui-1Y-aI-Yo-ST").3B()}me.2e.8O("SY")}if(!1B(1h.jW)){J.jW=1h.jW}J.p6(1h.h2.b9,1h.h2.6L)},J);QB.1e.2o.eD.2S(QB.1e.2o.eD.2l.iL,1a(e,1h){K F7=$("#eF-8c",1P.2K.3H);if(F7.1f){F7.3B()}},J);$(".fl-1R","#qb-ui-1Y-aI").3F(1a(){me.SX()})};J.Yu=1a(){J.F3.vC()};J.SX=1a(6v){if(6v==2y){$(".fl-5J","#qb-ui-1Y-aI").8N("fl-4N-hY fl-4N-b7");1b}if(6v){$(".fl-5J","#qb-ui-1Y-aI").3K("fl-4N-b7").2r("fl-4N-");$("#qb-ui-1Y-aI").2r("TK")}1j{$(".fl-5J","#qb-ui-1Y-aI").3K("fl-4N-hY").2r("fl-4N-b7");$("#qb-ui-1Y-aI").3K("TK")}};J.gb=1a(82){1b 6l(82.3u(/(\\.|^)(\\d)(?=\\.|$)/g,"$10$2").3u(/(\\d+)\\.(?:(\\d+)\\.*)/,"$1.$2"))};J.TJ=1a(){if($(".fg").1f==0){1b}if(7Q(TL)=="2y"){ff(TF)}if(!($&&($.fn&&$.fn.fc))){ff(F5)}if(!($&&($.fn&&$.fn.fc))){ff(F5)}1j{if(J.gb($.fn.fc)<J.gb(EN)||J.gb($.fn.fc)>J.gb(TH)){ff(TU.3u("$1",$.fn.fc).3u("$2",EN))}}if(!($&&($.ui&&$.ui.6Y))){ff(TO)}1j{if(J.gb($.ui.6Y)<J.gb(EK)||J.gb($.ui.6Y)>J.gb(TQ)){ff(TB.3u("$1",$.ui.6Y).3u("$2",EK))}}if($&&($.fn&&$.fn.fc)){if($.fn.cK===2y){ff(S9)}}};J.RI=1a(){1b QB.1e.3D.vz};J.EF=1a(){K ET;K ER=0;1p(K i=0;i<QB.1e.3D.mB.1f;i++){K 1g=$("*[1M-8U-id="+QB.1e.3D.mB[i]+"]");K DN=6l($(1g).7u(".qb-ui-1I:eq(0)").2T("z-1W"));if(DN>ER){ER=DN;ET=1g}}1b ET};J.RB=1a(el){QB.1e.3D.mB.1G(QB.1e.3D.vA);$(el).1n("1M-8U-id",QB.1e.3D.vA);QB.1e.3D.vA++;QB.1e.3D.vz=J.EF()};J.RE=1a(el){K 2R=QB.1e.3D.mB.5f(6u($(el).1n("1M-8U-id")));QB.1e.3D.mB.5X(2R,1);QB.1e.3D.vz=J.EF()};J.Ey=1a(){QB.1e.3D.mB=1T 3Q;QB.1e.3D.vz=1d;QB.1e.3D.vA=0};J.2l={RS:"RS",RR:"RR",Ez:"Ez",FK:"FK",FG:"FG",aF:"aF",Sw:"aF",SJ:"aF",Si:"aF"};QB.1e.XQ=J.2l;J.fD={fW:\'<3b 2s="3b--fW" gK="6t://dN.w3.ew/i9/3b" 1m="16" 1w="16" kv="0 0 16 16"><5b>5L-1I</5b><1K d="M2.Sm XR.Sl 1 1 1.7 1 2.XP.XY 14.3 1.Sl 15 2.Sm 13p.13q.3 15 15 14.3 15 13.13o.13m 1.7 14.3 1 13.PV 13n.13r" 2d="#VB"/><1K d="Df 13v" 2d="#sU"/></3b>\',Sj:\'<3b 2s="3b--13u-13s" gK="6t://dN.w3.ew/i9/3b" 1m="16" 1w="16" kv="0 0 16 16"><5b>13t</5b><g 2d="3r" 2d-pv="pq"><1K d="M-110-13l-xw"/><1K d="Df.13d 8.13e.RT-.192.hT-.13c.hT-.RU 0-.13a-.pV-.S1-.hT-.Tm.vv-.DX.114-.pL.144-.Ea.jo-.TP-1.2-2.vw-.jo-.132-.RZ-.18-.nD-.S6-1.qm.6c-.Tw-.24-.Tx-.Tv-1.im-.vr-.qq-1.13b.QW 2.108 9.188 2 9.13g 2h-2.4c-.15 0-.TC.108-.jr.Tn-.qq 1.DC-.nD.15-.To.Tl-1.im.vr-1.qm-.6c-.138-.p8-.jr 0-.nD.S6-1.2 2.vw-.13O.132-.hT.jr.jo.RY.vv.DX-.RT.192-.hT.39-.hT.RU 0 .198.pV.S1.hT.vr-1.vv.DX-.114.pL-.144.Ea-.jo.RY.2 2.vw.jo.132.RZ.18.nD.Ts.qm-.6c.Tw.24.Tx.Tv 1.im.vr.qq 1.DC.pV.144.144.Ea.jr.13M.4c.15 0 .TC-.108.jr-.Tn.qq-1.DC.nD-.15.To-.Tl 1.im-.Tm.qm.6c.138.p8.jr 0 .nD-.Ts.2-2.vw.jo-.132.hT-.jr-.jo-.TP-1.vv-.13K.13L 10.1c-1.158 0-2.1-.vt-2.1-2.1 0-1.158.vt-2.1 2.1-2.1 1.158 0 2.1.vt 2.1 2.1 0 1.158-.vt 2.1-2.1 2.1z" 2d="#sU"/></g></3b>\',TG:\'<3b 2s="3b--4r" gK="6t://dN.w3.ew/i9/3b" 1m="16" 1w="16" kv="0 0 16 16"><5b>13T</5b><g 2d="3r" 2d-pv="pq"><1K d="M-110-13U-xw"/><1K d="13S 3.13Q.nK 1 8 5.nK 3.xq 1 1 3.xq 5.nK 8 1 12.nK 3.xq 15 8 10.xq 12.nK 15 15 12.nK 10.13B 8 15 3.13C" 2d="#sU"/></g></3b>\',SU:\'<3b 2s="3b--SV" gK="6t://dN.w3.ew/i9/3b" 1m="16" 1w="16" kv="0 0 16 16"><5b>13z</5b><g 2d="3r" 2d-pv="pq"><1K d="M-110-13D-xw"/><1K d="M2 11.13I.13G.13E.xi-7.13F-2.5-2.12C 11.12B.12z-6.12A.26-.26.26-.68 0-.12E-1.56-1.12H-.26-.26-.68-.26-.94 12F-1.22 1.22 2.5 2.5 1.22-1.12G" 2d="#sU"/></g></3b>\',Q0:\'<3b 2s="3b--2k" 1m="16" 1w="16" kv="0 0 16 16" gK="6t://dN.w3.ew/i9/3b"><5b>12y</5b><g 2d="3r" 2d-pv="pq"><1K d="M-110-12q-xw"/><1K d="12r.3 7.12p-.15-.Rw-.36-.65-.12n-.Rl-.59-.12o-.12s-.Rj-.CP.12w-.CQ.CQ-.3.3c-.Rk.Rn-.103.115-.144.178.Rq.12x.77.187 1.p8.47.12v.CI.PV.67.47 1.qV.im.12t-.12K.131-.xU.63-.12Z.qq-.2.Qz-.QA.12X-.im.pV-.34.34-.l3.l3-.44.44-1.147 1.QG-.31.31-.El.48-1.162.48-.44 0-.133-.17-1.162-.48-.31-.31-.48-.El-.48-1.162 0-.44.17-.85.48-1.12O.15-1.15c-.12P-.QU-.114-.41-.143-.QV-.QS-.156-.pI-.12L-.pI-.l3-.Qy-.29.H3-.58.1-.12M-2.pL 2.12Q-1.xD 1.QJ-1.xD 3.16 0 4.12U.Pj.Pj 1.39.Pk 2.18.Pk.79 0 1.58-.3 2.182-.12V.12T-2.pL.31-.Rf.18-.177.12R-.xi.R4-.58.197-.12S.33-.151.R5-1.H3.H3-.186.qV-.xi.qV-.152 0-.23-.R7-.46-.xU-.Ru-.Rv-.195-.106-.14Z-.19-.14X.14Y-4.153.qm 2.3 11.159 2 10.15a 2c-.79 0-1.58.3-2.183.154.14O 4.14P-.31.Rf-.18.18-.14N.U4-.R4.58-.197.14M-.33.14Q-.R5 1.pI-.14U.186-.qV.xi-.qV.14V 0 .23.R7.46.xU.Ru.Rv.196.106.14T.19.14R.15.Rw.15s.65.15t.Rl.59.15u.15y.Rj.CP-.CP.29-.CQ.15z-.3c.Rk-.Rn.103-.116.144-.18-.Rq-.15x-.77-.185-1.p8-.47-.CI-.CI-.15v-.67-.47-1.p8-.im-.15w.15o-.15g.xU-.15h.15f-.15d.198-.Qz.QA-.15e.im-.pV.34-.34.l3-.l3.44-.44 1.147-1.QG.31-.31.El-.48 1.163-.48.44 0 .85.17 1.16.48.Qu.64.Qu 1.14e.Qy 2.14c-1.15 1.15c.14d.QU.113.41.142.QV.QS.156.pI.QW.pI.l3.14l.29-.14k.58-.1.14j.pL-2.14b.xD-1.QJ 1.xD-3.16 0-4.13Z" 2d="#sU"/></g></3b>\',xB:\'<3b 2s="3b--140-rz" gK="6t://dN.w3.ew/i9/3b" gK:cT="6t://dN.w3.ew/QO/cT" 1m="Wr" 1w="Wr" kv="0 0 16 16" 6Y="1.1"><5b>141</5b><pT>WL h9 14a.</pT><ex/><g id="146-1" 2n="3r" 2n-1m="1" 2d="3r" 2d-pv="pq"><4L id="14A" x="-110" y="-14F" 1m="14K" 1w="14z"/><1K d="M1,3.qW C1,1.W9 1.WV,1 3.qW,1 14q.wG,1 14o.Wd,1 15,1.WV 15,3.qW 14p,12.wG 14t,14.Wd 14.W7,15 12.wG,15 L3.qW,15 C1.W9,15 1,14.W7 1,12.wG L1,3.qW Z M6.Uk,10.HY C6.109,9.10a 6.10e,9.10i 7.10j,8.10f C7.10g,8.ZZ 7.101,8.10k 8.10A,7.10B C8.10x,7.10C 8.10G,7.10H 8.10F,6.10D C8.10E,6.10w 8.Fa,6.10o 8.Fa,5.10p C8.Fa,5.10n 8.10l,5.10m 8.10q,4.10u C8.10v,4.10t 8.10r,4.x0 7.UY,4.x0 C7.Zn,4.x0 7.Zo,4.Zm 7.Zk,4.Zl C7.Zt,4.Zu 7.Zs,5.Zq 7.Zr,5.UI L5.Zj,5.UI L5.Zc,5.Za C5.Zi,4.Zg 5.Ze,4.Zf 5.Zv,3.ZL C6.ZO,3.ZP 7.ZA,2.E0 7.UY,2.E0 C8.Zy,2.E0 9.Zw,3.Zx 10.ZB,3.ZF DL.ZG,4.ZE 10.Dw,4.ZD 10.Dw,5.11U DL.Dw,6.11V 10.11T,6.11R 10.x0,7.11S DL.11K,7.11C 9.11D,8.11z 9.U4,8.11I C9.11H,8.11F 8.11G,9.11W 8.12e,9.12f C8.12d,9.12b 8.Ud,9.12c 8.Ud,10.HY L6.Uk,10.HY Z M8.IM,13 L6.Uh,13 L6.Uh,11.VH L8.IM,11.VH L8.IM,13 Z" id="11Z-11Y" 2d="#VB"/></g></3b>\'}};if(!3z.dE){3z.dE={}}if(!3z.dE.lI){3z.dE.lI=1a(){}}if(!3z.dE.Gz){3z.dE.Gz=1a(){}}K lM;K lK=1d;K wQ=0;1a Gr(){if(wQ==1d){wQ=0}1b wQ++}2I(2K).125(1a(){$.fn.dC=$.fn.3d;if($.fn.3d&&$.fn.3d.VW){K W1=$.fn.3d.VW();$.fn.dC=$.fn.3d;$.fn.3d=W1}QB.1e.3D=1T 3D;QB.1e.3D.8L();lM=QB.1e.3D;W2();lM.VZ()});$.ui.7g.3g.10Q=1a(1N,wX){J.2R=J.V1(1N);J.V2=J.V7("7X");if(J.1v.Ht){if(J.1v.5T){J.1v.5T()}}1j{if(!wX){K ui=J.fV();if(J.9g("5T",1N,ui)===1k){J.V8({});1b 1k}J.2R=ui.2R}}if(!J.1v.aZ||J.1v.aZ!="y"){J.43[0].2G.2f=J.2R.2f+"px"}if(!J.1v.aZ||J.1v.aZ!="x"){J.43[0].2G.1M=J.2R.1M+"px"}if($.ui.fS){$.ui.fS.5T(J,1N)}1b 1k};$.ui.7g.3g.11r=1a(1N,wX){if(J.11s){J.2v.1P=J.11q()}J.2R=J.V1(1N,1l);J.V2=J.V7("7X");if(J.1v.Ht){if(J.1v.5T){J.1v.5T()}}1j{if(!wX){K ui=J.fV();if(J.9g("5T",1N,ui)===1k){J.V8({});1b 1k}J.2R=ui.2R}}J.43[0].2G.2f=J.2R.2f+"px";J.43[0].2G.1M=J.2R.1M+"px";if($.ui.fS){$.ui.fS.5T(J,1N)}1b 1k};2I.fn.11n=1a(bv){K 1g=J;if(!1g){1b}K 3f=$(1g);if(3f.is(":6v")==1k){1b 1k}bv=$(bv||3z);K 1M=bv.4O();K c8=1M+bv.1w();K Hb=3f.2v().1M;K Vw=Hb+3f.1w();1b Vw<=c8&&Hb>=1M};1a 11g($aO){K lZ=$(3z).4O(),re=lZ+$(3z).1w(),1M=$aO.2v().1M,4P=1M+$aO.7h(1l);1b 1M>lZ&&1M<re||(4P>lZ&&4P<re||(lZ>=1M&&lZ<=4P||re>=1M&&re<=4P))}1a Vo(1g){K 2v=0;4x(1g){2v+=1g["9x"];1g=1g.eR}1b 2v}K Vj=1a(el,Vi){K 1M=el.ra().1M,4L,el=el.3j;do{4L=el.ra();if(1M<=4L.4P===1k){1b 1k}if(el==Vi){1b 1l}el=el.3j}4x(el!=2K.3H);1b 1M<=2K.9l.lW};1a 11k(wU){if(!wU){1b 1k}K HP=Vo(wU);K Vl=HP+wU.9m;K rW=0;if(2K.9l.4O){rW=2K.9l.4O}1j{rW=2K.3H.4O}K SN=rW+3z.k9;1b Vl>=rW&&HP<=SN};',62,4729,'|||||||||||||||||||||||||||||||||||||||||||||this|var||||||||||||||||||||||||||function|return||null|Web|length|element|data|item|else|false|true|width|attr|value|for|case|key|break||node|options|height|name|obj||object|isEmpty|type|params||res|push|row|table|items|path|opt|top|event|result|parent|dto|trigger|MetaData|new|Dto|menu|index|callback|canvas|selected|||||||||field||input|val||fill|Grid|left|text||Canvas|_|link|Events|FieldParamType|stroke|Core|each|nbsp|addClass|class|attrs|span|offset|args|select|undefined||typeof|find|div|root|out|arguments|style|self|jQuery|call|document|from|Enum|paper|contextMenu|disabled|Items|position|bind|css|anim|context|option|opacity|append|values|||||||||||start|svg||button|font|target|prototype|that|settings|parentNode|focus|eve|doc|expression|rows|bbox|control|none|ExchangeObject|pos|replace|apply|Guid|elproto|match|window|Math|hide|next|Application|container|click|label|body|tree|html|removeClass|selectmenu|remove|Name|cell|switch|Array|split|has|icon|Localizer|dialog|toLowerCase|toString|color|keyCode|||filter|helper||action||||prev|clr|concat||slice|elem|Strings|math|method|transform|toFloat|grid|size|rgb|max|appendTo|appendChild|checked|delete|selector|zIndex|array|gradient|Utils|while|newValue|get|first|Str|extend|metaDataObject|raphael|string|abs|hasClass|preventDefault|src|bindEx|rect|arg|state|scrollTop|bottom|tableDnD|Type|editControl|display|events|Parent|blur|deg|Caption|hitarea||animate||rowDto|diff|||scrollLeft|||toFixed|title|Object|matrix|end|indexOf|resizable|criteria|builder|links|show|url|arrows|columnWidths|round|_engine|error|list|column|_key|children|Left|handle|join|Right||Fields|href|CLASSES|duration|mmax|dtoItem|editor|contextmenu|animationElements|block|constructor|add|fields|box|newIndex|default|_editControl|removed|dots|drag|win|set|Objects|splice|Date|uiDialog||resize|String||||dataSource|||mdo|auto|pathArray||min|separator|hidden|Value1|sendDataToServer|fieldName|qbtable|oldValue|Number|current|rowChanged|rotate|cells|close|not|aria|http|parseInt|visible|clone|IsNew|stop|menuSelector|len|easing|destroy|p1x|try|TempId|KindOfField|condition|catch|tagName|vml|Class|DataReceived|Column|textControl|setTimeout|tabindex|stopPropagation|existingObject|mmin|prop|wrapper|Criteria|pow|version|_parent||c1y|p1y|paperproto|c1x||all||layer||count|hex|clip|newelement|Tree|currentTarget|draggable|outerHeight|mouseup|point|NameStr|format|status|defaultWidth|ConditionOperator|getBBox|att|hover|zoom|CriteriaBuilderConditionOperator|parents|animation|config|substr|menuItems|__set__|subQueries|operation|open|Links|bbox1|handler|bbox2|temp|pageX|sortingOrder|IsDeleted|TableObject|header|subElement|dot|update|typeOf|now|setproto|insertBefore|c2y|c2x|last|absolute|ValueKinds|scale||implement|str|Value2|refresh||getValue|hasOwnProperty|mousedown|newObject|pageY|Index|overlay|names|removeChild|guid|Visible|linkDto|keydown|p2x|tableName|lineCoord|angle|Rows|SQL|p2y|outerWidth|dragi|RequestID|pth|widget|setValue|buildElement|controls|cache|CriteriaBuilder|JoinType|crp|Expression|textarea|create|ValuesCount|firstChild|currentTrigger|Operator|_g|right|init|subquery|toggleClass|QBGrid|SyntaxProviderData|unbind|active|tmp|dirty|droppable|graphics|ret|msg|_editBlock|targ||command|percents|DrawOrder||keys|family||throw||_optionLis|Alias|NavBar|maxHeight|_ulwrapdiv|checkbox|_trigger|nodeName|1E3|skew|colspan|documentElement|offsetHeight|path2|buttons|toUpperCase|sql|selectOptionData|offsetLeft|cellName|parentObject|scroll|columns|offsetTop|destX|DataSources|test|isNaN|defaultHeight|vector|sin|warning|360|Lock|selectDto|clear|expandable|pathString|build|containment|sorting|bez1|bg_iframe|valueElement1|customAttributes|face|colgroup|bez2|All|coordinates|radio|Error|par||||found|timer|nameFull|matches|maxWidth|tabbable|cos|rad|foundIndex|criteriaBuilder|_value|image|forEach|jPag|Table|alias||ctx|||FieldGuid|caller|namespace||||mooType|contextMenuRoot||||existingLink|unionSubQuery|JunctionType|nodeParent|objectBorder|actualF|GridOnRowChanged|matrixproto|objectLayout|navbar|6E3|circle|SessionID|menus|continue|ele|red|valueHTML|QueryProperties|define|cellIndex|touch|dasharray|selects|Function|hasScrollY|axis|amt|statusBar|corner|Server|proxy|wrapperId|headerCell|collapsed|EditableSelectStatic|Text|map||force|elements||trg||el2|checkTrigger|floor|defaults|JunctionItemType|requestID|colour|SmartPush|dragObject|mousemove||newObjects|sqrt|cssClass|scope|toInt|||weight|path1|fieldsContainer|Element|addObject|x0d|ConditionSubQueries|x0b|hasExpressionBuilder|u2008|factory|green|u2009|Aggregate|meshX|Condition|tstr|x0c|blue|ellipse|u2006|x09|x0a|u2007|graph|u2002|arrow|headerCells|||u2004|Raphael|total|ExpressionSubQueries|source|bot|u2003||percent|line|isArray||u200a|xa0|isFunction|||x20|aggregate|Messages|fit||hasChanges|cnvs|edit|||u205f|u202f|u2005|||u2000|hoveract|charAt|u2028|tt1|methods|namespaces|Extends|u2001|meshY|minHeight|valEx|u180e|u3000|u1680|con|setAttribute|navigator|loaded|u2029|xlink|Link|counter|thisObject|Key|content|_cellEditEnd|contains|group||titleBar|IsSelected|Prefix|cacher|getKeyName|number|icons|_selectedOptionLi|className|inFocus||markerCounter||instances|glow|||pathClone|getPath|current_value|editable||dialogId|subkey|selectedIndex||groupingCriterion|scrollY|Path|addEventListener|||range|clientY|Select|jQButton|rec|console|change|filtredItems|collapsable|getRGB|loading|tableDnDConfig|currentTable|Action|www|getTotalLength|shift|previous|toggle|clientX|initialize|addArrow|headerRow|scrollable|strcmp|queryStructure|tbody|000|img|redraw|RegExp|TreeView|pattern|textpath|times|parseFloat|overflow|ActiveUnionSubQuery|itemsPageSize|Inner|shape|order||queue|fillpos|json|eventName|direction||||parentNameFull|Postfix||SyntaxProviderName||linecap|getElementsByTagName||org|defs|token|DatasourceGuid|createNode|createElement|empty|MetadataTree||iframe|titlebar|check|optionDto|pop|Active|itemsElement|mouseout|alpha|dsList1|grouping|hasScroll|offsetParent|move|caption|attrs2|marker|linkBox|nextIndex|Description|fonts|Value1IsValid|||properties|thead|down|Layout|updateContextMenu|tlen|_events|ids|Outer|jquery|ActiveDatabaseSoftware|SVG|alert|QueryBuilderControl|None|valueNumber|activeItem|JSON|collapsible|scrollTo||Data|minWidth|currentPage|tolerance|_drag|listeners|Field|originalEvent|editableSelectOverlay|||over|maxZ|stopImmediatePropagation|isInput|svgContainer|fontSize|setFillAndStroke|off|Animation|valueElement2|tt2|_viewBlock|inver|handles|Actions|UseCustomExpressionBuilder|IsLoaded|isEnd|resized_widths|ddmanager||docElem|_uiHash|plus|Add|hover_css|_getWidth|importData|bgiframe|results|CustomEditButtons|NameFull|CriteriaBuilderItemType|instanceof|a_css|newDatasourceDto|Width|support|versionToNumber|getDate|getNextTabbable|property2|location|property1|marked||getPrevTabbable|UnionSubQuery|scaley|sib|border||SortType|hasSubQuery|property3|time||Requests|arr|255|linkedObject|scrollHeight|Matrix|instance|Filter|to2|visibleMenu|rows1|mergeObj|pathi|scrollX|200|Cancel|xmlns|dialogs|insertAfter|myAt|selectElement|methodname|ContextMenu|onTreeStructureClick|_moveFocus|easyeasy|trueIndex|wait|tableBox|round1000|getTimezoneOffset|filtered|QueryParams|BeforeCustomEditCell|Message|userAgent|subItem|obj1|isResizable|oRec|pRec|with|classes|TreeDoubleClickNode|obj2|simulateMouseEvent|actual|menuCallback|substring|glyphs|additionalItems|Numeric|Unknown||isURL|toJSON|debounce|Boolean|updateTable|||getElementById|Delete|guidHash|scalex|||sticky|Height|innerSize|showFields|intr|translate|dirtyT|bb1|userEdit|delay|getRec|bb2|_isNullorUndefined|buildItems|curve|LinkExpression|precision|sort|objectGuid|curr|042|milli|itemDto|tooltip|getHours|expanded|filteredUi|MetadataTreeView|||QBWebCoreBindable|query|justCount|Value2IsValid|cssText|visibility|2000|longclick|Not|oldObj||updateElement|||NavBarComponent||realPath|offsetWidth|equal|014||attrType|col|computedStyle|tspan|||accesskeys|animated|setViewBox||thisLi|onSelect|_viewBox|clearTimeout|overloadSetter|isDropDown|mouseover|keyStop|the|paths|FIXED_GRID|GridRow|afterCustomEdit|Loaded|origin|use|keypress||QueryStructureContainer|nextItem|_getTotalWidthStatic|path2curve|indexed|existing|DataSource|CriteriaBuilderJunctionItemType|_setWidth|widths|orColumnCount|current_event|recursive|redrawT|module|highlight|markerId|cur|attributes|prevItem|CssClass|from2|ValueKind|removeRow|Grouping|markedMeshCells|thefont|skipEvents|pathId||collision|_getInnerTable|getDto|mousePos|072|originalSize|iLen|294||sub|updateContextMenuItems|eldata|currentRow|VisiblePaginationLinksCount|pane|DataSourceDto|nextSibling|touches|editEnd|vbs|list_is_visible|selecter|DataSourceType|CurrentEditCell|Database|shear|dialogTarget|treeStructure|listWrap|optionClasses|TreeStructure|role|_typeAhead_chars|goto|dstyle|dropdown|ObjectType|closest|QueryTransformerSQL|objectType|instantEdit|filteredItemsElement|AffectedColumns|bezlen|base|isInAnim|opts|isActive|margin|_global_timer_|onload|innerHeight|enumerables|attachEvent|Supported|linejoin|totalOrigin|newClass|lastCollapsable|lastExpandable|branches|jsp||VML|fillsize|fillString|ceil|selectable|__args|getFormat|_ul|buffer|strings|viewBox|replaceClass|||fun|filterChangeRoutine|asterisk|View|updateTableHeader|fontcopy|isPointInside|tryAddEmptyRow|itemsListIncomplete|Schema|objectsToRemove|QueryStructure|globalFieldDragHelper|updateObject|tspans|objects|CTE|Clear|TreeComponent|TString|fullIOH|seg2|_path2string|updateTabindex|toggler|coordorigin|isOpen|Selects|||472|9999em|dto1|currentValue|showEditor|stops|strConversion|__getType|clientLeft|minContentHeight|keyToUpdate|valueElement|GridRowCell|dto2|inputLabel||sweep_flag|move_scope||getButtonContextMenuItems|resizeT|newsize|getSelectedListItem|prepend|appendElement|list_item||newf|_availableAttrs|built|headerWidth|deleting|popup|dragMaxX|rvml|percentScrolled|callbacks|hiddenBlock|related|destY|Move|log|replaceChars|globalTempLink|removeAttr|application|objectsToUpdate|seg|getMonth|noAnimation|titleBarText|dj1|hook|toLower|repeat|clientHeight|contentWidth|di1|lBound|hooks|||||SortOrder|defaultView|_editControlPlaceholder|dataSources|glob|pendingObject|invalid|expandedNodes|information||endString|__pad|clientTop|runAnimation|metadata|NameInQuery|startString|ds1|ds2|mouseProto|Value|touchHandled|types||doNotGenerateEvent|removeByIndex|proto|initstatus|||DOMload|updateRowControl|d_hoveringOverElements|cursor|textpathStyle|resizeLock|fff|Rapha|wrongRow|fltr|_setTableWidth|appendBefore|u00ebl|background|subQuery|background_hover_color|text_hover_color|checkField|reposition|rowId|tableObj|text_color|Properties|butt|background_color|which|flip|srcAlias|||onAddTableToCanvas|suppressConfigurationWarning|tableBody|updateCount|500|outerWidthDiff|restore|activeClass|isHelper|MetadataGuid||_getHeaderRow|activeID|vals|innerTable|random|bodyCell|skipEvent|isValid|innerTableTbody|globalIndex||_moveSelection|_getBodyFirstRowCells|RootQuery||||1px|joinType|||Procedure|addOrUpdateRow|NameNotQuoted|JunctionPostfix|366|safari|configs|treeview|parentElement|setSize|draw|667|letters|getListValue|clientWidth|newObj|valueA|reconnect|valueB|Set|findTableByName|mouseenter|shiftKey|bod|_setOption|paramCounts|arglen|glyph|||testRow|onChange|postprocessor|escapeHTML|mdoFromTable|clrToString|py2|srcExpression|showGrouping|groupColumns|_position|mdoToTable||_size||trim|toHex|fieldValue|wrap|px2||currentSorting||stretch||x2m|forValues|notfirst|innerHTML||dim|binded|y1m|longClickContextMenu|_removeGraph|y2m|deleted|AggregateList|srcAggregate|MetadataType|IsEqualTo|timestamp|rowItems|hsb2rgb||UpdateGuids|conditionOr1|Sorting|x1m|rectPath|primary|_create|staticControlKeys|dragHandle|rem|Copy|filterMode|getColor|_obj|AllowJoinTypeChanging|||||distance|MessageText|Pos|054|_focusedOptionLi||bboxwt|relatedTarget|mapPath|original|selectedpage|numPerPage|classic||||menuWidth|||selobj||evenodd|blurTimer||dis|LinkedObjects|rule|_typeAhead_timer|||_typeAhead_cycling|buttonLink|updateFields|matchee|POST|view|fieldsTable|_vbSize|keyup|036|_removedFactory|QBHandlers|09|SQLErrorMessage|tdata|DisableSessionKeeper|configEnds|Yet|CanvasLinkOnChanged|GetPropertyDialog|desc|deltaY|018|_disabled|epsilon|deltaX|400|scrollTimeout|getPointAtLength|_refreshValue|optionsMarkColumnOptions|_pathToAbsolute|isAlternate|showList|nodes|day|month|supportsTouch||getString|bindItemsEvents|getPaddingLength|triangle|getPaddingString|setInterval|onDragStart|start_scope|boolean|itemsPagePreload|494|elementFromPoint|paneWidth|list_height|228|hours|items_then_scroll|seconds|minutes|_getBBox|centercol|||brect|setCoords|miterlimit|Direction|childItems|abortevent|solid|parentOptGroup|bgImage|clipRect|typeahead|_divwrapright|step|_hasContext|scrollAmount|linear|schema|The|yOffset|__def_precision|onDragClass|touchMap|053|00585866|addGradientFill|mouseleave|prevComputedStyle|and|||totalWidth|handlers|parentSelector|findDotAtSegment|relative|ClearItemsText|RootJunctionPrefix|getBoundingClientRect|important|||uBound|ShowPrefixes||initialized|_isOpen|refX|tables|optionsNameColumnOptions|findDotsAtSegment|layout|_getColgroupCells||RightToLeft|_hasScrollY|pcom|shortFieldName|_getHeaderCells||PreviousItem|||derived|validateValue|datepicker|_13|itemsHtml|itemHtml|fieldsHtml|touchmove|touchend|lowerCase|scrollWidth|True|touchstart|Models|ActiveQueryBuilder|Child|cancel|setDto|ActiveQueryBuilder2|readyState|CriteriaBuilderItem|Any|_23|visibleTop|Options|funcs|PrimaryKey|invert|||DescriptionColumnOptions|removeEventListener|pendingChanges|dirX|getFullYear|finite|seg2len|Loading|createTextRange|serverSideFilter|SQLError||TableObjectOnLinkCreate|updateGridRows|createUUID|tear|setAttributeNS|_blur|Synonym|ClientSQL|editorVal|||itemsCount||swapClass||updatePosition|dirY||||CreateLink||removeData|l2c|TableObjectOnCheckField|subpaths|ToDelete|newWidths|TableObjectOnSubqueryClick|matchDatasourceDto|TableObjectOnLinkedObjectSelected|ExchangeTreeDto|fullUpdate|updateExpressionControl|seglen|||navBar|minWidths|getSubpath|_createTitleButton|FFF|currentTotal|existingDS|every|maxWidths|columnCount|||||editableSelectControl|updateFilter|filterBlock|itemsArray|scrollToX|filterChangeRoutineT||fieldType|optionsTypeColumnOptions||ConditionColumns|ExpressionColumn|001||dots2|getSubpathsAtLength|fieldCheckbox|prependTo|getLengthFactory|optionsDescriptionColumnOptions||getPointAtSegmentLength|||subpath||HideColumnDescription|breadcrumbClick|FieldTypeName|TypeColumnOptions|TreeSelectNode|parentTable|hits|HideColumnMark|ContextItems|pathDimensions|trimCaption|one|HideColumnName|HideColumnType|fillSelects|ItemsStart|frame|norm|loadingItemsOverlay|NameStrNotQuoted|filterRegExp|parseTransformString|contentW|autoOpen|FieldName|elementParent|itemIndex|cursorWait|iframeBlocks|ShowLoadingItems|ariaName|revert|asin|margins|1E5|1e12|ItemsCount|ry2|ymin|xmin|rx2|lastI|localIndex|UseLongDescription|needFilter|sortBy|titleBarOH|iconClass|onFieldCheck|toColour||parentGuid|availableAnimAttrs||DenyLinkManipulations||del||TableObjectOnDestroy|contentHeight|end_scope|identifier|upto255|f_out|positionDragY|noop|contentPositionX|dragUp|scrollToY|Nulls|interHelper|filterClear|dragMove|filterChange|filterChangeStub|positionDragX|_setDto|buttonSubquery|small|paginate|dblclick|disableSelection|parentItem|filtredItemsCount|_getDto|targetTouches|stack|250|f_in|TableObjectOnTrash|mouse|interPathHelper|cssZIndex|TableObjectOnClose|Disabled|ContextMenuReceived|recIndex|SQLEErrorReceived|removeEmptyArray|MessagesReceived|editorChangesEnabled|_path2curve|DataSending|SQLReceived|currIndex||QueryStructureChanged|CanvasOnTrashTable|CanvasOnAddTableField|_selectedIndex|CanvasOnAddTable|CanvasOnRemoveTable|GridOnAddTableField|Url|GridOnAddTable|CanvasContextMenuCommand|flag|retainFocus|getPosition|dragObj|rowY|588l|rowHeight|942|mouseOffset|266|076c|oldY|droppedRow|d_topElement|d_i|diamond|resetTable|oval|altKey|selectmenuId|thisAAttr|optGroupName|_safemouseup|updateHeaderCellWidth|hiddenSQL|512|character|Parameter|Namespaces|Package|sendDataToServerWithLock|_setColCellWidth|0px||_setTableHeaderWidth|resizable_params|_initWidths|lastId|stickyHead|messages|dif|setSelectionRange|back||eval|headerHeightStr|Root|_left|delayedSend|NavBarAction|TreeStructureSelectNode|NavBarBreadCrumbSelectNode|_top|success|complete|refreshSql|refreshButtonClick|curChar|DisablePageReload|DisableLinkedObjectsButton|persistent|child|ChangeActiveUnionSubquery|positionDefault|buildNewTree|message|300|statusbar|_outer|rightcol|idx|Dim|thumbs_mouse_interval|_fired_|exports|inArray|leftcol|toff|ver|getBoxToParent|timeout|getPrecision|9941413|getKey|ownerDocument|ie7|both|needInvoke|insidewidth|amd|isType|selectOptions|GlobalTempId|OnApplicationReadyHandlers|getDay|parameters|elt|usePlural|getComputedStyle|noPropagation|bit|_mouseInit|46875|||||propertyIsEnumerable|dontEnums|called|typeMismatch|regex|instanceOf|klass|protected|selectListItem|getMatchItems|wrappers|oldt|bbx|374|nextcommand|itemMouseenter|inputs|itemMouseleave|pickListItem|clearInterval|overlays|333|clrs||radial|currentContext|listIsVisible|240z|hideList||checkScroll|specified|tabDerrived|oldRaphael|205|lastExpandableHitarea|renderfix|TypeError|reduce|parse|o2t|o1t|lastCollapsableHitarea|globalMenu|hovering|commands|Event|_name|zin|coordsize|initWin|08|itemdata|Columns|CriteriaBuilderItemGroup|collector|contextMenuCallback|ShowPropertyDialog|||||xi1|nes|getJoinPrefix|line_spacing|getButtonContextMenuItemsMove|NotAll|conditions|general|menuItem|syncTable|rowIsEmpty|plusButton|CriteriaBuilderItemPlus|rowToDelete|GetUID|fix|resizestop|GridRowCellOnChanged|GroupingCriterion|similar|yi1|isEqual|after||generateEvent|hoverClass|reset|tail|transformPath|enter|QuickFilterInExpressionMatchFromBeginning|than|cellpadding|onDrop|disable|selectedTrue|objectOptions|cellspacing|GetValueText|NullOrderingInOrderBy|blockFocus|fillDtoItems|fillDto|thisArg|does|sleep|_importDto|Group|letter_spacing|ConditionIsValid|ActiveUnionSubqueryGuid|staticEditControls|strong|TypedObject|hsl2rgb|returnStr|mdoFrom|oldGuid|expandNode||_cellEditStart|markAllForDelete|DoAction|findRowsByExpression|Ascending|MetadataObjectGuid|gridRows|updateGuidHash|gridItemDto|delta|UseCustomExpressionBuilderServerEvents|inHiddenBlock|newDSdto|removeObject|commaSpaces|detach|dots1|removeAllMarked|UpdateLink|getByGuid|isInAnimSet|denominator|newShowGrouping|testDS|normal|before|newWidth|colCell|structureItem|SqlErrorEventArgs|lineHeight|addBack|ActiveXObject|thisStyle|jQueryUI|docum|mdoTo|result1|fontName|cellNameKey|QualifiedName|MetadataFieldDto|result4|clientData|result3|CriteriaItem|lastScrollY|result2|com|data1|0000|was|ease|LinkPart|_Paper|UpdateConnection|cssDot|_getContainer|Title|objectClick|todel|endType|isExpandable|nodeExpandedClass|browser|detachEvent|startType|startD|shortLeg|TypeStr|thin|endD|sendDataToServerCutsom|defaultExpandLevel|ExchangeTreeViewDto|thatMethod|_params|relativeRec|collapseNode|load|OnApplicationReadyFlag|requestAnimFrame|optionsFixedColumnMode|calculateBox|SizeStr|FixedColumnMode|linkNode|stopAnimation|expand|_last|param|_init|toggleNode|NameColumnOptions|MarkColumnOptions|IsMetadataObject|GetTreeNode|paused|toLocaleString|fieldIcon|IsExpandable|nodeIndex|isWin|limit|FullQualifiedName|Level|csv||freeY2|freeY1|createTextNode|_fx|getNextEmptyPlaceRoutine_Test|extractTransform|dir|xb0|pathes|freeX2|updatePendingObjects|_fy|progid|propertyName|isLoaded|compensation|SelectAllRowsFrom|clmz|LastItemId|sampleCurveX|rgba|ajax|Microsoft|optionsHtml|flush|selectsDto|texts|SelectOptionDto|currentSelect|UserQuery|leading|dashes|addDashes|database|blank|forGroup|GetFullFieldName|getAttribute|newAnim|isFloating|SQLUpdatedServerFlag|LoadDataByFilter|loadedNew|UserDataReceived|SQLChanged|objectsToAdd|canvasDatasourceDto||ForeignKey|applyFilter|1024|middle|throttle|_extractTransform|u2026|bbt|isSimple|isGrad|raphaelid|fxfy|fieldElement|_parseDots|_oid|spanField|laspPagerScrollLeft|_insertbefore|_insertafter|_toback|UpdateObjects|_rectPath|Remove|_tofront|exclude|units|per|VisiblePaginationLinksCountAttr||showDescriptions|_tear|square||||||strokeColor|_preload|images|shifty|newstroke|_ISURL|Metadata|allEvents|triggerEvents|newpath|_getPath|are|DisableQueryPropertiesDialog|descriptionHtml|_radial_gradient|propSize|parentOffset|targetId|align|dirtyattrs|Query|DisableDatasourcePropertiesDialog|DisableLinkPropertiesDialog|Edit|anchor|JavaScript|QBWebCoreGridResizeLock|errHandlersConfiguration|_tmp|fastCheck|accesskey|newDiff|lastIndexOf|_syncColWidths|293|colIndex|_getHeaderCellsIndexTrue|Actions1|wildcard|subname|oldstop|416|288|setColumn|fieldContextMenuCallback|clearButton|CriteriaBuilderDto|buildControlItems|getJunctionItemType|junctionType|submenu|onCheckFieldInTable|onLinkCreate|onLinkedObjectSelected|existingTable|_parseSize|endUpdate|prepareSyncMetadata|finalTotal|dtoIsEqual|border_color|updateSQL|slidedown|newTotal|_scale|sendDataToServerDelayed|800|M12|_setBodyBounds|MetadataObjectAdded|findTableByDataSourceGuid|GridRowDto|test_interval|testWidth|hasScroll_x|beginUpdate|hadScroll_x|actionAddItem|CriteriaType|conditionOr|contextMenuKey|prepareRGB|movingDown|Output|90625|||rgbtoString|newwin|draggedRow|59c|packageRGB|GridBeforeCustomEditCell|_touchMoved|getMouseOffset|docPos|tableValue|AfterCustomEditCell|makeDraggable|C10|mouseCoords|z_index|amp|customEdit|freeX1|UpdateWrapper|getOperatorObject|CriteriaBuilderItemGeneral|General|serialize|touchcancel|99c|CriteriaBuilderItemGeneralDto|cross|90332031|serializeTable|serializeRegexp|CriteriaBuilderItemGroupDto|page|Paper|annul|ellipsePath|nodrop|schedule|252|CriteriaBuilderItemDto|CriteriaBuilderItemRow|operator|_click_|IsInList|IsNotInList|prevIndex|dtoIsSimilar|onCanvasContextMenuCommand|onGridRowChanged|723|newOptionClasses|selectedOptions|clearSqlError|GridOnAddRow|_toggleEnabled|elems|importGrid|GridOnRemoveRow|optgroup|onAddTableFieldToCanvas|nogo|ascending|DroppableClear|SQLTextChanged|_escapeable|handlersPath|onTreeDoubleClick|QBFREE|_refreshPosition|DroppableDetermineTopElement|buildTree|addOption|readonly|_typeAhead|jQueryUIMinVersion|expandableHitarea|eventType|jQueryMinVersion|toggleCallback|maxH|applyClasses|tmp_highest|closed|tmp_winner|prepareBranches|winH|union|_toggle|cookieId|importCanvas|_scrollPage|MessageInfo|stored|GridComponent|cookie|errNoJQ|collapsableHitarea|iFrameOverlay|newelementWrap|QBTRIAL|95800781|outsidewidth_tmp|invokeAsap|repositionStickyHead|siblings|applystyle|thisLiAttr|DateTime|initW|headerHeight|msgType|toExponential|isVisible|border_hover_color|dtoToAdd|dsList2|existingDSdto|matchNewDto|_isPositiveInt|rows2|_rotleft|currval|outsidewidth|_parseWidth|_isPositiveNonZeroInt|_rotright|allRows|generateContextMenuItems|presentation|ChangedCellIndex|ChangedCellValue|parentW|GridOnRowChanging|totalspan|prepareSyncSQL|refreshSqlWithLock|RefreshSQLClick|pairs|quoteString|code|_setTableBodyWidth|checkPending|__repr|triggerAction|outerTbody|contextMenuActive|jqXHR|textStatus|firstColsW|__arg|_fixFirstCols|ajaxFinish|ShortDescription|TableObjectField|_grid|KeyFieldsFirst|FieldListSortType|LongDescription|mHide|newFieldsCount|processPath|newField|fixM|fixArc|component|getEmpty|menuChildren|fromCharCode|buildBreadcrumbElements|pathToRelative|toMatrix|FieldListOptions|HideAsteriskItem|titleW|isBBoxIntersect|contentH||needResize|createButton|GetTempId|_120|newres|borderTopWidth|extended|catmullRom2bezier|simpleOffset|upperCase|debug|li_value|crz|moveToTop|a2c|mergeOne|q2c|checkAllField|checkedFields|cloneOf|curveDim|borderLeftWidth|li_text|pathToAbsolute|heightBeforeDrag|buildElements|structure|scope_in|onstart|GUID|nodeCount|list_item_height|UpdateValues|opera|setRequestHeader|GetWrapper|topOffset|scrollByY|inited|contentPositionY|034|scrollBy|scrollByX|onmove|domElement|EditableSelect|paneHeight|onend|elTop|clearSelectedListItem|busy|protect|selectNewListItem|intersect|obj1FieldName|obj2FieldName|600|modal|mag|normalize|srcUrl|8E3|QueryGuid|getEventPosition|Close|parts|fastDrag|AriaLabel|editStart|hooksOf|generic|lower|buttonClose|buttonProperties|merge|prototyping|atan2|isFirst|horizontalDragPosition|prevcommand|conditionSubQueriesLength|dtoConditionSubQueriesLength|t12|onCellChanged|expressionSubQueriesLength|dtoExpressionSubQueriesLength|Checked|regexp|posTop|needUpdate|_switchToView|global|doScroll|pass|periodical|_createEditBlock|bound|1767578|ConditionType|tableHeaderFixed|GridRowOnChanged|emptyRow|hasEmpty|GotoSubquery|insert|_reCreateEditBlock|simulatedEvent|newRows|setup|lastReturn|findRowsByDto|CustomEditControl||accept|drop|t13|pathValues|dispatchEvent|Widget|istotal|cRec|Mutators|stickyTable|keepColumnsTableWidth|_unblockFrames|isCurrentQuery|_blockFrames|maxContentHeight|keepMenu|contextMenuAutoHide|TableObjectOnMoved|TableObjectOnUpdated|you|x_y_w_h|AllFieldsSelected|_makeDraggable|adjustWrapper|rel|parsePathString|selectFirstListItem|acces|highlightSelected|xmax|ymax|_makeResizable|blurTimeAbandoned|isPointInsideBBox|7734375|ybase|xbase|bezierBBox|sum|rgbToHex|offsety|generateNavBarContextMenuItems|hexToRgb|MAX_CAPTION_LENGTH|viewBlock|base3|editableSelectInstances|getControl|customEditButton|offsetx|Descending|editableSelect|nav|_createEditControl|updateCustomEditButton|userControl|getMatchItemNext|cleanData|textContent|_cleanData|isEmptyObject|342|toBack|blurInput|tile|focusItem|hasTypes|_viewBoxShift|aks|focusInput|blurItem|itemClick|layerClick|nested|hideMenu|splitAccesskey|eventSelectstart|inputClick|menuMouseenter|menuMouseleave|behavior|contextMenuShow|adjustHeight|positionSubmenu|Blur|determinePosition|clearHighlightMatches|blurregexp|maintain|microsoft|zindex|urn|htmlCommand|autoHide|menuitem|fromMenu|schemas|htmlMenuitem|cannot|attempt|Incompatible|01|retain|owner|include|methodName|some|clean|flatten|collection|_touchMove|fromType|_touchStart|rightBox|_touchEnd|toType|simulatedType|thinBg|getInstance|QBWebCanvasLink|000000|changedTouches|GlobalUID|Line|responseText|dynamicSort|post_error|Errors|error_alert|XMLHttpRequest|XMLHTTP|colourRegExp|Content|cls|getHTTPObject|isFinite|methodsEnumerable|tagValue|UID|Clone|DeepCopy|static|nodeType|fixed|isEnumerable|prevOffsetParent|typeCheck|stringify|arguments2Array|Argument|parentId|charCodeAt|year|callee|minLeg|showArrow|isObject|__formatToken|__getInput|inline|heightHide|heightToggle|treeController|deserialize|padding|sel|removeOption|_meta|prerendered|c1Elements|selectedValues|hideArrow|_mouseout_||_mouseup_||_mousemove_|||_touchend_||_touchstart_|_contextmenu_|getLineCoord|leftBox|_fn_click|_mousedown_|scheduled|touch_enabled|snext|snextclass|previousclass|carat|_divwrapleft|nextclass|bVer|_touchcancel_|_touchmove_|parentBox|sprevious|spreviousclass|hsrg|repush|p2s|hsba|glowConfig|shape2|hsltoString|rgb2hsb|setWindow|uuidReplacer|rgb2hsl|getFont|hsbtoString|u00b0|3678||resume|1252|7699|5873|pause|tCommand|hsb|animateWith|hsla|pathCommand|16777216|hsl|uuidRegEx|cellOuterDiff|_getResizeableParams|endPath|numsort||||includeMargin|andSelf|||endMarker||_off|_on|startdx|startPath|startMarker|markers|replacer|whitespace|Arial|Infinity|objectToString|isnan|adj|DocumentTouch|quotedName|isFunc|tokenRegex|formatrg|objNotationRegex|quote|9041|addEvent|detacher|_f|backOut|Now|scope_out|stopTouch|vendor|solveCurveX|shorter|preventTouch|olde|Inc|backIn|70158|isPointInsidePath|getById|onlystart|getTatLen|isWithoutTransform|075|about|unmouseup|unmousemove|getOffset|getElementByPoint|pageYOffset|acos|comb|Cvalues|Tvalues|CubicBezierAtTime|pipe|pathBBox|0472|2335|2491|9816|1069|1601|2032|bezierrg|availableAttrs|toPath|equaliseTransform|solve|sortByNumber|maxlength|real|x2old|large_arc_flag|easing_formulas|tan|f2old|y2old|DOWN||fontWeight|fontStyle|RIGHT|LEFT|fontFamily|serializeTables|onAllowDrop|findDropTargetRow|onDragStyle|updateTables|tableId|onDropStyle|HOME|hasIcon|newfill|optionValue|ovalTypes|path2vml|isOval|thisA|END|PAGE_DOWN|PAGE_UP|TAB|SPACE|ENTER|windowHeight|initInputEvents|autoShow|duplicateOptions|adjustWrapperPosition|current_options_value|onTextboxChanged|EditableSelectWrapper|unselectListItem|getMatchItemPrev|toFront|def|initEvents|scrollToListItem|adjustWrapperSize|screenX|initMouseEvent|createEvent|compatMode|fireEvent|screenY|setWidths|isPatt|noRotation|toFilter|positionElements|vbt|hideOtherLists|pathTypes|_getBodyCellWidths|getHeaderCellByBodyCellIndexFiltered||_getBodyAndHeaderCellWidths|getPropertyValue|_getHeight|sbwidth|_removeAllWidth|_getBodyFirstRow||getHeaderCellByBodyCellIndex|setMaxWidth|alwaysNoScrollY|alwaysScrollY|_getColgroup|tuneText|nodeValue|_parseResizable|_parseColumns|_hasScroll|enddx|Marker|_parseScrollable|_geInnerTableTbody|_createColGroup|vis|stickyWrap|newTable||cssrule|trueWidth|refreshTimeout|listH|running|_closeOthers|typeAhead|thisText|handleWidth|narrow|long|short|medium|selectmenuIcon|wide|selectelement|aspectRatio|createSVGMatrix|activedescendant|DEFAULT_HEADER_BORDERS|positionOptions|preserveAspectRatio|currentOptionClasses|_formatText|bites|isMove|DXImageTransform|enable|escapeHtml|SUBQUERY_ENABLED|importMetadataNew|stickToTop|QBWebCore|importMetadata|602|903|destPercentX|IsTrashed|7168|4096|8192|ObjectMetadata|2048|scrollToElement|onNavBarAction|480|256|sendDataToServerInternal|stepCallback|clearSyncDebounce|delayed|trial|QBWebCoreCriteriaBuilder|QBWebCoreGrid|QBWebCoreMetadataTreeView|QBWebCoreMetadataTree|data2|triggerObject|destPercentY||NeedRebindUserInit|clearSync|contentType||dataType|sendDataToServerDelayedWrapper|errorThrown|importNavBar|getInactiveItems|parentObj|importCriteriaBuilder|getActiveItem|444|createChildMenu|childButton|onEditorChangeDebounced|onObjectDestroy|link16|onObjectClose|objGuid|updateNavBarContextMenu|importMessages|importQueryStructure|importSQLEError|Container|onRemoveObjectFromCanvas|EditorRestoreLastGood|ConditionTypeHaving|ConditionTypeWhere|EditorClear|onEditorChange|targetKey|EditorGoToErrorPosition|refreshButtonHover|onGridRowAdded|Int32|onEditorChangeDebouncedCall|onGridRowRemoved|childButtons|onTrashObjectFromCanvas|subqueryPlusButton|typeName|onCanvasLinkChanged|updateUnionControls|setLayout|odd|updateBreadcrumb|642|classObject|importCanvasObjects|importCanvasLinks|002|442|376||tabbableLast|TableCTE|updateTableContextMenu|createLinkObjectsMenu|147c|CanvasLink|updateLinkContextMenu|206|DataSourcePropertiesForm|mergeGridRowObj|updateDataSource|ObjectReadOnly|1999|findCanvasDataSource|adjustSize|findCanvasDataSourceSimilar|02|collapseTable|203|622|314|lastHeight|mergeDataSourcesObj|checkPendingCanvas|SubQuery|lastGoodSQL|updateExpression|SubQueries|453|398|checkPendingGrid|028|Time|importDto|spinning|sync|QBWebCoreCanvas|QBWebCoreNavBar|tabIndex|31c|dragMaxY|getAllRows|AfterCustomEdit|634l|056|925s|RefreshSQL|055|qbtableClass|tabbableFirst|397|uiQBTableClasses|secondary|moveStart|686|043|335|ErrorPos|clickSQLEError|moveEnd|collapse|DroppableOver|highlightText|isExpandableClass|DroppableOut|ItemsPerPage|itemId|createGraph|DroppableGetTopElement|PreloadedPagesCount|slideUp|IsFiltered|showDescriptons|slideDown|needExpand|expandableBlock|isMetadataObjectClass|sqlError|sqlChanged|024|588|getObjectFieldByGuid|getObjectByGuid|CopyInner|384l1|234|DataSourceLinkPartDto|396|LinkPropertiesForm|GetLinkExpression|DataSourceLinkDto|500px|132l|getObjectHeader|getObjectFieldByName|errWrongScriptOrder|CreateConnection|SelectedValue|TreeSelectDto|IsChanged|laspPagerCount|selectsParent|recreateSelect|localCount|GridOnRowRemoved|settingsWorkTool|7E3|692|556|parentIndexId|buildPager|selectChange|HideLoadingItems|selectDataRefresh|ShowLoadingSelect|needLoadItems|loadChildItems|TryLoadItems|GridOnRowAdding|loadFilteredItemsCallback|loadChildItemsCallback|DefaultExpandLevel|LoadDataByPager|loadFilteredItems|buildSelects|ShowAllItemInGroupingSelectLists|globalCount|globalStart|showAllItemInGroupingSelectLists|lastJ|press|GridOnRowAdded|lined|objY2|objY1|visibleBottom|TableObjectFieldOnCheckField|objX2|UnionNavBarVisible|fired|objX1|panel|pencilSmall|pencil|fieldTypeSize|toggleNavbar|updateAggregateColumn|fieldDescription|TABLE|description|fieldSelect|FieldCount|importContextMenu|importSQL|arrowScroll|jspActive|fieldGuid|onObjectTrash|DataSourceLayoutDto|getLayout|IsSupportCTE|getNextEmptyPlaceRoutine_Find_RTL|_positionDragX|getNextEmptyPlaceRoutine_Fill|getNextEmptyPlaceRoutine_Find|Updating|destLeft|IsSupportUnions|getEmptyPlaceCoord|354|588l1|252l|702|CanvasOnDropObject|propSizeY|propSizeX|132l1|redrawD|findByTableGuid|438|312|648|removeByTableGuid|rightGuid|leftGuid|errWrongJQUI|276||IntoControls|errNoScript|delete16|jQueryMaxVersion|propertyValue|checkProjectConfigure|nooverflow|check_usr|QueryPropertiesForm|layerY|errNoJQUI|384l|jQueryUIMaxVersion||layerX|menuCTE|errWrongJQ|itemsCTE|IsCTE|isPrototypeOf|valueOf|actionDelete|actionMoveDown|actionMoveUp|proxyEx|__entityMap|375|actionAddGroup|actionAddGeneral|selectedFalse|CriteriaBuilderItemRowDto|dontEnumsLength|hasDontEnumBug|actionClear|You|78710938|_getCssClass|9999|getTime|85253906|between|_createViewBlock|84570313|able|TotalCount|will|isNumeric|_switchToEdit|setCursorPosition|aliases|createFromDto|ActionDto|False|dialogClass|operatorText|TableObjectOnLinkDelete|Editor|HasChild|TableObjectOnCreate|Plus|offsetPosition|getOperationContextMenuItems|Where|Invalid|operatorObj|beforeclose|69238281|_utilizeEditBlock|propHooks|EditCondition|_initializeEditBlock|createCombinedButton|onAfter||Tween|isPlainObject|First|Last|showCustomEdit|finally|customExpressionEdit|EditExpression|97363281|suppressEnter|setMonth|_generatePosition|positionAbs|reCreateEditBlock|rowSorter|toggleGroupColumn|generateHeaders|_convertPositionTo|_mouseUp|fieldText|DoesNotEndWith|findRowByDto|equalSimilar|RowChanged|updateSortingOrderColumn|onRowChanged|BeforeCustomEdit|Contains|topParent|visibleY|getter|posBottom|findRowByExpression|StartsWith|getPositionTop|DoesNotStartWith|getRowHeaderList|allow|DoesNotContain|CriteriaOr|EndsWith|May|elBot|isAsterisk|IsLessThan|less|IsLessThanOrEqualTo|039BE5|fillDefaultValues|_exportDto|createRowControl|IsBetween|greater|3115234|IsNotBetween|getMinutes|IsGreaterThan|IsGreaterThanOrEqualTo|getSeconds|longDays|shortDays|InsertSubQuery|IsNotNull|IsNotEqualTo|getLastRowControl|oldIndex|IsNull|longMonths|noConflict|shortMonths|selection|updateOnLoad|tableDragConfig|btn|OnApplicationReadyTrigger|nowrap|Click|NotPrimaryKey|generateLoadingFields|1029399|reCreate|89805351|Union|Synonyms|Procedures|1019465|ClientData|updateLink|generateFields|Views|Tables|required|dragStart|usr_vXXX|brackets|higher|helperProportions|dragging|dragStop|16px|Relations|UnionNavBar|oldFieldsCount|trash|saveScroll|your|Please|ActiveMenu|getTableFieldExpression|width2|hasAggregateOrCriteria|Insert|effect|titleText|Common|highlightDataSource|Unions|Subqueries|For|Created|newRow|height2|slideup|prepareSyncQueryProperties|Refresh|trashDataSource|generateTitle|changed|addDataSource|89706013|removeDataSource|need|addLink|titleH|New|componentW|titleButtonW|heightMax|componentH|Reconnect|plusItem|Sort|operationContextMenuCallback|CriteriaBuilderItemAdded|resizeHandles|From|getJunctionTypeContextMenuItems|library|resizing|createFieldSelect|CriteriaBuilderChanged|resizeStart|resizeStop|getFieldsContextMenuItems|preventEvent|createButtonMenu|Default|detected|Incorrect|junctionTypeContextMenuCallback|createOperationMenu|selfCriteriaBuilder|originalPosition|createJunctionTypeMenu|xxxxxxxx|xxxx|_destroy|setDate|outer|_id|errors|Android|Warning|Info|bezier|cubic|contain|inst|onClose|snapTo|2100|NaN|ISURL|htmlfile|write|556v10|ApplicationEvents|1C1|propertychange|MessageError|check_lib|nts|succeed|createPopup|888C1|starts|yxxx|xxxxxxxxxxxx|Eve|4xxx|criteriaBuilderFieldSelect|ontouchstart|ends|MessageWarning|following|once|_isInt|ClientOnly|getQueryParams|incorrect|any|HandlersPath|configuration|setQueryParamValues|NextItem|web|file|achlmrqstvz|1000|notall|cte|exist|HTTP|radial_gradient|Wrong|script|resetLayout|TRUE|changeMonth|changeYear|must|syncCriteriaBuilder|rstm|switchToRootQuery|5E3|_getOriginalHeaderRow|updateCriteriaBuilder|widgetName|raphaeljs|OVERSCROLL_FIX|Get|hasFeature|SVG11|feature|1900|_getHeaderCellsIndex|10px|sessionID|BasicStructure|free|msgTime|implementation|_blank|spacing|sortByKey|ping|achlmqrstvxz|yearRange|_availableAnimAttrs|SVGAngle|scrollbarWidth|letter|_super|defaultElement|_getOuterTbody|tbody_height|pages|maincol|65136719|front|17089844|wrapper2|41015365|07112864|75357624|wrapper1|15722649|18457031|34472656|78662109|57470597|73209515|52246183|jPaginate|30045377|07128906|07584638|1669913|99853622|9296875|60172265|16650127|8850957|_duration_|13052964|1235352|dispatch|93131062|21924091|69287109|6453477|_timer_|8cc59d|MSIE|black|60400391|slide|appVersion|44922135|13687917|meta|appName|bName|decodeURIComponent|UTF8decode|escape|render|tpl|encodeURIComponent|49511568||62727616|calc||unescape|UTF8encode||isString||85026044|55696305|getFlags|getUTCMonth|matc|94026605|79589844|29117926|__max_precision|09668119|11572266|13281462|87255945|08398561|41666457|22786654|8359375|70166016|28808751|left2|59179564|83789062|53076086|57535656|37923305|date|0x|12402344|70898438|45833208|87841797|88281325|73242188|5820305|18147938|trigger_jquery_event|defineProperty|exec|defineProperties|getOwnPropertyDescriptor|getPrototypeOf|toPrecision|search|_mouseDragOrig|reverse|reduceRight|unshift|getOwnPropertyNames|TextNode|WhiteSpace|Collection|uniqueID|Arguments||isFrozen|isExtensible|||||preventExtensions|seal|freeze|isSealed|forEachMethod|send|onreadystatechange|ff0066|errordialog|inViewport|Connection|uid|Msxml2|isElementVisible|urlencoded|form|isOnScreen|mirror|overloadGetter|_getParentOffset|_mouseDrag|hasFixedAncestor|textnode|axd|clientError|encodeURI|ab8ea8824dc3b24b6666867a2c4ed58ebb762cf0|MooTools|3037093|MouseEvents|_mouseCapture|89697508|81250219|ontouchend|8414724|98649128|14257696|63183594|Implements|1770819|ipad|iphone|ipod|teardown|WebkitUserSelect|special|9262671|41162109|7604181|82910156|39876587|05680228|erase|515|Rectangle||transparent|pick|combine|invoke|ready|associate|getRandom||getLast|camelCase|49886178|79850071|82698528|90673828|27783203|exp|capitalize|hyphenate|escapeRegExp|atan|substitute|getUTCDate|635|484|26c|405h240V795h|M10|925|213|me2|292|417|026|LINKED_OBJECTS_Link_symbol_16|807|807c|502zm11|502L2|MouseEvent|94l|0l|22z|56c|4E3|oldInstances|012|313|865l|case_sensitive|162l1|067|09c|328|323|088|364|903l2|hide_on_blur_timeout|625l|wrapperCleared|077|reset_options_value|426||852|options_value|padding_right|autocomplete|frameborder||_hidden_select|204|59C9|384|296|588c|labelledby|038|uniqueId|haspopup|listbox|owns|441h240V759h|556C15|1H2|444V2|15h10|888C14|556z|tool|DATASOURCE_Settings_Work_Tool_16|work|9H9v3H7V9H4V7h3V4h2v3h3v2z|ESCAPE|tableDnDSerialize|rest|DATASOURCE_EDIT_Pencil_striped_symbol_for_interface_edit_buttons_16|GET|344|333z|289h240V911h|5l7|373|5h2|err|502v2|tDnD_whileDrag|99zM7|838|252h2|tableDnDUpdate|078|BackCompat|333L12|serializeParamName|M15|DATASOURCE_Delete_16|215h240V985h|innerText|containsOption|copyOptions|selectedTexts|364z|tab|tab_derived||||ajaxAddOption|Page||getJSON|sortOptions|Sketch|09c1|324l|066|683|HTMLMenuItemElement|Treeview|persist|unique|865l2|033|003|binary|x9f|C14|L15|L12|secureEvalJSON|evalJSON|C15|getUTCHours|getUTCFullYear|getUTCMinutes|getUTCMilliseconds|getUTCSeconds|1200|CONTEXT_MENU_table_row_delete|u00|x00|x7f|x1f|679|SyntaxError|bfnrtu|parsing|valid|240|html5|324|327|646|992l|674|574|reserved|388|035|562|setInputValues|573zm2|797|387||673|563|357C12|904L6|getInputValues||radiogroup||705|917|Cannot||227|624l|076|424|628|6100|onselectstart|HTMLCommandElement|triggerHandler|6101|flipfit|013|disableTextSelect|selectstart|100000px|358|633|485|445|212|025|926|298|Allow|Deny|LinkManipulations|Asc|Desc|Byte|Currency|Binary|DbType|AnsiString|flat|Many|One|shortdot|shortdash|joinstyle|ItemSortType|miter|endcap|LinkSideType|Decimal|Xml|DateTime2|StringFixedLength|arrowlength|AnsiStringFixedLength||NumericInt|||16382|NumericFrac|DateTimeOffset|KindOfType|SByte|Single|Int64|Double|Int16|VarNumeric|arrowwidth|UInt64|UInt16|UInt32|colors|color2|UnionSubMenu|focussize|gradientTitle|exists|AddCTEShort|already|ColumnNameAlreadyUsed|same|visual|representation|Update|SqlChanged|updated|270|focusposition|AddNewCTE|AddSubQuery|AddCTE|oindex|longdashdotdot|longdashdot|dashstyle|Other|LinkCardinality|shortdashdotdot|shortdashdot|dash|dashdot|longdash|Foreign|User|groups|kern|center|TreeSelectTypeDto|StoredProc|currentLanguage|MainQuery|Main|MultipleQueriesPerSession|webkitTapHighlightColor|createElementNS|Gradient|fillOpacity|gradientTransform|Universal|props|DOMContentLoaded|0z|||0A2|updateObjects|refY|windowsSizeH|mdc|windowsSizeW|32E3|patternTransform|markerHeight|orient|markerWidth|ninja|removeAll|bolder|removeByGraphics|getByLinkNew|print|updateLinks|mlcxtrv|bold|lighter|700|fullfill|animportCanvasimation|DenyIntoClause|450|Into|baseline|getByLink|descent|offsetX|offsetY|xMinYMin|meet|reload|21600|getScreenCTM|removeAttribute|removeGridRows|addGridRows|SQLEditorError|removeLink|doesn|Your|u2019t|nYou|Falling|1E4|ahqstv|dxdy|DataReceivedNew|rotation|stdDeviation||nullable|||userSpaceOnUse|||||primaryKey|objid|int|GetName|LoadFromObject|clipPath|patternUnits|GetFullName|LAST|MAX|FIRST|feGaussianBlur|COUNT|old|ObjectField|Having|MIN|SUM|Uncheck|toTimeString|unload|00|removeHandler|addHandler|quot|x2F|live|liveEx|liveConvert|Saturday|SmartAdd|Friday|Wednesday|Thursday|OnApplicationReady|setGlobalOnLoad|getRec1|equalWidth|equalHeight|non|System|LinkObjectDto|AliasNotQuoted|CanvasDto|GridDto|Cardinality|DatasourceName|DataSourceGuid|LeftFields|RightFields|contentWindow|Top|fixOutsideBounds|require|9E9||interrupt|GLOBAL_DEBUG|||||DIV|onAfterFirst|client|GenerateClass|superclass|February|Dec|January|July|toUpper|June|March|April|Apr|Mar|Jun|Aug|Jul|Oct|Nov|Sep|Feb|Jan|August|doesNotAddBorder|Sat|doesAddBorderForTableAndCells|subtractsBorderForOverflowNotVisible|Fri|bodyOffset|offsetWithParent|Tuesday|Sunday|Monday|December|delegate|November|September|October|Wed|Thu|Tue|Sun|Mon|MetaDataDto|runtimeStyle|Enclose|EncloseWithBrackets|pixelradius|RemoveBrackets|backward|MoveForward|MoveBackward|CopyToNewUnionSubQuery|NewUnionSubQuery|JoinExpression|Join|textpathok|LeftColumn|RightColumn|Order|GroupBy|Option|CacheOptions|Cache|forward|views|procedures|MetadataObjectCount|Provider|proceed|Check|UncheckAll|CheckAll|DeleteCTE|SelectAll|InsertEmptyItem|ObjectTypeTable|RemoveItem|MoveUp|MoveDown|SelectSyntaxProvider|Syntax|ObjectTypeUnknown|ObjectTypeView|ObjectTypeProcedure|UnionsAdd|ContextMenuDto|Label|00000000|000000000000|Expanded|Test|Selected|ContextMenuItemDto|QueryStructureDto|Precision|ReadOnly|Nullable|Command|AltName|ItemsListIncomplete|MetadataStructureItemDto|ItemsPacketSize|Scale|Size|OutputColumnDto|ErrorToken|ErrorTokenPos|MetadataFieldGuid|ComparedField|ComparedObject|SelectAllFromLeft|SelectAllFromRight|RightObject|Datasource|LeftObject|Symbol|addRule|QueryParamDto|FieldType|Kind|DataTypeDB|CompareOperator|DataType|createStyleSheet|FullName|registerFont|getIntersectionList|Apple|Chrome|platform|Computer|paddingTop|getElementsByPoint|toTransformString|x_y|Version|getElementsByBBox|breadcrumb|Google|initialise|reinitialise|buttonset|setFinish|pageXOffset|Linked|createSVGRect|returnValue|clearfix|grip|alsoResize|cancelBubble|u00d7|M21|horizontalDrag|inter|isAtLeft|unhover|M22|paddingLeft|MIN_HEIGHT|elastic|04|1734|M11|interCount|Random|isSuperSimple|hellip|inputSpan|menublur|menufocus|getArrowScroll|limitation|isAtRight|myType|curveslengths|sizingmethod|using|getData|segment1|isScrollableV|getIsScrollableV|isScrollableH|getIsScrollableH|getPercentScrolledY|_pathToRelative|focusout|uiDialogTitlebar|uiDialogClasses|_allowInteraction|calling|unmouseout|uuid|unmouseover|u201d|u201c|getContentPane|tableNameTemplate|segment2|updateValue|hijackInternalLinks|scrollToBottom|pathIntersectionNumber|_minHeight|linked|animateEase|beforeClose|unmousedown|deleteCTE|scrollToPercentY|scrollToPercentX|setStart|diagonal|animateDuration|Switch|_createButtons|uiDialogTitlebarCloseText|getContentWidth|setDataSwitch|pathIntersection|getPercentScrolledX|getContentHeight|getContentPositionX|onDragOver|undrag|getContentPositionY|closeText|uncheck|fillSelectOptions2|findRowByGuid|checkRow|fillSelectOptions1|findEmptyRow|removeRowByDto|onAnimation|onclick|folder|onerror|level|OnBeforeCustomEditCell|parseDots|dataRefresh|insertafter|addClasses|onGridRowCellChanged|isEmptyRow|pager|_UID|insertbefore|tofront|enabled|rowIndex|targetPlace|currentEdit|rowsHeaders|toback|65280|u2019s|itemsElementRoot|16711680|Picker|isLoadedAttr|Colour|u2018s|index2|findRow|queryCommandValue|insertion|ForeColor|000B9D|slideToggle|u2400|qualifiedName|collspan|MAX_SELECTS|GetTreeFilteredNode|preload|oldHeight|onRemoveRow|nonexpandable|onAddRow|setTime|getGrid|oldWidth|625|9375|paid|984375|_equaliseTransform|5625|mozRequestAnimationFrame|NONE|webkitRequestAnimationFrame|them|rid|pixelWidth|requestAnimationFrame|titleTextW|own|easeIn|easeInOut|easeOut|pixelHeight|msRequestAnimationFrame|finish|79B5E3|GridRowCellOnDeleted|_setContainment||2573AF|bounce|sortOrder|focusin|onChanged|onDeleted|oRequestAnimationFrame'.split('|'),0,{}))

