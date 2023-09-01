<template>

  <v-data-table-virtual
    v-model:expanded="expanded"
    :headers="headers"
    :items="sharedModels"
    item-value="name"
    show-expand
    single-expand="true"
    height="100%"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>
          Manage share model links
        </v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer />
        <v-btn prepend-icon="mdi-plus" flat @click.stop="openShareModelDialog">
          Create Share Link
        </v-btn>
      </v-toolbar>
      <v-progress-linear indeterminate v-if="isFindPending || isPatchPending || isRemovePending"></v-progress-linear>
    </template>

    <template v-slot:item.link="{ item }">
      <v-row>
        <!-- Added text-field for copy URL to clipboard when hosted domain is not https or localhost -->
        <v-responsive max-width="1px">
          <v-text-field :ref="'textField_' + item.raw._id" variant="plain" readonly :value="sharedModelUrl(item.raw._id)" type="hidden"></v-text-field>
        </v-responsive>
        <v-chip color="dark-grey" class="ml-2">
          {{ (item.raw._id) }}
          <v-btn end variant="plain" icon="mdi-open-in-new" :to="{ name: 'Share', params: { id: item.raw._id }}" target="_blank"></v-btn>
          <v-btn end variant="plain" icon="mdi-share" @click.stop="openShareLinkDialog(item.raw._id)"></v-btn>
          <v-btn end variant="plain" icon="mdi-delete-forever" @click.stop="deleteSharedModel(item.raw._id)" :disabled="item.raw.isSystemGenerated"></v-btn>
        </v-chip>
      </v-row>
    </template>

    <template v-slot:item.description="{ item }">
      <v-form :ref="'description_' + item.raw._id">
      <v-text-field
        density="compact"
        counter="20"
        v-model="item.raw.description"
        variant="plain"
        append-inner-icon="mdi-check"
        :disabled="item.raw.isSystemGenerated"
        :rules="[
          v => !!v || 'Description is required',
          v => (v && v.length <= 20) || 'Description must be less than 20 characters'
        ]"
        @click:append-inner="updateDescription(item.raw._id, item.raw.description)"></v-text-field>
      </v-form>
    </template>

    <template v-slot:item.createdAt="{ item }">
      <span>{{ dateFormat(item.raw.createdAt) }}</span>
    </template>
    <template v-slot:item.isActive="{ item }">
      <v-switch
        v-model="item.raw.isActive"
        hide-details
        @update:modelValue="updateSharedModel(item.raw._id, {isActive: item.raw.isActive})"
      ></v-switch>
    </template>

    <template v-slot:expanded-row="{ columns, item }">
    <td :colspan="columns.length">
      <v-container>
        <v-row>
          <v-col cols="3">
            <v-checkbox v-model="item.raw.canViewModel" :disabled="!item.raw.isActive" readonly hide-details>
              <template v-slot:label>
                <div>Can view model</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.raw.canViewModelAttributes" :disabled="!item.raw.isActive" hide-details>
              <template v-slot:label>
                <div>Can view model attributes</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.raw.canUpdateModel" :disabled="!item.raw.isActive" hide-details>
              <template v-slot:label>
                <div>Can update model attributes</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.raw.canDownloadDefaultModel" :disabled="!item.raw.isActive" hide-details>
              <template v-slot:label>
                <div>Can download original model</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.raw.canExportFCStd" :disabled="!item.raw.isActive" hide-details>
              <template v-slot:label>
                <div>Can export FCStd</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.raw.canExportSTEP" :disabled="!item.raw.isActive" hide-details>
              <template v-slot:label>
                <div>Can export STEP</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.raw.canExportSTL" :disabled="!item.raw.isActive" hide-details>
              <template v-slot:label>
                <div>Can export STL</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.raw.canExportOBJ" :disabled="!item.raw.isActive" hide-details>
              <template v-slot:label>
                <div>Can export OBJ
                </div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="9" />
          <v-col cols="3">
            <v-btn
              flat
              class="mt-2"
              :disabled="!item.raw.isActive"
              @click.stop="updateSharedModel(
                item.raw._id,
                {
                  canViewModelAttributes: item.raw.canViewModelAttributes,
                  canUpdateModel: item.raw.canUpdateModel,
                  canExportFCStd: item.raw.canExportFCStd,
                  canExportSTEP: item.raw.canExportSTEP,
                  canExportSTL: item.raw.canExportSTL,
                  canExportOBJ: item.raw.canExportOBJ,
                  canDownloadDefaultModel: item.raw.canDownloadDefaultModel,
                }
              )"
            >Update Permissions</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </td>
    </template>

  </v-data-table-virtual>

  <ShareModelDialog
    v-if="model"
    :is-active="isShareModelDialogActive"
    :model-id="model._id"
    ref="shareModelDialog"
  />
  <ShareLinkDialog
    :is-active="isShareLinkDialogActive"
    :shared-model-id="activeShareModelId"
    ref="shareLinkDialog"
  />
</template>

<script>
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

import ShareModelDialog from '@/components/ShareModelDialog';
import ShareLinkDialog from '@/components/ShareLinkDialog';

const { Model, SharedModel } = models.api;

export default {
  name: 'MangeSharedModels',
  components: { ShareModelDialog, ShareLinkDialog },
  props: {
    model: Object,
  },
  data () {
    return {
      expanded: [],
      singleExpand: false,
      headers: [
        {
          title: 'Link',
          // align: 'start',
          sortable: false,
          key: 'link',
        },
        { title: 'Description', key: 'description', sortable: false, width: '400px'},
        { title: 'Created At', key: 'createdAt', sortable: true},
        { title: 'Active', key: 'isActive', sortable: true},
      ],
      isShareModelDialogActive: false,
      isShareLinkDialogActive: false,
      activeShareModelId: '',
    }
  },
  computed: {
    ...mapState('shared-models', ['isFindPending', 'isPatchPending', 'isRemovePending']),
    sharedModels: (vm) => {
      if (!vm.model?._id) {
        return [];
      }
      return SharedModel.findInStore({ query: { cloneModelId: vm.model._id.toString() } }).data
    },
  },
  methods: {
    dateFormat(number) {
      const date = new Date(number);
      return date.toDateString();
    },
    sharedModelUrl: (sharedModelId) => {
      return window.location.origin + '/share/' + sharedModelId;
    },
    updateSharedModel: async (id, data) => {
      await SharedModel.patch(id, data);
    },
    deleteSharedModel: async (id) => {
      await SharedModel.remove(id);
    },
    async updateDescription(id, val) {
      const { ['description_' + id]:form } = this.$refs;
      const { valid } = await form.validate();
      if (valid) {
        await this.updateSharedModel(
          id,
          {
            description: val
          }
        );
      }
    },
    openShareModelDialog() {
      this.$refs.shareModelDialog.$data.dialog = true;
    },
    openShareLinkDialog(sharedModelId) {
      this.isShareLinkDialogActive = true;
      this.activeShareModelId = sharedModelId;
      this.$refs.shareLinkDialog.$data.dialog = true;
    }
  },
}
</script>

<style scoped>

</style>
