export const KERF           = 5;
export const EDGE_DIST      = 2;
export const EDGING_COST_PM = 2.5;
export const VAT            = 0.20;

// Egger group → sheet price
export const EGGER_GRP_PRICE = { 2:54, 3:64, 4:68, 5:75, 6:80, 7:82, 8:84, 9:91, 10:96 };

// ── Egger MFC decor catalog (18mm + 8mm shared) ──────────────────
export const MFC_DECORS = [
  // Group 2
  { id:'W980-7',   code:'W980 ST7',   name:'Platinum White',               grp:2 },
  { id:'W980-SM',  code:'W980 SM',    name:'Platinum White (Synchronpore)', grp:2 },
  // Group 3
  { id:'U104-9',   code:'U104 ST9',   name:'Alabaster White',  grp:3 },
  { id:'U156-9',   code:'U156 ST9',   name:'Sand Beige',       grp:3 },
  { id:'U216-9',   code:'U216 ST9',   name:'Came Beige',       grp:3 },
  { id:'U222-9',   code:'U222 ST9',   name:'Crema Beige',      grp:3 },
  { id:'U708-9',   code:'U708 ST9',   name:'Light Grey',       grp:3 },
  { id:'U732-9',   code:'U732 ST9',   name:'Dust Grey',        grp:3 },
  { id:'U765-9',   code:'U765 ST9',   name:'Silver Grey',      grp:3 },
  // Group 4
  { id:'U115-9',   code:'U115 ST9',   name:'Carat Beige',      grp:4 },
  { id:'U201-9',   code:'U201 ST9',   name:'Pebble Grey',      grp:4 },
  { id:'U211-9',   code:'U211 ST9',   name:'Almond Beige',     grp:4 },
  { id:'U335-9',   code:'U335 ST9',   name:'Rusty Red',        grp:4 },
  { id:'U502-9',   code:'U502 ST9',   name:'Misty Blue',       grp:4 },
  { id:'U540-9',   code:'U540 ST9',   name:'Denim Blue',       grp:4 },
  { id:'U599-9',   code:'U599 ST9',   name:'Indigo Blue',      grp:4 },
  { id:'U604-9',   code:'U604 ST9',   name:'Reed Green',       grp:4 },
  { id:'U636-9',   code:'U636 ST9',   name:'Fjord Green',      grp:4 },
  { id:'U638-9',   code:'U638 ST9',   name:'Sage Green',       grp:4 },
  { id:'U699-9',   code:'U699 ST9',   name:'Fir Green',        grp:4 },
  { id:'U220-9',   code:'U220 ST9',   name:'Soft Beige',       grp:4 },
  { id:'U645-9',   code:'U645 ST9',   name:'Agave Green',      grp:4 },
  { id:'U702-9',   code:'U702 ST9',   name:'Cashmere Grey',    grp:4 },
  { id:'U705-9',   code:'U705 ST9',   name:'Angora Grey',      grp:4 },
  { id:'U707-9',   code:'U707 ST9',   name:'Silk Grey',        grp:4 },
  { id:'U717-9',   code:'U717 ST9',   name:'Dakar Grey',       grp:4 },
  { id:'U727-9',   code:'U727 ST9',   name:'Stone Grey',       grp:4 },
  { id:'U740-9',   code:'U740 ST9',   name:'Dark Taupe',       grp:4 },
  { id:'U741-9',   code:'U741 ST9',   name:'Lava Grey',        grp:4 },
  { id:'U748-9',   code:'U748 ST9',   name:'Truffle Brown',    grp:4 },
  { id:'U750-9',   code:'U750 ST9',   name:'Taupe Grey',       grp:4 },
  { id:'U755-9',   code:'U755 ST9',   name:'Havanna Grey',     grp:4 },
  { id:'U763-9',   code:'U763 ST9',   name:'Pearl Grey',       grp:4 },
  { id:'U767-9',   code:'U767 ST9',   name:'Cubanit Grey',     grp:4 },
  { id:'U775-9',   code:'U775 ST9',   name:'White Grey',       grp:4 },
  { id:'U780-9',   code:'U780 ST9',   name:'Monument Grey',    grp:4 },
  { id:'U788-9',   code:'U788 ST9',   name:'Arctic Grey',      grp:4 },
  { id:'U899-9',   code:'U899 ST9',   name:'Soft Black',       grp:4 },
  { id:'U960-9',   code:'U960 ST9',   name:'Onyx Grey',        grp:4 },
  { id:'U961-7',   code:'U961 ST7',   name:'Graphite Grey',    grp:4 },
  { id:'U963-9',   code:'U963 ST9',   name:'Diamond Grey',     grp:4 },
  { id:'U968-9',   code:'U968 ST9',   name:'Carbon Grey',      grp:4 },
  { id:'U999-7',   code:'U999 ST7',   name:'Black',            grp:4 },
  { id:'W1000-9',  code:'W1000 ST9',  name:'Premium White',    grp:4 },
  { id:'W1100-9',  code:'W1100 ST9',  name:'Alpine White',     grp:4 },
  { id:'W1200-9',  code:'W1200 ST9',  name:'Porcelain White',  grp:4 },
  { id:'U100-9',   code:'U100 ST9',   name:'Mussel Beige',     grp:4 },
  { id:'U444-9',   code:'U444 ST9',   name:'Cassis',           grp:4 },
  // Group 5
  { id:'H1277-9',  code:'H1277 ST9',  name:'Light Lakeland Acacia',    grp:5 },
  { id:'H1732-9',  code:'H1732 ST9',  name:'Sand Birch',               grp:5 },
  { id:'H3368-9',  code:'H3368 ST9',  name:'Natural Lancaster Oak',    grp:5 },
  { id:'H3734-9',  code:'H3734 ST9',  name:'Natural Dijon Walnut',     grp:5 },
  { id:'U325-9',   code:'U325 ST9',   name:'Antique Rose',             grp:5 },
  { id:'U399-9',   code:'U399 ST9',   name:'Garnet Red',               grp:5 },
  { id:'U125-9',   code:'U125 ST9',   name:'Sand Yellow',              grp:5 },
  { id:'H1708-17', code:'H1708 ST17', name:'Brighton Chestnut',        grp:5 },
  { id:'H1247-17', code:'H1247 ST17', name:'Graphite Sheffield Acacia', grp:5 },
  { id:'U250-9',   code:'U250 ST9',   name:'Caramel Beige',            grp:5 },
  { id:'H1242-10', code:'H1242 ST10', name:'Natural Sheffield Acacia',  grp:5 },
  { id:'U669-9',   code:'U669 ST9',   name:'Estate Green',             grp:5 },
  { id:'H1154-7',  code:'H1154 ST7',  name:'Lissa Oak',                grp:5 },
  { id:'H1521-7',  code:'H1521 ST7',  name:'Maple',                    grp:5 },
  { id:'H1582-7',  code:'H1582 ST7',  name:'Ellmau Beech',             grp:5 },
  { id:'H3704-7',  code:'H3704 ST7',  name:'Tobacco Aida Walnut',      grp:5 },
  { id:'H1334-9',  code:'H1334 ST9',  name:'Light Sorano Oak',         grp:5 },
  { id:'H3382-9',  code:'H3382 ST9',  name:'Light Winchester Oak',     grp:5 },
  { id:'U565-9',   code:'U565 ST9',   name:'Ocean Blue',               grp:5 },
  { id:'U504-9',   code:'U504 ST9',   name:'Tyrolean Blue',            grp:5 },
  { id:'U665-9',   code:'U665 ST9',   name:'Stone Green',              grp:5 },
  // Group 6
  { id:'F765-20',  code:'F765 ST20',  name:'Brushed Silvergrey',           grp:6 },
  { id:'H1145-10', code:'H1145 ST10', name:'Natural Bardolino Oak',         grp:6 },
  { id:'H1225-12', code:'H1225 ST12', name:'Trondheim Ash',                 grp:6 },
  { id:'H1303-12', code:'H1303 ST12', name:'Brown Belmont Oak',             grp:6 },
  { id:'H1313-10', code:'H1313 ST10', name:'Grey Brown Whiteriver Oak',     grp:6 },
  { id:'H1318-10', code:'H1318 ST10', name:'Natural Wild Oak',              grp:6 },
  { id:'H1330-10', code:'H1330 ST10', name:'Vintage Santa Fe Oak',          grp:6 },
  { id:'H1357-10', code:'H1357 ST10', name:'Grey Beige Spree Oak',          grp:6 },
  { id:'H1399-10', code:'H1399 ST10', name:'Truffle Brown Denver Oak',      grp:6 },
  { id:'H1372-19', code:'H1372 ST19', name:'Natural Aragon Oak',            grp:6 },
  { id:'H1715-12', code:'H1715 ST12', name:'Parona Walnut',                 grp:6 },
  { id:'H2033-10', code:'H2033 ST10', name:'Dark Hunton Oak',               grp:6 },
  { id:'H3043-12', code:'H3043 ST12', name:'Dark Brown Eucalyptus',         grp:6 },
  { id:'H3131-12', code:'H3131 ST12', name:'Natural Davos Oak',             grp:6 },
  { id:'H3133-12', code:'H3133 ST12', name:'Truffle Brown Davos Oak',       grp:6 },
  { id:'H3157-12', code:'H3157 ST12', name:'Vicenza Oak',                   grp:6 },
  { id:'H3170-12', code:'H3170 ST12', name:'Natural Kendal Oak',            grp:6 },
  { id:'H3171-12', code:'H3171 ST12', name:'Oiled Kendal Oak',              grp:6 },
  { id:'H3303-10', code:'H3303 ST10', name:'Natural Hamilton Oak',          grp:6 },
  { id:'H3331-10', code:'H3331 ST10', name:'Natural Nebraska Oak',          grp:6 },
  { id:'H3332-10', code:'H3332 ST10', name:'Grey Nebraska Oak',             grp:6 },
  { id:'H3700-10', code:'H3700 ST10', name:'Natural Pacific Walnut',        grp:6 },
  { id:'H3702-10', code:'H3702 ST10', name:'Tobacco Pacific Walnut',        grp:6 },
  { id:'H3710-12', code:'H3710 ST12', name:'Natural Carini Walnut',         grp:6 },
  { id:'H3730-10', code:'H3730 ST10', name:'Natural Hickory',               grp:6 },
  { id:'W1000-19', code:'W1000 ST19', name:'Premium White',                 grp:6 },
  { id:'H1146-10', code:'H1146 ST10', name:'Grey Bardolino Oak',            grp:6 },
  { id:'H3090-19', code:'H3090 ST19', name:'Shorewood',                     grp:6 },
  { id:'H1316-17', code:'H1316 ST17', name:'Bookmatch Oak',                 grp:6 },
  { id:'H7586-17', code:'H7586 ST17', name:'Tobacco Alba Walnut',           grp:6 },
  { id:'H1362-12', code:'H1362 ST12', name:'Light Baronia Oak',             grp:6 },
  { id:'U961-19',  code:'U961 ST19',  name:'Graphite',                      grp:6 },
  { id:'U115-19',  code:'U115 ST19',  name:'Carat Beige',                   grp:6 },
  { id:'U211-19',  code:'U211 ST19',  name:'Almond Beige',                  grp:6 },
  { id:'U444-19',  code:'U444 ST19',  name:'Cassis',                        grp:6 },
  { id:'U590-19',  code:'U590 ST19',  name:'Deep Blue',                     grp:6 },
  { id:'U638-19',  code:'U638 ST19',  name:'Sage Green',                    grp:6 },
  { id:'U604-19',  code:'U604 ST19',  name:'Reed Green',                    grp:6 },
  { id:'U645-19',  code:'U645 ST19',  name:'Agave Green',                   grp:6 },
  { id:'U702-19',  code:'U702 ST19',  name:'Cashmere Grey',                 grp:6 },
  { id:'U708-19',  code:'U708 ST19',  name:'Light Grey',                    grp:6 },
  { id:'U732-19',  code:'U732 ST19',  name:'Dust Grey',                     grp:6 },
  { id:'U750-19',  code:'U750 ST19',  name:'Taupe Grey',                    grp:6 },
  { id:'U818-9',   code:'U818 ST9',   name:'Dark Brown',                    grp:6 },
  { id:'U999-19',  code:'U999 ST19',  name:'Black',                         grp:6 },
  { id:'U999-20',  code:'U999 ST20',  name:'Black (Synchronpore)',           grp:6 },
  { id:'W1200-19', code:'W1200 ST19', name:'Porcelain White',               grp:6 },
  // Group 7
  { id:'F186-9',   code:'F186 ST9',   name:'Light Grey Chicago Concrete',   grp:7 },
  { id:'F187-9',   code:'F187 ST9',   name:'Dark Grey Chicago Concrete',    grp:7 },
  { id:'F206-9',   code:'F206 ST9',   name:'Black Pietra Grigia',           grp:7 },
  { id:'F416-10',  code:'F416 ST10',  name:'Beige Textile',                 grp:7 },
  { id:'F417-10',  code:'F417 ST10',  name:'Grey Textile',                  grp:7 },
  { id:'F422-10',  code:'F422 ST10',  name:'White Linen',                   grp:7 },
  { id:'F424-10',  code:'F424 ST10',  name:'Brown Linen',                   grp:7 },
  { id:'F433-10',  code:'F433 ST10',  name:'Anthracite Linen',              grp:7 },
  { id:'F638-10',  code:'F638 ST10',  name:'Chromix Silver',                grp:7 },
  { id:'F800-9',   code:'F800 ST9',   name:'Crystal Marble',                grp:7 },
  { id:'F812-9',   code:'F812 ST9',   name:'White Levanto Marble',          grp:7 },
  { id:'H309-12',  code:'H309 ST12',  name:'Brown Tonsberg Oak',            grp:7 },
  { id:'H3146-19', code:'H3146 ST19', name:'Beige Grey Lorenzo Oak',        grp:7 },
  { id:'H3158-19', code:'H3158 ST19', name:'Grey Vicenza Oak',              grp:7 },
  { id:'H1223-19', code:'H1223 ST19', name:'Sevilla Ash',                   grp:7 },
  { id:'H1307-19', code:'H1307 ST19', name:'Brown Warmia Walnut',           grp:7 },
  { id:'H3190-19', code:'H3190 ST19', name:'Anthracite Fineline Metallic',  grp:7 },
  { id:'H3195-19', code:'H3195 ST19', name:'White Fineline',                grp:7 },
  { id:'H3198-19', code:'H3198 ST19', name:'Dark Grey Fineline',            grp:7 },
  { id:'H1714-19', code:'H1714 ST19', name:'Lincoln Walnut',                grp:7 },
  { id:'H3003-19', code:'H3003 ST19', name:'Norfolk Oak',                   grp:7 },
  { id:'H3349-19', code:'H3349 ST19', name:'Kaisersberg Oak',               grp:7 },
  { id:'H3787-19', code:'H3787 ST19', name:'Brown Bolivar Wood',            grp:7 },
  // Group 8
  { id:'F235-76',  code:'F235 ST76',  name:'Scivaro Slate',                grp:8 },
  { id:'F237-76',  code:'F237 ST76',  name:'Cupria Slate',                 grp:8 },
  { id:'F243-76',  code:'F243 ST76',  name:'Light Grey Candela Marble',    grp:8 },
  { id:'F244-76',  code:'F244 ST76',  name:'Anthracite Candela Marble',    grp:8 },
  { id:'F323-20',  code:'F323 ST20',  name:'Cobra Bronze',                 grp:8 },
  { id:'F434-20',  code:'F434 ST20',  name:'Cubanite Steelbrush',          grp:8 },
  { id:'F500-20',  code:'F500 ST20',  name:'Metallic Inox',                grp:8 },
  { id:'F527-20',  code:'F527 ST20',  name:'Golden Brushed Metal',         grp:8 },
  { id:'F528-20',  code:'F528 ST20',  name:'Bronze Brushed Metal',         grp:8 },
  { id:'F579-20',  code:'F579 ST20',  name:'Champagne Crossed Metal',      grp:8 },
  { id:'F634-76',  code:'F634 ST76',  name:'Grey Canvas',                  grp:8 },
  { id:'F661-76',  code:'F661 ST76',  name:'Sand Beige Calcit Stone',      grp:8 },
  { id:'F662-76',  code:'F662 ST76',  name:'Pebble Grey Calcit Stone',     grp:8 },
  { id:'F037-76',  code:'F037 ST76',  name:'Taormina Travertine',          grp:8 },
  { id:'U702-30',  code:'U702 ST30',  name:'Cashmere Grey',                grp:8 },
  { id:'U961-30',  code:'U961 ST30',  name:'Graphite Grey',                grp:8 },
  { id:'U708-30',  code:'U708 ST30',  name:'Light Grey',                   grp:8 },
  { id:'W1000-30', code:'W1000 ST30', name:'Premium White',                grp:8 },
  { id:'W1100-30', code:'W1100 ST30', name:'Alpine White',                 grp:8 },
  { id:'U732-30',  code:'U732 ST30',  name:'Dust Grey',                    grp:8 },
  { id:'U702-40',  code:'U702 ST40',  name:'Cashmere',                     grp:8 },
  { id:'U444-40',  code:'U444 ST40',  name:'Cassis',                       grp:8 },
  { id:'U115-40',  code:'U115 ST40',  name:'Carat Beige',                  grp:8 },
  { id:'U211-40',  code:'U211 ST40',  name:'Almond Beige',                 grp:8 },
  { id:'U638-40',  code:'U638 ST40',  name:'Sage Green',                   grp:8 },
  { id:'U961-40',  code:'U961 ST40',  name:'Graphite',                     grp:8 },
  { id:'U590-40',  code:'U590 ST40',  name:'Deep Blue',                    grp:8 },
  { id:'U104-40',  code:'U104 ST40',  name:'Alabaster',                    grp:8 },
  { id:'U999-40',  code:'U999 ST40',  name:'Black',                        grp:8 },
  { id:'U604-40',  code:'U604 ST40',  name:'Reed Green',                   grp:8 },
  { id:'U645-40',  code:'U645 ST40',  name:'Agave Green',                  grp:8 },
  { id:'W1000-40', code:'W1000 ST40', name:'Premium White',                grp:8 },
  { id:'U708-40',  code:'U708 ST40',  name:'Light Grey',                   grp:8 },
  { id:'U599-40',  code:'U599 ST40',  name:'Indigo Blue',                  grp:8 },
  { id:'W1200-40', code:'W1200 ST40', name:'Porcelain White',              grp:8 },
  { id:'U750-40',  code:'U750 ST40',  name:'Taupe Grey',                   grp:8 },
  { id:'U732-40',  code:'U732 ST40',  name:'Dust Grey',                    grp:8 },
  // Group 9
  { id:'H1142-36', code:'H1142 ST36', name:'Brown Sacramento Oak',        grp:9 },
  { id:'H1143-36', code:'H1143 ST36', name:'Grey Sacramento Oak',         grp:9 },
  { id:'H1250-36', code:'H1250 ST36', name:'Navarra Ash',                 grp:9 },
  { id:'H1377-36', code:'H1377 ST36', name:'Sand Orleans Oak',            grp:9 },
  { id:'H1379-36', code:'H1379 ST36', name:'Brown Orleans Oak',           grp:9 },
  { id:'H3154-36', code:'H3154 ST36', name:'Dark Brown Charleston Oak',   grp:9 },
  { id:'H1486-36', code:'H1486 ST36', name:'Pasadena Pine',               grp:9 },
  // Group 10
  { id:'H1176-37', code:'H1176 ST37', name:'White Halifax Oak',            grp:10 },
  { id:'H1180-37', code:'H1180 ST37', name:'Natural Halifax Oak',          grp:10 },
  { id:'H1181-37', code:'H1181 ST37', name:'Tobacco Halifax Oak',          grp:10 },
  { id:'H1367-40', code:'H1367 ST40', name:'Light Natural Casella Oak',    grp:10 },
  { id:'H1369-40', code:'H1369 ST40', name:'Marone Casella Oak',           grp:10 },
  { id:'H1336-37', code:'H1336 ST37', name:'Sand Grey Glazed Halifax Oak', grp:10 },
  { id:'H1388-40', code:'H1388 ST40', name:'Sand Casella Oak',             grp:10 },
  { id:'H1384-40', code:'H1384 ST40', name:'White Casella Oak',            grp:10 },
  { id:'H1385-40', code:'H1385 ST40', name:'Natural Casella Oak',          grp:10 },
  { id:'H1386-40', code:'H1386 ST40', name:'Brown Casella Oak',            grp:10 },
  { id:'H1186-37', code:'H1186 ST37', name:'Dark Brown Garrone Oak',       grp:10 },
  { id:'H3176-37', code:'H3176 ST37', name:'Pewter Halifax Oak',           grp:10 },
  { id:'H3180-37', code:'H3180 ST37', name:'Brown Halifax Oak',            grp:10 },
  { id:'H3309-28', code:'H3309 ST28', name:'Sand Gladstone Oak',           grp:10 },
  { id:'H3311-28', code:'H3311 ST28', name:'Bleached Cuneo Oak',           grp:10 },
  { id:'H3317-28', code:'H3317 ST28', name:'Brown Cuneo Oak',              grp:10 },
  { id:'H3325-28', code:'H3325 ST28', name:'Tobacco Gladstone Oak',        grp:10 },
  { id:'H3326-28', code:'H3326 ST28', name:'Grey-Beige Gladstone Oak',     grp:10 },
  { id:'H3335-28', code:'H3335 ST28', name:'White Gladstone Oak',          grp:10 },
];

