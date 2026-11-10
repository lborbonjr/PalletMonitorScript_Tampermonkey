// ==UserScript==
// @name         Pallet_Movement_Monitor
// @namespace    pax-monitor
// @version      4.1.1.19
// @author       luiborbo
// @description  AFT + headless CsX Hunter API movement monitor with pallet ID clipboard and alternate-source fallback.
// @match        https://afttransshipmenthub-na.aka.amazon.com/*
// @match        https://transshipmenthub.na.aftx.amazonoperations.app/*
// @match        https://us-east-1.cx-hunter.eu-aces.amazon.dev/*
// @match        https://d34wrqb3xn2znf.cloudfront.net/idp-selection*
// @match        https://menu.na.aft.amazonoperations.app/*
// @match        https://aft-moveapp-iad-iad.iad.proxy.amazon.com/*
// @match        https://iad.inbound.rodeo.aft.a2z.com/*
// @updateURL    https://github.com/lborbonjr/PalletMonitorScript_Tampermonkey
// @downloadURL  https://github.com/lborbonjr/PalletMonitorScript_Tampermonkey
// @grant        unsafeWindow
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_openInTab
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        window.close
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @connect      trans-logistics.amazon.com
// @connect      api.us-east-1.cx-hunter.eu-aces.amazon.dev
// @connect      afttransshipmenthub-na.aka.amazon.com
// @connect      transshipmenthub.na.aftx.amazonoperations.app
// @connect      prod-na.us-east-1.idx-backend.aft.amazon.dev
// @connect      prod-na.us-east-1.idx-website.aft.amazon.dev
// @connect      midway-auth.amazon.com
// @connect      idp.federate.amazon.com
// ==/UserScript==
// 4.1.1.19: Count discrepancy evidence is diagnostics-only; restore live count labels, copy format and pallet filters. Hover fix retained.
// 4.1.1.18: Separate tab-local pallet count confirmation and bounded change evidence. Raw contents, history and staging unchanged. Offline candidate.
// 4.1.1.17: Units By Station heading matches theme hover and keyboard-focus colors. CSS-only; pallet counts and operational logic unchanged.
// 4.1.1.16: Copy non-moving pallets, omit zero case/tote header counts, and flag live AFT duplicates under ws-rcv-preditor. Display-only; offline candidate.
// 4.1.1.13: Rodeo launches 10 seconds after accepted AFT data with 10-second attempt spacing; timing labels follow settings. Local offline candidate.
// 4.1.1.12: automated Rodeo snapshots use a separate offscreen Rodeo frame with an exact parent/child handshake, never a background tab; Hunter loader unchanged. Local offline candidate.
// 4.1.1.11: widen only the read-only station table to the Zone filter edge; retain row height, selection, Copy table and all operational behavior. Local offline candidate.
// 4.1.1.10: bounded pre-discovery evidence and compact, selectable station table with filtered Copy table. Local offline candidate.
// 4.1.1.9: diagnostic-only page-local Rodeo startup evidence string; startup, timing and registration behavior unchanged.
// 4.1.1.8: bounded exact-job Rodeo startup recheck and tab-verified native return recovery; no global injection timing change.
// 4.1.1.7: export retained registration attempts with separate failure/cancellation summaries; no registration or timing changes.
// 4.1.1.6: bounded registration-step diagnostics and Units By Station wording; registration and scheduling unchanged.
// 4.1.1.5: Accepted-AFT Rodeo timing with bounded single-helper queue and token-free Rodeo diagnostics.
// 4.1.1.4: Offline report-matched Rodeo candidate; native VRID/station report, strict scope, preserved refresh and auth guards.
// 4.1.1.3: Offline refresh-linked Rodeo candidate; accepted AFT data gate, bounded serialized helpers, no credential access.
// 4.1.1: Simplified Rodeo table, floor-relative zones, high/low order and native snapshot pull.
// 4.1.0: Read-only Rodeo station quantities with floor, zone and minimum-unit filters.
// 4.0.5: AutoStager uses the newest recorded station across refreshes without requiring a current active-stower match.
// 4.0.4: no ON confirmation; turning AutoStager ON while another tab owns it asks to switch it to this tab (the other tab stops).
// 4.0.3: pallet list shows Staged for pallets with 0 cases and 0 totes or a confirmed non-zero move (display only).
// 4.0.2: helper heartbeat also runs from a worker timer (background-tab throttling); no-helper message shows last-heard age.
// 4.0.1: helper hold removed; unknown/destination-failed pallets are skipped for 24 h without stopping the AutoStager; protocol 7.
// 4.0: durable staging recovery, released-hold capacity, readiness, diagnostic and review controls.
// 3.9.21: lease lapse re-acquires while ON is retained; failed pallets are never replayed.
// 3.9.17: verified error waits at least 15 seconds, skips held pallet; uncertain stops.
// 3.9.16: minimum three-second confirmed-success pause; same readiness and serialization guards.
// 3.9.15: no automatic success cooldown; next eligible pallet after confirmed success and helper readiness.
// 3.9.14: automatic staging accepts prior-scan movements matching displayed AFT; no fresh-refresh gate.
// 3.9.9: FMC per-VRID 1DC detection and explicitly published shared Site settings.
// 3.9.8: confirmed staging silences pallet NEW cues only; movement history and exports remain intact.
// 3.9.7: staging recognizes current AFT pallets by type, without a barcode-prefix restriction.
// 3.9.6: source admission ignores only positively established display:none message subtrees.
// 3.9.5: exact normal source prompt exemption and specific message-guard diagnostics.
// 3.9.4: verified registry readiness and fresh request-correlated result banners; unknown never retries.
// 3.9.3: click-authorized staging, saved facility setup, recorded station evidence and moved-count outcomes.
// 3.9.2: defer main monitor startup until AFT is ready; retain document/queue liveness.
// 3.9.1: hold initial AFT mutation scanning until existing page-readiness checks pass.
// 3.9.0: explicit station-gated staging via an armed Move App helper; no automatic retries.
// 3.8.1: skip verified cosmetic arrow class mutations for scans only; refresh readiness is unchanged.
// 3.8.0: automatic sign-in recovery. When every active stower shows no station on two
// confirmed AFT refreshes, one tab opens the AFT menu login in the background and clicks
// IT Service Login once (max 2 tries, 15 min apart). Tracking/history/queue unchanged.
// 3.7.9: compact centered summary cards; source attribution stays accessible without a visible heading.
// 3.7.8: quantity rows are isolated from host definition-list styling. Non-Reserve
// Pending is omitted from the card only when both pending values are known and equal.
// 3.7.7: trailer quantities mirror the current AFT summary, never hierarchy sums or
// Hunter quantities. Missing/ambiguous values stay unavailable; queue/tracking is unchanged.
// 3.7.5: a shared minimum ten-second gap separates a CONFIRMED refresh completion from
// the next queued refresh, across every same-origin monitor tab. The deadline is a
// localStorage record written under the existing refresh lock before the completed
// barrier is released; the next owner waits for it under that same lock, abortably.
// A first refresh with no recent shared completion recorded adds no delay, a rejected
// snapshot never opens the gate, and a real user click on AFT Refresh still bypasses the
// queue exactly as before.
// 3.7.4: repeat-click collapses the active monitor view or Settings category only.
// Existing tab-local preference keys and shared tracking behavior are preserved.
// 3.7.3: user preferences are per browser tab. Refresh On/Off, pause, display hold,
// sound, theme, refresh interval, panel layout/tab/search/section state, session start,
// origin building, the 1DC list and the SLA reactive-percentage unit live in
// sessionStorage, are inherited once from the shared GM values written by older
// versions, and are never written back to shared storage, so changing a setting in one
// tab leaves every other tab alone. Movement history, snapshots, caches, Web Locks and
// tab coordination stay shared, as do the deliberately shared actions (AFT hostname
// reset, purge, history import/clear). Reload all open monitor tabs on upgrade.
// 3.7.2: SLA manifest matching against the full response and missing-appointment
// placeholder text is no longer accepted as a VRID.
// 3.7.1: final/loose movement detection, transition-aware events, read-only secondary
// tabs, lossless v6 history, recoverable refresh errors, and 12h/4h/24h SLA rules.
// Existing movement storage keys are retained. Reload all old monitor tabs on upgrade.

(function () {
  'use strict';
  // 3.6.4: frames are allowed only for the hidden Hunter loader the AFT tab creates.
  // Every other frame (AFT widgets, Hunter auth helpers) exits immediately.
  const HUNTER_LOADER_NAME='pmm-hunter-loader';
  let IN_FRAME=false;try{IN_FRAME=window.top!==window}catch{IN_FRAME=true}
  const HUNTER_FRAME_FEEDER=IN_FRAME&&location.hostname==='us-east-1.cx-hunter.eu-aces.amazon.dev'&&window.name===HUNTER_LOADER_NAME;
  // 4.1.1.12: the separate Rodeo loader frame runs only the frame-bound feeder; its name is an entry gate, never authority.
  if(IN_FRAME&&location.hostname==='iad.inbound.rodeo.aft.a2z.com'&&typeof pmmRodeoFrameSpec==='function'&&window.name===pmmRodeoFrameSpec().name){try{pmmRodeoFeederStart()}catch(_){}return;}
  if(IN_FRAME&&!HUNTER_FRAME_FEEDER)return;
  // 3.8.0: the AFT sign-in choice page and AFT menu only run the sign-in helper.
  const V='4.1.1.19';
  if(location.hostname==='iad.inbound.rodeo.aft.a2z.com'){try{if(typeof pmmRodeoStartupDiagBegin==='function')pmmRodeoStartupDiagBegin(V);}catch(_){}try{pmmRodeoFeederStart()}catch(_){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('entry','exception');}catch(_){}}try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('entry-end','ok');}catch(_){}return;}
  if(pmmStageHelperPage())return;
  if(pmmAuthHelperPage())return;

  const K={
    snapshot:'pax-monitor-v311-snapshot',
    results:'pax-monitor-v311-results',
    processed:'pax-monitor-v311-processed',
    paused:'pax-monitor-v311-paused',
    sound:'pax-monitor-v311-sound',
    theme:'pax-monitor-v311-theme',
    ui:'pax-monitor-v311-ui',
    diagnostic:'pax-monitor-v311-diagnostic',
    refresh:'pax-monitor-v311-refresh',
    minimized:'pax-monitor-v311-minimized',
    tab:'pax-monitor-v311-tab',
    notifications:'pax-monitor-v311-notifications',
    sectionOpen:'pax-monitor-v311-section-open',
    search:'pax-monitor-v320-search',
    historyKind:'pax-monitor-v320-history-kind',
    sessionStart:'pax-monitor-v320-session-start',
    placement:'pax-monitor-v368-placement',
    originBuilding:'pax-monitor-v3610-origin-building',
    oneDcTrailers:'pax-monitor-v3610-1dc-trailers',
    organized:'pax-monitor-v331-organized',
    organizedIndex:'pax-monitor-v3513-organized-index',
    snapshotIndex:'pax-monitor-v3514-snapshot-index',
    lastPrune:'pax-monitor-v370-last-prune',
    refreshOwner:'pax-monitor-v3515-refresh-owner',
    autoRefresh:'pax-monitor-v3518-auto-refresh',
    displayHold:'pax-monitor-v3518-display-hold',
    mixedLoads:'pax-monitor-v3611-mixed-loads',
    dataSource:'pax-monitor-v360-data-source',
    sourceHealthAft:'pax-monitor-v360-source-health-aft',
    sourceHealthHunter:'pax-monitor-v360-source-health-hunter',
    hunterFeed:'pax-monitor-v364-hunter-feed',
    hunterFeedMeta:'pax-monitor-v364-hunter-feed-meta',
    hunterFeedWant:'pax-monitor-v364-hunter-feed-want',
  };
  const UI_SESSION_KEY='pax-monitor-v328-ui';
  // ---- per-tab user preferences (3.7.3) -----------------------------------------
  // GM storage is shared by every tab running this userscript, so one monitor changing
  // Refresh On/Off, pause, sound, theme, the refresh interval or the site lists changed
  // them for every other open VRID too. Preferences now live in sessionStorage, which is
  // isolated per top-level tab and survives same-origin reloads and navigation; a
  // duplicated tab starts from the copy the browser gives it and then diverges.
  // The legacy GM key name is reused as the sessionStorage key suffix (TAB_PREF_NS +
  // legacy key), so the value an older version stored is inherited the first time this
  // tab touches that preference - once, after which the tab-local copy is the only
  // answer. Nothing here is ever written back to GM storage: shared keys stay shared
  // (movement history, snapshots, caches, locks, tab registry, SLA entries), and the
  // deliberately shared operations (AFT hostname reset, purge, history import/clear)
  // keep acting on shared storage - they are actions, not preferences.
  const TAB_PREF_NS='pax-monitor-v373-pref:';
  // Preference keys kept exactly as declared in K so a 3.7.2 value is still found.
  // 'pax-monitor-v371-sla-pct-unit' is the SLA module's pctUnitSettingKey; it is spelled
  // out instead of referenced so this list does not depend on later chunks loading.
  // Site keys below retain legacy tab-local migration reads only. read/write route
  // them through explicit shared publication in 3.9.9 before this preference path.
  const TAB_PREF_KEYS=new Set([K.sound,K.theme,K.ui,K.diagnostic,K.refresh,K.minimized,K.tab,
    K.notifications,K.sectionOpen,K.search,K.historyKind,K.sessionStart,K.placement,
    K.originBuilding,K.oneDcTrailers,'pax-monitor-v371-sla-pct-unit','pax-monitor-v380-auth-auto']);
  // Per-load preferences: the stored key is base+':'+load scope.
  const TAB_PREF_SCOPED=[K.paused,K.autoRefresh,K.displayHold];
  function isTabPrefKey(key){
    const k=String(key??'');
    return TAB_PREF_KEYS.has(k)||TAB_PREF_SCOPED.some(base=>k===base||k.startsWith(base+':'));
  }
  // sessionStorage can be unavailable or full (private modes, quota). The memory map is
  // the fallback store of record for this page; it mirrors every write so a setItem that
  // starts failing part-way through a session does not lose the values already set.
  const _tabPrefMemory=new Map();
  let _tabPrefSessionOk=true;
  function tabPrefRaw(slot){
    if(_tabPrefSessionOk){
      // Mirrored on the way out as well as on the way in: if getItem starts failing later
      // in the session (storage disabled mid-session, quota), the value this tab is
      // already using is still the answer, instead of the shared legacy value coming back.
      try{const v=sessionStorage.getItem(slot);if(v!==null){_tabPrefMemory.set(slot,v);return v}}
      catch{_tabPrefSessionOk=false}
    }
    return _tabPrefMemory.has(slot)?_tabPrefMemory.get(slot):null;
  }
  function tabPrefStore(slot,raw){
    _tabPrefMemory.set(slot,raw);
    if(!_tabPrefSessionOk)return;
    try{sessionStorage.setItem(slot,raw)}catch{_tabPrefSessionOk=false}
  }
  // Values are wrapped ({v:value}) so false, 0, '' and null are stored as themselves and
  // an empty wrapper ({}) means "this tab has no value" - which is what a reset writes,
  // and why a reset is not undone by re-inheriting the old shared value.
  const tabPrefEnvelope=value=>JSON.stringify(value===undefined?{}:{v:value});
  function tabPrefRead(key,fallback){
    const slot=TAB_PREF_NS+key;
    let raw=tabPrefRaw(slot);
    if(raw===null){
      let legacy;
      try{legacy=GM_getValue(key,undefined)}catch{legacy=undefined}
      raw=tabPrefEnvelope(legacy);
      tabPrefStore(slot,raw);
    }
    let box=null;
    try{box=JSON.parse(raw)}catch{box=null}
    if(!box||typeof box!=='object'||box.v===undefined)return fallback;
    return box.v;
  }
  function tabPrefWrite(key,value){tabPrefStore(TAB_PREF_NS+key,tabPrefEnvelope(value));return value}
  function tabPrefRemove(key){tabPrefStore(TAB_PREF_NS+key,'{}')}
  const REFRESH={1:60e3,2.5:150e3,5:300e3,10:600e3,15:900e3};
  const HUNTER_HOST='us-east-1.cx-hunter.eu-aces.amazon.dev';
  const HUNTER_API_HOST='api.us-east-1.cx-hunter.eu-aces.amazon.dev';
  const HUNTER_API_BASE='https://'+HUNTER_API_HOST;
  const isHunterPage=()=>location.hostname===HUNTER_HOST;
  const isAftPage=()=>!isHunterPage();
  const pageSource=()=>isHunterPage()?'hunter':'aft';
  const sourceLabel=s=>s==='hunter'?'CsX Hunter':s==='combined'?'AFT + Hunter':'AFT';
  const sourceShort=s=>s==='hunter'?'HUNTER':s==='combined'?'COMBINED':'AFT';
  // Data source preference is deliberately tab-scoped. GM storage is shared by every
  // userscript tab, which made changing one monitor switch all other open VRIDs too.
  // sessionStorage is isolated per top-level tab and survives normal reloads/navigation
  // on the same origin, so each monitor can independently stay on AFT/Hunter/Auto.
  const TAB_DATA_SOURCE_KEY='pax-monitor-v363-data-source';
  let _tabDataSourceMode=null;
  // Combined needs the AFT page (AFT hierarchy + hidden Hunter loader); a Hunter tab treats it as Hunter.
  function normalizeDataSourceMode(v){if(v==='combined')return isHunterPage()?'hunter':'combined';return ['aft','hunter','auto'].includes(v)?v:(isHunterPage()?'hunter':'aft')}
  const isCombinedMode=()=>isAftPage()&&dataSourceMode()==='combined';
  function dataSourceMode(){
    if(_tabDataSourceMode)return _tabDataSourceMode;
    try{
      const stored=sessionStorage.getItem(TAB_DATA_SOURCE_KEY);
      if(stored){_tabDataSourceMode=normalizeDataSourceMode(stored);return _tabDataSourceMode}
    }catch{}
    _tabDataSourceMode=normalizeDataSourceMode(null);
    return _tabDataSourceMode;
  }
  function setDataSourceMode(v){
    _tabDataSourceMode=normalizeDataSourceMode(v);
    try{sessionStorage.setItem(TAB_DATA_SOURCE_KEY,_tabDataSourceMode)}catch{}
    return _tabDataSourceMode;
  }
  const palletLike=id=>/^(?:paX|PALLET_)/i.test(clean(id));
  const pc99Like=id=>/^pc99/i.test(clean(id));
  // Loose-container markers. FLUID = load has no pallets at all; MIXED = pallets plus loose
  // cases/totes on the same load. Both mean "not on a pallet", so treat them alike.
  const FLUID_MARK='__FLUID__',MIXED_MARK='__MIXED__';
  const looseMark=v=>v===FLUID_MARK||v===MIXED_MARK;
  const looseLabel=v=>v===MIXED_MARK?'Mixed Load':v===FLUID_MARK?'Fluid Load':v;
  function stickyMixed(identity){const key=loadScopeKey(identity);try{return !!(read(K.mixedLoads,{})||{})[key]}catch{return false}}
  function rememberMixed(identity){
    if(duplicateViewOnly()||!sourceTrackingActive(identity))return;
    const key=loadScopeKey(identity);if(!key)return;
    try{const all=read(K.mixedLoads,{})||{};if(all[key])return;all[key]=Date.now();
      const cutoff=Date.now()-7*864e5;for(const [k,t] of Object.entries(all))if(Number(t)<cutoff)delete all[k];
      write(K.mixedLoads,all)}catch{}
  }
  // Decide fluid/mixed for a freshly built index and stamp loose containers with the right marker.
  function classifyLoose(identity,hasPallets,caseIndex,toteIndex){
    let loose=0;for(const idx of [caseIndex,toteIndex])for(const v of Object.values(idx))if(looseMark(v))loose++;
    const mixed=(hasPallets&&loose>0)||(loose>0&&stickyMixed(identity));
    if(mixed){rememberMixed(identity);for(const idx of [caseIndex,toteIndex])for(const [id,v] of Object.entries(idx))if(looseMark(v))idx[id]=MIXED_MARK}
    return {mixed,fluid:!mixed&&!hasPallets&&loose>0,looseContainers:loose};
  }
  // A container last seen on a pallet keeps that pallet even if AFT/Hunter briefly (or
  // after a refresh) lists it outside the pallet row. Only containers never seen on a
  // pallet count as loose, so pallet work is never relabelled as Mixed/Fluid Load.
  function reconcileLoose(prev,cur){
    if(!prev||!cur)return 0;let kept=0;
    for(const kind of ['case','tote']){
      const idx=cur[kind+'Index'],old=prev[kind+'Index'];if(!idx||!old)continue;
      for(const [id,v] of Object.entries(idx))if(looseMark(v)&&old[id]&&!looseMark(old[id])&&!cur[kind==='case'?'activeByCase':'activeByTote']?.[id]){idx[id]=old[id];kept++}
    }
    if(kept){
      let loose=0;for(const idx of [cur.caseIndex||{},cur.toteIndex||{}])for(const v of Object.values(idx))if(looseMark(v))loose++;
      cur.looseContainers=loose;if(!loose)cur.mixed=false;
    }
    return kept;
  }
  // Cleanup for 3.6.11 pre-release builds: drop pallet -> Mixed/Fluid "moves" (no stower).
  const falseLooseMove=r=>!!r&&r.kind!=='sap'&&!r.stower&&!looseMark(r.oldPallet)&&!!r.oldPallet&&looseMark(r.pallet);
  const dropZoneLike=id=>/^dz-/i.test(clean(id));
  const hunterPhysicalBin=id=>{const v=clean(id);return /(?:^|[-_])BIN(?:$|[-_])/i.test(v)||/^[A-Z]+-\d+-[A-Z0-9]+$/i.test(v)};
  function loadScopeKey(h=loadIdentity()){
    const id=clean(h?.loadId);return id?'vrid:'+id:clean(h?.shipRef||location.pathname)||location.pathname;
  }
  function sourceHealthKey(source,vrid){return (source==='hunter'?K.sourceHealthHunter:K.sourceHealthAft)+':'+clean(vrid)}
  function sourceHealth(source,vrid){return vrid?read(sourceHealthKey(source,vrid),null):null}
  function noteSourceHealth(source,h,ok,message=''){
    if(!h?.loadId||duplicateViewOnly())return;
    const freshness=refreshFreshness();
    const aftDataAt=Math.max(_pageLoadedDataAt,_lastConfirmedDataAt);
    const dataAt=source==='aft'?aftDataAt:freshness.dataAt;
    const payload={source,vrid:h.loadId,ok:!!ok,ts:Date.now(),dataAt,allowedMs:freshness.allowedMs,refreshHeld:['blocked','stalled'].includes(refreshPhase),message:clean(message),shipRef:h.shipRef||null};
    GM_setValue(sourceHealthKey(source,h.loadId),payload);perfStats.storageWrites++;
  }
  function freshAftHealthy(vrid){const x=sourceHealth('aft',vrid);return !!(x?.ok&&!x.refreshHeld&&Number(x.dataAt)>0&&Date.now()-Number(x.ts||0)<120000&&Date.now()-Number(x.dataAt)<Number(x.allowedMs||630000))}
  function sourceTrackingActive(h=loadIdentity()){
    // A Hunter tab feeding an AFT tab never tracks itself; the AFT tab owns that VRID.
    if(isHunterPage()&&hunterFeederRole(h))return false;
    const mode=dataSourceMode(),src=h?.source||pageSource();
    if(mode==='aft')return src==='aft';
    if(mode==='combined')return src==='aft'||src==='combined';
    if(mode==='hunter')return src==='hunter';
    if(src==='aft')return true;
    return !freshAftHealthy(h?.loadId);
  }
  function sourceStandbyReason(h=loadIdentity()){
    const mode=dataSourceMode(),src=h?.source||pageSource();
    // AFT can host a headless Hunter hierarchy, so Hunter Mode on an AFT page is active,
    // not standby. Only the standalone Hunter page can be sidelined by source selection.
    if(isHunterPage()&&hunterFeederRole(h))return 'Feeding the AFT tab (AFT tracks this load)';
    if(isHunterPage()&&mode==='aft')return 'AFT mode selected';
    if(isHunterPage()&&mode==='auto'&&src==='hunter'&&freshAftHealthy(h?.loadId))return 'AFT healthy; Hunter standing by';
    return '';
  }

  // 3.3.2 safe performance/storage backports. Storage keys intentionally remain v3.3.1-compatible.
  const MAX_RESULTS=5000;
  const PROCESSED_TTL=30*24*3600*1000;
  // Hierarchy cache invalidates on relevant mutations, not on every process call.
  const SCAN_MIN_GAP_MS=1000,SCAN_QUIET_MS=350,SCAN_MAX_WAIT_MS=3000;
  const PRUNE_INTERVAL_MS=60e3;
  const REFRESH_STALL_MS=90000,REFRESH_SETTLE_MS=500;
  const ORGANIZED_TTL=45*24*3600*1000;
  const MAX_ORGANIZED_LOADS=40;
  const SNAPSHOT_TTL=45*24*3600*1000;
  const MAX_SNAPSHOT_LOADS=40;
  const SEP='\u001f';
  let _hCache=null,_hCacheTime=0,_hCachePageKey='',_lastProcessEnd=0,_audioCtx=null,_lastPruneTime=0,_collapseGuardSince=0,_managedIndexMigrated=false,_pendingVisibleRender=false;
  const dedupKey=(shipRef,kind,caseId,oldP,newP)=>[shipRef,kind,caseId,oldP||'',newP||'STOWER'].join(SEP);
  const legacyDedupKey=(shipRef,kind,caseId,oldP,newP)=>[shipRef,kind,caseId,oldP||'',newP||'STOWER'].join('|');
  let _domRevision=0;
  function invalidateHierarchyCache(){_hCache=null;_hCacheTime=0;_hCachePageKey='';_domRevision++}
  function getHierarchy(){const pageKey=location.href;if(_hCache&&_hCachePageKey===pageKey&&Date.now()-_hCacheTime<60000)return _hCache;_hCache=hierarchy();_hCacheTime=Date.now();_hCachePageKey=pageKey;return _hCache}
  function pruneProcessed(map){const now=Date.now(),out={};for(const [k,v] of Object.entries(map||{})){const ts=Number(v)||0;if(!ts||now-ts<=PROCESSED_TTL)out[k]=v}return out}
  function clearProcessedForLoad(h){
    const scope=loadScopeKey(h),ship=h?.shipRef||'',kept={};
    for(const [k,v] of Object.entries(read(K.processed,{})||{})){
      let belongs=k.startsWith(scope+SEP)||k.startsWith(ship+SEP)||k.startsWith(ship+'|')||k.startsWith('sap371:'+scope+SEP);
      if(k.startsWith('obs371:'))try{const a=JSON.parse(k.slice(7));belongs=belongs||a[0]===scope||String(a[0]).startsWith(scope+SEP)}catch{}
      if(!belongs)kept[k]=v;
    }
    write(K.processed,kept);
  }
  function removeValue(key){
    if(isTabPrefKey(key)){tabPrefRemove(key);return}
    if(_storageBatch){_storageBatch.deleted.add(key);_storageBatch.dirty.add(key);_storageBatch.values.delete(key);return}
    GM_deleteValue(key);perfStats.storageWrites++;
  }
  function storedKeys(){try{return GM_listValues()}catch{return []}}
  function noteOrganizedKey(key){
    if(!key)return;
    const idx=read(K.organizedIndex,{})||{},now=Date.now();
    idx[key]=now;
    write(K.organizedIndex,idx);
  }
  function noteSnapshotKey(key,ts=Date.now()){
    if(!key)return;
    const idx=read(K.snapshotIndex,{})||{};
    idx[key]=Number(ts)||Date.now();
    write(K.snapshotIndex,idx);
  }
  function migrateManagedIndexes(){
    if(_managedIndexMigrated)return;_managedIndexMigrated=true;
    const keys=storedKeys();if(!keys.length)return;
    const org=read(K.organizedIndex,{})||{},snap=read(K.snapshotIndex,{})||{};
    let orgChanged=false,snapChanged=false;
    for(const key of keys){
      if(key.startsWith(K.organized)&&key!==K.organizedIndex&&!org[key]){
        const state=read(key,null),ts=Date.parse(state?.createdAt||'')||Date.now();org[key]=ts;orgChanged=true;
      }
      if(key.startsWith(K.snapshot)&&key!==K.snapshotIndex&&!snap[key]){
        const state=read(key,null),ts=Number(state?.capturedAt)||Date.now();snap[key]=ts;snapChanged=true;
      }
    }
    if(orgChanged)write(K.organizedIndex,org);
    if(snapChanged)write(K.snapshotIndex,snap);
  }
  function pruneIndexedData(indexKey,prefix,ttl,maxLoads){
    const idx=read(indexKey,{})||{},now=Date.now();
    const entries=Object.entries(idx).filter(([k])=>k&&k.startsWith(prefix)).sort((a,b)=>Number(b[1]||0)-Number(a[1]||0));
    const keep={},drop=[];
    entries.forEach(([k,ts],i)=>{
      const age=now-(Number(ts)||0);
      if(i<maxLoads&&(!Number(ts)||age<=ttl))keep[k]=ts;
      else drop.push(k);
    });
    for(const key of drop)removeValue(key);
    if(drop.length||Object.keys(keep).length!==entries.length)write(indexKey,keep);
  }
  function pruneOrganizedData(){pruneIndexedData(K.organizedIndex,K.organized,ORGANIZED_TTL,MAX_ORGANIZED_LOADS)}
  function pruneSnapshotData(){pruneIndexedData(K.snapshotIndex,K.snapshot,SNAPSHOT_TTL,MAX_SNAPSHOT_LOADS)}
  // 3.6.5: Hunter loader feed/meta/want entries are per shipment and were never removed.
  // Drop any not touched for 24 h, plus storage left by retired features.
  const FEED_PRUNE_MS=24*3600*1000;
  const RETIRED_KEYS=['pax-monitor-v361-hunter-api-probe-enabled','pax-monitor-v361-hunter-api-probe-log','pax-monitor-v364-stow-by'];
  let _feedPrunedAt=0;
  function pruneHunterFeedData(force=false){
    const now=Date.now();if(!force&&now-_feedPrunedAt<3600e3)return;_feedPrunedAt=now;
    const P={feed:'pax-monitor-v364-hunter-feed:',meta:'pax-monitor-v364-hunter-feed-meta:',want:'pax-monitor-v364-hunter-feed-want:'};
    const keys=storedKeys(),fresh=new Set(),small=(key,field)=>{let v=null;try{v=GM_getValue(key,null)}catch{}return Number(v?.[field])||0};
    for(const key of keys){
      if(RETIRED_KEYS.includes(key)){removeValue(key);continue}
      // Only the small meta/want records are read; a feed can hold 40k rows.
      const kind=key.startsWith(P.meta)?'meta':key.startsWith(P.want)?'want':null;if(!kind)continue;
      const ts=small(key,kind==='meta'?'aliveAt':'at'),sid=key.slice(P[kind].length);
      if(ts&&now-ts<=FEED_PRUNE_MS)fresh.add(sid);else removeValue(key);
    }
    for(const key of keys)if(key.startsWith(P.feed)&&!fresh.has(key.slice(P.feed.length)))removeValue(key);
  }
  function purgeOldData(){
    migrateManagedIndexes();
    const currentProcessed=read(K.processed,{})||{};
    const processed=pruneProcessed(currentProcessed);
    if(JSON.stringify(processed)!==JSON.stringify(currentProcessed))write(K.processed,processed);
    let results=Array.isArray(read(K.results,[]))?read(K.results,[]):[];
    const cleaned=results.filter(r=>!falseLooseMove(r));
    if(cleaned.length!==results.length){results=cleaned;write(K.results,results)}
    if(results.length>MAX_RESULTS)write(K.results,results.slice(0,MAX_RESULTS));
    pruneOrganizedData();pruneSnapshotData();pruneHunterFeedData();
  }
  // Every tab ran the whole purge every PRUNE_INTERVAL_MS, so N tabs cost N
  // full-store passes a minute while holding the one storage lock. The shared
  // timestamp is read through the transaction batch, i.e. the value GM.getValue
  // loaded after this tab acquired the lock, so the loser of a race sees the
  // winner's write and skips. Migration is never skipped: _managedIndexMigrated
  // is per page and purgeOldData is what performs the migration.
  const PRUNE_SHARE_SLACK_MS=5e3;
  function maintenanceDue(now=Date.now()){
    if(!_managedIndexMigrated)return true;
    const last=Number(read(K.lastPrune,0))||0;
    return !last||last>now||now-last>=PRUNE_INTERVAL_MS-PRUNE_SHARE_SLACK_MS;
  }
  function runSharedMaintenance(now=Date.now()){
    if(duplicateViewOnly())return false;
    if(!maintenanceDue(now)){perfStats.maintenanceSkipped++;_lastPruneTime=now;return false}
    purgeOldData();
    write(K.lastPrune,now);
    _lastPruneTime=now;perfStats.maintenanceRuns++;
    return true;
  }

  // Lock ownership is provided by the browser, never by a read/then-write GM value.
  // Web Locks are origin-scoped. Use ONE AFT hostname for every tab in this profile.
  const REFRESH_LOCK_NAME='pax-monitor-refresh-v3515';
  const STORAGE_LOCK_NAME='pax-monitor-storage-v3515';
  const TAB_ID=globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+'-'+Date.now();
  const perfStats={scans:0,skipped:0,mutations:0,ignoredMutations:0,cosmeticIconChangesIgnored:0,storageWrites:0,lockWaitMs:0,storageWriteMs:0,lockAcquisitions:0,maintenanceRuns:0,maintenanceSkipped:0,lastTransaction:null,lastScan:null,recentScans:[],lastRefresh:null};
  const clockNow=()=>globalThis.performance?.now?.()??Date.now();
  const round1=ms=>Math.round((Number(ms)||0)*10)/10;
  function requireLocks(){
    if(!navigator.locks?.request)throw Error('Web Locks unavailable: automatic refresh and shared-history writes disabled. Use current Firefox on HTTPS.');
  }
  // Claim one origin under the storage lock. This is a configuration guard, NOT a
  // cross-origin mutex. Mixed origins are unsupported; the README explains migration.
  const ORIGIN_KEY='pax-monitor-v3515-storage-origin';
  function checkStorageOrigin(){
    if(!isAftPage())return;
    const selected=GM_getValue(ORIGIN_KEY,null);
    if(selected&&selected!==location.origin)throw Error('Use the same AFT hostname as your other AFT tabs: '+selected);
    if(!selected)GM_setValue(ORIGIN_KEY,location.origin);
  }
  let _storageBatch=null;
  function storageTransaction(fn,extraKeys=[],maintenance=false,options={}){
    if(_storageBatch)throw Error('Nested storage transaction');
    return storageTransactionLocked(fn,extraKeys,maintenance,options);
  }
  async function storageTransactionLocked(fn,extraKeys=[],maintenance=false,options={}){
    requireLocks();
    if(!globalThis.GM?.getValue||!GM.setValue||!GM.listValues||!GM.deleteValue)throw Error('Async Tampermonkey storage API unavailable; reinstall this userscript.');
    const lockRequestedAt=clockNow();
    return navigator.locks.request(STORAGE_LOCK_NAME,{mode:'exclusive'},async()=>{
      // Time spent waiting for another tab's lock is not time spent scanning this
      // page; keeping them apart is what tells a slow parse from a contended store.
      const lockWaitMs=clockNow()-lockRequestedAt;
      perfStats.lockWaitMs+=lockWaitMs;perfStats.lockAcquisitions++;
      if(options.tracking&&(duplicateViewOnly()||!sourceTrackingActive(options.tracking)))return {standby:true};
      if(isAftPage()){
        const selected=await GM.getValue(ORIGIN_KEY,null);
        if(selected&&selected!==location.origin)throw Error('Use the same AFT hostname as your other AFT tabs: '+selected);
        if(!selected)await GM.setValue(ORIGIN_KEY,location.origin);
      }
      const keys=new Set([...(options.historyNeeded?[]:[K.results,K.processed]),K.organizedIndex,K.snapshotIndex,K.organized+location.pathname,K.snapshot+location.pathname,...extraKeys]);
      if(maintenance&&!_managedIndexMigrated)for(const key of await GM.listValues())if(key.startsWith(K.organized)||key.startsWith(K.snapshot))keys.add(key);
      const readAt=clockNow();
      const values=new Map(await Promise.all([...keys].map(async key=>[key,await GM.getValue(key,undefined)])));
      if(options.historyNeeded&&options.historyNeeded(key=>values.get(key))){
        for(const key of [K.results,K.processed]){keys.add(key);values.set(key,await GM.getValue(key,undefined));}
      }
      if(options.tracking&&(duplicateViewOnly()||!sourceTrackingActive(options.tracking)))return {standby:true};
      const readMs=clockNow()-readAt;
      const batch={values,dirty:new Set(),deleted:new Set(),prunedProcessed:null};
      if(_storageBatch)throw Error('Nested storage transaction');
      let result;
      _storageBatch=batch;
      try{
        result=fn();
        if(result&&typeof result.then==='function')throw Error('Storage transaction callback must be synchronous');
      }finally{_storageBatch=null}
      // Await extension persistence before another tab acquires the browser lock.
      // Save recoverable history first, duplicate keys next, snapshots last.
      // This coalesces writes; it is NOT a crash-atomic database commit.
      const priority=k=>k===K.processed?2:k.startsWith(K.snapshot)?3:1;
      const writeAt=clockNow(),writeCount=batch.dirty.size;
      for(const key of [...batch.dirty].sort((a,b)=>priority(a)-priority(b))){
        if(batch.deleted.has(key))await GM.deleteValue(key);else await GM.setValue(key,batch.values.get(key));
        perfStats.storageWrites++;
      }
      const writeMs=clockNow()-writeAt;
      perfStats.storageWriteMs+=writeMs;
      perfStats.lastTransaction={at:Date.now(),maintenance:!!maintenance,keys:keys.size,writes:writeCount,lockWaitMs:round1(lockWaitMs),readMs:round1(readMs),writeMs:round1(writeMs)};
      if(batch.sound)beep();
      return result;
    });
  }
  function userStorageAction(fn){return storageTransaction(()=>{if(duplicateViewOnly())throw Error('View-only tab: use the primary tab to change history');return fn()}).catch(reportMonitorError)}
  function ownerInfo(){return refreshBarrier()||read(K.refreshOwner,null)}
  function writeOwner(state){
    const owner={tabId:TAB_ID,vrid:loadIdentity().loadId,source:pageSource(),origin:location.origin,startedAt:lastRefreshAt,state};
    write(K.refreshOwner,owner);logRefreshEvent(state,{startedAt:lastRefreshAt});return owner;
  }

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const read=(k,d)=>{
    if(k===K.originBuilding||k===K.oneDcTrailers)return pmmSiteRead(k,d);
    // Preferences never enter the shared batch: they are read from, and written to, this
    // tab's own store even inside a storage transaction.
    if(isTabPrefKey(k))return tabPrefRead(k,d);
    if(_storageBatch){
      if(!_storageBatch.values.has(k))_storageBatch.values.set(k,GM_getValue(k,d));
      return _storageBatch.deleted.has(k)||_storageBatch.values.get(k)===undefined?d:_storageBatch.values.get(k);
    }
    return GM_getValue(k,d);
  };
  const write=(k,v)=>{
    if(k===K.originBuilding||k===K.oneDcTrailers){pmmSiteWrite(k,v);return}
    if(isTabPrefKey(k)){tabPrefWrite(k,v);return}
    if(_storageBatch){_storageBatch.values.set(k,v);_storageBatch.deleted.delete(k);_storageBatch.dirty.add(k);return}
    GM_setValue(k,v);perfStats.storageWrites++;
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const hrefId=a=>{try{return new URLSearchParams(new URL(a.href,location.href).search).get('s')}catch{return null}};
  let _parseMemo=null,_typeGroups=null;
  function memoValue(node,key,compute){
    if(!_parseMemo||!node)return compute();
    let row=_parseMemo.get(node);if(!row){row={};_parseMemo.set(node,row)}
    if(!Object.prototype.hasOwnProperty.call(row,key))row[key]=compute();return row[key];
  }
  const idFromDetails=d=>memoValue(d,'id',()=>{
    const a=d?.querySelector?.(':scope > .col-xs-3 span.container-scannableId a[href*="results?s="], span.container-scannableId a[href*="results?s="]');
    return clean(a?.textContent)||hrefId(a)||null;
  });
  const hrefFromDetails=d=>memoValue(d,'href',()=>d?.querySelector?.(':scope > .col-xs-3 span.container-scannableId a[href], span.container-scannableId a[href]')?.href||null);
  const typeFromDetails=d=>memoValue(d,'type',()=>clean(d?.querySelector?.('.container-containerType')?.textContent).toUpperCase());
  const statusFromDetails=d=>memoValue(d,'status',()=>clean(d?.querySelector?.('.container-containerStatus')?.textContent));
  const qtyFromDetails=d=>memoValue(d,'qty',()=>{const raw=clean(d?.querySelector?.('.container-items')?.textContent);const m=raw.match(/[\d,]+/);return m?Number(m[0].replace(/,/g,''))||0:0});
  const itemsFromDetails=d=>memoValue(d,'items',()=>{const row=rowForDetails(d);if(!row)return [];const totals=new Map();for(const skuEl of row.querySelectorAll('.item-fcSku')){const sku=clean(skuEl.textContent);if(!sku||/^fcsku$/i.test(sku))continue;const itemRow=skuEl.closest?.('.row.details')||skuEl.parentElement;if(!itemRow)continue;const raw=clean(itemRow.querySelector?.('.item-quantity')?.textContent);const m=raw.match(/[\d,]+/);const qty=m?Number(m[0].replace(/,/g,''))||0:0;if(qty<=0)continue;const href=skuEl.querySelector?.('a[href]')?.href||null;const prev=totals.get(sku)||{quantity:0,href};prev.quantity+=qty;if(!prev.href&&href)prev.href=href;totals.set(sku,prev)}return [...totals].map(([fcSku,v])=>({fcSku,quantity:v.quantity,href:v.href||null}))});
  const detailsForRow=row=>memoValue(row,'details',()=>row?.querySelector?.(':scope > div[id$="-details"]')||row?.querySelector?.('div[id$="-details"]')||null);
  const rowForDetails=d=>memoValue(d,'row',()=>d?.closest?.('div[id$="-row"], .row.container-fluid')||d?.parentElement||null);

  function childRows(row){
    const holder=row?.querySelector?.(':scope > div[id$="-children"]');
    if(!holder) return [];
    return Array.from(holder.querySelectorAll('div[id$="-row"]')).filter(x=>x.closest('div[id$="-children"]')===holder);
  }

  function directChildDetails(row){return memoValue(row,'children',()=>childRows(row).map(detailsForRow).filter(Boolean))}

  // Single per-pass DOM scan shared by every *Details() getter and the containerLinks
  // build below. hierarchy() resets this at the start/end of each computation so it never
  // serves stale nodes across separate passes.
  let _allDetailsSnapshot=null,_lastCaseRows=0;
  function allDetailsNodes(){
    return _allDetailsSnapshot||(_allDetailsSnapshot=Array.from(document.querySelectorAll('div[id$="-details"]')));
  }

  function detailGroups(){
    if(_typeGroups)return _typeGroups;
    const groups={PALLET:[],CASE:[],TRANSFER_TOTE:[],PERSONAL_CONTAINER:[]};
    for(const d of allDetailsNodes()){
      const t=typeFromDetails(d);if(!groups[t])continue;const id=idFromDetails(d);if(!id)continue;
      if(t==='PERSONAL_CONTAINER'&&!/^pc99/i.test(id))continue;groups[t].push(d);
    }
    return _typeGroups=groups;
  }
  const palletDetails=()=>detailGroups().PALLET;
  const caseDetails=()=>detailGroups().CASE;
  const toteDetails=()=>detailGroups().TRANSFER_TOTE;
  const pc99Details=()=>detailGroups().PERSONAL_CONTAINER;

  // Walk only a container's own children. This is the key fix: no page-wide
  // sibling scanning and no assumptions about pallet naming.
  function containersUnderPallet(palletD,type){
    const out=[];
    const walk=(row)=>{
      for(const childD of directChildDetails(row)){
        const t=typeFromDetails(childD), id=idFromDetails(childD);
        if(t===type && id && !/^unlabelled case$/i.test(id)) out.push(id);
        // A tote may contain cases. Do not treat those as direct pallet cases.
        if(t!=='CASE' && t!=='TRANSFER_TOTE' && t!=='PALLET') walk(rowForDetails(childD));
      }
    };
    walk(rowForDetails(palletD));
    return [...new Set(out)];
  }

  let _hunterCsv={shipmentId:null,containers:[],locations:[],loadedAt:0,error:'',blobKey:''},_hunterCsvPromise=null;
  function parseCsvText(text){
    const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<String(text||'').length;i++){
      const ch=text[i];
      if(quoted){
        if(ch==='"'&&text[i+1]==='"'){field+='"';i++;}
        else if(ch==='"')quoted=false;
        else field+=ch;
      }else if(ch==='"')quoted=true;
      else if(ch===','){row.push(field);field='';}
      else if(ch==='\n'){row.push(field);rows.push(row);row=[];field='';}
      else if(ch!=='\r')field+=ch;
    }
    if(field||row.length){row.push(field);rows.push(row)}
    const head=(rows.shift()||[]).map(clean),out=[];
    for(const vals of rows){if(!vals.some(v=>clean(v)))continue;const obj={};head.forEach((h,i)=>obj[h]=clean(vals[i]??''));out.push(obj)}
    return out;
  }
  function hunterDetailTitleNode(){return [...document.querySelectorAll('h6')].find(x=>/^Transshipment:\s*/i.test(clean(x.textContent)))||null}
  function hunterShipmentInfo(){
    const node=hunterDetailTitleNode(),title=clean(node?.textContent);
    const shipmentId=clean(title.replace(/^Transshipment:\s*/i,''))||null;
    const parts=shipmentId?shipmentId.split('_'):[];
    return {shipmentId,source:parts[0]||null,destination:parts[1]||null};
  }
  function hunterSummary(){
    const detailRoot=hunterDetailTitleNode()?.closest?.('.MuiPaper-root')||null;
    const tables=[...(detailRoot?.querySelectorAll?.('table')||document.querySelectorAll('table'))];
    for(const table of tables){
      const headers=[...table.querySelectorAll('thead th')].map(th=>clean(th.textContent));
      const vi=headers.findIndex(x=>/^VRID$/i.test(x)),si=headers.findIndex(x=>/^Status$/i.test(x)),di=headers.findIndex(x=>/Stow By Date/i.test(x));
      if(vi<0||si<0||di<0)continue;
      const rows=[...table.querySelectorAll('tbody tr')];
      for(const tr of rows){
        const cells=[...tr.querySelectorAll(':scope > td')];if(cells.length<=Math.max(vi,si,di))continue;
        const vrid=clean(cells[vi]?.textContent);if(!vrid||/filter data/i.test(vrid))continue;
        const raw=cells[di]?.getAttribute('value');let stowByAt=Number(raw)||0;if(stowByAt&&stowByAt<1e12)stowByAt*=1000;
        if(!stowByAt){const parsed=Date.parse(clean(cells[di]?.textContent).replace(' ','T'));if(Number.isFinite(parsed))stowByAt=parsed}
        const qtyI=headers.findIndex(x=>/^Total Qty$/i.test(x));
        const remI=headers.findIndex(x=>/Remaining (?:Reactive )?Qty/i.test(x));
        return {loadId:vrid,status:clean(cells[si]?.textContent)||null,stowByAt:stowByAt||0,totalQty:qtyI>=0?Number(cells[qtyI]?.getAttribute('value')||clean(cells[qtyI]?.textContent))||0:0,remainingQty:remI>=0?Number(cells[remI]?.getAttribute('value')||clean(cells[remI]?.textContent))||0:0};
      }
    }
    return {loadId:null,status:null,stowByAt:0,totalQty:0,remainingQty:0};
  }
  function hunterIdentity(){
    const ship=hunterShipmentInfo(),sum=hunterSummary();
    return {loadId:sum.loadId,trailerName:ship.source||null,shipRef:ship.shipmentId?'hunter:'+ship.shipmentId:location.pathname,shipmentId:ship.shipmentId,destinationWarehouse:ship.destination||null,status:sum.status,stowByAt:sum.stowByAt,totalQty:sum.totalQty,remainingQty:sum.remainingQty,source:'hunter'};
  }
  // AFT renders a sentence such as "No appointment information found." inside #loadId when a
  // trailer has no appointment. Storing that text as a VRID poisoned heartbeats, load scopes
  // and per-VRID storage keys, so it is read as an absent load ID instead. Rejection is limited
  // to known placeholder text and anchored missing-appointment messages; no VRID length or
  // character shape is assumed, so unusual real identities such as ERROR-123 keep working.
  const MISSING_ID_TEXT=new Set(['na','n a','nil','none','null','undefined','unknown','unavailable','unassigned','missing','empty','blank','pending','tbd','tba','no vrid','no vrid found','no load','no load id','no trailer','no trailer found','no appointment','no appointment found','no appointment information','no appointment information found','no appointment information available','no information','no information found','no data','no data found','not found','not available','not applicable','no results','no results found']);
  // Only a multi-word page message is matched here, anchored end to end.
  const MISSING_APPOINTMENT=/^no appointment(?: (?:information|info|data|details))?(?: (?:found|available|present|on file))?$/;
  function missingIdText(raw){
    const text=clean(raw);if(!text)return true;
    const norm=text.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    if(!norm)return true;
    if(MISSING_ID_TEXT.has(norm))return true;
    return /\s/.test(text)&&MISSING_APPOINTMENT.test(norm);
  }
  function pageLoadId(raw){const text=clean(raw);return !text||missingIdText(text)?null:text}
  function loadIdentity(){
    if(isHunterPage())return hunterIdentity();
    const parts=location.pathname.split('/');
    const loadId=pageLoadId(document.querySelector('#loadId')?.textContent);
    const trailerName=clean(document.querySelector('#sourceWarehouseId')?.textContent)||null;
    const shipmentId=clean(document.querySelector('#shipRef')?.textContent)||((parts[2]==='stowing-in-progress'&&parts[3])?decodeURIComponent(parts[3]):null);
    const destinationWarehouse=clean(document.querySelector('#destinationWarehouseId')?.textContent)||(parts[1]||null);
    return {loadId,trailerName,shipRef:location.pathname,shipmentId:shipmentId||null,destinationWarehouse:destinationWarehouse||null,source:'aft'};
  }
  // Read only AFT's trailer summary, never the monitor's own labels or hierarchy rows.
  // No cache/storage: navigation and missing fields cannot reuse another load's quantities.
  function parseAftQuantity(raw){
    const text=String(raw??'').trim();
    if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(text))return null;
    const n=Number(text.replace(/,/g,''));return Number.isSafeInteger(n)&&n>=0?n:null;
  }
  function aftTrailerQuantities(){
    const out={source:'aft-summary',loadId:null,shipmentId:null,totalUnits:null,itemsForReconcile:null,totalItemsPending:null,nonReservePending:null,pendingUnavailable:false,unavailableReason:''};
    const unavailable=reason=>({...out,unavailableReason:reason});
    if(!isAftPage())return unavailable('Available on the AFT trailer page only');
    const roots=[...document.querySelectorAll('#summary')].filter(n=>!n.closest('#pax-monitor-v311'));
    if(roots.length!==1)return unavailable('AFT trailer summary unavailable');
    const root=roots[0],one=selector=>{const nodes=root.querySelectorAll(selector);return nodes.length===1?nodes[0]:null};
    const loadId=pageLoadId(one('#loadId')?.textContent),shipmentId=clean(one('#shipRef')?.textContent);
    const identity=loadIdentity();
    let routeShipment='';try{const parts=location.pathname.split('/');if(parts[2]==='stowing-in-progress')routeShipment=decodeURIComponent(parts[3]||'')}catch{return unavailable('AFT trailer identity unavailable')}
    if(!loadId||!shipmentId||loadId!==identity.loadId||shipmentId!==identity.shipmentId||(routeShipment&&routeShipment!==shipmentId))return unavailable('AFT trailer identity unavailable or changing');
    out.loadId=loadId;out.shipmentId=shipmentId;
    const label=name=>{const nodes=[...root.querySelectorAll('strong')].filter(n=>clean(n.textContent).replace(/:$/,'').toLowerCase()===name);return nodes.length===1?nodes[0]:null};
    const total=label('total units'),cell=total?.parentElement,row=cell?.parentElement;
    // Observed AFT markup: a two-cell .row (label cell followed by its value cell).
    if(row?.classList.contains('row')&&row.children.length===2&&row.firstElementChild===cell&&clean(cell.textContent)===clean(total.textContent))out.totalUnits=parseAftQuantity(cell.nextElementSibling?.textContent);
    const alerts=[...root.querySelectorAll('#unvailableExplanationDivId')];
    out.pendingUnavailable=alerts.some(n=>!n.hidden&&getComputedStyle(n).display!=='none');
    if(out.pendingUnavailable){out.unavailableReason='AFT reports pending counts temporarily unavailable';return out}
    out.itemsForReconcile=parseAftQuantity(one('#quantityItemsReconcile')?.textContent);
    out.totalItemsPending=parseAftQuantity(one('#quantityItemsTotal')?.textContent);
    // Non-Reserve Pending is an inline label and value, not Reserve Units or Total Pending.
    const nonReserve=label('non-reserve pending');
    if(nonReserve){const cell=nonReserve.parentElement;if(cell?.firstElementChild===nonReserve&&clean(cell.textContent).startsWith(clean(nonReserve.textContent)))out.nonReservePending=parseAftQuantity(clean(cell.textContent).slice(clean(nonReserve.textContent).length).trim())}
    if([out.totalUnits,out.itemsForReconcile,out.totalItemsPending,out.nonReservePending].some(n=>n===null))out.unavailableReason='Some AFT quantities are missing, invalid or ambiguous';
    return out;
  }
  let _hunterApi={shipmentId:null,identity:null,containers:[],locations:[],loadedAt:0,error:'',classification:null,url:''},_hunterApiPromise=null;
  let _hunterApiLast=null,_hunterFailCount=0;
  function gmJson(url,timeout=25000){
    return new Promise((resolve,reject)=>{
      const fail=(msg,extra={})=>{_hunterApiLast={...(_hunterApiLast||{}),url,at:Date.now(),error:msg,...extra};reject(Error(msg))};
      try{
        GM_xmlhttpRequest({method:'GET',url,timeout,anonymous:false,headers:{Accept:'application/json'},
          onload:r=>{
            const status=Number(r.status)||0,finalUrl=String(r.finalUrl||url),text=String(r.responseText||'');
            const contentType=((String(r.responseHeaders||'').match(/^content-type:\s*([^\r\n;]+)/im)||[])[1]||'').trim();
            let finalHost='';try{finalHost=new URL(finalUrl).hostname}catch{}
            _hunterApiLast={url,finalUrl,status,contentType,bytes:text.length,at:Date.now(),error:''};
            // Body snippets are kept only on failure, and only the first 300 characters.
            const snip={snippet:text.slice(0,300)};
            if(finalHost&&finalHost!==HUNTER_API_HOST)return fail(`Hunter API redirected to ${finalHost} (sign-in). Open Hunter, sign in, then wait for the retry.`,snip);
            if(status===401||status===403)return fail(`Hunter API HTTP ${status}: not authorized from AFT. Open Hunter and sign in; if it keeps failing, Hunter needs a token the AFT page cannot send.`,snip);
            if(status<200||status>=300)return fail(`Hunter API HTTP ${status||'0 (no response)'}`,snip);
            if(!/json/i.test(contentType)&&/^\s*</.test(text))return fail('Hunter API returned a web page instead of data (usually a sign-in page). Open Hunter, sign in, then wait for the retry.',snip);
            try{resolve(JSON.parse(text||'null'))}catch(err){fail('Hunter API returned invalid JSON: '+clean(err?.message||err),snip)}
          },
          onerror:r=>fail('Hunter API request blocked or failed'+(r?.status?' (HTTP '+r.status+')':'')+'. Check the Tampermonkey cross-origin permission for '+HUNTER_API_HOST+'.'),
          ontimeout:()=>fail('Hunter API request timed out')});
      }catch(err){fail(clean(err?.message||err))}
    });
  }
  function payloadShape(v){
    try{
      if(Array.isArray(v))return 'array['+v.length+']'+(v[0]&&typeof v[0]==='object'?' of {'+Object.keys(v[0]).slice(0,12).join(',')+'}':'');
      if(v&&typeof v==='object')return '{'+Object.entries(v).slice(0,12).map(([k,x])=>k+(Array.isArray(x)?'['+x.length+']':'')).join(',')+'}';
      return typeof v;
    }catch{return 'unknown'}
  }
  // 3.6.5: Hunter's Stow By was inaccurate, so it is no longer saved, looked up or shown.
  const STOW_BY_TTL=7*24*3600*1000;
  function firstValue(obj,names){
    if(!obj||typeof obj!=='object')return undefined;
    const map=new Map(Object.keys(obj).map(k=>[k.toLowerCase(),k]));
    for(const name of names){const key=map.get(String(name).toLowerCase());if(key!==undefined&&obj[key]!==undefined&&obj[key]!==null)return obj[key]}
    return undefined;
  }
  function primitiveLocation(v){
    if(v==null)return '';
    if(typeof v==='string'||typeof v==='number')return clean(v);
    if(typeof v==='object')return clean(firstValue(v,['scannableId','location','locationId','name','id','binId','containerId']));
    return '';
  }
  function findContainerArray(payload){
    const seen=new Set();let best=[];
    const visit=(v,depth=0)=>{
      if(v==null||depth>6||typeof v!=='object'||seen.has(v))return;seen.add(v);
      if(Array.isArray(v)){
        const score=v.slice(0,20).reduce((n,x)=>n+(x&&typeof x==='object'&&firstValue(x,['scannableId','containerScannableId','containerId'])!==undefined?1:0),0);
        if(score&&v.length>best.length)best=v;
        for(const x of v.slice(0,8))visit(x,depth+1);return;
      }
      for(const [k,x] of Object.entries(v)){
        if(Array.isArray(x)&&/(container|result|item|data)/i.test(k)){const score=x.slice(0,20).reduce((n,o)=>n+(o&&typeof o==='object'&&firstValue(o,['scannableId','containerScannableId','containerId'])!==undefined?1:0),0);if(score&&x.length>best.length)best=x}
        visit(x,depth+1);
      }
    };visit(payload);return best;
  }
  function normalizeHunterApiRows(payload){
    const arr=findContainerArray(payload),out=[];
    for(const x of arr){
      if(!x||typeof x!=='object')continue;
      const scannableId=clean(firstValue(x,['scannableId','containerScannableId','containerId','scannableID']));if(!scannableId)continue;
      const containerStatus=clean(firstValue(x,['containerStatus','transshipmentContainerStatus','status','containerState']));
      const location=primitiveLocation(firstValue(x,['location','currentLocation','locationId','locationScannableId','containerLocation','parentContainerScannableId','stowLocation','destination','outermostScannableId']));
      const unitCount=Number(firstValue(x,['unitCount','quantity','qty','units','reactiveUnits','oneDcUnits','totalQty']))||0;
      const stowRaw=firstValue(x,['stowByDate','stowByDateUtc','needToReceiveByDate','stowByAt']);
      out.push({scannableId,containerStatus,location,unitCount,stowByDate:stowRaw??''});
    }
    return out;
  }
  function deriveHunterLocations(rows){
    const map=new Map();
    for(const r of rows||[]){const loc=clean(r.location);if(!loc)continue;const prev=map.get(loc)||{location:loc,unitCount:0,stowByDate:r.stowByDate||''};prev.unitCount+=(Number(r.unitCount)||0);if(!prev.stowByDate&&r.stowByDate)prev.stowByDate=r.stowByDate;map.set(loc,prev)}
    return [...map.values()];
  }
  function hunterApiAftIdentity(detail){
    const aft=loadIdentity(),t=detail?.transshipment||detail?.data?.transshipment||detail?.data||detail||{};
    const shipmentId=clean(firstValue(t,['amazonShipmentRefId','shipmentId']))||aft.shipmentId||null;
    const loadId=clean(firstValue(t,['vrid','loadId']))||aft.loadId||null;
    const trailerName=clean(firstValue(t,['sourceWarehouseId','sourceWarehouse','originWarehouseId']))||aft.trailerName||null;
    const destinationWarehouse=clean(firstValue(t,['warehouseId','destinationWarehouseId','destinationWarehouse']))||aft.destinationWarehouse||null;
    const stowByAt=Number(firstValue(t,['needToReceiveByDate','stowByDate','stowByAt']))||0;
    const totalQty=Number(firstValue(t,['reactiveQty','totalQty','oneDcQty','1dcQty']))||0;
    const remainingQty=Number(firstValue(t,['reactiveQtyRemaining','totalQtyRemaining','oneDcQtyRemaining','1dcQtyRemaining','remainingQty']))||0;
    return {loadId,trailerName,shipRef:shipmentId?'hunter:'+shipmentId:aft.shipRef,shipmentId,destinationWarehouse,status:clean(firstValue(t,['transshipmentStatus','status']))||null,stowByAt,totalQty,remainingQty,source:'hunter'};
  }
  // 3.6.10: trailers/shipments whose name starts with an entry of Settings > Site >
  // 1DC buildings run as 1DC (defaults QYY4 and INC1); every other trailer is normally REACTIVE.
  const DEFAULT_ONE_DC=['QYY4','INC1'],DEFAULT_ORIGIN='LGA9';
  const parseCodeList=v=>[...new Set(String(v??'').toUpperCase().split(/[\s,;]+/).map(x=>x.replace(/[^A-Z0-9_-]/g,'')).filter(Boolean))].slice(0,30);
  function oneDcList(){const v=read(K.oneDcTrailers,null);return Array.isArray(v)?v:DEFAULT_ONE_DC}
  function isOneDc(name){const n=clean(name).toUpperCase();return !!n&&oneDcList().some(p=>n.startsWith(p))}
  function originBuilding(){const v=read(K.originBuilding,null);return typeof v==='string'?v:DEFAULT_ORIGIN}
  const _hunterClassByShipment=new Map();
  function hunterClassificationOrder(identity,aft){
    const oneDc=pmmLoadIsOneDc(identity)||pmmLoadIsOneDc(aft);
    const remembered=_hunterClassByShipment.get(identity?.shipmentId);
    // 1DC loads fall back to an unclassified request (same containers on a 1DC-only trailer),
    // never to REACTIVE. Non-1DC loads try REACTIVE first, then unclassified.
    const base=oneDc?['ONE_DC',null]:['REACTIVE',null];
    // A remembered request must not override a newly discovered classification.
    return base.includes(remembered)?[remembered,...base.filter(c=>c!==remembered)]:base;
  }
  function hunterApiUrlForContainers(identity,classification){
    const q=new URLSearchParams({amazonShipmentRefId:identity.shipmentId,excludeAsinList:'true'});if(classification)q.set('classification',classification);
    return `${HUNTER_API_BASE}/api/containers/${encodeURIComponent(identity.destinationWarehouse)}?${q}`;
  }
  // ---- Hunter loader feed (hidden iframe, or a Hunter tab the user opened) ----------
  // GM storage is shared by every tab running this script, AFT and Hunter origins alike
  // (localStorage and Web Locks are not), so it is the bridge between the two tabs.
  //   want:<shipRef>  written by the AFT tab: heartbeat (at) + optional fresh-data request
  //   feed:<shipRef>  written by the Hunter tab: compact container rows + identity
  //   meta:<shipRef>  written by the Hunter tab: liveness + which request it answered
  // Chrome throttles timers in background tabs to about once a minute, so both heartbeats
  // get a 3 min window; value-change listeners still deliver requests instantly.
  const FEED_WANT_FRESH_MS=180000,FEED_ALIVE_MS=180000,FEED_KNOWN_MS=10*60e3,FEED_WAIT_MS=120000,FEED_MAX_ROWS=40000,FEED_OPEN_COOLDOWN_MS=5*60e3,FEED_STALE_MS=20*60e3;
  const FEED_HANDLED_KEY='pax-monitor-v364-feed-handled';
  const PAGE_LOADED_AT=Date.now();
  const feedKey=(base,sid)=>base+':'+clean(sid);
  function gmGet(key,fb=null){try{const v=GM_getValue(key,fb);return v===undefined?fb:v}catch{return fb}}
  function gmSet(key,v){try{GM_setValue(key,v);perfStats.storageWrites++;return true}catch(err){console.warn('[Pallet Movement Monitor] feed write failed',err);return false}}
  function hunterTrailerUrl(h=loadIdentity()){
    const dest=clean(h?.destinationWarehouse)||originBuilding(),sid=clean(h?.shipmentId);
    if(!dest||!sid)return 'https://'+HUNTER_HOST+'/';
    const kind=pmmLoadIsOneDc(h)?'1dc':'reactive';
    return `https://${HUNTER_HOST}/${kind}/transshipments/${encodeURIComponent(dest)}/${encodeURIComponent(sid)}`;
  }
  function openHunterTrailer(h=loadIdentity(),background=false){
    const url=hunterTrailerUrl(h);
    try{if(typeof GM_openInTab==='function'){GM_openInTab(url,{active:!background,insert:true,setParent:true});return url}}catch{}
    window.open(url,'_blank','noopener');return url;
  }
  function feedWant(sid){const w=sid?gmGet(feedKey(K.hunterFeedWant,sid),null):null;return w&&typeof w==='object'?w:null}
  function feedMeta(sid){const m=sid?gmGet(feedKey(K.hunterFeedMeta,sid),null):null;return m&&typeof m==='object'?m:null}
  function feederAlive(sid){const m=feedMeta(sid);return !!(m&&Date.now()-Number(m.aliveAt||0)<FEED_ALIVE_MS)}
  function feederKnown(sid){const m=feedMeta(sid);return !!(m&&Date.now()-Number(m.aliveAt||0)<FEED_KNOWN_MS)}
  // Hunter page side: feeder role while an AFT tab has asked for this shipment recently.
  function hunterFeederRole(h){
    if(!isHunterPage())return false;
    const sid=clean(h?.shipmentId)||clean(hunterShipmentInfo().shipmentId);if(!sid)return false;
    const w=feedWant(sid);return !!(w&&Date.now()-Number(w.at||0)<FEED_WANT_FRESH_MS);
  }
  function handledFeedRequest(){try{return sessionStorage.getItem(FEED_HANDLED_KEY)||''}catch{return ''}}
  function markFeedRequestHandled(id){try{sessionStorage.setItem(FEED_HANDLED_KEY,id||'')}catch{}}
  let _feedLastSig='',_feedLastAliveAt=0;const _feedListeners=new Set();
  function publishHunterFeed(){
    if(!isHunterPage()||!_hunterCsv.containers.length)return false;
    const ident=hunterIdentity(),sid=clean(ident.shipmentId);
    if(!sid||_hunterCsv.shipmentId!==sid||!hunterFeederRole(ident))return false;
    const want=feedWant(sid),handled=handledFeedRequest(),now=Date.now(),prev=feedMeta(sid)||{};
    const rows=_hunterCsv.containers.slice(0,FEED_MAX_ROWS).map(r=>[clean(r.scannableId),clean(r.location),Number(r.unitCount)||0,clean(r.stowByDate)]);
    const identity={loadId:ident.loadId,trailerName:ident.trailerName,shipmentId:sid,destinationWarehouse:ident.destinationWarehouse,status:ident.status,stowByAt:ident.stowByAt,totalQty:ident.totalQty,remainingQty:ident.remainingQty};
    const sig=JSON.stringify([identity,rows]);
    if(sig!==_feedLastSig){
      if(!gmSet(feedKey(K.hunterFeed,sid),{v:1,shipmentId:sid,identity,rows,truncated:_hunterCsv.containers.length>rows.length,locations:_hunterCsv.locations.length,loadedAt:_hunterCsv.loadedAt,pageLoadedAt:PAGE_LOADED_AT,publishedAt:now,tabId:TAB_ID}))return false;
      _feedLastSig=sig;
    }
    // A fresh-data request counts as answered only by data loaded after the reload it caused.
    const answered=want?.requestId&&handled===want.requestId?want.requestId:(prev.requestId||'');
    gmSet(feedKey(K.hunterFeedMeta,sid),{shipmentId:sid,loadId:ident.loadId,tabId:TAB_ID,aliveAt:now,loadedAt:_hunterCsv.loadedAt,pageLoadedAt:PAGE_LOADED_AT,rows:rows.length,requestId:answered});
    _feedLastAliveAt=now;return true;
  }
  function hunterFeederTick(){
    if(!isHunterPage()||_pageRestored)return;
    const ident=hunterIdentity(),sid=clean(ident.shipmentId);if(!sid)return;
    if(!_feedListeners.has(sid)){
      _feedListeners.add(sid);
      // Value-change events are not throttled in background tabs the way timers are.
      try{if(typeof GM_addValueChangeListener==='function')GM_addValueChangeListener(feedKey(K.hunterFeedWant,sid),(_n,_o,_v,remote)=>{if(remote)queueMicrotask(()=>{try{hunterFeederTick()}catch(err){console.warn('[Pallet Movement Monitor] Hunter feeder',err)}})})}catch{}
    }
    if(!hunterFeederRole(ident))return;
    const want=feedWant(sid),handled=handledFeedRequest();
    if(want?.requestId&&handled!==want.requestId){
      markFeedRequestHandled(want.requestId);
      // This page load already postdates the request (e.g. the AFT tab just opened it).
      if(PAGE_LOADED_AT<Number(want.requestAt||0)){location.reload();return}
    }
    const meta=feedMeta(sid);
    if(_hunterCsv.containers.length&&(Date.now()-_feedLastAliveAt>=10000||(want?.requestId&&meta?.requestId!==want.requestId&&handledFeedRequest()===want.requestId)))publishHunterFeed();
  }
  // AFT page side.
  const _feedOpenedAt=new Map();let _feedUsedDataAt=new Map();
  function noteFeedWant(h=loadIdentity(),request=false){
    const sid=clean(h?.shipmentId);if(!sid)return null;
    const now=Date.now(),next={...(feedWant(sid)||{}),shipmentId:sid,loadId:h?.loadId||null,tabId:TAB_ID,at:now};
    if(request){next.requestId=globalThis.crypto?.randomUUID?.()||TAB_ID+'-'+now;next.requestAt=now}
    gmSet(feedKey(K.hunterFeedWant,sid),next);return next;
  }
  function waitForFeedAnswer(sid,requestId,timeout=FEED_WAIT_MS){
    return new Promise((resolve,reject)=>{
      let done=false,timer=0,poll=0,lid=null;
      const finish=(ok,val)=>{if(done)return;done=true;clearTimeout(timer);clearInterval(poll);try{if(lid!=null&&typeof GM_removeValueChangeListener==='function')GM_removeValueChangeListener(lid)}catch{};ok?resolve(val):reject(val)};
      const check=()=>{const m=feedMeta(sid);if(m&&m.requestId===requestId)finish(true,m)};
      try{if(typeof GM_addValueChangeListener==='function')lid=GM_addValueChangeListener(feedKey(K.hunterFeedMeta,sid),()=>check())}catch{}
      poll=setInterval(check,2000);
      timer=setTimeout(()=>finish(false,Error(`Hunter did not send fresh data within ${Math.round(timeout/1000)} s. Check that you are signed in to CsX Hunter (open it once with Open Hunter trailer).`)),timeout);
      check();
    });
  }
  function hunterFeedToApi(aft,fresh){
    const sid=clean(aft.shipmentId),feed=gmGet(feedKey(K.hunterFeed,sid),null);
    if(!feed||!Array.isArray(feed.rows)||!feed.rows.length)throw Error('Hunter loader has not sent container data yet.');
    // The feed body is rewritten only when rows change; meta carries the latest load time.
    const meta=feedMeta(sid),dataAt=Math.max(Number(feed.loadedAt)||Number(feed.publishedAt)||0,meta?.shipmentId===sid&&meta?.pageLoadedAt===feed.pageLoadedAt?Number(meta.loadedAt)||0:0);
    if(!fresh&&Date.now()-dataAt>FEED_STALE_MS)throw Error('Hunter loader data is older than 20 min.');
    // Never step backwards to an older Hunter snapshot; that would log reverse moves.
    if(dataAt<(_feedUsedDataAt.get(sid)||0))throw Error('Hunter loader data is older than the snapshot already used.');
    const i=feed.identity||{};
    if(i.loadId&&aft.loadId&&clean(i.loadId)!==clean(aft.loadId))throw Error(`Hunter loader shows VRID ${i.loadId}, not ${aft.loadId}.`);
    const identity={loadId:i.loadId||aft.loadId,trailerName:i.trailerName||aft.trailerName,shipRef:'hunter:'+sid,shipmentId:sid,destinationWarehouse:i.destinationWarehouse||aft.destinationWarehouse,status:i.status||null,stowByAt:Number(i.stowByAt)||0,totalQty:Number(i.totalQty)||0,remainingQty:Number(i.remainingQty)||0,source:'hunter'};
    const rows=feed.rows.map(r=>({scannableId:r[0],location:r[1],unitCount:r[2],stowByDate:r[3]||''}));
    _feedUsedDataAt.set(sid,dataAt);
    _hunterApi={shipmentId:sid,identity,containers:rows,locations:deriveHunterLocations(rows),loadedAt:Date.now(),dataAt,error:'',classification:null,url:hunterTrailerUrl(aft),transport:'hunter-tab',truncated:!!feed.truncated};
    invalidateHierarchyCache();return _hunterApi;
  }
  async function ensureHunterFeed(aft,refresh){
    if(refresh){const w=noteFeedWant(aft,true);await waitForFeedAnswer(clean(aft.shipmentId),w.requestId)}
    return hunterFeedToApi(aft,refresh);
  }
  // 3.6.4: the Hunter trailer page loads in one hidden iframe inside this AFT tab instead
  // of a real browser tab. It is kept rendered (offscreen, not display:none) so Hunter
  // still builds its CSV exports. One loader per AFT tab; it follows the current load.
  function hunterLoaderFrame(){return document.getElementById(HUNTER_LOADER_NAME)}
  function removeHunterLoader(){const f=hunterLoaderFrame();if(f){try{f.src='about:blank'}catch{};f.remove()}}
  function hunterLoaderNeeded(){return isAftPage()&&!IN_FRAME&&['hunter','combined','auto'].includes(dataSourceMode())&&!duplicateViewOnly()}
  function ensureHunterLoader(aft,reload=false){
    if(!hunterLoaderNeeded())return false;
    const url=hunterTrailerUrl(aft);if(!clean(aft?.shipmentId)||!/\/transshipments\//.test(url))return false;
    let f=hunterLoaderFrame();
    if(!f){
      f=document.createElement('iframe');f.id=HUNTER_LOADER_NAME;f.name=HUNTER_LOADER_NAME;f.title='Pallet Movement Monitor Hunter loader';
      f.setAttribute('aria-hidden','true');f.tabIndex=-1;
      f.style.cssText='position:fixed;left:-10000px;top:0;width:1280px;height:800px;border:0;opacity:0;pointer-events:none;z-index:-1';
      f.dataset.url=url;f.dataset.loadedAt=String(Date.now());f.src=url;(document.body||document.documentElement).appendChild(f);return true;
    }
    if(f.dataset.url!==url||reload){f.dataset.url=url;f.dataset.loadedAt=String(Date.now());f.src=url;return true}
    return false;
  }
  function openHunterTrailerForFeed(aft){
    const sid=clean(aft.shipmentId);
    if(!hunterLoaderNeeded())return false;
    const f=hunterLoaderFrame(),sameLoad=f&&f.dataset.url===hunterTrailerUrl(aft);
    // A live feeder (this loader or a Hunter tab the user opened) needs nothing new.
    if(feederAlive(sid)&&(sameLoad||!f))return false;
    // Reload a loader that has been silent for a while; otherwise let it finish booting.
    const stuck=sameLoad&&Date.now()-Number(f.dataset.loadedAt||0)>FEED_WAIT_MS&&!feederKnown(sid);
    if(sameLoad&&!stuck)return false;
    if(Date.now()-(_feedOpenedAt.get(sid)||0)<15000)return false;
    _feedOpenedAt.set(sid,Date.now());noteFeedWant(aft,false);return ensureHunterLoader(aft,stuck);
  }
  async function loadHunterApiDirect(aft){
    const detailUrl=`${HUNTER_API_BASE}/api/transshipments/${encodeURIComponent(aft.destinationWarehouse)}/${encodeURIComponent(aft.shipmentId)}`;
    const detail=await gmJson(detailUrl),identity=hunterApiAftIdentity(detail);
    if(!identity.shipmentId||!identity.destinationWarehouse)throw Error('Hunter API transshipment response did not identify this load.');
    const attempts=hunterClassificationOrder(identity,aft);
    let rows=[],classification=null,lastErr=null,url='',lastShape='none';
    for(const c of attempts){
      try{url=hunterApiUrlForContainers(identity,c);const payload=await gmJson(url);lastShape=payloadShape(payload);const normalized=normalizeHunterApiRows(payload);if(normalized.length){rows=normalized;classification=c||'ALL';break}}
      catch(err){lastErr=err}
    }
    if(!rows.length)throw (lastErr||Error('Hunter API returned no recognizable containers (response shape: '+lastShape+').'));
    _hunterClassByShipment.set(identity.shipmentId,classification==='ALL'?null:classification);
    _hunterApi={shipmentId:identity.shipmentId,identity,containers:rows,locations:deriveHunterLocations(rows),loadedAt:Date.now(),error:'',classification,url,transport:'direct-api'};
    invalidateHierarchyCache();return _hunterApi;
  }
  // refresh=true asks the Hunter loader (or an open Hunter tab) to reload; routine scans just read its latest data.
  async function ensureHunterApi(force=false,refresh=false){
    if(!isAftPage())return _hunterApi;
    const aft=loadIdentity();
    if(!aft.shipmentId||!aft.destinationWarehouse)throw Error('AFT shipment reference is not available for direct Hunter lookup.');
    if(!force&&_hunterApi.shipmentId===aft.shipmentId&&_hunterApi.containers.length&&Date.now()-_hunterApi.loadedAt<15000)return _hunterApi;
    if(_hunterApiPromise)return _hunterApiPromise;
    _hunterApiPromise=(async()=>{
      try{
        if(['hunter','combined'].includes(dataSourceMode())||hunterLoaderFrame())noteFeedWant(aft,false);
        // Hunter/Combined always keep their own hidden loader; after an AFT reload the old
        // one is gone even though its last heartbeat still looks alive.
        if(['hunter','combined'].includes(dataSourceMode())&&!hunterLoaderFrame()){_feedOpenedAt.set(clean(aft.shipmentId),Date.now());ensureHunterLoader(aft)}
        const lf=hunterLoaderFrame(),booting=!!lf&&Date.now()-Number(lf.dataset.loadedAt||0)<FEED_WAIT_MS;
        // A live Hunter loader/tab is proven to work, so skip the direct API while it is open.
        if(feederAlive(aft.shipmentId))return await ensureHunterFeed(aft,refresh);
        try{return await loadHunterApiDirect(aft)}
        catch(apiErr){
          const opened=openHunterTrailerForFeed(aft)||booting,apiMsg=clean(apiErr?.message||apiErr);
          // A recently seen Hunter tab may just be throttled; still ask it to reload.
          try{return await ensureHunterFeed(aft,opened||(refresh&&feederKnown(aft.shipmentId)))}
          catch(feedErr){throw Error(apiMsg+(opened?' Loading the Hunter trailer page in the background; ':' Hunter background loader: ')+clean(feedErr?.message||feedErr))}
        }
      }catch(err){_hunterApi={shipmentId:aft.shipmentId,identity:null,containers:[],locations:[],loadedAt:Date.now(),error:clean(err?.message||err),classification:null,url:'',transport:null};throw err}
      finally{_hunterApiPromise=null}
    })();
    return _hunterApiPromise;
  }
  function shouldUseHunterApiOnAft(){return isAftPage()&&dataSourceMode()==='hunter'}
  async function prepareSourceData(force=false){
    if(!isAftPage())return;
    const mode=dataSourceMode(),vrid=loadIdentity().loadId;
    if(mode==='hunter')await ensureHunterApi(force&&Date.now()-Number(_hunterApi.loadedAt||0)>2000);
    else if(mode==='auto'&&!freshAftHealthy(vrid)&&Date.now()-(_hunterApiLast?.at||0)>60000)await ensureHunterApi(false).catch(()=>{});
    else if(mode==='combined')refreshCombinedHunter(false);
  }
  // Combined mode: AFT tracking never waits on Hunter. Hunter data arrives in the
  // background (hidden loader) and triggers its own scan when it changes.
  let _combinedHunterBusy=false,_combinedSeenDataAt=0;
  function refreshCombinedHunter(refresh){
    if(!isCombinedMode()||_combinedHunterBusy)return;
    const aft=loadIdentity();if(!aft.shipmentId)return;
    if(!refresh&&_hunterApi.shipmentId===aft.shipmentId&&_hunterApi.containers.length&&Date.now()-_hunterApi.loadedAt<15000)return;
    _combinedHunterBusy=true;
    ensureHunterApi(true,refresh).then(api=>{
      const at=Number(api?.dataAt||api?.loadedAt||0);
      if(at&&at!==_combinedSeenDataAt){_combinedSeenDataAt=at;lastSignature='';requestScan('combined-hunter-data',true)}
    }).catch(()=>{}).finally(()=>{_combinedHunterBusy=false});
  }
  function combinedHunterHierarchy(aft){
    const sid=clean(aft?.shipmentId)||clean(loadIdentity().shipmentId);
    if(!isCombinedMode()||!sid)return null;
    const api=_hunterApi;if(api.shipmentId!==sid||!api.containers.length)return null;
    const at=Number(api.dataAt||api.loadedAt||0);if(Date.now()-at>FEED_STALE_MS)return null;
    if(_combinedHunterCache?.at===at&&_combinedHunterCache.loadId===aft.loadId)return _combinedHunterCache.h;
    const h=buildHunterApiHierarchy();_combinedHunterCache={at,loadId:aft.loadId,h};return h;
  }
  let _combinedHunterCache=null;
  function combinedHunterStatus(){
    if(!isCombinedMode())return '';
    const aft=loadIdentity(),api=_hunterApi;
    if(api.shipmentId===aft.shipmentId&&api.containers.length){
      const at=Number(api.dataAt||api.loadedAt||0),age=Math.max(0,Math.round((Date.now()-at)/1000));
      if(Date.now()-at>FEED_STALE_MS)return 'Hunter data is stale ('+Math.round(age/60)+' min); tracking with AFT only.';
      return 'Hunter data '+(age<60?age+'s':Math.floor(age/60)+'m')+' old ('+api.containers.length+' containers).';
    }
    if(api.error&&api.shipmentId===aft.shipmentId)return 'Hunter not available yet; tracking with AFT only. '+api.error;
    return 'Loading Hunter in the background; tracking with AFT meanwhile.';
  }
  function hunterDownloadAnchor(name){return [...document.querySelectorAll('a[download]')].find(a=>clean(a.getAttribute('download')).toLowerCase()===name.toLowerCase())||null}
  async function fetchHunterBlobText(url){
    try{
      const resp=await fetch(url,{credentials:'same-origin'});if(!resp.ok)throw Error('HTTP '+resp.status);return await resp.text();
    }catch(firstErr){
      // Blob URLs are created by Hunter's page realm. Most Tampermonkey builds can
      // fetch them directly; this page-context bridge is a fallback for sandboxed blob access.
      const token='pmm-hunter-'+(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2));
      return await new Promise((resolve,reject)=>{
        let timer=0;const cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',onMessage)};
        const onMessage=e=>{if(e.source!==window||e.origin!==location.origin||e.data?.token!==token)return;cleanup();if(e.data.ok)resolve(String(e.data.text||''));else reject(Error(e.data.error||clean(firstErr?.message||firstErr)))};
        window.addEventListener('message',onMessage);
        const s=document.createElement('script');s.textContent=`(()=>{const token=${JSON.stringify(token)},url=${JSON.stringify(url)};fetch(url).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.text()}).then(text=>window.postMessage({token,ok:true,text},location.origin)).catch(err=>window.postMessage({token,ok:false,error:String(err&&err.message||err)},location.origin))})()`;
        (document.documentElement||document.head||document.body).appendChild(s);s.remove();
        timer=setTimeout(()=>{cleanup();reject(Error('Hunter CSV blob could not be read from the userscript or page context: '+clean(firstErr?.message||firstErr)))},10000);
      });
    }
  }
  async function fetchHunterCsv(name){
    const a=hunterDownloadAnchor(name);if(!a?.href)throw Error(name+' export is not ready yet');
    return parseCsvText(await fetchHunterBlobText(a.href));
  }
  async function ensureHunterCsv(force=false){
    if(!isHunterPage())return _hunterCsv;
    const ident=hunterIdentity(),ca=hunterDownloadAnchor('Containers.csv'),la=hunterDownloadAnchor('Locations.csv');
    if(!ident.shipmentId||!ident.loadId)throw Error('Open a CsX Hunter transshipment before starting Hunter Mode.');
    const blobKey=[ident.shipmentId,ca?.href||'',la?.href||''].join('|');
    if(!force&&_hunterCsv.shipmentId===ident.shipmentId&&_hunterCsv.containers.length&&_hunterCsv.blobKey===blobKey)return _hunterCsv;
    if(_hunterCsvPromise)return _hunterCsvPromise;
    _hunterCsvPromise=(async()=>{
      try{
        const [containers,locations]=await Promise.all([fetchHunterCsv('Containers.csv'),fetchHunterCsv('Locations.csv').catch(()=>[])]);
        _hunterCsv={shipmentId:ident.shipmentId,containers,locations,loadedAt:Date.now(),error:'',blobKey};
        try{publishHunterFeed()}catch(err){console.warn('[Pallet Movement Monitor] Hunter feed publish',err)}
        invalidateHierarchyCache();return _hunterCsv;
      }catch(err){_hunterCsv={shipmentId:ident.shipmentId,containers:[],locations:[],loadedAt:Date.now(),error:clean(err?.message||err),blobKey};throw err}
      finally{_hunterCsvPromise=null}
    })();
    return _hunterCsvPromise;
  }
  function hunterStaging(location){
    const id=clean(location);if(!id)return null;
    if(dropZoneLike(id))return {container:id,type:'DROP_ZONE'};
    if(pc99Like(id))return {container:id,type:'PERSONAL_CONTAINER'};
    if(hunterPhysicalBin(id))return {container:id,type:'BIN'};
    return {container:id,type:'PENDING'};
  }
  function hunterLink(id,destination){return id&&destination?`https://qi-fcresearch-na.corp.amazon.com/${encodeURIComponent(destination)}/results?s=${encodeURIComponent(id)}`:null}
  function buildHunterHierarchyFromRows(identity,rows,locations=[],transport='page-csv'){
    rows=Array.isArray(rows)?rows:[];
    const pallets={},caseIndex={},toteIndex={},caseQty={},toteQty={},caseItems={},toteItems={},containerLinks={},activeByCase={},activeByTote={},stagedPallets={},currentLocationByCase={},currentLocationByTote={},sapLocations={};
    const childCount={};for(const r of rows){const loc=clean(r.location);if(palletLike(loc))childCount[loc]=(childCount[loc]||0)+1}
    const ensurePallet=id=>pallets[id]||(pallets[id]={id,cases:[],totes:[],sap:false,unlabelledCases:0,unlabelledUnits:0,totalUnits:0});
    for(const r of rows){
      const id=clean(r.scannableId),loc=clean(r.location),qty=Number(r.unitCount)||0;if(!id)continue;
      const link=hunterLink(id,identity.destinationWarehouse);if(link){containerLinks[id]=link;knownContainerLinks[id]=link}
      if(/^csX/i.test(id)){
        caseQty[id]=qty;caseItems[id]=[];currentLocationByCase[id]=loc||null;
        if(palletLike(loc)){const p=ensurePallet(loc);p.cases.push(id);caseIndex[id]=loc;p.totalUnits+=qty}
        else if(pc99Like(loc))activeByCase[id]={stower:loc,station:null};
      }else if(/^tsX/i.test(id)){
        toteQty[id]=qty;toteItems[id]=[];currentLocationByTote[id]=loc||null;
        if(palletLike(loc)){const p=ensurePallet(loc);p.totes.push(id);toteIndex[id]=loc;p.totalUnits+=qty}
        else if(pc99Like(loc))activeByTote[id]={stower:loc,station:null};
      }else if(palletLike(id)){
        const p=ensurePallet(id);
        // A direct pallet row with no child containers is Hunter's SAP representation.
        if(!(childCount[id]>0)){p.sap=true;p.unlabelledUnits=qty;p.totalUnits=qty;p.hunterDirect=true;p.staging=hunterStaging(loc);stagedPallets[id]=p.staging;sapLocations[id]=loc||null}
      }
    }
    for(const p of Object.values(pallets)){p.cases=[...new Set(p.cases)];p.totes=[...new Set(p.totes)]}
    const regularPallets=Object.values(pallets).filter(p=>!p.sap&&(p.cases.length||p.totes.length));
    const fluid=regularPallets.length===0&&Object.keys(caseIndex).length===0&&Object.keys(toteIndex).length===0&&rows.some(r=>/^csX|^tsX/i.test(clean(r.scannableId)));
    if(fluid){for(const r of rows){const id=clean(r.scannableId);if(/^csX/i.test(id)&&!caseIndex[id])caseIndex[id]='__FLUID__';if(/^tsX/i.test(id)&&!toteIndex[id])toteIndex[id]='__FLUID__'}}
    else{for(const r of rows){const id=clean(r.scannableId),loc=clean(r.location);if(palletLike(loc)||pc99Like(loc))continue;if(/^csX/i.test(id)&&!caseIndex[id]&&!activeByCase[id])caseIndex[id]='__FLUID__';if(/^tsX/i.test(id)&&!toteIndex[id]&&!activeByTote[id])toteIndex[id]='__FLUID__'}}
    const loose=classifyLoose(identity,Object.keys(pallets).length>0,caseIndex,toteIndex);
    const result={fluid:fluid&&!loose.mixed,mixed:loose.mixed,looseContainers:loose.looseContainers,source:'hunter',version:V,capturedAt:Date.now(),shipRef:identity.shipRef,loadId:identity.loadId,trailerName:identity.trailerName,shipmentId:identity.shipmentId,destinationWarehouse:identity.destinationWarehouse,status:identity.status,stowByAt:identity.stowByAt,totalQty:identity.totalQty,remainingQty:identity.remainingQty,pallets,stagedPallets,caseIndex,toteIndex,caseQty,toteQty,caseItems,toteItems,containerLinks,activeByCase,activeByTote,currentLocationByCase,currentLocationByTote,sapLocations,
      diagnostics:{palletRows:Object.keys(pallets).length,uniquePallets:Object.keys(pallets).length,caseRows:Object.keys(caseQty).length,toteRows:Object.keys(toteQty).length,mappedTotes:Object.keys(toteIndex).length,unmappedToteRows:Math.max(0,Object.keys(toteQty).length-Object.keys(toteIndex).length),mappedCases:Object.keys(caseIndex).length,unmappedCaseRows:Math.max(0,Object.keys(caseQty).length-Object.keys(caseIndex).length),pc99Rows:new Set([...Object.keys(activeByCase).map(id=>activeByCase[id].stower),...Object.keys(activeByTote).map(id=>activeByTote[id].stower)]).size,activeCaseMappings:Object.keys(activeByCase).length,activeToteMappings:Object.keys(activeByTote).length,casesWithItemDetails:0,totesWithItemDetails:0,palletsWithZeroCases:Object.values(pallets).filter(x=>!x.cases.length&&!x.totes.length&&!x.sap).length,sapPallets:Object.values(pallets).filter(x=>x.sap).length,hunterRows:rows.length,hunterLocations:Array.isArray(locations)?locations.length:0,hunterCsvLoadedAt:transport==='page-csv'?(_hunterCsv.loadedAt||0):0,hunterCsvError:transport==='page-csv'?(_hunterCsv.error||''):(_hunterApi.error||''),hunterTransport:transport,hunterClassification:transport==='direct-api'?(_hunterApi.classification||null):null,samplePallets:Object.values(pallets).slice(0,8),sampleActiveStowers:[]}};
    _lastCaseRows=result.diagnostics.caseRows;return result;
  }
  function buildHunterHierarchy(){return buildHunterHierarchyFromRows(hunterIdentity(),_hunterCsv.containers,_hunterCsv.locations,'page-csv')}
  function buildHunterApiHierarchy(){
    const aft=loadIdentity(),identity=_hunterApi.identity||{loadId:aft.loadId,trailerName:aft.trailerName,shipRef:aft.shipmentId?'hunter:'+aft.shipmentId:aft.shipRef,shipmentId:aft.shipmentId,destinationWarehouse:aft.destinationWarehouse,status:null,stowByAt:0,totalQty:0,remainingQty:0,source:'hunter'};
    return buildHunterHierarchyFromRows(identity,_hunterApi.containers,_hunterApi.locations,_hunterApi.transport||'direct-api');
  }

  // Pause is scoped to the current VRID so one open load cannot pause another.
  function pauseStorageKey(){
    const ident=loadIdentity();
    const scope=ident.loadId||ident.shipRef||location.pathname;
    return K.paused+':'+scope;
  }
  const isPaused=()=>!!read(pauseStorageKey(),false);
  const setPaused=value=>write(pauseStorageKey(),!!value);
  function autoRefreshStorageKey(){
    const ident=loadIdentity();
    const scope=ident.loadId||ident.shipRef||location.pathname;
    return K.autoRefresh+':'+scope;
  }
  const isAutoRefreshEnabled=()=>read(autoRefreshStorageKey(),true)!==false;
  const setAutoRefreshEnabled=value=>write(autoRefreshStorageKey(),!!value);
  function displayHoldStorageKey(){
    const ident=loadIdentity();
    const scope=ident.loadId||ident.shipRef||location.pathname;
    return K.displayHold+':'+scope;
  }
  const isDisplayHold=()=>!!read(displayHoldStorageKey(),false);
  const setDisplayHold=value=>write(displayHoldStorageKey(),!!value);

  const TAB_REGISTRY_KEY='pax-monitor-v3518-tab-registry';
  const TAB_REGISTRY_TTL=120000;
  const TAB_HEARTBEAT_MS=10000;
  function currentLoadScope(){
    const ident=loadIdentity();
    return ident.loadId||ident.shipRef||location.pathname;
  }
  let _liveDocumentIds=new Set();
  async function updateDocumentPresence(){
    if(!navigator.locks.query)return;
    try{const state=await navigator.locks.query();_liveDocumentIds=new Set((state.held||[]).filter(x=>x.name.startsWith(DOC_LOCK_PREFIX)).map(x=>x.name.slice(DOC_LOCK_PREFIX.length)))}catch{}
  }
  function loadTabRegistry(){return readTabEntries()}
  function pruneTabRegistry(reg=loadTabRegistry()){
    const now=Date.now(),next={};
    for(const [id,row] of Object.entries(reg||{})){
      if(!row||!row.scope)continue;
      if(id!==TAB_ID&&!_liveDocumentIds.has(id)&&now-Number(row.ts||0)>TAB_REGISTRY_TTL)continue;
      next[id]=row;
    }
    return next;
  }
  function updateTabRegistry(){
    localStorage.setItem(TAB_ENTRY_PREFIX+TAB_ID,JSON.stringify(ownTabEntry()));
    return pruneTabRegistry();
  }
  function removeTabRegistryEntry(){localStorage.removeItem(TAB_ENTRY_PREFIX+TAB_ID)}
  function duplicateLoadInfo(){
    const scope=currentLoadScope();
    const reg=pruneTabRegistry();
    const peers=Object.values(reg).filter(x=>x&&x.scope===scope).sort((a,b)=>Number(a.startedAt||a.ts||0)-Number(b.startedAt||b.ts||0)||String(a.tabId).localeCompare(String(b.tabId)));
    const self=peers.find(x=>x.tabId===TAB_ID)||null;
    const primary=!!self&&peers[0]?.tabId===TAB_ID;
    // During pathname-to-VRID discovery our heartbeat row may still have the old scope.
    // An existing peer remains primary until we register in the new scope.
    return {duplicate:peers.length>1||(!self&&peers.length>0),primary,peers,self,scope,other:peers.find(x=>x.tabId!==TAB_ID)||null};
  }
  const duplicateViewOnly=()=>{const info=duplicateLoadInfo();return !!(info.duplicate&&!info.primary)};

  // Staging containers can contain a PALLET (including a SAP) after it leaves the
  // original pallet hierarchy. Record the nearest non-pallet parent container.
  function stagingPalletLocations(){
    const out={};
    for(const d of palletDetails()){
      const pallet=idFromDetails(d); if(!pallet)continue;
      let row=rowForDetails(d), holder=row?.parentElement?.closest?.('div[id$="-children"]');
      while(holder){
        const parentRow=holder.parentElement?.closest?.('div[id$="-row"], .row.container-fluid');
        const pd=detailsForRow(parentRow), pt=typeFromDetails(pd), pid=idFromDetails(pd);
        if(pid && pt && pt!=='PALLET' && pt!=='PERSONAL_CONTAINER' && pt!=='TRANSFER_SHIPMENT'){out[pallet]={container:pid,type:pt,status:statusFromDetails(pd)||null};break;}
        row=parentRow; holder=row?.parentElement?.closest?.('div[id$="-children"]');
      }
    }
    return out;
  }

  // Classifies where a SAP pallet currently sits per the AFT DOM: still in progress
  // (dropzone/pending), decanted into a tote awaiting a stower, or in a real bin (stowed).
  // The DOM's staging panel is not always reliable for the tote->real-bin leg, which is
  // what a manual/on-demand ground-truth check could double-check, if one existed.
  function sapStagingKind(loc){
    if(!loc) return 'pending';
    const container=clean(loc.container),type=clean(loc.type).toUpperCase();
    if(/^dz-/i.test(container)||/^DROP[_ -]?ZONE/.test(type)) return 'dropzone';
    if(type==='TRANSFER_TOTE') return 'tote';
    // Only confirm a SAP completion when AFT identifies a real bin-type staging
    // location. Unknown container types stay pending instead of being auto-stowed.
    if(/(^|_)BIN($|_)/.test(type)) return 'stowed';
    return 'unknown';
  }

  function hierarchy(){
    if(isHunterPage())return buildHunterHierarchy();
    if(shouldUseHunterApiOnAft())return buildHunterApiHierarchy();
    _allDetailsSnapshot=null;_parseMemo=new WeakMap();_typeGroups=null;
    try{
      const aft=buildHierarchy();
      if(isCombinedMode()){const hh=combinedHunterHierarchy(aft);if(hh)return mergeCombinedHierarchy(aft,hh)}
      if(dataSourceMode()==='auto'&&(!usable(aft)||aftDataFreshness().stale)&&!_hunterApi.error&&_hunterApi.shipmentId===loadIdentity().shipmentId&&_hunterApi.containers.length)return buildHunterApiHierarchy();
      return aft;
    }finally{_allDetailsSnapshot=null;_parseMemo=null;_typeGroups=null}
  }
  // Combined view: Hunter supplies the full load, AFT overlays live detail (items, stations,
  // SAP staging). A container that either source shows at a pc99 is shown as moved, matching
  // the first-sighting rule; otherwise AFT's live pallet wins, then Hunter's. The raw AFT and
  // Hunter hierarchies ride along (non-enumerable) so each is still tracked on its own.
  function mergeCombinedHierarchy(a,hh){
    const pallets={},stagedPallets={...(hh.stagedPallets||{}),...(a.stagedPallets||{})},containerLinks={...(hh.containerLinks||{}),...(a.containerLinks||{})};
    const out={fluid:false,source:'combined',version:V,capturedAt:Date.now(),shipRef:a.shipRef,loadId:a.loadId||hh.loadId,trailerName:a.trailerName||hh.trailerName,shipmentId:a.shipmentId||hh.shipmentId,destinationWarehouse:a.destinationWarehouse||hh.destinationWarehouse,status:a.status||hh.status,stowByAt:Number(a.stowByAt)||Number(hh.stowByAt)||0,totalQty:Number(a.totalQty)||Number(hh.totalQty)||0,remainingQty:Number(a.remainingQty)||Number(hh.remainingQty)||0,
      pallets,stagedPallets,caseIndex:{},toteIndex:{},caseQty:{},toteQty:{},caseItems:{...(a.caseItems||{})},toteItems:{...(a.toteItems||{})},containerLinks,activeByCase:{},activeByTote:{},currentLocationByCase:{...(hh.currentLocationByCase||{})},currentLocationByTote:{...(hh.currentLocationByTote||{})},sapLocations:{...(hh.sapLocations||{}),...(a.sapLocations||{})}};
    const ensure=id=>pallets[id]||(pallets[id]={id,cases:[],totes:[],sap:false,unlabelledCases:0,unlabelledUnits:0,totalUnits:0});
    for(const [kind,idxK,qtyK,actK] of [['case','caseIndex','caseQty','activeByCase'],['tote','toteIndex','toteQty','activeByTote']]){
      const ids=new Set([...Object.keys(hh[idxK]||{}),...Object.keys(a[idxK]||{}),...Object.keys(hh[actK]||{}),...Object.keys(a[actK]||{}),...Object.keys(hh[qtyK]||{}),...Object.keys(a[qtyK]||{})]);
      for(const id of ids){
        const qa=Number(a[qtyK]?.[id])||0,qh=Number(hh[qtyK]?.[id])||0;out[qtyK][id]=qa>0?qa:qh;
        const act=a[actK]?.[id]||hh[actK]?.[id]||null;
        if(act){out[actK][id]={...(hh[actK]?.[id]||{}),...(a[actK]?.[id]||{}),stower:a[actK]?.[id]?.stower||hh[actK]?.[id]?.stower||null,station:a[actK]?.[id]?.station||null};continue}
        const ap=a[idxK]?.[id],hp=hh[idxK]?.[id];
        const pal=ap&&!looseMark(ap)?ap:(hp&&!looseMark(hp)?hp:(ap===MIXED_MARK||hp===MIXED_MARK?MIXED_MARK:(ap||hp)));
        if(!pal)continue;
        out[idxK][id]=pal;
        if(!looseMark(pal)){const p=ensure(pal);(kind==='case'?p.cases:p.totes).push(id);p.totalUnits+=out[qtyK][id]}
      }
    }
    for(const src of [hh.pallets||{},a.pallets||{}])for(const [id,p] of Object.entries(src)){
      if(!p?.sap)continue;
      const t=ensure(id);t.sap=true;t.unlabelledCases=p.unlabelledCases||t.unlabelledCases;t.unlabelledUnits=p.unlabelledUnits||t.unlabelledUnits;t.totalUnits=Math.max(t.totalUnits,p.totalUnits||0);if(p.staging)t.staging=p.staging;if(p.hunterDirect&&src===hh.pallets)t.hunterDirect=true;
    }
    for(const [id,p] of Object.entries(a.pallets||{}))if(pallets[id]&&p.staging&&!pallets[id].staging)pallets[id].staging=p.staging;
    const regular=Object.values(pallets).filter(p=>!p.sap&&(p.cases.length||p.totes.length));
    out.fluid=!regular.length&&(!!a.fluid||!!hh.fluid);
    {const loose=classifyLoose({loadId:out.loadId,shipRef:out.shipRef},Object.keys(pallets).length>0||!!a.mixed||!!hh.mixed,out.caseIndex,out.toteIndex);out.mixed=loose.mixed;out.looseContainers=loose.looseContainers;if(out.mixed)out.fluid=false}
    const n=o=>Object.keys(o).length,mappedCases=Object.values(out.caseIndex).filter(v=>!looseMark(v)).length,mappedTotes=Object.values(out.toteIndex).filter(v=>!looseMark(v)).length;
    out.diagnostics={...(a.diagnostics||{}),palletRows:n(pallets),uniquePallets:n(pallets),caseRows:n(out.caseQty),toteRows:n(out.toteQty),mappedCases,mappedTotes,unmappedCaseRows:Math.max(0,n(out.caseQty)-mappedCases),unmappedToteRows:Math.max(0,n(out.toteQty)-mappedTotes),activeCaseMappings:n(out.activeByCase),activeToteMappings:n(out.activeByTote),pc99Rows:new Set([...Object.values(out.activeByCase),...Object.values(out.activeByTote)].map(x=>x.stower).filter(Boolean)).size,sapPallets:Object.values(pallets).filter(p=>p.sap).length,palletsWithZeroCases:0,
      combined:{aftPallets:a.diagnostics?.palletRows||0,aftCases:a.diagnostics?.mappedCases||0,hunterPallets:hh.diagnostics?.palletRows||0,hunterCases:hh.diagnostics?.caseRows||0,hunterDataAt:_hunterApi.dataAt||_hunterApi.loadedAt||0},hunterTransport:hh.diagnostics?.hunterTransport||null,samplePallets:Object.values(pallets).slice(0,8)};
    Object.defineProperty(out,'pmmPalletOccurrences',{value:a.pmmPalletOccurrences||{},enumerable:false});
    Object.defineProperty(out,'_aft',{value:a,enumerable:false});Object.defineProperty(out,'_hunter',{value:hh,enumerable:false});
    return out;
  }
  // Live DOM evidence only: never stored in movement snapshots or used for staging decisions.
  // Count distinct PALLET rows, not repeated IDs in links/text. Inspect real ancestors only.
  function pmmPalletOccurrences(details){
    const counts=new Map(),seen=new Set(),underCache=new WeakMap();
    const underReceiving=row=>{
      const path=[];let node=row?.parentElement,found=false;
      while(node){
        if(underCache.has(node)){found=underCache.get(node);break;}
        path.push(node);
        if(node.matches?.('div[id$="-row"], .row.container-fluid')){
          const own=node.querySelector?.(':scope > div[id$="-details"]');
          if(/^ws-rcv-preditor(?:$|[-_])/i.test(String(idFromDetails(own)||'').trim())){found=true;break;}
        }
        node=node.parentElement;
      }
      for(const n of path)underCache.set(n,found);
      return found;
    };
    for(const d of details||[]){
      const id=idFromDetails(d),row=rowForDetails(d);
      if(!id||!row||seen.has(row)||typeFromDetails(d)!=='PALLET')continue;
      seen.add(row);
      const entry=counts.get(id)||{count:0,receiving:0};
      entry.count++;if(underReceiving(row))entry.receiving++;
      counts.set(id,entry);
    }
    return Object.fromEntries([...counts].filter(([,v])=>v.count>1&&v.receiving>0));
  }
  function pmmPalletDuplicate(h,id){
    const map=h?.pmmPalletOccurrences;
    const e=map&&Object.prototype.hasOwnProperty.call(map,id)?map[id]:null;
    if(!e||!Number.isSafeInteger(e.count)||e.count<2||!Number.isSafeInteger(e.receiving)||e.receiving<1||e.receiving>e.count)return null;
    return {count:e.count,label:'x'+e.count,note:'AFT shows this pallet '+e.count+' times, including under ws-rcv-preditor. AFT quantities may be duplicated. Display warning only; unit totals are unchanged.'};
  }

  function buildHierarchy(){
    const pallets={};
    for(const d of palletDetails()){
      const id=idFromDetails(d);
      if(!id||pallets[id]) continue;
      const row=rowForDetails(d);
      const children=directChildDetails(row);
      const unlabelled=children.filter(c=>typeFromDetails(c)==='CASE' && /unlabelled case/i.test(clean(c.textContent)));
      const unlabelledCases=unlabelled.length, unlabelledUnits=unlabelled.reduce((n,c)=>n+qtyFromDetails(c),0);
      pallets[id]={id,cases:containersUnderPallet(d,'CASE'),totes:containersUnderPallet(d,'TRANSFER_TOTE'),sap:unlabelledCases>0,unlabelledCases,unlabelledUnits};
    }

    const activeByCase={}, activeByTote={};
    const activeStowers=[];
    for(const d of pc99Details()){
      const stower=idFromDetails(d), station=(statusFromDetails(d).match(/station\s*:\s*([^\s]+)/i)||[])[1]||null;
      const row=rowForDetails(d);
      const cases=[], totes=[], palletsHere=[];
      const walk=(r)=>{
        for(const cd of directChildDetails(r)){
          const t=typeFromDetails(cd), id=idFromDetails(cd);
          if(t==='PALLET'&&id) palletsHere.push(id);
          else if(t==='CASE'&&id && !/^unlabelled case$/i.test(id)) cases.push(id);
          else if(t==='TRANSFER_TOTE'&&id) totes.push(id);
          const cr=rowForDetails(cd);
          if(cr && t!=='CASE') walk(cr);
        }
      };
      walk(row);
      for(const c of [...new Set(cases)]) activeByCase[c]={stower,station};
      for(const t of [...new Set(totes)]) activeByTote[t]={stower,station};
      activeStowers.push({stower,station,cases:[...new Set(cases)],totes:[...new Set(totes)],pallets:[...new Set(palletsHere)]});
    }

    const caseIndex={}, toteIndex={}, caseQty={}, toteQty={}, caseItems={}, toteItems={}, containerLinks={};
    for(const d of allDetailsNodes()){const id=idFromDetails(d),href=hrefFromDetails(d);if(id&&href){containerLinks[id]=href;knownContainerLinks[id]=href}}
    for(const d of caseDetails()){const id=idFromDetails(d);if(id && !/^unlabelled case$/i.test(id)){caseQty[id]=qtyFromDetails(d);caseItems[id]=itemsFromDetails(d)}}
    for(const d of toteDetails()){const id=idFromDetails(d);if(id){toteQty[id]=qtyFromDetails(d);toteItems[id]=itemsFromDetails(d)}}
    for(const [pallet,data] of Object.entries(pallets)){
      for(const c of data.cases) caseIndex[c]=pallet;
      for(const t of data.totes) toteIndex[t]=pallet;
      data.totalUnits=(data.cases||[]).reduce((n,id)=>n+(caseQty[id]||0),0)+(data.totes||[]).reduce((n,id)=>n+(toteQty[id]||0),0)+(data.unlabelledUnits||0);
    }
    // A load without PALLET rows is fluid: track its loose containers without inventing a pallet.
    const fluid=Object.keys(pallets).length===0;
    if(fluid){
      for(const d of caseDetails()){const id=idFromDetails(d);if(id && !/^unlabelled case$/i.test(id))caseIndex[id]='__FLUID__'}
      for(const d of toteDetails()){const id=idFromDetails(d);if(id)toteIndex[id]='__FLUID__'}
    }
    const identity=loadIdentity(), stagedPallets=stagingPalletLocations();
    for(const [id,loc] of Object.entries(stagedPallets))if(pallets[id])pallets[id].staging=loc;
    // A SAP decanted into a tote is staged there, but that tote lives in the staging
    // panel, not nested under the pallet's row in the hierarchy tree, so the walk above
    // never finds it and it's missing from toteIndex/pallet.totes. Its quantity/FCSku are
    // still captured page-wide by the toteDetails() scan above, so just wire it in here.
    for(const [id,loc] of Object.entries(stagedPallets)){
      if(!pallets[id]||loc?.type!=='TRANSFER_TOTE'||!loc.container) continue;
      if(!toteIndex[loc.container])toteIndex[loc.container]=id;
      if(!pallets[id].totes.includes(loc.container)){
        pallets[id].totes.push(loc.container);
        pallets[id].totalUnits=(pallets[id].totalUnits||0)+(toteQty[loc.container]||0);
      }
    }
    // Mixed load: PALLET rows exist but loose cases/totes also sit beside them (often under
    // a TRANSFER_SHIPMENT). Collect those (classifyLoose re-marks them as Mixed Load), skipping
    // anything nested under a pallet (e.g. cases inside a tote on a pallet) or on a stower.
    if(!fluid){
      const underPallet=new Set();
      for(const d of palletDetails()){const r=rowForDetails(d);if(r?.querySelectorAll)for(const n of r.querySelectorAll('div[id$="-details"]')){const id=idFromDetails(n);if(id)underPallet.add(id)}}
      for(const d of caseDetails()){const id=idFromDetails(d);if(id&&!/^unlabelled case$/i.test(id)&&!caseIndex[id]&&!activeByCase[id]&&!underPallet.has(id))caseIndex[id]='__FLUID__'}
      for(const d of toteDetails()){const id=idFromDetails(d);if(id&&!toteIndex[id]&&!activeByTote[id]&&!underPallet.has(id))toteIndex[id]='__FLUID__'}
    }
    const loose=classifyLoose(identity,Object.keys(pallets).length>0,caseIndex,toteIndex);
    const caseRowsAll=caseDetails(), toteRowsAll=toteDetails(), pc99RowsAll=pc99Details();
    const result={
      fluid:fluid&&!loose.mixed,mixed:loose.mixed,looseContainers:loose.looseContainers,source:'aft',version:V,capturedAt:Date.now(),shipRef:identity.shipRef,loadId:identity.loadId,trailerName:identity.trailerName,shipmentId:identity.shipmentId||null,destinationWarehouse:identity.destinationWarehouse||null,stowByAt:0,pallets,stagedPallets,
      caseIndex,toteIndex,caseQty,toteQty,caseItems,toteItems,containerLinks,activeByCase,activeByTote,
      diagnostics:{
        palletRows:Object.keys(pallets).length,
        uniquePallets:Object.keys(pallets).length,
        caseRows:caseRowsAll.length,
        toteRows:toteRowsAll.length,
        mappedTotes:Object.keys(toteIndex).length,
        unmappedToteRows:Math.max(0,toteRowsAll.length-Object.keys(toteIndex).length),
        mappedCases:Object.keys(caseIndex).length,
        unmappedCaseRows:Math.max(0,caseRowsAll.length-Object.keys(caseIndex).length),
        pc99Rows:pc99RowsAll.length,
        activeCaseMappings:Object.keys(activeByCase).length,
        activeToteMappings:Object.keys(activeByTote).length,
        casesWithItemDetails:Object.values(caseItems).filter(x=>x.length).length,
        totesWithItemDetails:Object.values(toteItems).filter(x=>x.length).length,
        palletsWithZeroCases:Object.values(pallets).filter(x=>!x.cases.length&&!x.totes.length&&!x.sap).length,
        sapPallets:Object.values(pallets).filter(x=>x.sap).length,
        samplePallets:Object.values(pallets).slice(0,8),
        sampleActiveStowers:activeStowers.slice(0,8),
        // 3.8.0: sign-in recovery evidence (station text is kept exactly as AFT shows it).
        stationStatus:{stowers:activeStowers.length,valid:activeStowers.filter(s=>{const t=String(s.station??'').trim();return !!t&&!/^(undefined|null|none|n\/?a|-+|\u2014)$/i.test(t)}).length}
      }
    };
    Object.defineProperty(result,'pmmPalletOccurrences',{value:pmmPalletOccurrences(palletDetails()),enumerable:false});
    try{Object.defineProperty(result,'pmmCountDom',{value:pmmCountDomEvidence(allDetailsNodes()),enumerable:false});}catch(_){/* Count-only DOM evidence cannot block tracking. */}
    _lastCaseRows=result.diagnostics.caseRows;
    _allDetailsSnapshot=null;
    return result;
  }

  function sameLoad(a,b){if(!a||!b)return false;if(a.loadId&&b.loadId)return a.loadId===b.loadId;return !!(a.shipRef&&b.shipRef&&a.shipRef===b.shipRef)}
  // 3.6.4: Hunter snapshots get their own key so AFT and Hunter are never compared with each other.
  function snapshotStorageKey(h){return K.snapshot+':'+loadScopeKey(h)+(h?.source==='hunter'?':hunter':'')}
  function legacySnapshotStorageKey(h){return K.snapshot+(h?.source==='hunter'?location.pathname:(h?.shipRef||location.pathname))}
  function usable(s){
    if(!s?.diagnostics)return false;
    const d=s.diagnostics;
    if(s.source==='hunter')return !!(d.caseRows>0||d.toteRows>0||d.sapPallets>0);
    const mapped=(d.caseRows>0||d.toteRows>0)&&(d.mappedCases>0||d.mappedTotes>0);
    const sapOnly=d.sapPallets>0&&d.palletRows>0;
    const active=Object.keys(s.activeByCase||{}).length+Object.keys(s.activeByTote||{}).length>0;
    return !!(mapped||sapOnly||active);
  }

  // A source observation is stable when the same baseline is retried after a failed commit.
  // A later trip over the same route has a different baseline and is a new event.
  function observedMovement(prev,cur,kind,id,oldPallet,newPallet,active=null){
    const quantity=Number(cur?.[kind+'Qty']?.[id])>0?Number(cur[kind+'Qty'][id]):Number(prev?.[kind+'Qty']?.[id])||0;
    const detectedAt=Number(cur?.capturedAt)||Date.now();
    const observationId=JSON.stringify([loadScopeKey(cur),cur.source||'aft',kind,id,oldPallet||'',newPallet||'STOWER',active?.stower||'',prev?.capturedAt||0]);
    return {caseId:id,kind,oldPallet,newPallet,stower:active?.stower||null,station:active?.station||null,quantity,detectedAt,observationId};
  }
  function compareHunter(prev,cur){
    const moves=[];
    for(const kind of ['case','tote']){
      const locKey=kind==='case'?'currentLocationByCase':'currentLocationByTote';
      const actKey=kind==='case'?'activeByCase':'activeByTote';
      const oldMap=prev?.[locKey]||{},newMap=cur?.[locKey]||{},oldIndex=prev?.[kind+'Index']||{};
      for(const id of new Set([...Object.keys(oldMap),...Object.keys(oldIndex)])){
        const oldLoc=clean(oldMap[id]||oldIndex[id]||''),newLoc=clean(newMap[id]||cur?.[kind+'Index']?.[id]||'');
        if(!oldLoc||!newLoc||oldLoc===newLoc)continue;
        const oldPallet=palletLike(oldLoc)?oldLoc:oldIndex[id];
        const loose=looseMark(oldPallet)&&!pc99Like(oldLoc);
        if(!palletLike(oldLoc)&&!loose)continue;
        if(pc99Like(newLoc)&&!prev?.[actKey]?.[id])moves.push(observedMovement(prev,cur,kind,id,oldPallet,null,{stower:newLoc}));
        else if(palletLike(newLoc)||(!loose&&!looseMark(newLoc)))moves.push(observedMovement(prev,cur,kind,id,oldPallet,newLoc));
      }
    }
    return moves;
  }
  function compare(prev,cur){
    if(cur?.source==='hunter')return compareHunter(prev,cur);
    const moves=[];
    for(const kind of ['case','tote']){
      const oldI=prev?.[kind+'Index']||{},newI=cur?.[kind+'Index']||{};
      const actKey=kind==='case'?'activeByCase':'activeByTote';
      const oldA=prev?.[actKey]||{},newA=cur?.[actKey]||{};
      for(const [id,p] of Object.entries(oldI)){
        // Explicit stower evidence takes priority over a loose/stale hierarchy index.
        if(newA[id]&&!oldA[id])moves.push(observedMovement(prev,cur,kind,id,p,null,newA[id]));
        else if(newI[id]&&newI[id]!==p&&!looseMark(newI[id]))moves.push(observedMovement(prev,cur,kind,id,p,newI[id]));
      }
    }
    return moves;
  }

  function beep(){
    if(!read(K.sound,false))return;
    try{
      const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
      if(!_audioCtx||_audioCtx.state==='closed')_audioCtx=new C();
      if(_audioCtx.state==='suspended')_audioCtx.resume?.();
      const o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
      o.connect(g);g.connect(_audioCtx.destination);o.frequency.value=880;g.gain.value=.04;o.start();o.stop(_audioCtx.currentTime+.12);
    }catch{}
  }

  function organizedKey(h){return K.organized+':'+loadScopeKey(h)}
  function legacyOrganizedKey(h){return K.organized+(h?.shipRef||location.pathname)}
  function organizedState(h){
    const key=organizedKey(h);let saved=read(key,null);
    if(!saved&&h?.source!=='hunter')saved=read(legacyOrganizedKey(h),null);
    if(saved&&saved.pallets&&(!h?.loadId||!saved.loadId||saved.loadId===h.loadId))return {...saved,shipRef:h?.shipRef||saved.shipRef||location.pathname,loadId:h?.loadId||saved.loadId||null,trailerName:h?.trailerName||saved.trailerName||null};
    return {shipRef:h?.shipRef||location.pathname,loadId:h?.loadId||null,trailerName:h?.trailerName||null,createdAt:new Date().toISOString(),pallets:{}};
  }
  const skuItems=items=>Array.isArray(items)?items.filter(x=>x?.fcSku&&Number(x.quantity)>0).map(x=>({fcSku:x.fcSku,quantity:Number(x.quantity)||0})):[];
  const sameSkuItems=(a,b)=>JSON.stringify(Array.isArray(a)?a:[])===JSON.stringify(Array.isArray(b)?b:[]);
  function ensureOrganizedEntry(state,pallet,id,kind,quantity,items,dirty){
    const pid=pallet||FLUID_MARK;
    if(!state.pallets[pid]){state.pallets[pid]={cases:{},totes:{}};if(dirty)dirty.changed=true}
    const bucket=kind==='tote'?'totes':'cases';
    if(!state.pallets[pid][bucket]){state.pallets[pid][bucket]={};if(dirty)dirty.changed=true}
    if(!state.pallets[pid][bucket][id]){
      state.pallets[pid][bucket][id]={kind,quantity:Number(quantity)||0,items:skuItems(items),stower:null,station:null,destinationPallet:null,movementTime:null,detectedAt:null};
      if(dirty)dirty.changed=true;
    }else {
      const e=state.pallets[pid][bucket][id],q=Number(quantity)||0,si=skuItems(items);
      if(q>0&&e.quantity!==q){e.quantity=q;if(dirty)dirty.changed=true}
      if(si.length&&!sameSkuItems(e.items,si)){e.items=si;if(dirty)dirty.changed=true}
    }
    return state.pallets[pid][bucket][id];
  }
  function applyOrganizedMovement(e,r,dirty){
    if(Number(e.detectedAt)>Number(r.detectedAt))return; // A late second-source observation must not rewind the latest movement.
    if(e.kind!==r.kind&&r.kind){e.kind=r.kind;dirty.changed=true}
    const fields={
      stower:r.stower||null,
      station:r.station||null,
      movementTime:r.movementTime||e.movementTime||null,
      detectedAt:Number(r.detectedAt)||Number(e.detectedAt)||0
    };
    if(Object.prototype.hasOwnProperty.call(r,'pallet'))fields.destinationPallet=r.pallet??null;
    else if(Object.prototype.hasOwnProperty.call(r,'destinationPallet'))fields.destinationPallet=r.destinationPallet??null;
    for(const [k,v] of Object.entries(fields))if(e[k]!==v){e[k]=v;dirty.changed=true}
  }
  function writeOrganized(h,state){
    const key=organizedKey(h);
    write(key,state);noteOrganizedKey(key);
  }
  function syncOrganized(h){
    if(!h?.shipRef)return false;
    const scopedKey=organizedKey(h),needsScopeMigration=!read(scopedKey,null)&&h?.source!=='hunter'&&!!read(legacyOrganizedKey(h),null);
    const state=organizedState(h),dirty={changed:false};
    const nextLoadId=h.loadId||state.loadId||null,nextTrailer=h.trailerName||state.trailerName||null;
    if(state.loadId!==nextLoadId){state.loadId=nextLoadId;dirty.changed=true}
    if(state.trailerName!==nextTrailer){state.trailerName=nextTrailer;dirty.changed=true}
    // Undo pallet -> Mixed/Fluid movements and loose duplicates of pallet containers.
    {const onPallet=new Set();
      for(const [pid,p] of Object.entries(state.pallets))if(!looseMark(pid))for(const b of ['cases','totes'])for(const [id,e] of Object.entries(p[b]||{})){
        onPallet.add(b+':'+id);
        if(e&&looseMark(e.destinationPallet)&&!e.stower){e.destinationPallet=null;e.movementTime=null;e.detectedAt=null;dirty.changed=true}
      }
      for(const pid of [FLUID_MARK,MIXED_MARK]){const p=state.pallets[pid];if(!p)continue;for(const b of ['cases','totes'])for(const id of Object.keys(p[b]||{}))if(onPallet.has(b+':'+id)){delete p[b][id];dirty.changed=true}}
    }
    // A load that turned out mixed: fold any earlier Fluid Load entries into Mixed Load.
    if(h.mixed&&state.pallets[FLUID_MARK]){const src=state.pallets[FLUID_MARK],dst=state.pallets[MIXED_MARK]||(state.pallets[MIXED_MARK]={cases:{},totes:{}});for(const b of ['cases','totes']){dst[b]=dst[b]||{};for(const [id,e] of Object.entries(src[b]||{}))if(!dst[b][id])dst[b][id]=e}delete state.pallets[FLUID_MARK];dirty.changed=true}
    // Seed the first accepted snapshot, then keep adding any newly discovered containers.
    for(const [id,pallet] of Object.entries(h.caseIndex||{}))ensureOrganizedEntry(state,pallet,id,'case',h.caseQty?.[id]||0,h.caseItems?.[id],dirty);
    for(const [id,pallet] of Object.entries(h.toteIndex||{}))ensureOrganizedEntry(state,pallet,id,'tote',h.toteQty?.[id]||0,h.toteItems?.[id],dirty);
    for(const [id,p] of Object.entries(h.pallets||{}))if(p?.sap)ensureOrganizedEntry(state,id,id,'sap',p.unlabelledUnits||0,[],dirty);
    // Enrich already-moved entries as AFT later supplies a station.
    for(const p of Object.values(state.pallets))for(const bucket of ['cases','totes'])for(const [id,e] of Object.entries(p[bucket]||{})){
      if(!e.movementTime)continue;
      const a=(bucket==='totes'?h.activeByTote:h.activeByCase)?.[id];
      if(a?.stower&&e.stower!==a.stower){e.stower=a.stower;dirty.changed=true}
      if(a?.station&&e.station!==a.station){e.station=a.station;dirty.changed=true}
      const q=Number((bucket==='totes'?h.toteQty:h.caseQty)?.[id])||0;if(q>0&&e.quantity!==q){e.quantity=q;dirty.changed=true}
      const si=skuItems((bucket==='totes'?h.toteItems:h.caseItems)?.[id]);if(si.length&&!sameSkuItems(e.items,si)){e.items=si;dirty.changed=true}
    }
    if(dirty.changed||needsScopeMigration)writeOrganized(h,state);
    else {
      // Bring a pre-3.5.13 organized state into the lightweight cleanup index once,
      // without rewriting the large organized payload on every unchanged scan.
      const key=organizedKey(h),idx=read(K.organizedIndex,{})||{};
      if(!idx[key])noteOrganizedKey(key);
    }
    return dirty.changed;
  }
  function recordOrganizedMovement(r,cur){
    const items=(r.kind==='tote'?cur.toteItems:cur.caseItems)?.[r.caseId];
    const state=organizedState(cur),dirty={changed:false},e=ensureOrganizedEntry(state,r.oldPallet,r.caseId,r.kind,r.quantity,items,dirty);
    applyOrganizedMovement(e,r,dirty);
    if(dirty.changed)writeOrganized(cur,state);
  }
  function syncResultMovementsIntoOrganized(h){
    const state=organizedState(h),dirty={changed:false};
    for(const r of currentHistory(read(K.results,[]),h).slice().reverse()){
      const items=(r.kind==='tote'?h.toteItems:h.caseItems)?.[r.caseId];
      const e=ensureOrganizedEntry(state,r.oldPallet,r.caseId,r.kind,r.quantity,items,dirty);
      applyOrganizedMovement(e,r,dirty);
    }
    if(dirty.changed)writeOrganized(h,state);
    return dirty.changed;
  }
  function clearOrganizedMovements(h){
    const state=organizedState(h);
    let changed=false;
    for(const p of Object.values(state.pallets||{}))for(const bucket of ['cases','totes'])for(const e of Object.values(p?.[bucket]||{})){
      if(e.stower!==null){e.stower=null;changed=true}
      if(e.station!==null){e.station=null;changed=true}
      if(e.destinationPallet!==null){e.destinationPallet=null;changed=true}
      if(e.movementTime!==null){e.movementTime=null;changed=true}
      if(e.detectedAt!==null){e.detectedAt=null;changed=true}
    }
    if(changed)writeOrganized(h,state);
    return changed;
  }

  function resultSources(r){return [...new Set([r.source||'aft',...(Array.isArray(r.sources)?r.sources:[])])];}
  function observationKey(m,cur){
    const route=dedupKey(loadScopeKey(cur),m.kind,m.caseId,m.oldPallet,m.newPallet);
    return m.kind==='sap'?'sap371:'+route:'obs371:'+(m.observationId||JSON.stringify([route,cur.source||pageSource(),m.detectedAt]));
  }
  function addResult(m,cur){
    const a=m.kind==='tote'?cur.activeByTote?.[m.caseId]||null:m.kind==='sap'?null:cur.activeByCase?.[m.caseId]||null;
    const source=cur.source||pageSource(),key=observationKey(m,cur),scope=loadScopeKey(cur);
    const arr=Array.isArray(read(K.results,[]))?read(K.results,[]):[];
    const processed=_storageBatch?(_storageBatch.prunedProcessed||(_storageBatch.prunedProcessed=pruneProcessed(read(K.processed,{})||{}))):pruneProcessed(read(K.processed,{})||{});
    if(processed[key]||arr.some(x=>x.eventId===key||(x.observationIds||[]).includes(key)))return;
    // SAP is a completion state, unlike case/tote transition events. Repeated scans must not re-log it.
    if(m.kind==='sap'){
      const legacyKeys=[dedupKey(scope,m.kind,m.caseId,m.oldPallet,m.newPallet),dedupKey(cur.shipRef,m.kind,m.caseId,m.oldPallet,m.newPallet),legacyDedupKey(cur.shipRef,m.kind,m.caseId,m.oldPallet,m.newPallet)];
      if(legacyKeys.some(k=>processed[k])||arr.some(x=>x.kind==='sap'&&x.scopeId===scope&&x.caseId===m.caseId&&x.pallet===m.newPallet))return;
    }
    const r={eventId:key,observationIds:[key],sources:[source],caseId:m.caseId,kind:m.kind||'case',oldPallet:m.oldPallet,pallet:m.newPallet,
      stower:m.stower||a?.stower||null,station:m.station||a?.station||null,quantity:Number(m.quantity)||0,
      items:skuItems((m.kind==='tote'?cur.toteItems:cur.caseItems)?.[m.caseId]),
      movementTime:new Date(m.detectedAt).toLocaleString(),shipRef:cur.shipRef,scopeId:scope,source,loadId:cur.loadId||null,trailerName:cur.trailerName||null,
      status:(m.stower||a?.stower)?'active':'idle',detectedAt:m.detectedAt};
    // Match the nearest unpaired observation of the SAME destination, oldest on ties. Never coalesce
    // another observation from a source already represented on the event (a real repeat).
    const twins=r.kind!=='sap'?arr.filter(x=>x&&x.scopeId===scope&&x.caseId===r.caseId&&x.kind===r.kind&&x.oldPallet===r.oldPallet&&
      (x.pallet||null)===(r.pallet||null)&&(!x.stower||!r.stower||x.stower===r.stower)&&!resultSources(x).includes(source)&&
      Math.abs(Number(r.detectedAt)-Number(x.detectedAt||0))<CROSS_SOURCE_MERGE_MS):[];
    const distance=x=>Math.abs(Number(r.detectedAt)-Number(x.detectedAt||0));
    const twin=twins.sort((a,b)=>distance(a)-distance(b)||Number(a.detectedAt)-Number(b.detectedAt))[0];
    processed[key]=Date.now();write(K.processed,processed);
    if(twin){
      if(!twin.stower&&r.stower){twin.stower=r.stower;twin.status='active';}
      if(!twin.station&&r.station)twin.station=r.station;
      if(!(Number(twin.quantity)>0)&&r.quantity>0)twin.quantity=r.quantity;
      if(!twin.items?.length&&r.items.length)twin.items=r.items;
      twin.sources=[...new Set([...resultSources(twin),source])];
      twin.observationIds=[...new Set([...(twin.observationIds||[]),key])];
      write(K.results,arr);recordOrganizedMovement(twin,cur);return;
    }
    arr.unshift(r);if(arr.length>MAX_RESULTS)arr.length=MAX_RESULTS;
    write(K.results,arr);recordOrganizedMovement(r,cur);
    if(read(K.sound,false)){if(_storageBatch)_storageBatch.sound=true;else beep();}
  }

  const CROSS_SOURCE_MERGE_MS=6*3600e3;
  // Combined: entries first logged by Hunter (pc99 only) pick up the station once AFT shows it.
  function enrichResultsFromAft(h){
    const arr=read(K.results,[]);if(!Array.isArray(arr)||!arr.length)return;
    const scope=loadScopeKey(h);let changed=false;
    for(const r of arr.slice(0,400)){
      if(!r||r.scopeId!==scope||r.station||!r.stower)continue;
      const a=(r.kind==='tote'?h.activeByTote:h.activeByCase)?.[r.caseId];
      if(a?.station&&(!a.stower||a.stower===r.stower)){r.station=a.station;changed=true}
    }
    if(changed)write(K.results,arr);
  }
  // A SAP pallet has no case-level IDs, so "moved" is tracked at the pallet level:
  // once its staging location is a real bin (not a dropzone, not a tote), log it as
  // a completed movement using the pallet's own ID as both the tracked container and
  // the "from" pallet. Dedup keys off (kind, caseId, oldPallet, newPallet) exactly like
  // case/tote moves, so this only fires once per pallet even though sap stays true
  // forever (AFT never clears the unlabelled-case rows once a SAP is stowed).
  function recordSapCompletions(h){
    for(const [id,p] of Object.entries(h.pallets||{})){
      if(!p.sap) continue;
      if(sapStagingKind(p.staging)!=='stowed') continue;
      addResult({caseId:id,kind:'sap',oldPallet:id,newPallet:p.staging.container,quantity:p.unlabelledUnits||0,detectedAt:Date.now()},h);
    }
  }

  let _diagnostic=null;
  function buildDiagnostic(h,full=false){
    const interesting=[];
    const selectors=[
      'div[id$="-details"]','.container-scannableId','.container-containerType',
      '.container-containerStatus','div[id$="-row"]','div[id$="-children"]'
    ];
    const seen=new Set();
    if(full)for(const sel of selectors){
      for(const n of document.querySelectorAll(sel)){
        if(interesting.length>=800)break;if(seen.has(n))continue;seen.add(n);
        interesting.push({tag:n.tagName.toLowerCase(),id:n.id||'',class:n.className||'',
          text:clean(n.textContent).slice(0,1000),children:n.children?.length||0});
      }
    }
    const d={version:V,generatedAt:new Date().toISOString(),url:location.href,title:document.title,
      reliability:full?reliabilityDiagnostic():{freshness:refreshFreshness()},
      health:{monitorRunning:monitorStarted&&!monitorError,lastScanAt:lastScanAt||null,lastSuccessfulScanAt:lastSuccessfulScanAt||null,lastRefreshAt:lastRefreshAt||null,refreshInProgress:refreshing,refreshTimeline:refreshTimeline(),refreshQueue:{phase:refreshPhase,owner:ownerInfo(),origin:location.origin,source:h?.source||pageSource(),sourceMode:dataSourceMode(),sourceActive:sourceTrackingActive(h),locksSupported:!!navigator.locks?.request,navigationBarrier:refreshBarrier(),pace:refreshPaceState(),reloadContinuation:reloadContinuation(),pageReady:isHunterPage()?!!(_hunterCsv.containers.length&&loadIdentity().loadId):(h?.source==='hunter'?!!_hunterApi.containers.length:aftPageReady()),buttonAvailable:isHunterPage()?!!hunterDownloadAnchor('Containers.csv'):(h?.source==='hunter'?true:refreshButtonAvailable())},refreshState,snapshotAccepted:lastSnapshotAccepted,snapshotRejectedReason:lastSnapshotRejectedReason||null,vrid:loadIdentity().loadId||null},
      rodeo:(()=>{try{return typeof pmmRodeoDiagnostic==='function'?pmmRodeoDiagnostic(loadIdentity(),full):{available:false,reason:'module-unavailable'};}catch(_){return {available:false,reason:'diagnostic-unavailable'};}})(),
      staging:pmmAutoDiagnostic(h),load:loadIdentity(),oneDcDetection:pmmOneDcDiagnostic(loadIdentity()),authRecovery:typeof authDiagnostic==='function'&&isAftPage()?authDiagnostic():null,trailerQuantities:aftTrailerQuantities(),sourceHealth:{aft:sourceHealth('aft',h?.loadId),hunter:sourceHealth('hunter',h?.loadId)},hunterCsv:isHunterPage()?{loadedAt:_hunterCsv.loadedAt,containers:_hunterCsv.containers.length,locations:_hunterCsv.locations.length,error:_hunterCsv.error||''}:null,hunterApi:isAftPage()?{loadedAt:_hunterApi.loadedAt,containers:_hunterApi.containers.length,locations:_hunterApi.locations.length,classification:_hunterApi.classification,error:_hunterApi.error||'',url:_hunterApi.url||'',lastRequest:_hunterApiLast,failCount:_hunterFailCount,transport:_hunterApi.transport||null,trailerUrl:hunterTrailerUrl(loadIdentity()),feed:{alive:feederAlive(loadIdentity().shipmentId),meta:feedMeta(loadIdentity().shipmentId),want:feedWant(loadIdentity().shipmentId),dataAt:_hunterApi.dataAt||null,truncated:!!_hunterApi.truncated}}:null,stagedPallets:h.stagedPallets||{},hierarchy:h.diagnostics,bodyText:full?clean(document.body?.innerText).slice(0,20000):'',
      sla:{cache:SLA._internals.getEntry(SLA._internals.identityKey(loadIdentity())),version:SLA.version},
      palletCountConfirmation:(()=>{try{return pmmCountDiagnostic(h);}catch(_){return {enabled:false,error:'Count diagnostic unavailable'};}})(),
      performance:JSON.parse(JSON.stringify(perfStats)),scanScheduler:{pending:_scanReasons.size>0,reasons:[..._scanReasons],minGapMs:SCAN_MIN_GAP_MS,maxWaitMs:SCAN_MAX_WAIT_MS},interesting,htmlSample:full?(document.body?.innerHTML?.slice(0,100000)||''):''};
    _diagnostic=d;return d;
  }

  function downloadDiagnostic(full=false){
    const d=_diagnostic;if(!d)return;
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));
    a.download=`pax-monitor-${full?'full':'summary'}-${Date.now()}.json`;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  function inject(){
    if(document.getElementById('pax-monitor-v311-style'))return;
    const s=document.createElement('style');s.id='pax-monitor-v311-style';
    s.textContent=`
#pax-monitor-v311{position:fixed;will-change:left,top;right:16px;top:16px;width:600px;max-width:calc(100vw - 24px);max-height:84vh;z-index:2147483647;background:#fff;color:#111;border:1px solid #999;border-radius:10px;box-shadow:0 5px 25px #0003;font:14px Arial,sans-serif;overflow:hidden}
#pax-monitor-v311.dark{background:#181818;color:#eee;border-color:#555}#pax-monitor-v311 .h{cursor:default;padding:8px 10px;background:#eee;border-bottom:1px solid #ccc;font-weight:bold;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;column-gap:10px}#pax-monitor-v311 .drag-handle{grid-column:1;justify-self:start;cursor:grab;user-select:none;touch-action:none;padding:4px 7px;border:1px solid #aaa;border-radius:6px;line-height:1;font-size:18px;background:transparent;color:inherit}#pax-monitor-v311 .drag-handle:active{cursor:grabbing}#pax-monitor-v311 .h-title{grid-column:2;text-align:center;user-select:none}#pax-monitor-v311 .h-status{grid-column:3;justify-self:end;white-space:nowrap}
#pax-monitor-v311.dark .h{background:#252525;border-color:#444}#pax-monitor-v311 .b{padding:8px 10px 54px;overflow:auto;max-height:76vh}
#pax-monitor-v311 .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.card{padding:7px 8px;background:#f1f1f1;border-radius:7px;text-align:center}.dark .card{background:#292929}.num{font-size:21px;font-weight:bold}
#pax-monitor-v311 button,#pax-monitor-v311 select,#pax-monitor-v311 input{font-size:13px;margin:3px;padding:6px 9px;max-width:100%;box-sizing:border-box}#pax-monitor-v311.dark button,#pax-monitor-v311.dark select,#pax-monitor-v311.dark input{background:#303030;color:#f5f5f5;border:1px solid #777}#pax-monitor-v311.dark button:disabled,#pax-monitor-v311.dark select:disabled,#pax-monitor-v311.dark input:disabled{background:#242424;color:#999;border-color:#555}#pax-monitor-v311 .diag{border-top:1px solid #ccc;margin-top:8px;padding-top:8px}
#pax-monitor-v311 .pallet-group{border:1px solid #ccc;border-radius:6px;margin:7px 0;overflow:hidden}#pax-monitor-v311.dark .pallet-group{border-color:#555}
#pax-monitor-v311 .pallet-group>summary{cursor:pointer;padding:9px;overflow-wrap:anywhere;background:#f3f3f3;font-weight:bold}#pax-monitor-v311.dark .pallet-group>summary{background:#303030}
#pax-monitor-v311 .pallet-children{padding:4px 9px}#pax-monitor-v311 .container-entry{padding:6px 0;border-bottom:1px solid #ddd;overflow-wrap:anywhere}#pax-monitor-v311 details.container-entry>summary{cursor:pointer;list-style:revert}#pax-monitor-v311 .container-detail{padding:3px 6px 4px 12px;background:#fafafa;border-radius:4px}#pax-monitor-v311.dark .container-detail{background:#222}#pax-monitor-v311.dark .container-entry{border-color:#444}
#pax-monitor-v311.minimized{width:470px!important;max-width:calc(100vw - 24px);height:auto!important;min-height:0!important;resize:none!important}#pax-monitor-v311.minimized>.b{display:none!important}#pax-monitor-v311.minimized .h{grid-template-columns:auto minmax(0,1fr) auto;column-gap:12px}#pax-monitor-v311.minimized .drag-handle{grid-column:1}#pax-monitor-v311.minimized .h-title{grid-column:2;justify-self:center;min-width:0}#pax-monitor-v311.minimized .h-status{grid-column:3;justify-self:end}#pax-monitor-v311 .h button{cursor:pointer;margin:0;padding:2px 8px}#pax-monitor-v311 .main-controls{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:7px 0 2px}#pax-monitor-v311 .tabs{display:flex;flex-wrap:nowrap;gap:2px;margin-top:3px;overflow-x:auto;scrollbar-width:thin;padding-bottom:1px}#pax-monitor-v311 .tabs button[aria-selected="true"]{font-weight:bold;outline:2px solid currentColor}#pax-monitor-v311 .filterbar{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:4px 0 5px}#pax-monitor-v311 .filterbar input{flex:1;min-width:160px}#pax-monitor-v311 .statusline{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:6px;margin:3px 0 5px;padding:4px 0;border-bottom:1px solid #ddd;font-size:11.5px;opacity:.86;white-space:normal}#pax-monitor-v311.dark .statusline{border-color:#444}#pax-monitor-v311 .status-moves{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:10px;background:#f0f0f0;white-space:nowrap}#pax-monitor-v311.dark .status-moves{background:#2b2b2b}#pax-monitor-v311 #last-updated{min-width:0;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#pax-monitor-v311 #refresh-status{text-align:right;white-space:nowrap}#pax-monitor-v311 .copy-movement{float:right;padding:3px 7px;margin:0 0 3px 6px}#pax-monitor-v311 .copy-pallet-ids{margin-left:7px;padding:2px 7px;font-size:10.5px;vertical-align:1px;border:1px solid #bbb;border-radius:5px;background:transparent;color:inherit;cursor:pointer}#pax-monitor-v311 .copy-pallet-ids:hover{background:#eee}#pax-monitor-v311.dark .copy-pallet-ids{border-color:#555}#pax-monitor-v311.dark .copy-pallet-ids:hover{background:#303030}#pax-monitor-v311 .hist{border-top:1px solid #ddd;padding:7px 0}.dark .hist{border-color:#444}.muted{opacity:.72}#pax-monitor-v311 .item-list{margin:5px 0 0 16px;padding:5px 8px;border-left:2px solid #bbb;background:#f4f4f4}#pax-monitor-v311.dark .item-list{border-color:#555;background:#262626}#pax-monitor-v311 .item-row{padding:2px 0}#pax-monitor-v311 a.monitor-link{color:#1466c3;text-decoration:underline;text-underline-offset:2px}#pax-monitor-v311.dark a.monitor-link{color:#8fc5ff}#pax-monitor-v311 .movement-hit{background:#fff4c7;border-left:4px solid #b57b00;padding-left:7px}#pax-monitor-v311.dark .movement-hit{background:#3b321b;border-left-color:#e0ad3c}#pax-monitor-v311 .movement-hit>summary{font-weight:bold}#pax-monitor-v311 .movement-seen{opacity:.9}#pax-monitor-v311 .sap-row{background:#e6f7ea;border-left:4px solid #1f7a34;padding-left:7px}#pax-monitor-v311.dark .sap-row{background:#1b3b23;border-left-color:#5fd97a}#pax-monitor-v311 .new-badge{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:10px;background:#b57b00;color:#fff;font-size:11px;font-weight:bold}#pax-monitor-v311.dark .new-badge{background:#e0ad3c;color:#111}#pax-monitor-v311 .health-warn{font-weight:bold}#pax-monitor-v311 .bottom-tools{border-top:1px solid #ccc;margin-top:8px;padding-top:7px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}#pax-monitor-v311 .bottom-tools button{border:0;background:transparent;color:#06c;text-decoration:underline;padding:2px 0;margin:0;cursor:pointer}#pax-monitor-v311.dark .bottom-tools{border-color:#444}#pax-monitor-v311.dark .bottom-tools button{color:#8ab4f8}#pax-monitor-v311 .identity-card{display:flex;flex-direction:column;justify-content:center}#pax-monitor-v311 .identity-primary{font-size:16px;font-weight:bold;overflow-wrap:anywhere;line-height:1.2}#pax-monitor-v311 .identity-label{font-size:12px;opacity:.72;margin-top:1px}#pax-monitor-v311 .identity-secondary{font-size:12px;margin-top:7px;opacity:.85;overflow-wrap:anywhere}#pax-monitor-v311 .source-note{margin:5px 0;padding:6px 8px;border-radius:7px;background:#eef5ff;border:1px solid #b9d3f2;font-size:11.5px}#pax-monitor-v311.dark .source-note{background:#1e2b38;border-color:#37536f}#pax-monitor-v311 #monitor-state{display:inline-flex;align-items:center;gap:5px}#pax-monitor-v311 #monitor-state::before{content:'';width:8px;height:8px;border-radius:50%;background:#999;flex:0 0 auto}#pax-monitor-v311 #monitor-state.state-live{color:#1f7a34}#pax-monitor-v311 #monitor-state.state-live::before{background:#2e9e44;box-shadow:0 0 0 2px rgba(46,158,68,.25)}#pax-monitor-v311 #monitor-state.state-paused::before{background:#999}#pax-monitor-v311 #monitor-state.state-stalled{color:#a6720c}#pax-monitor-v311 #monitor-state.state-stalled::before{background:#e0ad3c}#pax-monitor-v311 #monitor-state.state-error{color:#c0392b}#pax-monitor-v311 #monitor-state.state-error::before{background:#c0392b}#pax-monitor-v311 #monitor-state.state-starting::before{background:#999}#pax-monitor-v311.dark #monitor-state.state-live{color:#5fd97a}#pax-monitor-v311.dark #monitor-state.state-stalled{color:#e0ad3c}#pax-monitor-v311.dark #monitor-state.state-error{color:#ff8a80}#pax-monitor-v311 #reset{border-color:#888;color:#666;font-weight:600}#pax-monitor-v311.dark #reset{border-color:#777;color:#bbb}#pax-monitor-v311 .tabs button{flex:0 0 auto;border:1px solid transparent;background:transparent;border-radius:16px;padding:4px 9px;margin:1px 0;font-size:12.5px;opacity:.72;color:inherit;outline:none;white-space:nowrap}#pax-monitor-v311 .tabs button:hover{opacity:1;background:#eaeaea}#pax-monitor-v311 .tabs button[aria-selected="true"]{opacity:1;font-weight:bold;background:#1466c3;color:#fff;border-color:#1466c3}#pax-monitor-v311.dark .tabs button:hover{background:#303030}#pax-monitor-v311.dark .tabs button[aria-selected="true"]{background:#8fc5ff;color:#111;border-color:#8fc5ff}#pax-monitor-v311 .copy-movement{border:1px solid #ccc;background:transparent;color:#666;font-size:11px;opacity:0;transition:opacity .12s}#pax-monitor-v311 .container-entry:hover .copy-movement,#pax-monitor-v311 .copy-movement:focus-visible{opacity:.85}#pax-monitor-v311 .copy-movement:hover{opacity:1;background:#f1f1f1}#pax-monitor-v311.dark .copy-movement{border-color:#555;color:#bbb}#pax-monitor-v311.dark .copy-movement:hover{background:#303030}
#pax-monitor-v311{--pmm-a:#1466c3;--pmm-b:#1466c3;--pmm-accent:#1466c3;--pmm-strong:#0d57ac;--pmm-soft:#eef4fc;--pmm-line:#c4d8f1;--pmm-ink:#fff;border-color:#c9ccd3;border-radius:12px;box-shadow:0 10px 30px rgba(15,23,42,.18),0 2px 6px rgba(15,23,42,.08);font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
#pax-monitor-v311.mode-hunter{--pmm-a:#5b2c8a;--pmm-b:#5b2c8a;--pmm-accent:#5b2c8a;--pmm-strong:#46206c;--pmm-soft:#f4eff9;--pmm-line:#d8c8ea}
#pax-monitor-v311.mode-auto{--pmm-a:#0f7c80;--pmm-b:#0f7c80;--pmm-accent:#0f7c80;--pmm-strong:#0b6265;--pmm-soft:#eaf5f5;--pmm-line:#bfdfe0}
#pax-monitor-v311.mode-combined{--pmm-a:#1466c3;--pmm-b:#5b2c8a;--pmm-accent:#3a4bb0;--pmm-strong:#2c3a94;--pmm-soft:#f0effa;--pmm-line:#cfd0ef}
#pax-monitor-v311.dark{--pmm-a:#8fc5ff;--pmm-b:#8fc5ff;--pmm-accent:#8fc5ff;--pmm-strong:#6fb1f5;--pmm-soft:#1b2633;--pmm-line:#33506e;--pmm-ink:#111;border-color:#3a3a3a}
#pax-monitor-v311.dark.mode-hunter{--pmm-a:#b48ae0;--pmm-b:#b48ae0;--pmm-accent:#b48ae0;--pmm-strong:#9d6fd1;--pmm-soft:#251d31;--pmm-line:#4f3a69}
#pax-monitor-v311.dark.mode-auto{--pmm-a:#5cc8cc;--pmm-b:#5cc8cc;--pmm-accent:#5cc8cc;--pmm-strong:#41b0b4;--pmm-soft:#152b2c;--pmm-line:#2c5a5c}
#pax-monitor-v311.dark.mode-combined{--pmm-a:#8fc5ff;--pmm-b:#b48ae0;--pmm-accent:#a3a8f0;--pmm-strong:#8a90e6;--pmm-soft:#1f2135;--pmm-line:#41446e}
#pax-monitor-v311 .h{background:linear-gradient(90deg,var(--pmm-a),var(--pmm-b)) top/100% 4px no-repeat,var(--pmm-soft);border-bottom:1px solid var(--pmm-line);padding:11px 10px 8px}
#pax-monitor-v311.dark .h{background:linear-gradient(90deg,var(--pmm-a),var(--pmm-b)) top/100% 4px no-repeat,var(--pmm-soft);border-color:var(--pmm-line)}
#pax-monitor-v311 .h-title{color:var(--pmm-strong);display:inline-flex;align-items:center;gap:7px;justify-content:center}#pax-monitor-v311.dark .h-title{color:var(--pmm-accent)}
#pax-monitor-v311 .mode-chip{display:inline-block;padding:2px 8px;border-radius:10px;background:linear-gradient(90deg,var(--pmm-a),var(--pmm-b));color:var(--pmm-ink);font-size:10.5px;font-weight:700;letter-spacing:.03em;white-space:nowrap}
#pax-monitor-v311 .drag-handle{border-color:var(--pmm-line)!important;color:var(--pmm-strong)!important}
#pax-monitor-v311 button,#pax-monitor-v311 select,#pax-monitor-v311 input{border-radius:7px;border:1px solid #c8ccd2;background:#fff;color:inherit;cursor:pointer}#pax-monitor-v311 input{cursor:text}
#pax-monitor-v311 button:hover:not(:disabled),#pax-monitor-v311 select:hover:not(:disabled){border-color:var(--pmm-accent);background:var(--pmm-soft)}
#pax-monitor-v311.dark button:hover:not(:disabled),#pax-monitor-v311.dark select:hover:not(:disabled){border-color:var(--pmm-accent);background:var(--pmm-soft)}
#pax-monitor-v311 button:focus-visible,#pax-monitor-v311 select:focus-visible,#pax-monitor-v311 input:focus-visible{outline:2px solid var(--pmm-accent);outline-offset:1px}
#pax-monitor-v311 #pause{border-color:var(--pmm-accent);color:var(--pmm-strong);font-weight:600}#pax-monitor-v311.dark #pause{color:var(--pmm-accent)}
#pax-monitor-v311 #reset{border-color:#d0d3d8;color:#555;font-weight:500}#pax-monitor-v311.dark #reset{border-color:#555;color:#bbb}
#pax-monitor-v311 .card{background:#f5f6f8;border:1px solid #e6e8ec;border-radius:9px}#pax-monitor-v311.dark .card{background:#232323;border-color:#333}#pax-monitor-v311 .num{color:var(--pmm-strong)}#pax-monitor-v311.dark .num{color:var(--pmm-accent)}
#pax-monitor-v311 .grid{grid-template-columns:minmax(0,.8fr) minmax(0,1.6fr) minmax(0,1fr)}
#pax-monitor-v311 .grid>.card{display:flex;flex-direction:column;justify-content:center;min-width:0;text-align:center}#pax-monitor-v311 .pallet-card{overflow-wrap:anywhere}#pax-monitor-v311 .quantity-card{container-type:inline-size}
#pax-monitor-v311 .quantity-metrics{display:flex;flex-direction:column;gap:0;margin:0;padding:0;float:none;width:auto;min-width:0}#pax-monitor-v311 .quantity-metrics::before,#pax-monitor-v311 .quantity-metrics::after{content:none!important;display:none!important}
#pax-monitor-v311 .quantity-metric{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.55fr);align-items:center;gap:3px 8px;min-width:0;margin:0;padding:3px 0;float:none;width:auto;border:0}#pax-monitor-v311 .quantity-metric+.quantity-metric{border-top:1px solid #e0e3e8}#pax-monitor-v311.dark .quantity-metric+.quantity-metric{border-color:#3c3c3c}
#pax-monitor-v311 .quantity-metrics dt,#pax-monitor-v311 .quantity-metrics dd{display:block;position:static;float:none;clear:none;width:auto;min-width:0;max-width:none;height:auto;margin:0;padding:0;border:0;text-indent:0;white-space:normal;overflow-wrap:anywhere;color:inherit}
#pax-monitor-v311 .quantity-metrics dt{font-size:10px;font-weight:400;line-height:1.3;text-align:center}#pax-monitor-v311 .quantity-metrics dd{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.25;text-align:center}#pax-monitor-v311 .quantity-metrics dd.quantity-unavailable{font-size:11px;font-weight:400;color:#62666c}#pax-monitor-v311.dark .quantity-metrics dd.quantity-unavailable{color:#bdc2ca}
#pax-monitor-v311 .quantity-warning{text-align:left;font-size:10.5px;line-height:1.35;margin:7px 0 0;padding:5px 6px;border-radius:4px;color:#714500;background:#fff0c2}#pax-monitor-v311.dark .quantity-warning{color:#ffe1a0;background:#47381c}#pax-monitor-v311 .quantity-note{text-align:left;font-size:10.5px;line-height:1.3;margin:7px 0 0;overflow-wrap:anywhere}
@container (max-width:150px){#pax-monitor-v311 .quantity-metric{grid-template-columns:minmax(0,1fr);gap:2px}#pax-monitor-v311 .quantity-metrics dd{text-align:center}}
#pax-monitor-v311 .tabs button{border-radius:16px!important;border:1px solid transparent!important;background:transparent!important}
#pax-monitor-v311 .tabs button:hover{background:var(--pmm-soft)!important}
#pax-monitor-v311 .tabs button[aria-selected="true"],#pax-monitor-v311.dark .tabs button[aria-selected="true"]{background:linear-gradient(90deg,var(--pmm-a),var(--pmm-b))!important;color:var(--pmm-ink)!important;border-color:transparent!important}
#pax-monitor-v311 .settings-gear,#pax-monitor-v311.dark .settings-gear{background:linear-gradient(135deg,var(--pmm-a),var(--pmm-b))!important;color:var(--pmm-ink)!important;border:1px solid var(--pmm-strong)!important}
#pax-monitor-v311 .settings-panel{top:40px;border-color:var(--pmm-line);box-shadow:0 12px 32px rgba(15,23,42,.25)}
#pax-monitor-v311 .settings-panel h4{color:var(--pmm-strong)}#pax-monitor-v311.dark .settings-panel h4{color:var(--pmm-accent)}
#pax-monitor-v311 .settings-sub{margin-top:8px;font-size:12px}#pax-monitor-v311 .settings-sub>summary{cursor:pointer;opacity:.8;margin-bottom:5px}
#pax-monitor-v311 .source-note{background:var(--pmm-soft);border-color:var(--pmm-line)}#pax-monitor-v311.dark .source-note{background:var(--pmm-soft);border-color:var(--pmm-line)}
#pax-monitor-v311 .status-moves{background:var(--pmm-soft);color:var(--pmm-strong)}#pax-monitor-v311.dark .status-moves{background:var(--pmm-soft);color:var(--pmm-accent)}
#pax-monitor-v311 #monitor-state.state-live{color:var(--pmm-strong)}#pax-monitor-v311.dark #monitor-state.state-live{color:var(--pmm-accent)}
#pax-monitor-v311 a.monitor-link{color:var(--pmm-strong)}#pax-monitor-v311.dark a.monitor-link{color:var(--pmm-accent)}
#pax-monitor-v311 .pallet-group{border-color:#dfe2e6;border-radius:8px}#pax-monitor-v311 .pallet-group>summary{background:#f6f7f9}#pax-monitor-v311 .pallet-group[open]>summary{border-bottom:1px solid #e3e5e9;box-shadow:inset 3px 0 0 var(--pmm-accent)}
#pax-monitor-v311.dark .pallet-group{border-color:#3a3a3a}#pax-monitor-v311.dark .pallet-group>summary{background:#262626}#pax-monitor-v311.dark .pallet-group[open]>summary{border-color:#3a3a3a}
@media (hover:none){#pax-monitor-v311 .copy-movement{opacity:1}}
#pax-monitor-v311 .copy-movement:focus-visible{opacity:1;outline:2px solid #1466c3}
#pax-monitor-v311 .duplicate-banner{margin:6px 0 3px;padding:7px 9px;border-radius:8px;background:#fff4c7;border:1px solid #d7b45a;font-size:11.5px}#pax-monitor-v311.dark .duplicate-banner{background:#3b321b;border-color:#8f6b18}#pax-monitor-v311 .source-note.auth-needed{background:#fff4c7;border-color:#d7b45a}#pax-monitor-v311.dark .source-note.auth-needed{background:#3b321b;border-color:#8f6b18}#pax-monitor-v311 .auth-note button{margin-left:6px;padding:1px 7px;font-size:11px}#pax-monitor-v311 .top-actions{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin:7px 0 2px}#pax-monitor-v311 .main-controls{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0;flex:1 1 auto}#pax-monitor-v311 .main-controls button{padding:5px 10px;margin:0}#pax-monitor-v311 .settings-anchor{position:relative;display:flex;justify-content:flex-end;flex:0 0 auto;min-width:34px}#pax-monitor-v311 .settings-gear{position:relative;z-index:5;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;background:#1466c3;color:#fff;border:1px solid #0d57ac;box-shadow:0 2px 10px rgba(0,0,0,.22);margin:0}#pax-monitor-v311.dark .settings-gear{background:#8fc5ff;color:#111;border-color:#8fc5ff}#pax-monitor-v311 .settings-panel{position:absolute;right:0;top:42px;bottom:auto;z-index:6;width:min(360px,calc(100vw - 56px));max-height:min(66vh,560px);overflow:auto;background:#fff;border:1px solid #bbb;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.22);padding:10px}#pax-monitor-v311.dark .settings-panel{background:#1f1f1f;border-color:#555}#pax-monitor-v311 .settings-panel h4{margin:0 0 7px;font-size:14px}#pax-monitor-v311 .settings-section{padding:7px 0;border-top:1px solid #ddd}#pax-monitor-v311 .settings-section:first-of-type{border-top:0;padding-top:0}#pax-monitor-v311.dark .settings-section{border-color:#444}#pax-monitor-v311 .settings-section-title{font-size:11px;text-transform:uppercase;letter-spacing:.06em;opacity:.65;font-weight:bold;margin:0 0 5px}#pax-monitor-v311 .settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}#pax-monitor-v311 .settings-grid button,#pax-monitor-v311 .settings-grid select{width:100%;margin:0;padding:6px 7px}#pax-monitor-v311 .settings-wide{grid-column:1/-1}#pax-monitor-v311 .settings-danger{color:#b42318!important;border-color:#d92d20!important}#pax-monitor-v311.dark .settings-danger{color:#ff9b94!important;border-color:#e57373!important}#pax-monitor-v311 .settings-note{font-size:10.5px;opacity:.72;margin-top:6px;line-height:1.35}#pax-monitor-v311 .settings-health{font-size:12px}#pax-monitor-v311 .settings-health details{margin-top:2px}#pax-monitor-v311 .settings-health pre{margin:6px 0 0;white-space:pre-wrap;word-break:break-word;font:11px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;background:#f5f5f5;padding:8px;border-radius:8px}#pax-monitor-v311.dark .settings-health pre{background:#2a2a2a}#pax-monitor-v311 .bottom-tools{display:none!important}@media (max-width:520px){#pax-monitor-v311 .statusline{grid-template-columns:auto 1fr;gap:4px}#pax-monitor-v311 #refresh-status{grid-column:1/-1;text-align:left;padding-left:2px}#pax-monitor-v311 #last-updated{text-align:right}}@media (max-width:640px){#pax-monitor-v311 .top-actions{flex-wrap:wrap}#pax-monitor-v311 .settings-anchor{width:100%;justify-content:flex-end}#pax-monitor-v311 .settings-panel{width:min(360px,calc(100vw - 48px))}}
#pax-monitor-v311 .settings-heading{display:flex;align-items:center;justify-content:space-between}#pax-monitor-v311 .settings-heading h4{margin:0}
#pax-monitor-v311 .settings-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin:8px 0}
#pax-monitor-v311 .settings-tabs button{color:inherit;border:1px solid var(--pmm-line);padding:6px 3px;margin:0;font-size:11.5px;background:transparent;border-radius:5px}
#pax-monitor-v311 .settings-tabs button[aria-selected="true"]{background:var(--pmm-strong);color:#fff}#pax-monitor-v311.dark .settings-tabs button[aria-selected="true"]{background:var(--pmm-accent);color:var(--pmm-ink)}
#pax-monitor-v311 .settings-tabs button:focus-visible{outline:2px solid var(--pmm-accent);outline-offset:2px}
#pax-monitor-v311 .filterbar[hidden],#pax-monitor-v311 .settings-section[hidden]{display:none!important}#pax-monitor-v311 .settings-scope{margin-top:0}
#pax-monitor-v311 .settings-panel{position:fixed;right:auto;bottom:auto;max-height:min(66vh,560px)}
#pax-monitor-v311 .settings-scope-note{margin-top:0}
#pax-monitor-v311 .pmm-pallet-tools{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin:2px 0 5px}
#pax-monitor-v311 .pmm-pallet-tools button{margin:0;padding:4px 8px;font-size:11.5px}
#pax-monitor-v311 #pmm-copy-nonmoving-status{font-size:11.5px;overflow-wrap:anywhere}
#pax-monitor-v311 .pallet-group.pmm-pallet-duplicated{border-color:#c49a2c}
#pax-monitor-v311 .pallet-group.pmm-pallet-duplicated>summary{background:#fff4c7;color:#543d00}
#pax-monitor-v311 .pallet-group.pmm-pallet-duplicated>summary .muted{opacity:1;color:inherit}
#pax-monitor-v311 .pallet-group.pmm-pallet-duplicated[open]>summary{box-shadow:none;border-bottom-color:#c49a2c}
#pax-monitor-v311 .pmm-pallet-duplicate{display:inline-block;margin-left:7px;padding:1px 6px;border:1px solid #957019;border-radius:4px;color:#543d00;background:#ffe79b;font-size:11px;font-weight:bold;white-space:nowrap}
#pax-monitor-v311 .pmm-pallet-duplicate:focus-visible{outline:2px solid currentColor;outline-offset:2px}
#pax-monitor-v311 .pmm-pallet-duplicate-note{padding:6px 8px;font-size:11.5px;background:#fff4c7;color:#543d00}
#pax-monitor-v311.dark .pallet-group.pmm-pallet-duplicated{border-color:#9c7928}
#pax-monitor-v311.dark .pallet-group.pmm-pallet-duplicated>summary,#pax-monitor-v311.dark .pmm-pallet-duplicate-note{background:#3b321b;color:#ffe3a0}
#pax-monitor-v311.dark .pmm-pallet-duplicate{background:#544119;color:#ffe3a0;border-color:#cba34e}
#pax-monitor-v311 .settings-panel select{max-width:100%}#pax-monitor-v311 .settings-sub label{display:block;margin:6px 0}
`;
    document.head.appendChild(s);
  }

  const savedOpen=read(K.sectionOpen,{})||{};
  const openPallets=new Set(Array.isArray(savedOpen.pallets)?savedOpen.pallets:[]);
  const openContainers=new Set(Array.isArray(savedOpen.containers)?savedOpen.containers:[]);
  let _openStateTimer=0;
  const saveOpenState=()=>{clearTimeout(_openStateTimer);_openStateTimer=setTimeout(()=>write(K.sectionOpen,{pallets:[...openPallets],containers:[...openContainers]}),350)};
  // 3.6.8: acknowledged NEW marks survive this tab's AFT reloads (sessionStorage, per tab).
  const ACK_SESSION_KEY='pmm-acknowledged-v368',ACK_MAX=3000;
  const acknowledgedMovements=new Set((()=>{try{const a=JSON.parse(sessionStorage.getItem(ACK_SESSION_KEY)||'[]');return Array.isArray(a)?a.slice(-ACK_MAX):[]}catch{return []}})());
  function saveAcknowledged(){try{sessionStorage.setItem(ACK_SESSION_KEY,JSON.stringify([...acknowledgedMovements].slice(-ACK_MAX)))}catch{}}
  const movementAckKey=r=>r?[r.scopeId||r.loadId||r.shipRef||'',r.kind||'',r.caseId||'',r.oldPallet||'',r.pallet||'',Number(r.detectedAt)||r.movementTime||''].join(SEP):'';
  const knownContainerLinks={};
  const linkHtml=(label,href)=>href?`<a class="monitor-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:esc(label);
  // 3.6.4: links are built from the FC Research search template for every ID (case, tote,
  // pallet, pc99, drop zone), so they never disappear when AFT stops rendering a container.
  const FC_RESEARCH_BASE='https://qi-fcresearch-na.corp.amazon.com/';
  function linkWarehouse(h){return clean(h?.destinationWarehouse)||clean(loadIdentity().destinationWarehouse)||clean(location.pathname.split('/')[1])||originBuilding()}
  function fcResearchLink(id,h){const v=clean(id);if(!v||/^(?:__FLUID__|__MIXED__|STOWER)$/i.test(v))return null;const wh=linkWarehouse(h);if(!wh)return null;return FC_RESEARCH_BASE+encodeURIComponent(wh)+'/results?s='+encodeURIComponent(v)}
  const containerHtml=(h,id)=>linkHtml(id,fcResearchLink(id,h)||h?.containerLinks?.[id]||knownContainerLinks[id]);
  function itemBreakdown(items){if(!Array.isArray(items)||!items.length)return '';const rows=items.filter(x=>x?.fcSku&&Number(x.quantity)>0&&!/^fcsku$/i.test(x.fcSku)).map(x=>`<div class="item-row"><b>${esc(x.fcSku)}</b>${Number(x.quantity)>1?` <span class="muted">× ${Number(x.quantity)}</span>`:''}</div>`).join('');return rows?`<div class="item-list">${rows}</div>`:''}
  function containerEntry(h,id,qty,items,extra='',movementHit=false,movementKey=''){const hasItems=Array.isArray(items)&&items.some(x=>x?.fcSku&&Number(x.quantity)>0&&!/^fcsku$/i.test(x.fcSku));const hit=movementHit?' movement-hit':'';const movedAttr=movementHit?` data-movement-hit="1" data-movement-key="${esc(movementKey)}"`:'';const head=`<b>${containerHtml(h,id)}</b> <span class="muted">${qty} ${qty===1?'unit':'units'}</span>`;if(!hasItems)return `<div class="container-entry${hit}" data-container="${esc(id)}"${movedAttr}>${head}${extra}</div>`;return `<details class="container-entry container-group${hit}" data-container="${esc(id)}"${movedAttr} ${openContainers.has(id)?'open':''}><summary>${head}</summary><div class="container-detail">${extra}${itemBreakdown(items)}</div></details>`}

  // PMM-CHUNK-BEGIN count-confirmation
  // Diagnostic-only evidence. Never enrich the hierarchy, monitor UI, movement history, or staging inputs.
  function pmmCountSpec(){return {key:'pmm-count-evidence-v1',maxBytes:1000000,maxPallets:500,maxContainers:20000,maxEvents:40,maxDetails:50,maxAgeMs:86400000};}
  function pmmCountIdentity(h){return h?.source==='aft'&&h.loadId&&h.shipRef&&h.destinationWarehouse?JSON.stringify([h.source,h.destinationWarehouse,h.loadId,h.shipRef]):'';}
  function pmmCountSummary(entries){const out={cases:0,totes:0,units:0};for(const [kind,,qty] of entries){out[kind==='case'?'cases':'totes']++;out.units+=qty;}return out;}
  function pmmCountDomEvidence(details){
    const parents=new Map(),quantities=new Map();
    for(const d of details||[]){
      const id=idFromDetails(d),type=typeFromDetails(d);if(!id||!['PALLET','CASE','TRANSFER_TOTE'].includes(type))continue;
      const nodes=d.querySelectorAll(':scope > .col-xs-3 > .container-items');
      const qty=nodes.length===1?parseAftQuantity(nodes[0].textContent):null;
      const map=type==='PALLET'?parents:quantities,key=type==='PALLET'?id:(type==='CASE'?'case:':'tote:')+id;
      map.set(key,map.has(key)?null:qty);
    }
    return {parents,quantities};
  }
  function pmmCountCapture(h){
    const key=pmmCountIdentity(h);if(!key)return null;
    const S=pmmCountSpec(),rows=[],owners=new Map(),active=new Set();let count=0;
    for(const [kind,map] of [['case',h.activeByCase],['tote',h.activeByTote]])for(const [id,a] of Object.entries(map||{}))if(a?.stower)active.add(kind+':'+id);
    for(const [id,p] of Object.entries(h.pallets||{})){
      if(!p||p.sap||looseMark(id))continue;
      const entries=[];let quantitiesKnown=true;
      for(const [kind,ids,qty] of [['case',p.cases,h.caseQty],['tote',p.totes,h.toteQty]])for(const cid of new Set(ids||[])){
        if(typeof cid!=='string'||cid.length>160)throw Error('Container identity exceeds count evidence bounds');
        const q=Number(qty?.[cid]),value=Number.isSafeInteger(q)&&q>=0?q:0,k=kind+':'+cid;
        entries.push([kind,cid,value]);owners.set(k,owners.has(k)?null:id);
        if(!h.pmmCountDom||h.pmmCountDom.quantities.get(k)!==value)quantitiesKnown=false;
        if(++count>S.maxContainers)throw Error('Count evidence container limit');
      }
      entries.sort((a,b)=>(a[0]+':'+a[1]).localeCompare(b[0]+':'+b[1]));
      if(typeof id!=='string'||id.length>160||rows.length>=S.maxPallets)throw Error('Count evidence pallet limit');
      const parent=h.pmmCountDom?.parents.get(id),sum=pmmCountSummary(entries);
      rows.push({id,entries,summary:sum,parent:parent===undefined?null:parent,agrees:quantitiesKnown&&parent===sum.units});
    }
    const observed=new Set([...Object.keys(h.caseQty||{}).map(id=>'case:'+id),...Object.keys(h.toteQty||{}).map(id=>'tote:'+id)]);
    return {key,rows,owners,active,observed,at:Number(h.capturedAt)||Date.now()};
  }
  function pmmCountValidState(s,key){
    const S=pmmCountSpec(),text=v=>typeof v==='string'&&v.length>0&&v.length<=160,num=v=>Number.isSafeInteger(v)&&v>=0;
    if(!s||s.v!==1||s.key!==key||!num(s.at)||s.at>Date.now()+60000||Date.now()-s.at>S.maxAgeMs||!Array.isArray(s.rows)||s.rows.length>S.maxPallets||!Array.isArray(s.events)||s.events.length>S.maxEvents)return false;
    const ids=new Set();let n=0;
    for(const r of s.rows){
      if(!r||!text(r.id)||ids.has(r.id)||!Array.isArray(r.baseline)||!num(r.confirmedAt)||!r.confirmed||!['cases','totes','units'].every(k=>num(r.confirmed[k])))return false;ids.add(r.id);
      const containers=new Set();
      for(const e of r.baseline){if(!Array.isArray(e)||e.length!==3||!['case','tote'].includes(e[0])||!text(e[1])||!num(e[2])||containers.has(e[0]+':'+e[1])||++n>S.maxContainers)return false;containers.add(e[0]+':'+e[1]);}
      if(r.pending&&(!num(r.pending.since)||!num(r.pending.refresh)||typeof r.pending.signature!=='string'||r.pending.signature.length>S.maxBytes))return false;
    }
    return true;
  }
  function pmmCountState(key){
    const old=pmmCountState.value;if(old?.key===key)return old;
    const runtime={key,data:{v:1,key,at:0,rows:[],events:[]},error:'',persisted:true,cache:null};
    try{const raw=sessionStorage.getItem(pmmCountSpec().key);if(raw){if(raw.length>pmmCountSpec().maxBytes)throw Error('Saved count evidence exceeds bounds');const data=JSON.parse(raw);if(data?.key===key){if(!pmmCountValidState(data,key))throw Error('Saved count evidence is invalid');runtime.data=data;}}}
    catch(_){runtime.error='Count evidence could not be restored; using this page only.';runtime.persisted=false;}
    pmmCountState.value=runtime;return runtime;
  }
  function pmmCountEvaluate(prior,raw,options={}){
    const S=pmmCountSpec(),accepted=options.accepted===true,now=options.now||Date.now(),refresh=Number(options.refresh)||0;
    if(prior?.key!==raw.key)prior=null;
    const old=new Map((prior?.rows||[]).map(r=>[r.id,r])),current=new Map(raw.rows.map(r=>[r.id,r]));
    const next=[],views=new Map(),events=[];
    for(const id of new Set([...old.keys(),...current.keys()])){
      const previous=old.get(id),live=current.get(id),entries=live?.entries||[],summary=live?.summary||pmmCountSummary([]),signature=JSON.stringify(entries);
      if(!previous){if(live)next.push({id,baseline:entries,confirmed:summary,confirmedAt:now,pending:null});continue;}
      const here=new Map(entries.map(e=>[e[0]+':'+e[1],e])),expected=new Map(previous.baseline.map(e=>[e[0]+':'+e[1],e]));
      const missing=[];let departed=0;
      for(const [k,e] of expected){
        if(here.has(k)){if(here.get(k)[2]<e[2])missing.push({kind:e[0],id:e[1],quantity:e[2]-here.get(k)[2],reason:'quantity-decreased'});else expected.set(k,here.get(k));continue;}
        const owner=raw.owners.get(k);
        if(raw.active.has(k)||owner&&owner!==id){expected.delete(k);departed++;}
        else missing.push({kind:e[0],id:e[1],quantity:e[2],reason:raw.observed.has(k)?'outside-pallet':'missing-row'});
      }
      for(const [k,e] of here)if(!expected.has(k))expected.set(k,e);
      const pending=missing.length>0;
      // A second scan is not a second refresh. A later refresh must repeat the exact
      // smaller contents and independently agree with a unique AFT parent quantity.
      const confirmedSmaller=accepted&&pending&&previous.pending&&live?.agrees===true&&
        previous.pending.signature===signature&&refresh>previous.pending.refresh&&refresh>previous.pending.since;
      const unresolved=pending&&!confirmedSmaller;
      const row={id,baseline:unresolved?[...expected.values()]:entries,confirmed:unresolved?previous.confirmed:summary,
        confirmedAt:unresolved?previous.confirmedAt:now,pending:unresolved?{since:previous.pending?.signature===signature?previous.pending.since:now,refresh:previous.pending?.signature===signature?previous.pending.refresh:refresh,signature}:null};
      const changed=JSON.stringify(summary)!==JSON.stringify(previous.confirmed)||signature!==JSON.stringify(previous.baseline)||!!previous.pending!==unresolved;
      if(!changed)row.confirmedAt=previous.confirmedAt;
      if(accepted&&changed){
        const event={at:now,pallet:id,outcome:unresolved?'awaiting-confirmation':confirmedSmaller?'confirmed-smaller-refresh':previous.pending?'resolved':'count-changed',
          live:summary,lastConfirmed:previous.confirmed,parentUnits:live?.parent??null,refresh,departed,missing:missing.slice(0,S.maxDetails),missingCount:missing.length};
        // Repeated scans of the same unresolved observation do not fill the log.
        if(!previous.pending||previous.pending.signature!==signature||!unresolved||departed)events.push(event);
      }
      if(unresolved)views.set(id,{id,live:summary,lastConfirmed:previous.confirmed,confirmedAt:previous.confirmedAt,since:row.pending.since,
        missing:missing.slice(0,S.maxDetails),missingCount:missing.length,parentUnits:live?.parent??null});
      // Keep empty rows so a later recovery is recognized, bounded by the pallet cap.
      next.push(row);
    }
    if(next.length>S.maxPallets||next.reduce((n,r)=>n+r.baseline.length,0)>S.maxContainers)throw Error('Count evidence retention limit');
    return {data:{v:1,key:raw.key,at:now,rows:next,events:[...(prior?.events||[]),...events].slice(-S.maxEvents)},views};
  }
  function pmmCountAccepted(raw,prev,refresh,reason){
    if(!raw)return;
    try{
      const s=pmmCountState(raw.key);let prior=s.data;
      if(!prior.rows.length&&pmmCountIdentity(prev)===raw.key&&Number(prev.capturedAt)>0&&Date.now()-Number(prev.capturedAt)>=0&&Date.now()-Number(prev.capturedAt)<=Math.min(1800000,typeof refreshDelay==='function'?refreshDelay()*2+30000:630000)){const seed=pmmCountCapture(prev);if(seed)prior=pmmCountEvaluate(null,seed,{accepted:true,now:seed.at}).data;}
      const result=pmmCountEvaluate(prior,raw,{accepted:true,refresh,now:Date.now()});
      result.data.events=result.data.events.map(e=>e.scanReason?e:{...e,scanReason:String(reason||'scan').slice(0,120)});
      const text=JSON.stringify(result.data);if(text.length>pmmCountSpec().maxBytes)throw Error('Count evidence byte limit');
      s.data=result.data;s.cache=null;
      try{sessionStorage.setItem(pmmCountSpec().key,text);s.persisted=true;s.error='';}catch(_){s.persisted=false;s.error='Count evidence is memory-only; it may not survive reload.';}
    }catch(_){const s=pmmCountState.value;if(s){s.error='Count evidence update unavailable; raw tracking is unchanged.';s.cache=null;}}
  }
  function pmmCountViews(h){
    const key=pmmCountIdentity(h);if(!key)return new Map();
    const s=pmmCountState(key);if(s.cache?.h===h&&s.cache.data===s.data)return s.cache.views;
    try{const raw=pmmCountCapture(h),views=pmmCountEvaluate(s.data,raw).views;s.cache={h,data:s.data,views};return views;}
    catch(_){s.error='Count diagnostic evidence unavailable; tracking is unchanged.';return new Map();}
  }
  function pmmCountView(h,id){return pmmCountViews(h).get(id)||null;}
  function pmmCountDiagnostic(h){
    if(!pmmCountIdentity(h))return {enabled:false,reason:'AFT-only count confirmation'};
    const s=pmmCountState(pmmCountIdentity(h)),views=pmmCountViews(h);
    return {enabled:true,storage:s.persisted?'session':'memory',error:s.error||null,pending:[...views.values()],events:s.data.events,limits:pmmCountSpec()};
  }
  // PMM-CHUNK-END count-confirmation

  // Read-only pallet tools. "Non-moving" means no observed outbound movement for this load,
  // not "no NEW badge" or "idle for N minutes". Search, session reset and filters do not narrow a copy.
  function pmmPalletContentsLabel(p){
    const parts=[],cases=p?.cases?.length||0,totes=p?.totes?.length||0;
    if(cases)parts.push(cases+' '+(cases===1?'case':'cases'));
    if(totes)parts.push(totes+' '+(totes===1?'tote':'totes'));
    const units=Number(p?.totalUnits)||0;parts.push(units+' '+(units===1?'unit':'units'));
    return parts.join(' · ');
  }
  function pmmNonMovingPalletRows(h,res,organized,stageCues){
    const moved=new Set();
    for(const r of res||[]){
      if(r&&['case','tote','sap'].includes(r.kind)&&r.oldPallet&&
        (r.stower||r.pallet&&r.pallet!==r.oldPallet&&!looseMark(r.pallet)))moved.add(r.oldPallet);
    }
    const rows=[];
    for(const [id,p] of Object.entries(h?.pallets||{})){
      if(!p||p.sap||looseMark(id))continue;
      const cases=[...new Set(p.cases||[])],totes=[...new Set(p.totes||[])];
      if(!cases.length&&!totes.length||moved.has(id)||stageCues?.quiet(id))continue;
      if(cases.some(c=>h.activeByCase?.[c])||totes.some(t=>h.activeByTote?.[t]))continue;
      const saved=organized?.pallets?.[id];
      const savedMove=['cases','totes'].some(k=>Object.values(saved?.[k]||{}).some(e=>e&&
        (Number(e.detectedAt)>0||e.movementTime)&&(e.stower||e.destinationPallet&&e.destinationPallet!==id&&!looseMark(e.destinationPallet))));
      if(savedMove)continue;
      const duplicate=pmmPalletDuplicate(h,id);
      rows.push({pallet:id,cases:cases.length,totes:totes.length,units:Number(p.totalUnits)||0,duplicate:duplicate?duplicate.label+' (ws-rcv-preditor)':''});
    }
    return rows.sort((a,b)=>a.pallet.localeCompare(b.pallet));
  }
  function pmmNonMovingPalletText(rows){
    // TSV pastes into spreadsheets. Omit all-zero count columns; blank zero cells in mixed lists.
    // Keep unit totals and spreadsheet-formula neutralization; duplicate warnings stay in the monitor.
    const cell=v=>{const t=String(v??'').replace(/[\t\r\n]+/g,' ');return /^[=+@-]/.test(t.trimStart())?"'"+t:t;};
    const showCases=rows.some(r=>Number(r.cases)>0),showTotes=rows.some(r=>Number(r.totes)>0);
    const header=['Pallet',...(showCases?['Cases']:[]),...(showTotes?['Totes']:[]),'Units'];
    const values=rows.map(r=>[r.pallet,...(showCases?[Number(r.cases)>0?r.cases:'']:[]),...(showTotes?[Number(r.totes)>0?r.totes:'']:[]),r.units]);
    return [header,...values].map(r=>r.map(cell).join('\t')).join('\n');
  }
  function pmmPalletCopyState(h){
    const scope=h?loadScopeKey(h):null,prior=pmmPalletCopyState.value;
    if(!prior||scope!==null&&prior.scope!==scope)pmmPalletCopyState.value={scope,busy:false,message:'',attempt:0};
    return pmmPalletCopyState.value;
  }
  function pmmPalletToolsHtml(h){
    const s=pmmPalletCopyState(h);
    return '<div class="pmm-pallet-tools"><button id="pmm-copy-nonmoving" type="button" '+(s.busy?'disabled ':'')+'aria-describedby="pmm-copy-nonmoving-status" title="Copy all non-SAP pallets with contents, no observed outbound movement, no active stower contents, and no confirmed staging result for this load. Includes hidden/filtered pallets. Counts are from the displayed snapshot; no refresh is triggered.">Copy non-moving pallets</button><span id="pmm-copy-nonmoving-status" role="status" aria-live="polite">'+esc(s.message)+'</span></div>';
  }
  function pmmPalletCopyPaint(){
    const box=document.getElementById('pax-monitor-v311'),s=pmmPalletCopyState();
    const button=box?.querySelector('#pmm-copy-nonmoving'),status=box?.querySelector('#pmm-copy-nonmoving-status');
    if(button)button.disabled=s.busy;
    if(status)status.textContent=s.message;
  }
  function pmmPalletToolsBind(box,h,res,stageCues){
    const button=box.querySelector('#pmm-copy-nonmoving');if(!button)return;
    button.onclick=e=>{
      e.preventDefault();e.stopPropagation();const s=pmmPalletCopyState(h);if(s.busy)return;const attempt=++s.attempt;
      try{
        const rows=pmmNonMovingPalletRows(h,res,organizedState(h),stageCues);
        if(!rows.length){s.message='No non-moving pallets with contents in this load.';pmmPalletCopyPaint();return;}
        const text=pmmNonMovingPalletText(rows);s.busy=true;s.message='Copying…';pmmPalletCopyPaint();
        pmmRodeoClipboardWrite(text,phase=>{
          // A late callback cannot overwrite feedback for a newer copy or another load.
          if(pmmPalletCopyState()!==s||s.attempt!==attempt)return;
          s.busy=false;
          s.message=phase==='copied'?'Copied '+rows.length+' pallet'+(rows.length===1?'':'s')+'.':phase==='unconfirmed'?'Copy not confirmed. Check clipboard before retrying.':'Copy failed. Check clipboard permission and try again.';
          pmmPalletCopyPaint();
        });
      }catch(_){s.busy=false;s.message='Could not prepare the pallet list. Try again after the next scan.';pmmPalletCopyPaint();}
    };
  }

  function palletHistory(h,res,sapOnly=false,query='',sessionStart=0,stageCues=pmmStageCueContext(h)){
    const pallets=h?.pallets||{};
    const grouped=new Map();
    for(const r of res){
      const p=r.oldPallet||r.pallet;
      if(!p)continue;
      if(!grouped.has(p))grouped.set(p,[]);
      grouped.get(p).push(r);
    }
    const q=clean(query).toLowerCase();
    // A SAP pallet stays under the SAP tab for its whole in-progress life - dropzone,
    // decanted into a tote, whatever - since the AFT DOM never reliably confirms a real
    // stow for these. It only graduates out (logged in Movement History instead) once
    // the DOM shows a real bin.
    const candidateIds=new Set(Object.keys(pallets));
    if(!sapOnly)for(const r of res)if(palletLike(r?.oldPallet))candidateIds.add(r.oldPallet);
    const ids=[...candidateIds].filter(id=>{
      const p=pallets[id]||{id,cases:[],totes:[],sap:false,unlabelledUnits:0,totalUnits:0};
      const sapKind=p.sap?sapStagingKind(p.staging):null;
      const stillSap=!!p.sap&&sapKind!=='stowed';
      const typeOk=sapOnly?stillSap:!p.sap&&((p.cases||[]).length>0||(p.totes||[]).length>0||grouped.has(id));
      if(!typeOk)return false;
      if(!q)return true;
      const itemSkus=[...(p.cases||[]).flatMap(x=>(h?.caseItems?.[x]||[]).map(i=>i.fcSku)),...(p.totes||[]).flatMap(x=>(h?.toteItems?.[x]||[]).map(i=>i.fcSku))];
      const hay=[id,...(p.cases||[]),...(p.totes||[]),...itemSkus,p.staging?.container,p.staging?.type].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
    if(!ids.length)return sapOnly?'<div class="muted">No SAP pallets mapped yet.</div>':'<div class="muted">No pallets mapped yet.</div>';
    const orgState=organizedState(h);
    return ids.map(id=>{
      const p=pallets[id]||{id,cases:[],totes:[],sap:false,unlabelledUnits:0,totalUnits:0}, cases=p?.cases||[], totes=p?.totes||[], moves=grouped.get(id)||[];
      const entries=new Map();
      for(const c of cases)entries.set(c,{kind:'CASE',id:c});
      for(const t of totes)entries.set(t,{kind:'TRANSFER_TOTE',id:t});
      for(const r of moves)if(!entries.has(r.caseId))entries.set(r.caseId,{kind:r.kind==='tote'?'TRANSFER_TOTE':'CASE',id:r.caseId});
      const latestById=new Map();for(const m of moves)if(!latestById.has(m.caseId))latestById.set(m.caseId,m);
      const ordered=[...entries.values()].map((e,index)=>{const latest=latestById.get(e.id);const sessionHit=!!latest&&Number(latest.detectedAt||0)>=sessionStart;const ackKey=movementAckKey(latest);const movementHit=sessionHit&&!stageCues.quiet(id)&&!acknowledgedMovements.has(ackKey);return {e,index,latest,sessionHit,movementHit,ackKey}}).sort((a,b)=>Number(b.sessionHit)-Number(a.sessionHit)||(b.sessionHit?(Number(b.latest?.detectedAt||0)-Number(a.latest?.detectedAt||0)):a.index-b.index));
      const newCount=ordered.filter(x=>x.movementHit).length;
      const body=ordered.map(({e,latest,movementHit,ackKey})=>{
        const active=(e.kind==='TRANSFER_TOTE'?h?.activeByTote:h?.activeByCase)?.[e.id];
        const liveQty=Number((e.kind==='TRANSFER_TOTE'?h?.toteQty:h?.caseQty)?.[e.id])||0;
        const savedQty=Number(orgState?.pallets?.[id]?.[e.kind==='TRANSFER_TOTE'?'totes':'cases']?.[e.id]?.quantity)||0;
        const qty=liveQty>0?liveQty:(Number(latest?.quantity)>0?Number(latest.quantity):savedQty);
        const items=latest?[]:(e.kind==='TRANSFER_TOTE'?(h?.toteItems?.[e.id]||[]):(h?.caseItems?.[e.id]||[]));
        const extra=`${latest?`<div>Moved: ${esc(looseLabel(latest.oldPallet)||'—')} → ${esc(looseLabel(latest.pallet)||'Active stower')}<br>Detected: ${esc(latest.movementTime||'—')}</div>`:''}${latest||active?(()=>{const station=latest?.station||active?.station;return `<div>Stower: ${esc(latest?.stower||active?.stower||'—')}${station?` · Station: ${esc(station)}`:''}</div>`})():''}`;return containerEntry(h,e.id,qty,items,extra,movementHit,ackKey);
      }).join('');
      const decanted=!!p?.sap&&sapStagingKind(p?.staging)==='tote';
      const label=`${pmmPalletContentsLabel(p)}${p?.sap?' · SAP':''}${decanted?' · Decanted into tote, awaiting stower':''}${moves.length?' · '+moves.length+' movements':''}`;
      const duplicate=pmmPalletDuplicate(h,id);
      const liveCopyIds=[...cases,...totes].filter(x=>/^(?:csX|tsX)/i.test(clean(x)));
      const copyButton=liveCopyIds.length?`<button class="copy-pallet-ids" type="button" data-copy-pallet="${esc(id)}" title="Copy ${liveCopyIds.length} current csX/tsX IDs">Copy IDs</button>`:'';
      return `<details class="pallet-group${duplicate?' pmm-pallet-duplicated':''}" data-pallet="${esc(id)}" ${openPallets.has(id)?'open':''}><summary>${containerHtml(h,id)} <span class="muted">(${esc(label)})</span>${copyButton}${newCount?`<span class="new-badge">${newCount} NEW</span>`:''}${duplicate?`<span class="pmm-pallet-duplicate" role="img" tabindex="0" title="${esc(duplicate.note)}" aria-label="${esc(duplicate.note)}">${duplicate.label}</span>`:''}</summary><div class="pallet-children">${duplicate?`<div class="pmm-pallet-duplicate-note">${esc(duplicate.note)}</div>`:''}${typeof pmmStageControls==='function'?pmmStageControls(h,res,id):''}${body||'<span class="muted">No identified cases or totes.</span>'}${p?.staging?`<div class="container-entry"><b>Staging:</b> ${containerHtml(h,p.staging.container)} <span class="muted">${esc(p.staging.type||'')}</span></div>`:''}${p?.unlabelledCases?`<div class="container-entry muted">${p.unlabelledCases} unlabelled case rows · ${p.unlabelledUnits||0} units (SAP; no unique case IDs)</div>`:''}</div></details>`;
    }).join('');
  }

  function downloadFile(name,content,mime){
    const url=URL.createObjectURL(new Blob([content],{type:mime}));
    const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function currentHistory(all,h){
    const scope=loadScopeKey(h),loadId=clean(h?.loadId),ship=h?.shipRef||location.pathname;
    return (Array.isArray(all)?all:[]).filter(r=>(r?.scopeId&&r.scopeId===scope)||(loadId&&r?.loadId===loadId)||(!r?.scopeId&&!loadId&&r?.shipRef===ship));
  }
  // PMM-CHUNK-BEGIN site-1dc
  // 3.9.9: automatic 1DC evidence by exact destination site + VRID, from the same FMC
  // execution search the LGA9 KIPS script uses (TransfersOneDC, lane ->SITE, -7/+7 days).
  // Positive-only: a VRID absent from a full, partial or failed list is never non-1DC.
  // Lazy state/hoisted functions: no top-level bindings and no timers. The only listener
  // is one GM value-change listener per site, registered by the first refresh for it.
  // Same-origin tabs coalesce through a Web Lock; origins share a GM claim cooldown that
  // is NOT atomic, so two origins racing the same window may each fetch once.
  function pmmOneDcSpec(){
    return {
      url:'https://trans-logistics.amazon.com/fmc/search/execution/by-criteria',
      host:'trans-logistics.amazon.com',
      path:'/fmc/search/execution/by-criteria',
      cachePrefix:'pmm-v399-1dc-cache:',
      claimPrefix:'pmm-v399-1dc-claim:',
      lockPrefix:'pmm-v399-1dc-fetch:',
      cacheVersion:1,
      sitePattern:/^[A-Z][A-Z0-9]{2,5}$/,
      vridPattern:/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/,
      ttlMs:5*60e3,
      clockSkewMs:60e3,
      refreshAfterMs:4*60e3,
      claimCooldownMs:2*60e3,
      pageSize:50,
      maxPages:20,
      budgetMs:30e3,
      pageTimeoutMs:15e3,
      maxBodyChars:2*1024*1024,
      maxEntries:2000
    };
  }
  // mem holds this tab's copy of a site's cache only while that site's listener is live,
  // so evidence lookups need no storage read per render.
  function pmmOneDcState(){
    if(!pmmOneDcState.s)pmmOneDcState.s={inflight:new Map(),status:new Map(),mem:new Map(),listeners:new Map(),notifying:false};
    return pmmOneDcState.s;
  }
  function pmmOneDcSite(identity){const s=clean(identity?.destinationWarehouse);return pmmOneDcSpec().sitePattern.test(s)?s:''}
  function pmmOneDcVrid(identity){const v=clean(identity?.loadId);return pmmOneDcSpec().vridPattern.test(v)?v:''}
  function pmmOneDcCacheKey(identity){const site=pmmOneDcSite(identity);return site?pmmOneDcSpec().cachePrefix+site:''}
  function pmmOneDcValid(cache,site){
    const spec=pmmOneDcSpec(),vrids=cache?.vrids;
    if(!cache||typeof cache!=='object'||cache.v!==spec.cacheVersion||cache.site!==site)return null;
    if(!vrids||typeof vrids!=='object'||Array.isArray(vrids)||Object.keys(vrids).length>spec.maxEntries)return null;
    return cache;
  }
  function pmmOneDcRead(site){
    const st=pmmOneDcState();
    if(st.listeners.has(site))return st.mem.get(site)||null;
    let v=null;try{v=GM_getValue(pmmOneDcSpec().cachePrefix+site,null)}catch{}
    return pmmOneDcValid(v,site);
  }
  function pmmOneDcSeenFresh(at,now){const spec=pmmOneDcSpec(),t=Number(at);return t>0&&t<=now+spec.clockSkewMs&&now-t<spec.ttlMs}
  function pmmOneDcFresh(cache,site,now=Date.now()){
    const out=new Map(),valid=pmmOneDcValid(cache,site);
    if(!valid)return out;
    for(const [v,at] of Object.entries(valid.vrids))if(pmmOneDcSpec().vridPattern.test(v)&&pmmOneDcSeenFresh(at,now))out.set(v,Number(at));
    return out;
  }
  function pmmOneDcEvidence(identity){
    const site=pmmOneDcSite(identity),vrid=pmmOneDcVrid(identity);
    if(!site||!vrid)return false;
    const vrids=pmmOneDcRead(site)?.vrids;
    return !!vrids&&Object.prototype.hasOwnProperty.call(vrids,vrid)&&pmmOneDcSeenFresh(vrids[vrid],Date.now());
  }
  function pmmOneDcDiagnostic(identity){
    const spec=pmmOneDcSpec(),site=pmmOneDcSite(identity),vrid=pmmOneDcVrid(identity),now=Date.now();
    if(!site||!vrid)return {site:site||null,vrid:vrid||null,evidence:false,eligible:false,reason:!site?'missing-or-invalid-site':'missing-or-invalid-vrid'};
    const cache=pmmOneDcRead(site),fresh=pmmOneDcFresh(cache,site,now);
    let claim=null;try{claim=GM_getValue(spec.claimPrefix+site,null)}catch{}
    const st=pmmOneDcState(),claimAt=Number(claim?.at)||0;
    return {
      site,vrid,eligible:true,evidence:pmmOneDcEvidence(identity),seenAt:fresh.get(vrid)||null,
      freshPositives:fresh.size,cacheUpdatedAt:Number(cache?.updatedAt)||null,lastCompleteAt:Number(cache?.lastCompleteAt)||null,
      inFlight:st.inflight.has(site),listening:st.listeners.has(site),locksSupported:!!navigator.locks?.request,
      claim:claimAt?{at:claimAt,origin:clean(claim?.origin)||null,sameTab:claim?.tab===TAB_ID}:null,
      nextEligibleAt:Math.max(claimAt+spec.claimCooldownMs,(Number(cache?.updatedAt)||0)+spec.refreshAfterMs)||null,
      last:st.status.get(site)||null,ttlMs:spec.ttlMs,
      note:'Positive-only evidence; absence is not proof of non-1DC. Cross-origin claim is non-atomic.'
    };
  }
  function pmmOneDcSameSet(a,b){if(a.size!==b.size)return false;for(const v of a.keys())if(!b.has(v))return false;return true}
  // Remote writes (other tabs/origins) notify only when the fresh positive set changes;
  // this tab's own writes notify from the refresh that made them.
  function pmmOneDcListen(site){
    const spec=pmmOneDcSpec(),st=pmmOneDcState();
    if(!site||st.listeners.has(site)||typeof GM_addValueChangeListener!=='function')return;
    let current=null;try{current=pmmOneDcValid(GM_getValue(spec.cachePrefix+site,null),site)}catch{}
    let id;
    try{
      id=GM_addValueChangeListener(spec.cachePrefix+site,(name,oldValue,newValue,remote)=>{
        const prev=st.mem.get(site)||null,next=pmmOneDcValid(newValue,site);
        st.mem.set(site,next);
        if(!remote)return;
        const now=Date.now();
        if(!pmmOneDcSameSet(pmmOneDcFresh(prev,site,now),pmmOneDcFresh(next,site,now)))pmmOneDcNotify();
      });
    }catch{return}
    st.mem.set(site,current);
    st.listeners.set(site,id);
  }
  function pmmOneDcRefresh(identity){
    const site=pmmOneDcSite(identity),st=pmmOneDcState();
    if(!site||!pmmOneDcVrid(identity))return Promise.resolve({ran:false,reason:!site?'missing-or-invalid-site':'missing-or-invalid-vrid'});
    pmmOneDcListen(site);
    if(st.inflight.has(site))return st.inflight.get(site);
    const p=pmmOneDcRefreshSite(site).catch(err=>{
      const r={ran:false,reason:'error',error:clean(err?.message||err).slice(0,160),at:Date.now()};
      st.status.set(site,r);return r;
    }).finally(()=>st.inflight.delete(site));
    st.inflight.set(site,p);
    return p;
  }
  function pmmOneDcThrottled(site,now){
    const spec=pmmOneDcSpec(),cache=pmmOneDcRead(site);
    let claim=null;try{claim=GM_getValue(spec.claimPrefix+site,null)}catch{}
    if(now-(Number(claim?.at)||0)<spec.claimCooldownMs)return 'claim-cooldown';
    if(now-(Number(cache?.updatedAt)||0)<spec.refreshAfterMs)return 'cache-fresh';
    return '';
  }
  async function pmmOneDcRefreshSite(site){
    const spec=pmmOneDcSpec(),st=pmmOneDcState();
    const skip=reason=>({ran:false,reason,at:Date.now()});
    const early=pmmOneDcThrottled(site,Date.now());
    if(early)return skip(early);
    if(!navigator.locks?.request){const r=skip('locks-unavailable');st.status.set(site,r);return r}
    if(typeof GM_xmlhttpRequest!=='function'){const r=skip('gm-request-unavailable');st.status.set(site,r);return r}
    return navigator.locks.request(spec.lockPrefix+site,{mode:'exclusive',ifAvailable:true},async lock=>{
      if(!lock)return skip('busy-same-origin');
      const startedAt=Date.now(),again=pmmOneDcThrottled(site,startedAt);
      if(again)return skip(again);
      try{GM_setValue(spec.claimPrefix+site,{at:startedAt,origin:location.origin,tab:TAB_ID})}catch{return skip('claim-write-failed')}
      const before=pmmOneDcFresh(pmmOneDcRead(site),site,startedAt);
      const found=new Map();
      let pages=0,complete=false,error='',prevKey='';
      for(let page=0;page<spec.maxPages;page++){
        const remaining=spec.budgetMs-(Date.now()-startedAt);
        if(remaining<1000){error='budget-exhausted';break}
        let vrids,rows;
        try{({vrids,rows}=await pmmOneDcPage(site,page,Math.min(spec.pageTimeoutMs,remaining)))}catch(err){error=clean(err?.message||err).slice(0,160);break}
        pages++;
        const at=Date.now();
        for(const v of vrids)found.set(v,at);
        if(rows<spec.pageSize){complete=true;break}
        const key=vrids.join('|');
        if(key===prevKey){error='pagination-repeat';break}
        prevKey=key;
      }
      if(!complete&&!error)error='page-limit';
      const after=pmmOneDcMerge(site,found,complete?Date.now():0);
      const changed=!pmmOneDcSameSet(before,after);
      const result={ran:true,at:startedAt,ms:Date.now()-startedAt,pages,positives:found.size,complete,error:error||null,changed};
      st.status.set(site,result);
      if(changed)pmmOneDcNotify();
      return result;
    });
  }
  // Read-merge-write of shared GM storage; not atomic across origins. Only positives are
  // added, and existing ones keep their original seen time (errors never extend them).
  function pmmOneDcMerge(site,found,completeAt){
    const spec=pmmOneDcSpec(),st=pmmOneDcState(),key=spec.cachePrefix+site,now=Date.now();
    let raw=null;try{raw=GM_getValue(key,null)}catch{}
    const cur=pmmOneDcValid(raw,site),fresh=pmmOneDcFresh(cur,site,now);
    for(const [v,at] of found)fresh.set(v,Math.max(at,fresh.get(v)||0));
    const entries=[...fresh.entries()].sort((a,b)=>b[1]-a[1]).slice(0,spec.maxEntries);
    const next={v:spec.cacheVersion,site,updatedAt:found.size||completeAt?now:(Number(cur?.updatedAt)||0),lastCompleteAt:completeAt||Number(cur?.lastCompleteAt)||0,vrids:Object.fromEntries(entries)};
    try{GM_setValue(key,next)}catch{return pmmOneDcFresh(cur,site,now)}
    if(st.listeners.has(site))st.mem.set(site,next);
    return new Map(entries);
  }
  function pmmOneDcNotify(){
    const st=pmmOneDcState();
    if(st.notifying||typeof pmmSiteChanged!=='function')return;
    st.notifying=true;
    try{pmmSiteChanged()}catch(err){console.warn('[Pallet Movement Monitor] 1DC change callback failed',clean(err?.message||err))}
    finally{st.notifying=false}
  }
  // Request body mirrors LGA9 KIPS fetch1DCTrailers exactly, except the page index.
  function pmmOneDcBody(site,page){
    return {
      "stopLocationType":"facility","dateRangeType":"PLANNED_DOCK_END","stopStatuses":null,"onlyDelayed":false,
      "delayTypes":"LATE_ARRIVAL_OR_DEPARTURE","delayReason":"ALL","disruptionTypes":[],
      "executionStatuses":["PLANNED","EXECUTION_STARTED","IN_TRANSIT","ARRIVED_AT_FINAL_DESTINATION","COMPLETED","CANCELLED"],
      "planStatuses":[],"shipperAccounts":["TransfersOneDC"],"stopActionType":"DROPOFF","carriers":null,"searchByIds":false,
      "assetOwner":"","stopFacilities":[],"stopFacilityCodes":null,"facilityLanes":[`->${site}`],"contractIds":[],
      "caseStatuses":[],"onlyWithCases":false,"poContractTypes":[],"trContainerIds":[],
      "useRelativeTime":true,"relativeFrom":"7","relativeTo":"7","relativeFromUnit":"DAYS","relativeToUnit":"DAYS",
      "relativeFromType":"AGO","relativeToType":"FROM_NOW","relativeFromTime":"00:00","relativeToTime":"00:00",
      "driverState":"ANY","driverIds":[],"tenderStatuses":["PLANNED","APPROVED","REJECTED"],"subcarrier":"",
      "assetStatus":"ANY","assetId":"","searchTimeZone":"US/Eastern","page":page,"pageSize":pmmOneDcSpec().pageSize,
      "sortOrder":[{"field":"final_dock_arrival_time","dir":"asc"}]
    };
  }
  // A manager that omits finalUrl is checked against the requested URL; redirect:'error'
  // (Tampermonkey 5+) is what prevents an unseen hop in that case.
  function pmmOneDcFinalUrlOk(finalUrl){
    const spec=pmmOneDcSpec();
    let u;try{u=new URL(String(finalUrl||spec.url))}catch{return false}
    return u.protocol==='https:'&&u.hostname===spec.host&&u.port===''&&u.pathname===spec.path&&!u.username&&!u.password;
  }
  // Records without a vehicleRunId are skipped as in KIPS; any other malformed record
  // rejects the page. Errors carry only short codes; bodies are never logged or stored.
  function pmmOneDcRows(records){
    const spec=pmmOneDcSpec(),vrids=[];
    if(records.length>spec.pageSize)throw Error('too-many-rows');
    for(const rec of records){
      if(!rec||typeof rec!=='object'||Array.isArray(rec))throw Error('malformed-record');
      const raw=rec.vehicleRunId;
      if(raw===undefined||raw===null||raw==='')continue;
      if(typeof raw!=='string'||!spec.vridPattern.test(raw))throw Error('malformed-vrid');
      vrids.push(raw);
    }
    if(records.length&&!vrids.length)throw Error('no-valid-records');
    return {vrids,rows:records.length};
  }
  function pmmOneDcPage(site,page,timeout){
    const spec=pmmOneDcSpec();
    return new Promise((resolve,reject)=>{
      try{
        GM_xmlhttpRequest({method:'POST',url:spec.url,timeout,anonymous:false,redirect:'error',
          headers:{'Accept':'application/json','Content-Type':'application/json'},
          data:JSON.stringify(pmmOneDcBody(site,page)),
          onload:r=>{
            try{
              const status=Number(r.status)||0;
              if(!pmmOneDcFinalUrlOk(r.finalUrl))return reject(Error('final-url-rejected'));
              if(status<200||status>=300)return reject(Error('http-'+(status||0)));
              const contentType=((String(r.responseHeaders||'').match(/^content-type:\s*([^\r\n;]+)/im)||[])[1]||'').trim();
              if(contentType&&!/json/i.test(contentType))return reject(Error('non-json-content-type'));
              const text=typeof r.responseText==='string'?r.responseText:'';
              if(!text)return reject(Error('empty-body'));
              if(text.length>spec.maxBodyChars)return reject(Error('body-too-large'));
              let data;try{data=JSON.parse(text)}catch{return reject(Error('invalid-json'))}
              if(!data||typeof data!=='object'||Array.isArray(data)||data.success===false)return reject(Error('unsuccessful-response'));
              const ro=data.returnedObject;
              if(!ro||typeof ro!=='object'||!Array.isArray(ro.records))return reject(Error('unexpected-shape'));
              resolve(pmmOneDcRows(ro.records));
            }catch(err){reject(Error(clean(err?.message||'parse-failed').slice(0,40)))}
          },
          onerror:()=>reject(Error('request-failed')),
          ontimeout:()=>reject(Error('timeout')),
          onabort:()=>reject(Error('aborted'))});
      }catch{reject(Error('request-threw'))}
    });
  }
  // PMM-CHUNK-END site-1dc

  // 3.9.9: Site is shared; all other preference scopes remain unchanged.
  function pmmSiteKey(key){return 'pmm-v399-site:'+key}
  function pmmSiteRead(key,fallback){
    const box=GM_getValue(pmmSiteKey(key),null);
    if(box&&box.v===1){
      if(key===K.oneDcTrailers&&Array.isArray(box.value))return parseCodeList(box.value.join(','));
      if(key===K.originBuilding&&typeof box.value==='string')return box.value;
    }
    // Never silently pick a winning tab or union conflicting old lists. Until an
    // explicit Save, retain this tab's old value. Save once to publish it to all tabs.
    return tabPrefRead(key,fallback);
  }
  function pmmSiteWrite(key,value){
    GM_setValue(pmmSiteKey(key),{v:1,value});
    pmmSiteChanged();
  }
  function pmmLoadIsOneDc(identity,codes=oneDcList()){
    if(!identity)return false;
    const declared=clean(identity.classification??identity.slaClassification).toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(['ONEDC','1DC'].includes(declared))return true;
    if(['REACTIVE','NONREACTIVE','NR','NOTREACTIVE'].includes(declared))return false;
    if(pmmOneDcEvidence(identity))return true;
    // Preserve the existing Hunter link rule: either trailer name or shipment can
    // match the manually configured prefix. SLA and Hunter now share this rule.
    return [identity.trailerName,identity.shipmentId].some(name=>{
      const n=clean(name).toUpperCase();return !!n&&codes.some(code=>n.startsWith(clean(code).toUpperCase()));
    });
  }
  function pmmSiteChanged(){
    _hunterClassByShipment.clear();
    // Keep already loaded tracking data. No snapshot changes, immediate Hunter
    // reload, AFT refresh or queue action is authorized by a settings notification.
    if(!monitorStarted)return;
    _pendingVisibleRender=true;
    if(!_scanRunning)renderMaybe(getHierarchy());
  }
  function pmmSiteListen(){
    if(pmmSiteListen.ready||typeof GM_addValueChangeListener!=='function')return;
    for(const key of [K.originBuilding,K.oneDcTrailers]){
      if(pmmSiteListen[key])continue;
      GM_addValueChangeListener(pmmSiteKey(key),(_key,_old,_new,remote)=>{
        if(remote)queueMicrotask(()=>{try{pmmSiteChanged()}catch(err){console.warn('[Pallet Movement Monitor] Site update failed',err)}});
      });
      pmmSiteListen[key]=true;
    }
    pmmSiteListen.ready=true;
  }
  // PMM-CHUNK-BEGIN staging
  // 3.9.3: trusted Stage click authorizes one move. No separate Arm step.
  // Facility is operator-verified and saved per tab across reloads. Internal
  // armed/armedAt fields retain compatibility and reject pre-setup requests.
  // Lazy state/hoisted functions: core calls this before V/K initialize.
  // One helper lock, durable journal/guards, no replay or automatic retry.
  // Only clean source workflow and positively readable readiness permit scans.
  // Success requires a correlated successful response and positive moved count.
  // Fresh changed DOM results may supplement a successful correlated response.
  // Zero is nothing-moved; stale, identical or ambiguous results stay unknown.
  // Monitor refresh ownership, pacing and history are not changed here.
  function stageSpec(){
    return {
      moveAppHost:'aft-moveapp-iad-iad.iad.proxy.amazon.com',
      jobPath:'/move-container',
      jobId:'300',
      lockName:'pmm-stage-helper-v390',
      requestKey:'pax-monitor-v390-stage-request',
      journalKey:'pax-monitor-v390-stage-journal',
      helperKey:'pax-monitor-v390-stage-helper',
      progressKey:'pax-monitor-v390-stage-progress',
      sourceStep:'ScanSourceContainerStep',
      destinationStep:'ScanDestinationContainerStep',
      getContainerPath:'/api/get-container',
      moveAllPath:'/api/move-container-all',
      facilityKey:'pmm-stage-facility-v393',
      confirmSimple:'Confirm move all containers',
      confirmStatus:'workflow-deviation',
      confirmDetailed:/^\d{1,6} containers? will be moved\. scan the destination container again to confirm the move, or go back to cancel\.?$/,
      diversionSelectors:['[class*="diversion"]','[data-testid*="diversion"]','[role="alertdialog"]','[role="dialog"]','.instruction-container','.presenter-container'],
      idPattern:/^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$/,
      warehousePattern:/^[A-Z]{3}[0-9]$/,
      requestIdPattern:/^st-\d{13}-[0-9a-f]{12}$/,
      pending:['queued','claimed','scanning-source','scanning-destination','confirming'],
      terminal:['nothing-moved','success','source-failed','destination-failed','stopped','unknown','not-ready','rejected','duplicate','busy','no-helper','not-armed','warehouse-mismatch','expired','helper-unavailable'],
      pollMs:250,
      heartbeatMs:1000,
      helperFreshMs:5000,
      ownershipRetryMs:5000,
      requestTtlMs:120000,
      readyWaitMs:15000,
      responseTimeoutMs:20000,
      stepSettleMs:10000,
      submitWaitMs:90000,
      journalTtlMs:86400000,
      journalMax:200,
      holdsKey:'pax-monitor-v390-stage-holds',
      holdsMax:500,
      holdsTotalMax:1000,
      holdArchiveKey:'pax-monitor-v400-stage-hold-archive',
      holdArchiveMax:1000,
      holdArchiveBatch:250,
      holdCompactAt:300,
      holdArchiveMinAgeMs:600000,
      holdMaintainMs:60000,
      guardWindowMs:86400000,
      admitLockName:'pmm-stage-admit-v390',
      claimSettleMs:600,
      admitSettleMs:400,
      maxCalls:60
    };
  }
  // All mutable helper state lives here, created on first use: no top-level bindings.
  function stageState(){
    if(!stageState.s)stageState.s={
      helperId:'',started:false,ownership:'idle',release:null,loop:0,
      armed:false,warehouse:'',armedAt:0,armError:'',
      active:false,activePromise:null,phase:'',currentId:'',runStartedAt:0,
      calls:[],callSeq:0,relevantSeq:0,resultWatch:null,ajaxWrapped:false,ajaxWrapper:null,ajaxOriginal:null,
      sessionRef:null,sessionId:'',recovered:false,panel:null,lastPanel:'',lastResult:null,note:'',
      autoOwner:null,autoNote:'',autoAck:null,autoSeenId:'',autoFault:'',autoCleanAt:0,autoFloor:0,autoMonoNext:NaN,
      holdNote:'',holdMaint:null,holdMaintAt:0,holdMaintFault:''
    };
    return stageState.s;
  }
  function stageNow(){return Date.now()}
  function stageLog(what,err){try{console.warn('[Pallet Movement Monitor] staging: '+what,err===undefined?'':err)}catch{}}
  function stageErrText(err){try{return String((err&&(err.message||err.name))||err||'error').slice(0,160)}catch{return 'error'}}
  function stageClean(v){return String(v===undefined||v===null?'':v).trim()}
  function stageText(v,max){return stageClean(v).replace(/\s+/g,' ').slice(0,max||256)}
  function stageNorm(v){return stageText(v,512).toLowerCase()}
  function stageEsc(v){return stageClean(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function stageIsTerminal(status){return stageSpec().terminal.indexOf(stageClean(status))>=0}
  function stageIsPending(status){return stageSpec().pending.indexOf(stageClean(status))>=0}
  function stageValidId(v){const s=stageClean(v);return s&&s===String(v)&&stageSpec().idPattern.test(s)?s:''}
  function stageValidWarehouse(v){const s=stageClean(v).toUpperCase();return stageSpec().warehousePattern.test(s)?s:''}
  function stageRandomHex(n){
    let out='';
    try{
      const c=typeof crypto!=='undefined'&&crypto&&typeof crypto.getRandomValues==='function'?crypto:null;
      if(c){const buf=new Uint8Array(Math.ceil(n/2));c.getRandomValues(buf);for(const b of buf)out+=b.toString(16).padStart(2,'0')}
    }catch{}
    while(out.length<n)out+=Math.floor(Math.random()*16).toString(16);
    return out.slice(0,n);
  }
  function stageNewRequestId(){return 'st-'+String(stageNow()).padStart(13,'0').slice(0,13)+'-'+stageRandomHex(12)}
  function stageOpKey(req){return [stageClean(req&&req.scope),stageClean(req&&req.pallet),stageClean(req&&req.destination),stageClean(req&&req.warehouse)].join('|')}
  // ---- storage (shared GM values; every access tolerates a missing grant) ----------------
  function stageGmRead(key,fallback){
    try{if(typeof GM_getValue!=='function')return fallback;const v=GM_getValue(key,null);return v===null||v===undefined?fallback:v}
    catch(err){stageLog('read '+key,err);return fallback}
  }
  function stageGmWrite(key,value){
    try{if(typeof GM_setValue!=='function')return false;GM_setValue(key,value);return true}
    catch(err){stageLog('write '+key,err);return false}
  }
  // Distinguishes a read failure from an absent value, so an unreadable record is reported
  // as such instead of looking like an empty one.
  function stageGmReadStrict(key){
    try{if(typeof GM_getValue!=='function')return{ok:false,value:null};const v=GM_getValue(key,null);return{ok:true,value:v===undefined?null:v}}
    catch(err){stageLog('read '+key,err);return{ok:false,value:null}}
  }
  // V is declared in core; reading it before initialization throws, which reports no version.
  function stageScriptVersion(){try{return typeof V==='string'||typeof V==='number'?String(V):''}catch(_){return ''}}
  function stageGmDelete(key){
    try{if(typeof GM_deleteValue==='function'){GM_deleteValue(key);return true}}catch(err){stageLog('delete '+key,err)}
    return stageGmWrite(key,null);
  }
  function stageStorageReady(){return typeof GM_getValue==='function'&&typeof GM_setValue==='function'}
  function stageHelperRecord(){const v=stageGmRead(stageSpec().helperKey,null);return v&&typeof v==='object'&&stageClean(v.helperId)?v:null}
  function stageHelperLive(rec,now){return !!rec&&!!stageClean(rec.helperId)&&(now||stageNow())-Number(rec.updatedAt||0)<stageSpec().helperFreshMs}
  function stageRequestRecord(){const v=stageGmRead(stageSpec().requestKey,null);return v&&typeof v==='object'&&stageClean(v.requestId)?v:null}
  function stageProgressRecord(){const v=stageGmRead(stageSpec().progressKey,null);return v&&typeof v==='object'&&stageClean(v.requestId)?v:null}
  function stageJournalAll(){
    const v=stageGmRead(stageSpec().journalKey,null);
    return v&&typeof v==='object'&&Array.isArray(v.records)?v.records.filter(r=>r&&typeof r==='object'&&stageClean(r.requestId)):[];
  }
  function stageJournalGet(requestId){
    const id=stageClean(requestId);if(!id)return null;
    const hit=stageJournalAll().filter(r=>stageClean(r.requestId)===id);
    return hit.length?hit[hit.length-1]:null;
  }
  // ---- staging guards (4.0.4) ------------------------------------------------------------
  // The append-only "hold" record is the internal guard ledger. Every request reserves its
  // entry before the first page action (duplicate-request protection and interrupted-run
  // recovery). An outcome that leaves the pallet in a known state releases the entry
  // automatically; only an unknown or destination-failed outcome keeps it as a guard for
  // guardWindowMs, so the AutoStager skips that one pallet. A guard never blocks the helper or
  // the AutoStager, and an unreadable record is treated as empty (fail-open): the next helper
  // writer quarantines the raw value and starts a fresh record.
  function stageHoldsRecord(){
    const out={holds:[],released:[],corrupt:false,reason:'',updatedAt:0,reset:null,dangling:0};
    const r=stageGmReadStrict(stageSpec().holdsKey),v=r.value;
    if(!r.ok)return Object.assign(out,{corrupt:true,reason:'the guard record could not be read'});
    if(v===null)return out;
    if(typeof v!=='object'||Array.isArray(v)||(v.holds!==undefined&&!Array.isArray(v.holds))||(v.released!==undefined&&!Array.isArray(v.released)))
      return Object.assign(out,{corrupt:true,reason:'the guard record is malformed'});
    const S=stageSpec(),holds=v.holds||[],released=v.released||[],ids=new Set();
    for(const h of holds){
      if(!h||typeof h!=='object'||Array.isArray(h)||typeof h.requestId!=='string'||!S.requestIdPattern.test(h.requestId)||
        !stageValidId(h.pallet)||stageValidWarehouse(h.warehouse)!==h.warehouse||ids.has(h.requestId))
        return Object.assign(out,{corrupt:true,reason:'the guard record has a malformed or duplicate entry'});
      ids.add(h.requestId);
    }
    for(const m of released)if(!m||typeof m!=='object'||Array.isArray(m)||typeof m.requestId!=='string')
      return Object.assign(out,{corrupt:true,reason:'the guard record has a malformed release marker'});
    // A marker naming no entry can no longer guard anything: it is ignored rather than
    // discarding every guard, and leaves the record on the next write.
    out.released=released.filter(m=>ids.has(m.requestId));out.dangling=released.length-out.released.length;
    out.holds=holds.slice();out.updatedAt=Number(v.updatedAt)||0;
    const rs=v.reset;
    if(rs&&typeof rs==='object'&&Number.isFinite(Number(rs.at)))out.reset={at:Number(rs.at),reason:stageText(rs.reason,200),quarantineKey:stageText(rs.quarantineKey,160)};
    return out;
  }
  function stageHoldKey(pallet,warehouse){return stageClean(pallet)+'|'+stageClean(warehouse)}
  function stageHoldReleasedSet(rec){return new Set(rec.released.map(r=>stageClean(r.requestId)))}
  // A missing, invalid or future-dated time counts as "just now", so a clock jump can only keep
  // a guard longer, never drop it early; maintenance rewrites such a time to the current one.
  function stageHoldAge(h,now){const at=Number(h&&h.at);return Number.isFinite(at)&&at<=now?now-at:0}
  function stageHoldExpired(h,now){return stageHoldAge(h,now)>=stageSpec().guardWindowMs}
  function stageHoldLiveList(rec,now){const rel=stageHoldReleasedSet(rec);return rec.holds.filter(h=>!rel.has(stageClean(h.requestId))&&!stageHoldExpired(h,now))}
  function stageHoldOpenCount(rec,now){return stageHoldLiveList(rec,now||stageNow()).length}
  // Live guard for the pallet, or null. An unreadable record guards nothing (fail-open).
  function stageHoldFor(pallet,warehouse){
    const rec=stageHoldsRecord();
    if(rec.corrupt)return null;
    const key=stageHoldKey(pallet,warehouse);
    const hit=stageHoldLiveList(rec,stageNow()).filter(h=>stageHoldKey(h.pallet,h.warehouse)===key);
    return hit.length?hit[hit.length-1]:null;
  }
  function stageHoldResetRecent(rec,now){return !!rec.reset&&(now||stageNow())-rec.reset.at<stageSpec().guardWindowMs?rec.reset:null}
  function stageHoldsWrite(holds,released,reset){
    const v={v:1,holds,released,updatedAt:stageNow()};
    if(reset&&stageNow()-Number(reset.at)<stageSpec().guardWindowMs)v.reset=reset;
    return stageGmWrite(stageSpec().holdsKey,v);
  }
  // One visible, non-blocking warning about the guard record itself ('' when healthy).
  function stageHoldWarning(rec,now){
    if(rec.corrupt)return 'Guard record is unreadable ('+rec.reason+'). It is ignored, so no pallet is skipped because of it; the helper resets it on its next staging attempt.';
    const rs=stageHoldResetRecent(rec,now);
    if(!rs)return '';
    let when='';try{when=new Date(rs.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}catch(_){when=''}
    return 'Guard record was unreadable and reset'+(when?' at '+when:'')+(rs.reason?' ('+rs.reason+')':'')+(rs.quarantineKey?'; the old value was kept as '+rs.quarantineKey:'')+'. Unconfirmed attempts from before the reset are no longer skipped automatically.';
  }
  // Helper writers only. Best effort copy of the raw value, then a fresh verified record.
  function stageHoldReset(rec){
    const S=stageSpec(),st=stageState(),now=stageNow(),raw=stageGmReadStrict(S.holdsKey);
    let qkey='';
    if(raw.ok&&raw.value!==null){qkey=S.holdsKey+'-quarantine-'+now;if(!stageGmWrite(qkey,raw.value))qkey=''}
    const reset={at:now,reason:stageText(rec&&rec.reason,200),quarantineKey:qkey};
    if(!stageHoldsWrite([],[],reset))return null;
    const back=stageHoldsRecord();
    if(back.corrupt||back.holds.length||!back.reset||back.reset.at!==now)return null;
    st.holdNote=stageText(stageHoldWarning(back,now),300);
    stageLog('guard record reset',reset.reason);
    return back;
  }
  function stageHoldCapacityNote(rec){
    const S=stageSpec();
    return 'Guard capacity is full: '+stageHoldOpenCount(rec)+' of '+S.holdsMax+' unconfirmed attempts from the last 24 hours are still guarded, so this one request was refused and nothing was attempted.';
  }
  // Last resort when the store is at holdsTotalMax: released entries not needed by a journal,
  // request, progress or the current run go first, then guards older than 24 h, then any other
  // released entry, oldest first. A live guard is never evicted.
  function stageHoldEvictIds(rec,now){
    const S=stageSpec(),over=rec.holds.length-(S.holdsTotalMax-1);
    if(over<=0)return new Set();
    const pins=stageHoldPins(),pinIds=pins.ok?pins.ids:new Set(),rel=stageHoldReleasedSet(rec),cur=stageClean(stageState().currentId);
    const tier=h=>{const id=stageClean(h.requestId);if(id===cur)return -1;
      if(rel.has(id))return pinIds.has(id)?2:0;return stageHoldExpired(h,now)?1:-1};
    const list=rec.holds.map(h=>({id:stageClean(h.requestId),t:tier(h),at:Number(h.at)||0})).filter(x=>x.t>=0);
    list.sort((a,b)=>a.t-b.t||a.at-b.at||(a.id<b.id?-1:a.id>b.id?1:0));
    return new Set(list.slice(0,over).map(x=>x.id));
  }
  // The operator's Stage click clears that pallet's earlier guards: markers, never deleted
  // outcomes. Only once that run has actually scanned (see stageFinish), so a manual request
  // refused before any page action leaves the earlier unknown outcome guarded.
  function stageHoldClearGuard(rec,pallet,warehouse,byRequestId,now){
    const key=stageHoldKey(pallet,warehouse),own=stageClean(byRequestId);let n=0;
    for(const h of stageHoldLiveList(rec,now))if(stageHoldKey(h.pallet,h.warehouse)===key&&stageClean(h.requestId)!==own){
      rec.released.push({requestId:stageClean(h.requestId),at:now,by:'operator-stage',status:'operator-stage',clearedBy:stageClean(byRequestId)});n++;
    }
    return n;
  }
  function stageHoldOperatorClear(req){
    const rec=stageHoldsRecord();
    if(rec.corrupt||!stageHoldClearGuard(rec,req.pallet,req.warehouse,req.requestId,stageNow()))return false;
    return stageHoldsWrite(rec.holds,rec.released,rec.reset);
  }
  // Reserved before any page action and durable or nothing: a request whose entry cannot be
  // written is refused on its own (scan nothing); the helper itself keeps running.
  function stageAddHold(record){
    const S=stageSpec(),st=stageState(),id=stageClean(record&&record.requestId);
    if(!id)return false;
    const entry={requestId:id,pallet:stageClean(record.pallet),warehouse:stageClean(record.warehouse),
      destination:stageClean(record.destination),status:stageClean(record.status)||'in-progress',at:stageNow()};
    if(!S.requestIdPattern.test(id)||!stageValidId(entry.pallet)||stageValidWarehouse(entry.warehouse)!==entry.warehouse){
      st.holdNote='The guard identity (request, pallet or facility) is malformed, so no guard was stored.';return false;
    }
    const broken='Guard storage is not working, so this one request was refused and nothing was attempted. Check the Tampermonkey storage for this script.';
    let rec=stageHoldsRecord();
    if(rec.corrupt){rec=stageHoldReset(rec);if(!rec){st.holdNote=broken;return false}}
    if(rec.holds.some(h=>stageClean(h.requestId)===id))return true;
    if(rec.holds.length>=S.holdsMax){
      stageHoldMaintain(true);
      rec=stageHoldsRecord();
      if(rec.corrupt){rec=stageHoldReset(rec);if(!rec){st.holdNote=broken;return false}}
      if(rec.holds.some(h=>stageClean(h.requestId)===id))return true;
    }
    const now=stageNow();
    if(rec.holds.length>=S.holdsTotalMax){
      const drop=stageHoldEvictIds(rec,now);
      rec.holds=rec.holds.filter(h=>!drop.has(stageClean(h.requestId)));
      rec.released=rec.released.filter(r=>!drop.has(stageClean(r.requestId)));
    }
    if(stageHoldOpenCount(rec,now)>=S.holdsMax||rec.holds.length>=S.holdsTotalMax){st.holdNote=stageHoldCapacityNote(rec);return false}
    rec.holds.push(entry);
    if(!stageHoldsWrite(rec.holds,rec.released,rec.reset)){st.holdNote='The guard entry could not be written to shared storage, so this one request was refused.';return false}
    const back=stageHoldsRecord();
    if(!back.corrupt&&back.holds.some(h=>stageClean(h.requestId)===id)&&!back.released.some(r=>stageClean(r.requestId)===id)){
      st.holdNote=stageText(stageHoldWarning(back,now),300);return true;
    }
    st.holdNote='The guard entry did not read back from shared storage, so this one request was refused.';
    return false;
  }
  // Best effort: records how the run ended on its entry.
  function stageUpdateHold(requestId,status){
    const rec=stageHoldsRecord(),id=stageClean(requestId);
    if(rec.corrupt)return false;
    let found=false;
    for(const h of rec.holds)if(stageClean(h.requestId)===id){h.status=stageClean(status);h.endedAt=stageNow();found=true}
    if(!found)return false;
    return stageHoldsWrite(rec.holds,rec.released,rec.reset);
  }
  // Unknown and destination-failed outcomes stay guarded; so does anything unrecognized after
  // the pallet was scanned. Every other outcome left the pallet in a known state.
  function stageHoldGuarding(status,scanned){
    const s=stageClean(status);
    if(s==='unknown'||s==='destination-failed')return true;
    return scanned===true&&['success','nothing-moved','source-failed','rejected','not-ready','helper-unavailable','auto-skip-proven'].indexOf(s)<0;
  }
  function stageHoldReleasing(status,scanned){return !stageHoldGuarding(status,scanned)}
  function stageAutoReleaseHold(requestId,status,scanned){
    const rec=stageHoldsRecord(),id=stageClean(requestId);
    if(!id||rec.corrupt||!stageHoldReleasing(status,scanned))return false;
    if(!rec.holds.some(h=>stageClean(h.requestId)===id))return false;
    if(rec.released.some(r=>stageClean(r.requestId)===id))return true;
    rec.released.push({requestId:id,at:stageNow(),by:'auto-clear',status:stageClean(status)});
    if(!stageHoldsWrite(rec.holds,rec.released,rec.reset))return false;
    const back=stageHoldsRecord();
    return !back.corrupt&&back.released.some(r=>stageClean(r.requestId)===id);
  }
  // Guards past the 24 h window get an 'expired' marker (so they archive like released pairs);
  // invalid or future times are rewritten to now. Returns the number of entries changed.
  function stageHoldExpire(now){
    const rec=stageHoldsRecord();
    if(rec.corrupt)return 0;
    const rel=stageHoldReleasedSet(rec);let n=0;
    for(const h of rec.holds){
      const id=stageClean(h.requestId),at=Number(h.at);
      if(rel.has(id))continue;
      if(!Number.isFinite(at)||at>now){h.at=now;h.atRepaired=true;n++;continue}
      if(stageHoldExpired(h,now)){rec.released.push({requestId:id,at:now,by:'auto-clear',status:'expired'});rel.add(id);n++}
    }
    if(!n&&!rec.dangling)return 0;
    return stageHoldsWrite(rec.holds,rec.released,rec.reset)?n:0;
  }
  // ---- released-hold archive (4.0) -------------------------------------------------------
  // A released pair (hold + its release markers) is moved to the archive only when nothing can
  // still need it: no journal entry (auto skip/recovery proof reads the active pair), no live
  // request or progress record and not the current run. The archive is written and verified
  // first; the pair then leaves the active record in one write, so a reader always sees it
  // either still released or gone, never an open hold. Open holds are never archived.
  function stageHoldPins(){
    const S=stageSpec(),ids=new Set(),j=stageGmReadStrict(S.journalKey);
    if(!j.ok)return{ok:false,reason:'the journal could not be read'};
    if(j.value!==null){
      if(typeof j.value!=='object'||!Array.isArray(j.value.records))return{ok:false,reason:'the journal is malformed'};
      for(const r of j.value.records){if(!r||typeof r!=='object')return{ok:false,reason:'the journal has a malformed entry'};ids.add(stageClean(r.requestId))}
    }
    for(const key of [S.requestKey,S.progressKey]){
      const r=stageGmReadStrict(key);
      if(!r.ok)return{ok:false,reason:'the '+(key===S.requestKey?'request':'progress')+' record could not be read'};
      if(r.value!==null){
        if(typeof r.value!=='object')return{ok:false,reason:'the '+(key===S.requestKey?'request':'progress')+' record is malformed'};
        ids.add(stageClean(r.value.requestId));
      }
    }
    const cur=stageClean(stageState().currentId);if(cur)ids.add(cur);
    return{ok:true,ids};
  }
  function stageHoldArchivable(rec,pins,now,pressure){
    const S=stageSpec(),byId=new Map(),relAt=new Map(),out=[];
    for(const h of rec.holds){const id=stageClean(h.requestId);byId.set(id,(byId.get(id)||0)+1)}
    for(const r of rec.released){
      const id=stageClean(r.requestId),at=Number(r.at);
      relAt.set(id,Math.max(relAt.has(id)?relAt.get(id):-Infinity,Number.isFinite(at)?at:NaN));
    }
    for(const h of rec.holds){
      const id=stageClean(h.requestId),at=relAt.get(id);
      if(!S.requestIdPattern.test(id)||byId.get(id)!==1||!relAt.has(id)||pins.ids.has(id))continue;
      if(!Number.isFinite(at)||at>now)continue;
      if(!pressure&&now-at<S.holdArchiveMinAgeMs)continue;
      out.push({id,at,holdAt:Number(h.at)||0});
    }
    out.sort((a,b)=>a.at-b.at||a.holdAt-b.holdAt||(a.id<b.id?-1:a.id>b.id?1:0));
    return out.slice(0,S.holdArchiveBatch).map(x=>x.id);
  }
  // Entries are keyed by request id (idempotent across retries); seq gives a stable order that
  // survives key reordering and is rebuilt from the entries when nextSeq is missing or low.
  // It is a bounded recent history (holdArchiveMax, oldest seq dropped first), not a ledger:
  // dropping an archived pair cannot reopen anything because it no longer has an active hold.
  // Consistency relies on a single writer: only the helper holding the exclusive helper Web Lock
  // (the same lock name as 3.9.21, so versions never run as helpers side by side) writes holds.
  function stageHoldArchiveRead(){
    const r=stageGmReadStrict(stageSpec().holdArchiveKey),v=r.value;
    if(!r.ok)return{ok:false,corrupt:true,reason:'the hold archive could not be read'};
    if(v===null)return{ok:true,entries:{},nextSeq:1,count:0};
    if(typeof v!=='object'||Array.isArray(v)||v.v!==1||!v.entries||typeof v.entries!=='object'||Array.isArray(v.entries))
      return{ok:false,corrupt:true,reason:'the hold archive is malformed'};
    let max=0,count=0;
    for(const key of Object.keys(v.entries)){
      const e=v.entries[key];
      if(!e||typeof e!=='object'||stageClean(e.requestId)!==key||!Number.isSafeInteger(e.seq)||e.seq<1||!e.hold||typeof e.hold!=='object'||!Array.isArray(e.releases)||!e.releases.length)
        return{ok:false,corrupt:true,reason:'the hold archive has a malformed entry'};
      max=Math.max(max,e.seq);count++;
    }
    const next=Number.isSafeInteger(v.nextSeq)&&v.nextSeq>max?v.nextSeq:max+1;
    return{ok:true,entries:v.entries,nextSeq:next,count,updatedAt:Number(v.updatedAt)||0};
  }
  function stageHoldArchiveEntries(limit){
    const a=stageHoldArchiveRead();
    if(!a.ok)return{ok:false,reason:a.reason,entries:[]};
    const list=Object.keys(a.entries).map(k=>a.entries[k]).sort((x,y)=>x.seq-y.seq||Number(x.archivedAt)-Number(y.archivedAt)||(x.requestId<y.requestId?-1:1));
    const n=Number(limit)>0?Math.floor(Number(limit)):list.length;
    return{ok:true,entries:JSON.parse(JSON.stringify(list.slice(-n)))};
  }
  function stageSameJson(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch(_){return false}}
  function stageHoldMaintainOnce(pressure){
    const S=stageSpec(),now=stageNow(),rec=stageHoldsRecord();
    if(rec.corrupt)return{ok:false,archived:0,reason:rec.reason};
    const pins=stageHoldPins();
    if(!pins.ok)return{ok:false,archived:0,reason:pins.reason};
    const ids=stageHoldArchivable(rec,pins,now,pressure);
    if(!ids.length)return{ok:true,archived:0,reason:'nothing to archive'};
    const arch=stageHoldArchiveRead();
    if(!arch.ok)return{ok:false,archived:0,reason:arch.reason+'; nothing was archived'};
    const entries=Object.assign({},arch.entries),want=new Set(ids);let seq=arch.nextSeq;
    for(const id of ids){
      const hold=rec.holds.find(h=>stageClean(h.requestId)===id),releases=rec.released.filter(r=>stageClean(r.requestId)===id);
      const prior=entries[id];
      entries[id]={requestId:id,seq:prior?prior.seq:seq++,archivedAt:prior?Number(prior.archivedAt)||now:now,hold,releases};
    }
    const keys=Object.keys(entries);
    if(keys.length>S.holdArchiveMax){
      const drop=keys.filter(k=>!want.has(k)).sort((a,b)=>entries[a].seq-entries[b].seq).slice(0,keys.length-S.holdArchiveMax);
      for(const k of drop)delete entries[k];
    }
    if(!stageGmWrite(S.holdArchiveKey,{v:1,nextSeq:seq,entries,updatedAt:now}))return{ok:false,archived:0,reason:'the hold archive could not be written; nothing was removed'};
    const back=stageHoldArchiveRead();
    if(!back.ok||ids.some(id=>!back.entries[id]||!stageSameJson(back.entries[id].hold,entries[id].hold)||!stageSameJson(back.entries[id].releases,entries[id].releases)))
      return{ok:false,archived:0,reason:'the hold archive did not read back; nothing was removed'};
    // Compare-and-remove: any change since the first read aborts, and a later pass retries.
    const fresh=stageHoldsRecord();
    if(fresh.corrupt||!stageSameJson(fresh.holds,rec.holds)||!stageSameJson(fresh.released,rec.released))
      return{ok:false,archived:0,reason:'the hold record changed during archival; nothing was removed'};
    const pins2=stageHoldPins();
    if(!pins2.ok)return{ok:false,archived:0,reason:pins2.reason+'; nothing was removed'};
    const remove=new Set(ids.filter(id=>!pins2.ids.has(id)));
    if(!remove.size)return{ok:true,archived:0,reason:'every candidate became pinned'};
    const holds=fresh.holds.filter(h=>!remove.has(stageClean(h.requestId)));
    const released=fresh.released.filter(r=>!remove.has(stageClean(r.requestId)));
    const wrote=stageHoldsWrite(holds,released,fresh.reset),after=stageHoldsRecord();
    if(!after.corrupt&&stageSameJson(after.holds,holds)&&stageSameJson(after.released,released))return{ok:true,archived:remove.size,reason:''};
    if(!after.corrupt&&stageSameJson(after.holds,fresh.holds)&&stageSameJson(after.released,fresh.released))
      return{ok:false,archived:0,reason:'the compacted hold record '+(wrote?'did not persist':'could not be written')+'; the pairs stay active and released'};
    // Anything else is unexplained: stop maintenance and warn. A guard record never stops the
    // helper; the next writer resets it if it is unreadable.
    const st=stageState();
    st.holdMaintFault='the guard record changed unexpectedly during compaction';
    st.holdNote='Guard maintenance found an unexpected guard record and was switched off until this tab reloads. Staging continues.';
    return{ok:false,archived:0,reason:st.holdMaintFault};
  }
  // Helper-owned only: monitors never call this. Pressure mode (store full) drops the age guard.
  function stageHoldMaintain(pressure){
    const st=stageState(),now=stageNow();
    if(st.ownership!=='owned')return{ok:false,archived:0,reason:'only the live helper maintains holds'};
    if(st.holdMaintFault)return{ok:false,archived:0,reason:'hold maintenance is disabled: '+st.holdMaintFault};
    let out;
    try{stageHoldExpire(now);out=stageHoldMaintainOnce(pressure===true)}
    catch(err){stageLog('hold maintenance',err);out={ok:false,archived:0,reason:'hold maintenance failed ('+stageErrText(err)+')'}}
    st.holdMaint={at:now,ok:!!out.ok,archived:Number(out.archived)||0,reason:stageText(out.reason,200),pressure:pressure===true};
    return out;
  }
  function stageHoldRoutineMaintain(now){
    const S=stageSpec(),st=stageState();
    if(st.ownership!=='owned'||st.active||now<Number(st.holdMaintAt))return null;
    st.holdMaintAt=now+S.holdMaintainMs;
    let rec=stageHoldsRecord();
    if(rec.corrupt&&!(rec=stageHoldReset(rec)))return null;
    stageHoldExpire(now);rec=stageHoldsRecord();
    if(rec.corrupt||rec.holds.length<S.holdCompactAt)return null;
    return stageHoldMaintain(false);
  }
  // Published in the heartbeat. Informational only: nothing here makes the helper not ready.
  function stageHoldSummary(){
    const S=stageSpec(),now=stageNow(),rec=stageHoldsRecord(),warning=stageHoldWarning(rec,now),reset=!!stageHoldResetRecent(rec,now);
    if(rec.corrupt)return{corrupt:true,reason:rec.reason,open:0,live:0,total:null,openCap:S.holdsMax,totalCap:S.holdsTotalMax,full:false,warning,reset};
    const live=stageHoldOpenCount(rec,now);
    return{corrupt:false,reason:'',open:live,live,total:rec.holds.length,openCap:S.holdsMax,totalCap:S.holdsTotalMax,full:live>=S.holdsMax,warning,reset};
  }
  // Read-only snapshot for UI and diagnostics on any tab. Never writes or repairs. `open` and
  // `live` are the live (unreleased, under 24 h) guard count; an unreadable record counts as
  // empty there (it guards nothing) while its raw totals stay null.
  function stageHoldStats(){
    const S=stageSpec(),now=stageNow();
    try{
      const rec=stageHoldsRecord(),pins=stageHoldPins(),arch=stageHoldArchiveRead(),helper=stageHelperRecord();
      const rel=stageHoldReleasedSet(rec),pinIds=pins.ok?pins.ids:new Set();
      const releasedPairs=rec.holds.filter(h=>rel.has(stageClean(h.requestId)));
      const liveList=stageHoldLiveList(rec,now),live=liveList.length;
      const expired=rec.holds.length-releasedPairs.length-live;
      const pinned=releasedPairs.filter(h=>pinIds.has(stageClean(h.requestId))).length;
      const archivable=!rec.corrupt&&pins.ok?stageHoldArchivable(rec,pins,now,false).length:0;
      const unknown=liveList.filter(h=>stageClean(h.status)==='unknown').length;
      let lastArchivedAt=0;
      if(arch.ok)for(const k of Object.keys(arch.entries))lastArchivedAt=Math.max(lastArchivedAt,Number(arch.entries[k].archivedAt)||0);
      const known=!rec.corrupt,pinKnown=known&&pins.ok,full=known&&live>=S.holdsMax,warning=stageHoldWarning(rec,now),rs=stageHoldResetRecent(rec,now);
      return{ok:pins.ok&&arch.ok,at:now,corrupt:rec.corrupt,pinsOk:pins.ok,reason:rec.corrupt?rec.reason:!pins.ok?pins.reason:!arch.ok?arch.reason:'',
        total:known?rec.holds.length:null,open:live,live,unknownOpen:unknown,expired:known?expired:null,releasedPairs:known?releasedPairs.length:null,
        releaseMarkers:known?rec.released.length:null,pinnedReleased:pinKnown?pinned:null,archivable:pinKnown?archivable:null,
        openCap:S.holdsMax,totalCap:S.holdsTotalMax,openLeft:Math.max(0,S.holdsMax-live),full,guardWindowMs:S.guardWindowMs,
        warning,reset:!!rs,resetAt:rs?rs.at:0,quarantineKey:rs?rs.quarantineKey:'',
        note:full?stageHoldCapacityNote(rec):warning,updatedAt:rec.updatedAt,
        archive:{ok:arch.ok,corrupt:!arch.ok,reason:arch.ok?'':arch.reason,count:arch.ok?arch.count:null,nextSeq:arch.ok?arch.nextSeq:null,lastArchivedAt:arch.ok?lastArchivedAt:null,max:S.holdArchiveMax},
        helper:helper?{maintenance:helper.holdMaintenance&&typeof helper.holdMaintenance==='object'?helper.holdMaintenance:null,
          note:stageText(helper.holdNote,300),live:stageHelperLive(helper,now)}:null};
    }catch(err){stageLog('guard stats',err);return{ok:false,at:now,corrupt:true,pinsOk:false,reason:'guard statistics failed ('+stageErrText(err)+')',
      total:null,open:0,live:0,unknownOpen:0,expired:null,releasedPairs:null,releaseMarkers:null,pinnedReleased:null,archivable:null,
      openCap:S.holdsMax,totalCap:S.holdsTotalMax,openLeft:S.holdsMax,full:false,guardWindowMs:S.guardWindowMs,
      warning:'Guard statistics could not be read.',reset:false,resetAt:0,quarantineKey:'',note:'',updatedAt:0,archive:null,helper:null}}
  }
  // Write-once per request id: an outcome already recorded is never overwritten, so no run
  // can be re-attempted or re-reported with a different result. Returns the entry only when
  // the write is durable: a caller that gets null must fail closed and retry nothing.
  function stageJournalPut(record){
    const S=stageSpec(),id=stageClean(record&&record.requestId);
    if(!id||!stageIsTerminal(record&&record.status))return null;
    const existing=stageJournalGet(id);if(existing)return existing;
    const now=stageNow();
    const entry={requestId:id,opKey:stageOpKey(record),status:stageClean(record.status),message:stageText(record.message,400),
      pallet:stageClean(record.pallet),destination:stageClean(record.destination),scope:stageText(record.scope,256),
      warehouse:stageClean(record.warehouse),phase:stageClean(record.phase),helperId:stageClean(record.helperId),at:now,
      autoSkipSafe:record.autoSkipSafe===true&&!!record.auto&&stageAutoSkipReason(record.status,record.skipReason)?true:false,
      skipReason:record.autoSkipSafe===true&&!!record.auto?stageAutoSkipReason(record.status,record.skipReason):''};
    // An unreadable or malformed journal is never overwritten: that would erase outcomes and
    // the pins that keep recent released holds in the active record.
    const raw=stageGmReadStrict(S.journalKey);
    if(!raw.ok||(raw.value!==null&&(typeof raw.value!=='object'||!Array.isArray(raw.value.records))))return null;
    const kept=stageJournalAll().filter(r=>now-Number(r.at||0)<S.journalTtlMs);
    kept.push(entry);
    if(!stageGmWrite(S.journalKey,{v:1,records:kept.slice(-S.journalMax),updatedAt:now}))return null;
    // Read back: a storage layer that silently drops writes must not look like success.
    const stored=stageJournalGet(id);
    return stored&&stageClean(stored.status)===entry.status?stored:null;
  }
  function stageClearRequest(requestId){
    const id=stageClean(requestId),cur=stageRequestRecord(),prog=stageProgressRecord();
    if(cur&&(!id||stageClean(cur.requestId)===id))stageGmDelete(stageSpec().requestKey);
    if(prog&&(!id||stageClean(prog.requestId)===id))stageGmDelete(stageSpec().progressKey);
  }
  function stageWriteProgress(record){
    return stageGmWrite(stageSpec().progressKey,{v:1,requestId:stageClean(record.requestId),opKey:stageOpKey(record),
      phase:stageClean(record.phase),helperId:stageClean(record.helperId),pallet:stageClean(record.pallet),
      destination:stageClean(record.destination),scope:stageText(record.scope,256),warehouse:stageClean(record.warehouse),
      startedAt:Number(record.startedAt)||stageNow(),updatedAt:stageNow()});
  }
  function stageSleep(ms){return new Promise(resolve=>{try{setTimeout(resolve,Math.max(0,Number(ms)||0))}catch(err){stageLog('timer',err);resolve()}})}
  // ---- request validation ----------------------------------------------------------------
  function stageResult(status,message,req,extra){
    const base={status:stageClean(status),message:stageText(message,400),requestId:stageClean(req&&req.requestId),
      pallet:stageClean(req&&req.pallet),destination:stageClean(req&&req.destination),scope:stageText(req&&req.scope,256),
      warehouse:stageClean(req&&req.warehouse),at:stageNow()};
    return extra?Object.assign(base,extra):base;
  }
  function stageValidateInput(input){
    const req=input&&typeof input==='object'?input:{};
    const pallet=stageValidId(req.pallet),destination=stageValidId(req.destination);
    const scope=stageText(req.scope,256),warehouse=stageValidWarehouse(req.warehouse);
    if(!pallet)return{ok:false,status:'rejected',message:'The pallet container id is missing or is not a valid container id.'};
    if(!destination)return{ok:false,status:'rejected',message:'The destination container id is missing or is not a valid container id.'};
    if(pallet===destination)return{ok:false,status:'rejected',message:'The pallet and the destination are the same container.'};
    if(!scope)return{ok:false,status:'rejected',message:'The load scope is missing, so the request cannot be attributed to a trailer.'};
    if(!warehouse)return{ok:false,status:'rejected',message:'A facility code (for example LGA9) is required so a move cannot be staged in the wrong building.'};
    return{ok:true,request:{pallet,destination,scope,warehouse}};
  }
  // The helper re-checks everything the monitor checked, plus arming and freshness, because
  // the request crosses tabs and storage. Automatic protocol 3 has no source-data age gate.
  function stageAcceptRequest(rec,now){
    const S=stageSpec(),st=stageState(),at=now||stageNow();
    if(!rec)return{ok:false,status:'',message:''};
    const id=stageClean(rec.requestId);
    if(!S.requestIdPattern.test(id))return{ok:false,status:'rejected',message:'The staging request id is malformed.'};
    if(stageClean(rec.helperId)!==st.helperId)return{ok:false,status:'',message:''};
    const valid=stageValidateInput(rec);
    if(!valid.ok)return{ok:false,status:valid.status,message:valid.message};
    if(!(Number(rec.createdAt)>0)||at-Number(rec.createdAt)>=S.requestTtlMs)return{ok:false,status:'expired',message:'The staging request expired before this helper could run it.'};
    if(!st.armed)return{ok:false,status:'not-armed',message:'The Move App helper has no configured facility.'};
    if(Number(rec.createdAt)<=st.armedAt)return{ok:false,status:'expired',message:'The staging request was created before this helper became available, so it was not replayed.'};
    if(stageClean(rec.warehouse)!==st.warehouse)return{ok:false,status:'warehouse-mismatch',message:'The request is for '+(stageClean(rec.warehouse)||'no facility')+' but this helper is configured for '+st.warehouse+'.'};
    if(stageJournalGet(id))return{ok:false,status:'',message:''};
    if(rec.auto!==undefined&&rec.auto!==null){
      const gate=stageAutoGate(rec,at,false);
      if(!gate.ok)return{ok:false,status:'rejected',auto:true,message:'AutoStager was not authorized: '+gate.reason+'. Nothing was attempted.'};
      const a=rec.auto;
      return{ok:true,request:Object.assign({requestId:id},valid.request,{auto:{protocol:a.protocol,owner:a.owner,scope:stageText(a.scope,256),warehouse:stageClean(a.warehouse)}})};
    }
    return{ok:true,request:Object.assign({requestId:id},valid.request)};
  }
  // ---- automatic staging lease -------------------------------------------------
  // The helper alone holds the authoritative owner lease, in memory only: a helper reload
  // drops it. Monitors on any origin ask through one control mailbox and a per-owner consent
  // record, and read the outcome from the helper heartbeat. The consent record is what keeps
  // a stop durable when the mailbox is overwritten or a listener is missing. There is no
  // queue: an auto move uses the existing single request slot like a manual one.
  function stageAutoSpec(){
    return{controlKey:'pmm-auto-stage-control-v3912',
      consentPrefix:'pmm-auto-stage-consent-v3912:',protocol:7,leaseMs:15000,gapMs:3000,errorGapMs:15000,
      commandMaxAgeMs:5000,
      ownerPattern:/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/,commandIdPattern:/^[A-Za-z0-9][A-Za-z0-9._:-]{3,127}$/,
      actions:['enable','renew','stop']};
  }
  function stageAutoIdentity(v){
    if(!v||typeof v!=='object')return null;
    const owner=typeof v.owner==='string'&&stageAutoSpec().ownerPattern.test(v.owner)?v.owner:'';
    const scope=stageText(v.scope,256),warehouse=stageValidWarehouse(v.warehouse);
    return owner&&scope&&warehouse&&stageClean(v.warehouse)===warehouse?{owner,scope,warehouse}:null;
  }
  function stageAutoSame(a,b){return !!a&&!!b&&a.owner===b.owner&&a.scope===b.scope&&a.warehouse===b.warehouse}
  function stageAutoConsentKey(owner){return stageAutoSpec().consentPrefix+stageClean(owner)}
  function stageAutoConsentValid(identity,helperId,now){
    const A=stageAutoSpec(),at=now||stageNow();
    if(!identity||!stageClean(helperId))return{ok:false,reason:'consent identity is missing'};
    const c=stageGmRead(stageAutoConsentKey(identity.owner),null);
    if(!c||typeof c!=='object')return{ok:false,reason:'no consent record'};
    if(c.enabled!==true)return{ok:false,reason:'consent withdrawn'};
    if(c.owner!==identity.owner||stageClean(c.helperId)!==stageClean(helperId)||!stageAutoSame(stageAutoIdentity(c),identity))
      return{ok:false,reason:'consent identity differs'};
    const cAt=Number(c.at);
    if(!Number.isFinite(cAt)||cAt>at||at-cAt>A.leaseMs)return{ok:false,reason:'consent is stale'};
    return{ok:true};
  }
  // Durable terminal outcomes provide the shared success/error deadline across reloads.
  // Old 30-second cooldown storage is intentionally ignored. 4.0 restarts only the newest
  // recorded pause on the monotonic clock at helper startup (stageAutoStartupFloor).
  function stageAutoSkipReason(status,reason){
    const s=stageClean(status),r=stageClean(reason);
    return (s==='source-failed'&&r==='source-rejected')||(s==='nothing-moved'&&r==='zero-moved')||(s==='rejected'&&r==='not-attempted')?r:'';
  }
  // This is a proof of a correlated, rejected operation on a clean source screen,
  // not a failure status label. Destination failure with a scanned pallet never qualifies.
  function stageAutoSkipProof(req,call,status){
    const st=stageState(),aft=stageAft(),live=stageRequestRecord(),session=stageSession(aft);
    if(!req.auto||st.blocked||!st.active||!st.scanned||!call||call.failed||!call.response||
      !live||stageClean(live.requestId)!==req.requestId||stageClean(live.helperId)!==st.helperId||
      stageOpKey(live)!==stageOpKey(req)||st.currentId!==req.requestId||st.ownership!=='owned'||!st.armed||st.warehouse!==req.warehouse||
      !stageAutoLive(stageNow())||!stageAutoSame(st.autoOwner,stageAutoIdentity(req.auto))||
      !stageAutoConsentValid(stageAutoIdentity(req.auto),st.helperId,stageNow()).ok||
      session!==st.sessionRef||stageSessionId(session)!==st.sessionId||
      stageStepId(aft)!==stageSpec().sourceStep||stageSourceScannable(aft)||stageInputState(aft).state!=='ready')return '';
    const diversion=stageDiversionCheck(aft,true),screen=stageFailureScreen();
    if(diversion.active||diversion.unknown||!screen.ok||!screen.absent)return '';
    if(status==='source-failed'&&call.response.success===false&&call.response.confirmationRequired!==true&&
      stageMatchesSource(call,req)&&Array.isArray(call.data?.values)&&
      call.data.values.length===1&&stageClean(call.data.values[0])===req.pallet&&
      stageClean(call.url).includes(stageSpec().getContainerPath)&&Number(call.startedAt)>=st.runStartedAt&&
      Number(call.startedAt)>=Number(st.sourceScanAt)&&Number.isFinite(Number(st.sourceScanAt))&&
      Number(call.resolvedAt)>=Number(call.startedAt)&&
      Number.isFinite(Number(st.sourceScanSeq))&&Number(call.relevantSeq)===Number(st.sourceScanSeq)+1&&
      Number(st.relevantSeq)===Number(call.relevantSeq))return 'source-rejected';
    if(status==='nothing-moved'&&call.response.success===true&&call.response.confirmationRequired!==true&&
      Number(call.startedAt)>=st.runStartedAt&&Number(call.resolvedAt)>=Number(call.startedAt)&&
      stageResultCallIsolated(req,call)&&stageMovedCount(aft,call)===0)return 'zero-moved';
    return '';
  }
  function stageAutoDurableNextAt(){
    const now=stageNow(),A=stageAutoSpec();let next=0;
    for(const r of stageJournalAll()){
      const status=stageClean(r.status),gap=status==='success'?A.gapMs:r.autoSkipSafe===true&&stageAutoSkipReason(status,r.skipReason)?A.errorGapMs:0;
      if(gap){const at=Number(r.at);if(Number.isFinite(at)&&at>0)next=Math.max(next,Math.min(at+gap,now+gap))}
    }
    return next;
  }
  function stageAutoNextAt(){return Math.max(stageAutoDurableNextAt(),Number(stageState().autoFloor)||0)}
  // 4.0: without a monotonic clock the pause never opens, so a wall-clock step cannot shorten it.
  function stageAutoPublishedNextAt(){
    const now=stageNow(),m=stageMono(),mono=stageState().autoMonoNext;
    if(!Number.isFinite(m))return now+stageAutoSpec().errorGapMs;
    const left=Number.isFinite(mono)&&mono>m?Math.ceil(mono-m):0;
    return Math.max(stageAutoNextAt(),left?now+left:0);
  }
  function stageAutoGapOpen(now){
    const m=stageMono(),mono=stageState().autoMonoNext;
    if(!Number.isFinite(m))return false;
    return (now||stageNow())>=stageAutoNextAt()&&!(Number.isFinite(mono)&&m<mono);
  }
  // A new helper document has no monotonic memory of earlier outcomes, and a forward wall
  // step would make their durable deadlines look elapsed. When any gapped outcome is in the
  // journal, the newest one's full pause is restarted on the monotonic clock (at most 15 s).
  function stageAutoStartupFloor(){
    const st=stageState(),A=stageAutoSpec(),m=stageMono();
    if(!Number.isFinite(m))return;
    // An unreadable journal is not "no outcome": take the longest pause.
    const raw=stageGmReadStrict(stageSpec().journalKey);
    if(!raw.ok||(raw.value!==null&&(typeof raw.value!=='object'||!Array.isArray(raw.value.records)))){
      st.autoMonoNext=Math.max(Number.isFinite(st.autoMonoNext)?st.autoMonoNext:0,m+A.errorGapMs);return;
    }
    let gap=0,latest=-Infinity;
    for(const r of stageJournalAll()){
      const s=stageClean(r.status),g=s==='success'?A.gapMs:r.autoSkipSafe===true&&stageAutoSkipReason(s,r.skipReason)?A.errorGapMs:0;
      const at=Number(r.at);
      if(g&&Number.isFinite(at)&&at>=latest){latest=at;gap=g}
    }
    if(gap)st.autoMonoNext=Math.max(Number.isFinite(st.autoMonoNext)?st.autoMonoNext:0,m+gap);
  }
  // Called only after the exact durable success or skippable-error entry, before request cleanup.
  function stageAutoMarkOutcome(entry){
    const st=stageState(),gap=entry.status==='success'?stageAutoSpec().gapMs:stageAutoSpec().errorGapMs,m=stageMono();
    st.autoFloor=Math.max(Number(st.autoFloor)||0,Number(entry.at)+gap);
    if(Number.isFinite(m))st.autoMonoNext=Math.max(Number.isFinite(st.autoMonoNext)?st.autoMonoNext:0,m+gap);
  }
  // Monotonic document clock: a wall-clock step cannot extend a lease
  // inside one helper document. NaN when unavailable: no lease constraint, but the auto pause
  // then never opens (stageAutoGapOpen fails closed).
  function stageMono(){try{const n=performance.now();return Number.isFinite(n)?n:NaN}catch(_){return NaN}}
  function stageAutoLive(now){
    const o=stageState().autoOwner,m=stageMono();
    return !!o&&(now||stageNow())<Number(o.expiresAt)&&!(Number.isFinite(m)&&Number.isFinite(o.monoExpires)&&m>=o.monoExpires);
  }
  function stageAutoRevoke(reason){
    const st=stageState();
    if(st.autoOwner)st.autoNote='AutoStager stopped: '+stageText(reason,160);
    st.autoOwner=null;
  }
  function stageAutoPublicOwner(now){
    const o=stageState().autoOwner;
    return o&&stageAutoLive(now)?{owner:o.owner,scope:o.scope,warehouse:o.warehouse,expiresAt:Number(o.expiresAt)}:null;
  }
  function stageAutoAck(cmd,ok,reason,now){
    const st=stageState();
    st.autoAck={id:stageClean(cmd&&cmd.id).slice(0,128),action:stageClean(cmd&&cmd.action).slice(0,16),ok:!!ok,reason:stageText(reason,160),at:now};
    st.autoNote=stageText((ok?'':'Refused ')+stageClean(cmd&&cmd.action)+(reason?': '+reason:''),200);
  }
  function stageAutoProcess(cmd,now){
    const A=stageAutoSpec(),st=stageState();
    if(!cmd||typeof cmd!=='object'||typeof cmd.id!=='string'||!A.commandIdPattern.test(cmd.id))return;
    if(cmd.id===st.autoSeenId)return;
    st.autoSeenId=cmd.id;
    const action=A.actions.indexOf(cmd.action)>=0?cmd.action:'';
    const who=stageAutoIdentity(cmd),cur=st.autoOwner;
    if(!action||!who)return stageAutoAck(cmd,false,'malformed command',now);
    // Stop is the safe direction: the owner may always end its own lease.
    if(action==='stop'){
      if(cur&&cur.owner===who.owner){stageAutoRevoke('stopped by its owner');return stageAutoAck(cmd,true,'',now)}
      return stageAutoAck(cmd,false,'not the current owner',now);
    }
    const at=Number(cmd.at);
    if(!Number.isFinite(at)||at>now||now-at>A.commandMaxAgeMs)return stageAutoAck(cmd,false,'command is not recent',now);
    if(stageClean(cmd.helperId)!==st.helperId)return stageAutoAck(cmd,false,'command is for another helper',now);
    if(st.ownership!=='owned'||!st.armed||who.warehouse!==st.warehouse)return stageAutoAck(cmd,false,'helper facility does not match',now);
    if(st.blocked||st.autoFault)return stageAutoAck(cmd,false,st.blocked?'helper is blocked':'automatic staging is disabled on this helper ('+st.autoFault+')',now);
    const live=stageAutoLive(now),same=live&&stageAutoSame(cur,who);
    if(action==='enable'&&live&&!same)return stageAutoAck(cmd,false,'another owner holds a live lease',now);
    if(action==='renew'&&!same)return stageAutoAck(cmd,false,'renew needs the same live owner',now);
    const consent=stageAutoConsentValid(who,st.helperId,now);
    if(!consent.ok){
      if(same)stageAutoRevoke(consent.reason);
      return stageAutoAck(cmd,false,consent.reason,now);
    }
    const m=stageMono();
    st.autoOwner={owner:who.owner,scope:who.scope,warehouse:who.warehouse,expiresAt:now+A.leaseMs,
      monoExpires:Number.isFinite(m)?m+A.leaseMs:NaN,since:same?Number(cur.since):now};
    return stageAutoAck(cmd,true,'',now);
  }
  // Bounded housekeeping for per-owner consent keys: owners are unique per enable, so a
  // withdrawn or long-stale record can never become valid again. Deleting one only ever makes
  // consent missing, which revokes.
  function stageAutoCleanup(now){
    const A=stageAutoSpec(),st=stageState();
    if(now<Number(st.autoCleanAt)||typeof GM_listValues!=='function')return;
    st.autoCleanAt=now+60000;
    try{
      const keys=GM_listValues();let n=0;
      for(const key of Array.isArray(keys)?keys:[]){
        if(n>=25)break;
        if(typeof key!=='string'||key.indexOf(A.consentPrefix)!==0)continue;
        if(st.autoOwner&&key===stageAutoConsentKey(st.autoOwner.owner))continue;
        const v=stageGmRead(key,null),at=v&&typeof v==='object'?Number(v.at):NaN;
        if(!Number.isFinite(at)||now-at>A.leaseMs*8||(v.enabled!==true&&now-at>A.leaseMs)){stageGmDelete(key);n++}
      }
    }catch(err){stageLog('auto consent cleanup',err)}
  }
  // Runs on every helper tick, before a request is accepted, and again just before a scan.
  function stageAutoProcessControl(now){
    const st=stageState(),at=now||stageNow();
    try{
      if(st.autoOwner&&!stageAutoLive(at))stageAutoRevoke('lease expired');
      if(st.ownership==='owned')stageAutoProcess(stageGmRead(stageAutoSpec().controlKey,null),at);
      const o=st.autoOwner;
      if(o){
        if(st.ownership!=='owned'||!st.armed||o.warehouse!==st.warehouse)stageAutoRevoke('helper facility changed');
        else if(st.blocked||st.autoFault)stageAutoRevoke(st.blocked?'helper is blocked':'automatic staging disabled');
        else{const c=stageAutoConsentValid(o,st.helperId,at);if(!c.ok)stageAutoRevoke(c.reason)}
      }
    }catch(err){stageLog('auto control',err);stageAutoRevoke('lease check failed')}
    if(st.ownership==='owned'&&!st.active)stageAutoCleanup(at);
  }
  // Helper-side authority for one auto request, at acceptance and immediately before the
  // first source scan. Any doubt refuses.
  function stageAutoGate(rec,now,prescan){
    const A=stageAutoSpec(),st=stageState(),at=now||stageNow(),a=rec&&rec.auto;
    if(!a||typeof a!=='object'||a.protocol!==A.protocol)return{ok:false,reason:'the automatic request is malformed'};
    const who=stageAutoIdentity(a);
    if(!who||who.scope!==stageText(rec.scope,256)||who.warehouse!==stageClean(rec.warehouse))return{ok:false,reason:'the automatic request identity does not match the load'};
    stageAutoProcessControl(at);
    if(st.ownership!=='owned'||!st.armed||st.blocked||st.autoFault)return{ok:false,reason:'the helper is not available for automatic staging'};
    if(!stageAutoLive(at)||!stageAutoSame(st.autoOwner,who))return{ok:false,reason:'the requester does not hold the live automatic lease'};
    if(!(Number(rec.createdAt)>=Number(st.autoOwner.since)))return{ok:false,reason:'the request predates the current lease'};
    const consent=stageAutoConsentValid(who,st.helperId,at);
    if(!consent.ok)return{ok:false,reason:consent.reason};
    if(!stageAutoGapOpen(at))return{ok:false,reason:'the pause after a confirmed success or skippable error has not elapsed'};
    if(prescan){
      const aft=stageAft();
      if(stageStepId(aft)!==stageSpec().sourceStep||stageSourceScannable(aft)||stageInputState(aft).state!=='ready')
        return{ok:false,reason:'the Move App is not on a clean source step'};
      const msg=stageDiversionCheck(aft,true);
      if(msg.active||msg.unknown)return{ok:false,reason:'the Move App has an active or unverified message'};
    }
    return{ok:true};
  }
  function stageAutoAfterRun(req,result){
    const st=stageState(),status=stageClean(result&&result.status);
    if(st.blocked)return stageAutoRevoke('the helper is blocked');
    if(status==='success')return;
    const done=req&&stageJournalGet(req.requestId);
    if(req?.auto&&done&&done.requestId===req.requestId&&done.pallet===req.pallet&&done.destination===req.destination&&
      done.scope===req.scope&&done.warehouse===req.warehouse&&done.helperId===st.helperId&&
      done.autoSkipSafe===true&&stageAutoSkipReason(done.status,done.skipReason)&&status===done.status)return;
    const failed=['nothing-moved','source-failed','destination-failed','stopped','unknown','helper-unavailable'];
    if(req&&req.auto)stageAutoRevoke('the automatic request ended '+(status||'without a result'));
    else if(failed.indexOf(status)>=0)stageAutoRevoke('the last request ended '+status);
  }
  // Monitor side: helper and storage checks for one auto submission. Old helpers publish no
  // autoProtocol and are refused here.
  function stageAutoSubmitGate(input,req,helper,now){
    const A=stageAutoSpec(),at=now||stageNow();
    const raw=input&&input.autoOwner;
    const who=stageAutoIdentity(raw&&typeof raw==='object'?raw:{owner:raw,scope:req.scope,warehouse:req.warehouse});
    if(!who)return{ok:false,reason:'owner',message:'The automatic staging owner is missing or malformed.'};
    if(who.scope!==req.scope||who.warehouse!==req.warehouse)return{ok:false,reason:'owner',message:'The automatic staging owner is for another load or facility.'};
    if(!helper||Number(helper.autoProtocol)!==A.protocol)return{ok:false,reason:'protocol',message:'The Move App helper does not support automatic staging. Reload it with this version.'};
    const version=stageScriptVersion();
    if(!version||stageClean(helper.scriptVersion)!==version)return{ok:false,reason:'version',message:'The Move App helper runs version '+(stageClean(helper.scriptVersion)||'unknown')+', not '+(version||'unknown')+'. Reload both tabs with the same version.'};
    const ho=stageAutoIdentity(helper.autoOwner);
    if(!ho||!stageAutoSame(ho,who)||!(Number(helper.autoOwner.expiresAt)>at))return{ok:false,reason:'owner',message:'This monitor does not hold the live automatic staging lease on the helper.'};
    if(helper.armed!==true||helper.busy===true||helper.blocked===true)return{ok:false,reason:'busy',message:'The Move App helper is busy, blocked or not configured.'};
    if(stageClean(helper.step)!==stageSpec().sourceStep||stageClean(helper.sourceScannable)||!helper.inputState||helper.inputState.state!=='ready')return{ok:false,reason:'not-ready',message:'The Move App helper is not ready on a clean source step.'};
    if(helper.readyForAuto!==true)return{ok:false,reason:'not-ready',message:'The Move App helper is not ready for automatic staging ('+(stageText(helper.readinessReason,200)||'no readiness reported')+').'};
    const consent=stageAutoConsentValid(who,helper.helperId,at);
    if(!consent.ok)return{ok:false,reason:'consent',message:'Automatic staging consent is not current ('+consent.reason+').'};
    if(at<Math.max(stageAutoDurableNextAt(),Number(helper.autoNextAt)||0))return{ok:false,reason:'success-pause',message:'Waiting after a confirmed success or skippable error.'};
    return{ok:true,auto:{protocol:A.protocol,owner:who.owner,scope:who.scope,warehouse:who.warehouse}};
  }
  function stageAutoRefuse(gate,req){return stageResult('rejected',gate.message,req,{auto:true,autoReason:gate.reason})}
  // Optional monitor conveniences: the controller may write the same shapes itself.
  function pmmStageAutoCommand(action,identity){
    const A=stageAutoSpec(),who=stageAutoIdentity(identity),helper=stageHelperRecord(),now=stageNow();
    if(A.actions.indexOf(action)<0||!who)return{ok:false,reason:'malformed'};
    if(!helper)return{ok:false,reason:'no-helper'};
    const cmd={id:'ac-'+now+'-'+stageRandomHex(12),action,owner:who.owner,scope:who.scope,warehouse:who.warehouse,helperId:stageClean(helper.helperId),at:now};
    if(!stageGmWrite(A.controlKey,cmd))return{ok:false,reason:'unwritable'};
    const back=stageGmRead(A.controlKey,null);
    return back&&back.id===cmd.id?{ok:true,command:cmd}:{ok:false,reason:'overwritten'};
  }
  function pmmStageAutoConsent(identity,helperId,enabled){
    const who=stageAutoIdentity(identity),now=stageNow();
    if(!who||(enabled===true&&!stageClean(helperId)))return false;
    const value={owner:who.owner,helperId:stageClean(helperId),scope:who.scope,warehouse:who.warehouse,enabled:enabled===true,at:now};
    if(!stageGmWrite(stageAutoConsentKey(who.owner),value))return false;
    const back=stageGmRead(stageAutoConsentKey(who.owner),null);
    return !!back&&back.at===now&&back.enabled===value.enabled&&back.helperId===value.helperId;
  }
  function pmmStageAutoView(){
    const now=stageNow(),h=stageHelperRecord(),live=stageHelperLive(h,now);
    const owner=h&&stageAutoIdentity(h.autoOwner)&&Number(h.autoOwner.expiresAt)>now
      ?Object.assign(stageAutoIdentity(h.autoOwner),{expiresAt:Number(h.autoOwner.expiresAt)}):null;
    return{helperId:h?stageClean(h.helperId):'',live,protocol:h?Number(h.autoProtocol)||0:0,owner,
      scriptVersion:h?stageClean(h.scriptVersion):'',readyForAuto:!!h&&live&&h.readyForAuto===true,
      readinessReason:h?(live?stageText(h.readinessReason,200):'the Move App helper heartbeat is stale'):'no Move App helper',
      readinessAt:h?Number(h.readinessAt)||0:0,
      nextAt:Math.max(stageAutoDurableNextAt(),h?Number(h.autoNextAt)||0:0),
      note:h?stageText(h.autoNote,200):'',ack:h&&h.autoAck&&typeof h.autoAck==='object'?h.autoAck:null,
      busy:!!h&&h.busy===true,blocked:!!h&&h.blocked===true,armed:!!h&&h.armed===true,warehouse:h?stageClean(h.warehouse):'',now};
  }
  // ---- monitor side ----------------------------------------------------------------------
  // Admission runs inside an exclusive Web Lock on the submitting origin, so two monitor
  // tabs on the same origin cannot both pass the checks. Monitors on two different AFT
  // origins do not share a lock scope, so admission also writes and then re-reads the single
  // request record after a short settle: the tab that does not find its own request id loses
  // and reports busy, and the helper never claims a request younger than claimSettleMs, so
  // no scan can start while a race is still settling.
  async function stageWithAdmission(fn){
    let locks=null;
    try{locks=typeof navigator!=='undefined'&&navigator&&navigator.locks?navigator.locks:null}catch{}
    if(!locks||typeof locks.request!=='function')return{ok:false};
    try{
      const out=await locks.request(stageSpec().admitLockName,{mode:'exclusive'},async()=>await fn());
      return{ok:true,value:out};
    }catch(err){stageLog('admission lock',err);return{ok:false}}
  }
  async function pmmStageSubmit(input){
    try{
      const S=stageSpec();
      if(!stageStorageReady())return stageResult('helper-unavailable','Shared storage is unavailable, so staging cannot be requested.',input);
      const valid=stageValidateInput(input);
      if(!valid.ok)return stageResult(valid.status,valid.message,input);
      const req=valid.request,now=stageNow();
      const isAuto=input.autoOwner!==undefined&&input.autoOwner!==null;
      const beforeSubmit=isAuto?input.beforeSubmit:undefined;
      const helper=stageHelperRecord();
      if(!stageHelperLive(helper,now)){const age=helper&&Number(helper.updatedAt)>0?Math.max(0,Math.round((now-Number(helper.updatedAt))/1000)):0;return stageResult('no-helper','No live Move App helper tab answered'+(age?' (last heard '+age+'s ago; that tab may be asleep or in the background)':'')+'. Open the Move App move-container job page and configure the facility there.',req)}
      if(!helper.armed)return stageResult('not-armed','Verify the Move App building and save its facility code once in that tab. No separate Arm step is required.',req);
      if(stageClean(helper.warehouse)!==req.warehouse)return stageResult('warehouse-mismatch','The Move App helper is configured for '+(stageClean(helper.warehouse)||'another facility')+', not '+req.warehouse+'.',req);
      const inFlight=stageRequestRecord();
      if(inFlight&&now-Number(inFlight.createdAt||0)<S.requestTtlMs&&!stageJournalGet(inFlight.requestId))
        return stageResult('busy','Another staging request is still in flight. Wait for it to finish.',req);
      let auto=null;
      if(isAuto){
        const gate=stageAutoSubmitGate(input,req,helper,now);
        if(!gate.ok)return stageAutoRefuse(gate,req);
        auto=gate.auto;
      }
      // A guarded pallet is only skipped by the AutoStager. An operator Stage click proceeds and
      // the helper clears that pallet's earlier guard once the new attempt has scanned.
      const prior=isAuto?stageHoldFor(req.pallet,req.warehouse):null;
      if(prior){
        let when='';try{when=new Date(Number(prior.at)||now).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}catch{when=''}
        return stageResult('duplicate','Pallet '+req.pallet+' has an unconfirmed staging attempt'+(when?' at '+when:'')+' ('+stageClean(prior.status)+' to '+(stageClean(prior.destination)||'an unknown destination')+'). AutoStager skips it for 24 hours; check it in the Move App, and click Stage on the pallet to stage it again.',req,{priorStatus:stageClean(prior.status),priorRequestId:stageClean(prior.requestId),priorDestination:stageClean(prior.destination)});
      }
      const requestId=stageNewRequestId();
      const admitted=await stageWithAdmission(async()=>{
        const live=stageRequestRecord();
        if(live&&stageNow()-Number(live.createdAt||0)<S.requestTtlMs&&!stageJournalGet(live.requestId))return'busy';
        if(auto){
          // Re-read the helper and re-run the controller synchronously, so nothing can change
          // between the last check and the write.
          const fresh=stageHelperRecord();
          if(!stageHelperLive(fresh,stageNow())||stageClean(fresh.helperId)!==stageClean(helper.helperId))return{auto:{ok:false,reason:'owner',message:'The Move App helper changed before the automatic request was sent.'}};
          const again=stageAutoSubmitGate(input,req,fresh,stageNow());
          if(!again.ok)return{auto:again};
          let allowed=false;
          try{allowed=typeof beforeSubmit==='function'&&beforeSubmit({requestId,pallet:req.pallet,destination:req.destination,scope:req.scope,warehouse:req.warehouse,owner:auto.owner})===true}
          catch(err){stageLog('auto beforeSubmit',err);allowed=false}
          if(!allowed)return{auto:{ok:false,reason:'controller',message:'The automatic staging controller withdrew this move before it was sent.'}};
          auto=again.auto;
        }
        const at=stageNow();
        const record={v:1,requestId,helperId:stageClean(helper.helperId),pallet:req.pallet,destination:req.destination,
          scope:req.scope,warehouse:req.warehouse,status:'queued',createdAt:at,expiresAt:at+S.requestTtlMs};
        if(auto)record.auto=auto;
        if(!stageGmWrite(S.requestKey,record))return'unwritable';
        const back=stageRequestRecord();
        if(!back||stageClean(back.requestId)!==requestId)return'lost';
        await stageSleep(S.admitSettleMs);
        const settled=stageRequestRecord();
        if(!settled||stageClean(settled.requestId)!==requestId)return'lost';
        return'admitted';
      });
      if(!admitted.ok)return stageResult('helper-unavailable','Web Locks is unavailable in this browser, so staging requests cannot be admitted safely.',Object.assign({requestId},req));
      if(admitted.value&&typeof admitted.value==='object'&&admitted.value.auto)return stageAutoRefuse(admitted.value.auto,Object.assign({requestId},req));
      if(admitted.value==='busy')return stageResult('busy','Another staging request is still in flight. Wait for it to finish.',Object.assign({requestId},req));
      if(admitted.value==='unwritable')return stageResult('helper-unavailable','The staging request could not be written to shared storage.',Object.assign({requestId},req));
      if(admitted.value==='lost'){
        // A delayed settle continuation can run after the helper finished and cleared this
        // request. Reconcile only its exact durable outcome; never replay or borrow success.
        const done=stageJournalGet(requestId);
        if(done&&stageClean(done.requestId)===requestId&&stageClean(done.pallet)===req.pallet&&
          stageClean(done.destination)===req.destination&&stageText(done.scope,256)===req.scope&&
          stageClean(done.warehouse)===req.warehouse&&stageClean(done.helperId)===stageClean(helper.helperId)&&
          stageIsTerminal(done.status)&&Number.isFinite(Number(done.at))&&Number(done.at)>=now&&Number(done.at)<=stageNow())
          return stageResult(done.status,done.message,Object.assign({requestId},req),{phase:stageClean(done.phase)});
        return stageResult('busy','The staging request record changed or disappeared during admission, with no matching confirmed outcome. This does not establish whether another tab was involved or whether the move ran. Check Move App; nothing is retried automatically.',Object.assign({requestId},req));
      }
      const deadline=stageNow()+S.submitWaitMs;
      for(;;){
        const done=stageJournalGet(requestId);
        if(done)return stageResult(done.status,done.message,Object.assign({requestId},req),{phase:stageClean(done.phase)});
        if(stageNow()>=deadline)break;
        await stageSleep(S.pollMs);
      }
      // Timeout boundary: the request is only withdrawn under the admission lock, after a
      // last look at the journal and the progress record, so a helper that claimed it in the
      // same instant is never left running an unknown, unreported move.
      const withdraw=await stageWithAdmission(async()=>{
        const done=stageJournalGet(requestId);
        if(done)return{kind:'journaled',entry:done};
        const progress=stageProgressRecord();
        if(progress&&stageClean(progress.requestId)===requestId)return{kind:'claimed',phase:stageClean(progress.phase)};
        const live=stageRequestRecord();
        if(!live||stageClean(live.requestId)!==requestId)return{kind:'gone'};
        const entry=stageJournalPut(Object.assign({requestId,status:'expired',phase:'queued',
          message:'No configured Move App helper claimed the request, so nothing was attempted.'},req));
        if(!entry)return{kind:'undurable'};
        stageClearRequest(requestId);
        return{kind:'expired',entry};
      });
      if(!withdraw.ok)return stageResult('unknown','The staging request could not be withdrawn safely, so its outcome is unknown. Nothing will be retried: check the Move App.',Object.assign({requestId},req));
      const outcome=withdraw.value;
      if(outcome.kind==='journaled')return stageResult(outcome.entry.status,outcome.entry.message,Object.assign({requestId},req),{phase:stageClean(outcome.entry.phase)});
      if(outcome.kind==='expired')return stageResult('expired',outcome.entry.message,Object.assign({requestId},req));
      if(outcome.kind==='gone')return stageResult('unknown','The staging request is no longer recorded and no outcome was journaled, so it is unknown. Nothing will be retried: check the Move App.',Object.assign({requestId},req));
      if(outcome.kind==='undurable')return stageResult('unknown','The staging request could not be withdrawn durably, so its outcome is unknown. Nothing will be retried: check the Move App.',Object.assign({requestId},req));
      const progress=outcome.kind==='claimed'?{phase:outcome.phase}:{phase:''};
      return stageResult('unknown','The Move App helper started the move but has not reported an outcome. Nothing will be retried: check the Move App and the helper panel.',Object.assign({requestId},req),{phase:stageClean(progress.phase)});
    }catch(err){
      stageLog('submit',err);
      return stageResult('helper-unavailable','The staging request failed before anything was attempted ('+stageErrText(err)+').',input);
    }
  }
  function pmmStageStatus(){
    const S=stageSpec();
    try{
      const st=stageState(),now=stageNow(),helper=stageHelperRecord(),request=stageRequestRecord(),scope=stageMoveAppScope();
      return{ok:true,host:scope.host,helperPage:scope.isHost,jobPage:scope.isJobPage,storage:stageStorageReady(),
        helper:helper?{helperId:stageClean(helper.helperId),live:stageHelperLive(helper,now),armed:helper.armed===true,
          warehouse:stageClean(helper.warehouse),ownership:stageClean(helper.ownership),step:stageClean(helper.step),
          inputState:helper.inputState||null,inputDisabled:helper.inputDisabled===true,sourceScannable:stageClean(helper.sourceScannable),busy:helper.busy===true,note:stageText(helper.note,200),
          updatedAt:Number(helper.updatedAt)||0,autoProtocol:Number(helper.autoProtocol)||0,autoOwner:helper.autoOwner||null,
          autoNextAt:Number(helper.autoNextAt)||0,autoNote:stageText(helper.autoNote,200),autoAck:helper.autoAck||null,
          scriptVersion:stageClean(helper.scriptVersion),readyForAuto:helper.readyForAuto===true,readinessReason:stageText(helper.readinessReason,200),
          readinessAt:Number(helper.readinessAt)||0,holds:helper.holds&&typeof helper.holds==='object'?helper.holds:null,holdNote:stageText(helper.holdNote,300)}:null,
        request:request?{requestId:stageClean(request.requestId),pallet:stageClean(request.pallet),
          destination:stageClean(request.destination),scope:stageText(request.scope,256),warehouse:stageClean(request.warehouse),
          createdAt:Number(request.createdAt)||0,
          pending:!stageJournalGet(request.requestId)&&now-Number(request.createdAt||0)<S.requestTtlMs}:null,
        progress:stageProgressRecord(),
        journal:stageJournalAll().slice(-10),
        thisTab:scope.isJobPage?{ownership:st.ownership,armed:st.armed,warehouse:st.warehouse,phase:st.phase,busy:st.active,armError:st.armError}:null,
        statuses:{pending:S.pending.slice(),terminal:S.terminal.slice()}};
    }catch(err){
      stageLog('status',err);
      return{ok:false,error:stageErrText(err),statuses:{pending:S.pending.slice(),terminal:S.terminal.slice()}};
    }
  }
  // ---- Move App page access --------------------------------------------------------------
  function stageMoveAppScope(){
    const S=stageSpec();let host='',path='',search='',top=true;
    try{host=stageClean(location.hostname);path=stageClean(location.pathname);search=stageClean(location.search)}catch{}
    try{top=window.top===window}catch{top=false}
    let jobId='';
    try{jobId=stageClean(new URLSearchParams(search).get('jobId'))}catch{}
    const isHost=host===S.moveAppHost;
    return{host,path,search,jobId,isHost,isJobPage:isHost&&top&&path===S.jobPath&&jobId===S.jobId};
  }
  function stagePage(){
    try{if(typeof unsafeWindow!=='undefined'&&unsafeWindow)return unsafeWindow}catch{}
    try{return window}catch{}
    return null;
  }
  function stageAft(){
    try{const page=stagePage(),aft=page&&page.aft;return aft&&typeof aft==='object'?aft:null}
    catch(err){stageLog('aft lookup',err);return null}
  }
  function stageUtil(){
    try{
      const page=stagePage();if(!page)return null;
      const aft=page.aft;
      if(page.Util&&typeof page.Util==='object')return page.Util;
      if(aft&&aft.Util&&typeof aft.Util==='object')return aft.Util;
    }catch{}
    return null;
  }
  // Firefox keeps content-script functions out of the page realm, so a plain assignment is
  // not callable by page code. exportFunction is used when the engine provides it; the plain
  // assignment is the Chrome/Tampermonkey path.
  function stageExportInto(fn,target,name){
    if(!target)return null;
    if(typeof exportFunction==='function'){
      try{
        const out=name?exportFunction(fn,target,{defineAs:name,allowCallbacks:true}):exportFunction(fn,target,{allowCallbacks:true});
        return out||(name?target[name]:fn);
      }catch(err){stageLog('exportFunction',err)}
    }
    try{if(name){target[name]=fn;return target[name]}}catch(err){stageLog('assign '+name,err);return null}
    return fn;
  }
  function stageExportCallback(fn){
    if(typeof exportFunction==='function'){
      try{return exportFunction(fn,stagePage()||globalThis,{allowCallbacks:true})}catch(err){stageLog('export callback',err)}
    }
    return fn;
  }
  function stageStepId(aft){try{const s=aft&&aft.activeStep;return stageClean(s&&s.id)}catch{return ''}}
  function stageSession(aft){
    // The step's own session is authoritative; aft.session is only a fallback.
    try{const s=(aft&&aft.activeStep&&aft.activeStep.session)||(aft&&aft.session)||null;return s&&typeof s==='object'?s:null}catch{return null}
  }
  function stageSessionId(session){
    try{return stageClean(session&&(session.id||session.sessionId||session.moveSessionId||session.workflowId))}catch{return ''}
  }
  function stageSourceScannable(aft){try{return stageClean(stageSession(aft)&&stageSession(aft).sourceScannableId)}catch{return ''}}
  // Distinguish unknown integration state from the app explicitly disabling scans.
  // Live probe: all three segments are own data properties. Never invoke getters/methods.
  function stageOwnValue(obj,key){
    if(!obj||typeof obj!=='object')return undefined;
    const d=Object.getOwnPropertyDescriptor(obj,key);
    return d&&Object.prototype.hasOwnProperty.call(d,'value')?d.value:undefined;
  }
  function stageInputState(aft){
    try{
      const registry=stageOwnValue(aft,'registry'),ed=stageOwnValue(registry,'eventDelegator');
      const value=stageOwnValue(ed,'isInputDisabled');
      if(value===false)return{state:'ready',reason:''};
      if(value===true)return{state:'disabled',reason:'Move App reports input disabled'};
      return{state:'unknown',reason:'aft.registry.eventDelegator.isInputDisabled is not a readable boolean'};
    }catch(_){return{state:'unknown',reason:'Move App readiness could not be read'}}
  }
  function stageVisibleElement(n){
    try{
      if(!n||!n.isConnected||!n.getClientRects().length)return false;
      for(let p=n;p&&p.nodeType===1;p=p.parentElement){
        if(p.hidden||p.getAttribute('aria-hidden')==='true')return false;
        const css=getComputedStyle(p);
        if(css.display==='none'||css.visibility==='hidden'||css.visibility==='collapse'||css.opacity==='0')return false;
      }
      return true;
    }catch(_){return false}
  }
  function stageInputDisabled(aft){return stageInputState(aft).state!=='ready'}
  // Source admission alone may exempt the exact normal instruction. Never exempt a
  // warning/dialog node, a container holding one, or text with any additional content.
  function stageNormalSourcePrompt(n,selector,aft){
    if(selector!==".instruction-container"&&selector!==".presenter-container")return false;
    if(stageStepId(aft)!==stageSpec().sourceStep||stageSourceScannable(aft)||stageInputDisabled(aft))return false;
    const strict=stageSpec().diversionSelectors.filter(s=>s!==".instruction-container"&&s!==".presenter-container").join(",");
    if(n.closest(strict)||n.querySelector(strict))return false;
    // Do not use stageText here: truncation could hide additional warning content.
    return String(n.textContent||"").replace(/\s+/g," ").trim().toLowerCase()==="scan source container";
  }
  // Source admission only. Unlike result-banner visibility, this deliberately does
  // not treat missing rectangles, opacity, visibility or display:contents as hidden.
  // One display:none ancestor excludes the whole subtree from layout. No idle observer.
  function stageMessageDisplayState(node){
    try{
      const doc=typeof document!=="undefined"?document:null;
      if(!doc||!node||node.ownerDocument!==doc||!node.isConnected)
        return{hidden:false,unknown:true};
      let p=node;
      for(let depth=0;p&&depth<64;depth++,p=p.parentElement){
        if(p.nodeType!==1)return{hidden:false,unknown:true};
        const css=getComputedStyle(p),display=css&&css.display;
        if(typeof display!=="string"||!display.trim())return{hidden:false,unknown:true};
        if(display==="none")return{hidden:true,unknown:false};
        if(p===doc.documentElement)return{hidden:false,unknown:false};
      }
      // Disconnected/unexpected ancestry or depth limit: never assume no warning.
      return{hidden:false,unknown:true};
    }catch(_){return{hidden:false,unknown:true}}
  }
  function stageRenderedDiversionCheck(aft,allowSourcePrompt){
    try{
      const doc=typeof document!=="undefined"?document:null;
      if(!doc||typeof doc.querySelectorAll!=="function")return{active:false,unknown:true,reason:"message inspection unavailable"};
      for(const sel of stageSpec().diversionSelectors){
        const nodes=doc.querySelectorAll(sel);
        for(const n of nodes){
          if(!n)continue;
          const hidden=n.hidden===true||n.getAttribute("aria-hidden")==="true";
          if(hidden)continue;
          const text=stageClean(n.textContent);
          if(!text)continue;
          if(allowSourcePrompt){
            // Recheck admission context before applying the source-only exemption.
            if(stageStepId(aft)!==stageSpec().sourceStep||stageSourceScannable(aft)||stageInputDisabled(aft))
              return{active:false,unknown:true,reason:"source admission context changed"};
            const display=stageMessageDisplayState(n);
            if(display.unknown)return{active:false,unknown:true,reason:"message display inspection uncertain in "+sel};
            if(display.hidden)continue;
          }
          if(allowSourcePrompt&&stageNormalSourcePrompt(n,sel,aft))continue;
          return{active:true,reason:"message content in "+sel};
        }
      }
      return{active:false,reason:""};
    }catch(err){stageLog("rendered message check",err);return{active:false,unknown:true,reason:"message inspection failed"}}
  }
  function stageDiversionCheck(aft,allowSourcePrompt){
    try{
      const step=aft&&aft.activeStep;
      for(const pair of [["activeStep",step],["aft",aft]]){
        const label=pair[0],obj=pair[1];if(!obj)continue;
        const v=obj.isActivePresenter;
        if(typeof v==="function"){
          if(v.call(obj)===true)return{active:true,reason:label+".isActivePresenter"};
        }else if(v===true)return{active:true,reason:label+".isActivePresenter"};
        if(obj.activeDiversion)return{active:true,reason:label+".activeDiversion"};
        const d=obj.diversion;
        if(d&&(d.active===true||stageClean(d.status)))return{active:true,reason:label+".diversion"};
      }
    }catch(err){stageLog("diversion state",err);return{active:false,unknown:true,reason:"diversion state unreadable"}}
    return stageRenderedDiversionCheck(aft,allowSourcePrompt);
  }
  // Confirmation uses the strict path, without the source-instruction exemption.
  function stageDiversionActive(aft){return stageDiversionCheck(aft,false).active}
  function stageTranslate(aft,message){
    const raw=stageText(message,256);
    if(!raw)return '';
    try{
      if(aft&&typeof aft.translate==='function'){
        const t=aft.translate(raw);
        if(typeof t==='string'&&stageClean(t))return stageText(t,256);
      }
    }catch(err){stageLog('translate',err)}
    // Raw message codes are unknown, so a single token with no spaces is treated as an
    // untranslated code and is never matched against the expected confirmation text.
    return /\s/.test(raw)?raw:'';
  }
  function stageDetailedMessage(aft,call){
    const res=call&&call.response;
    if(!res)return '';
    const util=stageUtil();
    if(util&&typeof util.translateHelper==='function'){
      try{
        const params=call.raw?call.raw.detailedMessageParameters:undefined;
        const t=util.translateHelper(res.detailedMessage,params);
        if(typeof t==='string'&&stageClean(t))return stageText(t,512);
      }catch(err){stageLog('translateHelper',err)}
    }
    return stageTranslate(aft,res.detailedMessage);
  }
  // The only automatic repeat is authorised here, and only by the correlated response of
  // this operation: an explicit failed result, an explicit confirmation-required marker, and
  // both messages exactly the routine confirmation wording after translation. Page text is
  // never used as evidence, because the DOM can hold a stale or piled-up warning, and this
  // never reports success - it only permits one more destination scan.
  function stageRoutineConfirmation(aft,call){
    const S=stageSpec(),res=call&&call.response;
    if(!res)return{ok:false,reason:'there was no correlated response'};
    if(res.success!==false)return{ok:false,reason:'the response did not report an explicit failure'};
    if(!(res.confirmationRequired===true||stageNorm(res.status)===stageNorm(S.confirmStatus)))
      return{ok:false,reason:'the response was not a confirmation request'};
    const simple=stageNorm(stageTranslate(aft,res.simpleMessage));
    if(!simple)return{ok:false,reason:'the confirmation message could not be translated'};
    if(simple!==stageNorm(S.confirmSimple))return{ok:false,reason:'the confirmation headline was not the expected routine confirmation'};
    const detailed=stageNorm(stageDetailedMessage(aft,call));
    if(!detailed)return{ok:false,reason:'the confirmation detail could not be translated'};
    if(!S.confirmDetailed.test(detailed))return{ok:false,reason:'the confirmation detail was not the expected routine confirmation'};
    return{ok:true,via:'translated',text:detailed};
  }
  // ---- passive aft.ajax observation ------------------------------------------------------
  function stageAjaxDetails(args){
    let url='',data=null;
    try{
      for(let i=0;i<args.length;i++){
        const a=args[i];
        if(typeof a==='string'){if(!url)url=stageText(a,256);continue}
        if(!a||typeof a!=='object')continue;
        if(typeof a.url==='string'&&!url)url=stageText(a.url,256);
        if(a.data&&typeof a.data==='object'){data=a.data;continue}
        if(!data&&typeof a.url!=='string')data=a;
      }
    }catch(err){stageLog('ajax args',err)}
    return{url,data};
  }
  // Only the identifiers needed for correlation are copied. No tokens, headers, cookies or
  // session values are read or stored, and nothing from here is ever persisted.
  function stageSafeData(data){
    const out={source:'',destination:'',confirmed:'',values:[]};
    if(!data||typeof data!=='object')return out;
    try{
      out.source=stageClean(data.sourceScannableId);
      out.destination=stageClean(data.destinationScannableId);
      out.confirmed=stageClean(data.confirmed);
      for(const key of ['scannableId','containerId','barcode','sourceScannableId','destinationScannableId']){
        const v=data[key];
        if(typeof v==='string'||typeof v==='number'){
          const s=stageClean(v);
          if(s&&out.values.indexOf(s)<0)out.values.push(s);
        }
      }
    }catch(err){stageLog('ajax data',err)}
    return out;
  }
  function stageSafeResult(res){
    const out={success:null,status:'',simpleMessage:'',detailedMessage:'',confirmationRequired:false};
    if(!res||typeof res!=='object')return out;
    try{
      if(typeof res.success==='boolean')out.success=res.success;
      out.status=stageText(res.status,64);
      out.simpleMessage=stageText(res.simpleMessage,256);
      out.detailedMessage=stageText(res.detailedMessage,256);
      out.confirmationRequired=res.confirmationRequired===true;
    }catch(err){stageLog('ajax result',err)}
    return out;
  }
  function stageRecordCall(rec){
    const st=stageState(),S=stageSpec();
    st.calls.push(rec);
    if(st.calls.length>S.maxCalls)st.calls.splice(0,st.calls.length-S.maxCalls);
    return rec;
  }
  // Extra observers only. The page's own callbacks are never replaced, wrapped, reordered or
  // swallowed, and the deferred is handed back exactly as the original returned it.
  function stageObserveDeferred(deferred,rec){
    try{
      if(!deferred||typeof deferred.done!=='function')return deferred;
      deferred.done(stageExportCallback(function(result){
        try{rec.raw=result;rec.response=stageSafeResult(result);rec.resolvedAt=stageNow()}catch(err){stageLog('observe done',err)}
      }));
      if(typeof deferred.fail==='function')deferred.fail(stageExportCallback(function(){
        try{rec.failed=true;rec.resolvedAt=stageNow()}catch{}
      }));
    }catch(err){stageLog('observe deferred',err)}
    return deferred;
  }
  function stageInstallAjaxObserver(){
    const st=stageState();
    if(st.ajaxWrapped)return true;
    const aft=stageAft();
    if(!aft||typeof aft.ajax!=='function')return false;
    const original=aft.ajax;
    const wrapper=function(){
      let rec=null;
      try{
        const d=stageAjaxDetails(arguments);
        if(d.url)rec=stageRecordCall({seq:++st.callSeq,url:d.url,data:stageSafeData(d.data),startedAt:stageNow(),response:null,raw:null,failed:false,resolvedAt:0});
        if(rec&&stageRelevantCall(rec)){rec.relevantSeq=++st.relevantSeq;stageStartResultRenderWatch(rec)}
      }catch(err){stageLog('observe request',err)}
      const out=original.apply(this,arguments);
      if(rec)stageObserveDeferred(out,rec);
      return out;
    };
    if(!stageExportInto(wrapper,aft,'ajax'))return false;
    st.ajaxOriginal=original;st.ajaxWrapper=aft.ajax;st.ajaxWrapped=true;
    return true;
  }
  function stageUninstallAjaxObserver(){
    stageStopResultWatch();
    const st=stageState();
    if(!st.ajaxWrapped)return;
    try{
      const aft=stageAft();
      // Something else wrapped on top: leave the chain alone rather than break the page.
      if(aft&&aft.ajax===st.ajaxWrapper)aft.ajax=st.ajaxOriginal;
    }catch(err){stageLog('restore ajax',err)}
    st.ajaxWrapped=false;st.ajaxWrapper=null;st.ajaxOriginal=null;
  }
  function stageFindCall(pathPart,sinceTs,predicate){
    const st=stageState();
    for(let i=st.calls.length-1;i>=0;i--){
      const c=st.calls[i];
      if(!c||Number(c.startedAt)<Number(sinceTs||0))continue;
      if(String(c.url||'').indexOf(pathPart)<0)continue;
      let ok=true;try{ok=!predicate||predicate(c)===true}catch{ok=false}
      if(ok)return c;
    }
    return null;
  }
  async function stageAwaitCall(pathPart,sinceTs,predicate,timeoutMs){
    const S=stageSpec(),deadline=stageNow()+(Number(timeoutMs)||S.responseTimeoutMs);
    for(;;){
      const c=stageFindCall(pathPart,sinceTs,predicate);
      if(c&&(c.resolvedAt||c.failed))return c;
      if(stageNow()>=deadline)return null;
      await stageSleep(S.pollMs);
    }
  }
  async function stageAwait(predicate,timeoutMs){
    const S=stageSpec(),deadline=stageNow()+(Number(timeoutMs)||S.stepSettleMs);
    for(;;){
      let ok=false;try{ok=predicate()===true}catch(err){stageLog('await',err)}
      if(ok)return true;
      if(stageNow()>=deadline)return false;
      await stageSleep(S.pollMs);
    }
  }
  function stageMatchesSource(call,req){
    const d=call&&call.data;
    return !!d&&(d.source===req.pallet||d.values.indexOf(req.pallet)>=0);
  }
  function stageMatchesMove(call,req,confirmed){
    const d=call&&call.data;
    return !!d&&!!req&&d.source===req.pallet&&d.destination===req.destination&&d.confirmed===confirmed;
  }
  function stageScanAvailable(aft){try{return typeof(aft&&aft.scan)==='function'}catch{return false}}
  // The caller marks the run as having acted before calling this, because a throw can happen
  // after the page has already handled the scan: an error is never evidence of no effect.
  function stageScan(aft,barcode){
    if(!stageScanAvailable(aft))return{ok:false,acted:false,reason:'The Move App scan entry point is unavailable.'};
    try{
      aft.scan(String(barcode));
      return{ok:true,acted:true};
    }catch(err){return{ok:false,acted:true,reason:'The Move App scan handler reported an error ('+stageErrText(err)+').'}}
  }
  // Only this correlated response, never an existing green DOM banner.
  function stageMovedCount(aft,call){
    const res=call&&call.response;if(!res)return null;
    const texts=[stageTranslate(aft,res.simpleMessage),stageDetailedMessage(aft,call)];
    const util=stageUtil();
    try{if(util&&typeof util.translateHelper==='function')texts.push(util.translateHelper(res.simpleMessage,call.raw&&call.raw.simpleMessageParameters))}catch(_){}
    const counts=[];
    for(const text of texts){
      const m=stageNorm(text).match(/^(\d{1,9}|\d{1,3}(?:,\d{3})+) containers? moved\.?$/);
      if(m){const n=Number(m[1].replace(/,/g,''));if(Number.isSafeInteger(n))counts.push(n)}
    }
    return counts.length&&counts.every(n=>n===counts[0])?counts[0]:null;
  }
  // Exact leaf-span result text only. Baselines include hidden stale banners.
  // Text is checked before layout. Bounded scan, no idle observer.
  function stageBannerScan(requireVisible){
    try{
      const spans=document.querySelectorAll("span");
      if(spans.length>800)return{ok:false,items:[]};
      const items=[];
      for(const n of spans){
        if(n.closest("#pmm-stage-panel")||n.children.length)continue;
        const text=stageClean(n.textContent);
        if(text.length>80)continue;
        const m=text.match(/^(\d{1,6}) containers? moved\.?$/i);
        if(!m||(requireVisible&&!stageVisibleElement(n)))continue;
        items.push({node:n,count:Number(m[1])});
      }
      return{ok:true,items};
    }catch(_){return{ok:false,items:[]}}
  }
  function stageResultBanner(){
    const s=stageBannerScan(true);
    return s.ok&&s.items.length<=1?{ok:true,item:s.items[0]||null}:{ok:false};
  }
  // Observe rendering only while one destination request is in flight. Numeric equality
  // is not staleness: a new result node can report the same count as the previous move.
  function stageStopResultWatch(){
    const w=stageState().resultWatch;
    try{if(w&&w.observer)w.observer.disconnect()}catch(_){}
    if(w){w.observer=null;w.fresh=null;w.baseline=null;w.seen=null;w.domOk=false}
  }
  function stageBeginResultWatch(req,confirmed){
    const st=stageState(),prior=st.resultWatch;
    const seen=prior&&prior.requestId===req.requestId&&prior.seen?prior.seen:new Map();
    let baselineOk=!(prior&&prior.requestId===req.requestId&&prior.baselineOk===false);
    stageStopResultWatch();
    try{
      const spans=document.querySelectorAll('span');
      if(spans.length>800)baselineOk=false;
      else for(const n of spans)if(!seen.has(n))seen.set(n,stageClean(n.textContent));
      if(seen.size>2400)baselineOk=false;
    }catch(_){baselineOk=false}
    st.resultWatch={requestId:req.requestId,confirmed,afterRelevant:st.relevantSeq,seen,baselineOk,
      call:null,observer:null,domOk:false,baseline:null,fresh:null,mutations:0,revision:0};
  }
  function stageResultRenderRecords(w,records){
    try{
      if(!w.domOk||!w.call||stageState().resultWatch!==w)return;
      if((w.mutations+=records.length)>2000){w.domOk=false;return}
      const candidates=new Set();
      for(const m of records){
        if(m.type==='childList'){
          for(const added of m.addedNodes){
            if(added.nodeType!==1)continue;
            if(added.matches('span'))candidates.add(added);
            const spans=added.querySelectorAll('span');
            if(spans.length>800){w.domOk=false;return}
            for(const span of spans)candidates.add(span);
          }
          // Existing leaf spans qualify only when their text changed, not a detach/reinsert.
          if(m.target.nodeType===1&&m.target.matches('span'))candidates.add(m.target);
        }else if(m.type==='characterData'&&m.target.parentElement?.matches('span')){
          candidates.add(m.target.parentElement);
        }
      }
      if(candidates.size>800){w.domOk=false;return}
      for(const n of candidates){
        if(!n.isConnected||n.children.length||n.closest('#pmm-stage-panel'))continue;
        const text=stageClean(n.textContent),old=w.baseline.get(n);
        if(!w.seen.has(n))w.seen.set(n,text);
        if(w.seen.size>2400){w.domOk=false;return}
        if(!/^(\d{1,6}) containers? moved\.?$/i.test(text)){
          w.fresh.delete(n);continue;
        }
        // Never accept a pre-existing node reattached unchanged, or a visibility-only change.
        if(old===text){w.fresh.delete(n);continue}
        w.fresh.set(n,{text,revision:++w.revision});
      }
    }catch(_){w.domOk=false}
  }
  function stageStartResultRenderWatch(call){
    const st=stageState(),w=st.resultWatch;
    if(!w||!st.active||w.requestId!==st.currentId||!['false','true'].includes(w.confirmed)||
      call.relevantSeq!==w.afterRelevant+1||!stageMatchesMove(call,stageRequestRecord(),w.confirmed))return;
    try{
      if(!w.baselineOk||typeof MutationObserver!=='function'||!document.body)return;
      const spans=document.querySelectorAll('span');if(spans.length>800)return;
      w.baseline=new Map(w.seen);
      for(const n of spans)w.baseline.set(n,stageClean(n.textContent));
      if(w.baseline.size>2400)return;
      w.fresh=new Map();w.call=call;w.domOk=true;
      w.observer=new MutationObserver(records=>stageResultRenderRecords(w,records));
      w.observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    }catch(_){w.domOk=false;try{w.observer?.disconnect()}catch(_){}}
  }
  function stageFreshResultToken(req,call,item){
    const st=stageState(),w=st.resultWatch;
    if(!w||!w.domOk||w.call!==call||!w.observer||!item||!stageResultCallIsolated(req,call))return null;
    stageResultRenderRecords(w,w.observer.takeRecords());
    if(!w.domOk)return null;
    const token=w.fresh.get(item.node);
    return token&&token.text===stageClean(item.node.textContent)?token:null;
  }
  function stageResultDomContext(req,call){
    const st=stageState(),a=stageAft(),live=stageRequestRecord();
    return st.active&&st.ownership==='owned'&&st.armed&&st.warehouse===req.warehouse&&
      stageMoveAppScope().isJobPage&&!!live&&live.requestId===req.requestId&&live.helperId===st.helperId&&
      stageOpKey(live)===stageOpKey(req)&&stageResultCallIsolated(req,call)&&
      !!st.failureWatch&&!st.failureWatch.interrupted&&stageSession(a)===st.sessionRef&&
      stageSessionId(stageSession(a))===st.sessionId&&stageStepId(a)===stageSpec().sourceStep&&
      !stageSourceScannable(a)&&stageInputState(a).state==='ready';
  }
  function stageResultCallIsolated(req,call){
    const st=stageState(),w=st.resultWatch;
    if(!w||w.requestId!==req.requestId||st.currentId!==req.requestId||!stageMatchesMove(call,req,w.confirmed))return false;
    // Monotonic sequence is independent of the bounded diagnostic call buffer.
    return call.relevantSeq===w.afterRelevant+1&&st.relevantSeq===call.relevantSeq;
  }
  function stageRelevantCall(call){
    const u=String(call&&call.url||""),S=stageSpec();
    return u.indexOf(S.getContainerPath)>=0||u.indexOf(S.moveAllPath)>=0;
  }
  async function stageFinishMoveResult(req,call,phase){
    const st=stageState(),S=stageSpec();
    let count=stageMovedCount(stageAft(),call);
    if(!stageResultCallIsolated(req,call))
      return stageFinish(req,'unknown','The move response overlapped other workflow activity. Check Move App; nothing will be retried.',phase);
    // Preserve the direct correlated message path. DOM fallback requires explicit final success.
    if(count===null&&call.response&&call.response.success===true&&call.response.confirmationRequired!==true){
      const deadline=stageNow()+S.stepSettleMs;
      while(stageNow()<deadline){
        if(!stageResultCallIsolated(req,call))break;
        const now=stageResultBanner(),token=now.ok?stageFreshResultToken(req,call,now.item):null;
        if(token&&stageResultDomContext(req,call)){
          // Require the same candidate across a settling interval, then recheck isolation.
          await stageSleep(S.pollMs);
          const settled=stageResultBanner();
          if(stageResultDomContext(req,call)&&settled.ok&&settled.item&&
            settled.item.node===now.item.node&&settled.item.count===now.item.count&&
            stageFreshResultToken(req,call,settled.item)===token){
            count=now.item.count;break;
          }
        }
        await stageSleep(S.pollMs);
      }
    }
    if(!stageResultCallIsolated(req,call))count=null;
    if(count===0){
      // Let Move App settle before certifying a clean source screen; never clear or reset it.
      if(req.auto)await stageSleep(S.pollMs);
      return stageFinish(req,'nothing-moved','0 containers moved. This request did not stage the pallet. Check Move App before retrying.',phase,stageAutoSkipProof(req,call,'nothing-moved'));
    }
    if(call.response&&call.response.success===true&&call.response.confirmationRequired!==true&&count>0)
      return stageFinish(req,'success',count+' containers moved from '+req.pallet+' to '+req.destination+'.',phase);
    return stageFinish(req,'unknown','Move may have completed; confirmation unavailable. Verify the destination in Move App before retrying. No automatic retry was sent.',phase);
  }
  function stageResponseMessage(aft,call){
    const res=call&&call.response;
    if(!res)return '';
    const simple=stageTranslate(aft,res.simpleMessage),detailed=stageDetailedMessage(aft,call);
    return stageText([simple,detailed].filter(Boolean).join(' - ')||res.status,400);
  }
  // ---- helper readiness ------------------------------------------------------------------
  function stageReadiness(aft,req){
    const S=stageSpec();
    if(!aft)return{ok:false,transient:true,reason:'The Move App workflow is not loaded yet.'};
    const input=stageInputState(aft);
    if(input.state!=='ready')return{ok:false,transient:true,reason:input.reason};
    const step=stageStepId(aft),source=stageSourceScannable(aft);
    if(!step)return{ok:false,transient:true,reason:'The Move App has no active step yet.'};
    // Only a clean source step is ever accepted. An operation already under way, even one
    // whose source happens to be the requested pallet, belongs to the operator.
    if(step===S.sourceStep){
      if(source)return{ok:false,transient:false,reason:'A source container is already scanned in the Move App, so the helper will not take over.'};
      const message=stageDiversionCheck(aft,true);
      if(message.active||message.unknown)return{ok:false,transient:false,reason:'Move App message guard blocked staging ('+message.reason+'). No scan was sent.'};
      return{ok:true,phase:'source'};
    }
    if(step===S.destinationStep)return{ok:false,transient:false,reason:'The Move App already has an operation in progress ('+(source||'a source container')+' is scanned), so the helper will not take over.'};
    return{ok:false,transient:false,reason:'The Move App is on '+step+', not the source container scan step.'};
  }
  // Published in every heartbeat so a controller can wait before it picks or consumes a pallet.
  // Uses the same guards as acceptance; the synchronous pre-scan gate still decides the scan.
  function stageAutoReadiness(aft){
    const st=stageState();
    try{
      if(st.ownership!=='owned')return{ready:false,reason:'this tab is not the live helper'};
      if(!st.armed)return{ready:false,reason:'the helper facility is not configured'};
      if(st.blocked)return{ready:false,reason:'the helper is blocked after an unrecorded outcome'};
      if(st.autoFault)return{ready:false,reason:'automatic staging is disabled on this helper ('+st.autoFault+')'};
      if(st.active)return{ready:false,reason:'the helper is running a request'};
      if(!Number.isFinite(stageMono()))return{ready:false,reason:'the monotonic clock is unavailable, so pauses cannot be enforced'};
      const r=stageReadiness(aft,null);
      if(!r.ok)return{ready:false,reason:stageText(r.reason,200)||'the Move App is not ready'};
      return{ready:true,reason:''};
    }catch(err){stageLog('auto readiness',err);return{ready:false,reason:'readiness could not be checked'}}
  }
  async function stageAwaitReady(req){
    const S=stageSpec(),deadline=stageNow()+S.readyWaitMs;
    for(;;){
      const r=stageReadiness(stageAft(),req);
      if(r.ok||!r.transient)return r;
      if(stageNow()>=deadline)return r;
      await stageSleep(S.pollMs);
    }
  }
  // 3.9.10: acknowledge one exact failed-move screen, never retry a destination.
  // DOM structure is deliberately conservative: no global C key or generic scan entry.
  function stageFailureText(node){return String(node&&node.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
  function stageFailureScreen(){
    try{
      if(!document.body)return{ok:false};
      const nodes=document.querySelectorAll('body *');
      if(nodes.length>4000)return{ok:false};
      const headlines=[],details=[];
      for(const n of nodes){
        if(n.closest('#pmm-stage-panel')||n.children.length)continue;
        const t=stageFailureText(n);
        if(t!=='move was unsuccessful'&&t!=='the move container action failed.')continue;
        if(!stageVisibleElement(n))continue;
        (t==='move was unsuccessful'?headlines:details).push(n);
      }
      if(!headlines.length&&!details.length)return{ok:true,absent:true};
      if(headlines.length!==1||details.length!==1)return{ok:false};
      for(let root=headlines[0].parentElement,depth=0;root&&root!==document.body&&depth<8;root=root.parentElement,depth++){
        if(!root.contains(details[0]))continue;
        // No extra warning, instructions, success text or other operator controls allowed.
        const text=stageFailureText(root).replace(/\s/g,'');
        if(text==='movewasunsuccessfulthemovecontaineractionfailed.')continue;
        if(!/^movewasunsuccessfulthemovecontaineractionfailed\.continuec?$/.test(text))return{ok:false};
        const controls=Array.from(root.querySelectorAll('button,a,[role="button"],[onclick],input[type="button"]'))
          .filter(n=>/^(?:continue|continue c)$/.test(stageFailureText(n)||String(n.value||'').trim().toLowerCase())&&stageVisibleElement(n));
        if(controls.length!==1)return{ok:false};
        const button=controls[0];
        if(button.disabled||button.getAttribute('aria-disabled')==='true'||button.closest('[inert]')||typeof button.click!=='function')return{ok:false};
        // Never follow a link to a job or submit a form as a substitute for Continue.
        if(button.tagName==='A'&&button.getAttribute('href')&&button.getAttribute('href')!=='#')return{ok:false};
        if(button.tagName==='BUTTON'&&button.form&&button.type!=='button')return{ok:false};
        return{ok:true,absent:false,root,button};
      }
      return{ok:false};
    }catch(_){return{ok:false}}
  }
  function stageExactMoveFailure(aft,call){
    const r=call&&call.response;
    return !!r&&!call.failed&&r.success===false&&r.confirmationRequired!==true&&
      stageNorm(r.status)!==stageNorm(stageSpec().confirmStatus)&&
      stageNorm(stageTranslate(aft,r.simpleMessage))==='move was unsuccessful'&&
      stageNorm(stageDetailedMessage(aft,call))==='the move container action failed.';
  }
  function stageFailureOwned(req,call){
    const st=stageState(),a=stageAft(),live=stageRequestRecord(),helper=stageHelperRecord();
    return st.active&&st.scanned&&st.ownership==='owned'&&st.armed&&st.warehouse===req.warehouse&&
      stageMoveAppScope().isJobPage&&st.currentId===req.requestId&&
      !!live&&live.requestId===req.requestId&&live.helperId===st.helperId&&stageOpKey(live)===stageOpKey(req)&&
      !!helper&&helper.helperId===st.helperId&&stageHelperLive(helper)&&
      !!st.failureWatch&&st.failureWatch.requestId===req.requestId&&!st.failureWatch.interrupted&&
      st.failureWatch.baselineClear&&stageSession(a)===st.sessionRef&&stageSessionId(stageSession(a))===st.sessionId&&
      stageSourceScannable(a)===req.pallet&&stageStepId(a)===stageSpec().destinationStep&&
      stageInputState(a).state==='ready'&&stageResultCallIsolated(req,call)&&
      call.startedAt>=st.runStartedAt&&call.resolvedAt>=call.startedAt&&stageExactMoveFailure(a,call);
  }
  function stageFailureWatchStart(req){
    const st=stageState();
    const w={requestId:req.requestId,interrupted:false,baselineClear:false,attempted:false};
    // Abort recovery on operator input or competing synthetic UI automation. A click
    // dispatched synchronously on our exact Continue node is the sole exemption.
    const listener=e=>{if(w.dispatching&&e.type==='click'&&e.target===w.button&&e.isTrusted===false)return;w.interrupted=true};
    const events=['pointerdown','keydown','input','change','click'];
    w.stop=()=>{for(const name of events)document.removeEventListener(name,listener,true)};
    try{
      for(const name of events)document.addEventListener(name,listener,true);
      st.failureWatch=w;
    }catch(_){w.interrupted=true;st.failureWatch=w}
  }
  function stageFailureBaseline(){
    const w=stageState().failureWatch;if(!w)return;
    const screen=stageFailureScreen();w.baselineClear=screen.ok&&screen.absent===true;
  }
  async function stageAcknowledgeMoveFailure(req,call,phase){
    const st=stageState(),w=st.failureWatch;
    const manual='Move failed. Manual attention required in Move App. No destination was rescanned; no retry was sent.';
    const finish=message=>stageFinish(req,'destination-failed',message,phase);
    if(!w||w.attempted||!stageFailureOwned(req,call))return finish(manual+' Continue was not attempted because ownership or workflow evidence was unsafe.');
    let screen=null;
    const found=await stageAwait(()=>{
      if(!stageFailureOwned(req,call))return true;
      const s=stageFailureScreen();if(s.ok&&!s.absent){screen=s;return true}return false;
    },2000);
    if(!found||!screen||!stageFailureOwned(req,call))return finish(manual+' The exact failure screen and Continue control could not be safely identified.');
    // Persist before the single page action. Reload recovery only reports unknown; no replay.
    if(!stageSetPhase(req,'acknowledging-error'))return finish(manual+' Continue was not attempted because its phase could not be saved.');
    const progress=stageProgressRecord(),hold=stageHoldFor(req.pallet,req.warehouse),fresh=stageFailureScreen();
    if(!progress||progress.requestId!==req.requestId||progress.helperId!==st.helperId||progress.phase!=='acknowledging-error'||
      !hold||hold.requestId!==req.requestId||!stageFailureOwned(req,call)||!fresh.ok||fresh.absent||
      fresh.root!==screen.root||fresh.button!==screen.button)return finish(manual+' The workflow changed before Continue; it was left untouched.');
    w.attempted=true;w.button=screen.button;w.dispatching=true;
    try{screen.button.click()}catch(_){return finish(manual+' Continue was attempted once, but its result is uncertain.')}
    finally{w.dispatching=false}
    const cleared=await stageAwait(()=>{
      if(!stageFailureOwned(req,call))return true;
      const s=stageFailureScreen();return s.ok&&s.absent;
    },3000);
    // Settling interval catches an immediate re-prompt; no idle recovery loop is installed.
    if(cleared&&stageFailureOwned(req,call))await stageSleep(stageSpec().pollMs);
    const after=stageFailureScreen();
    if(cleared&&stageFailureOwned(req,call)&&after.ok&&after.absent&&!stageVisibleElement(screen.root))
      return finish('Move failed. Continue was acknowledged once. '+req.pallet+' remains at destination scanning. Finish or cancel it manually in Move App. No destination was rescanned; no retry was sent.');
    return finish(manual+' Continue was attempted once, but the error remains or the expected destination screen could not be verified.');
  }
  // ---- the one run ----------------------------------------------------------------------
  // The phase is written durably before every page action, so a reload or crash always
  // leaves evidence that a run was in flight and the outcome must be treated as unknown.
  function stageSetPhase(req,phase){
    const st=stageState();
    st.phase=phase;
    const ok=stageWriteProgress(Object.assign({},req,{phase,helperId:st.helperId,startedAt:st.runStartedAt||stageNow()}));
    stageRenderPanel();
    return ok;
  }
  function stageFinish(req,status,message,phase,skipReason=''){
    const st=stageState(),at=phase||st.phase,scanned=st.scanned===true;
    // The entry was reserved before the first page action. It is released only once the outcome
    // is durable, so an undurable outcome keeps the pallet guarded.
    if(!stageUpdateHold(req.requestId,status)&&stageHoldGuarding(status,scanned))stageAddHold(Object.assign({},req,{status}));
    // A manual run that scanned supersedes the pallet's earlier guards: its own entry now
    // carries the current outcome (guarded again if that outcome is unknown).
    if(scanned&&!req.auto)stageHoldOperatorClear(req);
    const entry=stageJournalPut(Object.assign({},req,{status,message,phase:at,helperId:st.helperId,autoSkipSafe:!!stageAutoSkipReason(status,skipReason),skipReason}));
    st.phase='';st.currentId='';
    if(!entry){
      // The terminal record is not durable, so the request is deliberately left in place and
      // this helper stops accepting work: nothing may be retried on a guess.
      st.blocked=true;
      st.lastResult={status:'unknown',pallet:req.pallet,destination:req.destination,at:stageNow(),
        message:'The outcome ('+stageClean(status)+': '+stageText(message,200)+') could not be recorded durably, so the helper stopped. Nothing will be retried: verify in the Move App.'};
      stageRenderPanel();
      return st.lastResult;
    }
    // 4.0.4: every outcome that left the pallet in a known state is released (by:'auto-clear');
    // a proven skip keeps the 'auto-skip-proven' marker status the controller verifies.
    const proven=entry.autoSkipSafe===true&&!!stageAutoSkipReason(entry.status,entry.skipReason)&&entry.skipReason!=='not-attempted';
    if(proven||stageHoldReleasing(entry.status,scanned))stageAutoReleaseHold(req.requestId,proven?'auto-skip-proven':entry.status,scanned);
    if(entry.status==='success'||entry.autoSkipSafe===true&&stageAutoSkipReason(entry.status,entry.skipReason))stageAutoMarkOutcome(entry);
    stageClearRequest(req.requestId);
    st.lastResult={status:entry.status,message:entry.message,at:entry.at,pallet:req.pallet,destination:req.destination,requestId:req.requestId};
    stageRenderPanel();
    return st.lastResult;
  }
  async function stageRunRequest(req){
    const S=stageSpec(),st=stageState();
    st.runStartedAt=stageNow();st.sourceScanAt=NaN;st.sourceScanSeq=NaN;st.currentId=req.requestId;st.calls=[];st.resultWatch=null;st.scanned=false;
    // Durable claim first: if this cannot be written, nothing is scanned at all.
    if(!stageSetPhase(req,'claimed')){
      st.phase='';st.currentId='';st.blocked=true;stageRenderPanel();
      return{status:'helper-unavailable',message:'The staging claim could not be stored, so nothing was attempted.',pallet:req.pallet,destination:req.destination,at:stageNow()};
    }
    // The guard entry is reserved before anything else, so an interruption at any later
    // instant still leaves the pallet guarded. No page action has happened yet, so a failure
    // is a durable terminal rejection of this one request.
    if(!stageAddHold(Object.assign({},req,{status:'in-progress'}))){
      const why=stageText(st.holdNote,300)||'The guard entry could not be stored.';
      return stageFinish(req,'rejected','No staging guard could be reserved, so nothing was attempted. '+why,'claimed');
    }
    // The monitor may have withdrawn the request while this helper was claiming it.
    const live=stageRequestRecord();
    if(!live||stageClean(live.requestId)!==req.requestId)
      return stageFinish(req,'expired','The staging request was withdrawn before the helper scanned anything.','claimed');
    const aft=stageAft();
    if(!aft)return stageFinish(req,'helper-unavailable','The Move App workflow object is not available on this page.','claimed');
    if(!stageInstallAjaxObserver())return stageFinish(req,'helper-unavailable','The Move App request channel could not be observed, so no outcome could be confirmed. Nothing was attempted.','claimed');
    try{
      const ready=await stageAwaitReady(req);
      if(!ready.ok)return stageFinish(req,'not-ready',ready.reason,'claimed');
      stageFailureWatchStart(req);
      st.sessionRef=stageSession(stageAft());
      st.sessionId=stageSessionId(st.sessionRef);
      stageBeginResultWatch(req,"");
      if(req.auto&&ready.phase!=='source')return stageFinish(req,'rejected','AutoStager only starts from a clean source step. Nothing was scanned.','claimed');
      if(ready.phase==='source'){
        if(!stageSetPhase(req,'scanning-source'))return stageFinish(req,'helper-unavailable','The staging phase could not be stored, so the pallet was not scanned.','claimed');
        const t0=stageNow();st.sourceScanAt=t0;st.sourceScanSeq=st.relevantSeq;
        if(!stageScanAvailable(stageAft()))return stageFinish(req,'helper-unavailable','The Move App scan entry point is unavailable, so nothing was scanned.','scanning-source');
        // Last authority check for an auto move: mailbox, consent, lease, gap and a clean
        // source are read here, with no await before the scan.
        if(req.auto){
          const live=stageRequestRecord();
          const gate=live&&stageClean(live.requestId)===req.requestId?stageAutoGate(Object.assign({},req,{createdAt:live.createdAt}),stageNow(),true):{ok:false,reason:'the request was withdrawn'};
          if(!gate.ok)return stageFinish(req,'rejected','AutoStager stopped before the pallet scan ('+gate.reason+'). Nothing was scanned.','scanning-source');
        }
        st.scanned=true;
        const scan=stageScan(stageAft(),req.pallet);
        if(!scan.ok)return stageFinish(req,'unknown',scan.reason+' The pallet may already be scanned in the Move App: check it there.','scanning-source');
        const call=await stageAwaitCall(S.getContainerPath,t0,c=>stageMatchesSource(c,req),S.responseTimeoutMs);
        if(!call)return stageFinish(req,'unknown','The Move App never answered the pallet scan, so the outcome is unknown. Nothing was retried.','scanning-source');
        if(call.failed||!call.response||call.response.success!==true){
          const why=stageResponseMessage(stageAft(),call);
          if(req.auto)await stageSleep(S.pollMs);
          return stageFinish(req,'source-failed','The Move App did not accept the pallet '+req.pallet+(why?': '+why:'.'),'scanning-source',stageAutoSkipProof(req,call,'source-failed'));
        }
        const reached=await stageAwait(()=>{
          const a=stageAft();
          return stageSourceScannable(a)===req.pallet&&stageStepId(a)===S.destinationStep&&!stageInputDisabled(a);
        },S.stepSettleMs);
        if(!reached)return stageFinish(req,'unknown','The pallet scan was accepted but the Move App did not reach the destination step, so the outcome is unknown. Nothing was retried.','scanning-source');
      }
      const beforeDest=stageSession(stageAft());
      if(beforeDest!==st.sessionRef||stageSessionId(beforeDest)!==st.sessionId)
        return stageFinish(req,'unknown','The Move App session changed before the destination scan, so nothing further was attempted.','scanning-destination');
      if(!stageSetPhase(req,'scanning-destination'))return stageFinish(req,'helper-unavailable','The staging phase could not be stored, so the destination was not scanned.','scanning-source');
      stageFailureBaseline();
      stageBeginResultWatch(req,'false');
      const t1=stageNow();
      st.scanned=true;
      const destScan=stageScan(stageAft(),req.destination);
      if(!destScan.ok)return stageFinish(req,'unknown',destScan.reason+' The pallet is already scanned in the Move App: finish or cancel it there.','scanning-destination');
      const move=await stageAwaitCall(S.moveAllPath,t1,c=>stageMatchesMove(c,req,'false'),S.responseTimeoutMs);
      if(!move)return stageFinish(req,'unknown','The Move App never answered the destination scan, so the outcome is unknown. Nothing was retried.','scanning-destination');
      if(move.failed)return stageFinish(req,'unknown','The move request failed in transport, so the outcome is unknown. Nothing was retried.','scanning-destination');
      if(stageExactMoveFailure(stageAft(),move))return await stageAcknowledgeMoveFailure(req,move,'scanning-destination');
      if(move.response&&(move.response.success===true||stageMovedCount(stageAft(),move)===0))
        return await stageFinishMoveResult(req,move,'scanning-destination');
      const routine=stageRoutineConfirmation(stageAft(),move);
      if(!routine.ok){
        const why=stageResponseMessage(stageAft(),move)||routine.reason;
        return stageFinish(req,'stopped','The Move App answered with a message the helper does not repeat ('+why+'). Nothing was retried: finish it in the Move App.','scanning-destination');
      }
      // The only automatic repeat: the routine "scan the destination again" confirmation.
      if(!stageSetPhase(req,'confirming'))return stageFinish(req,'unknown','The confirmation phase could not be stored, so the confirmation was not repeated. The confirmation is still open in the Move App.','scanning-destination');
      const after=stageAft(),session2=stageSession(after);
      if(session2!==st.sessionRef||stageSessionId(session2)!==st.sessionId)
        return stageFinish(req,'unknown','The Move App session changed before the confirmation, so it was not repeated.','confirming');
      if(stageSourceScannable(after)!==req.pallet)
        return stageFinish(req,'unknown','The Move App source container changed before the confirmation, so it was not repeated.','confirming');
      if(stageStepId(after)!==S.destinationStep)
        return stageFinish(req,'unknown','The Move App left the destination step before the confirmation, so it was not repeated.','confirming');
      if(!stageDiversionActive(after))
        return stageFinish(req,'unknown','The Move App confirmation was no longer active, so it was not repeated.','confirming');
      const enabled=await stageAwait(()=>!stageInputDisabled(stageAft()),S.stepSettleMs);
      if(!enabled)return stageFinish(req,'unknown','The Move App input stayed disabled, so the confirmation was not repeated.','confirming');
      const finalAft=stageAft(),finalSession=stageSession(finalAft);
      if(finalSession!==st.sessionRef||stageSessionId(finalSession)!==st.sessionId||
        stageSourceScannable(finalAft)!==req.pallet||stageStepId(finalAft)!==S.destinationStep||
        !stageDiversionActive(finalAft)||stageInputDisabled(finalAft))
        return stageFinish(req,"unknown","The workflow changed while waiting for confirmation readiness. Nothing further was scanned.","confirming");
      stageFailureBaseline();
      stageBeginResultWatch(req,'true');
      const t2=stageNow();
      st.scanned=true;
      const confirmScan=stageScan(stageAft(),req.destination);
      if(!confirmScan.ok)return stageFinish(req,'unknown',confirmScan.reason+' The confirmation is still open in the Move App.','confirming');
      const confirmed=await stageAwaitCall(S.moveAllPath,t2,c=>stageMatchesMove(c,req,'true'),S.responseTimeoutMs);
      if(!confirmed)return stageFinish(req,'unknown','The Move App never answered the confirmation, so the outcome is unknown. Nothing was retried.','confirming');
      if(stageExactMoveFailure(stageAft(),confirmed))return await stageAcknowledgeMoveFailure(req,confirmed,'confirming');
      if(!confirmed.failed&&confirmed.response&&stageMovedCount(stageAft(),confirmed)===0)return await stageFinishMoveResult(req,confirmed,'confirming');
      if(confirmed.failed||!confirmed.response||confirmed.response.success!==true){
        const why=stageResponseMessage(stageAft(),confirmed);
        return stageFinish(req,'destination-failed','The Move App did not confirm the move'+(why?': '+why:'.'),'confirming');
      }
      return await stageFinishMoveResult(req,confirmed,'confirming');
    }catch(err){
      stageLog('run',err);
      return stageFinish(req,'unknown','The helper stopped with an error ('+stageErrText(err)+'), so the outcome is unknown. Nothing was retried.');
    }finally{
      stageStopResultWatch();
      try{if(st.failureWatch&&st.failureWatch.stop)st.failureWatch.stop()}catch(_){}
      st.failureWatch=null;
    }
  }
  // ---- helper lifecycle ------------------------------------------------------------------
  // A progress record with no journal entry means a run was interrupted (reload, crash, a
  // failed durable write). The outcome is unknown by definition: it is journaled as unknown
  // and never retried.
  function stageRecoverAfterReload(){
    const st=stageState();
    if(st.recovered)return null;
    st.recovered=true;
    const prog=stageProgressRecord();
    if(!prog)return null;
    const done=stageJournalGet(prog.requestId);
    if(done){stageClearRequest(prog.requestId);return null}
    // An interrupted run may already have scanned (a late phase write can be lost), so its
    // entry becomes an unknown-outcome guard, created now if it was never written. A guard
    // that cannot be stored is reported, never a reason to stop the helper.
    const guarded=stageUpdateHold(prog.requestId,'unknown')||
      stageAddHold({requestId:prog.requestId,pallet:prog.pallet,warehouse:prog.warehouse,destination:prog.destination,status:'unknown'});
    const entry=stageJournalPut({requestId:prog.requestId,status:'unknown',pallet:prog.pallet,destination:prog.destination,
      scope:prog.scope,warehouse:prog.warehouse,phase:stageClean(prog.phase),helperId:stageClean(prog.helperId),
      message:'The Move App helper was interrupted during '+(stageClean(prog.phase)||'the move')+', so the outcome is unknown. Nothing was retried: check the Move App.'+
        (guarded?'':' Its 24-hour guard could not be stored ('+(stageText(stageState().holdNote,160)||'guard storage failed')+').')});
    if(!entry){st.blocked=true;return null}
    stageClearRequest(prog.requestId);
    st.lastResult={status:entry.status,message:entry.message,at:entry.at,pallet:entry.pallet,destination:entry.destination};
    return entry;
  }
  // Only the lock owner ever publishes or deletes the helper record, so an idle or
  // lock-less tab can never overwrite or erase the live helper's heartbeat.
  function stageHeartbeat(){
    const st=stageState(),aft=stageAft();
    if(st.ownership!=='owned'||!st.helperId)return false;
    const cur=stageHelperRecord();
    if(cur&&stageClean(cur.helperId)!==st.helperId&&stageHelperLive(cur))return false;
    const holds=stageHoldSummary(),ready=stageAutoReadiness(aft);
    return stageGmWrite(stageSpec().helperKey,{v:1,helperId:st.helperId,scriptVersion:stageScriptVersion(),ownership:st.ownership,armed:!!st.armed,
      warehouse:st.warehouse,armedAt:st.armedAt,busy:!!st.active,blocked:!!st.blocked,step:stageStepId(aft),
      inputState:stageInputState(aft),inputDisabled:stageInputDisabled(aft),sourceScannable:stageSourceScannable(aft),note:stageText(st.note,200),
      autoProtocol:stageAutoSpec().protocol,autoOwner:stageAutoPublicOwner(),autoNextAt:stageAutoPublishedNextAt(),
      autoNote:stageText(st.autoNote,200),autoAck:st.autoAck,
      readyForAuto:ready.ready===true,readinessReason:ready.ready?'':stageText(ready.reason,200),readinessAt:stageNow(),
      holds,holdNote:stageText(st.holdNote,300),holdMaintenance:st.holdMaint,updatedAt:stageNow()});
  }
  function stageHelperTick(){
    const st=stageState();
    try{
      if(st.ownership!=='owned')return null;
      stageRecoverAfterReload();
      stageAutoProcessControl(stageNow());
      stageHoldRoutineMaintain(stageNow());
      stageHeartbeat();
      stageRenderPanel();
      if(st.active||st.blocked)return null;
      const rec=stageRequestRecord();
      if(!rec)return null;
      if(stageJournalGet(rec.requestId)){stageClearRequest(rec.requestId);return null}
      // Minimum age gate: a request younger than claimSettleMs may still be losing a race
      // between monitor origins, which do not share an admission lock. Nothing is scanned
      // until it has stopped changing.
      if(stageNow()-Number(rec.createdAt||0)<stageSpec().claimSettleMs)return null;
      const verdict=stageAcceptRequest(rec,stageNow());
      if(!verdict.ok){
        if(verdict.status){
          const entry=stageJournalPut({requestId:stageClean(rec.requestId),status:verdict.status,message:verdict.message,
            pallet:rec.pallet,destination:rec.destination,scope:rec.scope,warehouse:rec.warehouse,phase:'queued',helperId:st.helperId,
            auto:verdict.auto===true&&verdict.status==='rejected'?true:undefined,autoSkipSafe:verdict.auto===true&&verdict.status==='rejected',
            skipReason:verdict.auto===true&&verdict.status==='rejected'?'not-attempted':''});
          if(entry)stageClearRequest(rec.requestId);else st.blocked=true;
          if((rec.auto!==undefined&&rec.auto!==null)||verdict.auto||st.blocked)stageAutoRevoke('the automatic request was refused ('+verdict.status+')');
          stageRenderPanel();
        }
        return null;
      }
      const req=Object.assign({},verdict.request,{scope:stageText(rec.scope,256),warehouse:stageClean(rec.warehouse)});
      st.active=true;
      st.activePromise=stageRunRequest(req).catch(err=>{
        stageLog('run guard',err);
        return stageFinish(req,'unknown','The helper stopped unexpectedly ('+stageErrText(err)+'), so the outcome is unknown. Nothing was retried.');
      }).then(result=>{
        st.active=false;st.activePromise=null;
        try{stageAutoAfterRun(req,result)}catch(err){stageLog('auto after run',err);stageAutoRevoke('result handling failed')}
        stageHeartbeat();stageRenderPanel();
        return result;
      });
      return st.activePromise;
    }catch(err){
      stageLog('tick',err);
      stageAutoRevoke('the helper tick failed');
      st.active=false;st.activePromise=null;
      return null;
    }
  }
  // Only a real operator click arms or disarms: a scripted click() carries isTrusted false and
  // is refused.
  function stageTrusted(ev){try{return !!ev&&ev.isTrusted===true}catch{return false}}
  function stageArmClick(ev,value){
    const st=stageState();
    if(!stageTrusted(ev)){st.armError='Facility setup needs a real click on this panel.';st.lastPanel='';stageRenderPanel();return{ok:false,message:st.armError}}
    return stageArm(value);
  }
  function stageDisarmClick(ev){
    const st=stageState();
    if(!stageTrusted(ev)){st.armError='Changing facility needs a real click on this panel.';st.lastPanel='';stageRenderPanel();return{ok:false,message:st.armError}}
    return stageDisarm();
  }
  function stageArm(input){
    const st=stageState();
    if(st.ownership!=='owned'){st.armError='This tab is not the live helper, so it cannot be armed.';stageRenderPanel();return{ok:false,message:st.armError}}
    if(st.blocked){st.armError='The helper stopped after an unrecorded outcome. Reload this tab after checking the Move App.';stageRenderPanel();return{ok:false,message:st.armError}}
    const wh=stageValidWarehouse(input);
    if(!wh){st.armError='Type the facility code exactly as the Move App shows it, for example LGA9.';stageRenderPanel();return{ok:false,message:st.armError}}
    if(st.active)return{ok:false,message:'Wait for the current request before changing the facility.'};
    try{sessionStorage.setItem(stageSpec().facilityKey,wh)}catch(_){st.armError='Facility setting could not be saved in this tab.';stageRenderPanel();return{ok:false,message:st.armError}}
    stageAutoRevoke('the facility was changed');
    st.armed=true;st.warehouse=wh;st.armedAt=stageNow();st.armError='';st.note='Configured for '+wh;
    // Nothing already queued is replayed: only requests created after this instant can run.
    stageHeartbeat();stageRenderPanel();
    return{ok:true,warehouse:wh,armedAt:st.armedAt};
  }
  function stageDisarm(){
    const st=stageState();
    if(st.active)return{ok:false,message:'Wait for the current request before changing the facility.'};
    try{sessionStorage.removeItem(stageSpec().facilityKey)}catch(_){return{ok:false,message:'Facility setting could not be cleared.'}}
    stageAutoRevoke('the facility was cleared');
    st.armed=false;st.warehouse='';st.armedAt=0;st.armError='';st.note='Facility not configured';
    stageHeartbeat();stageRenderPanel();
    return{ok:true};
  }
  function stageOwnershipText(){
    const st=stageState();
    if(st.ownership==='owned')return 'live helper for this browser';
    if(st.ownership==='taken')return 'another Move App tab is the live helper, so this tab stays idle';
    if(st.ownership==='unavailable')return 'Web Locks is unavailable, so this tab refuses to act as the helper';
    if(st.ownership==='error')return 'the ownership lock failed, so this tab refuses to act as the helper';
    return 'starting';
  }
  function stagePanelHtml(){
    const st=stageState(),res=st.lastResult,aft=stageAft();
    let guardWarn='';try{guardWarn=stageHoldWarning(stageHoldsRecord(),stageNow())}catch(_){guardWarn=''}
    const armLine=st.armed
      ?'<b>Configured for '+stageEsc(st.warehouse)+'.</b> Your Stage click authorizes each move. Verify the Move App building after sign-in.'
      :'One-time setup for this tab: verify the Move App building, then save its facility code. This survives reloads; it does not submit a move.';
    const form=st.ownership==='owned'&&!st.blocked
      ?(st.armed?'<div class="pmm-stage-row"><button id="pmm-stage-disarm" type="button">Change facility</button></div>'
        :'<div class="pmm-stage-row"><input id="pmm-stage-warehouse" type="text" maxlength="8" size="6" placeholder="LGA9" autocomplete="off"><button id="pmm-stage-arm" type="button">Save facility</button></div>')
      :'';
    return '<div class="pmm-stage-title"><b>Pallet staging helper</b></div>'
      +'<div class="pmm-stage-line">Ownership: '+stageEsc(stageOwnershipText())+'</div>'
      +'<div class="pmm-stage-line">'+armLine+'</div>'
      +(st.armError?'<div class="pmm-stage-line pmm-stage-warn">'+stageEsc(st.armError)+'</div>':'')
      +(st.holdNote?'<div class="pmm-stage-line pmm-stage-warn">'+stageEsc(st.holdNote)+'</div>':'')
      +(guardWarn&&guardWarn!==st.holdNote?'<div class="pmm-stage-line pmm-stage-warn">'+stageEsc(guardWarn)+'</div>':'')
      +(st.blocked&&st.note?'<div class="pmm-stage-line pmm-stage-warn">'+stageEsc(st.note)+'</div>':'')
      +'<div class="pmm-stage-line">Workflow: '+stageEsc(stageStepId(aft)||'not loaded')+' (input '+stageEsc(stageInputState(aft).state)+')'+'</div>'
      +(st.autoOwner||st.autoNote?'<div class="pmm-stage-line">AutoStager: '+stageEsc(st.autoOwner&&stageAutoLive()?'on for '+st.autoOwner.scope:'off')+(st.autoNote?' - '+stageEsc(st.autoNote):'')+'</div>':'')
      +'<div class="pmm-stage-line">'+(st.active?'Running: '+stageEsc(st.phase||'claimed'):'Idle')+'</div>'
      +(res?'<div class="pmm-stage-line pmm-stage-result">Last: '+stageEsc(res.status)+' - '+stageEsc(res.message)+'</div>':'')
      +form;
  }
  function stageRenderPanel(){
    try{
      const st=stageState();
      if(typeof document==='undefined'||!document||typeof document.createElement!=='function')return;
      if(!st.panel||!st.panel.isConnected){
        const host=document.body||document.documentElement;
        if(!host||typeof host.appendChild!=='function')return;
        const box=document.createElement('div');
        box.id='pmm-stage-panel';
        try{box.setAttribute('style','position:fixed;right:8px;bottom:8px;z-index:2147483000;max-width:320px;font:12px/1.35 system-ui,sans-serif;background:#111;color:#eee;border:1px solid #444;border-radius:6px;padding:8px 10px;opacity:.95')}catch{}
        host.appendChild(box);
        st.panel=box;st.lastPanel='';
      }
      const html=stagePanelHtml();
      if(html===st.lastPanel)return;
      st.lastPanel=html;
      st.panel.innerHTML=html;
      const arm=st.panel.querySelector('#pmm-stage-arm'),input=st.panel.querySelector('#pmm-stage-warehouse'),off=st.panel.querySelector('#pmm-stage-disarm');
      if(arm)arm.onclick=ev=>stageArmClick(ev,input?input.value:'');
      if(off)off.onclick=ev=>stageDisarmClick(ev);
    }catch(err){stageLog('panel',err)}
  }
  // Exclusive ownership on the Move App origin. Fails closed: without Web Locks the helper
  // never arms and never acts, because two helper tabs could otherwise both scan.
  function stageAcquireOwnership(){
    const st=stageState();
    let locks=null;
    try{locks=typeof navigator!=='undefined'&&navigator&&navigator.locks?navigator.locks:null}catch{}
    if(!locks||typeof locks.request!=='function'){
      st.ownership='unavailable';st.armed=false;st.warehouse='';st.armedAt=0;st.note='Web Locks unavailable';
      stageRenderPanel();
      return false;
    }
    let outcome=null;
    try{
      outcome=locks.request(stageSpec().lockName,{mode:'exclusive',ifAvailable:true},lock=>{
        if(!lock){
          // Not the owner: publish nothing, and never stay armed without the lock.
          st.ownership='taken';st.armed=false;st.warehouse='';st.armedAt=0;stageRenderPanel();
          try{setTimeout(stageAcquireOwnership,stageSpec().ownershipRetryMs)}catch{}
          return undefined;
        }
        st.ownership='owned';st.note='';
        // Restore facility only; new helper id and timestamp prevent request replay.
        let saved='';try{saved=stageValidWarehouse(sessionStorage.getItem(stageSpec().facilityKey))}catch(_){}
        st.armed=!!saved;st.warehouse=saved;st.armedAt=stageNow();
        stageAutoStartupFloor();
        stageHeartbeat();stageRenderPanel();
        stageStartLoop();
        // Held for the life of this tab; released on unload.
        return new Promise(resolve=>{st.release=resolve});
      });
    }catch(err){
      st.ownership='error';st.armed=false;st.warehouse='';st.armedAt=0;stageLog('ownership',err);stageRenderPanel();
      return false;
    }
    if(outcome&&typeof outcome.catch==='function')outcome.catch(err=>{
      st.ownership='error';st.armed=false;st.warehouse='';st.armedAt=0;stageLog('ownership',err);stageRenderPanel();
    });
    return true;
  }
  function stageStartLoop(){
    const st=stageState(),S=stageSpec();
    if(st.loop)return;
    try{st.loop=setInterval(stageHelperTick,S.heartbeatMs)||1}catch(err){stageLog('loop',err)}
    // 4.0.4: a background tab can have page timers slowed or frozen, which makes the heartbeat go
    // stale. A worker timer is not slowed the same way; it only calls the same tick. If the page
    // blocks workers the page timer above still runs.
    try{
      if(typeof Worker==='function'&&typeof Blob==='function'&&typeof URL!=='undefined'&&URL.createObjectURL){
        const url=URL.createObjectURL(new Blob(['setInterval(function(){postMessage(1)},'+Number(S.heartbeatMs)+')'],{type:'text/javascript'}));
        const w=new Worker(url);
        try{URL.revokeObjectURL(url)}catch{}
        w.onmessage=function(){try{stageHelperTick()}catch(err){stageLog('worker tick',err)}};
        w.onerror=function(){try{w.terminate()}catch{}st.worker=null};
        st.worker=w;
      }
    }catch(err){stageLog('worker loop',err)}
    // A cross-tab value change only wakes the poll sooner; the poll alone is sufficient, and
    // the listener callback does nothing but schedule a tick.
    try{
      if(typeof GM_addValueChangeListener==='function')
        GM_addValueChangeListener(S.requestKey,function(){try{queueMicrotask(stageHelperTick)}catch{stageHelperTick()}});
    }catch(err){stageLog('request listener',err)}
    stageHelperTick();
  }
  function stageStartHelper(){
    const st=stageState();
    if(st.started)return;
    st.started=true;
    st.helperId='helper-'+String(stageNow())+'-'+stageRandomHex(8);
    if(!stageStorageReady()){st.ownership='unavailable';st.note='Shared storage unavailable';stageRenderPanel();return}
    stageRenderPanel();
    stageAcquireOwnership();
    try{
      window.addEventListener('beforeunload',function(){
        try{stageUninstallAjaxObserver()}catch{}
        try{if(st.worker)st.worker.terminate()}catch{}
        try{if(st.release)st.release()}catch{}
        // Only this tab's own heartbeat is removed, never another owner's.
        try{
          const cur=stageHelperRecord();
          if(cur&&stageClean(cur.helperId)===st.helperId)stageGmDelete(stageSpec().helperKey);
        }catch{}
      });
    }catch{}
  }
  // Returns true on the Move App hostname, which tells core to stop: no monitor runs there.
  function pmmStageHelperPage(){
    try{
      const scope=stageMoveAppScope();
      if(!scope.isHost)return false;
      if(!scope.isJobPage)return true;
      if(typeof document!=='undefined'&&document&&document.readyState==='loading')
        document.addEventListener('DOMContentLoaded',stageStartHelper,{once:true});
      else stageStartHelper();
      return true;
    }catch(err){
      stageLog('helper page',err);
      // Fail closed: if the scope cannot be read on the Move App host, run nothing there.
      try{return stageClean(location.hostname)===stageSpec().moveAppHost}catch{return false}
    }
  }
  // PMM-CHUNK-END staging

  // PMM-CHUNK-BEGIN stage-ui
  // No staging is triggered by scans, rendering, history imports, or station updates.
  // 3.9.8: presentation-only success receipts. Never read by move admission or exports.
  // Each facility/load/pallet has its own key: concurrent tabs cannot overwrite other pallets.
  function pmmStageCueIdentity(h){
    if(!h||typeof h.loadId!=='string'||!h.loadId||typeof h.destinationWarehouse!=='string'||
      !/^[A-Z]{3}\d$/.test(h.destinationWarehouse))return null;
    return {scope:loadScopeKey(h),warehouse:h.destinationWarehouse};
  }
  function pmmStageCueReceiptValid(r,identity,pallet){
    return !!r&&r.v===1&&r.status==='success'&&r.scope===identity.scope&&r.warehouse===identity.warehouse&&
      r.pallet===pallet&&typeof pallet==='string'&&!!stageValidId(pallet)&&
      typeof r.requestId==='string'&&stageSpec().requestIdPattern.test(r.requestId)&&
      typeof r.at==='number'&&Number.isFinite(r.at)&&r.at>0;
  }
  function pmmStageCueKey(identity,pallet){
    return 'pmm-stage-cues-v398:'+JSON.stringify([identity.warehouse,identity.scope,pallet]);
  }
  function pmmStageCueContext(h){
    const identity=pmmStageCueIdentity(h),quiet=new Map();
    const context={quiet(pallet){
      if(!identity||typeof pallet!=='string'||!stageValidId(pallet))return false;
      if(quiet.has(pallet))return quiet.get(pallet);
      let yes=false;
      try{yes=pmmStageCueReceiptValid(GM_getValue(pmmStageCueKey(identity,pallet),null),identity,pallet)}catch(_){}
      quiet.set(pallet,yes);return yes;
    }};
    if(!identity)return context;
    // Only the durable terminal journal is success evidence. A hold, empty pallet,
    // staged location, last-result banner or an in-progress/unknown request is not.
    try{
      for(const entry of stageJournalAll()){
        const receipt=entry&&{v:1,status:entry.status,scope:entry.scope,warehouse:entry.warehouse,
          pallet:entry.pallet,requestId:entry.requestId,at:entry.at};
        if(!pmmStageCueReceiptValid(receipt,identity,entry?.pallet))continue;
        if(!context.quiet(receipt.pallet)){
          try{GM_setValue(pmmStageCueKey(identity,receipt.pallet),receipt)}catch(err){stageLog('visual cue receipt',err)}
          // Durable journal proves this success even if separate display storage failed.
          quiet.set(receipt.pallet,true);
        }
      }
    }catch(err){stageLog('visual cue journal',err)}
    pmmStageCueListen();
    return context;
  }
  function pmmStageCueRefresh(){
    try{
      // Do not disturb a tracking transaction or bypass existing UI hold/selection guards.
      _pendingVisibleRender=true;
      if(!_scanRunning)renderMaybe(getHierarchy());
    }catch(err){stageLog('visual cue refresh',err)}
  }
  function pmmStageCueListen(){
    if(pmmStageCueListen.ready)return;
    try{
      if(typeof GM_addValueChangeListener!=='function')return;
      GM_addValueChangeListener(stageSpec().journalKey,()=>{
        try{queueMicrotask(pmmStageCueRefresh)}catch(err){stageLog('visual cue event',err)}
      });
      pmmStageCueListen.ready=true;
    }catch(err){stageLog('visual cue listener',err)}
  }
  function pmmStageDestination(station){
    const text=String(station??'').trim();
    if(/^\d{4}$/.test(text))return 'dz-P-A'+text;
    if(/^dz-P-A\d{4}$/i.test(text))return 'dz-P-A'+text.slice(-4);
    return null;
  }
  function pmmStageStationMissing(station){return station==null||(typeof station==='string'&&!station.trim())}
  // Live station fallback only: the cached hierarchy must still describe the AFT page now shown.
  function pmmStageLiveIdentityMatches(h){
    try{
      if(!isAftPage())return false;
      const id=loadIdentity();
      return !!id&&!!id.loadId&&!!id.shipRef&&id.loadId===h.loadId&&id.shipRef===h.shipRef&&
        typeof h.destinationWarehouse==='string'&&/^[A-Z]{3}\d$/.test(h.destinationWarehouse)&&id.destinationWarehouse===h.destinationWarehouse;
    }catch(err){stageLog('stage live identity',err);return false}
  }
  // Returns {destinations,reason,live,quiet}. Unsupported views, unverified loads and pallets
  // without a qualifying stower movement stay quiet, preserving the previous display behavior.
  function pmmStageResolve(h,records,pallet){
    const own=(o,k)=>!!o&&typeof o==='object'&&Object.prototype.hasOwnProperty.call(o,k);
    const blocked=(reason,quiet=false)=>({destinations:[],reason,live:false,quiet});
    if(!h||typeof pallet!=='string'||!pallet)return blocked('',true);
    if(h.source!=='aft')return blocked('',true);
    if(!h.loadId||!h.shipRef)return blocked('',true);
    const scope=loadScopeKey(h), latest=new Map(), ties=new Map(), touched=new Set(), badTime=new Set();
    let invalid=false;
    const route=r=>JSON.stringify([r.oldPallet??null,r.pallet||null,r.stower||null,pmmStageStationMissing(r.station)?null:String(r.station)]);
    for(const r of records||[]){
      if(!r||!['case','tote'].includes(r.kind))continue;
      if(r.scopeId!==scope||r.loadId!==h.loadId||r.source!=='aft'||r.shipRef!==h.shipRef)continue;
      const relevant=r.oldPallet===pallet||r.pallet===pallet;
      const at=Number(r.detectedAt),validId=typeof r.caseId==='string'&&!!r.caseId.trim();
      // An unkeyable or untimed row could be this container's newest move; never let an older row win.
      if(!validId){if(relevant)invalid=true;continue}
      const key=r.kind+':'+r.caseId;
      if(r.oldPallet===pallet)touched.add(key);
      if(!Number.isFinite(at)||at<=0){badTime.add(key);if(relevant)invalid=true;continue}
      const prev=latest.get(key);
      if(!prev||at>Number(prev.detectedAt)){latest.set(key,r);ties.set(key,[r])}
      else if(at===Number(prev.detectedAt))ties.get(key).push(r);
    }
    if(invalid||[...badTime].some(k=>touched.has(k)))return blocked('A movement record for this pallet has no valid container ID or time, so no station is offered.');
    // Equal latest timestamps with different routes, stowers or stations have no defined winner.
    if([...ties.values()].some(t=>t.some(r=>r.oldPallet===pallet)&&new Set(t.map(route)).size>1))
      return blocked('A moved container has conflicting movement records with the same time, so no station is offered.');
    const candidates=[...latest.values()].filter(r=>r.oldPallet===pallet&&!!r.stower&&!r.pallet);
    if(!candidates.length)return blocked('',true);
    // AFT builds this map from PALLET-typed rows, not barcode prefixes.
    // Require an exact own entry; a name alone or historical row is not evidence.
    if(!own(h.pallets,pallet))return blocked('This pallet is not listed as a pallet on the current AFT page.');
    const sourcePallet=h.pallets[pallet];
    if(!sourcePallet||sourcePallet.id!==pallet||sourcePallet.sap!==false||
      !Array.isArray(sourcePallet.cases)||!Array.isArray(sourcePallet.totes))return blocked('This pallet is SAP or its AFT pallet entry is incomplete.');
    let liveIdentity=null;
    const destinations=new Set();let live=false,malformed='',noLiveStation=0,unverified=0;
    for(const r of candidates){
      // Deliberate Stage click may use a previously observed station for this load.
      // Do not demand a current active-stower row or another completed refresh.
      if(!pmmStageStationMissing(r.station)){
        const recorded=pmmStageDestination(r.station);
        if(recorded)destinations.add(recorded);
        else if(!malformed)malformed=String(r.station);
        continue;
      }
      // Only when no station was recorded: the live stower row for this exact container,
      // still at the exact recorded stower. Never another tote, case or stower.
      if(liveIdentity===null)liveIdentity=pmmStageLiveIdentityMatches(h);
      if(!liveIdentity){unverified++;continue}
      const map=r.kind==='tote'?h.activeByTote:h.activeByCase;
      const active=own(map,r.caseId)?map[r.caseId]:null;
      if(!active||typeof active.stower!=='string'||typeof r.stower!=='string'||active.stower!==r.stower)continue;
      const current=pmmStageDestination(active.station);
      if(current){destinations.add(current);live=true}
      else noLiveStation++;
    }
    if(destinations.size)return {destinations:[...destinations].sort(),reason:'',live,quiet:false};
    if(malformed)return blocked('The recorded station "'+malformed.slice(0,40)+'" is not a recognized station, so no destination is offered.');
    if(noLiveStation)return blocked('No station was recorded with the move, and AFT does not show a station for that stower yet.');
    if(unverified)return blocked('No station was recorded with the move, and the current AFT page does not match this load and building, so its live station is not used.');
    return blocked('No station was recorded with the move, and the moved '+(candidates.length===1?'container is':'containers are')+' no longer shown at the recorded stower.');
  }
  function pmmStageDestinations(h,records,pallet){return pmmStageResolve(h,records,pallet).destinations}
  function pmmStageUiState(){return pmmStageUiState.value||(pmmStageUiState.value=new Map())}
  function pmmStageUiKey(h,pallet){return JSON.stringify([loadScopeKey(h),String(h?.destinationWarehouse||''),pallet])}
  function pmmStageOpenMoveApp(e){
    e.preventDefault();e.stopPropagation();
    GM_openInTab('https://aft-moveapp-iad-iad.iad.proxy.amazon.com/move-container?jobId=300',{active:true,insert:true,setParent:true});
  }
  // Explicit no-action outcomes need no attention notice. Local lock rules are separate (below).
  // helper-unavailable can occur after a source scan (e.g. failed phase write), so notify.
  function pmmStageNoAction(status){
    return ['rejected','not-ready','no-helper','not-armed','warehouse-mismatch','busy','expired','duplicate'].includes(status);
  }
  // Fail safe: any non-success outcome that is not explicitly no-action (including a status
  // this UI does not know) is treated as failed or uncertain.
  function pmmStageNeedsAttention(status){return !!status&&status!=='success'&&!pmmStageNoAction(status)}
  function pmmStageTime(at){
    try{return new Date(Number(at)).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}catch(_){return ''}
  }
  // One bounded journal read per synchronous render, shared by every pallet row.
  function pmmStageJournalSnapshot(){
    const memo=pmmStageJournalSnapshot;
    if(memo.value)return memo.value;
    let records=[];
    try{records=stageJournalAll()}catch(err){stageLog('outcome note journal',err)}
    memo.value=records;
    try{queueMicrotask(()=>{memo.value=null})}catch(_){memo.value=null}
    return records;
  }
  // Durable outcome note: the latest journaled attempt for this exact scope+warehouse+pallet.
  // Read-only; never consulted by admission, holds or the success cue.
  function pmmStageOutcomeNote(h,pallet){
    try{
      const identity=pmmStageCueIdentity(h);
      if(!identity||typeof pallet!=='string'||!stageValidId(pallet))return '';
      let latest=null;
      for(const r of pmmStageJournalSnapshot()){
        if(r.scope!==identity.scope||r.warehouse!==identity.warehouse||r.pallet!==pallet)continue;
        if(!latest||Number(r.at)>=Number(latest.at))latest=r;
      }
      const status=String(latest?.status||'');
      if(!pmmStageNeedsAttention(status))return '';
      const when=pmmStageTime(latest.at);
      return 'Last staging attempt'+(when?' at '+when:'')+': '+pallet+' to '+(latest.destination||'an unknown destination')+' ended '+status+'. '+
        (latest.message?String(latest.message)+' ':'')+'Nothing is retried automatically. Check the pallet in the Move App before staging again.';
    }catch(err){stageLog('outcome note',err);return ''}
  }
  function pmmStageControls(h,res,pallet){
    const resolved=pmmStageResolve(h,res,pallet),destinations=resolved.destinations,outcome=pmmStageOutcomeNote(h,pallet);
    if(!destinations.length){
      const unavailable=resolved.quiet?'':'Staging unavailable: '+resolved.reason;
      if(!unavailable&&!outcome)return '';
      return `<div class="pmm-stage-outcome container-entry" style="border:1px solid currentColor;border-radius:6px;padding:8px;margin-bottom:8px;overflow-wrap:anywhere">${unavailable?`<div class="pmm-stage-unavailable muted" role="status">${esc(unavailable)}</div>`:''}${outcome?`<div class="pmm-stage-note muted" role="status">${esc(outcome)}</div>`:''}<button type="button" class="pmm-stage-open">Open Move App</button></div>`;
    }
    const p=h.pallets?.[pallet],hasContents=!!p&&((p.cases||[]).length+(p.totes||[]).length>0);
    const scope=loadScopeKey(h),warehouse=String(h.destinationWarehouse||''),state=pmmStageUiState().get(pmmStageUiKey(h,pallet));
    const blocked=!hasContents||!!state?.locked;
    const selected=destinations.length===1?destinations[0]:'';
    const label=selected?'Stage to '+selected:'Stage to selected station';
    const basis=resolved.live?'Uses the station AFT shows now for the recorded stower where none was recorded with the move. Verify the destination.':'Uses the recorded station, which may be older than current placement. Verify the destination.';
    const note=state?.message||outcome||(!hasContents?'No remaining mapped contents.':basis+' Clicking Stage moves this pallet’s contents and completes the normal confirmation.');
    return `<div class="pmm-stage-control container-entry" data-stage-pallet="${esc(pallet)}" data-stage-scope="${esc(scope)}" data-stage-warehouse="${esc(warehouse)}" style="border:1px solid currentColor;border-radius:6px;padding:8px;margin-bottom:8px;overflow-wrap:anywhere"><label style="display:block">Staging destination <select class="pmm-stage-destination" aria-label="Staging destination for ${esc(pallet)}" style="max-width:100%" ${blocked?'disabled':''}>${selected?'':'<option value="">Choose a station</option>'}${destinations.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join('')}</select></label><button type="button" class="pmm-stage-submit" ${blocked||!selected?'disabled':''} style="max-width:100%;white-space:normal;margin-top:6px">${esc(label)}</button> <button type="button" class="pmm-stage-open">Open Move App</button><div class="pmm-stage-note muted" role="status" aria-live="polite">${esc(note)}</div></div>`;
  }
  // ---- attention notice: in-tab only, never replayed at startup ----------------------------
  // Lives in its own body-level host so panel redraws cannot remove it. Dismiss removes only the
  // notice entry: holds, journal, local locks and the duplicate gate are untouched.
  function pmmStageAttentionEntries(){return pmmStageAttentionEntries.value||(pmmStageAttentionEntries.value=[])}
  function pmmStageAttentionHost(){
    let host=pmmStageAttentionHost.el;
    if(!host){
      host=document.createElement('div');host.id='pmm-stage-attention-v3910';
      host.setAttribute('role','region');host.setAttribute('aria-label','Staging attention');
      host.style.cssText='position:fixed;left:12px;bottom:12px;z-index:2147483647;max-width:min(380px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow-y:auto;display:flex;flex-direction:column;gap:6px;font:13px/1.35 -apple-system,"Segoe UI",Roboto,Arial,sans-serif';
      for(const type of ['pointerdown','mousedown','click'])host.addEventListener(type,e=>e.stopPropagation());
      pmmStageAttentionHost.el=host;
    }
    if(!host.isConnected&&document.body)document.body.appendChild(host);
    return host;
  }
  // ---- unmoved pallets (4.0): one durable record per attempt; acknowledgment archives -----------
  // Every attempt and every acknowledgment has its own storage key, so concurrent tabs never
  // overwrite each other's records, and nothing is dropped by a list cap. Checking writes an
  // archive marker only: it never edits the attempt record or any guard.
  const PMM_UNMOVED_KEY='pmm-unmoved-pallets-v3918';
  function pmmUnmovedSpec(){
    return{entryPrefix:'pmm-unmoved-v4:e:',ackPrefix:'pmm-unmoved-v4:a:',pingKey:'pmm-unmoved-v4:ping',
      legacyKey:PMM_UNMOVED_KEY,idPattern:/^[a-z]-[A-Za-z0-9._:-]{2,160}$/,cacheMs:1500,archiveShown:50};
  }
  function pmmUnmovedState(){
    return pmmUnmovedState.s||(pmmUnmovedState.s={errors:[],memory:new Map(),written:new Set(),
      read:null,migrated:{done:false,count:0,failed:0,at:0},cache:null,open:null,forceShow:false,listener:false});
  }
  function pmmUnmovedText(v,max){return String(v===undefined||v===null?'':v).replace(/\s+/g,' ').trim().slice(0,max||300)}
  function pmmUnmovedScrub(text){
    return String(text).replace(/\b[a-z][a-z0-9+.-]*:\/\/\S+/gi,'[link omitted]')
      .replace(/\bBearer\s+\S+/gi,'Bearer [redacted]')
      .replace(/\beyJ[A-Za-z0-9_-]{8,}(\.[A-Za-z0-9_-]+){1,2}/g,'[token omitted]')
      .replace(/\b([A-Za-z_-]*(?:token|password|passwd|pwd|cookie|authorization|auth|nonce|code|session|secret|credential|signature|apikey|api_key))\s*[:=]\s*("[^"]*"|'[^']*'|[^\s,;&]+)/gi,'$1=[redacted]');
  }
  function pmmUnmovedRedact(v,max){return pmmUnmovedScrub(pmmUnmovedText(v,max||400))}
  function pmmUnmovedError(what,detail){
    const st=pmmUnmovedState();
    st.errors.push({at:Date.now(),what:pmmUnmovedText(what,80),detail:pmmUnmovedText(detail,200)});
    st.errors.splice(0,Math.max(0,st.errors.length-20));
    stageLog('unmoved '+what,detail);
    return false;
  }
  function pmmUnmovedInvalidate(){pmmUnmovedState().cache=null}
  function pmmUnmovedSame(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch(_){return false}}
  // Strict: a thrown or unavailable read is a failure, never an absent value.
  function pmmUnmovedRead(key){
    try{
      if(typeof GM_getValue!=='function')return{ok:false,value:null,error:'storage reads are unavailable'};
      const v=GM_getValue(key,null);return{ok:true,value:v===undefined?null:v};
    }catch(err){stageLog('unmoved read',err);return{ok:false,value:null,error:stageErrText(err)}}
  }
  // Verified: the value must read back identically, or the write counts as failed.
  function pmmUnmovedWrite(key,value){
    if(!stageGmWrite(key,value))return false;
    const r=pmmUnmovedRead(key);
    return r.ok&&pmmUnmovedSame(r.value,value);
  }
  function pmmUnmovedPing(){
    try{stageGmWrite(pmmUnmovedSpec().pingKey,{at:Date.now(),n:stageRandomHex(8)})}catch(_){}
  }
  function pmmUnmovedListen(){
    const st=pmmUnmovedState();if(st.listener)return;
    try{
      if(typeof GM_addValueChangeListener!=='function')return;
      const wake=()=>{pmmUnmovedInvalidate();try{queueMicrotask(pmmStageAttentionRender)}catch(_){}};
      GM_addValueChangeListener(pmmUnmovedSpec().pingKey,wake);
      GM_addValueChangeListener(pmmUnmovedSpec().legacyKey,wake);
      st.listener=true;
    }catch(err){stageLog('unmoved listener',err)}
  }
  function pmmUnmovedHash(text){
    let a=0x811c9dc5,b=0x01000193^0x5bd1e995;
    for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);a=Math.imul(a^c,0x01000193)>>>0;b=Math.imul(b^c,0x5bd1e995)>>>0;b^=b>>>13}
    return a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0');
  }
  function pmmUnmovedId(ctx){
    const req=pmmUnmovedText(ctx.requestId,80),att=String(ctx.attemptId===undefined||ctx.attemptId===null?'':ctx.attemptId).replace(/[^A-Za-z0-9._:-]/g,'_').slice(0,150);
    // The attempt id is stable from the first report of an attempt; a request id may arrive later.
    if(att.length>=3)return 'a-'+att;
    if(req&&stageSpec().requestIdPattern.test(req))return 'r-'+req;
    return 'x-'+Date.now()+'-'+stageRandomHex(12);
  }
  function pmmUnmovedLegacyId(item){
    let raw='';try{raw=JSON.stringify(item)}catch(_){raw=String(item&&item.pallet)}
    return 'l-'+pmmUnmovedHash(raw);
  }
  // Only a proven skip is reported as nothing moved. Anything else is an unknown outcome.
  function pmmUnmovedOutcome(status,proof){
    const s=pmmUnmovedText(status,40);
    if(proof===true&&s==='nothing-moved')return 'zero-moved';
    if(proof===true&&s==='rejected')return 'refused';
    if(proof===true&&s==='source-failed')return 'source-rejected';
    return 'unknown';
  }
  // 3.9 lists kept only a reason sentence, never the proof, so their outcome is a report, not evidence.
  function pmmUnmovedLegacyOutcome(reason){
    const r=pmmUnmovedText(reason,300);
    if(/^Refused before anything was attempted/.test(r))return 'reported-refused';
    if(/^0 containers moved, or it needs to be checked\.?$/.test(r))return 'reported-skip';
    return 'unknown';
  }
  function pmmStageUnmovedOutcomeLabel(outcome){
    return({'zero-moved':'Verified: 0 containers moved','refused':'Refused: nothing attempted',
      'source-rejected':'Source scan rejected: nothing moved',
      'reported-refused':'Reported (3.9, not verified): refused before anything was attempted',
      'reported-skip':'Reported (3.9, not verified): 0 moved or needs checking'})[outcome]||'Outcome unknown: may have moved';
  }
  function pmmUnmovedEntryFromLegacy(item){
    const o=item&&typeof item==='object'?item:{};
    const at=Number(o.at);
    return{v:4,id:pmmUnmovedLegacyId(item),pallet:pmmUnmovedText(o.pallet,128)||'(unknown pallet)',destination:pmmUnmovedText(o.destination,64),
      warehouse:pmmUnmovedText(o.warehouse,16),loadId:pmmUnmovedText(o.loadId,64),scope:pmmUnmovedText(o.scope,256),
      requestId:pmmUnmovedText(o.requestId,80),attemptId:'',status:'legacy',proof:false,outcome:pmmUnmovedLegacyOutcome(o.reason),
      reason:pmmUnmovedText(o.reason,400),at:Number.isFinite(at)&&at>0?at:0,source:'legacy',legacy:o};
  }
  function pmmUnmovedLegacyRecorded(outcome){
    if(outcome==='unknown'||outcome==='reported-refused'||outcome==='reported-skip')return outcome;
    return outcome==='refused'?'reported-refused':'reported-skip';
  }
  function pmmUnmovedValid(e,id){
    return !!e&&typeof e==='object'&&e.v===4&&e.id===id&&typeof e.pallet==='string'&&Number.isFinite(Number(e.at));
  }
  function pmmUnmovedRecord(e,ack,source){
    const at=Number(ack&&ack.at),src=source||e.source||'auto',outcome=pmmUnmovedText(e.outcome,40)||'unknown';
    return{id:e.id,requestId:pmmUnmovedText(e.requestId,80),attemptId:pmmUnmovedText(e.attemptId,160),pallet:pmmUnmovedText(e.pallet,128),
      destination:pmmUnmovedText(e.destination,64),warehouse:pmmUnmovedText(e.warehouse,16),loadId:pmmUnmovedText(e.loadId,64),
      scope:pmmUnmovedText(e.scope,256),status:pmmUnmovedText(e.status,40),
      // A migrated 3.9 item is never promoted to verified, whatever outcome string it carries.
      outcome:src==='legacy'||e.status==='legacy'?pmmUnmovedLegacyRecorded(outcome):outcome,
      proof:e.proof===true&&src!=='legacy',reason:pmmUnmovedText(e.reason,400),at:Number(e.at)||0,
      checked:Number.isFinite(at)&&at>0,checkedAt:Number.isFinite(at)&&at>0?at:0,source:src};
  }
  function pmmUnmovedEnumerate(){
    const S=pmmUnmovedSpec();
    if(typeof GM_listValues!=='function')return{ok:false,keys:[],error:'Stored Unmoved records cannot be listed in this tab.'};
    try{
      const keys=GM_listValues();
      if(!Array.isArray(keys))return{ok:false,keys:[],error:'Stored Unmoved records could not be listed: storage returned '+(keys===null?'null':typeof keys)+' instead of a list.'};
      return{ok:true,keys:keys.filter(k=>typeof k==='string'&&k.indexOf(S.entryPrefix)===0)};
    }catch(err){return{ok:false,keys:[],error:'Stored Unmoved records could not be listed: '+stageErrText(err)}}
  }
  function pmmUnmovedAckRead(id){
    const r=pmmUnmovedRead(pmmUnmovedSpec().ackPrefix+id);
    if(!r.ok)return r;
    const a=r.value;
    if(a===null)return{ok:true,value:null};
    if(typeof a==='object'&&a.v===4&&a.id===id&&Number.isFinite(Number(a.at))&&Number(a.at)>0)return{ok:true,value:a};
    return{ok:false,value:null,error:'the stored Checked mark is malformed'};
  }
  // Fresh and uncached. Any unreadable part makes the scan not ok; unreadable entries stay
  // listed as placeholders so a record can never disappear silently.
  function pmmUnmovedScan(){
    const st=pmmUnmovedState(),S=pmmUnmovedSpec(),errors=[],byId=new Map();
    const fail=t=>{const d=pmmUnmovedText(t,200);if(!errors.includes(d))errors.push(d)};
    const ackOf=id=>{const r=pmmUnmovedAckRead(id);if(!r.ok){fail('A Checked mark could not be read ('+r.error+'); that pallet is shown as not checked.');return null}return r.value};
    const en=pmmUnmovedEnumerate();
    if(!en.ok)fail(en.error);
    const keys=en.ok?en.keys:[...st.written].map(id=>S.entryPrefix+id);
    for(const key of keys){
      const id=key.slice(S.entryPrefix.length),r=pmmUnmovedRead(key);
      if(r.ok&&pmmUnmovedValid(r.value,id)){byId.set(id,pmmUnmovedRecord(r.value,ackOf(id)));continue}
      const ack=ackOf(id);
      // Records are never deleted, so a listed key that reads empty is a failed read, not an absence.
      if(!r.ok)fail('A stored Unmoved record could not be read: '+r.error);
      else if(!ack)fail(r.value===null?'A listed Unmoved record read back empty; check it and mark it Checked.':'A stored Unmoved record is unreadable; check it and mark it Checked.');
      byId.set(id,{...pmmUnmovedRecord({id,pallet:'(unreadable record)',at:0,outcome:'unknown'},ack),source:'unreadable'});
    }
    const lr=pmmUnmovedRead(S.legacyKey);
    if(!lr.ok)fail('The older 3.9 Unmoved list could not be read: '+lr.error);
    else if(lr.value!==null){
      const v=lr.value;
      if(!v||typeof v!=='object'||!Array.isArray(v.items))fail('The older 3.9 Unmoved list is unreadable; its pallets cannot be shown.');
      else for(const item of v.items){
        const e=pmmUnmovedEntryFromLegacy(item);
        if(byId.has(e.id))continue;
        const ack=ackOf(e.id),bad=!item||typeof item!=='object'||!pmmUnmovedText(item.pallet,128);
        if(bad&&!ack)fail('An item in the older 3.9 Unmoved list is malformed; check it and mark it Checked.');
        byId.set(e.id,{...pmmUnmovedRecord(e,ack,'legacy'),...(bad?{source:'unreadable'}:{})});
      }
    }
    for(const [id,e] of st.memory)if(!byId.has(id))byId.set(id,pmmUnmovedRecord(e,ackOf(id),'memory'));
    const records=[...byId.values()].sort((a,b)=>b.at-a.at||(a.id<b.id?-1:1)),now=Date.now();
    // Read health is replaced by every scan, so a recovered store reports ok again.
    st.read={ok:!errors.length,enumerable:en.ok,errors:errors.map(detail=>({at:now,what:'read',detail})),at:now};
    st.cache={at:now,value:records};
    if(errors.length)stageLog('unmoved read',errors.join(' | '));
    return{ok:!errors.length,enumerable:en.ok,errors:errors.slice(),records:records.map(r=>({...r}))};
  }
  // Read-only: no migration and no storage writes. Unmigrated legacy items are mapped in memory.
  function pmmStageUnmovedList(){
    const st=pmmUnmovedState(),S=pmmUnmovedSpec(),now=Date.now();
    if(st.cache&&now-st.cache.at>=0&&now-st.cache.at<S.cacheMs)return st.cache.value.map(r=>({...r}));
    return pmmUnmovedScan().records;
  }
  function pmmUnmovedNorm(v){return pmmUnmovedText(v,160).toUpperCase()}
  // 4.0.4: informational only. Unmoved records never block selection or admission, so the result
  // is always ok and unblocked; pendingPallets lists the asked pallets with an unchecked record
  // and warning explains an unreadable store. One fresh full scan per call, never the display cache.
  function pmmStageUnmovedGuard(pallets,warehouse,scope,loadId){
    const open=(pendingPallets,warning)=>({ok:true,blocked:false,blockedPallets:[],pendingPallets,reason:'',warning:warning||''});
    try{
      const list=Array.isArray(pallets)?pallets:(pallets===undefined||pallets===null||pallets===''?[]:[pallets]);
      const scan=pmmUnmovedScan();
      const pending=scan.records.filter(r=>!r.checked);
      const warning=!scan.ok?(scan.errors[0]||'Unmoved records unreadable.'):
        pending.some(r=>r.source==='unreadable'||!r.pallet||r.pallet==='(unknown pallet)')?'An unchecked Unmoved record has no readable pallet ID; check it and mark it Checked.':'';
      const wh=pmmUnmovedNorm(warehouse),sc=pmmUnmovedText(scope,256),ld=pmmUnmovedText(loadId,64),hits=new Set();
      for(const r of pending){
        if(r.warehouse&&wh&&pmmUnmovedNorm(r.warehouse)!==wh)continue;
        if(r.scope&&sc&&r.scope!==sc)continue;
        if(r.loadId&&ld&&r.loadId!==ld)continue;
        hits.add(pmmUnmovedNorm(r.pallet));
      }
      return open([...new Set(list.filter(p=>typeof p==='string'&&hits.has(pmmUnmovedNorm(p))))],warning);
    }catch(err){return open([],'Unmoved check failed: '+stageErrText(err))}
  }
  function pmmStageUnmovedAdd(pallet,destination,reason,warehouse,context){
    const st=pmmUnmovedState(),S=pmmUnmovedSpec();
    try{
      const p=pmmUnmovedText(pallet,128);
      if(!p)return pmmUnmovedError('save','An Unmoved record had no pallet ID.');
      const ctx=context&&typeof context==='object'?context:{};
      const id=pmmUnmovedId(ctx),key=S.entryPrefix+id;
      const known=['requestId','attemptId','loadId','scope','status','proof'],extra={};
      for(const k of Object.keys(ctx))if(!known.includes(k)){try{const v=JSON.parse(JSON.stringify(ctx[k]));if(v!==undefined)extra[k]=v}catch(_){extra[k]='[unserializable]'}}
      const proof=ctx.proof===true,status=pmmUnmovedText(ctx.status,40)||'unknown';
      const entry={v:4,id,pallet:p,destination:pmmUnmovedText(destination,64),warehouse:pmmUnmovedText(warehouse,16),
        loadId:pmmUnmovedText(ctx.loadId,64),scope:pmmUnmovedText(ctx.scope,256),requestId:pmmUnmovedText(ctx.requestId,80),
        attemptId:pmmUnmovedText(ctx.attemptId,160),status,proof,outcome:pmmUnmovedOutcome(status,proof),
        reason:pmmUnmovedText(reason,400),at:Date.now(),source:'auto'};
      if(Object.keys(extra).length&&JSON.stringify(extra).length<=4000)entry.extra=extra;
      const keep=msg=>{st.memory.set(id,entry);pmmUnmovedInvalidate();pmmUnmovedError('save',msg);pmmStageAttentionRender();return false};
      const prior=pmmUnmovedRead(key);
      if(!prior.ok)return keep('Could not check storage before saving the Unmoved record for '+p+' ('+prior.error+'). It is shown in this tab only; note it before closing.');
      if(pmmUnmovedValid(prior.value,id)){st.written.add(id);st.memory.delete(id);pmmUnmovedInvalidate();pmmStageAttentionRender();return true}
      if(!pmmUnmovedWrite(key,entry))return keep('Could not save the Unmoved record for '+p+'. It is shown in this tab only; note it before closing.');
      st.written.add(id);st.memory.delete(id);pmmUnmovedInvalidate();pmmUnmovedPing();
      // Saved but not discoverable by other tabs or a later reload: not an auditable record.
      const en=pmmUnmovedEnumerate();
      if(!en.ok||!en.keys.includes(key)){pmmUnmovedError('save','Unmoved record for '+p+' was saved but cannot be listed back ('+(en.error||'not found in the stored list')+'); other tabs and reloads may not show it.');pmmStageAttentionRender();return false}
      pmmStageAttentionRender();
      return true;
    }catch(err){pmmUnmovedError('save','Unmoved record failed: '+stageErrText(err));try{pmmStageAttentionRender()}catch(_){}return false}
  }
  // Explicit, idempotent: deterministic ids let two tabs migrate concurrently to the same keys.
  // The legacy list is left in place; each original item is preserved whole under entry.legacy.
  function pmmStageUnmovedMigrate(){
    const st=pmmUnmovedState(),S=pmmUnmovedSpec();let count=0,failed=0;
    try{
      const lr=pmmUnmovedRead(S.legacyKey);
      if(!lr.ok){failed++;pmmUnmovedError('migrate','The older 3.9 Unmoved list could not be read: '+lr.error)}
      else{
        const v=lr.value,items=v&&typeof v==='object'&&Array.isArray(v.items)?v.items:[];
        for(const item of items){
          const e=pmmUnmovedEntryFromLegacy(item),key=S.entryPrefix+e.id,prior=pmmUnmovedRead(key);
          if(!prior.ok){failed++;continue}
          if(pmmUnmovedValid(prior.value,e.id)){st.written.add(e.id);continue}
          if(pmmUnmovedWrite(key,e)){st.written.add(e.id);count++}else failed++;
        }
      }
    }catch(err){failed++;pmmUnmovedError('migrate',stageErrText(err))}
    if(failed)pmmUnmovedError('migrate',failed+' older Unmoved item'+(failed===1?'':'s')+' could not be copied; they are still shown from the older list.');
    st.migrated={done:!failed,count,failed,at:Date.now()};
    pmmUnmovedInvalidate();
    if(count)pmmUnmovedPing();
    return !failed;
  }
  function pmmStageUnmovedAck(id){
    const S=pmmUnmovedSpec();
    try{
      if(typeof id!=='string'||!S.idPattern.test(id))return pmmUnmovedError('check','Unknown Unmoved record id.');
      const cur=pmmUnmovedAckRead(id);
      // An unreadable mark may already be a Checked mark: never overwrite it blindly.
      if(!cur.ok){pmmUnmovedInvalidate();return pmmUnmovedError('check','The Checked mark could not be read ('+cur.error+'); nothing was changed.')}
      if(cur.value){pmmUnmovedInvalidate();return true}
      const ok=pmmUnmovedWrite(S.ackPrefix+id,{v:4,id,at:Date.now()});
      pmmUnmovedInvalidate();
      if(!ok)return pmmUnmovedError('check','Could not save the Checked mark; the pallet stays listed.');
      pmmUnmovedPing();return true;
    }catch(err){return pmmUnmovedError('check',stageErrText(err))}
  }
  // Read health comes from the latest scan; save/check/migrate failures stay listed for this tab.
  function pmmStageUnmovedStatus(){
    const st=pmmUnmovedState();
    if(!st.read)pmmUnmovedScan();
    const read=st.read;
    return{ok:read.ok&&!st.errors.length&&!st.memory.size,readable:read.ok,enumerable:read.enumerable,unsaved:st.memory.size,
      errors:[...read.errors,...st.errors].map(e=>({...e})),checkedAt:read.at,migrated:{...st.migrated}};
  }
  function pmmStageUnmovedExport(){
    const list=pmmStageUnmovedList(),status=pmmStageUnmovedStatus();
    return{format:'pmm-unmoved-v4',exportedAt:new Date(Date.now()).toISOString(),version:typeof V==='string'?V:'',
      note:'Unmoved records list AutoStager attempts that were not confirmed moved. Informational only: Checked just archives a record and nothing is retried automatically.',
      entries:list.map(r=>({id:r.id,checked:r.checked,checkedAt:r.checkedAt?new Date(r.checkedAt).toISOString():null,
        at:r.at?new Date(r.at).toISOString():null,pallet:pmmUnmovedRedact(r.pallet,128),destination:pmmUnmovedRedact(r.destination,64),
        facility:pmmUnmovedRedact(r.warehouse,16),loadId:pmmUnmovedRedact(r.loadId,64),requestId:pmmUnmovedRedact(r.requestId,80),
        status:pmmUnmovedRedact(r.status,40),outcome:r.outcome,outcomeText:pmmStageUnmovedOutcomeLabel(r.outcome),proof:r.proof,
        reason:pmmUnmovedRedact(r.reason,400),source:r.source})),
      storage:{ok:status.ok,enumerable:status.enumerable,unsaved:status.unsaved,errors:status.errors.map(e=>({at:new Date(e.at).toISOString(),what:e.what,detail:pmmUnmovedRedact(e.detail,200)}))}};
  }
  function pmmStageUnmovedCopyText(list){
    const rows=(list||pmmStageUnmovedList()).filter(r=>!r.checked);
    const x=(v,n)=>pmmUnmovedRedact(v,n);
    return ['Unmoved pallets ('+rows.length+')',...rows.map(r=>[pmmStageTime(r.at),x(r.pallet,128),'->',x(r.destination,64)||'?',x(r.warehouse,16),r.loadId?'load '+x(r.loadId,64):'',
      pmmStageUnmovedOutcomeLabel(r.outcome),x(r.requestId,80),x(r.reason,300)].filter(Boolean).join(' | '))].join('\n');
  }
  function pmmUnmovedClip(text){try{GM_setClipboard(text,'text');return true}catch(_){try{navigator.clipboard?.writeText(text);return true}catch(__){return false}}}
  function pmmUnmovedDownload(){
    const text=JSON.stringify(pmmStageUnmovedExport(),null,2),name='pmm-unmoved-'+new Date(Date.now()).toISOString().replace(/[:.]/g,'-')+'.json';
    if(typeof downloadFile==='function'){downloadFile(name,text,'application/json');return}
    const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    try{setTimeout(()=>URL.revokeObjectURL(url),30000)}catch(_){}
  }
  function pmmStageUnmovedShow(){pmmUnmovedState().forceShow=true;pmmUnmovedState().open=true;pmmUnmovedPref(true);pmmStageAttentionRender()}
  function pmmUnmovedPref(open){
    try{if(open===undefined){const v=sessionStorage.getItem('pmm-unmoved-v4-open');return v===null?true:v==='1'}sessionStorage.setItem('pmm-unmoved-v4-open',open?'1':'0')}catch(_){}
    return open===undefined?true:open;
  }
  function pmmUnmovedEl(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
  function pmmUnmovedButton(text,label,fn){
    const b=pmmUnmovedEl('button','',text);b.type='button';if(label)b.setAttribute('aria-label',label);
    b.onclick=e=>{e.preventDefault();e.stopPropagation();fn(e,b)};return b;
  }
  function pmmUnmovedRow(it,archived){
    const row=pmmUnmovedEl('div','pmm-unmoved-row');row.dataset.outcome=it.outcome;row.dataset.unmovedId=it.id;
    const head=pmmUnmovedEl('div','pmm-unmoved-head');
    head.append(pmmUnmovedEl('b','',it.pallet),document.createTextNode(' → '+(it.destination||'unknown destination')+(it.warehouse?' · '+it.warehouse:'')+(it.at?' · '+pmmStageTime(it.at):'')));
    const meta=pmmUnmovedEl('div','pmm-unmoved-meta');
    meta.append(pmmUnmovedEl('span','pmm-unmoved-outcome',pmmStageUnmovedOutcomeLabel(it.outcome)),
      document.createTextNode([it.loadId?' · Load '+it.loadId:'',it.requestId?' · '+it.requestId:'',it.source==='memory'?' · NOT SAVED':'',it.source==='legacy'?' · from 3.9 list':''].join('')));
    row.append(head,meta);
    if(it.reason)row.appendChild(pmmUnmovedEl('div','pmm-unmoved-reason',it.reason));
    if(archived)row.appendChild(pmmUnmovedEl('div','pmm-unmoved-reason','Checked '+pmmStageTime(it.checkedAt)));
    else row.appendChild(pmmUnmovedButton('Checked','Mark '+it.pallet+' checked',(e,b)=>{
      if(!e.isTrusted)return;
      b.disabled=true;if(!pmmStageUnmovedAck(it.id))b.disabled=false;pmmStageAttentionRender();
    }));
    return row;
  }
  function pmmStageUnmovedCard(items,status){
    const st=pmmUnmovedState(),open=st.open===null?pmmUnmovedPref():st.open;
    const pending=items.filter(i=>!i.checked),archived=items.filter(i=>i.checked).sort((a,b)=>b.checkedAt-a.checkedAt);
    const card=pmmUnmovedEl('details','pmm-unmoved');card.open=open;card.setAttribute('role','region');card.setAttribute('aria-label','Unmoved pallets');
    if(pending.some(i=>i.outcome==='unknown'))card.dataset.severity='unknown';
    const summary=pmmUnmovedEl('summary','','Unmoved pallets: '+pending.length+' to check'+(archived.length?' · '+archived.length+' checked':'')+(status.ok?'':' · storage problem'));
    card.appendChild(summary);
    card.addEventListener('toggle',()=>{st.open=card.open;pmmUnmovedPref(card.open)});
    if(!status.ok){
      const warn=pmmUnmovedEl('div','pmm-unmoved-warn');warn.setAttribute('role','alert');
      warn.textContent=[!status.enumerable?'Stored records cannot be listed in this tab; the list may be incomplete.':'',
        status.unsaved?status.unsaved+' record'+(status.unsaved===1?' is':'s are')+' NOT saved (this tab only).':'',
        ...status.errors.slice(-3).map(e=>e.detail)].filter(Boolean).join(' ');
      card.appendChild(warn);
    }
    const list=pmmUnmovedEl('div','pmm-unmoved-list');
    for(const it of pending)list.appendChild(pmmUnmovedRow(it,false));
    if(!pending.length)list.appendChild(pmmUnmovedEl('div','pmm-unmoved-reason','Nothing left to check.'));
    card.appendChild(list);
    const actions=pmmUnmovedEl('div','pmm-unmoved-actions');
    actions.append(pmmUnmovedButton('Copy','Copy unmoved pallets',(e,b)=>{b.textContent=pmmUnmovedClip(pmmStageUnmovedCopyText(items))?'Copied':'Copy failed'}),
      pmmUnmovedButton('Export','Download unmoved pallets as JSON',()=>{try{pmmUnmovedDownload()}catch(err){pmmUnmovedError('export',stageErrText(err));pmmStageAttentionRender()}}));
    if(pending.length)actions.appendChild(pmmUnmovedButton('Mark all checked','Mark all unmoved pallets checked',e=>{
      if(!e.isTrusted||!confirm('Mark all '+pending.length+' unmoved pallets as checked? They move to the Checked archive; nothing is retried automatically.'))return;
      for(const it of pending)pmmStageUnmovedAck(it.id);pmmStageAttentionRender();
    }));
    const open2=pmmUnmovedEl('button','','Open Move App');open2.type='button';open2.onclick=pmmStageOpenMoveApp;actions.appendChild(open2);
    if(!pending.length&&status.ok)actions.appendChild(pmmUnmovedButton('Hide','Hide unmoved list',()=>{st.forceShow=false;pmmStageAttentionRender()}));
    card.appendChild(actions);
    if(archived.length){
      const arch=pmmUnmovedEl('details','pmm-unmoved-archive');
      arch.appendChild(pmmUnmovedEl('summary','','Checked archive ('+archived.length+')'));
      for(const it of archived.slice(0,pmmUnmovedSpec().archiveShown))arch.appendChild(pmmUnmovedRow(it,true));
      if(archived.length>pmmUnmovedSpec().archiveShown)arch.appendChild(pmmUnmovedEl('div','pmm-unmoved-reason','Showing latest '+pmmUnmovedSpec().archiveShown+'; Export includes all.'));
      card.appendChild(arch);
    }
    card.appendChild(pmmUnmovedEl('div','pmm-unmoved-reason','Checked just archives the note; nothing is retried automatically. AutoStager skips a pallet with an unconfirmed outcome for 24 h; clicking Stage on it works.'));
    return card;
  }
  function pmmStageAttentionDark(){try{return read(K.theme,'light')==='dark'}catch(_){return false}}
  function pmmStageAttentionRender(){
    try{
      const entries=pmmStageAttentionEntries(),st=pmmUnmovedState(),unmoved=pmmStageUnmovedList(),status=pmmStageUnmovedStatus();
      const showUnmoved=unmoved.some(i=>!i.checked)||!status.ok||(st.forceShow&&unmoved.length>0);
      const host=pmmStageAttentionHost.el||((entries.length||showUnmoved)?pmmStageAttentionHost():null);
      if(!host)return;
      if(!entries.length&&!showUnmoved){host.replaceChildren();host.remove();return}
      if(!host.isConnected)pmmStageAttentionHost();
      if(typeof pmmStageDashboardStyle==='function')pmmStageDashboardStyle();
      host.classList.toggle('pmm-dark',pmmStageAttentionDark());
      host.replaceChildren(...(showUnmoved?[pmmStageUnmovedCard(unmoved,status)]:[]),...entries.map(entry=>{
        const card=document.createElement('div');
        card.className='pmm-attention-card';
        card.setAttribute('role','alert');
        const title=document.createElement('div');title.className='pmm-attention-title';
        title.textContent=(entry.kind==='skipped'?'Pallet skipped, needs checking':'Staging needs attention')+(entry.when?' ('+entry.when+')':'');
        const body=document.createElement('div');
        body.textContent=entry.kind==='skipped'
          ?'Pallet '+entry.pallet+' -> '+entry.destination+': 0 containers moved, or it needs to be checked. Skipped; AutoStager continues with the next pallet after 15 seconds. '+(entry.message?entry.message+' ':'')+'Nothing is retried automatically. Check the pallet in the Move App.'
          :'Pallet '+entry.pallet+' to '+entry.destination+': '+entry.status+'. '+(entry.message?entry.message+' ':'')+'Nothing is retried automatically. Check the pallet in the Move App.';
        const actions=document.createElement('div');actions.className='pmm-unmoved-actions';
        const open=document.createElement('button');open.type='button';open.textContent='Open Move App';open.onclick=pmmStageOpenMoveApp;
        const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='Dismiss';
        dismiss.setAttribute('aria-label','Dismiss staging notice for '+entry.pallet);
        dismiss.onclick=e=>{e.preventDefault();e.stopPropagation();pmmStageAttentionDismiss(entry.id)};
        actions.append(open,dismiss);card.append(title,body,actions);
        return card;
      }));
    }catch(err){stageLog('attention notice',err)}
  }
  function pmmStageAttentionDismiss(id){
    const entries=pmmStageAttentionEntries(),i=entries.findIndex(e=>e.id===id);
    if(i>=0)entries.splice(i,1);
    pmmStageAttentionRender();
  }
  function pmmStageAttentionAdd(entry){
    try{
      const entries=pmmStageAttentionEntries();
      // The newest outcome for a pallet supersedes that pallet's older notice; other pallets stay.
      const same=entries.findIndex(e=>e.palletKey===entry.palletKey);
      if(same>=0)entries.splice(same,1);
      entries.unshift(entry);
      entries.splice(5);
      pmmStageAttentionRender();
    }catch(err){stageLog('attention notice',err)}
  }
  function pmmStageAttentionNotify(key,pallet,destination,status,message,kind){
    pmmStageAttentionNotify.seq=(pmmStageAttentionNotify.seq||0)+1;
    pmmStageAttentionAdd({id:pmmStageAttentionNotify.seq,palletKey:key,pallet:String(pallet),destination:String(destination),
      status:String(status),message:String(message||'').slice(0,400),kind:kind==='skipped'?'skipped':'',when:pmmStageTime(Date.now())});
  }
  function pmmBindStageControls(box){
    box.querySelectorAll('.pmm-stage-outcome .pmm-stage-open').forEach(open=>{open.onclick=pmmStageOpenMoveApp});
    pmmUnmovedListen();
    pmmStageAttentionRender();
    box.querySelectorAll('.pmm-stage-control').forEach(control=>{
      const select=control.querySelector('.pmm-stage-destination'),button=control.querySelector('.pmm-stage-submit'),note=control.querySelector('.pmm-stage-note');
      control.querySelector('.pmm-stage-open').onclick=pmmStageOpenMoveApp;
      select.onchange=()=>{button.disabled=!select.value;button.textContent=select.value?'Stage to '+select.value:'Stage to selected station'};
      button.onclick=async e=>{
        e.preventDefault();e.stopPropagation();
        if(!e.isTrusted)return;
        const pallet=control.dataset.stagePallet,destination=select.value,h=getHierarchy();
        const key=pmmStageUiKey(h,pallet),states=pmmStageUiState();
        if(states.get(key)?.locked)return;
        const records=currentHistory(read(K.results,[]),h);
        const resolved=pmmStageResolve(h,records,pallet),current=resolved.destinations,p=h.pallets?.[pallet];
        let reason='';
        if(loadScopeKey(h)!==control.dataset.stageScope)reason='Load changed. Reopen this pallet before staging.';
        else if(String(h.destinationWarehouse||'')!==control.dataset.stageWarehouse)reason='Destination building changed. Reopen this pallet before staging.';
        else if(!current.includes(destination))reason='Station evidence changed.'+(resolved.reason?' '+resolved.reason:'')+' Reopen this pallet before staging.';
        else if(!p||!(p.cases?.length||p.totes?.length))reason='No remaining mapped contents to stage.';
        else if(!/^[A-Z]{3}\d$/.test(String(h.destinationWarehouse||'')))reason='A verified destination building is required.';
        else if(duplicateViewOnly()||isPaused()||isDisplayHold())reason='Resume the active monitor and turn Display Hold off before staging.';
        else if(h.source!=='aft')reason='A recorded AFT movement is required for staging.';
        if(reason){note.textContent=reason;return}
        const scope=control.dataset.stageScope,warehouse=control.dataset.stageWarehouse;
        const update=(message,locked)=>{states.set(key,{message,locked});for(const el of box.querySelectorAll('.pmm-stage-control')){if(el.dataset.stagePallet===pallet&&el.dataset.stageScope===scope&&el.dataset.stageWarehouse===warehouse){el.querySelector('.pmm-stage-note').textContent=message;el.querySelector('.pmm-stage-submit').disabled=locked;el.querySelector('.pmm-stage-destination').disabled=locked}}};
        update('Staging '+pallet+' to '+destination+'… Do not use the Move App tab until this finishes.',true);
        try{
          // scope/warehouse/key are the click-time snapshot; h may change while awaiting.
          const result=await pmmStageSubmit({pallet,destination,scope,warehouse});
          const status=String(result?.status||'unknown');
          const message=String(result?.message||status);
          // Keep any accepted/uncertain attempt locked locally; helper journal is authoritative across reloads.
          // Only explicitly no-action outcomes unlock for a fresh deliberate click.
          update(message,!['rejected','not-ready','no-helper','not-armed','warehouse-mismatch','busy','expired'].includes(status));
          if(status==='success')pmmStageCueRefresh();
          else if(pmmStageNeedsAttention(status))pmmStageAttentionNotify(key,pallet,destination,status,message);
        }catch(error){
          const message='Outcome unknown. Check the Move App before doing anything else; no automatic retry.';
          update(message,true);
          pmmStageAttentionNotify(key,pallet,destination,'unknown',message);
        }
      };
    });
  }
  // PMM-CHUNK-END stage-ui

  // PMM-CHUNK-BEGIN auto-stage
  // Tab-session desired ON survives reload; active consent and accepted snapshot do not. No pallet queue or new timer.
  function pmmAutoState(){return pmmAutoState.value||(pmmAutoState.value={desired:false,initialized:false,locking:false,lockRelease:null,intentId:'',generation:'',restoring:false,claimOwned:false,revokePending:false,quarantine:false,lockWaitAt:0,lockNextAt:0,enabled:false,pending:false,owner:'',helperId:'',scope:'',warehouse:'',loadId:'',shipRef:'',href:'',note:'OFF',busy:false,attempted:new Set(),snapshot:null,listener:null,lastRenew:0,inFlight:null,successNextAt:0,successMonoNext:NaN,errorNextAt:0,errorMonoNext:NaN,lastSkip:null,errorCooldown:null,cooldownRestored:false,lastStop:null,lastWait:null,unmovedWarning:'',guardWarning:''})}
  function pmmAutoSave(){
    const s=pmmAutoState();
    try{
      const value=JSON.stringify({v:2,on:s.desired,intentId:s.intentId,generation:s.generation,scope:s.scope,warehouse:s.warehouse,loadId:s.loadId,shipRef:s.shipRef,href:s.href,helperId:s.helperId,owner:s.owner,attempted:[...s.attempted],inFlight:s.inFlight,lastSkip:s.lastSkip,errorCooldown:s.errorCooldown,lastStop:s.lastStop,lastWait:s.lastWait});
      sessionStorage.setItem('pmm-auto-stage-choice-v3917',value);
      return sessionStorage.getItem('pmm-auto-stage-choice-v3917')===value;
    }catch(_){return false}
  }
  function pmmAutoReloadNavigation(){try{return performance.getEntriesByType('navigation')[0]?.type==='reload'}catch(_){return false}}
  function pmmAutoListen(){
    const s=pmmAutoState();
    if(s.listener===null)s.listener=GM_addValueChangeListener(stageSpec().helperKey,()=>pmmAutoWake());
    if(!pmmAutoState.unloadBound){
      window.addEventListener('pagehide',()=>{pmmAutoSuspend('Reloading; ON will resume from accepted AFT data.');s.lockRelease?.();s.lockRelease=null});
      window.addEventListener('popstate',()=>pmmAutoStop('Navigation changed.'));
      window.addEventListener('hashchange',()=>pmmAutoStop('Navigation changed.'));
      pmmAutoState.unloadBound=true;
    }
  }
  function pmmAutoLock(){
    const s=pmmAutoState();if(s.lockRelease||s.locking||!s.desired||Date.now()<s.lockNextAt)return;
    s.locking=true;const intent=s.intentId;
    try{
      if(!navigator.locks?.request)throw Error('Web Locks unavailable');
      navigator.locks.request('pmm-auto-choice-v3917:'+intent,{mode:'exclusive',ifAvailable:true},lock=>{
        s.locking=false;
        if(!s.desired||s.intentId!==intent||_pageUnloading||_pageRestored)return;
        if(!lock){if(!s.lockWaitAt)s.lockWaitAt=Date.now();if(Date.now()-s.lockWaitAt<5000){s.lockNextAt=Date.now()+500;s.note='ON; waiting for previous document ownership to release.';pmmAutoPaint();return}pmmAutoStop('This saved ON choice is active in another tab. Enable explicitly here if needed.');return}
        return new Promise(resolve=>{
          s.lockRelease=resolve;
          const key='pmm-auto-choice-claim-v3917:'+s.intentId;
          if(s.restoring){
            const claim=stageGmRead(key,null);
            if(!claim||claim.on!==true||claim.generation!==s.generation){pmmAutoStop('Saved ON choice was stopped or already restored in another document.');return}
          }
          s.claimOwned=true;s.generation=stageRandomHex(24);
          const claim={on:true,generation:s.generation};
          if(!stageGmWrite(key,claim)||stageGmRead(key,null)?.generation!==s.generation||!pmmAutoSave()){pmmAutoStop('Could not save exclusive reload ownership.');return}
          s.restoring=false;
          // Revoke old document consent only after exclusive, single-use restore ownership.
          if(s.owner&&!pmmAutoConsent(false)){pmmAutoStop('Could not revoke previous document consent.');return}
          pmmAutoWake();
        });
      }).catch(()=>{s.locking=false;pmmAutoStop('Tab ownership could not be verified.')});
    }catch(_){s.locking=false;pmmAutoStop('Tab ownership could not be verified.')}
  }
  function pmmAutoRestore(){
    const s=pmmAutoState();if(s.initialized)return;s.initialized=true;
    try{
      const raw=sessionStorage.getItem('pmm-auto-stage-choice-v3917');if(!raw)return;
      const v=JSON.parse(raw);
      if(v?.v===2){
        const mark=r=>r&&Number.isFinite(r.at)&&typeof r.reason==="string"?{at:r.at,reason:pmmAutoDiagnosticText(r.reason)}:null;
        s.lastStop=mark(v.lastStop);s.lastWait=mark(v.lastWait);
        if(v.on!==true&&s.lastStop)s.note=s.lastStop.reason;
      }
      if(v?.on!==true&&v?.v!==2)return;
      if(v?.v!==2){s.quarantine=true;s.note='Older saved ON state cannot be verified after upgrade. Close this tab and check Move App before a new opt-in.';return}
      if(typeof v.intentId!=='string'||!/^intent-[0-9a-f]{24}$/.test(v.intentId)||typeof v.generation!=='string'||!/^[0-9a-f]{24}$/.test(v.generation)||!Array.isArray(v.attempted)||v.attempted.length>500||!v.attempted.every(x=>typeof x==='string'&&stageValidId(x))||
        (v.lastSkip!==undefined&&v.lastSkip!==null&&(!v.lastSkip||typeof v.lastSkip!=='object'||!stageSpec().requestIdPattern.test(v.lastSkip.requestId||'')||!stageValidId(v.lastSkip.pallet)||!stageValidId(v.lastSkip.destination)||typeof v.lastSkip.helperId!=='string'||!v.lastSkip.helperId||!Number.isFinite(v.lastSkip.at)||v.lastSkip.at>Date.now()||!v.attempted.includes(v.lastSkip.pallet)))||typeof v.scope!=='string'||typeof v.loadId!=='string'||typeof v.shipRef!=='string'||!stageValidWarehouse(v.warehouse)||typeof v.helperId!=='string'||typeof v.owner!=='string'){
        s.quarantine=true;s.note='Saved AutoStager protection is malformed. Check Move App and close this tab; no opt-in or replay is permitted here.';return;
      }
      const candidate={...v,attempted:new Set(v.attempted)},m=v.inFlight;
      if((v.errorCooldown!=null&&!pmmAutoCooldownValid(v.errorCooldown,candidate))||
        (m!=null&&(!m||typeof m!=='object'||Array.isArray(m)||!stageValidId(m.pallet)||!stageValidId(m.destination)||!candidate.attempted.has(m.pallet)||
          m.scope!==v.scope||m.warehouse!==v.warehouse||m.helperId!==v.helperId||!Number.isFinite(m.at)||m.at<=0||m.at>Date.now()||
          typeof m.requestId!=='string'||(m.requestId&&!stageSpec().requestIdPattern.test(m.requestId))||
          (m.attemptId!==undefined&&(typeof m.attemptId!=='string'||!m.attemptId||m.attemptId.length>180))))){
        s.quarantine=true;s.note='Saved request or error pause is invalid. Check Move App and close this tab; no opt-in or replay is permitted here.';return;
      }
      const resume=v.on===true&&pmmAutoReloadNavigation()&&v.href===location.href;
      Object.assign(s,{desired:resume,restoring:resume,intentId:v.intentId,generation:v.generation,scope:v.scope,warehouse:v.warehouse,loadId:v.loadId,shipRef:v.shipRef,href:v.href,helperId:v.helperId,owner:v.owner,attempted:new Set(v.attempted),inFlight:v.inFlight||null,lastSkip:v.lastSkip||null,errorCooldown:v.errorCooldown===undefined?null:v.errorCooldown,cooldownRestored:false,note:resume?'ON restored; checking recorded movements against the displayed AFT load.':v.on===true?'ON was not resumed after navigation. Saved attempt protection remains; enable explicitly for this load after checking Move App.':s.note});
      if(v.on===true&&!resume){
        if(!pmmAutoSave()){s.quarantine=true;s.note='Could not save OFF after navigation. Check Move App and close this tab; no opt-in here.';return}
        if(s.owner&&!pmmAutoConsent(false)){s.quarantine=true;s.note='Could not revoke the previous Move App consent after navigation. Disarm Move App and close this tab.';return}
      }
      if(s.desired){pmmAutoListen();pmmAutoLock()}
    }catch(_){s.quarantine=true;s.desired=false;s.note='Saved AutoStager protection could not be read. Check Move App and close this tab; no opt-in or replay is permitted here.'}
  }
  function pmmAutoWake(){
    if(pmmAutoState.wakeQueued)return;pmmAutoState.wakeQueued=true;
    queueMicrotask(()=>{pmmAutoState.wakeQueued=false;pmmAutoTick()});
  }
  function pmmAutoDelaySuccess(){
    const s=pmmAutoState(),gap=stageAutoSpec().gapMs,m=stageMono();
    s.successNextAt=Math.max(Number(s.successNextAt)||0,Date.now()+gap);
    if(Number.isFinite(m))s.successMonoNext=m+gap;
  }
  function pmmAutoErrorDelay(at,observed=false){
    const s=pmmAutoState(),gap=stageAutoSpec().errorGapMs,m=stageMono(),now=Date.now();
    s.errorNextAt=Math.max(Number(s.errorNextAt)||0,Math.min(at+gap,now+gap),observed?now+gap:0);
    if(Number.isFinite(m))s.errorMonoNext=Math.max(Number(s.errorMonoNext)||0,m+(observed?gap:Math.max(0,Math.min(gap,at+gap-now))));
  }
  // 4.0: durable error delays are request/attempt-scoped, never evidence of a move outcome.
  // A new document cannot compare monotonic clocks. Conservatively wait a full 15s again.
  function pmmAutoCooldownValid(c,s){
    const A=stageAutoSpec();
    return !!c&&c.v===1&&c.scope===s.scope&&c.loadId===s.loadId&&c.warehouse===s.warehouse&&c.helperId===s.helperId&&
      typeof c.pallet==='string'&&!!stageValidId(c.pallet)&&s.attempted.has(c.pallet)&&
      typeof c.destination==='string'&&!!stageValidId(c.destination)&&typeof c.attemptId==='string'&&!!c.attemptId&&c.attemptId.length<=180&&
      typeof c.requestId==='string'&&(!c.requestId||stageSpec().requestIdPattern.test(c.requestId))&&
      Number.isFinite(c.at)&&c.at>0&&Number.isFinite(c.deadline)&&c.deadline===c.at+A.errorGapMs&&c.at<=Date.now();
  }
  function pmmAutoCooldownStart(move,reason){
    const s=pmmAutoState(),at=Date.now();
    const c={v:1,scope:s.scope,loadId:s.loadId,warehouse:s.warehouse,helperId:s.helperId,
      pallet:move?.pallet,destination:move?.destination,requestId:String(move?.requestId||''),
      attemptId:String(move?.attemptId||move?.requestId||s.intentId+':'+move?.pallet),at,deadline:at+stageAutoSpec().errorGapMs,
      reason:String(reason||'Error pause').slice(0,240)};
    if(!pmmAutoCooldownValid(c,s)){pmmAutoStop('Error attempt identity could not be saved safely. Check Move App; nothing retried.');return false}
    s.errorCooldown=c;s.cooldownRestored=true;pmmAutoErrorDelay(at,true);
    if(!pmmAutoSave()){pmmAutoStop('Could not save the 15-second error pause. Check Move App.');return false}
    return true;
  }
  function pmmAutoCooldownRestored(){
    const s=pmmAutoState(),c=s.errorCooldown;if(c===null||c===undefined)return true;
    if(!pmmAutoCooldownValid(c,s)){pmmAutoStop('Saved error pause is invalid or the clock moved backward. Nothing retried.');return false}
    if(!s.cooldownRestored){
      c.at=Date.now();c.deadline=c.at+stageAutoSpec().errorGapMs;
      s.cooldownRestored=true;pmmAutoErrorDelay(c.at,true);
      if(!pmmAutoSave()){pmmAutoStop('Could not preserve the error pause after reload. Nothing retried.');return false}
    }
    const mono=stageMono();
    if(!Number.isFinite(mono)||!Number.isFinite(s.errorMonoNext)){pmmAutoStop('Safety timer is unavailable. Check Move App; nothing retried.');return false}
    if(Date.now()>=Math.max(c.deadline,s.errorNextAt||0,stageAutoDurableNextAt())&&
      !(Number.isFinite(mono)&&Number.isFinite(s.errorMonoNext)&&mono<s.errorMonoNext)){
      s.errorCooldown=null;s.cooldownRestored=false;
      if(!pmmAutoSave()){pmmAutoStop('Could not save completion of the error pause. Nothing retried.');return false}
    }
    return true;
  }
  function pmmAutoUnmoved(move,reason,status,proof=false){
    const s=pmmAutoState();
    try{
      if(pmmStageUnmovedAdd(move.pallet,move.destination,reason,s.warehouse,{requestId:move.requestId||'',
        attemptId:move.attemptId||move.requestId||s.intentId+':'+move.pallet,loadId:s.loadId,scope:s.scope,status:String(status||'unknown'),proof})===true)return true;
    }catch(err){stageLog('unmoved record',err)}
    // 4.0.4: Unmoved is informational. The attempted set and the per-pallet guard keep the pallet skipped.
    s.unmovedWarning='The Unmoved record for '+move.pallet+' could not be saved; note this pallet and check it in Move App.';
    return false;
  }
  // Success auto-releases the guard, so a fresh tab (empty attempted set) could re-stage a pallet
  // AFT still lists while it lags. A recent journalled success skips it; an unreadable journal stages.
  const PMM_AUTO_RECENT_SUCCESS_MS=30*60*1000;
  function pmmAutoRecentSuccess(pallet,warehouse){
    try{
      const now=Date.now();
      return stageJournalAll().some(r=>r.status==='success'&&r.pallet===pallet&&r.warehouse===warehouse&&
        Math.abs(now-Number(r.at))<PMM_AUTO_RECENT_SUCCESS_MS);
    }catch(_){return false}
  }
  // A corrupt guard record never holds a pallet (fail-open): only a live, readable guard skips it.
  function pmmAutoGuarded(pallet,warehouse){
    const g=stageHoldFor(pallet,warehouse);
    return !!g&&!g.unreadable||pmmAutoRecentSuccess(pallet,warehouse);
  }
  function pmmAutoSuccessNextAt(helper){
    const s=pmmAutoState(),m=stageMono(),now=Date.now();
    const left=mono=>Number.isFinite(m)&&Number.isFinite(mono)&&mono>m?Math.ceil(mono-m):0;
    return Math.max(stageAutoDurableNextAt(),Number(helper?.autoNextAt)||0,Number(s.successNextAt)||0,
      Number(s.errorNextAt)||0,Number(s.errorCooldown?.deadline)||0,left(s.successMonoNext)?now+left(s.successMonoNext):0,
      left(s.errorMonoNext)?now+left(s.errorMonoNext):0);
  }
  function pmmAutoSkipMatch(done,m,s){
    return !!m&&!!done&&stageSpec().requestIdPattern.test(m.requestId||'')&&
      done.requestId===m.requestId&&done.pallet===m.pallet&&done.destination===m.destination&&
      done.scope===s.scope&&done.warehouse===s.warehouse&&done.helperId===m.helperId&&
      done.autoSkipSafe===true&&!!stageAutoSkipReason(done.status,done.skipReason)&&
      Number.isFinite(Number(done.at))&&Number.isFinite(m.at)&&Number(done.at)>=m.at&&Number(done.at)<=Date.now();
  }
  // The exact request journal proof decides a skip. The guard only vetoes it when a live guard of a
  // different request exists for the pallet. A guard record that was reset, quarantined or evicted
  // between outcome and check fails open with a visible, non-blocking note.
  function pmmAutoHoldOk(done,pallet,requestId,s){
    const h=stageHoldFor(pallet,s.warehouse);
    if(h&&!h.unreadable)return h.requestId===requestId;
    if(done&&done.skipReason==='not-attempted')return true;
    let rec=null;try{rec=stageHoldsRecord()}catch(_){}
    if(!rec||rec.corrupt||!rec.holds.some(x=>stageClean(x.requestId)===requestId))
      s.guardWarning='Guard record was unreadable or reset before '+pallet+' was checked; the request journal decided the outcome.';
    return true;
  }
  function pmmAutoSkipDone(done,m){
    const s=pmmAutoState();
    if(!pmmAutoSkipMatch(done,m,s)||!s.attempted.has(m.pallet)||
      !pmmAutoHoldOk(done,m.pallet,m.requestId,s)){pmmAutoBump({...m,status:done?.status||'unknown'},'Error outcome could not be verified.');return false}
    s.lastSkip={requestId:m.requestId,pallet:m.pallet,destination:m.destination,helperId:m.helperId,at:Number(done.at)};
    s.errorRestored=true;
    if(!pmmAutoCooldownStart(m,'Verified '+done.skipReason))return false;
    if(!pmmAutoSave()){pmmAutoStop('Could not save the skipped attempt; check Move App.');return false}
    if(!s.desired)return false;
    const why=done.skipReason==='not-attempted'?'Refused before any scan. 0 containers moved.':done.skipReason==='source-rejected'?'Source was rejected. No move was performed.':'Move App confirmed 0 containers moved.';
    pmmAutoUnmoved(m,why,done.status,true);
    s.inFlight=null;
    if(!pmmAutoSave()){pmmAutoStop('Could not save the resolved request; check Move App.');return false}
    s.note=done.skipReason==='not-attempted'?'Skipped '+m.pallet+' (nothing was attempted). Waiting 15s before checking the next eligible pallet.':'Confirmed error on '+m.pallet+'. Waiting 15s before checking the next eligible pallet; it is listed under Unmoved pallets.';
    return true;
  }
  function pmmAutoSkipRestored(){
    const s=pmmAutoState(),last=s.lastSkip;if(!pmmAutoCooldownRestored())return false;if(!last)return true;
    const done=stageJournalGet(last.requestId),m={requestId:last.requestId,pallet:last.pallet,destination:last.destination,helperId:last.helperId,at:last.at};
    if(!done||!pmmAutoSkipMatch(done,m,s)||Number(done.at)!==last.at||!s.attempted.has(last.pallet)){
      pmmAutoStop('Saved error pause cannot be verified against the request journal. Check Move App; nothing retried.');return false;
    }
    if(!s.errorRestored){pmmAutoErrorDelay(last.at);s.errorRestored=true}
    const mNow=stageMono();
    if(!Number.isFinite(mNow)||!Number.isFinite(s.errorMonoNext)){pmmAutoStop('Safety timer is unavailable. Check Move App; nothing retried.');return false}
    if(Date.now()>=Math.max(s.errorNextAt,last.at+stageAutoSpec().errorGapMs,stageAutoDurableNextAt())&&
      !(Number.isFinite(mNow)&&Number.isFinite(s.errorMonoNext)&&mNow<s.errorMonoNext)){
      s.lastSkip=null;s.errorRestored=false;
      if(!pmmAutoSave()){pmmAutoStop('Could not save the verified error pause.');return false}
    }
    return true;
  }
  function pmmAutoSuspend(reason){
    const s=pmmAutoState();if(s.revokePending){pmmAutoFinishStop();return}
    const was=s.enabled||s.pending,changed=s.note!==reason;s.note=reason;s.lastWait={at:Date.now(),reason:String(reason).slice(0,300)};
    if(changed&&!pmmAutoSave()){pmmAutoStop('Could not save the waiting state safely.');return}
    s.enabled=false;s.pending=false;
    if(was){const revoked=pmmAutoConsent(false),stopped=pmmAutoCommand('stop');if(!revoked&&!stopped){pmmAutoStop('Could not suspend safely. Disarm Move App.');return}}
    pmmAutoPaint();
  }
  function pmmAutoRecover(){
    const s=pmmAutoState(),m=s.inFlight;if(s.busy)return true;if(!pmmAutoCooldownRestored())return false;if(!m)return pmmAutoSkipRestored();
    const same=r=>r&&r.requestId===m.requestId&&r.pallet===m.pallet&&r.destination===m.destination&&r.scope===s.scope&&r.warehouse===s.warehouse&&r.helperId===m.helperId;
    if(!stageSpec().requestIdPattern.test(m.requestId||'')||!Number.isFinite(m.at)||Date.now()<m.at){pmmAutoRecoveredFailure(m,'An interrupted request has no verified identity.');return false}
    const done=stageJournalGet(m.requestId);
    if(done){
      if(pmmAutoSkipMatch(done,m,s)&&pmmAutoHoldOk(done,m.pallet,m.requestId,s))return pmmAutoSkipDone(done,m);
      if(!same(done)||done.status!=='success'||!Number.isFinite(Number(done.at))||Number(done.at)<m.at||Number(done.at)>Date.now()){pmmAutoRecoveredFailure(m,'Interrupted staging did not have a verified success.');return false}
      pmmAutoDelaySuccess();s.inFlight=null;if(!pmmAutoSave()){pmmAutoStop('Could not save the resolved request.');return false}
      return true;
    }
    if(Date.now()-m.at<=120000&&(same(stageRequestRecord())||same(stageProgressRecord()))){s.note='Waiting for the already-submitted move; it will not be replayed.';return false}
    pmmAutoRecoveredFailure(m,'Interrupted staging outcome is unknown.');return false;
  }
  // An unverified outcome never turns ON off. The pallet stays attempted for this load and its guard skips it
  // for 24 h; it is listed under Unmoved pallets, never replayed, and the next eligible pallet starts after
  // 15 s on a clean source screen.
  function pmmAutoBump(move,why){
    const s=pmmAutoState();
    if(!move||!move.pallet){pmmAutoSuspend('Error before selecting a pallet; ON is retained.');return}
    if(!pmmAutoCooldownStart(move,why))return;
    const listed=pmmAutoUnmoved(move,String(why||'').slice(0,240)+' Outcome not confirmed: check Move App. AutoStager skips this pallet; it is never replayed.',move.status||'unknown');
    s.inFlight=null;
    if(!pmmAutoSave()){pmmAutoStop('Could not save state after an error; check Move App.');return}
    if(s.desired)pmmAutoSuspend('Error on '+move.pallet+'; it is skipped'+(listed?'':' (Unmoved record not saved)')+'. Waiting 15s and for a clean Move App before the next eligible pallet; ON is retained.');
  }
  function pmmAutoRecoveredFailure(m,reason){pmmAutoBump(m,reason)}
  function pmmAutoContext(h){
    if(!h||h.source!=='aft'||!pmmStageLiveIdentityMatches(h))return 'A verified AFT load and building are required.';
    if(_pageUnloading||_pageRestored||!monitorStarted||monitorError||!lastSnapshotAccepted)return 'Monitor data is unavailable or unconfirmed.';
    if(isPaused()||isDisplayHold()||duplicateViewOnly()||!sourceTrackingActive(h))return 'Resume the active AFT monitor and turn Display Hold off.';
    return '';
  }
  // Snapshot acceptance guards the displayed identity/revision, not physical freshness.
  // No age limit, refresh-confirmation requirement or in-document movement fingerprint.
  function pmmAutoAccepted(h,revision){
    const s=pmmAutoState();s.snapshot=null;
    if(h?.source!=='aft'||revision!==_domRevision||!pmmStageLiveIdentityMatches(h))return;
    s.snapshot={scope:loadScopeKey(h),loadId:h.loadId,shipRef:h.shipRef,warehouse:h.destinationWarehouse,revision};
  }
  function pmmAutoSnapshotMatches(h){
    const c=pmmAutoState().snapshot;
    return !!c&&c.revision===_domRevision&&c.scope===loadScopeKey(h)&&c.loadId===h.loadId&&c.shipRef===h.shipRef&&c.warehouse===h.destinationWarehouse;
  }
  function pmmAutoConsent(enabled){
    const s=pmmAutoState();if(!s.owner)return false;
    return stageGmWrite(stageAutoSpec().consentPrefix+s.owner,{owner:s.owner,helperId:s.helperId,scope:s.scope,warehouse:s.warehouse,enabled,at:Date.now()});
  }
  function pmmAutoCommand(action){
    const s=pmmAutoState();
    return stageGmWrite(stageAutoSpec().controlKey,{id:'auto-'+Date.now()+'-'+stageRandomHex(8),action,owner:s.owner,scope:s.scope,warehouse:s.warehouse,helperId:s.helperId,at:Date.now()});
  }
  function pmmAutoFinishStop(){
    const s=pmmAutoState();
    // Keep exclusive document ownership until at least one helper revocation is durable.
    if(s.revokePending){
      const revoked=pmmAutoConsent(false),stopped=pmmAutoCommand('stop');
      if(!revoked&&!stopped){s.note=(s.stopNote||s.lastStop?.reason||'Stopped.')+' Stop could not be saved; disarm Move App now. Retrying on monitor activity.';pmmAutoPaint();return false}
      s.revokePending=false;s.note=s.stopNote||s.lastStop?.reason||'Stopped.';
    }
    if(s.lockRelease&&s.claimOwned){
      const key='pmm-auto-choice-claim-v3917:'+s.intentId,claim=stageGmRead(key,null);
      if(claim?.generation===s.generation)stageGmDelete(key);
    }
    if(s.listener!==null){try{GM_removeValueChangeListener(s.listener)}catch(_){}s.listener=null}
    s.lockRelease?.();s.lockRelease=null;s.claimOwned=false;
    return true;
  }
  function pmmAutoStop(reason='Stopped by operator.'){
    const s=pmmAutoState(),was=s.enabled||s.pending;s.desired=false;s.enabled=false;s.pending=false;s.note=reason+(s.busy?' An already-started move may still finish; check Move App.':'');
    s.lastStop={at:Date.now(),reason:String(reason).slice(0,300)};
    s.revokePending=s.revokePending||!!(s.owner&&((s.lockRelease&&s.claimOwned)||was));
    // Save OFF first. A later pagehide suspension never writes ON back.
    if(!s.quarantine&&!pmmAutoSave()){try{sessionStorage.removeItem('pmm-auto-stage-choice-v3917')}catch(_){}s.note+=' Saved choice could not be cleared; close this monitor tab.'}
    s.stopNote=s.note;pmmAutoFinishStop();pmmAutoPaint();
  }
  // Diagnostic records are presentation-only. They never authorize or replay a move.
  function pmmAutoDiagnosticText(value){
    return String(value??'').replace(/https?:\/\/\S+/gi,'[link omitted]')
      .replace(/\b(Bearer\s+)\S+/gi,'$1[redacted]')
      .replace(/\b(token|password|cookie|authorization|nonce|code)\s*[:=]\s*[^\s,;]+/gi,'$1=[redacted]').slice(0,400);
  }
  function pmmAutoActivity(helper=stageHelperRecord()){
    const s=pmmAutoState();
    if(s.busy)return 'Moving';
    if(s.inFlight)return s.desired?'Waiting':'Needs attention';
    if(!s.desired)return 'Off';
    if(helper?.blocked)return 'Needs attention';
    if(!stageHelperLive(helper)||!s.enabled||s.pending)return 'Reconnecting';
    if(helper.readyForAuto!==true)return 'Needs attention';
    return 'Waiting';
  }
  function pmmAutoEvents(){
    try{
      const value=JSON.parse(sessionStorage.getItem('pmm-auto-events-v4')||'[]');
      if(!Array.isArray(value))throw Error('Invalid event list');
      return value.filter(x=>x&&Number.isFinite(x.at)&&typeof x.note==='string').slice(-100).map(x=>({
        at:x.at,on:x.on===true,activity:pmmAutoDiagnosticText(x.activity),note:pmmAutoDiagnosticText(x.note),
        loadId:pmmAutoDiagnosticText(x.loadId),warehouse:pmmAutoDiagnosticText(x.warehouse),
        pallet:pmmAutoDiagnosticText(x.pallet),requestId:pmmAutoDiagnosticText(x.requestId)}));
    }catch(_){pmmAutoRecordEvent.error='Recent staging events could not be read.';return []}
  }
  function pmmAutoRecordEvent(){
    try{
      const s=pmmAutoState(),helper=stageHelperRecord(),activity=pmmAutoActivity(helper),note=pmmAutoDiagnosticText(s.note);
      // Countdown ticks are one event, not one stored row per second.
      const stableNote=note.replace(/Waiting \d+s/g,'Waiting [countdown]');
      const signature=JSON.stringify([s.desired,activity,stableNote,s.loadId,s.inFlight?.requestId||'',s.inFlight?.pallet||'']);
      if(signature===pmmAutoRecordEvent.signature)return;
      const rows=pmmAutoEvents();
      rows.push({at:Date.now(),on:s.desired,activity,note,loadId:s.loadId,warehouse:s.warehouse,
        pallet:s.inFlight?.pallet||'',requestId:s.inFlight?.requestId||''});
      const value=JSON.stringify(rows.slice(-100));
      sessionStorage.setItem('pmm-auto-events-v4',value);
      if(sessionStorage.getItem('pmm-auto-events-v4')!==value)throw Error('Diagnostic event write was not durable');
      pmmAutoRecordEvent.signature=signature;pmmAutoRecordEvent.error='';
    }catch(_){pmmAutoRecordEvent.error='Recent staging events could not be saved; diagnostics may be incomplete.'}
  }
  function pmmAutoDiagnostic(h){
    const text=pmmAutoDiagnosticText,s=pmmAutoState(),now=Date.now();
    const out={version:typeof V==='string'?V:'4.0.5',capturedAt:now,on:s.desired,activity:'Unknown',note:text(s.note),
      loadId:text(h?.loadId||s.loadId),warehouse:text(h?.destinationWarehouse||s.warehouse),
      currentRequest:null,helper:null,cooldown:null,lastStop:null,lastWait:null,recentEvents:[],recentOutcomes:[],holds:null,unmoved:[],errors:[],
      noteOnEvidence:'AFT movement history and staged locations are not staging success receipts. Missing attempt records do not prove no move occurred.'};
    const safe=(section,fn)=>{try{return fn()}catch(_){out.errors.push(section+' unavailable');return null}};
    const request=r=>r?{requestId:text(r.requestId),pallet:text(r.pallet),destination:text(r.destination),
      scope:text(r.scope),warehouse:text(r.warehouse),helperId:text(r.helperId),at:Number(r.at||r.createdAt)||null,
      phase:text(r.phase),status:text(r.status)}:null;
    const mark=r=>r&&typeof r==='object'?{at:Number(r.at)||null,reason:text(r.reason)}:null;
    out.lastStop=mark(s.lastStop);out.lastWait=mark(s.lastWait);
    safe('Helper',()=>{
      const helper=stageHelperRecord();out.activity=pmmAutoActivity(helper);
      if(!helper){
        const deadline=pmmAutoSuccessNextAt(null);
        out.cooldown={kind:s.errorCooldown?'error':'none',deadline:Number.isFinite(deadline)?deadline:null,remainingMs:Number.isFinite(deadline)?Math.max(0,deadline-now):null,requestId:text(s.errorCooldown?.requestId),pallet:text(s.errorCooldown?.pallet),reason:text(s.errorCooldown?.reason)};return;
      }
      const age=Number.isFinite(helper.updatedAt)&&helper.updatedAt<=now?now-helper.updatedAt:null;
      out.helper={scriptVersion:text(helper.scriptVersion)||'unknown',helperId:text(helper.helperId),live:stageHelperLive(helper),
        heartbeatAgeMs:age,protocol:Number(helper.autoProtocol)||null,compatible:helper.autoProtocol===stageAutoSpec().protocol&&helper.scriptVersion===(typeof V==='string'?V:'4.0.5'),
        armed:helper.armed===true,busy:helper.busy===true,blocked:helper.blocked===true,warehouse:text(helper.warehouse),
        readyForAuto:helper.readyForAuto===true,readinessReason:text(helper.readinessReason),step:text(helper.step),
        ownership:helper.autoOwner?{thisTab:helper.autoOwner.owner===s.owner,scope:text(helper.autoOwner.scope),
          warehouse:text(helper.autoOwner.warehouse),expiresAt:Number(helper.autoOwner.expiresAt)||null}:null};
      const deadline=pmmAutoSuccessNextAt(helper);
      out.cooldown={kind:s.errorCooldown?'error':deadline>now?'success-or-helper':'none',deadline:Number.isFinite(deadline)?deadline:null,
        remainingMs:Number.isFinite(deadline)?Math.max(0,deadline-now):null,requestId:text(s.errorCooldown?.requestId),
        pallet:text(s.errorCooldown?.pallet),restartAfterReload:s.errorCooldown!==null,
        reason:text(s.errorCooldown?.reason)};
    });
    out.currentRequest=request(s.inFlight);
    out.sharedRequest=safe('Shared request',()=>request(stageRequestRecord()));
    out.progress=safe('Helper progress',()=>request(stageProgressRecord()));
    out.recentOutcomes=safe('Staging journal',()=>stageJournalAll().slice(-50).map(r=>({...request(r),message:text(r.message),
      verifiedZeroMoved:r.autoSkipSafe===true&&!!stageAutoSkipReason(r.status,r.skipReason),skipReason:text(r.skipReason)})))||[];
    out.holds=safe('Guard record',()=>typeof stageHoldStats==='function'?stageHoldStats():null);
    out.unmoved=safe('Unmoved records',()=>pmmStageUnmovedList().map(r=>({id:text(r.id),requestId:text(r.requestId),
      pallet:text(r.pallet),destination:text(r.destination),warehouse:text(r.warehouse),loadId:text(r.loadId),scope:text(r.scope),
      at:Number(r.at)||null,status:text(r.status),proof:r.proof===true,reason:text(r.reason)})))||[];
    out.recentEvents=pmmAutoEvents();
    if(pmmAutoRecordEvent.error)out.errors.push(pmmAutoRecordEvent.error);
    if(s.unmovedWarning)out.errors.push(text(s.unmovedWarning));
    if(s.guardWarning)out.errors.push(text(s.guardWarning));
    return out;
  }
  function pmmAutoPaint(){
    pmmAutoRecordEvent();
    if(typeof pmmStageDashboardPaint==='function'){pmmStageDashboardPaint();return}
    const s=pmmAutoState(),label=s.desired?'ON':'OFF';
    const box=document.getElementById('pax-monitor-v311');if(!box)return;
    const toggle=box.querySelector('#set-auto-stage');if(toggle){toggle.textContent='AutoStager: '+label;toggle.setAttribute('aria-pressed',String(s.desired))}
    const bar=box.querySelector('#pmm-auto-stage-status');if(bar){bar.hidden=!(s.desired||s.note!=='OFF');const text=bar.querySelector('span');const value=s.desired||s.note!=='OFF'?'AutoStager: '+s.note:'AutoStager';if(text&&text.textContent!==value)text.textContent=value;const stop=bar.querySelector('button');if(stop)stop.hidden=!s.desired}
  }
  function pmmAutoStatusHtml(){if(typeof pmmStageDashboardHtml==='function')return pmmStageDashboardHtml();return '<div id="pmm-auto-stage-status" style="padding:6px 10px;border-bottom:1px solid currentColor;overflow-wrap:anywhere" hidden><span role="status"></span> <button type="button" id="pmm-auto-stage-stop">Stop auto staging</button></div>'}
  function pmmAutoBind(box){
    pmmAutoRestore();
    if(!pmmAutoState.stopHooks){
      const stop=e=>{const id=e.target?.closest?.('button,select,input')?.id;
        if(!pmmAutoState().desired)return;
        if(['set-refresh-now','refreshDataRequest'].includes(id))pmmAutoSuspend('Waiting for AFT refresh; ON is retained.');
        else if(['pause','set-display-hold','set-data-source','reset','settings-clear-history','bottom-import','set-auth-now'].includes(id))pmmAutoStop('Monitor action stopped the AutoStager.');
      };
      document.addEventListener('click',stop,true);document.addEventListener('change',stop,true);pmmAutoState.stopHooks=true;
    }
    if(typeof pmmStageDashboardBind==='function')pmmStageDashboardBind(box);
    box.querySelector('#set-auto-stage')?.addEventListener('click',pmmAutoEnableClick);
    box.querySelector('#pmm-auto-stage-stop')?.addEventListener('click',e=>{if(e.isTrusted){e.preventDefault();e.stopPropagation();pmmAutoStop()}});
    pmmAutoPaint();
  }
  const PMM_AUTO_SWAP_KEY='pmm-auto-swap-v404';
  function pmmAutoEnableClick(e){
    if(!e.isTrusted)return;
    const s=pmmAutoState();if(s.quarantine){s.note='Saved AutoStager protection cannot be verified. Check Move App and close this tab before opting in again.';pmmAutoPaint();return}if(s.revokePending){pmmAutoFinishStop();pmmAutoPaint();return}if(s.desired){pmmAutoStop();return}
    // A navigation may leave a validated saved ON choice as OFF protection. Save OFF before any fresh opt-in;
    // otherwise a second navigation can silently resurrect the previous saved choice.
    if(!s.desired&&s.intentId&&!pmmAutoSave()){s.quarantine=true;s.note='Could not save OFF after navigation. Check Move App and close this tab; no new opt-in here.';pmmAutoPaint();return}
    if(s.busy||s.inFlight){s.note='A previous request needs verification in Move App before enabling.';pmmAutoPaint();return}
    const h=getHierarchy(),reason=pmmAutoContext(h),helper=stageHelperRecord();
    if(reason){s.note=reason;pmmAutoPaint();return}
    if(typeof GM_addValueChangeListener!=='function'||typeof GM_removeValueChangeListener!=='function'||!stageHelperLive(helper)||(helper.autoProtocol!==stageAutoSpec().protocol||helper.scriptVersion!==(typeof V==='string'?V:'4.0.5'))||!helper.armed||helper.warehouse!==h.destinationWarehouse||helper.blocked){s.note='A live, configured compatible Move App helper with cross-tab notifications is required.';pmmAutoPaint();return}
    // 4.0.4: no ON confirmation. If another tab owns the helper, ask once to switch it to this tab.
    let takeover=false;
    if(helper.autoOwner&&helper.autoOwner.expiresAt>Date.now()){
      if(helper.autoOwner.owner===s.owner){s.note='The previous AutoStager lease of this tab is still ending; try again in a few seconds.';pmmAutoPaint();return}
      if(!confirm('AutoStager is running in another tab'+(helper.autoOwner.scope?' ('+String(helper.autoOwner.scope).slice(0,80)+')':'')+'. Switch it to this tab? The other tab will stop AutoStager.'))return;
      takeover=true;
    }
    const live=getHierarchy();if(pmmAutoContext(live)||loadScopeKey(live)!==loadScopeKey(h)||live.shipRef!==h.shipRef||live.destinationWarehouse!==h.destinationWarehouse){s.note='Context changed while enabling; try again.';pmmAutoPaint();return}
    const sameContext=s.scope===loadScopeKey(h)&&s.loadId===h.loadId&&s.shipRef===h.shipRef&&s.warehouse===h.destinationWarehouse;
    const protection=sameContext?{attempted:s.attempted,lastSkip:s.lastSkip,errorCooldown:s.errorCooldown,cooldownRestored:false,
      errorNextAt:s.errorNextAt,errorMonoNext:s.errorMonoNext}:{};
    if(sameContext&&s.helperId&&s.helperId!==helper.helperId&&(s.errorCooldown||s.lastSkip)){s.note='Move App helper changed while an error attempt is protected. Check it and start a new monitor tab before opting in.';pmmAutoPaint();return}
    if(sameContext&&s.errorCooldown&&!pmmAutoCooldownValid(s.errorCooldown,s)){s.note='Saved error pause needs review in Move App; AutoStager remains OFF.';pmmAutoPaint();return}
    Object.assign(s,{desired:true,restoring:false,claimOwned:false,revokePending:false,quarantine:false,lockWaitAt:0,lockNextAt:0,generation:'',intentId:'intent-'+stageRandomHex(24),owner:'',helperId:helper.helperId,scope:loadScopeKey(h),warehouse:h.destinationWarehouse,loadId:h.loadId,shipRef:h.shipRef,href:location.href,pending:false,enabled:false,lastRenew:0,attempted:new Set(),lastSkip:null,errorCooldown:null,cooldownRestored:false,errorNextAt:0,errorMonoNext:NaN,note:'ON; checking recorded movements against displayed AFT data.'},protection);
    if(!pmmAutoSave()){pmmAutoStop('Could not save the tab choice; nothing enabled.');return}
    if(takeover){
      s.takeoverUntil=Date.now()+45000;
      if(!stageGmWrite(PMM_AUTO_SWAP_KEY,{id:'swap-'+Date.now()+'-'+stageRandomHex(8),target:helper.autoOwner.owner,warehouse:s.warehouse,at:Date.now()})){pmmAutoStop('Could not ask the other tab to stop; nothing enabled.');return}
      s.note='ON; waiting for the other tab to stop AutoStager.';
    }else s.takeoverUntil=0;
    try{pmmAutoListen();pmmAutoLock()}catch(_){pmmAutoStop('Cross-tab notifications unavailable.');return}
    pmmAutoPaint();
  }
  function pmmAutoSelect(h,records,pallet){
    const blocked=reason=>({reason,pallet,destination:''});
    const manual=pmmStageResolve(h,records,pallet);if(!manual.destinations.length)return blocked(manual.reason||'No eligible stower movement.');
    const p=h.pallets?.[pallet];if(!p||p.sap!==false||p.id!==pallet||!Array.isArray(p.cases)||!Array.isArray(p.totes)||!(p.cases.length+p.totes.length))return blocked('No remaining verified pallet contents.');
    const scope=loadScopeKey(h),latest=new Map(),departures=[];
    for(const r of records){
      if(!r||!['case','tote'].includes(r.kind)||r.source!=='aft'||r.scopeId!==scope||r.loadId!==h.loadId||r.shipRef!==h.shipRef)continue;
      if(r.oldPallet===pallet)departures.push(r);
      const key=r.kind+':'+r.caseId,at=Number(r.detectedAt),prev=latest.get(key);
      if(!prev||at>Number(prev.detectedAt))latest.set(key,r);
    }
    const rows=departures;
    if(!rows.length)return blocked('No current eligible movement.');
    const newest=Math.max(...rows.map(r=>Number(r.detectedAt)));
    if(!Number.isFinite(newest)||newest<=0||newest>Date.now())return blocked('Newest movement time is invalid.');
    const selected=rows.filter(r=>Number(r.detectedAt)===newest),destinations=new Set(),proof=[];
    for(const r of selected){
      // A newer non-station route also blocks: never fall back to an older stower move.
      if(Number(latest.get(r.kind+':'+r.caseId)?.detectedAt)!==newest)return blocked('Newest departed container has a later movement; choose manually.');
      if(r.pallet||!r.stower)return blocked('Newest movement does not identify a stower station.');
      // 4.0.5: the newest recorded station remains usable after a refresh removes or changes
      // the departed container's active-stower row. Current pallet/load and newer-route guards remain.
      // Only a genuinely missing recorded station uses the unchanged same-container/stower fallback.
      let saved=pmmStageDestination(r.station);
      if(pmmStageStationMissing(r.station)){
        const map=r.kind==='tote'?h.activeByTote:h.activeByCase;
        const active=map&&Object.prototype.hasOwnProperty.call(map,r.caseId)?map[r.caseId]:null;
        if(!pmmStageLiveIdentityMatches(h)||!active||typeof active.stower!=='string'||typeof r.stower!=='string'||active.stower!==r.stower)return blocked('No recorded station; newest container/stower evidence no longer matches AFT.');
        saved=pmmStageDestination(active.station);
      }
      if(!saved)return blocked('Newest station is missing or malformed.');
      destinations.add(saved);proof.push([r.kind,r.caseId,r.stower,r.eventId,newest,saved]);
    }
    if(destinations.size!==1)return blocked('Newest movements tie at different stations; choose manually.');
    const destination=[...destinations][0];if(!manual.destinations.includes(destination))return blocked('Station is no longer eligible.');
    return {pallet,destination,at:newest,proof:JSON.stringify(proof.sort()),reason:''};
  }
  function pmmAutoGate(h,helper){
    const s=pmmAutoState(),reason=pmmAutoContext(h),now=Date.now();
    if(reason)return reason;
    if(location.href!==s.href||loadScopeKey(h)!==s.scope||h.loadId!==s.loadId||h.shipRef!==s.shipRef||h.destinationWarehouse!==s.warehouse)return 'Load or building changed.';
    if(!stageHelperLive(helper)||helper.helperId!==s.helperId||(helper.autoProtocol!==stageAutoSpec().protocol||helper.scriptVersion!==(typeof V==='string'?V:'4.0.5'))||!helper.armed||helper.warehouse!==s.warehouse||helper.blocked)return 'Move App helper changed or became unavailable.';
    if(!pmmAutoSnapshotMatches(h))return 'Displayed AFT data is awaiting an accepted monitor scan.';
    if(refreshing||_refreshRequest?.inFlight||['blocked','stalled'].includes(refreshPhase))return 'AFT refresh is running or held.';
    if(s.enabled&&(!helper.autoOwner||helper.autoOwner.owner!==s.owner||helper.autoOwner.scope!==s.scope||helper.autoOwner.warehouse!==s.warehouse||helper.autoOwner.expiresAt<=now))return 'Exclusive auto-staging ownership ended.';
    return '';
  }
  function pmmAutoWatch(){
    pmmAutoRestore();const s=pmmAutoState();if(s.revokePending){pmmAutoFinishStop();return}if(!s.desired)return;
    // Synchronous revocation before refresh or document lifecycle work can scan anything.
    if(_pageUnloading||_pageRestored){pmmAutoSuspend('Reloading; ON will resume from accepted AFT data.');return}
    if(refreshing||_refreshRequest?.inFlight)pmmAutoSuspend('Waiting for AFT refresh; ON is retained.');
    pmmAutoWake();
  }
  // 4.0.4: another tab asked to take over AutoStager. Only a fresh request naming this tab's current owner counts.
  function pmmAutoSwapRequested(s){
    try{
      if(!s.desired||!s.owner)return false;
      const r=stageGmRead(PMM_AUTO_SWAP_KEY,null);
      if(!r||typeof r!=='object'||typeof r.id!=='string'||r.id===s.lastSwapId)return false;
      const age=Date.now()-Number(r.at);
      if(!(age>=-2000&&age<30000)||r.target!==s.owner)return false;
      s.lastSwapId=r.id;return true;
    }catch(_){return false}
  }
  async function pmmAutoTick(){
    const s=pmmAutoState();if(s.revokePending){pmmAutoFinishStop();return}if(!s.desired)return;
    if(pmmAutoSwapRequested(s)){pmmAutoStop('AutoStager was switched to another tab.');return}
    try{
      if(_pageUnloading||_pageRestored){pmmAutoSuspend('Reloading; ON will resume from accepted AFT data.');return}
      if(!s.lockRelease){pmmAutoLock();return}
      const now=Date.now(),h=getHierarchy(),helper=stageHelperRecord();
      if(monitorError){pmmAutoStop('Monitor error requires review.');return}
      if(!h?.loadId||!h.shipRef||!h.destinationWarehouse){pmmAutoSuspend('Waiting for verified AFT load data.');return}
      if(location.href!==s.href||loadScopeKey(h)!==s.scope||h.loadId!==s.loadId||h.shipRef!==s.shipRef||h.destinationWarehouse!==s.warehouse){pmmAutoStop('Load or building changed.');return}
      if(!lastSnapshotAccepted){pmmAutoSuspend('Waiting for an accepted AFT snapshot.');return}
      const context=pmmAutoContext(h);if(context){pmmAutoStop(context);return}
      if(!pmmAutoRecover()){pmmAutoPaint();return}
      if(!stageHelperLive(helper)){pmmAutoSuspend('Waiting for the configured Move App helper.');return}
      if(helper.helperId!==s.helperId||(helper.autoProtocol!==stageAutoSpec().protocol||helper.scriptVersion!==(typeof V==='string'?V:'4.0.5'))||!helper.armed||helper.warehouse!==s.warehouse||helper.blocked){pmmAutoStop('Move App helper changed or became unavailable.');return}
      if(refreshing||_refreshRequest?.inFlight||['blocked','stalled'].includes(refreshPhase)){pmmAutoSuspend('Waiting for the active or held AFT refresh; ON is retained.');return}
      if(!pmmAutoSnapshotMatches(h)){pmmAutoSuspend('Waiting for an accepted scan of displayed AFT data; no fresh refresh required.');return}
      if(!s.enabled&&!s.pending){
        if(helper.autoOwner&&helper.autoOwner.expiresAt>now){
          if(helper.autoOwner.owner===s.owner){s.note='Waiting for the previous document lease to end.';pmmAutoPaint();return}
          if(s.takeoverUntil&&now<s.takeoverUntil){s.note='ON; waiting for the other tab to stop AutoStager.';pmmAutoPaint();return}
          pmmAutoStop('Another tab owns the AutoStager. Enable here explicitly when available.');return;
        }
        s.takeoverUntil=0;
        Object.assign(s,{owner:'auto-'+now+'-'+stageRandomHex(12),pending:true,requestedAt:now,lastRenew:0,note:'ON; acquiring the helper for recorded movements.'});
        if(!pmmAutoSave()||!pmmAutoConsent(true)||!pmmAutoCommand('enable'))pmmAutoStop('Could not save renewed authorization.');
        pmmAutoPaint();return;
      }
      const reason=pmmAutoGate(h,helper);if(reason){if(/^Exclusive auto-staging ownership ended/.test(reason)&&!(helper.autoOwner&&helper.autoOwner.owner!==s.owner&&helper.autoOwner.expiresAt>now))pmmAutoSuspend('Helper lease lapsed (tab was idle or throttled); ON is retained and the lease will be re-acquired.');else pmmAutoStop(reason);return}
      if(s.pending){
        if(helper.autoOwner?.owner===s.owner){s.pending=false;s.enabled=true;s.note='Enabled for this load only.'}
        else if(now-s.requestedAt>5000||helper.autoOwner){pmmAutoSuspend((helper.autoNote||'Helper ownership was not granted.')+' Retrying; ON is retained.');return}
        else {pmmAutoPaint();return}
      }
      if(now-s.lastRenew>=4000){
        if(!pmmAutoConsent(true)||!pmmAutoCommand('renew')){pmmAutoSuspend('Could not renew consent; re-acquiring. ON is retained.');return}
        s.lastRenew=now;
      }
      if(s.busy)return;
      if(s.lastSkip&&!pmmAutoSkipRestored())return;
      const request=stageRequestRecord();
      if(helper.busy||(request&&!stageJournalGet(request.requestId))){s.note='Waiting for the current manual or automatic move; no move queued.';pmmAutoPaint();return}
      if(helper.step!==stageSpec().sourceStep||stageClean(helper.sourceScannable)||helper.inputDisabled||helper.inputState?.state!=='ready'||helper.readyForAuto!==true){s.note='Waiting for Move App: '+(helper.readinessReason||'an empty, warning-free source-scanning step is required.');pmmAutoPaint();return}
      const nextAt=pmmAutoSuccessNextAt(helper);
      if(now<nextAt){s.note='Waiting '+Math.ceil((nextAt-now)/1000)+'s after confirmed success or verified error; ON is retained.';pmmAutoPaint();return}
      if(_scanRunning)return;
      const records=currentHistory(read(K.results,[]),h),pallets=[...new Set(records.filter(r=>r?.oldPallet&&h.pallets?.[r.oldPallet]).map(r=>r.oldPallet))];
      if(records.length>10000||pallets.length>1000||records.length*pallets.length>250000){pmmAutoStop('Load exceeds automatic-staging safety bounds; stage manually.');return}
      // 4.0.4: Unmoved is informational only. The attempted set (this load, survives same-load reload) and
      // the shared per-pallet guard (unconfirmed outcomes, 24 h, any tab) skip only that pallet.
      let chosen=null,skip='No eligible recorded station movement for this load.';
      for(const pallet of pallets){
        if(s.attempted.has(pallet))continue;
        if(pmmAutoGuarded(pallet,s.warehouse)){if(pmmAutoRecentSuccess(pallet,s.warehouse))skip=pallet+': moved successfully in the last 30 minutes; skipped.';continue}
        const candidate=pmmAutoSelect(h,records,pallet);
        if(candidate.destination){chosen=candidate;break}
        if(candidate.reason!=='No eligible stower movement.')skip=pallet+': '+candidate.reason;
      }
      if(!chosen){s.note=skip;pmmAutoPaint();return}
      const owner=s.owner,revision=_domRevision;
      const beforeSubmit=(admission)=>{
        const live=getHierarchy(),hp=stageHelperRecord();
        if(!s.desired||!s.lockRelease||!s.enabled||s.owner!==owner||_domRevision!==revision||pmmAutoGate(live,hp)||_scanRunning||hp.busy||hp.readyForAuto!==true||stageClean(hp.sourceScannable)||Date.now()<pmmAutoSuccessNextAt(hp))return false;
        if(s.lastSkip&&!pmmAutoSkipRestored())return false;
        const current=currentHistory(read(K.results,[]),live);if(current.length>10000)return false;
        const fresh=pmmAutoSelect(live,current,chosen.pallet);
        if(fresh.destination!==chosen.destination||fresh.proof!==chosen.proof||pmmAutoGuarded(chosen.pallet,s.warehouse))return false;
        if(admission){
          if(!stageSpec().requestIdPattern.test(admission.requestId||'')||!s.inFlight)return false;
          s.inFlight={...s.inFlight,requestId:admission.requestId,helperId:s.helperId,at:Date.now()};
          if(!pmmAutoSave())return false;
        }
        return true;
      };
      if(!beforeSubmit()){if(s.desired){s.note='Evidence changed before submission; nothing queued.';pmmAutoPaint()}return}
      if(s.attempted.size>=500){pmmAutoStop('Session attempt limit reached.');return}
      s.attempted.add(chosen.pallet);s.inFlight={attemptId:s.intentId+':'+chosen.pallet,pallet:chosen.pallet,destination:chosen.destination,scope:s.scope,warehouse:s.warehouse,helperId:s.helperId,at:Date.now(),requestId:''};if(!pmmAutoSave()){pmmAutoStop('Could not save attempt protection.');return}s.busy=true;s.note='Moving '+chosen.pallet+' to '+chosen.destination+'.';pmmAutoPaint();
      const result=await pmmStageSubmit({pallet:chosen.pallet,destination:chosen.destination,scope:s.scope,warehouse:s.warehouse,autoOwner:owner,beforeSubmit});
      s.busy=false;
      if(_pageUnloading||_pageRestored)return;
      const status=String(result?.status||'unknown'),message=String(result?.message||status);
      const attempt=s.inFlight,done=attempt?.requestId?stageJournalGet(attempt.requestId):null;
      const skippable=s.desired&&s.enabled&&s.lockRelease&&status!=='success'&&status!=='busy'&&
        status===done?.status&&pmmAutoSkipMatch(done,attempt,s)&&
        pmmAutoHoldOk(done,chosen.pallet,attempt.requestId,s);
      // Withdrawn inside admission before any request was written: nothing was sent, no error pause.
      const withdrawn=status==='rejected'&&result?.autoReason==='controller'&&!s.inFlight?.requestId;
      if(status==='success'||withdrawn||(status==='busy'&&!s.inFlight?.requestId)){s.inFlight=null;if(!pmmAutoSave()){pmmAutoStop('Could not save completed attempt.');return}}
      if(status==='success'){pmmAutoDelaySuccess();pmmStageCueRefresh();s.note=s.desired?'Confirmed '+chosen.pallet+'. Waiting 3s before the next eligible pallet.':'Stopped; the already-started move completed.';if(s.desired)pmmAutoWake()}
      else if(skippable){
        if(!pmmAutoSkipDone(done,attempt))return;
        const refused=done.skipReason==='not-attempted';
        if(refused&&s.desired)pmmAutoSuspend('Skipped '+chosen.pallet+' (refused, nothing attempted). Re-acquiring the helper; ON is retained.');
        if(s.desired)pmmAutoWake();
      }
      else if(withdrawn){s.note='Evidence for '+chosen.pallet+' changed during admission; nothing was sent and it is skipped for this load.';if(s.desired)pmmAutoWake()}
      else if(status==='busy'&&!s.inFlight){s.note='Another request won admission. This pallet will not be automatically retried in this session.'}
      else {pmmAutoBump({...attempt,pallet:chosen.pallet,destination:chosen.destination,status},'Result '+status+': '+message)}
      pmmAutoPaint();
    }catch(err){if(_pageUnloading||_pageRestored)return;const move=s.inFlight;s.busy=false;if(move)pmmAutoBump(move,'Unexpected error: '+stageErrText(err));else pmmAutoSuspend('Unexpected error: '+stageErrText(err)+'. ON is retained.');stageLog('auto staging',err)}
  }
  // PMM-CHUNK-END auto-stage

  // PMM-CHUNK-BEGIN stage-dashboard
  // 4.0 presentation only. Reads controller diagnostics, helper heartbeat, guards and Unmoved records;
  // never submits, marks an attempt, writes move state or changes station resolution. The only
  // writes are this tab's UI preferences (sessionStorage) and a scoped <style> element.
  function pmmDashPref(name,value){
    const key='pmm-dash-v4:'+name;
    try{if(value===undefined)return sessionStorage.getItem(key);sessionStorage.setItem(key,String(value))}catch(_){}
    return value===undefined?null:value;
  }
  function pmmDashText(v,max){return String(v===undefined||v===null?'':v).replace(/\s+/g,' ').trim().slice(0,max||240)}
  function pmmDashAgo(ms){
    if(!Number.isFinite(ms)||ms<0)return 'unknown';
    if(ms<1000)return 'just now';
    const s=Math.round(ms/1000);return s<60?s+'s ago':Math.floor(s/60)+'m '+(s%60)+'s ago';
  }
  function pmmDashClock(at){try{return at?new Date(Number(at)).toLocaleTimeString([],{hour:'numeric',minute:'2-digit',second:'2-digit'}):''}catch(_){return ''}}
  function pmmStageDashboardStyle(){
    try{
      if(document.getElementById('pmm-v4-dash-style'))return;
      const style=document.createElement('style');style.id='pmm-v4-dash-style';
      style.textContent=[
        '#pax-monitor-v311 .pmm-dash{padding:5px 10px;border-bottom:1px solid #d9dce1;font-size:12px;line-height:1.35}',
        '#pax-monitor-v311.dark .pmm-dash{border-color:#3a3a3a}',
        '#pax-monitor-v311 .pmm-dash-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
        '#pax-monitor-v311 .pmm-dash-bar{display:flex;align-items:center;gap:6px;flex:1 1 200px;min-width:0}',
        '#pax-monitor-v311 .pmm-dash-bar[hidden]{display:flex!important}',
        '#pax-monitor-v311 .pmm-dash-note{flex:1 1 auto;min-width:0;overflow-wrap:anywhere}',
        '#pax-monitor-v311 .pmm-dash button{margin:0;padding:3px 8px;font-size:12px}',
        '#pax-monitor-v311 .pmm-dash-toggle[aria-pressed="true"]{font-weight:700;border-color:var(--pmm-strong,#1466c3)}',
        '#pax-monitor-v311 .pmm-dash-details{margin-top:3px}',
        '#pax-monitor-v311 .pmm-dash-details>summary{cursor:pointer;font-size:11px;opacity:.8}',
        '#pax-monitor-v311 .pmm-dash-grid{display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 8px;margin:4px 0}',
        '#pax-monitor-v311 .pmm-dash-grid dt{font-weight:700;opacity:.75;white-space:nowrap}',
        '#pax-monitor-v311 .pmm-dash-grid dd{margin:0;overflow-wrap:anywhere}',
        '#pax-monitor-v311 .pmm-dash-warn{color:#b42318;font-weight:700;margin-top:3px;overflow-wrap:anywhere}',
        '#pax-monitor-v311 .pmm-dash-warn[hidden]{display:none}',
        '#pax-monitor-v311.dark .pmm-dash-warn{color:#ff9b94}',
        '#pax-monitor-v311 .pmm-dash-events{margin:2px 0 0;padding-left:16px;font-size:11px;opacity:.85}',
        '#pax-monitor-v311 .pmm-dash-optin{font-size:10.5px;opacity:.72;margin-top:3px}',
        '#pax-monitor-v311.minimized .pmm-dash{padding:3px 8px}',
        '#pax-monitor-v311.minimized .pmm-dash-details{display:none}',
        '#pax-monitor-v311.minimized .pmm-dash-note{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
        '#pax-monitor-v311 .pmm-elig{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:9px;font-size:10.5px;font-weight:600;border:1px solid #c9ccd2;vertical-align:1px;max-width:100%;overflow-wrap:anywhere}',
        '#pax-monitor-v311 .pmm-elig[data-kind="staged"]{border-color:#2e9e44;color:#1f7a34}',
        '#pax-monitor-v311 .pmm-elig[data-kind="ready"]{border-color:#2e9e44;color:#1f7a34}',
        '#pax-monitor-v311 .pmm-elig[data-kind="guarded"],#pax-monitor-v311 .pmm-elig[data-kind="unmoved"]{border-color:#b26a00;color:#8a4b00}',
        '#pax-monitor-v311.dark .pmm-elig{border-color:#555}',
        '#pax-monitor-v311.dark .pmm-elig[data-kind="staged"]{border-color:#5fd97a;color:#5fd97a}',
        '#pax-monitor-v311.dark .pmm-elig[data-kind="ready"]{border-color:#5fd97a;color:#5fd97a}',
        '#pax-monitor-v311.dark .pmm-elig[data-kind="guarded"],#pax-monitor-v311.dark .pmm-elig[data-kind="unmoved"]{border-color:#e0ad3c;color:#e0ad3c}',
        '#pax-monitor-v311 .pmm-filter-note{font-size:11.5px;margin:3px 0}',
        '#pax-monitor-v311 .pmm-filter-note button{margin:0 0 0 6px;padding:1px 7px;font-size:11px}',
        '#pax-monitor-v311 .pmm-empty-group{border:1px dashed #c9ccd2;border-radius:6px;margin:7px 0}',
        '#pax-monitor-v311.dark .pmm-empty-group{border-color:#555}',
        '#pax-monitor-v311 .pmm-empty-group>summary{cursor:pointer;padding:7px 9px;font-weight:600;opacity:.85}',
        '#pax-monitor-v311 .pmm-empty-group>.pallet-group{margin:4px 6px}',
        '#pmm-stage-attention-v3910 .pmm-unmoved,#pmm-stage-attention-v3910 .pmm-attention-card{flex-shrink:0;background:#fff8e1;color:#1f1f1f;border:2px solid #b26a00;border-radius:8px;padding:6px 9px;box-shadow:0 4px 14px rgba(0,0,0,.2);overflow-wrap:anywhere}',
        '#pmm-stage-attention-v3910 .pmm-attention-card{background:#fff4f2;border-color:#b42318}',
        '#pmm-stage-attention-v3910 .pmm-unmoved[data-severity="unknown"]{border-color:#b42318}',
        '#pmm-stage-attention-v3910 .pmm-attention-title,#pmm-stage-attention-v3910 .pmm-unmoved>summary{font-weight:700;cursor:pointer}',
        '#pmm-stage-attention-v3910 .pmm-unmoved-list{max-height:40vh;overflow-y:auto}',
        '#pmm-stage-attention-v3910 .pmm-unmoved-row{margin-top:4px;border-top:1px solid #e0c080;padding-top:4px}',
        '#pmm-stage-attention-v3910 .pmm-unmoved-meta,#pmm-stage-attention-v3910 .pmm-unmoved-reason{font-size:11.5px;opacity:.85}',
        '#pmm-stage-attention-v3910 .pmm-unmoved-outcome{font-weight:700}',
        '#pmm-stage-attention-v3910 .pmm-unmoved-row[data-outcome="unknown"] .pmm-unmoved-outcome{color:#b42318}',
        '#pmm-stage-attention-v3910 .pmm-unmoved-warn{margin-top:4px;padding:4px 6px;border-radius:4px;background:#b42318;color:#fff;font-weight:700}',
        '#pmm-stage-attention-v3910 .pmm-unmoved-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}',
        '#pmm-stage-attention-v3910 button{font-size:12px;padding:3px 8px;margin:0}',
        '#pmm-stage-attention-v3910 .pmm-unmoved-row>button{margin-top:3px}',
        '#pmm-stage-attention-v3910 .pmm-unmoved-archive{margin-top:6px}',
        '#pmm-stage-attention-v3910 .pmm-unmoved-archive>summary{cursor:pointer;font-size:11.5px}',
        '#pmm-stage-attention-v3910.pmm-dark .pmm-unmoved{background:#2b2414;color:#f1e6cc;border-color:#e0ad3c}',
        '#pmm-stage-attention-v3910.pmm-dark .pmm-unmoved[data-severity="unknown"],#pmm-stage-attention-v3910.pmm-dark .pmm-attention-card{border-color:#ff8a80}',
        '#pmm-stage-attention-v3910.pmm-dark .pmm-attention-card{background:#2d1a18;color:#f5dcd8}',
        '#pmm-stage-attention-v3910.pmm-dark .pmm-unmoved-row{border-color:#6b5525}',
        '#pmm-stage-attention-v3910.pmm-dark .pmm-unmoved-row[data-outcome="unknown"] .pmm-unmoved-outcome{color:#ff9b94}',
        '#pmm-stage-attention-v3910.pmm-dark button{background:#303030;color:#f5f5f5;border:1px solid #777}'
      ].join('\n');
      (document.head||document.documentElement).appendChild(style);
    }catch(err){stageLog('dashboard style',err)}
  }
  function pmmDashActivitySlug(a){return String(a||'Off').toLowerCase().replace(/[^a-z]+/g,'-').replace(/^-|-$/g,'')||'off'}
  // The right-hand toggle is the only ON/OFF display, so the note never repeats ON or OFF.
  function pmmDashNoteBody(s){return pmmDashText(s&&s.note,400).replace(/^(?:ON|OFF)\b[;:,.]?\s*/,'')}
  function pmmDashNoteText(s,activity){
    let n=pmmDashNoteBody(s);
    if(!n)n=s&&s.desired&&activity&&activity!=='Off'?activity:'';
    if(!n)return 'AutoStager';
    n=n.charAt(0).toUpperCase()+n.slice(1);
    if(activity==='Needs attention'&&!/^needs attention/i.test(n))n='Needs attention: '+n;
    return 'AutoStager: '+n;
  }
  function pmmDashToggleText(s){return 'AutoStager: '+(s&&s.desired?'ON':'OFF')}
  function pmmStageDashboardHtml(){
    const s=pmmAutoState();
    const open=pmmDashPref('details')==='1';
    // First <span> is the note and first <button> is Stop, so the pre-4.0 painter stays safe;
    // the toggle sits outside #pmm-auto-stage-status so hiding that bar can never hide it.
    const activity=s.desired?'Waiting':'Off';
    return '<div class="pmm-dash" id="pmm-dash" data-activity="'+pmmDashActivitySlug(activity)+'">'+
      '<div class="pmm-dash-top"><div id="pmm-auto-stage-status" class="pmm-dash-bar">'+
      '<span id="pmm-dash-note" class="pmm-dash-note" role="status" aria-live="polite">'+esc(pmmDashNoteText(s,activity))+'</span>'+
      '<button type="button" id="pmm-auto-stage-stop" '+(s.desired?'':'hidden')+'>Stop AutoStager</button></div>'+
      '<button id="set-auto-stage" class="pmm-dash-toggle" type="button" aria-pressed="'+s.desired+'">'+esc(pmmDashToggleText(s))+'</button></div>'+
      '<div id="pmm-dash-warn" class="pmm-dash-warn" role="alert" hidden></div>'+
      '<details id="pmm-dash-details" class="pmm-dash-details" '+(open?'open':'')+'><summary>Staging details</summary><dl class="pmm-dash-grid">'+
      [['current','Current'],['next','Next (preview)'],['cooldown','Cooldown'],['reason','Last reason'],['helper','Move App helper'],['version','Version'],['guards','Guards'],['unmoved','Unmoved']]
        .map(([k,t])=>'<dt>'+t+'</dt><dd id="pmm-dash-'+k+'">—</dd>').join('')+
      '</dl><div><button type="button" id="pmm-dash-unmoved-show">Show unmoved list</button> <button type="button" id="pmm-dash-copy-diag">Copy staging diagnostic</button></div>'+
      '<ol id="pmm-dash-events" class="pmm-dash-events"></ol>'+
      '<div class="pmm-dash-optin">Explicit opt-in for this load only. Newest verified station; one move at a time. A pallet whose outcome is unconfirmed is skipped for 24 h (clicking Stage still works); nothing is retried automatically. Stays ON across reloads in this tab; uses prior-scan movements matching displayed AFT. Older displayed data may miss later physical changes. Stop cannot undo a started move. The preview is read-only and does not reserve a pallet.</div>'+
      '</details></div>';
  }
  function pmmDashRedactText(v,max){return pmmUnmovedScrub(String(v===undefined||v===null?'':v).slice(0,max||2000))}
  // Diagnostic export: secret-like keys and page addresses are dropped; every string is scrubbed.
  function pmmDashRedactDeep(value,depth){
    const d=depth||0;
    if(d>8)return '[truncated]';
    if(typeof value==='string')return pmmDashRedactText(value,2000);
    if(value===null||typeof value!=='object')return typeof value==='function'||typeof value==='symbol'||typeof value==='bigint'?String(typeof value):value;
    if(Array.isArray(value))return value.slice(0,200).map(v=>pmmDashRedactDeep(v,d+1));
    const out={};
    for(const k of Object.keys(value).slice(0,200)){
      if(/^(scope|href|url|uri|link|referr?er|origin|location|headers?)$/i.test(k))continue;
      if(/token|password|passwd|pwd|cookie|authori[sz]ation|^auth|nonce|^code$|session|secret|credential|signature|api_?key/i.test(k)){out[k]='[redacted]';continue}
      out[k]=pmmDashRedactDeep(value[k],d+1);
    }
    return out;
  }
  function pmmDashSet(root,id,text,title){
    const el=root.querySelector('#'+id);if(!el)return;
    const t=pmmDashText(text,400);if(el.textContent!==t)el.textContent=t;
    if(title!==undefined&&el.title!==title)el.title=title;
  }
  // Read-only: pure selection over displayed data. Never touches attempted, inFlight or storage.
  function pmmStageDashboardPreview(h){
    try{
      const s=pmmAutoState();
      if(!h||h.source!=='aft'||!h.loadId)return{state:'none',text:'Needs a verified AFT load.'};
      const records=currentHistory(read(K.results,[]),h);
      const pallets=[...new Set(records.filter(r=>r?.oldPallet&&h.pallets?.[r.oldPallet]).map(r=>r.oldPallet))];
      if(records.length>10000||pallets.length>1000||records.length*pallets.length>250000)return{state:'bounds',text:'Load exceeds AutoStager safety bounds; preview off.'};
      const warehouse=s.desired&&s.warehouse?s.warehouse:String(h.destinationWarehouse||'');
      // Unmoved records are informational and never block; only attempted and guarded pallets are skipped.
      let skip='No eligible recorded movement matching displayed AFT.',guarded=0;
      for(const pallet of pallets){
        if(s.attempted.has(pallet))continue;
        if(pmmDashGuardFor(pallet,warehouse)){guarded++;continue}
        const c=pmmAutoSelect(h,records,pallet);
        if(c.destination)return{state:'next',pallet,destination:c.destination,text:pallet+' → '+c.destination};
        if(c.reason!=='No eligible stower movement.')skip=pallet+': '+c.reason;
      }
      if(skip==='No eligible recorded movement matching displayed AFT.'&&guarded)skip+=' '+guarded+' pallet'+(guarded===1?' is':'s are')+' skipped for 24 h after an unconfirmed outcome.';
      return{state:'none',text:skip};
    }catch(err){return{state:'error',text:'Preview unavailable: '+stageErrText(err)}}
  }
  function pmmDashPreviewCached(h){
    const memo=pmmDashPreviewCached,s=pmmAutoState(),now=Date.now();
    let sig='';try{const rec=stageHoldsRecord()||{};sig=JSON.stringify([typeof _domRevision==='number'?_domRevision:0,h?.loadId||'',h?.destinationWarehouse||'',s.attempted.size,s.desired,(rec.holds||[]).length,(rec.released||[]).length,rec.updatedAt||0])}catch(_){}
    if(memo.value&&memo.sig===sig&&now-memo.at<2000&&now>=memo.at)return memo.value;
    memo.value=pmmStageDashboardPreview(h);memo.sig=sig;memo.at=now;
    return memo.value;
  }
  // A guard only makes one pallet a skipped candidate for 24 h. An unreadable guard record is
  // read as empty by the helper, so it is a warning here, never a blocker.
  function pmmDashGuardFor(pallet,warehouse){
    try{const g=stageHoldFor(pallet,warehouse);return g&&typeof g==='object'&&!g.unreadable?g:null}catch(_){return null}
  }
  function pmmDashGuardCount(stats){
    if(!stats||typeof stats!=='object')return null;
    for(const k of ['live','guards','open'])if(Number.isFinite(stats[k]))return stats[k];
    return null;
  }
  function pmmDashGuards(stats){
    const n=pmmDashGuardCount(stats);
    if(n===null)return stats&&(stats.corrupt||stats.reset||stats.quarantined)?'None (guard record unreadable; treated as empty)':'Not reported';
    return n===0?'None':n+' pallet'+(n===1?'':'s')+' skipped for 24 h (unconfirmed outcome)';
  }
  function pmmDashGuardWarning(stats){
    if(!stats||typeof stats!=='object')return '';
    const text=pmmDashText(stats.warning||stats.resetNote,300);
    if(text)return text;
    return stats.corrupt||stats.reset||stats.quarantined?'Guard record was unreadable and reset; AutoStager continues. Check recent unconfirmed pallets in the Move App.':'';
  }
  function pmmStageDashboardPaint(){
    try{
      const s=pmmAutoState();
      const box=document.getElementById('pax-monitor-v311');if(!box)return;
      const toggle=box.querySelector('#set-auto-stage');
      if(toggle){const t=pmmDashToggleText(s);if(toggle.textContent!==t)toggle.textContent=t;toggle.setAttribute('aria-pressed',String(s.desired))}
      const stop=box.querySelector('#pmm-auto-stage-stop');if(stop)stop.hidden=!s.desired;
      const dash=box.querySelector('#pmm-dash'),bar=box.querySelector('#pmm-auto-stage-status');
      if(!dash){
        if(bar){bar.hidden=!(s.desired||s.note!=='OFF');const text=bar.querySelector('span'),value=pmmDashNoteText(s,s.desired?'Waiting':'Off');if(text&&text.textContent!==value)text.textContent=value}
        return;
      }
      if(bar)bar.hidden=false;
      let h=null,diag=null,helper=null;
      try{h=getHierarchy()}catch(_){}
      // Closed details need only activity and warnings: reuse a diagnostic up to 1 s old.
      const memo=pmmStageDashboardPaint,open=!!dash.querySelector('#pmm-dash-details')?.open,at=Date.now();
      if(!open&&memo.diag&&at>=memo.diagAt&&at-memo.diagAt<1000)diag=memo.diag;
      else{try{diag=typeof pmmAutoDiagnostic==='function'?pmmAutoDiagnostic(h):null}catch(err){stageLog('dashboard diagnostic',err)}memo.diag=diag;memo.diagAt=at}
      try{helper=stageHelperRecord()}catch(_){}
      let activity=diag?.activity;
      if(!activity||activity==='Unknown'){try{activity=typeof pmmAutoActivity==='function'?pmmAutoActivity(helper):(s.desired?'Waiting':'Off')}catch(_){activity='Needs attention'}}
      const slug=pmmDashActivitySlug(activity);
      if(dash.dataset.activity!==slug)dash.dataset.activity=slug;
      pmmDashSet(dash,'pmm-dash-note',pmmDashNoteText(s,activity));
      let guardStats=diag?.guards??diag?.holds;
      if(guardStats===undefined||guardStats===null){try{guardStats=typeof stageHoldStats==='function'?stageHoldStats():null}catch(_){guardStats=null}}
      const details=dash.querySelector('#pmm-dash-details');
      const unmoved=(()=>{try{return pmmStageUnmovedList()}catch(_){return[]}})(),pending=unmoved.filter(r=>!r.checked).length;
      const ustatus=(()=>{try{return pmmStageUnmovedStatus()}catch(_){return{ok:false,errors:[{detail:'Unmoved status unavailable'}]}}})();
      const warn=[...(diag?.errors||[]).map(e=>typeof e==='string'?e:pmmDashText(e?.detail||e?.message||e?.reason||'',200)),
        ...(ustatus.ok?[]:(ustatus.errors||[]).slice(-2).map(e=>'Unmoved: '+pmmDashText(e?.detail,200))),
        ...(ustatus.unsaved?[ustatus.unsaved+' Unmoved record'+(ustatus.unsaved===1?' is':'s are')+' NOT saved (this tab only).']:[]),
        ...(ustatus.enumerable===false?['Unmoved list may be incomplete in this tab.']:[]),
        pmmDashGuardWarning(guardStats),
        ...(diag?.helper&&diag.version&&diag.helper.scriptVersion&&diag.helper.scriptVersion!=='unknown'&&diag.helper.scriptVersion!==diag.version?['Monitor '+diag.version+' and Move App helper '+diag.helper.scriptVersion+' differ: both tabs must run the same version.']:[])].filter(Boolean);
      const warnEl=dash.querySelector('#pmm-dash-warn');
      if(warnEl){const t=pmmDashRedactText([...new Set(warn)].join(' '),900);if(warnEl.textContent!==t)warnEl.textContent=t;warnEl.hidden=!t}
      if(!details||!details.open)return;
      const cur=diag?.currentRequest;
      pmmDashSet(dash,'pmm-dash-current',cur?cur.pallet+' → '+cur.destination+(cur.requestId?' ('+cur.requestId+')':'')+(s.busy?' · moving':' · awaiting verification'):'None');
      const preview=pmmDashPreviewCached(h);
      pmmDashSet(dash,'pmm-dash-next',(s.desired?'':'If enabled: ')+preview.text,'Read-only preview; it reserves nothing and may change before the next check.');
      const cd=diag?.cooldown;
      pmmDashSet(dash,'pmm-dash-cooldown',cd&&cd.remainingMs>0?Math.ceil(cd.remainingMs/1000)+'s left ('+(cd.kind==='error'?'after verified error'+(cd.pallet?' on '+cd.pallet:''):'after success / helper pacing')+')':'None');
      const marks=[diag?.lastStop&&{...diag.lastStop,k:'Stopped'},diag?.lastWait&&{...diag.lastWait,k:'Waiting'}].filter(m=>m&&m.reason).sort((a,b)=>(b.at||0)-(a.at||0));
      pmmDashSet(dash,'pmm-dash-reason',marks.length?marks[0].k+': '+marks[0].reason+(marks[0].at?' ('+pmmDashClock(marks[0].at)+')':''):(pmmDashNoteBody(s)||'—'));
      const hp=diag?.helper;
      pmmDashSet(dash,'pmm-dash-helper',hp?(hp.live?'Live':'Not live')+' · heartbeat '+pmmDashAgo(hp.heartbeatAgeMs)+(hp.armed?' · armed '+hp.warehouse:' · not armed')+(hp.busy?' · busy':'')+(hp.blocked?' · BLOCKED':'')+(hp.readyForAuto?' · ready':(hp.readinessReason?' · '+hp.readinessReason:' · not ready')):'No Move App helper seen.');
      pmmDashSet(dash,'pmm-dash-version','Monitor '+(diag?.version||(typeof V==='string'?V:'?'))+(hp?' · helper '+hp.scriptVersion+' · protocol '+(hp.protocol??'?')+(hp.compatible?' (compatible)':' (NOT compatible)'):''));
      pmmDashSet(dash,'pmm-dash-guards',pmmDashGuards(guardStats),'Pallets with an unknown or destination-failed outcome are skipped by AutoStager for 24 h. Clicking Stage on one clears its guard.');
      pmmDashSet(dash,'pmm-dash-unmoved',pending+' to check · '+(unmoved.length-pending)+' checked'+(ustatus.ok?'':' · storage problem'));
      const list=dash.querySelector('#pmm-dash-events');
      if(list){
        const rows=(diag?.recentEvents||[]).slice(-5).reverse().map(e=>pmmDashClock(e.at)+' '+e.activity+': '+e.note);
        const sig=JSON.stringify(rows);
        if(list.dataset.sig!==sig){list.dataset.sig=sig;list.replaceChildren(...rows.map(t=>{const li=document.createElement('li');li.textContent=pmmDashText(t,300);return li}))}
      }
    }catch(err){stageLog('dashboard paint',err)}
  }
  function pmmStageDashboardBind(box){
    try{
      pmmStageDashboardStyle();
      if(!pmmStageDashboardBind.migrated){pmmStageDashboardBind.migrated=true;try{pmmStageUnmovedMigrate()}catch(err){stageLog('unmoved migration',err)}}
      const details=box.querySelector('#pmm-dash-details');
      if(details)details.addEventListener('toggle',()=>{pmmDashPref('details',details.open?'1':'0');if(details.open)pmmStageDashboardPaint()});
      const show=box.querySelector('#pmm-dash-unmoved-show');
      if(show)show.onclick=e=>{e.preventDefault();e.stopPropagation();pmmStageUnmovedShow()};
      const copy=box.querySelector('#pmm-dash-copy-diag');
      if(copy)copy.onclick=e=>{
        e.preventDefault();e.stopPropagation();
        let text='';try{text=JSON.stringify(pmmDashRedactDeep(pmmAutoDiagnostic(getHierarchy())),null,2)}catch(err){text='Diagnostic unavailable: '+pmmDashRedactText(stageErrText(err),300)}
        copy.textContent=pmmUnmovedClip(text)?'Copied':'Copy failed';
      };
    }catch(err){stageLog('dashboard bind',err)}
  }
  // ---- pallet list: filters, search over stower/station, eligibility notes, empty group -------
  function pmmStagePalletFilters(){return[['all','All pallets'],['ready','Ready for AutoStager'],['attention','Needs attention'],['new','NEW movements'],['contents','With contents'],['empty','Empty']]}
  function pmmStagePalletFilter(){const v=pmmDashPref('pallet-filter');return pmmStagePalletFilters().some(([k])=>k===v)?v:'all'}
  function pmmStagePalletFilterHtml(){
    const cur=pmmStagePalletFilter();
    return '<select id="pallet-filter" aria-label="Filter pallets">'+pmmStagePalletFilters().map(([k,t])=>'<option value="'+k+'" '+(k===cur?'selected':'')+'>'+t+'</option>').join('')+'</select>';
  }
  function pmmStagePalletHay(h,res,id){
    const p=h?.pallets?.[id]||{},parts=[id];
    const add=v=>{if(v!==undefined&&v!==null&&v!=='')parts.push(String(v))};
    const station=v=>{add(v);try{add(pmmStageDestination(v))}catch(_){}};
    for(const [list,active,items] of [[p.cases||[],h?.activeByCase,h?.caseItems],[p.totes||[],h?.activeByTote,h?.toteItems]]){
      for(const c of list){add(c);const a=active&&Object.prototype.hasOwnProperty.call(active,c)?active[c]:null;if(a){add(a.stower);station(a.station)}for(const i of items?.[c]||[])add(i?.fcSku)}
    }
    add(p.staging?.container);add(p.staging?.type);
    for(const r of res||[]){
      if(!r||(r.oldPallet!==id&&r.pallet!==id))continue;
      add(r.caseId);add(r.stower);station(r.station);add(r.pallet);add(r.oldPallet);
      const map=r.kind==='tote'?h?.activeByTote:h?.activeByCase,a=map&&r.caseId&&Object.prototype.hasOwnProperty.call(map,r.caseId)?map[r.caseId]:null;
      if(a){add(a.stower);station(a.station)}
    }
    return parts.join(' ').toLowerCase();
  }
  // Display-only explanation; uses the same read-only selectors as the controller and its bounds.
  function pmmStagePalletEligibility(h,res,ids){
    const out=new Map();
    try{
      if(!h||h.source!=='aft'||!h.loadId)return out;
      const s=pmmAutoState(),warehouse=s.desired&&s.warehouse?s.warehouse:String(h.destinationWarehouse||'');
      // Unmoved is informational: it marks pallets to check but never blocks or hides readiness.
      let review=null;try{review=pmmStageUnmovedGuard(ids,warehouse,s.desired&&s.scope?s.scope:loadScopeKey(h),s.desired&&s.loadId?s.loadId:h.loadId)}catch(_){}
      const unmoved=new Set(review&&Array.isArray(review.pendingPallets)?review.pendingPallets:[]);
      const bounded=!(res.length>10000||ids.length>1000||res.length*ids.length>250000);
      let journal=[];try{journal=stageJournalAll().filter(r=>r&&r.status==='success'&&r.warehouse===warehouse)}catch(_){}
      const movedIds=new Set(journal.map(r=>r.pallet));
      for(const id of ids){
        // 4.0.4: a pallet showing 0 cases and 0 totes, or one with a confirmed non-zero move in the staging
        // journal, reads "Staged". Display only; it changes nothing about what AutoStager selects.
        const pl=h.pallets?.[id],contents=pl?(pl.cases||[]).length+(pl.totes||[]).length:0;
        if(contents===0||movedIds.has(id)){out.set(id,{kind:'staged',text:'Staged',title:contents===0?'No cases or totes remain on this pallet.':'Move App confirmed containers moved from this pallet.',unmoved:false});continue}
        const guard=pmmDashGuardFor(id,warehouse),listed=unmoved.has(id);
        if(guard){out.set(id,{kind:'guarded',text:'Attempted (unconfirmed)',title:'Unconfirmed outcome'+(guard.status?' ('+pmmDashText(guard.status,40)+')':'')+'. AutoStager skips this pallet for 24 h; clicking Stage works.',unmoved:listed});continue}
        if(s.attempted.has(id)){out.set(id,{kind:'attempted',text:'Attempted',title:'Already attempted in this AutoStager session; not retried.',unmoved:listed});continue}
        const c=bounded?pmmAutoSelect(h,res,id):null;
        const also=listed?' Also listed under Unmoved pallets to check.':'';
        if(c&&c.destination)out.set(id,{kind:'ready',text:'Auto: '+c.destination,title:'Eligible for AutoStager to '+c.destination+' (read-only check).'+also,unmoved:listed});
        else if(listed)out.set(id,{kind:'unmoved',text:'Unmoved: check',title:'Listed under Unmoved pallets to check in the Move App. Informational only; Checked just archives it.',unmoved:true});
        else if(c&&c.reason&&c.reason!=='No eligible stower movement.')out.set(id,{kind:'blocked',text:'Not eligible',title:c.reason});
      }
    }catch(err){stageLog('pallet eligibility',err)}
    return out;
  }
  function pmmStagePalletViewApply(box,h,res,opts){
    try{
      const panel=box.querySelector('#pallet-history');if(!panel)return;
      const groups=[...panel.children].filter(el=>el.matches?.('details.pallet-group[data-pallet]'));
      const filter=pmmStagePalletFilter(),q=String(opts?.search||'').trim().toLowerCase(),sap=!!opts?.sap;
      const select=box.querySelector('#pallet-filter');
      if(select)select.onchange=e=>{try{_suppressPanelClicksUntil=Date.now()+600}catch(_){}pmmDashPref('pallet-filter',e.target.value);render(getHierarchy())};
      if(!groups.length)return;
      const ids=groups.map(g=>g.dataset.pallet),elig=sap?new Map():pmmStagePalletEligibility(h,res||[],ids);
      const empties=[];let shown=0;
      for(const g of groups){
        const id=g.dataset.pallet,p=h?.pallets?.[id],count=p?(p.cases||[]).length+(p.totes||[]).length:0;
        // SAP uses unlabelled cases: no named case/tote IDs does not mean an empty pallet.
        const hasContents=count>0||!!p?.sap&&(Number(p.unlabelledCases)>0||Number(p.unlabelledUnits)>0||Number(p.totalUnits)>0);
        const e=elig.get(id),isNew=!!g.querySelector(':scope>summary .new-badge');
        const attention=isNew||e?.kind==='unmoved'||e?.kind==='guarded'||e?.unmoved===true;
        const pass=(!q||pmmStagePalletHay(h,res,id).includes(q))&&(filter==='all'||(filter==='ready'&&e?.kind==='ready')||
          (filter==='attention'&&attention)||(filter==='new'&&isNew)||(filter==='contents'&&hasContents)||(filter==='empty'&&!hasContents));
        g.hidden=!pass;
        const summary=g.querySelector(':scope>summary'),old=summary?[...summary.querySelectorAll('.pmm-elig')]:[];
        // Renders normally rebuild every group; a surviving chip is refreshed or removed, never left stale.
        for(const c of old.slice(e?1:0))c.remove();
        if(e&&summary){
          const chip=old[0]||document.createElement('span');chip.className='pmm-elig';chip.dataset.kind=e.kind;chip.textContent=e.text;chip.title=e.title;
          if(!old[0])summary.insertBefore(chip,summary.querySelector('.pmm-pallet-duplicate'));
        }
        if(pass)shown++;
        if(!sap&&pass&&!hasContents&&!attention&&filter!=='empty')empties.push(g);
      }
      if(empties.length>1){
        const wrap=document.createElement('details');wrap.className='pmm-empty-group';wrap.id='pmm-empty-group';
        wrap.open=pmmDashPref('empty-open')==='1';
        const sum=document.createElement('summary');sum.textContent='Empty pallets ('+empties.length+') — no remaining mapped contents';
        wrap.appendChild(sum);
        for(const g of empties)wrap.appendChild(g);
        wrap.addEventListener('toggle',()=>pmmDashPref('empty-open',wrap.open?'1':'0'));
        panel.appendChild(wrap);
      }
      if(shown<groups.length){
        const note=document.createElement('div');note.className='pmm-filter-note muted';note.setAttribute('role','status');
        note.textContent=shown?'Showing '+shown+' of '+groups.length+' pallets.':'No pallets match the current search or filter ('+groups.length+' hidden).';
        if(filter!=='all'){
          const clear=document.createElement('button');clear.type='button';clear.textContent='Show all';
          clear.onclick=e=>{e.preventDefault();e.stopPropagation();pmmDashPref('pallet-filter','all');render(getHierarchy())};
          note.appendChild(clear);
        }
        panel.insertBefore(note,panel.firstChild);
      }
    }catch(err){stageLog('pallet view',err)}
  }
  // PMM-CHUNK-END stage-dashboard
  // PMM-CHUNK-BEGIN history
  const HISTORY_FORMAT='pallet-monitor-history';
  const HISTORY_EXPORT_VERSION=6;
  const HISTORY_IMPORT_VERSIONS=[1,2,3,4,5,6];
  const HISTORY_SEP='\u001f';
  const MAX_IMPORT_BYTES=100*1024*1024;
  const MAX_IMPORT_RECORDS=1000000;
  const MAX_IMPORT_BASELINE=500000;
  const MAX_IMPORT_PALLETS=100000;
  const MAX_IMPORT_CONTAINER_ITEMS=5000;
  const MAX_IMPORT_SOURCES=16;
  const MAX_IMPORT_OBSERVATION_IDS=256;
  const MAX_IMPORT_RECORD_ITEMS=5000;
  const MAX_HISTORY_ID=256;
  const MAX_HISTORY_TEXT=512;
  // Core builds obs371 event IDs as a JSON array of scope, source, kind, container, both
  // pallets, stower and capture time, so a legitimate ID is far longer than a text field.
  const MAX_HISTORY_EVENT_ID=4096;
  const HISTORY_KINDS=['case','tote','sap'];
  // Every inherited Object.prototype name, not just __proto__: core's organized store
  // probes with if(!object[key]), so an id of "toString" or "valueOf" would find the
  // inherited function, skip creation and then mutate it. 'prototype' is added because
  // function-valued lookups expose it.
  const UNSAFE_HISTORY_KEYS=new Set([...Object.getOwnPropertyNames(Object.prototype),'prototype']);
  // JSON.parse also keeps a literal "__proto__" key as an own property, and every
  // container or pallet identifier below ends up as an object key in the organized
  // store, so a file could otherwise write through Object.prototype itself.
  const isSafeHistoryKey=v=>typeof v==='string'&&!!v&&v.length<=MAX_HISTORY_ID&&!UNSAFE_HISTORY_KEYS.has(v);
  const isSafeOptionalHistoryKey=v=>v==null||v===''||isSafeHistoryKey(v);
  const isSafeHistoryText=(v,max=MAX_HISTORY_TEXT)=>v==null||(typeof v==='string'&&v.length<=max&&!UNSAFE_HISTORY_KEYS.has(v));
  const isSafeHistoryNumber=v=>v==null||v===''||Number.isFinite(Number(v));
  const isPlainHistoryObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
  // A supplied-but-malformed container list is a corrupt file, not an empty one: dropping
  // it silently would import a load as if it had no containers at all.
  const requireHistoryShape=(ok,what)=>{if(!ok)throw Error('The file has a malformed '+what+'.')};
  const HISTORY_TEXT_FIELDS=['stower','station','movementTime','shipRef','scopeId','source','loadId','trailerName','status'];
  const isSafeHistoryEventId=v=>typeof v==='string'&&!!v&&v.length<=MAX_HISTORY_EVENT_ID&&!UNSAFE_HISTORY_KEYS.has(v);
  const historyIdList=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'&&!!x):[];
  const historyRecordEventKey=r=>typeof r?.eventId==='string'&&r.eventId?'event'+HISTORY_SEP+r.eventId:'';
  // Natural composite identity for rows that predate eventId. Destination AND stower are
  // both part of it: pallet-to-stower rows share a null destination, so leaving the stower
  // out would fold two different stows of the same container into one event.
  const historyRecordRouteKey=r=>['route',r?.scopeId||r?.loadId||r?.shipRef||'',r?.kind||'',r?.caseId||'',r?.oldPallet||'',r?.pallet||'',r?.stower||'',r?.detectedAt||r?.movementTime||''].join(HISTORY_SEP);
  // Strong identity candidates for one event row: the eventId core stamps, plus every
  // per-source observation ID coalesced onto it. Matching any one of them means same event.
  function historyRecordEventKeys(r){
    const keys=[],seen=new Set();
    const push=k=>{if(k&&!seen.has(k)){seen.add(k);keys.push(k)}};
    push(historyRecordEventKey(r));
    for(const id of historyIdList(r?.observationIds))push('event'+HISTORY_SEP+id);
    return keys;
  }
  const historySkuItems=v=>Array.isArray(v)?v.filter(x=>x?.fcSku&&Number(x.quantity)>0).map(x=>({fcSku:x.fcSku,quantity:Number(x.quantity)||0})):[];
  // One rule for every tracked-state mutation in this chunk. Evaluated again inside the
  // storage transaction, because the primary tab can change while a lock is awaited.
  function historyWriteBlocked(h){
    if(duplicateViewOnly())return 'Duplicate load open in another tab; this tab is view-only.';
    if(!sourceTrackingActive(h||loadIdentity()))return 'This tab is not the tracking source for this load.';
    return '';
  }

  function validHistoryRecord(r){
    if(!r||typeof r!=='object'||Array.isArray(r))return false;
    if(!isSafeHistoryKey(r.caseId))return false;
    if(!HISTORY_KINDS.includes(r.kind))return false;
    if(!isSafeOptionalHistoryKey(r.oldPallet)||!isSafeOptionalHistoryKey(r.pallet))return false;
    for(const f of HISTORY_TEXT_FIELDS)if(!isSafeHistoryText(r[f]))return false;
    if(!isSafeHistoryNumber(r.detectedAt)||!isSafeHistoryNumber(r.quantity))return false;
    if(Number(r.quantity||0)<0)return false;
    if(r.sources!=null&&(!Array.isArray(r.sources)||r.sources.length>MAX_IMPORT_SOURCES||!r.sources.every(x=>isSafeHistoryText(x))))return false;
    if(r.eventId!=null&&!isSafeHistoryEventId(r.eventId))return false;
    if(r.observationIds!=null&&(!Array.isArray(r.observationIds)||r.observationIds.length>MAX_IMPORT_OBSERVATION_IDS||!r.observationIds.every(isSafeHistoryEventId)))return false;
    if(r.items!=null&&(!Array.isArray(r.items)||r.items.length>MAX_IMPORT_RECORD_ITEMS||!r.items.every(x=>!!x&&typeof x==='object'&&!Array.isArray(x)&&isSafeHistoryText(x.fcSku)&&isSafeHistoryNumber(x.quantity))))return false;
    return true;
  }
  // Unmoved containers reach the organized store through the same keyed path as moved
  // ones, so the baseline is validated with the same strictness rather than trusted.
  function validHistoryBaseline(b){
    if(!b||typeof b!=='object'||Array.isArray(b))return false;
    if(!isSafeOptionalHistoryKey(b.pallet))return false;
    if(!isSafeHistoryKey(b.id))return false;
    if(!HISTORY_KINDS.includes(b.kind))return false;
    const e=b.entry;
    if(!e||typeof e!=='object'||Array.isArray(e))return false;
    for(const f of ['stower','station','movementTime','type','kind'])if(!isSafeHistoryText(e[f]))return false;
    if(!isSafeOptionalHistoryKey(e.destinationPallet)||!isSafeOptionalHistoryKey(e.pallet))return false;
    if(!isSafeHistoryNumber(e.quantity)||!isSafeHistoryNumber(e.detectedAt))return false;
    for(const key of ['items','itemBreakdown']){
      const v=e[key];
      if(v==null||typeof v==='string')continue;
      if(!Array.isArray(v)||v.length>MAX_IMPORT_CONTAINER_ITEMS)return false;
      if(!v.every(x=>!!x&&typeof x==='object'&&!Array.isArray(x)&&isSafeHistoryText(x.fcSku)&&isSafeHistoryNumber(x.quantity)))return false;
    }
    return true;
  }

  async function exportHistory(h){
    try{
      const out=await storageTransaction(()=>buildHistoryExport(h),[organizedKey(h)]);
      // The download is emitted only once the transaction resolved, so a file never
      // claims state that failed to persist.
      if(out)downloadFile(out.name,out.content,out.mime);
      return out;
    }catch(e){reportMonitorError(e)}
  }
  function buildHistoryExport(h){
    // A view-only duplicate, or a tab that is not this load's tracking source, does not
    // own the tracked state: it still exports, but as a pure read.
    const blocked=historyWriteBlocked(h);
    if(!blocked){syncOrganized(h);syncResultMovementsIntoOrganized(h);}
    const state=organizedState(h),date=new Date().toISOString().replace(/[:.]/g,'-');
    // Identity comes from the hierarchy this export was built from, not from a fresh page
    // read: navigating while the storage lock was awaited would otherwise label this
    // load's records with the VRID of whatever the tab shows now.
    const ident=loadIdentity();
    const loadId=h?.loadId??ident.loadId??null,trailerName=h?.trailerName??ident.trailerName??null;
    const safe=clean(trailerName||loadId||'load').replace(/[^a-z0-9_-]+/gi,'-');
    const pallets=buildHistoryBaselineExport(state);
    const records=buildHistoryRecordExport(h);
    const payload={
      format:HISTORY_FORMAT,version:HISTORY_EXPORT_VERSION,exportedAt:new Date().toISOString(),
      load:{shipRef:h?.shipRef||location.pathname,source:h?.source||pageSource(),loadId,trailerName},
      counts:{records:records.length,pallets:pallets.length},
      records,pallets
    };
    return {name:'pallet-history-'+safe+'-'+date+'.json',content:JSON.stringify(payload,null,2),mime:'application/json',readOnly:blocked,records,pallets};
  }
  // v5 collapsed a container's repeated movements into its single organized entry. v6 also
  // carries the full event list for this load, so A->B->A->B survives a round trip.
  function buildHistoryRecordExport(h){
    const rows=currentHistory(read(K.results,[]),h);
    return (Array.isArray(rows)?rows:[]).filter(r=>!!r&&typeof r==='object'&&!Array.isArray(r)).map(r=>({...r})).sort(compareHistoryRecords);
  }
  function compareHistoryRecords(a,b){
    return Number(b?.detectedAt||0)-Number(a?.detectedAt||0)
      ||historyRecordRouteKey(a).localeCompare(historyRecordRouteKey(b))
      ||historyRecordEventKey(a).localeCompare(historyRecordEventKey(b));
  }
  // Build one flat, ordered container list per pallet: moved containers first (most
  // recent movement first), then never-moved containers (alphabetical). Each container
  // carries its FcSku/quantity breakdown and, if it moved, when/who/where — omitting
  // movement fields entirely (rather than nulling them) when there is nothing to report.
  function buildHistoryBaselineExport(state){
    return Object.entries(state?.pallets||{}).map(([pallet,p])=>{
      const containers=[];
      for(const [bucket,kind] of [['cases','case'],['totes','tote']]){
        for(const [id,e] of Object.entries(p?.[bucket]||{})){
          const items=Array.isArray(e?.items)?e.items:[],qty=Number(e?.quantity)||0;
          // Keep the readable comma-joined FcSku string while also carrying an exact
          // itemBreakdown array so an import can restore the organized history losslessly.
          const itemTotal=items.reduce((s,x)=>s+(Number(x?.quantity)||0),0)||qty;
          const c={id,type:e?.kind||kind,quantity:qty>0?qty:itemTotal};
          if(items.length){c.items=items.map(x=>x?.fcSku).join(', ');c.itemBreakdown=items.map(x=>({fcSku:x?.fcSku,quantity:Number(x?.quantity)||0}));}
          if(e?.movementTime){
            c.movementTime=e.movementTime;c.detectedAt=Number(e.detectedAt)||0;
            c.destinationPallet=e.destinationPallet??null;
            if(e.stower)c.stower=e.stower;if(e.station)c.station=e.station;
          }
          containers.push({c,detectedAt:Number(e?.detectedAt)||0});
        }
      }
      containers.sort((a,b)=>{
        const am=!!a.c.movementTime,bm=!!b.c.movementTime;
        if(am!==bm)return am?-1:1;
        if(am)return b.detectedAt-a.detectedAt||a.c.id.localeCompare(b.c.id);
        return a.c.id.localeCompare(b.c.id);
      });
      return {pallet,containers:containers.map(x=>x.c)};
    }).sort((a,b)=>String(a.pallet).localeCompare(String(b.pallet)));
  }

  const historyKindOf=(id,value)=>{const v=clean(value).toLowerCase();if(v==='sap')return 'sap';if(v==='tote'||v==='transfer_tote')return 'tote';if(v==='case')return 'case';return /^ts/i.test(id||'')?'tote':'case'};
  const historyDetectedAt=e=>Number(e?.detectedAt)||0;
  function pushHistoryMoved(records,load,pallet,caseId,kind,e){
    if(!e?.movementTime&&!e?.detectedAt)return;
    records.push({
      caseId,kind:historyKindOf(caseId,kind),oldPallet:pallet,pallet:e.destinationPallet??e.pallet??null,
      stower:e.stower||null,station:e.station||null,
      quantity:Number(e.quantity)||(Array.isArray(e.items)?e.items.reduce((s,x)=>s+(Number(x?.quantity)||0),0):0),
      movementTime:e.movementTime||new Date(historyDetectedAt(e)||Date.now()).toLocaleString(),
      shipRef:load.shipRef||'',scopeId:load.loadId?'vrid:'+load.loadId:(load.shipRef||''),
      source:load.source||null,loadId:load.loadId||null,trailerName:load.trailerName||null,
      status:e.stower?'active':'idle',detectedAt:historyDetectedAt(e)
    });
  }

  // Everything that can reject a file is decided here, before any lock is taken, so a
  // bad import never opens a storage transaction and never half-applies.
  function stageHistoryImport(data){
    if(data?.format!==HISTORY_FORMAT||!HISTORY_IMPORT_VERSIONS.includes(data.version))throw Error('Not a compatible history export.');
    const version=data.version;
    if(data.load!=null)requireHistoryShape(isPlainHistoryObject(data.load),'load identity');
    const rawLoad=isPlainHistoryObject(data.load)?data.load:{};
    for(const f of ['shipRef','source','loadId','trailerName'])if(!isSafeHistoryText(rawLoad[f]))throw Error('The file contains an invalid load identity.');
    const load={shipRef:rawLoad.shipRef||'',source:rawLoad.source||null,loadId:rawLoad.loadId||null,trailerName:rawLoad.trailerName||null};
    const baseline=[],derived=[];
    if(version===2||version===3){
      if(data.pallets!=null)requireHistoryShape(isPlainHistoryObject(data.pallets),'pallet map');
      const pallets=isPlainHistoryObject(data.pallets)?data.pallets:{};
      const entries=Object.entries(pallets);
      if(entries.length>MAX_IMPORT_PALLETS)throw Error('Too many pallets in this file.');
      for(const [pallet,p] of entries){
        if(!isSafeOptionalHistoryKey(pallet))throw Error('The file contains unsafe pallet or container identifiers.');
        requireHistoryShape(isPlainHistoryObject(p),'pallet entry');
        for(const [bucket,kind] of [['cases','case'],['totes','tote']]){
          if(p[bucket]!=null)requireHistoryShape(isPlainHistoryObject(p[bucket]),bucket+' list');
          for(const [caseId,e] of Object.entries(isPlainHistoryObject(p[bucket])?p[bucket]:{})){
            if(!isSafeHistoryKey(caseId))throw Error('The file contains unsafe pallet or container identifiers.');
            requireHistoryShape(isPlainHistoryObject(e),'container entry');
            pushHistoryMoved(derived,load,pallet,caseId,kind,e);
            baseline.push({pallet,id:caseId,kind:historyKindOf(caseId,e.kind||kind),entry:e});
          }
        }
      }
    }
    if(version>=4){
      if(data.pallets!=null)requireHistoryShape(Array.isArray(data.pallets),'pallet list');
      const pallets=Array.isArray(data.pallets)?data.pallets:[];
      if(pallets.length>MAX_IMPORT_PALLETS)throw Error('Too many pallets in this file.');
      for(const p of pallets){
        requireHistoryShape(isPlainHistoryObject(p),'pallet entry');
        if(!isSafeOptionalHistoryKey(p.pallet))throw Error('The file contains unsafe pallet or container identifiers.');
        if(p.containers!=null)requireHistoryShape(Array.isArray(p.containers),'container list');
        for(const c of Array.isArray(p.containers)?p.containers:[]){
          requireHistoryShape(isPlainHistoryObject(c),'container entry');
          if(!isSafeHistoryKey(c.id))throw Error('The file contains unsafe pallet or container identifiers.');
          const kind=historyKindOf(c.id,c.type);
          // v6 keeps the event list authoritative: rebuilding route-only rows from the
          // baseline would collapse a container's repeats back into one movement.
          if(version<6)pushHistoryMoved(derived,load,p.pallet,c.id,kind,c);
          baseline.push({pallet:p.pallet,id:c.id,kind,entry:c});
        }
      }
    }
    const records=version>=6||version===1?data.records:derived;
    if(!Array.isArray(records))throw Error('Not a compatible history export.');
    if(records.length>MAX_IMPORT_RECORDS)throw Error('Too many records in this file.');
    if(baseline.length>MAX_IMPORT_BASELINE)throw Error('Too many containers in this file.');
    if(!records.every(validHistoryRecord))throw Error('The file contains invalid movement records.');
    if(!baseline.every(validHistoryBaseline))throw Error('The file contains invalid container records.');
    const target={shipRef:load.shipRef,source:load.source||'aft',loadId:load.loadId,trailerName:load.trailerName};
    return {version,load,target,records,baseline};
  }

  const historySourceList=r=>[...new Set([...(r?.source?[r.source]:[]),...(Array.isArray(r?.sources)?r.sources.filter(x=>typeof x==='string'&&!!x):[])])];
  function enrichHistoryRecord(t,r){
    let changed=false;
    for(const f of ['pallet','stower','station','movementTime','source','loadId','trailerName','shipRef','scopeId','eventId'])
      if((t[f]===undefined||t[f]===null||t[f]==='')&&r[f]!=null&&r[f]!=='')
        {t[f]=r[f];changed=true}
    if(!(Number(t.quantity)>0)&&Number(r.quantity)>0){t.quantity=Number(r.quantity);changed=true}
    if(!(Number(t.detectedAt)>0)&&Number(r.detectedAt)>0){t.detectedAt=Number(r.detectedAt);changed=true}
    if(!historySkuItems(t.items).length&&historySkuItems(r.items).length){t.items=historySkuItems(r.items);changed=true}
    if(t.stower&&t.status!=='active'){t.status='active';changed=true}
    // Sources and observation IDs are unions, not overwrites: an event seen by AFT and by
    // Hunter keeps both attributions, which is what core's twin coalescing records too.
    const srcs=historySourceList(t),merged=[...new Set([...srcs,...historySourceList(r)])];
    if(merged.length!==srcs.length){t.sources=merged.sort();changed=true}
    const ids=historyIdList(t.observationIds),allIds=[...new Set([...ids,...historyIdList(r.observationIds)])].slice(0,MAX_IMPORT_OBSERVATION_IDS);
    if(allIds.length!==ids.length){t.observationIds=allIds;changed=true}
    return changed;
  }
  // Existing rows are never dropped by a merge: an import adds or enriches, so a file
  // from another machine cannot purge the history this tab already recorded. A row is
  // the same event when a strong identity matches; the composite route key is a fallback
  // used only when one of the two rows has no eventId at all, so two genuinely distinct
  // eventIds that happen to share a route and timestamp stay two events.
  function mergeHistoryRecords(existing,incoming){
    const out=[],byEvent=new Map(),byRoute=new Map();
    const register=(r,i)=>{
      for(const k of historyRecordEventKeys(r))if(!byEvent.has(k))byEvent.set(k,i);
      const route=historyRecordRouteKey(r);if(!byRoute.has(route))byRoute.set(route,i);
    };
    // Copy the stored rows before anything can enrich them: a later capacity refusal
    // aborts the whole import, and it must not have touched the live in-memory results.
    for(const r of Array.isArray(existing)?existing:[]){
      if(!r||typeof r!=='object'||Array.isArray(r))continue;
      out.push({...r});register(out[out.length-1],out.length-1);
    }
    const locate=r=>{
      for(const k of historyRecordEventKeys(r))if(byEvent.has(k))return byEvent.get(k);
      const at=byRoute.get(historyRecordRouteKey(r));
      if(at===undefined)return -1;
      return !historyRecordEventKey(r)||!historyRecordEventKey(out[at])?at:-1;
    };
    let added=0,enriched=0;
    for(const r of Array.isArray(incoming)?incoming:[]){
      const at=locate(r);
      if(at>=0){if(enrichHistoryRecord(out[at],r))enriched++;register(out[at],at);continue}
      out.push({...r});added++;register(out[out.length-1],out.length-1);
    }
    const order=new Map(out.map((r,i)=>[r,i]));
    out.sort((a,b)=>compareHistoryRecords(a,b)||order.get(a)-order.get(b));
    return {records:out,added,enriched};
  }
  // v2+ exports carry baseline container information. Restore it into the organized
  // store too, so a fresh install/import keeps quantities, FcSku breakdown and movement
  // metadata instead of restoring only the Movement History rows.
  function restoreHistoryBaseline(staged){
    if(!staged.load.shipRef||!staged.baseline.length)return false;
    const state=organizedState(staged.target),dirty={changed:false};
    for(const b of staged.baseline){
      const rawItems=Array.isArray(b.entry?.itemBreakdown)?b.entry.itemBreakdown:Array.isArray(b.entry?.items)?b.entry.items:[];
      const items=rawItems.filter(x=>x?.fcSku&&Number(x.quantity)>0).map(x=>({fcSku:x.fcSku,quantity:Number(x.quantity)||0}));
      const e=ensureOrganizedEntry(state,b.pallet,b.id,b.kind,Number(b.entry?.quantity)||0,items,dirty);
      if(b.entry?.movementTime||b.entry?.detectedAt){
        const movement={kind:b.kind,stower:b.entry.stower||null,station:b.entry.station||null,movementTime:b.entry.movementTime||null,detectedAt:historyDetectedAt(b.entry)};
        if(Object.prototype.hasOwnProperty.call(b.entry,'destinationPallet'))movement.pallet=b.entry.destinationPallet??null;
        else if(Object.prototype.hasOwnProperty.call(b.entry,'pallet'))movement.pallet=b.entry.pallet??null;
        applyOrganizedMovement(e,movement,dirty);
      }
    }
    if(dirty.changed)writeOrganized(staged.target,state);else noteOrganizedKey(organizedKey(staged.target));
    return dirty.changed;
  }
  function applyHistoryImport(staged){
    // The primary tab can change while this import waits for the storage lock, so
    // ownership is rechecked after it is held, not only before the file was read.
    const blocked=historyWriteBlocked();
    if(blocked)throw Error('Import refused: '+blocked);
    const existing=read(K.results,[]);
    const merged=mergeHistoryRecords(Array.isArray(existing)?existing:[],staged.records);
    // The shared result list is capped at MAX_RESULTS by core, and the next scan truncates
    // the tail. Refuse an import that would not fit instead of writing rows that silently
    // disappear, and say by how much: clearing this load's history is the user's call.
    if(merged.added&&merged.records.length>MAX_RESULTS)
      throw Error('Import needs room for '+merged.added+' new movements, but the shared history would hold '+merged.records.length+' of at most '+MAX_RESULTS+'. Export and clear history first, then import.');
    write(K.results,merged.records);
    // Rebuild duplicate detection from imported records so the next refresh does not
    // replay them. v6 is skipped on purpose: its route-only keys would suppress a
    // genuine later repeat of the same route, which is exactly what v6 preserves.
    if(staged.version<6){
      const processed=read(K.processed,{})||{};
      for(const r of merged.records)processed[dedupKey(r.scopeId||r.loadId&&('vrid:'+r.loadId)||r.shipRef||'',r.kind,r.caseId,r.oldPallet||'',r.pallet)]=r.detectedAt||Date.now();
      write(K.processed,pruneProcessed(processed));
    }
    restoreHistoryBaseline(staged);
    return merged;
  }
  async function importHistory(file){
    if(!file)return;
    try{
      const blocked=historyWriteBlocked();
      if(blocked)throw Error('Import refused: '+blocked);
      if(Number(file.size)>MAX_IMPORT_BYTES)throw Error('File exceeds the 100 MB import limit.');
      const staged=stageHistoryImport(JSON.parse(await file.text()));
      const merged=await storageTransaction(()=>applyHistoryImport(staged),[organizedKey(staged.target),K.organized+(staged.load.shipRef||'')]);
      lastSignature='';
      alert('Imported history. '+merged.records.length+' movements saved ('+merged.added+' new, '+merged.enriched+' updated).');
      render(getHierarchy());
      return merged;
    }catch(e){alert('History import failed: '+(e?.message||e));}
  }
  // PMM-CHUNK-END history

  // Read-only Rodeo namespace. Functions are hoisted for the feed-only early exit.
  // No top-level initializer may be required by the Rodeo branch.
  function pmmRodeoIdentity(ident){
    const site=String(ident?.destinationWarehouse||'').trim().toUpperCase();
    const vrid=String(ident?.loadId||'').trim().toUpperCase();
    return /^[A-Z]{3}\d$/.test(site)&&/^[A-Z0-9]{6,20}$/.test(vrid)?{site,vrid}:null;
  }
  function pmmRodeoStation(raw){
    const m=/^dz-P-A([1-3])([1-4])(\d{2})$/.exec(typeof raw==='string'?raw:'');
    return m?{station:m[0],floor:Number(m[1]),zone:Number(m[1]+m[2]+'00')}:null;
  }
  function pmmRodeoLocation(outer,outerOuter){
    const a=pmmRodeoStation(outer),b=pmmRodeoStation(outerOuter);
    if(a&&b&&a.station!==b.station)return null;
    return a||b;
  }
  function pmmRodeoNumber(n){return Number.isSafeInteger(n)&&n>=0;}
  function pmmRodeoSafeText(s,max=160){return typeof s==='string'&&s.length<=max&&!/[\x00-\x1f\x7f]/.test(s);}
  function pmmRodeoReportContract(){return 'lga9-post-direct-v1';}
  function pmmRodeoContractPools(){return ['TransReceived','Unloaded','VendorReceived','UnloadedToConveyance','Decanted','PendingStow'];}
  // The user's native /post report body. Native requests a fixed 15-minute bucket whatever the display
  // bucket; view-only settings (display bucket, date range) are not in the body and are not asserted here.
  function pmmRodeoContractRequest(req,id){
    const f=req?.filterList,d=req?.aggregateDimensionList,pools=f?.workPoolFilter?.values,allowed=pmmRodeoContractPools();
    if(!id||id.site!=='LGA9'||!f||!d||typeof f!=='object'||typeof d!=='object'||Array.isArray(f)||Array.isArray(d)||req.warehouseId!==id.site||JSON.stringify(req.shipmentTypes)!=='["TRANSSHIPMENT"]')return false;
    const only=(o,k)=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).join()===k;
    if(Object.keys(f).sort().join()!=='statusFilter,vrIdFilter,workPoolFilter'||!only(f.statusFilter,'values')||!only(f.vrIdFilter,'value')||!only(f.workPoolFilter,'values')||typeof f.vrIdFilter.value!=='string'||f.vrIdFilter.value!==id.vrid||JSON.stringify(f.statusFilter?.values)!=='["Actuals"]')return false;
    if(!Array.isArray(pools)||pools.length!==allowed.length||new Set(pools).size!==pools.length||!pools.every(p=>allowed.includes(p)))return false;
    return Object.keys(d).sort().join()==='ExpectedStowDateDimension,OuterScannableIdDimension,VRIdDimension'&&JSON.stringify(d.ExpectedStowDateDimension)==='{"bucketSize":15}'&&JSON.stringify(d.OuterScannableIdDimension)==='{}'&&JSON.stringify(d.VRIdDimension)==='{}';
  }
  // Native parseInt()s the date value; only an unambiguous integer or digit string is accepted here.
  function pmmRodeoContractDate(v){return Number.isSafeInteger(v)||typeof v==='string'&&/^\d{1,16}$/.test(v)&&Number.isSafeInteger(Number(v));}
  function pmmRodeoAdd(map,key,quantity){
    const n=(map.get(key)||0)+quantity;if(!pmmRodeoNumber(n))throw Error('Rodeo quantity overflow');map.set(key,n);
  }
  function pmmRodeoNormalize(record,identity,now=Date.now()){
    const id=pmmRodeoIdentity(identity);if(!id||id.site!=='LGA9')return null;
    if(!record||record.method!=='POST'||record.status!==200||record.request?.format!=='json'||record.response?.format!=='json')return null;
    const req=record.request.data,data=record.response.data;
    if(!req||!data||typeof req!=='object'||typeof data!=='object'||req.warehouseId!==id.site)return null;
    const at=Date.parse(record.completedAt),startedAt=Date.parse(record.startedAt);
    if(!Number.isFinite(at)||!Number.isFinite(startedAt)||startedAt>at||at>now+60000||now-at>86400000||at-startedAt>300000)return null;
    const raw=JSON.stringify([req,data]);
    if(raw.length>8*1024*1024||/\[OMITTED|\[TRUNCATED|\[REDACTED|"_probeLimit"/.test(raw))return null;
    const aggregate=record.operation==='getAggregateReport',items=record.operation==='getTransshipmentItemList';
    if(!aggregate&&!items)return null;
    const filters=aggregate?req.filterList:req.rodeoFilters;
    if(!filters||typeof filters!=='object'||Array.isArray(filters))return null;
    const vrFilter=filters.vrIdFilter?.value;
    if(vrFilter!==undefined&&vrFilter!==id.vrid)return null;
    const pools=filters.workPoolFilter?.values;
    const allowed=['TransReceived','Unloaded','VendorReceived','UnloadedToConveyance','Decanted','PendingStow'];
    if(!Array.isArray(pools)||!pools.length||pools.length>allowed.length||pools.some(p=>!allowed.includes(p))||new Set(pools).size!==pools.length)return null;
    if(filters.statusFilter&&JSON.stringify(filters.statusFilter.values)!=='["Actuals"]')return null;
    const extraFilters=Object.keys(filters).filter(k=>!['workPoolFilter','statusFilter','vrIdFilter'].includes(k));
    if(extraFilters.length)return null; // A narrowed/unknown query must not replace the station overview.
    const out={v:1,site:id.site,vrid:id.vrid,basis:aggregate?'aggregate':'items',at,startedAt,pools:[...pools].sort(),extraFilters:extraFilters.sort(),stations:[],unmappedUnits:0,caseRows:[],coverage:'',matchedRows:0,sourceRows:0,itemCount:null,startIndex:null,queryUniqueRows:null,vridScoped:vrFilter===id.vrid,parentLevels:[]};
    const stations=new Map();let unmapped=0;
    const add=(location,n)=>{if(!pmmRodeoNumber(n))throw Error('Invalid Rodeo quantity');if(location)pmmRodeoAdd(stations,location.station,n);else{unmapped+=n;if(!pmmRodeoNumber(unmapped))throw Error('Rodeo quantity overflow');}};
    if(aggregate){
      if(data.warehouseId!==id.site||JSON.stringify(req.shipmentTypes)!=='["TRANSSHIPMENT"]'||JSON.stringify(data.shipmentTypes)!=='["TRANSSHIPMENT"]'||JSON.stringify(filters.statusFilter?.values)!=='["Actuals"]')return null;
      const dims=data.aggregateDimensionList;
      if(!Array.isArray(dims)||dims.length<1||dims.length>3||!Array.isArray(data.aggregateList)||data.aggregateList.length>30000)return null;
      const names=dims.map(d=>typeof d?.__type==='string'?d.__type.split(':')[0]:'');
      const permitted=['OuterScannableIdDimension','OuterOuterScannableIdDimension','VRIdDimension','ExpectedStowDateDimension','WorkPoolDimension'];
      if(names.some(n=>!permitted.includes(n))||new Set(names).size!==names.length||!req.aggregateDimensionList||Object.keys(req.aggregateDimensionList).sort().join()!==[...names].sort().join())return null;
      const vi=names.indexOf('VRIdDimension'),oi=names.indexOf('OuterScannableIdDimension'),oo=names.indexOf('OuterOuterScannableIdDimension');
      if((vi<0&&!vrFilter)||(oi<0&&oo<0))return null;
      const seen=new Set();out.sourceRows=data.aggregateList.length;
      if(pmmRodeoContractRequest(req,id)){
        // Strict contract: mirrors native TOTAL (rows with any null dimension or zero quantity are dropped);
        // any other anomaly rejects the whole report rather than producing a healthy partial result.
        const di=names.indexOf('ExpectedStowDateDimension');
        if(names.length!==3||di<0||vi<0||oi<0)return null;
        Object.assign(out,{reportContract:pmmRodeoReportContract(),excludedRows:0,excludedUnits:0});
        for(const row of data.aggregateList){
          const values=row?.aggregateDimensionValueList;
          if(!Array.isArray(values)||values.length!==3||!pmmRodeoNumber(row.quantity))return null;
          if(values.some(v=>v!==null&&(!v||typeof v!=='object'||!['string','number'].includes(typeof v.value)||typeof v.value==='number'&&!Number.isFinite(v.value))))return null;
          const date=values[di],outer=values[oi],vrid=values[vi];
          if(date&&!pmmRodeoContractDate(date.value)||outer&&typeof outer.value!=='string'||vrid&&vrid.value!==id.vrid)return null;
          // Canonical tuple: 1 and "1" or reordered/extra metadata are the same native row.
          const key=JSON.stringify([date?Number(date.value):null,outer?outer.value:null,vrid?vrid.value:null]);if(seen.has(key))return null;seen.add(key);
          if(!row.quantity)continue;
          if(!date||!outer||!vrid){out.excludedRows++;out.excludedUnits+=row.quantity;if(!pmmRodeoNumber(out.excludedUnits))throw Error('Rodeo quantity overflow');continue;}
          out.matchedRows++;add(pmmRodeoStation(values[oi].value),row.quantity);
        }
        out.parentLevels=['outer'];
      }else{
      for(const row of data.aggregateList){
        const values=row?.aggregateDimensionValueList;
        if(!Array.isArray(values)||values.length!==names.length||!pmmRodeoNumber(row.quantity))return null;
        if(values.some(v=>v!==null&&(!v||typeof v!=='object'||!['string','number'].includes(typeof v.value)||typeof v.value==='number'&&!Number.isFinite(v.value))))return null;
        const key=JSON.stringify(values);if(seen.has(key))return null;seen.add(key);
        if(vi>=0&&values[vi]?.value!==id.vrid)continue;
        out.matchedRows++;add(pmmRodeoLocation(values[oi]?.value,values[oo]?.value),row.quantity);
      }
      out.parentLevels=[...(oi>=0?['outer']:[]),...(oo>=0?['outerOuter']:[])];
      }
    }else{
      if(!Array.isArray(data.transshipmentItemList)||data.transshipmentItemList.length>10000||!pmmRodeoNumber(data.itemCount)||!pmmRodeoNumber(req.startIndex)||!pmmRodeoNumber(req.batchSize)||req.batchSize<1||data.transshipmentItemList.length>req.batchSize||req.startIndex+data.transshipmentItemList.length>data.itemCount)return null;
      const seen=new Map(),cases=new Map();out.sourceRows=data.transshipmentItemList.length;out.itemCount=data.itemCount;out.startIndex=req.startIndex;
      for(const row of data.transshipmentItemList){
        if(!row||!pmmRodeoSafeText(row.id,100)||!row.id||!pmmRodeoNumber(row.quantity)||row.warehouseId!==id.site||!pools.includes(row.workPool))return null;
        const serial=JSON.stringify(row);if(seen.has(row.id)){if(seen.get(row.id)!==serial)return null;continue;}seen.set(row.id,serial);
        if(row.vrId!==id.vrid)continue;
        if(!pmmRodeoSafeText(row.scannableId)||!row.scannableId||!pmmRodeoSafeText(row.containerId)||!row.containerId||!pmmRodeoSafeText(row.manifestId,240)||!row.manifestId)return null;
        out.matchedRows++;const loc=pmmRodeoLocation(row.outerScannableId,row.outerOuterScannableId);add(loc,row.quantity);
        const k=JSON.stringify([row.manifestId,row.containerId]);const previous=cases.get(k);
        if(previous&&(previous.station!==(loc?.station||'')||previous.caseId!==row.scannableId||previous.type!==(row.containerType==='CASE'?'CASE':row.containerType==='TOTE'?'TOTE':'OTHER')))return null;
        if(!previous)cases.set(k,{caseId:row.scannableId,containerId:row.containerId,manifest:row.manifestId,type:row.containerType==='CASE'?'CASE':row.containerType==='TOTE'?'TOTE':'OTHER',station:loc?.station||'',quantity:row.quantity});
        else{previous.quantity+=row.quantity;if(!pmmRodeoNumber(previous.quantity))return null;}
      }
      out.caseRows=[...cases.values()];
      out.queryUniqueRows=seen.size;
    }
    out.stations=[...stations].map(([station,quantity])=>({...pmmRodeoStation(station),quantity})).sort((a,b)=>b.quantity-a.quantity||a.station.localeCompare(b.station));out.unmappedUnits=unmapped;
    if(!pmmRodeoNumber(out.stations.reduce((n,r)=>n+r.quantity,unmapped)))return null;
    out.coverage=pmmRodeoCoverage(out);
    return out;
  }
  function pmmRodeoCoverage(s){
    if(s.reportContract!==undefined)return 'Direct-parent VRID report; all returned stow dates counted; nested station coverage incomplete; report scope only'+(s.excludedRows?` · ${s.excludedRows.toLocaleString('en-US')} blank-dimension rows (${s.excludedUnits.toLocaleString('en-US')} units) excluded, as Rodeo's total does`:'');
    if(s.basis==='aggregate')return s.parentLevels.length===2?'Both parent levels in one aggregate report; report scope only':s.parentLevels[0]==='outerOuter'?'Outer-outer parent only; direct station coverage incomplete':'Direct-parent aggregate only; nested station coverage incomplete';
    const complete=s.startIndex===0&&s.queryUniqueRows===s.itemCount;
    const scope=s.vridScoped?(s.matchedRows===s.queryUniqueRows?'VRID-scoped':'VRID-scoped query returned other VRIDs; matching trailer rows only'):'Not VRID-scoped; matching trailer rows only';
    return `${complete?'All rows returned for this item query; report scope only':`Partial item page: ${s.queryUniqueRows.toLocaleString('en-US')} of ${s.itemCount.toLocaleString('en-US')} query rows, offset ${s.startIndex.toLocaleString('en-US')}`} · ${scope} (${s.matchedRows.toLocaleString('en-US')} matching rows)`;
  }
  function pmmRodeoKey(id,basis){return `pmm-rodeo-v1:${id.site}:${id.vrid}:${basis}`;}
  function pmmRodeoValidSnapshot(s,id,now=Date.now(),basis=s?.basis){
    if(!s||s.v!==1||s.site!==id.site||s.vrid!==id.vrid||s.site!=='LGA9'||s.basis!==basis||!['aggregate','items'].includes(s.basis)||!Number.isSafeInteger(s.at)||!Number.isSafeInteger(s.startedAt)||s.startedAt>s.at||s.at-s.startedAt>300000||s.at>now+60000||now-s.at>86400000)return false;
    if(!Array.isArray(s.stations)||s.stations.length>1200||!Array.isArray(s.caseRows)||s.caseRows.length>10000||!pmmRodeoNumber(s.unmappedUnits)||!pmmRodeoSafeText(s.coverage,400)||!Array.isArray(s.pools)||!s.pools.length||s.pools.length>6||new Set(s.pools).size!==s.pools.length||s.pools.some(p=>!['TransReceived','Unloaded','VendorReceived','UnloadedToConveyance','Decanted','PendingStow'].includes(p))||!Array.isArray(s.extraFilters)||s.extraFilters.length||typeof s.vridScoped!=='boolean'||!Array.isArray(s.parentLevels)||!pmmRodeoNumber(s.sourceRows)||!pmmRodeoNumber(s.matchedRows)||s.matchedRows>s.sourceRows)return false;
    if(s.basis==='aggregate'){
      if(s.caseRows.length||s.itemCount!==null||s.startIndex!==null||s.queryUniqueRows!==null||!s.parentLevels.length||s.parentLevels.length>2||new Set(s.parentLevels).size!==s.parentLevels.length||s.parentLevels.some(p=>!['outer','outerOuter'].includes(p)))return false;
    }else if(s.parentLevels.length||!pmmRodeoNumber(s.itemCount)||!pmmRodeoNumber(s.startIndex)||!pmmRodeoNumber(s.queryUniqueRows)||s.queryUniqueRows>s.sourceRows||s.matchedRows>s.queryUniqueRows||s.sourceRows+s.startIndex>s.itemCount||s.caseRows.length>s.matchedRows)return false;
    if(s.reportContract!==undefined||s.excludedRows!==undefined||s.excludedUnits!==undefined){
      if(s.reportContract!==pmmRodeoReportContract()||s.basis!=='aggregate'||!s.vridScoped||JSON.stringify(s.parentLevels)!=='["outer"]'||JSON.stringify(s.pools)!==JSON.stringify([...pmmRodeoContractPools()].sort())||!pmmRodeoNumber(s.excludedRows)||!pmmRodeoNumber(s.excludedUnits)||(!s.excludedRows&&s.excludedUnits)||s.matchedRows+s.excludedRows>s.sourceRows||s.stations.some(r=>!r||r.quantity===0))return false;
    }
    if(s.coverage!==pmmRodeoCoverage(s))return false;
    const seen=new Set();let total=s.unmappedUnits;
    for(const row of s.stations){const loc=pmmRodeoStation(row?.station);if(!loc||row.floor!==loc.floor||row.zone!==loc.zone||seen.has(row.station)||!pmmRodeoNumber(row.quantity))return false;seen.add(row.station);total+=row.quantity;}
    if(!pmmRodeoNumber(total))return false;
    const cases=new Set(),caseStations=new Map();let caseTotal=0,unmapped=0;
    for(const r of s.caseRows){
      if(!r||!pmmRodeoSafeText(r.caseId)||!r.caseId||!pmmRodeoSafeText(r.containerId)||!r.containerId||!pmmRodeoSafeText(r.manifest,240)||!r.manifest||!['CASE','TOTE','OTHER'].includes(r.type)||!pmmRodeoNumber(r.quantity)||(r.station!==''&&!pmmRodeoStation(r.station)))return false;
      const k=JSON.stringify([r.manifest,r.containerId]);if(cases.has(k))return false;cases.add(k);caseTotal+=r.quantity;
      if(r.station)pmmRodeoAdd(caseStations,r.station,r.quantity);else unmapped+=r.quantity;
    }
    if(s.basis==='items'&&(caseTotal!==total||unmapped!==s.unmappedUnits||caseStations.size!==s.stations.length||s.stations.some(r=>caseStations.get(r.station)!==r.quantity)))return false;
    return JSON.stringify(s).length<=2*1024*1024;
  }
  function pmmRodeoKeys(identity=null,basis=null){
    if(typeof GM_listValues!=='function')return [];
    const out=[];
    for(const key of GM_listValues()){
      const m=/^pmm-rodeo-v1:([A-Z]{3}\d):([A-Z0-9]{6,20}):(aggregate|items):(\d{13}):(\d{13}):([a-z0-9]{1,24})$/.exec(key);
      if(!m||(identity&&(m[1]!==identity.site||m[2]!==identity.vrid))||(basis&&m[3]!==basis))continue;
      out.push({key,site:m[1],vrid:m[2],basis:m[3],startedAt:Number(m[4]),at:Number(m[5])});
    }
    return out.sort((a,b)=>b.startedAt-a.startedAt||b.at-a.at||b.key.localeCompare(a.key));
  }
  function pmmRodeoMetaValid(e,now=Date.now()){return e.startedAt<=e.at&&e.at-e.startedAt<=300000&&e.at<=now+60000&&now-e.at<=86400000;}
  function pmmRodeoLoadEntry(meta){
    // Immutable entries are validated once. A storage listener invalidates a cached
    // entry if another context changes it; old managers without listeners revalidate.
    const cache=pmmRodeoLoadEntry.cache||(pmmRodeoLoadEntry.cache=new Map()),now=Date.now();
    if(cache.has(meta.key)){const e=cache.get(meta.key);return {...e,valid:e.valid&&pmmRodeoMetaValid(meta,now)};}
    let s=null,valid=false;try{s=GM_getValue(meta.key,null);valid=pmmRodeoValidSnapshot(s,meta,now,meta.basis)&&s.startedAt===meta.startedAt&&s.at===meta.at;}catch(_){}
    const e={key:meta.key,s:valid?s:null,valid};
    if(typeof GM_addValueChangeListener==='function'){
      try{
        const listener=GM_addValueChangeListener(meta.key,()=>{const old=cache.get(meta.key);cache.delete(meta.key);try{if(old&&typeof GM_removeValueChangeListener==='function')GM_removeValueChangeListener(old.listener);}catch(_){}});
        if(listener!==undefined&&listener!==null){cache.set(meta.key,{...e,listener});while(cache.size>64||[...cache.values()].filter(v=>v.valid).length>8){const key=[...cache.keys()].find(k=>cache.size>64||cache.get(k).valid),old=cache.get(key);cache.delete(key);try{if(typeof GM_removeValueChangeListener==='function')GM_removeValueChangeListener(old.listener);}catch(_){}}}
      }catch(_){}
    }
    return e;
  }
  function pmmRodeoEntries(identity=null,basis=null){return pmmRodeoKeys(identity,basis).map(pmmRodeoLoadEntry);}
  function pmmRodeoStore(snapshot){
    try{
      const id=pmmRodeoIdentity({destinationWarehouse:snapshot?.site,loadId:snapshot?.vrid});if(!id||!pmmRodeoValidSnapshot(snapshot,id))return false;
      const same=pmmRodeoRead({destinationWarehouse:id.site,loadId:id.vrid},snapshot.basis);
      if(same&&(same.startedAt>snapshot.startedAt||same.startedAt===snapshot.startedAt&&same.at>=snapshot.at))return false;
      const suffix=Math.random().toString(36).slice(2,14)||'0',key=pmmRodeoKey(id,snapshot.basis)+':'+snapshot.startedAt+':'+snapshot.at+':'+suffix;
      GM_setValue(key,snapshot);
      if(!pmmRodeoLoadEntry({key,...id,basis:snapshot.basis,at:snapshot.at,startedAt:snapshot.startedAt}).valid)return false;
      // Metadata-only pruning avoids deserializing up to 40 large pages. Only delete
      // keys observed here, never construct a deletion for an unseen concurrent write.
      const counts=new Map();let kept=0;
      for(const e of pmmRodeoKeys()){
        const group=pmmRodeoKey(e,e.basis),n=(counts.get(group)||0)+1;
        if(!pmmRodeoMetaValid(e)||pmmRodeoLoadEntry.cache?.get(e.key)?.valid===false){GM_deleteValue(e.key);continue;}
        counts.set(group,n);if(n>3||kept>=40)GM_deleteValue(e.key);else kept++;
      }
      return true;
    }catch(_){return false;}
  }
  function pmmRodeoRead(identity,basis){
    const id=pmmRodeoIdentity(identity);if(!id||id.site!=='LGA9'||!['aggregate','items'].includes(basis))return null;
    try{for(const meta of pmmRodeoKeys(id,basis).filter(e=>pmmRodeoMetaValid(e)).slice(0,64)){const e=pmmRodeoLoadEntry(meta);if(e.valid)return e.s;}return null;}catch(_){return null;}
  }
  function pmmRodeoZoneDigit(value){
    // Legacy prefs stored a floor-qualified zone (2400); the hundreds digit is the zone.
    const s=String(value??'');return /^[1-4]$/.test(s)?Number(s):/^[1-3][1-4]00$/.test(s)?Number(s[1]):0;
  }
  function pmmRodeoFilter(rows,prefs){
    const floor=[1,2,3].includes(Number(prefs?.floor))?Number(prefs.floor):0,zone=pmmRodeoZoneDigit(prefs?.zone),dir=prefs?.quantity==='low'?1:-1;
    return rows.filter(r=>(!floor||r.floor===floor)&&(!zone||Math.floor(r.zone/100)%10===zone)).sort((a,b)=>dir*(a.quantity-b.quantity)||a.station.localeCompare(b.station));
  }
  // PMM-CHUNK-BEGIN rodeo-continuation
  // 4.1.1.10: guarded 03k pre-discovery notes buffer fixed outcomes in memory; its guarded flush runs only after the
  // existing statement of the decided branch was issued, and pagehide after the existing Stop.
  // 4.1.1.9: guarded 03j startup notes copy fixed outcomes already decided here, including before a job exists.
  // 4.1.1.6: fixed registration step outcomes are observed through optional 03i hooks only.
  // 4.1.1.2: keeps one helper tab's ownership of its pending snapshot job across native Rodeo sign-in.
  // Native sign-in returns to "/" with an opaque token fragment, removes it with replaceState, then routes
  // in the same document to the saved hashless report path. Until the exact monitor route is restored only
  // origin, pathname, search and hash.length are read. Native tokens/credentials are never read or changed.
  function pmmRodeoSnapshotContinuationSpec(){
    return {prefix:'pmm-rodeo-cont-v1:',field:'pmmRodeoContinuation1',ackMs:2000,tickMs:500,startupRetryMs:150,
      failures:['registration','route','resume','bind','api']};
  }
  // Composite rank keeps the shared stage monotonic. Initial: claimed, registered, bound(unresumed).
  // Return after sign-in: registered|bound(unresumed), then resuming, then bound(resumed). One resume only.
  function pmmRodeoSnapshotContinuationRank(c){
    if(!c||typeof c.resumed!=='boolean')return -1;
    const r=c.resumed?{resuming:3,bound:4}:{claimed:0,registered:1,bound:2};
    return Object.prototype.hasOwnProperty.call(r,c.stage)?r[c.stage]:-1;
  }
  function pmmRodeoSnapshotContinuationHex(v){return typeof v==='string'&&/^[a-f0-9]{32}$/.test(v);}
  // 4.1.1.6 observational hooks into the optional 03i module. They never feed a decision; a missing
  // module or any diagnostic failure is ignored. They add bounded synchronous work, not timers or awaits.
  function pmmRodeoSnapshotContinuationClock(){try{return Date.now();}catch(_){return null;}}
  function pmmRodeoSnapshotContinuationNote(ctx,step,outcome,startedAt){try{if(typeof pmmRodeoRegDiagNote==='function')pmmRodeoRegDiagNote(ctx,step,outcome,startedAt);}catch(_){}try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote(step,outcome,startedAt);}catch(_){}}
  function pmmRodeoSnapshotContinuationSeen(ctx,kind,e){
    try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote(kind,kind==='fail'?e:'ok');}catch(_){}
    try{
      if(kind==='fail'&&typeof pmmRodeoRegDiagFail==='function')pmmRodeoRegDiagFail(ctx,e);
      else if(kind==='pagehide'&&typeof pmmRodeoRegDiagPagehide==='function')pmmRodeoRegDiagPagehide(ctx,e);
      else if(kind==='watch'&&typeof pmmRodeoRegDiagHelperWatch==='function')pmmRodeoRegDiagHelperWatch(ctx);
    }catch(_){}
  }
  // Classifies a tab read the caller has already decided on; failed+matching record means the job check failed.
  function pmmRodeoSnapshotContinuationTabSeen(ctx,step,tab,startedAt,failed){
    try{
      if(!tab)return;
      const r=tab[pmmRodeoSnapshotContinuationSpec().field];
      if(r===undefined||r===null){pmmRodeoSnapshotContinuationNote(ctx,step,'missing',startedAt);return;}
      if(!pmmRodeoSnapshotContinuationSameTab(r,ctx)){pmmRodeoSnapshotContinuationNote(ctx,step,'mismatch',startedAt);return;}
      pmmRodeoSnapshotContinuationNote(ctx,step,'ok',startedAt);
      if(failed)pmmRodeoSnapshotContinuationNote(ctx,'job-check','expired');
    }catch(_){}
  }
  function pmmRodeoSnapshotContinuationTabOk(r){
    return !!r&&typeof r==='object'&&r.v===1&&pmmRodeoSnapshotContinuationHex(r.token)&&pmmRodeoSnapshotContinuationHex(r.owner)&&r.site==='LGA9'&&typeof r.vrid==='string'&&/^[A-Z0-9]{6,20}$/.test(r.vrid)&&Number.isSafeInteger(r.created)&&Number.isSafeInteger(r.expires);
  }
  // Exact still-pending, unexpired job that agrees with the expected identity; never enumerates jobs.
  function pmmRodeoSnapshotContinuationJob(token,expect){
    try{
      if(!pmmRodeoSnapshotContinuationHex(token))return null;
      const j=GM_getValue(pmmRodeoSnapshotSpec().prefix+token,null);
      if(!pmmRodeoSnapshotValidJob(j,token))return null;
      return expect&&(j.site!==expect.site||j.vrid!==expect.vrid||j.created!==expect.created||j.expires!==expect.expires)?null:j;
    }catch(_){return null;}
  }
  function pmmRodeoSnapshotContinuationControl(owner){
    try{
      const j=owner?.job;
      if(!j||!pmmRodeoSnapshotContinuationHex(j.token)||!pmmRodeoSnapshotContinuationHex(owner.owner))return null;
      const c=GM_getValue(pmmRodeoSnapshotContinuationSpec().prefix+j.token,null);
      if(!c||c.v!==1||c.token!==j.token||c.owner!==owner.owner||c.site!==j.site||c.vrid!==j.vrid||c.created!==j.created||c.expires!==j.expires||c.fail!==undefined)return null;
      return pmmRodeoSnapshotContinuationRank(c)<0?null:c;
    }catch(_){return null;}
  }
  function pmmRodeoSnapshotContinuationWrite(ctx,next,step){
    const t0=pmmRodeoSnapshotContinuationClock();let seen='exception';
    try{
      const key=pmmRodeoSnapshotContinuationSpec().prefix+ctx.job.token;
      GM_setValue(key,next);
      seen='read-exception';
      const back=GM_getValue(key,null);
      seen=back?'mismatch':'missing';
      const ok=!!back&&back.v===1&&back.token===next.token&&back.owner===next.owner&&back.stage===next.stage&&back.resumed===next.resumed&&back.site===next.site&&back.vrid===next.vrid&&back.created===next.created&&back.expires===next.expires&&back.fail===next.fail;
      if(ok)seen='ok';
      return ok;
    }catch(_){return false;}
    finally{if(step)pmmRodeoSnapshotContinuationNote(ctx,step,seen,t0);}
  }
  function pmmRodeoSnapshotContinuationAdvance(ctx,stage,resumed){
    const step=({registered:'register-write',resuming:'resume-write',bound:'bind-write'})[stage];
    const cur=pmmRodeoSnapshotContinuationControl(ctx);
    if(!cur){pmmRodeoSnapshotContinuationNote(ctx,step,'missing');return false;}
    const next={v:1,token:cur.token,owner:cur.owner,stage,resumed,site:cur.site,vrid:cur.vrid,created:cur.created,expires:cur.expires};
    if(pmmRodeoSnapshotContinuationRank(next)<=pmmRodeoSnapshotContinuationRank(cur)){pmmRodeoSnapshotContinuationNote(ctx,step,'invalid');return false;}
    return pmmRodeoSnapshotContinuationWrite(ctx,next,step);
  }
  // Resolves {value} from a GM callback, or null after min(2000ms, remaining job TTL). Late callbacks are ignored.
  // seen(outcome,startedAt) only observes: ok, timeout, exception, expired, or late after resolution.
  function pmmRodeoSnapshotContinuationAsk(ctx,call,seen){
    const ms=Math.min(pmmRodeoSnapshotContinuationSpec().ackMs,ctx.job?ctx.job.expires-Date.now():Infinity),t0=pmmRodeoSnapshotContinuationClock();
    const see=o=>{try{seen?.(o,t0);}catch(_){}};
    if(!(ms>0)){see('expired');return Promise.resolve(null);}
    return new Promise(resolve=>{
      let done=false;
      const finish=(v,o)=>{if(done){if(o==='ok')see('late');return;}done=true;clearTimeout(timer);see(o);resolve(v);};
      const timer=setTimeout(()=>finish(null,'timeout'),ms);
      try{call(v=>finish({value:v},'ok'));}catch(_){finish(null,'exception');}
    });
  }
  // Transport failures (and a non-object tab) are noted here; callers note the content classification.
  async function pmmRodeoSnapshotContinuationGetTab(ctx,step){
    const r=await pmmRodeoSnapshotContinuationAsk(ctx,cb=>GM_getTab(cb),step?(o,t0)=>{if(o!=='ok')pmmRodeoSnapshotContinuationNote(ctx,step,o,t0);}:null);
    const tab=r&&r.value&&typeof r.value==='object'?r.value:null;
    if(step&&r&&!tab)pmmRodeoSnapshotContinuationNote(ctx,step,'missing');
    return tab;
  }
  function pmmRodeoSnapshotContinuationSameTab(r,ctx){
    const j=ctx.job;
    return pmmRodeoSnapshotContinuationTabOk(r)&&r.token===j.token&&r.owner===ctx.owner&&r.site===j.site&&r.vrid===j.vrid&&r.created===j.created&&r.expires===j.expires;
  }
  // Runs work(held) once. While held, the exclusive lock is kept until stop, pagehide or the job deadline.
  function pmmRodeoSnapshotContinuationLock(ctx,work,step){
    let called=false;const t0=pmmRodeoSnapshotContinuationClock();
    const run=(held,seen)=>{if(called)return;called=true;pmmRodeoSnapshotContinuationNote(ctx,step,seen,t0);Promise.resolve().then(()=>work(held)).catch(()=>{pmmRodeoSnapshotContinuationNote(ctx,'work','exception');pmmRodeoSnapshotContinuationFail(ctx,'api');});};
    try{
      navigator.locks.request(pmmRodeoSnapshotContinuationSpec().prefix+ctx.job.token,{mode:'exclusive',ifAvailable:true},lock=>{
        if(!lock||ctx.stopped){run(false,'not-held');return undefined;}
        return new Promise(release=>{
          ctx.locked=true;
          ctx.release=()=>{ctx.locked=false;ctx.release=null;release();};
          run(true,'ok');
        });
      }).catch(()=>run(false,'exception'));
    }catch(_){run(false,'exception');}
  }
  // Fixed failure category belongs only to this control record. The monitor consumes it.
  // This reporter never writes the monitor-owned job, so it cannot recreate a cancelled job.
  function pmmRodeoSnapshotContinuationReport(ctx,code){
    try{
      const cur=pmmRodeoSnapshotContinuationControl(ctx);
      if(!cur||!pmmRodeoSnapshotContinuationSpec().failures.includes(code)||!pmmRodeoSnapshotContinuationJob(ctx.job.token,ctx.job))return;
      GM_setValue(pmmRodeoSnapshotContinuationSpec().prefix+ctx.job.token,{...cur,fail:code});
    }catch(_){}
  }
  function pmmRodeoSnapshotContinuationFail(ctx,code){
    if(ctx.stopped)return;
    pmmRodeoSnapshotContinuationSeen(ctx,'fail',code);
    if(ctx.locked)pmmRodeoSnapshotContinuationReport(ctx,code);
    else if(ctx.owner&&ctx.job){
      try{navigator.locks.request(pmmRodeoSnapshotContinuationSpec().prefix+ctx.job.token,{mode:'exclusive',ifAvailable:true},lock=>{if(lock)pmmRodeoSnapshotContinuationReport(ctx,code);}).catch(()=>{});}catch(_){}
    }
    pmmRodeoSnapshotContinuationStop(ctx,true,true);
  }
  // terminal=false (pagehide, e.g. native sign-in navigation) keeps the tab field and control for the return.
  function pmmRodeoSnapshotContinuationStop(ctx,terminal,feeder){
    if(ctx.stopped)return;
    pmmRodeoSnapshotContinuationNote(ctx,'stop',terminal?'terminal':'non-terminal');
    ctx.stopped=true;
    for(const f of ctx.cleanup.splice(0)){try{f();}catch(_){}}
    try{ctx.release?.();}catch(_){}
    if(terminal&&ctx.tabOwned&&typeof GM_getTab==='function'&&typeof GM_saveTab==='function'){
      try{GM_getTab(tab=>{try{
        if(!tab||typeof tab!=='object')return;
        const r=tab[pmmRodeoSnapshotContinuationSpec().field];
        if(!r||r.owner!==ctx.owner||r.token!==ctx.job?.token)return;
        const next={...tab};delete next[pmmRodeoSnapshotContinuationSpec().field];
        GM_saveTab(next,()=>{});
      }catch(_){}});}catch(_){}
    }
    if(feeder){try{ctx.stopFeeder?.();}catch(_){}}
  }
  function pmmRodeoSnapshotContinuationArm(ctx){
    const t=setTimeout(()=>pmmRodeoSnapshotContinuationStop(ctx,true,true),Math.max(0,ctx.job.expires-Date.now()));
    ctx.cleanup.push(()=>clearTimeout(t));
  }
  // Stage bound is written and read back before bound=true, so the helper's first Current() check passes.
  function pmmRodeoSnapshotContinuationBind(ctx,bind,resumed){
    if(ctx.stopped||ctx.bound)return;
    const j=pmmRodeoSnapshotContinuationJob(ctx.job.token,ctx.job),at=pmmRodeoSnapshotJob();
    if(!j||!at||at.token!==j.token||at.created!==j.created){pmmRodeoSnapshotContinuationNote(ctx,'bind-check',j?'mismatch':'expired');pmmRodeoSnapshotContinuationFail(ctx,'bind');return;}
    const advanced=pmmRodeoSnapshotContinuationAdvance(ctx,'bound',resumed);
    if(!advanced||pmmRodeoSnapshotContinuationControl(ctx)?.stage!=='bound'){if(advanced)pmmRodeoSnapshotContinuationNote(ctx,'bind-readback','mismatch');pmmRodeoSnapshotContinuationFail(ctx,'bind');return;}
    ctx.bound=true;
    pmmRodeoSnapshotContinuationNote(ctx,'bound','ok');
    bind(j);
  }
  async function pmmRodeoSnapshotContinuationInitial(ctx,bind,held){
    const S=pmmRodeoSnapshotContinuationSpec(),j=ctx.job,key=S.prefix+j.token;
    // Lock held elsewhere or existing control: a duplicate document for this job. Never adopt or write.
    if(!held||ctx.stopped){pmmRodeoSnapshotContinuationStop(ctx,false,true);return;}
    if(!pmmRodeoSnapshotContinuationJob(j.token,j)){pmmRodeoSnapshotContinuationNote(ctx,'job-check','expired');pmmRodeoSnapshotContinuationStop(ctx,false,true);return;}
    let existing;try{existing=GM_getValue(key,null);}catch(_){existing=undefined;}
    if(existing!==null){pmmRodeoSnapshotContinuationNote(ctx,'job-check',existing===undefined?'exception':'existing');pmmRodeoSnapshotContinuationStop(ctx,false,true);return;}
    const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
    ctx.owner=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
    if(!pmmRodeoSnapshotContinuationWrite(ctx,{v:1,token:j.token,owner:ctx.owner,stage:'claimed',resumed:false,site:j.site,vrid:j.vrid,created:j.created,expires:j.expires},'claim-write')){pmmRodeoSnapshotContinuationFail(ctx,'registration');return;}
    const t1=pmmRodeoSnapshotContinuationClock(),tab=await pmmRodeoSnapshotContinuationGetTab(ctx,'get-tab');
    if(ctx.stopped)return;
    if(!tab||!pmmRodeoSnapshotContinuationJob(j.token,j)){if(tab){pmmRodeoSnapshotContinuationNote(ctx,'get-tab','ok',t1);pmmRodeoSnapshotContinuationNote(ctx,'job-check','expired');}pmmRodeoSnapshotContinuationFail(ctx,'registration');return;}
    pmmRodeoSnapshotContinuationNote(ctx,'get-tab','ok',t1);
    const rec={v:1,token:j.token,owner:ctx.owner,site:j.site,vrid:j.vrid,created:j.created,expires:j.expires};
    ctx.tabOwned=true;
    const ack=await pmmRodeoSnapshotContinuationAsk(ctx,cb=>GM_saveTab({...tab,[S.field]:rec},cb),(o,t0)=>pmmRodeoSnapshotContinuationNote(ctx,'save-tab',o,t0));
    if(ctx.stopped)return;
    if(!ack){pmmRodeoSnapshotContinuationFail(ctx,'registration');return;}
    const t2=pmmRodeoSnapshotContinuationClock(),back=await pmmRodeoSnapshotContinuationGetTab(ctx,'tab-readback');
    if(ctx.stopped)return;
    if(!back||!pmmRodeoSnapshotContinuationSameTab(back[S.field],ctx)||!pmmRodeoSnapshotContinuationJob(j.token,j)){pmmRodeoSnapshotContinuationTabSeen(ctx,'tab-readback',back,t2,true);pmmRodeoSnapshotContinuationFail(ctx,'registration');return;}
    pmmRodeoSnapshotContinuationTabSeen(ctx,'tab-readback',back,t2,false);
    if(!pmmRodeoSnapshotContinuationAdvance(ctx,'registered',false)){pmmRodeoSnapshotContinuationFail(ctx,'registration');return;}
    pmmRodeoSnapshotContinuationBind(ctx,bind,false);
  }
  async function pmmRodeoSnapshotContinuationResume(ctx,bind,canonical,held){
    const S=pmmRodeoSnapshotContinuationSpec(),want=new URL(canonical);
    if(ctx.stopped)return;
    // Another document holds this job's lock: ambiguous, so stop without clearing records.
    if(!held){pmmRodeoSnapshotContinuationStop(ctx,false,true);return;}
    const t1=pmmRodeoSnapshotContinuationClock(),tab=await pmmRodeoSnapshotContinuationGetTab(ctx,'resume-get-tab');
    if(ctx.stopped)return;
    // Re-verify after every asynchronous step; stale callbacks cannot revive cancelled work.
    const c=pmmRodeoSnapshotContinuationControl(ctx),j=pmmRodeoSnapshotContinuationJob(ctx.job.token,ctx.job);
    if(!tab||!pmmRodeoSnapshotContinuationSameTab(tab[S.field],ctx)||!j){pmmRodeoSnapshotContinuationTabSeen(ctx,'resume-get-tab',tab,t1,true);pmmRodeoSnapshotContinuationStop(ctx,true,true);return;}
    pmmRodeoSnapshotContinuationTabSeen(ctx,'resume-get-tab',tab,t1,false);
    if(!c||c.resumed!==false||!['claimed','registered','bound'].includes(c.stage)){pmmRodeoSnapshotContinuationNote(ctx,'resume-check',c?'invalid':'missing');pmmRodeoSnapshotContinuationFail(ctx,'resume');return;}
    if(location.origin!==want.origin||location.pathname!==want.pathname||location.search!==want.search||location.hash.length!==0){pmmRodeoSnapshotContinuationNote(ctx,'route','mismatch');pmmRodeoSnapshotContinuationFail(ctx,'route');return;}
    // Native navigation can interrupt saveTab acknowledgement or registration readback. Recover only
    // after this same tab's record, exact pending job and claimed control pass under the job lock.
    // Neither the route, VRID nor a shared control by itself can attach a tab.
    if(c.stage==='claimed'&&!pmmRodeoSnapshotContinuationAdvance(ctx,'registered',false)){pmmRodeoSnapshotContinuationFail(ctx,'registration');return;}
    // Budget is consumed and verified before the URL is touched.
    if(!pmmRodeoSnapshotContinuationAdvance(ctx,'resuming',true)){pmmRodeoSnapshotContinuationFail(ctx,'resume');return;}
    if(!pmmRodeoSnapshotContinuationJob(ctx.job.token,ctx.job)){pmmRodeoSnapshotContinuationNote(ctx,'job-check','expired');pmmRodeoSnapshotContinuationStop(ctx,true,true);return;}
    // Restores only the missing monitor fragment; native history state and title are preserved, no reload.
    try{history.replaceState(history.state,document.title,canonical);}catch(_){pmmRodeoSnapshotContinuationNote(ctx,'route-restore','exception');pmmRodeoSnapshotContinuationFail(ctx,'resume');return;}
    pmmRodeoSnapshotContinuationNote(ctx,'route-restore','ok');
    pmmRodeoSnapshotContinuationBind(ctx,bind,true);
  }
  // Same-document wait for native cleanup and routing, bounded by the job deadline. No UI, no URL writes.
  function pmmRodeoSnapshotContinuationWait(ctx,bind){
    const want=new URL(pmmRodeoSnapshotUrl(ctx.job,ctx.job.token));
    let started=false,observer=null,tick=null;
    const check=()=>{
      try{
        if(ctx.stopped||started)return;
        if(!pmmRodeoSnapshotContinuationJob(ctx.job.token,ctx.job)){pmmRodeoSnapshotContinuationNote(ctx,'job-check','expired');pmmRodeoSnapshotContinuationStop(ctx,true,true);return;}
        if(location.origin!==want.origin)return;
        const p=location.pathname,s=location.search,h=location.hash.length;
        if(p===want.pathname&&s===want.search&&h===0){
          started=true;observer?.disconnect();clearInterval(tick);
          pmmRodeoSnapshotContinuationNote(ctx,'route','ok');
          pmmRodeoSnapshotContinuationLock(ctx,held=>pmmRodeoSnapshotContinuationResume(ctx,bind,want.href,held),'resume-lock');
          return;
        }
        // Root (callback or cleaned) and the exact report path with an opaque fragment are left untouched.
        if(p==='/'){
          if(h===0){const state=history.state;
            if(state&&Object.prototype.hasOwnProperty.call(state,'federatedUrl')&&state.federatedUrl!==want.pathname+want.search){pmmRodeoSnapshotContinuationNote(ctx,'route','mismatch');pmmRodeoSnapshotContinuationFail(ctx,'route');return;}
          }
          return;
        }
        if(p===want.pathname&&s===want.search)return;
        pmmRodeoSnapshotContinuationNote(ctx,'route','invalid');
        pmmRodeoSnapshotContinuationFail(ctx,'route');
      }catch(_){pmmRodeoSnapshotContinuationNote(ctx,'route','exception');pmmRodeoSnapshotContinuationFail(ctx,'route');}
    };
    try{observer=new MutationObserver(check);observer.observe(document.documentElement,{childList:true,subtree:true});}catch(_){}
    tick=setInterval(check,pmmRodeoSnapshotContinuationSpec().tickMs);
    try{window.addEventListener('popstate',check);}catch(_){}
    ctx.cleanup.push(()=>{observer?.disconnect();clearInterval(tick);try{window.removeEventListener('popstate',check);}catch(_){}});
    check();
  }
  async function pmmRodeoSnapshotContinuationReturn(ctx,bind,manual,expectedToken){
    const S=pmmRodeoSnapshotContinuationSpec(),root=location.pathname==='/';
    const ordinary=()=>{try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('return-ordinary',root?'skipped':'manual');}catch(_){}if(!root)manual();};
    if(typeof GM_getTab!=='function'||typeof GM_saveTab!=='function'||!navigator.locks||typeof navigator.locks.request!=='function'){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('return-api','unsupported');}catch(_){}try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('return','unsupported');}catch(_){}ordinary();try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}return;}
    const t0=pmmRodeoSnapshotContinuationClock(),tab=await pmmRodeoSnapshotContinuationGetTab(ctx);
    try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('return-tab-read',tab?'ok':'missing',t0);}catch(_){}
    if(ctx.stopped)return;
    const r=tab?.[S.field];
    if(!pmmRodeoSnapshotContinuationTabOk(r)||(expectedToken&&r.token!==expectedToken)){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('return-tab',r===undefined||r===null?'none':'rejected');}catch(_){}try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('return',r===undefined||r===null?'none':'rejected');}catch(_){}ordinary();try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}return;}
    const j=pmmRodeoSnapshotContinuationJob(r.token,r);
    if(!j){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('return-job','none');}catch(_){}try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('return','no-job');}catch(_){}ordinary();try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}return;}
    const probe={job:j,owner:r.owner};
    const c=pmmRodeoSnapshotContinuationControl(probe);
    if(!c){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('return-control-read','none');}catch(_){}try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('return','no-control');}catch(_){}ordinary();try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}return;}
    ctx.job=j;ctx.owner=r.owner;ctx.tabOwned=true;
    pmmRodeoSnapshotContinuation.value=ctx;
    pmmRodeoSnapshotContinuationNote(ctx,'return-start','ok');
    try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('return','started');}catch(_){}
    pmmRodeoSnapshotContinuationNote(ctx,'return-get-tab','ok',t0);
    pmmRodeoSnapshotContinuationSeen(ctx,'watch');
    pmmRodeoSnapshotContinuationArm(ctx);
    if(c.resumed!==false||!['claimed','registered','bound'].includes(c.stage)){pmmRodeoSnapshotContinuationNote(ctx,'return-control','invalid');pmmRodeoSnapshotContinuationFail(ctx,'resume');try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}return;}
    pmmRodeoSnapshotContinuationWait(ctx,bind);
    try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}
  }
  // The report can be injected before its GM job reaches this document. Wait at most two
  // short turns (150/300ms) for that SAME exact monitor fragment, never a VRID search.
  // No job means no claim, record, lock, request, URL write or manual capture.
  function pmmRodeoSnapshotContinuationDelayed(ctx,fragment,bind,manual){
    const S=pmmRodeoSnapshotContinuationSpec();
    let n=0,timer=null;
    const same=()=>{try{return location.origin===pmmRodeoSnapshotSpec().origin&&location.pathname==='/LGA9/post'&&location.hash.length===fragment.length&&location.hash.startsWith('#pmm-rodeo-snapshot=')&&location.hash===fragment;}catch(_){return false;}};
    const check=()=>{
      timer=null;if(ctx.stopped){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('retry','skipped',ctx.startProbeAt);}catch(_){}try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('retry','skipped');}catch(_){}try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}return;}
      if(!same()){
        // A same-document native redirect to the root can still carry a tab-bound pending job.
        // Return reads only the tab field; its own exact-job and expiry checks must pass.
        if(location.origin===pmmRodeoSnapshotSpec().origin&&location.pathname==='/'){
          try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('retry-left','return',ctx.startProbeAt);}catch(_){}try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('retry-left','root');}catch(_){}
          pmmRodeoSnapshotContinuationReturn(ctx,bind,manual,fragment.slice('#pmm-rodeo-snapshot='.length)).catch(()=>{if(ctx.job&&ctx.owner)pmmRodeoSnapshotContinuationFail(ctx,'api');});
          try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}
        }else if(location.pathname!=='/'){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('retry-left','manual',ctx.startProbeAt);}catch(_){}try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('retry-left','other');}catch(_){}manual();try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}}
        return;
      }
      const j=pmmRodeoSnapshotJob();
      if(j){
        try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('retry','job',ctx.startProbeAt);}catch(_){}try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('retry','job');}catch(_){}
        ctx.job=j;pmmRodeoSnapshotContinuation.value=ctx;
        if(typeof GM_getTab!=='function'||typeof GM_saveTab!=='function'||!navigator.locks||typeof navigator.locks.request!=='function'||typeof crypto==='undefined'||typeof crypto.getRandomValues!=='function'){try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('recognized','unsupported');}catch(_){}pmmRodeoSnapshotContinuationNote(ctx,'helper-start','unsupported');pmmRodeoSnapshotContinuationStop(ctx,false,true);try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}return;}
        try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('recognized','ok');}catch(_){}
        pmmRodeoSnapshotContinuationNote(ctx,'helper-start','ok',ctx.startProbeAt);
        pmmRodeoSnapshotContinuationSeen(ctx,'watch');
        pmmRodeoSnapshotContinuationArm(ctx);
        pmmRodeoSnapshotContinuationLock(ctx,held=>pmmRodeoSnapshotContinuationInitial(ctx,bind,held),'lock');
        try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}
        return;
      }
      if(++n>=2){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('retry','manual',ctx.startProbeAt);}catch(_){}try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('retry','manual');}catch(_){}manual();try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}return;}
      try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('retry','missing',ctx.startProbeAt);}catch(_){}try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('retry','unrecognized');}catch(_){}
      timer=setTimeout(check,S.startupRetryMs);
    };
    timer=setTimeout(check,S.startupRetryMs);
    ctx.cleanup.push(()=>{if(timer!==null)clearTimeout(timer);});
  }
  function pmmRodeoSnapshotContinuation(bind,stop,manual){
    const ctx={job:null,owner:'',bound:false,stopped:false,locked:false,release:null,tabOwned:false,cleanup:[],stopFeeder:stop};
    const control={stop:()=>pmmRodeoSnapshotContinuationStop(ctx,true,false)};
    let manualDone=false;
    const manualOnce=()=>{if(manualDone||ctx.stopped)return;manualDone=true;try{manual();}catch(_){}};
    try{
      if(location.origin!==pmmRodeoSnapshotSpec().origin){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('cont-start','mismatch');}catch(_){}return control;}
      const onHide=e=>{pmmRodeoSnapshotContinuationSeen(ctx,'pagehide',e);pmmRodeoSnapshotContinuationStop(ctx,false,false);try{if(typeof pmmRodeoPrediagPagehide==='function')pmmRodeoPrediagPagehide(e);}catch(_){}};
      window.addEventListener('pagehide',onHide);
      ctx.cleanup.push(()=>{try{window.removeEventListener('pagehide',onHide);}catch(_){}});
      try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('cont-start','ok');}catch(_){}
      // Callbacks land on "/", so a fragment is read in full only on the report path (prefix-checked in 03d).
      if(location.pathname==='/LGA9/post'&&location.hash.length>0){
        try{if(typeof pmmRodeoPrediagEntry==='function')pmmRodeoPrediagEntry();}catch(_){}
        const j=pmmRodeoSnapshotJob();
        try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('initial',j?'job':'unrecognized');}catch(_){}
        if(!j){
          // Retry only a syntactically exact monitor fragment. Opaque native fragments are never copied.
          if(location.hash.length===('#pmm-rodeo-snapshot='.length+32)&&/^#pmm-rodeo-snapshot=[a-f0-9]{32}$/.test(location.hash)){
            try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('start-route','delayed');}catch(_){}
            ctx.startProbeAt=pmmRodeoSnapshotContinuationClock();
            pmmRodeoSnapshotContinuationDelayed(ctx,location.hash,bind,manualOnce);
            try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}
          }else{try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('start-route','opaque');}catch(_){}manualOnce();}
          return control;
        }
        try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('start-route','job');}catch(_){}
        ctx.job=j;
        pmmRodeoSnapshotContinuation.value=ctx;
        if(typeof GM_getTab!=='function'||typeof GM_saveTab!=='function'||!navigator.locks||typeof navigator.locks.request!=='function'||typeof crypto==='undefined'||typeof crypto.getRandomValues!=='function'){try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('recognized','unsupported');}catch(_){}pmmRodeoSnapshotContinuationNote(ctx,'helper-start','unsupported');pmmRodeoSnapshotContinuationStop(ctx,false,true);try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}return control;}
        try{if(typeof pmmRodeoPrediagNote==='function')pmmRodeoPrediagNote('recognized','ok');}catch(_){}
        pmmRodeoSnapshotContinuationNote(ctx,'helper-start','ok');
        pmmRodeoSnapshotContinuationSeen(ctx,'watch');
        pmmRodeoSnapshotContinuationArm(ctx);
        pmmRodeoSnapshotContinuationLock(ctx,held=>pmmRodeoSnapshotContinuationInitial(ctx,bind,held),'lock');
        try{if(typeof pmmRodeoPrediagFlush==='function')pmmRodeoPrediagFlush();}catch(_){}
        return control;
      }
      try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('start-route','return');}catch(_){}
      pmmRodeoSnapshotContinuationReturn(ctx,bind,manualOnce).catch(()=>{if(ctx.job&&ctx.owner)pmmRodeoSnapshotContinuationFail(ctx,'api');});
    }catch(_){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('cont-start','exception');}catch(_){}if(ctx.job&&ctx.owner)pmmRodeoSnapshotContinuationFail(ctx,'api');}
    return control;
  }
  // PMM-CHUNK-END rodeo-continuation
  // PMM-CHUNK-BEGIN rodeo-feeder
  // 4.1.0: feed-only branch for the Rodeo page. It observes reports Rodeo itself requests and never
  // sends, replays, delays or alters a request or response. It runs before the monitor initialises, so
  // it uses only function declarations and locals. true means "Rodeo origin: the caller must exit".
  // 4.1.1.9: guarded 03j startup notes record branches already taken; they never feed a decision.
  // 4.1.1.12: inside the separate Rodeo loader frame the feeder dispatches only to the frame continuation (03l);
  // it never mounts the manual panel there or uses the top-level tab continuation.
  function pmmRodeoFeederSpec(){
    return {origin:'https://iad.inbound.rodeo.aft.a2z.com',apiHost:'api.iad.inbound.rodeo.aft.a2z.com',
      operations:['getAggregateReport','getTransshipmentItemList'],sentinel:'__pmmRodeoFeeder410__',
      maxRequestChars:1<<20,maxResponseBytes:8<<20,readTimeoutMs:15000,maxInFlight:4};
  }
  function pmmRodeoFeederPage(){
    try{if(typeof unsafeWindow!=='undefined'&&unsafeWindow)return unsafeWindow}catch{}
    return window;
  }
  function pmmRodeoFeederOperation(raw,base){
    try{
      const S=pmmRodeoFeederSpec(),u=new URL(String(raw),base);
      if(u.protocol!=='https:'||u.hostname!==S.apiHost||u.port||u.username||u.password||u.search||u.hash)return '';
      const op=u.pathname.slice(1);
      return S.operations.includes(op)?op:'';
    }catch{return ''}
  }
  function pmmRodeoFeederSeed(path,search){
    let site='',vrid='';
    try{site=String(String(path).split('/').filter(Boolean)[0]||'').trim().toUpperCase()}catch{}
    try{vrid=String(new URLSearchParams(String(search)).get('vrId')||'').trim().toUpperCase()}catch{}
    return {site:/^[A-Z0-9]{1,8}$/.test(site)?site:'',vrid:/^[A-Z0-9]{1,20}$/.test(vrid)?vrid:''};
  }
  function pmmRodeoFeederJson(text,max){
    if(typeof text!=='string'||!text||text.length>max)return null;
    try{const v=JSON.parse(text);return v&&typeof v==='object'&&!Array.isArray(v)?v:null}catch{return null}
  }
  // Reads a response clone with byte and time limits. The page's own response is never touched.
  async function pmmRodeoFeederRead(response,S){
    const body=response&&response.body;
    if(!body||typeof body.getReader!=='function')return null;
    const reader=body.getReader(),decoder=new TextDecoder(),parts=[];
    const cancel=()=>{try{Promise.resolve(reader.cancel()).catch(()=>{})}catch{}};
    let bytes=0,expired=false;
    const timer=setTimeout(()=>{expired=true;cancel()},S.readTimeoutMs);
    try{
      for(;;){
        const part=await reader.read();
        if(expired)return null;
        if(part.done)break;
        const chunk=part.value;
        if(!chunk||typeof chunk.byteLength!=='number'){cancel();return null}
        bytes+=chunk.byteLength;
        if(bytes>S.maxResponseBytes){cancel();return null}
        parts.push(decoder.decode(chunk,{stream:true}));
      }
      parts.push(decoder.decode());
      return pmmRodeoFeederJson(parts.join(''),Infinity);
    }catch{return null}
    finally{clearTimeout(timer);try{reader.releaseLock()}catch{}}
  }
  function pmmRodeoFeederStart(){
    const S=pmmRodeoFeederSpec();
    let origin='';try{origin=location.origin}catch{}
    if(origin!==S.origin){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('feeder-origin','mismatch');}catch(_){}return false;}
    try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('feeder-origin','ok');}catch(_){}
    const page=pmmRodeoFeederPage();
    let top=false;try{top=window.top===window.self&&page.top===page}catch{}
    let frame=false;
    if(!top){
      try{frame=typeof pmmRodeoFrameChildGate==='function'&&typeof pmmRodeoFrameContinuation==='function'&&pmmRodeoFrameChildGate()===true;}catch{frame=false}
      if(!frame){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('frame','not-top');}catch(_){}return true;}
    }
    try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('frame','ok');}catch(_){}
    try{if(page[S.sentinel]){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('sentinel','present');}catch(_){}return true}Object.defineProperty(page,S.sentinel,{value:true,configurable:true})}catch{try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('sentinel','exception');}catch(_){}return true}
    try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('sentinel','ok');}catch(_){}
    let href='';try{href=location.origin}catch{}
    const st={autoObserved:false,target:null,paused:false,stopped:false,inFlight:0,stored:0,lastAt:0,note:'',hooks:{fetch:false,open:false,send:false}};
    let autoJob=null;
    let continuation=null;
    const meta=new WeakMap(),restorers=[];
    let ui=null;

    function begin(method,url,body){
      const target=st.target;
      if(!target||st.paused||st.stopped)return null;
      if(autoJob&&!pmmRodeoSnapshotCurrent(autoJob))return null;
      if(String(method||'GET').toUpperCase()!=='POST')return null;
      const operation=pmmRodeoFeederOperation(url,href);
      if(!operation)return null;
      if(st.inFlight>=S.maxInFlight){st.note='Some reports were skipped while others were still being read.';paint();return null}
      const data=pmmRodeoFeederJson(body,S.maxRequestChars);
      // Cheap identity pre-check; pmmRodeoNormalize remains the authority on what matches.
      if(!data||data.warehouseId!==target.site)return null;
      if(autoJob&&operation==='getAggregateReport'&&data.filterList?.vrIdFilter?.value===autoJob.vrid)st.autoObserved=true;
      st.inFlight++;
      return {target,operation,data,startedAt:new Date().toISOString(),done:false};
    }
    function finish(ctx,data){
      if(ctx.done)return;
      ctx.done=true;st.inFlight=Math.max(0,st.inFlight-1);
      try{
        if(!data||st.stopped||st.paused||st.target!==ctx.target)return;
        const record={operation:ctx.operation,method:'POST',status:200,startedAt:ctx.startedAt,completedAt:new Date().toISOString(),
          request:{format:'json',data:ctx.data},response:{format:'json',data}};
        let snapshot=null;
        try{snapshot=typeof pmmRodeoNormalize==='function'?pmmRodeoNormalize(record,{destinationWarehouse:ctx.target.site,loadId:ctx.target.vrid},Date.now()):null}
        catch{st.note='A captured report could not be read.';return}
        if(!snapshot){st.note='The last captured report was not accepted (unsupported filters, scope or format). This is not a zero-quantity result.';return}
        if(autoJob&&!pmmRodeoSnapshotAccept(autoJob,record,snapshot))return;
        let saved=false;try{saved=typeof pmmRodeoStore==='function'&&pmmRodeoStore(snapshot)===true}catch{}
        if(saved){st.stored++;st.lastAt=Date.now();st.note='';if(autoJob){pmmRodeoSnapshotFinish(autoJob,'done');stop();}}
        else st.note='The last capture was not saved (older than the saved one, or invalid).';
      }catch{}
      finally{paint()}
    }
    function onFetchResponse(ctx,response){
      if(!response||response.status!==200||response.redirected||response.type==='opaque'||response.type==='opaqueredirect'
        ||pmmRodeoFeederOperation(response.url)!==ctx.operation)return finish(ctx,null);
      let copy;try{copy=response.clone()}catch{return finish(ctx,null)}
      pmmRodeoFeederRead(copy,S).then(data=>finish(ctx,data),()=>finish(ctx,null));
    }
    function observeFetch(input,init,result){
      if(!st.target||st.paused||st.stopped)return;
      const url=typeof input==='string'?input:input&&typeof input.url==='string'?input.url:String(input);
      const method=(init&&init.method)||(input&&typeof input==='object'&&input.method)||'GET';
      // Request objects carry stream bodies; those are never read.
      const ctx=begin(method,url,init?init.body:null);
      if(!ctx)return;
      if(!result||typeof result.then!=='function')return finish(ctx,null);
      result.then(r=>{try{onFetchResponse(ctx,r)}catch{finish(ctx,null)}},()=>finish(ctx,null));
    }
    function onXhrDone(ctx,xhr){
      if(xhr.status!==200||pmmRodeoFeederOperation(xhr.responseURL)!==ctx.operation)return finish(ctx,null);
      const type=xhr.responseType;let data=null;
      if(type===''||type==='text')data=pmmRodeoFeederJson(xhr.responseText,S.maxResponseBytes);
      else if(type==='json'){const v=xhr.response;data=v&&typeof v==='object'&&!Array.isArray(v)?v:null}
      finish(ctx,data);
    }
    function observeXhr(xhr,body){
      const m=meta.get(xhr);meta.delete(xhr);
      if(!m||!m.async)return;
      const ctx=begin(m.method,m.url,body);
      if(!ctx)return;
      try{xhr.addEventListener('loadend',()=>{try{onXhrDone(ctx,xhr)}catch{finish(ctx,null)}},{once:true})}catch{finish(ctx,null)}
    }
    function hook(obj,key,make,label){
      try{
        const original=obj&&obj[key];
        if(typeof original!=='function'){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('hook-'+label,'missing');}catch(_){}return;}
        const wrapped=make(original);
        obj[key]=wrapped;
        if(obj[key]!==wrapped){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('hook-'+label,'mismatch');}catch(_){}return;}
        st.hooks[label]=true;
        restorers.push(()=>{if(obj[key]===wrapped)obj[key]=original});
        try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('hook-'+label,'ok');}catch(_){}
      }catch{try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('hook-'+label,'exception');}catch(_){}}
    }
    // Each wrapper calls the original first and returns its exact result or exception.
    hook(page,'fetch',original=>function(input,init){
      const result=Reflect.apply(original,this,arguments);
      try{observeFetch(input,init,result)}catch{}
      return result;
    },'fetch');
    let proto=null;try{proto=page.XMLHttpRequest&&page.XMLHttpRequest.prototype}catch{}
    hook(proto,'open',original=>function(method,url,async){
      const result=Reflect.apply(original,this,arguments);
      try{meta.set(this,{method:String(method),url:String(url),async:arguments.length<3||!!async})}catch{try{meta.delete(this)}catch{}}
      return result;
    },'open');
    hook(proto,'send',original=>function(body){
      const result=Reflect.apply(original,this,arguments);
      try{observeXhr(this,body)}catch{}
      return result;
    },'send');

    function trusted(e){return !e||e.isTrusted!==false}
    function save(){
      if(!ui)return;
      const id=typeof pmmRodeoIdentity==='function'?pmmRodeoIdentity({destinationWarehouse:ui.site.value,loadId:ui.vrid.value}):null;
      if(!id){ui.error.textContent='Enter a site like LGA9 and a 6 to 20 character VRID, then Save.';return}
      ui.error.textContent='';
      ui.site.value=id.site;ui.vrid.value=id.vrid;
      // Re-saving the same target keeps in-flight reads; a new target discards them and its count.
      if(!st.target||st.target.site!==id.site||st.target.vrid!==id.vrid){st.target=Object.freeze({site:id.site,vrid:id.vrid});st.stored=0;st.lastAt=0}
      st.paused=false;st.note='';
      paint();
    }
    function pause(){if(st.target){st.paused=!st.paused;st.note=''}paint()}
    function stop(){
      st.stopped=true;st.target=null;
      try{continuation?.stop()}catch{}
      for(const restore of restorers.splice(0).reverse()){try{restore()}catch{}}
      try{ui&&ui.host.remove()}catch{}
      ui=null;
    }
    function paint(){
      try{
        if(!ui)return;
        const t=st.target;
        let status;
        if(!st.hooks.fetch&&!st.hooks.send)status='Rodeo reports cannot be observed in this tab. Reload Rodeo and try again.';
        else if(!t)status='Not capturing. Enter the site and VRID, then Save.';
        else if(st.paused)status='Paused for '+t.site+' / '+t.vrid+'. Nothing is captured.';
        else status='Capturing '+t.site+' / '+t.vrid+'. Use Rodeo\'s normal report refresh now. This panel makes no requests.';
        ui.status.textContent=status;
        ui.count.textContent=t?'Saved '+st.stored+' snapshot'+(st.stored===1?'':'s')+(st.lastAt?', last at '+new Date(st.lastAt).toLocaleTimeString():'')+'.':'';
        ui.note.textContent=st.note;
        ui.pause.textContent=st.paused?'Resume':'Pause';
        ui.pause.disabled=!t;
      }catch{}
    }
    function mount(){
      if(ui||st.stopped||!document.body)return;
      const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n};
      const host=el('div');host.id='pmm-rodeo-feeder';
      host.style.cssText='position:fixed;left:12px;bottom:12px;z-index:2147483646';
      const root=host.attachShadow({mode:'closed'});
      const style=el('style');
      style.textContent='*{box-sizing:border-box}section{width:300px;max-width:90vw;background:#fff;color:#19222d;border:1px solid #8a99a6;border-radius:8px;box-shadow:0 3px 14px #0003;padding:10px;font:12px/1.4 system-ui,sans-serif}h2{font-size:13px;margin:0 0 6px}label{display:inline-block;margin:0 6px 4px 0}input{width:90px;padding:4px;border:1px solid #87949e;border-radius:4px;font:inherit;text-transform:uppercase}input.v{width:130px}button{cursor:pointer;background:#edf3f5;color:#142f3b;border:1px solid #869ba4;border-radius:4px;padding:4px 8px;margin:2px 4px 2px 0;font:inherit}button:disabled{cursor:default;opacity:.55}button:focus-visible,input:focus-visible{outline:2px solid #007faa}p{margin:4px 0}.e{color:#a1260d}.s{color:#44545e}';
      const section=el('section');
      section.appendChild(el('h2','Pallet Monitor: Rodeo station feed'));
      const seed=pmmRodeoFeederSeed(location.pathname,location.search);
      const field=(text,cls,value,max)=>{const l=el('label',text+' ');const i=el('input');i.type='text';i.maxLength=max;i.autocomplete='off';i.spellcheck=false;i.value=value;if(cls)i.className=cls;l.appendChild(i);section.appendChild(l);return i};
      const site=field('Site','',seed.site,8),vrid=field('VRID','v',seed.vrid,20);
      const row=el('div');
      const button=(text,action)=>{const b=el('button',text);b.type='button';b.addEventListener('click',e=>{if(trusted(e)){try{action()}catch{}}});row.appendChild(b);return b};
      button('Save',save);const pauseBtn=button('Pause',pause);button('Stop',stop);
      section.appendChild(row);
      const error=el('p');error.className='e';
      const status=el('p');status.setAttribute('aria-live','polite');
      const count=el('p'),note=el('p');note.className='s';
      const help=el('p','Only reports Rodeo loads after Save are read. Closing Rodeo stops updates.');help.className='s';
      for(const n of [error,status,count,note,help])section.appendChild(n);
      root.appendChild(style);root.appendChild(section);
      ui={host,site,vrid,error,status,count,note,pause:pauseBtn};
      document.body.appendChild(host);
      paint();
    }
    function bind(j){
      if(st.stopped||autoJob){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('feeder-bind','skipped');}catch(_){}return;}
      autoJob=j;href=location.origin;st.target=Object.freeze({site:j.site,vrid:j.vrid});
      if(!st.hooks.fetch&&!(st.hooks.open&&st.hooks.send)){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('feeder-bind','hooks-missing');}catch(_){}pmmRodeoSnapshotFinish(j,'failed');stop();}
      else{try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('feeder-bind','ok');}catch(_){}pmmRodeoSnapshotHelper(j,()=>st.autoObserved);}
    }
    function manual(){
      if(st.stopped||autoJob||location.pathname==='/'){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('manual','skipped');}catch(_){}return;}
      if(document.body){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('manual','mounted');}catch(_){}mount();}
      else{try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('manual','deferred');}catch(_){}document.addEventListener('DOMContentLoaded',()=>{try{mount()}catch{}},{once:true});}
    }
    if(frame){continuation=pmmRodeoFrameContinuation(bind,stop);return true;}
    if(typeof pmmRodeoSnapshotContinuation==='function'){try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('branch','ok');}catch(_){}continuation=pmmRodeoSnapshotContinuation(bind,stop,manual);}
    else{try{if(typeof pmmRodeoStartupDiagNote==='function')pmmRodeoStartupDiagNote('branch','unsupported');}catch(_){}manual();}
    return true;
  }
  // PMM-CHUNK-END rodeo-feeder

  // 4.1.1: one bounded native Rodeo report per snapshot request.
  // 4.1.1.12: automated attempts load in the separate offscreen Rodeo frame (03l), never a background tab.
  // Frame jobs carry transport:'frame'; only frame-mode callers accept them, so a top-level tab never adopts one.
  // Rodeo owns authentication and report transport. No credential access or API request replay.
  function pmmRodeoSnapshotSpec(){return {prefix:'pmm-rodeo-job-v1:',ttl:90000,fresh:300000,cooldown:10000,queueTtl:120000,origin:'https://iad.inbound.rodeo.aft.a2z.com',pools:['TransReceived','Unloaded','VendorReceived','UnloadedToConveyance','Decanted','PendingStow']};}
  // The user's own LGA9 report URL in its native order and encoding (blank filters kept, one
  // comma-joined workPools value); only the blank vrId is filled. Exact href/search guards depend on it.
  function pmmRodeoSnapshotQuery(vrid){
    const pairs=[['xAxis','ExpectedStowDateDimension'],['yAxis','OuterScannableIdDimension'],['zAxis','VRIdDimension'],['bucketSize','15_MIN'],['expectedStowDateRangeOption','PLUS_MINUS_ONE_DAY'],['shipmentType','TRANSSHIPMENT'],
      ...['containerId','containerSizes','containerTypes','fcSku','fnSku','isaId','isdId','isReactive','outerContainerId','outerContainerTypes','outerScannableId','outerOuterScannableId','floor','mod','processPaths','scannableId','sourceWarehouseIds'].map(k=>[k,'']),
      ['status','Actuals'],['vrId',vrid],['locationId',''],['locationName',''],['workPools',pmmRodeoSnapshotSpec().pools.join(',')]];
    return '?'+pairs.map(([k,v])=>k+'='+encodeURIComponent(v)).join('&');
  }
  function pmmRodeoSnapshotUrl(id,token){
    if(!/^[A-Z0-9]{6,20}$/.test(id?.vrid||'')||!/^[a-f0-9]{32}$/.test(token||''))throw Error('Invalid Rodeo snapshot target');
    return pmmRodeoSnapshotSpec().origin+'/LGA9/post'+pmmRodeoSnapshotQuery(id.vrid)+'#pmm-rodeo-snapshot='+token;
  }
  function pmmRodeoSnapshotInFrame(){try{return window.top!==window;}catch(_){return true;}}
  function pmmRodeoSnapshotValidJob(j,token,frame){
    const S=pmmRodeoSnapshotSpec(),now=Date.now();
    return !!j&&(frame===true?j.transport==='frame':j.transport===undefined)&&j.v===1&&/^[a-f0-9]{32}$/.test(token)&&j.token===token&&j.site==='LGA9'&&/^[A-Z0-9]{6,20}$/.test(j.vrid)&&Number.isSafeInteger(j.created)&&j.created<=now&&j.expires===j.created+S.ttl&&now<j.expires&&j.status==='pending';
  }
  // Read a full URL only after a report-route check and an exact monitor-only fragment shape.
  // Native callback fragments are opaque and never copied into a URL object or diagnostic.
  function pmmRodeoSnapshotJob(frame){
    try{
      if(location.origin!==pmmRodeoSnapshotSpec().origin||location.pathname!=='/LGA9/post')return null;
      if(location.hash.length!=='#pmm-rodeo-snapshot='.length+32)return null;
      const fragment=location.hash;if(!fragment.startsWith('#pmm-rodeo-snapshot='))return null;
      const m=/^#pmm-rodeo-snapshot=([a-f0-9]{32})$/.exec(fragment);if(!m)return null;
      const j=GM_getValue(pmmRodeoSnapshotSpec().prefix+m[1],null);
      return pmmRodeoSnapshotValidJob(j,m[1],frame===true)&&location.href===pmmRodeoSnapshotUrl(j,m[1])?j:null;
    }catch(_){return null;}
  }
  function pmmRodeoSnapshotCurrent(j){
    try{
      // Inside a frame only the separate frame ownership context can authorize capture.
      if(pmmRodeoSnapshotInFrame())return typeof pmmRodeoFrameCurrent==='function'&&pmmRodeoFrameCurrent(j)===true;
      const found=pmmRodeoSnapshotJob();
      if(!found||found.site!==j.site||found.vrid!==j.vrid||found.created!==j.created||found.token!==j.token)return false;
      // Missing coordinator or owner never authorizes capture.
      if(typeof pmmRodeoSnapshotContinuation!=='function')return false;
      const owner=pmmRodeoSnapshotContinuation.value;
      if(!owner||owner.job?.token!==j.token||owner.stopped||!owner.bound)return false;
      const control=pmmRodeoSnapshotContinuationControl(owner);
      return control?.owner===owner.owner&&control.stage==='bound';
    }catch(_){return false;}
  }
  // Automatic capture accepts only the report contract; a generic/legacy normalization never completes a job.
  function pmmRodeoSnapshotContractSnapshot(s,id){
    return !!s&&s.reportContract===pmmRodeoReportContract()&&s.site===id.site&&s.vrid===id.vrid&&s.basis==='aggregate'&&s.vridScoped===true&&JSON.stringify(s.parentLevels)==='["outer"]'&&JSON.stringify([...s.pools].sort())===JSON.stringify([...pmmRodeoSnapshotSpec().pools].sort());
  }
  function pmmRodeoSnapshotAccept(j,record,snapshot){
    if(!pmmRodeoSnapshotCurrent(j)||!pmmRodeoSnapshotContractSnapshot(snapshot,j)||snapshot.startedAt<j.created)return false;
    return record?.operation==='getAggregateReport'&&pmmRodeoContractRequest(record?.request?.data,{site:j.site,vrid:j.vrid});
  }
  function pmmRodeoSnapshotFinish(j,status){
    try{
      if(pmmRodeoSnapshotCurrent(j)){
        const key=pmmRodeoSnapshotSpec().prefix+j.token,current=GM_getValue(key,null);
        if(pmmRodeoSnapshotValidJob(current,j.token,pmmRodeoSnapshotInFrame())&&current.site===j.site&&current.vrid===j.vrid&&current.created===j.created)
          GM_setValue(key,{...current,status:status==='done'?'done':'failed'});
      }
    }catch(_){}
    try{pmmRodeoSnapshotHelper.stop?.();}catch(_){}
  }
  function pmmRodeoSnapshotHelper(j,observed=()=>false){
    let observer=null,timer=null,listener=null,stopped=false,requested=false;
    const stop=()=>{if(stopped)return;stopped=true;observer?.disconnect();clearTimeout(timer);try{if(listener!=null)GM_removeValueChangeListener(listener);}catch(_){};pmmRodeoSnapshotHelper.stop=null;};
    pmmRodeoSnapshotHelper.stop=stop;
    const scan=()=>{
      if(stopped||requested||observed())return;
      if(!pmmRodeoSnapshotCurrent(j)){stop();return;}
      // Verified source: AggregateViewReceive owns loadAggregateReport(), which uses
      // Rodeo's authenticated context internally. Inspect only this component, never its client.
      const pageDoc=typeof pmmRodeoFeederPage==='function'?pmmRodeoFeederPage().document:document;
      const root=pageDoc?.querySelector('[data-testid="AggregateViewReceive-TestId"]');if(!root)return;
      const key=Object.keys(root).find(k=>/^__reactFiber\$|^__reactInternalInstance\$/.test(k));if(!key)return;
      let f=root[key];const seen=new Set();
      for(let n=0;f&&n<40&&!seen.has(f);n++,f=f.return){
        seen.add(f);const c=f.stateNode;
        if(!c||typeof c.loadAggregateReport!=='function'||typeof c.createAggregateReportRequestInput!=='function'||!c.state||!c.props)continue;
        const p=c.state.aggregateParameters,q=c.props.location;
        if(c.props.warehouseId!==j.site||q?.pathname!=='/LGA9/post'||q.search!==new URL(pmmRodeoSnapshotUrl(j,j.token)).search||p?.shipmentType!=='TRANSSHIPMENT'||p.yAxis!=='OuterScannableIdDimension'||p.zAxis!=='VRIdDimension'||p.xAxis!=='ExpectedStowDateDimension'||p.bucketSize!=='15_MIN'||p.expectedStowDateRangeOption!=='PLUS_MINUS_ONE_DAY')return;
        // Initial report may already be in flight; wait for its completion rather than cancel it.
        if(c.state.isLoaded!==true)return;
        if(!pmmRodeoSnapshotCurrent(j)){stop();return;}
        requested=true;observer?.disconnect();
        try{c.loadAggregateReport();}catch(_){pmmRodeoSnapshotFinish(j,'failed');}
        return;
      }
    };
    try{listener=GM_addValueChangeListener(pmmRodeoSnapshotSpec().prefix+j.token,()=>{if(!pmmRodeoSnapshotCurrent(j))stop();});}catch(_){}
    timer=setTimeout(()=>{stop();pmmRodeoSnapshotFinish(j,'failed');},Math.max(0,j.expires-Date.now()));
    try{observer=new MutationObserver(scan);observer.observe(document.documentElement,{childList:true,subtree:true});scan();}catch(_){pmmRodeoSnapshotFinish(j,'failed');}
  }

  // Fixed, token-free attempt outcomes survive reloads and coalesce same-identity tabs.
  function pmmRodeoSnapshotAttempt(key){
    try{const r=GM_getValue('pmm-rodeo-attempt-v2:'+key,null);return r&&r.v===2&&Number.isSafeInteger(r.at)&&r.at>0&&r.at<=Date.now()&&['pending','success','stopped','startup','registration','route','resume','bind','api','return','no-snapshot'].includes(r.phase)?{v:2,at:r.at,phase:r.phase}:null;}catch(_){return null;}
  }
  function pmmRodeoSnapshotRemember(key,at,phase){
    try{if(!/^LGA9:[A-Z0-9]{6,20}$/.test(key)||!Number.isSafeInteger(at)||at<=0||at>Date.now()||!['pending','success','stopped','startup','registration','route','resume','bind','api','return','no-snapshot'].includes(phase))return false;const raw=GM_getValue('pmm-rodeo-attempt-v2:'+key,null),old=pmmRodeoSnapshotAttempt(key);if((raw!==null&&!old)||(old&&old.at>at))return false;GM_setValue('pmm-rodeo-attempt-v2:'+key,{v:2,at,phase});const saved=pmmRodeoSnapshotAttempt(key);return saved?.at===at&&saved.phase===phase;}catch(_){return false;}
  }
  function pmmRodeoSnapshotCooldown(key,at){
    const r=pmmRodeoSnapshotAttempt(key),labels={pending:'interrupted or still pending',success:'snapshot accepted',stopped:'stopped',startup:'startup not confirmed',registration:'registration failed',route:'return route rejected',resume:'resume failed',bind:'binding failed',api:'helper API unavailable',return:'native return incomplete','no-snapshot':'no accepted snapshot'};
    return 'Rodeo cooldown until '+new Date(at+pmmRodeoSnapshotSpec().cooldown).toLocaleTimeString()+' ('+(pmmRodeoSnapshotSpec().cooldown/1000)+'-second attempt spacing). Last attempt: '+(r&&r.at===at?labels[r.phase]:'outcome unavailable')+'. Next accepted AFT update may retry.';
  }
  function pmmRodeoSnapshotState(){
    if(!pmmRodeoSnapshotState.value){
      pmmRodeoSnapshotState.value={active:null,key:'',message:'',reason:'',reasonAt:0,attempts:new Map(),launch:null,hidden:false};
      try{window.addEventListener('pagehide',()=>{pmmRodeoSnapshotState.value.hidden=true;pmmRodeoSnapshotCancel('pagehide');});}catch(_){}
    }
    return pmmRodeoSnapshotState.value;
  }
  function pmmRodeoSnapshotStage(a){
    try{
      const j=GM_getValue(a.storage,null),r=GM_getValue('pmm-rodeo-cont-v1:'+a.token,null);
      if(!j||j.token!==a.token||!['pending','done','failed'].includes(j.status)||!r||r.v!==1||r.token!==j.token||r.site!==j.site||r.vrid!==j.vrid||r.created!==j.created||r.expires!==j.expires)return 'startup not confirmed';
      if(r.fail!==undefined)return ['registration','route','resume','bind','api'].includes(r.fail)?'helper failed: '+r.fail:'startup not confirmed';
      return ({registered:'helper registered',resuming:'native return recognized',bound:'helper bound'})[r.stage]||'startup not confirmed';
    }catch(_){return 'startup not confirmed';}
  }
  function pmmRodeoSnapshotStatus(identity){
    const id=pmmRodeoIdentity(identity),s=pmmRodeoSnapshotState();
    if(!id||s.key!==id.site+':'+id.vrid)return '';
    return s.message+(s.active?' [Live test: '+pmmRodeoSnapshotStage(s.active)+']':'');
  }
  // reason 'complete' is the internal teardown after an attempt outcome; anything else is a user/page cancel.
  function pmmRodeoSnapshotCancel(reason){
    const s=pmmRodeoSnapshotState(),a=s.active;s.active=null;
    const launch=s.launch;s.launch=null;
    if(launch){
      if(reason==='complete')launch.completed=true;else launch.cancelled=true;
      try{clearTimeout(launch.deadline);}catch(_){}try{clearTimeout(launch.wake);}catch(_){}launch.deadline=null;launch.wake=null;
      try{launch.controller?.abort();}catch(_){}
      try{launch.release?.();}catch(_){}
      if(reason!=='complete'){
        let why=reason==='pagehide'?'pagehide':'unknown';
        if(why==='unknown')try{why=typeof pmmRodeoLaunchInvalid==='function'?(pmmRodeoLaunchInvalid(launch)||'unknown'):'unknown';}catch(_){}
        s.reason=why;s.reasonAt=Date.now();
        try{if(typeof pmmRodeoTimelyEmit==='function')pmmRodeoTimelyEmit(launch.identity,'cancel',{basisAt:launch.basisAt,queuedAt:launch.queuedAt,startedAt:launch.startedAt,expiresAt:launch.expiresAt,endedAt:Date.now(),reason:why});}catch(_){}
      }
    }
    if(!a)return;
    // 4.1.1.6: observational registration evidence is summarized before this cleanup deletes the job records.
    try{a.regWatch?.stop();}catch(_){}
    // 4.1.1.10: pre-discovery evidence is read (and, for a cancellation, retained) before the deletes below.
    try{if(typeof pmmRodeoPrediagCancelled==='function')pmmRodeoPrediagCancelled(s.key,a,reason);}catch(_){}
    if(reason!=='complete'){try{if(typeof pmmRodeoRegDiagTake==='function'&&typeof pmmRodeoRegDiagRetain==='function')pmmRodeoRegDiagRetain(s.key,a,pmmRodeoRegDiagTake(s.key,a),'stopped',reason==='pagehide'?'pagehide':'cancelled',a.regWatch);}catch(_){}}
    clearTimeout(a.timer);try{if(a.listener!=null)GM_removeValueChangeListener(a.listener);if(a.controlListener!=null)GM_removeValueChangeListener(a.controlListener);}catch(_){}
    try{const j=GM_getValue(a.storage,null);if(pmmRodeoSnapshotValidJob(j,a.token,true))GM_setValue(a.storage,{...j,status:'cancelled'});}catch(_){}
    try{a.frame?.close();}catch(_){}
    try{GM_deleteValue('pmm-rodeo-frame-v1:'+a.token);}catch(_){}
    try{GM_deleteValue(a.storage);}catch(_){}
    try{GM_deleteValue('pmm-rodeo-cont-v1:'+a.token);}catch(_){}
    try{if(typeof pmmRodeoRegDiagKey==='function'){const k=pmmRodeoRegDiagKey(a.token);if(k)GM_deleteValue(k);}}catch(_){}
    try{if(typeof pmmRodeoPrediagDrop==='function')pmmRodeoPrediagDrop(a.token);}catch(_){}
    pmmRodeoSnapshotRemember(s.key,a.created,'stopped');
    s.message='Snapshot pull stopped. Next accepted AFT update may retry ('+(pmmRodeoSnapshotSpec().cooldown/1000)+'-second attempt spacing).';
  }
  function pmmRodeoSnapshotEnsure(identity){
    try{
      const id=pmmRodeoIdentity(identity),s=pmmRodeoSnapshotState(),S=pmmRodeoSnapshotSpec();
      if(s.hidden)return;
      if(!id||id.site!=='LGA9'){pmmRodeoSnapshotCancel();s.key='';s.message='';return;}
      // Only the serialized launcher may create an attempt; no direct panel/helper bypass.
      if(!s.launch||s.launch.cancelled||typeof s.launch.persistAttempt!=='function'||!Number.isSafeInteger(s.launch.basisAt))return;
      const launch=s.launch;
      const key=id.site+':'+id.vrid;
      if(s.active&&s.key===key)return;
      if(s.active){pmmRodeoSnapshotCancel();s.key=key;s.message='Rodeo snapshot deferred: the previous trailer pull was stopped. The next accepted AFT update may retry.';return;}
      if(s.key!==key)s.message='';s.key=key;
      const snapshot=pmmRodeoRead(identity,'aggregate');
      // Only a snapshot started since this request's accepted AFT basis can satisfy it.
      if(pmmRodeoSnapshotContractSnapshot(snapshot,id)&&Number.isSafeInteger(snapshot.startedAt)&&snapshot.startedAt>=launch.basisAt&&Date.now()-snapshot.at<S.fresh){s.message='';s.reason='fresh-snapshot';return;}
      const now=Date.now(),last=s.attempts.get(key);
      if(last!==undefined&&now-last<S.cooldown){if(!s.message)s.message=pmmRodeoSnapshotCooldown(key,last);s.reason='cooldown';return;}
      // Survives AFT reloads, so reload failures cannot create a tab storm.
      let persisted=0;try{persisted=Number(sessionStorage.getItem('pmm-rodeo-attempt-v1:'+key)||0);}catch(_){}
      let rawAttempt=null;try{rawAttempt=GM_getValue('pmm-rodeo-attempt-v2:'+key,null);}catch(_){s.message='Rodeo snapshot unavailable: saved retry guard could not be read. AFT tracking is unaffected.';s.reason='guard-unreadable';return;}
      const shared=pmmRodeoSnapshotAttempt(key);
      if(rawAttempt!==null&&!shared){s.message='Rodeo snapshot unavailable: saved retry guard is invalid or ahead of this browser clock. AFT tracking is unaffected.';s.reason='guard-invalid';return;}
      if(shared)persisted=Math.max(persisted<=now?persisted:0,shared.at);
      if(persisted>now-S.cooldown&&persisted<=now){s.message=pmmRodeoSnapshotCooldown(key,persisted);s.reason='cooldown';return;}
      // No background-tab fallback: without the frame transport the attempt is unavailable.
      if(typeof GM_addValueChangeListener!=='function'||typeof pmmRodeoFrameOpen!=='function'||typeof pmmRodeoFrameAvailable!=='function'||!pmmRodeoFrameAvailable()){s.message='Rodeo snapshot unavailable: the hidden Rodeo loader is not available on this page. AFT tracking is unaffected.';s.reason='permissions';return;}
      const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);const token=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
      const job={v:1,...id,token,created:now,expires:now+S.ttl,status:'pending',transport:'frame'},storage=S.prefix+token;
      if(!launch.persistAttempt(now)||!pmmRodeoSnapshotRemember(key,now,'pending')){s.message='Rodeo snapshot unavailable: retry guard could not be saved. AFT tracking is unaffected.';s.reason='guard-save-failed';return;}
      launch.attempted=true;
      s.attempts.set(key,now);while(s.attempts.size>40)s.attempts.delete(s.attempts.keys().next().value);
      try{sessionStorage.setItem('pmm-rodeo-attempt-v1:'+key,String(now));}catch(_){}
      const full=typeof pmmRodeoLaunchKey==='function'?pmmRodeoLaunchKey(identity):null,emit=(event,details)=>{try{if(typeof pmmRodeoTimelyEmit==='function')pmmRodeoTimelyEmit(identity,event,details);}catch(_){}};
      const a={storage,token,created:now,frame:null,frameFail:'',listener:null,controlListener:null,timer:null,basisAt:launch.basisAt,stage:''};s.active=a;s.message='Pulling Rodeo snapshot…';s.reason='';s.reasonAt=now;
      try{if(typeof pmmRodeoRegDiagMonitorWatch==='function')a.regWatch=pmmRodeoRegDiagMonitorWatch(now);}catch(_){}
      // Full view identity (site, VRID, shipment, page) decides whether this document still shows the trailer.
      const sameView=()=>{try{return !!full&&pmmRodeoLaunchSame(full,pmmRodeoLaunchKey(loadIdentity()));}catch(_){return false;}};
      const complete=(ok,missing=false,timeout=false)=>{
        if(s.active!==a)return;
        let reg=null;try{if(typeof pmmRodeoRegDiagTake==='function')reg=pmmRodeoRegDiagTake(key,a);}catch(_){}
        const match=sameView();
        const observed=pmmRodeoSnapshotStage(a);
        let registered=observed!=='startup not confirmed';
        if(observed.startsWith('helper failed: ')){
          try{registered=['registered','resuming','bound'].includes(GM_getValue('pmm-rodeo-cont-v1:'+a.token,null)?.stage);}catch(_){registered=false;}
        }
        pmmRodeoSnapshotCancel('complete');s.key=key;s.reason=ok?'':timeout?'timeout':'launch-failed';s.reasonAt=Date.now();
        s.message=ok?'':!registered?'Snapshot unavailable. Helper startup was not confirmed. Next eligible AFT load may retry.':'Snapshot unavailable. No accepted Rodeo snapshot returned; authentication was not verified.';
        const phase=ok?'success':missing?'no-snapshot':observed.startsWith('helper failed: ')?observed.slice(15):!registered?'startup':observed==='native return recognized'?'return':'no-snapshot';
        pmmRodeoSnapshotRemember(key,now,phase);
        try{if(reg&&typeof pmmRodeoRegDiagRetain==='function')pmmRodeoRegDiagRetain(key,a,reg,phase,ok||missing?'done':timeout?'timeout':'failed',a.regWatch);}catch(_){}
        try{if(typeof pmmRodeoPrediagRetain==='function')pmmRodeoPrediagRetain(key,a,phase,ok||missing?'done':timeout?'timeout':'failed');}catch(_){}
        emit('complete',{basisAt:a.basisAt,startedAt:now,endedAt:Date.now(),delayMs:Date.now()-now,phase});
        if(!ok&&a.frameFail)s.message='Snapshot unavailable. Hidden Rodeo loader did not complete ('+a.frameFail+'); embedded Rodeo sign-in is unverified. AFT tracking is unaffected.';
        if(!ok&&observed.startsWith('helper failed: '))s.message+=' [Live test: '+observed+']';
        if(match&&typeof pmmRodeoPanelReplace==='function'){try{pmmRodeoPanelReplace(true);}catch(_){}}
      };
      GM_setValue(storage,job);
      a.listener=GM_addValueChangeListener(storage,(_k,_old,value)=>{
        if(s.active!==a||!value||value.token!==token||value.site!==id.site||value.vrid!==id.vrid||value.created!==now)return;
        if(value.status==='done'){
          // A done status counts only while this document still owns the bound frame for this job.
          if(a.frame?.owned?.()!==true){a.frameFail=a.frameFail||'ownership';complete(false);return;}
          const snap=pmmRodeoRead(identity,'aggregate');complete(pmmRodeoSnapshotContractSnapshot(snap,id)&&Number.isSafeInteger(snap.startedAt)&&snap.startedAt>=now,true);}
        else if(value.status==='failed')complete(false);
      });
      a.controlListener=GM_addValueChangeListener('pmm-rodeo-cont-v1:'+token,()=>{
        if(s.active!==a)return;
        const observed=pmmRodeoSnapshotStage(a),stage=typeof pmmRodeoTimelyStage==='function'?pmmRodeoTimelyStage(observed):'';
        if(stage&&stage!==a.stage){a.stage=stage;emit('stage',{basisAt:a.basisAt,startedAt:now,delayMs:Date.now()-now,stage});}
        if(observed.startsWith('helper failed: ')){complete(false);return;}
        try{if(sameView()&&typeof pmmRodeoPanelReplace==='function')pmmRodeoPanelReplace(true);}catch(_){}
      });
      a.timer=setTimeout(()=>complete(false,false,true),S.ttl);
      emit('launch',{basisAt:a.basisAt,queuedAt:launch.queuedAt,startedAt:now,delayMs:now-a.basisAt});
      // 4.1.1.10: the attempt's own pre-discovery seed exists before the helper tab can run.
      try{if(typeof pmmRodeoPrediagSeed==='function')pmmRodeoPrediagSeed(token,now);}catch(_){}
      a.frame=pmmRodeoFrameOpen(job,pmmRodeoSnapshotUrl(id,token),code=>{if(s.active!==a)return;a.frameFail=String(code||'unavailable');complete(false);});
      if(!a.frame||typeof a.frame.close!=='function'){a.frame=null;a.frameFail='unavailable';complete(false);}
      // Delete only expired records in this feature namespace (incl. 4.1.1.6 evidence), never unrelated monitor state.
      try{for(const k of GM_listValues()){if(!/^pmm-rodeo-(?:job|cont|regdiag|frame)-v1:[a-f0-9]{32}$/.test(k)||k===storage||k==='pmm-rodeo-cont-v1:'+token||k==='pmm-rodeo-regdiag-v1:'+token||k==='pmm-rodeo-frame-v1:'+token)continue;const j=GM_getValue(k,null);if(j&&Number.isSafeInteger(j.expires)&&j.expires<now)GM_deleteValue(k);}}catch(_){}
      try{if(typeof pmmRodeoPrediagSweep==='function')pmmRodeoPrediagSweep(token);}catch(_){}
    }catch(_){pmmRodeoSnapshotCancel();pmmRodeoSnapshotState().message='Rodeo snapshot unavailable. Existing monitor tracking is unaffected.';}
  }

  // 4.1.1.5: Rodeo is requested only on a basis of this document's accepted AFT data. An accepted
  // AFT load (first in the document) or monitor-confirmed AFT reload grants ONE automatic opportunity,
  // due 10 s after acceptance and unused for at most 120 s from acceptance, regardless of disclosure state.
  // Existing internal manual requests still require the valid basis and 10 s spacing. Never an AFT
  // refresh click, heartbeat, render, parser capturedAt or a Hunter-only/standby/rejected scan.
  // Function declarations only: the Rodeo helper's feed-only early exit runs no initializer.
  function pmmRodeoRefreshSpec(){return {autoTtl:120000,pendingTtl:120000,autoDelay:10000};}
  function pmmRodeoRefreshState(){
    if(!pmmRodeoRefreshState.value){
      const st={seq:0,basis:null,auto:null,pending:null,seenAft:false,hidden:false,timer:null,blockReason:'',manualRequest:false};
      pmmRodeoRefreshState.value=st;
      // Permanent: a BFCache-restored document stays inactive and is reloaded by the monitor.
      try{window.addEventListener('pagehide',()=>{st.hidden=true;st.basis=null;st.auto=null;st.pending=null;try{clearTimeout(st.timer);}catch(_){}st.timer=null;});}catch(_){}
    }
    return pmmRodeoRefreshState.value;
  }
  function pmmRodeoRefreshKey(ident){
    const id=pmmRodeoIdentity(ident),shipment=ident?.shipmentId,path=ident?.shipRef;
    return id&&typeof shipment==='string'&&shipment&&typeof path==='string'&&path?{site:id.site,vrid:id.vrid,shipment,path}:null;
  }
  function pmmRodeoRefreshSame(a,b){return !!a&&!!b&&a.site===b.site&&a.vrid===b.vrid&&a.shipment===b.shipment&&a.path===b.path;}
  function pmmRodeoRefreshCurrent(){try{return pmmRodeoRefreshKey(loadIdentity());}catch(_){return null;}}
  function pmmRodeoRefreshEmit(key,event,details){
    try{if(typeof pmmRodeoTimelyEmit==='function'&&key)pmmRodeoTimelyEmit({destinationWarehouse:key.site,loadId:key.vrid,shipmentId:key.shipment},event,details);}catch(_){}
  }
  // Missing or throwing readiness probes are treated as busy. Disclosure state is diagnostic only.
  function pmmRodeoRefreshQueueFree(){try{return typeof pmmRodeoRefreshBusy==='function'&&pmmRodeoRefreshBusy()===false;}catch(_){return false;}}
  function pmmRodeoRefreshExpanded(){
    try{return pmmRodeoPrefs().open===true&&document.getElementById('pax-monitor-v311')?.querySelector('#pmm-rodeo-disclosure')?.open===true;}catch(_){return false;}
  }
  function pmmRodeoRefreshAutoOpen(st){
    const a=st.auto,now=Date.now();
    return !!a&&!a.used&&now>=a.at&&now<=a.expiresAt&&!!st.basis?.valid&&st.basis.at===a.basisAt&&pmmRodeoRefreshSame(a,st.basis);
  }
  function pmmRodeoRefreshNoteAccepted(h,flags){
    const st=pmmRodeoRefreshState();
    if(st.hidden||h?.source!=='aft')return;
    const key=pmmRodeoRefreshKey(h);
    if(!key||!pmmRodeoRefreshSame(key,pmmRodeoRefreshCurrent()))return;
    // A scan that overlapped a starting refresh belongs to a document about to be replaced.
    if(flags?.refreshing&&!flags.confirming)return;
    const now=Date.now();
    if(flags?.confirming){st.seenAft=true;st.pending={...key,at:now};return;}
    if(!st.seenAft){st.seenAft=true;pmmRodeoRefreshPublish(key,'load');return;}
    // Later same-document acceptance restores or moves the basis but never grants automatic use.
    if(pmmRodeoRefreshSame(st.basis,key))st.basis.valid=true;
    else{st.basis={...key,at:now,kind:'scan',valid:true};pmmRodeoRefreshEmit(key,'aft-accepted',{basisAt:now,phase:'scan'});}
  }
  function pmmRodeoRefreshNoteConfirmed(){
    const st=pmmRodeoRefreshState(),p=st.pending;st.pending=null;
    if(st.hidden||!p||Date.now()-p.at>pmmRodeoRefreshSpec().pendingTtl||Date.now()<p.at)return;
    if(!pmmRodeoRefreshSame(p,pmmRodeoRefreshCurrent()))return;
    pmmRodeoRefreshPublish(p,'refresh');
  }
  function pmmRodeoRefreshPublish(key,kind){
    const st=pmmRodeoRefreshState(),R=pmmRodeoRefreshSpec(),at=Date.now(),k={site:key.site,vrid:key.vrid,shipment:key.shipment,path:key.path};
    st.basis={...k,at,kind,valid:true};st.auto={...k,at:at+R.autoDelay,basisAt:at,expiresAt:at+R.autoTtl,seq:++st.seq,used:false};st.blockReason='';
    pmmRodeoRefreshEmit(k,'aft-accepted',{basisAt:at,phase:kind});
    pmmRodeoRefreshEmit(k,'scheduled',{basisAt:at,targetAt:at+R.autoDelay,expiresAt:at+R.autoTtl});
    // One deadline-driven wake at the target; the regular status tick only covers a late-ready queue.
    // A late or superseded timer only calls the pump, which can never create or reuse an opportunity.
    try{clearTimeout(st.timer);}catch(_){}
    try{st.timer=setTimeout(()=>{st.timer=null;pmmRodeoRefreshPump();},R.autoDelay);}catch(_){}
  }
  // Rejected, standby or stale scans revoke the basis, any unused automatic opportunity and any
  // unconfirmed refresh, including a request already granted but not yet launched.
  function pmmRodeoRefreshClear(){
    const st=pmmRodeoRefreshState();st.pending=null;
    if(st.basis)st.basis.valid=false;
    if(st.auto&&!st.auto.used)st.auto=null;
    try{clearTimeout(st.timer);}catch(_){}st.timer=null;
    try{if(typeof pmmRodeoSnapshotLaunchStop==='function')pmmRodeoSnapshotLaunchStop('rejected');}catch(_){}
  }
  function pmmRodeoRefreshBlocker(){
    let recent=false;try{recent=typeof pmmRodeoRefreshScanRecent==='function'&&pmmRodeoRefreshScanRecent()===true;}catch(_){}
    return recent?'aft-busy':'scan-stale';
  }
  // Acts only on an unused, unexpired automatic opportunity; repeated calls cannot create or retry one.
  function pmmRodeoRefreshPump(){
    const st=pmmRodeoRefreshState();
    if(st.hidden)return false;
    try{if(typeof pmmRodeoSnapshotLaunchCheck==='function')pmmRodeoSnapshotLaunchCheck();}catch(_){}
    const a=st.auto,now=Date.now();
    if(a&&!a.used&&now>a.expiresAt){
      if(st.blockReason!=='expired'){pmmRodeoRefreshEmit(a,'blocked',{basisAt:a.basisAt,targetAt:a.at,expiresAt:a.expiresAt,reason:'expired'});st.blockReason='expired';}
      return false;
    }
    if(!pmmRodeoRefreshAutoOpen(st))return false;
    let ok=false;
    try{ok=typeof pmmRodeoEnsure==='function'&&pmmRodeoEnsure(loadIdentity())===true;}catch(_){ok=false;}
    if(!ok){
      const reason=pmmRodeoRefreshBlocker();
      if(st.auto===a&&!a.used&&st.blockReason!==reason){st.blockReason=reason;pmmRodeoRefreshEmit(a,'blocked',{basisAt:a.basisAt,targetAt:a.at,expiresAt:a.expiresAt,reason});}
    }else st.blockReason='';
    return ok;
  }
  // The launcher's copy of the current valid basis for this exact identity; null when none.
  function pmmRodeoRefreshBasis(identity){
    try{
      const st=pmmRodeoRefreshState(),b=st.basis,key=pmmRodeoRefreshKey(identity);
      if(st.hidden||!b||b.valid!==true||!pmmRodeoRefreshSame(b,key)||!pmmRodeoRefreshSame(b,pmmRodeoRefreshCurrent()))return null;
      return {at:b.at,kind:b.kind};
    }catch(_){return null;}
  }
  function pmmRodeoRefreshRequestManual(){try{return pmmRodeoRefreshState().manualRequest===true;}catch(_){return false;}}
  function pmmRodeoRefreshReady(identity){
    try{
      const st=pmmRodeoRefreshState(),b=st.basis;
      if(st.hidden||!b)return false;
      if(!pmmRodeoRefreshSame(b,pmmRodeoRefreshCurrent())){st.basis=null;st.auto=null;try{clearTimeout(st.timer);}catch(_){}st.timer=null;return false;}
      return b.valid===true&&pmmRodeoRefreshSame(b,pmmRodeoRefreshKey(identity))&&pmmRodeoRefreshQueueFree();
    }catch(_){return false;}
  }
  // Internal manual callers remain gated; disclosure toggles never call this. Automatic callers consume one opportunity.
  function pmmRodeoRefreshRequest(identity,launch,manual=false){
    try{
      const st=pmmRodeoRefreshState();
      if(typeof launch!=='function'||!pmmRodeoRefreshReady(identity))return false;
      if(manual!==true&&!pmmRodeoRefreshAutoOpen(st))return false;
      if(st.auto&&pmmRodeoRefreshSame(st.auto,st.basis))st.auto.used=true;
      st.manualRequest=manual===true;
      try{launch();}catch(_){}finally{st.manualRequest=false;}
      return true;
    }catch(_){return false;}
  }
  function pmmRodeoRefreshAftText(identity){
    try{
      const st=pmmRodeoRefreshState(),b=st.basis;
      if(st.hidden||!b||!pmmRodeoRefreshSame(b,pmmRodeoRefreshKey(identity)))return 'AFT accepted data: none yet on this page. Rodeo updates only after AFT data loads or refreshes and is accepted.';
      const label=({load:'page load',refresh:'confirmed refresh',scan:'accepted scan'})[b.kind]||'accepted scan',a=st.auto,now=Date.now();
      const mine=!!a&&pmmRodeoRefreshSame(a,b)&&a.basisAt===b.at;
      const auto=mine&&!a.used&&now<a.at?'Automatic Rodeo update scheduled for '+new Date(a.at).toLocaleTimeString()+' ('+(pmmRodeoRefreshSpec().autoDelay/1000)+' seconds after AFT acceptance) if the AFT refresh queue is free, expanded or collapsed.'
        :pmmRodeoRefreshAutoOpen(st)?'Automatic Rodeo update waits for the AFT refresh queue to be free, expanded or collapsed.'
        :mine&&a.used?'Automatic Rodeo update opportunity checked; see Rodeo status.'
        :mine&&now>a.expiresAt?'Automatic Rodeo update expired unused 120 seconds after AFT acceptance. The next accepted AFT load or confirmed refresh may retry; '+(pmmRodeoSnapshotSpec().cooldown/1000)+'-second attempt spacing still applies.'
        :'The next accepted AFT load or confirmed refresh may retry; '+(pmmRodeoSnapshotSpec().cooldown/1000)+'-second attempt spacing still applies.';
      let recent=false;try{recent=typeof pmmRodeoRefreshScanRecent==='function'&&pmmRodeoRefreshScanRecent()===true;}catch(_){}
      return `AFT data accepted ${new Date(b.at).toLocaleTimeString()} (${label}). ${!b.valid?'Latest AFT scan was not accepted; Rodeo waits for accepted AFT data.':!recent?'No recent successful AFT scan; Rodeo waits for AFT tracking to resume.':auto}`;
    }catch(_){return '';}
  }

  // 4.1.1.5: one same-origin Rodeo helper. A request waits in a bounded, abortable Web Lock queue
  // (never holding AFT's refresh/storage lock) and rechecks the full identity and AFT readiness before
  // any effect. Mixed AFT origins are unsupported by the existing monitor storage-origin guard.
  function pmmRodeoTimelySpec(){
    return {events:['aft-accepted','scheduled','queued','launch','stage','complete','cancel','blocked','reuse'],
      fields:['basisAt','targetAt','queuedAt','startedAt','endedAt','expiresAt','delayMs'],
      phases:['pending','success','stopped','startup','registration','route','resume','bind','api','return','no-snapshot','load','refresh','scan'],
      stages:['startup-unconfirmed','registered','resuming','bound','failed-registration','failed-route','failed-resume','failed-bind','failed-api'],
      reasons:['hidden','no-basis','basis-invalid','identity-changed','collapsed','aft-busy','scan-stale','lock-busy','lock-unsupported','storage-origin','cooldown','guard-invalid','guard-future','guard-unreadable','guard-save-failed','permissions','expired','superseded','fresh-snapshot','pagehide','rejected','launch-failed','timeout','helper-active','user-reopen','already-attempted','not-ready','unknown']};
  }
  // Best-effort telemetry: allowlisted numbers and enums only, never jobs, tokens, URLs, errors or storage.
  function pmmRodeoTimelyEmit(identity,event,details){
    try{
      if(typeof pmmRodeoDiagnosticEvent!=='function')return;
      const T=pmmRodeoTimelySpec(),id=pmmRodeoIdentity(identity);if(!id||!T.events.includes(event))return;
      const out={};
      for(const k of T.fields)if(Number.isSafeInteger(details?.[k]))out[k]=details[k];
      if(T.phases.includes(details?.phase))out.phase=details.phase;
      if(T.stages.includes(details?.stage))out.stage=details.stage;
      if(T.reasons.includes(details?.reason))out.reason=details.reason;
      const ident={destinationWarehouse:id.site,loadId:id.vrid};
      if(typeof identity?.shipmentId==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(identity.shipmentId))ident.shipmentId=identity.shipmentId;
      pmmRodeoDiagnosticEvent(ident,event,out);
    }catch(_){}
  }
  function pmmRodeoTimelyStage(text){
    if(typeof text!=='string')return 'startup-unconfirmed';
    if(text.startsWith('helper failed: '))return 'failed-'+text.slice(15);
    return ({'helper registered':'registered','native return recognized':'resuming','helper bound':'bound'})[text]||'startup-unconfirmed';
  }
  function pmmRodeoLaunchKey(identity){
    const id=pmmRodeoIdentity(identity),shipment=identity?.shipmentId,path=identity?.shipRef;
    return id&&typeof shipment==='string'&&shipment&&typeof path==='string'&&path?{site:id.site,vrid:id.vrid,shipment,path}:null;
  }
  function pmmRodeoLaunchSame(a,b){return !!a&&!!b&&a.site===b.site&&a.vrid===b.vrid&&a.shipment===b.shipment&&a.path===b.path;}
  function pmmRodeoLaunchTime(at){try{return new Date(at).toLocaleTimeString();}catch(_){return '';}}
  function pmmRodeoLaunchRedraw(){try{pmmRodeoPanelReplace(true);}catch(_){}}
  // Everything but the transient AFT queue state; '' when the request may still serve this view.
  function pmmRodeoLaunchInvalid(L){
    try{
      if(pmmRodeoSnapshotState().hidden)return 'pagehide';
      if(!pmmRodeoLaunchSame(L.full,pmmRodeoLaunchKey(loadIdentity())))return 'identity-changed';
      if(typeof pmmRodeoRefreshBasis!=='function'||!pmmRodeoRefreshBasis(L.identity))return 'basis-invalid';
      if(GM_getValue('pax-monitor-v3515-storage-origin',null)!==location.origin)return 'storage-origin';
      return '';
    }catch(_){return 'unknown';}
  }
  function pmmRodeoLaunchReady(L){
    try{return !pmmRodeoLaunchInvalid(L)&&typeof pmmRodeoRefreshReady==='function'&&pmmRodeoRefreshReady(L.identity)===true;}catch(_){return false;}
  }
  function pmmRodeoLaunchEnd(L){
    const s=pmmRodeoSnapshotState();
    try{clearTimeout(L.deadline);}catch(_){}try{clearTimeout(L.wake);}catch(_){}
    L.deadline=null;L.wake=null;L.state='done';
    try{L.controller?.abort();}catch(_){}
    if(s.launch===L)s.launch=null;
  }
  function pmmRodeoLaunchNote(L,reason,message){
    const s=pmmRodeoSnapshotState();s.key=L.key;s.message=message;s.reason=reason;s.reasonAt=Date.now();
  }
  // Ends a request that never started a helper. event is 'cancel' or 'blocked'.
  function pmmRodeoLaunchAbandon(L,event,reason,message){
    const s=pmmRodeoSnapshotState();if(s.launch!==L||L.state==='active')return;
    L.cancelled=true;pmmRodeoLaunchEnd(L);pmmRodeoLaunchNote(L,reason,message);
    pmmRodeoTimelyEmit(L.identity,event,{basisAt:L.basisAt,queuedAt:L.queuedAt,targetAt:L.targetAt,expiresAt:L.expiresAt,endedAt:Date.now(),reason});
    pmmRodeoLaunchRedraw();
  }
  function pmmRodeoLaunchDeferred(L,reason){
    if(reason==='storage-origin')pmmRodeoLaunchAbandon(L,'blocked',reason,'Rodeo snapshot unavailable: the selected AFT storage origin changed. AFT tracking is unaffected.');
    else pmmRodeoLaunchAbandon(L,'cancel',reason,'Rodeo deferred: AFT data or refresh state changed before launch. The next eligible accepted AFT update may retry.');
  }
  function pmmRodeoLaunchExpire(L){
    const s=pmmRodeoSnapshotState();if(s.launch!==L||L.state==='active')return;
    const why=L.state==='queued'?'the Rodeo helper stayed busy in another AFT tab':L.state==='cooldown'?'attempt spacing did not clear':'AFT refresh queue or recent AFT scan was not ready';
    pmmRodeoLaunchAbandon(L,'blocked','expired','Rodeo update expired: '+why+' within 120 seconds of AFT acceptance. The next eligible accepted AFT update may retry.');
  }
  function pmmRodeoLaunchArm(L){
    try{clearTimeout(L.deadline);}catch(_){}
    L.deadline=setTimeout(()=>{L.deadline=null;pmmRodeoLaunchExpire(L);},Math.max(0,L.expiresAt-Date.now()));
  }
  // 03f rejection: stops a request that has not started a helper; an active helper keeps its own deadline.
  function pmmRodeoSnapshotLaunchStop(reason){
    const L=pmmRodeoSnapshotState.value?.launch;if(!L||L.state==='active'||L.cancelled)return false;
    pmmRodeoLaunchAbandon(L,'cancel',reason==='rejected'?'rejected':'unknown','Rodeo update cancelled: the latest AFT scan was not accepted. Rodeo waits for accepted AFT data.');
    return true;
  }
  // Status-tick recheck: can only cancel, expire or resume a request already waiting for AFT readiness.
  function pmmRodeoSnapshotLaunchCheck(){
    const L=pmmRodeoSnapshotState.value?.launch;if(!L||L.state==='active'||L.cancelled)return;
    if(Date.now()>L.expiresAt){pmmRodeoLaunchExpire(L);return;}
    const why=pmmRodeoLaunchInvalid(L);if(why){pmmRodeoLaunchDeferred(L,why);return;}
    if(L.state==='waiting'&&pmmRodeoLaunchReady(L))pmmRodeoLaunchRequest(L);
  }
  function pmmRodeoLaunchRequest(L){
    const s=pmmRodeoSnapshotState();if(s.launch!==L||L.cancelled||s.hidden)return;
    if(Date.now()>L.expiresAt){pmmRodeoLaunchExpire(L);return;}
    let controller;try{controller=new AbortController();}catch(_){pmmRodeoLaunchAbandon(L,'blocked','lock-unsupported','Rodeo snapshot unavailable: browser lock support is required. AFT tracking is unaffected.');return;}
    L.controller=controller;L.state='queued';const grant=L.grant=(L.grant||0)+1;
    pmmRodeoLaunchNote(L,'','Rodeo update queued: waiting for the single Rodeo helper (another AFT tab may be using it) until '+pmmRodeoLaunchTime(L.expiresAt)+'. AFT tracking is unaffected.');
    const failed=()=>{
      if(L.cancelled||L.completed||L.grant!==grant||(s.launch!==L&&L.state!=='active'))return;
      if(L.state==='active'&&s.launch===L)pmmRodeoSnapshotCancel('complete');
      L.cancelled=true;pmmRodeoLaunchEnd(L);
      pmmRodeoLaunchNote(L,'launch-failed','Rodeo snapshot unavailable: helper launch could not be coordinated. AFT tracking is unaffected.');
      pmmRodeoTimelyEmit(L.identity,'blocked',{basisAt:L.basisAt,queuedAt:L.queuedAt,expiresAt:L.expiresAt,endedAt:Date.now(),reason:'launch-failed'});
      pmmRodeoLaunchRedraw();
    };
    try{
      Promise.resolve(navigator.locks.request('pmm-rodeo-launch-v1',{mode:'exclusive',signal:controller.signal},lock=>pmmRodeoLaunchGranted(L,lock,grant)))
        .catch(failed).finally(()=>{if(s.launch===L&&L.grant===grant&&L.state==='active')pmmRodeoLaunchEnd(L);});
    }catch(_){failed();}
  }
  async function pmmRodeoLaunchGranted(L,lock,grant){
    const s=pmmRodeoSnapshotState(),S=pmmRodeoSnapshotSpec(),key=L.key;
    if(s.launch!==L||L.cancelled||L.grant!==grant||!lock)return;
    const why=pmmRodeoLaunchInvalid(L);if(why){pmmRodeoLaunchDeferred(L,why);return;}
    // The deadline task may run after a lock grant; expiry is rechecked before any effect.
    if(Date.now()>L.expiresAt){pmmRodeoLaunchExpire(L);return;}
    if(!pmmRodeoLaunchReady(L)){
      L.state='waiting';
      let recent=false;try{recent=typeof pmmRodeoRefreshScanRecent==='function'&&pmmRodeoRefreshScanRecent()===true;}catch(_){}
      const reason=recent?'aft-busy':'scan-stale';
      pmmRodeoLaunchNote(L,reason,'Rodeo update waiting for the AFT refresh queue and a recent successful AFT scan until '+pmmRodeoLaunchTime(L.expiresAt)+'. AFT tracking is unaffected.');
      pmmRodeoTimelyEmit(L.identity,'blocked',{basisAt:L.basisAt,queuedAt:L.queuedAt,expiresAt:L.expiresAt,reason});
      pmmRodeoLaunchRedraw();return;
    }
    const now=Date.now();
    let snap=null;try{snap=pmmRodeoRead(L.identity,'aggregate');}catch(_){snap=null;}
    if(pmmRodeoSnapshotContractSnapshot(snap,L.full)&&Number.isSafeInteger(snap.startedAt)&&snap.startedAt>=L.basisAt&&snap.at<=now&&now-snap.at<S.fresh){
      L.cancelled=true;pmmRodeoLaunchEnd(L);pmmRodeoLaunchNote(L,'fresh-snapshot','');
      pmmRodeoTimelyEmit(L.identity,'reuse',{basisAt:L.basisAt,startedAt:snap.startedAt,endedAt:snap.at});
      pmmRodeoLaunchRedraw();return;
    }
    // localStorage is synchronous and shared on this selected AFT origin. GM outcome
    // readback alone cannot fence a second tab whose GM cache has not caught up.
    const guardKey='pmm-rodeo-launch-attempt-v1:'+key;
    let raw;try{raw=localStorage.getItem(guardKey);}catch(_){pmmRodeoLaunchAbandon(L,'blocked','guard-unreadable','Rodeo snapshot unavailable: saved retry guard could not be read. AFT tracking is unaffected.');return;}
    const previous=raw===null?0:Number(raw);
    if(raw!==null&&(!/^[0-9]{13}$/.test(raw)||!Number.isSafeInteger(previous))){pmmRodeoLaunchAbandon(L,'blocked','guard-invalid','Rodeo snapshot unavailable: saved retry guard is invalid. AFT tracking is unaffected.');return;}
    if(previous>now){pmmRodeoLaunchAbandon(L,'blocked','guard-future','Rodeo snapshot deferred: saved attempt is ahead of this browser clock; check the computer clock. AFT tracking is unaffected.');return;}
    let rawShared;try{rawShared=GM_getValue('pmm-rodeo-attempt-v2:'+key,null);}catch(_){pmmRodeoLaunchAbandon(L,'blocked','guard-unreadable','Rodeo snapshot unavailable: saved retry guard could not be read. AFT tracking is unaffected.');return;}
    const shared=pmmRodeoSnapshotAttempt(key);
    if(rawShared!==null&&!shared){pmmRodeoLaunchAbandon(L,'blocked','guard-invalid','Rodeo snapshot unavailable: saved retry guard is invalid or ahead of this browser clock. AFT tracking is unaffected.');return;}
    const latest=Math.max(previous,shared?.at||0);
    // An attempt started at or after this request's basis already served it, whatever its outcome.
    if(latest>0&&latest>=L.coalesceAt){
      const label=pmmRodeoSnapshotCooldown(key,latest).replace(/^.*Last attempt: ([^.]*)\..*$/,'$1');
      pmmRodeoLaunchAbandon(L,'blocked','already-attempted','Rodeo already attempted at '+pmmRodeoLaunchTime(latest)+' for this AFT update. Last attempt: '+label+'. The next eligible accepted AFT update may retry.');return;
    }
    if(latest>now-S.cooldown){
      const due=latest+S.cooldown;
      // The single wake belongs to one saved attempt; a timer firing early re-arms to the same due time (at most twice).
      const early=L.waited&&L.waitedFor===latest&&(L.early||0)<2;
      if((!L.waited||early)&&due<=L.expiresAt){
        if(early)L.early=(L.early||0)+1;
        L.waited=true;L.waitedFor=latest;L.state='cooldown';L.targetAt=due;
        L.wake=setTimeout(()=>{L.wake=null;if(s.launch===L&&!L.cancelled&&L.state==='cooldown')pmmRodeoLaunchRequest(L);},due-now);
        pmmRodeoLaunchNote(L,'cooldown','Rodeo cooldown until '+pmmRodeoLaunchTime(due)+' ('+(S.cooldown/1000)+'-second attempt spacing). This AFT update waits once.');
        if(!early)pmmRodeoTimelyEmit(L.identity,'scheduled',{basisAt:L.basisAt,targetAt:due,expiresAt:L.expiresAt,reason:'cooldown'});
        pmmRodeoLaunchRedraw();return;
      }
      L.state='cooldown';pmmRodeoLaunchAbandon(L,'blocked','cooldown',pmmRodeoSnapshotCooldown(key,latest));return;
    }
    L.persistAttempt=at=>{try{const current=localStorage.getItem(guardKey);if(!Number.isSafeInteger(at)||at<=0||at>Date.now()||(current!==null&&(!/^[0-9]{13}$/.test(current)||!Number.isSafeInteger(Number(current))||Number(current)>at)))return false;localStorage.setItem(guardKey,String(at));return localStorage.getItem(guardKey)===String(at);}catch(_){return false;}};
    let release;const held=new Promise(resolve=>release=resolve);L.release=release;
    L.state='active';L.startedAt=now;try{clearTimeout(L.deadline);}catch(_){}L.deadline=null;
    pmmRodeoSnapshotEnsure(L.identity);
    pmmRodeoLaunchRedraw();
    if(s.active&&!L.cancelled&&s.launch===L)await held;
    else if(s.launch===L&&!L.attempted){
      L.cancelled=true;pmmRodeoLaunchEnd(L);
      pmmRodeoTimelyEmit(L.identity,'blocked',{basisAt:L.basisAt,queuedAt:L.queuedAt,expiresAt:L.expiresAt,endedAt:Date.now(),reason:s.reason||'unknown'});
      return;
    }
    const follow=L.follow;L.follow=null;
    pmmRodeoLaunchEnd(L);
    // A newer accepted basis that arrived while this helper ran is served by one fresh schedule.
    if(follow&&L.completed&&!s.hidden)try{setTimeout(()=>{try{const ident=loadIdentity();if(pmmRodeoLaunchSame(L.full,pmmRodeoLaunchKey(ident)))pmmRodeoSnapshotSchedule(ident);}catch(_){}},0);}catch(_){}
  }
  function pmmRodeoSnapshotSchedule(identity){
    const s=pmmRodeoSnapshotState(),S=pmmRodeoSnapshotSpec(),id=pmmRodeoIdentity(identity),full=pmmRodeoLaunchKey(identity);
    if(!id||id.site!=='LGA9'||!full)return;
    if(s.hidden){pmmRodeoTimelyEmit(identity,'blocked',{reason:'hidden'});return;}
    const key=id.site+':'+id.vrid;
    let basis=null;try{basis=typeof pmmRodeoRefreshBasis==='function'?pmmRodeoRefreshBasis(identity):null;}catch(_){basis=null;}
    if(!basis||!Number.isSafeInteger(basis.at)){pmmRodeoTimelyEmit(identity,'blocked',{reason:'no-basis'});return;}
    const now=Date.now();
    let manual=false;try{manual=typeof pmmRodeoRefreshRequestManual==='function'&&pmmRodeoRefreshRequestManual()===true;}catch(_){}
    const L0=s.launch;
    if(L0){
      // Coalesce: one request per document. A newer basis moves a pending request forward, or is
      // served once after an active helper that started before it.
      if(!pmmRodeoLaunchSame(L0.full,full)||L0.cancelled){pmmRodeoTimelyEmit(identity,'blocked',{basisAt:basis.at,reason:'helper-active'});return;}
      if(basis.at<=L0.basisAt){pmmRodeoTimelyEmit(identity,'queued',{basisAt:basis.at,queuedAt:L0.queuedAt,expiresAt:L0.expiresAt,reason:'helper-active'});return;}
      if(L0.state==='active'){
        // Served by the running attempt if it started at/after this basis; otherwise one follow-up after it ends.
        if(Number.isSafeInteger(L0.startedAt)&&L0.startedAt<basis.at){L0.follow={at:basis.at};pmmRodeoTimelyEmit(identity,'queued',{basisAt:basis.at,queuedAt:now,expiresAt:basis.at+S.queueTtl,reason:'helper-active'});}
        else pmmRodeoTimelyEmit(identity,'blocked',{basisAt:basis.at,startedAt:L0.startedAt,reason:'already-attempted'});
        return;
      }
      L0.basisAt=basis.at;if(!L0.manual)L0.coalesceAt=basis.at;
      L0.expiresAt=Math.max(L0.expiresAt,basis.at+S.queueTtl);pmmRodeoLaunchArm(L0);
      pmmRodeoTimelyEmit(L0.identity,'queued',{basisAt:L0.basisAt,queuedAt:L0.queuedAt,expiresAt:L0.expiresAt,reason:'superseded'});
      return;
    }
    if(s.active){pmmRodeoTimelyEmit(identity,'blocked',{basisAt:basis.at,reason:'helper-active'});return;}
    const L={identity:{...identity},full,key,basisAt:basis.at,coalesceAt:manual?now:basis.at,queuedAt:now,targetAt:null,expiresAt:(manual?now:basis.at)+S.queueTtl,startedAt:null,manual,state:'new',cancelled:false,release:null,persistAttempt:null,controller:null,deadline:null,wake:null,waited:false,follow:null,attempted:false,completed:false,grant:0};
    const invalid=pmmRodeoLaunchInvalid(L);
    if(invalid){pmmRodeoTimelyEmit(identity,'blocked',{basisAt:basis.at,reason:invalid});return;}
    if(now>L.expiresAt){pmmRodeoLaunchNote(L,'expired','Rodeo update expired: AFT refresh queue or recent AFT scan was not ready within 120 seconds of AFT acceptance. The next eligible accepted AFT update may retry.');pmmRodeoTimelyEmit(L.identity,'blocked',{basisAt:L.basisAt,expiresAt:L.expiresAt,reason:'expired'});return;}
    if(typeof navigator==='undefined'||typeof navigator.locks?.request!=='function'||typeof AbortController!=='function'){
      pmmRodeoLaunchNote(L,'lock-unsupported','Rodeo snapshot unavailable: browser lock support is required. AFT tracking is unaffected.');
      pmmRodeoTimelyEmit(L.identity,'blocked',{basisAt:L.basisAt,reason:'lock-unsupported'});return;
    }
    s.launch=L;
    pmmRodeoTimelyEmit(L.identity,'queued',{basisAt:L.basisAt,queuedAt:now,expiresAt:L.expiresAt,...(manual?{reason:'user-reopen'}:{})});
    pmmRodeoLaunchArm(L);
    // Valid but AFT-busy (e.g. a newer basis served after an active helper): wait for the status tick.
    if(pmmRodeoLaunchReady(L))pmmRodeoLaunchRequest(L);
    else{L.state='waiting';pmmRodeoLaunchNote(L,'aft-busy','Rodeo update waiting for the AFT refresh queue and a recent successful AFT scan until '+pmmRodeoLaunchTime(L.expiresAt)+'. AFT tracking is unaffected.');}
  }

  function pmmRodeoPrefs(patch){
    let saved={};try{saved=JSON.parse(sessionStorage.getItem('pmm-rodeo-ui-v1')||'{}')||{};}catch(_){}
    const p={open:saved.open===true,floor:[1,2,3].includes(Number(saved.floor))?Number(saved.floor):0,zone:pmmRodeoZoneDigit(saved.zone),quantity:saved.quantity==='low'?'low':'high',station:pmmRodeoStation(saved.station)?.station||'',scroll:Number.isFinite(saved.scroll)?Math.max(0,saved.scroll):0};
    if(patch){Object.assign(p,patch);try{sessionStorage.setItem('pmm-rodeo-ui-v1',JSON.stringify(p));}catch(_){}}
    return p;
  }
  function pmmRodeoEsc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function pmmRodeoAge(s){
    const seconds=Math.max(0,Math.floor((Date.now()-s.at)/1000));const age=seconds<60?`${seconds}s`:seconds<3600?`${Math.floor(seconds/60)}m`:`${Math.floor(seconds/3600)}h ${Math.floor(seconds%3600/60)}m`;
    return `${seconds>300?'Stale: ':''}captured ${age} ago (${new Date(s.at).toLocaleTimeString()}), not a live guarantee.`;
  }
  function pmmRodeoStatusText(identity){
    if(typeof pmmRodeoSnapshotStatus!=='function')return '';
    try{const s=pmmRodeoSnapshotStatus(identity);return typeof s==='string'?s.slice(0,300):'';}catch(_){return '';}
  }
  // Same VRID with a different shipment or page is a different trailer view.
  function pmmRodeoPanelKey(identity){
    const id=pmmRodeoIdentity(identity);return id?id.site+':'+id.vrid+':'+String(identity?.shipmentId||'')+':'+String(identity?.shipRef||''):'';
  }
  // Sole panel route to Rodeo: accepted-AFT gate, then the serialized launcher. A missing gate or
  // launcher opens nothing. Expansion/collapse is display-only; the scheduled pump calls this gate.
  function pmmRodeoEnsure(identity,manual=false){
    const id=pmmRodeoIdentity(identity);if(!id||id.site!=='LGA9'||typeof pmmRodeoRefreshRequest!=='function'||typeof pmmRodeoSnapshotSchedule!=='function')return false;
    const key=pmmRodeoPanelKey(identity);
    try{return pmmRodeoRefreshRequest(identity,()=>{pmmRodeoEnsure.key=key;pmmRodeoSnapshotSchedule(identity);},manual===true)===true;}catch(_){return false;}
  }
  function pmmRodeoAftText(identity){
    if(typeof pmmRodeoRefreshAftText!=='function')return '';
    try{const s=pmmRodeoRefreshAftText(identity);return typeof s==='string'?s.slice(0,300):'';}catch(_){return '';}
  }
  function pmmRodeoCancel(){
    pmmRodeoEnsure.key='';
    if(typeof pmmRodeoSnapshotCancel==='function')try{pmmRodeoSnapshotCancel();}catch(_){}
  }
  function pmmRodeoHistoryIndex(identity){
    const index=new Map(),id=pmmRodeoIdentity(identity);if(!id||!identity?.shipmentId)return index;
    let history=[];try{history=read(K.results,[]);}catch(_){return null;}if(!Array.isArray(history))return null;
    const path=`/${id.site}/stowing-in-progress/${identity.shipmentId}`;
    for(const r of history){
      if(!r||r.loadId!==id.vrid||r.shipRef!==path||!['case','tote'].includes(r.kind)||!Number.isFinite(r.detectedAt))continue;
      const key=JSON.stringify([r.kind,r.caseId]),prev=index.get(key);
      if(!prev||r.detectedAt>prev[0].detectedAt)index.set(key,[r]);else if(r.detectedAt===prev[0].detectedAt)prev.push(r);
    }
    return index;
  }
  function pmmRodeoHistoryCompare(row,identity,index){
    if(!identity?.shipmentId||row.manifest!==identity.shipmentId)return 'Different or unavailable shipment reference';
    const id=pmmRodeoIdentity(identity);if(!id)return 'No matching monitor identity';
    if(index===undefined)index=pmmRodeoHistoryIndex(identity);if(!index)return 'History unavailable';
    const matches=index.get(JSON.stringify([row.type==='TOTE'?'tote':'case',row.caseId]))||[];
    if(!matches.length)return 'No matching recorded movement';
    const latest=Math.max(...matches.map(r=>r.detectedAt)),ties=matches.filter(r=>r.detectedAt===latest);
    const stations=new Set(ties.map(r=>String(r.station||''))),quantities=new Set(ties.map(r=>r.quantity));
    if(stations.size!==1||quantities.size!==1)return 'Conflicting latest history';
    const station=[...stations][0],qty=[...quantities][0];
    const loc=pmmRodeoStation(`dz-P-A${station}`);if(!loc||!pmmRodeoNumber(qty))return 'Recorded station or units unavailable';
    return `${loc.station===row.station?'Station matches':'Station differs: '+loc.station}; ${qty===row.quantity?'units match':'history '+qty+' units'}. Recorded ${new Date(latest).toLocaleString()}`;
  }
  function pmmRodeoPanelHtml(identity){
    try{return pmmRodeoPanelContent(identity);}catch(_){const id=pmmRodeoIdentity(identity);return `<section id="pmm-rodeo" data-rodeo-identity="${pmmRodeoEsc(id?id.site+':'+id.vrid:'')}" data-rodeo-view="${pmmRodeoEsc(pmmRodeoPanelKey(identity))}" data-rodeo-stamp="unavailable" aria-label="Read-only Rodeo station quantities"><p>Rodeo station display unavailable. Existing monitor tracking is unaffected.</p></section>`; }
  }
  function pmmRodeoPanelContent(identity){
    const E=pmmRodeoEsc,p=pmmRodeoPrefs(),id=pmmRodeoIdentity(identity),fmt=n=>n.toLocaleString('en-US');
    const snapshot=pmmRodeoRead(identity,'aggregate'),items=pmmRodeoRead(identity,'items'),rows=snapshot?pmmRodeoFilter(snapshot.stations,p):[];
    const count=rows.reduce((n,r)=>n+r.quantity,0),status=pmmRodeoStatusText(identity);
    const option=(value,label,current)=>`<option value="${E(value)}"${String(value)===String(current)?' selected':''}>${E(label)}</option>`;
    const select=(name,label,options)=>`<label>${label}<select id="pmm-r-${name}">${options}</select></label>`;
    const selected=rows.some(r=>r.station===p.station)?p.station:'';
    let details='';
    if(selected){
      const cases=items?.caseRows.filter(r=>r.station===selected&&r.type==='CASE')||[],historyIndex=cases.length?pmmRodeoHistoryIndex(identity):null;
      details=`<div class="pmm-r-cases"><b>Captured cases at ${E(selected)}</b><p>${items?E(items.coverage)+'<br>'+E(pmmRodeoAge(items)):'No captured item page for this VRID.'}</p><p>Separate snapshot, not added to the station total. Comparisons use recorded movement.</p>${cases.length?`<table><thead><tr><th scope="col">Case</th><th scope="col">Units</th><th scope="col">History cross-check</th></tr></thead><tbody>${cases.slice(0,100).map(r=>`<tr><td>${E(r.caseId)}</td><td>${fmt(r.quantity)}</td><td>${E(pmmRodeoHistoryCompare(r,identity,historyIndex))}</td></tr>`).join('')}</tbody></table>${cases.length>100?`<p>Showing 100 of ${fmt(cases.length)} captured cases.</p>`:''}`:'<p>No cases in the captured page for this station. Absence in a partial page does not mean empty.</p>'}</div>`;
    }
    const empty=!id?'Open a trailer with a receiving site and VRID.':id.site!=='LGA9'?'Station mapping is validated for LGA9 only.':'No station data for this VRID yet. Missing data is not zero.';
    const stale=snapshot&&Date.now()-snapshot.at>300000;
    const warnings=snapshot?[...(snapshot.parentLevels.length!==2?[snapshot.coverage]:[]),...(snapshot.pools.length<6?['Report pools: '+snapshot.pools.join(', ')]:[]),...(snapshot.vridScoped?[]:['Matching VRID rows from a broader report.']),...(snapshot.unmappedUnits?[`${fmt(snapshot.unmappedUnits)} units at unmapped locations, not in table.`]:[])]:[];
    const feedback=pmmRodeoCopyFeedback(pmmRodeoPanelKey(identity),pmmRodeoCopyText(rows.map(r=>[r.station,fmt(r.quantity)])));
    const copyBar=`<div class="pmm-r-copybar"><button type="button" id="pmm-r-copy"${rows.length?pmmRodeoCopyRun.busy?' aria-disabled="true"':'':' disabled'} title="Copy the filtered Station and Quantity columns as tab-separated text">Copy table</button><span id="pmm-r-copy-status" class="pmm-r-note${feedback?.warn?' pmm-r-coverage':''}" role="status" data-copy-state="${E(feedback?.phase||'')}">${E(feedback?.message||'')}</span></div>`;
    const results=snapshot?`<p class="pmm-r-note${stale?' pmm-r-coverage':''}" data-rodeo-age data-rodeo-at="${snapshot.at}">${E(pmmRodeoAge(snapshot))}</p>${warnings.map(w=>`<p class="pmm-r-note pmm-r-coverage">${E(w)}</p>`).join('')}${copyBar}<div class="pmm-r-scroll"><table class="pmm-r-table" aria-label="Rodeo stations by unit quantity"><thead><tr><th scope="col">Station</th><th scope="col">Quantity</th></tr></thead><tbody>${rows.map(r=>`<tr><td><span class="pmm-r-station" role="button" tabindex="0" data-rodeo-station="${E(r.station)}" aria-expanded="${selected===r.station}" title="Show captured cases at this station">${E(r.station)}</span></td><td>${fmt(r.quantity)}</td></tr>`).join('')||'<tr><td colspan="2" class="pmm-r-empty">No stations match these filters.</td></tr>'}</tbody></table></div>${details}`:`<p class="pmm-r-note pmm-r-coverage">${E(empty)}</p>`;
    return `<section id="pmm-rodeo" data-rodeo-identity="${E(id?id.site+':'+id.vrid:'')}" data-rodeo-view="${E(pmmRodeoPanelKey(identity))}" data-rodeo-stamp="${snapshot?.at||0}:${snapshot?.startedAt||0}:${items?.at||0}" aria-label="Read-only Rodeo station quantities"><style>
#pax-monitor-v311 #pmm-rodeo{margin:10px 0;border:1px solid #b7c0c7;border-radius:5px;font-size:12px;line-height:1.45;color:inherit;background:transparent}
#pax-monitor-v311 #pmm-rodeo *{box-sizing:border-box}#pax-monitor-v311 #pmm-rodeo summary{padding:9px 10px;cursor:pointer;font-weight:700}#pax-monitor-v311 #pmm-rodeo .pmm-r-inner{padding:0 10px 10px}
#pax-monitor-v311 #pmm-rodeo-disclosure>summary{border-radius:4px}
#pax-monitor-v311 #pmm-rodeo-disclosure[open]>summary{border-radius:4px 4px 0 0}
#pax-monitor-v311 #pmm-rodeo-disclosure>summary:hover,#pax-monitor-v311 #pmm-rodeo-disclosure>summary:focus-visible{background:var(--pmm-soft);box-shadow:inset 0 0 0 1px var(--pmm-accent)}
#pax-monitor-v311 #pmm-rodeo-disclosure>summary:focus-visible{outline:2px solid var(--pmm-accent);outline-offset:1px}
#pax-monitor-v311 #pmm-rodeo .pmm-r-filters{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 8px}#pax-monitor-v311 #pmm-rodeo label{display:flex;flex:1 1 90px;flex-direction:column;gap:3px;font-size:11px;font-weight:600}#pax-monitor-v311 #pmm-rodeo select{width:100%;min-width:80px;font:inherit;padding:5px;border:1px solid #81919e;border-radius:3px;background:#f7f9fa;color:#192b39}
#pax-monitor-v311 #pmm-rodeo button{font:inherit;cursor:pointer;color:inherit;background:transparent}
#pax-monitor-v311 #pmm-rodeo table{width:100%;border-collapse:collapse;font-size:12px;margin:0;table-layout:fixed;color:inherit}#pax-monitor-v311 #pmm-rodeo th,#pax-monitor-v311 #pmm-rodeo td{padding:7px 9px;border:1px solid #c7cdd2;text-align:left;overflow-wrap:anywhere;background:transparent;color:inherit}#pax-monitor-v311 #pmm-rodeo th{background:#e9eef1;font-weight:700}#pax-monitor-v311 #pmm-rodeo .pmm-r-table{width:100%;table-layout:fixed}#pax-monitor-v311 #pmm-rodeo .pmm-r-table th,#pax-monitor-v311 #pmm-rodeo .pmm-r-table td{padding:3px 10px;white-space:nowrap;overflow-wrap:normal}#pax-monitor-v311 #pmm-rodeo .pmm-r-table td.pmm-r-empty{white-space:normal}#pax-monitor-v311 #pmm-rodeo .pmm-r-table td:last-child,#pax-monitor-v311 #pmm-rodeo .pmm-r-table th:last-child{text-align:right;font-variant-numeric:tabular-nums}#pax-monitor-v311 #pmm-rodeo .pmm-r-table th{position:sticky;top:0;z-index:1}#pax-monitor-v311 #pmm-rodeo .pmm-r-scroll{max-height:300px;overflow:auto;margin:6px 0 8px;width:calc(66.6667% + 15.3333px);min-width:220px;max-width:100%;scrollbar-gutter:stable}#pax-monitor-v311 #pmm-rodeo .pmm-r-station{cursor:pointer;-webkit-user-select:text;user-select:text;color:#075d82;text-decoration:underline;text-underline-offset:3px}
#pax-monitor-v311 #pmm-rodeo .pmm-r-copybar{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin:6px 0 0}#pax-monitor-v311 #pmm-rodeo #pmm-r-copy{margin:0;padding:3px 9px;font-size:11px;font-weight:600;border:1px solid #81919e;border-radius:3px;background:#f7f9fa;color:#192b39}#pax-monitor-v311 #pmm-rodeo #pmm-r-copy:hover:not(:disabled){border-color:#14789c}#pax-monitor-v311 #pmm-rodeo #pmm-r-copy:disabled,#pax-monitor-v311 #pmm-rodeo #pmm-r-copy[aria-disabled="true"]{cursor:default;opacity:.55}#pax-monitor-v311 #pmm-rodeo #pmm-r-copy-status{margin:0}
#pax-monitor-v311 #pmm-rodeo .pmm-r-note{font-size:11px;margin:6px 0}#pax-monitor-v311 #pmm-rodeo .pmm-r-note:empty{margin:0}#pax-monitor-v311 #pmm-rodeo .pmm-r-coverage{font-weight:600;color:#795115}#pax-monitor-v311 #pmm-rodeo :focus-visible{outline:2px solid #14789c;outline-offset:2px}#pax-monitor-v311 #pmm-rodeo .pmm-r-cases{padding-top:8px;border-top:1px solid #81919e;font-size:11px}#pax-monitor-v311 #pmm-rodeo .pmm-r-cases table{font-size:11px}#pax-monitor-v311 #pmm-rodeo p{margin:6px 0}
#pax-monitor-v311.dark #pmm-rodeo th{background:#303c47}#pax-monitor-v311.dark #pmm-rodeo #pmm-r-copy{background:#28333e;color:#edf1f4;border-color:#8a9aa8}#pax-monitor-v311.dark #pmm-rodeo select{background:#28333e;color:#edf1f4}#pax-monitor-v311.dark #pmm-rodeo .pmm-r-station{color:#9dd8ed}#pax-monitor-v311.dark #pmm-rodeo .pmm-r-coverage{color:#eac17f}#pax-monitor-v311.dark #pmm-rodeo td,#pax-monitor-v311.dark #pmm-rodeo th{border-color:#667684}
</style><details id="pmm-rodeo-disclosure"${p.open?' open':''}><summary>Units By Station <span style="font-weight:400">${snapshot?'('+fmt(rows.length)+' stations · '+fmt(count)+' units)':'(no data)'}</span></summary><div class="pmm-r-inner"><div class="pmm-r-filters">${select('floor','Floor',[0,1,2,3].map(f=>option(f,f?'Floor '+f:'All floors',p.floor)).join(''))}${select('zone','Zone',[0,1,2,3,4].map(z=>option(z,z?'Zone '+z:'All zones',p.zone)).join(''))}${select('quantity','Quantity',option('high','High to low',p.quantity)+option('low','Low to high',p.quantity))}</div><p id="pmm-r-aft" class="pmm-r-note">${E(pmmRodeoAftText(identity))}</p><p id="pmm-r-status" class="pmm-r-note" role="status">${E(status)}</p><div class="pmm-r-results">${results}</div></div></details></section>`;
  }
  function pmmRodeoPanelBind(box){
    const panel=box?.querySelector('#pmm-rodeo'),disclosure=panel?.querySelector('#pmm-rodeo-disclosure');if(!disclosure)return;
    const update=patch=>{pmmRodeoPrefs({scroll:0,station:'',...patch});pmmRodeoPanelReplace(true);};
    disclosure.addEventListener('toggle',e=>{
      // Parsing an open <details> also fires toggle; only a real state change acts.
      if(!e.target.isConnected||pmmRodeoPrefs().open===e.target.open)return;
      pmmRodeoPrefs({open:e.target.open});
      // Display preference only. Reopening paints the latest stored snapshot without touching the loader.
      if(e.target.open)pmmRodeoPanelReplace(true);
    });
    panel.querySelector('#pmm-r-floor').addEventListener('change',e=>update({floor:Number(e.target.value)}));
    panel.querySelector('#pmm-r-zone').addEventListener('change',e=>update({zone:Number(e.target.value)}));
    panel.querySelector('#pmm-r-quantity').addEventListener('change',e=>update({quantity:e.target.value==='low'?'low':'high'}));
    pmmRodeoResultsBind(panel);
    const ident=loadIdentity(),id=pmmRodeoIdentity(ident),key=id?.site==='LGA9'?pmmRodeoPanelKey(ident):'';
    if(pmmRodeoEnsure.key&&pmmRodeoEnsure.key!==key)pmmRodeoCancel();
  }
  function pmmRodeoResultsBind(panel){
    const toggle=b=>{pmmRodeoPrefs({station:pmmRodeoPrefs().station===b.dataset.rodeoStation?'':b.dataset.rodeoStation});pmmRodeoPanelReplace(true,true);};
    const modified=e=>e.shiftKey||e.ctrlKey||e.metaKey||e.altKey;
    panel.querySelectorAll('[data-rodeo-station]').forEach(b=>{
      // A drag, double-click or Shift/Ctrl-click that changed the selection over this label is selecting,
      // not a details request. A plain click on an already selected label still opens details.
      b.addEventListener('pointerdown',()=>{pmmRodeoSelectionIn.down=pmmRodeoSelectionMark();});
      b.addEventListener('click',e=>{const down=pmmRodeoSelectionIn.down;pmmRodeoSelectionIn.down=undefined;if(modified(e)||e.detail>1)return;if(pmmRodeoSelectionIn(b)&&!pmmRodeoSelectionSame(down,pmmRodeoSelectionMark()))return;toggle(b);});
      b.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' '||modified(e))return;e.preventDefault();if(!e.repeat)toggle(b);});
    });
    const copy=panel.querySelector('#pmm-r-copy');if(copy)copy.addEventListener('click',()=>pmmRodeoCopyRun(copy.closest('#pmm-rodeo')));
    const scroll=panel.querySelector('.pmm-r-scroll');if(scroll){scroll.scrollTop=pmmRodeoPrefs().scroll;scroll.addEventListener('scroll',()=>pmmRodeoPrefs({scroll:scroll.scrollTop}),{passive:true});}
  }
  function pmmRodeoPanelLight(panel,ident){
    const status=panel.querySelector('#pmm-r-status'),text=pmmRodeoStatusText(ident);
    if(status&&status.textContent!==text)status.textContent=text;
    const aft=panel.querySelector('#pmm-r-aft'),aftText=pmmRodeoAftText(ident);
    if(aft&&aft.textContent!==aftText)aft.textContent=aftText;
    const age=panel.querySelector('[data-rodeo-age]'),at=Number(age?.dataset.rodeoAt);
    if(age&&Number.isSafeInteger(at)){const next=pmmRodeoAge({at});if(age.textContent!==next)age.textContent=next;age.classList.toggle('pmm-r-coverage',Date.now()-at>300000);}
  }
  // user is true only for the user's own details toggle; other forced redraws keep a text selection.
  function pmmRodeoPanelReplace(force=false,user=false){
    try{
      const box=document.getElementById('pax-monitor-v311'),panel=box?.querySelector('#pmm-rodeo');if(!panel)return;
      const ident=loadIdentity(),id=pmmRodeoIdentity(ident),key=id?id.site+':'+id.vrid:'',view=pmmRodeoPanelKey(ident);
      const changed=panel.dataset.rodeoIdentity!==key||panel.dataset.rodeoView!==view;
      if(!changed&&!force){
        if(document.hidden||selectionInMonitor())return;
        pmmRodeoPanelLight(panel,ident);
        if(isDisplayHold()||panelInteractionActive(box)||Date.now()-(pmmRodeoPanelReplace.last||0)<5000)return;
      }
      pmmRodeoPanelReplace.last=Date.now();
      if(changed){pmmRodeoPrefs({station:'',scroll:0});pmmRodeoCopyRun.state=null;if(pmmRodeoEnsure.key&&pmmRodeoEnsure.key!==view)pmmRodeoCancel();}
      const snap=pmmRodeoRead(ident,'aggregate'),item=pmmRodeoRead(ident,'items');
      if(!changed&&!force&&panel.dataset.rodeoStamp===`${snap?.at||0}:${snap?.startedAt||0}:${item?.at||0}`)return;
      const html=pmmRodeoPanelHtml(ident),focus=panel.contains(document.activeElement)?document.activeElement.id:'';
      if(!changed&&panel.querySelector('.pmm-r-results')){
        const template=document.createElement('template');template.innerHTML=html;
        const next=template.content.querySelector('#pmm-rodeo'),results=next?.querySelector('.pmm-r-results');
        if(results){
          // Keep native controls (and their focus/Tab order) in place; only the
          // read-only result nodes change, so a snapshot arriving mid-focus is safe.
          const oldResults=panel.querySelector('.pmm-r-results'),focusedStation=oldResults.contains(document.activeElement)?document.activeElement?.dataset?.rodeoStation:'',focusedId=oldResults.contains(document.activeElement)?document.activeElement.id:'';
          // Same rendered rows under a user's text selection: leave the result nodes (and the old stamp, so
          // the next heartbeat redraws once the selection is released) instead of destroying the selection.
          const keep=!user&&pmmRodeoSelectionIn(oldResults)&&pmmRodeoResultsShape(oldResults)===pmmRodeoResultsShape(results);
          if(!keep)panel.dataset.rodeoStamp=next.dataset.rodeoStamp;
          panel.querySelector('summary').innerHTML=next.querySelector('summary').innerHTML;
          panel.querySelector('#pmm-r-status').textContent=next.querySelector('#pmm-r-status').textContent;
          const aftLine=panel.querySelector('#pmm-r-aft'),nextAft=next.querySelector('#pmm-r-aft');if(aftLine&&nextAft)aftLine.textContent=nextAft.textContent;
          for(const name of ['floor','zone','quantity']){const control=panel.querySelector('#pmm-r-'+name),value=next.querySelector('#pmm-r-'+name).value;if(control.value!==value)control.value=value;}
          const disclosure=panel.querySelector('#pmm-rodeo-disclosure'),open=pmmRodeoPrefs().open;if(disclosure.open!==open)disclosure.open=open;
          if(keep)return;
          oldResults.innerHTML=results.innerHTML;
          pmmRodeoResultsBind(panel);
          if(focusedStation&&(!document.activeElement||document.activeElement===document.body))panel.querySelector('[data-rodeo-station="'+focusedStation+'"]')?.focus({preventScroll:true});
          else if(focusedId&&(!document.activeElement||document.activeElement===document.body))panel.querySelector('#'+focusedId)?.focus({preventScroll:true});
          return;
        }
      }
      if(panel.outerHTML!==html){panel.outerHTML=html;pmmRodeoPanelBind(box);if(focus)box.querySelector('#'+focus)?.focus();}
    }catch(_){/* Read-only display failure cannot stop tracking. */}
  }
  function pmmRodeoSelectionIn(node){
    try{const s=window.getSelection();return !!(s&&!s.isCollapsed&&s.rangeCount&&s.containsNode(node,true));}catch(_){return false;}
  }
  function pmmRodeoSelectionMark(){
    try{const s=window.getSelection();return s&&!s.isCollapsed?[s.anchorNode,s.anchorOffset,s.focusNode,s.focusOffset]:null;}catch(_){return null;}
  }
  function pmmRodeoSelectionSame(a,b){return !!a&&!!b&&a.every((v,i)=>v===b[i]);}
  function pmmRodeoResultsShape(results){return JSON.stringify([!!results.querySelector('.pmm-r-table'),pmmRodeoCopyRows(results)]);}
  function pmmRodeoCopyText(rows){
    const cell=v=>String(v??'').replace(/[\t\r\n]+/g,' ').trim();
    return ['Station\tQuantity',...rows.map(([station,quantity])=>cell(station)+'\t'+cell(quantity))].join('\n');
  }
  // Reads the rendered rows, including those scrolled out of view, so the copy matches what the table shows.
  function pmmRodeoCopyRows(panel){
    const out=[];
    for(const tr of panel?.querySelectorAll?.('.pmm-r-table tbody tr')||[]){const s=tr.querySelector('[data-rodeo-station]'),q=tr.cells?.[1];if(s&&q)out.push([s.textContent,q.textContent]);}
    return out;
  }
  function pmmRodeoCopyMessage(phase,count){
    const rows=count+' row'+(count===1?'':'s');
    return phase==='pending'?`Copying ${rows}…`:phase==='copied'?`Copied ${rows} with Station and Quantity headers.`:phase==='unconfirmed'?`Copy of ${rows} not confirmed. Paste to check, or select the table and copy.`:'Copy failed. Select the table text and copy it manually.';
  }
  // Feedback belongs to the rows that were copied. After the table changes it is either withdrawn or,
  // while that copy is unfinished or after it succeeded, restated as being about the earlier rows.
  function pmmRodeoCopyFeedback(view,text){
    const s=pmmRodeoCopyRun.state;
    if(!s||!view||s.view!==view)return pmmRodeoCopyRun.busy?{phase:'busy',warn:true,message:'A previous copy has not finished. Paste to check it, or select the table and copy.'}:null;
    if(s.text===text)return s;
    if(s.phase==='copied')return{phase:'stale-copied',warn:true,message:'The table changed after copying; the clipboard holds the earlier rows. Copy again for the current rows.'};
    if(s.phase==='pending'||s.phase==='unconfirmed')return{phase:'stale-'+s.phase,warn:true,message:'The table changed while copying; that copy, if it completes, holds the earlier rows.'};
    return null;
  }
  function pmmRodeoCopyPaint(){
    const panel=document.getElementById('pax-monitor-v311')?.querySelector('#pmm-rodeo'),out=panel?.querySelector('#pmm-r-copy-status');
    let current='';try{current=pmmRodeoPanelKey(loadIdentity());}catch(_){}
    if(!out||!current||panel.dataset.rodeoView!==current)return false;
    const f=pmmRodeoCopyFeedback(current,pmmRodeoCopyText(pmmRodeoCopyRows(panel)));
    out.textContent=f?.message||'';out.dataset.copyState=f?.phase||'';out.classList.toggle('pmm-r-coverage',!!f?.warn);return !!f;
  }
  function pmmRodeoCopyBusyPaint(){
    const button=document.getElementById('pax-monitor-v311')?.querySelector('#pmm-rodeo #pmm-r-copy');if(!button||button.disabled)return;
    if(pmmRodeoCopyRun.busy)button.setAttribute('aria-disabled','true');else button.removeAttribute('aria-disabled');
  }
  // Success is reported only on confirmation: Tampermonkey's documented GM_setClipboard(data,info,cb)
  // completion callback, or an awaited writeText promise when GM is unavailable or throws. A GM call
  // that returns without calling back is "not confirmed" after waitMs; a late callback still upgrades it.
  function pmmRodeoClipboardWrite(text,report,waitMs=4000){
    let settled=false;
    const timer=setTimeout(()=>{if(!settled)report('unconfirmed');},waitMs);
    const finish=phase=>{if(settled)return;settled=true;clearTimeout(timer);report(phase);};
    const viaBrowser=()=>{
      let write=null;
      try{if(window.isSecureContext&&typeof navigator.clipboard?.writeText==='function')write=navigator.clipboard.writeText(text);}catch(_){write=null;}
      if(write&&typeof write.then==='function')write.then(()=>finish('copied'),()=>finish('failed'));else finish('failed');
    };
    if(typeof GM_setClipboard!=='function'){viaBrowser();return;}
    try{GM_setClipboard(text,'text',()=>finish('copied'));}catch(_){viaBrowser();}
  }
  // One clipboard write at a time: an unfinished write could land after a newer one, so a new copy
  // waits until the outstanding write confirms or fails. An unconfirmed write stays outstanding.
  function pmmRodeoCopyRun(panel){
    const refuse=message=>{const out=panel?.querySelector?.('#pmm-r-copy-status');if(out){out.textContent=message;out.dataset.copyState='refused';out.classList.add('pmm-r-coverage');}return false;};
    if(pmmRodeoCopyRun.busy)return refuse('Nothing copied: the previous copy has not finished. Paste to check it, or select the table and copy.');
    let current='';try{current=pmmRodeoPanelKey(loadIdentity());}catch(_){}
    const view=panel?.isConnected?panel.dataset.rodeoView||'':'',rows=view&&view===current?pmmRodeoCopyRows(panel):[];
    if(!rows.length)return refuse('Nothing copied: the table is empty or changed. Try again.');
    const seq=(pmmRodeoCopyRun.seq||0)+1,text=pmmRodeoCopyText(rows);pmmRodeoCopyRun.seq=seq;pmmRodeoCopyRun.busy=true;
    const report=phase=>{if(pmmRodeoCopyRun.seq!==seq)return;if(phase==='copied'||phase==='failed')pmmRodeoCopyRun.busy=false;pmmRodeoCopyRun.state={seq,view,text,phase,warn:phase==='unconfirmed'||phase==='failed',message:pmmRodeoCopyMessage(phase,rows.length)};pmmRodeoCopyPaint();pmmRodeoCopyBusyPaint();};
    report('pending');
    try{pmmRodeoClipboardWrite(text,report);}catch(_){report('failed');}
    return true;
  }

  // 4.1.1.10 adds the read-only pre-discovery section from 03k (own active token and sessionStorage reads only).
  // 4.1.1.6 adds the read-only registration section from 03i (sessionStorage and own-job evidence reads only).
  // 4.1.1.5: token-free Rodeo diagnostic, separate from AFT. Read-only toward every operational
  // state: existing .value objects only (never an initializer), no launcher, listener, cache loader,
  // lock or storage write. The only write is pmmRodeoDiagnosticEvent's own capped sessionStorage log.
  // Output is built from allowlisted enums and numbers; no source object is copied or traversed.
  function pmmRodeoDiagSpec(){
    return {schema:'pmm-rodeo-diagnostic-v1',store:'pmm-rodeo-diag-v1',maxEvents:60,maxKeys:8,maxBytes:32768,maxRows:200,summaryEvents:20,futureMs:60000,maxAgeMs:86400000,
      events:['aft-accepted','scheduled','queued','launch','stage','complete','cancel','blocked','reuse'],
      times:['basisAt','targetAt','queuedAt','startedAt','endedAt','expiresAt'],
      phases:['pending','success','stopped','startup','registration','route','resume','bind','api','return','no-snapshot','load','refresh','scan'],
      stages:['startup-unconfirmed','registered','resuming','bound','failed-registration','failed-route','failed-resume','failed-bind','failed-api'],
      reasons:['hidden','no-basis','basis-invalid','identity-changed','collapsed','aft-busy','scan-stale','lock-busy','lock-unsupported','storage-origin','cooldown','guard-invalid','guard-future','guard-unreadable','guard-save-failed','permissions','expired','superseded','fresh-snapshot','pagehide','rejected','launch-failed','timeout','helper-active','user-reopen','already-attempted','not-ready','unknown']};
  }
  function pmmRodeoDiagEnum(v,list){return typeof v==='string'&&list.includes(v)?v:null;}
  function pmmRodeoDiagCount(v){return Number.isSafeInteger(v)&&v>=0?v:null;}
  function pmmRodeoDiagTime(v,now){return Number.isSafeInteger(v)&&v>0&&v<=now+pmmRodeoDiagSpec().futureMs?v:null;}
  function pmmRodeoDiagAge(at,now){return Number.isSafeInteger(at)&&at<=now?now-at:null;}
  function pmmRodeoDiagKey(identity){try{const id=pmmRodeoIdentity(identity);return id?id.site+':'+id.vrid:null;}catch(_){return null;}}
  // One sanitized event; anything not allowlisted is dropped, never echoed.
  function pmmRodeoDiagClean(e,now){
    const D=pmmRodeoDiagSpec();
    if(!e||typeof e!=='object'||Array.isArray(e)||typeof e.k!=='string'||!/^[A-Z]{3}\d:[A-Z0-9]{6,20}$/.test(e.k)||!pmmRodeoDiagEnum(e.e,D.events))return null;
    if(!Number.isSafeInteger(e.t)||e.t>now+D.futureMs||now-e.t>D.maxAgeMs)return null;
    // Same {k,e,t,d} envelope when written and when reloaded, so details survive every rewrite.
    const out={},d=e.d&&typeof e.d==='object'&&!Array.isArray(e.d)?e.d:{};
    for(const f of D.times){const v=pmmRodeoDiagTime(d[f],Math.max(now,e.t)+D.maxAgeMs);if(v!==null)out[f]=v;}
    if(Number.isSafeInteger(d.delayMs)&&d.delayMs>=0&&d.delayMs<=D.maxAgeMs)out.delayMs=d.delayMs;
    const phase=pmmRodeoDiagEnum(d.phase,D.phases),stage=pmmRodeoDiagEnum(d.stage,D.stages),reason=pmmRodeoDiagEnum(d.reason,D.reasons);
    if(phase)out.phase=phase;if(stage)out.stage=stage;if(reason)out.reason=reason;
    return {k:e.k,e:e.e,t:e.t,d:out};
  }
  function pmmRodeoDiagLoad(now){
    const D=pmmRodeoDiagSpec();let raw;
    try{if(typeof sessionStorage==='undefined')return {status:'unavailable',events:[],discarded:0};raw=sessionStorage.getItem(D.store);}catch(_){return {status:'unreadable',events:[],discarded:0};}
    if(raw===null||raw===undefined)return {status:'empty',events:[],discarded:0};
    if(typeof raw!=='string'||raw.length>D.maxBytes)return {status:'oversize',events:[],discarded:0};
    let j;try{j=JSON.parse(raw);}catch(_){return {status:'corrupt',events:[],discarded:0};}
    if(!j||typeof j!=='object'||j.v!==1||!Array.isArray(j.events))return {status:'corrupt',events:[],discarded:0};
    const cleaned=[];
    for(const e of j.events.slice(-D.maxEvents*2)){const c=pmmRodeoDiagClean(e,now);if(c)cleaned.push(c);}
    const events=pmmRodeoDiagCompact(cleaned,null),discarded=j.events.length-events.length;
    return {status:discarded?'partial':'ok',events,discarded};
  }
  // Oldest-first, at most maxKeys VRIDs (most recently active kept; prefer is kept on a tie) and maxEvents events.
  function pmmRodeoDiagCompact(list,prefer){
    const D=pmmRodeoDiagSpec(),events=[...list].sort((a,b)=>a.t-b.t),latest=new Map();
    for(const x of events)latest.set(x.k,x.t);
    const keep=new Set([...latest].sort((a,b)=>b[1]-a[1]||(a[0]===prefer?-1:b[0]===prefer?1:0)).slice(0,D.maxKeys).map(x=>x[0]));
    return events.filter(x=>keep.has(x.k)).slice(-D.maxEvents);
  }
  function pmmRodeoDiagnosticEvent(identity,event,details){
    try{
      const D=pmmRodeoDiagSpec(),now=Date.now(),k=pmmRodeoDiagKey(identity);
      if(!k||!pmmRodeoDiagEnum(event,D.events)||typeof sessionStorage==='undefined')return false;
      const e=pmmRodeoDiagClean({k,e:event,t:now,d:details},now);if(!e)return false;
      const prior=pmmRodeoDiagLoad(now);if(prior.status==='unreadable'||prior.status==='unavailable')return false;
      let events=pmmRodeoDiagCompact([...prior.events,e],k);
      let text=JSON.stringify({v:1,events});
      while(text.length>D.maxBytes&&events.length>1){events=events.slice(1);text=JSON.stringify({v:1,events});}
      sessionStorage.setItem(D.store,text);
      return true;
    }catch(_){return false;}
  }
  function pmmRodeoDiagHistory(key,full,now){
    const D=pmmRodeoDiagSpec(),h=pmmRodeoDiagLoad(now),mine=key?h.events.filter(e=>e.k===key):[];
    const shown=full?mine:mine.slice(-D.summaryEvents);
    return {status:h.status,storedEvents:h.events.length,discardedEvents:h.discarded,otherVrids:new Set(h.events.filter(e=>e.k!==key).map(e=>e.k)).size,
      events:shown.map(x=>({event:x.e,at:x.t,...x.d})),shownEvents:shown.length,totalForVrid:mine.length,truncated:shown.length<mine.length,maxEvents:D.maxEvents,maxVrids:D.maxKeys};
  }
  function pmmRodeoDiagSettings(){
    const out={},pick=(src,map)=>{for(const [from,to] of map){const v=src?.[from];if(Number.isSafeInteger(v)&&v>=0&&v<=86400000)out[to]=v;}};
    try{pick(typeof pmmRodeoRefreshSpec==='function'?pmmRodeoRefreshSpec():null,[['autoTtl','autoOpportunityTtlMs'],['pendingTtl','refreshConfirmTtlMs'],['autoDelay','targetDelayMs']]);}catch(_){}
    try{pick(typeof pmmRodeoSnapshotSpec==='function'?pmmRodeoSnapshotSpec():null,[['ttl','helperDeadlineMs'],['fresh','snapshotFreshMs'],['cooldown','attemptSpacingMs'],['queueTtl','queueTtlMs']]);}catch(_){}
    return out;
  }
  function pmmRodeoDiagSame(a,identity){
    try{return typeof pmmRodeoRefreshSame==='function'&&typeof pmmRodeoRefreshKey==='function'&&pmmRodeoRefreshSame(a,pmmRodeoRefreshKey(identity))===true;}catch(_){return false;}
  }
  function pmmRodeoDiagAft(identity,settings,now){
    const st=typeof pmmRodeoRefreshState==='function'?pmmRodeoRefreshState.value:undefined;
    if(!st||typeof st!=='object')return {state:'uninitialized',basis:null,auto:null,refreshConfirm:null,recentScan:pmmRodeoDiagRecent()};
    const b=st.basis,a=st.auto,p=st.pending;
    const basis=b&&typeof b==='object'?{at:pmmRodeoDiagTime(b.at,now),ageMs:pmmRodeoDiagAge(b.at,now),kind:pmmRodeoDiagEnum(b.kind,['load','refresh','scan']),valid:b.valid===true,matchesIdentity:pmmRodeoDiagSame(b,identity)}:null;
    let open=false;try{open=typeof pmmRodeoRefreshAutoOpen==='function'&&pmmRodeoRefreshAutoOpen(st)===true;}catch(_){}
    // auto.at is the due time (accepted basis + target delay); the opportunity carries its own basis/expiry.
    const far=now+pmmRodeoDiagSpec().maxAgeMs;
    const auto=a&&typeof a==='object'?{basisAt:pmmRodeoDiagTime(a.basisAt,now),targetAt:pmmRodeoDiagTime(a.at,far),expiresAt:pmmRodeoDiagTime(a.expiresAt,far),seq:pmmRodeoDiagCount(a.seq),used:a.used===true,due:Number.isSafeInteger(a.at)?now>=a.at:null,open,matchesBasis:!!b&&typeof pmmRodeoRefreshSame==='function'&&pmmRodeoRefreshSame(a,b)===true}:null;
    const refreshConfirm=p&&typeof p==='object'?{at:pmmRodeoDiagTime(p.at,now),ageMs:pmmRodeoDiagAge(p.at,now)}:null;
    return {state:'present',hidden:st.hidden===true,seenAft:st.seenAft===true,basis,auto,refreshConfirm,blockReason:pmmRodeoDiagEnum(st.blockReason,pmmRodeoDiagSpec().reasons),recentScan:pmmRodeoDiagRecent()};
  }
  function pmmRodeoDiagRecent(){try{return typeof pmmRodeoRefreshScanRecent==='function'?pmmRodeoRefreshScanRecent()===true:null;}catch(_){return null;}}
  function pmmRodeoDiagStage(active){
    const map={'startup not confirmed':'startup-unconfirmed','helper registered':'registered','native return recognized':'resuming','helper bound':'bound','helper failed: registration':'failed-registration','helper failed: route':'failed-route','helper failed: resume':'failed-resume','helper failed: bind':'failed-bind','helper failed: api':'failed-api'};
    try{const s=typeof pmmRodeoSnapshotStage==='function'?pmmRodeoSnapshotStage(active):null;return typeof s==='string'&&Object.prototype.hasOwnProperty.call(map,s)?map[s]:'unknown';}catch(_){return 'unknown';}
  }
  // The status text is classified by fixed prefixes only; it is never exported.
  function pmmRodeoDiagStatus(message){
    if(message===''||message===undefined||message===null)return 'none';
    if(typeof message!=='string')return 'other';
    const known=[['Pulling Rodeo snapshot','pulling'],['Rodeo cooldown until','cooldown'],['Snapshot pull stopped','stopped'],['Rodeo snapshot deferred: the previous trailer','identity-changed'],
      ['Rodeo snapshot unavailable: saved retry guard could not be read','guard-unreadable'],['Rodeo snapshot unavailable: saved retry guard is invalid','guard-invalid'],['Rodeo snapshot deferred: saved attempt is ahead','guard-future'],
      ['Snapshot pull requires Tampermonkey','permissions'],['Rodeo snapshot unavailable: the hidden Rodeo loader','permissions'],['Snapshot unavailable. Hidden Rodeo loader did not complete','launch-failed'],['Rodeo snapshot unavailable: retry guard could not be saved','guard-save-failed'],['Snapshot unavailable. Helper startup was not confirmed','startup-unconfirmed'],
      ['Snapshot unavailable. No accepted Rodeo snapshot','no-snapshot'],['Rodeo snapshot unavailable: browser lock support','lock-unsupported'],['Rodeo deferred: AFT data or refresh state changed','state-changed'],
      ['Rodeo was busy in another AFT tab','lock-busy'],['Rodeo snapshot unavailable: helper launch could not be coordinated','launch-failed'],['Rodeo snapshot unavailable. Existing monitor','error'],
      ['Rodeo snapshot unavailable: the selected AFT storage origin','storage-origin'],['Rodeo already attempted at','already-attempted'],['Rodeo update expired','expired'],
      ['Rodeo update queued','queued'],['Rodeo update waiting','waiting'],['Rodeo update cancelled','cancelled']];
    for(const [p,v] of known)if(message.startsWith(p))return v;
    return 'other';
  }
  function pmmRodeoDiagHelper(key,settings,now){
    const s=typeof pmmRodeoSnapshotState==='function'?pmmRodeoSnapshotState.value:undefined;
    if(!s||typeof s!=='object')return {state:'uninitialized',launch:null,active:null,status:'none',statusForVrid:false};
    const mine=!!key&&s.key===key,l=s.launch,a=s.active;
    const far=now+pmmRodeoDiagSpec().maxAgeMs;
    const launch=l&&typeof l==='object'?{state:pmmRodeoDiagEnum(l.state,['queued','cooldown','waiting','active','done']),manual:l.manual===true,cancelled:l.cancelled===true,completed:l.completed===true,followUp:!!l.follow,lockHeld:typeof l.persistAttempt==='function',
      basisAt:pmmRodeoDiagTime(l.basisAt,now),queuedAt:pmmRodeoDiagTime(l.queuedAt,now),targetAt:pmmRodeoDiagTime(l.targetAt,far),expiresAt:pmmRodeoDiagTime(l.expiresAt,far),startedAt:pmmRodeoDiagTime(l.startedAt,now),
      waitedMs:pmmRodeoDiagAge(pmmRodeoDiagTime(l.queuedAt,now),now)}:null;
    let active=null;
    if(a&&typeof a==='object'){
      const at=pmmRodeoDiagTime(a.created,now),deadline=at!==null&&settings.helperDeadlineMs!==undefined?at+settings.helperDeadlineMs:null;
      active={forVrid:mine,basisAt:pmmRodeoDiagTime(a.basisAt,now),startedAt:at,elapsedMs:pmmRodeoDiagAge(at,now),deadlineAt:deadline,remainingMs:deadline!==null?Math.max(0,deadline-now):null,stage:pmmRodeoDiagStage(a)};
    }
    const reason=mine?pmmRodeoDiagEnum(s.reason,pmmRodeoDiagSpec().reasons):null;
    return {state:'present',hidden:s.hidden===true,launch,active,statusForVrid:mine,status:mine?pmmRodeoDiagStatus(s.message):'none',reason,reasonAt:reason?pmmRodeoDiagTime(s.reasonAt,now):null};
  }
  function pmmRodeoDiagRetry(key,settings,now,basisAt){
    const out={local:{state:'absent',at:null},gm:{state:'absent',at:null,phase:null},session:{state:'absent',at:null},memory:{state:'absent',at:null},latestAt:null,eligibleAt:null,eligibleNow:null,alreadyAttemptedForBasis:null,blocked:null};
    if(!key)return out;
    const mark=(slot,v,strict)=>{
      if(v===null||v===undefined)return;
      const n=typeof v==='string'?(/^[0-9]{13}$/.test(v)?Number(v):(strict?NaN:Number(v))):v;
      if(!Number.isSafeInteger(n)||n<=0)slot.state='corrupt';else if(n>now)slot.state='future';else{slot.state='valid';slot.at=n;}
    };
    try{mark(out.local,localStorage.getItem('pmm-rodeo-launch-attempt-v1:'+key),true);}catch(_){out.local.state='unreadable';}
    try{
      const raw=GM_getValue('pmm-rodeo-attempt-v2:'+key,null);
      if(raw!==null){
        if(!raw||typeof raw!=='object'||raw.v!==2||!Number.isSafeInteger(raw.at)||raw.at<=0)out.gm.state='corrupt';
        else if(raw.at>now)out.gm.state='future';
        else{out.gm.phase=pmmRodeoDiagEnum(raw.phase,['pending','success','stopped','startup','registration','route','resume','bind','api','return','no-snapshot']);out.gm.state=out.gm.phase?'valid':'corrupt';if(out.gm.phase)out.gm.at=raw.at;}
      }
    }catch(_){out.gm.state='unreadable';}
    try{mark(out.session,sessionStorage.getItem('pmm-rodeo-attempt-v1:'+key),false);}catch(_){out.session.state='unreadable';}
    try{const s=typeof pmmRodeoSnapshotState==='function'?pmmRodeoSnapshotState.value:undefined;const m=s?.attempts instanceof Map?s.attempts.get(key):undefined;if(m!==undefined)mark(out.memory,m,true);}catch(_){out.memory.state='unreadable';}
    const valid=[out.local,out.gm,out.session,out.memory].filter(x=>x.state==='valid').map(x=>x.at);
    out.latestAt=valid.length?Math.max(...valid):null;
    if(out.latestAt!==null&&settings.attemptSpacingMs!==undefined){out.eligibleAt=out.latestAt+settings.attemptSpacingMs;out.eligibleNow=now>=out.eligibleAt;}
    else if(out.latestAt===null)out.eligibleNow=true;
    // An attempt started at/after the accepted basis already served it; only a newer basis or explicit internal request retries.
    if(basisAt!==null&&basisAt!==undefined)out.alreadyAttemptedForBasis=out.latestAt!==null&&basisAt<=out.latestAt;
    // Mirrors the launcher: an invalid/future local fence or invalid GM record blocks launch.
    out.blocked=out.local.state==='unreadable'||out.gm.state==='unreadable'?'guard-unreadable':out.local.state==='corrupt'||out.gm.state==='corrupt'?'guard-invalid':out.local.state==='future'||out.gm.state==='future'?'guard-future':out.eligibleNow===false?'cooldown':null;
    return out;
  }
  function pmmRodeoDiagCoverage(s){
    if(s.reportContract!==undefined)return 'direct-parent-contract';
    if(s.basis==='aggregate')return s.parentLevels.length===2?'both-parents':s.parentLevels[0]==='outerOuter'?'outer-outer-only':'direct-parent-only';
    return s.startIndex===0&&s.queryUniqueRows===s.itemCount?'items-complete':'items-partial';
  }
  // Selects the snapshot pmmRodeoRead would display, without pmmRodeoLoadEntry's listener/cache side
  // effects: an existing cache entry is reused, otherwise a bounded number of raw reads is validated.
  function pmmRodeoDiagFind(id,basis,full,now){
    const out={snapshot:null,keys:0,invalid:0,uninspected:0};
    const metas=pmmRodeoKeys(id,basis).filter(e=>pmmRodeoMetaValid(e,now)).slice(0,64),cache=typeof pmmRodeoLoadEntry.cache?.get==='function'?pmmRodeoLoadEntry.cache:null;
    out.keys=metas.length;let reads=full?3:basis==='aggregate'?1:0;
    for(let i=0;i<metas.length;i++){
      const meta=metas[i],c=cache?.get(meta.key);
      let s=null;
      // A cached entry is revalidated like a raw read; only the operational cache's validity flag is trusted to skip.
      if(c){if(!c.valid){out.invalid++;continue;}s=c.s;}
      else{if(reads<=0){out.uninspected=metas.length-i;return out;}reads--;try{s=GM_getValue(meta.key,null);}catch(_){}}
      if(pmmRodeoValidSnapshot(s,meta,now,basis)&&s.startedAt===meta.startedAt&&s.at===meta.at){out.snapshot=s;return out;}
      out.invalid++;
    }
    return out;
  }
  function pmmRodeoDiagSnapshot(id,basis,full,basisAt,settings,now,keep){
    const f=pmmRodeoDiagFind(id,basis,full,now),s=f.snapshot;if(keep)keep.s=s;
    const base={basis,keysSeen:f.keys,invalidSkipped:f.invalid,uninspected:f.uninspected};
    if(!s)return {present:false,...base,selection:f.uninspected?'incomplete':'none'};
    const contract=s.reportContract===pmmRodeoReportContract();
    let newContract=false;try{newContract=typeof pmmRodeoSnapshotContractSnapshot==='function'&&pmmRodeoSnapshotContractSnapshot(s,id)===true;}catch(_){}
    const units=s.stations.reduce((n,r)=>n+r.quantity,0),age=pmmRodeoDiagAge(s.at,now);
    const out={present:true,...base,selection:'newest-valid',reportContract:contract?pmmRodeoReportContract():'legacy-generic',contractSnapshot:newContract,coverage:pmmRodeoDiagCoverage(s),
      startedAt:s.startedAt,capturedAt:s.at,durationMs:s.at-s.startedAt,ageMs:age,fresh:age!==null&&settings.snapshotFreshMs!==undefined?age<settings.snapshotFreshMs:null,
      // Only a contract snapshot started at/after the accepted AFT basis is newer than that basis.
      sinceAcceptedAft:basisAt===null?null:newContract&&s.startedAt>=basisAt,
      stations:s.stations.length,stationUnits:units,unmappedUnits:s.unmappedUnits,excludedRows:contract?s.excludedRows:null,excludedUnits:contract?s.excludedUnits:null,
      sourceRows:s.sourceRows,matchedRows:s.matchedRows,pools:s.pools.length,vridScoped:s.vridScoped,parentLevels:s.parentLevels.filter(p=>p==='outer'||p==='outerOuter')};
    if(basis==='items')Object.assign(out,{caseRows:s.caseRows.length,itemCount:s.itemCount,startIndex:s.startIndex,queryUniqueRows:s.queryUniqueRows});
    return out;
  }
  function pmmRodeoDiagStations(snapshot,prefs,D){
    const rows=[];
    for(const r of snapshot.stations){if(rows.length>=D.maxRows)break;const loc=pmmRodeoStation(r?.station);if(loc&&pmmRodeoNumber(r.quantity))rows.push({station:loc.station,floor:loc.floor,zone:loc.zone,quantity:r.quantity});}
    let matching=null,matchingUnits=null;try{const m=pmmRodeoFilter(snapshot.stations,prefs);matching=m.length;matchingUnits=m.reduce((n,r)=>n+r.quantity,0);}catch(_){}
    return {rows,shown:rows.length,total:snapshot.stations.length,truncated:snapshot.stations.length>rows.length,filterMatches:matching,filterMatchUnits:matchingUnits};
  }
  function pmmRodeoDiagFilters(){
    if(typeof pmmRodeoPrefs!=='function')return null;
    const p=pmmRodeoPrefs();
    return {open:p.open===true,floor:[0,1,2,3].includes(p.floor)?p.floor:0,zone:[0,1,2,3,4].includes(p.zone)?p.zone:0,quantity:p.quantity==='low'?'low':'high',station:pmmRodeoStation(p.station)?.station||null};
  }
  // The monitor's busy predicate (pmmRodeoRefreshBusy) is never called: isPaused/tabPrefRead and
  // sourceTrackingActive/dataSourceMode write tab prefs and memo state. Only primitive monitor flags are
  // read directly (undeclared or TDZ reads become null); the policy parts that need those calls are
  // reported as not inspected, so readiness can be disproved here but never proved.
  function pmmRodeoDiagQueue(){
    const none={},rd=f=>{try{return f();}catch(_){return none;}},flag=v=>v===none?null:!!v;
    const raw=rd(()=>refreshPhase),phase=raw===none?null:raw;
    const q={refreshing:flag(rd(()=>refreshing)),domConfirming:flag(rd(()=>_refreshDOMConfirmed)),scanPending:flag(rd(()=>_refreshScanResolve)),refreshRequested:flag(rd(()=>_refreshRequest)),
      pageRestored:flag(rd(()=>_pageRestored)),pageUnloading:flag(rd(()=>_pageUnloading)),monitorError:flag(rd(()=>monitorError)),
      refreshPhase:raw===none?null:pmmRodeoDiagEnum(phase,['idle','blocked','cooldown','queued','running','settling','stalled'])||'other'};
    const flags=[q.refreshing,q.domConfirming,q.scanPending,q.refreshRequested,q.pageRestored,q.pageUnloading,q.monitorError];
    const busy=flags.includes(true)||q.refreshPhase==='running'||q.refreshPhase==='settling';
    q.state=busy?'busy':flags.includes(null)||q.refreshPhase===null?'unknown':'no-observed-busy';
    q.notInspected=['duplicate-view','paused','page-ready','source-tracking'];
    return q;
  }
  function pmmRodeoDiagBlockers(identity,id,aft,helper,retry,queue){
    const out=[],add=r=>{if(!out.includes(r))out.push(r);};
    if(!id){add('no-identity');return out;}
    if(id.site!=='LGA9')add('unsupported-site');
    if(aft.state!=='present')add('no-basis');
    else{if(aft.hidden)add('hidden');if(!aft.basis)add('no-basis');else{if(!aft.basis.matchesIdentity)add('identity-changed');if(!aft.basis.valid)add('basis-invalid');}}
    if(helper.hidden)add('hidden');
    // Disclosure state is observational only in 4.1.1.12, never a readiness blocker.
    if(queue.state==='busy')add('aft-busy');
    if(aft.recentScan!==true)add('scan-stale');
    try{if(GM_getValue('pax-monitor-v3515-storage-origin',null)!==location.origin)add('storage-origin');}catch(_){add('storage-origin');}
    try{if(typeof navigator==='undefined'||typeof navigator.locks?.request!=='function')add('lock-unsupported');}catch(_){add('lock-unsupported');}
    if(helper.active)add('helper-active');else if(helper.launch)add('launch-pending');
    if(retry.blocked)add(retry.blocked);
    return out;
  }
  // Blockers are a subset of the launcher policy, so readiness is false when any is observed and
  // null (unverified) otherwise; it is never reported as true.
  function pmmRodeoDiagReadiness(blockers,queue,aft,retry){
    const automaticBlockers=[...blockers,...(retry.alreadyAttemptedForBasis===true?['already-attempted']:[]),...(aft.auto?.open===true?[]:['no-opportunity'])];
    return {blockers,automaticBlockers,unverified:['aft-queue-policy'],queue,automaticOpportunity:aft.auto?.open===true,
      automaticReady:automaticBlockers.length?false:null,manualReady:blockers.length?false:null};
  }
  function pmmRodeoDiagnostic(identity,full=false){
    const D=pmmRodeoDiagSpec(),now=Date.now(),failed=[];
    const part=(name,fn,fallback=null)=>{try{return fn();}catch(_){failed.push(name);return fallback;}};
    const id=part('identity',()=>pmmRodeoIdentity(identity)),key=id?id.site+':'+id.vrid:null;
    const path=typeof identity?.shipRef==='string'?identity.shipRef:'';
    const ident={siteVrid:key,site:id?.site||null,supportedSite:id?.site==='LGA9',shipmentPresent:typeof identity?.shipmentId==='string'&&!!identity.shipmentId,
      pathKind:!path?'none':path.length<=200&&/^\/[A-Z]{3}\d\/stowing-in-progress\/[^/?#]+$/.test(path)?'stowing-in-progress':'other',source:pmmRodeoDiagEnum(identity?.source,['aft','hunter','combined'])};
    const settings=part('settings',pmmRodeoDiagSettings,{});
    const aft=part('aft',()=>pmmRodeoDiagAft(identity,settings,now),{state:'unavailable',basis:null,auto:null,refreshConfirm:null,recentScan:null});
    const helper=part('helper',()=>pmmRodeoDiagHelper(key,settings,now),{state:'unavailable',launch:null,active:null,status:'none',statusForVrid:false});
    const basisAt=aft.basis?.valid&&aft.basis.matchesIdentity?aft.basis.at:null;
    const retry=part('retry',()=>pmmRodeoDiagRetry(key,settings,now,basisAt),{blocked:null});
    const queue=part('queue',pmmRodeoDiagQueue,{state:'unknown',notInspected:['duplicate-view','paused','page-ready','source-tracking']});
    const blockers=part('readiness',()=>pmmRodeoDiagBlockers(identity,id,aft,helper,retry,queue),[]);
    const kept={};
    const snap=b=>id&&id.site==='LGA9'?part('snapshot-'+b,()=>pmmRodeoDiagSnapshot(id,b,full,basisAt,settings,now,b==='aggregate'?kept:null),{present:false,selection:'unavailable'}):{present:false,selection:'not-applicable'};
    const aggregate=snap('aggregate'),items=snap('items');
    const filters=part('filters',pmmRodeoDiagFilters);
    let stations=null;
    if(full&&aggregate.present&&kept.s)stations=part('stations',()=>pmmRodeoDiagStations(kept.s,filters||{},D));
    const history=part('history',()=>pmmRodeoDiagHistory(key,full,now),{status:'unavailable',events:[]});
    // 4.1.1.6: read-only registration evidence (03i); module absence is reported, never inferred as no acknowledgement.
    const registration=part('registration',()=>typeof pmmRodeoRegDiagExport==='function'?pmmRodeoRegDiagExport(key,now):{schema:'pmm-rodeo-registration-v1',state:'module-unavailable',active:null,retained:null},{schema:'pmm-rodeo-registration-v1',state:'unavailable',active:null,retained:null});
    const prediscovery=part('prediscovery',()=>typeof pmmRodeoPrediagExport==='function'?pmmRodeoPrediagExport(key,now):{schema:'pmm-rodeo-prediscovery-v1',state:'module-unavailable',active:null,retained:null},{schema:'pmm-rodeo-prediscovery-v1',state:'unavailable',active:null,retained:null});
    return {schema:D.schema,available:true,mode:full?'full':'summary',capturedAt:now,identity:ident,settings,aft,
      readiness:pmmRodeoDiagReadiness(blockers,queue,aft,retry),helper,retry,
      snapshot:{aggregate,items},filters,stations,history,registration,prediscovery,sectionErrors:failed};
  }

  // 4.1.1.9: guarded 03j notes count this module's write outcomes (write-returned is not verified persistence).
  // 4.1.1.6: observational registration evidence for one Rodeo helper job. Declarations only.
  // Never decides, retries, waits or adds promise turns. The helper writes one bounded record per job
  // under its own GM namespace (keyed by the job token, which is never stored inside or exported); the
  // AFT monitor copies a sanitized summary into this tab's sessionStorage before its existing cleanup.
  // Every value is an allowlisted enum or bounded integer; no URL, token, owner, error text or record copy.
  function pmmRodeoRegDiagSpec(){
    return {prefix:'pmm-rodeo-regdiag-v1:',store:'pmm-rodeo-regdiag-last-v1',schema:'pmm-rodeo-registration-v1',
      maxSteps:24,keepFirst:6,maxVis:12,maxDocs:9,maxChars:4096,maxStoreChars:16384,maxEntries:6,maxMs:600000,maxAgeMs:86400000,futureMs:60000,
      steps:['helper-start','return-start','lock','resume-lock','job-check','claim-write','get-tab','save-tab','tab-readback','register-write',
        'bind-check','bind-write','bind-readback','bound','return-get-tab','return-record','return-control','route','resume-get-tab','resume-check','resume-write','route-restore','work','stop'],
      outcomes:['ok','timeout','late','exception','read-exception','missing','mismatch','invalid','not-held','existing','expired','unsupported','terminal','non-terminal'],
      vis:['initial-visible','initial-hidden','visible','hidden','pagehide','pagehide-persisted','pageshow','pageshow-persisted'],
      fails:['registration','route','resume','bind','api'],
      phases:['success','no-snapshot','startup','registration','route','resume','bind','api','return','stopped'],
      ends:['done','failed','timeout','pagehide','cancelled']};
  }
  function pmmRodeoRegDiagInt(v,max){return Number.isSafeInteger(v)&&v>=0&&v<=max?v:null;}
  function pmmRodeoRegDiagClamp(v,max){return Number.isFinite(v)?Math.min(max,Math.max(0,Math.round(v))):0;}
  function pmmRodeoRegDiagKey(token){return typeof token==='string'&&/^[a-f0-9]{32}$/.test(token)?pmmRodeoRegDiagSpec().prefix+token:null;}
  // Plain record (any realm: GM values may be cloned across sandboxes) with only known own keys and bounded
  // arrays, checked before any field is used. Key enumeration stops at the first unknown or surplus key.
  function pmmRodeoRegDiagShape(r){
    const D=pmmRodeoRegDiagSpec(),keys=['v','site','vrid','created','expires','docs','ack','fail','steps','vis','dropped'];
    if(!r||typeof r!=='object'||Array.isArray(r)||Object.prototype.toString.call(r)!=='[object Object]')return false;
    const p=Object.getPrototypeOf(r);
    if(p!==null&&Object.getPrototypeOf(p)!==null)return false;
    let n=0;
    for(const k in r){if(!Object.prototype.hasOwnProperty.call(r,k))return false;if(++n>keys.length||!keys.includes(k))return false;}
    return Array.isArray(r.steps)&&Array.isArray(r.vis)&&r.steps.length<=D.maxSteps&&r.vis.length<=D.maxVis;
  }
  function pmmRodeoRegDiagSame(r,job){
    return pmmRodeoRegDiagShape(r)&&r.v===1&&r.site===job.site&&r.vrid===job.vrid&&r.created===job.created&&r.expires===job.expires;
  }
  function pmmRodeoRegDiagStep(x){
    const D=pmmRodeoRegDiagSpec();
    if(!x||typeof x!=='object'||Array.isArray(x)||!D.steps.includes(x.s)||!D.outcomes.includes(x.o))return null;
    const t=pmmRodeoRegDiagInt(x.t,D.maxMs),d=pmmRodeoRegDiagInt(x.d,D.maxMs),n=pmmRodeoRegDiagInt(x.n,D.maxDocs);
    return t===null||d===null||n===null||n<1?null:{s:x.s,o:x.o,t,d,n};
  }
  function pmmRodeoRegDiagVisOne(x){
    const D=pmmRodeoRegDiagSpec();
    if(!x||typeof x!=='object'||Array.isArray(x)||!D.vis.includes(x.e))return null;
    const t=pmmRodeoRegDiagInt(x.t,D.maxMs),n=pmmRodeoRegDiagInt(x.n,D.maxDocs);
    return t===null||n===null?null:{e:x.e,t,n};
  }
  // Rebuilds a record from allowlisted fields only; anything else is dropped and counted, never echoed.
  function pmmRodeoRegDiagClean(r,job){
    const D=pmmRodeoRegDiagSpec();
    if(!pmmRodeoRegDiagSame(r,job))return null;
    const steps=[],vis=[];let bad=0;
    for(const x of r.steps){const c=pmmRodeoRegDiagStep(x);if(c)steps.push(c);else bad++;}
    for(const x of r.vis){const c=pmmRodeoRegDiagVisOne(x);if(c)vis.push(c);else bad++;}
    const drop=r.dropped&&typeof r.dropped==='object'&&!Array.isArray(r.dropped)?r.dropped:{};
    return {v:1,site:job.site,vrid:job.vrid,created:job.created,expires:job.expires,docs:pmmRodeoRegDiagInt(r.docs,D.maxDocs)||0,
      ack:pmmRodeoRegDiagInt(r.ack,D.maxMs),fail:D.fails.includes(r.fail)?r.fail:null,steps,vis,
      dropped:{steps:pmmRodeoRegDiagInt(drop.steps,1e6)||0,vis:pmmRodeoRegDiagInt(drop.vis,1e6)||0,invalid:(pmmRodeoRegDiagInt(drop.invalid,1e6)||0)+bad}};
  }
  function pmmRodeoRegDiagFresh(job){
    return {v:1,site:job.site,vrid:job.vrid,created:job.created,expires:job.expires,docs:0,ack:null,fail:null,steps:[],vis:[],dropped:{steps:0,vis:0,invalid:0}};
  }
  // Keeps the first steps (start/registration) and the most recent ones; the gap is counted.
  function pmmRodeoRegDiagBound(r){
    const D=pmmRodeoRegDiagSpec();
    const trim=()=>{if(r.steps.length>D.maxSteps){const n=r.steps.length-D.maxSteps;r.steps.splice(D.keepFirst,n);r.dropped.steps+=n;}
      if(r.vis.length>D.maxVis){const n=r.vis.length-D.maxVis;r.vis.splice(1,n);r.dropped.vis+=n;}};
    trim();let text=JSON.stringify(r);
    while(text.length>D.maxChars&&(r.steps.length>D.keepFirst||r.vis.length>1)){
      if(r.steps.length>D.keepFirst){r.steps.splice(D.keepFirst,1);r.dropped.steps++;}else{r.vis.splice(1,1);r.dropped.vis++;}
      text=JSON.stringify(r);
    }
    return text.length<=D.maxChars?r:null;
  }
  // Read-modify-write of this job's own record; never reads job, control or tab state. Only a helper or
  // return start, right after the existing job/control validation, may create the record. Every later note
  // needs the matching record, which the monitor deletes on its existing cleanup, so a late or stopped
  // callback cannot recreate evidence for a cancelled or finished job. Duplicate documents may interleave.
  function pmmRodeoRegDiagUpdate(ctx,edit,create){
    try{
      const job=ctx?.job,key=pmmRodeoRegDiagKey(job?.token);
      if(!key||!job||typeof job.site!=='string'||!Number.isSafeInteger(job.created)||!Number.isSafeInteger(job.expires)){try{if(typeof pmmRodeoStartupDiagWrite==='function')pmmRodeoStartupDiagWrite('no-job');}catch(_){}return false;}
      const D=pmmRodeoRegDiagSpec();
      let raw=null;try{raw=GM_getValue(key,null);}catch(_){try{if(typeof pmmRodeoStartupDiagWrite==='function')pmmRodeoStartupDiagWrite('read-exception');}catch(_){}return false;}
      let r=raw!==null&&raw!==undefined?pmmRodeoRegDiagClean(raw,job):null;
      if(!r){if(!create){try{if(typeof pmmRodeoStartupDiagWrite==='function')pmmRodeoStartupDiagWrite('missing');}catch(_){}return false;}const bad=raw!==null&&raw!==undefined;r=pmmRodeoRegDiagFresh(job);if(bad)r.dropped.invalid++;}
      if(!pmmRodeoRegDiagInt(ctx.diagDoc,D.maxDocs)||ctx.diagDoc<1){ctx.diagDoc=Math.min(D.maxDocs,r.docs+1);}
      r.docs=Math.max(r.docs,ctx.diagDoc);
      edit(r,pmmRodeoRegDiagClamp(Date.now()-job.created,D.maxMs));
      const out=pmmRodeoRegDiagBound(r);if(!out){try{if(typeof pmmRodeoStartupDiagWrite==='function')pmmRodeoStartupDiagWrite('invalid');}catch(_){}return false;}
      GM_setValue(key,out);
      try{if(typeof pmmRodeoStartupDiagWrite==='function')pmmRodeoStartupDiagWrite('write-returned');}catch(_){}
      return true;
    }catch(_){try{if(typeof pmmRodeoStartupDiagWrite==='function')pmmRodeoStartupDiagWrite('exception');}catch(_){}return false;}
  }
  // Notes need the exact job already validated by the existing operation; before that nothing is kept.
  function pmmRodeoRegDiagNote(ctx,step,outcome,startedAt){
    try{
      const D=pmmRodeoRegDiagSpec();
      if(!ctx||typeof ctx!=='object'||!ctx.job||!D.steps.includes(step)||!D.outcomes.includes(outcome)){try{if(typeof pmmRodeoStartupDiagWrite==='function')pmmRodeoStartupDiagWrite('no-job');}catch(_){}return false;}
      const d=pmmRodeoRegDiagClamp(Number.isSafeInteger(startedAt)?Date.now()-startedAt:0,D.maxMs),start=step==='helper-start'||step==='return-start';
      return pmmRodeoRegDiagUpdate(ctx,(r,t)=>{
        r.steps.push({s:step,o:outcome,t,d,n:ctx.diagDoc});
        if(start&&r.ack===null)r.ack=t;
      },start);
    }catch(_){return false;}
  }
  function pmmRodeoRegDiagFail(ctx,code){
    try{
      if(!pmmRodeoRegDiagSpec().fails.includes(code))return false;
      return pmmRodeoRegDiagUpdate(ctx,r=>{if(r.fail===null)r.fail=code;});
    }catch(_){return false;}
  }
  function pmmRodeoRegDiagVisible(ctx,event){
    try{
      if(!pmmRodeoRegDiagSpec().vis.includes(event))return false;
      return pmmRodeoRegDiagUpdate(ctx,(r,t)=>{r.vis.push({e:event,t,n:ctx.diagDoc});});
    }catch(_){return false;}
  }
  // Helper document: initial visibility plus changes, observed only; listeners leave with ctx.cleanup.
  function pmmRodeoRegDiagHelperWatch(ctx){
    try{
      const state=()=>{try{return document.visibilityState;}catch(_){return undefined;}};
      const first=state();
      if(first==='visible'||first==='hidden')pmmRodeoRegDiagVisible(ctx,'initial-'+first);
      const onVis=()=>{const v=state();if(v==='visible'||v==='hidden')pmmRodeoRegDiagVisible(ctx,v);};
      const onShow=e=>{pmmRodeoRegDiagVisible(ctx,e&&e.persisted===true?'pageshow-persisted':'pageshow');};
      // Removal is registered before either add, so a failing second add cannot strand the first listener.
      ctx.cleanup.push(()=>{try{document.removeEventListener('visibilitychange',onVis);}catch(_){}try{window.removeEventListener('pageshow',onShow);}catch(_){}});
      try{document.addEventListener('visibilitychange',onVis);}catch(_){}
      try{window.addEventListener('pageshow',onShow);}catch(_){}
      return true;
    }catch(_){return false;}
  }
  function pmmRodeoRegDiagPagehide(ctx,e){
    try{return pmmRodeoRegDiagVisible(ctx,e&&e.persisted===true?'pagehide-persisted':'pagehide');}catch(_){return false;}
  }
  // AFT monitor: visibility of the launching tab while its helper job is active, kept in memory only.
  function pmmRodeoRegDiagMonitorWatch(created){
    const D=pmmRodeoRegDiagSpec(),w={created,vis:[],dropped:0,stop:()=>{}};
    try{
      const add=e=>{try{if(w.vis.length<D.maxVis)w.vis.push({e,t:pmmRodeoRegDiagClamp(Date.now()-created,D.maxMs)});else w.dropped++;}catch(_){}};
      const onVis=()=>{try{const v=document.visibilityState;if(v==='visible'||v==='hidden')add(v);}catch(_){}};
      w.stop=()=>{w.stop=()=>{};try{document.removeEventListener('visibilitychange',onVis);}catch(_){}};
      let first;try{first=document.visibilityState;}catch(_){}
      if(first==='visible'||first==='hidden')add('initial-'+first);
      document.addEventListener('visibilitychange',onVis);
    }catch(_){}
    return w;
  }
  function pmmRodeoRegDiagJobOf(key,active){
    const m=typeof key==='string'?/^(LGA9):([A-Z0-9]{6,20})$/.exec(key):null;
    if(!m||!active||typeof active!=='object'||!pmmRodeoRegDiagKey(active.token)||!Number.isSafeInteger(active.created))return null;
    return {token:active.token,site:m[1],vrid:m[2],created:active.created,expires:active.created+pmmRodeoSnapshotSpec().ttl};
  }
  // Reads (never writes) the helper record for the monitor's own active job.
  // received: helper acknowledged; none: no record; rejected: record failed validation; unavailable: read failed.
  function pmmRodeoRegDiagRead(key,active){
    const job=pmmRodeoRegDiagJobOf(key,active);
    if(!job)return {evidence:'unavailable',record:null};
    let raw;
    try{raw=GM_getValue(pmmRodeoRegDiagKey(job.token),null);}catch(_){return {evidence:'unavailable',record:null};}
    if(raw===null||raw===undefined)return {evidence:'none',record:null};
    try{
      // Only the rebuilt record is serialized; the raw value is never traversed beyond its known fields.
      const r=pmmRodeoRegDiagClean(raw,job);
      if(!r||JSON.stringify(r).length>pmmRodeoRegDiagSpec().maxChars)return {evidence:'rejected',record:null};
      return {evidence:r.ack===null?'none':'received',record:r};
    }catch(_){return {evidence:'rejected',record:null};}
  }
  function pmmRodeoRegDiagAckText(evidence){
    return ({received:'helper acknowledgement received',none:'no helper acknowledgement received',rejected:'helper evidence rejected as invalid',unavailable:'helper evidence unavailable'})[evidence]||'helper evidence unavailable';
  }
  // Fixed export shape; first non-ok step is an observation, never a cause.
  function pmmRodeoRegDiagSummary(read,extra){
    const D=pmmRodeoRegDiagSpec(),r=read&&read.record,evidence=['received','none','rejected','unavailable'].includes(read&&read.evidence)?read.evidence:'unavailable';
    const steps=r?r.steps.map(x=>({step:x.s,outcome:x.o,atMs:x.t,durationMs:x.d,document:x.n})):[];
    const first=steps.find(x=>x.outcome!=='ok');
    const mv=extra&&Array.isArray(extra.monitorVis)?extra.monitorVis.slice(0,D.maxVis).filter(x=>x&&D.vis.includes(x.e)&&pmmRodeoRegDiagInt(x.t,D.maxMs)!==null).map(x=>({event:x.e,atMs:x.t})):[];
    const md=pmmRodeoRegDiagInt(extra&&extra.monitorDropped,1e6)||0;
    return {helperEvidence:evidence,helperAcknowledgement:pmmRodeoRegDiagAckText(evidence),acknowledgedAtMs:r?r.ack:null,documents:r?r.docs:0,
      helperFailure:r?r.fail:null,steps,firstNonOkStep:first?{step:first.step,outcome:first.outcome}:null,
      helperVisibility:r?r.vis.map(x=>({event:x.e,atMs:x.t,document:x.n})):[],monitorVisibility:mv,
      dropped:r?{steps:r.dropped.steps,visibility:r.dropped.vis,invalid:r.dropped.invalid,monitorVisibility:md}:{steps:0,visibility:0,invalid:0,monitorVisibility:md}};
  }
  // Monitor: read the helper record before existing cleanup deletes it. Read-only.
  function pmmRodeoRegDiagTake(key,active){
    try{return pmmRodeoRegDiagRead(key,active);}catch(_){return {evidence:'unavailable',record:null};}
  }
  function pmmRodeoRegDiagEntryClean(e,now){
    const D=pmmRodeoRegDiagSpec();
    try{
      if(!e||typeof e!=='object'||Array.isArray(e)||typeof e.k!=='string'||!/^LGA9:[A-Z0-9]{6,20}$/.test(e.k))return null;
      if(!Number.isSafeInteger(e.startedAt)||!Number.isSafeInteger(e.endedAt)||e.startedAt<=0||e.endedAt<e.startedAt||e.endedAt>now+D.futureMs||now-e.endedAt>D.maxAgeMs||e.endedAt-e.startedAt>D.maxMs)return null;
      if(!D.phases.includes(e.phase)||!D.ends.includes(e.end))return null;
      const job={site:'LGA9',vrid:e.k.slice(5),created:e.startedAt,expires:e.startedAt+pmmRodeoSnapshotSpec().ttl};
      const rec=e.r===null?null:pmmRodeoRegDiagClean(e.r,job);
      if(e.r!==null&&!rec)return null;
      // Evidence class must agree with the record: received needs an acknowledged record, none an unacknowledged
      // record or none at all, rejected/unavailable no record. Contradictory stored entries are dropped.
      const ok=e.ev==='received'?!!rec&&rec.ack!==null:e.ev==='none'?!rec||rec.ack===null:(e.ev==='rejected'||e.ev==='unavailable')&&!rec;
      if(!ok)return null;
      const mv=Array.isArray(e.mv)&&e.mv.length<=D.maxVis?e.mv.filter(x=>x&&typeof x==='object'&&D.vis.includes(x.e)&&pmmRodeoRegDiagInt(x.t,D.maxMs)!==null).map(x=>({e:x.e,t:x.t})):[];
      return {k:e.k,startedAt:e.startedAt,endedAt:e.endedAt,phase:e.phase,end:e.end,ev:e.ev,r:rec,mv,md:pmmRodeoRegDiagInt(e.md,1e6)||0};
    }catch(_){return null;}
  }
  function pmmRodeoRegDiagLoad(now){
    const D=pmmRodeoRegDiagSpec();let raw;
    try{if(typeof sessionStorage==='undefined')return {status:'unavailable',entries:[],discarded:0};raw=sessionStorage.getItem(D.store);}catch(_){return {status:'unreadable',entries:[],discarded:0};}
    if(raw===null||raw===undefined)return {status:'empty',entries:[],discarded:0};
    if(typeof raw!=='string'||raw.length>D.maxStoreChars)return {status:'oversize',entries:[],discarded:0};
    let j;try{j=JSON.parse(raw);}catch(_){return {status:'corrupt',entries:[],discarded:0};}
    if(!j||typeof j!=='object'||j.v!==1||!Array.isArray(j.entries)||j.entries.length>D.maxEntries*2)return {status:'corrupt',entries:[],discarded:0};
    const entries=[];for(const e of j.entries){const c=pmmRodeoRegDiagEntryClean(e,now);if(c)entries.push(c);}
    entries.sort((a,b)=>a.endedAt-b.endedAt);
    const kept=entries.slice(-D.maxEntries),discarded=j.entries.length-kept.length;
    return {status:discarded?'partial':'ok',entries:kept,discarded};
  }
  // Monitor: keep one bounded summary of the finished attempt in this tab's own diagnostic scope.
  // Storage failure is swallowed; the caller's outcome handling has already been decided.
  function pmmRodeoRegDiagRetain(key,active,read,phase,end,watch){
    try{
      const D=pmmRodeoRegDiagSpec(),now=Date.now();
      if(typeof sessionStorage==='undefined'||!active||typeof active!=='object')return false;
      const e=pmmRodeoRegDiagEntryClean({k:key,startedAt:active.created,endedAt:now,phase,end,ev:read&&read.evidence,r:read&&read.record?read.record:null,mv:watch&&Array.isArray(watch.vis)?watch.vis:[],md:watch?watch.dropped:0},now);
      if(!e)return false;
      const prior=pmmRodeoRegDiagLoad(now);if(prior.status==='unreadable'||prior.status==='unavailable')return false;
      let entries=[...prior.entries,e].slice(-D.maxEntries),text=JSON.stringify({v:1,entries});
      while(text.length>D.maxStoreChars&&entries.length>1){entries=entries.slice(1);text=JSON.stringify({v:1,entries});}
      if(text.length>D.maxStoreChars)return false;
      sessionStorage.setItem(D.store,text);
      return true;
    }catch(_){return false;}
  }
  function pmmRodeoRegDiagEntryOut(e){
    if(!e)return null;
    return {startedAt:e.startedAt,endedAt:e.endedAt,durationMs:e.endedAt-e.startedAt,phase:e.phase,end:e.end,...pmmRodeoRegDiagSummary({evidence:e.ev,record:e.r},{monitorVis:e.mv,monitorDropped:e.md})};
  }
  // Export: read-only. Active evidence is read only for the monitor's own current job of this VRID.
  function pmmRodeoRegDiagExport(key,now){
    const D=pmmRodeoRegDiagSpec(),out={schema:D.schema,state:'available',active:null,retained:null};
    try{
      const s=typeof pmmRodeoSnapshotState==='function'?pmmRodeoSnapshotState.value:undefined,a=s&&typeof s==='object'?s.active:null;
      if(a&&typeof a==='object'&&typeof key==='string'&&s.key===key){
        const read=pmmRodeoRegDiagRead(key,a),w=a.regWatch;
        out.active={startedAt:Number.isSafeInteger(a.created)?a.created:null,elapsedMs:Number.isSafeInteger(a.created)&&a.created<=now?now-a.created:null,
          ...pmmRodeoRegDiagSummary(read,{monitorVis:w&&Array.isArray(w.vis)?w.vis:[],monitorDropped:w?w.dropped:0})};
      }
    }catch(_){out.active={helperEvidence:'unavailable',helperAcknowledgement:pmmRodeoRegDiagAckText('unavailable')};}
    // 4.1.1.7: project only the already retained, validated entries. No added recording or retention.
    // Legacy lastFailure deliberately keeps its non-success meaning, including stopped attempts.
    const selection={scope:'current-vrid',order:'endedAt-ascending',lastFailure:'legacy-non-success',
      lastActualFailure:'failure-phase-excluding-cancellation',lastCancellation:'stopped-or-cancelled-or-pagehide'};
    try{
      const h=pmmRodeoRegDiagLoad(now),mine=typeof key==='string'?h.entries.filter(e=>e.k===key):[];
      const lastAttempt=mine.length?mine[mine.length-1]:null,fails=mine.filter(e=>e.phase!=='success');
      const actualFails=mine.filter(e=>['no-snapshot','startup','registration','route','resume','bind','api','return'].includes(e.phase)&&e.end!=='cancelled'&&e.end!=='pagehide');
      const cancellations=mine.filter(e=>e.phase==='stopped'||e.end==='cancelled'||e.end==='pagehide');
      out.retained={status:h.status,storedAttempts:h.entries.length,discarded:h.discarded,otherVrids:new Set(h.entries.filter(e=>e.k!==key).map(e=>e.k)).size,maxAttempts:D.maxEntries,
        lastAttempt:pmmRodeoRegDiagEntryOut(lastAttempt),lastFailure:pmmRodeoRegDiagEntryOut(fails.length?fails[fails.length-1]:null),
        selection,attempts:mine.map(e=>pmmRodeoRegDiagEntryOut(e)),
        lastActualFailure:pmmRodeoRegDiagEntryOut(actualFails.length?actualFails[actualFails.length-1]:null),
        lastCancellation:pmmRodeoRegDiagEntryOut(cancellations.length?cancellations[cancellations.length-1]:null)};
    }catch(_){out.retained={status:'unavailable',selection,attempts:[],lastActualFailure:null,lastCancellation:null};}
    return out;
  }
  // PMM-CHUNK-BEGIN rodeo-startup-diagnostic
  // 4.1.1.9: page-local startup evidence for one top-frame Rodeo document. Declarations only: the Rodeo
  // entry runs before this chunk's position, so state lives in a closure created by pmmRodeoStartupDiagBegin.
  // Notes carry outcomes the caller already computed; this module never reads page, storage, URL or job
  // state and never decides. The page string is page-spoofable, best-effort and not authoritative.
  // No timers, listeners or promises: the 120-second window and 256-event budget are checked lazily per note.
  function pmmRodeoStartupDiagSpec(){
    return {schema:'pmm-rodeo-startup-v1',property:'__pmmRodeoStartupDiagnostic419__',windowMs:120000,maxMs:600000,
      first:8,last:40,maxAdmitted:256,maxChars:12288,maxCount:1000000,
      steps:['entry','entry-end','feeder-origin','frame','sentinel','hook-fetch','hook-open','hook-send','branch','manual','feeder-bind',
        'cont-start','start-route','retry','retry-left','return-api','return-tab-read','return-tab','return-job','return-control-read','return-ordinary',
        'fail','pagehide','watch','regdiag-write','window',
        'helper-start','return-start','lock','resume-lock','job-check','claim-write','get-tab','save-tab','tab-readback','register-write',
        'bind-check','bind-write','bind-readback','bound','return-get-tab','return-record','return-control','route','resume-get-tab',
        'resume-check','resume-write','route-restore','work','stop'],
      outcomes:['ok','timeout','late','exception','read-exception','missing','mismatch','invalid','not-held','existing','expired','unsupported',
        'terminal','non-terminal','not-top','present','skipped','return','mounted','deferred','hooks-missing','rejected','job','delayed','opaque',
        'manual','none','registration','route','resume','bind','api','write-returned','no-job','ended'],
      writes:['write-returned','no-job','read-exception','missing','invalid','exception']};
  }
  // Boot-only: called once from the top-frame Rodeo entry. A second call in the same realm is ignored.
  function pmmRodeoStartupDiagBegin(version){
    try{
      if(typeof pmmRodeoStartupDiagNote.sink==='function')return false;
      // Builtins are captured once here; a later replacement cannot redirect this private clock or publisher.
      const D=pmmRodeoStartupDiagSpec(),define=Object.defineProperty,dateNow=Date.now,isInt=Number.isSafeInteger;
      const clock=()=>{try{const t=dateNow.call(Date);return isInt(t)?t:null;}catch(_){return null;}};
      const sat=n=>n<D.maxCount?n+1:n;
      const clamp=(v,max)=>v<0?0:v>max?max:v;
      const t0=clock(),build=typeof version==='string'&&/^\d{1,3}(?:\.\d{1,3}){1,3}$/.test(version)?version:'unknown';
      let page=null;try{page=typeof pmmRodeoFeederPage==='function'?pmmRodeoFeederPage():null;}catch(_){page=null;}
      // Plain index loops and assignments only, so a hostile Array/JSON prototype cannot redirect bookkeeping.
      const find=(list,x)=>{for(let i=0;i<list.length;i++)if(list[i]===x)return i;return -1;};
      const head=[],ring=[],writes=[];for(let i=0;i<D.writes.length;i++)writes[i]=0;
      let headLen=0,ringStart=0,ringLen=0;
      let state='collecting',time=t0===null?'unavailable':'ok',admitted=0,omitted=0,invalid=0,published=0,publishFailures=0,lastAt=0;
      const event=e=>'{"s":"'+e.s+'","o":"'+e.o+'","t":'+e.t+(e.d===null?'':',"d":'+e.d)+'}';
      const text=()=>{
        let w='',ev='';
        for(let i=0;i<D.writes.length;i++)w+=(i?',':'')+'"'+D.writes[i]+'":'+writes[i];
        for(let i=0;i<headLen;i++)ev+=(i?',':'')+event(head[i]);
        for(let i=0;i<ringLen;i++)ev+=(headLen||i?',':'')+event(ring[(ringStart+i)%D.last]);
        return '{"schema":"'+D.schema+'","build":"'+build+'","state":"'+state+'","clock":"'+time+'","windowMs":'+D.windowMs
          +',"limits":{"first":'+D.first+',"last":'+D.last+',"admitted":'+D.maxAdmitted+',"chars":'+D.maxChars+'}'
          +',"admitted":'+admitted+',"omitted":'+omitted+',"invalid":'+invalid+',"published":'+published+',"publishFailures":'+publishFailures
          +',"lastAtMs":'+lastAt+',"writes":{'+w+'},"events":['+ev+']}';
      };
      const dropOldest=()=>{ringStart=(ringStart+1)%D.last;ringLen--;omitted=sat(omitted);};
      const publish=()=>{
        try{
          let s=text();
          while(s.length>D.maxChars&&ringLen>0){dropOldest();s=text();}
          if(s.length>D.maxChars||!page){publishFailures=sat(publishFailures);return;}
          // Data descriptor with a null prototype: no page setter or inherited accessor field is consulted.
          define(page,D.property,{__proto__:null,value:s,writable:false,enumerable:false,configurable:true});
          published=sat(published);
        }catch(_){publishFailures=sat(publishFailures);}
      };
      // Elapsed time since injection, or null once the window has lapsed (collection then stops for good).
      const now=()=>{
        const at=clock();
        if(at===null||t0===null){time='unavailable';return {at:null,t:0};}
        if(at<t0)time='regressed';
        if(at-t0>D.windowMs){endWindow();return null;}
        return {at,t:clamp(at-t0,D.windowMs)};
      };
      // One final publication at the window edge; afterwards every note returns before any work.
      const endWindow=()=>{state='window-ended';admit('window','ended',null,{at:null,t:D.windowMs});};
      const admit=(s,o,startedAt,c)=>{
        const d=c.at!==null&&isInt(startedAt)?clamp(c.at-startedAt,D.maxMs):null;
        const e={s,o,t:c.t,d};
        admitted++;lastAt=c.t;
        if(headLen<D.first)head[headLen++]=e;
        else{if(ringLen===D.last)dropOldest();ring[(ringStart+ringLen)%D.last]=e;ringLen++;}
        if(admitted>=D.maxAdmitted&&state==='collecting')state='exhausted';
        publish();
      };
      const sink=(kind,a,b,startedAt)=>{
        try{
          if(state!=='collecting')return;
          if(kind==='write'){
            const i=typeof a==='string'?find(D.writes,a):-1;
            if(i<0){invalid=sat(invalid);return;}
            const c=now();if(!c)return;
            writes[i]=sat(writes[i]);
            if(writes[i]===1)admit('regdiag-write',a,null,c);
            return;
          }
          if(typeof a!=='string'||typeof b!=='string'||find(D.steps,a)<0||find(D.outcomes,b)<0){invalid=sat(invalid);return;}
          const c=now();if(!c)return;
          admit(a,b,startedAt,c);
        }catch(_){}
      };
      pmmRodeoStartupDiagNote.sink=sink;
      sink('note','entry','ok');
      return true;
    }catch(_){return false;}
  }
  function pmmRodeoStartupDiagNote(step,outcome,startedAt){
    try{const f=pmmRodeoStartupDiagNote.sink;if(typeof f==='function')f('note',step,outcome,startedAt);}catch(_){}
  }
  // 03i registration-evidence write outcome: counted; only the first of each kind becomes an event.
  // write-returned means GM_setValue returned, not verified persistence or cross-tab delivery.
  function pmmRodeoStartupDiagWrite(kind){
    try{const f=pmmRodeoStartupDiagNote.sink;if(typeof f==='function')f('write',kind);}catch(_){}
  }
  // PMM-CHUNK-END rodeo-startup-diagnostic
  // PMM-CHUNK-BEGIN rodeo-prediscovery-diagnostic
  // 4.1.1.10: pre-discovery evidence for one monitor-launched Rodeo helper attempt. Declarations only, because
  // the Rodeo entry runs before this chunk's position; per-document state lives on function properties.
  // The launching AFT monitor seeds pmm-rodeo-prediag-v1:<its own token> before it opens the helper tab. A helper
  // document addresses only a syntactically exact monitor fragment on the report path and only appends fixed-enum
  // events to that existing, valid, unexpired record. It never creates a record, reads job/control/tab state,
  // searches or adopts by VRID, or decides anything. The monitor copies a sanitized summary into this tab's
  // sessionStorage before its own cleanup deletes the record.
  // GM read-modify-write is not atomic: a delete landing between one helper read and its write can be undone by that
  // single write; later calls see no record. The next launch's expiry sweep removes such a remnant.
  // A returned GM_setValue is not proof of persistence, and absent evidence is ambiguous, never proof of absence.
  function pmmRodeoPrediagSpec(){
    return {prefix:'pmm-rodeo-prediag-v1:',store:'pmm-rodeo-prediag-last-v1',schema:'pmm-rodeo-prediscovery-v1',
      ttlMs:90000,futureMs:60000,maxMs:600000,stepMs:10,maxEvents:24,keepFirst:6,maxDocs:8,maxChars:4096,docAdmits:4,
      maxBuffer:8,maxEntries:6,maxStoreChars:16384,maxAgeMs:86400000,maxSweep:256,maxCount:1000000,maxCache:4,
      events:{entry:['ok'],initial:['job','unrecognized'],retry:['job','unrecognized','manual','skipped'],'retry-left':['root','other'],
        recognized:['ok','unsupported'],'return':['unsupported','none','rejected','no-job','no-control','started'],
        pagehide:['before-job','after-job','before-job-persisted','after-job-persisted']},
      phases:['success','no-snapshot','startup','registration','route','resume','bind','api','return','stopped'],
      ends:['done','failed','timeout','pagehide','cancelled'],
      evidence:['observed','seeded-only','missing','rejected','unavailable'],seeds:['write-returned','exception','invalid','unknown']};
  }
  function pmmRodeoPrediagInt(v,max){return Number.isSafeInteger(v)&&v>=0&&v<=max?v:null;}
  function pmmRodeoPrediagSat(n){return n<pmmRodeoPrediagSpec().maxCount?n+1:n;}
  function pmmRodeoPrediagHex(v){return typeof v==='string'&&v.length===32&&/^[a-f0-9]{32}$/.test(v);}
  function pmmRodeoPrediagKey(token){return pmmRodeoPrediagHex(token)?pmmRodeoPrediagSpec().prefix+token:null;}
  function pmmRodeoPrediagNow(){try{const t=Date.now();return Number.isSafeInteger(t)&&t>0?t:null;}catch(_){return null;}}
  function pmmRodeoPrediagPair(e,o){
    const E=pmmRodeoPrediagSpec().events;
    return typeof e==='string'&&Object.prototype.hasOwnProperty.call(E,e)&&typeof o==='string'&&E[e].includes(o);
  }
  // Plain record of any realm: prototype chain of at most one non-null level and exactly the allowlisted keys as own
  // string-keyed data properties (non-enumerable and symbol keys count; a missing key rejects). Returns a
  // null-prototype copy of those own descriptor values, or null; callers read fields only from the copy, never the
  // original or its prototype. No getter, toJSON, Symbol.toStringTag or inherited field is evaluated, and a Proxy's
  // get trap is never reached; its getPrototypeOf/ownKeys/getOwnPropertyDescriptor traps can still run and any throw
  // is swallowed by the caller.
  function pmmRodeoPrediagPlain(r,keys){
    if(!r||typeof r!=='object'||Array.isArray(r))return null;
    const p=Object.getPrototypeOf(r);
    if(p!==null&&Object.getPrototypeOf(p)!==null)return null;
    const own=Reflect.ownKeys(r);
    if(own.length!==keys.length)return null;
    const out=Object.create(null);
    for(const k of own){
      if(typeof k!=='string'||!keys.includes(k))return null;
      const d=Object.getOwnPropertyDescriptor(r,k);if(!d||!('value' in d))return null;
      out[k]=d.value;
    }
    return out;
  }
  function pmmRodeoPrediagEvent(raw,docs){
    const D=pmmRodeoPrediagSpec(),x=pmmRodeoPrediagPlain(raw,['e','o','t','n']);
    if(!x)return null;
    const e=x.e,o=x.o,t=x.t,n=x.n;
    if(!pmmRodeoPrediagPair(e,o)||pmmRodeoPrediagInt(t,D.maxMs)===null||t%D.stepMs!==0||pmmRodeoPrediagInt(n,docs)===null||n<1)return null;
    return {e,o,t,n};
  }
  // Array of any realm whose prototype is array-exotic and two levels above null, with an own data length <= max
  // and own keys that are only length plus canonical indices below it. Slots are copied from own data descriptors and
  // never read with [[Get]], so no index, length or inherited accessor runs; a hole or accessor slot becomes undefined
  // and is counted as one invalid event. A Proxy's getPrototypeOf/ownKeys/getOwnPropertyDescriptor traps can still
  // run (never get); any throw rejects the list.
  function pmmRodeoPrediagList(a,max){
    try{
      if(!Array.isArray(a))return null;
      const p=Object.getPrototypeOf(a),q=p===null?null:Object.getPrototypeOf(p);
      if(!Array.isArray(p)||q===null||Object.getPrototypeOf(q)!==null)return null;
      const ld=Object.getOwnPropertyDescriptor(a,'length'),len=ld&&'value' in ld?pmmRodeoPrediagInt(ld.value,max):null;
      if(len===null)return null;
      const own=Reflect.ownKeys(a);
      if(own.length>len+1)return null;
      for(const k of own)if(k!=='length'&&!(typeof k==='string'&&/^(?:0|[1-9][0-9]*)$/.test(k)&&Number(k)<len))return null;
      const out=[];
      for(let i=0;i<len;i++){const d=Object.getOwnPropertyDescriptor(a,String(i));out.push(d&&'value' in d?d.value:undefined);}
      return out;
    }catch(_){return null;}
  }
  // Rebuilds {docs,events,dropped} from a Plain copy; bad or out-of-order events are dropped and counted.
  function pmmRodeoPrediagBody(r){
    const D=pmmRodeoPrediagSpec();
    if(!r)return null;
    const docs=pmmRodeoPrediagInt(r.docs,D.maxDocs);
    if(docs===null)return null;
    const list=pmmRodeoPrediagList(r.events,D.maxEvents),dr=list&&pmmRodeoPrediagPlain(r.dropped,['events','docs','invalid','clock']);
    if(!dr)return null;
    const c=v=>pmmRodeoPrediagInt(v,D.maxCount)||0;
    const dropped={events:c(dr.events),docs:c(dr.docs),invalid:c(dr.invalid),clock:c(dr.clock)},events=[];
    let last=0;
    for(let i=0;i<list.length;i++){
      const x=pmmRodeoPrediagEvent(list[i],docs);
      if(!x||x.t<last){dropped.invalid=pmmRodeoPrediagSat(dropped.invalid);continue;}
      last=x.t;events.push(x);
    }
    return {docs,events,dropped};
  }
  function pmmRodeoPrediagRecord(raw){
    const D=pmmRodeoPrediagSpec(),r=pmmRodeoPrediagPlain(raw,['v','created','expires','docs','events','dropped']);
    if(!r||r.v!==1)return null;
    const created=r.created,expires=r.expires;
    if(!Number.isSafeInteger(created)||created<=0||expires!==created+D.ttlMs)return null;
    const body=pmmRodeoPrediagBody(r);
    return body?{v:1,created,expires,docs:body.docs,events:body.events,dropped:body.dropped}:null;
  }
  // Keeps the first events (entry/initial outcome) and the most recent ones; the gap is counted.
  function pmmRodeoPrediagBound(r){
    const D=pmmRodeoPrediagSpec();
    if(r.events.length>D.maxEvents){const n=r.events.length-D.maxEvents;r.events.splice(D.keepFirst,n);r.dropped.events=Math.min(D.maxCount,r.dropped.events+n);}
    let text=JSON.stringify(r);
    while(text.length>D.maxChars&&r.events.length>D.keepFirst){r.events.splice(D.keepFirst,1);r.dropped.events=pmmRodeoPrediagSat(r.dropped.events);text=JSON.stringify(r);}
    return text.length<=D.maxChars?r:null;
  }
  // ---- helper document ----
  // Entry/Note/Pagehide only buffer in memory; GM I/O happens only in Flush. 03e calls Flush only after the
  // existing statement of a decided branch has been issued: the startup retry timer, the lock request, Stop,
  // manual(), Return(), ordinary(), Wait() or Fail(); and from the existing pagehide listener after its Stop.
  // A no-job retry at 150ms stays buffered until the next decision or pagehide. The longest path (delayed,
  // root, return outcome) needs three flushes plus pagehide, hence docAdmits 4.
  // n: 0 unassigned, 1..maxDocs assigned, -1 surplus document (no further writes).
  function pmmRodeoPrediagDoc(){
    if(!pmmRodeoPrediagDoc.value)pmmRodeoPrediagDoc.value={token:null,buf:[],lost:0,n:0,admitted:0,closed:false,recognized:false};
    return pmmRodeoPrediagDoc.value;
  }
  function pmmRodeoPrediagQueue(event,outcome){
    const D=pmmRodeoPrediagSpec(),d=pmmRodeoPrediagDoc();
    if(d.closed||d.token===null||d.n<0||!pmmRodeoPrediagPair(event,outcome))return false;
    if(d.buf.length>=D.maxBuffer){d.lost=pmmRodeoPrediagSat(d.lost);return false;}
    d.buf.push({e:event,o:outcome,at:pmmRodeoPrediagNow()});
    return true;
  }
  // One read-validate-append-write of the buffered events per call. At most docAdmits calls per document reach
  // GM; the last one is reserved for pagehide. The buffer is cleared once admitted, whatever the storage outcome.
  function pmmRodeoPrediagFlush(){
    try{
      const D=pmmRodeoPrediagSpec(),d=pmmRodeoPrediagDoc();
      if(d.token===null||d.n<0||!d.buf.length)return false;
      const hide=d.buf[d.buf.length-1].e==='pagehide';
      if(d.admitted>=(hide?D.docAdmits:D.docAdmits-1))return false;
      d.admitted++;
      const buf=d.buf,lost=d.lost;d.buf=[];d.lost=0;
      const key=pmmRodeoPrediagKey(d.token),now=pmmRodeoPrediagNow();
      if(!key||now===null)return false;
      let raw;try{raw=GM_getValue(key,null);}catch(_){return false;}
      if(raw===null||raw===undefined)return false;
      const r=pmmRodeoPrediagRecord(raw);
      if(!r||now>=r.expires||r.created>now+D.futureMs)return false;
      if(d.n===0){
        if(r.docs>=D.maxDocs){d.n=-1;r.dropped.docs=pmmRodeoPrediagSat(r.dropped.docs);const out=pmmRodeoPrediagBound(r);if(out)GM_setValue(key,out);return false;}
        d.n=r.docs+1;
      }
      r.docs=Math.max(r.docs,d.n);
      if(lost)r.dropped.events=Math.min(D.maxCount,r.dropped.events+lost);
      for(const x of buf){
        let t=(x.at===null||x.at>now?now:x.at)-r.created;
        if(t<0){t=0;r.dropped.clock=pmmRodeoPrediagSat(r.dropped.clock);}
        t=Math.min(D.maxMs,Math.floor(t/D.stepMs)*D.stepMs);
        const last=r.events.length?r.events[r.events.length-1].t:0;
        if(t<last){t=last;r.dropped.clock=pmmRodeoPrediagSat(r.dropped.clock);}
        r.events.push({e:x.e,o:x.o,t,n:d.n});
      }
      const out=pmmRodeoPrediagBound(r);if(!out)return false;
      GM_setValue(key,out);
      return true;
    }catch(_){return false;}
  }
  // Binds this document to the fragment token only after the same bounded length check the operational code uses;
  // any other fragment is never read beyond its length. Memory only: no GM call precedes the operational job read.
  function pmmRodeoPrediagEntry(){
    try{
      const d=pmmRodeoPrediagDoc(),P='#pmm-rodeo-snapshot=';
      if(d.token!==null||d.closed)return false;
      if(location.origin!==pmmRodeoSnapshotSpec().origin||location.pathname!=='/LGA9/post'||location.hash.length!==P.length+32)return false;
      const h=location.hash;
      if(typeof h!=='string'||h.slice(0,P.length)!==P)return false;
      const token=h.slice(P.length);
      if(!pmmRodeoPrediagHex(token))return false;
      d.token=token;
      return pmmRodeoPrediagQueue('entry','ok');
    }catch(_){return false;}
  }
  function pmmRodeoPrediagNote(event,outcome){
    try{
      if(event==='entry'||event==='pagehide')return false;
      const d=pmmRodeoPrediagDoc();
      if(!d.closed&&(event==='recognized'||((event==='initial'||event==='retry')&&outcome==='job')))d.recognized=true;
      return pmmRodeoPrediagQueue(event,outcome);
    }catch(_){return false;}
  }
  // Called from the existing pagehide listener after its existing Stop. Destination is unknown; the outcome only
  // says whether this document had read its exact job. Flushes everything buffered and closes the document.
  function pmmRodeoPrediagPagehide(e){
    try{
      const d=pmmRodeoPrediagDoc();if(d.closed)return false;
      let p=false;try{p=!!e&&e.persisted===true;}catch(_){}
      const D=pmmRodeoPrediagSpec();
      if(d.buf.length>=D.maxBuffer){d.buf.pop();d.lost=pmmRodeoPrediagSat(d.lost);}
      pmmRodeoPrediagQueue('pagehide',(d.recognized?'after-job':'before-job')+(p?'-persisted':''));
      d.closed=true;
      return pmmRodeoPrediagFlush();
    }catch(_){return false;}
  }
  // ---- AFT monitor ----
  function pmmRodeoPrediagMap(f){if(!(f.value instanceof Map))f.value=new Map();return f.value;}
  function pmmRodeoPrediagRemember(f,token,v){
    const m=pmmRodeoPrediagMap(f);m.delete(token);m.set(token,v);
    while(m.size>pmmRodeoPrediagSpec().maxCache)m.delete(m.keys().next().value);
  }
  // Seed for the monitor's own new attempt, written before the helper tab is opened.
  function pmmRodeoPrediagSeed(token,created){
    const D=pmmRodeoPrediagSpec();let seed='invalid';
    try{
      const key=pmmRodeoPrediagKey(token);
      if(key&&Number.isSafeInteger(created)&&created>0){
        seed='exception';
        GM_setValue(key,{v:1,created,expires:created+D.ttlMs,docs:0,events:[],dropped:{events:0,docs:0,invalid:0,clock:0}});
        seed='write-returned';
      }
    }catch(_){}
    try{if(pmmRodeoPrediagHex(token))pmmRodeoPrediagRemember(pmmRodeoPrediagSeed,token,{created,seed});}catch(_){}
    return seed==='write-returned';
  }
  function pmmRodeoPrediagSeedOf(token,created){
    try{
      const m=pmmRodeoPrediagSeed.value,s=m instanceof Map?m.get(token):undefined;
      return s&&s.created===created&&pmmRodeoPrediagSpec().seeds.includes(s.seed)?s.seed:'unknown';
    }catch(_){return 'unknown';}
  }
  // Read-only classification of the record for the monitor's exact attempt.
  function pmmRodeoPrediagRead(active){
    const D=pmmRodeoPrediagSpec();
    const token=active&&typeof active==='object'?active.token:null,created=active&&typeof active==='object'?active.created:null;
    const key=pmmRodeoPrediagKey(token),seed=key?pmmRodeoPrediagSeedOf(token,created):'unknown';
    if(!key||!Number.isSafeInteger(created))return {evidence:'unavailable',seed,record:null};
    let raw;try{raw=GM_getValue(key,null);}catch(_){return {evidence:'unavailable',seed,record:null};}
    if(raw===null||raw===undefined)return {evidence:'missing',seed,record:null};
    try{
      const r=pmmRodeoPrediagRecord(raw);
      if(!r||r.created!==created)return {evidence:'rejected',seed,record:null};
      const record={docs:r.docs,events:r.events,dropped:r.dropped};
      if(JSON.stringify(record).length>D.maxChars)return {evidence:'rejected',seed,record:null};
      return {evidence:r.docs===0&&r.events.length===0?'seeded-only':'observed',seed,record};
    }catch(_){return {evidence:'rejected',seed,record:null};}
  }
  // Existing cancellation/completion teardown: read before the exact record is deleted; retain non-completion here.
  function pmmRodeoPrediagCancelled(key,active,reason){
    try{
      if(!active||typeof active!=='object'||!pmmRodeoPrediagHex(active.token))return false;
      pmmRodeoPrediagRemember(pmmRodeoPrediagCancelled,active.token,{created:active.created,read:pmmRodeoPrediagRead(active)});
      if(reason==='complete')return true;
      return pmmRodeoPrediagRetain(key,active,'stopped',reason==='pagehide'?'pagehide':'cancelled');
    }catch(_){return false;}
  }
  function pmmRodeoPrediagDrop(token){
    try{
      const key=pmmRodeoPrediagKey(token);if(!key)return false;
      try{const m=pmmRodeoPrediagSeed.value;if(m instanceof Map)m.delete(token);}catch(_){}
      GM_deleteValue(key);
      return true;
    }catch(_){return false;}
  }
  // Deletes only expired or malformed records in this namespace, never the current attempt's record.
  function pmmRodeoPrediagSweep(keep){
    try{
      const D=pmmRodeoPrediagSpec(),now=pmmRodeoPrediagNow(),keys=GM_listValues();
      if(now===null||!Array.isArray(keys))return 0;
      const re=/^pmm-rodeo-prediag-v1:[a-f0-9]{32}$/,mine=pmmRodeoPrediagKey(keep);let seen=0,removed=0;
      for(let i=0;i<keys.length&&seen<D.maxSweep;i++){
        const k=keys[i];
        if(typeof k!=='string'||k.length!==D.prefix.length+32||!re.test(k)||k===mine)continue;
        seen++;
        let r=null;try{r=pmmRodeoPrediagRecord(GM_getValue(k,null));}catch(_){r=null;}
        if(r&&now<r.expires)continue;
        try{GM_deleteValue(k);removed++;}catch(_){}
      }
      return removed;
    }catch(_){return 0;}
  }
  function pmmRodeoPrediagEntryClean(x,now){
    const D=pmmRodeoPrediagSpec();
    try{
      const e=pmmRodeoPrediagPlain(x,['k','startedAt','endedAt','phase','end','ev','seed','r']);
      if(!e)return null;
      const k=e.k,a=e.startedAt,z=e.endedAt,ev=e.ev,raw=e.r;
      if(typeof k!=='string'||!/^LGA9:[A-Z0-9]{6,20}$/.test(k))return null;
      if(!Number.isSafeInteger(a)||!Number.isSafeInteger(z)||a<=0||z<a||z>now+D.futureMs||now-z>D.maxAgeMs||z-a>D.maxMs)return null;
      if(!D.phases.includes(e.phase)||!D.ends.includes(e.end)||!D.evidence.includes(ev)||!D.seeds.includes(e.seed))return null;
      const r=raw===null?null:pmmRodeoPrediagBody(pmmRodeoPrediagPlain(raw,['docs','events','dropped']));
      if(raw!==null&&!r)return null;
      const empty=!!r&&r.docs===0&&r.events.length===0;
      const ok=ev==='observed'?!!r&&!empty:ev==='seeded-only'?empty:!r;
      return ok?{k,startedAt:a,endedAt:z,phase:e.phase,end:e.end,ev,seed:e.seed,r}:null;
    }catch(_){return null;}
  }
  function pmmRodeoPrediagLoad(now){
    const D=pmmRodeoPrediagSpec();let raw;
    try{if(typeof sessionStorage==='undefined')return {status:'unavailable',entries:[],discarded:0};raw=sessionStorage.getItem(D.store);}catch(_){return {status:'unreadable',entries:[],discarded:0};}
    if(raw===null||raw===undefined)return {status:'empty',entries:[],discarded:0};
    if(typeof raw!=='string'||raw.length>D.maxStoreChars)return {status:'oversize',entries:[],discarded:0};
    let j;try{j=JSON.parse(raw);}catch(_){return {status:'corrupt',entries:[],discarded:0};}
    if(!j||typeof j!=='object'||j.v!==1||!Array.isArray(j.entries)||j.entries.length>D.maxEntries*2)return {status:'corrupt',entries:[],discarded:0};
    const entries=[];for(let i=0;i<j.entries.length;i++){const c=pmmRodeoPrediagEntryClean(j.entries[i],now);if(c)entries.push(c);}
    entries.sort((x,y)=>x.endedAt-y.endedAt);
    const kept=entries.slice(-D.maxEntries),discarded=j.entries.length-kept.length;
    return {status:discarded?'partial':'ok',entries:kept,discarded};
  }
  // Retains one bounded summary for the finished attempt in this tab's sessionStorage. Failures are swallowed;
  // the caller's outcome was already decided.
  function pmmRodeoPrediagRetain(key,active,phase,end){
    try{
      const D=pmmRodeoPrediagSpec(),now=pmmRodeoPrediagNow();
      if(now===null||typeof sessionStorage==='undefined'||!active||typeof active!=='object'||!pmmRodeoPrediagHex(active.token))return false;
      const m=pmmRodeoPrediagCancelled.value,c=m instanceof Map?m.get(active.token):undefined;
      if(m instanceof Map)m.delete(active.token);
      const read=c&&c.created===active.created?c.read:{evidence:'unavailable',seed:pmmRodeoPrediagSeedOf(active.token,active.created),record:null};
      const e=pmmRodeoPrediagEntryClean({k:key,startedAt:active.created,endedAt:now,phase,end,ev:read.evidence,seed:read.seed,r:read.record},now);
      if(!e)return false;
      const prior=pmmRodeoPrediagLoad(now);if(prior.status==='unreadable'||prior.status==='unavailable')return false;
      let entries=[...prior.entries,e].slice(-D.maxEntries),text=JSON.stringify({v:1,entries});
      while(text.length>D.maxStoreChars&&entries.length>1){entries=entries.slice(1);text=JSON.stringify({v:1,entries});}
      if(text.length>D.maxStoreChars)return false;
      sessionStorage.setItem(D.store,text);
      return true;
    }catch(_){return false;}
  }
  // Fixed export shape. "not-observed" never means "did not happen".
  function pmmRodeoPrediagSummary(read){
    const D=pmmRodeoPrediagSpec(),r=read&&read.record;
    const evidence=D.evidence.includes(read&&read.evidence)?read.evidence:'unavailable',seed=D.seeds.includes(read&&read.seed)?read.seed:'unknown';
    const events=r?r.events.map(x=>({event:x.e,outcome:x.o,atMs:x.t,document:x.n})):[];
    const saw=f=>events.some(f)?'observed':'not-observed';
    return {evidence,seed,documents:r?r.docs:0,events,
      observations:{reportEntry:saw(x=>x.event==='entry'),
        exactJobRecognized:saw(x=>x.event==='recognized'||((x.event==='initial'||x.event==='retry')&&x.outcome==='job')),
        helperApiUnsupported:saw(x=>(x.event==='recognized'||x.event==='return')&&x.outcome==='unsupported'),
        rootInSameDocument:saw(x=>x.event==='retry-left'&&x.outcome==='root'),pagehideBeforeJob:saw(x=>x.event==='pagehide'&&x.outcome.startsWith('before-job')),
        pagehideAfterJob:saw(x=>x.event==='pagehide'&&x.outcome.startsWith('after-job'))},
      dropped:r?{events:r.dropped.events,documents:r.dropped.docs,invalid:r.dropped.invalid,clockAdjusted:r.dropped.clock}:{events:0,documents:0,invalid:0,clockAdjusted:0}};
  }
  function pmmRodeoPrediagEntryOut(e){
    return e?{startedAt:e.startedAt,endedAt:e.endedAt,durationMs:e.endedAt-e.startedAt,phase:e.phase,end:e.end,...pmmRodeoPrediagSummary({evidence:e.ev,seed:e.seed,record:e.r})}:null;
  }
  // Export: read-only. Active evidence only for the monitor's own exact active token of this VRID; existing
  // .value state only (never an initializer), no listing, no writes.
  function pmmRodeoPrediagExport(key,now){
    const D=pmmRodeoPrediagSpec();
    const out={schema:D.schema,state:'available',absence:'ambiguous',
      limits:{attemptMs:D.ttlMs,events:D.maxEvents,keepFirst:D.keepFirst,documents:D.maxDocs,recordChars:D.maxChars,documentAdmissions:D.docAdmits,
        buffered:D.maxBuffer,retained:D.maxEntries,retainedChars:D.maxStoreChars,retainedAgeMs:D.maxAgeMs,resolutionMs:D.stepMs},active:null,retained:null};
    try{
      const s=typeof pmmRodeoSnapshotState==='function'?pmmRodeoSnapshotState.value:undefined,a=s&&typeof s==='object'?s.active:null;
      if(a&&typeof a==='object'&&typeof key==='string'&&s.key===key){
        const c=a.created;
        out.active={startedAt:Number.isSafeInteger(c)?c:null,elapsedMs:Number.isSafeInteger(c)&&Number.isSafeInteger(now)&&c<=now?now-c:null,...pmmRodeoPrediagSummary(pmmRodeoPrediagRead(a))};
      }
    }catch(_){out.active={evidence:'unavailable'};}
    try{
      const h=pmmRodeoPrediagLoad(now),mine=typeof key==='string'?h.entries.filter(e=>e.k===key):[];
      out.retained={status:h.status,storedAttempts:h.entries.length,discarded:h.discarded,otherVrids:new Set(h.entries.filter(e=>e.k!==key).map(e=>e.k)).size,
        order:'endedAt-ascending',lastAttempt:pmmRodeoPrediagEntryOut(mine.length?mine[mine.length-1]:null),attempts:mine.map(pmmRodeoPrediagEntryOut)};
    }catch(_){out.retained={status:'unavailable',attempts:[],lastAttempt:null};}
    return out;
  }
  // PMM-CHUNK-END rodeo-prediscovery-diagnostic
  // PMM-CHUNK-BEGIN rodeo-frame
  // 4.1.1.12: automated Rodeo snapshots load in one separate offscreen Rodeo iframe owned by the AFT document,
  // never a background tab. The Hunter loader is untouched. Authority is the exact live owned job plus a bounded
  // exact-source/origin postMessage handshake and a frame-only ownership record; frame name, URL, fragment or VRID
  // alone never authorize. The frame never uses GM_getTab/GM_saveTab/GM_openInTab, so Hunter/AFT tab state is not
  // shared. Native sign-in callbacks stay opaque (only path and hash length are read). Embedded Rodeo sign-in is
  // unproven: a blocked frame or sign-in only ends in a bounded unavailable status.
  function pmmRodeoFrameSpec(){
    return {name:'pmm-rodeo-loader',prefix:'pmm-rodeo-frame-v1:',control:'pmm-rodeo-cont-v1:',origin:'https://iad.inbound.rodeo.aft.a2z.com',
      parents:['https://afttransshipmenthub-na.aka.amazon.com','https://transshipmenthub.na.aftx.amazonoperations.app'],
      ackMs:2000,retryMs:150,retries:2,maxLoads:6,tickMs:500,stages:['opened','claimed','bound','returning'],
      keys:['child','created','expires','parent','parentOrigin','returns','site','stage','token','v','vrid']};
  }
  function pmmRodeoFrameHex(v){return typeof v==='string'&&/^[a-f0-9]{32}$/.test(v);}
  function pmmRodeoFrameNonce(){const b=new Uint8Array(16);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');}
  function pmmRodeoFramePlain(d,keys){
    try{
      if(!d||typeof d!=='object'||Array.isArray(d))return false;
      const own=Reflect.ownKeys(d);
      if(own.length!==keys.length||own.some(k=>typeof k!=='string'||!keys.includes(k)))return false;
      return own.every(k=>{const p=Object.getOwnPropertyDescriptor(d,k);return !!p&&'value' in p;});
    }catch(_){return false;}
  }
  // Exact frame ownership record agreeing with the expected job; any other shape is treated as absent.
  function pmmRodeoFrameRecord(token,j){
    try{
      const S=pmmRodeoFrameSpec();
      if(!pmmRodeoFrameHex(token)||!j||j.token!==token)return null;
      const r=GM_getValue(S.prefix+token,null);
      if(!pmmRodeoFramePlain(r,S.keys))return null;
      if(r.v!==1||r.token!==token||r.site!==j.site||r.vrid!==j.vrid||r.created!==j.created||r.expires!==j.expires)return null;
      if(!S.parents.includes(r.parentOrigin)||!S.stages.includes(r.stage)||(r.returns!==0&&r.returns!==1))return null;
      if(r.child!==''&&!pmmRodeoFrameHex(r.child)||r.parent!==''&&!pmmRodeoFrameHex(r.parent))return null;
      return r;
    }catch(_){return null;}
  }
  function pmmRodeoFrameWrite(token,next){
    try{
      GM_setValue(pmmRodeoFrameSpec().prefix+token,next);
      const back=pmmRodeoFrameRecord(token,next);
      return !!back&&pmmRodeoFrameSpec().keys.every(k=>back[k]===next[k]);
    }catch(_){return false;}
  }
  function pmmRodeoFrameMessage(d,t){
    const S={hello:['child','t','token','v'],ack:['child','parent','t','token','v'],return:['child','t','v'],resume:['child','parent','t','token','v']}[t];
    if(!S||!pmmRodeoFramePlain(d,S)||d.v!==1||d.t!=='pmm-rodeo-frame-'+t||!pmmRodeoFrameHex(d.child))return null;
    if(S.includes('token')&&!pmmRodeoFrameHex(d.token))return null;
    if(S.includes('parent')&&!pmmRodeoFrameHex(d.parent))return null;
    return d;
  }

  // ---- AFT (parent) side ----
  function pmmRodeoFrameAvailable(){
    try{
      if(window.top!==window||!pmmRodeoFrameSpec().parents.includes(location.origin))return false;
      if(!(document.body||document.documentElement)||typeof document.createElement!=='function')return false;
      if(typeof MutationObserver!=='function'||typeof window.addEventListener!=='function')return false;
      if(typeof crypto==='undefined'||typeof crypto.getRandomValues!=='function')return false;
      return typeof GM_setValue==='function'&&typeof GM_getValue==='function'&&typeof GM_deleteValue==='function';
    }catch(_){return false;}
  }
  // Returns {close,owned,stage} or null. onFail(code) runs at most once, asynchronously, after the frame is removed.
  function pmmRodeoFrameOpen(job,url,onFail){
    let f=null,key='',closeOnce=null;
    try{
      const S=pmmRodeoFrameSpec();
      // At most one live loader per document: a second open never replaces or kills the active one.
      if(pmmRodeoFrameOpen.active&&pmmRodeoFrameOpen.active.stage()!=='closed')return null;
      if(!pmmRodeoFrameAvailable()||!pmmRodeoSnapshotValidJob(job,job?.token,true)||url!==pmmRodeoSnapshotUrl(job,job.token))return null;
      key=S.prefix+job.token;
      const rec={v:1,token:job.token,site:job.site,vrid:job.vrid,created:job.created,expires:job.expires,parentOrigin:location.origin,stage:'opened',child:'',parent:'',returns:0};
      if(!pmmRodeoFrameWrite(job.token,rec)){try{GM_deleteValue(key);}catch(_){}return null;}
      // A leftover element without a live handle is never adopted.
      const stale=document.getElementById(S.name);if(stale){try{stale.src='about:blank';}catch(_){}try{stale.remove();}catch(_){}}
      const host=document.body||document.documentElement;
      const st={closed:false,stage:'opened',child:'',parent:'',returned:false,loads:0,timer:null,deadline:null,observer:null};
      const live=()=>!st.closed&&!!f&&f.isConnected&&f.parentNode===host;
      const close=()=>{
        if(st.closed)return;st.closed=true;st.stage='closed';
        if(pmmRodeoFrameOpen.active===handle)pmmRodeoFrameOpen.active=null;
        try{clearTimeout(st.timer);}catch(_){}try{clearTimeout(st.deadline);}catch(_){}
        try{st.observer?.disconnect();}catch(_){}
        try{window.removeEventListener('message',onMessage);}catch(_){}
        try{window.removeEventListener('pagehide',close);}catch(_){}
        try{f.removeEventListener('load',onLoad);}catch(_){}
        try{f.src='about:blank';}catch(_){}try{f.remove();}catch(_){}
        try{GM_deleteValue(key);}catch(_){}
      };
      closeOnce=close;
      const handle={close,owned:()=>{try{const x=record();return live()&&jobOwned()&&pmmRodeoFrameHex(st.parent)&&!!x&&x.stage==='bound'&&x.child===st.child&&x.parent===st.parent;}catch(_){return false;}},stage:()=>st.stage};
      const fail=code=>{if(st.closed)return;close();setTimeout(()=>{try{onFail?.(code);}catch(_){}},0);};
      const jobLive=()=>{try{const g=GM_getValue(pmmRodeoSnapshotSpec().prefix+job.token,null);return pmmRodeoSnapshotValidJob(g,job.token,true)&&g.site===job.site&&g.vrid===job.vrid&&g.created===job.created&&g.expires===job.expires;}catch(_){return false;}};
      // Completion check: the monitor reads ownership after the job turned done, so status may be pending or done.
      const jobOwned=()=>{try{const g=GM_getValue(pmmRodeoSnapshotSpec().prefix+job.token,null);return !!g&&g.v===1&&g.token===job.token&&g.transport==='frame'&&g.site===job.site&&g.vrid===job.vrid&&g.created===job.created&&g.expires===job.expires&&Date.now()<g.expires&&(g.status==='pending'||g.status==='done');}catch(_){return false;}};
      const record=()=>pmmRodeoFrameRecord(job.token,job);
      const post=d=>{f.contentWindow.postMessage(d,S.origin);};
      const confirm=(code,ok)=>{
        try{clearTimeout(st.timer);}catch(_){}
        st.timer=setTimeout(()=>{try{if(!st.closed&&!(live()&&jobLive()&&ok(record())))fail(code);}catch(_){fail(code);}},Math.max(0,Math.min(S.ackMs,job.expires-Date.now())));
      };
      function onMessage(e){
        try{
          if(st.closed||!f||!f.contentWindow||e.source!==f.contentWindow||e.origin!==S.origin)return;
          if(!live())return fail('removed');
          const hello=pmmRodeoFrameMessage(e.data,'hello'),back=hello?null:pmmRodeoFrameMessage(e.data,'return');
          if(!hello&&!back)return;
          if(!jobLive())return fail('handshake');
          const r=record();
          if(hello){
            if(st.stage!=='opened'||st.returned)return fail('duplicate');
            // Cross-context GM propagation can lag, so the claim itself is proven by the bound read-back below.
            if(hello.token!==job.token||!r||r.parent!==''||r.returns!==0||!(r.stage==='opened'||r.stage==='claimed'&&r.child===hello.child))return fail('handshake');
            st.child=hello.child;st.parent=pmmRodeoFrameNonce();st.stage='acked';
            post({t:'pmm-rodeo-frame-ack',v:1,token:job.token,child:st.child,parent:st.parent});
            confirm('handshake',x=>{const ok=!!x&&x.stage==='bound'&&x.child===st.child&&x.parent===st.parent&&x.returns===0;if(ok&&st.stage==='acked')st.stage='bound';return ok;});
            return;
          }
          // One native return per attempt. The reply reaches only this exact frame at the Rodeo origin.
          if(st.returned||!['opened','acked','bound'].includes(st.stage))return fail('duplicate');
          if(!r||r.returns!==0||!['opened','claimed','bound'].includes(r.stage))return fail('resume');
          st.returned=true;st.child=back.child;st.parent=pmmRodeoFrameNonce();st.stage='returning';
          post({t:'pmm-rodeo-frame-resume',v:1,token:job.token,child:st.child,parent:st.parent});
          confirm('resume',x=>!!x&&['returning','bound'].includes(x.stage)&&x.child===st.child&&x.parent===st.parent&&x.returns===1);
        }catch(_){fail('handshake');}
      }
      function onLoad(){try{if(st.closed)return;if(!live())return fail('removed');if(++st.loads>S.maxLoads)fail('navigation');}catch(_){fail('navigation');}}
      f=document.createElement('iframe');f.id=S.name;f.name=S.name;f.title='Pallet Movement Monitor Rodeo loader';
      f.setAttribute('aria-hidden','true');f.tabIndex=-1;
      f.style.cssText='position:fixed;left:-10000px;top:0;width:1280px;height:800px;border:0;opacity:0;pointer-events:none;z-index:-1';
      window.addEventListener('message',onMessage);
      window.addEventListener('pagehide',close);
      f.addEventListener('load',onLoad);
      st.observer=new MutationObserver(()=>{if(!st.closed&&!live())fail('removed');});
      st.observer.observe(host,{childList:true});
      // Resource backstop only; the monitor's own 90-second attempt timer decides the outcome.
      st.deadline=setTimeout(close,Math.max(0,job.expires-Date.now())+S.ackMs);
      f.src=url;host.appendChild(f);
      if(!live()){close();return null;}
      pmmRodeoFrameOpen.active=handle;
      return handle;
    }catch(_){
      // Setup failure: one close removes whatever listeners, timers, observer and element already exist; no callback.
      if(closeOnce){try{closeOnce();}catch(_){}}
      else{try{if(f){f.src='about:blank';f.remove();}}catch(_){}try{if(key)GM_deleteValue(key);}catch(_){}}
      return null;
    }
  }

  // ---- Rodeo (child frame) side ----
  // Entry gate only: a matching name never grants authority.
  function pmmRodeoFrameChildGate(){
    try{return window.top!==window&&window.parent===window.top&&location.origin===pmmRodeoFrameSpec().origin&&window.name===pmmRodeoFrameSpec().name;}catch(_){return false;}
  }
  function pmmRodeoFrameAncestor(){
    try{const a=location.ancestorOrigins;if(!a||typeof a.length!=='number')return undefined;return a.length===1?String(a[0]):null;}catch(_){return undefined;}
  }
  function pmmRodeoFrameParentOk(origin){
    if(!pmmRodeoFrameSpec().parents.includes(origin))return false;
    const a=pmmRodeoFrameAncestor();return a===undefined||a===origin;
  }
  // Exact job by token (frame jobs only), compared with an expected identity when given.
  function pmmRodeoFrameJob(token,expect){
    try{
      if(!pmmRodeoFrameHex(token))return null;
      const j=GM_getValue(pmmRodeoSnapshotSpec().prefix+token,null);
      if(!pmmRodeoSnapshotValidJob(j,token,true))return null;
      return expect&&(j.site!==expect.site||j.vrid!==expect.vrid||j.created!==expect.created||j.expires!==expect.expires)?null:j;
    }catch(_){return null;}
  }
  // Stage/fail mirror in the existing control format, for monitor stage reporting and prompt failure only.
  // Never written over a control record owned by another document.
  function pmmRodeoFrameMirror(ctx,stage,resumed,fail,prior){
    try{
      const S=pmmRodeoFrameSpec(),j=ctx.job;
      if(!j||!pmmRodeoFrameHex(ctx.child)||!pmmRodeoFrameJob(j.token,j))return false;
      const key=S.control+j.token,cur=GM_getValue(key,null);
      if(cur!==null&&!(cur&&cur.token===j.token&&(cur.owner===ctx.child||cur.owner===prior)&&cur.fail===undefined))return false;
      const next={v:1,token:j.token,owner:ctx.child,stage,resumed,site:j.site,vrid:j.vrid,created:j.created,expires:j.expires};
      if(fail)next.fail=fail;
      GM_setValue(key,next);return true;
    }catch(_){return false;}
  }
  function pmmRodeoFrameStop(ctx,feeder){
    if(ctx.stopped)return;
    ctx.stopped=true;ctx.bound=false;
    for(const f of ctx.cleanup.splice(0)){try{f();}catch(_){}}
    try{ctx.release?.();}catch(_){}
    if(feeder){try{ctx.stopFeeder?.();}catch(_){}}
  }
  function pmmRodeoFrameFail(ctx,code){
    if(ctx.stopped)return;
    const c=pmmRodeoFrameControl(ctx);
    if(c)pmmRodeoFrameMirror(ctx,c.stage,c.resumed,code);
    pmmRodeoFrameStop(ctx,true);
  }
  function pmmRodeoFrameControl(ctx){
    try{const j=ctx.job,c=j&&GM_getValue(pmmRodeoFrameSpec().control+j.token,null);return c&&c.owner===ctx.child&&c.token===j.token&&c.fail===undefined?c:null;}catch(_){return null;}
  }
  // Waits at most min(2s, job time left) for one exact reply from the direct parent; later replies are ignored.
  function pmmRodeoFrameAsk(ctx,message,targets,accept,expires){
    return new Promise(resolve=>{
      const ms=Math.min(pmmRodeoFrameSpec().ackMs,Number.isSafeInteger(expires)?expires-Date.now():Infinity);
      if(!(ms>0)||ctx.stopped){resolve(null);return;}
      let done=false,timer=null;
      const finish=v=>{if(done)return;done=true;clearTimeout(timer);try{window.removeEventListener('message',on);}catch(_){}resolve(v);};
      const on=e=>{try{if(done||ctx.stopped||e.source!==window.parent||!targets.includes(e.origin))return;const d=accept(e.data);if(d)finish({data:d,origin:e.origin});}catch(_){}};
      ctx.cleanup.push(()=>finish(null));
      window.addEventListener('message',on);
      timer=setTimeout(()=>finish(null),ms);
      try{for(const o of targets)window.parent.postMessage(message,o);}catch(_){finish(null);}
    });
  }
  // Exclusive per-job lock on the Rodeo origin, held until stop; a second document for the job never proceeds.
  function pmmRodeoFrameLock(ctx,token,work){
    let called=false;
    const run=held=>{if(called)return;called=true;Promise.resolve().then(()=>work(held)).catch(()=>pmmRodeoFrameFail(ctx,'api'));};
    try{
      navigator.locks.request(pmmRodeoFrameSpec().prefix+token,{mode:'exclusive',ifAvailable:true},lock=>{
        if(!lock||ctx.stopped){run(false);return undefined;}
        return new Promise(release=>{ctx.release=()=>{ctx.release=null;release();};run(true);});
      }).catch(()=>run(false));
    }catch(_){run(false);}
  }
  function pmmRodeoFrameArm(ctx){
    const t=setTimeout(()=>pmmRodeoFrameStop(ctx,true),Math.max(0,ctx.job.expires-Date.now()));
    ctx.cleanup.push(()=>clearTimeout(t));
  }
  function pmmRodeoFrameBind(ctx,bind,j,returned){
    if(ctx.stopped)return;
    const r=pmmRodeoFrameRecord(j.token,j),at=pmmRodeoSnapshotJob(true);
    // Initial: the claimed record has no parent nonce yet; the acknowledged nonce is written with bound.
    // Return: the returning record already carries the resume nonce.
    if(!pmmRodeoFrameHex(ctx.parent)||!r||!at||at.token!==j.token||at.created!==j.created||r.child!==ctx.child||r.parent!==(returned?ctx.parent:'')||r.parentOrigin!==ctx.parentOrigin||r.stage!==(returned?'returning':'claimed')||r.returns!==ctx.returns){pmmRodeoFrameFail(ctx,'bind');return;}
    if(!pmmRodeoFrameWrite(j.token,{...r,stage:'bound',parent:ctx.parent})){pmmRodeoFrameFail(ctx,'bind');return;}
    if(!returned)pmmRodeoFrameMirror(ctx,'registered',false);
    pmmRodeoFrameMirror(ctx,'bound',returned);
    ctx.bound=true;
    bind(j);
  }
  async function pmmRodeoFrameInitial(ctx,bind,held){
    const j=ctx.job;
    if(!held||ctx.stopped){pmmRodeoFrameStop(ctx,true);return;}
    const r=pmmRodeoFrameRecord(j.token,j);
    let existing;try{existing=GM_getValue(pmmRodeoFrameSpec().control+j.token,null);}catch(_){existing=undefined;}
    if(!pmmRodeoFrameJob(j.token,j)||!r||r.stage!=='opened'||r.child!==''||r.returns!==0||r.parentOrigin!==ctx.parentOrigin||existing!==null){pmmRodeoFrameStop(ctx,true);return;}
    ctx.child=pmmRodeoFrameNonce();
    if(!pmmRodeoFrameWrite(j.token,{...r,stage:'claimed',child:ctx.child})){pmmRodeoFrameStop(ctx,true);return;}
    pmmRodeoFrameMirror(ctx,'claimed',false);
    const reply=await pmmRodeoFrameAsk(ctx,{t:'pmm-rodeo-frame-hello',v:1,token:j.token,child:ctx.child},[ctx.parentOrigin],
      d=>{const m=pmmRodeoFrameMessage(d,'ack');return m&&m.token===j.token&&m.child===ctx.child?m:null;},j.expires);
    if(ctx.stopped)return;
    if(!reply){pmmRodeoFrameFail(ctx,'registration');return;}
    ctx.parent=reply.data.parent;
    pmmRodeoFrameBind(ctx,bind,j,false);
  }
  function pmmRodeoFrameStart(ctx,bind,attempt){
    if(ctx.stopped)return;
    const j=pmmRodeoSnapshotJob(true);
    if(!j){
      if(attempt>=pmmRodeoFrameSpec().retries){pmmRodeoFrameStop(ctx,true);return;}
      const t=setTimeout(()=>pmmRodeoFrameStart(ctx,bind,attempt+1),pmmRodeoFrameSpec().retryMs);
      ctx.cleanup.push(()=>clearTimeout(t));return;
    }
    const r=pmmRodeoFrameRecord(j.token,j);
    if(!r||!pmmRodeoFrameParentOk(r.parentOrigin)){pmmRodeoFrameStop(ctx,true);return;}
    ctx.job=j;ctx.parentOrigin=r.parentOrigin;
    pmmRodeoFrameArm(ctx);
    pmmRodeoFrameLock(ctx,j.token,held=>pmmRodeoFrameInitial(ctx,bind,held));
  }
  // Same-document wait for native cleanup and routing, bounded by the job deadline. Only one URL write.
  function pmmRodeoFrameRoute(ctx,bind){
    const j=ctx.job,want=new URL(pmmRodeoSnapshotUrl(j,j.token));
    let started=false,observer=null,tick=null;
    const end=()=>{started=true;observer?.disconnect();clearInterval(tick);try{window.removeEventListener('popstate',check);}catch(_){}};
    function check(){
      try{
        if(ctx.stopped||started)return;
        const r=pmmRodeoFrameRecord(j.token,j);
        if(!pmmRodeoFrameJob(j.token,j)||!r||r.child!==ctx.child||r.parent!==ctx.parent||r.stage!=='returning'){end();pmmRodeoFrameStop(ctx,true);return;}
        const p=location.pathname,s=location.search,h=location.hash.length;
        if(location.origin===want.origin&&p===want.pathname&&s===want.search&&h===0){
          end();
          try{history.replaceState(history.state,document.title,want.href);}catch(_){pmmRodeoFrameFail(ctx,'resume');return;}
          pmmRodeoFrameBind(ctx,bind,j,true);
          return;
        }
        if(location.origin!==want.origin)return;
        if(p==='/'){
          if(h===0){const state=history.state;
            if(state&&Object.prototype.hasOwnProperty.call(state,'federatedUrl')&&state.federatedUrl!==want.pathname+want.search){end();pmmRodeoFrameFail(ctx,'route');}}
          return;
        }
        if(p===want.pathname&&s===want.search)return;
        end();pmmRodeoFrameFail(ctx,'route');
      }catch(_){end();pmmRodeoFrameFail(ctx,'route');}
    }
    try{observer=new MutationObserver(check);observer.observe(document.documentElement,{childList:true,subtree:true});}catch(_){}
    tick=setInterval(check,pmmRodeoFrameSpec().tickMs);
    try{window.addEventListener('popstate',check);}catch(_){}
    ctx.cleanup.push(end);
    check();
  }
  // A later document in the owned frame (native sign-in return). It never reads the callback fragment; it asks
  // the direct parent once, and only the parent's own frame at the Rodeo origin can receive the reply.
  async function pmmRodeoFrameReturn(ctx,bind){
    const S=pmmRodeoFrameSpec(),a=pmmRodeoFrameAncestor();
    if(a===null||a!==undefined&&!S.parents.includes(a)){pmmRodeoFrameStop(ctx,true);return;}
    const targets=a===undefined?S.parents.slice():[a];
    ctx.child=pmmRodeoFrameNonce();
    const reply=await pmmRodeoFrameAsk(ctx,{t:'pmm-rodeo-frame-return',v:1,child:ctx.child},targets,
      d=>{const m=pmmRodeoFrameMessage(d,'resume');return m&&m.child===ctx.child?m:null;});
    if(ctx.stopped)return;
    if(!reply){pmmRodeoFrameStop(ctx,true);return;}
    const token=reply.data.token,j=pmmRodeoFrameJob(token),r=j&&pmmRodeoFrameRecord(token,j);
    if(!j||!r||r.parentOrigin!==reply.origin||!pmmRodeoFrameParentOk(r.parentOrigin)||r.returns!==0||!['opened','claimed','bound'].includes(r.stage)){pmmRodeoFrameStop(ctx,true);return;}
    ctx.job=j;ctx.parentOrigin=r.parentOrigin;ctx.parent=reply.data.parent;ctx.returns=1;
    pmmRodeoFrameArm(ctx);
    const prior=r.child;
    pmmRodeoFrameLock(ctx,token,held=>{
      if(!held||ctx.stopped){pmmRodeoFrameStop(ctx,true);return;}
      const x=pmmRodeoFrameRecord(token,j);
      if(!pmmRodeoFrameJob(token,j)||!x||x.returns!==0||x.child!==prior||!['opened','claimed','bound'].includes(x.stage)){pmmRodeoFrameStop(ctx,true);return;}
      if(!pmmRodeoFrameWrite(token,{...x,stage:'returning',child:ctx.child,parent:ctx.parent,returns:1})){pmmRodeoFrameStop(ctx,true);return;}
      pmmRodeoFrameMirror(ctx,'resuming',true,undefined,prior);
      pmmRodeoFrameRoute(ctx,bind);
    });
  }
  function pmmRodeoFrameContinuation(bind,stop){
    const ctx={job:null,child:'',parent:'',parentOrigin:'',returns:0,bound:false,stopped:false,release:null,cleanup:[],stopFeeder:stop};
    pmmRodeoFrameContinuation.value=ctx;
    const control={stop:()=>pmmRodeoFrameStop(ctx,false)};
    try{
      if(!pmmRodeoFrameChildGate()||!navigator.locks||typeof navigator.locks.request!=='function'||typeof crypto==='undefined'||typeof crypto.getRandomValues!=='function'){pmmRodeoFrameStop(ctx,true);return control;}
      const onHide=()=>pmmRodeoFrameStop(ctx,false);
      window.addEventListener('pagehide',onHide);
      ctx.cleanup.push(()=>{try{window.removeEventListener('pagehide',onHide);}catch(_){}});
      const p=location.pathname,len=location.hash.length;
      if(p==='/LGA9/post'&&len==='#pmm-rodeo-snapshot='.length+32&&/^#pmm-rodeo-snapshot=[a-f0-9]{32}$/.test(location.hash))pmmRodeoFrameStart(ctx,bind,0);
      else if(p==='/'||p==='/LGA9/post')pmmRodeoFrameReturn(ctx,bind).catch(()=>pmmRodeoFrameStop(ctx,true));
      else pmmRodeoFrameStop(ctx,true);
    }catch(_){pmmRodeoFrameStop(ctx,true);}
    return control;
  }
  // Capture authority inside the frame: this document's live bound context, the exact frame job at the exact
  // URL, and the ownership record carrying both handshake nonces.
  function pmmRodeoFrameCurrent(j){
    try{
      const ctx=pmmRodeoFrameContinuation.value;
      if(!ctx||ctx.stopped||!ctx.bound||!ctx.job||!j||ctx.job.token!==j.token||!pmmRodeoFrameChildGate())return false;
      const found=pmmRodeoSnapshotJob(true);
      if(!found||found.token!==j.token||found.site!==j.site||found.vrid!==j.vrid||found.created!==j.created)return false;
      const r=pmmRodeoFrameRecord(j.token,found);
      return !!r&&r.stage==='bound'&&r.child===ctx.child&&r.parent===ctx.parent&&r.parentOrigin===ctx.parentOrigin&&r.returns===ctx.returns;
    }catch(_){return false;}
  }
  // PMM-CHUNK-END rodeo-frame
  function fluidContainers(h,query=''){
    if(!h?.fluid&&!h?.mixed)return '<div class="muted">This is a pallet load. Use the Pallets or SAP tab.</div>';
    const q=clean(query).toLowerCase();
    const loose=(idx,id)=>h.fluid||looseMark(idx?.[id]);
    const match=(id,kind)=>{if(!q)return true;const a=(kind==='tote'?h.activeByTote:h.activeByCase)?.[id];const items=(kind==='tote'?h.toteItems:h.caseItems)?.[id]||[];return [id,a?.stower,a?.station,kind,...items.map(x=>x.fcSku)].filter(Boolean).join(' ').toLowerCase().includes(q)};
    const cases=Object.keys(h.caseIndex||{}).filter(id=>loose(h.caseIndex,id)&&match(id,'case')),totes=Object.keys(h.toteIndex||{}).filter(id=>loose(h.toteIndex,id)&&match(id,'tote'));
    if(!cases.length&&!totes.length)return '<div class="muted">No loose cases or totes mapped yet.</div>';
    const entries=(ids,kind)=>ids.map(id=>{
      const active=(kind==='tote'?h.activeByTote:h.activeByCase)?.[id];
      const qty=(kind==='tote'?h.toteQty:h.caseQty)?.[id]||0;
      const items=(kind==='tote'?h.toteItems:h.caseItems)?.[id]||[];
      const extra=active?`<div>Stower: ${esc(active.stower||'—')}${active.station?` · Station: ${esc(active.station)}`:''}</div>`:'';return containerEntry(h,id,qty,items,extra);
    }).join('');
    return `<details class="pallet-group" open><summary>Cases (${cases.length})</summary><div class="pallet-children">${entries(cases,'case')||'No cases'}</div></details><details class="pallet-group" open><summary>Totes (${totes.length})</summary><div class="pallet-children">${entries(totes,'tote')||'No totes'}</div></details>`;
  }
  const openHistory=new Set();
  function movementHistory(res,query='',kindFilter='all',h=null,sessionStart=0,stageCues=pmmStageCueContext(h)){
    const q=clean(query).toLowerCase();
    const filtered=res.filter(r=>{const ackKey=movementAckKey(r);if(kindFilter==='new'&&(stageCues.quiet(r.oldPallet||r.pallet)||Number(r.detectedAt||0)<Number(sessionStart||0)||acknowledgedMovements.has(ackKey)))return false;if(kindFilter!=='all'&&kindFilter!=='new'&&r.kind!==kindFilter)return false;if(!q)return true;return [r.caseId,r.kind,r.oldPallet,r.pallet,r.stower,r.station,r.movementTime].filter(Boolean).join(' ').toLowerCase().includes(q)});
    if(!filtered.length)return '<div class="muted">No movements match the current filter.</div>';
    const groups=new Map();
    for(const r of filtered.slice(0,300)){
      const key=looseMark(r.oldPallet)?r.oldPallet:(!r.oldPallet&&!r.pallet)?FLUID_MARK:r.oldPallet||r.pallet;
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(r);
    }
    const state=h?organizedState(h):null;
    return (filtered.length>300?`<div class="muted">Showing latest 300 of ${filtered.length} matching movements. Export History to access all records.</div>`:'')+[...groups].map(([id,moves])=>{
      const label=looseMark(id)?looseLabel(id):id;
      const rows=moves.map((r)=>{const bucket=r.kind==='tote'?'totes':'cases';const saved=Number(state?.pallets?.[r.oldPallet]?.[bucket]?.[r.caseId]?.quantity)||0;const qty=Number(r.quantity)>0?Number(r.quantity):saved;return `<div class="container-entry${r.kind==='sap'?' sap-row':''}"><button class="copy-movement" type="button" data-copy-key="${esc([r.detectedAt,r.caseId,r.kind].join('|'))}">Copy</button><b>${r.caseId?containerHtml(h,r.caseId):'—'}</b> <span class="muted">${qty} ${qty===1?'unit':'units'}</span>${r.station?` · Station: ${esc(r.station)}`:''}<br><span class="muted">${esc(r.movementTime||'—')}${r.pallet&&!looseMark(r.pallet)?' · Pallet Location: '+containerHtml(h,r.pallet):''}</span></div>`}).join('');
      return `<details class="pallet-group history-group" data-history="${esc(id)}" ${openHistory.has(id)?'open':''}><summary>${esc(label)} <span class="muted">(${moves.length} movements)</span></summary><div class="pallet-children">${rows}</div></details>`;
    }).join('');
  }

  let settingsOpen=false,healthDrawerOpen=false,_lastDuplicateState='',_lastPanelViewSig='';
  const REFRESH_TIMELINE_KEY='pmm-refresh-timeline-v376';
  const REFRESH_TIMELINE_STEPS=new Set(['requested','acquired queue','cooldown ended','page ready','launched','tracking confirmed','cancelled','held']);
  function refreshTimeline(){try{const rows=JSON.parse(sessionStorage.getItem(REFRESH_TIMELINE_KEY)||'[]');return Array.isArray(rows)?rows.filter(r=>Number.isFinite(r?.at)&&REFRESH_TIMELINE_STEPS.has(r.step)).slice(-24):[]}catch{return []}}
  function noteRefreshStep(step){if(!REFRESH_TIMELINE_STEPS.has(step))return;try{const rows=refreshTimeline();if(step==='held'&&rows[rows.length-1]?.step==='held')return;rows.push({step,at:Date.now()});sessionStorage.setItem(REFRESH_TIMELINE_KEY,JSON.stringify(rows.slice(-24)))}catch{}}
  function lastConfirmedRefreshTime(){try{return refreshEvents().find(e=>e.outcome==='complete')?.at||null}catch{return null}}
  function confirmedRefreshLabel(){const at=lastConfirmedRefreshTime();return at?new Date(at).toLocaleTimeString():'none yet'}
  function refreshWaitDetail(){
    if(!_refreshRequest||_refreshRequest.inFlight)return '';
    const elapsed=Math.max(0,Math.floor((Date.now()-(_refreshRequest.requestedAt||Date.now()))/1000));
    return ' · waiting '+formatAgo(elapsed).replace(' ago','');
  }
  const SETTINGS_TABS=[['source','Data Source'],['refresh','Refresh'],['history','History'],['display','Display'],['site','Site'],['advanced','Advanced']];
  const savedSettingsUI=loadSessionUI();
  let settingsTab=[...SETTINGS_TABS.map(([key])=>key),'none'].includes(savedSettingsUI.settingsTab)?savedSettingsUI.settingsTab:'source';
  let settingsFocusTab=SETTINGS_TABS.some(([key])=>key===savedSettingsUI.settingsFocusTab)?savedSettingsUI.settingsFocusTab:(settingsTab==='none'?'source':settingsTab);
  function sourceModeNote(mode){
    if(mode==='combined')return 'AFT and Hunter both watch this load. Each move off a pallet is logged once, by whichever source sees it first; the other only adds details (pc99, station). Hunter loads hidden inside this tab. '+esc(combinedHunterStatus());
    if(mode==='auto')return 'AFT has priority. If AFT stops giving usable data, Hunter loads hidden inside this tab and takes over.';
    if(mode==='hunter')return isAftPage()?'Hunter data loads hidden inside this tab; no extra tab opens. If it reports a sign-in problem, use Open Hunter trailer once to sign in.':(hunterFeederRole(loadIdentity())?'This Hunter tab is feeding an AFT tab; the AFT tab does the tracking.':'Hunter is the active tracking source.');
    return 'AFT is the active tracking source.';
  }
  const SLA_PCT_UNIT_KEY='pax-monitor-v371-sla-pct-unit';
  function settingsPanelHtml(h,opts){
    const {dark,refresh,autoRefresh,displayHold,duplicateViewOnly:dup,historyCount}=opts;
    const sourceMode=dataSourceMode(),activeSource=sourceTrackingActive(h);
    const owner=ownerInfo();
    const dupInfo=duplicateLoadInfo();
    const dc=pmmOneDcDiagnostic(loadIdentity());
    const health=[
      '1DC auto: '+(dc.evidence?'FMC matched this VRID':dc.inFlight?'checking FMC':dc.last?.error||dc.last?.reason||'no fresh FMC match; using fallback rules'),
      'Source mode: '+sourceMode+' / page: '+pageSource()+' / tracking: '+(activeSource?'active':'standby'),
      ...(isAftPage()?['Hunter loader: '+(hunterLoaderFrame()?'running':'off')+(_hunterApi.transport?' / '+_hunterApi.transport:'')+(_hunterApi.error?' / '+_hunterApi.error:'')]:[]),
      'VRID: '+(loadIdentity().loadId||'—'),
      'Duplicate tabs: '+dupInfo.peers.length+(dup? ' (view-only)' : ''),
      'Refresh phase: '+refreshPhase,
      'Queue cooldown: '+(()=>{const p=refreshPaceState();return p.remainingMs>0?Math.ceil(p.remainingMs/1000)+'s left of '+Math.round(p.gapMs/1000)+'s shared gap':'none'+(p.error?' ('+p.error+')':'')})(),
      'Refresh owner: '+(owner?.vrid||owner?.tabId||'—'),
      'Last accepted scan: '+(lastSuccessfulScanAt?new Date(lastSuccessfulScanAt).toLocaleTimeString():'—'),
      'Last scan ms: '+(perfStats.lastScan?.totalMs??'—'),
      'Last scan lock wait / store write ms: '+(perfStats.lastScan?.lockWaitMs??'—')+' / '+(perfStats.lastScan?.storageWriteMs??'—'),
      'Maintenance passes run / skipped: '+(perfStats.maintenanceRuns||0)+' / '+(perfStats.maintenanceSkipped||0),
      'Rows parsed: pallets '+(h?.diagnostics?.palletRows||0)+', cases '+(h?.diagnostics?.caseRows||0)+', totes '+(h?.diagnostics?.toteRows||0),
      'Cosmetic icon changes ignored: '+(perfStats.cosmeticIconChangesIgnored||0),
      'Storage writes: '+(perfStats.storageWrites||0),
      'Pending reasons: '+([..._scanReasons].join(', ')||'—')
    ].join('\n');
    return `<div class="settings-anchor"><button id="settings-gear" class="settings-gear" type="button" title="Monitor settings" aria-label="Monitor settings" aria-controls="monitor-settings" aria-expanded="${settingsOpen}">⚙</button>${settingsOpen?`<div id="monitor-settings" class="settings-panel"><div class="settings-heading"><h4>Monitor Settings</h4><button id="settings-close" type="button" aria-label="Close settings">Close</button></div><div class="settings-note settings-scope-note">Preferences apply to this browser tab only.</div>
      <div class="settings-tabs" role="tablist" aria-label="Settings groups (click the selected category again to collapse it)">${SETTINGS_TABS.map(([key,label])=>`<button type="button" role="tab" id="settings-tab-${key}" data-settings-tab="${key}" aria-controls="settings-pane-${key}" aria-selected="${settingsTab===key}" aria-expanded="${settingsTab===key}" title="${settingsTab===key?'Collapse':'Expand'} ${label}" tabindex="${settingsFocusTab===key?'0':'-1'}">${label}</button>`).join('')}</div>
      <div class="settings-section" id="settings-pane-source" role="tabpanel" aria-labelledby="settings-tab-source" ${settingsTab==='source'?'':'hidden'}><div class="settings-section-title">Data Source</div><div class="settings-grid"><select id="set-data-source" class="settings-wide" title="Monitor data source"><option value="aft" ${sourceMode==='aft'?'selected':''}>AFT</option><option value="hunter" ${sourceMode==='hunter'?'selected':''}>CsX Hunter</option><option value="auto" ${sourceMode==='auto'?'selected':''}>Auto / Fallback</option>${isAftPage()?`<option value="combined" ${sourceMode==='combined'?'selected':''}>Combined (AFT + Hunter)</option>`:''}</select>${!isHunterPage()?'<button id="open-hunter" class="settings-wide" title="Opens this exact trailer in CsX Hunter in a new tab (only needed to sign in or look at Hunter yourself)">Open Hunter trailer in a tab</button>':''}</div><div class="settings-note">${sourceModeNote(sourceMode)}</div></div>
      <div class="settings-section" id="settings-pane-refresh" role="tabpanel" aria-labelledby="settings-tab-refresh" ${settingsTab==='refresh'?'':'hidden'}><div class="settings-section-title">Refresh</div><div class="settings-grid"><button id="set-auto-refresh" ${dup?'disabled':''}>Auto refresh: ${autoRefresh?'On':'Off'}</button><select id="refresh" title="Refresh interval" ${dup?'disabled':''}><option value="1" ${refresh===1?'selected':''}>Every 1m</option><option value="2.5" ${refresh===2.5?'selected':''}>Every 2m 30s</option><option value="5" ${refresh===5?'selected':''}>Every 5m</option><option value="10" ${refresh===10?'selected':''}>Every 10m</option><option value="15" ${refresh===15?'selected':''}>Every 15m</option></select><button id="set-refresh-now" class="settings-wide" ${dup?'disabled':''}>Refresh Now (Queued)</button><button id="cancel-queued-refresh" class="settings-wide" ${_refreshRequest&&!_refreshRequest.inFlight&&!_refreshRequest.controller.signal.aborted&&!dup?'':'hidden'}>Cancel queued refresh</button></div><div class="settings-note">The interval requests a queue turn; completion depends on other tabs, the shared 10s gap, page readiness and accepted tracking. Repeated Refresh Now clicks share one pending request. Last confirmed: <span id="last-confirmed-refresh">${confirmedRefreshLabel()}</span>.</div></div>
      <div class="settings-section" id="settings-pane-history" role="tabpanel" aria-labelledby="settings-tab-history" ${settingsTab==='history'?'':'hidden'}><div class="settings-section-title">History & Data</div><div class="settings-grid"><button id="bottom-export">Export history</button><button id="bottom-import" ${dup?'disabled':''}>Import history</button><button id="bottom-diagnostic" title="Includes load and tracking metadata, but no raw page text or HTML; review before sharing">Download diagnostic summary</button><button id="bottom-purge" ${dup?'disabled':''}>Purge old shared data</button><button id="settings-clear-history" class="settings-wide settings-danger" ${dup?'disabled':''}>Clear Current Load History</button></div><div class="settings-note">History is shared across tabs. Import, purge and clear change shared records; they are not tab preferences.</div></div>
      <div class="settings-section" id="settings-pane-display" role="tabpanel" aria-labelledby="settings-tab-display" ${settingsTab==='display'?'':'hidden'}><div class="settings-section-title">Display</div><div class="settings-grid"><button id="set-display-hold">Display hold: ${displayHold?'On':'Off'}</button><button id="set-sound">Sound: ${read(K.sound,false)?'On':'Off'}</button><button id="set-theme" class="settings-wide">${dark?'Day mode':'Night mode'}</button></div></div>
      <div class="settings-section" id="settings-pane-site" role="tabpanel" aria-labelledby="settings-tab-site" ${settingsTab==='site'?'':'hidden'}><div class="settings-section-title">Site</div><div class="settings-grid"><button id="set-origin-building" title="Shared across monitor tabs after saving. Used for links when the page does not show a warehouse.">Origin building: ${esc(originBuilding()||'not set')}</button><button id="set-1dc" title="Shared fallback list. FMC matches exact VRID first. Save once to publish an older tab-local list to all monitor tabs.">1DC fallback: ${esc(oneDcList().join(', ')||'none')}</button></div></div>
      <div class="settings-section" id="settings-pane-advanced" role="tabpanel" aria-labelledby="settings-tab-advanced" ${settingsTab==='advanced'?'':'hidden'}><div class="settings-section-title">Advanced</div><div class="settings-grid"><div class="settings-note settings-wide">AutoStager ON/OFF is the toggle at the top right of this panel.</div><button id="bottom-recover-refresh" ${dup?'disabled':''}>Recover refresh queue</button><button id="bottom-diagnostic-full" title="Includes page text and HTML; review before sharing">Download full diagnostic (page content)</button><button id="set-reset-origin">Reset AFT hostname</button><button id="set-auth-auto" title="When station values go missing on two confirmed AFT refreshes, sign in again with IT Service Login in a background tab">Auto sign-in: ${authAutoEnabled()?'On':'Off'}</button><button id="set-auth-now" title="Open the AFT sign-in in a background tab and choose IT Service Login now">Sign in again now</button></div><div class="settings-note">Recovery and hostname reset affect coordination across AFT tabs. Use only to resolve a held queue or a hostname change.</div><details class="settings-sub"><summary>Advanced classification</summary><label for="set-sla-pct-unit">AFT reactive percentage units</label><select id="set-sla-pct-unit" title="Only choose confirmed units from the AFT payload"><option value="" ${!read(SLA_PCT_UNIT_KEY,'')?'selected':''}>Unconfirmed (warn if ambiguous)</option><option value="percent" ${read(SLA_PCT_UNIT_KEY,'')==='percent'?'selected':''}>Confirmed percent (0-100)</option><option value="fraction" ${read(SLA_PCT_UNIT_KEY,'')==='fraction'?'selected':''}>Confirmed fraction (0-1)</option></select><div class="settings-note">This tab only. Leave unconfirmed unless the AFT payload units are verified.</div></details><div class="settings-health"><details id="health-drawer" ${healthDrawerOpen?'open':''}><summary>Health details</summary><pre>${esc(health)}</pre></details><div class="settings-note">${historyCount} history record${historyCount===1?'':'s'} for this load. Display Hold freezes only the panel; tracking continues.</div></div></div>
    </div>`:''}</div>`;
  }
  function selectSettingsTab(box,key,focus=false,toggle=false){
    if(!SETTINGS_TABS.some(([name])=>name===key))return;
    settingsTab=toggle&&settingsTab===key?'none':key;
    settingsFocusTab=key;
    saveSessionUI({settingsTab,settingsFocusTab});
    box.querySelectorAll('[data-settings-tab]').forEach(button=>{const selected=button.dataset.settingsTab===settingsTab;button.setAttribute('aria-selected',String(selected));button.setAttribute('aria-expanded',String(selected));button.title=(selected?'Collapse ':'Expand ')+button.textContent;button.tabIndex=button.dataset.settingsTab===settingsFocusTab?0:-1;});
    box.querySelectorAll('.settings-section[role="tabpanel"]').forEach(panel=>{panel.hidden=panel.id!=='settings-pane-'+settingsTab;});
    positionSettingsPanel(box);
    if(focus)box.querySelector('#settings-tab-'+key)?.focus();
  }
  function bindSettingsTabs(box){
    box.querySelectorAll('[data-settings-tab]').forEach(button=>{
      button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();selectSettingsTab(box,button.dataset.settingsTab,false,true);});
      button.addEventListener('keydown',e=>{
        const keys=SETTINGS_TABS.map(([key])=>key),current=keys.indexOf(button.dataset.settingsTab);
        let next=current;
        if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(current+1)%keys.length;
        else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(current+keys.length-1)%keys.length;
        else if(e.key==='Home')next=0;else if(e.key==='End')next=keys.length-1;else return;
        e.preventDefault();e.stopPropagation();selectSettingsTab(box,keys[next],true);
      });
    });
    const closeSettings=()=>{settingsOpen=false;render(getHierarchy());box.querySelector('#settings-gear')?.focus();};
    box.querySelector('#settings-close')?.addEventListener('click',closeSettings);
    box.querySelector('#monitor-settings')?.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeSettings();}});
  }
  function positionSettingsPanel(box){
    const settingsPanel=box.querySelector('.settings-panel');
    if(settingsPanel){
      // A floating menu must escape the monitor's overflow/scroll clipping. Place
      // it beside its gear within the viewport, flipping above the gear near the bottom.
      const gear=box.querySelector('#settings-gear').getBoundingClientRect();
      const width=settingsPanel.getBoundingClientRect().width;
      const height=settingsPanel.getBoundingClientRect().height;
      const left=Math.max(8,Math.min(window.innerWidth-width-8,gear.right-width));
      const below=gear.bottom+6;
      const top=below+height<=window.innerHeight-8?below:Math.max(8,gear.top-height-6);
      settingsPanel.style.left=left+'px';settingsPanel.style.top=top+'px';
    }
  }
  // Keep the pressed control stable until click dispatch. A stale native-menu release
  // must never activate a newly drawn minimize/tab button at the same coordinates.
  function panelControl(target){return target?.closest?.('button,select,input,summary,a,[role="tab"]')||target;}
  function panelInteractionActive(box){return !!(box?._pmmPress&&Date.now()-box._pmmPress.at<30000);}
  function bindPanelInteraction(box){
    box.addEventListener('pointerdown',e=>{
      if(e.button!==undefined&&e.button!==0)return;
      _suppressPanelClicksUntil=0;
      box._pmmPress={target:panelControl(e.target),at:Date.now(),pointerId:e.pointerId};
    },true);
    box.addEventListener('change',e=>{
      if(e.target?.tagName==='SELECT'){box._pmmPress=null;_suppressPanelClicksUntil=Date.now()+600;}
    },true);
    box.addEventListener('click',e=>{
      const press=box._pmmPress,target=panelControl(e.target),pointerClick=e.detail>0||!!e.pointerType;
      box._pmmPress=null;
      if(pointerClick&&((Date.now()<_suppressPanelClicksUntil&&target?.tagName!=='SELECT')||(!press&&target?.id==='minimize')||(press&&press.target!==target))){
        e.stopImmediatePropagation();e.preventDefault();
      }
    },true);
    const release=()=>{box._pmmPress=null;};
    box.addEventListener('pointercancel',release,true);
    window.addEventListener('blur',release);
    document.addEventListener('pointerup',e=>{
      if(!box.contains(e.target)){release();return;}
      const press=box._pmmPress;
      // Click follows pointerup before this task. Native selects keep their guard
      // until change/blur because their popup can outlive the opening pointerup.
      if(press?.target?.tagName!=='SELECT')setTimeout(()=>{
        if(box._pmmPress===press)release();
        if(_pendingVisibleRender&&!_scanRunning)renderMaybe(getHierarchy());
      },0);
    },true);
  }

  let rendered=false;
  let _suppressPanelClicksUntil=0;
  // 3.6.8: "(3) " in the browser tab title = movements still marked NEW in this panel.
  let _titleBadge=-1;
  function updateTitleBadge(n){
    if(window.top!==window)return;
    n=Math.max(0,Number(n)||0);
    const base=document.title.replace(/^\(\d+\) /,'');
    const want=(n?`(${n}) `:'')+base;
    if(n===_titleBadge&&document.title===want)return;
    _titleBadge=n;if(document.title!==want)document.title=want;
  }
  // Mirrors the pallet NEW badges: latest movement per container under the pallet it
  // left, shown only for pallets the Pallets/SAP views list, cleared when opened.
  function newMovementCount(res,sessionStart,h,stageCues=pmmStageCueContext(h)){
    const pallets=h?.pallets||{},seen=new Set();let n=0;
    for(const r of res){
      const p=r?.oldPallet||r?.pallet;if(!p||stageCues.quiet(p))continue;
      const key=p+'\u0001'+r.caseId;if(seen.has(key))continue;seen.add(key);
      if(!(pallets[p]||palletLike(r.oldPallet)))continue;
      if(Number(r.detectedAt||0)>=Number(sessionStart||0)&&!acknowledgedMovements.has(movementAckKey(r)))n++;
    }
    return n;
  }
  function trailerQuantitiesHtml(q=aftTrailerQuantities()){
    const fields=[['totalUnits','Total Units'],['itemsForReconcile','Items For Reconcile'],['totalItemsPending','Total Items Pending']];
    if(q.totalItemsPending===null||q.nonReservePending===null||q.totalItemsPending!==q.nonReservePending)fields.push(['nonReservePending','Non-Reserve Pending']);
    const format=n=>n.toLocaleString('en-US');
    const warning=q.totalUnits!==null&&q.totalItemsPending!==null&&q.totalItemsPending>q.totalUnits?`<p class="quantity-warning">Pending exceeds total by <b>${format(q.totalItemsPending-q.totalUnits)}</b> units. AFT values shown unchanged.</p>`:'';
    const note=q.pendingUnavailable||!q.loadId?`<p class="quantity-note">${esc(q.unavailableReason)}</p>`:'';
    return `<dl class="quantity-metrics">${fields.map(([key,label])=>`<div class="quantity-metric"><dt>${label}</dt><dd data-quantity="${key}"${q[key]===null?' class="quantity-unavailable"':''}>${q[key]===null?'Unavailable':format(q[key])}</dd></div>`).join('')}</dl>${warning}${note}`;
  }
  function updateTrailerQuantities(){
    if(document.hidden||isDisplayHold()||selectionInMonitor())return;
    const box=document.getElementById('pax-monitor-v311'),card=box?.querySelector('.quantity-card');
    if(!card||panelInteractionActive(box))return;
    let q=aftTrailerQuantities();
    if(q.loadId&&(q.loadId!==card.dataset.quantityLoad||q.shipmentId!==card.dataset.quantityShipment))q={...q,loadId:null,totalUnits:null,itemsForReconcile:null,totalItemsPending:null,nonReservePending:null,unavailableReason:'Trailer changed; awaiting panel refresh'};
    const html=trailerQuantitiesHtml(q);if(card.innerHTML!==html)card.innerHTML=html;
  }
  function render(h){
    const existing=document.getElementById('pax-monitor-v311');
    if(panelInteractionActive(existing)||(document.activeElement?.id==='pmm-r-minimum'&&existing?.contains(document.activeElement))){_pendingVisibleRender=true;return false;}
    const priorFocus=existing?.contains(document.activeElement)?document.activeElement.id:'';
    const priorSettingsScroll=existing?.querySelector('.settings-panel')?.scrollTop||0;
    const renderAt=clockNow();
    inject();let box=document.getElementById('pax-monitor-v311');
    const priorBodyScroll=box?.querySelector('.b')?.scrollTop ?? loadSessionUI().bodyScrollTop ?? 0;
    _pendingVisibleRender=false;
    const priorSearch=document.activeElement?.id==='monitor-search'&&box?.contains(document.activeElement)?{start:document.activeElement.selectionStart,end:document.activeElement.selectionEnd}:null;
    if(!box){
      box=document.createElement('div');box.id='pax-monitor-v311';document.body.appendChild(box);
      bindPanelInteraction(box);
    }
    const paused=isPaused(), dark=read(K.theme,'light')==='dark';
    const autoRefresh=isAutoRefreshEnabled(), displayHold=isDisplayHold();
    const dupInfo=duplicateLoadInfo();
    const duplicateReadOnly=dupInfo.duplicate&&!dupInfo.primary;
    box.classList.toggle('dark',dark);
    const modeNow=dataSourceMode();for(const m of ['aft','hunter','auto','combined'])box.classList.toggle('mode-'+m,m===modeNow);
    const d=h?.diagnostics||{palletRows:0,caseRows:0,mappedCases:0,pc99Rows:0,activeCaseMappings:0,palletsWithZeroCases:0,sapPallets:0};
    const allRes=Array.isArray(read(K.results,[]))?read(K.results,[]):[];
    const res=currentHistory(allRes,h);
    const ident=loadIdentity();
    const search=read(K.search,'')||'';
    const historyKind=read(K.historyKind,'all')||'all';
    const sessionStart=Number(read(K.sessionStart,0))||Date.now();
    if(!read(K.sessionStart,0))write(K.sessionStart,sessionStart);
    const sessionMoves=res.filter(r=>Number(r.detectedAt||0)>=sessionStart).length;
    const stageCues=pmmStageCueContext(h);
    updateTitleBadge(newMovementCount(res,sessionStart,h,stageCues));
    const refresh=Number(read(K.refresh,5));
    const minimized=!!read(K.minimized,false), tab=['pallets','sap','fluid','history','none'].includes(read(K.tab,'pallets'))?read(K.tab,'pallets'):'pallets';
    box.classList.toggle('minimized',minimized);
    box.style.setProperty('height',minimized?'auto':'',minimized?'important':'');
    const historyOptions=`<option value="all" ${historyKind==='all'?'selected':''}>All movements</option><option value="new" ${historyKind==='new'?'selected':''}>NEW only</option><option value="case" ${historyKind==='case'?'selected':''}>Cases</option><option value="tote" ${historyKind==='tote'?'selected':''}>Totes</option><option value="sap" ${historyKind==='sap'?'selected':''}>SAPs</option>`;
    const duplicateBanner=duplicateReadOnly?`<div class="duplicate-banner">This VRID is already open in another tab. This tab is view-only for refresh/pause/reset controls until the other tab closes.</div>`:'';
    box.innerHTML=`<div class="h"><button class="drag-handle" type="button" title="Drag monitor" aria-label="Drag monitor">⠿</button><span class="h-title">🛠 Pallet Movement Monitor<span class="mode-chip" title="Data source">${({aft:'AFT',hunter:'Hunter',auto:'Auto',combined:'AFT + Hunter'})[modeNow]||'AFT'}</span></span><span class="h-status"><span id="monitor-state" class="${monitorStateClass()}">${monitorStateText()}</span> <button id="minimize" type="button" aria-expanded="${!minimized}" title="${minimized?'Expand monitor':'Minimize monitor'}" aria-label="${minimized?'Expand monitor':'Minimize monitor'}">${minimized?'▢':'−'}</button></span></div>
${pmmAutoStatusHtml()}<div class="b" ${minimized?'style="display:none!important"':'style="display:block!important"'}><div class="grid">
<div class="card pallet-card"><div class="pallet-summary"><div class="num">${d.uniquePallets||0}</div>${h?.fluid?'Fluid load':h?.mixed?'Mixed load':'Pallets'}${h?.mixed?`<br><small>pallets + ${h.looseContainers} loose</small>`:''}</div></div>
<div class="card quantity-card" role="group" data-quantity-load="${esc(ident.loadId||'')}" data-quantity-shipment="${esc(ident.shipmentId||'')}" aria-label="AFT-reported trailer quantities" title="Current AFT trailer summary, not calculated from pallet or container rows">${trailerQuantitiesHtml()}</div>
<div class="card identity-card"><div class="identity-primary">${esc(ident.trailerName||'—')}</div><div class="identity-label">Trailer</div><div class="identity-secondary">VRID <b>${esc(ident.loadId||'—')}</b></div></div></div>${slaHtml(ident)}${typeof pmmRodeoPanelHtml==='function'?pmmRodeoPanelHtml(ident):''}${duplicateBanner}${authNoteHtml()}${sourceStandbyReason(h)?`<div class="source-note"><b>${esc(sourceShort(pageSource()))} standby:</b> ${esc(sourceStandbyReason(h))}</div>`:''}${h?.source==='hunter'&&h?.diagnostics?.hunterCsvError?`<div class="source-note"><b>Hunter data:</b> ${esc(h.diagnostics.hunterCsvError)}</div>`:''}${isCombinedMode()?`<div class="source-note combined-note"><b>Combined:</b> ${esc(combinedHunterStatus())}</div>`:''}
<div class="top-actions"><div class="main-controls"><button id="pause" ${duplicateReadOnly?'disabled':''}>${paused?'Resume':'Pause'}</button><button id="reset" title="Resets this tab's session counter and shared deduplication for this load" ${duplicateReadOnly?'disabled':''}>Monitor Reset</button><input id="history-file" type="file" accept=".json,application/json" style="display:none"></div>${settingsPanelHtml(h,{dark,refresh,autoRefresh,displayHold,duplicateViewOnly:duplicateReadOnly,historyCount:res.length})}</div><div class="statusline"><span class="status-moves" title="Movements this session"><b>${sessionMoves}</b> moves</span><span id="last-updated">${heartbeatText()}</span><span id="refresh-status">${refreshStatusText()}</span></div>
<div class="diag"><div class="tabs" role="tablist" aria-label="Monitor views"><button id="tab-pallets" type="button" role="tab" aria-selected="${tab==='pallets'}" aria-expanded="${tab==='pallets'}" aria-controls="pallet-history">Pallets</button><button id="tab-sap" type="button" role="tab" aria-selected="${tab==='sap'}" aria-expanded="${tab==='sap'}" aria-controls="pallet-history">SAP (${Object.values(h?.pallets||{}).filter(p=>p.sap).length})</button><button id="tab-fluid" type="button" role="tab" aria-selected="${tab==='fluid'}" aria-expanded="${tab==='fluid'}" aria-controls="fluid-panel">Cases / Totes${h?.mixed?` (${h.looseContainers})`:''}</button><button id="tab-history" type="button" role="tab" title="Movement History" aria-label="Movement History" aria-selected="${tab==='history'}" aria-expanded="${tab==='history'}" aria-controls="movement-history-panel">History (${res.length})</button></div><div class="filterbar" ${tab==='none'?'hidden':''}><input id="monitor-search" type="search" placeholder="Search pallet, case/tote, stower, station…" value="${esc(search)}">${(tab==='pallets'||tab==='sap')&&typeof pmmStagePalletFilterHtml==='function'?pmmStagePalletFilterHtml():''}${tab==='history'?`<select id="history-kind">${historyOptions}</select>`:''}</div>
${tab==='pallets'?pmmPalletToolsHtml(h):''}
<div id="pallet-history" role="tabpanel" aria-labelledby="tab-${tab==='sap'?'sap':'pallets'}" style="display:${tab==='pallets'||tab==='sap'?'block':'none'}">${(tab==='pallets'||tab==='sap')?palletHistory(h,res,tab==='sap',typeof pmmStagePalletViewApply==='function'?'':search,sessionStart,stageCues):''}</div>
<div id="fluid-panel" role="tabpanel" aria-labelledby="tab-fluid" style="display:${tab==='fluid'?'block':'none'}">${tab==='fluid'?fluidContainers(h,search):''}</div><div id="movement-history-panel" role="tabpanel" aria-labelledby="tab-history" style="display:${tab==='history'?'block':'none'}">${tab==='history'?movementHistory(res,search,historyKind,h,sessionStart,stageCues):''}</div></div></div>`;
    try{if(typeof pmmRodeoPanelBind==='function')pmmRodeoPanelBind(box);}catch(_){/* Rodeo view binding cannot block monitor controls. */}
    slaTick(ident);
    const body=box.querySelector('.b');
    if(body){body.scrollTop=Number(priorBodyScroll)||0;body.addEventListener('scroll',()=>saveSessionUI({bodyScrollTop:body.scrollTop}),{passive:true});}
    box.querySelector('#minimize').addEventListener('pointerdown',e=>e.stopPropagation());
    box.querySelector('#minimize').onclick=e=>{e.preventDefault();e.stopPropagation();const next=!read(K.minimized,false);write(K.minimized,next);box.classList.toggle('minimized',next);box.querySelector('.b').style.setProperty('display',next?'none':'block','important');box.querySelector('#minimize').textContent=next?'▢':'−';box.querySelector('#minimize').setAttribute('aria-expanded',String(!next));box.style.setProperty('height',next?'auto':'',next?'important':'');box.querySelector('#minimize').setAttribute('title',next?'Expand monitor':'Minimize monitor');box.querySelector('#minimize').setAttribute('aria-label',next?'Expand monitor':'Minimize monitor');if(next){settingsOpen=false;box.querySelector('#monitor-settings')?.remove();box.querySelector('#settings-gear')?.setAttribute('aria-expanded','false');}requestAnimationFrame(()=>{const corner=loadSessionUI().snapCorner;if(corner)applySnapCorner(box,corner,true)});};
    const selectTab=name=>{const current=read(K.tab,'pallets');write(K.tab,current===name?'none':name);render(getHierarchy())};
    box.querySelector('#tab-pallets').onclick=()=>selectTab('pallets');
    box.querySelector('#tab-sap').onclick=()=>selectTab('sap');
    box.querySelector('#tab-history').onclick=()=>selectTab('history');
    box.querySelector('#tab-fluid').onclick=()=>selectTab('fluid');
    box.querySelector('#history-file').onchange=e=>{pmmAutoStop('History import requires manual review.');pmmAutoState().snapshot=null;importHistory(e.target.files?.[0]);};
    box.querySelector('#settings-gear').onclick=e=>{e.preventDefault();e.stopPropagation();settingsOpen=!settingsOpen;render(getHierarchy());};
    bindSettingsTabs(box);
    box.querySelector('#set-data-source')?.addEventListener('change',e=>{_suppressPanelClicksUntil=Date.now()+600;setDataSourceMode(e.target.value);if(isAftPage()&&!hunterLoaderNeeded())removeHunterLoader();_hunterFailCount=0;cancelQueuedRefresh();clearTimeout(refreshTimer);refreshTimer=0;nextRefreshAt=0;refreshProblem='';if(refreshPhase!=='running'&&refreshPhase!=='settling')refreshPhase='idle';lastSignature='';invalidateHierarchyCache();if(isHunterPage()&&dataSourceMode()!=='aft')waitForHunterData().then(()=>requestScan('source-change',true)).catch(reportMonitorError);else if(isAftPage()&&dataSourceMode()==='combined'){if(!hunterLoaderNeeded())removeHunterLoader();requestScan('source-change',true);refreshCombinedHunter(true)}else if(isAftPage()&&dataSourceMode()==='hunter')ensureHunterApi(true,true).then(()=>requestScan('source-change',true)).catch(err=>{_hunterFailCount++;reportMonitorError(err);schedule()});else requestScan('source-change',true);schedule();render(getHierarchy())});
    box.querySelector('#open-hunter')?.addEventListener('click',()=>openHunterTrailer(loadIdentity(),false));
    box.querySelector('#bottom-export')?.addEventListener('click',()=>exportHistory(h));
    box.querySelector('#bottom-import')?.addEventListener('click',()=>box.querySelector('#history-file').click());
    box.querySelector('#bottom-diagnostic')?.addEventListener('click',()=>{buildDiagnostic(getHierarchy());downloadDiagnostic()});
    box.querySelector('#bottom-diagnostic-full')?.addEventListener('click',()=>{buildDiagnostic(getHierarchy(),true);downloadDiagnostic(true)});
    box.querySelector('#bottom-purge')?.addEventListener('click',()=>storageTransaction(()=>{if(duplicateViewOnly())return;purgeOldData();render(getHierarchy())},[],true).catch(reportMonitorError));
    box.querySelector('#set-theme')?.addEventListener('click',()=>{write(K.theme,dark?'light':'dark');render(h)});
    box.querySelector('#set-sound')?.addEventListener('click',()=>{write(K.sound,!read(K.sound,false));render(h)});
    box.querySelector('#set-auth-auto')?.addEventListener('click',()=>{write(AUTH_AUTO_KEY,!authAutoEnabled());render(h)});
    box.querySelector('#set-auth-now')?.addEventListener('click',()=>{authMaybeStart(true);updateAuthNote()});
    wireAuthNote(box);_authNoteKey='';
    box.querySelector('#set-auto-refresh')?.addEventListener('click',()=>{if(duplicateReadOnly)return;setAutoRefreshEnabled(!autoRefresh);schedule();render(getHierarchy())});
    box.querySelector('#set-origin-building')?.addEventListener('click',()=>{const v=prompt('Shared origin building (all monitor tabs in this browser profile). Save to publish this value, replacing older tab-local values. Used for links when the page has no warehouse. Leave blank to clear.',originBuilding());if(v===null)return;const c=parseCodeList(v)[0]||'';write(K.originBuilding,c);render(getHierarchy())});
    box.querySelector('#set-1dc')?.addEventListener('click',()=>{const v=prompt('Shared 1DC fallback buildings, separated by commas (e.g. QYY4, INC1, IPA1). Save once to publish this list to all monitor tabs in this browser profile. FMC detects 1DC by exact VRID first; this list is a fallback. Leave blank for no manual matches (automatic detection stays on).',oneDcList().join(', '));if(v===null)return;write(K.oneDcTrailers,parseCodeList(v));_hunterClassByShipment.clear();render(getHierarchy())});
    box.querySelector('#set-sla-pct-unit')?.addEventListener('change',e=>{const v=e.target.value;write(SLA_PCT_UNIT_KEY,['percent','fraction'].includes(v)?v:'');slaTick(loadIdentity());render(getHierarchy())});
    box.querySelector('#set-display-hold')?.addEventListener('click',()=>{setDisplayHold(!displayHold);if(displayHold){updateStatusLine();if(_pendingVisibleRender)renderMaybe(getHierarchy());else render(getHierarchy())}else render(getHierarchy())});
    box.querySelector('#cancel-queued-refresh')?.addEventListener('click',()=>{if(!_refreshRequest||_refreshRequest.inFlight)return;cancelQueuedRefresh();updateStatusLine()});
    box.querySelector('#set-refresh-now')?.addEventListener('click',()=>{if(duplicateReadOnly)return;if(!sourceTrackingActive(h)){refreshProblem=sourceStandbyReason(h)||'This source is in standby';updateStatusLine();return}if(refreshPhase==='blocked'||refreshPhase==='stalled'){alert('Refresh queue is held. Recover or resolve the held refresh before starting another one.');return}queueRefresh().catch(reportMonitorError);settingsOpen=false;});
    box.querySelector('#bottom-recover-refresh')?.addEventListener('click',()=>recoverRefreshQueue().catch(reportMonitorError));
    box.querySelector('#set-reset-origin')?.addEventListener('click',()=>{if(refreshBarrier()&&isAftPage()){alert('Cannot reset the stored AFT hostname while a refresh barrier is active.');return;} if(!confirm('Reset the shared AFT hostname? This affects ALL AFT tabs, not just this tab. CsX Hunter is unchanged.'))return; removeValue(ORIGIN_KEY); refreshProblem=''; if(refreshPhase==='blocked')setRefreshPhase('idle'); schedule(); render(getHierarchy());});
    box.querySelector('#refresh')?.addEventListener('change',e=>{_suppressPanelClicksUntil=Date.now()+600;write(K.refresh,Number(e.target.value));schedule();render(h)});
    box.querySelector('#health-drawer')?.addEventListener('toggle',e=>{healthDrawerOpen=e.currentTarget.open;});
    box.querySelector('#monitor-search').oninput=e=>{write(K.search,e.target.value);const pos=e.target.selectionStart;clearTimeout(box._searchTimer);box._searchTimer=setTimeout(()=>{render(getHierarchy());const n=document.querySelector('#pax-monitor-v311 #monitor-search');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch{}}},180)};
    box.querySelector('#history-kind')?.addEventListener('change',e=>{_suppressPanelClicksUntil=Date.now()+600;write(K.historyKind,e.target.value);render(getHierarchy())});
    box.querySelectorAll('.copy-movement').forEach(btn=>btn.onclick=()=>{const key=btn.dataset.copyKey;const r=res.find(x=>[x.detectedAt,x.caseId,x.kind].join('|')===key);if(!r)return;const copyState=organizedState(h);const bucket=r.kind==='tote'?'totes':'cases';const savedQty=Number(copyState?.pallets?.[r.oldPallet]?.[bucket]?.[r.caseId]?.quantity)||0;const copyQty=Number(r.quantity)>0?Number(r.quantity):savedQty;const text=[`Container: ${r.caseId||'—'}`,`Type: ${r.kind==='tote'?'TRANSFER_TOTE':r.kind==='sap'?'SAP':'CASE'}`,`Units: ${copyQty}`,`From: ${looseMark(r.oldPallet)?looseLabel(r.oldPallet):r.oldPallet||'—'}`,`To: ${r.pallet||'Active stower'}`,`Stower: ${r.stower||'—'}`,`Station: ${r.station||'—'}`,`Detected: ${r.movementTime||'—'}`].join('\n');try{GM_setClipboard(text,'text')}catch{navigator.clipboard?.writeText(text)}});
    pmmPalletToolsBind(box,h,res,stageCues);
    if(typeof pmmBindStageControls==='function')pmmBindStageControls(box);
    pmmAutoBind(box);
    box.querySelectorAll('.copy-pallet-ids').forEach(btn=>{btn.addEventListener('pointerdown',e=>e.stopPropagation());btn.onclick=e=>{e.preventDefault();e.stopPropagation();const p=h?.pallets?.[btn.dataset.copyPallet];if(!p)return;const ids=[...(p.cases||[]),...(p.totes||[])].filter(x=>/^(?:csX|tsX)/i.test(clean(x)));const unique=[...new Set(ids)];if(!unique.length)return;const text=unique.join('\n');try{GM_setClipboard(text,'text')}catch{navigator.clipboard?.writeText(text)}const original=btn.textContent;btn.textContent=`Copied ${unique.length}`;setTimeout(()=>{if(btn.isConnected)btn.textContent=original},1200)}});
    box.querySelectorAll('.pallet-group[data-pallet]').forEach(el=>el.addEventListener('toggle',()=>{const id=el.dataset.pallet;if(el.open){openPallets.add(id);el.querySelectorAll('[data-movement-hit="1"]').forEach(c=>{if(c.matches('details')){c.open=true;openContainers.add(c.dataset.container)}acknowledgedMovements.add(c.dataset.movementKey||c.dataset.container);c.classList.remove('movement-hit');c.classList.add('movement-seen')});el.querySelector('.new-badge')?.remove();saveAcknowledged();updateTitleBadge(newMovementCount(res,sessionStart,h))}else openPallets.delete(id);saveOpenState()}));
    box.querySelectorAll('.pallet-group[data-pallet][open] .container-group[data-movement-hit="1"]').forEach(c=>{c.open=true;openContainers.add(c.dataset.container)});
    if((tab==='pallets'||tab==='sap')&&typeof pmmStagePalletViewApply==='function')pmmStagePalletViewApply(box,h,res,{search,sap:tab==='sap'});
    box.querySelectorAll('.container-group[data-container]').forEach(el=>el.addEventListener('toggle',()=>{const id=el.dataset.container;if(el.open)openContainers.add(id);else openContainers.delete(id);saveOpenState()}));
    box.querySelectorAll('.history-group').forEach(el=>el.addEventListener('toggle',()=>{const id=el.dataset.history;if(el.open)openHistory.add(id);else openHistory.delete(id)}));
    box.querySelector('#pause').onclick=e=>{
      if(duplicateReadOnly)return;
      e.preventDefault();e.stopPropagation();const next=!paused;setPaused(next);
      if(next){cancelQueuedRefresh();clearTimeout(refreshTimer);nextRefreshAt=0;updateStatusLine();}
      else{lastSignature='';invalidateHierarchyCache();requestScan('resume',true);schedule();}
      render(getHierarchy());
    };
    box.querySelector('#reset').onclick=()=>{if(duplicateReadOnly)return;if(!confirm('Reset this monitor session? The session counter changes only in this tab. Tracking deduplication for this load resets across ALL tabs; saved history is kept.'))return;userStorageAction(()=>{clearProcessedForLoad(h);write(K.sessionStart,Date.now());render(h)})};
    box.querySelector('#settings-clear-history')?.addEventListener('click',()=>{if(duplicateReadOnly)return;if(!confirm('Clear shared movement history for this load in ALL tabs?'))return;userStorageAction(()=>{const all=Array.isArray(read(K.results,[]))?read(K.results,[]):[],current=new Set(currentHistory(all,h));write(K.results,all.filter(r=>!current.has(r)));clearOrganizedMovements(h);settingsOpen=false;render(h)})});
    bindDrag(box);restoreSessionUI(box);
    positionSettingsPanel(box);
    const settingsPanel=box.querySelector('.settings-panel');
    if(settingsPanel)settingsPanel.scrollTop=priorSettingsScroll;
    if(priorFocus&&priorFocus!=='monitor-search')box.querySelector('#'+priorFocus)?.focus({preventScroll:true});
    if(priorSearch){const n=box.querySelector('#monitor-search');if(n){n.focus({preventScroll:true});try{n.setSelectionRange(priorSearch.start,priorSearch.end)}catch{}}}
    rendered=true;_lastPanelViewSig=panelViewSignature(h);perfStats.lastRenderMs=Math.round((clockNow()-renderAt)*10)/10;
  }
  // Scan-driven renders only. User actions call render() directly. While paused the
  // panel is frozen until Resume or a user action; while running, a text selection
  // inside the panel defers the rebuild until it is released (tracking continues).
  function selectionInMonitor(){
    const box=document.getElementById('pax-monitor-v311'),sel=window.getSelection?.();
    if(!box||!sel||sel.isCollapsed||!sel.rangeCount)return false;
    for(let i=0;i<sel.rangeCount;i++)if(box.contains(sel.getRangeAt(i).commonAncestorContainer))return true;
    return false;
  }
  let _selectionDeferSince=0;
  const SELECTION_DEFER_MAX_MS=120000;
  let _selectionDeadlineTimer=0;
  function renderMaybe(h){
    const selecting=rendered&&!isPaused()&&selectionInMonitor();
    if(!selecting){_selectionDeferSince=0;clearTimeout(_selectionDeadlineTimer);_selectionDeadlineTimer=0;}
    else if(!_selectionDeferSince)_selectionDeferSince=Date.now();
    const holdSelection=selecting&&Date.now()-_selectionDeferSince<SELECTION_DEFER_MAX_MS;
    if(holdSelection&&!_selectionDeadlineTimer){
      const wait=Math.max(0,SELECTION_DEFER_MAX_MS-(Date.now()-_selectionDeferSince))+30;
      _selectionDeadlineTimer=setTimeout(()=>{_selectionDeadlineTimer=0;if(_pendingVisibleRender&&!document.hidden&&!isPaused()&&!_scanRunning&&!isDisplayHold())renderMaybe(getHierarchy())},wait);
    }
    if(document.hidden||(rendered&&isPaused())||isDisplayHold()||holdSelection||(rendered&&settingsOpen)||panelInteractionActive(document.getElementById('pax-monitor-v311'))){_pendingVisibleRender=true;return false}
    _selectionDeferSince=0;clearTimeout(_selectionDeadlineTimer);_selectionDeadlineTimer=0;render(h);return true;
  }
  // Both heartbeats fire every 10 s and used to rebuild the whole panel whenever
  // their own trigger moved, including when the trigger is invisible (peer tab ids
  // rotate as the registry prunes, while the panel prints only a count and the
  // primary flag) and when the scan they just queued was about to render anyway.
  // Rebuild only when a value the panel actually prints has changed; otherwise
  // refresh the status line, which is what the heartbeat text needs.
  function panelViewSignature(h){
    const dup=duplicateLoadInfo();
    return JSON.stringify([dup.peers.length,dup.primary,dup.duplicate,currentLoadScope(),dataSourceMode(),sourceTrackingActive(h),h?.source||pageSource(),h?.loadId||'',h?.shipRef||'',isPaused(),refreshPhase,!!monitorError,lastSnapshotAccepted,settingsOpen,healthDrawerOpen]);
  }
  function duplicateStateSignature(){
    const info=duplicateLoadInfo();
    return JSON.stringify([info.peers.length,info.primary,info.duplicate]);
  }
  // Leaves _lastPanelViewSig stale when it cannot draw, so the next heartbeat (or the
  // visibilitychange scan) retries rather than losing the change.
  function renderOnViewChange(h){
    if(panelViewSignature(h)===_lastPanelViewSig){updateStatusLine();return false}
    if(rendered&&!document.hidden&&!isDisplayHold()&&!settingsOpen&&!panelInteractionActive(document.getElementById('pax-monitor-v311'))){render(h);return true}
    updateStatusLine();return false;
  }
  let _selectionRenderTimer=0;
  document.addEventListener('selectionchange',()=>{
    if(!_pendingVisibleRender||document.hidden||isPaused())return;
    clearTimeout(_selectionRenderTimer);
    _selectionRenderTimer=setTimeout(()=>{if(_pendingVisibleRender&&!document.hidden&&!isPaused()&&!selectionInMonitor()&&!_scanRunning)renderMaybe(getHierarchy())},250);
  });

  function loadSessionUI(){
    try{return JSON.parse(sessionStorage.getItem(UI_SESSION_KEY)||'{}')||{}}catch(_){return {}}
  }
  function saveSessionUI(patch){
    try{sessionStorage.setItem(UI_SESSION_KEY,JSON.stringify({...loadSessionUI(),...patch}))}catch(_){}
  }
  const SNAP_MARGIN=16,SNAP_THRESHOLD=48;
  function cornerPosition(box,corner){
    const maxL=Math.max(SNAP_MARGIN,window.innerWidth-box.offsetWidth-SNAP_MARGIN),maxT=Math.max(SNAP_MARGIN,window.innerHeight-box.offsetHeight-SNAP_MARGIN);
    return {left:corner.endsWith('r')?maxL:SNAP_MARGIN,top:corner.startsWith('b')?maxT:SNAP_MARGIN};
  }
  function detectSnapCorner(box){
    const r=box.getBoundingClientRect(),left=r.left,right=window.innerWidth-r.right,top=r.top,bottom=window.innerHeight-r.bottom;
    const h=left<=SNAP_THRESHOLD?'l':right<=SNAP_THRESHOLD?'r':'';
    const v=top<=SNAP_THRESHOLD?'t':bottom<=SNAP_THRESHOLD?'b':'';
    return v&&h?v+h:null;
  }
  function applySnapCorner(box,corner,save=true){
    if(!['tl','tr','bl','br'].includes(corner))return false;
    const pos=cornerPosition(box,corner);box.style.left=pos.left+'px';box.style.top=pos.top+'px';box.style.right='auto';box.style.bottom='auto';
    if(save)saveSessionUI({left:pos.left,top:pos.top,snapCorner:corner});return true;
  }
  function restoreSessionUI(box){
    try{
      const s=loadSessionUI();
      if(applySnapCorner(box,s.snapCorner,false))return;
      if(Number.isFinite(s.left)&&Number.isFinite(s.top)){
        const maxL=Math.max(0,window.innerWidth-box.offsetWidth),maxT=Math.max(0,window.innerHeight-48);
        box.style.left=Math.max(0,Math.min(maxL,s.left))+'px';
        box.style.top=Math.max(0,Math.min(maxT,s.top))+'px';
        box.style.right='auto';box.style.bottom='auto';
      } else {
        // A tab with no saved position uses its migrated placement preference
        // (a snapped corner, or a free position); the first ever is top-right.
        const g=read(K.placement,null);
        if(g&&applySnapCorner(box,g.snapCorner,true))return;
        if(g&&Number.isFinite(g.left)&&Number.isFinite(g.top)){
          const maxL=Math.max(0,window.innerWidth-box.offsetWidth),maxT=Math.max(0,window.innerHeight-48);
          const left=Math.max(0,Math.min(maxL,g.left)),top=Math.max(0,Math.min(maxT,g.top));
          box.style.left=left+'px';box.style.top=top+'px';box.style.right='auto';box.style.bottom='auto';
          saveSessionUI({left,top,snapCorner:null});return;
        }
        applySnapCorner(box,'tr',true);
      }
    }catch(_){}
  }

  // Placement preference is tab-local, like the saved panel position.
  function rememberPlacement(box){
    const s=loadSessionUI();
    try{write(K.placement,s.snapCorner?{snapCorner:s.snapCorner}:{left:s.left,top:s.top,snapCorner:null})}catch(_){}
  }
  function recoverUIPosition(){
    const box=document.getElementById('pax-monitor-v311');if(!box)return;
    const s=loadSessionUI();if(applySnapCorner(box,s.snapCorner,true))return;
    const r=box.getBoundingClientRect();
    const maxL=Math.max(0,window.innerWidth-box.offsetWidth),maxT=Math.max(0,window.innerHeight-48);
    const left=Math.max(0,Math.min(maxL,r.left)),top=Math.max(0,Math.min(maxT,r.top));
    if(Math.abs(left-r.left)>1||Math.abs(top-r.top)>1){box.style.left=left+'px';box.style.top=top+'px';box.style.right='auto';box.style.bottom='auto';saveSessionUI({left,top,snapCorner:null})}
  }
  let resizeRecoveryTimer=0;
  window.addEventListener('resize',()=>{clearTimeout(resizeRecoveryTimer);resizeRecoveryTimer=setTimeout(recoverUIPosition,150)});

  function bindDrag(box){
    const handle=box.querySelector('.drag-handle');
    if(!handle)return;
    let dragging=false,sx=0,sy=0,l=0,t=0,pointerId=null,raf=0,lastEv=null;

    const move=ev=>{
      if(!dragging)return;
      if(pointerId!==null&&ev.pointerId!==undefined&&ev.pointerId!==pointerId)return;
      ev.preventDefault();lastEv=ev;if(raf)return;
      raf=requestAnimationFrame(()=>{raf=0;const e=lastEv;if(!dragging||!e)return;const maxL=Math.max(0,window.innerWidth-box.offsetWidth),maxT=Math.max(0,window.innerHeight-48);const left=Math.max(0,Math.min(maxL,l+e.clientX-sx)),top=Math.max(0,Math.min(maxT,t+e.clientY-sy));box.style.left=left+'px';box.style.top=top+'px';box.style.right='auto';box.style.bottom='auto';});
    };
    const stop=ev=>{
      if(!dragging)return;
      if(ev&&pointerId!==null&&ev.pointerId!==undefined&&ev.pointerId!==pointerId)return;
      dragging=false;if(raf){cancelAnimationFrame(raf);raf=0}
      document.removeEventListener('pointermove',move,true);
      document.removeEventListener('pointerup',stop,true);
      document.removeEventListener('pointercancel',stop,true);
      window.removeEventListener('blur',stop,true);
      const corner=detectSnapCorner(box);
      if(corner)applySnapCorner(box,corner,true);
      else{const r=box.getBoundingClientRect();saveSessionUI({left:r.left,top:r.top,snapCorner:null});}
      rememberPlacement(box);
      pointerId=null;
    };
    handle.addEventListener('click',e=>e.stopPropagation());
    handle.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      e.preventDefault();e.stopPropagation();
      const r=box.getBoundingClientRect();
      dragging=true;pointerId=e.pointerId;sx=e.clientX;sy=e.clientY;l=r.left;t=r.top;
      document.addEventListener('pointermove',move,true);
      document.addEventListener('pointerup',stop,true);
      document.addEventListener('pointercancel',stop,true);
      window.addEventListener('blur',stop,true);
    });
  }

  let lastSignature='',lastUpdatedAt=0,lastScanAt=0,lastSuccessfulScanAt=0,lastRefreshAt=0,nextRefreshAt=0,refreshState='Waiting';
  let refreshing=false,refreshStarted=0,monitorStarted=false,monitorError='',lastSnapshotAccepted=false,lastSnapshotRejectedReason='';
  let refreshPhase='idle',refreshProblem='',_pageRestored=false;
  function refreshDelay(){const mins=Number(read(K.refresh,5));return REFRESH[mins]||REFRESH[5]}
  function stalled(){const h=getHierarchy();return sourceTrackingActive(h)&&!isPaused()&&monitorStarted&&!monitorError&&lastSuccessfulScanAt>0&&(Date.now()-lastSuccessfulScanAt)>(refreshDelay()*2+30000)}
  function displayedSource(){try{return getHierarchy()?.source||pageSource()}catch{return pageSource()}}
  function directHunterOnAft(){try{return isAftPage()&&getHierarchy()?.source==='hunter'}catch{return false}}
  function monitorStateText(){const h=getHierarchy(),standby=sourceStandbyReason(h);if(standby)return 'STANDBY · '+sourceShort(h?.source||pageSource());if(duplicateViewOnly())return 'VIEW ONLY';if(refreshPhase==='stalled'||refreshPhase==='blocked')return 'REFRESH HELD';if(monitorError)return 'MONITOR ERROR';if(isPaused())return 'PAUSED';if(stalled())return '⚠ STALLED';if(monitorStarted&&refreshFreshness().stale)return 'DATA STALE';return monitorStarted?'LIVE · '+sourceShort(isCombinedMode()?'combined':displayedSource()):'STARTING'}
  function monitorStateClass(){if(sourceStandbyReason(getHierarchy()))return 'state-paused';if(duplicateViewOnly())return 'state-stalled';if(refreshPhase==='stalled'||refreshPhase==='blocked')return 'state-stalled';if(monitorError)return 'state-error';if(isPaused())return 'state-paused';if(stalled()||(monitorStarted&&refreshFreshness().stale))return 'state-stalled';return monitorStarted?'state-live':'state-starting'}
  function formatAgo(sec){if(sec<60)return sec+'s ago';const m=Math.floor(sec/60),s=sec%60;return m+'m '+s+'s ago'}

  function heartbeatText(){const standby=sourceStandbyReason(getHierarchy());if(standby)return standby;if(refreshPhase==='stalled'||refreshPhase==='blocked')return 'Refresh held; last accepted scan: '+(lastSuccessfulScanAt?new Date(lastSuccessfulScanAt).toLocaleTimeString():'none');if(monitorError)return 'Tracking error';if(!lastSuccessfulScanAt)return 'Tracking: starting…';const age=Math.max(0,Math.floor((Date.now()-lastSuccessfulScanAt)/1000));return freshnessText()}
  function refreshStatusText(){
    const barrierState=refreshBarrier();if(barrierState?.invalid)return barrierState.error;
    const standby=sourceStandbyReason(getHierarchy());if(standby)return standby;
    if(duplicateViewOnly())return 'Duplicate VRID open in another tab; this tab is view-only';
    if(refreshPhase==='stalled'||refreshPhase==='blocked')return refreshProblem;
    const paceMs=refreshPaceRemainingMs();
    if(refreshPhase==='cooldown')return (paceMs>0?'Shared queue cooldown '+Math.ceil(paceMs/1000)+'s remaining after confirmed refresh':(isHunterPage()?'Waiting for CsX Hunter data':(directHunterOnAft()?'Waiting for CsX Hunter API':'Waiting for AFT page / Refresh button readiness')))+refreshWaitDetail();
    if(refreshPhase==='settling')return 'Reloaded; waiting for accepted tracking snapshot';
    if(refreshPhase==='running')return isPaused()?'Paused; waiting for active refresh to finish':(isHunterPage()?'Refreshing CsX Hunter':(directHunterOnAft()?'Refreshing CsX Hunter API':'Refreshing; waiting for AFT completion'));
    if(isPaused())return 'Refresh paused';
    if(!isAutoRefreshEnabled())return 'Auto refresh off';
    if(isDisplayHold())return 'Display hold active';
    if(monitorError)return 'Tracking error: '+monitorError;
    if(refreshPhase==='queued'){const o=ownerInfo();return 'Queued'+(o?.vrid?' behind VRID '+o.vrid:(o?' behind another tab':' for a queue turn'))+(refreshBarrier()?' (waiting for owner; abandoned refreshes recover automatically)':'')+(paceMs>0?' · shared cooldown '+Math.ceil(paceMs/1000)+'s':'')+refreshWaitDetail();}
    const barrier=refreshBarrier();if(barrier)return 'Queue reserved by '+(barrier.vrid||'another tab')+'; age '+formatAgo(Math.floor((Date.now()-barrier.startedAt)/1000));
    if(nextRefreshAt){const sec=Math.max(0,Math.ceil((nextRefreshAt-Date.now())/1000));return 'Next queue request: '+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}
    return refreshState||'Waiting';
  }
  function updateStatusLine(){if(!monitorStarted)return;pmmAutoWatch();if(typeof pmmRodeoRefreshPump==='function')try{pmmRodeoRefreshPump()}catch(_){/* Rodeo gate cannot affect tracking. */}if(typeof pmmRodeoPanelReplace==='function')pmmRodeoPanelReplace();const cancelControl=document.getElementById('pax-monitor-v311')?.querySelector('#cancel-queued-refresh');if(cancelControl)cancelControl.hidden=!(_refreshRequest&&!_refreshRequest.inFlight&&!_refreshRequest.controller.signal.aborted&&!duplicateViewOnly());if(document.hidden||isDisplayHold())return;updateTrailerQuantities();updateSlaDisplay(loadIdentity());const box=document.getElementById('pax-monitor-v311');if(!box)return;const a=box.querySelector('#last-updated'),b=box.querySelector('#refresh-status'),s=box.querySelector('#monitor-state');if(a&&a.textContent!==heartbeatText()&&!selectionInMonitor())a.textContent=heartbeatText();if(b&&b.textContent!==refreshStatusText())b.textContent=refreshStatusText();const confirmed=box.querySelector('#last-confirmed-refresh');if(confirmed){const label=confirmedRefreshLabel();if(confirmed.textContent!==label)confirmed.textContent=label}if(s){if(s.textContent!==monitorStateText())s.textContent=monitorStateText();s.className=monitorStateClass();s.classList.toggle('health-warn',!!monitorError||stalled())}}
  // The status timer starts with the panel, never during the AFT startup hold.

  function snapshotSafety(prev,cur){
    if(!usable(cur))return {ok:false,reason:'Snapshot not usable: no mapped cases/totes, active stowers or SAP pallets yet'};
    if(cur.source!=='hunter'&&!aftPageReady(false))return {ok:false,reason:'AFT page still loading; keeping previous snapshot'};
    if(!usable(prev)||!sameLoad(prev,cur))return {ok:true,reason:''};
    const pd=prev.diagnostics||{},cd=cur.diagnostics||{};
    const oldMapped=(pd.mappedCases||0)+(pd.mappedTotes||0),newMapped=(cd.mappedCases||0)+(cd.mappedTotes||0);
    const oldRows=(pd.caseRows||0)+(pd.toteRows||0),newRows=(cd.caseRows||0)+(cd.toteRows||0);
    const justRefreshed=!_refreshDOMConfirmed&&(refreshing||(Date.now()-lastRefreshAt<15000));
    if(justRefreshed&&oldMapped>=20&&newMapped<oldMapped*.35)return {ok:false,reason:`Temporary mapped-container drop (${oldMapped} → ${newMapped})`};
    if(justRefreshed&&oldRows>=20&&newRows<oldRows*.35)return {ok:false,reason:`Temporary hierarchy-row drop (${oldRows} → ${newRows})`};
    // Outside the normal refresh window, treat a near-total collapse of both mapped
    // containers and hierarchy rows as suspicious only briefly. A persistent state
    // is accepted after 5s so a legitimately completed/nearly-empty load cannot freeze
    // against an old snapshot forever.
    // A ready page can briefly show active stowers before its pallet subtrees. Protect
    // small loads too, even when the refresh itself was confirmed.
    const activeOnlyCollapse=cur.source!=='hunter'&&oldMapped>0&&newMapped===0&&newRows===0;
    const catastrophic=activeOnlyCollapse||(!justRefreshed&&oldMapped>=100&&oldRows>=100&&newMapped<oldMapped*.08&&newRows<oldRows*.08);
    if(catastrophic){
      const gk=cur?.source||'aft';if(!_collapseGuardSince||typeof _collapseGuardSince!=='object')_collapseGuardSince={};if(!_collapseGuardSince[gk])_collapseGuardSince[gk]=Date.now();
      if(Date.now()-_collapseGuardSince[gk]<5000)
        return {ok:false,reason:`Confirming catastrophic hierarchy drop (${oldMapped}/${oldRows} → ${newMapped}/${newRows})`};
    }else if(_collapseGuardSince&&typeof _collapseGuardSince==='object')delete _collapseGuardSince[cur?.source||'aft'];
    return {ok:true,reason:''};
  }

  let _scanTimer=0,_scanFirstAt=0,_scanRunning=false,_scanPromise=null;
  const _scanReasons=new Set();
  let _autoAftAcceptedSignature='';
  let _refreshDOMConfirmed=false,_refreshScanResolve=null;
  function requestScan(reason='mutation',immediate=false){
    _scanReasons.add(reason);
    if(!_scanFirstAt)_scanFirstAt=Date.now();
    if(_scanRunning)return;
    clearTimeout(_scanTimer);
    const now=Date.now();
    const due=immediate?now:Math.max(_lastProcessEnd+SCAN_MIN_GAP_MS,Math.min(now+SCAN_QUIET_MS,_scanFirstAt+SCAN_MAX_WAIT_MS));
    _scanTimer=setTimeout(()=>{_scanTimer=0;process(false,[..._scanReasons].join(',')).catch(reportMonitorError)},Math.max(0,due-now));
  }
  async function process(force=false,reason='explicit'){
    if(_pageRestored)return false;
    if(refreshing&&!_refreshDOMConfirmed){_scanReasons.add('after-refresh');return false}
    if(_scanRunning){requestScan(reason,force);return _scanPromise}
    clearTimeout(_scanTimer);_scanTimer=0;_scanReasons.clear();_scanFirstAt=0;
    _scanRunning=true;
    _scanPromise=(async()=>{
      const started=clockNow(),writesBefore=perfStats.storageWrites,lockWaitBefore=perfStats.lockWaitMs,writeMsBefore=perfStats.storageWriteMs;
      const timing={reason,vrid:loadIdentity().loadId,at:Date.now(),parseMs:0,compareMs:0,persistMs:0,renderMs:0};
      try{
        lastScanAt=Date.now();
        await prepareSourceData(force);
        const parseAt=clockNow(),h=getHierarchy(),revision=_domRevision;
        timing.parseMs=clockNow()-parseAt;timing.rows={pallets:h.diagnostics.palletRows,cases:h.diagnostics.caseRows,totes:h.diagnostics.toteRows};
        const aftH=h._aft||h,hh=h._hunter||null;
        let countRaw=null;try{if(h.source==='aft')countRaw=pmmCountCapture(h);}catch(_){/* Optional count evidence is bounded. */}
        const sig=JSON.stringify([h.source,hh?_hunterApi.dataAt||_hunterApi.loadedAt:0,h.shipRef,h.loadId,h.trailerName,h.stowByAt,h.pallets,h.pmmPalletOccurrences,h.caseIndex,h.toteIndex,h.caseQty,h.toteQty,h.activeByCase,h.activeByTote,h.stagedPallets,h.currentLocationByCase,h.currentLocationByTote,h.sapLocations]);
        if(!force&&sig===lastSignature&&!duplicateViewOnly()&&!monitorError&&lastSnapshotAccepted&&!_refreshScanResolve){
          perfStats.skipped++;lastSuccessfulScanAt=Date.now();
          if(h.source==='aft'&&_autoAftAcceptedSignature===sig)pmmAutoAccepted(h,revision);
          if(_pendingVisibleRender&&!document.hidden)renderMaybe(h);
          updateStatusLine();return true;
        }
        const activeSource=sourceTrackingActive(h);
        noteSourceHealth(aftH?.source||pageSource(),aftH,usable(aftH),usable(aftH)?'usable':'hierarchy unavailable');
        if(!activeSource||duplicateViewOnly()){
          lastSignature='';
          lastSnapshotAccepted=usable(h);lastSnapshotRejectedReason=duplicateViewOnly()?'View-only duplicate tab':sourceStandbyReason(h);lastSuccessfulScanAt=Date.now();lastUpdatedAt=lastSuccessfulScanAt;monitorError='';rodeoGateNote(null,false);
          const renderAt=clockNow();renderMaybe(h);timing.renderMs=clockNow()-renderAt;buildDiagnostic(h);updateStatusLine();return true;
        }
        const persistAt=clockNow(),snapshotKey=snapshotStorageKey(aftH),legacyKey=legacySnapshotStorageKey(aftH),orgKey=organizedKey(h),hunterKey=hh?snapshotStorageKey(hh):null;
        let autoAccepted=false,countPrevious=null;
        const outcome=await storageTransaction(()=>{
          // Lock acquisition yields. Never commit a snapshot whose page/load changed meanwhile.
          const live=loadIdentity();
          if(_pageRestored||revision!==_domRevision||!sameLoad(h,live))return {stale:true};
          if(duplicateViewOnly()||!sourceTrackingActive(h))return {standby:true};
          if(h.source==='hunter'&&dataSourceMode()==='auto'&&freshAftHealthy(h.loadId))return {standby:true};
          let prev=read(snapshotKey,null);
          if(!prev&&aftH.source!=='hunter')prev=read(legacyKey,null);
          countPrevious=prev;
          const safety=snapshotSafety(prev,aftH);
          // Combined: AFT and Hunter are judged separately, so a broken AFT page cannot
          // stop Hunter tracking (and vice versa).
          const prevH=hh&&sameLoad(hh,live)?read(hunterKey,null):null,safeH=hh&&sameLoad(hh,live)?snapshotSafety(prevH,hh):{ok:false};
          lastSnapshotAccepted=safety.ok||safeH.ok;lastSnapshotRejectedReason=safety.ok||!safeH.ok?(safety.reason||''):'';
          // A confirmed finished refresh can legitimately leave no comparable containers.
          // Preserve the previous snapshot/history; do not invent disappearances.
          if(!safety.ok&&!safeH.ok)return {accepted:false,noComparableData:_refreshDOMConfirmed&&!usable(aftH)};
          if(usable(prev)&&sameLoad(prev,aftH)){reconcileLoose(prev,aftH);if(h!==aftH)reconcileLoose(prev,h)}
          if(hh&&usable(prevH)&&sameLoad(prevH,hh))reconcileLoose(prevH,hh);
          syncOrganized(h);
          if(!isPaused()){
            if(safety.ok){
              recordSapCompletions(aftH);
              const compareAt=clockNow();
              const moves=usable(prev)&&sameLoad(prev,aftH)?compare(prev,aftH):[];
              timing.compareMs=clockNow()-compareAt;
              for(const m of moves)addResult(m,aftH);
              autoAccepted=true;
              timing.movements=moves.length;
              write(snapshotKey,aftH);noteSnapshotKey(snapshotKey,aftH.capturedAt);
            }else timing.aftRejected=safety.reason;
            if(safeH.ok){
              // Hunter moves are measured against Hunter's own previous snapshot, then merged
              // with AFT's by addResult (first sighting wins, the other enriches).
              const hm=usable(prevH)&&sameLoad(prevH,hh)?compare(prevH,hh):[];
              for(const m of hm)addResult(m,hh);
              timing.hunterMovements=hm.length;
              write(hunterKey,hh);noteSnapshotKey(hunterKey,hh.capturedAt);
            }else if(hh)timing.hunterRejected=safeH.reason;
            if(isCombinedMode()&&safety.ok)enrichResultsFromAft(aftH);
          }
          return {accepted:true};
        },[snapshotKey,legacyKey,orgKey,legacyOrganizedKey(aftH),...(hunterKey?[hunterKey]:[])],false,{tracking:h,historyNeeded:get=>{
          // Keep the shared lock. Avoid loading global history on scans with no events.
          if(isPaused())return false;
          if(isCombinedMode())return true; // Station enrichment reads existing events.
          const p=get(snapshotKey)||get(legacyKey);
          return !!(usable(p)&&sameLoad(p,aftH)&&compare(p,aftH).length)||Object.values(aftH.pallets||{}).some(x=>x.sap&&sapStagingKind(x.staging)==='stowed');
        }});
        timing.persistMs=clockNow()-persistAt-timing.compareMs;
        if(outcome.stale||outcome.standby)rodeoGateNote(null,false);
        if(outcome.stale){requestScan('changed-while-waiting');return false}
        if(outcome.standby){lastSnapshotAccepted=usable(h);lastSnapshotRejectedReason=sourceStandbyReason(h)||(duplicateViewOnly()?'View-only duplicate tab':'Source standby');lastSuccessfulScanAt=Date.now();lastUpdatedAt=lastSuccessfulScanAt;lastSignature='';monitorError='';renderMaybe(h);buildDiagnostic(h);updateStatusLine();return true}
        if(outcome.accepted){lastSuccessfulScanAt=Date.now();lastUpdatedAt=lastSuccessfulScanAt;lastSignature=sig;monitorError='';
          if(autoAccepted&&countRaw)pmmCountAccepted(countRaw,countPrevious,_refreshDOMConfirmed?lastRefreshAt:0,reason);
          _autoAftAcceptedSignature=autoAccepted&&h.source==='aft'?sig:'';
          if(_autoAftAcceptedSignature)pmmAutoAccepted(aftH,revision);
        }
        else if(lastSnapshotRejectedReason.startsWith('Confirming catastrophic'))requestScan('confirm-hierarchy-drop');
        // Only this scan's AFT portion, accepted and persisted under the lock, makes Rodeo eligible.
        rodeoGateNote(aftH,!!outcome.accepted&&autoAccepted&&aftH.source==='aft');
        // 3.8.0: only a confirmed AFT refresh counts toward sign-in recovery.
        if(outcome.accepted&&_refreshDOMConfirmed){try{authObserve(aftH)}catch(err){console.warn('[Pallet Movement Monitor] sign-in check',err)}}
        const renderAt=clockNow();renderMaybe(h);timing.renderMs=clockNow()-renderAt;
        buildDiagnostic(h);updateStatusLine();if((outcome.accepted||outcome.noComparableData)&&_refreshScanResolve)_refreshScanResolve(outcome);return outcome.accepted;
      }catch(err){reportMonitorError(err);return false}
      finally{
        _lastProcessEnd=Date.now();timing.totalMs=clockNow()-started;timing.storageWrites=perfStats.storageWrites-writesBefore;
        // Lock wait and persistence are reported beside totalMs, not folded into it.
        timing.lockWaitMs=round1(perfStats.lockWaitMs-lockWaitBefore);timing.storageWriteMs=round1(perfStats.storageWriteMs-writeMsBefore);
        perfStats.scans++;perfStats.lastScan=timing;perfStats.recentScans.push(timing);if(perfStats.recentScans.length>20)perfStats.recentScans.shift();
      }
    })();
    try{return await _scanPromise}
    finally{_scanRunning=false;_scanPromise=null;if(_scanReasons.size)requestScan('pending-follow-up')}
  }

  // Mutation filters include inserted/removed hierarchy roots, not just their descendants.
  const DATA_SELECTOR='div[id$="-details"],div[id$="-row"],div[id$="-children"],#loadId,#sourceWarehouseId';
  function elementOf(node){return node?.nodeType===1?node:node?.parentElement}
  function ownNode(node){return !!elementOf(node)?.closest?.('#pax-monitor-v311,#pmm-ms-bar')}
  function dataNode(node){const e=elementOf(node);return !!e&&(!!e.matches?.(DATA_SELECTOR)||!!e.closest?.(DATA_SELECTOR))}
  function relevantMutation(r){
    if(ownNode(r.target))return false;
    if(isHunterPage()){
      const e=elementOf(r.target);
      if(r.type==='attributes')return r.attributeName==='href'&&!!e?.closest?.('a[download="Containers.csv"],a[download="Locations.csv"]');
      if(r.type!=='childList')return false;
      return [...(r.addedNodes||[]),...(r.removedNodes||[])].some(n=>{const x=elementOf(n);if(!x||ownNode(x))return false;return !!x.matches?.('a[download="Containers.csv"],a[download="Locations.csv"],h6')||!!x.querySelector?.('a[download="Containers.csv"],a[download="Locations.csv"],h6')});
    }
    if(r.type==='attributes'){
      if(!['href','id','class'].includes(r.attributeName))return false;
      // Parsed links/row identities/selectors matter; inline styling and expand state do not.
      const wasData=r.attributeName==='id'&&/(?:-details|-row|-children)$/.test(r.oldValue||'');
      return wasData||dataNode(r.target)||!!elementOf(r.target)?.querySelector?.(DATA_SELECTOR);
    }
    if(dataNode(r.target))return true;
    return [...(r.addedNodes||[]),...(r.removedNodes||[])].some(n=>!ownNode(n)&&(dataNode(n)||!!elementOf(n)?.querySelector?.(DATA_SELECTOR)));
  }

  // Scan-only exception. relevantMutation remains unchanged for refresh settling.
  // Fail closed: only the exact empty arrow beside an AFT container link, with
  // both old/current classes restricted to the observed cosmetic vocabulary.
  function cosmeticIconMutation(r){
    if(!isAftPage()||r.type!=='attributes'||r.attributeName!=='class'||typeof r.oldValue!=='string')return false;
    const e=r.target;
    if(e?.nodeType!==1||e.tagName!=='SPAN'||e.hasAttribute('id')||e.childNodes.length)return false;
    const parent=e.parentElement,link=e.nextElementSibling;
    if(!parent?.matches('span.container-scannableId')||!parent.parentElement?.matches('.col-xs-3')||
      !parent.parentElement.parentElement?.matches('div[id$="-details"]')||
      !link?.matches('a[href*="results?s="]'))return false;
    const known=value=>{
      const c=value.trim().split(/\s+/);
      return c.length===3&&new Set(c).size===3&&c.includes('collapsable-icon')&&c.includes('glyphicon')&&
        (c.includes('glyphicon-chevron-right')||c.includes('glyphicon-chevron-down'));
    };
    return known(r.oldValue)&&known(e.getAttribute('class')||'');
  }
  function scanMutations(records){
    const relevant=records.filter(r=>{
      if(!relevantMutation(r))return false;
      if(cosmeticIconMutation(r)){perfStats.cosmeticIconChangesIgnored++;return false}
      return true;
    });
    if(relevant.length){pmmAutoState().snapshot=null;if(pmmAutoState().desired)pmmAutoSuspend('AFT data changed; checking the next accepted scan with ON retained.');}
    return relevant;
  }

  // 3.7.0: liveness is document ownership, never foreground-tab visibility.
  const TAB_ENTRY_PREFIX='pmm-tab-v370:',DOC_LOCK_PREFIX='pmm-document-v370:';
  const RECOVERY_GRACE_MS=120000,RECOVERY_CHECK_MS=10000;
  const REFRESH_EVENT_PREFIX='pmm-refresh-event-v370:',DATA_AGE_PREFIX='pmm-data-age-v370:';
  let _documentAliveRelease=null,_recoveryTimer=0,_recoveryBusy=false,_absence=null;
  let _pageLoadedDataAt=0,_lastConfirmedDataAt=0,_freshScope='';
  const recoveryClock=()=>performance.now();
  function refreshEvents(){
    const rows=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);if(!key?.startsWith(REFRESH_EVENT_PREFIX))continue;
      try{const row=JSON.parse(localStorage.getItem(key));if(row)rows.push({...row,key})}catch{}
    }
    return rows.sort((a,b)=>b.at-a.at).slice(0,100);
  }
  function logRefreshEvent(outcome,details={}){
    try{
      const row={at:Date.now(),outcome,vrid:loadIdentity().loadId,tabId:TAB_ID,...details};
      localStorage.setItem(REFRESH_EVENT_PREFIX+Date.now()+':'+TAB_ID+':'+Math.random().toString(36).slice(2),JSON.stringify(row));
      const keys=[];
      for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(REFRESH_EVENT_PREFIX))keys.push(k)}
      keys.sort((a,b)=>Number(b.slice(REFRESH_EVENT_PREFIX.length).split(':')[0])-Number(a.slice(REFRESH_EVENT_PREFIX.length).split(':')[0]));
      for(const k of keys.slice(100))localStorage.removeItem(k);
    }catch(e){console.warn('[Pallet Movement Monitor] refresh event log unavailable',e)}
  }
  function beginDocumentLiveness(){
    navigator.locks.request(DOC_LOCK_PREFIX+TAB_ID,{mode:'exclusive'},()=>new Promise(resolve=>{_documentAliveRelease=resolve})).catch(reportMonitorError);
  }
  async function documentOwnsLock(id){
    if(!id)return false;
    return navigator.locks.request(DOC_LOCK_PREFIX+id,{mode:'exclusive',ifAvailable:true},lock=>!lock);
  }
  function tabTicketToken(){try{return refreshTicket()?.token||null}catch{return null}}
  function readTabEntries(){
    const rows={};
    // Read older-version rows during migration, but never rewrite their shared registry.
    try{Object.assign(rows,JSON.parse(localStorage.getItem(TAB_REGISTRY_KEY)||'{}'))}catch{}
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);if(!key?.startsWith(TAB_ENTRY_PREFIX))continue;
      try{const row=JSON.parse(localStorage.getItem(key));if(row?.tabId)rows[row.tabId]=row}catch{}
    }
    return rows;
  }
  async function cleanupReliabilityStorage(){
    const now=Date.now();
    for(const [id,row] of Object.entries(readTabEntries())){
      if(id===TAB_ID||now-Number(row.ts||0)<86400000)continue;
      if(await documentOwnsLock(id))continue;
      const key=TAB_ENTRY_PREFIX+id,raw=localStorage.getItem(key);
      if(!raw)continue;
      try{if(now-Number(JSON.parse(raw).ts||0)>=86400000)localStorage.removeItem(key)}catch{}
    }
    const expired=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);if(!key?.startsWith(DATA_AGE_PREFIX))continue;
      try{if(now-Number(JSON.parse(localStorage.getItem(key)).at||0)>45*86400000)expired.push(key)}catch{}
    }
    for(const key of expired)localStorage.removeItem(key);
  }
  function ownTabEntry(){
    const prior=readTabEntries()[TAB_ID];
    return {tabId:TAB_ID,scope:currentLoadScope(),vrid:loadIdentity().loadId||null,
      startedAt:Number(prior?.startedAt)||Date.now(),ts:Date.now(),url:location.href,
      title:document.title,refreshToken:tabTicketToken(),version:V};
  }
  async function barrierHasOwner(b){
    if(await documentOwnsLock(b.tabId))return true;
    const rows=readTabEntries();
    for(const row of Object.values(rows)){
      if(!row)continue;
      if(row.tabId!==b.tabId&&row.refreshToken!==b.token)continue;
      if(await documentOwnsLock(row.tabId))return true;
      // Legacy scripts have no document lock; a recent heartbeat still protects them.
      if(Date.now()-Number(row.ts||0)<TAB_REGISTRY_TTL)return true;
    }
    return false;
  }
  function recoveryObservedAbsent(token,now){
    // A sleep, long suspension or a new token restarts the grace period.
    if(!_absence||_absence.token!==token||now-_absence.last>60000||now<_absence.last)
      _absence={token,since:now,last:now};
    _absence.last=now;
    return now-_absence.since>=RECOVERY_GRACE_MS;
  }
  async function maybeRecoverAbandonedRefresh(){
    if(_pageRestored||_recoveryBusy||!navigator.locks?.request)return false;
    _recoveryBusy=true;
    try{
      const b=refreshBarrier();
      if(!b||b.invalid||Date.now()-Number(b.startedAt||0)<RECOVERY_GRACE_MS){_absence=null;return false}
      // If a reload page is awaiting its continuation, it must get first chance.
      if(reloadContinuation()||await barrierHasOwner(b)){_absence=null;return false}
      if(!recoveryObservedAbsent(b.token,recoveryClock()))return false;
      return await navigator.locks.request(REFRESH_LOCK_NAME,{mode:'exclusive',ifAvailable:true},async lock=>{
        if(!lock){_absence=null;return false}
        const current=refreshBarrier();
        if(!current||current.token!==b.token){_absence=null;return false}
        if(await barrierHasOwner(current)){_absence=null;return false}
        // Check once more after awaiting liveness locks. Clear only this exact token.
        if(refreshBarrier()?.token!==b.token)return false;
        clearRefreshBarrier(b.token);
        const owner=read(K.refreshOwner,null);
        if(owner?.tabId===b.tabId)removeValue(K.refreshOwner);
        logRefreshEvent('abandoned; outcome unknown',{vrid:b.vrid,startedAt:b.startedAt,token:b.token,reason:'No owner or reload successor; continuous grace elapsed; refresh lock available'});
        perfStats.lastRefresh={outcome:'automatically recovered abandoned refresh',vrid:b.vrid,startedAt:b.startedAt};
        _absence=null;
        if(!_refreshRequest){setRefreshPhase('idle','Abandoned refresh cleared; queue resumed');schedule()}
        return true;
      });
    }catch(e){console.warn('[Pallet Movement Monitor] automatic recovery held',e);return false}
    finally{_recoveryBusy=false}
  }
  function aftDataFreshness(){
    const scope=loadScopeKey();
    if(_freshScope!==scope){_freshScope=scope;_pageLoadedDataAt=0;_lastConfirmedDataAt=0;
      try{_lastConfirmedDataAt=Number(JSON.parse(localStorage.getItem(DATA_AGE_PREFIX+scope)||'null')?.at)||0}catch{}}
    // Reading a rendered page establishes initial observation, not a successful refresh.
    if(!_pageLoadedDataAt&&isAftPage()&&aftPageReady(false))_pageLoadedDataAt=performance.timeOrigin||Date.now();
    const dataAt=Math.max(_pageLoadedDataAt,_lastConfirmedDataAt);
    const allowedMs=refreshDelay()*2+30000,ageMs=dataAt?Math.max(0,Date.now()-dataAt):null;
    return {dataAt:dataAt||null,allowedMs,ageMs,stale:!dataAt||ageMs>allowedMs};
  }
  function refreshFreshness(){
    const aft=aftDataFreshness(),source=displayedSource();
    const hunterAt=Number(isHunterPage()?(!_hunterCsv.error?_hunterCsv.loadedAt:0):(!_hunterApi.error?(_hunterApi.dataAt||_hunterApi.loadedAt):0))||0;
    const dataAt=source==='hunter'?hunterAt:aft.dataAt;
    const ageMs=dataAt?Math.max(0,Date.now()-dataAt):null;
    return {source,pageLoadedAt:_pageLoadedDataAt||null,lastConfirmedRefreshAt:_lastConfirmedDataAt||null,
      dataAt:dataAt||null,ageMs,allowedMs:aft.allowedMs,stale:!dataAt||ageMs>aft.allowedMs,
      lastScanAt:lastSuccessfulScanAt||null};
  }
  function noteConfirmedRefresh(signal){
    refreshFreshness();
    if(signal.startsWith('AFT')){
      _lastConfirmedDataAt=Date.now();
      try{localStorage.setItem(DATA_AGE_PREFIX+loadScopeKey(),JSON.stringify({at:_lastConfirmedDataAt,signal}))}catch{}
      if(typeof pmmRodeoRefreshNoteConfirmed==='function')try{pmmRodeoRefreshNoteConfirmed()}catch(_){/* Rodeo gate cannot affect refresh completion. */}
    }
    noteRefreshStep('tracking confirmed');logRefreshEvent('complete',{signal,startedAt:lastRefreshAt,durationMs:Date.now()-lastRefreshAt});
  }
  function rodeoGateNote(h,accepted){
    if(typeof pmmRodeoRefreshNoteAccepted!=='function')return;
    try{if(accepted)pmmRodeoRefreshNoteAccepted(h,{confirming:_refreshDOMConfirmed,refreshing});else pmmRodeoRefreshClear()}catch(_){/* Rodeo gate cannot affect tracking. */}
  }
  // Any refresh work in this tab, including a queued request, defers Rodeo until it is released.
  // The live AFT page must still be ready, actively tracked and recently scanned successfully.
  function pmmRodeoRefreshBusy(){
    return !!(refreshing||_refreshDOMConfirmed||_refreshScanResolve||_refreshRequest||_pageRestored||_pageUnloading||refreshPhase==='running'||refreshPhase==='settling'||duplicateViewOnly()||isPaused()||!!monitorError||!aftPageReady(false)||!sourceTrackingActive(loadIdentity())||!pmmRodeoRefreshScanRecent());
  }
  // Liveness guard only; never a reason to request Rodeo.
  function pmmRodeoRefreshScanRecent(){const now=Date.now();return lastSuccessfulScanAt>0&&lastSuccessfulScanAt<=now&&now-lastSuccessfulScanAt<=120000}
  function freshnessText(){
    const f=refreshFreshness(),scan=lastSuccessfulScanAt?formatAgo(Math.max(0,Math.floor((Date.now()-lastSuccessfulScanAt)/1000))):'not yet';
    const prefix=f.stale?'Data stale / unconfirmed':'Tracking';
    const data=f.dataAt?formatAgo(Math.floor(f.ageMs/1000)):'unavailable';
    const confirmed=f.source==='hunter'?'Source data':f.lastConfirmedRefreshAt&&f.lastConfirmedRefreshAt>=Number(f.pageLoadedAt||0)?'Confirmed refresh':'Page loaded';
    return `${prefix} · Scan ${scan} · ${confirmed} ${data}`;
  }
  function reliabilityDiagnostic(){
    const b=refreshBarrier(),row=b?readTabEntries()[b.tabId]:null;
    return {freshness:refreshFreshness(),pace:refreshPaceState(),ownerHeartbeatAgeMs:row?Date.now()-Number(row.ts||0):null,
      ownerAgeMs:b?Date.now()-Number(b.startedAt||0):null,recoveryGraceMs:RECOVERY_GRACE_MS,
      absentObservedMs:_absence?Math.max(0,recoveryClock()-_absence.since):0,
      tabs:Object.values(pruneTabRegistry()),refreshEvents:refreshEvents()};
  }

  // ======================= SLA module =======================
  // SLA uses the monitor's editable 1DC setting and verified source timestamps.
  // 1DC: IDX arrival + 12 h. Reactive: AFT received + 4 h. NR: received + 24 h.
  // The inherited 80% reactive threshold is retained; ambiguous percentage units warn.
  // Missing required timestamps never substitute the other clock. A previously verified
  // deadline may remain visible as explicitly cached during a temporary lookup failure.
  const SLA=(function(){
    'use strict';
    // 3.7.3: the reactive-percentage unit is a per-tab preference, so it is read through
    // the host's tab-local store; cached deadlines stay shared but carry the fingerprint
    // of the rules - including that unit - that produced them.
    // 3.7.2: complete-response manifest matching; bounded shared index and lookup proofs.
    const VERSION='sla-2.0.1';

    // ---- configuration ------------------------------------------------------
    const CFG={
      // v2 keys: a v1 entry carries a deadline computed under the old rule set
      // (no 24h non-reactive rule, fixed 1DC list), so it is deleted, not migrated.
      entryPrefix:'pax-sla-v2-entry:',      // one GM key per load, owned by this module
      indexKey:'pax-sla-v2-index',          // {key:ts} for TTL/cap pruning only
      manifestKey:'pax-sla-v2-manifests',   // shared manifest index (all tabs, one fetch)
      lockPrefix:'pax-sla-v2-',             // Web Lock name prefix
      retiredKeys:['pax-sla-v1-cache','pax-sla-v1-manifests'],

      // 1DC origin codes. There is no second hard-coded SLA list any more: see
      // slaOneDcCodes() for the precedence. Used only when nothing else answers.
      oneDc:null,                           // explicit list injected by host/tests
      oneDcProvider:null,                   // accessor supplied by the host script
      oneDcSettingKey:'pax-monitor-v3610-1dc-trailers',
      oneDcDefault:['QYY4','INC1'],

      // INHERITED ASSUMPTION (3.6.x): a load is "reactive" at 80% or more reactive
      // items. No live manifest payload has ever been captured to confirm either the
      // threshold or the scale of percentageOfReactiveItems, so the threshold is kept
      // as-is and the scale is a setting (reactivePctUnit) rather than a guess. A load
      // whose source states its classification skips this gate entirely.
      reactiveMinPct:80,
      reactivePctUnit:null,                 // 'percent' | 'fraction' | null (unconfirmed)
      pctUnitSettingKey:'pax-monitor-v371-sla-pct-unit',

      reactiveSlaMs:4*3600e3,               // reactive: AFT receive + 4h
      nrSlaMs:24*3600e3,                    // non-reactive: AFT receive + 24h
      oneDcSlaMs:12*3600e3,                 // 1DC: IDX arrival + 12h (never receive)
      amberReactiveMs:60*60e3,              // amber inside 1 h for reactive
      amberOneDcMs:2*3600e3,                // amber inside 2 h for 1DC
      amberNrMs:4*3600e3,                   // amber inside 4 h for non-reactive (UI hint)
      maxEntries:120,                       // bounded cache
      entryTtlMs:36*3600e3,                 // hard expiry for any entry
      resolvedTtlMs:12*3600e3,              // receive/arrival stamps are immutable
      pendingTtlMs:3*60e3,                  // load not received / not in manifest yet
      backoffsMs:[60e3,2*60e3,5*60e3,10*60e3,15*60e3],
      tickThrottleMs:5e3,                   // slaTick() cache inspection throttle
      reqTimeoutMs:15e3,
      budgetMs:45e3,                        // whole resolve, all requests together
      maxHops:4,                            // auth-interstitial hops per IDX request
      manifestTtlMs:5*60e3,                 // shared manifest index TTL (all tabs)
      maxManifestRows:1200,                 // bounded compact index, newest receive first
      aftBases:['https://afttransshipmenthub-na.aka.amazon.com',
                'https://transshipmenthub.na.aftx.amazonoperations.app'],
      idxBackend:'https://prod-na.us-east-1.idx-backend.aft.amazon.dev',
      idxOrigin:'https://prod-na.us-east-1.idx-website.aft.amazon.dev',
      // https + host allowlist. GM_xmlhttpRequest follows redirects itself, so this is
      // NOT redirect prevention: by the time onload runs, the request has already been
      // sent to wherever it was redirected. What is guaranteed is that no request is
      // started against a non-https or non-allowlisted URL, and that a response whose
      // final URL is off the allowlist is discarded instead of parsed.
      allowHosts:['afttransshipmenthub-na.aka.amazon.com',
                  'transshipmenthub.na.aftx.amazonoperations.app',
                  'prod-na.us-east-1.idx-backend.aft.amazon.dev',
                  'prod-na.us-east-1.idx-website.aft.amazon.dev',
                  'midway-auth.amazon.com',
                  'idp.federate.amazon.com']
    };
    let overrides={};
    function cfg(k){return overrides[k]!==undefined?overrides[k]:CFG[k]}
    function configure(o){overrides={...overrides,...(o||{})};return {...CFG,...overrides}}

    // ---- tiny self-contained utilities --------------------------------------
    const now=()=>(typeof overrides.nowFn==='function'?overrides.nowFn():Date.now());
    const txt=v=>String(v??'').replace(/\s+/g,' ').trim();
    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const norm=s=>String(s??'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    const num=v=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:0};
    const gmGetValue=(k,d)=>{try{return typeof GM_getValue==='function'?GM_getValue(k,d):d}catch{return d}};
    const gmSetValue=(k,v)=>{try{if(typeof GM_setValue==='function')GM_setValue(k,v)}catch{}};
    const gmDeleteValue=k=>{try{if(typeof GM_deleteValue==='function')GM_deleteValue(k)}catch{}};
    const gmSync=()=>typeof GM_getValue==='function'&&typeof GM_setValue==='function';
    function hostOf(url){try{return new URL(url).hostname.toLowerCase()}catch{return ''}}
    function allowed(url){
      let u=null;try{u=new URL(String(url))}catch{return false}
      return u.protocol==='https:'&&cfg('allowHosts').includes(u.hostname.toLowerCase());
    }

    // 1DC origin codes, in precedence order:
    //   1. cfg('oneDc')            explicit list injected by the host script or a test
    //   2. cfg('oneDcProvider')()  accessor supplied by the host script
    //   3. oneDcList()             the monitor's Settings > Site > 1DC buildings list,
    //                              shared after explicit Site publication in 3.9.9
    //   4. GM oneDcSettingKey      the same setting read directly (module standalone)
    //   5. cfg('oneDcDefault')     QYY4, INC1
    // SLA no longer keeps a private copy of the list: the inner function that used to
    // shadow the monitor's oneDcList() is renamed, so the setting now drives both
    // movement classification and the SLA rule, which is what the settings screen says.
    const codesOf=v=>[...new Set((Array.isArray(v)?v:String(v??'').split(/[\s,;]+/))
      .map(norm).filter(Boolean))].slice(0,30);
    // An answer of [] or '' is an answer: "Leave blank for none" must mean no load is
    // 1DC, not a silent fall back to the built-in codes. Only null/undefined - the
    // setting was never written, the accessor does not exist - falls through.
    function oneDcSources(){
      return [
        ['cfg.oneDc',()=>cfg('oneDc')],
        ['cfg.oneDcProvider',()=>{const p=cfg('oneDcProvider');return typeof p==='function'?p():null}],
        ['monitor.oneDcList',()=>(typeof oneDcList==='function'?oneDcList():null)],
        ['gm:'+cfg('oneDcSettingKey'),()=>gmGetValue(cfg('oneDcSettingKey'),null)]
      ];
    }
    function oneDcResolved(){
      for(const [from,read] of oneDcSources()){
        let raw=null;
        try{raw=read()}catch{raw=null}
        if(raw!=null)return {from,codes:codesOf(raw)};
      }
      return {from:'cfg.oneDcDefault',codes:codesOf(cfg('oneDcDefault'))};
    }
    const oneDcSource=()=>oneDcResolved().from;
    const slaOneDcCodes=()=>oneDcResolved().codes;
    // Origin building of a load: AFT exposes it as the source warehouse / the prefix of
    // the shipment reference (QYY4_... or QYY4-...).
    function originBuildingOf(identity){
      const direct=txt(identity?.trailerName);
      if(direct)return direct.toUpperCase();
      const ref=txt(identity?.shipmentId);
      if(!ref)return '';
      return (ref.includes('_')?ref.split('_')[0]:ref.split('-')[0]).toUpperCase();
    }
    const isOneDcOrigin=o=>{const n=norm(o);return !!n&&slaOneDcCodes().some(p=>n.startsWith(p))};
    // Classification of a load as it stands right now, independent of any cached entry.
    function classifyIdentity(identity){
      const declared=declaredKind(identity);
      const oneDc=typeof pmmLoadIsOneDc==='function'?pmmLoadIsOneDc(identity,slaOneDcCodes()):
        declared==='1dc'||(!declared&&isOneDcOrigin(originBuildingOf(identity)));
      return {declared,oneDc};
    }

    // ---- classification ------------------------------------------------------
    // Optional: a host that supplies identity.classification (ONE_DC / REACTIVE /
    // NON_REACTIVE) is believed over any percentage. No current page source fills this
    // field in - loadIdentity() does not carry it today - so it is an interface for a
    // source that knows its classification, not a field observed on a live payload.
    const DECLARED={ONEDC:'1dc','1DC':'1dc',REACTIVE:'reactive',NONREACTIVE:'nr',NR:'nr',NOTREACTIVE:'nr'};
    function declaredKind(identity){
      return DECLARED[norm(identity?.classification??identity?.slaClassification)]||'';
    }
    // percentageOfReactiveItems has never been observed on a live payload, so its scale
    // is a setting, not an assumption. While the unit is unconfirmed a value in
    // 0 < v <= 1 is refused: read as a percent it is non-reactive (24h), read as a
    // fraction it can be reactive (4h), and picking one would hand out a confidently
    // wrong deadline. Missing or out-of-range values are refused the same way.
    // The unit is a user preference, so it is per browser tab (3.7.3). Precedence:
    //   1. cfg('reactivePctUnit')     explicit injection by the host script or a test
    //   2. tabPrefRead(settingKey)    the monitor's tab-local preference store; when the
    //      host provides it, it is the only answer - falling back to the shared GM value
    //      afterwards would let another tab's unit decide this tab's deadlines
    //   3. GM settingKey              only when there is no host store (SLA standalone)
    function pctUnitSetting(){
      const injected=cfg('reactivePctUnit');
      if(injected!=null&&txt(injected))return injected;
      if(typeof tabPrefRead==='function')return tabPrefRead(cfg('pctUnitSettingKey'),null);
      return gmGetValue(cfg('pctUnitSettingKey'),null);
    }
    function pctUnit(){
      const raw=txt(pctUnitSetting()).toLowerCase();
      if(raw==='percent'||raw==='fraction')return {unit:raw,confirmed:true};
      return {unit:'percent',confirmed:false};
    }
    // `at` pins the unit a caller already captured: resolveFresh reads the percentage
    // after several awaits, and the unit is a preference the user can change in between.
    // Reading it again there would compute the deadline under the new unit while the
    // entry is stamped with the rules of the old one - a 0.9 that was 90% for this tab
    // becoming non-reactive for every tab that still reads percentages.
    function readPct(raw,at){
      const {unit,confirmed}=at||pctUnit();
      // Only a finite number, or a string that is entirely a number, is a percentage.
      // true, '', ' ' and [] all coerce to 0 or 1 and would fabricate a 24h (or 4h)
      // deadline out of a field AFT never sent.
      const numeric=typeof raw==='number'||(typeof raw==='string'&&raw.trim()!==''&&Number.isFinite(Number(raw.trim())));
      const v=numeric?Number(typeof raw==='string'?raw.trim():raw):NaN;
      if(!numeric||!Number.isFinite(v))
        return {ok:false,unit,confirmed,reason:'AFT manifest carries no usable reactive percentage for this load'};
      if(v<0)return {ok:false,unit,confirmed,reason:`AFT reactive value ${v} is out of range for a ${unit}`};
      if(unit==='fraction'){
        if(v>1)return {ok:false,unit,confirmed,reason:`AFT reactive value ${v} is out of range for a fraction (0-1)`};
        return {ok:true,unit,confirmed,pct:v*100,raw:v};
      }
      if(v>100)return {ok:false,unit,confirmed,reason:`AFT reactive value ${v} is out of range for a percentage (0-100)`};
      if(!confirmed&&v>0&&v<=1)
        return {ok:false,unit,confirmed,ambiguous:true,
          reason:`AFT reactive value ${v} is ambiguous (0-100% or 0-1 fraction) - set the SLA reactive-percentage unit in Settings`};
      return {ok:true,unit,confirmed,pct:v,raw:v};
    }
    // Deadline bases. The 1DC row has no receive fallback by design: an IDX arrival is
    // the only base for a 12h 1DC deadline, and a missing arrival produces no deadline.
    const RULES={
      '1dc':{slaKey:'oneDcSlaMs',stampKey:'arrivalMs',amberKey:'amberOneDcMs',basis:'IDX arrival + 12h'},
      reactive:{slaKey:'reactiveSlaMs',stampKey:'receivedMs',amberKey:'amberReactiveMs',basis:'AFT receive + 4h'},
      nr:{slaKey:'nrSlaMs',stampKey:'receivedMs',amberKey:'amberNrMs',basis:'AFT receive + 24h'}
    };
    function dueFor(kind,stamps){
      const r=RULES[kind];
      if(!r)return 0;
      const base=num(stamps&&stamps[r.stampKey]);
      return base?base+cfg(r.slaKey):0;
    }
    // The cache key is the shipment AND the VRID together: the same shipment reference
    // re-driven on a different trailer is a different load with a different arrival, and
    // a key that ignored the VRID would hand it the old deadline (including after a
    // reload, where the only evidence is the cache).
    function identityKey(identity){
      const ship=txt(identity?.shipmentId).toUpperCase(),vrid=txt(identity?.loadId).toUpperCase();
      if(ship&&vrid)return 'ship:'+ship+'|vrid:'+vrid;
      if(ship)return 'ship:'+ship;
      if(vrid)return 'vrid:'+vrid;
      return '';
    }
    // Every stored entry carries the fingerprint of the rules that produced it. Change a
    // rule - the threshold, any SLA length, the configured 1DC list, the percentage unit
    // - and every entry written under the old rules stops being readable: a deadline is
    // only ever displayed for the rules in force right now.
    function rulesFingerprint(){
      const {unit,confirmed}=pctUnit();
      return [VERSION,cfg('reactiveMinPct'),cfg('reactiveSlaMs'),cfg('nrSlaMs'),cfg('oneDcSlaMs'),
        slaOneDcCodes().join('+'),unit,confirmed?'set':'inherited'].join('/');
    }

    // ---- cache (one GM key per load) ----------------------------------------
    // One key per load, never one map holding all of them: two tabs resolving two
    // different loads used to read-modify-write the same map and silently drop each
    // other's entry. Reads go to GM storage whenever it exists, so a value another tab
    // wrote is seen instead of being masked by this page's memory; the memory map is the
    // store of record only when GM storage is absent (headless tests).
    const memStore=new Map();
    let migrated=false;
    function migrateRetired(){
      if(migrated)return;migrated=true;
      for(const k of cfg('retiredKeys')||[])if(gmGetValue(k,null)!=null)gmDeleteValue(k);
    }
    const entryKeyOf=k=>cfg('entryPrefix')+k;
    function readEntryRaw(key){
      migrateRetired();
      if(gmSync()){const v=gmGetValue(entryKeyOf(key),null);return (v&&typeof v==='object')?v:null}
      const v=memStore.get(key);
      return (v&&typeof v==='object')?v:null;
    }
    function writeEntryRaw(key,val){memStore.set(key,val);if(gmSync())gmSetValue(entryKeyOf(key),val)}
    function deleteEntryRaw(key){memStore.delete(key);gmDeleteValue(entryKeyOf(key))}
    function indexAll(){
      const raw=gmSync()
        ?gmGetValue(cfg('indexKey'),null)
        :{v:VERSION,keys:Object.fromEntries([...memStore].map(([k,v])=>[k,num(v&&v.ts)]))};
      // The prior v2 index is cleanup metadata only, never evidence for a deadline.
      return (raw&&(raw.v===VERSION||raw.v==='sla-2.0.0')&&raw.keys&&typeof raw.keys==='object')?{...raw.keys}:{};
    }
    // Hard TTL first, then oldest-first down to maxEntries. A dropped key has its own GM
    // key deleted, so pruning actually reclaims the storage it was holding.
    function indexTouch(key,ts){
      const idx=indexAll(),cut=now()-cfg('entryTtlMs'),drop=[];
      idx[key]=ts;
      for(const [k,t] of Object.entries(idx))if(k!==key&&!(num(t)>cut)){drop.push(k);delete idx[k]}
      const keys=Object.keys(idx);
      if(keys.length>cfg('maxEntries')){
        keys.sort((a,b)=>num(idx[a])-num(idx[b]));
        for(const k of keys.slice(0,keys.length-cfg('maxEntries')))if(k!==key){drop.push(k);delete idx[k]}
      }
      for(const k of drop)deleteEntryRaw(k);
      if(gmSync())gmSetValue(cfg('indexKey'),{v:VERSION,keys:idx});
      return idx;
    }
    function getEntry(key){
      if(!key)return null;
      const raw=readEntryRaw(key);
      if(!raw)return null;
      // Written by another module version, or under rules that are no longer in force.
      if(raw.v!==VERSION||raw.rules!==rulesFingerprint())return null;
      return raw;
    }
    // An entry is stamped with the rules that produced it, which is not always the rules
    // in force at the moment of the write: the percentage unit is per-tab and the 1DC list is shared;
    // either can change while a lookup is still in flight. A patch carrying
    // its own `rules` (resolveFresh captures the fingerprint before it starts, a held
    // entry carries the one it was verified under) keeps that stamp, so a deadline is
    // never relabelled as though it had been computed under the new settings - instead it
    // stops being readable, and the load is resolved again.
    function putEntry(key,patch){
      if(!key)return null;
      const rules=txt(patch&&patch.rules)||rulesFingerprint();
      const next={...(getEntry(key)||{}),...patch,key,v:VERSION,rules,ts:now()};
      writeEntryRaw(key,next);
      indexTouch(key,next.ts);
      return next;
    }
    // The synchronous write above is what keeps render()/slaHtml() synchronous; this
    // awaits the async storage API as well, so the value is persisted before the Web
    // Lock is released and the next tab reads it.
    async function flushEntry(key,val){
      try{if(globalThis.GM?.setValue)await GM.setValue(entryKeyOf(key),val)}catch{}
    }
    async function putEntryAsync(key,patch){
      const e=putEntry(key,patch);
      if(e)await flushEntry(key,e);
      return e;
    }
    function entryTtl(e){
      if(!e)return 0;
      if(e.state==='ok')return cfg('resolvedTtlMs');
      if(e.state==='pending')return cfg('pendingTtlMs');
      // 'stale' and 'warn' both follow the error backoff: a failing source is retried on
      // 1/2/5/10/15 min, never on every monitor scan.
      const n=Math.min(num(e.attempts)||1,cfg('backoffsMs').length)-1;
      return cfg('backoffsMs')[Math.max(0,n)];
    }
    const fresh=e=>!!e&&now()-num(e.ts)<entryTtl(e);
    // An entry is only evidence about the load as it is classified now. If the page (or
    // the 1DC setting) now says something different from what produced the entry, the
    // entry is not shown and not reused: a reactive deadline must never be displayed for
    // a load the source now calls non-reactive, or 1DC.
    function entryMatches(e,identity){
      if(!e)return false;
      const c=classifyIdentity(identity);
      // A declared classification must be the one this entry was resolved as. With no
      // declaration, an entry that only exists because something declared it is not
      // reused either: the declaration that produced its deadline is gone.
      if(c.declared)return e.kind===c.declared||e.declared===c.declared;
      return !e.declared&&!!e.oneDc===c.oneDc;
    }
    const entryFor=identity=>{const e=getEntry(identityKey(identity));return entryMatches(e,identity)?e:null};
    function purge(){
      for(const k of Object.keys(indexAll()))deleteEntryRaw(k);
      memStore.clear();manifestMem=null;
      gmDeleteValue(cfg('indexKey'));gmDeleteValue(cfg('manifestKey'));
    }

    // ---- cross-tab coordination ---------------------------------------------
    // Web Locks, not a stored timestamp: a read-then-write lock stamp lets two tabs that
    // both read an empty stamp start the same bulk pull. Web Locks are scoped to ONE
    // origin, so this serialises the tabs of a single AFT hostname only - tabs on the
    // other AFT hostname are a different origin and are NOT coordinated with them. In a
    // context without navigator.locks the callback still runs, but it runs unserialised:
    // the fallback is advisory only, which is why `coordinated` is reported.
    const locksOk=()=>typeof globalThis.navigator?.locks?.request==='function';
    function withLock(name,fn){
      if(!locksOk())return Promise.resolve().then(()=>fn(false));
      return navigator.locks.request(cfg('lockPrefix')+name,{mode:'exclusive'},()=>fn(true));
    }

    // ---- HTTP (GET only, allowlisted, bounded hops, never blocking) ---------
    const httpLog=[];
    function logHttp(row){httpLog.push(row);if(httpLog.length>20)httpLog.shift()}
    function gmGet(url,headers,deadline){
      if(!allowed(url))return Promise.resolve({status:0,text:'',error:'not an allowlisted https host: '+(hostOf(url)||url)});
      const left=deadline?Math.max(1,deadline-now()):cfg('reqTimeoutMs');
      const timeout=Math.min(cfg('reqTimeoutMs'),left);
      return new Promise(resolve=>{
        const done=r=>{
          logHttp({url,status:r.status,finalUrl:r.finalUrl||'',error:r.error||'',at:now()});
          resolve(r);
        };
        try{
          GM_xmlhttpRequest({
            method:'GET',url,timeout,anonymous:false,
            headers:headers||{Accept:'application/json'},
            // Detection, not prevention: by the time onload runs the redirect has
            // already been followed. An off-allowlist final URL means the body is
            // discarded unparsed, not that the request was stopped.
            onload:r=>{
              const finalUrl=String(r.finalUrl||url);
              if(finalUrl!==url&&!allowed(finalUrl))
                return done({status:Number(r.status)||0,text:'',finalUrl,error:'response came from an off-allowlist host, discarded: '+(hostOf(finalUrl)||'unknown')});
              done({status:Number(r.status)||0,text:String(r.responseText||''),finalUrl,error:''});
            },
            onerror:r=>done({status:Number(r&&r.status)||0,text:'',error:'request blocked or failed'}),
            ontimeout:()=>done({status:0,text:'',error:'timed out after '+Math.round(timeout/1000)+'s'})
          });
        }catch(err){done({status:0,text:'',error:txt(err&&err.message||err)||'request threw'})}
      });
    }
    const asJson=r=>{try{return JSON.parse(r.text)}catch{return undefined}};
    const looksAuth=b=>/<html|<!doctype|midway|sign.?in|federate|authportal/i.test(b||'');
    const AUTH_WARN='Sign-in needed (Midway) — open AFT/IDX in this browser, sign in, then wait for the retry.';

    // IDX sits behind Midway/Federate and answers an unauthenticated API call with an
    // HTML interstitial. Follow at most maxHops of those, only to allowlisted https hosts,
    // inside the shared budget; anything else is reported as an auth failure.
    async function idxJson(url,deadline){
      const dec=s=>String(s).replace(/&amp;/g,'&').replace(/&#x2F;/gi,'/').replace(/&#47;/g,'/').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
      const nextFrom=html=>{
        const pats=[/<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["'][^"']*url=([^"'>]+)/i,
          /window\.location(?:\.(?:href|replace|assign))?\s*=?\s*\(?\s*["']([^"']+)["']/i,
          /\blocation\.(?:href|replace|assign)\s*=?\s*\(?\s*["']([^"']+)["']/i,
          /<form[^>]+action=["']([^"']+)["']/i];
        for(const re of pats){const m=html.match(re);if(m&&m[1])return dec(m[1].trim())}
        return null;
      };
      let cur=url;
      for(let hop=0;hop<=cfg('maxHops');hop++){
        if(now()>=deadline)return {ok:false,reason:'budget exhausted',hops:hop};
        const r=await gmGet(cur,{Accept:'application/json',Origin:cfg('idxOrigin'),Referer:cfg('idxOrigin')+'/'},deadline);
        if(r.error)return {ok:false,reason:r.error,hops:hop,status:r.status};
        const j=asJson(r);
        if(j!==undefined)return {ok:r.status===200,status:r.status,data:j,hops:hop,reason:r.status===200?'':'HTTP '+r.status};
        if(!looksAuth(r.text))return {ok:false,reason:'non-JSON response (HTTP '+r.status+')',hops:hop,status:r.status};
        let next=nextFrom(r.text);
        if(!next)return {ok:false,reason:'auth',hops:hop,status:r.status};
        if(next.startsWith('//'))next='https:'+next;
        else if(next.startsWith('/')){try{next=new URL(next,r.finalUrl||cur).href}catch{}}
        if(!allowed(next))return {ok:false,reason:'auth redirect off allowlist: '+(hostOf(next)||'unknown'),hops:hop};
        cur=next;
      }
      return {ok:false,reason:'auth',hops:cfg('maxHops')};
    }

    // ---- AFT manifests (shared bounded index + complete-response matches) ----
    // The 1,200-row index is an optimization, never evidence that a load is absent
    // or unambiguous. Fresh pulls match against ALL returned rows before truncating.
    // A truncated cache needs a saved full-response match for this exact identity;
    // even a cache hit may hide a conflicting row beyond the cutoff.
    // At most maxEntries match results are retained (including misses/conflicts).
    // An unseen identity triggers one coordinated two-range pull, not a retry loop.
    const ymd=ms=>new Date(ms).toISOString().split('T')[0];
    let manifestMem=null;   // {site,at,base,rows,truncated,lookups}
    const rowOf=m=>({ship:txt(m.amazonShipmentReferenceId)||'',vrid:txt(m.trailerId)||'',
      rcv:num(m.receiveDateUTC),pct:m.percentageOfReactiveItems??null,units:Number(m.numberOfItems)||0});
    function limitManifestRows(rows,cap=cfg('maxManifestRows')){
      if(rows.length<=cap)return {rows,truncated:false};
      return {rows:rows.slice().sort((a,b)=>b.rcv-a.rcv).slice(0,cap),truncated:true};
    }
    function compactRows(list,cap=cfg('maxManifestRows')){
      const seen=new Set(),rows=[];
      for(const m of list||[]){
        if(!m||!(m.amazonShipmentReferenceId||m.trailerId))continue;
        // Identical overlaps collapse, but conflicting timestamps/percentages survive.
        const r=rowOf(m),k=JSON.stringify([norm(r.ship),norm(r.vrid),r.rcv,r.pct]);
        if(seen.has(k))continue;
        seen.add(k);rows.push(r);
      }
      return limitManifestRows(rows,cap);
    }
    function manifestStore(){
      const v=gmGetValue(cfg('manifestKey'),null);
      return (v&&typeof v==='object'&&v.v===VERSION&&v.sites&&typeof v.sites==='object')?v.sites:{};
    }
    // Another tab's newer index/proofs must not stay hidden behind page memory.
    function manifestCached(site){
      const e=manifestStore()[site];
      const fromGm=(e&&Array.isArray(e.rows)&&now()-num(e.at)<cfg('manifestTtlMs'))
        ?{site,at:num(e.at),base:e.base||'',rows:e.rows,truncated:!!e.truncated,
          lookups:Array.isArray(e.lookups)?e.lookups:[]}:null;
      const fromMem=(manifestMem&&manifestMem.site===site&&now()-manifestMem.at<cfg('manifestTtlMs'))?manifestMem:null;
      if(fromGm&&(!fromMem||fromGm.at>=fromMem.at)){manifestMem={...fromGm};return {...fromGm,from:'gm'}}
      return fromMem?{...fromMem,from:'mem'}:null;
    }
    async function manifestSave(site,base,rows,truncated,lookups=[]){
      manifestMem={site,at:now(),base,rows,truncated,lookups};
      const all=manifestStore(),kept={};
      for(const [k,v] of Object.entries(all))if(v&&now()-num(v.at)<cfg('manifestTtlMs')&&k!==site)kept[k]=v;
      kept[site]={at:now(),base,rows,truncated,lookups};
      const payload={v:VERSION,sites:kept};
      gmSetValue(cfg('manifestKey'),payload);
      try{if(globalThis.GM?.setValue)await GM.setValue(cfg('manifestKey'),payload)}catch{}
    }
    function manifestCachedAnswer(cached,identity){
      if(!cached)return null;
      const out={ok:true,base:cached.base,rows:cached.rows,truncated:cached.truncated,from:cached.from};
      if(!identity)return out; // index-only diagnostic/test callers
      if(!cached.truncated)return {...out,match:matchManifest(cached.rows,identity),matchScope:'complete-index'};
      const proof=(cached.lookups||[]).find(x=>x.key===identityKey(identity));
      return proof?{...out,match:proof.match,matchScope:'shared-full-match'}:null;
    }
    async function manifestIndex(site,deadline,identity=null){
      const hit=manifestCachedAnswer(manifestCached(site),identity);
      if(hit)return hit;
      // One lock for all sites: their bounded indexes share one GM key.
      return withLock('manifest',async locked=>{
        const cached=manifestCached(site);
        const again=manifestCachedAnswer(cached,identity);
        if(again)return {...again,from:'lock:'+again.from,coordinated:locked};
        if(now()>=deadline)
          return {ok:false,busy:true,coordinated:locked,
            reason:'Waited for another monitor tab to load the AFT manifest index'};
        const t=now(),ranges=[[t-21*864e5,t],[t,t+21*864e5]];
        for(const base of cfg('aftBases')){
          if(now()>=deadline)break;
          const res=[];
          for(const [a,b] of ranges)
            res.push(await gmGet(`${base}/inbound/getTransferManifestsByDateAndSourceWarehouse/?startDate=${ymd(a)}&endDate=${ymd(b)}&warehouseId=${encodeURIComponent(site)}`,null,deadline));
          const lists=res.map(asJson);
          if(res.every(r=>r.status===200)&&lists.every(Array.isArray)){
            const full=compactRows([].concat(...lists),Infinity).rows;
            const match=identity?matchManifest(full,identity):null;
            const {rows,truncated}=limitManifestRows(full);
            const key=identityKey(identity);
            // Refresh retained proofs against this same full response. Never attach an
            // old proof to a new timestamp, and never grow persistent storage unbounded.
            const queries=(cached?.lookups||[]).filter(x=>x.key!==key&&x.identity);
            if(identity&&key)queries.push({key,identity:{shipmentId:txt(identity.shipmentId),loadId:txt(identity.loadId)}});
            const lookups=truncated?queries.slice(-cfg('maxEntries')).map(q=>({key:q.key,identity:q.identity,
              match:q.key===key?match:matchManifest(full,q.identity)})):[];
            await manifestSave(site,base,rows,truncated,lookups);
            return {ok:true,base,rows,truncated,match,matchScope:'full-response',from:'fetch',coordinated:locked};
          }
          if(res.some(r=>r.status===401||r.status===403||looksAuth(r.text)))
            return {ok:false,auth:true,reason:AUTH_WARN,coordinated:locked};
        }
        return {ok:false,reason:'Could not reach AFT Transship Hub.',coordinated:locked};
      });
    }
    // Both identities must agree. When the page knows the shipment reference AND the
    // VRID, a manifest row is only accepted if it carries the same pair (a row with no
    // trailerId at all is unknown, not a conflict). A shipment that AFT ties to a
    // different VRID is rejected outright rather than used for a deadline, and so is a
    // set of rows with disagreeing receive stamps.
    function matchManifest(rows,identity){
      const ship=norm(identity?.shipmentId),vrid=norm(identity?.loadId);
      const all=(rows||[]).filter(Boolean);
      if(!ship&&!vrid)return {ok:false,reason:'no shipment reference or VRID on the page yet'};
      const byShip=ship?all.filter(r=>norm(r.ship)===ship):[];
      const byVrid=vrid?all.filter(r=>norm(r.vrid)===vrid):[];
      let hits;
      if(ship&&vrid){
        if(!byShip.length&&!byVrid.length)return {ok:false,reason:'not in manifest window'};
        const agree=byShip.filter(r=>!norm(r.vrid)||norm(r.vrid)===vrid);
        const crossed=byShip.length&&!agree.length;
        if(crossed||(!byShip.length&&byVrid.length))
          return {ok:false,ambiguous:true,
            reason:'AFT manifest disagrees with the page: shipment '+(identity.shipmentId||'?')+' is not tied to VRID '+(identity.loadId||'?')};
        hits=agree;
      }else hits=byShip.length?byShip:byVrid;
      if(!hits.length)return {ok:false,reason:'not in manifest window'};
      const stamps=[...new Set(hits.map(r=>num(r.rcv)))];
      if(stamps.length>1)return {ok:false,ambiguous:true,reason:'AFT returned '+hits.length+' manifests with different receive times for this load'};
      // Same stamp, disagreeing reactive percentages: picking the first row would pick a
      // classification (4h or 24h) at random.
      const pcts=[...new Set(hits.map(r=>String(r.pct)))];
      if(pcts.length>1)return {ok:false,ambiguous:true,reason:'AFT returned '+hits.length+' manifests with different reactive percentages for this load'};
      return {ok:true,m:hits[0]};
    }

    // ---- IDX appointment (by VRID only, conservative selection) -------------
    function vridFieldsOf(a){
      const at=a&&a.attributes||{};
      return [a&&a.vrid,a&&a.loadId,a&&a.trailerId,a&&a.carrierTrailerId,a&&a.isa,
        at.VRID&&at.VRID.value,at.LOAD_ID&&at.LOAD_ID.value,at.TRAILER_ID&&at.TRAILER_ID.value];
    }
    const arrivalOf=a=>num(a&&a.arrivalDate&&a.arrivalDate.utcMillis);
    // Never selects by door number: a door is shared by unrelated trailers, so the door
    // heuristic can attach a stranger's arrival time to this load. An appointment that
    // does not itself carry this VRID is never accepted, not even as the only result of
    // a VRID search - an unverifiable arrival time would become a wrong deadline.
    function pickAppointment(list,vrid){
      const want=norm(vrid),all=(list||[]).filter(Boolean);
      if(!all.length)return {appt:null,confidence:'none'};
      const verified=all.filter(a=>vridFieldsOf(a).some(v=>v!=null&&norm(v)===want));
      if(!verified.length)return {appt:null,confidence:'unverified'};
      const arrivals=[...new Set(verified.map(arrivalOf).filter(Boolean))];
      if(!arrivals.length)return {appt:verified[0],confidence:'verified'};
      if(Math.max(...arrivals)-Math.min(...arrivals)>60e3)return {appt:null,confidence:'ambiguous'};
      const earliest=Math.min(...arrivals);
      return {appt:verified.find(a=>arrivalOf(a)===earliest)||verified[0],confidence:'verified'};
    }
    async function appointmentArrival(site,vrid,deadline){
      const url=`${cfg('idxBackend')}/v1/appointments/search/${encodeURIComponent(site)}?criteriaName=VRID&criteriaValue=${encodeURIComponent(vrid)}`;
      const res=await idxJson(url,deadline);
      if(!res.ok)return {ok:false,auth:res.reason==='auth',reason:res.reason==='auth'?AUTH_WARN:('IDX: '+res.reason)};
      const list=(res.data&&res.data.appointments)||[];
      const pick=pickAppointment(list,vrid);
      if(!pick.appt)
        return {ok:false,confidence:pick.confidence,
          reason:pick.confidence==='none'?'No IDX appointment for this VRID yet'
            :'IDX returned '+list.length+' appointment(s) that cannot be tied to this VRID'};
      const arrivalMs=arrivalOf(pick.appt);
      if(!arrivalMs)return {ok:false,reason:'IDX appointment has no arrival time yet',confidence:pick.confidence};
      return {ok:true,arrivalMs,confidence:pick.confidence};
    }

    // ---- resolution ----------------------------------------------------------
    const inflight=new Map();   // in-page dedup
    async function resolveFresh(identity){
      // Captured before any await: the whole resolve is attributed to the rules (and the
      // per-tab preferences behind them) that classified this load.
      const rules=rulesFingerprint();
      const unitAtStart=pctUnit();
      const classificationAtStart=JSON.stringify(classifyIdentity(identity));
      const put=(k,patch)=>{
        // A shared edit or newly fetched 1DC match can arrive during an IDX/AFT await.
        // Do not commit the obsolete resolution under the same load key.
        if(rules!==rulesFingerprint()||classificationAtStart!==JSON.stringify(classifyIdentity(identity)))return null;
        return putEntryAsync(k,{...patch,rules});
      };
      const key=identityKey(identity);
      const site=txt(identity?.destinationWarehouse).toUpperCase();
      const origin=originBuildingOf(identity);
      const {declared,oneDc}=classifyIdentity(identity);
      const base={shipmentId:txt(identity?.shipmentId)||null,vrid:txt(identity?.loadId)||null,
        origin:origin||null,oneDc,declared:declared||null,oneDcCodes:slaOneDcCodes()};
      if(!key||!site)
        return put(key||'unknown',{...base,state:'warn',
          warn:'Load identity incomplete (no shipment reference / receiving site yet)',attempts:1,dueMs:0});
      const deadline=now()+cfg('budgetMs');
      const attempts=num(getEntry(key)?.attempts)+1;

      // A 1DC load whose VRID the page already knows needs no manifest: the deadline is
      // IDX arrival + 12h, and a trailer can be arrived (on SLA) before AFT has a
      // receive manifest for it. The manifest is only context here, so it is not
      // fetched; it is still needed when the page has no VRID to search IDX with.
      if(oneDc&&base.vrid){
        const ap=await appointmentArrival(site,base.vrid,deadline);
        if(ap.ok)
          return put(key,{...base,kind:'1dc',state:'ok',arrivalMs:ap.arrivalMs,
            dueMs:dueFor('1dc',{arrivalMs:ap.arrivalMs}),basis:RULES['1dc'].basis,idxConfidence:ap.confidence,
            amberMs:cfg(RULES['1dc'].amberKey),attempts:0,warn:'',note:'',source:'idx'});
        // No arrival means no 1DC deadline: there is no receive fallback for 12h.
        return put(key,{...base,kind:'1dc',state:ap.auth?'warn':(/yet/.test(ap.reason)?'pending':'warn'),
          warn:/yet/.test(ap.reason)?'':ap.reason,note:/yet/.test(ap.reason)?ap.reason:'',
          idxConfidence:ap.confidence||null,attempts,dueMs:0,arrivalMs:0});
      }

      const man=await manifestIndex(site,deadline,identity);
      if(!man.ok)
        return put(key,{...base,state:man.busy?'pending':'warn',
          warn:man.busy?'':(man.auth?AUTH_WARN:man.reason),note:man.busy?man.reason:'',attempts,dueMs:0});
      base.manifestLookup={from:man.from,scope:man.matchScope,indexRows:man.rows.length,truncated:man.truncated};
      const hit=man.match;
      if(!hit.ok)
        return put(key,{...base,state:hit.ambiguous?'warn':'pending',
          warn:hit.ambiguous?hit.reason:'',
          note:hit.ambiguous?'':(hit.reason==='not in manifest window'?'not in complete returned manifest window':hit.reason),
          attempts,dueMs:0});

      const m=hit.m;
      const receivedMs=num(m.rcv);
      const pct=readPct(m.pct,unitAtStart);
      const vrid=txt(m.vrid)||base.vrid;
      const common={...base,vrid:vrid||null,units:Number(m.units)||0,
        reactivePct:pct.ok?pct.pct:null,reactivePctRaw:m.pct??null,
        pctUnit:pct.unit,pctUnitConfirmed:pct.confirmed,aftBase:man.base};

      if(oneDc){
        // Reached only when the page had no VRID: the manifest supplied one.
        if(!vrid)
          return put(key,{...common,kind:'1dc',state:'pending',
            note:'No VRID on the manifest yet',attempts,dueMs:0,receivedMs,arrivalMs:0});
        const ap=await appointmentArrival(site,vrid,deadline);
        // No arrival, no 1DC deadline. The receive stamp is stored for context only:
        // substituting it would move the deadline by the whole yard dwell.
        if(!ap.ok)
          return put(key,{...common,kind:'1dc',state:ap.auth?'warn':(/yet/.test(ap.reason)?'pending':'warn'),
            warn:/yet/.test(ap.reason)?'':ap.reason,note:/yet/.test(ap.reason)?ap.reason:'',
            idxConfidence:ap.confidence||null,attempts,dueMs:0,receivedMs,arrivalMs:0});
        return put(key,{...common,kind:'1dc',state:'ok',receivedMs,arrivalMs:ap.arrivalMs,
          dueMs:dueFor('1dc',{arrivalMs:ap.arrivalMs}),basis:RULES['1dc'].basis,idxConfidence:ap.confidence,
          amberMs:cfg(RULES['1dc'].amberKey),attempts:0,warn:'',note:''});
      }
      // Reactive vs non-reactive: a declared classification wins, otherwise the
      // inherited 80% threshold decides. An unusable percentage produces no deadline at
      // all rather than a confident 4h or 24h guess.
      let kind=(declared==='reactive'||declared==='nr')?declared:'';
      if(!kind){
        if(!pct.ok)
          return put(key,{...common,kind:'unknown',state:'warn',warn:pct.reason,
            ambiguousPct:!!pct.ambiguous,attempts,dueMs:0,receivedMs});
        kind=pct.pct>=cfg('reactiveMinPct')?'reactive':'nr';
      }
      if(!receivedMs)
        return put(key,{...common,kind,state:'pending',note:'Not received yet',attempts,dueMs:0});
      return put(key,{...common,kind,state:'ok',receivedMs,
        dueMs:dueFor(kind,{receivedMs}),basis:RULES[kind].basis,
        amberMs:cfg(RULES[kind].amberKey),attempts:0,warn:'',note:''});
    }
    // A receive/arrival stamp cannot change once AFT/IDX reported it, so a transient
    // failure (expired Midway, AFT blip) must not make a deadline vanish: the verified
    // deadline is kept, flagged `stale` with the reason, and the normal backoff keeps
    // retrying. Nothing is ever invented, and a held deadline must still belong to this
    // load under today's rules: same cache key, same rules fingerprint, same
    // classification family, and a deadline still reproducible from its own verified
    // stamp. A load that was reactive and is now 1DC - or whose rules changed under it -
    // is resolved from scratch instead of inheriting a deadline from another rule.
    function holdable(prior,identity){
      if(!prior||!num(prior.dueMs))return false;
      if(prior.state!=='ok'&&prior.state!=='stale')return false;
      if(prior.v!==VERSION||prior.rules!==rulesFingerprint())return false;
      if(prior.key!==(identityKey(identity)||'unknown'))return false;
      if(dueFor(prior.kind,prior)!==num(prior.dueMs))return false;
      if(!entryMatches(prior,identity))return false;
      const {declared,oneDc}=classifyIdentity(identity);
      // A declared classification must match exactly: an explicitly non-reactive load
      // may not inherit the 4h deadline it had while it was reactive, or the reverse.
      if(declared)return prior.kind===declared;
      return oneDc?prior.kind==='1dc':(prior.kind==='reactive'||prior.kind==='nr');
    }
    function holdPatch(prior,reason,attempts){
      return {...prior,state:'stale',warn:reason||'could not re-verify the SLA source',
        attempts:num(attempts)||num(prior.attempts)||1,
        verifiedAt:num(prior.verifiedAt)||num(prior.ts)};
    }
    async function resolveNow(identity){
      const key=identityKey(identity)||'unknown';
      const prior=getEntry(key);
      const entry=await resolveFresh(identity);
      if(entry&&(entry.state==='warn'||entry.state==='pending')&&holdable(prior,identity))
        return putEntryAsync(key,holdPatch(prior,entry.warn||entry.note,num(entry.attempts)));
      // Merged over the entry just written, not over whatever is in storage now: the
      // rules stamp and every resolved field stay those of this lookup.
      if(entry&&entry.state==='ok')return putEntryAsync(key,{...entry,verifiedAt:now(),warn:''});
      return entry;
    }

    // Dedup: in-page via `inflight`, across tabs and across a reload via an exclusive
    // Web Lock on the load key - no inflight timestamp to go stale after a reload. A tab
    // that arrives second waits, then finds the fresh entry the first tab persisted and
    // issues no requests of its own.
    function resolve(identity){
      const key=identityKey(identity)||'unknown';
      if(inflight.has(key))return inflight.get(key);
      const p=withLock('load:'+key,async()=>{
        const cached=entryFor(identity);
        if(fresh(cached))return cached;
        try{return await resolveNow(identity)}
        catch(err){
          // A thrown lookup never discards a deadline that was already verified for this
          // same load under these same rules.
          const reason='SLA lookup failed: '+(txt(err&&err.message||err)||'unknown error');
          const prior=getEntry(key);
          if(holdable(prior,identity))return putEntryAsync(key,holdPatch(prior,reason));
          return putEntryAsync(key,{state:'warn',warn:reason,attempts:num(prior?.attempts)+1,dueMs:0});
        }
      }).finally(()=>inflight.delete(key));
      inflight.set(key,p);
      return p;
    }

    // ---- formatting ----------------------------------------------------------
    const EASTERN='America/New_York';
    function fmtEastern(ms,opts){
      try{return new Intl.DateTimeFormat('en-US',{timeZone:EASTERN,...opts}).format(new Date(ms))}
      catch{return new Date(ms).toISOString()}
    }
    // Explicit date on the deadline so a 4 h / 12 h SLA that lands tomorrow cannot be
    // misread as today.
    const dueText=ms=>fmtEastern(ms,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' ET';
    // The stamp carries its date and zone too: a 1DC load can arrive the day before its
    // deadline, and a bare "4:02 PM" next to a 4:02 AM due time reads as nonsense.
    const clockText=ms=>fmtEastern(ms,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' ET';
    function spanText(ms){
      const total=Math.round(Math.abs(ms)/60000),h=Math.floor(total/60),min=total%60;
      return h?`${h}h ${String(min).padStart(2,'0')}m`:`${min}m`;
    }
    function countdown(dueMs,amberMs,at){
      const left=dueMs-at;
      if(left<0)return {cls:'sla-late',text:'OVERDUE '+spanText(left)};
      return {cls:left<=(amberMs||cfg('amberReactiveMs'))?'sla-amber':'sla-ok',text:spanText(left)+' left'};
    }
    const KIND_LABEL={'1dc':'1DC',reactive:'Reactive',nr:'Non-reactive',unknown:''};
    // Pure render: no fetching, no clock reading beyond `at`, safe to call every tick.
    function render(entry,at){
      const t=at||now();
      if(!entry)return {cls:'sla-idle',html:'<b>SLA</b> checking…'};
      const kind=KIND_LABEL[entry.kind]||'';
      const tag=kind?`<span class="sla-kind">${esc(kind)}</span>`:'';
      if((entry.state==='ok'||entry.state==='stale')&&num(entry.dueMs)){
        const c=countdown(num(entry.dueMs),num(entry.amberMs),t);
        const stampLabel=entry.kind==='1dc'?'Arrived':'Received';
        const stampMs=entry.kind==='1dc'?num(entry.arrivalMs):num(entry.receivedMs);
        const stamp=stampMs?`${stampLabel} ${esc(clockText(stampMs))}`:'';
        const staleMark=entry.state==='stale'
          ?`<span class="sla-cached" title="${esc(entry.warn||'')}">cached</span>`:'';
        return {cls:c.cls,html:`${tag}${stamp?`<span class="sla-stamp">${stamp}</span>`:''}`+
          `<span class="sla-due" title="${esc(entry.basis||'')}">SLA ${esc(dueText(num(entry.dueMs)))}</span>`+
          staleMark+`<b class="sla-left">${esc(c.text)}</b>`};
      }
      if(entry.state==='pending')
        return {cls:'sla-idle',html:`${tag}<b>SLA</b> pending${entry.note?` — ${esc(entry.note)}`:''}`};
      // warn: a problem we could not resolve. Never shows a deadline.
      return {cls:'sla-warn',html:`${tag}<b>SLA unavailable</b> — ${esc(entry.warn||entry.note||'unknown problem')}`};
    }

    // ---- DOM (optional; module works headless for tests) --------------------
    const HOST_ID='pax-sla-line',STYLE_ID='pax-sla-style';
    const CSS=`#${HOST_ID}{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:5px 0;padding:5px 8px;`+
      `border-radius:7px;font-size:11.5px;line-height:1.35;border:1px solid transparent}`+
      `#${HOST_ID} .sla-kind{font-weight:700;letter-spacing:.3px;opacity:.8}`+
      `#${HOST_ID} .sla-cached{font-size:10.5px;padding:0 5px;border-radius:8px;background:rgba(0,0,0,.08);opacity:.85}`+
      `#${HOST_ID} .sla-stamp{opacity:.8}#${HOST_ID} .sla-due{font-weight:600}`+
      `#${HOST_ID} .sla-left{margin-left:auto;white-space:nowrap}`+
      `#${HOST_ID}.sla-ok{background:#eef7ee;border-color:#bcdcbc}`+
      `#${HOST_ID}.sla-amber{background:#fff6e0;border-color:#e3bd6b}`+
      `#${HOST_ID}.sla-late{background:#fdeceb;border-color:#e2a8a2;font-weight:700}`+
      `#${HOST_ID}.sla-warn{background:#fff6e0;border-color:#e3bd6b}`+
      `#${HOST_ID}.sla-idle{background:#f2f2f2;border-color:#dcdcdc;opacity:.9}`+
      `.dark #${HOST_ID}.sla-ok{background:#1d3324;border-color:#2f5c3a}`+
      `.dark #${HOST_ID}.sla-amber,.dark #${HOST_ID}.sla-warn{background:#3b321b;border-color:#7a6424}`+
      `.dark #${HOST_ID}.sla-late{background:#3d211f;border-color:#7d3c36}`+
      `.dark #${HOST_ID}.sla-idle{background:#2b2b2b;border-color:#444}`;
    function ensureStyle(){
      if(typeof document==='undefined'||document.getElementById(STYLE_ID))return;
      const el=document.createElement('style');el.id=STYLE_ID;el.textContent=CSS;
      (document.head||document.documentElement).appendChild(el);
    }
    // Compares against the live node, never a module-local signature: a full panel
    // re-render replaces the node, and a cached signature would then suppress the
    // repaint and leave the fresh node showing "checking...".
    function updateSlaDisplay(identity){
      if(typeof document==='undefined')return false;
      const host=document.getElementById(HOST_ID);
      if(!host)return false;
      ensureStyle();
      const ident=identity||lastIdentity;
      if(host.dataset.slaIdentity!==JSON.stringify([identityKey(ident),txt(ident?.destinationWarehouse)]))return false;
      const out=render(entryFor(ident),now());
      if(host.innerHTML!==out.html)host.innerHTML=out.html;
      if(host.className!==out.cls)host.className=out.cls;
      return true;
    }

    // ---- public tick ---------------------------------------------------------
    let lastIdentity=null,lastCheckAt=0;
    // Cheap and non-blocking: throttled cache inspection, fetches are fire-and-forget.
    function slaTick(identity){
      const ident=identity||lastIdentity;
      if(!ident)return null;
      lastIdentity=ident;
      if(typeof pmmSiteListen==='function')pmmSiteListen();
      if(typeof pmmOneDcRefresh==='function'&&typeof monitorStarted!=='undefined'&&monitorStarted)pmmOneDcRefresh(ident).catch(()=>{});
      const key=identityKey(ident);
      const entry=entryFor(ident);
      if(now()-lastCheckAt>=cfg('tickThrottleMs')){
        lastCheckAt=now();
        if(!fresh(entry)&&!inflight.has(key||'unknown')){
          const kick=()=>{resolve(ident).then(()=>updateSlaDisplay(ident)).catch(()=>{})};
          if(typeof queueMicrotask==='function')queueMicrotask(kick);else setTimeout(kick,0);
        }
      }
      updateSlaDisplay(ident);
      return entry;
    }
    function slaHtml(identity){
      const ident=identity||lastIdentity;
      if(ident)lastIdentity=ident;
      const out=render(entryFor(ident),now());
      return `<div id="${HOST_ID}" data-sla-identity="${esc(JSON.stringify([identityKey(ident),txt(ident?.destinationWarehouse)]))}" class="${out.cls}">${out.html}</div>`;
    }
    // Forces one uncached round trip and reports exactly what the sources said, so an
    // SLA that will not resolve can be diagnosed instead of guessed at.
    async function slaDiagnostic(identity){
      const ident=identity||lastIdentity||{};
      const key=identityKey(ident);
      const before=getEntry(key);
      manifestMem=null;   // force one real pull for the diagnostic
      const startedAt=now();
      let entry=null,error=null;
      try{entry=await resolveNow(ident)}catch(err){error=txt(err&&err.message||err)}
      return {
        version:VERSION,at:new Date(startedAt).toISOString(),
        identity:{shipmentId:ident.shipmentId||null,loadId:ident.loadId||null,
          trailerName:ident.trailerName||null,destinationWarehouse:ident.destinationWarehouse||null,source:ident.source||null},
        classification:{origin:originBuildingOf(ident),oneDcList:slaOneDcCodes(),oneDcSource:oneDcSource(),
          declared:declaredKind(ident)||null,oneDc:classifyIdentity(ident).oneDc,autoDetection:typeof pmmOneDcDiagnostic==='function'?pmmOneDcDiagnostic(ident):null},
        rules:{fingerprint:rulesFingerprint(),reactiveMinPct:cfg('reactiveMinPct'),
          reactiveSlaHours:cfg('reactiveSlaMs')/3600e3,nrSlaHours:cfg('nrSlaMs')/3600e3,
          oneDcSlaHours:cfg('oneDcSlaMs')/3600e3,amberReactiveMin:cfg('amberReactiveMs')/60e3,
          amberOneDcMin:cfg('amberOneDcMs')/60e3,amberNrMin:cfg('amberNrMs')/60e3,
          // Scale of percentageOfReactiveItems is a setting, never inferred from a value.
          reactivePctUnit:pctUnit()},
        cacheKey:key,cachedBefore:before,resolved:entry,error,
        manifestIndex:(()=>{const e=manifestStore()[txt(ident.destinationWarehouse).toUpperCase()]||{};
          return {at:e.at||0,base:e.base||'',rows:Array.isArray(e.rows)?e.rows.length:0,truncated:!!e.truncated}})(),
        // Honest about coordination: without navigator.locks nothing is serialised, and
        // even with it the scope is this one origin.
        coordination:{webLocks:locksOk(),scope:'single origin (this hostname only)'},
        durationMs:now()-startedAt,cacheEntries:Object.keys(indexAll()).length,
        allowHosts:cfg('allowHosts'),requests:httpLog.slice(-12)
      };
    }

    return {version:VERSION,slaTick,slaHtml,slaDiagnostic,updateSlaDisplay,configure,purge,
      hostId:HOST_ID,
      // exposed for the unit tests / diagnostics only
      _internals:{identityKey,originBuildingOf,isOneDcOrigin,oneDcList:slaOneDcCodes,oneDcSource,
        declaredKind,classifyIdentity,entryMatches,entryFor,pctUnit,readPct,dueFor,RULES,rulesFingerprint,
        holdable,matchManifest,pickAppointment,
        render,countdown,spanText,dueText,clockText,resolveNow,resolveFresh,resolve,getEntry,putEntry,putEntryAsync,
        indexAll,indexTouch,entryTtl,fresh,allowed,idxJson,gmGet,withLock,locksOk,manifestIndex,manifestCached,
        manifestStore,compactRows,appointmentArrival,cfg,version:VERSION}};
  })();
  // PMM-CHUNK-BEGIN auth-recovery
  // 3.8.0: automatic sign-in recovery. When access lapses, AFT shows active stowers with
  // "Station: undefined" (or no station). Luis restores it by choosing IT Service Login on
  // the AFT sign-in choice page. This module repeats that one click for him, and nothing
  // else: it never enters or stores credentials, codes, tokens or sign-in addresses, and it
  // never touches tracking, history, refresh pacing or queue ownership.
  //   AFT tab : 2 consecutive CONFIRMED AFT refreshes where every active stower lacks a
  //             station -> one tab claims the shared request and opens the AFT menu login
  //             in a background tab. Max 2 attempts, 15 min apart, then "Sign-in needed".
  //   Sign-in choice page : clicks IT Service Login once, only for a fresh monitor request
  //             and only if the page returns to the AFT menu via the expected authority.
  //   AFT menu : the flow's landing page; records "signed in" and closes that tab.
  // Every AFT refresh reloads the document, so per-tab counters live in sessionStorage and
  // the helper tab closes itself (the opener's tab handle does not survive a reload).
  // Helper pages run before the rest of the script initialises, so the helper path uses
  // only function declarations and local values.
  function authSpec(){
    return {
      stateKey:'pax-monitor-v380-auth-recovery',
      idpHost:'d34wrqb3xn2znf.cloudfront.net',idpPath:'/idp-selection',
      menuHost:'menu.na.aft.amazonoperations.app',
      // The page that sent Luis to the sign-in choice (the referrer in the supplied link).
      startUrl:'https://menu.na.aft.amazonoperations.app/midway/login',
      authorizeHost:'prod.us-east-1.federated-auth.aft.a2z.com',
      providerId:'amazon-federate-prod',providerLabel:'IT Service Login',
      requestTtlMs:120000,landTimeoutMs:90000,claimSettleMs:5000,buttonWaitMs:20000,
      cooldownMs:15*60000,maxAttempts:2,missingRefreshes:2
    };
  }
  function authReadState(){try{const v=GM_getValue(authSpec().stateKey,null);return v&&typeof v==='object'?v:null}catch{return null}}
  function authWriteState(v){try{GM_setValue(authSpec().stateKey,{...v,v:1,updatedAt:Date.now()});return true}catch(err){console.warn('[Pallet Movement Monitor] sign-in state write failed',err);return false}}
  function authRequestFresh(st,now=Date.now()){return !!st&&(st.phase==='requested'||st.phase==='clicked')&&Number(st.requestedAt)>0&&now-Number(st.requestedAt)<authSpec().requestTtlMs}
  function authStationValid(s){const t=String(s??'').trim();return !!t&&!/^(undefined|null|none|n\/?a|-+|\u2014)$/i.test(t)}
  // Checks the sign-in choice page address before anything is clicked.
  function authIdpCheck(href){
    const S=authSpec();let u;
    try{u=new URL(String(href||''))}catch{return {ok:false,reason:'the sign-in page address could not be read'}}
    if(u.protocol!=='https:'||u.hostname!==S.idpHost||!u.pathname.startsWith(S.idpPath))return {ok:false,reason:'this is not the AFT sign-in choice page'};
    const hostOf=k=>{try{return new URL(u.searchParams.get(k)||'').hostname}catch{return ''}};
    if(hostOf('redirect_uri')!==S.menuHost)return {ok:false,reason:'the sign-in page does not return to the AFT menu'};
    if(hostOf('authorize_url')!==S.authorizeHost)return {ok:false,reason:'the sign-in page uses an unexpected sign-in service'};
    let providers=null;try{providers=JSON.parse(u.searchParams.get('data')||'null')}catch{}
    if(!Array.isArray(providers)||!providers.some(p=>p&&p.id===S.providerId&&String(p.displayString||'').trim()===S.providerLabel))return {ok:false,reason:'IT Service Login is not offered on the sign-in page'};
    return {ok:true,reason:''};
  }
  // The visible label is light-DOM text inside <alchemy-button>; the real <button> is in its
  // shadow root. Exact label match only, so "Login with MAASK" can never be chosen.
  function authFindButton(doc){
    const label=authSpec().providerLabel,norm=s=>String(s||'').replace(/\s+/g,' ').trim();
    const host=[...doc.querySelectorAll('alchemy-button')].find(el=>norm(el.textContent)===label);
    if(host)return host.shadowRoot?.querySelector('button')||host;
    return [...doc.querySelectorAll('button')].find(el=>norm(el.textContent)===label)||null;
  }
  // Returns true on a sign-in helper page (the caller then stops: no monitor runs there).
  function pmmAuthHelperPage(){
    const S=authSpec(),host=location.hostname;
    if(host!==S.idpHost&&host!==S.menuHost)return false;
    try{
      const st=authReadState();
      // Not requested by the monitor (for example Luis opened FCResearch): leave it alone.
      if(!authRequestFresh(st))return true;
      if(host===S.idpHost){
        if(st.phase!=='requested')return true; // one click per request
        const check=authIdpCheck(location.href);
        if(!check.ok){authWriteState({...st,phase:'required',message:'Automatic sign-in stopped because '+check.reason+'. Nothing was clicked.'});return true}
        const began=Date.now();
        const tryClick=()=>{
          const cur=authReadState();
          if(!authRequestFresh(cur)||cur.phase!=='requested'||cur.requestId!==st.requestId)return;
          const btn=authFindButton(document);
          if(!btn){
            if(Date.now()-began<S.buttonWaitMs){setTimeout(tryClick,250);return}
            authWriteState({...cur,phase:'required',message:'Automatic sign-in stopped because the IT Service Login button did not appear.'});return;
          }
          authWriteState({...cur,phase:'clicked',clickedAt:Date.now()});
          btn.click();
        };
        if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryClick,{once:true});else tryClick();
        return true;
      }
      // AFT menu: /midway/* and /do/mfa/* are steps of the sign-in flow, not its landing.
      if(/^\/(midway|do\/mfa)(\/|$)/i.test(location.pathname))return true;
      authWriteState({...st,phase:'landed',landedAt:Date.now()});
      setTimeout(()=>{try{window.close()}catch{}},800);
    }catch(err){console.warn('[Pallet Movement Monitor] sign-in helper',err)}
    return true;
  }

  // ---- AFT monitor side ---------------------------------------------------------------
  const AUTH_AUTO_KEY='pax-monitor-v380-auth-auto'; // per-tab preference (TAB_PREF_KEYS)
  const AUTH_STREAK_KEY='pax-monitor-v380-auth-streak';
  let _authStreakMemory={n:0,firstAt:0},_authNoteKey='',_authWatchStarted=false;
  function authAutoEnabled(){return read(AUTH_AUTO_KEY,true)!==false}
  function authStreak(){
    try{const v=JSON.parse(sessionStorage.getItem(AUTH_STREAK_KEY)||'null');if(v&&typeof v==='object')return {n:Math.max(0,Number(v.n)||0),firstAt:Number(v.firstAt)||0}}catch{}
    return {..._authStreakMemory};
  }
  function setAuthStreak(v){_authStreakMemory={...v};try{sessionStorage.setItem(AUTH_STREAK_KEY,JSON.stringify(v))}catch{}}
  const authTime=t=>t?new Date(t).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):'—';
  // Called only for an accepted scan of a CONFIRMED AFT refresh.
  function authObserve(h){
    if(!isAftPage()||!h||h.source!=='aft')return;
    const s=h.diagnostics?.stationStatus;
    if(!s||!(s.stowers>0))return; // no active stowers: no evidence either way
    const st=authReadState(),now=Date.now();
    if(s.valid>0){
      if(authStreak().n)setAuthStreak({n:0,firstAt:0});
      if(st&&!authRequestFresh(st)&&(st.phase&&st.phase!=='idle'||st.attempts)){
        const recovered=st.phase==='landed'||st.phase==='required';
        authWriteState({phase:'idle',attempts:0,lastAttemptAt:st.lastAttemptAt||0,landedAt:st.landedAt||0,
          lastOutcome:recovered?'Station values returned'+(st.landedAt?' after sign-in at '+authTime(st.landedAt):''):'Station values present',lastOutcomeAt:now});
      }
      updateAuthNote();return;
    }
    let streak=authStreak();
    // A sign-in since the streak began starts a new count, so each attempt is judged on
    // refreshes that happened after it.
    if(!streak.n||(st?.landedAt&&streak.firstAt<st.landedAt))streak={n:0,firstAt:now};
    streak={n:streak.n+1,firstAt:streak.firstAt||now};setAuthStreak(streak);
    if(streak.n>=authSpec().missingRefreshes)authMaybeStart(false);
    updateAuthNote();
  }
  function authMaybeStart(manual){
    const S=authSpec(),now=Date.now();
    if(!isAftPage())return false;
    if(!manual&&(!authAutoEnabled()||duplicateViewOnly()))return false;
    const st=authReadState()||{phase:'idle',attempts:0};
    if(authRequestFresh(st,now)||(st.phase==='claim'&&now-Number(st.requestedAt||0)<S.claimSettleMs))return false;
    if(!manual){
      if(st.phase==='required')return false;
      if(st.lastAttemptAt&&now-st.lastAttemptAt<S.cooldownMs)return false;
      if((st.attempts||0)>=S.maxAttempts){authWriteState({...st,phase:'required',message:'Station values are still missing after '+st.attempts+' automatic sign-ins.'});return false}
    }
    // Claim, then re-read after a short random wait: if two tabs claim together, the last
    // write wins and only that tab opens the sign-in tab.
    const requestId=TAB_ID+':'+now;
    authWriteState({...st,phase:'claim',requestId,ownerTab:TAB_ID,requestedAt:now,attempts:manual?0:(st.attempts||0),message:''});
    setTimeout(()=>{
      const cur=authReadState();
      if(cur?.phase!=='claim'||cur.requestId!==requestId)return;
      const at=Date.now();
      authWriteState({...cur,phase:'requested',requestedAt:at,attempts:(cur.attempts||0)+1,lastAttemptAt:at,manual:!!manual});
      try{GM_openInTab(S.startUrl,{active:false,insert:true,setParent:true})}
      catch(err){authWriteState({...(authReadState()||cur),phase:'required',message:'The sign-in tab could not be opened ('+(err?.message||err)+').'})}
      updateAuthNote();
    },300+Math.floor(Math.random()*500));
    return true;
  }
  function authTick(){
    const S=authSpec(),st=authReadState(),now=Date.now();
    if(st&&(st.phase==='requested'||st.phase==='clicked')&&now-Number(st.requestedAt||0)>=S.landTimeoutMs)
      authWriteState({...st,phase:'required',message:st.phase==='clicked'?'IT Service Login was clicked, but sign-in did not finish within 90 seconds. If a sign-in tab is still open, finish it there.':'The sign-in page did not appear within 90 seconds.'});
    updateAuthNote();
  }
  function authNoteInfo(){
    if(!isAftPage())return null;
    const S=authSpec(),st=authReadState(),streak=authStreak(),now=Date.now();
    const missing=streak.n>=S.missingRefreshes;
    if(st&&((st.phase==='claim'&&now-Number(st.requestedAt||0)<S.claimSettleMs)||authRequestFresh(st,now)))return {kind:'busy',text:'Station values are missing, so the monitor is signing in again with IT Service Login in a background tab. Tracking continues.'};
    if(st?.phase==='required')return {kind:'needed',text:'Sign-in needed: '+(st.message||'station values are still missing.')+' Open FCResearch and click IT Service Login, or try again.',button:true};
    if(st?.phase==='landed'&&!(missing&&streak.firstAt>=Number(st.landedAt||0)))return {kind:'done',text:'Signed in again at '+authTime(st.landedAt)+'. Station values should return on the next AFT refresh.'};
    if(missing&&!authAutoEnabled())return {kind:'needed',text:'Station values were missing on the last '+streak.n+' AFT refreshes. Automatic sign-in is off for this tab.',button:true};
    if(missing&&st?.lastAttemptAt&&now-st.lastAttemptAt<S.cooldownMs)return {kind:'wait',text:'Station values are still missing. Next automatic sign-in after '+authTime(st.lastAttemptAt+S.cooldownMs)+'.',button:true};
    return null;
  }
  function authNoteHtml(){
    const info=authNoteInfo();
    return `<div id="auth-recovery-note" class="source-note auth-note auth-${info?.kind||'none'}" role="status" ${info?'':'hidden'}>${info?`<b>Sign-in:</b> ${esc(info.text)}${info.button?' <button id="auth-signin-now" type="button">Try sign-in now</button>':''}`:''}</div>`;
  }
  function wireAuthNote(root){const b=root?.querySelector?.('#auth-signin-now');if(b)b.onclick=()=>{authMaybeStart(true);updateAuthNote()}}
  function updateAuthNote(){
    try{
      const box=document.getElementById('pax-monitor-v311'),el=box?.querySelector('#auth-recovery-note');if(!el)return;
      const html=authNoteHtml();if(html===_authNoteKey&&el.isConnected)return;_authNoteKey=html;
      const tmp=document.createElement('div');tmp.innerHTML=html;const next=tmp.firstElementChild;
      el.replaceWith(next);wireAuthNote(next);
    }catch(err){console.warn('[Pallet Movement Monitor] sign-in note',err)}
  }
  function authStartWatch(){
    if(_authWatchStarted||!isAftPage())return;_authWatchStarted=true;
    setInterval(authTick,2000);
    try{if(typeof GM_addValueChangeListener==='function')GM_addValueChangeListener(authSpec().stateKey,()=>queueMicrotask(updateAuthNote))}catch{}
  }
  function authDiagnostic(){const st=authReadState();return {state:st?{phase:st.phase||'idle',attempts:st.attempts||0,lastAttemptAt:st.lastAttemptAt||null,landedAt:st.landedAt||null,message:st.message||'',lastOutcome:st.lastOutcome||''}:null,missingStationRefreshes:authStreak().n,autoEnabledThisTab:authAutoEnabled()}}
  // PMM-CHUNK-END auth-recovery
  function slaTick(identity){return SLA.slaTick(identity)}
  function slaHtml(identity){return SLA.slaHtml(identity)}
  function slaDiagnostic(identity){return SLA.slaDiagnostic(identity)}
  function updateSlaDisplay(identity){return SLA.updateSlaDisplay(identity)}
  // ===================== end SLA module (injectable block) =====================

  let refreshTimer=0,_refreshRequest=null,_clickFromMonitor=false,_manualRefreshAt=0,_tabHeartbeat=0,_sourceHeartbeat=0,_lastSourceActive=null;
  function cancelQueuedRefresh(){
    if(_refreshRequest&&!_refreshRequest.inFlight&&!_refreshRequest.controller.signal.aborted){noteRefreshStep('cancelled');_refreshRequest.controller.abort();}
  }
  function buttonBusy(button){return !button||button.disabled||button.getAttribute('aria-disabled')==='true'||button.getAttribute('aria-busy')==='true'}
  function setRefreshPhase(phase,message=''){
    refreshPhase=phase;refreshProblem=message;refreshState=message||phase;if(phase==='blocked'||phase==='stalled')noteRefreshStep('held');updateStatusLine();
  }
  // AFT's cached stowing handler hides the button, requests /stow-summary-clean/,
  // then reloads on success. Its disabled flag is a 60s cooldown, NOT request busy.
  // Web Locks end at navigation, so a synchronous same-origin barrier survives it.
  // Every barrier mutation holds REFRESH_LOCK_NAME. Only proven abandonment releases an unknown result.
  const REFRESH_NAV_KEY='pax-monitor-refresh-navigation-v3516';
  // 3.7.5: a shared minimum gap between a CONFIRMED refresh completion and the next
  // queued refresh, for every same-origin monitor tab. This paces the queue; it is NOT
  // the mutual-exclusion mechanism. REFRESH_LOCK_NAME and the barrier below still own
  // that, and nothing here may bypass readiness, snapshot acceptance or the stuck-owner
  // safeguards. Because it is only pacing, a damaged record must neither authorize an
  // immediate refresh nor wedge the queue forever: it costs one bounded gap. Its own
  // key, so legacy records and namespaces are never read for this or rewritten.
  const REFRESH_PACE_KEY='pax-monitor-refresh-pace-v3750';
  const REFRESH_MIN_GAP_MS=10000;
  const REFRESH_PACE_TICK_MS=1000;
  // Damage is remembered per observed raw value, in memory only and never written back,
  // so a static bad record costs exactly one gap once instead of being rebased forever.
  let _paceDamaged=null,_paceWriteError='';
  function refreshPaceRecord(){
    let raw=null;
    try{
      raw=localStorage.getItem(REFRESH_PACE_KEY);
      // Absent is not damaged: it means no confirmed completion has been recorded yet,
      // so the first refresh against a fresh store is immediate, by design.
      if(raw===null){_paceDamaged=null;return null}
      const r=JSON.parse(raw);
      const setAt=Number(r?.setAt),nextAllowedAt=Number(r?.nextAllowedAt);
      // Strict. The deadline is a pure function of the completion time, so a record can
      // neither widen nor shrink the gap, and a completion stamped in the future (moved
      // clock, stale or forged record) is damage rather than a licence to wait on. Any
      // gapMs the record carries is informational and is deliberately not read here.
      if(!Number.isFinite(setAt)||setAt<=0||setAt>Date.now())throw Error('Pace completion time out of range');
      if(nextAllowedAt!==setAt+REFRESH_MIN_GAP_MS)throw Error('Pace deadline does not match the shared gap');
      _paceDamaged=null;
      return {nextAllowedAt,setAt,gapMs:REFRESH_MIN_GAP_MS,
        token:typeof r.token==='string'?r.token:null,vrid:r.vrid??null,
        source:typeof r.source==='string'?r.source:null,
        tabId:typeof r.tabId==='string'?r.tabId:null,
        origin:typeof r.origin==='string'?r.origin:null,damaged:false,error:null};
    }catch{
      if(!_paceDamaged||_paceDamaged.raw!==raw)_paceDamaged={raw,at:Date.now()};
      return {nextAllowedAt:_paceDamaged.at+REFRESH_MIN_GAP_MS,setAt:_paceDamaged.at,
        gapMs:REFRESH_MIN_GAP_MS,token:null,vrid:null,source:null,tabId:null,origin:null,damaged:true,
        error:'Queue pacing record damaged or out of range; one '+Math.round(REFRESH_MIN_GAP_MS/1000)+'s gap is applied, then the queue continues.'};
    }
  }
  function refreshPaceRemainingMs(now=Date.now()){
    const r=refreshPaceRecord();
    // setAt is proven not to be in the future, or is this tab's own observation of
    // damage, so the remainder is bounded by one gap without any further clamping.
    return r?Math.max(0,r.nextAllowedAt-now):0;
  }
  // Called by the completing owner while it still holds REFRESH_LOCK_NAME and BEFORE it
  // releases the barrier, so the next owner cannot start inside the gap. The completed
  // barrier is therefore never held for the delay; the successor does the waiting.
  function noteRefreshPaceFloor(signal,token=null){
    const now=Date.now();
    const record={setAt:now,nextAllowedAt:now+REFRESH_MIN_GAP_MS,gapMs:REFRESH_MIN_GAP_MS,
      token:typeof token==='string'?token:null,vrid:loadIdentity().loadId||null,
      source:pageSource(),tabId:TAB_ID,origin:location.origin,signal:clean(signal)};
    _paceDamaged=null;
    try{localStorage.setItem(REFRESH_PACE_KEY,JSON.stringify(record))}
    catch(err){
      // Never continue unpaced after promising a shared gap. This refresh is already
      // confirmed and logged; the caller keeps its barrier, so the queue holds instead
      // of letting another tab start inside a gap that cannot be enforced.
      _paceWriteError=clean(err?.message||err)||'unavailable';
      console.warn('[Pallet Movement Monitor] queue pacing deadline not persisted',err);
      throw Error('Refresh completed, but the shared queue cooldown could not be saved ('+_paceWriteError+'); queue held. Free site storage, then use Recover refresh queue.');
    }
    _paceWriteError='';
    window.dispatchEvent(new Event('pmm-refresh-pace-change'));
    return record;
  }
  // Last resort for the one paced path that keeps no durable barrier (the Hunter API
  // refresh). A throw there could not hold the queue for other tabs, so instead this
  // holds REFRESH_LOCK_NAME itself for one gap. Deliberately NOT abortable: the point is
  // that the gap is honoured even though it could not be persisted. Bounded by one gap,
  // so it cannot wedge the queue. Tabs waiting on a reload barrier rather than on this
  // lock are not covered; refreshPaceState().error reports the degraded state.
  function holdRefreshPaceGap(){
    if(refreshPhase!=='cooldown')setRefreshPhase('cooldown');else updateStatusLine();
    return new Promise(resolve=>setTimeout(resolve,REFRESH_MIN_GAP_MS));
  }
  // Abortable, and re-read every tick so a floor written by another tab mid-wait is
  // honoured and the visible countdown stays truthful. Rejecting on abort unwinds the
  // lock callback and releases REFRESH_LOCK_NAME; no barrier or owner record exists yet.
  function awaitRefreshPace(signal){
    return new Promise((resolve,reject)=>{
      let timer=0;
      const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort)};
      const abort=()=>{cleanup();reject(new DOMException('Refresh cancelled','AbortError'))};
      const tick=()=>{
        if(signal?.aborted)return abort();
        let remaining;
        try{remaining=refreshPaceRemainingMs()}catch(err){cleanup();reject(err);return}
        if(remaining<=0){cleanup();noteRefreshStep('cooldown ended');window.dispatchEvent(new Event('pmm-refresh-pace-elapsed'));resolve();return}
        if(refreshPhase!=='cooldown')setRefreshPhase('cooldown');else updateStatusLine();
        timer=setTimeout(tick,Math.min(remaining,REFRESH_PACE_TICK_MS));
      };
      signal?.addEventListener('abort',abort,{once:true});
      if(signal?.aborted)abort();else tick();
    });
  }
  function refreshPaceState(){
    const r=refreshPaceRecord();
    return {nextAllowedAt:r?.nextAllowedAt||null,remainingMs:refreshPaceRemainingMs(),
      gapMs:REFRESH_MIN_GAP_MS,setAt:r?.setAt||null,vrid:r?.vrid??null,source:r?.source||null,
      tabId:r?.tabId||null,damaged:!!r?.damaged,error:r?.error||_paceWriteError||null};
  }
  function refreshBarrier(){
    let raw;
    try{
      raw=localStorage.getItem(REFRESH_NAV_KEY);if(!raw)return null;
      const b=JSON.parse(raw);
      if(typeof b?.token!=='string'||!b.token||typeof b.shipRef!=='string'||!b.shipRef||!Number.isFinite(Number(b.startedAt))||Number(b.startedAt)<=0)throw Error('Invalid barrier');
      return b;
    }catch{
      // Fail closed: malformed storage must never authorize a second refresh.
      // Keep the raw record until explicit recovery takes the refresh lock.
      return {invalid:true,token:'invalid:'+String(raw),startedAt:0,vrid:null,shipRef:'',error:'Refresh held: damaged queue record. Close other refreshing monitor tabs, then use Recover refresh queue.'};
    }
  }
  function refreshTicket(){
    try{const raw=sessionStorage.getItem(REFRESH_NAV_KEY);const t=raw?JSON.parse(raw):null;return t&&typeof t.token==='string'?t:null}catch{try{sessionStorage.removeItem(REFRESH_NAV_KEY)}catch{}return null}
  }
  function reloadContinuation(){
    const b=refreshBarrier(),t=refreshTicket();
    if(!(b&&!b.invalid&&t&&b.token===t.token&&t.documentId!==TAB_ID&&performance.getEntriesByType('navigation')[0]?.type==='reload'))return false;
    if(b.source==='hunter')return isHunterPage()&&t.source==='hunter';
    return isAftPage()&&b.shipRef===location.pathname;
  }
  function clearRefreshBarrier(token){
    if(refreshBarrier()?.token!==token)throw Error('Refresh ownership changed unexpectedly');
    if(refreshTicket()?.token===token)sessionStorage.removeItem(REFRESH_NAV_KEY);
    localStorage.removeItem(REFRESH_NAV_KEY);
    window.dispatchEvent(new Event('pmm-refresh-barrier-change'));
  }
  function awaitBarrierChange(token,signal){
    return new Promise((resolve,reject)=>{
      const timer=setInterval(()=>{maybeRecoverAbandonedRefresh().then(check)},RECOVERY_CHECK_MS);
      const cleanup=()=>{clearInterval(timer);window.removeEventListener('storage',check);window.removeEventListener('pmm-refresh-barrier-change',check);signal?.removeEventListener('abort',abort)};
      const abort=()=>{cleanup();reject(new DOMException('Refresh cancelled','AbortError'))};
      const check=()=>{try{if(refreshBarrier()?.token!==token){cleanup();resolve()}}catch(e){cleanup();reject(e)}};
      window.addEventListener('storage',check);window.addEventListener('pmm-refresh-barrier-change',check);
      signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();else check();
    });
  }
  function aftPageReady(requireButton=true){
    const parts=location.pathname.split('/'),button=document.getElementById('refreshDataRequest');
    const loader=document.getElementById('hierarchy-loader');
    return !!(parts[2]==='stowing-in-progress'&&(button||!requireButton)&&loader&&getComputedStyle(loader).display==='none'&&
      clean(document.getElementById('shipRef')?.textContent)===decodeURIComponent(parts[3]||'')&&
      clean(document.getElementById('destinationWarehouseId')?.textContent)===parts[1]&&
      clean(document.getElementById('loadId')?.textContent)&&document.querySelector('#lastUpdatedDate abbr small')&&
      ['not-yet-stowed','not-yet-received','active-stowers','staging'].every(id=>document.getElementById(id+'-root')));
  }
  // 3.6.5: AFT hides its button on click and never shows it again if the request fails.
  // A missing/hidden button no longer blocks: the monitor sends AFT's own request.
  function refreshButtonGone(){
    const b=document.getElementById('refreshDataRequest');
    return !b||b.hidden||getComputedStyle(b).display==='none'||getComputedStyle(b).visibility==='hidden';
  }
  // AFT enables its button 60 s after page load; the direct request keeps the same pace.
  let _aftCooldownDone=false;
  if(isAftPage())setTimeout(()=>{_aftCooldownDone=true;window.dispatchEvent(new Event('pmm-aft-cooldown'))},60000);
  const directRefreshReady=()=>refreshButtonGone()&&_aftCooldownDone;
  // Consecutive fallback reloads that did not bring the button back (per tab).
  const FALLBACK_KEY='pmm-refresh-fallbacks-v365',FALLBACK_MAX=3;
  const fallbackCount=()=>{try{return Number(sessionStorage.getItem(FALLBACK_KEY))||0}catch{return 0}};
  const setFallbackCount=n=>{try{n?sessionStorage.setItem(FALLBACK_KEY,String(n)):sessionStorage.removeItem(FALLBACK_KEY)}catch{}};
  // If the reload does not actually navigate (blocked/cancelled), say so instead of
  // sitting in 'running' forever. The barrier is kept for explicit recovery.
  function fallbackReload(message){
    setFallbackCount(fallbackCount()+1);
    setRefreshPhase('running',message);
    setTimeout(()=>setRefreshPhase('stalled','Page reload did not happen; queue held. Reload this tab manually.'),15000);
    location.reload();
  }
  // Same request AFT's Refresh button makes (GET /stow-summary-clean/), then a reload.
  // Whatever the answer, the page is reloaded so AFT redraws and restores its button.
  async function directAftRefresh(){
    const parts=location.pathname.split('/');
    const wh=clean(document.getElementById('destinationWarehouseId')?.textContent)||parts[1]||'';
    const sid=clean(document.getElementById('shipRef')?.textContent)||decodeURIComponent(parts[3]||'');
    let outcome='plain reload (no shipment reference)';
    if(wh&&sid){
      const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),45000);
      try{
        const r=await fetch('/stow-summary-clean/?'+new URLSearchParams({warehouseId:wh,amazonShipmentRefId:sid}),{credentials:'same-origin',cache:'no-store',headers:{'X-Requested-With':'XMLHttpRequest',Accept:'application/json, text/javascript, */*; q=0.01'},signal:ctl.signal});
        const j=r.ok?await r.json().catch(()=>null):null;
        outcome=j?.success?'direct AFT refresh request succeeded':`direct AFT refresh request returned HTTP ${r.status}${j?' (success=false)':''}; plain reload`;
      }catch(err){outcome='direct AFT refresh request failed ('+clean(err?.message||err)+'); plain reload'}
      finally{clearTimeout(timer)}
    }
    perfStats.lastRefresh={startedAt:lastRefreshAt,outcome,buttonHidden:true};
    fallbackReload('Refresh button unavailable; '+outcome.replace(/; plain reload$/,'')+'; reloading page');
    await new Promise(()=>{});
  }
  function refreshButtonAvailable(){
    const b=document.getElementById('refreshDataRequest');
    return !!b&&!buttonBusy(b)&&!b.hidden&&getComputedStyle(b).display!=='none'&&getComputedStyle(b).visibility!=='hidden';
  }
  function waitForAftPage(clickable=false,signal){
    return new Promise((resolve,reject)=>{
      let settle=0,done=false;
      const cleanup=()=>{obs.disconnect();clearTimeout(settle);clearTimeout(watchdog);window.removeEventListener('pagehide',unload);window.removeEventListener('pmm-aft-cooldown',recheck);signal?.removeEventListener('abort',abort)};
      const recheck=()=>inspect([]);
      const unload=()=>{cleanup();reject(Error('Owner page unloaded before page readiness'))};
      const abort=()=>{cleanup();reject(new DOMException('Refresh cancelled','AbortError'))};
      const ready=()=>aftPageReady(false)&&(!clickable||refreshButtonAvailable()||directRefreshReady());
      const finish=()=>{settle=0;if(done||!ready())return;done=true;cleanup();resolve()};
      const inspect=records=>{
        if(records.some(relevantMutation)||!ready()){clearTimeout(settle);settle=0}
        if(ready()&&!settle)settle=setTimeout(finish,REFRESH_SETTLE_MS);
      };
      const obs=new MutationObserver(inspect);
      obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeOldValue:true,attributeFilter:['style','hidden','disabled','aria-disabled','aria-busy','href','id','class']});
      // 3.6.6: AFT sometimes sticks on its loading spinner; a plain reload fixes it.
      // Reload up to FALLBACK_MAX times in a row (the barrier, if any, is kept and the
      // reloaded page continues the same refresh), then hold the queue.
      const watchdog=setTimeout(()=>{
        if(done||signal?.aborted)return;
        if(fallbackCount()<FALLBACK_MAX){cleanup();fallbackReload(!clickable?'Reloaded AFT page still loading after 90 s; reloading again':aftPageReady(false)?'AFT Refresh button still greyed out after 90 s; reloading page':'AFT page still loading after 90 s; reloading page');return}
        setFallbackCount(0);
        setRefreshPhase('stalled',clickable?`AFT page or Refresh button still not ready after ${FALLBACK_MAX} reloads; queue held. Check AFT sign-in, or reload this tab.`:`Reloaded AFT hierarchy still not confirmed after ${FALLBACK_MAX} reloads; queue held. Download diagnostic before closing this tab.`);
      },REFRESH_STALL_MS);
      window.addEventListener('pagehide',unload,{once:true});window.addEventListener('pmm-aft-cooldown',recheck);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();else inspect([]);
    });
  }
  function waitForAftRefresh(button){
    // Deliberately stays pending until this document is replaced. Neither hidden
    // button, enabled button, unrelated mutations nor elapsed time prove success.
    return new Promise((resolve,reject)=>{
      const began=Date.now();
      // 3.6.5: AFT reloads only when its request succeeds. On an AFT error (alert, or a
      // silent failure that leaves the button hidden) reload the page ourselves; the
      // barrier stays, and the reloaded page confirms the hierarchy before releasing it.
      const watchdog=setTimeout(()=>{
        perfStats.lastRefresh={startedAt:began,outcome:'AFT did not reload; plain page reload',buttonHidden:!refreshButtonAvailable()};
        try{writeOwner('awaiting-reload')}catch(e){reportMonitorError(e)}
        fallbackReload('AFT did not reload after Refresh; reloading the page');
      },REFRESH_STALL_MS);
      window.addEventListener('pagehide',()=>clearTimeout(watchdog),{once:true});
      try{_clickFromMonitor=true;button.click()}catch(e){reject(e)}finally{_clickFromMonitor=false}
    });
  }
  async function recoverRefreshQueue(){
    if(duplicateViewOnly())return false;
    const b=refreshBarrier();if(!b){alert('No navigation barrier to recover. Close the owner of any older-version refresh first.');return false}
    if(!confirm(b.invalid?'The queue record is damaged and its owner is unknown. Close all other refreshing monitor tabs before clearing it. Continue?':'Recovery abandons an UNKNOWN refresh, not a successful completion. First close the owner tab for VRID '+b.vrid+'. Continue only after it is closed?'))return false;
    return navigator.locks.request(REFRESH_LOCK_NAME,{mode:'exclusive',ifAvailable:true},lock=>{
      if(!lock){alert('A refresh owner is still active. Close that tab first.');return false}
      if(refreshBarrier()?.token!==b.token){alert('Refresh ownership changed. Nothing cleared.');return false}
      clearRefreshBarrier(b.token);
        logRefreshEvent('explicit recovery; outcome unknown',{vrid:b.vrid,startedAt:b.startedAt});
      if(read(K.refreshOwner,null)?.tabId===b.tabId)removeValue(K.refreshOwner);
      perfStats.lastRefresh={outcome:'explicit recovery: unknown refresh abandoned',vrid:b.vrid,startedAt:b.startedAt};
      if(refreshPhase==='blocked'){setRefreshPhase('idle');schedule()}
      return true;
    });
  }
  function waitForAcceptedRefreshScan(){
    return new Promise((resolve,reject)=>{
      const cleanup=()=>{_refreshScanResolve=null;window.removeEventListener('pagehide',unload)};
      const unload=()=>{cleanup();reject(Error('Refresh owner page unloaded'))};
      _refreshScanResolve=outcome=>{cleanup();resolve(outcome)};
      window.addEventListener('pagehide',unload,{once:true});
      process(true,'refresh-complete').then(accepted=>{
        if(!accepted&&_refreshScanResolve){
          setRefreshPhase('stalled',sourceLabel(getHierarchy()?.source||pageSource())+' refreshed, but tracking snapshot was not accepted; queue held. '+(monitorError||lastSnapshotRejectedReason||'Waiting for stable hierarchy'));
          try{writeOwner('snapshot-held')}catch(err){reportMonitorError(err)}
        }
      }).catch(err=>{reportMonitorError(err);setRefreshPhase('stalled','Tracking failed; queue held. Close/reload this tab if stuck.')});
    });
  }
  function waitForHunterData(signal){
    return new Promise((resolve,reject)=>{
      const began=Date.now();let timer=0;
      const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);window.removeEventListener('pagehide',unload)};
      const abort=()=>{cleanup();reject(new DOMException('Refresh cancelled','AbortError'))};
      const unload=()=>{cleanup();reject(Error('Hunter page unloaded before data was ready'))};
      const check=async()=>{
        if(signal?.aborted)return abort();
        try{
          const ident=hunterIdentity();
          if(ident.loadId&&ident.shipmentId&&hunterDownloadAnchor('Containers.csv')){await ensureHunterCsv(true);cleanup();resolve();return}
        }catch(err){if(Date.now()-began>REFRESH_STALL_MS){cleanup();reject(err);return}}
        if(Date.now()-began>REFRESH_STALL_MS){cleanup();reject(Error('CsX Hunter data/export did not become ready'));return}
        timer=setTimeout(check,500);
      };
      signal?.addEventListener('abort',abort,{once:true});window.addEventListener('pagehide',unload,{once:true});check();
    });
  }
  async function queueHunterRefresh(resume=false){
    if(_pageRestored){setRefreshPhase('blocked','Restored browser page is inactive. Close this tab; recover the queue in another tab if needed, then reopen this load.');return}
    if(duplicateViewOnly()&&!resume){refreshProblem='Duplicate VRID open in another tab';updateStatusLine();return}
    if(_refreshRequest||(!resume&&isPaused())||(!resume&&!sourceTrackingActive(loadIdentity())))return;
    try{requireLocks()}catch(err){setRefreshPhase('blocked',err.message);return}
    const request={controller:new AbortController(),acquired:false,inFlight:resume,shipRef:loadIdentity().shipRef,requestedAt:Date.now()};
    _refreshRequest=request;nextRefreshAt=0;noteRefreshStep('requested');setRefreshPhase('queued');
    try{
      while(true){
        const waiting=await navigator.locks.request(REFRESH_LOCK_NAME,{mode:'exclusive',signal:request.controller.signal},async()=>{
          if((!resume&&isPaused())||(!resume&&!sourceTrackingActive(loadIdentity())))return null;
          const barrier=refreshBarrier(),continuation=resume&&reloadContinuation();
          if(resume&&!continuation){setRefreshPhase('blocked','Hunter reload ownership no longer matches. Close and reopen this tab.');return null}
          if(barrier&&!continuation)return barrier.token;
          request.acquired=true;noteRefreshStep('acquired queue');let token=barrier?.token,launched=!!continuation;
          try{
            refreshing=true;lastRefreshAt=barrier?.startedAt||Date.now();
            if(!continuation){
              await awaitRefreshPace(request.controller.signal);
              if(isPaused()||duplicateViewOnly()||!sourceTrackingActive(loadIdentity())||request.shipRef!==loadIdentity().shipRef)return null;
              const ident=loadIdentity();if(!ident.loadId){setRefreshPhase('blocked','Open a CsX Hunter transshipment before refreshing.');return null}
              token=globalThis.crypto?.randomUUID?.()||TAB_ID+'-'+Date.now();
              const next={token,source:'hunter',tabId:TAB_ID,vrid:ident.loadId,shipRef:ident.shipRef,origin:location.origin,startedAt:Date.now(),state:'awaiting-reload'};
              sessionStorage.setItem(REFRESH_NAV_KEY,JSON.stringify({...next,documentId:TAB_ID}));localStorage.setItem(REFRESH_NAV_KEY,JSON.stringify(next));
              lastRefreshAt=next.startedAt;writeOwner('awaiting-reload');setRefreshPhase('running','Reloading CsX Hunter');launched=true;request.inFlight=true;
              noteRefreshStep('launched');location.reload();await new Promise(()=>{});
            }else{
              writeOwner('settling');setRefreshPhase('settling','CsX Hunter reloaded; loading complete CSV snapshot');
              await waitForHunterData(request.controller.signal);invalidateHierarchyCache();_refreshDOMConfirmed=true;
              try{if(_scanPromise)await _scanPromise;const scan=await waitForAcceptedRefreshScan();perfStats.lastRefresh={startedAt:lastRefreshAt,durationMs:Date.now()-lastRefreshAt,signal:'Hunter reload + CSV exports + accepted monitor scan',outcome:scan.noComparableData?'complete; no comparable containers, previous snapshot retained':'complete'}}finally{_refreshDOMConfirmed=false}
              const completion=isHunterPage()?'Hunter reload and accepted snapshot':'AFT reload and accepted snapshot';
              noteConfirmedRefresh(completion);noteRefreshPaceFloor(completion,token);clearRefreshBarrier(token);setRefreshPhase('idle');
            }
          }catch(err){if(!launched&&token&&refreshBarrier()?.token===token)clearRefreshBarrier(token);throw err}
          finally{const remaining=refreshBarrier();refreshing=!!(launched&&remaining?.token===token);if(!remaining)removeValue(K.refreshOwner)}
          return null;
        });
        if(!waiting)break;setRefreshPhase('queued');await awaitBarrierChange(waiting,request.controller.signal);
      }
    }catch(err){if(err?.name!=='AbortError'){setRefreshPhase('blocked','Refresh held: '+clean(err?.message||err));logRefreshEvent('failed/unknown',{error:clean(err?.message||err)});perfStats.lastRefresh={startedAt:lastRefreshAt,outcome:'failed/unknown',error:clean(err?.message||err)}}}
    finally{if(_refreshRequest===request)_refreshRequest=null;if(_pageRestored)setRefreshPhase('blocked','Restored browser page is inactive. Close this tab; recover the queue in another tab if needed, then reopen this load.');else if(refreshPhase==='queued'||refreshPhase==='cooldown'||(request.controller.signal.aborted&&!request.inFlight))setRefreshPhase('idle');if(refreshPhase!=='blocked'&&refreshPhase!=='stalled')schedule()}
  }
  async function queueHunterApiRefresh(){
    if(_pageRestored){setRefreshPhase('blocked','Restored browser page is inactive. Close this tab and reopen the load.');return}
    if(duplicateViewOnly()){refreshProblem='Duplicate VRID open in another tab';updateStatusLine();return}
    if(_refreshRequest||isPaused())return;
    try{requireLocks()}catch(err){setRefreshPhase('blocked',err.message);return}
    // inFlight stays false until this refresh is actually launched, so that
    // cancelQueuedRefresh() can still abort while it waits for the shared gap.
    const request={controller:new AbortController(),acquired:false,inFlight:false,shipRef:loadIdentity().shipRef,requestedAt:Date.now()};
    _refreshRequest=request;nextRefreshAt=0;noteRefreshStep('requested');setRefreshPhase('queued');
    try{
      // 3.7.5: this path navigates nothing of its own, so it used to ignore another
      // tab's reload barrier entirely and could refresh while that reload refresh was
      // still unresolved. It now waits behind the barrier like every other path, then
      // observes the shared gap, so one queue paces all of them.
      while(true){
        const waiting=await navigator.locks.request(REFRESH_LOCK_NAME,{mode:'exclusive',signal:request.controller.signal},async()=>{
          if(isPaused())return null;
          const barrier=refreshBarrier();
          if(barrier)return barrier.token;
          noteRefreshStep('acquired queue');await awaitRefreshPace(request.controller.signal);
          // The gap is long enough for pause, ownership, the source, the load or a new
          // barrier to change underneath, so re-establish every entry condition.
          if(request.controller.signal.aborted||isPaused()||duplicateViewOnly()||!sourceTrackingActive(loadIdentity())||request.shipRef!==loadIdentity().shipRef)return null;
          const appeared=refreshBarrier();
          if(appeared)return appeared.token;
          request.acquired=true;request.inFlight=true;refreshing=true;lastRefreshAt=Date.now();setRefreshPhase('running',feederAlive(loadIdentity().shipmentId)?'Refreshing via hidden Hunter loader':'Refreshing CsX Hunter API');
          noteRefreshStep('launched');await ensureHunterApi(true,true);invalidateHierarchyCache();
          const accepted=await process(true,'hunter-api-refresh');
          if(!accepted&&!lastSnapshotAccepted)throw Error(lastSnapshotRejectedReason||monitorError||'Hunter API snapshot was not accepted');
          perfStats.lastRefresh={startedAt:lastRefreshAt,durationMs:Date.now()-lastRefreshAt,signal:(_hunterApi.transport==='hunter-tab'?'hidden Hunter loader reload + CSV feed':'direct Hunter JSON API')+' + accepted monitor scan',outcome:'complete'};
          noteConfirmedRefresh('Hunter data and accepted snapshot');
          // This path still reserves no durable barrier of its own, so it cannot hold the
          // queue for other tabs by throwing. Hold the lock for one gap instead.
          try{noteRefreshPaceFloor('Hunter data and accepted snapshot')}
          catch(err){reportMonitorError(err);await holdRefreshPaceGap()}
          setRefreshPhase('idle');
          return null;
        });
        if(!waiting)break;
        setRefreshPhase('queued');await awaitBarrierChange(waiting,request.controller.signal);
      }
      _hunterFailCount=0;
    }catch(err){if(err?.name!=='AbortError'){_hunterFailCount++;reportMonitorError(err);setRefreshPhase('idle','Hunter API refresh failed: '+clean(err?.message||err));perfStats.lastRefresh={startedAt:lastRefreshAt,outcome:'failed; retry '+_hunterFailCount,error:clean(err?.message||err)}}}
    finally{refreshing=false;if(_refreshRequest===request)_refreshRequest=null;if(refreshPhase==='queued'||refreshPhase==='cooldown')setRefreshPhase('idle');if(refreshPhase!=='blocked'&&refreshPhase!=='stalled')schedule();else updateStatusLine()}
  }
  async function queueRefresh(resume=false){
    if(isHunterPage())return queueHunterRefresh(resume);
    const current=getHierarchy();if(isAftPage()&&current?.source==='hunter'&&!resume)return queueHunterApiRefresh();
    if(!resume&&!sourceTrackingActive(loadIdentity())){refreshProblem=sourceStandbyReason(loadIdentity())||'AFT source is in standby';updateStatusLine();return}
    if(_pageRestored){setRefreshPhase('blocked','Restored browser page is inactive. Close this tab; recover the queue in another tab if needed, then reopen this load.');return}
    if(duplicateViewOnly()&&!resume){refreshProblem='Duplicate VRID open in another tab';updateStatusLine();return}
    if(_refreshRequest||(!resume&&isPaused()))return;
    try{requireLocks();checkStorageOrigin()}catch(err){setRefreshPhase('blocked',err.message);return}
    const request={controller:new AbortController(),acquired:false,inFlight:resume,shipRef:location.pathname,requestedAt:Date.now()};
    _refreshRequest=request;nextRefreshAt=0;noteRefreshStep('requested');setRefreshPhase('queued');
    try{
      while(true){
        const waiting=await navigator.locks.request(REFRESH_LOCK_NAME,{mode:'exclusive',signal:request.controller.signal},async()=>{
          if((!resume&&isPaused())||request.shipRef!==location.pathname)return null;
          const barrier=refreshBarrier();
          const continuation=resume&&reloadContinuation();
          if(resume&&!continuation){setRefreshPhase('blocked','Reload ownership no longer matches; no new refresh started. Close and reopen this tab.');return null}
          if(barrier&&!continuation)return barrier.token;
          request.acquired=true;noteRefreshStep('acquired queue');
          let token=barrier?.token,launched=!!continuation;
          try{
            refreshing=true;lastRefreshAt=barrier?.startedAt||Date.now();
            if(!continuation){
              // Shared minimum gap first, under the lock, so no other tab can slip in.
              await awaitRefreshPace(request.controller.signal);
              // Ten seconds is long enough for pause, ownership, the source or the page
              // itself to change underneath, so re-establish the entry conditions.
              if(isPaused()||duplicateViewOnly()||!sourceTrackingActive(loadIdentity())||request.shipRef!==location.pathname)return null;
              setRefreshPhase('cooldown','Waiting for AFT page and refresh cooldown');
              await waitForAftPage(true,request.controller.signal);
              // The page/button wait is also unbounded in practice, so re-establish the
              // same conditions again rather than only the pause flag.
              if(isPaused()||duplicateViewOnly()||!sourceTrackingActive(loadIdentity())||request.shipRef!==location.pathname)return null;
              if(!refreshButtonAvailable()&&fallbackCount()>=FALLBACK_MAX){setRefreshPhase('blocked',`AFT Refresh button still missing after ${FALLBACK_MAX} page reloads; automatic refresh stopped. Check AFT sign-in, then reload this tab.`);setFallbackCount(0);return null}
              if(refreshButtonAvailable())setFallbackCount(0);noteRefreshStep('page ready');
              token=globalThis.crypto?.randomUUID?.()||TAB_ID+'-'+Date.now();
              const next={token,tabId:TAB_ID,vrid:loadIdentity().loadId,shipRef:location.pathname,origin:location.origin,startedAt:Date.now(),state:'awaiting-reload'};
              // Both writes must succeed BEFORE clicking. Abandonment recovery is token-guarded.
              sessionStorage.setItem(REFRESH_NAV_KEY,JSON.stringify({...next,documentId:TAB_ID}));
              localStorage.setItem(REFRESH_NAV_KEY,JSON.stringify(next));
              lastRefreshAt=next.startedAt;writeOwner('awaiting-reload');
              setRefreshPhase('running');launched=true;request.inFlight=true;
              noteRefreshStep('launched');if(refreshButtonAvailable())await waitForAftRefresh(document.getElementById('refreshDataRequest'));
              else await directAftRefresh();
            }else{
              writeOwner('settling');setRefreshPhase('settling','AFT reloaded; waiting for rendered hierarchy and tracking persistence');
              await waitForAftPage(false);
              if(!refreshButtonGone())setFallbackCount(0);
              invalidateHierarchyCache();_refreshDOMConfirmed=true;
              try{
                if(_scanPromise)await _scanPromise;
                const scan=await waitForAcceptedRefreshScan();
                perfStats.lastRefresh={startedAt:lastRefreshAt,durationMs:Date.now()-lastRefreshAt,signal:'document reload + AFT renderer markers + accepted monitor scan',outcome:scan.noComparableData?'complete; no comparable containers, previous snapshot retained':'complete'};
              }finally{_refreshDOMConfirmed=false}
              const completion=isHunterPage()?'Hunter reload and accepted snapshot':'AFT reload and accepted snapshot';
              noteConfirmedRefresh(completion);noteRefreshPaceFloor(completion,token);clearRefreshBarrier(token);setRefreshPhase('idle');
            }
          }catch(err){
            // A click might already have started a request. Keep durable ownership
            // on exceptions; guarded recovery may abandon an unknown result.
            if(!launched&&token&&refreshBarrier()?.token===token)clearRefreshBarrier(token);
            throw err;
          }finally{
            const remaining=refreshBarrier();
            refreshing=!!(launched&&remaining?.token===token);
            if(!remaining)removeValue(K.refreshOwner);
          }
          return null;
        });
        if(!waiting)break;
        setRefreshPhase('queued');await awaitBarrierChange(waiting,request.controller.signal);
      }
    }catch(err){
      if(err?.name!=='AbortError'){setRefreshPhase('blocked','Refresh held: '+clean(err?.message||err));logRefreshEvent('failed/unknown',{error:clean(err?.message||err)});perfStats.lastRefresh={startedAt:lastRefreshAt,outcome:'failed/unknown',error:clean(err?.message||err)}}
    }finally{
      if(_refreshRequest===request)_refreshRequest=null;
      if(_pageRestored)setRefreshPhase('blocked','Restored browser page is inactive. Close this tab; recover the queue in another tab if needed, then reopen this load.');
      else if(refreshPhase==='queued'||refreshPhase==='cooldown'||(request.controller.signal.aborted&&!request.inFlight))setRefreshPhase('idle');
      if(refreshPhase!=='blocked'&&refreshPhase!=='stalled')schedule();
    }
  }
  function schedule(){
    clearTimeout(refreshTimer);refreshTimer=0;
    if(_pageRestored){nextRefreshAt=0;return}
    const ident=loadIdentity(),activeHierarchy=getHierarchy();
    if(!sourceTrackingActive(activeHierarchy)){cancelQueuedRefresh();nextRefreshAt=0;refreshState=sourceStandbyReason(activeHierarchy)||'Source standby';updateStatusLine();return}
    if(isHunterPage()&&!ident.loadId){cancelQueuedRefresh();nextRefreshAt=0;refreshState='Open a CsX Hunter transshipment';updateStatusLine();return}
    if(duplicateViewOnly()){cancelQueuedRefresh();nextRefreshAt=0;refreshState='Duplicate load open';updateStatusLine();return}
    if(isPaused()){cancelQueuedRefresh();nextRefreshAt=0;updateStatusLine();return}
    if(!isAutoRefreshEnabled()){cancelQueuedRefresh();nextRefreshAt=0;refreshState='Auto refresh off';updateStatusLine();return}
    if(_refreshRequest){updateStatusLine();return}
    if(refreshPhase==='blocked'||refreshPhase==='stalled'){nextRefreshAt=0;updateStatusLine();return}
    try{requireLocks()}catch(err){setRefreshPhase('blocked',err.message);return}
    const retrying=isAftPage()&&dataSourceMode()==='hunter'&&_hunterFailCount>0;
    const delay=retrying?Math.min(refreshDelay(),30000*2**Math.min(_hunterFailCount-1,5)):refreshDelay();
    nextRefreshAt=Date.now()+delay;refreshState=retrying?'Retrying Hunter API':'Waiting';updateStatusLine();
    refreshTimer=setTimeout(()=>{refreshTimer=0;queueRefresh().catch(reportMonitorError)},delay);
  }

  function reportMonitorError(err){
    monitorError=clean(err?.message||err||'Unknown monitor error');
    console.error('[Pallet Movement Monitor]',err);
    try{updateStatusLine()}catch(_){}
  }

  let _pageUnloading=false,_startupEntered=false;
  // No subtree observer, hierarchy parsing, panel or network activity in this wait.
  // Two ready samples one second apart give AFT another turn to finish rendering.
  // Time alone never authorizes a snapshot. A page that never becomes ready stays
  // held; no automatic reload is launched from this startup gate.
  function waitForAftStartup(){
    if(!isAftPage()||location.pathname.split('/')[2]!=='stowing-in-progress')return Promise.resolve(true);
    return new Promise((resolve,reject)=>{
      let timer=0,readyOnce=false,done=false;
      const cleanup=()=>{clearTimeout(timer);window.removeEventListener('pagehide',cancel)};
      const finish=value=>{if(done)return;done=true;cleanup();resolve(value)};
      const cancel=()=>finish(false);
      const inspect=()=>{
        if(_pageUnloading||_pageRestored){finish(false);return}
        try{
          const ready=document.readyState!=='loading'&&aftPageReady(false);
          if(ready&&readyOnce){finish(true);return}
          readyOnce=ready;
          timer=setTimeout(inspect,1000);
        }catch(err){done=true;cleanup();reject(err)}
      };
      window.addEventListener('pagehide',cancel,{once:true});
      inspect();
    });
  }
  async function start(){
    if(_startupEntered)return;
    _startupEntered=true;
    let startupHeartbeat=0;
    const startupUnload=()=>{
      _pageUnloading=true;clearInterval(startupHeartbeat);
      _documentAliveRelease?.();
      try{removeTabRegistryEntry()}catch(_){}
    };
    const startupRestore=e=>{if(e.persisted){_pageRestored=true;location.reload()}};
    try{
      refreshStarted=Date.now();
      requireLocks();
      // A reload successor must advertise its ticket while waiting, otherwise
      // another tab could mistake the still-loading document for an abandoned owner.
      window.addEventListener('pagehide',startupUnload,{once:true});
      window.addEventListener('pageshow',startupRestore);
      beginDocumentLiveness();updateTabRegistry();
      startupHeartbeat=setInterval(()=>{
        if(_pageUnloading||_pageRestored)return;
        try{updateTabRegistry()}catch(err){console.warn('[Pallet Movement Monitor] startup liveness',err)}
      },TAB_HEARTBEAT_MS);
      if(!await waitForAftStartup())return;
      await updateDocumentPresence();
      if(_pageUnloading||_pageRestored)return;
      const continuing=reloadContinuation();if(continuing)refreshing=true;
      await storageTransaction(()=>{runSharedMaintenance()},[K.lastPrune],true);
      if(_pageUnloading||_pageRestored)return;
      invalidateHierarchyCache();
      monitorStarted=true;
      setInterval(updateStatusLine,1000);
      if(isAftPage())initMultiSelect();
      updateTabRegistry();
      _lastDuplicateState=duplicateStateSignature();
      const h=getHierarchy();render(h);recoverUIPosition();
      if(isAftPage())authStartWatch();
      // Initial-load hold: do not classify large AFT mutation batches while its
      // hierarchy is loading. Existing refresh readiness/settling stays unchanged.
      let aftInitialScanHold=isAftPage()&&!aftPageReady(false);
      const scanObserverOptions={childList:true,subtree:true,characterData:true,attributes:true,attributeOldValue:true,attributeFilter:['href','id','class']};
      const obs=new MutationObserver(records=>{
        if(aftInitialScanHold){
          if(!aftPageReady(false))return;
          aftInitialScanHold=false;
          obs.disconnect();
          obs.observe(document.body,scanObserverOptions);
          invalidateHierarchyCache();
          requestScan('aft-initial-load-ready',true);
          return;
        }
        const relevant=scanMutations(records);
        perfStats.mutations+=relevant.length;perfStats.ignoredMutations+=records.length-relevant.length;
        if(!relevant.length)return;
        if(isHunterPage())ensureHunterCsv(true).then(()=>{invalidateHierarchyCache();requestScan('hunter-data-mutation',true)}).catch(err=>{const ident=loadIdentity();if(ident.loadId)reportMonitorError(err)});
        else{invalidateHierarchyCache();requestScan('hierarchy-mutation')}
      });
      // Watch loader visibility too while held, so hiding the spinner alone can
      // release the hold. Restore the original filter after readiness is reached.
      obs.observe(document.body,aftInitialScanHold?{...scanObserverOptions,attributeFilter:[...scanObserverOptions.attributeFilter,'style','hidden']}:scanObserverOptions);
      document.addEventListener('visibilitychange',()=>{
        if(!document.hidden&&!_pageRestored){_absence=null;updateTabRegistry();updateDocumentPresence().then(()=>{if(!_refreshRequest&&nextRefreshAt&&Date.now()>=nextRefreshAt)queueRefresh().catch(reportMonitorError);else if(!_refreshRequest&&!nextRefreshAt)schedule();maybeRecoverAbandonedRefresh()});requestScan('visible',true);updateStatusLine()}
      });
      // A real user click on AFT refresh is a manual override: AFT's own handler runs
      // now, outside the queue, paused or not. This tab's not-yet-launched monitor
      // request (queued or cooldown wait) is cancelled so it cannot click as well; an
      // in-flight monitor refresh and other tabs' barriers are left untouched. No
      // barrier is written, so the reloaded page boots as a normal load. Clicks from
      // other scripts (untrusted) still join the queue. No AJAX/fetch hooks.
      window.addEventListener('click',e=>{
        if(_clickFromMonitor)return;
        const target=elementOf(e.target)?.closest?.('#refreshDataRequest');if(!target)return;
        if(e.isTrusted){
          if(duplicateViewOnly()){e.preventDefault();e.stopImmediatePropagation();refreshProblem='Duplicate VRID: refresh from the primary tab';updateStatusLine();return;}
          if(_refreshRequest?.inFlight&&(refreshPhase==='running'||refreshPhase==='settling')){e.preventDefault();e.stopImmediatePropagation();refreshProblem='Refresh already in progress in this tab';updateStatusLine();return;}
          cancelQueuedRefresh();clearTimeout(refreshTimer);refreshTimer=0;nextRefreshAt=0;
          _manualRefreshAt=Date.now();perfStats.lastRefresh={startedAt:_manualRefreshAt,outcome:'manual refresh (bypassed queue)'};
          if(refreshPhase!=='blocked'&&refreshPhase!=='stalled')refreshProblem='';
          // AFT reloads only on success; after an AFT error the countdown must resume.
          if(!_refreshRequest)schedule();else updateStatusLine();return;
        }
        e.preventDefault();e.stopImmediatePropagation();
        if(isPaused()){refreshProblem='Resume this load before refreshing';updateStatusLine();return}
        if(refreshPhase==='blocked'||refreshPhase==='stalled'){refreshProblem='Refresh queue is held; recover or resolve it first';updateStatusLine();return}
        queueRefresh().catch(reportMonitorError);
      },true);
      clearInterval(startupHeartbeat);startupHeartbeat=0;
      _tabHeartbeat=setInterval(async()=>{try{
        await updateDocumentPresence();if(_pageRestored||_pageUnloading)return;
        updateTabRegistry();const state=duplicateStateSignature();
        if(state!==_lastDuplicateState){_lastDuplicateState=state;lastSignature='';requestScan('ownership-change',true);schedule();renderOnViewChange(getHierarchy());}
      }catch(err){reportMonitorError(err)}},TAB_HEARTBEAT_MS);
      _recoveryTimer=setInterval(()=>maybeRecoverAbandonedRefresh(),RECOVERY_CHECK_MS);
      setInterval(()=>{if(!document.hidden&&!_pageRestored)slaTick(loadIdentity())},30000);
      maybeRecoverAbandonedRefresh();
      cleanupReliabilityStorage().catch(reportMonitorError);
      _lastSourceActive=sourceTrackingActive(getHierarchy());
      let priorAftStale=aftDataFreshness().stale;
      if(isHunterPage())setInterval(()=>{try{hunterFeederTick()}catch(err){console.warn('[Pallet Movement Monitor] Hunter feeder',err)}},3000);
      _sourceHeartbeat=setInterval(()=>{try{if(dataSourceMode()==='auto'){const stale=aftDataFreshness().stale;if(stale!==priorAftStale){priorAftStale=stale;invalidateHierarchyCache();requestScan('source-freshness-change',true)}if(isAftPage()&&stale&&(!_hunterApi.loadedAt||Date.now()-_hunterApi.loadedAt>60000)&&Date.now()-(_hunterApiLast?.at||0)>60000&&!_hunterApiPromise){ensureHunterApi(false).then(()=>{invalidateHierarchyCache();requestScan('stale-aft-hunter-ready',true)}).catch(()=>{})}}if(isAftPage()&&(['hunter','combined'].includes(dataSourceMode())||hunterLoaderFrame()))noteFeedWant(loadIdentity(),false);if(isCombinedMode())refreshCombinedHunter(false);if(isAftPage()&&!hunterLoaderNeeded())removeHunterLoader();const h=getHierarchy();if(h?.loadId&&lastSnapshotAccepted&&usable(h)&&!monitorError)noteSourceHealth(h?.source||pageSource(),h,true,'heartbeat');const active=sourceTrackingActive(h);if(active!==_lastSourceActive){_lastSourceActive=active;lastSignature='';if(isHunterPage()&&active)ensureHunterCsv(true).then(()=>requestScan('auto-fallback-activated',true)).catch(reportMonitorError);else if(isAftPage()&&dataSourceMode()==='auto'&&!freshAftHealthy(loadIdentity().loadId))ensureHunterApi(true).then(()=>requestScan('auto-fallback-activated',true)).catch(()=>requestScan('source-activity-change',true));else requestScan('source-activity-change',true);schedule();renderOnViewChange(getHierarchy());}}catch(err){console.warn('[Pallet Movement Monitor] source heartbeat',err)}},10000);
      window.addEventListener('pagehide',()=>{_pageUnloading=true;cancelQueuedRefresh();clearTimeout(refreshTimer);clearTimeout(_scanTimer);clearInterval(_tabHeartbeat);clearInterval(_sourceHeartbeat);clearInterval(_recoveryTimer);_documentAliveRelease?.();removeTabRegistryEntry();obs.disconnect()},{once:true});
      window.addEventListener('pageshow',e=>{if(e.persisted){
        _pageRestored=true;cancelQueuedRefresh();clearTimeout(refreshTimer);clearTimeout(_scanTimer);obs.disconnect();
        // One reload initializes fresh observers/timers. It does not click AFT Refresh or claim a barrier.
        logRefreshEvent('browser-restored page reinitializing');
        setRefreshPhase('blocked','Restoring monitor after browser navigation');location.reload();
      }});
      // Normal lifecycle handlers now cover unload and back/forward restoration.
      window.removeEventListener('pagehide',startupUnload);
      window.removeEventListener('pageshow',startupRestore);
      setInterval(()=>{storageTransaction(()=>{runSharedMaintenance()},[K.lastPrune],true).catch(reportMonitorError)},PRUNE_INTERVAL_MS);
      if(continuing)queueRefresh(true).catch(reportMonitorError);
      else if(isHunterPage()){
        const ident=loadIdentity();
        if(ident.loadId&&ident.shipmentId)waitForHunterData().then(()=>{invalidateHierarchyCache();requestScan('hunter-startup',true);schedule()}).catch(err=>{reportMonitorError(err);requestScan('hunter-startup-error',true);schedule()});
        else{requestScan('hunter-list-page',true);schedule()}
      }else if(dataSourceMode()==='combined'){
        requestScan('startup',true);schedule();refreshCombinedHunter(true);
      }else if(dataSourceMode()==='hunter'){
        ensureHunterApi(true,true).then(()=>{invalidateHierarchyCache();requestScan('hunter-api-startup',true);schedule()}).catch(err=>{_hunterFailCount++;reportMonitorError(err);requestScan('hunter-api-startup-error',true);schedule()});
      }else{requestScan('startup',true);schedule()}
    }catch(err){
      monitorError=clean(err?.message||err);refreshPhase='blocked';refreshProblem=monitorError;
      // Show a usable warning panel even if locks/storage initialization failed.
      // Do not defeat the loading hold by parsing/rendering on an early error.
      if(!isAftPage()||aftPageReady(false)){try{render(getHierarchy())}catch(_){}}
      reportMonitorError(err);
    }
  }

  function initMultiSelect(){
    if(window.__pmmMultiSelectInit)return;window.__pmmMultiSelectInit=true;
    const selected=new Map();
    let bar=null;
    const style=document.createElement('style');
    style.textContent='.pmm-ms-selected{outline:2px solid #e0ad3c!important;background:rgba(224,173,60,.22)!important}#pmm-ms-bar{position:fixed;bottom:16px;right:16px;z-index:2147483000;background:#222;color:#fff;padding:8px 12px;border-radius:8px;font:13px/1.3 -apple-system,Segoe UI,Arial,sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 2px 10px rgba(0,0,0,.35)}#pmm-ms-bar button{font-size:12px;padding:4px 9px;border:1px solid #666;background:#333;color:#fff;border-radius:5px;cursor:pointer}#pmm-ms-bar button:hover{background:#444}';
    document.head.appendChild(style);
    function ensureBar(){
      if(bar&&document.body.contains(bar))return bar;
      bar=document.createElement('div');bar.id='pmm-ms-bar';
      bar.innerHTML='<span id="pmm-ms-count"></span><button type="button" id="pmm-ms-copy">Copy IDs</button><button type="button" id="pmm-ms-clear">Clear</button>';
      document.body.appendChild(bar);
      bar.querySelector('#pmm-ms-copy').onclick=()=>{
        pruneDetached();
        const text=[...selected.keys()].join('\n');
        try{GM_setClipboard(text,'text')}catch{navigator.clipboard?.writeText(text)}
      };
      bar.querySelector('#pmm-ms-clear').onclick=clearAll;
      return bar;
    }
    // The AFT grid replaces rows on every data refresh, so the Map held detached
    // cells alive and counted selections that are no longer on screen. Entries are
    // pruned by connectivity rather than re-queried. The observer skips the monitor
    // panel, which rebuilds itself on every scan and never holds these rows, and it
    // does nothing at all while the selection is empty.
    function pruneDetached(){
      let changed=false;
      for(const [id,el] of [...selected])if(!el||!el.isConnected){selected.delete(id);changed=true}
      return changed;
    }
    let pruneTimer=0;
    function schedulePrune(){
      if(pruneTimer)return;
      pruneTimer=setTimeout(()=>{pruneTimer=0;if(pruneDetached())updateBar()},500);
    }
    const ownChurn=node=>{
      const el=node?.nodeType===1?node:node?.parentElement;
      return !!el?.closest?.('#pax-monitor-v311,#pmm-ms-bar');
    };
    const rowObserver=new MutationObserver(records=>{
      if(!selected.size)return;
      for(const r of records){if(ownChurn(r.target))continue;schedulePrune();return}
    });
    const observeRows=()=>{
      const root=document.body;
      if(!root){document.addEventListener('DOMContentLoaded',observeRows,{once:true});return}
      rowObserver.observe(root,{childList:true,subtree:true});
    };
    observeRows();
    function updateBar(){
      pruneDetached();
      const n=selected.size;
      if(!n){bar?.remove();bar=null;return}
      const b=ensureBar();
      b.querySelector('#pmm-ms-count').textContent=`${n} selected`;
    }
    function clearAll(){
      selected.forEach(el=>el.classList.remove('pmm-ms-selected'));
      selected.clear();updateBar();
    }
    function idFromRow(row){
      const m=/^(.+)-row$/.exec(row.id||'');
      if(m)return m[1];
      const a=row.querySelector('.container-scannableId a,.item-fcSku a');
      return a?.textContent?.trim()||null;
    }
    document.addEventListener('click',e=>{
      if(!e.ctrlKey)return;
      const row=e.target.closest('div[id$="-row"]');
      if(!row)return;
      e.preventDefault();e.stopPropagation();
      const id=idFromRow(row);
      if(!id)return;
      pruneDetached();
      const cell=e.target.closest('.col-xs-3')||row;
      if(selected.has(id)){selected.get(id).classList.remove('pmm-ms-selected');selected.delete(id)}
      else{cell.classList.add('pmm-ms-selected');selected.set(id,cell)}
      updateBar();
    },true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected.size)clearAll()});
  }

  // Hidden Hunter loader inside an AFT tab: feed only. No panel, no tracking.
  function startHunterFrameFeeder(){
    const tick=()=>{try{hunterFeederTick()}catch(err){console.warn('[Pallet Movement Monitor] Hunter loader',err)}};
    let pending=0;
    const reload=()=>{pending=0;ensureHunterCsv(false).then(tick).catch(()=>{})};
    new MutationObserver(()=>{if(!pending)pending=setTimeout(reload,1000)}).observe(document.body||document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['href','download']});
    setInterval(tick,3000);
    const boot=()=>waitForHunterData().then(tick).catch(err=>{console.warn('[Pallet Movement Monitor] Hunter loader not ready yet',err);setTimeout(boot,15000)});
    boot();
  }
  if(HUNTER_FRAME_FEEDER){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startHunterFrameFeeder,{once:true});else startHunterFrameFeeder();
    return;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
