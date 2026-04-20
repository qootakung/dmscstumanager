import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/utils/userStorage';
import Swal from 'sweetalert2';

/**
 * Hook returning whether the currently logged-in user is allowed to mutate data.
 * Admin role always returns true, otherwise requires can_edit = true.
 */
export function usePermissions() {
  const [canEdit, setCanEdit] = useState<boolean>(() => computeCanEdit());

  useEffect(() => {
    const handler = () => setCanEdit(computeCanEdit());
    window.addEventListener('storage', handler);
    window.addEventListener('dmsc:user-changed', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('dmsc:user-changed', handler);
    };
  }, []);

  return { canEdit, isAdmin: getCurrentUser()?.role === 'admin' };
}

function computeCanEdit(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin') return true;
  return Boolean(user.canEdit);
}

export async function denyEditToast() {
  await Swal.fire({
    title: 'ไม่มีสิทธิ์แก้ไข',
    text: 'บัญชีของคุณสามารถดูข้อมูลได้อย่างเดียว กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์',
    icon: 'warning',
    confirmButtonText: 'ตกลง',
  });
}
