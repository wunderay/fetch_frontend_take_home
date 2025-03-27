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
    if (response.ok) {
      isLoggedIn.value = false
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper"></div>
  </header>

  <main>
    <LoginForm v-if="!isLoggedIn" v-bind:loginStatus="isLoggedIn" @authenticated="login" />
    <SearchPage v-if="isLoggedIn" />
    <v-btn v-if="isLoggedIn" @click="logout">Logout</v-btn>
  </main>
</template>

<style scoped></style>
