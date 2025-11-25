import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  ViewState, 
  HuntItem, 
  Poll, 
  Photo, 
  HuntType,
  PollOption,
  Game,
  GameSignup,
  GameResult
} from './types';
import { 
  IconHome, 
  IconVillage, 
  IconHouse, 
  IconVote, 
  IconCamera, 
  IconUser, 
  IconLock, 
  IconUpload, 
  IconCheck, 
  IconDownload, 
  IconPlus, 
  IconSparkles,
  IconSnow,
  IconGift, 
  IconGamepad,
  IconTrophy
} from './components/Icons';
import { Button, Input, TextArea, Card } from './components/UI';

// --- Helpers ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Create canvas to resize image
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Export as JPEG with 0.7 quality for compression
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        } else {
            reject(new Error('Canvas context failed'));
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const LOGO_URL = "https://static.wixstatic.com/media/d8edc3_6b8535321c8d4e35aa4351da27493b19~mv2.png/v1/fill/w_506,h_506,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/FBT%20-5%20(1-24-25).png";

// --- Persistence Hook ---
const STORAGE_PREFIX = 'fruth_app_v3_';

function useStickyState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stickyValue = window.localStorage.getItem(STORAGE_PREFIX + key);
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
      } catch (e) {
        console.error('Error loading state:', e);
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      } catch (e) {
        console.warn('LocalStorage quota exceeded or error saving state.', e);
      }
    }
  }, [key, value]);

  return [value, setValue];
}

const getPollStats = (poll: Poll, lang: 'en' | 'es') => {
  const totalVotes = Object.keys(poll.answers).length;
  if (totalVotes === 0) return null;

  if (poll.type === 'MULTIPLE_CHOICE' && poll.options) {
    return poll.options.map(opt => {
      const count = Object.values(poll.answers).filter(val => val === opt.id).length;
      const pct = Math.round((count / totalVotes) * 100);
      const text = (lang === 'es' && opt.textEs) ? opt.textEs : opt.text;
      return { label: text, count, pct, id: opt.id };
    });
  } else {
    const counts: Record<string, number> = {};
    Object.values(poll.answers).forEach(ans => {
      const clean = ans.toLowerCase().trim();
      counts[clean] = (counts[clean] || 0) + 1;
    });
    return Object.entries(counts).map(([text, count]) => ({
      label: text,
      count,
      pct: Math.round((count / totalVotes) * 100),
      id: text
    })).sort((a,b) => b.count - a.count);
  }
};

const getLocText = (obj: any, key: string, lang: 'en' | 'es') => {
  if (lang === 'es' && obj[`${key}Es`]) {
    return obj[`${key}Es`];
  }
  return obj[key];
};

// --- Constants ---
const CHRISTMAS_FACTS_EN = [
  "Jingle Bells was originally written for Thanksgiving.",
  "Christmas trees were first decorated with foods like apples, nuts, and dates.",
  "Santa Claus has his own postal code in Canada: H0H 0H0.",
  "The first artificial Christmas trees were made from goose feathers.",
  "Rudolph the Red-Nosed Reindeer was created as a marketing gimmick for Montgomery Ward.",
  "Approximately 30-35 million real Christmas trees are sold in the U.S. alone every year.",
  "Christmas wasn't declared a federal holiday in the U.S. until 1870.",
  "The song 'Silent Night' is the most recorded Christmas song in history.",
  "The Statue of Liberty was gifted to the US by France on Christmas Day in 1886.",
  "Alabama was the first US state to officially recognize Christmas in 1836.",
  "Oklahoma was the last US state to declare Christmas a legal holiday in 1907.",
  "The tradition of Christmas stockings comes from the legend of St. Nicholas putting gold coins in socks drying by the fire.",
  "In Japan, eating KFC is a popular Christmas tradition.",
  "Spider webs are common Christmas tree decorations in Ukraine.",
  "The term 'Xmas' dates back to the 1500s; 'X' represents the Greek letter Chi, the first letter of Christ's name.",
  "The highest-grossing Christmas movie of all time is 'The Grinch' (2018), followed closely by 'Home Alone'.",
  "Candy canes were invented in Germany to keep choirboys quiet during services.",
  "The average person consumes about 6,000 calories on Christmas Day.",
  "There are two islands named Christmas Island—one in the Pacific and one in the Indian Ocean.",
  "Electric Christmas lights were first used in 1882 by Edward Johnson, an associate of Thomas Edison.",
  "Bing Crosby's 'White Christmas' is the best-selling single of all time.",
  "In Norway, people hide their brooms on Christmas Eve to prevent witches from stealing them.",
  "The 12 Days of Christmas actually start on Christmas Day and end on January 5th.",
  "The Rockefeller Center Christmas tree tradition began in 1933.",
  "Santa's sleigh would have to travel 650 miles per second to visit every child.",
  "Mistletoe literally means 'dung on a twig' because it is spread by bird droppings.",
  "Carols were originally dances accompanied by singing.",
  "Tinsel was invented in 1610 in Germany and was originally made of real silver.",
  "The Dutch tradition of Sinterklaas is the origin of the name Santa Claus.",
  "Eggnog originated in medieval Britain as a drink called 'posset'.",
  "Coca-Cola played a major role in shaping the modern image of Santa Claus in the 1930s.",
  "A 'Yule Log' is now a cake, but it used to be a massive log burned during the 12 days of Christmas.",
  "In Iceland, there are 13 Yule Lads who visit children before Christmas.",
  "Franklin Pierce was the first president to put a Christmas tree in the White House.",
  "The largest floating Christmas tree in the world is in Rio de Janeiro, Brazil.",
  "The Beatles held the Christmas number one spot in the UK for three years in a row (1963-1965).",
  "Giving presents was an ancient Roman tradition during Saturnalia, a festival in December.",
  "The poinsettia is native to Mexico and was brought to the US by Joel Poinsett.",
  "Brenda Lee recorded 'Rockin' Around the Christmas Tree' when she was only 13 years old.",
  "In the UK, it is mandatory for the monarch to broadcast a Christmas message.",
  "A white Christmas is defined as having at least 1 inch of snow on the ground on Christmas morning.",
  "Leaving milk and cookies for Santa became popular during the Great Depression.",
  "Male reindeer shed their antlers in winter, so Santa's reindeer are likely female.",
  "The first Christmas card was sent in 1843 by Sir Henry Cole.",
  "Roast turkey didn't appear on Christmas tables until the 16th century; before that, it was often boar's head.",
  "In Caracas, Venezuela, it is customary to roller skate to church on Christmas morning.",
  "The song 'We Wish You a Merry Christmas' was originally a threat from servants demanding booze.",
  "During WWI in 1914, a Christmas Truce was held between German and British troops.",
  "Measuring 221 ft, the tallest Christmas tree ever displayed was in Seattle in 1950.",
  "Before turkey, the traditional English Christmas meal was a pig's head and mustard.",
  "Many zoos accept donated Christmas trees to feed to their animals.",
  "The Nutcracker ballet wasn't a success when it first premiered in 1892.",
  "It takes about 7-10 years to grow a Christmas tree of typical height.",
  "In Peru, there is a festival called Takanakuy where people fist fight on Christmas to settle grievances.",
  "US scientists calculated that Santa would need 360,000 reindeer to pull his sleigh if laden with gifts.",
  "The poem 'A Visit from St. Nicholas' (Twas the Night Before Christmas) introduced the names of the reindeer.",
  "Donner and Blitzen are named after the German words for thunder and lightning.",
  "The Friars Club in Beverly Hills was once sued for not displaying a Menorah next to its Christmas tree.",
  "Christmas purchases account for 1/6 of all retail sales in the US annually.",
  "The abbreviation 'Xmas' is not irreligious; X is the Greek abbreviation for Christ.",
  "Traditionally, if you refuse a mince pie, you will have bad luck for the coming year.",
  "In 1980, the Rubik's Cube was the best-selling Christmas toy.",
  "The first state to recognize Christmas as a holiday was Alabama.",
  "More diamonds are sold around Christmas than any other time of the year.",
  "Approximately 200 Christmas trees catch fire in the US every year.",
  "Santa has to visit 822 homes a second to deliver all the world's presents.",
  "Bolivia celebrates Christmas with the 'Mass of the Rooster' at midnight.",
  "The puritans in America banned Christmas from 1659 to 1681.",
  "Why is Christmas on Dec 25? It was likely chosen to coincide with the winter solstice festivals.",
  "There is a town called Santa Claus in Indiana.",
  "There is also a town called North Pole in Alaska.",
  "The biggest Christmas gift ever given was the Statue of Liberty.",
  "St. Nicholas was known for his generosity and was a bishop in modern-day Turkey.",
  "Gold, Frankincense, and Myrrh were the gifts from the Three Wise Men.",
  "If you received all the gifts in 'The Twelve Days of Christmas', you would have 364 gifts.",
  "Christmas wreathes are symbols of Christ's suffering, with red berries representing blood.",
  "Using evergreen branches to decorate homes in winter dates back to ancient solstice celebrations.",
  "In the Middle Ages, Christmas celebrations were rowdy and boisterous, similar to Mardi Gras.",
  "Washington Irving helped popularize the image of Santa flying in a wagon in 1819.",
  "The Salvation Army's Christmas collection kettles evolved from a large pot used to collect donations in 1891.",
  "Almost 2 billion Christmas cards are sent in the US each year.",
  "VISA cards are used about 6,000 times every minute during the Christmas season.",
  "In Poland, spiders are considered symbols of goodness and prosperity at Christmas.",
  "The tradition of the pickle ornament is thought to have German roots, though most Germans have never heard of it.",
  "Commissioned by Queen Victoria, the first official Christmas card depicted a family drinking wine.",
  "Some people eat fried caterpillars in South Africa on Christmas.",
  "The first Christmas stamp was issued in Canada in 1898.",
  "The song 'Frosty the Snowman' was a hit after Gene Autry recorded it in 1950.",
  "In Sweden, a common decoration is the Yule Goat, made of straw.",
  "A huge straw goat is built in Gävle, Sweden every year, and vandals often try to burn it down.",
  "Tangerines are often put in stockings to represent the gold coins St. Nicholas gave away.",
  "In ancient times, people would light candles to encourage the sun to return after the solstice.",
  "The date of Jesus's birth is not mentioned in the Bible.",
  "Christmas Island in the Indian Ocean has an annual migration of millions of red crabs.",
  "The British eat over 10 million turkeys for Christmas dinner.",
  "Astronauts on Gemini 6 played 'Jingle Bells' from space in 1965.",
  "The most popular Christmas tree in the US is the Fraser Fir.",
  "Artificial snow used in early Hollywood movies was made of painted cornflakes.",
  "It is technically illegal to eat mince pies on Christmas Day in England due to an old law by Oliver Cromwell.",
  "Postmen in Victorian England were called 'robins' because of their red uniforms.",
  "The star on top of the tree represents the Star of Bethlehem.",
  "In Greenland, a traditional Christmas dish is 'Kiviak' – fermented seabirds wrapped in seal skin.",
  "Children in the Netherlands leave shoes out for Sinterklaas on December 5th.",
  "Italian children are visited by La Befana, a witch who delivers candy, on Epiphany Eve.",
  "Celebrating Christmas was once illegal in Boston.",
  "The candy cane's shape represents a shepherd's crook.",
  "The tradition of the Yule Log goes back to the Iron Age.",
  "In Germany, Christmas Eve is said to be a magical time when the pure in heart can hear animals talking.",
  "The first artificial Christmas trees were made in Germany in the 19th century using goose feathers.",
  "Alabama was the first state in the US to recognize Christmas as an official holiday.",
  "Christmas cards were introduced in 1915 by Hallmark.",
  "The movie 'Elf' was filmed in New York City and Vancouver.",
  "Mariah Carey's 'All I Want for Christmas Is You' took 25 years to reach number one on the Billboard Hot 100.",
  "In the Ukraine, finding a spider web on your Christmas tree is considered good luck.",
  "The most popular tree topper is an angel.",
  "The second most popular tree topper is a star.",
  "In 1914, during World War I, a spontaneous Christmas truce was declared between British and German troops.",
  "The song 'Jingle Bells' was the first song broadcast from space.",
  "The poinsettia plant is named after Joel R. Poinsett, an American minister to Mexico.",
  "Candy canes are the number one selling non-chocolate candy in December.",
  "The largest Christmas stocking measured 106 feet and 9 inches long.",
  "The tradition of naughty kids getting coal comes from Italy.",
  "Santa Claus is known as Sinterklaas in Dutch.",
  "The 12 Days of Christmas cost over $40,000 in 2019 according to the PNC Christmas Price Index.",
  "In Japan, a traditional Christmas dinner is Kentucky Fried Chicken.",
  "Tinsel was once banned by the US government because it contained lead.",
  "The first recorded date of Christmas being celebrated on December 25th was in 336.",
  "The word 'Christmas' comes from the old English 'Cristes maesse', meaning the mass of Christ.",
  "Swedes celebrate St. Lucia's Day on December 13th.",
  "In Greece, spirits called Kallikantzaroi are said to surface from underground during Christmas.",
  "Some zoos donate their Christmas trees to animals for food or play.",
  "The world's largest Christmas stocking weighed 1,600 pounds.",
  "London's Trafalgar Square Christmas tree is donated by the people of Oslo, Norway every year.",
  "Christmas crackers were invented by Tom Smith in 1847.",
  "Bob Hope hosted a Christmas special for US troops for 40 years.",
  "The movie 'It's a Wonderful Life' was a box office flop when it was released.",
  "Paul McCartney earns about $400,000 a year from his song 'Wonderful Christmastime'.",
  "In Finland, it's tradition to go to the sauna on Christmas Eve.",
  "The first White House Christmas card was sent by President Coolidge in 1927.",
  "There is a Christmas tree in the center of the Galeries Lafayette in Paris that hangs upside down.",
  "In Slovakia, the father of the family throws a spoonful of loksa pudding at the ceiling; the more that sticks, the better the harvest.",
  "The poinsettia is also known as the 'Lobster Flower' and 'Flame Leaf Flower'.",
  "George Michael wrote 'Last Christmas' in his childhood bedroom.",
  "The tradition of putting up a Christmas tree dates back to 16th century Germany.",
  "Approximately 35 million real Christmas trees are sold in the United States each year.",
  "The tradition of an advent calendar began in Germany in the 19th century.",
  "In Armenia, the traditional Christmas Eve meal consists of fried fish, lettuce, and spinach.",
  "The first Christmas tree in Rockefeller Center was placed in 1933 by construction workers.",
  "The largest group of carol singers consisted of 25,272 people in Nigeria in 2014.",
  "In Czechia, unmarried women stand with their backs to the door and throw a shoe over their shoulder to predict marriage.",
  "The highest grossing Christmas movie in the US is 'Home Alone'.",
  "There are 364 gifts in the '12 Days of Christmas' song.",
  "The longest Christmas stollen measured 72.1 meters (236.55 ft).",
  "In 1965, 'Jingle Bells' became the first song played in space by Gemini 6 astronauts.",
  "The tradition of hanging stockings by the fireplace comes from the story of St. Nicholas throwing gold coins down a chimney.",
  "The most popular Christmas song in the UK is 'Fairytale of New York' by The Pogues.",
  "In 1836, Alabama became the first state to declare Christmas a legal holiday.",
  "In 1907, Oklahoma became the last state to declare Christmas a legal holiday.",
  "The 'X' in Xmas comes from the Greek letter Chi, which is the first letter of the Greek word for Christ.",
  "The first Christmas card was commissioned by Sir Henry Cole in London in 1843.",
  "The world's largest gingerbread house was built in Texas in 2013 and covered 2,520 square feet.",
  "The most expensive Christmas tree was valued at $11 million and was decorated with diamonds, gold, and pearls.",
  "In the Philippines, the Christmas season lasts for four months, starting in September."
];

