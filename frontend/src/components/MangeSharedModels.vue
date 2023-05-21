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
        <v-toolbar-title class="text-center">Mange share model links</v-toolbar-title>
      </v-toolbar>
      <v-progress-linear indeterminate v-if="isFindPending || isPatchPending || isRemovePending"></v-progress-linear>
    </template>

    <template v-slot:item.link="{ item }">
      <v-row>
        <!-- Added text-field for copy URL to clipboard when hosted domain is not https or localhost -->
        <v-responsive max-width="1px">
          <v-text-field :id="item.raw._id" variant="plain" readonly :value="sharedModelUrl(item.raw._id)" type="hidden"></v-text-field>
        </v-responsive>
        <v-chip color="dark-grey" class="ml-2">
          {{ sharedModelUrl(item.raw._id) }}
          <v-btn end variant="plain" icon="mdi-open-in-new" :to="{ name: 'Share', params: { id: item.raw._id }}" target="_blank"></v-btn>
          <v-btn end variant="plain" icon="mdi-content-copy" @click.stop="copyToClipboard(item.raw._id, sharedModelUrl(item.raw._id))"></v-btn>
          <v-btn end variant="plain" icon="mdi-delete-forever" @click.stop="deleteSharedModel(item.raw._id)"></v-btn>
        </v-chip>
      </v-row>
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
                }
              )"
            >Update Permissions</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </td>
    </template>

  </v-data-table-virtual>

</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import { models } from '@feathersjs/vuex';

const { Model, SharedModel } = models.api;

export default {
  name: 'MangeSharedModels',
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
        { title: 'Created At', key: 'createdAt', sortable: true},
        { title: 'Active', key: 'isActive', sortable: true},
      ],
    }
  },
  computed: {
    ...mapState('shared-models', ['isFindPending', 'isPatchPending', 'isRemovePending']),
    sharedModels: (vm) => {
      if (!vm.model) {
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
    async copyToClipboard(id, textToCopy) {
      // Navigator clipboard api needs a secure context (https)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        try {
          document.getElementById(id).select();
          document.execCommand('copy');
        } catch (error) {
          console.error(error);
        }
      }
    },
  },
}
</script>

<style scoped>

</style>
