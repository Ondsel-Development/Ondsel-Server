<template>
  <v-container>
    <h1 class="text-h5 font-weight-bold mb-2">Account Profile</h1>

    <v-card
      variant="flat"
      :border="true"
      class="mx-auto my-6"
    >
      <v-list lines="three">
        <v-list-subheader class="mb-2">Public</v-list-subheader>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Screen Name</v-list-item-title>
          <v-list-item-subtitle>
            tbd
          </v-list-item-subtitle>
<!--            <template #append>-->
<!--              <v-list-item-action>-->
<!--                <v-btn variant="outlined" color="default" size="small" @click="isChangeNameDialogShown = true">-->
<!--                  Edit Name-->
<!--                </v-btn>-->
<!--              </v-list-item-action>-->
<!--            </template>-->
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
            {{ user.firstName }} {{ user.lastName }}
          </v-list-item-subtitle>
          <!--            <template #append>-->
          <!--              <v-list-item-action>-->
          <!--                <v-btn variant="outlined" color="default" size="small" @click="isChangeNameDialogShown = true">-->
          <!--                  Edit Name-->
          <!--                </v-btn>-->
          <!--              </v-list-item-action>-->
          <!--            </template>-->
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Email</v-list-item-title>
          <v-list-item-subtitle>
            {{ user.email }}
          </v-list-item-subtitle>
          <!-- <template v-slot:append>
               <v-list-item-action>
                  <v-btn>Change Email</v-btn>
              </v-list-item-action>
          </template> -->
        </v-list-item>

        <v-divider />
        <v-list-item>
          <v-list-item-title>Password</v-list-item-title>
          <v-list-item-subtitle>
            **********
          </v-list-item-subtitle>
          <!--          <template #append>-->
          <!--            <v-list-item-action>-->
          <!--              <v-btn variant="outlined" color="default" size="small" @click="isChangePasswordDialogShown = true">-->
          <!--                Change Password-->
          <!--              </v-btn>-->
          <!--            </v-list-item-action>-->
          <!--          </template>-->
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
              <v-btn variant="outlined" color="default" size="small" @click="gotoChooseTier()">
                Choose New Tier
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>

      </v-list>
    </v-card>
  </v-container>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {SubscriptionTypeMap} from "@/store/services/users";

export default {
  name: 'AccountProfile',
  data() {
    return {
    }
  },
  computed: {
    SubscriptionTypeMap() {
      return SubscriptionTypeMap
    },
    User: () => models.api.User,
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
  },
  methods: {
    gotoChooseTier() {
      this.$router.push({name: 'ChooseTier'});
    },
  }
}
</script>

<style scoped>

</style>
