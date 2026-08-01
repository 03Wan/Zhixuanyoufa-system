<template>
  <PublicSiteHeader
    v-if="showLegacyPublicHeader"
    class="public-subpage-header"
    @login="router.push({ path: '/home-public', query: { auth: 'login' } })"
  />
  <router-view />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PublicSiteHeader from '@/components/PublicSiteHeader.vue';

const route = useRoute();
const router = useRouter();
const showLegacyPublicHeader = computed(() => [
  '/platforms',
  '/pricing',
  '/about-project',
].includes(route.path));
</script>

