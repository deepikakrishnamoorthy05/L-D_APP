import { Session } from '../types/session';
import { User } from '../types/bootcamp';

export interface EmailNotificationRecord {
  id: string;
  sessionId: string;
  sessionTitle: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  status: 'Sent' | 'Pending' | 'Failed';
  sentAt: string;
}

class NotificationService {
  private notifications: EmailNotificationRecord[] = [];

  // Check if a trainer has an overlapping session
  public checkTrainerConflict(
    trainerId: string,
    date: string,
    startTime: string,
    endTime: string,
    sessions: Session[],
    excludeSessionId?: string
  ): { hasConflict: boolean; conflictingSession?: Session } {
    const trainerSessions = sessions.filter(
      (s) =>
        s.id !== excludeSessionId &&
        s.status !== 'Cancelled' &&
        s.sessionDate === date &&
        (s.trainerId === trainerId || s.additionalTrainerId === trainerId)
    );

    for (const session of trainerSessions) {
      // Check time overlap
      if (this.isTimeOverlapping(startTime, endTime, session.startTime, session.endTime)) {
        return { hasConflict: true, conflictingSession: session };
      }
    }

    return { hasConflict: false };
  }

  private isTimeOverlapping(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);
    return Math.max(s1, s2) < Math.min(e1, e2);
  }

  private timeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  // Send Email Notification to Trainer(s)
  public sendTrainerNotification(
    session: Session,
    trainer: User,
    actionType: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED'
  ): EmailNotificationRecord {
    let subject = '';
    let actionText = '';

    if (actionType === 'SCHEDULED') {
      subject = `L&D Training Session Scheduled — ${session.title}`;
      actionText = 'A new training session has been scheduled for you.';
    } else if (actionType === 'RESCHEDULED') {
      subject = `L&D Session Rescheduled — ${session.title}`;
      actionText = 'Your training session schedule has been updated.';
    } else {
      subject = `L&D Session Cancelled — ${session.title}`;
      actionText = 'Notice: The following training session has been cancelled.';
    }

    const body = `Hello ${trainer.name},

${actionText}

Session: ${session.title}
Bootcamp: ${session.bootcampName}
Track: ${session.learningTrack || 'Common Foundation'}
Module: ${session.moduleName}
Date: ${session.sessionDate}
Time: ${session.startTime} – ${session.endTime}
Mode: ${session.mode || 'Classroom'}
Meeting Link / Location: ${session.meetingLink || session.location || 'TBD'}

Agenda:
${session.agenda || 'Core technical training session.'}

Regards,
L&D Intelligence Platform Team`;

    const record: EmailNotificationRecord = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sessionId: session.id,
      sessionTitle: session.title,
      recipientEmail: trainer.email || `${trainer.name.toLowerCase().replace(' ', '.')}@systechusa.com`,
      recipientName: trainer.name,
      subject,
      body,
      status: 'Sent',
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.notifications.unshift(record);
    return record;
  }

  public getNotificationsForSession(sessionId: string): EmailNotificationRecord[] {
    return this.notifications.filter((n) => n.sessionId === sessionId);
  }
}

export const notificationService = new NotificationService();
