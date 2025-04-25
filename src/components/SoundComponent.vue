<script setup lang="ts">
function onPlayClicked(){
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  const initialVolume = 0.2
  const duration = 5

  const baseFrequency = 200

  const ratios =

  // Set initial values
  oscillator.frequency.setValueAtTime(200, ctx.currentTime);
  gainNode.gain.setValueAtTime(initialVolume, ctx.currentTime);

  // Schedule parameter changes
  oscillator.frequency.linearRampToValueAtTime(2000, ctx.currentTime + duration);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Start the oscillator
  oscillator.start();

  // Auto-stop after duration (plus a small buffer)
  const stopTime = ctx.currentTime + duration + 0.05;
  oscillator.stop(stopTime);

  // Return function to stop prematurely if needed
  return () => {
    oscillator.stop();
    oscillator.disconnect();
    gainNode.disconnect();
  };}
</script>

<template>
<button @click="onPlayClicked">Play</button>
</template>

<style scoped>

</style>
