

import React, { useState, useEffect, useRef } from 'react';
import { User, ViewState, HuntItem, Poll, Photo, Game } from './types';
import { IconHome, IconVillage, IconHouse, IconVote, IconCamera, IconLock, IconUpload, IconDownload, IconPlus, IconGamepad } from './components/Icons';
import { Button, Input, Card } from './components/UI';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, increment, deleteDoc, addDoc, query, orderBy, writeBatch, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import * as firebaseStorage from 'firebase/storage';

const firebaseConfig = { apiKey: "AIzaSyCJ_qmMSCWyFgLAEWy9YDCGAb5m2YUwV28", authDomain: "christmas-test---fruthbetold.firebaseapp.com", projectId: "christmas-test---fruthbetold", storageBucket: "christmas-test---fruthbetold.firebasestorage.app", messagingSenderId: "965407401986", appId: "1:965407401986:web:29473e6de9aa3626de1f1b", measurementId: "G-L8VSZWKPLG" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = firebaseStorage.getStorage(app);
const LOGO_URL = "https://static.wixstatic.com/media/d8edc3_6b8535321c8d4e35aa4351da27493b19~mv2.png/v1/fill/w_506,h_506,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/FBT%20-5%20(1-24-25).png";

const CHRISTMAS_FACTS = ["Jingle Bells was originally written for Thanksgiving.", "Santa has a postal code: H0H 0H0.", "Rudolph was a marketing gimmick.", "Silent Night is the most recorded Christmas song.", "The Statue of Liberty was a Christmas gift.", "Alabama was the first state to recognize Christmas.", "KFC is a Christmas tradition in Japan.", "Spiders are good luck on trees in Ukraine.", "Candy canes were invented to quiet choirboys.", "White Christmas is the best-selling single ever.", "The Grinch is the highest-grossing Christmas movie.", "Xmas dates back to the 1500s.", "Eggnog started as 'posset' in Britain.", "Coca-Cola helped shape Santa's image.", "Iceland has 13 Yule Lads.", "Franklin Pierce put the first tree in the White House.", "Tinsel was originally made of real silver.", "The Beatles held the Xmas #1 spot for 3 years.", "Giving presents comes from Saturnalia.", "Poinsettias are native to Mexico."];
const CHRISTMAS_QUIZ = [{q:"Best-selling Xmas song?",a:["White Christmas","Jingle Bells","Silent Night"],c:0}, {q:"Reindeer 'Thunder'?",a:["Donner","Blitzen","Comet"],c:0}, {q:"Naughty kids get?",a:["Coal","Onions","Nothing"],c:0}, {q:"Baby Jesus born?",a:["Bethlehem","Nazareth","Jerusalem"],c:0}, {q:"'Milk punch'?",a:["Eggnog","Baileys","Milk"],c:0}, {q:"Ghosts in Christmas Carol?",a:["4","3","2"],c:0}, {q:"Frosty came to life with?",a:["A Hat","A Scarf","Magic Snow"],c:0}, {q:"Started Xmas trees?",a:["Germany","USA","UK"],c:0}, {q:"Under mistletoe?",a:["Kiss","Hug","Dance"],c:0}, {q:"Santa used in ads?",a:["Coca-Cola","Pepsi","Macy's"],c:0}];

const INITIAL_HUNTS: HuntItem[] = [
  {id:'h1',text:'Gizmo (x2)',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h2',text:'Stripe',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h3',text:'Baby Grinch',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h4',text:'Mrs. Potts',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h5',text:'Falkor',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h6',text:'Panda',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h7',text:'Ladybug (x2)',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h8',text:'Spider',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h9',text:'Cockroach',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h10',text:'Caterpillar (x2)',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h11',text:'Tinkerbell (x2)',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h12',text:'Trump on a Shelf',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h13',text:'Elf on a Shelf (x3)',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h14',text:'Chewbacca',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h15',text:'Bigfoot',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h16',text:'Mario & Luigi',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h17',text:'Jack Skellington',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h18',text:'Crab',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h19',text:'Poison Dart Frog',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h20',text:'Koala',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h21',text:'Mickey Mouse',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h22',text:'Lizard',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h23',text:'Alligator Head',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},{id:'h24',text:'Jurassic Park Tree',type:'CHECKBOX',huntType:'HOUSE',category:'Hidden Items'},
  {id:'v1',text:'Nativity Set',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS'},{id:'v2',text:'Olaf (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS'},{id:'v3',text:'Jack Skellington',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS'},{id:'v4',text:'Grinch',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS'},{id:'v5',text:'Buddy the Elf',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS'},{id:'v6',text:'Snow & Flurry',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS'},{id:'v7',text:'Cindy Lou Who',type:'CHECKBOX',huntType:'VILLAGE',category:'CHRISTMAS'},
  {id:'v8',text:'Mickey Mouse',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v9',text:'Goofy',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v10',text:'Arial',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v11',text:'Cinderella',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v12',text:'Bambi',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v13',text:'Steamboat Willie',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v14',text:'Donald Duck',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v15',text:'Daisy Duck',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v16',text:'Captain Hook',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v17',text:'Lilo',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v18',text:'Stitch',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v19',text:'Iago',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},{id:'v20',text:'Chip',type:'CHECKBOX',huntType:'VILLAGE',category:'DISNEY'},
  {id:'v21',text:'Otis',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES'},{id:'v22',text:'Elmo',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES'},{id:'v23',text:'Big Bird',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES'},{id:'v24',text:'Bert & Ernie',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES'},{id:'v25',text:'Homer',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES'},{id:'v26',text:'Itchy & Scratchy',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES'},{id:'v27',text:'Bugs Bunny',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES'},{id:'v28',text:'Snoopy (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES'},{id:'v29',text:'Pikachu',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES'},{id:'v30',text:'Sam & Dean',type:'CHECKBOX',huntType:'VILLAGE',category:'TV & MOVIES'},
  {id:'v31',text:'Abominable Snowman',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES'},{id:'v32',text:'Bigfoot',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES'},{id:'v33',text:'Dragon',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES'},{id:'v34',text:'Unicorn',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES'},{id:'v35',text:'T-Rex',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES'},{id:'v36',text:'Velociraptor (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES'},{id:'v37',text:'Witch',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES'},{id:'v38',text:'Vampire',type:'CHECKBOX',huntType:'VILLAGE',category:'CREATURES'},
  {id:'v39',text:'Spiderman (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI'},{id:'v40',text:'Wolverine',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI'},{id:'v41',text:'Captain America (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI'},{id:'v42',text:'Batman',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI'},{id:'v43',text:'Darth Vader & Luke',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI'},{id:'v44',text:'Nude Sun Bathers (x4)',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI'},{id:'v45',text:'Waldo (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'SCI-FI'},
  {id:'v46',text:'Raccoons (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v47',text:'Gorilla (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v48',text:'Grizzly Bear (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v49',text:'Turkey (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v50',text:'Polar Bear',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v51',text:'Bald Eagle (x3)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v52',text:'Defecating Dog',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v53',text:'Monkey (x2)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},
  // EXPANDED LIST TO REACH 68 (15 placeholders)
  {id:'v54',text:'White Wolf',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v55',text:'Fox',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v56',text:'Black Panther',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v57',text:'Rhino',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v58',text:'Camel',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v59',text:'Penguin',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v60',text:'Lion',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v61',text:'Tiger',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v62',text:'Elephant',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v63',text:'Giraffe',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v64',text:'Zebra',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v65',text:'Hippo',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v66',text:'Kangaroo',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v67',text:'Koala (Village)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'},{id:'v68',text:'Panda (Village)',type:'CHECKBOX',huntType:'VILLAGE',category:'ANIMALS'}
];

const INITIAL_POLLS: Poll[] = [
  {id:'p1',question:'The "Die Hard" Dilemma: Is Die Hard actually a Christmas movie?',type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Yes, 100%. It happens on Christmas Eve!'},{id:'b',text:'No, it is an action movie that happens to take place in December.'},{id:'c',text:'It’s a movie I watch at Christmas, but not a "Christmas Movie."'}]},
  {id:'p2',question:'The Music Timeline: When is it socially acceptable to start playing Christmas music?',type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'As soon as Halloween ends (Nov 1st).'},{id:'b',text:'Not until after Thanksgiving.'},{id:'c',text:'December 1st strictly.'},{id:'d',text:'Only the week of Christmas.'}]},
  {id:'p3',question:'The Great Tree Debate: What is the superior Christmas Tree situation?',type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Real tree (Need the smell!).'},{id:'b',text:'Artificial tree (Need the convenience!).'},{id:'c',text:'A small tabletop plant/Charlie Brown tree.'},{id:'d',text:'No tree for me.'}]},
  {id:'p4',question:'The Eggnog Stance: What are your feelings on Eggnog?',type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'I love it!'},{id:'b',text:'Only if it\'s spiked with something strong.'},{id:'c',text:'Absolutely disgusting.'},{id:'d',text:'I’ve actually never tried it.'}]},
  {id:'p5',question:'Cookie Contenders: If you could only eat one holiday treat for the rest of your life, what would it be?',type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Gingerbread Men.'},{id:'b',text:'Frosted Sugar Cookies.'},{id:'c',text:'Peppermint Bark.'},{id:'d',text:'Fudge.'}]},
  {id:'p6',question:'The Dinner Main Event: What is the centerpiece of the Christmas Dinner?',type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Ham.'},{id:'b',text:'Turkey (Round 2 after Thanksgiving).'},{id:'c',text:'Roast Beef / Prime Rib.'},{id:'d',text:'Tamales / Lasagna / Something non-traditional.'}]},
  {id:'p7',question:'The Opening Ceremony: When does your family open the "Main" presents?',type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Christmas Eve.'},{id:'b',text:'Christmas Morning.'},{id:'c',text:'We open one on Eve, the rest in the morning.'},{id:'d',text:'Whenever everyone finally wakes up/arrives.'}]},
  {id:'p8',question:'The Lighting Aesthetic: When it comes to Christmas lights on the tree or house, which side are you on?',type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'Classic Warm White only (Keep it elegant).'},{id:'b',text:'Multi-Colored (Nostalgic and bright).'},{id:'c',text:'Cool White / Blue LED (Icy winter vibes).'},{id:'d',text:'Doesn\'t matter, as long as they are blinking/flashing.'}]},
  {id:'p9',question:'Shopping Habits: What kind of holiday shopper are you?',type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'The Early Bird (Done by December 1st).'},{id:'b',text:'The Steady Pacer (Buy a little bit each week).'},{id:'c',text:'The Panic Buyer (Christmas Eve dash).'},{id:'d',text:'The Gift Card Giver (I avoid shopping entirely).'}]},
  {id:'p10',question:'The Cleanup: When do the decorations come down?',type:'MULTIPLE_CHOICE',isActive:true,answers:{},options:[{id:'a',text:'December 26th (It’s over immediately).'},{id:'b',text:'New Year\'s Day.'},{id:'c',text:'After the Epiphany (Jan 6th).'},{id:'d',text:'Sometime in February... or March.'}]},
];
const INITIAL_GAMES: Game[] = [{id:'g1',title:'Corn Hole',type:'TEAM',signups:[],results:[]}, {id:'g2',title:'Beer Pong',type:'TEAM',signups:[],results:[]}, {id:'g3',title:'Jenga',type:'TEAM',signups:[],results:[]}, {id:'g4',title:'Connect 4',type:'TEAM',signups:[],results:[]}];

const UI = {
  en: { nav:{HOME:'Home',HUNT_VILLAGE:'Village',HUNT_HOUSE:'House',VOTING:'Vote',GAMES:'Games',PHOTOS:'Photos',ADMIN:'Admin',PROFILE:'Profile'}, home:{title:"CHRISTMAS PARTY 2025",hello:"Hello",partyTime:"PARTY TIME",send:"Send",comment:"Leave a note...",steps:["Grab a drink","Grab some food","Do a scavenger hunt","Play some games","Snap a photo at the photobooth","And most of all have a great time!"]}, games:{title:"Party Games",signup:"Sign Up",winner:"Winner"}, vote:{title:"Voting Station",voteBtn:"Vote",voted:"Voted"}, admin:{dashboard:"Dashboard",restart:"Restart Party",exit:"Exit"}, welcome:{join:"Join Party"} },
  es: { nav:{HOME:'Inicio',HUNT_VILLAGE:'Villa',HUNT_HOUSE:'Casa',VOTING:'Votar',GAMES:'Juegos',PHOTOS:'Fotos',ADMIN:'Admin',PROFILE:'Perfil'}, home:{title:"FIESTA 2025",hello:"Hola",partyTime:"HORA DE FIESTA",send:"Enviar",comment:"Nota...",steps:["Bebida","Comida","Búsqueda","Juegos","Fotos","¡Diviértete!"]}, games:{title:"Juegos",signup:"Unirse",winner:"Ganador"}, vote:{title:"Votación",voteBtn:"Votar",voted:"Votado"}, admin:{dashboard:"Panel",restart:"Reiniciar",exit:"Salir"}, welcome:{join:"Unirse"} }
};

const getLoc = (o:any,k:string,l:string) => (l==='es' && o[`${k}Es`]) ? o[`${k}Es`] : o[k];
const fileToBlob = (f:File) => f;

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

const CreateProfile = ({ fbUser, onJoin }: { fbUser: FirebaseUser, onJoin: (u: any) => void }) => {
  const [name, setName] = useState(''); const [photo, setPhoto] = useState<File|null>(null); const [prev, setPrev] = useState<string|null>(null); const [load, setLoad] = useState(false);
  const join = async (lang:'en'|'es') => {
    if(!name || !photo || !name.trim().includes(' ')) return alert("First and Last Name Required!");
    setLoad(true);
    try {
      const sRef = firebaseStorage.ref(storage, `profiles/${fbUser.uid}.jpg`);
      await firebaseStorage.uploadBytes(sRef, photo);
      const url = await firebaseStorage.getDownloadURL(sRef);
      const uData = { id: fbUser.uid, name, photo: url, language: lang, timestamp: Date.now(), votesReceived: 0, huntProgress: {}, hostComment: '' };
      await setDoc(doc(db, 'users', fbUser.uid), uData);
      const g = await getDoc(doc(db,'games','g1'));
      if(!g.exists()){ const b = writeBatch(db); INITIAL_GAMES.forEach(x=>b.set(doc(db,'games',x.id),x)); INITIAL_POLLS.forEach(x=>b.set(doc(db,'polls',x.id),x)); INITIAL_HUNTS.forEach(x=>b.set(doc(db,'hunt_items',x.id),x)); await b.commit(); }
      onJoin(uData);
    } catch(e:any) { alert(e.message); setLoad(false); }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto bg-white">
      <div className="flex items-center justify-center gap-4"><img src={LOGO_URL} className="w-24 h-24 object-contain"/><div className="text-left"><h1 className="text-5xl font-sweater font-bold text-red-700 leading-none">MERRY<br/>CHRISTMAS</h1><p className="text-green-700 font-bold text-xs tracking-widest mt-1">FRUTH BE TOLD APP</p></div></div>
      <Card className="w-full space-y-6 border-2 border-green-500 shadow-xl bg-white">
        <div className="text-left"><label className="block font-bold text-green-800 text-center uppercase mb-2">First and Last Name</label><input value={name} onChange={e=>setName(e.target.value.replace(/\b\w/g, c=>c.toUpperCase()))} placeholder="Santa Claus" className="w-full p-4 border-4 border-green-600 rounded-xl text-center text-2xl font-bold bg-white text-black"/></div>
        <label className="block w-48 h-48 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-4 border-dashed border-green-400 cursor-pointer overflow-hidden relative shadow-inner">{prev ? <img src={prev} className="w-full h-full object-cover"/> : <div className="flex flex-col items-center text-gray-400"><IconCamera className="w-12 h-12"/><span className="text-xs font-bold uppercase mt-1">Tap Upload</span></div>}<input type="file" onChange={e=>{if(e.target.files?.[0]){setPhoto(e.target.files[0]);setPrev(URL.createObjectURL(e.target.files[0]))}}} className="hidden" accept="image/*"/></label>
        <div className="flex gap-4"><Button onClick={()=>join('en')} disabled={load} className="flex-1 bg-red-900 active:bg-green-700 text-white h-14 rounded-xl text-lg">{load?'...':'Join English'}</Button><Button onClick={()=>join('es')} disabled={load} className="flex-1 bg-red-900 active:bg-green-700 text-white h-14 rounded-xl text-lg">Unirse Español</Button></div>
      </Card>
    </div>
  );
};

const GameCard = ({ g, user, users, join, win, leave }: any) => {
  const [c1, c2] = g.signups.slice(0,2); const [pid, setPid] = useState(''); const [showP, setShowP] = useState(false); const [hist, setHist] = useState(false);
  return (
    <Card className="border-2 border-red-100 p-0 overflow-hidden">
       <div className="bg-red-600 text-white p-2 font-bold flex justify-between items-center"><span>{g.title}</span><div className="flex gap-2"><button onClick={()=>setHist(!hist)} className="text-xs bg-red-800 px-2 py-1 rounded">📜 History</button><span className="text-xs bg-red-800 px-2 py-1 rounded">{g.signups.length} Teams</span></div></div>
       {hist ? <div className="p-4 bg-red-50"><h4 className="font-bold text-center mb-2 text-red-700">History</h4>{g.results.slice().reverse().map((r:any)=><div key={r.id} className="text-xs border-b border-red-200 py-1"><span className="text-green-700 font-bold">{r.winnerLabel}</span> def. {r.loserLabel}</div>)}<Button onClick={()=>setHist(false)} className="w-full mt-2 text-xs bg-red-200 text-red-800">Close</Button></div> : 
       <><div className="p-2 bg-red-50 flex gap-2">{[c1,c2].map((p:any,i:number)=>{const opp=i===0?c2:c1;return<div key={i} className={`flex-1 bg-white border-2 rounded p-2 flex flex-col items-center min-h-[100px] relative ${p?(i===0?'border-green-500':'border-blue-500'):'border-dashed border-gray-300'}`}>{p?(<>{p.wins>0 && <div className="absolute top-0 right-0 bg-yellow-400 text-[10px] px-1 font-bold">🏆 {p.wins}</div>}<div className="flex -space-x-2">{p.players.map((uid:string)=><img key={uid} src={users.find((u:any)=>u.id===uid)?.photo} className="w-6 h-6 rounded-full border border-white object-cover"/>)}</div><div className="font-bold text-[10px] text-center my-1">{p.label}</div>{opp && <Button onClick={()=>win(g.id,p,opp)} className="w-full bg-red-600 hover:bg-green-600 text-white text-[10px] py-1 h-6">Win</Button>}<button onClick={()=>leave(g.id,p.id)} className="absolute top-0 left-1 text-red-500 text-xs font-bold">x</button></>):<span className="text-xs text-gray-400 mt-4">Waiting...</span>}</div>})}</div><div className="p-2 flex flex-col gap-1">{showP ? <select className="text-xs p-1 border bg-white text-black rounded" value={pid} onChange={e=>setPid(e.target.value)}><option value="">Select Partner...</option>{users.filter((u:any)=>u.id!==user.id).map((u:any)=><option key={u.id} value={u.id}>{u.name}</option>)}</select> : <Button variant="outline" onClick={()=>setShowP(true)} className="text-[10px] py-1 text-gray-400">+ Partner</Button>}<Button onClick={()=>{join(g.id,pid||null);setPid('');setShowP(false)}} className="w-full bg-black text-white text-xs">Sign Up</Button></div>{g.signups.slice(2).map((s:any,i:number)=><div key={s.id} className="flex justify-between text-xs p-1 bg-gray-50 border rounded mx-2 mb-1"><span className="font-bold text-gray-400 mr-2">{i+1}</span><span>{s.label}</span>{s.players.includes(user.id)&&<button onClick={()=>leave(g.id,s.id)} className="text-red-500 ml-auto">x</button>}</div>)}</>}
    </Card>
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
    await updateDoc(doc(db,'games',gid), { signups:[{...w,wins:w.wins+1},...g.signups.filter((s:any)=>s.id!==l.id && s.id!==w.id)], results:[...g.results,{id:`r_${Date.now()}`,winnerLabel:w.label,loserLabel:l.label,timestamp:Date.now()}] });
  };
  const leave = async (gid:string, sid:string) => updateDoc(doc(db,'games',gid), { signups:games.find((x:any)=>x.id===gid).signups.filter((s:any)=>s.id!==sid) });
  return (
    <div className="space-y-6 pb-24"><h1 className="text-3xl text-red-700 text-center font-sweater">Party Games</h1>{games.map((g:any)=><GameCard key={g.id} g={g} user={user} users={users} join={join} win={win} leave={leave}/>)}</div>
  );
};

const AdminDashboard = ({ users, polls, hunts, onClose }: any) => {
  const [pass, setPass] = useState(''); const [auth, setAuth] = useState(false); const [tab, setTab] = useState('USERS'); const [pq, spq] = useState(''); const [po, spo] = useState('');
  const getProg = (u:User, type:string) => { const items = hunts.filter((h:any)=>h.huntType===type); if(!items.length) return 0; const done = items.filter((i:any)=>u.huntProgress?.[i.id]).length; return Math.round((done/items.length)*100); };
  const handleClearAll = async () => {
    if(prompt("Type 'kokomo' to WIPE ALL HISTORY & USERS:") !== 'kokomo') return alert("Wrong Password");
    const b = writeBatch(db);
    users.forEach((u:any) => b.delete(doc(db,'users',u.id)));
    // Reset Games
    const gamesSnaps = await import('firebase/firestore').then(m=>m.getDocs(collection(db,'games')));
    gamesSnaps.forEach(g=>b.update(doc(db,'games',g.id),{signups:[],results:[]}));
    // Delete Photos
    const photoSnaps = await import('firebase/firestore').then(m=>m.getDocs(collection(db,'photos')));
    photoSnaps.forEach(p=>b.delete(doc(db,'photos',p.id)));
    // Reset Poll Answers
    polls.forEach((p:any)=>b.update(doc(db,'polls',p.id),{answers:{}}));
    await b.commit();
    alert("All History & Users Cleared.");
    window.location.reload();
  };

  if(!auth) return <div className="p-6 pt-20 space-y-4 max-w-sm mx-auto"><h1 className="text-4xl font-sweater text-red-700 mb-4 text-center">Admin Login</h1><Input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password"/><Button onClick={()=>pass==='kokomo'?setAuth(true):alert('Wrong')} className="bg-red-600 text-white mt-4 w-full">Login</Button><Button variant="outline" onClick={onClose} className="mt-2 w-full">Exit</Button></div>;
  return (
    <div className="pb-20 space-y-6">
      <div className="flex justify-between items-center bg-gray-100 p-4 sticky top-0 z-10"><h1 className="text-xl font-sweater">Admin</h1><Button onClick={onClose} variant="outline" className="text-xs">Exit</Button></div>
      <div className="flex gap-2 overflow-x-auto border-b pb-2 px-2">{['USERS','PROGRESS','GUESTBOOK','MANAGE DATA'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 text-xs font-bold rounded ${tab===t?'bg-red-600 text-white':'bg-gray-200'}`}>{t}</button>)}</div>
      {tab==='USERS' && <div className="space-y-1">{users.map((u:any)=><div key={u.id} className="flex justify-between items-center p-2 border bg-white rounded"><div className="flex items-center gap-3"><img src={u.photo} className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"/><span className="font-bold text-sm">{u.name}</span></div><button onClick={()=>deleteDoc(doc(db,'users',u.id))} className="text-red-500 text-xs border border-red-200 px-2 py-1 rounded">Delete</button></div>)}</div>}
      {tab==='PROGRESS' && <div className="space-y-4">
         <div className="bg-gray-50 p-2 rounded"><h3 className="font-bold text-xs text-center mb-2">UGLY SWEATER LEADERBOARD</h3>{users.sort((a:any,b:any)=>b.votesReceived-a.votesReceived).slice(0,5).map((u:any,i:number)=><div key={u.id} className="flex justify-between text-xs p-1 border-b"><span className="font-bold">{i+1}. {u.name}</span><span>{u.votesReceived} Votes</span></div>)}</div>
         <div className="space-y-1"><div className="grid grid-cols-[1fr_1fr_1fr] text-xs font-bold px-2"><span>User</span><span className="text-center">Village</span><span className="text-center">House</span></div>{users.map((u:any)=><div key={u.id} className="grid grid-cols-[1fr_1fr_1fr] items-center p-2 border-b bg-white"><div className="flex gap-2 items-center"><img src={u.photo} className="w-6 h-6 rounded-full"/><span className="text-xs font-bold truncate">{u.name}</span></div><div className="px-2"><div className="w-full bg-gray-200 h-2 rounded"><div className="bg-green-500 h-2 rounded" style={{width:`${getProg(u,'VILLAGE')}%`}}/></div><div className="text-[10px] text-center">{getProg(u,'VILLAGE')}%</div></div><div className="px-2"><div className="w-full bg-gray-200 h-2 rounded"><div className="bg-blue-500 h-2 rounded" style={{width:`${getProg(u,'HOUSE')}%`}}/></div><div className="text-[10px] text-center">{getProg(u,'HOUSE')}%</div></div></div>)}</div>
      </div>}
      {tab==='GUESTBOOK' && <div className="space-y-2">{users.filter((u:any)=>u.hostComment).map((u:any)=><div key={u.id} className="p-3 border bg-white rounded"><div className="flex gap-2 mb-1"><img src={u.photo} className="w-6 h-6 rounded-full"/><span className="font-bold text-sm">{u.name}</span></div><p className="text-sm italic">"{u.hostComment}"</p></div>)}</div>}
      {tab==='MANAGE DATA' && <div className="p-4 space-y-6">
         <div className="bg-white p-3 rounded border"><h3 className="font-bold text-sm mb-2">Add New Poll</h3><Input value={pq} onChange={e=>spq(e.target.value)} placeholder="Question"/><Input value={po} onChange={e=>spo(e.target.value)} placeholder="Options (comma separated)" className="mt-2"/><Button onClick={()=>{const options=po.split(',').map((t,i)=>({id:i.toString(),text:t.trim()}));addDoc(collection(db,'polls'),{question:pq,type:'MULTIPLE_CHOICE',isActive:true,answers:{},options});spq('');spo('')}} className="bg-green-600 text-white w-full mt-2">Add Poll</Button></div>
         <div className="space-y-2"><Button onClick={()=>{if(prompt("Pass?")==='kokomo'){const b=writeBatch(db);INITIAL_HUNTS.forEach(x=>b.set(doc(db,'hunt_items',x.id),x));INITIAL_POLLS.forEach(x=>b.set(doc(db,'polls',x.id),x));b.commit();alert("Reseeded!")}}} className="bg-blue-600 text-white text-xs w-full py-3">RE-SEED DATA (Fix Missing)</Button><Button onClick={handleClearAll} className="bg-red-600 text-white text-xs w-full py-3 font-bold">CLEAR ALL HISTORY & USERS</Button></div>
      </div>}
    </div>
  );
};

const ProfileScreen = ({ user, onClose }: { user: User, onClose: () => void }) => {
  const [name, setName] = useState(user.name);
  const [lang, setLang] = useState(user.language);

  const handleSave = async () => {
     await updateDoc(doc(db, 'users', user.id), { name, language: lang });
     onClose();
  };

  return (
    <div className="p-6 space-y-6 pt-20">
      <h1 className="text-3xl font-bold text-center font-sweater text-red-700">Profile</h1>
      <div className="flex justify-center">
        <img src={user.photo} className="w-32 h-32 rounded-full border-4 border-green-600 object-cover" />
      </div>
      <div className="space-y-4">
        <div><label className="block font-bold text-sm text-gray-500 mb-1">Name</label><Input value={name} onChange={e => setName(e.target.value)} /></div>
        <div><label className="block font-bold text-sm text-gray-500 mb-1">Language</label><div className="flex gap-2"><Button variant={lang === 'en' ? 'primary' : 'outline'} onClick={() => setLang('en')} className="flex-1">English</Button><Button variant={lang === 'es' ? 'primary' : 'outline'} onClick={() => setLang('es')} className="flex-1">Español</Button></div></div>
        <Button onClick={handleSave} className="w-full">Save Changes</Button>
        <Button onClick={onClose} variant="ghost" className="w-full">Cancel</Button>
      </div>
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
  const prevProg = useRef<any>({});
  const [factIdx, setFactIdx] = useState(0);
  const [quiz, setQuiz] = useState(0); const [qAns, setQAns] = useState<number|null>(null);
  const [note, setNote] = useState('');

  useEffect(() => { const i=setInterval(()=>setFactIdx(i=>Math.floor(Math.random()*CHRISTMAS_FACTS.length)),10000); return ()=>clearInterval(i); }, []);
  const handleQuiz = (idx:number) => { setQAns(idx); setTimeout(()=>{ setQAns(null); setQuiz(q=>Math.floor(Math.random()*CHRISTMAS_QUIZ.length)); }, 2000); };

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

  const t = UI[user.language as 'en'||'en'];
  const getMyProg = (type: string) => {
    const items = hunts.filter((h:any)=>h.huntType===type);
    if(!items.length) return {count:0, total:0, pct:0};
    const done = items.filter((i:any)=>user.huntProgress?.[i.id]).length;
    return {count:done, total:items.length, pct:Math.round((done/items.length)*100)};
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans max-w-3xl mx-auto shadow-2xl overflow-hidden relative">
      <div className="bg-white w-full" style={{height:'env(safe-area-inset-top)'}}/>
      {surprise && <SurprisePopup type={surprise} onClose={()=>setSurprise(null)}/>}
      {view==='HOME'&&<div className="bg-white p-4 flex justify-between items-center z-20 border-b shadow-sm"><div onClick={()=>setView('PROFILE')} className="flex gap-3 items-center"><img src={user.photo} className="w-16 h-16 rounded-full object-cover border-2 border-red-500"/><span className="font-bold text-3xl text-red-700 font-sweater">Hello, {user.name.split(' ')[0]}</span></div><button onClick={()=>setView('ADMIN')}><IconLock className="w-6 h-6 text-gray-300"/></button></div>}
      <main className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar flex flex-col">
        {view==='HOME'&&<div className="flex-1 flex flex-col space-y-6">
           <Card className="bg-red-50 border-red-100 text-center p-4"><h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Did You Know?</h3><p className="font-serif italic text-lg">"{CHRISTMAS_FACTS[factIdx]}"</p></Card>
           <div className="text-center pt-4"><h1 className="text-4xl font-bold text-red-700 font-sweater">{t.home.title}</h1><ul className="space-y-3 font-medium text-lg mt-4 text-center list-none">{t.home.steps.map((s:string,i:number)=><li key={i}>{s}</li>)}</ul></div>
           <Card className="bg-green-50 border-green-100 p-4 scale-90"><h3 className="text-center font-bold text-green-800 mb-2">🎄 Quiz Time</h3><p className="text-sm font-bold mb-3 text-center">{CHRISTMAS_QUIZ[quiz].q}</p><div className="space-y-2">{CHRISTMAS_QUIZ[quiz].a.map((ans,i)=><button key={i} onClick={()=>handleQuiz(i)} className={`w-full text-left p-2 rounded text-sm font-bold transition-colors ${qAns!==null?(i===CHRISTMAS_QUIZ[quiz].c?'bg-green-500 text-white':qAns===i?'bg-red-500 text-white':'bg-white'):'bg-white hover:bg-green-100'}`}>{ans}</button>)}</div></Card>
           <div className="mt-auto flex gap-2 pt-6 items-end"><Input value={note} onChange={e=>setNote(e.target.value)} placeholder={t.home.comment} className="flex-1"/><Button onClick={async()=>{if(!note)return;await updateDoc(doc(db,'users',user.id),{hostComment:user.hostComment?user.hostComment+'\n'+note:note});setNote('');alert("Sent!")}} className="h-14 bg-red-600 text-white w-24 rounded-xl">Send</Button></div>
        </div>}
        {view==='GAMES'&&<GamesScreen games={games} user={user} users={users} />}
        {(view==='HUNT_VILLAGE'||view==='HUNT_HOUSE')&&<div className="space-y-4">
          <div className="sticky top-0 bg-gray-50 z-20 pb-2 border-b mb-4">
            <div className="flex justify-between items-end mb-1">
              <div className="flex items-center gap-2"><h1 className="text-2xl font-bold font-sweater text-red-700">{view==='HUNT_VILLAGE'?'Village':'House'} Hunt</h1>{view==='HUNT_VILLAGE'&&<Button onClick={()=>alert("AR Coming Soon!")} className="text-xs px-2 py-1 h-auto bg-red-700 text-white">AR</Button>}</div>
              <span className="font-mono font-bold text-green-700">{getMyProg(view==='HUNT_VILLAGE'?'VILLAGE':'HOUSE').count}/{getMyProg(view==='HUNT_VILLAGE'?'VILLAGE':'HOUSE').total} ({getMyProg(view==='HUNT_VILLAGE'?'VILLAGE':'HOUSE').pct}%)</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden"><div className="bg-green-600 h-full transition-all" style={{width:`${getMyProg(view==='HUNT_VILLAGE'?'VILLAGE':'HOUSE').pct}%`}}/></div>
          </div>
          {['Hidden Items','CHRISTMAS','DISNEY','TV & MOVIES','CREATURES','SCI-FI','ANIMALS'].map(cat=>{const items=hunts.filter((h:any)=>h.huntType===(view==='HUNT_VILLAGE'?'VILLAGE':'HOUSE')&&h.category===cat);if(!items.length)return null;return <div key={cat}><h3 className="font-bold text-gray-500 text-xs uppercase mb-1 mt-4">{cat}</h3>{items.map((h:any)=><Card key={h.id} className="p-2 flex gap-3 mb-1 items-center cursor-pointer hover:bg-gray-50" onClick={()=>updateDoc(doc(db,'users',user.id),{[`huntProgress.${h.id}`]:!user.huntProgress[h.id]})}><div className={`w-6 h-6 border-2 rounded flex items-center justify-center ${user.huntProgress[h.id]?'bg-green-600 border-green-600':'border-gray-400'}`}>{user.huntProgress[h.id] && <span className="text-white text-xs">✓</span>}</div><span className={`text-sm font-medium ${user.huntProgress[h.id]?'line-through text-gray-400':''}`}>{h.text}</span></Card>)}</div>})}</div>}
        {view==='VOTING'&&<div className="space-y-4"><h1 className="text-2xl text-red-700 text-center font-sweater">{t.vote.title}</h1><div className="flex gap-2 bg-gray-200 p-1 rounded"><button onClick={()=>setVoteMode('SWEATER')} className={`flex-1 py-1 text-xs font-bold rounded ${voteMode==='SWEATER'?'bg-white shadow':''}`}>Sweater</button><button onClick={()=>setVoteMode('POLLS')} className={`flex-1 py-1 text-xs font-bold rounded ${voteMode==='POLLS'?'bg-white shadow':''}`}>Polls</button></div>
        {voteMode==='SWEATER'?users.map((u:any)=><div key={u.id} className="flex items-center gap-3 bg-white p-2 rounded border"><img src={u.photo} className="w-10 h-10 rounded-full object-cover"/><div className="flex-1 font-bold">{u.name}</div>{user.hasVotedForId===u.id?<span className="text-green-600 font-bold px-3">{t.vote.voted}</span>:u.id!==user.id&&<Button onClick={()=>{const b=writeBatch(db);if(user.hasVotedForId)b.update(doc(db,'users',user.hasVotedForId),{votesReceived:increment(-1)});b.update(doc(db,'users',u.id),{votesReceived:increment(1)});b.update(doc(db,'users',user.id),{hasVotedForId:u.id});b.commit()}} className="text-xs bg-red-600 text-white">{t.vote.voteBtn}</Button>}</div>):polls.map((p:any)=>{
           const total = Object.keys(p.answers).length;
           return <Card key={p.id} className="p-3"><h3 className="font-bold text-sm mb-2">{p.question}</h3>
           {p.options.map((o:any)=>{
             const count = Object.values(p.answers).filter(a=>a===o.id).length;
             const pct = total ? Math.round((count/total)*100) : 0;
             const isSel = p.answers[user.id]===o.id;
             return (
               <div key={o.id} onClick={()=>updateDoc(doc(db,'polls',p.id),{[`answers.${user.id}`]:o.id})} className={`relative p-2 border rounded mb-1 text-xs cursor-pointer overflow-hidden ${isSel?'border-green-500 ring-1 ring-green-500':''}`}>
                 <div className="absolute left-0 top-0 bottom-0 bg-green-100 transition-all" style={{width:`${pct}%`}}/>
                 <div className="relative flex justify-between"><span className={isSel?'font-bold':''}>{o.text}</span><span className="font-mono text-gray-500">{pct}%</span></div>
               </div>
             )
           })}
           </Card>
        })}</div>}
        {view==='ADMIN'&&<AdminDashboard users={users} polls={polls} hunts={hunts} onClose={()=>setView('HOME')}/>}
        {view==='PROFILE'&&<ProfileScreen user={user} onClose={()=>setView('HOME')}/>}
        {view==='PHOTOS'&&<div className="space-y-4"><h1 className="text-center text-3xl text-red-700 font-sweater">Photos</h1><Button onClick={()=>{photos.forEach((p:any)=>{const a=document.createElement('a');a.href=p.url;a.download='photo';a.click()})}} className="w-full text-xs bg-red-600 text-white font-bold py-3 rounded shadow-md">Download All</Button><div className="columns-2 gap-2 space-y-2">{photos.map((p:any)=><div key={p.id} className="break-inside-avoid relative rounded overflow-hidden"><img src={p.url} className="w-full"/><a href={p.url} download className="absolute bottom-1 right-1 bg-white p-1 rounded-full"><IconDownload className="w-4 h-4"/></a></div>)}</div><label className="fixed bottom-24 right-6 bg-green-600 p-4 rounded-full shadow-xl cursor-pointer"><IconPlus className="w-6 h-6 text-white"/><input type="file" multiple accept="image/*" className="hidden" onChange={async e=>{if(e.target.files){for(const f of Array.from(e.target.files)){const r=firebaseStorage.ref(storage,`photos/${Date.now()}_${f.name}`);await firebaseStorage.uploadBytes(r,f);await addDoc(collection(db,'photos'),{url:await firebaseStorage.getDownloadURL(r),uploaderId:user.id,timestamp:Date.now()})}}}}/></label></div>}
      </main>
      <nav className="bg-white border-t p-2 pb-6 grid grid-cols-6 gap-1 text-[10px] font-bold text-gray-400 fixed bottom-0 w-full max-w-3xl">
        {[ ['HOME',IconHome],['HUNT_VILLAGE',IconVillage],['HUNT_HOUSE',IconHouse],['VOTING',IconVote],['GAMES',IconGamepad],['PHOTOS',IconCamera] ].map(([v,I]:any)=><button key={v} onClick={()=>setView(v)} className={`flex flex-col items-center ${view===v?'text-green-800':''}`}><I className={`w-8 h-8 ${view===v?'stroke-2':'stroke-1'}`}/></button>)}
      </nav>
    </div>
  );
};
