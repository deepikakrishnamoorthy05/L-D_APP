export interface WeeklyRow {
  dateRange: string;
  topic: string;
  trainer: string;
  status: 'Completed' | 'In Progress' | 'Yet To Start' | 'Yet to start';
}

export interface ProgramTracker {
  id: string;
  title: string;
  programName: string;
  targetDateTag?: string;
  requestDate: string;
  totalParticipants: string;
  status: 'In Progress' | 'Delayed' | 'On Hold' | 'Completed' | 'Yet To Start';
  plannedEndDate?: string;
  revisedEndDate?: string;
  dateColumnName?: string;
  weeklyRows: WeeklyRow[];
}

export interface CertificationInitiative {
  id: string;
  certification: string;
  practiceOrTeam: string;
  provider: string;
  deadline: string;
  nominees: number;
  enrolled: number;
  passed: number;
  passRate: string;
  progress?: string;
  status: 'At Risk' | 'On Track' | 'Delayed' | 'Completed';
}

export interface OtherInitiative {
  id: string;
  program: string;
  required: number;
  deadline: string;
  nominees: number;
  completed: number;
  completionRate: string;
  progress?: string;
  status: 'On Track' | 'Delayed' | 'Completed' | 'At Risk';
}

export const PROGRAM_TRACKERS_DATA: ProgramTracker[] = [
  {
    id: 'prog-freshworks',
    title: 'Freshworks Interns<07/08/2026>',
    programName: 'Freshworks Interns',
    targetDateTag: '07/08/2026',
    requestDate: '29/07/2026',
    totalParticipants: '14',
    status: 'In Progress',
    plannedEndDate: '21/08/2026',
    revisedEndDate: '31/08/2026',
    dateColumnName: 'Week Start Date',
    weeklyRows: [
      { dateRange: '30/07/2026 - 05/08/2026', topic: 'Need to kickstart BA, Data Modelling and refresher sessions', trainer: 'Samuel, Madhavan', status: 'Yet To Start' },
      { dateRange: '06/08/2026 - 12/08/2026', topic: 'Kickstarted BA Session and got a list of seniors suggestions from mentors for the toastmaster sessions.', trainer: 'Madhavan', status: 'In Progress' },
      { dateRange: '13/08/2026 - 19/08/2026', topic: '2 BA Session has been completed and scheduled Data Modelling Session', trainer: 'Madhavan', status: 'Completed' },
      { dateRange: '20/08/2026 - 26/08/2026', topic: 'Data Modelling Session has been moved to 31st August. Organized Communication session by Lokesh', trainer: 'Lokesh', status: 'Completed' },
      { dateRange: '27/08/2026 - 02/09/2026', topic: 'Organized Communication session for the interns.', trainer: 'L&D', status: 'Completed' },
      { dateRange: '03/09/2026 - 09/09/2026', topic: 'No works carriedout', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '10/09/2026 - 16/09/2026', topic: 'DM Sessions have been scheduled', trainer: 'Samuel Davidson', status: 'Completed' }
    ]
  },
  {
    id: 'prog-coalesce',
    title: 'Coalesce<19/06/2026>',
    programName: 'Coalesce',
    targetDateTag: '19/06/2026',
    requestDate: '15/04/2026',
    totalParticipants: '06',
    status: 'Delayed',
    plannedEndDate: '19/06/2026',
    revisedEndDate: '31/08/2026',
    dateColumnName: 'Week Start Date',
    weeklyRows: [
      { dateRange: '21/05/2026 - 27/05/2026', topic: 'Received the participants list from Practice', trainer: 'Self', status: 'Completed' },
      { dateRange: '28/05/2026 - 02/06/2026', topic: '1. Need to finalize the training start date.\n2. Ensure alignment with the proposed candidates', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '03/06/2026 - 10/06/2026', topic: 'Completed initial meeting with the Participants and finalized the end date as 08th July.', trainer: 'Nil', status: 'Completed' },
      { dateRange: '11/06/2026 - 17/06/2026', topic: 'Received Action plan from few participants', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '18/06/2026 - 24/06/2026', topic: 'Preparation is going on', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '25/06/2026 - 01/07/2026', topic: 'Preparation is going on', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '02/07/2026 - 09/07/2026', topic: 'Preparation is going on', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '10/07/2026 - 20/07/2026', topic: 'Preparation is going on (Arshad completed)', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '21/07/2026 - 23/07/2026', topic: 'Preparation is going on', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '24/07/2026 - 29/07/2026', topic: 'Preparation is going on', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '30/07/2026 - 05/08/2026', topic: 'Conducted MCQ Test in Sysrank', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '06/08/2026 - 12/08/2026', topic: 'No Activity carried out', trainer: 'Nil', status: 'Yet To Start' },
      { dateRange: '13/08/2026 - 19/08/2026', topic: 'Had a discussion with Bharanidharan regarding conducting next test and Workshop.', trainer: 'Nil', status: 'Completed' },
      { dateRange: '20/08/2026 - 26/08/2026', topic: 'Workshop questions are ready but Bharani is checking for the environment access.', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '27/08/2026 - 02/09/2026', topic: 'Workshop questions are ready but Bharani is checking for the environment access.', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '03/09/2026 - 09/09/2026', topic: 'Workshop is yet to be shared', trainer: 'Nil', status: 'Yet To Start' },
      { dateRange: '10/09/2026 - 16/09/2026', topic: 'Workshop have been shared with a deadline 30th September', trainer: 'Nil', status: 'Completed' }
    ]
  },
  {
    id: 'prog-aws',
    title: 'AWS Fundamentals<08/06/2026>',
    programName: 'AWS Fundamentals',
    targetDateTag: '08/06/2026',
    requestDate: '15/04/2026',
    totalParticipants: '06',
    status: 'Delayed',
    plannedEndDate: '19/06/2026',
    revisedEndDate: '31/08/2026',
    dateColumnName: 'Week Start Date',
    weeklyRows: [
      { dateRange: '21/05/2026 - 27/05/2026', topic: 'Received the participants list from Practice', trainer: 'Self', status: 'Completed' },
      { dateRange: '28/05/2026 - 02/06/2026', topic: '1. Need to finalize the training start date.\n2. Ensure alignment with the proposed candidates.', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '03/06/2026 - 10/06/2026', topic: 'Completed initial meeting with the Participants and finalized the end date as 27th July.', trainer: 'L&D', status: 'Completed' },
      { dateRange: '11/06/2026 - 17/06/2026', topic: 'Received Action plan from 1 resource', trainer: 'L&D', status: 'In Progress' },
      { dateRange: '18/06/2026 - 24/06/2026', topic: 'Yet to receive the final list of participants', trainer: 'L&D', status: 'In Progress' },
      { dateRange: '25/06/2026 - 01/07/2026', topic: 'Yet to receive the final list of participants', trainer: 'L&D', status: 'In Progress' },
      { dateRange: '02/07/2026 - 09/07/2026', topic: 'Preparation is going on', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '10/07/2026 - 20/07/2026', topic: 'Preparation is going on', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '21/07/2026 - 23/07/2026', topic: 'Preparation is going on (Dhevesh has completed)', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '24/07/2026 - 29/07/2026', topic: 'Preparation is going on', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '30/07/2026 - 05/08/2026', topic: 'Conducted MCQ Test in Sysrank', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '06/08/2026 - 12/08/2026', topic: 'No Activity carried out', trainer: 'Nil', status: 'Yet To Start' },
      { dateRange: '13/08/2026 - 19/08/2026', topic: 'Had a discussion with Dinesh regarding conducting next test and Workshop.', trainer: 'Nil', status: 'Completed' },
      { dateRange: '20/08/2026 - 26/08/2026', topic: 'Dinesh prepared workshop and shared with the participants. The deadline planned is 31st August', trainer: 'Nil', status: 'Completed' },
      { dateRange: '27/08/2026 - 02/09/2026', topic: 'Workshop is going on', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '03/09/2026 - 09/09/2026', topic: 'Workshop is going on', trainer: 'Nil', status: 'In Progress' },
      { dateRange: '10/09/2026 - 16/09/2026', topic: 'Workshop is going on', trainer: 'Nil', status: 'In Progress' }
    ]
  },
  {
    id: 'prog-gcp',
    title: 'GCP Fundamentals<26/06/2026>',
    programName: 'GCP Fundamentals',
    targetDateTag: '26/06/2026',
    requestDate: '15/04/2026',
    totalParticipants: '06',
    status: 'On Hold',
    plannedEndDate: '19/06/2026',
    dateColumnName: 'Week Start Date',
    weeklyRows: [
      { dateRange: '21/05/2026 - 27/05/2026', topic: 'Received the participants list from Practice', trainer: 'Self', status: 'Completed' },
      { dateRange: '28/05/2026 - 02/06/2026', topic: '1. Need to finalize the training start date.\n2. Ensure alignment with the proposed candidates.\n3. Finalize the GCP Course', trainer: 'L&D', status: 'In Progress' },
      { dateRange: '03/06/2026 - 10/06/2026', topic: '1. Need to finalize the training start date.\n2. Ensure alignment with the proposed candidates.\n3. Finalize the GCP Course', trainer: 'L&D', status: 'In Progress' },
      { dateRange: '11/06/2026 - 17/06/2026', topic: 'Completed first draft of Roadmap', trainer: 'L&D', status: 'In Progress' },
      { dateRange: '18/06/2026 - 24/06/2026', topic: 'Completed the Roadmap', trainer: 'L&D', status: 'In Progress' },
      { dateRange: '25/06/2026 - 01/07/2026', topic: 'Planned a call on Friday with the participants', trainer: 'Self', status: 'In Progress' },
      { dateRange: '29/07/2026 - 05/08/2026', topic: 'Yet to plan', trainer: 'NA', status: 'Yet To Start' },
      { dateRange: '06/08/2026 - 12/08/2026', topic: 'No Activity carried out', trainer: 'Nil', status: 'Yet To Start' },
      { dateRange: '13/08/2026 - 19/08/2026', topic: 'No Activity carried out', trainer: 'Nil', status: 'Yet To Start' },
      { dateRange: '20/08/2026 - 26/08/2026', topic: 'No Activity carried out', trainer: 'Nil', status: 'Yet To Start' },
      { dateRange: '27/08/2026 - 16/09/2026', topic: 'No Activity carried out', trainer: 'Nil', status: 'Yet To Start' }
    ]
  },
  {
    id: 'prog-qa',
    title: 'QA Training',
    programName: 'QA Training',
    requestDate: '05/06/2026',
    totalParticipants: 'Nil',
    status: 'Yet To Start',
    plannedEndDate: 'NA',
    dateColumnName: 'Week Start Date',
    weeklyRows: [
      { dateRange: '03/06/2026 - 10/06/2026', topic: 'Draft a plan of action', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '11/06/2026 - 17/06/2026', topic: 'Draft a plan of action', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '18/06/2026 - 24/06/2026', topic: 'Draft a plan of action', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '25/07/2026 - 01/07/2026', topic: 'Draft a plan of action', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '02/07/2026 - 29/07/2026', topic: 'Yet to Plan', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '30/07/2026 - 05/08/2026', topic: 'Yet to Plan', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '06/08/2026 - 12/08/2026', topic: 'Trainers and the project team has been finalized', trainer: 'Janakiraman', status: 'Completed' },
      { dateRange: '13/08/2026 - 19/08/2026', topic: 'Kickstarted the QA Training for TDSG and WSPC team.', trainer: 'Janakiraman & Team', status: 'In Progress' },
      { dateRange: '20/08/2026 - 26/08/2026', topic: 'Completed the training for TDSG and WSPC team. Working on scheduling the next session for IFFCO and Mercury', trainer: 'Janakiraman & Team', status: 'In Progress' },
      { dateRange: '27/08/2026 - 02/09/2026', topic: 'Completed session for IFFCO and scheduled for AMH & Alliant this week', trainer: 'Janakiraman & Team', status: 'Completed' },
      { dateRange: '03/09/2026 - 09/09/2026', topic: 'Completed session for Alliant, Mercury. Yet to schedule session for AMH and options medical.', trainer: 'Janakiraman & Team', status: 'Completed' },
      { dateRange: '10/09/2026 - 16/09/2026', topic: 'Session for AMH is on hold and scheduled the 2nd session for options medical on 16/09/2026', trainer: 'Janakiraman & Team', status: 'Completed' }
    ]
  },
  {
    id: 'prog-softskills',
    title: 'Soft Skills Training for Practice team',
    programName: 'Soft Skills Training for Practice team',
    requestDate: '15/04/2026',
    totalParticipants: '22',
    status: 'In Progress',
    plannedEndDate: 'NA',
    dateColumnName: 'Week Start Date',
    weeklyRows: [
      { dateRange: '03/06/2026 - 10/06/2026', topic: 'Draft a plan of action', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '11/06/2026 - 17/06/2026', topic: 'Had a meeting with Keerthana regarding session for leads for which she will confirm.', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '18/06/2026 - 24/06/2026', topic: 'Draft a plan of action', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '25/06/2026 - 01/07/2026', topic: 'Draft a plan of action', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '02/07/2026 - 09/07/2026', topic: 'Received list from BA team', trainer: 'Madhavan', status: 'Completed' },
      { dateRange: '10/07/2026 - 29/07/2026', topic: 'Scheduled the session for 31st July', trainer: 'L&D', status: 'Completed' },
      { dateRange: '30/07/2026 - 05/08/2026', topic: 'Organized Workshop for BA team', trainer: 'L&D', status: 'Completed' },
      { dateRange: '06/08/2026 - 12/08/2026', topic: 'Yet to finalize the first phase of participants from DE Team', trainer: 'L&D', status: 'Completed' },
      { dateRange: '13/08/2026 - 19/08/2026', topic: 'No Activities carried out', trainer: 'L&D', status: 'Yet To Start' },
      { dateRange: '20/08/2026 - 26/08/2026', topic: 'Organized workshop for 6 resources', trainer: 'L&D', status: 'Completed' },
      { dateRange: '27/08/2026 - 02/09/2026', topic: 'Scheduled workshop for 7 resources', trainer: 'L&D', status: 'Completed' },
      { dateRange: '03/09/2026 - 09/09/2026', topic: 'Organized workshop for 5 resources:\n1. Ananya\n2. Gokul Prasad\n3. Jeffina\n4. Doniya\n5. Kushal', trainer: 'L&D', status: 'Completed' },
      { dateRange: '10/09/2026 - 16/09/2026', topic: 'Organized workshop for 5 resources:\n1. Gokulnath Mani\n2. Gaurav Sharma\n3. Bharath Pugazhendhi\n4. Sabarinathan\n5. Vinodh Sampath', trainer: 'L&D', status: 'Completed' }
    ]
  },
  {
    id: 'prog-informatica',
    title: 'Informatica Training',
    programName: 'Informatica Training',
    requestDate: '27/07/2026',
    totalParticipants: '15',
    status: 'Completed',
    plannedEndDate: '24/08/2026',
    revisedEndDate: '08/09/2026',
    dateColumnName: 'Week Start Date',
    weeklyRows: [
      { dateRange: '28/07/2026 - 05/08/2026', topic: 'Kickstarted the daily session for the external training', trainer: 'External', status: 'Completed' },
      { dateRange: '06/08/2026 - 12/08/2026', topic: 'Daily sessions and a test was conducted', trainer: 'External', status: 'Completed' },
      { dateRange: '13/08/2026 - 19/08/2026', topic: 'Daily sessions and a test was conducted', trainer: 'External', status: 'Completed' },
      { dateRange: '20/08/2026 - 26/08/2026', topic: 'All the sessions have been completed but yet to give workshop', trainer: 'External', status: 'Completed' },
      { dateRange: '27/08/2026 - 02/09/2026', topic: 'Workshop was provided but the resources are yet to complete', trainer: 'Jaikumar', status: 'Completed' },
      { dateRange: '03/09/2026 - 09/09/2026', topic: 'Workshop has been completed', trainer: 'Srinivasan and Jaikumar', status: 'Completed' }
    ]
  },
  {
    id: 'prog-knowledge',
    title: 'Knowledge Sharing Sessions',
    programName: 'Knowledge Sharing Sessions',
    requestDate: '28/07/2026',
    totalParticipants: 'All Engineering',
    status: 'In Progress',
    dateColumnName: 'Session Date',
    weeklyRows: [
      { dateRange: '31/07/2026', topic: 'dbt State of Mind', trainer: 'Lokesh Kesavamurthy', status: 'Completed' },
      { dateRange: '07/08/2026', topic: 'Power BI Best Practices & Migration to Microsoft Fabric', trainer: 'Gokul Prasad & Gokulnath Mani', status: 'Completed' },
      { dateRange: '14/08/2026', topic: 'Model Drift Analysis', trainer: 'L&D Team', status: 'Completed' },
      { dateRange: '21/08/2026', topic: 'Rapid Implementation on Fabric', trainer: 'Manibharathi & Govardhan', status: 'Completed' },
      { dateRange: '22/08/2026', topic: 'Databricks – Event-Based Job Orchestration and Genie Use Cases', trainer: 'Inicosmith & Ranjith Rajendran', status: 'Completed' },
      { dateRange: '04/09/2026', topic: 'QA Best Practices', trainer: 'Ramakrishnan Jeyachandiran', status: 'Completed' },
      { dateRange: '11/09/2026', topic: 'AMH Data Science Best Practices', trainer: 'Pramoth Arul and Kalaivani Ravi', status: 'Completed' }
    ]
  },
  {
    id: 'prog-ai',
    title: 'AI Learning Sessions',
    programName: 'AI Learning Sessions',
    requestDate: '10/09/2026',
    totalParticipants: 'Cross-functional',
    status: 'In Progress',
    dateColumnName: 'Session Date',
    weeklyRows: [
      {
        dateRange: '10/09/2026',
        topic: '• Brief overview of key AI concepts\n• Overview of the Systech Marketplace\n• Introduction to self-paced study plan for broader learning journey',
        trainer: 'Sudharshan and Balaji',
        status: 'Completed'
      }
    ]
  }
];

