import { Session } from '../types/session';

export interface AIEmailContext {
  trainerName: string;
  trainerEmail: string;
  bootcampName: string;
  bootcampType?: string;
  bootcampYear?: number;
  learningTrack?: string;
  moduleName: string;
  sessionTitle: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  mode: string;
  meetingLinkOrLocation: string;
  agenda: string;
  coordinatorName?: string;
  evaluatorName?: string;
  specialNotes?: string;
}

export interface AIEmailOutput {
  subject: string;
  body: string;
  isAIGenerated: boolean;
}

class AICommunicationService {
  /**
   * Generates a professional, concise trainer notification email using L&D system instruction.
   */
  public generateTrainerSessionEmail(
    context: AIEmailContext,
    actionType: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' = 'SCHEDULED'
  ): AIEmailOutput {
    let subject = '';
    let introText = '';

    if (actionType === 'SCHEDULED') {
      subject = `L&D Training Assignment — ${context.sessionTitle} | ${context.sessionDate}`;
      introText = `You have been scheduled to conduct the following L&D training session.`;
    } else if (actionType === 'RESCHEDULED') {
      subject = `L&D Session Rescheduled — ${context.sessionTitle} | ${context.sessionDate}`;
      introText = `Notice: Your training session schedule has been updated.`;
    } else {
      subject = `L&D Session Cancelled — ${context.sessionTitle}`;
      introText = `Notice: The following L&D training session has been cancelled.`;
    }

    const body = `Hello ${context.trainerName},

${introText}

Session Details:
• Session: ${context.sessionTitle}
• Bootcamp: ${context.bootcampName}
• Learning Track: ${context.learningTrack || 'Common Foundation'}
• Module: ${context.moduleName}
• Date: ${context.sessionDate}
• Time: ${context.startTime} – ${context.endTime}
• Mode: ${context.mode || 'Classroom'}
• Meeting Link / Location: ${context.meetingLinkOrLocation || 'TBD'}

Agenda:
${context.agenda || 'Core technical training session.'}

Coordinator Context:
${context.coordinatorName ? `${context.coordinatorName} (L&D Coordinator)` : 'Priya Sharma'}

Please review the session details above and contact the L&D team if any adjustments are required.

Regards,
L&D Intelligence Platform Team`;

    return {
      subject,
      body,
      isAIGenerated: true,
    };
  }
}

export const aiCommunicationService = new AICommunicationService();
