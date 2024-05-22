<template>
  <Main>
    <template #title>
      <div class="d-flex flex-row justify-center" style="align-items: center;">
        <span class="mr-2">File</span> <b>{{ file.custFileName }}</b>
      </div>
    </template>
    <template #content>
      <v-sheet class="d-flex flex-row justify-space-between flex-wrap">
        <v-card min-width="32em" class="flex-md-grow-1 ma-1" border>
          <v-card-text>
            <v-sheet class="d-flex flex-column">
              <v-sheet name="buttons">
                <a
                  v-if="file.modelId"
                  :href="fileModelUrl"
                  target="blank"
                  style="text-decoration: none; color: inherit;"
                >
                  <v-btn
                    color="secondary"
                    variant="elevated"
                    append-icon="mdi-open-in-new"
                  >Explore</v-btn>
                </a>
                <v-btn
                  v-if="!publicView && workspace.curation?.representativeFile?._id !== file._id"
                  class="mx-2"
                  color="decoration"
                  flat
                  :disabled="!canUserWrite"
                  @click="$refs.representWorkspace.openRepresentWorkspaceDialog();"
                  icon="mdi-camera-off"
                ></v-btn>
                <v-btn
                  v-if="!publicView && workspace.curation?.representativeFile?._id === file._id"
                  class="mx-2"
                  color="decoration"
                  flat
                  :disabled="!canUserWrite"
                  @click="$refs.representWorkspace.openRepresentWorkspaceDialog();"
                  icon="mdi-camera"
                ></v-btn>
                <v-btn
                  class="mx-2"
                  color="secondary"
                  variant="elevated"
                  :disabled="isFileDownloadInProgress || !user"
                  :loading="isFileDownloadInProgress"
                  @click="downloadFile(file.currentVersion.uniqueFileName, file.custFileName)"
                >
                  Download Active
                </v-btn>
                <v-btn
                  v-if="!publicView"
                  class="mx-2"
                  color="secondary"
                  variant="elevated"
                  :disabled="!canUserWrite"
                  @click="$refs.deleteFile.openDeleteFileDialog();"
                >
                  Delete File
                </v-btn>
                <v-btn
                  v-if="!publicView"
                  class="mx-2"
                  color="secondary"
                  variant="elevated"
                  :disabled="!canUserWrite"
                  @click="$refs.uploadNewVersionFile.openFileUploadDialog();"
                >Upload New Version</v-btn>
              </v-sheet>
              <v-sheet name="view-port">
                <v-img
                  v-if="file.model && file.model.thumbnailUrlCache"
                  height="30em"
                  :src="file.model.thumbnailUrlCache"
                  cover
                ></v-img>
                <v-sheet
                  v-else
                  color="#F4F4F4"
                  height="30em"
                  width="100%"
                  class="d-flex justify-center align-center"
                >
                  <v-icon icon="mdi-file" style="color: #8D8D8D" cover />
                </v-sheet>
              </v-sheet>
              <v-sheet name="tables">
                <file-versions-table :file="file" :can-user-write="canUserWrite" :public-view="publicView" />
              </v-sheet>
              <v-sheet name="return buttons">
                <v-btn
                  color="secondary"
                  variant="elevated"
                  @click="gotoWorkspace()"
                >
                  Go To Workspace
                </v-btn>
              </v-sheet>
            </v-sheet>
            <represent-workspace-dialog v-if="!publicView" ref="representWorkspace" :file="file" :workspace="workspace" />
            <upload-new-version-file-dialog v-if="!publicView" ref="uploadNewVersionFile" :file="file" />
            <delete-file-dialog v-if="!publicView" ref="deleteFile" :file="file" @done-with-file="gotoWorkspace" />
          </v-card-text>
        </v-card>
        <v-card min-width="32em" class="ma-1" border>
          <v-card-title>{{ file.custFileName }}</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="propertyHeaders"
              :items="properties"
              density="compact"
              item-key="name"
            >
              <template v-slot:bottom>
               <!-- this removes the pagination footer -->
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-sheet>
    </template>
  </Main>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';
import { models } from '@feathersjs/vuex';
// import _ from 'lodash';

import Main from '@/layouts/default/Main.vue';
import DeleteFileDialog from "@/components/DeleteFileDialog.vue";
import UploadNewVersionFileDialog from "@/components/UploadNewVersionFileDialog.vue";
import RepresentWorkspaceDialog from "@/components/RepresentWorkspaceDialog.vue";
import FileVersionsTable from "@/components/FileVersionsTable.vue";
import fileDownloadMixin from "@/mixins/fileDownloadMixin";

const { File } = models.api;

export default {
  name: 'WorkspaceFile',
  components: {
    FileVersionsTable, RepresentWorkspaceDialog, UploadNewVersionFileDialog, DeleteFileDialog,
    Main
  },
  mixins: [fileDownloadMixin],
  data() {
    return {
      file: {},
      workspace: {},
      publicView: false,
      propertyHeaders: [
        { title: 'Property', align: 'end', sortable: false, key: 'name' },
        { title: 'Value', align: 'start', key: 'value'},
      ],
      properties: [],
    };
  },
  async created() {
    const slug = this.$route.params.slug;
    const wsName = this.$route.params.wsname;
    const fileId = this.$route.params.fileid;
    this.file = await File.get(fileId);
    this.workspace = await this.getWorkspaceByNamePrivate({wsName: wsName, orgName: slug} );
    if (this.workspace) {
      // if (this.workspace.organization._id !== this.currentOrganization._id) {
      //   // if the user has private access to the ws generically, but isn't actually representing that org, then
      //   // set the publicView flag anyway
      //   this.publicView = true;
      // }
    } else {
      this.publicView = true;
      this.workspace = await this.getWorkspaceByNamePublic({wsName: wsName, orgName: slug} );
    }
    this.properties = [
      {
        name: 'Id',
        value: this.file._id.toString(),
      },
      {
        name: 'Workspace',
        value: `${this.file.workspace.name} [${this.file.workspace.refName}]`,
      },
      {
        name: 'Directory',
        value: this.file.directory.name,
      },
      {
        name: 'Revision Count',
        value: this.file.versions.length || 0,
      },
      {
        name: 'Active Revision',
        value: this.refLabel(this.file.currentVersionId.toString()),
      },
    ]
  },
  computed: {
    ...mapGetters('app', ['currentOrganization', 'selfPronoun', 'selfName']),
    ...mapState('auth', ['user']),
    userRouteFlag: vm => vm.$route.path.startsWith("/user"),
    fileModelUrl: vm => `${window.location.origin}/model/${vm.file.modelId}`,
    canUserWrite: vm => vm.workspace?.haveWriteAccess || false,
  },
  methods: {
    ...mapActions('app', [
      'getFileByIdPublic',
      'getWorkspaceByNamePrivate',
      'getWorkspaceByNamePublic',
    ]),
    refLabel(refId) {
      return ".." + refId.substr(-6);
    },
    async gotoWorkspace() {
      const slug = this.$route.params.slug;
      const wsName = this.$route.params.wsname;
      if (this.userRouteFlag) {
        this.$router.push({ name: 'UserWorkspaceHome', params: { slug: slug, wsname: wsName } });
      } else {
        this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: slug, wsname: wsName } });
      }
    }
  },
};
</script>

<style>
/* Add your custom styles here */
</style>

