import Logger from '../../common/Logger'
export default class ModelDB {

  constructor () {
    this.logger =  new Logger('ModelDB')
    this._getDB()
  }


  _getDB() {
    return new Promise((resolve) => {
      if (window && window.indexedDB) {
        if (!this.db) {
          const request = window.indexedDB.open("quxModelDB", 2);
          request.onerror = (event) => {
            this.logger.error('_getDB', 'Could not open DB', event)
          };

          request.onsuccess = (event) => {
            this.logger.log(3, '_getDB', 'Open', event)
            this.db = request.result;
            resolve(this.db)
          };

          request.onupgradeneeded = (event) => {
            this.logger.log(3, '_getDB', 'update', event)
            let db = event.target.result;
            db.createObjectStore("quxModels", {keyPath: "id"});
            db.createObjectStore("quxCommandStacks", {keyPath: "id"});
          }
        } else {
          resolve(this.db)
        }
      } else {
        resolve(null)
      }
    })
  }


  async save (model) {
    this.logger.log(1, 'save', 'enter')
    try {
      let db = await this._getDB()
      if (db) {
        const request = db.transaction(["quxModels"], "readwrite")
        .objectStore("quxModels")
        .put(model);

        request.onsuccess = (event) => {
          this.logger.log(3, 'save', 'success', event)
        };

        request.onerror = (event) =>{
          this.logger.error('save', 'ERROR', event)
        }
      }
    } catch (err){
      this.logger.error('save', 'ERROR', err)
    }
  }

  get (id) {
    this.logger.log(1, 'get', 'enter', id)
    return new Promise(async (resolve) => {
      try {
        let db = await this._getDB()
        if (db) {
          var transaction = this.db.transaction(["quxModels"]);
          var objectStore = transaction.objectStore("quxModels");
          var request = objectStore.get(id);

          request.onerror = event =>{
            this.logger.log(-1, 'get', 'error', event)
            resolve(null)
          };

          request.onsuccess = event => {
            this.logger.log(3, 'get', 'success', event)
            resolve(request.result)
          };
        } else {
          resolve(null)
        }
      } catch (err){
        this.logger.error('save', 'ERROR', err)
        resolve(null)
      }
    })

  }
}