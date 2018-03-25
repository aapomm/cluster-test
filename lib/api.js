const express   = require('express')
const http      = express()
http.use(express.json())

const Blocks = require('./blocks')

class API {
  constructor (node, announcer, locker) {
    this.node       = node
    this.announcer  = announcer
    this.locker     = locker
  }

  listen() {
    this._setEndpoints()
    http.listen(12356, () => console.log('API is listening on port 12356.'))
  }

  _setEndpoints() {
    http.get('/transactions', (req, res) => {
      let count = req.query.count
      let transactions = Blocks.getTransactions(count)
      res.send(transactions)
    })

    http.post('/transactions', (req, res) => {
      console.log('receive add')
      let transaction = [req.body.from, req.body.to, req.body.value]

      if (!this._validateTransaction(transaction)){
        res.send('Invalid transaction!')
        return false
      }

      if (transaction.filter(n => n).length != 3) {
        res.send('Parameters error!')
      }
      else {
        if (!this.locker.isLocked()) {
          this.announcer.announceNewTransaction(transaction)
          this.locker.lock()

          res.sendStatus(200)
        }
        else {
          res.sendStatus('Transaction ongoing!')
        }
      }
    })

    http.post('/wallet', (req, res) => {
      let walletHash = this.announcer.announceNewWallet()

      res.send(walletHash)
    })
  }

  _validateTransaction(transaction){
    let from    = transaction[0]
    let to      = transaction[1]
    let value   = transaction[2]

    let fromTotal = Blocks.getAccountValue(from)

    if (fromTotal < value) { return false }
    if (value > 5 || value < 0) { return false }

    return true
  }
}

module.exports = API
