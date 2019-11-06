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
      <div id="result" aria-live="polite"></div>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      url: "",
      takingScreenshot: false,
      upload: false
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
          return (document.getElementById("result").textContent =
            "Error capturing screenshot");
        }

        const img = document.createElement("img");

        this.upload
          ? (img.src = resultJSON.data.link)
          : (img.src = `data:image/png;base64, ${resultJSON.data}`);
        document.getElementById("result").innerHTML = img.outerHTML;
      } catch (error) {
        console.log(error);
        document.getElementById(
          "result"
        ).textContent = `Error: ${error.toString()}`;
      } finally {
        this.takingScreenshot = false;
      }
    }
  }
};
</script>
