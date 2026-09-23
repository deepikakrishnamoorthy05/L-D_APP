import { Injectable } from '@nestjs/common';

export interface WeeklyDashboardRecord {
  weekDate: string; // ISO Date e.g. "2026-09-16"
  weekLabel: string; // e.g. "16 Sep – 22 Sep 2026"
  kpis: {
    trainingsConducted: number;
    sessionsScheduled: number;
    totalParticipants: number;
    assessmentsCompleted: number;
    feedbackReceived: number;
    communicationsSent: number;
    passedThisWeek: number;
  };
  weeklyActivities: Array<{
    id: string;
    date: string;
    displayDate: string;
    activity: string;
    type: string;
    owner: string;
    participants: string;
    status: string;
  }>;
  programs: Array<{
    id: string;
    title: string;
    programName: string;
    requestDate: string;
    totalParticipants: string;
    status: string;
    plannedEndDate?: string;
    revisedEndDate?: string;
    weeklyRows: Array<{
      dateRange: string;
      topic: string;
      trainer: string;
      status: string;
    }>;
  }>;
}

@Injectable()
export class WeeklyDashboardService {
  // In-Memory Database Store indexed by weekDate (e.g., "2026-09-16", "2026-09-09", "2026-09-23")
  private weeklyDatabase: Record<string, WeeklyDashboardRecord> = {
    '2026-09-16': {
      weekDate: '2026-09-16',
      weekLabel: '16 Sep – 22 Sep 2026',
      kpis: {
        trainingsConducted: 8,
        sessionsScheduled: 11,
        totalParticipants: 126,
        assessmentsCompleted: 6,
        feedbackReceived: 94,
        communicationsSent: 32,
        passedThisWeek: 4,
      },
      weeklyActivities: [
        { id: 'act-16-1', date: '2026-09-16', displayDate: '16 Sep', activity: 'Databricks Optimization', type: 'Training', owner: 'Samuel Davidson', participants: '18', status: 'Completed' },
        { id: 'act-16-2', date: '2026-09-17', displayDate: '17 Sep', activity: 'SQL Module Test', type: 'Assessment', owner: 'L&D Team', participants: '22', status: 'Completed' },
        { id: 'act-16-3', date: '2026-09-18', displayDate: '18 Sep', activity: 'Trainer Availability Request', type: 'Communication', owner: 'L&D Team', participants: '5 Trainers', status: 'Sent' },
        { id: 'act-16-4', date: '2026-09-19', displayDate: '19 Sep', activity: 'Bootcamp Feedback Request', type: 'Feedback', owner: 'L&D Team', participants: '28 Trainees', status: 'Sent' },
        { id: 'act-16-5', date: '2026-09-20', displayDate: '20 Sep', activity: 'Power BI DAX Workshop', type: 'Training', owner: 'Alex Thomas', participants: '24', status: 'Completed' },
      ],
      programs: [
        {
          id: 'prog-freshworks',
          title: 'Freshworks Interns<07/08/2026>',
          programName: 'Freshworks Interns',
          requestDate: '29/07/2026',
          totalParticipants: '14',
          status: 'In Progress',
          plannedEndDate: '21/08/2026',
          revisedEndDate: '31/08/2026',
          weeklyRows: [
            { dateRange: '10/09/2026 - 16/09/2026', topic: 'DM Sessions have been scheduled', trainer: 'Samuel Davidson', status: 'Completed' }
          ]
        },
        {
          id: 'prog-coalesce',
          title: 'Coalesce<19/06/2026>',
          programName: 'Coalesce',
          requestDate: '15/04/2026',
          totalParticipants: '06',
          status: 'Delayed',
          plannedEndDate: '19/06/2026',
          revisedEndDate: '31/08/2026',
          weeklyRows: [
            { dateRange: '10/09/2026 - 16/09/2026', topic: 'Workshop have been shared with a deadline 30th September', trainer: 'Nil', status: 'Completed' }
          ]
        },
        {
          id: 'prog-aws',
          title: 'AWS Fundamentals<08/06/2026>',
          programName: 'AWS Fundamentals',
          requestDate: '15/04/2026',
          totalParticipants: '06',
          status: 'Delayed',
          plannedEndDate: '19/06/2026',
          revisedEndDate: '31/08/2026',
          weeklyRows: [
            { dateRange: '10/09/2026 - 16/09/2026', topic: 'Workshop is going on', trainer: 'Nil', status: 'In Progress' }
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
          weeklyRows: [
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
          weeklyRows: [
            { dateRange: '10/09/2026 - 16/09/2026', topic: 'Organized workshop for 5 resources:\n1. Gokulnath Mani\n2. Gaurav Sharma\n3. Bharath Pugazhendhi\n4. Sabarinathan\n5. Vinodh Sampath', trainer: 'L&D', status: 'Completed' }
          ]
        },
        {
          id: 'prog-ai',
          title: 'AI Learning Sessions',
          programName: 'AI Learning Sessions',
          requestDate: '10/09/2026',
          totalParticipants: 'Cross-functional',
          status: 'In Progress',
          weeklyRows: [
            { dateRange: '10/09/2026', topic: '• Brief overview of key AI concepts\n• Overview of the Systech Marketplace\n• Introduction to self-paced study plan', trainer: 'Sudharshan and Balaji', status: 'Completed' }
          ]
        }
      ]
    },

    '2026-09-09': {
      weekDate: '2026-09-09',
      weekLabel: '09 Sep – 15 Sep 2026',
      kpis: {
        trainingsConducted: 6,
        sessionsScheduled: 9,
        totalParticipants: 110,
        assessmentsCompleted: 4,
        feedbackReceived: 82,
        communicationsSent: 28,
        passedThisWeek: 3,
      },
      weeklyActivities: [
        { id: 'act-9-1', date: '2026-09-09', displayDate: '09 Sep', activity: 'dbt Advanced Modeling', type: 'Training', owner: 'Lokesh Kesavamurthy', status: 'Completed', participants: '16' },
        { id: 'act-9-2', date: '2026-09-11', displayDate: '11 Sep', activity: 'AMH Data Science Best Practices', type: 'Training', owner: 'Pramoth Arul', status: 'Completed', participants: '20' },
        { id: 'act-9-3', date: '2026-09-14', displayDate: '14 Sep', activity: 'Model Drift Analysis', type: 'Training', owner: 'L&D Team', status: 'Completed', participants: '15' }
      ],
      programs: [
        {
          id: 'prog-freshworks',
          title: 'Freshworks Interns<07/08/2026>',
          programName: 'Freshworks Interns',
          requestDate: '29/07/2026',
          totalParticipants: '14',
          status: 'In Progress',
          weeklyRows: [
            { dateRange: '03/09/2026 - 09/09/2026', topic: 'No works carriedout', trainer: 'L&D', status: 'Yet To Start' }
          ]
        },
        {
          id: 'prog-coalesce',
          title: 'Coalesce<19/06/2026>',
          programName: 'Coalesce',
          requestDate: '15/04/2026',
          totalParticipants: '06',
          status: 'Delayed',
          weeklyRows: [
            { dateRange: '03/09/2026 - 09/09/2026', topic: 'Workshop is yet to be shared', trainer: 'Nil', status: 'Yet To Start' }
          ]
        },
        {
          id: 'prog-softskills',
          title: 'Soft Skills Training for Practice team',
          programName: 'Soft Skills Training for Practice team',
          requestDate: '15/04/2026',
          totalParticipants: '22',
          status: 'In Progress',
          weeklyRows: [
            { dateRange: '03/09/2026 - 09/09/2026', topic: 'Organized workshop for 5 resources:\n1. Ananya\n2. Gokul Prasad\n3. Jeffina\n4. Doniya\n5. Kushal', trainer: 'L&D', status: 'Completed' }
          ]
        }
      ]
    },

    '2026-09-23': {
      weekDate: '2026-09-23',
      weekLabel: '23 Sep – 29 Sep 2026',
      kpis: {
        trainingsConducted: 10,
        sessionsScheduled: 14,
        totalParticipants: 142,
        assessmentsCompleted: 8,
        feedbackReceived: 105,
        communicationsSent: 40,
        passedThisWeek: 6,
      },
      weeklyActivities: [
        { id: 'act-23-1', date: '2026-09-23', displayDate: '23 Sep', activity: 'Lakehouse Build Workshop Kickoff', type: 'Training', owner: 'Jaikumar', status: 'Scheduled', participants: '20' },
        { id: 'act-23-2', date: '2026-09-25', displayDate: '25 Sep', activity: 'Fabric Security Architecture', type: 'Training', owner: 'Govardhan', status: 'Scheduled', participants: '25' }
      ],
      programs: [
        {
          id: 'prog-freshworks',
          title: 'Freshworks Interns<07/08/2026>',
          programName: 'Freshworks Interns',
          requestDate: '29/07/2026',
          totalParticipants: '14',
          status: 'Completed',
          weeklyRows: [
            { dateRange: '17/09/2026 - 23/09/2026', topic: 'Final Project Submission & Sign-off Completed', trainer: 'Samuel Davidson', status: 'Completed' }
          ]
        },
        {
          id: 'prog-aws',
          title: 'AWS Fundamentals<08/06/2026>',
          programName: 'AWS Fundamentals',
          requestDate: '15/04/2026',
          totalParticipants: '06',
          status: 'In Progress',
          weeklyRows: [
            { dateRange: '17/09/2026 - 23/09/2026', topic: 'Final Workshop Review Session', trainer: 'Dinesh', status: 'In Progress' }
          ]
        }
      ]
    }
  };

  // Get list of available stored week dates
  getAvailableWeeks(): Array<{ weekDate: string; weekLabel: string }> {
    return Object.keys(this.weeklyDatabase).map((key) => ({
      weekDate: key,
      weekLabel: this.weeklyDatabase[key].weekLabel,
    }));
  }

  // Get specific weekly dashboard by weekDate (e.g. "2026-09-16")
  getWeeklyDashboard(weekDate?: string): WeeklyDashboardRecord {
    const targetDate = weekDate && this.weeklyDatabase[weekDate] ? weekDate : '2026-09-16';
    return this.weeklyDatabase[targetDate];
  }

  // Save or update weekly dashboard report in backend database
  saveWeeklyDashboard(data: WeeklyDashboardRecord): WeeklyDashboardRecord {
    const key = data.weekDate || '2026-09-16';
    this.weeklyDatabase[key] = {
      ...this.weeklyDatabase[key],
      ...data,
    };
    return this.weeklyDatabase[key];
  }
}
