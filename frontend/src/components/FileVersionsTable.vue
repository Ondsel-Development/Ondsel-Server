<template>
  <v-table
    density="compact"
  >
    <thead>
    <tr>
      <th style="max-width: 3em"></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th style="max-width: 3em"></th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td colspan="7">
        <br>
        <span class="align-center text-h5 my-4">versions and their share links</span>
      </td>
    </tr>
    <tr
      v-for="item in blendedRows"
      :key="item._id"
    >
      <td v-if="item.nature==='ver'" colspan="2" >
        {{ refLabel(item._id) }}
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
          mdi-eye
        </v-icon>
      </td>
      <td v-if="item.nature==='ver'" colspan="2">
        {{ dateFormat(item.createdAt) }}
      </td>
      <td v-if="item.nature==='ver'" colspan="2">
        {{ getUserLabel(item.userId, file.relatedUserDetails) }}: {{item.message}}
      </td>
      <td v-if="item.nature==='ver'">
        <v-icon v-if="file.currentVersionId === item._id" icon="mdi-check"/><span v-if="file.currentVersionId === item._id">Active</span>
      </td>
      <td v-if="item.nature==='link'">
      </td>
      <td v-if="item.nature==='link'" colspan="2">
        <span>/share/{{item._id}}</span>
        <span class="ml-4">"{{item.description}}"</span>
      </td>
      <td v-if="item.nature==='link'" colspan="2">
        <v-icon
          size="small"
        >
          mdi-pencil
        </v-icon>
      </td>
      <td v-if="item.nature==='link'" colspan="2">
        PIN (enabled)
      </td>
      <td v-if="item.nature==='follow_title'" colspan="7">
        <br>
        <span class="align-center text-h5">share links following the active version</span>
      </td>
    </tr>
    </tbody>
  </v-table>
  <file-info-dialog ref="fileInfoDialog" :file="file" :selectedFileVersion="selectedFileVersion" :can-user-write="canUserWrite" :public-view="publicView" />
</template>

<script>
import { mapGetters } from 'vuex';
import FileInfoDialog from '@/components/FileInfoDialog.vue';

export default {
  name: "FileVersionsTable",
  components: { FileInfoDialog },
  props: {
    file: Object,
    canUserWrite: {
      type: Boolean,
      default: false,
    },
    publicView: Boolean,
  },
  data: () => ({
    isFileInfoDialogActive: false,
    selectedFileVersion: null,
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
          if (item.lockedSharedModels && item.lockedSharedModels.length > 0) {
            for (const sm of item.lockedSharedModels) {
              result.push({nature: 'link', ...sm});
            }
          }
        }
      }
      if (vm.file?.followingActiveSharedModels) {
        result.push({nature: 'follow_title'});
        for (const sm of vm.file.followingActiveSharedModels) {
          result.push({nature: 'link', ...sm});
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
    refLabel(refId) {
      return ".." + refId.substr(-6);
    }
  }
}
</script>

<style scoped>

</style>
