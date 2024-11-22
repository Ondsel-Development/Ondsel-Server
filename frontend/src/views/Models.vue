<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <Main>
    <template #title>
      <v-icon icon="mdi-cube-outline" />
      My Models
    </template>
    <template #actions>
      <v-btn
        color="success"
        variant="elevated"
        min-width="200"
        prepend-icon="mdi-plus"
        :to="{ name: 'Home'}"
        v-if="loggedInUser && loggedInUser.user.constraint.canUpload"
      >
        Upload New Model
      </v-btn>
      <v-btn
        color="secondary"
        variant="elevated"
        min-width="200"
        prepend-icon="mdi-plus"
        v-else
        disabled
      >
        Upload New Model
      </v-btn>

    </template>
    <template #content>
      <br>
      <v-row dense>
        <v-col
          v-for="(model) in myModels.data"
          :key="model._id"
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
            @click="$router.push({ name: 'Home', params: { id: model._id } })"
          >
            <template v-if="model.thumbnailUrl">
              <v-img
                :src="model.thumbnailUrl"
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
                <div class="d-flex align-center flex-column">
                  <v-icon icon="mdi-drawing" size="x-large" color="#8D8D8D" />
                  <span class="mt-2" style="color: #8D8D8D">Click to generate thumbnail</span>
                </div>
              </v-sheet>
            </template>

            <v-card-title style="background: #fafafa;">
              <span class="text-body-1">
                {{ model.customerFileName }}
              </span>
            </v-card-title>

            <v-card-subtitle style="background: #fafafa;">
              {{ dateFormat(model.createdAt) }}
            </v-card-subtitle>

          <v-card-actions style="background: #fafafa;">
            <v-spacer></v-spacer>
            <DeleteDialog :model="model" @delete-model="deleteModel" />
            <v-btn
              icon="mdi-share-variant"
              density="comfortable"
              @click.stop="sharedModelDrawerClicked(model)"
            ></v-btn>

            </v-card-actions>
          </v-card>
        </v-col>
        <template v-if="myModels.data.length === 0 && isFindPending">
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

                <v-spacer />
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
        <template v-if="myModels.data.length && isFindPending">
          <v-progress-circular indeterminate></v-progress-circular>
        </template>
        <template v-else-if="myModels.data.length === this.pagination.total">
          <div class="text-grey-darken-1">You reached the end!</div>
        </template>
        <template v-else>
          <v-btn flat variant="text" @click.stop="fetchDataOnScroll">Load more</v-btn>
        </template>
      </v-row>
    </template>

  </Main>
  <v-navigation-drawer
    v-model="manageSharedModelsDrawer"
    location="right"
    width="1100"
    temporary
  >
    <MangeSharedModels :model="activeModel"/>
  </v-navigation-drawer>

</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { models } from '@feathersjs/vuex';

import Main from '@/layouts/default/Main.vue';
import MangeSharedModels from '@/components/MangeSharedModels';
import DeleteDialog from '@/components/DeleteDialog.vue';
import scrollListenerMixin from '@/mixins/scrollListenerMixin';

const { Model, SharedModel } = models.api;

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Models',
  components: { Main, MangeSharedModels, DeleteDialog },
  mixins: [scrollListenerMixin],
  data: () => ({
    search: '',
    showRecentModels: true,
    pagination: {
      limit: 25,
      skip: 0,
      total: null,
    },
    manageSharedModelsDrawer: false,
    activeModel: null,
  }),
  async created() {
  },
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
    ...mapState('models', ['isFindPending']),
    myModels: () => Model.findInStore({ query: { isSharedModel: false }}),
    ...mapState('auth', { loggedInUser: 'payload' }),
  },
  methods: {
    ...mapMutations('models', ['clearAll']),
    async fetchDataOnScroll() {
      if (this.isFindPending) {
        return;
      }
      // const models = await Model.find({query: {}, pipelines: [{custFileName: { $regex: 'c3dfe466', $options: 'igm' }}]})
      if (this.myModels.data.length !== this.pagination.total) {
        const models = await Model.find({
          query: {
            $limit: this.pagination.limit,
            $skip: this.pagination.skip,
            isSharedModel: false,
            $sort: {
              // createdAt: this.showRecentModels? 1 : -1,
              createdAt: -1,
            }
          }
        });
        this.pagination.skip = models.skip + this.pagination.limit;
        this.pagination.total = models.total;
      }
    },
    // async showRecent() {
    //   this.pagination.skip = 0;
    //   this.pagination.total = null;
    //   await this.clearAll();
    //   await this.fetchModels();
    // },
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
    async sharedModelDrawerClicked(model) {
      this.activeModel = model;
      this.manageSharedModelsDrawer = !this.manageSharedModelsDrawer;
      await SharedModel.find({
        query: {
          cloneModelId: model._id,
          $paginate: false
        },
      })
    },
    async deleteModel(model) {
      await Model.remove(model._id)
    },
  }
}
</script>

<style scoped>
::v-deep(.v-skeleton-loader__image) {
  height: 190px;
}
</style>
