type RuPluralForms = {
  one: string;
  few: string;
  many: string;
};

export function pluralizeRu(count: number, forms: RuPluralForms): string {
  const absCount = Math.abs(count);
  const mod10 = absCount % 10;
  const mod100 = absCount % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms.one;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return forms.few;
  }
  return forms.many;
}

export function formatCommentsCountRu(count: number): string {
  return `${count} ${pluralizeRu(count, {
    one: "комментарий",
    few: "комментария",
    many: "комментариев",
  })}`;
}
