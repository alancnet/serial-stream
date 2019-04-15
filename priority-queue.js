class PriorityQueue {
  constructor(comparator) {
    if (!(this instanceof PriorityQueue)) return new PriorityQueue(comparator)
    this.array = []
    this.size = 0
    this.compare = comparator || ((a, b) => a < b)
  }

  clone() {
    const pq = new PriorityQueue(this.compare)
    pq.size = this.size
    for (let i = 0; i < this.size; i++) {
      pq.array.push(this.array[i])
    }
    return pq
  }

  add(myval) {
    let i = this.size
    this.array[this.size] = myval
    this.size += 1
    let p
    let ap
    while (i > 0) {
      p = (i - 1) >> 1
      ap = this.array[p]
      if (!this.compare(myval, ap)) {
        break
      }
      this.array[i] = ap
      i = p
    }
    this.array[i] = myval
  }

  heapify(arr) {
    this.array = arr
    this.size = arr.length
    let i
    for (i = this.size >> 1; i >= 0; i--) {
      this._percolateDown(i)
    }
  }

  _percolateUp(i, force) {
    const myval = this.array[i]
    let p
    let ap
    while (i > 0) {
      p = (i - 1) >> 1
      ap = this.array[p]

      if (!force && !this.compare(myval, ap)) {
        break
      }
      this.array[i] = ap
      i = p
    }
    this.array[i] = myval
  }

  _percolateDown(i) {
    const size = this.size
    const hsize = this.size >>> 1
    const ai = this.array[i]
    let l
    let r
    let bestc
    while (i < hsize) {
      l = (i << 1) + 1
      r = l + 1
      bestc = this.array[l]
      if (r < size) {
        if (this.compare(this.array[r], bestc)) {
          l = r
          bestc = this.array[r]
        }
      }
      if (!this.compare(bestc, ai)) {
        break
      }
      this.array[i] = bestc
      i = l
    }
    this.array[i] = ai
  }

  _removeAt(index) {
    if (index > this.size - 1 || index < 0) return undefined
    this._percolateUp(index, true)
    return this.poll()
  }

  remove(myval) {
    for (let i = 0; i < this.size; i++) {
      if (!this.compare(this.array[i], myval) && !this.compare(myval, this.array[i])) {

        this._removeAt(i)
        return true
      }
    }
    return false
  }

  _batchRemove(callback, limit) {

    const retArr = new Array(limit ? limit : this.size)
    const count = 0

    if (typeof callback === 'function' && this.size) {
      let i = 0
      while (i < this.size && count < retArr.length) {
        if (callback(this.array[i])) {
          retArr[count] = this._removeAt(i)
          count++

          i = i >> 1
        } else {
          i++
        }
      } 
    }
    retArr.length = count
    return retArr
  }

  removeOne(callback) {
    const arr = this._batchRemove(callback, 1)
    return arr.length > 0 ? arr[0] : undefined
  }

  removeMany(callback, limit) {
    return this._batchRemove(callback, limit)
  }

  peek() {
    if (this.size == 0) return undefined
    return this.array[0]
  }

  poll() {
    if (this.size == 0) return undefined
    const ans = this.array[0]
    if (this.size > 1) {
      this.array[0] = this.array[--this.size]
      this._percolateDown(0)
    } else {
      this.size -= 1
    }
    return ans
  }

  replaceTop(myval) {
    if (this.size == 0) return undefined
    const ans = this.array[0]
    this.array[0] = myval
    this._percolateDown(0)
    return ans
  }

  trim() {
    this.array = this.array.slice(0, this.size)
  }

  isEmpty() {
    return this.size === 0
  }

  *[Symbol.iterator]() {
    if (this.isEmpty()) return
    const pq = this.clone()
    while (!pq.isEmpty()) {
      yield pq.poll()
    }
  }

  forEach(callback) {
    if (this.isEmpty() || typeof callback != 'function') return
    let i = 0
    const pq = this.clone()
    while (!pq.isEmpty()) {
      callback(pq.poll(), i++)
    }
  }

  kSmallest(k) {
    if (this.size == 0) return []
    const comparator = this.compare
    const arr = this.array
    const pq = new PriorityQueue((a, b) => comparator(arr[a], arr[b]))
    k = Math.min(this.size, k)
    const smallest = new Array(k)
    const j = 0
    pq.add(0)
    while (j < k) {
      const small = pq.poll()
      smallest[j++] = this.array[small]
      const l = (small << 1) + 1
      const r = l + 1
      if (l < this.size) pq.add(l)
      if (r < this.size) pq.add(r)
    }
    return smallest
  }
}

module.exports = PriorityQueue