export const PS_GLOSS_DECORS = [
  { id:'pg-W1100', code:'W1100 PG', name:'Alpine White'  },
  { id:'pg-U702',  code:'U702 PG',  name:'Cashmere Grey' },
  { id:'pg-U708',  code:'U708 PG',  name:'Light Grey'    },
  { id:'pg-U732',  code:'U732 PG',  name:'Dust Grey'     },
  { id:'pg-U999',  code:'U999 PG',  name:'Black'         },
];

export const PS_MATT_DECORS = [
  { id:'pm-W1000', code:'W1000 PM', name:'Premium White' },
  { id:'pm-W1100', code:'W1100 PM', name:'Alpine White'  },
  { id:'pm-U399',  code:'U399 PM',  name:'Garnet Red'    },
  { id:'pm-U599',  code:'U599 PM',  name:'Indigo Blue'   },
  { id:'pm-U665',  code:'U665 PM',  name:'Stone Green'   },
  { id:'pm-U702',  code:'U702 PM',  name:'Cashmere Grey' },
  { id:'pm-U705',  code:'U705 PM',  name:'Angora Grey'   },
  { id:'pm-U708',  code:'U708 PM',  name:'Light Grey'    },
  { id:'pm-U732',  code:'U732 PM',  name:'Dust Grey'     },
  { id:'pm-U767',  code:'U767 PM',  name:'Cubanit Grey'  },
  { id:'pm-U961',  code:'U961 PM',  name:'Graphite Grey' },
  { id:'pm-U999',  code:'U999 PM',  name:'Black'         },
];

