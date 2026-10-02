export type GarmentType = 'tshirts' | 'hoodies';
export type ColorVariant = 'white' | 'black' | 'bone';
export type CollectionName = 'БЕЛАРУСЬ';
export type SubcollectionName = 'АРХІТЭКТУРА' | 'МАПА' | 'КОСМАС' | 'ЦІХАЯ ВАДА';
export type ThemeName = 'ЖЫВЁЛЫ' | 'КРАЯВІДЫ' | 'ПРЫРОДА' | string;

export type Product = {
  id: string;
  slug: string;
  title: string;
  collection: CollectionName;
  subcollection: SubcollectionName;
  theme: string;
  garmentType: GarmentType;
  color: ColorVariant;
  image: string;
  currentPrice: number;
  oldPrice: number | null;
  sizeChart: string;
  material: string;
  density: string;
};

export type Size = 'XS' | 'S' | 'M' | 'L';

export const TSHIRT_PRICE = 49;
export const TSHIRT_OLD_PRICE = 69;
export const HOODIE_PRICE = 99;
export const HOODIE_OLD_PRICE = 139;

export const TSHIRT_SIZES: Size[] = ['XS', 'S', 'M', 'L'];
export const HOODIE_SIZES: Size[] = ['XS', 'S', 'M', 'L'];

export const TSHIRT_SIZE_HINTS = ['48', '50', '52–54', '56'];
export const HOODIE_SIZE_HINTS = ['44–46', '46–48', '48–50', '52–54'];

export const TSHIRT_SIZE_CHART = '/images/tshirts/tshirt-size-chart.png';
export const HOODIE_SIZE_CHART = '/images/hoodie/hoodies-size-table.png';

export const TSHIRT_MATERIAL = '100% хлопок Ringspun';
export const TSHIRT_DENSITY = '190 г/м²';
export const HOODIE_MATERIAL = '100% хлопок Ringspun';
export const HOODIE_DENSITY = '320 г/м²';

export type CollectionDef = {
  name: CollectionName;
  subcollections: SubcollectionDef[];
};

export type SubcollectionDef = {
  name: SubcollectionName;
  themes: ThemeDef[];
};

export type ThemeDef = {
  name: string;
};

export const COLLECTIONS: CollectionDef[] = [
  {
    name: 'БЕЛАРУСЬ',
    subcollections: [
      { name: 'АРХІТЭКТУРА', themes: [] },
      {
        name: 'МАПА',
        themes: [
          { name: 'ЖЫВЁЛЫ' },
          { name: 'КРАЯВІДЫ' },
        ],
      },
      {
        name: 'КОСМАС',
        themes: [
          { name: 'ЖЫВЁЛЫ' },
          { name: 'ПРЫРОДА' },
        ],
      },
      { name: 'ЦІХАЯ ВАДА', themes: [] },
    ],
  },
];

export const FUTURE_COLLECTIONS = ['ЛЮБОВЬ', 'ПАНТЕОН', 'ЛИЦА ЭПОХИ', 'АНТИЧНЫЙ КОД'];

const tshirt = (data: Omit<Product, 'garmentType' | 'currentPrice' | 'oldPrice' | 'sizeChart' | 'material' | 'density'>): Product => ({
  ...data,
  garmentType: 'tshirts',
  currentPrice: TSHIRT_PRICE,
  oldPrice: TSHIRT_OLD_PRICE,
  sizeChart: TSHIRT_SIZE_CHART,
  material: TSHIRT_MATERIAL,
  density: TSHIRT_DENSITY,
});

const hoodie = (data: Omit<Product, 'garmentType' | 'currentPrice' | 'oldPrice' | 'sizeChart' | 'material' | 'density'>): Product => ({
  ...data,
  garmentType: 'hoodies',
  currentPrice: HOODIE_PRICE,
  oldPrice: HOODIE_OLD_PRICE,
  sizeChart: HOODIE_SIZE_CHART,
  material: HOODIE_MATERIAL,
  density: HOODIE_DENSITY,
});

const archNames: [string, string][] = [
  ['Мірскі замак', '01-mir-castle.png'],
  ['Нясвіжскі замак', '02-nesvizh-castle.png'],
  ['Сафійскі сабор', '03-saint-sophia-cathedral.png'],
  ['Косаўскі палац', '04-kosava-palace.png'],
  ['Касцёл Найсвяцейшай Тройцы', '05-holy-trinity-church.png'],
  ['Нацыянальны тэатр оперы і балета', '06-national-opera-ballet-theatre.png'],
  ['Вароты Мінска', '07-gates-of-minsk.png'],
  ['Лідскі замак', '08-lida-castle.png'],
  ['Палац Румянцавых і Паскевічаў', '09-rumyantsev-paskevich-palace.png'],
  ['Ружанскі палац', '10-ruzhany-palace.png'],
  ['Камянецкая вежа', '11-kamianiec-tower.png'],
  ['Чырвоны касцёл', '12-red-church.png'],
  ['Магілёўская ратуша', '13-mogilev-town-hall.png'],
  ['Нацыянальная бібліятэка Беларусі', '14-national-library-belarus.png'],
  ['Брэсцкая крэпасць', '15-brest-fortress.png'],
];

