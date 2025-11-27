
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, ViewState, HuntItem, Poll, Photo, Game } from './types';
import { IconHome, IconVillage, IconHouse, IconVote, IconCamera, IconLock, IconUpload, IconDownload, IconPlus, IconGamepad, IconTrophy, IconSnow } from './components/Icons';
import { Button, Input, Card } from './components/UI';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, increment, deleteDoc, addDoc, query, orderBy, writeBatch, getDoc, where, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import * as firebaseStorage from 'firebase/storage';
import JSZip from 'jszip';

const firebaseConfig = { apiKey: "AIzaSyCJ_qmMSCWyFgLAEWy9YDCGAb5m2YUwV28", authDomain: "christmas-test---fruthbetold.firebaseapp.com", projectId: "christmas-test---fruthbetold", storageBucket: "christmas-test---fruthbetold.firebasestorage.app", messagingSenderId: "965407401986", appId: "1:965407401986:web:29473e6de9aa3626de1f1b", measurementId: "G-L8VSZWKPLG" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = firebaseStorage.getStorage(app);
const LOGO_URL = "https://static.wixstatic.com/media/d8edc3_6b8535321c8d4e35aa4351da27493b19~mv2.png/v1/fill/w_506,h_506,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/FBT%20-5%20(1-24-25).png";

// --- DATA CONSTANTS ---

const CHRISTMAS_FACTS = {
  en: [
    "Jingle Bells was originally written for Thanksgiving.", "Santa has a postal code: H0H 0H0.", "Rudolph was a marketing gimmick created by Montgomery Ward.", 
    "Silent Night is the most recorded Christmas song.", "The Statue of Liberty was a Christmas gift to the US from France.", 
    "Alabama was the first state to recognize Christmas as a holiday.", "KFC is a massive Christmas tradition in Japan.", 
    "Spiders are considered good luck on trees in Ukraine.", "Candy canes were invented to quiet choirboys in church.", 
    "White Christmas by Bing Crosby is the best-selling single ever.", "The Grinch is the highest-grossing Christmas movie of all time.", 
    "Xmas dates back to the 1500s; X represents Chi (Christ).", "Eggnog started as 'posset' (ale and milk) in Britain.", 
    "Coca-Cola helped shape the modern image of Santa Claus.", "Iceland has 13 Yule Lads who visit before Christmas.", 
    "Franklin Pierce put the first tree in the White House in 1856.", "Tinsel was originally made of real silver.", 
    "The Beatles held the Christmas #1 spot for 3 years in a row.", "Giving presents comes from the Roman festival Saturnalia.", 
    "Poinsettias are native to Mexico and named after Joel Poinsett.", "Santa's sleigh would need to move at 650 miles per second.",
    "In Norway, people hide brooms so witches don't steal them.", "Artificial Christmas trees originated in Germany using dyed goose feathers.",
    "The Friday and Saturday before Christmas are the busiest shopping days.", "It takes about 15 years to grow an average-sized Christmas tree.",
    "Brenda Lee recorded 'Rockin' Around the Christmas Tree' when she was only 13.", "Carols were originally dances, not songs.",
    "Dutch children leave shoes out for Sinterklaas, not stockings.", "There are 364 gifts given in the '12 Days of Christmas'.",
    "In Germany, Poland, and Ukraine, finding a spider web on the tree is lucky.", "The first artificial tree brushes were made by a toilet brush company.",
    "Santa Claus is known as Pere Noel in France.", "Mistletoe literally translates to 'dung on a twig' (from birds).",
    "Washington Irving created the image of Santa flying in a sleigh.", "Rudolph's red nose would likely be a result of a parasitic infection.",
    "US scientists calculated that Santa visits 822 homes a second.", "Roast peacock was a popular medieval Christmas dinner.",
    "St. Stephen's Day (Boxing Day) is the day after Christmas.", "The Nutcracker was a flop when it first premiered in 1892.",
    "The term 'Boxing Day' comes from church poor boxes.", "Approximately 30-35 million real Christmas trees are sold in the US alone.",
    "Oklahoma was the last US state to declare Christmas a legal holiday (1907).", "In ancient times, mistletoe was considered a healing plant.",
    "Christmas wasn't declared a federal holiday in the US until 1870.", "Los renos machos pierden sus cuernos en invierno; los de Santa son hembras.",
    "A 'Yule Log' is actually a giant log burned during the 12 days of Christmas.", "The first gingerbread man is credited to Queen Elizabeth I.",
    "Deck the Halls dates back to the 16th century.", "Paul McCartney earns about $400k a year from 'Wonderful Christmastime'.",
    "Gold, Frankincense, and Myrrh were standard gifts for kings.", "The poinsettia market is worth about $250 million."
  ],
  es: [
    "Jingle Bells fue escrito originalmente para Acción de Gracias.", "Santa tiene un código postal: H0H 0H0.", "Rudolph fue un truco de marketing de Montgomery Ward.", 
    "Noche de Paz es la canción navideña más grabada.", "La Estatua de la Libertad fue un regalo de Navidad de Francia.", 
    "Alabama fue el primer estado en reconocer la Navidad.", "KFC es una tradición navideña masiva en Japón.", 
    "Las arañas traen buena suerte en los árboles en Ucrania.", "Los bastones de caramelo se inventaron para calmar a los niños del coro.", 
    "White Christmas es el sencillo más vendido de la historia.", "El Grinch es la película navideña más taquillera.", 
    "El término Xmas data del siglo XVI; la X representa Chi (Cristo).", "El ponche de huevo comenzó como 'posset' en Gran Bretaña.", 
    "Coca-Cola ayudó a dar forma a la imagen moderna de Santa.", "Islandia tiene 13 Yule Lads que visitan antes de Navidad.", 
    "Franklin Pierce puso el primer árbol en la Casa Blanca en 1856.", "El espumillón estaba hecho originalmente de plata real.", 
    "Los Beatles mantuvieron el puesto #1 de Navidad durante 3 años.", "Dar regalos proviene del festival romano Saturnalia.", 
    "Las flores de Pascua son nativas de México.", "El trineo de Santa necesitaría moverse a 650 millas por segundo.",
    "En Noruega, esconden las escobas para que las brujas no las roben.", "Los árboles artificiales se originaron en Alemania usando plumas de ganso.",
    "El viernes y sábado antes de Navidad son los días de más compras.", "Se necesitan 15 años para cultivar un árbol de Navidad promedio.",
    "Brenda Lee grabó 'Rockin' Around the Christmas Tree' con solo 13 años.", "Los villancicos eran originalmente bailes, no canciones.",
    "Los niños holandeses dejan zapatos para Sinterklaas.", "Hay 364 regalos en los '12 Días de Navidad'.",
    "En Alemania y Polonia, encontrar una telaraña en el árbol es suerte.", "Los primeros árboles artificiales los hizo una empresa de escobillas de baño.",
    "Santa Claus es conocido como Pere Noel en Francia.", "Muérdago se traduce literalmente como 'estiércol en una ramita'.",
    "Washington Irving creó la imagen de Santa volando.", "La nariz roja de Rudolph sería resultado de una infección.",
    "Científicos calcularon que Santa visita 822 casas por segundo.", "El pavo real asado era una cena medieval popular.",
    "El Día de San Esteban es el día después de Navidad.", "El Cascanueces fue un fracaso cuando se estrenó en 1892.",
    "El término 'Boxing Day' proviene de las cajas de los pobres de la iglesia.", "Se venden 35 millones de árboles reales en EE.UU.",
    "Oklahoma fue el último estado en declarar la Navidad feriado (1907).", "En la antigüedad, el muérdago era una planta curativa.",
    "La Navidad no fue feriado federal en EE.UU. hasta 1870.", "Los renos machos pierden sus cuernos en invierno; los de Santa son hembras.",
    "Un 'Tronco de Navidad' se quema durante los 12 días.", "El primer hombre de jengibre se atribuye a la Reina Isabel I.",
    "Deck the Halls data del siglo XVI.", "Paul McCartney gana $400k al año con 'Wonderful Christmastime'.",
    "Oro, Incienso y Mirra eran regalos para reyes.", "El mercado de flores de Pascua vale $250 millones."
  ]
};

const GAME_RULES: Record<string, {en: string, es: string}> = {
  'Corn Hole': {
      en: "Teams take turns throwing bags at a raised platform with a hole in the far end. A bag in the hole scores 3 points, while one on the board scores 1 point. Play continues until a team or player reaches or exceeds the score of 21. \n\nCANCELLATION SCORING: The points of one player cancel out the points of their opponent. For example, if Team A scores 5 points and Team B scores 3 points in a round, Team A receives 2 points for that round and Team B receives 0.",
      es: "Los equipos lanzan bolsas a una plataforma con un agujero. Bolsa en el agujero = 3 puntos, en el tablero = 1 punto. Gana quien llegue a 21. \n\nPUNTUACIÓN DE CANCELACIÓN: Los puntos de un jugador cancelan los del oponente. Ejemplo: Si Equipo A anota 5 y Equipo B anota 3, Equipo A recibe 2 puntos y Equipo B recibe 0."
  },
  'Beer Pong': {
      en: "Players throw a ping pong ball across a table with the intent of landing the ball in a cup of beer on the other end. If a ball lands in a cup, the beer is consumed and the cup is removed. The first side to eliminate all of the opponent's cups wins. \n\nBOUNCE: A ball that bounces on the table before going into a cup counts as 2 cups. \n\nBALLS BACK: If both partners make their shots in the same turn, they get the balls back to shoot again. \n\nREBOUND: If a player catches a ball after it bounces off a cup (before it hits the floor), they get the behind-the-back shot. \n\nRE-RACKS: Each team gets 2 re-racks per game.",
      es: "Lanza una pelota de ping pong a los vasos del otro extremo. Si entra, se bebe y se quita el vaso. Gana quien elimine todos los vasos. \n\nREBOTE: Si rebota en la mesa y entra = 2 vasos. \n\nBOLAS DE VUELTA: Si ambos compañeros encestan en el mismo turno, tiran de nuevo. \n\nREBOTE EN EL AIRE: Si atrapas una bola que rebotó en un vaso (antes de tocar el suelo), tienes un tiro por la espalda. \n\nRE-ORGANIZAR: 2 veces por juego."
  },
  'Jenga': {
      en: "Players take turns removing one block at a time from a tower constructed of 54 blocks. Each block removed is then placed on top of the tower, creating a progressively more unstable structure. The loser is the person who causes the tower to topple.",
      es: "Los jugadores retiran un bloque a la vez de una torre de 54 bloques y lo colocan encima, haciendo la estructura inestable. Pierde quien derribe la torre."
  },
  'Connect 4': {
      en: "Be the first to form a horizontal, vertical, or diagonal line of four of one's own discs. Players take turns dropping colored discs from the top into a seven-column, six-row vertically suspended grid.",
      es: "Sé el primero en formar una línea horizontal, vertical o diagonal de cuatro fichas. Los jugadores se turnan para dejar caer fichas en la rejilla."
  }
};

const GAME_IMAGES: Record<string, string> = {
    'Corn Hole': 'https://www.cornholeboards.net/wp-content/uploads/2018/06/how-to-play-cornhole-1-on-1.png',
    'Beer Pong': 'https://manuals.plus/wp-content/uploads/2024/03/GoPong-8-Foot-Portable-Beer-Pong-Tailgate-Tables-fig-3.png',
    'Jenga': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDhLySnWrTp2CBqCKibLsze_YOYSlf58fEIA&s',
    'Connect 4': 'https://www.wikihow.com/images/thumb/7/70/Play-Connect-4-Step-4-Version-2.jpg/v4-460px-Play-Connect-4-Step-4-Version-2.jpg'
};

const TRADITIONAL_QUIZ = [
  {q:"Which country started the tradition of putting up a Christmas tree?", qEs:"¿Qué país inició la tradición del árbol de Navidad?", a:["Germany","USA","UK","France"], aEs:["Alemania","EE.UU.","Reino Unido","Francia"], c:0},
  {q:"What year was the first Christmas card sent?", qEs:"¿En qué año se envió la primera tarjeta de Navidad?", a:["1843","1901","1776","1920"], aEs:["1843","1901","1776","1920"], c:0},
  {q:"Who wrote 'A Christmas Carol'?", qEs:"¿Quién escribió 'Cuento de Navidad'?", a:["Charles Dickens","Mark Twain","Hans Christian Andersen","Dr. Seuss"], aEs:["Charles Dickens","Mark Twain","Hans Christian Andersen","Dr. Seuss"], c:0},
  {q:"What is the best-selling Christmas song of all time?", qEs:"¿Cuál es la canción navideña más vendida de todos los tiempos?", a:["White Christmas","All I Want for Christmas","Silent Night","Jingle Bells"], aEs:["White Christmas","All I Want for Christmas","Noche de Paz","Jingle Bells"], c:0},
  {q:"In which modern-day country was St. Nicholas born?", qEs:"¿En qué país moderno nació San Nicolás?", a:["Turkey","Finland","Norway","Italy"], aEs:["Turquía","Finlandia","Noruega","Italia"], c:0},
  {q:"Which monarch popularized the Christmas tree in England?", qEs:"¿Qué monarca popularizó el árbol de Navidad en Inglaterra?", a:["Prince Albert & Queen Victoria","King Henry VIII","Queen Elizabeth I","King George III"], aEs:["Príncipe Alberto y Reina Victoria","Rey Enrique VIII","Reina Isabel I","Rey Jorge III"], c:0},
  {q:"What famous Christmas beverage was originally called 'milk punch'?", qEs:"¿Qué bebida famosa se llamaba originalmente 'ponche de leche'?", a:["Eggnog","Hot Cocoa","Cider","Mulled Wine"], aEs:["Ponche de huevo","Cacao","Sidra","Vino especiado"], c:0},
  {q:"What was the first state in the US to recognize Christmas as a holiday?", qEs:"¿Cuál fue el primer estado de EE.UU. en reconocer la Navidad?", a:["Alabama","Massachusetts","New York","Texas"], aEs:["Alabama","Massachusetts","Nueva York","Texas"], c:0},
  {q:"In folklore, who is the 'bad Santa' who punishes naughty children?", qEs:"¿En el folclore, quién es el 'Santa malo' que castiga a los niños?", a:["Krampus","The Grinch","Belsnickel","Père Fouettard"], aEs:["Krampus","El Grinch","Belsnickel","Père Fouettard"], c:0},
  {q:"Which plant is known as the 'Christmas flower'?", qEs:"¿Qué planta se conoce como la 'flor de Navidad'?", a:["Poinsettia","Holly","Mistletoe","Rose"], aEs:["Flor de Pascua","Acebo","Muérdago","Rosa"], c:0},
  {q:"What do people in Ukraine hide in their Christmas trees for good luck?", qEs:"¿Qué esconden los ucranianos en sus árboles para la buena suerte?", a:["A spider and web","A pickle","A gold coin","A bird nest"], aEs:["Una araña y telaraña","Un pepinillo","Una moneda","Un nido"], c:0},
  {q:"The 12 Days of Christmas start on which date?", qEs:"¿En qué fecha comienzan los 12 días de Navidad?", a:["December 25th","December 1st","December 13th","January 1st"], aEs:["25 de Diciembre","1 de Diciembre","13 de Diciembre","1 de Enero"], c:0},
  {q:"Who invented electric Christmas lights?", qEs:"¿Quién inventó las luces eléctricas de Navidad?", a:["Thomas Edison's assistant","Benjamin Franklin","Nikola Tesla","Alexander Graham Bell"], aEs:["Asistente de Edison","Benjamin Franklin","Nikola Tesla","Alexander Graham Bell"], c:0},
  {q:"What color is Elvis Presley's Christmas?", qEs:"¿De qué color es la Navidad de Elvis Presley?", a:["Blue","White","Red","Gold"], aEs:["Azul","Blanca","Roja","Dorada"], c:0},
  {q:"In 'The Twelve Days of Christmas', how many lords are a-leaping?", qEs:"¿En 'Los Doce Días de Navidad', cuántos señores saltan?", a:["10","9","11","12"], aEs:["10","9","11","12"], c:0},
  {q:"Which Christmas ballet is the most famous of all time?", qEs:"¿Qué ballet navideño es el más famoso?", a:["The Nutcracker","Swan Lake","Sleeping Beauty","Cinderella"], aEs:["El Cascanueces","El Lago de los Cisnes","La Bella Durmiente","Cenicienta"], c:0},
  {q:"What represents the 'partridge in a pear tree' in Christianity?", qEs:"¿Qué representa la 'perdiz en el peral' en el cristianismo?", a:["Jesus","God","The Holy Spirit","The Church"], aEs:["Jesús","Dios","El Espíritu Santo","La Iglesia"], c:0},
  {q:"What are the names of the three wise men (Magi)?", qEs:"¿Cómo se llaman los tres reyes magos?", a:["Caspar, Melchior, Balthasar","Peter, Paul, Mary","Shadrach, Meshach, Abednego","Larry, Curly, Moe"], aEs:["Gaspar, Melchor, Baltasar","Pedro, Pablo, María","Sadrac, Mesac, Abed-nego","Larry, Curly, Moe"], c:0},
  {q:"What company used Santa Claus in advertisements from 1931 on?", qEs:"¿Qué compañía usó a Santa en anuncios desde 1931?", a:["Coca-Cola","Pepsi","Macy's","Sears"], aEs:["Coca-Cola","Pepsi","Macy's","Sears"], c:0},
  {q:"What is the Yule Log originally?", qEs:"¿Qué es originalmente el tronco de Navidad?", a:["An entire tree burned for 12 days","A chocolate cake","A candle","A dance"], aEs:["Un árbol entero quemado 12 días","Un pastel","Una vela","Un baile"], c:0},
  {q:"Where did the real St. Nicholas live?", qEs:"¿Dónde vivió el verdadero San Nicolás?", a:["Myra (modern Turkey)","North Pole","Lapland","Rome"], aEs:["Myra (Turquía moderna)","Polo Norte","Laponia","Roma"], c:0},
  {q:"When was Christmas declared a US federal holiday?", qEs:"¿Cuándo se declaró la Navidad feriado federal en EE.UU.?", a:["1870","1776","1950","1820"], aEs:["1870","1776","1950","1820"], c:0},
  {q:"What does the word 'Noel' mean in Latin?", qEs:"¿Qué significa la palabra 'Noel' en latín?", a:["Birth","Gift","Snow","Peace"], aEs:["Nacimiento","Regalo","Nieve","Paz"], c:0},
  {q:"In the song 'Winter Wonderland', what do they call the snowman?", qEs:"¿En 'Winter Wonderland', cómo llaman al muñeco de nieve?", a:["Parson Brown","Frosty","Mr. White","Jack Frost"], aEs:["Parson Brown","Frosty","Mr. White","Jack Frost"], c:0},
  {q:"Which US President banned Christmas trees in the White House?", qEs:"¿Qué presidente de EE.UU. prohibió los árboles en la Casa Blanca?", a:["Teddy Roosevelt (Environmentalist)","Lincoln","Washington","Nixon"], aEs:["Teddy Roosevelt","Lincoln","Washington","Nixon"], c:0},
  {q:"How many ghosts show up in 'A Christmas Carol'?", qEs:"¿Cuántos fantasmas aparecen en 'Cuento de Navidad'?", a:["4 (Jacob Marley + 3)","3","2","5"], aEs:["4 (Marley + 3)","3","2","5"], c:0},
  {q:"What country donates the Trafalgar Square tree to London every year?", qEs:"¿Qué país dona el árbol de Trafalgar Square a Londres?", a:["Norway","Sweden","Canada","Germany"], aEs:["Noruega","Suecia","Canadá","Alemania"], c:0},
  {q:"What is the main ingredient in gingerbread?", qEs:"¿Cuál es el ingrediente principal del pan de jengibre?", a:["Ginger & Molasses","Cinnamon","Nutmeg","Honey"], aEs:["Jengibre y Melaza","Canela","Nuez moscada","Miel"], c:0},
  {q:"Who tried to steal Christmas?", qEs:"¿Quién intentó robar la Navidad?", a:["The Grinch","Scrooge","The Abominable Snowman","Krampus"], aEs:["El Grinch","Scrooge","Abominable Hombre de las Nieves","Krampus"], c:0},
  {q:"What date is St. Nicholas Day?", qEs:"¿Qué fecha es el día de San Nicolás?", a:["December 6th","December 25th","January 1st","November 1st"], aEs:["6 de Diciembre","25 de Diciembre","1 de Enero","1 de Noviembre"], c:0}
];

const INITIAL_HUNTS: HuntItem[] = [
  // House Items
  {id:'h1',text:'Gizmo (x2)',textEs:'Gizmo (x2)',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h2',text:'Stripe',textEs:'Stripe',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h3',text:'Baby Grinch',textEs:'Bebé Grinch',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h4',text:'Mrs. Potts',textEs:'Sra. Potts',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h5',text:'Falkor',textEs:'Falkor',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h6',text:'Panda',textEs:'Panda',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h7',text:'Ladybug (x2)',textEs:'Mariquita (x2)',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h8',text:'Spider',textEs:'Araña',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h9',text:'Cockroach',textEs:'Cucaracha',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h10',text:'Caterpillar (x2)',textEs:'Oruga (x2)',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h11',text:'Tinkerbell (x2)',textEs:'Campanilla (x2)',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h12',text:'Trump on a Shelf',textEs:'Trump en un estante',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h13',text:'Elf on a Shelf (x3)',textEs:'Elfo en un estante (x3)',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h14',text:'Chewbacca',textEs:'Chewbacca',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h15',text:'Bigfoot',textEs:'Pie Grande',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h16',text:'Mario & Luigi',textEs:'Mario y Luigi',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h17',text:'Jack Skellington',textEs:'Jack Skellington',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h18',text:'Crab',textEs:'Cangrejo',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h19',text:'Poison Dart Frog',textEs:'Rana Venenosa',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h20',text:'Koala',textEs:'Koala',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h21',text:'Mickey Mouse',textEs:'Mickey Mouse',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h22',text:'Lizard',textEs:'Lagarto',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h23',text:'Alligator Head',textEs:'Cabeza de Caimán',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  {id:'h24',text:'Jurassic Park Tree',textEs:'Árbol de Jurassic Park',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items',categoryEs:'Objetos Ocultos'},
  
  // House Questions
  {id:'hq1',text:'How many Steamboat Willies are there?',textEs:'¿Cuántos Barco de Vapor Willie hay?',type:'TEXT',huntType:'HOUSE',category:'Questions',categoryEs:'Preguntas'},
  {id:'hq3',text:'Who’s house is this years commemorative ornament resemble?',textEs:'¿A quién se parece el adorno conmemorativo de este año?',type:'TEXT',huntType:'HOUSE',category:'Questions',categoryEs:'Preguntas'},
  {id:'hq4',text:'How many decorated Christmas trees are there?',textEs:'¿Cuántos árboles de Navidad decorados hay?',type:'TEXT',huntType:'HOUSE',category:'Questions',categoryEs:'Preguntas'},

  // Village Items
  {id:'v1',text:'Nativity Set',textEs:'Nacimiento',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS',categoryEs:'NAVIDAD'},
  {id:'v2',text:'Olaf (x2)',textEs:'Olaf (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS',categoryEs:'NAVIDAD'},
  {id:'v3',text:'Jack Skellington',textEs:'Jack Skellington',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS',categoryEs:'NAVIDAD'},
  {id:'v4',text:'Grinch',textEs:'Grinch',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS',categoryEs:'NAVIDAD'},
  {id:'v5',text:'Buddy the Elf',textEs:'Buddy el Elfo',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS',categoryEs:'NAVIDAD'},
  {id:'v6',text:'Snow & Flurry',textEs:'Nieve y Ráfaga',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS',categoryEs:'NAVIDAD'},
  {id:'v7',text:'Cindy Lou Who',textEs:'Cindy Lou Quién',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS',categoryEs:'NAVIDAD'},
  
  {id:'v8',text:'Mickey Mouse',textEs:'Mickey Mouse',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v9',text:'Goofy',textEs:'Goofy',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v10',text:'Arial',textEs:'Ariel',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v11',text:'Cinderella',textEs:'Cenicienta',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v12',text:'Bambi',textEs:'Bambi',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v13',text:'Steamboat Willie',textEs:'Barco de Vapor Willie',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v14',text:'Donald Duck',textEs:'Pato Donald',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v15',text:'Daisy Duck',textEs:'Daisy',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v16',text:'Captain Hook',textEs:'Capitán Garfio',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v17',text:'Lilo',textEs:'Lilo',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v18',text:'Stitch',textEs:'Stitch',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v19',text:'Iago',textEs:'Iago',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  {id:'v20',text:'Chip',textEs:'Chip',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY',categoryEs:'DISNEY'},
  
  {id:'v21',text:'Otis',textEs:'Otis',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES',categoryEs:'CINE Y TV'},
  {id:'v22',text:'Elmo',textEs:'Elmo',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES',categoryEs:'CINE Y TV'},
  {id:'v23',text:'Big Bird',textEs:'Paco Pico',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES',categoryEs:'CINE Y TV'},
  {id:'v24',text:'Bert & Ernie',textEs:'Epi y Blas',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES',categoryEs:'CINE Y TV'},
  {id:'v25',text:'Homer',textEs:'Homer',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES',categoryEs:'CINE Y TV'},
  {id:'v26',text:'Itchy & Scratchy',textEs:'Rasca y Pica',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES',categoryEs:'CINE Y TV'},
  {id:'v27',text:'Bugs Bunny',textEs:'Bugs Bunny',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES',categoryEs:'CINE Y TV'},
  {id:'v28',text:'Snoopy (x2)',textEs:'Snoopy (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES',categoryEs:'CINE Y TV'},
  {id:'v29',text:'Pikachu',textEs:'Pikachu',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES',categoryEs:'CINE Y TV'},
  {id:'v30',text:'Sam & Dean',textEs:'Sam y Dean',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES',categoryEs:'CINE Y TV'},
  
  {id:'v31',text:'Abominable Snowman',textEs:'Abominable Hombre de las Nieves',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES',categoryEs:'CRIATURAS'},
  {id:'v32',text:'Bigfoot',textEs:'Pie Grande',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES',categoryEs:'CRIATURAS'},
  {id:'v33',text:'Dragon',textEs:'Dragón',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES',categoryEs:'CRIATURAS'},
  {id:'v34',text:'Unicorn',textEs:'Unicornio',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES',categoryEs:'CRIATURAS'},
  {id:'v35',text:'T-Rex',textEs:'T-Rex',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES',categoryEs:'CRIATURAS'},
  {id:'v36',text:'Velociraptor (x2)',textEs:'Velociraptor (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES',categoryEs:'CRIATURAS'},
  {id:'v37',text:'Witch',textEs:'Bruja',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES',categoryEs:'CRIATURAS'},
  {id:'v38',text:'Vampire',textEs:'Vampiro',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES',categoryEs:'CRIATURAS'},
  
  {id:'v39',text:'Spiderman (x2)',textEs:'Spiderman (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI',categoryEs:'CIENCIA FICCIÓN'},
  {id:'v40',text:'Wolverine',textEs:'Lobezno',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI',categoryEs:'CIENCIA FICCIÓN'},
  {id:'v41',text:'Captain America (x2)',textEs:'Capitán América (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI',categoryEs:'CIENCIA FICCIÓN'},
  {id:'v42',text:'Batman',textEs:'Batman',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI',categoryEs:'CIENCIA FICCIÓN'},
  {id:'v43',text:'Darth Vader & Luke',textEs:'Darth Vader y Luke',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI',categoryEs:'CIENCIA FICCIÓN'},
  {id:'v44',text:'Nude Sun Bathers (x4)',textEs:'Bañistas Desnudos (x4)',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI',categoryEs:'CIENCIA FICCIÓN'},
  {id:'v45',text:'Waldo (x2)',textEs:'Wally (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI',categoryEs:'CIENCIA FICCIÓN'},
  
  {id:'v46',text:'Raccoons (x2)',textEs:'Mapaches (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v47',text:'Gorilla (x2)',textEs:'Gorila (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v48',text:'Grizzly Bear (x2)',textEs:'Oso Pardo (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v49',text:'Turkey (x2)',textEs:'Pavo (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v50',text:'Polar Bear',textEs:'Oso Polar',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v51',text:'Bald Eagle (x3)',textEs:'Águila Calva (x3)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v52',text:'Defecating Dog',textEs:'Perro Defecando',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v53',text:'Monkey (x2)',textEs:'Mono (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v54',text:'White Wolf',textEs:'Lobo Blanco',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v55',text:'Fox',textEs:'Zorro',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v56',text:'Black Panther',textEs:'Pantera Negra',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v57',text:'Rhino',textEs:'Rinoceronte',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},
  {id:'v58',text:'Camel',textEs:'Camello',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS',categoryEs:'ANIMALES'},

  // Questions - Village
  {id:'q1',text:'What’s the name of the village/city?',textEs:'¿Cómo se llama la villa/ciudad?',type:'TEXT',huntType:'VILLAGE',category:'Questions',categoryEs:'Preguntas'},
  {id:'q2',text:'Where does Marge Simpson work?',textEs:'¿Dónde trabaja Marge Simpson?',type:'TEXT',huntType:'VILLAGE',category:'Questions',categoryEs:'Preguntas'},
  {id:'q3',text:'How much does it cost to ride a reindeer?',textEs:'¿Cuánto cuesta montar un reno?',type:'TEXT',huntType:'VILLAGE',category:'Questions',categoryEs:'Preguntas'},
  {id:'q4',text:'What/Who is the T-Rex eating?',textEs:'¿Qué/Quién está comiendo el T-Rex?',type:'TEXT',huntType:'VILLAGE',category:'Questions',categoryEs:'Preguntas'},
  {id:'q5',text:'What two companies blew up the budget in advertising?',textEs:'¿Qué dos compañías explotaron el presupuesto en publicidad?',type:'TEXT',huntType:'VILLAGE',category:'Questions',categoryEs:'Preguntas'}
];

const INITIAL_POLLS: Poll[] = [
  {id:'p1',question:'The "Die Hard" Dilemma: Is Die Hard actually a Christmas movie?', questionEs:'El dilema "Die Hard": ¿Es realmente una película navideña?', type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Yes, 100%. It happens on Christmas Eve!', textEs:'Sí, 100%. ¡Ocurre en Nochebuena!'},{id:'b',text:'No, it is an action movie that happens to take place in December.', textEs:'No, es una película de acción que ocurre en diciembre.'},{id:'c',text:'It’s a movie I watch at Christmas, but not a "Christmas Movie."', textEs:'Es una película que veo en Navidad, pero no "Navideña".'}]},
  {id:'p2',question:'The Music Timeline: When is it socially acceptable to start playing Christmas music?', questionEs:'Música: ¿Cuándo es aceptable empezar a poner música navideña?', type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'As soon as Halloween ends (Nov 1st).', textEs:'En cuanto termina Halloween (1 Nov).'},{id:'b',text:'Not until after Thanksgiving.', textEs:'No hasta después de Acción de Gracias.'},{id:'c',text:'December 1st strictly.', textEs:'El 1 de diciembre estrictamente.'},{id:'d',text:'Only the week of Christmas.', textEs:'Solo la semana de Navidad.'}]},
  {id:'p3',question:'The Great Tree Debate: What is the superior Christmas Tree situation?', questionEs:'El debate del árbol: ¿Cuál es la mejor situación para el árbol?', type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Real tree (Need the smell!).', textEs:'Árbol real (¡Necesito el olor!).'},{id:'b',text:'Árbol artificial (Need the convenience!).', textEs:'Árbol artificial (¡Conveniencia!).'},{id:'c',text:'A small tabletop plant/Charlie Brown tree.', textEs:'Una planta pequeña de mesa.'},{id:'d',text:'No tree for me.', textEs:'Sin árbol para mí.'}]},
  {id:'p4',question:'The Eggnog Stance: What are your feelings on Eggnog?', questionEs:'El ponche de huevo: ¿Qué opinas?', type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'I love it!', textEs:'¡Me encanta!'},{id:'b',text:'Only if it\'s spiked with something strong.', textEs:'Solo si tiene alcohol fuerte.'},{id:'c',text:'Absolutamente asqueroso.', textEs:'Absolutamente asqueroso.'},{id:'d',text:'I’ve actually never tried it.', textEs:'Nunca lo he probado.'}]},
  {id:'p5',question:'Cookie Contenders: If you could only eat one holiday treat for the rest of your life, what would it be?', questionEs:'Galletas: ¿Si solo pudieras comer un dulce navideño por el resto de tu vida?', type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Gingerbread Men.', textEs:'Hombres de jengibre.'},{id:'b',text:'Frosted Sugar Cookies.', textEs:'Galletas de azúcar glaseadas.'},{id:'c',text:'Peppermint Bark.', textEs:'Corteza de menta.'},{id:'d',text:'Fudge.', textEs:'Dulce de azúcar.'}]},
  {id:'p6',question:'The Dinner Main Event: What is the centerpiece of the Christmas Dinner?', questionEs:'La cena: ¿Cuál es el plato principal?', type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Ham.', textEs:'Jamón.'},{id:'b',text:'Turkey (Round 2 after Thanksgiving).', textEs:'Pavo (Ronda 2).'},{id:'c',text:'Roast Beef / Prime Rib.', textEs:'Rosbif / Costilla.'},{id:'d',text:'Tamales / Lasagna / Something non-traditional.', textEs:'Tamales / Lasaña / Algo no tradicional.'}]},
  {id:'p7',question:'The Opening Ceremony: When does your family open the "Main" presents?', questionEs:'Los regalos: ¿Cuándo abre tu familia los regalos "principales"?', type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Christmas Eve.', textEs:'Nochebuena.'},{id:'b',text:'Christmas Morning.', textEs:'Mañana de Navidad.'},{id:'c',text:'We open one on Eve, the rest in the morning.', textEs:'Uno en Nochebuena, el resto en la mañana.'},{id:'d',text:'Whenever everyone finally wakes up/arrives.', textEs:'Cuando todos despiertan/llegan.'}]},
  {id:'p8',question:'The Lighting Aesthetic: When it comes to Christmas lights on the tree or house, which side are you on?', questionEs:'Luces: ¿Qué prefieres para las luces?', type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Classic Warm White only (Keep it elegant).', textEs:'Blanco cálido clásico.'},{id:'b',text:'Multi-Colored (Nostalgic and bright).', textEs:'Multicolor.'},{id:'c',text:'Cool White / Blue LED (Icy winter vibes).', textEs:'Blanco frío / LED azul.'},{id:'d',text:'Doesn\'t matter, as long as they are blinking/flashing.', textEs:'No importa, mientras parpadeen.'}]},
  {id:'p9',question:'Shopping Habits: What kind of holiday shopper are you?', questionEs:'Compras: ¿Qué tipo de comprador eres?', type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'The Early Bird (Done by December 1st).', textEs:'El madrugador (Listo el 1 de dic).'},{id:'b',text:'The Steady Pacer (Buy a little bit each week).', textEs:'El constante (Poco a poco).'},{id:'c',text:'The Panic Buyer (Christmas Eve dash).', textEs:'El comprador de pánico.'},{id:'d',text:'The Gift Card Giver (I avoid shopping entirely).', textEs:'El de las tarjetas de regalo.'}]},
  {id:'p10',question:'The Cleanup: When do the decorations come down?', questionEs:'Limpieza: ¿Cuándo se quitan las decoraciones?', type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'December 26th (It’s over immediately).', textEs:'26 de diciembre.'},{id:'b',text:'New Year\'s Day.', textEs:'Día de Año Nuevo.'},{id:'c',text:'After the Epiphany (Jan 6th).', textEs:'Después de Reyes (6 de enero).'},{id:'d',text:'Sometime in February... or March.', textEs:'En febrero... o marzo.'}]},
];

const INITIAL_GAMES: Game[] = [{id:'g1',title:'Corn Hole',type:'TEAM',signups:[],results:[], scores:{}}, {id:'g2',title:'Beer Pong',type:'TEAM',signups:[],results:[]}, {id:'g3',title:'Jenga',type:'TEAM',signups:[],results:[]}, {id:'g4',title:'Connect 4',type:'TEAM',signups:[],results:[]}];

const UI = {
  en: { 
    nav:{HOME:'Home',HUNT_VILLAGE:'Village',HUNT_HOUSE:'House',VOTING:'Vote',GAMES:'Games',PHOTOS:'Photos',ADMIN:'Admin',PROFILE:'Profile'}, 
    home:{title:"CHRISTMAS PARTY 2025",hello:"Hello",partyTime:"PARTY TIME",send:"Send",comment:"Leave a note...",steps:["Grab a drink","Grab some food","Do a scavenger hunt","Play some games","Snap a photo at the photobooth","And most of all have a great time!"]}, 
    games:{title:"Party Games",signup:"Sign Up",winner:"Winner", rules:"Rules", history:"History", teams:"Teams", waiting:"Waiting...", selectPartner:"Select Partner...", addPartner:"+ Add Partner", leave:"Leave", close:"Close"}, 
    vote:{title:"Vote | Polls | Trivia",voteBtn:"Vote",voted:"Voted"}, 
    admin:{dashboard:"Dashboard",restart:"Restart Party",exit:"Exit"}, 
    welcome:{join:"Join Party"},
    profile:{
        playerCard: "PLAYER CARD",
        villageHunt: "Village Hunt",
        houseHunt: "House Hunt",
        quizMastery: "Quiz Mastery",
        votingHistory: "Ugly Sweater Vote",
        futureParties: "Want to join us for future parties?",
        email: "Email",
        phone: "Phone Number",
        submit: "Keep me in the loop!",
        trophies: "Hall of Fame"
    },
    install: {
        title: "Add App to Home Screen",
        select: "To install this app on your iPhone or iPad:",
        ios: "Apple (iOS)",
        android: "Android",
        back: "← Back",
        iosSteps: [
            "Tap the **Share** button (square with arrow) at the bottom of your browser.",
            "Scroll down and tap **'Add to Home Screen'**.",
            "Tap **Add** in the top right corner."
        ],
        gotIt: "Got it!"
    }
  },
  es: { 
    nav:{HOME:'Inicio',HUNT_VILLAGE:'Villa',HUNT_HOUSE:'Casa',VOTING:'Votar',GAMES:'Juegos',PHOTOS:'Fotos',ADMIN:'Admin',PROFILE:'Perfil'}, 
    home:{title:"FIESTA DE NAVIDAD 2025",hello:"Hola",partyTime:"HORA DE FIESTA",send:"Enviar",comment:"Nota...",steps:["Bebida","Comida","Búsqueda","Juegos","Fotos","¡Diviértete!"]}, 
    games:{title:"Juegos",signup:"Unirse",winner:"Ganador", rules:"Reglas", history:"Historial", teams:"Equipos", waiting:"Esperando...", selectPartner:"Seleccionar Compañero...", addPartner:"+ Añadir Compañero", leave:"Salir", close:"Cerrar"}, 
    vote:{title:"Voto | Encuestas | Trivia",voteBtn:"Votar",voted:"Votado"}, 
    admin:{dashboard:"Panel",restart:"Reiniciar",exit:"Salir"}, 
    welcome:{join:"Unirse a la Fiesta"},
    profile:{
        playerCard: "TARJETA DE JUGADOR",
        villageHunt: "Búsqueda (Villa)",
        houseHunt: "Búsqueda (Casa)",
        quizMastery: "Maestría en Quiz",
        votingHistory: "Voto Suéter Feo",
        futureParties: "¿Quieres unirte a futuras fiestas?",
        email: "Correo",
        phone: "Teléfono",
        submit: "¡Mantenme informado!",
        trophies: "Salón de la Fama"
    },
    install: {
        title: "Añadir a Pantalla de Inicio",
        select: "Para instalar esta app en tu iPhone o iPad:",
        ios: "Apple (iOS)",
        android: "Android",
        back: "← Volver",
        iosSteps: [
            "Toca el botón **Compartir** (cuadrado con flecha) en la parte inferior.",
            "Desliza y toca **'Añadir a Inicio'**.",
            "Toca **Añadir** arriba a la derecha."
        ],
        gotIt: "¡Entendido!"
    }
  }
};

// Helper for dynamic content translation
const getTx = (obj: any, key: string, lang: 'en' | 'es') => {
    if (lang === 'es' && obj[`${key}Es`]) return obj[`${key}Es`];
    return obj[key];
};

const Header = ({ title, rightAction, subHeader }: { title: React.ReactNode, rightAction?: React.ReactNode, subHeader?: React.ReactNode }) => (
  <div className="bg-white/90 backdrop-blur-md flex flex-col z-20 shadow-sm relative rounded-b-3xl">
    <div className="p-4 flex justify-between items-center h-24">
        <div className="text-4xl font-bold font-sweater text-red-800 truncate leading-none drop-shadow-sm">{title}</div>
        <div className="flex items-center gap-2">{rightAction}</div>
    </div>
    {subHeader && <div className="px-6 pb-4">{subHeader}</div>}
  </div>
);

const SnowFall = ({ className = "fixed inset-0 z-10" }: { className?: string }) => {
  const [flakes] = useState(() => Array.from({length: 30}).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 5 + Math.random() * 10,
    size: 0.5 + Math.random() * 1
  })));
  
  return (
    <div className={`${className} pointer-events-none overflow-hidden`}>
      {flakes.map(f => (
        <div key={f.id} className="snowflake animate-snow" style={{
          left: `${f.left}%`,
          animationDelay: `${f.delay}s`,
          animationDuration: `${f.duration}s`,
          fontSize: `${f.size}rem`
        }}>❄</div>
      ))}
    </div>
  );
};

// Advanced Canvas based snow for AR
const SnowFallCanvas = ({ intensity = 50, width, height }: { intensity: number, width: number, height: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let flakes: any[] = [];
        const numFlakes = intensity * 5; // MORE NOTICEABLE

        for (let i = 0; i < numFlakes; i++) {
            flakes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 4 + 1,
                d: Math.random() * numFlakes // density
            });
        }
        
        let angle = 0;
        let animationFrameId: number;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.beginPath();
            
            for (let i = 0; i < numFlakes; i++) {
                const f = flakes[i];
                ctx.moveTo(f.x, f.y);
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
            }
            ctx.fill();
            move();
            animationFrameId = requestAnimationFrame(draw);
        }

        const move = () => {
            angle += 0.01;
            for (let i = 0; i < numFlakes; i++) {
                const f = flakes[i];
                f.y += Math.pow(f.d, 2) + 1;
                f.x += Math.sin(angle) * 2;
                if (f.y > height) {
                    flakes[i] = { x: Math.random() * width, y: 0, r: f.r, d: f.d };
                }
            }
        }
        
        draw();
        
        return () => cancelAnimationFrame(animationFrameId);
    }, [intensity, width, height]);

    return <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0 z-10 pointer-events-none" />;
};

const VillageAR = ({ onClose }: { onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [intensity, setIntensity] = useState(50);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' },
            audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    startCamera();
    
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 pointer-events-none bg-black/10" />
      <SnowFallCanvas intensity={intensity} width={window.innerWidth} height={window.innerHeight} />

      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-[130] flex justify-between items-start">
           <div className="bg-black/50 p-4 rounded-xl backdrop-blur-md">
               <label className="text-white text-sm font-bold block mb-2">Snow Intensity</label>
               <input 
                 type="range" 
                 min="10" 
                 max="200" 
                 value={intensity} 
                 onChange={(e) => setIntensity(Number(e.target.value))} 
                 className="w-48 h-4 accent-white"
               />
           </div>
           <Button onClick={onClose} className="bg-red-600 text-white shadow-lg border-2 border-white">Close</Button>
      </div>
    </div>
  );
};

const SurprisePopup = ({ type, onClose }: { type: 'VILLAGE' | 'HOUSE', onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
    <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl border-4 border-red-600 relative" onClick={e=>e.stopPropagation()}>
       <div className="text-8xl mb-4 animate-bounce">{type==='VILLAGE' ? '🎅' : '🧝'}</div>
       <h2 className="text-4xl font-bold font-sweater text-red-700 mb-2 leading-none">{type==='VILLAGE' ? "Sleigh-in' It!" : "Elfin' Incredible!"}</h2>
       <p className="text-lg font-bold text-green-700 mb-6">{type==='VILLAGE' ? "You found the whole village! You're officially on the Nice List." : "House clear! You found every item. Santa is impressed."}</p>
       <Button onClick={onClose} className="w-full bg-red-600 text-white py-3 text-xl rounded-xl shadow-lg animate-pulse">Ho Ho Ho!</Button>
    </div>
  </div>
);

const InstallModal = ({ onClose, lang }: { onClose: () => void, lang: 'en'|'es' }) => {
  const t = UI[lang].install;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 p-6 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl relative mb-10 md:mb-0" onClick={e=>e.stopPropagation()}>
         <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold">X</button>
         <h3 className="text-2xl font-sweater text-red-700 mb-4 text-center">{t.title}</h3>
         <div className="space-y-4 text-left">
             <p className="text-sm font-bold text-gray-800">{t.select}</p>
             <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                 {t.iosSteps.map((s:string,i:number)=><li key={i} dangerouslySetInnerHTML={{__html:s.replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')}}/>)}
             </ol>
             <Button onClick={onClose} className="w-full bg-red-600 text-white mt-4">{t.gotIt}</Button>
         </div>
         <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-t-[20px] border-t-white border-r-[15px] border-r-transparent drop-shadow-lg"></div>
         </div>
      </div>
    </div>
  );
};

const CreateProfile = ({ fbUser, onJoin }: { fbUser: FirebaseUser, onJoin: (u: any) => void }) => {
  const [name, setName] = useState(''); 
  const [photo, setPhoto] = useState<File|null>(null); 
  const [prev, setPrev] = useState<string|null>(null); 
  const [load, setLoad] = useState(false);
  const [lang, setLang] = useState<'en'|'es'>('en');

  const join = async () => {
    if(!name || !photo || !name.trim().includes(' ')) return alert(lang === 'en' ? "First and Last Name Required!" : "¡Se requiere nombre y apellido!");
    setLoad(true);
    try {
      const sRef = firebaseStorage.ref(storage, `profiles/${fbUser.uid}.jpg`);
      await firebaseStorage.uploadBytes(sRef, photo);
      const url = await firebaseStorage.getDownloadURL(sRef);
      const uData = { id: fbUser.uid, name, photo: url, email: fbUser.email||'', phone: fbUser.phoneNumber||'', language: lang, timestamp: Date.now(), votesReceived: 0, huntProgress: {}, hostComment: '', hasVotedForId: null, quizScore: 0, quizTotalAttempted: 0 };
      await setDoc(doc(db, 'users', fbUser.uid), uData);
      const g = await getDoc(doc(db,'games','g1'));
      if(!g.exists()){ const b = writeBatch(db); INITIAL_GAMES.forEach(x=>b.set(doc(db,'games',x.id),x)); INITIAL_POLLS.forEach(x=>b.set(doc(db,'polls',x.id),x)); INITIAL_HUNTS.forEach(x=>b.set(doc(db,'hunt_items',x.id),x)); await b.commit(); }
      onJoin(uData);
    } catch(e:any) { alert(e.message); setLoad(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-lg mx-auto bg-white">
       <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={()=>setLang('en')} className={`px-6 py-2 rounded-full font-bold text-xl transition-colors ${lang==='en'?'bg-[#0B3D2E] text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>EN</button>
            <button onClick={()=>setLang('es')} className={`px-6 py-2 rounded-full font-bold text-xl transition-colors ${lang==='es'?'bg-[#0B3D2E] text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>ES</button>
      </div>
      <div className="w-full flex flex-row items-center justify-center gap-4 mb-8 mt-12 px-4">
          <img src={LOGO_URL} className="w-32 h-32 object-contain"/>
          <div className="text-left flex-1">
              <h1 className="text-4xl md:text-6xl font-sweater font-bold text-red-700 leading-none drop-shadow-sm">MERRY<br/>CHRISTMAS</h1>
              <p className="text-[#0B3D2E] font-bold text-xs tracking-[0.2em] mt-2">FRUTH BE TOLD APP</p>
          </div>
      </div>
      <Card className="w-full space-y-6 border border-gray-100 shadow-xl bg-white p-8 rounded-3xl">
        <div className="text-left">
            <label className="block font-bold text-[#0B3D2E] text-xs uppercase mb-2 tracking-wide">{lang === 'en' ? 'First and Last Name' : 'Nombre y Apellido'}</label>
            <input value={name} onChange={e=>setName(e.target.value.replace(/\b\w/g, c=>c.toUpperCase()))} placeholder={lang === 'en' ? "Santa Claus" : "Papá Noel"} className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold bg-gray-50 text-gray-900 focus:border-[#0B3D2E] outline-none transition-colors placeholder:text-gray-300"/>
        </div>
        <label className="block w-64 h-64 mx-auto bg-gray-50 rounded-full flex items-center justify-center border-4 border-dashed border-[#0B3D2E] cursor-pointer overflow-hidden relative hover:bg-green-50 transition-colors group">
            {prev ? <img src={prev} className="w-full h-full object-cover"/> : <div className="flex flex-col items-center text-[#0B3D2E] group-hover:scale-110 transition-transform"><IconCamera className="w-10 h-10"/><span className="text-[10px] font-bold uppercase mt-1">{lang==='en'?'Upload Photo':'Subir Foto'}</span></div>}
            <input type="file" onChange={e=>{if(e.target.files?.[0]){setPhoto(e.target.files[0]);setPrev(URL.createObjectURL(e.target.files[0]))}}} className="hidden" accept="image/*"/>
        </label>
        <div className="relative group pt-2">
            <div className="absolute inset-0 bg-red-800 rounded-lg translate-y-1 transform transition-transform group-active:translate-y-0.5"></div>
            <button onClick={join} disabled={load} className="relative w-full bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white h-16 rounded-lg text-xl shadow-lg border-x-8 border-transparent border-t-2 border-red-400 font-sweater tracking-wide uppercase transform transition-transform active:translate-y-0.5 flex items-center justify-center gap-2">
                <div className="absolute top-1 bottom-1 left-1 right-1 border-2 border-dashed border-red-400/50 rounded pointer-events-none"></div>
                <span className="relative z-10 drop-shadow-md">{load ? '...' : UI[lang].welcome.join}</span>
            </button>
        </div>
      </Card>
    </div>
  );
};

const GameCard = ({ g, user, users, join, win, leave, lang }: any) => {
  const [c1, c2] = g.signups.slice(0,2); const [pid, setPid] = useState(''); const [showP, setShowP] = useState(false); const [hist, setHist] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const t = UI[lang].games;
  
  const updateScore = async (sid: string, delta: number) => {
      const cur = g.scores?.[sid] || 0;
      await updateDoc(doc(db,'games',g.id), { [`scores.${sid}`]: Math.max(0, cur + delta) });
  };

  return (
    <>
    <Card className="border-2 border-red-100 p-0 overflow-hidden cursor-pointer active:scale-[0.99] transition-transform" onClick={()=>setShowRules(true)}>
       <div className="bg-red-700 text-white p-3 font-bold flex justify-between items-center relative group">
           <div className="flex items-center gap-2">
               <span className="text-lg underline decoration-white/50 underline-offset-4 group-hover:decoration-white transition-all">{g.title}</span>
               <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">i</span>
           </div>
           <div className="flex gap-2">
               <button onClick={(e)=>{e.stopPropagation();setHist(!hist)}} className="text-[10px] bg-red-900/50 px-2 py-1 rounded hover:bg-red-900">📜 {t.history}</button>
               <span className="text-[10px] bg-red-900/50 px-2 py-1 rounded">{g.signups.length} {t.teams}</span>
           </div>
       </div>
       {hist ? <div className="p-4 bg-red-50" onClick={e=>e.stopPropagation()}><h4 className="font-bold text-center mb-2 text-red-800">{t.history}</h4>{g.results.slice().reverse().map((r:any)=><div key={r.id} className="text-xs border-b border-red-200 py-2 flex justify-between"><span className="text-green-700 font-bold">{r.winnerLabel}</span> <span className="text-gray-500">def.</span> <span className="text-red-700">{r.loserLabel}</span></div>)}<Button onClick={()=>setHist(false)} className="w-full mt-4 text-xs bg-red-200 text-red-800">{t.close}</Button></div> : 
       <div onClick={e=>e.stopPropagation()}>
       <div className="p-4 bg-red-50 flex gap-2 items-center relative">
            {[c1,c2].map((p:any,i:number)=>{
                const opp=i===0?c2:c1;
                return (
                    <div key={i} className={`flex-1 bg-white border-2 rounded-xl p-3 flex flex-col items-center min-h-[140px] relative shadow-sm ${p?(i===0?'border-green-500':'border-blue-500'):'border-dashed border-gray-300'}`}>
                        {p ? (
                            <>
                                {p.wins>0 && <div className="absolute top-0 right-0 bg-yellow-400 text-xs px-2 py-1 font-bold rounded-bl shadow-sm">🏆 {p.wins}</div>}
                                <div className="flex -space-x-6 mb-3 mt-1">
                                    {p.players.map((uid:string)=><img key={uid} src={users.find((u:any)=>u.id===uid)?.photo} className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md bg-gray-200"/>)}
                                </div>
                                <div className="font-bold text-xs text-center mb-2 text-gray-800 leading-tight">{p.label}</div>
                                {g.title === 'Corn Hole' && (
                                    <div className="flex items-center justify-center gap-3 mb-4 mt-1">
                                        <button onClick={()=>updateScore(p.id, -1)} className="bg-gray-100 text-red-600 font-black w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-200 active:bg-gray-200 transition-colors pb-1">-</button>
                                        <span className="text-2xl font-mono font-black text-gray-900 w-8 text-center">{g.scores?.[p.id] || 0}</span>
                                        <button onClick={()=>updateScore(p.id, 1)} className="bg-gray-100 text-green-600 font-black w-10 h-10 rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-200 active:bg-gray-200 transition-colors pb-1">+</button>
                                    </div>
                                )}
                                {opp && <Button onClick={()=>win(g.id,p,opp)} className="w-full bg-red-600 hover:bg-green-600 text-white text-[10px] py-2 font-bold uppercase tracking-wider">{t.winner}</Button>}
                                <button onClick={()=>leave(g.id,p.id)} className="absolute top-1 left-2 text-red-400 text-xs font-bold hover:text-red-600">{t.leave}</button>
                            </>
                        ) : <span className="text-sm text-gray-400 mt-10 font-medium">{t.waiting}</span>}
                    </div>
                )
            })}
            {c1 && c2 && <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-red-600 text-red-700 font-black rounded-full w-8 h-8 flex items-center justify-center z-10 shadow-lg text-[10px]">VS</div>}
       </div>
       <div className="p-4 flex flex-col gap-3">
            {showP ? (
                <div className="flex gap-2">
                    <select className="flex-1 text-sm p-2 border-2 border-gray-200 bg-white text-gray-900 rounded-lg outline-none focus:border-red-500" value={pid} onChange={e=>setPid(e.target.value)}>
                        <option value="">{t.selectPartner}</option>
                        {users.filter((u:any)=>u.id!==user.id).map((u:any)=><option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <button onClick={()=>setShowP(false)} className="text-red-500 font-bold px-2">X</button>
                </div>
            ) : <Button variant="outline" onClick={()=>setShowP(true)} className="text-xs py-2 text-gray-500 border-dashed border-gray-300 hover:bg-gray-50 hover:text-gray-700">{t.addPartner}</Button>}
            <button onClick={()=>{join(g.id,pid||null);setPid('');setShowP(false)}} className="w-full bg-blue-600 text-white rounded-xl px-6 py-3 shadow-lg hover:bg-blue-700 uppercase tracking-wide font-bold text-xs transition-transform active:scale-95">{t.signup}</button>
       </div>
       {g.signups.slice(2).map((s:any,i:number)=><div key={s.id} className="flex justify-between text-xs p-2 bg-gray-50 border-t border-gray-100 mx-0 text-gray-600"><div className="flex items-center gap-2"><span className="font-bold text-gray-400 w-4">{i+1}</span><span>{s.label}</span></div>{s.players.includes(user.id)&&<button onClick={()=>leave(g.id,s.id)} className="text-red-500 font-bold hover:underline">{t.leave}</button>}</div>)}
       </div>}
    </Card>
    {showRules && (
        <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in" onClick={()=>setShowRules(false)}>
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
                <h3 className="text-xl font-bold font-sweater text-red-700 mb-4">{g.title} {t.rules}</h3>
                <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden border-2 border-gray-200">
                    <img src={GAME_IMAGES[g.title]} className="w-full h-full object-contain bg-white" alt="Rules" />
                </div>
                <p className="text-gray-700 leading-relaxed text-sm mb-6 whitespace-pre-line">{GAME_RULES[g.title][lang] || "Have fun and play fair!"}</p>
                <Button onClick={()=>setShowRules(false)} className="w-full bg-gray-900 text-white">{UI[lang].install.gotIt}</Button>
            </div>
        </div>
    )}
    </>
  );
};

const GamesScreen = ({ games, user, users }: any) => {
  const join = async (gid:string, pid:string|null) => {
    const g = games.find((x:any)=>x.id===gid);
    const partner = pid ? users.find((u:any)=>u.id===pid) : null;
    const label = partner ? `${user.name.split(' ')[0]} & ${partner.name.split(' ')[0]}` : user.name;
    await updateDoc(doc(db,'games',gid), { signups:[...g.signups, {id:`s_${Date.now()}`,label,captainId:user.id,wins:0,players:pid?[user.id,pid]:[user.id]}] });
  };
  const win = async (gid:string, w:any, l:any) => {
    const g = games.find((x:any)=>x.id===gid);
    await updateDoc(doc(db,'games',gid), { 
        signups:[{...w,wins:w.wins+1},...g.signups.filter((s:any)=>s.id!==l.id && s.id!==w.id)], 
        results:[...g.results,{id:`r_${Date.now()}`,winnerLabel:w.label,loserLabel:l.label,timestamp:Date.now()}],
        scores: {} // Reset scores on game end
    });
  };
  const leave = async (gid:string, sid:string) => updateDoc(doc(db,'games',gid), { signups:games.find((x:any)=>x.id===gid).signups.filter((s:any)=>s.id!==sid) });
  const lang = user.language || 'en';
  return (
    <div className="space-y-6 pb-24 pt-4">{games.map((g:any)=><GameCard key={g.id} g={g} user={user} users={users} join={join} win={win} leave={leave} lang={lang}/>)}</div>
  );
};

const AdminDashboard = ({ users, polls, hunts, games, onClose }: any) => {
  const [pass, setPass] = useState(''); const [auth, setAuth] = useState(false); const [tab, setTab] = useState('USERS');
  const [inspectUser, setInspectUser] = useState<any>(null);
  const [pq, spq] = useState(''); const [opts, setOpts] = useState([{id:'0',text:''}]);
  const [ht, sht] = useState(''); const [hType, sHType] = useState('VILLAGE'); const [hCat, sHCat] = useState('CHRISTMAS');
  
  const categories = ['CHRISTMAS','DISNEY','TV & MOVIES','CREATURES','SCI-FI','ANIMALS','Questions','Hidden Items','Admin Added'];

  const getProg = (u:User, type:string) => { const items = hunts.filter((h:any)=>h.huntType===type); if(!items.length) return 0; const done = items.filter((i:any)=>u.huntProgress?.[i.id]).length; return Math.round((done/items.length)*100); };
  
  const createPoll = async () => { if(!pq || opts.some(o=>!o.text)) return alert("Fill all fields"); await addDoc(collection(db,'polls'), { question: pq, type: 'MULTIPLE_CHOICE', isActive: true, answers: {}, options: opts }); spq(''); setOpts([{id:'0',text:''}]); };
  
  const createHunt = async () => { 
      if(!ht) return; 
      const type = hCat === 'Questions' ? 'TEXT' : 'CHECKBOX';
      await addDoc(collection(db,'hunt_items'), { text: ht, type, huntType: hType, category: hCat }); 
      sht(''); 
  };

  const totalVotes = users.reduce((acc:number, u:any) => acc + (u.votesReceived || 0), 0);

  if(!auth) return <div className="p-6 pt-20 space-y-4 max-w-sm mx-auto"><h1 className="text-4xl font-sweater text-red-700 mb-4 text-center">Admin Login</h1><Input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password"/><Button onClick={()=>pass==='kokomo'?setAuth(true):alert('Wrong')} className="bg-red-600 text-white mt-4 w-full">Login</Button><Button variant="outline" onClick={onClose} className="mt-2 w-full">Exit</Button></div>;
  
  if(inspectUser) return <div className="fixed inset-0 z-50 bg-white overflow-y-auto"><ProfileScreen user={inspectUser} users={users} games={games} hunts={hunts} onClose={()=>setInspectUser(null)} readOnly /></div>;

  return (
    <div className="pb-20 space-y-6 pt-2">
      <div className="flex gap-1 overflow-x-auto border-b border-gray-300 py-4 px-3 no-scrollbar bg-white/50 backdrop-blur-sm rounded-xl mx-2 mt-2">
          {['USERS','PROGRESS','GUESTBOOK','HUNT','POLLS','DATA'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap border transition-all shadow-sm ${tab===t?'bg-red-700 text-white border-red-700 scale-105':'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}>{t}</button>)}
      </div>
      {tab==='USERS' && <div className="space-y-1">{users.map((u:any)=><div key={u.id} className="flex justify-between items-center p-2 border bg-white rounded"><button onClick={()=>setInspectUser(u)} className="flex items-center gap-3 text-left"><img src={u.photo} className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"/><span className="font-bold text-sm text-gray-800">{u.name}</span></button><button onClick={()=>deleteDoc(doc(db,'users',u.id))} className="text-red-500 text-xs border border-red-200 px-2 py-1 rounded">Delete</button></div>)}</div>}
      {tab==='PROGRESS' && <div className="space-y-4">
         <div className="bg-gray-50 p-2 rounded"><h3 className="font-bold text-xs text-center mb-2 text-gray-900">UGLY SWEATER LEADERBOARD</h3>{users.sort((a:any,b:any)=>b.votesReceived-a.votesReceived).slice(0,5).map((u:any,i:number)=><div key={u.id} className="flex justify-between text-xs p-1 border-b text-gray-900"><span className="font-bold">{i+1}. {u.name}</span><span>{u.votesReceived} Votes ({totalVotes ? Math.round((u.votesReceived/totalVotes)*100) : 0}%)</span></div>)}</div>
         <div className="space-y-1"><div className="grid grid-cols-[1fr_1fr_1fr] text-xs font-bold px-2 text-gray-900"><span>User</span><span className="text-center">Village</span><span className="text-center">House</span></div>{users.map((u:any)=><div key={u.id} className="grid grid-cols-[1fr_1fr_1fr] items-center p-2 border-b bg-white"><div className="flex gap-2 items-center"><img src={u.photo} className="w-6 h-6 rounded-full"/><span className="text-xs font-bold truncate text-gray-900">{u.name}</span></div><div className="px-2"><div className="w-full bg-gray-200 h-2 rounded"><div className="bg-green-500 h-2 rounded" style={{width:`${getProg(u,'VILLAGE')}%`}}/></div><div className="text-[10px] text-center text-gray-600">{getProg(u,'VILLAGE')}%</div></div><div className="px-2"><div className="w-full bg-gray-200 h-2 rounded"><div className="bg-blue-500 h-2 rounded" style={{width:`${getProg(u,'HOUSE')}%`}}/></div><div className="text-[10px] text-center text-gray-600">{getProg(u,'HOUSE')}%</div></div></div>)}</div>
      </div>}
      {tab==='GUESTBOOK' && <div className="space-y-2">{users.filter((u:any)=>u.hostComment).map((u:any)=><div key={u.id} className="p-3 border bg-white rounded"><div className="flex gap-2 mb-1"><img src={u.photo} className="w-6 h-6 rounded-full"/><span className="font-bold text-sm text-gray-900">{u.name}</span></div><p className="text-sm italic text-gray-900">"{u.hostComment}"</p></div>)}</div>}
      {tab==='POLLS' && <div className="p-4 space-y-6"><div className="bg-white p-4 rounded border shadow-sm"><h3 className="font-bold text-sm mb-2 text-gray-900">Create Poll</h3><Input value={pq} onChange={e=>spq(e.target.value)} placeholder="Question"/><div className="space-y-2 mt-2">{opts.map((o,i)=><div key={i} className="flex gap-2"><Input value={o.text} onChange={e=>{const n=[...opts];n[i].text=e.target.value;setOpts(n)}} placeholder={`Option ${i+1}`} className="flex-1"/><Button variant="danger" onClick={()=>setOpts(opts.filter((_,idx)=>idx!==i))} className="px-3">X</Button></div>)}</div><Button variant="outline" onClick={()=>setOpts([...opts, {id:Date.now().toString(), text:''}])} className="w-full mt-2 text-xs">+ Add Option</Button><Button onClick={createPoll} className="bg-green-600 text-white w-full mt-4">Create Poll</Button></div><div className="space-y-2">{polls.map((p:any)=><div key={p.id} className="p-2 border rounded bg-gray-50 flex justify-between items-center"><span className="text-xs font-bold truncate flex-1 text-gray-800">{p.question}</span><Button variant="danger" onClick={()=>deleteDoc(doc(db,'polls',p.id))} className="text-xs py-1 px-2">Del</Button></div>)}</div></div>}
      {tab==='HUNT' && <div className="p-4 space-y-6"><div className="bg-white p-4 rounded border shadow-sm"><h3 className="font-bold text-sm mb-2 text-gray-900">Add Hunt Item</h3><Input value={ht} onChange={e=>sht(e.target.value)} placeholder="Item Name / Question"/><div className="flex gap-2 mt-2"><Button variant={hType==='VILLAGE'?'primary':'outline'} onClick={()=>sHType('VILLAGE')} className="flex-1 text-xs">Village</Button><Button variant={hType==='HOUSE'?'primary':'outline'} onClick={()=>sHType('HOUSE')} className="flex-1 text-xs">House</Button></div><select value={hCat} onChange={e=>sHCat(e.target.value)} className="w-full mt-2 p-2 border rounded bg-white text-gray-900 text-sm focus:border-red-500 outline-none"><option value="">Select Category...</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select><Button onClick={createHunt} className="bg-green-600 text-white w-full mt-4">Add Item</Button></div><div className="space-y-2 max-h-60 overflow-y-auto">{hunts.map((h:any)=><div key={h.id} className="p-2 border rounded bg-gray-50 flex justify-between items-center"><span className="text-xs font-bold truncate flex-1 text-gray-800">{h.text} ({h.huntType}) [{h.type}]</span><Button variant="danger" onClick={()=>deleteDoc(doc(db,'hunt_items',h.id))} className="text-xs py-1 px-2">Del</Button></div>)}</div></div>}
      {tab==='DATA' && <div className="p-4 space-y-6"><div className="space-y-2"><Button onClick={async()=>{if(prompt("Pass?")==='kokomo'){
          const b=writeBatch(db);
          // 1. Delete ALL existing hunt items to remove extras
          const huntSnaps = await getDocs(collection(db, 'hunt_items'));
          huntSnaps.forEach(d => b.delete(d.ref));
          
          // 2. Add New Ones
          INITIAL_HUNTS.forEach(x=>b.set(doc(db,'hunt_items',x.id),x));
          INITIAL_POLLS.forEach(x=>b.set(doc(db,'polls',x.id),x));
          
          await b.commit();
          alert("Synced! Old items removed, new items added.");
      }}} className="bg-blue-600 text-white text-xs w-full py-3">SYNC DATA (Remove Extras & Fix)</Button><Button onClick={async()=>{if(prompt("Type 'kokomo' to WIPE ALL HISTORY & USERS:") !== 'kokomo') return alert("Wrong Password");const b = writeBatch(db);users.forEach((u:any) => b.delete(doc(db,'users',u.id)));const gamesSnaps = await import('firebase/firestore').then(m=>m.getDocs(collection(db,'games')));gamesSnaps.forEach(g=>b.update(doc(db,'games',g.id),{signups:[],results:[],scores:{}}));const photoSnaps = await import('firebase/firestore').then(m=>m.getDocs(collection(db,'photos')));photoSnaps.forEach(p=>b.delete(doc(db,'photos',p.id)));polls.forEach((p:any)=>b.update(doc(db,'polls',p.id),{answers:{}}));await b.commit();alert("All History & Users Cleared.");window.location.reload();}} className="bg-red-600 text-white text-xs w-full py-3 font-bold">CLEAR ALL HISTORY & USERS</Button></div></div>}
    </div>
  );
};

const ProfileScreen = ({ user, users, games, hunts, onClose, readOnly = false }: any) => {
  const [name, setName] = useState(user.name);
  const [photo, setPhoto] = useState<File|null>(null);
  const [preview, setPreview] = useState(user.photo);
  const [fEmail, setFEmail] = useState(user.futureEmail||'');
  const [fPhone, setFPhone] = useState(user.futurePhone||'');
  const [uploading, setUploading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  
  const ui = UI[user.language||'en'].profile;

  // Auto-Save Name Debounce
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setName(val);
      if(!readOnly) {
          if(debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(async () => {
             await updateDoc(doc(db, 'users', user.id), { name: val });
          }, 500);
      }
  };

  // Auto-Save Photo
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if(!readOnly && e.target.files?.[0]) {
          const file = e.target.files[0];
          setPreview(URL.createObjectURL(file));
          setUploading(true);
          try {
              const sRef = firebaseStorage.ref(storage, `profiles/${user.id}_${Date.now()}.jpg`);
              await firebaseStorage.uploadBytes(sRef, file);
              const url = await firebaseStorage.getDownloadURL(sRef);
              await updateDoc(doc(db, 'users', user.id), { photo: url });
          } catch(err) { console.error(err); }
          setUploading(false);
      }
  };

  // Auto-Save Language
  const changeLang = async (l: 'en'|'es') => {
      if(!readOnly) {
         await updateDoc(doc(db, 'users', user.id), { language: l });
      }
  };

  // Auto-Save Contact Info on button click (still acts as a "submit" for UX)
  const handleSaveContact = async () => {
     if(!readOnly) {
        await updateDoc(doc(db, 'users', user.id), { futureEmail: fEmail, futurePhone: fPhone });
        alert("Info Saved!");
     }
  };

  // Stats Logic
  const vProg = Math.round((hunts.filter((h:any)=>h.huntType==='VILLAGE' && user.huntProgress?.[h.id]).length / hunts.filter((h:any)=>h.huntType==='VILLAGE').length) * 100) || 0;
  const hProg = Math.round((hunts.filter((h:any)=>h.huntType==='HOUSE' && user.huntProgress?.[h.id]).length / hunts.filter((h:any)=>h.huntType==='HOUSE').length) * 100) || 0;
  const votedFor = user.hasVotedForId ? users.find((u:any)=>u.id===user.hasVotedForId)?.name : 'No one yet';
  const votedForImg = user.hasVotedForId ? users.find((u:any)=>u.id===user.hasVotedForId)?.photo : null;
  const myWins: string[] = [];
  let winCount = 0;
  games.forEach((g:any) => { 
      g.signups.forEach((s:any) => { 
          if(s.players.includes(user.id) && s.wins > 0) {
              winCount += s.wins;
              myWins.push(`Defeated: ${g.results.find((r:any)=>r.winnerLabel===s.label)?.loserLabel || 'Opponent'} (${g.title})`);
          }
      }); 
  });

  const isPhotosUser = users.find((u:any)=>u.id===user.id);
  // Get users photos for Gallery
  const [userPhotos, setUserPhotos] = useState<any[]>([]);
  useEffect(() => {
      if(readOnly) {
          getDocs(query(collection(db,'photos'), where('uploaderId','==',user.id))).then(s => setUserPhotos(s.docs.map(d=>d.data())));
      }
  }, [readOnly, user.id]);

  return (
    <div className="p-6 space-y-5 pt-10 relative">
      {!readOnly && <div className="absolute top-0 right-6 flex gap-2 z-10">
        <button onClick={()=>changeLang('en')} className={`px-6 py-2 rounded-full font-bold text-xl transition-colors shadow-sm ${user.language==='en'?'bg-[#0B3D2E] text-white ring-2 ring-offset-1 ring-[#0B3D2E]':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>EN</button>
        <button onClick={()=>changeLang('es')} className={`px-6 py-2 rounded-full font-bold text-xl transition-colors shadow-sm ${user.language==='es'?'bg-[#0B3D2E] text-white ring-2 ring-offset-1 ring-[#0B3D2E]':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>ES</button>
      </div>}

      <Card className="p-6 relative bg-white/95 backdrop-blur shadow-xl border-t-4 border-red-600 mt-6">
          <div className="flex flex-col items-center -mt-16 mb-4 relative">
               <div className="relative inline-block">
                   <img src={preview} className="w-72 h-72 rounded-full border-8 border-white shadow-2xl object-cover bg-gray-200" />
                   {uploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"/></div>}
                   {winCount > 0 && <div className="absolute -bottom-2 -left-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-black shadow border border-white flex items-center gap-1"><IconTrophy className="w-4 h-4"/> {winCount}</div>}
                   
                   {!readOnly && (
                       <label className="absolute bottom-4 right-4 bg-[#0B3D2E] text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-green-900 border-4 border-white active:scale-95 transition-transform">
                           <IconCamera className="w-8 h-8" />
                           <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange}/>
                       </label>
                   )}
               </div>

               <Input value={name} onChange={handleNameChange} disabled={readOnly} className={`text-center font-bold text-3xl mt-4 border-none bg-transparent p-1 text-gray-900 ${!readOnly && 'focus:bg-gray-50 focus:ring-1 focus:ring-gray-200'}`}/>
          </div>

          <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-1 mb-2 text-center">{ui.playerCard}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-[10px] uppercase font-bold text-gray-500">{ui.villageHunt}</div>
                      <div className="text-xl font-black text-green-600">{vProg}%</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-[10px] uppercase font-bold text-gray-500">{ui.houseHunt}</div>
                      <div className="text-xl font-black text-blue-600">{hProg}%</div>
                  </div>
              </div>

              <div className="flex justify-between items-center bg-yellow-50 p-3 rounded border border-yellow-100">
                  <span className="text-sm font-bold text-yellow-800">{ui.quizMastery}</span>
                  <span className="text-xl font-black text-yellow-600">{user.quizScore || 0} pts</span>
              </div>

              <div className="text-sm text-gray-800 flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="font-bold text-gray-600">{ui.votingHistory}:</span> 
                  <div className="flex items-center gap-2">
                      <span className="font-medium">{votedFor}</span>
                      {votedForImg && <img src={votedForImg} className="w-6 h-6 rounded-full object-cover"/>}
                  </div>
              </div>
              
              {myWins.length > 0 && (
                  <div className="bg-red-50 p-3 rounded border border-red-100">
                      <div className="text-xs font-bold text-red-800 uppercase mb-1 flex items-center gap-2"><IconTrophy className="w-4 h-4"/> {ui.trophies}</div>
                      <div className="flex flex-col gap-1">
                          {myWins.map((w, i) => <span key={i} className="text-xs font-bold text-red-700">• {w}</span>)}
                      </div>
                  </div>
              )}
          </div>
          
          {readOnly && user.hostComment && (
             <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl relative">
                 <div className="absolute -top-2 left-4 bg-yellow-100 px-2 py-0.5 rounded text-[10px] font-bold text-yellow-800 uppercase tracking-wide">Notes to Host</div>
                 <p className="text-sm italic text-gray-800 whitespace-pre-wrap leading-relaxed">"{user.hostComment}"</p>
             </div>
          )}
          
          {readOnly && userPhotos.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">User's Photos</h4>
                  <div className="grid grid-cols-4 gap-1">
                      {userPhotos.map((p,i) => <img key={i} src={p.url} className="w-full h-12 object-cover rounded"/>)}
                  </div>
              </div>
          )}
      </Card>

      {!readOnly && <Card className="p-6 bg-white/95">
          <h3 className="font-sweater text-xl text-red-700 mb-4 text-center">{ui.futureParties}</h3>
          <div className="space-y-3">
              <Input label={ui.email} value={fEmail} onChange={e=>setFEmail(e.target.value)} placeholder="santa@northpole.com" className="text-gray-900"/>
              <Input label={ui.phone} value={fPhone} onChange={e=>setFPhone(e.target.value)} placeholder="555-0199" className="text-gray-900"/>
              <Button onClick={handleSaveContact} disabled={uploading} className="w-full bg-[#0B3D2E] border-[#0B3D2E]">{ui.submit}</Button>
          </div>
      </Card>}
      
      <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black transition-transform active:scale-95">{readOnly ? 'Back to List' : 'Back to Party'}</button>
    </div>
  );
};

export const App = () => {
  const [fbU, setFbU] = useState<FirebaseUser|null>(null);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<ViewState>('HOME');
  const [load, setLoad] = useState(true);
  const [users, setUsers] = useState<any[]>([]); const [games, setGames] = useState<any[]>([]); const [photos, setPhotos] = useState<any[]>([]); const [hunts, setHunts] = useState<any[]>([]); const [polls, setPolls] = useState<any[]>([]);
  const [voteMode, setVoteMode] = useState('SWEATER');
  const [surprise, setSurprise] = useState<'VILLAGE'|'HOUSE'|null>(null);
  const [showAR, setShowAR] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const prevProg = useRef<any>({});
  
  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Lightbox State
  const [lightboxUrl, setLightboxUrl] = useState<string|null>(null);

  // Quiz State (Facts)
  const [factOrder, setFactOrder] = useState<number[]>([]);
  const [factIndex, setFactIndex] = useState(0);

  // Trivia Quiz State
  const [quizQ, setQuizQ] = useState<any>(null);
  const [quizFeedback, setQuizFeedback] = useState<'CORRECT'|'WRONG'|null>(null);
  const [note, setNote] = useState('');
  
  // Photo Download State
  const [zipping, setZipping] = useState(false);

  // Facts Logic: Shuffle once on mount, then cycle through
  useEffect(() => {
      const indices = Array.from({ length: CHRISTMAS_FACTS.en.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setFactOrder(indices);
      
      const interval = setInterval(() => {
          setFactIndex(prev => (prev + 1) % indices.length);
      }, 10000); 

      return () => clearInterval(interval);
  }, []);
  
  // PWA Installation Logic
  useEffect(() => {
      // 1. Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
          setIsStandalone(true);
      }

      // 2. Listen for 'beforeinstallprompt' (Android)
      const handler = (e: any) => {
          e.preventDefault();
          setInstallPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
      // If Android prompt is available, trigger it
      if (installPrompt) {
          installPrompt.prompt();
          installPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                  setInstallPrompt(null);
                  setIsStandalone(true);
              }
          });
      } else {
          // Otherwise show the manual instructions (mainly for iOS)
          setShowInstall(true);
      }
  };
  
  const nextQuestion = () => {
      const rawQ = TRADITIONAL_QUIZ[Math.floor(Math.random() * TRADITIONAL_QUIZ.length)];
      
      // Shuffle logic for answers
      const indices = rawQ.a.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      const shuffledQ = {
          ...rawQ,
          a: indices.map(i => rawQ.a[i]),
          aEs: indices.map(i => rawQ.aEs[i]),
          c: indices.indexOf(rawQ.c)
      };

      setQuizQ(shuffledQ);
      setQuizFeedback(null);
  };
  useEffect(() => { if(!quizQ) nextQuestion(); }, []);

  const handleQuizAnswer = async (idx: number) => {
      const isCorrect = idx === quizQ.c;
      setQuizFeedback(isCorrect ? 'CORRECT' : 'WRONG');
      if(isCorrect && user) {
          await updateDoc(doc(db, 'users', user.id), { quizScore: increment(1), quizTotalAttempted: increment(1) });
      } else if (user) {
          await updateDoc(doc(db, 'users', user.id), { quizTotalAttempted: increment(1) });
      }
      setTimeout(nextQuestion, 1500);
  };

  const downloadAllPhotos = async () => {
    if(photos.length === 0) return;
    setZipping(true);
    const zip = new JSZip();
    const folder = zip.folder("Christmas_Party_Photos");
    
    await Promise.all(photos.map(async (p, i) => {
        try {
            const res = await fetch(p.url);
            const blob = await res.blob();
            folder?.file(`photo_${i}_${p.uploaderId}.jpg`, blob);
        } catch (e) { console.error("Err downloading", e); }
    }));
    
    const content = await zip.generateAsync({type:"blob"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "Christmas_Party_Photos.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setZipping(false);
  };

  useEffect(() => { const u = onAuthStateChanged(auth, u => { if(u) setFbU(u); else signInAnonymously(auth); }); return ()=>u(); }, []);
  useEffect(() => { if(fbU) onSnapshot(doc(db,'users',fbU.uid), d => { setLoad(false); if(d.exists()) setUser({id:d.id,...d.data()}); }); }, [fbU]);
  useEffect(() => { const u=[onSnapshot(collection(db,'users'),s=>setUsers(s.docs.map(d=>({id:d.id,...d.data()})))),onSnapshot(collection(db,'games'),s=>setGames(s.docs.map(d=>({id:d.id,...d.data()})))),onSnapshot(collection(db,'polls'),s=>setPolls(s.docs.map(d=>({id:d.id,...d.data()})))),onSnapshot(collection(db,'hunt_items'),s=>setHunts(s.docs.map(d=>({id:d.id,...d.data()})))),onSnapshot(query(collection(db,'photos'),orderBy('timestamp','desc')),s=>setPhotos(s.docs.map(d=>({id:d.id,...d.data()}))))]; return ()=>u.forEach(f=>f()); }, []);
  
  useEffect(() => {
    if(!user || !hunts.length) return;
    ['VILLAGE','HOUSE'].forEach((t:any)=>{
       const items=hunts.filter((h:any)=>h.huntType===t); if(!items.length)return;
       const done=items.every((i:any)=>user.huntProgress?.[i.id]);
       const wasDone=items.every((i:any)=>prevProg.current?.[i.id]);
       if(done && !wasDone && Object.keys(prevProg.current).length>0) setSurprise(t);
    });
    prevProg.current = user.huntProgress||{};
  }, [user?.huntProgress, hunts]);

  if(load) return <div className="h-screen flex items-center justify-center text-red-600 font-bold animate-pulse">Loading...</div>;
  if(fbU && !user) return <CreateProfile fbUser={fbU} onJoin={setUser}/>;

  const userLang = (user.language || 'en') as 'en'|'es';
  const t = UI[userLang];
  
  const getMyProg = (type: string) => {
    const items = hunts.filter((h:any)=>h.huntType===type);
    if(!items.length) return {count:0, total:0, pct:0};
    const done = items.filter((i:any)=>user.huntProgress?.[i.id]).length;
    return {count:done, total:items.length, pct:Math.round((done/items.length)*100)};
  };
  
  const profileAction = (
      <button onClick={()=>setView('PROFILE')} className="ml-2">
          <img src={user.photo} className="w-16 h-16 rounded-full border-4 border-[#0B3D2E] object-cover shadow-sm"/>
      </button>
  );

  const TopBar = () => {
      let title: React.ReactNode = "";
      let action: React.ReactNode = null;
      let sub: React.ReactNode = null;

      if(view === 'HOME') {
          title = <div onClick={()=>setView('PROFILE')} className="flex gap-3 items-center"><img src={user.photo} className="w-16 h-16 rounded-full object-cover border-4 border-[#0B3D2E]"/><span className="font-bold text-4xl text-red-700 font-sweater">{t.home.hello}, {user.name.split(' ')[0]}</span></div>;
          action = <button onClick={()=>setView('ADMIN')}><IconLock className="w-8 h-8 text-gray-400"/></button>;
      } else if (view === 'GAMES') {
          title = t.games.title;
          action = profileAction;
      }
      else if (view === 'HUNT_VILLAGE' || view === 'HUNT_HOUSE') {
          title = view === 'HUNT_VILLAGE' ? t.profile.villageHunt : t.profile.houseHunt;
          const prog = getMyProg(view === 'HUNT_VILLAGE' ? 'VILLAGE' : 'HOUSE');
          const arBtn = view === 'HUNT_VILLAGE' ? <Button onClick={()=>setShowAR(true)} className="text-[10px] px-3 py-1 h-auto bg-red-700 text-white shadow-sm font-bold uppercase tracking-wider flex items-center gap-1"><IconSnow className="w-4 h-4"/> AR View</Button> : null;
          action = <div className="flex items-center gap-1">{arBtn}{profileAction}</div>;
          
          sub = (
            <div className="mt-1">
                <div className="flex justify-between items-end mb-1 text-xs font-bold text-green-800">
                    <span>Progress</span>
                    <span>{prog.count}/{prog.total} ({prog.pct}%)</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden"><div className="bg-green-600 h-full transition-all" style={{width:`${prog.pct}%`}}/></div>
            </div>
          );
      }
      else if (view === 'VOTING') { title = t.vote.title; action = profileAction; }
      else if (view === 'PHOTOS') { title = t.nav.PHOTOS; action = profileAction; }
      else if (view === 'ADMIN') title = t.nav.ADMIN;
      else if (view === 'PROFILE') title = t.nav.PROFILE;
      
      return <Header title={title} rightAction={action} subHeader={sub} />;
  }
  
  // Current Fact Logic
  const currentFact = CHRISTMAS_FACTS[userLang][factOrder[factIndex] || 0];

  return (
    <div className="h-screen flex flex-col font-sans max-w-3xl mx-auto shadow-2xl overflow-hidden relative bg-transparent">
      <div className="bg-white/90 w-full z-50 relative" style={{height:'env(safe-area-inset-top)'}}/>
      {surprise && <SurprisePopup type={surprise} onClose={()=>setSurprise(null)}/>}
      {showAR && <VillageAR onClose={()=>setShowAR(false)} />}
      {showInstall && <InstallModal onClose={()=>setShowInstall(false)} lang={userLang} />}
      
      {/* Lightbox Modal */}
      {lightboxUrl && (
          <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center animate-in fade-in cursor-pointer" onClick={() => setLightboxUrl(null)}>
              <button onClick={() => setLightboxUrl(null)} className="absolute top-4 right-4 text-white text-3xl font-bold p-4 z-[210] hover:text-gray-300">X</button>
              <img src={lightboxUrl} className="max-w-full max-h-screen object-contain" onClick={e => e.stopPropagation()} />
          </div>
      )}
      
      <TopBar />
      
      <main className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar flex flex-col pt-6 relative">
        {view==='HOME' && <SnowFall />}
        
        {view==='HOME'&&<div className="flex-1 flex flex-col space-y-6">
           <div className="text-center pt-2">
               <h1 className="text-6xl font-bold text-red-700 font-sweater drop-shadow-md text-white md:text-red-700 uppercase leading-none">{t.home.title}</h1>
               <ul className="space-y-3 font-sweater text-2xl mt-4 text-center list-none bg-white/60 p-4 rounded-xl backdrop-blur-sm text-gray-800">
                   {t.home.steps.map((s:string,i:number)=><li key={i}>{s}</li>)}
               </ul>
           </div>
           
           <Card className="bg-red-50 border-red-100 text-center p-4">
               <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Did You Know?</h3>
               <p className="font-serif italic text-lg text-gray-800">"{currentFact}"</p>
           </Card>

           <div className="mt-auto flex gap-2 pt-2 items-end">
               <div className="flex-1 h-10">
                   <Input value={note} onChange={e=>setNote(e.target.value)} placeholder={t.home.comment} className="h-full flex items-center" inputClassName="py-2 text-base h-full"/>
               </div>
               <Button onClick={async()=>{if(!note)return;await updateDoc(doc(db,'users',user.id),{hostComment:user.hostComment?user.hostComment+'\n'+note:note});setNote('');alert(userLang === 'en' ? "Sent!" : "¡Enviado!")}} className="h-10 bg-red-600 text-white w-24 rounded-xl flex items-center justify-center">{t.home.send}</Button>
           </div>
           {!isStandalone && <Button onClick={handleInstallClick} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg mt-4 hover:bg-black border border-gray-700">{t.install.title}</Button>}
        </div>}
        
        {view==='GAMES'&&<GamesScreen games={games} user={user} users={users} />}
        
        {(view==='HUNT_VILLAGE'||view==='HUNT_HOUSE')&&<div className="space-y-4 pb-32">
          {['Hidden Items','CHRISTMAS','DISNEY','TV & MOVIES','CREATURES','SCI-FI','ANIMALS','Questions'].map(cat=>{
              const items=hunts.filter((h:any)=>h.huntType===(view==='HUNT_VILLAGE'?'VILLAGE':'HOUSE')&&h.category===cat);
              if(!items.length)return null;
              const catDisp = (cat==='Hidden Items' && userLang==='es') ? 'Objetos Ocultos' : 
                              (cat==='Questions' && userLang==='es') ? 'Preguntas' :
                              (items[0].categoryEs && userLang==='es') ? items[0].categoryEs : cat;
              return <div key={cat} className="bg-white/80 p-3 rounded-xl backdrop-blur-sm">
                  <h3 className="text-lg font-black text-black uppercase mb-3 px-1 tracking-wider">{catDisp}</h3>
                  {items.map((h:any)=>(
                      <div key={h.id} className="p-2 mb-2 last:mb-0">
                          {h.type === 'TEXT' ? (
                              <div className="space-y-1">
                                  <label className="text-sm font-bold text-gray-800 block">{getTx(h, 'text', userLang)}</label>
                                  <input 
                                    type="text" 
                                    value={user.huntProgress[h.id] || ''} 
                                    onChange={(e)=>updateDoc(doc(db,'users',user.id),{[`huntProgress.${h.id}`]:e.target.value})}
                                    placeholder={userLang === 'en' ? "Type answer..." : "Escribe respuesta..."}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none bg-white text-gray-900 placeholder:text-gray-500"
                                  />
                              </div>
                          ) : (
                              <div className="flex gap-3 items-center cursor-pointer" onClick={()=>updateDoc(doc(db,'users',user.id),{[`huntProgress.${h.id}`]:!user.huntProgress[h.id]})}>
                                  <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors shadow-sm ${user.huntProgress[h.id]?'bg-green-600 border-green-600':'bg-white border-gray-300'}`}>
                                      {user.huntProgress[h.id] && <span className="text-white text-xs">✓</span>}
                                  </div>
                                  <span className={`text-sm font-medium ${user.huntProgress[h.id]?'line-through text-gray-400':'text-gray-800'}`}>
                                      {getTx(h, 'text', userLang)}
                                  </span>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          })}
          </div>}
        
        {view==='VOTING'&&<div className="space-y-4">
            <div className="flex gap-2 bg-white/50 p-1 rounded-xl backdrop-blur-sm">
                <button onClick={()=>setVoteMode('SWEATER')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${voteMode==='SWEATER'?'bg-red-600 text-white shadow-lg':'text-gray-600 hover:bg-white/50'}`}>Ugly Sweater</button>
                <button onClick={()=>setVoteMode('POLLS')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${voteMode==='POLLS'?'bg-red-600 text-white shadow-lg':'text-gray-600 hover:bg-white/50'}`}>Polls</button>
                <button onClick={()=>setVoteMode('QUIZ')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${voteMode==='QUIZ'?'bg-red-600 text-white shadow-lg':'text-gray-600 hover:bg-white/50'}`}>Trivia</button>
            </div>
            
            {voteMode==='SWEATER' && users.map((u:any)=><div key={u.id} className="flex items-center gap-3 bg-white p-2 rounded border shadow-sm"><img src={u.photo} className="w-10 h-10 rounded-full object-cover"/><div className="flex-1 font-bold text-gray-800">{u.name}</div>{user.hasVotedForId===u.id?<span className="text-green-600 font-bold px-3">{t.vote.voted}</span>:u.id!==user.id&&<Button onClick={()=>{const b=writeBatch(db);if(user.hasVotedForId)b.update(doc(db,'users',user.hasVotedForId),{votesReceived:increment(-1)});b.update(doc(db,'users',u.id),{votesReceived:increment(1)});b.update(doc(db,'users',user.id),{hasVotedForId:u.id});b.commit()}} className="text-xs bg-red-600 text-white">{t.vote.voteBtn}</Button>}</div>)}
            
            {voteMode==='POLLS' && polls.map((p:any)=>{
               const total = Object.keys(p.answers).length;
               const userVoted = p.answers[user.id];
               return <Card key={p.id} className="p-3"><h3 className="font-bold text-sm mb-2 text-gray-900">{getTx(p, 'question', userLang)}</h3>
               {p.options.map((o:any)=>{
                 const count = Object.values(p.answers).filter(a=>a===o.id).length;
                 const pct = total ? Math.round((count/total)*100) : 0;
                 const isSel = p.answers[user.id]===o.id;
                 return (
                   <div key={o.id} onClick={()=>updateDoc(doc(db,'polls',p.id),{[`answers.${user.id}`]:o.id})} className={`relative p-2 border rounded mb-1 text-xs cursor-pointer overflow-hidden ${isSel?'border-green-500 ring-1 ring-green-500':''}`}>
                     {userVoted && <div className="absolute left-0 top-0 bottom-0 bg-green-100 transition-all" style={{width:`${pct}%`}}/>}
                     <div className="relative flex justify-between text-gray-800"><span className={isSel?'font-bold':''}>{getTx(o, 'text', userLang)}</span>{userVoted && <span className="font-mono text-gray-500">{pct}%</span>}</div>
                   </div>
                 )
               })}
               </Card>
            })}

            {voteMode==='QUIZ' && quizQ && <Card className="bg-white p-6 text-center space-y-4 shadow-xl border-4 border-double border-red-100">
                 <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">Christmas Trivia</h3>
                 <div className="font-bold text-lg min-h-[60px] flex items-center justify-center text-gray-900">{getTx(quizQ, 'q', userLang)}</div>
                 <div className="grid grid-cols-1 gap-2">
                     {getTx(quizQ, 'a', userLang).map((ans:string, i:number) => (
                         <button 
                            key={i}
                            disabled={!!quizFeedback}
                            onClick={()=>handleQuizAnswer(i)}
                            className={`p-3 rounded-lg font-bold transition-all transform active:scale-95 ${quizFeedback ? (i===quizQ.c ? 'bg-green-600 text-white' : i===getTx(quizQ,'a',userLang).indexOf(ans) ? 'bg-red-200 text-gray-400' : 'bg-gray-100 text-gray-400') : 'bg-white border border-gray-200 shadow-sm text-gray-900 hover:bg-gray-50'}`}
                         >
                            {ans}
                         </button>
                     ))}
                 </div>
                 {quizFeedback && <div className={`font-black text-2xl animate-bounce ${quizFeedback==='CORRECT'?'text-green-600':'text-red-600'}`}>{quizFeedback === 'CORRECT' ? (userLang==='en'?'CORRECT!':'¡CORRECTO!') : (userLang==='en'?'WRONG!':'¡INCORRECTO!')}</div>}
                 <div className="text-xs text-gray-400 mt-2">Score: {user.quizScore || 0}</div>
            </Card>}
        </div>}
        
        {view==='ADMIN'&&<AdminDashboard users={users} polls={polls} hunts={hunts} games={games} onClose={()=>setView('HOME')}/>}
        {view==='PROFILE'&&<ProfileScreen user={user} users={users} games={games} hunts={hunts} onClose={()=>setView('HOME')}/>}
        {view==='PHOTOS'&&<div className="space-y-4"><Button onClick={downloadAllPhotos} disabled={zipping} className="w-full text-xs bg-red-600 text-white font-bold py-3 rounded shadow-md">{zipping ? (userLang==='en'?'Zipping...':'Comprimiendo...') : 'Download All'}</Button><div className="columns-2 gap-2 space-y-2">{photos.map((p:any)=><div key={p.id} className="break-inside-avoid relative rounded overflow-hidden cursor-pointer active:opacity-90 transition-opacity" onClick={()=>setLightboxUrl(p.url)}><img src={p.url} className="w-full"/></div>)}</div><label className="fixed bottom-24 right-6 bg-green-600 p-4 rounded-full shadow-xl cursor-pointer"><IconPlus className="w-6 h-6 text-white"/><input type="file" multiple accept="image/*" className="hidden" onChange={async e=>{if(e.target.files){for(const f of Array.from(e.target.files) as File[]){const r=firebaseStorage.ref(storage,`photos/${Date.now()}_${f.name}`);await firebaseStorage.uploadBytes(r,f);await addDoc(collection(db,'photos'),{url:await firebaseStorage.getDownloadURL(r),uploaderId:user.id,timestamp:Date.now()})}}}}/></label></div>}
      </main>
      <nav className="bg-white/90 backdrop-blur-md border-t p-2 pb-6 grid grid-cols-6 gap-1 text-[10px] font-bold text-gray-500 fixed bottom-0 w-full max-w-3xl z-[60]">
        {[ ['HOME',IconHome],['HUNT_VILLAGE',IconVillage],['HUNT_HOUSE',IconHouse],['VOTING',IconVote],['GAMES',IconGamepad],['PHOTOS',IconCamera] ].map(([v,I]:any)=><button key={v} onClick={()=>setView(v)} className={`flex flex-col items-center ${view===v?'text-green-800':''}`}><I className={`w-8 h-8 ${view===v?'stroke-2':'stroke-1'}`}/></button>)}
      </nav>
    </div>
  );
};
