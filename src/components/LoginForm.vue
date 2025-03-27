<script setup lang="ts">
import { ref } from 'vue'

defineProps(['loginStatus'])
const emit = defineEmits(['authenticated'])

const name = ref('')
const email = ref('')
const errorMessage = ref('')
const nameRules = [
  (name: string) => {
    if (name) return true
    return 'Name is required.'
  },
]
const emailRules = [
  (value: string) => {
    if (value) return true

    return 'E-mail is required.'
  },
  (value: string) => {
    if (/.+@.+\..+/.test(value)) return true

    return 'E-mail address must be valid e.g. exanple@email.com'
  },
]

const login = async () => {
  const fullname = name.value
  const emailAddress = email.value
  errorMessage.value = ''

  try {
    const response = await fetch('https://frontend-take-home-service.fetch.com/auth/login', {
      method: 'post',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: fullname, email: emailAddress }),
    })

    if (response.ok) {
      emit('authenticated')
      return
    }
  } catch (error) {
    console.log(error)
  }
  errorMessage.value = 'Incorrect login credentials'
}
</script>

<template>
  <h1>{{ errorMessage }}</h1>
  <v-form @submit.prevent="login">
    <v-text-field label="Name" v-model="name" :rules="nameRules"></v-text-field>
    <v-text-field label="Email Address" v-model="email" :rules="emailRules"></v-text-field>
    <v-btn class="me-4" type="submit"> submit </v-btn>
    <v-btn> clear </v-btn>
  </v-form>
</template>

<style lang="css" scoped></style>
