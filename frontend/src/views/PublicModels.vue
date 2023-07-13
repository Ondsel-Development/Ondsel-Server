<template>
  <v-container>
    <v-row class="pl-4 pr-4">
      <div class="text-h5">Public Models</div>
      <v-spacer />
      <v-col cols="3" class="text-right">
        <v-btn
          prepend-icon="mdi-plus"
          :to="{ name: 'Home'}"
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
        cols="4"
      >
        <v-card
          class="mx-auto"
          max-width="344"
        >
          {{ sharedModel.dummyModelId }}
          {{ sharedModel.model._id }}
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
            {{ sharedModel.model.custFileName }}
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
          </v-card-actions>
        </v-card>
      </v-col>
      <template v-if="sharedModels.data.length === 0 && isFindPending">
        <v-col
          v-for="i in 9"
          :key="i"
          cols="4"
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
                  type="button" width="300px"
                >
                </v-skeleton-loader>
              </v-col>

              <v-col cols='2'>
                <v-skeleton-loader
                  type="button" width="65px" class=""
                >
                </v-skeleton-loader>
              </v-col>

              <v-col cols='2'>
              <v-skeleton-loader
                type="button" width="65px" class="ml-n2"
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
      <template v-if="sharedModels.data.length === this.pagination.total">
        <div class="text-grey-darken-1">You reached at the end!</div>
      </template>
    </v-row>
  </v-container>

</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import { models } from '@feathersjs/vuex';

import MangeSharedModels from '@/components/MangeSharedModels';
import DeleteDialog from '@/components/DeleteDialog.vue';

const { Model, SharedModel } = models.api;

export default {
  name: 'PublicModels',
  components: { MangeSharedModels, DeleteDialog },
  data: () => ({
    showRecentModels: true,
    pagination: {
      limit: 12,
      skip: 0,
      total: null,
    },
  }),
  async created() {
  },
  async mounted() {
    await this.fetchModels();
    window.addEventListener('scroll', e => {
      if(document.documentElement.scrollHeight <= window.scrollY + window.innerHeight + 1) {
        this.fetchModels();
      }
    });
  },
  computed: {
    ...mapState('shared-models', ['isFindPending']),
    sharedModels: () => SharedModel.findInStore({ query: { isSystemGenerated: true, isActive: true, $sort: { createdAt: -1 } }})
  },
  methods: {
    ...mapMutations('shared-models', ['clearAll']),
    async fetchModels() {
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
    async showRecent() {
      this.pagination.skip = 0;
      this.pagination.total = null;
      await this.clearAll();
      await this.fetchModels();
    },
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
  }
}
</script>

<style scoped>
::v-deep(.v-skeleton-loader__image) {
  height: 190px;
}
</style>
