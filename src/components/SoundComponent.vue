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
  <div v-if="!playing">
    <p>Turn on your sound and press Play</p>
    <button @click="onPlayClicked">Play</button>
  </div>
  <div v-else>
    <p>Here we go. It starts slow...</p>
    <button @click="onStopClicked">Stop</button>
  </div>
  <div v-if="playing && !done">
    <p>Press Done when you hear the pitch stops growing</p>
    <button @click="done = true">Done</button>
  </div>
  <div v-else-if="playing && done">
    <p>You fail</p>
    <FrequencyVisualizer :audio-context="ctx" :source-node="harmonicPlayer.merger" />
  </div>
</template>

<style scoped></style>
