<template>
  <Main>
    <template #title>
      <v-icon icon="mdi-bookmark-outline" />
      Bookmarks
    </template>
    <template #content>
      <v-row class="mt-6 mx-4">
        <v-col cols="6">
          <v-combobox
            v-model="selectedOrganization"
            label="Select Organization"
            :items="organizations"
            item-title="name"
            variant="solo"
            density="comfortable"
          ></v-combobox>
        </v-col>
        <v-col cols="6">
          <v-combobox
            v-model="bookmarkType"
            label="Type"
            :items="bookmarkTypes"
            item-title="label"
            variant="solo"
            density="comfortable"
          ></v-combobox>
        </v-col>
      </v-row>
      <template v-for="orgSecRef of filteredOrgSecondaryReferences" :key="orgSecRef._id">
        <br>
        <v-row class="mx-4" dense>
          <v-col>
            <div class="text-h6">{{ getOrganization(orgSecRef.organizationId)?.name }}</div>
          </v-col>
        </v-row>
        <v-row class="mx-6" v-if="orgSecRef.bookmarks.length" dense>
          <template
            v-for="(bookmark, i) in orgSecRef.bookmarks"
            :key="bookmark._id"
          >
            <v-col
              v-if="bookmark.collectionName === bookmarkType.collectionName"
              xs="12"
              sm="12"
              md="6"
              lg="4"
              xl="3"
              xxl="2"
            >
              <v-card
                class="mx-auto"
                width="344"
                @click="$router.push({ name: 'Share', params: { id: bookmark.collectionSummary._id } })"
              >
                <template v-if="bookmark.collectionSummary.thumbnailUrl">
                  <v-img
                    :src="bookmark.collectionSummary.thumbnailUrl"
                    height="200px"
                    cover
                  ></v-img>
                </template>
                <template v-else>
                  <v-sheet
                    color="#F4F4F4"
                    height="200px"
                    class="d-flex justify-center align-center"
                  >
                    <span style="color: #8D8D8D">?</span><br>
                  </v-sheet>
                </template>

                <v-card-title style="background: #fafafa;">
                  <span class="text-body-1">
                    {{ bookmark.collectionSummary.custFileName }}
                  </span>
                </v-card-title>

                <v-card-subtitle style="background: #fafafa;">
                  {{ new Date(bookmark.collectionSummary.createdAt).toDateString() }}
                </v-card-subtitle>

                <v-card-actions style="background: #fafafa;">
                  <v-spacer />
                  <v-btn
                    color="decoration"
                    flat
                    icon="mdi-bookmark"
                    size="small"
                    @click.stop="openManageBookmarkDialog(bookmark.collectionSummary)"
                  ></v-btn>
                  <v-btn
                    color="secondary"
                    variant="elevated"
                    prepend-icon="mdi-share"
                  >
                    <template v-slot:prepend>
                      <v-icon></v-icon>
                    </template>
                    Share
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </template>
        </v-row>
        <v-row v-if="!orgSecRef.bookmarks.filter(b => b.collectionName === bookmarkType.collectionName).length" class="mx-6">
          <span class="text-body-1">No bookmark exists</span>
        </v-row>
      </template>
      <template v-if="isFindPendingOrganization || isFindPendingOrgSecRefs">
        <v-row>
          <v-col
            v-for="i in 24"
            :key="i"
            xs="12"
            sm="12"
            md="6"
            lg="4"
            xl="3"
            xxl="2"
          >
            <v-card
              class="mx-auto"
              max-width="344"
            >
              <v-skeleton-loader
                type="image, list-item-two-line"
              >
              </v-skeleton-loader>

              <v-row dense>
                <v-spacer/>
                <v-skeleton-loader
                  type="button" width="70"
                >
                </v-skeleton-loader>
                <v-skeleton-loader
                  type="button" width="100"
                >
                </v-skeleton-loader>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </template>
      <ManageBookmarkDialog
        ref="manageBookmarkDialog"
        :shared-model="activeBookmarkObject"
      />
    </template>
  </Main>
</template>

<script>
import { models } from '@feathersjs/vuex';
import { mapState } from 'vuex';
import ManageBookmarkDialog from '@/components/ManageBookmarkDialog.vue';
import Main from '@/layouts/default/Main.vue';

const { Organization, OrgSecondaryReference } = models.api;

export default {
  name: "Bookmarks",
  components: { Main, ManageBookmarkDialog },
  data() {
    return {
      activeBookmarkObject: null,
      selectedOrganization: null,
      bookmarkTypes: [
        { label: 'Share links', collectionName: 'shared-models' },
      ],
      bookmarkType: { label: 'Share links', collectionName: 'shared-models' },
    };
  },
  computed: {
    ...mapState('organizations', { isFindPendingOrganization: 'isFindPending' }),
    ...mapState('org-secondary-references', { isFindPendingOrgSecRefs: 'isFindPending' }),
    orgSecondaryReferences: () => OrgSecondaryReference.findInStore({}).data,
    filteredOrgSecondaryReferences: vm => OrgSecondaryReference.findInStore({
      query: vm.selectedOrganization ? { organizationId: vm.selectedOrganization._id } : {}
    }).data,
    organizations: vm => Organization.findInStore({ query: { _id: { $in: vm.orgSecondaryReferences.map(o => o.organizationId) } } }).data,
  },
  async mounted() {
    await OrgSecondaryReference.find({});
    await Organization.find({ query: { _id: { $in: this.orgSecondaryReferences.map(o => o.organizationId) }, $paginate: false } });
  },
  methods: {
    getOrganization(orgId) {
      return Organization.getFromStore(orgId);
    },
    async openManageBookmarkDialog(bookmark) {
      this.activeBookmarkObject = bookmark;
      await this.$refs.manageBookmarkDialog.openDialog();
    },
  },
}
</script>

<style scoped>

</style>
