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
        <span class="align-center text-h5 my-4">versions and their share links</span>
      </td>
    </tr>
    <tr
      v-for="item in blendedRows"
      :key="item._id"
    >
      <td v-if="item.nature==='ver'">
        <span
          v-if="item._id.toString() === visibleVersionId"
          class="mx-1"
        >
          <v-icon
            size="small"
            class="ma-2"
          >
            mdi-eye-outline
          </v-icon>
        </span>
        <v-btn
          v-if="item._id.toString() !== visibleVersionId"
          size="small"
          icon="mdi-eye-off-outline"
          @click="doChangeVisibleVersion(item._id.toString())"
        ></v-btn>
        <code>{{ refLabel(item._id) }}</code>
        <v-icon
          v-if="!publicView"
          size="small"
          @click="selectedFileVersion = item; $refs.fileInfoDialog.$data.dialog = true;"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          v-if="publicView"
          size="small"
          @click="selectedFileVersion = item; $refs.fileInfoDialog.$data.dialog = true;"
        >
          mdi-help
        </v-icon>
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
          v-if="!publicView"
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
        <span>/share/{{item._id}}</span>
        <span class="ml-4">"{{item.description}}"</span>
      </td>
      <td v-if="item.nature==='link'">
      </td>
      <td v-if="item.nature==='link'">
        <v-icon
          size="small"
        >
          mdi-dots-vertical
        </v-icon>
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
  <file-info-dialog ref="fileInfoDialog" :file="file" :selectedFileVersion="selectedFileVersion" :can-user-write="canUserWrite" :public-view="publicView" />
  <share-model-dialog v-if="!publicView" ref="sharedModelDialogRef" :is-active='somethingTrue' :model-id="file.modelId"></share-model-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import FileInfoDialog from '@/components/FileInfoDialog.vue';
import ShareModelDialog from "@/components/ShareModelDialog.vue";

export default {
  name: "FileVersionsTable",
  components: {ShareModelDialog, FileInfoDialog },
  emits: ['changeVisibleVersion'],
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
          let linksFound = false;
          if (item.lockedSharedModels && item.lockedSharedModels.length > 0) {
            for (const sm of item.lockedSharedModels) {
              if (sm.protection === "Listed" || !vm.publicView) {
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
      result.push({nature: 'follow_title'});
      let linksFound = false;
      if (vm.file?.followingActiveSharedModels && vm.file?.followingActiveSharedModels.length > 0) {
        for (const sm of vm.file.followingActiveSharedModels) {
          if (sm.protection === "Listed" || !vm.publicView) {
            linksFound = true;
            result.push({nature: 'link', ...sm});
          }
        }
      }
      if (!linksFound) {
        result.push({nature: 'none'});
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
      data.versionFollowing = 'Locked';
      data.versionFollowingPreset = true;
      data.versionDescription = `ver ..${version._id.substr(-6)} : "${version.message}" posted by ${name}`;
    },
    async doChangeVisibleVersion(versionId) {
      this.$emit('changeVisibleVersion', versionId);
    }
  }
}
</script>

<style scoped>

</style>