export const TM_DECORS = [
  { id:'tm-W1100',   code:'W1100 TM',   name:'Alpine White',         tmtype:'TM',   price:120 },
  { id:'tm-U201',    code:'U201 TM',    name:'Pebble Grey',          tmtype:'TM',   price:120 },
  { id:'tm-U250',    code:'U250 TM',    name:'Caramel Beige',        tmtype:'TM',   price:120 },
  { id:'tm-U750',    code:'U750 TM',    name:'Taupe Grey',           tmtype:'TM',   price:120 },
  { id:'tm-U960',    code:'U960 TM',    name:'Onyx Grey',            tmtype:'TM',   price:120 },
  { id:'tm-U740',    code:'U740 TM',    name:'Dark Taupe',           tmtype:'TM',   price:120 },
  { id:'tm-U398',    code:'U398 TM',    name:'Dark Berry',           tmtype:'TM',   price:120 },
  { id:'tm-U590',    code:'U590 TM',    name:'Deep Blue',            tmtype:'TM',   price:120 },
  { id:'tm-U968',    code:'U968 TM',    name:'Carbon Grey',          tmtype:'TM',   price:120 },
  { id:'tm12-H1228', code:'H1228 TM12', name:'Anthracite Abano Ash', tmtype:'TM12', price:120 },
  { id:'tm12-H1227', code:'H1227 TM12', name:'Brown Abano Ash',      tmtype:'TM12', price:120 },
  { id:'tm12-H3041', code:'H3041 TM12', name:'Natural Eucalyptus',   tmtype:'TM12', price:120 },
  { id:'tm28-U999',  code:'U999 TM28',  name:'Black',                tmtype:'TM28', price:139 },
];

