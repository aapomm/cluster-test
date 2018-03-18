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
    http.listen(3000, () => console.log('Example app listening on port 3000!'))
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
}

module.exports = API
