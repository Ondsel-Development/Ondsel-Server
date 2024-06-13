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
      {{ refLabel(item._id) }}
    </template>
    <template v-slot:item.createdAt="{ item }">
      {{ dateFormat(item.createdAt) }}
    </template>
    <template v-slot:item.userRealName="{ item }">
      {{ getUserLabel(item.userId, file.relatedUserDetails) }}
    </template>
    <template v-slot:item.active="{ item }">
      <v-icon v-if="file.currentVersionId === item._id" icon="mdi-check"/>
    </template>
    <template v-slot:item.actions="{ item }">
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
    </template>
  </v-data-table-virtual>
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
        title: 'Committer',
        align: 'start',
        sortable: true,
        key: 'userRealName',
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