// ── Build MATERIALS dynamically ───────────────────────────────────
export const MATERIALS = {};

MFC_DECORS.forEach(d => {
  const base = { sheetW:2800, sheetH:2070, cutCost:15 };
  MATERIALS['eg18-' + d.id] = {
    ...base,
    name:    `Egger MFC 18mm — ${d.code} ${d.name}`,
    display: `${d.code} — ${d.name}`,
    price:   EGGER_GRP_PRICE[d.grp],
    _cat: 'mfc18', _grp: d.grp, _code: d.code,
  };
  MATERIALS['eg8-' + d.id] = {
    ...base,
    name:    `Egger MFC 8mm — ${d.code} ${d.name}`,
    display: `8mm ${d.code} — ${d.name}`,
    price:   EGGER_GRP_PRICE[d.grp],
    _cat: 'mfc8', _grp: d.grp, _code: d.code,
  };
});

PS_GLOSS_DECORS.forEach(d => {
  MATERIALS['eg-' + d.id] = {
    sheetW:2800, sheetH:2070, cutCost:15,
    name:    `Egger PS Gloss MDF 19mm — ${d.code} ${d.name}`,
    display: `${d.code} — ${d.name}`,
    price:   182,
    _cat: 'ps-gloss', _code: d.code,
  };
});

