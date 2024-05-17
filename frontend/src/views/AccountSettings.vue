<template>
  <Main>
    <template #title>
      <div class="d-flex flex-row justify-center" style="align-items: center;">
        Account Settings
      </div>
    </template>
    <template #content>
      <v-container v-if="user">

        <v-tabs
          v-model="tab"
          align-tabs="center"
        >
          <v-tab value="1">Public Details</v-tab>
          <v-tab value="2">Private Details</v-tab>
          <v-tab value="3">Account</v-tab>
          <v-tab value="4">Organization Memberships</v-tab>
          <v-tab value="5">Public Promoted Items</v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="1">
            <v-card
              variant="flat"
              :border="true"
              class="mx-auto my-6"
            >
              <v-list lines="three">
                <v-list-subheader class="mb-2">Public</v-list-subheader>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Name</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ user.name }}
                  </v-list-item-subtitle>
                  <v-list-item-action class="justify-end">
                    <v-btn
                      variant="elevated"
                      color="secondary"
                      size="small"
                      @click.stop="openUserChangeNameDialog()"
                    >
                      Change Name
                    </v-btn>
                    <UserChangeNameDialog
                      :is-active="isUserChangeNameDialogActive"
                      :user="user"
                      ref="userChangeNameDialog"
                    />
                  </v-list-item-action>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Username</v-list-item-title>
                  <v-list-item-subtitle>
                    <code>{{ user.username }}</code>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Short Description</v-list-item-title>
                  <v-list-item-subtitle>
                    <div v-if="organization.description">
                      {{ organization.description }}
                    </div>
                    <div v-else>
                      <i>none supplied</i>
                    </div>
                  </v-list-item-subtitle>
                  <v-list-item-action class="justify-end">
                    <v-btn
                      variant="elevated"
                      color="secondary"
                      size="small"
                      @click.stop="openEditDescriptionDialog()"
                    >
                      Edit Description
                    </v-btn>
                    <EditDescriptionDialog
                      :is-active="isChangeDescriptionDialogActive"
                      :description="organization.description || ''"
                      ref="editDescriptionDialog"
                      @save-description="saveDescriptionDialog"
                    />
                  </v-list-item-action>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Long Description</v-list-item-title>
                  <v-list-item-media>
                    <v-card>
                      <v-card-text>
                        <markdown-viewer :markdown-html="longDescriptionHtml"></markdown-viewer>
                      </v-card-text>
                    </v-card>
                  </v-list-item-media>
                  <v-list-item-action class="justify-end">
                    <v-btn
                      variant="elevated"
                      color="secondary"
                      size="small"
                      @click.stop="openEditLongDescriptionMdDialog()"
                    >
                      Edit Long Description
                    </v-btn>
                    <EditLongDescriptionMdDialog
                      :is-active="isOrgChangeLongDescriptionMdDialogActive"
                      :long-description-md="organization.curation?.longDescriptionMd || ''"
                      ref="editLongDescriptionMdDialog"
                      @save-long-description-md="saveLongDescriptionMd"
                    />
                  </v-list-item-action>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Tags</v-list-item-title>
                  <v-list-item-subtitle>
                    <div v-if="organization.curation?.tags && organization.curation?.tags?.length > 0">
                      <v-chip-group>
                        <v-chip v-for="(tag) in organization.curation?.tags">{{tag}}</v-chip>
                      </v-chip-group>
                    </div>
                    <span v-else><i>None</i></span>
                  </v-list-item-subtitle>
                  <v-list-item-action class="justify-end">
                    <v-btn
                      variant="elevated"
                      color="secondary"
                      size="small"
                      @click.stop="openEditTagsDialog()"
                    >
                      Edit Tags
                    </v-btn>
                    <EditTagsDialog
                      :is-active="isEditTagsDialogActive"
                      :tagList="organization.curation?.tags || []"
                      ref="editTagsDialog"
                      @save-tags="saveTags"
                    />
                  </v-list-item-action>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Links</v-list-item-title>
                  <v-list-item-subtitle>
                    Public Summary: <a :href="userHomeUrl">{{userHomeUrl}}</a>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="2">
            <v-card
              variant="flat"
              :border="true"
              class="mx-auto my-6"
            >
              <v-list lines="three">
                <v-list-subheader class="mb-2">Private</v-list-subheader>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Email</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ user.email }}
                    <v-chip v-if="user.isVerified">Verified</v-chip>
                    <v-chip v-else color="red" text-color="white">Not Verified</v-chip>
                  </v-list-item-subtitle>
                  <v-list-item-action v-if="!user.isVerified" class="justify-end">
                    <v-btn
                      variant="elevated"
                      color="secondary"
                      size="small"
                      @click.stop="openVerifyEmailDialog()"
                    >
                      Resend Verification
                    </v-btn>
                    <VerifyEmailDialog
                      :is-active="isVerifyEmailDialogActive"
                      :user="user"
                      ref="verifyEmailDialog"
                    />
                  </v-list-item-action>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Password</v-list-item-title>
                  <v-list-item-subtitle>
                    **********
                  </v-list-item-subtitle>
                  <v-list-item-action v-if="user.isVerified" class="justify-end">
                    <v-btn
                      variant="elevated"
                      color="secondary"
                      size="small"
                      @click.stop="openResetPasswordDialog()"
                      :disabled="loggedInUser.user.tier===SubscriptionTypeMap.unverified"
                    >
                      Reset Password
                    </v-btn>
                    <ResetPasswordDialog
                      :is-active="isResetPasswordDialogActive"
                      :user="user"
                      ref="resetPasswordDialog"
                    />
                  </v-list-item-action>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Links</v-list-item-title>
                  <v-list-item-subtitle>
                    Workspace Management: <a :href="userWorkspaceUrl">{{userWorkspaceUrl}}</a>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="3">
            <v-card
              variant="flat"
              :border="true"
              class="mx-auto my-6"
            >
              <v-list lines="three">
                <v-list-subheader class="mb-2">Account</v-list-subheader>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Current Tier</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ user.fullTierName }}
                  </v-list-item-subtitle>
                  <v-list-item-action class="justify-end">
                    <v-btn
                      variant="elevated"
                      color="secondary"
                      size="small"
                      @click="gotoChooseTier()"
                      :disabled="loggedInUser.user.tier===SubscriptionTypeMap.unverified"
                    >
                      Choose New Tier
                    </v-btn>
                    <v-btn variant="elevated" color="secondary" class="ml-2" size="small" @click="gotoAccountHistory()">
                      View Account History
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>

                <v-divider />
                <v-list-item>
                  <v-list-item-title>Remaining Models</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ remainingFiles }}
                  </v-list-item-subtitle>
                </v-list-item>

              </v-list>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="4">
            <v-card>
              <v-card-title>Organization Memberships</v-card-title>
              <v-card-text>
                <v-table>
                  <thead>
                  <tr>
                    <th class="text-left">
                      Name
                    </th>
                    <th class="text-left">
                      Type
                    </th>
                    <th class="text-left">
                      Send Email Notifications
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr
                    v-for="item in user.organizations"
                    :key="item.name"
                  >
                    <td>{{ item.name }}</td>
                    <td>{{ item.type }}</td>
                    <td>
                      {{ item.notificationByEmailCadence || "Immediately" }}
                      <v-icon
                        size="small"
                        @click.stop="openNotificationByEmailCadenceDialog(item)"
                      >
                        mdi-pencil
                      </v-icon>
                    </td>
                  </tr>
                  </tbody>
                </v-table>
                <generic-selection-dialog
                  :currentSelection="notificationCadenceSelection"
                  :selectionList="notificationCadenceOptions"
                  :title="notificationCadenceTitle"
                  :subtitle="notificationCadenceSubTitle"
                  ref="notificationByEmailCadenceDialog"
                  @save-generic-selection="saveNotificationByEmailCadenceSelection"
                ></generic-selection-dialog>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="5">
            <organization-promotions-table :organization="organization" />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container>
    </template>
  </Main>
