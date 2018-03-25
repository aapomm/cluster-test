const pow    = require('proof-of-work')
const crypto = require('crypto')

const Blocks = require('./blocks')

class Validator {
  constructor (announcer) {
    this.announcer = announcer
  }

  validate (ctx) {
    let readFn = function (read) {
      let _this     = this
      let prefix    = this._findPrefix(this.announcer.currentTransaction)
      let verifier  = new pow.Verifier({
        size: 1024,
        n: 16,
        complexity: this.announcer.complexity,
        prefix: Buffer.from(prefix, 'hex'),
        validity: 300000
      })

      let nonce = null
      let step  = 0
      let valid = false
      let ts    = null

      read(null, function next(end, data) {
        if(end === true) return
        if(end) throw end

        if (step == 0){
          ts = data.toString()
        }
        else if (step == 1) {
          nonce = data
          valid = verifier.check(data)
        }
        else if (step == 2){
          console.log(data)
          console.log('valid: ' + valid)
          if (valid) { _this._onValidPow(nonce, ts, data) }
        }
        else {
          return
        }

        step++
        read(null, next)
      })
    }

    return readFn.bind(ctx)
  }

  _findPrefix (currentTransaction){
    let data = currentTransaction
    let prevHash = Blocks.getTransactions(1).hash
    let hash = crypto.createHash('sha256')

    hash.update(prevHash + data.join(''))
    return hash.digest('hex')
  }

  _onValidPow (nonce, ts, hashWinner) {
    let hash = crypto.createHash('sha256')
    hash.update(nonce)

    this.announcer.announceUpdateBlock(hash.digest('hex'), ts, hashWinner)
  }
}

module.exports = Validator