PS_MATT_DECORS.forEach(d => {
  MATERIALS['eg-' + d.id] = {
    sheetW:2800, sheetH:2070, cutCost:15,
    name:    `Egger PS Matt MDF 19mm — ${d.code} ${d.name}`,
    display: `${d.code} — ${d.name}`,
    price:   194,
    _cat: 'ps-matt', _code: d.code,
  };
});

TM_DECORS.forEach(d => {
  MATERIALS['eg-' + d.id] = {
    sheetW:2800, sheetH:2070, cutCost:15,
    name:    `Egger TM MFC — ${d.code} ${d.name}`,
    display: `${d.code} — ${d.name}`,
    price:   d.price,
    _cat: 'tm', _tmtype: d.tmtype, _code: d.code,
  };
});

Object.assign(MATERIALS, {
  'free-issued-2800': { name:'Free Issued Board 2800×2070mm', display:'Free Issued 2800×2070', price:0,  sheetW:2800, sheetH:2070, cutCost:15 },
  'free-issued-3050': { name:'Free Issued Board 3050×1220mm', display:'Free Issued 3050×1220', price:0,  sheetW:3050, sheetH:1220, cutCost:7  },
  'free-issued-2440': { name:'Free Issued Board 2440×1220mm', display:'Free Issued 2440×1220', price:0,  sheetW:2440, sheetH:1220, cutCost:7  },
  'mdf-18-2440':      { name:'MDF 18mm (2440×1220)', display:'MDF 18mm — 2440×1220', price:23, sheetW:2440, sheetH:1220, cutCost:7  },
  'mdf-18-3050':      { name:'MDF 18mm (3050×1220)', display:'MDF 18mm — 3050×1220', price:28, sheetW:3050, sheetH:1220, cutCost:7  },
  'mdf-12':           { name:'MDF 12mm (2440×1220)', display:'MDF 12mm — 2440×1220', price:20, sheetW:2440, sheetH:1220, cutCost:7  },
  'mdf-9':            { name:'MDF 9mm (2440×1220)',  display:'MDF 9mm — 2440×1220',  price:18, sheetW:2440, sheetH:1220, cutCost:7  },
  'mdf-6':            { name:'MDF 6mm (2440×1220)',  display:'MDF 6mm — 2440×1220',  price:15, sheetW:2440, sheetH:1220, cutCost:7  },
  'mrmdf-18-2440':    { name:'MR MDF 18mm (2440×1220)', display:'MR MDF 18mm — 2440×1220', price:30, sheetW:2440, sheetH:1220, cutCost:7  },
  'mrmdf-18-3050':    { name:'MR MDF 18mm (3050×1220)', display:'MR MDF 18mm — 3050×1220', price:36, sheetW:3050, sheetH:1220, cutCost:7  },
  'mrmdf-12':         { name:'MR MDF 12mm (2440×1220)', display:'MR MDF 12mm — 2440×1220', price:22, sheetW:2440, sheetH:1220, cutCost:7  },
  'mrmdf-9':          { name:'MR MDF 9mm (2440×1220)',  display:'MR MDF 9mm — 2440×1220',  price:20, sheetW:2440, sheetH:1220, cutCost:7  },
  'mrmdf-6':          { name:'MR MDF 6mm (2440×1220)',  display:'MR MDF 6mm — 2440×1220',  price:15, sheetW:2440, sheetH:1220, cutCost:7  },
});

