<template>
  <v-card class="ma-4">
    <v-card-title>Remove User</v-card-title>
    <v-card-subtitle>
      <v-btn
        density="default"
        icon="mdi-home"
        color="success"
        @click="$router.push({ name: 'XavierMenu', params: {}})"
      ></v-btn> Professor Xavier's School For The Hidden
    </v-card-subtitle>
    <v-card-text>
      <p class="ma-4">
        Remove a user here.
      </p>
      <p class="ma-4">
        This will:
        <ul class="mx-8">
          <li>Redact one user's data from the <code>users</code> and <code>organizations</code> collections in the database (the IDs and accounting data remains to meet accounting and regulatory requirements)</li>
          <li>Delete one user's workspaces, files, directories, promotions, etc. permanently from the database</li>
          <li>The username and email address will be instantly be available for anyone to use for registration</li>
        </ul>
      </p>
      <p class="ma-4">
        This deletion function is currently limited to "mostly empty" accounts. If the user has active org
        membership/ownership, extra workspaces, etc., the deletion function <i>might</i> refuse to work.
        If that happens, you will get an error message with a list of the reasons.
      </p>
      <p class="ma-4">
        This function is NOT reversible.
      </p>
      <p class="ma-4">
        If you don't know the ID or email of the user, use the <a href="/xavier-9584355633/search">Xavier Search Page</a>.
      </p>
      <v-card  title="User Details for Removal" width="26em" class="pa-2 ma-2 mx-auto">
        <v-card-text>
          <v-text-field
            v-model="userId"
            label="Internal User Id"
            autofocus
          ></v-text-field>
          <v-text-field
            v-model="email"
            label="Email Address"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="error"
            variant="elevated"
            type="submit"
            :disabled="isRemovalPending"
            class="mx-auto"
            @click.stop="doUserRemoval()"
          >Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-card-text>
  </v-card>
  <p></p>
  <v-card class="ma-2 mx-auto">
    <v-card-title>RESULTS:</v-card-title>
    <v-card-text>
      <pre>{{ results }}</pre>
    </v-card-text>
  </v-card>

</template>

<script>

import {mapState} from "vuex";
import {crc32} from "@/refNameFunctions";
import {models} from "@feathersjs/vuex";

const { User } = models.api;

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'XavierRemoveUser',
  components: {},
  data: () => ({
    userId: '',
    email: '',
    results: 'pending...',
    isRemovalPending: false,
  }),
  async created() {
    if (!this.user || !this.user.isTripe) {
      console.log("alert-33235-ru");
      this.$router.push({name: 'LensHome', params: {}});
    }
    if (this.$route.query.i) {
      this.userId = this.$route.query.i;
    }
    if (this.$route.query.e) {
      let e = this.$route.query.e || "";
      this.email = decodeURIComponent(e.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));
    }
  },
  computed: {
    ...mapState('auth', ['user']),
  },
  methods: {
    async doUserRemoval() {
      this.isRemovalPending = true;
      let hasError = false;
      let log = ['starting.'];
      if (!this.userId) {
        log.push('User ID is missing.');
        hasError = true;
      }
      if (!this.email) {
        log.push('Email address is missing.');
        hasError = true;
      }
      if (hasError) {
        log.push('ERR: refraining from changes due to errors found.')
      } else {
        let crcValue = crc32(this.email);
        let target = this.userId + "z" + crcValue.toString();
        log.push(`making DEL call to user API with "${target}" via admin "${this.user.username}"`);
        try {
          const delResult = await User.remove(target);
          log.push(`API CALL RETURN: ${JSON.stringify(delResult, null, 2)}`);
        } catch (e) {
          log.push('API GENERATED ERROR: ' + e.toString())
        }
      }
      this.results = log.join('\n');
      this.isRemovalPending = false;
    }
  },
  watch: {
  }
}
</script>
<style scoped>
</style>
