<template>
  <Main>
    <template #title>
      <v-btn icon="mdi-arrow-left" @click="$router.go(-1)"></v-btn>
      Error Codes
    </template>
    <template #content>
      <v-table>
        <thead>
        <tr>
          <th class="text-center">
            Code
          </th>
          <th class="text-left">
            Detail
          </th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="errorCode in errorCodes"
          :key="errorCode.error"
        >
          <td class="text-center">{{ errorCode.error }}</td>
          <td class="text-left">{{ errorCode.desc }}</td>
        </tr>
        </tbody>
      </v-table>
    </template>
  </Main>
</template>

<script>
import Main from "@/layouts/default/Main.vue";
export default {
  name: "WorkerErrorCodes",
  components: { Main },
  computed: {
    errorCodes: () => [
      {
        error: 101,
        desc: 'Missing assemblies, failed to find linked assemblies in parent directory.'
      },
      {
        error: 102,
        desc: 'Not allowed to recompute an assembly file in your current file.'
      },
      {
        error: 999,
        desc: 'Internal Server error occurred.'
      },
    ]
  }
}
</script>

<style scoped>

</style>
