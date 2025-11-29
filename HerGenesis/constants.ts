
import { Species, GrowthStage } from './types';

export const SPECIES_LIST: Species[] = [
  {
    id: 'dodo',
    name: 'Dodo',
    scientificName: 'Raphus cucullatus',
    extinctionYear: '1662',
    origin: 'Mauritius',
    description: 'A flightless bird known for its gentle nature. The matriarchs led the nests in the fern forests.',
    extinctionCause: 'Overhunting by sailors and invasive species destroying nests.',
    image: 'https://github.com/978893422-netizen/my-assets/blob/main/Dodo_img.png?raw=true', 
    color: 'bg-pink-100 text-pink-600 border-pink-200'
  },
  {
    id: 'mammoth',
    name: 'Woolly Mammoth',
    scientificName: 'Mammuthus primigenius',
    extinctionYear: '2000 BC',
    origin: 'Arctic Tundra',
    description: 'The great wandering mothers of the ice. They protected their calves from the biting cold with deep fur and wisdom.',
    extinctionCause: 'Rapid climate warming and hunting pressures from early humans.',
    image: 'https://github.com/978893422-netizen/my-assets/blob/main/Mammoth_img.png?raw=true',
    color: 'bg-blue-100 text-blue-600 border-blue-200'
  },
  {
    id: 'thylacine',
    name: 'Thylacine',
    scientificName: 'Thylacinus cynocephalus',
    extinctionYear: '1936',
    origin: 'Tasmania',
    description: 'The shy striped hunter. The females carried their young in pouches, traversing the eucalyptus bushlands.',
    extinctionCause: 'Bounty hunting imposed by settlers and habitat destruction.',
    image: 'https://github.com/978893422-netizen/my-assets/blob/main/Thylacine_img.png?raw=true',
    color: 'bg-amber-100 text-amber-600 border-amber-200'
  },
  {
    id: 'irish_elk',
    name: 'Irish Elk',
    scientificName: 'Megaloceros giganteus',
    extinctionYear: '5700 BC',
    origin: 'Eurasia',
    description: 'Known for their immense size. The females guided the herds through the changing post-glacial landscapes.',
    extinctionCause: 'Nutritional stress caused by climate change affecting vegetation.',
    image: 'https://github.com/978893422-netizen/my-assets/blob/main/IrishElk_img.png?raw=true',
    color: 'bg-emerald-100 text-emerald-600 border-emerald-200'
  }
];

export const GAME_RULES = {
  feed: { satMod: 10, cooldownMs: 30 * 60 * 1000 }, // 30 mins
  pet: { intMod: 10, cooldownMs: 10 * 60 * 1000 },  // 10 mins
  clean: { healthMod: 10, cooldownMs: 24 * 60 * 60 * 1000 }, // 1 day
  thresholds: {
    [GrowthStage.ADULT]: 30,
    [GrowthStage.BREEDING]: 100,
    [GrowthStage.RE_BREEDING]: 200,
  }
};

export const MINT_COST = 0.001; // ETH Sepolia
