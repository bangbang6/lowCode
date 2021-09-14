<template>
  <div class="app">
    <Editor v-model="configData"></Editor>
  </div>
</template>

<script>
import { provide, ref } from 'vue'

import Editor from './components/Editor.jsx'
import data from './mock'
import { componentConfig } from './utils/componentConfig'
export default {
  name: 'App',
  components: {
    Editor
  },
  setup () {
    const configData = ref(data)
    provide('componentConfig', componentConfig)
    return {
      configData
    }
  }
}
</script>

<style>
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  background-color: #ccc;
  
}
</style>
