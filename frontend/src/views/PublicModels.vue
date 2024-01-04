<template>
  <v-container>
    <v-row class="pl-4 pr-4">
      <div class="text-h5">Public Models</div>
      <v-spacer />
      <v-col cols="3" class="text-right">
        <v-btn
          min-width="200"
          prepend-icon="mdi-plus"
          :to="{ name: 'Home'}"
          :disabled="!loggedInUser || !loggedInUser.user.constraint.canUpload"
        >
          Upload New Model
        </v-btn>
      </v-col>
    </v-row>

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

          <v-card-title>
            {{ sharedModel.model.custFileName || sharedModel.model.file.custFileName }}
          </v-card-title>

          <v-card-subtitle>
            {{ dateFormat(sharedModel.createdAt) }}
          </v-card-subtitle>

          <v-card-actions>
            <v-btn
              color="orange-lighten-2"
              variant="text"
              :to="{ name: 'Share', params: { id: sharedModel._id } }"
            >
              Explore
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              prepend-icon="mdi-share"
              variant="text"
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
              <v-col cols='8'>
                <v-skeleton-loader
                  type="button"
                >
                </v-skeleton-loader>
              </v-col>
              <v-col cols='4'>
                <v-skeleton-loader
                  type="button" class=""
                >
                </v-skeleton-loader>
              </v-col>
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
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

import ShareLinkDialog from '@/components/ShareLinkDialog.vue';
import scrollListenerMixin from '@/mixins/scrollListenerMixin';

const { SharedModel } = models.api;

export default {
  name: 'PublicModels',
  components: { ShareLinkDialog },
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
    sharedModels: () => SharedModel.findInStore({ query: { isSystemGenerated: true, isActive: true, $sort: { createdAt: -1 } }})
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
            isSystemGenerated: true,
            isActive: true,
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
    }
  }
}
</script>

<style scoped>
::v-deep(.v-skeleton-loader__image) {
  height: 190px;
}
</style>
