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
        <p class="text-center">
          Image Not Generated Yet
        </p>
        <p v-if="file.currentVersion._id.toString() === versionId" class="text-center">
          Click on "Explore" to create image
        </p>
        <p v-if="file.currentVersion._id.toString() !== versionId" class="text-center">
          You can only create new Images on the active version.
        </p>
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
    viewChosen: 1,
  }),
  computed: {
    ...mapState('auth', ['accessToken']),
  },
  async created() {
    await this.chooseViewer(this.file);
    await this.getMarkdownHtml();
    await this.getProperUrl();
  },
  methods: {
    ...mapActions('app', [
      'retrieveFileByUniqueName',
    ]),
    async chooseViewer(file) {
      if (!file) {
        this.viewChosen = this.viewEnum.default;
        return;
      }
      if (file.model) {
        this.viewChosen = this.viewEnum.thumbnail;
        return;
      }
      let fileName = file.custFileName || '';
      if (fileName.endsWith(".md")) {
        this.viewChosen = this.viewEnum.markdown;
        return;
      }
      this.viewChosen = this.viewEnum.default;
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
      let url = null;
      if (this.viewChosen === this.viewEnum.thumbnail) {
        if (this.file?.versions) {
          const viewedVersion = this.file.versions.find(v => v._id.toString() === this.versionId.toString());
          if (viewedVersion) {
            url = viewedVersion.thumbnailUrlCache || undefined;
          } else {
            console.log("FAIL cannot locate visible version in File");
          }
        }
      }
      this.properUrl = url;
    }
  },
  watch: {
    async 'file'(to, from) {
      await this.chooseViewer(this.file)
      await this.getMarkdownHtml();
      await this.getProperUrl();
    },
    async 'versionId'(to, from) {
      await this.chooseViewer(this.file)
      await this.getMarkdownHtml();
      await this.getProperUrl();
    }
  },

};
</script>
