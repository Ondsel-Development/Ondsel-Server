<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-card width="600" max-height="600">
      <template v-slot:title>
        <div class="text-center">Manage Bookmarks</div>
      </template>
      <v-card-text class="pa-12">
        <v-select
          v-model="selectedOrganizations"
          :items="organizations"
          :item-value="org => org"
          item-title="name"
          label="Add Bookmark to Organizations"
          chips
          multiple
          :loading="isFindOrgPending || isFindOrgSecondaryReferencesPending"
        >
        </v-select>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog=false"
        >Close</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :disabled="isPatchOrgSecondaryReferencesPending"
          :loading="isPatchOrgSecondaryReferencesPending"
          @click="updateBookmarks"
        >Update Bookmarks</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { models } from '@feathersjs/vuex';
import { mapState } from 'vuex';

const { Organization, OrgSecondaryReference } = models.api;

export default {
  name: "ManageBookmarkDialog",
  props: {
    sharedModel: { type: Object },
  },
  data() {
    return {
      dialog: false,
      selectedOrganizations: [],
    };
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState('organizations', { isFindOrgPending: 'isFindPending' }),
    ...mapState('org-secondary-references', {
      isFindOrgSecondaryReferencesPending: 'isFindPending',
      isPatchOrgSecondaryReferencesPending: 'isPatchPending'
    }),
    orgSecondaryReferences: vm => OrgSecondaryReference.findInStore({
      query: {
        'bookmarks.collectionName': 'shared-models',
        'bookmarks.collectionSummary._id': vm.sharedModel._id,
      }
    }).data,
    organizations: vm => Organization.findInStore({
      query: {
        'users._id': vm.user._id,
        'users.isAdmin': true
      }
    }).data,
  },
  methods: {
    async openDialog() {
      this.dialog = true;
      await Organization.find({
        query: {
          'users._id': this.user._id,
          'users.isAdmin': true,
          $paginate: false,
        }
      })

      await OrgSecondaryReference.find({
        query: {
          'bookmarks.collectionName': 'shared-models',
          'bookmarks.collectionSummary._id': this.sharedModel._id,
          $paginate: false,
        }
      });

      this.selectedOrganizations = Organization.findInStore({ query: { _id : { $in: this.orgSecondaryReferences.map(o => o.organizationId) } } }).data;

    },
    async updateBookmarks() {
      const oldBookmarks = this.orgSecondaryReferences.map(o => o.organizationId);
      const bookmarksToAdd = this.selectedOrganizations.filter(org => !oldBookmarks.includes(org._id));

      const bookmarksToRemoveOrgIds = oldBookmarks.filter(orgId => !this.selectedOrganizations.some(org => org._id === orgId));
      const bookmarksToRemove = Organization.findInStore({ query: { _id : { $in: bookmarksToRemoveOrgIds } } }).data;

      await Promise.all(bookmarksToAdd.map(organization => {
        OrgSecondaryReference.patch(
          organization.orgSecondaryReferencesId,
          {
            "shouldAddBookmark": true,
            "bookmark": {
              "collectionName": "shared-models",
              "collectionId": this.sharedModel._id
            }
          }
        )
      }));

      await Promise.all(bookmarksToRemove.map(organization => {
        OrgSecondaryReference.patch(
          organization.orgSecondaryReferencesId,
          {
            "shouldRemoveBookmark": true,
            "bookmark": {
              "collectionName": "shared-models",
              "collectionId": this.sharedModel._id
            }
          }
        )
      }));
      this.dialog = false;
    },
  },
}
</script>

<style scoped>

</style>
