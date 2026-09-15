import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './styles.css'

const API = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')
const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/in/vaishali-sonkar-b83a87314/',
  github: 'https://github.com/Vaishali-Sonkar',
}

const suggestedQuestions = [
  { icon: 'fire', text: 'Tell me about your skills' },
  { icon: 'trend', text: 'What projects have you worked on?' },
  { icon: 'code', text: 'What technologies do you use?' },
  { icon: 'monitor', text: 'What are your achievements?' },
]

const icons = {
  bot: '◉', certificate: '✺', projects: '▱', contact: '✉', suggest: '♧',
  globe: '◎', fire: '♨', clock: '◷', trend: '↗', layers: '◇', code: '⌘', monitor: '◫', send: '↑'
}

function Sidebar({ page, setPage, newChat }) {
  const nav = (id, icon, label) => <button className={page === id ? 'side-link active' : 'side-link'} onClick={() => setPage(id)}><span>{icons[icon]}</span>{label}</button>
  return <aside className="sidebar">
    <div className="brand"><div><strong>Vera</strong><small>AI Resume Assistant</small></div></div>
    <button className="new-chat" onClick={newChat}><span>＋</span> New Chat</button>
    <p className="nav-label">MENU</p>
    <nav>{nav('certificates','certificate','Certificates')}{nav('projects','projects','Projects')}</nav>
    <div className="side-bottom"><p className="nav-label">SUPPORT</p>{nav('suggestions','suggest','Suggestions')}{nav('contact','contact','Contact Me')}</div>
  </aside>
}

function SocialIcon({ type }) {
  return type === 'linkedin'
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 7.7H1.6V22h3.6V7.7ZM3.4 2A2.1 2.1 0 1 0 3.4 6.2 2.1 2.1 0 0 0 3.4 2ZM22 13.8c0-4.3-2.3-6.4-5.3-6.4-2.4 0-3.5 1.3-4.1 2.3v-2H9V22h3.6v-7.1c0-1.9.4-3.8 2.8-3.8 2.4 0 2.4 2.2 2.4 3.9v7H22v-8.2Z"/></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1 1.6 1 .9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.7-1.3-2.3-.3-4.7-1.1-4.7-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.4-1.3.1-2.7 0 0 .9-.3 2.8 1a9.7 9.7 0 0 1 5.1 0c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.8-4.7 5 .4.3.7 1 .7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg>
}

function Header() {
  return <header><div className="header-actions"><a className="resume-download" href="/assets/vaishali_sept.pdf" download="Vaishali_Sonkar_Resume.pdf" aria-label="Download Vaishali's resume" title="Download resume"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v10.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4 3.6 3.6V3ZM5 19h14v2H5v-2Z"/></svg><span>Resume</span></a><a className="social-link" href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Open Vaishali's LinkedIn profile" title="LinkedIn"><SocialIcon type="linkedin"/></a><a className="social-link" href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="Open Vaishali's GitHub profile" title="GitHub"><SocialIcon type="github"/></a><span className="header-divider" aria-hidden="true"/><div className="mini-avatar">V</div></div></header>
}

function MessageContent({ message }) {
  if (message.role === 'user' || message.streaming) return <p>{message.text}</p>
  return <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{a:props=><a {...props} target="_blank" rel="noopener noreferrer"/>}}>{message.text}</ReactMarkdown></div>
}

function Chat({ messages, setMessages }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [thinking, setThinking] = useState(false)
  const sendQuestion = async rawQuestion => {
    const value = rawQuestion.trim(); if (!value || loading) return
    setQuestion(''); setMessages(m => [...m, {role:'user', text:value}]); setLoading(true); setThinking(true)
    try {
      const res = await fetch(`${API}/chat/stream`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question:value})})
      if (!res.ok || !res.body) throw new Error()
      const reader=res.body.getReader();const decoder=new TextDecoder();let answer='';let started=false
      while(true){
        const {value:chunk,done}=await reader.read();if(done)break
        const text=decoder.decode(chunk,{stream:true});if(!text)continue
        answer+=text
        if(!started){started=true;setThinking(false);setMessages(m=>[...m,{role:'assistant',text:answer,streaming:true}])}
        else setMessages(m=>m.map((message,index)=>index===m.length-1?{...message,text:answer}:message))
      }
      answer+=decoder.decode()
      if(!started||!answer.trim())throw new Error()
      setMessages(m=>m.map((message,index)=>index===m.length-1?{...message,text:answer,streaming:false}:message))
    } catch {
      setMessages(m=>{const clean=m.at(-1)?.streaming?m.slice(0,-1):m;return [...clean,{role:'assistant',text:'I couldn’t reach the resume service. Please try again.'}]})
    } finally { setThinking(false);setLoading(false) }
  }
  const ask = e => { e.preventDefault(); sendQuestion(question) }
  return <main className="chat-page">
    {messages.length === 0 ? <section className="chat-hero"><div className="hero-orb"></div><h1>Hey, I’m <em>Vaishali</em>. Ask me anything about my resume</h1><div className="chips">{suggestedQuestions.map(item => <button type="button" key={item.text} onClick={() => sendQuestion(item.text)} disabled={loading}><span aria-hidden="true">{icons[item.icon]}</span>{item.text}</button>)}</div></section>
      : <section className="conversation"><div className="conversation-head"><div className="hero-orb small"></div><div><h1>Resume chat</h1><p>Ask anything about Vaishali’s professional experience.</p></div></div>{messages.map((m,i)=><div key={i} className={`message ${m.role}`}><b>{m.role === 'user' ? 'You' : 'Sorin-AI'}</b><MessageContent message={m}/></div>)}{thinking && <div className="message assistant typing"><b>Vera</b><span className="typing-dots" aria-label="Sorin-AI is thinking"><i/><i/><i/></span></div>}</section>}
    <form className="composer" onSubmit={ask}><div className="composer-top"><span className="plus">＋</span><textarea rows="2" value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(e)}}} placeholder="Ask about skills, experience, projects, and more..."/></div><div className="composer-bottom"><div className="mode">✺ &nbsp; Auto</div><span className="hint">Enter to send · Shift + Enter for a new line</span><button disabled={loading || !question.trim()}>Send {icons.send}</button></div></form>
  </main>
}

