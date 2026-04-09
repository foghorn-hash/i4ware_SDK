import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

export function usePermission() {
  const authStore = useAuthStore();

  const hasPermission = (permission) => {
    return computed(() =>
      authStore.user?.permissions?.includes(permission) ?? false
    );
  };

  return { hasPermission };
}