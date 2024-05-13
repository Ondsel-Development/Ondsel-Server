<template>
  <v-container fluid class="fill-height">
    <v-card title="Create a new Organization" class="mx-auto position-relative" width="400" style="top: -100px" flat>
      <template v-slot:loader="{ isActive }">
        <v-progress-linear
          :active="isCreatePending"
          height="4"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-form v-model="isValid" ref="form" @submit.prevent="createOrganization">
        <v-select
          v-model="organization.type"
          label="Select Type of Organization"
          :rules="[rules.isRequired]"
          :items="orgTypeProperties"
          autofocus
        >
        </v-select>
        <v-text-field
          v-model="organization.name"
          label="Name"
          :rules="[rules.isRequired]"
          :disabled="false"
        ></v-text-field>
        <v-text-field
          v-model="nameTemp"
          label="organization slug name builder (type here)"
          :rules="[rules.isRequired, rules.nameConforms]"
          :disabled="isCreatePending"
        ></v-text-field>
        <v-spacer class="v-col-1"></v-spacer>
        <v-card class="w-100" color="primary" variant="outlined">
          <v-card-text v-if="organization.refName">
            <span class="font-weight-bold">{{organization.refName}}</span>
          </v-card-text>
          <v-card-text v-else>
            <span class="font-italic">no slug built yet</span>
          </v-card-text>
        </v-card>
        <v-card-actions class="justify-center">
          <v-btn
            color="cancel"
            variant="elevated"
            :disabled="isCreatePending"
            class="mt-2"
            @click="$router.go(-1)"
          >Go Back</v-btn>
          <v-btn type="submit" color="primary" variant="elevated" :disabled="isCreatePending" class="mt-2">Create</v-btn>
        </v-card-actions>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { models } from '@feathersjs/vuex';
import {conformRefName} from "@/refNameFunctions";

const { Organization } = models.api;

export default {
  name: 'CreateOrganization',
  data() {
    return {
      organization: new Organization(),
      nameTemp: '',
      lastBadRefName: '',
      orgTypeProperties: [],
      isValid: false,
      rules: {
        isRequired: v => !!v || 'This field is required',
        nameConforms: v => this.conformNameCheck(v),
      },
      snackerMsg: '',
      showSnacker: false,
    }
  },
  computed: {
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapState('auth', ['user']),
    ...mapState('organizations', ['isCreatePending'])
  },
  created() {
    if (!this.user.constraint.canCreatePrivateOrganization && !this.user.constraint.canCreateOpenOrganization) {
      this.$router.push({ name: 'PageNotFound' });
    }
    if (this.user.constraint.canCreateOpenOrganization) {
      this.orgTypeProperties.push({
        title: `Open`,
        value: `Open`,
        props: { subtitle: `all workspaces, files, and activity are publicly visible` },
      })
    }
    if (this.user.constraint.canCreatePrivateOrganization) {
      this.orgTypeProperties.push({
        title: `Private`,
        value: `Private`,
        props: { subtitle: `workspaces, files, and activity are private by default` },
      })
    }
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization']),
    async createOrganization() {
      await this.organization.create()
        .then(async () => {
          const orgId = this.organization._id;
          await this.setCurrentOrganization(Organization.getFromStore(orgId));
          this.$router.push({ name: 'EditOrganization', params: { id: this.organization.refName } });
        })
        .catch((e) => {
          if (e.message === 'Invalid: reference name already taken') {
            this.extraHintContent = `slug name ${this.organization.refName} already taken by another org`;
            this.lastBadRefName = this.organization.refName;
            this.$refs.form.validate();
          }
          console.log(e.message);
          this.snackerMsg = e.message;
          this.showSnacker = true;
        });
    },
    conformNameCheck(rawName) {
      const conformedName = conformRefName(rawName);
      this.organization.refName = conformedName;
      if (conformedName.length < 4) {
        return "requires at least 4 characters in derived slug";
      }
      if (this.extraHintContent === '') {
        return true;
      }
      if (this.lastBadRefName === conformedName) {
        return this.extraHintContent;
      }
      return true;
    },
  }
}
</script>

<style scoped>
</style>
