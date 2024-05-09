<template>
  <v-sheet
    elevation="8"
    rounded="lg"
  >
    <v-container class="d-flex flex-column">
      <div class="d-flex justify-space-between">
        <v-sheet max-width="22em" class="align-self-start mb-1">
          <span style="color: blue;">{{message}}</span>
        </v-sheet>
        <v-sheet max-width="22em" class="align-self-end">
          {{translateCollection(curation.collection)}}
        </v-sheet>
      </div>
      <div class="d-flex flex-wrap justify-start">
        <v-sheet width="10em">
          <repr-viewer :curation="curation"/>
        </v-sheet>
        <v-sheet class="d-flex flex-column">
          <v-sheet class="align-start">
            <p class="text-h6">{{ curation.name }}</p>
            <p><code class="text-blue">{{curation.slug}}</code></p>
            <p class="text-body-2">{{ curation.description }}</p>
            <v-chip-group>
              <v-chip v-for="(tag) in curation?.tags" size="small">{{tag}}</v-chip>
            </v-chip-group>
          </v-sheet>
          <v-sheet v-if="showFrom || fromDate" class="align-self-end">
            <p v-if="showFrom" class="text-right font-weight-light">
              <v-icon icon="mdi-account" v-if="isJustUser"></v-icon>
              <v-icon icon="mdi-account-group" v-if="!isJustUser"></v-icon>
              <i>from <b>{{fromName}}</b></i>
            </p>
            <p v-if="fromDate" class="text-right font-weight-light">
              {{(new Date(fromDate)).toDateString()}}
            </p>
          </v-sheet>
        </v-sheet>
      </div>
    </v-container>
  </v-sheet>
</template>

<script>

import ReprViewer from "@/components/ReprViewer.vue";
import {translateCollection} from "@/curationHelpers";

export default {
  name: "CuratedItemSheet",
  components: {ReprViewer},
  props: {
    curation: {
      type: Object,
      default: {
        collection: 'tbd',
        name: 'tbd',
        description: '',
      }
    },
    message: {
      type: String,
      default: '',
    },
    fromUser: {
      type: Object,
      default: null,
    },
    fromOrg: {
      type: Object,
      default: null,
    },
    fromDate: {
      type: Number,
      default: null,
    }
  },
  async created() {
  },
  computed: {
    //    isLoggedInUserAdminOfOrganization: vm => vm.organization.users.some(user => user._id === vm.loggedInUser.user._id && user.isAdmin),
    showFrom: vm => vm.fromUser !== null || vm.fromOrg !== null,
    isJustUser: vm => vm.fromUser !== null && (vm.fromOrg === null || vm.fromOrg.type === 'Personal'),
    fromName: vm => vm.isJustUser ? `${vm.fromUser?.name}`  : (vm.fromUser === null ? '' : `${vm.fromUser.name} of `) + `org ${vm.fromOrg?.name}`,
  },
  data: () => ({
  }),
  methods: {
    translateCollection
  },
}
</script>

<style scoped>

</style>
