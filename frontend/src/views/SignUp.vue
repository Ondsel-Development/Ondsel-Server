<template>
  <v-container fluid class="fill-height">
    <v-card title="Sign Up to Ondsel" class="mx-auto" width="400" flat>
      <template v-slot:loader="{  }">
        <v-progress-linear
          :active="isCreatePending"
          height="4"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-form v-model="isValid" @submit.prevent="signUp">
        <v-text-field
          v-model="user.email"
          label="Email"
          :rules="[rules.isRequired, rules.isEmail]"
          :disabled="isCreatePending"
          autofocus
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

        <v-checkbox
          v-model="agreeToTOS"
          label="I understand Terms of Service"
          :rules="[rules.confirmTOS]"
          :disabled="isCreatePending"
        ></v-checkbox>

        <v-btn block size="small" @click="tosDialog = true">
          View Terms of Service
        </v-btn>

        <v-checkbox
          v-model="agreeToPrivacyPolicy"
          label="I understand Privacy Policy"
          :rules="[rules.confirmPP]"
          :disabled="isCreatePending"
        ></v-checkbox>

        <v-btn block size="small" @click="ppDialog = true">
          View Privacy Policy
        </v-btn>

        <v-card-actions>
          <v-btn type="submit" color="primary" :disabled="isCreatePending">
            Submit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
    <v-snackbar
      :timeout="2000"
      v-model="showSnacker"
    >
      {{ snackerMsg }}
    </v-snackbar>
    <v-dialog
      v-model="tosDialog"
      width="auto"
    >
      <v-card>
        <v-card-title>{{ tosDoc.current.title }}</v-card-title>
        <v-card-subtitle>ver {{ tosDoc.current.version }}</v-card-subtitle>
        <v-card-text>
          <VueShowdown
            :markdown="tosDoc.current.markdownContent"
            flavor="github"
            :options="{ emoji: false }"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="tosDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="ppDialog"
      width="auto"
    >
      <v-card>
        <v-card-title>{{ ppDoc.current.title }}</v-card-title>
        <v-card-subtitle>ver {{ ppDoc.current.version }}</v-card-subtitle>
        <v-card-text>
          <VueShowdown
            :markdown="ppDoc.current.markdownContent"
            flavor="github"
            :options="{ emoji: false }"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="ppDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

</template>

<script>
import {mapActions, mapState} from 'vuex';
import { models } from '@feathersjs/vuex';

export default {
  name: 'SignUp',
  components: { },
  data() {
    return {
      result: {},
      user: new models.api.User(),
      acceptAgreement: new models.api.AcceptAgreement(),
      confirmPassword: '',
      isValid: false,
      snackerMsg: '',
      rules: {
        isEmail: v => /.+@.+/.test(v) || 'Invalid Email address',
        isRequired: v => !!v || 'This field is required',
        minCharacter: v => (v && v.length >= 8) || 'Minimum 8 characters',
        confirmPassword: v => v === this.user.password || 'Password must match',
        confirmTOS: v => v || 'Terms of Service must be understood',
        confirmPP: v => v || 'Privacy Policy must be understood',
      },
      agreeToTOS: false,
      agreeToPrivacyPolicy: false,
      showSnacker: false,
      tosDoc: {},
      tosDialog: false,
      ppDoc: {},
      ppDialog: false,
    }
  },
  computed: {
    User: () => models.api.User,
    ...mapState('users', ['isCreatePending']),
  },
  methods: {
    ...mapActions('auth', ['authenticate']),
    async signUp() {
      if (this.isValid) {
        this.user.agreeToTOS = undefined; // now that we have confirmed these, we should remove from 'user create`
        this.user.agreeToPrivacyPolicy = undefined;
        await this.user.create()
          .then(() => {
            // post agreement to TOS
            this.acceptAgreement.userId = this.user._id;
            this.acceptAgreement.category = 'terms-of-service';
            this.acceptAgreement.version = this.tosDoc.current.version;
            this.acceptAgreement.newAccount = true;
            this.acceptAgreement.create();
            this.authenticate({
              strategy: 'local',
              ...this.user,
            }).then(() => {
              // done. go to choose-tier page
              this.$router.push({name: 'ChooseTier'})
            }).catch(() => {
              this.showSnacker = true;
              this.snackerMsg = "Internal Error: invalid login after signup"
            })
          })
          .catch((e) => {
            this.snackerMsg = e.message;
            this.showSnacker = true;
          });
      }
    },
  },
  created() {
    models.api.Agreements.find({
      query: {category: 'terms-of-service'}
    }).then(response => {
        this.tosDoc = (response.data.length > 0) ? response.data[0] : {current:{markdownContent: 'doc missing'}};
    });
    models.api.Agreements.find({
      query: {category: 'privacy-policy'}
    }).then(response => {
      this.ppDoc = (response.data.length > 0) ? response.data[0] : {current:{markdownContent: 'doc missing'}};
    });
  },
}
</script>

<style scoped>

</style>
