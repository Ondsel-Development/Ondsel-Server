<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="500" max-height="800">
      <v-card-text>
        <div class="text-body-2" style="text-align: center">
          /share/{{sharedModelSummary._id}}
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
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          v-if="!publicView"
          color="secondary"
          variant="elevated"
          :disabled="!canUserWrite"
          :loading="isPatchPending"
        >Enable/Disable</v-btn>
        <v-btn
          v-if="!publicView"
          color="error"
          variant="elevated"
          :disabled="!canUserWrite"
          :loading="isPatchPending"
        >Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import { mapState } from 'vuex';

export default {
  name: "SharedModelLinkActionDialog",
  emits: ['changedFile'],
  props: {
    canUserWrite: {
      type: Boolean,
      default: false,
    },
    publicView: Boolean,
  },
  data: () => ({
    dialog: false,
    sharedModelSummary: {},
  }),
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('shared-models', ['isPatchPending']),
    tableData: (vm) => ([
      {
        name: 'Enabled',
        value: vm.sharedModelSummary.isActive || "?",
      },
      {
        name: 'Description',
        value: vm.sharedModelSummary.description || '<no desc>',
      },
    ])
  },
  methods: {
    async changedFile() {
      this.$emit('changedFile');
    },
  }
}
</script>

<style scoped>

</style>
