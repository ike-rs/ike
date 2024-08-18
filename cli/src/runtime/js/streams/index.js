// @bun
// node_modules/web-streams-polyfill/dist/ponyfill.mjs
function e() {
}
function t(e2) {
  return typeof e2 == "object" && e2 !== null || typeof e2 == "function";
}
function o(e2, t2) {
  try {
    Object.defineProperty(e2, "name", { value: t2, configurable: true });
  } catch (e3) {
  }
}
function u(e2) {
  return new n(e2);
}
function c(e2) {
  return u((t2) => t2(e2));
}
function d(e2) {
  return l(e2);
}
function f(e2, t2, r) {
  return i.call(e2, t2, r);
}
function b(e2, t2, o2) {
  f(f(e2, t2, o2), undefined, r);
}
function h(e2, t2) {
  b(e2, t2);
}
function m(e2, t2) {
  b(e2, undefined, t2);
}
function _(e2, t2, r) {
  return f(e2, t2, r);
}
function p(e2) {
  f(e2, undefined, r);
}
function S(e2, t2, r) {
  if (typeof e2 != "function")
    throw new TypeError("Argument is not a function");
  return Function.prototype.apply.call(e2, t2, r);
}
function g(e2, t2, r) {
  try {
    return c(S(e2, t2, r));
  } catch (e3) {
    return d(e3);
  }
}
function q(e2, t2) {
  e2._ownerReadableStream = t2, t2._reader = e2, t2._state === "readable" ? B(e2) : t2._state === "closed" ? function(e3) {
    B(e3), A(e3);
  }(e2) : k(e2, t2._storedError);
}
function E(e2, t2) {
  return Or(e2._ownerReadableStream, t2);
}
function W(e2) {
  const t2 = e2._ownerReadableStream;
  t2._state === "readable" ? j(e2, new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")) : function(e3, t3) {
    k(e3, t3);
  }(e2, new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")), t2._readableStreamController[P](), t2._reader = undefined, e2._ownerReadableStream = undefined;
}
function O(e2) {
  return new TypeError("Cannot " + e2 + " a stream using a released reader");
}
function B(e2) {
  e2._closedPromise = u((t2, r) => {
    e2._closedPromise_resolve = t2, e2._closedPromise_reject = r;
  });
}
function k(e2, t2) {
  B(e2), j(e2, t2);
}
function j(e2, t2) {
  e2._closedPromise_reject !== undefined && (p(e2._closedPromise), e2._closedPromise_reject(t2), e2._closedPromise_resolve = undefined, e2._closedPromise_reject = undefined);
}
function A(e2) {
  e2._closedPromise_resolve !== undefined && (e2._closedPromise_resolve(undefined), e2._closedPromise_resolve = undefined, e2._closedPromise_reject = undefined);
}
function L(e2, t2) {
  if (e2 !== undefined && (typeof (r = e2) != "object" && typeof r != "function"))
    throw new TypeError(`${t2} is not an object.`);
  var r;
}
function F(e2, t2) {
  if (typeof e2 != "function")
    throw new TypeError(`${t2} is not a function.`);
}
function I(e2, t2) {
  if (!function(e3) {
    return typeof e3 == "object" && e3 !== null || typeof e3 == "function";
  }(e2))
    throw new TypeError(`${t2} is not an object.`);
}
function $(e2, t2, r) {
  if (e2 === undefined)
    throw new TypeError(`Parameter ${t2} is required in '${r}'.`);
}
function M(e2, t2, r) {
  if (e2 === undefined)
    throw new TypeError(`${t2} is required in '${r}'.`);
}
function Y(e2) {
  return Number(e2);
}
function x(e2) {
  return e2 === 0 ? 0 : e2;
}
function Q(e2, t2) {
  const r = Number.MAX_SAFE_INTEGER;
  let o2 = Number(e2);
  if (o2 = x(o2), !z(o2))
    throw new TypeError(`${t2} is not a finite number`);
  if (o2 = function(e3) {
    return x(D(e3));
  }(o2), o2 < 0 || o2 > r)
    throw new TypeError(`${t2} is outside the accepted range of 0 to ${r}, inclusive`);
  return z(o2) && o2 !== 0 ? o2 : 0;
}
function N(e2, t2) {
  if (!Er(e2))
    throw new TypeError(`${t2} is not a ReadableStream.`);
}
function H(e2) {
  return new ReadableStreamDefaultReader(e2);
}
function V(e2, t2) {
  e2._reader._readRequests.push(t2);
}
function U(e2, t2, r) {
  const o2 = e2._reader._readRequests.shift();
  r ? o2._closeSteps() : o2._chunkSteps(t2);
}
function G(e2) {
  return e2._reader._readRequests.length;
}
function X(e2) {
  const t2 = e2._reader;
  return t2 !== undefined && !!J(t2);
}
function J(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_readRequests") && e2 instanceof ReadableStreamDefaultReader);
}
function K(e2, t2) {
  const r = e2._ownerReadableStream;
  r._disturbed = true, r._state === "closed" ? t2._closeSteps() : r._state === "errored" ? t2._errorSteps(r._storedError) : r._readableStreamController[C](t2);
}
function Z(e2, t2) {
  const r = e2._readRequests;
  e2._readRequests = new v, r.forEach((e3) => {
    e3._errorSteps(t2);
  });
}
function ee(e2) {
  return new TypeError(`ReadableStreamDefaultReader.prototype.${e2} can only be used on a ReadableStreamDefaultReader`);
}
function ne(e2) {
  return e2.slice();
}
function ae(e2, t2, r, o2, n) {
  new Uint8Array(e2).set(new Uint8Array(r, o2, n), t2);
}
function se(e2, t2, r) {
  if (e2.slice)
    return e2.slice(t2, r);
  const o2 = r - t2, n = new ArrayBuffer(o2);
  return ae(n, 0, e2, t2, o2), n;
}
function ue(e2, t2) {
  const r = e2[t2];
  if (r != null) {
    if (typeof r != "function")
      throw new TypeError(`${String(t2)} is not a function`);
    return r;
  }
}
function ce(e2) {
  try {
    const { done: t2, value: r } = e2;
    return f(s(r), (e3) => ({ done: t2, value: e3 }));
  } catch (e3) {
    return d(e3);
  }
}
function fe(e2, r = "sync", o2) {
  if (o2 === undefined)
    if (r === "async") {
      if ((o2 = ue(e2, de)) === undefined) {
        return function(e3) {
          const r2 = { next() {
            let t2;
            try {
              t2 = be(e3);
            } catch (e4) {
              return d(e4);
            }
            return ce(t2);
          }, return(r3) {
            let o3;
            try {
              const t2 = ue(e3.iterator, "return");
              if (t2 === undefined)
                return c({ done: true, value: r3 });
              o3 = S(t2, e3.iterator, [r3]);
            } catch (e4) {
              return d(e4);
            }
            return t(o3) ? ce(o3) : d(new TypeError("The iterator.return() method must return an object"));
          } };
          return { iterator: r2, nextMethod: r2.next, done: false };
        }(fe(e2, "sync", ue(e2, Symbol.iterator)));
      }
    } else
      o2 = ue(e2, Symbol.iterator);
  if (o2 === undefined)
    throw new TypeError("The object is not iterable");
  const n = S(o2, e2, []);
  if (!t(n))
    throw new TypeError("The iterator method must return an object");
  return { iterator: n, nextMethod: n.next, done: false };
}
function be(e2) {
  const r = S(e2.nextMethod, e2.iterator, []);
  if (!t(r))
    throw new TypeError("The iterator.next() method must return an object");
  return r;
}
function _e(e2) {
  if (!t(e2))
    return false;
  if (!Object.prototype.hasOwnProperty.call(e2, "_asyncIteratorImpl"))
    return false;
  try {
    return e2._asyncIteratorImpl instanceof he;
  } catch (e3) {
    return false;
  }
}
function pe(e2) {
  return new TypeError(`ReadableStreamAsyncIterator.${e2} can only be used on a ReadableSteamAsyncIterator`);
}
function Se(e2) {
  const t2 = se(e2.buffer, e2.byteOffset, e2.byteOffset + e2.byteLength);
  return new Uint8Array(t2);
}
function ge(e2) {
  const t2 = e2._queue.shift();
  return e2._queueTotalSize -= t2.size, e2._queueTotalSize < 0 && (e2._queueTotalSize = 0), t2.value;
}
function ve(e2, t2, r) {
  if (typeof (o2 = r) != "number" || ye(o2) || o2 < 0 || r === 1 / 0)
    throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
  var o2;
  e2._queue.push({ value: t2, size: r }), e2._queueTotalSize += r;
}
function we(e2) {
  e2._queue = new v, e2._queueTotalSize = 0;
}
function Re(e2) {
  return e2 === DataView;
}
function Te(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_controlledReadableByteStream") && e2 instanceof ReadableByteStreamController);
}
function Ce(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_associatedReadableByteStreamController") && e2 instanceof ReadableStreamBYOBRequest);
}
function Pe(e2) {
  const t2 = function(e3) {
    const t3 = e3._controlledReadableByteStream;
    if (t3._state !== "readable")
      return false;
    if (e3._closeRequested)
      return false;
    if (!e3._started)
      return false;
    if (X(t3) && G(t3) > 0)
      return true;
    if (ot(t3) && rt(t3) > 0)
      return true;
    const r = Ve(e3);
    if (r > 0)
      return true;
    return false;
  }(e2);
  if (!t2)
    return;
  if (e2._pulling)
    return void (e2._pullAgain = true);
  e2._pulling = true;
  b(e2._pullAlgorithm(), () => (e2._pulling = false, e2._pullAgain && (e2._pullAgain = false, Pe(e2)), null), (t3) => (Qe(e2, t3), null));
}
function qe(e2) {
  De(e2), e2._pendingPullIntos = new v;
}
function Ee(e2, t2) {
  let r = false;
  e2._state === "closed" && (r = true);
  const o2 = We(t2);
  t2.readerType === "default" ? U(e2, o2, r) : function(e3, t3, r2) {
    const o3 = e3._reader, n = o3._readIntoRequests.shift();
    r2 ? n._closeSteps(t3) : n._chunkSteps(t3);
  }(e2, o2, r);
}
function We(e2) {
  const { bytesFilled: t2, elementSize: r } = e2;
  return new e2.viewConstructor(e2.buffer, e2.byteOffset, t2 / r);
}
function Oe(e2, t2, r, o2) {
  e2._queue.push({ buffer: t2, byteOffset: r, byteLength: o2 }), e2._queueTotalSize += o2;
}
function Be(e2, t2, r, o2) {
  let n;
  try {
    n = se(t2, r, r + o2);
  } catch (t3) {
    throw Qe(e2, t3), t3;
  }
  Oe(e2, n, 0, o2);
}
function ke(e2, t2) {
  t2.bytesFilled > 0 && Be(e2, t2.buffer, t2.byteOffset, t2.bytesFilled), $e(e2);
}
function je(e2, t2) {
  const r = Math.min(e2._queueTotalSize, t2.byteLength - t2.bytesFilled), o2 = t2.bytesFilled + r;
  let n = r, a = false;
  const i = o2 - o2 % t2.elementSize;
  i >= t2.minimumFill && (n = i - t2.bytesFilled, a = true);
  const l = e2._queue;
  for (;n > 0; ) {
    const r2 = l.peek(), o3 = Math.min(n, r2.byteLength), a2 = t2.byteOffset + t2.bytesFilled;
    ae(t2.buffer, a2, r2.buffer, r2.byteOffset, o3), r2.byteLength === o3 ? l.shift() : (r2.byteOffset += o3, r2.byteLength -= o3), e2._queueTotalSize -= o3, Ae(e2, o3, t2), n -= o3;
  }
  return a;
}
function Ae(e2, t2, r) {
  r.bytesFilled += t2;
}
function ze(e2) {
  e2._queueTotalSize === 0 && e2._closeRequested ? (Me(e2), Br(e2._controlledReadableByteStream)) : Pe(e2);
}
function De(e2) {
  e2._byobRequest !== null && (e2._byobRequest._associatedReadableByteStreamController = undefined, e2._byobRequest._view = null, e2._byobRequest = null);
}
function Le(e2) {
  for (;e2._pendingPullIntos.length > 0; ) {
    if (e2._queueTotalSize === 0)
      return;
    const t2 = e2._pendingPullIntos.peek();
    je(e2, t2) && ($e(e2), Ee(e2._controlledReadableByteStream, t2));
  }
}
function Fe(e2, t2, r, o2) {
  const n = e2._controlledReadableByteStream, a = t2.constructor, i = function(e3) {
    return Re(e3) ? 1 : e3.BYTES_PER_ELEMENT;
  }(a), { byteOffset: l, byteLength: s } = t2, u2 = r * i;
  let c2;
  try {
    c2 = ie(t2.buffer);
  } catch (e3) {
    return void o2._errorSteps(e3);
  }
  const d2 = { buffer: c2, bufferByteLength: c2.byteLength, byteOffset: l, byteLength: s, bytesFilled: 0, minimumFill: u2, elementSize: i, viewConstructor: a, readerType: "byob" };
  if (e2._pendingPullIntos.length > 0)
    return e2._pendingPullIntos.push(d2), void tt(n, o2);
  if (n._state !== "closed") {
    if (e2._queueTotalSize > 0) {
      if (je(e2, d2)) {
        const t3 = We(d2);
        return ze(e2), void o2._chunkSteps(t3);
      }
      if (e2._closeRequested) {
        const t3 = new TypeError("Insufficient bytes to fill elements in the given buffer");
        return Qe(e2, t3), void o2._errorSteps(t3);
      }
    }
    e2._pendingPullIntos.push(d2), tt(n, o2), Pe(e2);
  } else {
    const e3 = new a(d2.buffer, d2.byteOffset, 0);
    o2._closeSteps(e3);
  }
}
function Ie(e2, t2) {
  const r = e2._pendingPullIntos.peek();
  De(e2);
  e2._controlledReadableByteStream._state === "closed" ? function(e3, t3) {
    t3.readerType === "none" && $e(e3);
    const r2 = e3._controlledReadableByteStream;
    if (ot(r2))
      for (;rt(r2) > 0; )
        Ee(r2, $e(e3));
  }(e2, r) : function(e3, t3, r2) {
    if (Ae(0, t3, r2), r2.readerType === "none")
      return ke(e3, r2), void Le(e3);
    if (r2.bytesFilled < r2.minimumFill)
      return;
    $e(e3);
    const o2 = r2.bytesFilled % r2.elementSize;
    if (o2 > 0) {
      const t4 = r2.byteOffset + r2.bytesFilled;
      Be(e3, r2.buffer, t4 - o2, o2);
    }
    r2.bytesFilled -= o2, Ee(e3._controlledReadableByteStream, r2), Le(e3);
  }(e2, t2, r), Pe(e2);
}
function $e(e2) {
  return e2._pendingPullIntos.shift();
}
function Me(e2) {
  e2._pullAlgorithm = undefined, e2._cancelAlgorithm = undefined;
}
function Ye(e2) {
  const t2 = e2._controlledReadableByteStream;
  if (!e2._closeRequested && t2._state === "readable")
    if (e2._queueTotalSize > 0)
      e2._closeRequested = true;
    else {
      if (e2._pendingPullIntos.length > 0) {
        const t3 = e2._pendingPullIntos.peek();
        if (t3.bytesFilled % t3.elementSize != 0) {
          const t4 = new TypeError("Insufficient bytes to fill elements in the given buffer");
          throw Qe(e2, t4), t4;
        }
      }
      Me(e2), Br(t2);
    }
}
function xe(e2, t2) {
  const r = e2._controlledReadableByteStream;
  if (e2._closeRequested || r._state !== "readable")
    return;
  const { buffer: o2, byteOffset: n, byteLength: a } = t2;
  if (le(o2))
    throw new TypeError("chunk's buffer is detached and so cannot be enqueued");
  const i = ie(o2);
  if (e2._pendingPullIntos.length > 0) {
    const t3 = e2._pendingPullIntos.peek();
    if (le(t3.buffer))
      throw new TypeError("The BYOB request's buffer has been detached and so cannot be filled with an enqueued chunk");
    De(e2), t3.buffer = ie(t3.buffer), t3.readerType === "none" && ke(e2, t3);
  }
  if (X(r))
    if (function(e3) {
      const t3 = e3._controlledReadableByteStream._reader;
      for (;t3._readRequests.length > 0; ) {
        if (e3._queueTotalSize === 0)
          return;
        Ne(e3, t3._readRequests.shift());
      }
    }(e2), G(r) === 0)
      Oe(e2, i, n, a);
    else {
      e2._pendingPullIntos.length > 0 && $e(e2);
      U(r, new Uint8Array(i, n, a), false);
    }
  else
    ot(r) ? (Oe(e2, i, n, a), Le(e2)) : Oe(e2, i, n, a);
  Pe(e2);
}
function Qe(e2, t2) {
  const r = e2._controlledReadableByteStream;
  r._state === "readable" && (qe(e2), we(e2), Me(e2), kr(r, t2));
}
function Ne(e2, t2) {
  const r = e2._queue.shift();
  e2._queueTotalSize -= r.byteLength, ze(e2);
  const o2 = new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
  t2._chunkSteps(o2);
}
function He(e2) {
  if (e2._byobRequest === null && e2._pendingPullIntos.length > 0) {
    const t2 = e2._pendingPullIntos.peek(), r = new Uint8Array(t2.buffer, t2.byteOffset + t2.bytesFilled, t2.byteLength - t2.bytesFilled), o2 = Object.create(ReadableStreamBYOBRequest.prototype);
    (function(e3, t3, r2) {
      e3._associatedReadableByteStreamController = t3, e3._view = r2;
    })(o2, e2, r), e2._byobRequest = o2;
  }
  return e2._byobRequest;
}
function Ve(e2) {
  const t2 = e2._controlledReadableByteStream._state;
  return t2 === "errored" ? null : t2 === "closed" ? 0 : e2._strategyHWM - e2._queueTotalSize;
}
function Ue(e2, t2) {
  const r = e2._pendingPullIntos.peek();
  if (e2._controlledReadableByteStream._state === "closed") {
    if (t2 !== 0)
      throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
  } else {
    if (t2 === 0)
      throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
    if (r.bytesFilled + t2 > r.byteLength)
      throw new RangeError("bytesWritten out of range");
  }
  r.buffer = ie(r.buffer), Ie(e2, t2);
}
function Ge(e2, t2) {
  const r = e2._pendingPullIntos.peek();
  if (e2._controlledReadableByteStream._state === "closed") {
    if (t2.byteLength !== 0)
      throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
  } else if (t2.byteLength === 0)
    throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
  if (r.byteOffset + r.bytesFilled !== t2.byteOffset)
    throw new RangeError("The region specified by view does not match byobRequest");
  if (r.bufferByteLength !== t2.buffer.byteLength)
    throw new RangeError("The buffer of view has different capacity than byobRequest");
  if (r.bytesFilled + t2.byteLength > r.byteLength)
    throw new RangeError("The region specified by view is larger than byobRequest");
  const o2 = t2.byteLength;
  r.buffer = ie(t2.buffer), Ie(e2, o2);
}
function Xe(e2, t2, r, o2, n, a, i) {
  t2._controlledReadableByteStream = e2, t2._pullAgain = false, t2._pulling = false, t2._byobRequest = null, t2._queue = t2._queueTotalSize = undefined, we(t2), t2._closeRequested = false, t2._started = false, t2._strategyHWM = a, t2._pullAlgorithm = o2, t2._cancelAlgorithm = n, t2._autoAllocateChunkSize = i, t2._pendingPullIntos = new v, e2._readableStreamController = t2;
  b(c(r()), () => (t2._started = true, Pe(t2), null), (e3) => (Qe(t2, e3), null));
}
function Je(e2) {
  return new TypeError(`ReadableStreamBYOBRequest.prototype.${e2} can only be used on a ReadableStreamBYOBRequest`);
}
function Ke(e2) {
  return new TypeError(`ReadableByteStreamController.prototype.${e2} can only be used on a ReadableByteStreamController`);
}
function Ze(e2, t2) {
  if ((e2 = `${e2}`) !== "byob")
    throw new TypeError(`${t2} '${e2}' is not a valid enumeration value for ReadableStreamReaderMode`);
  return e2;
}
function et(e2) {
  return new ReadableStreamBYOBReader(e2);
}
function tt(e2, t2) {
  e2._reader._readIntoRequests.push(t2);
}
function rt(e2) {
  return e2._reader._readIntoRequests.length;
}
function ot(e2) {
  const t2 = e2._reader;
  return t2 !== undefined && !!nt(t2);
}
function nt(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_readIntoRequests") && e2 instanceof ReadableStreamBYOBReader);
}
function at(e2, t2, r, o2) {
  const n = e2._ownerReadableStream;
  n._disturbed = true, n._state === "errored" ? o2._errorSteps(n._storedError) : Fe(n._readableStreamController, t2, r, o2);
}
function it(e2, t2) {
  const r = e2._readIntoRequests;
  e2._readIntoRequests = new v, r.forEach((e3) => {
    e3._errorSteps(t2);
  });
}
function lt(e2) {
  return new TypeError(`ReadableStreamBYOBReader.prototype.${e2} can only be used on a ReadableStreamBYOBReader`);
}
function st(e2, t2) {
  const { highWaterMark: r } = e2;
  if (r === undefined)
    return t2;
  if (ye(r) || r < 0)
    throw new RangeError("Invalid highWaterMark");
  return r;
}
function ut(e2) {
  const { size: t2 } = e2;
  return t2 || (() => 1);
}
function ct(e2, t2) {
  L(e2, t2);
  const r = e2 == null ? undefined : e2.highWaterMark, o2 = e2 == null ? undefined : e2.size;
  return { highWaterMark: r === undefined ? undefined : Y(r), size: o2 === undefined ? undefined : dt(o2, `${t2} has member 'size' that`) };
}
function dt(e2, t2) {
  return F(e2, t2), (t3) => Y(e2(t3));
}
function ft(e2, t2, r) {
  return F(e2, r), (r2) => g(e2, t2, [r2]);
}
function bt(e2, t2, r) {
  return F(e2, r), () => g(e2, t2, []);
}
function ht(e2, t2, r) {
  return F(e2, r), (r2) => S(e2, t2, [r2]);
}
function mt(e2, t2, r) {
  return F(e2, r), (r2, o2) => g(e2, t2, [r2, o2]);
}
function _t(e2, t2) {
  if (!gt(e2))
    throw new TypeError(`${t2} is not a WritableStream.`);
}
function yt(e2) {
  return new WritableStreamDefaultWriter(e2);
}
function St(e2) {
  e2._state = "writable", e2._storedError = undefined, e2._writer = undefined, e2._writableStreamController = undefined, e2._writeRequests = new v, e2._inFlightWriteRequest = undefined, e2._closeRequest = undefined, e2._inFlightCloseRequest = undefined, e2._pendingAbortRequest = undefined, e2._backpressure = false;
}
function gt(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_writableStreamController") && e2 instanceof WritableStream);
}
function vt(e2) {
  return e2._writer !== undefined;
}
function wt(e2, t2) {
  var r;
  if (e2._state === "closed" || e2._state === "errored")
    return c(undefined);
  e2._writableStreamController._abortReason = t2, (r = e2._writableStreamController._abortController) === null || r === undefined || r.abort(t2);
  const o2 = e2._state;
  if (o2 === "closed" || o2 === "errored")
    return c(undefined);
  if (e2._pendingAbortRequest !== undefined)
    return e2._pendingAbortRequest._promise;
  let n = false;
  o2 === "erroring" && (n = true, t2 = undefined);
  const a = u((r2, o3) => {
    e2._pendingAbortRequest = { _promise: undefined, _resolve: r2, _reject: o3, _reason: t2, _wasAlreadyErroring: n };
  });
  return e2._pendingAbortRequest._promise = a, n || Ct(e2, t2), a;
}
function Rt(e2) {
  const t2 = e2._state;
  if (t2 === "closed" || t2 === "errored")
    return d(new TypeError(`The stream (in ${t2} state) is not in the writable state and cannot be closed`));
  const r = u((t3, r2) => {
    const o3 = { _resolve: t3, _reject: r2 };
    e2._closeRequest = o3;
  }), o2 = e2._writer;
  var n;
  return o2 !== undefined && e2._backpressure && t2 === "writable" && or(o2), ve(n = e2._writableStreamController, Dt, 0), Mt(n), r;
}
function Tt(e2, t2) {
  e2._state !== "writable" ? Pt(e2) : Ct(e2, t2);
}
function Ct(e2, t2) {
  const r = e2._writableStreamController;
  e2._state = "erroring", e2._storedError = t2;
  const o2 = e2._writer;
  o2 !== undefined && jt(o2, t2), !function(e3) {
    if (e3._inFlightWriteRequest === undefined && e3._inFlightCloseRequest === undefined)
      return false;
    return true;
  }(e2) && r._started && Pt(e2);
}
function Pt(e2) {
  e2._state = "errored", e2._writableStreamController[R]();
  const t2 = e2._storedError;
  if (e2._writeRequests.forEach((e3) => {
    e3._reject(t2);
  }), e2._writeRequests = new v, e2._pendingAbortRequest === undefined)
    return void Et(e2);
  const r = e2._pendingAbortRequest;
  if (e2._pendingAbortRequest = undefined, r._wasAlreadyErroring)
    return r._reject(t2), void Et(e2);
  b(e2._writableStreamController[w](r._reason), () => (r._resolve(), Et(e2), null), (t3) => (r._reject(t3), Et(e2), null));
}
function qt(e2) {
  return e2._closeRequest !== undefined || e2._inFlightCloseRequest !== undefined;
}
function Et(e2) {
  e2._closeRequest !== undefined && (e2._closeRequest._reject(e2._storedError), e2._closeRequest = undefined);
  const t2 = e2._writer;
  t2 !== undefined && Jt(t2, e2._storedError);
}
function Wt(e2, t2) {
  const r = e2._writer;
  r !== undefined && t2 !== e2._backpressure && (t2 ? function(e3) {
    Zt(e3);
  }(r) : or(r)), e2._backpressure = t2;
}
function Ot(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_ownerWritableStream") && e2 instanceof WritableStreamDefaultWriter);
}
function Bt(e2) {
  return Rt(e2._ownerWritableStream);
}
function kt(e2, t2) {
  e2._closedPromiseState === "pending" ? Jt(e2, t2) : function(e3, t3) {
    Xt(e3, t3);
  }(e2, t2);
}
function jt(e2, t2) {
  e2._readyPromiseState === "pending" ? rr(e2, t2) : function(e3, t3) {
    er(e3, t3);
  }(e2, t2);
}
function At(e2) {
  const t2 = e2._ownerWritableStream, r = new TypeError("Writer was released and can no longer be used to monitor the stream's closedness");
  jt(e2, r), kt(e2, r), t2._writer = undefined, e2._ownerWritableStream = undefined;
}
function zt(e2, t2) {
  const r = e2._ownerWritableStream, o2 = r._writableStreamController, n = function(e3, t3) {
    try {
      return e3._strategySizeAlgorithm(t3);
    } catch (t4) {
      return Yt(e3, t4), 1;
    }
  }(o2, t2);
  if (r !== e2._ownerWritableStream)
    return d(Ut("write to"));
  const a = r._state;
  if (a === "errored")
    return d(r._storedError);
  if (qt(r) || a === "closed")
    return d(new TypeError("The stream is closing or closed and cannot be written to"));
  if (a === "erroring")
    return d(r._storedError);
  const i = function(e3) {
    return u((t3, r2) => {
      const o3 = { _resolve: t3, _reject: r2 };
      e3._writeRequests.push(o3);
    });
  }(r);
  return function(e3, t3, r2) {
    try {
      ve(e3, t3, r2);
    } catch (t4) {
      return void Yt(e3, t4);
    }
    const o3 = e3._controlledWritableStream;
    if (!qt(o3) && o3._state === "writable") {
      Wt(o3, xt(e3));
    }
    Mt(e3);
  }(o2, t2, n), i;
}
function Lt(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_controlledWritableStream") && e2 instanceof WritableStreamDefaultController);
}
function Ft(e2, t2, r, o2, n, a, i, l) {
  t2._controlledWritableStream = e2, e2._writableStreamController = t2, t2._queue = undefined, t2._queueTotalSize = undefined, we(t2), t2._abortReason = undefined, t2._abortController = function() {
    if (pt)
      return new AbortController;
  }(), t2._started = false, t2._strategySizeAlgorithm = l, t2._strategyHWM = i, t2._writeAlgorithm = o2, t2._closeAlgorithm = n, t2._abortAlgorithm = a;
  const s = xt(t2);
  Wt(e2, s);
  b(c(r()), () => (t2._started = true, Mt(t2), null), (r2) => (t2._started = true, Tt(e2, r2), null));
}
function It(e2) {
  e2._writeAlgorithm = undefined, e2._closeAlgorithm = undefined, e2._abortAlgorithm = undefined, e2._strategySizeAlgorithm = undefined;
}
function $t(e2) {
  return e2._strategyHWM - e2._queueTotalSize;
}
function Mt(e2) {
  const t2 = e2._controlledWritableStream;
  if (!e2._started)
    return;
  if (t2._inFlightWriteRequest !== undefined)
    return;
  if (t2._state === "erroring")
    return void Pt(t2);
  if (e2._queue.length === 0)
    return;
  const r = e2._queue.peek().value;
  r === Dt ? function(e3) {
    const t3 = e3._controlledWritableStream;
    (function(e4) {
      e4._inFlightCloseRequest = e4._closeRequest, e4._closeRequest = undefined;
    })(t3), ge(e3);
    const r2 = e3._closeAlgorithm();
    It(e3), b(r2, () => (function(e4) {
      e4._inFlightCloseRequest._resolve(undefined), e4._inFlightCloseRequest = undefined, e4._state === "erroring" && (e4._storedError = undefined, e4._pendingAbortRequest !== undefined && (e4._pendingAbortRequest._resolve(), e4._pendingAbortRequest = undefined)), e4._state = "closed";
      const t4 = e4._writer;
      t4 !== undefined && Kt(t4);
    }(t3), null), (e4) => (function(e5, t4) {
      e5._inFlightCloseRequest._reject(t4), e5._inFlightCloseRequest = undefined, e5._pendingAbortRequest !== undefined && (e5._pendingAbortRequest._reject(t4), e5._pendingAbortRequest = undefined), Tt(e5, t4);
    }(t3, e4), null));
  }(e2) : function(e3, t3) {
    const r2 = e3._controlledWritableStream;
    (function(e4) {
      e4._inFlightWriteRequest = e4._writeRequests.shift();
    })(r2);
    const o2 = e3._writeAlgorithm(t3);
    b(o2, () => {
      (function(e4) {
        e4._inFlightWriteRequest._resolve(undefined), e4._inFlightWriteRequest = undefined;
      })(r2);
      const t4 = r2._state;
      if (ge(e3), !qt(r2) && t4 === "writable") {
        const t5 = xt(e3);
        Wt(r2, t5);
      }
      return Mt(e3), null;
    }, (t4) => (r2._state === "writable" && It(e3), function(e4, t5) {
      e4._inFlightWriteRequest._reject(t5), e4._inFlightWriteRequest = undefined, Tt(e4, t5);
    }(r2, t4), null));
  }(e2, r);
}
function Yt(e2, t2) {
  e2._controlledWritableStream._state === "writable" && Qt(e2, t2);
}
function xt(e2) {
  return $t(e2) <= 0;
}
function Qt(e2, t2) {
  const r = e2._controlledWritableStream;
  It(e2), Ct(r, t2);
}
function Nt(e2) {
  return new TypeError(`WritableStream.prototype.${e2} can only be used on a WritableStream`);
}
function Ht(e2) {
  return new TypeError(`WritableStreamDefaultController.prototype.${e2} can only be used on a WritableStreamDefaultController`);
}
function Vt(e2) {
  return new TypeError(`WritableStreamDefaultWriter.prototype.${e2} can only be used on a WritableStreamDefaultWriter`);
}
function Ut(e2) {
  return new TypeError("Cannot " + e2 + " a stream using a released writer");
}
function Gt(e2) {
  e2._closedPromise = u((t2, r) => {
    e2._closedPromise_resolve = t2, e2._closedPromise_reject = r, e2._closedPromiseState = "pending";
  });
}
function Xt(e2, t2) {
  Gt(e2), Jt(e2, t2);
}
function Jt(e2, t2) {
  e2._closedPromise_reject !== undefined && (p(e2._closedPromise), e2._closedPromise_reject(t2), e2._closedPromise_resolve = undefined, e2._closedPromise_reject = undefined, e2._closedPromiseState = "rejected");
}
function Kt(e2) {
  e2._closedPromise_resolve !== undefined && (e2._closedPromise_resolve(undefined), e2._closedPromise_resolve = undefined, e2._closedPromise_reject = undefined, e2._closedPromiseState = "resolved");
}
function Zt(e2) {
  e2._readyPromise = u((t2, r) => {
    e2._readyPromise_resolve = t2, e2._readyPromise_reject = r;
  }), e2._readyPromiseState = "pending";
}
function er(e2, t2) {
  Zt(e2), rr(e2, t2);
}
function tr(e2) {
  Zt(e2), or(e2);
}
function rr(e2, t2) {
  e2._readyPromise_reject !== undefined && (p(e2._readyPromise), e2._readyPromise_reject(t2), e2._readyPromise_resolve = undefined, e2._readyPromise_reject = undefined, e2._readyPromiseState = "rejected");
}
function or(e2) {
  e2._readyPromise_resolve !== undefined && (e2._readyPromise_resolve(undefined), e2._readyPromise_resolve = undefined, e2._readyPromise_reject = undefined, e2._readyPromiseState = "fulfilled");
}
function ir(t2, r, o2, n, a, i) {
  const l = H(t2), s = yt(r);
  t2._disturbed = true;
  let _2 = false, y = c(undefined);
  return u((S2, g2) => {
    let v;
    if (i !== undefined) {
      if (v = () => {
        const e2 = i.reason !== undefined ? i.reason : new ar("Aborted", "AbortError"), o3 = [];
        n || o3.push(() => r._state === "writable" ? wt(r, e2) : c(undefined)), a || o3.push(() => t2._state === "readable" ? Or(t2, e2) : c(undefined)), q2(() => Promise.all(o3.map((e3) => e3())), true, e2);
      }, i.aborted)
        return void v();
      i.addEventListener("abort", v);
    }
    var w, R, T;
    if (P(t2, l._closedPromise, (e2) => (n ? E2(true, e2) : q2(() => wt(r, e2), true, e2), null)), P(r, s._closedPromise, (e2) => (a ? E2(true, e2) : q2(() => Or(t2, e2), true, e2), null)), w = t2, R = l._closedPromise, T = () => (o2 ? E2() : q2(() => function(e2) {
      const t3 = e2._ownerWritableStream, r2 = t3._state;
      return qt(t3) || r2 === "closed" ? c(undefined) : r2 === "errored" ? d(t3._storedError) : Bt(e2);
    }(s)), null), w._state === "closed" ? T() : h(R, T), qt(r) || r._state === "closed") {
      const e2 = new TypeError("the destination writable stream closed before all data could be piped to it");
      a ? E2(true, e2) : q2(() => Or(t2, e2), true, e2);
    }
    function C() {
      const e2 = y;
      return f(y, () => e2 !== y ? C() : undefined);
    }
    function P(e2, t3, r2) {
      e2._state === "errored" ? r2(e2._storedError) : m(t3, r2);
    }
    function q2(e2, t3, o3) {
      function n2() {
        return b(e2(), () => O2(t3, o3), (e3) => O2(true, e3)), null;
      }
      _2 || (_2 = true, r._state !== "writable" || qt(r) ? n2() : h(C(), n2));
    }
    function E2(e2, t3) {
      _2 || (_2 = true, r._state !== "writable" || qt(r) ? O2(e2, t3) : h(C(), () => O2(e2, t3)));
    }
    function O2(e2, t3) {
      return At(s), W(l), i !== undefined && i.removeEventListener("abort", v), e2 ? g2(t3) : S2(undefined), null;
    }
    p(u((t3, r2) => {
      (function o(n2) {
        n2 ? t3() : f(_2 ? c(true) : f(s._readyPromise, () => u((t4, r3) => {
          K(l, { _chunkSteps: (r4) => {
            y = f(zt(s, r4), undefined, e), t4(false);
          }, _closeSteps: () => t4(true), _errorSteps: r3 });
        })), o, r2);
      })(false);
    }));
  });
}
function lr(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_controlledReadableStream") && e2 instanceof ReadableStreamDefaultController);
}
function sr(e2) {
  if (!ur(e2))
    return;
  if (e2._pulling)
    return void (e2._pullAgain = true);
  e2._pulling = true;
  b(e2._pullAlgorithm(), () => (e2._pulling = false, e2._pullAgain && (e2._pullAgain = false, sr(e2)), null), (t2) => (br(e2, t2), null));
}
function ur(e2) {
  const t2 = e2._controlledReadableStream;
  if (!mr(e2))
    return false;
  if (!e2._started)
    return false;
  if (Wr(t2) && G(t2) > 0)
    return true;
  return hr(e2) > 0;
}
function cr(e2) {
  e2._pullAlgorithm = undefined, e2._cancelAlgorithm = undefined, e2._strategySizeAlgorithm = undefined;
}
function dr(e2) {
  if (!mr(e2))
    return;
  const t2 = e2._controlledReadableStream;
  e2._closeRequested = true, e2._queue.length === 0 && (cr(e2), Br(t2));
}
function fr(e2, t2) {
  if (!mr(e2))
    return;
  const r = e2._controlledReadableStream;
  if (Wr(r) && G(r) > 0)
    U(r, t2, false);
  else {
    let r2;
    try {
      r2 = e2._strategySizeAlgorithm(t2);
    } catch (t3) {
      throw br(e2, t3), t3;
    }
    try {
      ve(e2, t2, r2);
    } catch (t3) {
      throw br(e2, t3), t3;
    }
  }
  sr(e2);
}
function br(e2, t2) {
  const r = e2._controlledReadableStream;
  r._state === "readable" && (we(e2), cr(e2), kr(r, t2));
}
function hr(e2) {
  const t2 = e2._controlledReadableStream._state;
  return t2 === "errored" ? null : t2 === "closed" ? 0 : e2._strategyHWM - e2._queueTotalSize;
}
function mr(e2) {
  const t2 = e2._controlledReadableStream._state;
  return !e2._closeRequested && t2 === "readable";
}
function _r(e2, t2, r, o2, n, a, i) {
  t2._controlledReadableStream = e2, t2._queue = undefined, t2._queueTotalSize = undefined, we(t2), t2._started = false, t2._closeRequested = false, t2._pullAgain = false, t2._pulling = false, t2._strategySizeAlgorithm = i, t2._strategyHWM = a, t2._pullAlgorithm = o2, t2._cancelAlgorithm = n, e2._readableStreamController = t2;
  b(c(r()), () => (t2._started = true, sr(t2), null), (e3) => (br(t2, e3), null));
}
function pr(e2) {
  return new TypeError(`ReadableStreamDefaultController.prototype.${e2} can only be used on a ReadableStreamDefaultController`);
}
function yr(e2, t2) {
  return Te(e2._readableStreamController) ? function(e3) {
    let t3, r, o2, n, a, i = H(e3), l = false, s = false, d2 = false, f2 = false, b2 = false;
    const h2 = u((e4) => {
      a = e4;
    });
    function _2(e4) {
      m(e4._closedPromise, (t4) => (e4 !== i || (Qe(o2._readableStreamController, t4), Qe(n._readableStreamController, t4), f2 && b2 || a(undefined)), null));
    }
    function p2() {
      nt(i) && (W(i), i = H(e3), _2(i));
      K(i, { _chunkSteps: (t4) => {
        y(() => {
          s = false, d2 = false;
          const r2 = t4;
          let i2 = t4;
          if (!f2 && !b2)
            try {
              i2 = Se(t4);
            } catch (t5) {
              return Qe(o2._readableStreamController, t5), Qe(n._readableStreamController, t5), void a(Or(e3, t5));
            }
          f2 || xe(o2._readableStreamController, r2), b2 || xe(n._readableStreamController, i2), l = false, s ? g2() : d2 && v();
        });
      }, _closeSteps: () => {
        l = false, f2 || Ye(o2._readableStreamController), b2 || Ye(n._readableStreamController), o2._readableStreamController._pendingPullIntos.length > 0 && Ue(o2._readableStreamController, 0), n._readableStreamController._pendingPullIntos.length > 0 && Ue(n._readableStreamController, 0), f2 && b2 || a(undefined);
      }, _errorSteps: () => {
        l = false;
      } });
    }
    function S2(t4, r2) {
      J(i) && (W(i), i = et(e3), _2(i));
      const u2 = r2 ? n : o2, c2 = r2 ? o2 : n;
      at(i, t4, 1, { _chunkSteps: (t5) => {
        y(() => {
          s = false, d2 = false;
          const o3 = r2 ? b2 : f2;
          if (r2 ? f2 : b2)
            o3 || Ge(u2._readableStreamController, t5);
          else {
            let r3;
            try {
              r3 = Se(t5);
            } catch (t6) {
              return Qe(u2._readableStreamController, t6), Qe(c2._readableStreamController, t6), void a(Or(e3, t6));
            }
            o3 || Ge(u2._readableStreamController, t5), xe(c2._readableStreamController, r3);
          }
          l = false, s ? g2() : d2 && v();
        });
      }, _closeSteps: (e4) => {
        l = false;
        const t5 = r2 ? b2 : f2, o3 = r2 ? f2 : b2;
        t5 || Ye(u2._readableStreamController), o3 || Ye(c2._readableStreamController), e4 !== undefined && (t5 || Ge(u2._readableStreamController, e4), !o3 && c2._readableStreamController._pendingPullIntos.length > 0 && Ue(c2._readableStreamController, 0)), t5 && o3 || a(undefined);
      }, _errorSteps: () => {
        l = false;
      } });
    }
    function g2() {
      if (l)
        return s = true, c(undefined);
      l = true;
      const e4 = He(o2._readableStreamController);
      return e4 === null ? p2() : S2(e4._view, false), c(undefined);
    }
    function v() {
      if (l)
        return d2 = true, c(undefined);
      l = true;
      const e4 = He(n._readableStreamController);
      return e4 === null ? p2() : S2(e4._view, true), c(undefined);
    }
    function w(o3) {
      if (f2 = true, t3 = o3, b2) {
        const o4 = ne([t3, r]), n2 = Or(e3, o4);
        a(n2);
      }
      return h2;
    }
    function R(o3) {
      if (b2 = true, r = o3, f2) {
        const o4 = ne([t3, r]), n2 = Or(e3, o4);
        a(n2);
      }
      return h2;
    }
    function T() {
    }
    return o2 = Pr(T, g2, w), n = Pr(T, v, R), _2(i), [o2, n];
  }(e2) : function(e3, t3) {
    const r = H(e3);
    let o2, n, a, i, l, s = false, d2 = false, f2 = false, b2 = false;
    const h2 = u((e4) => {
      l = e4;
    });
    function _2() {
      if (s)
        return d2 = true, c(undefined);
      s = true;
      return K(r, { _chunkSteps: (e4) => {
        y(() => {
          d2 = false;
          const t4 = e4, r2 = e4;
          f2 || fr(a._readableStreamController, t4), b2 || fr(i._readableStreamController, r2), s = false, d2 && _2();
        });
      }, _closeSteps: () => {
        s = false, f2 || dr(a._readableStreamController), b2 || dr(i._readableStreamController), f2 && b2 || l(undefined);
      }, _errorSteps: () => {
        s = false;
      } }), c(undefined);
    }
    function p2(t4) {
      if (f2 = true, o2 = t4, b2) {
        const t5 = ne([o2, n]), r2 = Or(e3, t5);
        l(r2);
      }
      return h2;
    }
    function S2(t4) {
      if (b2 = true, n = t4, f2) {
        const t5 = ne([o2, n]), r2 = Or(e3, t5);
        l(r2);
      }
      return h2;
    }
    function g2() {
    }
    return a = Cr(g2, _2, p2), i = Cr(g2, _2, S2), m(r._closedPromise, (e4) => (br(a._readableStreamController, e4), br(i._readableStreamController, e4), f2 && b2 || l(undefined), null)), [a, i];
  }(e2);
}
function Sr(r) {
  return t(o2 = r) && o2.getReader !== undefined ? function(r2) {
    let o3;
    function n() {
      let e2;
      try {
        e2 = r2.read();
      } catch (e3) {
        return d(e3);
      }
      return _(e2, (e3) => {
        if (!t(e3))
          throw new TypeError("The promise returned by the reader.read() method must fulfill with an object");
        if (e3.done)
          dr(o3._readableStreamController);
        else {
          const t2 = e3.value;
          fr(o3._readableStreamController, t2);
        }
      });
    }
    function a(e2) {
      try {
        return c(r2.cancel(e2));
      } catch (e3) {
        return d(e3);
      }
    }
    return o3 = Cr(e, n, a, 0), o3;
  }(r.getReader()) : function(r2) {
    let o3;
    const n = fe(r2, "async");
    function a() {
      let e2;
      try {
        e2 = be(n);
      } catch (e3) {
        return d(e3);
      }
      return _(c(e2), (e3) => {
        if (!t(e3))
          throw new TypeError("The promise returned by the iterator.next() method must fulfill with an object");
        if (e3.done)
          dr(o3._readableStreamController);
        else {
          const t2 = e3.value;
          fr(o3._readableStreamController, t2);
        }
      });
    }
    function i(e2) {
      const r3 = n.iterator;
      let o4;
      try {
        o4 = ue(r3, "return");
      } catch (e3) {
        return d(e3);
      }
      if (o4 === undefined)
        return c(undefined);
      return _(g(o4, r3, [e2]), (e3) => {
        if (!t(e3))
          throw new TypeError("The promise returned by the iterator.return() method must fulfill with an object");
      });
    }
    return o3 = Cr(e, a, i, 0), o3;
  }(r);
  var o2;
}
function gr(e2, t2, r) {
  return F(e2, r), (r2) => g(e2, t2, [r2]);
}
function vr(e2, t2, r) {
  return F(e2, r), (r2) => g(e2, t2, [r2]);
}
function wr(e2, t2, r) {
  return F(e2, r), (r2) => S(e2, t2, [r2]);
}
function Rr(e2, t2) {
  if ((e2 = `${e2}`) !== "bytes")
    throw new TypeError(`${t2} '${e2}' is not a valid enumeration value for ReadableStreamType`);
  return e2;
}
function Tr(e2, t2) {
  L(e2, t2);
  const r = e2 == null ? undefined : e2.preventAbort, o2 = e2 == null ? undefined : e2.preventCancel, n = e2 == null ? undefined : e2.preventClose, a = e2 == null ? undefined : e2.signal;
  return a !== undefined && function(e3, t3) {
    if (!function(e4) {
      if (typeof e4 != "object" || e4 === null)
        return false;
      try {
        return typeof e4.aborted == "boolean";
      } catch (e5) {
        return false;
      }
    }(e3))
      throw new TypeError(`${t3} is not an AbortSignal.`);
  }(a, `${t2} has member 'signal' that`), { preventAbort: Boolean(r), preventCancel: Boolean(o2), preventClose: Boolean(n), signal: a };
}
function Cr(e2, t2, r, o2 = 1, n = () => 1) {
  const a = Object.create(ReadableStream.prototype);
  qr(a);
  return _r(a, Object.create(ReadableStreamDefaultController.prototype), e2, t2, r, o2, n), a;
}
function Pr(e2, t2, r) {
  const o2 = Object.create(ReadableStream.prototype);
  qr(o2);
  return Xe(o2, Object.create(ReadableByteStreamController.prototype), e2, t2, r, 0, undefined), o2;
}
function qr(e2) {
  e2._state = "readable", e2._reader = undefined, e2._storedError = undefined, e2._disturbed = false;
}
function Er(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_readableStreamController") && e2 instanceof ReadableStream);
}
function Wr(e2) {
  return e2._reader !== undefined;
}
function Or(t2, r) {
  if (t2._disturbed = true, t2._state === "closed")
    return c(undefined);
  if (t2._state === "errored")
    return d(t2._storedError);
  Br(t2);
  const o2 = t2._reader;
  if (o2 !== undefined && nt(o2)) {
    const e2 = o2._readIntoRequests;
    o2._readIntoRequests = new v, e2.forEach((e3) => {
      e3._closeSteps(undefined);
    });
  }
  return _(t2._readableStreamController[T](r), e);
}
function Br(e2) {
  e2._state = "closed";
  const t2 = e2._reader;
  if (t2 !== undefined && (A(t2), J(t2))) {
    const e3 = t2._readRequests;
    t2._readRequests = new v, e3.forEach((e4) => {
      e4._closeSteps();
    });
  }
}
function kr(e2, t2) {
  e2._state = "errored", e2._storedError = t2;
  const r = e2._reader;
  r !== undefined && (j(r, t2), J(r) ? Z(r, t2) : it(r, t2));
}
function jr(e2) {
  return new TypeError(`ReadableStream.prototype.${e2} can only be used on a ReadableStream`);
}
function Ar(e2, t2) {
  L(e2, t2);
  const r = e2 == null ? undefined : e2.highWaterMark;
  return M(r, "highWaterMark", "QueuingStrategyInit"), { highWaterMark: Y(r) };
}
function Dr(e2) {
  return new TypeError(`ByteLengthQueuingStrategy.prototype.${e2} can only be used on a ByteLengthQueuingStrategy`);
}
function Lr(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_byteLengthQueuingStrategyHighWaterMark") && e2 instanceof ByteLengthQueuingStrategy);
}
function Ir(e2) {
  return new TypeError(`CountQueuingStrategy.prototype.${e2} can only be used on a CountQueuingStrategy`);
}
function $r(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_countQueuingStrategyHighWaterMark") && e2 instanceof CountQueuingStrategy);
}
function Mr(e2, t2, r) {
  return F(e2, r), (r2) => g(e2, t2, [r2]);
}
function Yr(e2, t2, r) {
  return F(e2, r), (r2) => S(e2, t2, [r2]);
}
function xr(e2, t2, r) {
  return F(e2, r), (r2, o2) => g(e2, t2, [r2, o2]);
}
function Qr(e2, t2, r) {
  return F(e2, r), (r2) => g(e2, t2, [r2]);
}
function Nr(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_transformStreamController") && e2 instanceof TransformStream);
}
function Hr(e2, t2) {
  br(e2._readable._readableStreamController, t2), Vr(e2, t2);
}
function Vr(e2, t2) {
  Jr(e2._transformStreamController), Yt(e2._writable._writableStreamController, t2), Ur(e2);
}
function Ur(e2) {
  e2._backpressure && Gr(e2, false);
}
function Gr(e2, t2) {
  e2._backpressureChangePromise !== undefined && e2._backpressureChangePromise_resolve(), e2._backpressureChangePromise = u((t3) => {
    e2._backpressureChangePromise_resolve = t3;
  }), e2._backpressure = t2;
}
function Xr(e2) {
  return !!t(e2) && (!!Object.prototype.hasOwnProperty.call(e2, "_controlledTransformStream") && e2 instanceof TransformStreamDefaultController);
}
function Jr(e2) {
  e2._transformAlgorithm = undefined, e2._flushAlgorithm = undefined, e2._cancelAlgorithm = undefined;
}
function Kr(e2, t2) {
  const r = e2._controlledTransformStream, o2 = r._readable._readableStreamController;
  if (!mr(o2))
    throw new TypeError("Readable side is not in a state that permits enqueue");
  try {
    fr(o2, t2);
  } catch (e3) {
    throw Vr(r, e3), r._readable._storedError;
  }
  const n = function(e3) {
    return !ur(e3);
  }(o2);
  n !== r._backpressure && Gr(r, true);
}
function Zr(e2, t2) {
  return _(e2._transformAlgorithm(t2), undefined, (t3) => {
    throw Hr(e2._controlledTransformStream, t3), t3;
  });
}
function eo(e2) {
  return new TypeError(`TransformStreamDefaultController.prototype.${e2} can only be used on a TransformStreamDefaultController`);
}
function to(e2) {
  e2._finishPromise_resolve !== undefined && (e2._finishPromise_resolve(), e2._finishPromise_resolve = undefined, e2._finishPromise_reject = undefined);
}
function ro(e2, t2) {
  e2._finishPromise_reject !== undefined && (p(e2._finishPromise), e2._finishPromise_reject(t2), e2._finishPromise_resolve = undefined, e2._finishPromise_reject = undefined);
}
function oo(e2) {
  return new TypeError(`TransformStream.prototype.${e2} can only be used on a TransformStream`);
}
var r = e;
var n = Promise;
var a = Promise.resolve.bind(n);
var i = Promise.prototype.then;
var l = Promise.reject.bind(n);
var s = a;
var y = (e2) => {
  if (typeof queueMicrotask == "function")
    y = queueMicrotask;
  else {
    const e3 = c(undefined);
    y = (t2) => f(e3, t2);
  }
  return y(e2);
};

class v {
  constructor() {
    this._cursor = 0, this._size = 0, this._front = { _elements: [], _next: undefined }, this._back = this._front, this._cursor = 0, this._size = 0;
  }
  get length() {
    return this._size;
  }
  push(e2) {
    const t2 = this._back;
    let r2 = t2;
    t2._elements.length === 16383 && (r2 = { _elements: [], _next: undefined }), t2._elements.push(e2), r2 !== t2 && (this._back = r2, t2._next = r2), ++this._size;
  }
  shift() {
    const e2 = this._front;
    let t2 = e2;
    const r2 = this._cursor;
    let o2 = r2 + 1;
    const n2 = e2._elements, a2 = n2[r2];
    return o2 === 16384 && (t2 = e2._next, o2 = 0), --this._size, this._cursor = o2, e2 !== t2 && (this._front = t2), n2[r2] = undefined, a2;
  }
  forEach(e2) {
    let t2 = this._cursor, r2 = this._front, o2 = r2._elements;
    for (;!(t2 === o2.length && r2._next === undefined || t2 === o2.length && (r2 = r2._next, o2 = r2._elements, t2 = 0, o2.length === 0)); )
      e2(o2[t2]), ++t2;
  }
  peek() {
    const e2 = this._front, t2 = this._cursor;
    return e2._elements[t2];
  }
}
var w = Symbol("[[AbortSteps]]");
var R = Symbol("[[ErrorSteps]]");
var T = Symbol("[[CancelSteps]]");
var C = Symbol("[[PullSteps]]");
var P = Symbol("[[ReleaseSteps]]");
var z = Number.isFinite || function(e2) {
  return typeof e2 == "number" && isFinite(e2);
};
var D = Math.trunc || function(e2) {
  return e2 < 0 ? Math.ceil(e2) : Math.floor(e2);
};

class ReadableStreamDefaultReader {
  constructor(e2) {
    if ($(e2, 1, "ReadableStreamDefaultReader"), N(e2, "First parameter"), Wr(e2))
      throw new TypeError("This stream has already been locked for exclusive reading by another reader");
    q(this, e2), this._readRequests = new v;
  }
  get closed() {
    return J(this) ? this._closedPromise : d(ee("closed"));
  }
  cancel(e2 = undefined) {
    return J(this) ? this._ownerReadableStream === undefined ? d(O("cancel")) : E(this, e2) : d(ee("cancel"));
  }
  read() {
    if (!J(this))
      return d(ee("read"));
    if (this._ownerReadableStream === undefined)
      return d(O("read from"));
    let e2, t2;
    const r2 = u((r3, o2) => {
      e2 = r3, t2 = o2;
    });
    return K(this, { _chunkSteps: (t3) => e2({ value: t3, done: false }), _closeSteps: () => e2({ value: undefined, done: true }), _errorSteps: (e3) => t2(e3) }), r2;
  }
  releaseLock() {
    if (!J(this))
      throw ee("releaseLock");
    this._ownerReadableStream !== undefined && function(e2) {
      W(e2);
      const t2 = new TypeError("Reader was released");
      Z(e2, t2);
    }(this);
  }
}
var te;
var re;
var oe;
Object.defineProperties(ReadableStreamDefaultReader.prototype, { cancel: { enumerable: true }, read: { enumerable: true }, releaseLock: { enumerable: true }, closed: { enumerable: true } }), o(ReadableStreamDefaultReader.prototype.cancel, "cancel"), o(ReadableStreamDefaultReader.prototype.read, "read"), o(ReadableStreamDefaultReader.prototype.releaseLock, "releaseLock"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(ReadableStreamDefaultReader.prototype, Symbol.toStringTag, { value: "ReadableStreamDefaultReader", configurable: true });
var ie = (e2) => (ie = typeof e2.transfer == "function" ? (e3) => e3.transfer() : typeof structuredClone == "function" ? (e3) => structuredClone(e3, { transfer: [e3] }) : (e3) => e3, ie(e2));
var le = (e2) => (le = typeof e2.detached == "boolean" ? (e3) => e3.detached : (e3) => e3.byteLength === 0, le(e2));
var de = (oe = (te = Symbol.asyncIterator) !== null && te !== undefined ? te : (re = Symbol.for) === null || re === undefined ? undefined : re.call(Symbol, "Symbol.asyncIterator")) !== null && oe !== undefined ? oe : "@@asyncIterator";

class he {
  constructor(e2, t2) {
    this._ongoingPromise = undefined, this._isFinished = false, this._reader = e2, this._preventCancel = t2;
  }
  next() {
    const e2 = () => this._nextSteps();
    return this._ongoingPromise = this._ongoingPromise ? _(this._ongoingPromise, e2, e2) : e2(), this._ongoingPromise;
  }
  return(e2) {
    const t2 = () => this._returnSteps(e2);
    return this._ongoingPromise ? _(this._ongoingPromise, t2, t2) : t2();
  }
  _nextSteps() {
    if (this._isFinished)
      return Promise.resolve({ value: undefined, done: true });
    const e2 = this._reader;
    let t2, r2;
    const o2 = u((e3, o3) => {
      t2 = e3, r2 = o3;
    });
    return K(e2, { _chunkSteps: (e3) => {
      this._ongoingPromise = undefined, y(() => t2({ value: e3, done: false }));
    }, _closeSteps: () => {
      this._ongoingPromise = undefined, this._isFinished = true, W(e2), t2({ value: undefined, done: true });
    }, _errorSteps: (t3) => {
      this._ongoingPromise = undefined, this._isFinished = true, W(e2), r2(t3);
    } }), o2;
  }
  _returnSteps(e2) {
    if (this._isFinished)
      return Promise.resolve({ value: e2, done: true });
    this._isFinished = true;
    const t2 = this._reader;
    if (!this._preventCancel) {
      const r2 = E(t2, e2);
      return W(t2), _(r2, () => ({ value: e2, done: true }));
    }
    return W(t2), c({ value: e2, done: true });
  }
}
var me = { next() {
  return _e(this) ? this._asyncIteratorImpl.next() : d(pe("next"));
}, return(e2) {
  return _e(this) ? this._asyncIteratorImpl.return(e2) : d(pe("return"));
}, [de]() {
  return this;
} };
Object.defineProperty(me, de, { enumerable: false });
var ye = Number.isNaN || function(e2) {
  return e2 != e2;
};

class ReadableStreamBYOBRequest {
  constructor() {
    throw new TypeError("Illegal constructor");
  }
  get view() {
    if (!Ce(this))
      throw Je("view");
    return this._view;
  }
  respond(e2) {
    if (!Ce(this))
      throw Je("respond");
    if ($(e2, 1, "respond"), e2 = Q(e2, "First parameter"), this._associatedReadableByteStreamController === undefined)
      throw new TypeError("This BYOB request has been invalidated");
    if (le(this._view.buffer))
      throw new TypeError("The BYOB request's buffer has been detached and so cannot be used as a response");
    Ue(this._associatedReadableByteStreamController, e2);
  }
  respondWithNewView(e2) {
    if (!Ce(this))
      throw Je("respondWithNewView");
    if ($(e2, 1, "respondWithNewView"), !ArrayBuffer.isView(e2))
      throw new TypeError("You can only respond with array buffer views");
    if (this._associatedReadableByteStreamController === undefined)
      throw new TypeError("This BYOB request has been invalidated");
    if (le(e2.buffer))
      throw new TypeError("The given view's buffer has been detached and so cannot be used as a response");
    Ge(this._associatedReadableByteStreamController, e2);
  }
}
Object.defineProperties(ReadableStreamBYOBRequest.prototype, { respond: { enumerable: true }, respondWithNewView: { enumerable: true }, view: { enumerable: true } }), o(ReadableStreamBYOBRequest.prototype.respond, "respond"), o(ReadableStreamBYOBRequest.prototype.respondWithNewView, "respondWithNewView"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(ReadableStreamBYOBRequest.prototype, Symbol.toStringTag, { value: "ReadableStreamBYOBRequest", configurable: true });

class ReadableByteStreamController {
  constructor() {
    throw new TypeError("Illegal constructor");
  }
  get byobRequest() {
    if (!Te(this))
      throw Ke("byobRequest");
    return He(this);
  }
  get desiredSize() {
    if (!Te(this))
      throw Ke("desiredSize");
    return Ve(this);
  }
  close() {
    if (!Te(this))
      throw Ke("close");
    if (this._closeRequested)
      throw new TypeError("The stream has already been closed; do not close it again!");
    const e2 = this._controlledReadableByteStream._state;
    if (e2 !== "readable")
      throw new TypeError(`The stream (in ${e2} state) is not in the readable state and cannot be closed`);
    Ye(this);
  }
  enqueue(e2) {
    if (!Te(this))
      throw Ke("enqueue");
    if ($(e2, 1, "enqueue"), !ArrayBuffer.isView(e2))
      throw new TypeError("chunk must be an array buffer view");
    if (e2.byteLength === 0)
      throw new TypeError("chunk must have non-zero byteLength");
    if (e2.buffer.byteLength === 0)
      throw new TypeError("chunk's buffer must have non-zero byteLength");
    if (this._closeRequested)
      throw new TypeError("stream is closed or draining");
    const t2 = this._controlledReadableByteStream._state;
    if (t2 !== "readable")
      throw new TypeError(`The stream (in ${t2} state) is not in the readable state and cannot be enqueued to`);
    xe(this, e2);
  }
  error(e2 = undefined) {
    if (!Te(this))
      throw Ke("error");
    Qe(this, e2);
  }
  [T](e2) {
    qe(this), we(this);
    const t2 = this._cancelAlgorithm(e2);
    return Me(this), t2;
  }
  [C](e2) {
    const t2 = this._controlledReadableByteStream;
    if (this._queueTotalSize > 0)
      return void Ne(this, e2);
    const r2 = this._autoAllocateChunkSize;
    if (r2 !== undefined) {
      let t3;
      try {
        t3 = new ArrayBuffer(r2);
      } catch (t4) {
        return void e2._errorSteps(t4);
      }
      const o2 = { buffer: t3, bufferByteLength: r2, byteOffset: 0, byteLength: r2, bytesFilled: 0, minimumFill: 1, elementSize: 1, viewConstructor: Uint8Array, readerType: "default" };
      this._pendingPullIntos.push(o2);
    }
    V(t2, e2), Pe(this);
  }
  [P]() {
    if (this._pendingPullIntos.length > 0) {
      const e2 = this._pendingPullIntos.peek();
      e2.readerType = "none", this._pendingPullIntos = new v, this._pendingPullIntos.push(e2);
    }
  }
}
Object.defineProperties(ReadableByteStreamController.prototype, { close: { enumerable: true }, enqueue: { enumerable: true }, error: { enumerable: true }, byobRequest: { enumerable: true }, desiredSize: { enumerable: true } }), o(ReadableByteStreamController.prototype.close, "close"), o(ReadableByteStreamController.prototype.enqueue, "enqueue"), o(ReadableByteStreamController.prototype.error, "error"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(ReadableByteStreamController.prototype, Symbol.toStringTag, { value: "ReadableByteStreamController", configurable: true });

class ReadableStreamBYOBReader {
  constructor(e2) {
    if ($(e2, 1, "ReadableStreamBYOBReader"), N(e2, "First parameter"), Wr(e2))
      throw new TypeError("This stream has already been locked for exclusive reading by another reader");
    if (!Te(e2._readableStreamController))
      throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
    q(this, e2), this._readIntoRequests = new v;
  }
  get closed() {
    return nt(this) ? this._closedPromise : d(lt("closed"));
  }
  cancel(e2 = undefined) {
    return nt(this) ? this._ownerReadableStream === undefined ? d(O("cancel")) : E(this, e2) : d(lt("cancel"));
  }
  read(e2, t2 = {}) {
    if (!nt(this))
      return d(lt("read"));
    if (!ArrayBuffer.isView(e2))
      return d(new TypeError("view must be an array buffer view"));
    if (e2.byteLength === 0)
      return d(new TypeError("view must have non-zero byteLength"));
    if (e2.buffer.byteLength === 0)
      return d(new TypeError("view's buffer must have non-zero byteLength"));
    if (le(e2.buffer))
      return d(new TypeError("view's buffer has been detached"));
    let r2;
    try {
      r2 = function(e3, t3) {
        var r3;
        return L(e3, t3), { min: Q((r3 = e3 == null ? undefined : e3.min) !== null && r3 !== undefined ? r3 : 1, `${t3} has member 'min' that`) };
      }(t2, "options");
    } catch (e3) {
      return d(e3);
    }
    const o2 = r2.min;
    if (o2 === 0)
      return d(new TypeError("options.min must be greater than 0"));
    if (function(e3) {
      return Re(e3.constructor);
    }(e2)) {
      if (o2 > e2.byteLength)
        return d(new RangeError("options.min must be less than or equal to view's byteLength"));
    } else if (o2 > e2.length)
      return d(new RangeError("options.min must be less than or equal to view's length"));
    if (this._ownerReadableStream === undefined)
      return d(O("read from"));
    let n2, a2;
    const i2 = u((e3, t3) => {
      n2 = e3, a2 = t3;
    });
    return at(this, e2, o2, { _chunkSteps: (e3) => n2({ value: e3, done: false }), _closeSteps: (e3) => n2({ value: e3, done: true }), _errorSteps: (e3) => a2(e3) }), i2;
  }
  releaseLock() {
    if (!nt(this))
      throw lt("releaseLock");
    this._ownerReadableStream !== undefined && function(e2) {
      W(e2);
      const t2 = new TypeError("Reader was released");
      it(e2, t2);
    }(this);
  }
}
Object.defineProperties(ReadableStreamBYOBReader.prototype, { cancel: { enumerable: true }, read: { enumerable: true }, releaseLock: { enumerable: true }, closed: { enumerable: true } }), o(ReadableStreamBYOBReader.prototype.cancel, "cancel"), o(ReadableStreamBYOBReader.prototype.read, "read"), o(ReadableStreamBYOBReader.prototype.releaseLock, "releaseLock"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(ReadableStreamBYOBReader.prototype, Symbol.toStringTag, { value: "ReadableStreamBYOBReader", configurable: true });
var pt = typeof AbortController == "function";

class WritableStream {
  constructor(e2 = {}, t2 = {}) {
    e2 === undefined ? e2 = null : I(e2, "First parameter");
    const r2 = ct(t2, "Second parameter"), o2 = function(e3, t3) {
      L(e3, t3);
      const r3 = e3 == null ? undefined : e3.abort, o3 = e3 == null ? undefined : e3.close, n3 = e3 == null ? undefined : e3.start, a2 = e3 == null ? undefined : e3.type, i2 = e3 == null ? undefined : e3.write;
      return { abort: r3 === undefined ? undefined : ft(r3, e3, `${t3} has member 'abort' that`), close: o3 === undefined ? undefined : bt(o3, e3, `${t3} has member 'close' that`), start: n3 === undefined ? undefined : ht(n3, e3, `${t3} has member 'start' that`), write: i2 === undefined ? undefined : mt(i2, e3, `${t3} has member 'write' that`), type: a2 };
    }(e2, "First parameter");
    St(this);
    if (o2.type !== undefined)
      throw new RangeError("Invalid type is specified");
    const n2 = ut(r2);
    (function(e3, t3, r3, o3) {
      const n3 = Object.create(WritableStreamDefaultController.prototype);
      let a2, i2, l2, s2;
      a2 = t3.start !== undefined ? () => t3.start(n3) : () => {
      };
      i2 = t3.write !== undefined ? (e4) => t3.write(e4, n3) : () => c(undefined);
      l2 = t3.close !== undefined ? () => t3.close() : () => c(undefined);
      s2 = t3.abort !== undefined ? (e4) => t3.abort(e4) : () => c(undefined);
      Ft(e3, n3, a2, i2, l2, s2, r3, o3);
    })(this, o2, st(r2, 1), n2);
  }
  get locked() {
    if (!gt(this))
      throw Nt("locked");
    return vt(this);
  }
  abort(e2 = undefined) {
    return gt(this) ? vt(this) ? d(new TypeError("Cannot abort a stream that already has a writer")) : wt(this, e2) : d(Nt("abort"));
  }
  close() {
    return gt(this) ? vt(this) ? d(new TypeError("Cannot close a stream that already has a writer")) : qt(this) ? d(new TypeError("Cannot close an already-closing stream")) : Rt(this) : d(Nt("close"));
  }
  getWriter() {
    if (!gt(this))
      throw Nt("getWriter");
    return yt(this);
  }
}
Object.defineProperties(WritableStream.prototype, { abort: { enumerable: true }, close: { enumerable: true }, getWriter: { enumerable: true }, locked: { enumerable: true } }), o(WritableStream.prototype.abort, "abort"), o(WritableStream.prototype.close, "close"), o(WritableStream.prototype.getWriter, "getWriter"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(WritableStream.prototype, Symbol.toStringTag, { value: "WritableStream", configurable: true });

class WritableStreamDefaultWriter {
  constructor(e2) {
    if ($(e2, 1, "WritableStreamDefaultWriter"), _t(e2, "First parameter"), vt(e2))
      throw new TypeError("This stream has already been locked for exclusive writing by another writer");
    this._ownerWritableStream = e2, e2._writer = this;
    const t2 = e2._state;
    if (t2 === "writable")
      !qt(e2) && e2._backpressure ? Zt(this) : tr(this), Gt(this);
    else if (t2 === "erroring")
      er(this, e2._storedError), Gt(this);
    else if (t2 === "closed")
      tr(this), Gt(r2 = this), Kt(r2);
    else {
      const t3 = e2._storedError;
      er(this, t3), Xt(this, t3);
    }
    var r2;
  }
  get closed() {
    return Ot(this) ? this._closedPromise : d(Vt("closed"));
  }
  get desiredSize() {
    if (!Ot(this))
      throw Vt("desiredSize");
    if (this._ownerWritableStream === undefined)
      throw Ut("desiredSize");
    return function(e2) {
      const t2 = e2._ownerWritableStream, r2 = t2._state;
      if (r2 === "errored" || r2 === "erroring")
        return null;
      if (r2 === "closed")
        return 0;
      return $t(t2._writableStreamController);
    }(this);
  }
  get ready() {
    return Ot(this) ? this._readyPromise : d(Vt("ready"));
  }
  abort(e2 = undefined) {
    return Ot(this) ? this._ownerWritableStream === undefined ? d(Ut("abort")) : function(e3, t2) {
      return wt(e3._ownerWritableStream, t2);
    }(this, e2) : d(Vt("abort"));
  }
  close() {
    if (!Ot(this))
      return d(Vt("close"));
    const e2 = this._ownerWritableStream;
    return e2 === undefined ? d(Ut("close")) : qt(e2) ? d(new TypeError("Cannot close an already-closing stream")) : Bt(this);
  }
  releaseLock() {
    if (!Ot(this))
      throw Vt("releaseLock");
    this._ownerWritableStream !== undefined && At(this);
  }
  write(e2 = undefined) {
    return Ot(this) ? this._ownerWritableStream === undefined ? d(Ut("write to")) : zt(this, e2) : d(Vt("write"));
  }
}
Object.defineProperties(WritableStreamDefaultWriter.prototype, { abort: { enumerable: true }, close: { enumerable: true }, releaseLock: { enumerable: true }, write: { enumerable: true }, closed: { enumerable: true }, desiredSize: { enumerable: true }, ready: { enumerable: true } }), o(WritableStreamDefaultWriter.prototype.abort, "abort"), o(WritableStreamDefaultWriter.prototype.close, "close"), o(WritableStreamDefaultWriter.prototype.releaseLock, "releaseLock"), o(WritableStreamDefaultWriter.prototype.write, "write"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(WritableStreamDefaultWriter.prototype, Symbol.toStringTag, { value: "WritableStreamDefaultWriter", configurable: true });
var Dt = {};

class WritableStreamDefaultController {
  constructor() {
    throw new TypeError("Illegal constructor");
  }
  get abortReason() {
    if (!Lt(this))
      throw Ht("abortReason");
    return this._abortReason;
  }
  get signal() {
    if (!Lt(this))
      throw Ht("signal");
    if (this._abortController === undefined)
      throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
    return this._abortController.signal;
  }
  error(e2 = undefined) {
    if (!Lt(this))
      throw Ht("error");
    this._controlledWritableStream._state === "writable" && Qt(this, e2);
  }
  [w](e2) {
    const t2 = this._abortAlgorithm(e2);
    return It(this), t2;
  }
  [R]() {
    we(this);
  }
}
Object.defineProperties(WritableStreamDefaultController.prototype, { abortReason: { enumerable: true }, signal: { enumerable: true }, error: { enumerable: true } }), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(WritableStreamDefaultController.prototype, Symbol.toStringTag, { value: "WritableStreamDefaultController", configurable: true });
var nr = typeof globalThis != "undefined" ? globalThis : typeof self != "undefined" ? self : typeof global != "undefined" ? global : undefined;
var ar = function() {
  const e2 = nr == null ? undefined : nr.DOMException;
  return function(e3) {
    if (typeof e3 != "function" && typeof e3 != "object")
      return false;
    if (e3.name !== "DOMException")
      return false;
    try {
      return new e3, true;
    } catch (e4) {
      return false;
    }
  }(e2) ? e2 : undefined;
}() || function() {
  const e2 = function(e3, t2) {
    this.message = e3 || "", this.name = t2 || "Error", Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  };
  return o(e2, "DOMException"), e2.prototype = Object.create(Error.prototype), Object.defineProperty(e2.prototype, "constructor", { value: e2, writable: true, configurable: true }), e2;
}();

class ReadableStreamDefaultController {
  constructor() {
    throw new TypeError("Illegal constructor");
  }
  get desiredSize() {
    if (!lr(this))
      throw pr("desiredSize");
    return hr(this);
  }
  close() {
    if (!lr(this))
      throw pr("close");
    if (!mr(this))
      throw new TypeError("The stream is not in a state that permits close");
    dr(this);
  }
  enqueue(e2 = undefined) {
    if (!lr(this))
      throw pr("enqueue");
    if (!mr(this))
      throw new TypeError("The stream is not in a state that permits enqueue");
    return fr(this, e2);
  }
  error(e2 = undefined) {
    if (!lr(this))
      throw pr("error");
    br(this, e2);
  }
  [T](e2) {
    we(this);
    const t2 = this._cancelAlgorithm(e2);
    return cr(this), t2;
  }
  [C](e2) {
    const t2 = this._controlledReadableStream;
    if (this._queue.length > 0) {
      const r2 = ge(this);
      this._closeRequested && this._queue.length === 0 ? (cr(this), Br(t2)) : sr(this), e2._chunkSteps(r2);
    } else
      V(t2, e2), sr(this);
  }
  [P]() {
  }
}
Object.defineProperties(ReadableStreamDefaultController.prototype, { close: { enumerable: true }, enqueue: { enumerable: true }, error: { enumerable: true }, desiredSize: { enumerable: true } }), o(ReadableStreamDefaultController.prototype.close, "close"), o(ReadableStreamDefaultController.prototype.enqueue, "enqueue"), o(ReadableStreamDefaultController.prototype.error, "error"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(ReadableStreamDefaultController.prototype, Symbol.toStringTag, { value: "ReadableStreamDefaultController", configurable: true });

class ReadableStream {
  constructor(e2 = {}, t2 = {}) {
    e2 === undefined ? e2 = null : I(e2, "First parameter");
    const r2 = ct(t2, "Second parameter"), o2 = function(e3, t3) {
      L(e3, t3);
      const r3 = e3, o3 = r3 == null ? undefined : r3.autoAllocateChunkSize, n2 = r3 == null ? undefined : r3.cancel, a2 = r3 == null ? undefined : r3.pull, i2 = r3 == null ? undefined : r3.start, l2 = r3 == null ? undefined : r3.type;
      return { autoAllocateChunkSize: o3 === undefined ? undefined : Q(o3, `${t3} has member 'autoAllocateChunkSize' that`), cancel: n2 === undefined ? undefined : gr(n2, r3, `${t3} has member 'cancel' that`), pull: a2 === undefined ? undefined : vr(a2, r3, `${t3} has member 'pull' that`), start: i2 === undefined ? undefined : wr(i2, r3, `${t3} has member 'start' that`), type: l2 === undefined ? undefined : Rr(l2, `${t3} has member 'type' that`) };
    }(e2, "First parameter");
    if (qr(this), o2.type === "bytes") {
      if (r2.size !== undefined)
        throw new RangeError("The strategy for a byte stream cannot have a size function");
      (function(e3, t3, r3) {
        const o3 = Object.create(ReadableByteStreamController.prototype);
        let n2, a2, i2;
        n2 = t3.start !== undefined ? () => t3.start(o3) : () => {
        }, a2 = t3.pull !== undefined ? () => t3.pull(o3) : () => c(undefined), i2 = t3.cancel !== undefined ? (e4) => t3.cancel(e4) : () => c(undefined);
        const l2 = t3.autoAllocateChunkSize;
        if (l2 === 0)
          throw new TypeError("autoAllocateChunkSize must be greater than 0");
        Xe(e3, o3, n2, a2, i2, r3, l2);
      })(this, o2, st(r2, 0));
    } else {
      const e3 = ut(r2);
      (function(e4, t3, r3, o3) {
        const n2 = Object.create(ReadableStreamDefaultController.prototype);
        let a2, i2, l2;
        a2 = t3.start !== undefined ? () => t3.start(n2) : () => {
        }, i2 = t3.pull !== undefined ? () => t3.pull(n2) : () => c(undefined), l2 = t3.cancel !== undefined ? (e5) => t3.cancel(e5) : () => c(undefined), _r(e4, n2, a2, i2, l2, r3, o3);
      })(this, o2, st(r2, 1), e3);
    }
  }
  get locked() {
    if (!Er(this))
      throw jr("locked");
    return Wr(this);
  }
  cancel(e2 = undefined) {
    return Er(this) ? Wr(this) ? d(new TypeError("Cannot cancel a stream that already has a reader")) : Or(this, e2) : d(jr("cancel"));
  }
  getReader(e2 = undefined) {
    if (!Er(this))
      throw jr("getReader");
    return function(e3, t2) {
      L(e3, t2);
      const r2 = e3 == null ? undefined : e3.mode;
      return { mode: r2 === undefined ? undefined : Ze(r2, `${t2} has member 'mode' that`) };
    }(e2, "First parameter").mode === undefined ? H(this) : et(this);
  }
  pipeThrough(e2, t2 = {}) {
    if (!Er(this))
      throw jr("pipeThrough");
    $(e2, 1, "pipeThrough");
    const r2 = function(e3, t3) {
      L(e3, t3);
      const r3 = e3 == null ? undefined : e3.readable;
      M(r3, "readable", "ReadableWritablePair"), N(r3, `${t3} has member 'readable' that`);
      const o3 = e3 == null ? undefined : e3.writable;
      return M(o3, "writable", "ReadableWritablePair"), _t(o3, `${t3} has member 'writable' that`), { readable: r3, writable: o3 };
    }(e2, "First parameter"), o2 = Tr(t2, "Second parameter");
    if (Wr(this))
      throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
    if (vt(r2.writable))
      throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
    return p(ir(this, r2.writable, o2.preventClose, o2.preventAbort, o2.preventCancel, o2.signal)), r2.readable;
  }
  pipeTo(e2, t2 = {}) {
    if (!Er(this))
      return d(jr("pipeTo"));
    if (e2 === undefined)
      return d("Parameter 1 is required in 'pipeTo'.");
    if (!gt(e2))
      return d(new TypeError("ReadableStream.prototype.pipeTo's first argument must be a WritableStream"));
    let r2;
    try {
      r2 = Tr(t2, "Second parameter");
    } catch (e3) {
      return d(e3);
    }
    return Wr(this) ? d(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream")) : vt(e2) ? d(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream")) : ir(this, e2, r2.preventClose, r2.preventAbort, r2.preventCancel, r2.signal);
  }
  tee() {
    if (!Er(this))
      throw jr("tee");
    return ne(yr(this));
  }
  values(e2 = undefined) {
    if (!Er(this))
      throw jr("values");
    return function(e3, t2) {
      const r2 = H(e3), o2 = new he(r2, t2), n2 = Object.create(me);
      return n2._asyncIteratorImpl = o2, n2;
    }(this, function(e3, t2) {
      L(e3, t2);
      const r2 = e3 == null ? undefined : e3.preventCancel;
      return { preventCancel: Boolean(r2) };
    }(e2, "First parameter").preventCancel);
  }
  [de](e2) {
    return this.values(e2);
  }
  static from(e2) {
    return Sr(e2);
  }
}
Object.defineProperties(ReadableStream, { from: { enumerable: true } }), Object.defineProperties(ReadableStream.prototype, { cancel: { enumerable: true }, getReader: { enumerable: true }, pipeThrough: { enumerable: true }, pipeTo: { enumerable: true }, tee: { enumerable: true }, values: { enumerable: true }, locked: { enumerable: true } }), o(ReadableStream.from, "from"), o(ReadableStream.prototype.cancel, "cancel"), o(ReadableStream.prototype.getReader, "getReader"), o(ReadableStream.prototype.pipeThrough, "pipeThrough"), o(ReadableStream.prototype.pipeTo, "pipeTo"), o(ReadableStream.prototype.tee, "tee"), o(ReadableStream.prototype.values, "values"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(ReadableStream.prototype, Symbol.toStringTag, { value: "ReadableStream", configurable: true }), Object.defineProperty(ReadableStream.prototype, de, { value: ReadableStream.prototype.values, writable: true, configurable: true });
var zr = (e2) => e2.byteLength;
o(zr, "size");

class ByteLengthQueuingStrategy {
  constructor(e2) {
    $(e2, 1, "ByteLengthQueuingStrategy"), e2 = Ar(e2, "First parameter"), this._byteLengthQueuingStrategyHighWaterMark = e2.highWaterMark;
  }
  get highWaterMark() {
    if (!Lr(this))
      throw Dr("highWaterMark");
    return this._byteLengthQueuingStrategyHighWaterMark;
  }
  get size() {
    if (!Lr(this))
      throw Dr("size");
    return zr;
  }
}
Object.defineProperties(ByteLengthQueuingStrategy.prototype, { highWaterMark: { enumerable: true }, size: { enumerable: true } }), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(ByteLengthQueuingStrategy.prototype, Symbol.toStringTag, { value: "ByteLengthQueuingStrategy", configurable: true });
var Fr = () => 1;
o(Fr, "size");

class CountQueuingStrategy {
  constructor(e2) {
    $(e2, 1, "CountQueuingStrategy"), e2 = Ar(e2, "First parameter"), this._countQueuingStrategyHighWaterMark = e2.highWaterMark;
  }
  get highWaterMark() {
    if (!$r(this))
      throw Ir("highWaterMark");
    return this._countQueuingStrategyHighWaterMark;
  }
  get size() {
    if (!$r(this))
      throw Ir("size");
    return Fr;
  }
}
Object.defineProperties(CountQueuingStrategy.prototype, { highWaterMark: { enumerable: true }, size: { enumerable: true } }), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(CountQueuingStrategy.prototype, Symbol.toStringTag, { value: "CountQueuingStrategy", configurable: true });

class TransformStream {
  constructor(e2 = {}, t2 = {}, r2 = {}) {
    e2 === undefined && (e2 = null);
    const o2 = ct(t2, "Second parameter"), n2 = ct(r2, "Third parameter"), a2 = function(e3, t3) {
      L(e3, t3);
      const r3 = e3 == null ? undefined : e3.cancel, o3 = e3 == null ? undefined : e3.flush, n3 = e3 == null ? undefined : e3.readableType, a3 = e3 == null ? undefined : e3.start, i3 = e3 == null ? undefined : e3.transform, l3 = e3 == null ? undefined : e3.writableType;
      return { cancel: r3 === undefined ? undefined : Qr(r3, e3, `${t3} has member 'cancel' that`), flush: o3 === undefined ? undefined : Mr(o3, e3, `${t3} has member 'flush' that`), readableType: n3, start: a3 === undefined ? undefined : Yr(a3, e3, `${t3} has member 'start' that`), transform: i3 === undefined ? undefined : xr(i3, e3, `${t3} has member 'transform' that`), writableType: l3 };
    }(e2, "First parameter");
    if (a2.readableType !== undefined)
      throw new RangeError("Invalid readableType specified");
    if (a2.writableType !== undefined)
      throw new RangeError("Invalid writableType specified");
    const i2 = st(n2, 0), l2 = ut(n2), s2 = st(o2, 1), f2 = ut(o2);
    let h2;
    (function(e3, t3, r3, o3, n3, a3) {
      function i3() {
        return t3;
      }
      function l3(t4) {
        return function(e4, t5) {
          const r4 = e4._transformStreamController;
          if (e4._backpressure) {
            return _(e4._backpressureChangePromise, () => {
              const o4 = e4._writable;
              if (o4._state === "erroring")
                throw o4._storedError;
              return Zr(r4, t5);
            });
          }
          return Zr(r4, t5);
        }(e3, t4);
      }
      function s3(t4) {
        return function(e4, t5) {
          const r4 = e4._transformStreamController;
          if (r4._finishPromise !== undefined)
            return r4._finishPromise;
          const o4 = e4._readable;
          r4._finishPromise = u((e5, t6) => {
            r4._finishPromise_resolve = e5, r4._finishPromise_reject = t6;
          });
          const n4 = r4._cancelAlgorithm(t5);
          return Jr(r4), b(n4, () => (o4._state === "errored" ? ro(r4, o4._storedError) : (br(o4._readableStreamController, t5), to(r4)), null), (e5) => (br(o4._readableStreamController, e5), ro(r4, e5), null)), r4._finishPromise;
        }(e3, t4);
      }
      function c2() {
        return function(e4) {
          const t4 = e4._transformStreamController;
          if (t4._finishPromise !== undefined)
            return t4._finishPromise;
          const r4 = e4._readable;
          t4._finishPromise = u((e5, r5) => {
            t4._finishPromise_resolve = e5, t4._finishPromise_reject = r5;
          });
          const o4 = t4._flushAlgorithm();
          return Jr(t4), b(o4, () => (r4._state === "errored" ? ro(t4, r4._storedError) : (dr(r4._readableStreamController), to(t4)), null), (e5) => (br(r4._readableStreamController, e5), ro(t4, e5), null)), t4._finishPromise;
        }(e3);
      }
      function d2() {
        return function(e4) {
          return Gr(e4, false), e4._backpressureChangePromise;
        }(e3);
      }
      function f3(t4) {
        return function(e4, t5) {
          const r4 = e4._transformStreamController;
          if (r4._finishPromise !== undefined)
            return r4._finishPromise;
          const o4 = e4._writable;
          r4._finishPromise = u((e5, t6) => {
            r4._finishPromise_resolve = e5, r4._finishPromise_reject = t6;
          });
          const n4 = r4._cancelAlgorithm(t5);
          return Jr(r4), b(n4, () => (o4._state === "errored" ? ro(r4, o4._storedError) : (Yt(o4._writableStreamController, t5), Ur(e4), to(r4)), null), (t6) => (Yt(o4._writableStreamController, t6), Ur(e4), ro(r4, t6), null)), r4._finishPromise;
        }(e3, t4);
      }
      e3._writable = function(e4, t4, r4, o4, n4 = 1, a4 = () => 1) {
        const i4 = Object.create(WritableStream.prototype);
        return St(i4), Ft(i4, Object.create(WritableStreamDefaultController.prototype), e4, t4, r4, o4, n4, a4), i4;
      }(i3, l3, c2, s3, r3, o3), e3._readable = Cr(i3, d2, f3, n3, a3), e3._backpressure = undefined, e3._backpressureChangePromise = undefined, e3._backpressureChangePromise_resolve = undefined, Gr(e3, true), e3._transformStreamController = undefined;
    })(this, u((e3) => {
      h2 = e3;
    }), s2, f2, i2, l2), function(e3, t3) {
      const r3 = Object.create(TransformStreamDefaultController.prototype);
      let o3, n3, a3;
      o3 = t3.transform !== undefined ? (e4) => t3.transform(e4, r3) : (e4) => {
        try {
          return Kr(r3, e4), c(undefined);
        } catch (e5) {
          return d(e5);
        }
      };
      n3 = t3.flush !== undefined ? () => t3.flush(r3) : () => c(undefined);
      a3 = t3.cancel !== undefined ? (e4) => t3.cancel(e4) : () => c(undefined);
      (function(e4, t4, r4, o4, n4) {
        t4._controlledTransformStream = e4, e4._transformStreamController = t4, t4._transformAlgorithm = r4, t4._flushAlgorithm = o4, t4._cancelAlgorithm = n4, t4._finishPromise = undefined, t4._finishPromise_resolve = undefined, t4._finishPromise_reject = undefined;
      })(e3, r3, o3, n3, a3);
    }(this, a2), a2.start !== undefined ? h2(a2.start(this._transformStreamController)) : h2(undefined);
  }
  get readable() {
    if (!Nr(this))
      throw oo("readable");
    return this._readable;
  }
  get writable() {
    if (!Nr(this))
      throw oo("writable");
    return this._writable;
  }
}
Object.defineProperties(TransformStream.prototype, { readable: { enumerable: true }, writable: { enumerable: true } }), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(TransformStream.prototype, Symbol.toStringTag, { value: "TransformStream", configurable: true });

class TransformStreamDefaultController {
  constructor() {
    throw new TypeError("Illegal constructor");
  }
  get desiredSize() {
    if (!Xr(this))
      throw eo("desiredSize");
    return hr(this._controlledTransformStream._readable._readableStreamController);
  }
  enqueue(e2 = undefined) {
    if (!Xr(this))
      throw eo("enqueue");
    Kr(this, e2);
  }
  error(e2 = undefined) {
    if (!Xr(this))
      throw eo("error");
    var t2;
    t2 = e2, Hr(this._controlledTransformStream, t2);
  }
  terminate() {
    if (!Xr(this))
      throw eo("terminate");
    (function(e2) {
      const t2 = e2._controlledTransformStream;
      dr(t2._readable._readableStreamController);
      const r2 = new TypeError("TransformStream terminated");
      Vr(t2, r2);
    })(this);
  }
}
Object.defineProperties(TransformStreamDefaultController.prototype, { enqueue: { enumerable: true }, error: { enumerable: true }, terminate: { enumerable: true }, desiredSize: { enumerable: true } }), o(TransformStreamDefaultController.prototype.enqueue, "enqueue"), o(TransformStreamDefaultController.prototype.error, "error"), o(TransformStreamDefaultController.prototype.terminate, "terminate"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(TransformStreamDefaultController.prototype, Symbol.toStringTag, { value: "TransformStreamDefaultController", configurable: true });
export {
  WritableStreamDefaultWriter,
  WritableStreamDefaultController,
  WritableStream,
  TransformStreamDefaultController,
  TransformStream,
  ReadableStreamDefaultReader,
  ReadableStreamDefaultController,
  ReadableStreamBYOBRequest,
  ReadableStreamBYOBReader,
  ReadableStream,
  ReadableByteStreamController,
  CountQueuingStrategy,
  ByteLengthQueuingStrategy
};
