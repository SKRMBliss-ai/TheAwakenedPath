import { motion } from 'framer-motion';
import { Camera, CameraOff, FlipHorizontal, MessageSquare, LogOut } from 'lucide-react';

const RoomControls = ({ isCameraOn, isChatOpen, participantCount, onToggleCamera, onSwitchCamera, onToggleChat, onLeave, cameraPermission }:
  { isCameraOn:boolean; isChatOpen:boolean; participantCount:number; onToggleCamera:()=>void; onSwitchCamera:()=>void; onToggleChat:()=>void; onLeave:()=>void; cameraPermission:string }) => (
  <motion.div initial={{ y:80,opacity:0 }} animate={{ y:0,opacity:1 }} transition={{ delay:0.4,type:'spring',damping:22 }}
    className="fixed bottom-0 left-0 right-0 z-[10005] pb-[env(safe-area-inset-bottom,16px)] pt-4 px-6 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/95 to-transparent">
    {cameraPermission==='denied' && <p className="text-amber-400/70 text-[10px] text-center mb-3">Camera denied — your presence still matters.</p>}
    <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
      <Btn onClick={onToggleCamera} active={isCameraOn} disabled={cameraPermission==='denied'} label={isCameraOn?'On':'Off'}>
        {isCameraOn ? <Camera size={20}/> : <CameraOff size={20}/>}
      </Btn>
      {isCameraOn && <Btn onClick={onSwitchCamera} label="Flip" subtle><FlipHorizontal size={18}/></Btn>}

      <button onClick={onLeave} className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-red-600/90 hover:bg-red-500 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.35)]">
          <LogOut size={22} className="text-white -scale-x-100"/>
        </div>
        <span className="text-[9px] text-red-400/80 font-bold uppercase tracking-widest">Leave</span>
      </button>

      <Btn onClick={onToggleChat} active={isChatOpen} label="Chat"><MessageSquare size={20}/></Btn>

      <div className="flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-amber-400/15 flex flex-col items-center justify-center">
          <span className="text-amber-400 font-black text-sm">{participantCount}</span>
          <span className="text-white/30 text-[7px] uppercase tracking-widest">here</span>
        </div>
        <span className="text-[9px] text-white/30 uppercase tracking-widest">Present</span>
      </div>
    </div>
  </motion.div>
);

const Btn = ({ onClick,children,active,disabled,label,subtle }:
  { onClick:()=>void;children:React.ReactNode;active?:boolean;disabled?:boolean;label:string;subtle?:boolean }) => (
  <button onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-1 disabled:opacity-40">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
      active?'bg-amber-500/20 text-amber-400 border border-amber-400/30':
      subtle?'bg-white/5 text-white/50 border border-white/8 hover:bg-white/10':
      'bg-slate-800/80 text-white/60 border border-white/8 hover:bg-white/10 hover:text-white/80'}`}>
      {children}
    </div>
    <span className={`text-[9px] font-bold uppercase tracking-widest ${active?'text-amber-400/70':'text-white/30'}`}>{label}</span>
  </button>
);

export default RoomControls;
