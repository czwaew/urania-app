
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let history=get("hoshiBmcHistory",[]);
const today=()=>new Date().toISOString().slice(0,10);
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h)};
const pick=(a,s)=>a[s%a.length];
const advice=["焦らず、自分のペースを守ると良い日です。","小さな行動が良い流れを作ります。","誰かとの会話からヒントが見つかりそうです。","新しい情報に触れると視野が広がります。","今日は休息も大切な選択です。"];
const actions=["気になることを3つ書き出す","信頼できる人に短く相談する","今日は結論を出さず情報を集める","一つだけ行動に移す","30分だけ自分のための時間を作る"];
const colors=["紫","青","ピンク","白","金","緑","赤"];

function show(id){$$(".view").forEach(v=>v.classList.add("hidden"));$("#view-"+id).classList.remove("hidden");scrollTo({top:190,behavior:"smooth"})}
$$("[data-view]").forEach(b=>b.onclick=()=>show(b.dataset.view));
$$("[data-jump]").forEach(b=>b.onclick=()=>show(b.dataset.jump));
$("#themeBtn").onclick=()=>{document.body.classList.toggle("light");set("hoshiBmcLight",document.body.classList.contains("light"))};
if(get("hoshiBmcLight",false))document.body.classList.add("light");

function addHistory(type,text){history.unshift({type,text,date:new Date().toLocaleString("ja-JP")});history=history.slice(0,50);set("hoshiBmcHistory",history);renderHistory()}
function renderHistory(){$("#historyList").innerHTML=history.length?history.map(h=>`<article><strong>${h.type}</strong><br><small>${h.date}</small><p>${h.text}</p></article>`).join(""):"まだ履歴がありません。"}

const s=hash(today()),score=65+s%35;
$("#homeScore").textContent=score+"点";
$("#homeTheme").textContent=pick(["整える","伝える","休む","始める","選ぶ"],s);
$("#homeMessage").textContent=pick(["小さな一歩が流れを変える日。","自分の本音を大切にする日。","人との会話から運が動く日。","焦らず整えることが大切な日。"],s);

$("#dailyBtn").onclick=()=>{
  const love=60+(s>>2)%40,work=60+(s>>4)%40,people=60+(s>>6)%40;
  const step=pick(actions,s+3);
  $("#dailyResult").innerHTML=`<h3>総合運 ${score}点</h3><p>恋愛 ${love}／仕事 ${work}／対人 ${people}</p><p>${pick(advice,s)}</p><p>ラッキーカラー：${pick(colors,s+1)}</p><p><b>今日の一歩：</b>${step}</p>`;
  addHistory("今日の運勢",`${score}点／今日の一歩：${step}`);
};

const tarot=[["愚者","新しい始まり","焦らず準備を"],["魔術師","行動する力","自信を取り戻す"],["女教皇","直感を信じる","考えすぎに注意"],["女帝","愛情と豊かさ","依存しすぎない"],["皇帝","安定と決断","頑固になりすぎない"],["恋人","調和と選択","迷いを整理する"],["戦車","前進と勝利","焦りに注意"],["隠者","内省と探求","孤立しすぎない"],["運命の輪","転機と好機","流れを待つ"],["星","希望と癒やし","期待しすぎない"],["月","感受性と想像","不安に飲まれない"],["太陽","成功と喜び","過信に注意"],["世界","完成と達成","仕上げを丁寧に"]];
$("#tarotBtn").onclick=()=>{
  const n=Math.floor(Math.random()*99999),card=pick(tarot,n),rev=n%3===0,step=pick(actions,n+2);
  $("#tarotResult").innerHTML=`<h3>🎴 ${card[0]}（${rev?"逆位置":"正位置"}）</h3><p>${rev?card[2]:card[1]}</p><p>${pick(advice,n)}</p><p><b>今見るべき視点：</b>${step}</p>`;
  addHistory("タロット",`${card[0]}（${rev?"逆":"正"}）／${step}`);
};

const signs=["牡羊座","牡牛座","双子座","蟹座","獅子座","乙女座","天秤座","蠍座","射手座","山羊座","水瓶座","魚座"];
signs.forEach(z=>$("#zodiacSelect").insertAdjacentHTML("beforeend",`<option>${z}</option>`));
$("#zodiacForm").onsubmit=e=>{
  e.preventDefault();const z=$("#zodiacSelect").value,p=$("#zodiacPeriod").value,n=hash(z+p+today()),sc=65+n%35,step=pick(actions,n+4);
  $("#zodiacResult").innerHTML=`<h3>${z}・${p}運勢 ${sc}点</h3><p>${pick(advice,n)}</p><p>ラッキーカラー：${pick(colors,n+1)}</p><p><b>行動ヒント：</b>${step}</p>`;
  addHistory("星座占い",`${z} ${p} ${sc}点／${step}`);
};

function reduceNum(v){let n=v.replace(/\D/g,"").split("").reduce((a,b)=>a+Number(b),0);while(n>9)n=String(n).split("").reduce((a,b)=>a+Number(b),0);return n}
$("#numberForm").onsubmit=e=>{
  e.preventDefault();const v=$("#birthday").value,n=reduceNum(v),types=["開拓者","調整役","表現者","努力家","自由人","愛情家","探究者","実務家","理想家"],strength=["決断力","協調力","表現力","継続力","柔軟性","共感力","洞察力","現実力","理想を描く力"];
  $("#numberResult").innerHTML=`<h3>ライフパス ${n}</h3><p>あなたは「${types[n-1]}」タイプです。</p><p><b>強み：</b>${strength[n-1]}</p><p><b>次の一歩：</b>${pick(actions,hash(v))}</p>`;
  addHistory("数秘術",`${v}／${types[n-1]}／強み：${strength[n-1]}`);
};

