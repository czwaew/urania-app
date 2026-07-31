
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>[...document.querySelectorAll(s)];
const store = {
  get(k,d){try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{return d}},
  set(k,v){localStorage.setItem(k,JSON.stringify(v))}
};
let points = store.get("points",120);
let history = store.get("history",[]);
const zodiac = ["牡羊座","牡牛座","双子座","蟹座","獅子座","乙女座","天秤座","蠍座","射手座","山羊座","水瓶座","魚座"];
const colors=["紫","ピンク","青","金","白","緑","赤"];
const items=["手帳","ハンカチ","腕時計","温かい飲み物","お気に入りの音楽","小さな鏡","新しいペン"];
const advice=[
"小さな一歩が流れを変えます。","急がず、目の前のことを丁寧に。","本音を言葉にすると道が開けます。",
"新しい情報に触れると好機が見つかります。","休息を取ることで判断力が戻ります。","身近な人への感謝が運気を整えます。"
];

function hash(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h)}
function pick(arr,seed){return arr[seed%arr.length]}
function today(){return new Date().toISOString().slice(0,10)}
function updateStatus(){
  $("#pointDisplay").textContent=points;
  const streak=store.get("streak",0); $("#streakDisplay").textContent=streak+"日";
}
function saveHistory(type,text){
  history.unshift({date:new Date().toLocaleString("ja-JP"),type,text});
  history=history.slice(0,30);store.set("history",history);renderHistory();
}
function spend(n){
  if(points<n){alert("ポイントが足りません。マイページでログインボーナスを受け取ってください。");return false}
  points-=n;store.set("points",points);updateStatus();return true
}

$$("[data-view]").forEach(b=>b.onclick=()=>{
  $$(".view").forEach(v=>v.classList.add("hidden"));
  $("#view-"+b.dataset.view).classList.remove("hidden");
  window.scrollTo({top:180,behavior:"smooth"});
});

$("#themeBtn").onclick=()=>{
  document.body.classList.toggle("light");
  store.set("light",document.body.classList.contains("light"));
};
if(store.get("light",false))document.body.classList.add("light");

function aiResponse(q){
  const seed=hash(q+today()), topic=q.includes("恋")?"恋愛":q.includes("仕事")?"仕事":q.includes("人")?"人間関係":"これから";
  return `${topic}について見ると、今は「${pick(["整える","伝える","待つ","選び直す","一歩踏み出す"],seed)}」ことが鍵です。${pick(advice,seed+2)} すぐに結論を出すより、今日できる具体的な行動を一つ決めてみてください。`;
}
function addMsg(text,who){
  const d=document.createElement("div");d.className="msg "+who;d.textContent=text;$("#chatLog").append(d);$("#chatLog").scrollTop=99999;
}
addMsg("こんにちは。恋愛・仕事・人間関係など、気になることをお話しください。","ai");
$("#chatForm").onsubmit=e=>{
  e.preventDefault();const q=$("#chatInput").value.trim();if(!q||!spend(10))return;
  addMsg(q,"user");$("#chatInput").value="";
  setTimeout(()=>{const a=aiResponse(q);addMsg(a,"ai");saveHistory("AI占い",q+" → "+a)},450);
};

function drawTarot(n){
  if(!spend(n===10?30:n===3?15:5))return;
  const used=new Set(), result=[];
  while(result.length<n){const i=Math.floor(Math.random()*TAROT_CARDS.length);if(!used.has(i)){used.add(i);result.push({...TAROT_CARDS[i],rev:Math.random()<.35})}}
  $("#tarotResult").innerHTML=result.map((c,i)=>`
    <article class="tarot-card"><div class="tarot-inner"><div class="tarot-face ${c.rev?"reversed":""}">
      <div class="symbol">${c.symbol}</div><h3>${c.name}</h3><strong>${c.rev?"逆位置":"正位置"}</strong>
      <p>${c.rev?c.reversed:c.upright}</p>
    </div></div></article>`).join("");
  saveHistory("タロット",result.map(c=>`${c.name}（${c.rev?"逆":"正"}）`).join("・"));
}
$$("[data-draw]").forEach(b=>b.onclick=()=>drawTarot(Number(b.dataset.draw)));
$("#tarotLibrary").innerHTML=TAROT_CARDS.map(c=>`<div><strong>${c.symbol} ${c.name}</strong><br><small>正：${c.upright}<br>逆：${c.reversed}</small></div>`).join("");

