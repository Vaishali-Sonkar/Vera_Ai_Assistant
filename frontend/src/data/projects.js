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

export const salesForecasting = {
  id: 'sales-forecasting',
  name: 'Sales Forecasting',
  subtitle: 'Retail Sales Forecasting with SARIMA and XGBoost',
  tagline: 'Turning historical sales into informed decisions.',
  description: 'Analyzed four years of Superstore transactions, aggregated them into a daily time series, and used trend, seasonality, stationarity, and ACF/PACF analysis to guide forecasting and business insights.',
  tech: ['Python', 'Pandas', 'Statsmodels', 'XGBoost', 'Scikit-learn', 'Matplotlib'],
  highlights: ['SARIMA: MAE 1,857 · RMSE 2,430', 'XGBoost: MAE 1,898 · RMSE 2,502', '30-day sales forecast', 'Historical sales insights'],
  images: [{ src: '/projects/sales-forecasting-dashboard.png', alt: 'Sales Forecast Dashboard showing key metrics and historical daily sales' }],
  github: 'https://github.com/Vaishali-Sonkar/sales_forcasting',
}

export const projects = [vidyaroom, salesForecasting]
