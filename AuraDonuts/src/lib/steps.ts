export interface Step {
  id: string;
  index: number;
  label: string;
  title: string;
  description: string;
}

export const steps: Step[] = [
  {
    id: 'crave',
    index: 0,
    label: '01 CRAVE',
    title: 'El antojo',
    description: 'Un aroma que despierta los sentidos antes del primer sorbo.',
  },
  {
    id: 'espresso',
    index: 1,
    label: '02 ESPRESSO',
    title: 'La base',
    description: 'Espresso extraído lento, cuerpo denso y aterciopelado.',
  },
  {
    id: 'tiramisu',
    index: 2,
    label: '03 TIRAMISÚ',
    title: 'La fusión',
    description: 'Notas de cacao y mascarpone se funden con el café.',
  },
  {
    id: 'finish',
    index: 3,
    label: '04 FINISH',
    title: 'El resultado',
    description: 'Tu edición Afterglow, servida y lista para ti.',
  },
];

export interface IngredientOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface IngredientGroup {
  id: string;
  label: string;
  type: 'single' | 'multi';
  options: IngredientOption[];
}

export const basePrice = 5.5;

export const ingredientGroups: IngredientGroup[] = [
  {
    id: 'milk',
    label: 'Leche',
    type: 'single',
    options: [
      { id: 'whole', label: 'Entera', priceDelta: 0 },
      { id: 'oat', label: 'Avena', priceDelta: 0.6 },
      { id: 'almond', label: 'Almendra', priceDelta: 0.6 },
      { id: 'lactose-free', label: 'Sin lactosa', priceDelta: 0.5 },
    ],
  },
  {
    id: 'intensity',
    label: 'Intensidad',
    type: 'single',
    options: [
      { id: 'single', label: 'Shot simple', priceDelta: 0 },
      { id: 'double', label: 'Shot doble', priceDelta: 0.8 },
    ],
  },
  {
    id: 'size',
    label: 'Tamaño',
    type: 'single',
    options: [
      { id: 'regular', label: 'Regular', priceDelta: 0 },
      { id: 'grande', label: 'Grande', priceDelta: 0.9 },
    ],
  },
  {
    id: 'toppings',
    label: 'Toppings',
    type: 'multi',
    options: [
      { id: 'cacao', label: 'Cacao tiramisú', priceDelta: 0.5 },
      { id: 'cinnamon', label: 'Canela', priceDelta: 0.3 },
      { id: 'cream', label: 'Nata', priceDelta: 0.7 },
    ],
  },
];
