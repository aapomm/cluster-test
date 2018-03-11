const pow    = require('proof-of-work')
const crypto = require('crypto')

const Blocks = require('./block')

class Validator {
  constructor (announcer) {
    this.announcer = announcer
  }

  validate (ctx) {
    let readFn = function (read) {
      let _this = this
      let prefix = this._findPrefix(this.announcer.currentTransaction)
      let verifier = new pow.Verifier({
        size: 1024,
        n: 16,
        complexity: 13,
        prefix: Buffer.from(prefix, 'hex'),
        validity: 300000
      })

      read(null, function next(end, data) {
        if(end === true) return
        if(end) throw end

        console.log('validating')
        let valid = verifier.check(data)
        if (valid) { _this._onValidPow() }
      })
    }

    return readFn.bind(ctx)
  }

  _findPrefix (currentTransaction){
    let data = Blocks.stringToArray(currentTransaction)[0]
    let prevHash = Blocks.getTransactions(1)[0][0]
    let hash = crypto.createHash('sha256')

    hash.update(prevHash + data.join(''))
    return hash.digest('hex')
  }

  _onValidPow () {
    this.announcer.announceUpdateBlock()
  }
}

module.exports = Validator
