<template>
  <v-sheet class="d-flex flex-column">
    <v-sheet>
      <span class="text-h5">versions</span>
    </v-sheet>
    <v-sheet
      v-for="(item, index) in versionRows"
      :key="item._id"
      class="pa-1"
    >
      <v-divider></v-divider>
      <v-sheet class="d-flex flex-row flex-wrap">
        <v-sheet width="3em" class="pt-1">
          <span
            v-if="item._id.toString() === visibleVersionId || !isFileModel(file)"
            class="mx-1"
          >
            <v-btn
              v-if="item._id.toString() === visibleVersionId"
              size="small"
              variant="text"
              icon="mdi-eye-outline"
            ></v-btn>
            <v-btn
              v-else
              size="small"
              variant="text"
              icon="midi-space"
            ></v-btn>
          </span>
          <v-btn
            v-if="isFileModel(file) && item._id.toString() !== visibleVersionId"
            size="small"
            icon="mdi-eye-off-outline"
            class="ml-1"
            @click="doChangeVisibleVersion(item._id.toString())"
          ></v-btn>
        </v-sheet>
        <v-btn
          width="20em"
          class="my-2 mr-2"
        >
          {{item.message}}
          <span v-if="file.currentVersionId === item._id" class="ml-2"><b>(Active)</b></span>
        </v-btn>
        <v-sheet width="20em" class="ma-2">
          from {{ getUserLabel(item.userId, file.relatedUserDetails) }}
          <br>
          on {{ dateFormat(item.createdAt) }}
        </v-sheet>
        <v-btn
          class="my-2"
          :append-icon="item.displayLinks ? 'mdi-arrow-collapse-up' : 'mdi-arrow-expand-down'"
          @click="toggleLinkDisplay(index)"
          width="6em"
        >
          Links
        </v-btn>
      </v-sheet>
      <v-sheet
        v-if="item.displayLinks"
        class="d-flex flex-column flex-wrap border-lg ml-16"
      >
        <v-sheet
          v-if="item.lockedLinks.length === 0"
          class="ml-2 my-3"
        >
          <i>No Links Locked to this version.</i>
        </v-sheet>
        <v-sheet
          v-else
          v-for="(link, index) in item.lockedLinks"
          :key="link._id"
          class="border-sm pa-1"
        >
          <v-sheet
            class="d-flex flex-row flex-wrap"
          >
            <v-sheet width="4em" class="my-3 mr-4">
              {{link.isActive ? 'Enabled' : 'Disabled'}}
            </v-sheet>
            <v-sheet width="16em" class="my-3">
              <b>{{link.publicDescription || 'no public description'}}</b>
              <br>
              private: <i>{{link.description || 'no note'}}</i>
            </v-sheet>
            <v-sheet width="3em">
              <v-btn
                color="secondary"
                icon="mdi-cog"
              ></v-btn>
            </v-sheet>
          </v-sheet>
        </v-sheet>
      </v-sheet>
    </v-sheet>
  </v-sheet>
  <file-info-dialog
    ref="fileInfoDialog"
    :file="file"
    :selectedFileVersion="selectedFileVersion"
    :can-user-write="canUserWrite"
    :public-view="publicView"
    @changed-file="changedFile"
  ></file-info-dialog>
  <shared-model-link-action-dialog
    ref="sharedModelLinkActionDialogRef"
    :can-user-write="canUserWrite"
    :public-view="publicView"
    @changed-file="changedFile"
  ></shared-model-link-action-dialog>
  <share-link-crud-dialog
    v-if="!publicView"
    ref="sharedModelDialogRef"
    @share-model="changedFile"
  ></share-link-crud-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import FileInfoDialog from '@/components/FileInfoDialog.vue';
import SharedModelLinkActionDialog from "@/components/SharedModelLinkActionDialog.vue";
import ShareLinkCrudDialog from "@/components/ShareLinkCrudDialog.vue";

