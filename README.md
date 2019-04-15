# serial-stream

### Abstract

This is basically DataInputStream/BinaryReader and DataOutputStream/BinaryWriter
for Node, using Promises.

## Usage

### Writing streams

```javascript
const { SerialStreamWriter } = require('serial-stream');
const stream = <Some Stream>;

const writer = new SerialStreamWriter(stream);
writer.writeInt32LE(123);
writer.writeDoubleLE(123.45);
writer.writeString("Hello World");
writer.writeJson({text: "Hello World"});
```

When writing more complex data, you may wish to write a size header first.

```javascript
const array = [1,2,3,4,5];
writer.writeUInt32LE(array.length);
array.forEach((v) => writer.writeDoubleLE(v));
```

### Reading streams

Each read function can be called with a callback, or used as a promise. The
value returned from the callback function will override what is resolved by the
promise.

```javascript
const { SerialStreamReader } = require('serial-stream');
const stream = <Some Stream>;

const reader = new SerialStreamReader(stream);
reader.readInt32LE((v) => console.log(v));
console.log(await reader.readDoubleLE());
console.log(await reader.readString((str) => str.toUpperCase())) // "HELLO WORLD"
const obj = await reader.readJson();
console.log(obj.text) // "Hello World"
```

#### Promise vs. callback

When decoding complex data, it may be impossible to predict what read commands
to issue until you begin reading data. In these cases, these read commands must
take priority over anything previously queued up.

Promises are always resolved asyncronously, even when the data is immediately
available. This makes it impossible to tell when a read command is issued as a
result of another read.

Callbacks are resolved immediately when data is available. This allows the
library to detect if a read command is issued as a result of another read, and
prioritize it ahead of other reads.

```javascript
const length = reader.readUInt32LE;
const promises = new Array(length);
for (var i = 0; i < length; i++) {
  promises[i] = reader.readDoubleLE();
}
Promise.all(promises).then((array) => console.log(array)) // [1,2,3,4,5]
```

## SerialStreamWriter

### Constructor

- SerialStreamWriter(stream)

### Methods

- write(value, byteLength): Promise[Buffer]
- writeBoolean(value)
- writeBuffer(value)
- writeString(value)
- writeJson(value)
- writeDoubleBE(value)
- writeDoubleLE(value)
- writeFloatBE(value)
- writeFloatLE(value)
- writeInt8(value)
- writeInt16BE(value)
- writeInt16LE(value)
- writeInt32BE(value)
- writeInt32LE(value)
- writeUInt8(value)
- writeUInt16BE(value)
- writeUInt16LE(value)
- writeUInt32BE(value)
- writeUInt32LE(value)
- writeIntBE(value, byteLength)
- writeIntLE(value, byteLength)
- writeUIntBE(value, byteLength)
- writeUIntLE(value, byteLength)

## SerialStreamReader

### Constructor

- SerialStreamReader(stream)

### Methods

- read(byteLength[, callback]): Promise[Buffer]
- readBoolean([callback]): Promise[Boolean]
- readBuffer([callback]): Promise[Buffer]
- readString([callback]): Promise[String]
- readJson([callback]): Promise[Object]
- readDoubleBE([callback]): Promise[Number]
- readDoubleLE([callback]): Promise[Number]
- readFloatBE([callback]): Promise[Number]
- readFloatLE([callback]): Promise[Number]
- readInt8([callback]): Promise[Number]
- readInt16BE([callback]): Promise[Number]
- readInt16LE([callback]): Promise[Number]
- readInt32BE([callback]): Promise[Number]
- readInt32LE([callback]): Promise[Number]
- readUInt8([callback]): Promise[Number]
- readUInt16BE([callback]): Promise[Number]
- readUInt16LE([callback]): Promise[Number]
- readUInt32BE([callback]): Promise[Number]
- readUInt32LE([callback]): Promise[Number]
- readIntBE(byteLength[, callback]): Promise[Number]
- readIntLE(byteLength[, callback]): Promise[Number]
- readUIntBE(byteLength[, callback]): Promise[Number]
- readUIntLE(byteLength[, callback]): Promise[Number]

## writeBuffer & readBuffer vs. write & read

`write` and `read` are meant to send and receive buffers as-is. `write` takes
a buffer, and sends it as-is. `read` takes an integer and returns a buffer of
that size.

`writeBuffer` and `readBuffer` are meant to send and receive buffers with size
headers. `writeBuffer` takes a buffer and sends the length followed by the
bytes. `readBuffer` reads the size parameter from the stream, then reads that
size of bytes from the stream, and returns a buffer with those bytes.

## LE (Little Endian) vs. BE (Big Endian)

See [Wikipedia: Endianness](https://en.wikipedia.org/wiki/Endianness) for more
details. What's important is to be consistent. When in doubt, use LE functions.
