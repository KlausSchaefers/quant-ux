self.addEventListener('message', e => {
    console.log('worker got, ', e);


    try {

        const js = e.data.code
        const qux = {
            save () {
                console.debug('qux.save')
            }
        }

        let code = new Function('qux', js);
   
        let result = code(qux)
      
        self.postMessage({"result": result})
    } catch (e) {
        console.error(e)
    }


})