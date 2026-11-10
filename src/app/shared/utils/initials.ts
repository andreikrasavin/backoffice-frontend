/**
 * Инициалы для аватара: первые буквы первого и последнего слова ФИО.
 * Для односложного имени возвращает одну букву.
 */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';

  return `${first}${last}`.toUpperCase();
}
