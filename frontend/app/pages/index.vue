<script setup lang="ts">
const token = useCookie('access_token')
if (token.value) {
  await navigateTo('/dashboard')
} else {
  await navigateTo('/auth/login')
}
</script>

<template>
  <div />
</template>
