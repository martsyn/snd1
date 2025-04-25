<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    audioContext: AudioContext
    sourceNode: AudioNode
    maxFrequency?: number
    barCount?: number
    barGap?: number
    barMinHeight?: number
    barColors?: string[]
    backgroundColor?: string
    refreshRate?: number
    minFrequency?: number
    smoothingFactor?: number
  }>(),
  {
    maxFrequency: 3520,
    minFrequency: 20,
    barCount: 128,
    barGap: 1,
    barMinHeight: 3,
    barColors: () => [
      '#f72585',
      '#b5179e',
      '#7209b7',
      '#560bad',
      '#480ca8',
      '#3a0ca3',
      '#3f37c9',
      '#4361ee',
      '#4895ef',
      '#4cc9f0',
    ],
    backgroundColor: '#000',
    refreshRate: 60,
    smoothingFactor: 0.8,
  },
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const analyserNode = ref<AnalyserNode | null>(null)
const animationId = ref<number>(0)
const dataArray = ref<Uint8Array | null>(null)

const setupAnalyser = () => {
  analyserNode.value = props.audioContext.createAnalyser()
  analyserNode.value.fftSize = 2048 // Higher resolution for smoother visualization
  analyserNode.value.maxDecibels = -10
  analyserNode.value.minDecibels = -90
  analyserNode.value.smoothingTimeConstant = props.smoothingFactor

  props.sourceNode.connect(analyserNode.value)
  dataArray.value = new Uint8Array(analyserNode.value.frequencyBinCount)
}

const draw = () => {
  if (!canvasRef.value || !analyserNode.value || !dataArray.value) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const { width, height } = canvasRef.value

  analyserNode.value.getByteFrequencyData(dataArray.value)

  ctx.fillStyle = props.backgroundColor
  ctx.fillRect(0, 0, width, height)

  const barCount = props.barCount
  const barWidth = width / barCount - props.barGap

  // Use logarithmic scaling for frequencies
  const nyquist = props.audioContext.sampleRate / 2
  const minFreq = props.minFrequency
  const maxFreq = Math.min(props.maxFrequency, nyquist)

  for (let i = 0; i < barCount; i++) {
    // Calculate exponential frequency for this bar
    const expPercent = i / barCount
    const freq = minFreq * Math.pow(maxFreq / minFreq, expPercent)
    const freqIndex = Math.round((freq * dataArray.value.length) / nyquist)

    if (freqIndex >= dataArray.value.length) continue

    // Get weighted average of a few bins around the target frequency
    let sum = 0
    let count = 0
    const range = 2 // Number of bins to average on each side

    for (
      let j = Math.max(0, freqIndex - range);
      j <= Math.min(dataArray.value.length - 1, freqIndex + range);
      j++
    ) {
      // Weight by distance from center frequency
      const weight = 1 - Math.abs(j - freqIndex) / (range + 1)
      sum += dataArray.value[j] * weight
      count += weight
    }

    const value = sum / (count || 1)
    const percent = value / 255
    const barHeight = Math.max(height * percent, props.barMinHeight)

    const colorIndex = Math.floor(percent * props.barColors.length)
    ctx.fillStyle = props.barColors[Math.min(colorIndex, props.barColors.length - 1)]

    const x = i * (barWidth + props.barGap)
    const y = height - barHeight

    ctx.fillRect(x, y, barWidth, barHeight)
  }

  animationId.value = requestAnimationFrame(draw)
}

const resizeCanvas = () => {
  if (!canvasRef.value) return
  const container = canvasRef.value.parentElement
  if (!container) return

  canvasRef.value.width = container.clientWidth
  canvasRef.value.height = container.clientHeight
}

watch(
  () => props.sourceNode,
  () => {
    if (analyserNode.value) {
      props.sourceNode.connect(analyserNode.value)
    }
  },
  { immediate: false },
)

onMounted(() => {
  setupAnalyser()
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  draw()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
  cancelAnimationFrame(animationId.value)
  if (analyserNode.value) {
    analyserNode.value.disconnect()
  }
})
</script>

<template>
  <div class="audio-visualizer">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.audio-visualizer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
