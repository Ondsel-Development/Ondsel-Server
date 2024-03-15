<template>
  <div class="markdown"><div v-html="markdownHtml"></div></div>
</template>

<script>

export default {
  props: {
    markdownHtml: {
      type: String,
      required: true
    }
  },
  data() {
    return {
    };
  },
  computed: {
  },
  methods: {
  }
};
</script>

<style>
.markdown p {
  line-height: 1.5em;
  margin-bottom: 1em;
}
.markdown ul, ol {
  padding-left: 2em;
}
.markdown h1 { margin: .67em 0 }
.markdown h2 { margin: .75em 0 }
.markdown h3 { margin: .83em 0 }
.markdown h4 { margin: 1.12em 0 }
.markdown h5 { margin: 1.5em 0 }
.markdown h6 { margin: 1.67em 0 }
</style>
