<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card max-width="40em" min-width="22em">
      <v-card-title>Share {{curation.name}} With User</v-card-title>
      <v-card-subtitle>
        {{longCollectionDesc}}
      </v-card-subtitle>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form>
        <v-card>
          <v-card-title>Locate User</v-card-title>
          <v-card-text>
            <v-text-field name="Search field"></v-text-field>
            <v-divider></v-divider>
            <v-sheet class="ma-1 pl-2 overflow-y-auto" border height="20em">
              <v-radio-group
                v-for="person in searchResult"
                :key="person.username"
              >
                <v-radio value="xyz1">
                  <template v-slot:label>
                    {{ person.name }}&nbsp; <code>[{{ person.username }}]</code>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn class="primary" disabled>Send Share</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

import {mapActions, mapGetters, mapState} from "vuex";
import {translateCollection} from "@/curationHelpers";
// import {models} from "@feathersjs/vuex";

// const { Organization, OrgSecondaryReference } = models.api;

export default {
  name: 'ShareWithUserDialog',
  props: {
    curation: Object,
  },
  async created() {
    await this.reCalc();
  },
  data: () => ({
    dialog: false,
    message: '',
    userId: null,
    snackerMsg: '',
    showSnacker: false,
    isPatchPending: false,
    longCollectionDesc: 'tbd',
    searchResult: [{name: 'John Dee', 'username': 'johnd'}],
  }),
  computed: {
    ...mapState('auth', ['user']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
  },
  methods: {
    ...mapActions('app', ['getUserByIdOrNamePublic', 'getWorkspaceByIdPublic', 'getOrgByIdOrNamePublic']),
    async reCalc() {
      this.longCollectionDesc = translateCollection(this.curation.collection);
    },
  },
  watch: {
    async dialog(newValue){
      if (newValue) {
        await this.reCalc();
      }
    }
  }
}
</script>
<style scoped>
</style>
