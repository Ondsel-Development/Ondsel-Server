<template>
  <Main>
    <template #title>
      <v-icon icon="mdi-dots-square" />
      Public Models
    </template>
    <template #subtitle>Browse popular models ready to be integrated with FreeCAD</template>
    <template #actions>
      <v-btn
        color="success"
        variant="elevated"
        min-width="200"
        prepend-icon="mdi-plus"
        :to="{ name: 'Home'}"
        :disabled="!loggedInUser || !loggedInUser.user.constraint.canUpload"
      >
        Upload New Model
      </v-btn>
    </template>
    <template #content>
      <br>
      <v-row dense>
        <v-col
          v-for="(sharedModel, i) in sharedModels.data"
          :key="sharedModel._id"
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
            elevation="1"
            @click="$router.push({ name: 'Share', params: { id: sharedModel._id } })"
          >
            <template v-if="sharedModel.thumbnailUrl">
              <v-img
                :src="sharedModel.thumbnailUrl"
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
                {{ sharedModel.model.custFileName || sharedModel.model.file.custFileName }}
              </span>
            </v-card-title>

            <v-card-subtitle style="background: #fafafa;">
              {{ dateFormat(sharedModel.createdAt) }}
            </v-card-subtitle>

            <v-card-actions style="background: #fafafa;">
              <v-spacer></v-spacer>
              <v-btn
                v-if="isAuthenticated"
                variant="text"
                icon="mdi-bookmark"
                size="small"
                @click.stop="openManageBookmarkDialog(sharedModel)"
              ></v-btn>
              <v-btn
                color="secondary"
                variant="elevated"
                prepend-icon="mdi-share"
                @click.stop="openShareLinkDialog(sharedModel)"
              >
                <template v-slot:prepend>
                  <v-icon></v-icon>
                </template>
                Share
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <template v-if="sharedModels.data.length === 0 && isFindPending">
          <v-col
            v-for="i in 25"
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
        </template>
      </v-row>
      <br>
      <v-row dense class="justify-center">
        <template v-if="sharedModels.data.length && isFindPending">
          <v-progress-circular indeterminate></v-progress-circular>
        </template>
        <template v-else-if="sharedModels.data.length === this.pagination.total">
          <div class="text-grey-darken-1">You reached the end!</div>
        </template>
        <template v-else>
          <v-btn flat variant="text" @click.stop="fetchDataOnScroll">Load more</v-btn>
        </template>
      </v-row>
      <ShareLinkDialog
        :is-active="isShareLinkDialogActive"
        :shared-model-id="activeShareModel._id"
        ref="shareLinkDialog"
      />
      <ManageBookmarkDialog
        ref="manageBookmarkDialog"
        :shared-model="activeShareModel"
      />
    </template>
  </Main>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import { models } from '@feathersjs/vuex';

import Main from '@/layouts/default/Main.vue';
import ShareLinkDialog from '@/components/ShareLinkDialog.vue';
import ManageBookmarkDialog from '@/components/ManageBookmarkDialog.vue';
import scrollListenerMixin from '@/mixins/scrollListenerMixin';

const { SharedModel } = models.api;

export default {
  name: 'PublicModels',
  components: { Main, ShareLinkDialog, ManageBookmarkDialog },
  mixins: [scrollListenerMixin],
  data: () => ({
    showRecentModels: true,
    pagination: {
      limit: 25,
      skip: 0,
      total: null,
    },
    isShareLinkDialogActive: false,
    activeShareModel: {},
    loading: false,
    scrollListener: null,
  }),
  async mounted() {
    await this.fetchDataOnScroll();
  },

  beforeRouteEnter(to, from, next) {
    // Use a callback with "next" to pass the instantiated component
    next(vm => { vm.setupScrollListener(); });
  },

  beforeRouteLeave(to, from, next) {
    this.removeScrollListener();
    next();
  },
  computed: {
    ...mapState('shared-models', ['isFindPending']),
    ...mapState('auth', { loggedInUser: 'payload' }),
    ...mapGetters('auth', ['isAuthenticated']),
    sharedModels: () => SharedModel.findInStore({ query: { showInPublicGallery: true, isThumbnailGenerated: true, isActive: true, $sort: { createdAt: -1 } }}),
  },
  methods: {
    async fetchDataOnScroll() {
      if (this.isFindPending) {
        return;
      }
      if (this.sharedModels.data.length !== this.pagination.total) {
        const models = await SharedModel.find({
          query: {
            $limit: this.pagination.limit,
            $skip: this.pagination.skip,
            $sort: {
              createdAt: -1,
            },
            showInPublicGallery: true,
            isActive: true,
            isThumbnailGenerated: true,
          }
        });
        this.pagination.skip = models.skip + this.pagination.limit;
        this.pagination.total = models.total;
      }
    },
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
    openShareLinkDialog(sharedModel) {
      this.isShareLinkDialogActive = true;
      this.activeShareModel = sharedModel;
      this.$refs.shareLinkDialog.$data.dialog = true;
    },
    async openManageBookmarkDialog(sharedModel) {
      this.activeShareModel = sharedModel;
      await this.$refs.manageBookmarkDialog.openDialog();
    },
  }
}
</script>

<style scoped>
::v-deep(.v-skeleton-loader__image) {
  height: 190px;
}

.grey-color {
  background: #fafafa;
}
</style>
