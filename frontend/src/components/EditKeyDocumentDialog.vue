<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card min-width="60em">
      <v-card-title>
        <div class="text-center">Edit Content (Markdown)</div>
      </v-card-title>
      <v-progress-linear
        :active="isPatchPending"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-form>
        <v-card-text>
          <p>Enter a longer description. Use Markdown formatting.</p>
          <v-textarea
            counter
            flat
            v-model="newMarkdown"
          ></v-textarea>
        </v-card-text>
        <v-text-field
          v-model="versionText"
          label="Version/Effective Date in YYYYMMDD[else] form"
          required
        ></v-text-field>
      </v-form>
      <v-snackbar
        :timeout="2000"
        v-model="showSnacker"
      >
        {{ snackerMsg }}
      </v-snackbar>
      <v-card-actions class="justify-center">
        <v-btn
          color="cancel"
          variant="elevated"
          @click="dialog = false"
        >Cancel</v-btn>
        <v-btn
          @click="doSaveLongDescriptionMd()"
          color="error"
          variant="elevated"
          :disabled="isPatchPending"
        >Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'EditKeyDocumentDialog',
  props: {
    markdown: {
      Type: Text,
      default: '',
    }
  },
  emits: ['saveKeyDocument'],
  data: () => ({
    dialog: false,
    snackerMsg: '',
    showSnacker: false,
    newMarkdown: '',
    versionText: '',
    isPatchPending: false,
  }),
  async created() {
    await this.refresh();
  },
  computed: {
  },
  methods: {
    async doSaveLongDescriptionMd() {
      this.$emit('saveKeyDocument', this.newMarkdown, this.versionText);
    },
    async refresh() {
      let now = new Date();
      let mm = now.getMonth() + 1;
      let dd = now.getDate();
      let yyyy = now.getFullYear();
      this.versionText = [yyyy, (mm>9 ? '' : '0') + mm, (dd>9 ? '' : '0') + dd].join('');
      this.newMarkdown = this.$props.markdown;
    }
  },
  watch: {
    async dialog(newVal) {
      if (newVal === true) {
        await this.refresh();
      }
    }
  }
}
</script>
<style scoped>
</style>
