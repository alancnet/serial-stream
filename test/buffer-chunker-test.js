const _assert = require('chai').assert;
const BufferChunker = require('../buffer-chunker');

function assert(condition, text) {
  if (!condition) console.log(text);
  _assert(condition, text);
}

describe("BufferChunker", () => {
  const testBuffer = // FEED DEAD BEEF COFFEE
    Buffer.from([0xFE, 0xED, 0xDE, 0xAD, 0xBE, 0xEF, 0xC0, 0xFF, 0xEE]);

  it("should respond to requests after data exists", function(done) {
    const bc = new BufferChunker();
    bc.write(testBuffer);
    bc.read(testBuffer.length).then((result) => {
      assert(Buffer.compare(testBuffer, result) == 0, "Result buffer does not match.");
      done();
    })
  });
  it("should respond to requests before data exists", function(done) {
    const bc = new BufferChunker();
    bc.read(testBuffer.length).then((result) => {
      assert(Buffer.compare(testBuffer, result) == 0, "Result buffer does not match.");
      done();
    })
    bc.write(testBuffer);
  });
  it("should respond to requests when data is chunked beforehand", function(done) {
    const bc = new BufferChunker();
    bc.write(testBuffer.slice(0, 4));
    bc.write(testBuffer.slice(4));
    bc.read(testBuffer.length).then((result) => {
      assert(Buffer.compare(testBuffer, result) == 0, `Result buffer does not match: ${testBuffer.toString('hex')} != ${result.toString('hex')}`);
      done();
    })
  });
  it("should respond to requests when data is chunked afterward", function(done) {
    const bc = new BufferChunker();
    bc.read(testBuffer.length).then((result) => {
      assert(Buffer.compare(testBuffer, result) == 0, `Result buffer does not match: ${testBuffer.toString('hex')} != ${result.toString('hex')}`);
      done();
    })
    bc.write(testBuffer.slice(0, 4));
    bc.write(testBuffer.slice(4));
  });
  it("should respond to requests when data is chunked simultaneously", function(done) {
    const bc = new BufferChunker();
    bc.write(testBuffer.slice(0, 4));
    bc.read(testBuffer.length).then((result) => {
      assert(Buffer.compare(testBuffer, result) == 0, `Result buffer does not match: ${testBuffer.toString('hex')} != ${result.toString('hex')}`);
      done();
    })
    bc.write(testBuffer.slice(4));
  });
  it("should respond to multiple requests", function(done) {
    const bc = new BufferChunker();
    bc.write(testBuffer.slice(0, 4));
    bc.write(testBuffer.slice(4));
    var result1;
    var result2;
    bc.read(3).then((result) => {
      result1 = result;
    });
    bc.read(3).then((result) => {
      result2 = result;
    });
    bc.read(3).then((result3) => {
      assert(Buffer.compare(testBuffer.slice(0, 3), result1) == 0, `Result buffer does not match. ${testBuffer.slice(0, 3).toString('hex')} != ${result1.toString('hex')}`);
      assert(Buffer.compare(testBuffer.slice(3, 6), result2) == 0, `Result buffer does not match. ${testBuffer.slice(3, 6).toString('hex')} != ${result2.toString('hex')}`);
      assert(Buffer.compare(testBuffer.slice(6, 9), result3) == 0, `Result buffer does not match. ${testBuffer.slice(6, 9).toString('hex')} != ${result3.toString('hex')}`);
      done();
    });

  });
  it("should respond to multiple requests afterwards", function(done) {
    const bc = new BufferChunker();
    var result1;
    var result2;
    bc.read(3).then((result) => {
      result1 = result;
    });
    bc.read(3).then((result) => {
      result2 = result;
    });
    bc.read(3).then((result3) => {
      assert(Buffer.compare(testBuffer.slice(0, 3), result1) == 0, `Result buffer does not match. ${testBuffer.slice(0, 3).toString('hex')} != ${result1.toString('hex')}`);
      assert(Buffer.compare(testBuffer.slice(3, 6), result2) == 0, `Result buffer does not match. ${testBuffer.slice(3, 6).toString('hex')} != ${result2.toString('hex')}`);
      assert(Buffer.compare(testBuffer.slice(6, 9), result3) == 0, `Result buffer does not match. ${testBuffer.slice(6, 9).toString('hex')} != ${result3.toString('hex')}`);
      done();
    });
    bc.write(testBuffer.slice(0, 4));
    bc.write(testBuffer.slice(4));
  });
  it("should prioritize reads from callbacks over pre-queued reads", function(done) {
    const bc = new BufferChunker();
    const result = [];
    bc.read(1, (a) => {
      result.push(a);
      bc.read(1, (b) => {
        result.push(b);
        bc.read(1, (c) => {
          result.push(c);
        })
      })
      bc.read(1, (d) => {
        result.push(d);
      })
    });
    bc.read(1).then((e) => {
      result.push(e);
      assert(Buffer.compare(Buffer.concat(result), testBuffer.slice(0, 5)) == 0, `Result buffer does not match.`);
      done();
    } );
    bc.write(testBuffer);
  })
})
