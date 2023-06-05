<template>
  <v-container fluid class="fill-height">
    <v-card title="Sign Up to Ondsel" class="mx-auto" width="400" flat>
      <template v-slot:loader="{ isActive }">
        <v-progress-linear
          :active="isCreatePending"
          height="4"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-form v-model="isValid" @submit.prevent="signUp" @keydown.prevent.enter>
        <v-text-field
          v-model="user.email"
          label="Email"
          :rules="[rules.isRequired, rules.isEmail]"
          :disabled="isCreatePending"
        ></v-text-field>

        <v-text-field
          v-model="user.firstName"
          label="First name"
          :rules="[rules.isRequired]"
          :disabled="isCreatePending"
        ></v-text-field>

        <v-text-field
          v-model="user.lastName"
          label="Last name"
          :rules="[rules.isRequired]"
          :disabled="isCreatePending"
        ></v-text-field>

        <v-text-field
          v-model="user.password"
          type="password"
          label="Password"
          :rules="[rules.isRequired, rules.minCharacter]"
          :disabled="isCreatePending"
        ></v-text-field>

        <v-text-field
          v-model="confirmPassword"
          type="password"
          label="Confirm Password"
          :rules="[rules.isRequired, rules.confirmPassword]"
          :disabled="isCreatePending"
        ></v-text-field>
        <v-card-actions>
        <v-btn type="submit" :disabled="isCreatePending" block class="mt-2">Submit</v-btn>
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
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

export default {
  name: 'SignUp',
  data() {
    return {
      result: {},
      user: new models.api.User(),
      confirmPassword: '',
      isValid: false,
      snackerMsg: '',
      rules: {
        isEmail: v => /.+@.+/.test(v) || 'Invalid Email address',
        isRequired: v => !!v || 'This field is required',
        minCharacter: v => (v && v.length >= 8) || 'Minimum 8 characters',
        confirmPassword: v => v === this.user.password || 'Password must match',
      },
      showSnacker: false
    }
  },
  computed: {
    User: () => models.api.User,
    ...mapState('users', ['isCreatePending']),
  },
  methods: {
    async signUp() {
      if (this.isValid) {
        await this.user.create()
          .then(() => {
            this.$router.push({name: 'Login'})
          })
          .catch((e) => {
            this.snackerMsg = e.message;
            this.showSnacker = true;
          });
      }
    }
  }
}
</script>

<style scoped>

</style>
