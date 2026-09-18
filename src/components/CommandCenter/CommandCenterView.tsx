import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Award, Bell, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck,
  Clock3, GraduationCap, MessageSquare, Plus, Search, Send,
  Moon, Sparkles, Sun, Users, X,
} from 'lucide-react';
import { PlanTrainingModal } from '../Training/PlanTrainingModal';
import { ScheduleSessionModal } from '../Sessions/ScheduleSessionModal';
import { CreateAssessmentModal } from '../Assessments/CreateAssessmentModal';

interface Props { onNavigate?: (navId: string) => void; onSelectTrainee?: (id: string) => void; onSelectBootcamp?: (id: string) => void; }

const actions = [
  { color:'#ef3340', icon:Users, title:'Trainer response pending', detail:'Informatica Training', sub:'Trainer availability required', due:'Today, 11:00 AM', button:'Review', nav:'training' },
  { color:'#ff9418', icon:Bell, title:'Reminder due', detail:'Databricks Workshop', sub:'Send reminder to 25 participants', due:'Today, 2:00 PM', button:'Send', nav:'reminders' },
  { color:'#2f7eea', icon:ClipboardCheck, title:'Quiz scheduled', detail:'SQL Advanced Session', sub:'Review quiz and publish', due:'Tomorrow, 9:00 AM', button:'Review', nav:'assessments' },
  { color:'#ff5a64', icon:MessageSquare, title:'Feedback pending', detail:'Knowledge Sharing Series', sub:'3 feedback responses pending', due:'Tomorrow, 5:00 PM', button:'View', nav:'feedback' },
  { color:'#f6a51b', icon:Award, title:'Certification request', detail:'Databricks Certification', sub:'Management requested 10 resources', due:'18 Sep 2026', button:'Assign', nav:'certifications' },
];

const kpis = [
  { icon:GraduationCap, value:'3', title:'Sessions Today', sub:'2 classroom • 1 virtual', badge:'↑ +25%', tone:'teal', nav:'calendar' },
  { icon:Users, value:'4', title:'Pending Trainer Responses', sub:'Awaiting availability', badge:'↑ +2', tone:'violet', nav:'training' },
  { icon:Bell, value:'5', title:'Reminders Due', sub:'Scheduled for today', badge:'!', tone:'orange', nav:'calendar' },
  { icon:ClipboardCheck, value:'12', title:'Assessments Today', sub:'10 quizzes • 2 evaluations', badge:'↑ +3', tone:'teal', nav:'assessments' },
];

