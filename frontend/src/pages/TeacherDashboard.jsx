import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI, coursesAPI, announcementsAPI, aiAPI, liveAPI, quizzesAPI, usersAPI, assignmentsAPI } from '../services/api';
import Sidebar from '../components/common/Sidebar';
import AIChatbot from '../components/common/AIChatbot';
import { StatCard, Loader, EmptyState, SectionHeader, Modal } from '../components/common/UIComponents';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const S = {
  card:  { background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'1.25rem', marginBottom:'0.75rem' },
  badge: (c) => ({ background:`${c}15`, color:c, padding:'2px 10px', borderRadius:'999px', fontSize:'0.7rem', fontWeight:600, display:'inline-block' }),
};

function ManualQuizBuilder({ courses, onSave }) {
  const [title,     setTitle]     = useState('');
  const [courseId,  setCourseId]  = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState([{ question:'', options:['','','',''], correctAnswer:0, explanation:'' }]);

  const addQ    = () => setQuestions(q => [...q, { question:'', options:['','','',''], correctAnswer:0, explanation:'' }]);
  const removeQ = (i) => questions.length > 1 && setQuestions(q => q.filter((_,j) => j!==i));
  const updateQ = (i, field, val) => setQuestions(q => q.map((q2,j) => j===i ? {...q2,[field]:val} : q2));
  const updateO = (qi, oi, val) => setQuestions(q => q.map((q2,j) => j===qi ? {...q2,options:q2.options.map((o,k)=>k===oi?val:o)} : q2));

  const save = async () => {
    if (!title.trim()) return toast.error('Title required');
    if (!courseId)     return toast.error('Select a course');
    for (let i=0;i<questions.length;i++) {
      if (!questions[i].question.trim()) return toast.error(`Q${i+1} has no text`);
      if (questions[i].options.some(o=>!o.trim())) return toast.error(`Q${i+1} has empty options`);
    }
    await onSave({ title, course:courseId, questions, timeLimit, isAIGenerated:false });
    setTitle(''); setCourseId(''); setTimeLimit(30);
    setQuestions([{ question:'', options:['','','',''], correctAnswer:0, explanation:'' }]);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <div><label className="label">Quiz Title *</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Chapter 1 Test" /></div>
        <div><label className="label">Course *</label>
          <select className="input" value={courseId} onChange={e=>setCourseId(e.target.value)}>
            <option value="">Select course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select></div>
      </div>
      <div><label className="label">Time Limit (minutes)</label><input className="input" type="number" value={timeLimit} min={5} max={180} onChange={e=>setTimeLimit(parseInt(e.target.value)||30)} style={{width:120}} /></div>
      <div style={{ borderTop:'1px solid #334155', paddingTop:'1rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
          <span style={{ fontWeight:600, color:'#f1f5f9', fontSize:'0.88rem' }}>Questions ({questions.length})</span>
          <button className="btn btn-secondary btn-sm" onClick={addQ}>+ Add Question</button>
        </div>
        {questions.map((q, qi) => (
          <div key={qi} style={{ background:'#0f172a', borderRadius:'10px', padding:'1rem', marginBottom:'0.75rem', border:'1px solid #334155' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
              <span style={{ fontSize:'0.8rem', color:'#38bdf8', fontWeight:600 }}>Q{qi+1}</span>
              {questions.length > 1 && <button onClick={()=>removeQ(qi)} style={{ background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:'0.8rem' }}>✕</button>}
            </div>
            <input className="input" value={q.question} onChange={e=>updateQ(qi,'question',e.target.value)} placeholder="Question text..." style={{marginBottom:'0.5rem'}} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem', marginBottom:'0.5rem' }}>
              {q.options.map((opt,oi) => (
                <div key={oi} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <input type="radio" name={`c-${qi}`} checked={q.correctAnswer===oi} onChange={()=>updateQ(qi,'correctAnswer',oi)} style={{accentColor:'#34d399',flexShrink:0}} />
                  <input className="input" value={opt} onChange={e=>updateO(qi,oi,e.target.value)} placeholder={`Option ${['A','B','C','D'][oi]}`}
                    style={{ fontSize:'0.82rem', borderColor: q.correctAnswer===oi?'#34d399':undefined }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize:'0.7rem', color:'#34d399', marginBottom:'4px' }}>✓ Correct: Option {['A','B','C','D'][q.correctAnswer]}</div>
            <input className="input" value={q.explanation} onChange={e=>updateQ(qi,'explanation',e.target.value)} placeholder="Explanation (optional)" style={{fontSize:'0.82rem'}} />
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={save} style={{width:'100%'}}>💾 Save Quiz ({questions.length} questions)</button>
    </div>
  );
}

export default function TeacherDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [stats,          setStats]          = useState(null);
  const [courses,        setCourses]        = useState([]);
  const [announcements,  setAnnouncements]  = useState([]);
  const [allStudents,    setAllStudents]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('dashboard');
  const [aiAvailable,    setAiAvailable]    = useState(false);

  const [showCourse,    setShowCourse]    = useState(false);
  const [showAnnounce,  setShowAnnounce]  = useState(false);
  const [showManualQuiz,setShowManualQuiz]= useState(false);
  const [showEnroll,    setShowEnroll]    = useState(null);
  const [showStudents,  setShowStudents]  = useState(null);

  const [courseForm,   setCourseForm]   = useState({ title:'', description:'', category:'programming', level:'beginner' });
  const [announceForm, setAnnounceForm] = useState({ title:'', content:'', priority:'medium', course:'', isGlobal:false });
  const [enrollSearch, setEnrollSearch] = useState('');
  const [enrollSId,    setEnrollSId]    = useState('');

  const [aiContent,     setAiContent]     = useState('');
  const [aiNumQ,        setAiNumQ]        = useState(5);
  const [generatedQ,    setGeneratedQ]    = useState(null);
  const [aiLoading,     setAiLoading]     = useState(false);
  const [saveQTitle,    setSaveQTitle]    = useState('');
  const [saveQCourse,   setSaveQCourse]   = useState('');
  const [summarizeText, setSummarizeText] = useState('');
  const [summary,       setSummary]       = useState('');
  const [summaryLoading,setSummaryLoading]= useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, coursesRes, anRes, studRes] = await Promise.all([
        analyticsAPI.teacher(),
        coursesAPI.getAll(),
        announcementsAPI.getAll(),
        usersAPI.getAll({ role:'student' }),
      ]);
      setStats(statsRes.data.stats);
      setCourses(coursesRes.data.courses?.filter(c => c.teacher?._id===user._id || c.teacher===user._id) || []);
      setAnnouncements(anRes.data.announcements || []);
      setAllStudents(studRes.data.users || []);
    } catch (err) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [user._id]);

  useEffect(() => {
    loadAll();
    aiAPI.status().then(r => setAiAvailable(r.data.aiAvailable)).catch(()=>{});
  }, [loadAll]);

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      await coursesAPI.create({ ...courseForm, isPublished:true });
      toast.success('Course created!');
      setShowCourse(false);
      setCourseForm({ title:'', description:'', category:'programming', level:'beginner' });
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const postAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await announcementsAPI.create({ ...announceForm, course: announceForm.course || undefined });
      toast.success('Posted!');
      setShowAnnounce(false);
      setAnnounceForm({ title:'', content:'', priority:'medium', course:'', isGlobal:false });
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await announcementsAPI.delete(id); toast.success('Deleted'); loadAll(); } catch { toast.error('Failed'); }
  };

  const generateQuiz = async () => {
    if (aiContent.trim().length < 20) return toast.error('Enter at least 20 characters');
    setAiLoading(true); setGeneratedQ(null);
    try {
      const res = await aiAPI.generateQuizText({ content:aiContent, numQuestions:aiNumQ });
      setGeneratedQ(res.data.questions);
      if (!res.data.aiAvailable) toast('Demo questions shown. Add Gemini API key for real AI.', { duration:5000 });
      else toast.success(`${res.data.questions.length} questions generated!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAiLoading(false); }
  };

  const saveAIQuiz = async () => {
    if (!saveQTitle.trim()) return toast.error('Enter quiz title');
    if (!saveQCourse)       return toast.error('Select a course');
    try {
      await quizzesAPI.create({ title:saveQTitle, course:saveQCourse, questions:generatedQ, isAIGenerated:true });
      toast.success('Quiz saved!');
      setGeneratedQ(null); setSaveQTitle(''); setSaveQCourse('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const saveManualQuiz = async (data) => {
    try { await quizzesAPI.create(data); toast.success('Quiz created!'); setShowManualQuiz(false); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const summarize = async () => {
    if (summarizeText.trim().length < 10) return toast.error('Enter some content');
    setSummaryLoading(true); setSummary('');
    try {
      const res = await aiAPI.summarize({ content:summarizeText });
      setSummary(res.data.summary);
      if (!res.data.aiAvailable) toast('Preview mode — add Gemini API key for AI summaries.', { duration:4000 });
    } catch (err) { toast.error('Failed'); }
    finally { setSummaryLoading(false); }
  };

  const startLive = async (courseId) => {
    try { const res = await liveAPI.start(courseId,{}); window.open(res.data.meetingLink,'_blank'); toast.success('Live started!'); }
    catch { toast.error('Failed'); }
  };

  const enrollStudent = async () => {
    if (!enrollSId) return toast.error('Select a student');
    try {
      const res = await usersAPI.enrollStudent(enrollSId, showEnroll._id);
      toast.success(res.data.message); setShowEnroll(null); setEnrollSId(''); setEnrollSearch(''); loadAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const unenroll = async (studentId, courseId, sName) => {
    if (!window.confirm(`Remove ${sName}?`)) return;
    try { await usersAPI.unenrollStudent(studentId, courseId); toast.success('Removed'); loadAll(); }
    catch { toast.error('Failed'); }
  };

  const getCourseStudents = (course) => allStudents.filter(s => s.enrolledCourses?.some(e => (e.course?._id||e.course)===course._id));

  const tabs = ['dashboard','courses','quizzes','assignments','announcements','students'];

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:'auto', padding:'2rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'10px' }}>
          <div>
            <h1 style={{ fontSize:'1.6rem', fontWeight:700, color:'#f1f5f9' }}>Teacher Dashboard</h1>
            <p style={{ color:'#64748b', fontSize:'0.85rem' }}>
              {user?.name} · ID: <span style={{ color:'#34d399', fontWeight:600 }}>{user?.employeeId || 'Not assigned'}</span>
            </p>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAnnounce(true)}>📢 Announce</button>
            <button className="btn btn-primary btn-sm"   onClick={() => setShowCourse(true)}>+ New Course</button>
          </div>
        </div>

        <div style={{ display:'flex', gap:'4px', background:'#0f172a', padding:'4px', borderRadius:'12px', marginBottom:'2rem', flexWrap:'wrap' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding:'0.5rem 1rem', borderRadius:'8px', border:'none', cursor:'pointer',
              background: activeTab===tab ? '#1e293b' : 'transparent',
              color: activeTab===tab ? '#f1f5f9' : '#64748b',
              fontWeight:500, fontSize:'0.82rem', textTransform:'capitalize', transition:'all 0.2s',
            }}>{tab}</button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <>
            {activeTab==='dashboard' && (
              <div>
                <div className="grid-4" style={{ marginBottom:'2rem' }}>
                  <StatCard icon="📚" label="My Courses"    value={stats?.totalCourses||0}     color="#38bdf8" />
                  <StatCard icon="👥" label="Students"      value={stats?.totalEnrolled||0}    color="#34d399" />
                  <StatCard icon="📝" label="Quizzes"       value={stats?.totalQuizzes||0}     color="#a78bfa" />
                  <StatCard icon="📋" label="Assignments"   value={stats?.totalAssignments||0} color="#fb923c" />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                  <div>
                    <SectionHeader title="My Courses" action={<button className="btn btn-primary btn-sm" onClick={()=>setShowCourse(true)}>+ Create</button>} />
                    {courses.length===0 ? <EmptyState icon="📚" title="No courses yet" action={<button className="btn btn-primary" onClick={()=>setShowCourse(true)}>Create First</button>} />
                    : courses.map(c => (
                      <div key={c._id} style={S.card}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ cursor:'pointer', flex:1 }} onClick={()=>navigate(`/courses/${c._id}`)}>
                            <div style={{ fontWeight:600, fontSize:'0.92rem', color:'#f1f5f9' }}>{c.title}</div>
                            <div style={{ fontSize:'0.75rem', color:'#64748b', marginTop:'2px' }}>
                              👥 {c.enrolledStudents?.length||0} · 📖 {c.lessons?.length||0} lessons · {c.category}
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:'5px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={()=>setShowStudents(c)}>Students</button>
                            <button className="btn btn-green btn-sm" onClick={()=>startLive(c._id)}>🎥 Live</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <SectionHeader title="AI Tools" subtitle={aiAvailable ? 'Gemini Connected' : 'Demo mode'} />
                    <div style={S.card}>
                      <div style={{ fontWeight:600, marginBottom:'0.75rem' }}>🤖 Quiz Generator</div>
                      <textarea className="input" placeholder="Paste content to generate MCQs..." rows={4} style={{resize:'vertical',marginBottom:'0.6rem'}} value={aiContent} onChange={e=>setAiContent(e.target.value)} />
                      <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'0.75rem' }}>
                        <select className="input" value={aiNumQ} onChange={e=>setAiNumQ(parseInt(e.target.value))} style={{width:100}}>
                          {[3,5,8,10].map(n=><option key={n} value={n}>{n} Qs</option>)}
                        </select>
                        <button className="btn btn-primary btn-sm" onClick={generateQuiz} disabled={aiLoading} style={{flex:1}}>
                          {aiLoading ? <span className="spinner" /> : '⚡ Generate'}
                        </button>
                      </div>
                      {generatedQ && (
                        <div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'6px' }}>
                            <input className="input" placeholder="Quiz title *" value={saveQTitle} onChange={e=>setSaveQTitle(e.target.value)} style={{fontSize:'0.82rem'}} />
                            <select className="input" value={saveQCourse} onChange={e=>setSaveQCourse(e.target.value)} style={{fontSize:'0.82rem'}}>
                              <option value="">Select course</option>
                              {courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}
                            </select>
                          </div>
                          <button className="btn btn-green btn-sm" onClick={saveAIQuiz} style={{width:'100%',marginBottom:'6px'}}>💾 Save Quiz</button>
                          <div style={{ maxHeight:160, overflowY:'auto', fontSize:'0.78rem' }}>
                            {generatedQ.map((q,i) => (
                              <div key={i} style={{ background:'#0f172a', borderRadius:'6px', padding:'0.5rem', marginBottom:'4px' }}>
                                <div style={{ color:'#f1f5f9', fontWeight:500 }}>{i+1}. {q.question}</div>
                                {q.options.map((o,j)=><div key={j} style={{color:j===q.correctAnswer?'#34d399':'#64748b',paddingLeft:'0.5rem'}}>{['A','B','C','D'][j]}. {o} {j===q.correctAnswer?'✓':''}</div>)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={S.card}>
                      <div style={{ fontWeight:600, marginBottom:'0.75rem' }}>📄 Content Summarizer</div>
                      <textarea className="input" placeholder="Paste lecture notes..." rows={3} style={{resize:'vertical',marginBottom:'0.6rem'}} value={summarizeText} onChange={e=>setSummarizeText(e.target.value)} />
                      <button className="btn btn-secondary btn-sm" onClick={summarize} disabled={summaryLoading}>
                        {summaryLoading ? <span className="spinner" /> : '✨ Summarize'}
                      </button>
                      {summary && (
                        <div style={{ marginTop:'0.75rem', background:'#0f172a', borderRadius:'8px', padding:'0.75rem', fontSize:'0.8rem', color:'#94a3b8', maxHeight:160, overflowY:'auto' }}>
                          <ReactMarkdown>{summary}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab==='courses' && (
              <div>
                <SectionHeader title="My Courses" action={<button className="btn btn-primary btn-sm" onClick={()=>setShowCourse(true)}>+ New Course</button>} />
                {courses.length===0 ? <EmptyState icon="📚" title="No courses" action={<button className="btn btn-primary" onClick={()=>setShowCourse(true)}>Create First</button>} />
                : courses.map(c => {
                  const stu = getCourseStudents(c);
                  return (
                    <div key={c._id} style={S.card}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px' }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:'1rem', color:'#f1f5f9', marginBottom:'6px' }}>{c.title}</div>
                          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                            <span style={S.badge('#38bdf8')}>{c.category}</span>
                            <span style={S.badge('#a78bfa')}>{c.level}</span>
                            <span style={S.badge('#34d399')}>👥 {stu.length} students</span>
                            <span style={S.badge('#fb923c')}>📖 {c.lessons?.length||0} lessons</span>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                          <button className="btn btn-secondary btn-sm" onClick={()=>navigate(`/courses/${c._id}`)}>Open</button>
                          <button className="btn btn-secondary btn-sm" onClick={()=>setShowStudents(c)}>👥 Students ({stu.length})</button>
                          <button className="btn btn-secondary btn-sm" onClick={()=>{ setShowEnroll(c); setEnrollSId(''); }}>+ Enroll</button>
                          <button className="btn btn-green btn-sm"     onClick={()=>startLive(c._id)}>🎥 Live</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab==='quizzes' && (
              <div>
                <SectionHeader title="Quiz Management" action={
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setShowManualQuiz(true)}>✏️ Manual Quiz</button>
                  </div>
                } />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                  <div style={S.card}>
                    <div style={{ fontWeight:600, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>
                      🤖 AI Quiz Generator
                      {!aiAvailable && <span style={{ fontSize:'0.68rem', color:'#fbbf24', background:'rgba(251,191,36,0.1)', padding:'1px 6px', borderRadius:'4px' }}>Demo Mode</span>}
                    </div>
                    <textarea className="input" placeholder="Paste topic content to auto-generate MCQs..." rows={5} style={{resize:'vertical',marginBottom:'0.75rem'}} value={aiContent} onChange={e=>setAiContent(e.target.value)} />
                    <div style={{ display:'flex', gap:'8px', marginBottom:'0.75rem' }}>
                      <select className="input" value={aiNumQ} onChange={e=>setAiNumQ(parseInt(e.target.value))} style={{width:130}}>
                        {[3,5,8,10].map(n=><option key={n} value={n}>{n} questions</option>)}
                      </select>
                      <button className="btn btn-primary btn-sm" onClick={generateQuiz} disabled={aiLoading} style={{flex:1}}>
                        {aiLoading ? <><span className="spinner" /> Generating...</> : '⚡ Generate Quiz'}
                      </button>
                    </div>
                    {generatedQ && (
                      <div>
                        <div style={{ fontSize:'0.78rem', color:'#34d399', marginBottom:'0.5rem' }}>✅ {generatedQ.length} questions ready</div>
                        <input className="input" placeholder="Quiz title *" value={saveQTitle} onChange={e=>setSaveQTitle(e.target.value)} style={{marginBottom:'6px'}} />
                        <select className="input" value={saveQCourse} onChange={e=>setSaveQCourse(e.target.value)} style={{marginBottom:'8px'}}>
                          <option value="">Select course *</option>
                          {courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                        <button className="btn btn-green" onClick={saveAIQuiz} style={{width:'100%'}}>💾 Save to Course</button>
                      </div>
                    )}
                  </div>
                  <div style={S.card}>
                    <div style={{ fontWeight:600, marginBottom:'1rem' }}>✏️ Manual Quiz Builder</div>
                    <p style={{ color:'#64748b', fontSize:'0.85rem', marginBottom:'1rem' }}>Build a custom quiz by writing questions and answer options manually. You control the exact content.</p>
                    <button className="btn btn-primary" onClick={()=>setShowManualQuiz(true)} style={{width:'100%'}}>Open Quiz Builder</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab==='assignments' && (
              <div>
                <SectionHeader title="Assignments" subtitle="Create assignments per course — students see them instantly" />
                {courses.length === 0 ? (
                  <EmptyState icon="📋" title="No courses yet" subtitle="Create a course first, then add assignments" />
                ) : courses.map(c => (
                  <div key={c._id} style={S.card}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                      <div style={{ fontWeight:600, color:'#f1f5f9' }}>{c.title}</div>
                      <button className="btn btn-primary btn-sm" onClick={()=>navigate(`/courses/${c._id}?tab=assignments`)}>Manage Assignments →</button>
                    </div>
                    <div style={{ fontSize:'0.78rem', color:'#64748b' }}>
                      Click "Manage Assignments" to create assignments for this course. Enrolled students will see them instantly.
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='announcements' && (
              <div>
                <SectionHeader title="Announcements" action={<button className="btn btn-primary btn-sm" onClick={()=>setShowAnnounce(true)}>+ New</button>} />
                {announcements.length===0 ? <EmptyState icon="📢" title="No announcements" action={<button className="btn btn-primary" onClick={()=>setShowAnnounce(true)}>Post First</button>} />
                : announcements.map(a => {
                  const pc={high:'#f87171',medium:'#fbbf24',low:'#34d399'};
                  return (
                    <div key={a._id} style={S.card}>
                      <div style={{ display:'flex', justifyContent:'space-between', gap:'10px' }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'4px', flexWrap:'wrap' }}>
                            <span style={{ fontWeight:600, color:'#f1f5f9', fontSize:'0.9rem' }}>{a.title}</span>
                            <span style={S.badge(pc[a.priority])}>{a.priority}</span>
                            {a.isGlobal && <span style={S.badge('#38bdf8')}>Global</span>}
                            {a.course && <span style={S.badge('#34d399')}>{a.course?.title||'Course'}</span>}
                          </div>
                          <p style={{ fontSize:'0.82rem', color:'#94a3b8', lineHeight:1.5 }}>{a.content}</p>
                          <div style={{ fontSize:'0.72rem', color:'#475569', marginTop:'4px' }}>{new Date(a.createdAt).toLocaleString()}</div>
                        </div>
                        {(a.author?._id===user._id||a.author===user._id) && (
                          <button className="btn btn-danger btn-sm" onClick={()=>deleteAnnouncement(a._id)}>Delete</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab==='students' && (
              <div>
                <SectionHeader title="My Students" subtitle="Students enrolled in your courses" />
                {courses.length===0 ? <EmptyState icon="👥" title="No courses yet" />
                : courses.map(c => {
                  const enrolled = getCourseStudents(c);
                  return (
                    <div key={c._id} style={{ ...S.card, marginBottom:'1.25rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                        <div>
                          <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.95rem' }}>{c.title}</div>
                          <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{enrolled.length} student(s)</div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={()=>{ setShowEnroll(c); setEnrollSId(''); }}>+ Enroll Student</button>
                      </div>
                      {enrolled.length===0 ? <p style={{ color:'#475569', fontSize:'0.83rem' }}>No students yet.</p>
                      : enrolled.map(s => {
                        const e = s.enrolledCourses?.find(e2=>(e2.course?._id||e2.course)===c._id);
                        return (
                          <div key={s._id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'0.6rem 0.75rem', background:'#0f172a', borderRadius:'8px', marginBottom:'5px' }}>
                            <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(56,189,248,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#38bdf8', fontWeight:700, fontSize:'0.82rem', flexShrink:0 }}>
                              {s.name?.[0]?.toUpperCase()}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontWeight:500, fontSize:'0.85rem', color:'#f1f5f9' }}>{s.name}</div>
                              <div style={{ fontSize:'0.72rem', color:'#64748b' }}>{s.email} · ID: {s.employeeId||'—'}</div>
                            </div>
                            <div style={{ textAlign:'right', marginRight:'8px' }}>
                              <div style={{ fontSize:'0.75rem', color:'#34d399' }}>{e?.progress||0}%</div>
                              <div style={{ fontSize:'0.68rem', color:'#64748b' }}>🔥 {e?.streak||0}d</div>
                            </div>
                            <button onClick={()=>unenroll(s._id,c._id,s.name)} className="btn btn-danger btn-sm">Remove</button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <Modal open={showCourse} onClose={()=>setShowCourse(false)} title="Create New Course">
        <form onSubmit={createCourse} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div><label className="label">Title *</label><input className="input" value={courseForm.title} onChange={e=>setCourseForm(p=>({...p,title:e.target.value}))} required /></div>
          <div><label className="label">Description *</label><textarea className="input" rows={3} value={courseForm.description} onChange={e=>setCourseForm(p=>({...p,description:e.target.value}))} required /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div><label className="label">Category</label>
              <select className="input" value={courseForm.category} onChange={e=>setCourseForm(p=>({...p,category:e.target.value}))}>
                {['programming','mathematics','science','arts','language','other'].map(c=><option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label className="label">Level</label>
              <select className="input" value={courseForm.level} onChange={e=>setCourseForm(p=>({...p,level:e.target.value}))}>
                {['beginner','intermediate','advanced'].map(l=><option key={l} value={l}>{l}</option>)}
              </select></div>
          </div>
          <button className="btn btn-primary" type="submit" style={{width:'100%'}}>Create Course</button>
        </form>
      </Modal>

      <Modal open={showAnnounce} onClose={()=>setShowAnnounce(false)} title="Post Announcement">
        <form onSubmit={postAnnouncement} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div><label className="label">Title *</label><input className="input" value={announceForm.title} onChange={e=>setAnnounceForm(p=>({...p,title:e.target.value}))} required /></div>
          <div><label className="label">Content *</label><textarea className="input" rows={4} value={announceForm.content} onChange={e=>setAnnounceForm(p=>({...p,content:e.target.value}))} required /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div><label className="label">Priority</label>
              <select className="input" value={announceForm.priority} onChange={e=>setAnnounceForm(p=>({...p,priority:e.target.value}))}>
                {['low','medium','high'].map(p=><option key={p} value={p}>{p}</option>)}
              </select></div>
            <div><label className="label">Course (optional)</label>
              <select className="input" value={announceForm.course} onChange={e=>setAnnounceForm(p=>({...p,course:e.target.value}))}>
                <option value="">All students</option>
                {courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}
              </select></div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <input type="checkbox" id="tg" checked={announceForm.isGlobal} onChange={e=>setAnnounceForm(p=>({...p,isGlobal:e.target.checked}))} />
            <label htmlFor="tg" style={{ fontSize:'0.85rem', color:'#94a3b8' }}>Broadcast to all platform users</label>
          </div>
          <button className="btn btn-primary" type="submit" style={{width:'100%'}}>📢 Post</button>
        </form>
      </Modal>

      <Modal open={showManualQuiz} onClose={()=>setShowManualQuiz(false)} title="Manual Quiz Builder" width={640}>
        <ManualQuizBuilder courses={courses} onSave={saveManualQuiz} />
      </Modal>

      <Modal open={!!showEnroll} onClose={()=>setShowEnroll(null)} title={`Enroll Student in "${showEnroll?.title}"`}>
        {showEnroll && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <input className="input" placeholder="Search student..." value={enrollSearch} onChange={e=>setEnrollSearch(e.target.value)} />
            <select className="input" size={6} value={enrollSId} onChange={e=>setEnrollSId(e.target.value)} style={{height:'auto'}}>
              <option value="">— Select a student —</option>
              {allStudents
                .filter(s => !s.enrolledCourses?.some(e=>(e.course?._id||e.course)===showEnroll._id) && (!enrollSearch || s.name.toLowerCase().includes(enrollSearch.toLowerCase()) || s.email.toLowerCase().includes(enrollSearch.toLowerCase())))
                .map(s => <option key={s._id} value={s._id}>{s.name} ({s.email}) · {s.employeeId||'No ID'}</option>)}
            </select>
            <button className="btn btn-primary" onClick={enrollStudent} disabled={!enrollSId} style={{width:'100%'}}>Enroll Selected Student</button>
          </div>
        )}
      </Modal>

      <Modal open={!!showStudents} onClose={()=>setShowStudents(null)} title={`Students in "${showStudents?.title}"`} width={520}>
        {showStudents && (() => {
          const stu = getCourseStudents(showStudents);
          return (
            <div>
              <div style={{ fontSize:'0.83rem', color:'#64748b', marginBottom:'1rem' }}>{stu.length} student(s) enrolled</div>
              {stu.length===0 ? <EmptyState icon="👥" title="No students enrolled" />
              : stu.map(s => {
                const e = s.enrolledCourses?.find(e2=>(e2.course?._id||e2.course)===showStudents._id);
                return (
                  <div key={s._id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'0.65rem', background:'#0f172a', borderRadius:'8px', marginBottom:'6px' }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(56,189,248,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#38bdf8', fontWeight:700, fontSize:'0.85rem', flexShrink:0 }}>
                      {s.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:500, fontSize:'0.88rem', color:'#f1f5f9' }}>{s.name}</div>
                      <div style={{ fontSize:'0.72rem', color:'#64748b' }}>{s.email} · ID: {s.employeeId||'—'}</div>
                    </div>
                    <div style={{ textAlign:'right', marginRight:'8px' }}>
                      <div style={{ fontSize:'0.78rem', color:'#34d399', fontWeight:600 }}>{e?.progress||0}%</div>
                      <div style={{ fontSize:'0.7rem', color:'#64748b' }}>🔥 {e?.streak||0} days</div>
                    </div>
                    <button onClick={()=>unenroll(s._id,showStudents._id,s.name)} className="btn btn-danger btn-sm">Remove</button>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </Modal>

      <AIChatbot />
    </div>
  );
}