function Contact() {
  const [status,setStatus]=useState({type:'',message:''})
  const [sending,setSending]=useState(false)
  const submit=async e=>{
    e.preventDefault();const form=e.currentTarget;const d=new FormData(form)
    const payload={name:d.get('name').trim(),email:d.get('email').trim(),subject:d.get('subject').trim(),message:d.get('message').trim()}
    if(Object.values(payload).some(value=>!value)){setStatus({type:'error',message:'Please complete every field.'});return}
    setSending(true);setStatus({type:'',message:''})
    try{
      const response=await fetch(`${API}/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const data=await response.json().catch(()=>({}))
      if(!response.ok){const detail=Array.isArray(data.detail)?data.detail[0]?.msg:data.detail;throw new Error(detail||'The message could not be sent. Please try again.')}
      setStatus({type:'success',message:data.message||"Message sent successfully! I'll get back to you soon."});form.reset()
    }catch(error){setStatus({type:'error',message:error.message||'The message could not be sent. Please try again.'})}
    finally{setSending(false)}
  }
  return <main className="content-page"><h1 className="page-title">Get in Touch</h1><p className="page-subtitle">Whether you’re looking for resume advice, exploring opportunities, or just want to connect, my inbox is always open.</p><div className="contact-grid"><section className="profile-card"><div className="profile-avatar"><img src="/assets/profile-avatar.jpg" alt="Vaishali Sonkar"/><span></span></div><h2>Vaishali</h2><p className="role">AI & SOFTWARE PROFESSIONAL</p><div className="details"><p><i>☎</i><span><small>Phone</small><a href="tel:+918081544364" aria-label="Call Vaishali at +91 80815 44364">+91 80815 44364</a></span></p><p><i>✉</i><span><small>Email</small><span className="contact-value">vaishalisonkar.tech@gmail.com</span></span></p><p><i>⌖</i><span><small>Location</small>India</span></p></div></section><form className="form-card" onSubmit={submit}><h2>Send a Message</h2><div className="form-row"><label>Your Name<input required maxLength="100" name="name" placeholder="Jane Doe"/></label><label>Email Address<input required maxLength="254" type="email" name="email" placeholder="jane@company.com"/></label></div><label>Subject<input required maxLength="200" name="subject" placeholder="How can I help you?"/></label><label>Message<textarea required maxLength="5000" name="message" placeholder="Write your message here..."/></label>{status.message&&<p role="status" className={status.type}>{status.message}</p>}<button className="primary-btn" disabled={sending}>{sending?'Sending...':'Send Email ➤'}</button></form></div><Footer/></main>
}

function Suggestions() {
  const [status,setStatus]=useState('')
  const submit=async e=>{e.preventDefault();setStatus('Sending…');const d=new FormData(e.currentTarget);try{const r=await fetch(`${API}/feedback`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:d.get('name')||'',email:d.get('email')||'',feedback:`[${d.get('type')}] ${d.get('feedback')}`,rating:5})});if(!r.ok)throw new Error();setStatus('Thank you — your suggestion was submitted.');e.currentTarget.reset()}catch{setStatus('Couldn’t submit. Please check the backend and Google Sheets connection.')}}
  return <main className="suggest-page"><form className="suggest-card" onSubmit={submit}><div className="suggest-icon">□</div><h1>Help me improve</h1><p>Have an idea or found a bug? Your feedback helps shape the<br/>future of this tool.</p><label>Feedback Type<select name="type"><option>Feature Request</option><option>Bug Report</option><option>General Feedback</option></select></label><label>Your Suggestion<textarea required name="feedback" placeholder="Tell me what you’d like to see..."/></label><div className="optional"><input name="name" placeholder="Name (optional)"/><input type="email" name="email" placeholder="Email (optional)"/></div>{status && <p className={status.startsWith('Couldn')?'error':'success'}>{status}</p>}<button className="primary-btn">Submit Suggestion&nbsp; ➤</button></form><Footer/></main>
}

function Placeholder({page}) { return <main className="placeholder"><div className="hero-orb"><span>◇</span></div><h1>{page[0].toUpperCase()+page.slice(1)}</h1><p>This section is ready for your resume content.</p></main> }
function Footer(){return <footer><span>© 2026 Vera Resume Portfolio</span><span>GitHub &nbsp;&nbsp; LinkedIn &nbsp;&nbsp; Email</span></footer>}

function App(){const[page,setPage]=useState('chat');const[messages,setMessages]=useState([]);const newChat=()=>{setMessages([]);setPage('chat')};return <div className="app"><Sidebar page={page} setPage={setPage} newChat={newChat}/><div className="shell"><Header/>{page==='chat'?<Chat messages={messages} setMessages={setMessages}/>:page==='contact'?<Contact/>:page==='suggestions'?<Suggestions/>:<Placeholder page={page}/>}</div></div>}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
