<template>
  <v-container fluid class="fill-height">
    <v-card class="mx-auto" width="896" flat>
      <v-card-title>Verify Email</v-card-title>
      <v-card-text>
        <p>Login here to finish email verification.</p>
        <p>token: {{ token }}</p>
        <p>uid: {{ uid }}</p>
        <v-container width="400" style="top: -100px" flat>
          <v-form v-model="isValid" @submit.prevent="login">
            <v-text-field
              v-model="user.email"
              label="Email"
              :rules="[rules.isRequired, rules.isEmail]"
              autofocus
            ></v-text-field>

            <v-text-field
              v-model="user.password"
              label="Password"
              type="password"
              :rules="[rules.isRequired]"
            ></v-text-field>

            <v-card-actions>
              <v-btn type="submit" block class="mt-2">Submit</v-btn>
            </v-card-actions>
          </v-form>
        </v-container>
        <v-snackbar
          :timeout="2000"
          v-model="showSnacker"
        >
          {{ snackerMsg }}
        </v-snackbar>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import {mapActions} from "vuex";
import {models} from "@feathersjs/vuex";
import {resetStores} from "@/store";

export default {
  name: 'VerifyEmail',
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
      token: this.$route.params.token,
      uid: this.$route.params.uid,
    }
  },
  computed: {
    User: () => models.api.User,
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
          this.$router.push({ name: 'ChooseTier' })
        }).catch(() => {
          this.showSnacker = true;
          this.snackerMsg = "Invalid login"
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
