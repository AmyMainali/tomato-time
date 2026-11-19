(function(){
  var $=function(id){return document.getElementById(id)};
  var KEY="tomato-time-v1";
  var def={set:{focus:25,short:5,long:15,every:4,auto:false,sound:true,notify:false},tasks:[],cur:null,cycle:0,stats:{date:"",pomos:0,mins:0,total:0}};
  var S=JSON.parse(JSON.stringify(def));
  try{var raw=localStorage.getItem(KEY);if(raw){var p=JSON.parse(raw);S.set=Object.assign(S.set,p.set||{});S.tasks=p.tasks||[];S.cur=p.cur||null;S.cycle=p.cycle||0;S.stats=Object.assign(S.stats,p.stats||{})}}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
  function today(){return new Date().toDateString()}
  function rollDay(){if(S.stats.date!==today()){S.stats.date=today();S.stats.pomos=0;S.stats.mins=0;S.cycle=0}}
  rollDay();

  var mode="focus",remaining=S.set.focus*60,total=remaining,running=false,endAt=0,timer=null;
  function blob(r,seed,amp){
    var pts=[],n=48,i;
    for(i=0;i<n;i++){var a=i/n*2*Math.PI,d=amp*(Math.sin(a*2+seed)*.6+Math.sin(a*3+seed*1.7)*.4+Math.sin(a*5+seed*2.3)*.25);pts.push([150+(r+d)*Math.cos(a),150+(r+d)*Math.sin(a)])}
    var s="M"+pts[0][0].toFixed(1)+" "+pts[0][1].toFixed(1);
    for(i=0;i<n;i++){var p0=pts[(i+n-1)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
      s+="C"+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+" "+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+" "+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+" "+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+" "+p2[0].toFixed(1)+" "+p2[1].toFixed(1)}
    return s+"Z";
  }
  var prog=$("prog"),ringD=blob(124,1,2.5);
  $("pTrack").setAttribute("d",ringD);prog.setAttribute("d",ringD);
  $("pO1").setAttribute("d",blob(135,2.4,2.5));$("pO2").setAttribute("d",blob(113,4.1,2.5));
  prog.style.strokeDasharray="1 1";
  var lines={focus:["one tomato at a time","tiny steps count","you’re doing great","stay with it, sparkle"],short:["sip some water","stretch your arms","look at something far away"],long:["go for a wander","have a snack, you earned it","rest your eyes"]};
  function dur(m){return S.set[m]*60}
  function fmt(s){var m=Math.floor(s/60),r=s%60;return (m<10?"0":"")+m+":"+(r<10?"0":"")+r}
  function curTask(){return S.tasks.filter(function(t){return t.id===S.cur&&!t.done})[0]}

  function render(){
    $("time").textContent=fmt(remaining);
    var fr=total?remaining/total:0;prog.style.strokeDashoffset=1-fr;prog.style.opacity=fr>0?1:0;
    var started=remaining!==total;
    $("start").textContent=running?"❚❚ pause":(started?"▶ resume":"▶ start");
    $("status").textContent=running?(mode==="focus"?"focusing…":"on a break…"):(started?"paused":(mode==="focus"?"ready to focus":"break time"));
    $("hint").textContent=running?"the timer is running. pause any time.":(started?"paused. press resume to keep going.":"press start to begin a "+Math.round(total/60)+" minute "+(mode==="focus"?"focus session":"break")+".");
    document.body.setAttribute("data-mode",mode);
    document.querySelector(".wrap").classList.toggle("running",running);
    document.body.classList.toggle("running",running);
    document.querySelectorAll(".chip[data-mode]").forEach(function(c){c.setAttribute("aria-pressed",c.dataset.mode===mode)});
    var t=curTask();
    $("label").textContent=mode==="focus"?(t?t.text:"just focusing"):lines[mode][S.stats.pomos%lines[mode].length];
    document.title=(running||remaining!==total?fmt(remaining)+" · ":"")+(mode==="focus"?"focus":"break")+" · tomato time";
    drawStars();
  }
  function drawStars(){
    var n=S.set.every,f=S.cycle%n;if(f===0&&S.cycle>0&&mode==="long")f=n;
    var h="";for(var i=0;i<n;i++)h+='<svg viewBox="0 0 44 44" class="'+(i<f?"on":"")+'"><path d="M22 4l5.2 11.6 12.6 1.4-9.4 8.6 2.7 12.4L22 31.4 10.9 38l2.7-12.4-9.4-8.6 12.6-1.4z"/></svg>';
    $("stars").innerHTML=h;
  }
  function setMode(m,keepRun){
    var was=running||remaining!==total;pause(true);mode=m;total=remaining=dur(m);render();
    if(was)toast("switched to "+(m==="focus"?"focus":m+" break")+", timer restarted");
  }
  function start(){
    if(running)return;
    running=true;endAt=Date.now()+remaining*1000;
    timer=setInterval(tick,250);render();
    if(S.set.notify&&"Notification" in window&&Notification.permission==="default"){try{Notification.requestPermission()}catch(e){}}
  }
  function pause(silent){running=false;clearInterval(timer);if(!silent)render()}
  function tick(){
    var r=Math.max(0,Math.ceil((endAt-Date.now())/1000));
    if(r!==remaining){remaining=r;render()}
    if(r<=0)complete();
  }
  function complete(){
    pause(true);rollDay();
    var done=mode,msg;
    if(done==="focus"){
      S.stats.pomos++;S.stats.total++;S.stats.mins+=S.set.focus;S.cycle++;
      var t=curTask();if(t)t.pomos=(t.pomos||0)+1;
      mode=(S.cycle%S.set.every===0)?"long":"short";
      msg=mode==="long"?"tomato done! time for a long break":"tomato done! take a short break";
      renderTasks();renderStats();
    }else{mode="focus";msg="break’s over, let’s focus"}
    total=remaining=dur(mode);save();render();
    chime();notify(msg);toast(msg);
    if(S.set.auto)setTimeout(start,1200);
  }
  function skip(){
    mode=mode==="focus"?"short":"focus";
    pause(true);total=remaining=dur(mode);save();render();
    toast(mode==="focus"?"skipped to focus":"skipped to a break (that tomato wasn’t counted)");
  }
  function reset(){pause(true);remaining=total=dur(mode);render()}

  var actx;
  function chime(){
    if(!S.set.sound)return;
    try{
      actx=actx||new (window.AudioContext||window.webkitAudioContext)();
      [660,880,1175].forEach(function(f,i){
        var o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+i*.22;
        o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.25,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.7);
        o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+.75);
      });
    }catch(e){}
  }
  function notify(m){
    if(S.set.notify&&"Notification" in window&&Notification.permission==="granted"){try{new Notification("tomato time",{body:m})}catch(e){}}
  }
  var tt;
  function toast(m){var t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("show")},3500)}

  function esc(s){return s.replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function renderTasks(){
    var ul=$("tasks");
    if(!S.tasks.length){ul.innerHTML='<li class="empty">nothing here yet. add something small to start.</li>';return}
    ul.innerHTML=S.tasks.map(function(t){
      return '<li class="task'+(t.done?" done":"")+(t.id===S.cur&&!t.done?" cur":"")+'" data-id="'+t.id+'">'+
        '<button class="tick" data-a="done" aria-label="'+(t.done?"Mark not done":"Mark done")+'">'+(t.done?"✓":"")+'</button>'+
        '<button class="txt" data-a="pick" title="Work on this one">'+esc(t.text)+'</button>'+
        '<span class="n">'+(t.pomos?t.pomos+" 🍅":"")+'</span>'+
        '<button class="x" data-a="del" aria-label="Delete task">×</button></li>';
    }).join("");
  }
  $("tasks").addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b)return;
    var li=b.closest("li"),id=li.dataset.id,i=S.tasks.findIndex(function(t){return t.id===id});if(i<0)return;
    var a=b.dataset.a;
    if(a==="done"){S.tasks[i].done=!S.tasks[i].done;if(S.cur===id&&S.tasks[i].done)S.cur=null}
    else if(a==="pick"){if(!S.tasks[i].done)S.cur=(S.cur===id?null:id)}
    else if(a==="del"){S.tasks.splice(i,1);if(S.cur===id)S.cur=null}
    save();renderTasks();render();
  });
  function addTask(){
    var v=$("newTask").value.trim();if(!v)return;
    var t={id:"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),text:v,done:false,pomos:0};
    S.tasks.push(t);if(!S.cur)S.cur=t.id;
    $("newTask").value="";save();renderTasks();render();
  }
  $("addForm").addEventListener("submit",addTask);

  function renderStats(){$("sPomos").textContent=S.stats.pomos;$("sMins").textContent=S.stats.mins;$("sTotal").textContent=S.stats.total}
  $("clearStats").onclick=function(){S.stats.pomos=0;S.stats.mins=0;S.cycle=0;save();renderStats();render()};

  $("start").onclick=function(){running?pause():start()};
  $("reset").onclick=reset;$("skip").onclick=skip;
  document.querySelectorAll(".chip[data-mode]").forEach(function(c){c.onclick=function(){setMode(c.dataset.mode)}});
  document.addEventListener("keydown",function(e){
    var tg=e.target.tagName;if(tg==="INPUT"||tg==="TEXTAREA"||$("dlg").open||e.metaKey||e.ctrlKey||e.altKey)return;
    if(e.code==="Space"){e.preventDefault();running?pause():start()}
    else if(e.key==="r"||e.key==="R")reset();
    else if(e.key==="s"||e.key==="S")skip();
  });
  document.addEventListener("visibilitychange",function(){if(running)tick()});

  var dlg=$("dlg"),map={focus:"o-focus",short:"o-short",long:"o-long",every:"o-every"};
  $("openSettings").onclick=function(){
    for(var k in map)$(map[k]).value=S.set[k];
    $("o-auto").checked=S.set.auto;$("o-sound").checked=S.set.sound;$("o-notify").checked=S.set.notify;
    dlg.showModal();
  };
  $("closeDlg").onclick=function(){dlg.close()};
  dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close()});
  Object.keys(map).forEach(function(k){
    $(map[k]).addEventListener("change",function(){
      var el=$(map[k]),v=Math.round(+el.value),mx=+el.max,mn=+el.min;
      if(!v||v<mn)v=mn;if(v>mx)v=mx;el.value=v;S.set[k]=v;save();
      if(!running&&k===mode&&remaining===total){total=remaining=dur(mode)}
      render();
    });
  });
  $("o-auto").onchange=function(){S.set.auto=this.checked;save()};
  $("o-sound").onchange=function(){S.set.sound=this.checked;save();if(this.checked)chime()};
  $("o-notify").onchange=function(){
    var el=this;S.set.notify=el.checked;save();
    if(el.checked&&"Notification" in window&&Notification.permission==="default"){try{Notification.requestPermission().then(function(p){if(p!=="granted"){S.set.notify=false;el.checked=false;save();toast("notifications are blocked in this browser")}})}catch(e){}}
    else if(el.checked&&!("Notification" in window)){S.set.notify=false;el.checked=false;toast("notifications aren’t supported here")}
    else if(el.checked&&Notification.permission==="denied"){S.set.notify=false;el.checked=false;save();toast("notifications are blocked in this browser")}
  };


  renderTasks();renderStats();render();save();
})();