export const CommandCenterView: React.FC<Props> = ({ onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [palette, setPalette] = useState(false);
  const [plan, setPlan] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => { const fn=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();setPalette(v=>!v)}}; addEventListener('keydown',fn); return()=>removeEventListener('keydown',fn)},[]);
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDate(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const liveDate = currentDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const currentHour = currentDate.getHours();
  const liveGreeting = currentHour < 12
    ? 'Good Morning'
    : currentHour < 17
      ? 'Good Afternoon'
      : 'Good Evening';
  const notify=(text:string)=>{setToast(text);setTimeout(()=>setToast(''),2600)};
  const stagger={hidden:{opacity:0},show:{opacity:1,transition:{staggerChildren:.055}}};
  const rise={hidden:{opacity:0,y:14},show:{opacity:1,y:0,transition:{duration:.42,ease:'easeOut' as const}}};
  return <motion.main className="cc2" variants={stagger} initial="hidden" animate="show">
    <AnimatePresence>{toast&&<motion.div className="cc2-toast" initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}><CheckCircle2 size={17}/>{toast}</motion.div>}</AnimatePresence>

    <motion.section className="cc2-hero" variants={rise}>
      <div className="cc2-aurora"/><div className="cc2-city" aria-hidden="true"><i/><i/><i/><i/><i/></div>
      <div className="cc2-hero-top">
        <div className="cc2-welcome"><motion.div className="cc2-sun" animate={{rotate:360}} transition={{duration:28,repeat:Infinity,ease:'linear'}}>{currentHour >= 17 || currentHour < 5 ? <Moon/> : <Sun/>}</motion.div><div><h1>{liveGreeting}</h1><p>Elevating talent performance and learning momentum today.</p></div></div>
        <div className="cc2-tools"><span className="cc2-date"><CalendarDays size={17}/> {liveDate}</span><button className="cc2-search" onClick={()=>setPalette(true)}><Search size={17}/><span>Search anything...</span><kbd>⌘ K</kbd></button><button className="cc2-bell"><Bell size={19}/><b>5</b></button><span className="cc2-avatar">LA</span></div>
      </div>
      <div className="cc2-flow">
        {[{i:BookOpen,l:'Training',c:'teal'},{i:CalendarDays,l:'Calendar',c:'blue'},{i:Award,l:'Assessment',c:'purple'},{i:MessageSquare,l:'Feedback',c:'orange'}].map((x,n)=><React.Fragment key={x.l}><div className={`cc2-flow-item ${x.c}`}><span><x.i size={18}/></span>{x.l}</div>{n<3&&<motion.i className="cc2-dashes" animate={{backgroundPosition:['0px 0','18px 0']}} transition={{duration:1.3,repeat:Infinity,ease:'linear'}}/>}</React.Fragment>)}
      </div>
    </motion.section>

    <motion.section className="cc2-kpis" variants={stagger}>{kpis.map((k)=><motion.button key={k.title} className="cc2-kpi" variants={rise} whileHover={{y:-5,scale:1.008}} onClick={()=>onNavigate?.(k.nav)}><span className={`cc2-kpi-icon ${k.tone}`}><k.icon/></span><span className="cc2-kpi-copy"><span className="cc2-kpi-line"><strong>{k.value}</strong><em className={k.tone}>{k.badge}</em></span><b>{k.title}</b><small>{k.sub}</small></span></motion.button>)}</motion.section>

    <motion.div className="cc2-main-grid" variants={rise}>
      <section className="cc2-card cc2-actions"><header><h2>Action Required <b>5</b></h2><button>View All <ArrowRight size={14}/></button></header><div className="cc2-table-head"><span>Task</span><span>Details</span><span>Due</span><span>Action</span></div>
        {actions.map((a,n)=><motion.div className="cc2-action" key={a.title} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:.32+n*.07}}><i style={{background:a.color}}/><span className="cc2-action-icon" style={{color:a.color,background:`${a.color}12`}}><a.icon size={19}/></span><div><b>{a.title}</b></div><div><b>{a.detail}</b><small>{a.sub}</small></div><div className={n<2?'urgent':''}><Clock3 size={15}/>{a.due}</div><button onClick={()=>onNavigate?.(a.nav)}>{a.button}</button></motion.div>)}
      </section>
      <section className="cc2-card cc2-upcoming"><header><h2>Today &amp; Upcoming</h2><button onClick={()=>onNavigate?.('calendar')}>View Calendar <ArrowRight size={14}/></button></header><div className="cc2-tabs"><b>Today</b><span>Tomorrow</span><span>This Week</span></div><div className="cc2-timeline">
        {[['10:00 AM','Knowledge Sharing Series','Sarah David • DE Track','Conference Room 1','Live','teal'],['02:00 PM','Informatica Training','Michael Paul • Tools Track','Training Room 2','','blue'],['04:30 PM','Reminder Dispatch','Databricks Workshop','','Scheduled','purple']].map((e)=><div className="cc2-event" key={e[0]}><b>{e[0]}</b><i className={e[5]}/><div><strong>{e[1]}</strong><small>{e[2]}</small><small>{e[3]}</small></div>{e[4]&&<em>{e[4]}</em>}</div>)}
        <p>Tomorrow • 17 Sep 2026</p><div className="cc2-event"><b>11:00 AM</b><i className="orange"/><div><strong>BA Workshop</strong><small>Priya Sharma • BA Track</small><small>Conference Room 1</small></div></div>
      </div></section>
    </motion.div>

    <motion.div className="cc2-actions-bar" initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{delay:.85,type:'spring'}}><button className="primary" onClick={()=>setPlan(true)}><Plus/>Plan Training</button><button onClick={()=>setSchedule(true)}><CalendarDays/>Schedule Session</button><button onClick={()=>setQuiz(true)}><ClipboardCheck/>Generate Quiz</button><button onClick={()=>onNavigate?.('reminders')}><Send/>Send Reminder</button></motion.div>
    <AnimatePresence>{palette&&<motion.div className="cc2-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setPalette(false)}><motion.div className="cc2-palette" initial={{scale:.95,y:-12}} animate={{scale:1,y:0}} onClick={e=>e.stopPropagation()}><Search/><input autoFocus placeholder="Search pages and actions..."/><button onClick={()=>setPalette(false)}><X/></button><div><button onClick={()=>{setPlan(true);setPalette(false)}}><BookOpen/>Plan Training</button><button onClick={()=>{setSchedule(true);setPalette(false)}}><CalendarDays/>Schedule Session</button><button onClick={()=>{setQuiz(true);setPalette(false)}}><Sparkles/>Generate Quiz</button></div></motion.div></motion.div>}</AnimatePresence>
    {plan&&<PlanTrainingModal onClose={()=>setPlan(false)}/>} {schedule&&<ScheduleSessionModal onClose={()=>setSchedule(false)}/>} {quiz&&<CreateAssessmentModal onClose={()=>setQuiz(false)}/>} 
  </motion.main>
};
export default CommandCenterView;
