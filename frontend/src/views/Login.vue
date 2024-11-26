<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <Main>
    <template #title>
    </template>
    <template #content>
      <v-sheet
        class="d-flex flex-column flex-wrap justify-center align-center"
      >
        <v-card color="indigo-darken-3">
          <v-card-title>Shutdown Notice</v-card-title>
          <v-card-text>
            <h1>Service is Shutting Down as of November 22nd, 2024</h1>
            <h2>Please download any of your files that you want to keep!</h2>
          </v-card-text>
        </v-card>
        <p></p>
        <v-card title="Login to Ondsel" width="26em" class="pa-2 mt-16">
          <v-card-text>
            <template v-slot:loader="{ isActive }">
              <v-progress-linear
                :active="isAuthenticatePending"
                height="4"
                indeterminate
              ></v-progress-linear>
            </template>
            <v-form v-model="isValid" @submit.prevent="login">
              <v-text-field
                v-model="user.email"
                label="Email"
                :rules="[rules.isRequired, rules.isEmail]"
                :disabled="isAuthenticatePending"
                autofocus
              ></v-text-field>

              <v-text-field
                v-model="user.password"
                label="Password"
                type="password"
                :rules="[rules.isRequired]"
                :disabled="isAuthenticatePending"
              ></v-text-field>

              <v-row>
                <v-btn
                  type="submit"
                  v-bind:disabled="isAuthenticatePending"
                  color="primary"
                  variant="elevated"
                  class="ml-4"
                >Submit</v-btn>
              </v-row>

              <v-row justify="end">
                <v-col class="text-right">
                  <v-btn
                    size="x-small"
                    color="secondary"
                    variant="elevated"
                    @click.stop="openForgotPasswordDialog()">
                    Forgot Password?
                  </v-btn>
                  <v-spacer></v-spacer>
                  <ForgotPasswordDialog
                    :is-active="isForgotPasswordDialogActive"
                    ref="forgotPasswordDialog"
                  />
                </v-col>
              </v-row>
            </v-form>
            <v-snackbar
              :timeout="2000"
              v-model="showSnacker"
            >
              {{ snackerMsg }}
            </v-snackbar>
          </v-card-text>
        </v-card>
        <v-card
          width="26em"
          class="pa-2 mx-2"
          v-if="isRedirectedFromDownloadPage"
        >
          <v-card-title>...redirect from download page</v-card-title>
          <v-card-text>
            <p>&nbsp;</p>
            <p>
              You have been redirected from the Download & Explore page. To reach that page, you must be logged in.
            </p>
            <p>&nbsp;</p>
            <p>
              If you don’t have an account, visit <v-btn density="compact" class="mx-2" color="blue" variant="tonal" :to="{ name: 'SignUp' }">Signup</v-btn> to create a new account
            </p>
            <p>&nbsp;</p>
            <p>
              If you <b>do</b> have an account, just login using the form on the left. You will then be automatically sent to the page.
            </p>
          </v-card-text>
        </v-card>
      </v-sheet>
    </template>
  </Main>
</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex';
import { models } from '@feathersjs/vuex';
import { resetStores } from '@/store';
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog.vue";
import Main from '@/layouts/default/Main.vue';


export default {
  name: 'Login',
  components: {ForgotPasswordDialog, Main},
  data() {
    return {
      result: {},
      user: {
        email: '',
        password: '',
      },
      isValid: false,
      rules: {
        isEmail: v => /.+@.+/.test(v) || 'Invalid Email address',
        isRequired: v => !!v || 'This field is required',
      },
      snackerMsg: '',
      showSnacker: false,
      isForgotPasswordDialogActive: false,
      isRedirectedFromDownloadPage: false,
    }
  },
  computed: {
    User: () => models.api.User,
    ...mapState('auth', ['isAuthenticatePending']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
  },
  mounted() {
    resetStores();
    if (this.$route.query.redirect_uri) {
      if (this.$route.query.redirect_uri.endsWith('/download-and-explore')) {
        this.isRedirectedFromDownloadPage = true;
      }
    }
  },
  methods: {
    ...mapActions('auth', ['authenticate']),
    async login() {
      if ( this.isValid ) {
        await this.authenticate({
          strategy: 'local',
          ...this.user,
        }).then(({ user }) => {
          if (this.$route.query.redirect_uri) {
            window.open(this.$route.query.redirect_uri, '_self');
            return;
          }
          if (this.userCurrentOrganization) {
            if (this.userCurrentOrganization.type === 'Personal') {
              this.$router.push({ name: 'UserWorkspaces', params: { id: user.username } });
            } else {
              this.$router.push({ name: 'OrganizationWorkspaces', params: { id: this.userCurrentOrganization.refName } });
            }
          } else {
            this.$router.push({ name: 'UserWorkspaces', params: { id: user.username } });
          }
        }).catch((e) => {
          this.showSnacker = true;
          this.snackerMsg = `Invalid login`;
          console.log(e);
        })
      }
    },
    openForgotPasswordDialog() {
      this.isForgotPasswordDialogActive = true;
      this.$refs.forgotPasswordDialog.$data.dialog = true;
    },

  }
}
</script>

<style scoped>

</style>
