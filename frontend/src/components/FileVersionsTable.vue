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
        <v-sheet
          width="20em"
          class="my-2 mr-2 pa-2 text-blue-darken-4 cursor-pointer"
          @click="selectedFileVersion = item; $refs.fileInfoDialog.$data.dialog = true;"
        >
          {{item.message}}
          <span v-if="file.currentVersionId === item._id" class="ml-2"><b>(Active)</b></span>
        </v-sheet>
        <v-sheet width="20em" class="ma-2">
          from {{ getUserLabel(item.userId, file.relatedUserDetails) }}
          <br>
          on {{ dateFormat(item.createdAt) }}
        </v-sheet>
        <v-btn
          v-if="isFileModel(file)"
          class="my-2"
          :append-icon="item.displayLinks ? 'mdi-arrow-collapse-up' : 'mdi-arrow-expand-down'"
          @click="toggleLinkDisplay(index)"
          width="6em"
        >
          Links
        </v-btn>
<!--        <v-sheet width="3em">-->
<!--          <v-btn-->
<!--            color="secondary"-->
<!--            icon="mdi-printer-3d"-->
<!--            class="ma-1 ml-2"-->
<!--          ></v-btn>-->
<!--        </v-sheet>-->
      </v-sheet>
      <v-sheet
        v-if="item.displayLinks"
        class="d-flex flex-column flex-wrap border-lg ml-16 pl-2"
      >
        <v-sheet><span class="text-h6">Links</span></v-sheet>
        <v-sheet
          class="d-flex flex-column flex-wrap ml-8"
        >
          <v-sheet
            v-if="item.links.length === 0"
            class="ml-2 my-3"
          >
            <i>No Links</i>
          </v-sheet>
          <v-sheet
            v-else
            v-for="(link, index) in item.links"
            :key="link._id"
            class="border-sm pa-1"
          >
            <v-sheet
              class="d-flex flex-row flex-wrap"
            >
              <v-sheet width="3em" class="my-3">
                {{link.isActive ? 'Enabled' : 'Disabled'}}
              </v-sheet>
              <v-btn
                width="3em"
                variant="plain"
                class="mt-2"
              >
                <v-icon>
                  {{link.versionFollowing === 'Locked' ? 'mdi-clock-end' : 'mdi-elevation-rise'}}
                </v-icon>
                <v-tooltip activator="parent">
                  {{link.versionFollowing === 'Locked' ? 'Locked: restricted to this specific version of the file' : 'Active: follows the file\'s currently Active version'}}
                </v-tooltip>
              </v-btn>
              <v-sheet :width="$vuetify.display.mobile ? '16em' : '32em'" class="my-3">
                <b>{{link.title || 'no public description'}}</b>
                <br>
                private: <i>{{link.description || 'no note'}}</i>
              </v-sheet>
              <v-sheet width="3em" class="mr-2">
                <v-btn
                  color="secondary"
                  icon="mdi-cog"
                  class="ma-1"
                  @click="startEditLinkForFollowingActiveDialog(link)"
                ></v-btn>
              </v-sheet>
              <v-sheet
                v-if="link.protection === 'Direct'"
                width="4em"
                class="d-flex flex-row justify-center"
              >
                <v-btn
                  color="secondary"
                  icon="mdi-account-multiple-plus"
                  class="mt-1"
                ></v-btn>
                <span class="mt-4 ml-2">{{link.directSharedTo ? link.directSharedTo.length : '0'}}</span>
              </v-sheet>
            </v-sheet>
          </v-sheet>
          <v-sheet
            v-if="file.currentVersionId === item._id"
            class="border-sm pa-1"
          >
            <v-btn
              color="secondary"
              prepend-icon="mdi-plus"
              @click="startCreateLinkDialog(item)"
            >
              Create Link
            </v-btn>
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
  <share-link-crud-dialog
    v-if="!publicView"
    ref="sharedModelDialogRef"
    @share-model="changedFile"
  ></share-link-crud-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import FileInfoDialog from '@/components/FileInfoDialog.vue';
import ShareLinkCrudDialog from "@/components/ShareLinkCrudDialog.vue";

export default {
  name: "FileVersionsTable",
  components: {ShareLinkCrudDialog, FileInfoDialog },
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
  },
  methods: {
    doNothing() {
      //
    },
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
    async startEditLinkForFollowingActiveDialog(link) {
      let data = this.$refs.sharedModelDialogRef.$data;
      data.modelId = this.file.modelId;
      data.creatorRole = false;
      data.versionFollowingPreset = true;
      data.versionDescription = `edit or delete link`;
      await this.$refs.sharedModelDialogRef.assignFromExistingSharedModel(link);
      if (data.versionFollowing === 'Locked') {
        data.versionDescription = `Specific ${this.file.custFileName} Version`;
      } else {
        data.versionDescription = `Always Shows Active Version Of ${this.file.custFileName}`;
      }
      data.dialog = true;
    },
    async startCreateLinkDialog(version) {
      const name = this.getUserLabel(version.userId, this.file.relatedUserDetails)
      let data = this.$refs.sharedModelDialogRef.$data;
      data.sharedModel = null;
      data.modelId = this.file.modelId;
      data.creatorRole = true;
      data.versionFollowing = 'Locked';
      data.versionFollowingPreset = false;
      data.versionDescription = `${this.file.custFileName} File Version "${version.message}" posted by ${name}`;
      await this.$refs.sharedModelDialogRef.cleanCreatorStart();
      data.dialog = true;
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
          let links = [];
          if (item.lockedSharedModels && item.lockedSharedModels.length > 0) {
            for (const sm of item.lockedSharedModels) {
              if ((sm.protection === "Listed" && sm.isActive) || !this.publicView) {
                links.push(sm);
              }
            }
          }
          if (item._id.toString() === this.file.currentVersionId.toString()) {
            if (this.file.followingActiveSharedModels && this.file.followingActiveSharedModels.length > 0) {
              for (const sm of this.file.followingActiveSharedModels) {
                if ((sm.protection === "Listed" && sm.isActive ) || !this.publicView) {
                  links.push(sm);
                }
              }
            }
          }
          newRows.push({
            nature: 'ver',
            linkDisplayRef: `link-display-${item._id.toString()}`,
            displayLinks: false,
            links: links,
            ...item
          });
        }
      }
      this.versionRows = newRows;
    }
  },
  watch: {
    async 'file'(to, from) {
      await this.rebuild();
    }
  }
}
</script>

<style scoped>
.bw-icon {
  color: #000000;
}
</style>
