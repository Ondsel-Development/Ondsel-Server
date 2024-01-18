<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="500" max-height="800">
<!--      <template v-slot:title>-->
<!--        <div class="text-center">File Info</div>-->
<!--      </template>-->
      <v-card-text>
        <div class="text-body-2" style="text-align: center">
          version <span class="font-weight-bold">{{ selectedFileVersion._id.substr(-6) }}</span> of file in <span class="font-weight-bold">{{ file.workspace.name }}</span>
        </div>
        <v-table density="compact" class="justify-center align-center mt-2">
          <tbody>
            <tr
              v-for="item in tableData"
              :key="item.name"
            >
              <td style="text-align: right">{{ item.name }}</td>
              <td>{{ item.value }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="isFileDownloadInProgress || !user"
          :loading="isFileDownloadInProgress"
          @click="downloadFile(selectedFileVersion.uniqueFileName, `${selectedFileVersion._id.substr(-6)}_${file.custFileName}`)"
        >Download Copy</v-btn>
        <v-btn
          v-if="!publicView"
          color="primary"
          :disabled="!canUserWrite"
          :loading="isPatchPending"
          @click="checkoutToVersion"
        >Set as Active</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import { mapState } from 'vuex';
import fileDownloadMixin from '@/mixins/fileDownloadMixin';

export default {
  name: "FileInfoDialog",
  props: {
    file: Object,
    selectedFileVersion: Object,
    canUserWrite: {
      type: Boolean,
      default: false,
    },
    publicView: Boolean,
  },
  mixins: [fileDownloadMixin],
  data: () => ({
    dialog: false,
  }),
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('file', ['isPatchPending']),
    tableData: (vm) => ([
      {
        name: 'What',
        value: vm.file.custFileName,
      },
      {
        name: 'Committer',
        value: vm.getUserLabel(vm.selectedFileVersion.userId, vm.file.relatedUserDetails),
      },
      {
        name: 'Date',
        value: (new Date(vm.selectedFileVersion.createdAt)).toLocaleString(),
      },
      {
        name: 'Message',
        value: vm.selectedFileVersion.message
      },
    ])
  },
  methods: {
    async checkoutToVersion() {
      await this.file.patch({
        data: {
          shouldCheckoutToVersion: true,
          versionId: this.selectedFileVersion._id,
        }
      });
      this.dialog = false;
    },
    getUserLabel(userId, userSummaryList) {
      const cleanList = userSummaryList || [];
      let userSum = cleanList.find((user) => user._id.toString() === userId.toString())
      if (!userSum) {
        return "ref:" + userId.substr(-6);
      }
      return userSum.name;
    },
  }
}
</script>

<style scoped>

</style>
