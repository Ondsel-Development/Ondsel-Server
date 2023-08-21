<template>
  <v-dialog
    v-model="dialog"
    width="auto"
    persistent
    class="text-center"
  >
    <v-card width="600" max-height="800">
      <template v-slot:title>
        Model Attributes
      </template>
      <v-progress-linear
        :active="!isObjGenerated || !isModelLoaded"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
      <v-card-text>
        <v-container
          id="scroll-target"
          style="max-height: 600px"
          class="overflow-y-auto"
        >
        <div v-if="!Object.keys(attributes).length">No attributes exist.</div>
        <v-alert
          v-if="user && !user.isPeerTier && !user.isEnterpriseTier"
          variant="outlined"
          type="warning"
          border="top"
          class="text-left"
        >
          Please upgrade your plan to <b>Premium</b> or <b>Enterprise</b> tier in order to update model parameters.
        </v-alert>
        <v-alert
          v-if="canUpdateModel && !isAuthenticated"
          variant="outlined"
          type="warning"
          border="top"
          class="text-left"
        >
          Please log in to customize the model.
        </v-alert>
        <br>

          <template v-for="(item, key) in attributes">
          <v-text-field
            v-model.trim="item.value"
            :label="key"
            :suffix="item.unit"
            :disabled="!isObjGenerated"
            v-if="item.type === 'string'"
            :readonly="!canUpdateModel"
          ></v-text-field>
          <v-text-field
            v-model="item.value"
            :label="key"
            type="number"
            :suffix="item.unit"
            :disabled="!isObjGenerated"
            :readonly="!canUpdateModel"
            v-if="item.type === 'angle'"
          ></v-text-field>
          <v-text-field
            v-model="item.value"
            :label="key"
            type="number"
            :suffix="item.unit"
            :disabled="!isObjGenerated"
            :readonly="!canUpdateModel"
            v-if="item.type === 'number'"
          ></v-text-field>
          <v-text-field
            v-model="item.value"
            :label="key"
            type="number"
            :suffix="item.unit"
            :disabled="!isObjGenerated"
            :readonly="!canUpdateModel"
            v-if="item.type === 'float'"
          ></v-text-field>
          <v-text-field
            v-model="item.value"
            :label="key"
            type="number"
            min="0"
            :suffix="item.unit"
            :disabled="!isObjGenerated"
            :readonly="!canUpdateModel"
            v-if="item.type === 'length'"
          ></v-text-field>
          <v-text-field
            v-model="item.value"
            :label="key"
            type="number"
            min="0"
            :suffix="item.unit"
            :disabled="!isObjGenerated"
            :readonly="!canUpdateModel"
            v-if="item.type === 'percent'"
          ></v-text-field>
          <v-select
            v-model="item.value"
            :label="key"
            :items="['true', 'false']"
            :suffix="item.unit"
            :disabled="!isObjGenerated"
            :readonly="!canUpdateModel"
            v-if="item.type === 'bool'"
          ></v-select>
          <v-select
            v-model="item.value"
            :label="key"
            :items="item.items"
            :suffix="item.unit"
            :disabled="!isObjGenerated"
            :readonly="!canUpdateModel"
            v-if="item.type === 'select'"
          ></v-select>
        </template>
        </v-container>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="dialog = false" :disabled="!isObjGenerated">Cancel</v-btn>
        <v-btn
          color="primary"
          v-if="canUpdateModel && Object.keys(attributes).length"
          :disabled="(user && !user.isPeerTier && !user.isEnterpriseTier) || !isObjGenerated || !isAuthenticated"
          @click="$emit('updateModel')"
        >Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'AttributeViewer',
  emits: ['updateModel'],
  props: {
    isActive: Boolean,
    attributes: Object,
    isObjGenerated: Boolean,
    isModelLoaded: Boolean,
    canViewModelAttributes: {
      type: Boolean,
      default: true,
    },
    canUpdateModel: {
      type: Boolean,
      default: true,
    }
  },
  data: (vm) => ({
    dialog: false,
    valid: false,
    items: Array.from({ length: 1000 }, (k, v) => v + 1),
  }),
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    ...(mapState('auth', ['user'])),
  },
}
</script>

<style scoped>

</style>
