(function(){
'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */





// Get the environment info
var $env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
var $g =
  (typeof $env["global"] === "object" && $env["global"])
    ? $env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
$env["global"] = $g;

// Where to send exports



var $e =
  (typeof $env["exportsNamespace"] === "object" && $env["exportsNamespace"])
    ? $env["exportsNamespace"] : $g;

$env["exportsNamespace"] = $e;

// Freeze the environment info
$g["Object"]["freeze"]($env);

// Linking info - must be in sync with scala.scalajs.runtime.LinkingInfo
var $linkingInfo = {
  "envInfo": $env,
  "semantics": {




    "asInstanceOfs": 1,










    "moduleInit": 2,





    "strictFloats": false,




    "productionMode": false

  },



  "assumingES6": false,

  "linkerVersion": "0.6.13"
};
$g["Object"]["freeze"]($linkingInfo);
$g["Object"]["freeze"]($linkingInfo["semantics"]);

// Snapshots of builtins and polyfills






var $imul = $g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

var $fround = $g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });


var $clz32 = $g["Math"]["clz32"] || (function(i) {
  // See Hacker's Delight, Section 5-3
  if (i === 0) return 32;
  var r = 1;
  if ((i & 0xffff0000) === 0) { i <<= 16; r += 16; };
  if ((i & 0xff000000) === 0) { i <<= 8; r += 8; };
  if ((i & 0xf0000000) === 0) { i <<= 4; r += 4; };
  if ((i & 0xc0000000) === 0) { i <<= 2; r += 2; };
  return r + (i >> 31);
});


// Other fields

















var $lastIDHash = 0; // last value attributed to an id hash code



var $idHashCodeMap = $g["WeakMap"] ? new $g["WeakMap"]() : null;



// Core mechanism

var $makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


var $makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      $throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
var $propertyName = function(obj) {
  for (var prop in obj)
    return prop;
};

// Runtime functions

var $isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


var $throwClassCastException = function(instance, classFullName) {




  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

var $throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  $throwClassCastException(instance, classArrayEncodedName);
};


var $noIsInstance = function(instance) {
  throw new $g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

var $makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

var $newArrayObject = function(arrayClassData, lengths) {
  return $newArrayObjectInternal(arrayClassData, lengths, 0);
};

var $newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = $newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

var $objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

var $objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return $d_T.getClassOf();
    case "number": {
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if ($isByte(v))
          return $d_jl_Byte.getClassOf();
        else if ($isShort(v))
          return $d_jl_Short.getClassOf();
        else
          return $d_jl_Integer.getClassOf();
      } else {
        if ($isFloat(instance))
          return $d_jl_Float.getClassOf();
        else
          return $d_jl_Double.getClassOf();
      }
    }
    case "boolean":
      return $d_jl_Boolean.getClassOf();
    case "undefined":
      return $d_sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        return instance.getClass__jl_Class();
      else if ($is_sjsr_RuntimeLong(instance))
        return $d_jl_Long.getClassOf();
      else if ($isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

var $objectClone = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new $c_jl_CloneNotSupportedException().init___();
};

var $objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

var $objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

var $objectFinalize = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

var $objectEquals = function(instance, rhs) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && $numberEquals(instance, rhs);
  else
    return instance === rhs;
};

var $numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

var $objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return $m_sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return $m_sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if ($isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();

      else if ($idHashCodeMap === null)
        return 42;

      else
        return $systemIdentityHashCode(instance);
  }
};

var $comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      $as_T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      $as_jl_Number(rhs);

      return $m_jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      $asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

var $charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return $uI(instance["length"]);



  else
    return instance.length__I();
};

var $charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return $uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

var $charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return $as_T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

var $booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

var $numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
var $numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
var $numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
var $numberLongValue = function(instance) {
  if (typeof instance === "number")
    return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
var $numberFloatValue = function(instance) {
  if (typeof instance === "number") return $fround(instance);
  else                              return instance.floatValue__F();
};
var $numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

var $isNaN = function(instance) {
  return instance !== instance;
};

var $isInfinite = function(instance) {
  return !$g["isFinite"](instance) && !$isNaN(instance);
};

var $doubleToInt = function(x) {
  return (x > 2147483647) ? (2147483647) : ((x < -2147483648) ? -2147483648 : (x | 0));
};

/** Instantiates a JS object with variadic arguments to the constructor. */
var $newJSObjectWithVarargs = function(ctor, args) {
  // This basically emulates the ECMAScript specification for 'new'.
  var instance = $g["Object"]["create"](ctor.prototype);
  var result = ctor["apply"](instance, args);
  switch (typeof result) {
    case "string": case "number": case "boolean": case "undefined": case "symbol":
      return instance;
    default:
      return result === null ? instance : result;
  }
};

var $resolveSuperRef = function(initialProto, propName) {
  var getPrototypeOf = $g["Object"]["getPrototypeOf"];
  var getOwnPropertyDescriptor = $g["Object"]["getOwnPropertyDescriptor"];

  var superProto = getPrototypeOf(initialProto);
  while (superProto !== null) {
    var desc = getOwnPropertyDescriptor(superProto, propName);
    if (desc !== void 0)
      return desc;
    superProto = getPrototypeOf(superProto);
  }

  return void 0;
};

var $superGet = function(initialProto, self, propName) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var getter = desc["get"];
    if (getter !== void 0)
      return getter["call"](self);
    else
      return desc["value"];
  }
  return void 0;
};

var $superSet = function(initialProto, self, propName, value) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var setter = desc["set"];
    if (setter !== void 0) {
      setter["call"](self, value);
      return void 0;
    }
  }
  throw new $g["TypeError"]("super has no setter '" + propName + "'.");
};







var $propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

var $systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;
  if (srcu !== destu || destPos < srcPos || srcPos + length < destPos) {
    for (var i = 0; i < length; i++)
      destu[destPos+i] = srcu[srcPos+i];
  } else {
    for (var i = length-1; i >= 0; i--)
      destu[destPos+i] = srcu[srcPos+i];
  }
};

var $systemIdentityHashCode =

  ($idHashCodeMap !== null) ?

  (function(obj) {
    switch (typeof obj) {
      case "string": case "number": case "boolean": case "undefined":
        return $objectHashCode(obj);
      default:
        if (obj === null) {
          return 0;
        } else {
          var hash = $idHashCodeMap["get"](obj);
          if (hash === void 0) {
            hash = ($lastIDHash + 1) | 0;
            $lastIDHash = hash;
            $idHashCodeMap["set"](obj, hash);
          }
          return hash;
        }
    }

  }) :
  (function(obj) {
    if ($isScalaJSObject(obj)) {
      var hash = obj["$idHashCode$0"];
      if (hash !== void 0) {
        return hash;
      } else if (!$g["Object"]["isSealed"](obj)) {
        hash = ($lastIDHash + 1) | 0;
        $lastIDHash = hash;
        obj["$idHashCode$0"] = hash;
        return hash;
      } else {
        return 42;
      }
    } else if (obj === null) {
      return 0;
    } else {
      return $objectHashCode(obj);
    }

  });

// is/as for hijacked boxed classes (the non-trivial ones)

var $isByte = function(v) {
  return (v << 24 >> 24) === v && 1/v !== 1/-0;
};

var $isShort = function(v) {
  return (v << 16 >> 16) === v && 1/v !== 1/-0;
};

var $isInt = function(v) {
  return (v | 0) === v && 1/v !== 1/-0;
};

var $isFloat = function(v) {



  return typeof v === "number";

};


var $asUnit = function(v) {
  if (v === void 0 || v === null)
    return v;
  else
    $throwClassCastException(v, "scala.runtime.BoxedUnit");
};

var $asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Boolean");
};

var $asByte = function(v) {
  if ($isByte(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Byte");
};

var $asShort = function(v) {
  if ($isShort(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Short");
};

var $asInt = function(v) {
  if ($isInt(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Integer");
};

var $asFloat = function(v) {
  if ($isFloat(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Float");
};

var $asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Double");
};


// Unboxes


var $uZ = function(value) {
  return !!$asBoolean(value);
};
var $uB = function(value) {
  return $asByte(value) | 0;
};
var $uS = function(value) {
  return $asShort(value) | 0;
};
var $uI = function(value) {
  return $asInt(value) | 0;
};
var $uJ = function(value) {
  return null === value ? $m_sjsr_RuntimeLong$().Zero$1
                        : $as_sjsr_RuntimeLong(value);
};
var $uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float.
   */
  return +$asFloat(value);
};
var $uD = function(value) {
  return +$asDouble(value);
};






// TypeArray conversions

var $byteArray2TypedArray = function(value) { return new $g["Int8Array"](value.u); };
var $shortArray2TypedArray = function(value) { return new $g["Int16Array"](value.u); };
var $charArray2TypedArray = function(value) { return new $g["Uint16Array"](value.u); };
var $intArray2TypedArray = function(value) { return new $g["Int32Array"](value.u); };
var $floatArray2TypedArray = function(value) { return new $g["Float32Array"](value.u); };
var $doubleArray2TypedArray = function(value) { return new $g["Float64Array"](value.u); };

var $typedArray2ByteArray = function(value) {
  var arrayClassData = $d_B.getArrayOf();
  return new arrayClassData.constr(new $g["Int8Array"](value));
};
var $typedArray2ShortArray = function(value) {
  var arrayClassData = $d_S.getArrayOf();
  return new arrayClassData.constr(new $g["Int16Array"](value));
};
var $typedArray2CharArray = function(value) {
  var arrayClassData = $d_C.getArrayOf();
  return new arrayClassData.constr(new $g["Uint16Array"](value));
};
var $typedArray2IntArray = function(value) {
  var arrayClassData = $d_I.getArrayOf();
  return new arrayClassData.constr(new $g["Int32Array"](value));
};
var $typedArray2FloatArray = function(value) {
  var arrayClassData = $d_F.getArrayOf();
  return new arrayClassData.constr(new $g["Float32Array"](value));
};
var $typedArray2DoubleArray = function(value) {
  var arrayClassData = $d_D.getArrayOf();
  return new arrayClassData.constr(new $g["Float64Array"](value));
};

/* We have to force a non-elidable *read* of $e, otherwise Closure will
 * eliminate it altogether, along with all the exports, which is ... er ...
 * plain wrong.
 */
this["__ScalaJSExportsNamespace"] = $e;

// TypeData class


/** @constructor */
var $TypeData = function() {




  // Runtime support
  this.constr = void 0;
  this.parentData = void 0;
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = void 0;
  this._arrayOf = void 0;
  this.isArrayOf = void 0;

  // java.lang.Class support
  this["name"] = "";
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isRawJSType"] = false;
  this["isInstance"] = void 0;
};


$TypeData.prototype.initPrim = function(



    zero, arrayEncodedName, displayName) {
  // Runtime support
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInstance"] = function(obj) { return false; };

  return this;
};


$TypeData.prototype.initClass = function(



    internalNameObj, isInterface, fullName,
    ancestors, isRawJSType, parentData, isInstance, isArrayOf) {
  var internalName = $propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.arrayEncodedName = "L"+fullName+";";
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isInterface"] = isInterface;
  this["isRawJSType"] = !!isRawJSType;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.initArray = function(



    componentData) {
  // The constructor

  var componentZero0 = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  var componentZero = (componentZero0 == "longZero")
    ? $m_sjsr_RuntimeLong$().Zero$1
    : componentZero0;


  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new $h_O;
  ArrayClass.prototype.constructor = ArrayClass;

  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(new this.u.constructor(this.u));
  };

























  ArrayClass.prototype.$classData = this;

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var arrayDepth = componentData.arrayDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = $d_O;
  this.ancestors = {O: 1, jl_Cloneable: 1, Ljava_io_Serializable: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.getClassOf = function() {



  if (!this._classOf)
    this._classOf = new $c_jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};


$TypeData.prototype.getArrayOf = function() {



  if (!this._arrayOf)
    this._arrayOf = new $TypeData().initArray(this);
  return this._arrayOf;
};

// java.lang.Class support


$TypeData.prototype["getFakeInstance"] = function() {



  if (this === $d_T)
    return "some string";
  else if (this === $d_jl_Boolean)
    return false;
  else if (this === $d_jl_Byte ||
           this === $d_jl_Short ||
           this === $d_jl_Integer ||
           this === $d_jl_Float ||
           this === $d_jl_Double)
    return 0;
  else if (this === $d_jl_Long)
    return $m_sjsr_RuntimeLong$().Zero$1;
  else if (this === $d_sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};


$TypeData.prototype["getSuperclass"] = function() {



  return this.parentData ? this.parentData.getClassOf() : null;
};


$TypeData.prototype["getComponentType"] = function() {



  return this.componentData ? this.componentData.getClassOf() : null;
};


$TypeData.prototype["newArrayOfThisClass"] = function(lengths) {



  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return $newArrayObject(arrayClassData, lengths);
};




// Create primitive types

var $d_V = new $TypeData().initPrim(undefined, "V", "void");
var $d_Z = new $TypeData().initPrim(false, "Z", "boolean");
var $d_C = new $TypeData().initPrim(0, "C", "char");
var $d_B = new $TypeData().initPrim(0, "B", "byte");
var $d_S = new $TypeData().initPrim(0, "S", "short");
var $d_I = new $TypeData().initPrim(0, "I", "int");
var $d_J = new $TypeData().initPrim("longZero", "J", "long");
var $d_F = new $TypeData().initPrim(0.0, "F", "float");
var $d_D = new $TypeData().initPrim(0.0, "D", "double");

// Instance tests for array of primitives

var $isArrayOf_Z = $makeIsArrayOfPrimitive($d_Z);
$d_Z.isArrayOf = $isArrayOf_Z;

var $isArrayOf_C = $makeIsArrayOfPrimitive($d_C);
$d_C.isArrayOf = $isArrayOf_C;

var $isArrayOf_B = $makeIsArrayOfPrimitive($d_B);
$d_B.isArrayOf = $isArrayOf_B;

var $isArrayOf_S = $makeIsArrayOfPrimitive($d_S);
$d_S.isArrayOf = $isArrayOf_S;

var $isArrayOf_I = $makeIsArrayOfPrimitive($d_I);
$d_I.isArrayOf = $isArrayOf_I;

var $isArrayOf_J = $makeIsArrayOfPrimitive($d_J);
$d_J.isArrayOf = $isArrayOf_J;

var $isArrayOf_F = $makeIsArrayOfPrimitive($d_F);
$d_F.isArrayOf = $isArrayOf_F;

var $isArrayOf_D = $makeIsArrayOfPrimitive($d_D);
$d_D.isArrayOf = $isArrayOf_D;


// asInstanceOfs for array of primitives
var $asArrayOf_Z = $makeAsArrayOfPrimitive($isArrayOf_Z, "Z");
var $asArrayOf_C = $makeAsArrayOfPrimitive($isArrayOf_C, "C");
var $asArrayOf_B = $makeAsArrayOfPrimitive($isArrayOf_B, "B");
var $asArrayOf_S = $makeAsArrayOfPrimitive($isArrayOf_S, "S");
var $asArrayOf_I = $makeAsArrayOfPrimitive($isArrayOf_I, "I");
var $asArrayOf_J = $makeAsArrayOfPrimitive($isArrayOf_J, "J");
var $asArrayOf_F = $makeAsArrayOfPrimitive($isArrayOf_F, "F");
var $asArrayOf_D = $makeAsArrayOfPrimitive($isArrayOf_D, "D");

function $f_Lsgl_GameLoopProvider__gameLoopStep__J__Lsgl_GraphicsProvider$AbstractCanvas__V($thiz, dt, canvas) {
  canvas.clearRect__I__I__I__I__V(0, 0, canvas.width__I(), canvas.height__I());
  var this$1 = $as_Lsgl_GameStateComponent($thiz).gameState$1;
  var currentScreen = $as_Lsgl_GameStateComponent$GameScreen(this$1.screens$1.head__O());
  var this$2 = $as_Lsgl_GameStateComponent($thiz).gameState$1;
  var this$3 = this$2.screens$1;
  var b = new $c_scm_ListBuffer().init___();
  var these = this$3;
  while (true) {
    if ((!these.isEmpty__Z())) {
      var arg1 = these.head__O();
      var x$1 = $as_Lsgl_GameStateComponent$GameScreen(arg1);
      var jsx$1 = (!x$1.isOpaque$1)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      b.$$plus$eq__O__scm_ListBuffer(these.head__O());
      var this$4 = these;
      these = this$4.tail__sci_List()
    } else {
      break
    }
  };
  var renderedScreens = b.toList__sci_List().reverse__sci_List();
  var this$5 = $as_Lsgl_GameStateComponent($thiz).gameState$1;
  var this$6 = this$5.screens$1;
  inlinereturn$12: {
    var these$1 = this$6;
    while ((!these$1.isEmpty__Z())) {
      var arg1$1 = these$1.head__O();
      var x$2 = $as_Lsgl_GameStateComponent$GameScreen(arg1$1);
      if (x$2.isOpaque$1) {
        var lastOpaqueScreen = new $c_s_Some().init___O(these$1.head__O());
        break inlinereturn$12
      };
      these$1 = $as_sc_LinearSeqOptimized(these$1.tail__O())
    };
    var lastOpaqueScreen = $m_s_None$()
  };
  currentScreen.update__J__V(dt);
  if ((!lastOpaqueScreen.isEmpty__Z())) {
    var arg1$2 = lastOpaqueScreen.get__O();
    var screen = $as_Lsgl_GameStateComponent$GameScreen(arg1$2);
    screen.render__Lsgl_GraphicsProvider$AbstractCanvas__V(canvas)
  };
  var these$2 = renderedScreens;
  while ((!these$2.isEmpty__Z())) {
    var arg1$3 = these$2.head__O();
    var screen$3 = $as_Lsgl_GameStateComponent$GameScreen(arg1$3);
    screen$3.render__Lsgl_GraphicsProvider$AbstractCanvas__V(canvas);
    var this$7 = these$2;
    these$2 = this$7.tail__sci_List()
  }
}
function $f_Lsgl_GameLoopProvider__$$init$__V($thiz) {
  $thiz.Fps$1 = new $c_s_Some().init___O(40)
}
function $f_Lsgl_GameStateComponent__$$init$__V($thiz) {
  $thiz.gameState$1 = new $c_Lsgl_GameStateComponent$GameState().init___Lsgl_GameStateComponent($thiz)
}
function $is_Lsgl_GameStateComponent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_GameStateComponent)))
}
function $as_Lsgl_GameStateComponent(obj) {
  return (($is_Lsgl_GameStateComponent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.GameStateComponent"))
}
function $isArrayOf_Lsgl_GameStateComponent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_GameStateComponent)))
}
function $asArrayOf_Lsgl_GameStateComponent(obj, depth) {
  return (($isArrayOf_Lsgl_GameStateComponent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.GameStateComponent;", depth))
}
function $is_Lsgl_GraphicsHelpersComponent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_GraphicsHelpersComponent)))
}
function $as_Lsgl_GraphicsHelpersComponent(obj) {
  return (($is_Lsgl_GraphicsHelpersComponent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.GraphicsHelpersComponent"))
}
function $isArrayOf_Lsgl_GraphicsHelpersComponent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_GraphicsHelpersComponent)))
}
function $asArrayOf_Lsgl_GraphicsHelpersComponent(obj, depth) {
  return (($isArrayOf_Lsgl_GraphicsHelpersComponent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.GraphicsHelpersComponent;", depth))
}
function $is_Lsgl_InputProvider(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_InputProvider)))
}
function $as_Lsgl_InputProvider(obj) {
  return (($is_Lsgl_InputProvider(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.InputProvider"))
}
function $isArrayOf_Lsgl_InputProvider(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_InputProvider)))
}
function $asArrayOf_Lsgl_InputProvider(obj, depth) {
  return (($isArrayOf_Lsgl_InputProvider(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.InputProvider;", depth))
}
function $is_Lsgl_InputProvider$Input$InputEvent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_InputProvider$Input$InputEvent)))
}
function $as_Lsgl_InputProvider$Input$InputEvent(obj) {
  return (($is_Lsgl_InputProvider$Input$InputEvent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.InputProvider$Input$InputEvent"))
}
function $isArrayOf_Lsgl_InputProvider$Input$InputEvent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_InputProvider$Input$InputEvent)))
}
function $asArrayOf_Lsgl_InputProvider$Input$InputEvent(obj, depth) {
  return (($isArrayOf_Lsgl_InputProvider$Input$InputEvent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.InputProvider$Input$InputEvent;", depth))
}
function $is_Lsgl_InputProvider$Input$Keys$Key(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_InputProvider$Input$Keys$Key)))
}
function $as_Lsgl_InputProvider$Input$Keys$Key(obj) {
  return (($is_Lsgl_InputProvider$Input$Keys$Key(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.InputProvider$Input$Keys$Key"))
}
function $isArrayOf_Lsgl_InputProvider$Input$Keys$Key(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_InputProvider$Input$Keys$Key)))
}
function $asArrayOf_Lsgl_InputProvider$Input$Keys$Key(obj, depth) {
  return (($isArrayOf_Lsgl_InputProvider$Input$Keys$Key(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.InputProvider$Input$Keys$Key;", depth))
}
function $f_Lsgl_WindowProvider__dp2px__I__I($thiz, x) {
  return $doubleToInt($fround(x))
}
function $is_Lsgl_WindowProvider(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_WindowProvider)))
}
function $as_Lsgl_WindowProvider(obj) {
  return (($is_Lsgl_WindowProvider(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.WindowProvider"))
}
function $isArrayOf_Lsgl_WindowProvider(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_WindowProvider)))
}
function $asArrayOf_Lsgl_WindowProvider(obj, depth) {
  return (($isArrayOf_Lsgl_WindowProvider(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.WindowProvider;", depth))
}
function $is_Lsgl_scene_SceneGraphComponent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_scene_SceneGraphComponent)))
}
function $as_Lsgl_scene_SceneGraphComponent(obj) {
  return (($is_Lsgl_scene_SceneGraphComponent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.scene.SceneGraphComponent"))
}
function $isArrayOf_Lsgl_scene_SceneGraphComponent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_scene_SceneGraphComponent)))
}
function $asArrayOf_Lsgl_scene_SceneGraphComponent(obj, depth) {
  return (($isArrayOf_Lsgl_scene_SceneGraphComponent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.scene.SceneGraphComponent;", depth))
}
function $is_Lsgl_util_LoggingProvider(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_util_LoggingProvider)))
}
function $as_Lsgl_util_LoggingProvider(obj) {
  return (($is_Lsgl_util_LoggingProvider(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.util.LoggingProvider"))
}
function $isArrayOf_Lsgl_util_LoggingProvider(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_util_LoggingProvider)))
}
function $asArrayOf_Lsgl_util_LoggingProvider(obj, depth) {
  return (($isArrayOf_Lsgl_util_LoggingProvider(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.util.LoggingProvider;", depth))
}
/** @constructor */
function $c_O() {
  /*<skip>*/
}
/** @constructor */
function $h_O() {
  /*<skip>*/
}
$h_O.prototype = $c_O.prototype;
$c_O.prototype.init___ = (function() {
  return this
});
$c_O.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_O.prototype.toString__T = (function() {
  var jsx$2 = $objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = $uD((i >>> 0));
  var jsx$1 = x.toString(16);
  return ((jsx$2 + "@") + $as_T(jsx$1))
});
$c_O.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
$c_O.prototype.toString = (function() {
  return this.toString__T()
});
function $is_O(obj) {
  return (obj !== null)
}
function $as_O(obj) {
  return obj
}
function $isArrayOf_O(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase.isPrimitive)))
  }
}
function $asArrayOf_O(obj, depth) {
  return (($isArrayOf_O(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Object;", depth))
}
var $d_O = new $TypeData().initClass({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), (void 0), $is_O, $isArrayOf_O);
$c_O.prototype.$classData = $d_O;
function $f_s_Proxy__equals__O__Z($thiz, that) {
  return ((that !== null) && (((that === $thiz) || (that === $thiz.self$1)) || $objectEquals(that, $thiz.self$1)))
}
function $f_s_Proxy__toString__T($thiz) {
  return ("" + $thiz.self$1)
}
function $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable($thiz) {
  var this$1 = $m_s_util_control_NoStackTrace$();
  if (this$1.$$undnoSuppression$1) {
    return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call($thiz)
  } else {
    return $as_jl_Throwable($thiz)
  }
}
function $is_sc_GenTraversableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversableOnce)))
}
function $as_sc_GenTraversableOnce(obj) {
  return (($is_sc_GenTraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversableOnce"))
}
function $isArrayOf_sc_GenTraversableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversableOnce)))
}
function $asArrayOf_sc_GenTraversableOnce(obj, depth) {
  return (($isArrayOf_sc_GenTraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversableOnce;", depth))
}
function $f_sci_VectorPointer__copyOf__AO__AO($thiz, a) {
  var b = $newArrayObject($d_O.getArrayOf(), [a.u.length]);
  var length = a.u.length;
  $systemArraycopy(a, 0, b, 0, length);
  return b
}
function $f_sci_VectorPointer__gotoNextBlockStart__I__I__V($thiz, index, xor) {
  if ((xor < 1024)) {
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().u[(31 & (index >> 5))], 1))
  } else if ((xor < 32768)) {
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().u[(31 & (index >> 10))], 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().u[0], 1))
  } else if ((xor < 1048576)) {
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().u[(31 & (index >> 15))], 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().u[0], 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().u[0], 1))
  } else if ((xor < 33554432)) {
    $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().u[(31 & (index >> 20))], 1));
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().u[0], 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().u[0], 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().u[0], 1))
  } else if ((xor < 1073741824)) {
    $thiz.display4$und$eq__AO__V($asArrayOf_O($thiz.display5__AO().u[(31 & (index >> 25))], 1));
    $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().u[0], 1));
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().u[0], 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().u[0], 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().u[0], 1))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__getElem__I__I__O($thiz, index, xor) {
  if ((xor < 32)) {
    return $thiz.display0__AO().u[(31 & index)]
  } else if ((xor < 1024)) {
    return $asArrayOf_O($thiz.display1__AO().u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 32768)) {
    return $asArrayOf_O($asArrayOf_O($thiz.display2__AO().u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 1048576)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display3__AO().u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 33554432)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display4__AO().u[(31 & (index >> 20))], 1).u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 1073741824)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display5__AO().u[(31 & (index >> 25))], 1).u[(31 & (index >> 20))], 1).u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__gotoPos__I__I__V($thiz, index, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 32768)) {
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().u[(31 & (index >> 10))], 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 1048576)) {
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().u[(31 & (index >> 15))], 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().u[(31 & (index >> 10))], 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 33554432)) {
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().u[(31 & (index >> 20))], 1));
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().u[(31 & (index >> 15))], 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().u[(31 & (index >> 10))], 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 1073741824)) {
      $thiz.display4$und$eq__AO__V($asArrayOf_O($thiz.display5__AO().u[(31 & (index >> 25))], 1));
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().u[(31 & (index >> 20))], 1));
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().u[(31 & (index >> 15))], 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().u[(31 & (index >> 10))], 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().u[(31 & (index >> 5))], 1))
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
}
function $f_sci_VectorPointer__stabilize__I__V($thiz, index) {
  var x1 = (((-1) + $thiz.depth__I()) | 0);
  switch (x1) {
    case 5: {
      var a = $thiz.display5__AO();
      $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a));
      var a$1 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
      var a$2 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
      var a$3 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
      var a$4 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
      $thiz.display5__AO().u[(31 & (index >> 25))] = $thiz.display4__AO();
      $thiz.display4__AO().u[(31 & (index >> 20))] = $thiz.display3__AO();
      $thiz.display3__AO().u[(31 & (index >> 15))] = $thiz.display2__AO();
      $thiz.display2__AO().u[(31 & (index >> 10))] = $thiz.display1__AO();
      $thiz.display1__AO().u[(31 & (index >> 5))] = $thiz.display0__AO();
      break
    }
    case 4: {
      var a$5 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
      var a$6 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$6));
      var a$7 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$7));
      var a$8 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$8));
      $thiz.display4__AO().u[(31 & (index >> 20))] = $thiz.display3__AO();
      $thiz.display3__AO().u[(31 & (index >> 15))] = $thiz.display2__AO();
      $thiz.display2__AO().u[(31 & (index >> 10))] = $thiz.display1__AO();
      $thiz.display1__AO().u[(31 & (index >> 5))] = $thiz.display0__AO();
      break
    }
    case 3: {
      var a$9 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$9));
      var a$10 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$10));
      var a$11 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$11));
      $thiz.display3__AO().u[(31 & (index >> 15))] = $thiz.display2__AO();
      $thiz.display2__AO().u[(31 & (index >> 10))] = $thiz.display1__AO();
      $thiz.display1__AO().u[(31 & (index >> 5))] = $thiz.display0__AO();
      break
    }
    case 2: {
      var a$12 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$12));
      var a$13 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$13));
      $thiz.display2__AO().u[(31 & (index >> 10))] = $thiz.display1__AO();
      $thiz.display1__AO().u[(31 & (index >> 5))] = $thiz.display0__AO();
      break
    }
    case 1: {
      var a$14 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$14));
      $thiz.display1__AO().u[(31 & (index >> 5))] = $thiz.display0__AO();
      break
    }
    case 0: {
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $f_sci_VectorPointer__gotoNextBlockStartWritable__I__I__V($thiz, index, xor) {
  if ((xor < 1024)) {
    if (($thiz.depth__I() === 1)) {
      $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display1__AO().u[0] = $thiz.display0__AO();
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().u[(31 & (index >> 5))] = $thiz.display0__AO()
  } else if ((xor < 32768)) {
    if (($thiz.depth__I() === 2)) {
      $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display2__AO().u[0] = $thiz.display1__AO();
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().u[(31 & (index >> 5))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & (index >> 10))] = $thiz.display1__AO()
  } else if ((xor < 1048576)) {
    if (($thiz.depth__I() === 3)) {
      $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display3__AO().u[0] = $thiz.display2__AO();
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().u[(31 & (index >> 5))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & (index >> 10))] = $thiz.display1__AO();
    $thiz.display3__AO().u[(31 & (index >> 15))] = $thiz.display2__AO()
  } else if ((xor < 33554432)) {
    if (($thiz.depth__I() === 4)) {
      $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display4__AO().u[0] = $thiz.display3__AO();
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().u[(31 & (index >> 5))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & (index >> 10))] = $thiz.display1__AO();
    $thiz.display3__AO().u[(31 & (index >> 15))] = $thiz.display2__AO();
    $thiz.display4__AO().u[(31 & (index >> 20))] = $thiz.display3__AO()
  } else if ((xor < 1073741824)) {
    if (($thiz.depth__I() === 5)) {
      $thiz.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display5__AO().u[0] = $thiz.display4__AO();
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().u[(31 & (index >> 5))] = $thiz.display0__AO();
    $thiz.display2__AO().u[(31 & (index >> 10))] = $thiz.display1__AO();
    $thiz.display3__AO().u[(31 & (index >> 15))] = $thiz.display2__AO();
    $thiz.display4__AO().u[(31 & (index >> 20))] = $thiz.display3__AO();
    $thiz.display5__AO().u[(31 & (index >> 25))] = $thiz.display4__AO()
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V($thiz, that, depth) {
  $thiz.depth$und$eq__I__V(depth);
  var x1 = (((-1) + depth) | 0);
  switch (x1) {
    case (-1): {
      break
    }
    case 0: {
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 1: {
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 2: {
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 3: {
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 4: {
      $thiz.display4$und$eq__AO__V(that.display4__AO());
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 5: {
      $thiz.display5$und$eq__AO__V(that.display5__AO());
      $thiz.display4$und$eq__AO__V(that.display4__AO());
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
/** @constructor */
function $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud() {
  $c_O.call(this);
  this.sceneGraph$1 = null;
  this.group$1 = null;
  this.groupBackground$1 = null;
  this.titleLabel$1 = null;
  this.scoreLabel$1 = null;
  this.com$regblanc$scalavator$core$MainScreenComponent$Hud$$textPaint$1 = null;
  this.$$outer$1 = null
}
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud.prototype = new $h_O();
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud.prototype.constructor = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud;
/** @constructor */
function $h_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud() {
  /*<skip>*/
}
$h_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud.prototype = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud.prototype;
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud.prototype.init___Lcom_regblanc_scalavator_core_MainScreenComponent = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  var jsx$2 = $as_Lsgl_scene_SceneGraphComponent($$outer);
  var this$1 = $as_Lsgl_WindowProvider($$outer);
  var jsx$1 = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$1);
  var this$2 = $as_Lsgl_WindowProvider($$outer);
  this.sceneGraph$1 = new $c_Lsgl_scene_SceneGraphComponent$SceneGraph().init___Lsgl_scene_SceneGraphComponent__I__I(jsx$2, jsx$1, $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$2));
  var jsx$4 = $as_Lsgl_scene_SceneGraphComponent($$outer);
  var this$3 = $as_Lsgl_WindowProvider($$outer);
  var jsx$3 = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$3);
  var this$4 = $as_Lsgl_WindowProvider($$outer);
  this.group$1 = new $c_Lsgl_scene_SceneGraphComponent$SceneGroup().init___Lsgl_scene_SceneGraphComponent__F__F__F__F(jsx$4, 0.0, 0.0, $fround(jsx$3), $fround($f_Lsgl_WindowProvider__dp2px__I__I(this$4, 40)));
  this.groupBackground$1 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground().init___Lcom_regblanc_scalavator_core_MainScreenComponent$Hud(this);
  this.titleLabel$1 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel().init___Lcom_regblanc_scalavator_core_MainScreenComponent$Hud(this);
  this.scoreLabel$1 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel().init___Lcom_regblanc_scalavator_core_MainScreenComponent$Hud(this);
  this.group$1.addNode__Lsgl_scene_SceneGraphComponent$SceneNode__V(this.groupBackground$1);
  this.group$1.addNode__Lsgl_scene_SceneGraphComponent$SceneNode__V(this.titleLabel$1);
  this.group$1.addNode__Lsgl_scene_SceneGraphComponent$SceneNode__V(this.scoreLabel$1);
  var this$5 = this.sceneGraph$1;
  var node = this.group$1;
  this$5.root$1.addNode__Lsgl_scene_SceneGraphComponent$SceneNode__V(node);
  var this$6 = $as_Lsgl_GraphicsProvider($$outer);
  var this$9 = $f_Lsgl_html5_Html5GraphicsProvider__defaultPaint__Lsgl_html5_Html5GraphicsProvider$Html5Paint(this$6);
  var this$7 = $as_Lsgl_GraphicsProvider($$outer);
  var this$8 = this$7.Color$1;
  var color = this$8.rgb__I__I__I__T(255, 255, 255);
  var this$14 = this$9.withColor__T__Lsgl_html5_Html5GraphicsProvider$Html5Paint(color);
  var this$10 = $as_Lsgl_GraphicsProvider($$outer);
  var this$11 = this$10.Font$1;
  var this$13 = this$11.Default__Lsgl_html5_Html5GraphicsProvider$Html5Font();
  var this$12 = $as_Lsgl_WindowProvider($$outer);
  var size = $f_Lsgl_WindowProvider__dp2px__I__I(this$12, 18);
  var font = this$13.withSize__I__Lsgl_html5_Html5GraphicsProvider$Html5Font(size);
  var color$1 = this$14.color$1;
  var alignment = this$14.alignment$1;
  this.com$regblanc$scalavator$core$MainScreenComponent$Hud$$textPaint$1 = new $c_Lsgl_html5_Html5GraphicsProvider$Html5Paint().init___Lsgl_html5_Html5GraphicsProvider__Lsgl_html5_Html5GraphicsProvider$Html5Font__T__Lsgl_GraphicsProvider$Alignments$Alignment(this$14.$$outer$1, font, color$1, alignment);
  return this
});
var $d_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud = new $TypeData().initClass({
  Lcom_regblanc_scalavator_core_MainScreenComponent$Hud: 0
}, false, "com.regblanc.scalavator.core.MainScreenComponent$Hud", {
  Lcom_regblanc_scalavator_core_MainScreenComponent$Hud: 1,
  O: 1
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud.prototype.$classData = $d_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud;
/** @constructor */
function $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation() {
  $c_O.call(this);
  this.$$undcurrentAnimation$1 = null;
  this.elapsed$1 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  this.$$outer$1 = null
}
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation.prototype = new $h_O();
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation.prototype.constructor = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation;
/** @constructor */
function $h_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation() {
  /*<skip>*/
}
$h_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation.prototype = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation.prototype;
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation.prototype.currentAnimation$und$eq__Lsgl_GraphicsHelpersComponent$Animation__V = (function(animation) {
  this.$$undcurrentAnimation$1 = animation;
  this.elapsed$1 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong()
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation.prototype.update__J__V = (function(dt) {
  var t = this.elapsed$1;
  var lo = t.lo$2;
  var hi = t.hi$2;
  var bhi = dt.hi$2;
  var lo$1 = ((lo + dt.lo$2) | 0);
  var hi$1 = ((((-2147483648) ^ lo$1) < ((-2147483648) ^ lo)) ? ((1 + ((hi + bhi) | 0)) | 0) : ((hi + bhi) | 0));
  this.elapsed$1 = new $c_sjsr_RuntimeLong().init___I__I(lo$1, hi$1)
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation.prototype.init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.$$undcurrentAnimation$1 = $$outer.com$regblanc$scalavator$core$MainScreenComponent$MainScreen$$CharacterIdleAnimation$2;
  this.elapsed$1 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  return this
});
var $d_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation = new $TypeData().initClass({
  Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation: 0
}, false, "com.regblanc.scalavator.core.MainScreenComponent$MainScreen$CharacterAnimation", {
  Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation: 1,
  O: 1
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation.prototype.$classData = $d_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation;
/** @constructor */
function $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform() {
  $c_O.call(this);
  this.x$1 = 0.0;
  this.y$1 = 0.0;
  this.width$1 = 0;
  this.speed$1 = 0.0;
  this.$$outer$1 = null
}
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform.prototype = new $h_O();
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform.prototype.constructor = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform;
/** @constructor */
function $h_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform() {
  /*<skip>*/
}
$h_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform.prototype = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform.prototype;
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform.prototype.toString__T = (function() {
  return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Platform(", ", ", ") with speed ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.x$1, this.y$1, this.speed$1]))
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform.prototype.update__J__V = (function(dt) {
  this.x$1 = (this.x$1 + (this.speed$1 * ($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(dt.lo$2, dt.hi$2) / 1000.0)));
  var jsx$2 = this.x$1;
  var jsx$1 = this.width$1;
  var this$1 = $as_Lsgl_WindowProvider(this.$$outer$1.$$outer$2);
  if (((jsx$2 + jsx$1) > $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$1))) {
    var this$2 = $as_Lsgl_WindowProvider(this.$$outer$1.$$outer$2);
    this.x$1 = (($f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$2) - this.width$1) | 0);
    this.speed$1 = (-this.speed$1)
  } else if ((this.x$1 < 0)) {
    this.x$1 = 0.0;
    this.speed$1 = (-this.speed$1)
  }
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform.prototype.render__Lsgl_GraphicsProvider$AbstractCanvas__V = (function(canvas) {
  var x = $doubleToInt(this.x$1);
  var y = $doubleToInt(this.y$1);
  var width = this.width$1;
  var height = this.$$outer$1.com$regblanc$scalavator$core$MainScreenComponent$MainScreen$$PlatformHeight$2;
  var this$1 = $as_Lsgl_GraphicsProvider(this.$$outer$1.$$outer$2);
  var this$4 = $f_Lsgl_html5_Html5GraphicsProvider__defaultPaint__Lsgl_html5_Html5GraphicsProvider$Html5Paint(this$1);
  var this$2 = $as_Lsgl_GraphicsProvider(this.$$outer$1.$$outer$2);
  var this$3 = this$2.Color$1;
  var color = this$3.rgb__I__I__I__T(0, 0, 255);
  var paint = this$4.withColor__T__Lsgl_html5_Html5GraphicsProvider$Html5Paint(color);
  canvas.drawRect__I__I__I__I__Lsgl_html5_Html5GraphicsProvider$Html5Paint__V(x, y, width, height, paint)
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform.prototype.init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen__D__D__I__D = (function($$outer, x, y, width, speed) {
  this.x$1 = x;
  this.y$1 = y;
  this.width$1 = width;
  this.speed$1 = speed;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
function $is_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform)))
}
function $as_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(obj) {
  return (($is_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "com.regblanc.scalavator.core.MainScreenComponent$MainScreen$Platform"))
}
function $isArrayOf_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform)))
}
function $asArrayOf_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(obj, depth) {
  return (($isArrayOf_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lcom.regblanc.scalavator.core.MainScreenComponent$MainScreen$Platform;", depth))
}
var $d_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform = new $TypeData().initClass({
  Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform: 0
}, false, "com.regblanc.scalavator.core.MainScreenComponent$MainScreen$Platform", {
  Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform: 1,
  O: 1
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform.prototype.$classData = $d_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform;
/** @constructor */
function $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$.prototype = new $h_O();
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$.prototype.constructor = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$;
/** @constructor */
function $h_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$() {
  /*<skip>*/
}
$h_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$.prototype = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$.prototype;
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$.prototype.random__D__Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform = (function(y) {
  var this$2 = $as_Lsgl_WindowProvider(this.$$outer$1.$$outer$2);
  var this$1 = $m_s_util_Random$();
  var x = ((50 + this$1.self$1.nextInt__I__I(40)) | 0);
  var width = $f_Lsgl_WindowProvider__dp2px__I__I(this$2, x);
  var this$4 = $m_s_util_Random$();
  var this$3 = $as_Lsgl_WindowProvider(this.$$outer$1.$$outer$2);
  var n = (($f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$3) - width) | 0);
  var x$1 = this$4.self$1.nextInt__I__I(n);
  var this$6 = $as_Lsgl_WindowProvider(this.$$outer$1.$$outer$2);
  var this$5 = $m_s_util_Random$();
  var x$2 = ((80 + this$5.self$1.nextInt__I__I(50)) | 0);
  var speed = $f_Lsgl_WindowProvider__dp2px__I__I(this$6, x$2);
  return new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform().init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen__D__D__I__D(this.$$outer$1, x$1, y, width, speed)
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$.prototype.init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$ = new $TypeData().initClass({
  Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$: 0
}, false, "com.regblanc.scalavator.core.MainScreenComponent$MainScreen$Platform$", {
  Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$: 1,
  O: 1
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$.prototype.$classData = $d_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$;
/** @constructor */
function $c_Lorg_scalajs_dom_package$() {
  $c_O.call(this);
  this.ApplicationCache$1 = null;
  this.Blob$1 = null;
  this.BlobPropertyBag$1 = null;
  this.ClipboardEventInit$1 = null;
  this.DOMException$1 = null;
  this.Event$1 = null;
  this.EventException$1 = null;
  this.EventSource$1 = null;
  this.FileReader$1 = null;
  this.FormData$1 = null;
  this.KeyboardEvent$1 = null;
  this.MediaError$1 = null;
  this.MutationEvent$1 = null;
  this.MutationObserverInit$1 = null;
  this.Node$1 = null;
  this.NodeFilter$1 = null;
  this.PerformanceNavigation$1 = null;
  this.PositionError$1 = null;
  this.Range$1 = null;
  this.TextEvent$1 = null;
  this.TextTrack$1 = null;
  this.URL$1 = null;
  this.VisibilityState$1 = null;
  this.WebSocket$1 = null;
  this.WheelEvent$1 = null;
  this.XMLHttpRequest$1 = null;
  this.XPathResult$1 = null;
  this.window$1 = null;
  this.document$1 = null;
  this.console$1 = null;
  this.bitmap$0$1 = 0
}
$c_Lorg_scalajs_dom_package$.prototype = new $h_O();
$c_Lorg_scalajs_dom_package$.prototype.constructor = $c_Lorg_scalajs_dom_package$;
/** @constructor */
function $h_Lorg_scalajs_dom_package$() {
  /*<skip>*/
}
$h_Lorg_scalajs_dom_package$.prototype = $c_Lorg_scalajs_dom_package$.prototype;
$c_Lorg_scalajs_dom_package$.prototype.init___ = (function() {
  return this
});
$c_Lorg_scalajs_dom_package$.prototype.document__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  return (((268435456 & this.bitmap$0$1) === 0) ? this.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument() : this.document$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window__Lorg_scalajs_dom_raw_Window = (function() {
  return (((134217728 & this.bitmap$0$1) === 0) ? this.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window() : this.window$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window = (function() {
  if (((134217728 & this.bitmap$0$1) === 0)) {
    this.window$1 = $g;
    this.bitmap$0$1 = (134217728 | this.bitmap$0$1)
  };
  return this.window$1
});
$c_Lorg_scalajs_dom_package$.prototype.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  if (((268435456 & this.bitmap$0$1) === 0)) {
    this.document$1 = this.window__Lorg_scalajs_dom_raw_Window().document;
    this.bitmap$0$1 = (268435456 | this.bitmap$0$1)
  };
  return this.document$1
});
var $d_Lorg_scalajs_dom_package$ = new $TypeData().initClass({
  Lorg_scalajs_dom_package$: 0
}, false, "org.scalajs.dom.package$", {
  Lorg_scalajs_dom_package$: 1,
  O: 1
});
$c_Lorg_scalajs_dom_package$.prototype.$classData = $d_Lorg_scalajs_dom_package$;
var $n_Lorg_scalajs_dom_package$ = (void 0);
function $m_Lorg_scalajs_dom_package$() {
  if ((!$n_Lorg_scalajs_dom_package$)) {
    $n_Lorg_scalajs_dom_package$ = new $c_Lorg_scalajs_dom_package$().init___()
  };
  return $n_Lorg_scalajs_dom_package$
}
/** @constructor */
function $c_Lsgl_GameStateComponent$GameScreen() {
  $c_O.call(this);
  this.isOpaque$1 = false;
  this.$$outer$1 = null
}
$c_Lsgl_GameStateComponent$GameScreen.prototype = new $h_O();
$c_Lsgl_GameStateComponent$GameScreen.prototype.constructor = $c_Lsgl_GameStateComponent$GameScreen;
/** @constructor */
function $h_Lsgl_GameStateComponent$GameScreen() {
  /*<skip>*/
}
$h_Lsgl_GameStateComponent$GameScreen.prototype = $c_Lsgl_GameStateComponent$GameScreen.prototype;
$c_Lsgl_GameStateComponent$GameScreen.prototype.init___Lsgl_GameStateComponent = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.isOpaque$1 = false;
  return this
});
function $is_Lsgl_GameStateComponent$GameScreen(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_GameStateComponent$GameScreen)))
}
function $as_Lsgl_GameStateComponent$GameScreen(obj) {
  return (($is_Lsgl_GameStateComponent$GameScreen(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.GameStateComponent$GameScreen"))
}
function $isArrayOf_Lsgl_GameStateComponent$GameScreen(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_GameStateComponent$GameScreen)))
}
function $asArrayOf_Lsgl_GameStateComponent$GameScreen(obj, depth) {
  return (($isArrayOf_Lsgl_GameStateComponent$GameScreen(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.GameStateComponent$GameScreen;", depth))
}
/** @constructor */
function $c_Lsgl_GameStateComponent$GameState() {
  $c_O.call(this);
  this.screens$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_GameStateComponent$GameState.prototype = new $h_O();
$c_Lsgl_GameStateComponent$GameState.prototype.constructor = $c_Lsgl_GameStateComponent$GameState;
/** @constructor */
function $h_Lsgl_GameStateComponent$GameState() {
  /*<skip>*/
}
$h_Lsgl_GameStateComponent$GameState.prototype = $c_Lsgl_GameStateComponent$GameState.prototype;
$c_Lsgl_GameStateComponent$GameState.prototype.newScreen__Lsgl_GameStateComponent$GameScreen__V = (function(screen) {
  $m_sci_List$();
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([screen]);
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  this.screens$1 = $as_sci_List($f_sc_TraversableLike__to__scg_CanBuildFrom__O(xs, cbf))
});
$c_Lsgl_GameStateComponent$GameState.prototype.init___Lsgl_GameStateComponent = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.screens$1 = $m_sci_Nil$();
  return this
});
var $d_Lsgl_GameStateComponent$GameState = new $TypeData().initClass({
  Lsgl_GameStateComponent$GameState: 0
}, false, "sgl.GameStateComponent$GameState", {
  Lsgl_GameStateComponent$GameState: 1,
  O: 1
});
$c_Lsgl_GameStateComponent$GameState.prototype.$classData = $d_Lsgl_GameStateComponent$GameState;
/** @constructor */
function $c_Lsgl_GraphicsHelpersComponent$Animation() {
  $c_O.call(this);
  this.frameDuration$1 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  this.frames$1 = null;
  this.playMode$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_GraphicsHelpersComponent$Animation.prototype = new $h_O();
$c_Lsgl_GraphicsHelpersComponent$Animation.prototype.constructor = $c_Lsgl_GraphicsHelpersComponent$Animation;
/** @constructor */
function $h_Lsgl_GraphicsHelpersComponent$Animation() {
  /*<skip>*/
}
$h_Lsgl_GraphicsHelpersComponent$Animation.prototype = $c_Lsgl_GraphicsHelpersComponent$Animation.prototype;
$c_Lsgl_GraphicsHelpersComponent$Animation.prototype.init___Lsgl_GraphicsProvider__J__ALsgl_GraphicsHelpersComponent$BitmapRegion__Lsgl_GraphicsHelpersComponent$Animation$PlayMode = (function($$outer, frameDuration, frames, playMode) {
  this.frameDuration$1 = frameDuration;
  this.frames$1 = frames;
  this.playMode$1 = playMode;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_Lsgl_GraphicsHelpersComponent$Animation.prototype.currentFrame__J__Lsgl_GraphicsHelpersComponent$BitmapRegion = (function(time) {
  var b = this.frameDuration$1;
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.divideImpl__I__I__I__I__I(time.lo$2, time.hi$2, b.lo$2, b.hi$2);
  var hi = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
  var this$2 = $m_sjsr_RuntimeLong$();
  var lo$1 = this$2.remainderImpl__I__I__I__I__I(lo, hi, 2147483647, 0);
  var x1 = this.playMode$1;
  var x = this.$$outer$1.Animation__Lsgl_GraphicsHelpersComponent$Animation$().Normal__Lsgl_GraphicsHelpersComponent$Animation$Normal$();
  if ((x === x1)) {
    var xs = this.frames$1;
    var x$1 = (((-1) + xs.u.length) | 0);
    var frameIndex = ((x$1 < lo$1) ? x$1 : lo$1)
  } else {
    var x$3 = this.$$outer$1.Animation__Lsgl_GraphicsHelpersComponent$Animation$().Reversed__Lsgl_GraphicsHelpersComponent$Animation$Reversed$();
    if ((x$3 === x1)) {
      var xs$1 = this.frames$1;
      var x$2 = (((-1) + ((xs$1.u.length - lo$1) | 0)) | 0);
      var frameIndex = ((x$2 > 0) ? x$2 : 0)
    } else {
      var x$5 = this.$$outer$1.Animation__Lsgl_GraphicsHelpersComponent$Animation$().Loop__Lsgl_GraphicsHelpersComponent$Animation$Loop$();
      if ((x$5 === x1)) {
        var xs$2 = this.frames$1;
        var frameIndex = ((lo$1 % xs$2.u.length) | 0)
      } else {
        var x$7 = this.$$outer$1.Animation__Lsgl_GraphicsHelpersComponent$Animation$().LoopReversed__Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$();
        if ((x$7 === x1)) {
          var jsx$1 = this.frames$1.u.length;
          var xs$3 = this.frames$1;
          var frameIndex = (((-1) + ((jsx$1 - ((lo$1 % xs$3.u.length) | 0)) | 0)) | 0)
        } else {
          var x$9 = this.$$outer$1.Animation__Lsgl_GraphicsHelpersComponent$Animation$().LoopPingPong__Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$();
          if ((!(x$9 === x1))) {
            throw new $c_s_MatchError().init___O(x1)
          };
          var xs$4 = this.frames$1;
          var index = ((lo$1 % (xs$4.u.length << 1)) | 0);
          var xs$5 = this.frames$1;
          if ((index < xs$5.u.length)) {
            var frameIndex = index
          } else {
            var jsx$2 = this.frames$1.u.length;
            var xs$6 = this.frames$1;
            var frameIndex = (((-1) + ((jsx$2 - ((index % xs$6.u.length) | 0)) | 0)) | 0)
          }
        }
      }
    }
  };
  return this.frames$1.u[frameIndex]
});
var $d_Lsgl_GraphicsHelpersComponent$Animation = new $TypeData().initClass({
  Lsgl_GraphicsHelpersComponent$Animation: 0
}, false, "sgl.GraphicsHelpersComponent$Animation", {
  Lsgl_GraphicsHelpersComponent$Animation: 1,
  O: 1
});
$c_Lsgl_GraphicsHelpersComponent$Animation.prototype.$classData = $d_Lsgl_GraphicsHelpersComponent$Animation;
/** @constructor */
function $c_Lsgl_GraphicsHelpersComponent$Animation$() {
  $c_O.call(this);
  this.Normal$module$1 = null;
  this.Reversed$module$1 = null;
  this.Loop$module$1 = null;
  this.LoopReversed$module$1 = null;
  this.LoopPingPong$module$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype = new $h_O();
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.constructor = $c_Lsgl_GraphicsHelpersComponent$Animation$;
/** @constructor */
function $h_Lsgl_GraphicsHelpersComponent$Animation$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsHelpersComponent$Animation$.prototype = $c_Lsgl_GraphicsHelpersComponent$Animation$.prototype;
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.LoopPingPong__Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$ = (function() {
  if ((this.LoopPingPong$module$1 === null)) {
    this.LoopPingPong$lzycompute$1__p1__V()
  };
  return this.LoopPingPong$module$1
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.LoopReversed$lzycompute$1__p1__V = (function() {
  if ((this.LoopReversed$module$1 === null)) {
    this.LoopReversed$module$1 = new $c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$().init___Lsgl_GraphicsHelpersComponent$Animation$(this)
  }
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.Normal__Lsgl_GraphicsHelpersComponent$Animation$Normal$ = (function() {
  if ((this.Normal$module$1 === null)) {
    this.Normal$lzycompute$1__p1__V()
  };
  return this.Normal$module$1
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.Normal$lzycompute$1__p1__V = (function() {
  if ((this.Normal$module$1 === null)) {
    this.Normal$module$1 = new $c_Lsgl_GraphicsHelpersComponent$Animation$Normal$().init___Lsgl_GraphicsHelpersComponent$Animation$(this)
  }
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.Loop$lzycompute$1__p1__V = (function() {
  if ((this.Loop$module$1 === null)) {
    this.Loop$module$1 = new $c_Lsgl_GraphicsHelpersComponent$Animation$Loop$().init___Lsgl_GraphicsHelpersComponent$Animation$(this)
  }
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.Loop__Lsgl_GraphicsHelpersComponent$Animation$Loop$ = (function() {
  if ((this.Loop$module$1 === null)) {
    this.Loop$lzycompute$1__p1__V()
  };
  return this.Loop$module$1
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.Reversed$lzycompute$1__p1__V = (function() {
  if ((this.Reversed$module$1 === null)) {
    this.Reversed$module$1 = new $c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$().init___Lsgl_GraphicsHelpersComponent$Animation$(this)
  }
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.LoopPingPong$lzycompute$1__p1__V = (function() {
  if ((this.LoopPingPong$module$1 === null)) {
    this.LoopPingPong$module$1 = new $c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$().init___Lsgl_GraphicsHelpersComponent$Animation$(this)
  }
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.init___Lsgl_GraphicsProvider = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.LoopReversed__Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$ = (function() {
  if ((this.LoopReversed$module$1 === null)) {
    this.LoopReversed$lzycompute$1__p1__V()
  };
  return this.LoopReversed$module$1
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.Reversed__Lsgl_GraphicsHelpersComponent$Animation$Reversed$ = (function() {
  if ((this.Reversed$module$1 === null)) {
    this.Reversed$lzycompute$1__p1__V()
  };
  return this.Reversed$module$1
});
var $d_Lsgl_GraphicsHelpersComponent$Animation$ = new $TypeData().initClass({
  Lsgl_GraphicsHelpersComponent$Animation$: 0
}, false, "sgl.GraphicsHelpersComponent$Animation$", {
  Lsgl_GraphicsHelpersComponent$Animation$: 1,
  O: 1
});
$c_Lsgl_GraphicsHelpersComponent$Animation$.prototype.$classData = $d_Lsgl_GraphicsHelpersComponent$Animation$;
/** @constructor */
function $c_Lsgl_GraphicsHelpersComponent$RichCanvas() {
  $c_O.call(this);
  this.canvas$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_GraphicsHelpersComponent$RichCanvas.prototype = new $h_O();
$c_Lsgl_GraphicsHelpersComponent$RichCanvas.prototype.constructor = $c_Lsgl_GraphicsHelpersComponent$RichCanvas;
/** @constructor */
function $h_Lsgl_GraphicsHelpersComponent$RichCanvas() {
  /*<skip>*/
}
$h_Lsgl_GraphicsHelpersComponent$RichCanvas.prototype = $c_Lsgl_GraphicsHelpersComponent$RichCanvas.prototype;
$c_Lsgl_GraphicsHelpersComponent$RichCanvas.prototype.drawBitmap__Lsgl_GraphicsHelpersComponent$BitmapRegion__I__I__V = (function(region, x, y) {
  var this$1 = this.canvas$1;
  var bitmap = region.bitmap$1;
  var sx = region.x$1;
  var sy = region.y$1;
  var width = region.width$1;
  var height = region.height$1;
  this$1.drawBitmap__Lsgl_html5_Html5GraphicsProvider$Html5Bitmap__I__I__I__I__I__I__V($as_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(bitmap), x, y, sx, sy, width, height)
});
$c_Lsgl_GraphicsHelpersComponent$RichCanvas.prototype.init___Lsgl_GraphicsProvider__Lsgl_GraphicsProvider$AbstractCanvas = (function($$outer, canvas) {
  this.canvas$1 = canvas;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_GraphicsHelpersComponent$RichCanvas = new $TypeData().initClass({
  Lsgl_GraphicsHelpersComponent$RichCanvas: 0
}, false, "sgl.GraphicsHelpersComponent$RichCanvas", {
  Lsgl_GraphicsHelpersComponent$RichCanvas: 1,
  O: 1
});
$c_Lsgl_GraphicsHelpersComponent$RichCanvas.prototype.$classData = $d_Lsgl_GraphicsHelpersComponent$RichCanvas;
function $is_Lsgl_GraphicsProvider(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_GraphicsProvider)))
}
function $as_Lsgl_GraphicsProvider(obj) {
  return (($is_Lsgl_GraphicsProvider(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.GraphicsProvider"))
}
function $isArrayOf_Lsgl_GraphicsProvider(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_GraphicsProvider)))
}
function $asArrayOf_Lsgl_GraphicsProvider(obj, depth) {
  return (($isArrayOf_Lsgl_GraphicsProvider(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.GraphicsProvider;", depth))
}
/** @constructor */
function $c_Lsgl_GraphicsProvider$AbstractBitmap() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_GraphicsProvider$AbstractBitmap.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$AbstractBitmap.prototype.constructor = $c_Lsgl_GraphicsProvider$AbstractBitmap;
/** @constructor */
function $h_Lsgl_GraphicsProvider$AbstractBitmap() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$AbstractBitmap.prototype = $c_Lsgl_GraphicsProvider$AbstractBitmap.prototype;
$c_Lsgl_GraphicsProvider$AbstractBitmap.prototype.init___Lsgl_GraphicsProvider = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
/** @constructor */
function $c_Lsgl_GraphicsProvider$AbstractFont() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_GraphicsProvider$AbstractFont.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$AbstractFont.prototype.constructor = $c_Lsgl_GraphicsProvider$AbstractFont;
/** @constructor */
function $h_Lsgl_GraphicsProvider$AbstractFont() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$AbstractFont.prototype = $c_Lsgl_GraphicsProvider$AbstractFont.prototype;
$c_Lsgl_GraphicsProvider$AbstractFont.prototype.init___Lsgl_GraphicsProvider = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
/** @constructor */
function $c_Lsgl_GraphicsProvider$Alignments$() {
  $c_O.call(this);
  this.Center$module$1 = null;
  this.Left$module$1 = null;
  this.Right$module$1 = null
}
$c_Lsgl_GraphicsProvider$Alignments$.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$Alignments$.prototype.constructor = $c_Lsgl_GraphicsProvider$Alignments$;
/** @constructor */
function $h_Lsgl_GraphicsProvider$Alignments$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$Alignments$.prototype = $c_Lsgl_GraphicsProvider$Alignments$.prototype;
$c_Lsgl_GraphicsProvider$Alignments$.prototype.Center$lzycompute$1__p1__V = (function() {
  if ((this.Center$module$1 === null)) {
    this.Center$module$1 = new $c_Lsgl_GraphicsProvider$Alignments$Center$().init___Lsgl_GraphicsProvider$Alignments$(this)
  }
});
$c_Lsgl_GraphicsProvider$Alignments$.prototype.Right__Lsgl_GraphicsProvider$Alignments$Right$ = (function() {
  if ((this.Right$module$1 === null)) {
    this.Right$lzycompute$1__p1__V()
  };
  return this.Right$module$1
});
$c_Lsgl_GraphicsProvider$Alignments$.prototype.Center__Lsgl_GraphicsProvider$Alignments$Center$ = (function() {
  if ((this.Center$module$1 === null)) {
    this.Center$lzycompute$1__p1__V()
  };
  return this.Center$module$1
});
$c_Lsgl_GraphicsProvider$Alignments$.prototype.Right$lzycompute$1__p1__V = (function() {
  if ((this.Right$module$1 === null)) {
    this.Right$module$1 = new $c_Lsgl_GraphicsProvider$Alignments$Right$().init___Lsgl_GraphicsProvider$Alignments$(this)
  }
});
$c_Lsgl_GraphicsProvider$Alignments$.prototype.Left$lzycompute$1__p1__V = (function() {
  if ((this.Left$module$1 === null)) {
    this.Left$module$1 = new $c_Lsgl_GraphicsProvider$Alignments$Left$().init___Lsgl_GraphicsProvider$Alignments$(this)
  }
});
$c_Lsgl_GraphicsProvider$Alignments$.prototype.Left__Lsgl_GraphicsProvider$Alignments$Left$ = (function() {
  if ((this.Left$module$1 === null)) {
    this.Left$lzycompute$1__p1__V()
  };
  return this.Left$module$1
});
$c_Lsgl_GraphicsProvider$Alignments$.prototype.init___Lsgl_GraphicsProvider = (function($$outer) {
  return this
});
var $d_Lsgl_GraphicsProvider$Alignments$ = new $TypeData().initClass({
  Lsgl_GraphicsProvider$Alignments$: 0
}, false, "sgl.GraphicsProvider$Alignments$", {
  Lsgl_GraphicsProvider$Alignments$: 1,
  O: 1
});
$c_Lsgl_GraphicsProvider$Alignments$.prototype.$classData = $d_Lsgl_GraphicsProvider$Alignments$;
/** @constructor */
function $c_Lsgl_GraphicsProvider$ColorCompanion() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_GraphicsProvider$ColorCompanion.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$ColorCompanion.prototype.constructor = $c_Lsgl_GraphicsProvider$ColorCompanion;
/** @constructor */
function $h_Lsgl_GraphicsProvider$ColorCompanion() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$ColorCompanion.prototype = $c_Lsgl_GraphicsProvider$ColorCompanion.prototype;
$c_Lsgl_GraphicsProvider$ColorCompanion.prototype.init___Lsgl_GraphicsProvider = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
/** @constructor */
function $c_Lsgl_GraphicsProvider$FontCompanion() {
  $c_O.call(this);
  this.Bold$module$1 = null;
  this.BoldItalic$module$1 = null;
  this.Italic$module$1 = null;
  this.Normal$module$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_GraphicsProvider$FontCompanion.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$FontCompanion.prototype.constructor = $c_Lsgl_GraphicsProvider$FontCompanion;
/** @constructor */
function $h_Lsgl_GraphicsProvider$FontCompanion() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$FontCompanion.prototype = $c_Lsgl_GraphicsProvider$FontCompanion.prototype;
$c_Lsgl_GraphicsProvider$FontCompanion.prototype.BoldItalic$lzycompute$1__p1__V = (function() {
  if ((this.BoldItalic$module$1 === null)) {
    this.BoldItalic$module$1 = new $c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$().init___Lsgl_GraphicsProvider$FontCompanion(this)
  }
});
$c_Lsgl_GraphicsProvider$FontCompanion.prototype.Normal$lzycompute$1__p1__V = (function() {
  if ((this.Normal$module$1 === null)) {
    this.Normal$module$1 = new $c_Lsgl_GraphicsProvider$FontCompanion$Normal$().init___Lsgl_GraphicsProvider$FontCompanion(this)
  }
});
$c_Lsgl_GraphicsProvider$FontCompanion.prototype.Italic$lzycompute$1__p1__V = (function() {
  if ((this.Italic$module$1 === null)) {
    this.Italic$module$1 = new $c_Lsgl_GraphicsProvider$FontCompanion$Italic$().init___Lsgl_GraphicsProvider$FontCompanion(this)
  }
});
$c_Lsgl_GraphicsProvider$FontCompanion.prototype.Normal__Lsgl_GraphicsProvider$FontCompanion$Normal$ = (function() {
  if ((this.Normal$module$1 === null)) {
    this.Normal$lzycompute$1__p1__V()
  };
  return this.Normal$module$1
});
$c_Lsgl_GraphicsProvider$FontCompanion.prototype.Italic__Lsgl_GraphicsProvider$FontCompanion$Italic$ = (function() {
  if ((this.Italic$module$1 === null)) {
    this.Italic$lzycompute$1__p1__V()
  };
  return this.Italic$module$1
});
$c_Lsgl_GraphicsProvider$FontCompanion.prototype.Bold__Lsgl_GraphicsProvider$FontCompanion$Bold$ = (function() {
  if ((this.Bold$module$1 === null)) {
    this.Bold$lzycompute$1__p1__V()
  };
  return this.Bold$module$1
});
$c_Lsgl_GraphicsProvider$FontCompanion.prototype.init___Lsgl_GraphicsProvider = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_Lsgl_GraphicsProvider$FontCompanion.prototype.Bold$lzycompute$1__p1__V = (function() {
  if ((this.Bold$module$1 === null)) {
    this.Bold$module$1 = new $c_Lsgl_GraphicsProvider$FontCompanion$Bold$().init___Lsgl_GraphicsProvider$FontCompanion(this)
  }
});
$c_Lsgl_GraphicsProvider$FontCompanion.prototype.BoldItalic__Lsgl_GraphicsProvider$FontCompanion$BoldItalic$ = (function() {
  if ((this.BoldItalic$module$1 === null)) {
    this.BoldItalic$lzycompute$1__p1__V()
  };
  return this.BoldItalic$module$1
});
/** @constructor */
function $c_Lsgl_InputProvider$Input$() {
  $c_O.call(this);
  this.KeyDownEvent$module$1 = null;
  this.KeyUpEvent$module$1 = null;
  this.MouseMovedEvent$module$1 = null;
  this.MouseDownEvent$module$1 = null;
  this.MouseUpEvent$module$1 = null;
  this.MouseScrolledEvent$module$1 = null;
  this.TouchMovedEvent$module$1 = null;
  this.TouchDownEvent$module$1 = null;
  this.TouchUpEvent$module$1 = null;
  this.PointerDownEvent$module$1 = null;
  this.PointerUpEvent$module$1 = null;
  this.PointerMovedEvent$module$1 = null;
  this.MouseButtons$module$1 = null;
  this.Keys$module$1 = null;
  this.eventQueue$1 = null
}
$c_Lsgl_InputProvider$Input$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$.prototype.constructor = $c_Lsgl_InputProvider$Input$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$.prototype = $c_Lsgl_InputProvider$Input$.prototype;
$c_Lsgl_InputProvider$Input$.prototype.Keys__Lsgl_InputProvider$Input$Keys$ = (function() {
  if ((this.Keys$module$1 === null)) {
    this.Keys$lzycompute$1__p1__V()
  };
  return this.Keys$module$1
});
$c_Lsgl_InputProvider$Input$.prototype.Keys$lzycompute$1__p1__V = (function() {
  if ((this.Keys$module$1 === null)) {
    this.Keys$module$1 = new $c_Lsgl_InputProvider$Input$Keys$().init___Lsgl_InputProvider$Input$(this)
  }
});
$c_Lsgl_InputProvider$Input$.prototype.MouseButtons$lzycompute$1__p1__V = (function() {
  if ((this.MouseButtons$module$1 === null)) {
    this.MouseButtons$module$1 = new $c_Lsgl_InputProvider$Input$MouseButtons$().init___Lsgl_InputProvider$Input$(this)
  }
});
$c_Lsgl_InputProvider$Input$.prototype.init___Lsgl_InputProvider = (function($$outer) {
  this.eventQueue$1 = new $c_scm_Queue().init___();
  return this
});
$c_Lsgl_InputProvider$Input$.prototype.MouseButtons__Lsgl_InputProvider$Input$MouseButtons$ = (function() {
  if ((this.MouseButtons$module$1 === null)) {
    this.MouseButtons$lzycompute$1__p1__V()
  };
  return this.MouseButtons$module$1
});
$c_Lsgl_InputProvider$Input$.prototype.newEvent__Lsgl_InputProvider$Input$InputEvent__V = (function(event) {
  var this$1 = this.eventQueue$1;
  var array = [event];
  var i = 0;
  var len = $uI(array.length);
  while ((i < len)) {
    var index = i;
    var arg1 = array[index];
    this$1.$$plus$eq__O__scm_MutableList(arg1);
    i = ((1 + i) | 0)
  }
});
var $d_Lsgl_InputProvider$Input$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$: 0
}, false, "sgl.InputProvider$Input$", {
  Lsgl_InputProvider$Input$: 1,
  O: 1
});
$c_Lsgl_InputProvider$Input$.prototype.$classData = $d_Lsgl_InputProvider$Input$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$() {
  $c_O.call(this);
  this.A$module$1 = null;
  this.B$module$1 = null;
  this.C$module$1 = null;
  this.D$module$1 = null;
  this.E$module$1 = null;
  this.F$module$1 = null;
  this.G$module$1 = null;
  this.H$module$1 = null;
  this.I$module$1 = null;
  this.J$module$1 = null;
  this.K$module$1 = null;
  this.L$module$1 = null;
  this.M$module$1 = null;
  this.N$module$1 = null;
  this.O$module$1 = null;
  this.P$module$1 = null;
  this.Q$module$1 = null;
  this.R$module$1 = null;
  this.S$module$1 = null;
  this.T$module$1 = null;
  this.U$module$1 = null;
  this.V$module$1 = null;
  this.W$module$1 = null;
  this.X$module$1 = null;
  this.Y$module$1 = null;
  this.Z$module$1 = null;
  this.Num0$module$1 = null;
  this.Num1$module$1 = null;
  this.Num2$module$1 = null;
  this.Num3$module$1 = null;
  this.Num4$module$1 = null;
  this.Num5$module$1 = null;
  this.Num6$module$1 = null;
  this.Num7$module$1 = null;
  this.Num8$module$1 = null;
  this.Num9$module$1 = null;
  this.Space$module$1 = null;
  this.Left$module$1 = null;
  this.Up$module$1 = null;
  this.Right$module$1 = null;
  this.Down$module$1 = null;
  this.ButtonStart$module$1 = null;
  this.ButtonSelect$module$1 = null;
  this.ButtonBack$module$1 = null;
  this.ButtonMenu$module$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$.prototype = $c_Lsgl_InputProvider$Input$Keys$.prototype;
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num4$lzycompute$1__p1__V = (function() {
  if ((this.Num4$module$1 === null)) {
    this.Num4$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Num4$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.F$lzycompute$1__p1__V = (function() {
  if ((this.F$module$1 === null)) {
    this.F$module$1 = new $c_Lsgl_InputProvider$Input$Keys$F$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.D__Lsgl_InputProvider$Input$Keys$D$ = (function() {
  if ((this.D$module$1 === null)) {
    this.D$lzycompute$1__p1__V()
  };
  return this.D$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num6__Lsgl_InputProvider$Input$Keys$Num6$ = (function() {
  if ((this.Num6$module$1 === null)) {
    this.Num6$lzycompute$1__p1__V()
  };
  return this.Num6$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.T$lzycompute$1__p1__V = (function() {
  if ((this.T$module$1 === null)) {
    this.T$module$1 = new $c_Lsgl_InputProvider$Input$Keys$T$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.M$lzycompute$1__p1__V = (function() {
  if ((this.M$module$1 === null)) {
    this.M$module$1 = new $c_Lsgl_InputProvider$Input$Keys$M$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.J__Lsgl_InputProvider$Input$Keys$J$ = (function() {
  if ((this.J$module$1 === null)) {
    this.J$lzycompute$1__p1__V()
  };
  return this.J$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num3__Lsgl_InputProvider$Input$Keys$Num3$ = (function() {
  if ((this.Num3$module$1 === null)) {
    this.Num3$lzycompute$1__p1__V()
  };
  return this.Num3$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.U$lzycompute$1__p1__V = (function() {
  if ((this.U$module$1 === null)) {
    this.U$module$1 = new $c_Lsgl_InputProvider$Input$Keys$U$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.U__Lsgl_InputProvider$Input$Keys$U$ = (function() {
  if ((this.U$module$1 === null)) {
    this.U$lzycompute$1__p1__V()
  };
  return this.U$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.N$lzycompute$1__p1__V = (function() {
  if ((this.N$module$1 === null)) {
    this.N$module$1 = new $c_Lsgl_InputProvider$Input$Keys$N$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num5$lzycompute$1__p1__V = (function() {
  if ((this.Num5$module$1 === null)) {
    this.Num5$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Num5$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.I__Lsgl_InputProvider$Input$Keys$I$ = (function() {
  if ((this.I$module$1 === null)) {
    this.I$lzycompute$1__p1__V()
  };
  return this.I$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Z__Lsgl_InputProvider$Input$Keys$Z$ = (function() {
  if ((this.Z$module$1 === null)) {
    this.Z$lzycompute$1__p1__V()
  };
  return this.Z$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.O__Lsgl_InputProvider$Input$Keys$O$ = (function() {
  if ((this.O$module$1 === null)) {
    this.O$lzycompute$1__p1__V()
  };
  return this.O$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Down$lzycompute$1__p1__V = (function() {
  if ((this.Down$module$1 === null)) {
    this.Down$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Down$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.C__Lsgl_InputProvider$Input$Keys$C$ = (function() {
  if ((this.C$module$1 === null)) {
    this.C$lzycompute$1__p1__V()
  };
  return this.C$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Space__Lsgl_InputProvider$Input$Keys$Space$ = (function() {
  if ((this.Space$module$1 === null)) {
    this.Space$lzycompute$1__p1__V()
  };
  return this.Space$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.G$lzycompute$1__p1__V = (function() {
  if ((this.G$module$1 === null)) {
    this.G$module$1 = new $c_Lsgl_InputProvider$Input$Keys$G$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.N__Lsgl_InputProvider$Input$Keys$N$ = (function() {
  if ((this.N$module$1 === null)) {
    this.N$lzycompute$1__p1__V()
  };
  return this.N$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.T__Lsgl_InputProvider$Input$Keys$T$ = (function() {
  if ((this.T$module$1 === null)) {
    this.T$lzycompute$1__p1__V()
  };
  return this.T$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.A$lzycompute$1__p1__V = (function() {
  if ((this.A$module$1 === null)) {
    this.A$module$1 = new $c_Lsgl_InputProvider$Input$Keys$A$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num0__Lsgl_InputProvider$Input$Keys$Num0$ = (function() {
  if ((this.Num0$module$1 === null)) {
    this.Num0$lzycompute$1__p1__V()
  };
  return this.Num0$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num6$lzycompute$1__p1__V = (function() {
  if ((this.Num6$module$1 === null)) {
    this.Num6$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Num6$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.V$lzycompute$1__p1__V = (function() {
  if ((this.V$module$1 === null)) {
    this.V$module$1 = new $c_Lsgl_InputProvider$Input$Keys$V$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.H$lzycompute$1__p1__V = (function() {
  if ((this.H$module$1 === null)) {
    this.H$module$1 = new $c_Lsgl_InputProvider$Input$Keys$H$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.O$lzycompute$1__p1__V = (function() {
  if ((this.O$module$1 === null)) {
    this.O$module$1 = new $c_Lsgl_InputProvider$Input$Keys$O$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num7$lzycompute$1__p1__V = (function() {
  if ((this.Num7$module$1 === null)) {
    this.Num7$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Num7$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.S__Lsgl_InputProvider$Input$Keys$S$ = (function() {
  if ((this.S$module$1 === null)) {
    this.S$lzycompute$1__p1__V()
  };
  return this.S$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.H__Lsgl_InputProvider$Input$Keys$H$ = (function() {
  if ((this.H$module$1 === null)) {
    this.H$lzycompute$1__p1__V()
  };
  return this.H$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.W$lzycompute$1__p1__V = (function() {
  if ((this.W$module$1 === null)) {
    this.W$module$1 = new $c_Lsgl_InputProvider$Input$Keys$W$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.init___Lsgl_InputProvider$Input$ = (function($$outer) {
  return this
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num0$lzycompute$1__p1__V = (function() {
  if ((this.Num0$module$1 === null)) {
    this.Num0$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Num0$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.P$lzycompute$1__p1__V = (function() {
  if ((this.P$module$1 === null)) {
    this.P$module$1 = new $c_Lsgl_InputProvider$Input$Keys$P$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Up$lzycompute$1__p1__V = (function() {
  if ((this.Up$module$1 === null)) {
    this.Up$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Up$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.I$lzycompute$1__p1__V = (function() {
  if ((this.I$module$1 === null)) {
    this.I$module$1 = new $c_Lsgl_InputProvider$Input$Keys$I$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num7__Lsgl_InputProvider$Input$Keys$Num7$ = (function() {
  if ((this.Num7$module$1 === null)) {
    this.Num7$lzycompute$1__p1__V()
  };
  return this.Num7$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Y__Lsgl_InputProvider$Input$Keys$Y$ = (function() {
  if ((this.Y$module$1 === null)) {
    this.Y$lzycompute$1__p1__V()
  };
  return this.Y$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num4__Lsgl_InputProvider$Input$Keys$Num4$ = (function() {
  if ((this.Num4$module$1 === null)) {
    this.Num4$lzycompute$1__p1__V()
  };
  return this.Num4$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.X$lzycompute$1__p1__V = (function() {
  if ((this.X$module$1 === null)) {
    this.X$module$1 = new $c_Lsgl_InputProvider$Input$Keys$X$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num8$lzycompute$1__p1__V = (function() {
  if ((this.Num8$module$1 === null)) {
    this.Num8$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Num8$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.M__Lsgl_InputProvider$Input$Keys$M$ = (function() {
  if ((this.M$module$1 === null)) {
    this.M$lzycompute$1__p1__V()
  };
  return this.M$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.B__Lsgl_InputProvider$Input$Keys$B$ = (function() {
  if ((this.B$module$1 === null)) {
    this.B$lzycompute$1__p1__V()
  };
  return this.B$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.X__Lsgl_InputProvider$Input$Keys$X$ = (function() {
  if ((this.X$module$1 === null)) {
    this.X$lzycompute$1__p1__V()
  };
  return this.X$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num1__Lsgl_InputProvider$Input$Keys$Num1$ = (function() {
  if ((this.Num1$module$1 === null)) {
    this.Num1$lzycompute$1__p1__V()
  };
  return this.Num1$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Left$lzycompute$2__p1__V = (function() {
  if ((this.Left$module$1 === null)) {
    this.Left$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Left$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Right$lzycompute$2__p1__V = (function() {
  if ((this.Right$module$1 === null)) {
    this.Right$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Right$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.A__Lsgl_InputProvider$Input$Keys$A$ = (function() {
  if ((this.A$module$1 === null)) {
    this.A$lzycompute$1__p1__V()
  };
  return this.A$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num8__Lsgl_InputProvider$Input$Keys$Num8$ = (function() {
  if ((this.Num8$module$1 === null)) {
    this.Num8$lzycompute$1__p1__V()
  };
  return this.Num8$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.B$lzycompute$1__p1__V = (function() {
  if ((this.B$module$1 === null)) {
    this.B$module$1 = new $c_Lsgl_InputProvider$Input$Keys$B$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Down__Lsgl_InputProvider$Input$Keys$Down$ = (function() {
  if ((this.Down$module$1 === null)) {
    this.Down$lzycompute$1__p1__V()
  };
  return this.Down$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.J$lzycompute$1__p1__V = (function() {
  if ((this.J$module$1 === null)) {
    this.J$module$1 = new $c_Lsgl_InputProvider$Input$Keys$J$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.G__Lsgl_InputProvider$Input$Keys$G$ = (function() {
  if ((this.G$module$1 === null)) {
    this.G$lzycompute$1__p1__V()
  };
  return this.G$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num1$lzycompute$1__p1__V = (function() {
  if ((this.Num1$module$1 === null)) {
    this.Num1$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Num1$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.R__Lsgl_InputProvider$Input$Keys$R$ = (function() {
  if ((this.R$module$1 === null)) {
    this.R$lzycompute$1__p1__V()
  };
  return this.R$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.C$lzycompute$1__p1__V = (function() {
  if ((this.C$module$1 === null)) {
    this.C$module$1 = new $c_Lsgl_InputProvider$Input$Keys$C$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Space$lzycompute$1__p1__V = (function() {
  if ((this.Space$module$1 === null)) {
    this.Space$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Space$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Q$lzycompute$1__p1__V = (function() {
  if ((this.Q$module$1 === null)) {
    this.Q$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Q$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num9$lzycompute$1__p1__V = (function() {
  if ((this.Num9$module$1 === null)) {
    this.Num9$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Num9$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num2$lzycompute$1__p1__V = (function() {
  if ((this.Num2$module$1 === null)) {
    this.Num2$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Num2$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.K$lzycompute$1__p1__V = (function() {
  if ((this.K$module$1 === null)) {
    this.K$module$1 = new $c_Lsgl_InputProvider$Input$Keys$K$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.F__Lsgl_InputProvider$Input$Keys$F$ = (function() {
  if ((this.F$module$1 === null)) {
    this.F$lzycompute$1__p1__V()
  };
  return this.F$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.D$lzycompute$1__p1__V = (function() {
  if ((this.D$module$1 === null)) {
    this.D$module$1 = new $c_Lsgl_InputProvider$Input$Keys$D$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Y$lzycompute$1__p1__V = (function() {
  if ((this.Y$module$1 === null)) {
    this.Y$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Y$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.R$lzycompute$1__p1__V = (function() {
  if ((this.R$module$1 === null)) {
    this.R$module$1 = new $c_Lsgl_InputProvider$Input$Keys$R$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Q__Lsgl_InputProvider$Input$Keys$Q$ = (function() {
  if ((this.Q$module$1 === null)) {
    this.Q$lzycompute$1__p1__V()
  };
  return this.Q$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.S$lzycompute$1__p1__V = (function() {
  if ((this.S$module$1 === null)) {
    this.S$module$1 = new $c_Lsgl_InputProvider$Input$Keys$S$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.W__Lsgl_InputProvider$Input$Keys$W$ = (function() {
  if ((this.W$module$1 === null)) {
    this.W$lzycompute$1__p1__V()
  };
  return this.W$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Left__Lsgl_InputProvider$Input$Keys$Left$ = (function() {
  if ((this.Left$module$1 === null)) {
    this.Left$lzycompute$2__p1__V()
  };
  return this.Left$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Z$lzycompute$1__p1__V = (function() {
  if ((this.Z$module$1 === null)) {
    this.Z$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Z$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num3$lzycompute$1__p1__V = (function() {
  if ((this.Num3$module$1 === null)) {
    this.Num3$module$1 = new $c_Lsgl_InputProvider$Input$Keys$Num3$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.L__Lsgl_InputProvider$Input$Keys$L$ = (function() {
  if ((this.L$module$1 === null)) {
    this.L$lzycompute$1__p1__V()
  };
  return this.L$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.V__Lsgl_InputProvider$Input$Keys$V$ = (function() {
  if ((this.V$module$1 === null)) {
    this.V$lzycompute$1__p1__V()
  };
  return this.V$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num5__Lsgl_InputProvider$Input$Keys$Num5$ = (function() {
  if ((this.Num5$module$1 === null)) {
    this.Num5$lzycompute$1__p1__V()
  };
  return this.Num5$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Right__Lsgl_InputProvider$Input$Keys$Right$ = (function() {
  if ((this.Right$module$1 === null)) {
    this.Right$lzycompute$2__p1__V()
  };
  return this.Right$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.K__Lsgl_InputProvider$Input$Keys$K$ = (function() {
  if ((this.K$module$1 === null)) {
    this.K$lzycompute$1__p1__V()
  };
  return this.K$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Up__Lsgl_InputProvider$Input$Keys$Up$ = (function() {
  if ((this.Up$module$1 === null)) {
    this.Up$lzycompute$1__p1__V()
  };
  return this.Up$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num2__Lsgl_InputProvider$Input$Keys$Num2$ = (function() {
  if ((this.Num2$module$1 === null)) {
    this.Num2$lzycompute$1__p1__V()
  };
  return this.Num2$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.L$lzycompute$1__p1__V = (function() {
  if ((this.L$module$1 === null)) {
    this.L$module$1 = new $c_Lsgl_InputProvider$Input$Keys$L$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.P__Lsgl_InputProvider$Input$Keys$P$ = (function() {
  if ((this.P$module$1 === null)) {
    this.P$lzycompute$1__p1__V()
  };
  return this.P$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.Num9__Lsgl_InputProvider$Input$Keys$Num9$ = (function() {
  if ((this.Num9$module$1 === null)) {
    this.Num9$lzycompute$1__p1__V()
  };
  return this.Num9$module$1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.E$lzycompute$1__p1__V = (function() {
  if ((this.E$module$1 === null)) {
    this.E$module$1 = new $c_Lsgl_InputProvider$Input$Keys$E$().init___Lsgl_InputProvider$Input$Keys$(this)
  }
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.E__Lsgl_InputProvider$Input$Keys$E$ = (function() {
  if ((this.E$module$1 === null)) {
    this.E$lzycompute$1__p1__V()
  };
  return this.E$module$1
});
var $d_Lsgl_InputProvider$Input$Keys$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$: 0
}, false, "sgl.InputProvider$Input$Keys$", {
  Lsgl_InputProvider$Input$Keys$: 1,
  O: 1
});
$c_Lsgl_InputProvider$Input$Keys$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$MouseButtons$() {
  $c_O.call(this);
  this.Left$module$1 = null;
  this.Right$module$1 = null;
  this.Middle$module$1 = null
}
$c_Lsgl_InputProvider$Input$MouseButtons$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$MouseButtons$.prototype.constructor = $c_Lsgl_InputProvider$Input$MouseButtons$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$MouseButtons$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$MouseButtons$.prototype = $c_Lsgl_InputProvider$Input$MouseButtons$.prototype;
$c_Lsgl_InputProvider$Input$MouseButtons$.prototype.Left__Lsgl_InputProvider$Input$MouseButtons$Left$ = (function() {
  if ((this.Left$module$1 === null)) {
    this.Left$lzycompute$1__p1__V()
  };
  return this.Left$module$1
});
$c_Lsgl_InputProvider$Input$MouseButtons$.prototype.Middle$lzycompute$1__p1__V = (function() {
  if ((this.Middle$module$1 === null)) {
    this.Middle$module$1 = new $c_Lsgl_InputProvider$Input$MouseButtons$Middle$().init___Lsgl_InputProvider$Input$MouseButtons$(this)
  }
});
$c_Lsgl_InputProvider$Input$MouseButtons$.prototype.Right__Lsgl_InputProvider$Input$MouseButtons$Right$ = (function() {
  if ((this.Right$module$1 === null)) {
    this.Right$lzycompute$1__p1__V()
  };
  return this.Right$module$1
});
$c_Lsgl_InputProvider$Input$MouseButtons$.prototype.init___Lsgl_InputProvider$Input$ = (function($$outer) {
  return this
});
$c_Lsgl_InputProvider$Input$MouseButtons$.prototype.Middle__Lsgl_InputProvider$Input$MouseButtons$Middle$ = (function() {
  if ((this.Middle$module$1 === null)) {
    this.Middle$lzycompute$1__p1__V()
  };
  return this.Middle$module$1
});
$c_Lsgl_InputProvider$Input$MouseButtons$.prototype.Right$lzycompute$1__p1__V = (function() {
  if ((this.Right$module$1 === null)) {
    this.Right$module$1 = new $c_Lsgl_InputProvider$Input$MouseButtons$Right$().init___Lsgl_InputProvider$Input$MouseButtons$(this)
  }
});
$c_Lsgl_InputProvider$Input$MouseButtons$.prototype.Left$lzycompute$1__p1__V = (function() {
  if ((this.Left$module$1 === null)) {
    this.Left$module$1 = new $c_Lsgl_InputProvider$Input$MouseButtons$Left$().init___Lsgl_InputProvider$Input$MouseButtons$(this)
  }
});
var $d_Lsgl_InputProvider$Input$MouseButtons$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$MouseButtons$: 0
}, false, "sgl.InputProvider$Input$MouseButtons$", {
  Lsgl_InputProvider$Input$MouseButtons$: 1,
  O: 1
});
$c_Lsgl_InputProvider$Input$MouseButtons$.prototype.$classData = $d_Lsgl_InputProvider$Input$MouseButtons$;
function $f_Lsgl_html5_Html5GameLoopProvider__startGameLoop__V($thiz) {
  var jsx$1 = $as_Lsgl_GameStateComponent($thiz).gameState$1;
  var this$1 = $as_Lsgl_GameStateComponent($thiz);
  jsx$1.newScreen__Lsgl_GameStateComponent$GameScreen__V(new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen().init___Lcom_regblanc_scalavator_core_MainScreenComponent(this$1));
  var this$2 = $m_sjsr_RuntimeLong$();
  var value = $uD($g.Date.now());
  var lo = this$2.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(value);
  var hi = this$2.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
  var lastTime = new $c_sr_LongRef().init___J(new $c_sjsr_RuntimeLong().init___I__I(lo, hi));
  $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().setInterval((function(arg$outer, lastTime$1) {
    return (function() {
      return $f_Lsgl_html5_Html5GameLoopProvider__sgl$html5$Html5GameLoopProvider$$$anonfun$startGameLoop$1__sr_LongRef__O(arg$outer, lastTime$1)
    })
  })($thiz, lastTime), 40.0)
}
function $f_Lsgl_html5_Html5GameLoopProvider__sgl$html5$Html5GameLoopProvider$$$anonfun$startGameLoop$1__sr_LongRef__O($thiz, lastTime$1) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var value = $uD($g.Date.now());
  var lo = this$1.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(value);
  var hi = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
  var b = lastTime$1.elem$1;
  var bhi = b.hi$2;
  var lo$1 = ((lo - b.lo$2) | 0);
  var hi$1 = ((((-2147483648) ^ lo$1) > ((-2147483648) ^ lo)) ? (((-1) + ((hi - bhi) | 0)) | 0) : ((hi - bhi) | 0));
  lastTime$1.elem$1 = new $c_sjsr_RuntimeLong().init___I__I(lo, hi);
  var this$3 = $as_Lsgl_html5_Html5GraphicsProvider($thiz);
  var canvas = new $c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas().init___Lsgl_html5_Html5GraphicsProvider__Lorg_scalajs_dom_raw_HTMLCanvasElement(this$3, this$3.canvas$1);
  $f_Lsgl_GameLoopProvider__gameLoopStep__J__Lsgl_GraphicsProvider$AbstractCanvas__V($thiz, new $c_sjsr_RuntimeLong().init___I__I(lo$1, hi$1), canvas);
  $as_Lsgl_html5_Html5GraphicsProvider($thiz);
  var this$4 = $as_Lsgl_html5_Html5GraphicsProvider($thiz);
  new $c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas().init___Lsgl_html5_Html5GraphicsProvider__Lorg_scalajs_dom_raw_HTMLCanvasElement(this$4, this$4.canvas$1)
}
function $f_Lsgl_html5_Html5InputProvider__registerInputListeners__V($thiz) {
  $as_Lsgl_html5_Html5GraphicsProvider($thiz).canvas$1.onmousedown = (function(arg$outer) {
    return (function(arg1$2) {
      $f_Lsgl_html5_Html5InputProvider__sgl$html5$Html5InputProvider$$$anonfun$registerInputListeners$1__Lorg_scalajs_dom_raw_MouseEvent__V(arg$outer, arg1$2)
    })
  })($thiz);
  $as_Lsgl_html5_Html5GraphicsProvider($thiz).canvas$1.onmouseup = (function(arg$outer$1) {
    return (function(arg1$2$1) {
      $f_Lsgl_html5_Html5InputProvider__sgl$html5$Html5InputProvider$$$anonfun$registerInputListeners$2__Lorg_scalajs_dom_raw_MouseEvent__V(arg$outer$1, arg1$2$1)
    })
  })($thiz);
  $as_Lsgl_html5_Html5GraphicsProvider($thiz).canvas$1.onmousemove = (function(arg$outer$2) {
    return (function(arg1$2$2) {
      $f_Lsgl_html5_Html5InputProvider__sgl$html5$Html5InputProvider$$$anonfun$registerInputListeners$3__Lorg_scalajs_dom_raw_MouseEvent__V(arg$outer$2, arg1$2$2)
    })
  })($thiz);
  $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().onkeydown = (function(arg$outer$3) {
    return (function(arg1$2$3) {
      $f_Lsgl_html5_Html5InputProvider__sgl$html5$Html5InputProvider$$$anonfun$registerInputListeners$4__Lorg_scalajs_dom_raw_KeyboardEvent__V(arg$outer$3, arg1$2$3)
    })
  })($thiz);
  $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().onkeyup = (function(arg$outer$4) {
    return (function(arg1$2$4) {
      $f_Lsgl_html5_Html5InputProvider__sgl$html5$Html5InputProvider$$$anonfun$registerInputListeners$6__Lorg_scalajs_dom_raw_KeyboardEvent__V(arg$outer$4, arg1$2$4)
    })
  })($thiz)
}
function $f_Lsgl_html5_Html5InputProvider__getCursorPosition__pLsgl_html5_Html5InputProvider__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_MouseEvent__T2($thiz, canvas, e) {
  var rect = canvas.getBoundingClientRect();
  var x = $doubleToInt(($uD(e.clientX) - $uD(rect.left)));
  var y = $doubleToInt(($uD(e.clientY) - $uD(rect.top)));
  return new $c_s_Tuple2$mcII$sp().init___I__I(x, y)
}
function $f_Lsgl_html5_Html5InputProvider__sgl$html5$Html5InputProvider$$$anonfun$registerInputListeners$6__Lorg_scalajs_dom_raw_KeyboardEvent__V($thiz, e) {
  var this$1 = $f_Lsgl_html5_Html5InputProvider__domEventToKey__pLsgl_html5_Html5InputProvider__Lorg_scalajs_dom_raw_KeyboardEvent__s_Option($thiz, e);
  if ((!this$1.isEmpty__Z())) {
    var arg1 = this$1.get__O();
    var key = $as_Lsgl_InputProvider$Input$Keys$Key(arg1);
    $thiz.Input__Lsgl_InputProvider$Input$().newEvent__Lsgl_InputProvider$Input$InputEvent__V(new $c_Lsgl_InputProvider$Input$KeyUpEvent().init___Lsgl_InputProvider$Input$__Lsgl_InputProvider$Input$Keys$Key($thiz.Input__Lsgl_InputProvider$Input$(), key))
  }
}
function $f_Lsgl_html5_Html5InputProvider__sgl$html5$Html5InputProvider$$$anonfun$registerInputListeners$4__Lorg_scalajs_dom_raw_KeyboardEvent__V($thiz, e) {
  var this$1 = $f_Lsgl_html5_Html5InputProvider__domEventToKey__pLsgl_html5_Html5InputProvider__Lorg_scalajs_dom_raw_KeyboardEvent__s_Option($thiz, e);
  if ((!this$1.isEmpty__Z())) {
    var arg1 = this$1.get__O();
    var key = $as_Lsgl_InputProvider$Input$Keys$Key(arg1);
    $thiz.Input__Lsgl_InputProvider$Input$().newEvent__Lsgl_InputProvider$Input$InputEvent__V(new $c_Lsgl_InputProvider$Input$KeyDownEvent().init___Lsgl_InputProvider$Input$__Lsgl_InputProvider$Input$Keys$Key($thiz.Input__Lsgl_InputProvider$Input$(), key))
  }
}
function $f_Lsgl_html5_Html5InputProvider__sgl$html5$Html5InputProvider$$$anonfun$registerInputListeners$3__Lorg_scalajs_dom_raw_MouseEvent__V($thiz, e) {
  var canvas = $as_Lsgl_html5_Html5GraphicsProvider($thiz).canvas$1;
  var x1 = $f_Lsgl_html5_Html5InputProvider__getCursorPosition__pLsgl_html5_Html5InputProvider__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_MouseEvent__T2($thiz, canvas, e);
  if ((x1 === null)) {
    throw new $c_s_MatchError().init___O(x1)
  };
  var x = x1.$$und1$mcI$sp__I();
  var y = x1.$$und2$mcI$sp__I();
  $thiz.Input__Lsgl_InputProvider$Input$().newEvent__Lsgl_InputProvider$Input$InputEvent__V(new $c_Lsgl_InputProvider$Input$MouseMovedEvent().init___Lsgl_InputProvider$Input$__I__I($thiz.Input__Lsgl_InputProvider$Input$(), x, y))
}
function $f_Lsgl_html5_Html5InputProvider__sgl$html5$Html5InputProvider$$$anonfun$registerInputListeners$2__Lorg_scalajs_dom_raw_MouseEvent__V($thiz, e) {
  var canvas = $as_Lsgl_html5_Html5GraphicsProvider($thiz).canvas$1;
  var x1 = $f_Lsgl_html5_Html5InputProvider__getCursorPosition__pLsgl_html5_Html5InputProvider__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_MouseEvent__T2($thiz, canvas, e);
  if ((x1 === null)) {
    throw new $c_s_MatchError().init___O(x1)
  };
  var x = x1.$$und1$mcI$sp__I();
  var y = x1.$$und2$mcI$sp__I();
  $thiz.Input__Lsgl_InputProvider$Input$().newEvent__Lsgl_InputProvider$Input$InputEvent__V(new $c_Lsgl_InputProvider$Input$MouseUpEvent().init___Lsgl_InputProvider$Input$__I__I__Lsgl_InputProvider$Input$MouseButtons$MouseButton($thiz.Input__Lsgl_InputProvider$Input$(), x, y, $f_Lsgl_html5_Html5InputProvider__mouseEventButton__pLsgl_html5_Html5InputProvider__Lorg_scalajs_dom_raw_MouseEvent__Lsgl_InputProvider$Input$MouseButtons$MouseButton($thiz, e)))
}
function $f_Lsgl_html5_Html5InputProvider__sgl$html5$Html5InputProvider$$$anonfun$registerInputListeners$1__Lorg_scalajs_dom_raw_MouseEvent__V($thiz, e) {
  var canvas = $as_Lsgl_html5_Html5GraphicsProvider($thiz).canvas$1;
  var x1 = $f_Lsgl_html5_Html5InputProvider__getCursorPosition__pLsgl_html5_Html5InputProvider__Lorg_scalajs_dom_raw_HTMLCanvasElement__Lorg_scalajs_dom_raw_MouseEvent__T2($thiz, canvas, e);
  if ((x1 === null)) {
    throw new $c_s_MatchError().init___O(x1)
  };
  var x = x1.$$und1$mcI$sp__I();
  var y = x1.$$und2$mcI$sp__I();
  $thiz.Input__Lsgl_InputProvider$Input$().newEvent__Lsgl_InputProvider$Input$InputEvent__V(new $c_Lsgl_InputProvider$Input$MouseDownEvent().init___Lsgl_InputProvider$Input$__I__I__Lsgl_InputProvider$Input$MouseButtons$MouseButton($thiz.Input__Lsgl_InputProvider$Input$(), x, y, $f_Lsgl_html5_Html5InputProvider__mouseEventButton__pLsgl_html5_Html5InputProvider__Lorg_scalajs_dom_raw_MouseEvent__Lsgl_InputProvider$Input$MouseButtons$MouseButton($thiz, e)))
}
function $f_Lsgl_html5_Html5InputProvider__domEventToKey__pLsgl_html5_Html5InputProvider__Lorg_scalajs_dom_raw_KeyboardEvent__s_Option($thiz, e) {
  var x1 = $uI(e.keyCode);
  switch (x1) {
    case 32: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Space__Lsgl_InputProvider$Input$Keys$Space$());
      break
    }
    case 37: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Left__Lsgl_InputProvider$Input$Keys$Left$());
      break
    }
    case 38: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Up__Lsgl_InputProvider$Input$Keys$Up$());
      break
    }
    case 39: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Right__Lsgl_InputProvider$Input$Keys$Right$());
      break
    }
    case 40: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Down__Lsgl_InputProvider$Input$Keys$Down$());
      break
    }
    case 48: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Num0__Lsgl_InputProvider$Input$Keys$Num0$());
      break
    }
    case 49: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Num1__Lsgl_InputProvider$Input$Keys$Num1$());
      break
    }
    case 50: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Num2__Lsgl_InputProvider$Input$Keys$Num2$());
      break
    }
    case 51: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Num3__Lsgl_InputProvider$Input$Keys$Num3$());
      break
    }
    case 52: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Num4__Lsgl_InputProvider$Input$Keys$Num4$());
      break
    }
    case 53: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Num5__Lsgl_InputProvider$Input$Keys$Num5$());
      break
    }
    case 54: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Num6__Lsgl_InputProvider$Input$Keys$Num6$());
      break
    }
    case 55: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Num7__Lsgl_InputProvider$Input$Keys$Num7$());
      break
    }
    case 56: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Num8__Lsgl_InputProvider$Input$Keys$Num8$());
      break
    }
    case 57: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Num9__Lsgl_InputProvider$Input$Keys$Num9$());
      break
    }
    case 65: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().A__Lsgl_InputProvider$Input$Keys$A$());
      break
    }
    case 66: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().B__Lsgl_InputProvider$Input$Keys$B$());
      break
    }
    case 67: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().C__Lsgl_InputProvider$Input$Keys$C$());
      break
    }
    case 68: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().D__Lsgl_InputProvider$Input$Keys$D$());
      break
    }
    case 69: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().E__Lsgl_InputProvider$Input$Keys$E$());
      break
    }
    case 70: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().F__Lsgl_InputProvider$Input$Keys$F$());
      break
    }
    case 71: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().G__Lsgl_InputProvider$Input$Keys$G$());
      break
    }
    case 72: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().H__Lsgl_InputProvider$Input$Keys$H$());
      break
    }
    case 73: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().I__Lsgl_InputProvider$Input$Keys$I$());
      break
    }
    case 74: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().J__Lsgl_InputProvider$Input$Keys$J$());
      break
    }
    case 75: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().K__Lsgl_InputProvider$Input$Keys$K$());
      break
    }
    case 76: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().L__Lsgl_InputProvider$Input$Keys$L$());
      break
    }
    case 77: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().M__Lsgl_InputProvider$Input$Keys$M$());
      break
    }
    case 78: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().N__Lsgl_InputProvider$Input$Keys$N$());
      break
    }
    case 79: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().O__Lsgl_InputProvider$Input$Keys$O$());
      break
    }
    case 80: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().P__Lsgl_InputProvider$Input$Keys$P$());
      break
    }
    case 81: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Q__Lsgl_InputProvider$Input$Keys$Q$());
      break
    }
    case 82: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().R__Lsgl_InputProvider$Input$Keys$R$());
      break
    }
    case 83: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().S__Lsgl_InputProvider$Input$Keys$S$());
      break
    }
    case 84: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().T__Lsgl_InputProvider$Input$Keys$T$());
      break
    }
    case 85: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().U__Lsgl_InputProvider$Input$Keys$U$());
      break
    }
    case 86: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().V__Lsgl_InputProvider$Input$Keys$V$());
      break
    }
    case 87: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().W__Lsgl_InputProvider$Input$Keys$W$());
      break
    }
    case 88: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().X__Lsgl_InputProvider$Input$Keys$X$());
      break
    }
    case 89: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Y__Lsgl_InputProvider$Input$Keys$Y$());
      break
    }
    case 90: {
      return new $c_s_Some().init___O($thiz.Input__Lsgl_InputProvider$Input$().Keys__Lsgl_InputProvider$Input$Keys$().Z__Lsgl_InputProvider$Input$Keys$Z$());
      break
    }
    default: {
      return $m_s_None$()
    }
  }
}
function $f_Lsgl_html5_Html5InputProvider__mouseEventButton__pLsgl_html5_Html5InputProvider__Lorg_scalajs_dom_raw_MouseEvent__Lsgl_InputProvider$Input$MouseButtons$MouseButton($thiz, e) {
  var x1 = $uI(e.button);
  switch (x1) {
    case 0: {
      return $thiz.Input__Lsgl_InputProvider$Input$().MouseButtons__Lsgl_InputProvider$Input$MouseButtons$().Left__Lsgl_InputProvider$Input$MouseButtons$Left$();
      break
    }
    case 1: {
      return $thiz.Input__Lsgl_InputProvider$Input$().MouseButtons__Lsgl_InputProvider$Input$MouseButtons$().Middle__Lsgl_InputProvider$Input$MouseButtons$Middle$();
      break
    }
    case 2: {
      return $thiz.Input__Lsgl_InputProvider$Input$().MouseButtons__Lsgl_InputProvider$Input$MouseButtons$().Right__Lsgl_InputProvider$Input$MouseButtons$Right$();
      break
    }
    default: {
      return $thiz.Input__Lsgl_InputProvider$Input$().MouseButtons__Lsgl_InputProvider$Input$MouseButtons$().Left__Lsgl_InputProvider$Input$MouseButtons$Left$()
    }
  }
}
/** @constructor */
function $c_Lsgl_html5_themes_Theme() {
  $c_O.call(this)
}
$c_Lsgl_html5_themes_Theme.prototype = new $h_O();
$c_Lsgl_html5_themes_Theme.prototype.constructor = $c_Lsgl_html5_themes_Theme;
/** @constructor */
function $h_Lsgl_html5_themes_Theme() {
  /*<skip>*/
}
$h_Lsgl_html5_themes_Theme.prototype = $c_Lsgl_html5_themes_Theme.prototype;
/** @constructor */
function $c_Lsgl_scene_SceneGraphComponent$SceneGraph() {
  $c_O.call(this);
  this.root$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_scene_SceneGraphComponent$SceneGraph.prototype = new $h_O();
$c_Lsgl_scene_SceneGraphComponent$SceneGraph.prototype.constructor = $c_Lsgl_scene_SceneGraphComponent$SceneGraph;
/** @constructor */
function $h_Lsgl_scene_SceneGraphComponent$SceneGraph() {
  /*<skip>*/
}
$h_Lsgl_scene_SceneGraphComponent$SceneGraph.prototype = $c_Lsgl_scene_SceneGraphComponent$SceneGraph.prototype;
$c_Lsgl_scene_SceneGraphComponent$SceneGraph.prototype.init___Lsgl_scene_SceneGraphComponent__I__I = (function($$outer, width, height) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.root$1 = new $c_Lsgl_scene_SceneGraphComponent$SceneGroup().init___Lsgl_scene_SceneGraphComponent__F__F__F__F($$outer, 0.0, 0.0, $fround(width), $fround(height));
  return this
});
var $d_Lsgl_scene_SceneGraphComponent$SceneGraph = new $TypeData().initClass({
  Lsgl_scene_SceneGraphComponent$SceneGraph: 0
}, false, "sgl.scene.SceneGraphComponent$SceneGraph", {
  Lsgl_scene_SceneGraphComponent$SceneGraph: 1,
  O: 1
});
$c_Lsgl_scene_SceneGraphComponent$SceneGraph.prototype.$classData = $d_Lsgl_scene_SceneGraphComponent$SceneGraph;
/** @constructor */
function $c_Lsgl_scene_SceneGraphComponent$SceneNode() {
  $c_O.call(this);
  this.x$1 = 0.0;
  this.y$1 = 0.0;
  this.width$1 = 0.0;
  this.height$1 = 0.0;
  this.downEvent$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_scene_SceneGraphComponent$SceneNode.prototype = new $h_O();
$c_Lsgl_scene_SceneGraphComponent$SceneNode.prototype.constructor = $c_Lsgl_scene_SceneGraphComponent$SceneNode;
/** @constructor */
function $h_Lsgl_scene_SceneGraphComponent$SceneNode() {
  /*<skip>*/
}
$h_Lsgl_scene_SceneGraphComponent$SceneNode.prototype = $c_Lsgl_scene_SceneGraphComponent$SceneNode.prototype;
$c_Lsgl_scene_SceneGraphComponent$SceneNode.prototype.init___Lsgl_scene_SceneGraphComponent__F__F__F__F = (function($$outer, x, y, width, height) {
  this.x$1 = x;
  this.y$1 = y;
  this.width$1 = width;
  this.height$1 = height;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.downEvent$1 = $m_s_None$();
  return this
});
function $is_Lsgl_scene_SceneGraphComponent$SceneNode(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_scene_SceneGraphComponent$SceneNode)))
}
function $as_Lsgl_scene_SceneGraphComponent$SceneNode(obj) {
  return (($is_Lsgl_scene_SceneGraphComponent$SceneNode(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.scene.SceneGraphComponent$SceneNode"))
}
function $isArrayOf_Lsgl_scene_SceneGraphComponent$SceneNode(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_scene_SceneGraphComponent$SceneNode)))
}
function $asArrayOf_Lsgl_scene_SceneGraphComponent$SceneNode(obj, depth) {
  return (($isArrayOf_Lsgl_scene_SceneGraphComponent$SceneNode(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.scene.SceneGraphComponent$SceneNode;", depth))
}
/** @constructor */
function $c_Lsgl_util_LoggingProvider$Logger() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_util_LoggingProvider$Logger.prototype = new $h_O();
$c_Lsgl_util_LoggingProvider$Logger.prototype.constructor = $c_Lsgl_util_LoggingProvider$Logger;
/** @constructor */
function $h_Lsgl_util_LoggingProvider$Logger() {
  /*<skip>*/
}
$h_Lsgl_util_LoggingProvider$Logger.prototype = $c_Lsgl_util_LoggingProvider$Logger.prototype;
$c_Lsgl_util_LoggingProvider$Logger.prototype.init___Lsgl_util_LoggingProvider = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
/** @constructor */
function $c_Lsgl_util_LoggingProvider$Logger$() {
  $c_O.call(this);
  this.NoLogging$module$1 = null;
  this.Error$module$1 = null;
  this.Warning$module$1 = null;
  this.Info$module$1 = null;
  this.Debug$module$1 = null;
  this.Trace$module$1 = null;
  this.Tag$module$1 = null
}
$c_Lsgl_util_LoggingProvider$Logger$.prototype = new $h_O();
$c_Lsgl_util_LoggingProvider$Logger$.prototype.constructor = $c_Lsgl_util_LoggingProvider$Logger$;
/** @constructor */
function $h_Lsgl_util_LoggingProvider$Logger$() {
  /*<skip>*/
}
$h_Lsgl_util_LoggingProvider$Logger$.prototype = $c_Lsgl_util_LoggingProvider$Logger$.prototype;
$c_Lsgl_util_LoggingProvider$Logger$.prototype.init___Lsgl_util_LoggingProvider = (function($$outer) {
  return this
});
$c_Lsgl_util_LoggingProvider$Logger$.prototype.NoLogging$lzycompute$1__p1__V = (function() {
  if ((this.NoLogging$module$1 === null)) {
    this.NoLogging$module$1 = new $c_Lsgl_util_LoggingProvider$Logger$NoLogging$().init___Lsgl_util_LoggingProvider$Logger$(this)
  }
});
$c_Lsgl_util_LoggingProvider$Logger$.prototype.NoLogging__Lsgl_util_LoggingProvider$Logger$NoLogging$ = (function() {
  if ((this.NoLogging$module$1 === null)) {
    this.NoLogging$lzycompute$1__p1__V()
  };
  return this.NoLogging$module$1
});
var $d_Lsgl_util_LoggingProvider$Logger$ = new $TypeData().initClass({
  Lsgl_util_LoggingProvider$Logger$: 0
}, false, "sgl.util.LoggingProvider$Logger$", {
  Lsgl_util_LoggingProvider$Logger$: 1,
  O: 1
});
$c_Lsgl_util_LoggingProvider$Logger$.prototype.$classData = $d_Lsgl_util_LoggingProvider$Logger$;
/** @constructor */
function $c_jl_Class() {
  $c_O.call(this);
  this.data$1 = null
}
$c_jl_Class.prototype = new $h_O();
$c_jl_Class.prototype.constructor = $c_jl_Class;
/** @constructor */
function $h_jl_Class() {
  /*<skip>*/
}
$h_jl_Class.prototype = $c_jl_Class.prototype;
$c_jl_Class.prototype.getName__T = (function() {
  return $as_T(this.data$1.name)
});
$c_jl_Class.prototype.getComponentType__jl_Class = (function() {
  return $as_jl_Class(this.data$1.getComponentType())
});
$c_jl_Class.prototype.isPrimitive__Z = (function() {
  return $uZ(this.data$1.isPrimitive)
});
$c_jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
$c_jl_Class.prototype.isAssignableFrom__jl_Class__Z = (function(that) {
  return ((this.isPrimitive__Z() || that.isPrimitive__Z()) ? ((this === that) || ((this === $d_S.getClassOf()) ? (that === $d_B.getClassOf()) : ((this === $d_I.getClassOf()) ? ((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) : ((this === $d_F.getClassOf()) ? (((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) : ((this === $d_D.getClassOf()) && ((((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) || (that === $d_F.getClassOf()))))))) : this.isInstance__O__Z(that.getFakeInstance__p1__O()))
});
$c_jl_Class.prototype.isInstance__O__Z = (function(obj) {
  return $uZ(this.data$1.isInstance(obj))
});
$c_jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
$c_jl_Class.prototype.getFakeInstance__p1__O = (function() {
  return this.data$1.getFakeInstance()
});
$c_jl_Class.prototype.newArrayOfThisClass__sjs_js_Array__O = (function(dimensions) {
  return this.data$1.newArrayOfThisClass(dimensions)
});
$c_jl_Class.prototype.isArray__Z = (function() {
  return $uZ(this.data$1.isArrayClass)
});
$c_jl_Class.prototype.isInterface__Z = (function() {
  return $uZ(this.data$1.isInterface)
});
function $is_jl_Class(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Class)))
}
function $as_jl_Class(obj) {
  return (($is_jl_Class(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Class"))
}
function $isArrayOf_jl_Class(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Class)))
}
function $asArrayOf_jl_Class(obj, depth) {
  return (($isArrayOf_jl_Class(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Class;", depth))
}
var $d_jl_Class = new $TypeData().initClass({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
$c_jl_Class.prototype.$classData = $d_jl_Class;
/** @constructor */
function $c_jl_System$() {
  $c_O.call(this);
  this.out$1 = null;
  this.err$1 = null;
  this.in$1 = null;
  this.getHighPrecisionTime$1 = null
}
$c_jl_System$.prototype = new $h_O();
$c_jl_System$.prototype.constructor = $c_jl_System$;
/** @constructor */
function $h_jl_System$() {
  /*<skip>*/
}
$h_jl_System$.prototype = $c_jl_System$.prototype;
$c_jl_System$.prototype.init___ = (function() {
  $n_jl_System$ = this;
  this.out$1 = new $c_jl_JSConsoleBasedPrintStream().init___jl_Boolean(false);
  this.err$1 = new $c_jl_JSConsoleBasedPrintStream().init___jl_Boolean(true);
  this.in$1 = null;
  var x = $g.performance;
  if ($uZ((!(!x)))) {
    var x$1 = $g.performance.now;
    if ($uZ((!(!x$1)))) {
      var jsx$1 = (function() {
        return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$1__D()
      })
    } else {
      var x$2 = $g.performance.webkitNow;
      if ($uZ((!(!x$2)))) {
        var jsx$1 = (function() {
          return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$2__D()
        })
      } else {
        var jsx$1 = (function() {
          return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$3__D()
        })
      }
    }
  } else {
    var jsx$1 = (function() {
      return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$4__D()
    })
  };
  this.getHighPrecisionTime$1 = jsx$1;
  return this
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$3__D = (function() {
  return $uD(new $g.Date().getTime())
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$1__D = (function() {
  return $uD($g.performance.now())
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$4__D = (function() {
  return $uD(new $g.Date().getTime())
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$2__D = (function() {
  return $uD($g.performance.webkitNow())
});
var $d_jl_System$ = new $TypeData().initClass({
  jl_System$: 0
}, false, "java.lang.System$", {
  jl_System$: 1,
  O: 1
});
$c_jl_System$.prototype.$classData = $d_jl_System$;
var $n_jl_System$ = (void 0);
function $m_jl_System$() {
  if ((!$n_jl_System$)) {
    $n_jl_System$ = new $c_jl_System$().init___()
  };
  return $n_jl_System$
}
/** @constructor */
function $c_jl_reflect_Array$() {
  $c_O.call(this)
}
$c_jl_reflect_Array$.prototype = new $h_O();
$c_jl_reflect_Array$.prototype.constructor = $c_jl_reflect_Array$;
/** @constructor */
function $h_jl_reflect_Array$() {
  /*<skip>*/
}
$h_jl_reflect_Array$.prototype = $c_jl_reflect_Array$.prototype;
$c_jl_reflect_Array$.prototype.init___ = (function() {
  return this
});
$c_jl_reflect_Array$.prototype.newInstance__jl_Class__I__O = (function(componentType, length) {
  return componentType.newArrayOfThisClass__sjs_js_Array__O([length])
});
var $d_jl_reflect_Array$ = new $TypeData().initClass({
  jl_reflect_Array$: 0
}, false, "java.lang.reflect.Array$", {
  jl_reflect_Array$: 1,
  O: 1
});
$c_jl_reflect_Array$.prototype.$classData = $d_jl_reflect_Array$;
var $n_jl_reflect_Array$ = (void 0);
function $m_jl_reflect_Array$() {
  if ((!$n_jl_reflect_Array$)) {
    $n_jl_reflect_Array$ = new $c_jl_reflect_Array$().init___()
  };
  return $n_jl_reflect_Array$
}
/** @constructor */
function $c_ju_Arrays$() {
  $c_O.call(this)
}
$c_ju_Arrays$.prototype = new $h_O();
$c_ju_Arrays$.prototype.constructor = $c_ju_Arrays$;
/** @constructor */
function $h_ju_Arrays$() {
  /*<skip>*/
}
$h_ju_Arrays$.prototype = $c_ju_Arrays$.prototype;
$c_ju_Arrays$.prototype.init___ = (function() {
  return this
});
$c_ju_Arrays$.prototype.binarySearch__AI__I__I = (function(a, key) {
  var startIndex = 0;
  var endIndex = a.u.length;
  _binarySearchImpl: while (true) {
    if ((startIndex === endIndex)) {
      return (((-1) - startIndex) | 0)
    } else {
      var mid = ((((startIndex + endIndex) | 0) >>> 1) | 0);
      var elem = a.u[mid];
      if ((key < elem)) {
        endIndex = mid;
        continue _binarySearchImpl
      } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, elem)) {
        return mid
      } else {
        startIndex = ((1 + mid) | 0);
        continue _binarySearchImpl
      }
    }
  }
});
var $d_ju_Arrays$ = new $TypeData().initClass({
  ju_Arrays$: 0
}, false, "java.util.Arrays$", {
  ju_Arrays$: 1,
  O: 1
});
$c_ju_Arrays$.prototype.$classData = $d_ju_Arrays$;
var $n_ju_Arrays$ = (void 0);
function $m_ju_Arrays$() {
  if ((!$n_ju_Arrays$)) {
    $n_ju_Arrays$ = new $c_ju_Arrays$().init___()
  };
  return $n_ju_Arrays$
}
/** @constructor */
function $c_s_DeprecatedConsole() {
  $c_O.call(this)
}
$c_s_DeprecatedConsole.prototype = new $h_O();
$c_s_DeprecatedConsole.prototype.constructor = $c_s_DeprecatedConsole;
/** @constructor */
function $h_s_DeprecatedConsole() {
  /*<skip>*/
}
$h_s_DeprecatedConsole.prototype = $c_s_DeprecatedConsole.prototype;
/** @constructor */
function $c_s_FallbackArrayBuilding() {
  $c_O.call(this)
}
$c_s_FallbackArrayBuilding.prototype = new $h_O();
$c_s_FallbackArrayBuilding.prototype.constructor = $c_s_FallbackArrayBuilding;
/** @constructor */
function $h_s_FallbackArrayBuilding() {
  /*<skip>*/
}
$h_s_FallbackArrayBuilding.prototype = $c_s_FallbackArrayBuilding.prototype;
/** @constructor */
function $c_s_LowPriorityImplicits() {
  $c_O.call(this)
}
$c_s_LowPriorityImplicits.prototype = new $h_O();
$c_s_LowPriorityImplicits.prototype.constructor = $c_s_LowPriorityImplicits;
/** @constructor */
function $h_s_LowPriorityImplicits() {
  /*<skip>*/
}
$h_s_LowPriorityImplicits.prototype = $c_s_LowPriorityImplicits.prototype;
/** @constructor */
function $c_s_math_Ordered$() {
  $c_O.call(this)
}
$c_s_math_Ordered$.prototype = new $h_O();
$c_s_math_Ordered$.prototype.constructor = $c_s_math_Ordered$;
/** @constructor */
function $h_s_math_Ordered$() {
  /*<skip>*/
}
$h_s_math_Ordered$.prototype = $c_s_math_Ordered$.prototype;
$c_s_math_Ordered$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordered$ = new $TypeData().initClass({
  s_math_Ordered$: 0
}, false, "scala.math.Ordered$", {
  s_math_Ordered$: 1,
  O: 1
});
$c_s_math_Ordered$.prototype.$classData = $d_s_math_Ordered$;
var $n_s_math_Ordered$ = (void 0);
function $m_s_math_Ordered$() {
  if ((!$n_s_math_Ordered$)) {
    $n_s_math_Ordered$ = new $c_s_math_Ordered$().init___()
  };
  return $n_s_math_Ordered$
}
/** @constructor */
function $c_s_package$() {
  $c_O.call(this);
  this.BigDecimal$1 = null;
  this.BigInt$1 = null;
  this.AnyRef$1 = null;
  this.Traversable$1 = null;
  this.Iterable$1 = null;
  this.Seq$1 = null;
  this.IndexedSeq$1 = null;
  this.Iterator$1 = null;
  this.List$1 = null;
  this.Nil$1 = null;
  this.$$colon$colon$1 = null;
  this.$$plus$colon$1 = null;
  this.$$colon$plus$1 = null;
  this.Stream$1 = null;
  this.$$hash$colon$colon$1 = null;
  this.Vector$1 = null;
  this.StringBuilder$1 = null;
  this.Range$1 = null;
  this.Equiv$1 = null;
  this.Fractional$1 = null;
  this.Integral$1 = null;
  this.Numeric$1 = null;
  this.Ordered$1 = null;
  this.Ordering$1 = null;
  this.Either$1 = null;
  this.Left$1 = null;
  this.Right$1 = null;
  this.bitmap$0$1 = 0
}
$c_s_package$.prototype = new $h_O();
$c_s_package$.prototype.constructor = $c_s_package$;
/** @constructor */
function $h_s_package$() {
  /*<skip>*/
}
$h_s_package$.prototype = $c_s_package$.prototype;
$c_s_package$.prototype.init___ = (function() {
  $n_s_package$ = this;
  this.AnyRef$1 = new $c_s_package$$anon$1().init___();
  this.Traversable$1 = $m_sc_Traversable$();
  this.Iterable$1 = $m_sc_Iterable$();
  this.Seq$1 = $m_sc_Seq$();
  this.IndexedSeq$1 = $m_sc_IndexedSeq$();
  this.Iterator$1 = $m_sc_Iterator$();
  this.List$1 = $m_sci_List$();
  this.Nil$1 = $m_sci_Nil$();
  this.$$colon$colon$1 = $m_sci_$colon$colon$();
  this.$$plus$colon$1 = $m_sc_$plus$colon$();
  this.$$colon$plus$1 = $m_sc_$colon$plus$();
  this.Stream$1 = $m_sci_Stream$();
  this.$$hash$colon$colon$1 = $m_sci_Stream$$hash$colon$colon$();
  this.Vector$1 = $m_sci_Vector$();
  this.StringBuilder$1 = $m_scm_StringBuilder$();
  this.Range$1 = $m_sci_Range$();
  this.Equiv$1 = $m_s_math_Equiv$();
  this.Fractional$1 = $m_s_math_Fractional$();
  this.Integral$1 = $m_s_math_Integral$();
  this.Numeric$1 = $m_s_math_Numeric$();
  this.Ordered$1 = $m_s_math_Ordered$();
  this.Ordering$1 = $m_s_math_Ordering$();
  this.Either$1 = $m_s_util_Either$();
  this.Left$1 = $m_s_util_Left$();
  this.Right$1 = $m_s_util_Right$();
  return this
});
var $d_s_package$ = new $TypeData().initClass({
  s_package$: 0
}, false, "scala.package$", {
  s_package$: 1,
  O: 1
});
$c_s_package$.prototype.$classData = $d_s_package$;
var $n_s_package$ = (void 0);
function $m_s_package$() {
  if ((!$n_s_package$)) {
    $n_s_package$ = new $c_s_package$().init___()
  };
  return $n_s_package$
}
/** @constructor */
function $c_s_reflect_ClassManifestFactory$() {
  $c_O.call(this);
  this.Byte$1 = null;
  this.Short$1 = null;
  this.Char$1 = null;
  this.Int$1 = null;
  this.Long$1 = null;
  this.Float$1 = null;
  this.Double$1 = null;
  this.Boolean$1 = null;
  this.Unit$1 = null;
  this.Any$1 = null;
  this.Object$1 = null;
  this.AnyVal$1 = null;
  this.Nothing$1 = null;
  this.Null$1 = null
}
$c_s_reflect_ClassManifestFactory$.prototype = new $h_O();
$c_s_reflect_ClassManifestFactory$.prototype.constructor = $c_s_reflect_ClassManifestFactory$;
/** @constructor */
function $h_s_reflect_ClassManifestFactory$() {
  /*<skip>*/
}
$h_s_reflect_ClassManifestFactory$.prototype = $c_s_reflect_ClassManifestFactory$.prototype;
$c_s_reflect_ClassManifestFactory$.prototype.init___ = (function() {
  $n_s_reflect_ClassManifestFactory$ = this;
  this.Byte$1 = $m_s_reflect_ManifestFactory$ByteManifest$();
  this.Short$1 = $m_s_reflect_ManifestFactory$ShortManifest$();
  this.Char$1 = $m_s_reflect_ManifestFactory$CharManifest$();
  this.Int$1 = $m_s_reflect_ManifestFactory$IntManifest$();
  this.Long$1 = $m_s_reflect_ManifestFactory$LongManifest$();
  this.Float$1 = $m_s_reflect_ManifestFactory$FloatManifest$();
  this.Double$1 = $m_s_reflect_ManifestFactory$DoubleManifest$();
  this.Boolean$1 = $m_s_reflect_ManifestFactory$BooleanManifest$();
  this.Unit$1 = $m_s_reflect_ManifestFactory$UnitManifest$();
  this.Any$1 = $m_s_reflect_ManifestFactory$AnyManifest$();
  this.Object$1 = $m_s_reflect_ManifestFactory$ObjectManifest$();
  this.AnyVal$1 = $m_s_reflect_ManifestFactory$AnyValManifest$();
  this.Nothing$1 = $m_s_reflect_ManifestFactory$NothingManifest$();
  this.Null$1 = $m_s_reflect_ManifestFactory$NullManifest$();
  return this
});
var $d_s_reflect_ClassManifestFactory$ = new $TypeData().initClass({
  s_reflect_ClassManifestFactory$: 0
}, false, "scala.reflect.ClassManifestFactory$", {
  s_reflect_ClassManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ClassManifestFactory$.prototype.$classData = $d_s_reflect_ClassManifestFactory$;
var $n_s_reflect_ClassManifestFactory$ = (void 0);
function $m_s_reflect_ClassManifestFactory$() {
  if ((!$n_s_reflect_ClassManifestFactory$)) {
    $n_s_reflect_ClassManifestFactory$ = new $c_s_reflect_ClassManifestFactory$().init___()
  };
  return $n_s_reflect_ClassManifestFactory$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$() {
  $c_O.call(this)
}
$c_s_reflect_ManifestFactory$.prototype = new $h_O();
$c_s_reflect_ManifestFactory$.prototype.constructor = $c_s_reflect_ManifestFactory$;
/** @constructor */
function $h_s_reflect_ManifestFactory$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$.prototype = $c_s_reflect_ManifestFactory$.prototype;
$c_s_reflect_ManifestFactory$.prototype.init___ = (function() {
  return this
});
var $d_s_reflect_ManifestFactory$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$: 0
}, false, "scala.reflect.ManifestFactory$", {
  s_reflect_ManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ManifestFactory$.prototype.$classData = $d_s_reflect_ManifestFactory$;
var $n_s_reflect_ManifestFactory$ = (void 0);
function $m_s_reflect_ManifestFactory$() {
  if ((!$n_s_reflect_ManifestFactory$)) {
    $n_s_reflect_ManifestFactory$ = new $c_s_reflect_ManifestFactory$().init___()
  };
  return $n_s_reflect_ManifestFactory$
}
/** @constructor */
function $c_s_reflect_package$() {
  $c_O.call(this);
  this.ClassManifest$1 = null;
  this.Manifest$1 = null
}
$c_s_reflect_package$.prototype = new $h_O();
$c_s_reflect_package$.prototype.constructor = $c_s_reflect_package$;
/** @constructor */
function $h_s_reflect_package$() {
  /*<skip>*/
}
$h_s_reflect_package$.prototype = $c_s_reflect_package$.prototype;
$c_s_reflect_package$.prototype.init___ = (function() {
  $n_s_reflect_package$ = this;
  this.ClassManifest$1 = $m_s_reflect_ClassManifestFactory$();
  this.Manifest$1 = $m_s_reflect_ManifestFactory$();
  return this
});
var $d_s_reflect_package$ = new $TypeData().initClass({
  s_reflect_package$: 0
}, false, "scala.reflect.package$", {
  s_reflect_package$: 1,
  O: 1
});
$c_s_reflect_package$.prototype.$classData = $d_s_reflect_package$;
var $n_s_reflect_package$ = (void 0);
function $m_s_reflect_package$() {
  if ((!$n_s_reflect_package$)) {
    $n_s_reflect_package$ = new $c_s_reflect_package$().init___()
  };
  return $n_s_reflect_package$
}
/** @constructor */
function $c_s_sys_package$() {
  $c_O.call(this)
}
$c_s_sys_package$.prototype = new $h_O();
$c_s_sys_package$.prototype.constructor = $c_s_sys_package$;
/** @constructor */
function $h_s_sys_package$() {
  /*<skip>*/
}
$h_s_sys_package$.prototype = $c_s_sys_package$.prototype;
$c_s_sys_package$.prototype.init___ = (function() {
  return this
});
$c_s_sys_package$.prototype.error__T__sr_Nothing$ = (function(message) {
  throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new $c_jl_RuntimeException().init___T(message))
});
var $d_s_sys_package$ = new $TypeData().initClass({
  s_sys_package$: 0
}, false, "scala.sys.package$", {
  s_sys_package$: 1,
  O: 1
});
$c_s_sys_package$.prototype.$classData = $d_s_sys_package$;
var $n_s_sys_package$ = (void 0);
function $m_s_sys_package$() {
  if ((!$n_s_sys_package$)) {
    $n_s_sys_package$ = new $c_s_sys_package$().init___()
  };
  return $n_s_sys_package$
}
/** @constructor */
function $c_s_util_DynamicVariable() {
  $c_O.call(this);
  this.v$1 = null
}
$c_s_util_DynamicVariable.prototype = new $h_O();
$c_s_util_DynamicVariable.prototype.constructor = $c_s_util_DynamicVariable;
/** @constructor */
function $h_s_util_DynamicVariable() {
  /*<skip>*/
}
$h_s_util_DynamicVariable.prototype = $c_s_util_DynamicVariable.prototype;
$c_s_util_DynamicVariable.prototype.toString__T = (function() {
  return (("DynamicVariable(" + this.v$1) + ")")
});
$c_s_util_DynamicVariable.prototype.init___O = (function(init) {
  this.v$1 = init;
  return this
});
var $d_s_util_DynamicVariable = new $TypeData().initClass({
  s_util_DynamicVariable: 0
}, false, "scala.util.DynamicVariable", {
  s_util_DynamicVariable: 1,
  O: 1
});
$c_s_util_DynamicVariable.prototype.$classData = $d_s_util_DynamicVariable;
/** @constructor */
function $c_s_util_control_Breaks() {
  $c_O.call(this);
  this.scala$util$control$Breaks$$breakException$1 = null
}
$c_s_util_control_Breaks.prototype = new $h_O();
$c_s_util_control_Breaks.prototype.constructor = $c_s_util_control_Breaks;
/** @constructor */
function $h_s_util_control_Breaks() {
  /*<skip>*/
}
$h_s_util_control_Breaks.prototype = $c_s_util_control_Breaks.prototype;
$c_s_util_control_Breaks.prototype.init___ = (function() {
  this.scala$util$control$Breaks$$breakException$1 = new $c_s_util_control_BreakControl().init___();
  return this
});
var $d_s_util_control_Breaks = new $TypeData().initClass({
  s_util_control_Breaks: 0
}, false, "scala.util.control.Breaks", {
  s_util_control_Breaks: 1,
  O: 1
});
$c_s_util_control_Breaks.prototype.$classData = $d_s_util_control_Breaks;
/** @constructor */
function $c_s_util_hashing_MurmurHash3() {
  $c_O.call(this)
}
$c_s_util_hashing_MurmurHash3.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3.prototype.constructor = $c_s_util_hashing_MurmurHash3;
/** @constructor */
function $h_s_util_hashing_MurmurHash3() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3.prototype = $c_s_util_hashing_MurmurHash3.prototype;
$c_s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> 17) | 0));
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> 19) | 0));
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_s_util_hashing_MurmurHash3.prototype.unorderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var a = new $c_sr_IntRef().init___I(0);
  var b = new $c_sr_IntRef().init___I(0);
  var n = new $c_sr_IntRef().init___I(0);
  var c = new $c_sr_IntRef().init___I(1);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, a$1, b$1, n$1, c$1) {
    return (function(x$2) {
      var h = $m_sr_Statics$().anyHash__O__I(x$2);
      a$1.elem$1 = ((a$1.elem$1 + h) | 0);
      b$1.elem$1 = (b$1.elem$1 ^ h);
      if ((h !== 0)) {
        c$1.elem$1 = $imul(c$1.elem$1, h)
      };
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, a, b, n, c)));
  var h$1 = seed;
  h$1 = this.mix__I__I__I(h$1, a.elem$1);
  h$1 = this.mix__I__I__I(h$1, b.elem$1);
  h$1 = this.mixLast__I__I__I(h$1, c.elem$1);
  return this.finalizeHash__I__I__I(h$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return $m_sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
$c_s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
$c_s_util_hashing_MurmurHash3.prototype.orderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var n = new $c_sr_IntRef().init___I(0);
  var h = new $c_sr_IntRef().init___I(seed);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, n$1, h$1) {
    return (function(x$2) {
      h$1.elem$1 = $this.mix__I__I__I(h$1.elem$1, $m_sr_Statics$().anyHash__O__I(x$2));
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, n, h)));
  return this.finalizeHash__I__I__I(h.elem$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var elems = xs;
  while ((!elems.isEmpty__Z())) {
    var head = elems.head__O();
    var this$1 = elems;
    var tail = this$1.tail__sci_List();
    h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(head));
    n = ((1 + n) | 0);
    elems = tail
  };
  return this.finalizeHash__I__I__I(h, n)
});
/** @constructor */
function $c_sc_$colon$plus$() {
  $c_O.call(this)
}
$c_sc_$colon$plus$.prototype = new $h_O();
$c_sc_$colon$plus$.prototype.constructor = $c_sc_$colon$plus$;
/** @constructor */
function $h_sc_$colon$plus$() {
  /*<skip>*/
}
$h_sc_$colon$plus$.prototype = $c_sc_$colon$plus$.prototype;
$c_sc_$colon$plus$.prototype.init___ = (function() {
  return this
});
var $d_sc_$colon$plus$ = new $TypeData().initClass({
  sc_$colon$plus$: 0
}, false, "scala.collection.$colon$plus$", {
  sc_$colon$plus$: 1,
  O: 1
});
$c_sc_$colon$plus$.prototype.$classData = $d_sc_$colon$plus$;
var $n_sc_$colon$plus$ = (void 0);
function $m_sc_$colon$plus$() {
  if ((!$n_sc_$colon$plus$)) {
    $n_sc_$colon$plus$ = new $c_sc_$colon$plus$().init___()
  };
  return $n_sc_$colon$plus$
}
/** @constructor */
function $c_sc_$plus$colon$() {
  $c_O.call(this)
}
$c_sc_$plus$colon$.prototype = new $h_O();
$c_sc_$plus$colon$.prototype.constructor = $c_sc_$plus$colon$;
/** @constructor */
function $h_sc_$plus$colon$() {
  /*<skip>*/
}
$h_sc_$plus$colon$.prototype = $c_sc_$plus$colon$.prototype;
$c_sc_$plus$colon$.prototype.init___ = (function() {
  return this
});
var $d_sc_$plus$colon$ = new $TypeData().initClass({
  sc_$plus$colon$: 0
}, false, "scala.collection.$plus$colon$", {
  sc_$plus$colon$: 1,
  O: 1
});
$c_sc_$plus$colon$.prototype.$classData = $d_sc_$plus$colon$;
var $n_sc_$plus$colon$ = (void 0);
function $m_sc_$plus$colon$() {
  if ((!$n_sc_$plus$colon$)) {
    $n_sc_$plus$colon$ = new $c_sc_$plus$colon$().init___()
  };
  return $n_sc_$plus$colon$
}
/** @constructor */
function $c_sc_Iterator$() {
  $c_O.call(this);
  this.empty$1 = null
}
$c_sc_Iterator$.prototype = new $h_O();
$c_sc_Iterator$.prototype.constructor = $c_sc_Iterator$;
/** @constructor */
function $h_sc_Iterator$() {
  /*<skip>*/
}
$h_sc_Iterator$.prototype = $c_sc_Iterator$.prototype;
$c_sc_Iterator$.prototype.init___ = (function() {
  $n_sc_Iterator$ = this;
  this.empty$1 = new $c_sc_Iterator$$anon$2().init___();
  return this
});
var $d_sc_Iterator$ = new $TypeData().initClass({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", {
  sc_Iterator$: 1,
  O: 1
});
$c_sc_Iterator$.prototype.$classData = $d_sc_Iterator$;
var $n_sc_Iterator$ = (void 0);
function $m_sc_Iterator$() {
  if ((!$n_sc_Iterator$)) {
    $n_sc_Iterator$ = new $c_sc_Iterator$().init___()
  };
  return $n_sc_Iterator$
}
function $f_sc_TraversableOnce__mkString__T__T__T__T($thiz, start, sep, end) {
  var this$1 = $thiz.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new $c_scm_StringBuilder().init___(), start, sep, end);
  var this$2 = this$1.underlying$5;
  return this$2.content$1
}
function $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, b, start, sep, end) {
  var first = new $c_sr_BooleanRef().init___Z(true);
  b.append__T__scm_StringBuilder(start);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1, sep$1, first$1) {
    return (function(x$2) {
      if (first$1.elem$1) {
        b$1.append__O__scm_StringBuilder(x$2);
        first$1.elem$1 = false;
        return (void 0)
      } else {
        b$1.append__T__scm_StringBuilder(sep$1);
        return b$1.append__O__scm_StringBuilder(x$2)
      }
    })
  })($thiz, b, sep, first)));
  b.append__T__scm_StringBuilder(end);
  return b
}
function $f_sc_TraversableOnce__nonEmpty__Z($thiz) {
  return (!$thiz.isEmpty__Z())
}
function $is_sc_TraversableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableOnce)))
}
function $as_sc_TraversableOnce(obj) {
  return (($is_sc_TraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.TraversableOnce"))
}
function $isArrayOf_sc_TraversableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableOnce)))
}
function $asArrayOf_sc_TraversableOnce(obj, depth) {
  return (($isArrayOf_sc_TraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.TraversableOnce;", depth))
}
/** @constructor */
function $c_scg_GenMapFactory() {
  $c_O.call(this)
}
$c_scg_GenMapFactory.prototype = new $h_O();
$c_scg_GenMapFactory.prototype.constructor = $c_scg_GenMapFactory;
/** @constructor */
function $h_scg_GenMapFactory() {
  /*<skip>*/
}
$h_scg_GenMapFactory.prototype = $c_scg_GenMapFactory.prototype;
/** @constructor */
function $c_scg_GenericCompanion() {
  $c_O.call(this)
}
$c_scg_GenericCompanion.prototype = new $h_O();
$c_scg_GenericCompanion.prototype.constructor = $c_scg_GenericCompanion;
/** @constructor */
function $h_scg_GenericCompanion() {
  /*<skip>*/
}
$h_scg_GenericCompanion.prototype = $c_scg_GenericCompanion.prototype;
function $f_scg_Growable__loop$1__pscg_Growable__sc_LinearSeq__V($thiz, xs) {
  _loop: while (true) {
    var this$1 = xs;
    if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
      $thiz.$$plus$eq__O__scg_Growable(xs.head__O());
      xs = $as_sc_LinearSeq(xs.tail__O());
      continue _loop
    };
    break
  }
}
function $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz, xs) {
  if ($is_sc_LinearSeq(xs)) {
    var x2 = $as_sc_LinearSeq(xs);
    var xs$1 = x2;
    $f_scg_Growable__loop$1__pscg_Growable__sc_LinearSeq__V($thiz, xs$1)
  } else {
    xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(elem$2) {
        return $this.$$plus$eq__O__scg_Growable(elem$2)
      })
    })($thiz)))
  };
  return $thiz
}
/** @constructor */
function $c_sci_Stream$$hash$colon$colon$() {
  $c_O.call(this)
}
$c_sci_Stream$$hash$colon$colon$.prototype = new $h_O();
$c_sci_Stream$$hash$colon$colon$.prototype.constructor = $c_sci_Stream$$hash$colon$colon$;
/** @constructor */
function $h_sci_Stream$$hash$colon$colon$() {
  /*<skip>*/
}
$h_sci_Stream$$hash$colon$colon$.prototype = $c_sci_Stream$$hash$colon$colon$.prototype;
$c_sci_Stream$$hash$colon$colon$.prototype.init___ = (function() {
  return this
});
var $d_sci_Stream$$hash$colon$colon$ = new $TypeData().initClass({
  sci_Stream$$hash$colon$colon$: 0
}, false, "scala.collection.immutable.Stream$$hash$colon$colon$", {
  sci_Stream$$hash$colon$colon$: 1,
  O: 1
});
$c_sci_Stream$$hash$colon$colon$.prototype.$classData = $d_sci_Stream$$hash$colon$colon$;
var $n_sci_Stream$$hash$colon$colon$ = (void 0);
function $m_sci_Stream$$hash$colon$colon$() {
  if ((!$n_sci_Stream$$hash$colon$colon$)) {
    $n_sci_Stream$$hash$colon$colon$ = new $c_sci_Stream$$hash$colon$colon$().init___()
  };
  return $n_sci_Stream$$hash$colon$colon$
}
/** @constructor */
function $c_sci_StreamIterator$LazyCell() {
  $c_O.call(this);
  this.v$1 = null;
  this.st$1 = null;
  this.bitmap$0$1 = false;
  this.$$outer$1 = null
}
$c_sci_StreamIterator$LazyCell.prototype = new $h_O();
$c_sci_StreamIterator$LazyCell.prototype.constructor = $c_sci_StreamIterator$LazyCell;
/** @constructor */
function $h_sci_StreamIterator$LazyCell() {
  /*<skip>*/
}
$h_sci_StreamIterator$LazyCell.prototype = $c_sci_StreamIterator$LazyCell.prototype;
$c_sci_StreamIterator$LazyCell.prototype.init___sci_StreamIterator__F0 = (function($$outer, st) {
  this.st$1 = st;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_sci_StreamIterator$LazyCell.prototype.v$lzycompute__p1__sci_Stream = (function() {
  if ((!this.bitmap$0$1)) {
    this.v$1 = $as_sci_Stream(this.st$1.apply__O());
    this.bitmap$0$1 = true
  };
  this.st$1 = null;
  return this.v$1
});
$c_sci_StreamIterator$LazyCell.prototype.v__sci_Stream = (function() {
  return ((!this.bitmap$0$1) ? this.v$lzycompute__p1__sci_Stream() : this.v$1)
});
var $d_sci_StreamIterator$LazyCell = new $TypeData().initClass({
  sci_StreamIterator$LazyCell: 0
}, false, "scala.collection.immutable.StreamIterator$LazyCell", {
  sci_StreamIterator$LazyCell: 1,
  O: 1
});
$c_sci_StreamIterator$LazyCell.prototype.$classData = $d_sci_StreamIterator$LazyCell;
/** @constructor */
function $c_sci_StringOps$() {
  $c_O.call(this)
}
$c_sci_StringOps$.prototype = new $h_O();
$c_sci_StringOps$.prototype.constructor = $c_sci_StringOps$;
/** @constructor */
function $h_sci_StringOps$() {
  /*<skip>*/
}
$h_sci_StringOps$.prototype = $c_sci_StringOps$.prototype;
$c_sci_StringOps$.prototype.init___ = (function() {
  return this
});
$c_sci_StringOps$.prototype.equals$extension__T__O__Z = (function($$this, x$1) {
  if ($is_sci_StringOps(x$1)) {
    var StringOps$1 = ((x$1 === null) ? null : $as_sci_StringOps(x$1).repr$1);
    return ($$this === StringOps$1)
  } else {
    return false
  }
});
var $d_sci_StringOps$ = new $TypeData().initClass({
  sci_StringOps$: 0
}, false, "scala.collection.immutable.StringOps$", {
  sci_StringOps$: 1,
  O: 1
});
$c_sci_StringOps$.prototype.$classData = $d_sci_StringOps$;
var $n_sci_StringOps$ = (void 0);
function $m_sci_StringOps$() {
  if ((!$n_sci_StringOps$)) {
    $n_sci_StringOps$ = new $c_sci_StringOps$().init___()
  };
  return $n_sci_StringOps$
}
/** @constructor */
function $c_sci_WrappedString$() {
  $c_O.call(this)
}
$c_sci_WrappedString$.prototype = new $h_O();
$c_sci_WrappedString$.prototype.constructor = $c_sci_WrappedString$;
/** @constructor */
function $h_sci_WrappedString$() {
  /*<skip>*/
}
$h_sci_WrappedString$.prototype = $c_sci_WrappedString$.prototype;
$c_sci_WrappedString$.prototype.init___ = (function() {
  return this
});
$c_sci_WrappedString$.prototype.newBuilder__scm_Builder = (function() {
  var this$2 = new $c_scm_StringBuilder().init___();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2) {
      var x = $as_T(x$2);
      return new $c_sci_WrappedString().init___T(x)
    })
  })(this));
  return new $c_scm_Builder$$anon$1().init___scm_Builder__F1(this$2, f)
});
var $d_sci_WrappedString$ = new $TypeData().initClass({
  sci_WrappedString$: 0
}, false, "scala.collection.immutable.WrappedString$", {
  sci_WrappedString$: 1,
  O: 1
});
$c_sci_WrappedString$.prototype.$classData = $d_sci_WrappedString$;
var $n_sci_WrappedString$ = (void 0);
function $m_sci_WrappedString$() {
  if ((!$n_sci_WrappedString$)) {
    $n_sci_WrappedString$ = new $c_sci_WrappedString$().init___()
  };
  return $n_sci_WrappedString$
}
/** @constructor */
function $c_scm_ArrayOps$ofRef$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofRef$.prototype = new $h_O();
$c_scm_ArrayOps$ofRef$.prototype.constructor = $c_scm_ArrayOps$ofRef$;
/** @constructor */
function $h_scm_ArrayOps$ofRef$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofRef$.prototype = $c_scm_ArrayOps$ofRef$.prototype;
$c_scm_ArrayOps$ofRef$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofRef$.prototype.equals$extension__AO__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofRef(x$1)) {
    var ofRef$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofRef(x$1).repr$1);
    return ($$this === ofRef$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofRef$ = new $TypeData().initClass({
  scm_ArrayOps$ofRef$: 0
}, false, "scala.collection.mutable.ArrayOps$ofRef$", {
  scm_ArrayOps$ofRef$: 1,
  O: 1
});
$c_scm_ArrayOps$ofRef$.prototype.$classData = $d_scm_ArrayOps$ofRef$;
var $n_scm_ArrayOps$ofRef$ = (void 0);
function $m_scm_ArrayOps$ofRef$() {
  if ((!$n_scm_ArrayOps$ofRef$)) {
    $n_scm_ArrayOps$ofRef$ = new $c_scm_ArrayOps$ofRef$().init___()
  };
  return $n_scm_ArrayOps$ofRef$
}
/** @constructor */
function $c_sjsr_Bits$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
}
$c_sjsr_Bits$.prototype = new $h_O();
$c_sjsr_Bits$.prototype.constructor = $c_sjsr_Bits$;
/** @constructor */
function $h_sjsr_Bits$() {
  /*<skip>*/
}
$h_sjsr_Bits$.prototype = $c_sjsr_Bits$.prototype;
$c_sjsr_Bits$.prototype.init___ = (function() {
  $n_sjsr_Bits$ = this;
  var x = ((($g.ArrayBuffer && $g.Int32Array) && $g.Float32Array) && $g.Float64Array);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = $uZ((!(!x)));
  this.arrayBuffer$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.ArrayBuffer(8) : null);
  this.int32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Int32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float64Array(this.arrayBuffer$1, 0, 1) : null);
  if ((!this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = ($uB(new $g.Int8Array(this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
$c_sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = $uI((value | 0));
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var t = this.doubleToLongBits__D__J(value);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return (lo ^ hi)
  }
});
$c_sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = $uD($g.Math.pow(2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= $uD($g.Math.pow(2.0, (-1022))))) {
      var twoPowFbits = $uD($g.Math.pow(2.0, 52));
      var a = ($uD($g.Math.log(av)) / 0.6931471805599453);
      var x = $uD($g.Math.floor(a));
      var a$1 = $uI((x | 0));
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var n = ((av / $uD($g.Math.pow(2.0, b))) * twoPowFbits);
      var w = $uD($g.Math.floor(n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / $uD($g.Math.pow(2.0, (-1074))));
      var w$1 = $uD($g.Math.floor(n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = $uZ(x1_$_$$und1$1);
  var e$1 = $uI(x1_$_$$und2$1);
  var f$3 = $uD(x1_$_$$und3$1);
  var x$1 = (f$3 / 4.294967296E9);
  var hif = $uI((x$1 | 0));
  var hi = (((s$1 ? (-2147483648) : 0) | (e$1 << 20)) | hif);
  var lo = $uI((f$3 | 0));
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f) {
    this.float64Array$1[0] = value;
    var value$1 = $uI(this.int32Array$1[this.highOffset$1]);
    var value$2 = $uI(this.int32Array$1[this.lowOffset$1]);
    return new $c_sjsr_RuntimeLong().init___I__I(value$2, value$1)
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
var $d_sjsr_Bits$ = new $TypeData().initClass({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
$c_sjsr_Bits$.prototype.$classData = $d_sjsr_Bits$;
var $n_sjsr_Bits$ = (void 0);
function $m_sjsr_Bits$() {
  if ((!$n_sjsr_Bits$)) {
    $n_sjsr_Bits$ = new $c_sjsr_Bits$().init___()
  };
  return $n_sjsr_Bits$
}
/** @constructor */
function $c_sjsr_RuntimeString$() {
  $c_O.call(this);
  this.CASE$undINSENSITIVE$undORDER$1 = null;
  this.bitmap$0$1 = false
}
$c_sjsr_RuntimeString$.prototype = new $h_O();
$c_sjsr_RuntimeString$.prototype.constructor = $c_sjsr_RuntimeString$;
/** @constructor */
function $h_sjsr_RuntimeString$() {
  /*<skip>*/
}
$h_sjsr_RuntimeString$.prototype = $c_sjsr_RuntimeString$.prototype;
$c_sjsr_RuntimeString$.prototype.init___ = (function() {
  return this
});
$c_sjsr_RuntimeString$.prototype.indexOf__T__I__I__I = (function(thiz, ch, fromIndex) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz.indexOf(str, fromIndex))
});
$c_sjsr_RuntimeString$.prototype.valueOf__O__T = (function(value) {
  return ((value === null) ? "null" : $objectToString(value))
});
$c_sjsr_RuntimeString$.prototype.split__T__T__I__AT = (function(thiz, regex, limit) {
  if ((thiz === null)) {
    throw new $c_jl_NullPointerException().init___()
  };
  var this$1 = $m_ju_regex_Pattern$();
  return this$1.compile__T__I__ju_regex_Pattern(regex, 0).split__jl_CharSequence__I__AT(thiz, limit)
});
$c_sjsr_RuntimeString$.prototype.lastIndexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz.lastIndexOf(str))
});
$c_sjsr_RuntimeString$.prototype.indexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz.indexOf(str))
});
$c_sjsr_RuntimeString$.prototype.fromCodePoint__p1__I__T = (function(codePoint) {
  if ((((-65536) & codePoint) === 0)) {
    return $as_T($g.String.fromCharCode(codePoint))
  } else if (((codePoint < 0) || (codePoint > 1114111))) {
    throw new $c_jl_IllegalArgumentException().init___()
  } else {
    var offsetCp = (((-65536) + codePoint) | 0);
    return $as_T($g.String.fromCharCode((55296 | (offsetCp >> 10)), (56320 | (1023 & offsetCp))))
  }
});
$c_sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + $uI(thiz.length)) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + $imul((65535 & $uI(thiz.charCodeAt(index))), mul)) | 0);
    mul = $imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
var $d_sjsr_RuntimeString$ = new $TypeData().initClass({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
$c_sjsr_RuntimeString$.prototype.$classData = $d_sjsr_RuntimeString$;
var $n_sjsr_RuntimeString$ = (void 0);
function $m_sjsr_RuntimeString$() {
  if ((!$n_sjsr_RuntimeString$)) {
    $n_sjsr_RuntimeString$ = new $c_sjsr_RuntimeString$().init___()
  };
  return $n_sjsr_RuntimeString$
}
/** @constructor */
function $c_sjsr_package$() {
  $c_O.call(this)
}
$c_sjsr_package$.prototype = new $h_O();
$c_sjsr_package$.prototype.constructor = $c_sjsr_package$;
/** @constructor */
function $h_sjsr_package$() {
  /*<skip>*/
}
$h_sjsr_package$.prototype = $c_sjsr_package$.prototype;
$c_sjsr_package$.prototype.init___ = (function() {
  return this
});
$c_sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if ($is_sjs_js_JavaScriptException(th)) {
    var x2 = $as_sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
$c_sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if ($is_jl_Throwable(e)) {
    var x2 = $as_jl_Throwable(e);
    return x2
  } else {
    return new $c_sjs_js_JavaScriptException().init___O(e)
  }
});
var $d_sjsr_package$ = new $TypeData().initClass({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
$c_sjsr_package$.prototype.$classData = $d_sjsr_package$;
var $n_sjsr_package$ = (void 0);
function $m_sjsr_package$() {
  if ((!$n_sjsr_package$)) {
    $n_sjsr_package$ = new $c_sjsr_package$().init___()
  };
  return $n_sjsr_package$
}
/** @constructor */
function $c_sr_BoxesRunTime$() {
  $c_O.call(this)
}
$c_sr_BoxesRunTime$.prototype = new $h_O();
$c_sr_BoxesRunTime$.prototype.constructor = $c_sr_BoxesRunTime$;
/** @constructor */
function $h_sr_BoxesRunTime$() {
  /*<skip>*/
}
$h_sr_BoxesRunTime$.prototype = $c_sr_BoxesRunTime$.prototype;
$c_sr_BoxesRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if ($is_jl_Character(y)) {
    var x2 = $as_jl_Character(y);
    return (xc.value$1 === x2.value$1)
  } else if ($is_jl_Number(y)) {
    var x3 = $as_jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = $uD(x3);
      return (x2$1 === xc.value$1)
    } else if ($is_sjsr_RuntimeLong(x3)) {
      var t = $uJ(x3);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var value = xc.value$1;
      var hi$1 = (value >> 31);
      return ((lo === value) && (hi === hi$1))
    } else {
      return ((x3 === null) ? (xc === null) : $objectEquals(x3, xc))
    }
  } else {
    return ((xc === null) && (y === null))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if ($is_jl_Number(y)) {
    var x2 = $as_jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
  } else if ($is_jl_Character(y)) {
    var x3 = $as_jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = $uD(xn);
      return (x2$1 === x3.value$1)
    } else if ($is_sjsr_RuntimeLong(xn)) {
      var t = $uJ(xn);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var value = x3.value$1;
      var hi$1 = (value >> 31);
      return ((lo === value) && (hi === hi$1))
    } else {
      return ((xn === null) ? (x3 === null) : $objectEquals(xn, x3))
    }
  } else {
    return ((xn === null) ? (y === null) : $objectEquals(xn, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true
  } else if ($is_jl_Number(x)) {
    var x2 = $as_jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y)
  } else if ($is_jl_Character(x)) {
    var x3 = $as_jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y)
  } else {
    return ((x === null) ? (y === null) : $objectEquals(x, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = $uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = $uD(yn);
      return (x2 === x2$2)
    } else if ($is_sjsr_RuntimeLong(yn)) {
      var t = $uJ(yn);
      var lo = t.lo$2;
      var hi = t.hi$2;
      return (x2 === $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi))
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4 = $as_s_math_ScalaNumber(yn);
      return x4.equals__O__Z(x2)
    } else {
      return false
    }
  } else if ($is_sjsr_RuntimeLong(xn)) {
    var t$1 = $uJ(xn);
    var lo$1 = t$1.lo$2;
    var hi$1 = t$1.hi$2;
    if ($is_sjsr_RuntimeLong(yn)) {
      var t$2 = $uJ(yn);
      var lo$2 = t$2.lo$2;
      var hi$2 = t$2.hi$2;
      return ((lo$1 === lo$2) && (hi$1 === hi$2))
    } else if (((typeof yn) === "number")) {
      var x3$3 = $uD(yn);
      return ($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo$1, hi$1) === x3$3)
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4$2 = $as_s_math_ScalaNumber(yn);
      return x4$2.equals__O__Z(new $c_sjsr_RuntimeLong().init___I__I(lo$1, hi$1))
    } else {
      return false
    }
  } else {
    return ((xn === null) ? (yn === null) : $objectEquals(xn, yn))
  }
});
var $d_sr_BoxesRunTime$ = new $TypeData().initClass({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
$c_sr_BoxesRunTime$.prototype.$classData = $d_sr_BoxesRunTime$;
var $n_sr_BoxesRunTime$ = (void 0);
function $m_sr_BoxesRunTime$() {
  if ((!$n_sr_BoxesRunTime$)) {
    $n_sr_BoxesRunTime$ = new $c_sr_BoxesRunTime$().init___()
  };
  return $n_sr_BoxesRunTime$
}
var $d_sr_Null$ = new $TypeData().initClass({
  sr_Null$: 0
}, false, "scala.runtime.Null$", {
  sr_Null$: 1,
  O: 1
});
/** @constructor */
function $c_sr_ScalaRunTime$() {
  $c_O.call(this)
}
$c_sr_ScalaRunTime$.prototype = new $h_O();
$c_sr_ScalaRunTime$.prototype.constructor = $c_sr_ScalaRunTime$;
/** @constructor */
function $h_sr_ScalaRunTime$() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$.prototype = $c_sr_ScalaRunTime$.prototype;
$c_sr_ScalaRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_ScalaRunTime$.prototype.array$undlength__O__I = (function(xs) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.u.length
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.u.length
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.u.length
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.u.length
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.u.length
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    return x7.u.length
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.u.length
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.u.length
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.u.length
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.u.length
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.array$undupdate__O__I__O__V = (function(xs, idx, value) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    x2.u[idx] = value
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    x3.u[idx] = $uI(value)
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    x4.u[idx] = $uD(value)
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    x5.u[idx] = $uJ(value)
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    x6.u[idx] = $uF(value)
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    if ((value === null)) {
      var jsx$1 = 0
    } else {
      var this$2 = $as_jl_Character(value);
      var jsx$1 = this$2.value$1
    };
    x7.u[idx] = jsx$1
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    x8.u[idx] = $uB(value)
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    x9.u[idx] = $uS(value)
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    x10.u[idx] = $uZ(value)
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    x11.u[idx] = (void 0)
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.$$undtoString__s_Product__T = (function(x) {
  var this$1 = x.productIterator__sc_Iterator();
  var start = (x.productPrefix__T() + "(");
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, ",", ")")
});
$c_sr_ScalaRunTime$.prototype.array$undapply__O__I__O = (function(xs, idx) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.u[idx]
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.u[idx]
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.u[idx]
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.u[idx]
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.u[idx]
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    var c = x7.u[idx];
    return new $c_jl_Character().init___C(c)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.u[idx]
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.u[idx]
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.u[idx]
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.u[idx]
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
var $d_sr_ScalaRunTime$ = new $TypeData().initClass({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
$c_sr_ScalaRunTime$.prototype.$classData = $d_sr_ScalaRunTime$;
var $n_sr_ScalaRunTime$ = (void 0);
function $m_sr_ScalaRunTime$() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$().init___()
  };
  return $n_sr_ScalaRunTime$
}
/** @constructor */
function $c_sr_Statics$() {
  $c_O.call(this)
}
$c_sr_Statics$.prototype = new $h_O();
$c_sr_Statics$.prototype.constructor = $c_sr_Statics$;
/** @constructor */
function $h_sr_Statics$() {
  /*<skip>*/
}
$h_sr_Statics$.prototype = $c_sr_Statics$.prototype;
$c_sr_Statics$.prototype.init___ = (function() {
  return this
});
$c_sr_Statics$.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> 17) | 0));
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_sr_Statics$.prototype.doubleHash__D__I = (function(dv) {
  var iv = $doubleToInt(dv);
  if ((iv === dv)) {
    return iv
  } else {
    var this$1 = $m_sjsr_RuntimeLong$();
    var lo = this$1.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(dv);
    var hi = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
    return (($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi) === dv) ? (lo ^ hi) : $m_sjsr_Bits$().numberHashCode__D__I(dv))
  }
});
$c_sr_Statics$.prototype.anyHash__O__I = (function(x) {
  if ((x === null)) {
    return 0
  } else if (((typeof x) === "number")) {
    var x3 = $uD(x);
    return this.doubleHash__D__I(x3)
  } else if ($is_sjsr_RuntimeLong(x)) {
    var t = $uJ(x);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return this.longHash__J__I(new $c_sjsr_RuntimeLong().init___I__I(lo, hi))
  } else {
    return $objectHashCode(x)
  }
});
$c_sr_Statics$.prototype.avalanche__I__I = (function(h0) {
  var h = h0;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_sr_Statics$.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> 19) | 0));
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_sr_Statics$.prototype.longHash__J__I = (function(lv) {
  var lo = lv.lo$2;
  var lo$1 = lv.hi$2;
  return ((lo$1 === (lo >> 31)) ? lo : (lo ^ lo$1))
});
$c_sr_Statics$.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__I__I((hash ^ length))
});
var $d_sr_Statics$ = new $TypeData().initClass({
  sr_Statics$: 0
}, false, "scala.runtime.Statics$", {
  sr_Statics$: 1,
  O: 1
});
$c_sr_Statics$.prototype.$classData = $d_sr_Statics$;
var $n_sr_Statics$ = (void 0);
function $m_sr_Statics$() {
  if ((!$n_sr_Statics$)) {
    $n_sr_Statics$ = new $c_sr_Statics$().init___()
  };
  return $n_sr_Statics$
}
/** @constructor */
function $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground() {
  $c_Lsgl_scene_SceneGraphComponent$SceneNode.call(this);
  this.$$outer$2 = null
}
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground.prototype = new $h_Lsgl_scene_SceneGraphComponent$SceneNode();
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground.prototype.constructor = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground;
/** @constructor */
function $h_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground() {
  /*<skip>*/
}
$h_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground.prototype = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground.prototype;
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground.prototype.update__J__V = (function(dt) {
  /*<skip>*/
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground.prototype.render__Lsgl_GraphicsProvider$AbstractCanvas__V = (function(canvas) {
  var this$1 = $as_Lsgl_GraphicsProvider(this.$$outer$2.$$outer$1);
  var this$2 = this$1.Color$1;
  var color = this$2.rgb__I__I__I__T(255, 0, 0);
  canvas.drawColor__T__V(color)
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground.prototype.init___Lcom_regblanc_scalavator_core_MainScreenComponent$Hud = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  $c_Lsgl_scene_SceneGraphComponent$SceneNode.prototype.init___Lsgl_scene_SceneGraphComponent__F__F__F__F.call(this, $as_Lsgl_scene_SceneGraphComponent($$outer.$$outer$1), 0.0, 0.0, 0.0, 0.0);
  return this
});
var $d_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground = new $TypeData().initClass({
  Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground: 0
}, false, "com.regblanc.scalavator.core.MainScreenComponent$Hud$GroupBackground", {
  Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground: 1,
  Lsgl_scene_SceneGraphComponent$SceneNode: 1,
  O: 1
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground.prototype.$classData = $d_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$GroupBackground;
/** @constructor */
function $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel() {
  $c_Lsgl_scene_SceneGraphComponent$SceneNode.call(this);
  this.score$2 = 0;
  this.$$outer$2 = null
}
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel.prototype = new $h_Lsgl_scene_SceneGraphComponent$SceneNode();
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel.prototype.constructor = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel;
/** @constructor */
function $h_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel() {
  /*<skip>*/
}
$h_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel.prototype = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel.prototype;
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel.prototype.update__J__V = (function(dt) {
  /*<skip>*/
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel.prototype.render__Lsgl_GraphicsProvider$AbstractCanvas__V = (function(canvas) {
  var this$1 = this.score$2;
  var str = ("" + this$1);
  var x = $doubleToInt(this.x$1);
  var y = $doubleToInt(this.y$1);
  var this$3 = this.$$outer$2.com$regblanc$scalavator$core$MainScreenComponent$Hud$$textPaint$1;
  var alignment = $as_Lsgl_GraphicsProvider(this.$$outer$2.$$outer$1).Alignments__Lsgl_GraphicsProvider$Alignments$().Right__Lsgl_GraphicsProvider$Alignments$Right$();
  var paint = this$3.withAlignment__Lsgl_GraphicsProvider$Alignments$Alignment__Lsgl_html5_Html5GraphicsProvider$Html5Paint(alignment);
  canvas.drawString__T__I__I__Lsgl_html5_Html5GraphicsProvider$Html5Paint__V(str, x, y, paint)
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel.prototype.init___Lcom_regblanc_scalavator_core_MainScreenComponent$Hud = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  var jsx$3 = $as_Lsgl_scene_SceneGraphComponent($$outer.$$outer$1);
  var this$1 = $as_Lsgl_WindowProvider($$outer.$$outer$1);
  var jsx$2 = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$1);
  var this$2 = $as_Lsgl_WindowProvider($$outer.$$outer$1);
  var jsx$1 = $f_Lsgl_WindowProvider__dp2px__I__I(this$2, 15);
  var this$3 = $as_Lsgl_WindowProvider($$outer.$$outer$1);
  $c_Lsgl_scene_SceneGraphComponent$SceneNode.prototype.init___Lsgl_scene_SceneGraphComponent__F__F__F__F.call(this, jsx$3, $fround(((jsx$2 - jsx$1) | 0)), $fround($f_Lsgl_WindowProvider__dp2px__I__I(this$3, 25)), 0.0, 0.0);
  this.score$2 = 0;
  return this
});
var $d_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel = new $TypeData().initClass({
  Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel: 0
}, false, "com.regblanc.scalavator.core.MainScreenComponent$Hud$ScoreLabel", {
  Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel: 1,
  Lsgl_scene_SceneGraphComponent$SceneNode: 1,
  O: 1
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel.prototype.$classData = $d_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$ScoreLabel;
/** @constructor */
function $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel() {
  $c_Lsgl_scene_SceneGraphComponent$SceneNode.call(this);
  this.$$outer$2 = null
}
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel.prototype = new $h_Lsgl_scene_SceneGraphComponent$SceneNode();
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel.prototype.constructor = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel;
/** @constructor */
function $h_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel() {
  /*<skip>*/
}
$h_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel.prototype = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel.prototype;
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel.prototype.update__J__V = (function(dt) {
  /*<skip>*/
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel.prototype.render__Lsgl_GraphicsProvider$AbstractCanvas__V = (function(canvas) {
  var x = $doubleToInt(this.x$1);
  var y = $doubleToInt(this.y$1);
  var paint = this.$$outer$2.com$regblanc$scalavator$core$MainScreenComponent$Hud$$textPaint$1;
  canvas.drawString__T__I__I__Lsgl_html5_Html5GraphicsProvider$Html5Paint__V("Scalavator", x, y, $as_Lsgl_html5_Html5GraphicsProvider$Html5Paint(paint))
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel.prototype.init___Lcom_regblanc_scalavator_core_MainScreenComponent$Hud = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  var jsx$2 = $as_Lsgl_scene_SceneGraphComponent($$outer.$$outer$1);
  var this$1 = $as_Lsgl_WindowProvider($$outer.$$outer$1);
  var jsx$1 = $f_Lsgl_WindowProvider__dp2px__I__I(this$1, 15);
  var this$2 = $as_Lsgl_WindowProvider($$outer.$$outer$1);
  $c_Lsgl_scene_SceneGraphComponent$SceneNode.prototype.init___Lsgl_scene_SceneGraphComponent__F__F__F__F.call(this, jsx$2, $fround(jsx$1), $fround($f_Lsgl_WindowProvider__dp2px__I__I(this$2, 25)), 0.0, 0.0);
  return this
});
var $d_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel = new $TypeData().initClass({
  Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel: 0
}, false, "com.regblanc.scalavator.core.MainScreenComponent$Hud$TitleLabel", {
  Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel: 1,
  Lsgl_scene_SceneGraphComponent$SceneNode: 1,
  O: 1
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel.prototype.$classData = $d_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud$TitleLabel;
/** @constructor */
function $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen() {
  $c_Lsgl_GameStateComponent$GameScreen.call(this);
  this.Platform$module$2 = null;
  this.Tag$2 = null;
  this.Gravity$2 = null;
  this.JumpImpulsion$2 = 0;
  this.com$regblanc$scalavator$core$MainScreenComponent$MainScreen$$PlatformHeight$2 = 0;
  this.startingPlatform$2 = null;
  this.platforms$2 = null;
  this.CharacterWidth$2 = 0;
  this.CharacterHeight$2 = 0;
  this.characterPosition$2 = null;
  this.characterVelocity$2 = null;
  this.characterBitmap$2 = null;
  this.characterFrames$2 = null;
  this.com$regblanc$scalavator$core$MainScreenComponent$MainScreen$$CharacterIdleAnimation$2 = null;
  this.CharacterStartJumpAnimation$2 = null;
  this.CharacterEndJumpAnimation$2 = null;
  this.characterAnimation$2 = null;
  this.jumpingDuration$2 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  this.standingPlatform$2 = null;
  this.score$2 = 0;
  this.randomNextPop$2 = 0;
  this.hud$2 = null;
  this.accumulatedDelta$2 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  this.FixedDelta$2 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  this.$$outer$2 = null
}
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype = new $h_Lsgl_GameStateComponent$GameScreen();
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.constructor = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen;
/** @constructor */
function $h_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen() {
  /*<skip>*/
}
$h_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype = $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype;
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.generateRandomNextPop__p2__I = (function() {
  var this$2 = $as_Lsgl_WindowProvider(this.$$outer$2);
  var this$1 = $m_s_util_Random$();
  var x = ((60 + this$1.self$1.nextInt__I__I(30)) | 0);
  return $f_Lsgl_WindowProvider__dp2px__I__I(this$2, x)
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.fixedUpdate__J__V = (function(dt) {
  var this$1 = this.hud$2.sceneGraph$1;
  this$1.root$1.update__J__V(dt);
  var originalCharacterFeet = this.characterPosition$2.y$1;
  var this$2 = this.platforms$2;
  var these = this$2;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    var x$1 = $as_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(arg1);
    x$1.update__J__V(dt);
    var this$3 = these;
    these = this$3.tail__sci_List()
  };
  var x1 = this.standingPlatform$2;
  var x = $m_s_None$();
  if ((x === x1)) {
    var previousVelocity = this.characterVelocity$2;
    this.characterVelocity$2 = this.characterVelocity$2.$$plus__Lsgl_geometry_Vec__Lsgl_geometry_Vec(this.Gravity$2.$$times__D__Lsgl_geometry_Vec(($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(dt.lo$2, dt.hi$2) / 1000.0)));
    this.characterPosition$2 = this.characterPosition$2.$$plus__Lsgl_geometry_Vec__Lsgl_geometry_Point(this.characterVelocity$2.$$times__D__Lsgl_geometry_Vec(($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(dt.lo$2, dt.hi$2) / 1000.0)));
    if (((previousVelocity.y$1 <= 0) && (this.characterVelocity$2.y$1 >= 0))) {
      this.characterAnimation$2.currentAnimation$und$eq__Lsgl_GraphicsHelpersComponent$Animation__V(this.CharacterEndJumpAnimation$2)
    };
    var jsx$1 = this.characterPosition$2.y$1;
    var this$4 = $as_Lsgl_WindowProvider(this.$$outer$2);
    if (($doubleToInt(jsx$1) < (($f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$4) / 2) | 0))) {
      var this$5 = $as_Lsgl_WindowProvider(this.$$outer$2);
      this.scrollUp__p2__I__V((((($f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$5) / 2) | 0) - $doubleToInt(this.characterPosition$2.y$1)) | 0))
    }
  } else if ($is_s_Some(x1)) {
    var x2 = $as_s_Some(x1);
    var platform = $as_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(x2.value$2);
    this.characterPosition$2 = this.characterPosition$2.$$plus__Lsgl_geometry_Vec__Lsgl_geometry_Point(new $c_Lsgl_geometry_Vec().init___D__D(1.0, 0.0).$$times__D__Lsgl_geometry_Vec(platform.speed$1).$$times__D__Lsgl_geometry_Vec(($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(dt.lo$2, dt.hi$2) / 1000.0)));
    if ((this.characterPosition$2.x$1 < 0)) {
      var qual$1 = this.characterPosition$2;
      var x$4 = qual$1.y$1;
      this.characterPosition$2 = new $c_Lsgl_geometry_Point().init___D__D(0.0, x$4)
    };
    var jsx$3 = this.characterPosition$2.x$1;
    var jsx$2 = this.CharacterWidth$2;
    var this$6 = $as_Lsgl_WindowProvider(this.$$outer$2);
    if (((jsx$3 + jsx$2) > $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$6))) {
      var qual$2 = this.characterPosition$2;
      var this$7 = $as_Lsgl_WindowProvider(this.$$outer$2);
      var x$5 = (($f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$7) - this.CharacterWidth$2) | 0);
      var x$6 = qual$2.y$1;
      this.characterPosition$2 = new $c_Lsgl_geometry_Point().init___D__D(x$5, x$6)
    }
  } else {
    throw new $c_s_MatchError().init___O(x1)
  };
  var newCharacterFeet = this.characterPosition$2.y$1;
  if ((newCharacterFeet > originalCharacterFeet)) {
    var this$8 = this.platforms$2;
    inlinereturn$19: {
      var these$1 = this$8;
      while ((!these$1.isEmpty__Z())) {
        var arg1$1 = these$1.head__O();
        var p = $as_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(arg1$1);
        if ((((((1 + p.y$1) > originalCharacterFeet) && ((1 + p.y$1) <= newCharacterFeet)) && (p.x$1 <= (this.characterPosition$2.x$1 + this.CharacterWidth$2))) && ((p.x$1 + p.width$1) >= this.characterPosition$2.x$1))) {
          var this$9 = new $c_s_Some().init___O(these$1.head__O());
          break inlinereturn$19
        };
        these$1 = $as_sc_LinearSeqOptimized(these$1.tail__O())
      };
      var this$9 = $m_s_None$()
    };
    if ((!this$9.isEmpty__Z())) {
      var arg1$2 = this$9.get__O();
      var platform$2 = $as_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(arg1$2);
      this.standingPlatform$2 = new $c_s_Some().init___O(platform$2);
      this.characterAnimation$2.currentAnimation$und$eq__Lsgl_GraphicsHelpersComponent$Animation__V(this.com$regblanc$scalavator$core$MainScreenComponent$MainScreen$$CharacterIdleAnimation$2)
    };
    var x$7 = this.standingPlatform$2;
    var x$8 = $m_s_None$();
    if (((x$7 !== null) && x$7.equals__O__Z(x$8))) {
      var jsx$6 = this.characterPosition$2.y$1;
      var jsx$5 = this.CharacterHeight$2;
      var this$10 = $as_Lsgl_WindowProvider(this.$$outer$2);
      var jsx$4 = ((jsx$6 - jsx$5) > $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$10))
    } else {
      var jsx$4 = false
    };
    if (jsx$4) {
      $as_Lsgl_util_LoggingProvider(this.$$outer$2);
      $as_Lsgl_GameStateComponent(this.$$outer$2).gameState$1.newScreen__Lsgl_GameStateComponent$GameScreen__V(new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen().init___Lcom_regblanc_scalavator_core_MainScreenComponent(this.$$outer$2))
    }
  }
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.scrollUp__p2__I__V = (function(distance) {
  var this$1 = this.platforms$2;
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    var plat = $as_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(arg1);
    plat.y$1 = (plat.y$1 + distance);
    var this$2 = these;
    these = this$2.tail__sci_List()
  };
  this.characterPosition$2 = this.characterPosition$2.$$plus__Lsgl_geometry_Vec__Lsgl_geometry_Point(new $c_Lsgl_geometry_Vec().init___D__D(0.0, distance));
  this.hud$2.scoreLabel$1.score$2 = ((this.hud$2.scoreLabel$1.score$2 + distance) | 0);
  if (($as_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(this.platforms$2.head__O()).y$1 >= this.randomNextPop$2)) {
    this.randomNextPop$2 = this.generateRandomNextPop__p2__I();
    var this$3 = this.platforms$2;
    var x = this.Platform__Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$().random__D__Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(0.0);
    this.platforms$2 = new $c_sci_$colon$colon().init___O__sci_List(x, this$3)
  };
  var this$4 = this.platforms$2;
  $m_sci_List$();
  var b = new $c_scm_ListBuffer().init___();
  var these$1 = this$4;
  while ((!these$1.isEmpty__Z())) {
    var arg1$1 = these$1.head__O();
    var p = $as_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(arg1$1);
    var jsx$1 = p.y$1;
    var this$6 = $as_Lsgl_WindowProvider(this.$$outer$2);
    if (((jsx$1 > $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$6)) !== true)) {
      b.$$plus$eq__O__scm_ListBuffer(arg1$1)
    };
    var this$7 = these$1;
    these$1 = this$7.tail__sci_List()
  };
  this.platforms$2 = b.toList__sci_List();
  $as_Lsgl_util_LoggingProvider(this.$$outer$2)
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.handleInput__Lsgl_InputProvider$Input$InputEvent__V = (function(ev) {
  matchEnd15: {
    var jsx$1;
    if ($is_Lsgl_InputProvider$Input$TouchDownEvent(ev)) {
      var jsx$1 = true;
      break matchEnd15
    };
    if ($is_Lsgl_InputProvider$Input$MouseDownEvent(ev)) {
      var x6 = $as_Lsgl_InputProvider$Input$MouseDownEvent(ev);
      var p9 = x6.mouseButton$1;
      var x = $as_Lsgl_InputProvider(this.$$outer$2).Input__Lsgl_InputProvider$Input$().MouseButtons__Lsgl_InputProvider$Input$MouseButtons$().Left__Lsgl_InputProvider$Input$MouseButtons$Left$();
      if ((x === p9)) {
        var jsx$1 = true;
        break matchEnd15
      }
    };
    var jsx$1 = false
  };
  if (jsx$1) {
    $as_Lsgl_util_LoggingProvider(this.$$outer$2);
    var this$2 = this.standingPlatform$2;
    if (this$2.isDefined__Z()) {
      this.standingPlatform$2 = $m_s_None$();
      this.characterVelocity$2 = new $c_Lsgl_geometry_Vec().init___D__D(0.0, ((-this.JumpImpulsion$2) | 0));
      this.characterAnimation$2.currentAnimation$und$eq__Lsgl_GraphicsHelpersComponent$Animation__V(this.CharacterStartJumpAnimation$2)
    }
  }
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.update__J__V = (function(dt) {
  $as_Lsgl_util_LoggingProvider(this.$$outer$2);
  $as_Lsgl_util_LoggingProvider(this.$$outer$2);
  var this$3 = $as_Lsgl_InputProvider(this.$$outer$2).Input__Lsgl_InputProvider$Input$();
  var f = (function($this) {
    return (function(x$2) {
      $as_Lsgl_InputProvider$Input$InputEvent(x$2);
      return true
    })
  })(this$3);
  var this$4 = this$3.eventQueue$1;
  var this$5 = this$4.first0$5;
  if ($f_scm_LinkedListLike__isEmpty__Z(this$5)) {
    $m_scm_Seq$();
    var this$7 = new $c_scm_ArrayBuffer().init___();
    var this$20 = this$7
  } else {
    var res = new $c_scm_ArrayBuffer().init___();
    while (true) {
      var this$8 = this$4.first0$5;
      if ($f_sc_TraversableOnce__nonEmpty__Z(this$8)) {
        var arg1 = this$4.first0$5.elem$5;
        var jsx$1 = $uZ(f(arg1))
      } else {
        var jsx$1 = false
      };
      if (jsx$1) {
        res.$$plus$eq__O__scm_ArrayBuffer(this$4.first0$5.elem$5);
        var this$9 = this$4.first0$5;
        this$4.first0$5 = this$9.next$5;
        this$4.decrementLength__p6__V()
      } else {
        break
      }
    };
    var this$10 = this$4.first0$5;
    if ($f_scm_LinkedListLike__isEmpty__Z(this$10)) {
      var this$20 = res
    } else {
      var leftlst = this$4.first0$5;
      while (true) {
        var this$11 = leftlst;
        var this$12 = this$11.next$5;
        if ($f_sc_TraversableOnce__nonEmpty__Z(this$12)) {
          var this$13 = leftlst;
          var arg1$1 = this$13.next$5.elem$5;
          if ($uZ(f(arg1$1))) {
            var this$14 = leftlst;
            res.$$plus$eq__O__scm_ArrayBuffer(this$14.next$5.elem$5);
            var this$15 = leftlst;
            if ((this$15.next$5 === this$4.last0$5)) {
              this$4.last0$5 = leftlst
            };
            var this$18 = leftlst;
            var this$16 = leftlst;
            var this$17 = this$16.next$5;
            var x$1 = this$17.next$5;
            this$18.next$5 = x$1;
            this$4.decrementLength__p6__V()
          } else {
            var this$19 = leftlst;
            leftlst = this$19.next$5
          }
        } else {
          break
        }
      };
      var this$20 = res
    }
  };
  var i = 0;
  var top = this$20.size0$6;
  while ((i < top)) {
    var arg1$2 = this$20.array$6.u[i];
    var ev = $as_Lsgl_InputProvider$Input$InputEvent(arg1$2);
    this.handleInput__Lsgl_InputProvider$Input$InputEvent__V(ev);
    i = ((1 + i) | 0)
  };
  var t = this.accumulatedDelta$2;
  var lo = t.lo$2;
  var hi = t.hi$2;
  var bhi = dt.hi$2;
  var lo$1 = ((lo + dt.lo$2) | 0);
  var hi$1 = ((((-2147483648) ^ lo$1) < ((-2147483648) ^ lo)) ? ((1 + ((hi + bhi) | 0)) | 0) : ((hi + bhi) | 0));
  this.accumulatedDelta$2 = new $c_sjsr_RuntimeLong().init___I__I(lo$1, hi$1);
  while (true) {
    var t$1 = this.accumulatedDelta$2;
    var lo$2 = t$1.lo$2;
    var hi$2 = t$1.hi$2;
    var b = this.FixedDelta$2;
    var this$22 = $m_sjsr_RuntimeLong$();
    var lo$3 = this$22.divideImpl__I__I__I__I__I(lo$2, hi$2, b.lo$2, b.hi$2);
    var hi$3 = this$22.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
    if ((!((lo$3 === 0) && (hi$3 === 0)))) {
      var t$2 = this.accumulatedDelta$2;
      var lo$4 = t$2.lo$2;
      var hi$4 = t$2.hi$2;
      var b$1 = this.FixedDelta$2;
      var bhi$1 = b$1.hi$2;
      var lo$5 = ((lo$4 - b$1.lo$2) | 0);
      var hi$5 = ((((-2147483648) ^ lo$5) > ((-2147483648) ^ lo$4)) ? (((-1) + ((hi$4 - bhi$1) | 0)) | 0) : ((hi$4 - bhi$1) | 0));
      this.accumulatedDelta$2 = new $c_sjsr_RuntimeLong().init___I__I(lo$5, hi$5);
      this.fixedUpdate__J__V(this.FixedDelta$2)
    } else {
      break
    }
  };
  this.characterAnimation$2.update__J__V(dt)
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.render__Lsgl_GraphicsProvider$AbstractCanvas__V = (function(canvas) {
  var this$1 = $as_Lsgl_WindowProvider(this.$$outer$2);
  var width = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$1);
  var this$2 = $as_Lsgl_WindowProvider(this.$$outer$2);
  var height = $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$2);
  var this$3 = $as_Lsgl_GraphicsProvider(this.$$outer$2);
  var this$6 = $f_Lsgl_html5_Html5GraphicsProvider__defaultPaint__Lsgl_html5_Html5GraphicsProvider$Html5Paint(this$3);
  var this$4 = $as_Lsgl_GraphicsProvider(this.$$outer$2);
  var this$5 = this$4.Color$1;
  var color = this$5.rgb__I__I__I__T(204, 242, 204);
  var paint = this$6.withColor__T__Lsgl_html5_Html5GraphicsProvider$Html5Paint(color);
  canvas.drawRect__I__I__I__I__Lsgl_html5_Html5GraphicsProvider$Html5Paint__V(0, 0, width, height, paint);
  var this$7 = this.platforms$2;
  var these = this$7;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    var x$2 = $as_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform(arg1);
    x$2.render__Lsgl_GraphicsProvider$AbstractCanvas__V(canvas);
    var this$8 = these;
    these = this$8.tail__sci_List()
  };
  var this$9 = $as_Lsgl_GraphicsHelpersComponent(this.$$outer$2);
  var jsx$3 = new $c_Lsgl_GraphicsHelpersComponent$RichCanvas().init___Lsgl_GraphicsProvider__Lsgl_GraphicsProvider$AbstractCanvas($as_Lsgl_GraphicsProvider(this$9), canvas);
  var this$10 = this.characterAnimation$2;
  var jsx$2 = this$10.$$undcurrentAnimation$1.currentFrame__J__Lsgl_GraphicsHelpersComponent$BitmapRegion(this$10.elapsed$1);
  var jsx$1 = this.characterPosition$2.x$1;
  var this$11 = $as_Lsgl_WindowProvider(this.$$outer$2);
  jsx$3.drawBitmap__Lsgl_GraphicsHelpersComponent$BitmapRegion__I__I__V(jsx$2, (($doubleToInt(jsx$1) - $f_Lsgl_WindowProvider__dp2px__I__I(this$11, 9)) | 0), (($doubleToInt(this.characterPosition$2.y$1) - this.CharacterHeight$2) | 0));
  var this$12 = this.hud$2.sceneGraph$1;
  this$12.root$1.render__Lsgl_GraphicsProvider$AbstractCanvas__V(canvas)
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.Platform__Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$ = (function() {
  if ((this.Platform$module$2 === null)) {
    this.Platform$lzycompute$1__p2__V()
  };
  return this.Platform$module$2
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.init___Lcom_regblanc_scalavator_core_MainScreenComponent = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  $c_Lsgl_GameStateComponent$GameScreen.prototype.init___Lsgl_GameStateComponent.call(this, $as_Lsgl_GameStateComponent($$outer));
  this.Tag$2 = new $c_Lsgl_util_LoggingProvider$Logger$Tag().init___Lsgl_util_LoggingProvider$Logger$__T($as_Lsgl_util_LoggingProvider($$outer).Logger__Lsgl_util_LoggingProvider$Logger$(), "main");
  var this$1 = $as_Lsgl_WindowProvider($$outer);
  this.Gravity$2 = new $c_Lsgl_geometry_Vec().init___D__D(0.0, $f_Lsgl_WindowProvider__dp2px__I__I(this$1, 500));
  var this$2 = $as_Lsgl_WindowProvider($$outer);
  this.JumpImpulsion$2 = $f_Lsgl_WindowProvider__dp2px__I__I(this$2, 600);
  var this$3 = $as_Lsgl_WindowProvider($$outer);
  this.com$regblanc$scalavator$core$MainScreenComponent$MainScreen$$PlatformHeight$2 = $f_Lsgl_WindowProvider__dp2px__I__I(this$3, 5);
  var this$4 = $as_Lsgl_WindowProvider($$outer);
  var jsx$2 = $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$4);
  var jsx$1 = this.com$regblanc$scalavator$core$MainScreenComponent$MainScreen$$PlatformHeight$2;
  var this$5 = $as_Lsgl_WindowProvider($$outer);
  this.startingPlatform$2 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform().init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen__D__D__I__D(this, 0.0, ((jsx$2 - jsx$1) | 0), $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$5), 0.0);
  $m_sci_List$();
  var this$6 = $as_Lsgl_WindowProvider($$outer);
  var jsx$26 = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$6);
  var this$7 = $as_Lsgl_WindowProvider($$outer);
  var jsx$25 = $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$7);
  var this$8 = $as_Lsgl_WindowProvider($$outer);
  var jsx$24 = $f_Lsgl_WindowProvider__dp2px__I__I(this$8, 500);
  var this$9 = $as_Lsgl_WindowProvider($$outer);
  var jsx$23 = $f_Lsgl_WindowProvider__dp2px__I__I(this$9, 70);
  var this$10 = $as_Lsgl_WindowProvider($$outer);
  var jsx$22 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform().init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen__D__D__I__D(this, ((jsx$26 / 2) | 0), ((jsx$25 - jsx$24) | 0), jsx$23, ((-$f_Lsgl_WindowProvider__dp2px__I__I(this$10, 130)) | 0));
  var this$11 = $as_Lsgl_WindowProvider($$outer);
  var jsx$21 = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$11);
  var this$12 = $as_Lsgl_WindowProvider($$outer);
  var jsx$20 = $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$12);
  var this$13 = $as_Lsgl_WindowProvider($$outer);
  var jsx$19 = $f_Lsgl_WindowProvider__dp2px__I__I(this$13, 400);
  var this$14 = $as_Lsgl_WindowProvider($$outer);
  var jsx$18 = $f_Lsgl_WindowProvider__dp2px__I__I(this$14, 70);
  var this$15 = $as_Lsgl_WindowProvider($$outer);
  var jsx$17 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform().init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen__D__D__I__D(this, ((jsx$21 / 2) | 0), ((jsx$20 - jsx$19) | 0), jsx$18, $f_Lsgl_WindowProvider__dp2px__I__I(this$15, 80));
  var this$16 = $as_Lsgl_WindowProvider($$outer);
  var jsx$16 = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$16);
  var this$17 = $as_Lsgl_WindowProvider($$outer);
  var jsx$15 = $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$17);
  var this$18 = $as_Lsgl_WindowProvider($$outer);
  var jsx$14 = $f_Lsgl_WindowProvider__dp2px__I__I(this$18, 300);
  var this$19 = $as_Lsgl_WindowProvider($$outer);
  var jsx$13 = $f_Lsgl_WindowProvider__dp2px__I__I(this$19, 70);
  var this$20 = $as_Lsgl_WindowProvider($$outer);
  var jsx$12 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform().init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen__D__D__I__D(this, ((jsx$16 / 2) | 0), ((jsx$15 - jsx$14) | 0), jsx$13, ((-$f_Lsgl_WindowProvider__dp2px__I__I(this$20, 100)) | 0));
  var this$21 = $as_Lsgl_WindowProvider($$outer);
  var jsx$11 = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$21);
  var this$22 = $as_Lsgl_WindowProvider($$outer);
  var jsx$10 = $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$22);
  var this$23 = $as_Lsgl_WindowProvider($$outer);
  var jsx$9 = $f_Lsgl_WindowProvider__dp2px__I__I(this$23, 200);
  var this$24 = $as_Lsgl_WindowProvider($$outer);
  var jsx$8 = $f_Lsgl_WindowProvider__dp2px__I__I(this$24, 70);
  var this$25 = $as_Lsgl_WindowProvider($$outer);
  var jsx$7 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform().init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen__D__D__I__D(this, ((jsx$11 / 2) | 0), ((jsx$10 - jsx$9) | 0), jsx$8, $f_Lsgl_WindowProvider__dp2px__I__I(this$25, 110));
  var this$26 = $as_Lsgl_WindowProvider($$outer);
  var jsx$6 = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$26);
  var this$27 = $as_Lsgl_WindowProvider($$outer);
  var jsx$5 = $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$27);
  var this$28 = $as_Lsgl_WindowProvider($$outer);
  var jsx$4 = $f_Lsgl_WindowProvider__dp2px__I__I(this$28, 100);
  var this$29 = $as_Lsgl_WindowProvider($$outer);
  var jsx$3 = $f_Lsgl_WindowProvider__dp2px__I__I(this$29, 70);
  var this$30 = $as_Lsgl_WindowProvider($$outer);
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$22, jsx$17, jsx$12, jsx$7, new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform().init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen__D__D__I__D(this, ((jsx$6 / 2) | 0), ((jsx$5 - jsx$4) | 0), jsx$3, $f_Lsgl_WindowProvider__dp2px__I__I(this$30, 90)), this.startingPlatform$2]);
  var this$32 = $m_sci_List$();
  var cbf = this$32.ReusableCBFInstance$2;
  this.platforms$2 = $as_sci_List($f_sc_TraversableLike__to__scg_CanBuildFrom__O(xs, cbf));
  var this$33 = $as_Lsgl_WindowProvider($$outer);
  this.CharacterWidth$2 = $f_Lsgl_WindowProvider__dp2px__I__I(this$33, 30);
  var this$34 = $as_Lsgl_WindowProvider($$outer);
  this.CharacterHeight$2 = $f_Lsgl_WindowProvider__dp2px__I__I(this$34, 68);
  var this$35 = $as_Lsgl_WindowProvider($$outer);
  var jsx$28 = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$35);
  var jsx$27 = this.CharacterWidth$2;
  var this$36 = $as_Lsgl_WindowProvider($$outer);
  this.characterPosition$2 = new $c_Lsgl_geometry_Point().init___D__D(((((jsx$28 / 2) | 0) - ((jsx$27 / 2) | 0)) | 0), (($f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$36) - this.com$regblanc$scalavator$core$MainScreenComponent$MainScreen$$PlatformHeight$2) | 0));
  this.characterVelocity$2 = new $c_Lsgl_geometry_Vec().init___D__D(0.0, 0.0);
  var this$37 = $as_Lsgl_GraphicsProvider($$outer);
  this.characterBitmap$2 = $f_Lsgl_html5_Html5GraphicsProvider__loadImageFromResource__T__Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(this$37, "drawable/character.png");
  var jsx$46 = $as_Lsgl_GraphicsProvider($$outer);
  var jsx$45 = this.characterBitmap$2;
  var this$38 = $as_Lsgl_WindowProvider($$outer);
  var jsx$44 = $f_Lsgl_WindowProvider__dp2px__I__I(this$38, 48);
  var this$39 = $as_Lsgl_WindowProvider($$outer);
  var jsx$43 = new $c_Lsgl_GraphicsHelpersComponent$BitmapRegion().init___Lsgl_GraphicsProvider__Lsgl_GraphicsProvider$AbstractBitmap__I__I__I__I(jsx$46, jsx$45, 0, 0, jsx$44, $f_Lsgl_WindowProvider__dp2px__I__I(this$39, 68));
  var jsx$42 = $as_Lsgl_GraphicsProvider($$outer);
  var jsx$41 = this.characterBitmap$2;
  var this$40 = $as_Lsgl_WindowProvider($$outer);
  var jsx$40 = $f_Lsgl_WindowProvider__dp2px__I__I(this$40, 48);
  var this$41 = $as_Lsgl_WindowProvider($$outer);
  var jsx$39 = $f_Lsgl_WindowProvider__dp2px__I__I(this$41, 48);
  var this$42 = $as_Lsgl_WindowProvider($$outer);
  var jsx$38 = new $c_Lsgl_GraphicsHelpersComponent$BitmapRegion().init___Lsgl_GraphicsProvider__Lsgl_GraphicsProvider$AbstractBitmap__I__I__I__I(jsx$42, jsx$41, jsx$40, 0, jsx$39, $f_Lsgl_WindowProvider__dp2px__I__I(this$42, 68));
  var jsx$37 = $as_Lsgl_GraphicsProvider($$outer);
  var jsx$36 = this.characterBitmap$2;
  var this$43 = $as_Lsgl_WindowProvider($$outer);
  var jsx$35 = $f_Lsgl_WindowProvider__dp2px__I__I(this$43, 96);
  var this$44 = $as_Lsgl_WindowProvider($$outer);
  var jsx$34 = $f_Lsgl_WindowProvider__dp2px__I__I(this$44, 48);
  var this$45 = $as_Lsgl_WindowProvider($$outer);
  var jsx$33 = new $c_Lsgl_GraphicsHelpersComponent$BitmapRegion().init___Lsgl_GraphicsProvider__Lsgl_GraphicsProvider$AbstractBitmap__I__I__I__I(jsx$37, jsx$36, jsx$35, 0, jsx$34, $f_Lsgl_WindowProvider__dp2px__I__I(this$45, 68));
  var jsx$32 = $as_Lsgl_GraphicsProvider($$outer);
  var jsx$31 = this.characterBitmap$2;
  var this$46 = $as_Lsgl_WindowProvider($$outer);
  var jsx$30 = $f_Lsgl_WindowProvider__dp2px__I__I(this$46, 144);
  var this$47 = $as_Lsgl_WindowProvider($$outer);
  var jsx$29 = $f_Lsgl_WindowProvider__dp2px__I__I(this$47, 48);
  var this$48 = $as_Lsgl_WindowProvider($$outer);
  var xs$1 = new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$43, jsx$38, jsx$33, new $c_Lsgl_GraphicsHelpersComponent$BitmapRegion().init___Lsgl_GraphicsProvider__Lsgl_GraphicsProvider$AbstractBitmap__I__I__I__I(jsx$32, jsx$31, jsx$30, 0, jsx$29, $f_Lsgl_WindowProvider__dp2px__I__I(this$48, 68))]);
  var len = $uI(xs$1.array$6.length);
  var array = $newArrayObject($d_Lsgl_GraphicsHelpersComponent$BitmapRegion.getArrayOf(), [len]);
  var elem$1 = 0;
  elem$1 = 0;
  var this$52 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs$1, 0, $uI(xs$1.array$6.length));
  while (this$52.hasNext__Z()) {
    var arg1 = this$52.next__O();
    array.u[elem$1] = arg1;
    elem$1 = ((1 + elem$1) | 0)
  };
  this.characterFrames$2 = array;
  var jsx$47 = $as_Lsgl_GraphicsProvider($$outer);
  var xs$2 = this.characterFrames$2;
  var this$54 = new $c_scm_ArrayOps$ofRef().init___AO(xs$2);
  var xs$3 = new $c_sjs_js_WrappedArray().init___sjs_js_Array([$as_Lsgl_GraphicsHelpersComponent$BitmapRegion($f_sc_IndexedSeqOptimized__head__O(this$54))]);
  var len$1 = $uI(xs$3.array$6.length);
  var array$1 = $newArrayObject($d_Lsgl_GraphicsHelpersComponent$BitmapRegion.getArrayOf(), [len$1]);
  var elem$1$1 = 0;
  elem$1$1 = 0;
  var this$58 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs$3, 0, $uI(xs$3.array$6.length));
  while (this$58.hasNext__Z()) {
    var arg1$1 = this$58.next__O();
    array$1.u[elem$1$1] = arg1$1;
    elem$1$1 = ((1 + elem$1$1) | 0)
  };
  this.com$regblanc$scalavator$core$MainScreenComponent$MainScreen$$CharacterIdleAnimation$2 = new $c_Lsgl_GraphicsHelpersComponent$Animation().init___Lsgl_GraphicsProvider__J__ALsgl_GraphicsHelpersComponent$BitmapRegion__Lsgl_GraphicsHelpersComponent$Animation$PlayMode(jsx$47, new $c_sjsr_RuntimeLong().init___I__I(200, 0), array$1, $as_Lsgl_GraphicsHelpersComponent($$outer).Animation__Lsgl_GraphicsHelpersComponent$Animation$().Loop__Lsgl_GraphicsHelpersComponent$Animation$Loop$());
  this.CharacterStartJumpAnimation$2 = new $c_Lsgl_GraphicsHelpersComponent$Animation().init___Lsgl_GraphicsProvider__J__ALsgl_GraphicsHelpersComponent$BitmapRegion__Lsgl_GraphicsHelpersComponent$Animation$PlayMode($as_Lsgl_GraphicsProvider($$outer), new $c_sjsr_RuntimeLong().init___I__I(250, 0), this.characterFrames$2, $as_Lsgl_GraphicsHelpersComponent($$outer).Animation__Lsgl_GraphicsHelpersComponent$Animation$().Normal__Lsgl_GraphicsHelpersComponent$Animation$Normal$());
  this.CharacterEndJumpAnimation$2 = new $c_Lsgl_GraphicsHelpersComponent$Animation().init___Lsgl_GraphicsProvider__J__ALsgl_GraphicsHelpersComponent$BitmapRegion__Lsgl_GraphicsHelpersComponent$Animation$PlayMode($as_Lsgl_GraphicsProvider($$outer), new $c_sjsr_RuntimeLong().init___I__I(250, 0), this.characterFrames$2, $as_Lsgl_GraphicsHelpersComponent($$outer).Animation__Lsgl_GraphicsHelpersComponent$Animation$().Reversed__Lsgl_GraphicsHelpersComponent$Animation$Reversed$());
  this.characterAnimation$2 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$CharacterAnimation().init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen(this);
  this.jumpingDuration$2 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  this.standingPlatform$2 = new $c_s_Some().init___O(this.startingPlatform$2);
  this.score$2 = 0;
  this.randomNextPop$2 = this.generateRandomNextPop__p2__I();
  this.hud$2 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$Hud().init___Lcom_regblanc_scalavator_core_MainScreenComponent($$outer);
  this.accumulatedDelta$2 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  this.FixedDelta$2 = new $c_sjsr_RuntimeLong().init___I__I(5, 0);
  return this
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.Platform$lzycompute$1__p2__V = (function() {
  if ((this.Platform$module$2 === null)) {
    this.Platform$module$2 = new $c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen$Platform$().init___Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen(this)
  }
});
var $d_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen = new $TypeData().initClass({
  Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen: 0
}, false, "com.regblanc.scalavator.core.MainScreenComponent$MainScreen", {
  Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen: 1,
  Lsgl_GameStateComponent$GameScreen: 1,
  O: 1
});
$c_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen.prototype.$classData = $d_Lcom_regblanc_scalavator_core_MainScreenComponent$MainScreen;
function $f_Lsgl_html5_Html5GraphicsProvider__defaultPaint__Lsgl_html5_Html5GraphicsProvider$Html5Paint($thiz) {
  var jsx$1 = $thiz.Font$1.Default__Lsgl_html5_Html5GraphicsProvider$Html5Font();
  var this$1 = $thiz.Color$1;
  return new $c_Lsgl_html5_Html5GraphicsProvider$Html5Paint().init___Lsgl_html5_Html5GraphicsProvider__Lsgl_html5_Html5GraphicsProvider$Html5Font__T__Lsgl_GraphicsProvider$Alignments$Alignment($thiz, jsx$1, this$1.rgb__I__I__I__T(0, 0, 0), $thiz.Alignments__Lsgl_GraphicsProvider$Alignments$().Left__Lsgl_GraphicsProvider$Alignments$Left$())
}
function $f_Lsgl_html5_Html5GraphicsProvider__$$init$__V($thiz) {
  $thiz.Font$1 = $thiz.Html5FontCompanion__Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$();
  $thiz.Color$1 = $thiz.Html5ColorCompanion__Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$();
  $thiz.canvas$1 = null
}
function $f_Lsgl_html5_Html5GraphicsProvider__loadImageFromResource__T__Lsgl_html5_Html5GraphicsProvider$Html5Bitmap($thiz, path) {
  var img = $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().createElement("img");
  img.onload = (function(arg$outer) {
    return (function(arg1$2) {
      var this$2 = $m_s_Console$();
      var this$3 = $as_Ljava_io_PrintStream(this$2.outVar$2.v$1);
      this$3.java$lang$JSConsoleBasedPrintStream$$printString__T__V("image loaded\n")
    })
  })($thiz);
  img.src = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["static/", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([path]));
  return new $c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap().init___Lsgl_html5_Html5GraphicsProvider__Lorg_scalajs_dom_raw_HTMLImageElement($thiz, img)
}
function $is_Lsgl_html5_Html5GraphicsProvider(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_html5_Html5GraphicsProvider)))
}
function $as_Lsgl_html5_Html5GraphicsProvider(obj) {
  return (($is_Lsgl_html5_Html5GraphicsProvider(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.html5.Html5GraphicsProvider"))
}
function $isArrayOf_Lsgl_html5_Html5GraphicsProvider(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_html5_Html5GraphicsProvider)))
}
function $asArrayOf_Lsgl_html5_Html5GraphicsProvider(obj, depth) {
  return (($isArrayOf_Lsgl_html5_Html5GraphicsProvider(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.html5.Html5GraphicsProvider;", depth))
}
/** @constructor */
function $c_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$() {
  $c_Lsgl_GraphicsProvider$ColorCompanion.call(this)
}
$c_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$.prototype = new $h_Lsgl_GraphicsProvider$ColorCompanion();
$c_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$.prototype.constructor = $c_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$;
/** @constructor */
function $h_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$() {
  /*<skip>*/
}
$h_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$.prototype = $c_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$.prototype;
$c_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$.prototype.rgb__I__I__I__T = (function(r, g, b) {
  return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["rgb(", ",", ",", ")"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([r, g, b]))
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$.prototype.init___Lsgl_html5_Html5GraphicsProvider = (function($$outer) {
  $c_Lsgl_GraphicsProvider$ColorCompanion.prototype.init___Lsgl_GraphicsProvider.call(this, $$outer);
  return this
});
var $d_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$ = new $TypeData().initClass({
  Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$: 0
}, false, "sgl.html5.Html5GraphicsProvider$Html5ColorCompanion$", {
  Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$: 1,
  Lsgl_GraphicsProvider$ColorCompanion: 1,
  O: 1
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$.prototype.$classData = $d_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$;
/** @constructor */
function $c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$() {
  $c_Lsgl_GraphicsProvider$FontCompanion.call(this);
  this.Default$2 = null;
  this.DefaultBold$2 = null;
  this.Monospace$2 = null;
  this.SansSerif$2 = null;
  this.Serif$2 = null;
  this.bitmap$0$2 = 0
}
$c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$.prototype = new $h_Lsgl_GraphicsProvider$FontCompanion();
$c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$.prototype.constructor = $c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$;
/** @constructor */
function $h_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$() {
  /*<skip>*/
}
$h_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$.prototype = $c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$.prototype;
$c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$.prototype.toCssStyle__Lsgl_GraphicsProvider$FontCompanion$Style__T = (function(s) {
  var x = this.Bold__Lsgl_GraphicsProvider$FontCompanion$Bold$();
  if ((x === s)) {
    return "bold"
  } else {
    var x$3 = this.Italic__Lsgl_GraphicsProvider$FontCompanion$Italic$();
    if ((x$3 === s)) {
      return "italic"
    } else {
      var x$5 = this.Normal__Lsgl_GraphicsProvider$FontCompanion$Normal$();
      if ((x$5 === s)) {
        return "normal"
      } else {
        var x$7 = this.BoldItalic__Lsgl_GraphicsProvider$FontCompanion$BoldItalic$();
        if ((x$7 === s)) {
          return "italic bold"
        } else {
          throw new $c_s_MatchError().init___O(s)
        }
      }
    }
  }
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$.prototype.init___Lsgl_html5_Html5GraphicsProvider = (function($$outer) {
  $c_Lsgl_GraphicsProvider$FontCompanion.prototype.init___Lsgl_GraphicsProvider.call(this, $$outer);
  return this
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$.prototype.Default__Lsgl_html5_Html5GraphicsProvider$Html5Font = (function() {
  return (((1 & this.bitmap$0$2) === 0) ? this.Default$lzycompute__p2__Lsgl_html5_Html5GraphicsProvider$Html5Font() : this.Default$2)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$.prototype.Default$lzycompute__p2__Lsgl_html5_Html5GraphicsProvider$Html5Font = (function() {
  if (((1 & this.bitmap$0$2) === 0)) {
    this.Default$2 = new $c_Lsgl_html5_Html5GraphicsProvider$Html5Font().init___Lsgl_html5_Html5GraphicsProvider__T__Lsgl_GraphicsProvider$FontCompanion$Style__I($as_Lsgl_html5_Html5GraphicsProvider(this.$$outer$1), "sans-serif", this.Normal__Lsgl_GraphicsProvider$FontCompanion$Normal$(), 10);
    this.bitmap$0$2 = (((1 | this.bitmap$0$2) << 24) >> 24)
  };
  return this.Default$2
});
var $d_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$ = new $TypeData().initClass({
  Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$: 0
}, false, "sgl.html5.Html5GraphicsProvider$Html5FontCompanion$", {
  Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$: 1,
  Lsgl_GraphicsProvider$FontCompanion: 1,
  O: 1
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$.prototype.$classData = $d_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$;
function $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I($thiz) {
  return $uI($as_Lsgl_html5_Html5GraphicsProvider($thiz).canvas$1.height)
}
function $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I($thiz) {
  return $uI($as_Lsgl_html5_Html5GraphicsProvider($thiz).canvas$1.width)
}
function $is_Lsgl_html5_Html5WindowProvider(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_html5_Html5WindowProvider)))
}
function $as_Lsgl_html5_Html5WindowProvider(obj) {
  return (($is_Lsgl_html5_Html5WindowProvider(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.html5.Html5WindowProvider"))
}
function $isArrayOf_Lsgl_html5_Html5WindowProvider(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_html5_Html5WindowProvider)))
}
function $asArrayOf_Lsgl_html5_Html5WindowProvider(obj, depth) {
  return (($isArrayOf_Lsgl_html5_Html5WindowProvider(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.html5.Html5WindowProvider;", depth))
}
/** @constructor */
function $c_Lsgl_html5_themes_DefaultTheme() {
  $c_Lsgl_html5_themes_Theme.call(this);
  this.backgroundColor$2 = null;
  this.maxFrame$2 = null
}
$c_Lsgl_html5_themes_DefaultTheme.prototype = new $h_Lsgl_html5_themes_Theme();
$c_Lsgl_html5_themes_DefaultTheme.prototype.constructor = $c_Lsgl_html5_themes_DefaultTheme;
/** @constructor */
function $h_Lsgl_html5_themes_DefaultTheme() {
  /*<skip>*/
}
$h_Lsgl_html5_themes_DefaultTheme.prototype = $c_Lsgl_html5_themes_DefaultTheme.prototype;
$c_Lsgl_html5_themes_DefaultTheme.prototype.init___ = (function() {
  this.backgroundColor$2 = "rgb(42,42,42)";
  this.maxFrame$2 = new $c_s_Tuple2$mcII$sp().init___I__I(480, 720);
  return this
});
$c_Lsgl_html5_themes_DefaultTheme.prototype.setDimensions__p2__Lorg_scalajs_dom_raw_HTMLCanvasElement__V = (function(canvas) {
  var windowWidth = $doubleToInt($uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerWidth));
  var windowHeight = $doubleToInt($uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerHeight));
  if ((windowWidth < 480)) {
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    canvas.style.left = "0";
    canvas.style.top = "0"
  } else {
    if ((windowHeight < this.maxFrame$3.$$und2$mcI$sp__I())) {
      var ratio = (windowHeight / this.maxFrame$3.$$und2$mcI$sp__I());
      canvas.height = windowHeight;
      canvas.width = $doubleToInt((ratio * this.maxFrame$3.$$und1$mcI$sp__I()))
    } else {
      canvas.width = this.maxFrame$3.$$und1$mcI$sp__I();
      canvas.height = this.maxFrame$3.$$und2$mcI$sp__I()
    };
    var left = ((((windowWidth - $uI(canvas.width)) | 0) / 2) | 0);
    var top = ((((windowHeight - $uI(canvas.height)) | 0) / 2) | 0);
    canvas.style.left = (left + "px");
    canvas.style.top = (top + "px")
  }
});
$c_Lsgl_html5_themes_DefaultTheme.prototype.init__Lorg_scalajs_dom_raw_HTMLCanvasElement__V = (function(canvas) {
  $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().body.style.backgroundColor = this.backgroundColor$2;
  $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().body.style.margin = "0";
  $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().body.style.padding = "0";
  canvas.style.margin = "0";
  canvas.style.padding = "0";
  canvas.style.display = "block";
  canvas.style.position = "absolute";
  $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().onresize = (function(arg$outer, canvas$1) {
    return (function(arg1$2) {
      arg$outer.setDimensions__p2__Lorg_scalajs_dom_raw_HTMLCanvasElement__V(canvas$1)
    })
  })(this, canvas);
  this.setDimensions__p2__Lorg_scalajs_dom_raw_HTMLCanvasElement__V(canvas)
});
/** @constructor */
function $c_Lsgl_scene_SceneGraphComponent$SceneGroup() {
  $c_Lsgl_scene_SceneGraphComponent$SceneNode.call(this);
  this.nodes$2 = null
}
$c_Lsgl_scene_SceneGraphComponent$SceneGroup.prototype = new $h_Lsgl_scene_SceneGraphComponent$SceneNode();
$c_Lsgl_scene_SceneGraphComponent$SceneGroup.prototype.constructor = $c_Lsgl_scene_SceneGraphComponent$SceneGroup;
/** @constructor */
function $h_Lsgl_scene_SceneGraphComponent$SceneGroup() {
  /*<skip>*/
}
$h_Lsgl_scene_SceneGraphComponent$SceneGroup.prototype = $c_Lsgl_scene_SceneGraphComponent$SceneGroup.prototype;
$c_Lsgl_scene_SceneGraphComponent$SceneGroup.prototype.init___Lsgl_scene_SceneGraphComponent__F__F__F__F = (function($$outer, _x, _y, w, h) {
  $c_Lsgl_scene_SceneGraphComponent$SceneNode.prototype.init___Lsgl_scene_SceneGraphComponent__F__F__F__F.call(this, $$outer, _x, _y, w, h);
  this.nodes$2 = $m_sci_Nil$();
  return this
});
$c_Lsgl_scene_SceneGraphComponent$SceneGroup.prototype.update__J__V = (function(dt) {
  var this$1 = this.nodes$2;
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    var x$1 = $as_Lsgl_scene_SceneGraphComponent$SceneNode(arg1);
    x$1.update__J__V(dt);
    var this$2 = these;
    these = this$2.tail__sci_List()
  }
});
$c_Lsgl_scene_SceneGraphComponent$SceneGroup.prototype.render__Lsgl_GraphicsProvider$AbstractCanvas__V = (function(canvas) {
  canvas.context$1.save();
  canvas.translate__I__I__V($doubleToInt(this.x$1), $doubleToInt(this.y$1));
  canvas.clipRect__I__I__I__I__V(0, 0, $doubleToInt(this.width$1), $doubleToInt(this.height$1));
  var this$1 = this.nodes$2.reverse__sci_List();
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    var x$2 = $as_Lsgl_scene_SceneGraphComponent$SceneNode(arg1);
    x$2.render__Lsgl_GraphicsProvider$AbstractCanvas__V(canvas);
    var this$2 = these;
    these = this$2.tail__sci_List()
  };
  canvas.context$1.restore()
});
$c_Lsgl_scene_SceneGraphComponent$SceneGroup.prototype.addNode__Lsgl_scene_SceneGraphComponent$SceneNode__V = (function(node) {
  var this$1 = this.nodes$2;
  this.nodes$2 = new $c_sci_$colon$colon().init___O__sci_List(node, this$1)
});
var $d_Lsgl_scene_SceneGraphComponent$SceneGroup = new $TypeData().initClass({
  Lsgl_scene_SceneGraphComponent$SceneGroup: 0
}, false, "sgl.scene.SceneGraphComponent$SceneGroup", {
  Lsgl_scene_SceneGraphComponent$SceneGroup: 1,
  Lsgl_scene_SceneGraphComponent$SceneNode: 1,
  O: 1
});
$c_Lsgl_scene_SceneGraphComponent$SceneGroup.prototype.$classData = $d_Lsgl_scene_SceneGraphComponent$SceneGroup;
/** @constructor */
function $c_Lsgl_util_NoLoggingProvider$SilentLogger$() {
  $c_Lsgl_util_LoggingProvider$Logger.call(this);
  this.logLevel$2 = null
}
$c_Lsgl_util_NoLoggingProvider$SilentLogger$.prototype = new $h_Lsgl_util_LoggingProvider$Logger();
$c_Lsgl_util_NoLoggingProvider$SilentLogger$.prototype.constructor = $c_Lsgl_util_NoLoggingProvider$SilentLogger$;
/** @constructor */
function $h_Lsgl_util_NoLoggingProvider$SilentLogger$() {
  /*<skip>*/
}
$h_Lsgl_util_NoLoggingProvider$SilentLogger$.prototype = $c_Lsgl_util_NoLoggingProvider$SilentLogger$.prototype;
$c_Lsgl_util_NoLoggingProvider$SilentLogger$.prototype.init___Lsgl_util_NoLoggingProvider = (function($$outer) {
  $c_Lsgl_util_LoggingProvider$Logger.prototype.init___Lsgl_util_LoggingProvider.call(this, $$outer);
  this.logLevel$2 = $$outer.Logger__Lsgl_util_LoggingProvider$Logger$().NoLogging__Lsgl_util_LoggingProvider$Logger$NoLogging$();
  return this
});
var $d_Lsgl_util_NoLoggingProvider$SilentLogger$ = new $TypeData().initClass({
  Lsgl_util_NoLoggingProvider$SilentLogger$: 0
}, false, "sgl.util.NoLoggingProvider$SilentLogger$", {
  Lsgl_util_NoLoggingProvider$SilentLogger$: 1,
  Lsgl_util_LoggingProvider$Logger: 1,
  O: 1
});
$c_Lsgl_util_NoLoggingProvider$SilentLogger$.prototype.$classData = $d_Lsgl_util_NoLoggingProvider$SilentLogger$;
/** @constructor */
function $c_jl_Number() {
  $c_O.call(this)
}
$c_jl_Number.prototype = new $h_O();
$c_jl_Number.prototype.constructor = $c_jl_Number;
/** @constructor */
function $h_jl_Number() {
  /*<skip>*/
}
$h_jl_Number.prototype = $c_jl_Number.prototype;
function $is_jl_Number(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
}
function $as_jl_Number(obj) {
  return (($is_jl_Number(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Number"))
}
function $isArrayOf_jl_Number(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
}
function $asArrayOf_jl_Number(obj, depth) {
  return (($isArrayOf_jl_Number(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Number;", depth))
}
/** @constructor */
function $c_jl_Throwable() {
  $c_O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.stackTrace$1 = null
}
$c_jl_Throwable.prototype = new $h_O();
$c_jl_Throwable.prototype.constructor = $c_jl_Throwable;
/** @constructor */
function $h_jl_Throwable() {
  /*<skip>*/
}
$h_jl_Throwable.prototype = $c_jl_Throwable.prototype;
$c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var v = $g.Error.captureStackTrace;
  if ((v === (void 0))) {
    try {
      var e$1 = {}.undef()
    } catch (e) {
      var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        if ($is_sjs_js_JavaScriptException(e$2)) {
          var x5 = $as_sjs_js_JavaScriptException(e$2);
          var e$3 = x5.exception$4;
          var e$1 = e$3
        } else {
          var e$1;
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        var e$1;
        throw e
      }
    };
    this.stackdata = e$1
  } else {
    $g.Error.captureStackTrace(this);
    this.stackdata = this
  };
  return this
});
$c_jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
$c_jl_Throwable.prototype.toString__T = (function() {
  var className = $objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
$c_jl_Throwable.prototype.init___T__jl_Throwable = (function(s, e) {
  this.s$1 = s;
  this.e$1 = e;
  this.fillInStackTrace__jl_Throwable();
  return this
});
function $is_jl_Throwable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
}
function $as_jl_Throwable(obj) {
  return (($is_jl_Throwable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Throwable"))
}
function $isArrayOf_jl_Throwable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
}
function $asArrayOf_jl_Throwable(obj, depth) {
  return (($isArrayOf_jl_Throwable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
}
/** @constructor */
function $c_ju_Random() {
  $c_O.call(this);
  this.seedHi$1 = 0;
  this.seedLo$1 = 0;
  this.nextNextGaussian$1 = 0.0;
  this.haveNextNextGaussian$1 = false
}
$c_ju_Random.prototype = new $h_O();
$c_ju_Random.prototype.constructor = $c_ju_Random;
/** @constructor */
function $h_ju_Random() {
  /*<skip>*/
}
$h_ju_Random.prototype = $c_ju_Random.prototype;
$c_ju_Random.prototype.init___ = (function() {
  $c_ju_Random.prototype.init___J.call(this, $m_ju_Random$().java$util$Random$$randomSeed__J());
  return this
});
$c_ju_Random.prototype.init___J = (function(seed_in) {
  this.haveNextNextGaussian$1 = false;
  this.setSeed__J__V(seed_in);
  return this
});
$c_ju_Random.prototype.nextInt__I__I = (function(n) {
  if ((n <= 0)) {
    throw new $c_jl_IllegalArgumentException().init___T("n must be positive")
  } else {
    return (((n & ((-n) | 0)) === n) ? (this.next__I__I(31) >> $clz32(n)) : this.loop$1__p1__I__I(n))
  }
});
$c_ju_Random.prototype.next__I__I = (function(bits) {
  var oldSeedHi = this.seedHi$1;
  var oldSeedLo = this.seedLo$1;
  var loProd = (11 + (15525485 * oldSeedLo));
  var hiProd = ((1502 * oldSeedLo) + (15525485 * oldSeedHi));
  var x = (loProd / 16777216);
  var newSeedHi = (16777215 & (($uI((x | 0)) + (16777215 & $uI((hiProd | 0)))) | 0));
  var newSeedLo = (16777215 & $uI((loProd | 0)));
  this.seedHi$1 = newSeedHi;
  this.seedLo$1 = newSeedLo;
  var result32 = ((newSeedHi << 8) | (newSeedLo >> 16));
  return ((result32 >>> ((32 - bits) | 0)) | 0)
});
$c_ju_Random.prototype.loop$1__p1__I__I = (function(n$1) {
  _loop: while (true) {
    var bits = this.next__I__I(31);
    var value = ((bits % n$1) | 0);
    if ((((((bits - value) | 0) + (((-1) + n$1) | 0)) | 0) < 0)) {
      continue _loop
    } else {
      return value
    }
  }
});
$c_ju_Random.prototype.setSeed__J__V = (function(seed_in) {
  var lo = ((-554899859) ^ seed_in.lo$2);
  var hi = (5 ^ seed_in.hi$2);
  var hi$1 = (65535 & hi);
  var lo$1 = (((lo >>> 24) | 0) | (hi$1 << 8));
  this.seedHi$1 = lo$1;
  this.seedLo$1 = (16777215 & lo);
  this.haveNextNextGaussian$1 = false
});
var $d_ju_Random = new $TypeData().initClass({
  ju_Random: 0
}, false, "java.util.Random", {
  ju_Random: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_Random.prototype.$classData = $d_ju_Random;
/** @constructor */
function $c_ju_regex_Matcher() {
  $c_O.call(this);
  this.pattern0$1 = null;
  this.input0$1 = null;
  this.regionStart0$1 = 0;
  this.regionEnd0$1 = 0;
  this.regexp$1 = null;
  this.inputstr$1 = null;
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = false;
  this.appendPos$1 = 0
}
$c_ju_regex_Matcher.prototype = new $h_O();
$c_ju_regex_Matcher.prototype.constructor = $c_ju_regex_Matcher;
/** @constructor */
function $h_ju_regex_Matcher() {
  /*<skip>*/
}
$h_ju_regex_Matcher.prototype = $c_ju_regex_Matcher.prototype;
$c_ju_regex_Matcher.prototype.find__Z = (function() {
  if (this.canStillFind$1) {
    this.lastMatchIsValid$1 = true;
    this.lastMatch$1 = this.regexp$1.exec(this.inputstr$1);
    if ((this.lastMatch$1 !== null)) {
      var value = this.lastMatch$1[0];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var thiz = $as_T(value);
      if ((thiz === null)) {
        throw new $c_jl_NullPointerException().init___()
      };
      if ((thiz === "")) {
        var ev$1 = this.regexp$1;
        ev$1.lastIndex = ((1 + $uI(ev$1.lastIndex)) | 0)
      }
    } else {
      this.canStillFind$1 = false
    };
    return (this.lastMatch$1 !== null)
  } else {
    return false
  }
});
$c_ju_regex_Matcher.prototype.ensureLastMatch__p1__sjs_js_RegExp$ExecResult = (function() {
  if ((this.lastMatch$1 === null)) {
    throw new $c_jl_IllegalStateException().init___T("No match available")
  };
  return this.lastMatch$1
});
$c_ju_regex_Matcher.prototype.end__I = (function() {
  var jsx$1 = this.start__I();
  var thiz = this.group__T();
  return ((jsx$1 + $uI(thiz.length)) | 0)
});
$c_ju_regex_Matcher.prototype.init___ju_regex_Pattern__jl_CharSequence__I__I = (function(pattern0, input0, regionStart0, regionEnd0) {
  this.pattern0$1 = pattern0;
  this.input0$1 = input0;
  this.regionStart0$1 = regionStart0;
  this.regionEnd0$1 = regionEnd0;
  this.regexp$1 = this.pattern0$1.newJSRegExp__sjs_js_RegExp();
  this.inputstr$1 = $objectToString($charSequenceSubSequence(this.input0$1, this.regionStart0$1, this.regionEnd0$1));
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = true;
  this.appendPos$1 = 0;
  return this
});
$c_ju_regex_Matcher.prototype.group__T = (function() {
  var value = this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult()[0];
  if ((value === (void 0))) {
    throw new $c_ju_NoSuchElementException().init___T("undefined.get")
  };
  return $as_T(value)
});
$c_ju_regex_Matcher.prototype.start__I = (function() {
  return $uI(this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult().index)
});
var $d_ju_regex_Matcher = new $TypeData().initClass({
  ju_regex_Matcher: 0
}, false, "java.util.regex.Matcher", {
  ju_regex_Matcher: 1,
  O: 1,
  ju_regex_MatchResult: 1
});
$c_ju_regex_Matcher.prototype.$classData = $d_ju_regex_Matcher;
/** @constructor */
function $c_s_Predef$$anon$3() {
  $c_O.call(this)
}
$c_s_Predef$$anon$3.prototype = new $h_O();
$c_s_Predef$$anon$3.prototype.constructor = $c_s_Predef$$anon$3;
/** @constructor */
function $h_s_Predef$$anon$3() {
  /*<skip>*/
}
$h_s_Predef$$anon$3.prototype = $c_s_Predef$$anon$3.prototype;
$c_s_Predef$$anon$3.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$3.prototype.apply__scm_Builder = (function() {
  return new $c_scm_StringBuilder().init___()
});
$c_s_Predef$$anon$3.prototype.apply__O__scm_Builder = (function(from) {
  $as_T(from);
  return new $c_scm_StringBuilder().init___()
});
var $d_s_Predef$$anon$3 = new $TypeData().initClass({
  s_Predef$$anon$3: 0
}, false, "scala.Predef$$anon$3", {
  s_Predef$$anon$3: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_s_Predef$$anon$3.prototype.$classData = $d_s_Predef$$anon$3;
function $f_s_Product2__productElement__I__O($thiz, n) {
  switch (n) {
    case 0: {
      return $thiz.$$und1__O();
      break
    }
    case 1: {
      return $thiz.$$und2__O();
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    }
  }
}
/** @constructor */
function $c_s_package$$anon$1() {
  $c_O.call(this)
}
$c_s_package$$anon$1.prototype = new $h_O();
$c_s_package$$anon$1.prototype.constructor = $c_s_package$$anon$1;
/** @constructor */
function $h_s_package$$anon$1() {
  /*<skip>*/
}
$h_s_package$$anon$1.prototype = $c_s_package$$anon$1.prototype;
$c_s_package$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_package$$anon$1.prototype.toString__T = (function() {
  return "object AnyRef"
});
var $d_s_package$$anon$1 = new $TypeData().initClass({
  s_package$$anon$1: 0
}, false, "scala.package$$anon$1", {
  s_package$$anon$1: 1,
  O: 1,
  s_Specializable: 1
});
$c_s_package$$anon$1.prototype.$classData = $d_s_package$$anon$1;
/** @constructor */
function $c_s_util_hashing_MurmurHash3$() {
  $c_s_util_hashing_MurmurHash3.call(this);
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
}
$c_s_util_hashing_MurmurHash3$.prototype = new $h_s_util_hashing_MurmurHash3();
$c_s_util_hashing_MurmurHash3$.prototype.constructor = $c_s_util_hashing_MurmurHash3$;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3$.prototype = $c_s_util_hashing_MurmurHash3$.prototype;
$c_s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  $n_s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
$c_s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if ($is_sci_List(xs)) {
    var x2 = $as_sci_List(xs);
    return this.listHash__sci_List__I__I(x2, this.seqSeed$2)
  } else {
    return this.orderedHash__sc_TraversableOnce__I__I(xs, this.seqSeed$2)
  }
});
var $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
$c_s_util_hashing_MurmurHash3$.prototype.$classData = $d_s_util_hashing_MurmurHash3$;
var $n_s_util_hashing_MurmurHash3$ = (void 0);
function $m_s_util_hashing_MurmurHash3$() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$().init___()
  };
  return $n_s_util_hashing_MurmurHash3$
}
function $f_sc_Iterator__isEmpty__Z($thiz) {
  return (!$thiz.hasNext__Z())
}
function $f_sc_Iterator__toString__T($thiz) {
  return (($thiz.hasNext__Z() ? "non-empty" : "empty") + " iterator")
}
function $f_sc_Iterator__forall__F1__Z($thiz, p) {
  var res = true;
  while ((res && $thiz.hasNext__Z())) {
    res = $uZ(p.apply__O__O($thiz.next__O()))
  };
  return res
}
function $f_sc_Iterator__foreach__F1__V($thiz, f) {
  while ($thiz.hasNext__Z()) {
    f.apply__O__O($thiz.next__O())
  }
}
function $f_sc_Iterator__toStream__sci_Stream($thiz) {
  if ($thiz.hasNext__Z()) {
    var hd = $thiz.next__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
      return (function() {
        return $this.toStream__sci_Stream()
      })
    })($thiz));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    $m_sci_Stream$();
    return $m_sci_Stream$Empty$()
  }
}
/** @constructor */
function $c_scg_GenSetFactory() {
  $c_scg_GenericCompanion.call(this)
}
$c_scg_GenSetFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenSetFactory.prototype.constructor = $c_scg_GenSetFactory;
/** @constructor */
function $h_scg_GenSetFactory() {
  /*<skip>*/
}
$h_scg_GenSetFactory.prototype = $c_scg_GenSetFactory.prototype;
/** @constructor */
function $c_scg_GenTraversableFactory() {
  $c_scg_GenericCompanion.call(this);
  this.ReusableCBFInstance$2 = null
}
$c_scg_GenTraversableFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenTraversableFactory.prototype.constructor = $c_scg_GenTraversableFactory;
/** @constructor */
function $h_scg_GenTraversableFactory() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory.prototype = $c_scg_GenTraversableFactory.prototype;
$c_scg_GenTraversableFactory.prototype.init___ = (function() {
  this.ReusableCBFInstance$2 = new $c_scg_GenTraversableFactory$$anon$1().init___scg_GenTraversableFactory(this);
  return this
});
/** @constructor */
function $c_scg_GenTraversableFactory$GenericCanBuildFrom() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = new $h_O();
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.constructor = $c_scg_GenTraversableFactory$GenericCanBuildFrom;
/** @constructor */
function $h_scg_GenTraversableFactory$GenericCanBuildFrom() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype;
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__scm_Builder = (function() {
  return this.$$outer$1.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__O__scm_Builder = (function(from) {
  var from$1 = $as_sc_GenTraversable(from);
  return from$1.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
/** @constructor */
function $c_scg_MapFactory() {
  $c_scg_GenMapFactory.call(this)
}
$c_scg_MapFactory.prototype = new $h_scg_GenMapFactory();
$c_scg_MapFactory.prototype.constructor = $c_scg_MapFactory;
/** @constructor */
function $h_scg_MapFactory() {
  /*<skip>*/
}
$h_scg_MapFactory.prototype = $c_scg_MapFactory.prototype;
/** @constructor */
function $c_sci_List$$anon$1() {
  $c_O.call(this)
}
$c_sci_List$$anon$1.prototype = new $h_O();
$c_sci_List$$anon$1.prototype.constructor = $c_sci_List$$anon$1;
/** @constructor */
function $h_sci_List$$anon$1() {
  /*<skip>*/
}
$h_sci_List$$anon$1.prototype = $c_sci_List$$anon$1.prototype;
$c_sci_List$$anon$1.prototype.init___ = (function() {
  return this
});
$c_sci_List$$anon$1.prototype.apply__O__O = (function(x) {
  return this
});
$c_sci_List$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
var $d_sci_List$$anon$1 = new $TypeData().initClass({
  sci_List$$anon$1: 0
}, false, "scala.collection.immutable.List$$anon$1", {
  sci_List$$anon$1: 1,
  O: 1,
  F1: 1
});
$c_sci_List$$anon$1.prototype.$classData = $d_sci_List$$anon$1;
function $f_scm_Builder__sizeHint__sc_TraversableLike__V($thiz, coll) {
  var x1 = coll.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(x1)
    }
  }
}
function $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V($thiz, size, boundingColl) {
  var x1 = boundingColl.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(((size < x1) ? size : x1))
    }
  }
}
function $is_scm_Builder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)))
}
function $as_scm_Builder(obj) {
  return (($is_scm_Builder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Builder"))
}
function $isArrayOf_scm_Builder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)))
}
function $asArrayOf_scm_Builder(obj, depth) {
  return (($isArrayOf_scm_Builder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Builder;", depth))
}
/** @constructor */
function $c_sjs_js_Any$() {
  $c_O.call(this)
}
$c_sjs_js_Any$.prototype = new $h_O();
$c_sjs_js_Any$.prototype.constructor = $c_sjs_js_Any$;
/** @constructor */
function $h_sjs_js_Any$() {
  /*<skip>*/
}
$h_sjs_js_Any$.prototype = $c_sjs_js_Any$.prototype;
$c_sjs_js_Any$.prototype.init___ = (function() {
  return this
});
var $d_sjs_js_Any$ = new $TypeData().initClass({
  sjs_js_Any$: 0
}, false, "scala.scalajs.js.Any$", {
  sjs_js_Any$: 1,
  O: 1,
  sjs_js_LowPrioAnyImplicits: 1
});
$c_sjs_js_Any$.prototype.$classData = $d_sjs_js_Any$;
var $n_sjs_js_Any$ = (void 0);
function $m_sjs_js_Any$() {
  if ((!$n_sjs_js_Any$)) {
    $n_sjs_js_Any$ = new $c_sjs_js_Any$().init___()
  };
  return $n_sjs_js_Any$
}
/** @constructor */
function $c_sr_AbstractFunction0() {
  $c_O.call(this)
}
$c_sr_AbstractFunction0.prototype = new $h_O();
$c_sr_AbstractFunction0.prototype.constructor = $c_sr_AbstractFunction0;
/** @constructor */
function $h_sr_AbstractFunction0() {
  /*<skip>*/
}
$h_sr_AbstractFunction0.prototype = $c_sr_AbstractFunction0.prototype;
$c_sr_AbstractFunction0.prototype.toString__T = (function() {
  return "<function0>"
});
/** @constructor */
function $c_sr_AbstractFunction1() {
  $c_O.call(this)
}
$c_sr_AbstractFunction1.prototype = new $h_O();
$c_sr_AbstractFunction1.prototype.constructor = $c_sr_AbstractFunction1;
/** @constructor */
function $h_sr_AbstractFunction1() {
  /*<skip>*/
}
$h_sr_AbstractFunction1.prototype = $c_sr_AbstractFunction1.prototype;
$c_sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
function $c_sr_BooleanRef() {
  $c_O.call(this);
  this.elem$1 = false
}
$c_sr_BooleanRef.prototype = new $h_O();
$c_sr_BooleanRef.prototype.constructor = $c_sr_BooleanRef;
/** @constructor */
function $h_sr_BooleanRef() {
  /*<skip>*/
}
$h_sr_BooleanRef.prototype = $c_sr_BooleanRef.prototype;
$c_sr_BooleanRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
$c_sr_BooleanRef.prototype.init___Z = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_BooleanRef = new $TypeData().initClass({
  sr_BooleanRef: 0
}, false, "scala.runtime.BooleanRef", {
  sr_BooleanRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_BooleanRef.prototype.$classData = $d_sr_BooleanRef;
function $isArrayOf_sr_BoxedUnit(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
}
function $asArrayOf_sr_BoxedUnit(obj, depth) {
  return (($isArrayOf_sr_BoxedUnit(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.runtime.BoxedUnit;", depth))
}
var $d_sr_BoxedUnit = new $TypeData().initClass({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1,
  Ljava_io_Serializable: 1
}, (void 0), (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
function $c_sr_IntRef() {
  $c_O.call(this);
  this.elem$1 = 0
}
$c_sr_IntRef.prototype = new $h_O();
$c_sr_IntRef.prototype.constructor = $c_sr_IntRef;
/** @constructor */
function $h_sr_IntRef() {
  /*<skip>*/
}
$h_sr_IntRef.prototype = $c_sr_IntRef.prototype;
$c_sr_IntRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
$c_sr_IntRef.prototype.init___I = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_IntRef = new $TypeData().initClass({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_IntRef.prototype.$classData = $d_sr_IntRef;
/** @constructor */
function $c_sr_LongRef() {
  $c_O.call(this);
  this.elem$1 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong()
}
$c_sr_LongRef.prototype = new $h_O();
$c_sr_LongRef.prototype.constructor = $c_sr_LongRef;
/** @constructor */
function $h_sr_LongRef() {
  /*<skip>*/
}
$h_sr_LongRef.prototype = $c_sr_LongRef.prototype;
$c_sr_LongRef.prototype.init___J = (function(elem) {
  this.elem$1 = elem;
  return this
});
$c_sr_LongRef.prototype.toString__T = (function() {
  var t = this.elem$1;
  var lo = t.lo$2;
  var hi = t.hi$2;
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(lo, hi)
});
var $d_sr_LongRef = new $TypeData().initClass({
  sr_LongRef: 0
}, false, "scala.runtime.LongRef", {
  sr_LongRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_LongRef.prototype.$classData = $d_sr_LongRef;
/** @constructor */
function $c_sr_ObjectRef() {
  $c_O.call(this);
  this.elem$1 = null
}
$c_sr_ObjectRef.prototype = new $h_O();
$c_sr_ObjectRef.prototype.constructor = $c_sr_ObjectRef;
/** @constructor */
function $h_sr_ObjectRef() {
  /*<skip>*/
}
$h_sr_ObjectRef.prototype = $c_sr_ObjectRef.prototype;
$c_sr_ObjectRef.prototype.toString__T = (function() {
  return $m_sjsr_RuntimeString$().valueOf__O__T(this.elem$1)
});
$c_sr_ObjectRef.prototype.init___O = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_ObjectRef = new $TypeData().initClass({
  sr_ObjectRef: 0
}, false, "scala.runtime.ObjectRef", {
  sr_ObjectRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_ObjectRef.prototype.$classData = $d_sr_ObjectRef;
/** @constructor */
function $c_Lcom_regblanc_scalavator_html5_Main$$anon$1() {
  $c_Lsgl_html5_themes_DefaultTheme.call(this);
  this.maxFrame$3 = null
}
$c_Lcom_regblanc_scalavator_html5_Main$$anon$1.prototype = new $h_Lsgl_html5_themes_DefaultTheme();
$c_Lcom_regblanc_scalavator_html5_Main$$anon$1.prototype.constructor = $c_Lcom_regblanc_scalavator_html5_Main$$anon$1;
/** @constructor */
function $h_Lcom_regblanc_scalavator_html5_Main$$anon$1() {
  /*<skip>*/
}
$h_Lcom_regblanc_scalavator_html5_Main$$anon$1.prototype = $c_Lcom_regblanc_scalavator_html5_Main$$anon$1.prototype;
$c_Lcom_regblanc_scalavator_html5_Main$$anon$1.prototype.init___ = (function() {
  $c_Lsgl_html5_themes_DefaultTheme.prototype.init___.call(this);
  this.maxFrame$3 = new $c_s_Tuple2$mcII$sp().init___I__I(400, 650);
  return this
});
var $d_Lcom_regblanc_scalavator_html5_Main$$anon$1 = new $TypeData().initClass({
  Lcom_regblanc_scalavator_html5_Main$$anon$1: 0
}, false, "com.regblanc.scalavator.html5.Main$$anon$1", {
  Lcom_regblanc_scalavator_html5_Main$$anon$1: 1,
  Lsgl_html5_themes_DefaultTheme: 1,
  Lsgl_html5_themes_Theme: 1,
  O: 1
});
$c_Lcom_regblanc_scalavator_html5_Main$$anon$1.prototype.$classData = $d_Lcom_regblanc_scalavator_html5_Main$$anon$1;
/** @constructor */
function $c_Ljava_io_OutputStream() {
  $c_O.call(this)
}
$c_Ljava_io_OutputStream.prototype = new $h_O();
$c_Ljava_io_OutputStream.prototype.constructor = $c_Ljava_io_OutputStream;
/** @constructor */
function $h_Ljava_io_OutputStream() {
  /*<skip>*/
}
$h_Ljava_io_OutputStream.prototype = $c_Ljava_io_OutputStream.prototype;
var $d_jl_Boolean = new $TypeData().initClass({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
function $c_jl_Character() {
  $c_O.call(this);
  this.value$1 = 0
}
$c_jl_Character.prototype = new $h_O();
$c_jl_Character.prototype.constructor = $c_jl_Character;
/** @constructor */
function $h_jl_Character() {
  /*<skip>*/
}
$h_jl_Character.prototype = $c_jl_Character.prototype;
$c_jl_Character.prototype.equals__O__Z = (function(that) {
  if ($is_jl_Character(that)) {
    var jsx$1 = this.value$1;
    var this$1 = $as_jl_Character(that);
    return (jsx$1 === this$1.value$1)
  } else {
    return false
  }
});
$c_jl_Character.prototype.toString__T = (function() {
  var c = this.value$1;
  return $as_T($g.String.fromCharCode(($m_sjs_js_Any$(), c)))
});
$c_jl_Character.prototype.init___C = (function(value) {
  this.value$1 = value;
  return this
});
$c_jl_Character.prototype.hashCode__I = (function() {
  return this.value$1
});
function $is_jl_Character(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Character)))
}
function $as_jl_Character(obj) {
  return (($is_jl_Character(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Character"))
}
function $isArrayOf_jl_Character(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
}
function $asArrayOf_jl_Character(obj, depth) {
  return (($isArrayOf_jl_Character(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Character;", depth))
}
var $d_jl_Character = new $TypeData().initClass({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_jl_Character.prototype.$classData = $d_jl_Character;
/** @constructor */
function $c_jl_Character$() {
  $c_O.call(this);
  this.java$lang$Character$$charTypesFirst256$1 = null;
  this.charTypeIndices$1 = null;
  this.charTypes$1 = null;
  this.isMirroredIndices$1 = null;
  this.bitmap$0$1 = 0
}
$c_jl_Character$.prototype = new $h_O();
$c_jl_Character$.prototype.constructor = $c_jl_Character$;
/** @constructor */
function $h_jl_Character$() {
  /*<skip>*/
}
$h_jl_Character$.prototype = $c_jl_Character$.prototype;
$c_jl_Character$.prototype.init___ = (function() {
  return this
});
$c_jl_Character$.prototype.charTypeIndices__p1__AI = (function() {
  return (((2 & this.bitmap$0$1) === 0) ? this.charTypeIndices$lzycompute__p1__AI() : this.charTypeIndices$1)
});
$c_jl_Character$.prototype.getType__I__I = (function(codePoint) {
  return ((codePoint < 0) ? 0 : ((codePoint < 256) ? this.java$lang$Character$$charTypesFirst256__AB().u[codePoint] : this.getTypeGE256__p1__I__B(codePoint)))
});
$c_jl_Character$.prototype.charTypeIndices$lzycompute__p1__AI = (function() {
  if (((2 & this.bitmap$0$1) === 0)) {
    var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([257, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 2, 1, 1, 1, 2, 1, 3, 2, 4, 1, 2, 1, 3, 3, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 3, 1, 1, 1, 2, 2, 1, 1, 3, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 2, 1, 2, 2, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 69, 1, 27, 18, 4, 12, 14, 5, 7, 1, 1, 1, 17, 112, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 3, 1, 5, 2, 1, 1, 3, 1, 1, 1, 2, 1, 17, 1, 9, 35, 1, 2, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 2, 2, 51, 48, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 38, 2, 1, 6, 1, 39, 1, 1, 1, 4, 1, 1, 45, 1, 1, 1, 2, 1, 2, 1, 1, 8, 27, 5, 3, 2, 11, 5, 1, 3, 2, 1, 2, 2, 11, 1, 2, 2, 32, 1, 10, 21, 10, 4, 2, 1, 99, 1, 1, 7, 1, 1, 6, 2, 2, 1, 4, 2, 10, 3, 2, 1, 14, 1, 1, 1, 1, 30, 27, 2, 89, 11, 1, 14, 10, 33, 9, 2, 1, 3, 1, 5, 22, 4, 1, 9, 1, 3, 1, 5, 2, 15, 1, 25, 3, 2, 1, 65, 1, 1, 11, 55, 27, 1, 3, 1, 54, 1, 1, 1, 1, 3, 8, 4, 1, 2, 1, 7, 10, 2, 2, 10, 1, 1, 6, 1, 7, 1, 1, 2, 1, 8, 2, 2, 2, 22, 1, 7, 1, 1, 3, 4, 2, 1, 1, 3, 4, 2, 2, 2, 2, 1, 1, 8, 1, 4, 2, 1, 3, 2, 2, 10, 2, 2, 6, 1, 1, 5, 2, 1, 1, 6, 4, 2, 2, 22, 1, 7, 1, 2, 1, 2, 1, 2, 2, 1, 1, 3, 2, 4, 2, 2, 3, 3, 1, 7, 4, 1, 1, 7, 10, 2, 3, 1, 11, 2, 1, 1, 9, 1, 3, 1, 22, 1, 7, 1, 2, 1, 5, 2, 1, 1, 3, 5, 1, 2, 1, 1, 2, 1, 2, 1, 15, 2, 2, 2, 10, 1, 1, 15, 1, 2, 1, 8, 2, 2, 2, 22, 1, 7, 1, 2, 1, 5, 2, 1, 1, 1, 1, 1, 4, 2, 2, 2, 2, 1, 8, 1, 1, 4, 2, 1, 3, 2, 2, 10, 1, 1, 6, 10, 1, 1, 1, 6, 3, 3, 1, 4, 3, 2, 1, 1, 1, 2, 3, 2, 3, 3, 3, 12, 4, 2, 1, 2, 3, 3, 1, 3, 1, 2, 1, 6, 1, 14, 10, 3, 6, 1, 1, 6, 3, 1, 8, 1, 3, 1, 23, 1, 10, 1, 5, 3, 1, 3, 4, 1, 3, 1, 4, 7, 2, 1, 2, 6, 2, 2, 2, 10, 8, 7, 1, 2, 2, 1, 8, 1, 3, 1, 23, 1, 10, 1, 5, 2, 1, 1, 1, 1, 5, 1, 1, 2, 1, 2, 2, 7, 2, 7, 1, 1, 2, 2, 2, 10, 1, 2, 15, 2, 1, 8, 1, 3, 1, 41, 2, 1, 3, 4, 1, 3, 1, 3, 1, 1, 8, 1, 8, 2, 2, 2, 10, 6, 3, 1, 6, 2, 2, 1, 18, 3, 24, 1, 9, 1, 1, 2, 7, 3, 1, 4, 3, 3, 1, 1, 1, 8, 18, 2, 1, 12, 48, 1, 2, 7, 4, 1, 6, 1, 8, 1, 10, 2, 37, 2, 1, 1, 2, 2, 1, 1, 2, 1, 6, 4, 1, 7, 1, 3, 1, 1, 1, 1, 2, 2, 1, 4, 1, 2, 6, 1, 2, 1, 2, 5, 1, 1, 1, 6, 2, 10, 2, 4, 32, 1, 3, 15, 1, 1, 3, 2, 6, 10, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 8, 1, 36, 4, 14, 1, 5, 1, 2, 5, 11, 1, 36, 1, 8, 1, 6, 1, 2, 5, 4, 2, 37, 43, 2, 4, 1, 6, 1, 2, 2, 2, 1, 10, 6, 6, 2, 2, 4, 3, 1, 3, 2, 7, 3, 4, 13, 1, 2, 2, 6, 1, 1, 1, 10, 3, 1, 2, 38, 1, 1, 5, 1, 2, 43, 1, 1, 332, 1, 4, 2, 7, 1, 1, 1, 4, 2, 41, 1, 4, 2, 33, 1, 4, 2, 7, 1, 1, 1, 4, 2, 15, 1, 57, 1, 4, 2, 67, 2, 3, 9, 20, 3, 16, 10, 6, 85, 11, 1, 620, 2, 17, 1, 26, 1, 1, 3, 75, 3, 3, 15, 13, 1, 4, 3, 11, 18, 3, 2, 9, 18, 2, 12, 13, 1, 3, 1, 2, 12, 52, 2, 1, 7, 8, 1, 2, 11, 3, 1, 3, 1, 1, 1, 2, 10, 6, 10, 6, 6, 1, 4, 3, 1, 1, 10, 6, 35, 1, 52, 8, 41, 1, 1, 5, 70, 10, 29, 3, 3, 4, 2, 3, 4, 2, 1, 6, 3, 4, 1, 3, 2, 10, 30, 2, 5, 11, 44, 4, 17, 7, 2, 6, 10, 1, 3, 34, 23, 2, 3, 2, 2, 53, 1, 1, 1, 7, 1, 1, 1, 1, 2, 8, 6, 10, 2, 1, 10, 6, 10, 6, 7, 1, 6, 82, 4, 1, 47, 1, 1, 5, 1, 1, 5, 1, 2, 7, 4, 10, 7, 10, 9, 9, 3, 2, 1, 30, 1, 4, 2, 2, 1, 1, 2, 2, 10, 44, 1, 1, 2, 3, 1, 1, 3, 2, 8, 4, 36, 8, 8, 2, 2, 3, 5, 10, 3, 3, 10, 30, 6, 2, 64, 8, 8, 3, 1, 13, 1, 7, 4, 1, 4, 2, 1, 2, 9, 44, 63, 13, 1, 34, 37, 39, 21, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 8, 6, 2, 6, 2, 8, 8, 8, 8, 6, 2, 6, 2, 8, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 14, 2, 8, 8, 8, 8, 8, 8, 5, 1, 2, 4, 1, 1, 1, 3, 3, 1, 2, 4, 1, 3, 4, 2, 2, 4, 1, 3, 8, 5, 3, 2, 3, 1, 2, 4, 1, 2, 1, 11, 5, 6, 2, 1, 1, 1, 2, 1, 1, 1, 8, 1, 1, 5, 1, 9, 1, 1, 4, 2, 3, 1, 1, 1, 11, 1, 1, 1, 10, 1, 5, 5, 6, 1, 1, 2, 6, 3, 1, 1, 1, 10, 3, 1, 1, 1, 13, 3, 27, 21, 13, 4, 1, 3, 12, 15, 2, 1, 4, 1, 2, 1, 3, 2, 3, 1, 1, 1, 2, 1, 5, 6, 1, 1, 1, 1, 1, 1, 4, 1, 1, 4, 1, 4, 1, 2, 2, 2, 5, 1, 4, 1, 1, 2, 1, 1, 16, 35, 1, 1, 4, 1, 6, 5, 5, 2, 4, 1, 2, 1, 2, 1, 7, 1, 31, 2, 2, 1, 1, 1, 31, 268, 8, 4, 20, 2, 7, 1, 1, 81, 1, 30, 25, 40, 6, 18, 12, 39, 25, 11, 21, 60, 78, 22, 183, 1, 9, 1, 54, 8, 111, 1, 144, 1, 103, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 30, 44, 5, 1, 1, 31, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 16, 256, 131, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 63, 1, 1, 1, 1, 32, 1, 1, 258, 48, 21, 2, 6, 3, 10, 166, 47, 1, 47, 1, 1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 4, 1, 1, 2, 1, 6, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 6, 1, 1, 1, 1, 3, 1, 1, 5, 4, 1, 2, 38, 1, 1, 5, 1, 2, 56, 7, 1, 1, 14, 1, 23, 9, 7, 1, 7, 1, 7, 1, 7, 1, 7, 1, 7, 1, 7, 1, 7, 1, 32, 2, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 9, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 10, 2, 68, 26, 1, 89, 12, 214, 26, 12, 4, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 9, 4, 2, 1, 5, 2, 3, 1, 1, 1, 2, 1, 86, 2, 2, 2, 2, 1, 1, 90, 1, 3, 1, 5, 41, 3, 94, 1, 2, 4, 10, 27, 5, 36, 12, 16, 31, 1, 10, 30, 8, 1, 15, 32, 10, 39, 15, 63, 1, 256, 6582, 10, 64, 20941, 51, 21, 1, 1143, 3, 55, 9, 40, 6, 2, 268, 1, 3, 16, 10, 2, 20, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 1, 70, 10, 2, 6, 8, 23, 9, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 77, 2, 1, 7, 1, 3, 1, 4, 1, 23, 2, 2, 1, 4, 4, 6, 2, 1, 1, 6, 52, 4, 8, 2, 50, 16, 1, 9, 2, 10, 6, 18, 6, 3, 1, 4, 10, 28, 8, 2, 23, 11, 2, 11, 1, 29, 3, 3, 1, 47, 1, 2, 4, 2, 1, 4, 13, 1, 1, 10, 4, 2, 32, 41, 6, 2, 2, 2, 2, 9, 3, 1, 8, 1, 1, 2, 10, 2, 4, 16, 1, 6, 3, 1, 1, 4, 48, 1, 1, 3, 2, 2, 5, 2, 1, 1, 1, 24, 2, 1, 2, 11, 1, 2, 2, 2, 1, 2, 1, 1, 10, 6, 2, 6, 2, 6, 9, 7, 1, 7, 145, 35, 2, 1, 2, 1, 2, 1, 1, 1, 2, 10, 6, 11172, 12, 23, 4, 49, 4, 2048, 6400, 366, 2, 106, 38, 7, 12, 5, 5, 1, 1, 10, 1, 13, 1, 5, 1, 1, 1, 2, 1, 2, 1, 108, 16, 17, 363, 1, 1, 16, 64, 2, 54, 40, 12, 1, 1, 2, 16, 7, 1, 1, 1, 6, 7, 9, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 4, 3, 3, 1, 4, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 3, 1, 1, 1, 2, 4, 5, 1, 135, 2, 1, 1, 3, 1, 3, 1, 1, 1, 1, 1, 1, 2, 10, 2, 3, 2, 26, 1, 1, 1, 1, 1, 1, 26, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 10, 1, 45, 2, 31, 3, 6, 2, 6, 2, 6, 2, 3, 3, 2, 1, 1, 1, 2, 1, 1, 4, 2, 10, 3, 2, 2, 12, 1, 26, 1, 19, 1, 2, 1, 15, 2, 14, 34, 123, 5, 3, 4, 45, 3, 9, 53, 4, 17, 1, 5, 12, 52, 45, 1, 130, 29, 3, 49, 47, 31, 1, 4, 12, 17, 1, 8, 1, 53, 30, 1, 1, 36, 4, 8, 1, 5, 42, 40, 40, 78, 2, 10, 854, 6, 2, 1, 1, 44, 1, 2, 3, 1, 2, 23, 1, 1, 8, 160, 22, 6, 3, 1, 26, 5, 1, 64, 56, 6, 2, 64, 1, 3, 1, 2, 5, 4, 4, 1, 3, 1, 27, 4, 3, 4, 1, 8, 8, 9, 7, 29, 2, 1, 128, 54, 3, 7, 22, 2, 8, 19, 5, 8, 128, 73, 535, 31, 385, 1, 1, 1, 53, 15, 7, 4, 20, 10, 16, 2, 1, 45, 3, 4, 2, 2, 2, 1, 4, 14, 25, 7, 10, 6, 3, 36, 5, 1, 8, 1, 10, 4, 60, 2, 1, 48, 3, 9, 2, 4, 4, 7, 10, 1190, 43, 1, 1, 1, 2, 6, 1, 1, 8, 10, 2358, 879, 145, 99, 13, 4, 2956, 1071, 13265, 569, 1223, 69, 11, 1, 46, 16, 4, 13, 16480, 2, 8190, 246, 10, 39, 2, 60, 2, 3, 3, 6, 8, 8, 2, 7, 30, 4, 48, 34, 66, 3, 1, 186, 87, 9, 18, 142, 26, 26, 26, 7, 1, 18, 26, 26, 1, 1, 2, 2, 1, 2, 2, 2, 4, 1, 8, 4, 1, 1, 1, 7, 1, 11, 26, 26, 2, 1, 4, 2, 8, 1, 7, 1, 26, 2, 1, 4, 1, 5, 1, 1, 3, 7, 1, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 28, 2, 25, 1, 25, 1, 6, 25, 1, 25, 1, 6, 25, 1, 25, 1, 6, 25, 1, 25, 1, 6, 25, 1, 25, 1, 6, 1, 1, 2, 50, 5632, 4, 1, 27, 1, 2, 1, 1, 2, 1, 1, 10, 1, 4, 1, 1, 1, 1, 6, 1, 4, 1, 1, 1, 1, 1, 1, 3, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 4, 1, 7, 1, 4, 1, 4, 1, 1, 1, 10, 1, 17, 5, 3, 1, 5, 1, 17, 52, 2, 270, 44, 4, 100, 12, 15, 2, 14, 2, 15, 1, 15, 32, 11, 5, 31, 1, 60, 4, 43, 75, 29, 13, 43, 5, 9, 7, 2, 174, 33, 15, 6, 1, 70, 3, 20, 12, 37, 1, 5, 21, 17, 15, 63, 1, 1, 1, 182, 1, 4, 3, 62, 2, 4, 12, 24, 147, 70, 4, 11, 48, 70, 58, 116, 2188, 42711, 41, 4149, 11, 222, 16354, 542, 722403, 1, 30, 96, 128, 240, 65040, 65534, 2, 65534]);
    $m_s_reflect_ManifestFactory$IntManifest$();
    var len = $uI(xs.array$6.length);
    var array = $newArrayObject($d_I.getArrayOf(), [len]);
    var elem$1 = 0;
    elem$1 = 0;
    var this$5 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs, 0, $uI(xs.array$6.length));
    while (this$5.hasNext__Z()) {
      var arg1 = this$5.next__O();
      array.u[elem$1] = $uI(arg1);
      elem$1 = ((1 + elem$1) | 0)
    };
    this.charTypeIndices$1 = this.uncompressDeltas__p1__AI__AI(array);
    this.bitmap$0$1 = (((2 | this.bitmap$0$1) << 24) >> 24)
  };
  return this.charTypeIndices$1
});
$c_jl_Character$.prototype.charTypes$lzycompute__p1__AB = (function() {
  if (((4 & this.bitmap$0$1) === 0)) {
    var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 5, 1, 2, 5, 1, 3, 2, 1, 3, 2, 1, 3, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 3, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 4, 27, 4, 27, 4, 27, 4, 27, 4, 27, 6, 1, 2, 1, 2, 4, 27, 1, 2, 0, 4, 2, 24, 0, 27, 1, 24, 1, 0, 1, 0, 1, 2, 1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 25, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 28, 6, 7, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 0, 1, 0, 4, 24, 0, 2, 0, 24, 20, 0, 26, 0, 6, 20, 6, 24, 6, 24, 6, 24, 6, 0, 5, 0, 5, 24, 0, 16, 0, 25, 24, 26, 24, 28, 6, 24, 0, 24, 5, 4, 5, 6, 9, 24, 5, 6, 5, 24, 5, 6, 16, 28, 6, 4, 6, 28, 6, 5, 9, 5, 28, 5, 24, 0, 16, 5, 6, 5, 6, 0, 5, 6, 5, 0, 9, 5, 6, 4, 28, 24, 4, 0, 5, 6, 4, 6, 4, 6, 4, 6, 0, 24, 0, 5, 6, 0, 24, 0, 5, 0, 5, 0, 6, 0, 6, 8, 5, 6, 8, 6, 5, 8, 6, 8, 6, 8, 5, 6, 5, 6, 24, 9, 24, 4, 5, 0, 5, 0, 6, 8, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 6, 5, 8, 6, 0, 8, 0, 8, 6, 5, 0, 8, 0, 5, 0, 5, 6, 0, 9, 5, 26, 11, 28, 26, 0, 6, 8, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 6, 0, 8, 6, 0, 6, 0, 6, 0, 6, 0, 5, 0, 5, 0, 9, 6, 5, 6, 0, 6, 8, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 6, 5, 8, 6, 0, 6, 8, 0, 8, 6, 0, 5, 0, 5, 6, 0, 9, 24, 26, 0, 6, 8, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 6, 5, 8, 6, 8, 6, 0, 8, 0, 8, 6, 0, 6, 8, 0, 5, 0, 5, 6, 0, 9, 28, 5, 11, 0, 6, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 8, 6, 8, 0, 8, 0, 8, 6, 0, 5, 0, 8, 0, 9, 11, 28, 26, 28, 0, 8, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 6, 8, 0, 6, 0, 6, 0, 6, 0, 5, 0, 5, 6, 0, 9, 0, 11, 28, 0, 8, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 6, 5, 8, 6, 8, 0, 6, 8, 0, 8, 6, 0, 8, 0, 5, 0, 5, 6, 0, 9, 0, 5, 0, 8, 0, 5, 0, 5, 0, 5, 0, 5, 8, 6, 0, 8, 0, 8, 6, 5, 0, 8, 0, 5, 6, 0, 9, 11, 0, 28, 5, 0, 8, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 6, 0, 8, 6, 0, 6, 0, 8, 0, 8, 24, 0, 5, 6, 5, 6, 0, 26, 5, 4, 6, 24, 9, 24, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 6, 5, 6, 0, 6, 5, 0, 5, 0, 4, 0, 6, 0, 9, 0, 5, 0, 5, 28, 24, 28, 24, 28, 6, 28, 9, 11, 28, 6, 28, 6, 28, 6, 21, 22, 21, 22, 8, 5, 0, 5, 0, 6, 8, 6, 24, 6, 5, 6, 0, 6, 0, 28, 6, 28, 0, 28, 24, 28, 24, 0, 5, 8, 6, 8, 6, 8, 6, 8, 6, 5, 9, 24, 5, 8, 6, 5, 6, 5, 8, 5, 8, 5, 6, 5, 6, 8, 6, 8, 6, 5, 8, 9, 8, 6, 28, 1, 0, 1, 0, 1, 0, 5, 24, 4, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 6, 24, 11, 0, 5, 28, 0, 5, 0, 20, 5, 24, 5, 12, 5, 21, 22, 0, 5, 24, 10, 0, 5, 0, 5, 6, 0, 5, 6, 24, 0, 5, 6, 0, 5, 0, 5, 0, 6, 0, 5, 6, 8, 6, 8, 6, 8, 6, 24, 4, 24, 26, 5, 6, 0, 9, 0, 11, 0, 24, 20, 24, 6, 12, 0, 9, 0, 5, 4, 5, 0, 5, 6, 5, 0, 5, 0, 5, 0, 6, 8, 6, 8, 0, 8, 6, 8, 6, 0, 28, 0, 24, 9, 5, 0, 5, 0, 5, 0, 8, 5, 8, 0, 9, 11, 0, 28, 5, 6, 8, 0, 24, 5, 8, 6, 8, 6, 0, 6, 8, 6, 8, 6, 8, 6, 0, 6, 9, 0, 9, 0, 24, 4, 24, 0, 6, 8, 5, 6, 8, 6, 8, 6, 8, 6, 8, 5, 0, 9, 24, 28, 6, 28, 0, 6, 8, 5, 8, 6, 8, 6, 8, 6, 8, 5, 9, 5, 6, 8, 6, 8, 6, 8, 6, 8, 0, 24, 5, 8, 6, 8, 6, 0, 24, 9, 0, 5, 9, 5, 4, 24, 0, 24, 0, 6, 24, 6, 8, 6, 5, 6, 5, 8, 6, 5, 0, 2, 4, 2, 4, 2, 4, 6, 0, 6, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 0, 1, 0, 2, 1, 2, 1, 2, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 1, 2, 1, 2, 0, 2, 3, 2, 3, 2, 3, 2, 0, 2, 1, 3, 27, 2, 27, 2, 0, 2, 1, 3, 27, 2, 0, 2, 1, 0, 27, 2, 1, 27, 0, 2, 0, 2, 1, 3, 27, 0, 12, 16, 20, 24, 29, 30, 21, 29, 30, 21, 29, 24, 13, 14, 16, 12, 24, 29, 30, 24, 23, 24, 25, 21, 22, 24, 25, 24, 23, 24, 12, 16, 0, 16, 11, 4, 0, 11, 25, 21, 22, 4, 11, 25, 21, 22, 0, 4, 0, 26, 0, 6, 7, 6, 7, 6, 0, 28, 1, 28, 1, 28, 2, 1, 2, 1, 2, 28, 1, 28, 25, 1, 28, 1, 28, 1, 28, 1, 28, 1, 28, 2, 1, 2, 5, 2, 28, 2, 1, 25, 1, 2, 28, 25, 28, 2, 28, 11, 10, 1, 2, 10, 11, 0, 25, 28, 25, 28, 25, 28, 25, 28, 25, 28, 25, 28, 25, 28, 25, 28, 25, 28, 25, 28, 25, 28, 25, 28, 21, 22, 28, 25, 28, 25, 28, 25, 28, 0, 28, 0, 28, 0, 11, 28, 11, 28, 25, 28, 25, 28, 25, 28, 25, 28, 0, 28, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 11, 28, 25, 21, 22, 25, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 25, 28, 25, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 25, 21, 22, 21, 22, 25, 21, 22, 25, 28, 25, 28, 25, 0, 28, 0, 1, 0, 2, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 28, 1, 2, 1, 2, 6, 1, 2, 0, 24, 11, 24, 2, 0, 2, 0, 2, 0, 5, 0, 4, 24, 0, 6, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 6, 24, 29, 30, 29, 30, 24, 29, 30, 24, 29, 30, 24, 20, 24, 20, 24, 29, 30, 24, 29, 30, 21, 22, 21, 22, 21, 22, 21, 22, 24, 4, 24, 20, 0, 28, 0, 28, 0, 28, 0, 28, 0, 12, 24, 28, 4, 5, 10, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 28, 21, 22, 21, 22, 21, 22, 21, 22, 20, 21, 22, 28, 10, 6, 8, 20, 4, 28, 10, 4, 5, 24, 28, 0, 5, 0, 6, 27, 4, 5, 20, 5, 24, 4, 5, 0, 5, 0, 5, 0, 28, 11, 28, 5, 0, 28, 0, 5, 28, 0, 11, 28, 11, 28, 11, 28, 11, 28, 11, 28, 0, 28, 5, 0, 28, 5, 0, 5, 4, 5, 0, 28, 0, 5, 4, 24, 5, 4, 24, 5, 9, 5, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 5, 6, 7, 24, 6, 24, 4, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 0, 6, 5, 10, 6, 24, 0, 27, 4, 27, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 4, 27, 1, 2, 1, 2, 0, 1, 2, 1, 2, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 4, 2, 5, 6, 5, 6, 5, 6, 5, 8, 6, 8, 28, 0, 11, 28, 26, 28, 0, 5, 24, 0, 8, 5, 8, 6, 0, 24, 9, 0, 6, 5, 24, 5, 0, 9, 5, 6, 24, 5, 6, 8, 0, 24, 5, 0, 6, 8, 5, 6, 8, 6, 8, 6, 8, 24, 0, 4, 9, 0, 24, 0, 5, 6, 8, 6, 8, 6, 0, 5, 6, 5, 6, 8, 0, 9, 0, 24, 5, 4, 5, 28, 5, 8, 0, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 0, 5, 4, 24, 5, 8, 6, 8, 24, 5, 4, 8, 6, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 8, 6, 8, 6, 8, 24, 8, 6, 0, 9, 0, 5, 0, 5, 0, 5, 0, 19, 18, 5, 0, 5, 0, 2, 0, 2, 0, 5, 6, 5, 25, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 27, 0, 5, 21, 22, 0, 5, 0, 5, 0, 5, 26, 28, 0, 6, 24, 21, 22, 24, 0, 6, 0, 24, 20, 23, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 21, 22, 24, 21, 22, 24, 23, 24, 0, 24, 20, 21, 22, 21, 22, 21, 22, 24, 25, 20, 25, 0, 24, 26, 24, 0, 5, 0, 5, 0, 16, 0, 24, 26, 24, 21, 22, 24, 25, 24, 20, 24, 9, 24, 25, 24, 1, 21, 24, 22, 27, 23, 27, 2, 21, 25, 22, 25, 21, 22, 24, 21, 22, 24, 5, 4, 5, 4, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 26, 25, 27, 28, 26, 0, 28, 25, 28, 0, 16, 28, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 24, 0, 11, 0, 28, 10, 11, 28, 11, 0, 28, 0, 28, 6, 0, 5, 0, 5, 0, 5, 0, 11, 0, 5, 10, 5, 10, 0, 5, 0, 24, 5, 0, 5, 24, 10, 0, 1, 2, 5, 0, 9, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 24, 11, 0, 5, 11, 0, 24, 5, 0, 24, 0, 5, 0, 5, 0, 5, 6, 0, 6, 0, 6, 5, 0, 5, 0, 5, 0, 6, 0, 6, 11, 0, 24, 0, 5, 11, 24, 0, 5, 0, 24, 5, 0, 11, 5, 0, 11, 0, 5, 0, 11, 0, 8, 6, 8, 5, 6, 24, 0, 11, 9, 0, 6, 8, 5, 8, 6, 8, 6, 24, 16, 24, 0, 5, 0, 9, 0, 6, 5, 6, 8, 6, 0, 9, 24, 0, 6, 8, 5, 8, 6, 8, 5, 24, 0, 9, 0, 5, 6, 8, 6, 8, 6, 8, 6, 0, 9, 0, 5, 0, 10, 0, 24, 0, 5, 0, 5, 0, 5, 0, 5, 8, 0, 6, 4, 0, 5, 0, 28, 0, 28, 0, 28, 8, 6, 28, 8, 16, 6, 28, 6, 28, 6, 28, 0, 28, 6, 28, 0, 28, 0, 11, 0, 1, 2, 1, 2, 0, 2, 1, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 0, 2, 0, 2, 0, 2, 1, 2, 1, 0, 1, 0, 1, 0, 1, 0, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 0, 1, 25, 2, 25, 2, 1, 25, 2, 25, 2, 1, 25, 2, 25, 2, 1, 25, 2, 25, 2, 1, 25, 2, 25, 2, 1, 2, 0, 9, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 5, 0, 25, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 11, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 28, 0, 5, 0, 5, 0, 5, 0, 5, 0, 16, 0, 16, 0, 6, 0, 18, 0, 18, 0]);
    $m_s_reflect_ManifestFactory$ByteManifest$();
    var len = $uI(xs.array$6.length);
    var array = $newArrayObject($d_B.getArrayOf(), [len]);
    var elem$1 = 0;
    elem$1 = 0;
    var this$5 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs, 0, $uI(xs.array$6.length));
    while (this$5.hasNext__Z()) {
      var arg1 = this$5.next__O();
      array.u[elem$1] = $uB(arg1);
      elem$1 = ((1 + elem$1) | 0)
    };
    this.charTypes$1 = array;
    this.bitmap$0$1 = (((4 | this.bitmap$0$1) << 24) >> 24)
  };
  return this.charTypes$1
});
$c_jl_Character$.prototype.isDigit__I__Z = (function(cp) {
  if ((cp < 256)) {
    return ((cp >= 48) && (cp <= 57))
  } else {
    var tpe = this.getTypeGE256__p1__I__B(cp);
    return (tpe === 9)
  }
});
$c_jl_Character$.prototype.getTypeGE256__p1__I__B = (function(codePoint) {
  var idx = ((1 + $m_ju_Arrays$().binarySearch__AI__I__I(this.charTypeIndices__p1__AI(), codePoint)) | 0);
  return this.charTypes__p1__AB().u[((idx < 0) ? ((-idx) | 0) : idx)]
});
$c_jl_Character$.prototype.charTypes__p1__AB = (function() {
  return (((4 & this.bitmap$0$1) === 0) ? this.charTypes$lzycompute__p1__AB() : this.charTypes$1)
});
$c_jl_Character$.prototype.java$lang$Character$$charTypesFirst256__AB = (function() {
  return (((1 & this.bitmap$0$1) === 0) ? this.java$lang$Character$$charTypesFirst256$lzycompute__p1__AB() : this.java$lang$Character$$charTypesFirst256$1)
});
$c_jl_Character$.prototype.isUpperCase__I__Z = (function(c) {
  return ((((c >= 8544) && (c <= 8559)) || ((c >= 9398) && (c <= 9423))) || (this.getType__I__I(c) === 1))
});
$c_jl_Character$.prototype.java$lang$Character$$charTypesFirst256$lzycompute__p1__AB = (function() {
  if (((1 & this.bitmap$0$1) === 0)) {
    var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 24, 24, 24, 26, 24, 24, 24, 21, 22, 24, 25, 24, 20, 24, 24, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 24, 24, 25, 25, 25, 24, 24, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 21, 24, 22, 27, 23, 27, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 21, 25, 22, 25, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 12, 24, 26, 26, 26, 26, 28, 24, 27, 28, 5, 29, 25, 16, 28, 27, 28, 25, 11, 11, 27, 2, 24, 24, 27, 11, 5, 30, 11, 11, 11, 24, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 25, 2, 2, 2, 2, 2, 2, 2, 2]);
    $m_s_reflect_ManifestFactory$ByteManifest$();
    var len = $uI(xs.array$6.length);
    var array = $newArrayObject($d_B.getArrayOf(), [len]);
    var elem$1 = 0;
    elem$1 = 0;
    var this$5 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs, 0, $uI(xs.array$6.length));
    while (this$5.hasNext__Z()) {
      var arg1 = this$5.next__O();
      array.u[elem$1] = $uB(arg1);
      elem$1 = ((1 + elem$1) | 0)
    };
    this.java$lang$Character$$charTypesFirst256$1 = array;
    this.bitmap$0$1 = (((1 | this.bitmap$0$1) << 24) >> 24)
  };
  return this.java$lang$Character$$charTypesFirst256$1
});
$c_jl_Character$.prototype.uncompressDeltas__p1__AI__AI = (function(deltas) {
  var end = deltas.u.length;
  var isEmpty$4 = (end <= 1);
  var scala$collection$immutable$Range$$lastElement$4 = (((-1) + end) | 0);
  if ((!isEmpty$4)) {
    var i = 1;
    while (true) {
      var v1 = i;
      deltas.u[v1] = ((deltas.u[v1] + deltas.u[(((-1) + v1) | 0)]) | 0);
      if ((i === scala$collection$immutable$Range$$lastElement$4)) {
        break
      };
      i = ((1 + i) | 0)
    }
  };
  return deltas
});
var $d_jl_Character$ = new $TypeData().initClass({
  jl_Character$: 0
}, false, "java.lang.Character$", {
  jl_Character$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Character$.prototype.$classData = $d_jl_Character$;
var $n_jl_Character$ = (void 0);
function $m_jl_Character$() {
  if ((!$n_jl_Character$)) {
    $n_jl_Character$ = new $c_jl_Character$().init___()
  };
  return $n_jl_Character$
}
/** @constructor */
function $c_jl_Double$() {
  $c_O.call(this);
  this.doubleStrPat$1 = null;
  this.bitmap$0$1 = false
}
$c_jl_Double$.prototype = new $h_O();
$c_jl_Double$.prototype.constructor = $c_jl_Double$;
/** @constructor */
function $h_jl_Double$() {
  /*<skip>*/
}
$h_jl_Double$.prototype = $c_jl_Double$.prototype;
$c_jl_Double$.prototype.init___ = (function() {
  return this
});
$c_jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
var $d_jl_Double$ = new $TypeData().initClass({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Double$.prototype.$classData = $d_jl_Double$;
var $n_jl_Double$ = (void 0);
function $m_jl_Double$() {
  if ((!$n_jl_Double$)) {
    $n_jl_Double$ = new $c_jl_Double$().init___()
  };
  return $n_jl_Double$
}
/** @constructor */
function $c_jl_Error() {
  $c_jl_Throwable.call(this)
}
$c_jl_Error.prototype = new $h_jl_Throwable();
$c_jl_Error.prototype.constructor = $c_jl_Error;
/** @constructor */
function $h_jl_Error() {
  /*<skip>*/
}
$h_jl_Error.prototype = $c_jl_Error.prototype;
/** @constructor */
function $c_jl_Exception() {
  $c_jl_Throwable.call(this)
}
$c_jl_Exception.prototype = new $h_jl_Throwable();
$c_jl_Exception.prototype.constructor = $c_jl_Exception;
/** @constructor */
function $h_jl_Exception() {
  /*<skip>*/
}
$h_jl_Exception.prototype = $c_jl_Exception.prototype;
/** @constructor */
function $c_jl_Integer$() {
  $c_O.call(this)
}
$c_jl_Integer$.prototype = new $h_O();
$c_jl_Integer$.prototype.constructor = $c_jl_Integer$;
/** @constructor */
function $h_jl_Integer$() {
  /*<skip>*/
}
$h_jl_Integer$.prototype = $c_jl_Integer$.prototype;
$c_jl_Integer$.prototype.init___ = (function() {
  return this
});
$c_jl_Integer$.prototype.bitCount__I__I = (function(i) {
  var t1 = ((i - (1431655765 & (i >> 1))) | 0);
  var t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
  return ($imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24)
});
var $d_jl_Integer$ = new $TypeData().initClass({
  jl_Integer$: 0
}, false, "java.lang.Integer$", {
  jl_Integer$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Integer$.prototype.$classData = $d_jl_Integer$;
var $n_jl_Integer$ = (void 0);
function $m_jl_Integer$() {
  if ((!$n_jl_Integer$)) {
    $n_jl_Integer$ = new $c_jl_Integer$().init___()
  };
  return $n_jl_Integer$
}
/** @constructor */
function $c_ju_Random$() {
  $c_O.call(this)
}
$c_ju_Random$.prototype = new $h_O();
$c_ju_Random$.prototype.constructor = $c_ju_Random$;
/** @constructor */
function $h_ju_Random$() {
  /*<skip>*/
}
$h_ju_Random$.prototype = $c_ju_Random$.prototype;
$c_ju_Random$.prototype.init___ = (function() {
  return this
});
$c_ju_Random$.prototype.java$util$Random$$randomSeed__J = (function() {
  var value = this.randomInt__p1__I();
  var value$1 = this.randomInt__p1__I();
  return new $c_sjsr_RuntimeLong().init___I__I(value$1, value)
});
$c_ju_Random$.prototype.randomInt__p1__I = (function() {
  var a = (4.294967296E9 * $uD($g.Math.random()));
  return $doubleToInt(((-2.147483648E9) + $uD($g.Math.floor(a))))
});
var $d_ju_Random$ = new $TypeData().initClass({
  ju_Random$: 0
}, false, "java.util.Random$", {
  ju_Random$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_Random$.prototype.$classData = $d_ju_Random$;
var $n_ju_Random$ = (void 0);
function $m_ju_Random$() {
  if ((!$n_ju_Random$)) {
    $n_ju_Random$ = new $c_ju_Random$().init___()
  };
  return $n_ju_Random$
}
/** @constructor */
function $c_ju_regex_Pattern() {
  $c_O.call(this);
  this.jsRegExp$1 = null;
  this.$$undpattern$1 = null;
  this.$$undflags$1 = 0
}
$c_ju_regex_Pattern.prototype = new $h_O();
$c_ju_regex_Pattern.prototype.constructor = $c_ju_regex_Pattern;
/** @constructor */
function $h_ju_regex_Pattern() {
  /*<skip>*/
}
$h_ju_regex_Pattern.prototype = $c_ju_regex_Pattern.prototype;
$c_ju_regex_Pattern.prototype.init___sjs_js_RegExp__T__I = (function(jsRegExp, _pattern, _flags) {
  this.jsRegExp$1 = jsRegExp;
  this.$$undpattern$1 = _pattern;
  this.$$undflags$1 = _flags;
  return this
});
$c_ju_regex_Pattern.prototype.toString__T = (function() {
  return this.$$undpattern$1
});
$c_ju_regex_Pattern.prototype.split__jl_CharSequence__I__AT = (function(input, limit) {
  var inputStr = $objectToString(input);
  if ((inputStr === "")) {
    var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([""]);
    var len = $uI(xs.array$6.length);
    var array = $newArrayObject($d_T.getArrayOf(), [len]);
    var elem$1 = 0;
    elem$1 = 0;
    var this$4 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs, 0, $uI(xs.array$6.length));
    while (this$4.hasNext__Z()) {
      var arg1 = this$4.next__O();
      array.u[elem$1] = arg1;
      elem$1 = ((1 + elem$1) | 0)
    };
    return array
  } else {
    var lim = ((limit > 0) ? limit : 2147483647);
    var matcher = new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this, inputStr, 0, $uI(inputStr.length));
    var elems$2 = null;
    elems$2 = [];
    var prevEnd = 0;
    var size = 0;
    while (((size < (((-1) + lim) | 0)) && matcher.find__Z())) {
      if ((matcher.end__I() !== 0)) {
        var beginIndex = prevEnd;
        var endIndex = matcher.start__I();
        var elem = $as_T(inputStr.substring(beginIndex, endIndex));
        var unboxedElem = ((elem === null) ? null : elem);
        elems$2.push(unboxedElem);
        size = ((1 + size) | 0)
      };
      prevEnd = matcher.end__I()
    };
    var beginIndex$1 = prevEnd;
    var elem$2 = $as_T(inputStr.substring(beginIndex$1));
    var unboxedElem$1 = ((elem$2 === null) ? null : elem$2);
    elems$2.push(unboxedElem$1);
    var result = $makeNativeArrayWrapper($d_T.getArrayOf(), elems$2);
    if ((limit !== 0)) {
      return result
    } else {
      var actualLength = result.u.length;
      while (((actualLength !== 0) && (result.u[(((-1) + actualLength) | 0)] === ""))) {
        actualLength = (((-1) + actualLength) | 0)
      };
      if ((actualLength === result.u.length)) {
        return result
      } else {
        var actualResult = $newArrayObject($d_T.getArrayOf(), [actualLength]);
        $systemArraycopy(result, 0, actualResult, 0, actualLength);
        return actualResult
      }
    }
  }
});
$c_ju_regex_Pattern.prototype.newJSRegExp__sjs_js_RegExp = (function() {
  var r = new $g.RegExp(this.jsRegExp$1);
  if ((r !== this.jsRegExp$1)) {
    return r
  } else {
    var jsFlags = ((($uZ(this.jsRegExp$1.global) ? "g" : "") + ($uZ(this.jsRegExp$1.ignoreCase) ? "i" : "")) + ($uZ(this.jsRegExp$1.multiline) ? "m" : ""));
    return new $g.RegExp($as_T(this.jsRegExp$1.source), jsFlags)
  }
});
var $d_ju_regex_Pattern = new $TypeData().initClass({
  ju_regex_Pattern: 0
}, false, "java.util.regex.Pattern", {
  ju_regex_Pattern: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_regex_Pattern.prototype.$classData = $d_ju_regex_Pattern;
/** @constructor */
function $c_ju_regex_Pattern$() {
  $c_O.call(this);
  this.java$util$regex$Pattern$$splitHackPat$1 = null;
  this.java$util$regex$Pattern$$flagHackPat$1 = null
}
$c_ju_regex_Pattern$.prototype = new $h_O();
$c_ju_regex_Pattern$.prototype.constructor = $c_ju_regex_Pattern$;
/** @constructor */
function $h_ju_regex_Pattern$() {
  /*<skip>*/
}
$h_ju_regex_Pattern$.prototype = $c_ju_regex_Pattern$.prototype;
$c_ju_regex_Pattern$.prototype.init___ = (function() {
  $n_ju_regex_Pattern$ = this;
  this.java$util$regex$Pattern$$splitHackPat$1 = new $g.RegExp("^\\\\Q(.|\\n|\\r)\\\\E$");
  this.java$util$regex$Pattern$$flagHackPat$1 = new $g.RegExp("^\\(\\?([idmsuxU]*)(?:-([idmsuxU]*))?\\)");
  return this
});
$c_ju_regex_Pattern$.prototype.compile__T__I__ju_regex_Pattern = (function(regex, flags) {
  if (((16 & flags) !== 0)) {
    var x1 = new $c_T2().init___O__O(this.quote__T__T(regex), flags)
  } else {
    var m = this.java$util$regex$Pattern$$splitHackPat$1.exec(regex);
    if ((m !== null)) {
      var value = m[1];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var this$5 = new $c_s_Some().init___O(new $c_T2().init___O__O(this.quote__T__T($as_T(value)), flags))
    } else {
      var this$5 = $m_s_None$()
    };
    if (this$5.isEmpty__Z()) {
      var m$1 = this.java$util$regex$Pattern$$flagHackPat$1.exec(regex);
      if ((m$1 !== null)) {
        var value$1 = m$1[0];
        if ((value$1 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        var thiz = $as_T(value$1);
        var beginIndex = $uI(thiz.length);
        var newPat = $as_T(regex.substring(beginIndex));
        var value$2 = m$1[1];
        if ((value$2 === (void 0))) {
          var flags1 = flags
        } else {
          var chars = $as_T(value$2);
          var this$19 = new $c_sci_StringOps().init___T(chars);
          var start = 0;
          var $$this = this$19.repr$1;
          var end = $uI($$this.length);
          var z = flags;
          var start$1 = start;
          var z$1 = z;
          var jsx$1;
          _foldl: while (true) {
            if ((start$1 !== end)) {
              var temp$start = ((1 + start$1) | 0);
              var arg1 = z$1;
              var arg2 = this$19.apply__I__O(start$1);
              var f = $uI(arg1);
              if ((arg2 === null)) {
                var c = 0
              } else {
                var this$23 = $as_jl_Character(arg2);
                var c = this$23.value$1
              };
              var temp$z = (f | this.java$util$regex$Pattern$$charToFlag__C__I(c));
              start$1 = temp$start;
              z$1 = temp$z;
              continue _foldl
            };
            var jsx$1 = z$1;
            break
          };
          var flags1 = $uI(jsx$1)
        };
        var value$3 = m$1[2];
        if ((value$3 === (void 0))) {
          var flags2 = flags1
        } else {
          var chars$3 = $as_T(value$3);
          var this$30 = new $c_sci_StringOps().init___T(chars$3);
          var start$2 = 0;
          var $$this$1 = this$30.repr$1;
          var end$1 = $uI($$this$1.length);
          var z$2 = flags1;
          var start$3 = start$2;
          var z$3 = z$2;
          var jsx$2;
          _foldl$1: while (true) {
            if ((start$3 !== end$1)) {
              var temp$start$1 = ((1 + start$3) | 0);
              var arg1$1 = z$3;
              var arg2$1 = this$30.apply__I__O(start$3);
              var f$1 = $uI(arg1$1);
              if ((arg2$1 === null)) {
                var c$1 = 0
              } else {
                var this$34 = $as_jl_Character(arg2$1);
                var c$1 = this$34.value$1
              };
              var temp$z$1 = (f$1 & (~this.java$util$regex$Pattern$$charToFlag__C__I(c$1)));
              start$3 = temp$start$1;
              z$3 = temp$z$1;
              continue _foldl$1
            };
            var jsx$2 = z$3;
            break
          };
          var flags2 = $uI(jsx$2)
        };
        var this$35 = new $c_s_Some().init___O(new $c_T2().init___O__O(newPat, flags2))
      } else {
        var this$35 = $m_s_None$()
      }
    } else {
      var this$35 = this$5
    };
    var x1 = $as_T2((this$35.isEmpty__Z() ? new $c_T2().init___O__O(regex, flags) : this$35.get__O()))
  };
  if ((x1 === null)) {
    throw new $c_s_MatchError().init___O(x1)
  };
  var jsPattern = $as_T(x1.$$und1__O());
  var flags1$1 = x1.$$und2$mcI$sp__I();
  var jsFlags = (("g" + (((2 & flags1$1) !== 0) ? "i" : "")) + (((8 & flags1$1) !== 0) ? "m" : ""));
  var jsRegExp = new $g.RegExp(jsPattern, jsFlags);
  return new $c_ju_regex_Pattern().init___sjs_js_RegExp__T__I(jsRegExp, regex, flags1$1)
});
$c_ju_regex_Pattern$.prototype.quote__T__T = (function(s) {
  var result = "";
  var i = 0;
  while ((i < $uI(s.length))) {
    var index = i;
    var c = (65535 & $uI(s.charCodeAt(index)));
    var jsx$2 = result;
    switch (c) {
      case 92:
      case 46:
      case 40:
      case 41:
      case 91:
      case 93:
      case 123:
      case 125:
      case 124:
      case 63:
      case 42:
      case 43:
      case 94:
      case 36: {
        var jsx$1 = ("\\" + new $c_jl_Character().init___C(c));
        break
      }
      default: {
        var jsx$1 = new $c_jl_Character().init___C(c)
      }
    };
    result = (("" + jsx$2) + jsx$1);
    i = ((1 + i) | 0)
  };
  return result
});
$c_ju_regex_Pattern$.prototype.java$util$regex$Pattern$$charToFlag__C__I = (function(c) {
  switch (c) {
    case 105: {
      return 2;
      break
    }
    case 100: {
      return 1;
      break
    }
    case 109: {
      return 8;
      break
    }
    case 115: {
      return 32;
      break
    }
    case 117: {
      return 64;
      break
    }
    case 120: {
      return 4;
      break
    }
    case 85: {
      return 256;
      break
    }
    default: {
      $m_s_sys_package$().error__T__sr_Nothing$("bad in-pattern flag")
    }
  }
});
var $d_ju_regex_Pattern$ = new $TypeData().initClass({
  ju_regex_Pattern$: 0
}, false, "java.util.regex.Pattern$", {
  ju_regex_Pattern$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_regex_Pattern$.prototype.$classData = $d_ju_regex_Pattern$;
var $n_ju_regex_Pattern$ = (void 0);
function $m_ju_regex_Pattern$() {
  if ((!$n_ju_regex_Pattern$)) {
    $n_ju_regex_Pattern$ = new $c_ju_regex_Pattern$().init___()
  };
  return $n_ju_regex_Pattern$
}
/** @constructor */
function $c_s_Console$() {
  $c_s_DeprecatedConsole.call(this);
  this.outVar$2 = null;
  this.errVar$2 = null;
  this.inVar$2 = null
}
$c_s_Console$.prototype = new $h_s_DeprecatedConsole();
$c_s_Console$.prototype.constructor = $c_s_Console$;
/** @constructor */
function $h_s_Console$() {
  /*<skip>*/
}
$h_s_Console$.prototype = $c_s_Console$.prototype;
$c_s_Console$.prototype.init___ = (function() {
  $n_s_Console$ = this;
  this.outVar$2 = new $c_s_util_DynamicVariable().init___O($m_jl_System$().out$1);
  this.errVar$2 = new $c_s_util_DynamicVariable().init___O($m_jl_System$().err$1);
  this.inVar$2 = new $c_s_util_DynamicVariable().init___O(null);
  return this
});
var $d_s_Console$ = new $TypeData().initClass({
  s_Console$: 0
}, false, "scala.Console$", {
  s_Console$: 1,
  s_DeprecatedConsole: 1,
  O: 1,
  s_io_AnsiColor: 1
});
$c_s_Console$.prototype.$classData = $d_s_Console$;
var $n_s_Console$ = (void 0);
function $m_s_Console$() {
  if ((!$n_s_Console$)) {
    $n_s_Console$ = new $c_s_Console$().init___()
  };
  return $n_s_Console$
}
/** @constructor */
function $c_s_Predef$() {
  $c_s_LowPriorityImplicits.call(this);
  this.Map$2 = null;
  this.Set$2 = null;
  this.ClassManifest$2 = null;
  this.Manifest$2 = null;
  this.NoManifest$2 = null;
  this.StringCanBuildFrom$2 = null;
  this.singleton$und$less$colon$less$2 = null;
  this.scala$Predef$$singleton$und$eq$colon$eq$f = null
}
$c_s_Predef$.prototype = new $h_s_LowPriorityImplicits();
$c_s_Predef$.prototype.constructor = $c_s_Predef$;
/** @constructor */
function $h_s_Predef$() {
  /*<skip>*/
}
$h_s_Predef$.prototype = $c_s_Predef$.prototype;
$c_s_Predef$.prototype.init___ = (function() {
  $n_s_Predef$ = this;
  $m_s_package$();
  $m_sci_List$();
  this.Map$2 = $m_sci_Map$();
  this.Set$2 = $m_sci_Set$();
  this.ClassManifest$2 = $m_s_reflect_package$().ClassManifest$1;
  this.Manifest$2 = $m_s_reflect_package$().Manifest$1;
  this.NoManifest$2 = $m_s_reflect_NoManifest$();
  this.StringCanBuildFrom$2 = new $c_s_Predef$$anon$3().init___();
  this.singleton$und$less$colon$less$2 = new $c_s_Predef$$anon$1().init___();
  this.scala$Predef$$singleton$und$eq$colon$eq$f = new $c_s_Predef$$anon$2().init___();
  return this
});
$c_s_Predef$.prototype.assert__Z__V = (function(assertion) {
  if ((!assertion)) {
    throw new $c_jl_AssertionError().init___O("assertion failed")
  }
});
$c_s_Predef$.prototype.require__Z__V = (function(requirement) {
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed")
  }
});
var $d_s_Predef$ = new $TypeData().initClass({
  s_Predef$: 0
}, false, "scala.Predef$", {
  s_Predef$: 1,
  s_LowPriorityImplicits: 1,
  O: 1,
  s_DeprecatedPredef: 1
});
$c_s_Predef$.prototype.$classData = $d_s_Predef$;
var $n_s_Predef$ = (void 0);
function $m_s_Predef$() {
  if ((!$n_s_Predef$)) {
    $n_s_Predef$ = new $c_s_Predef$().init___()
  };
  return $n_s_Predef$
}
/** @constructor */
function $c_s_StringContext$() {
  $c_O.call(this)
}
$c_s_StringContext$.prototype = new $h_O();
$c_s_StringContext$.prototype.constructor = $c_s_StringContext$;
/** @constructor */
function $h_s_StringContext$() {
  /*<skip>*/
}
$h_s_StringContext$.prototype = $c_s_StringContext$.prototype;
$c_s_StringContext$.prototype.init___ = (function() {
  return this
});
$c_s_StringContext$.prototype.treatEscapes0__p1__T__Z__T = (function(str, strict) {
  var len = $uI(str.length);
  var x1 = $m_sjsr_RuntimeString$().indexOf__T__I__I(str, 92);
  switch (x1) {
    case (-1): {
      return str;
      break
    }
    default: {
      return this.replace$1__p1__I__T__Z__I__T(x1, str, strict, len)
    }
  }
});
$c_s_StringContext$.prototype.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T = (function(i, next, str$1, strict$1, len$1, b$1) {
  _loop: while (true) {
    if ((next >= 0)) {
      if ((next > i)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, next)
      };
      var idx = ((1 + next) | 0);
      if ((idx >= len$1)) {
        throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
      };
      var index = idx;
      var x1 = (65535 & $uI(str$1.charCodeAt(index)));
      switch (x1) {
        case 98: {
          var c = 8;
          break
        }
        case 116: {
          var c = 9;
          break
        }
        case 110: {
          var c = 10;
          break
        }
        case 102: {
          var c = 12;
          break
        }
        case 114: {
          var c = 13;
          break
        }
        case 34: {
          var c = 34;
          break
        }
        case 39: {
          var c = 39;
          break
        }
        case 92: {
          var c = 92;
          break
        }
        default: {
          if (((x1 >= 48) && (x1 <= 55))) {
            if (strict$1) {
              throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
            };
            var index$1 = idx;
            var leadch = (65535 & $uI(str$1.charCodeAt(index$1)));
            var oct = (((-48) + leadch) | 0);
            idx = ((1 + idx) | 0);
            if ((idx < len$1)) {
              var index$2 = idx;
              var jsx$2 = ((65535 & $uI(str$1.charCodeAt(index$2))) >= 48)
            } else {
              var jsx$2 = false
            };
            if (jsx$2) {
              var index$3 = idx;
              var jsx$1 = ((65535 & $uI(str$1.charCodeAt(index$3))) <= 55)
            } else {
              var jsx$1 = false
            };
            if (jsx$1) {
              var jsx$3 = oct;
              var index$4 = idx;
              oct = (((-48) + (((jsx$3 << 3) + (65535 & $uI(str$1.charCodeAt(index$4)))) | 0)) | 0);
              idx = ((1 + idx) | 0);
              if (((idx < len$1) && (leadch <= 51))) {
                var index$5 = idx;
                var jsx$5 = ((65535 & $uI(str$1.charCodeAt(index$5))) >= 48)
              } else {
                var jsx$5 = false
              };
              if (jsx$5) {
                var index$6 = idx;
                var jsx$4 = ((65535 & $uI(str$1.charCodeAt(index$6))) <= 55)
              } else {
                var jsx$4 = false
              };
              if (jsx$4) {
                var jsx$6 = oct;
                var index$7 = idx;
                oct = (((-48) + (((jsx$6 << 3) + (65535 & $uI(str$1.charCodeAt(index$7)))) | 0)) | 0);
                idx = ((1 + idx) | 0)
              }
            };
            idx = (((-1) + idx) | 0);
            var c = (65535 & oct)
          } else {
            var c;
            throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
          }
        }
      };
      idx = ((1 + idx) | 0);
      b$1.append__C__jl_StringBuilder(c);
      var temp$i = idx;
      var temp$next = $m_sjsr_RuntimeString$().indexOf__T__I__I__I(str$1, 92, idx);
      i = temp$i;
      next = temp$next;
      continue _loop
    } else {
      if ((i < len$1)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, len$1)
      };
      return b$1.content$1
    }
  }
});
$c_s_StringContext$.prototype.replace$1__p1__I__T__Z__I__T = (function(first, str$1, strict$1, len$1) {
  var b = new $c_jl_StringBuilder().init___();
  return this.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T(0, first, str$1, strict$1, len$1, b)
});
var $d_s_StringContext$ = new $TypeData().initClass({
  s_StringContext$: 0
}, false, "scala.StringContext$", {
  s_StringContext$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$.prototype.$classData = $d_s_StringContext$;
var $n_s_StringContext$ = (void 0);
function $m_s_StringContext$() {
  if ((!$n_s_StringContext$)) {
    $n_s_StringContext$ = new $c_s_StringContext$().init___()
  };
  return $n_s_StringContext$
}
/** @constructor */
function $c_s_math_Fractional$() {
  $c_O.call(this)
}
$c_s_math_Fractional$.prototype = new $h_O();
$c_s_math_Fractional$.prototype.constructor = $c_s_math_Fractional$;
/** @constructor */
function $h_s_math_Fractional$() {
  /*<skip>*/
}
$h_s_math_Fractional$.prototype = $c_s_math_Fractional$.prototype;
$c_s_math_Fractional$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Fractional$ = new $TypeData().initClass({
  s_math_Fractional$: 0
}, false, "scala.math.Fractional$", {
  s_math_Fractional$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Fractional$.prototype.$classData = $d_s_math_Fractional$;
var $n_s_math_Fractional$ = (void 0);
function $m_s_math_Fractional$() {
  if ((!$n_s_math_Fractional$)) {
    $n_s_math_Fractional$ = new $c_s_math_Fractional$().init___()
  };
  return $n_s_math_Fractional$
}
/** @constructor */
function $c_s_math_Integral$() {
  $c_O.call(this)
}
$c_s_math_Integral$.prototype = new $h_O();
$c_s_math_Integral$.prototype.constructor = $c_s_math_Integral$;
/** @constructor */
function $h_s_math_Integral$() {
  /*<skip>*/
}
$h_s_math_Integral$.prototype = $c_s_math_Integral$.prototype;
$c_s_math_Integral$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Integral$ = new $TypeData().initClass({
  s_math_Integral$: 0
}, false, "scala.math.Integral$", {
  s_math_Integral$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Integral$.prototype.$classData = $d_s_math_Integral$;
var $n_s_math_Integral$ = (void 0);
function $m_s_math_Integral$() {
  if ((!$n_s_math_Integral$)) {
    $n_s_math_Integral$ = new $c_s_math_Integral$().init___()
  };
  return $n_s_math_Integral$
}
/** @constructor */
function $c_s_math_Numeric$() {
  $c_O.call(this)
}
$c_s_math_Numeric$.prototype = new $h_O();
$c_s_math_Numeric$.prototype.constructor = $c_s_math_Numeric$;
/** @constructor */
function $h_s_math_Numeric$() {
  /*<skip>*/
}
$h_s_math_Numeric$.prototype = $c_s_math_Numeric$.prototype;
$c_s_math_Numeric$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Numeric$ = new $TypeData().initClass({
  s_math_Numeric$: 0
}, false, "scala.math.Numeric$", {
  s_math_Numeric$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Numeric$.prototype.$classData = $d_s_math_Numeric$;
var $n_s_math_Numeric$ = (void 0);
function $m_s_math_Numeric$() {
  if ((!$n_s_math_Numeric$)) {
    $n_s_math_Numeric$ = new $c_s_math_Numeric$().init___()
  };
  return $n_s_math_Numeric$
}
function $is_s_math_ScalaNumber(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_math_ScalaNumber)))
}
function $as_s_math_ScalaNumber(obj) {
  return (($is_s_math_ScalaNumber(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.math.ScalaNumber"))
}
function $isArrayOf_s_math_ScalaNumber(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
}
function $asArrayOf_s_math_ScalaNumber(obj, depth) {
  return (($isArrayOf_s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth))
}
/** @constructor */
function $c_s_reflect_ClassTag$() {
  $c_O.call(this)
}
$c_s_reflect_ClassTag$.prototype = new $h_O();
$c_s_reflect_ClassTag$.prototype.constructor = $c_s_reflect_ClassTag$;
/** @constructor */
function $h_s_reflect_ClassTag$() {
  /*<skip>*/
}
$h_s_reflect_ClassTag$.prototype = $c_s_reflect_ClassTag$.prototype;
$c_s_reflect_ClassTag$.prototype.init___ = (function() {
  return this
});
$c_s_reflect_ClassTag$.prototype.apply__jl_Class__s_reflect_ClassTag = (function(runtimeClass1) {
  return ((runtimeClass1 === $d_B.getClassOf()) ? $m_s_reflect_ManifestFactory$ByteManifest$() : ((runtimeClass1 === $d_S.getClassOf()) ? $m_s_reflect_ManifestFactory$ShortManifest$() : ((runtimeClass1 === $d_C.getClassOf()) ? $m_s_reflect_ManifestFactory$CharManifest$() : ((runtimeClass1 === $d_I.getClassOf()) ? $m_s_reflect_ManifestFactory$IntManifest$() : ((runtimeClass1 === $d_J.getClassOf()) ? $m_s_reflect_ManifestFactory$LongManifest$() : ((runtimeClass1 === $d_F.getClassOf()) ? $m_s_reflect_ManifestFactory$FloatManifest$() : ((runtimeClass1 === $d_D.getClassOf()) ? $m_s_reflect_ManifestFactory$DoubleManifest$() : ((runtimeClass1 === $d_Z.getClassOf()) ? $m_s_reflect_ManifestFactory$BooleanManifest$() : ((runtimeClass1 === $d_V.getClassOf()) ? $m_s_reflect_ManifestFactory$UnitManifest$() : ((runtimeClass1 === $d_O.getClassOf()) ? $m_s_reflect_ManifestFactory$ObjectManifest$() : ((runtimeClass1 === $d_sr_Nothing$.getClassOf()) ? $m_s_reflect_ManifestFactory$NothingManifest$() : ((runtimeClass1 === $d_sr_Null$.getClassOf()) ? $m_s_reflect_ManifestFactory$NullManifest$() : new $c_s_reflect_ClassTag$GenericClassTag().init___jl_Class(runtimeClass1)))))))))))))
});
var $d_s_reflect_ClassTag$ = new $TypeData().initClass({
  s_reflect_ClassTag$: 0
}, false, "scala.reflect.ClassTag$", {
  s_reflect_ClassTag$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_reflect_ClassTag$.prototype.$classData = $d_s_reflect_ClassTag$;
var $n_s_reflect_ClassTag$ = (void 0);
function $m_s_reflect_ClassTag$() {
  if ((!$n_s_reflect_ClassTag$)) {
    $n_s_reflect_ClassTag$ = new $c_s_reflect_ClassTag$().init___()
  };
  return $n_s_reflect_ClassTag$
}
/** @constructor */
function $c_s_util_Either$() {
  $c_O.call(this)
}
$c_s_util_Either$.prototype = new $h_O();
$c_s_util_Either$.prototype.constructor = $c_s_util_Either$;
/** @constructor */
function $h_s_util_Either$() {
  /*<skip>*/
}
$h_s_util_Either$.prototype = $c_s_util_Either$.prototype;
$c_s_util_Either$.prototype.init___ = (function() {
  return this
});
var $d_s_util_Either$ = new $TypeData().initClass({
  s_util_Either$: 0
}, false, "scala.util.Either$", {
  s_util_Either$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Either$.prototype.$classData = $d_s_util_Either$;
var $n_s_util_Either$ = (void 0);
function $m_s_util_Either$() {
  if ((!$n_s_util_Either$)) {
    $n_s_util_Either$ = new $c_s_util_Either$().init___()
  };
  return $n_s_util_Either$
}
/** @constructor */
function $c_s_util_Left$() {
  $c_O.call(this)
}
$c_s_util_Left$.prototype = new $h_O();
$c_s_util_Left$.prototype.constructor = $c_s_util_Left$;
/** @constructor */
function $h_s_util_Left$() {
  /*<skip>*/
}
$h_s_util_Left$.prototype = $c_s_util_Left$.prototype;
$c_s_util_Left$.prototype.init___ = (function() {
  return this
});
$c_s_util_Left$.prototype.toString__T = (function() {
  return "Left"
});
var $d_s_util_Left$ = new $TypeData().initClass({
  s_util_Left$: 0
}, false, "scala.util.Left$", {
  s_util_Left$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Left$.prototype.$classData = $d_s_util_Left$;
var $n_s_util_Left$ = (void 0);
function $m_s_util_Left$() {
  if ((!$n_s_util_Left$)) {
    $n_s_util_Left$ = new $c_s_util_Left$().init___()
  };
  return $n_s_util_Left$
}
/** @constructor */
function $c_s_util_Random() {
  $c_O.call(this);
  this.self$1 = null
}
$c_s_util_Random.prototype = new $h_O();
$c_s_util_Random.prototype.constructor = $c_s_util_Random;
/** @constructor */
function $h_s_util_Random() {
  /*<skip>*/
}
$h_s_util_Random.prototype = $c_s_util_Random.prototype;
$c_s_util_Random.prototype.init___ju_Random = (function(self) {
  this.self$1 = self;
  return this
});
/** @constructor */
function $c_s_util_Right$() {
  $c_O.call(this)
}
$c_s_util_Right$.prototype = new $h_O();
$c_s_util_Right$.prototype.constructor = $c_s_util_Right$;
/** @constructor */
function $h_s_util_Right$() {
  /*<skip>*/
}
$h_s_util_Right$.prototype = $c_s_util_Right$.prototype;
$c_s_util_Right$.prototype.init___ = (function() {
  return this
});
$c_s_util_Right$.prototype.toString__T = (function() {
  return "Right"
});
var $d_s_util_Right$ = new $TypeData().initClass({
  s_util_Right$: 0
}, false, "scala.util.Right$", {
  s_util_Right$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Right$.prototype.$classData = $d_s_util_Right$;
var $n_s_util_Right$ = (void 0);
function $m_s_util_Right$() {
  if ((!$n_s_util_Right$)) {
    $n_s_util_Right$ = new $c_s_util_Right$().init___()
  };
  return $n_s_util_Right$
}
/** @constructor */
function $c_s_util_control_NoStackTrace$() {
  $c_O.call(this);
  this.$$undnoSuppression$1 = false
}
$c_s_util_control_NoStackTrace$.prototype = new $h_O();
$c_s_util_control_NoStackTrace$.prototype.constructor = $c_s_util_control_NoStackTrace$;
/** @constructor */
function $h_s_util_control_NoStackTrace$() {
  /*<skip>*/
}
$h_s_util_control_NoStackTrace$.prototype = $c_s_util_control_NoStackTrace$.prototype;
$c_s_util_control_NoStackTrace$.prototype.init___ = (function() {
  this.$$undnoSuppression$1 = false;
  return this
});
var $d_s_util_control_NoStackTrace$ = new $TypeData().initClass({
  s_util_control_NoStackTrace$: 0
}, false, "scala.util.control.NoStackTrace$", {
  s_util_control_NoStackTrace$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_control_NoStackTrace$.prototype.$classData = $d_s_util_control_NoStackTrace$;
var $n_s_util_control_NoStackTrace$ = (void 0);
function $m_s_util_control_NoStackTrace$() {
  if ((!$n_s_util_control_NoStackTrace$)) {
    $n_s_util_control_NoStackTrace$ = new $c_s_util_control_NoStackTrace$().init___()
  };
  return $n_s_util_control_NoStackTrace$
}
/** @constructor */
function $c_sc_IndexedSeq$$anon$1() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
}
$c_sc_IndexedSeq$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sc_IndexedSeq$$anon$1.prototype.constructor = $c_sc_IndexedSeq$$anon$1;
/** @constructor */
function $h_sc_IndexedSeq$$anon$1() {
  /*<skip>*/
}
$h_sc_IndexedSeq$$anon$1.prototype = $c_sc_IndexedSeq$$anon$1.prototype;
$c_sc_IndexedSeq$$anon$1.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sc_IndexedSeq$());
  return this
});
$c_sc_IndexedSeq$$anon$1.prototype.apply__scm_Builder = (function() {
  $m_sc_IndexedSeq$();
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$$anon$1 = new $TypeData().initClass({
  sc_IndexedSeq$$anon$1: 0
}, false, "scala.collection.IndexedSeq$$anon$1", {
  sc_IndexedSeq$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sc_IndexedSeq$$anon$1.prototype.$classData = $d_sc_IndexedSeq$$anon$1;
/** @constructor */
function $c_scg_GenSeqFactory() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_scg_GenSeqFactory.prototype = new $h_scg_GenTraversableFactory();
$c_scg_GenSeqFactory.prototype.constructor = $c_scg_GenSeqFactory;
/** @constructor */
function $h_scg_GenSeqFactory() {
  /*<skip>*/
}
$h_scg_GenSeqFactory.prototype = $c_scg_GenSeqFactory.prototype;
/** @constructor */
function $c_scg_GenTraversableFactory$$anon$1() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this);
  this.$$outer$2 = null
}
$c_scg_GenTraversableFactory$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_scg_GenTraversableFactory$$anon$1.prototype.constructor = $c_scg_GenTraversableFactory$$anon$1;
/** @constructor */
function $h_scg_GenTraversableFactory$$anon$1() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory$$anon$1.prototype = $c_scg_GenTraversableFactory$$anon$1.prototype;
$c_scg_GenTraversableFactory$$anon$1.prototype.apply__scm_Builder = (function() {
  return this.$$outer$2.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$$anon$1.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $$outer);
  return this
});
var $d_scg_GenTraversableFactory$$anon$1 = new $TypeData().initClass({
  scg_GenTraversableFactory$$anon$1: 0
}, false, "scala.collection.generic.GenTraversableFactory$$anon$1", {
  scg_GenTraversableFactory$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_scg_GenTraversableFactory$$anon$1.prototype.$classData = $d_scg_GenTraversableFactory$$anon$1;
/** @constructor */
function $c_scg_ImmutableMapFactory() {
  $c_scg_MapFactory.call(this)
}
$c_scg_ImmutableMapFactory.prototype = new $h_scg_MapFactory();
$c_scg_ImmutableMapFactory.prototype.constructor = $c_scg_ImmutableMapFactory;
/** @constructor */
function $h_scg_ImmutableMapFactory() {
  /*<skip>*/
}
$h_scg_ImmutableMapFactory.prototype = $c_scg_ImmutableMapFactory.prototype;
/** @constructor */
function $c_sci_$colon$colon$() {
  $c_O.call(this)
}
$c_sci_$colon$colon$.prototype = new $h_O();
$c_sci_$colon$colon$.prototype.constructor = $c_sci_$colon$colon$;
/** @constructor */
function $h_sci_$colon$colon$() {
  /*<skip>*/
}
$h_sci_$colon$colon$.prototype = $c_sci_$colon$colon$.prototype;
$c_sci_$colon$colon$.prototype.init___ = (function() {
  return this
});
$c_sci_$colon$colon$.prototype.toString__T = (function() {
  return "::"
});
var $d_sci_$colon$colon$ = new $TypeData().initClass({
  sci_$colon$colon$: 0
}, false, "scala.collection.immutable.$colon$colon$", {
  sci_$colon$colon$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon$.prototype.$classData = $d_sci_$colon$colon$;
var $n_sci_$colon$colon$ = (void 0);
function $m_sci_$colon$colon$() {
  if ((!$n_sci_$colon$colon$)) {
    $n_sci_$colon$colon$ = new $c_sci_$colon$colon$().init___()
  };
  return $n_sci_$colon$colon$
}
/** @constructor */
function $c_sci_Range$() {
  $c_O.call(this);
  this.MAX$undPRINT$1 = 0
}
$c_sci_Range$.prototype = new $h_O();
$c_sci_Range$.prototype.constructor = $c_sci_Range$;
/** @constructor */
function $h_sci_Range$() {
  /*<skip>*/
}
$h_sci_Range$.prototype = $c_sci_Range$.prototype;
$c_sci_Range$.prototype.init___ = (function() {
  this.MAX$undPRINT$1 = 512;
  return this
});
var $d_sci_Range$ = new $TypeData().initClass({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Range$.prototype.$classData = $d_sci_Range$;
var $n_sci_Range$ = (void 0);
function $m_sci_Range$() {
  if ((!$n_sci_Range$)) {
    $n_sci_Range$ = new $c_sci_Range$().init___()
  };
  return $n_sci_Range$
}
/** @constructor */
function $c_sci_Stream$StreamCanBuildFrom() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
}
$c_sci_Stream$StreamCanBuildFrom.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sci_Stream$StreamCanBuildFrom.prototype.constructor = $c_sci_Stream$StreamCanBuildFrom;
/** @constructor */
function $h_sci_Stream$StreamCanBuildFrom() {
  /*<skip>*/
}
$h_sci_Stream$StreamCanBuildFrom.prototype = $c_sci_Stream$StreamCanBuildFrom.prototype;
$c_sci_Stream$StreamCanBuildFrom.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sci_Stream$());
  return this
});
var $d_sci_Stream$StreamCanBuildFrom = new $TypeData().initClass({
  sci_Stream$StreamCanBuildFrom: 0
}, false, "scala.collection.immutable.Stream$StreamCanBuildFrom", {
  sci_Stream$StreamCanBuildFrom: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sci_Stream$StreamCanBuildFrom.prototype.$classData = $d_sci_Stream$StreamCanBuildFrom;
/** @constructor */
function $c_scm_StringBuilder$() {
  $c_O.call(this)
}
$c_scm_StringBuilder$.prototype = new $h_O();
$c_scm_StringBuilder$.prototype.constructor = $c_scm_StringBuilder$;
/** @constructor */
function $h_scm_StringBuilder$() {
  /*<skip>*/
}
$h_scm_StringBuilder$.prototype = $c_scm_StringBuilder$.prototype;
$c_scm_StringBuilder$.prototype.init___ = (function() {
  return this
});
var $d_scm_StringBuilder$ = new $TypeData().initClass({
  scm_StringBuilder$: 0
}, false, "scala.collection.mutable.StringBuilder$", {
  scm_StringBuilder$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder$.prototype.$classData = $d_scm_StringBuilder$;
var $n_scm_StringBuilder$ = (void 0);
function $m_scm_StringBuilder$() {
  if ((!$n_scm_StringBuilder$)) {
    $n_scm_StringBuilder$ = new $c_scm_StringBuilder$().init___()
  };
  return $n_scm_StringBuilder$
}
/** @constructor */
function $c_sjsr_AnonFunction0() {
  $c_sr_AbstractFunction0.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction0.prototype = new $h_sr_AbstractFunction0();
$c_sjsr_AnonFunction0.prototype.constructor = $c_sjsr_AnonFunction0;
/** @constructor */
function $h_sjsr_AnonFunction0() {
  /*<skip>*/
}
$h_sjsr_AnonFunction0.prototype = $c_sjsr_AnonFunction0.prototype;
$c_sjsr_AnonFunction0.prototype.apply__O = (function() {
  return (0, this.f$2)()
});
$c_sjsr_AnonFunction0.prototype.init___sjs_js_Function0 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction0 = new $TypeData().initClass({
  sjsr_AnonFunction0: 0
}, false, "scala.scalajs.runtime.AnonFunction0", {
  sjsr_AnonFunction0: 1,
  sr_AbstractFunction0: 1,
  O: 1,
  F0: 1
});
$c_sjsr_AnonFunction0.prototype.$classData = $d_sjsr_AnonFunction0;
/** @constructor */
function $c_sjsr_AnonFunction1() {
  $c_sr_AbstractFunction1.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction1.prototype = new $h_sr_AbstractFunction1();
$c_sjsr_AnonFunction1.prototype.constructor = $c_sjsr_AnonFunction1;
/** @constructor */
function $h_sjsr_AnonFunction1() {
  /*<skip>*/
}
$h_sjsr_AnonFunction1.prototype = $c_sjsr_AnonFunction1.prototype;
$c_sjsr_AnonFunction1.prototype.apply__O__O = (function(arg1) {
  return (0, this.f$2)(arg1)
});
$c_sjsr_AnonFunction1.prototype.init___sjs_js_Function1 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction1 = new $TypeData().initClass({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
$c_sjsr_AnonFunction1.prototype.$classData = $d_sjsr_AnonFunction1;
/** @constructor */
function $c_sjsr_RuntimeLong$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
  this.Zero$1 = null
}
$c_sjsr_RuntimeLong$.prototype = new $h_O();
$c_sjsr_RuntimeLong$.prototype.constructor = $c_sjsr_RuntimeLong$;
/** @constructor */
function $h_sjsr_RuntimeLong$() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong$.prototype = $c_sjsr_RuntimeLong$.prototype;
$c_sjsr_RuntimeLong$.prototype.init___ = (function() {
  $n_sjsr_RuntimeLong$ = this;
  this.Zero$1 = new $c_sjsr_RuntimeLong().init___I__I(0, 0);
  return this
});
$c_sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
$c_sjsr_RuntimeLong$.prototype.toUnsignedString__p1__I__I__T = (function(lo, hi) {
  if ((((-2097152) & hi) === 0)) {
    var this$5 = ((4.294967296E9 * hi) + $uD((lo >>> 0)));
    return ("" + this$5)
  } else {
    var quotRem = this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(lo, hi, 1000000000, 0, 2);
    var quotLo = $uI(quotRem["0"]);
    var quotHi = $uI(quotRem["1"]);
    var rem = $uI(quotRem["2"]);
    var quot = ((4.294967296E9 * quotHi) + $uD((quotLo >>> 0)));
    var remStr = ("" + rem);
    return ((("" + quot) + $as_T("000000000".substring($uI(remStr.length)))) + remStr)
  }
});
$c_sjsr_RuntimeLong$.prototype.divideImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if (((alo === (-2147483648)) && (blo === (-1)))) {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return (-2147483648)
      } else {
        var lo = ((alo / blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-1);
      return (-1)
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$div__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if ((neg === neg$1)) {
      return absRLo
    } else {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D = (function(lo, hi) {
  if ((hi < 0)) {
    var x = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    var jsx$1 = $uD((x >>> 0));
    var x$1 = ((-lo) | 0);
    return (-((4.294967296E9 * jsx$1) + $uD((x$1 >>> 0))))
  } else {
    return ((4.294967296E9 * hi) + $uD((lo >>> 0)))
  }
});
$c_sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  var lo = this.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(value);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I = (function(value) {
  if ((value < (-9.223372036854776E18))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-2147483648);
    return 0
  } else if ((value >= 9.223372036854776E18)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 2147483647;
    return (-1)
  } else {
    var rawLo = $uI((value | 0));
    var x = (value / 4.294967296E9);
    var rawHi = $uI((x | 0));
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (((value < 0) && (rawLo !== 0)) ? (((-1) + rawHi) | 0) : rawHi);
    return rawLo
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$div__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble / bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    var pow = ((31 - $clz32(blo)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((ahi >>> pow) | 0);
    return (((alo >>> pow) | 0) | ((ahi << 1) << ((31 - pow) | 0)))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    var pow$2 = ((31 - $clz32(bhi)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return ((ahi >>> pow$2) | 0)
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 0))
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toString__I__I__T = (function(lo, hi) {
  return ((hi === (lo >> 31)) ? ("" + lo) : ((hi < 0) ? ("-" + this.toUnsignedString__p1__I__I__T(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))) : this.toUnsignedString__p1__I__I__T(lo, hi)))
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo === blo) ? 0 : ((((-2147483648) ^ alo) < ((-2147483648) ^ blo)) ? (-1) : 1)) : ((ahi < bhi) ? (-1) : 1))
});
$c_sjsr_RuntimeLong$.prototype.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar = (function(alo, ahi, blo, bhi, ask) {
  var shift = ((((bhi !== 0) ? $clz32(bhi) : ((32 + $clz32(blo)) | 0)) - ((ahi !== 0) ? $clz32(ahi) : ((32 + $clz32(alo)) | 0))) | 0);
  var n = shift;
  var lo = (((32 & n) === 0) ? (blo << n) : 0);
  var hi = (((32 & n) === 0) ? (((((blo >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (bhi << n)) : (blo << n));
  var bShiftLo = lo;
  var bShiftHi = hi;
  var remLo = alo;
  var remHi = ahi;
  var quotLo = 0;
  var quotHi = 0;
  while (((shift >= 0) && (((-2097152) & remHi) !== 0))) {
    var alo$1 = remLo;
    var ahi$1 = remHi;
    var blo$1 = bShiftLo;
    var bhi$1 = bShiftHi;
    if (((ahi$1 === bhi$1) ? (((-2147483648) ^ alo$1) >= ((-2147483648) ^ blo$1)) : (((-2147483648) ^ ahi$1) >= ((-2147483648) ^ bhi$1)))) {
      var lo$1 = remLo;
      var hi$1 = remHi;
      var lo$2 = bShiftLo;
      var hi$2 = bShiftHi;
      var lo$3 = ((lo$1 - lo$2) | 0);
      var hi$3 = ((((-2147483648) ^ lo$3) > ((-2147483648) ^ lo$1)) ? (((-1) + ((hi$1 - hi$2) | 0)) | 0) : ((hi$1 - hi$2) | 0));
      remLo = lo$3;
      remHi = hi$3;
      if ((shift < 32)) {
        quotLo = (quotLo | (1 << shift))
      } else {
        quotHi = (quotHi | (1 << shift))
      }
    };
    shift = (((-1) + shift) | 0);
    var lo$4 = bShiftLo;
    var hi$4 = bShiftHi;
    var lo$5 = (((lo$4 >>> 1) | 0) | (hi$4 << 31));
    var hi$5 = ((hi$4 >>> 1) | 0);
    bShiftLo = lo$5;
    bShiftHi = hi$5
  };
  var alo$2 = remLo;
  var ahi$2 = remHi;
  if (((ahi$2 === bhi) ? (((-2147483648) ^ alo$2) >= ((-2147483648) ^ blo)) : (((-2147483648) ^ ahi$2) >= ((-2147483648) ^ bhi)))) {
    var lo$6 = remLo;
    var hi$6 = remHi;
    var remDouble = ((4.294967296E9 * hi$6) + $uD((lo$6 >>> 0)));
    var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
    if ((ask !== 1)) {
      var x = (remDouble / bDouble);
      var lo$7 = $uI((x | 0));
      var x$1 = (x / 4.294967296E9);
      var hi$7 = $uI((x$1 | 0));
      var lo$8 = quotLo;
      var hi$8 = quotHi;
      var lo$9 = ((lo$8 + lo$7) | 0);
      var hi$9 = ((((-2147483648) ^ lo$9) < ((-2147483648) ^ lo$8)) ? ((1 + ((hi$8 + hi$7) | 0)) | 0) : ((hi$8 + hi$7) | 0));
      quotLo = lo$9;
      quotHi = hi$9
    };
    if ((ask !== 0)) {
      var rem_mod_bDouble = (remDouble % bDouble);
      remLo = $uI((rem_mod_bDouble | 0));
      var x$2 = (rem_mod_bDouble / 4.294967296E9);
      remHi = $uI((x$2 | 0))
    }
  };
  if ((ask === 0)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = quotHi;
    var a = quotLo;
    return a
  } else if ((ask === 1)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = remHi;
    var a$1 = remLo;
    return a$1
  } else {
    var _1 = quotLo;
    var _2 = quotHi;
    var _3 = remLo;
    var _4 = remHi;
    var a$2 = [_1, _2, _3, _4];
    return a$2
  }
});
$c_sjsr_RuntimeLong$.prototype.remainderImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if ((blo !== (-1))) {
        var lo = ((alo % blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      } else {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return 0
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$percent__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if (neg) {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    } else {
      return absRLo
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$percent__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble % bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return (alo & (((-1) + blo) | 0))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (ahi & (((-1) + bhi) | 0));
    return alo
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 1))
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$timesHi__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  var a0 = (65535 & alo);
  var a1 = ((alo >>> 16) | 0);
  var a2 = (65535 & ahi);
  var a3 = ((ahi >>> 16) | 0);
  var b0 = (65535 & blo);
  var b1 = ((blo >>> 16) | 0);
  var b2 = (65535 & bhi);
  var b3 = ((bhi >>> 16) | 0);
  var c1part = (((($imul(a0, b0) >>> 16) | 0) + $imul(a1, b0)) | 0);
  var c2 = ((((c1part >>> 16) | 0) + (((((65535 & c1part) + $imul(a0, b1)) | 0) >>> 16) | 0)) | 0);
  var c3 = ((c2 >>> 16) | 0);
  c2 = (((65535 & c2) + $imul(a2, b0)) | 0);
  c3 = ((c3 + ((c2 >>> 16) | 0)) | 0);
  c2 = (((65535 & c2) + $imul(a1, b1)) | 0);
  c3 = ((c3 + ((c2 >>> 16) | 0)) | 0);
  c2 = (((65535 & c2) + $imul(a0, b2)) | 0);
  c3 = ((c3 + ((c2 >>> 16) | 0)) | 0);
  c3 = ((((((((c3 + $imul(a3, b0)) | 0) + $imul(a2, b1)) | 0) + $imul(a1, b2)) | 0) + $imul(a0, b3)) | 0);
  return ((65535 & c2) | (c3 << 16))
});
var $d_sjsr_RuntimeLong$ = new $TypeData().initClass({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_RuntimeLong$.prototype.$classData = $d_sjsr_RuntimeLong$;
var $n_sjsr_RuntimeLong$ = (void 0);
function $m_sjsr_RuntimeLong$() {
  if ((!$n_sjsr_RuntimeLong$)) {
    $n_sjsr_RuntimeLong$ = new $c_sjsr_RuntimeLong$().init___()
  };
  return $n_sjsr_RuntimeLong$
}
var $d_sr_Nothing$ = new $TypeData().initClass({
  sr_Nothing$: 0
}, false, "scala.runtime.Nothing$", {
  sr_Nothing$: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
/** @constructor */
function $c_Ljava_io_FilterOutputStream() {
  $c_Ljava_io_OutputStream.call(this);
  this.out$2 = null
}
$c_Ljava_io_FilterOutputStream.prototype = new $h_Ljava_io_OutputStream();
$c_Ljava_io_FilterOutputStream.prototype.constructor = $c_Ljava_io_FilterOutputStream;
/** @constructor */
function $h_Ljava_io_FilterOutputStream() {
  /*<skip>*/
}
$h_Ljava_io_FilterOutputStream.prototype = $c_Ljava_io_FilterOutputStream.prototype;
$c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  this.out$2 = out;
  return this
});
/** @constructor */
function $c_Lsgl_util_LoggingProvider$Logger$NoLogging$() {
  $c_O.call(this);
  this.ordinal$1 = 0;
  this.$$outer$1 = null
}
$c_Lsgl_util_LoggingProvider$Logger$NoLogging$.prototype = new $h_O();
$c_Lsgl_util_LoggingProvider$Logger$NoLogging$.prototype.constructor = $c_Lsgl_util_LoggingProvider$Logger$NoLogging$;
/** @constructor */
function $h_Lsgl_util_LoggingProvider$Logger$NoLogging$() {
  /*<skip>*/
}
$h_Lsgl_util_LoggingProvider$Logger$NoLogging$.prototype = $c_Lsgl_util_LoggingProvider$Logger$NoLogging$.prototype;
$c_Lsgl_util_LoggingProvider$Logger$NoLogging$.prototype.init___Lsgl_util_LoggingProvider$Logger$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.ordinal$1 = (-1);
  return this
});
var $d_Lsgl_util_LoggingProvider$Logger$NoLogging$ = new $TypeData().initClass({
  Lsgl_util_LoggingProvider$Logger$NoLogging$: 0
}, false, "sgl.util.LoggingProvider$Logger$NoLogging$", {
  Lsgl_util_LoggingProvider$Logger$NoLogging$: 1,
  O: 1,
  Lsgl_util_LoggingProvider$Logger$LogLevel: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_Lsgl_util_LoggingProvider$Logger$NoLogging$.prototype.$classData = $d_Lsgl_util_LoggingProvider$Logger$NoLogging$;
function $is_T(obj) {
  return ((typeof obj) === "string")
}
function $as_T(obj) {
  return (($is_T(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.String"))
}
function $isArrayOf_T(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
}
function $asArrayOf_T(obj, depth) {
  return (($isArrayOf_T(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.String;", depth))
}
var $d_T = new $TypeData().initClass({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), (void 0), $is_T);
/** @constructor */
function $c_jl_AssertionError() {
  $c_jl_Error.call(this)
}
$c_jl_AssertionError.prototype = new $h_jl_Error();
$c_jl_AssertionError.prototype.constructor = $c_jl_AssertionError;
/** @constructor */
function $h_jl_AssertionError() {
  /*<skip>*/
}
$h_jl_AssertionError.prototype = $c_jl_AssertionError.prototype;
$c_jl_AssertionError.prototype.init___O = (function(o) {
  var s = $objectToString(o);
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_AssertionError = new $TypeData().initClass({
  jl_AssertionError: 0
}, false, "java.lang.AssertionError", {
  jl_AssertionError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_AssertionError.prototype.$classData = $d_jl_AssertionError;
var $d_jl_Byte = new $TypeData().initClass({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isByte(x)
}));
/** @constructor */
function $c_jl_CloneNotSupportedException() {
  $c_jl_Exception.call(this)
}
$c_jl_CloneNotSupportedException.prototype = new $h_jl_Exception();
$c_jl_CloneNotSupportedException.prototype.constructor = $c_jl_CloneNotSupportedException;
/** @constructor */
function $h_jl_CloneNotSupportedException() {
  /*<skip>*/
}
$h_jl_CloneNotSupportedException.prototype = $c_jl_CloneNotSupportedException.prototype;
$c_jl_CloneNotSupportedException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_CloneNotSupportedException = new $TypeData().initClass({
  jl_CloneNotSupportedException: 0
}, false, "java.lang.CloneNotSupportedException", {
  jl_CloneNotSupportedException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_CloneNotSupportedException.prototype.$classData = $d_jl_CloneNotSupportedException;
function $isArrayOf_jl_Double(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
}
function $asArrayOf_jl_Double(obj, depth) {
  return (($isArrayOf_jl_Double(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Double;", depth))
}
var $d_jl_Double = new $TypeData().initClass({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "number")
}));
var $d_jl_Float = new $TypeData().initClass({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isFloat(x)
}));
var $d_jl_Integer = new $TypeData().initClass({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isInt(x)
}));
/** @constructor */
function $c_jl_JSConsoleBasedPrintStream$DummyOutputStream() {
  $c_Ljava_io_OutputStream.call(this)
}
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = new $h_Ljava_io_OutputStream();
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.constructor = $c_jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
function $h_jl_JSConsoleBasedPrintStream$DummyOutputStream() {
  /*<skip>*/
}
$h_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = $c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype;
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.init___ = (function() {
  return this
});
var $d_jl_JSConsoleBasedPrintStream$DummyOutputStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream$DummyOutputStream", {
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1
});
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream$DummyOutputStream;
function $isArrayOf_jl_Long(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
}
function $asArrayOf_jl_Long(obj, depth) {
  return (($isArrayOf_jl_Long(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long;", depth))
}
var $d_jl_Long = new $TypeData().initClass({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $is_sjsr_RuntimeLong(x)
}));
/** @constructor */
function $c_jl_RuntimeException() {
  $c_jl_Exception.call(this)
}
$c_jl_RuntimeException.prototype = new $h_jl_Exception();
$c_jl_RuntimeException.prototype.constructor = $c_jl_RuntimeException;
/** @constructor */
function $h_jl_RuntimeException() {
  /*<skip>*/
}
$h_jl_RuntimeException.prototype = $c_jl_RuntimeException.prototype;
$c_jl_RuntimeException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_RuntimeException = new $TypeData().initClass({
  jl_RuntimeException: 0
}, false, "java.lang.RuntimeException", {
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_RuntimeException.prototype.$classData = $d_jl_RuntimeException;
var $d_jl_Short = new $TypeData().initClass({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isShort(x)
}));
/** @constructor */
function $c_jl_StringBuilder() {
  $c_O.call(this);
  this.content$1 = null
}
$c_jl_StringBuilder.prototype = new $h_O();
$c_jl_StringBuilder.prototype.constructor = $c_jl_StringBuilder;
/** @constructor */
function $h_jl_StringBuilder() {
  /*<skip>*/
}
$h_jl_StringBuilder.prototype = $c_jl_StringBuilder.prototype;
$c_jl_StringBuilder.prototype.init___ = (function() {
  $c_jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
$c_jl_StringBuilder.prototype.append__T__jl_StringBuilder = (function(s) {
  this.content$1 = (("" + this.content$1) + ((s === null) ? "null" : s));
  return this
});
$c_jl_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var thiz = this.content$1;
  return $as_T(thiz.substring(start, end))
});
$c_jl_StringBuilder.prototype.toString__T = (function() {
  return this.content$1
});
$c_jl_StringBuilder.prototype.append__O__jl_StringBuilder = (function(obj) {
  return ((obj === null) ? this.append__T__jl_StringBuilder(null) : this.append__T__jl_StringBuilder($objectToString(obj)))
});
$c_jl_StringBuilder.prototype.init___I = (function(initialCapacity) {
  $c_jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
$c_jl_StringBuilder.prototype.append__jl_CharSequence__I__I__jl_StringBuilder = (function(csq, start, end) {
  return ((csq === null) ? this.append__jl_CharSequence__I__I__jl_StringBuilder("null", start, end) : this.append__T__jl_StringBuilder($objectToString($charSequenceSubSequence(csq, start, end))))
});
$c_jl_StringBuilder.prototype.append__C__jl_StringBuilder = (function(c) {
  return this.append__T__jl_StringBuilder($as_T($g.String.fromCharCode(($m_sjs_js_Any$(), c))))
});
$c_jl_StringBuilder.prototype.init___T = (function(content) {
  this.content$1 = content;
  return this
});
var $d_jl_StringBuilder = new $TypeData().initClass({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringBuilder.prototype.$classData = $d_jl_StringBuilder;
/** @constructor */
function $c_s_Array$() {
  $c_s_FallbackArrayBuilding.call(this)
}
$c_s_Array$.prototype = new $h_s_FallbackArrayBuilding();
$c_s_Array$.prototype.constructor = $c_s_Array$;
/** @constructor */
function $h_s_Array$() {
  /*<skip>*/
}
$h_s_Array$.prototype = $c_s_Array$.prototype;
$c_s_Array$.prototype.init___ = (function() {
  return this
});
$c_s_Array$.prototype.slowcopy__p2__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var i = srcPos;
  var j = destPos;
  var srcUntil = ((srcPos + length) | 0);
  while ((i < srcUntil)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(dest, j, $m_sr_ScalaRunTime$().array$undapply__O__I__O(src, i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
$c_s_Array$.prototype.copy__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var srcClass = $objectGetClass(src);
  if ((srcClass.isArray__Z() && $objectGetClass(dest).isAssignableFrom__jl_Class__Z(srcClass))) {
    $systemArraycopy(src, srcPos, dest, destPos, length)
  } else {
    this.slowcopy__p2__O__I__O__I__I__V(src, srcPos, dest, destPos, length)
  }
});
var $d_s_Array$ = new $TypeData().initClass({
  s_Array$: 0
}, false, "scala.Array$", {
  s_Array$: 1,
  s_FallbackArrayBuilding: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Array$.prototype.$classData = $d_s_Array$;
var $n_s_Array$ = (void 0);
function $m_s_Array$() {
  if ((!$n_s_Array$)) {
    $n_s_Array$ = new $c_s_Array$().init___()
  };
  return $n_s_Array$
}
/** @constructor */
function $c_s_Predef$$eq$colon$eq() {
  $c_O.call(this)
}
$c_s_Predef$$eq$colon$eq.prototype = new $h_O();
$c_s_Predef$$eq$colon$eq.prototype.constructor = $c_s_Predef$$eq$colon$eq;
/** @constructor */
function $h_s_Predef$$eq$colon$eq() {
  /*<skip>*/
}
$h_s_Predef$$eq$colon$eq.prototype = $c_s_Predef$$eq$colon$eq.prototype;
$c_s_Predef$$eq$colon$eq.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
function $c_s_Predef$$less$colon$less() {
  $c_O.call(this)
}
$c_s_Predef$$less$colon$less.prototype = new $h_O();
$c_s_Predef$$less$colon$less.prototype.constructor = $c_s_Predef$$less$colon$less;
/** @constructor */
function $h_s_Predef$$less$colon$less() {
  /*<skip>*/
}
$h_s_Predef$$less$colon$less.prototype = $c_s_Predef$$less$colon$less.prototype;
$c_s_Predef$$less$colon$less.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
function $c_s_math_Equiv$() {
  $c_O.call(this)
}
$c_s_math_Equiv$.prototype = new $h_O();
$c_s_math_Equiv$.prototype.constructor = $c_s_math_Equiv$;
/** @constructor */
function $h_s_math_Equiv$() {
  /*<skip>*/
}
$h_s_math_Equiv$.prototype = $c_s_math_Equiv$.prototype;
$c_s_math_Equiv$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Equiv$ = new $TypeData().initClass({
  s_math_Equiv$: 0
}, false, "scala.math.Equiv$", {
  s_math_Equiv$: 1,
  O: 1,
  s_math_LowPriorityEquiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Equiv$.prototype.$classData = $d_s_math_Equiv$;
var $n_s_math_Equiv$ = (void 0);
function $m_s_math_Equiv$() {
  if ((!$n_s_math_Equiv$)) {
    $n_s_math_Equiv$ = new $c_s_math_Equiv$().init___()
  };
  return $n_s_math_Equiv$
}
/** @constructor */
function $c_s_math_Ordering$() {
  $c_O.call(this)
}
$c_s_math_Ordering$.prototype = new $h_O();
$c_s_math_Ordering$.prototype.constructor = $c_s_math_Ordering$;
/** @constructor */
function $h_s_math_Ordering$() {
  /*<skip>*/
}
$h_s_math_Ordering$.prototype = $c_s_math_Ordering$.prototype;
$c_s_math_Ordering$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordering$ = new $TypeData().initClass({
  s_math_Ordering$: 0
}, false, "scala.math.Ordering$", {
  s_math_Ordering$: 1,
  O: 1,
  s_math_LowPriorityOrderingImplicits: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Ordering$.prototype.$classData = $d_s_math_Ordering$;
var $n_s_math_Ordering$ = (void 0);
function $m_s_math_Ordering$() {
  if ((!$n_s_math_Ordering$)) {
    $n_s_math_Ordering$ = new $c_s_math_Ordering$().init___()
  };
  return $n_s_math_Ordering$
}
/** @constructor */
function $c_s_reflect_NoManifest$() {
  $c_O.call(this)
}
$c_s_reflect_NoManifest$.prototype = new $h_O();
$c_s_reflect_NoManifest$.prototype.constructor = $c_s_reflect_NoManifest$;
/** @constructor */
function $h_s_reflect_NoManifest$() {
  /*<skip>*/
}
$h_s_reflect_NoManifest$.prototype = $c_s_reflect_NoManifest$.prototype;
$c_s_reflect_NoManifest$.prototype.init___ = (function() {
  return this
});
$c_s_reflect_NoManifest$.prototype.toString__T = (function() {
  return "<?>"
});
var $d_s_reflect_NoManifest$ = new $TypeData().initClass({
  s_reflect_NoManifest$: 0
}, false, "scala.reflect.NoManifest$", {
  s_reflect_NoManifest$: 1,
  O: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_reflect_NoManifest$.prototype.$classData = $d_s_reflect_NoManifest$;
var $n_s_reflect_NoManifest$ = (void 0);
function $m_s_reflect_NoManifest$() {
  if ((!$n_s_reflect_NoManifest$)) {
    $n_s_reflect_NoManifest$ = new $c_s_reflect_NoManifest$().init___()
  };
  return $n_s_reflect_NoManifest$
}
/** @constructor */
function $c_s_util_Random$() {
  $c_s_util_Random.call(this)
}
$c_s_util_Random$.prototype = new $h_s_util_Random();
$c_s_util_Random$.prototype.constructor = $c_s_util_Random$;
/** @constructor */
function $h_s_util_Random$() {
  /*<skip>*/
}
$h_s_util_Random$.prototype = $c_s_util_Random$.prototype;
$c_s_util_Random$.prototype.init___ = (function() {
  $c_s_util_Random.prototype.init___ju_Random.call(this, new $c_ju_Random().init___());
  return this
});
var $d_s_util_Random$ = new $TypeData().initClass({
  s_util_Random$: 0
}, false, "scala.util.Random$", {
  s_util_Random$: 1,
  s_util_Random: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Random$.prototype.$classData = $d_s_util_Random$;
var $n_s_util_Random$ = (void 0);
function $m_s_util_Random$() {
  if ((!$n_s_util_Random$)) {
    $n_s_util_Random$ = new $c_s_util_Random$().init___()
  };
  return $n_s_util_Random$
}
/** @constructor */
function $c_sc_AbstractIterator() {
  $c_O.call(this)
}
$c_sc_AbstractIterator.prototype = new $h_O();
$c_sc_AbstractIterator.prototype.constructor = $c_sc_AbstractIterator;
/** @constructor */
function $h_sc_AbstractIterator() {
  /*<skip>*/
}
$h_sc_AbstractIterator.prototype = $c_sc_AbstractIterator.prototype;
$c_sc_AbstractIterator.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sc_AbstractIterator.prototype.isEmpty__Z = (function() {
  return $f_sc_Iterator__isEmpty__Z(this)
});
$c_sc_AbstractIterator.prototype.toString__T = (function() {
  return $f_sc_Iterator__toString__T(this)
});
$c_sc_AbstractIterator.prototype.foreach__F1__V = (function(f) {
  $f_sc_Iterator__foreach__F1__V(this, f)
});
$c_sc_AbstractIterator.prototype.toStream__sci_Stream = (function() {
  return $f_sc_Iterator__toStream__sci_Stream(this)
});
$c_sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
/** @constructor */
function $c_scg_SetFactory() {
  $c_scg_GenSetFactory.call(this)
}
$c_scg_SetFactory.prototype = new $h_scg_GenSetFactory();
$c_scg_SetFactory.prototype.constructor = $c_scg_SetFactory;
/** @constructor */
function $h_scg_SetFactory() {
  /*<skip>*/
}
$h_scg_SetFactory.prototype = $c_scg_SetFactory.prototype;
/** @constructor */
function $c_sci_Map$() {
  $c_scg_ImmutableMapFactory.call(this)
}
$c_sci_Map$.prototype = new $h_scg_ImmutableMapFactory();
$c_sci_Map$.prototype.constructor = $c_sci_Map$;
/** @constructor */
function $h_sci_Map$() {
  /*<skip>*/
}
$h_sci_Map$.prototype = $c_sci_Map$.prototype;
$c_sci_Map$.prototype.init___ = (function() {
  return this
});
var $d_sci_Map$ = new $TypeData().initClass({
  sci_Map$: 0
}, false, "scala.collection.immutable.Map$", {
  sci_Map$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1
});
$c_sci_Map$.prototype.$classData = $d_sci_Map$;
var $n_sci_Map$ = (void 0);
function $m_sci_Map$() {
  if ((!$n_sci_Map$)) {
    $n_sci_Map$ = new $c_sci_Map$().init___()
  };
  return $n_sci_Map$
}
/** @constructor */
function $c_scm_GrowingBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_GrowingBuilder.prototype = new $h_O();
$c_scm_GrowingBuilder.prototype.constructor = $c_scm_GrowingBuilder;
/** @constructor */
function $h_scm_GrowingBuilder() {
  /*<skip>*/
}
$h_scm_GrowingBuilder.prototype = $c_scm_GrowingBuilder.prototype;
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_GrowingBuilder = (function(x) {
  this.elems$1.$$plus$eq__O__scg_Growable(x);
  return this
});
$c_scm_GrowingBuilder.prototype.init___scg_Growable = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_GrowingBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_GrowingBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_GrowingBuilder = new $TypeData().initClass({
  scm_GrowingBuilder: 0
}, false, "scala.collection.mutable.GrowingBuilder", {
  scm_GrowingBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_GrowingBuilder.prototype.$classData = $d_scm_GrowingBuilder;
/** @constructor */
function $c_sjsr_RuntimeLong() {
  $c_jl_Number.call(this);
  this.lo$2 = 0;
  this.hi$2 = 0
}
$c_sjsr_RuntimeLong.prototype = new $h_jl_Number();
$c_sjsr_RuntimeLong.prototype.constructor = $c_sjsr_RuntimeLong;
/** @constructor */
function $h_sjsr_RuntimeLong() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong.prototype = $c_sjsr_RuntimeLong.prototype;
$c_sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return $uJ(this)
});
$c_sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 | b.lo$2), (this.hi$2 | b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) >= ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return ((this.lo$2 << 24) >> 24)
});
$c_sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if ($is_sjsr_RuntimeLong(that)) {
    var x2 = $as_sjsr_RuntimeLong(that);
    return ((this.lo$2 === x2.lo$2) && (this.hi$2 === x2.hi$2))
  } else {
    return false
  }
});
$c_sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) < ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var blo = b.lo$2;
  return new $c_sjsr_RuntimeLong().init___I__I($imul(alo, blo), $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$timesHi__I__I__I__I__I(alo, this.hi$2, blo, b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, (l | (m << 22)), ((m >> 10) | (h << 12)));
  return this
});
$c_sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.remainderImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.toString__T = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.init___I__I = (function(lo, hi) {
  this.lo$2 = lo;
  this.hi$2 = hi;
  return this
});
$c_sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = $as_sjsr_RuntimeLong(x$1);
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) <= ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 & b.lo$2), (this.hi$2 & b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : ((this.hi$2 >>> n) | 0)), (((32 & n) === 0) ? ((this.hi$2 >>> n) | 0) : 0))
});
$c_sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) > ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (this.lo$2 << n) : 0), (((32 & n) === 0) ? (((((this.lo$2 >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (this.hi$2 << n)) : (this.lo$2 << n)))
});
$c_sjsr_RuntimeLong.prototype.init___I = (function(value) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, value, (value >> 31));
  return this
});
$c_sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(b) {
  return (!((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2)))
});
$c_sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo + b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) < ((-2147483648) ^ alo)) ? ((1 + ((ahi + bhi) | 0)) | 0) : ((ahi + bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return ((this.lo$2 << 16) >> 16)
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : (this.hi$2 >> n)), (((32 & n) === 0) ? (this.hi$2 >> n) : (this.hi$2 >> 31)))
});
$c_sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.divideImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return (this.lo$2 ^ this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  return new $c_sjsr_RuntimeLong().init___I__I((~this.lo$2), (~this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return $fround($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo - b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) > ((-2147483648) ^ alo)) ? (((-1) + ((ahi - bhi) | 0)) | 0) : ((ahi - bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 ^ b.lo$2), (this.hi$2 ^ b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(b) {
  return ((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2))
});
function $is_sjsr_RuntimeLong(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
}
function $as_sjsr_RuntimeLong(obj) {
  return (($is_sjsr_RuntimeLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
}
function $isArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
}
function $asArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (($isArrayOf_sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
}
var $d_sjsr_RuntimeLong = new $TypeData().initClass({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_sjsr_RuntimeLong.prototype.$classData = $d_sjsr_RuntimeLong;
/** @constructor */
function $c_Lsgl_GraphicsHelpersComponent$BitmapRegion() {
  $c_O.call(this);
  this.bitmap$1 = null;
  this.x$1 = 0;
  this.y$1 = 0;
  this.width$1 = 0;
  this.height$1 = 0;
  this.$$outer$1 = null
}
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype = new $h_O();
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype.constructor = $c_Lsgl_GraphicsHelpersComponent$BitmapRegion;
/** @constructor */
function $h_Lsgl_GraphicsHelpersComponent$BitmapRegion() {
  /*<skip>*/
}
$h_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype = $c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype;
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype.productPrefix__T = (function() {
  return "BitmapRegion"
});
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype.productArity__I = (function() {
  return 5
});
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (($is_Lsgl_GraphicsHelpersComponent$BitmapRegion(x$1) && ($as_Lsgl_GraphicsHelpersComponent$BitmapRegion(x$1).$$outer$1 === this.$$outer$1))) {
    var BitmapRegion$1 = $as_Lsgl_GraphicsHelpersComponent$BitmapRegion(x$1);
    var x = this.bitmap$1;
    var x$2 = BitmapRegion$1.bitmap$1;
    if ((((((x === null) ? (x$2 === null) : x.equals__O__Z(x$2)) && (this.x$1 === BitmapRegion$1.x$1)) && (this.y$1 === BitmapRegion$1.y$1)) && (this.width$1 === BitmapRegion$1.width$1))) {
      return (this.height$1 === BitmapRegion$1.height$1)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.bitmap$1;
      break
    }
    case 1: {
      return this.x$1;
      break
    }
    case 2: {
      return this.y$1;
      break
    }
    case 3: {
      return this.width$1;
      break
    }
    case 4: {
      return this.height$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype.init___Lsgl_GraphicsProvider__Lsgl_GraphicsProvider$AbstractBitmap__I__I__I__I = (function($$outer, bitmap, x, y, width, height) {
  this.bitmap$1 = bitmap;
  this.x$1 = x;
  this.y$1 = y;
  this.width$1 = width;
  this.height$1 = height;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.bitmap$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.x$1);
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.y$1);
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.width$1);
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.height$1);
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 5)
});
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lsgl_GraphicsHelpersComponent$BitmapRegion(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_GraphicsHelpersComponent$BitmapRegion)))
}
function $as_Lsgl_GraphicsHelpersComponent$BitmapRegion(obj) {
  return (($is_Lsgl_GraphicsHelpersComponent$BitmapRegion(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.GraphicsHelpersComponent$BitmapRegion"))
}
function $isArrayOf_Lsgl_GraphicsHelpersComponent$BitmapRegion(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_GraphicsHelpersComponent$BitmapRegion)))
}
function $asArrayOf_Lsgl_GraphicsHelpersComponent$BitmapRegion(obj, depth) {
  return (($isArrayOf_Lsgl_GraphicsHelpersComponent$BitmapRegion(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.GraphicsHelpersComponent$BitmapRegion;", depth))
}
var $d_Lsgl_GraphicsHelpersComponent$BitmapRegion = new $TypeData().initClass({
  Lsgl_GraphicsHelpersComponent$BitmapRegion: 0
}, false, "sgl.GraphicsHelpersComponent$BitmapRegion", {
  Lsgl_GraphicsHelpersComponent$BitmapRegion: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsHelpersComponent$BitmapRegion.prototype.$classData = $d_Lsgl_GraphicsHelpersComponent$BitmapRegion;
/** @constructor */
function $c_Lsgl_geometry_Point() {
  $c_O.call(this);
  this.x$1 = 0.0;
  this.y$1 = 0.0
}
$c_Lsgl_geometry_Point.prototype = new $h_O();
$c_Lsgl_geometry_Point.prototype.constructor = $c_Lsgl_geometry_Point;
/** @constructor */
function $h_Lsgl_geometry_Point() {
  /*<skip>*/
}
$h_Lsgl_geometry_Point.prototype = $c_Lsgl_geometry_Point.prototype;
$c_Lsgl_geometry_Point.prototype.productPrefix__T = (function() {
  return "Point"
});
$c_Lsgl_geometry_Point.prototype.productArity__I = (function() {
  return 2
});
$c_Lsgl_geometry_Point.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lsgl_geometry_Point(x$1)) {
    var Point$1 = $as_Lsgl_geometry_Point(x$1);
    return ((this.x$1 === Point$1.x$1) && (this.y$1 === Point$1.y$1))
  } else {
    return false
  }
});
$c_Lsgl_geometry_Point.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.x$1;
      break
    }
    case 1: {
      return this.y$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_geometry_Point.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_geometry_Point.prototype.init___D__D = (function(x, y) {
  this.x$1 = x;
  this.y$1 = y;
  return this
});
$c_Lsgl_geometry_Point.prototype.$$plus__Lsgl_geometry_Vec__Lsgl_geometry_Point = (function(m) {
  return new $c_Lsgl_geometry_Point().init___D__D((this.x$1 + m.x$1), (this.y$1 + m.y$1))
});
$c_Lsgl_geometry_Point.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().doubleHash__D__I(this.x$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().doubleHash__D__I(this.y$1));
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 2)
});
$c_Lsgl_geometry_Point.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lsgl_geometry_Point(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_geometry_Point)))
}
function $as_Lsgl_geometry_Point(obj) {
  return (($is_Lsgl_geometry_Point(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.geometry.Point"))
}
function $isArrayOf_Lsgl_geometry_Point(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_geometry_Point)))
}
function $asArrayOf_Lsgl_geometry_Point(obj, depth) {
  return (($isArrayOf_Lsgl_geometry_Point(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.geometry.Point;", depth))
}
var $d_Lsgl_geometry_Point = new $TypeData().initClass({
  Lsgl_geometry_Point: 0
}, false, "sgl.geometry.Point", {
  Lsgl_geometry_Point: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_geometry_Point.prototype.$classData = $d_Lsgl_geometry_Point;
/** @constructor */
function $c_Lsgl_geometry_Vec() {
  $c_O.call(this);
  this.x$1 = 0.0;
  this.y$1 = 0.0
}
$c_Lsgl_geometry_Vec.prototype = new $h_O();
$c_Lsgl_geometry_Vec.prototype.constructor = $c_Lsgl_geometry_Vec;
/** @constructor */
function $h_Lsgl_geometry_Vec() {
  /*<skip>*/
}
$h_Lsgl_geometry_Vec.prototype = $c_Lsgl_geometry_Vec.prototype;
$c_Lsgl_geometry_Vec.prototype.$$times__D__Lsgl_geometry_Vec = (function(s) {
  return new $c_Lsgl_geometry_Vec().init___D__D((this.x$1 * s), (this.y$1 * s))
});
$c_Lsgl_geometry_Vec.prototype.productPrefix__T = (function() {
  return "Vec"
});
$c_Lsgl_geometry_Vec.prototype.productArity__I = (function() {
  return 2
});
$c_Lsgl_geometry_Vec.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lsgl_geometry_Vec(x$1)) {
    var Vec$1 = $as_Lsgl_geometry_Vec(x$1);
    return ((this.x$1 === Vec$1.x$1) && (this.y$1 === Vec$1.y$1))
  } else {
    return false
  }
});
$c_Lsgl_geometry_Vec.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.x$1;
      break
    }
    case 1: {
      return this.y$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_geometry_Vec.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_geometry_Vec.prototype.$$plus__Lsgl_geometry_Vec__Lsgl_geometry_Vec = (function(m) {
  return new $c_Lsgl_geometry_Vec().init___D__D((this.x$1 + m.x$1), (this.y$1 + m.y$1))
});
$c_Lsgl_geometry_Vec.prototype.init___D__D = (function(x, y) {
  this.x$1 = x;
  this.y$1 = y;
  return this
});
$c_Lsgl_geometry_Vec.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().doubleHash__D__I(this.x$1));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().doubleHash__D__I(this.y$1));
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 2)
});
$c_Lsgl_geometry_Vec.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lsgl_geometry_Vec(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_geometry_Vec)))
}
function $as_Lsgl_geometry_Vec(obj) {
  return (($is_Lsgl_geometry_Vec(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.geometry.Vec"))
}
function $isArrayOf_Lsgl_geometry_Vec(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_geometry_Vec)))
}
function $asArrayOf_Lsgl_geometry_Vec(obj, depth) {
  return (($isArrayOf_Lsgl_geometry_Vec(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.geometry.Vec;", depth))
}
var $d_Lsgl_geometry_Vec = new $TypeData().initClass({
  Lsgl_geometry_Vec: 0
}, false, "sgl.geometry.Vec", {
  Lsgl_geometry_Vec: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_geometry_Vec.prototype.$classData = $d_Lsgl_geometry_Vec;
/** @constructor */
function $c_Lsgl_util_LoggingProvider$Logger$Tag() {
  $c_O.call(this);
  this.name$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype = new $h_O();
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype.constructor = $c_Lsgl_util_LoggingProvider$Logger$Tag;
/** @constructor */
function $h_Lsgl_util_LoggingProvider$Logger$Tag() {
  /*<skip>*/
}
$h_Lsgl_util_LoggingProvider$Logger$Tag.prototype = $c_Lsgl_util_LoggingProvider$Logger$Tag.prototype;
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype.productPrefix__T = (function() {
  return "Tag"
});
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype.productArity__I = (function() {
  return 1
});
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (($is_Lsgl_util_LoggingProvider$Logger$Tag(x$1) && ($as_Lsgl_util_LoggingProvider$Logger$Tag(x$1).$$outer$1 === this.$$outer$1))) {
    var Tag$1 = $as_Lsgl_util_LoggingProvider$Logger$Tag(x$1);
    return (this.name$1 === Tag$1.name$1)
  } else {
    return false
  }
});
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.name$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype.init___Lsgl_util_LoggingProvider$Logger$__T = (function($$outer, name) {
  this.name$1 = name;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lsgl_util_LoggingProvider$Logger$Tag(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_util_LoggingProvider$Logger$Tag)))
}
function $as_Lsgl_util_LoggingProvider$Logger$Tag(obj) {
  return (($is_Lsgl_util_LoggingProvider$Logger$Tag(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.util.LoggingProvider$Logger$Tag"))
}
function $isArrayOf_Lsgl_util_LoggingProvider$Logger$Tag(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_util_LoggingProvider$Logger$Tag)))
}
function $asArrayOf_Lsgl_util_LoggingProvider$Logger$Tag(obj, depth) {
  return (($isArrayOf_Lsgl_util_LoggingProvider$Logger$Tag(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.util.LoggingProvider$Logger$Tag;", depth))
}
var $d_Lsgl_util_LoggingProvider$Logger$Tag = new $TypeData().initClass({
  Lsgl_util_LoggingProvider$Logger$Tag: 0
}, false, "sgl.util.LoggingProvider$Logger$Tag", {
  Lsgl_util_LoggingProvider$Logger$Tag: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_util_LoggingProvider$Logger$Tag.prototype.$classData = $d_Lsgl_util_LoggingProvider$Logger$Tag;
/** @constructor */
function $c_jl_ArithmeticException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ArithmeticException.prototype = new $h_jl_RuntimeException();
$c_jl_ArithmeticException.prototype.constructor = $c_jl_ArithmeticException;
/** @constructor */
function $h_jl_ArithmeticException() {
  /*<skip>*/
}
$h_jl_ArithmeticException.prototype = $c_jl_ArithmeticException.prototype;
$c_jl_ArithmeticException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_ArithmeticException = new $TypeData().initClass({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArithmeticException.prototype.$classData = $d_jl_ArithmeticException;
/** @constructor */
function $c_jl_ClassCastException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ClassCastException.prototype = new $h_jl_RuntimeException();
$c_jl_ClassCastException.prototype.constructor = $c_jl_ClassCastException;
/** @constructor */
function $h_jl_ClassCastException() {
  /*<skip>*/
}
$h_jl_ClassCastException.prototype = $c_jl_ClassCastException.prototype;
$c_jl_ClassCastException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
function $is_jl_ClassCastException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ClassCastException)))
}
function $as_jl_ClassCastException(obj) {
  return (($is_jl_ClassCastException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.ClassCastException"))
}
function $isArrayOf_jl_ClassCastException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)))
}
function $asArrayOf_jl_ClassCastException(obj, depth) {
  return (($isArrayOf_jl_ClassCastException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.ClassCastException;", depth))
}
var $d_jl_ClassCastException = new $TypeData().initClass({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ClassCastException.prototype.$classData = $d_jl_ClassCastException;
/** @constructor */
function $c_jl_IllegalArgumentException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalArgumentException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalArgumentException.prototype.constructor = $c_jl_IllegalArgumentException;
/** @constructor */
function $h_jl_IllegalArgumentException() {
  /*<skip>*/
}
$h_jl_IllegalArgumentException.prototype = $c_jl_IllegalArgumentException.prototype;
$c_jl_IllegalArgumentException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_jl_IllegalArgumentException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IllegalArgumentException = new $TypeData().initClass({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalArgumentException.prototype.$classData = $d_jl_IllegalArgumentException;
/** @constructor */
function $c_jl_IllegalStateException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalStateException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalStateException.prototype.constructor = $c_jl_IllegalStateException;
/** @constructor */
function $h_jl_IllegalStateException() {
  /*<skip>*/
}
$h_jl_IllegalStateException.prototype = $c_jl_IllegalStateException.prototype;
$c_jl_IllegalStateException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IllegalStateException = new $TypeData().initClass({
  jl_IllegalStateException: 0
}, false, "java.lang.IllegalStateException", {
  jl_IllegalStateException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalStateException.prototype.$classData = $d_jl_IllegalStateException;
/** @constructor */
function $c_jl_IndexOutOfBoundsException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IndexOutOfBoundsException.prototype = new $h_jl_RuntimeException();
$c_jl_IndexOutOfBoundsException.prototype.constructor = $c_jl_IndexOutOfBoundsException;
/** @constructor */
function $h_jl_IndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_IndexOutOfBoundsException.prototype = $c_jl_IndexOutOfBoundsException.prototype;
$c_jl_IndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IndexOutOfBoundsException = new $TypeData().initClass({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IndexOutOfBoundsException.prototype.$classData = $d_jl_IndexOutOfBoundsException;
/** @constructor */
function $c_jl_NullPointerException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_NullPointerException.prototype = new $h_jl_RuntimeException();
$c_jl_NullPointerException.prototype.constructor = $c_jl_NullPointerException;
/** @constructor */
function $h_jl_NullPointerException() {
  /*<skip>*/
}
$h_jl_NullPointerException.prototype = $c_jl_NullPointerException.prototype;
$c_jl_NullPointerException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_NullPointerException = new $TypeData().initClass({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NullPointerException.prototype.$classData = $d_jl_NullPointerException;
/** @constructor */
function $c_jl_UnsupportedOperationException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_UnsupportedOperationException.prototype = new $h_jl_RuntimeException();
$c_jl_UnsupportedOperationException.prototype.constructor = $c_jl_UnsupportedOperationException;
/** @constructor */
function $h_jl_UnsupportedOperationException() {
  /*<skip>*/
}
$h_jl_UnsupportedOperationException.prototype = $c_jl_UnsupportedOperationException.prototype;
$c_jl_UnsupportedOperationException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_UnsupportedOperationException = new $TypeData().initClass({
  jl_UnsupportedOperationException: 0
}, false, "java.lang.UnsupportedOperationException", {
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_UnsupportedOperationException.prototype.$classData = $d_jl_UnsupportedOperationException;
/** @constructor */
function $c_ju_NoSuchElementException() {
  $c_jl_RuntimeException.call(this)
}
$c_ju_NoSuchElementException.prototype = new $h_jl_RuntimeException();
$c_ju_NoSuchElementException.prototype.constructor = $c_ju_NoSuchElementException;
/** @constructor */
function $h_ju_NoSuchElementException() {
  /*<skip>*/
}
$h_ju_NoSuchElementException.prototype = $c_ju_NoSuchElementException.prototype;
$c_ju_NoSuchElementException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_ju_NoSuchElementException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_ju_NoSuchElementException = new $TypeData().initClass({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_NoSuchElementException.prototype.$classData = $d_ju_NoSuchElementException;
/** @constructor */
function $c_s_MatchError() {
  $c_jl_RuntimeException.call(this);
  this.objString$4 = null;
  this.obj$4 = null;
  this.bitmap$0$4 = false
}
$c_s_MatchError.prototype = new $h_jl_RuntimeException();
$c_s_MatchError.prototype.constructor = $c_s_MatchError;
/** @constructor */
function $h_s_MatchError() {
  /*<skip>*/
}
$h_s_MatchError.prototype = $c_s_MatchError.prototype;
$c_s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
$c_s_MatchError.prototype.ofClass$1__p4__T = (function() {
  var this$1 = this.obj$4;
  return ("of class " + $objectGetClass(this$1).getName__T())
});
$c_s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return ((($objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
$c_s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
$c_s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
$c_s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_s_MatchError = new $TypeData().initClass({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_MatchError.prototype.$classData = $d_s_MatchError;
/** @constructor */
function $c_s_Option() {
  $c_O.call(this)
}
$c_s_Option.prototype = new $h_O();
$c_s_Option.prototype.constructor = $c_s_Option;
/** @constructor */
function $h_s_Option() {
  /*<skip>*/
}
$h_s_Option.prototype = $c_s_Option.prototype;
$c_s_Option.prototype.isDefined__Z = (function() {
  return (!this.isEmpty__Z())
});
/** @constructor */
function $c_s_Predef$$anon$1() {
  $c_s_Predef$$less$colon$less.call(this)
}
$c_s_Predef$$anon$1.prototype = new $h_s_Predef$$less$colon$less();
$c_s_Predef$$anon$1.prototype.constructor = $c_s_Predef$$anon$1;
/** @constructor */
function $h_s_Predef$$anon$1() {
  /*<skip>*/
}
$h_s_Predef$$anon$1.prototype = $c_s_Predef$$anon$1.prototype;
$c_s_Predef$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$1.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$1 = new $TypeData().initClass({
  s_Predef$$anon$1: 0
}, false, "scala.Predef$$anon$1", {
  s_Predef$$anon$1: 1,
  s_Predef$$less$colon$less: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$1.prototype.$classData = $d_s_Predef$$anon$1;
/** @constructor */
function $c_s_Predef$$anon$2() {
  $c_s_Predef$$eq$colon$eq.call(this)
}
$c_s_Predef$$anon$2.prototype = new $h_s_Predef$$eq$colon$eq();
$c_s_Predef$$anon$2.prototype.constructor = $c_s_Predef$$anon$2;
/** @constructor */
function $h_s_Predef$$anon$2() {
  /*<skip>*/
}
$h_s_Predef$$anon$2.prototype = $c_s_Predef$$anon$2.prototype;
$c_s_Predef$$anon$2.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$2.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$2 = new $TypeData().initClass({
  s_Predef$$anon$2: 0
}, false, "scala.Predef$$anon$2", {
  s_Predef$$anon$2: 1,
  s_Predef$$eq$colon$eq: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$2.prototype.$classData = $d_s_Predef$$anon$2;
/** @constructor */
function $c_s_StringContext() {
  $c_O.call(this);
  this.parts$1 = null
}
$c_s_StringContext.prototype = new $h_O();
$c_s_StringContext.prototype.constructor = $c_s_StringContext;
/** @constructor */
function $h_s_StringContext() {
  /*<skip>*/
}
$h_s_StringContext.prototype = $c_s_StringContext.prototype;
$c_s_StringContext.prototype.productPrefix__T = (function() {
  return "StringContext"
});
$c_s_StringContext.prototype.productArity__I = (function() {
  return 1
});
$c_s_StringContext.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_StringContext(x$1)) {
    var StringContext$1 = $as_s_StringContext(x$1);
    var x = this.parts$1;
    var x$2 = StringContext$1.parts$1;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_s_StringContext.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parts$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_StringContext.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_StringContext.prototype.checkLengths__sc_Seq__V = (function(args) {
  if ((this.parts$1.length__I() !== ((1 + args.length__I()) | 0))) {
    throw new $c_jl_IllegalArgumentException().init___T((((("wrong number of arguments (" + args.length__I()) + ") for interpolated string with ") + this.parts$1.length__I()) + " parts"))
  }
});
$c_s_StringContext.prototype.s__sc_Seq__T = (function(args) {
  var f = (function($this) {
    return (function(str$2) {
      var str = $as_T(str$2);
      var this$1 = $m_s_StringContext$();
      return this$1.treatEscapes0__p1__T__Z__T(str, false)
    })
  })(this);
  this.checkLengths__sc_Seq__V(args);
  var pi = this.parts$1.iterator__sc_Iterator();
  var ai = args.iterator__sc_Iterator();
  var arg1 = pi.next__O();
  var bldr = new $c_jl_StringBuilder().init___T($as_T(f(arg1)));
  while (ai.hasNext__Z()) {
    bldr.append__O__jl_StringBuilder(ai.next__O());
    var arg1$1 = pi.next__O();
    bldr.append__T__jl_StringBuilder($as_T(f(arg1$1)))
  };
  return bldr.content$1
});
$c_s_StringContext.prototype.init___sc_Seq = (function(parts) {
  this.parts$1 = parts;
  return this
});
$c_s_StringContext.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_StringContext.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_StringContext(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_StringContext)))
}
function $as_s_StringContext(obj) {
  return (($is_s_StringContext(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.StringContext"))
}
function $isArrayOf_s_StringContext(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_StringContext)))
}
function $asArrayOf_s_StringContext(obj, depth) {
  return (($isArrayOf_s_StringContext(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.StringContext;", depth))
}
var $d_s_StringContext = new $TypeData().initClass({
  s_StringContext: 0
}, false, "scala.StringContext", {
  s_StringContext: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext.prototype.$classData = $d_s_StringContext;
function $f_s_reflect_ClassTag__newArray__I__O($thiz, len) {
  var x1 = $thiz.runtimeClass__jl_Class();
  return ((x1 === $d_B.getClassOf()) ? $newArrayObject($d_B.getArrayOf(), [len]) : ((x1 === $d_S.getClassOf()) ? $newArrayObject($d_S.getArrayOf(), [len]) : ((x1 === $d_C.getClassOf()) ? $newArrayObject($d_C.getArrayOf(), [len]) : ((x1 === $d_I.getClassOf()) ? $newArrayObject($d_I.getArrayOf(), [len]) : ((x1 === $d_J.getClassOf()) ? $newArrayObject($d_J.getArrayOf(), [len]) : ((x1 === $d_F.getClassOf()) ? $newArrayObject($d_F.getArrayOf(), [len]) : ((x1 === $d_D.getClassOf()) ? $newArrayObject($d_D.getArrayOf(), [len]) : ((x1 === $d_Z.getClassOf()) ? $newArrayObject($d_Z.getArrayOf(), [len]) : ((x1 === $d_V.getClassOf()) ? $newArrayObject($d_sr_BoxedUnit.getArrayOf(), [len]) : $m_jl_reflect_Array$().newInstance__jl_Class__I__O($thiz.runtimeClass__jl_Class(), len))))))))))
}
function $f_s_reflect_ClassTag__equals__O__Z($thiz, x) {
  if ($is_s_reflect_ClassTag(x)) {
    var x$2 = $thiz.runtimeClass__jl_Class();
    var x$3 = $as_s_reflect_ClassTag(x).runtimeClass__jl_Class();
    return (x$2 === x$3)
  } else {
    return false
  }
}
function $f_s_reflect_ClassTag__prettyprint$1__ps_reflect_ClassTag__jl_Class__T($thiz, clazz) {
  if (clazz.isArray__Z()) {
    var jsx$1 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Array[", "]"]));
    var clazz$1 = clazz.getComponentType__jl_Class();
    return jsx$1.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$f_s_reflect_ClassTag__prettyprint$1__ps_reflect_ClassTag__jl_Class__T($thiz, clazz$1)]))
  } else {
    return clazz.getName__T()
  }
}
function $is_s_reflect_ClassTag(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_reflect_ClassTag)))
}
function $as_s_reflect_ClassTag(obj) {
  return (($is_s_reflect_ClassTag(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.reflect.ClassTag"))
}
function $isArrayOf_s_reflect_ClassTag(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_reflect_ClassTag)))
}
function $asArrayOf_s_reflect_ClassTag(obj, depth) {
  return (($isArrayOf_s_reflect_ClassTag(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.reflect.ClassTag;", depth))
}
/** @constructor */
function $c_s_util_control_BreakControl() {
  $c_jl_Throwable.call(this)
}
$c_s_util_control_BreakControl.prototype = new $h_jl_Throwable();
$c_s_util_control_BreakControl.prototype.constructor = $c_s_util_control_BreakControl;
/** @constructor */
function $h_s_util_control_BreakControl() {
  /*<skip>*/
}
$h_s_util_control_BreakControl.prototype = $c_s_util_control_BreakControl.prototype;
$c_s_util_control_BreakControl.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_s_util_control_BreakControl.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable(this)
});
var $d_s_util_control_BreakControl = new $TypeData().initClass({
  s_util_control_BreakControl: 0
}, false, "scala.util.control.BreakControl", {
  s_util_control_BreakControl: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_s_util_control_BreakControl.prototype.$classData = $d_s_util_control_BreakControl;
function $f_sc_GenSeqLike__equals__O__Z($thiz, that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return $thiz.sameElements__sc_GenIterable__Z(x2)
  } else {
    return false
  }
}
function $is_sc_GenTraversable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversable)))
}
function $as_sc_GenTraversable(obj) {
  return (($is_sc_GenTraversable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversable"))
}
function $isArrayOf_sc_GenTraversable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversable)))
}
function $asArrayOf_sc_GenTraversable(obj, depth) {
  return (($isArrayOf_sc_GenTraversable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversable;", depth))
}
/** @constructor */
function $c_sc_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sc_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Iterable$.prototype.constructor = $c_sc_Iterable$;
/** @constructor */
function $h_sc_Iterable$() {
  /*<skip>*/
}
$h_sc_Iterable$.prototype = $c_sc_Iterable$.prototype;
$c_sc_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sc_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Iterable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Iterable$ = new $TypeData().initClass({
  sc_Iterable$: 0
}, false, "scala.collection.Iterable$", {
  sc_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Iterable$.prototype.$classData = $d_sc_Iterable$;
var $n_sc_Iterable$ = (void 0);
function $m_sc_Iterable$() {
  if ((!$n_sc_Iterable$)) {
    $n_sc_Iterable$ = new $c_sc_Iterable$().init___()
  };
  return $n_sc_Iterable$
}
/** @constructor */
function $c_sc_Iterator$$anon$2() {
  $c_sc_AbstractIterator.call(this)
}
$c_sc_Iterator$$anon$2.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$2.prototype.constructor = $c_sc_Iterator$$anon$2;
/** @constructor */
function $h_sc_Iterator$$anon$2() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$2.prototype = $c_sc_Iterator$$anon$2.prototype;
$c_sc_Iterator$$anon$2.prototype.init___ = (function() {
  return this
});
$c_sc_Iterator$$anon$2.prototype.next__O = (function() {
  this.next__sr_Nothing$()
});
$c_sc_Iterator$$anon$2.prototype.next__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next on empty iterator")
});
$c_sc_Iterator$$anon$2.prototype.hasNext__Z = (function() {
  return false
});
var $d_sc_Iterator$$anon$2 = new $TypeData().initClass({
  sc_Iterator$$anon$2: 0
}, false, "scala.collection.Iterator$$anon$2", {
  sc_Iterator$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$2.prototype.$classData = $d_sc_Iterator$$anon$2;
/** @constructor */
function $c_sc_LinearSeqLike$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
}
$c_sc_LinearSeqLike$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sc_LinearSeqLike$$anon$1.prototype.constructor = $c_sc_LinearSeqLike$$anon$1;
/** @constructor */
function $h_sc_LinearSeqLike$$anon$1() {
  /*<skip>*/
}
$h_sc_LinearSeqLike$$anon$1.prototype = $c_sc_LinearSeqLike$$anon$1.prototype;
$c_sc_LinearSeqLike$$anon$1.prototype.init___sc_LinearSeqLike = (function($$outer) {
  this.these$2 = $$outer;
  return this
});
$c_sc_LinearSeqLike$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    var result = this.these$2.head__O();
    this.these$2 = $as_sc_LinearSeqLike(this.these$2.tail__O());
    return result
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_sc_LinearSeqLike$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.these$2.isEmpty__Z())
});
var $d_sc_LinearSeqLike$$anon$1 = new $TypeData().initClass({
  sc_LinearSeqLike$$anon$1: 0
}, false, "scala.collection.LinearSeqLike$$anon$1", {
  sc_LinearSeqLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_LinearSeqLike$$anon$1.prototype.$classData = $d_sc_LinearSeqLike$$anon$1;
/** @constructor */
function $c_sc_Traversable$() {
  $c_scg_GenTraversableFactory.call(this);
  this.breaks$3 = null
}
$c_sc_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Traversable$.prototype.constructor = $c_sc_Traversable$;
/** @constructor */
function $h_sc_Traversable$() {
  /*<skip>*/
}
$h_sc_Traversable$.prototype = $c_sc_Traversable$.prototype;
$c_sc_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_Traversable$ = this;
  this.breaks$3 = new $c_s_util_control_Breaks().init___();
  return this
});
$c_sc_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Traversable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Traversable$ = new $TypeData().initClass({
  sc_Traversable$: 0
}, false, "scala.collection.Traversable$", {
  sc_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Traversable$.prototype.$classData = $d_sc_Traversable$;
var $n_sc_Traversable$ = (void 0);
function $m_sc_Traversable$() {
  if ((!$n_sc_Traversable$)) {
    $n_sc_Traversable$ = new $c_sc_Traversable$().init___()
  };
  return $n_sc_Traversable$
}
/** @constructor */
function $c_scg_ImmutableSetFactory() {
  $c_scg_SetFactory.call(this)
}
$c_scg_ImmutableSetFactory.prototype = new $h_scg_SetFactory();
$c_scg_ImmutableSetFactory.prototype.constructor = $c_scg_ImmutableSetFactory;
/** @constructor */
function $h_scg_ImmutableSetFactory() {
  /*<skip>*/
}
$h_scg_ImmutableSetFactory.prototype = $c_scg_ImmutableSetFactory.prototype;
$c_scg_ImmutableSetFactory.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.emptyInstance__sci_Set())
});
/** @constructor */
function $c_sci_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sci_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Iterable$.prototype.constructor = $c_sci_Iterable$;
/** @constructor */
function $h_sci_Iterable$() {
  /*<skip>*/
}
$h_sci_Iterable$.prototype = $c_sci_Iterable$.prototype;
$c_sci_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Iterable$ = new $TypeData().initClass({
  sci_Iterable$: 0
}, false, "scala.collection.immutable.Iterable$", {
  sci_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Iterable$.prototype.$classData = $d_sci_Iterable$;
var $n_sci_Iterable$ = (void 0);
function $m_sci_Iterable$() {
  if ((!$n_sci_Iterable$)) {
    $n_sci_Iterable$ = new $c_sci_Iterable$().init___()
  };
  return $n_sci_Iterable$
}
/** @constructor */
function $c_sci_StreamIterator() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
}
$c_sci_StreamIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_StreamIterator.prototype.constructor = $c_sci_StreamIterator;
/** @constructor */
function $h_sci_StreamIterator() {
  /*<skip>*/
}
$h_sci_StreamIterator.prototype = $c_sci_StreamIterator.prototype;
$c_sci_StreamIterator.prototype.next__O = (function() {
  if ($f_sc_Iterator__isEmpty__Z(this)) {
    return $m_sc_Iterator$().empty$1.next__O()
  } else {
    var cur = this.these$2.v__sci_Stream();
    var result = cur.head__O();
    this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, cur$1) {
      return (function() {
        return $as_sci_Stream(cur$1.tail__O())
      })
    })(this, cur)));
    return result
  }
});
$c_sci_StreamIterator.prototype.init___sci_Stream = (function(self) {
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, self$1) {
    return (function() {
      return self$1
    })
  })(this, self)));
  return this
});
$c_sci_StreamIterator.prototype.hasNext__Z = (function() {
  var this$1 = this.these$2.v__sci_Stream();
  return $f_sc_TraversableOnce__nonEmpty__Z(this$1)
});
$c_sci_StreamIterator.prototype.toStream__sci_Stream = (function() {
  var result = this.these$2.v__sci_Stream();
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      $m_sci_Stream$();
      return $m_sci_Stream$Empty$()
    })
  })(this)));
  return result
});
var $d_sci_StreamIterator = new $TypeData().initClass({
  sci_StreamIterator: 0
}, false, "scala.collection.immutable.StreamIterator", {
  sci_StreamIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_StreamIterator.prototype.$classData = $d_sci_StreamIterator;
/** @constructor */
function $c_sci_Traversable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sci_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Traversable$.prototype.constructor = $c_sci_Traversable$;
/** @constructor */
function $h_sci_Traversable$() {
  /*<skip>*/
}
$h_sci_Traversable$.prototype = $c_sci_Traversable$.prototype;
$c_sci_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Traversable$ = new $TypeData().initClass({
  sci_Traversable$: 0
}, false, "scala.collection.immutable.Traversable$", {
  sci_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Traversable$.prototype.$classData = $d_sci_Traversable$;
var $n_sci_Traversable$ = (void 0);
function $m_sci_Traversable$() {
  if ((!$n_sci_Traversable$)) {
    $n_sci_Traversable$ = new $c_sci_Traversable$().init___()
  };
  return $n_sci_Traversable$
}
/** @constructor */
function $c_sci_TrieIterator() {
  $c_sc_AbstractIterator.call(this);
  this.elems$2 = null;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = null;
  this.scala$collection$immutable$TrieIterator$$posStack$f = null;
  this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null
}
$c_sci_TrieIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_TrieIterator.prototype.constructor = $c_sci_TrieIterator;
/** @constructor */
function $h_sci_TrieIterator() {
  /*<skip>*/
}
$h_sci_TrieIterator.prototype = $c_sci_TrieIterator.prototype;
$c_sci_TrieIterator.prototype.isContainer__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashMap1(x) || $is_sci_HashSet$HashSet1(x))
});
$c_sci_TrieIterator.prototype.next__O = (function() {
  if ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null)) {
    var el = this.scala$collection$immutable$TrieIterator$$subIter$f.next__O();
    if ((!this.scala$collection$immutable$TrieIterator$$subIter$f.hasNext__Z())) {
      this.scala$collection$immutable$TrieIterator$$subIter$f = null
    };
    return el
  } else {
    return this.next0__p2__Asci_Iterable__I__O(this.scala$collection$immutable$TrieIterator$$arrayD$f, this.scala$collection$immutable$TrieIterator$$posD$f)
  }
});
$c_sci_TrieIterator.prototype.initPosStack__AI = (function() {
  return $newArrayObject($d_I.getArrayOf(), [6])
});
$c_sci_TrieIterator.prototype.hasNext__Z = (function() {
  return ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null) || (this.scala$collection$immutable$TrieIterator$$depth$f >= 0))
});
$c_sci_TrieIterator.prototype.next0__p2__Asci_Iterable__I__O = (function(elems, i) {
  _next0: while (true) {
    if ((i === (((-1) + elems.u.length) | 0))) {
      this.scala$collection$immutable$TrieIterator$$depth$f = (((-1) + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f];
        this.scala$collection$immutable$TrieIterator$$posD$f = this.scala$collection$immutable$TrieIterator$$posStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f];
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = null
      } else {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
        this.scala$collection$immutable$TrieIterator$$posD$f = 0
      }
    } else {
      this.scala$collection$immutable$TrieIterator$$posD$f = ((1 + this.scala$collection$immutable$TrieIterator$$posD$f) | 0)
    };
    var m = elems.u[i];
    if (this.isContainer__p2__O__Z(m)) {
      return $as_sci_HashSet$HashSet1(m).key$6
    } else if (this.isTrie__p2__O__Z(m)) {
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = this.scala$collection$immutable$TrieIterator$$arrayD$f;
        this.scala$collection$immutable$TrieIterator$$posStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = this.scala$collection$immutable$TrieIterator$$posD$f
      };
      this.scala$collection$immutable$TrieIterator$$depth$f = ((1 + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      this.scala$collection$immutable$TrieIterator$$arrayD$f = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      this.scala$collection$immutable$TrieIterator$$posD$f = 0;
      var temp$elems = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      elems = temp$elems;
      i = 0;
      continue _next0
    } else {
      this.scala$collection$immutable$TrieIterator$$subIter$f = m.iterator__sc_Iterator();
      return this.next__O()
    }
  }
});
$c_sci_TrieIterator.prototype.getElems__p2__sci_Iterable__Asci_Iterable = (function(x) {
  if ($is_sci_HashMap$HashTrieMap(x)) {
    var x2 = $as_sci_HashMap$HashTrieMap(x);
    var jsx$1 = $asArrayOf_sc_AbstractIterable(x2.elems__Asci_HashMap(), 1)
  } else {
    if ((!$is_sci_HashSet$HashTrieSet(x))) {
      throw new $c_s_MatchError().init___O(x)
    };
    var x3 = $as_sci_HashSet$HashTrieSet(x);
    var jsx$1 = x3.elems$5
  };
  return $asArrayOf_sci_Iterable(jsx$1, 1)
});
$c_sci_TrieIterator.prototype.init___Asci_Iterable = (function(elems) {
  this.elems$2 = elems;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = this.initArrayStack__AAsci_Iterable();
  this.scala$collection$immutable$TrieIterator$$posStack$f = this.initPosStack__AI();
  this.scala$collection$immutable$TrieIterator$$arrayD$f = this.elems$2;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null;
  return this
});
$c_sci_TrieIterator.prototype.isTrie__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashTrieMap(x) || $is_sci_HashSet$HashTrieSet(x))
});
$c_sci_TrieIterator.prototype.initArrayStack__AAsci_Iterable = (function() {
  return $newArrayObject($d_sci_Iterable.getArrayOf().getArrayOf(), [6])
});
/** @constructor */
function $c_scm_Builder$$anon$1() {
  $c_O.call(this);
  this.self$1 = null;
  this.f$1$1 = null
}
$c_scm_Builder$$anon$1.prototype = new $h_O();
$c_scm_Builder$$anon$1.prototype.constructor = $c_scm_Builder$$anon$1;
/** @constructor */
function $h_scm_Builder$$anon$1() {
  /*<skip>*/
}
$h_scm_Builder$$anon$1.prototype = $c_scm_Builder$$anon$1.prototype;
$c_scm_Builder$$anon$1.prototype.init___scm_Builder__F1 = (function($$outer, f$1) {
  this.f$1$1 = f$1;
  this.self$1 = $$outer;
  return this
});
$c_scm_Builder$$anon$1.prototype.equals__O__Z = (function(that) {
  return $f_s_Proxy__equals__O__Z(this, that)
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
$c_scm_Builder$$anon$1.prototype.toString__T = (function() {
  return $f_s_Proxy__toString__T(this)
});
$c_scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1 = (function(xs) {
  this.self$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs);
  return this
});
$c_scm_Builder$$anon$1.prototype.result__O = (function() {
  return this.f$1$1.apply__O__O(this.self$1.result__O())
});
$c_scm_Builder$$anon$1.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundColl) {
  this.self$1.sizeHintBounded__I__sc_TraversableLike__V(size, boundColl)
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder$$anon$1 = (function(x) {
  this.self$1.$$plus$eq__O__scm_Builder(x);
  return this
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
$c_scm_Builder$$anon$1.prototype.hashCode__I = (function() {
  return this.self$1.hashCode__I()
});
$c_scm_Builder$$anon$1.prototype.sizeHint__I__V = (function(size) {
  this.self$1.sizeHint__I__V(size)
});
$c_scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1(xs)
});
var $d_scm_Builder$$anon$1 = new $TypeData().initClass({
  scm_Builder$$anon$1: 0
}, false, "scala.collection.mutable.Builder$$anon$1", {
  scm_Builder$$anon$1: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Proxy: 1
});
$c_scm_Builder$$anon$1.prototype.$classData = $d_scm_Builder$$anon$1;
/** @constructor */
function $c_scm_LazyBuilder() {
  $c_O.call(this);
  this.parts$1 = null
}
$c_scm_LazyBuilder.prototype = new $h_O();
$c_scm_LazyBuilder.prototype.constructor = $c_scm_LazyBuilder;
/** @constructor */
function $h_scm_LazyBuilder() {
  /*<skip>*/
}
$h_scm_LazyBuilder.prototype = $c_scm_LazyBuilder.prototype;
$c_scm_LazyBuilder.prototype.init___ = (function() {
  this.parts$1 = new $c_scm_ListBuffer().init___();
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder = (function(xs) {
  this.parts$1.$$plus$eq__O__scm_ListBuffer(xs);
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_LazyBuilder = (function(x) {
  var jsx$1 = this.parts$1;
  $m_sci_List$();
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([x]);
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  jsx$1.$$plus$eq__O__scm_ListBuffer($as_sci_List($f_sc_TraversableLike__to__scg_CanBuildFrom__O(xs, cbf)));
  return this
});
$c_scm_LazyBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder(xs)
});
/** @constructor */
function $c_scm_LinkedListLike$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.elems$2 = null
}
$c_scm_LinkedListLike$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_LinkedListLike$$anon$1.prototype.constructor = $c_scm_LinkedListLike$$anon$1;
/** @constructor */
function $h_scm_LinkedListLike$$anon$1() {
  /*<skip>*/
}
$h_scm_LinkedListLike$$anon$1.prototype = $c_scm_LinkedListLike$$anon$1.prototype;
$c_scm_LinkedListLike$$anon$1.prototype.next__O = (function() {
  var res = this.elems$2.elem$5;
  var this$1 = this.elems$2;
  this.elems$2 = this$1.next$5;
  return res
});
$c_scm_LinkedListLike$$anon$1.prototype.hasNext__Z = (function() {
  var this$1 = this.elems$2;
  return $f_sc_TraversableOnce__nonEmpty__Z(this$1)
});
$c_scm_LinkedListLike$$anon$1.prototype.init___scm_LinkedListLike = (function($$outer) {
  this.elems$2 = $$outer;
  return this
});
var $d_scm_LinkedListLike$$anon$1 = new $TypeData().initClass({
  scm_LinkedListLike$$anon$1: 0
}, false, "scala.collection.mutable.LinkedListLike$$anon$1", {
  scm_LinkedListLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_LinkedListLike$$anon$1.prototype.$classData = $d_scm_LinkedListLike$$anon$1;
/** @constructor */
function $c_scm_ListBuffer$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.cursor$2 = null
}
$c_scm_ListBuffer$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_ListBuffer$$anon$1.prototype.constructor = $c_scm_ListBuffer$$anon$1;
/** @constructor */
function $h_scm_ListBuffer$$anon$1() {
  /*<skip>*/
}
$h_scm_ListBuffer$$anon$1.prototype = $c_scm_ListBuffer$$anon$1.prototype;
$c_scm_ListBuffer$$anon$1.prototype.init___scm_ListBuffer = (function($$outer) {
  this.cursor$2 = ($$outer.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z() ? $m_sci_Nil$() : $$outer.scala$collection$mutable$ListBuffer$$start$6);
  return this
});
$c_scm_ListBuffer$$anon$1.prototype.next__O = (function() {
  if ((!this.hasNext__Z())) {
    throw new $c_ju_NoSuchElementException().init___T("next on empty Iterator")
  } else {
    var ans = this.cursor$2.head__O();
    var this$1 = this.cursor$2;
    this.cursor$2 = this$1.tail__sci_List();
    return ans
  }
});
$c_scm_ListBuffer$$anon$1.prototype.hasNext__Z = (function() {
  return (this.cursor$2 !== $m_sci_Nil$())
});
var $d_scm_ListBuffer$$anon$1 = new $TypeData().initClass({
  scm_ListBuffer$$anon$1: 0
}, false, "scala.collection.mutable.ListBuffer$$anon$1", {
  scm_ListBuffer$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_ListBuffer$$anon$1.prototype.$classData = $d_scm_ListBuffer$$anon$1;
/** @constructor */
function $c_scm_MutableList$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.elems$2 = null;
  this.count$2 = 0
}
$c_scm_MutableList$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_MutableList$$anon$1.prototype.constructor = $c_scm_MutableList$$anon$1;
/** @constructor */
function $h_scm_MutableList$$anon$1() {
  /*<skip>*/
}
$h_scm_MutableList$$anon$1.prototype = $c_scm_MutableList$$anon$1.prototype;
$c_scm_MutableList$$anon$1.prototype.next__O = (function() {
  if ((!this.hasNext__Z())) {
    throw new $c_ju_NoSuchElementException().init___()
  };
  this.count$2 = (((-1) + this.count$2) | 0);
  var e = this.elems$2.elem$5;
  if ((this.count$2 === 0)) {
    var jsx$1 = null
  } else {
    var this$1 = this.elems$2;
    var jsx$1 = this$1.next$5
  };
  this.elems$2 = jsx$1;
  return e
});
$c_scm_MutableList$$anon$1.prototype.init___scm_MutableList = (function($$outer) {
  this.elems$2 = $$outer.first0$5;
  this.count$2 = $$outer.len$5;
  return this
});
$c_scm_MutableList$$anon$1.prototype.hasNext__Z = (function() {
  if ((this.count$2 > 0)) {
    var this$1 = this.elems$2;
    return $f_sc_TraversableOnce__nonEmpty__Z(this$1)
  } else {
    return false
  }
});
var $d_scm_MutableList$$anon$1 = new $TypeData().initClass({
  scm_MutableList$$anon$1: 0
}, false, "scala.collection.mutable.MutableList$$anon$1", {
  scm_MutableList$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_MutableList$$anon$1.prototype.$classData = $d_scm_MutableList$$anon$1;
/** @constructor */
function $c_scm_SetBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_SetBuilder.prototype = new $h_O();
$c_scm_SetBuilder.prototype.constructor = $c_scm_SetBuilder;
/** @constructor */
function $h_scm_SetBuilder() {
  /*<skip>*/
}
$h_scm_SetBuilder.prototype = $c_scm_SetBuilder.prototype;
$c_scm_SetBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_SetBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_SetBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__O__sc_Set(x);
  return this
});
$c_scm_SetBuilder.prototype.init___sc_Set = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_SetBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_SetBuilder = new $TypeData().initClass({
  scm_SetBuilder: 0
}, false, "scala.collection.mutable.SetBuilder", {
  scm_SetBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_SetBuilder.prototype.$classData = $d_scm_SetBuilder;
/** @constructor */
function $c_scm_WrappedArrayBuilder() {
  $c_O.call(this);
  this.tag$1 = null;
  this.manifest$1 = null;
  this.elems$1 = null;
  this.capacity$1 = 0;
  this.size$1 = 0
}
$c_scm_WrappedArrayBuilder.prototype = new $h_O();
$c_scm_WrappedArrayBuilder.prototype.constructor = $c_scm_WrappedArrayBuilder;
/** @constructor */
function $h_scm_WrappedArrayBuilder() {
  /*<skip>*/
}
$h_scm_WrappedArrayBuilder.prototype = $c_scm_WrappedArrayBuilder.prototype;
$c_scm_WrappedArrayBuilder.prototype.init___s_reflect_ClassTag = (function(tag) {
  this.tag$1 = tag;
  this.manifest$1 = tag;
  this.capacity$1 = 0;
  this.size$1 = 0;
  return this
});
$c_scm_WrappedArrayBuilder.prototype.ensureSize__p1__I__V = (function(size) {
  if ((this.capacity$1 < size)) {
    var newsize = ((this.capacity$1 === 0) ? 16 : (this.capacity$1 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p1__I__V(newsize)
  }
});
$c_scm_WrappedArrayBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_WrappedArrayBuilder(elem)
});
$c_scm_WrappedArrayBuilder.prototype.$$plus$eq__O__scm_WrappedArrayBuilder = (function(elem) {
  this.ensureSize__p1__I__V(((1 + this.size$1) | 0));
  this.elems$1.update__I__O__V(this.size$1, elem);
  this.size$1 = ((1 + this.size$1) | 0);
  return this
});
$c_scm_WrappedArrayBuilder.prototype.mkArray__p1__I__scm_WrappedArray = (function(size) {
  var runtimeClass = this.tag$1.runtimeClass__jl_Class();
  var newelems = ((runtimeClass === $d_B.getClassOf()) ? new $c_scm_WrappedArray$ofByte().init___AB($newArrayObject($d_B.getArrayOf(), [size])) : ((runtimeClass === $d_S.getClassOf()) ? new $c_scm_WrappedArray$ofShort().init___AS($newArrayObject($d_S.getArrayOf(), [size])) : ((runtimeClass === $d_C.getClassOf()) ? new $c_scm_WrappedArray$ofChar().init___AC($newArrayObject($d_C.getArrayOf(), [size])) : ((runtimeClass === $d_I.getClassOf()) ? new $c_scm_WrappedArray$ofInt().init___AI($newArrayObject($d_I.getArrayOf(), [size])) : ((runtimeClass === $d_J.getClassOf()) ? new $c_scm_WrappedArray$ofLong().init___AJ($newArrayObject($d_J.getArrayOf(), [size])) : ((runtimeClass === $d_F.getClassOf()) ? new $c_scm_WrappedArray$ofFloat().init___AF($newArrayObject($d_F.getArrayOf(), [size])) : ((runtimeClass === $d_D.getClassOf()) ? new $c_scm_WrappedArray$ofDouble().init___AD($newArrayObject($d_D.getArrayOf(), [size])) : ((runtimeClass === $d_Z.getClassOf()) ? new $c_scm_WrappedArray$ofBoolean().init___AZ($newArrayObject($d_Z.getArrayOf(), [size])) : ((runtimeClass === $d_V.getClassOf()) ? new $c_scm_WrappedArray$ofUnit().init___Asr_BoxedUnit($newArrayObject($d_sr_BoxedUnit.getArrayOf(), [size])) : new $c_scm_WrappedArray$ofRef().init___AO($asArrayOf_O(this.tag$1.newArray__I__O(size), 1)))))))))));
  if ((this.size$1 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$1.array__O(), 0, newelems.array__O(), 0, this.size$1)
  };
  return newelems
});
$c_scm_WrappedArrayBuilder.prototype.result__O = (function() {
  return this.result__scm_WrappedArray()
});
$c_scm_WrappedArrayBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_WrappedArrayBuilder.prototype.resize__p1__I__V = (function(size) {
  this.elems$1 = this.mkArray__p1__I__scm_WrappedArray(size);
  this.capacity$1 = size
});
$c_scm_WrappedArrayBuilder.prototype.result__scm_WrappedArray = (function() {
  if (((this.capacity$1 !== 0) && (this.capacity$1 === this.size$1))) {
    this.capacity$1 = 0;
    return this.elems$1
  } else {
    return this.mkArray__p1__I__scm_WrappedArray(this.size$1)
  }
});
$c_scm_WrappedArrayBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_WrappedArrayBuilder(elem)
});
$c_scm_WrappedArrayBuilder.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$1 < size)) {
    this.resize__p1__I__V(size)
  }
});
$c_scm_WrappedArrayBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_WrappedArrayBuilder = new $TypeData().initClass({
  scm_WrappedArrayBuilder: 0
}, false, "scala.collection.mutable.WrappedArrayBuilder", {
  scm_WrappedArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_WrappedArrayBuilder.prototype.$classData = $d_scm_WrappedArrayBuilder;
/** @constructor */
function $c_sr_ScalaRunTime$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.c$2 = 0;
  this.cmax$2 = 0;
  this.x$2$2 = null
}
$c_sr_ScalaRunTime$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sr_ScalaRunTime$$anon$1.prototype.constructor = $c_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $h_sr_ScalaRunTime$$anon$1() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$$anon$1.prototype = $c_sr_ScalaRunTime$$anon$1.prototype;
$c_sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = this.x$2$2.productElement__I__O(this.c$2);
  this.c$2 = ((1 + this.c$2) | 0);
  return result
});
$c_sr_ScalaRunTime$$anon$1.prototype.init___s_Product = (function(x$2) {
  this.x$2$2 = x$2;
  this.c$2 = 0;
  this.cmax$2 = x$2.productArity__I();
  return this
});
$c_sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.c$2 < this.cmax$2)
});
var $d_sr_ScalaRunTime$$anon$1 = new $TypeData().initClass({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sr_ScalaRunTime$$anon$1.prototype.$classData = $d_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $c_Ljava_io_PrintStream() {
  $c_Ljava_io_FilterOutputStream.call(this);
  this.encoder$3 = null;
  this.autoFlush$3 = false;
  this.charset$3 = null;
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  this.bitmap$0$3 = false
}
$c_Ljava_io_PrintStream.prototype = new $h_Ljava_io_FilterOutputStream();
$c_Ljava_io_PrintStream.prototype.constructor = $c_Ljava_io_PrintStream;
/** @constructor */
function $h_Ljava_io_PrintStream() {
  /*<skip>*/
}
$h_Ljava_io_PrintStream.prototype = $c_Ljava_io_PrintStream.prototype;
$c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset = (function(_out, autoFlush, charset) {
  this.autoFlush$3 = autoFlush;
  this.charset$3 = charset;
  $c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream.call(this, _out);
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  return this
});
function $is_Ljava_io_PrintStream(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljava_io_PrintStream)))
}
function $as_Ljava_io_PrintStream(obj) {
  return (($is_Ljava_io_PrintStream(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.io.PrintStream"))
}
function $isArrayOf_Ljava_io_PrintStream(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljava_io_PrintStream)))
}
function $asArrayOf_Ljava_io_PrintStream(obj, depth) {
  return (($isArrayOf_Ljava_io_PrintStream(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.io.PrintStream;", depth))
}
/** @constructor */
function $c_Lsgl_GraphicsHelpersComponent$Animation$Loop$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype = new $h_O();
$c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype.constructor = $c_Lsgl_GraphicsHelpersComponent$Animation$Loop$;
/** @constructor */
function $h_Lsgl_GraphicsHelpersComponent$Animation$Loop$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype = $c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype;
$c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype.productPrefix__T = (function() {
  return "Loop"
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype.toString__T = (function() {
  return "Loop"
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype.init___Lsgl_GraphicsHelpersComponent$Animation$ = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype.hashCode__I = (function() {
  return 2374340
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsHelpersComponent$Animation$Loop$ = new $TypeData().initClass({
  Lsgl_GraphicsHelpersComponent$Animation$Loop$: 0
}, false, "sgl.GraphicsHelpersComponent$Animation$Loop$", {
  Lsgl_GraphicsHelpersComponent$Animation$Loop$: 1,
  O: 1,
  Lsgl_GraphicsHelpersComponent$Animation$PlayMode: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Loop$.prototype.$classData = $d_Lsgl_GraphicsHelpersComponent$Animation$Loop$;
/** @constructor */
function $c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype = new $h_O();
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype.constructor = $c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$;
/** @constructor */
function $h_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype = $c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype;
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype.productPrefix__T = (function() {
  return "LoopPingPong"
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype.toString__T = (function() {
  return "LoopPingPong"
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype.init___Lsgl_GraphicsHelpersComponent$Animation$ = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype.hashCode__I = (function() {
  return (-1946017938)
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$ = new $TypeData().initClass({
  Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$: 0
}, false, "sgl.GraphicsHelpersComponent$Animation$LoopPingPong$", {
  Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$: 1,
  O: 1,
  Lsgl_GraphicsHelpersComponent$Animation$PlayMode: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$.prototype.$classData = $d_Lsgl_GraphicsHelpersComponent$Animation$LoopPingPong$;
/** @constructor */
function $c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype = new $h_O();
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype.constructor = $c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$;
/** @constructor */
function $h_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype = $c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype;
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype.productPrefix__T = (function() {
  return "LoopReversed"
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype.toString__T = (function() {
  return "LoopReversed"
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype.init___Lsgl_GraphicsHelpersComponent$Animation$ = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype.hashCode__I = (function() {
  return (-1782209370)
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$ = new $TypeData().initClass({
  Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$: 0
}, false, "sgl.GraphicsHelpersComponent$Animation$LoopReversed$", {
  Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$: 1,
  O: 1,
  Lsgl_GraphicsHelpersComponent$Animation$PlayMode: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$.prototype.$classData = $d_Lsgl_GraphicsHelpersComponent$Animation$LoopReversed$;
/** @constructor */
function $c_Lsgl_GraphicsHelpersComponent$Animation$Normal$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype = new $h_O();
$c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype.constructor = $c_Lsgl_GraphicsHelpersComponent$Animation$Normal$;
/** @constructor */
function $h_Lsgl_GraphicsHelpersComponent$Animation$Normal$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype = $c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype;
$c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype.productPrefix__T = (function() {
  return "Normal"
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype.toString__T = (function() {
  return "Normal"
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype.init___Lsgl_GraphicsHelpersComponent$Animation$ = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype.hashCode__I = (function() {
  return (-1955878649)
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsHelpersComponent$Animation$Normal$ = new $TypeData().initClass({
  Lsgl_GraphicsHelpersComponent$Animation$Normal$: 0
}, false, "sgl.GraphicsHelpersComponent$Animation$Normal$", {
  Lsgl_GraphicsHelpersComponent$Animation$Normal$: 1,
  O: 1,
  Lsgl_GraphicsHelpersComponent$Animation$PlayMode: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Normal$.prototype.$classData = $d_Lsgl_GraphicsHelpersComponent$Animation$Normal$;
/** @constructor */
function $c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype = new $h_O();
$c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype.constructor = $c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$;
/** @constructor */
function $h_Lsgl_GraphicsHelpersComponent$Animation$Reversed$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype = $c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype;
$c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype.productPrefix__T = (function() {
  return "Reversed"
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype.toString__T = (function() {
  return "Reversed"
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype.init___Lsgl_GraphicsHelpersComponent$Animation$ = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype.hashCode__I = (function() {
  return (-199856670)
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsHelpersComponent$Animation$Reversed$ = new $TypeData().initClass({
  Lsgl_GraphicsHelpersComponent$Animation$Reversed$: 0
}, false, "sgl.GraphicsHelpersComponent$Animation$Reversed$", {
  Lsgl_GraphicsHelpersComponent$Animation$Reversed$: 1,
  O: 1,
  Lsgl_GraphicsHelpersComponent$Animation$PlayMode: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsHelpersComponent$Animation$Reversed$.prototype.$classData = $d_Lsgl_GraphicsHelpersComponent$Animation$Reversed$;
/** @constructor */
function $c_Lsgl_GraphicsProvider$Alignments$Center$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsProvider$Alignments$Center$.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$Alignments$Center$.prototype.constructor = $c_Lsgl_GraphicsProvider$Alignments$Center$;
/** @constructor */
function $h_Lsgl_GraphicsProvider$Alignments$Center$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$Alignments$Center$.prototype = $c_Lsgl_GraphicsProvider$Alignments$Center$.prototype;
$c_Lsgl_GraphicsProvider$Alignments$Center$.prototype.productPrefix__T = (function() {
  return "Center"
});
$c_Lsgl_GraphicsProvider$Alignments$Center$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsProvider$Alignments$Center$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsProvider$Alignments$Center$.prototype.toString__T = (function() {
  return "Center"
});
$c_Lsgl_GraphicsProvider$Alignments$Center$.prototype.init___Lsgl_GraphicsProvider$Alignments$ = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsProvider$Alignments$Center$.prototype.hashCode__I = (function() {
  return 2014820469
});
$c_Lsgl_GraphicsProvider$Alignments$Center$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsProvider$Alignments$Center$ = new $TypeData().initClass({
  Lsgl_GraphicsProvider$Alignments$Center$: 0
}, false, "sgl.GraphicsProvider$Alignments$Center$", {
  Lsgl_GraphicsProvider$Alignments$Center$: 1,
  O: 1,
  Lsgl_GraphicsProvider$Alignments$Alignment: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsProvider$Alignments$Center$.prototype.$classData = $d_Lsgl_GraphicsProvider$Alignments$Center$;
/** @constructor */
function $c_Lsgl_GraphicsProvider$Alignments$Left$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsProvider$Alignments$Left$.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$Alignments$Left$.prototype.constructor = $c_Lsgl_GraphicsProvider$Alignments$Left$;
/** @constructor */
function $h_Lsgl_GraphicsProvider$Alignments$Left$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$Alignments$Left$.prototype = $c_Lsgl_GraphicsProvider$Alignments$Left$.prototype;
$c_Lsgl_GraphicsProvider$Alignments$Left$.prototype.productPrefix__T = (function() {
  return "Left"
});
$c_Lsgl_GraphicsProvider$Alignments$Left$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsProvider$Alignments$Left$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsProvider$Alignments$Left$.prototype.toString__T = (function() {
  return "Left"
});
$c_Lsgl_GraphicsProvider$Alignments$Left$.prototype.init___Lsgl_GraphicsProvider$Alignments$ = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsProvider$Alignments$Left$.prototype.hashCode__I = (function() {
  return 2364455
});
$c_Lsgl_GraphicsProvider$Alignments$Left$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsProvider$Alignments$Left$ = new $TypeData().initClass({
  Lsgl_GraphicsProvider$Alignments$Left$: 0
}, false, "sgl.GraphicsProvider$Alignments$Left$", {
  Lsgl_GraphicsProvider$Alignments$Left$: 1,
  O: 1,
  Lsgl_GraphicsProvider$Alignments$Alignment: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsProvider$Alignments$Left$.prototype.$classData = $d_Lsgl_GraphicsProvider$Alignments$Left$;
/** @constructor */
function $c_Lsgl_GraphicsProvider$Alignments$Right$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsProvider$Alignments$Right$.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$Alignments$Right$.prototype.constructor = $c_Lsgl_GraphicsProvider$Alignments$Right$;
/** @constructor */
function $h_Lsgl_GraphicsProvider$Alignments$Right$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$Alignments$Right$.prototype = $c_Lsgl_GraphicsProvider$Alignments$Right$.prototype;
$c_Lsgl_GraphicsProvider$Alignments$Right$.prototype.productPrefix__T = (function() {
  return "Right"
});
$c_Lsgl_GraphicsProvider$Alignments$Right$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsProvider$Alignments$Right$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsProvider$Alignments$Right$.prototype.toString__T = (function() {
  return "Right"
});
$c_Lsgl_GraphicsProvider$Alignments$Right$.prototype.init___Lsgl_GraphicsProvider$Alignments$ = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsProvider$Alignments$Right$.prototype.hashCode__I = (function() {
  return 78959100
});
$c_Lsgl_GraphicsProvider$Alignments$Right$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsProvider$Alignments$Right$ = new $TypeData().initClass({
  Lsgl_GraphicsProvider$Alignments$Right$: 0
}, false, "sgl.GraphicsProvider$Alignments$Right$", {
  Lsgl_GraphicsProvider$Alignments$Right$: 1,
  O: 1,
  Lsgl_GraphicsProvider$Alignments$Alignment: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsProvider$Alignments$Right$.prototype.$classData = $d_Lsgl_GraphicsProvider$Alignments$Right$;
/** @constructor */
function $c_Lsgl_GraphicsProvider$FontCompanion$Bold$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype.constructor = $c_Lsgl_GraphicsProvider$FontCompanion$Bold$;
/** @constructor */
function $h_Lsgl_GraphicsProvider$FontCompanion$Bold$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype = $c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype;
$c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype.productPrefix__T = (function() {
  return "Bold"
});
$c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype.init___Lsgl_GraphicsProvider$FontCompanion = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype.toString__T = (function() {
  return "Bold"
});
$c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype.hashCode__I = (function() {
  return 2076325
});
$c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsProvider$FontCompanion$Bold$ = new $TypeData().initClass({
  Lsgl_GraphicsProvider$FontCompanion$Bold$: 0
}, false, "sgl.GraphicsProvider$FontCompanion$Bold$", {
  Lsgl_GraphicsProvider$FontCompanion$Bold$: 1,
  O: 1,
  Lsgl_GraphicsProvider$FontCompanion$Style: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsProvider$FontCompanion$Bold$.prototype.$classData = $d_Lsgl_GraphicsProvider$FontCompanion$Bold$;
/** @constructor */
function $c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype.constructor = $c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$;
/** @constructor */
function $h_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype = $c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype;
$c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype.productPrefix__T = (function() {
  return "BoldItalic"
});
$c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype.init___Lsgl_GraphicsProvider$FontCompanion = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype.toString__T = (function() {
  return "BoldItalic"
});
$c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype.hashCode__I = (function() {
  return 1152091445
});
$c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$ = new $TypeData().initClass({
  Lsgl_GraphicsProvider$FontCompanion$BoldItalic$: 0
}, false, "sgl.GraphicsProvider$FontCompanion$BoldItalic$", {
  Lsgl_GraphicsProvider$FontCompanion$BoldItalic$: 1,
  O: 1,
  Lsgl_GraphicsProvider$FontCompanion$Style: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$.prototype.$classData = $d_Lsgl_GraphicsProvider$FontCompanion$BoldItalic$;
/** @constructor */
function $c_Lsgl_GraphicsProvider$FontCompanion$Italic$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype.constructor = $c_Lsgl_GraphicsProvider$FontCompanion$Italic$;
/** @constructor */
function $h_Lsgl_GraphicsProvider$FontCompanion$Italic$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype = $c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype;
$c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype.productPrefix__T = (function() {
  return "Italic"
});
$c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype.init___Lsgl_GraphicsProvider$FontCompanion = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype.toString__T = (function() {
  return "Italic"
});
$c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype.hashCode__I = (function() {
  return (-2094913968)
});
$c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsProvider$FontCompanion$Italic$ = new $TypeData().initClass({
  Lsgl_GraphicsProvider$FontCompanion$Italic$: 0
}, false, "sgl.GraphicsProvider$FontCompanion$Italic$", {
  Lsgl_GraphicsProvider$FontCompanion$Italic$: 1,
  O: 1,
  Lsgl_GraphicsProvider$FontCompanion$Style: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsProvider$FontCompanion$Italic$.prototype.$classData = $d_Lsgl_GraphicsProvider$FontCompanion$Italic$;
/** @constructor */
function $c_Lsgl_GraphicsProvider$FontCompanion$Normal$() {
  $c_O.call(this)
}
$c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype = new $h_O();
$c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype.constructor = $c_Lsgl_GraphicsProvider$FontCompanion$Normal$;
/** @constructor */
function $h_Lsgl_GraphicsProvider$FontCompanion$Normal$() {
  /*<skip>*/
}
$h_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype = $c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype;
$c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype.productPrefix__T = (function() {
  return "Normal"
});
$c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype.init___Lsgl_GraphicsProvider$FontCompanion = (function($$outer) {
  return this
});
$c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype.toString__T = (function() {
  return "Normal"
});
$c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype.hashCode__I = (function() {
  return (-1955878649)
});
$c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_GraphicsProvider$FontCompanion$Normal$ = new $TypeData().initClass({
  Lsgl_GraphicsProvider$FontCompanion$Normal$: 0
}, false, "sgl.GraphicsProvider$FontCompanion$Normal$", {
  Lsgl_GraphicsProvider$FontCompanion$Normal$: 1,
  O: 1,
  Lsgl_GraphicsProvider$FontCompanion$Style: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_GraphicsProvider$FontCompanion$Normal$.prototype.$classData = $d_Lsgl_GraphicsProvider$FontCompanion$Normal$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$KeyDownEvent() {
  $c_O.call(this);
  this.key$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype.constructor = $c_Lsgl_InputProvider$Input$KeyDownEvent;
/** @constructor */
function $h_Lsgl_InputProvider$Input$KeyDownEvent() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$KeyDownEvent.prototype = $c_Lsgl_InputProvider$Input$KeyDownEvent.prototype;
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype.productPrefix__T = (function() {
  return "KeyDownEvent"
});
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype.productArity__I = (function() {
  return 1
});
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (($is_Lsgl_InputProvider$Input$KeyDownEvent(x$1) && ($as_Lsgl_InputProvider$Input$KeyDownEvent(x$1).$$outer$1 === this.$$outer$1))) {
    var KeyDownEvent$1 = $as_Lsgl_InputProvider$Input$KeyDownEvent(x$1);
    var x = this.key$1;
    var x$2 = KeyDownEvent$1.key$1;
    return (x === x$2)
  } else {
    return false
  }
});
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.key$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype.init___Lsgl_InputProvider$Input$__Lsgl_InputProvider$Input$Keys$Key = (function($$outer, key) {
  this.key$1 = key;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
function $is_Lsgl_InputProvider$Input$KeyDownEvent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_InputProvider$Input$KeyDownEvent)))
}
function $as_Lsgl_InputProvider$Input$KeyDownEvent(obj) {
  return (($is_Lsgl_InputProvider$Input$KeyDownEvent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.InputProvider$Input$KeyDownEvent"))
}
function $isArrayOf_Lsgl_InputProvider$Input$KeyDownEvent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_InputProvider$Input$KeyDownEvent)))
}
function $asArrayOf_Lsgl_InputProvider$Input$KeyDownEvent(obj, depth) {
  return (($isArrayOf_Lsgl_InputProvider$Input$KeyDownEvent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.InputProvider$Input$KeyDownEvent;", depth))
}
var $d_Lsgl_InputProvider$Input$KeyDownEvent = new $TypeData().initClass({
  Lsgl_InputProvider$Input$KeyDownEvent: 0
}, false, "sgl.InputProvider$Input$KeyDownEvent", {
  Lsgl_InputProvider$Input$KeyDownEvent: 1,
  O: 1,
  Lsgl_InputProvider$Input$InputEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$KeyDownEvent.prototype.$classData = $d_Lsgl_InputProvider$Input$KeyDownEvent;
/** @constructor */
function $c_Lsgl_InputProvider$Input$KeyUpEvent() {
  $c_O.call(this);
  this.key$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype.constructor = $c_Lsgl_InputProvider$Input$KeyUpEvent;
/** @constructor */
function $h_Lsgl_InputProvider$Input$KeyUpEvent() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$KeyUpEvent.prototype = $c_Lsgl_InputProvider$Input$KeyUpEvent.prototype;
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype.productPrefix__T = (function() {
  return "KeyUpEvent"
});
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype.productArity__I = (function() {
  return 1
});
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (($is_Lsgl_InputProvider$Input$KeyUpEvent(x$1) && ($as_Lsgl_InputProvider$Input$KeyUpEvent(x$1).$$outer$1 === this.$$outer$1))) {
    var KeyUpEvent$1 = $as_Lsgl_InputProvider$Input$KeyUpEvent(x$1);
    var x = this.key$1;
    var x$2 = KeyUpEvent$1.key$1;
    return (x === x$2)
  } else {
    return false
  }
});
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.key$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype.init___Lsgl_InputProvider$Input$__Lsgl_InputProvider$Input$Keys$Key = (function($$outer, key) {
  this.key$1 = key;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
function $is_Lsgl_InputProvider$Input$KeyUpEvent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_InputProvider$Input$KeyUpEvent)))
}
function $as_Lsgl_InputProvider$Input$KeyUpEvent(obj) {
  return (($is_Lsgl_InputProvider$Input$KeyUpEvent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.InputProvider$Input$KeyUpEvent"))
}
function $isArrayOf_Lsgl_InputProvider$Input$KeyUpEvent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_InputProvider$Input$KeyUpEvent)))
}
function $asArrayOf_Lsgl_InputProvider$Input$KeyUpEvent(obj, depth) {
  return (($isArrayOf_Lsgl_InputProvider$Input$KeyUpEvent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.InputProvider$Input$KeyUpEvent;", depth))
}
var $d_Lsgl_InputProvider$Input$KeyUpEvent = new $TypeData().initClass({
  Lsgl_InputProvider$Input$KeyUpEvent: 0
}, false, "sgl.InputProvider$Input$KeyUpEvent", {
  Lsgl_InputProvider$Input$KeyUpEvent: 1,
  O: 1,
  Lsgl_InputProvider$Input$InputEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$KeyUpEvent.prototype.$classData = $d_Lsgl_InputProvider$Input$KeyUpEvent;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$A$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$A$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$A$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$A$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$A$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$A$.prototype = $c_Lsgl_InputProvider$Input$Keys$A$.prototype;
$c_Lsgl_InputProvider$Input$Keys$A$.prototype.productPrefix__T = (function() {
  return "A"
});
$c_Lsgl_InputProvider$Input$Keys$A$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$A$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$A$.prototype.toString__T = (function() {
  return "A"
});
$c_Lsgl_InputProvider$Input$Keys$A$.prototype.hashCode__I = (function() {
  return 65
});
$c_Lsgl_InputProvider$Input$Keys$A$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$A$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$A$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$A$: 0
}, false, "sgl.InputProvider$Input$Keys$A$", {
  Lsgl_InputProvider$Input$Keys$A$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$A$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$A$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$B$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$B$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$B$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$B$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$B$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$B$.prototype = $c_Lsgl_InputProvider$Input$Keys$B$.prototype;
$c_Lsgl_InputProvider$Input$Keys$B$.prototype.productPrefix__T = (function() {
  return "B"
});
$c_Lsgl_InputProvider$Input$Keys$B$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$B$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$B$.prototype.toString__T = (function() {
  return "B"
});
$c_Lsgl_InputProvider$Input$Keys$B$.prototype.hashCode__I = (function() {
  return 66
});
$c_Lsgl_InputProvider$Input$Keys$B$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$B$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$B$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$B$: 0
}, false, "sgl.InputProvider$Input$Keys$B$", {
  Lsgl_InputProvider$Input$Keys$B$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$B$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$B$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$C$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$C$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$C$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$C$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$C$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$C$.prototype = $c_Lsgl_InputProvider$Input$Keys$C$.prototype;
$c_Lsgl_InputProvider$Input$Keys$C$.prototype.productPrefix__T = (function() {
  return "C"
});
$c_Lsgl_InputProvider$Input$Keys$C$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$C$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$C$.prototype.toString__T = (function() {
  return "C"
});
$c_Lsgl_InputProvider$Input$Keys$C$.prototype.hashCode__I = (function() {
  return 67
});
$c_Lsgl_InputProvider$Input$Keys$C$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$C$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$C$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$C$: 0
}, false, "sgl.InputProvider$Input$Keys$C$", {
  Lsgl_InputProvider$Input$Keys$C$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$C$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$C$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$D$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$D$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$D$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$D$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$D$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$D$.prototype = $c_Lsgl_InputProvider$Input$Keys$D$.prototype;
$c_Lsgl_InputProvider$Input$Keys$D$.prototype.productPrefix__T = (function() {
  return "D"
});
$c_Lsgl_InputProvider$Input$Keys$D$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$D$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$D$.prototype.toString__T = (function() {
  return "D"
});
$c_Lsgl_InputProvider$Input$Keys$D$.prototype.hashCode__I = (function() {
  return 68
});
$c_Lsgl_InputProvider$Input$Keys$D$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$D$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$D$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$D$: 0
}, false, "sgl.InputProvider$Input$Keys$D$", {
  Lsgl_InputProvider$Input$Keys$D$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$D$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$D$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Down$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$Down$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Down$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Down$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Down$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Down$.prototype = $c_Lsgl_InputProvider$Input$Keys$Down$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Down$.prototype.productPrefix__T = (function() {
  return "Down"
});
$c_Lsgl_InputProvider$Input$Keys$Down$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Down$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Down$.prototype.toString__T = (function() {
  return "Down"
});
$c_Lsgl_InputProvider$Input$Keys$Down$.prototype.hashCode__I = (function() {
  return 2136258
});
$c_Lsgl_InputProvider$Input$Keys$Down$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Down$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Down$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Down$: 0
}, false, "sgl.InputProvider$Input$Keys$Down$", {
  Lsgl_InputProvider$Input$Keys$Down$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Down$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Down$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$E$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$E$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$E$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$E$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$E$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$E$.prototype = $c_Lsgl_InputProvider$Input$Keys$E$.prototype;
$c_Lsgl_InputProvider$Input$Keys$E$.prototype.productPrefix__T = (function() {
  return "E"
});
$c_Lsgl_InputProvider$Input$Keys$E$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$E$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$E$.prototype.toString__T = (function() {
  return "E"
});
$c_Lsgl_InputProvider$Input$Keys$E$.prototype.hashCode__I = (function() {
  return 69
});
$c_Lsgl_InputProvider$Input$Keys$E$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$E$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$E$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$E$: 0
}, false, "sgl.InputProvider$Input$Keys$E$", {
  Lsgl_InputProvider$Input$Keys$E$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$E$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$E$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$F$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$F$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$F$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$F$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$F$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$F$.prototype = $c_Lsgl_InputProvider$Input$Keys$F$.prototype;
$c_Lsgl_InputProvider$Input$Keys$F$.prototype.productPrefix__T = (function() {
  return "F"
});
$c_Lsgl_InputProvider$Input$Keys$F$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$F$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$F$.prototype.toString__T = (function() {
  return "F"
});
$c_Lsgl_InputProvider$Input$Keys$F$.prototype.hashCode__I = (function() {
  return 70
});
$c_Lsgl_InputProvider$Input$Keys$F$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$F$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$F$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$F$: 0
}, false, "sgl.InputProvider$Input$Keys$F$", {
  Lsgl_InputProvider$Input$Keys$F$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$F$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$F$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$G$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$G$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$G$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$G$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$G$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$G$.prototype = $c_Lsgl_InputProvider$Input$Keys$G$.prototype;
$c_Lsgl_InputProvider$Input$Keys$G$.prototype.productPrefix__T = (function() {
  return "G"
});
$c_Lsgl_InputProvider$Input$Keys$G$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$G$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$G$.prototype.toString__T = (function() {
  return "G"
});
$c_Lsgl_InputProvider$Input$Keys$G$.prototype.hashCode__I = (function() {
  return 71
});
$c_Lsgl_InputProvider$Input$Keys$G$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$G$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$G$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$G$: 0
}, false, "sgl.InputProvider$Input$Keys$G$", {
  Lsgl_InputProvider$Input$Keys$G$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$G$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$G$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$H$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$H$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$H$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$H$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$H$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$H$.prototype = $c_Lsgl_InputProvider$Input$Keys$H$.prototype;
$c_Lsgl_InputProvider$Input$Keys$H$.prototype.productPrefix__T = (function() {
  return "H"
});
$c_Lsgl_InputProvider$Input$Keys$H$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$H$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$H$.prototype.toString__T = (function() {
  return "H"
});
$c_Lsgl_InputProvider$Input$Keys$H$.prototype.hashCode__I = (function() {
  return 72
});
$c_Lsgl_InputProvider$Input$Keys$H$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$H$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$H$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$H$: 0
}, false, "sgl.InputProvider$Input$Keys$H$", {
  Lsgl_InputProvider$Input$Keys$H$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$H$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$H$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$I$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$I$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$I$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$I$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$I$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$I$.prototype = $c_Lsgl_InputProvider$Input$Keys$I$.prototype;
$c_Lsgl_InputProvider$Input$Keys$I$.prototype.productPrefix__T = (function() {
  return "I"
});
$c_Lsgl_InputProvider$Input$Keys$I$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$I$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$I$.prototype.toString__T = (function() {
  return "I"
});
$c_Lsgl_InputProvider$Input$Keys$I$.prototype.hashCode__I = (function() {
  return 73
});
$c_Lsgl_InputProvider$Input$Keys$I$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$I$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$I$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$I$: 0
}, false, "sgl.InputProvider$Input$Keys$I$", {
  Lsgl_InputProvider$Input$Keys$I$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$I$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$I$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$J$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$J$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$J$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$J$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$J$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$J$.prototype = $c_Lsgl_InputProvider$Input$Keys$J$.prototype;
$c_Lsgl_InputProvider$Input$Keys$J$.prototype.productPrefix__T = (function() {
  return "J"
});
$c_Lsgl_InputProvider$Input$Keys$J$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$J$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$J$.prototype.toString__T = (function() {
  return "J"
});
$c_Lsgl_InputProvider$Input$Keys$J$.prototype.hashCode__I = (function() {
  return 74
});
$c_Lsgl_InputProvider$Input$Keys$J$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$J$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$J$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$J$: 0
}, false, "sgl.InputProvider$Input$Keys$J$", {
  Lsgl_InputProvider$Input$Keys$J$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$J$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$J$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$K$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$K$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$K$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$K$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$K$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$K$.prototype = $c_Lsgl_InputProvider$Input$Keys$K$.prototype;
$c_Lsgl_InputProvider$Input$Keys$K$.prototype.productPrefix__T = (function() {
  return "K"
});
$c_Lsgl_InputProvider$Input$Keys$K$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$K$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$K$.prototype.toString__T = (function() {
  return "K"
});
$c_Lsgl_InputProvider$Input$Keys$K$.prototype.hashCode__I = (function() {
  return 75
});
$c_Lsgl_InputProvider$Input$Keys$K$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$K$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$K$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$K$: 0
}, false, "sgl.InputProvider$Input$Keys$K$", {
  Lsgl_InputProvider$Input$Keys$K$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$K$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$K$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$L$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$L$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$L$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$L$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$L$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$L$.prototype = $c_Lsgl_InputProvider$Input$Keys$L$.prototype;
$c_Lsgl_InputProvider$Input$Keys$L$.prototype.productPrefix__T = (function() {
  return "L"
});
$c_Lsgl_InputProvider$Input$Keys$L$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$L$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$L$.prototype.toString__T = (function() {
  return "L"
});
$c_Lsgl_InputProvider$Input$Keys$L$.prototype.hashCode__I = (function() {
  return 76
});
$c_Lsgl_InputProvider$Input$Keys$L$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$L$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$L$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$L$: 0
}, false, "sgl.InputProvider$Input$Keys$L$", {
  Lsgl_InputProvider$Input$Keys$L$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$L$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$L$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Left$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$Left$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Left$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Left$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Left$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Left$.prototype = $c_Lsgl_InputProvider$Input$Keys$Left$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Left$.prototype.productPrefix__T = (function() {
  return "Left"
});
$c_Lsgl_InputProvider$Input$Keys$Left$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Left$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Left$.prototype.toString__T = (function() {
  return "Left"
});
$c_Lsgl_InputProvider$Input$Keys$Left$.prototype.hashCode__I = (function() {
  return 2364455
});
$c_Lsgl_InputProvider$Input$Keys$Left$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Left$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Left$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Left$: 0
}, false, "sgl.InputProvider$Input$Keys$Left$", {
  Lsgl_InputProvider$Input$Keys$Left$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Left$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Left$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$M$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$M$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$M$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$M$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$M$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$M$.prototype = $c_Lsgl_InputProvider$Input$Keys$M$.prototype;
$c_Lsgl_InputProvider$Input$Keys$M$.prototype.productPrefix__T = (function() {
  return "M"
});
$c_Lsgl_InputProvider$Input$Keys$M$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$M$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$M$.prototype.toString__T = (function() {
  return "M"
});
$c_Lsgl_InputProvider$Input$Keys$M$.prototype.hashCode__I = (function() {
  return 77
});
$c_Lsgl_InputProvider$Input$Keys$M$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$M$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$M$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$M$: 0
}, false, "sgl.InputProvider$Input$Keys$M$", {
  Lsgl_InputProvider$Input$Keys$M$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$M$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$M$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$N$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$N$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$N$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$N$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$N$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$N$.prototype = $c_Lsgl_InputProvider$Input$Keys$N$.prototype;
$c_Lsgl_InputProvider$Input$Keys$N$.prototype.productPrefix__T = (function() {
  return "N"
});
$c_Lsgl_InputProvider$Input$Keys$N$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$N$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$N$.prototype.toString__T = (function() {
  return "N"
});
$c_Lsgl_InputProvider$Input$Keys$N$.prototype.hashCode__I = (function() {
  return 78
});
$c_Lsgl_InputProvider$Input$Keys$N$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$N$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$N$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$N$: 0
}, false, "sgl.InputProvider$Input$Keys$N$", {
  Lsgl_InputProvider$Input$Keys$N$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$N$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$N$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$O$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$O$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$O$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$O$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$O$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$O$.prototype = $c_Lsgl_InputProvider$Input$Keys$O$.prototype;
$c_Lsgl_InputProvider$Input$Keys$O$.prototype.productPrefix__T = (function() {
  return "O"
});
$c_Lsgl_InputProvider$Input$Keys$O$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$O$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$O$.prototype.toString__T = (function() {
  return "O"
});
$c_Lsgl_InputProvider$Input$Keys$O$.prototype.hashCode__I = (function() {
  return 79
});
$c_Lsgl_InputProvider$Input$Keys$O$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$O$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$O$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$O$: 0
}, false, "sgl.InputProvider$Input$Keys$O$", {
  Lsgl_InputProvider$Input$Keys$O$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$O$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$O$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$P$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$P$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$P$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$P$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$P$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$P$.prototype = $c_Lsgl_InputProvider$Input$Keys$P$.prototype;
$c_Lsgl_InputProvider$Input$Keys$P$.prototype.productPrefix__T = (function() {
  return "P"
});
$c_Lsgl_InputProvider$Input$Keys$P$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$P$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$P$.prototype.toString__T = (function() {
  return "P"
});
$c_Lsgl_InputProvider$Input$Keys$P$.prototype.hashCode__I = (function() {
  return 80
});
$c_Lsgl_InputProvider$Input$Keys$P$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$P$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$P$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$P$: 0
}, false, "sgl.InputProvider$Input$Keys$P$", {
  Lsgl_InputProvider$Input$Keys$P$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$P$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$P$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Q$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$Q$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Q$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Q$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Q$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Q$.prototype = $c_Lsgl_InputProvider$Input$Keys$Q$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Q$.prototype.productPrefix__T = (function() {
  return "Q"
});
$c_Lsgl_InputProvider$Input$Keys$Q$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Q$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Q$.prototype.toString__T = (function() {
  return "Q"
});
$c_Lsgl_InputProvider$Input$Keys$Q$.prototype.hashCode__I = (function() {
  return 81
});
$c_Lsgl_InputProvider$Input$Keys$Q$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Q$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Q$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Q$: 0
}, false, "sgl.InputProvider$Input$Keys$Q$", {
  Lsgl_InputProvider$Input$Keys$Q$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Q$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Q$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$R$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$R$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$R$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$R$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$R$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$R$.prototype = $c_Lsgl_InputProvider$Input$Keys$R$.prototype;
$c_Lsgl_InputProvider$Input$Keys$R$.prototype.productPrefix__T = (function() {
  return "R"
});
$c_Lsgl_InputProvider$Input$Keys$R$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$R$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$R$.prototype.toString__T = (function() {
  return "R"
});
$c_Lsgl_InputProvider$Input$Keys$R$.prototype.hashCode__I = (function() {
  return 82
});
$c_Lsgl_InputProvider$Input$Keys$R$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$R$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$R$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$R$: 0
}, false, "sgl.InputProvider$Input$Keys$R$", {
  Lsgl_InputProvider$Input$Keys$R$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$R$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$R$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Right$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$Right$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Right$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Right$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Right$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Right$.prototype = $c_Lsgl_InputProvider$Input$Keys$Right$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Right$.prototype.productPrefix__T = (function() {
  return "Right"
});
$c_Lsgl_InputProvider$Input$Keys$Right$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Right$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Right$.prototype.toString__T = (function() {
  return "Right"
});
$c_Lsgl_InputProvider$Input$Keys$Right$.prototype.hashCode__I = (function() {
  return 78959100
});
$c_Lsgl_InputProvider$Input$Keys$Right$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Right$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Right$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Right$: 0
}, false, "sgl.InputProvider$Input$Keys$Right$", {
  Lsgl_InputProvider$Input$Keys$Right$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Right$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Right$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$S$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$S$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$S$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$S$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$S$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$S$.prototype = $c_Lsgl_InputProvider$Input$Keys$S$.prototype;
$c_Lsgl_InputProvider$Input$Keys$S$.prototype.productPrefix__T = (function() {
  return "S"
});
$c_Lsgl_InputProvider$Input$Keys$S$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$S$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$S$.prototype.toString__T = (function() {
  return "S"
});
$c_Lsgl_InputProvider$Input$Keys$S$.prototype.hashCode__I = (function() {
  return 83
});
$c_Lsgl_InputProvider$Input$Keys$S$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$S$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$S$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$S$: 0
}, false, "sgl.InputProvider$Input$Keys$S$", {
  Lsgl_InputProvider$Input$Keys$S$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$S$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$S$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Space$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$Space$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Space$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Space$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Space$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Space$.prototype = $c_Lsgl_InputProvider$Input$Keys$Space$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Space$.prototype.productPrefix__T = (function() {
  return "Space"
});
$c_Lsgl_InputProvider$Input$Keys$Space$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Space$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Space$.prototype.toString__T = (function() {
  return "Space"
});
$c_Lsgl_InputProvider$Input$Keys$Space$.prototype.hashCode__I = (function() {
  return 80085222
});
$c_Lsgl_InputProvider$Input$Keys$Space$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Space$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Space$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Space$: 0
}, false, "sgl.InputProvider$Input$Keys$Space$", {
  Lsgl_InputProvider$Input$Keys$Space$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Space$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Space$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$T$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$T$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$T$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$T$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$T$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$T$.prototype = $c_Lsgl_InputProvider$Input$Keys$T$.prototype;
$c_Lsgl_InputProvider$Input$Keys$T$.prototype.productPrefix__T = (function() {
  return "T"
});
$c_Lsgl_InputProvider$Input$Keys$T$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$T$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$T$.prototype.toString__T = (function() {
  return "T"
});
$c_Lsgl_InputProvider$Input$Keys$T$.prototype.hashCode__I = (function() {
  return 84
});
$c_Lsgl_InputProvider$Input$Keys$T$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$T$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$T$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$T$: 0
}, false, "sgl.InputProvider$Input$Keys$T$", {
  Lsgl_InputProvider$Input$Keys$T$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$T$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$T$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$U$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$U$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$U$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$U$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$U$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$U$.prototype = $c_Lsgl_InputProvider$Input$Keys$U$.prototype;
$c_Lsgl_InputProvider$Input$Keys$U$.prototype.productPrefix__T = (function() {
  return "U"
});
$c_Lsgl_InputProvider$Input$Keys$U$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$U$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$U$.prototype.toString__T = (function() {
  return "U"
});
$c_Lsgl_InputProvider$Input$Keys$U$.prototype.hashCode__I = (function() {
  return 85
});
$c_Lsgl_InputProvider$Input$Keys$U$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$U$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$U$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$U$: 0
}, false, "sgl.InputProvider$Input$Keys$U$", {
  Lsgl_InputProvider$Input$Keys$U$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$U$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$U$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Up$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$Up$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Up$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Up$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Up$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Up$.prototype = $c_Lsgl_InputProvider$Input$Keys$Up$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Up$.prototype.productPrefix__T = (function() {
  return "Up"
});
$c_Lsgl_InputProvider$Input$Keys$Up$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Up$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Up$.prototype.toString__T = (function() {
  return "Up"
});
$c_Lsgl_InputProvider$Input$Keys$Up$.prototype.hashCode__I = (function() {
  return 2747
});
$c_Lsgl_InputProvider$Input$Keys$Up$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Up$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Up$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Up$: 0
}, false, "sgl.InputProvider$Input$Keys$Up$", {
  Lsgl_InputProvider$Input$Keys$Up$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Up$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Up$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$V$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$V$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$V$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$V$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$V$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$V$.prototype = $c_Lsgl_InputProvider$Input$Keys$V$.prototype;
$c_Lsgl_InputProvider$Input$Keys$V$.prototype.productPrefix__T = (function() {
  return "V"
});
$c_Lsgl_InputProvider$Input$Keys$V$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$V$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$V$.prototype.toString__T = (function() {
  return "V"
});
$c_Lsgl_InputProvider$Input$Keys$V$.prototype.hashCode__I = (function() {
  return 86
});
$c_Lsgl_InputProvider$Input$Keys$V$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$V$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$V$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$V$: 0
}, false, "sgl.InputProvider$Input$Keys$V$", {
  Lsgl_InputProvider$Input$Keys$V$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$V$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$V$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$W$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$W$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$W$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$W$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$W$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$W$.prototype = $c_Lsgl_InputProvider$Input$Keys$W$.prototype;
$c_Lsgl_InputProvider$Input$Keys$W$.prototype.productPrefix__T = (function() {
  return "W"
});
$c_Lsgl_InputProvider$Input$Keys$W$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$W$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$W$.prototype.toString__T = (function() {
  return "W"
});
$c_Lsgl_InputProvider$Input$Keys$W$.prototype.hashCode__I = (function() {
  return 87
});
$c_Lsgl_InputProvider$Input$Keys$W$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$W$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$W$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$W$: 0
}, false, "sgl.InputProvider$Input$Keys$W$", {
  Lsgl_InputProvider$Input$Keys$W$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$W$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$W$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$X$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$X$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$X$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$X$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$X$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$X$.prototype = $c_Lsgl_InputProvider$Input$Keys$X$.prototype;
$c_Lsgl_InputProvider$Input$Keys$X$.prototype.productPrefix__T = (function() {
  return "X"
});
$c_Lsgl_InputProvider$Input$Keys$X$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$X$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$X$.prototype.toString__T = (function() {
  return "X"
});
$c_Lsgl_InputProvider$Input$Keys$X$.prototype.hashCode__I = (function() {
  return 88
});
$c_Lsgl_InputProvider$Input$Keys$X$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$X$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$X$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$X$: 0
}, false, "sgl.InputProvider$Input$Keys$X$", {
  Lsgl_InputProvider$Input$Keys$X$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$X$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$X$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Y$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$Y$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Y$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Y$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Y$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Y$.prototype = $c_Lsgl_InputProvider$Input$Keys$Y$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Y$.prototype.productPrefix__T = (function() {
  return "Y"
});
$c_Lsgl_InputProvider$Input$Keys$Y$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Y$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Y$.prototype.toString__T = (function() {
  return "Y"
});
$c_Lsgl_InputProvider$Input$Keys$Y$.prototype.hashCode__I = (function() {
  return 89
});
$c_Lsgl_InputProvider$Input$Keys$Y$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Y$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Y$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Y$: 0
}, false, "sgl.InputProvider$Input$Keys$Y$", {
  Lsgl_InputProvider$Input$Keys$Y$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Y$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Y$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Z$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$Keys$Z$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Z$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Z$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Z$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Z$.prototype = $c_Lsgl_InputProvider$Input$Keys$Z$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Z$.prototype.productPrefix__T = (function() {
  return "Z"
});
$c_Lsgl_InputProvider$Input$Keys$Z$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Z$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Z$.prototype.toString__T = (function() {
  return "Z"
});
$c_Lsgl_InputProvider$Input$Keys$Z$.prototype.hashCode__I = (function() {
  return 90
});
$c_Lsgl_InputProvider$Input$Keys$Z$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Z$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Z$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Z$: 0
}, false, "sgl.InputProvider$Input$Keys$Z$", {
  Lsgl_InputProvider$Input$Keys$Z$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Z$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Z$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$MouseButtons$Left$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype.constructor = $c_Lsgl_InputProvider$Input$MouseButtons$Left$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$MouseButtons$Left$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype = $c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype;
$c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype.productPrefix__T = (function() {
  return "Left"
});
$c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype.init___Lsgl_InputProvider$Input$MouseButtons$ = (function($$outer) {
  return this
});
$c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype.toString__T = (function() {
  return "Left"
});
$c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype.hashCode__I = (function() {
  return 2364455
});
$c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_InputProvider$Input$MouseButtons$Left$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$MouseButtons$Left$: 0
}, false, "sgl.InputProvider$Input$MouseButtons$Left$", {
  Lsgl_InputProvider$Input$MouseButtons$Left$: 1,
  O: 1,
  Lsgl_InputProvider$Input$MouseButtons$MouseButton: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$MouseButtons$Left$.prototype.$classData = $d_Lsgl_InputProvider$Input$MouseButtons$Left$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$MouseButtons$Middle$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype.constructor = $c_Lsgl_InputProvider$Input$MouseButtons$Middle$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$MouseButtons$Middle$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype = $c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype;
$c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype.productPrefix__T = (function() {
  return "Middle"
});
$c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype.init___Lsgl_InputProvider$Input$MouseButtons$ = (function($$outer) {
  return this
});
$c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype.toString__T = (function() {
  return "Middle"
});
$c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype.hashCode__I = (function() {
  return (-1990474315)
});
$c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_InputProvider$Input$MouseButtons$Middle$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$MouseButtons$Middle$: 0
}, false, "sgl.InputProvider$Input$MouseButtons$Middle$", {
  Lsgl_InputProvider$Input$MouseButtons$Middle$: 1,
  O: 1,
  Lsgl_InputProvider$Input$MouseButtons$MouseButton: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$MouseButtons$Middle$.prototype.$classData = $d_Lsgl_InputProvider$Input$MouseButtons$Middle$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$MouseButtons$Right$() {
  $c_O.call(this)
}
$c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype.constructor = $c_Lsgl_InputProvider$Input$MouseButtons$Right$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$MouseButtons$Right$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype = $c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype;
$c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype.productPrefix__T = (function() {
  return "Right"
});
$c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype.init___Lsgl_InputProvider$Input$MouseButtons$ = (function($$outer) {
  return this
});
$c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype.toString__T = (function() {
  return "Right"
});
$c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype.hashCode__I = (function() {
  return 78959100
});
$c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Lsgl_InputProvider$Input$MouseButtons$Right$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$MouseButtons$Right$: 0
}, false, "sgl.InputProvider$Input$MouseButtons$Right$", {
  Lsgl_InputProvider$Input$MouseButtons$Right$: 1,
  O: 1,
  Lsgl_InputProvider$Input$MouseButtons$MouseButton: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$MouseButtons$Right$.prototype.$classData = $d_Lsgl_InputProvider$Input$MouseButtons$Right$;
/** @constructor */
function $c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap() {
  $c_Lsgl_GraphicsProvider$AbstractBitmap.call(this);
  this.image$2 = null
}
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype = new $h_Lsgl_GraphicsProvider$AbstractBitmap();
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype.constructor = $c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap;
/** @constructor */
function $h_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap() {
  /*<skip>*/
}
$h_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype = $c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype;
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype.productPrefix__T = (function() {
  return "Html5Bitmap"
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype.productArity__I = (function() {
  return 1
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else {
    if ($is_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(x$1)) {
      var this$1 = $as_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(x$1);
      var jsx$1 = ($as_Lsgl_html5_Html5GraphicsProvider(this$1.$$outer$1) === $as_Lsgl_html5_Html5GraphicsProvider(this.$$outer$1))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var Html5Bitmap$1 = $as_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(x$1);
      return $m_sr_BoxesRunTime$().equals__O__O__Z(this.image$2, Html5Bitmap$1.image$2)
    } else {
      return false
    }
  }
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.image$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype.init___Lsgl_html5_Html5GraphicsProvider__Lorg_scalajs_dom_raw_HTMLImageElement = (function($$outer, image) {
  this.image$2 = image;
  $c_Lsgl_GraphicsProvider$AbstractBitmap.prototype.init___Lsgl_GraphicsProvider.call(this, $$outer);
  return this
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_html5_Html5GraphicsProvider$Html5Bitmap)))
}
function $as_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(obj) {
  return (($is_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.html5.Html5GraphicsProvider$Html5Bitmap"))
}
function $isArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_html5_Html5GraphicsProvider$Html5Bitmap)))
}
function $asArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(obj, depth) {
  return (($isArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.html5.Html5GraphicsProvider$Html5Bitmap;", depth))
}
var $d_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap = new $TypeData().initClass({
  Lsgl_html5_Html5GraphicsProvider$Html5Bitmap: 0
}, false, "sgl.html5.Html5GraphicsProvider$Html5Bitmap", {
  Lsgl_html5_Html5GraphicsProvider$Html5Bitmap: 1,
  Lsgl_GraphicsProvider$AbstractBitmap: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap.prototype.$classData = $d_Lsgl_html5_Html5GraphicsProvider$Html5Bitmap;
/** @constructor */
function $c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas() {
  $c_O.call(this);
  this.canvas$1 = null;
  this.context$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype = new $h_O();
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.constructor = $c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas;
/** @constructor */
function $h_Lsgl_html5_Html5GraphicsProvider$Html5Canvas() {
  /*<skip>*/
}
$h_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype = $c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype;
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.init___Lsgl_html5_Html5GraphicsProvider__Lorg_scalajs_dom_raw_HTMLCanvasElement = (function($$outer, canvas) {
  this.canvas$1 = canvas;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.context$1 = canvas.getContext("2d");
  return this
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.productPrefix__T = (function() {
  return "Html5Canvas"
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.productArity__I = (function() {
  return 1
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (($is_Lsgl_html5_Html5GraphicsProvider$Html5Canvas(x$1) && ($as_Lsgl_html5_Html5GraphicsProvider$Html5Canvas(x$1).$$outer$1 === this.$$outer$1))) {
    var Html5Canvas$1 = $as_Lsgl_html5_Html5GraphicsProvider$Html5Canvas(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.canvas$1, Html5Canvas$1.canvas$1)
  } else {
    return false
  }
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.width__I = (function() {
  return $uI(this.canvas$1.width)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.canvas$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.drawString__T__I__I__Lsgl_html5_Html5GraphicsProvider$Html5Paint__V = (function(str, x, y, paint) {
  paint.prepareContext__Lorg_scalajs_dom_raw_CanvasRenderingContext2D__V(this.context$1);
  this.context$1.fillText(str, x, y)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.height__I = (function() {
  return $uI(this.canvas$1.height)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.drawBitmap__Lsgl_html5_Html5GraphicsProvider$Html5Bitmap__I__I__I__I__I__I__V = (function(bitmap, dx, dy, sx, sy, width, height) {
  this.context$1.drawImage(bitmap.image$2, sx, sy, width, height, dx, dy, width, height)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.drawRect__I__I__I__I__Lsgl_html5_Html5GraphicsProvider$Html5Paint__V = (function(x, y, width, height, paint) {
  paint.prepareContext__Lorg_scalajs_dom_raw_CanvasRenderingContext2D__V(this.context$1);
  this.context$1.fillRect(x, y, width, height)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.clipRect__I__I__I__I__V = (function(x, y, width, height) {
  this.context$1.beginPath();
  this.context$1.rect(x, y, width, height);
  this.context$1.clip()
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.clearRect__I__I__I__I__V = (function(x, y, width, height) {
  this.context$1.clearRect(x, y, width, height)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.drawColor__T__V = (function(color) {
  this.context$1.fillStyle = ($m_sjs_js_Any$(), color);
  var jsx$2 = this.context$1;
  var this$2 = $as_Lsgl_html5_Html5WindowProvider(this.$$outer$1);
  var jsx$1 = $f_Lsgl_html5_Html5WindowProvider__WindowWidth__I(this$2);
  var this$3 = $as_Lsgl_html5_Html5WindowProvider(this.$$outer$1);
  jsx$2.fillRect(0.0, 0.0, jsx$1, $f_Lsgl_html5_Html5WindowProvider__WindowHeight__I(this$3))
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.translate__I__I__V = (function(x, y) {
  this.context$1.translate(x, y)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lsgl_html5_Html5GraphicsProvider$Html5Canvas(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_html5_Html5GraphicsProvider$Html5Canvas)))
}
function $as_Lsgl_html5_Html5GraphicsProvider$Html5Canvas(obj) {
  return (($is_Lsgl_html5_Html5GraphicsProvider$Html5Canvas(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.html5.Html5GraphicsProvider$Html5Canvas"))
}
function $isArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Canvas(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_html5_Html5GraphicsProvider$Html5Canvas)))
}
function $asArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Canvas(obj, depth) {
  return (($isArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Canvas(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.html5.Html5GraphicsProvider$Html5Canvas;", depth))
}
var $d_Lsgl_html5_Html5GraphicsProvider$Html5Canvas = new $TypeData().initClass({
  Lsgl_html5_Html5GraphicsProvider$Html5Canvas: 0
}, false, "sgl.html5.Html5GraphicsProvider$Html5Canvas", {
  Lsgl_html5_Html5GraphicsProvider$Html5Canvas: 1,
  O: 1,
  Lsgl_GraphicsProvider$AbstractCanvas: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Canvas.prototype.$classData = $d_Lsgl_html5_Html5GraphicsProvider$Html5Canvas;
/** @constructor */
function $c_Lsgl_html5_Html5GraphicsProvider$Html5Font() {
  $c_Lsgl_GraphicsProvider$AbstractFont.call(this);
  this.family$2 = null;
  this.style$2 = null;
  this.size$2 = 0
}
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype = new $h_Lsgl_GraphicsProvider$AbstractFont();
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.constructor = $c_Lsgl_html5_Html5GraphicsProvider$Html5Font;
/** @constructor */
function $h_Lsgl_html5_Html5GraphicsProvider$Html5Font() {
  /*<skip>*/
}
$h_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype = $c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype;
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.productPrefix__T = (function() {
  return "Html5Font"
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.productArity__I = (function() {
  return 3
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else {
    if ($is_Lsgl_html5_Html5GraphicsProvider$Html5Font(x$1)) {
      var this$1 = $as_Lsgl_html5_Html5GraphicsProvider$Html5Font(x$1);
      var jsx$1 = ($as_Lsgl_html5_Html5GraphicsProvider(this$1.$$outer$1) === $as_Lsgl_html5_Html5GraphicsProvider(this.$$outer$1))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var Html5Font$1 = $as_Lsgl_html5_Html5GraphicsProvider$Html5Font(x$1);
      if ((this.family$2 === Html5Font$1.family$2)) {
        var x = this.style$2;
        var x$2 = Html5Font$1.style$2;
        var jsx$2 = (x === x$2)
      } else {
        var jsx$2 = false
      };
      if (jsx$2) {
        return (this.size$2 === Html5Font$1.size$2)
      } else {
        return false
      }
    } else {
      return false
    }
  }
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.family$2;
      break
    }
    case 1: {
      return this.style$2;
      break
    }
    case 2: {
      return this.size$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.init___Lsgl_html5_Html5GraphicsProvider__T__Lsgl_GraphicsProvider$FontCompanion$Style__I = (function($$outer, family, style, size) {
  this.family$2 = family;
  this.style$2 = style;
  this.size$2 = size;
  $c_Lsgl_GraphicsProvider$AbstractFont.prototype.init___Lsgl_GraphicsProvider.call(this, $$outer);
  return this
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.family$2));
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.style$2));
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.size$2);
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 3)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.withSize__I__Lsgl_html5_Html5GraphicsProvider$Html5Font = (function(s) {
  var x$2 = this.family$2;
  var x$3 = this.style$2;
  return new $c_Lsgl_html5_Html5GraphicsProvider$Html5Font().init___Lsgl_html5_Html5GraphicsProvider__T__Lsgl_GraphicsProvider$FontCompanion$Style__I($as_Lsgl_html5_Html5GraphicsProvider(this.$$outer$1), x$2, x$3, s)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.asCss__T = (function() {
  var scss = $as_Lsgl_html5_Html5GraphicsProvider(this.$$outer$1).Font$1.toCssStyle__Lsgl_GraphicsProvider$FontCompanion$Style__T(this.style$2);
  return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", " ", "px ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([scss, this.size$2, this.family$2]))
});
function $is_Lsgl_html5_Html5GraphicsProvider$Html5Font(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_html5_Html5GraphicsProvider$Html5Font)))
}
function $as_Lsgl_html5_Html5GraphicsProvider$Html5Font(obj) {
  return (($is_Lsgl_html5_Html5GraphicsProvider$Html5Font(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.html5.Html5GraphicsProvider$Html5Font"))
}
function $isArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Font(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_html5_Html5GraphicsProvider$Html5Font)))
}
function $asArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Font(obj, depth) {
  return (($isArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Font(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.html5.Html5GraphicsProvider$Html5Font;", depth))
}
var $d_Lsgl_html5_Html5GraphicsProvider$Html5Font = new $TypeData().initClass({
  Lsgl_html5_Html5GraphicsProvider$Html5Font: 0
}, false, "sgl.html5.Html5GraphicsProvider$Html5Font", {
  Lsgl_html5_Html5GraphicsProvider$Html5Font: 1,
  Lsgl_GraphicsProvider$AbstractFont: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Font.prototype.$classData = $d_Lsgl_html5_Html5GraphicsProvider$Html5Font;
/** @constructor */
function $c_Lsgl_html5_Html5GraphicsProvider$Html5Paint() {
  $c_O.call(this);
  this.font$1 = null;
  this.color$1 = null;
  this.alignment$1 = null;
  this.alignmentRaw$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype = new $h_O();
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.constructor = $c_Lsgl_html5_Html5GraphicsProvider$Html5Paint;
/** @constructor */
function $h_Lsgl_html5_Html5GraphicsProvider$Html5Paint() {
  /*<skip>*/
}
$h_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype = $c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype;
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.productPrefix__T = (function() {
  return "Html5Paint"
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.productArity__I = (function() {
  return 3
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (($is_Lsgl_html5_Html5GraphicsProvider$Html5Paint(x$1) && ($as_Lsgl_html5_Html5GraphicsProvider$Html5Paint(x$1).$$outer$1 === this.$$outer$1))) {
    var Html5Paint$1 = $as_Lsgl_html5_Html5GraphicsProvider$Html5Paint(x$1);
    var x = this.font$1;
    var x$2 = Html5Paint$1.font$1;
    if ((((x === null) ? (x$2 === null) : x.equals__O__Z(x$2)) && (this.color$1 === Html5Paint$1.color$1))) {
      var x$3 = this.alignment$1;
      var x$4 = Html5Paint$1.alignment$1;
      return (x$3 === x$4)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.font$1;
      break
    }
    case 1: {
      return this.color$1;
      break
    }
    case 2: {
      return this.alignment$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.init___Lsgl_html5_Html5GraphicsProvider__Lsgl_html5_Html5GraphicsProvider$Html5Font__T__Lsgl_GraphicsProvider$Alignments$Alignment = (function($$outer, font, color, alignment) {
  this.font$1 = font;
  this.color$1 = color;
  this.alignment$1 = alignment;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  var x = $$outer.Alignments__Lsgl_GraphicsProvider$Alignments$().Left__Lsgl_GraphicsProvider$Alignments$Left$();
  if ((x === alignment)) {
    var jsx$1 = "left"
  } else {
    var x$3 = $$outer.Alignments__Lsgl_GraphicsProvider$Alignments$().Center__Lsgl_GraphicsProvider$Alignments$Center$();
    if ((x$3 === alignment)) {
      var jsx$1 = "center"
    } else {
      var x$5 = $$outer.Alignments__Lsgl_GraphicsProvider$Alignments$().Right__Lsgl_GraphicsProvider$Alignments$Right$();
      if ((x$5 === alignment)) {
        var jsx$1 = "right"
      } else {
        var jsx$1;
        throw new $c_s_MatchError().init___O(alignment)
      }
    }
  };
  this.alignmentRaw$1 = jsx$1;
  return this
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.withColor__T__Lsgl_html5_Html5GraphicsProvider$Html5Paint = (function(c) {
  var x$8 = this.font$1;
  var x$9 = this.alignment$1;
  return new $c_Lsgl_html5_Html5GraphicsProvider$Html5Paint().init___Lsgl_html5_Html5GraphicsProvider__Lsgl_html5_Html5GraphicsProvider$Html5Font__T__Lsgl_GraphicsProvider$Alignments$Alignment(this.$$outer$1, x$8, c, x$9)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.withAlignment__Lsgl_GraphicsProvider$Alignments$Alignment__Lsgl_html5_Html5GraphicsProvider$Html5Paint = (function(a) {
  var x$11 = this.font$1;
  var x$12 = this.color$1;
  return new $c_Lsgl_html5_Html5GraphicsProvider$Html5Paint().init___Lsgl_html5_Html5GraphicsProvider__Lsgl_html5_Html5GraphicsProvider$Html5Font__T__Lsgl_GraphicsProvider$Alignments$Alignment(this.$$outer$1, x$11, x$12, a)
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.prepareContext__Lorg_scalajs_dom_raw_CanvasRenderingContext2D__V = (function(ctx) {
  $m_sjs_js_Any$();
  var s = this.color$1;
  ctx.fillStyle = s;
  $m_sjs_js_Any$();
  var s$1 = this.color$1;
  ctx.strokeStyle = s$1;
  ctx.font = this.font$1.asCss__T();
  ctx.textAlign = this.alignmentRaw$1
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lsgl_html5_Html5GraphicsProvider$Html5Paint(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_html5_Html5GraphicsProvider$Html5Paint)))
}
function $as_Lsgl_html5_Html5GraphicsProvider$Html5Paint(obj) {
  return (($is_Lsgl_html5_Html5GraphicsProvider$Html5Paint(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.html5.Html5GraphicsProvider$Html5Paint"))
}
function $isArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Paint(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_html5_Html5GraphicsProvider$Html5Paint)))
}
function $asArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Paint(obj, depth) {
  return (($isArrayOf_Lsgl_html5_Html5GraphicsProvider$Html5Paint(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.html5.Html5GraphicsProvider$Html5Paint;", depth))
}
var $d_Lsgl_html5_Html5GraphicsProvider$Html5Paint = new $TypeData().initClass({
  Lsgl_html5_Html5GraphicsProvider$Html5Paint: 0
}, false, "sgl.html5.Html5GraphicsProvider$Html5Paint", {
  Lsgl_html5_Html5GraphicsProvider$Html5Paint: 1,
  O: 1,
  Lsgl_GraphicsProvider$AbstractPaint: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_html5_Html5GraphicsProvider$Html5Paint.prototype.$classData = $d_Lsgl_html5_Html5GraphicsProvider$Html5Paint;
/** @constructor */
function $c_T2() {
  $c_O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
}
$c_T2.prototype = new $h_O();
$c_T2.prototype.constructor = $c_T2;
/** @constructor */
function $h_T2() {
  /*<skip>*/
}
$h_T2.prototype = $c_T2.prototype;
$c_T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
$c_T2.prototype.$$und1$mcI$sp__I = (function() {
  return $uI(this.$$und1__O())
});
$c_T2.prototype.productArity__I = (function() {
  return 2
});
$c_T2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_T2(x$1)) {
    var Tuple2$1 = $as_T2(x$1);
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und1__O(), Tuple2$1.$$und1__O()) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und2__O(), Tuple2$1.$$und2__O()))
  } else {
    return false
  }
});
$c_T2.prototype.productElement__I__O = (function(n) {
  return $f_s_Product2__productElement__I__O(this, n)
});
$c_T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
$c_T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1__O()) + ",") + this.$$und2__O()) + ")")
});
$c_T2.prototype.$$und2__O = (function() {
  return this.$$und2$f
});
$c_T2.prototype.$$und2$mcI$sp__I = (function() {
  return $uI(this.$$und2__O())
});
$c_T2.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_T2.prototype.$$und1__O = (function() {
  return this.$$und1$f
});
$c_T2.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_T2(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T2)))
}
function $as_T2(obj) {
  return (($is_T2(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple2"))
}
function $isArrayOf_T2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
}
function $asArrayOf_T2(obj, depth) {
  return (($isArrayOf_T2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple2;", depth))
}
var $d_T2 = new $TypeData().initClass({
  T2: 0
}, false, "scala.Tuple2", {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_T2.prototype.$classData = $d_T2;
/** @constructor */
function $c_s_None$() {
  $c_s_Option.call(this)
}
$c_s_None$.prototype = new $h_s_Option();
$c_s_None$.prototype.constructor = $c_s_None$;
/** @constructor */
function $h_s_None$() {
  /*<skip>*/
}
$h_s_None$.prototype = $c_s_None$.prototype;
$c_s_None$.prototype.init___ = (function() {
  return this
});
$c_s_None$.prototype.productPrefix__T = (function() {
  return "None"
});
$c_s_None$.prototype.productArity__I = (function() {
  return 0
});
$c_s_None$.prototype.isEmpty__Z = (function() {
  return true
});
$c_s_None$.prototype.get__O = (function() {
  this.get__sr_Nothing$()
});
$c_s_None$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_s_None$.prototype.toString__T = (function() {
  return "None"
});
$c_s_None$.prototype.get__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("None.get")
});
$c_s_None$.prototype.hashCode__I = (function() {
  return 2433880
});
$c_s_None$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_s_None$ = new $TypeData().initClass({
  s_None$: 0
}, false, "scala.None$", {
  s_None$: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_None$.prototype.$classData = $d_s_None$;
var $n_s_None$ = (void 0);
function $m_s_None$() {
  if ((!$n_s_None$)) {
    $n_s_None$ = new $c_s_None$().init___()
  };
  return $n_s_None$
}
/** @constructor */
function $c_s_Some() {
  $c_s_Option.call(this);
  this.value$2 = null
}
$c_s_Some.prototype = new $h_s_Option();
$c_s_Some.prototype.constructor = $c_s_Some;
/** @constructor */
function $h_s_Some() {
  /*<skip>*/
}
$h_s_Some.prototype = $c_s_Some.prototype;
$c_s_Some.prototype.productPrefix__T = (function() {
  return "Some"
});
$c_s_Some.prototype.productArity__I = (function() {
  return 1
});
$c_s_Some.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_Some(x$1)) {
    var Some$1 = $as_s_Some(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Some$1.value$2)
  } else {
    return false
  }
});
$c_s_Some.prototype.isEmpty__Z = (function() {
  return false
});
$c_s_Some.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_Some.prototype.get__O = (function() {
  return this.value$2
});
$c_s_Some.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_Some.prototype.init___O = (function(value) {
  this.value$2 = value;
  return this
});
$c_s_Some.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_Some.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_Some(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Some)))
}
function $as_s_Some(obj) {
  return (($is_s_Some(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Some"))
}
function $isArrayOf_s_Some(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Some)))
}
function $asArrayOf_s_Some(obj, depth) {
  return (($isArrayOf_s_Some(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Some;", depth))
}
var $d_s_Some = new $TypeData().initClass({
  s_Some: 0
}, false, "scala.Some", {
  s_Some: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Some.prototype.$classData = $d_s_Some;
/** @constructor */
function $c_s_StringContext$InvalidEscapeException() {
  $c_jl_IllegalArgumentException.call(this);
  this.index$5 = 0
}
$c_s_StringContext$InvalidEscapeException.prototype = new $h_jl_IllegalArgumentException();
$c_s_StringContext$InvalidEscapeException.prototype.constructor = $c_s_StringContext$InvalidEscapeException;
/** @constructor */
function $h_s_StringContext$InvalidEscapeException() {
  /*<skip>*/
}
$h_s_StringContext$InvalidEscapeException.prototype = $c_s_StringContext$InvalidEscapeException.prototype;
$c_s_StringContext$InvalidEscapeException.prototype.init___T__I = (function(str, index) {
  this.index$5 = index;
  var jsx$3 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["invalid escape ", " index ", " in \"", "\". Use \\\\\\\\ for literal \\\\."]));
  $m_s_Predef$().require__Z__V(((index >= 0) && (index < $uI(str.length))));
  if ((index === (((-1) + $uI(str.length)) | 0))) {
    var jsx$1 = "at terminal"
  } else {
    var jsx$2 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["'\\\\", "' not one of ", " at"]));
    var index$1 = ((1 + index) | 0);
    var c = (65535 & $uI(str.charCodeAt(index$1)));
    var jsx$1 = jsx$2.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_jl_Character().init___C(c), "[\\b, \\t, \\n, \\f, \\r, \\\\, \\\", \\']"]))
  };
  var s = jsx$3.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, index, str]));
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_s_StringContext$InvalidEscapeException = new $TypeData().initClass({
  s_StringContext$InvalidEscapeException: 0
}, false, "scala.StringContext$InvalidEscapeException", {
  s_StringContext$InvalidEscapeException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$InvalidEscapeException.prototype.$classData = $d_s_StringContext$InvalidEscapeException;
function $f_sc_GenSetLike__equals__O__Z($thiz, that) {
  if ($is_sc_GenSet(that)) {
    var x2 = $as_sc_GenSet(that);
    return (($thiz === x2) || (($thiz.size__I() === x2.size__I()) && $f_sc_GenSetLike__liftedTree1$1__psc_GenSetLike__sc_GenSet__Z($thiz, x2)))
  } else {
    return false
  }
}
function $f_sc_GenSetLike__liftedTree1$1__psc_GenSetLike__sc_GenSet__Z($thiz, x2$1) {
  try {
    return $thiz.subsetOf__sc_GenSet__Z(x2$1)
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      $as_jl_ClassCastException(e);
      return false
    } else {
      throw e
    }
  }
}
function $f_sc_TraversableLike__flatMap__F1__scg_CanBuildFrom__O($thiz, f, bf) {
  var b = bf.apply__O__scm_Builder($thiz.repr__O());
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1, b$1) {
    return (function(x$2) {
      return $as_scm_Builder(b$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($as_sc_GenTraversableOnce(f$1.apply__O__O(x$2)).seq__sc_TraversableOnce()))
    })
  })($thiz, f, b)));
  return b.result__O()
}
function $f_sc_TraversableLike__to__scg_CanBuildFrom__O($thiz, cbf) {
  var b = cbf.apply__scm_Builder();
  $f_scm_Builder__sizeHint__sc_TraversableLike__V(b, $thiz);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.thisCollection__sc_Traversable());
  return b.result__O()
}
function $f_sc_TraversableLike__toString__T($thiz) {
  return $thiz.mkString__T__T__T__T(($thiz.stringPrefix__T() + "("), ", ", ")")
}
function $f_sc_TraversableLike__stringPrefix__T($thiz) {
  var this$1 = $thiz.repr__O();
  var fqn = $objectGetClass(this$1).getName__T();
  var idx1 = $m_sjsr_RuntimeString$().lastIndexOf__T__I__I(fqn, 46);
  if ((idx1 !== (-1))) {
    var beginIndex = ((1 + idx1) | 0);
    var cls = $as_T(fqn.substring(beginIndex))
  } else {
    var cls = fqn
  };
  var this$5 = new $c_sci_StringOps().init___T(cls);
  var parts = $f_sci_StringLike__split__C__AT(this$5, 36);
  var last = (((-1) + parts.u.length) | 0);
  var elems$2 = null;
  elems$2 = [];
  var len = parts.u.length;
  var i = 0;
  while ((i < len)) {
    var index = i;
    var elem = new $c_T2().init___O__O(parts.u[index], i);
    elems$2.push(elem);
    i = ((1 + i) | 0)
  };
  var xs = $makeNativeArrayWrapper($d_T2.getArrayOf(), elems$2);
  var start = 0;
  var end = xs.u.length;
  var z = "";
  var start$1 = start;
  var z$1 = z;
  var jsx$1;
  _foldl: while (true) {
    if ((start$1 !== end)) {
      var temp$start = ((1 + start$1) | 0);
      var arg1 = z$1;
      var index$1 = start$1;
      var arg2 = xs.u[index$1];
      var x0$1 = $as_T(arg1);
      var x1$1 = $as_T2(arg2);
      var x1 = new $c_T2().init___O__O(x0$1, x1$1);
      matchEnd4: {
        var temp$z;
        var z$2 = $as_T(x1.$$und1$f);
        var p2 = $as_T2(x1.$$und2$f);
        if ((p2 !== null)) {
          var s = $as_T(p2.$$und1__O());
          var i$1 = p2.$$und2$mcI$sp__I();
          if ((s === null)) {
            throw new $c_jl_NullPointerException().init___()
          };
          if ((s === "")) {
            var temp$z = z$2;
            break matchEnd4
          } else {
            if ((i$1 !== last)) {
              var this$18 = new $c_sci_StringOps().init___T(s);
              var i$2 = 0;
              while (true) {
                var jsx$4 = i$2;
                var $$this = this$18.repr$1;
                if ((jsx$4 < $uI($$this.length))) {
                  var arg1$1 = this$18.apply__I__O(i$2);
                  if ((arg1$1 === null)) {
                    var x$1 = 0
                  } else {
                    var this$22 = $as_jl_Character(arg1$1);
                    var x$1 = this$22.value$1
                  };
                  var this$23 = $m_jl_Character$();
                  var jsx$3 = (this$23.isDigit__I__Z(x$1) === true)
                } else {
                  var jsx$3 = false
                };
                if (jsx$3) {
                  i$2 = ((1 + i$2) | 0)
                } else {
                  break
                }
              };
              var jsx$5 = i$2;
              var $$this$1 = this$18.repr$1;
              var jsx$2 = (jsx$5 === $uI($$this$1.length))
            } else {
              var jsx$2 = false
            };
            if (jsx$2) {
              var temp$z = "";
              break matchEnd4
            } else {
              if ((i$1 === 0)) {
                var jsx$6 = true
              } else {
                var this$27 = $m_jl_Character$();
                var c = (65535 & $uI(s.charCodeAt(0)));
                var jsx$6 = this$27.isUpperCase__I__Z(c)
              };
              if (jsx$6) {
                if ((z$2 === null)) {
                  throw new $c_jl_NullPointerException().init___()
                };
                if ((z$2 === "")) {
                  var temp$z = s;
                  break matchEnd4
                } else {
                  var temp$z = ((("" + z$2) + new $c_jl_Character().init___C(46)) + s);
                  break matchEnd4
                }
              } else {
                var temp$z = z$2;
                break matchEnd4
              }
            }
          }
        };
        throw new $c_s_MatchError().init___O(x1)
      };
      start$1 = temp$start;
      z$1 = temp$z;
      continue _foldl
    };
    var jsx$1 = z$1;
    break
  };
  return $as_T(jsx$1)
}
/** @constructor */
function $c_scg_SeqFactory() {
  $c_scg_GenSeqFactory.call(this)
}
$c_scg_SeqFactory.prototype = new $h_scg_GenSeqFactory();
$c_scg_SeqFactory.prototype.constructor = $c_scg_SeqFactory;
/** @constructor */
function $h_scg_SeqFactory() {
  /*<skip>*/
}
$h_scg_SeqFactory.prototype = $c_scg_SeqFactory.prototype;
/** @constructor */
function $c_sci_HashSet$HashTrieSet$$anon$1() {
  $c_sci_TrieIterator.call(this)
}
$c_sci_HashSet$HashTrieSet$$anon$1.prototype = new $h_sci_TrieIterator();
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.constructor = $c_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
function $h_sci_HashSet$HashTrieSet$$anon$1() {
  /*<skip>*/
}
$h_sci_HashSet$HashTrieSet$$anon$1.prototype = $c_sci_HashSet$HashTrieSet$$anon$1.prototype;
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.init___sci_HashSet$HashTrieSet = (function($$outer) {
  $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$5);
  return this
});
var $d_sci_HashSet$HashTrieSet$$anon$1 = new $TypeData().initClass({
  sci_HashSet$HashTrieSet$$anon$1: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet$$anon$1", {
  sci_HashSet$HashTrieSet$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.$classData = $d_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
function $c_sci_Set$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_Set$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_Set$.prototype.constructor = $c_sci_Set$;
/** @constructor */
function $h_sci_Set$() {
  /*<skip>*/
}
$h_sci_Set$.prototype = $c_sci_Set$.prototype;
$c_sci_Set$.prototype.init___ = (function() {
  return this
});
$c_sci_Set$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
var $d_sci_Set$ = new $TypeData().initClass({
  sci_Set$: 0
}, false, "scala.collection.immutable.Set$", {
  sci_Set$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Set$.prototype.$classData = $d_sci_Set$;
var $n_sci_Set$ = (void 0);
function $m_sci_Set$() {
  if ((!$n_sci_Set$)) {
    $n_sci_Set$ = new $c_sci_Set$().init___()
  };
  return $n_sci_Set$
}
/** @constructor */
function $c_sci_Stream$StreamBuilder() {
  $c_scm_LazyBuilder.call(this)
}
$c_sci_Stream$StreamBuilder.prototype = new $h_scm_LazyBuilder();
$c_sci_Stream$StreamBuilder.prototype.constructor = $c_sci_Stream$StreamBuilder;
/** @constructor */
function $h_sci_Stream$StreamBuilder() {
  /*<skip>*/
}
$h_sci_Stream$StreamBuilder.prototype = $c_sci_Stream$StreamBuilder.prototype;
$c_sci_Stream$StreamBuilder.prototype.init___ = (function() {
  $c_scm_LazyBuilder.prototype.init___.call(this);
  return this
});
$c_sci_Stream$StreamBuilder.prototype.result__O = (function() {
  return this.result__sci_Stream()
});
$c_sci_Stream$StreamBuilder.prototype.result__sci_Stream = (function() {
  var this$1 = this.parts$1;
  return $as_sci_Stream(this$1.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream().flatMap__F1__scg_CanBuildFrom__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$5$2) {
      var x$5 = $as_sc_TraversableOnce(x$5$2);
      return x$5.toStream__sci_Stream()
    })
  })(this)), ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___())))
});
function $is_sci_Stream$StreamBuilder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$StreamBuilder)))
}
function $as_sci_Stream$StreamBuilder(obj) {
  return (($is_sci_Stream$StreamBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream$StreamBuilder"))
}
function $isArrayOf_sci_Stream$StreamBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$StreamBuilder)))
}
function $asArrayOf_sci_Stream$StreamBuilder(obj, depth) {
  return (($isArrayOf_sci_Stream$StreamBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream$StreamBuilder;", depth))
}
var $d_sci_Stream$StreamBuilder = new $TypeData().initClass({
  sci_Stream$StreamBuilder: 0
}, false, "scala.collection.immutable.Stream$StreamBuilder", {
  sci_Stream$StreamBuilder: 1,
  scm_LazyBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sci_Stream$StreamBuilder.prototype.$classData = $d_sci_Stream$StreamBuilder;
/** @constructor */
function $c_sci_VectorBuilder() {
  $c_O.call(this);
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  this.depth$1 = 0;
  this.display0$1 = null;
  this.display1$1 = null;
  this.display2$1 = null;
  this.display3$1 = null;
  this.display4$1 = null;
  this.display5$1 = null
}
$c_sci_VectorBuilder.prototype = new $h_O();
$c_sci_VectorBuilder.prototype.constructor = $c_sci_VectorBuilder;
/** @constructor */
function $h_sci_VectorBuilder() {
  /*<skip>*/
}
$h_sci_VectorBuilder.prototype = $c_sci_VectorBuilder.prototype;
$c_sci_VectorBuilder.prototype.display3__AO = (function() {
  return this.display3$1
});
$c_sci_VectorBuilder.prototype.init___ = (function() {
  this.display0$1 = $newArrayObject($d_O.getArrayOf(), [32]);
  this.depth$1 = 1;
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  return this
});
$c_sci_VectorBuilder.prototype.depth__I = (function() {
  return this.depth$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$1 = x$1
});
$c_sci_VectorBuilder.prototype.display0__AO = (function() {
  return this.display0$1
});
$c_sci_VectorBuilder.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$1 = x$1
});
$c_sci_VectorBuilder.prototype.display4__AO = (function() {
  return this.display4$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__sci_VectorBuilder = (function(elem) {
  if ((this.lo$1 >= this.display0$1.u.length)) {
    var newBlockIndex = ((32 + this.blockIndex$1) | 0);
    var xor = (this.blockIndex$1 ^ newBlockIndex);
    $f_sci_VectorPointer__gotoNextBlockStartWritable__I__I__V(this, newBlockIndex, xor);
    this.blockIndex$1 = newBlockIndex;
    this.lo$1 = 0
  };
  this.display0$1.u[this.lo$1] = elem;
  this.lo$1 = ((1 + this.lo$1) | 0);
  return this
});
$c_sci_VectorBuilder.prototype.result__O = (function() {
  return this.result__sci_Vector()
});
$c_sci_VectorBuilder.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$1 = x$1
});
$c_sci_VectorBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_sci_VectorBuilder.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$1 = x$1
});
$c_sci_VectorBuilder.prototype.display1__AO = (function() {
  return this.display1$1
});
$c_sci_VectorBuilder.prototype.display5__AO = (function() {
  return this.display5$1
});
$c_sci_VectorBuilder.prototype.result__sci_Vector = (function() {
  var size = ((this.blockIndex$1 + this.lo$1) | 0);
  if ((size === 0)) {
    var this$1 = $m_sci_Vector$();
    return this$1.NIL$6
  };
  var s = new $c_sci_Vector().init___I__I__I(0, size, 0);
  var depth = this.depth$1;
  $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
  if ((this.depth$1 > 1)) {
    var xor = (((-1) + size) | 0);
    $f_sci_VectorPointer__gotoPos__I__I__V(s, 0, xor)
  };
  return s
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sci_VectorBuilder.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$1 = x$1
});
$c_sci_VectorBuilder.prototype.display2__AO = (function() {
  return this.display2$1
});
$c_sci_VectorBuilder.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$1 = x$1
});
$c_sci_VectorBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $as_sci_VectorBuilder($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
});
$c_sci_VectorBuilder.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$1 = x$1
});
function $is_sci_VectorBuilder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_VectorBuilder)))
}
function $as_sci_VectorBuilder(obj) {
  return (($is_sci_VectorBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.VectorBuilder"))
}
function $isArrayOf_sci_VectorBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)))
}
function $asArrayOf_sci_VectorBuilder(obj, depth) {
  return (($isArrayOf_sci_VectorBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.VectorBuilder;", depth))
}
var $d_sci_VectorBuilder = new $TypeData().initClass({
  sci_VectorBuilder: 0
}, false, "scala.collection.immutable.VectorBuilder", {
  sci_VectorBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorBuilder.prototype.$classData = $d_sci_VectorBuilder;
/** @constructor */
function $c_sci_VectorIterator() {
  $c_sc_AbstractIterator.call(this);
  this.endIndex$2 = 0;
  this.blockIndex$2 = 0;
  this.lo$2 = 0;
  this.endLo$2 = 0;
  this.$$undhasNext$2 = false;
  this.depth$2 = 0;
  this.display0$2 = null;
  this.display1$2 = null;
  this.display2$2 = null;
  this.display3$2 = null;
  this.display4$2 = null;
  this.display5$2 = null
}
$c_sci_VectorIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_VectorIterator.prototype.constructor = $c_sci_VectorIterator;
/** @constructor */
function $h_sci_VectorIterator() {
  /*<skip>*/
}
$h_sci_VectorIterator.prototype = $c_sci_VectorIterator.prototype;
$c_sci_VectorIterator.prototype.next__O = (function() {
  if ((!this.$$undhasNext$2)) {
    throw new $c_ju_NoSuchElementException().init___T("reached iterator end")
  };
  var res = this.display0$2.u[this.lo$2];
  this.lo$2 = ((1 + this.lo$2) | 0);
  if ((this.lo$2 === this.endLo$2)) {
    if ((((this.blockIndex$2 + this.lo$2) | 0) < this.endIndex$2)) {
      var newBlockIndex = ((32 + this.blockIndex$2) | 0);
      var xor = (this.blockIndex$2 ^ newBlockIndex);
      $f_sci_VectorPointer__gotoNextBlockStart__I__I__V(this, newBlockIndex, xor);
      this.blockIndex$2 = newBlockIndex;
      var x = ((this.endIndex$2 - this.blockIndex$2) | 0);
      this.endLo$2 = ((x < 32) ? x : 32);
      this.lo$2 = 0
    } else {
      this.$$undhasNext$2 = false
    }
  };
  return res
});
$c_sci_VectorIterator.prototype.display3__AO = (function() {
  return this.display3$2
});
$c_sci_VectorIterator.prototype.depth__I = (function() {
  return this.depth$2
});
$c_sci_VectorIterator.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$2 = x$1
});
$c_sci_VectorIterator.prototype.init___I__I = (function(_startIndex, endIndex) {
  this.endIndex$2 = endIndex;
  this.blockIndex$2 = ((-32) & _startIndex);
  this.lo$2 = (31 & _startIndex);
  var x = ((endIndex - this.blockIndex$2) | 0);
  this.endLo$2 = ((x < 32) ? x : 32);
  this.$$undhasNext$2 = (((this.blockIndex$2 + this.lo$2) | 0) < endIndex);
  return this
});
$c_sci_VectorIterator.prototype.display0__AO = (function() {
  return this.display0$2
});
$c_sci_VectorIterator.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$2 = x$1
});
$c_sci_VectorIterator.prototype.display4__AO = (function() {
  return this.display4$2
});
$c_sci_VectorIterator.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$2 = x$1
});
$c_sci_VectorIterator.prototype.hasNext__Z = (function() {
  return this.$$undhasNext$2
});
$c_sci_VectorIterator.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$2 = x$1
});
$c_sci_VectorIterator.prototype.display1__AO = (function() {
  return this.display1$2
});
$c_sci_VectorIterator.prototype.display5__AO = (function() {
  return this.display5$2
});
$c_sci_VectorIterator.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$2 = x$1
});
$c_sci_VectorIterator.prototype.display2__AO = (function() {
  return this.display2$2
});
$c_sci_VectorIterator.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$2 = x$1
});
$c_sci_VectorIterator.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$2 = x$1
});
var $d_sci_VectorIterator = new $TypeData().initClass({
  sci_VectorIterator: 0
}, false, "scala.collection.immutable.VectorIterator", {
  sci_VectorIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorIterator.prototype.$classData = $d_sci_VectorIterator;
/** @constructor */
function $c_sjsr_UndefinedBehaviorError() {
  $c_jl_Error.call(this)
}
$c_sjsr_UndefinedBehaviorError.prototype = new $h_jl_Error();
$c_sjsr_UndefinedBehaviorError.prototype.constructor = $c_sjsr_UndefinedBehaviorError;
/** @constructor */
function $h_sjsr_UndefinedBehaviorError() {
  /*<skip>*/
}
$h_sjsr_UndefinedBehaviorError.prototype = $c_sjsr_UndefinedBehaviorError.prototype;
$c_sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  $c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
$c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
var $d_sjsr_UndefinedBehaviorError = new $TypeData().initClass({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_sjsr_UndefinedBehaviorError.prototype.$classData = $d_sjsr_UndefinedBehaviorError;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Num0$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$Num0$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Num0$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Num0$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Num0$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Num0$.prototype = $c_Lsgl_InputProvider$Input$Keys$Num0$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Num0$.prototype.productPrefix__T = (function() {
  return "Num0"
});
$c_Lsgl_InputProvider$Input$Keys$Num0$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Num0$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Num0$.prototype.toString__T = (function() {
  return "Num0"
});
$c_Lsgl_InputProvider$Input$Keys$Num0$.prototype.hashCode__I = (function() {
  return 2439562
});
$c_Lsgl_InputProvider$Input$Keys$Num0$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Num0$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Num0$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Num0$: 0
}, false, "sgl.InputProvider$Input$Keys$Num0$", {
  Lsgl_InputProvider$Input$Keys$Num0$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$NumKey: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Num0$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Num0$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Num1$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$Num1$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Num1$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Num1$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Num1$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Num1$.prototype = $c_Lsgl_InputProvider$Input$Keys$Num1$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Num1$.prototype.productPrefix__T = (function() {
  return "Num1"
});
$c_Lsgl_InputProvider$Input$Keys$Num1$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Num1$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Num1$.prototype.toString__T = (function() {
  return "Num1"
});
$c_Lsgl_InputProvider$Input$Keys$Num1$.prototype.hashCode__I = (function() {
  return 2439563
});
$c_Lsgl_InputProvider$Input$Keys$Num1$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Num1$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Num1$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Num1$: 0
}, false, "sgl.InputProvider$Input$Keys$Num1$", {
  Lsgl_InputProvider$Input$Keys$Num1$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$NumKey: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Num1$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Num1$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Num2$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$Num2$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Num2$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Num2$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Num2$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Num2$.prototype = $c_Lsgl_InputProvider$Input$Keys$Num2$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Num2$.prototype.productPrefix__T = (function() {
  return "Num2"
});
$c_Lsgl_InputProvider$Input$Keys$Num2$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Num2$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Num2$.prototype.toString__T = (function() {
  return "Num2"
});
$c_Lsgl_InputProvider$Input$Keys$Num2$.prototype.hashCode__I = (function() {
  return 2439564
});
$c_Lsgl_InputProvider$Input$Keys$Num2$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Num2$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Num2$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Num2$: 0
}, false, "sgl.InputProvider$Input$Keys$Num2$", {
  Lsgl_InputProvider$Input$Keys$Num2$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$NumKey: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Num2$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Num2$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Num3$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$Num3$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Num3$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Num3$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Num3$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Num3$.prototype = $c_Lsgl_InputProvider$Input$Keys$Num3$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Num3$.prototype.productPrefix__T = (function() {
  return "Num3"
});
$c_Lsgl_InputProvider$Input$Keys$Num3$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Num3$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Num3$.prototype.toString__T = (function() {
  return "Num3"
});
$c_Lsgl_InputProvider$Input$Keys$Num3$.prototype.hashCode__I = (function() {
  return 2439565
});
$c_Lsgl_InputProvider$Input$Keys$Num3$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Num3$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Num3$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Num3$: 0
}, false, "sgl.InputProvider$Input$Keys$Num3$", {
  Lsgl_InputProvider$Input$Keys$Num3$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$NumKey: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Num3$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Num3$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Num4$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$Num4$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Num4$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Num4$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Num4$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Num4$.prototype = $c_Lsgl_InputProvider$Input$Keys$Num4$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Num4$.prototype.productPrefix__T = (function() {
  return "Num4"
});
$c_Lsgl_InputProvider$Input$Keys$Num4$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Num4$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Num4$.prototype.toString__T = (function() {
  return "Num4"
});
$c_Lsgl_InputProvider$Input$Keys$Num4$.prototype.hashCode__I = (function() {
  return 2439566
});
$c_Lsgl_InputProvider$Input$Keys$Num4$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Num4$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Num4$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Num4$: 0
}, false, "sgl.InputProvider$Input$Keys$Num4$", {
  Lsgl_InputProvider$Input$Keys$Num4$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$NumKey: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Num4$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Num4$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Num5$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$Num5$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Num5$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Num5$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Num5$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Num5$.prototype = $c_Lsgl_InputProvider$Input$Keys$Num5$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Num5$.prototype.productPrefix__T = (function() {
  return "Num5"
});
$c_Lsgl_InputProvider$Input$Keys$Num5$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Num5$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Num5$.prototype.toString__T = (function() {
  return "Num5"
});
$c_Lsgl_InputProvider$Input$Keys$Num5$.prototype.hashCode__I = (function() {
  return 2439567
});
$c_Lsgl_InputProvider$Input$Keys$Num5$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Num5$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Num5$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Num5$: 0
}, false, "sgl.InputProvider$Input$Keys$Num5$", {
  Lsgl_InputProvider$Input$Keys$Num5$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$NumKey: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Num5$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Num5$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Num6$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$Num6$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Num6$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Num6$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Num6$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Num6$.prototype = $c_Lsgl_InputProvider$Input$Keys$Num6$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Num6$.prototype.productPrefix__T = (function() {
  return "Num6"
});
$c_Lsgl_InputProvider$Input$Keys$Num6$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Num6$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Num6$.prototype.toString__T = (function() {
  return "Num6"
});
$c_Lsgl_InputProvider$Input$Keys$Num6$.prototype.hashCode__I = (function() {
  return 2439568
});
$c_Lsgl_InputProvider$Input$Keys$Num6$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Num6$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Num6$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Num6$: 0
}, false, "sgl.InputProvider$Input$Keys$Num6$", {
  Lsgl_InputProvider$Input$Keys$Num6$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$NumKey: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Num6$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Num6$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Num7$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$Num7$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Num7$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Num7$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Num7$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Num7$.prototype = $c_Lsgl_InputProvider$Input$Keys$Num7$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Num7$.prototype.productPrefix__T = (function() {
  return "Num7"
});
$c_Lsgl_InputProvider$Input$Keys$Num7$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Num7$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Num7$.prototype.toString__T = (function() {
  return "Num7"
});
$c_Lsgl_InputProvider$Input$Keys$Num7$.prototype.hashCode__I = (function() {
  return 2439569
});
$c_Lsgl_InputProvider$Input$Keys$Num7$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Num7$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Num7$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Num7$: 0
}, false, "sgl.InputProvider$Input$Keys$Num7$", {
  Lsgl_InputProvider$Input$Keys$Num7$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$NumKey: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Num7$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Num7$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Num8$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$Num8$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Num8$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Num8$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Num8$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Num8$.prototype = $c_Lsgl_InputProvider$Input$Keys$Num8$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Num8$.prototype.productPrefix__T = (function() {
  return "Num8"
});
$c_Lsgl_InputProvider$Input$Keys$Num8$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Num8$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Num8$.prototype.toString__T = (function() {
  return "Num8"
});
$c_Lsgl_InputProvider$Input$Keys$Num8$.prototype.hashCode__I = (function() {
  return 2439570
});
$c_Lsgl_InputProvider$Input$Keys$Num8$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Num8$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Num8$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Num8$: 0
}, false, "sgl.InputProvider$Input$Keys$Num8$", {
  Lsgl_InputProvider$Input$Keys$Num8$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$NumKey: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Num8$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Num8$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$Keys$Num9$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$Keys$Num9$.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$Keys$Num9$.prototype.constructor = $c_Lsgl_InputProvider$Input$Keys$Num9$;
/** @constructor */
function $h_Lsgl_InputProvider$Input$Keys$Num9$() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$Keys$Num9$.prototype = $c_Lsgl_InputProvider$Input$Keys$Num9$.prototype;
$c_Lsgl_InputProvider$Input$Keys$Num9$.prototype.productPrefix__T = (function() {
  return "Num9"
});
$c_Lsgl_InputProvider$Input$Keys$Num9$.prototype.productArity__I = (function() {
  return 0
});
$c_Lsgl_InputProvider$Input$Keys$Num9$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Lsgl_InputProvider$Input$Keys$Num9$.prototype.toString__T = (function() {
  return "Num9"
});
$c_Lsgl_InputProvider$Input$Keys$Num9$.prototype.hashCode__I = (function() {
  return 2439571
});
$c_Lsgl_InputProvider$Input$Keys$Num9$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lsgl_InputProvider$Input$Keys$Num9$.prototype.init___Lsgl_InputProvider$Input$Keys$ = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lsgl_InputProvider$Input$Keys$Num9$ = new $TypeData().initClass({
  Lsgl_InputProvider$Input$Keys$Num9$: 0
}, false, "sgl.InputProvider$Input$Keys$Num9$", {
  Lsgl_InputProvider$Input$Keys$Num9$: 1,
  O: 1,
  Lsgl_InputProvider$Input$Keys$NumKey: 1,
  Lsgl_InputProvider$Input$Keys$Key: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$Keys$Num9$.prototype.$classData = $d_Lsgl_InputProvider$Input$Keys$Num9$;
/** @constructor */
function $c_Lsgl_InputProvider$Input$MouseDownEvent() {
  $c_O.call(this);
  this.x$1 = 0;
  this.y$1 = 0;
  this.mouseButton$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype.constructor = $c_Lsgl_InputProvider$Input$MouseDownEvent;
/** @constructor */
function $h_Lsgl_InputProvider$Input$MouseDownEvent() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$MouseDownEvent.prototype = $c_Lsgl_InputProvider$Input$MouseDownEvent.prototype;
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype.productPrefix__T = (function() {
  return "MouseDownEvent"
});
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype.productArity__I = (function() {
  return 3
});
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (($is_Lsgl_InputProvider$Input$MouseDownEvent(x$1) && ($as_Lsgl_InputProvider$Input$MouseDownEvent(x$1).$$outer$1 === this.$$outer$1))) {
    var MouseDownEvent$1 = $as_Lsgl_InputProvider$Input$MouseDownEvent(x$1);
    if (((this.x$1 === MouseDownEvent$1.x$1) && (this.y$1 === MouseDownEvent$1.y$1))) {
      var x = this.mouseButton$1;
      var x$2 = MouseDownEvent$1.mouseButton$1;
      return (x === x$2)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.x$1;
      break
    }
    case 1: {
      return this.y$1;
      break
    }
    case 2: {
      return this.mouseButton$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype.init___Lsgl_InputProvider$Input$__I__I__Lsgl_InputProvider$Input$MouseButtons$MouseButton = (function($$outer, x, y, mouseButton) {
  this.x$1 = x;
  this.y$1 = y;
  this.mouseButton$1 = mouseButton;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.x$1);
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.y$1);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.mouseButton$1));
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 3)
});
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lsgl_InputProvider$Input$MouseDownEvent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_InputProvider$Input$MouseDownEvent)))
}
function $as_Lsgl_InputProvider$Input$MouseDownEvent(obj) {
  return (($is_Lsgl_InputProvider$Input$MouseDownEvent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.InputProvider$Input$MouseDownEvent"))
}
function $isArrayOf_Lsgl_InputProvider$Input$MouseDownEvent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_InputProvider$Input$MouseDownEvent)))
}
function $asArrayOf_Lsgl_InputProvider$Input$MouseDownEvent(obj, depth) {
  return (($isArrayOf_Lsgl_InputProvider$Input$MouseDownEvent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.InputProvider$Input$MouseDownEvent;", depth))
}
var $d_Lsgl_InputProvider$Input$MouseDownEvent = new $TypeData().initClass({
  Lsgl_InputProvider$Input$MouseDownEvent: 0
}, false, "sgl.InputProvider$Input$MouseDownEvent", {
  Lsgl_InputProvider$Input$MouseDownEvent: 1,
  O: 1,
  Lsgl_InputProvider$Input$MouseInputEvent: 1,
  Lsgl_InputProvider$Input$InputEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$MouseDownEvent.prototype.$classData = $d_Lsgl_InputProvider$Input$MouseDownEvent;
/** @constructor */
function $c_Lsgl_InputProvider$Input$MouseMovedEvent() {
  $c_O.call(this);
  this.x$1 = 0;
  this.y$1 = 0;
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype.constructor = $c_Lsgl_InputProvider$Input$MouseMovedEvent;
/** @constructor */
function $h_Lsgl_InputProvider$Input$MouseMovedEvent() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$MouseMovedEvent.prototype = $c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype;
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype.productPrefix__T = (function() {
  return "MouseMovedEvent"
});
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype.productArity__I = (function() {
  return 2
});
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype.init___Lsgl_InputProvider$Input$__I__I = (function($$outer, x, y) {
  this.x$1 = x;
  this.y$1 = y;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (($is_Lsgl_InputProvider$Input$MouseMovedEvent(x$1) && ($as_Lsgl_InputProvider$Input$MouseMovedEvent(x$1).$$outer$1 === this.$$outer$1))) {
    var MouseMovedEvent$1 = $as_Lsgl_InputProvider$Input$MouseMovedEvent(x$1);
    return ((this.x$1 === MouseMovedEvent$1.x$1) && (this.y$1 === MouseMovedEvent$1.y$1))
  } else {
    return false
  }
});
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.x$1;
      break
    }
    case 1: {
      return this.y$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.x$1);
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.y$1);
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 2)
});
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lsgl_InputProvider$Input$MouseMovedEvent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_InputProvider$Input$MouseMovedEvent)))
}
function $as_Lsgl_InputProvider$Input$MouseMovedEvent(obj) {
  return (($is_Lsgl_InputProvider$Input$MouseMovedEvent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.InputProvider$Input$MouseMovedEvent"))
}
function $isArrayOf_Lsgl_InputProvider$Input$MouseMovedEvent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_InputProvider$Input$MouseMovedEvent)))
}
function $asArrayOf_Lsgl_InputProvider$Input$MouseMovedEvent(obj, depth) {
  return (($isArrayOf_Lsgl_InputProvider$Input$MouseMovedEvent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.InputProvider$Input$MouseMovedEvent;", depth))
}
var $d_Lsgl_InputProvider$Input$MouseMovedEvent = new $TypeData().initClass({
  Lsgl_InputProvider$Input$MouseMovedEvent: 0
}, false, "sgl.InputProvider$Input$MouseMovedEvent", {
  Lsgl_InputProvider$Input$MouseMovedEvent: 1,
  O: 1,
  Lsgl_InputProvider$Input$MouseInputEvent: 1,
  Lsgl_InputProvider$Input$InputEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$MouseMovedEvent.prototype.$classData = $d_Lsgl_InputProvider$Input$MouseMovedEvent;
/** @constructor */
function $c_Lsgl_InputProvider$Input$MouseUpEvent() {
  $c_O.call(this);
  this.x$1 = 0;
  this.y$1 = 0;
  this.mouseButton$1 = null;
  this.$$outer$1 = null
}
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype = new $h_O();
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype.constructor = $c_Lsgl_InputProvider$Input$MouseUpEvent;
/** @constructor */
function $h_Lsgl_InputProvider$Input$MouseUpEvent() {
  /*<skip>*/
}
$h_Lsgl_InputProvider$Input$MouseUpEvent.prototype = $c_Lsgl_InputProvider$Input$MouseUpEvent.prototype;
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype.productPrefix__T = (function() {
  return "MouseUpEvent"
});
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype.productArity__I = (function() {
  return 3
});
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (($is_Lsgl_InputProvider$Input$MouseUpEvent(x$1) && ($as_Lsgl_InputProvider$Input$MouseUpEvent(x$1).$$outer$1 === this.$$outer$1))) {
    var MouseUpEvent$1 = $as_Lsgl_InputProvider$Input$MouseUpEvent(x$1);
    if (((this.x$1 === MouseUpEvent$1.x$1) && (this.y$1 === MouseUpEvent$1.y$1))) {
      var x = this.mouseButton$1;
      var x$2 = MouseUpEvent$1.mouseButton$1;
      return (x === x$2)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.x$1;
      break
    }
    case 1: {
      return this.y$1;
      break
    }
    case 2: {
      return this.mouseButton$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype.init___Lsgl_InputProvider$Input$__I__I__Lsgl_InputProvider$Input$MouseButtons$MouseButton = (function($$outer, x, y, mouseButton) {
  this.x$1 = x;
  this.y$1 = y;
  this.mouseButton$1 = mouseButton;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.x$1);
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.y$1);
  acc = $m_sr_Statics$().mix__I__I__I(acc, $m_sr_Statics$().anyHash__O__I(this.mouseButton$1));
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 3)
});
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lsgl_InputProvider$Input$MouseUpEvent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_InputProvider$Input$MouseUpEvent)))
}
function $as_Lsgl_InputProvider$Input$MouseUpEvent(obj) {
  return (($is_Lsgl_InputProvider$Input$MouseUpEvent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.InputProvider$Input$MouseUpEvent"))
}
function $isArrayOf_Lsgl_InputProvider$Input$MouseUpEvent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_InputProvider$Input$MouseUpEvent)))
}
function $asArrayOf_Lsgl_InputProvider$Input$MouseUpEvent(obj, depth) {
  return (($isArrayOf_Lsgl_InputProvider$Input$MouseUpEvent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.InputProvider$Input$MouseUpEvent;", depth))
}
var $d_Lsgl_InputProvider$Input$MouseUpEvent = new $TypeData().initClass({
  Lsgl_InputProvider$Input$MouseUpEvent: 0
}, false, "sgl.InputProvider$Input$MouseUpEvent", {
  Lsgl_InputProvider$Input$MouseUpEvent: 1,
  O: 1,
  Lsgl_InputProvider$Input$MouseInputEvent: 1,
  Lsgl_InputProvider$Input$InputEvent: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lsgl_InputProvider$Input$MouseUpEvent.prototype.$classData = $d_Lsgl_InputProvider$Input$MouseUpEvent;
function $is_Lsgl_InputProvider$Input$TouchDownEvent(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lsgl_InputProvider$Input$TouchDownEvent)))
}
function $as_Lsgl_InputProvider$Input$TouchDownEvent(obj) {
  return (($is_Lsgl_InputProvider$Input$TouchDownEvent(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "sgl.InputProvider$Input$TouchDownEvent"))
}
function $isArrayOf_Lsgl_InputProvider$Input$TouchDownEvent(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lsgl_InputProvider$Input$TouchDownEvent)))
}
function $asArrayOf_Lsgl_InputProvider$Input$TouchDownEvent(obj, depth) {
  return (($isArrayOf_Lsgl_InputProvider$Input$TouchDownEvent(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lsgl.InputProvider$Input$TouchDownEvent;", depth))
}
/** @constructor */
function $c_jl_JSConsoleBasedPrintStream() {
  $c_Ljava_io_PrintStream.call(this);
  this.isErr$4 = null;
  this.flushed$4 = false;
  this.buffer$4 = null
}
$c_jl_JSConsoleBasedPrintStream.prototype = new $h_Ljava_io_PrintStream();
$c_jl_JSConsoleBasedPrintStream.prototype.constructor = $c_jl_JSConsoleBasedPrintStream;
/** @constructor */
function $h_jl_JSConsoleBasedPrintStream() {
  /*<skip>*/
}
$h_jl_JSConsoleBasedPrintStream.prototype = $c_jl_JSConsoleBasedPrintStream.prototype;
$c_jl_JSConsoleBasedPrintStream.prototype.init___jl_Boolean = (function(isErr) {
  this.isErr$4 = isErr;
  var out = new $c_jl_JSConsoleBasedPrintStream$DummyOutputStream().init___();
  $c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset.call(this, out, false, null);
  this.flushed$4 = true;
  this.buffer$4 = "";
  return this
});
$c_jl_JSConsoleBasedPrintStream.prototype.java$lang$JSConsoleBasedPrintStream$$printString__T__V = (function(s) {
  var rest = s;
  while ((rest !== "")) {
    var thiz = rest;
    var nlPos = $uI(thiz.indexOf("\n"));
    if ((nlPos < 0)) {
      this.buffer$4 = (("" + this.buffer$4) + rest);
      this.flushed$4 = false;
      rest = ""
    } else {
      var jsx$1 = this.buffer$4;
      var thiz$1 = rest;
      this.doWriteLine__p4__T__V((("" + jsx$1) + $as_T(thiz$1.substring(0, nlPos))));
      this.buffer$4 = "";
      this.flushed$4 = true;
      var thiz$2 = rest;
      var beginIndex = ((1 + nlPos) | 0);
      rest = $as_T(thiz$2.substring(beginIndex))
    }
  }
});
$c_jl_JSConsoleBasedPrintStream.prototype.doWriteLine__p4__T__V = (function(line) {
  var x = $g.console;
  if ($uZ((!(!x)))) {
    var x$1 = this.isErr$4;
    if ($uZ(x$1)) {
      var x$2 = $g.console.error;
      var jsx$1 = $uZ((!(!x$2)))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      $g.console.error(($m_sjs_js_Any$(), line))
    } else {
      $g.console.log(($m_sjs_js_Any$(), line))
    }
  }
});
var $d_jl_JSConsoleBasedPrintStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream", {
  jl_JSConsoleBasedPrintStream: 1,
  Ljava_io_PrintStream: 1,
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1,
  jl_Appendable: 1
});
$c_jl_JSConsoleBasedPrintStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream;
/** @constructor */
function $c_s_reflect_ClassTag$GenericClassTag() {
  $c_O.call(this);
  this.runtimeClass$1 = null
}
$c_s_reflect_ClassTag$GenericClassTag.prototype = new $h_O();
$c_s_reflect_ClassTag$GenericClassTag.prototype.constructor = $c_s_reflect_ClassTag$GenericClassTag;
/** @constructor */
function $h_s_reflect_ClassTag$GenericClassTag() {
  /*<skip>*/
}
$h_s_reflect_ClassTag$GenericClassTag.prototype = $c_s_reflect_ClassTag$GenericClassTag.prototype;
$c_s_reflect_ClassTag$GenericClassTag.prototype.newArray__I__O = (function(len) {
  return $f_s_reflect_ClassTag__newArray__I__O(this, len)
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.equals__O__Z = (function(x) {
  return $f_s_reflect_ClassTag__equals__O__Z(this, x)
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.toString__T = (function() {
  var clazz = this.runtimeClass$1;
  return $f_s_reflect_ClassTag__prettyprint$1__ps_reflect_ClassTag__jl_Class__T(this, clazz)
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.runtimeClass__jl_Class = (function() {
  return this.runtimeClass$1
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.init___jl_Class = (function(runtimeClass) {
  this.runtimeClass$1 = runtimeClass;
  return this
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.hashCode__I = (function() {
  return $m_sr_Statics$().anyHash__O__I(this.runtimeClass$1)
});
var $d_s_reflect_ClassTag$GenericClassTag = new $TypeData().initClass({
  s_reflect_ClassTag$GenericClassTag: 0
}, false, "scala.reflect.ClassTag$GenericClassTag", {
  s_reflect_ClassTag$GenericClassTag: 1,
  O: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.$classData = $d_s_reflect_ClassTag$GenericClassTag;
/** @constructor */
function $c_sc_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_sc_Seq$.prototype = new $h_scg_SeqFactory();
$c_sc_Seq$.prototype.constructor = $c_sc_Seq$;
/** @constructor */
function $h_sc_Seq$() {
  /*<skip>*/
}
$h_sc_Seq$.prototype = $c_sc_Seq$.prototype;
$c_sc_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sc_Seq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Seq$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Seq$ = new $TypeData().initClass({
  sc_Seq$: 0
}, false, "scala.collection.Seq$", {
  sc_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Seq$.prototype.$classData = $d_sc_Seq$;
var $n_sc_Seq$ = (void 0);
function $m_sc_Seq$() {
  if ((!$n_sc_Seq$)) {
    $n_sc_Seq$ = new $c_sc_Seq$().init___()
  };
  return $n_sc_Seq$
}
/** @constructor */
function $c_scg_IndexedSeqFactory() {
  $c_scg_SeqFactory.call(this)
}
$c_scg_IndexedSeqFactory.prototype = new $h_scg_SeqFactory();
$c_scg_IndexedSeqFactory.prototype.constructor = $c_scg_IndexedSeqFactory;
/** @constructor */
function $h_scg_IndexedSeqFactory() {
  /*<skip>*/
}
$h_scg_IndexedSeqFactory.prototype = $c_scg_IndexedSeqFactory.prototype;
/** @constructor */
function $c_sci_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_sci_Seq$.prototype = new $h_scg_SeqFactory();
$c_sci_Seq$.prototype.constructor = $c_sci_Seq$;
/** @constructor */
function $h_sci_Seq$() {
  /*<skip>*/
}
$h_sci_Seq$.prototype = $c_sci_Seq$.prototype;
$c_sci_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Seq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Seq$ = new $TypeData().initClass({
  sci_Seq$: 0
}, false, "scala.collection.immutable.Seq$", {
  sci_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Seq$.prototype.$classData = $d_sci_Seq$;
var $n_sci_Seq$ = (void 0);
function $m_sci_Seq$() {
  if ((!$n_sci_Seq$)) {
    $n_sci_Seq$ = new $c_sci_Seq$().init___()
  };
  return $n_sci_Seq$
}
/** @constructor */
function $c_scm_ArrayBuilder() {
  $c_O.call(this)
}
$c_scm_ArrayBuilder.prototype = new $h_O();
$c_scm_ArrayBuilder.prototype.constructor = $c_scm_ArrayBuilder;
/** @constructor */
function $h_scm_ArrayBuilder() {
  /*<skip>*/
}
$h_scm_ArrayBuilder.prototype = $c_scm_ArrayBuilder.prototype;
$c_scm_ArrayBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
/** @constructor */
function $c_scm_IndexedSeq$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_IndexedSeq$.prototype = new $h_scg_SeqFactory();
$c_scm_IndexedSeq$.prototype.constructor = $c_scm_IndexedSeq$;
/** @constructor */
function $h_scm_IndexedSeq$() {
  /*<skip>*/
}
$h_scm_IndexedSeq$.prototype = $c_scm_IndexedSeq$.prototype;
$c_scm_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_IndexedSeq$ = new $TypeData().initClass({
  scm_IndexedSeq$: 0
}, false, "scala.collection.mutable.IndexedSeq$", {
  scm_IndexedSeq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_scm_IndexedSeq$.prototype.$classData = $d_scm_IndexedSeq$;
var $n_scm_IndexedSeq$ = (void 0);
function $m_scm_IndexedSeq$() {
  if ((!$n_scm_IndexedSeq$)) {
    $n_scm_IndexedSeq$ = new $c_scm_IndexedSeq$().init___()
  };
  return $n_scm_IndexedSeq$
}
/** @constructor */
function $c_scm_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_Seq$.prototype = new $h_scg_SeqFactory();
$c_scm_Seq$.prototype.constructor = $c_scm_Seq$;
/** @constructor */
function $h_scm_Seq$() {
  /*<skip>*/
}
$h_scm_Seq$.prototype = $c_scm_Seq$.prototype;
$c_scm_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_Seq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_Seq$ = new $TypeData().initClass({
  scm_Seq$: 0
}, false, "scala.collection.mutable.Seq$", {
  scm_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_scm_Seq$.prototype.$classData = $d_scm_Seq$;
var $n_scm_Seq$ = (void 0);
function $m_scm_Seq$() {
  if ((!$n_scm_Seq$)) {
    $n_scm_Seq$ = new $c_scm_Seq$().init___()
  };
  return $n_scm_Seq$
}
/** @constructor */
function $c_sjs_js_WrappedArray$() {
  $c_scg_SeqFactory.call(this)
}
$c_sjs_js_WrappedArray$.prototype = new $h_scg_SeqFactory();
$c_sjs_js_WrappedArray$.prototype.constructor = $c_sjs_js_WrappedArray$;
/** @constructor */
function $h_sjs_js_WrappedArray$() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray$.prototype = $c_sjs_js_WrappedArray$.prototype;
$c_sjs_js_WrappedArray$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sjs_js_WrappedArray$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sjs_js_WrappedArray().init___()
});
var $d_sjs_js_WrappedArray$ = new $TypeData().initClass({
  sjs_js_WrappedArray$: 0
}, false, "scala.scalajs.js.WrappedArray$", {
  sjs_js_WrappedArray$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sjs_js_WrappedArray$.prototype.$classData = $d_sjs_js_WrappedArray$;
var $n_sjs_js_WrappedArray$ = (void 0);
function $m_sjs_js_WrappedArray$() {
  if ((!$n_sjs_js_WrappedArray$)) {
    $n_sjs_js_WrappedArray$ = new $c_sjs_js_WrappedArray$().init___()
  };
  return $n_sjs_js_WrappedArray$
}
/** @constructor */
function $c_s_Tuple2$mcII$sp() {
  $c_T2.call(this);
  this.$$und1$mcI$sp$f = 0;
  this.$$und2$mcI$sp$f = 0
}
$c_s_Tuple2$mcII$sp.prototype = new $h_T2();
$c_s_Tuple2$mcII$sp.prototype.constructor = $c_s_Tuple2$mcII$sp;
/** @constructor */
function $h_s_Tuple2$mcII$sp() {
  /*<skip>*/
}
$h_s_Tuple2$mcII$sp.prototype = $c_s_Tuple2$mcII$sp.prototype;
$c_s_Tuple2$mcII$sp.prototype.$$und1$mcI$sp__I = (function() {
  return this.$$und1$mcI$sp$f
});
$c_s_Tuple2$mcII$sp.prototype.init___I__I = (function(_1$mcI$sp, _2$mcI$sp) {
  this.$$und1$mcI$sp$f = _1$mcI$sp;
  this.$$und2$mcI$sp$f = _2$mcI$sp;
  $c_T2.prototype.init___O__O.call(this, null, null);
  return this
});
$c_s_Tuple2$mcII$sp.prototype.$$und2__O = (function() {
  return this.$$und2$mcI$sp$f
});
$c_s_Tuple2$mcII$sp.prototype.$$und2$mcI$sp__I = (function() {
  return this.$$und2$mcI$sp$f
});
$c_s_Tuple2$mcII$sp.prototype.$$und1__O = (function() {
  return this.$$und1$mcI$sp$f
});
var $d_s_Tuple2$mcII$sp = new $TypeData().initClass({
  s_Tuple2$mcII$sp: 0
}, false, "scala.Tuple2$mcII$sp", {
  s_Tuple2$mcII$sp: 1,
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Product2$mcII$sp: 1
});
$c_s_Tuple2$mcII$sp.prototype.$classData = $d_s_Tuple2$mcII$sp;
/** @constructor */
function $c_s_reflect_AnyValManifest() {
  $c_O.call(this);
  this.toString$1 = null
}
$c_s_reflect_AnyValManifest.prototype = new $h_O();
$c_s_reflect_AnyValManifest.prototype.constructor = $c_s_reflect_AnyValManifest;
/** @constructor */
function $h_s_reflect_AnyValManifest() {
  /*<skip>*/
}
$h_s_reflect_AnyValManifest.prototype = $c_s_reflect_AnyValManifest.prototype;
$c_s_reflect_AnyValManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_AnyValManifest.prototype.toString__T = (function() {
  return this.toString$1
});
$c_s_reflect_AnyValManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ClassTypeManifest() {
  $c_O.call(this);
  this.prefix$1 = null;
  this.runtimeClass1$1 = null;
  this.typeArguments$1 = null
}
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype = new $h_O();
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype.constructor = $c_s_reflect_ManifestFactory$ClassTypeManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$ClassTypeManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ClassTypeManifest.prototype = $c_s_reflect_ManifestFactory$ClassTypeManifest.prototype;
/** @constructor */
function $c_sc_IndexedSeq$() {
  $c_scg_IndexedSeqFactory.call(this);
  this.ReusableCBF$6 = null
}
$c_sc_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sc_IndexedSeq$.prototype.constructor = $c_sc_IndexedSeq$;
/** @constructor */
function $h_sc_IndexedSeq$() {
  /*<skip>*/
}
$h_sc_IndexedSeq$.prototype = $c_sc_IndexedSeq$.prototype;
$c_sc_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_IndexedSeq$ = this;
  this.ReusableCBF$6 = new $c_sc_IndexedSeq$$anon$1().init___();
  return this
});
$c_sc_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$ = new $TypeData().initClass({
  sc_IndexedSeq$: 0
}, false, "scala.collection.IndexedSeq$", {
  sc_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_IndexedSeq$.prototype.$classData = $d_sc_IndexedSeq$;
var $n_sc_IndexedSeq$ = (void 0);
function $m_sc_IndexedSeq$() {
  if ((!$n_sc_IndexedSeq$)) {
    $n_sc_IndexedSeq$ = new $c_sc_IndexedSeq$().init___()
  };
  return $n_sc_IndexedSeq$
}
/** @constructor */
function $c_sc_IndexedSeqLike$Elements() {
  $c_sc_AbstractIterator.call(this);
  this.end$2 = 0;
  this.index$2 = 0;
  this.$$outer$2 = null
}
$c_sc_IndexedSeqLike$Elements.prototype = new $h_sc_AbstractIterator();
$c_sc_IndexedSeqLike$Elements.prototype.constructor = $c_sc_IndexedSeqLike$Elements;
/** @constructor */
function $h_sc_IndexedSeqLike$Elements() {
  /*<skip>*/
}
$h_sc_IndexedSeqLike$Elements.prototype = $c_sc_IndexedSeqLike$Elements.prototype;
$c_sc_IndexedSeqLike$Elements.prototype.next__O = (function() {
  if ((this.index$2 >= this.end$2)) {
    $m_sc_Iterator$().empty$1.next__O()
  };
  var x = this.$$outer$2.apply__I__O(this.index$2);
  this.index$2 = ((1 + this.index$2) | 0);
  return x
});
$c_sc_IndexedSeqLike$Elements.prototype.init___sc_IndexedSeqLike__I__I = (function($$outer, start, end) {
  this.end$2 = end;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.index$2 = start;
  return this
});
$c_sc_IndexedSeqLike$Elements.prototype.hasNext__Z = (function() {
  return (this.index$2 < this.end$2)
});
var $d_sc_IndexedSeqLike$Elements = new $TypeData().initClass({
  sc_IndexedSeqLike$Elements: 0
}, false, "scala.collection.IndexedSeqLike$Elements", {
  sc_IndexedSeqLike$Elements: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_BufferedIterator: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sc_IndexedSeqLike$Elements.prototype.$classData = $d_sc_IndexedSeqLike$Elements;
/** @constructor */
function $c_sci_HashSet$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_HashSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_HashSet$.prototype.constructor = $c_sci_HashSet$;
/** @constructor */
function $h_sci_HashSet$() {
  /*<skip>*/
}
$h_sci_HashSet$.prototype = $c_sci_HashSet$.prototype;
$c_sci_HashSet$.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet$.prototype.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet = (function(hash0, elem0, hash1, elem1, level) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = $newArrayObject($d_sci_HashSet.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.u[0] = elem0;
      elems.u[1] = elem1
    } else {
      elems.u[0] = elem1;
      elems.u[1] = elem0
    };
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap, elems, ((elem0.size__I() + elem1.size__I()) | 0))
  } else {
    var elems$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    var child = this.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(hash0, elem0, hash1, elem1, ((5 + level) | 0));
    elems$2.u[0] = child;
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap$2, elems$2, child.size0$5)
  }
});
$c_sci_HashSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
var $d_sci_HashSet$ = new $TypeData().initClass({
  sci_HashSet$: 0
}, false, "scala.collection.immutable.HashSet$", {
  sci_HashSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$.prototype.$classData = $d_sci_HashSet$;
var $n_sci_HashSet$ = (void 0);
function $m_sci_HashSet$() {
  if ((!$n_sci_HashSet$)) {
    $n_sci_HashSet$ = new $c_sci_HashSet$().init___()
  };
  return $n_sci_HashSet$
}
/** @constructor */
function $c_sci_IndexedSeq$() {
  $c_scg_IndexedSeqFactory.call(this)
}
$c_sci_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_IndexedSeq$.prototype.constructor = $c_sci_IndexedSeq$;
/** @constructor */
function $h_sci_IndexedSeq$() {
  /*<skip>*/
}
$h_sci_IndexedSeq$.prototype = $c_sci_IndexedSeq$.prototype;
$c_sci_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_IndexedSeq$ = new $TypeData().initClass({
  sci_IndexedSeq$: 0
}, false, "scala.collection.immutable.IndexedSeq$", {
  sci_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_IndexedSeq$.prototype.$classData = $d_sci_IndexedSeq$;
var $n_sci_IndexedSeq$ = (void 0);
function $m_sci_IndexedSeq$() {
  if ((!$n_sci_IndexedSeq$)) {
    $n_sci_IndexedSeq$ = new $c_sci_IndexedSeq$().init___()
  };
  return $n_sci_IndexedSeq$
}
/** @constructor */
function $c_sci_ListSet$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_ListSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_ListSet$.prototype.constructor = $c_sci_ListSet$;
/** @constructor */
function $h_sci_ListSet$() {
  /*<skip>*/
}
$h_sci_ListSet$.prototype = $c_sci_ListSet$.prototype;
$c_sci_ListSet$.prototype.init___ = (function() {
  return this
});
$c_sci_ListSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
var $d_sci_ListSet$ = new $TypeData().initClass({
  sci_ListSet$: 0
}, false, "scala.collection.immutable.ListSet$", {
  sci_ListSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$.prototype.$classData = $d_sci_ListSet$;
var $n_sci_ListSet$ = (void 0);
function $m_sci_ListSet$() {
  if ((!$n_sci_ListSet$)) {
    $n_sci_ListSet$ = new $c_sci_ListSet$().init___()
  };
  return $n_sci_ListSet$
}
/** @constructor */
function $c_scm_ArrayBuilder$ofRef() {
  $c_scm_ArrayBuilder.call(this);
  this.evidence$2$2 = null;
  this.elems$2 = null;
  this.capacity$2 = 0;
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofRef.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofRef.prototype.constructor = $c_scm_ArrayBuilder$ofRef;
/** @constructor */
function $h_scm_ArrayBuilder$ofRef() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofRef.prototype = $c_scm_ArrayBuilder$ofRef.prototype;
$c_scm_ArrayBuilder$ofRef.prototype.init___s_reflect_ClassTag = (function(evidence$2) {
  this.evidence$2$2 = evidence$2;
  this.capacity$2 = 0;
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofRef.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofRef = (function(xs) {
  if ($is_scm_WrappedArray$ofRef(xs)) {
    var x2 = $as_scm_WrappedArray$ofRef(xs);
    this.ensureSize__p2__I__V(((this.size$2 + x2.length__I()) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$6, 0, this.elems$2, this.size$2, x2.length__I());
    this.size$2 = ((this.size$2 + x2.length__I()) | 0);
    return this
  } else {
    return $as_scm_ArrayBuilder$ofRef($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuilder$ofRef.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofRef(other)) {
    var x2 = $as_scm_ArrayBuilder$ofRef(other);
    return ((this.size$2 === x2.size$2) && (this.elems$2 === x2.elems$2))
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofRef.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuilder$ofRef(elem)
});
$c_scm_ArrayBuilder$ofRef.prototype.toString__T = (function() {
  return "ArrayBuilder.ofRef"
});
$c_scm_ArrayBuilder$ofRef.prototype.result__O = (function() {
  return this.result__AO()
});
$c_scm_ArrayBuilder$ofRef.prototype.resize__p2__I__V = (function(size) {
  this.elems$2 = this.mkArray__p2__I__AO(size);
  this.capacity$2 = size
});
$c_scm_ArrayBuilder$ofRef.prototype.$$plus$eq__O__scm_ArrayBuilder$ofRef = (function(elem) {
  this.ensureSize__p2__I__V(((1 + this.size$2) | 0));
  this.elems$2.u[this.size$2] = elem;
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofRef.prototype.result__AO = (function() {
  if (((this.capacity$2 !== 0) && (this.capacity$2 === this.size$2))) {
    this.capacity$2 = 0;
    return this.elems$2
  } else {
    return this.mkArray__p2__I__AO(this.size$2)
  }
});
$c_scm_ArrayBuilder$ofRef.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuilder$ofRef(elem)
});
$c_scm_ArrayBuilder$ofRef.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$2 < size)) {
    this.resize__p2__I__V(size)
  }
});
$c_scm_ArrayBuilder$ofRef.prototype.ensureSize__p2__I__V = (function(size) {
  if (((this.capacity$2 < size) || (this.capacity$2 === 0))) {
    var newsize = ((this.capacity$2 === 0) ? 16 : (this.capacity$2 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p2__I__V(newsize)
  }
});
$c_scm_ArrayBuilder$ofRef.prototype.mkArray__p2__I__AO = (function(size) {
  var newelems = $asArrayOf_O(this.evidence$2$2.newArray__I__O(size), 1);
  if ((this.size$2 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$2, 0, newelems, 0, this.size$2)
  };
  return newelems
});
$c_scm_ArrayBuilder$ofRef.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofRef(xs)
});
function $is_scm_ArrayBuilder$ofRef(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofRef)))
}
function $as_scm_ArrayBuilder$ofRef(obj) {
  return (($is_scm_ArrayBuilder$ofRef(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofRef"))
}
function $isArrayOf_scm_ArrayBuilder$ofRef(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofRef)))
}
function $asArrayOf_scm_ArrayBuilder$ofRef(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofRef(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofRef;", depth))
}
var $d_scm_ArrayBuilder$ofRef = new $TypeData().initClass({
  scm_ArrayBuilder$ofRef: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofRef", {
  scm_ArrayBuilder$ofRef: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofRef.prototype.$classData = $d_scm_ArrayBuilder$ofRef;
/** @constructor */
function $c_sjs_js_JavaScriptException() {
  $c_jl_RuntimeException.call(this);
  this.exception$4 = null
}
$c_sjs_js_JavaScriptException.prototype = new $h_jl_RuntimeException();
$c_sjs_js_JavaScriptException.prototype.constructor = $c_sjs_js_JavaScriptException;
/** @constructor */
function $h_sjs_js_JavaScriptException() {
  /*<skip>*/
}
$h_sjs_js_JavaScriptException.prototype = $c_sjs_js_JavaScriptException.prototype;
$c_sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
$c_sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
$c_sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  var e = this.exception$4;
  this.stackdata = e;
  return this
});
$c_sjs_js_JavaScriptException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_sjs_js_JavaScriptException(x$1)) {
    var JavaScriptException$1 = $as_sjs_js_JavaScriptException(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
  } else {
    return false
  }
});
$c_sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$4;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sjs_js_JavaScriptException.prototype.getMessage__T = (function() {
  return $objectToString(this.exception$4)
});
$c_sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_sjs_js_JavaScriptException.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_sjs_js_JavaScriptException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
}
function $as_sjs_js_JavaScriptException(obj) {
  return (($is_sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
}
function $isArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
}
function $asArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (($isArrayOf_sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
}
var $d_sjs_js_JavaScriptException = new $TypeData().initClass({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
$c_sjs_js_JavaScriptException.prototype.$classData = $d_sjs_js_JavaScriptException;
/** @constructor */
function $c_s_reflect_ManifestFactory$BooleanManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$BooleanManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$BooleanManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$BooleanManifest$.prototype = $c_s_reflect_ManifestFactory$BooleanManifest$.prototype;
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.init___ = (function() {
  this.toString$1 = "Boolean";
  return this
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_Z.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_Z.getClassOf()
});
var $d_s_reflect_ManifestFactory$BooleanManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$BooleanManifest$: 0
}, false, "scala.reflect.ManifestFactory$BooleanManifest$", {
  s_reflect_ManifestFactory$BooleanManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$BooleanManifest$;
var $n_s_reflect_ManifestFactory$BooleanManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$BooleanManifest$() {
  if ((!$n_s_reflect_ManifestFactory$BooleanManifest$)) {
    $n_s_reflect_ManifestFactory$BooleanManifest$ = new $c_s_reflect_ManifestFactory$BooleanManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$BooleanManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ByteManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ByteManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ByteManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ByteManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ByteManifest$.prototype = $c_s_reflect_ManifestFactory$ByteManifest$.prototype;
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.init___ = (function() {
  this.toString$1 = "Byte";
  return this
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_B.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_B.getClassOf()
});
var $d_s_reflect_ManifestFactory$ByteManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ByteManifest$: 0
}, false, "scala.reflect.ManifestFactory$ByteManifest$", {
  s_reflect_ManifestFactory$ByteManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ByteManifest$;
var $n_s_reflect_ManifestFactory$ByteManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ByteManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ByteManifest$)) {
    $n_s_reflect_ManifestFactory$ByteManifest$ = new $c_s_reflect_ManifestFactory$ByteManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ByteManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$CharManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$CharManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$CharManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$CharManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$CharManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$CharManifest$.prototype = $c_s_reflect_ManifestFactory$CharManifest$.prototype;
$c_s_reflect_ManifestFactory$CharManifest$.prototype.init___ = (function() {
  this.toString$1 = "Char";
  return this
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_C.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_C.getClassOf()
});
var $d_s_reflect_ManifestFactory$CharManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$CharManifest$: 0
}, false, "scala.reflect.ManifestFactory$CharManifest$", {
  s_reflect_ManifestFactory$CharManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$CharManifest$;
var $n_s_reflect_ManifestFactory$CharManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$CharManifest$() {
  if ((!$n_s_reflect_ManifestFactory$CharManifest$)) {
    $n_s_reflect_ManifestFactory$CharManifest$ = new $c_s_reflect_ManifestFactory$CharManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$CharManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$DoubleManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$DoubleManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$DoubleManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$DoubleManifest$.prototype = $c_s_reflect_ManifestFactory$DoubleManifest$.prototype;
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.init___ = (function() {
  this.toString$1 = "Double";
  return this
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_D.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_D.getClassOf()
});
var $d_s_reflect_ManifestFactory$DoubleManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$DoubleManifest$: 0
}, false, "scala.reflect.ManifestFactory$DoubleManifest$", {
  s_reflect_ManifestFactory$DoubleManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$DoubleManifest$;
var $n_s_reflect_ManifestFactory$DoubleManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$DoubleManifest$() {
  if ((!$n_s_reflect_ManifestFactory$DoubleManifest$)) {
    $n_s_reflect_ManifestFactory$DoubleManifest$ = new $c_s_reflect_ManifestFactory$DoubleManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$DoubleManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$FloatManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$FloatManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$FloatManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$FloatManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$FloatManifest$.prototype = $c_s_reflect_ManifestFactory$FloatManifest$.prototype;
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.init___ = (function() {
  this.toString$1 = "Float";
  return this
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_F.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_F.getClassOf()
});
var $d_s_reflect_ManifestFactory$FloatManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$FloatManifest$: 0
}, false, "scala.reflect.ManifestFactory$FloatManifest$", {
  s_reflect_ManifestFactory$FloatManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$FloatManifest$;
var $n_s_reflect_ManifestFactory$FloatManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$FloatManifest$() {
  if ((!$n_s_reflect_ManifestFactory$FloatManifest$)) {
    $n_s_reflect_ManifestFactory$FloatManifest$ = new $c_s_reflect_ManifestFactory$FloatManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$FloatManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$IntManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$IntManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$IntManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$IntManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$IntManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$IntManifest$.prototype = $c_s_reflect_ManifestFactory$IntManifest$.prototype;
$c_s_reflect_ManifestFactory$IntManifest$.prototype.init___ = (function() {
  this.toString$1 = "Int";
  return this
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_I.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_I.getClassOf()
});
var $d_s_reflect_ManifestFactory$IntManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$IntManifest$: 0
}, false, "scala.reflect.ManifestFactory$IntManifest$", {
  s_reflect_ManifestFactory$IntManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$IntManifest$;
var $n_s_reflect_ManifestFactory$IntManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$IntManifest$() {
  if ((!$n_s_reflect_ManifestFactory$IntManifest$)) {
    $n_s_reflect_ManifestFactory$IntManifest$ = new $c_s_reflect_ManifestFactory$IntManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$IntManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$LongManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$LongManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$LongManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$LongManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$LongManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$LongManifest$.prototype = $c_s_reflect_ManifestFactory$LongManifest$.prototype;
$c_s_reflect_ManifestFactory$LongManifest$.prototype.init___ = (function() {
  this.toString$1 = "Long";
  return this
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_J.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_J.getClassOf()
});
var $d_s_reflect_ManifestFactory$LongManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$LongManifest$: 0
}, false, "scala.reflect.ManifestFactory$LongManifest$", {
  s_reflect_ManifestFactory$LongManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$LongManifest$;
var $n_s_reflect_ManifestFactory$LongManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$LongManifest$() {
  if ((!$n_s_reflect_ManifestFactory$LongManifest$)) {
    $n_s_reflect_ManifestFactory$LongManifest$ = new $c_s_reflect_ManifestFactory$LongManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$LongManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$PhantomManifest() {
  $c_s_reflect_ManifestFactory$ClassTypeManifest.call(this);
  this.toString$2 = null
}
$c_s_reflect_ManifestFactory$PhantomManifest.prototype = new $h_s_reflect_ManifestFactory$ClassTypeManifest();
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.constructor = $c_s_reflect_ManifestFactory$PhantomManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$PhantomManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$PhantomManifest.prototype = $c_s_reflect_ManifestFactory$PhantomManifest.prototype;
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.toString__T = (function() {
  return this.toString$2
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ShortManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ShortManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ShortManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ShortManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ShortManifest$.prototype = $c_s_reflect_ManifestFactory$ShortManifest$.prototype;
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.init___ = (function() {
  this.toString$1 = "Short";
  return this
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_S.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_S.getClassOf()
});
var $d_s_reflect_ManifestFactory$ShortManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ShortManifest$: 0
}, false, "scala.reflect.ManifestFactory$ShortManifest$", {
  s_reflect_ManifestFactory$ShortManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ShortManifest$;
var $n_s_reflect_ManifestFactory$ShortManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ShortManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ShortManifest$)) {
    $n_s_reflect_ManifestFactory$ShortManifest$ = new $c_s_reflect_ManifestFactory$ShortManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ShortManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$UnitManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$UnitManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$UnitManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$UnitManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$UnitManifest$.prototype = $c_s_reflect_ManifestFactory$UnitManifest$.prototype;
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.init___ = (function() {
  this.toString$1 = "Unit";
  return this
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_sr_BoxedUnit.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_V.getClassOf()
});
var $d_s_reflect_ManifestFactory$UnitManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$UnitManifest$: 0
}, false, "scala.reflect.ManifestFactory$UnitManifest$", {
  s_reflect_ManifestFactory$UnitManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$UnitManifest$;
var $n_s_reflect_ManifestFactory$UnitManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$UnitManifest$() {
  if ((!$n_s_reflect_ManifestFactory$UnitManifest$)) {
    $n_s_reflect_ManifestFactory$UnitManifest$ = new $c_s_reflect_ManifestFactory$UnitManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$UnitManifest$
}
function $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that) {
  var these = $thiz.iterator__sc_Iterator();
  var those = that.iterator__sc_Iterator();
  while ((these.hasNext__Z() && those.hasNext__Z())) {
    if ((!$m_sr_BoxesRunTime$().equals__O__O__Z(these.next__O(), those.next__O()))) {
      return false
    }
  };
  return ((!these.hasNext__Z()) && (!those.hasNext__Z()))
}
function $f_sc_IterableLike__take__I__O($thiz, n) {
  var b = $thiz.newBuilder__scm_Builder();
  if ((n <= 0)) {
    return b.result__O()
  } else {
    b.sizeHintBounded__I__sc_TraversableLike__V(n, $thiz);
    var i = 0;
    var it = $thiz.iterator__sc_Iterator();
    while (((i < n) && it.hasNext__Z())) {
      b.$$plus$eq__O__scm_Builder(it.next__O());
      i = ((1 + i) | 0)
    };
    return b.result__O()
  }
}
function $f_sc_IterableLike__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var i = start;
  var x = ((start + len) | 0);
  var that = $m_sr_ScalaRunTime$().array$undlength__O__I(xs);
  var end = ((x < that) ? x : that);
  var it = $thiz.iterator__sc_Iterator();
  while (((i < end) && it.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  }
}
/** @constructor */
function $c_sci_List$() {
  $c_scg_SeqFactory.call(this);
  this.partialNotApplied$5 = null
}
$c_sci_List$.prototype = new $h_scg_SeqFactory();
$c_sci_List$.prototype.constructor = $c_sci_List$;
/** @constructor */
function $h_sci_List$() {
  /*<skip>*/
}
$h_sci_List$.prototype = $c_sci_List$.prototype;
$c_sci_List$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sci_List$ = this;
  this.partialNotApplied$5 = new $c_sci_List$$anon$1().init___();
  return this
});
$c_sci_List$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_List$ = new $TypeData().initClass({
  sci_List$: 0
}, false, "scala.collection.immutable.List$", {
  sci_List$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_List$.prototype.$classData = $d_sci_List$;
var $n_sci_List$ = (void 0);
function $m_sci_List$() {
  if ((!$n_sci_List$)) {
    $n_sci_List$ = new $c_sci_List$().init___()
  };
  return $n_sci_List$
}
/** @constructor */
function $c_sci_Stream$() {
  $c_scg_SeqFactory.call(this)
}
$c_sci_Stream$.prototype = new $h_scg_SeqFactory();
$c_sci_Stream$.prototype.constructor = $c_sci_Stream$;
/** @constructor */
function $h_sci_Stream$() {
  /*<skip>*/
}
$h_sci_Stream$.prototype = $c_sci_Stream$.prototype;
$c_sci_Stream$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Stream$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_Stream$StreamBuilder().init___()
});
var $d_sci_Stream$ = new $TypeData().initClass({
  sci_Stream$: 0
}, false, "scala.collection.immutable.Stream$", {
  sci_Stream$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$.prototype.$classData = $d_sci_Stream$;
var $n_sci_Stream$ = (void 0);
function $m_sci_Stream$() {
  if ((!$n_sci_Stream$)) {
    $n_sci_Stream$ = new $c_sci_Stream$().init___()
  };
  return $n_sci_Stream$
}
/** @constructor */
function $c_scm_ArrayBuffer$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_ArrayBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ArrayBuffer$.prototype.constructor = $c_scm_ArrayBuffer$;
/** @constructor */
function $h_scm_ArrayBuffer$() {
  /*<skip>*/
}
$h_scm_ArrayBuffer$.prototype = $c_scm_ArrayBuffer$.prototype;
$c_scm_ArrayBuffer$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_ArrayBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_ArrayBuffer$ = new $TypeData().initClass({
  scm_ArrayBuffer$: 0
}, false, "scala.collection.mutable.ArrayBuffer$", {
  scm_ArrayBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer$.prototype.$classData = $d_scm_ArrayBuffer$;
var $n_scm_ArrayBuffer$ = (void 0);
function $m_scm_ArrayBuffer$() {
  if ((!$n_scm_ArrayBuffer$)) {
    $n_scm_ArrayBuffer$ = new $c_scm_ArrayBuffer$().init___()
  };
  return $n_scm_ArrayBuffer$
}
/** @constructor */
function $c_scm_LinkedList$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_LinkedList$.prototype = new $h_scg_SeqFactory();
$c_scm_LinkedList$.prototype.constructor = $c_scm_LinkedList$;
/** @constructor */
function $h_scm_LinkedList$() {
  /*<skip>*/
}
$h_scm_LinkedList$.prototype = $c_scm_LinkedList$.prototype;
$c_scm_LinkedList$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_LinkedList$.prototype.newBuilder__scm_Builder = (function() {
  var this$1 = new $c_scm_MutableList().init___();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(l$2) {
      var l = $as_scm_MutableList(l$2);
      return l.first0$5
    })
  })(this));
  return new $c_scm_Builder$$anon$1().init___scm_Builder__F1(this$1, f)
});
var $d_scm_LinkedList$ = new $TypeData().initClass({
  scm_LinkedList$: 0
}, false, "scala.collection.mutable.LinkedList$", {
  scm_LinkedList$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_LinkedList$.prototype.$classData = $d_scm_LinkedList$;
var $n_scm_LinkedList$ = (void 0);
function $m_scm_LinkedList$() {
  if ((!$n_scm_LinkedList$)) {
    $n_scm_LinkedList$ = new $c_scm_LinkedList$().init___()
  };
  return $n_scm_LinkedList$
}
/** @constructor */
function $c_scm_ListBuffer$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_ListBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ListBuffer$.prototype.constructor = $c_scm_ListBuffer$;
/** @constructor */
function $h_scm_ListBuffer$() {
  /*<skip>*/
}
$h_scm_ListBuffer$.prototype = $c_scm_ListBuffer$.prototype;
$c_scm_ListBuffer$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_ListBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_ListBuffer().init___())
});
var $d_scm_ListBuffer$ = new $TypeData().initClass({
  scm_ListBuffer$: 0
}, false, "scala.collection.mutable.ListBuffer$", {
  scm_ListBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer$.prototype.$classData = $d_scm_ListBuffer$;
var $n_scm_ListBuffer$ = (void 0);
function $m_scm_ListBuffer$() {
  if ((!$n_scm_ListBuffer$)) {
    $n_scm_ListBuffer$ = new $c_scm_ListBuffer$().init___()
  };
  return $n_scm_ListBuffer$
}
/** @constructor */
function $c_scm_MutableList$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_MutableList$.prototype = new $h_scg_SeqFactory();
$c_scm_MutableList$.prototype.constructor = $c_scm_MutableList$;
/** @constructor */
function $h_scm_MutableList$() {
  /*<skip>*/
}
$h_scm_MutableList$.prototype = $c_scm_MutableList$.prototype;
$c_scm_MutableList$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_MutableList$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_MutableList().init___()
});
var $d_scm_MutableList$ = new $TypeData().initClass({
  scm_MutableList$: 0
}, false, "scala.collection.mutable.MutableList$", {
  scm_MutableList$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_MutableList$.prototype.$classData = $d_scm_MutableList$;
var $n_scm_MutableList$ = (void 0);
function $m_scm_MutableList$() {
  if ((!$n_scm_MutableList$)) {
    $n_scm_MutableList$ = new $c_scm_MutableList$().init___()
  };
  return $n_scm_MutableList$
}
/** @constructor */
function $c_scm_Queue$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_Queue$.prototype = new $h_scg_SeqFactory();
$c_scm_Queue$.prototype.constructor = $c_scm_Queue$;
/** @constructor */
function $h_scm_Queue$() {
  /*<skip>*/
}
$h_scm_Queue$.prototype = $c_scm_Queue$.prototype;
$c_scm_Queue$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_Queue$.prototype.newBuilder__scm_Builder = (function() {
  var this$1 = new $c_scm_MutableList().init___();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$1$2) {
      var x$1 = $as_scm_MutableList(x$1$2);
      return new $c_scm_Queue().init___scm_LinkedList__scm_LinkedList__I(x$1.first0$5, x$1.last0$5, x$1.len$5)
    })
  })(this));
  return new $c_scm_Builder$$anon$1().init___scm_Builder__F1(this$1, f)
});
var $d_scm_Queue$ = new $TypeData().initClass({
  scm_Queue$: 0
}, false, "scala.collection.mutable.Queue$", {
  scm_Queue$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_Queue$.prototype.$classData = $d_scm_Queue$;
var $n_scm_Queue$ = (void 0);
function $m_scm_Queue$() {
  if ((!$n_scm_Queue$)) {
    $n_scm_Queue$ = new $c_scm_Queue$().init___()
  };
  return $n_scm_Queue$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$AnyManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$AnyManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$AnyManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$AnyManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$AnyManifest$.prototype = $c_s_reflect_ManifestFactory$AnyManifest$.prototype;
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.init___ = (function() {
  this.toString$2 = "Any";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_O.getClassOf()
});
var $d_s_reflect_ManifestFactory$AnyManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyManifest$", {
  s_reflect_ManifestFactory$AnyManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyManifest$;
var $n_s_reflect_ManifestFactory$AnyManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$AnyManifest$() {
  if ((!$n_s_reflect_ManifestFactory$AnyManifest$)) {
    $n_s_reflect_ManifestFactory$AnyManifest$ = new $c_s_reflect_ManifestFactory$AnyManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$AnyValManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$AnyValManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$AnyValManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$AnyValManifest$.prototype = $c_s_reflect_ManifestFactory$AnyValManifest$.prototype;
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.init___ = (function() {
  this.toString$2 = "AnyVal";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_O.getClassOf()
});
var $d_s_reflect_ManifestFactory$AnyValManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyValManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyValManifest$", {
  s_reflect_ManifestFactory$AnyValManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyValManifest$;
var $n_s_reflect_ManifestFactory$AnyValManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$AnyValManifest$() {
  if ((!$n_s_reflect_ManifestFactory$AnyValManifest$)) {
    $n_s_reflect_ManifestFactory$AnyValManifest$ = new $c_s_reflect_ManifestFactory$AnyValManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyValManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NothingManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NothingManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NothingManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NothingManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NothingManifest$.prototype = $c_s_reflect_ManifestFactory$NothingManifest$.prototype;
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.init___ = (function() {
  this.toString$2 = "Nothing";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Nothing$.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_sr_Nothing$.getClassOf()
});
var $d_s_reflect_ManifestFactory$NothingManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NothingManifest$: 0
}, false, "scala.reflect.ManifestFactory$NothingManifest$", {
  s_reflect_ManifestFactory$NothingManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NothingManifest$;
var $n_s_reflect_ManifestFactory$NothingManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NothingManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NothingManifest$)) {
    $n_s_reflect_ManifestFactory$NothingManifest$ = new $c_s_reflect_ManifestFactory$NothingManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NothingManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NullManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NullManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NullManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NullManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NullManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NullManifest$.prototype = $c_s_reflect_ManifestFactory$NullManifest$.prototype;
$c_s_reflect_ManifestFactory$NullManifest$.prototype.init___ = (function() {
  this.toString$2 = "Null";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Null$.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_sr_Null$.getClassOf()
});
var $d_s_reflect_ManifestFactory$NullManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NullManifest$: 0
}, false, "scala.reflect.ManifestFactory$NullManifest$", {
  s_reflect_ManifestFactory$NullManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NullManifest$;
var $n_s_reflect_ManifestFactory$NullManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NullManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NullManifest$)) {
    $n_s_reflect_ManifestFactory$NullManifest$ = new $c_s_reflect_ManifestFactory$NullManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NullManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ObjectManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ObjectManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ObjectManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ObjectManifest$.prototype = $c_s_reflect_ManifestFactory$ObjectManifest$.prototype;
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.init___ = (function() {
  this.toString$2 = "Object";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_O.getClassOf()
});
var $d_s_reflect_ManifestFactory$ObjectManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ObjectManifest$: 0
}, false, "scala.reflect.ManifestFactory$ObjectManifest$", {
  s_reflect_ManifestFactory$ObjectManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ObjectManifest$;
var $n_s_reflect_ManifestFactory$ObjectManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ObjectManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ObjectManifest$)) {
    $n_s_reflect_ManifestFactory$ObjectManifest$ = new $c_s_reflect_ManifestFactory$ObjectManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ObjectManifest$
}
function $is_sc_GenSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSeq)))
}
function $as_sc_GenSeq(obj) {
  return (($is_sc_GenSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSeq"))
}
function $isArrayOf_sc_GenSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSeq)))
}
function $asArrayOf_sc_GenSeq(obj, depth) {
  return (($isArrayOf_sc_GenSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSeq;", depth))
}
/** @constructor */
function $c_sci_Vector$() {
  $c_scg_IndexedSeqFactory.call(this);
  this.NIL$6 = null
}
$c_sci_Vector$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_Vector$.prototype.constructor = $c_sci_Vector$;
/** @constructor */
function $h_sci_Vector$() {
  /*<skip>*/
}
$h_sci_Vector$.prototype = $c_sci_Vector$.prototype;
$c_sci_Vector$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sci_Vector$ = this;
  this.NIL$6 = new $c_sci_Vector().init___I__I__I(0, 0, 0);
  return this
});
$c_sci_Vector$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_Vector$ = new $TypeData().initClass({
  sci_Vector$: 0
}, false, "scala.collection.immutable.Vector$", {
  sci_Vector$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector$.prototype.$classData = $d_sci_Vector$;
var $n_sci_Vector$ = (void 0);
function $m_sci_Vector$() {
  if ((!$n_sci_Vector$)) {
    $n_sci_Vector$ = new $c_sci_Vector$().init___()
  };
  return $n_sci_Vector$
}
/** @constructor */
function $c_sc_AbstractTraversable() {
  $c_O.call(this)
}
$c_sc_AbstractTraversable.prototype = new $h_O();
$c_sc_AbstractTraversable.prototype.constructor = $c_sc_AbstractTraversable;
/** @constructor */
function $h_sc_AbstractTraversable() {
  /*<skip>*/
}
$h_sc_AbstractTraversable.prototype = $c_sc_AbstractTraversable.prototype;
$c_sc_AbstractTraversable.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.sizeHintIfCheap__I = (function() {
  return (-1)
});
$c_sc_AbstractTraversable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.repr__O = (function() {
  return this
});
$c_sc_AbstractTraversable.prototype.nonEmpty__Z = (function() {
  return $f_sc_TraversableOnce__nonEmpty__Z(this)
});
$c_sc_AbstractTraversable.prototype.newBuilder__scm_Builder = (function() {
  return this.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_sc_AbstractTraversable.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $f_sc_SeqLike__lengthCompare__I__I($thiz, len) {
  if ((len < 0)) {
    return 1
  } else {
    var i = 0;
    var it = $thiz.iterator__sc_Iterator();
    while (it.hasNext__Z()) {
      if ((i === len)) {
        return (it.hasNext__Z() ? 1 : 0)
      };
      it.next__O();
      i = ((1 + i) | 0)
    };
    return ((i - len) | 0)
  }
}
function $f_sc_SeqLike__isEmpty__Z($thiz) {
  return ($thiz.lengthCompare__I__I(0) === 0)
}
function $is_sc_GenSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSet)))
}
function $as_sc_GenSet(obj) {
  return (($is_sc_GenSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSet"))
}
function $isArrayOf_sc_GenSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSet)))
}
function $asArrayOf_sc_GenSet(obj, depth) {
  return (($isArrayOf_sc_GenSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSet;", depth))
}
function $is_sc_IndexedSeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike)))
}
function $as_sc_IndexedSeqLike(obj) {
  return (($is_sc_IndexedSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeqLike"))
}
function $isArrayOf_sc_IndexedSeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike)))
}
function $asArrayOf_sc_IndexedSeqLike(obj, depth) {
  return (($isArrayOf_sc_IndexedSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeqLike;", depth))
}
function $is_sc_LinearSeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqLike)))
}
function $as_sc_LinearSeqLike(obj) {
  return (($is_sc_LinearSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqLike"))
}
function $isArrayOf_sc_LinearSeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqLike)))
}
function $asArrayOf_sc_LinearSeqLike(obj, depth) {
  return (($isArrayOf_sc_LinearSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqLike;", depth))
}
function $f_sc_IndexedSeqOptimized__head__O($thiz) {
  return ($f_sc_IndexedSeqOptimized__isEmpty__Z($thiz) ? new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I($thiz, 0, $thiz.length__I()).next__O() : $thiz.apply__I__O(0))
}
function $f_sc_IndexedSeqOptimized__lengthCompare__I__I($thiz, len) {
  return (($thiz.length__I() - len) | 0)
}
function $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z($thiz, that) {
  if ($is_sc_IndexedSeq(that)) {
    var x2 = $as_sc_IndexedSeq(that);
    var len = $thiz.length__I();
    if ((len === x2.length__I())) {
      var i = 0;
      while (((i < len) && $m_sr_BoxesRunTime$().equals__O__O__Z($thiz.apply__I__O(i), x2.apply__I__O(i)))) {
        i = ((1 + i) | 0)
      };
      return (i === len)
    } else {
      return false
    }
  } else {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that)
  }
}
function $f_sc_IndexedSeqOptimized__isEmpty__Z($thiz) {
  return ($thiz.length__I() === 0)
}
function $f_sc_IndexedSeqOptimized__foreach__F1__V($thiz, f) {
  var i = 0;
  var len = $thiz.length__I();
  while ((i < len)) {
    f.apply__O__O($thiz.apply__I__O(i));
    i = ((1 + i) | 0)
  }
}
function $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var i = 0;
  var j = start;
  var x = $thiz.length__I();
  var x$1 = ((x < len) ? x : len);
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = ((x$1 < that) ? x$1 : that);
  while ((i < end)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, j, $thiz.apply__I__O(i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
}
function $f_sc_LinearSeqOptimized__lengthCompare__I__I($thiz, len) {
  if ((len < 0)) {
    return 1
  } else {
    var i = 0;
    var xs = $thiz;
    return $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($thiz, i, xs, len)
  }
}
function $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z($thiz, that) {
  if ($is_sc_LinearSeq(that)) {
    var x2 = $as_sc_LinearSeq(that);
    if (($thiz === x2)) {
      return true
    } else {
      var these = $thiz;
      var those = x2;
      while ((((!these.isEmpty__Z()) && (!those.isEmpty__Z())) && $m_sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), those.head__O()))) {
        these = $as_sc_LinearSeqOptimized(these.tail__O());
        those = $as_sc_LinearSeq(those.tail__O())
      };
      return (these.isEmpty__Z() && those.isEmpty__Z())
    }
  } else {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that)
  }
}
function $f_sc_LinearSeqOptimized__apply__I__O($thiz, n) {
  var rest = $thiz.drop__I__sc_LinearSeqOptimized(n);
  if (((n < 0) || rest.isEmpty__Z())) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  return rest.head__O()
}
function $f_sc_LinearSeqOptimized__drop__I__sc_LinearSeqOptimized($thiz, n) {
  var these = $thiz;
  var count = n;
  while (((!these.isEmpty__Z()) && (count > 0))) {
    these = $as_sc_LinearSeqOptimized(these.tail__O());
    count = (((-1) + count) | 0)
  };
  return these
}
function $f_sc_LinearSeqOptimized__foreach__F1__V($thiz, f) {
  var these = $thiz;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  }
}
function $f_sc_LinearSeqOptimized__length__I($thiz) {
  var these = $thiz;
  var len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return len
}
function $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($thiz, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      var temp$i = ((1 + i) | 0);
      var temp$xs = $as_sc_LinearSeqOptimized(xs.tail__O());
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
}
function $is_sc_LinearSeqOptimized(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqOptimized)))
}
function $as_sc_LinearSeqOptimized(obj) {
  return (($is_sc_LinearSeqOptimized(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqOptimized"))
}
function $isArrayOf_sc_LinearSeqOptimized(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqOptimized)))
}
function $asArrayOf_sc_LinearSeqOptimized(obj, depth) {
  return (($isArrayOf_sc_LinearSeqOptimized(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqOptimized;", depth))
}
function $f_sc_SetLike__isEmpty__Z($thiz) {
  return ($thiz.size__I() === 0)
}
function $f_sci_StringLike__escape__psci_StringLike__C__T($thiz, ch) {
  return (((((ch >= 97) && (ch <= 122)) || ((ch >= 65) && (ch <= 90))) || ((ch >= 48) && (ch <= 57))) ? $as_T($g.String.fromCharCode(($m_sjs_js_Any$(), ch))) : ("\\" + new $c_jl_Character().init___C(ch)))
}
function $f_sci_StringLike__split__C__AT($thiz, separator) {
  var thiz = $thiz.toString__T();
  var regex = $f_sci_StringLike__escape__psci_StringLike__C__T($thiz, separator);
  return $m_sjsr_RuntimeString$().split__T__T__I__AT(thiz, regex, 0)
}
function $f_scm_LinkedListLike__head__O($thiz) {
  if ($f_scm_LinkedListLike__isEmpty__Z($thiz)) {
    throw new $c_ju_NoSuchElementException().init___()
  } else {
    return $thiz.elem$5
  }
}
function $f_scm_LinkedListLike__apply__I__O($thiz, n) {
  var loc = $f_scm_LinkedListLike__drop__I__scm_Seq($thiz, n);
  if (loc.nonEmpty__Z()) {
    return $as_scm_LinkedListLike(loc).elem$5
  } else {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  }
}
function $f_scm_LinkedListLike__isEmpty__Z($thiz) {
  return ($thiz.next$5 === $thiz)
}
function $f_scm_LinkedListLike__length0__pscm_LinkedListLike__scm_Seq__I__I($thiz, elem, acc) {
  _length0: while (true) {
    var this$1 = $as_scm_LinkedListLike(elem);
    if ($f_scm_LinkedListLike__isEmpty__Z(this$1)) {
      return acc
    } else {
      var this$2 = $as_scm_LinkedListLike(elem);
      var temp$elem = this$2.next$5;
      var temp$acc = ((1 + acc) | 0);
      elem = temp$elem;
      acc = temp$acc;
      continue _length0
    }
  }
}
function $f_scm_LinkedListLike__foreach__F1__V($thiz, f) {
  var these = $thiz;
  while (true) {
    var this$1 = these;
    if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
      f.apply__O__O(these.elem$5);
      var this$2 = these;
      these = this$2.next$5
    } else {
      break
    }
  }
}
function $f_scm_LinkedListLike__tail__scm_Seq($thiz) {
  var requirement = $f_sc_TraversableOnce__nonEmpty__Z($thiz);
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed: tail of empty list")
  };
  return $thiz.next$5
}
function $f_scm_LinkedListLike__drop__I__scm_Seq($thiz, n) {
  var i = 0;
  var these = $as_scm_Seq($thiz);
  while (true) {
    if ((i < n)) {
      var this$1 = $as_scm_LinkedListLike(these);
      var jsx$1 = (!$f_scm_LinkedListLike__isEmpty__Z(this$1))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var this$2 = $as_scm_LinkedListLike(these);
      these = this$2.next$5;
      i = ((1 + i) | 0)
    } else {
      break
    }
  };
  return these
}
function $is_scm_LinkedListLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_LinkedListLike)))
}
function $as_scm_LinkedListLike(obj) {
  return (($is_scm_LinkedListLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.LinkedListLike"))
}
function $isArrayOf_scm_LinkedListLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_LinkedListLike)))
}
function $asArrayOf_scm_LinkedListLike(obj, depth) {
  return (($isArrayOf_scm_LinkedListLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.LinkedListLike;", depth))
}
function $f_Lsgl_html5_Html5App__main__Lorg_scalajs_dom_raw_HTMLCanvasElement__V($thiz, canvas) {
  $thiz.canvas$1 = canvas;
  $thiz.theme$1.init__Lorg_scalajs_dom_raw_HTMLCanvasElement__V(canvas);
  $f_Lsgl_html5_Html5InputProvider__registerInputListeners__V($thiz);
  $f_Lsgl_html5_Html5GameLoopProvider__startGameLoop__V($thiz)
}
/** @constructor */
function $c_sc_AbstractIterable() {
  $c_sc_AbstractTraversable.call(this)
}
$c_sc_AbstractIterable.prototype = new $h_sc_AbstractTraversable();
$c_sc_AbstractIterable.prototype.constructor = $c_sc_AbstractIterable;
/** @constructor */
function $h_sc_AbstractIterable() {
  /*<skip>*/
}
$h_sc_AbstractIterable.prototype = $c_sc_AbstractIterable.prototype;
$c_sc_AbstractIterable.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IterableLike__sameElements__sc_GenIterable__Z(this, that)
});
$c_sc_AbstractIterable.prototype.forall__F1__Z = (function(p) {
  var this$1 = this.iterator__sc_Iterator();
  return $f_sc_Iterator__forall__F1__Z(this$1, p)
});
$c_sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.iterator__sc_Iterator();
  $f_sc_Iterator__foreach__F1__V(this$1, f)
});
$c_sc_AbstractIterable.prototype.toStream__sci_Stream = (function() {
  return this.iterator__sc_Iterator().toStream__sci_Stream()
});
$c_sc_AbstractIterable.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IterableLike__copyToArray__O__I__I__V(this, xs, start, len)
});
function $is_sc_AbstractIterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_AbstractIterable)))
}
function $as_sc_AbstractIterable(obj) {
  return (($is_sc_AbstractIterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.AbstractIterable"))
}
function $isArrayOf_sc_AbstractIterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_AbstractIterable)))
}
function $asArrayOf_sc_AbstractIterable(obj, depth) {
  return (($isArrayOf_sc_AbstractIterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.AbstractIterable;", depth))
}
function $is_sci_Iterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Iterable)))
}
function $as_sci_Iterable(obj) {
  return (($is_sci_Iterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Iterable"))
}
function $isArrayOf_sci_Iterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Iterable)))
}
function $asArrayOf_sci_Iterable(obj, depth) {
  return (($isArrayOf_sci_Iterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Iterable;", depth))
}
var $d_sci_Iterable = new $TypeData().initClass({
  sci_Iterable: 0
}, true, "scala.collection.immutable.Iterable", {
  sci_Iterable: 1,
  sci_Traversable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  s_Immutable: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1
});
/** @constructor */
function $c_sci_StringOps() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_sci_StringOps.prototype = new $h_O();
$c_sci_StringOps.prototype.constructor = $c_sci_StringOps;
/** @constructor */
function $h_sci_StringOps() {
  /*<skip>*/
}
$h_sci_StringOps.prototype = $c_sci_StringOps.prototype;
$c_sci_StringOps.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_sci_WrappedString().init___T($$this)
});
$c_sci_StringOps.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  var c = (65535 & $uI($$this.charCodeAt(idx)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_StringOps.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_StringOps.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_StringOps.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sci_StringOps.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_sci_WrappedString().init___T($$this)
});
$c_sci_StringOps.prototype.equals__O__Z = (function(x$1) {
  return $m_sci_StringOps$().equals$extension__T__O__Z(this.repr$1, x$1)
});
$c_sci_StringOps.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sci_StringOps.prototype.toString__T = (function() {
  var $$this = this.repr$1;
  return $$this
});
$c_sci_StringOps.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sci_StringOps.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI($$this.length))
});
$c_sci_StringOps.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $uI($$this.length)
});
$c_sci_StringOps.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $uI($$this.length)
});
$c_sci_StringOps.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI($$this.length));
  return $f_sc_Iterator__toStream__sci_Stream(this$3)
});
$c_sci_StringOps.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sci_StringOps.prototype.repr__O = (function() {
  return this.repr$1
});
$c_sci_StringOps.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sci_StringOps.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $m_sjsr_RuntimeString$().hashCode__T__I($$this)
});
$c_sci_StringOps.prototype.init___T = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_sci_StringOps.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_StringBuilder().init___()
});
$c_sci_StringOps.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_sci_StringOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_StringOps)))
}
function $as_sci_StringOps(obj) {
  return (($is_sci_StringOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.StringOps"))
}
function $isArrayOf_sci_StringOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_StringOps)))
}
function $asArrayOf_sci_StringOps(obj, depth) {
  return (($isArrayOf_sci_StringOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.StringOps;", depth))
}
var $d_sci_StringOps = new $TypeData().initClass({
  sci_StringOps: 0
}, false, "scala.collection.immutable.StringOps", {
  sci_StringOps: 1,
  O: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_sci_StringOps.prototype.$classData = $d_sci_StringOps;
function $f_scm_ArrayOps__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var that = $thiz.repr$1.u.length;
  var x = ((len < that) ? len : that);
  var that$1 = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var l = ((x < that$1) ? x : that$1);
  if ((l > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V($thiz.repr$1, 0, xs, start, l)
  }
}
/** @constructor */
function $c_scm_ArrayOps$ofRef() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofRef.prototype = new $h_O();
$c_scm_ArrayOps$ofRef.prototype.constructor = $c_scm_ArrayOps$ofRef;
/** @constructor */
function $h_scm_ArrayOps$ofRef() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofRef.prototype = $c_scm_ArrayOps$ofRef.prototype;
$c_scm_ArrayOps$ofRef.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofRef().init___AO($$this)
});
$c_scm_ArrayOps$ofRef.prototype.apply__I__O = (function(index) {
  var $$this = this.repr$1;
  return $$this.u[index]
});
$c_scm_ArrayOps$ofRef.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofRef.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofRef.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofRef.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofRef().init___AO($$this)
});
$c_scm_ArrayOps$ofRef.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofRef$().equals$extension__AO__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofRef.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofRef.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofRef.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofRef.prototype.init___AO = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofRef.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofRef.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofRef.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofRef.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofRef.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofRef.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofRef.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofRef.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofRef.prototype.newBuilder__scm_Builder = (function() {
  var $$this = this.repr$1;
  return new $c_scm_ArrayBuilder$ofRef().init___s_reflect_ClassTag($m_s_reflect_ClassTag$().apply__jl_Class__s_reflect_ClassTag($objectGetClass($$this).getComponentType__jl_Class()))
});
$c_scm_ArrayOps$ofRef.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofRef(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofRef)))
}
function $as_scm_ArrayOps$ofRef(obj) {
  return (($is_scm_ArrayOps$ofRef(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofRef"))
}
function $isArrayOf_scm_ArrayOps$ofRef(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofRef)))
}
function $asArrayOf_scm_ArrayOps$ofRef(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofRef(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofRef;", depth))
}
var $d_scm_ArrayOps$ofRef = new $TypeData().initClass({
  scm_ArrayOps$ofRef: 0
}, false, "scala.collection.mutable.ArrayOps$ofRef", {
  scm_ArrayOps$ofRef: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofRef.prototype.$classData = $d_scm_ArrayOps$ofRef;
function $is_sc_Set(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Set)))
}
function $as_sc_Set(obj) {
  return (($is_sc_Set(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Set"))
}
function $isArrayOf_sc_Set(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Set)))
}
function $asArrayOf_sc_Set(obj, depth) {
  return (($isArrayOf_sc_Set(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Set;", depth))
}
function $is_sc_IndexedSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
}
function $as_sc_IndexedSeq(obj) {
  return (($is_sc_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeq"))
}
function $isArrayOf_sc_IndexedSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
}
function $asArrayOf_sc_IndexedSeq(obj, depth) {
  return (($isArrayOf_sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth))
}
function $is_sc_LinearSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
}
function $as_sc_LinearSeq(obj) {
  return (($is_sc_LinearSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeq"))
}
function $isArrayOf_sc_LinearSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
}
function $asArrayOf_sc_LinearSeq(obj, depth) {
  return (($isArrayOf_sc_LinearSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth))
}
/** @constructor */
function $c_sc_AbstractSeq() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSeq.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSeq.prototype.constructor = $c_sc_AbstractSeq;
/** @constructor */
function $h_sc_AbstractSeq() {
  /*<skip>*/
}
$h_sc_AbstractSeq.prototype = $c_sc_AbstractSeq.prototype;
$c_sc_AbstractSeq.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_SeqLike__lengthCompare__I__I(this, len)
});
$c_sc_AbstractSeq.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenSeqLike__equals__O__Z(this, that)
});
$c_sc_AbstractSeq.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqLike__isEmpty__Z(this)
});
$c_sc_AbstractSeq.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sc_AbstractSeq.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_Seq())
});
/** @constructor */
function $c_Lcom_regblanc_scalavator_html5_Main$() {
  $c_O.call(this);
  this.theme$1 = null;
  this.InputHelpers$module$1 = null;
  this.Inputs$module$1 = null;
  this.SceneGroup$module$1 = null;
  this.SilentLogger$module$1 = null;
  this.logger$1 = null;
  this.CanvasDimension$1 = null;
  this.Html5Bitmap$module$1 = null;
  this.Font$1 = null;
  this.Html5FontCompanion$module$1 = null;
  this.Html5Font$module$1 = null;
  this.Html5ColorCompanion$module$1 = null;
  this.Color$1 = null;
  this.Html5Paint$module$1 = null;
  this.Html5Canvas$module$1 = null;
  this.canvas$1 = null;
  this.Html5TextLayout$module$1 = null;
  this.gameState$1 = null;
  this.Logger$module$1 = null;
  this.Fps$1 = null;
  this.FramePeriod$1 = null;
  this.Input$module$1 = null;
  this.Alignments$module$1 = null;
  this.BitmapRegion$module$1 = null;
  this.Animation$module$1 = null;
  this.bitmap$0$1 = false
}
$c_Lcom_regblanc_scalavator_html5_Main$.prototype = new $h_O();
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.constructor = $c_Lcom_regblanc_scalavator_html5_Main$;
/** @constructor */
function $h_Lcom_regblanc_scalavator_html5_Main$() {
  /*<skip>*/
}
$h_Lcom_regblanc_scalavator_html5_Main$.prototype = $c_Lcom_regblanc_scalavator_html5_Main$.prototype;
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Animation__Lsgl_GraphicsHelpersComponent$Animation$ = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Animation$module$1 === null)) {
    this.Animation$lzycompute$1__p1__V()
  };
  return $m_Lcom_regblanc_scalavator_html5_Main$().Animation$module$1
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.init___ = (function() {
  $n_Lcom_regblanc_scalavator_html5_Main$ = this;
  $f_Lsgl_GameLoopProvider__$$init$__V(this);
  $f_Lsgl_GameStateComponent__$$init$__V(this);
  $f_Lsgl_html5_Html5GraphicsProvider__$$init$__V(this);
  this.CanvasDimension$1 = $m_s_None$();
  this.logger$1 = this.SilentLogger__Lsgl_util_NoLoggingProvider$SilentLogger$();
  this.theme$1 = new $c_Lcom_regblanc_scalavator_html5_Main$$anon$1().init___();
  return this
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Input$lzycompute$1__p1__V = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Input$module$1 === null)) {
    $m_Lcom_regblanc_scalavator_html5_Main$().Input$module$1 = new $c_Lsgl_InputProvider$Input$().init___Lsgl_InputProvider(this)
  }
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Html5ColorCompanion$lzycompute$1__p1__V = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Html5ColorCompanion$module$1 === null)) {
    $m_Lcom_regblanc_scalavator_html5_Main$().Html5ColorCompanion$module$1 = new $c_Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$().init___Lsgl_html5_Html5GraphicsProvider(this)
  }
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.SilentLogger$lzycompute$1__p1__V = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().SilentLogger$module$1 === null)) {
    $m_Lcom_regblanc_scalavator_html5_Main$().SilentLogger$module$1 = new $c_Lsgl_util_NoLoggingProvider$SilentLogger$().init___Lsgl_util_NoLoggingProvider(this)
  }
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.$$js$exported$meth$main__Lorg_scalajs_dom_raw_HTMLCanvasElement__O = (function(canvas) {
  $f_Lsgl_html5_Html5App__main__Lorg_scalajs_dom_raw_HTMLCanvasElement__V(this, canvas)
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Html5FontCompanion$lzycompute$1__p1__V = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Html5FontCompanion$module$1 === null)) {
    $m_Lcom_regblanc_scalavator_html5_Main$().Html5FontCompanion$module$1 = new $c_Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$().init___Lsgl_html5_Html5GraphicsProvider(this)
  }
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Html5FontCompanion__Lsgl_html5_Html5GraphicsProvider$Html5FontCompanion$ = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Html5FontCompanion$module$1 === null)) {
    this.Html5FontCompanion$lzycompute$1__p1__V()
  };
  return $m_Lcom_regblanc_scalavator_html5_Main$().Html5FontCompanion$module$1
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Alignments$lzycompute$1__p1__V = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Alignments$module$1 === null)) {
    $m_Lcom_regblanc_scalavator_html5_Main$().Alignments$module$1 = new $c_Lsgl_GraphicsProvider$Alignments$().init___Lsgl_GraphicsProvider(this)
  }
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Alignments__Lsgl_GraphicsProvider$Alignments$ = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Alignments$module$1 === null)) {
    this.Alignments$lzycompute$1__p1__V()
  };
  return $m_Lcom_regblanc_scalavator_html5_Main$().Alignments$module$1
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Animation$lzycompute$1__p1__V = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Animation$module$1 === null)) {
    $m_Lcom_regblanc_scalavator_html5_Main$().Animation$module$1 = new $c_Lsgl_GraphicsHelpersComponent$Animation$().init___Lsgl_GraphicsProvider(this)
  }
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Input__Lsgl_InputProvider$Input$ = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Input$module$1 === null)) {
    this.Input$lzycompute$1__p1__V()
  };
  return $m_Lcom_regblanc_scalavator_html5_Main$().Input$module$1
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Logger__Lsgl_util_LoggingProvider$Logger$ = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Logger$module$1 === null)) {
    this.Logger$lzycompute$1__p1__V()
  };
  return $m_Lcom_regblanc_scalavator_html5_Main$().Logger$module$1
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.SilentLogger__Lsgl_util_NoLoggingProvider$SilentLogger$ = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().SilentLogger$module$1 === null)) {
    this.SilentLogger$lzycompute$1__p1__V()
  };
  return $m_Lcom_regblanc_scalavator_html5_Main$().SilentLogger$module$1
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Logger$lzycompute$1__p1__V = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Logger$module$1 === null)) {
    $m_Lcom_regblanc_scalavator_html5_Main$().Logger$module$1 = new $c_Lsgl_util_LoggingProvider$Logger$().init___Lsgl_util_LoggingProvider(this)
  }
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.Html5ColorCompanion__Lsgl_html5_Html5GraphicsProvider$Html5ColorCompanion$ = (function() {
  if (($m_Lcom_regblanc_scalavator_html5_Main$().Html5ColorCompanion$module$1 === null)) {
    this.Html5ColorCompanion$lzycompute$1__p1__V()
  };
  return $m_Lcom_regblanc_scalavator_html5_Main$().Html5ColorCompanion$module$1
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.main = (function(arg$1) {
  var prep0 = arg$1;
  return this.$$js$exported$meth$main__Lorg_scalajs_dom_raw_HTMLCanvasElement__O(prep0)
});
var $d_Lcom_regblanc_scalavator_html5_Main$ = new $TypeData().initClass({
  Lcom_regblanc_scalavator_html5_Main$: 0
}, false, "com.regblanc.scalavator.html5.Main$", {
  Lcom_regblanc_scalavator_html5_Main$: 1,
  O: 1,
  Lcom_regblanc_scalavator_core_AbstractApp: 1,
  Lcom_regblanc_scalavator_core_MainScreenComponent: 1,
  Lsgl_Lifecycle: 1,
  Lsgl_html5_Html5App: 1,
  Lsgl_GameApp: 1,
  Lsgl_GraphicsProvider: 1,
  Lsgl_GraphicsHelpersComponent: 1,
  Lsgl_InputProvider: 1,
  Lsgl_AudioProvider: 1,
  Lsgl_WindowProvider: 1,
  Lsgl_GameLoopProvider: 1,
  Lsgl_SystemProvider: 1,
  Lsgl_util_LoggingProvider: 1,
  Lsgl_GameStateComponent: 1,
  Lsgl_html5_Html5GraphicsProvider: 1,
  Lsgl_html5_Html5InputProvider: 1,
  Lsgl_html5_Html5AudioProvider: 1,
  Lsgl_html5_Html5WindowProvider: 1,
  Lsgl_html5_Html5GameLoopProvider: 1,
  Lsgl_html5_Html5SystemProvider: 1,
  Lsgl_util_NoLoggingProvider: 1,
  Lsgl_scene_SceneComponent: 1,
  Lsgl_scene_SceneGraphComponent: 1,
  Lsgl_InputHelpersComponent: 1
});
$c_Lcom_regblanc_scalavator_html5_Main$.prototype.$classData = $d_Lcom_regblanc_scalavator_html5_Main$;
var $n_Lcom_regblanc_scalavator_html5_Main$ = (void 0);
function $m_Lcom_regblanc_scalavator_html5_Main$() {
  if ((!$n_Lcom_regblanc_scalavator_html5_Main$)) {
    $n_Lcom_regblanc_scalavator_html5_Main$ = new $c_Lcom_regblanc_scalavator_html5_Main$().init___()
  };
  return $n_Lcom_regblanc_scalavator_html5_Main$
}
$e.com = ($e.com || {});
$e.com.regblanc = ($e.com.regblanc || {});
$e.com.regblanc.scalavator = ($e.com.regblanc.scalavator || {});
$e.com.regblanc.scalavator.html5 = ($e.com.regblanc.scalavator.html5 || {});
$e.com.regblanc.scalavator.html5.Main = $m_Lcom_regblanc_scalavator_html5_Main$;
/** @constructor */
function $c_sc_AbstractSet() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSet.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSet.prototype.constructor = $c_sc_AbstractSet;
/** @constructor */
function $h_sc_AbstractSet() {
  /*<skip>*/
}
$h_sc_AbstractSet.prototype = $c_sc_AbstractSet.prototype;
$c_sc_AbstractSet.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenSetLike__equals__O__Z(this, that)
});
$c_sc_AbstractSet.prototype.isEmpty__Z = (function() {
  return $f_sc_SetLike__isEmpty__Z(this)
});
$c_sc_AbstractSet.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sc_AbstractSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  return this.forall__F1__Z(that)
});
$c_sc_AbstractSet.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
});
$c_sc_AbstractSet.prototype.stringPrefix__T = (function() {
  return "Set"
});
$c_sc_AbstractSet.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.empty__sc_Set())
});
function $is_scm_Seq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Seq)))
}
function $as_scm_Seq(obj) {
  return (($is_scm_Seq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Seq"))
}
function $isArrayOf_scm_Seq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Seq)))
}
function $asArrayOf_scm_Seq(obj, depth) {
  return (($isArrayOf_scm_Seq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Seq;", depth))
}
/** @constructor */
function $c_sci_ListSet() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_ListSet.prototype = new $h_sc_AbstractSet();
$c_sci_ListSet.prototype.constructor = $c_sci_ListSet;
/** @constructor */
function $h_sci_ListSet() {
  /*<skip>*/
}
$h_sci_ListSet.prototype = $c_sci_ListSet.prototype;
$c_sci_ListSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_ListSet.prototype.next__sci_ListSet = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next of empty set")
});
$c_sci_ListSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_ListSet.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_ListSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_ListSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_ListSet$()
});
$c_sci_ListSet.prototype.$$plus__O__sci_ListSet = (function(elem) {
  return new $c_sci_ListSet$Node().init___sci_ListSet__O(this, elem)
});
$c_sci_ListSet.prototype.size__I = (function() {
  return 0
});
$c_sci_ListSet.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.reverseList$1__p4__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$1)
});
$c_sci_ListSet.prototype.empty__sc_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
$c_sci_ListSet.prototype.reverseList$1__p4__sci_List = (function() {
  var curr = this;
  var res = $m_sci_Nil$();
  while ((!curr.isEmpty__Z())) {
    var x$4 = curr.elem__O();
    var this$1 = res;
    res = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
    curr = curr.next__sci_ListSet()
  };
  return res
});
$c_sci_ListSet.prototype.contains__O__Z = (function(elem) {
  return false
});
$c_sci_ListSet.prototype.elem__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("elem of empty set")
});
$c_sci_ListSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
$c_sci_ListSet.prototype.stringPrefix__T = (function() {
  return "ListSet"
});
/** @constructor */
function $c_sci_Set$EmptySet$() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_Set$EmptySet$.prototype = new $h_sc_AbstractSet();
$c_sci_Set$EmptySet$.prototype.constructor = $c_sci_Set$EmptySet$;
/** @constructor */
function $h_sci_Set$EmptySet$() {
  /*<skip>*/
}
$h_sci_Set$EmptySet$.prototype = $c_sci_Set$EmptySet$.prototype;
$c_sci_Set$EmptySet$.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.init___ = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.apply__O__O = (function(v1) {
  return false
});
$c_sci_Set$EmptySet$.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$EmptySet$.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_Set$EmptySet$.prototype.size__I = (function() {
  return 0
});
$c_sci_Set$EmptySet$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_Set$EmptySet$.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$EmptySet$.prototype.$$plus__O__sc_Set = (function(elem) {
  return new $c_sci_Set$Set1().init___O(elem)
});
var $d_sci_Set$EmptySet$ = new $TypeData().initClass({
  sci_Set$EmptySet$: 0
}, false, "scala.collection.immutable.Set$EmptySet$", {
  sci_Set$EmptySet$: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$EmptySet$.prototype.$classData = $d_sci_Set$EmptySet$;
var $n_sci_Set$EmptySet$ = (void 0);
function $m_sci_Set$EmptySet$() {
  if ((!$n_sci_Set$EmptySet$)) {
    $n_sci_Set$EmptySet$ = new $c_sci_Set$EmptySet$().init___()
  };
  return $n_sci_Set$EmptySet$
}
/** @constructor */
function $c_sci_Set$Set1() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null
}
$c_sci_Set$Set1.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set1.prototype.constructor = $c_sci_Set$Set1;
/** @constructor */
function $h_sci_Set$Set1() {
  /*<skip>*/
}
$h_sci_Set$Set1.prototype = $c_sci_Set$Set1.prototype;
$c_sci_Set$Set1.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set1.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set1.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set1.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set1.prototype.forall__F1__Z = (function(p) {
  return $uZ(p.apply__O__O(this.elem1$4))
});
$c_sci_Set$Set1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4)
});
$c_sci_Set$Set1.prototype.size__I = (function() {
  return 1
});
$c_sci_Set$Set1.prototype.init___O = (function(elem1) {
  this.elem1$4 = elem1;
  return this
});
$c_sci_Set$Set1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set1.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set1.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set2().init___O__O(this.elem1$4, elem))
});
$c_sci_Set$Set1.prototype.contains__O__Z = (function(elem) {
  return $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4)
});
$c_sci_Set$Set1.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set1 = new $TypeData().initClass({
  sci_Set$Set1: 0
}, false, "scala.collection.immutable.Set$Set1", {
  sci_Set$Set1: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set1.prototype.$classData = $d_sci_Set$Set1;
/** @constructor */
function $c_sci_Set$Set2() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null
}
$c_sci_Set$Set2.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set2.prototype.constructor = $c_sci_Set$Set2;
/** @constructor */
function $h_sci_Set$Set2() {
  /*<skip>*/
}
$h_sci_Set$Set2.prototype = $c_sci_Set$Set2.prototype;
$c_sci_Set$Set2.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set2.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set2.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set2.prototype.init___O__O = (function(elem1, elem2) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  return this
});
$c_sci_Set$Set2.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set2.prototype.forall__F1__Z = (function(p) {
  return ($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4)))
});
$c_sci_Set$Set2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4)
});
$c_sci_Set$Set2.prototype.size__I = (function() {
  return 2
});
$c_sci_Set$Set2.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set2.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set2.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set3().init___O__O__O(this.elem1$4, this.elem2$4, elem))
});
$c_sci_Set$Set2.prototype.contains__O__Z = (function(elem) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4))
});
$c_sci_Set$Set2.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set2 = new $TypeData().initClass({
  sci_Set$Set2: 0
}, false, "scala.collection.immutable.Set$Set2", {
  sci_Set$Set2: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set2.prototype.$classData = $d_sci_Set$Set2;
/** @constructor */
function $c_sci_Set$Set3() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null
}
$c_sci_Set$Set3.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set3.prototype.constructor = $c_sci_Set$Set3;
/** @constructor */
function $h_sci_Set$Set3() {
  /*<skip>*/
}
$h_sci_Set$Set3.prototype = $c_sci_Set$Set3.prototype;
$c_sci_Set$Set3.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set3.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set3.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set3.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set3.prototype.forall__F1__Z = (function(p) {
  return (($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4))) && $uZ(p.apply__O__O(this.elem3$4)))
});
$c_sci_Set$Set3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4)
});
$c_sci_Set$Set3.prototype.init___O__O__O = (function(elem1, elem2, elem3) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  return this
});
$c_sci_Set$Set3.prototype.size__I = (function() {
  return 3
});
$c_sci_Set$Set3.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set3.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set3.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set4().init___O__O__O__O(this.elem1$4, this.elem2$4, this.elem3$4, elem))
});
$c_sci_Set$Set3.prototype.contains__O__Z = (function(elem) {
  return (($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4))
});
$c_sci_Set$Set3.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set3 = new $TypeData().initClass({
  sci_Set$Set3: 0
}, false, "scala.collection.immutable.Set$Set3", {
  sci_Set$Set3: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set3.prototype.$classData = $d_sci_Set$Set3;
/** @constructor */
function $c_sci_Set$Set4() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null;
  this.elem4$4 = null
}
$c_sci_Set$Set4.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set4.prototype.constructor = $c_sci_Set$Set4;
/** @constructor */
function $h_sci_Set$Set4() {
  /*<skip>*/
}
$h_sci_Set$Set4.prototype = $c_sci_Set$Set4.prototype;
$c_sci_Set$Set4.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set4.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set4.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set4.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set4.prototype.forall__F1__Z = (function(p) {
  return ((($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4))) && $uZ(p.apply__O__O(this.elem3$4))) && $uZ(p.apply__O__O(this.elem4$4)))
});
$c_sci_Set$Set4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4);
  f.apply__O__O(this.elem4$4)
});
$c_sci_Set$Set4.prototype.size__I = (function() {
  return 4
});
$c_sci_Set$Set4.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4, this.elem4$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set4.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set4.prototype.$$plus__O__sci_Set = (function(elem) {
  if (this.contains__O__Z(elem)) {
    return this
  } else {
    var this$1 = new $c_sci_HashSet().init___();
    var elem1 = this.elem1$4;
    var elem2 = this.elem2$4;
    var array = [this.elem3$4, this.elem4$4, elem];
    var this$2 = this$1.$$plus__O__sci_HashSet(elem1).$$plus__O__sci_HashSet(elem2);
    var start = 0;
    var end = $uI(array.length);
    var z = this$2;
    var start$1 = start;
    var z$1 = z;
    var jsx$1;
    _foldl: while (true) {
      if ((start$1 !== end)) {
        var temp$start = ((1 + start$1) | 0);
        var arg1 = z$1;
        var index = start$1;
        var arg2 = array[index];
        var x$4 = $as_sc_Set(arg1);
        var temp$z = x$4.$$plus__O__sc_Set(arg2);
        start$1 = temp$start;
        z$1 = temp$z;
        continue _foldl
      };
      var jsx$1 = z$1;
      break
    };
    return $as_sci_HashSet($as_sc_Set(jsx$1))
  }
});
$c_sci_Set$Set4.prototype.contains__O__Z = (function(elem) {
  return ((($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem4$4))
});
$c_sci_Set$Set4.prototype.init___O__O__O__O = (function(elem1, elem2, elem3, elem4) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  this.elem4$4 = elem4;
  return this
});
$c_sci_Set$Set4.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set4 = new $TypeData().initClass({
  sci_Set$Set4: 0
}, false, "scala.collection.immutable.Set$Set4", {
  sci_Set$Set4: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set4.prototype.$classData = $d_sci_Set$Set4;
/** @constructor */
function $c_sci_HashSet() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_HashSet.prototype = new $h_sc_AbstractSet();
$c_sci_HashSet.prototype.constructor = $c_sci_HashSet;
/** @constructor */
function $h_sci_HashSet() {
  /*<skip>*/
}
$h_sci_HashSet.prototype = $c_sci_HashSet.prototype;
$c_sci_HashSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return new $c_sci_HashSet$HashSet1().init___O__I(key, hash)
});
$c_sci_HashSet.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I($m_sr_Statics$().anyHash__O__I(key))
});
$c_sci_HashSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_HashSet.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_HashSet.prototype.$$plus__O__sci_HashSet = (function(e) {
  return this.updated0__O__I__I__sci_HashSet(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_HashSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_HashSet$()
});
$c_sci_HashSet.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_HashSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  if ($is_sci_HashSet(that)) {
    var x2 = $as_sci_HashSet(that);
    return this.subsetOf0__sci_HashSet__I__Z(x2, 0)
  } else {
    var this$1 = this.iterator__sc_Iterator();
    return $f_sc_Iterator__forall__F1__Z(this$1, that)
  }
});
$c_sci_HashSet.prototype.size__I = (function() {
  return 0
});
$c_sci_HashSet.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_HashSet.prototype.empty__sc_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
$c_sci_HashSet.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
$c_sci_HashSet.prototype.contains__O__Z = (function(e) {
  return this.get0__O__I__I__Z(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return false
});
$c_sci_HashSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_HashSet(elem)
});
$c_sci_HashSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return true
});
function $is_sci_HashSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet)))
}
function $as_sci_HashSet(obj) {
  return (($is_sci_HashSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet"))
}
function $isArrayOf_sci_HashSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet)))
}
function $asArrayOf_sci_HashSet(obj, depth) {
  return (($isArrayOf_sci_HashSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet;", depth))
}
var $d_sci_HashSet = new $TypeData().initClass({
  sci_HashSet: 0
}, false, "scala.collection.immutable.HashSet", {
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet.prototype.$classData = $d_sci_HashSet;
/** @constructor */
function $c_sci_ListSet$EmptyListSet$() {
  $c_sci_ListSet.call(this)
}
$c_sci_ListSet$EmptyListSet$.prototype = new $h_sci_ListSet();
$c_sci_ListSet$EmptyListSet$.prototype.constructor = $c_sci_ListSet$EmptyListSet$;
/** @constructor */
function $h_sci_ListSet$EmptyListSet$() {
  /*<skip>*/
}
$h_sci_ListSet$EmptyListSet$.prototype = $c_sci_ListSet$EmptyListSet$.prototype;
$c_sci_ListSet$EmptyListSet$.prototype.init___ = (function() {
  return this
});
var $d_sci_ListSet$EmptyListSet$ = new $TypeData().initClass({
  sci_ListSet$EmptyListSet$: 0
}, false, "scala.collection.immutable.ListSet$EmptyListSet$", {
  sci_ListSet$EmptyListSet$: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$EmptyListSet$.prototype.$classData = $d_sci_ListSet$EmptyListSet$;
var $n_sci_ListSet$EmptyListSet$ = (void 0);
function $m_sci_ListSet$EmptyListSet$() {
  if ((!$n_sci_ListSet$EmptyListSet$)) {
    $n_sci_ListSet$EmptyListSet$ = new $c_sci_ListSet$EmptyListSet$().init___()
  };
  return $n_sci_ListSet$EmptyListSet$
}
/** @constructor */
function $c_sci_ListSet$Node() {
  $c_sci_ListSet.call(this);
  this.elem$5 = null;
  this.$$outer$5 = null
}
$c_sci_ListSet$Node.prototype = new $h_sci_ListSet();
$c_sci_ListSet$Node.prototype.constructor = $c_sci_ListSet$Node;
/** @constructor */
function $h_sci_ListSet$Node() {
  /*<skip>*/
}
$h_sci_ListSet$Node.prototype = $c_sci_ListSet$Node.prototype;
$c_sci_ListSet$Node.prototype.next__sci_ListSet = (function() {
  return this.$$outer$5
});
$c_sci_ListSet$Node.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_ListSet$Node.prototype.$$plus__O__sci_ListSet = (function(e) {
  return (this.containsInternal__p5__sci_ListSet__O__Z(this, e) ? this : new $c_sci_ListSet$Node().init___sci_ListSet__O(this, e))
});
$c_sci_ListSet$Node.prototype.sizeInternal__p5__sci_ListSet__I__I = (function(n, acc) {
  _sizeInternal: while (true) {
    if (n.isEmpty__Z()) {
      return acc
    } else {
      var temp$n = n.next__sci_ListSet();
      var temp$acc = ((1 + acc) | 0);
      n = temp$n;
      acc = temp$acc;
      continue _sizeInternal
    }
  }
});
$c_sci_ListSet$Node.prototype.size__I = (function() {
  return this.sizeInternal__p5__sci_ListSet__I__I(this, 0)
});
$c_sci_ListSet$Node.prototype.init___sci_ListSet__O = (function($$outer, elem) {
  this.elem$5 = elem;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$5 = $$outer
  };
  return this
});
$c_sci_ListSet$Node.prototype.elem__O = (function() {
  return this.elem$5
});
$c_sci_ListSet$Node.prototype.contains__O__Z = (function(e) {
  return this.containsInternal__p5__sci_ListSet__O__Z(this, e)
});
$c_sci_ListSet$Node.prototype.containsInternal__p5__sci_ListSet__O__Z = (function(n, e) {
  _containsInternal: while (true) {
    if ((!n.isEmpty__Z())) {
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(n.elem__O(), e)) {
        return true
      } else {
        n = n.next__sci_ListSet();
        continue _containsInternal
      }
    } else {
      return false
    }
  }
});
$c_sci_ListSet$Node.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
var $d_sci_ListSet$Node = new $TypeData().initClass({
  sci_ListSet$Node: 0
}, false, "scala.collection.immutable.ListSet$Node", {
  sci_ListSet$Node: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$Node.prototype.$classData = $d_sci_ListSet$Node;
/** @constructor */
function $c_scm_AbstractSeq() {
  $c_sc_AbstractSeq.call(this)
}
$c_scm_AbstractSeq.prototype = new $h_sc_AbstractSeq();
$c_scm_AbstractSeq.prototype.constructor = $c_scm_AbstractSeq;
/** @constructor */
function $h_scm_AbstractSeq() {
  /*<skip>*/
}
$h_scm_AbstractSeq.prototype = $c_scm_AbstractSeq.prototype;
$c_scm_AbstractSeq.prototype.seq__sc_TraversableOnce = (function() {
  return this.seq__scm_Seq()
});
$c_scm_AbstractSeq.prototype.seq__scm_Seq = (function() {
  return this
});
/** @constructor */
function $c_sci_HashSet$EmptyHashSet$() {
  $c_sci_HashSet.call(this)
}
$c_sci_HashSet$EmptyHashSet$.prototype = new $h_sci_HashSet();
$c_sci_HashSet$EmptyHashSet$.prototype.constructor = $c_sci_HashSet$EmptyHashSet$;
/** @constructor */
function $h_sci_HashSet$EmptyHashSet$() {
  /*<skip>*/
}
$h_sci_HashSet$EmptyHashSet$.prototype = $c_sci_HashSet$EmptyHashSet$.prototype;
$c_sci_HashSet$EmptyHashSet$.prototype.init___ = (function() {
  return this
});
var $d_sci_HashSet$EmptyHashSet$ = new $TypeData().initClass({
  sci_HashSet$EmptyHashSet$: 0
}, false, "scala.collection.immutable.HashSet$EmptyHashSet$", {
  sci_HashSet$EmptyHashSet$: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$EmptyHashSet$.prototype.$classData = $d_sci_HashSet$EmptyHashSet$;
var $n_sci_HashSet$EmptyHashSet$ = (void 0);
function $m_sci_HashSet$EmptyHashSet$() {
  if ((!$n_sci_HashSet$EmptyHashSet$)) {
    $n_sci_HashSet$EmptyHashSet$ = new $c_sci_HashSet$EmptyHashSet$().init___()
  };
  return $n_sci_HashSet$EmptyHashSet$
}
/** @constructor */
function $c_sci_HashSet$HashTrieSet() {
  $c_sci_HashSet.call(this);
  this.bitmap$5 = 0;
  this.elems$5 = null;
  this.size0$5 = 0
}
$c_sci_HashSet$HashTrieSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$HashTrieSet.prototype.constructor = $c_sci_HashSet$HashTrieSet;
/** @constructor */
function $h_sci_HashSet$HashTrieSet() {
  /*<skip>*/
}
$h_sci_HashSet$HashTrieSet.prototype = $c_sci_HashSet$HashTrieSet.prototype;
$c_sci_HashSet$HashTrieSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
  if (((this.bitmap$5 & mask) !== 0)) {
    var sub = this.elems$5.u[offset];
    var subNew = sub.updated0__O__I__I__sci_HashSet(key, hash, ((5 + level) | 0));
    if ((sub === subNew)) {
      return this
    } else {
      var elemsNew = $newArrayObject($d_sci_HashSet.getArrayOf(), [this.elems$5.u.length]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew, 0, this.elems$5.u.length);
      elemsNew.u[offset] = subNew;
      return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(this.bitmap$5, elemsNew, ((this.size0$5 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [((1 + this.elems$5.u.length) | 0)]);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew$2, 0, offset);
    elemsNew$2.u[offset] = new $c_sci_HashSet$HashSet1().init___O__I(key, hash);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$5.u.length - offset) | 0));
    var bitmapNew = (this.bitmap$5 | mask);
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmapNew, elemsNew$2, ((1 + this.size0$5) | 0))
  }
});
$c_sci_HashSet$HashTrieSet.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$5.u.length)) {
    this.elems$5.u[i].foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
$c_sci_HashSet$HashTrieSet.prototype.size__I = (function() {
  return this.size0$5
});
$c_sci_HashSet$HashTrieSet.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_HashSet$HashTrieSet$$anon$1().init___sci_HashSet$HashTrieSet(this)
});
$c_sci_HashSet$HashTrieSet.prototype.init___I__Asci_HashSet__I = (function(bitmap, elems, size0) {
  this.bitmap$5 = bitmap;
  this.elems$5 = elems;
  this.size0$5 = size0;
  $m_s_Predef$().assert__Z__V(($m_jl_Integer$().bitCount__I__I(bitmap) === elems.u.length));
  return this
});
$c_sci_HashSet$HashTrieSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  if ((this.bitmap$5 === (-1))) {
    return this.elems$5.u[(31 & index)].get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else if (((this.bitmap$5 & mask) !== 0)) {
    var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
    return this.elems$5.u[offset].get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else {
    return false
  }
});
$c_sci_HashSet$HashTrieSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  if ((that === this)) {
    return true
  } else {
    if ($is_sci_HashSet$HashTrieSet(that)) {
      var x2 = $as_sci_HashSet$HashTrieSet(that);
      if ((this.size0$5 <= x2.size0$5)) {
        var abm = this.bitmap$5;
        var a = this.elems$5;
        var ai = 0;
        var b = x2.elems$5;
        var bbm = x2.bitmap$5;
        var bi = 0;
        if (((abm & bbm) === abm)) {
          while ((abm !== 0)) {
            var alsb = (abm ^ (abm & (((-1) + abm) | 0)));
            var blsb = (bbm ^ (bbm & (((-1) + bbm) | 0)));
            if ((alsb === blsb)) {
              if ((!a.u[ai].subsetOf0__sci_HashSet__I__Z(b.u[bi], ((5 + level) | 0)))) {
                return false
              };
              abm = (abm & (~alsb));
              ai = ((1 + ai) | 0)
            };
            bbm = (bbm & (~blsb));
            bi = ((1 + bi) | 0)
          };
          return true
        } else {
          return false
        }
      }
    };
    return false
  }
});
function $is_sci_HashSet$HashTrieSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashTrieSet)))
}
function $as_sci_HashSet$HashTrieSet(obj) {
  return (($is_sci_HashSet$HashTrieSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashTrieSet"))
}
function $isArrayOf_sci_HashSet$HashTrieSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashTrieSet)))
}
function $asArrayOf_sci_HashSet$HashTrieSet(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashTrieSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashTrieSet;", depth))
}
var $d_sci_HashSet$HashTrieSet = new $TypeData().initClass({
  sci_HashSet$HashTrieSet: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet", {
  sci_HashSet$HashTrieSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashTrieSet.prototype.$classData = $d_sci_HashSet$HashTrieSet;
/** @constructor */
function $c_sci_HashSet$LeafHashSet() {
  $c_sci_HashSet.call(this)
}
$c_sci_HashSet$LeafHashSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$LeafHashSet.prototype.constructor = $c_sci_HashSet$LeafHashSet;
/** @constructor */
function $h_sci_HashSet$LeafHashSet() {
  /*<skip>*/
}
$h_sci_HashSet$LeafHashSet.prototype = $c_sci_HashSet$LeafHashSet.prototype;
/** @constructor */
function $c_sci_HashSet$HashSet1() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.key$6 = null;
  this.hash$6 = 0
}
$c_sci_HashSet$HashSet1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSet1.prototype.constructor = $c_sci_HashSet$HashSet1;
/** @constructor */
function $h_sci_HashSet$HashSet1() {
  /*<skip>*/
}
$h_sci_HashSet$HashSet1.prototype = $c_sci_HashSet$HashSet1.prototype;
$c_sci_HashSet$HashSet1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    return this
  } else if ((hash !== this.hash$6)) {
    return $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level)
  } else {
    var this$2 = $m_sci_ListSet$EmptyListSet$();
    var elem = this.key$6;
    return new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, new $c_sci_ListSet$Node().init___sci_ListSet__O(this$2, elem).$$plus__O__sci_ListSet(key))
  }
});
$c_sci_HashSet$HashSet1.prototype.init___O__I = (function(key, hash) {
  this.key$6 = key;
  this.hash$6 = hash;
  return this
});
$c_sci_HashSet$HashSet1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.key$6)
});
$c_sci_HashSet$HashSet1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.key$6]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_HashSet$HashSet1.prototype.size__I = (function() {
  return 1
});
$c_sci_HashSet$HashSet1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
});
$c_sci_HashSet$HashSet1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return that.get0__O__I__I__Z(this.key$6, this.hash$6, level)
});
function $is_sci_HashSet$HashSet1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashSet1)))
}
function $as_sci_HashSet$HashSet1(obj) {
  return (($is_sci_HashSet$HashSet1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashSet1"))
}
function $isArrayOf_sci_HashSet$HashSet1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashSet1)))
}
function $asArrayOf_sci_HashSet$HashSet1(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashSet1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashSet1;", depth))
}
var $d_sci_HashSet$HashSet1 = new $TypeData().initClass({
  sci_HashSet$HashSet1: 0
}, false, "scala.collection.immutable.HashSet$HashSet1", {
  sci_HashSet$HashSet1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSet1.prototype.$classData = $d_sci_HashSet$HashSet1;
/** @constructor */
function $c_sci_HashSet$HashSetCollision1() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.hash$6 = 0;
  this.ks$6 = null
}
$c_sci_HashSet$HashSetCollision1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSetCollision1.prototype.constructor = $c_sci_HashSet$HashSetCollision1;
/** @constructor */
function $h_sci_HashSet$HashSetCollision1() {
  /*<skip>*/
}
$h_sci_HashSet$HashSetCollision1.prototype = $c_sci_HashSet$HashSetCollision1.prototype;
$c_sci_HashSet$HashSetCollision1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return ((hash === this.hash$6) ? new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, this.ks$6.$$plus__O__sci_ListSet(key)) : $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level))
});
$c_sci_HashSet$HashSetCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  var this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
  $f_sc_Iterator__foreach__F1__V(this$3, f)
});
$c_sci_HashSet$HashSetCollision1.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2)
});
$c_sci_HashSet$HashSetCollision1.prototype.size__I = (function() {
  return this.ks$6.size__I()
});
$c_sci_HashSet$HashSetCollision1.prototype.init___I__sci_ListSet = (function(hash, ks) {
  this.hash$6 = hash;
  this.ks$6 = ks;
  return this
});
$c_sci_HashSet$HashSetCollision1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && this.ks$6.contains__O__Z(key))
});
$c_sci_HashSet$HashSetCollision1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  var this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
  var res = true;
  while ((res && this$3.hasNext__Z())) {
    var arg1 = this$3.next__O();
    res = that.get0__O__I__I__Z(arg1, this.hash$6, level)
  };
  return res
});
var $d_sci_HashSet$HashSetCollision1 = new $TypeData().initClass({
  sci_HashSet$HashSetCollision1: 0
}, false, "scala.collection.immutable.HashSet$HashSetCollision1", {
  sci_HashSet$HashSetCollision1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSetCollision1.prototype.$classData = $d_sci_HashSet$HashSetCollision1;
/** @constructor */
function $c_sci_Stream() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_Stream.prototype = new $h_sc_AbstractSeq();
$c_sci_Stream.prototype.constructor = $c_sci_Stream;
/** @constructor */
function $h_sci_Stream() {
  /*<skip>*/
}
$h_sci_Stream.prototype = $c_sci_Stream.prototype;
$c_sci_Stream.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Stream.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_Stream.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
});
$c_sci_Stream.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_Stream.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Stream.prototype.equals__O__Z = (function(that) {
  return ((this === that) || $f_sc_GenSeqLike__equals__O__Z(this, that))
});
$c_sci_Stream.prototype.flatMap__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = $m_sci_Stream$Empty$()
    } else {
      var nonEmptyPrefix = new $c_sr_ObjectRef().init___O(this);
      var prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream();
      while (((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z()) && prefix.isEmpty__Z())) {
        nonEmptyPrefix.elem$1 = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix.elem$1).tail__O());
        if ((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z())) {
          prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream()
        }
      };
      var x$1 = ($as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z() ? ($m_sci_Stream$(), $m_sci_Stream$Empty$()) : prefix.append__F0__sci_Stream(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1, nonEmptyPrefix$1) {
        return (function() {
          var x = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix$1.elem$1).tail__O()).flatMap__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
          return $as_sci_Stream(x)
        })
      })(this, f, nonEmptyPrefix))))
    };
    return x$1
  } else {
    return $f_sc_TraversableLike__flatMap__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_Stream.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_Stream(n)
});
$c_sci_Stream.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  this.force__sci_Stream();
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sci_Stream.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Stream$()
});
$c_sci_Stream.prototype.toString__T = (function() {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, "Stream(", ", ", ")")
});
$c_sci_Stream.prototype.foreach__F1__V = (function(f) {
  var _$this = this;
  _foreach: while (true) {
    if ((!_$this.isEmpty__Z())) {
      f.apply__O__O(_$this.head__O());
      _$this = $as_sci_Stream(_$this.tail__O());
      continue _foreach
    };
    break
  }
});
$c_sci_Stream.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_StreamIterator().init___sci_Stream(this)
});
$c_sci_Stream.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Stream.prototype.length__I = (function() {
  var len = 0;
  var left = this;
  while ((!left.isEmpty__Z())) {
    len = ((1 + len) | 0);
    left = $as_sci_Stream(left.tail__O())
  };
  return len
});
$c_sci_Stream.prototype.toStream__sci_Stream = (function() {
  return this
});
$c_sci_Stream.prototype.drop__I__sci_Stream = (function(n) {
  var _$this = this;
  _drop: while (true) {
    if (((n <= 0) || _$this.isEmpty__Z())) {
      return _$this
    } else {
      var temp$_$this = $as_sci_Stream(_$this.tail__O());
      var temp$n = (((-1) + n) | 0);
      _$this = temp$_$this;
      n = temp$n;
      continue _drop
    }
  }
});
$c_sci_Stream.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  b.append__T__scm_StringBuilder(start);
  if ((!this.isEmpty__Z())) {
    b.append__O__scm_StringBuilder(this.head__O());
    var cursor = this;
    var n = 1;
    if (cursor.tailDefined__Z()) {
      var scout = $as_sci_Stream(this.tail__O());
      if (scout.isEmpty__Z()) {
        b.append__T__scm_StringBuilder(end);
        return b
      };
      if ((cursor !== scout)) {
        cursor = scout;
        if (scout.tailDefined__Z()) {
          scout = $as_sci_Stream(scout.tail__O());
          while (((cursor !== scout) && scout.tailDefined__Z())) {
            b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
            n = ((1 + n) | 0);
            cursor = $as_sci_Stream(cursor.tail__O());
            scout = $as_sci_Stream(scout.tail__O());
            if (scout.tailDefined__Z()) {
              scout = $as_sci_Stream(scout.tail__O())
            }
          }
        }
      };
      if ((!scout.tailDefined__Z())) {
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        var this$1 = cursor;
        if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O())
        }
      } else {
        var runner = this;
        var k = 0;
        while ((runner !== scout)) {
          runner = $as_sci_Stream(runner.tail__O());
          scout = $as_sci_Stream(scout.tail__O());
          k = ((1 + k) | 0)
        };
        if (((cursor === scout) && (k > 0))) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        n = ((n - k) | 0)
      }
    };
    if ((!cursor.isEmpty__Z())) {
      if ((!cursor.tailDefined__Z())) {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("?")
      } else {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("...")
      }
    }
  };
  b.append__T__scm_StringBuilder(end);
  return b
});
$c_sci_Stream.prototype.force__sci_Stream = (function() {
  var these = this;
  var those = this;
  if ((!these.isEmpty__Z())) {
    these = $as_sci_Stream(these.tail__O())
  };
  while ((those !== these)) {
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if ((these === those)) {
      return this
    };
    those = $as_sci_Stream(those.tail__O())
  };
  return this
});
$c_sci_Stream.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Stream.prototype.append__F0__sci_Stream = (function(rest) {
  if (this.isEmpty__Z()) {
    return $as_sc_GenTraversableOnce(rest.apply__O()).toStream__sci_Stream()
  } else {
    var hd = this.head__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, rest$1) {
      return (function() {
        return $as_sci_Stream($this.tail__O()).append__F0__sci_Stream(rest$1)
      })
    })(this, rest));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  }
});
$c_sci_Stream.prototype.stringPrefix__T = (function() {
  return "Stream"
});
function $is_sci_Stream(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream)))
}
function $as_sci_Stream(obj) {
  return (($is_sci_Stream(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream"))
}
function $isArrayOf_sci_Stream(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream)))
}
function $asArrayOf_sci_Stream(obj, depth) {
  return (($isArrayOf_sci_Stream(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream;", depth))
}
function $f_scm_ResizableArray__apply__I__O($thiz, idx) {
  if ((idx >= $thiz.size0$6)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  return $thiz.array$6.u[idx]
}
function $f_scm_ResizableArray__foreach__F1__V($thiz, f) {
  var i = 0;
  var top = $thiz.size0$6;
  while ((i < top)) {
    f.apply__O__O($thiz.array$6.u[i]);
    i = ((1 + i) | 0)
  }
}
function $f_scm_ResizableArray__ensureSize__I__V($thiz, n) {
  var value = $thiz.array$6.u.length;
  var hi = (value >> 31);
  var hi$1 = (n >> 31);
  if (((hi$1 === hi) ? (((-2147483648) ^ n) > ((-2147483648) ^ value)) : (hi$1 > hi))) {
    var lo = (value << 1);
    var hi$2 = (((value >>> 31) | 0) | (hi << 1));
    var newSize_$_lo$2 = lo;
    var newSize_$_hi$2 = hi$2;
    while (true) {
      var hi$3 = (n >> 31);
      var b_$_lo$2 = newSize_$_lo$2;
      var b_$_hi$2 = newSize_$_hi$2;
      var bhi = b_$_hi$2;
      if (((hi$3 === bhi) ? (((-2147483648) ^ n) > ((-2147483648) ^ b_$_lo$2)) : (hi$3 > bhi))) {
        var this$1_$_lo$2 = newSize_$_lo$2;
        var this$1_$_hi$2 = newSize_$_hi$2;
        var lo$1 = (this$1_$_lo$2 << 1);
        var hi$4 = (((this$1_$_lo$2 >>> 31) | 0) | (this$1_$_hi$2 << 1));
        var jsx$1_$_lo$2 = lo$1;
        var jsx$1_$_hi$2 = hi$4;
        newSize_$_lo$2 = jsx$1_$_lo$2;
        newSize_$_hi$2 = jsx$1_$_hi$2
      } else {
        break
      }
    };
    var this$2_$_lo$2 = newSize_$_lo$2;
    var this$2_$_hi$2 = newSize_$_hi$2;
    var ahi = this$2_$_hi$2;
    if (((ahi === 0) ? (((-2147483648) ^ this$2_$_lo$2) > (-1)) : (ahi > 0))) {
      var jsx$2_$_lo$2 = 2147483647;
      var jsx$2_$_hi$2 = 0;
      newSize_$_lo$2 = jsx$2_$_lo$2;
      newSize_$_hi$2 = jsx$2_$_hi$2
    };
    var this$3_$_lo$2 = newSize_$_lo$2;
    var this$3_$_hi$2 = newSize_$_hi$2;
    var newArray = $newArrayObject($d_O.getArrayOf(), [this$3_$_lo$2]);
    var src = $thiz.array$6;
    var length = $thiz.size0$6;
    $systemArraycopy(src, 0, newArray, 0, length);
    $thiz.array$6 = newArray
  }
}
function $f_scm_ResizableArray__$$init$__V($thiz) {
  var x = $thiz.initialSize$6;
  $thiz.array$6 = $newArrayObject($d_O.getArrayOf(), [((x > 1) ? x : 1)]);
  $thiz.size0$6 = 0
}
function $f_scm_ResizableArray__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var x = ((len < that) ? len : that);
  var that$1 = $thiz.size0$6;
  var len1 = ((x < that$1) ? x : that$1);
  if ((len1 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V($thiz.array$6, 0, xs, start, len1)
  }
}
function $is_sci_HashMap$HashMap1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashMap1)))
}
function $as_sci_HashMap$HashMap1(obj) {
  return (($is_sci_HashMap$HashMap1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashMap1"))
}
function $isArrayOf_sci_HashMap$HashMap1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashMap1)))
}
function $asArrayOf_sci_HashMap$HashMap1(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashMap1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashMap1;", depth))
}
function $is_sci_HashMap$HashTrieMap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashTrieMap)))
}
function $as_sci_HashMap$HashTrieMap(obj) {
  return (($is_sci_HashMap$HashTrieMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashTrieMap"))
}
function $isArrayOf_sci_HashMap$HashTrieMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashTrieMap)))
}
function $asArrayOf_sci_HashMap$HashTrieMap(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashTrieMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashTrieMap;", depth))
}
/** @constructor */
function $c_sci_List() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_List.prototype = new $h_sc_AbstractSeq();
$c_sci_List.prototype.constructor = $c_sci_List;
/** @constructor */
function $h_sci_List() {
  /*<skip>*/
}
$h_sci_List.prototype = $c_sci_List.prototype;
$c_sci_List.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_List.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_List.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
});
$c_sci_List.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_List.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_List.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_List(n)
});
$c_sci_List.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_List$()
});
$c_sci_List.prototype.foreach__F1__V = (function(f) {
  var these = this;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$1 = these;
    these = this$1.tail__sci_List()
  }
});
$c_sci_List.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this)
});
$c_sci_List.prototype.drop__I__sci_List = (function(n) {
  var these = this;
  var count = n;
  while (((!these.isEmpty__Z()) && (count > 0))) {
    var this$1 = these;
    these = this$1.tail__sci_List();
    count = (((-1) + count) | 0)
  };
  return these
});
$c_sci_List.prototype.length__I = (function() {
  return $f_sc_LinearSeqOptimized__length__I(this)
});
$c_sci_List.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_List.prototype.toStream__sci_Stream = (function() {
  return (this.isEmpty__Z() ? $m_sci_Stream$Empty$() : new $c_sci_Stream$Cons().init___O__F0(this.head__O(), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.tail__sci_List().toStream__sci_Stream()
    })
  })(this))))
});
$c_sci_List.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_List.prototype.reverse__sci_List = (function() {
  var result = $m_sci_Nil$();
  var these = this;
  while ((!these.isEmpty__Z())) {
    var x$4 = these.head__O();
    var this$1 = result;
    result = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
    var this$2 = these;
    these = this$2.tail__sci_List()
  };
  return result
});
$c_sci_List.prototype.stringPrefix__T = (function() {
  return "List"
});
function $is_sci_List(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_List)))
}
function $as_sci_List(obj) {
  return (($is_sci_List(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.List"))
}
function $isArrayOf_sci_List(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
}
function $asArrayOf_sci_List(obj, depth) {
  return (($isArrayOf_sci_List(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth))
}
/** @constructor */
function $c_sci_Stream$Cons() {
  $c_sci_Stream.call(this);
  this.hd$5 = null;
  this.tlVal$5 = null;
  this.tlGen$5 = null
}
$c_sci_Stream$Cons.prototype = new $h_sci_Stream();
$c_sci_Stream$Cons.prototype.constructor = $c_sci_Stream$Cons;
/** @constructor */
function $h_sci_Stream$Cons() {
  /*<skip>*/
}
$h_sci_Stream$Cons.prototype = $c_sci_Stream$Cons.prototype;
$c_sci_Stream$Cons.prototype.head__O = (function() {
  return this.hd$5
});
$c_sci_Stream$Cons.prototype.tail__sci_Stream = (function() {
  if ((!this.tailDefined__Z())) {
    if ((!this.tailDefined__Z())) {
      this.tlVal$5 = $as_sci_Stream(this.tlGen$5.apply__O());
      this.tlGen$5 = null
    }
  };
  return this.tlVal$5
});
$c_sci_Stream$Cons.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  if ($is_sci_Stream$Cons(that)) {
    var x2 = $as_sci_Stream$Cons(that);
    return this.consEq$1__p5__sci_Stream$Cons__sci_Stream$Cons__Z(this, x2)
  } else {
    return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  }
});
$c_sci_Stream$Cons.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_Stream$Cons.prototype.tailDefined__Z = (function() {
  return (this.tlGen$5 === null)
});
$c_sci_Stream$Cons.prototype.consEq$1__p5__sci_Stream$Cons__sci_Stream$Cons__Z = (function(a, b) {
  _consEq: while (true) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(a.hd$5, b.hd$5)) {
      var x1 = a.tail__sci_Stream();
      if ($is_sci_Stream$Cons(x1)) {
        var x2 = $as_sci_Stream$Cons(x1);
        var x1$2 = b.tail__sci_Stream();
        if ($is_sci_Stream$Cons(x1$2)) {
          var x2$2 = $as_sci_Stream$Cons(x1$2);
          if ((x2 === x2$2)) {
            return true
          } else {
            a = x2;
            b = x2$2;
            continue _consEq
          }
        } else {
          return false
        }
      } else {
        return b.tail__sci_Stream().isEmpty__Z()
      }
    } else {
      return false
    }
  }
});
$c_sci_Stream$Cons.prototype.tail__O = (function() {
  return this.tail__sci_Stream()
});
$c_sci_Stream$Cons.prototype.init___O__F0 = (function(hd, tl) {
  this.hd$5 = hd;
  this.tlGen$5 = tl;
  return this
});
function $is_sci_Stream$Cons(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$Cons)))
}
function $as_sci_Stream$Cons(obj) {
  return (($is_sci_Stream$Cons(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream$Cons"))
}
function $isArrayOf_sci_Stream$Cons(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$Cons)))
}
function $asArrayOf_sci_Stream$Cons(obj, depth) {
  return (($isArrayOf_sci_Stream$Cons(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream$Cons;", depth))
}
var $d_sci_Stream$Cons = new $TypeData().initClass({
  sci_Stream$Cons: 0
}, false, "scala.collection.immutable.Stream$Cons", {
  sci_Stream$Cons: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Cons.prototype.$classData = $d_sci_Stream$Cons;
/** @constructor */
function $c_sci_Stream$Empty$() {
  $c_sci_Stream.call(this)
}
$c_sci_Stream$Empty$.prototype = new $h_sci_Stream();
$c_sci_Stream$Empty$.prototype.constructor = $c_sci_Stream$Empty$;
/** @constructor */
function $h_sci_Stream$Empty$() {
  /*<skip>*/
}
$h_sci_Stream$Empty$.prototype = $c_sci_Stream$Empty$.prototype;
$c_sci_Stream$Empty$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Stream$Empty$.prototype.init___ = (function() {
  return this
});
$c_sci_Stream$Empty$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Stream$Empty$.prototype.tailDefined__Z = (function() {
  return false
});
$c_sci_Stream$Empty$.prototype.tail__sr_Nothing$ = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty stream")
});
$c_sci_Stream$Empty$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty stream")
});
$c_sci_Stream$Empty$.prototype.tail__O = (function() {
  this.tail__sr_Nothing$()
});
var $d_sci_Stream$Empty$ = new $TypeData().initClass({
  sci_Stream$Empty$: 0
}, false, "scala.collection.immutable.Stream$Empty$", {
  sci_Stream$Empty$: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Empty$.prototype.$classData = $d_sci_Stream$Empty$;
var $n_sci_Stream$Empty$ = (void 0);
function $m_sci_Stream$Empty$() {
  if ((!$n_sci_Stream$Empty$)) {
    $n_sci_Stream$Empty$ = new $c_sci_Stream$Empty$().init___()
  };
  return $n_sci_Stream$Empty$
}
/** @constructor */
function $c_sci_Vector() {
  $c_sc_AbstractSeq.call(this);
  this.startIndex$4 = 0;
  this.endIndex$4 = 0;
  this.focus$4 = 0;
  this.dirty$4 = false;
  this.depth$4 = 0;
  this.display0$4 = null;
  this.display1$4 = null;
  this.display2$4 = null;
  this.display3$4 = null;
  this.display4$4 = null;
  this.display5$4 = null
}
$c_sci_Vector.prototype = new $h_sc_AbstractSeq();
$c_sci_Vector.prototype.constructor = $c_sci_Vector;
/** @constructor */
function $h_sci_Vector() {
  /*<skip>*/
}
$h_sci_Vector.prototype = $c_sci_Vector.prototype;
$c_sci_Vector.prototype.checkRangeConvert__p4__I__I = (function(index) {
  var idx = ((index + this.startIndex$4) | 0);
  if (((index >= 0) && (idx < this.endIndex$4))) {
    return idx
  } else {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + index))
  }
});
$c_sci_Vector.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Vector.prototype.display3__AO = (function() {
  return this.display3$4
});
$c_sci_Vector.prototype.apply__I__O = (function(index) {
  var idx = this.checkRangeConvert__p4__I__I(index);
  var xor = (idx ^ this.focus$4);
  return $f_sci_VectorPointer__getElem__I__I__O(this, idx, xor)
});
$c_sci_Vector.prototype.lengthCompare__I__I = (function(len) {
  return ((this.length__I() - len) | 0)
});
$c_sci_Vector.prototype.depth__I = (function() {
  return this.depth$4
});
$c_sci_Vector.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_sci_Vector.prototype.initIterator__sci_VectorIterator__V = (function(s) {
  var depth = this.depth$4;
  $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
  if (this.dirty$4) {
    var index = this.focus$4;
    $f_sci_VectorPointer__stabilize__I__V(s, index)
  };
  if ((s.depth$2 > 1)) {
    var index$1 = this.startIndex$4;
    var xor = (this.startIndex$4 ^ this.focus$4);
    $f_sci_VectorPointer__gotoPos__I__I__V(s, index$1, xor)
  }
});
$c_sci_Vector.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Vector.prototype.init___I__I__I = (function(startIndex, endIndex, focus) {
  this.startIndex$4 = startIndex;
  this.endIndex$4 = endIndex;
  this.focus$4 = focus;
  this.dirty$4 = false;
  return this
});
$c_sci_Vector.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$4 = x$1
});
$c_sci_Vector.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Vector$()
});
$c_sci_Vector.prototype.display0__AO = (function() {
  return this.display0$4
});
$c_sci_Vector.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$4 = x$1
});
$c_sci_Vector.prototype.display4__AO = (function() {
  return this.display4$4
});
$c_sci_Vector.prototype.iterator__sc_Iterator = (function() {
  return this.iterator__sci_VectorIterator()
});
$c_sci_Vector.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$4 = x$1
});
$c_sci_Vector.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Vector.prototype.length__I = (function() {
  return ((this.endIndex$4 - this.startIndex$4) | 0)
});
$c_sci_Vector.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$4 = x$1
});
$c_sci_Vector.prototype.sizeHintIfCheap__I = (function() {
  return this.length__I()
});
$c_sci_Vector.prototype.display1__AO = (function() {
  return this.display1$4
});
$c_sci_Vector.prototype.display5__AO = (function() {
  return this.display5$4
});
$c_sci_Vector.prototype.iterator__sci_VectorIterator = (function() {
  var s = new $c_sci_VectorIterator().init___I__I(this.startIndex$4, this.endIndex$4);
  this.initIterator__sci_VectorIterator__V(s);
  return s
});
$c_sci_Vector.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Vector.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$4 = x$1
});
$c_sci_Vector.prototype.display2__AO = (function() {
  return this.display2$4
});
$c_sci_Vector.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$4 = x$1
});
$c_sci_Vector.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$4 = x$1
});
var $d_sci_Vector = new $TypeData().initClass({
  sci_Vector: 0
}, false, "scala.collection.immutable.Vector", {
  sci_Vector: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_VectorPointer: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_Vector.prototype.$classData = $d_sci_Vector;
/** @constructor */
function $c_sci_WrappedString() {
  $c_sc_AbstractSeq.call(this);
  this.self$4 = null
}
$c_sci_WrappedString.prototype = new $h_sc_AbstractSeq();
$c_sci_WrappedString.prototype.constructor = $c_sci_WrappedString;
/** @constructor */
function $h_sci_WrappedString() {
  /*<skip>*/
}
$h_sci_WrappedString.prototype = $c_sci_WrappedString.prototype;
$c_sci_WrappedString.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_WrappedString.prototype.apply__I__O = (function(idx) {
  var thiz = this.self$4;
  var c = (65535 & $uI(thiz.charCodeAt(idx)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_WrappedString.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_WrappedString.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  var thiz = this.self$4;
  var c = (65535 & $uI(thiz.charCodeAt(n)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sci_WrappedString.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_WrappedString.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_IndexedSeq$()
});
$c_sci_WrappedString.prototype.toString__T = (function() {
  return this.self$4
});
$c_sci_WrappedString.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sci_WrappedString.prototype.iterator__sc_Iterator = (function() {
  var thiz = this.self$4;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(thiz.length))
});
$c_sci_WrappedString.prototype.length__I = (function() {
  var thiz = this.self$4;
  return $uI(thiz.length)
});
$c_sci_WrappedString.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_WrappedString.prototype.sizeHintIfCheap__I = (function() {
  var thiz = this.self$4;
  return $uI(thiz.length)
});
$c_sci_WrappedString.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_WrappedString.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sci_WrappedString.prototype.init___T = (function(self) {
  this.self$4 = self;
  return this
});
$c_sci_WrappedString.prototype.newBuilder__scm_Builder = (function() {
  return $m_sci_WrappedString$().newBuilder__scm_Builder()
});
var $d_sci_WrappedString = new $TypeData().initClass({
  sci_WrappedString: 0
}, false, "scala.collection.immutable.WrappedString", {
  sci_WrappedString: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_sci_WrappedString.prototype.$classData = $d_sci_WrappedString;
/** @constructor */
function $c_sci_$colon$colon() {
  $c_sci_List.call(this);
  this.head$5 = null;
  this.tl$5 = null
}
$c_sci_$colon$colon.prototype = new $h_sci_List();
$c_sci_$colon$colon.prototype.constructor = $c_sci_$colon$colon;
/** @constructor */
function $h_sci_$colon$colon() {
  /*<skip>*/
}
$h_sci_$colon$colon.prototype = $c_sci_$colon$colon.prototype;
$c_sci_$colon$colon.prototype.head__O = (function() {
  return this.head$5
});
$c_sci_$colon$colon.prototype.productPrefix__T = (function() {
  return "::"
});
$c_sci_$colon$colon.prototype.productArity__I = (function() {
  return 2
});
$c_sci_$colon$colon.prototype.tail__sci_List = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_$colon$colon.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.head$5;
      break
    }
    case 1: {
      return this.tl$5;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sci_$colon$colon.prototype.tail__O = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.init___O__sci_List = (function(head, tl) {
  this.head$5 = head;
  this.tl$5 = tl;
  return this
});
$c_sci_$colon$colon.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_$colon$colon = new $TypeData().initClass({
  sci_$colon$colon: 0
}, false, "scala.collection.immutable.$colon$colon", {
  sci_$colon$colon: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon.prototype.$classData = $d_sci_$colon$colon;
/** @constructor */
function $c_sci_Nil$() {
  $c_sci_List.call(this)
}
$c_sci_Nil$.prototype = new $h_sci_List();
$c_sci_Nil$.prototype.constructor = $c_sci_Nil$;
/** @constructor */
function $h_sci_Nil$() {
  /*<skip>*/
}
$h_sci_Nil$.prototype = $c_sci_Nil$.prototype;
$c_sci_Nil$.prototype.productPrefix__T = (function() {
  return "Nil"
});
$c_sci_Nil$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Nil$.prototype.init___ = (function() {
  return this
});
$c_sci_Nil$.prototype.productArity__I = (function() {
  return 0
});
$c_sci_Nil$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Nil$.prototype.tail__sci_List = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty list")
});
$c_sci_Nil$.prototype.equals__O__Z = (function(that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return x2.isEmpty__Z()
  } else {
    return false
  }
});
$c_sci_Nil$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_sci_Nil$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty list")
});
$c_sci_Nil$.prototype.tail__O = (function() {
  return this.tail__sci_List()
});
$c_sci_Nil$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_Nil$ = new $TypeData().initClass({
  sci_Nil$: 0
}, false, "scala.collection.immutable.Nil$", {
  sci_Nil$: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Nil$.prototype.$classData = $d_sci_Nil$;
var $n_sci_Nil$ = (void 0);
function $m_sci_Nil$() {
  if ((!$n_sci_Nil$)) {
    $n_sci_Nil$ = new $c_sci_Nil$().init___()
  };
  return $n_sci_Nil$
}
/** @constructor */
function $c_scm_LinkedList() {
  $c_scm_AbstractSeq.call(this);
  this.elem$5 = null;
  this.next$5 = null
}
$c_scm_LinkedList.prototype = new $h_scm_AbstractSeq();
$c_scm_LinkedList.prototype.constructor = $c_scm_LinkedList;
/** @constructor */
function $h_scm_LinkedList() {
  /*<skip>*/
}
$h_scm_LinkedList.prototype = $c_scm_LinkedList.prototype;
$c_scm_LinkedList.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_LinkedList.prototype.init___ = (function() {
  this.next$5 = this;
  return this
});
$c_scm_LinkedList.prototype.head__O = (function() {
  return $f_scm_LinkedListLike__head__O(this)
});
$c_scm_LinkedList.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_scm_LinkedListLike__apply__I__O(this, n)
});
$c_scm_LinkedList.prototype.isEmpty__Z = (function() {
  return $f_scm_LinkedListLike__isEmpty__Z(this)
});
$c_scm_LinkedList.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_LinkedList.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_LinkedList$()
});
$c_scm_LinkedList.prototype.foreach__F1__V = (function(f) {
  $f_scm_LinkedListLike__foreach__F1__V(this, f)
});
$c_scm_LinkedList.prototype.iterator__sc_Iterator = (function() {
  return new $c_scm_LinkedListLike$$anon$1().init___scm_LinkedListLike(this)
});
$c_scm_LinkedList.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_LinkedList.prototype.length__I = (function() {
  var elem = this;
  var acc = 0;
  return $f_scm_LinkedListLike__length0__pscm_LinkedListLike__scm_Seq__I__I(this, elem, acc)
});
$c_scm_LinkedList.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_LinkedList.prototype.tail__O = (function() {
  return $f_scm_LinkedListLike__tail__scm_Seq(this)
});
$c_scm_LinkedList.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_LinkedList.prototype.init___O__scm_LinkedList = (function(elem, next) {
  $c_scm_LinkedList.prototype.init___.call(this);
  if ((next !== null)) {
    this.elem$5 = elem;
    this.next$5 = next
  };
  return this
});
function $is_scm_LinkedList(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_LinkedList)))
}
function $as_scm_LinkedList(obj) {
  return (($is_scm_LinkedList(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.LinkedList"))
}
function $isArrayOf_scm_LinkedList(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_LinkedList)))
}
function $asArrayOf_scm_LinkedList(obj, depth) {
  return (($isArrayOf_scm_LinkedList(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.LinkedList;", depth))
}
var $d_scm_LinkedList = new $TypeData().initClass({
  scm_LinkedList: 0
}, false, "scala.collection.mutable.LinkedList", {
  scm_LinkedList: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  scm_LinkedListLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_LinkedList.prototype.$classData = $d_scm_LinkedList;
/** @constructor */
function $c_scm_AbstractBuffer() {
  $c_scm_AbstractSeq.call(this)
}
$c_scm_AbstractBuffer.prototype = new $h_scm_AbstractSeq();
$c_scm_AbstractBuffer.prototype.constructor = $c_scm_AbstractBuffer;
/** @constructor */
function $h_scm_AbstractBuffer() {
  /*<skip>*/
}
$h_scm_AbstractBuffer.prototype = $c_scm_AbstractBuffer.prototype;
$c_scm_AbstractBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
function $c_scm_WrappedArray() {
  $c_scm_AbstractSeq.call(this)
}
$c_scm_WrappedArray.prototype = new $h_scm_AbstractSeq();
$c_scm_WrappedArray.prototype.constructor = $c_scm_WrappedArray;
/** @constructor */
function $h_scm_WrappedArray() {
  /*<skip>*/
}
$h_scm_WrappedArray.prototype = $c_scm_WrappedArray.prototype;
$c_scm_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_WrappedArray.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_IndexedSeq$()
});
$c_scm_WrappedArray.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.length__I())
});
$c_scm_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_WrappedArray.prototype.sizeHintIfCheap__I = (function() {
  return this.length__I()
});
$c_scm_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_WrappedArray.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_WrappedArray.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_WrappedArrayBuilder().init___s_reflect_ClassTag(this.elemTag__s_reflect_ClassTag())
});
$c_scm_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
/** @constructor */
function $c_scm_MutableList() {
  $c_scm_AbstractSeq.call(this);
  this.first0$5 = null;
  this.last0$5 = null;
  this.len$5 = 0
}
$c_scm_MutableList.prototype = new $h_scm_AbstractSeq();
$c_scm_MutableList.prototype.constructor = $c_scm_MutableList;
/** @constructor */
function $h_scm_MutableList() {
  /*<skip>*/
}
$h_scm_MutableList.prototype = $c_scm_MutableList.prototype;
$c_scm_MutableList.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_MutableList.prototype.head__O = (function() {
  if ($f_sc_TraversableOnce__nonEmpty__Z(this)) {
    var this$1 = this.first0$5;
    return $f_scm_LinkedListLike__head__O(this$1)
  } else {
    throw new $c_ju_NoSuchElementException().init___()
  }
});
$c_scm_MutableList.prototype.init___ = (function() {
  this.first0$5 = new $c_scm_LinkedList().init___();
  this.last0$5 = this.first0$5;
  this.len$5 = 0;
  return this
});
$c_scm_MutableList.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_MutableList.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_MutableList.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  var this$1 = this.first0$5;
  return $f_scm_LinkedListLike__apply__I__O(this$1, n)
});
$c_scm_MutableList.prototype.isEmpty__Z = (function() {
  return (this.len$5 === 0)
});
$c_scm_MutableList.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_MutableList.prototype.prependElem__O__V = (function(elem) {
  this.first0$5 = new $c_scm_LinkedList().init___O__scm_LinkedList(elem, this.first0$5);
  if ((this.len$5 === 0)) {
    this.last0$5 = this.first0$5
  };
  this.len$5 = ((1 + this.len$5) | 0)
});
$c_scm_MutableList.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return $f_sc_LinearSeqOptimized__drop__I__sc_LinearSeqOptimized(this, n)
});
$c_scm_MutableList.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_MutableList(elem)
});
$c_scm_MutableList.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_MutableList$()
});
$c_scm_MutableList.prototype.foreach__F1__V = (function(f) {
  $f_sc_LinearSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_MutableList.prototype.tailImpl__scm_MutableList__V = (function(tl) {
  var requirement = $f_sc_TraversableOnce__nonEmpty__Z(this);
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed: tail of empty list")
  };
  var this$2 = this.first0$5;
  tl.first0$5 = $as_scm_LinkedList($f_scm_LinkedListLike__tail__scm_Seq(this$2));
  tl.len$5 = (((-1) + this.len$5) | 0);
  tl.last0$5 = ((tl.len$5 === 0) ? tl.first0$5 : this.last0$5)
});
$c_scm_MutableList.prototype.result__O = (function() {
  return this
});
$c_scm_MutableList.prototype.iterator__sc_Iterator = (function() {
  return (this.isEmpty__Z() ? $m_sc_Iterator$().empty$1 : new $c_scm_MutableList$$anon$1().init___scm_MutableList(this))
});
$c_scm_MutableList.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_MutableList.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_MutableList.prototype.length__I = (function() {
  return this.len$5
});
$c_scm_MutableList.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_MutableList.prototype.tail__O = (function() {
  return this.tail__scm_MutableList()
});
$c_scm_MutableList.prototype.appendElem__O__V = (function(elem) {
  if ((this.len$5 === 0)) {
    this.prependElem__O__V(elem)
  } else {
    var this$1 = this.last0$5;
    var x$1 = new $c_scm_LinkedList().init___();
    this$1.next$5 = x$1;
    var this$2 = this.last0$5;
    this.last0$5 = this$2.next$5;
    this.last0$5.elem$5 = elem;
    var this$3 = this.last0$5;
    var x$1$1 = new $c_scm_LinkedList().init___();
    this$3.next$5 = x$1$1;
    this.len$5 = ((1 + this.len$5) | 0)
  }
});
$c_scm_MutableList.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_MutableList(elem)
});
$c_scm_MutableList.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_MutableList.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_MutableList.prototype.$$plus$eq__O__scm_MutableList = (function(elem) {
  this.appendElem__O__V(elem);
  return this
});
$c_scm_MutableList.prototype.tail__scm_MutableList = (function() {
  var tl = new $c_scm_MutableList().init___();
  this.tailImpl__scm_MutableList__V(tl);
  return tl
});
$c_scm_MutableList.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_MutableList().init___()
});
$c_scm_MutableList.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
function $is_scm_MutableList(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_MutableList)))
}
function $as_scm_MutableList(obj) {
  return (($is_scm_MutableList(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.MutableList"))
}
function $isArrayOf_scm_MutableList(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_MutableList)))
}
function $asArrayOf_scm_MutableList(obj, depth) {
  return (($isArrayOf_scm_MutableList(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.MutableList;", depth))
}
var $d_scm_MutableList = new $TypeData().initClass({
  scm_MutableList: 0
}, false, "scala.collection.mutable.MutableList", {
  scm_MutableList: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_MutableList.prototype.$classData = $d_scm_MutableList;
/** @constructor */
function $c_scm_Queue() {
  $c_scm_MutableList.call(this)
}
$c_scm_Queue.prototype = new $h_scm_MutableList();
$c_scm_Queue.prototype.constructor = $c_scm_Queue;
/** @constructor */
function $h_scm_Queue() {
  /*<skip>*/
}
$h_scm_Queue.prototype = $c_scm_Queue.prototype;
$c_scm_Queue.prototype.init___scm_LinkedList__scm_LinkedList__I = (function(fst, lst, lng) {
  $c_scm_MutableList.prototype.init___.call(this);
  this.first0$5 = fst;
  this.last0$5 = lst;
  this.len$5 = lng;
  return this
});
$c_scm_Queue.prototype.init___ = (function() {
  $c_scm_MutableList.prototype.init___.call(this);
  return this
});
$c_scm_Queue.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_Queue.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_Queue$()
});
$c_scm_Queue.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_Queue.prototype.decrementLength__p6__V = (function() {
  this.len$5 = (((-1) + this.len$5) | 0);
  if ((this.len$5 === 0)) {
    this.last0$5 = this.first0$5
  }
});
$c_scm_Queue.prototype.tail__O = (function() {
  return this.tail__scm_Queue()
});
$c_scm_Queue.prototype.tail__scm_Queue = (function() {
  var tl = new $c_scm_Queue().init___();
  this.tailImpl__scm_MutableList__V(tl);
  return tl
});
$c_scm_Queue.prototype.tail__scm_MutableList = (function() {
  return this.tail__scm_Queue()
});
$c_scm_Queue.prototype.newBuilder__scm_Builder = (function() {
  return $m_scm_Queue$().newBuilder__scm_Builder()
});
var $d_scm_Queue = new $TypeData().initClass({
  scm_Queue: 0
}, false, "scala.collection.mutable.Queue", {
  scm_Queue: 1,
  scm_MutableList: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_Queue.prototype.$classData = $d_scm_Queue;
/** @constructor */
function $c_scm_WrappedArray$ofBoolean() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofBoolean.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofBoolean.prototype.constructor = $c_scm_WrappedArray$ofBoolean;
/** @constructor */
function $h_scm_WrappedArray$ofBoolean() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofBoolean.prototype = $c_scm_WrappedArray$ofBoolean.prototype;
$c_scm_WrappedArray$ofBoolean.prototype.apply__I__O = (function(index) {
  return this.apply$mcZI$sp__I__Z(index)
});
$c_scm_WrappedArray$ofBoolean.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.apply$mcZI$sp__I__Z(index)
});
$c_scm_WrappedArray$ofBoolean.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__Z__V(index, $uZ(elem))
});
$c_scm_WrappedArray$ofBoolean.prototype.apply$mcZI$sp__I__Z = (function(index) {
  return this.array$6.u[index]
});
$c_scm_WrappedArray$ofBoolean.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofBoolean.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$BooleanManifest$()
});
$c_scm_WrappedArray$ofBoolean.prototype.update__I__Z__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
$c_scm_WrappedArray$ofBoolean.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofBoolean.prototype.init___AZ = (function(array) {
  this.array$6 = array;
  return this
});
var $d_scm_WrappedArray$ofBoolean = new $TypeData().initClass({
  scm_WrappedArray$ofBoolean: 0
}, false, "scala.collection.mutable.WrappedArray$ofBoolean", {
  scm_WrappedArray$ofBoolean: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofBoolean.prototype.$classData = $d_scm_WrappedArray$ofBoolean;
/** @constructor */
function $c_scm_WrappedArray$ofByte() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofByte.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofByte.prototype.constructor = $c_scm_WrappedArray$ofByte;
/** @constructor */
function $h_scm_WrappedArray$ofByte() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofByte.prototype = $c_scm_WrappedArray$ofByte.prototype;
$c_scm_WrappedArray$ofByte.prototype.apply__I__O = (function(index) {
  return this.apply__I__B(index)
});
$c_scm_WrappedArray$ofByte.prototype.apply__O__O = (function(v1) {
  return this.apply__I__B($uI(v1))
});
$c_scm_WrappedArray$ofByte.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__B__V(index, $uB(elem))
});
$c_scm_WrappedArray$ofByte.prototype.apply__I__B = (function(index) {
  return this.array$6.u[index]
});
$c_scm_WrappedArray$ofByte.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofByte.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$ByteManifest$()
});
$c_scm_WrappedArray$ofByte.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofByte.prototype.init___AB = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofByte.prototype.update__I__B__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
var $d_scm_WrappedArray$ofByte = new $TypeData().initClass({
  scm_WrappedArray$ofByte: 0
}, false, "scala.collection.mutable.WrappedArray$ofByte", {
  scm_WrappedArray$ofByte: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofByte.prototype.$classData = $d_scm_WrappedArray$ofByte;
/** @constructor */
function $c_scm_WrappedArray$ofChar() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofChar.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofChar.prototype.constructor = $c_scm_WrappedArray$ofChar;
/** @constructor */
function $h_scm_WrappedArray$ofChar() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofChar.prototype = $c_scm_WrappedArray$ofChar.prototype;
$c_scm_WrappedArray$ofChar.prototype.apply__I__O = (function(index) {
  var c = this.apply__I__C(index);
  return new $c_jl_Character().init___C(c)
});
$c_scm_WrappedArray$ofChar.prototype.apply__O__O = (function(v1) {
  var c = this.apply__I__C($uI(v1));
  return new $c_jl_Character().init___C(c)
});
$c_scm_WrappedArray$ofChar.prototype.update__I__O__V = (function(index, elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  this.update__I__C__V(index, jsx$1)
});
$c_scm_WrappedArray$ofChar.prototype.apply__I__C = (function(index) {
  return this.array$6.u[index]
});
$c_scm_WrappedArray$ofChar.prototype.update__I__C__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
$c_scm_WrappedArray$ofChar.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofChar.prototype.init___AC = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofChar.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$CharManifest$()
});
$c_scm_WrappedArray$ofChar.prototype.array__O = (function() {
  return this.array$6
});
var $d_scm_WrappedArray$ofChar = new $TypeData().initClass({
  scm_WrappedArray$ofChar: 0
}, false, "scala.collection.mutable.WrappedArray$ofChar", {
  scm_WrappedArray$ofChar: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofChar.prototype.$classData = $d_scm_WrappedArray$ofChar;
/** @constructor */
function $c_scm_WrappedArray$ofDouble() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofDouble.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofDouble.prototype.constructor = $c_scm_WrappedArray$ofDouble;
/** @constructor */
function $h_scm_WrappedArray$ofDouble() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofDouble.prototype = $c_scm_WrappedArray$ofDouble.prototype;
$c_scm_WrappedArray$ofDouble.prototype.apply__I__O = (function(index) {
  return this.apply$mcDI$sp__I__D(index)
});
$c_scm_WrappedArray$ofDouble.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.apply$mcDI$sp__I__D(index)
});
$c_scm_WrappedArray$ofDouble.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__D__V(index, $uD(elem))
});
$c_scm_WrappedArray$ofDouble.prototype.init___AD = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofDouble.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofDouble.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$DoubleManifest$()
});
$c_scm_WrappedArray$ofDouble.prototype.update__I__D__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
$c_scm_WrappedArray$ofDouble.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofDouble.prototype.apply$mcDI$sp__I__D = (function(index) {
  return this.array$6.u[index]
});
var $d_scm_WrappedArray$ofDouble = new $TypeData().initClass({
  scm_WrappedArray$ofDouble: 0
}, false, "scala.collection.mutable.WrappedArray$ofDouble", {
  scm_WrappedArray$ofDouble: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofDouble.prototype.$classData = $d_scm_WrappedArray$ofDouble;
/** @constructor */
function $c_scm_WrappedArray$ofFloat() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofFloat.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofFloat.prototype.constructor = $c_scm_WrappedArray$ofFloat;
/** @constructor */
function $h_scm_WrappedArray$ofFloat() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofFloat.prototype = $c_scm_WrappedArray$ofFloat.prototype;
$c_scm_WrappedArray$ofFloat.prototype.apply__I__O = (function(index) {
  return this.apply$mcFI$sp__I__F(index)
});
$c_scm_WrappedArray$ofFloat.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.apply$mcFI$sp__I__F(index)
});
$c_scm_WrappedArray$ofFloat.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__F__V(index, $uF(elem))
});
$c_scm_WrappedArray$ofFloat.prototype.init___AF = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofFloat.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofFloat.prototype.apply$mcFI$sp__I__F = (function(index) {
  return this.array$6.u[index]
});
$c_scm_WrappedArray$ofFloat.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$FloatManifest$()
});
$c_scm_WrappedArray$ofFloat.prototype.update__I__F__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
$c_scm_WrappedArray$ofFloat.prototype.array__O = (function() {
  return this.array$6
});
var $d_scm_WrappedArray$ofFloat = new $TypeData().initClass({
  scm_WrappedArray$ofFloat: 0
}, false, "scala.collection.mutable.WrappedArray$ofFloat", {
  scm_WrappedArray$ofFloat: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofFloat.prototype.$classData = $d_scm_WrappedArray$ofFloat;
/** @constructor */
function $c_scm_WrappedArray$ofInt() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofInt.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofInt.prototype.constructor = $c_scm_WrappedArray$ofInt;
/** @constructor */
function $h_scm_WrappedArray$ofInt() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofInt.prototype = $c_scm_WrappedArray$ofInt.prototype;
$c_scm_WrappedArray$ofInt.prototype.apply__I__O = (function(index) {
  return this.apply$mcII$sp__I__I(index)
});
$c_scm_WrappedArray$ofInt.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.apply$mcII$sp__I__I(index)
});
$c_scm_WrappedArray$ofInt.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__I__V(index, $uI(elem))
});
$c_scm_WrappedArray$ofInt.prototype.update__I__I__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
$c_scm_WrappedArray$ofInt.prototype.apply$mcII$sp__I__I = (function(index) {
  return this.array$6.u[index]
});
$c_scm_WrappedArray$ofInt.prototype.init___AI = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofInt.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofInt.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$IntManifest$()
});
$c_scm_WrappedArray$ofInt.prototype.array__O = (function() {
  return this.array$6
});
var $d_scm_WrappedArray$ofInt = new $TypeData().initClass({
  scm_WrappedArray$ofInt: 0
}, false, "scala.collection.mutable.WrappedArray$ofInt", {
  scm_WrappedArray$ofInt: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofInt.prototype.$classData = $d_scm_WrappedArray$ofInt;
/** @constructor */
function $c_scm_WrappedArray$ofLong() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofLong.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofLong.prototype.constructor = $c_scm_WrappedArray$ofLong;
/** @constructor */
function $h_scm_WrappedArray$ofLong() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofLong.prototype = $c_scm_WrappedArray$ofLong.prototype;
$c_scm_WrappedArray$ofLong.prototype.apply__I__O = (function(index) {
  return this.apply$mcJI$sp__I__J(index)
});
$c_scm_WrappedArray$ofLong.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.apply$mcJI$sp__I__J(index)
});
$c_scm_WrappedArray$ofLong.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__J__V(index, $uJ(elem))
});
$c_scm_WrappedArray$ofLong.prototype.init___AJ = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofLong.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofLong.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$LongManifest$()
});
$c_scm_WrappedArray$ofLong.prototype.update__I__J__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
$c_scm_WrappedArray$ofLong.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofLong.prototype.apply$mcJI$sp__I__J = (function(index) {
  return this.array$6.u[index]
});
var $d_scm_WrappedArray$ofLong = new $TypeData().initClass({
  scm_WrappedArray$ofLong: 0
}, false, "scala.collection.mutable.WrappedArray$ofLong", {
  scm_WrappedArray$ofLong: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofLong.prototype.$classData = $d_scm_WrappedArray$ofLong;
/** @constructor */
function $c_scm_WrappedArray$ofRef() {
  $c_scm_WrappedArray.call(this);
  this.elemTag$6 = null;
  this.array$6 = null;
  this.bitmap$0$6 = false
}
$c_scm_WrappedArray$ofRef.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofRef.prototype.constructor = $c_scm_WrappedArray$ofRef;
/** @constructor */
function $h_scm_WrappedArray$ofRef() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofRef.prototype = $c_scm_WrappedArray$ofRef.prototype;
$c_scm_WrappedArray$ofRef.prototype.apply__I__O = (function(index) {
  return this.array$6.u[index]
});
$c_scm_WrappedArray$ofRef.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_scm_WrappedArray$ofRef.prototype.update__I__O__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
$c_scm_WrappedArray$ofRef.prototype.elemTag$lzycompute__p6__s_reflect_ClassTag = (function() {
  if ((!this.bitmap$0$6)) {
    var jsx$1 = $m_s_reflect_ClassTag$();
    var this$1 = this.array$6;
    this.elemTag$6 = jsx$1.apply__jl_Class__s_reflect_ClassTag($objectGetClass(this$1).getComponentType__jl_Class());
    this.bitmap$0$6 = true
  };
  return this.elemTag$6
});
$c_scm_WrappedArray$ofRef.prototype.init___AO = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofRef.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofRef.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ((!this.bitmap$0$6) ? this.elemTag$lzycompute__p6__s_reflect_ClassTag() : this.elemTag$6)
});
$c_scm_WrappedArray$ofRef.prototype.array__O = (function() {
  return this.array$6
});
function $is_scm_WrappedArray$ofRef(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofRef)))
}
function $as_scm_WrappedArray$ofRef(obj) {
  return (($is_scm_WrappedArray$ofRef(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofRef"))
}
function $isArrayOf_scm_WrappedArray$ofRef(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofRef)))
}
function $asArrayOf_scm_WrappedArray$ofRef(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofRef(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofRef;", depth))
}
var $d_scm_WrappedArray$ofRef = new $TypeData().initClass({
  scm_WrappedArray$ofRef: 0
}, false, "scala.collection.mutable.WrappedArray$ofRef", {
  scm_WrappedArray$ofRef: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofRef.prototype.$classData = $d_scm_WrappedArray$ofRef;
/** @constructor */
function $c_scm_WrappedArray$ofShort() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofShort.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofShort.prototype.constructor = $c_scm_WrappedArray$ofShort;
/** @constructor */
function $h_scm_WrappedArray$ofShort() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofShort.prototype = $c_scm_WrappedArray$ofShort.prototype;
$c_scm_WrappedArray$ofShort.prototype.apply__I__O = (function(index) {
  return this.apply__I__S(index)
});
$c_scm_WrappedArray$ofShort.prototype.apply__O__O = (function(v1) {
  return this.apply__I__S($uI(v1))
});
$c_scm_WrappedArray$ofShort.prototype.update__I__S__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
$c_scm_WrappedArray$ofShort.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__S__V(index, $uS(elem))
});
$c_scm_WrappedArray$ofShort.prototype.init___AS = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofShort.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofShort.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$ShortManifest$()
});
$c_scm_WrappedArray$ofShort.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofShort.prototype.apply__I__S = (function(index) {
  return this.array$6.u[index]
});
var $d_scm_WrappedArray$ofShort = new $TypeData().initClass({
  scm_WrappedArray$ofShort: 0
}, false, "scala.collection.mutable.WrappedArray$ofShort", {
  scm_WrappedArray$ofShort: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofShort.prototype.$classData = $d_scm_WrappedArray$ofShort;
/** @constructor */
function $c_scm_WrappedArray$ofUnit() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofUnit.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofUnit.prototype.constructor = $c_scm_WrappedArray$ofUnit;
/** @constructor */
function $h_scm_WrappedArray$ofUnit() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofUnit.prototype = $c_scm_WrappedArray$ofUnit.prototype;
$c_scm_WrappedArray$ofUnit.prototype.apply$mcVI$sp__I__V = (function(index) {
  this.array$6.u[index]
});
$c_scm_WrappedArray$ofUnit.prototype.apply__I__O = (function(index) {
  this.apply$mcVI$sp__I__V(index)
});
$c_scm_WrappedArray$ofUnit.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  this.apply$mcVI$sp__I__V(index)
});
$c_scm_WrappedArray$ofUnit.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__sr_BoxedUnit__V(index, $asUnit(elem))
});
$c_scm_WrappedArray$ofUnit.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofUnit.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$UnitManifest$()
});
$c_scm_WrappedArray$ofUnit.prototype.init___Asr_BoxedUnit = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofUnit.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofUnit.prototype.update__I__sr_BoxedUnit__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
var $d_scm_WrappedArray$ofUnit = new $TypeData().initClass({
  scm_WrappedArray$ofUnit: 0
}, false, "scala.collection.mutable.WrappedArray$ofUnit", {
  scm_WrappedArray$ofUnit: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofUnit.prototype.$classData = $d_scm_WrappedArray$ofUnit;
/** @constructor */
function $c_scm_ListBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.scala$collection$mutable$ListBuffer$$start$6 = null;
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
}
$c_scm_ListBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ListBuffer.prototype.constructor = $c_scm_ListBuffer;
/** @constructor */
function $h_scm_ListBuffer() {
  /*<skip>*/
}
$h_scm_ListBuffer.prototype = $c_scm_ListBuffer.prototype;
$c_scm_ListBuffer.prototype.copy__p6__V = (function() {
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    return (void 0)
  };
  var cursor = this.scala$collection$mutable$ListBuffer$$start$6;
  var this$1 = this.last0$6;
  var limit = this$1.tl$5;
  this.clear__V();
  while ((cursor !== limit)) {
    this.$$plus$eq__O__scm_ListBuffer(cursor.head__O());
    var this$2 = cursor;
    cursor = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.init___ = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.exported$6 = false;
  this.len$6 = 0;
  return this
});
$c_scm_ListBuffer.prototype.apply__I__O = (function(n) {
  if (((n < 0) || (n >= this.len$6))) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  } else {
    var this$2 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $f_sc_LinearSeqOptimized__apply__I__O(this$2, n)
  }
});
$c_scm_ListBuffer.prototype.lengthCompare__I__I = (function(len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this$1, len)
});
$c_scm_ListBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this$1, that)
});
$c_scm_ListBuffer.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_scm_ListBuffer.prototype.isEmpty__Z = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()
});
$c_scm_ListBuffer.prototype.toList__sci_List = (function() {
  this.exported$6 = (!this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z());
  return this.scala$collection$mutable$ListBuffer$$start$6
});
$c_scm_ListBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ListBuffer.prototype.equals__O__Z = (function(that) {
  if ($is_scm_ListBuffer(that)) {
    var x2 = $as_scm_ListBuffer(that);
    return this.scala$collection$mutable$ListBuffer$$start$6.equals__O__Z(x2.scala$collection$mutable$ListBuffer$$start$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_ListBuffer.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ListBuffer$()
});
$c_scm_ListBuffer.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$2 = these;
    these = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.result__O = (function() {
  return this.toList__sci_List()
});
$c_scm_ListBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_scm_ListBuffer$$anon$1().init___scm_ListBuffer(this)
});
$c_scm_ListBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_ListBuffer.prototype.length__I = (function() {
  return this.len$6
});
$c_scm_ListBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ListBuffer.prototype.toStream__sci_Stream = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream()
});
$c_scm_ListBuffer.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this$1, b, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_ListBuffer = (function(x) {
  if (this.exported$6) {
    this.copy__p6__V()
  };
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    this.scala$collection$mutable$ListBuffer$$start$6 = this.last0$6
  } else {
    var last1 = this.last0$6;
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    last1.tl$5 = this.last0$6
  };
  this.len$6 = ((1 + this.len$6) | 0);
  return this
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_ListBuffer.prototype.clear__V = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
$c_scm_ListBuffer.prototype.nonEmpty__Z = (function() {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__nonEmpty__Z(this$1)
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer = (function(xs) {
  _$plus$plus$eq: while (true) {
    var x1 = xs;
    if ((x1 !== null)) {
      if ((x1 === this)) {
        var n = this.len$6;
        xs = $as_sc_TraversableOnce($f_sc_IterableLike__take__I__O(this, n));
        continue _$plus$plus$eq
      }
    };
    return $as_scm_ListBuffer($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs)
});
$c_scm_ListBuffer.prototype.stringPrefix__T = (function() {
  return "ListBuffer"
});
function $is_scm_ListBuffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ListBuffer)))
}
function $as_scm_ListBuffer(obj) {
  return (($is_scm_ListBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ListBuffer"))
}
function $isArrayOf_scm_ListBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)))
}
function $asArrayOf_scm_ListBuffer(obj, depth) {
  return (($isArrayOf_scm_ListBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ListBuffer;", depth))
}
var $d_scm_ListBuffer = new $TypeData().initClass({
  scm_ListBuffer: 0
}, false, "scala.collection.mutable.ListBuffer", {
  scm_ListBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_SeqForwarder: 1,
  scg_IterableForwarder: 1,
  scg_TraversableForwarder: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer.prototype.$classData = $d_scm_ListBuffer;
/** @constructor */
function $c_scm_StringBuilder() {
  $c_scm_AbstractSeq.call(this);
  this.underlying$5 = null
}
$c_scm_StringBuilder.prototype = new $h_scm_AbstractSeq();
$c_scm_StringBuilder.prototype.constructor = $c_scm_StringBuilder;
/** @constructor */
function $h_scm_StringBuilder() {
  /*<skip>*/
}
$h_scm_StringBuilder.prototype = $c_scm_StringBuilder.prototype;
$c_scm_StringBuilder.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_StringBuilder.prototype.$$plus$eq__C__scm_StringBuilder = (function(x) {
  this.append__C__scm_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.init___ = (function() {
  $c_scm_StringBuilder.prototype.init___I__T.call(this, 16, "");
  return this
});
$c_scm_StringBuilder.prototype.apply__I__O = (function(idx) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & $uI(thiz.charCodeAt(idx)));
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_StringBuilder.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & $uI(thiz.charCodeAt(index)));
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_StringBuilder.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return $as_T(thiz.substring(start, end))
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_IndexedSeq$()
});
$c_scm_StringBuilder.prototype.toString__T = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
$c_scm_StringBuilder.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_StringBuilder.prototype.result__O = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
$c_scm_StringBuilder.prototype.append__T__scm_StringBuilder = (function(s) {
  this.underlying$5.append__T__jl_StringBuilder(s);
  return this
});
$c_scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(thiz.length))
});
$c_scm_StringBuilder.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_StringBuilder.prototype.init___I__T = (function(initCapacity, initValue) {
  $c_scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, new $c_jl_StringBuilder().init___I((($uI(initValue.length) + initCapacity) | 0)).append__T__jl_StringBuilder(initValue));
  return this
});
$c_scm_StringBuilder.prototype.length__I = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return $uI(thiz.length)
});
$c_scm_StringBuilder.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.sizeHintIfCheap__I = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return $uI(thiz.length)
});
$c_scm_StringBuilder.prototype.init___jl_StringBuilder = (function(underlying) {
  this.underlying$5 = underlying;
  return this
});
$c_scm_StringBuilder.prototype.append__O__scm_StringBuilder = (function(x) {
  this.underlying$5.append__T__jl_StringBuilder($m_sjsr_RuntimeString$().valueOf__O__T(x));
  return this
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_StringBuilder.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_StringBuilder.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_StringBuilder.prototype.append__C__scm_StringBuilder = (function(x) {
  this.underlying$5.append__C__jl_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_StringBuilder().init___())
});
$c_scm_StringBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_StringBuilder = new $TypeData().initClass({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  jl_CharSequence: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder.prototype.$classData = $d_scm_StringBuilder;
/** @constructor */
function $c_sjs_js_WrappedArray() {
  $c_scm_AbstractBuffer.call(this);
  this.array$6 = null
}
$c_sjs_js_WrappedArray.prototype = new $h_scm_AbstractBuffer();
$c_sjs_js_WrappedArray.prototype.constructor = $c_sjs_js_WrappedArray;
/** @constructor */
function $h_sjs_js_WrappedArray() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray.prototype = $c_sjs_js_WrappedArray.prototype;
$c_sjs_js_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.init___ = (function() {
  $c_sjs_js_WrappedArray.prototype.init___sjs_js_Array.call(this, []);
  return this
});
$c_sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sjs_js_WrappedArray.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sjs_js_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.array$6.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sjs_js_WrappedArray$()
});
$c_sjs_js_WrappedArray.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sjs_js_WrappedArray.prototype.result__O = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(this.array$6.length))
});
$c_sjs_js_WrappedArray.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_sjs_js_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.length__I = (function() {
  return $uI(this.array$6.length)
});
$c_sjs_js_WrappedArray.prototype.sizeHintIfCheap__I = (function() {
  return $uI(this.array$6.length)
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  this.array$6.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sjs_js_WrappedArray.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sjs_js_WrappedArray.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sjs_js_WrappedArray.prototype.init___sjs_js_Array = (function(array) {
  this.array$6 = array;
  return this
});
$c_sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
var $d_sjs_js_WrappedArray = new $TypeData().initClass({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1
});
$c_sjs_js_WrappedArray.prototype.$classData = $d_sjs_js_WrappedArray;
/** @constructor */
function $c_scm_ArrayBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.initialSize$6 = 0;
  this.array$6 = null;
  this.size0$6 = 0
}
$c_scm_ArrayBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ArrayBuffer.prototype.constructor = $c_scm_ArrayBuffer;
/** @constructor */
function $h_scm_ArrayBuffer() {
  /*<skip>*/
}
$h_scm_ArrayBuffer.prototype = $c_scm_ArrayBuffer.prototype;
$c_scm_ArrayBuffer.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_ArrayBuffer = (function(elem) {
  var n = ((1 + this.size0$6) | 0);
  $f_scm_ResizableArray__ensureSize__I__V(this, n);
  this.array$6.u[this.size0$6] = elem;
  this.size0$6 = ((1 + this.size0$6) | 0);
  return this
});
$c_scm_ArrayBuffer.prototype.init___ = (function() {
  $c_scm_ArrayBuffer.prototype.init___I.call(this, 16);
  return this
});
$c_scm_ArrayBuffer.prototype.apply__I__O = (function(idx) {
  return $f_scm_ResizableArray__apply__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayBuffer.prototype.apply__O__O = (function(v1) {
  var idx = $uI(v1);
  return $f_scm_ResizableArray__apply__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ArrayBuffer$()
});
$c_scm_ArrayBuffer.prototype.foreach__F1__V = (function(f) {
  $f_scm_ResizableArray__foreach__F1__V(this, f)
});
$c_scm_ArrayBuffer.prototype.result__O = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.size0$6)
});
$c_scm_ArrayBuffer.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_ArrayBuffer.prototype.init___I = (function(initialSize) {
  this.initialSize$6 = initialSize;
  $f_scm_ResizableArray__$$init$__V(this);
  return this
});
$c_scm_ArrayBuffer.prototype.length__I = (function() {
  return this.size0$6
});
$c_scm_ArrayBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.sizeHintIfCheap__I = (function() {
  return this.size0$6
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer = (function(xs) {
  if ($is_sc_IndexedSeqLike(xs)) {
    var x2 = $as_sc_IndexedSeqLike(xs);
    var n = x2.length__I();
    var n$1 = ((this.size0$6 + n) | 0);
    $f_scm_ResizableArray__ensureSize__I__V(this, n$1);
    x2.copyToArray__O__I__I__V(this.array$6, this.size0$6, n);
    this.size0$6 = ((this.size0$6 + n) | 0);
    return this
  } else {
    return $as_scm_ArrayBuffer($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.sizeHint__I__V = (function(len) {
  if (((len > this.size0$6) && (len >= 1))) {
    var newarray = $newArrayObject($d_O.getArrayOf(), [len]);
    var src = this.array$6;
    var length = this.size0$6;
    $systemArraycopy(src, 0, newarray, 0, length);
    this.array$6 = newarray
  }
});
$c_scm_ArrayBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ResizableArray__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayBuffer.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs)
});
$c_scm_ArrayBuffer.prototype.stringPrefix__T = (function() {
  return "ArrayBuffer"
});
function $is_scm_ArrayBuffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuffer)))
}
function $as_scm_ArrayBuffer(obj) {
  return (($is_scm_ArrayBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuffer"))
}
function $isArrayOf_scm_ArrayBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)))
}
function $asArrayOf_scm_ArrayBuffer(obj, depth) {
  return (($isArrayOf_scm_ArrayBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuffer;", depth))
}
var $d_scm_ArrayBuffer = new $TypeData().initClass({
  scm_ArrayBuffer: 0
}, false, "scala.collection.mutable.ArrayBuffer", {
  scm_ArrayBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scm_ResizableArray: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer.prototype.$classData = $d_scm_ArrayBuffer;
}).call(this);
//# sourceMappingURL=scalavator-html5-fastopt.js.map