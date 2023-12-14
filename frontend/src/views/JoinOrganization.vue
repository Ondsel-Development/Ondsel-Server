<template>
  <v-container fluid class="fill-height">
    <v-card
      v-if="orgInvite"
      :title="orgInvite.active ? 'Invitation' : 'Invitation Invalid'"
      class="mx-auto position-relative"
      width="600"
      style="top: -100px"
      flat
    >
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text v-if="orgInvite.active">
        <div class="text-body-1">
          You, <b>{{ user.name }}</b> (<i>{{ user.username }}</i>), are accepting an invitation to <b>{{ orgInvite.organization.name }}</b>.
        </div>
        <div class="text-body-1">
          Do you agree to this?
        </div>
      </v-card-text>
      <v-card-actions v-if="orgInvite.active">
        <v-btn
          variant="plain"
          color="red"
          :disabled="isPatchPending"
          @click="rejectInvite"
        >Reject</v-btn>
        <v-btn
          variant="outlined"
          color="primary"
          :disabled="isPatchPending"
          @click="acceptInvite"
        >Accept</v-btn>

      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

const { OrgInvite } = models.api;

export default {
  name: "JoinOrganization",
  async created() {
    await OrgInvite.get(this.$route.params.id);
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('org-invites', ['isPatchPending']),
    orgInvite: vm => OrgInvite.getFromStore(vm.$route.params.id),
  },
  methods: {
    async acceptInvite() {
      await OrgInvite.patch(
        this.orgInvite._id,
        {
          state: "verifyOrgInviteEmail",
          passedTokenConfirmation: this.$route.params.token,
          result: {
            note: `On web interface, user ${this.user.name} (${this.user.username}) accept invite to ${this.orgInvite.organization.name}.`
          }
        }
      )
      this.$router.push({ name: 'OrganizationWorkspaces', params: { orgName: this.orgInvite.organization.name } });
    },
    async rejectInvite() {
      await OrgInvite.patch(
        this.orgInvite._id,
        {
          state: "cancelOrgInvite",
          result: {
            note: `On web interface, user ${this.user.name} (${this.user.username}) cancelled invite of ${this.orgInvite.organization.name}.`
          }
        }
      )
    }
  }
}
</script>

<style scoped>

</style>
