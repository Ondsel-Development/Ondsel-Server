<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Delete Organization</div>
      </template>
      <v-progress-linear
        :active="pendingDeleteOrg"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="deleteOrgDialogForm" @submit.prevent="pendingDeleteOrg">
        <v-card-text>
          <v-card>
            <v-card-subtitle><b>WARNING: Once an organization has been deleted, you cannot un-delete it.</b></v-card-subtitle>
            <v-card-text>
              <p>Before an organization can be deleted, the following conditions must be met:</p>
              <ul>
                <li>Only the Owner of the organization can do the deletion.</li>
                <li>All the users must be removed (except the owner).</li>
                <li>All the workspaces must be removed.</li>
              </ul>
            </v-card-text>
          </v-card>
          <v-text-field
            v-model.trim="copyOfName"
            label="Enter the full name of your organization below to confirm your intent to delete."
            hint="Enter the organization's full name to confirm"
            :rules="[rules.isRequired]"
            :disabled="pendingDeleteOrg"
          ></v-text-field>
        </v-card-text>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          @click="doDeleteOrg()"
          color="primary"
          variant="elevated"
          :disabled="pendingDeleteOrg"
        >Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {models} from "@feathersjs/vuex";
import {mapActions, mapState} from "vuex";
const { Organization } = models.api;
export default {
  name: 'deleteOrgDialog',
  props: {
    org: {}
  },
  created() {
  },
  data: () => ({
    pendingDeleteOrg: false,
    dialog: false,
    rules: {
      isRequired: v => !!v || 'This field is required',
    },
    snackerMsg: '',
    showSnacker: false,
    copyOfName: '',
  }),
  computed: {
    ...mapState('auth', ['user']),
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization']),
    async doDeleteOrg() {
      this.copyOfName = this.copyOfName.trim();
      const { valid } = await this.$refs.deleteOrgDialogForm.validate();
      if (!valid) {
        return;
      }
      if (this.copyOfName !== this.org.name) {
        this.snackerMsg = "Does not match org name"
        this.showSnacker = true;
        return;
      }
      this.pendingDeleteOrg = true;
      await Organization.remove(
        this.org._id
      ).then(() => {
        this.dialog = false;
        this.setCurrentOrganization(this.user.personalOrganization);
        this.$router.push({ name: 'LensHome' });
      }).catch((e) => {
        const msg = e.message;
        if (e.name === "BadRequest") {
          this.snackerMsg = msg;
          this.showSnacker = true;
        }
      });
      this.pendingDeleteOrg = false;
    },
  },
}
</script>
<style scoped>
</style>
