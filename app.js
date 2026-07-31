
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let points=get("v4points",150), history=get("v4history",[]);
const day=()=>new Date().toISOString().slice(0,10);
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h)};
const pick=(a,s)=>a[s%a.length];
const advice=["小さな行動が未来を変えます。","焦らず状況を整えることが大切です。","本音を丁寧に伝えると流れが変わります。","休息を取ることで答えが見えます。","新しい出会いや情報に注目してください。"];
const colors=["紫","青","ピンク","白","金","緑","赤"],items=["手帳","腕時計","温かい飲み物","新しいペン","お気に入りの音楽","小さな鏡"];
function refresh(){pointsEl.textContent=points;streak.textContent=get("streak",0)+"日";dailyScore.textContent=(65+hash(day())%35)+"点"}
const pointsEl=$("#points");
function spend(n){if(points<n){alert("ポイントが足りません。履歴ページでログインボーナスを受け取ってください。");return false}points-=n;set("v4points",points);refresh();return true}
function addHistory(type,text){
  history.unshift({id:Date.now()+Math.random(),type,text,date:new Date().toLocaleString("ja-JP")});
  history=history.slice(0,50);set("v4history",history);renderHistory();updateUltimate();
}
function renderHistory(){
  const area=$("#history"); if(!area)return;
  area.innerHTML=history.length?history.map(h=>`<div><strong>${h.type}</strong><br><small>${h.date}</small><br>${h.text}<br><button class="favoriteBtn" data-fav="${h.id}">☆ お気に入り</button></div>`).join(""):"まだ履歴がありません。";
  $$("[data-fav]").forEach(b=>b.onclick=()=>toggleFavorite(b.dataset.fav));
}

$$("[data-view]").forEach(b=>b.onclick=()=>{$$(".view").forEach(v=>v.classList.add("hidden"));$("#view-"+b.dataset.view).classList.remove("hidden");scrollTo({top:210,behavior:"smooth"})});
$("#themeBtn").onclick=()=>{document.body.classList.toggle("light");set("light",document.body.classList.contains("light"))};if(get("light",false))document.body.classList.add("light");

function addMsg(t,w){const d=document.createElement("div");d.className="msg "+w;d.textContent=t;$("#chatLog").append(d);$("#chatLog").scrollTop=99999}
addMsg("こんにちは。恋愛・仕事・人生についてお話しください。","ai");
function localAI(q,type){const s=hash(q+type+day());return `${type}について占うと、今は「${pick(["整える","一歩進む","待つ","伝える","手放す"],s)}」が重要です。${pick(advice,s+1)} 今日できる小さな行動を一つ決めてみてください。`}
async function askAI(q,type){
  if(window.APP_CONFIG?.apiBase){
    try{
      const r=await fetch(window.APP_CONFIG.apiBase+"/api/fortune",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,type,history:history.filter(x=>x.type==="AI相談").slice(0,6)})});
      if(!r.ok)throw new Error("API error");const j=await r.json();return j.reply||localAI(q,type)
    }catch(e){return localAI(q,type)+"（現在は体験版回答です）"}
  } return localAI(q,type);
}
$("#chatForm").onsubmit=async e=>{e.preventDefault();const q=$("#chatInput").value.trim(),type=$("#consultType").value;if(!q||!spend(10))return;addMsg(q,"user");$("#chatInput").value="";addMsg("星を読み取っています…","ai");const loading=$("#chatLog").lastChild;const a=await askAI(q,type);loading.textContent=a;addHistory("AI相談",q+" → "+a)};
$$("[data-prompt]").forEach(b=>b.onclick=()=>{$("#chatInput").value=b.dataset.prompt});
$("#dailyAiBtn").onclick=async()=>{if(!spend(10))return;const q="今日の運勢と、今日意識することを教えてください";addMsg(q,"user");const a=await askAI(q,"今日の運勢");addMsg(a,"ai");addHistory("AI今日の運勢",a)};

function draw(n){if(!spend(n===10?30:n===3?15:5))return;const used=new Set(),r=[];while(r.length<n){let i=Math.floor(Math.random()*TAROT_CARDS.length);if(!used.has(i)){used.add(i);r.push({...TAROT_CARDS[i],rev:Math.random()<.35})}}
const labels=n===1?["現在のメッセージ"]:n===3?["過去","現在","未来"]:["現状","課題","顕在意識","潜在意識","過去","近い未来","自分","周囲","願望・恐れ","最終結果"];
$("#spreadLabels").textContent=labels.join(" ／ ");
$("#tarotResult").innerHTML=r.map((c,i)=>`<div class="tarot ${c.rev?"rev":""}"><div class="symbol">${c.symbol}</div><small>${labels[i]}</small><h3>${c.name}</h3><b>${c.rev?"逆位置":"正位置"}</b><p>${c.rev?c.reversed:c.upright}</p></div>`).join("");
addHistory("タロット",r.map(c=>c.name+"（"+(c.rev?"逆":"正")+"）").join("・"))}
$$("[data-draw]").forEach(b=>b.onclick=()=>draw(Number(b.dataset.draw)));
$("#library").innerHTML=TAROT_CARDS.map(c=>`<div><strong>${c.symbol} ${c.name}</strong><br><small>正：${c.upright}<br>逆：${c.reversed}</small></div>`).join("");

