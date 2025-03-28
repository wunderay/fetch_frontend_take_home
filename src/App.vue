<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './components/LoginForm.vue'
import SearchPage from './components/SearchPage.vue'

const isLoggedIn = ref(false)

const login = () => {
  isLoggedIn.value = true

  // Cookie expires in 1 hour
  setTimeout(logout, 1000 * 60 * 60)
}

async function logout() {
  try {
    const response = await fetch('https://frontend-take-home-service.fetch.com/auth/logout', {
      method: 'post',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
  } catch (error) {
    console.error(error)
  }
  isLoggedIn.value = false
}
</script>

<template>
  <main>
    <LoginForm v-if="!isLoggedIn" v-bind:loginStatus="isLoggedIn" @authenticated="login" />
    <SearchPage v-if="isLoggedIn" @logout="logout" />
  </main>
</template>

<style scoped></style>
