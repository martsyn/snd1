const duration = 16
const harmonicCount = 4

// 110 220 440 880 1760
const startFrequency = 110
const endFrequency = 1760

export default class HarmonicSynth {
  private ctx: AudioContext
  public readonly merger: ChannelMergerNode
  private oscillators: OscillatorNode[] = []
  private gainNodes: GainNode[] = []
  private isPlaying = false
  private timer: number | undefined

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    this.merger = ctx.createChannelMerger()
    this.merger.connect(ctx.destination)
  }

  start(): void {
    if (this.isPlaying) return
    this.isPlaying = true

    let idx = 0
    this.timer = window.setInterval(
      () => {
        this.scheduleOsc(idx)
        ++idx
        if (idx >= harmonicCount) idx = 0
      },
      (duration * 1000) / harmonicCount,
    )
  }

  stop(): void {
    if (!this.isPlaying) return
    this.isPlaying = false

    this.oscillators.forEach((osc) => osc.stop())
    this.oscillators = []
    this.gainNodes = []
    window.clearInterval(this.timer)
    this.timer = undefined
  }

  private scheduleOsc(idx: number) {
    const now = this.ctx.currentTime

    console.log(`${now}: starting osc ${idx}`)

    let osc: OscillatorNode
    let gain: GainNode
    if (idx >= this.oscillators.length) {
      osc = this.ctx.createOscillator()
      gain = this.ctx.createGain()
      osc.connect(gain)
      gain.connect(this.merger)
      osc.type = 'triangle'
      osc.start()
      this.oscillators.push(osc)
      this.gainNodes.push(gain)
    } else {
      osc = this.oscillators[idx]
      gain = this.gainNodes[idx]
      osc.frequency.cancelScheduledValues(now)
      gain.gain.cancelScheduledValues(now)
    }

    osc.frequency.setValueAtTime(startFrequency, now)
    osc.frequency.exponentialRampToValueAtTime(endFrequency, now + duration)

    gain.gain.setValueAtTime(0, now)
    //    gain.gain.linearRampToValueAtTime(0.5, now + duration * 0.25)
    gain.gain.linearRampToValueAtTime(0.5, now + duration * 0.7)
    gain.gain.linearRampToValueAtTime(0.5, now + duration * 0.9)
    gain.gain.linearRampToValueAtTime(0, now + duration)
  }
}