const CHRISTMAS_FACTS_ES = [
  "Jingle Bells was originally written for Thanksgiving.",
  "Los árboles de Navidad se decoraban primero con manzanas y nueces.",
  "Papá Noel tiene su propio código postal en Canadá: H0H 0H0.",
  "Rodolfo el reno fue creado como una estrategia de marketing.",
  "Silent Night es la canción navideña más grabada de la historia.",
  "La Estatua de la Libertad fue un regalo de Navidad de Francia a EE. UU.",
  "Los bastones de caramelo se inventaron en Alemania para callar a los niños en la iglesia.",
  "En Japón, comer KFC es una tradición navideña popular.",
  "Xmas data del siglo XVI; la X representa la letra griega Chi.",
  "La película navideña más taquillera es 'El Grinch'.",
  "Dos islas se llaman Isla de Navidad.",
  "Bing Crosby tiene el sencillo más vendido: 'White Christmas'.",
  "En Noruega, esconden las escobas en Nochebuena para evitar brujas.",
  "Los 12 días de Navidad empiezan el 25 de diciembre.",
  "El muérdago significa 'estiércol en una ramita'.",
  "Los villancicos eran originalmente bailes.",
  "El oropel se inventó en 1610 con plata real.",
  "Sinterklaas es el origen de Santa Claus.",
  "El ponche de huevo viene de una bebida medieval británica llamada 'posset'.",
  "Coca-Cola ayudó a moldear la imagen moderna de Santa.",
  "En Islandia, 13 Yule Lads visitan a los niños.",
  "Franklin Pierce puso el primer árbol en la Casa Blanca.",
  "La flor de Nochebuena es nativa de México.",
  "Una Navidad blanca requiere 1 pulgada de nieve.",
  "Los renos machos pierden sus cuernos en invierno; los de Santa son hembras.",
  "La primera tarjeta de Navidad se envió en 1843.",
  "En Caracas, Venezuela, se patina a la iglesia en Navidad.",
  "El árbol de Navidad más alto medía 221 pies.",
  "Muchos zoológicos aceptan árboles donados para sus animales.",
  "Se tardan 7-10 años en cultivar un árbol de Navidad.",
  "En Perú, la gente pelea a puñetazos en Navidad (Takanakuy).",
  "Donner y Blitzen son nombres alemanes para trueno y relámpago.",
  "Las compras navideñas son 1/6 de las ventas anuales en EE. UU.",
  "La abreviatura 'Xmas' no es irreligiosa.",
  "El cubo de Rubik fue el juguete más vendido en 1980.",
  "Santa tendría que visitar 822 casas por segundo.",
  "Bolivia celebra la 'Misa del Gallo'.",
  "Los puritanos prohibieron la Navidad en 1659.",
  "Hay un pueblo llamado Santa Claus en Indiana.",
  "El regalo más grande fue la Estatua de la Libertad.",
  "Los Reyes Magos trajeron oro, incienso y mirra.",
  "Las coronas simbolizan el sufrimiento de Cristo.",
  "En Polonia, las arañas son símbolos de prosperidad en Navidad.",
  "La tradición del pepinillo tiene raíces alemanas dudosas.",
  "En Sudáfrica algunos comen orugas fritas en Navidad.",
  "Frosty the Snowman fue un éxito de Gene Autry.",
  "En Suecia, la Cabra de Yule es popular.",
  "Las mandarinas representan las monedas de oro de San Nicolás.",
  "La fecha de nacimiento de Jesús no está en la Biblia.",
  "Los británicos comen 10 millones de pavos.",
  "Jingle Bells fue la primera canción en el espacio.",
  "La estrella del árbol representa la Estrella de Belén.",
  "En Groenlandia comen 'Kiviak' (aves fermentadas).",
  "En Holanda dejan zapatos para Sinterklaas el 5 de diciembre.",
  "La Befana visita a los niños italianos.",
  "El bastón de caramelo representa el cayado de un pastor.",
  "En Alemania, los animales hablan en Nochebuena (según la leyenda).",
  "El Grinch es la película más taquillera.",
  "Hay 364 regalos en la canción de los 12 días.",
  "En Filipinas la Navidad dura 4 meses."
];

