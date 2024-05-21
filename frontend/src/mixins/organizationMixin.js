import { models } from '@feathersjs/vuex';
import { mapActions, mapState } from 'vuex';

export default {
  data: () => ({
  }),
  computed: {
    ...mapState('auth', ['user']),
  },
  methods: {
    ...mapActions('app', ['setCurrentOrganization']),
    async goToOrganization(organization) {
      const { Organization } = models.api;
      await Organization.get(organization._id);
      await this.setCurrentOrganization(Organization.getFromStore(organization._id));
      if (organization.type === 'Personal') {
        this.$router.push({ name: 'UserWorkspaces', params: { id: this.user.username } });
      } else {
        this.$router.push({ name: 'OrganizationWorkspaces', params: { id: organization.refName } });
      }
    },
    async goToOrganizationEdit(organization) {
      const { Organization } = models.api;
      await Organization.get(organization._id);
      await this.setCurrentOrganization(Organization.getFromStore(organization._id));
      if (organization.type === 'Personal') {
        this.$router.push({name: 'AccountSettings', params: {slug: this.user.username}});
      } else {
        this.$router.push({ name: 'EditOrganization', params: { id: organization.refName } });
      }
    }
  }
}
