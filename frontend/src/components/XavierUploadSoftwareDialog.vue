<!--
SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
  >
    <v-form v-model="isValid" @submit.prevent="commitNewVersion">
      <v-card width="500" max-height="800">
        <v-card-title><div class="text-center">Upload new file</div></v-card-title>
        <v-card-text>
          <v-text-field
            v-model="originalFilename"
            label="Original Filename"
            :rules="[rules.isRequired]"
          ></v-text-field>
          <v-text-field
            v-model="uniqueFilename"
            label="filename to upload to S3 as"
            readonly
          ></v-text-field>
          <v-select
            v-model="cadence"
            label="Cadence"
            :rules="[rules.isRequired]"
            :items="['stable', 'weekly-builds']"
          ></v-select>
          <v-select
            v-if="cadence==='stable'"
            v-model="releaseTarget"
            label="Release Target"
            :rules="[rules.confirmReleaseTarget]"
            :items="releaseFileTypes"
          ></v-select>
          <v-select
            v-if="cadence==='weekly-builds'"
            v-model="weeklyTarget"
            label="Weekly Build Target"
            :rules="[rules.confirmWeeklyTarget]"
            :items="weeklyFileTypes"
          ></v-select>
          <v-text-field
            v-if="cadence==='stable'"
            v-model="version"
            :rules="[rules.confirmVersion, rules.minCharacter]"
            label="Release Version"
          ></v-text-field>
          <p>DO NOT CONFIRM UNTIL YOU HAVE UPLOADED THE S3 FILE VIA AWS!!!</p>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            color="cancel"
            variant="elevated"
            @click="clearFieldsCloseDialog()"
          >Cancel</v-btn>
          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
          >Confirm Details</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import rules from '@/mixins/rules';
import { v4 as uuidv4 } from 'uuid';
import { mapState } from 'vuex';
import {models} from "@feathersjs/vuex";

const { Publisher } = models.api;

export default {
  name: "XavierUploadSoftwareDialog",
  mixins: [rules],
  emits: ['uploadedFile'],
  props: {
    releaseFileTypes: {
      type: Array,
      default: [],
    },
    weeklyFileTypes: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      dialog: false,
      newFile: null,
      error: null,
      cadence: null,
      releaseTarget: null,
      weeklyTarget: null,
      version: null,
      warningMsg: '',
      errorMsg: '',
      disableUpload: true,
      isValid: true,
      originalFilename: '',
      uniqueFilename: '',
      rules: {
        isRequired: v => !!v || 'This field is required',
        confirmReleaseTarget: v => this.checkReleaseTarget(v),
        confirmWeeklyTarget: v => this.checkWeeklyTarget(v),
        confirmVersion: v => this.checkVersion(v),
        minCharacter: v => (v && (v.length >= 8 || v.length===0)) || 'Minimum 8 characters',
      },
    }
  },
  computed: {
    ...mapState('auth', ['accessToken']),
  },
  created() {
    this.uniqueFilename = `${uuidv4()}.OES`;
  },
  methods: {
    clearFieldsCloseDialog() {
      this.cadence = null;
      this.releaseTarget = null;
      this.weeklyTarget = null;
      this.version = null;
      this.warningMsg = '';
      this.errorMsg = '';
      this.originalFilename = '';
      this.uniqueFilename = '';
      this.uniqueFilename = `${uuidv4()}.OES`;
      this.dialog = false;
    },
    checkReleaseTarget(rawText) {
      if (this.cadence === 'stable') {
        if (!rawText) {
          return "Target not chosen"
        }
        if (!this.originalFilename.includes(rawText)) {
          return "The filename is missing the target name."
        }
      }
      return true;
    },
    checkWeeklyTarget(rawText) {
      if (this.cadence === 'weekly-builds') {
        if (!rawText) {
          return "Target not chosen"
        }
        if (!this.originalFilename.includes(rawText)) {
          return "The filename is missing the target name."
        }
      }
      this.version = '';
      return true;
    },
    checkVersion(rawText) {
      if (this.cadence === 'stable') {
        if (!this.originalFilename.includes(rawText)) {
          return "The filename is missing the version version."
        }
      }
      return true;
    },
    openFileUploadDialog() {
      this.newFile = null;
      this.dialog = true;
    },
    async commitNewVersion() {
      if (this.isValid) {
        let target;
        if (this.cadence === 'stable') {
          target = this.releaseTarget;
        } else {
          target = this.weeklyTarget;
        }
        await Publisher.create({
          target: target,
          releaseCadence: this.cadence,
          release: this.version,
          filename: this.originalFilename,
          uploadedUniqueFilename: this.uniqueFilename,
        });
        this.$emit('uploadedFile');
        this.error = null;
        this.clearFieldsCloseDialog();
      }
    },
  },
}
</script>

<style scoped>

</style>
