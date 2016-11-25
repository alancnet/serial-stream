class SerialStreamWriter {
  constructor(stream) {
    this.stream = stream;
  }
  write(buffer) {
    this.stream.write(buffer);
  }
  writeDoubleBE(v) { const s = Buffer.alloc(8); s.writeDoubleBE(v, 0); return this.write(s); }
  writeDoubleLE(v) { const s = Buffer.alloc(8); s.writeDoubleLE(v, 0); return this.write(s); }
  writeFloatBE(v)  { const s = Buffer.alloc(4); s.writeFloatBE(v, 0); return this.write(s); }
  writeFloatLE(v)  { const s = Buffer.alloc(4); s.writeFloatLE(v, 0); return this.write(s); }
  writeInt8(v)     { const s = Buffer.alloc(1); s.writeInt8(v, 0); return this.write(s); }
  writeInt16BE(v)  { const s = Buffer.alloc(2); s.writeInt16BE(v, 0); return this.write(s); }
  writeInt16LE(v)  { const s = Buffer.alloc(2); s.writeInt16LE(v, 0); return this.write(s); }
  writeInt32BE(v)  { const s = Buffer.alloc(4); s.writeInt32BE(v, 0); return this.write(s); }
  writeInt32LE(v)  { const s = Buffer.alloc(4); s.writeInt32LE(v, 0); return this.write(s); }
  writeIntBE(v)    { const s = Buffer.alloc(6); s.writeIntBE(v, 0); return this.write(s); }
  writeIntLE(v)    { const s = Buffer.alloc(6); s.writeIntLE(v, 0); return this.write(s); }
  writeUInt8(v)    { const s = Buffer.alloc(1); s.writeUInt8(v, 0); return this.write(s); }
  writeUInt16BE(v) { const s = Buffer.alloc(2); s.writeUInt16BE(v, 0); return this.write(s); }
  writeUInt16LE(v) { const s = Buffer.alloc(2); s.writeUInt16LE(v, 0); return this.write(s); }
  writeUInt32BE(v) { const s = Buffer.alloc(4); s.writeUInt32BE(v, 0); return this.write(s); }
  writeUInt32LE(v) { const s = Buffer.alloc(4); s.writeUInt32LE(v, 0); return this.write(s); }
  writeUIntBE(v, l)   { const s = Buffer.alloc(l); s.writeUIntBE(v, 0, l); return this.write(s); }
  writeUIntLE(v, l)   { const s = Buffer.alloc(l); s.writeUIntLE(v, 0, l); return this.write(s); }

  writeBoolean(bool) {
    if (typeof bool === 'boolean') {
      this.writeInt8(bool ? 1 : 0);
    }
  }
  writeBuffer(buffer) {
    if (buffer instanceof Buffer) {
      this.writeUInt32LE(buffer.length);
      this.write(buffer);
    }
  }
  writeString(string) {
    if (typeof string === 'string') {
      const stringBuffer = Buffer.from(string);
      this.writeBuffer(stringBuffer);
    } else {
      throw new Error(`writeString called with ${typeof string}`);
    }
  }
  writeJson(obj) {
    this.writeString(JSON.stringify(obj));
  }
}

module.exports = SerialStreamWriter;
