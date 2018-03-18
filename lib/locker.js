class Locker {
  constructor (){
    this.flag = false
  }

  lock () {
    this.flag = true
  }

  unlock () {
    this.flag = false
  }

  isLocked () {
    return this.flag
  }
}

module.exports = Locker
