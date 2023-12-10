<template>
  <v-container v-if="group">
    <v-row class="align-center">
      <div class="text-body-1">Group&nbsp</div>
      <div class="text-body-1 font-weight-bold">{{ group.name }}</div>
      <v-spacer />
      <div class="align-end">
        <v-switch
          label="Take All New Users"
          v-model="group.takeAllNewUsers"
          hide-details
          :disabled="!isLoggedInUserAdmin(organization)"
          @update:modelValue="group.save()"
        ></v-switch>
      </div>
    </v-row>
    <v-row class="mt-12">
      <group-users-table :group="group" />
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { models } from '@feathersjs/vuex';
import GroupUsersTable from '@/components/GroupUsersTable';

const { Group, Organization } = models.api;

export default {
  name: "EditGroup",
  components: { GroupUsersTable },
  async created() {
    try {
      await Group.get(this.$route.params.id);
    } catch (e) {
      this.$router.push({ name: 'PageNotFound' });
    }
  },
  computed: {
    ...mapGetters('organizations', ['isLoggedInUserAdmin']),
    organization: vm => Organization.getFromStore(vm.group.organizationId),
    group: vm => Group.getFromStore(vm.$route.params.id),
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
