<template>
  <v-sheet name="view-port">
    <v-sheet
      v-if="viewChosen === viewEnum.thumbnail"
      height="30em"
      width="100%"
      class="d-flex justify-space-between"
    >
      <v-sheet></v-sheet>
      <v-img
        v-if="properUrl"
        :src="properUrl"
        cover
      ></v-img>
      <v-sheet
        v-else
        class="ma-16"
      >
        Image Not Generated Yet
      </v-sheet>
      <v-sheet
        width="6em"
      >
        <v-icon
          size="small"
        >
          mdi-eye-outline
        </v-icon>
        ..{{(versionId || "").substr(-6)}}
      </v-sheet>
    </v-sheet>
    <v-sheet
      v-if="viewChosen === viewEnum.default"
      color="#F4F4F4"
      height="30em"
      width="100%"
      class="d-flex justify-center align-center"
    >
      <v-icon icon="mdi-file" style="color: #8D8D8D" cover />
    </v-sheet>
    <v-sheet
      v-if="viewChosen === viewEnum.markdown"
      color="#F4F4F4"
      height="30em"
      width="100%"
      class="pa-4"
    >
      <v-sheet height="28em" style="overflow-y: scroll;">
        <markdown-viewer :markdown-html="htmlContent"></markdown-viewer>
      </v-sheet>
    </v-sheet>
  </v-sheet>
</template>

<script>
import {mapActions, mapState} from "vuex";
import {marked} from "marked";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import {models} from "@feathersjs/vuex";

const { Upload } = models.api;

export default {
  name: 'FileViewPort',
  components: {MarkdownViewer},
  props: {
    file: {
      type: Object,
      default: null,
    },
    versionId: {
      type: String,
      default: null,
    }
  },
  data: () => ({
    viewEnum: {
      default: 1,
      thumbnail: 2,
      markdown: 3,
    },
    htmlContent: 'tbd',
    properUrl: null,
  }),
  computed: {
    ...mapState('auth', ['accessToken']),
    viewChosen: vm => vm.chooseViewer(vm.file),
  },
  async created() {
    await this.getMarkdownHtml();
    await this.getProperUrl();
  },
  methods: {
    ...mapActions('app', [
      'retrieveFileByUniqueName',
    ]),
    chooseViewer(file) {
      if (!file) {
        return this.viewEnum.default;
      }
      if (file.model && file.model.thumbnailUrlCache) {
        return this.viewEnum.thumbnail;
      }
      let fileName = file.custFileName || '';
      if (fileName.endsWith(".md")) {
        return this.viewEnum.markdown;
      }
      return this.viewEnum.default;
    },
    async getMarkdownHtml() {
      let content = "unable to retrieve";
      if (this.file.custFileName) {
        if (this.accessToken) {
          let uName = this.file.currentVersion.uniqueFileName;
          let contentResult = await this.retrieveFileByUniqueName({uniqueFileName: uName, accessToken: this.accessToken});
          if (contentResult) {
            content = contentResult;
          }
        } else {
          content = "# Markdown document"
        }
      }
      this.htmlContent = marked(content);
    },
    async getProperUrl() {
      let url = this.file?.model?.thumbnailUrlCache; // the default fallback
      if (this.file?.versions) {
        const viewedVersion = this.file.versions.find(v => v._id.toString() === this.versionId.toString());
        if (viewedVersion) {
          url = viewedVersion.thumbnailUrlCache || undefined;
          console.log(url);
        } else {
          console.log("FAIL cannot locate visible version in File");
        }
      }
      this.properUrl = url;
    }
  },
  watch: {
    async 'viewChosen'(to, from) {
      await this.getMarkdownHtml();
      await this.getProperUrl();
    },
    async 'file'(to, from) {
      await this.getMarkdownHtml();
      await this.getProperUrl();
    },
    async 'versionId'(to, from) {
      await this.getMarkdownHtml();
      await this.getProperUrl();
    }
  },

};
</script>
