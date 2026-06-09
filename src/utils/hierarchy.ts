export function getSubtopicStyle(text: string): { level: number; className: string } {
  const level5 = [
    'MILAB', 'Чёрный проект', 'Солнечный Хранитель/ВКС США', 'ГЛОБАЛЬНАЯ ГАЛАКТИКА / Лига Наций', 'ТКП Информаторы', 
    'Возрождение', 'Огни Сампогакая', 'Служение', 'Возвращение в источник', 'Закон Одного', 
    'Химтрейлы', 'Беспроводная энергия', 'Тесла', 'Элохим', 'Активатор X', 'Машина Рейва',
    'ПАТРИОТЫ', 'Белые шляпы', 'ТРИБУНАЛЫ', 'Символ Q', 'GEOTUS', 'Шторм',
    'NASA скрывает', 'МАНТИС', 'Нордические', 'ICC базы', 'Серые', 'Кристаллы', 'Служение, Прощение'
  ];
  
  const level6 = [
    '1954', 'Февраль 1942', '20 и Обратно', '20 и ОРЕНДТО', 'Секретная Космическая Программа-Исследователи',
    'Норман Бергрун', 'Дэвид Уилкок'
  ];

  if (level5.includes(text)) {
    return { level: 5, className: 'text-sm font-bold tracking-wide font-sans shadow-lg' };
  }
  if (level6.includes(text)) {
    return { level: 6, className: 'text-[11px] font-bold italic font-sans shadow-md' };
  }
  // Level 7 default
  return { level: 7, className: 'text-[9px] font-medium font-sans' };
}

export function getClusterTitleStyle(level: number | undefined): string {
  switch(level) {
    case 1:
      // АБСОЛЮТНО КРИТИЧНЫЕ: Самый большой текст + ЖИРНЫЙ + ПОДЧЕРКНУТЫЙ + КУРСИВ
      return 'text-2xl md:text-4xl font-extrabold italic underline tracking-widest leading-loose drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]';
    case 2:
      // ОЧЕНЬ ЗНАЧИМЫЕ: Большой текст + ЖИРНЫЙ + ПОДЧЕРКНУТЫЙ
      return 'text-xl md:text-2xl font-bold underline tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]';
    case 3:
      // ЗНАЧИМЫЕ: Большой текст + ЖИРНЫЙ
      return 'text-lg md:text-xl font-bold tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]';
    case 4:
      // ВАЖНЫЕ: Большой текст + ЖИРНЫЙ
      return 'text-base md:text-lg font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]';
    default:
      return 'text-sm font-semibold';
  }
}
