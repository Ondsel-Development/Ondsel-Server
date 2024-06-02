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
        <v-btn
          color="secondary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click.stop="openShareModelDialog">
          Create Share Link
        </v-btn>
      </v-toolbar>
      <v-progress-linear indeterminate v-if="isFindPending || isPatchPending || isRemovePending"></v-progress-linear>
    </template>

    <template v-slot:item.link="{ item }">
      <v-row>
        <!-- Added text-field for copy URL to clipboard when hosted domain is not https or localhost -->
        <v-responsive max-width="1px">
          <v-text-field :ref="'textField_' + item._id" variant="plain" readonly :value="sharedModelUrl(item._id)" type="hidden"></v-text-field>
        </v-responsive>
        <v-chip color="dark-grey" class="ml-2">
          {{ (item._id) }}
          <v-btn
            end
            color="decoration"
            flat
            icon="mdi-open-in-new"
            :to="{ name: 'Share', params: { id: item._id }}"
            target="_blank"
          ></v-btn>
          <v-btn
            end
            color="decoration"
            flat
            icon="mdi-share"
            @click.stop="openShareLinkDialog(item._id)"
          ></v-btn>
          <v-btn
            end
            color="decoration"
            flat
            icon="mdi-delete-forever"
            @click.stop="deleteSharedModel(item._id)"
            :disabled="item.isSystemGenerated"
          ></v-btn>
        </v-chip>
      </v-row>
    </template>

    <template v-slot:item.description="{ item }">
      <v-form :ref="'description_' + item._id">
      <v-text-field
        density="compact"
        counter="20"
        v-model="item.description"
        variant="plain"
        append-inner-icon="mdi-check"
        :disabled="item.isSystemGenerated"
        :rules="[
          v => !!v || 'Description is required',
          v => (v && v.length <= 20) || 'Description must be less than 20 characters'
        ]"
        @click:append-inner="updateDescription(item._id, item.description)"></v-text-field>
      </v-form>
    </template>

    <template v-slot:item.createdAt="{ item }">
      <span>{{ dateFormat(item.createdAt) }}</span>
    </template>
    <template v-slot:item.isActive="{ item }">
      <v-switch
        v-model="item.isActive"
        hide-details
        :disabled="item.isSystemGenerated && !user.constraint.canDisableAutomaticGenerationOfPublicLink"
        @update:modelValue="updateSharedModel(item._id, {isActive: item.isActive})"
      ></v-switch>
    </template>
    <template v-slot:item.protection="{ item }">
      <v-combobox
        v-model="item.protection"
        density="compact"
        hide-details
        :items="['Listed', 'Unlisted', 'Pin']"
        :disabled="item.isSystemGenerated && !user.constraint.canDisableAutomaticGenerationOfPublicLink"
        @update:modelValue="updateSharedModel(item._id, { protection: item.protection })"
      ></v-combobox>
    </template>

    <template v-slot:expanded-row="{ columns, item }">
    <td :colspan="columns.length">
      <v-container>
        <v-row>
          <v-col cols="3">
            <v-checkbox v-model="item.canViewModel" :disabled="!item.isActive" readonly hide-details>
              <template v-slot:label>
                <div>Can view model</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.canViewModelAttributes" :disabled="!item.isActive" hide-details>
              <template v-slot:label>
                <div>Can view model attributes</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.canUpdateModel" :disabled="!item.isActive" hide-details>
              <template v-slot:label>
                <div>Can update model attributes</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.canDownloadDefaultModel" :disabled="!item.isActive" hide-details>
              <template v-slot:label>
                <div>Can download original model</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.canExportFCStd" :disabled="!item.isActive" hide-details>
              <template v-slot:label>
                <div>Can export FCStd</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.canExportSTEP" :disabled="!item.isActive" hide-details>
              <template v-slot:label>
                <div>Can export STEP</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.canExportSTL" :disabled="!item.isActive" hide-details>
              <template v-slot:label>
                <div>Can export STL</div>
              </template>
            </v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-checkbox v-model="item.canExportOBJ" :disabled="!item.isActive" hide-details>
              <template v-slot:label>
                <div>Can export OBJ
                </div>
              </template>
            </v-checkbox>
          </v-col>
          <v-row>
            <v-col v-if="item.protection === 'Pin'" cols="6">
              <div class="d-flex flex-row align-center">
                <span class="text-body-1">PIN</span>
                <v-otp-input v-model="item.pin" type="text" disabled></v-otp-input>
              </div>
            </v-col>
          </v-row>
          <v-col cols="9" />
          <v-col cols="3">
            <v-btn
              color="secondary"
              variant="elevated"
              class="mt-2"
              :disabled="!item.isActive"
              @click.stop="updateSharedModel(
                item._id,
                {
                  canViewModelAttributes: item.canViewModelAttributes,
                  canUpdateModel: item.canUpdateModel,
                  canExportFCStd: item.canExportFCStd,
                  canExportSTEP: item.canExportSTEP,
                  canExportSTL: item.canExportSTL,
                  canExportOBJ: item.canExportOBJ,
                  canDownloadDefaultModel: item.canDownloadDefaultModel,
                }
              )"
            >Update Permissions</v-btn>
          </v-col>
        </v-row>
        <v-divider/>
        <v-row>
          <v-col cols="3" class="text-right">
            <span>Search tags:</span>
          </v-col>
          <v-col cols="9" class="text-left">
            <div v-if="item.curation?.tags && item.curation?.tags?.length > 0">
              <v-chip-group>
                <v-chip v-for="(tag) in item.curation?.tags">{{tag}}</v-chip>
              </v-chip-group>
            </div>
            <span v-else><i>None</i></span>
          </v-col>
          <v-col cols="9">
          </v-col>
          <v-col cols="3" class="text-right">
            <v-btn
              color="secondary"
              variant="elevated"
              flag
              class="mt-2"
              :disabled="!item.isActive || !item.curation"
              @click.stop="openEditTagsDialog(item._id, item.curation)"
            >
              Update Tags
            </v-btn>
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
  <EditTagsDialog
    :is-active="isEditTagsDialogActive"
    ref="editTagsDialog"
    @save-tags="saveTags"
  />