</template>

<script>

import {mapState} from "vuex";
import {models} from "@feathersjs/vuex";
import {SubscriptionTypeMap} from "@/store/services/users";
import ResetPasswordDialog from "@/components/ResetPasswordDialog.vue";
import VerifyEmailDialog from "@/components/VerifyEmailDialog.vue";
import UserChangeNameDialog from "@/components/UserChangeNameDialog.vue";
import EditLongDescriptionMdDialog from "@/components/EditLongDescriptionMdDialog.vue";
import {marked} from "marked";
import EditTagsDialog from "@/components/EditTagsDialog.vue";
import _ from "lodash";
import EditDescriptionDialog from "@/components/EditDescriptionDialog.vue";
import OrganizationPromotionsTable from "@/components/OrganizationPromotionsTable.vue";
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import GenericSelectionDialog from "@/components/GenericSelectionDialog.vue";
import Main from '@/layouts/default/Main.vue';

const { Model, Organization, User } = models.api;

export default {
  name: 'AccountSettings',
  components: {
    Main,
    GenericSelectionDialog,
    MarkdownViewer,
    OrganizationPromotionsTable,
    EditDescriptionDialog,
    EditTagsDialog, EditLongDescriptionMdDialog, UserChangeNameDialog, VerifyEmailDialog, ResetPasswordDialog},
  data() {
    return {
      isResetPasswordDialogActive: false,
      isVerifyEmailDialogActive: false,
      isUserChangeNameDialogActive: false,
      isChangeDescriptionDialogActive: false,
      isEditTagsDialogActive: false,
      isOrgChangeLongDescriptionMdDialogActive: false,
      remainingFiles: "processing...",
      userHomeUrl: 'tbd',
      userWorkspaceUrl: 'tbd',
      organization: {},
      notificationCadenceOptions: [
        {'order': 'a', 'label': 'Immediately: send an email as soon as the notification arrives', 'value': 'Immediately'},
        {'order': 'b', 'label': 'Never: never send an email for notifications', 'value': 'Never'},
      ],
      notificationCadenceTitle: '',
      notificationCadenceSubTitle: '',
      notificationCadenceSelection: '',
      notificationCadenceOrgId: null,
      tab: null,
    }
  },
  computed: {
    SubscriptionTypeMap() {
      return SubscriptionTypeMap
    },
    longDescriptionHtml: vm => marked(vm.organization?.curation?.longDescriptionMd || "*None*"),
    ...mapState('auth', { loggedInUser: 'payload', user: 'user' }),
  },
  async mounted() {
    await this.getRemainingFiles();
    this.userHomeUrl = `/user/${this.user.username}/`;
    this.userWorkspaceUrl = `/user/${this.user.username}/workspaces`
    this.organization = await Organization.get(this.user.personalOrganization._id)
  },
  methods: {
    gotoChooseTier() {
      this.$router.push({name: 'ChooseTier'});
    },
    gotoAccountHistory() {
      this.$router.push({name: 'AccountHistory', params: {slug: this.user.username}});
    },
    async getRemainingFiles() {
      try {
        const models = await Model.find({query: {userId: this.user._id, isSharedModel: false}})
        this.remainingFiles = this.user.calculateRemainingModels(models.data.length);
      } catch (e) {
        console.log('during model count query: ' + e.message);
        this.remainingFiles = 'unknown at moment'; // this can happen during a network hiccup because of S3 dependency
      }
    },
    openResetPasswordDialog() {
      this.isResetPasswordDialogActive = true;
      this.$refs.resetPasswordDialog.$data.dialog = true;
    },
    openVerifyEmailDialog() {
      this.isVerifyEmailDialogActive = true;
      this.$refs.verifyEmailDialog.$data.dialog = true;
    },
    openUserChangeNameDialog() {
      this.isUserChangeNameDialogActive = true;
      this.$refs.userChangeNameDialog.$data.dialog = true;
    },
    async openEditDescriptionDialog() {
      this.isChangeDescriptionDialogActive = true;
      this.$refs.editDescriptionDialog.$data.newTags = this.organization.curation?.tags || [];
      this.$refs.editDescriptionDialog.$data.dialog = true;
    },
    async saveDescriptionDialog() {
      this.$refs.editDescriptionDialog.$data.isPatchPending = true;
      const description = this.$refs.editDescriptionDialog.$data.newDescription;
      await Organization.patch(
        this.organization._id,
        {
          description: description,
        }
      ).then(() => {
        this.$refs.editDescriptionDialog.$data.dialog = false;
        this.isChangeDescriptionDialogActive = false;
      }).catch((e) => {
        const msg = e.message;
        this.$refs.editDescriptionDialog.snackerMsg = e.message;
        this.$refs.editDescriptionDialog.showSnacker = true;
        console.log(msg);
      });
      this.$refs.editDescriptionDialog.$data.isPatchPending = false;
    },
    async openEditLongDescriptionMdDialog() {
      this.isOrgChangeLongDescriptionMdDialogActive = true;
      this.$refs.editLongDescriptionMdDialog.$data.dialog = true;
    },
    async saveLongDescriptionMd() {
      this.$refs.editLongDescriptionMdDialog.$data.isPatchPending = true;
      const longDescriptionMd = this.$refs.editLongDescriptionMdDialog.$data.newLongDescriptionMd;
      let curation = this.organization.curation || {};
      curation.longDescriptionMd = longDescriptionMd;
      await Organization.patch(
        this.organization._id,
        {
          curation: curation,
        }
      ).then(() => {
        this.$refs.editLongDescriptionMdDialog.$data.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        this.$refs.editLongDescriptionMdDialog.snackerMsg = e.message;
        this.$refs.editLongDescriptionMdDialog.showSnacker = true;
        console.log(msg);
      });
      this.$refs.editLongDescriptionMdDialog.$data.isPatchPending = false;
    },
    async openEditTagsDialog() {
      this.isEditTagsDialogActive = true;
      this.$refs.editTagsDialog.$data.newTags = this.organization.curation?.tags || [];
      this.$refs.editTagsDialog.$data.dialog = true;
    },
    async saveTags() {
      this.$refs.editTagsDialog.$data.isPatchPending = true;
      const tagList = this.$refs.editTagsDialog.$data.newTags;
      const lowercaseTags = tagList.map(tag => tag.toLowerCase().trim());
      const cleanTags = _.uniq(lowercaseTags);
      let curation = this.organization.curation || {};
      curation.tags = cleanTags;
      await Organization.patch(
        this.organization._id,
        {
          curation: curation,
        }
      ).then(() => {
        this.$refs.editTagsDialog.$data.dialog = false;
        this.isEditTagsDialogActive = false;
      }).catch((e) => {
        const msg = e.message;
        this.$refs.editTagsDialog.snackerMsg = e.message;
        this.$refs.editTagsDialog.showSnacker = true;
        console.log(msg);
      });
      this.$refs.editTagsDialog.$data.isPatchPending = false;
    },
    async openNotificationByEmailCadenceDialog(item) {
      this.notificationCadenceSelection = item.notificationByEmailCadence || "Immediately";
      if (item.type === 'Personal') {
        this.notificationCadenceTitle = `Email handling for you (${item.name})`
      } else {
        this.notificationCadenceTitle = `Email handling for org "${item.name}"`
      }
      this.notificationCadenceSubTitle = `When should you get notification emails at ${this.user.email}?`;
      this.notificationCadenceOrgId = item._id;
      this.$refs.notificationByEmailCadenceDialog.$data.finalSelection = this.notificationCadenceSelection;
      this.$refs.notificationByEmailCadenceDialog.$data.dialog = true;
    },
    async saveNotificationByEmailCadenceSelection() {
      const newCadence = this.$refs.notificationByEmailCadenceDialog.$data.finalSelection;
      await User.patch(
        this.user._id,
        {
          shouldChangeEmailNotification: true,
          organizationId: this.notificationCadenceOrgId,
          notificationByEmailCadence: newCadence,
        }
      )
      this.$refs.notificationByEmailCadenceDialog.$data.dialog = false;
    },
  }
}
</script>

<style scoped>

</style>
