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
          :disabled="isFileDownloadInProgress"
          :loading="isFileDownloadInProgress"
          @click="downloadFile(selectedFileVersion.uniqueFileName, `${selectedFileVersion._id.substr(-6)}_${file.custFileName}`)"
        >Download Copy</v-btn>
        <v-btn
          color="primary"
        >Set as Active</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import fileDownloadMixin from '@/mixins/fileDownloadMixin';

export default {
  name: "FileInfoDialog",
  props: {
    file: Object,
    selectedFileVersion: Object,
  },
  mixins: [fileDownloadMixin],
  data: () => ({
    dialog: false,
  }),
  computed: {
    tableData: (vm) => ([
      {
        name: 'What',
        value: vm.file.custFileName,
      },
      {
        name: 'Who',
        value: vm.selectedFileVersion.userId,
      },
      {
        name: 'When',
        value: (new Date(vm.selectedFileVersion.createdAt)).toDateString(),
      },
      {
        name: 'Why',
        value: vm.selectedFileVersion.message
      },
    ])
  }
}
</script>

<style scoped>

</style>
