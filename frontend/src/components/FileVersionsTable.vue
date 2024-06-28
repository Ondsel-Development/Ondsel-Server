<template>
  <v-table
    density="compact"
  >
    <thead>
    <tr>
      <th>Ref</th>
      <th>Detail</th>
      <th>Who/Why</th>
      <th>Link(s)</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td colspan="4">
        <br>
        <span class="align-center text-h5 my-4">
          versions <span v-if="isFileModel(file)">and their share links</span>
        </span>
      </td>
    </tr>
    <tr
      v-for="item in blendedRows"
      :key="item._id"
    >
      <td v-if="item.nature==='ver'">
        <span
          v-if="item._id.toString() === visibleVersionId || !isFileModel(file)"
          class="mx-1"
        >
          <v-icon
            v-if="item._id.toString() === visibleVersionId"
            size="small"
            class="ma-2"
          >
            mdi-eye-outline
          </v-icon>
          <v-icon
            v-else
            size="small"
            class="ma-2"
          >
            mdi-space
          </v-icon>
        </span>
        <v-btn
          v-if="isFileModel(file) && item._id.toString() !== visibleVersionId"
          size="small"
          icon="mdi-eye-off-outline"
          @click="doChangeVisibleVersion(item._id.toString())"
        ></v-btn>
        <code class="mr-2">{{ refLabel(item._id) }}</code>
        <v-btn
          v-if="!publicView"
          size="small"
          color="decoration"
          icon="mdi-pencil"
          @click="selectedFileVersion = item; $refs.fileInfoDialog.$data.dialog = true;"
        ></v-btn>
        <v-btn
          v-if="publicView"
          size="small"
          color="decoration"
          icon="mdi-help"
          @click="selectedFileVersion = item; $refs.fileInfoDialog.$data.dialog = true;"
        ></v-btn>
      </td>
      <td v-if="item.nature==='ver'">
        {{ dateFormat(item.createdAt) }}
        <v-icon v-if="file.currentVersionId === item._id" icon="mdi-check"/><span v-if="file.currentVersionId === item._id"><b>Active</b></span>
      </td>
      <td v-if="item.nature==='ver'">
        {{ getUserLabel(item.userId, file.relatedUserDetails) }}: {{item.message}}
      </td>
      <td v-if="item.nature==='ver'">
        <v-btn
          v-if="!publicView && isFileModel(file) && file.currentVersionId === item._id"
          size="small"
          color="decoration"
          icon="mdi-plus"
          @click="startSharedModelDialogForVersion(item)"
        >
        </v-btn>
      </td>
      <td v-if="item.nature==='link'">
      </td>
      <td v-if="item.nature==='link'">
        <a
          :href="'/share/' + item._id.toString()"
          target="_blank"
          style="text-decoration: none; color: inherit;"
        >
          <span class="text-blue-darken-4">
            <v-icon>
              mdi-open-in-new
            </v-icon>
            /share/{{item._id}}
          </span>
        </a>
        <span class="ml-4">"{{item.description}}"</span>
      </td>
      <td v-if="item.nature==='link'">
      </td>
      <td v-if="item.nature==='link'">
        <v-btn
          size="small"
          color="decoration"
          icon="mdi-dots-vertical"
          @click="startSharedModelLinkActionDialog(item)"
        ></v-btn>
        {{item.protection}}
        <span v-if="item.isActive">(enabled)</span>
        <span v-if="!item.isActive">(disabled)</span>
      </td>
      <td v-if="item.nature==='follow_title'" colspan="3">
        <br>
        <span class="align-center text-h5">shares following the active version</span>
      </td>
      <td v-if="item.nature==='follow_title'" colspan="1">
        <v-btn
          v-if="!publicView"
          size="small"
          color="decoration"
          icon="mdi-plus"
          @click="startSharedModelDialogFollowingActive()"
        >
        </v-btn>
      </td>
      <td v-if="item.nature==='none'">
      </td>
      <td v-if="item.nature==='none'" colspan="3">
        <span class="text-body-2"><i>no links</i></span>
      </td>
    </tr>
    </tbody>
  </v-table>
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
  }),
  async created() {
  },
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    blendedRows: (vm) => {
      let result = [];
      if (vm.file?.versions) {
        for (const item of vm.file.versions) {
          result.push({nature: 'ver', ...item});
          if (vm.isFileModel(vm.file)) {
            let linksFound = false;
            if (item.lockedSharedModels && item.lockedSharedModels.length > 0) {
              for (const sm of item.lockedSharedModels) {
                if ((sm.protection === "Listed" && sm.isActive) || !vm.publicView) {
                  linksFound = true;
                  result.push({nature: 'link', ...sm});
                }
              }
            }
            if (!linksFound) {
              result.push({nature: 'none'});
            }
          }
        }
      }
      if (vm.isFileModel(vm.file)) {
        result.push({nature: 'follow_title'});
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
  },
}
</script>

<style scoped>

</style>
