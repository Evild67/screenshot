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
        :disabled="!validURL(url)"
      >Screenshot!</v-btn>
      <v-progress-linear v-else indeterminate color="cyan"></v-progress-linear>
      <v-container>
        <v-layout>
          <v-img v-if="imagesrc" :src="imagesrc"></v-img>
        </v-layout>
      </v-container>
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
    validURL(myURL) {
      var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + //port
        "(\\?[;&amp;a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      );
      return pattern.test(myURL);
    },

    async screenshot() {
      this.imagesrc = null;
      this.takingScreenshot = true;
      let url = this.url;
      if (!url.match(/^[a-zA-Z]+:\/\//)) {
        url = "http://" + url;
      }
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          pageToScreenshot: url,
          upload: this.upload
        })
      };

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
