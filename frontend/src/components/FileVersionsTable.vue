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
          class="mr-2 my-2"
          :append-icon="displayLinks[item._id] ? 'mdi-arrow-collapse-up' : 'mdi-arrow-expand-down'"
          :prepend-icon="arrayCountIcon(item.links)"
          @click="toggleLinkDisplay(index)"
          width="12em"
        >
          ShareLinks
        </v-btn>
        <v-btn
          class="my-2"
          append-icon="mdi-open-in-app"
          @click="$emit('launchOndselEs', item._id)"
        >
          Open In Ondsel ES
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
        v-if="displayLinks[item._id]"
        class="d-flex flex-column flex-wrap border-lg ml-16 pl-2"
      >
        <v-sheet><span class="text-h6">ShareLinks</span></v-sheet>
        <v-sheet
          class="d-flex flex-column flex-wrap ml-8"
        >
          <v-sheet
            v-if="item.links.length === 0"
            class="ml-2 my-3"
          >
            <i>No ShareLinks</i>
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
              <v-sheet
                width="6em"
                class="d-flex flex-row"
              >
                <v-container class="ml-n2 mr-n3">
                  <v-icon>
                    {{link.isActive ? 'mdi-checkbox-marked-circle-outline' : 'mdi-checkbox-blank-circle-outline'}}
                  </v-icon>
                  <v-tooltip activator="parent">
                    {{link.isActive ? 'Enabled' : 'Disabled'}}
                  </v-tooltip>
                </v-container>
                <v-container class="mx-n3">
                  <v-icon>
                    {{link.versionFollowing === 'Locked' ? 'mdi-clock-end' : 'mdi-elevation-rise'}}
                  </v-icon>
                  <v-tooltip activator="parent">
                    {{link.versionFollowing === 'Locked' ? 'Locked: restricted to this specific version of the file' : 'Active: follows the file\'s currently Active version'}}
                  </v-tooltip>
                </v-container>
                <v-container class="ml-n3">
                  <v-icon>
                    {{protectionDetail(link.protection).icon}}
                  </v-icon>
                  <v-tooltip activator="parent">
                    {{protectionDetail(link.protection).title}}
                  </v-tooltip>
                </v-container>
              </v-sheet>
              <v-sheet :width="$vuetify.display.mobile ? '16em' : '28em'" class="text-wrap my-3 ml-4" style="word-break: break-word">
                <b>{{link.title || 'no public description'}}</b>
                <br>
                <span v-if="!publicView">private: <i>{{link.description || 'no note'}}</i></span>
              </v-sheet>
              <v-sheet width="3em" class="mt-3 mr-2">
                <v-btn
                  v-if="link.isActive"
                  color="link"
                  variant="plain"
                  append-icon="mdi-open-in-new"
                  style="text-decoration: none;"
                  :to="{ name: 'Share', params: { id: link._id }}"
                  target="_blank"
                >
                  <v-tooltip activator="parent">
                    open link in new window
                  </v-tooltip>
                </v-btn>
                <v-btn
                  v-else
                  color="disabled"
                  variant="plain"
                  append-icon="mdi-open-in-new"
                  style="text-decoration: none;"
                >
                  <v-tooltip activator="parent">
                    link is disabled
                  </v-tooltip>
                </v-btn>
              </v-sheet>
              <v-sheet v-if="canUserWrite" width="3em" class="mr-2">
                <v-btn
                  color="secondary"
                  icon="mdi-cog"
                  class="ma-1"
                  @click="startEditLinkDialog(link, item)"
                ></v-btn>
              </v-sheet>
              <v-sheet v-if="canUserWrite" width="3em" class="mr-2">
                <v-btn
                  v-if="link.protection === 'Direct'"
                  class="ma-1"
                  color="secondary"
                  icon="mdi-account-multiple-plus"
                  @click="startDirectShareToUserDialog(link)"
                ></v-btn>
              </v-sheet>
            </v-sheet>
          </v-sheet>
          <v-sheet
            v-if="file.currentVersionId === item._id && canUserWrite"
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
    v-if="canUserWrite"
    ref="sharedModelDialogRef"
    @shared-model-changed="changedFile"
  ></share-link-crud-dialog>
  <direct-share-to-users-dialog
    v-if="currentOrganization"
    ref="directShareToUsersDialogRef"
    :shared-model="activeSharedModel"
  />
