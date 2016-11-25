const assert = require('chai').assert;
const memoryStreams = require('memory-streams');
const SerialStreamReader = require('../serial-stream-reader');
const SerialStreamWriter = require('../serial-stream-writer');
const stream = require('stream');

describe('read/write', () => {
  function env() {
    var ret = {};
    const queue = [];
    const s = new stream.Duplex({
      read: function(size) {
      },
      write: function(chunk, encoding, callback) {
        this.push(chunk);
        callback();
      }
    })
    ret.reader = new SerialStreamReader(s);
    ret.writer = new SerialStreamWriter(s);
    return ret;
  }
  it('should read/write strings', (done) => {
    const e = env();
    e.writer.writeString("Hello World");
    e.reader.readString().then(hw => {
      assert(hw == "Hello World", "Strings did not match");
      done();
    })
  });
  it('should read/write objects with JSON', (done) => {
    const e = env();
    e.writer.writeJson({text: "Hello World"});
    e.reader.readJson().then(hw => {
      assert(hw.text == "Hello World", "Strings did not match");
      done();
    })
  });
})
