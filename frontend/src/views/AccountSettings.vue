<template>
  <v-container>
    <h1 class="text-h5 font-weight-bold mb-2">Account Settings</h1>

    <v-card
      variant="flat"
      :border="true"
      class="mx-auto my-6"
    >
      <v-list lines="three">
        <v-list-subheader class="mb-2">Public</v-list-subheader>

        <v-divider />
        <v-list-item>
          <v-list-item-title>User Name</v-list-item-title>
          <v-list-item-subtitle>
            {{ user.username }}
          </v-list-item-subtitle>
        </v-list-item>

      </v-list>
    </v-card>
    <v-card
      variant="flat"
      :border="true"
      class="mx-auto my-6"
    >
      <v-list lines="three">
        <v-list-subheader class="mb-2">Private</v-list-subheader>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Name</v-list-item-title>
          <v-list-item-subtitle>
            {{ user.name }}
          </v-list-item-subtitle>
<!--          <template #append>-->
<!--            <v-list-item-action>-->
<!--              <v-btn variant="outlined" color="default" size="small">-->
<!--                Change Name-->
<!--              </v-btn>-->
<!--            </v-list-item-action>-->
<!--          </template>-->
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Email</v-list-item-title>
          <v-list-item-subtitle>
            {{ user.email }}
            <v-chip v-if="user.isVerified">Verified</v-chip>
            <v-chip v-else color="red" text-color="white">Not Verified</v-chip>
          </v-list-item-subtitle>
          <template #append>
            <v-list-item-action v-if="!user.isVerified">
              <v-btn
                variant="outlined"
                color="default"
                size="small"
                @click.stop="openVerifyEmailDialog()"
              >
                Resend Verification
              </v-btn>
              <v-spacer></v-spacer>
              <VerifyEmailDialog
                :is-active="isVerifyEmailDialogActive"
                :user="user"
                ref="verifyEmailDialog"
              />
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Password</v-list-item-title>
          <v-list-item-subtitle>
            **********
          </v-list-item-subtitle>
          <template #append>
            <v-list-item-action v-if="user.isVerified">
              <v-btn
                variant="outlined"
                color="default"
                size="small"
                @click.stop="openResetPasswordDialog()"
                :disabled="loggedInUser.user.tier===SubscriptionTypeMap.unverified"
              >
                Reset Password
              </v-btn>
              <v-spacer></v-spacer>
              <ResetPasswordDialog
                :is-active="isResetPasswordDialogActive"
                :user="user"
                ref="resetPasswordDialog"
              />
            </v-list-item-action>
          </template>
        </v-list-item>

      </v-list>
    </v-card>
    <v-card
      variant="flat"
      :border="true"
      class="mx-auto my-6"
    >
      <v-list lines="three">
        <v-list-subheader class="mb-2">Account</v-list-subheader>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Current Tier</v-list-item-title>
          <v-list-item-subtitle>
            {{ user.fullTierName }}
          </v-list-item-subtitle>
          <template #append>
            <v-list-item-action>
              <v-btn
                variant="outlined"
                color="default"
                size="small"
                @click="gotoChooseTier()"
                :disabled="loggedInUser.user.tier===SubscriptionTypeMap.unverified"
              >
                Choose New Tier
              </v-btn>
            </v-list-item-action>
            <v-list-item-action>
              <v-btn variant="outlined" color="default" size="small" @click="gotoAccountHistory()">
                View Account History
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Remaining Models</v-list-item-title>
          <v-list-item-subtitle>
            {{ remainingFiles }}
          </v-list-item-subtitle>
        </v-list-item>

      </v-list>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {SubscriptionTypeMap} from "@/store/services/users";
import ResetPasswordDialog from "@/components/ResetPasswordDialog.vue";
import ShareLinkDialog from "@/components/ShareLinkDialog.vue";
import VerifyEmailDialog from "@/components/VerifyEmailDialog.vue";

const { Model, User } = models.api;

export default {
  name: 'AccountSettings',
  components: {VerifyEmailDialog, ShareLinkDialog, ResetPasswordDialog},
  data() {
    return {
      isResetPasswordDialogActive: false,
      isVerifyEmailDialogActive: false,
      remainingFiles: "processing..."
    }
  },
  computed: {
    // resetPassword() {
    //   return resetPassword
    // },
    SubscriptionTypeMap() {
      return SubscriptionTypeMap
    },
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
  },
  async mounted() {
    await this.getRemainingFiles();
  },
  methods: {
    gotoChooseTier() {
      this.$router.push({name: 'ChooseTier'});
    },
    gotoAccountHistory() {
      this.$router.push({name: 'AccountHistory', params: {username: this.user.username}});
    },
    async getRemainingFiles() {
      const models = await Model.find({query: {userId: this.user._id, isSharedModel: false}})
      this.remainingFiles = this.user.calculateRemainingModels(models.data.length);
    },
    openResetPasswordDialog() {
      this.isResetPasswordDialogActive = true;
      this.$refs.resetPasswordDialog.$data.dialog = true;
    },
    openVerifyEmailDialog() {
      this.isVerifyEmailDialogActive = true;
      this.$refs.verifyEmailDialog.$data.dialog = true;
    },
  }
}
</script>

<style scoped>

</style>
