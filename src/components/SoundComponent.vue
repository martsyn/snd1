<script setup lang="ts">
import HarmonicSynth from '@/sound/HarmonicSynth.ts'
import { ref } from 'vue'
import FrequencyVisualizer from '@/components/FrequencyVisualizer.vue'

const playing = ref(false)
const done = ref(false)
const ctx = new AudioContext()
const harmonicPlayer = new HarmonicSynth(ctx)

function onPlayClicked() {
  playing.value = true
  harmonicPlayer.start()
}

function onStopClicked() {
  harmonicPlayer.stop()
  playing.value = false
  done.value = false
}
</script>

<template>
  <button v-if="!playing" @click="onPlayClicked">Play</button>
  <button v-else @click="onStopClicked">Stop</button>
  <div v-if="playing && !done">
    Press the Done button when you the pitch stops growing
    <button @click="done = true">Done</button>
  </div>
  <div v-else-if="playing && done">
    You fail
    <FrequencyVisualizer :audio-context="ctx" :source-node="harmonicPlayer.merger" />
  </div>
</template>

<style scoped></style>
