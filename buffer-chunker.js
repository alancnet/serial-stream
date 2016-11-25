const Writable = require('stream').Writable;

class BufferChunker extends Writable {
  constructor(options) {
    super(options);
    this._buffers = [];
    this._requests = [];
    this._request = null;
    this._response = null;
    this._responseLength = 0;
    this._buffer = null;
    this._cursor = 0;
    this._priority = 0;
  }
  _write(chunk, encoding, callback) {
    // Save a COPY of the incoming data.
    this._buffers.push(Buffer.from(chunk));
    this._eval();
    callback();
  }
  _writev(chunks, callback) {
    chunks.foreach((chunk) => this._write(chunk.chunk, chunk.encoding));
    callback();
  }
  _status() {
    return `buffer: ${this._buffer && this._buffer.toString('hex')}; ` +
           `buffers: ${this._buffers.map(x => x.toString('hex')).join('  ')}; ` +
           `response: ${this._response && this._response.map(x => x.toString('hex')).join('  ')}; ` +
           `buffers: ${this._buffers.length}; ` +
           `requests: ${this._requests.length}; ` +
           `request: ${this._request && this._request.length}; ` +
           `response: ${this._response && this._response.length}; ` +
           `responseLength: ${this._responseLength}; ` +
           `buffer: ${this._buffer && this._buffer.length}; ` +
           `cursor: ${this._cursor};`
  }
  _eval() {
    if (this._request == null) {
      // Not currently handling a request
      if (this._requests.length) {
        if (this._priority) {
          // Do not pull from the queue while deep in the stack.
          // It is likely that you will pull something out of order
          // because the calling functions haven't had a chance to
          // queue up their requests.
          return;
        }
        // There is a request to be handled
        const next = this._requests.reduce(
          (a, b) => (b.priority > a.priority) ? b : a
        );
        const index = this._requests.indexOf(next);
        this._requests.splice(index, 1);
        this._request = next;
        this._response = [];
        this._responseLength = 0;
        // Continue
        return this._eval();
      }
    } else {
      // We are currently handling a request
      if (this._responseLength === this._request.length) {
        // The request is complete.
        this._priority++;
        var result;
        if (this._response.length === 1) {
          // There is only one buffer in the response, so we can return it.
          result = this._response[0];
        } else {
          // There are more than one buffer in the response, so we must concat.
          result = Buffer.concat(
            this._response,
            this._responseLength
          );
        }
        // Regardless, the request is done. Delete and continue.
        const request = this._request;
        this._request = null;
        this._responseLength = 0;
        this._response = null;

        // Return the result
        if (request.map) {
          // Callback supplied. Map value using callback.
          const newResult = request.map(result);
          request.accept(newResult);
        } else {
          // No callback given. Resolve promise with original value.
          request.accept(result);
        }

        this._priority--;
        this._eval();
      } else {
        // The request is incomplete. We need data.
        if (this._buffer == null) {
          // No current buffer, pull one
          if (this._buffers.length) {
            // We have a buffer, pull it and continue
            this._buffer = this._buffers.shift();
            this._cursor = 0;
            this._eval();
          } else {
            // We don't have a buffer. We have to wait for one.
          }
        } else {
          // We have a buffer.. Lets see what we need to pull out of it
          const remainingBuffer = this._buffer.length - this._cursor;
          const remainingToRead = this._request.length - this._responseLength;
          const toRead = Math.min(remainingBuffer, remainingToRead);
          const slice = this._buffer.slice(this._cursor, this._cursor + toRead);
          this._cursor += toRead;
          this._response.push(slice);
          this._responseLength += toRead;
          if (this._cursor == this._buffer.length) {
            // Buffer depleted. Delete.
            this._buffer = null;
          }
          this._eval();
        }
      }
    }
  }
  read(length, map, name) {
    return new Promise((accept, reject) => {
      this._requests.push({length, accept, reject, map, priority: this._priority, name});
      this._eval();
    });
  }
}

module.exports = BufferChunker;
