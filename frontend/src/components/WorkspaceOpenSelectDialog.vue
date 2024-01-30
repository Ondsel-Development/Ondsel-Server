<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Change Visibility</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="workspaceNameDescDialogForm" @submit.prevent="isPatchPending">
        <v-card-text>
          <v-radio-group
            label="Should Workspace Be Seen By The General Public"
            v-model="newOpenSelect"
            :disabled="isPatchPending"
          >
            <v-radio label="Visible to Public (true)" value="true"></v-radio>
            <v-radio label="Not Visible (false)" value="false"></v-radio>
          </v-radio-group>
        </v-card-text>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn @click="doOpenSelectChange()" color="primary" :disabled="isPatchPending">Change</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import { models } from '@feathersjs/vuex';
import { mapState } from 'vuex';

const { Workspace } = models.api;

export default {
  name: 'workspaceOpenSelectDialog',
  props: {
    workspace: {}
  },
  created() {
  },
  data: () => ({
    dialog: false,
    rules: {
      isRequired: v => !!v || 'This field is required',
    },
    snackerMsg: '',
    showSnacker: false,
    newOpenSelect: "false",
  }),
  computed: {
    ...mapState('workspaces', ['isPatchPending']),
  },
  methods: {
    async doOpenSelectChange() {
      await Workspace.patch(
        this.workspace._id,
        {
          open: this.newOpenSelect === "true",
        }
      ).then(() => {
        this.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        console.log(msg);
      });
    }
  },
}
</script>

<style scoped>
</style>
