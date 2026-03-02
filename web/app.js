var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        var ReactVersion = "18.3.1";
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactCurrentDispatcher = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactCurrentBatchConfig = {
          transition: null
        };
        var ReactCurrentActQueue = {
          current: null,
          // Used to reproduce behavior of `batchedUpdates` in legacy mode.
          isBatchingLegacy: false,
          didScheduleLegacyUpdate: false
        };
        var ReactCurrentOwner = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactDebugCurrentFrame = {};
        var currentExtraStackFrame = null;
        function setExtraStackFrame(stack) {
          {
            currentExtraStackFrame = stack;
          }
        }
        {
          ReactDebugCurrentFrame.setExtraStackFrame = function(stack) {
            {
              currentExtraStackFrame = stack;
            }
          };
          ReactDebugCurrentFrame.getCurrentStack = null;
          ReactDebugCurrentFrame.getStackAddendum = function() {
            var stack = "";
            if (currentExtraStackFrame) {
              stack += currentExtraStackFrame;
            }
            var impl = ReactDebugCurrentFrame.getCurrentStack;
            if (impl) {
              stack += impl() || "";
            }
            return stack;
          };
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var ReactSharedInternals = {
          ReactCurrentDispatcher,
          ReactCurrentBatchConfig,
          ReactCurrentOwner
        };
        {
          ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
          ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
        }
        function warn(format) {
          {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var didWarnStateUpdateForUnmountedComponent = {};
        function warnNoop(publicInstance, callerName) {
          {
            var _constructor = publicInstance.constructor;
            var componentName = _constructor && (_constructor.displayName || _constructor.name) || "ReactClass";
            var warningKey = componentName + "." + callerName;
            if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
              return;
            }
            error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, componentName);
            didWarnStateUpdateForUnmountedComponent[warningKey] = true;
          }
        }
        var ReactNoopUpdateQueue = {
          /**
           * Checks whether or not this composite component is mounted.
           * @param {ReactClass} publicInstance The instance we want to test.
           * @return {boolean} True if mounted, false otherwise.
           * @protected
           * @final
           */
          isMounted: function(publicInstance) {
            return false;
          },
          /**
           * Forces an update. This should only be invoked when it is known with
           * certainty that we are **not** in a DOM transaction.
           *
           * You may want to call this when you know that some deeper aspect of the
           * component's state has changed but `setState` was not called.
           *
           * This will not invoke `shouldComponentUpdate`, but it will invoke
           * `componentWillUpdate` and `componentDidUpdate`.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueForceUpdate: function(publicInstance, callback, callerName) {
            warnNoop(publicInstance, "forceUpdate");
          },
          /**
           * Replaces all of the state. Always use this or `setState` to mutate state.
           * You should treat `this.state` as immutable.
           *
           * There is no guarantee that `this.state` will be immediately updated, so
           * accessing `this.state` after calling this method may return the old value.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} completeState Next state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueReplaceState: function(publicInstance, completeState, callback, callerName) {
            warnNoop(publicInstance, "replaceState");
          },
          /**
           * Sets a subset of the state. This only exists because _pendingState is
           * internal. This provides a merging strategy that is not available to deep
           * properties which is confusing. TODO: Expose pendingState or don't use it
           * during the merge.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} partialState Next partial state to be merged with state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} Name of the calling function in the public API.
           * @internal
           */
          enqueueSetState: function(publicInstance, partialState, callback, callerName) {
            warnNoop(publicInstance, "setState");
          }
        };
        var assign = Object.assign;
        var emptyObject = {};
        {
          Object.freeze(emptyObject);
        }
        function Component(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        Component.prototype.isReactComponent = {};
        Component.prototype.setState = function(partialState, callback) {
          if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null) {
            throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
          }
          this.updater.enqueueSetState(this, partialState, callback, "setState");
        };
        Component.prototype.forceUpdate = function(callback) {
          this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
        };
        {
          var deprecatedAPIs = {
            isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
            replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
          };
          var defineDeprecationWarning = function(methodName, info) {
            Object.defineProperty(Component.prototype, methodName, {
              get: function() {
                warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
                return void 0;
              }
            });
          };
          for (var fnName in deprecatedAPIs) {
            if (deprecatedAPIs.hasOwnProperty(fnName)) {
              defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
            }
          }
        }
        function ComponentDummy() {
        }
        ComponentDummy.prototype = Component.prototype;
        function PureComponent(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
        pureComponentPrototype.constructor = PureComponent;
        assign(pureComponentPrototype, Component.prototype);
        pureComponentPrototype.isPureReactComponent = true;
        function createRef() {
          var refObject = {
            current: null
          };
          {
            Object.seal(refObject);
          }
          return refObject;
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function defineKeyPropWarningGetter(props, displayName) {
          var warnAboutAccessingKey = function() {
            {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
        function defineRefPropWarningGetter(props, displayName) {
          var warnAboutAccessingRef = function() {
            {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
        function warnIfStringRefCannotBeAutoConverted(config) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        var ReactElement = function(type, key, ref, self, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function createElement(type, config, children) {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          var self = null;
          var source = null;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              {
                warnIfStringRefCannotBeAutoConverted(config);
              }
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            self = config.__self === void 0 ? null : config.__self;
            source = config.__source === void 0 ? null : config.__source;
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            {
              if (Object.freeze) {
                Object.freeze(childArray);
              }
            }
            props.children = childArray;
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          {
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
          }
          return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
        }
        function cloneAndReplaceKey(oldElement, newKey) {
          var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
          return newElement;
        }
        function cloneElement(element, config, children) {
          if (element === null || element === void 0) {
            throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
          }
          var propName;
          var props = assign({}, element.props);
          var key = element.key;
          var ref = element.ref;
          var self = element._self;
          var source = element._source;
          var owner = element._owner;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              owner = ReactCurrentOwner.current;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            var defaultProps;
            if (element.type && element.type.defaultProps) {
              defaultProps = element.type.defaultProps;
            }
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                if (config[propName] === void 0 && defaultProps !== void 0) {
                  props[propName] = defaultProps[propName];
                } else {
                  props[propName] = config[propName];
                }
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            props.children = childArray;
          }
          return ReactElement(element.type, key, ref, self, source, owner, props);
        }
        function isValidElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        var SEPARATOR = ".";
        var SUBSEPARATOR = ":";
        function escape(key) {
          var escapeRegex = /[=:]/g;
          var escaperLookup = {
            "=": "=0",
            ":": "=2"
          };
          var escapedString = key.replace(escapeRegex, function(match) {
            return escaperLookup[match];
          });
          return "$" + escapedString;
        }
        var didWarnAboutMaps = false;
        var userProvidedKeyEscapeRegex = /\/+/g;
        function escapeUserProvidedKey(text) {
          return text.replace(userProvidedKeyEscapeRegex, "$&/");
        }
        function getElementKey(element, index) {
          if (typeof element === "object" && element !== null && element.key != null) {
            {
              checkKeyStringCoercion(element.key);
            }
            return escape("" + element.key);
          }
          return index.toString(36);
        }
        function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
          var type = typeof children;
          if (type === "undefined" || type === "boolean") {
            children = null;
          }
          var invokeCallback = false;
          if (children === null) {
            invokeCallback = true;
          } else {
            switch (type) {
              case "string":
              case "number":
                invokeCallback = true;
                break;
              case "object":
                switch (children.$$typeof) {
                  case REACT_ELEMENT_TYPE:
                  case REACT_PORTAL_TYPE:
                    invokeCallback = true;
                }
            }
          }
          if (invokeCallback) {
            var _child = children;
            var mappedChild = callback(_child);
            var childKey = nameSoFar === "" ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
            if (isArray(mappedChild)) {
              var escapedChildKey = "";
              if (childKey != null) {
                escapedChildKey = escapeUserProvidedKey(childKey) + "/";
              }
              mapIntoArray(mappedChild, array, escapedChildKey, "", function(c) {
                return c;
              });
            } else if (mappedChild != null) {
              if (isValidElement(mappedChild)) {
                {
                  if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
                    checkKeyStringCoercion(mappedChild.key);
                  }
                }
                mappedChild = cloneAndReplaceKey(
                  mappedChild,
                  // Keep both the (mapped) and old keys if they differ, just as
                  // traverseAllChildren used to do for objects as children
                  escapedPrefix + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
                  (mappedChild.key && (!_child || _child.key !== mappedChild.key) ? (
                    // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                    // eslint-disable-next-line react-internal/safe-string-coercion
                    escapeUserProvidedKey("" + mappedChild.key) + "/"
                  ) : "") + childKey
                );
              }
              array.push(mappedChild);
            }
            return 1;
          }
          var child;
          var nextName;
          var subtreeCount = 0;
          var nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;
          if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              child = children[i];
              nextName = nextNamePrefix + getElementKey(child, i);
              subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
            }
          } else {
            var iteratorFn = getIteratorFn(children);
            if (typeof iteratorFn === "function") {
              var iterableChildren = children;
              {
                if (iteratorFn === iterableChildren.entries) {
                  if (!didWarnAboutMaps) {
                    warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
                  }
                  didWarnAboutMaps = true;
                }
              }
              var iterator = iteratorFn.call(iterableChildren);
              var step;
              var ii = 0;
              while (!(step = iterator.next()).done) {
                child = step.value;
                nextName = nextNamePrefix + getElementKey(child, ii++);
                subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
              }
            } else if (type === "object") {
              var childrenString = String(children);
              throw new Error("Objects are not valid as a React child (found: " + (childrenString === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : childrenString) + "). If you meant to render a collection of children, use an array instead.");
            }
          }
          return subtreeCount;
        }
        function mapChildren(children, func, context) {
          if (children == null) {
            return children;
          }
          var result = [];
          var count = 0;
          mapIntoArray(children, result, "", "", function(child) {
            return func.call(context, child, count++);
          });
          return result;
        }
        function countChildren(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        }
        function forEachChildren(children, forEachFunc, forEachContext) {
          mapChildren(children, function() {
            forEachFunc.apply(this, arguments);
          }, forEachContext);
        }
        function toArray(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        }
        function onlyChild(children) {
          if (!isValidElement(children)) {
            throw new Error("React.Children.only expected to receive a single React element child.");
          }
          return children;
        }
        function createContext(defaultValue) {
          var context = {
            $$typeof: REACT_CONTEXT_TYPE,
            // As a workaround to support multiple concurrent renderers, we categorize
            // some renderers as primary and others as secondary. We only expect
            // there to be two concurrent renderers at most: React Native (primary) and
            // Fabric (secondary); React DOM (primary) and React ART (secondary).
            // Secondary renderers store their context values on separate fields.
            _currentValue: defaultValue,
            _currentValue2: defaultValue,
            // Used to track how many concurrent renderers this context currently
            // supports within in a single renderer. Such as parallel server rendering.
            _threadCount: 0,
            // These are circular
            Provider: null,
            Consumer: null,
            // Add these to use same hidden class in VM as ServerContext
            _defaultValue: null,
            _globalName: null
          };
          context.Provider = {
            $$typeof: REACT_PROVIDER_TYPE,
            _context: context
          };
          var hasWarnedAboutUsingNestedContextConsumers = false;
          var hasWarnedAboutUsingConsumerProvider = false;
          var hasWarnedAboutDisplayNameOnConsumer = false;
          {
            var Consumer = {
              $$typeof: REACT_CONTEXT_TYPE,
              _context: context
            };
            Object.defineProperties(Consumer, {
              Provider: {
                get: function() {
                  if (!hasWarnedAboutUsingConsumerProvider) {
                    hasWarnedAboutUsingConsumerProvider = true;
                    error("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?");
                  }
                  return context.Provider;
                },
                set: function(_Provider) {
                  context.Provider = _Provider;
                }
              },
              _currentValue: {
                get: function() {
                  return context._currentValue;
                },
                set: function(_currentValue) {
                  context._currentValue = _currentValue;
                }
              },
              _currentValue2: {
                get: function() {
                  return context._currentValue2;
                },
                set: function(_currentValue2) {
                  context._currentValue2 = _currentValue2;
                }
              },
              _threadCount: {
                get: function() {
                  return context._threadCount;
                },
                set: function(_threadCount) {
                  context._threadCount = _threadCount;
                }
              },
              Consumer: {
                get: function() {
                  if (!hasWarnedAboutUsingNestedContextConsumers) {
                    hasWarnedAboutUsingNestedContextConsumers = true;
                    error("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                  }
                  return context.Consumer;
                }
              },
              displayName: {
                get: function() {
                  return context.displayName;
                },
                set: function(displayName) {
                  if (!hasWarnedAboutDisplayNameOnConsumer) {
                    warn("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", displayName);
                    hasWarnedAboutDisplayNameOnConsumer = true;
                  }
                }
              }
            });
            context.Consumer = Consumer;
          }
          {
            context._currentRenderer = null;
            context._currentRenderer2 = null;
          }
          return context;
        }
        var Uninitialized = -1;
        var Pending = 0;
        var Resolved = 1;
        var Rejected = 2;
        function lazyInitializer(payload) {
          if (payload._status === Uninitialized) {
            var ctor = payload._result;
            var thenable = ctor();
            thenable.then(function(moduleObject2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var resolved = payload;
                resolved._status = Resolved;
                resolved._result = moduleObject2;
              }
            }, function(error2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var rejected = payload;
                rejected._status = Rejected;
                rejected._result = error2;
              }
            });
            if (payload._status === Uninitialized) {
              var pending = payload;
              pending._status = Pending;
              pending._result = thenable;
            }
          }
          if (payload._status === Resolved) {
            var moduleObject = payload._result;
            {
              if (moduleObject === void 0) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", moduleObject);
              }
            }
            {
              if (!("default" in moduleObject)) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", moduleObject);
              }
            }
            return moduleObject.default;
          } else {
            throw payload._result;
          }
        }
        function lazy(ctor) {
          var payload = {
            // We use these fields to store the result.
            _status: Uninitialized,
            _result: ctor
          };
          var lazyType = {
            $$typeof: REACT_LAZY_TYPE,
            _payload: payload,
            _init: lazyInitializer
          };
          {
            var defaultProps;
            var propTypes;
            Object.defineProperties(lazyType, {
              defaultProps: {
                configurable: true,
                get: function() {
                  return defaultProps;
                },
                set: function(newDefaultProps) {
                  error("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  defaultProps = newDefaultProps;
                  Object.defineProperty(lazyType, "defaultProps", {
                    enumerable: true
                  });
                }
              },
              propTypes: {
                configurable: true,
                get: function() {
                  return propTypes;
                },
                set: function(newPropTypes) {
                  error("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  propTypes = newPropTypes;
                  Object.defineProperty(lazyType, "propTypes", {
                    enumerable: true
                  });
                }
              }
            });
          }
          return lazyType;
        }
        function forwardRef(render) {
          {
            if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
              error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).");
            } else if (typeof render !== "function") {
              error("forwardRef requires a render function but was given %s.", render === null ? "null" : typeof render);
            } else {
              if (render.length !== 0 && render.length !== 2) {
                error("forwardRef render functions accept exactly two parameters: props and ref. %s", render.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
              }
            }
            if (render != null) {
              if (render.defaultProps != null || render.propTypes != null) {
                error("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
              }
            }
          }
          var elementType = {
            $$typeof: REACT_FORWARD_REF_TYPE,
            render
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!render.name && !render.displayName) {
                  render.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function memo(type, compare) {
          {
            if (!isValidElementType(type)) {
              error("memo: The first argument must be a component. Instead received: %s", type === null ? "null" : typeof type);
            }
          }
          var elementType = {
            $$typeof: REACT_MEMO_TYPE,
            type,
            compare: compare === void 0 ? null : compare
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!type.name && !type.displayName) {
                  type.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        function resolveDispatcher() {
          var dispatcher = ReactCurrentDispatcher.current;
          {
            if (dispatcher === null) {
              error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
            }
          }
          return dispatcher;
        }
        function useContext(Context) {
          var dispatcher = resolveDispatcher();
          {
            if (Context._context !== void 0) {
              var realContext = Context._context;
              if (realContext.Consumer === Context) {
                error("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?");
              } else if (realContext.Provider === Context) {
                error("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
              }
            }
          }
          return dispatcher.useContext(Context);
        }
        function useState2(initialState) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useState(initialState);
        }
        function useReducer(reducer, initialArg, init) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useReducer(reducer, initialArg, init);
        }
        function useRef2(initialValue) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useRef(initialValue);
        }
        function useEffect2(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useEffect(create, deps);
        }
        function useInsertionEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useInsertionEffect(create, deps);
        }
        function useLayoutEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useLayoutEffect(create, deps);
        }
        function useCallback2(callback, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useCallback(callback, deps);
        }
        function useMemo2(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useMemo(create, deps);
        }
        function useImperativeHandle(ref, create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useImperativeHandle(ref, create, deps);
        }
        function useDebugValue(value, formatterFn) {
          {
            var dispatcher = resolveDispatcher();
            return dispatcher.useDebugValue(value, formatterFn);
          }
        }
        function useTransition() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useTransition();
        }
        function useDeferredValue(value) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useDeferredValue(value);
        }
        function useId() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useId();
        }
        function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
        }
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher$1.current;
            ReactCurrentDispatcher$1.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher$1.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component2) {
          var prototype = Component2.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              setExtraStackFrame(stack);
            } else {
              setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function getDeclarationErrorAddendum() {
          if (ReactCurrentOwner.current) {
            var name = getComponentNameFromType(ReactCurrentOwner.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
        function getSourceInfoErrorAddendum(source) {
          if (source !== void 0) {
            var fileName = source.fileName.replace(/^.*[\\\/]/, "");
            var lineNumber = source.lineNumber;
            return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
          }
          return "";
        }
        function getSourceInfoErrorAddendumForProps(elementProps) {
          if (elementProps !== null && elementProps !== void 0) {
            return getSourceInfoErrorAddendum(elementProps.__source);
          }
          return "";
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
        function validateExplicitKey(element, parentType) {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          {
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          if (typeof node !== "object") {
            return;
          }
          if (isArray(node)) {
            for (var i = 0; i < node.length; i++) {
              var child = node[i];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator = iteratorFn.call(node);
                var step;
                while (!(step = iterator.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        function createElementWithValidation(type, props, children) {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendumForProps(props);
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            {
              error("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
          }
          var element = createElement.apply(this, arguments);
          if (element == null) {
            return element;
          }
          if (validType) {
            for (var i = 2; i < arguments.length; i++) {
              validateChildKeys(arguments[i], type);
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
        var didWarnAboutDeprecatedCreateFactory = false;
        function createFactoryWithValidation(type) {
          var validatedFactory = createElementWithValidation.bind(null, type);
          validatedFactory.type = type;
          {
            if (!didWarnAboutDeprecatedCreateFactory) {
              didWarnAboutDeprecatedCreateFactory = true;
              warn("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.");
            }
            Object.defineProperty(validatedFactory, "type", {
              enumerable: false,
              get: function() {
                warn("Factory.type is deprecated. Access the class directly before passing it to createFactory.");
                Object.defineProperty(this, "type", {
                  value: type
                });
                return type;
              }
            });
          }
          return validatedFactory;
        }
        function cloneElementWithValidation(element, props, children) {
          var newElement = cloneElement.apply(this, arguments);
          for (var i = 2; i < arguments.length; i++) {
            validateChildKeys(arguments[i], newElement.type);
          }
          validatePropTypes(newElement);
          return newElement;
        }
        function startTransition(scope, options) {
          var prevTransition = ReactCurrentBatchConfig.transition;
          ReactCurrentBatchConfig.transition = {};
          var currentTransition = ReactCurrentBatchConfig.transition;
          {
            ReactCurrentBatchConfig.transition._updatedFibers = /* @__PURE__ */ new Set();
          }
          try {
            scope();
          } finally {
            ReactCurrentBatchConfig.transition = prevTransition;
            {
              if (prevTransition === null && currentTransition._updatedFibers) {
                var updatedFibersCount = currentTransition._updatedFibers.size;
                if (updatedFibersCount > 10) {
                  warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.");
                }
                currentTransition._updatedFibers.clear();
              }
            }
          }
        }
        var didWarnAboutMessageChannel = false;
        var enqueueTaskImpl = null;
        function enqueueTask(task) {
          if (enqueueTaskImpl === null) {
            try {
              var requireString = ("require" + Math.random()).slice(0, 7);
              var nodeRequire = module && module[requireString];
              enqueueTaskImpl = nodeRequire.call(module, "timers").setImmediate;
            } catch (_err) {
              enqueueTaskImpl = function(callback) {
                {
                  if (didWarnAboutMessageChannel === false) {
                    didWarnAboutMessageChannel = true;
                    if (typeof MessageChannel === "undefined") {
                      error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning.");
                    }
                  }
                }
                var channel = new MessageChannel();
                channel.port1.onmessage = callback;
                channel.port2.postMessage(void 0);
              };
            }
          }
          return enqueueTaskImpl(task);
        }
        var actScopeDepth = 0;
        var didWarnNoAwaitAct = false;
        function act(callback) {
          {
            var prevActScopeDepth = actScopeDepth;
            actScopeDepth++;
            if (ReactCurrentActQueue.current === null) {
              ReactCurrentActQueue.current = [];
            }
            var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
            var result;
            try {
              ReactCurrentActQueue.isBatchingLegacy = true;
              result = callback();
              if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
                var queue = ReactCurrentActQueue.current;
                if (queue !== null) {
                  ReactCurrentActQueue.didScheduleLegacyUpdate = false;
                  flushActQueue(queue);
                }
              }
            } catch (error2) {
              popActScope(prevActScopeDepth);
              throw error2;
            } finally {
              ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
            }
            if (result !== null && typeof result === "object" && typeof result.then === "function") {
              var thenableResult = result;
              var wasAwaited = false;
              var thenable = {
                then: function(resolve, reject) {
                  wasAwaited = true;
                  thenableResult.then(function(returnValue2) {
                    popActScope(prevActScopeDepth);
                    if (actScopeDepth === 0) {
                      recursivelyFlushAsyncActWork(returnValue2, resolve, reject);
                    } else {
                      resolve(returnValue2);
                    }
                  }, function(error2) {
                    popActScope(prevActScopeDepth);
                    reject(error2);
                  });
                }
              };
              {
                if (!didWarnNoAwaitAct && typeof Promise !== "undefined") {
                  Promise.resolve().then(function() {
                  }).then(function() {
                    if (!wasAwaited) {
                      didWarnNoAwaitAct = true;
                      error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);");
                    }
                  });
                }
              }
              return thenable;
            } else {
              var returnValue = result;
              popActScope(prevActScopeDepth);
              if (actScopeDepth === 0) {
                var _queue = ReactCurrentActQueue.current;
                if (_queue !== null) {
                  flushActQueue(_queue);
                  ReactCurrentActQueue.current = null;
                }
                var _thenable = {
                  then: function(resolve, reject) {
                    if (ReactCurrentActQueue.current === null) {
                      ReactCurrentActQueue.current = [];
                      recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                    } else {
                      resolve(returnValue);
                    }
                  }
                };
                return _thenable;
              } else {
                var _thenable2 = {
                  then: function(resolve, reject) {
                    resolve(returnValue);
                  }
                };
                return _thenable2;
              }
            }
          }
        }
        function popActScope(prevActScopeDepth) {
          {
            if (prevActScopeDepth !== actScopeDepth - 1) {
              error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
            }
            actScopeDepth = prevActScopeDepth;
          }
        }
        function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
          {
            var queue = ReactCurrentActQueue.current;
            if (queue !== null) {
              try {
                flushActQueue(queue);
                enqueueTask(function() {
                  if (queue.length === 0) {
                    ReactCurrentActQueue.current = null;
                    resolve(returnValue);
                  } else {
                    recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                  }
                });
              } catch (error2) {
                reject(error2);
              }
            } else {
              resolve(returnValue);
            }
          }
        }
        var isFlushing = false;
        function flushActQueue(queue) {
          {
            if (!isFlushing) {
              isFlushing = true;
              var i = 0;
              try {
                for (; i < queue.length; i++) {
                  var callback = queue[i];
                  do {
                    callback = callback(true);
                  } while (callback !== null);
                }
                queue.length = 0;
              } catch (error2) {
                queue = queue.slice(i + 1);
                throw error2;
              } finally {
                isFlushing = false;
              }
            }
          }
        }
        var createElement$1 = createElementWithValidation;
        var cloneElement$1 = cloneElementWithValidation;
        var createFactory = createFactoryWithValidation;
        var Children = {
          map: mapChildren,
          forEach: forEachChildren,
          count: countChildren,
          toArray,
          only: onlyChild
        };
        exports.Children = Children;
        exports.Component = Component;
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.Profiler = REACT_PROFILER_TYPE;
        exports.PureComponent = PureComponent;
        exports.StrictMode = REACT_STRICT_MODE_TYPE;
        exports.Suspense = REACT_SUSPENSE_TYPE;
        exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
        exports.act = act;
        exports.cloneElement = cloneElement$1;
        exports.createContext = createContext;
        exports.createElement = createElement$1;
        exports.createFactory = createFactory;
        exports.createRef = createRef;
        exports.forwardRef = forwardRef;
        exports.isValidElement = isValidElement;
        exports.lazy = lazy;
        exports.memo = memo;
        exports.startTransition = startTransition;
        exports.unstable_act = act;
        exports.useCallback = useCallback2;
        exports.useContext = useContext;
        exports.useDebugValue = useDebugValue;
        exports.useDeferredValue = useDeferredValue;
        exports.useEffect = useEffect2;
        exports.useId = useId;
        exports.useImperativeHandle = useImperativeHandle;
        exports.useInsertionEffect = useInsertionEffect;
        exports.useLayoutEffect = useLayoutEffect;
        exports.useMemo = useMemo2;
        exports.useReducer = useReducer;
        exports.useRef = useRef2;
        exports.useState = useState2;
        exports.useSyncExternalStore = useSyncExternalStore;
        exports.useTransition = useTransition;
        exports.version = ReactVersion;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_development();
    }
  }
});

// web/ts/app.tsx
var import_react5 = __toESM(require_react());

// web/ts/components/HeaderBar.tsx
var import_react = __toESM(require_react());
function HeaderBar({ controlPreset, setControlPreset, controlPresets }) {
  return /* @__PURE__ */ import_react.default.createElement("header", { className: "top" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "brand" }, "HEART DIVER"), /* @__PURE__ */ import_react.default.createElement("div", { className: "topRight" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "hint" }, "WASD/Arrow Move | Space Attack | E Interact | Shift+Move Dash"), /* @__PURE__ */ import_react.default.createElement("div", { className: "presetRow" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "mutedText" }, "Key Preset"), /* @__PURE__ */ import_react.default.createElement("button", { className: controlPreset === "wasd" ? "primary" : "", onClick: () => setControlPreset("wasd") }, controlPresets.wasd), /* @__PURE__ */ import_react.default.createElement("button", { className: controlPreset === "arrows" ? "primary" : "", onClick: () => setControlPreset("arrows") }, controlPresets.arrows))));
}

// web/ts/components/GameOverlays.tsx
var import_react2 = __toESM(require_react());
function GameOverlays({
  showStart,
  ready,
  hasSave,
  onStartRun,
  paused,
  pauseReason,
  setPaused,
  upgradeEvent,
  onUpgradeChoice,
  deathSummary,
  onCopyResult,
  onNewRun,
  goalText,
  runLoopText,
  archiveHook,
  showCutscene,
  cutsceneText,
  onCutsceneNext
}) {
  return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, showStart ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlay startOverlay" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayTitle" }, "HEART DIVER"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayGoal" }, goalText), /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayLoop" }, archiveHook), /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayLoop" }, runLoopText), /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayControls" }, /* @__PURE__ */ import_react2.default.createElement("div", null, "WASD / Arrow: Move"), /* @__PURE__ */ import_react2.default.createElement("div", null, "Space: Attack"), /* @__PURE__ */ import_react2.default.createElement("div", null, "E: Interact"), /* @__PURE__ */ import_react2.default.createElement("div", null, "Shift+Move: Dash"), /* @__PURE__ */ import_react2.default.createElement("div", null, "Click: Move one tile")), /* @__PURE__ */ import_react2.default.createElement("button", { className: "startBtn", onClick: onStartRun, disabled: !ready }, hasSave ? "Start Run (Continue)" : "Start Run")) : null, showCutscene ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlay cutsceneOverlay" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayTitle" }, "SYSTEM LOG"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "cutsceneBody" }, cutsceneText), /* @__PURE__ */ import_react2.default.createElement("button", { className: "cutsceneNext", onClick: onCutsceneNext }, "Z: NEXT")) : null, paused ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlay pauseOverlay" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayTitle" }, "PAUSED"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mutedText" }, pauseReason || "Paused"), /* @__PURE__ */ import_react2.default.createElement("button", { className: "startBtn", onClick: () => setPaused(false) }, "Resume")) : null, upgradeEvent ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlay upgradeOverlay" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayTitle" }, upgradeEvent.title), /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayGoal" }, upgradeEvent.subtitle), /* @__PURE__ */ import_react2.default.createElement("div", { className: "upgradeChoices" }, upgradeEvent.choices.map((choice) => /* @__PURE__ */ import_react2.default.createElement("button", { key: choice.label, onClick: () => onUpgradeChoice(choice) }, choice.label, " - ", choice.desc)))) : null, deathSummary ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlay deathOverlay" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayTitle" }, "RUN RESULT"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayGoal" }, "Floor ", deathSummary.floor, " | Turn ", deathSummary.turn), /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayLoop" }, "Build: ", deathSummary.build), /* @__PURE__ */ import_react2.default.createElement("div", { className: "overlayGoal" }, "Death cause: ", deathSummary.reason), /* @__PURE__ */ import_react2.default.createElement("div", { className: "buttons" }, /* @__PURE__ */ import_react2.default.createElement("button", { className: "primary", onClick: onCopyResult }, "Copy run card"), /* @__PURE__ */ import_react2.default.createElement("button", { onClick: onNewRun }, "Restart"))) : null);
}

