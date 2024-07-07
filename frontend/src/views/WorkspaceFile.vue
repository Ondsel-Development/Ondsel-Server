<template>
  <Main>
    <template #title>
      <div class="d-flex flex-row justify-center" style="align-items: center;">
        <span class="mr-2">File</span> <b>{{ file.custFileName }}</b>
      </div>
    </template>
    <template #content>
      <v-sheet class="d-flex flex-row justify-space-between flex-wrap">
        <v-sheet class="flex-md-grow-1 ma-1 border-md pa-1">
            <v-sheet class="d-flex flex-column">
              <v-sheet name="buttons">
                <a
                  v-if="file.modelId"
                  :href="fileModelUrl"
                  target="_blank"
                  class="mr-2 mt-2"
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
                  class="mr-2 mb-n1"
                  color="decoration"
                  flat
                  :disabled="!canUserWrite"
                  @click="$refs.representWorkspace.openRepresentWorkspaceDialog();"
                  icon="mdi-camera-off"
                ></v-btn>
                <v-btn
                  v-if="!publicView && workspace.curation?.representativeFile?._id === file._id"
                  class="mr-2 mb-n1"
                  color="decoration"
                  flat
                  :disabled="!canUserWrite"
                  @click="$refs.representWorkspace.openRepresentWorkspaceDialog();"
                  icon="mdi-camera"
                ></v-btn>
                <v-btn
                  class="mr-2 mt-2"
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
                  class="mr-2 mt-2"
                  color="secondary"
                  variant="elevated"
                  :disabled="!canUserWrite"
                  @click="$refs.deleteFile.openDeleteFileDialog();"
                >
                  Delete File
                </v-btn>
                <v-btn
                  v-if="!publicView"
                  class="mr-2 mt-2"
                  color="secondary"
                  variant="elevated"
                  :disabled="!canUserWrite"
                  @click="$refs.uploadNewVersionFile.openFileUploadDialog();"
                >Upload New Version</v-btn>
              </v-sheet>
              <file-view-port
                :file="file"
                :version-id="viewPortVersionId"
                class="mt-2"
                @active-version-model-seen="seeActiveVersionModel"
              ></file-view-port>
              <v-sheet name="tables">
                <file-versions-table
                  :file="file"
                  :can-user-write="canUserWrite"
                  :public-view="publicView"
                  :visible-version-id="viewPortVersionId"
                  :active-version-thumbnail-available="activeVersionThumbnailAvailable"
                  @change-visible-version="changeViewPort"
                  @changed-file="reloadFileAndWorkspace"
                >
                </file-versions-table>
              </v-sheet>
              <v-sheet
                name="return buttons"
                class="mt-4"
              >
                <v-btn
                  color="secondary"
                  variant="elevated"
                  @click="gotoWorkspace()"
                  class="mr-2"
                >
                  Go To Workspace
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="elevated"
                  @click="gotoDirectory()"
                >
                  Go To Directory
                </v-btn>
              </v-sheet>
            </v-sheet>
            <represent-workspace-dialog v-if="!publicView" ref="representWorkspace" :file="file" :workspace="workspace" />
            <upload-new-version-file-dialog
              v-if="!publicView"
              ref="uploadNewVersionFile"
              :file="file"
              @changed-file="reloadPage"
            ></upload-new-version-file-dialog>
            <delete-file-dialog v-if="!publicView" ref="deleteFile" :file="file" @done-with-file="gotoWorkspace" />
        </v-sheet>
        <v-card min-width="24em" class="ma-1" border>
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
import FileViewPort from "@/components/FileViewPort.vue";

const { File } = models.api;

