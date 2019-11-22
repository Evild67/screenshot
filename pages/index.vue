<template>
  <v-layout column justify-center align-center>
    <v-flex xs12>
      <h1>Take a Screenshot</h1>
      <v-text-field v-model="url" label="URL" type="url" required></v-text-field>
      <v-checkbox v-model="upload" :label="`Upload`"></v-checkbox>
      <v-btn
        v-if="!takingScreenshot"
        @click="screenshot"
        color="primary"
        :disabled="!url"
      >Screenshot!</v-btn>
      <v-progress-linear v-else indeterminate color="cyan"></v-progress-linear>
      <v-img v-if="imagesrc" :src="imagesrc"></v-img>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      url: "",
      takingScreenshot: false,
      upload: false,
      imagesrc: null
    };
  },
  methods: {
    async screenshot() {
      this.takingScreenshot = true;
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          pageToScreenshot: this.url,
          upload: this.upload
        })
      };

      document.getElementById("result").textContent = "Please wait...";
      try {
        const result = await fetch("/.netlify/functions/screenshot", options);
        const resultJSON = await result.json();

        if (!resultJSON.data && !resultJSON.data.link) {
          throw new Error("Error capturing screenshot");
        }

        this.upload
          ? (this.imagesrc = resultJSON.data.link)
          : (this.imagesrc = `data:image/png;base64, ${resultJSON.data}`);
      } catch (error) {
        console.log(error);
      } finally {
        this.takingScreenshot = false;
      }
    }
  }
};
</script>
