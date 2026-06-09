export const COMPANY_LOGOS: Record<string, string> = {
  general: '/assets/Generalexpress.jpg',
  buca: '/assets/Bucaexpress.jpg',
  nso: '/assets/Nsoboys.jpg',
  afrique: '/assets/afriquelanexpress.png',
  confort: '/assets/confort voyage.jpg',
  finexs: '/assets/finexsvoyage.png',
  garanti: '/assets/garantiexpress.jpg',
  moghamo: '/assets/moghamoexpress.jpg',
  musango: '/assets/musangobusservice.jpg',
  oasis: '/assets/oasistarvels.jpg',
  starline: '/assets/starlinestravels.png',
  touristique: '/assets/touristiqueexpress.jpg',
  united: '/assets/unitedexpress.jpg',
  vatican: '/assets/vaticanexpress.jpg',
  amour: '/assets/Amourmezamexpress.jpg',
  default: '/assets/Bus.jpg',
};

export const getCompanyLogo = (companyName?: string | null) => {
  if (!companyName) return COMPANY_LOGOS.default;
  const name = companyName.toLowerCase();
  
  if (name.includes('general')) return COMPANY_LOGOS.general;
  if (name.includes('buca')) return COMPANY_LOGOS.buca;
  if (name.includes('nso')) return COMPANY_LOGOS.nso;
  if (name.includes('afrique')) return COMPANY_LOGOS.afrique;
  if (name.includes('confort')) return COMPANY_LOGOS.confort;
  if (name.includes('finexs')) return COMPANY_LOGOS.finexs;
  if (name.includes('garanti')) return COMPANY_LOGOS.garanti;
  if (name.includes('moghamo')) return COMPANY_LOGOS.moghamo;
  if (name.includes('musango')) return COMPANY_LOGOS.musango;
  if (name.includes('oasis')) return COMPANY_LOGOS.oasis;
  if (name.includes('starline') || name.includes('star line')) return COMPANY_LOGOS.starline;
  if (name.includes('touristique')) return COMPANY_LOGOS.touristique;
  if (name.includes('united')) return COMPANY_LOGOS.united;
  if (name.includes('vatican')) return COMPANY_LOGOS.vatican;
  if (name.includes('amour') || name.includes('mezam')) return COMPANY_LOGOS.amour;
  
  return COMPANY_LOGOS.default;
};