const signs=["牡羊座","牡牛座","双子座","蟹座","獅子座","乙女座","天秤座","蠍座","射手座","山羊座","水瓶座","魚座"];
signs.forEach(x=>$("#zodiac").insertAdjacentHTML("beforeend",`<option>${x}</option>`));
$("#zodiacForm").onsubmit=e=>{e.preventDefault();let z=$("#zodiac").value,p=$("#period").value,s=hash(z+p+day()),score=65+s%35;let t=`<h3>${z}・${p}運勢 ${score}点</h3><p>${pick(advice,s)}</p><p>ラッキーカラー：${pick(colors,s+1)}<br>ラッキーアイテム：${pick(items,s+2)}<br>ラッキーナンバー：${1+s%9}</p>`;$("#zodiacResult").innerHTML=t;addHistory("星座占い",`${z} ${p} ${score}点`)};

$("#nameForm").onsubmit=e=>{e.preventDefault();let n=$("#fullName").value.trim(),s=hash(n),chars=[...n.replace(/\s/g,"")],total=chars.reduce((a,c)=>a+c.charCodeAt(0)%10+1,0);let t=`<h3>${n}さん</h3><p>天格 ${8+s%25}／人格 ${7+(s>>2)%25}／地格 ${6+(s>>4)%25}／外格 ${5+(s>>6)%25}／総格 ${total}</p><p>${pick(advice,s)}</p>`;$("#nameResult").innerHTML=t;addHistory("姓名判断",`${n}・総格${total}`)};

function reduceNum(v){let n=v.replace(/\D/g,"").split("").reduce((a,b)=>a+Number(b),0);while(n>9&&![11,22,33].includes(n))n=String(n).split("").reduce((a,b)=>a+Number(b),0);return n}
$("#numberForm").onsubmit=e=>{e.preventDefault();let b=$("#numberBirth").value,n=$("#numberName").value,num=reduceNum(b),types={1:"開拓者",2:"調整役",3:"表現者",4:"努力家",5:"自由人",6:"愛情家",7:"探究者",8:"実務家",9:"理想家",11:"直感者",22:"建設者",33:"奉仕者"};let t=`<h3>ライフパス ${num}</h3><p>${types[num]||"個性派"}タイプです。${pick(advice,hash(b+n))}</p>`;$("#numberResult").innerHTML=t;addHistory("数秘術",`${b}・${num}`)};

const stars=["一白水星","二黒土星","三碧木星","四緑木星","五黄土星","六白金星","七赤金星","八白土星","九紫火星"];
$("#kyuseiForm").onsubmit=e=>{e.preventDefault();let b=$("#kyuseiBirth").value,y=Number(b.slice(0,4)),sum=String(y).split("").reduce((a,x)=>a+Number(x),0);while(sum>9)sum=String(sum).split("").reduce((a,x)=>a+Number(x),0);let idx=(11-sum)%9;if(idx===0)idx=9;let star=stars[idx-1];let t=`<h3>本命星：${star}</h3><p>${pick(advice,hash(b))} 九星気学の年替わりは立春基準のため、1月・2月上旬生まれは厳密な判定に専門暦が必要です。</p>`;$("#kyuseiResult").innerHTML=t;addHistory("九星気学",`${b}・${star}`)};

$("#birthdayForm").onsubmit=e=>{e.preventDefault();let b=$("#birthday").value,s=hash(b),md=b.slice(5),t=`<h3>${md.replace("-","月")}日生まれ</h3><p>${pick(["感受性が豊かで、人の気持ちを察する力があります。","行動力があり、新しい挑戦に強いタイプです。","粘り強く、信頼を積み重ねるタイプです。","自由な発想で周囲に刺激を与えるタイプです。"],s)}</p><p>${pick(advice,s+1)}</p>`;$("#birthdayResult").innerHTML=t;addHistory("誕生日占い",b)};

$("#compatForm").onsubmit=e=>{e.preventDefault();let a=$("#nameA").value+$("#birthA").value,b=$("#nameB").value+$("#birthB").value,r=$("#relation").value,s=hash(a+"|"+b+"|"+r),score=55+s%46;let t=`<h3>${r}相性 ${score}%</h3><p>${score>=85?"強いご縁があります。互いの長所を認めることでさらに深まります。":score>=70?"良い相性です。丁寧な会話が関係を育てます。":"違いを理解することが成長につながる相性です。"}</p><p>${pick(advice,s)}</p>`;$("#compatResult").innerHTML=t;addHistory("相性診断",`${$("#nameA").value} × ${$("#nameB").value} ${score}%`)};

