<template>
<!--  <hello-world />-->
  <ModelViewer />
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue';
import ModelViewer from "@/components/ModelViewer";

export default {
  name: 'HomeView',
  components: { HelloWorld, ModelViewer },
  data: () => ({
  }),
}
</script>