$("#compatForm").onsubmit=e=>{
  e.preventDefault();const a=$("#nameA").value.trim(),b=$("#nameB").value.trim(),n=hash(a+"|"+b),sc=55+n%46;
  const tip=pick(["期待を言葉にして伝える","連絡頻度より会話の質を意識する","相手の事情と自分の希望を分けて考える","すぐ結論を出さず一度落ち着いて話す"],n+1);
  $("#compatResult").innerHTML=`<h3>${a} × ${b}</h3><p><b>相性 ${sc}%</b></p><p>${sc>=85?"強いご縁があります。":sc>=70?"良い相性です。":"違いを理解することで育つ相性です。"}</p><p><b>関係改善ヒント：</b>${tip}</p>`;
  addHistory("相性診断",`${a} × ${b} ${sc}%／${tip}`);
};

const qs=["新しいことはまず試してみる方だ","人の気持ちの変化に気づきやすい","一人で考える時間が必要だ","計画を立てると安心する","失敗したことを長く考えてしまう"];
$("#quiz").innerHTML=qs.map((q,i)=>`<div class="question"><strong>${i+1}. ${q}</strong><div class="scale">${[1,2,3,4,5].map(v=>`<label><input type="radio" name="q${i}" value="${v}">${v}<small>${v===1?"低":v===5?"高":""}</small></label>`).join("")}</div></div>`).join("");
$("#quizBtn").onclick=()=>{
  const v=qs.map((_,i)=>Number(document.querySelector(`input[name=q${i}]:checked`)?.value||0));if(v.some(x=>!x))return alert("すべて回答してください。");
  const action=v[0],empathy=v[1],reflection=(v[2]+v[4])/2,plan=v[3];
  let type=action>=4?"行動型":reflection>=4?"内省型":empathy>=4?"共感型":plan>=4?"計画型":"バランス型";
  const map={行動型:["決断力と推進力","急ぎすぎず確認を入れる"],内省型:["深く考える力","考えすぎて止まりすぎない"],共感型:["人の気持ちを受け取る力","自分の希望も言葉にする"],計画型:["準備と継続力","予定外の変化も許容する"],バランス型:["状況に合わせて調整する力","自分の軸を一つ持つ"]};
  $("#quizResult").innerHTML=`<h3>${type}</h3><p><b>強み：</b>${map[type][0]}</p><p><b>注意点：</b>${map[type][1]}</p><p><b>次の一歩：</b>${pick(actions,v.reduce((a,b)=>a+b,0))}</p>`;
  addHistory("自己理解",`${type}／強み：${map[type][0]}`);
};

$("#loveForm").onsubmit=e=>{
  e.preventDefault();const r=$("#loveRelation").value,c=$("#loveConcern").value,n=hash(r+c),step=pick(["今の不安を事実と想像に分けて書く","自分が相手に望んでいることを一文で書く","短く自然なメッセージを送る","今日は相手の反応を追いすぎない"],n);
  $("#loveResult").innerHTML=`<h3>${r}について整理しました</h3><p><b>今の悩み：</b>${c}</p><p><b>整理ポイント：</b>${pick(["相手の反応だけでなく、自分がどうしたいかを見る","不安なときほど結論を急がない","期待を言葉にすることを意識する"],n+1)}</p><p><b>次の一歩：</b>${step}</p>`;
  addHistory("恋愛相談",`${r}／次の一歩：${step}`);
};

$("#lifeForm").onsubmit=e=>{
  e.preventDefault();const t=$("#lifeTheme").value,sit=$("#lifeSituation").value,ideal=$("#lifeIdeal").value,n=hash(t+sit+ideal),step=pick(["選択肢を3つ書き出す","変えられること・変えられないことを分ける","今週中にできることを1つ決める","信頼できる人に状況だけ共有する"],n);
  $("#lifeResult").innerHTML=`<h3>${t}について整理しました</h3><p><b>現在：</b>${sit}</p><p><b>理想：</b>${ideal}</p><p><b>見直す視点：</b>${pick(["短期の不安と長期の希望を分ける","他人の期待と自分の希望を切り分ける","情報不足なのか、決断への不安なのかを分ける"],n+1)}</p><p><b>今日できること：</b>${step}</p>`;
  addHistory("人生相談",`${t}／今日できること：${step}`);
};

$("#clearBtn").onclick=()=>{if(confirm("履歴を削除しますか？")){history=[];set("hoshiBmcHistory",history);renderHistory()}};
$("#exportBtn").onclick=()=>{
  const text=history.map(h=>`[${h.date}] ${h.type}\n${h.text}`).join("\n\n");
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="hoshishizuku-history.txt";a.click();URL.revokeObjectURL(a.href);
};

if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
const c=$("#stars"),ctx=c.getContext("2d");let stars=[];
function resize(){c.width=innerWidth;c.height=innerHeight;stars=Array.from({length:95},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.6+.3,v:Math.random()*.25+.05}))}
function anim(){ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle="rgba(255,255,255,.7)";stars.forEach(o=>{o.y+=o.v;if(o.y>c.height)o.y=0;ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,7);ctx.fill()});requestAnimationFrame(anim)}
addEventListener("resize",resize);resize();anim();renderHistory();