</template>

<script>
import { mapGetters } from 'vuex';
import FileInfoDialog from '@/components/FileInfoDialog.vue';
import ShareLinkCrudDialog from "@/components/ShareLinkCrudDialog.vue";
import DirectShareToUsersDialog from "@/components/DirectShareToUsersDialog.vue";
import {models} from "@feathersjs/vuex";

const { SharedModel } = models.api;


export default {
  name: "FileVersionsTable",
  components: {DirectShareToUsersDialog, ShareLinkCrudDialog, FileInfoDialog },
  emits: ['changeVisibleVersion', 'changedFile', 'launchOndselEs'],
  props: {
    file: Object,
    canUserWrite: {
      type: Boolean,
      default: false,
    },
    publicView: Boolean,
    visibleVersionId: String,
    activeVersionThumbnailAvailable: Boolean,
  },
  data: () => ({
    isFileInfoDialogActive: false,
    selectedFileVersion: null,
    somethingTrue: true,
    activeSharedModel: {},
    displayLinks: {},
  }),
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    versionRows() {
      let newRows = [];
      if (this.file && this.file?.versions) {
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
            links: links,
            ...item
          });
        }
      }
      return newRows;
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
      return !!file.modelId;
    },
    refLabel(refId) {
      return ".." + refId.substr(-6);
    },
    async startEditLinkDialog(link, version) {
      const name = this.getUserLabel(version.userId, this.file.relatedUserDetails)
      let data = this.$refs.sharedModelDialogRef.$data;
      data.modelId = this.file.modelId;
      data.creatorRole = false;
      data.versionFollowingPreset = true;
      data.versionDescription = `edit or delete link`;
      await this.$refs.sharedModelDialogRef.assignFromExistingSharedModel(link);
      if (data.versionFollowing === 'Locked') {
        data.versionDescription = `"${this.file.custFileName}" version "${version.message}" by ${name}`;
      } else {
        data.versionDescription = `Follows ${this.file.custFileName}`;
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
      data.versionDescription = `"${this.file.custFileName}" version "${version.message}" by ${name}`;
      data.defaultTitle = `${this.file.custFileName} - ${version.message}`;
      await this.$refs.sharedModelDialogRef.cleanCreatorStart();
      data.dialog = true;
    },
    async startDirectShareToUserDialog(sharedModelSummary) {
      this.activeSharedModel = await SharedModel.get(sharedModelSummary._id); // get full model for this dialog
      this.$refs.directShareToUsersDialogRef.$data.dialog = true;
    },
    async doChangeVisibleVersion(versionId) {
      this.$emit('changeVisibleVersion', versionId);
    },
    async changedFile() {
      // while a bit extreme; this solves the "too many layers" reactive problem
      // window.location.reload();
      // this.$emit('changedFile');
      // await this.$nextTick( // the "distribution" is post-update, so wait a moment for file to update
      //   async () => {
      //     await this.rebuild();
      //   }
      // )
    },
    async toggleLinkDisplay(index) {
      this.displayLinks[this.versionRows[index]._id] = !this.displayLinks[this.versionRows[index]._id]
    },
    protectionDetail(protection) {
      switch (protection) {
        case 'Listed':
          return {icon: 'mdi-earth', title: 'Listed: visible & searchable by the public'};
        case 'Unlisted':
          return {icon: 'mdi-playlist-remove', title: 'Unlisted: visible to public but you need to know the URL'};
        case 'Pin':
          return {icon: 'mdi-apps', title: 'Pin: only visible when the PIN is entered'};
        case 'Direct':
          return {icon: 'mdi-account-key', title: 'Direct: only visible to accounts you add'};
      }
      return {icon: '', title: ''}
    },
    arrayCountIcon(arr) {
      const number = arr?.length ?? 0;
      if (number <= 9) {
        return `mdi-numeric-${number}-box-outline`;
      } else {
        return 'mdi-numeric-9-plus-box-outline';
      }
    },
  },
}
</script>

<style scoped>
.bw-icon {
  color: #000000;
}
</style>
