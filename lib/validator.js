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
        complexity: 13,
        prefix: Buffer.from(prefix, 'hex'),
        validity: 300000
      })

      let step  = 0
      let valid = false

      read(null, function next(end, data) {
        if(end === true) return
        if(end) throw end

        if (step == 0){
          console.log('validating')
          valid = verifier.check(data)
        }
        else if (step == 1){
          console.log('step 2')
          console.log(data)
          if (valid) { _this._onValidPow(data) }
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
    let data = Blocks.stringToArray(currentTransaction)[0]
    let prevHash = Blocks.getTransactions(1).hash
    let hash = crypto.createHash('sha256')

    hash.update(prevHash + data.join(''))
    return hash.digest('hex')
  }

  _onValidPow (hashWinner) {
    this.announcer.announceUpdateBlock(hashWinner)
  }
}

module.exports = Validator