export default {
  name: "FileVersionsTable",
  components: {ShareLinkCrudDialog, SharedModelLinkActionDialog, FileInfoDialog },
  emits: ['changeVisibleVersion', 'changedFile'],
  props: {
    file: Object,
    canUserWrite: {
      type: Boolean,
      default: false,
    },
    publicView: Boolean,
    visibleVersionId: String,
  },
  data: () => ({
    isFileInfoDialogActive: false,
    selectedFileVersion: null,
    somethingTrue: true,
    versionRows: [],
  }),
  async created() {
    await this.rebuild();
  },
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    activeFollowingLinkRows: (vm) => {
      let result = [];
      if (vm.isFileModel(vm.file)) {
        let result = [];
        let linksFound = false;
        if (vm.file?.followingActiveSharedModels && vm.file?.followingActiveSharedModels.length > 0) {
          for (const sm of vm.file.followingActiveSharedModels) {
            if ((sm.protection === "Listed" && sm.isActive ) || !vm.publicView) {
              linksFound = true;
              result.push({nature: 'link', ...sm});
            }
          }
        }
        if (!linksFound) {
          result.push({nature: 'none'});
        }
      }
      return result;
    },
  },
  methods: {
    dateFormat(number) {
      const date = new Date(number);
      return date.toLocaleString();
    },
    getUserLabel(userId, userSummaryList) {
      const cleanList = userSummaryList || [];
      let userSum = cleanList.find((user) => user._id.toString() === userId.toString())
      if (!userSum) {
        return "ref:" + userId.substr(-6);
      }
      return userSum.name;
    },
    isFileModel(file) {
      if (file.modelId) {
        return true;
      }
      return false;
    },
    refLabel(refId) {
      return ".." + refId.substr(-6);
    },
    async startSharedModelDialogFollowingActive() {
      let data = this.$refs.sharedModelDialogRef.$data;
      data.dialog = true;
      data.versionFollowing = 'Active';
      data.versionFollowingPreset = true;
      data.versionDescription = "Always Shows Active Version Of File";
    },
    async startSharedModelDialogForVersion(version) {
      const name = this.getUserLabel(version.userId, this.file.relatedUserDetails)
      let data = this.$refs.sharedModelDialogRef.$data;
      data.dialog = true;
      data.modelId = this.file.fileId;
      data.creatorRole = false;
      data.versionFollowing = 'Locked';
      data.versionFollowingPreset = true;
      data.versionDescription = `file version ..${version._id.substr(-6)} : "${version.message}" posted by ${name}`;
    },
    async startSharedModelLinkActionDialog(item) {
      let data = this.$refs.sharedModelLinkActionDialogRef.$data;
      data.sharedModelSummary = item;
      data.dialog = true;
    },
    async doChangeVisibleVersion(versionId) {
      this.$emit('changeVisibleVersion', versionId);
    },
    async changedFile() {
      this.$emit('changedFile');
    },
    async toggleLinkDisplay(index) {
      this.versionRows[index].displayLinks = !this.versionRows[index].displayLinks;
    },
    async rebuild() {
      let newRows = [];
      if (this.file?.versions) {
        for (const item of this.file.versions) {
          let lockedLinks = [];
          if (item.lockedSharedModels && item.lockedSharedModels.length > 0) {
            for (const sm of item.lockedSharedModels) {
              if ((sm.protection === "Listed" && sm.isActive) || !this.publicView) {
                lockedLinks.push(sm);
              }
            }
          }
          newRows.push({
            nature: 'ver',
            linkDisplayRef: `link-display-${item._id.toString()}`,
            displayLinks: false,
            lockedLinks: lockedLinks,
            ...item
          });
        }
      }
      this.versionRows = newRows;
    }
  },
  watch: {
    async 'file'(to, from) {
      this.rebuild();
    }
  }
}
</script>

<style scoped>

</style>
