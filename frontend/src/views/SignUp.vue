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
      <v-form v-model="isValid" ref="form" @submit.prevent="signUp">
        <v-text-field
          v-model="user.email"
          label="Email"
          :rules="[rules.isRequired, rules.isEmail, rules.extraHint]"
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

        <v-text-field
          v-model="usernameTemp"
          label="Username"
          :rules="[rules.isRequired, rules.nameConforms, rules.extraHint]"
          :disabled="isCreatePending"
        ></v-text-field>

        <v-card class="mx-auto" color="primary" variant="outlined">
          <v-card-text v-if="user.username">
            <span class="font-weight-bold">{{user.username}}</span>
          </v-card-text>
          <v-card-text v-else>
            <span class="font-italic">no username yet</span>
          </v-card-text>
        </v-card>

        <v-checkbox
          v-model="agreeToTOS"
          :rules="[rules.confirmTOS]"
          :disabled="isCreatePending"
          density="compact"
        >
          <template v-slot:label>
            <div>
              I understand
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <a
                    v-bind="props"
                    @click.stop="tosDialog = true"
                  >
                    <span class="font-weight-medium text-decoration-underline text-black">
                      Terms of Service
                    </span>
                  </a>
                </template>
                Click to read Terms of Service
              </v-tooltip>
            </div>
          </template>
        </v-checkbox>

        <v-checkbox
          v-model="agreeToPrivacyPolicy"
          :rules="[rules.confirmPP]"
          :disabled="isCreatePending"
          density="compact"
        >
          <template v-slot:label>
            <div>
              I understand
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <a
                    v-bind="props"
                    @click.stop="ppDialog = true"
                  >
                    <span class="font-weight-medium text-decoration-underline text-black">
                      Privacy Policy
                    </span>
                  </a>
                </template>
                Click to read Privacy Policy
              </v-tooltip>
            </div>
          </template>

        </v-checkbox>

        <v-card-actions>
          <v-btn type="submit" :disabled="isCreatePending" block class="mt-2" color="primary">Submit</v-btn>
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
          <div v-html='tosMarkdown' class="pa-3"></div>
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
          <div v-html='ppMarkdown' class="pa-3"></div>
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
import {marked} from "marked";
import {conformName} from "@/usernameFunctions";

export default {
  name: 'SignUp',
  components: { },
  data() {
    return {
      result: {},
      user: new models.api.User(),
      usernameTemp: '',
      acceptAgreement: new models.api.AcceptAgreement(),
      confirmPassword: '',
      isValid: false,
      snackerMsg: '',
      rules: {
        isEmail: v => /^\S+@\S+\.\S+$/.test(v) || 'Invalid Email address',
        isRequired: v => !!v || 'This field is required',
        minCharacter: v => (v && v.length >= 8) || 'Minimum 8 characters',
        confirmPassword: v => v === this.user.password || 'Password must match',
        confirmTOS: v => v || 'Terms of Service must be understood',
        confirmPP: v => v || 'Privacy Policy must be understood',
        nameConforms: v => this.conformNameCheck(v),
        extraHint: v => this.extraHintCheck(v),
      },
      agreeToTOS: false,
      agreeToPrivacyPolicy: false,
      showSnacker: false,
      tosDoc: {},
      tosMarkdown: '',
      tosDialog: false,
      ppDoc: {},
      ppMarkdown: '',
      ppDialog: false,
      extraHintContent: '',
      lastBadUsername: '',
      lastBadEmail: '',
    }
  },
  computed: {
    User: () => models.api.User,
    ...mapState('users', ['isCreatePending']),
  },
  methods: {
    ...mapActions('auth', ['authenticate']),
    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async signUp() {
      if (this.isValid) {
        await this.user.create()
          .then(async () => {
            // post agreement to TOS
            this.acceptAgreement.userId = this.user._id;
            this.acceptAgreement.category = 'terms-of-service';
            this.acceptAgreement.version = this.tosDoc.current.version;
            this.acceptAgreement.newAccount = true;
            await this.acceptAgreement.create();
            await this.sleep(200);  // wait for mongodb to distribute
            await this.login(); // now use the new db data
            this.$router.push({name: 'PendingVerification'}).then(() => { this.$router.go() })
          })
          .catch((e) => {
            if (e.message === 'Invalid: Username already taken') {
              this.extraHintContent = 'username already taken';
              this.lastBadUsername = this.usernameTemp;
              this.$refs.form.validate();
            }
            if (e.message === 'Invalid: Email already taken') {
              this.extraHintContent = 'email already taken';
              this.lastBadEmail = this.user.email;
              this.$refs.form.validate();
            }
            console.log(e.message);
            this.snackerMsg = e.message;
            this.showSnacker = true;
          });
      }
    },
    async login() {
      await this.authenticate({
        strategy: 'local',
        ...this.user,
      }).then(() => {
      }).catch((e) => {
        console.log(e.message);
        // do nothing if it fails; it is quite possible that the new user has not fully distributed into
        // MongoDB given the short turn around. This becomes more likely as we get bigger.
      })
    },
    conformNameCheck(rawName) {
      const conformedName = conformName(rawName);
      this.user.username = conformedName;
      if (conformedName.length < 4) {
        return "requires at least 4 characters in derived username";
      }
      return true;
    },
    extraHintCheck(newRawString) {
      if (this.extraHintContent === '') {
        return true;
      }
      if (this.lastBadUsername === newRawString) {
        return this.extraHintContent;
      }
      if (this.lastBadEmail === newRawString) {
        return this.extraHintContent;
      }
      return true;
    }
  },
  created() {
    models.api.Agreements.find({
      query: {category: 'terms-of-service'}
    }).then(response => {
        this.tosDoc = (response.data.length > 0) ? response.data[0] : {current:{markdownContent: 'doc missing'}};
        this.tosMarkdown =  marked.parse(this.tosDoc.current.markdownContent);
    });
    models.api.Agreements.find({
      query: {category: 'privacy-policy'}
    }).then(response => {
      this.ppDoc = (response.data.length > 0) ? response.data[0] : {current:{markdownContent: 'doc missing'}};
      this.ppMarkdown =  marked.parse(this.ppDoc.current.markdownContent);
    });
  },
}
</script>

<style scoped>

</style>
