<template>
  <div class="MatcLight VoiceRecorderTest">
    <h1>VoiceRecorder Test</h1>

    <div v-if="!supported" class="VoiceRecorderError">
      Web Speech API is not supported in this browser. Try Chrome or Edge.
    </div>

    <div v-if="supported" class="VoiceRecorderPanel">
      <div class="VoiceRecorderControls">
        <div class="VoiceRecorderRow">
          <label>Language:</label>
          <select v-model="selectedLanguage" @change="onLanguageChange">
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">{{ lang.label }}</option>
          </select>
        </div>

        <div class="VoiceRecorderRow">
          <label>Continuous:</label>
          <input type="checkbox" v-model="continuous" @change="onContinuousChange" />
        </div>

        <div class="VoiceRecorderRow">
          <label>Interim Results:</label>
          <input type="checkbox" v-model="interimResults" @change="onInterimChange" />
        </div>

        <div class="VoiceRecorderRow">
          <span
            class="MatcButton"
            :class="{ VoiceRecorderActive: isRecording }"
            @click="toggleRecording"
          >
            {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
          </span>
          <span class="MatcButton" @click="clearTranscripts">Clear</span>
        </div>

        <div class="VoiceRecorderStatus">
          Status: <strong>{{ statusLabel }}</strong>
        </div>

        <div v-if="errorMessage" class="VoiceRecorderErrorMsg">
          Error: {{ errorMessage }}
        </div>
      </div>

      <div class="VoiceRecorderTranscripts">
        <h3>Transcripts</h3>
        <div v-if="transcripts.length === 0" class="VoiceRecorderEmpty">
          No transcripts yet. Start recording and speak.
        </div>
        <div
          v-for="(entry, i) in transcripts"
          :key="i"
          class="VoiceRecorderEntry"
          :class="{ VoiceRecorderFinal: entry.isFinal, VoiceRecorderInterim: !entry.isFinal }"
        >
          <span class="VoiceRecorderBadge">{{ entry.isFinal ? 'Final' : 'Interim' }}</span>
          <span class="VoiceRecorderText">{{ entry.transcript }}</span>
          <span class="VoiceRecorderConfidence" v-if="entry.isFinal && entry.confidence">
            {{ Math.round(entry.confidence * 100) }}%
          </span>
        </div>
      </div>

      <div class="VoiceRecorderFinalText">
        <h3>Final Text</h3>
        <textarea readonly :value="finalText" rows="6"></textarea>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../style/matc.scss";
</style>

<style>
  .VoiceRecorderTest {
    padding: 20px;
    font-family: sans-serif;
  }

  .VoiceRecorderPanel {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .VoiceRecorderControls {
    background: #f2f2f2;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    padding: 16px;
    min-width: 280px;
    border-radius: 4px;
  }

  .VoiceRecorderRow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .VoiceRecorderRow label {
    min-width: 110px;
    font-size: 14px;
  }

  .VoiceRecorderRow select {
    font-size: 14px;
    padding: 4px 6px;
  }

  .VoiceRecorderStatus {
    margin-top: 8px;
    font-size: 14px;
  }

  .VoiceRecorderActive {
    background: #e74c3c !important;
    color: #fff !important;
  }

  .VoiceRecorderErrorMsg {
    margin-top: 8px;
    color: #c0392b;
    font-size: 13px;
  }

  .VoiceRecorderError {
    color: #c0392b;
    font-size: 15px;
    margin-bottom: 20px;
  }

  .VoiceRecorderTranscripts {
    background: #f2f2f2;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    padding: 16px;
    min-width: 320px;
    max-height: 400px;
    overflow-y: auto;
    border-radius: 4px;
  }

  .VoiceRecorderEntry {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 5px 0;
    border-bottom: 1px solid #e0e0e0;
    font-size: 14px;
  }

  .VoiceRecorderBadge {
    font-size: 11px;
    font-weight: bold;
    padding: 2px 5px;
    border-radius: 3px;
    min-width: 48px;
    text-align: center;
  }

  .VoiceRecorderFinal .VoiceRecorderBadge {
    background: #27ae60;
    color: #fff;
  }

  .VoiceRecorderInterim .VoiceRecorderBadge {
    background: #f39c12;
    color: #fff;
  }

  .VoiceRecorderText {
    flex: 1;
  }

  .VoiceRecorderConfidence {
    font-size: 12px;
    color: #666;
    min-width: 36px;
    text-align: right;
  }

  .VoiceRecorderEmpty {
    color: #999;
    font-size: 14px;
    font-style: italic;
  }

  .VoiceRecorderFinalText {
    background: #f2f2f2;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    padding: 16px;
    min-width: 280px;
    border-radius: 4px;
  }

  .VoiceRecorderFinalText textarea {
    width: 100%;
    font-size: 14px;
    padding: 8px;
    box-sizing: border-box;
    resize: vertical;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 3px;
  }
</style>

<script>
import VoiceRecorderService from 'services/VoiceRecorderService'

export default {
  name: 'VoiceRecorderTest',
  data() {
    return {
      supported: true,
      isRecording: false,
      transcripts: [],
      errorMessage: '',
      selectedLanguage: 'en-US',
      continuous: true,
      interimResults: true,
      languages: [
        { code: 'en-US', label: 'English (US)' },
        { code: 'en-GB', label: 'English (UK)' },
        { code: 'de-DE', label: 'German' },
        { code: 'fr-FR', label: 'French' },
        { code: 'es-ES', label: 'Spanish' },
        { code: 'it-IT', label: 'Italian' },
        { code: 'ja-JP', label: 'Japanese' },
        { code: 'zh-CN', label: 'Chinese (Simplified)' },
      ]
    }
  },
  computed: {
    statusLabel() {
      if (this.isRecording) return 'Recording...'
      return 'Idle'
    },
    finalText() {
      return this.transcripts
        .filter(t => t.isFinal)
        .map(t => t.transcript)
        .join(' ')
    }
  },
  methods: {
    toggleRecording() {
      if (this.isRecording) {
        this.service.stop()
      } else {
        this.errorMessage = ''
        this.service.start()
      }
    },
    clearTranscripts() {
      this.transcripts = []
    },
    onLanguageChange() {
      this.service.setLanguage(this.selectedLanguage)
    },
    onContinuousChange() {
      this.service.setContinuous(this.continuous)
    },
    onInterimChange() {
      this.service.setInterimResults(this.interimResults)
    }
  },
  mounted() {
    this.service = new VoiceRecorderService()

    if (!this.service.isSupported()) {
      this.supported = false
      return
    }

    this.service.init()

    this.service.onStart(() => {
      this.isRecording = true
    })

    this.service.onEnd(() => {
      this.isRecording = false
    })

    this.service.onResult((results) => {
      results.forEach(result => {
        if (result.isFinal) {
          this.transcripts.push(result)
        } else {
          const last = this.transcripts[this.transcripts.length - 1]
          if (last && !last.isFinal) {
            this.transcripts.splice(this.transcripts.length - 1, 1, result)
          } else {
            this.transcripts.push(result)
          }
        }
      })
    })

    this.service.onError((error) => {
      this.errorMessage = error
      this.isRecording = false
    })
  },
  beforeDestroy() {
    if (this.service) {
      this.service.destroy()
    }
  }
}
</script>