export default {
  name: 'WorkspaceFile',
  components: {
    FileViewPort,
    FileVersionsTable, RepresentWorkspaceDialog, UploadNewVersionFileDialog, DeleteFileDialog,
    Main
  },
  mixins: [fileDownloadMixin],
  data() {
    return {
      activeVersionThumbnailAvailable: false,
      file: {},
      workspace: {},
      publicView: false,
      propertyHeaders: [
        { title: 'Property', align: 'end', sortable: false, key: 'name' },
        { title: 'Value', align: 'start', key: 'value'},
      ],
      properties: [],
      somethingTrue: true,
      viewPortVersionId: null, // default to null on first load; which defaults to Active
      wsName: '',
      orgRefName: '',
      slug: '',
      representingWorkspaceOrg: false,
    };
  },
  async created() {
    this.slug = this.$route.params.slug;
    this.wsName = this.$route.params.wsname;
    const fileId = this.$route.params.fileid;
    this.orgRefName = '';
    if (this.userRouteFlag) {
      const userDetail = await this.getUserByIdOrNamePublic(this.slug);
      if (!userDetail) {
        console.log(`No such user for ${this.slug}`);
        this.$router.push({ name: 'PageNotFound' });
        return;
      }
      this.orgRefName = userDetail._id.toString();
    } else {
      this.orgRefName = this.slug;
    }
    await this.reloadFileAndWorkspace();
    this.properties = [
      {
        name: 'Id',
        value: fileId,
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
        name: 'Version Count',
        value: this.file.versions.length || 0,
      },
      {
        name: 'Active Version',
        value: this.refLabel(this.file.currentVersionId.toString()),
      },
    ]
  },
  computed: {
    ...mapGetters('app', ['currentOrganization', 'selfPronoun', 'selfName']),
    ...mapState('auth', ['user']),
    userRouteFlag: vm => vm.$route.path.startsWith("/user"),
    fileModelUrl: vm => `${window.location.origin}/model/${vm.file.modelId}`,
    canUserWrite: vm => (vm.workspace?.haveWriteAccess && vm.representingWorkspaceOrg) || false,
  },
  methods: {
    ...mapActions('app', [
      'getUserByIdOrNamePublic',
      'getFileByIdPublic',
      'getWorkspaceByNamePrivate',
      'getWorkspaceByNamePublic',
    ]),
    refLabel(refId) {
      return ".." + refId.substr(-6);
    },
    async reloadPage() {
      window.location.reload();
    },
    async reloadFileAndWorkspace() {
      const fileId = this.$route.params.fileid;
      try {
        this.file = await File.get(fileId);
      } catch {
        // do nothing
      }
      if (!this.file?._id) { // a failure can return an empty object. So go further.
        this.file = await this.getFileByIdPublic(fileId);
      }
      this.workspace = await this.getWorkspaceByNamePrivate({wsName: this.wsName, orgName: this.orgRefName} );
      if (this.workspace) {
        if (this.workspace.organization._id !== this.currentOrganization._id) {
          // if the user has private access to the ws generically, but isn't actually representing that org, then
          // set the publicView flag anyway
          this.publicView = true;
        }
      } else {
        this.publicView = true;
        this.workspace = await this.getWorkspaceByNamePublic({wsName: this.wsName, orgName: this.slug} );
      }
      this.viewPortVersionId = this.file.currentVersionId.toString();
      this.representingWorkspaceOrg = this.workspace.organizationId.toString() === this.currentOrganization._id.toString();
    },
    async gotoWorkspace() {
      const slug = this.$route.params.slug;
      const wsName = this.$route.params.wsname;
      if (this.userRouteFlag) {
        this.$router.push({ name: 'UserWorkspaceHome', params: { slug: slug, wsname: wsName } });
      } else {
        this.$router.push({ name: 'OrgWorkspaceHome', params: { slug: slug, wsname: wsName } });
      }
    },
    async gotoDirectory() {
      const slug = this.$route.params.slug;
      const wsName = this.$route.params.wsname;
      const dirId = this.file.directory._id.toString();
      if (this.userRouteFlag) {
        this.$router.push({ name: 'UserWorkspaceDir', params: { slug: slug, wsname: wsName, dirid: dirId } });
      } else {
        this.$router.push({ name: 'OrgWorkspaceDir', params: { slug: slug, wsname: wsName, dirid: dirId } });
      }
    },
    async changeViewPort(versionId) {
      this.viewPortVersionId = versionId;
    },
    seeActiveVersionModel() {
      this.activeVersionThumbnailAvailable = true;
    }
  },
};
</script>

<style>
/* Add your custom styles here */
</style>

