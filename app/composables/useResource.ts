import { onMounted, ref, shallowRef } from 'vue'
export function useResource<T>(loader: () => Promise<T>) {
  const data = shallowRef<T | null>(null)
  const loading = ref(true)
  const error = ref('')
  let version = 0
  async function refresh() {
    const current = ++version
    loading.value = true
    error.value = ''
    try {
      const result = await loader()
      if (current === version) data.value = result
    } catch (e) {
      if (current === version) error.value = (e as Error).message
    } finally {
      if (current === version) loading.value = false
    }
  }
  onMounted(refresh)
  return { data, loading, error, refresh }
}
