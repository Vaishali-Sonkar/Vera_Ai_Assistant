// Public URLs start at /projects; do not include /public in these paths.
// Edit this object when adding screenshots or renaming the overview PDF.
export const vidyaroom = {
  id: 'vidyaroom',
  name: 'VidyaRoom',
  subtitle: 'AI-Powered Interactive Lecture Learning Platform',
  tagline: 'Transforming lectures into continuous learning experiences.',
  description: 'VidyaRoom turns uploaded lectures into multilingual transcripts, structured notes, quizzes, presentations and lecture-grounded AI assistance, connecting students directly with teachers for doubt resolution and 1-to-1 academic support.',
  achievement: { title: 'Best Approach Award', event: "IBM BOB Hacks\u201926" },
  tech: ['FastAPI', 'Python', 'PostgreSQL', 'Next.js', 'LangGraph', 'RAG', 'LLMs', 'WebSockets', 'WebRTC', 'Cloudinary'],
  highlights: ['3-role academic ecosystem', '6-stage AI processing workflow', 'Lecture-grounded RAG', 'Real-time teacher support & 1-to-1 video'],
  images: [
    { src: '/projects/landingpage.png', alt: 'VidyaRoom landing page' },
    { src: '/projects/teacher_dashboard.jpeg', alt: 'VidyaRoom teacher dashboard' },
    { src: '/projects/transcriptions.png', alt: 'VidyaRoom lecture transcripts' },
    { src: '/projects/notes.png', alt: 'VidyaRoom lecture notes' },
    { src: '/projects/quiz.png', alt: 'VidyaRoom practice quiz' },
  ],
  pdf: '/projects/doc.pdf',
}