$("#bonusBtn").onclick=()=>{let last=get("lastBonus","");if(last===day()){alert("本日は受け取り済みです");return}let y=new Date(Date.now()-86400000).toISOString().slice(0,10),st=last===y?get("streak",0)+1:1;set("lastBonus",day());set("streak",st);points+=50+Math.min(st*5,50);set("v4points",points);refresh();alert(`ボーナス獲得！ 連続${st}日`)};
$("#clearHistory").onclick=()=>{if(confirm("履歴を削除しますか？")){history=[];set("v4history",history);renderHistory()}};

if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
const c=$("#sky"),x=c.getContext("2d");let starsBg=[];function resize(){c.width=innerWidth;c.height=innerHeight;starsBg=Array.from({length:100},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.8+.2,v:Math.random()*.3+.08}))}function anim(){x.clearRect(0,0,c.width,c.height);x.fillStyle="rgba(255,255,255,.8)";starsBg.forEach(s=>{s.y+=s.v;if(s.y>c.height)s.y=0;x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill()});requestAnimationFrame(anim)}addEventListener("resize",resize);resize();anim();
refresh();renderHistory();


// ===== Ver4.0 Ultimate additions =====
let deferredInstallPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;});

function currentUser(){return get("ultimateUser",null)}
function favorites(){return get("ultimateFavorites",[])}
function toggleFavorite(id){
  const item=history.find(h=>String(h.id)===String(id)); if(!item)return;
  let fav=favorites(),exists=fav.some(x=>String(x.id)===String(id));
  fav=exists?fav.filter(x=>String(x.id)!==String(id)):[item,...fav].slice(0,30);
  set("ultimateFavorites",fav);renderFavorites();updateUltimate();
}
function renderFavorites(){
  const area=$("#favorites");if(!area)return;
  const fav=favorites();
  area.innerHTML=fav.length?fav.map(x=>`<div><strong>${x.type}</strong><br><small>${x.date}</small><br>${x.text}</div>`).join(""):"お気に入りはまだありません。";
}
function renderMissions(){
  const missions=[
    {name:"はじめての占い",done:history.length>=1},
    {name:"占いを5回利用",done:history.length>=5},
    {name:"お気に入り登録",done:favorites().length>=1},
    {name:"3日連続ログイン",done:get("streak",0)>=3}
  ];
  $("#missions").innerHTML=missions.map(m=>`<div class="mission ${m.done?"done":""}"><b>${m.done?"🏅":"🔒"} ${m.name}</b></div>`).join("");
  $("#badgeCount").textContent=missions.filter(m=>m.done).length+"個";
}
function updateUltimate(){
  const u=currentUser(),logged=!!u;
  $("#loginBox")?.classList.toggle("hidden",logged);
  $("#profileBox")?.classList.toggle("hidden",!logged);
  if(logged){
    $("#profileName").textContent=u.name;
    $("#profileEmail").textContent=u.email;
    $("#mypagePoints").textContent=points+" pt";
    $("#favoriteCount").textContent=favorites().length+"件";
    renderFavorites();renderMissions();
  }
  const premium=get("ultimatePremium",false);
  $("#adArea")?.classList.toggle("hidden",premium);
  if($("#premiumBtn"))$("#premiumBtn").textContent=premium?"プレミアム会員利用中":"プレミアム会員";
}

$("#loginForm")?.addEventListener("submit",e=>{
  e.preventDefault();
  set("ultimateUser",{name:$("#loginName").value.trim(),email:$("#loginEmail").value.trim()});
  updateUltimate();alert("この端末にログイン情報を保存しました。");
});
$("#googleDemo")?.addEventListener("click",()=>{set("ultimateUser",{name:"Googleユーザー",email:"demo.google@example.com"});updateUltimate();alert("Googleログイン体験版です。")});
$("#appleDemo")?.addEventListener("click",()=>{set("ultimateUser",{name:"Appleユーザー",email:"demo.apple@example.com"});updateUltimate();alert("Appleログイン体験版です。")});
$("#logoutBtn")?.addEventListener("click",()=>{localStorage.removeItem("ultimateUser");updateUltimate()});
$("#installBtn")?.addEventListener("click",async()=>{
  if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null}
  else alert("iPhoneではSafariの共有ボタンから「ホーム画面に追加」を選択してください。");
});
$("#premiumBtn")?.addEventListener("click",()=>alert("本番ではStripe決済と接続します。下の体験版ボタンで表示を確認できます。"));
$("#stripeDemo")?.addEventListener("click",()=>{
  const now=!get("ultimatePremium",false);set("ultimatePremium",now);updateUltimate();
  alert(now?"プレミアム体験版を有効にしました。広告が非表示になります。":"プレミアム体験版を解除しました。");
});
updateUltimate();