const archProducts: Product[] = archNames.flatMap(([title, filename], i) => {
  const mark = String(i + 1).padStart(2, '0');
  const slug = `arch-${mark}`;
  return [
    tshirt({
      id: `t-${slug}`,
      slug,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'АРХІТЭКТУРА',
      theme: '',
      color: 'bone',
      image: `/images/tshirts/Belarus/architecture/${filename}`,
    }),
  ];
});

const mapAnimals: [string, string][] = [
  ['Зубр', '01-bison.png'],
  ['Белы бусел', '02-white-stork.png'],
  ['Матылёк і васількі', '03-butterfly-cornflowers.png'],
  ['Заяц', '04-hare.png'],
  ['Лось', '05-moose.png'],
  ['Вялікая сініца', '06-great-tit.png'],
  ['Буры мядзведзь', '07-brown-bear.png'],
  ['Сава', '08-owl.png'],
  ['Вожык у ягадах', '09-hedgehog-berries.png'],
  ['Арол', '10-eagle.png'],
];

const mapScenery: [string, string][] = [
  ['Сасновы лес на захадзе', '01-pine-forest-sunset.png'],
  ['Лясныя грыбы і ягады', '02-forest-mushrooms-berries.png'],
  ['Вятрак у полі', '03-windmill-field.png'],
  ['Каліна ў снезе', '04-viburnum-snow.png'],
  ['Замкавая гара', '05-castle-hill.png'],
  ['Дубрава над ракой', '06-oak-grove-river.png'],
  ['Льняное поле', '07-flax-field.png'],
  ['Бярозавы бераг', '08-birch-riverbank.png'],
  ['Балоты', '09-marshlands.png'],
  ['Палявыя кветкі', '10-meadow-wildflowers.png'],
];

const mapAnimalProducts: Product[] = mapAnimals.flatMap(([title, filename], i) => {
  const mark = String(i + 1).padStart(2, '0');
  const slug = `map-animal-${mark}`;
  return [
    tshirt({
      id: `t-${slug}`,
      slug,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'МАПА',
      theme: 'ЖЫВЁЛЫ',
      color: 'bone',
      image: `/images/tshirts/Belarus/map/animals/${filename}`,
    }),
    hoodie({
      id: `h-${slug}`,
      slug,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'МАПА',
      theme: 'ЖЫВЁЛЫ',
      color: 'bone',
      image: `/images/hoodie/Belarus/map/animals/${filename}`,
    }),
  ];
});

const mapSceneryProducts: Product[] = mapScenery.flatMap(([title, filename], i) => {
  const mark = String(i + 1).padStart(2, '0');
  const slug = `map-scenery-${mark}`;
  return [
    tshirt({
      id: `t-${slug}`,
      slug,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'МАПА',
      theme: 'КРАЯВІДЫ',
      color: 'bone',
      image: `/images/tshirts/Belarus/map/scenery/${filename}`,
    }),
    hoodie({
      id: `h-${slug}`,
      slug,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'МАПА',
      theme: 'КРАЯВІДЫ',
      color: 'bone',
      image: `/images/hoodie/Belarus/map/scenery/${filename}`,
    }),
  ];
});

const spaceAnimals: [string, string][] = [
  ['Сузор\'е зубра', '01-cosmic-bison.png'],
  ['Сузор\'е лісы', '02-cosmic-fox.png'],
  ['Сузор\'е бусла', '03-cosmic-stork.png'],
  ['Партрэт зубра', '04-bison-portrait.png'],
  ['Матылёк сярод зорак', '05-butterfly-stars.png'],
  ['Заяц на арбіце', '06-hare-orbits.png'],
  ['Сузор\'е аленя', '07-deer-constellations.png'],
  ['Сава і зоркі', '08-owl-stars.png'],
  ['Ластаўка паміж планетамі', '09-swallow-planets.png'],
  ['Партрэт бусла', '10-stork-portrait.png'],
];

const spaceNature: [string, string][] = [
  ['Васілёк на арбіцы', '01-cornflower-orbit.png'],
  ['Гарлачык і месяц', '02-water-lily-moon.png'],
  ['Дуб пад месяцам', '03-oak-moon.png'],
  ['Журавіны і зоркі', '04-cranberry-stars.png'],
  ['Касмічная папараць', '05-cosmic-fern.png'],
  ['Канюшына і космас', '06-clover-cosmos.png'],
  ['Чартапалох і сонца', '07-thistle-sun.png'],
  ['Лён у зорным святле', '08-flax-starlight.png'],
  ['Верас у змярканні', '09-heather-twilight.png'],
  ['Касмічная расянка', '10-cosmic-sundew.png'],
];