// web/ts/components/HudBar.tsx
var import_react3 = __toESM(require_react());
function HudBar({ hpText, hpRatio, bossText, turnText, floor, floorMeta, goalText }) {
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "hud" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "hudHp" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "hudLabel" }, hpText), /* @__PURE__ */ import_react3.default.createElement("div", { className: "hpBar" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "hpFill", style: { width: `${Math.round(hpRatio * 100)}%` } }))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "hudStat" }, bossText), /* @__PURE__ */ import_react3.default.createElement("div", { className: "hudStat" }, turnText), /* @__PURE__ */ import_react3.default.createElement("div", { className: "hudStat" }, "Floor: ", floor, " ", floorMeta.subtitle), /* @__PURE__ */ import_react3.default.createElement("div", { className: "hudGoal" }, goalText));
}

// web/ts/components/SidePanels.tsx
var import_react4 = __toESM(require_react());
function SidePanels({ floorMeta, buildTags, storyBody, logText, archiveHook }) {
  return /* @__PURE__ */ import_react4.default.createElement("aside", { className: "side" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "box" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "boxTitle" }, "ONE-SLOT ARCHIVE"), /* @__PURE__ */ import_react4.default.createElement("div", { className: "worldText" }, archiveHook), /* @__PURE__ */ import_react4.default.createElement("div", { className: "worldText" }, "Keywords: ACCESS / CACHE / INDEX / AUDIT / ROLLBACK / OVERWRITE / CORE / SLOT")), /* @__PURE__ */ import_react4.default.createElement("div", { className: "box" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "boxTitle" }, floorMeta.name, " | ", floorMeta.subtitle), /* @__PURE__ */ import_react4.default.createElement("div", { className: "worldText" }, "Hazard: ", floorMeta.hazard), /* @__PURE__ */ import_react4.default.createElement("div", { className: "worldText" }, "Enemies: ", floorMeta.enemies), /* @__PURE__ */ import_react4.default.createElement("div", { className: "worldText" }, "Special item: ", floorMeta.items)), /* @__PURE__ */ import_react4.default.createElement("div", { className: "box" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "boxTitle" }, "Build"), /* @__PURE__ */ import_react4.default.createElement("div", { className: "worldText" }, buildTags.length ? buildTags.join(" + ") : "No upgrade selected yet.")), /* @__PURE__ */ import_react4.default.createElement("div", { className: "box" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "boxTitle" }, "Story"), /* @__PURE__ */ import_react4.default.createElement("div", { id: "story" }, storyBody)), /* @__PURE__ */ import_react4.default.createElement("div", { className: "box" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "boxTitle" }, "Log"), /* @__PURE__ */ import_react4.default.createElement("div", { id: "log" }, logText)));
}

