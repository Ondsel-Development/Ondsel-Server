<template>
  <v-dialog
    v-if="dialog"
    v-model="dialog"
    width="auto"
  >
    <v-card max-width="40em" min-width="22em">
      <v-card-title>
        <div class="text-center">{{title}}</div>
      </v-card-title>
      <v-card-subtitle>{{subtitle}}</v-card-subtitle>
      <v-card-text>
        <v-progress-linear
          :active="isPatchPending"
          indeterminate
          absolute
          bottom
        ></v-progress-linear>
        <p class="text-caption mb-2">selection: {{visualSelection}}</p>
        <v-radio-group v-model="finalSelection">
          <v-radio
            v-for="item in selectionList"
            :key="item.order"
            :label="item.label"
            :value="item.value"
          >
          </v-radio>
        </v-radio-group>
        <v-snackbar
          :timeout="2000"
          v-model="showSnacker"
        >
          {{ snackerMsg }}
        </v-snackbar>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn @click="sendFinalSelection()" color="primary" :disabled="isPatchPending" :loading="isPatchPending">Change</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'GenericSelectionDialog',
  props: {
    currentSelection: String,
    selectionList: Array,
    title: String,
    subtitle: String,
  },
  emits: ['saveGenericSelection'],
  async created() {
    await this.refresh();
  },
  data: () => ({
    dialog: false,
    finalSelection: '',
    snackerMsg: '',
    showSnacker: false,
    isPatchPending: false,
  }),
  computed: {
    visualSelection: vm => vm.finalSelection || vm.$props.currentSelection,
  },
  methods: {
    async refresh() {
      this.finalSelection = this.$props.currentSelection;
    },
    async sendFinalSelection() {
      this.$emit('saveGenericSelection');
    },
  },
  watch: {
    async dialog(newValue){
      if (newValue) {
        await this.refresh();
      }
    }
  }
}
</script>
<style scoped>
</style>
