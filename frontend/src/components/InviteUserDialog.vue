<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        <div class="text-center">Create Invite to <b>{{ organization.name }}</b></div>
      </template>
      <v-progress-linear
        :active="isCreatePending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form ref="form" @submit.prevent="inviteUser">
        <v-card-text>
          <v-alert
            v-if="label"
            :type="label.type"
            variant="outlined"
            class="mb-2"
          >
            {{ label.msg }}
          </v-alert>
          <v-text-field
            v-model.trim="email"
            label="Email"
            hint="Enter invite user email"
            :disabled="isCreatePending"
            :rules="[rules.isEmail]"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            v-if="label && label.type === 'success'"
            color="cancel"
            elevated
            @click="dialog = false;"
          >Close</v-btn>
          <template v-else>
            <v-btn
              color="cancel"
              elevated
              @click="dialog = false;"
            >Cancel</v-btn>
            <v-btn
              type="submit"
              color="primary"
              elevated
              :disabled="isCreatePending"
            >Send</v-btn>
          </template>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';
import { models } from "@feathersjs/vuex";

const { OrgInvite } = models.api;

export default {
  name: "InviteUserDialog",
  props: {
    organization: Object,
  },
  data: () => ({
    dialog: false,
    email: '',
    rules: {
      isEmail: v => /^\S+@\S+\.\S+$/.test(v) || 'Invalid Email address',
    },
    label: undefined,
  }),
  computed: {
    ...mapState('org-invites', ['isCreatePending']),
  },
  methods: {
    async inviteUser() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }

      try {
        await OrgInvite.create({
          state: "sendOrgInviteEmail",
          toEmail: this.email,
          organization: {
            _id: this.organization._id,
            name: this.organization.name,
            refName: this.organization.refName,
          }
        });
        this.label = {
          type: 'success',
          msg: `Invitation successfully sent to ${this.email}`
        }
      } catch (e) {
        this.label = {
          type: 'error',
          msg: 'Internal Server error'
        }
      }
    },
    openDialog() {
      this.email = '';
      this.label = undefined;
      this.dialog = true;
    }
  }
}
</script>

<style scoped>

</style>