// web/ts/app.tsx
var h = import_react5.default.createElement;
var SAVE_KEY = "wasm_rogue_save_v4";
var STORY_EFFECTS = {
  heal_2: 1,
  heal_3: 2,
  atk_1: 3,
  shield_1: 4,
  dash_buff: 5
};
var PAT = { CHARGE: 1, SLAM: 2, MARK: 3, WIPE_LINE: 4, CROSS: 5, SUMMON: 6 };
var TILE = 16;
var VIEW_W = 40;
var VIEW_H = 22;
var FLOOR_INFO = {
  1: {
    name: "\uFFFD\uFFFD(\uFFFD\uFFFD)\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD",
    subtitle: "Ash Furnace",
    hazard: "3\uFFFD\u03F8\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u2C78 \uFFFD\u07F5\uFFFD / \uFFFD\uFFFD \u0178\uFFFD\uFFFD \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD",
    enemies: "\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD, \uFFFD\uFFFD\u01F3\uFFFD\uFFFD",
    items: "\uFFFD\u7E36\uFFFD\uFFFD\u0169, \uFFFD\uFFFD\u01F3\uFFFD\uFFFD\uFFFD\uFFFD"
  },
  2: {
    name: "\uFFFD\uFFFD\uFFFD\u03FC\uFFFD \uFFFD\u057F\uFFFD",
    subtitle: "Magma Rift",
    hazard: "2\uFFFD\u03F8\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD, \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD",
    enemies: "\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD, \u022D\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD",
    items: "\uFFFD\uFFFD\uFFFD\u4F2E \uFFFD\uFFFD\uFFFD\uFFFD, \uFFFD\u057F\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD"
  },
  3: {
    name: "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD",
    subtitle: "Frost Aqueduct",
    hazard: "4\uFFFD\u03F8\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u0135\uFFFD(2\uFFFD\uFFFD), \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD \uFFFD\u0335\uFFFD\uFFFD\uFFFD \uFFFD\u0332\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD",
    enemies: "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD, \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u03BA\uFFFD",
    items: "\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u0169 \uFFFD\uFFFD\uFFFD\uFFFD, \uFFFD\uFFFD\uFFFD\uFFFD \u0170"
  },
  4: {
    name: "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u057B\u7E32",
    subtitle: "Umbral Mycelium",
    hazard: "3\uFFFD\u03F8\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD, \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u023F\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\xFE\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD",
    enemies: "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD, \uFFFD\u057B\uFFFD \uFFFD\uFFFD\uFFFD\u0272\uFFFD",
    items: "\uFFFD\uFFFD\u022D\uFFFD\uFFFD, \uFFFD\u057B\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u012E"
  }
};
var CONTROL_PRESETS = {
  wasd: "WASD + Arrow",
  arrows: "Arrow + WASD"
};
var BASE_GOAL_TEXT = "\uFFFD\uFFFD\u01E5: \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD(Floor 4)\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \xF3\u0121\uFFFD\u03F6\uFFFD.";
var RUN_LOOP_TEXT = "\u017D\uFFFD\uFFFD -> \uFFFD\uFFFD\uFFFD\uFFFD -> \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD -> \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD";
var SAVE_TOAST_MS = 1400;
var SAFE_TURN_LIMIT = 12;
var ARCHIVE_HOOK = "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u03F3\uFFFD. \uFFFD\u05F0\uFFFD \uFFFD\uFFFD\uFFFD\u01B3\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD, \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD.";
var LORE = {
  introPages: [
    "[BOOT] ONE-SLOT ARCHIVE v0.9 (DEGRADED)",
    "[INFO] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD.\n[WARN] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD: 1",
    "[RULE] \uFFFD\uFFFD\uFFFD\uFFFD = \uFFFD\uFFFD\uFFFD\uEFB2\uFFFD\uFFFD.\n[RULE] \uFFFD\uFFFD\uFFFD\uEFB2\uFFFD\uFFFD = \uFFFD\uFFFD\uFFFD\uFFFD.",
    "[PROC] RECOVERER spawned.\n[TASK] \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \u0238\uFFFD\uFFFD.",
    "[NOTE] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD: \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD.\n[NOTE] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\xFC: \uFFFD\u04B8\uFFFD.",
    "[ALERT] \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u03BC\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD.\n[ALERT] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD.",
    "[HINT] \uFFFD\uFFFD\uFFFD\u01B3\uFFFD\uFFFD\u01B6\uFFFD.\n[HINT] \uFFFD\u05F8\uFFFD\uFFFD\uFFFD... \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u0636\uFFFD."
  ],
  floorPages: {
    1: ["1F: CACHE HALL", "[TIP] \uFFFD\u04FD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD. \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD."],
    2: ["2F: INDEX LIBRARY", "[WARN] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u057B\uFFFD. \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD '\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u0330\uFFFD' \uFFFD\uFFFD\uFFFD\uFFFD\u0121\uFFFD\uFFFD."],
    3: ["3F: PERMISSION GATE", "[INFO] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD. \uFFFD\uFFFD, \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u0532\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD."],
    4: ["4F: ROLLBACK GARDEN", "[WARN] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\xB0\uFFFD \uFFFD\uFFFD\uFFFD\u0177\uFFFD \uFFFD\u01F5\uFFFD\uFFFD\u01B0\uFFFD."]
  },
  bossPages: {
    1: [
      "[KILL] CURATOR terminated.",
      "[DROP] ACCESS TOKEN (LOW)",
      "[VOICE] \uFFFD\u02B4\uFFFD '\uFFFD\uFFFD\xFC'\uFFFD\uFFFD. \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u0339\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u01B4\uFFFD.",
      "[UNLOCK] Door opened: INDEX PATH"
    ],
    2: [
      "[KILL] AUDITOR suspended.",
      "[REPORT] \uFFFD\u01F0\uFFFD: \u023F\uFFFD\uFFFD\uFFFD\uFFFD.",
      "[RULE] ONE SLOT. \uFFFD\uFFFD \uFFFD\uFFFD \uFFFD\u03F3\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD.",
      "[DROP] PARDON KEY / CONFESSION FILE"
    ],
    4: [
      "[KILL] SLOT ...?",
      "[SYSTEM] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD.",
      "[PROMPT] SAVE TARGET: SELF / WORLD / DELETED",
      "[WARNING] \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u03F8\uFFFD \uFFFD\uFFFD\uFFFD\uEFB4\uFFFD\uFFFD. \uFFFD\uFFFD\uFFFD\uEFB2\uFFFD\uFFFD \uFFFD\u0634\xB4\uFFFD."
    ]
  },
  loreLines: [
    "[LOG] \uFFFD\u0537\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD 0.03s. \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u02B8\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD.",
    "[WARN] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u0430\uFFFD \uFFFD\u01B4\u03F6\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u01AE\uFFFD\uFFFD.",
    "[INFO] \uFFFD\uFFFD\uFFFD\u5FE1\uFFFD\uFFFD \uFFFD\u06FC\uFFFD\uFFFD\u06B0\uFFFD \uFFFD\u05B4\uFFFD. \uFFFD\u06FC\uFFFD\uFFFD\u06B4\uFFFD \uFFFD\u5DEF\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u02B4\xB4\uFFFD.",
    "[ERROR] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u06B5\uFFFD: NOT FOUND",
    "[HINT] \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD, \uFFFD\u02B4\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u01B4\u03F6\uFFFD \uFFFD\uFFFD\uFFFD\u03BC\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u0234\uFFFD.",
    "[AUDIT] \uFFFD\u05F0\uFFFD \uFFFD\uFFFD\u0123 \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u01B4\u03F6\uFFFD \uFFFD\uFFFD\u0238\uFFFD\uFFFD.",
    "[NOTE] \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u02B8\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u01B4\u03F4\uFFFD.",
    "[CACHE] \uFFFD\u037C\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD. \uFFFD\u05F8\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u03F4\uFFFD.",
    "[WARN] \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u073E\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u0334\uFFFD.",
    "[LOG] Z\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD, \uFFFD\u02B4\uFFFD \uFFFD\uFFFD \uFFFD\u037C\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD.",
    "[INFO] \uFFFD\u05F0\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD, \uFFFD\uFFFD\uFFFD\xF4\uFFFD \uFFFD\uFFFD\u022E\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD.",
    "[ERROR] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u1F3A \uFFFD\u057B\uFFFD: 12%",
    "[NOTE] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u0338\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u03F8\uFFFD\uFFFD\uFFFD \uFFFD\u01B4\u03F4\uFFFD.",
    "[SYSTEM] \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u2F2D \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u0437\uFFFD\uFFFD\u0234\uFFFD.",
    "[WARN] \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u01AE\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u03F4\uFFFD.",
    "[ALERT] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD \uFFFD\u01B4\u03F4\uFFFD. \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u0334\uFFFD.",
    "[LOG] \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u02B8\uFFFD \uFFFD\u0339\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u07F4\uFFFD.",
    "[INFO] \uFFFD\uFFFD\xA5 \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u0370\uFFFD \uFFFD\u01B4\u03F6\uFFFD \uFFFD\uFFFD\u0122\uFFFD\u0334\uFFFD.",
    "[AUDIT] \uFFFD\u06BA\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u0334\uFFFD.",
    "[ERROR] \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u03B5\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD. (...\uFFFD\u0675\uFFFD \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD?)"
  ]
};
function randSeed() {
  return Math.random() * 4294967295 >>> 0;
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function tileKey(x, y) {
  return `${x},${y}`;
}
function parseTileKey(k) {
  const [sx, sy] = k.split(",");
  return [Number(sx), Number(sy)];
}
function makeSprite(drawFn) {
  const c = document.createElement("canvas");
  c.width = TILE;
  c.height = TILE;
  const s = c.getContext("2d");
  s.imageSmoothingEnabled = false;
  drawFn(s);
  return c;
}
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}
async function loadWasmRuntime() {
  const candidates = ["./rogue.js", "./game.js"];
  let lastError = null;
  for (const src of candidates) {
    try {
      await loadScript(src);
      return;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("WASM runtime script not found.");
}
async function resolveRuntimeModule() {
  const createModule = window.createModule;
  if (typeof createModule === "function") {
    return await createModule({ locateFile: (p) => `./${p}` });
  }
  const mod = window.Module;
  if (!mod) {
    throw new Error("WASM runtime loaded but neither createModule nor Module exists.");
  }
  if (mod.calledRun || mod.runtimeInitialized) {
    return mod;
  }
  return await new Promise((resolve) => {
    const prev = mod.onRuntimeInitialized;
    mod.onRuntimeInitialized = () => {
      if (typeof prev === "function") prev();
      resolve(mod);
    };
  });
}
function buildSprites() {
  const sprites = {};
  sprites.floor = makeSprite((s) => {
    s.fillStyle = "#1a202c";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#222b3a";
    s.fillRect(0, 0, TILE, 2);
    s.fillRect(0, 0, 2, TILE);
    s.fillStyle = "#2d384a";
    for (let i = 2; i < TILE - 2; i += 4) {
      s.fillRect(i, 6 + i % 3, 1, 1);
      s.fillRect((i + 5) % TILE, 12, 1, 1);
    }
  });
  sprites.wall = makeSprite((s) => {
    s.fillStyle = "#10151f";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#2b3647";
    for (let y = 0; y < TILE; y += 4) s.fillRect(0, y, TILE, 1);
    s.fillStyle = "#3e4d66";
    for (let x = 0; x < TILE; x += 6) s.fillRect(x, 0, 1, TILE);
    s.fillStyle = "#1b2433";
    s.fillRect(0, TILE - 2, TILE, 2);
  });
  sprites.player = makeSprite((s) => {
    s.fillStyle = "#000000";
    s.fillRect(4, 2, 8, 13);
    s.fillStyle = "#f4d78a";
    s.fillRect(5, 3, 6, 3);
    s.fillStyle = "#2f3f63";
    s.fillRect(5, 6, 6, 7);
    s.fillStyle = "#64c4ff";
    s.fillRect(5, 8, 6, 3);
    s.fillStyle = "#eaf6ff";
    s.fillRect(6, 4, 1, 1);
    s.fillRect(9, 4, 1, 1);
    s.fillStyle = "#5be2b6";
    s.fillRect(7, 13, 2, 1);
  });
  sprites.enemy = makeSprite((s) => {
    s.fillStyle = "#000000";
    s.fillRect(4, 4, 8, 9);
    s.fillStyle = "#e36b6b";
    s.fillRect(5, 5, 6, 6);
    s.fillStyle = "#ffd1d1";
    s.fillRect(6, 7, 1, 1);
    s.fillRect(9, 7, 1, 1);
  });
  sprites.boss = makeSprite((s) => {
    s.fillStyle = "#000000";
    s.fillRect(2, 2, 12, 12);
    s.fillStyle = "#9a7cff";
    s.fillRect(3, 3, 10, 10);
    s.fillStyle = "#ccbaff";
    s.fillRect(5, 6, 2, 2);
    s.fillRect(9, 6, 2, 2);
    s.fillStyle = "#6e54b8";
    s.fillRect(4, 11, 8, 2);
  });
  return sprites;
}
function drawShadow(ctx, x, y, alpha = 0.3) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(x * TILE + 2, y * TILE + TILE - 4, TILE - 4, 2);
}
function drawIntroMap(canvas, sprites, title = "PIXEL RPG FIELD") {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const grass = makeSprite((s) => {
    s.fillStyle = "#284f2f";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#3d6d3f";
    s.fillRect(0, 0, TILE, 2);
    s.fillStyle = "#4a7f45";
    s.fillRect(2, 6, 1, 2);
    s.fillRect(10, 10, 1, 2);
    s.fillRect(13, 4, 1, 2);
  });
  const path = makeSprite((s) => {
    s.fillStyle = "#7e6b49";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#9a8458";
    s.fillRect(2, 2, 2, 1);
    s.fillRect(10, 7, 1, 2);
    s.fillRect(6, 12, 2, 1);
  });
  const water = makeSprite((s) => {
    s.fillStyle = "#204a7a";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#336aa3";
    s.fillRect(0, 2, TILE, 2);
    s.fillRect(0, 10, TILE, 1);
    s.fillStyle = "#5a8ec4";
    s.fillRect(3, 6, 2, 1);
    s.fillRect(12, 13, 2, 1);
  });
  const tree = makeSprite((s) => {
    s.fillStyle = "#1b2a10";
    s.fillRect(6, 10, 4, 5);
    s.fillStyle = "#2f5f2a";
    s.fillRect(3, 2, 10, 10);
    s.fillStyle = "#4d8a41";
    s.fillRect(5, 4, 6, 6);
  });
  const house = makeSprite((s) => {
    s.fillStyle = "#5a4132";
    s.fillRect(2, 7, 12, 8);
    s.fillStyle = "#a35a3c";
    s.fillRect(1, 4, 14, 4);
    s.fillStyle = "#d2c6a8";
    s.fillRect(7, 10, 2, 5);
    s.fillStyle = "#74a6d6";
    s.fillRect(4, 9, 2, 2);
    s.fillRect(10, 9, 2, 2);
  });
  for (let y = 0; y < VIEW_H; y++) {
    for (let x = 0; x < VIEW_W; x++) {
      ctx.drawImage(grass, x * TILE, y * TILE);
    }
  }
  for (let y = 3; y < 9; y++) {
    for (let x = 1; x < 10; x++) {
      ctx.drawImage(water, x * TILE, y * TILE);
    }
  }
  for (let x = 0; x < VIEW_W; x++) {
    ctx.drawImage(path, x * TILE, 14 * TILE);
    if (x % 7 === 0) ctx.drawImage(path, x * TILE, 13 * TILE);
  }
  for (let y = 9; y < 14; y++) {
    ctx.drawImage(path, 18 * TILE, y * TILE);
    ctx.drawImage(path, 19 * TILE, y * TILE);
  }
  for (let i = 0; i < 24; i++) {
    const x = (i * 7 + 3) % VIEW_W;
    const y = (i * 5 + 2) % VIEW_H;
    if (y < 3 || y > 18 || x > 12 && x < 24 && y > 10 && y < 16) {
      ctx.drawImage(tree, x * TILE, y * TILE);
    }
  }
  ctx.drawImage(house, 28 * TILE, 7 * TILE);
  ctx.drawImage(house, 31 * TILE, 9 * TILE);
  drawShadow(ctx, 20, 14, 0.35);
  ctx.drawImage(sprites.player, 20 * TILE, 14 * TILE);
  const vignette = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    10,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.65
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.32)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(10, 10, 240, 44);
  ctx.strokeStyle = "#ffd24a";
  ctx.strokeRect(10.5, 10.5, 239, 43);
  ctx.fillStyle = "#f6e9a6";
  ctx.font = "bold 14px monospace";
  ctx.fillText(title, 20, 30);
  ctx.fillStyle = "#cfd7e5";
  ctx.font = "11px monospace";
  ctx.fillText("WASM loading...", 20, 46);
}
function App() {
  const canvasRef = (0, import_react5.useRef)(null);
  const runtimeRef = (0, import_react5.useRef)({
    Module: null,
    api: null,
    BOSSES: null,
    STORY: null,
    sprites: buildSprites()
  });
  const [ready, setReady] = (0, import_react5.useState)(false);
  const [loadError, setLoadError] = (0, import_react5.useState)("");
  const [floor, setFloor] = (0, import_react5.useState)(1);
  const [showStart, setShowStart] = (0, import_react5.useState)(true);
  const [hasSave, setHasSave] = (0, import_react5.useState)(() => !!localStorage.getItem(SAVE_KEY));
  const [paused, setPaused] = (0, import_react5.useState)(false);
  const [pauseReason, setPauseReason] = (0, import_react5.useState)("");
  const [toast, setToast] = (0, import_react5.useState)("");
  const [controlPreset, setControlPreset] = (0, import_react5.useState)("wasd");
  const [goalText, setGoalText] = (0, import_react5.useState)(BASE_GOAL_TEXT);
  const [hpText, setHpText] = (0, import_react5.useState)("HP: --/--");
  const [hpRatio, setHpRatio] = (0, import_react5.useState)(1);
  const [bossText, setBossText] = (0, import_react5.useState)("Boss: --/--");
  const [turnText, setTurnText] = (0, import_react5.useState)("Turn: --");
  const [storyEvent, setStoryEvent] = (0, import_react5.useState)(null);
  const [upgradeEvent, setUpgradeEvent] = (0, import_react5.useState)(null);
  const [buildTags, setBuildTags] = (0, import_react5.useState)([]);
  const [deathSummary, setDeathSummary] = (0, import_react5.useState)(null);
  const [cutscenePages, setCutscenePages] = (0, import_react5.useState)(LORE.introPages);
  const [cutsceneIndex, setCutsceneIndex] = (0, import_react5.useState)(0);
  const [showCutscene, setShowCutscene] = (0, import_react5.useState)(true);
  const [logLines, setLogLines] = (0, import_react5.useState)(["\uFFFD\u02B1\uFFFD \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u03F7\uFFFD"]);
  const [fxState, setFxState] = (0, import_react5.useState)({
    hitFlash: 0,
    damageFlash: 0,
    lootFlash: 0,
    spark: null
  });
  const envRef = (0, import_react5.useRef)({
    lastTurn: -1,
    ash: /* @__PURE__ */ new Map(),
    lava: /* @__PURE__ */ new Map(),
    telegraph: /* @__PURE__ */ new Set(),
    pending: /* @__PURE__ */ new Set(),
    spores: /* @__PURE__ */ new Map(),
    freezeUntil: 0,
    ice: (() => {
      const s = /* @__PURE__ */ new Set();
      const rows = [2, 6, 10, 14, 18];
      const cols = [4, 10, 16, 22, 28, 34];
      for (const y of rows) for (let x = 1; x < VIEW_W - 1; x++) s.add(tileKey(x, y));
      for (const x of cols) for (let y = 1; y < VIEW_H - 1; y++) s.add(tileKey(x, y));
      return s;
    })()
  });
  const logText = (0, import_react5.useMemo)(() => logLines.join("\n"), [logLines]);
  const floorMeta = (0, import_react5.useMemo)(() => FLOOR_INFO[floor] || FLOOR_INFO[1], [floor]);
  const toastTimerRef = (0, import_react5.useRef)(null);
  const audioRef = (0, import_react5.useRef)({ ctx: null });
  const damageCauseRef = (0, import_react5.useRef)("");
  const descendRef = (0, import_react5.useRef)({ floor: -1, x: 0, y: 0 });
  const cutsceneQueueRef = (0, import_react5.useRef)([]);
  const prevBossAliveRef = (0, import_react5.useRef)(1);
  const prevFloorRef = (0, import_react5.useRef)(1);
  const logLine = (0, import_react5.useCallback)((line) => {
    setLogLines((prev) => {
      const next = [line, ...prev];
      return next.slice(0, 120);
    });
  }, []);
  const showToast = (0, import_react5.useCallback)((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(""), SAVE_TOAST_MS);
  }, []);
  const playSfx = (0, import_react5.useCallback)((kind) => {
    let ctx = audioRef.current.ctx;
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      ctx = new Ctx();
      audioRef.current.ctx = ctx;
    }
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = kind === "damage" ? "sawtooth" : "square";
    const base = kind === "damage" ? 130 : kind === "loot" ? 520 : 260;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * (kind === "damage" ? 0.62 : 1.45), now + 0.08);
    gain.gain.setValueAtTime(1e-4, now);
    gain.gain.exponentialRampToValueAtTime(kind === "damage" ? 0.06 : 0.045, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(1e-4, now + 0.13);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }, []);
  const emitFx = (0, import_react5.useCallback)((patch) => {
    setFxState((prev) => ({ ...prev, ...patch }));
  }, []);
  const openCutscene = (0, import_react5.useCallback)((pages) => {
    if (!pages || pages.length === 0) return;
    setCutscenePages(pages);
    setCutsceneIndex(0);
    setShowCutscene(true);
  }, []);
  const queueCutscene = (0, import_react5.useCallback)((pages) => {
    if (!pages || pages.length === 0) return;
    if (showCutscene) cutsceneQueueRef.current.push(pages);
    else openCutscene(pages);
  }, [openCutscene, showCutscene]);
  const onCutsceneNext = (0, import_react5.useCallback)(() => {
    if (!showCutscene) return;
    if (cutsceneIndex + 1 < cutscenePages.length) {
      setCutsceneIndex((v) => v + 1);
      return;
    }
    if (cutsceneQueueRef.current.length > 0) {
      const next = cutsceneQueueRef.current.shift();
      openCutscene(next);
      return;
    }
    setShowCutscene(false);
  }, [cutsceneIndex, cutscenePages.length, openCutscene, showCutscene]);
  const hasBit = (0, import_react5.useCallback)((bit) => {
    const api = runtimeRef.current.api;
    if (!api) return false;
    const f = api.story_get_flags() >>> 0;
    return (f >>> bit & 1) === 1;
  }, []);
  const setBit = (0, import_react5.useCallback)((bit) => {
    const api = runtimeRef.current.api;
    if (api) api.story_set_flag_bit(bit);
  }, []);
  const resetEnvironment = (0, import_react5.useCallback)(() => {
    const env = envRef.current;
    env.lastTurn = -1;
    env.ash.clear();
    env.lava.clear();
    env.telegraph.clear();
    env.pending.clear();
    env.spores.clear();
    env.freezeUntil = 0;
  }, []);
  (0, import_react5.useEffect)(() => {
    const id = setInterval(() => {
      setFxState((prev) => {
        const next = {
          hitFlash: Math.max(0, prev.hitFlash - 1),
          damageFlash: Math.max(0, prev.damageFlash - 1),
          lootFlash: Math.max(0, prev.lootFlash - 1),
          spark: prev.spark
        };
        if (next.spark) {
          next.spark = next.spark.life <= 1 ? null : { ...next.spark, life: next.spark.life - 1 };
        }
        return next;
      });
    }, 55);
    return () => clearInterval(id);
  }, []);
  const applyEnvironment = (0, import_react5.useCallback)(() => {
    const api = runtimeRef.current.api;
    if (!api) return;
    const env = envRef.current;
    const turn = api.game_turn();
    if (env.lastTurn === turn) return;
    env.lastTurn = turn;
    for (const [k, ttl] of env.ash) ttl <= 1 ? env.ash.delete(k) : env.ash.set(k, ttl - 1);
    for (const [k, ttl] of env.lava) ttl <= 1 ? env.lava.delete(k) : env.lava.set(k, ttl - 1);
    for (const [k, ttl] of env.spores) ttl <= 1 ? env.spores.delete(k) : env.spores.set(k, ttl - 1);
    const px = api.game_player_x();
    const py = api.game_player_y();
    const pKey = tileKey(px, py);
    if (floor === 1 && turn > 0 && turn % 3 === 0) {
      const vents = [[8, 6], [21, 7], [28, 16], [13, 16]];
      for (const [vx, vy] of vents) {
        if (pKey === tileKey(vx, vy)) api.game_apply_player_damage(1);
        const around = [[vx, vy], [vx + 1, vy], [vx - 1, vy], [vx, vy + 1], [vx, vy - 1]];
        for (const [ax, ay] of around) {
          if (ax >= 0 && ay >= 0 && ax < VIEW_W && ay < VIEW_H) env.ash.set(tileKey(ax, ay), 2);
        }
      }
      logLine("ASH VENT \uFFFD\u07F5\uFFFD: \uFFFD\uFFFD \u0178\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD");
    }
    if (floor === 2) {
      if (env.pending.size > 0) {
        for (const k of env.pending) {
          env.lava.set(k, 1);
          if (k === pKey) api.game_apply_player_damage(2);
        }
        env.pending.clear();
        env.telegraph.clear();
      }
      if (turn > 0 && turn % 2 === 0) {
        const rows = [4, 7, 10, 13, 16];
        const cols = [9, 15, 21, 27, 33];
        const row = rows[turn / 2 % rows.length];
        const col = cols[turn / 3 % cols.length];
        env.telegraph.clear();
        for (let x = 1; x < VIEW_W - 1; x++) env.telegraph.add(tileKey(x, row));
        for (let y = 1; y < VIEW_H - 1; y++) env.telegraph.add(tileKey(col, y));
        env.pending = new Set(env.telegraph);
      }
      if (env.lava.has(pKey)) api.game_apply_player_damage(1);
    }
    if (floor === 3 && turn > 0 && turn % 4 === 0) {
      env.freezeUntil = turn + 2;
      logLine("FREEZE PULSE: \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD");
    }
    if (floor === 4 && turn > 0 && turn % 3 === 0) {
      const hubs = [[9, 6], [29, 6], [11, 16], [31, 16], [20, 6], [20, 16]];
      for (const [x, y] of hubs) {
        const around = [[x, y], [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        for (const [ax, ay] of around) env.spores.set(tileKey(ax, ay), 1);
      }
      if (env.spores.has(pKey)) api.game_apply_player_damage(1);
    }
  }, [floor, logLine]);
  const draw = (0, import_react5.useCallback)(() => {
    const rt = runtimeRef.current;
    const { api, sprites } = rt;
    const canvas = canvasRef.current;
    if (!api || !canvas) return;
    const ctx = canvas.getContext("2d");
    applyEnvironment();
    const w = api.game_w();
    const h2 = api.game_h();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < h2; y++) {
      for (let x = 0; x < w; x++) {
        const t = api.game_tile(x, y);
        ctx.drawImage(t === "#".charCodeAt(0) ? sprites.wall : sprites.floor, x * TILE, y * TILE);
      }
    }
    const env = envRef.current;
    for (const k of env.ash.keys()) {
      const [x, y] = parseTileKey(k);
      ctx.fillStyle = "rgba(160,150,140,0.45)";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
    for (const k of env.telegraph) {
      const [x, y] = parseTileKey(k);
      ctx.fillStyle = "rgba(230,65,49,0.35)";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
    for (const k of env.lava.keys()) {
      const [x, y] = parseTileKey(k);
      ctx.fillStyle = "rgba(255,108,33,0.6)";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
    if (floor === 3 && api.game_turn() < env.freezeUntil) {
      for (const k of env.ice) {
        const [x, y] = parseTileKey(k);
        ctx.fillStyle = "rgba(130,207,255,0.22)";
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
    for (const k of env.spores.keys()) {
      const [x, y] = parseTileKey(k);
      ctx.fillStyle = "rgba(103,189,128,0.35)";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
    const px = api.game_player_x();
    const py = api.game_player_y();
    drawShadow(ctx, px, py);
    ctx.drawImage(sprites.player, px * TILE, py * TILE);
    if (api.game_enemy_alive() === 1) {
      const ex = api.game_enemy_x();
      const ey = api.game_enemy_y();
      drawShadow(ctx, ex, ey, 0.35);
      ctx.drawImage(sprites.enemy, ex * TILE, ey * TILE);
    }
    if (api.game_boss_alive() === 1) {
      const bx = api.game_boss_x();
      const by = api.game_boss_y();
      drawShadow(ctx, bx, by, 0.38);
      ctx.drawImage(sprites.boss, bx * TILE, by * TILE);
    }
    if (floor < 4) {
      const stair = getDescendTile(api);
      const bossDead = api.game_boss_alive() !== 1;
      const onStair = px === stair.x && py === stair.y;
      ctx.fillStyle = bossDead ? "rgba(78,212,147,0.55)" : "rgba(112,126,149,0.4)";
      ctx.fillRect(stair.x * TILE, stair.y * TILE, TILE, TILE);
      ctx.strokeStyle = bossDead ? "#95ffd2" : "#9aa9bf";
      ctx.strokeRect(stair.x * TILE + 1.5, stair.y * TILE + 1.5, TILE - 3, TILE - 3);
      ctx.fillStyle = bossDead ? "#dfffee" : "#d4d9e3";
      ctx.font = "bold 10px monospace";
      ctx.fillText(">", stair.x * TILE + 5, stair.y * TILE + 11);
      const nextGoal = bossDead ? onStair ? "\uFFFD\u2C78 \u0230\uFFFD\uFFFD\u022D: E\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD." : "\uFFFD\uFFFD\uFFFD\uFFFD \xF3\u0121 \uFFFD\u03F7\uFFFD: \uFFFD\u02B7\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \u0178\uFFFD\u03F7\uFFFD \uFFFD\u0335\uFFFD\uFFFD\u03FC\uFFFD\uFFFD\uFFFD." : "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\u01E5: \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \xF3\u0121\uFFFD\uFFFD \uFFFD\u2C78 \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \u0230\uFFFD\uFFFD\u022D\uFFFD\u03FC\uFFFD\uFFFD\uFFFD.";
      setGoalText((prev) => prev === nextGoal ? prev : nextGoal);
    } else {
      const nextGoal = "\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u0534\u03F4\uFFFD. \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \xF3\u0121\uFFFD\u03F0\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u03FC\uFFFD\uFFFD\u03FC\uFFFD\uFFFD\uFFFD.";
      setGoalText((prev) => prev === nextGoal ? prev : nextGoal);
    }
    const vignette = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      10,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.65
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const hp = api.game_player_hp();
    const mhp = api.game_player_maxhp();
    setHpText(`HP: ${hp}/${mhp}`);
    setHpRatio(clamp(hp / Math.max(1, mhp), 0, 1));
    const bossAlive = api.game_boss_alive() === 1;
    const inSpore = floor === 4 && env.spores.has(tileKey(px, py));
    if (bossAlive) {
      if (inSpore) setBossText("Boss: ??? (\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD)");
      else {
        const bhp = api.game_boss_hp();
        const bmhp = api.game_boss_maxhp();
        setBossText(`Boss: ${bhp}/${bmhp}`);
      }
    } else {
      setBossText("Boss: defeated");
    }
    setTurnText(`Turn: ${api.game_turn()}`);
    const currentFloor = clamp(api.game_floor(), 1, 4);
    if (prevFloorRef.current !== currentFloor) {
      prevFloorRef.current = currentFloor;
      queueCutscene(LORE.floorPages[currentFloor] || []);
    }
    const bossAliveNow = api.game_boss_alive();
    if (prevBossAliveRef.current === 1 && bossAliveNow !== 1) {
      queueCutscene(LORE.bossPages[currentFloor] || []);
      showToast("ACCESS GRANTED");
    }
    prevBossAliveRef.current = bossAliveNow;
    if (api.game_turn() > 0 && api.game_turn() % 5 === 0 && Math.random() < 0.2) {
      const line = LORE.loreLines[Math.floor(Math.random() * LORE.loreLines.length)];
      logLine(line);
    }
    if (fxState.hitFlash > 0) {
      ctx.fillStyle = `rgba(255,245,185,${0.1 + fxState.hitFlash * 0.035})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (fxState.lootFlash > 0) {
      ctx.fillStyle = `rgba(94,219,171,${0.06 + fxState.lootFlash * 0.03})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (fxState.damageFlash > 0) {
      const edge = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.2,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.68
      );
      edge.addColorStop(0, "rgba(0,0,0,0)");
      edge.addColorStop(1, `rgba(197,37,37,${0.14 + fxState.damageFlash * 0.05})`);
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (fxState.spark) {
      const { x, y, life } = fxState.spark;
      ctx.fillStyle = `rgba(255,198,115,${0.18 + life * 0.1})`;
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
    if (!storyEvent && rt.STORY) {
      const turn = api.game_turn();
      for (const ev of rt.STORY.events) {
        if (typeof ev.onceBit === "number" && hasBit(ev.onceBit)) continue;
        const trigger = ev.trigger;
        if (!trigger) continue;
        let ok = false;
        if (trigger.type === "TURN_EQ" && turn === trigger.value) ok = true;
        if (trigger.type === "BOSS_DEAD" && api.game_boss_alive() !== 1) ok = true;
        if (trigger.type === "FLOOR_START" && turn === 0) ok = true;
        if (typeof trigger.floor === "number" && trigger.floor !== floor) ok = false;
        if (ok) {
          setStoryEvent(ev);
          break;
        }
      }
    }
  }, [applyEnvironment, floor, fxState, getDescendTile, hasBit, logLine, queueCutscene, showToast, storyEvent]);
  const saveToLocal = (0, import_react5.useCallback)(() => {
    const rt = runtimeRef.current;
    const { api, Module } = rt;
    if (!api || !Module) return;
    const n = api.game_save_size();
    const ptr = Module._malloc(n);
    api.game_save_write(ptr);
    const bytes = Module.HEAPU8.slice(ptr, ptr + n);
    Module._free(ptr);
    const b64 = btoa(String.fromCharCode(...bytes));
    localStorage.setItem(SAVE_KEY, b64);
    setHasSave(true);
    showToast("\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD");
  }, [showToast]);
  const loadFromLocal = (0, import_react5.useCallback)(() => {
    const rt = runtimeRef.current;
    const { api, Module } = rt;
    if (!api || !Module) return false;
    const b64 = localStorage.getItem(SAVE_KEY);
    if (!b64) return false;
    const raw = atob(b64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    const ptr = Module._malloc(bytes.length);
    Module.HEAPU8.set(bytes, ptr);
    const ok = api.game_load_read(ptr, bytes.length);
    Module._free(ptr);
    logLine(ok ? "Loaded save." : "Load failed (version mismatch).");
    if (ok) showToast("\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u04B7\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u03F7\uFFFD");
    setHasSave(!!ok || !!localStorage.getItem(SAVE_KEY));
    return !!ok;
  }, [logLine, showToast]);
  const configureBossForFloor = (0, import_react5.useCallback)((floor2) => {
    const rt = runtimeRef.current;
    const { BOSSES, api } = rt;
    if (!BOSSES || !api) return;
    const boss = BOSSES.bosses.find((x) => x.floor === floor2);
    if (!boss) return;
    api.boss_config_begin(boss.floor, boss.stats.hp, boss.stats.atk);
    for (let i = 0; i < Math.min(3, boss.patterns.length); i++) {
      const p = boss.patterns[i];
      const type = PAT[p.type] ?? 0;
      const cd = p.cooldown ?? 0;
      let p1 = 0;
      let p2 = 0;
      let p3 = 0;
      if (p.type === "CHARGE") {
        p1 = p.steps ?? 2;
        p2 = p.aoeOnCrash ?? 0;
      } else if (p.type === "SLAM") {
        p1 = p.knockback ?? 2;
        p2 = p.bonusDmg ?? 1;
      } else if (p.type === "MARK") {
        p1 = p.delay ?? 1;
        p2 = p.radius ?? 0;
      } else if (p.type === "WIPE_LINE") {
        p1 = p.range ?? 99;
      } else if (p.type === "CROSS") {
        p1 = p.range ?? 6;
      } else if (p.type === "SUMMON") {
        p1 = p.minionHp ?? 6;
        p2 = p.minionAtk ?? 2;
        p3 = p.shieldTurns ?? 1;
      }
      api.boss_config_add_pattern(type, cd, p1, p2, p3);
    }
    const enrage = boss.enrage ?? {};
    api.boss_config_set_enrage(
      enrage.hpPercent ?? 50,
      enrage.cooldownDelta ?? 0,
      enrage.extraMove ?? 0,
      enrage.markRadiusDelta ?? 0,
      enrage.crossRangeDelta ?? 0
    );
    api.boss_config_end();
    api.boss_apply_stats_from_config();
    logLine(`Boss loaded: ${boss.name} (floor ${floor2})`);
  }, [logLine]);
  const getDescendTile = (0, import_react5.useCallback)((api) => {
    const cached = descendRef.current;
    if (cached.floor === floor) return cached;
    const w = api.game_w();
    const h2 = api.game_h();
    let found = { floor, x: w - 2, y: h2 - 2 };
    for (let y = h2 - 2; y >= 1; y--) {
      for (let x = w - 2; x >= 1; x--) {
        if (api.game_tile(x, y) !== "#".charCodeAt(0)) {
          found = { floor, x, y };
          y = -1;
          break;
        }
      }
    }
    descendRef.current = found;
    return found;
  }, [floor]);
  const makeUpgradeChoices = (0, import_react5.useCallback)(() => {
    const pool = [
      { label: "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD", effect: STORY_EFFECTS.atk_1, tag: "ATK", desc: "+1 ATK (\uFFFD\uFFFD\uFFFD\uFFFD)" },
      { label: "\uFFFD\uFFFD\xF6 \uFFFD\uFFFD\uFFFD\uFFFD", effect: STORY_EFFECTS.shield_1, tag: "SHIELD", desc: "\uFFFD\u01F0\uFFFD \uFFFD\uFFFD\u022D" },
      { label: "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u03BD\uFFFD\uFFFD\uFFFD", effect: STORY_EFFECTS.dash_buff, tag: "DASH", desc: "\uFFFD\uFFFD\uFFFD\uFFFD \u023F\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD" },
      { label: "\uFFFD\uFFFD\uFFFD\uFFFD \u0121\uFFFD\uFFFD", effect: STORY_EFFECTS.heal_2, tag: "HEAL", desc: "HP +2" },
      { label: "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD+", effect: STORY_EFFECTS.heal_3, tag: "HEAL", desc: "HP +3" }
    ];
    const picked = [];
    while (picked.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  }, []);
  const inferDamageCause = (0, import_react5.useCallback)((snapshot) => {
    const api = runtimeRef.current.api;
    if (!api) return "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\u022E\uFFFD\uFFFD";
    const px = api.game_player_x();
    const py = api.game_player_y();
    const env = envRef.current;
    const here = tileKey(px, py);
    if (floor === 2 && (env.lava.has(here) || env.pending.has(here) || env.telegraph.has(here))) return "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD";
    if (floor === 4 && env.spores.has(here)) return "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD";
    if (floor === 1 && env.ash.has(here)) return "\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u2C78 \u022D\uFFFD\uFFFD";
    if (api.game_enemy_alive() === 1) {
      const d = Math.abs(api.game_enemy_x() - px) + Math.abs(api.game_enemy_y() - py);
      if (d <= 1) return "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD";
    }
    if (api.game_boss_alive() === 1) {
      const d = Math.abs(api.game_boss_x() - px) + Math.abs(api.game_boss_y() - py);
      if (d <= 2) return "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD";
    }
    if (snapshot.turn <= SAFE_TURN_LIMIT) return "\uFFFD\u02B9\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD";
    return "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u01F4\uFFFD \uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD";
  }, [floor]);
  const stepWithCode = (0, import_react5.useCallback)((code) => {
    const api = runtimeRef.current.api;
    if (!api) return;
    const before = {
      turn: api.game_turn(),
      hp: api.game_player_hp(),
      bossHp: api.game_boss_alive() === 1 ? api.game_boss_hp() : 0,
      enemyAlive: api.game_enemy_alive() === 1,
      px: api.game_player_x(),
      py: api.game_player_y()
    };
    api.game_step(code);
    const after = {
      turn: api.game_turn(),
      hp: api.game_player_hp(),
      bossHp: api.game_boss_alive() === 1 ? api.game_boss_hp() : 0,
      enemyAlive: api.game_enemy_alive() === 1,
      px: api.game_player_x(),
      py: api.game_player_y()
    };
    const tookDamage = after.hp < before.hp;
    const dealtBossDamage = after.bossHp < before.bossHp;
    const killedEnemy = before.enemyAlive && !after.enemyAlive;
    if (dealtBossDamage || killedEnemy) {
      emitFx({
        hitFlash: 4,
        spark: { x: after.px, y: after.py, life: 4 }
      });
      playSfx("hit");
    }
    if (tookDamage) {
      const cause = inferDamageCause(before);
      damageCauseRef.current = cause;
      emitFx({ damageFlash: 5 });
      playSfx("damage");
      logLine(`\uFFFD\u01F0\uFFFD: ${cause}`);
    }
    if (after.hp <= 0) {
      setDeathSummary({
        floor,
        turn: after.turn,
        reason: damageCauseRef.current || "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u033B\uFFFD",
        build: buildTags.length ? buildTags.join(" + ") : "\uFFFD\u2EBB \uFFFD\uFFFD\uFFFD\uFFFD"
      });
    }
    if (after.turn > 0 && after.turn % 6 === 0 && !upgradeEvent && !storyEvent && after.hp > 0) {
      setUpgradeEvent({
        title: "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD",
        subtitle: "\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\u5E26 \uFFFD\uFFFD\u022D\uFFFD\uFFFD \u01AF\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u03F3\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u03FC\uFFFD\uFFFD\uFFFD.",
        choices: makeUpgradeChoices()
      });
      emitFx({ lootFlash: 3 });
      playSfx("loot");
    }
    draw();
    saveToLocal();
  }, [buildTags, draw, emitFx, floor, inferDamageCause, logLine, makeUpgradeChoices, playSfx, saveToLocal, storyEvent, upgradeEvent]);
  const dirToCode = (0, import_react5.useCallback)((dx, dy, dash = false) => {
    if (dx === 0 && dy === -1) return dash ? 5 : 1;
    if (dx === 0 && dy === 1) return dash ? 6 : 2;
    if (dx === -1 && dy === 0) return dash ? 7 : 3;
    if (dx === 1 && dy === 0) return dash ? 8 : 4;
    return 0;
  }, []);
  const tryAutoAttack = (0, import_react5.useCallback)(() => {
    const api = runtimeRef.current.api;
    if (!api) return false;
    const px = api.game_player_x();
    const py = api.game_player_y();
    const candidates = [];
    if (api.game_enemy_alive() === 1) {
      candidates.push({ x: api.game_enemy_x(), y: api.game_enemy_y(), priority: 1 });
    }
    if (api.game_boss_alive() === 1) {
      candidates.push({ x: api.game_boss_x(), y: api.game_boss_y(), priority: 0 });
    }
    candidates.sort((a, b) => a.priority - b.priority);
    for (const t of candidates) {
      const md = Math.abs(t.x - px) + Math.abs(t.y - py);
      if (md !== 1) continue;
      const code = dirToCode(Math.sign(t.x - px), Math.sign(t.y - py), false);
      if (!code) continue;
      stepWithCode(code);
      return true;
    }
    return false;
  }, [dirToCode, stepWithCode]);
  const stepToward = (0, import_react5.useCallback)((tx, ty, dash = false) => {
    const api = runtimeRef.current.api;
    if (!api) return;
    const px = api.game_player_x();
    const py = api.game_player_y();
    const ddx = tx - px;
    const ddy = ty - py;
    if (ddx === 0 && ddy === 0) {
      tryAutoAttack();
      return;
    }
    let dx = 0;
    let dy = 0;
    if (Math.abs(ddx) >= Math.abs(ddy)) dx = Math.sign(ddx);
    else dy = Math.sign(ddy);
    const code = dirToCode(dx, dy, dash);
    if (code) stepWithCode(code);
  }, [dirToCode, stepWithCode, tryAutoAttack]);
  const inputToCode = (0, import_react5.useCallback)((key, code, shift) => {
    const dash = shift ? 4 : 0;
    const isUp = key === "ArrowUp" || key === "w" || key === "W" || code === "KeyW";
    const isDown = key === "ArrowDown" || key === "s" || key === "S" || code === "KeyS";
    const isLeft = key === "ArrowLeft" || key === "a" || key === "A" || code === "KeyA";
    const isRight = key === "ArrowRight" || key === "d" || key === "D" || code === "KeyD";
    if (isUp) return 1 + dash;
    if (isDown) return 2 + dash;
    if (isLeft) return 3 + dash;
    if (isRight) return 4 + dash;
    return 0;
  }, []);
  const tryInteract = (0, import_react5.useCallback)(() => {
    const api = runtimeRef.current.api;
    if (!api || floor >= 4) return false;
    if (api.game_boss_alive() === 1) {
      showToast("\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \xF3\u0121\uFFFD\u063E\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u03F4\uFFFD.");
      return false;
    }
    const stair = getDescendTile(api);
    const onStair = api.game_player_x() === stair.x && api.game_player_y() === stair.y;
    if (!onStair) {
      showToast("\uFFFD\u02B7\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \u0178\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD E\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD.");
      return false;
    }
    onNextFloor();
    return true;
  }, [floor, getDescendTile, showToast]);
  const normalizeCodeWithEnvironment = (0, import_react5.useCallback)((code) => {
    const api = runtimeRef.current.api;
    if (!api || !code) return code;
    const px = api.game_player_x();
    const py = api.game_player_y();
    const here = tileKey(px, py);
    const env = envRef.current;
    if (floor === 1 && code >= 5 && env.ash.has(here)) {
      logLine("\uFFFD\uFFFD \u0178\uFFFD\uFFFD: \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD");
      return code - 4;
    }
    if (floor === 3 && code >= 1 && code <= 4 && api.game_turn() < env.freezeUntil && env.ice.has(here)) {
      return code + 4;
    }
    return code;
  }, [floor, logLine]);
  const onNewRun = (0, import_react5.useCallback)(() => {
    const api = runtimeRef.current.api;
    if (!api) return;
    resetEnvironment();
    api.game_new(randSeed());
    api.story_apply_effect(STORY_EFFECTS.shield_1);
    configureBossForFloor(1);
    setFloor(1);
    setStoryEvent(null);
    setUpgradeEvent(null);
    setBuildTags([]);
    setDeathSummary(null);
    damageCauseRef.current = "";
    prevFloorRef.current = 1;
    prevBossAliveRef.current = 1;
    setShowStart(false);
    cutsceneQueueRef.current = [];
    queueCutscene(LORE.floorPages[1]);
    logLine("\uFFFD\u02B9\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD: \uFFFD\u2EBB \uFFFD\uFFFD\u0223\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD");
    draw();
    saveToLocal();
  }, [configureBossForFloor, draw, logLine, queueCutscene, resetEnvironment, saveToLocal]);
  const onContinue = (0, import_react5.useCallback)(() => {
    const api = runtimeRef.current.api;
    if (!api) return;
    resetEnvironment();
    const ok = loadFromLocal();
    if (!ok) {
      logLine("No save. Starting new run.");
      api.game_new(randSeed());
      configureBossForFloor(1);
      setFloor(1);
    } else {
      const f = clamp(api.game_floor(), 1, 4);
      configureBossForFloor(f);
      setFloor(f);
    }
    setStoryEvent(null);
    setUpgradeEvent(null);
    setDeathSummary(null);
    setShowStart(false);
    cutsceneQueueRef.current = [];
    queueCutscene(LORE.floorPages[clamp(api.game_floor(), 1, 4)]);
    draw();
  }, [configureBossForFloor, draw, loadFromLocal, logLine, queueCutscene, resetEnvironment]);
  const onStartRun = (0, import_react5.useCallback)(() => {
    if (!ready) return;
    if (hasSave) onContinue();
    else onNewRun();
  }, [hasSave, onContinue, onNewRun, ready]);
  const onNextFloor = (0, import_react5.useCallback)(() => {
    const api = runtimeRef.current.api;
    if (!api) return;
    if (api.game_boss_alive() === 1) return;
    const next = clamp(floor + 1, 1, 4);
    if (next === floor) return;
    resetEnvironment();
    api.game_set_floor(next, randSeed(), 1);
    configureBossForFloor(next);
    setFloor(next);
    setStoryEvent(null);
    setUpgradeEvent(null);
    prevFloorRef.current = next;
    prevBossAliveRef.current = 1;
    logLine(`\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\u0335\uFFFD: Floor ${next}`);
    queueCutscene(LORE.floorPages[next] || []);
    draw();
    saveToLocal();
  }, [configureBossForFloor, draw, floor, logLine, queueCutscene, resetEnvironment, saveToLocal]);
  const onClear = (0, import_react5.useCallback)(() => {
    localStorage.removeItem(SAVE_KEY);
    logLine("Save cleared.");
    setHasSave(false);
    showToast("\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD");
  }, [logLine, showToast]);
  const onStoryChoice = (0, import_react5.useCallback)((choice) => {
    const api = runtimeRef.current.api;
    if (!api) return;
    const effectId = typeof choice.effect === "number" ? choice.effect : STORY_EFFECTS[choice.effect] ?? 0;
    if (effectId > 0) api.story_apply_effect(effectId);
    if (typeof choice.setBit === "number") setBit(choice.setBit);
    if (choice.log) logLine(choice.log);
    setStoryEvent(null);
    draw();
    saveToLocal();
  }, [draw, logLine, saveToLocal, setBit]);
  const onUpgradeChoice = (0, import_react5.useCallback)((choice) => {
    const api = runtimeRef.current.api;
    if (!api || !choice) return;
    if (choice.effect) api.story_apply_effect(choice.effect);
    if (choice.tag) {
      setBuildTags((prev) => {
        const next = [...prev, choice.tag];
        return next.slice(-6);
      });
    }
    logLine(`\u0239\uFFFD\uFFFD: ${choice.label} (${choice.desc})`);
    emitFx({ lootFlash: 5 });
    playSfx("loot");
    setUpgradeEvent(null);
    draw();
    saveToLocal();
  }, [draw, emitFx, logLine, playSfx, saveToLocal]);
  const onCopyResult = (0, import_react5.useCallback)(async () => {
    if (!deathSummary) return;
    const text = [
      "[HEART DIVER RUN]",
      `Floor: ${deathSummary.floor}`,
      `Turn: ${deathSummary.turn}`,
      `Build: ${deathSummary.build}`,
      `Death: ${deathSummary.reason}`
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      showToast("\uFFFD\uFFFD\uFFFD\uFFFD \u012B\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD");
    } catch {
      showToast("\u016C\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD");
    }
  }, [deathSummary, showToast]);
  (0, import_react5.useEffect)(() => {
    drawIntroMap(canvasRef.current, runtimeRef.current.sprites);
  }, []);
  (0, import_react5.useEffect)(() => {
    let disposed = false;
    async function boot() {
      try {
        await loadWasmRuntime();
        if (disposed) return;
        const Module = await resolveRuntimeModule();
        if (disposed) return;
        const api = {
          game_new: Module.cwrap("game_new", null, ["number"]),
          game_set_floor: Module.cwrap("game_set_floor", null, ["number", "number", "number"]),
          game_w: Module.cwrap("game_w", "number", []),
          game_h: Module.cwrap("game_h", "number", []),
          game_floor: Module.cwrap("game_floor", "number", []),
          game_tile: Module.cwrap("game_tile", "number", ["number", "number"]),
          game_player_x: Module.cwrap("game_player_x", "number", []),
          game_player_y: Module.cwrap("game_player_y", "number", []),
          game_player_hp: Module.cwrap("game_player_hp", "number", []),
          game_player_maxhp: Module.cwrap("game_player_maxhp", "number", []),
          game_turn: Module.cwrap("game_turn", "number", []),
          game_step: Module.cwrap("game_step", null, ["number"]),
          game_enemy_alive: Module.cwrap("game_enemy_alive", "number", []),
          game_boss_alive: Module.cwrap("game_boss_alive", "number", []),
          game_boss_hp: Module.cwrap("game_boss_hp", "number", []),
          game_boss_maxhp: Module.cwrap("game_boss_maxhp", "number", []),
          game_enemy_x: Module.cwrap("game_enemy_x", "number", []),
          game_enemy_y: Module.cwrap("game_enemy_y", "number", []),
          game_boss_x: Module.cwrap("game_boss_x", "number", []),
          game_boss_y: Module.cwrap("game_boss_y", "number", []),
          game_apply_player_damage: Module.cwrap("game_apply_player_damage", null, ["number"]),
          game_save_size: Module.cwrap("game_save_size", "number", []),
          game_save_write: Module.cwrap("game_save_write", null, ["number"]),
          game_load_read: Module.cwrap("game_load_read", "number", ["number", "number"]),
          story_get_flags: Module.cwrap("story_get_flags", "number", []),
          story_set_flag_bit: Module.cwrap("story_set_flag_bit", null, ["number"]),
          story_apply_effect: Module.cwrap("story_apply_effect", null, ["number"]),
          boss_config_begin: Module.cwrap("boss_config_begin", null, ["number", "number", "number"]),
          boss_config_add_pattern: Module.cwrap("boss_config_add_pattern", null, ["number", "number", "number", "number", "number"]),
          boss_config_set_enrage: Module.cwrap("boss_config_set_enrage", null, ["number", "number", "number", "number", "number"]),
          boss_config_end: Module.cwrap("boss_config_end", null, []),
          boss_apply_stats_from_config: Module.cwrap("boss_apply_stats_from_config", null, [])
        };
        const [bosses, story] = await Promise.all([
          fetch("./bosses.json").then((r) => r.json()),
          fetch("./story.json").then((r) => r.json())
        ]);
        runtimeRef.current.Module = Module;
        runtimeRef.current.api = api;
        runtimeRef.current.BOSSES = bosses;
        runtimeRef.current.STORY = story;
        if (!loadFromLocal()) {
          api.game_new(randSeed());
          configureBossForFloor(1);
          setFloor(1);
        } else {
          const f = clamp(api.game_floor(), 1, 4);
          configureBossForFloor(f);
          setFloor(f);
        }
        setReady(true);
        draw();
        logLine("Ready.");
      } catch (err) {
        if (disposed) return;
        setLoadError(err?.message || String(err));
        logLine("Game load failed.");
      }
    }
    boot();
    return () => {
      disposed = true;
    };
  }, [configureBossForFloor, draw, loadFromLocal, logLine]);
  (0, import_react5.useEffect)(() => {
    function onKeyDown(e) {
      if (showCutscene && (e.key === "z" || e.key === "Z" || e.code === "KeyZ")) {
        e.preventDefault();
        onCutsceneNext();
        return;
      }
      if (!runtimeRef.current.api || !ready || upgradeEvent || deathSummary || paused || showStart || showCutscene) return;
      if (e.key === " " || e.key === "f" || e.key === "F") {
        e.preventDefault();
        tryAutoAttack();
        return;
      }
      if (e.key === "e" || e.key === "E" || e.code === "KeyE") {
        e.preventDefault();
        tryInteract();
        return;
      }
      const code = normalizeCodeWithEnvironment(inputToCode(e.key, e.code, e.shiftKey));
      if (!code) return;
      e.preventDefault();
      stepWithCode(code);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deathSummary, inputToCode, normalizeCodeWithEnvironment, onCutsceneNext, paused, ready, showCutscene, showStart, stepWithCode, tryAutoAttack, tryInteract, upgradeEvent]);
  (0, import_react5.useEffect)(() => {
    const canvas = canvasRef.current;
    if (!canvas) return void 0;
    function onPointerDown(e) {
      if (!runtimeRef.current.api || !ready || upgradeEvent || deathSummary || paused || showStart || showCutscene) return;
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width;
      const sy = canvas.height / rect.height;
      const tx = clamp(Math.floor((e.clientX - rect.left) * sx / TILE), 0, VIEW_W - 1);
      const ty = clamp(Math.floor((e.clientY - rect.top) * sy / TILE), 0, VIEW_H - 1);
      stepToward(tx, ty, e.shiftKey);
    }
    canvas.addEventListener("pointerdown", onPointerDown);
    return () => canvas.removeEventListener("pointerdown", onPointerDown);
  }, [deathSummary, paused, ready, showCutscene, showStart, stepToward, upgradeEvent]);
  (0, import_react5.useEffect)(() => {
    function pauseByFocus() {
      if (!ready || showStart || deathSummary) return;
      setPaused(true);
      setPauseReason("\uFFFD\uFFFD\u013F\uFFFD\uFFFD \uFFFD\u01BF\uFFFD: \uFFFD\u03FD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD");
    }
    function onVisibility() {
      if (document.hidden) pauseByFocus();
    }
    window.addEventListener("blur", pauseByFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", pauseByFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [deathSummary, ready, showStart]);
  (0, import_react5.useEffect)(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);
  const storyBody = storyEvent ? [
    h("div", { key: "story-text" }, storyEvent.text),
    h(
      "div",
      { key: "story-choice", className: "choiceRow" },
      storyEvent.choices.map(
        (choice, idx) => h(
          "button",
          {
            key: `${choice.label}-${idx}`,
            className: idx === 0 ? "primary" : "",
            onClick: () => onStoryChoice(choice)
          },
          choice.label
        )
      )
    )
  ] : h(
    "div",
    { className: "mutedText" },
    ready ? "\uFFFD\u033A\uFFFD\u01AE \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD\u03F8\uFFFD \uFFFD\uFFFD\uFFFD\u4E2E\uFFFD\uFFFD \u01E5\uFFFD\xF5\u02F4\u03F4\uFFFD." : "WASM \uFFFD\u03B5\uFFFD \uFFFD\uFFFD..."
  );
  const cutsceneText = cutscenePages[cutsceneIndex] || "";
  return h(
    import_react5.default.Fragment,
    null,
    h(HeaderBar, {
      controlPreset,
      setControlPreset,
      controlPresets: CONTROL_PRESETS
    }),
    h(
      "main",
      { className: "layout" },
      h(
        "section",
        { className: "panel" },
        h(
          "div",
          { className: "gameStage" },
          h("canvas", { ref: canvasRef, width: 640, height: 352 }),
          h(GameOverlays, {
            showStart,
            ready,
            hasSave,
            onStartRun,
            paused,
            pauseReason,
            setPaused,
            upgradeEvent,
            onUpgradeChoice,
            deathSummary,
            onCopyResult,
            onNewRun,
            goalText: BASE_GOAL_TEXT,
            runLoopText: RUN_LOOP_TEXT,
            archiveHook: ARCHIVE_HOOK,
            showCutscene,
            cutsceneText,
            onCutsceneNext
          })
        ),
        h(HudBar, {
          hpText,
          hpRatio,
          bossText,
          turnText,
          floor,
          floorMeta,
          goalText
        }),
        h(
          "div",
          { className: "buttons" },
          h("button", { onClick: onNewRun, disabled: !ready }, "New Run"),
          h("button", { onClick: onContinue, disabled: !ready }, "Continue"),
          h("button", { onClick: onNextFloor, disabled: !(ready && runtimeRef.current.api?.game_boss_alive() === 0 && floor < 4) }, "Next Floor"),
          h("button", { onClick: () => setPaused((v) => !v), disabled: !ready || showStart }, paused ? "Resume" : "Pause"),
          h("button", { onClick: onClear }, "Clear Save")
        ),
        loadError ? h("div", { className: "loadError" }, `Game load failed: ${loadError}`) : null
      ),
      h(SidePanels, { floorMeta, buildTags, storyBody, logText, archiveHook: ARCHIVE_HOOK })
    ),
    toast ? h("div", { className: "toast" }, toast) : null
  );
}
export {
  App as default
};
/*! Bundled license information:

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
