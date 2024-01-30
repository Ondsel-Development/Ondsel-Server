<template>
  <v-dialog
    v-model="showDialog"
    width="auto"
    persistent
  >
    <v-card width="500" max-height="800">
      <template v-slot:title>
        <div class="text-center">Represent Workspace With This File?</div>
      </template>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        <p>Do you want <b>{{ file.custFileName }}</b> to represent this workspace?</p>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn :disabled="isPatchPending" @click="cancelRepresent">Cancel</v-btn>
        <v-btn color="primary" :loading="isPatchPending" @click="representAction(true)">Yes</v-btn>
        <v-btn color="primary" :loading="isPatchPending" @click="representAction(false)">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapState } from 'vuex'
import { models } from '@feathersjs/vuex';

const {Workspace} = models.api;

export default {
  name: 'RepresentWorkspaceDialog',
  props: {
    file: {
      type: Object,
      required: true
    },
    workspace: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showDialog: false
    };
  },
  computed: {
    ...mapState('workspaces', ['isPatchPending']),
  },
  methods: {
    async representAction(shouldRepresent) {
      const fileId = shouldRepresent ? this.file._id.toString() : ""
      await Workspace.patch(
        this.workspace._id,
        {
          shouldRepresentWorkspaceWithFile: true,
          representativeFileId: fileId,
        }
      ).then(() => {
        this.showDialog = false;
      }).catch((e) => {
        console.log(e);
      })
    },
    cancelRepresent() {
      this.showDialog = false;
    },
    openRepresentWorkspaceDialog() {
      this.showDialog = true;
    }
  }
};
</script>
