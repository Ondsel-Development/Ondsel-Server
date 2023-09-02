<template>
  <v-container>
    <v-row class="pl-4 pr-4">
<!--      <v-col cols="6">-->
<!--        <v-text-field-->
<!--          v-model="search"-->
<!--          outlined-->
<!--          hide-details-->
<!--          placeholder="Search (by name)"-->
<!--          append-icon="mdi-magnify"-->
<!--        />-->
<!--      </v-col>-->
      <div class="text-h5">My Models</div>
      <v-spacer />
      <v-col cols="3" class="text-right">
<!--        <v-checkbox v-model="showRecentModels" label="Show Recent" @click="showRecent"></v-checkbox>-->
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
        v-for="(model, i) in myModels.data"
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
              <span style="color: #8D8D8D">?</span>
            </v-sheet>
          </template>

          <v-card-title>
            {{ model.customerFileName }}
          </v-card-title>

          <v-card-subtitle>
            {{ dateFormat(model.createdAt) }}
          </v-card-subtitle>

          <v-card-actions>
            <v-btn
              color="orange-lighten-2"
              variant="text"
              :to="{ name: 'Home', params: { id: model._id } }"
            >
              Explore
            </v-btn>

            <v-spacer></v-spacer>
            <DeleteDialog :model="model" @delete-model="deleteModel" />
            <v-btn
              icon="mdi-format-list-checks"
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
      <template v-if="myModels.data.length && isFindPending">
        <v-progress-circular indeterminate></v-progress-circular>
      </template>
      <template v-else-if="myModels.data.length === this.pagination.total">
        <div class="text-grey-darken-1">You reached the end!</div>
      </template>
      <template v-else>
        <v-btn flat variant="text" @click.stop="fetchModels">Load more</v-btn>
      </template>
    </v-row>
  </v-container>

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
import { mapState, mapActions, mapMutations } from 'vuex';
import { models } from '@feathersjs/vuex';

import MangeSharedModels from '@/components/MangeSharedModels';
import DeleteDialog from '@/components/DeleteDialog.vue';

const { Model, SharedModel } = models.api;

export default {
  name: 'Models',
  components: { MangeSharedModels, DeleteDialog },
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
    await this.fetchModels();
    window.addEventListener('scroll', e => {
      if(document.documentElement.scrollHeight <= window.scrollY + window.innerHeight + 1) {
        this.fetchModels();
      }
    });
  },
  computed: {
    ...mapState('models', ['isFindPending']),
    myModels: () => Model.findInStore({ query: { isSharedModel: false }})
  },
  methods: {
    ...mapMutations('models', ['clearAll']),
    async fetchModels() {
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