export const EDGING_OPTS = ['No Edge','E1L','E2L','E1W','E2W','E1L1W','E1L2W','E2L1W','EAR'];

export const EDGING_LABELS = {
  'No Edge': 'No edging',
  'E1L':    '1 Long edge',
  'E2L':    '2 Long edges',
  'E1W':    '1 Width edge',
  'E2W':    '2 Width edges',
  'E1L1W':  '1 Long + 1 Width',
  'E1L2W':  '1 Long + 2 Width',
  'E2L1W':  '2 Long + 1 Width',
  'EAR':    'Edge All Round',
};

export function calcEdgingMm(l, w, qty, code) {
  const map = {
    'No Edge':0,'E1L':l,'E2L':2*l,'E1W':w,'E2W':2*w,
    'E1L1W':l+w,'E1L2W':l+2*w,'E2L1W':2*l+w,'EAR':2*(l+w),
  };
  return (map[code] || 0) * qty;
}

export function edgingDesc(l, w, qty, code) {
  const descs = {
    'No Edge': 'No edging',
    'E1L':   `QTY ${qty} × 1 Long Edge = ${qty}×${l}mm`,
    'E2L':   `QTY ${qty} × 2 Long Edges = ${qty}×${2*l}mm`,
    'E1W':   `QTY ${qty} × 1 Width Edge = ${qty}×${w}mm`,
    'E2W':   `QTY ${qty} × 2 Width Edges = ${qty}×${2*w}mm`,
    'E1L1W': `QTY ${qty} × 1L+1W = ${qty}×(${l}+${w})mm`,
    'E1L2W': `QTY ${qty} × 1L+2W = ${qty}×(${l}+${2*w})mm`,
    'E2L1W': `QTY ${qty} × 2L+1W = ${qty}×(${2*l}+${w})mm`,
    'EAR':   `QTY ${qty} × All Round = ${qty}×2×(${l}+${w})mm`,
  };
  return descs[code] || '';
}