const spaceAnimalProducts: Product[] = spaceAnimals.flatMap(([title, filename], i) => {
  const mark = String(i + 1).padStart(2, '0');
  const slug = `space-animal-${mark}`;
  return [
    tshirt({
      id: `t-${slug}-black`,
      slug: `${slug}-black`,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'КОСМАС',
      theme: 'ЖЫВЁЛЫ',
      color: 'black',
      image: `/images/tshirts/Belarus/space/black/animals/${filename}`,
    }),
    tshirt({
      id: `t-${slug}-white`,
      slug: `${slug}-white`,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'КОСМАС',
      theme: 'ЖЫВЁЛЫ',
      color: 'white',
      image: `/images/tshirts/Belarus/space/white/animals/${filename}`,
    }),
    hoodie({
      id: `h-${slug}-black`,
      slug: `${slug}-black`,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'КОСМАС',
      theme: 'ЖЫВЁЛЫ',
      color: 'black',
      image: `/images/hoodie/Belarus/space/black/animals/${filename}`,
    }),
    hoodie({
      id: `h-${slug}-white`,
      slug: `${slug}-white`,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'КОСМАС',
      theme: 'ЖЫВЁЛЫ',
      color: 'white',
      image: `/images/hoodie/Belarus/space/white/animals/${filename}`,
    }),
  ];
});

const spaceNatureProducts: Product[] = spaceNature.flatMap(([title, filename], i) => {
  const mark = String(i + 1).padStart(2, '0');
  const slug = `space-nature-${mark}`;
  return [
    tshirt({
      id: `t-${slug}-black`,
      slug: `${slug}-black`,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'КОСМАС',
      theme: 'ПРЫРОДА',
      color: 'black',
      image: `/images/tshirts/Belarus/space/black/nature/${filename}`,
    }),
    tshirt({
      id: `t-${slug}-white`,
      slug: `${slug}-white`,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'КОСМАС',
      theme: 'ПРЫРОДА',
      color: 'white',
      image: `/images/tshirts/Belarus/space/white/nature/${filename}`,
    }),
    hoodie({
      id: `h-${slug}-black`,
      slug: `${slug}-black`,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'КОСМАС',
      theme: 'ПРЫРОДА',
      color: 'black',
      image: `/images/hoodie/Belarus/space/black/nature/${filename}`,
    }),
    hoodie({
      id: `h-${slug}-white`,
      slug: `${slug}-white`,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'КОСМАС',
      theme: 'ПРЫРОДА',
      color: 'white',
      image: `/images/hoodie/Belarus/space/white/nature/${filename}`,
    }),
  ];
});

const waterNames: [string, string][] = [
  ['Белы бусел над вадой', '01-white-stork.png'],
  ['Выдра ля вады', '02-otter.png'],
  ['Лось на балоце', '03-moose.png'],
  ['Зімародак над вадой', '04-kingfisher.png'],
  ['Шэрая чапля', '05-grey-heron.png'],
  ['Балотная чарапаха', '06-pond-turtle.png'],
  ['Страказа над вадой', '07-dragonfly.png'],
  ['Шчупак', '08-northern-pike.png'],
  ['Бабёр', '09-beaver.png'],
  ['Жаба', '10-frog.png'],
];

const waterProducts: Product[] = waterNames.flatMap(([title, filename], i) => {
  const mark = String(i + 1).padStart(2, '0');
  const slug = `water-${mark}`;
  return [
    hoodie({
      id: `h-${slug}`,
      slug,
      title,
      collection: 'БЕЛАРУСЬ',
      subcollection: 'ЦІХАЯ ВАДА',
      theme: '',
      color: 'bone',
      image: `/images/hoodie/Belarus/water/${filename}`,
    }),
  ];
});

export const allProducts: Product[] = [
  ...archProducts,
  ...mapAnimalProducts,
  ...mapSceneryProducts,
  ...spaceAnimalProducts,
  ...spaceNatureProducts,
  ...waterProducts,
];

export const getProductsByGarment = (garment: GarmentType): Product[] =>
  allProducts.filter((p) => p.garmentType === garment);

export const getSizesForGarment = (garment: GarmentType): Size[] =>
  garment === 'tshirts' ? TSHIRT_SIZES : HOODIE_SIZES;

export const getSizeHintsForGarment = (garment: GarmentType): string[] =>
  garment === 'tshirts' ? TSHIRT_SIZE_HINTS : HOODIE_SIZE_HINTS;

export const formatPrice = (amount: number): string => `${amount} BYN`;

export const getGarmentLabel = (garment: GarmentType): string =>
  garment === 'tshirts' ? 'Футболка' : 'Толстовка';

export const getColorLabel = (color: ColorVariant): string => {
  if (color === 'black') return 'Черная';
  if (color === 'white') return 'Белая';
  return 'Светлая';
};