export const CERTIFICATION_INITIATIVES_DATA: CertificationInitiative[] = [
  { id: 'cert-1', certification: 'DBT Analytics Engineer', practiceOrTeam: 'Partnership', provider: 'DBT', deadline: '30 SEP', nominees: 15, enrolled: 15, passed: 1, passRate: '6.67%', status: 'At Risk' },
  { id: 'cert-2', certification: 'Azure Administrator Associate', practiceOrTeam: 'Partnership', provider: 'Microsoft', deadline: '24 AUG', nominees: 3, enrolled: 2, passed: 0, passRate: '0%', status: 'On Track' },
  { id: 'cert-3', certification: 'Claude Certified Architect Professional (CCAR-P)', practiceOrTeam: 'Partnership', provider: 'Claude', deadline: '26 SEP', nominees: 1, enrolled: 1, passed: 0, passRate: '0%', status: 'On Track' },
  { id: 'cert-4', certification: 'Machine Learning Operations Engineer Associate (AI-300)', practiceOrTeam: 'Partnership', provider: 'Microsoft', deadline: '30 SEP', nominees: 1, enrolled: 0, passed: 0, passRate: '0%', status: 'On Track' },
  { id: 'cert-5', certification: 'Azure AI Apps and Agents Developer Associate (AI-103)', practiceOrTeam: 'Partnership', provider: 'Microsoft', deadline: '30 SEP', nominees: 2, enrolled: 1, passed: 1, passRate: '50%', status: 'On Track' },
  { id: 'cert-6', certification: 'Claude Certified Architect – Foundations (CCA-F)', practiceOrTeam: 'Partnership', provider: 'Claude', deadline: '30 SEP', nominees: 12, enrolled: 2, passed: 2, passRate: '16.67%', status: 'On Track' },
  { id: 'cert-7', certification: 'Microsoft Azure Solutions Architect Expert', practiceOrTeam: 'Partnership', provider: 'Microsoft', deadline: '28 AUG', nominees: 3, enrolled: 0, passed: 0, passRate: '0%', status: 'On Track' },
  { id: 'cert-8', certification: 'Matillion Certified Associate', practiceOrTeam: 'DE', provider: 'Matillion', deadline: '25 MAY', nominees: 21, enrolled: 21, passed: 20, passRate: '95.24%', status: 'Delayed' },
  { id: 'cert-9', certification: 'Databricks Certified Data Engineer Associate', practiceOrTeam: 'DE', provider: 'Databricks', deadline: '30 JUL', nominees: 5, enrolled: 4, passed: 4, passRate: '80%', status: 'Completed' },
  { id: 'cert-10', certification: 'Databricks Certified Generative AI Engineer Associate', practiceOrTeam: 'AI', provider: 'Databricks', deadline: '31 JUL', nominees: 9, enrolled: 7, passed: 7, passRate: '77.78%', status: 'Delayed' },
  { id: 'cert-11', certification: 'AZ-305 exam – Designing Microsoft Azure Infrastructure Solutions', practiceOrTeam: 'DE', provider: 'Microsoft', deadline: '31 AUG', nominees: 1, enrolled: 1, passed: 0, passRate: '0%', status: 'On Track' },
  { id: 'cert-12', certification: 'Snowflake SnowPro Core', practiceOrTeam: 'DE', provider: 'Snowflake', deadline: '31 AUG', nominees: 14, enrolled: 3, passed: 3, passRate: '21.43%', status: 'On Track' },
  { id: 'cert-13', certification: 'DP 700 Microsoft Certified: Fabric Data Engineer Associate', practiceOrTeam: 'Self', provider: 'Microsoft', deadline: '31 AUG', nominees: 22, enrolled: 19, passed: 19, passRate: '85%', status: 'Delayed' },
  { id: 'cert-14', certification: 'Databricks Partner Champions Program', practiceOrTeam: 'Partnership', provider: 'Databricks', deadline: '31 DEC', nominees: 0, enrolled: 0, passed: 0, passRate: '0%', status: 'On Track' },
  { id: 'cert-15', certification: 'PL-300 Exam -Microsoft Power BI Data Analyst Exam', practiceOrTeam: 'BA', provider: 'Microsoft', deadline: '16 JUL', nominees: 2, enrolled: 2, passed: 2, passRate: '100%', status: 'Completed' },
  { id: 'cert-16', certification: 'DP 800 - Microsoft Certified; SQL AI Developer Associate', practiceOrTeam: 'Partnership', provider: 'Microsoft', deadline: '31 JUL', nominees: 1, enrolled: 1, passed: 1, passRate: '100%', status: 'Completed' },
  { id: 'cert-17', certification: 'Microsoft Certified: Fabric Analytics Engineer Associate (DP-600)', practiceOrTeam: 'Partnership', provider: 'Microsoft', deadline: '05 AUG', nominees: 4, enrolled: 4, passed: 4, passRate: '100%', status: 'Completed' },
  { id: 'cert-18', certification: 'Databricks Certified Data Analyst Associate', practiceOrTeam: 'Self', provider: 'Databricks', deadline: '07 AUG', nominees: 1, enrolled: 1, passed: 1, passRate: '100%', status: 'Completed' },
  { id: 'cert-19', certification: 'Databricks Certified Data Engineer Professional', practiceOrTeam: 'Self', provider: 'Databricks', deadline: '17 AUG', nominees: 1, enrolled: 1, passed: 1, passRate: '100%', status: 'Completed' },
  { id: 'cert-20', certification: 'Microsoft Certified: AI Agent Builder Associate (AB-620)', practiceOrTeam: 'Partnership', provider: 'Microsoft', deadline: '18 AUG', nominees: 5, enrolled: 5, passed: 5, passRate: '100%', status: 'Completed' },
  { id: 'cert-21', certification: 'DBT Architect', practiceOrTeam: 'Partnership', provider: 'DBT', deadline: '06 JUN', nominees: 1, enrolled: 1, passed: 1, passRate: '100%', status: 'Completed' },
  { id: 'cert-22', certification: 'Microsoft Information Security Administrator Certification', practiceOrTeam: 'Partnership', provider: 'Microsoft', deadline: '10 AUG', nominees: 6, enrolled: 6, passed: 6, passRate: '100%', status: 'Completed' }
];

export const OTHER_INITIATIVES_DATA: OtherInitiative[] = [
  { id: 'oth-1', program: 'Project Expert Badge - SQL Server Migration', required: 20, deadline: '30 DEC', nominees: 20, completed: 19, completionRate: '95%', status: 'On Track' },
  { id: 'oth-2', program: 'Project Expert Badge - Snowflake Migration', required: 20, deadline: '30 DEC', nominees: 20, completed: 19, completionRate: '95%', status: 'On Track' },
  { id: 'oth-3', program: 'Project Expert Badge - Lakehouse Build', required: 20, deadline: '30 DEC', nominees: 20, completed: 0, completionRate: '0%', status: 'On Track' },
  { id: 'oth-4', program: 'Project Expert Badge - Data Governance and Security', required: 20, deadline: '30 DEC', nominees: 20, completed: 21, completionRate: '100%', status: 'Completed' }
];
