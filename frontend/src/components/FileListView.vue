<template>
  <v-card min-width="32em" border>
    <v-card-title>
      <v-sheet class="d-flex flex-wrap justify-space-between">
        <span>Files in <code class="text-teal-darken-4 ml-3">{{path}}</code></span>
        <v-sheet>
          <v-btn
            icon="mdi-view-grid"
          ></v-btn>
          <v-btn
            icon="mdi-view-list"
          ></v-btn>
        </v-sheet>
        <v-btn
          icon="mdi-plus"
        ></v-btn>
      </v-sheet>
    </v-card-title>
    <v-card-text>

      <v-sheet class="d-flex flex-wrap">
        <v-card
          v-for="file in fileList"
          :key="file._id"
          @click="gotoFile(file)"
        >
          <v-img
            v-if="file.thumbnailUrlCache"
            height="8em"
            :src="file.thumbnailUrlCache"
            cover
          ></v-img>
          <v-sheet
            v-else
            color="#F4F4F4"
            height="8em"
            class="d-flex justify-center align-center"
          >
            <v-icon icon="mdi-file" style="color: #8D8D8D" cover />
          </v-sheet>
          <v-card-text>
            <div class="text-body-2 text-center">{{ file.custFileName }}</div>
          </v-card-text>
        </v-card>
        <div v-if="fileList.length===0" class="text-body-2 text-center" style="text-align: center; justify-content: center">
          There are no files in this directory
        </div>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: 'FileListView',
  components: {},
  emits: [],
  props: {
    directory: Object,
    path: String,
  },
  data: () => ({
    iconViewMode: true,
  }),
  computed: {
    fileList: vm => vm.directory.files || [],
    userRouteFlag: vm => vm.$route.path.startsWith("/user"),
  },
  methods: {
    ...mapActions('app', [
    ]),
    async gotoFile(fileSummary) {
      const slug = this.$route.params.slug;
      const wsName = this.$route.params.wsname;
      const fileId = fileSummary._id.toString();
      if (this.userRouteFlag) {
        this.$router.push({ name: 'UserWorkspaceFile', params: { slug: slug, wsname: wsName, fileid: fileId } });
      } else {
        this.$router.push({ name: 'OrgWorkspaceFile', params: { slug: slug, wsname: wsName, fileid: fileId } });
      }
    }
  },
};
</script>

<style scoped>
.show-indent {
  border-left-style: solid;
  border-left-color: grey;
  border-left-width: 1px;
}
</style>
