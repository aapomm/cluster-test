const fs      = require('fs')
const stream  = require('stream')
const spawn   = require('child_process')

const bc_file = './bee-bee'

class BC {
  static getTransactions(lastNTransactions) {
    let count = lastNTransactions || 100
    let buffer = spawn.execSync(`tail -r -n ${count} ${bc_file}`)

    return this._stringToTransactions(buffer.toString())
  }

  static addTransactions(record) {
    recordStr = record.join(', ') + "\n"
    let sStream = new stream.Readable

    sStream.push(recordStr)
    sStream.push(null)

    sStream.pipe(fs.createWriteStream(bc_file, {flags: 'a'}))

    return true
  }

  static _stringToTransactions(string) {
    let records = string.trim().split("\n")

    return records.map((record) => {
      return record.split(', ')
    })
  }
}

module.exports = BC
