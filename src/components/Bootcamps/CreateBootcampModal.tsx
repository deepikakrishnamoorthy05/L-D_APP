import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, ChevronDown, Edit3, Plus, Trash2, UserPlus, X } from 'lucide-react';
import { Bootcamp, BootcampType } from '../../types/bootcamp';
import { useBootcamps } from '../../context/BootcampContext';
import { useTrainees } from '../../context/TraineeContext';

interface Props { initialData?: Bootcamp; isDuplicateMode?: boolean; onClose: () => void; }

export const CreateBootcampModal: React.FC<Props> = ({ initialData, isDuplicateMode = false, onClose }) => {
  const { bootcamps, modulesMap, createBootcamp, updateBootcamp } = useBootcamps();
  const { addTrainee } = useTrainees();
  const isEdit = Boolean(initialData && !isDuplicateMode);
  const [step, setStep] = useState(1);
  const [name, setName] = useState(isDuplicateMode && initialData ? `${initialData.name} Copy` : initialData?.name || '');
  const [bootcampType, setBootcampType] = useState<BootcampType>(initialData?.bootcampType || 'BOOTCAMP');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [modules, setModules] = useState<string[]>(initialData ? (modulesMap[initialData.id] || []).map(m => m.name) : []);
  const [moduleName, setModuleName] = useState('');
  const [error, setError] = useState('');
  const [newTrainees, setNewTrainees] = useState([{ name:'', employeeId:'', email:'' }]);

  const addModule = () => {
    const value = moduleName.trim();
    if (value && !modules.includes(value)) setModules([...modules, value]);
    setModuleName('');
  };

  const validateDetails = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return setError('Bootcamp name is required.');
    if (trimmedName.length > 100) return setError('Bootcamp name must be 100 characters or less.');
    if (!startDate) return setError('Start date is required.');
    if (!endDate) return setError('End date is required.');
    if (new Date(endDate) < new Date(startDate)) return setError('End date must be on or after start date.');
    setError('');
    setStep(2);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { validateDetails(); return; }
    const year = startDate ? new Date(`${startDate}T00:00:00`).getFullYear() : new Date().getFullYear();
    const sequence = bootcamps.filter(b => b.bootcampYear === year).length + 1;
    const data: Partial<Bootcamp> = {
      name: name.trim(),
      startDate,
      endDate,
      bootcampYear: year,
      code: initialData?.code || `BC-${year}-${String(sequence).padStart(2, '0')}`,
      bootcampType,
      cohortName: name.trim(),
      description: initialData?.description || `${name.trim()} learning cohort`,
      status: initialData?.status || 'Planned',
    };
    const validTrainees = newTrainees.filter(t=>t.name.trim() || t.employeeId.trim() || t.email.trim());
    for (const trainee of validTrainees) {
      if (!trainee.name.trim() || !trainee.employeeId.trim() || !/^\S+@\S+\.\S+$/.test(trainee.email.trim())) {
        setError('Complete Employee Name, Employee ID and a valid Email for every trainee.');
        return;
      }
    }
    if (isEdit && initialData) {
      updateBootcamp(initialData.id, data, modules, validTrainees.map((_,i)=>`new-${i}`));
      validTrainees.forEach(t=>addTrainee({...t,bootcampId:initialData.id,bootcampName:initialData.name}));
    } else {
      const createdBootcamp = createBootcamp(data, modules, validTrainees.map((_,i)=>`new-${i}`));
      validTrainees.forEach(t=>addTrainee({...t,bootcampId:createdBootcamp.id,bootcampName:createdBootcamp.name,totalModules:modules.length}));
    }
    onClose();
  };

  return <div className="simple-modal-backdrop" onClick={onClose}>
    <motion.form className="simple-launch-modal" onSubmit={submit} onClick={e=>e.stopPropagation()} initial={{opacity:0,scale:.96,y:18}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.96,y:18}}>
      <header><div className="simple-modal-icon">{step===1?<BookOpen/>:<UserPlus/>}</div><div><h2>{step===1?(isEdit ? 'Edit Bootcamp' : 'Launch New Bootcamp'):'Add Trainees'}</h2><p>{step===1?'Enter the cohort details to get started.':'Select employees to include in this bootcamp.'}</p></div><button type="button" onClick={onClose} aria-label="Close"><X/></button></header>
      <div className="simple-modal-body">
        {error && <div className="simple-form-error">{error}</div>}
        {step===1 ? <>
        <label className="simple-field full">
          <span>Bootcamp Name *</span>
          <input
            autoFocus
            value={name}
            onChange={e=>setName(e.target.value)}
            placeholder="Enter bootcamp name"
          />
        </label>
        <label className="simple-field full">
          <span>Type</span>
          <select value={bootcampType} onChange={e=>setBootcampType(e.target.value as BootcampType)}>
            <option value="BOOTCAMP">Regular Bootcamp</option>
            <option value="LATERAL">Lateral Bootcamp</option>
          </select>
        </label>
        <div className="simple-date-grid">
          <label className="simple-field"><span>Start Date *</span><div><CalendarDays/><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/></div></label>
          <label className="simple-field"><span>End Date *</span><div><CalendarDays/><input type="date" min={startDate} value={endDate} onChange={e=>setEndDate(e.target.value)}/></div></label>
        </div>
        <button type="button" className="curriculum-toggle" onClick={()=>setShowCurriculum(v=>!v)}><span><Edit3/>Edit Curriculum <small>Optional</small></span><ChevronDown className={showCurriculum?'open':''}/></button>
        <AnimatePresence>{showCurriculum&&<motion.div className="simple-curriculum" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
          <p>Add or remove the learning modules for this bootcamp.</p>
          <div className="module-entry"><input value={moduleName} onChange={e=>setModuleName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addModule()}}} placeholder="Module name"/><button type="button" onClick={addModule}><Plus/>Add</button></div>
          <div className="simple-module-list">{modules.length===0?<span>No curriculum modules added yet.</span>:modules.map((m,i)=><div key={`${m}-${i}`}><b>{String(i+1).padStart(2,'0')}</b><span>{m}</span><button type="button" onClick={()=>setModules(modules.filter((_,n)=>n!==i))}><Trash2/></button></div>)}</div>
        </motion.div>}</AnimatePresence>
        </> : <div className="new-trainee-step">
          <div className="new-trainee-heading"><div><strong>New Trainees</strong><small>Add employee details for this bootcamp.</small></div><button type="button" onClick={()=>setNewTrainees([...newTrainees,{name:'',employeeId:'',email:''}])}><Plus/>Add Another Trainee</button></div>
          <div className="new-trainee-forms">{newTrainees.map((t,i)=><div className="new-trainee-card" key={i}><div className="new-trainee-card-head"><b>Trainee {i+1}</b>{newTrainees.length>1&&<button type="button" onClick={()=>setNewTrainees(newTrainees.filter((_,n)=>n!==i))}><Trash2/>Remove</button>}</div><label className="simple-field"><span>Employee Name *</span><input autoFocus={i===0} value={t.name} onChange={e=>setNewTrainees(newTrainees.map((v,n)=>n===i?{...v,name:e.target.value}:v))} placeholder="Enter employee name"/></label><div className="new-trainee-row"><label className="simple-field"><span>Employee ID *</span><input value={t.employeeId} onChange={e=>setNewTrainees(newTrainees.map((v,n)=>n===i?{...v,employeeId:e.target.value}:v))} placeholder="e.g. EMP1024"/></label><label className="simple-field"><span>Email *</span><input type="email" value={t.email} onChange={e=>setNewTrainees(newTrainees.map((v,n)=>n===i?{...v,email:e.target.value}:v))} placeholder="employee@company.com"/></label></div></div>)}</div>
        </div>}
      </div>
      <footer><button type="button" className="cancel" onClick={step===1?onClose:()=>setStep(1)}>{step===1?'Cancel':<><ArrowLeft/>Back</>}</button><button type="submit" className="launch">{step===1?<><span>Next: Add Trainees</span><ArrowRight/></>:<><Check/>{isEdit?'Save Changes':'Launch Bootcamp'}</>}</button></footer>
    </motion.form>
  </div>;
};