</template>

<script>
import { mapState } from 'vuex';
import { models } from '@feathersjs/vuex';

import ShareModelDialog from '@/components/ShareModelDialog';
import ShareLinkDialog from '@/components/ShareLinkDialog';
import EditTagsDialog from "@/components/EditTagsDialog.vue";
import _ from "lodash";

const { SharedModel } = models.api;

export default {
  name: 'MangeSharedModels',
  components: {EditTagsDialog, ShareModelDialog, ShareLinkDialog },
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
        { title: 'Description', key: 'description', sortable: false, width: '270px'},
        { title: 'Created At', key: 'createdAt', sortable: true},
        { title: 'Protection', key: 'protection', sortable: true, width: '170px'},
        { title: 'Active', key: 'isActive', sortable: true},
      ],
      isShareModelDialogActive: false,
      isShareLinkDialogActive: false,
      isEditTagsDialogActive: false,
      activeShareModelId: '',
      activeCuration: {},
    }
  },
  computed: {
    ...mapState('auth', ['user']),
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
    },
    openEditTagsDialog(sharedModelId, curation) {
      this.isEditTagsDialogActive = true;
      this.activeCuration = curation;
      this.$refs.editTagsDialog.$data.dialog = true;
      this.$refs.editTagsDialog.$data.newTags = curation.tags || [];
    },
    async saveTags() {
      this.$refs.editTagsDialog.$data.isPatchPending = true;
      const tagList = this.$refs.editTagsDialog.$data.newTags;
      const lowercaseTags = tagList.map(tag => tag.toLowerCase().trim());
      const cleanTags = _.uniq(lowercaseTags);
      let curation = this.activeCuration;
      curation.tags = cleanTags;
      await SharedModel.patch(
        this.activeCuration._id,
        {
          'curation': curation,
        }
      ).then(() => {
        this.$refs.editTagsDialog.$data.dialog = false;
      }).catch((e) => {
        const msg = e.message;
        this.$refs.editTagsDialog.snackerMsg = e.message;
        this.$refs.editTagsDialog.showSnacker = true;
        console.log(msg);
      });
      this.$refs.editTagsDialog.$data.isPatchPending = false;
    },
  },
}
</script>

<style scoped>

</style>
<script setup>
</script>
