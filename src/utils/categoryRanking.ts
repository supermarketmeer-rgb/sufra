/**
 * Utility to enforce fixed category ranking:
 * 1. اكلات شرقية (Eastern)
 * 2. اكلات غربية (Western)
 * 3. سندويج (Sandwiches)
 * 4. مقبلات (Appetizers)
 * 5. مشروبات غازية (Soft drinks / Beverages)
 * 6. اضافات (Extras / Addons)
 */

export const getCategoryRank = (name?: string, fallbackOrder?: number): number => {
  if (!name) return 999;
  const clean = name.trim().toLowerCase();

  // 1. اكلات شرقية
  if (clean.includes('شرق')) return 1;

  // 2. اكلات غربية
  if (clean.includes('غرب')) return 2;

  // 3. سندويج / شاورما / برجر
  if (clean.includes('سندوي') || clean.includes('شاورما') || clean.includes('برجر') || clean.includes('صاج')) return 3;

  // 4. مقبلات / سلطات
  if (clean.includes('مقبل') || clean.includes('سلط')) return 4;

  // 5. مشروبات غازية / عصائر
  if (clean.includes('مشروب') || clean.includes('عصائر') || clean.includes('عصير') || clean.includes('غازي') || clean.includes('بيبسي')) return 5;

  // 6. اضافات / صوصات
  if (clean.includes('اضاف') || clean.includes('إضاف') || clean.includes('اضاق')) return 6;

  // Fallback to sort_order if provided, else high number
  return typeof fallbackOrder === 'number' && fallbackOrder > 0 ? 100 + fallbackOrder : 900;
};

export const sortCategories = <T extends { name_ar?: string; sort_order?: number; id: number }>(cats: T[]): T[] => {
  return [...cats].sort((a, b) => {
    const rankA = getCategoryRank(a.name_ar, a.sort_order);
    const rankB = getCategoryRank(b.name_ar, b.sort_order);
    if (rankA !== rankB) return rankA - rankB;
    if ((a.sort_order || 0) !== (b.sort_order || 0)) return (a.sort_order || 0) - (b.sort_order || 0);
    return a.id - b.id;
  });
};

export const sortProductsByCategory = <T extends { category_id?: number; id: number }>(
  prods: T[],
  cats: { id: number; name_ar?: string; sort_order?: number }[]
): T[] => {
  const catRankMap = new Map<number, number>();
  cats.forEach(c => {
    catRankMap.set(Number(c.id), getCategoryRank(c.name_ar, c.sort_order));
  });

  return [...prods].sort((a, b) => {
    const rankA = catRankMap.get(Number(a.category_id)) ?? 999;
    const rankB = catRankMap.get(Number(b.category_id)) ?? 999;
    if (rankA !== rankB) return rankA - rankB;
    return a.id - b.id;
  });
};
