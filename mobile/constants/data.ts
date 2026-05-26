export const CAMEROON_CITIES = [
  { id: 1,  name: 'Yaoundé',    region: 'Centre',    isMajor: true },
  { id: 2,  name: 'Douala',     region: 'Littoral',  isMajor: true },
  { id: 3,  name: 'Bamenda',    region: 'North West',isMajor: true },
  { id: 4,  name: 'Bafoussam',  region: 'West',      isMajor: true },
  { id: 5,  name: 'Buea',       region: 'South West',isMajor: true },
  { id: 6,  name: 'Limbe',      region: 'South West',isMajor: true },
  { id: 7,  name: 'Ngaoundéré', region: 'Adamawa',   isMajor: true },
  { id: 8,  name: 'Garoua',     region: 'North',     isMajor: true },
  { id: 9,  name: 'Maroua',     region: 'Far North', isMajor: true },
  { id: 10, name: 'Kumba',      region: 'South West',isMajor: true },
  { id: 11, name: 'Ebolowa',    region: 'South',     isMajor: false },
  { id: 12, name: 'Bertoua',    region: 'East',      isMajor: false },
  { id: 13, name: 'Kribi',      region: 'South',     isMajor: false },
  { id: 14, name: 'Nkongsamba', region: 'Littoral',  isMajor: false },
  { id: 15, name: 'Dschang',    region: 'West',      isMajor: false },
  { id: 16, name: 'Mbalmayo',   region: 'Centre',    isMajor: false },
  { id: 17, name: 'Edéa',       region: 'Littoral',  isMajor: false },
  { id: 18, name: 'Foumban',    region: 'West',      isMajor: false },
  { id: 19, name: 'Sangmélima', region: 'South',     isMajor: false },
  { id: 20, name: 'Tibati',     region: 'Adamawa',   isMajor: false },
];

export const MAJOR_CITIES = CAMEROON_CITIES.filter(c => c.isMajor);

export const PAYMENT_METHODS = [
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    nameShort: 'MTN MoMo',
    color: '#FFC107',
    icon: 'phone-portrait-outline',
    instruction: 'Transfer to the number shown below then upload your screenshot',
    instructionFr: 'Transférez au numéro indiqué puis uploadez votre capture d\'écran',
  },
  {
    id: 'orange_money',
    name: 'Orange Money',
    nameShort: 'Orange Money',
    color: '#FF6B00',
    icon: 'phone-portrait-outline',
    instruction: 'Transfer to the number shown below then upload your screenshot',
    instructionFr: 'Transférez au numéro indiqué puis uploadez votre capture d\'écran',
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    nameShort: 'Virement',
    color: '#1565C0',
    icon: 'business-outline',
    instruction: 'Transfer to the bank account below then upload your bank receipt',
    instructionFr: 'Virez au compte bancaire indiqué puis uploadez votre reçu',
  },
];

export const BUS_TYPES = ['Standard', 'VIP', 'Luxury', 'Coaster', 'Minibus'] as const;

export const SHIFTS = {
  morning:   { label: 'Morning',   labelFr: 'Matin',     icon: '🌅', time: '05:00 - 11:00' },
  afternoon: { label: 'Afternoon', labelFr: 'Après-midi',icon: '☀️', time: '12:00 - 17:00' },
  night:     { label: 'Night',     labelFr: 'Nuit',      icon: '🌙', time: '20:00 - 23:59' },
};

export const PARCEL_STATUSES = {
  received:         { label: 'Received',          labelFr: 'Reçu',               icon: '📦', color: '#2196F3', step: 1 },
  in_transit:       { label: 'In Transit',        labelFr: 'En Transit',         icon: '🚌', color: '#FF9800', step: 2 },
  arrived:          { label: 'Arrived',           labelFr: 'Arrivé',             icon: '📍', color: '#9C27B0', step: 3 },
  ready_for_pickup: { label: 'Ready for Pickup',  labelFr: 'Prêt à récupérer',  icon: '✅', color: '#4CAF50', step: 4 },
  collected:        { label: 'Collected',         labelFr: 'Récupéré',           icon: '🎉', color: '#00C48C', step: 5 },
  returned:         { label: 'Returned',          labelFr: 'Retourné',           icon: '↩️', color: '#CE1126', step: 0 },
};
