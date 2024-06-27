<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card>
      <v-card-title>Select Organization</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(organization, i) in user.organizations"
            :key="i"
            variant="text"
            flat
            :value="organization"
            :active="currentOrganization ? organization._id === currentOrganization._id : false"
          >
            <template #title>
              <v-sheet @click="gotoOrgAndClose(organization)">
                {{ organization.name }}
                <v-icon v-if="organization.type==='Open'" class="text-body-2" icon="mdi-earth" flag />
              </v-sheet>
            </template>
            <template #append>
              <v-btn
                color="decorative"
                flat
                icon="mdi-cog"
                @click="gotoOrgEditAndClose(organization)"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>

import {mapGetters, mapState} from "vuex";
import OrganizationMixin from "@/mixins/organizationMixin";

export default {
  name: 'SelectOrganizationDialog',
  mixins: [ OrganizationMixin ],
  props: {
  },
  emits: [],
  data: () => ({
    dialog: false,
  }),
  computed: {
    ...mapState('auth', ['user']),
    ...mapGetters('app', { userCurrentOrganization: 'currentOrganization' }),
    currentOrganization() {
      return this.userCurrentOrganization;
    },
  },
  methods: {
    async gotoOrgAndClose(org) {
      await this.goToOrganization(org);
      this.dialog = false;
    },
    async gotoOrgEditAndClose(org) {
      await this.goToOrganizationEdit(org);
      this.dialog = false;
    }
  },
  watch: {
  }
}
</script>
<style scoped>
</style>
