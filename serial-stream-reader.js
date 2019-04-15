const BufferChunker = require('./buffer-chunker');
class SerialStreamReader{
  constructor(stream) {
    this.stream = stream;
    this._bc = new BufferChunker();
    stream.pipe(this._bc);
  }
  read(length, map)  { return this._bc.read(length, (x) => {
    return map ? map(x) : x;
  }); }
  readDoubleBE(map)  { return this.read(8, (v) => { const value = v.readDoubleBE(0); return map ? map(value) : value }); }
  readDoubleLE(map)  { return this.read(8, (v) => { const value = v.readDoubleLE(0); return map ? map(value) : value }); }
  readFloatBE(map)   { return this.read(4, (v) => { const value = v.readFloatBE(0); return map ? map(value) : value }); }
  readFloatLE(map)   { return this.read(4, (v) => { const value = v.readFloatLE(0); return map ? map(value) : value }); }
  readInt8(map)      { return this.read(1, (v) => { const value = v.readInt8(0); return map ? map(value) : value }); }
  readInt16BE(map)   { return this.read(2, (v) => { const value = v.readInt16BE(0); return map ? map(value) : value }); }
  readInt16LE(map)   { return this.read(2, (v) => { const value = v.readInt16LE(0); return map ? map(value) : value }); }
  readInt32BE(map)   { return this.read(4, (v) => { const value = v.readInt32BE(0); return map ? map(value) : value }); }
  readInt32LE(map)   { return this.read(4, (v) => { const value = v.readInt32LE(0); return map ? map(value) : value }); }
  readIntBE(map)     { return this.read(6, (v) => { const value = v.readIntBE(0); return map ? map(value) : value }); }
  readIntLE(map)     { return this.read(6, (v) => { const value = v.readIntLE(0); return map ? map(value) : value }); }
  readUInt8(map)     { return this.read(1, (v) => { const value = v.readUInt8(0); return map ? map(value) : value }); }
  readUInt16BE(map)  { return this.read(2, (v) => { const value = v.readUInt16BE(0); return map ? map(value) : value }); }
  readUInt16LE(map)  { return this.read(2, (v) => { const value = v.readUInt16LE(0); return map ? map(value) : value }); }
  readUInt32BE(map)  { return this.read(4, (v) => { const value = v.readUInt32BE(0); return map ? map(value) : value }); }
  readUInt32LE(map)  { return this.read(4, (v) => { const value = v.readUInt32LE(0); return map ? map(value) : value }); }
  readUIntBE(l, map) { return this.read(l, (v) => { const value = v.readUIntBE(0, l); return map ? map(value) : value }); }
  readUIntLE(l, map) { return this.read(l, (v) => { const value = v.readUIntLE(0, l); return map ? map(value) : value }); }

  readBoolean(map) {
    return this.readInt8((i) => i == 1);
  }
  readBuffer(map) {
    return this.readUInt32LE((length) => {
      return this.read(length, map)
    });
  }
  readString(map) {
    return this.readBuffer((buffer) => { const value = buffer.toString(); return map ? map(value) : value });
  }
  readJson(map) {
    return this.readString((string) => { const value = JSON.parse(string); return map ? map(value) : value });
  }
}

SerialStreamReader.prototype.readDouble = SerialStreamReader.prototype.readDoubleLE
SerialStreamReader.prototype.readFloat = SerialStreamReader.prototype.readFloatLE
SerialStreamReader.prototype.readInt16 = SerialStreamReader.prototype.readInt16LE
SerialStreamReader.prototype.readInt32 = SerialStreamReader.prototype.readInt32LE
SerialStreamReader.prototype.readInt = SerialStreamReader.prototype.readIntLE
SerialStreamReader.prototype.readUInt16 = SerialStreamReader.prototype.readUInt16LE
SerialStreamReader.prototype.readUInt32 = SerialStreamReader.prototype.readUInt32LE
SerialStreamReader.prototype.readUInt = SerialStreamReader.prototype.readUIntLE

module.exports = SerialStreamReader;
