<template>
  <v-container fluid class="fill-height">
    <v-card title="Login to Ondsel" class="mx-auto position-relative" width="400" style="top: -100px" flat>
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

        <v-card-actions>
        <v-btn type="submit" v-bind:disabled="isAuthenticatePending" block class="mt-2">Submit</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
    <v-snackbar
      :timeout="2000"
      v-model="showSnacker"
    >
      {{ snackerMsg }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { models } from '@feathersjs/vuex';
import { resetStores } from '@/store';

export default {
  name: 'Login',
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
      showSnacker: false
    }
  },
  computed: {
    User: () => models.api.User,
    ...mapState('auth', ['isAuthenticatePending']),
  },
  mounted() {
    resetStores();
  },
  methods: {
    ...mapActions('auth', ['authenticate']),
    async login() {
      if ( this.isValid ) {
        await this.authenticate({
          strategy: 'local',
          ...this.user,
        }).then(() => {
          this.$router.push({ name: 'Models' })
        }).catch((e) => {
          if (e.message.startsWith('AEV')) { // AEV = Awaiting Email Verification
            this.$router.push({ name: 'PendingVerification' })
          } else {
            this.showSnacker = true;
            this.snackerMsg = `Invalid login`
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
