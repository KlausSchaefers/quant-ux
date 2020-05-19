class FigmaService {

  get (url) {
    console.debug('get', url)
    fetch(url).then(resp => {
      resp.json().then(json => {
        console.debug(json)
      })
    })
  }

}

export default new FigmaService()