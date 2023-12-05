<template>
  <v-data-table-virtual
    :headers="headers"
    :items="file.versions"
    class="text-body-2"
    height="200"
    :item-value="file.versions"
    density="compact"
    fixed-header
  >
    <template v-slot:item._id="{ item }">
      {{ refLabel(item.value._id) }}
    </template>
    <template v-slot:item.createdAt="{ item }">
      {{ dateFormat(item.value.createdAt) }}
    </template>
    <template v-slot:item.userId="{ item }">
      {{ getUserLabel(item.value.userId) }}
    </template>
    <template v-slot:item.active="{ item }">
      <v-icon v-if="file.currentVersionId === item.value._id" icon="mdi-check"/>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        @click="selectedFileVersion = item.value; $refs.fileInfoDialog.$data.dialog = true;"
      >
        mdi-pencil
      </v-icon>
    </template>
  </v-data-table-virtual>
  <file-info-dialog ref="fileInfoDialog" :file="file" :selectedFileVersion="selectedFileVersion" />
</template>

<script>
import { mapGetters } from 'vuex';
import FileInfoDialog from '@/components/FileInfoDialog.vue';

export default {
  name: "FileVersionsTable",
  components: { FileInfoDialog },
  props: {
    file: Object,
  },
  data: () => ({
    isFileInfoDialogActive: false,
    selectedFileVersion: null,
  }),
  computed: {
    ...mapGetters('app', ['currentOrganization']),
    headers: () => ([
      {
        title: 'Ref',
        align: 'start',
        sortable: true,
        key: '_id',
      },
      {
        title: 'Date',
        align: 'start',
        sortable: true,
        key: 'createdAt',
      },
      {
        title: 'Who',
        align: 'start',
        sortable: true,
        key: 'userId',
      },
      {
        title: 'Message',
        align: 'start',
        sortable: true,
        key: 'message',
      },
      {
        title: 'Active',
        align: 'start',
        sortable: true,
        key: 'active',
      },
      {
        title: 'Actions',
        align: 'end',
        key: 'actions',
        sortable: false
      },
    ])
  },
  methods: {
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
    getUserLabel(userId) {
      return userId.substr(-6);
    },
    refLabel(refId) {
      return refId.substr(-6);
    }
  }
}
</script>

<style scoped>

</style>
