import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Mail, User, UserPlus, X } from 'lucide-react';
import { Trainee } from '../../types/trainee';
import { useTrainees } from '../../context/TraineeContext';
import { useBootcamps } from '../../context/BootcampContext';

interface Props { initialData?: Trainee; defaultBootcampId?: string; lockBootcamp?: boolean; onCreated?: (trainee: Trainee) => void; onClose: () => void; }

export const AddTraineeModal: React.FC<Props> = ({ initialData, defaultBootcampId, onCreated, onClose }) => {
  const { addTrainee, updateTrainee, trainees } = useTrainees();
  const { bootcamps } = useBootcamps();
  const isEdit = Boolean(initialData);
  const [name, setName] = useState(initialData?.name || '');
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [error, setError] = useState('');
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase() || 'NT';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Employee name is required.');
    if (!employeeId.trim()) return setError('Employee ID is required.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (!isEdit && trainees.some(t=>t.employeeId.toLowerCase()===employeeId.trim().toLowerCase())) return setError('This Employee ID already exists.');
    const selected = bootcamps.find(b=>b.id===(initialData?.bootcampId || defaultBootcampId)) || bootcamps[0];
    const payload: Partial<Trainee> = { name:name.trim(), employeeId:employeeId.trim(), email:email.trim(), bootcampId:selected?.id || '', bootcampName:selected?.name || 'Not Assigned' };
    if (isEdit && initialData) updateTrainee(initialData.id,payload);
    else onCreated?.(addTrainee(payload));
    onClose();
  };

  return <div className="simple-modal-backdrop" onClick={onClose}>
    <motion.form className="simple-trainee-modal" onSubmit={submit} onClick={e=>e.stopPropagation()} initial={{opacity:0,scale:.96,y:18}} animate={{opacity:1,scale:1,y:0}}>
      <header><div className="simple-modal-icon"><UserPlus/></div><div><h2>{isEdit?'Edit Trainee':'Add New Trainee'}</h2><p>Enter the employee details below.</p></div><button type="button" onClick={onClose}><X/></button></header>
      <div className="simple-trainee-body">
        <div className="trainee-mini-preview"><span>{initials}</span><div><b>{name || 'Employee Name'}</b><small>{employeeId || 'Employee ID'} · {email || 'email@company.com'}</small></div></div>
        {error&&<div className="simple-form-error">{error}</div>}
        <label className="simple-field"><span>Employee Name *</span><div><User/><input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Enter employee name"/></div></label>
        <label className="simple-field"><span>Employee ID *</span><input value={employeeId} onChange={e=>setEmployeeId(e.target.value)} placeholder="e.g. EMP1024"/></label>
        <label className="simple-field"><span>Email *</span><div><Mail/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="employee@company.com"/></div></label>
      </div>
      <footer><button type="button" className="cancel" onClick={onClose}>Cancel</button><button type="submit" className="launch"><Check/>{isEdit?'Save Changes':'Add Trainee'}</button></footer>
    </motion.form>
  </div>;
};