// --- Initial Data Constants with Spanish Translations ---
const INITIAL_HUNTS: HuntItem[] = [
  // --- HOUSE HUNT ---
  { id: 'h1', text: 'Gizmo', textEs: 'Gizmo', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h2', text: 'Stripe', textEs: 'Rayita (Stripe)', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h3', text: 'Baby Grinch', textEs: 'Bebé Grinch', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h4', text: 'Mrs. Potts', textEs: 'Sra. Potts', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h5', text: 'Falkor', textEs: 'Falkor', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h6', text: 'Panda', textEs: 'Panda', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h7', text: 'Ladybug (x2)', textEs: 'Mariquita (x2)', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h8', text: 'Spider', textEs: 'Araña', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h9', text: 'Cockroach', textEs: 'Cucaracha', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h10', text: 'Caterpillar (x2)', textEs: 'Oruga (x2)', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h11', text: 'Tinkerbell (x2)', textEs: 'Campanita (x2)', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h12', text: 'Trump on a Shelf', textEs: 'Trump en el Estante', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h13', text: 'Elf on a Shelf (x3)', textEs: 'Elfo en el Estante (x3)', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h14', text: 'Chewbacca', textEs: 'Chewbacca', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h15', text: 'Bigfoot', textEs: 'Pie Grande', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h16', text: 'Mario & Luigi', textEs: 'Mario y Luigi', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h17', text: 'Jack Skellington', textEs: 'Jack Skellington', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h18', text: 'Crab', textEs: 'Cangrejo', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h19', text: 'Poison Dart Frog', textEs: 'Rana Dardo Venenosa', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h20', text: 'Koala', textEs: 'Koala', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h21', text: 'Mickey Mouse', textEs: 'Mickey Mouse', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h22', text: 'Lizard', textEs: 'Lagarto', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h23', text: 'Alligator Head', textEs: 'Cabeza de Caimán', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },
  { id: 'h24', text: 'Jurassic Park Christmas Tree', textEs: 'Árbol Jurassic Park', type: 'CHECKBOX', huntType: 'HOUSE', category: 'Hidden Items', categoryEs: 'Objetos Ocultos' },

  // --- VILLAGE HUNT ---
  // CHRISTMAS
  { id: 'v1', text: 'Nativity Set', textEs: 'Nacimiento', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'CHRISTMAS', categoryEs: 'NAVIDAD' },
  { id: 'v2', text: 'Olaf (x2)', textEs: 'Olaf (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'CHRISTMAS', categoryEs: 'NAVIDAD' },
  { id: 'v3', text: 'Jack Skellington', textEs: 'Jack Skellington', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'CHRISTMAS', categoryEs: 'NAVIDAD' },
  { id: 'v4', text: 'Grinch', textEs: 'Grinch', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'CHRISTMAS', categoryEs: 'NAVIDAD' },
  { id: 'v5', text: 'Buddy the Elf', textEs: 'Buddy el Elfo', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'CHRISTMAS', categoryEs: 'NAVIDAD' },
  { id: 'v6', text: 'Snow & Flurry', textEs: 'Nieve y Ráfaga', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'CHRISTMAS', categoryEs: 'NAVIDAD' },
  { id: 'v7', text: 'Cindy Lou Who', textEs: 'Cindy Lou Who', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'CHRISTMAS', categoryEs: 'NAVIDAD' },
  
  // DISNEY
  { id: 'v8', text: 'Mickey Mouse', textEs: 'Mickey Mouse', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v9', text: 'Goofy', textEs: 'Goofy', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v10', text: 'Arial', textEs: 'Ariel', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v11', text: 'Cinderella', textEs: 'Cenicienta', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v12', text: 'Bambi', textEs: 'Bambi', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v13', text: 'Steamboat Willie', textEs: 'Steamboat Willie', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v14', text: 'Donald Duck', textEs: 'Pato Donald', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v15', text: 'Daisy Duck', textEs: 'Daisy Duck', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v16', text: 'Captain Hook', textEs: 'Capitán Garfio', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v17', text: 'Lilo', textEs: 'Lilo', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v18', text: 'Stitch', textEs: 'Stitch', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v19', text: 'Iago', textEs: 'Iago', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },
  { id: 'v20', text: 'Chip', textEs: 'Chip', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DISNEY', categoryEs: 'DISNEY' },

  // TV, MOVIES & ANIMATION
  { id: 'v21', text: 'Otis', textEs: 'Otis', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v22', text: 'Elmo', textEs: 'Elmo', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v23', text: 'Big Bird', textEs: 'Abelardo', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v24', text: 'Bert & Ernie', textEs: 'Beto y Enrique', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v25', text: 'Homer', textEs: 'Homero', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v26', text: 'Itchy & Scratchy', textEs: 'Itchy y Scratchy', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v27', text: 'Bugs Bunny', textEs: 'Bugs Bunny', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v28', text: 'Snoopy (x2)', textEs: 'Snoopy (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v29', text: 'Mew', textEs: 'Mew', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v30', text: 'Charmeleon', textEs: 'Charmeleon', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v31', text: 'Pikachu', textEs: 'Pikachu', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },
  { id: 'v32', text: 'Sam & Dean Winchester (w/Impala)', textEs: 'Sam y Dean Winchester (c/Impala)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'TV, MOVIES & ANIMATION', categoryEs: 'TV, PELÍCULAS Y ANIMACIÓN' },

  // DINOSAURS & CREATURES
  { id: 'v33', text: 'Abominable Snowman', textEs: 'Abominable Hombre de las Nieves', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v34', text: 'Fairy', textEs: 'Hada', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v35', text: 'Bigfoot', textEs: 'Pie Grande', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v36', text: 'Dragon', textEs: 'Dragón', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v37', text: 'Unicorn', textEs: 'Unicornio', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v38', text: 'Tyrannosaurus', textEs: 'Tiranosaurio', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v39', text: 'Pterodactyl', textEs: 'Pterodáctilo', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v40', text: 'Velociraptor (x2)', textEs: 'Velociraptor (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v41', text: 'Dilophosaurus', textEs: 'Dilophosaurus', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v42', text: 'Dinosaur Skeleton', textEs: 'Esqueleto de Dinosaurio', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v43', text: 'Witch', textEs: 'Bruja', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },
  { id: 'v44', text: 'Vampire', textEs: 'Vampiro', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'DINOSAURS & CREATURES', categoryEs: 'DINOSAURIOS Y CRIATURAS' },

  // PEOPLE, SUPERHEROS & SCI-FI
  { id: 'v45', text: 'Spiderman (x2)', textEs: 'Spiderman (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'PEOPLE, SUPERHEROS & SCI-FI', categoryEs: 'GENTE, SUPERHÉROES Y CIENCIA FICCIÓN' },
  { id: 'v46', text: 'Imperial Fighter', textEs: 'Caza Imperial', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'PEOPLE, SUPERHEROS & SCI-FI', categoryEs: 'GENTE, SUPERHÉROES Y CIENCIA FICCIÓN' },
  { id: 'v47', text: 'Wolverine', textEs: 'Wolverine', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'PEOPLE, SUPERHEROS & SCI-FI', categoryEs: 'GENTE, SUPERHÉROES Y CIENCIA FICCIÓN' },
  { id: 'v48', text: 'Captain America (x2)', textEs: 'Capitán América (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'PEOPLE, SUPERHEROS & SCI-FI', categoryEs: 'GENTE, SUPERHÉROES Y CIENCIA FICCIÓN' },
  { id: 'v49', text: 'Batman', textEs: 'Batman', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'PEOPLE, SUPERHEROS & SCI-FI', categoryEs: 'GENTE, SUPERHÉROES Y CIENCIA FICCIÓN' },
  { id: 'v50', text: 'Legolas', textEs: 'Legolas', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'PEOPLE, SUPERHEROS & SCI-FI', categoryEs: 'GENTE, SUPERHÉROES Y CIENCIA FICCIÓN' },
  { id: 'v51', text: 'Darth Vader & Luke Skywalker', textEs: 'Darth Vader y Luke Skywalker', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'PEOPLE, SUPERHEROS & SCI-FI', categoryEs: 'GENTE, SUPERHÉROES Y CIENCIA FICCIÓN' },
  { id: 'v52', text: 'Nude Sun Bathers (x4)', textEs: 'Bañistas Desnudos (x4)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'PEOPLE, SUPERHEROS & SCI-FI', categoryEs: 'GENTE, SUPERHÉROES Y CIENCIA FICCIÓN' },
  { id: 'v53', text: 'Peeping Brad', textEs: 'Brad el Mirón', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'PEOPLE, SUPERHEROS & SCI-FI', categoryEs: 'GENTE, SUPERHÉROES Y CIENCIA FICCIÓN' },
  { id: 'v54', text: 'Waldo (x2)', textEs: 'Waldo (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'PEOPLE, SUPERHEROS & SCI-FI', categoryEs: 'GENTE, SUPERHÉROES Y CIENCIA FICCIÓN' },

  // ANIMALS
  { id: 'v55', text: 'Raccoons (x2)', textEs: 'Mapaches (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v56', text: 'Gorilla (x2)', textEs: 'Gorila (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v57', text: 'Orangutan', textEs: 'Orangután', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v58', text: 'Grizzly Bear (x2)', textEs: 'Oso Grizzly (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v59', text: 'Turkey (x2)', textEs: 'Pavo (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v60', text: 'Polar Bear', textEs: 'Oso Polar', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v61', text: 'Bald Eagle (x3)', textEs: 'Águila Calva (x3)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v62', text: 'Camel', textEs: 'Camello', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v63', text: 'Rhino', textEs: 'Rinoceronte', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v64', text: 'White Wolf', textEs: 'Lobo Blanco', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v65', text: 'Fox', textEs: 'Zorro', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v66', text: 'Black Panther', textEs: 'Pantera Negra', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v67', text: 'Defecating Dog', textEs: 'Perro Defecando', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
  { id: 'v68', text: 'Monkey (x2)', textEs: 'Mono (x2)', type: 'CHECKBOX', huntType: 'VILLAGE', category: 'ANIMALS', categoryEs: 'ANIMALES' },
];

const INITIAL_POLLS: Poll[] = [
  {
    id: 'p1',
    question: 'The "Die Hard" Dilemma: Is Die Hard actually a Christmas movie?',
    questionEs: 'El dilema de "Die Hard": ¿Es realmente una película de Navidad?',
    type: 'MULTIPLE_CHOICE',
    isActive: true,
    answers: {},
    options: [
      { id: 'p1_a', text: 'Yes, 100%. It happens on Christmas Eve!', textEs: 'Sí, 100%. ¡Ocurre en Nochebuena!' },
      { id: 'p1_b', text: 'No, it is an action movie that happens to take place in December.', textEs: 'No, es una película de acción que sucede en diciembre.' },
      { id: 'p1_c', text: 'It’s a movie I watch at Christmas, but not a "Christmas Movie."', textEs: 'Es una película que veo en Navidad, pero no es "de Navidad".' }
    ]
  },
  {
    id: 'p2',
    question: 'The Music Timeline: When is it socially acceptable to start playing Christmas music?',
    questionEs: 'La línea de tiempo musical: ¿Cuándo es socialmente aceptable poner música navideña?',
    type: 'MULTIPLE_CHOICE',
    isActive: true,
    answers: {},
    options: [
      { id: 'p2_a', text: 'As soon as Halloween ends (Nov 1st).', textEs: 'En cuanto termina Halloween (1 nov).' },
      { id: 'p2_b', text: 'Not until after Thanksgiving.', textEs: 'No hasta después de Acción de Gracias.' },
      { id: 'p2_c', text: 'December 1st strictly.', textEs: 'Estrictamente el 1 de diciembre.' },
      { id: 'p2_d', text: 'Only the week of Christmas.', textEs: 'Solo la semana de Navidad.' }
    ]
  },
  {
    id: 'p3',
    question: 'The Great Tree Debate: What is the superior Christmas Tree situation?',
    questionEs: 'El gran debate del árbol: ¿Cuál es la mejor situación?',
    type: 'MULTIPLE_CHOICE',
    isActive: true,
    answers: {},
    options: [
      { id: 'p3_a', text: 'Real tree (Need the smell!).', textEs: 'Árbol real (¡Necesito el olor!).' },
      { id: 'p3_b', text: 'Artificial tree (Need the convenience!).', textEs: 'Árbol artificial (¡Necesito la comodidad!).' },
      { id: 'p3_c', text: 'A small tabletop plant/Charlie Brown tree.', textEs: 'Una planta pequeña/Árbol tipo Charlie Brown.' },
      { id: 'p3_d', text: 'No tree for me.', textEs: 'Sin árbol para mí.' }
    ]
  },
  {
    id: 'p4',
    question: 'The Eggnog Stance: What are your feelings on Eggnog?',
    questionEs: 'La postura sobre el Ponche de Huevo: ¿Qué opinas?',
    type: 'MULTIPLE_CHOICE',
    isActive: true,
    answers: {},
    options: [
      { id: 'p4_a', text: 'I love it!', textEs: '¡Me encanta!' },
      { id: 'p4_b', text: 'Only if it\'s spiked with something strong.', textEs: 'Solo si tiene algo fuerte.' },
      { id: 'p4_c', text: 'Absolutely disgusting.', textEs: 'Absolutamente asqueroso.' },
      { id: 'p4_d', text: 'I’ve actually never tried it.', textEs: 'Nunca lo he probado.' }
    ]
  },
  {
    id: 'p5',
    question: 'Cookie Contenders: If you could only eat one holiday treat for the rest of your life, what would it be?',
    questionEs: 'Contendientes de galletas: Si solo pudieras comer un dulce navideño, ¿cuál sería?',
    type: 'MULTIPLE_CHOICE',
    isActive: true,
    answers: {},
    options: [
      { id: 'p5_a', text: 'Gingerbread Men.', textEs: 'Hombres de jengibre.' },
      { id: 'p5_b', text: 'Frosted Sugar Cookies.', textEs: 'Galletas de azúcar glaseadas.' },
      { id: 'p5_c', text: 'Peppermint Bark.', textEs: 'Corteza de menta.' },
      { id: 'p5_d', text: 'Fudge.', textEs: 'Fudge (Dulce de azúcar).' }
    ]
  },
  {
    id: 'p6',
    question: 'The Dinner Main Event: What is the centerpiece of the Christmas Dinner?',
    questionEs: 'El evento principal de la cena: ¿Cuál es el plato central?',
    type: 'MULTIPLE_CHOICE',
    isActive: true,
    answers: {},
    options: [
      { id: 'p6_a', text: 'Ham.', textEs: 'Jamón.' },
      { id: 'p6_b', text: 'Turkey (Round 2 after Thanksgiving).', textEs: 'Pavo (Ronda 2).' },
      { id: 'p6_c', text: 'Roast Beef / Prime Rib.', textEs: 'Rosbif / Costilla.' },
      { id: 'p6_d', text: 'Tamales / Lasagna / Something non-traditional.', textEs: 'Tamales / Lasaña / Algo no tradicional.' }
    ]
  },
  {
    id: 'p7',
    question: 'The Opening Ceremony: When does your family open the "Main" presents?',
    questionEs: 'La ceremonia de apertura: ¿Cuándo abren los regalos "principales"?',
    type: 'MULTIPLE_CHOICE',
    isActive: true,
    answers: {},
    options: [
      { id: 'p7_a', text: 'Christmas Eve.', textEs: 'Nochebuena.' },
      { id: 'p7_b', text: 'Christmas Morning.', textEs: 'Mañana de Navidad.' },
      { id: 'p7_c', text: 'We open one on Eve, the rest in the morning.', textEs: 'Uno en Nochebuena, el resto en la mañana.' },
      { id: 'p7_d', text: 'Whenever everyone finally wakes up/arrives.', textEs: 'Cuando todos despiertan/llegan.' }
    ]
  },
  {
    id: 'p8',
    question: 'The Lighting Aesthetic: When it comes to Christmas lights on the tree or house, which side are you on?',
    questionEs: 'Estética de iluminación: ¿Qué prefieres en luces?',
    type: 'MULTIPLE_CHOICE',
    isActive: true,
    answers: {},
    options: [
      { id: 'p8_a', text: 'Classic Warm White only (Keep it elegant).', textEs: 'Blanco cálido clásico (Elegante).' },
      { id: 'p8_b', text: 'Multi-Colored (Nostalgic and bright).', textEs: 'Multicolores (Nostálgico y brillante).' },
      { id: 'p8_c', text: 'Cool White / Blue LED (Icy winter vibes).', textEs: 'Blanco frío / LED azul (Invernal).' },
      { id: 'p8_d', text: 'Doesn\'t matter, as long as they are blinking/flashing.', textEs: 'No importa, mientras parpadeen.' }
    ]
  },
  {
    id: 'p9',
    question: 'Shopping Habits: What kind of holiday shopper are you?',
    questionEs: 'Hábitos de compra: ¿Qué tipo de comprador eres?',
    type: 'MULTIPLE_CHOICE',
    isActive: true,
    answers: {},
    options: [
      { id: 'p9_a', text: 'The Early Bird (Done by December 1st).', textEs: 'El madrugador (Listo el 1 de dic).' },
      { id: 'p9_b', text: 'The Steady Pacer (Buy a little bit each week).', textEs: 'El constante (Poco a poco).' },
      { id: 'p9_c', text: 'The Panic Buyer (Christmas Eve dash).', textEs: 'El comprador de pánico (Nochebuena).' },
      { id: 'p9_d', text: 'The Gift Card Giver (I avoid shopping entirely).', textEs: 'El de las tarjetas de regalo.' }
    ]
  },
  {
    id: 'p10',
    question: 'The Cleanup: When do the decorations come down?',
    questionEs: 'La limpieza: ¿Cuándo se quitan las decoraciones?',
    type: 'MULTIPLE_CHOICE',
    isActive: true,
    answers: {},
    options: [
      { id: 'p10_a', text: 'December 26th (It’s over immediately).', textEs: '26 de diciembre (Se acabó).' },
      { id: 'p10_b', text: 'New Year\'s Day.', textEs: 'Día de Año Nuevo.' },
      { id: 'p10_c', text: 'After the Epiphany (Jan 6th).', textEs: 'Después de Reyes (6 de enero).' },
      { id: 'p10_d', text: 'Sometime in February... or March.', textEs: 'En febrero... o marzo.' }
    ]
  }
];

const INITIAL_GAMES: Game[] = [
  { id: 'g1', title: 'Corn Hole Tournament', titleEs: 'Torneo de Corn Hole', type: 'TEAM', signups: [], results: [] },
  { id: 'g2', title: 'Beer Pong', titleEs: 'Beer Pong', type: 'TEAM', signups: [], results: [] },
  { id: 'g3', title: 'Connect Four', titleEs: 'Conecta Cuatro', type: 'TEAM', signups: [], results: [] },
  { id: 'g4', title: 'Jenga', titleEs: 'Jenga', type: 'TEAM', signups: [], results: [] }
];

const UI_TEXT = {
  en: {
    common: {
      title: "CHRISTMAS PARTY",
    },
    welcome: {
      title: "MERRY CHRISTMAS",
      subtitle: "Christmas Party 2025",
      nameLabel: "First and Last Name",
      placeholder: "Santa Claus",
      photoLabel: "Ugly Sweater Photo",
      tapToUpload: "Tap to upload",
      join: "Join Party"
    },
    nav: {
      HOME: 'Home',
      HUNT_VILLAGE: 'Village',
      HUNT_HOUSE: 'House',
      VOTING: 'Vote',
      GAMES: 'Games',
      PHOTOS: 'Photos',
      PROFILE: 'My Profile',
      ADMIN: 'Admin'
    },
    ar: {
      title: "Let it Snow!",
      instruction: "Point your camera at the Christmas Village",
      close: "Close AR"
    },
    surprise: {
      houseTitle: "UN-ELF-ING-BELIEVABLE!",
      houseMsg: "You found every hidden item! The elves are so impressed they stopped making toys just to slow clap. Don't tell Santa.",
      houseBtn: "I'm an Honorary Elf!",
      villageTitle: "YOU SLEIGH-ED IT!",
      villageMsg: "Holy jingle bells! You found everything. Santa's lawyers will be in touch about a job offer.",
      villageBtn: "I'm on the Nice List!",
      voteTitle: "ICE JOB!",
      voteMsg: "Thanks for partaking in the Christmas spirit! There's snow doubt your vote counts. You've helped us avoid a total meltdown!",
      voteBtn: "Stay Frosty"
    },
    home: {
      hello: 'Hello',
      welcomeMsg: 'Thank you for joining us in our annual Christmas party!',
      didYouKnow: 'Did you know?',
      partyTime: 'PARTY TIME',
      steps: [
        'Grab a drink',
        'Grab some food',
        'Do a scavenger hunt',
        'Play some games',
        'Snap a photo at the photobooth',
        'And most of all have a great time!'
      ],
      commentPlaceholder: 'Leave a note for the host...',
      send: 'Send',
      sent: 'Sent'
    },
    hunt: {
      villageTitle: 'Village Scavenger Hunt',
      houseTitle: 'House Scavenger Hunt',
      arButton: 'Try Village AR',
      complete: 'complete',
      tryAR: 'Try Village AR'
    },
    games: {
      title: 'Party Games',
      subtitle: 'Join the queue to play! Winner stays on.',
      currentMatch: 'Current Match',
      waiting: 'Waiting for players...',
      waitingChallenger: 'Waiting for challenger...',
      upNext: 'Up Next',
      queueEmpty: 'Queue is empty.',
      joinQueue: 'Join the Queue',
      teamName: 'Team Name (Optional)',
      addPartner: '+ Select Partner (Optional)',
      partnerPlaceholder: 'Select a player...',
      waitingPartner: 'Waiting for others to join...',
      signup: 'Sign Up',
      recentResults: 'History',
      tapWin: 'Tap if they won',
      won: 'Winner',
      leave: 'Leave',
      teams: 'Teams',
      winStreak: 'Win Streak',
      def: 'def.',
      addTeamName: 'Add Team Name'
    },
    voting: {
      title: 'Voting Station',
      tabSweater: 'Sweater Contest',
      tabPolls: 'Polls',
      vote: 'Vote for Me',
      voted: 'Voted',
      submitAnswer: 'Submit Answer',
      yourAnswer: 'Your answer:',
      liveResults: 'Live Results:',
      noVotes: 'No other votes yet.',
      me: 'Me',
      placeholder: "Type your answer..."
    },
    gallery: {
      title: 'Party Photos',
      download: 'Download'
    },
    profile: {
      yourName: 'Your Name',
      tapEdit: 'Tap name to edit',
      futureTitle: 'Future Parties?',
      futureDesc: 'Want to join us for future parties? Leave your details!',
      phone: 'Phone Number',
      email: 'Email',
      submit: 'Submit Info',
      received: 'Received! See you next time!',
      pollResults: 'Your Poll Results',
      noPolls: 'You haven\'t answered any polls yet.',
      sweaterVote: 'Ugly Sweater Vote Cast',
      notVoted: 'Not Voted Yet',
      language: 'Language',
      villageHunt: 'Village Hunt',
      houseHunt: 'Búsqueda Casa',
      admin: 'Admin Access'
    }
  },
  es: {
    common: {
      title: "FIESTA DE NAVIDAD",
    },
    welcome: {
      title: "FELIZ NAVIDAD",
      subtitle: "Fiesta de Navidad 2025",
      nameLabel: "Nombre y Apellido",
      placeholder: "Papá Noel",
      photoLabel: "Foto de Suéter Feo",
      tapToUpload: "Toca para subir",
      join: "Unirse a la Fiesta"
    },
    nav: {
      HOME: 'Inicio',
      HUNT_VILLAGE: 'Villa',
      HUNT_HOUSE: 'Casa',
      VOTING: 'Votar',
      GAMES: 'Juegos',
      PHOTOS: 'Fotos',
      PROFILE: 'Mi Perfil',
      ADMIN: 'Admin'
    },
    ar: {
      title: "¡Que Nieve!",
      instruction: "Apunta tu cámara a la Villa Navideña",
      close: "Cerrar RA"
    },
    surprise: {
      houseTitle: "¡INCREÍBLE!",
      houseMsg: "¡Encontraste todos los objetos! Los elfos están tan impresionados que dejaron de hacer juguetes para aplaudir. No le digas a Santa.",
      houseBtn: "¡Soy un Elfo Honorario!",
      villageTitle: "¡LO LOGRASTE!",
      villageMsg: "¡Santas pascuas! Encontraste todo. Los abogados de Santa te contactarán para una oferta de trabajo.",
      villageBtn: "¡Estoy en la Lista Buena!",
      voteTitle: "¡BUEN TRABAJO!",
      voteMsg: "¡Gracias por participar en el espíritu navideño! Sin duda tu voto cuenta. ¡Nos has salvado!",
      voteBtn: "Genial"
    },
    home: {
      hello: 'Hola',
      welcomeMsg: '¡Gracias por acompañarnos en nuestra fiesta anual de Navidad!',
      didYouKnow: '¿Sabías que?',
      partyTime: 'HORA DE FIESTA',
      steps: [
        'Toma una bebida',
        'Come algo',
        'Haz una búsqueda del tesoro',
        'Juega algunos juegos',
        'Toma una foto en la cabina',
        '¡Y sobre todo diviértete!'
      ],
      commentPlaceholder: 'Deja una nota para el anfitrión...',
      send: 'Enviar',
      sent: 'Enviado'
    },
    hunt: {
      villageTitle: 'Búsqueda del Tesoro en la Villa',
      houseTitle: 'Búsqueda del Tesoro en la Casa',
      arButton: 'Prueba RA de Villa',
      complete: 'completo',
      tryAR: 'Prueba RA'
    },
    games: {
      title: 'Juegos de Fiesta',
      subtitle: '¡Únete a la cola para jugar! El ganador se queda.',
      currentMatch: 'Partido Actual',
      waiting: 'Esperando jugadores...',
      waitingChallenger: 'Esperando retador...',
      upNext: 'Siguiente',
      queueEmpty: 'La cola está vacía.',
      joinQueue: 'Unirse a la Cola',
      teamName: 'Nombre del Equipo (Opcional)',
      addPartner: '+ Seleccionar Compañero (Opcional)',
      partnerPlaceholder: 'Elige un jugador...',
      waitingPartner: 'Esperando a que otros se unan...',
      signup: 'Inscribirse',
      recentResults: 'Historial',
      tapWin: 'Toca si ganaron',
      won: 'Ganador',
      leave: 'Salir',
      teams: 'Equipos',
      winStreak: 'Racha',
      def: 'venció a',
      addTeamName: 'Añadir Nombre Equipo'
    },
    voting: {
      title: 'Estación de Votación',
      tabSweater: 'Concurso de Suéteres',
      tabPolls: 'Encuestas',
      vote: 'Vótame',
      voted: 'Votado',
      submitAnswer: 'Enviar Respuesta',
      yourAnswer: 'Tu respuesta:',
      liveResults: 'Resultados en vivo:',
      noVotes: 'No hay votos aún.',
      me: 'Yo',
      placeholder: "Escribe tu respuesta..."
    },
    gallery: {
      title: 'Fotos de la Fiesta',
      download: 'Descargar'
    },
    profile: {
      yourName: 'Tu Nombre',
      tapEdit: 'Toca el nombre para editar',
      futureTitle: '¿Futuras Fiestas?',
      futureDesc: '¿Quieres unirte a futuras fiestas? ¡Deja tus datos!',
      phone: 'Número de Teléfono',
      email: 'Correo Electrónico',
      submit: 'Enviar Info',
      received: '¡Recibido! ¡Hasta la próxima!',
      pollResults: 'Tus Resultados de Encuestas',
      noPolls: 'Aún no has respondido ninguna encuesta.',
      sweaterVote: 'Voto de Suéter Feo',
      notVoted: 'Aún no has votado',
      language: 'Idioma',
      villageHunt: 'Búsqueda Villa',
      houseHunt: 'Búsqueda Casa',
      admin: 'Acceso Admin'
    }
  }
};

// --- Sub Components ---

const VillageAR = ({ onClose, lang }: { onClose: () => void, lang: 'en' | 'es' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = UI_TEXT[lang].ar;

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please ensure permissions are granted.");
        onClose();
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const snowflakes: {x: number, y: number, r: number, d: number}[] = [];
    for (let i = 0; i < 100; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 4 + 1,
        d: Math.random() * 100
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      for (let i = 0; i < 100; i++) {
        const f = snowflakes[i];
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      update();
      animationFrameId = requestAnimationFrame(draw);
    };

    let angle = 0;
    const update = () => {
      angle += 0.01;
      for (let i = 0; i < 100; i++) {
        const f = snowflakes[i];
        f.y += Math.pow(f.d, 2) + 1;
        f.x += Math.sin(angle) * 2;

        if (f.y > height) {
          snowflakes[i] = { x: Math.random() * width, y: 0, r: f.r, d: f.d };
        }
      }
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      <div className="absolute bottom-10 left-0 right-0 z-10 flex flex-col items-center gap-4 px-6 text-center">
         <div className="bg-black/50 text-white p-4 rounded-xl backdrop-blur-md border border-white/20">
            <h2 className="font-sweater text-2xl font-bold text-white">{t.title}</h2>
            <p className="text-sm">{t.instruction}</p>
         </div>
         <Button variant="danger" onClick={onClose} className="rounded-full px-8 font-bold shadow-lg bg-red-900 hover:bg-red-950 border-none text-white">
           {t.close}
         </Button>
      </div>
    </div>
  );
};

const SantaSurprise = ({ type, onClose, lang }: { type: HuntType, onClose: () => void, lang: 'en' | 'es' }) => {
  const isHouse = type === 'HOUSE';
  const t = UI_TEXT[lang].surprise;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-white p-8 rounded-2xl text-center space-y-6 shadow-2xl border-4 ${isHouse ? 'border-green-500' : 'border-red-500'} max-w-sm relative overflow-hidden animate-in fade-in zoom-in duration-300`}>
         <div className="relative inline-block animate-bounce">
           {/* Emoji Santa or Elf */}
           <div className="text-[8rem] leading-none drop-shadow-md select-none">
             {isHouse ? '🧝' : '🎅'}
           </div>
           {/* Clear Thumbs Up Badge */}
           <div className="absolute -right-2 bottom-2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100 text-3xl">
             👍
           </div>
         </div>
         
         <h2 className={`font-knitted text-4xl font-bold ${isHouse ? 'text-red-600' : 'text-green-600'} leading-tight`}>
           {isHouse ? t.houseTitle : t.villageTitle}
         </h2>
         <p className="text-xl font-bold text-gray-800">
           {isHouse 
             ? t.houseMsg
             : t.villageMsg
           }
         </p>
         <Button onClick={onClose} className={`w-full ${isHouse ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-knitted text-xl animate-pulse`}>
           {isHouse ? t.houseBtn : t.villageBtn}
         </Button>
      </div>
    </div>
  );
};

const WelcomeScreen = ({ onJoin }: { onJoin: (name: string, photo: string, lang: 'en' | 'es') => void }) => {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'es'>('en');

  const text = UI_TEXT[lang].welcome;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLoading(true);
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setPhoto(base64);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center space-y-6 max-w-xl mx-auto relative pt-[env(safe-area-inset-top)]">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 flex bg-gray-100 rounded-lg p-1 shadow-sm z-10">
        <button
          onClick={() => setLang('en')}
          className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${lang === 'en' ? 'bg-white text-red-700 shadow' : 'text-gray-400 hover:text-gray-600'}`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('es')}
          className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${lang === 'es' ? 'bg-white text-red-700 shadow' : 'text-gray-400 hover:text-gray-600'}`}
        >
          ES
        </button>
      </div>

      <div className="flex flex-row items-center justify-center gap-3 w-full pt-8 pb-4">
        <img 
            src={LOGO_URL} 
            alt="Logo" 
            className="w-24 h-24 object-contain" 
        />
        <div className="flex flex-col items-start text-left">
            <h1 className="font-sweater text-5xl md:text-6xl text-red-700 leading-none mb-2 mt-4">
              MERRY<br/>CHRISTMAS
            </h1>
            <h2 className="font-sweater text-lg text-green-800 leading-none">
              Christmas Party 2025
            </h2>
        </div>
      </div>
      
      <Card className="w-full space-y-4 border-2 border-green-100 p-5">
        <div className="space-y-2">
          <label className="block text-2xl font-bold font-knitted text-green-800 tracking-wide">{text.nameLabel}</label>
          <Input 
            value={name} 
            onChange={(e) => {
              const val = e.target.value;
              const capitalized = val.replace(/\b\w/g, c => c.toUpperCase());
              setName(capitalized);
            }} 
            placeholder={text.placeholder}
            className="py-2 text-lg"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-2xl font-bold font-knitted text-green-800 tracking-wide mb-0">{text.photoLabel}</label>
          <p className="text-sm text-gray-500 font-medium italic pb-2">(ugly sweater is not required)</p>
          <div className="relative mx-auto h-36 w-36 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden border-4 border-dashed border-green-300 shadow-inner">
            {photo ? (
              <img src={photo} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <IconCamera className="w-8 h-8 mb-1" />
                <span className="text-xs">{text.tapToUpload}</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFile} 
              className="absolute inset-0 opacity-0 cursor-pointer h-full w-full" 
            />
          </div>
        </div>

        <Button 
          onClick={() => photo && name && onJoin(name, photo, lang)}
          disabled={!name || !photo || loading}
          className="w-full font-knitted text-xl py-3 bg-red-600 hover:bg-red-700 mt-2"
        >
          {text.join}
        </Button>
      </Card>
    </div>
  );
};

const HomeScreen = ({ 
  user, 
  onUpdateUser, 
  onProfileClick,
  onAdminClick
}: { 
  user: User; 
  onUpdateUser: (u: User) => void; 
  onProfileClick: () => void;
  onAdminClick: () => void;
}) => {
  const [factIndex, setFactIndex] = useState(0);
  const [sent, setSent] = useState(false);
  const [commentText, setCommentText] = useState('');
  const t = UI_TEXT[user.language].home;
  
  const facts = user.language === 'es' ? CHRISTMAS_FACTS_ES : CHRISTMAS_FACTS_EN;

  useEffect(() => {
    setFactIndex(Math.floor(Math.random() * facts.length));
  }, [user.language]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex(Math.floor(Math.random() * facts.length));
    }, 10000);
    return () => clearInterval(timer);
  }, [facts.length]);

  useEffect(() => {
    if (sent && commentText) {
      setSent(false);
    }
  }, [commentText, sent]);

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const newEntry = `[${timestamp}] ${commentText}`;
    const previousComments = user.hostComment || '';
    const updatedComments = previousComments ? `${previousComments}\n\n${newEntry}` : newEntry;

    onUpdateUser({ ...user, hostComment: updatedComments });
    setCommentText('');
    setSent(true);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-3 shadow-sm">
         <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-3 items-center cursor-pointer" onClick={onProfileClick}>
                <button className="h-12 w-12 rounded-full overflow-hidden border-2 border-green-600 shadow-md active:scale-95 transition-transform">
                   <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                </button>
                <div>
                   <h2 className="text-xl font-sweater text-red-700 leading-none mb-0.5">{t.hello}, {user.name.split(' ')[0]}!</h2>
                   <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-wider">Christmas Party 2025</p>
                </div>
            </div>
             <button 
               onClick={onAdminClick} 
               className="p-2 text-gray-300 hover:text-red-500 active:text-red-700 transition-colors"
               aria-label="Admin Access"
             >
               <IconLock className="w-5 h-5" />
             </button>
         </div>
      </div>

      <div className="p-4 space-y-6">
        <Card className="bg-white border-2 border-gray-100 min-h-[120px] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gray-100 text-gray-400 text-[0.6rem] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-widest">Trivia</div>
          <p className="text-lg leading-snug font-serif italic text-gray-800 animate-in fade-in duration-500 px-2" key={factIndex}>
            "{facts[factIndex]}"
          </p>
        </Card>

        <div className="pb-4">
          <h3 className="font-sweater text-4xl font-bold mb-6 tracking-wide text-red-700 text-center transform -rotate-2">{t.partyTime}</h3>
          <ul className="space-y-4 font-sweater text-xl mb-8">
            {t.steps.map((step, idx) => (
              <li key={idx} className="flex items-center justify-center gap-3">
                {idx === t.steps.length - 1 ? (
                  <span className="font-bold text-red-600 bg-red-50 px-4 py-1 rounded-full transform rotate-1 shadow-sm">{step}</span>
                ) : (
                  <span className="text-gray-700">{step}</span>
                )}
              </li>
            ))}
          </ul>

          <div className="relative mt-8">
            <input 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t.commentPlaceholder}
              className="w-full pr-20 pl-4 py-3 bg-white text-black rounded-xl text-sm border-2 border-gray-200 focus:border-black transition-all shadow-sm placeholder:text-gray-400 text-base"
            />
            <button 
              onClick={handleSendComment}
              disabled={!commentText.trim()}
              className={`absolute right-1.5 top-1.5 bottom-1.5 text-xs font-bold px-4 rounded-md transition-all ${
                sent 
                  ? 'bg-green-600 text-white' 
                  : 'bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-300'
              }`}
            >
              {sent ? t.sent : t.send}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HuntScreen = ({ 
  type, 
  items, 
  user, 
  onUpdateProgress 
}: { 
  type: HuntType; 
  items: HuntItem[]; 
  user: User; 
  onUpdateProgress: (itemId: string, val: string | boolean) => void;
}) => {
  const [showSurprise, setShowSurprise] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const filteredItems = items.filter(i => i.huntType === type);
  const t = UI_TEXT[user.language].hunt;
  
  const completedCount = filteredItems.filter(i => {
    const val = user.huntProgress[i.id];
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return val.trim().length > 0;
    return false;
  }).length;
  
  const total = filteredItems.length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const prevProgressRef = useRef(progressPercent);

  useEffect(() => {
    if (prevProgressRef.current < 100 && progressPercent === 100) {
      setShowSurprise(true);
    }
    prevProgressRef.current = progressPercent;
  }, [progressPercent]);

  const groupedItems = filteredItems.reduce((acc, item) => {
    const cat = getLocText(item, 'category', user.language) || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, HuntItem[]>);

  const categories = Object.keys(groupedItems).sort();

  return (
    <div className="space-y-6 relative p-4">
      {showSurprise && <SantaSurprise type={type} onClose={() => setShowSurprise(false)} lang={user.language} />}
      {showAR && <VillageAR onClose={() => setShowAR(false)} lang={user.language} />}
      
      <div className="flex flex-col gap-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold font-sweater text-red-700 leading-none">
            {type === 'VILLAGE' ? t.villageTitle : t.houseTitle}
          </h2>
          {type === 'VILLAGE' && (
            <button 
              onClick={() => setShowAR(true)}
              className="flex items-center gap-2 bg-red-900 hover:bg-red-950 text-white px-3 py-1.5 rounded-full shadow-md active:scale-95 transition-transform z-10"
            >
              <IconSnow className="w-4 h-4" />
              <span className="text-[0.65rem] font-bold uppercase tracking-wide">{t.tryAR}</span>
            </button>
          )}
        </div>
        
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-green-500 h-full transition-all duration-500 ease-out flex items-center justify-center" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-end">
           <div className="font-bold text-gray-400 text-xs uppercase tracking-widest">
             {completedCount}/{total} {t.complete}
           </div>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat}>
             <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-2 pl-1">{cat}</h3>
             <div className="space-y-2">
               {groupedItems[cat].map(item => (
                 <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      {item.type === 'CHECKBOX' ? (
                        <button 
                          onClick={() => onUpdateProgress(item.id, !user.huntProgress[item.id])}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            user.huntProgress[item.id] ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'
                          }`}
                        >
                          {user.huntProgress[item.id] && <IconCheck className="w-4 h-4" />}
                        </button>
                      ) : (
                        <div className="w-6 h-6 text-red-600 flex items-center justify-center">
                          <IconGift className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-gray-800 ${user.huntProgress[item.id] === true ? 'line-through text-gray-400' : ''}`}>
                        {getLocText(item, 'text', user.language)}
                      </p>
                      {item.type === 'TEXT' && (
                        <Input 
                          className="mt-2"
                          placeholder="Your answer..."
                          value={(user.huntProgress[item.id] as string) || ''}
                          onChange={(e) => onUpdateProgress(item.id, e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GamesScreen = ({
  games,
  users,
  userId,
  onJoin,
  onLeave,
  onWin
}: {
  games: Game[];
  users: User[];
  userId: string;
  onJoin: (gameId: string, label: string, partnerId?: string) => void;
  onLeave: (gameId: string, signupId: string) => void;
  onWin: (gameId: string, winnerId: string) => void;
}) => {
  const [formStates, setFormStates] = useState<Record<string, { name: string, partnerId: string }>>({});
  const [partnerMode, setPartnerMode] = useState<Record<string, boolean>>({});
  const [customNameMode, setCustomNameMode] = useState<Record<string, boolean>>({});

  const currentUser = users.find(u => u.id === userId);
  const lang = currentUser?.language || 'en';
  const t = UI_TEXT[lang].games;

  const getFormState = (gameId: string) => formStates[gameId] || { name: '', partnerId: '' };
  
  const updateFormState = (gameId: string, field: 'name' | 'partnerId', value: string) => {
    setFormStates(prev => {
      const current = prev[gameId] || { name: '', partnerId: '' };
      return {
        ...prev,
        [gameId]: {
          ...current,
          [field]: value
        }
      };
    });
  };

  const potentialPartners = users.filter(u => u.id !== userId);

  const renderPlayerIcons = (playerIds: string[]) => {
    return (
      <div className="flex -space-x-2 overflow-hidden mt-1">
        {playerIds.map(pid => {
          const player = users.find(u => u.id === pid);
          if (!player) return null;
          return (
            <div key={pid} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 overflow-hidden">
              <img src={player.photo} alt={player.name} className="h-full w-full object-cover" />
            </div>
          );
        })}
      </div>
    );
  };

  const getPlayerNames = (playerIds: string[]) => {
    return playerIds.map(pid => users.find(u => u.id === pid)?.name || 'Unknown').join(' & ');
  };

  return (
    <div className="space-y-8 p-4">
      <div className="text-center space-y-2 pt-2">
        <h2 className="text-4xl font-sweater font-bold text-red-700">{t.title}</h2>
        <p className="text-gray-500 font-medium">{t.subtitle}</p>
      </div>

      {games.map(game => {
        const currentMatch = game.signups.slice(0, 2);
        const queue = game.signups.slice(2);
        const form = getFormState(game.id);
        const isPartnerMode = partnerMode[game.id];
        const isCustomNameMode = customNameMode[game.id];
        
        return (
          <div key={game.id} className="space-y-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
               <h3 className="text-2xl font-bold font-knitted text-green-800">{getLocText(game, 'title', lang)}</h3>
               <IconGamepad className="w-6 h-6 text-red-500" />
            </div>

            <div className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-red-600 text-white text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md border-2 border-white">
                    {t.currentMatch}
                </div>
                
                <div className="flex flex-col gap-3 pt-4">
                    {currentMatch.length > 0 ? (
                        <div className={`relative flex flex-col bg-white border-2 rounded-xl overflow-hidden shadow-sm transition-all ${currentMatch[0].wins > 0 ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-200'}`}>
                            <div className="p-4 flex justify-between items-center">
                              <div className="flex flex-col">
                                  <span className="font-bold text-xl leading-none">{currentMatch[0].label}</span>
                                  <span className="text-xs text-gray-500 font-medium mt-1">{getPlayerNames(currentMatch[0].players)}</span>
                                  {renderPlayerIcons(currentMatch[0].players)}
                                  {currentMatch[0].wins > 0 && (
                                    <div className="text-xs text-yellow-600 font-bold flex items-center gap-1 mt-1.5 bg-yellow-100 w-fit px-2 py-0.5 rounded-full">
                                      <IconTrophy className="w-3 h-3 fill-current" /> 
                                      <span>{t.winStreak}: {currentMatch[0].wins}</span>
                                    </div>
                                  )}
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                <Button 
                                  onClick={() => onWin(game.id, currentMatch[0].id)}
                                  className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-700 text-white shadow-md active:scale-95"
                                >
                                  {t.tapWin}
                                </Button>
                              </div>
                            </div>
                            <div className="absolute top-2 right-2">
                                {currentMatch[0].players.includes(userId) && (
                                  <button onClick={() => onLeave(game.id, currentMatch[0].id)} className="text-gray-400 hover:text-red-500 font-bold p-1 rounded-full w-6 h-6 flex items-center justify-center bg-white/50">
                                    ✕
                                  </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 flex items-center justify-center text-sm text-gray-400 italic bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 h-[88px]">
                          {t.waiting}
                        </div>
                    )}

                    {currentMatch.length > 0 && (
                      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-200 text-gray-600 text-[0.65rem] font-bold px-2 py-0.5 rounded-full border-2 border-white z-10 shadow-sm">
                          VS
                      </div>
                    )}

                    {currentMatch.length > 1 ? (
                        <div className={`relative flex flex-col bg-white border-2 rounded-xl overflow-hidden shadow-sm transition-all ${currentMatch[1].wins > 0 ? 'border-yellow-400' : 'border-gray-200'}`}>
                            <div className="p-4 flex justify-between items-center">
                              <div className="flex flex-col">
                                  <span className="font-bold text-xl leading-none">{currentMatch[1].label}</span>
                                  <span className="text-xs text-gray-500 font-medium mt-1">{getPlayerNames(currentMatch[1].players)}</span>
                                  {renderPlayerIcons(currentMatch[1].players)}
                                  {currentMatch[1].wins > 0 && (
                                    <div className="text-xs text-yellow-600 font-bold flex items-center gap-1 mt-1">
                                      <IconTrophy className="w-4 h-4 fill-current" /> 
                                      <span>{t.winStreak}: {currentMatch[1].wins}</span>
                                    </div>
                                  )}
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                <Button 
                                  onClick={() => onWin(game.id, currentMatch[1].id)}
                                  className="px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-700 text-white shadow-md active:scale-95"
                                >
                                  {t.tapWin}
                                </Button>
                              </div>
                            </div>
                             <div className="absolute top-2 right-2">
                                {currentMatch[1].players.includes(userId) && (
                                  <button onClick={() => onLeave(game.id, currentMatch[1].id)} className="text-gray-400 hover:text-red-500 font-bold p-1 rounded-full w-6 h-6 flex items-center justify-center bg-white/50">
                                    ✕
                                  </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 flex items-center justify-center text-sm text-gray-400 italic bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 h-[88px]">
                          {t.waitingChallenger}
                        </div>
                    )}
                </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wide text-gray-400 mb-3 pl-1">{t.upNext}</h4>
              {queue.length === 0 ? (
                <p className="text-gray-400 italic text-sm bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200 text-center">{t.queueEmpty}</p>
              ) : (
                <div className="space-y-2">
                  {queue.map((s, idx) => (
                    <div key={s.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                       <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-300 w-5 text-center">#{idx + 1}</span>
                          <div>
                             <span className="font-medium block text-gray-800">{s.label}</span>
                             <span className="text-xs text-gray-500 font-medium">{getPlayerNames(s.players)}</span>
                          </div>
                       </div>
                       {s.players.includes(userId) && (
                         <button onClick={() => onLeave(game.id, s.id)} className="text-red-500 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded">{t.leave}</button>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
               <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <IconPlus className="w-4 h-4" /> {t.joinQueue}
                  </h4>
                  
                  <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                       <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                           <img src={currentUser?.photo} className="w-full h-full object-cover" alt="Me" />
                       </div>
                       <span className="font-bold text-sm">{currentUser?.name}</span>
                  </div>

                  {isPartnerMode ? (
                      <div className="animate-in fade-in slide-in-from-top-2">
                          <select 
                              className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white text-sm appearance-none mb-2"
                              value={form.partnerId}
                              onChange={(e) => updateFormState(game.id, 'partnerId', e.target.value)}
                          >
                              <option value="">{t.partnerPlaceholder}</option>
                              {potentialPartners.map(u => (
                                  <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                          </select>
                          <button 
                              onClick={() => setPartnerMode({...partnerMode, [game.id]: false})} 
                              className="text-xs text-red-500 font-bold"
                          >
                              Remove Partner
                          </button>
                      </div>
                  ) : (
                      <button 
                          onClick={() => setPartnerMode({...partnerMode, [game.id]: true})}
                          className="text-xs font-bold text-blue-600 flex items-center gap-1 pl-1 hover:underline"
                      >
                          {t.addPartner}
                      </button>
                  )}

                  {game.type === 'TEAM' && (
                    <div className="pt-1">
                      {isCustomNameMode ? (
                        <div className="animate-in fade-in">
                          <Input 
                            value={form.name}
                            onChange={(e) => updateFormState(game.id, 'name', e.target.value)}
                            placeholder={t.teamName}
                            className="text-sm mb-1"
                          />
                           <button 
                              onClick={() => {
                                updateFormState(game.id, 'name', '');
                                setCustomNameMode({...customNameMode, [game.id]: false});
                              }} 
                              className="text-xs text-gray-400 font-bold"
                          >
                              Use Default Name
                          </button>
                        </div>
                      ) : (
                         <button 
                            onClick={() => setCustomNameMode({...customNameMode, [game.id]: true})}
                            className="text-xs font-bold text-gray-400 flex items-center gap-1 pl-1 hover:text-gray-600"
                        >
                            + {t.addTeamName}
                        </button>
                      )}
                    </div>
                  )}

                  <Button 
                    className="w-full py-3 font-bold bg-black text-white hover:bg-gray-800 rounded-lg shadow-md active:scale-95"
                    onClick={() => {
                       onJoin(game.id, form.name, form.partnerId);
                       setFormStates(prev => ({ ...prev, [game.id]: { name: '', partnerId: '' } }));
                       setPartnerMode({...partnerMode, [game.id]: false});
                       setCustomNameMode({...customNameMode, [game.id]: false});
                    }}
                  >
                    {t.signup}
                  </Button>
               </div>
            </div>
            
            {game.results.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                 <h4 className="font-bold text-xs text-gray-400 uppercase mb-2 tracking-wider">{t.recentResults}</h4>
                 <div className="space-y-1">
                   {game.results.slice(0,3).map(r => (
                     <div key={r.id} className="text-xs flex justify-between items-center p-2 rounded bg-gray-50 text-gray-600">
                        <div className="flex items-center gap-2">
                           <IconTrophy className="w-3 h-3 text-yellow-500" />
                           <span className="font-bold text-gray-800">{r.winnerLabel}</span>
                        </div>
                        <div className="text-gray-500">
                           {t.def} <span className="font-medium">{r.loserLabel}</span>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const VotingScreen = ({ 
  polls, 
  users, 
  currentUser, 
  onVotePoll, 
  onVoteSweater 
}: { 
  polls: Poll[]; 
  users: User[]; 
  currentUser: User; 
  onVotePoll: (pollId: string, answer: string) => void; 
  onVoteSweater: (targetUserId: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<'SWEATER' | 'POLLS'>('SWEATER');
  const t = UI_TEXT[currentUser.language].voting;

  return (
    <div className="flex flex-col min-h-full">
       <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm text-center">
          <h2 className="text-3xl font-sweater font-bold text-red-700 leading-none">{t.title}</h2>
       </div>

       <div className="space-y-6 p-4">
           <div className="flex p-1.5 bg-gray-200/50 rounded-2xl">
              <button 
                onClick={() => setActiveTab('SWEATER')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'SWEATER' ? 'bg-white text-red-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
              >
                {t.tabSweater}
              </button>
              <button 
                onClick={() => setActiveTab('POLLS')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'POLLS' ? 'bg-white text-red-600 shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
              >
                {t.tabPolls}
              </button>
           </div>

           {activeTab === 'POLLS' && (
             <div className="space-y-6">
                {polls.map(poll => {
                  const hasVoted = poll.answers[currentUser.id];
                  const stats = hasVoted ? getPollStats(poll, currentUser.language) : null;

                  return (
                    <Card key={poll.id} className="space-y-4 border-t-4 border-t-red-500">
                       <h3 className="font-bold text-xl leading-tight text-gray-900">{getLocText(poll, 'question', currentUser.language)}</h3>
                       
                       {!hasVoted ? (
                         <div className="space-y-2">
                           {poll.type === 'MULTIPLE_CHOICE' && poll.options?.map(opt => (
                             <button 
                               key={opt.id}
                               onClick={() => onVotePoll(poll.id, opt.id)}
                               className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-black hover:bg-gray-50 transition-all font-medium text-sm"
                             >
                               {getLocText(opt, 'text', currentUser.language)}
                             </button>
                           ))}
                         </div>
                       ) : (
                         <div className="space-y-4 animate-in fade-in">
                            <div className="text-xs uppercase tracking-widest text-green-600 font-bold flex items-center gap-2 bg-green-50 w-fit px-2 py-1 rounded">
                              <IconCheck className="w-3 h-3" /> {t.voted}
                            </div>
                            <div className="space-y-3">
                            {stats && stats.map(stat => (
                              <div key={stat.id} className="space-y-1">
                                 <div className="flex justify-between text-sm">
                                    <span className="font-medium">{stat.label}</span>
                                    <span className="font-bold text-gray-500">{stat.pct}%</span>
                                 </div>
                                 <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-red-500 rounded-full" style={{ width: `${stat.pct}%` }} />
                                 </div>
                              </div>
                            ))}
                            </div>
                            {stats && stats.length === 0 && <div className="text-sm text-gray-400 italic">{t.noVotes}</div>}
                         </div>
                       )}
                    </Card>
                  );
                })}
             </div>
           )}

           {activeTab === 'SWEATER' && (
             <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                     <div className="relative h-14 w-14 flex-shrink-0">
                       <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center">
                          {u.photo ? (
                            <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <IconUser className="w-8 h-8 text-gray-300" />
                          )}
                       </div>
                       {currentUser.hasVotedForId === u.id && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
                            <IconCheck className="w-3 h-3" />
                          </div>
                       )}
                     </div>
                     
                     <div className="flex-1">
                        <span className="font-bold text-base block leading-tight text-gray-900">{u.name}</span>
                        {u.id === currentUser.id && <span className="text-xs text-gray-400 font-medium">({t.me})</span>}
                     </div>

                     <div className="flex-shrink-0">
                       {currentUser.hasVotedForId === u.id ? (
                         <span className="px-3 py-1.5 bg-green-100 text-green-800 font-bold rounded-lg text-xs border border-green-200">
                           {t.voted}
                         </span>
                       ) : (
                         u.id !== currentUser.id && (
                           <Button 
                             onClick={() => onVoteSweater(u.id)}
                             className="px-4 py-1.5 text-xs rounded-full whitespace-nowrap bg-black hover:bg-gray-800 text-white"
                           >
                             {t.vote}
                           </Button>
                         )
                       )}
                     </div>
                  </div>
                ))}
             </div>
           )}
       </div>
    </div>
  );
};

const PhotosScreen = ({ 
  photos, 
  onUpload,
  lang
}: { 
  photos: Photo[], 
  onUpload: (p: string, caption: string) => void,
  lang: 'en' | 'es'
}) => {
  const [uploading, setUploading] = useState(false);
  const t = UI_TEXT[lang].gallery;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      try {
        const files = Array.from(e.target.files);
        const processedImages = await Promise.all(files.map(file => fileToBase64(file)));
        processedImages.forEach(base64 => onUpload(base64, ''));
      } catch (err) {
        console.error(err);
        alert("Error uploading photos. Storage might be full.");
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-sweater font-bold text-red-700">{t.title}</h2>
        <label className="bg-black text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-gray-800 transition-colors shadow-md active:scale-95">
          <IconUpload className="w-3 h-3" />
          Upload
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            className="hidden" 
            onChange={handleFiles} 
            disabled={uploading} 
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {photos.map(p => (
          <div key={p.id} className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 relative group shadow-sm">
             <img src={p.url} className="w-full h-full object-cover" alt="Party" />
             <a 
               href={p.url} 
               download={`fruth-party-${p.id}.jpg`}
               className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full text-black opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
               title="Download"
             >
               <IconDownload className="w-4 h-4" />
             </a>
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-2 text-center text-gray-400 py-12 italic bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            No photos yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileScreen = ({ 
  user, 
  onUpdate, 
  onLogout,
  onAdminClick
}: { 
  user: User; 
  onUpdate: (u: User) => void; 
  onLogout: () => void;
  onAdminClick: () => void;
}) => {
  const t = UI_TEXT[user.language].profile;
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
       try {
         const base64 = await fileToBase64(e.target.files[0]);
         onUpdate({ ...user, photo: base64 });
       } catch (err) {
         console.error(err);
         alert("Failed to update photo");
       }
    }
  };

  const [formState, setFormState] = useState({
    phone: user.phone || '',
    email: user.email || ''
  });

  const [infoSent, setInfoSent] = useState(false);

  const handleSubmitInfo = () => {
    onUpdate({ ...user, phone: formState.phone, email: formState.email });
    setInfoSent(true);
    setTimeout(() => setInfoSent(false), 3000);
  };

  return (
    <div className="space-y-8 p-4">
      <div className="text-center space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-4">
        <div className="relative inline-block group">
           <label htmlFor="profile-upload" className="cursor-pointer block relative">
             <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-500 shadow-xl mx-auto bg-gray-50 flex items-center justify-center">
               {user.photo ? (
                 <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <IconUser className="w-16 h-16 text-gray-300" />
               )}
             </div>
             <div className="absolute bottom-0 right-0 bg-black text-white p-2.5 rounded-full shadow-lg hover:bg-gray-800 active:scale-95 transition-transform border-4 border-white">
               <IconCamera className="w-4 h-4" />
             </div>
             <input 
                id="profile-upload"
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                onChange={handlePhotoChange} 
             />
           </label>
        </div>
        
        {editing ? (
          <div className="flex gap-2 justify-center items-center">
            <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="max-w-[200px] text-center" />
            <Button onClick={() => {
              onUpdate({ ...user, name: tempName });
              setEditing(false);
            }} className="py-2 px-4 text-sm">Save</Button>
          </div>
        ) : (
           <div onClick={() => setEditing(true)} className="cursor-pointer hover:opacity-70 transition-opacity">
             <h2 className="text-3xl font-bold font-sweater text-gray-900">{user.name}</h2>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{t.tapEdit}</p>
           </div>
        )}
      </div>

      <Card>
        <h3 className="font-bold mb-4 text-lg">{t.futureTitle}</h3>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">{t.futureDesc}</p>
        <div className="space-y-3">
           <Input 
             label={t.phone}
             value={formState.phone} 
             onChange={(e) => setFormState({ ...formState, phone: e.target.value })} 
             placeholder="(555) 555-5555"
           />
           <Input 
             label={t.email}
             value={formState.email} 
             onChange={(e) => setFormState({ ...formState, email: e.target.value })} 
             placeholder="santa@northpole.com"
           />
           <Button 
             variant={infoSent ? "primary" : "outline"} 
             className={`w-full mt-2 transition-all ${infoSent ? 'bg-green-600 border-green-600 text-white' : ''}`}
             onClick={handleSubmitInfo}
           >
             {infoSent ? t.received : t.submit}
           </Button>
        </div>
      </Card>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-3">{t.language}</h3>
        <div className="flex gap-2">
           <button 
             onClick={() => onUpdate({...user, language: 'en'})}
             className={`flex-1 py-2 rounded-lg font-bold border-2 transition-colors ${user.language === 'en' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
           >
             English
           </button>
           <button 
             onClick={() => onUpdate({...user, language: 'es'})}
             className={`flex-1 py-2 rounded-lg font-bold border-2 transition-colors ${user.language === 'es' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
           >
             Español
           </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 pt-4">
        <Button variant="outline" onClick={onLogout} className="w-full text-red-600 border-red-100 hover:bg-red-50 font-bold">Log Out</Button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ 
  users, setUsers, 
  huntItems, setHuntItems, 
  polls, setPolls, 
  games, setGames, 
  photos, setPhotos,
  onExit 
}: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PROGRESS' | 'HUNTS' | 'POLLS' | 'GUESTBOOK'>('DASHBOARD');

  const [newItem, setNewItem] = useState({ text: '', category: '', type: 'VILLAGE' as HuntType });
  const [newPoll, setNewPoll] = useState({ question: '', type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'FILL_IN', optionsStr: '' });
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhoto, setNewUserPhoto] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase().trim() === 'kokomo') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleDownloadData = () => {
    const data = { users, polls, games, photos, huntItems };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fruth-party-data-${Date.now()}.json`;
    a.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = event.target?.result as string;
            const data = JSON.parse(json);
            
            if (window.confirm(`Found ${data.users?.length || 0} users. Merge into current session?`)) {
                // Merge Users
                if (Array.isArray(data.users)) {
                    setUsers((prev: User[]) => {
                        const map = new Map(prev.map(u => [u.id, u]));
                        data.users.forEach((u: User) => map.set(u.id, u)); // Overwrite or add
                        return Array.from(map.values());
                    });
                }
                
                // Merge Photos
                if (Array.isArray(data.photos)) {
                    setPhotos((prev: Photo[]) => {
                         const map = new Map(prev.map(p => [p.id, p]));
                         data.photos.forEach((p: Photo) => map.set(p.id, p));
                         return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
                    });
                }

                // Merge Polls (Answers)
                if (Array.isArray(data.polls)) {
                     setPolls((prev: Poll[]) => {
                        return prev.map(p => {
                            const importedPoll = data.polls.find((ip: Poll) => ip.id === p.id);
                            if (importedPoll) {
                                return { ...p, answers: { ...p.answers, ...importedPoll.answers } };
                            }
                            return p;
                        });
                     });
                }

                // Merge Games (Signups and Results)
                if (Array.isArray(data.games)) {
                    setGames((prev: Game[]) => {
                        return prev.map(g => {
                            const importedGame = data.games.find((ig: Game) => ig.id === g.id);
                            if (importedGame) {
                                // Merge signups unique by ID
                                const signupMap = new Map(g.signups.map(s => [s.id, s]));
                                importedGame.signups.forEach(s => signupMap.set(s.id, s));
                                
                                // Merge results unique by ID
                                const resultMap = new Map(g.results.map(r => [r.id, r]));
                                importedGame.results.forEach(r => resultMap.set(r.id, r));

                                return { 
                                    ...g, 
                                    signups: Array.from(signupMap.values()),
                                    results: Array.from(resultMap.values())
                                };
                            }
                            return g;
                        });
                    });
                }
                alert("Data merged successfully!");
            }
        } catch (err) {
            console.error(err);
            alert("Invalid data file.");
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleRestartParty = () => {
    const pwd = prompt("Enter password to restart party (this deletes all guests and data):");
    if (pwd && pwd.toLowerCase().trim() === 'kokomo') {
      if(window.confirm("Are you ABSOLUTELY sure? This deletes ALL users, photos, poll answers, and game history. It cannot be undone.")) {
        setUsers([]);
        setPhotos([]);
        setPolls((prev: Poll[]) => prev.map(p => ({ ...p, answers: {} })));
        setGames((prev: Game[]) => prev.map(g => ({ ...g, signups: [], results: [] })));
        setTimeout(() => alert("Party has been restarted! All data cleared."), 100);
      }
    } else if (pwd !== null) {
      alert("Incorrect password.");
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if(window.confirm(`Delete user ${userName}?`)) {
        setUsers((prev: User[]) => prev.filter(usr => usr.id !== userId));
    }
  };

  const handleAddItem = () => {
    if (!newItem.text || !newItem.category) return;
    const item: HuntItem = {
      id: `h_${Date.now()}`,
      text: newItem.text,
      type: 'CHECKBOX',
      huntType: newItem.type,
      category: newItem.category
    };
    setHuntItems((prev: HuntItem[]) => [...prev, item]);
    setNewItem({ ...newItem, text: '' });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this item?')) {
      setHuntItems((prev: HuntItem[]) => prev.filter(i => i.id !== id));
    }
  };

  const handleAddPoll = () => {
    if (!newPoll.question) return;
    const options: PollOption[] = newPoll.type === 'MULTIPLE_CHOICE' 
      ? newPoll.optionsStr.split(',').map((s, i) => ({ id: `opt_${Date.now()}_${i}`, text: s.trim() })).filter(o => o.text)
      : [];

    const poll: Poll = {
      id: `p_${Date.now()}`,
      question: newPoll.question,
      type: newPoll.type,
      isActive: true,
      answers: {},
      options: options.length > 0 ? options : undefined
    };
    
    setPolls((prev: Poll[]) => [...prev, poll]);
    setNewPoll({ question: '', type: 'MULTIPLE_CHOICE', optionsStr: '' });
  };

  const handleDeletePoll = (id: string) => {
    if (confirm('Delete this poll?')) {
      setPolls((prev: Poll[]) => prev.filter(p => p.id !== id));
    }
  };

  const getProgress = (u: User, type: HuntType) => {
    if (!u.huntProgress) return 0;
    const typeItems = huntItems.filter((i: HuntItem) => i.huntType === type);
    if (typeItems.length === 0) return 0;
    const completed = typeItems.filter((i: HuntItem) => {
        const val = u.huntProgress?.[i.id];
        return val === true || (typeof val === 'string' && val.length > 0);
    }).length;
    return Math.round((completed / typeItems.length) * 100);
  };
  
  const handleNewUserPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files?.[0]) {
       try {
         const base64 = await fileToBase64(e.target.files[0]);
         setNewUserPhoto(base64);
       } catch (err) {
         console.error(err);
         alert("Error processing photo");
       }
     }
  };

  const handleAddUser = () => {
      if (!newUserName) {
          alert("Name is required");
          return;
      }
      const initialProgress: Record<string, boolean | string> = {};
      if (huntItems && huntItems.length > 0) {
        huntItems.forEach((item: HuntItem) => {
            initialProgress[item.id] = false;
        });
      }

      const newUser: User = {
        id: `u_${Date.now()}`,
        name: newUserName,
        photo: newUserPhoto || '',
        email: '',
        phone: '',
        hostComment: '',
        votesReceived: 0,
        hasVotedForId: null,
        huntProgress: initialProgress,
        timestamp: Date.now(),
        language: 'en'
      };

      setUsers((prev: User[]) => [...prev, newUser]);
      setNewUserName('');
      setNewUserPhoto(null);
  };

  const sweaterRanking = [...users].sort((a: User, b: User) => b.votesReceived - a.votesReceived);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-8 bg-white animate-in fade-in duration-500">
        <div className="flex flex-col items-center space-y-4">
           <div className="p-4 bg-red-50 rounded-full">
             <IconLock className="w-12 h-12 text-red-600" />
           </div>
           <h2 className="text-4xl font-bold font-sweater text-red-700 tracking-wide text-center">ADMIN<br/>ACCESS</h2>
        </div>
        
        <Card className="w-full max-w-sm border-green-100 shadow-xl">
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">Password</label>
                    <Input 
                        type="password" 
                        placeholder="Enter password..." 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="text-center font-bold text-lg tracking-widest"
                    />
                </div>
                <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 py-3 font-bold shadow-lg">
                    Unlock Dashboard
                </Button>
            </form>
        </Card>
        
        <button onClick={onExit} className="text-gray-400 text-sm font-bold hover:text-gray-600">
            ← Return to Party
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
       <div className="flex justify-between items-center border-b border-gray-200 pb-4 pt-2">
          <div>
            <h2 className="font-bold text-2xl font-sweater text-red-700">Admin Dashboard</h2>
            <div className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full inline-block font-bold mt-1">
               Local Storage Mode (Offline)
            </div>
          </div>
          <Button onClick={onExit} variant="outline" className="text-xs py-1 px-3 font-bold">Exit</Button>
       </div>

       <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
         {['DASHBOARD', 'PROGRESS', 'HUNTS', 'POLLS', 'GUESTBOOK'].map((t) => (
           <button 
             key={t}
             onClick={() => setActiveTab(t as any)}
             className={`px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${activeTab === t ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}
           >
             {t}
           </button>
         ))}
       </div>

       {activeTab === 'DASHBOARD' && (
         <div className="space-y-6 animate-in fade-in">
            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 mb-4 border border-blue-100">
               <strong>Syncing Data:</strong> Since this app runs offline, guests must "Export" their data and send the file to you. Use "Import" below to merge their data into your dashboard.
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-800 text-lg">{users.length}</h3>
                    <p className="text-xs text-blue-600 uppercase font-bold">Users</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h3 className="font-bold text-purple-800 text-lg">{photos.length}</h3>
                    <p className="text-xs text-purple-600 uppercase font-bold">Photos</p>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs border-b border-gray-100 pb-2">Ugly Sweater Contest</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                {sweaterRanking.map((u: User, idx: number) => (
                    <div key={u.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200 text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className={`font-bold w-6 text-center ${idx === 0 ? 'text-yellow-500 text-lg' : 'text-gray-400'}`}>
                                {idx + 1}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                                {u.photo ? <img src={u.photo} className="w-full h-full object-cover" /> : <IconUser className="p-1" />}
                            </div>
                            <span className="font-medium truncate max-w-[120px]">{u.name}</span>
                        </div>
                        <div className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                            {u.votesReceived} votes
                        </div>
                    </div>
                ))}
                </div>
            </div>

            <div className="space-y-3">
                 <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs border-b border-gray-100 pb-2">Manage Games</h3>
                 <div className="space-y-2">
                    {games.map((g: Game) => (
                        <div key={g.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium">{g.title}</span>
                            <div className="flex gap-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold text-gray-500">{g.signups.length} queue</span>
                                <button 
                                    onClick={() => {
                                        if(confirm(`Clear queue for ${g.title}?`)) {
                                            setGames((prev: Game[]) => prev.map(game => game.id === g.id ? { ...game, signups: [], results: [] } : game));
                                        }
                                    }}
                                    className="text-red-600 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>

            <div className="space-y-3">
                 <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs border-b border-gray-100 pb-2">Manage Users</h3>
                 
                 <Card className="bg-gray-50 border-gray-200 p-3 mb-4">
                    <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Add New User</h4>
                    <div className="flex items-center gap-2">
                        <label className="relative w-12 h-12 flex-shrink-0 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden hover:border-gray-400 transition-colors group">
                            {newUserPhoto ? (
                                <img src={newUserPhoto} className="w-full h-full object-cover" />
                            ) : (
                                <IconCamera className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleNewUserPhoto} />
                        </label>
                        <div className="flex-1 h-12">
                           <input
                             type="text"
                             placeholder="Name"
                             value={newUserName}
                             onChange={(e) => setNewUserName(e.target.value)}
                             className="w-full h-full px-3 rounded-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors bg-white text-sm font-medium"
                           />
                        </div>
                        <button 
                          type="button"
                          onClick={handleAddUser} 
                          disabled={!newUserName} 
                          className="h-12 px-5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
                        >
                          Add
                        </button>
                    </div>
                </Card>

                 <div className="max-h-60 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-1">
                    {users.map((u: User) => (
                        <div key={u.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded text-sm transition-colors border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 shadow-sm">
                                    {u.photo && <img src={u.photo} className="w-full h-full object-cover" />}
                                </div>
                                <span className="truncate max-w-[150px] font-medium text-gray-700">{u.name}</span>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(u.id, u.name);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors z-10"
                                title="Remove User"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                 </div>
            </div>
            
             <div className="pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                   <Button onClick={handleDownloadData} variant="secondary" className="flex-1 flex items-center justify-center gap-2 text-xs">
                       <IconDownload className="w-4 h-4" /> Export
                   </Button>
                   <label className="flex-1 flex items-center justify-center gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-md active:scale-95 transition-all">
                       <IconUpload className="w-4 h-4" /> Import / Merge
                       <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                   </label>
                   <Button variant="danger" className="flex-1 text-xs font-bold bg-red-600 hover:bg-red-700" onClick={handleRestartParty}>
                       Restart
                   </Button>
                </div>
            </div>
         </div>
       )}

       {activeTab === 'PROGRESS' && (
         <div className="space-y-4 animate-in fade-in">
           <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
             Tracking completion for {huntItems.filter((i: HuntItem) => i.huntType === 'VILLAGE').length} Village items and {huntItems.filter((i: HuntItem) => i.huntType === 'HOUSE').length} House items.
           </div>
           <div className="space-y-3">
             {users.map((u: User) => {
               const vProg = getProgress(u, 'VILLAGE');
               const hProg = getProgress(u, 'HOUSE');
               return (
                 <Card key={u.id} className="p-3">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                          {u.photo && <img src={u.photo} className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-bold text-sm">{u.name}</span>
                   </div>
                   <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Village Hunt</span>
                          <span className="font-bold">{vProg}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500" style={{ width: `${vProg}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>House Hunt</span>
                          <span className="font-bold">{hProg}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-red-500" style={{ width: `${hProg}%` }} />
                        </div>
                      </div>
                   </div>
                 </Card>
               );
             })}
           </div>
         </div>
       )}
       
       {activeTab === 'HUNTS' && (
         <div className="space-y-6 animate-in fade-in">
            <Card className="bg-gray-50 border-gray-200">
               <h3 className="font-bold text-sm mb-3">Add Scavenger Item</h3>
               <div className="space-y-3">
                  <Input 
                    placeholder="Item Name (e.g. Red Ornament)" 
                    value={newItem.text}
                    onChange={(e) => setNewItem({...newItem, text: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                       <Input 
                         placeholder="Category" 
                         value={newItem.category}
                         onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                       />
                    </div>
                    <select 
                      className="p-3 border-2 border-gray-200 rounded-lg bg-white text-sm"
                      value={newItem.type}
                      onChange={(e) => setNewItem({...newItem, type: e.target.value as HuntType})}
                    >
                      <option value="VILLAGE">Village</option>
                      <option value="HOUSE">House</option>
                    </select>
                  </div>
                  <Button onClick={handleAddItem} disabled={!newItem.text} className="w-full py-2">Add Item</Button>
               </div>
            </Card>

            <div className="space-y-4">
              {['VILLAGE', 'HOUSE'].map(type => (
                <div key={type}>
                   <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">{type} Items</h3>
                   <div className="space-y-1">
                      {huntItems.filter((i: HuntItem) => i.huntType === type).map((item: HuntItem) => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-2 border border-gray-100 rounded text-sm">
                           <div>
                             <span className="font-medium">{item.text}</span>
                             <span className="text-gray-400 text-xs ml-2">({item.category})</span>
                           </div>
                           <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
            </div>
         </div>
       )}

       {activeTab === 'POLLS' && (
         <div className="space-y-6 animate-in fade-in">
            <Card className="bg-gray-50 border-gray-200">
               <h3 className="font-bold text-sm mb-3">Add Poll</h3>
               <div className="space-y-3">
                  <TextArea 
                    placeholder="Question" 
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                  />
                  <select 
                    className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white text-sm"
                    value={newPoll.type}
                    onChange={(e) => setNewPoll({...newPoll, type: e.target.value as any})}
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="FILL_IN">Fill In The Blank</option>
                  </select>
                  
                  {newPoll.type === 'MULTIPLE_CHOICE' && (
                     <Input 
                       placeholder="Options (comma separated)" 
                       value={newPoll.optionsStr}
                       onChange={(e) => setNewPoll({...newPoll, optionsStr: e.target.value})}
                     />
                  )}
                  
                  <Button onClick={handleAddPoll} disabled={!newPoll.question} className="w-full py-2">Create Poll</Button>
               </div>
            </Card>

            <div className="space-y-2">
               {polls.map((p: Poll) => (
                 <div key={p.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-start">
                    <div className="flex-1">
                       <p className="font-bold text-sm">{p.question}</p>
                       <p className="text-xs text-gray-400 mt-1">{p.type === 'MULTIPLE_CHOICE' ? `${p.options?.length} Options` : 'Free Response'}</p>
                    </div>
                    <button onClick={() => handleDeletePoll(p.id)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                 </div>
               ))}
            </div>
         </div>
       )}
       
       {activeTab === 'GUESTBOOK' && (
            <div className="space-y-4 animate-in fade-in">
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 border border-gray-100">
                    Messages left by guests in the "Note for host" section.
                </div>
                
                {users.filter((u: User) => u.hostComment && u.hostComment.trim().length > 0).length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic">No guestbook entries yet.</div>
                ) : (
                    users.filter((u: User) => u.hostComment && u.hostComment.trim().length > 0).map((u: User) => (
                        <Card key={u.id} className="border-l-4 border-l-red-500">
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
                                     {u.photo ? <img src={u.photo} className="w-full h-full object-cover" /> : <IconUser className="p-2 text-gray-400" />}
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 block">{u.name}</span>
                                    <span className="text-xs text-gray-400">{new Date(u.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed italic">
                                "{u.hostComment}"
                            </p>
                        </Card>
                    ))
                )}
            </div>
       )}
    </div>
  );
};

export const App = () => {
  const [user, setUser] = useStickyState<User | null>('user', null);
  const [view, setView] = useStickyState<ViewState>('view_state', 'WELCOME');
  
  const [huntItems, setHuntItems] = useStickyState<HuntItem[]>('hunts', INITIAL_HUNTS);
  const [polls, setPolls] = useStickyState<Poll[]>('polls', INITIAL_POLLS);
  const [games, setGames] = useStickyState<Game[]>('games', INITIAL_GAMES);
  const [photos, setPhotos] = useStickyState<Photo[]>('photos', []);
  const [users, setUsers] = useStickyState<User[]>('users', []);

  useEffect(() => {
    if (user) {
      setUsers(prev => {
        const idx = prev.findIndex(u => u.id === user.id);
        if (idx >= 0) {
            // Simple deep equal check to prevent loop if object is new reference but same data
            if (JSON.stringify(prev[idx]) === JSON.stringify(user)) return prev;
            const newUsers = [...prev];
            newUsers[idx] = user;
            return newUsers;
        }
        return [...prev, user];
      });
    }
  }, [user, setUsers]);

  useEffect(() => {
    if (user && view === 'WELCOME') {
      setView('HOME');
    }
  }, [user, view, setView]);

  const navItems: { id: ViewState, icon: any, label: string }[] = [
    { id: 'HOME', icon: IconHome, label: UI_TEXT[user?.language || 'en'].nav.HOME },
    { id: 'HUNT_VILLAGE', icon: IconVillage, label: UI_TEXT[user?.language || 'en'].nav.HUNT_VILLAGE },
    { id: 'HUNT_HOUSE', icon: IconHouse, label: UI_TEXT[user?.language || 'en'].nav.HUNT_HOUSE },
    { id: 'GAMES', icon: IconGamepad, label: UI_TEXT[user?.language || 'en'].nav.GAMES },
    { id: 'VOTING', icon: IconVote, label: UI_TEXT[user?.language || 'en'].nav.VOTING },
    { id: 'PHOTOS', icon: IconCamera, label: UI_TEXT[user?.language || 'en'].nav.PHOTOS },
  ];

  if (!user) {
    return (
      <WelcomeScreen 
        onJoin={(name, photo, lang) => {
           const newUser: User = {
             id: Date.now().toString(),
             name,
             photo,
             email: '',
             phone: '',
             hostComment: '',
             votesReceived: 0,
             hasVotedForId: null,
             huntProgress: {},
             timestamp: Date.now(),
             language: lang
           };
           setUser(newUser);
           setView('HOME');
        }} 
      />
    );
  }

  return (
    // The outer div provides the white background for the status bar area
    <div 
      className="max-w-3xl mx-auto h-full bg-white flex flex-col font-sans text-gray-900 overflow-hidden relative shadow-2xl"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 25px)' }} 
    >
       {/* Content Area - Light gray background for contrast with cards */}
       <div className="flex-1 overflow-y-auto scroll-smooth bg-gray-50">
          <div className="min-h-full">
             {view === 'HOME' && (
                <HomeScreen 
                  user={user} 
                  onUpdateUser={setUser} 
                  onProfileClick={() => setView('PROFILE')}
                  onAdminClick={() => setView('ADMIN')}
                />
             )}
             
             {(view === 'HUNT_VILLAGE' || view === 'HUNT_HOUSE') && (
               <HuntScreen 
                 type={view === 'HUNT_VILLAGE' ? 'VILLAGE' : 'HOUSE'}
                 items={huntItems}
                 user={user}
                 onUpdateProgress={(itemId, val) => {
                   setUser(prev => prev ? ({
                     ...prev,
                     huntProgress: { ...prev.huntProgress, [itemId]: val }
                   }) : null);
                 }}
               />
             )}

             {view === 'GAMES' && (
                <GamesScreen 
                  games={games} 
                  users={users}
                  userId={user.id}
                  onJoin={(gameId, label, partnerId) => {
                     setGames(prev => prev.map(g => {
                       if (g.id !== gameId) return g;
                       const players = [user.id];
                       if (partnerId) players.push(partnerId);
                       
                       let finalLabel = label;
                       if (!finalLabel) {
                           finalLabel = user.name;
                           if (partnerId) {
                              const p = users.find(u => u.id === partnerId);
                              if (p) finalLabel += ` & ${p.name.split(' ')[0]}`;
                           }
                       }

                       return {
                         ...g,
                         signups: [
                           ...g.signups,
                           {
                             id: Date.now().toString(),
                             label: finalLabel,
                             captainId: user.id,
                             wins: 0,
                             players
                           }
                         ]
                       };
                     }));
                  }}
                  onLeave={(gameId, signupId) => {
                     setGames(prev => prev.map(g => {
                       if (g.id !== gameId) return g;
                       return {
                         ...g,
                         signups: g.signups.filter(s => s.id !== signupId)
                       };
                     }));
                  }}
                  onWin={(gameId, signupId) => {
                     setGames(prev => prev.map(g => {
                        if (g.id !== gameId) return g;
                        
                        const match = g.signups.slice(0, 2);
                        const winner = match.find(s => s.id === signupId);
                        const loser = match.find(s => s.id !== signupId);
                        
                        if (!winner) return g;

                        const result: GameResult = {
                            id: Date.now().toString(),
                            winnerLabel: winner.label,
                            loserLabel: loser ? loser.label : 'Unknown',
                            timestamp: Date.now()
                        };

                        const updatedWinner = { ...winner, wins: winner.wins + 1 };
                        const queue = g.signups.slice(2);

                        return {
                            ...g,
                            results: [result, ...g.results],
                            signups: [updatedWinner, ...queue]
                        };
                     }));
                  }}
                />
             )}

             {view === 'VOTING' && (
               <VotingScreen 
                  polls={polls}
                  users={users}
                  currentUser={user}
                  onVotePoll={(pollId, answerId) => {
                     setPolls(prev => prev.map(p => {
                        if (p.id !== pollId) return p;
                        return {
                          ...p,
                          answers: { ...p.answers, [user.id]: answerId }
                        };
                     }));
                  }}
                  onVoteSweater={(targetId) => {
                     const previousVoteId = user.hasVotedForId;
                     if (previousVoteId === targetId) return;

                     setUser(prev => prev ? ({ ...prev, hasVotedForId: targetId }) : null);
                     setUsers(prev => prev.map(u => {
                        if (u.id === user.id) return { ...u, hasVotedForId: targetId };
                        if (u.id === targetId) return { ...u, votesReceived: u.votesReceived + 1 };
                        if (previousVoteId && u.id === previousVoteId) return { ...u, votesReceived: Math.max(0, u.votesReceived - 1) };
                        return u;
                     }));
                  }}
               />
             )}

             {view === 'PHOTOS' && (
                <PhotosScreen 
                  photos={photos}
                  lang={user.language}
                  onUpload={(url, caption) => {
                     const newPhoto: Photo = {
                       id: Date.now().toString(),
                       url,
                       uploaderId: user.id,
                       caption,
                       timestamp: Date.now()
                     };
                     setPhotos(prev => [newPhoto, ...prev]);
                  }}
                />
             )}

             {view === 'PROFILE' && (
                <ProfileScreen 
                   user={user}
                   onUpdate={(u) => setUser(u)}
                   onLogout={() => {
                     if (confirm('Are you sure you want to log out?')) {
                       setUser(null);
                     }
                   }}
                   onAdminClick={() => setView('ADMIN')}
                />
             )}

             {view === 'ADMIN' && (
               <AdminDashboard 
                  users={users}
                  setUsers={setUsers}
                  huntItems={huntItems}
                  setHuntItems={setHuntItems}
                  polls={polls}
                  setPolls={setPolls}
                  games={games}
                  setGames={setGames}
                  photos={photos}
                  setPhotos={setPhotos}
                  onExit={() => setView('HOME')}
               />
             )}
          </div>
       </div>

       {/* Bottom Nav */}
       <div 
         className="bg-white border-t border-gray-200 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
         style={{ paddingTop: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex justify-between items-center p-2">
              {navItems.map(item => {
              const isActive = view === item.id;
              return (
                  <button 
                  key={item.id} 
                  onClick={() => setView(item.id)}
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all active:scale-95 ${isActive ? 'text-green-900' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                  <item.icon className={`w-8 h-8 ${isActive ? 'fill-current' : ''}`} />
                  <span className="text-[0.6rem] font-bold uppercase tracking-wide">{item.label}</span>
                  </button>
              );
              })}
          </div>
       </div>
    </div>
  );
};