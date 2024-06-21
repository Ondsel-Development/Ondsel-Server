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
              v-for="item in publicTableData"
              :key="item.name"
            >
              <td style="text-align: right">{{ item.name }}</td>
              <td>{{ item.value }}</td>
            </tr>
            <tr
              v-for="item in privateTableData"
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
          :disabled="!canUserWrite || (sharedModel.isSystemGenerated && !user.constraint.canDisableAutomaticGenerationOfPublicLink)"
          :loading="isPatchPending"
          @click="toggleEnableDisable()"
        >Enable/Disable</v-btn>
        <v-btn
          v-if="!publicView"
          color="error"
          variant="elevated"
          :disabled="!canUserWrite || (sharedModel.isSystemGenerated && !user.constraint.canDisableAutomaticGenerationOfPublicLink)"
          :loading="isPatchPending"
          @click="deleteSharedModel()"
        >Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import {mapActions, mapState} from 'vuex';
import {models} from "@feathersjs/vuex";

const { SharedModel } = models.api;

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
    sharedModel: {},
    protectionDesc: {
      'Listed': 'Open to all; Listed in Search System',
      'Unlisted': 'Open to all; But viewer needs to know the URL',
      'Pin': 'Viewer needs to know PIN number',
      'Direct': 'Only visible to specific Ondsel user(s)',
    },
    versionFollowingDesc: {
      'Locked': 'Locked to a specific version of the file',
      'Active': 'Shows the current (Active) version of the file',
    },
    privateTableData: [],
  }),
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('shared-models', ['isPatchPending']),
    publicTableData: (vm) => ([
      {
        name: 'Enabled',
        value: vm.sharedModelSummary.isActive === undefined ? "?" : vm.sharedModelSummary.isActive,
      },
      {
        name: 'Description',
        value: vm.sharedModelSummary.description || '<no desc>',
      },
      {
        name: 'Link Creation',
        value: vm.sharedModelSummary.createdAt ? (new Date(vm.sharedModelSummary.createdAt)).toLocaleString() : "?",
      },
      {
        name: 'Distribution (Protection)',
        value: `[${vm.sharedModelSummary.protection}] ` + (vm.sharedModelSummary.protection ? vm.protectionDesc[vm.sharedModelSummary.protection] : "?"),
      },
      {
        name: 'Version Handling',
        value: `[${vm.sharedModelSummary.versionFollowing}] ` + (vm.sharedModelSummary.versionFollowing ? vm.versionFollowingDesc[vm.sharedModelSummary.versionFollowing] : "?"),
      },
    ])
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic']),
    async privateRefresh() {
      let ptd = []
      if (this.canUserWrite && !this.publicView) {
        this.sharedModel = await SharedModel.get(this.sharedModelSummary._id);
        if (this.sharedModel) {
          const user = await this.getUserByIdOrNamePublic(this.sharedModel.userId);
          ptd.push({
            name: 'Creator',
            value: `${user.name} [${user.username}]`,
          });
        }
      }
      this.privateTableData = ptd;
    },
    async toggleEnableDisable() {
      if (this.canUserWrite && !this.publicView) {
        await SharedModel.patch(
          this.sharedModel._id,
          {
            isActive: !this.sharedModel.isActive,
          }
        )
        await this.changedFile();
        this.dialog = false;
      }
    },
    async deleteSharedModel() {
      await SharedModel.remove(this.sharedModel._id);
      await this.changedFile();
      this.dialog = false;
    },
    async changedFile() {
      this.$emit('changedFile');
    },
  },
  watch: {
    async sharedModelSummary() {
      await this.privateRefresh()
    }
  }
}
</script>

<style scoped>

</style>