zodiac.forEach(z=>$("#zodiacSelect").insertAdjacentHTML("beforeend",`<option>${z}</option>`));
$("#zodiacForm").onsubmit=e=>{
  e.preventDefault();const z=$("#zodiacSelect").value,p=$("#zodiacPeriod").value,s=hash(z+p+today());
  const score=65+s%35, text=`<h3>${z}・${p}運勢：${score}点</h3>
  <p>${pick(advice,s)}</p><p>ラッキーカラー：<b>${pick(colors,s+1)}</b><br>
  ラッキーアイテム：<b>${pick(items,s+2)}</b><br>ラッキーナンバー：<b>${1+s%9}</b></p>`;
  $("#zodiacResult").innerHTML=text;saveHistory("星座占い",`${z} ${p} ${score}点`);
};

$("#nameForm").onsubmit=e=>{
  e.preventDefault();const n=$("#fullName").value.trim(),s=hash(n),total=[...n.replace(/\s/g,"")].reduce((a,c)=>a+c.charCodeAt(0)%10+1,0);
  const text=`<h3>${n}さんの姓名判断</h3><p>天格：${8+s%25}　人格：${7+(s>>2)%25}　地格：${6+(s>>4)%25}<br>
  外格：${5+(s>>6)%25}　総格：${total}</p><p>${pick(advice,s)} 周囲との調和を意識すると魅力がより伝わります。</p>`;
  $("#nameResult").innerHTML=text;saveHistory("姓名判断",`${n}・総格${total}`);
};

$("#birthdayForm").onsubmit=e=>{
  e.preventDefault();const v=$("#birthday").value;if(!v)return;
  let num=v.replaceAll("-","").split("").reduce((a,b)=>a+Number(b),0);while(num>9)num=String(num).split("").reduce((a,b)=>a+Number(b),0);
  const types=["開拓者","調整役","表現者","努力家","自由人","愛情家","探究者","実務家","理想家"];
  const text=`<h3>ライフパスナンバー：${num}</h3><p>あなたは「${types[num-1]}」タイプです。</p><p>${pick(advice,hash(v))}</p>`;
  $("#birthdayResult").innerHTML=text;saveHistory("生年月日占い",`${v}・ナンバー${num}`);
};

function renderHistory(){
  $("#historyList").innerHTML=history.length?history.map(h=>`<div><strong>${h.type}</strong><br><small>${h.date}</small><br>${h.text}</div>`).join(""):"まだ履歴がありません。";
}
function renderProfile(){
  const u=store.get("user",null);
  $("#loginPanel").classList.toggle("hidden",!!u);$("#profilePanel").classList.toggle("hidden",!u);
  if(u){$("#profileName").textContent=u.name;$("#profileEmail").textContent=u.email}
  renderHistory();
}
$("#loginForm").onsubmit=e=>{
  e.preventDefault();const u={name:$("#nickname").value,email:$("#email").value};store.set("user",u);renderProfile();alert("ログイン情報をこの端末に保存しました。");
};
$("#logoutBtn").onclick=()=>{localStorage.removeItem("user");renderProfile()};
$("#dailyBonusBtn").onclick=()=>{
  const last=store.get("lastBonus","");if(last===today()){alert("本日のボーナスは受け取り済みです。");return}
  const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
  let streak=last===yesterday?store.get("streak",0)+1:1;
  store.set("lastBonus",today());store.set("streak",streak);points+=50+Math.min(streak*5,50);store.set("points",points);
  updateStatus();alert(`ログインボーナスを獲得しました！ 連続${streak}日`);
};

$("#dailyMessage").textContent=pick(advice,hash(today()));
updateStatus();renderProfile();

if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});

// 星アニメーション
const c=$("#stars"),ctx=c.getContext("2d");let stars=[];
function resize(){c.width=innerWidth;c.height=innerHeight;stars=Array.from({length:Math.min(120,Math.floor(innerWidth/8))},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.7+.3,v:Math.random()*.35+.08}))}
function animate(){ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle="rgba(255,255,255,.8)";stars.forEach(s=>{s.y+=s.v;if(s.y>c.height)s.y=0;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()});requestAnimationFrame(animate)}
addEventListener("resize",resize);resize();animate();
