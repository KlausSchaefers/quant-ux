import Logger from 'common/Logger'

export default class VoiceRecorderService {

  constructor() {
    this.logger = new Logger('VoiceRecorderService')
    this.recognition = null
    this.isRecording = false
    this.language = 'en-US'
    this.continuous = true
    this.interimResults = true
  }

  isSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  }

  init() {
    this.logger.log(1, 'VoiceRecorderService.init()')
    if (!this.isSupported()) {
      this.logger.error('VoiceRecorderService.init() > Web Speech API not supported')
      return false
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()
    this.recognition.lang = this.language
    this.recognition.continuous = this.continuous
    this.recognition.interimResults = this.interimResults

    this.recognition.onresult = (event) => {
      this.logger.log(5, 'VoiceRecorderService.onresult()', event.results.length)
      if (this.resultCallback) {
        const results = Array.from(event.results).map(result => ({
          transcript: result[0].transcript,
          confidence: result[0].confidence,
          isFinal: result.isFinal
        }))
        this.resultCallback(results)
      }
    }

    this.recognition.onerror = (event) => {
      this.logger.error('VoiceRecorderService.onerror()', event.error)
      this.isRecording = false
      if (this.errorCallback) {
        this.errorCallback(event.error)
      }
    }

    this.recognition.onend = () => {
      this.logger.log(1, 'VoiceRecorderService.onend()')
      this.isRecording = false
      if (this.endCallback) {
        this.endCallback()
      }
    }

    this.recognition.onstart = () => {
      this.logger.log(1, 'VoiceRecorderService.onstart()')
      this.isRecording = true
      if (this.startCallback) {
        this.startCallback()
      }
    }

    return true
  }

  start() {
    this.logger.log(1, 'VoiceRecorderService.start()')
    if (!this.recognition) {
      if (!this.init()) {
        return false
      }
    }
    if (!this.isRecording) {
      this.recognition.start()
    }
    return true
  }

  stop() {
    this.logger.log(1, 'VoiceRecorderService.stop()')
    if (this.recognition && this.isRecording) {
      this.recognition.stop()
    }
  }

  setLanguage(lang) {
    this.language = lang
    if (this.recognition) {
      this.recognition.lang = lang
    }
  }

  setContinuous(value) {
    this.continuous = value
    if (this.recognition) {
      this.recognition.continuous = value
    }
  }

  setInterimResults(value) {
    this.interimResults = value
    if (this.recognition) {
      this.recognition.interimResults = value
    }
  }

  onResult(callback) {
    this.resultCallback = callback
  }

  onError(callback) {
    this.errorCallback = callback
  }

  onStart(callback) {
    this.startCallback = callback
  }

  onEnd(callback) {
    this.endCallback = callback
  }

  destroy() {
    this.logger.log(1, 'VoiceRecorderService.destroy()')
    if (this.recognition) {
      this.recognition.onresult = null
      this.recognition.onerror = null
      this.recognition.onend = null
      this.recognition.onstart = null
      if (this.isRecording) {
        this.recognition.stop()
      }
      this.recognition = null
    }
  }
}
